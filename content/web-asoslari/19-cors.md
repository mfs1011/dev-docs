# 19 — CORS

[Mundarija](README.md)

## Tushuncha

18-bobda ko'rdik: brauzer boshqa origin javobini JavaScript'ga bermaydi. Lekin ko'pincha bu kerak — masalan, `https://app.example.com` dagi frontend `https://api.example.com` dagi API'dan ma'lumot oladi. MDN (CORS): **CORS** (Cross-Origin Resource Sharing — origin'lararo resurs almashish) — server **HTTP header'lari** bilan "mening resursimni falon origin'lar o'qishi mumkin" deb brauzerga aytadigan mexanizm.

Muhim: CORS — **ruxsat berish** mexanizmi, himoya emas. Himoyani same-origin siyosati beradi; CORS uni nazorat ostida yumshatadi. Uni **brauzer** qo'llaydi: `curl` kabi mijozlar CORS header'lariga umuman qaramaydi.

CORS ishlatiladigan joylar (MDN): `fetch()` va `XMLHttpRequest`, `@font-face` shriftlari, `crossorigin` atributli `<img>`/`<script>`, `<script type="module">`, canvas'ga chizilgan rasm piksellarini o'qish va boshqalar.

MDN: CORS xatosi tafsilotlari xavfsizlik sababli **JavaScript'ga berilmaydi** — kod faqat "xato bo'ldi" deb biladi (`TypeError: Failed to fetch`). Sababni faqat brauzer **konsolidan** ko'rish mumkin.

### Oddiy so'rov

Ba'zi so'rovlar oldindan tekshiruvsiz yuboriladi — ular "oddiy so'rov" (simple request) deyiladi. MDN: buning sababi — HTML 4.0 dan beri `<form>` istalgan origin'ga shunday so'rov yubora oladi, demak server bunday so'rovlardan baribir himoyalangan (CSRF, 20-bob) bo'lishi kerak. Shartlarning **hammasi** bajarilsa:

- metod: `GET`, `HEAD` yoki `POST`;
- qo'lda qo'yilgan header'lar faqat **CORS-safelisted**: `Accept`, `Accept-Language`, `Content-Language`, `Content-Type`, `Range` (bitta oraliq);
- `Content-Type` faqat: `application/x-www-form-urlencoded`, `multipart/form-data`, `text/plain`.

Brauzer so'rovga **`Origin`** header'ini qo'shadi; server javobida **`Access-Control-Allow-Origin`**:

```http
GET /resources/public-data/ HTTP/1.1
Origin: https://foo.example

HTTP/1.1 200 OK
Access-Control-Allow-Origin: *
```

- `*` — har qanday origin o'qishi mumkin (faqat **credentials'siz** so'rovlar uchun).
- `https://foo.example` — faqat shu origin.

### Oldindan tekshiruv (preflight)

Boshqa so'rovlar uchun (masalan, `Content-Type: application/json`, `PUT`/`DELETE`, maxsus header) brauzer **avval** `OPTIONS` so'rovi yuboradi — "shunday so'rov yuborsam bo'ladimi?":

```http
OPTIONS /doc HTTP/1.1
Origin: https://foo.example
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,x-pingother

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://foo.example
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: X-PINGOTHER, Content-Type
Access-Control-Max-Age: 86400
```

| Header | Kim | Ma'nosi (MDN) |
| --- | --- | --- |
| `Access-Control-Request-Method` | Brauzer | Asosiy so'rov qaysi metod bilan bo'ladi |
| `Access-Control-Request-Headers` | Brauzer | Qaysi header'lar bilan |
| `Access-Control-Allow-Methods` | Server | Ruxsat etilgan metodlar |
| `Access-Control-Allow-Headers` | Server | Ruxsat etilgan header'lar |
| `Access-Control-Max-Age` | Server | Tekshiruv natijasini necha soniya keshlash; standart — 5 soniya, brauzerlarning o'z yuqori chegarasi bor |

Javob ruxsat bersa — brauzer asosiy so'rovni yuboradi. Bermasa — **asosiy so'rov umuman yuborilmaydi**.

