# 29 — Holat va muammolarni topish

[Mundarija](README.md)

## Tushuncha

### `stub_status`

NG (`ngx_http_stub_status_module`): asosiy holat ma'lumoti sahifasi. Rasmiy paketda bor (`--with-http_stub_status_module`).

```nginx
location = /basic_status {
    stub_status;
}
```

| Maydon | Nima (NG) |
| --- | --- |
| `Active connections` | Hozirgi faol mijoz ulanishlari (`Waiting` bilan) |
| `accepts` | Jami qabul qilingan ulanishlar |
| `handled` | Jami ishlov berilgan; odatda `accepts` ga teng, resurs chegarasiga (masalan, `worker_connections`) yetilganda kam |
| `requests` | Jami so'rovlar |
| `Reading` | So'rov header'i o'qilayotgan ulanishlar |
| `Writing` | Javob yozilayotgan ulanishlar |
| `Waiting` | So'rov kutayotgan bo'sh (keep-alive) ulanishlar |

### Debug jurnal

NG (A debugging log): nginx `--with-debug` bilan yig'ilgan bo'lishi kerak. Rasmiy Linux paketlarida tayyor **`nginx-debug`** binar fayli bor (1.9.8 dan): `nginx` ni to'xtatib, `nginx-debug` ni ishga tushirish, keyin daraja `error_log … debug;`.

- Faqat tanlangan mijozlar uchun: `events { debug_connection 192.168.1.1; }`.
- Xotiradagi aylanma bufer: `error_log memory:32m debug;` — yuqori yuklamada ham unumdorlikka sezilarli ta'sir qilmaydi; gdb/lldb bilan olinadi.
- NG ogohlantirishi: jurnalni pastroq darajada `debug` siz qayta belgilash debug jurnalni o'chiradi.

### To'liq konfiguratsiya: `nginx -T`

Barcha `include` fayllar bilan birga (3-bob) — "bu direktiva qayerdan keldi" savoliga javob.

### Odatiy kodlar va sabablari

| Kod | Odatiy sabab | Jurnalda | Bob |
| --- | --- | --- | --- |
| **413** | So'rov tanasi `client_max_body_size` dan katta (standart **1 MB**) | `client intended to send too large body` | Shu bob |
| **502** | Backend ishlamaydi, ruxsat yo'q, javobsiz uzildi, header katta | `connect() failed`, `Permission denied`, `prematurely closed`, `too big header` | 11, 12, 14 |
| **504** | Backend vaqtida javob bermadi | `upstream timed out` | 14 |
| **403** | `deny`, index fayl yo'q | `access forbidden by rule`, `directory index … is forbidden` | 5, 27 |
| **404** | Fayl yo'q, `root`/`alias` xato | `open() "…" failed` | 5 |

NG: 413 ni brauzerlar to'g'ri ko'rsata olmaydi. `client_max_body_size 0` — tekshiruvni o'chiradi.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). POST tanasi hajmini qaytaradigan backend:

```python
# Sinov backend'i: POST tanasi hajmini qaytaradi
from http.server import BaseHTTPRequestHandler, HTTPServer

class Y(BaseHTTPRequestHandler):
    def do_POST(self):
        n = len(self.rfile.read(int(self.headers["Content-Length"])))
        d = f"backend {n} bayt oldi\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(d)))
        self.end_headers()
        self.wfile.write(d)
    def log_message(self, *a):
        pass

HTTPServer(("127.0.0.1", 9050), Y).serve_forever()
```

```nginx
server {
    listen 127.0.0.1:8118;
    root /var/www/holat;

    location = /holat {
        stub_status;
        allow 127.0.0.1;
        deny  all;
    }
    location /yukla/ {
        proxy_pass http://127.0.0.1:9050;
    }
    location /katta-yukla/ {
        client_max_body_size 5m;
        proxy_pass http://127.0.0.1:9050;
    }
    location /fayl/ {
        limit_rate 200k;
    }
}
```

