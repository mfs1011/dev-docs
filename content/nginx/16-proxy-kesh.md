# 16 — Proxy kesh

[Mundarija](README.md)

## Tushuncha

NA (NGINX Content Caching): kesh yoqilganda nginx backend javoblarini **diskdagi keshga** saqlaydi va bir xil kontent uchun har safar backend'ga bormasdan, keshdan javob beradi.

### Yoqish

```nginx
http {
    proxy_cache_path /data/nginx/cache keys_zone=mycache:10m;
    server {
        proxy_cache mycache;
        location / {
            proxy_pass http://localhost:8000;
        }
    }
}
```

`proxy_cache_path` — faqat `http` kontekstida (NA). Parametrlari (NG):

| Parametr | Nima |
| --- | --- |
| yo'l | Kesh fayllari papkasi |
| `keys_zone=nom:hajm` | Kalitlar va metama'lumot uchun **umumiy xotira** zonasi; 1 MB ~8 ming kalit. Kesh hajmini **cheklamaydi** (NA) |
| `levels=1:2` | Papkalar ierarxiyasi |
| `max_size=` | Diskdagi kesh hajmi chegarasi — **cache manager** jarayoni eskilarini o'chiradi |
| `inactive=` | Shuncha vaqt so'ralmagan ma'lumot yangiligidan qat'i nazar o'chiriladi; standart 10 daqiqa |

Keshda ikki qo'shimcha jarayon ishlaydi (NA): **cache manager** — vaqti-vaqti bilan hajmni nazorat qiladi; **cache loader** — ishga tushgandan keyin bir marta, avvalgi kesh metama'lumotini xotiraga yuklaydi.

### Nima keshlanadi

NA, NG:

- Standart: `GET` va `HEAD` javoblari, birinchi olinganda. Boshqa metodlar — `proxy_cache_methods`.
- **Kalit**: `proxy_cache_key`, standart `$scheme$proxy_host$request_uri`.
- `proxy_cache_min_uses n` — shuncha so'rovdan keyin keshlash.
- Muddat: `proxy_cache_valid 200 302 10m; proxy_cache_valid 404 1m;`; faqat vaqt berilsa (`proxy_cache_valid 5m;`) — faqat 200, 301, 302. `any` — hamma kodlar.
- Backend javobidagi header'lar **ustun** (NG): `X-Accel-Expires` (soniya; `0` — keshlanmaydi), u bo'lmasa — `Expires` yoki `Cache-Control`.
- **`Set-Cookie`** li javob keshlanmaydi; `Vary: *` — keshlanmaydi; boshqa `Vary` — tegishli so'rov header'lari hisobga olinadi.
- Standart holatda javoblar keshda **cheksiz** turadi — faqat hajm oshganda eng uzoq so'ralmaganlari o'chiriladi (NA).

`proxy_cache_bypass shart…` — shart bo'sh/0 bo'lmasa keshdan **bermaydi** (backend'ga boradi); `proxy_no_cache shart…` — javobni umuman **saqlamaydi**.

### Holat: `$upstream_cache_status`

NG: `MISS`, `BYPASS`, `EXPIRED`, `STALE`, `UPDATING`, `REVALIDATED`, `HIT`. Odatda `add_header X-Cache $upstream_cache_status;` bilan ko'rsatiladi.

### Eski javob: `proxy_cache_use_stale`

NG: backend bilan muammo bo'lganda **eskirgan** keshdan foydalanish: `error`, `timeout`, `invalid_header`, `updating`, `http_500`, `http_502`, `http_503`, `http_504`, `http_403`, `http_404`, `http_429` (parametrlar `proxy_next_upstream` nikiga mos). `updating` — kesh yangilanayotganda eskisini berish (backend'ga kamroq murojaat). Javobdagi `Cache-Control` ning `stale-while-revalidate` va `stale-if-error` kengaytmalari ham (pastroq ustuvorlik bilan).

Keshni tozalash (`proxy_cache_purge`) — NG bo'yicha tijoriy obuna (NGINX Plus) imkoniyati.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Backend har javobga tartib raqami beradi — javob keshdanmi yoki yangimi, darhol ko'rinadi; `/cookie` — `Set-Cookie`, `/qisqa` — `X-Accel-Expires: 2`:

```python
# Sinov backend'i: har javobga tartib raqami beradi — kesh ishlaganini ko'rish uchun
import itertools
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sanoq = itertools.count(1)

class A(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def javob(self):
        n = next(sanoq)
        d = f"backend javobi #{n}\n".encode()
        self.send_response(200)
        if self.path.startswith("/cookie"):
            self.send_header("Set-Cookie", "sessiya=abc")
        if self.path.startswith("/qisqa"):
            self.send_header("X-Accel-Expires", "2")
        self.send_header("Content-Length", str(len(d)))
        self.end_headers()
        self.wfile.write(d)
    do_GET = do_POST = javob
    def log_message(self, *a):
        pass

ThreadingHTTPServer(("127.0.0.1", 9040), A).serve_forever()
```

```nginx
proxy_cache_path /var/cache/nginx/sinov levels=1:2 keys_zone=sinov:10m max_size=100m inactive=10m;

server {
    listen 127.0.0.1:8110;

    location / {
        proxy_pass http://127.0.0.1:9040;
        proxy_cache sinov;
        proxy_cache_valid 200 5s;
        proxy_cache_bypass $arg_nocache;
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
        add_header X-Cache $upstream_cache_status always;
    }
}
```

```text vps
$ mkdir -p /opt/kesh && mv /root/app.py /opt/kesh/; (nohup python3 /opt/kesh/app.py > /dev/null 2>&1 &); sleep 1; cp /root/kesh.conf /etc/nginx/conf.d/kesh.conf; rm /root/kesh.conf; nginx -t -q && nginx -s reload; sleep 0.5; ps -o cmd= --ppid $(cat /run/nginx.pid) | sort | uniq -c
      1 nginx: cache loader process
      1 nginx: cache manager process
      1 nginx: worker process
```

Kesh yoqilgach — **cache manager** va **cache loader** jarayonlari paydo bo'ldi.

### MISS, HIT, EXPIRED

`k URL` — `X-Cache` va javob:

```text vps
$ k() { curl -s -D /tmp/h -o /tmp/j "$@"; printf '%-8s %s\n' "$(grep -i '^X-Cache:' /tmp/h | cut -d' ' -f2 | tr -d '\r')" "$(cat /tmp/j)"; }; for i in 1 2 3; do k http://127.0.0.1:8110/sahifa; done; sleep 6; k http://127.0.0.1:8110/sahifa; k http://127.0.0.1:8110/sahifa
MISS     backend javobi #1
HIT      backend javobi #1
HIT      backend javobi #1
EXPIRED  backend javobi #2
HIT      backend javobi #2
```

- 1-so'rov — `MISS` (backend #1), keyingilari — `HIT`: o'sha #1, backend'ga bormadi.
- 6 soniyadan keyin (`proxy_cache_valid 200 5s`) — `EXPIRED`: backend'dan yangi (#2), keyin yana `HIT`.

### BYPASS va POST

```text vps
$ k 'http://127.0.0.1:8110/sahifa?nocache=1'; k http://127.0.0.1:8110/sahifa; k -X POST http://127.0.0.1:8110/sahifa; k -X POST http://127.0.0.1:8110/sahifa
BYPASS   backend javobi #3
HIT      backend javobi #2
         backend javobi #4
         backend javobi #5
```

- `?nocache=1` — `BYPASS`: backend'ga bordi (#3), lekin keyingi oddiy so'rov — `HIT` #2.
- `POST` — `X-Cache` umuman yo'q (bo'sh): kesh ishlatilmadi, har safar backend.

### `Set-Cookie` va `X-Accel-Expires`

```text vps
$ k http://127.0.0.1:8110/cookie; k http://127.0.0.1:8110/cookie; k http://127.0.0.1:8110/qisqa; k http://127.0.0.1:8110/qisqa; sleep 3; k http://127.0.0.1:8110/qisqa
MISS     backend javobi #6
MISS     backend javobi #7
MISS     backend javobi #8
HIT      backend javobi #8
EXPIRED  backend javobi #9
```

- `/cookie` — har safar `MISS`: `Set-Cookie` li javob keshlanmadi.
- `/qisqa` — `X-Accel-Expires: 2` 5 soniyalik `proxy_cache_valid` dan ustun: 3 soniyadan keyin `EXPIRED`.

### Diskdagi kesh

```text vps
$ find /var/cache/nginx/sinov -type f | sed 's#/var/cache/nginx/sinov/##' | head -3; f=$(find /var/cache/nginx/sinov -type f | head -1); grep -a '^KEY:' $f
7/bd/ad2d4f21575de969c4fa2ef36cdefbd7
a/0a/199c5e7d3ec5c3fc21ac9268ea2260aa
d/9b/573e44b7d9fed8ff25f7c44cc519e9bd
KEY: http://127.0.0.1:9040/qisqa
```

`levels=1:2` — `7/bd/…` kabi papkalar (fayl nomining oxirgi belgilari); fayl ichida kalit — `$scheme$proxy_host$request_uri`.