### Credentials bilan so'rov

Boshqa origin'ga `fetch()` standart holatda **cookie va HTTP autentifikatsiyasini yubormaydi**. Yuborish uchun — `credentials: "include"` (MDN). Shunda server:

- `Access-Control-Allow-Credentials: true` yuborishi **shart** — aks holda brauzer javobni bermaydi;
- `Access-Control-Allow-Origin`, `-Allow-Headers`, `-Allow-Methods`, `-Expose-Headers` da `*` **ishlatmasligi** shart — aniq qiymat kerak;
- `*` bilan javobdagi `Set-Cookie` ham cookie o'rnatmaydi.

Preflight so'rovining o'zida credentials **hech qachon** bo'lmaydi. Uchinchi tomon cookie siyosati va `SameSite` (14-bob) ham baribir amal qiladi.

### Boshqa header'lar

- **`Access-Control-Expose-Headers`** — JavaScript qaysi javob header'larini o'qiy oladi. Standart holatda faqat "xavfsiz ro'yxat"dagilar (`Content-Type` va h.k.); maxsus header (`X-Jami`) — faqat shu bilan ochilsa.
- **`Vary: Origin`** — server `Access-Control-Allow-Origin` ni so'rovdagi `Origin` ga qarab tanlasa, kesh nusxalarni aralashtirmasligi uchun (11-bob).

## Ko'rib chiqamiz

API serveri — **A** (`http://localhost:8100`), uni chaqiradigan sahifa — **B** (`http://127.0.0.1:8100`). API faqat B origin'iga (`RUXSAT`) ruxsat beradi; har yo'l bitta holatni ko'rsatadi:

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

