# 29 — Brauzerning Network paneli

[Mundarija](README.md)

## Tushuncha

Oldingi boblarda so'rov va javoblarni `curl -v` va server jurnallari bilan ko'rdik. Brauzerda buning asosiy vositasi — dasturchi vositalaridagi (DevTools) **Network** paneli: Chrome DevTools'da ham, Firefox'dagi Network Monitor'da ham. Ochish (DevTools hujjati): `Control+Shift+J` (macOS'da `Command+Option+J`) DevTools'ni ochadi, keyin **Network** yorlig'i. Panel faqat **ochiq bo'lgan vaqtdagi** so'rovlarni yozadi — shuning uchun avval panelni ochib, keyin sahifani yangilang.

### So'rovlar jadvali

Chrome DevTools hujjati (Network features reference): jadvalning standart ustunlari:

| Ustun | Nima |
| --- | --- |
| **Name** | Resurs fayli nomi yoki identifikatori |
| **Status** | HTTP holat kodi (`200`, `404`, 8-bob), yoki `CORS error` (19-bob), `(blocked:origin)` — header'lar noto'g'ri, `(failed)` va xato matni |
| **Type** | Resurs MIME turi (9-bob) |
| **Initiator** | So'rovni kim boshlagan: `Parser` (HTML tahlilchisi), `Redirect` (10-bob), `Script` (JavaScript) va boshqalar |
| **Size** | Server yetkazgan javob header'lari va tanasining umumiy hajmi |
| **Time** | So'rov boshidan javob tugaguncha |
| **Waterfall** | So'rovlarning vaqt bo'yicha **sharsharasi** — qaysi biri qachon boshlanib, qancha davom etgani |