### Backend ishlamasa

```text vps
$ k http://127.0.0.1:8110/sahifa; pkill -f /opt/kesh/app.py; sleep 6; k http://127.0.0.1:8110/sahifa; k http://127.0.0.1:8110/yangi-sahifa; tail -n 1 /var/log/nginx/error.log | grep -oE 'connect\(\) failed \([^)]*\)'
HIT      backend javobi #2
STALE    backend javobi #2
MISS     <html>
<head><title>502 Bad Gateway</title></head>
<body>
<center><h1>502 Bad Gateway</h1></center>
<hr><center>nginx/1.31.8</center>
</body>
</html>
connect() failed (111: Connection refused)
```

- Backend to'xtatildi va 6 soniya kutildi — `/sahifa` muddati o'tgan, lekin `proxy_cache_use_stale error` tufayli `STALE`: foydalanuvchi eski (#2) javobni oldi, xato emas.
- Keshda yo'q `/yangi-sahifa` — `MISS` va 502: eski nusxa yo'q.

```text vps
$ rm /etc/nginx/conf.d/kesh.conf; rm -rf /opt/kesh /var/cache/nginx/sinov; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vazifa | Sozlama |
| --- | --- |
| Backend yukini kamaytirish | `proxy_cache` + `proxy_cache_valid` |
| Backend ishlamaganda ham sayt ochilsin | `proxy_cache_use_stale error timeout http_5xx…` |
| Bir vaqtda ko'p so'rov bitta yangilanishni kutsin | `proxy_cache_use_stale updating`, `proxy_cache_lock` |
| Login qilganlarga keshlamaslik | `proxy_cache_bypass $cookie_session; proxy_no_cache $cookie_session;` |
| Faqat mashhur sahifalar | `proxy_cache_min_uses` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `keys_zone` hajmini kesh hajmi deb o'ylash | Faqat kalitlar uchun (NA) | `max_size` |
| `proxy_cache_valid` siz va backend kesh header'larisiz | Hech narsa keshlanmasligi mumkin | `proxy_cache_valid` yoki backend `Cache-Control` |
| Shaxsiy sahifalarni kesh kalitida foydalanuvchisiz keshlash | Birovning sahifasi boshqaga | Kalitga foydalanuvchi yoki `proxy_no_cache` |
| Keshda `Set-Cookie` li javob bor deb kutish | Keshlanmaydi (sinovda `MISS`) | Cookie'ni keshlanadigan javobdan olib tashlash |
| `X-Cache` ni ko'rmasdan "kesh ishlayapti" deyish | Tasdiqlanmagan | `add_header X-Cache $upstream_cache_status;` |
| `proxy_cache_use_stale` siz | Backend tushsa — 502 | `error timeout http_502 …` |

## Amaliyot

**[Mashqni boshlash →](/nginx/trenajor?mashq=ng-16-kesh)** "Proxy kesh: MISS va HIT": brauzerdagi haqiqiy nginx'da qadamma-qadam bajarasiz, har so'rov "So'rov yo'li" sxemasida chiziladi.

1. `keys_zone` va `max_size` farqi nima?
2. Standart kesh kaliti qanday?
3. `proxy_cache_valid 5m;` qaysi kodlarni keshlaydi?
4. Backend javobidagi qaysi header `proxy_cache_valid` dan ustun?
5. `Set-Cookie` li javob keshlanadimi? Sinovda nima bo'ldi?
6. Backend tushganda sinovda `/sahifa` va `/yangi-sahifa` nima qaytardi va nega?

<details>
<summary>Javoblar</summary>

1. `keys_zone` — kalitlar uchun umumiy xotira; `max_size` — diskdagi kesh hajmi chegarasi.
2. `$scheme$proxy_host$request_uri`.
3. 200, 301, 302.
4. `X-Accel-Expires` (bo'lmasa `Expires`/`Cache-Control`).
5. Yo'q (NG); sinovda har so'rov `MISS`.
6. `/sahifa` — `STALE` (eski kesh, `proxy_cache_use_stale error`); `/yangi-sahifa` — 502, keshda yo'q.

</details>

## Rasmiy hujjat

- [NA: NGINX Content Caching](https://docs.nginx.com/nginx/admin-guide/content-cache/content-caching/)
- [NG: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — `proxy_cache_path`, `proxy_cache_valid`, `proxy_cache_key`, `proxy_cache_use_stale`
- [NG: $upstream_cache_status](https://nginx.org/en/docs/http/ngx_http_upstream_module.html#var_upstream_cache_status)
