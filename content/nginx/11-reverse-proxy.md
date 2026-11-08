# 11 — Reverse proxy

[Mundarija](README.md)

## Tushuncha

NA (NGINX Reverse Proxy): nginx so'rovni proksilaganda u:

1. so'rovni ko'rsatilgan serverga yuboradi;
2. javobni oladi;
3. javobni mijozga qaytaradi.

Orqadagi server (upstream, backend) — boshqa HTTP server (nginx, Node.js, Python, Go ilova…) yoki HTTP bo'lmagan protokolli server: FastCGI (`fastcgi_pass`, 12-bob), uwsgi, SCGI, memcached.

### `proxy_pass`

```nginx
location /some/path/ {
    proxy_pass http://www.example.com/link/;
}
```

Manzil — domen yoki IP, ixtiyoriy port; yoki UNIX soket: `http://unix:/tmp/backend.socket:/uri/` (NG). Domen bir nechta IP'ga aylansa — hammasi navbat bilan ishlatiladi; server guruhi ham bo'lishi mumkin (15-bob).

### URI qanday uzatiladi — eng muhim qoida

NG:

| `proxy_pass` | Backend'ga |
| --- | --- |
| **URI bilan** (`http://host/remote/`, hatto faqat `/`) | So'rov URI'sining **location'ga mos qismi** shu URI bilan **almashtiriladi** |
| **URI'siz** (`http://host`) | So'rov URI'si **o'zgarishsiz** (mijoz yuborgandek) |

Almashtiriladigan qismni aniqlab bo'lmaydigan joylarda — **regex location**, nomli location, `if` ichida — `proxy_pass` URI'siz bo'lishi kerak. `rewrite … break` bilan URI o'zgartirilsa, `proxy_pass` dagi URI e'tiborsiz qoladi va o'zgargan URI to'liq uzatiladi.

### Header'lar

NA, NG:

- Standart holatda nginx proksilangan so'rovda `Host` ni **`$proxy_host`** ga (`proxy_pass` dagi host:port) o'zgartiradi; asl `Host` va `Connection` uzatilmaydi; qiymati bo'sh header'lar tashlanadi.
- `proxy_set_header` bilan o'zgartiriladi; bo'sh qiymat (`""`) — header uzatilmaydi.
- `proxy_set_header` lar **meros**: faqat joriy darajada bittasi ham bo'lmasa (3-bobdagi `add_header` kabi).
- `proxy_http_version` — standart **1.1** (1.29.7 dan; avval 1.0); `2` — HTTP/2 (1.29.4 dan).

Ilova haqiqiy mijozni bilishi uchun odatiy header'lar:

| Header | Qiymat | Nima |
| --- | --- | --- |
| `Host` | `$host` | Mijoz so'ragan domen (standart — backend manzili) |
| `X-Real-IP` | `$remote_addr` | Mijoz IP'si |
| `X-Forwarded-For` | `$proxy_add_x_forwarded_for` | Mijozdan kelgan `X-Forwarded-For` + `$remote_addr` (vergul bilan); bo'lmasa — `$remote_addr` |
| `X-Forwarded-Proto` | `$scheme` | Mijoz `http` yoki `https` bilan kelgani |

`X-Forwarded-For` ni mijoz o'zi ham yuborishi mumkin — ilova unga ishonishdan oldin bu nginx'ning o'zi ekanini bilishi kerak (17-bob).

### `/` bilan tugaydigan location

NG (`location`): prefiks `/` bilan tugasa va so'rov `proxy_pass` (yoki `fastcgi_pass` …) bilan ishlansa, shu satrning **`/`siz** ko'rinishidagi so'rovga — **301** bilan `/` qo'shilgan manzilga yo'naltirish. Kerak bo'lmasa — `location = /user` alohida.

### Buferlash

