# 24 — Subresource Integrity

[Mundarija](README.md)

## Tushuncha

MDN (Subresource Integrity): saytlar ko'pincha resurslarni o'zi saqlamay, uchinchi tomondan — masalan, **CDN** (Content Delivery Network) dan ulaydi:

```html
<script src="https://cdn.example.com/kutubxona.js"></script>
```

Xavf: hujumchi CDN'ni egallasa, faylga istalgan kodni qo'shadi yoki uni butunlay almashtiradi — **ta'minot zanjiri hujumi** (supply chain attack). 18-bobda ko'rdik: boshqa origin'dagi skript sahifamizda **to'liq huquq** bilan bajariladi.

**SRI** (Subresource Integrity — qism-resurs yaxlitligi) — brauzerga yuklangan resurs **kutilgan mazmunda** ekanini tekshirish imkonini beradi: siz resursning **kriptografik xeshini** yozasiz, brauzer kelgan faylning xeshini hisoblab, solishtiradi.

### `integrity` atributi

Qo'llanadi: `<script>` va `rel="stylesheet"`, `preload`, `modulepreload` li `<link>`.

```html
<script src="https://cdn.example.com/script.js"
        integrity="sha384-…"
        crossorigin="anonymous"></script>
```

- Qiymat — `algoritm-base64(xesh)`; ruxsat etilgan algoritmlar: `sha256`, `sha384`, `sha512`. Bo'sh joy bilan bir nechta xesh yozish mumkin.
- Brauzer **eng kuchli** algoritmdagi xeshlarni tanlaydi (SHA-256 < SHA-384 < SHA-512) va kelgan fayl ulardan **birortasiga** mos kelsa, yuklaydi; aks holda — **tarmoq xatosi**, skript bajarilmaydi, stil qo'llanmaydi.
- Bir algoritm bilan bir nechta xesh — faylning bir nechta ruxsat etilgan versiyasi uchun.

Xeshni hisoblash (MDN):

```bash
cat FILENAME.js | openssl dgst -sha384 -binary | openssl base64 -A
```

### SRI va CORS

Boshqa origin'dagi resurs SRI bilan tekshirilishi uchun **CORS** shart (19-bob): server `Access-Control-Allow-Origin` yuborishi (CDN'lar odatda `*`) va teg'da **`crossorigin`** atributi bo'lishi kerak. Sababi (MDN): HTML'dagi resurs standart holatda `no-cors` rejimida yuklanadi — sahifa uni ishlatadi, lekin o'qiy olmaydi. Agar `no-cors` da SRI ruxsat etilsa, begona sahifa xeshni taxmin qilib, resurs yuklandi-yuklanmadi bo'yicha uning mazmunini bilib olishi mumkin edi. Shuning uchun `no-cors` + `integrity` — **doim** xato.

### Integrity Policy

`Integrity-Policy` header'i (MDN) — sahifa skript yoki stillarni **faqat `integrity` bilan** yuklashni talab qiladi: `blocked-destinations=(script)` yoki `(style)`. `integrity` siz yoki `no-cors` so'rovlar bloklanadi. `Integrity-Policy-Report-Only` — bloklamay, faqat hisobot (21-bobdagi CSP Report-Only kabi).

## Ko'rib chiqamiz

Fayl va uning xeshi — VPS'da, MDN buyrug'i bilan; ikkinchi qator — xuddi shu fayl, oxiriga "begona" kod qo'shilgan:

```text vps
$ mkdir -p /tmp/k24 && cd /tmp/k24 && printf 'window.kutubxona = "v1";\n' > kutubxona.js && cat kutubxona.js
window.kutubxona = "v1";
$ cd /tmp/k24 && cat kutubxona.js | openssl dgst -sha384 -binary | openssl base64 -A; echo
OoNSeS8JbgLmmDK/gvVZoRv8abuiWxQ1qPz+JreD76wioOHr/QcJEVhyhgD4HlOr
$ cd /tmp/k24 && printf 'window.kutubxona = "v1"; window.begona = true;\n' | openssl dgst -sha384 -binary | openssl base64 -A; echo
qEn29cb8/xmMqzb3WwLNbNkJAAbHuaiXDkcsXBnw5coWuSAe+1nC7l/shxBddNJY
```

