# 18 — Same-origin siyosati

[Mundarija](README.md)

## Tushuncha

MDN (Same-origin policy): **bir origin siyosati** (same-origin policy) — bir origin'dan yuklangan hujjat yoki skript boshqa origin'dagi resurs bilan qanday ishlay olishini cheklaydigan muhim xavfsizlik mexanizmi. Misol: foydalanuvchi pochtasiga kirgan; u ochgan begona sayt brauzerda JavaScript ishga tushirib, pochtadagi xatlarni (yoki tashqaridan ko'rinmaydigan ichki tarmoqdagi kompaniya saytini) o'qib, hujumchiga yubora olmasligi kerak.

### Origin

2-bobdan: origin — **sxema**, **xost** va **port** uchligi. `http://store.company.com/dir/page.html` bilan solishtirish (MDN):

| URL | Natija | Sabab |
| --- | --- | --- |
| `http://store.company.com/dir2/other.html` | Bir origin | Faqat yo'l farqli |
| `http://store.company.com/dir/inner/another.html` | Bir origin | Faqat yo'l farqli |
| `https://store.company.com/page.html` | Boshqa | Sxema |
| `http://store.company.com:81/dir/page.html` | Boshqa | Port (`http` — 80) |
| `http://news.company.com/dir/page.html` | Boshqa | Xost |

Maxsus holatlar (MDN):

- `about:blank` va `javascript:` URL'lar uni ochgan hujjatning origin'ini **meros oladi**.
- `data:` URL — yangi, bo'sh xavfsizlik konteksti.
- `file:///` — zamonaviy brauzerlarda odatda **shaffof bo'lmagan origin** (2-bob): bir papkadagi fayllar ham bir origin hisoblanmaydi.
- `document.domain` bilan origin'ni o'zgartirish — **eskirgan** (deprecated): himoyani zaiflashtiradi.

### Nima mumkin, nima mumkin emas

MDN: boshqa origin bilan o'zaro ta'sir uch turga bo'linadi:

| Turi | Odatda | Misollar |
| --- | --- | --- |
| **Yozish** (write) | **Ruxsat** | Havolalar, redirect'lar, forma yuborish. Ba'zi so'rovlar oldindan tekshiruv (preflight) talab qiladi (19-bob) |
| **Joylashtirish** (embed) | **Ruxsat** | `<script src>`, `<link rel="stylesheet">`, `<img>`, `<video>`/`<audio>`, `@font-face`, `<iframe>` |
| **O'qish** (read) | **Taqiqlangan** | Boshqa origin javobining tanasini JavaScript bilan o'qish. Lekin joylashtirish orqali ba'zi ma'lumot "sizib chiqadi": rasm o'lchami, skript nima qilgani |

Joylashtirishdagi tafsilotlar (MDN): boshqa origin'dagi skriptning sintaksis xatosi tafsilotlari ko'rsatilmaydi; boshqa origin CSS'i to'g'ri `Content-Type` talab qiladi; `<iframe>` ga qo'yishni server `X-Frame-Options` bilan taqiqlay oladi (22-bob).

**Oynalar o'rtasida** (`iframe.contentWindow`, `window.opener`…) boshqa origin'dagi `Window` va `Location` ga juda cheklangan kirish bor: masalan, `postMessage()`, `close()`, `focus()`, `location` ga **yozish** (`location.href` faqat yozish uchun). Boshqa origin bilan aloqa uchun — **`window.postMessage()`**.

**Brauzer omborlari** — Web Storage (`localStorage`) va IndexedDB — **origin bo'yicha** ajratilgan. Cookie'larda esa boshqa qoidalar (14-bob: `Domain`, `Path`).

### Ruxsat berish va to'sish

- Boshqa origin'ga ruxsat — **CORS** (19-bob): server qaysi origin'lar o'qishi mumkinligini aytadi.
- Boshqa origin'dan **yozish**ni to'sish — so'rovda taxmin qilib bo'lmaydigan **CSRF token**ni tekshirish (20-bob).
- Boshqa origin'dan **o'qish**ni to'sish — resurs joylashtirilmaydigan bo'lsin.
- Joylashtirishni to'sish — resurs yuqoridagi joylashtiriladigan formatlardan biri sifatida talqin qilinmasin (brauzer `Content-Type` ga har doim ham qaramaydi).

## Ko'rib chiqamiz

Bitta Python serveri ikki origin sifatida: **A** — `http://localhost:8099` ("pochta"), **B** — `http://127.0.0.1:8099` ("begona sahifa"); xost har xil — origin har xil. Server har so'rovni `Origin` header'i bilan jurnalga yozadi:

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

FAYLLAR = {
    '/maxfiy.json': ('application/json', '{"xatlar": 3, "egasi": "ali"}'),
    '/rasm.svg': ('image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40"/>'),
    '/skript.js': ('text/javascript', 'window.begonaSkriptIshladi = true;'),
    '/ichki.html': ('text/html; charset=utf-8', '''<!doctype html><p>A sayt ichki sahifasi</p>
<script>
addEventListener('message', (e) => {
  if (e.origin !== 'http://127.0.0.1:8099') return;          // faqat kutilgan origin'dan
  e.source.postMessage('A javobi: ' + e.data, e.origin);       // javob faqat o'sha origin'ga
});
</script>'''),
    '/': ('text/html; charset=utf-8', '<!doctype html><title>sahifa</title><p>bosh sahifa</p>'),
}


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        print(f'{self.command} {self.headers.get("Host")}{self.path}  Origin: {self.headers.get("Origin")}', flush=True)
        tur, matn = FAYLLAR.get(self.path, ('text/plain', 'topilmadi'))
        tana = matn.encode()
        self.send_response(200 if self.path in FAYLLAR else 404)
        self.send_header('Content-Type', tur)
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_POST(self):
        self.rfile.read(int(self.headers.get('Content-Length', 0)))
        self.do_GET()

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', 8099), Ishlovchi).serve_forever()
```

Chromium 158 da avval A sahifasida `localStorage` ga yozildi, keyin B sahifasidan A resurslariga murojaat:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const A = 'http://localhost:8099', B = 'http://127.0.0.1:8099'
const b = await chromium.launch(); const p = await b.newPage()
p.on('console', m => { if (m.type() === 'error') console.log('  [konsol]', m.text()) })
await p.goto(A + '/'); await p.evaluate(() => localStorage.setItem('kalit', 'A saytniki'))
await p.goto(B + '/')
const n = await p.evaluate(async (A) => {
  const o = []; const log = s => o.push(s)
  log('origin: ' + location.origin)
  try { const r = await fetch(A + '/maxfiy.json'); log('1 fetch: ' + await r.text()) } catch (e) { log('1 fetch: ' + e.name + ': ' + e.message) }
  const r2 = await fetch(A + '/maxfiy.json', { mode: 'no-cors' })
  log(`2 no-cors: type=${r2.type} status=${r2.status} tana="${await r2.text()}"`)
  const img = new Image(); img.src = A + '/rasm.svg'; await img.decode()
  log(`3 <img>: yuklandi, o'lchami ${img.naturalWidth}x${img.naturalHeight}`)
  await new Promise(res => { const s = document.createElement('script'); s.src = A + '/skript.js'; s.onload = res; document.head.append(s) })
  log('4 <script>: begonaSkriptIshladi = ' + window.begonaSkriptIshladi)
  const f = document.createElement('iframe'); f.src = A + '/ichki.html'; document.body.append(f)
  await new Promise(res => f.onload = res)
  try { f.contentWindow.document.body.textContent } catch (e) { log('5 iframe document: ' + e.name) }
  try { f.contentWindow.location.href } catch (e) { log('5 iframe location.href o\'qish: ' + e.name) }
  const javob = new Promise(res => addEventListener('message', e => res(`${e.data} (origin: ${e.origin})`), { once: true }))
  f.contentWindow.postMessage('salom', A)
  log('6 postMessage: ' + await javob)
  log('7 localStorage.kalit: ' + localStorage.getItem('kalit'))
  const fm = document.createElement('form'); fm.method = 'POST'; fm.action = A + '/forma'; fm.target = 'nishon'
  const nishon = document.createElement('iframe'); nishon.name = 'nishon'; document.body.append(nishon, fm)
  const yuklandi = new Promise(res => nishon.onload = res); fm.submit(); await yuklandi
  log('8 forma POST: yuborildi')
  return o.join('\n')
}, A)
console.log(n)
console.log('chromium', b.version())
await b.close()
```

Natija:

```text tashqi
origin: http://127.0.0.1:8099
1 fetch: TypeError: Failed to fetch
2 no-cors: type=opaque status=0 tana=""
3 <img>: yuklandi, o'lchami 120x40
4 <script>: begonaSkriptIshladi = true
5 iframe document: SecurityError
5 iframe location.href o'qish: SecurityError
6 postMessage: A javobi: salom (origin: http://localhost:8099)
7 localStorage.kalit: null
8 forma POST: yuborildi
```

Brauzer konsoli:

```text tashqi
  [konsol] Access to fetch at 'http://localhost:8099/maxfiy.json' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Server jurnali:

```text tashqi
GET localhost:8099/  Origin: None
GET 127.0.0.1:8099/  Origin: None
GET localhost:8099/maxfiy.json  Origin: http://127.0.0.1:8099
GET localhost:8099/maxfiy.json  Origin: None
GET localhost:8099/rasm.svg  Origin: None
GET localhost:8099/skript.js  Origin: None
GET localhost:8099/ichki.html  Origin: None
POST localhost:8099/forma  Origin: http://127.0.0.1:8099
```

| # | Nima qilindi | Natija | Ma'nosi |
| --- | --- | --- | --- |
| 1 | `fetch()` bilan JSON'ni o'qish | `TypeError`, konsolda CORS xatosi | **O'qish taqiqlangan**. Lekin jurnalga qarang: so'rov serverga **yetib bordi** (`Origin: http://127.0.0.1:8099`) — brauzer faqat **javobni** sahifaga bermadi |
| 2 | `mode: 'no-cors'` | `opaque`, status `0`, tana bo'sh | So'rov ketdi, javob "yopiq quti" — ichini ko'rib bo'lmaydi |
| 3 | `<img>` | Yuklandi, o'lcham ma'lum | **Joylashtirish ruxsat**; o'lcham — MDN aytgan "sizib chiqadigan" ma'lumot |
| 4 | `<script src>` | Skript **bajarildi** | Joylashtirish ruxsat. Shuning uchun begona skript — sahifaga to'liq ishonch (24-bob) |
| 5 | `iframe` ichidagi `document` va `location.href` ni o'qish | `SecurityError` | Oynalar o'rtasida cheklangan kirish |
| 6 | `postMessage` | A javob qaytardi | Origin'lar o'rtasidagi **to'g'ri** aloqa usuli. A sahifasi `e.origin` ni tekshiradi va javobni faqat o'sha origin'ga yuboradi |
| 7 | B'dan `localStorage` | `null` | Ombor origin bo'yicha ajratilgan |
| 8 | B'dan A'ga forma `POST` | Yuborildi, serverga yetdi | **Yozish ruxsat** — CSRF'ning asosi (20-bob) |

Asosiy xulosa: same-origin siyosati **so'rovni** to'xtatmaydi, faqat **javobni o'qish**ni. Server tomondagi o'zgartiruvchi amallarni bu siyosat himoya qilmaydi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| HTML Living Standard (WHATWG) — Origin, Cross-origin objects | Origin ta'rifi; boshqa origin'dagi `Window` va `Location` ga qaysi xossalar ochiq |
| Fetch Standard (WHATWG) | Boshqa origin so'rovi qachon CORS tekshiruvidan o'tadi; `no-cors` va shaffof bo'lmagan (`opaque`) javob |
| URL Standard (WHATWG) | `file:` origin'i — amalga oshirishga bog'liq (2-bob) |
| RFC 6454 (2011-yil dekabr) | "The Web Origin Concept" — origin tushunchasi IETF hujjatida |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "CORS xatosi — so'rov ketmadi" | So'rov serverga yetdi (jurnalda bor), faqat javob bloklandi | Serverdagi o'zgarishlarni CSRF himoyasi bilan to'sish |
| "Same-origin forma yuborishni to'xtatadi" | Yozish ruxsat (sinovda `POST` yetdi) | CSRF token, `SameSite` (20-bob) |
| Begona saytdan `<script src>` ni xavfsiz deb hisoblash | Skript sahifa origin'ida to'liq huquq bilan bajariladi | Faqat ishonchli manba, `integrity` (24-bob) |
| `postMessage` da `e.origin` ni tekshirmaslik | Istalgan sayt xabar yubora oladi | `if (e.origin !== kutilgan) return`; javobni aniq origin'ga |
| `postMessage(…, '*')` maxfiy ma'lumot bilan | Oyna boshqa origin'ga o'tgan bo'lsa, ma'lumot o'shanga ketadi | Ikkinchi argument — aniq origin |
| `document.domain` bilan origin'ni kengaytirish | Eskirgan, himoyani zaiflashtiradi (MDN) | `postMessage` yoki CORS |
| `file:///` da sahifa ochib, CORS xatosini "server xatosi" deb o'ylash | `file:` — shaffof bo'lmagan origin | Lokal server orqali ochish (`python3 -m http.server`) |

## Amaliyot

1. `https://app.example.com` va `https://app.example.com:443/kirish` bir origin'dami? `https://api.example.com` chi?
2. Boshqa origin bilan o'zaro ta'sirning uch turi va har birining odatiy qoidasi qanday?
3. Sinovda `fetch()` xato berdi. So'rov serverga yetdimi? Bu nimani anglatadi?
4. Nega boshqa origin'dagi rasmni ko'rsatish mumkin, lekin JSON'ni o'qib bo'lmaydi?
5. Ikki origin'dagi oynalar xavfsiz qanday aloqa qiladi va nimani tekshirish kerak?
6. `localStorage` boshqa origin bilan bo'lishiladimi?

<details>
<summary>Javoblar</summary>

1. Ha (443 — `https` standarti, yo'l hisobga olinmaydi). Yo'q — xost boshqa.
2. Yozish (havola, forma, redirect) — ruxsat; joylashtirish (`img`, `script`, `iframe`…) — ruxsat; o'qish — taqiqlangan.
3. Ha, jurnalda bor. Same-origin javobni o'qishni to'sadi, so'rovni emas — serverdagi amallarni alohida himoyalash kerak.
4. Joylashtirish ruxsat, lekin rasm ichidagi baytlarni JavaScript o'qimaydi; JSON'ni olish — o'qish, u taqiqlangan (CORS bo'lmasa).
5. `window.postMessage()`; qabul qiluvchi `event.origin` ni tekshiradi, yuboruvchi aniq maqsad origin'ni ko'rsatadi.
6. Yo'q — har origin'ning o'z ombori (sinovda B `null` oldi).

</details>

## Rasmiy hujjat

- [MDN: Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)
- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [HTML Standard: Origin](https://html.spec.whatwg.org/multipage/browsers.html#origin) · [Cross-origin objects](https://html.spec.whatwg.org/multipage/browsers.html#cross-origin-objects)
- [Fetch Standard](https://fetch.spec.whatwg.org/)
- [RFC 6454: The Web Origin Concept](https://www.rfc-editor.org/rfc/rfc6454)