So'rovni bosganda — tafsilotlar: **Headers** (so'rov va javob header'lari, 6-bob), **Payload** (yuborilgan ma'lumot), **Preview**/**Response** (javob tanasi), **Cookies** (14-bob), **Timing**.

### Timing: bosqichlar

DevTools hujjati — **Timing** yorlig'idagi bosqichlar:

| Bosqich | Nima (DevTools hujjati) | Bob |
| --- | --- | --- |
| **Queueing** | So'rov navbatda: ustuvorroq so'rovlar bor; bitta origin'ga **6 ta TCP ulanish** ochiq (faqat HTTP/1.0 va 1.1); disk keshida joy ajratilyapti | 13 |
| **Stalled** | Ulanishdan keyin ham shu sabablar bilan kutish | — |
| **DNS Lookup** | IP manzilni aniqlash | 4 |
| **Initial connection** | TCP ulanish (va qayta urinishlar), SSL kelishuvi | 3, 25 |
| **Proxy negotiation** | Proksi bilan kelishish | 5 |
| **Request sent** | So'rov yuborilmoqda | 6 |
| **Waiting (TTFB)** | Birinchi baytni kutish (Time To First Byte): bitta borib-kelish va server javob tayyorlagan vaqt | 1 |
| **Content Download** | Javob tanasini olish; kutilganidan uzoq bo'lsa — sekin tarmoq yoki brauzer band | 12 |

Bu 1-bobdagi `curl -w` bosqichlari (`time_namelookup`, `time_connect`, `time_appconnect`, `time_starttransfer`) bilan bir xil mantiq.

### Foydali imkoniyatlar

| Imkoniyat | Nima uchun (DevTools hujjati) |
| --- | --- |
| **Disable cache** | Brauzer keshini o'chirish — birinchi marta kirgan foydalanuvchi tajribasiga yaqinroq (11-bob). Faqat DevTools ochiq paytda |
| **Throttling** | Sekin tarmoqni (masalan, "Slow 4G") yoki `Offline` ni taqlid qilish |
| **Filter** | Tur (JS, CSS, Img, Fetch/XHR…), `domain:`, `status-code:` kabi xossalar bo'yicha. Kengaytmalar so'rovlari (`chrome-extension://`) ni yashirish mumkin |
| **Copy as cURL** | So'rovni `curl` buyrug'i sifatida nusxalash — terminalda qayta yuborib, server tomonini alohida tekshirish uchun. `Copy as fetch` va `Copy as PowerShell` ham bor |
| **Export HAR** | Barcha so'rovlarni **HAR** (HTTP Archive) fayliga saqlash. Standart holatda "sanitized" — `Cookie`, `Set-Cookie`, `Authorization` olib tashlangan; maxfiy ma'lumot bilan eksport alohida yoqiladi |
| **Preserve log** | Sahifa o'zgarganda (redirect, forma) ham jurnalni saqlash |

**HAR — ehtiyot bo'ling.** "With sensitive data" bilan saqlangan HAR'da cookie va tokenlar bo'ladi — uni birovga yuborish sessiyangizni berish bilan teng (15-bob).

## Ko'rib chiqamiz

DevTools oynasini avtomatlashtirib bo'lmaydi, lekin u ko'rsatadigan ma'lumot — **CDP** (Chrome DevTools Protocol) hodisalari va **HAR** formati — Playwright orqali olinadi. Sinov sahifasi: CSS, rasm, **sekin** skript (server 0,8 s kutadi), `404` qaytaradigan API va boshqa origin'dagi CORS header'siz API:

```python
import sys, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

SAHIFA = '''<!doctype html><title>Network</title>
<link rel="stylesheet" href="/uslub.css">
<img src="/rasm.svg">
<script src="/sekin.js"></script>
<script>fetch('/api/yoq'); fetch('http://127.0.0.1:8109/api/begona').catch(() => {});</script>'''

FAYLLAR = {'/': ('text/html; charset=utf-8', SAHIFA, 200, 0),
           '/uslub.css': ('text/css', 'body{font-family:sans-serif}' * 40, 200, 0),
           '/rasm.svg': ('image/svg+xml', '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"/>', 200, 0),
           '/sekin.js': ('text/javascript', 'window.tayyor = 1;', 200, 0.8),     # server 0,8 s "o'ylaydi"
           '/api/yoq': ('application/json', '{"xato":"topilmadi"}', 404, 0),
           '/api/begona': ('application/json', '{"ok":1}', 200, 0)}            # CORS header'siz


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        print('so\'rov:', self.path, flush=True)
        tur, matn, kod, kut = FAYLLAR.get(self.path, ('text/plain', 'topilmadi', 404, 0))
        time.sleep(kut)
        tana = matn.encode()
        self.send_response(kod)
        self.send_header('Content-Type', tur)
        self.send_header('Content-Length', str(len(tana)))
        if self.path in ('/uslub.css', '/rasm.svg'):
            self.send_header('Cache-Control', 'max-age=60')
        self.end_headers()
        self.wfile.write(tana)

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'node:fs'
const b = await chromium.launch()
// 1) HAR yozib olish — DevTools'dagi "Export HAR" bilan bir xil format
const ctx = await b.newContext({ recordHar: { path: 'sahifa.har' } })
const p = await ctx.newPage()
await p.goto('http://localhost:8109/'); await p.waitForTimeout(1500)
await ctx.close()
const har = JSON.parse(readFileSync('sahifa.har', 'utf8'))
console.log('HAR versiyasi:', har.log.version, '| yaratuvchi:', har.log.creator.name)
console.log('Nomi            Status  Turi                      Hajm  blocked dns connect send wait receive (ms)')
for (const e of har.log.entries) {
  const t = e.timings, f = x => (x == null || Number.isNaN(x) || x < 0 ? '-' : String(Math.round(x))).padStart(4)
  const nom = new URL(e.request.url).pathname + (e.request.url.includes('127.0.0.1') ? ' (B)' : '')
  console.log(`${nom.padEnd(16)}${String(e.response.status).padEnd(8)}${(e.response.content.mimeType || '-').padEnd(26)}${String(e.response.content.size).padStart(5)} ${f(t.blocked)} ${f(t.dns)} ${f(t.connect)} ${f(t.send)} ${f(t.wait)} ${f(t.receive)}`)
}
// 2) qayta yuklash: max-age=60 li fayllar keshdan olinadimi (server jurnalida ko'rinadi)
const ctx2 = await b.newContext(); const p2 = await ctx2.newPage()
console.log('--- 2-sinov: birinchi ochilish'); await p2.goto('http://localhost:8109/'); await p2.waitForTimeout(1200)
console.log('--- 2-sinov: ikkinchi ochilish (havola orqali)'); await p2.evaluate(() => { location.href = '/' }); await p2.waitForTimeout(1500)
console.log('--- 3-sinov');
// 3) tarmoqni sekinlashtirish (DevTools "Throttling" bilan bir xil CDP buyrug'i)
const ctx3 = await b.newContext(); const p3 = await ctx3.newPage(); const cdp = await ctx3.newCDPSession(p3)
let t0 = Date.now(); await p3.goto('http://localhost:8109/', { waitUntil: 'load' }); console.log('Oddiy tarmoq: load', Date.now() - t0, 'ms')
await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: 50 * 1024, uploadThroughput: 20 * 1024 })
t0 = Date.now(); await p3.goto('http://localhost:8109/', { waitUntil: 'load' }); console.log('Sekin tarmoq (400 ms kechikish): load', Date.now() - t0, 'ms')
console.log('chromium', b.version())
await b.close()
```

### HAR: Network jadvali

```text tashqi
HAR versiyasi: 1.2 | yaratuvchi: Playwright
Nomi            Status  Turi                      Hajm  blocked dns connect send wait receive (ms)
/               200     text/html; charset=utf-8    230    -    0    0    0    1    1
/uslub.css      200     text/css                   1120    -    -    -    0    0    2
/rasm.svg       200     image/svg+xml                64    -    0    0    0    0    2
/sekin.js       200     text/javascript              18    -    0    0    0  808    3
/api/yoq        404     application/json             20    -    -    -    0    1    1
/api/begona (B) -1      x-unknown                    -1    -    -    -    -    -    -
```

Har qator — Network jadvalidagi bitta so'rov; ustunlar HAR'dagi `timings` (millisekund). `-` — bu bosqich bo'lmagan (masalan, ulanish qayta ishlatildi).

| Kuzatuv | Ma'nosi |
| --- | --- |
| `/sekin.js` — `wait` **~800 ms** | Waiting (TTFB): server javobni tayyorlagan vaqt. Network panelida bu so'rovning sharsharasida uzun "kutish" bo'lagi bo'ladi — sekinlik **serverda**, tarmoqda emas |
| `/api/yoq` — `404` | Panelda qizil qator; Status ustunida `404` |
| `/api/begona (B)` — status `-1`, tur `x-unknown` | CORS bloklagan so'rov: javob sahifaga berilmadi. DevTools Status ustunida buni `CORS error` deb ko'rsatadi; serverga esa so'rov **yetdi** (pastdagi jurnalda `/api/begona` bor — 19-bob) |
| `dns`, `connect` — `0` yoki `-` | Lokal server, ulanish bir marta ochilib qayta ishlatildi |

HAR fayli — JSON, versiya `1.2`; DevTools'dagi "Export HAR" xuddi shu formatda saqlaydi.

### Kesh

Server jurnali — har ochilishda serverga qaysi so'rovlar yetdi (`uslub.css` va `rasm.svg` — `Cache-Control: max-age=60`):

```text tashqi
so'rov: /
so'rov: /uslub.css
so'rov: /rasm.svg
so'rov: /sekin.js
so'rov: /api/yoq
so'rov: /api/begona
```

Yuqorisi — HAR yozilgan birinchi ochilish (6 ta so'rov). 2-sinovning birinchi ochilishi ham 6 ta:

```text tashqi
so'rov: /
so'rov: /uslub.css
so'rov: /rasm.svg
so'rov: /sekin.js
so'rov: /api/begona
so'rov: /api/yoq
```

2-sinovning **ikkinchi** ochilishi — atigi 4 ta:

```text tashqi
so'rov: /
so'rov: /sekin.js
so'rov: /api/begona
so'rov: /api/yoq
```

`uslub.css` va `rasm.svg` serverga **bormadi** — brauzer keshidan olindi. Network panelida ham bu so'rovlar ro'yxatda turadi, lekin tarmoqdan emas, keshdan kelgani belgilanadi. "Disable cache" yoqilsa — har safar serverdan.

### Tarmoqni sekinlashtirish

DevTools "Throttling" CDP'dagi `Network.emulateNetworkConditions` buyrug'idan foydalanadi. 400 ms kechikish va ~50 KB/s tezlik bilan (kesh o'chirilgan):

```text tashqi
Oddiy tarmoq: load 824 ms
Sekin tarmoq (400 ms kechikish): load 1234 ms
```

Server jurnalida bu ikki ochilish (har biri 6 ta so'rov, keshsiz):

```text tashqi
so'rov: /
so'rov: /uslub.css
so'rov: /rasm.svg
so'rov: /sekin.js
so'rov: /api/begona
so'rov: /api/yoq
```

```text tashqi
so'rov: /
so'rov: /uslub.css
so'rov: /rasm.svg
so'rov: /sekin.js
so'rov: /api/yoq
so'rov: /api/begona
```

Sahifa yuklanishi ~400 ms sekinlashdi. Throttling bilan sekin tarmoqdagi foydalanuvchi tajribasini tekshirish mumkin — masalan, `sekin.js` kabi sahifani to'xtatib turadigan skript qanchalik zarar qilishini.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| Chrome DevTools: Network features reference | Ustunlar, Timing bosqichlari, filtrlar, HAR eksporti, Copy as cURL |
| Firefox: Network Monitor | Firefox'dagi xuddi shunday vosita |
| W3C Resource Timing | Sahifa ichidan `performance.getEntriesByType('resource')` bilan shu bosqichlarni o'qish |
| HAR 1.2 | HTTP Archive formati (rasmiy standart emas, amaliy kelishuv; DevTools va Playwright shu versiyani yozadi) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Panelni sahifa yuklangandan keyin ochish | Panel faqat ochiq paytdagi so'rovlarni yozadi | Panelni ochib, sahifani yangilash |
| "Sayt sekin — tarmoq sekin" deb xulosa qilish | Sekinlik ko'pincha TTFB'da — serverda (sinovda `sekin.js` 800 ms) | Timing'da qaysi bosqich uzunligini ko'rish |
| `CORS error` ni server xatosi deb o'ylash | So'rov serverga yetgan, brauzer javobni bermagan | Konsoldagi sababni o'qish (19-bob) |
| Keshlangan javoblar bilan o'lchash | Takroriy tashrif tezroq ko'rinadi | "Disable cache" bilan birinchi tashrifni ham o'lchash |
| HAR'ni maxfiy ma'lumot bilan yuborish | Cookie va tokenlar ichida | "Sanitized" HAR |
| Faqat tezkor tarmoqda sinash | Foydalanuvchilarning tarmog'i sekinroq bo'lishi mumkin | Throttling |

## Amaliyot

1. Network jadvalidagi Status ustunida `CORS error` nimani anglatadi? So'rov serverga yetganmi?
2. Timing'dagi `Waiting (TTFB)` nima va u uzun bo'lsa sabab qayerda?
3. `Queueing` qachon uzayadi (HTTP/1.1 da)?
4. Sinovda ikkinchi ochilishda qaysi fayllar serverga bormadi va nega?
5. "Copy as cURL" nima uchun foydali?
6. Nega HAR faylini ehtiyotkorlik bilan ulashish kerak?

<details>
<summary>Javoblar</summary>

1. Javobni brauzer CORS sababli sahifaga bermagan. So'rov serverga yetgan (sinovda jurnalda `/api/begona` bor).
2. Birinchi baytni kutish: bitta borib-kelish va server javob tayyorlash vaqti. Uzun bo'lsa — odatda server tomonida.
3. Ustuvorroq so'rovlar bo'lsa, origin'ga 6 ta ulanish allaqachon ochiq bo'lsa, disk keshida joy ajratilayotganda.
4. `uslub.css` va `rasm.svg` — ular `max-age=60` bilan keshlangan edi.
5. So'rovni brauzerdan tashqarida aynan qayta yuborib, server javobini alohida tekshirish mumkin.
6. "With sensitive data" HAR'da cookie, `Authorization` va tokenlar bo'ladi — sessiyani boshqaga berish bilan teng.

</details>

## Rasmiy hujjat

- [Chrome DevTools: Network panel overview](https://developer.chrome.com/docs/devtools/network)
- [Chrome DevTools: Network features reference](https://developer.chrome.com/docs/devtools/network/reference)
- [Firefox: Network Monitor](https://firefox-source-docs.mozilla.org/devtools-user/network_monitor/index.html)
- [Chrome DevTools Protocol: Network domain](https://chromedevtools.github.io/devtools-protocol/tot/Network/)
- [MDN: Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Resource_timing)
