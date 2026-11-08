# 23 — Aralash kontent va xavfsiz kontekst

[Mundarija](README.md)

## Tushuncha

### Aralash kontent

MDN (Mixed content): sahifa HTTPS orqali yuklansa, ulanish shifrlangan — yo'ldagi tinglash va o'zgartirishdan (MITM, 28-bob) himoyalangan. Agar sahifadagi rasm, skript va boshqa resurslar ham HTTPS'dan kelsa, butun sahifa himoyalangan. **Aralash kontent** (mixed content) — HTTPS sahifa resursni **HTTP** (yoki boshqa xavfsiz bo'lmagan protokol) orqali yuklashi. Bunday resursni yo'lda o'qish yoki o'zgartirish mumkin: skript butun sahifani o'zgartira oladi, rasm ham noto'g'ri ma'lumot ko'rsatishi yoki tugma vazifasini o'zgartirib ko'rsatishi mumkin.

Brauzerlar aralash kontentni ikki toifaga bo'ladi (MDN):

| Toifa | Nima qilinadi | Resurslar |
| --- | --- | --- |
| **Yangilanadigan** (upgradable) | So'rov avtomatik `http` → `https` ga o'zgartiriladi; server javob beradi yoki "topilmadi" | `<img src>` (SVG ham), CSS rasmlari (`background-image`…), `<audio src>`, `<video src>`, `<source>` |
| **Bloklanadigan** (blockable) | So'rov **umuman yuborilmaydi** | `<script src>`, `<link href>` (stillar), `<iframe src>`, `fetch()`, `XMLHttpRequest`, CSS'dagi `url()` (shriftlar, kursor…), `<object data>`, `sendBeacon()`, `srcset`/`<picture>` dagi rasmlar |

- Ilgari ular "faol" (active) va "passiv" (passive) aralash kontent deb atalgan; yangi turlar bloklanadiganlar qatoriga qo'shilishi kutiladi.
- Xost **IP manzil** bo'lsa, yangilanadigan resurs ham yangilanmaydi — bloklanadi (`http://93.184.215.14/image.png`).
- **Lokal** resurslar (`file:`, `http://127.0.0.1/`, `http://localhost/`) xavfsiz origin kabi hisoblanadi.
- Xavfsiz sahifadan HTTP orqali **yuklab olish** (mixed download) ham xuddi shunday xavfli; brauzerlar uni bloklashi kerak.
- HTTPS sahifadan HTTP sahifaga **o'tish** (havola) aralash kontent emas — yangi kontekst yaratiladi.

### Xavfsiz kontekst

MDN (Secure contexts): **xavfsiz kontekst** (secure context) — autentifikatsiya va maxfiylik talablariga javob beradigan muhit (`Window` yoki `Worker`). Kuchli API'lar — foydalanuvchi maxfiyligiga, kompyuterga past darajada kirishga, hisob ma'lumotlariga tegadiganlari — faqat xavfsiz kontekstda. Aks holda MITM hujumchisi ularga kira olardi.

Hujjat xavfsiz kontekst, agar URL'i **ishonchli bo'lishi mumkin** (potentially trustworthy) bo'lsa:

- sxema `https`, `wss` yoki `file`;
- xost `127.0.0.0/8` yoki `::1`;
- xost `localhost` yoki `.localhost` bilan tugaydi (17-bobdagi `kitob.localhost`);
- `about:blank`, `about:srcdoc`, `data:`.

`iframe` ichidagi hujjat — o'zi ham, uni joylagan sahifa ham xavfsiz bo'lsagina. Dedicated/shared worker — egasi xavfsiz bo'lsa. Service Worker'ni faqat xavfsiz kontekst ro'yxatdan o'tkazadi. Tekshirish: `window.isSecureContext`.