NA: standart holatda nginx backend javobini **buferlaydi** (`proxy_buffering on`) — butun javob olinmaguncha mijozga yubormaydi. Bu sekin mijozlar backend vaqtini band qilmasligi uchun. `proxy_buffering off` — javob olinishi bilan mijozga uzatiladi (tez, interaktiv mijozlar uchun). Batafsil — 14-bob.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8). Backend — kelgan so'rovni matn qilib qaytaradigan kichik dastur (Python standart kutubxonasi; backend tili ahamiyatsiz):

```python
# Kichik sinov backend'i: kelgan so'rovni matn qilib qaytaradi
from http.server import BaseHTTPRequestHandler, HTTPServer

class Echo(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    def do_GET(self):
        h = self.headers
        body = (f"backend oldi: {self.command} {self.path} {self.request_version}\n"
                f"  Host: {h.get('Host')}\n"
                f"  Connection: {h.get('Connection')}\n"
                f"  X-Real-IP: {h.get('X-Real-IP')}\n"
                f"  X-Forwarded-For: {h.get('X-Forwarded-For')}\n"
                f"  X-Forwarded-Proto: {h.get('X-Forwarded-Proto')}\n").encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *a):
        pass

HTTPServer(("127.0.0.1", 9001), Echo).serve_forever()
```

```nginx
server {
    listen 127.0.0.1:8103;
    server_name sayt.test;

    location /a/ {
        proxy_pass http://127.0.0.1:9001;
    }
    location /b/ {
        proxy_pass http://127.0.0.1:9001/;
    }
    location /c/ {
        proxy_pass http://127.0.0.1:9001/ichki/;
    }
    location /d {
        proxy_pass http://127.0.0.1:9001/ichki;
    }
    location /h/ {
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass http://127.0.0.1:9001;
    }
    location /yoq/ {
        proxy_pass http://127.0.0.1:9002;
    }
}
```

```text vps
$ mkdir -p /opt/echo && mv /root/echo.py /opt/echo/; (nohup python3 /opt/echo/echo.py > /dev/null 2>&1 &); sleep 1; curl -s http://127.0.0.1:9001/salom
backend oldi: GET /salom HTTP/1.1
  Host: 127.0.0.1:9001
  Connection: None
  X-Real-IP: None
  X-Forwarded-For: None
  X-Forwarded-Proto: None
$ cp /root/proxy.conf /etc/nginx/conf.d/proxy.conf; rm /root/proxy.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
```

To'g'ridan-to'g'ri so'rovda `Host: 127.0.0.1:9001`, proksi header'lari yo'q.

### URI: `/` bor va yo'q

`p URI [qatorlar]` — `Host: sayt.test` bilan so'rov, backend nima olganini ko'rsatadi:

```text vps
$ p() { echo "== $1"; curl -s -H 'Host: sayt.test' "http://127.0.0.1:8103$1" | head -${2:-1}; }; p /a/x?q=1; p /b/x?q=1; p /c/x; p /d/x; p /dfoo; p /a/x 3
== /a/x?q=1
backend oldi: GET /a/x?q=1 HTTP/1.1
== /b/x?q=1
backend oldi: GET /x?q=1 HTTP/1.1
== /c/x
backend oldi: GET /ichki/x HTTP/1.1
== /d/x
backend oldi: GET /ichki/x HTTP/1.1
== /dfoo
backend oldi: GET /ichkifoo HTTP/1.1
== /a/x
backend oldi: GET /a/x HTTP/1.1
  Host: 127.0.0.1:9001
  Connection: None
```