```text vps
$ mkdir -p /opt/yukla /var/www/holat/fayl && mv /root/yukla.py /opt/yukla/; head -c 1048576 /dev/zero > /var/www/holat/fayl/f.bin; (nohup python3 /opt/yukla/yukla.py > /dev/null 2>&1 &); sleep 1; cp /root/holat.conf /etc/nginx/conf.d/; rm /root/holat.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo tayyor
tayyor
```

### `stub_status`

```text vps
$ curl -s http://127.0.0.1:8118/holat; curl -s -o /dev/null -w 'boshqa IP dan: %{http_code}\n' --interface 127.0.0.2 http://127.0.0.1:8118/holat
Active connections: 1 
server accepts handled requests
 239 239 238 
Reading: 0 Writing: 1 Waiting: 0 
boshqa IP dan: 403
```

Faqat `127.0.0.1` uchun; boshqa manzildan — 403. Server ishga tushganidan beri 239 ulanish va 238 so'rov.

Uchta sekin yuklab olish vaqtida:

```text vps
$ for i in 1 2 3; do (curl -s -o /dev/null http://127.0.0.1:8118/fayl/f.bin &); done; sleep 1; curl -s http://127.0.0.1:8118/holat; sleep 5
Active connections: 4 
server accepts handled requests
 244 244 243 
Reading: 0 Writing: 4 Waiting: 0 
```

`Active connections: 4`, `Writing: 4` — uch yuklab olish va `stub_status` so'rovining o'zi.

### 413

```text vps
$ head -c 2097152 /dev/zero > /tmp/2mb.bin; curl -s -o /tmp/j -w 'yukla (2 MB): %{http_code} ' --data-binary @/tmp/2mb.bin http://127.0.0.1:8118/yukla/; grep -o '<title>[^<]*' /tmp/j; tail -n 1 /var/log/nginx/error.log | grep -oE 'client intended to send too large body: [0-9]+ bytes'; curl -s -w '' --data-binary @/tmp/2mb.bin http://127.0.0.1:8118/katta-yukla/; rm /tmp/2mb.bin
yukla (2 MB): 413 <title>413 Request Entity Too Large
client intended to send too large body: 2097152 bytes
backend 2097152 bayt oldi
```

2 MB POST: standart 1 MB chegara — **413**, jurnalda aniq hajm; `client_max_body_size 5m` li location'da — backend to'liq oldi.

### `nginx -T` bilan izlash

```text vps
$ nginx -T 2>/dev/null | grep -nE '^# configuration file|listen +127\.0\.0\.1:8118' | grep -B1 '8118' | head -2
182:# configuration file /etc/nginx/conf.d/holat.conf:
184:    listen 127.0.0.1:8118;
```

8118-portni tinglaydigan server — `conf.d/holat.conf` da.

### Debug jurnal faqat bitta mijoz uchun

```text vps
$ cp /etc/nginx/nginx.conf /root/nginx.conf.zaxira; sed -i 's/^events {/events {\n    debug_connection 127.0.0.2;/' /etc/nginx/nginx.conf; grep -A2 '^events' /etc/nginx/nginx.conf; systemctl stop nginx; systemctl start nginx-debug; systemctl is-active nginx-debug; nginx-debug -V 2>&1 | tr ' ' '\n' | grep -x -- '--with-debug'
events {
    debug_connection 127.0.0.2;
    worker_connections  1024;
active
--with-debug
```