Faqat xavfsiz kontekstdagi imkoniyatlarga misollar (MDN ro'yxatidan): Service Worker, Web Crypto (`crypto.subtle`), WebAuthn (`navigator.credentials`, 17-bob), geolokatsiya, `Clipboard` va boshqalar.

## Ko'rib chiqamiz

Lokal kompyuterda ikki server: **HTTPS** `8104` portda (o'z-o'zidan imzolangan sinov sertifikati bilan) va **HTTP** `8105` portda. Sinov domenlari `kitob.test` va `rasm.test` Chromium'ning `--host-resolver-rules` parametri bilan `127.0.0.1` ga yo'naltirildi. Sertifikat (OpenSSL 4.1.0):

```bash
openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout kalit.pem -out sert.pem -days 2 \
  -subj /CN=kitob.test -addext 'subjectAltName=DNS:kitob.test,DNS:rasm.test'
```

Bu sertifikatni hech qanday tasdiqlovchi markaz (CA) imzolamagan — brauzer unga ishonmaydi, shuning uchun Playwright'da `ignoreHTTPSErrors: true` (faqat sinov uchun; sertifikatlar — 26-bob).

```python
import ssl, sys, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SAHIFA = '''<!doctype html>
<img id="i1" src="http://rasm.test:8104/rasm.svg">
<img id="i2" src="http://127.0.0.1:8105/rasm.svg">
<script src="http://rasm.test:8105/skript.js"></script>
<p>sahifa</p>'''


def ishlovchi(sxema):
    class I(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'

        def do_GET(self):
            print(f'{sxema:5} {self.headers.get("Host")}{self.path}', flush=True)
            tur, matn = {'/rasm.svg': ('image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),
                         '/skript.js': ('text/javascript', 'window.skript = 1;'),
                         '/malumot': ('text/plain', 'ok')}.get(self.path, ('text/html; charset=utf-8', SAHIFA))
            tana = matn.encode()
            self.send_response(200)
            self.send_header('Content-Type', tur)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(tana)))
            self.end_headers()
            self.wfile.write(tana)

        def log_message(self, *a):
            pass
    return I


https = ThreadingHTTPServer(('127.0.0.1', 8104), ishlovchi('https'))
kontekst = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
kontekst.load_cert_chain(sys.argv[1], sys.argv[2])
https.socket = kontekst.wrap_socket(https.socket, server_side=True)
threading.Thread(target=https.serve_forever, daemon=True).start()
ThreadingHTTPServer(('127.0.0.1', 8105), ishlovchi('http')).serve_forever()
```

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const b = await chromium.launch({ args: ['--host-resolver-rules=MAP *.test 127.0.0.1'] })
const ctx = await b.newContext({ ignoreHTTPSErrors: true })   // o'z-o'zidan imzolangan sinov sertifikati
const p = await ctx.newPage()
p.on('console', m => { if (/Mixed Content/.test(m.text())) console.log('  [konsol]', m.text().slice(0, 400)) })
await p.goto('https://kitob.test:8104/'); await p.waitForTimeout(500)
console.log(await p.evaluate(async () => {
  const o = [`sahifa: ${location.origin} | isSecureContext=${isSecureContext}`]
  for (const id of ['i1', 'i2']) { const i = document.getElementById(id); o.push(`${id} ${i.getAttribute('src')} -> ${i.naturalWidth ? 'yuklandi' : 'yuklanmadi'}`) }
  o.push('skript.js -> ' + (window.skript ? 'bajarildi' : 'bajarilmadi'))
  try { await fetch('http://rasm.test:8105/malumot'); o.push('fetch http -> ok') } catch (e) { o.push('fetch http -> ' + e.name) }
  return o.join('\n')
}))
for (const url of ['https://kitob.test:8104/', 'http://kitob.test:8105/', 'http://localhost:8105/', 'http://127.0.0.1:8105/']) {
  await p.goto(url)
  console.log(url.padEnd(26), await p.evaluate(() => `isSecureContext=${isSecureContext} | crypto.subtle=${typeof crypto.subtle} | serviceWorker=${'serviceWorker' in navigator} | credentials=${'credentials' in navigator}`))
}
console.log('chromium', b.version())
await b.close()
```

### HTTPS sahifada HTTP resurslar

Sahifa `https://kitob.test:8104/` ichida: `rasm.test` dan HTTP rasm, `127.0.0.1` dan HTTP rasm, HTTP skript va HTTP `fetch()`.

```text tashqi
sahifa: https://kitob.test:8104 | isSecureContext=true
i1 http://rasm.test:8104/rasm.svg -> yuklandi
i2 http://127.0.0.1:8105/rasm.svg -> yuklandi
skript.js -> bajarilmadi
fetch http -> TypeError
```

Konsol:

```text tashqi
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure element 'http://rasm.test:8104/rasm.svg'. This request was automatically upgraded to HTTPS, For more information see https://blog.chromium.org/2019/10/no-more-mixed-messages-about-https.html
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure element 'http://127.0.0.1:8105/rasm.svg'. This request was not upgraded to HTTPS because its URL's host is an IP address.
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure element 'http://127.0.0.1:8105/rasm.svg'. This request was not upgraded to HTTPS because its URL's host is an IP address.
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure element 'http://rasm.test:8104/rasm.svg'. This request was automatically upgraded to HTTPS, For more information see https://blog.chromium.org/2019/10/no-more-mixed-messages-about-https.html
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure script 'http://rasm.test:8105/skript.js'. This request has been blocked; the content must be served over HTTPS.
  [konsol] Mixed Content: The page at 'https://kitob.test:8104/' was loaded over HTTPS, but requested an insecure resource 'http://rasm.test:8105/malumot'. This request has been blocked; the content must be served over HTTPS.
```

HTTPS sahifa sinovda ikki marta ochildi (ikkinchisi — pastdagi xavfsiz kontekst sinovi boshida), shuning uchun konsol va jurnalda qatorlar takrorlanadi.

Server jurnali (HTTPS sahifa ochilganda):

```text tashqi
https kitob.test:8104/
http  127.0.0.1:8105/rasm.svg
https rasm.test:8104/rasm.svg
https kitob.test:8104/
https rasm.test:8104/rasm.svg
http  127.0.0.1:8105/rasm.svg
```

| Resurs | Toifa | Natija |
| --- | --- | --- |
| `<img src="http://rasm.test:8104/rasm.svg">` | Yangilanadigan | Brauzer uni **`https://rasm.test:8104/`** ga o'zgartirdi — jurnalda `https rasm.test:8104/rasm.svg`. Yuklandi |
| `<img src="http://127.0.0.1:8105/rasm.svg">` | Yangilanadigan, lekin xost — IP | **Yangilanmadi** ("host is an IP address"). Shunga qaramay yuklandi — jurnalda `http 127.0.0.1:8105`: bu loopback manzil, MDN bo'yicha lokal resurslar xavfsiz hisoblanadi. Tashqi IP bo'lsa, bloklanardi |
| `<script src="http://rasm.test:8105/skript.js">` | Bloklanadigan | **Yuborilmadi** — jurnalda HTTPS sahifadan bunday so'rov yo'q; skript bajarilmadi |
| `fetch('http://rasm.test:8105/malumot')` | Bloklanadigan | `TypeError`, so'rov yuborilmadi |

### Qaysi sahifa xavfsiz kontekst

```text tashqi
https://kitob.test:8104/   isSecureContext=true | crypto.subtle=object | serviceWorker=true | credentials=true
http://kitob.test:8105/    isSecureContext=false | crypto.subtle=undefined | serviceWorker=false | credentials=false
http://localhost:8105/     isSecureContext=true | crypto.subtle=object | serviceWorker=true | credentials=true
http://127.0.0.1:8105/     isSecureContext=true | crypto.subtle=object | serviceWorker=true | credentials=true
```

| URL | Xavfsiz | Sabab |
| --- | --- | --- |
| `https://kitob.test:8104/` | Ha | `https` |
| `http://kitob.test:8105/` | **Yo'q** | Oddiy domen, `http` — `crypto.subtle`, Service Worker, `navigator.credentials` **yo'q** |
| `http://localhost:8105/` | Ha | `localhost` — ishlab chiqishda HTTPS'siz sinash mumkin |
| `http://127.0.0.1:8105/` | Ha | Loopback |

Amaliy xulosa: lokal kompyuterda (`localhost`) ishlagan kod, server domeniga **HTTP** bilan joylashtirilganda ishlamay qolishi mumkin — bu API'lar yo'qoladi. Production — doim HTTPS.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| W3C Mixed Content Level 2 | Yangilanadigan va bloklanadigan toifalar, avtomatik yangilash |
| W3C Secure Contexts | Xavfsiz kontekst va "potentially trustworthy" origin ta'rifi |
| CSP `upgrade-insecure-requests` | Sahifa ichidagi barcha `http` so'rovlarni `https` ga o'zgartirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| HTTPS saytda `http://` bilan skript yoki stil ulash | Bloklanadi — sayt buziladi (sinovda skript bajarilmadi) | `https://` yoki nisbiy URL (`/js/app.js`) |
| API'ga `http://` bilan `fetch()` | Bloklanadi (`TypeError`) | API'ni HTTPS'da |
| "Rasm baribir yangilanadi" deb `http://` qoldirish | Server HTTPS'da bermasa — rasm yo'q; IP xostda — bloklanadi | Barcha resurslar HTTPS |
| `localhost` da ishladi — serverda ham ishlaydi deb o'ylash | `http://domen` — xavfsiz kontekst emas, API'lar yo'q | Serverda HTTPS |
| O'z-o'zidan imzolangan sertifikatni foydalanuvchilarga | Brauzer ishonmaydi | Tasdiqlovchi markaz sertifikati (26-bob) |
| Sertifikat xatolarini kodda o'chirib qo'yish (`ignoreHTTPSErrors`, `curl -k`) production'da | MITM'dan himoya yo'qoladi | Faqat lokal sinovda |

## Amaliyot

1. Aralash kontent nima va nega xavfli?
2. Yangilanadigan va bloklanadigan aralash kontentga ikkitadan misol keltiring.
3. Sinovda `http://rasm.test:8104/rasm.svg` bilan nima bo'ldi? `skript.js` bilan-chi?
4. IP xostli rasm nega yangilanmadi?
5. Xavfsiz kontekst nima? `http://localhost` va `http://example.com` farqi?
6. Sizning sahifangiz `http://` da ochilgan. `crypto.subtle` va Service Worker ishlaydimi?

<details>
<summary>Javoblar</summary>

1. HTTPS sahifa resursni HTTP orqali yuklashi; resursni yo'lda o'qish yoki o'zgartirish mumkin, skript butun sahifani o'zgartira oladi.
2. Yangilanadigan: `<img src>`, `<video src>`. Bloklanadigan: `<script src>`, `fetch()` (yoki stil, `iframe`).
3. Rasm avtomatik `https://rasm.test:8104/` ga yangilanib yuklandi. Skript bloklandi, so'rov yuborilmadi.
4. Brauzer IP manzilli xost uchun yangilashni qilmaydi (MDN); bu holatda loopback bo'lgani uchun lokal resurs sifatida yuklandi.
5. Kuchli API'lar ishlaydigan muhit (HTTPS yoki lokal). `http://localhost` — xavfsiz, `http://example.com` — yo'q.
6. Domen `localhost` bo'lmasa — yo'q: ikkalasi faqat xavfsiz kontekstda.

</details>

## Rasmiy hujjat

- [MDN: Mixed content](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content)
- [MDN: Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts) · [Features restricted to secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts/features_restricted_to_secure_contexts)
- [W3C: Mixed Content](https://www.w3.org/TR/mixed-content/)
- [W3C: Secure Contexts](https://w3c.github.io/webappsec-secure-contexts/)
