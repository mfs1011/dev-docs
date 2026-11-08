# 14 — Timeout va bufer

[Mundarija](README.md)

## Tushuncha

### Timeout'lar

NG (`ngx_http_proxy_module`):

| Direktiva | Standart | Nima |
| --- | --- | --- |
| `proxy_connect_timeout` | `60s` | Backend bilan **ulanish o'rnatish** vaqti; odatda 75 s dan oshmaydi |
| `proxy_send_timeout` | `60s` | So'rovni backend'ga yuborish — **ikki ketma-ket yozish** orasidagi vaqt (butun so'rov uchun emas) |
| `proxy_read_timeout` | `60s` | Backend javobini o'qish — **ikki ketma-ket o'qish** orasidagi vaqt (butun javob uchun emas); shu vaqt ichida hech narsa kelmasa — ulanish yopiladi |

### 502 va 504

| Kod | Ma'nosi | nginx'da odatiy sabab |
| --- | --- | --- |
| **502** Bad Gateway | Proksi backend'dan **yaroqsiz** javob oldi | Backend ishlamaydi (`Connection refused`, 11-bob), soketga ruxsat yo'q (12-bob), javobsiz uzildi, header juda katta |
| **504** Gateway Timeout | Proksi backend javobini **o'z vaqtida** ololmadi | `proxy_connect_timeout` yoki `proxy_read_timeout` tugadi |

Aniq sabab — xato jurnalida (NG: `error_log`, 10-bob).

### Buferlash

NA, NG: standart holatda (`proxy_buffering on`) nginx backend javobini **imkon qadar tez** qabul qilib, `proxy_buffer_size` va `proxy_buffers` buferlariga yozadi; javob xotiraga sig'masa — bir qismi diskdagi vaqtinchalik faylga (`proxy_max_temp_file_size`). Maqsad (NA): **sekin mijozlar** backend vaqtini band qilmasin — backend javobni tezda nginx'ga topshirib, bo'shaydi.

`proxy_buffering off` — javob mijozga **sinxron**, kelishi bilan uzatiladi; nginx butun javobni o'qishga urinmaydi; bir martada `proxy_buffer_size` qadar oladi (NG). Backend javobida `X-Accel-Buffering: yes|no` header'i bilan ham boshqariladi (`proxy_ignore_headers` bilan o'chiriladi).

| Direktiva | Standart | Nima |
| --- | --- | --- |
| `proxy_buffer_size` | `4k`/`8k` (xotira sahifasi) | Javobning **birinchi qismi** (odatda header'lar); header'lar sig'masa — javob yaroqsiz |
| `proxy_buffers` | `8 4k`/`8 8k` | Bitta ulanish uchun buferlar soni va hajmi |

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Backend — sekin javob, oqim, katta header va javobsiz uzilishni taqlid qiluvchi Python dasturi:

```python
# Sinov backend'i: sekin javob, oqim, katta header, uzilish
import socket, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

class B(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def javob(self, matn, **h):
        d = matn.encode()
        self.send_response(200)
        for k, v in h.items():
            self.send_header(k.replace("_", "-"), v)
        self.send_header("Content-Length", str(len(d)))
        self.end_headers()
        self.wfile.write(d)
    def do_GET(self):
        u = urlparse(self.path)
        if u.path == "/sekin":
            s = float(parse_qs(u.query).get("s", ["1"])[0])
            time.sleep(s)
            self.javob(f"{s} s kutib javob berdim\n")
        elif u.path in ("/oqim", "/oqim-xab"):
            self.send_response(200)
            if u.path == "/oqim-xab":
                self.send_header("X-Accel-Buffering", "no")
            self.send_header("Transfer-Encoding", "chunked")
            self.end_headers()
            for i in range(1, 4):
                d = f"{i}-qism\n".encode()
                self.wfile.write(f"{len(d):x}\r\n".encode() + d + b"\r\n")
                self.wfile.flush()
                time.sleep(1)
            self.wfile.write(b"0\r\n\r\n")
        elif u.path == "/katta":
            d = b"x" * 48 * 1024 * 1024
            t0 = time.time()
            self.send_response(200)
            self.send_header("Content-Length", str(len(d)))
            self.end_headers()
            self.wfile.write(d)
            print(f"backend: 48 MB ni {time.time() - t0:.2f} s da yozib bo'ldi", flush=True)
        elif u.path == "/katta-header":
            self.javob("ok\n", X_Katta="a" * 10000)
        elif u.path == "/uzil":
            self.connection.shutdown(socket.SHUT_RDWR)  # javobsiz uzish
            self.close_connection = True
        else:
            self.javob("salom\n")
    def log_message(self, *a):
        pass

ThreadingHTTPServer(("127.0.0.1", 9020), B).serve_forever()
```

```nginx
server {
    listen 127.0.0.1:8108;

    location / {
        proxy_pass http://127.0.0.1:9020;
        proxy_read_timeout 3s;
    }
    location /bufersiz/ {
        proxy_pass http://127.0.0.1:9020/;
        proxy_buffering off;
    }
    location /ulanish/ {
        proxy_pass http://10.255.255.1:80/;
        proxy_connect_timeout 2s;
    }
}
```

`10.255.255.1` — javob bermaydigan (marshrutlanmaydigan) manzil: ulanish o'rnatilmaydi.

```text vps
$ mkdir -p /opt/b14 && mv /root/backend.py /opt/b14/; (nohup python3 /opt/b14/backend.py > /tmp/b14.log 2>&1 &); sleep 1; cp /root/timeout.conf /etc/nginx/conf.d/timeout.conf; rm /root/timeout.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
$ t() { curl -s -o /tmp/j -w "HTTP %{http_code}, birinchi bayt %{time_starttransfer}s, jami %{time_total}s" "http://127.0.0.1:8108$1"; echo " | $(head -c 60 /tmp/j | tr '\n' ' ' | grep -v '<html>')"; }; x() { tail -n 1 /var/log/nginx/error.log | grep -oE '(upstream timed out|upstream prematurely|upstream sent too big|connect\(\) failed)[^,]*'; }
```

`t URI` — kod va vaqtlar; `x` — xato jurnalining oxirgi sababi.

### 504: vaqt tugadi

```text vps
$ t '/sekin?s=1'; t '/sekin?s=5'; x
HTTP 200, birinchi bayt 1.002775s, jami 1.002862s | 1.0 s kutib javob berdim 
HTTP 504, birinchi bayt 3.003836s, jami 3.003934s | 
upstream timed out (110: Connection timed out) while reading response header from upstream
$ t /ulanish/; x
HTTP 504, birinchi bayt 2.002201s, jami 2.002292s | 
upstream timed out (110: Connection timed out) while connecting to upstream
```

| So'rov | Natija | Jurnal |
| --- | --- | --- |
| `/sekin?s=1` | 200, 1 s | — |
| `/sekin?s=5` | **504**, 3 s da | `upstream timed out … while reading response header` — `proxy_read_timeout 3s` |
| `/ulanish/` | **504**, 2 s da | `upstream timed out … while connecting to upstream` — `proxy_connect_timeout 2s` |

### 502: yaroqsiz javob

```text vps
$ t /uzil; x
HTTP 502, birinchi bayt 0.001696s, jami 0.001779s | 
upstream prematurely closed connection while reading response header from upstream
$ t /katta-header; x
HTTP 502, birinchi bayt 0.001813s, jami 0.001881s | 
upstream sent too big header while reading response header from upstream
```

| So'rov | Natija | Jurnal |
| --- | --- | --- |
| `/uzil` | **502** darhol | `upstream prematurely closed connection` — backend javobsiz uzdi |
| `/katta-header` | **502** darhol | `upstream sent too big header` — 10 KB header `proxy_buffer_size` ga sig'madi |

### Buferlash: tez mijoz

Backend 3 qismni 1 soniya oraliq bilan yuboradi; mijoz har qism kelgan vaqtni yozadi:

```text vps
$ q() { s=$(date +%s%3N); curl -sN "http://127.0.0.1:8108$1" | while IFS= read -r l; do echo "  $(( $(date +%s%3N) - s )) ms: $l"; done; }; echo /oqim; q /oqim; echo /bufersiz/oqim; q /bufersiz/oqim; echo /oqim-xab; q /oqim-xab
/oqim
  19 ms: 1-qism
  1021 ms: 2-qism
  2022 ms: 3-qism
/bufersiz/oqim
  20 ms: 1-qism
  1023 ms: 2-qism
  2023 ms: 3-qism
/oqim-xab
  20 ms: 1-qism
  1022 ms: 2-qism
  2023 ms: 3-qism
```

Kuzatildi: tez mijozda (loopback) uchala holatda ham qismlar backend yuborishi bilan keldi — `proxy_buffering on` mijozni kutdirmadi.

### Buferlash: sekin mijoz

Backend 48 MB javob yozadi va qancha vaqtda yozib bo'lganini aytadi; mijoz 16 MB/s bilan o'qiydi:

```text vps
$ for y in /katta /bufersiz/katta; do curl -s -o /dev/null --limit-rate 16M -w "mijoz $y: %{time_total} s\n" http://127.0.0.1:8108$y; tail -n 1 /tmp/b14.log; done
mijoz /katta: 2.567956 s
backend: 48 MB ni 0.09 s da yozib bo'ldi
mijoz /bufersiz/katta: 2.572194 s
backend: 48 MB ni 2.51 s da yozib bo'ldi
```

| | Mijoz | Backend band |
| --- | --- | --- |
| `proxy_buffering on` | 2,57 s | **0,09 s** — nginx javobni tez olib, o'zi sekin mijozga berdi |
| `proxy_buffering off` | 2,57 s | **2,51 s** — backend mijoz tezligida kutib turdi |

Mijoz uchun farq yo'q, lekin buferlash bilan backend (ilova jarayoni) 28 marta tezroq bo'shadi — NA aytgan maqsad.

```text vps
$ rm /tmp/b14.log; rm /etc/nginx/conf.d/timeout.conf; pkill -f /opt/b14/backend.py; rm -rf /opt/b14; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vazifa | Sozlama |
| --- | --- |
| Uzoq hisobot (masalan, 2 daqiqa) | Faqat shu location'da `proxy_read_timeout 180s;` |
| Server-Sent Events, oqimli javob | `proxy_buffering off;` yoki backend'dan `X-Accel-Buffering: no` |
| Katta cookie/header'lar | `proxy_buffer_size 16k;` (va `proxy_buffers`) |
| Backend ishlamasa tez xabar | Kichik `proxy_connect_timeout` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| 502 va 504 ni bir xil deb o'ylash | 502 — yaroqsiz javob, 504 — vaqt tugadi | Jurnaldagi sababga qarash |
| `proxy_read_timeout` ni butun javob vaqti deb o'ylash | Faqat ikki o'qish orasidagi vaqt (NG) | Uzoq jim kutish bo'lsa oshirish |
| Hamma joyda katta timeout | Osilgan backend ulanishlarni uzoq ushlaydi | Faqat kerakli location'da |
| Buferlashni "tezlik uchun" o'chirish | Sekin mijozlar backend'ni band qiladi (sinovda 2,51 s) | Faqat oqimli javoblar uchun `off` |
| Katta header'li javob uchun `proxy_buffer_size` ni oshirmaslik | 502 `too big header` (sinovda) | `proxy_buffer_size` |

## Amaliyot

1. `proxy_connect_timeout` va `proxy_read_timeout` farqi nima?
2. `proxy_read_timeout 60s` bo'lsa, 2 daqiqa davomida har 10 soniyada bir qism yuboradigan javob uziladimi?
3. 502 va 504 qachon chiqadi? Sinovdagi misollar?
4. `proxy_buffering` ning asosiy foydasi nima? Sinovda nima ko'rindi?
5. Qachon `proxy_buffering off` kerak?
6. `upstream sent too big header` qanday tuzatiladi?

<details>
<summary>Javoblar</summary>

1. Birinchisi — ulanish o'rnatish vaqti; ikkinchisi — javobni o'qishda ikki ketma-ket o'qish orasidagi vaqt.
2. Yo'q — har o'qish orasidagi vaqt 10 s, 60 s dan kam.
3. 502 — yaroqsiz javob (uzilish, katta header, ulanib bo'lmaslik); 504 — vaqt tugadi (`/sekin?s=5`, `/ulanish/`).
4. Backend javobni tez topshirib, bo'shaydi; sekin mijozda backend 0,09 s (bufersiz 2,51 s) band bo'ldi.
5. Oqimli javoblar (SSE, uzun polling), javobni kelishi bilan uzatish kerak bo'lsa.
6. `proxy_buffer_size` ni oshirish.

</details>

## Rasmiy hujjat

- [NG: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — `proxy_connect_timeout`, `proxy_read_timeout`, `proxy_send_timeout`, `proxy_buffering`, `proxy_buffer_size`, `proxy_buffers`
- [NA: NGINX Reverse Proxy — Configuring Buffers](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