Bitta bayt o'zgarsa ham xesh butunlay boshqa. Namuna server: sahifa — `http://localhost:8106`, "CDN" — `http://127.0.0.1:8106` (boshqa origin, `Access-Control-Allow-Origin: *`). Sahifada to'rt skript; `/ozgartirilgan.js` — buzilgan CDN'ni ifodalaydi:

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

ASL = 'window.kutubxona = "v1";\n'
XESH = 'sha384-OoNSeS8JbgLmmDK/gvVZoRv8abuiWxQ1qPz+JreD76wioOHr/QcJEVhyhgD4HlOr'   # openssl bilan hisoblangan
CDN = 'http://127.0.0.1:8106'

SAHIFA = f'''<!doctype html>
<script src="{CDN}/kutubxona.js?n=1" integrity="{XESH}" crossorigin="anonymous"
        onload="natija.push('1 to\\'g\\'ri xesh: yuklandi')" onerror="natija.push('1 to\\'g\\'ri xesh: rad')"></script>
<script src="{CDN}/ozgartirilgan.js" integrity="{XESH}" crossorigin="anonymous"
        onload="natija.push('2 fayl o\\'zgargan: yuklandi')" onerror="natija.push('2 fayl o\\'zgargan: rad')"></script>
<script src="{CDN}/kutubxona.js?n=3" integrity="{XESH}"
        onload="natija.push('3 crossorigin yo\\'q: yuklandi')" onerror="natija.push('3 crossorigin yo\\'q: rad')"></script>
<script src="{CDN}/kutubxona.js?n=4"
        onload="natija.push('4 integrity yo\\'q: yuklandi')" onerror="natija.push('4 integrity yo\\'q: rad')"></script>'''


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def javob(self, matn, tur, h=None):
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
        cors = {'Access-Control-Allow-Origin': '*'}
        if yol == '/kutubxona.js':
            return self.javob(ASL, 'text/javascript', cors)
        if yol == '/ozgartirilgan.js':         # CDN buzilgan: faylga begona kod qo'shilgan
            return self.javob('window.kutubxona = "v1"; window.begona = true;\n', 'text/javascript', cors)
        bosh = '<script>window.natija = [];</script>'
        if yol == '/siyosat':                  # integrity'siz skriptlarni taqiqlash
            return self.javob(bosh + SAHIFA, 'text/html; charset=utf-8',
                              {'Integrity-Policy': 'blocked-destinations=(script)'})
        self.javob(bosh + SAHIFA, 'text/html; charset=utf-8')

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

Chromium 158:

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const b = await chromium.launch(); const p = await b.newPage()
p.on('console', m => { if (m.type() === 'error') console.log('  [konsol]', m.text().slice(0, 230)) })
for (const yol of ['/', '/siyosat']) {
  console.log(`--- http://localhost:8106${yol}`)
  await p.goto('http://localhost:8106' + yol); await p.waitForTimeout(500)
  console.log((await p.evaluate(() => window.natija)).join('\n'))
  console.log('window.begona =', await p.evaluate(() => window.begona ?? 'yo\'q'))
}
console.log('chromium', b.version())
await b.close()
```

```text tashqi
--- http://localhost:8106/
  [konsol] Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:8106/ozgartirilgan.js' with computed SHA-384 integrity 'qEn29cb8/xmMqzb3WwLNbNkJAAbHuaiXDkcsXBnw5coWuSAe+1nC7l/shxBddNJY'. The resource has 
  [konsol] Subresource Integrity: The resource 'http://127.0.0.1:8106/kutubxona.js?n=3' has an integrity attribute, but the resource requires the request to be CORS enabled to check the integrity, and it is not. The resource has been blocked
1 to'g'ri xesh: yuklandi
2 fayl o'zgargan: rad
3 crossorigin yo'q: rad
4 integrity yo'q: yuklandi
window.begona = yo'q
--- http://localhost:8106/siyosat
  [konsol] Failed to find a valid digest in the 'integrity' attribute for resource 'http://127.0.0.1:8106/ozgartirilgan.js' with computed SHA-384 integrity 'qEn29cb8/xmMqzb3WwLNbNkJAAbHuaiXDkcsXBnw5coWuSAe+1nC7l/shxBddNJY'. The resource has 
