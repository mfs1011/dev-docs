# 27 — HSTS

[Mundarija](README.md)

## Tushuncha

Foydalanuvchi manzil satriga `example.com` yoki `http://example.com` yozadi. Birinchi so'rov **HTTP** orqali ketadi; server `301` bilan HTTPS'ga yo'naltiradi (10-bob). MDN (Transport Layer Security): aynan shu birinchi, shifrlanmagan almashinuvni hujumchi tutib qolib, HTTPS'ga o'tishga yo'l qo'ymasligi mumkin — buni **SSL stripping** hujumi deyishadi.

**HSTS** (HTTP Strict Transport Security) — server brauzerga "bu xostga **faqat HTTPS** orqali kel" deydigan mexanizm. MDN (Strict-Transport-Security):

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| Direktiva | Ma'nosi |
| --- | --- |
| `max-age=<soniya>` | Brauzer xostni necha soniya "faqat HTTPS" deb eslab qolsin |
| `includeSubDomains` | Barcha subdomenlarga ham tegishli |
| `preload` | Standart emas; brauzerlarning oldindan yuklangan ro'yxatiga kirish uchun (pastda). Unda `max-age` kamida 1 yil va `includeSubDomains` shart |

### Brauzer nima qiladi

MDN:

- Header **joriy** javobga ta'sir qilmaydi — **keyingi** so'rovlarni o'zgartiradi. HTTPS javobidagi header bilan brauzer xost nomini o'zining doimiy **HSTS ro'yxati**ga qo'shadi.
- Keyin `http` URL yuklashdan oldin brauzer ro'yxatni tekshiradi; mos kelsa (yoki `includeSubDomains` bilan ota domen bo'lsa), sxemani **`https`** ga almashtiradi. Port 80 bo'lsa — 443 ga; **boshqa aniq port o'zgarmaydi**, brauzer o'sha portga HTTPS bilan ulanadi.
- Xost faqat **domen nomi** bilan aniqlanadi: IP manzil HSTS xosti bo'la olmaydi; HSTS xostning **barcha portlariga** tegishli.
- HSTS xostda TLS xatosi bo'lsa (masalan, yaroqsiz sertifikat), brauzer foydalanuvchiga xatoni "o'tkazib yuborish" imkonini **bermaydi** (RFC 6797, 8.4: ulanishni to'xtatish shart).
- Header **faqat HTTPS** orqali qabul qilinadi; HTTP javobidagi header e'tiborsiz qoldiriladi — aks holda MITM hujumchisi uni o'zgartirishi yoki HTTPS'ni qo'llamaydigan xostga qo'shib qo'yishi mumkin edi.

**Muddat** (MDN): har header kelganda muddat "hozir + `max-age`" ga yangilanadi. Header keyingi javoblarda bo'lmasa — oldingisi muddati tugaguncha amal qiladi. O'chirish — `max-age=0`, va bu ham faqat HTTPS orqali ishlaydi.

**Subdomenlar** (MDN): `includeSubDomains` bilan `secure.example.com` siyosati `login.secure.example.com` ga ham tegishli, lekin `example.com` ga emas. Har subdomen o'zi ham header yuborsin — brauzer ota domenni hech ochmagan bo'lishi mumkin.

### Birinchi tashrif va preload

HSTS birinchi tashrifni himoya qilmaydi: brauzer hali header'ni ko'rmagan (RFC 6797, 14.6 — "Bootstrap MITM Vulnerability"). Buning uchun Chrome **HSTS preload ro'yxati**ni yuritadi (MDN TLS sahifasi): ro'yxatdagi domenlarga brauzer birinchi tashrifdan HTTPS bilan kiradi. MDN (Strict-Transport-Security): xizmatni Google yuritadi (hstspreload.org), lekin ro'yxatdan barcha brauzerlar foydalanadi; u HSTS spetsifikatsiyasining qismi emas.

## Ko'rib chiqamiz

### Brauzer

Lokal kompyuterda ikki server: HTTPS (`8107`) va HTTP (`8108`). Sinov domenlari `kitob.test`, `api.kitob.test`, `boshqa.test` — `127.0.0.1` ga yo'naltirilgan. HSTS faqat **xatosiz** TLS'da qabul qilinadi (RFC 6797, 8.1), shuning uchun o'z-o'zidan imzolangan sinov sertifikati Chromium'ga `--ignore-certificate-errors-spki-list` bilan (ochiq kalit xeshi orqali) ishonchli deb ko'rsatildi — faqat sinov uchun:

