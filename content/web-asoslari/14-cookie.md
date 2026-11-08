# 14 — Cookie

[Mundarija](README.md)

## Tushuncha

5-bobda ko'rdik: HTTP **holatsiz** — server ikki so'rov bir foydalanuvchidanmi, bilmaydi. MDN (Using HTTP cookies): **cookie** — server brauzerga yuboradigan kichik ma'lumot bo'lagi. Brauzer uni saqlaydi va keyingi so'rovlarda **o'sha serverga qaytarib yuboradi**. Shu tariqa server "bu yana o'sha brauzer" ekanini biladi.

Uch asosiy vazifa (MDN):

| Vazifa | Misol |
| --- | --- |
| **Sessiya boshqaruvi** | Kirgan foydalanuvchi, savatcha, o'yin hisobi |
| **Shaxsiylashtirish** | Til, mavzu (qora/oq) |
| **Kuzatish** (tracking) | Foydalanuvchi xatti-harakatini yozib borish va tahlil qilish |

Kirish tizimi (MDN): foydalanuvchi login va parolni yuboradi → server to'g'ri bo'lsa, javobda **sessiya identifikatori** bor cookie qaytaradi → keyingi sahifalarda brauzer shu cookie'ni yuboradi → server identifikatorni tekshirib, shaxsiy sahifani beradi (15-bob).

**Ma'lumot saqlash uchun emas.** MDN: ilgari cookie umumiy ombor sifatida ishlatilgan; endi buning uchun Web Storage (`localStorage`, `sessionStorage`) va IndexedDB bor. Cookie'ning kamchiliklari: domen bo'yicha soni (odatda yuzlab) va hajmi (odatda 4 KB) cheklangan, **har so'rov** bilan yuboriladi.

### `Set-Cookie` va `Cookie`

```http
HTTP/2.0 200 OK
Set-Cookie: yummy_cookie=chocolate
Set-Cookie: tasty_cookie=strawberry

GET /sample_page.html HTTP/2.0
Cookie: yummy_cookie=chocolate; tasty_cookie=strawberry
```

- Server har cookie uchun **alohida** `Set-Cookie` header yuboradi: `nom=qiymat`, keyin `;` bilan atributlar.
- Brauzer **bitta** `Cookie` header'ida hammasini `; ` bilan ajratib yuboradi — atributlarsiz, faqat `nom=qiymat`.

### Atributlar