RUXSAT = 'http://127.0.0.1:8100'          # API'ni o'qishi mumkin bo'lgan yagona boshqa origin


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def jurnal(self):
        print(f'{self.command:7} {self.path:16} Origin={self.headers.get("Origin")} '
              f'ACRM={self.headers.get("Access-Control-Request-Method")} '
              f'ACRH={self.headers.get("Access-Control-Request-Headers")} '
              f'Cookie={self.headers.get("Cookie")}', flush=True)

    def javob(self, kod, matn, **h):
        tana = matn.encode()
        self.send_response(kod)
        for nom, qiymat in h.items():
            self.send_header(nom.replace('_', '-'), qiymat)
        self.send_header('Content-Type', 'text/plain; charset=utf-8')
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_OPTIONS(self):                   # oldindan tekshiruv (preflight)
        self.jurnal()
        if self.path == '/json':
            return self.javob(204, '', Access_Control_Allow_Origin=RUXSAT,
                              Access_Control_Allow_Methods='POST',
                              Access_Control_Allow_Headers='Content-Type',
                              Access_Control_Max_Age='600', Vary='Origin')
        self.javob(204, '')                 # /json-yopiq: hech qanday ruxsat yo'q

    def do_GET(self):
        self.jurnal()
        p = self.path
        if p == '/kirish':
            return self.javob(200, 'ok', Set_Cookie='sid=a3f; SameSite=None; Secure; HttpOnly; Path=/')
        if p == '/ochiq':
            return self.javob(200, 'hammaga ochiq', Access_Control_Allow_Origin='*')
        if p == '/aniq':
            return self.javob(200, 'faqat 127.0.0.1:8100 uchun', Access_Control_Allow_Origin=RUXSAT, Vary='Origin')
        if p == '/boshqa':
            return self.javob(200, 'boshqa sayt uchun', Access_Control_Allow_Origin='https://example.com')
        if p == '/yulduz-cookie':
            return self.javob(200, 'profil', Access_Control_Allow_Origin='*')
        if p == '/profil':
            return self.javob(200, 'profil: ali', Access_Control_Allow_Origin=RUXSAT,
                              Access_Control_Allow_Credentials='true', Vary='Origin')
        if p == '/sanoq':
            return self.javob(200, '3 ta', Access_Control_Allow_Origin=RUXSAT, X_Jami='3')
        if p == '/sanoq-ochiq':
            return self.javob(200, '3 ta', Access_Control_Allow_Origin=RUXSAT, X_Jami='3',
                              Access_Control_Expose_Headers='X-Jami')
        self.javob(200, '<!doctype html><title>sahifa</title>')

    def do_POST(self):
        self.jurnal()
        self.rfile.read(int(self.headers.get('Content-Length', 0)))
        self.javob(201, 'yaratildi', Access_Control_Allow_Origin=RUXSAT, Vary='Origin')

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Chromium 158 da avval A sahifasi `sid` cookie'sini o'rnatdi (`SameSite=None; Secure` — boshqa saytdan kelgan so'rovda ham yuborilishi uchun, `localhost` da `Secure` ishlaydi, 14-bob), keyin B sahifasidan `fetch()`:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const A = 'http://localhost:8100', B = 'http://127.0.0.1:8100'
const b = await chromium.launch(); const p = await b.newPage()
p.on('console', m => { if (m.type() === 'error' && m.text().includes('CORS')) console.log('  [konsol]', m.text()) })
await p.goto(A + '/kirish')                       // A sayt cookie o'rnatadi
await p.goto(B + '/')
const sina = (nom, yol, opt) => p.evaluate(async ([A, nom, yol, opt]) => {
  try {
    const r = await fetch(A + yol, opt)
    return `${nom}: ${r.status} "${await r.text()}" X-Jami=${r.headers.get('X-Jami')}`
  } catch (e) { return `${nom}: ${e.name}: ${e.message}` }
}, [A, nom, yol, opt])
const j = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"nom":"Git"}' }
for (const [nom, yol, opt] of [
  ['1 ochiq (*)', '/ochiq'], ['2 aniq origin', '/aniq'], ['3 boshqa origin', '/boshqa'],
  ['4 JSON POST', '/json', j], ['5 JSON POST yana', '/json', j], ['6 JSON POST, preflight rad', '/json-yopiq', j],
  ['7 matn POST (preflightsiz)', '/json-yopiq', { method: 'POST', body: 'salom' }],
  ['8 cookie bilan, * javob', '/yulduz-cookie', { credentials: 'include' }],
  ['9 cookie bilan, aniq + credentials', '/profil', { credentials: 'include' }],
  ['10 cookie\'siz (standart)', '/profil'],
  ['11 header ochilmagan', '/sanoq'], ['12 Expose-Headers bilan', '/sanoq-ochiq']])
  console.log(await sina(nom, yol, opt))
console.log('chromium', b.version())
await b.close()
```

Natija (konsoldagi CORS xatolari bilan):

```text tashqi
1 ochiq (*): 200 "hammaga ochiq" X-Jami=null
2 aniq origin: 200 "faqat 127.0.0.1:8100 uchun" X-Jami=null
  [konsol] Access to fetch at 'http://localhost:8100/boshqa' from origin 'http://127.0.0.1:8100' has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value 'https://example.com' that is not equal to the supplied origin. Have the server send the header with a valid value.
3 boshqa origin: TypeError: Failed to fetch
4 JSON POST: 201 "yaratildi" X-Jami=null
5 JSON POST yana: 201 "yaratildi" X-Jami=null
  [konsol] Access to fetch at 'http://localhost:8100/json-yopiq' from origin 'http://127.0.0.1:8100' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
6 JSON POST, preflight rad: TypeError: Failed to fetch
7 matn POST (preflightsiz): 201 "yaratildi" X-Jami=null
  [konsol] Access to fetch at 'http://localhost:8100/yulduz-cookie' from origin 'http://127.0.0.1:8100' has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