1 to'g'ri xesh: yuklandi
2 fayl o'zgargan: rad
3 crossorigin yo'q: rad
4 integrity yo'q: rad
window.begona = yo'q
```

| # | Holat | `/` | `/siyosat` (`Integrity-Policy`) |
| --- | --- | --- | --- |
| 1 | To'g'ri xesh, `crossorigin` | Yuklandi | Yuklandi |
| 2 | Fayl o'zgargan, eski xesh | **Rad** | Rad |
| 3 | To'g'ri xesh, `crossorigin` **yo'q** | **Rad** — `no-cors` da SRI tekshirilmaydi | Rad |
| 4 | `integrity` yo'q | Yuklandi | **Rad** — siyosat `integrity` talab qiladi |

- 2-holatda Chromium konsolda kelgan faylning xeshini yozdi: `qEn29cb8…` — VPS'dagi `openssl` natijasi bilan **aynan bir xil**. Begona kod (`window.begona`) bajarilmadi: `yo'q`.
- 3-holat — keng tarqalgan xato: xesh to'g'ri, lekin `crossorigin` unutilgan — skript umuman yuklanmaydi.
- 4-holat: oddiy sahifada `integrity` siz skript tekshiruvsiz ishlaydi. `Integrity-Policy` bunday "unutilgan" skriptlarni ham to'sadi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| W3C Subresource Integrity | `integrity` sintaksisi, algoritmlar, eng kuchli algoritmni tanlash, CORS talabi |
| Fetch Standard | So'rov rejimlari (`cors`, `no-cors`), `integrity` tekshiruvi |
| MDN Integrity-Policy | `Integrity-Policy` va `-Report-Only` header'lari |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| CDN'dan skriptni `integrity` siz ulash | CDN buzilsa, begona kod sahifangizda ishlaydi | `integrity` + `crossorigin="anonymous"` |
| `crossorigin` ni unutish | SRI `no-cors` da ishlamaydi — skript bloklanadi (3-holat) | `crossorigin="anonymous"` |
| "Oxirgi versiya" URL'iga (`…/latest/lib.js`) `integrity` qo'yish | Fayl yangilanganda xesh mos kelmaydi — sayt buziladi | Aniq versiyali URL (`lib@4.2.1`) |
| Xeshni ishonchsiz manbadan olish | Xesh ham soxta bo'lishi mumkin | Faylni o'zingiz yuklab, `openssl` bilan hisoblash yoki rasmiy sahifadan |
| SRI'ni o'z serveringizdagi fayllar uchun almashtirib bo'lmaydigan himoya deb hisoblash | Server egallansa, xeshni HTML'da ham o'zgartirish mumkin | SRI — **uchinchi tomon** resurslari uchun; o'zingizniki — server xavfsizligi |
| `integrity` ni hamma joyga qo'yishni unutish | Bitta unutilgan skript — teshik | `Integrity-Policy` (avval `-Report-Only` bilan) |

## Amaliyot

1. SRI qanday hujumdan himoya qiladi?
2. `integrity` qiymati qanday tuziladi? Bir nechta xesh yozilsa brauzer qaysilarini tekshiradi?
3. Nega boshqa origin'dagi resurs uchun `crossorigin` atributi shart?
4. Sinovda o'zgartirilgan faylga nima bo'ldi va konsol nima dedi?
5. `Integrity-Policy` nima qo'shadi?
6. Nega `…/latest/…` kabi URL bilan SRI noqulay?

<details>
<summary>Javoblar</summary>

1. Uchinchi tomon (CDN) egallanib, fayl o'zgartirilishidan — ta'minot zanjiri hujumi.
2. `sha256-`, `sha384-` yoki `sha512-` + base64 xesh. Brauzer eng kuchli algoritmdagilarni tanlaydi va birortasi mos kelsa yuklaydi.
3. SRI faqat CORS so'rovida ishlaydi; `no-cors` da ruxsat etilsa, mazmunni taxmin qilish orqali ma'lumot sizib chiqardi.
4. Rad etildi, bajarilmadi; konsol kelgan faylning SHA-384 xeshini ko'rsatdi — u `openssl` hisoblagani bilan bir xil.
5. `integrity` siz (yoki `no-cors`) skript/stillarni bloklaydi — unutilgan teglarni ham.
6. Fayl yangilanadi — xesh mos kelmay qoladi va resurs bloklanadi.

</details>

## Rasmiy hujjat

- [MDN: Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Subresource_Integrity)
- [MDN: crossorigin](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/crossorigin) · [Integrity-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Integrity-Policy)
- [W3C: Subresource Integrity](https://www.w3.org/TR/sri-2/)
