# 22 — Clickjacking va himoya header'lari

[Mundarija](README.md)

## Tushuncha

Bu bobda server javobiga qo'shiladigan uchta oddiy, lekin muhim header: freymga qo'yishni cheklash, `Referer` da qancha ma'lumot ketishi va MIME turini taxmin qilishni taqiqlash.

### Clickjacking

MDN (Clickjacking): **clickjacking** — foydalanuvchini maqsadli saytda o'zi istamagan amalni bajarishga aldash. Boshqa sayt maqsadli saytni ko'rinmas `<iframe>` ga joylaydi va uning tugmasi ustiga o'zining "jozibali" elementini qo'yadi. Foydalanuvchi o'sha elementni bosdim deb o'ylaydi, aslida ko'rinmas freymdagi tugmani bosadi — va u saytga kirgan bo'lsa, so'rov uning haqiqiy cookie'lari bilan ketadi.

Hujum maqsadli sayt **boshqa sayt ichida freymga qo'yilishi**ga tayanadi. Asosiy himoya — buni taqiqlash yoki cheklash (MDN):

| Vosita | Nima qiladi |
| --- | --- |
| CSP **`frame-ancestors`** | Sahifani qaysi ota sahifalar (`<iframe>`, `<frame>`, `<object>`, `<embed>`) joylashtira olishini aniq belgilaydi: `'none'`, `'self'`, aniq origin'lar |
| **`X-Frame-Options`** | Qo'polroq: `DENY` — hech qayerda; `SAMEORIGIN` — faqat bir origin'dagi sahifalarda. `ALLOW-FROM` — eskirgan, zamonaviy brauzerlar butun header'ni e'tiborsiz qoldiradi |

- `frame-ancestors` — `X-Frame-Options` ning o'rnini bosuvchi. Ikkalasi ham bo'lsa, `frame-ancestors` ni biladigan brauzer `X-Frame-Options` ga qaramaydi; eski brauzerlar uchun ikkalasini yuborish mumkin.
- `frame-ancestors` `default-src` dan **meros olmaydi** — yozilmasa, hamma narsa ruxsat.
- Ikkalasi ham faqat **HTTP header'ida** ishlaydi: `<meta>` da `X-Frame-Options` ta'sir qilmaydi, `frame-ancestors` ni `<meta>` CSP qo'llamaydi (MDN).
- Qo'shimcha qatlam: sessiya cookie'si `SameSite=Lax` yoki `Strict` — boshqa saytdagi freym ichidan kelgan so'rovda cookie yuborilmaydi (14, 20-boblar).

### `Referrer-Policy`