8 cookie bilan, * javob: TypeError: Failed to fetch
9 cookie bilan, aniq + credentials: 200 "profil: ali" X-Jami=null
10 cookie'siz (standart): 200 "profil: ali" X-Jami=null
11 header ochilmagan: 200 "3 ta" X-Jami=null
12 Expose-Headers bilan: 200 "3 ta" X-Jami=3
```

Server jurnali — **haqiqatda** nima keldi:

```text tashqi
GET     /ochiq           Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
GET     /aniq            Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
GET     /boshqa          Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
OPTIONS /json            Origin=http://127.0.0.1:8100 ACRM=POST ACRH=content-type Cookie=None
POST    /json            Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
POST    /json            Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
OPTIONS /json-yopiq      Origin=http://127.0.0.1:8100 ACRM=POST ACRH=content-type Cookie=None
POST    /json-yopiq      Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
GET     /yulduz-cookie   Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=sid=a3f
GET     /profil          Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=sid=a3f
GET     /profil          Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
GET     /sanoq           Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
GET     /sanoq-ochiq     Origin=http://127.0.0.1:8100 ACRM=None ACRH=None Cookie=None
```

| # | Holat | Brauzer | Jurnal |
| --- | --- | --- | --- |
| 1 | `ACAO: *` | O'qidi | — |
| 2 | `ACAO` = B origin | O'qidi | — |
| 3 | `ACAO` = boshqa origin | Blok; konsol sababini aytdi | So'rov **yetdi** — oddiy so'rov tekshiruvsiz ketadi, faqat javob bloklanadi |
| 4 | JSON `POST` | `OPTIONS` → ruxsat → `POST` | `OPTIONS /json` (`ACRM=POST`, `ACRH=content-type`), keyin `POST` |
| 5 | Yana JSON `POST` | Ishladi | **`OPTIONS` yo'q** — tekshiruv natijasi keshlangan (`Max-Age: 600`) |
| 6 | Preflight rad etildi | Blok | Faqat `OPTIONS /json-yopiq`; keyingi `POST /json-yopiq` — bu **7-sinov**, 6-ning asosiy so'rovi **yuborilmadi** |
| 7 | `text/plain` `POST` o'sha yo'lga | Ishladi | Oddiy so'rov — preflightsiz **to'g'ridan-to'g'ri** ketdi |
| 8 | `credentials: "include"` + `ACAO: *` | Blok | So'rov cookie bilan **yetdi** (`Cookie=sid=a3f`), javob bloklandi |
| 9 | credentials + aniq `ACAO` + `ACAC: true` | O'qidi | Cookie bilan |
| 10 | `credentials` siz | O'qidi | **Cookie yuborilmadi** — boshqa origin'ga standart holat |
| 11–12 | Maxsus `X-Jami` header | `Expose-Headers` siz — `null`, bilan — `3` | — |

Xulosalar:

- 3, 7, 8: **so'rov serverga yetadi**. CORS serverni so'rovlardan himoya qilmaydi — faqat javobni o'qishni boshqaradi. Holat o'zgartiradigan amallarga CSRF himoyasi kerak (20-bob).
- 6 va 7 farqi: bir xil yo'l — JSON'da preflight to'sdi, `text/plain` da preflight bo'lmadi va so'rov o'tdi. Serverda "preflight bor, demak xavfsiz" deb hisoblab bo'lmaydi.

### `curl`: CORS — brauzer qoidasi

VPS'da xuddi shu server:

```text vps
$ curl -si -X OPTIONS -H 'Origin: http://127.0.0.1:8100' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type' http://127.0.0.1:8100/json | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://127.0.0.1:8100
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 600
Vary: Origin
Content-Type: text/plain; charset=utf-8
Content-Length: 0

$ curl -si -H 'Origin: https://yomon.example' http://127.0.0.1:8100/boshqa | tr -d '\r' | grep -v '^Server:\|^Date:'
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://example.com
Content-Type: text/plain; charset=utf-8
Content-Length: 17