```bash
openssl x509 -in sert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl base64 -A
```

```python
import ssl, sys, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


def ishlovchi(sxema):
    class I(BaseHTTPRequestHandler):
        protocol_version = 'HTTP/1.1'

        def do_GET(self):
            print(f'{sxema:5} {self.headers.get("Host")}{self.path}', flush=True)
            tana = f'{sxema} orqali keldi\n'.encode()
            self.send_response(200)
            if sxema == 'https' and self.path == '/hsts':
                self.send_header('Strict-Transport-Security', 'max-age=60; includeSubDomains')
            if sxema == 'https' and self.path == '/tozala':
                self.send_header('Strict-Transport-Security', 'max-age=0')
            if sxema == 'http' and self.path == '/hsts':      # HTTP orqali — brauzer e'tiborsiz qoldirishi kerak
                self.send_header('Strict-Transport-Security', 'max-age=60')
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(tana)))
            self.end_headers()
            self.wfile.write(tana)

        def log_message(self, *a):
            pass
    return I


https = ThreadingHTTPServer(('127.0.0.1', 8107), ishlovchi('https'))
k = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
k.load_cert_chain(sys.argv[1], sys.argv[2])
https.socket = k.wrap_socket(https.socket, server_side=True)
threading.Thread(target=https.serve_forever, daemon=True).start()
ThreadingHTTPServer(('127.0.0.1', 8108), ishlovchi('http')).serve_forever()
```

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
import { readFileSync } from 'node:fs'
const spki = readFileSync('spki.txt', 'utf8').trim()       // sinov sertifikatini "ishonchli" qilish (faqat sinov)
const b = await chromium.launch({ args: ['--host-resolver-rules=MAP *.test 127.0.0.1',
  `--ignore-certificate-errors-spki-list=${spki}`] })
const p = await (await b.newContext()).newPage()
const och = async (url) => {
  const zanjir = []
  const h = r => { zanjir.push(`${r.status()} ${r.url()}${r.headers()['non-authoritative-reason'] ? ' (' + r.headers()['non-authoritative-reason'] + ')' : ''}`) }
  p.on('response', h)
  let natija
  try { const r = await p.goto(url); natija = (await r.text()).trim() } catch (e) { natija = e.message.split('\n')[0]; await p.waitForTimeout(300); await p.goto('about:blank') }
  p.off('response', h)
  console.log(`${url}\n   ${zanjir.join(' -> ') || '(javob yo\'q)'}\n   => ${natija}`)
}
await och('http://kitob.test:8108/')            // 1. HSTS'dan oldin
await och('http://kitob.test:8108/hsts')        // 2. HTTP orqali HSTS header
await och('http://kitob.test:8108/')            // 3. hali ham HTTP
await och('https://kitob.test:8107/hsts')       // 4. HTTPS orqali HSTS
await och('http://kitob.test:8107/')            // 5. endi http:// yozilsa ham
await och('http://api.kitob.test:8107/')        // 6. subdomen (includeSubDomains)
await och('http://kitob.test:8108/')            // 7. boshqa port — HTTP server
await och('http://boshqa.test:8108/')           // 8. boshqa xost
await och('https://kitob.test:8107/tozala')     // 9. max-age=0
await och('http://kitob.test:8108/')            // 10. HSTS o'chirilgan
console.log('chromium', b.version())
await b.close()
```

Har URL uchun: Playwright ko'rgan javoblar zanjiri va natija:

```text tashqi
http://kitob.test:8108/
   200 http://kitob.test:8108/
   => http orqali keldi
http://kitob.test:8108/hsts
   200 http://kitob.test:8108/hsts
   => http orqali keldi
http://kitob.test:8108/
   200 http://kitob.test:8108/
   => http orqali keldi
https://kitob.test:8107/hsts
   200 https://kitob.test:8107/hsts
   => https orqali keldi
http://kitob.test:8107/
   307 http://kitob.test:8107/ (HSTS) -> 200 https://kitob.test:8107/
   => https orqali keldi
