# 08 — Holat kodlari

[Mundarija](README.md)

## Tushuncha

MDN (HTTP response status codes): **holat kodi** (status code) — HTTP so'rovi muvaffaqiyatli bajarildimi yoki yo'qligini bildiradi. U javobning birinchi qatorida turadi (6-bob): `HTTP/1.1 404 Not Found`.

### Besh guruh

RFC 9110 (15-bo'lim): holat kodi — **uch xonali** son, 100 dan 599 gacha. **Birinchi raqam** guruhni (class) bildiradi, qolgan ikkitasi guruhlashda rol o'ynamaydi:

| Guruh | Nomi | Ma'nosi (RFC 9110) |
| --- | --- | --- |
| `1xx` | Informational (axborot) | So'rov qabul qilindi, jarayon davom etmoqda |
| `2xx` | Successful (muvaffaqiyat) | So'rov qabul qilindi, tushunildi va bajarildi |
| `3xx` | Redirection (yo'naltirish) | So'rovni tugatish uchun yana amal kerak (10-bob) |
| `4xx` | Client Error (mijoz xatosi) | So'rovda xato bor yoki uni bajarib bo'lmaydi |
| `5xx` | Server Error (server xatosi) | So'rov to'g'ri ko'rinadi, lekin server uni bajara olmadi |

**Muhim qoida** (RFC 9110): mijoz har bir kodni bilishi shart emas, lekin **guruhini** tushunishi shart. Noma'lum kodni guruhining `x00` kodi deb qabul qiladi: masalan, `471` ni olsa — `400` deb ishlaydi.

MDN: ro'yxatda yo'q kod — standart emas, ehtimol server dasturining o'ziga xos kodi.

### Eng ko'p uchraydiganlari

**2xx — muvaffaqiyat:**

| Kod | Ma'nosi (MDN) |
| --- | --- |
| `200 OK` | So'rov bajarildi. Ma'nosi metodga bog'liq: `GET` — resurs tanada; `POST` — amal bajarildi, tanada natija tavsifi. Standart holatda keshlanadi |
| `201 Created` | Yangi resurs yaratildi; odatda `POST` natijasi. Yangi resurs manzili — `Location` header'ida |
| `204 No Content` | So'rov bajarildi, qaytariladigan tana yo'q. Masalan, `DELETE` muvaffaqiyatli bo'ldi |

**3xx — yo'naltirish** (10–11-boblar):

| Kod | Ma'nosi |
| --- | --- |
| `304 Not Modified` | Shartli `GET`/`HEAD` (`If-None-Match`, `If-Modified-Since`) natijasi: mijozdagi keshlangan nusxa hali yaroqli, qayta yuborish shart emas. Tanasi bo'lmaydi |

**4xx — mijoz xatosi:**

| Kod | Ma'nosi (MDN) |
| --- | --- |
| `400 Bad Request` | Server so'rovni mijoz xatosi deb hisobladi: sintaksis buzilgan, xabar chegarasi noto'g'ri va h.k. O'zgartirmasdan qayta yuborish yana shu xatoni beradi |
| `401 Unauthorized` | To'g'ri **autentifikatsiya** ma'lumoti yo'q. Javobda `WWW-Authenticate` header'i — server kutayotgan usul (16-bob) |
| `403 Forbidden` | Server so'rovni tushundi, lekin **rad etdi**. `401` dan farqi: qayta autentifikatsiya foyda bermaydi — ruxsat (huquq) yetarli emas. Resurs borligini yashirish uchun server `403` o'rniga `404` yuborishi mumkin |
| `404 Not Found` | Resurs topilmadi. Vaqtinchalikmi yoki doimiymi — aytilmaydi; doimiy o'chirilgan bo'lsa `410 Gone` to'g'riroq |
| `409 Conflict` | So'rov resursning joriy holatiga zid; masalan, bir resursni bir vaqtda yangilash |
| `429 Too Many Requests` | Ma'lum vaqtda juda ko'p so'rov — **tezlikni cheklash** (rate limiting). `Retry-After` bilan qancha kutish kerakligi aytilishi mumkin |

**5xx — server xatosi:**

| Kod | Ma'nosi (MDN) |
| --- | --- |
| `500 Internal Server Error` | Server kutilmagan holatga duch keldi. Umumiy "boshqa mos kod yo'q" javobi: noto'g'ri sozlama, xotira tugashi, ushlanmagan istisno (exception) va h.k. |
| `502 Bad Gateway` | Server **shlyuz yoki proksi** sifatida ishlayapti va orqadagi (upstream) serverdan **noto'g'ri javob** oldi |
| `503 Service Unavailable` | Server hozir so'rovni ishlashga tayyor emas: texnik xizmat yoki ortiqcha yuklama. Muayyan mijoz tezligi cheklangan bo'lsa — `429` to'g'riroq |
| `504 Gateway Timeout` | Shlyuz yoki proksi orqadagi serverdan **vaqtida javob olmadi** |

`502` va `504` farqi (MDN): `502` — orqadagi server noto'g'ri javob berdi; `504` — umuman javob kelmadi (vaqt tugadi).

**1xx** kamdan-kam ko'rinadi: masalan, `101 Switching Protocols` — mijozning `Upgrade` so'roviga javob (WebSocket shu bilan ochiladi), `103 Early Hints` — asosiy javobdan oldin brauzerga resurslarni oldindan yuklashni maslahat beradi.

## Ko'rib chiqamiz

Kodlarni haqiqiy holatda ko'rish uchun VPS'da ikki qatlamli tizim yig'ildi — 5-bobdagi "brauzer → proksi → server" zanjiri:

```text
curl ──► nginx 1.30.6 (:8080, Docker) ──► Python backend (:8081)
         proksi va tezlik cheklovi          ilova
```

**Backend** (Python standart kutubxonasi):

```python
import json, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

emaillar = {'ali@example.com'}


class Ishlovchi(BaseHTTPRequestHandler):
    def javob(self, kod, matn='', **headerlar):
        tana = matn.encode()
        self.send_response(kod)
        for nom, qiymat in headerlar.items():
            self.send_header(nom.replace('_', '-'), qiymat)
        if kod not in (204, 304):
            self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        if kod not in (204, 304) and self.command != 'HEAD':
            self.wfile.write(tana)

    def do_GET(self):
        if self.path == '/salom':
            return self.javob(200, 'salom\n')
        if self.path == '/logo.svg':
            if self.headers.get('If-None-Match') == '"v1"':
                return self.javob(304, ETag='"v1"')
            return self.javob(200, '<svg/>\n', ETag='"v1"', Content_Type='image/svg+xml')
        if self.path == '/admin':
            token = self.headers.get('Authorization')
            if token is None:
                return self.javob(401, 'kirish kerak\n', WWW_Authenticate='Bearer')
            if token != 'Bearer admin-token':
                return self.javob(403, 'ruxsat yo\'q\n')
            return self.javob(200, 'admin paneli\n')
        if self.path == '/xato':
            try:
                1 / 0
            except ZeroDivisionError:
                return self.javob(500, 'ichki xato\n')
        if self.path == '/qulash':
            raise RuntimeError('ishlovchi qulab tushdi')   # javob yuborilmaydi
        if self.path == '/sekin':
            time.sleep(3)
            return self.javob(200, 'kech javob\n')
        self.javob(404, 'topilmadi\n')

    def do_POST(self):
        tana = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        try:
            malumot = json.loads(tana)
        except ValueError:
            return self.javob(400, 'JSON noto\'g\'ri\n')
        if self.path == '/kitoblar':
            return self.javob(201, '{"id": 7}\n', Location='/kitoblar/7')
        if self.path == '/royxat':
            if malumot.get('email') in emaillar:
                return self.javob(409, 'bu email band\n')
            emaillar.add(malumot.get('email'))
            return self.javob(201, 'yaratildi\n')
        self.javob(404, 'topilmadi\n')

    def do_DELETE(self):
        self.javob(204)


ThreadingHTTPServer(('127.0.0.1', 8081), Ishlovchi).serve_forever()
```

**nginx** sozlamasi (`/etc/nginx/conf.d/default.conf`):

```nginx
limit_req_zone $binary_remote_addr zone=bir:1m rate=1r/s;

server {
    listen 8080;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_read_timeout 1s;
    }

    location /api/ {
        limit_req zone=bir;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:8081/;
    }

    location /tamir {
        return 503;
    }
}
```

- `proxy_pass` — so'rovni backend'ga uzatadi; `proxy_read_timeout 1s` — backend javobini 1 soniyadan ortiq kutmaydi (nginx hujjati; standart qiymati 60s).
- `limit_req_zone … rate=1r/s` va `limit_req` — bitta IP'dan soniyasiga 1 so'rov. Ortiqchasi rad etiladi; rad javobi kodi standart holatda `503`, `limit_req_status 429` uni `429` ga almashtiradi (nginx hujjati).
- `return 503` — "texnik xizmat" sahifasi.

Ishga tushirish:

```text vps
$ docker run -d --name kod --network host -v /tmp/kod/nginx.conf:/etc/nginx/conf.d/default.conf:ro nginx:1.30.6 >/dev/null && sleep 1 && docker exec kod nginx -v
nginx version: nginx/1.30.6
```

Chiqishlardan `Server:`, `Date:` va `Connection:` qatorlari qisqalik uchun olib tashlandi (`| tr -d '\r' | grep -v …`).

### 2xx

```text vps
$ curl -si http://127.0.0.1:8080/salom | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 200 OK
Content-Length: 6

salom
$ curl -si --json '{"nom":"Git"}' http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 201 Created
Content-Length: 10
Location: /kitoblar/7

{"id": 7}
$ curl -si -X DELETE http://127.0.0.1:8080/kitoblar/7 | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 204 No Content

```

`201` — `Location` bilan; `204` — tanasiz.

### 304: shartli so'rov

```text vps
$ curl -si http://127.0.0.1:8080/logo.svg | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 200 OK
Content-Type: image/svg+xml
Content-Length: 7
ETag: "v1"

<svg/>
$ curl -si -H 'If-None-Match: "v1"' http://127.0.0.1:8080/logo.svg | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 304 Not Modified
ETag: "v1"

```

Birinchi javob resursning **versiya belgisini** — `ETag` ni berdi. Ikkinchi so'rov "menda `v1` bor" dedi (`If-None-Match`) — server `304` bilan "o'zgarmagan, o'zingdagini ishlat" deb javob berdi, tana yuborilmadi. Batafsil — 11-bob.

### 4xx

```text vps
$ curl -si --json '{"nom": Git}' http://127.0.0.1:8080/kitoblar | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 400 Bad Request
Content-Length: 15

JSON noto'g'ri
$ curl -si http://127.0.0.1:8080/admin | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 401 Unauthorized
Content-Length: 13
WWW-Authenticate: Bearer

kirish kerak
$ curl -si -H 'Authorization: Bearer ali-token' http://127.0.0.1:8080/admin | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 403 Forbidden
Content-Length: 12

ruxsat yo'q
$ curl -si http://127.0.0.1:8080/yoq-sahifa | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 404 Not Found
Content-Length: 10

topilmadi
$ curl -si --json '{"email":"ali@example.com"}' http://127.0.0.1:8080/royxat | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 409 Conflict
Content-Length: 14

bu email band
```

| Kod | Sabab |
| --- | --- |
| `400` | `Git` qo'shtirnoqsiz — JSON emas |
| `401` | `Authorization` yo'q. `WWW-Authenticate: Bearer` — "token bilan keling" |
| `403` | Token bor (foydalanuvchi tanildi), lekin u admin emas |
| `404` | Bunday manzil yo'q |
| `409` | Bu email allaqachon ro'yxatda — resurs holatiga zid |

### 429: tezlik cheklovi

```text vps
$ for i in 1 2 3; do curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/api/salom; done
200
429
429
```

Birinchi so'rov o'tdi, keyingi ikkitasi (bir soniya ichida) — `429`. Bu javobni backend emas, **nginx** berdi: so'rov backend'ga yetmadi.

### 5xx

```text vps
$ curl -si http://127.0.0.1:8080/tamir | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:' | head -1
HTTP/1.1 503 Service Temporarily Unavailable
$ curl -si http://127.0.0.1:8080/xato | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:'
HTTP/1.1 500 Internal Server Error
Content-Length: 11

ichki xato
$ curl -si http://127.0.0.1:8080/qulash | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:' | head -1
HTTP/1.1 502 Bad Gateway
$ curl -si http://127.0.0.1:8080/sekin | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:' | head -1
HTTP/1.1 504 Gateway Time-out
$ pkill -f /tmp/kod/backend.py; sleep 1; curl -si http://127.0.0.1:8080/salom | tr -d '\r' | grep -v '^Server:\|^Date:\|^Connection:' | head -1
HTTP/1.1 502 Bad Gateway
```

| So'rov | Kod | Kim javob berdi va nega |
| --- | --- | --- |
| `/tamir` | `503` | nginx: `return 503` — texnik xizmat |
| `/xato` | `500` | Backend: xatoni o'zi ushladi va `500` qaytardi |
| `/qulash` | `502` | nginx: backend javob yubormay ulanishni yopdi — orqadan **noto'g'ri** javob |
| `/sekin` | `504` | nginx: backend 3 soniya o'yladi, nginx 1 soniyadan keyin kutmadi |
| backend o'chirilgan | `502` | nginx: backend'ga ulanib bo'lmadi |

Izohlar (reason phrase) RFC'dagidan farq qiladi: nginx `Service Temporarily Unavailable` va `Gateway Time-out` deb yozdi. Izoh faqat ma'lumot uchun (6-bob) — dastur **kodga** qarashi kerak.

### Jurnallar: sababni qayerdan topish

`502` va `504` da mijoz faqat kodni ko'radi. Sabab — proksi jurnalida. nginx xato jurnali (vaqt va mijoz manzili olib tashlangan):

```text vps
$ docker logs kod 2>&1 | grep -E '\[error\]' | sed -E 's/^[0-9\/: ]+//; s/, client: .*//'
[error] 21#21: *23 limiting requests, excess: 0.985 by zone "bir"
[error] 21#21: *24 limiting requests, excess: 0.971 by zone "bir"
[error] 21#21: *28 upstream prematurely closed connection while reading response header from upstream
[error] 21#21: *30 upstream timed out (110: Connection timed out) while reading response header from upstream
[error] 21#21: *32 connect() failed (111: Connection refused) while connecting to upstream
```

| Jurnal | Kod |
| --- | --- |
| `limiting requests … by zone "bir"` | `429` |
| `upstream prematurely closed connection` — orqadagi server ulanishni muddatidan oldin yopdi | `502` (`/qulash`) |
| `upstream timed out` | `504` |
| `connect() failed (111: Connection refused)` — 3-bobdagi RST | `502` (backend o'chiq) |

`/qulash` uchun backend jurnali — haqiqiy sabab shu yerda:

```text vps
$ grep -A3 Traceback /tmp/kod/backend.log | head -4; grep RuntimeError /tmp/kod/backend.log
Traceback (most recent call last):
  File "/usr/lib/python3.14/socketserver.py", line 697, in process_request_thread
    self.finish_request(request, client_address)
    ~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^
    raise RuntimeError('ishlovchi qulab tushdi')   # javob yuborilmaydi
RuntimeError: ishlovchi qulab tushdi
```

nginx'ning kirish jurnali — barcha so'rovlar va kodlar:

```text vps
$ docker logs kod 2>&1 | grep -E '^127' | awk '{print $6, $7, $9}' | tr -d '"'
GET /salom 200
POST /kitoblar 201
DELETE /kitoblar/7 204
GET /logo.svg 200
GET /logo.svg 304
POST /kitoblar 400
GET /admin 401
GET /admin 403
GET /yoq-sahifa 404
POST /royxat 409
GET /api/salom 200
GET /api/salom 429
GET /api/salom 429
GET /tamir 503
GET /xato 500
GET /qulash 502
GET /sekin 504
GET /salom 502
```

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 9110 | 15 | Kod — 100..599 oralig'idagi uch xonali son; birinchi raqam — guruh. Mijoz noma'lum kodni guruhining `x00` kodi deb qabul qilishi **shart** |
| RFC 9110 | 15.3.1, 15.3.2, 15.3.5 | `200`, `201`, `204` |
| RFC 9110 | 15.4.5 | `304` |
| RFC 9110 | 15.5.2 | `401` javobida `WWW-Authenticate` yuborish **shart** |
| RFC 9110 | 15.5.1, 15.5.4, 15.5.5, 15.5.10 | `400`, `403`, `404`, `409` |
| RFC 9110 | 15.6.1, 15.6.3, 15.6.5 | `500`, `502`, `504` |
| RFC 9110 | 15.6.4 | `503`: vaqtinchalik yuklama yoki texnik xizmat; `Retry-After` yuborilishi mumkin. Ortiqcha yuklamada server `503` yuborishi shart emas — ulanishni rad etishi ham mumkin |
| RFC 6585 (2012-yil aprel) | 4 | `429`: tezlik cheklovi; sabab tushuntirilishi kerak (SHOULD), `Retry-After` bo'lishi mumkin |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Xatoni `200` bilan va tanada `{"ok": false}` qaytarish | Mijoz, proksi va kesh `200` ni muvaffaqiyat deb biladi (`200` standart holatda keshlanadi) | Mos `4xx`/`5xx` kod |
| `401` va `403` ni chalkashtirish | `401` — kimligingiz noma'lum; `403` — tanildingiz, lekin ruxsat yo'q | Token yo'q/yaroqsiz — `401`, huquq yetmaydi — `403` |
| `401` ni `WWW-Authenticate` siz yuborish | RFC 9110: shart | `WWW-Authenticate: Bearer` va h.k. |
| `502`/`504` da ilova kodini qidirish | Bu kodni proksi (nginx) bergan, ilova emas | Proksi jurnali (`upstream …`), keyin ilova jurnali |
| Tezlik cheklovida `503` | Server ishlayapti, faqat shu mijoz ko'p so'rayapti | `429` (nginx'da `limit_req_status 429`) |
| Izoh matniga qarab ishlash (`"Gateway Time-out"`) | Izoh ixtiyoriy va har serverda boshqacha | Faqat kod raqami |
| Noma'lum kodda "nima qilishni bilmayman" | RFC 9110: guruh bo'yicha `x00` deb ishlash | `4xx` → mijoz xatosi, `5xx` → server xatosi |

## Amaliyot

1. Besh guruhni va har birining ma'nosini ayting.
2. Mijoz `418` kodini oldi va uni bilmaydi. RFC 9110 bo'yicha qanday ishlashi kerak?
3. `401` va `403` farqi nima? Sinovda qaysi biri qachon chiqdi?
4. `502` va `504` farqi nima? Sinovdagi nginx jurnalida ular qanday yozildi?
5. Nega tezlik cheklovi uchun `503` emas, `429` to'g'ri?
6. `304` javobining tanasi qayerda?

<details>
<summary>Javoblar</summary>

1. `1xx` — axborot, `2xx` — muvaffaqiyat, `3xx` — yo'naltirish, `4xx` — mijoz xatosi, `5xx` — server xatosi.
2. `4xx` guruhidan — `400` deb.
3. `401` — autentifikatsiya yo'q (sinovda `Authorization` siz). `403` — foydalanuvchi tanilgan, lekin huquq yo'q (sinovda admin bo'lmagan token).
4. `502` — orqadagi server noto'g'ri javob berdi yoki ulanib bo'lmadi (`upstream prematurely closed connection`, `connect() failed`); `504` — javob vaqtida kelmadi (`upstream timed out`).
5. `503` — server umuman tayyor emas; `429` — server ishlayapti, aynan shu mijoz ko'p so'rov yubordi (MDN, RFC 6585).
6. Yo'q: mijoz o'zidagi keshlangan nusxani ishlatadi.

</details>

## Rasmiy hujjat

- [MDN: HTTP response status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
- [RFC 9110 §15: Status Codes](https://www.rfc-editor.org/rfc/rfc9110#name-status-codes)
- [RFC 6585: Additional HTTP Status Codes (429)](https://www.rfc-editor.org/rfc/rfc6585)
- [nginx: ngx_http_proxy_module (`proxy_pass`, `proxy_read_timeout`)](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [nginx: ngx_http_limit_req_module (`limit_req`, `limit_req_status`)](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html)
- [nginx: ngx_http_rewrite_module (`return`)](https://nginx.org/en/docs/http/ngx_http_rewrite_module.html)