Brauzer so'rovga **`Referer`** header'ini qo'shadi — so'rov qaysi sahifadan ketgani. (Header nomidagi imlo xatosi — tarixiy; `Referrer-Policy` da xato yo'q.) URL'da yo'l va so'rov qatori bor — ularda shaxsiy ma'lumot bo'lishi mumkin (2-bob: sessiya ID, token, qidiruv so'zi).

MDN: **`Referrer-Policy`** `Referer` da qancha ma'lumot ketishini boshqaradi:

| Qiymat | Bir origin'ga | Boshqa origin'ga | HTTPS → HTTP |
| --- | --- | --- | --- |
| `no-referrer` | Yo'q | Yo'q | Yo'q |
| `same-origin` | To'liq URL | Yo'q | Yo'q |
| `origin` | Faqat origin | Faqat origin | Faqat origin |
| `strict-origin` | Faqat origin | Faqat origin | Yo'q |
| **`strict-origin-when-cross-origin`** (standart) | To'liq URL | Faqat origin | Yo'q |
| `origin-when-cross-origin` | To'liq URL | Faqat origin | Faqat origin |
| `no-referrer-when-downgrade` | To'liq URL | To'liq URL | Yo'q |
| `unsafe-url` | To'liq URL | To'liq URL | To'liq URL — MDN ogohlantiradi: shaxsiy ma'lumot ochiq ulanishlarga oqadi |

Siyosat yozilmasa yoki noto'g'ri bo'lsa — `strict-origin-when-cross-origin` (2020-yil noyabrdan; avval `no-referrer-when-downgrade` edi).

### `X-Content-Type-Options: nosniff`

9-bobda ko'rdik: brauzer MIME turini ba'zan **taxmin qiladi** (sniffing). MDN: `nosniff` — "`Content-Type` ataylab qo'yilgan, unga amal qil":

- `script` yoki `style` uchun so'rovda MIME turi mos bo'lmasa (JavaScript turi yoki `text/css` emas) — javob **bloklanadi**;
- boshqa javoblarda brauzer taxmin qilmaydi: `text/plain` deb kelgan fayl ichida HTML bo'lsa ham HTML deb o'qilmaydi. Bu foydalanuvchi yuklagan faylni HTML yoki skript sifatida ishga tushirishga qaratilgan XSS'ni to'sadi.

## Ko'rib chiqamiz

Namuna server — ikki origin: **A** (`http://localhost:8103`) — bizning sayt, **B** (`http://127.0.0.1:8103`) — boshqa sayt.

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

FREYM = {'/oddiy': {},
         '/xfo-deny': {'X-Frame-Options': 'DENY'},
         '/fa-self': {'Content-Security-Policy': "frame-ancestors 'self'"},
         '/fa-ruxsat': {'Content-Security-Policy': 'frame-ancestors http://127.0.0.1:8103'}}
SIYOSAT = {'/maqola-standart': None, '/maqola-no-referrer': 'no-referrer',
           '/maqola-origin': 'origin', '/maqola-unsafe-url': 'unsafe-url'}


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def javob(self, matn, tur='text/html; charset=utf-8', h=None):
        tana = matn.encode()
        self.send_response(200)
        for k, v in (h or {}).items():
            self.send_header(k, v)
        self.send_header('Content-Type', tur)
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_GET(self):
        yol = urlsplit(self.path).path
        if yol in FREYM:
            return self.javob(f'<p>{yol} sahifasi</p>', h=FREYM[yol])
        if yol in SIYOSAT:                       # maqola sahifasi: ikki joyga so'rov yuboradi
            h = {'Referrer-Policy': SIYOSAT[yol]} if SIYOSAT[yol] else {}
            return self.javob('<img src="/qabul"><img src="http://127.0.0.1:8103/qabul">', h=h)
        if yol == '/qabul':
            print(f'{self.headers.get("Host"):15} Referer={self.headers.get("Referer")}', flush=True)
            return self.javob('', 'image/svg+xml')
        if yol == '/yuklangan.txt':              # foydalanuvchi yuklagan "matn" fayl
            return self.javob('window.yuklanganIshladi = true;', 'text/plain')
        if yol == '/yuklangan-nosniff.txt':
            return self.javob('window.nosniffIshladi = true;', 'text/plain', {'X-Content-Type-Options': 'nosniff'})
        self.javob('<!doctype html><title>sahifa</title>')

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Chromium 158:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const A = 'http://localhost:8103', B = 'http://127.0.0.1:8103'
const b = await chromium.launch(); const p = await b.newPage()
const konsol = []; p.on('console', m => konsol.push(m.text()))
// 1) freymga qo'yish: B sahifasi A'ning sahifalarini iframe'ga oladi
await p.goto(B + '/')
await p.evaluate(A => Promise.all(['/oddiy', '/xfo-deny', '/fa-self', '/fa-ruxsat'].map(y => new Promise(r => {
  const f = document.createElement('iframe'); f.src = A + y; f.onload = r; document.body.append(f) }))), A)
await p.waitForTimeout(500)
for (const f of p.frames().slice(1)) {
  let ichi; try { ichi = await f.evaluate(() => document.body?.textContent || '(bo\'sh)') } catch (e) { ichi = 'xato' }
  console.log('freym', f.url().replace(A, 'A'), '->', ichi)
}
for (const k of konsol.filter(k => k.includes('frame'))) console.log('  [konsol]', k.slice(0, 160))
// 2) nosniff: text/plain faylni skript sifatida ulash
await p.evaluate(A => Promise.all(['/yuklangan.txt', '/yuklangan-nosniff.txt'].map(y => new Promise(r => {
  const s = document.createElement('script'); s.src = A + y; s.onload = s.onerror = r; document.head.append(s) }))), A)
console.log('nosniff\'siz text/plain skript:', await p.evaluate(() => window.yuklanganIshladi ?? 'bajarilmadi'))
console.log('nosniff bilan text/plain skript:', await p.evaluate(() => window.nosniffIshladi ?? 'bajarilmadi'))
for (const k of konsol.filter(k => k.includes('MIME'))) console.log('  [konsol]', k.slice(0, 160))
// 3) Referrer-Policy: A'dagi maqola sahifasi /qabul ni o'zidan va B'dan so'raydi
for (const y of ['/maqola-standart', '/maqola-no-referrer', '/maqola-origin', '/maqola-unsafe-url']) {
  await p.goto(A + y + '?mavzu=git&id=42'); await p.waitForTimeout(300)
}
console.log('chromium', b.version())
await b.close()
```

```text tashqi
freym A/oddiy -> /oddiy sahifasi
freym chrome-error://chromewebdata/ -> (bo'sh)
freym chrome-error://chromewebdata/ -> (bo'sh)
freym A/fa-ruxsat -> /fa-ruxsat sahifasi
  [konsol] Refused to display 'http://localhost:8103/' in a frame because it set 'X-Frame-Options' to 'deny'.
  [konsol] Framing 'http://localhost:8103/' violates the following Content Security Policy directive: "frame-ancestors 'self'". The request has been blocked.
nosniff'siz text/plain skript: true
nosniff bilan text/plain skript: bajarilmadi
```

### Freymga qo'yish

| A sahifasi | Header | B ichida |
| --- | --- | --- |
| `/oddiy` | Yo'q | **Ko'rsatildi** — himoyasiz sahifa istalgan saytda freymga qo'yiladi |
| `/xfo-deny` | `X-Frame-Options: DENY` | Bloklandi — freym o'rnida brauzerning xato sahifasi (`chrome-error://`) |
| `/fa-self` | `frame-ancestors 'self'` | Bloklandi — B boshqa origin |
| `/fa-ruxsat` | `frame-ancestors http://127.0.0.1:8103` | Ko'rsatildi — B ro'yxatda |

### `nosniff`

Bir xil skript matni `text/plain` bilan:

- `nosniff` siz — Chromium uni **skript sifatida bajardi** (`true`, kuzatildi). Ya'ni foydalanuvchi yuklagan "matn" fayl, kimdir unga `<script src>` bilan havola qilsa, kod bo'lib ishlashi mumkin.
- `nosniff` bilan — bajarilmadi: MIME turi JavaScript emas.

### `Referer`

A'dagi `/maqola-…?mavzu=git&id=42` sahifasi ikkita rasm so'raydi: o'z origin'idan (`localhost`) va B'dan (`127.0.0.1`). Server ko'rgan `Referer`:

```text tashqi
localhost:8103  Referer=http://localhost:8103/maqola-standart?mavzu=git&id=42
127.0.0.1:8103  Referer=http://localhost:8103/
localhost:8103  Referer=None
127.0.0.1:8103  Referer=None
localhost:8103  Referer=http://localhost:8103/
127.0.0.1:8103  Referer=http://localhost:8103/
localhost:8103  Referer=http://localhost:8103/maqola-unsafe-url?mavzu=git&id=42
127.0.0.1:8103  Referer=http://localhost:8103/maqola-unsafe-url?mavzu=git&id=42
```

| Siyosat | O'z origin'iga | Boshqa origin'ga |
| --- | --- | --- |
| Yozilmagan (standart `strict-origin-when-cross-origin`) | To'liq URL, so'rov qatori bilan | **Faqat origin** |
| `no-referrer` | Yo'q | Yo'q |
| `origin` | Faqat origin | Faqat origin |
| `unsafe-url` | To'liq URL | **To'liq URL** — `id=42` boshqa saytga ketdi |

Standart siyosat boshqa saytlarga yo'l va so'rov qatorini bermaydi. `unsafe-url` esa URL'dagi hamma narsani tashqi saytlarga uzatadi.

### Haqiqiy sayt

```text vps
$ curl -s -D - -o /dev/null https://github.com/ | tr -d '\r' | grep -i '^x-frame-options\|^x-content-type-options\|^referrer-policy'
x-frame-options: DENY
```

GitHub o'z sahifasini hech qayerda freymga qo'yishga ruxsat bermaydi (`DENY`). Bu so'rovga javobda `X-Content-Type-Options` va `Referrer-Policy` chiqmadi (kuzatildi) — yo'q bo'lsa, brauzer standart `strict-origin-when-cross-origin` ni qo'llaydi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| W3C CSP Level 3 — `frame-ancestors` | Barcha ota freymlar tekshiriladi; bittasi mos kelmasa — yuklash bekor |
| RFC 7034 (2013-yil oktabr) | `X-Frame-Options` (axborot hujjati) |
| W3C Referrer Policy | Qiymatlar va ularning ta'siri |
| Fetch Standard | Standart siyosat — `strict-origin-when-cross-origin`; `nosniff` bo'yicha bloklash |
| WHATWG MIME Sniffing | Brauzer turni qanday taxmin qiladi |
| OWASP Clickjacking Defense Cheat Sheet | Himoya usullari |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Freym himoyasiz sahifa | Istalgan sayt uni ko'rinmas freymga joylaydi (sinovda `/oddiy` ko'rsatildi) | `frame-ancestors 'self'` (yoki `'none'`) + `X-Frame-Options` |
| `X-Frame-Options` ni `<meta>` da yozish | Ta'sir qilmaydi (MDN) | HTTP header |
| `X-Frame-Options: ALLOW-FROM …` | Eskirgan, butun header e'tiborsiz qoldiriladi | `frame-ancestors <origin>` |
| `frame-ancestors` ni `default-src` qamraydi deb o'ylash | Meros olmaydi | Alohida yozish |
| Tokenni URL'da va `unsafe-url` | Token boshqa saytlarga `Referer` da ketadi | Standart siyosat yoki qattiqroq; tokenni URL'da saqlamaslik |
| Foydalanuvchi fayllarini `nosniff` siz berish | Fayl skript yoki HTML sifatida ishlashi mumkin (sinovda `true`) | `X-Content-Type-Options: nosniff` va to'g'ri `Content-Type` |
| Header'larni faqat bosh sahifaga qo'yish | Boshqa sahifalar va resurslar himoyasiz | Server darajasida barcha javoblarga |

## Amaliyot

1. Clickjacking nimaga tayanadi va asosiy himoya qaysi?
2. `X-Frame-Options: SAMEORIGIN` va `frame-ancestors 'self'` farqi bormi? Qachon `frame-ancestors` kerak bo'ladi?
3. Sinovda `/fa-ruxsat` B ichida nega ko'rsatildi, `/fa-self` esa yo'q?
4. Standart `Referrer-Policy` boshqa saytga qanday `Referer` yuboradi?
5. `nosniff` nimani to'sadi? Sinovda u qanday ko'rindi?
6. Sessiya cookie'sining `SameSite` atributi clickjacking'ga qanday yordam beradi?

<details>
<summary>Javoblar</summary>

1. Sahifaning boshqa sayt ichida (ko'rinmas) freymga qo'yilishiga. Himoya — `frame-ancestors` va `X-Frame-Options`.
2. Ma'nosi yaqin; `frame-ancestors` aniqroq: bir nechta aniq origin'ga ruxsat berish mumkin. `X-Frame-Options` faqat `DENY`/`SAMEORIGIN`.
3. `/fa-ruxsat` B origin'iga aniq ruxsat bergan; `/fa-self` faqat o'z origin'iga.
4. Faqat origin (`http://localhost:8103/`), yo'l va so'rov qatorisiz; HTTPS'dan HTTP'ga — umuman yubormaydi.
5. MIME turi mos bo'lmagan skript/stilni bloklaydi va turni taxmin qilishni o'chiradi. Sinovda `text/plain` fayl `nosniff` siz skript bo'lib ishladi, `nosniff` bilan — yo'q.
6. Boshqa saytdagi freym ichidan kelgan so'rovda `Lax`/`Strict` cookie yuborilmaydi — foydalanuvchi "kirmagan" bo'lib qoladi.

</details>

## Rasmiy hujjat

- [MDN: Clickjacking](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Clickjacking)
- [MDN: CSP frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors) · [X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options)
- [MDN: Referrer-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy)
- [MDN: X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options)
- [W3C: Referrer Policy](https://www.w3.org/TR/referrer-policy/)
- [OWASP: Clickjacking Defense Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking_Defense_Cheat_Sheet.html)