| Atribut | Nima qiladi (MDN) |
| --- | --- |
| `Expires=<sana>` | Shu sanagacha saqlanadi |
| `Max-Age=<soniya>` | Shuncha soniya saqlanadi. Ikkalasi bo'lsa — `Max-Age` ustun (sana mijoz soatiga bog'liq, xatoga moyil). `0` yoki manfiy — darhol o'chirish |
| (ikkalasi ham yo'q) | **Sessiya cookie'si** — "joriy sessiya" tugaganda o'chadi; sessiyani qachon tugashini brauzer o'zi belgilaydi (oynalarni tiklash bilan cheksiz yashashi mumkin) |
| `Domain=<domen>` | Shu domen **va uning subdomenlari**ga yuboriladi. Berilmasa — faqat o'rnatgan xostga (subdomenlarga emas). Server faqat o'z domenini yoki ota domenini yoza oladi |
| `Path=<yo'l>` | So'rov yo'li shu bilan boshlansa yuboriladi: `Path=/docs` → `/docs`, `/docs/Web/`; lekin `/`, `/docsets` emas. MDN: bu xavfsizlik vositasi **emas** |
| `Secure` | Faqat HTTPS orqali yuboriladi (istisno — `localhost`, Safari'dan tashqari) |
| `HttpOnly` | JavaScript (`document.cookie`) o'qiy olmaydi — faqat serverga yuboriladi. XSS'dan himoya (21-bob) |
| `SameSite=Strict\|Lax\|None` | Boshqa saytdan kelgan so'rovlarda yuborilsinmi (pastda) |

**Sessiya cookie'sini qayta yaratish.** MDN: foydalanuvchi har kirganda sessiya cookie'si **yangilansin** — aks holda boshqa kishi oldindan berilgan identifikatordan foydalanishi mumkin (session fixation, 15-bob).

### `SameSite`

**Sayt** (site, MDN) — ro'yxatdan o'tkaziladigan domen (`example.com`) va sxema. **Boshqa saytdan kelgan so'rov** (cross-site) — sahifa bir saytda, so'rov boshqa saytga.

| Qiymat | Boshqa saytdagi sahifadan kelgan so'rovda (MDN) |
| --- | --- |
| `Strict` | **Yuborilmaydi**. Faqat cookie o'rnatgan saytning o'z sahifalaridan |
| `Lax` | Faqat foydalanuvchi shu saytga **o'tganda** (havola bosganda) yuboriladi; rasm, `fetch()` kabi ichki so'rovlarda — yo'q |
| `None` | Har doim yuboriladi. **`Secure` majburiy** |
| (berilmagan) | `Lax` deb hisoblanadi |

`SameSite` ma'lumot oqib ketishini kamaytiradi va CSRF'dan qisman himoya qiladi (20-bob).

### Prefikslar

MDN: server cookie qayerdan va qanday o'rnatilganini bila olmaydi — masalan, subdomendagi ilova `Domain` bilan butun domenga cookie qo'yishi mumkin. Shuning uchun nom **prefikslari** — brauzer shartlarni tekshiradi, bajarilmasa cookie'ni rad etadi:

| Prefiks | Shart |
| --- | --- |
| `__Secure-` | `Secure`, HTTPS sahifadan |
| `__Host-` | `Secure`, HTTPS, `Domain` **yo'q**, `Path=/` — faqat o'rnatgan xostga |
| `__Http-` | `Secure`, HTTPS va `HttpOnly` — faqat `Set-Cookie` orqali, JavaScript emas |
| `__Host-Http-` | `__Host-` va `__Http-` shartlari birga |

Prefiks cookie nomining bir qismi — server uni to'liq nomi bilan tekshiradi.

### Uchinchi tomon cookie'lari va qonunlar

MDN: boshqa saytga joylashtirilgan kontent (masalan, `iframe`) o'rnatgan cookie — **uchinchi tomon** (third-party) cookie. Ular foydalanuvchini saytlar bo'ylab kuzatishga imkon beradi; brauzerlar ularni standart holatda bloklayapti yoki bloklashni rejalashtirgan. GDPR va ePrivacy (Yevropa Ittifoqi), CCPA (Kaliforniya) kabi qonunlar cookie haqida xabar berish va undan voz kechish imkonini talab qiladi.

## Ko'rib chiqamiz

Python serveri: har so'rovda kelgan `Cookie` header'ini jurnalga yozadi; `/kirish`, `/chiqish`, `/samesite` — cookie o'rnatadi yoki o'chiradi:

```python
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

COOKIE_LAR = {
    '/kirish': ['sessiya=a3fWa; HttpOnly; Path=/',
                'til=uz; Max-Age=3600; Path=/',
                'vaqtincha=1; Path=/',
                'yol=docs; Path=/docs',
                'maxfiy=1; Secure; Path=/'],
    '/chiqish': ['til=; Max-Age=0; Path=/'],
    '/samesite': ['qattiq=1; SameSite=Strict; Path=/',
                  'yumshoq=1; SameSite=Lax; Path=/',
                  'hamma=1; SameSite=None; Secure; Path=/',
                  'belgisiz=1; Path=/'],
}


class Ishlovchi(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def do_GET(self):
        print(f'{self.headers.get("Host")} {self.path} Cookie: {self.headers.get("Cookie")}', flush=True)
        tana = b'<!doctype html><a id="havola" href="http://localhost:8085/korsat">havola</a>\n'
        self.send_response(200)
        for c in COOKIE_LAR.get(self.path, []):
            self.send_header('Set-Cookie', c)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(tana)))
        self.end_headers()
        self.wfile.write(tana)

    def log_message(self, *a):
        pass


ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1])), Ishlovchi).serve_forever()
```

### Brauzer: atributlar amalda

Lokal kompyuterda server `8085` portda, Chromium 158 (Playwright). Ikki **sayt** kerak bo'lgani uchun bitta server ikki nom bilan ochiladi: `localhost` (A sayt) va `127.0.0.1` (B sayt) — xost har xil, demak saytlar har xil.

```js
import { chromium } from '/Users/mfsv/Projects/dev-docs/node_modules/playwright-core/index.mjs'
const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage()
const A = 'http://localhost:8085', B = 'http://127.0.0.1:8085'
await p.goto(A + '/kirish')
console.log('[1] document.cookie:', await p.evaluate(() => document.cookie))
await p.evaluate(() => { document.cookie = 'sessiya=JS-dan'; document.cookie = 'mavzu=qora' })
console.log('[2] JS yozgandan keyin:', await p.evaluate(() => document.cookie))
for (const c of await ctx.cookies()) console.log('   ', c.name, '=', c.value, '| httpOnly', c.httpOnly, '| secure', c.secure, '| sameSite', c.sameSite, '| path', c.path, '| expires', c.expires === -1 ? 'sessiya' : 'sana bor')
await p.goto(A + '/'); await p.goto(A + '/docs/git'); await p.goto(A + '/chiqish'); await p.goto(A + '/')
console.log('[3] chiqishdan keyin:', await p.evaluate(() => document.cookie))
await ctx.clearCookies()
await p.goto(A + '/samesite')
await p.goto(B + '/')
await p.evaluate(u => { const i = new Image(); i.src = u + '/rasm'; return new Promise(r => { i.onload = i.onerror = r }) }, A)
await p.evaluate(u => fetch(u + '/fetch', { credentials: 'include', mode: 'no-cors' }), A)
await p.click('#havola'); await p.waitForLoadState()
console.log('chromium', b.version())
await b.close()
```

```text tashqi
[1] document.cookie: til=uz; vaqtincha=1; maxfiy=1
[2] JS yozgandan keyin: til=uz; vaqtincha=1; maxfiy=1; mavzu=qora
    yol = docs | httpOnly false | secure false | sameSite Lax | path /docs | expires sessiya
    sessiya = a3fWa | httpOnly true | secure false | sameSite Lax | path / | expires sessiya
    til = uz | httpOnly false | secure false | sameSite Lax | path / | expires sana bor
    vaqtincha = 1 | httpOnly false | secure false | sameSite Lax | path / | expires sessiya
    maxfiy = 1 | httpOnly false | secure true | sameSite Lax | path / | expires sessiya
    mavzu = qora | httpOnly false | secure false | sameSite Lax | path / | expires sessiya
[3] chiqishdan keyin: vaqtincha=1; maxfiy=1; mavzu=qora
```

| Kuzatuv | Sabab |
| --- | --- |
| `[1]` da `sessiya` yo'q | `HttpOnly` — JavaScript ko'rmaydi |
| `[1]` da `yol` yo'q | `Path=/docs` — sahifa `/kirish` da |
| `maxfiy` (`Secure`) saqlandi | Sahifa `http://localhost` — MDN'dagi `localhost` istisnosi |
| `[2]` da `document.cookie = 'sessiya=JS-dan'` ta'sir qilmadi | `HttpOnly` cookie'ni JavaScript **yoza ham olmaydi** (kuzatildi) |
| `mavzu=qora` qo'shildi | JavaScript oddiy cookie yarata oladi |
| Hammasida `sameSite Lax` | `SameSite` berilmagan — `Lax` deb hisoblandi |
| `til` — `sana bor`, qolganlari — `sessiya` | Faqat `til` da `Max-Age` bor |
| `[3]` da `til` yo'q | `/chiqish`: `til=; Max-Age=0` — o'chirildi |

Server jurnali — brauzer nimani yubordi:

```text tashqi
localhost:8085 /kirish Cookie: None
localhost:8085 / Cookie: sessiya=a3fWa; til=uz; vaqtincha=1; maxfiy=1; mavzu=qora
localhost:8085 /docs/git Cookie: yol=docs; sessiya=a3fWa; til=uz; vaqtincha=1; maxfiy=1; mavzu=qora
localhost:8085 /chiqish Cookie: sessiya=a3fWa; til=uz; vaqtincha=1; maxfiy=1; mavzu=qora
localhost:8085 / Cookie: sessiya=a3fWa; vaqtincha=1; maxfiy=1; mavzu=qora
```

- `sessiya` (JS ko'rmagan) serverga **yuborildi** — `HttpOnly` faqat JavaScript'dan yashiradi.
- `yol=docs` — faqat `/docs/git` ga.
- Oxirgi so'rovda `til` yo'q — o'chirilgan.

### Brauzer: `SameSite`

A sayt (`localhost`) to'rt cookie o'rnatdi: `qattiq` (`Strict`), `yumshoq` (`Lax`), `hamma` (`None; Secure`), `belgisiz` (atributsiz). Keyin B saytdagi (`127.0.0.1`) sahifadan A saytga: rasm (`<img>`), `fetch(…, { credentials: 'include' })` va havolani bosish:

```text tashqi
localhost:8085 /samesite Cookie: None
127.0.0.1:8085 / Cookie: None
localhost:8085 /rasm Cookie: hamma=1
localhost:8085 /fetch Cookie: hamma=1
localhost:8085 /korsat Cookie: yumshoq=1; hamma=1; belgisiz=1
```

| So'rov B → A | `Strict` | `Lax` | `None` | atributsiz |
| --- | --- | --- | --- | --- |
| Rasm (`/rasm`) | — | — | ✓ | — |
| `fetch()` (`/fetch`) | — | — | ✓ | — |
| Havola bosildi (`/korsat`) | — | ✓ | ✓ | ✓ |

MDN jadvaliga aynan mos: `Strict` boshqa saytdan hech qachon; `Lax` faqat o'tishda; `None` doim; atributsiz — `Lax` kabi.

### `curl`: cookie fayli

VPS'da xuddi shu server (`127.0.0.1:8095`). `curl` cookie'larni o'zi saqlamaydi — `-c` (yozish) va `-b` (o'qish) bilan fayl kerak:

```text vps
$ curl -si http://127.0.0.1:8095/kirish | tr -d '\r' | grep -i '^set-cookie'
Set-Cookie: sessiya=a3fWa; HttpOnly; Path=/
Set-Cookie: til=uz; Max-Age=3600; Path=/
Set-Cookie: vaqtincha=1; Path=/
Set-Cookie: yol=docs; Path=/docs
Set-Cookie: maxfiy=1; Secure; Path=/
$ cd /tmp/k14 && curl -s -c jar.txt -o /dev/null http://127.0.0.1:8095/kirish && cat jar.txt
# Netscape HTTP Cookie File
# https://curl.se/docs/http-cookies.html
# This file was generated by libcurl! Edit at your own risk.

127.0.0.1	FALSE	/	TRUE	0	maxfiy	1
127.0.0.1	FALSE	/docs	FALSE	0	yol	docs
127.0.0.1	FALSE	/	FALSE	0	vaqtincha	1
127.0.0.1	FALSE	/	FALSE	1794132774	til	uz
#HttpOnly_127.0.0.1	FALSE	/	FALSE	0	sessiya	a3fWa
```

curl hujjati (HTTP Cookies): har qator — bitta cookie, TAB bilan ajratilgan 7 maydon: domen, subdomenlarga ham (`FALSE`), yo'l, faqat HTTPS (`TRUE` — `maxfiy`), muddat (1970-yildan beri soniyalar; `0` — sessiya), nom, qiymat. `#HttpOnly_` — `HttpOnly` cookie belgisi.

```text vps
$ cat /tmp/k14/server.log
127.0.0.1:8095 /kirish Cookie: None
127.0.0.1:8095 /kirish Cookie: None
127.0.0.1:8095 / Cookie: vaqtincha=1; sessiya=a3fWa; maxfiy=1; til=uz
127.0.0.1:8095 /docs/git Cookie: yol=docs; vaqtincha=1; sessiya=a3fWa; maxfiy=1; til=uz
127.0.0.1:8095 / Cookie: til=en
```

- `-b jar.txt` bilan curl `Path` qoidasiga amal qildi: `yol` faqat `/docs/git` da.
- `-b 'til=en'` — cookie'ni qo'lda berish. Ya'ni **cookie qiymatini mijoz istalgancha o'zgartira oladi**: MDN — cookie qiymatlari foydalanuvchiga ko'rinadi va u o'zgartira oladi. Serverda unga ishonib bo'lmaydi.

### Haqiqiy sayt

```text vps
$ curl -sI https://github.com/ | tr -d '\r' | grep -i '^set-cookie' | sed -E 's/^([Ss]et-[Cc]ookie: [^=]+=)[^;]*/\1…/; s/expires=[^;]*/expires=…/I'
set-cookie: _gh_sess=…; path=/; HttpOnly; secure; SameSite=Lax
set-cookie: _octo=…; expires=…; domain=.github.com; path=/; secure; SameSite=Lax
set-cookie: logged_in=…; expires=…; domain=.github.com; path=/; HttpOnly; secure; SameSite=Lax
```

(Qiymatlar `…` bilan almashtirildi.) Sessiya cookie'si `_gh_sess` — `HttpOnly`, `secure`, `SameSite=Lax`, `Expires` siz (sessiya cookie'si). `_octo` va `logged_in` — `domain=.github.com`: subdomenlarga ham.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Gap |
| --- | --- | --- |
| RFC 6265 (2011-yil aprel) | 4.1, 4.2 | `Set-Cookie` va `Cookie` sintaksisi |
| RFC 6265 | 4.1.2.1–4.1.2.6 | `Expires`, `Max-Age`, `Domain`, `Path`, `Secure`, `HttpOnly`. Ikkalasi bo'lsa `Max-Age` ustun; hech biri bo'lmasa — "joriy sessiya" tugaguncha |
| RFC 6265 | 5.3, 5.4 | Brauzer cookie'ni qanday saqlaydi va qachon yuboradi |
| RFC 6265 | 8 | Xavfsizlik: ochiq matn (8.3), sessiya identifikatorlari (8.4), zaif maxfiylik va yaxlitlik (8.5, 8.6) |
| RFC 6265bis (qoralama, draft-22) | — | `SameSite` va prefikslar shu yangi tahrirda. Datatracker holati (2026-11-08): IESG tasdiqlagan, RFC muharriri navbatida — hali RFC raqami yo'q |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Sessiya cookie'sini `HttpOnly` siz | XSS bo'lsa, JavaScript uni o'g'irlaydi | `HttpOnly; Secure; SameSite=Lax` (yoki `Strict`) |
| Cookie qiymatiga ishonish (`rol=admin`) | Mijoz uni o'zgartira oladi (`curl -b 'til=en'`) | Cookie'da faqat ma'nosiz identifikator; ma'lumot — serverda |
| Ko'p ma'lumotni cookie'da saqlash | Har so'rov bilan ketadi, ~4 KB chegara | `localStorage`/IndexedDB yoki serverda |
| `SameSite=None` ni `Secure` siz | Brauzer rad etadi (MDN: `Secure` majburiy) | `SameSite=None; Secure` |
| `Path` ni xavfsizlik deb hisoblash | MDN: boshqa yo'ldagi sahifa ham o'qiy oladi | Ajratish kerak bo'lsa — alohida xost (origin) |
| `Domain` ni "xavfsizroq" deb qo'yish | `Domain` berilsa — subdomenlarga **ham** ketadi; bermaslik qattiqroq | Kerak bo'lmasa `Domain` yozmaslik; `__Host-` prefiksi |
| Kirgandan keyin eski sessiya identifikatorini qoldirish | Session fixation | Har kirishda yangi identifikator |
| Cookie'ni o'chirishda `Path` ni boshqacha yozish | Boshqa `Path` — boshqa cookie, eskisi qoladi | O'sha nom, `Path`, `Domain` bilan `Max-Age=0` |

## Amaliyot

1. Cookie qanday uch vazifada ishlatiladi? Qaysi biri uchun endi boshqa vosita tavsiya etiladi?
2. `Set-Cookie: id=7; Max-Age=600; Path=/; HttpOnly` — necha vaqt yashaydi, JavaScript ko'radimi?
3. Sessiya cookie'si nima va u qachon o'chadi?
4. `Domain` berilmagan cookie `app.example.com` da o'rnatildi. U `api.example.com` ga yuboriladimi?
5. Sinovda B saytdan A saytga havola bosilganda qaysi cookie'lar ketdi va nega `qattiq` ketmadi?
6. Nega server cookie qiymatiga ishonmasligi kerak?

<details>
<summary>Javoblar</summary>

1. Sessiya, shaxsiylashtirish, kuzatish. Umumiy ma'lumot saqlash uchun — Web Storage yoki IndexedDB.
2. 600 soniya (10 daqiqa); `HttpOnly` — JavaScript ko'rmaydi.
3. `Expires` ham `Max-Age` ham yo'q cookie; brauzer "joriy sessiya" tugadi deb hisoblaganda o'chadi.
4. Yo'q: `Domain` siz — faqat o'rnatgan xostga.
5. `yumshoq` (`Lax`), `hamma` (`None`), `belgisiz` (standart `Lax`). `Strict` — boshqa saytdan kelgan hech qanday so'rovda yuborilmaydi, o'tishda ham.
6. Qiymat mijoz tomonida saqlanadi va uni istalgancha o'zgartirish mumkin (sinovda `curl -b`).

</details>

## Rasmiy hujjat

- [MDN: Using HTTP cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [MDN: Secure cookie configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/Cookies)
- [RFC 6265: HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265)
- [RFC 6265bis (qoralama)](https://datatracker.ietf.org/doc/draft-ietf-httpbis-rfc6265bis/)
- [curl: HTTP Cookies (cookie fayli formati)](https://curl.se/docs/http-cookies.html)