http://api.kitob.test:8107/
   307 http://api.kitob.test:8107/ (HSTS) -> 200 https://api.kitob.test:8107/
   => https orqali keldi
http://kitob.test:8108/
   307 http://kitob.test:8108/ (HSTS)
   => page.goto: net::ERR_SSL_PROTOCOL_ERROR at http://kitob.test:8108/
http://boshqa.test:8108/
   200 http://boshqa.test:8108/
   => http orqali keldi
https://kitob.test:8107/tozala
   200 https://kitob.test:8107/tozala
   => https orqali keldi
http://kitob.test:8108/
   200 http://kitob.test:8108/
   => http orqali keldi
```

| # | URL | Natija | Sabab |
| --- | --- | --- | --- |
| 1 | `http://kitob.test:8108/` | HTTP | HSTS hali yo'q |
| 2 | `http://…:8108/hsts` | HTTP | Header **HTTP** orqali keldi — e'tiborsiz qoldirildi |
| 3 | `http://kitob.test:8108/` | HTTP | 2-qadam ta'sir qilmadi |
| 4 | `https://…:8107/hsts` | HTTPS | Header HTTPS orqali — brauzer `kitob.test` ni eslab qoldi |
| 5 | `http://kitob.test:8107/` | **`307 (HSTS)`** → HTTPS | Brauzer so'rovni **o'zi**, tarmoqqa chiqmasdan yangiladi; port saqlandi |
| 6 | `http://api.kitob.test:8107/` | `307 (HSTS)` → HTTPS | `includeSubDomains` |
| 7 | `http://kitob.test:8108/` | `307 (HSTS)` → `ERR_SSL_PROTOCOL_ERROR` | HSTS **barcha portlarga**: brauzer 8108 ga HTTPS bilan ulandi, u yerda esa oddiy HTTP server |
| 8 | `http://boshqa.test:8108/` | HTTP | Boshqa xost |
| 9 | `https://…/tozala` | HTTPS | `max-age=0` |
| 10 | `http://kitob.test:8108/` | HTTP | HSTS o'chirildi |

`307` va `Non-Authoritative-Reason: HSTS` — Chromium'ning ichki yo'naltirishi: server javobi emas. Server jurnalida 5–7-qadamlarda **birorta HTTP so'rov yo'q** — so'rov ochiq holda tarmoqqa umuman chiqmadi:

```text tashqi
http  kitob.test:8108/
http  kitob.test:8108/hsts
http  kitob.test:8108/
https kitob.test:8107/hsts
https kitob.test:8107/
https api.kitob.test:8107/
http  boshqa.test:8108/
https kitob.test:8107/tozala
http  kitob.test:8108/
```

### `curl` va haqiqiy sayt

VPS'da. `curl` ham HSTS'ni qo'llaydi — `--hsts <fayl>` bilan (qo'llanma: keshdagi xostga `http://` so'ralsa, HTTPS'ga yangilaydi):

```text vps
$ curl -s -D - -o /dev/null https://github.com/ | tr -d '\r' | grep -i '^strict-transport-security'
strict-transport-security: max-age=31536000; includeSubdomains; preload
$ cd /tmp && rm -f hsts.txt && curl -s -o /dev/null --hsts hsts.txt https://github.com/ && grep -v '^#' hsts.txt | awk '{print $1, $2, $3}'
.github.com "20271108 11:50:22"
$ cd /tmp && curl -sv -o /dev/null --hsts hsts.txt http://github.com/ 2>&1 | grep -iE 'hsts|^> GET|^< HTTP|Connected|Established' | head -5; rm -f hsts.txt
* Switched from HTTP to HTTPS due to HSTS => https://github.com/
* Established connection to github.com (140.82.121.3 port 443) from 203.0.113.10 port 50384 
> GET / HTTP/2
< HTTP/2 200 
$ curl -sv -o /dev/null http://github.com/ 2>&1 | grep -iE '^< HTTP|^< location|Established' | head -3
* Established connection to github.com (140.82.121.4 port 80) from 203.0.113.10 port 60620 
< HTTP/1.1 301 Moved Permanently
< Location: https://github.com/
```

