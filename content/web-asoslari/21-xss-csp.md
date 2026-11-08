# 21 — XSS va CSP

[Mundarija](README.md)

## Tushuncha

MDN (XSS): **XSS** (cross-site scripting — saytlararo skript) — hujumchi saytni **begona kodni o'z kodi kabi bajarishga** majburlaydigan hujum. Brauzer turli saytlardan kod yuklaydi; same-origin siyosati ularni bir-biridan ajratadi (18-bob). XSS shu ajratishni chetlab o'tadi: begona kod saytning **o'z origin'ida** ishlaydi va sayt kodi qila oladigan hamma narsani qiladi — sahifa mazmuni va `localStorage` ni o'qish/o'zgartirish, foydalanuvchi cookie'lari bilan so'rov yuborish.

MDN: har qanday XSS ikki shartga tayanadi — sayt:

1. hujumchi tuzishi mumkin bo'lgan **kiritilgan ma'lumotni** qabul qiladi (URL parametri, izoh, profil nomi…);
2. uni sahifaga **xavfsizlantirmasdan** (sanitize qilmasdan) qo'yadi — u JavaScript sifatida bajarilishi mumkin bo'lib qoladi.

Kiritilgan ma'lumot bazaga saqlanib, boshqa foydalanuvchilarga ko'rsatilsa (blog izohlari) — **saqlanuvchi** (stored, persistent) XSS: MDN bo'yicha ayniqsa jiddiy, chunki sahifani ochgan hammaga ta'sir qiladi. Kod **serverda** (shablonga qo'yishda) yoki **brauzerda** (DOM'ni o'zgartirishda, masalan SPA'da) kiritilishi mumkin — himoya yondashuvi bir xil.

### Himoya 1: chiqishni ekranlash

MDN: **chiqishni ekranlash** (output encoding) — kiritilgan matndagi xavfli belgilarni almashtirish, shunda ular HTML emas, **matn** sifatida ko'rinadi. Zamonaviy shablon dvigatellari buni o'zi qiladi; masalan, Django:

| Belgi | Bo'ladi |
| --- | --- |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `'` | `&#x27;` |
| `"` | `&quot;` |
| `&` | `&amp;` |

React'da JSX ichidagi qiymatlar ham avtomatik ekranlanadi. MDN: ekranlashni puxta qiladigan, obro'li shablon dvigateli va uning hujjatidagi cheklovlarni bilish — XSS'ga qarshi eng muhim qadamlardan biri.

**Kontekst muhim** (MDN): bir joyda xavfsiz bo'lgan narsa boshqa joyda xavfli.

| Qayerga qo'yilyapti | Xavf |
| --- | --- |
| Teglar orasiga (HTML kontekst) | Shablon ekranlashi asosan shu uchun |
| Atribut qiymatiga | Ba'zi atributlar o'zi xavfli: hodisa ishlovchilari (`onblur`, `onclick`…), `<iframe src>`. Qiymat **qo'shtirnoqsiz** qo'yilsa, matn yangi atribut qo'shib yuborishi mumkin — doim qo'shtirnoq ichida |
| `<script>` yoki `<style>` ichiga | Deyarli har doim xavfli |

### Himoya 2: tozalash va Trusted Types