`nginx.conf` ning `events` blokiga `debug_connection 127.0.0.2;` qo'shildi; `nginx` to'xtatildi, `nginx-debug` servisi ishga tushdi (`--with-debug` bilan yig'ilgan).

```text vps
$ curl -s -o /dev/null http://127.0.0.1:8118/fayl/yoq; curl -s -o /dev/null --interface 127.0.0.2 http://127.0.0.1:8118/fayl/yoq; grep -c '\[debug\]' /var/log/nginx/error.log | sed 's/^/debug qatorlari: /'; grep '\[debug\]' /var/log/nginx/error.log | grep -E 'test location|using configuration|http finalize request' | head -5 | sed -E 's/^[0-9/: ]+\[debug\] [0-9#]+: \*[0-9]+ /[debug] /'
debug qatorlari: 88
[debug] test location: "/katta-yukla/"
[debug] test location: "/holat"
[debug] test location: "/fayl/"
[debug] using configuration "/fayl/"
[debug] http finalize request: 404, "/fayl/yoq?" a:1, c:1
```

Ikki bir xil so'rov: `127.0.0.1` dan va `127.0.0.2` dan. Debug qatorlari faqat ikkinchisi uchun yozildi (88 qator). Ulardan: nginx location'larni qanday sinab ko'rgani (`test location`), qaysi biri tanlangani (`using configuration "/fayl/"`) va so'rov 404 bilan tugagani — 6-bobdagi tanlash algoritmini ichkaridan ko'rish.

```text vps
$ systemctl stop nginx-debug; cp /root/nginx.conf.zaxira /etc/nginx/nginx.conf; rm /root/nginx.conf.zaxira; rm /etc/nginx/conf.d/holat.conf; pkill -f /opt/yukla/yukla.py; rm -rf /opt/yukla /var/www/holat; nginx -t -q && systemctl start nginx; systemctl is-active nginx; grep -c debug_connection /etc/nginx/nginx.conf
active
0
```

`nginx.conf` qaytarildi, oddiy `nginx` qayta ishga tushdi.

## Muammo topish tartibi

1. **Kod va vaqt**: `curl -s -o /dev/null -w '%{http_code} %{time_total}'`.
2. **Xato jurnali**: `tail /var/log/nginx/error.log` — sabab odatda shu yerda (502/504/403/404/413).
3. **Qaysi konfiguratsiya**: `nginx -T | grep …`.
4. **Qaysi location**: debug jurnal (`debug_connection` bilan faqat o'zingiz uchun).
5. **Umumiy holat**: `stub_status` — ulanishlar, `handled < accepts` — resurs chegarasi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `stub_status` ni hammaga ochiq | Server holati oshkor | `allow`/`deny` (sinovda 403) |
| Fayl yuklashda 413 ni ilova xatosi deb o'ylash | nginx standart 1 MB (NG) | `client_max_body_size` ni kerakli location'da |
| Production'da hamma uchun `debug` | Juda ko'p yozuv | `debug_connection` yoki xotira buferi |
| `nginx` (debug'siz) bilan `error_log … debug` | Debug qatorlari chiqmaydi | `nginx-debug` binari |
| Pastki darajada `error_log` ni debug'siz qayta yozish | Debug jurnal o'chadi (NG) | Pastda ham `debug` |
| Faqat bitta konfiguratsiya fayliga qarash | `include` lar ta'sir qiladi | `nginx -T` |

## Amaliyot

1. `stub_status` dagi `Waiting` nima?
2. `handled` `accepts` dan kam bo'lsa nima bo'lgan?
3. Rasmiy paketda debug jurnalni qanday yoqasiz?
4. Debug jurnalni faqat o'zingizning IP'ingiz uchun qanday yoqasiz?
5. 413 ning sababi va yechimi nima?
6. Debug jurnal sinovda nimani ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. So'rov kutayotgan bo'sh (keep-alive) ulanishlar.
2. Resurs chegarasiga (masalan, `worker_connections`) yetilgan.
3. `nginx` ni to'xtatib, `nginx-debug` ni ishga tushirish va `error_log … debug;`.
4. `events { debug_connection <IP>; }`.
5. Tana `client_max_body_size` (standart 1 MB) dan katta; kerakli location'da chegarani oshirish.
6. Location'lar qanday sinalgani, qaysi biri tanlangani va so'rov qaysi kod bilan tugagani.

</details>

## Rasmiy hujjat

- [NG: ngx_http_stub_status_module](https://nginx.org/en/docs/http/ngx_http_stub_status_module.html)
- [NG: A debugging log](https://nginx.org/en/docs/debugging_log.html)
- [NA: Debugging NGINX](https://docs.nginx.com/nginx/admin-guide/monitoring/debugging/)
- [NG: client_max_body_size](https://nginx.org/en/docs/http/ngx_http_core_module.html#client_max_body_size) · [Command-line parameters](https://nginx.org/en/docs/switches.html)