boshqa sayt uchun
```

- Preflight'ni qo'lda yuborib, server javobini tekshirish mumkin — CORS sozlamasini sinashning qulay usuli.
- `curl` `Access-Control-Allow-Origin` ga qaramay, tanani ko'rsatdi: **CORS'ni faqat brauzer qo'llaydi**. Shuning uchun CORS — maxfiy ma'lumotni himoya qilish vositasi emas; himoya — autentifikatsiya (16-bob).

## Standartda nima deyilgan

CORS hozir **Fetch Standard** (WHATWG) ichida ta'riflangan; eski W3C CORS tavsiyasi (2014) eskirgan.

| Bo'lim (Fetch) | Nima |
| --- | --- |
| 3.3 CORS protocol | `Origin`, `Access-Control-*` header'lari |
| 3.3.5 CORS protocol and credentials | Credentials bilan `*` taqiqlangan |
| 4.8 CORS-preflight fetch | Oldindan tekshiruv qachon va qanday |
| 4.9 CORS-preflight cache | `Access-Control-Max-Age` bo'yicha kesh |
| "CORS-safelisted request-header" | Preflight talab qilmaydigan header'lar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| CORS'ni xavfsizlik vositasi deb hisoblash | `curl` va server-server so'rovlari unga qaramaydi; oddiy so'rov serverga yetadi | Autentifikatsiya + CSRF himoyasi |
| `Access-Control-Allow-Origin: *` + cookie | Brauzer bloklaydi (8-sinov) | Aniq origin + `Access-Control-Allow-Credentials: true` |
| `Origin` ni tekshirmasdan javobga qaytarish (har qanday origin'ga ruxsat) | Credentials bilan — istalgan sayt foydalanuvchi ma'lumotini o'qiydi | Ruxsat etilganlar ro'yxati bilan solishtirish |
| Dinamik `ACAO` da `Vary: Origin` yo'q | Kesh bir origin javobini boshqasiga beradi | `Vary: Origin` |
| `OPTIONS` ga javob bermaslik (`404`/`405`) | Preflight muvaffaqiyatsiz — asosiy so'rov ketmaydi | `OPTIONS` ga CORS header'lari bilan `204` |
| "CORS xatosi — server ishlamayapti" | Ko'pincha so'rov bajarilgan, faqat header yetishmaydi | Konsoldagi aniq sababni o'qish |
| Maxsus header'ni JavaScript'da o'qiy olmaslik | `Expose-Headers` yo'q | `Access-Control-Expose-Headers: X-Jami` |

## Amaliyot

1. CORS nima uchun kerak va uni kim qo'llaydi?
2. Qachon so'rov "oddiy" bo'ladi? `Content-Type: application/json` bilan `POST` oddiymi?
3. Preflight so'rovida qanday header'lar bor va server nima javob berishi kerak?
4. Sinovda preflight rad etilganda asosiy `POST` serverga bordimi? Oddiy so'rov bloklanganda-chi?
5. Cookie bilan so'rovga server qanday javob berishi kerak?
6. Nega CORS maxfiy API'ni himoya qilmaydi?

<details>
<summary>Javoblar</summary>

1. Boshqa origin'dagi resursni JavaScript o'qishiga server ruxsat berishi uchun. Brauzer qo'llaydi.
2. `GET`/`HEAD`/`POST`, faqat safelisted header'lar, `Content-Type` — `application/x-www-form-urlencoded`, `multipart/form-data` yoki `text/plain`. JSON bilan `POST` — oddiy emas, preflight bo'ladi.
3. `OPTIONS`, `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`. Server: `Access-Control-Allow-Origin`, `-Allow-Methods`, `-Allow-Headers`, ixtiyoriy `-Max-Age`.
4. Preflight rad etilganda — yo'q, faqat `OPTIONS` keldi. Oddiy so'rov bloklanganda — ha, so'rov yetdi, faqat javob sahifaga berilmadi.
5. Aniq origin (`*` emas) va `Access-Control-Allow-Credentials: true`; dinamik bo'lsa — `Vary: Origin`.
6. CORS faqat brauzerdagi JavaScript'ning javobni o'qishini boshqaradi; `curl` yoki boshqa server header'larga qaramaydi.

</details>

## Rasmiy hujjat

- [MDN: Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN: Access-Control-Allow-Origin](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Access-Control-Allow-Origin)
- [Fetch Standard: CORS protocol](https://fetch.spec.whatwg.org/#http-cors-protocol)