- GitHub: `max-age=31536000` (1 yil), `includeSubdomains`, `preload` — preload talablariga mos.
- `--hsts` faylida `.github.com` va muddat (1 yildan keyin) saqlandi.
- Keyingi `http://github.com/` — curl **o'zi** HTTPS'ga o'tdi (`Switched from HTTP to HTTPS due to HSTS`), 80-portga umuman ulanmadi.
- HSTS keshisiz — oldin 80-portga ulanib, serverdan `301` oldi: aynan shu birinchi ochiq so'rovni HSTS yo'qotadi.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Nima |
| --- | --- | --- |
| RFC 6797 (2012-yil noyabr) | 6.1 | `Strict-Transport-Security` sintaksisi |
| RFC 6797 | 8.1 | Header faqat xatosiz xavfsiz transportda qabul qilinadi |
| RFC 6797 | 8.2, 8.3 | Domen mosligi; `http` URL'ni yuklashdan oldin `https` ga almashtirish, port 80 → 443 |
| RFC 6797 | 8.4 | HSTS xostda TLS xatosi bo'lsa — ulanishni to'xtatish |
| RFC 6797 | 12.1 | Foydalanuvchiga xatoni chetlab o'tish imkoni berilmasin |
| RFC 6797 | 14.6 | Birinchi tashrif zaifligi (bootstrap MITM) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat HTTP → HTTPS `301` | Birinchi ochiq so'rovni tutib qolish mumkin (SSL stripping) | `301` + HSTS |
| HSTS header'ni HTTP javobga qo'yish | E'tiborsiz qoldiriladi (sinovda 2-qadam) | HTTPS javoblarda |
| Darhol `max-age=31536000; includeSubDomains` | HTTPS'siz subdomen bo'lsa — u bir yilga ochilmay qoladi | Avval qisqa `max-age`, hamma subdomenlar HTTPS'da ekanini tekshirib, keyin uzaytirish |
| Faqat ota domenda header | Brauzer subdomenni birinchi ochishi mumkin | Har xostda header |
| HTTPS'ni o'chirib, HSTS'ni "keyin o'chiraman" deb o'ylash | `max-age=0` faqat HTTPS orqali qabul qilinadi | Avval `max-age=0` ni HTTPS'da yuborish, muddat o'tishini kutish |
| HTTP'da boshqa xostga (`http://example.com` → `https://www.example.com`) yo'naltirish | `example.com` uchun HSTS o'rnatilmaydi (MDN TLS) | Avval o'sha xostning HTTPS versiyasiga |
| `preload` ni talablarsiz qo'yish | Kamida 1 yil va `includeSubDomains` kerak | Talablar bajarilgach |

## Amaliyot

1. HSTS qaysi hujumga qarshi? Nega `301` yetarli emas?
2. Nega HTTP javobidagi HSTS header e'tiborsiz qoldiriladi?
3. Sinovda HSTS'dan keyin `http://kitob.test:8108/` nega ochilmadi?
4. `includeSubDomains` bilan `secure.example.com` siyosati `example.com` ga tegishlimi?
5. HSTS'ni qanday o'chirish mumkin?
6. Birinchi tashrifni nima himoyalaydi?

<details>
<summary>Javoblar</summary>

1. SSL stripping (MITM'ning bir turi). `301` dan oldingi birinchi so'rov hali ochiq — uni tutib qolish mumkin.
2. Aks holda MITM hujumchisi header'ni o'zgartirishi yoki HTTPS'ni qo'llamaydigan xostga qo'shib, saytni ishlamas qilib qo'yishi mumkin edi.
3. HSTS barcha portlarga tegishli: brauzer 8108-portga HTTPS bilan ulandi, u yerda esa oddiy HTTP server edi (`ERR_SSL_PROTOCOL_ERROR`).
4. Yo'q — faqat uning subdomenlariga.
5. HTTPS javobida `Strict-Transport-Security: max-age=0`.
6. HSTS preload ro'yxati — brauzerga oldindan kiritilgan domenlar.

</details>

## Rasmiy hujjat

- [MDN: Strict-Transport-Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)
- [MDN: Transport Layer Security — Upgrading HTTP connections](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security)
- [RFC 6797: HTTP Strict Transport Security](https://www.rfc-editor.org/rfc/rfc6797)
- [HSTS Preload List](https://hstspreload.org/)
- [curl qo'llanmasi: `--hsts`](https://curl.se/docs/manpage.html)