Matnni HTML sifatida qo'yish **kerak** bo'lsa (masalan, foydalanuvchi formatlagan matn), shablon ekranlashi o'chiriladi (Django `safe`, React `dangerouslySetInnerHTML`). MDN: unda **tozalash** (sanitization) — HTML'dan xavfli qismlarni (`<script>`, hodisa ishlovchilari) olib tashlash — majburiy, va uni o'zingiz yozmasdan obro'li kutubxona bilan qiling (ko'p mutaxassislar **DOMPurify** ni tavsiya qiladi).

Brauzerda matnni HTML deb talqin qiladigan API'lar: `innerHTML`, `outerHTML`, `insertAdjacentHTML()`, `document.write()`; matnni kod sifatida bajaradiganlar: `eval()`, `setTimeout()`/`setInterval()` ga satr berish. **Trusted Types** (CSP `require-trusted-types-for 'script'`) bilan bu API'larga oddiy satr berib bo'lmaydi — faqat siz yozgan tozalash siyosatidan o'tgan obyekt.

### Himoya 3: CSP

MDN (CSP): **Content Security Policy** — brauzerga sahifa qaysi skript va resurslarni yuklashi mumkinligini aytadigan siyosat. U **zaxira** himoya: ekranlash qayerdadir xato qilgan bo'lsa ham, kiritilgan kod bajarilmasin. MDN: CSP tozalashning **o'rnini bosmaydi** — ikkalasi birga.

CSP odatda `Content-Security-Policy` javob header'ida, direktivalar `;` bilan:

```http
Content-Security-Policy: default-src 'self'; img-src 'self' example.com
```

- `default-src` — boshqa direktiva yozilmagan resurslar uchun umumiy qoida; `'self'` — faqat sahifaning o'z origin'idan.
- `script-src`, `style-src`, `img-src`… — har resurs turi uchun.
- `'none'` — butunlay taqiq (masalan, `object-src 'none'`).

`script-src` (yoki `default-src`) bo'lsa, quyidagilar standart holatda **bajarilmaydi**: `<script>` ichidagi kod, hodisa ishlovchisi atributlari (`onclick="…"`), `javascript:` URL'lar; `eval()` ham taqiqlanadi.

**Nonce** (MDN tavsiyasi): server har javobga **yangi, taxmin qilib bo'lmaydigan** qiymat yaratadi va uni CSP'ga ham, o'zi qo'ygan har `<script nonce="…">` ga ham yozadi. Brauzer faqat nonce'i mos skriptni bajaradi. Kiritilgan kod nonce'ni bilmaydi. Nonce **har javobda boshqacha** bo'lishi shart — demak sahifa statik bo'lmaydi, shablon bilan yaratiladi. Muqobili — skript matnining **xeshi** (`'sha256-…'`).

**Qat'iy CSP** (strict CSP, MDN tavsiyasi) — manzillar ro'yxati emas, nonce yoki xeshga asoslangan:

```http
Content-Security-Policy:
  script-src 'nonce-{RANDOM}';
  object-src 'none';
  base-uri 'none';
```

Manzillar ro'yxatiga asoslangan CSP'ni to'g'ri yozish qiyin va ko'pincha bilmasdan xavfli domenlarga ruxsat beradi (MDN).

**Sinash**: `Content-Security-Policy-Report-Only` — siyosat **bloklamaydi**, faqat buzilishlar haqida hisobot yuboradi (`report-to` yoki eskirgan `report-uri`). Yangi siyosatni ishga tushirishdan oldin shu bilan tekshiriladi.

## Ko'rib chiqamiz

Namuna server (`http://localhost:8102`). Sinov matni zararsiz: `Salom <b>dunyo</b> & do'stlar` — unda `<b>` tegi bor; u **bajariladigan kod emas**, lekin brauzer uni HTML deb talqin qiladimi yoki matn deb — shuni ko'rsatadi. CSP sahifasida esa to'rt xil skript **o'zimiz yozganimiz**: nonce'li, nonce'siz, boshqa origin'dan va `onclick` atributi — kiritilgan kod qanday ko'rinishda bo'lishi mumkinligining namunalari.

```python
import html, json, secrets, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlsplit


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def javob(self, matn, tur='text/html; charset=utf-8', **h):
        tana = matn.encode()
        self.send_response(200)
        for k, v in h.items():
            self.send_header(k.replace('_', '-'), v)
        self.send_header('Content-Type', tur)
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def do_GET(self):
        url = urlsplit(self.path)
        matn = parse_qs(url.query).get('matn', [''])[0]
        if url.path == '/xom':                     # XATO: kiritilgan matn HTML sifatida
            return self.javob(f'<p id="izoh">{matn}</p>')
        if url.path == '/xavfsiz':                 # TO'G'RI: chiqishni ekranlash
            return self.javob(f'<p id="izoh">{html.escape(matn)}</p>')
        if url.path == '/tashqi.js':
            return self.javob('window.tashqi = "ishladi";', 'text/javascript')
        n = secrets.token_urlsafe(16)              # har javobga yangi nonce
        sahifa = f'''<!doctype html>
<script nonce="{n}">window.bizniki = "ishladi";</script>
<script>window.noncesiz = "ishladi";</script>
<script src="http://127.0.0.1:8102/tashqi.js"></script>
<button id="tugma" onclick="window.bosildi = 'ishladi'">bos</button>'''
        if url.path == '/csp':
            return self.javob(sahifa, Content_Security_Policy=f"script-src 'nonce-{n}'; object-src 'none'; base-uri 'none'")
        if url.path == '/csp-sinov':               # faqat hisobot, bloklamaydi
            return self.javob(sahifa, Content_Security_Policy_Report_Only=f"script-src 'nonce-{n}'; report-uri /hisobot")
        if url.path == '/tt':
            return self.javob(f'<div id="joy"></div><script nonce="{n}">window.tt = 1;</script>',
                              Content_Security_Policy=f"script-src 'nonce-{n}'; require-trusted-types-for 'script'")
        self.javob(sahifa)                         # /csp-yoq: siyosatsiz

    def do_POST(self):
        tana = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        h = json.loads(tana)['csp-report']
        print(f"hisobot: {self.headers.get('Content-Type')} | effective-directive={h.get('effective-directive')} "
              f"| blocked-uri={h.get('blocked-uri')} | disposition={h.get('disposition')}", flush=True)
        self.send_response(204)
        self.end_headers()

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Python hujjati: `html.escape(s)` `&`, `<`, `>` ni, standart holatda (`quote=True`) `"` va `'` ni ham xavfsiz ketma-ketlikka almashtiradi.

Chromium 158:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const A = 'http://localhost:8102'
const b = await chromium.launch(); const p = await b.newPage()
const konsol = []; p.on('console', m => { if (m.type() === 'error') konsol.push(m.text()) })
const matn = encodeURIComponent(`Salom <b>dunyo</b> & do'stlar`)
for (const yol of ['/xom', '/xavfsiz']) {
  await p.goto(`${A}${yol}?matn=${matn}`)
  const r = await p.evaluate(() => ({ html: document.querySelector('#izoh').innerHTML,
    matn: document.querySelector('#izoh').textContent, b: document.querySelectorAll('#izoh b').length }))
  console.log(`${yol}: <b> elementlari=${r.b} | innerHTML=${r.html}`)
}
for (const yol of ['/csp-yoq', '/csp', '/csp-sinov']) {
  konsol.length = 0
  await p.goto(A + yol); await p.click('#tugma'); await p.waitForTimeout(300)
  const r = await p.evaluate(() => [window.bizniki, window.noncesiz, window.tashqi, window.bosildi].map(x => x || '—').join(' | '))
  console.log(`${yol}: bizniki(nonce) | noncesiz | tashqi.js | onclick = ${r}`)
  for (const k of konsol) console.log('   [konsol]', k.slice(0, 150))
}
await p.goto(A + '/tt')
console.log('/tt:', await p.evaluate(() => {
  try { document.querySelector('#joy').innerHTML = 'matn'; return 'innerHTML qabul qilindi' } catch (e) { return e.name + ': ' + e.message.slice(0, 110) }
}))
console.log('chromium', b.version())
await b.close()
```

```text tashqi
/xom: <b> elementlari=1 | innerHTML=Salom <b>dunyo</b> &amp; do'stlar
/xavfsiz: <b> elementlari=0 | innerHTML=Salom &lt;b&gt;dunyo&lt;/b&gt; &amp; do'stlar
/csp-yoq: bizniki(nonce) | noncesiz | tashqi.js | onclick = ishladi | ishladi | ishladi | ishladi
/csp: bizniki(nonce) | noncesiz | tashqi.js | onclick = ishladi | — | — | —
   [konsol] Executing inline script violates the following Content Security Policy directive 'script-src 'nonce-wqIp-08l7tVMCLE8cqGooQ''. Either the 'unsafe-inlin
   [konsol] Loading the script 'http://127.0.0.1:8102/tashqi.js' violates the following Content Security Policy directive: "script-src 'nonce-wqIp-08l7tVMCLE8cqGo
   [konsol] Executing inline event handler violates the following Content Security Policy directive 'script-src 'nonce-wqIp-08l7tVMCLE8cqGooQ''. Either the 'unsaf
/csp-sinov: bizniki(nonce) | noncesiz | tashqi.js | onclick = ishladi | ishladi | ishladi | ishladi
/tt: TypeError: Failed to set the 'innerHTML' property on 'Element': This document requires 'TrustedHTML' assignment.
```

(Konsol xabarlari 150 belgida kesilgan.)

| Sahifa | Natija | Ma'nosi |
| --- | --- | --- |
| `/xom` | Sahifada haqiqiy `<b>` elementi paydo bo'ldi | Kiritilgan matn **HTML** sifatida talqin qilindi. Shu yo'l bilan kod ham kirishi mumkin — XSS'ning ikkinchi sharti bajarilgan |
| `/xavfsiz` | `<b>` yo'q, matn `&lt;b&gt;` bo'lib qoldi | Ekranlash: foydalanuvchi o'z yozganini **matn** sifatida ko'radi |
| `/csp-yoq` | Hamma to'rttasi ishladi | Siyosat yo'q |
| `/csp` | Faqat nonce'li skript ishladi | Nonce'siz ichki skript, boshqa origin'dagi fayl va `onclick` bloklandi; konsol har birining sababini aytdi |
| `/csp-sinov` | Hammasi ishladi | Report-Only — bloklamaydi, faqat hisobot (pastda) |
| `/tt` | `innerHTML` ga satr berish **rad etildi** | Trusted Types: faqat siyosatdan o'tgan qiymat |

Report-Only rejimida server olgan hisobotlar:

```text tashqi
hisobot: application/csp-report | effective-directive=script-src-elem | blocked-uri=inline | disposition=report
hisobot: application/csp-report | effective-directive=script-src-elem | blocked-uri=http://127.0.0.1:8102/tashqi.js | disposition=report
hisobot: application/csp-report | effective-directive=script-src-attr | blocked-uri=inline | disposition=report
```

`disposition=report` — "bloklanardi, lekin faqat xabar berildi". `script-src-elem` — `<script>` elementlari, `script-src-attr` — atributdagi ishlovchilar. Shu hisobotlar bo'yicha siyosatni sozlab, keyin `Content-Security-Policy` ga o'tiladi.

### Haqiqiy sayt

```text vps
$ curl -s -D - -o /dev/null https://developer.mozilla.org/en-US/ | tr -d '\r' | grep -i '^content-security-policy:' | cut -d: -f2- | tr ';' '\n' | awk '{print $1}' | grep -v '^$' | tr '\n' ' '; echo
default-src script-src script-src-elem style-src object-src base-uri connect-src font-src frame-src img-src manifest-src media-src child-src worker-src 
$ curl -s -D - -o /dev/null https://developer.mozilla.org/en-US/ | tr -d '\r' | grep -i '^content-security-policy:' | tr ';' '\n' | sed 's/^ //' | grep -E "^(object-src|base-uri|frame-ancestors|upgrade-insecure)"
object-src 'none'
base-uri 'self'
```

MDN saytining o'zi har resurs turi uchun alohida direktiva yozgan; `object-src 'none'` — qat'iy CSP tavsiyasidagi kabi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| W3C Content Security Policy Level 3 | Direktivalar, nonce/xesh, `strict-dynamic`, hisobotlar |
| W3C Trusted Types | `require-trusted-types-for`, siyosatlar |
| MDN XSS — nazorat ro'yxati | Ekranlaydigan shablon dvigateli; kontekstni bilish; HTML kerak bo'lsa — obro'li kutubxona bilan tozalash va Trusted Types; qat'iy CSP |
| OWASP XSS Prevention Cheat Sheet | Kontekst bo'yicha ekranlash qoidalari |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kiritilgan matnni satr qo'shish bilan HTML'ga (`f'<p>{matn}</p>'`) | Matn HTML bo'lib qoladi (sinovda `<b>` paydo bo'ldi) | Shablon dvigateli yoki `html.escape` |
| Foydalanuvchi matnini `innerHTML` ga | Brauzer uni HTML deb talqin qiladi | `textContent`; HTML kerak bo'lsa — DOMPurify + Trusted Types |
| Atribut qiymatini qo'shtirnoqsiz qo'yish | Yangi atribut qo'shilishi mumkin (MDN) | Doim `"…"` va ekranlash |
| Kiritilgan matnni `<script>` yoki `<style>` ichiga | Deyarli har doim xavfli (MDN) | Bunday joylashtirishdan qochish |
| O'z tozalash funksiyasini yozish | Xatoga moyil (MDN) | Obro'li kutubxona |
| "CSP bor — ekranlash shart emas" | CSP — zaxira qatlam | Ikkalasi birga |
| `script-src 'unsafe-inline'` | Ichki skript taqiqini bekor qiladi — CSP'ning asosiy foydasi yo'qoladi | Nonce yoki xesh |
| Bir xil (statik) nonce | Taxmin qilinadi — himoya yo'q | Har javobga yangi tasodifiy nonce |
| CSP'ni darhol qat'iy yoqish | Sayt buzilishi mumkin | Avval `Report-Only`, hisobotlarni tahlil qilib |

## Amaliyot

1. XSS'ning ikki sharti qaysi? Saqlanuvchi XSS nega jiddiyroq?
2. Chiqishni ekranlash nima qiladi? Sinovda `/xom` va `/xavfsiz` farqi nima bo'ldi?
3. Nega kontekst muhim — teglar orasiga, atributga va `<script>` ichiga qo'yish farqi?
4. Nonce qanday ishlaydi va nega u har javobda yangi bo'lishi kerak?
5. Sinovdagi `/csp` sahifasida qaysi uchta narsa bloklandi?
6. `Content-Security-Policy-Report-Only` nima uchun kerak?

<details>
<summary>Javoblar</summary>

1. Hujumchi tuzishi mumkin bo'lgan ma'lumotni qabul qilish va uni xavfsizlantirmasdan sahifaga qo'yish. Saqlanuvchi XSS sahifani ochgan har bir foydalanuvchiga ta'sir qiladi.
2. Xavfli belgilarni (`<`, `>`, `&`, `"`, `'`) almashtirib, matnni HTML emas, matn qiladi. `/xom` da `<b>` elementi yaratildi, `/xavfsiz` da u oddiy matn bo'lib ko'rindi.
3. Har kontekstda brauzer boshqa qoidalar bilan o'qiydi: HTML ekranlashi teglar orasida yetadi; atributlarda qo'shtirnoq va atribut turi muhim; `<script>` ichiga qo'yish deyarli har doim xavfli.
4. Server tasodifiy qiymatni CSP'ga va o'z skriptlariga yozadi, brauzer faqat mos kelganini bajaradi. Takrorlansa, hujumchi uni bilib olib, o'z kodiga qo'yishi mumkin.
5. Nonce'siz ichki skript, boshqa origin'dagi `tashqi.js` va `onclick` atributi.
6. Siyosatni bloklamasdan sinash: buzilishlar haqida hisobot keladi, sayt ishlashda davom etadi.

</details>

## Rasmiy hujjat

- [MDN: Cross-site scripting (XSS)](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS)
- [MDN: Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)
- [MDN: Trusted Types API](https://developer.mozilla.org/en-US/docs/Web/API/Trusted_Types_API)
- [W3C: Content Security Policy Level 3](https://www.w3.org/TR/CSP3/)
- [OWASP: Cross Site Scripting Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Python: html.escape](https://docs.python.org/3/library/html.html#html.escape)