| Location | `proxy_pass` | So'rov | Backend oldi |
| --- | --- | --- | --- |
| `/a/` | `http://…:9001` (URI'siz) | `/a/x?q=1` | `/a/x?q=1` — o'zgarishsiz |
| `/b/` | `http://…:9001/` | `/b/x?q=1` | `/x?q=1` — `/b/` → `/` |
| `/c/` | `…/ichki/` | `/c/x` | `/ichki/x` |
| `/d` | `…/ichki` | `/d/x` | `/ichki/x` |
| `/d` | `…/ichki` | `/dfoo` | **`/ichkifoo`** — `/d` → `/ichki`, chegarasiz |

`/a/x` da `Host: 127.0.0.1:9001` — standart `$proxy_host`; mijozning `sayt.test` i yo'qoldi.

### Header'lar

```text vps
$ curl -s -H 'Host: sayt.test' -H 'X-Forwarded-For: 10.1.1.1' http://127.0.0.1:8103/h/x
backend oldi: GET /h/x HTTP/1.1
  Host: sayt.test
  Connection: None
  X-Real-IP: 127.0.0.1
  X-Forwarded-For: 10.1.1.1, 127.0.0.1
  X-Forwarded-Proto: http
```

- `Host: sayt.test` — `$host`.
- `X-Forwarded-For: 10.1.1.1, 127.0.0.1` — mijoz yuborgan qiymat **saqlandi** va unga haqiqiy manzil qo'shildi (`$proxy_add_x_forwarded_for`). Ya'ni birinchi qiymatni mijoz o'zi yozgan bo'lishi mumkin.
- `X-Forwarded-Proto: http`.

### `Connection` header'i

Xom so'rovni ko'rish uchun backend o'rniga `nc`:

```text vps
$ printf '%s\n' 'server {' '    listen 127.0.0.1:8105;' '    location / {' '        proxy_pass http://127.0.0.1:9003;' '    }' '}' > /etc/nginx/conf.d/xom.conf; nginx -t -q && nginx -s reload; sleep 0.5; (timeout 3 nc -l 127.0.0.1 9003 > /tmp/xom.txt &); sleep 0.5; curl -s -m 2 -o /dev/null -H 'Connection: keep-alive' http://127.0.0.1:8105/x; sleep 1; cat -A /tmp/xom.txt | sed 's/\$$//'
GET /x HTTP/1.1^M
Host: 127.0.0.1:9003^M
User-Agent: curl/8.18.0^M
Accept: */*^M
^M
$ rm /etc/nginx/conf.d/xom.conf /tmp/xom.txt; nginx -t -q && nginx -s reload; echo ok
ok
```

nginx backend'ga `HTTP/1.1` bilan bordi; mijozning `Connection: keep-alive` i uzatilmadi. Kuzatildi: 1.31.8 da `Connection: close` ham qo'shilmadi — NG'da HTTP/1.0/1.1 uchun `Connection close` deb yozilgan.

### Avtomatik 301

```text vps
$ curl -s -o /dev/null -w 'HTTP %{http_code} -> %{redirect_url}\n' -H 'Host: sayt.test' http://127.0.0.1:8103/a
HTTP 301 -> http://sayt.test:8103/a/
```

`/a` — `location /a/` + `proxy_pass` → `/a/` ga 301 (NG qoidasi).

### Backend ishlamasa

```text vps
$ curl -s -o /dev/null -w 'HTTP %{http_code}\n' -H 'Host: sayt.test' http://127.0.0.1:8103/yoq/x; tail -n 1 /var/log/nginx/error.log | grep -oE 'connect\(\) failed \([^)]*\)[^,]*|upstream: "[^"]*"'
HTTP 502
connect() failed (111: Connection refused) while connecting to upstream
upstream: "http://127.0.0.1:9002/yoq/x"
```

**502 Bad Gateway**; xato jurnalida sabab (`Connection refused`) va qaysi backend manzili (`upstream`). Diqqat: URI'siz `proxy_pass` — `/yoq/x` backend'ga ham `/yoq/x` bo'lib bordi.

### Regex location'da URI

```text vps
$ printf '%s\n' 'server {' '    listen 127.0.0.1:8104;' '    location ~ \.php$ {' '        proxy_pass http://127.0.0.1:9001/app/;' '    }' '}' > /etc/nginx/conf.d/xato.conf; nginx -t; rm /etc/nginx/conf.d/xato.conf
nginx: [emerg] "proxy_pass" cannot have URI part in location given by regular expression, or inside predicate location, or inside named location, or inside "if" statement, or inside "limit_except" block in /etc/nginx/conf.d/xato.conf:4
nginx: configuration file /etc/nginx/nginx.conf test failed
```

`nginx -t` qoidani to'g'ridan-to'g'ri aytadi: regex, predikat, nomli location, `if` va `limit_except` ichida `proxy_pass` URI qismsiz bo'lishi kerak.

```text vps
$ rm /etc/nginx/conf.d/proxy.conf; pkill -f /opt/echo/echo.py; rm -rf /opt/echo; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

| Vazifa | Konfiguratsiya |
| --- | --- |
| Butun sayt ilovada | `location / { proxy_pass http://127.0.0.1:3000; }` |
| `/api/` ni ilovaning `/` iga | `location /api/ { proxy_pass http://127.0.0.1:3000/; }` |
| URI'ni o'zgarishsiz | `proxy_pass` URI'siz |
| Statik — nginx, qolgani — ilova | `try_files $uri @app;` + `location @app { proxy_pass …; }` (5-bob) |
| Bir nechta backend | `upstream` guruhi (15-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `proxy_pass` oxiridagi `/` ni e'tiborsiz qoldirish | Backend boshqa URI oladi (sinovdagi jadval) | Qoidani bilish: URI bilan — almashtirish, URI'siz — o'zgarishsiz |
| `location /api` + `proxy_pass …/v1` | `/apifoo` → `/v1foo` (sinovda `/dfoo` → `/ichkifoo`) | `location /api/` + `proxy_pass …/v1/` |
| `Host` ni o'rnatmaslik | Ilova `127.0.0.1:3000` ni ko'radi, havolalar buziladi | `proxy_set_header Host $host;` |
| `X-Forwarded-For` ning birinchi qiymatiga ishonish | Mijoz o'zi yozishi mumkin (sinovda `10.1.1.1`) | `real_ip` va ishonchli proksilar ro'yxati (17-bob) |
| Bitta `proxy_set_header` ni location'ga qo'shib, server'dagilar qoladi deb o'ylash | Meros to'xtaydi (NG) | Hammasini shu darajada |
| Regex location'da URI'li `proxy_pass` | `nginx -t` xatosi | URI'siz yoki `rewrite … break` |
| 502 ni nginx xatosi deb o'ylash | Backend ishlamayapti yoki ulanib bo'lmaydi | Xato jurnalidagi `upstream` va sabab |

## Amaliyot

1. `location /api/ { proxy_pass http://127.0.0.1:3000/; }` — `/api/users?id=1` backend'ga qanday boradi?
2. Xuddi shu, lekin `proxy_pass http://127.0.0.1:3000;` bo'lsa-chi?
3. Standart holatda backend `Host` header'ida nimani ko'radi?
4. `$proxy_add_x_forwarded_for` qanday qiymat?
5. `location /user/` + `proxy_pass` bo'lsa, `/user` so'roviga nima bo'ladi?
6. 502 javobining sababini qayerdan topasiz?

<details>
<summary>Javoblar</summary>

1. `/users?id=1`.
2. `/api/users?id=1`.
3. `proxy_pass` dagi host:port (`$proxy_host`).
4. Mijozdan kelgan `X-Forwarded-For` + vergul + `$remote_addr`; header bo'lmasa — faqat `$remote_addr`.
5. 301 bilan `/user/` ga yo'naltiriladi.
6. Xato jurnalidan: sabab (masalan, `Connection refused`) va `upstream` manzili.

</details>

## Rasmiy hujjat

- [NA: NGINX Reverse Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
- [NG: ngx_http_proxy_module](https://nginx.org/en/docs/http/ngx_http_proxy_module.html) — `proxy_pass`, `proxy_set_header`, `proxy_http_version`, `$proxy_add_x_forwarded_for`
- [NG: location](https://nginx.org/en/docs/http/ngx_http_core_module.html#location)
