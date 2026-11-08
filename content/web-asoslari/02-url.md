# 02 — URL

[Mundarija](README.md)

## Tushuncha

**URL** (Uniform Resource Locator) — internetdagi resursning **manzili**. MDN (What is a URL?): brauzer HTML sahifa, CSS fayl, rasm va boshqa resurslarni aynan URL bo'yicha topib oladi. Nazariyada har URL bitta resursni ko'rsatadi; amalda resurs o'chirilgan yoki ko'chgan bo'lishi mumkin — URL va resursni boshqarish server egasining ishi.

### URL qismlari

Bitta to'liq URL'ni bo'laklarga ajratamiz:

```text
https://ali:sir@www.example.com:8080/kitob/bob.html?q=salom&til=uz#oxiri
└─┬─┘   └──┬──┘ └──────┬──────┘ └┬─┘└──────┬──────┘└──────┬──────┘└─┬─┘
sxema  login:parol   xost      port      yo'l       so'rov qatori  fragment
```

| Qism | Misolda | Vazifasi (MDN) |
| --- | --- | --- |
| **Sxema** (scheme) | `https` | Brauzer resursni qaysi **protokol** bilan so'rashi kerak. Saytlar uchun odatda `https` yoki `http` (shifrlanmagan varianti). Boshqalari ham bor: `mailto:` pochta dasturini ochadi |
| **Avtoritet** (authority) | `www.example.com:8080` | Sxemadan `://` bilan ajraladi. Ichida **domen** (qaysi veb-server) va **port** (serverdagi "darvoza"), ular `:` bilan ajratilgan |
| **Yo'l** (path) | `/kitob/bob.html` | Serverdagi resurs yo'li. Vebning boshida bu diskdagi haqiqiy fayl edi; hozir ko'pincha server o'zi talqin qiladigan nom, diskda bunday fayl bo'lmasligi mumkin |
| **Parametrlar** — so'rov qatori (query) | `?q=salom&til=uz` | Serverga qo'shimcha ma'lumot: `kalit=qiymat` juftlari, `&` bilan ajratilgan. Har server ularni o'z qoidasi bilan o'qiydi |
| **Fragment** (anchor, fragment identifier) | `#oxiri` | Resurs **ichidagi** joy — "xatcho'p". HTML sahifada brauzer shu joyga suriladi. `#` dan keyingi qism **serverga hech qachon yuborilmaydi** |
| Login va parol | `ali:sir@` | MDN: HTTP autentifikatsiyasi (16-bob) uchun ishlatilgan, xavfsizlik sababli **eskirgan** (deprecated) |

MDN o'xshatishi — pochta manzili: sxema — qaysi pochta xizmati, domen — shahar, port — indeks, yo'l — bino, parametrlar — xonadon raqami, fragment — xat egasining o'zi.

**Port** (MDN): server HTTP'ning standart portlarida ishlasa (`http` — 80, `https` — 443), port odatda yozilmaydi; boshqa portda bo'lsa — majburiy.

`mailto:ali@example.com` kabi URL'larda **avtoritet yo'q**: shuning uchun `:` dan keyin `//` kelmaydi, `:` faqat sxemani ajratadi.

### Mutlaq va nisbiy URL

Manzil satrida URL'ning konteksti yo'q — u **to'liq** (mutlaq, absolute) bo'lishi kerak. HTML sahifa ichida esa brauzer sahifaning o'z URL'ini biladi va yetishmagan qismlarni undan oladi — bu **nisbiy** (relative) URL. MDN turlari:

| Nisbiy URL | Nima yetishmaydi | Brauzer nima qiladi |
| --- | --- | --- |
| `//cdn.example.com/a.js` | Faqat sxema | Joriy sahifaning sxemasini oladi |
| `/rasm/logo.svg` | Sxema va domen | Yo'l `/` bilan boshlangan — server **ildizidan** qidiradi |
| `izoh.html` | Sxema, domen, yo'l boshi | Joriy hujjat turgan **papkadan** qidiradi |
| `../index.html` | Xuddi shunday, `..` bilan | Bir papka **yuqoriga** chiqadi (UNIX fayl tizimidan kelgan) |
| `#boshi` | Fragmentdan boshqa hammasi | Joriy URL'ning fragmentini almashtiradi |

### Maxsus belgilarni kodlash

URL'da ba'zi belgilar **ajratuvchi** vazifasini bajaradi: `?` so'rov qatorini, `&` juftlarni, `=` kalit va qiymatni, `#` fragmentni, `/` yo'l bo'laklarini boshlaydi. Matnning o'zida shu belgilar (yoki bo'sh joy, lotin bo'lmagan harflar) bo'lsa, ular **foiz bilan kodlanadi** (percent-encoding): belgining UTF-8 baytlari `%` va ikki o'n oltilik raqam bilan yoziladi. Masalan, bo'sh joy — `%20`, `&` — `%26`.

MDN (`encodeURIComponent()`) misoli: foydalanuvchi qidiruvga `Jack & Jill` yozsa va u kodlanmasa, server `&` ni **yangi parametr boshlanishi** deb tushunadi va ma'lumot buziladi.

JavaScript'da uch vosita:

| Vosita | Nima qiladi (MDN) |
| --- | --- |
| `encodeURIComponent()` | Bitta **qism**ni (yo'l bo'lagi, parametr qiymati) kodlaydi. `A–Z a–z 0–9 - _ . ! ~ * ' ( )` dan boshqa hamma belgini, jumladan `?`, `=`, `/`, `&`, `:` ni ham kodlaydi |
| `encodeURI()` | **Butun** URL uchun: URL sintaksisiga kiruvchi belgilarni (`?`, `&`, `/`…) kodlamaydi |
| `URLSearchParams` | So'rov qatorini yasaydi va o'qiydi. `application/x-www-form-urlencoded` qoidasi bilan kodlaydi: bo'sh joy `+` bo'ladi; o'qishda esa `+` ni bo'sh joy deb tushunadi |

### Origin

MDN (Origin): veb-kontentning **origin**'i — uni ochgan URL'ning **sxemasi**, **xosti** (domen) va **porti**. Ikki manzil faqat uchala qismi ham mos kelsa **bir origin**'da (same origin). Yo'l, so'rov qatori va fragment origin'ga kirmaydi.

| A | B | Bir origin? | Nega |
| --- | --- | --- | --- |
| `http://example.com/app1/index.html` | `http://example.com/app2/index.html` | Ha | Faqat yo'l farq qiladi |
| `http://example.com:80` | `http://example.com` | Ha | `http` ning standart porti 80 |
| `http://example.com/app1` | `https://example.com/app2` | Yo'q | Sxema farqli |
| `http://example.com` | `http://www.example.com` | Yo'q | Xost farqli |
| `http://example.com` | `http://example.com:8080` | Yo'q | Port farqli |

Brauzer ba'zi amallarni faqat bir origin ichida ruxsat etadi (18-bob); bu cheklovni server **CORS** bilan yumshatadi (19-bob).

**Shaffof bo'lmagan origin** (opaque origin, MDN): haqiqiy origin'i yashirilgan yoki umuman yo'q resurslar uchun brauzerning ichki qiymati; matn ko'rinishida doim `null` va hech qaysi boshqa origin'ga (hatto boshqa `null` ga ham) teng emas. Misollar: `sandbox` atributli `iframe` (`allow-same-origin` siz) ichidagi hujjat, odatda `file:` URL'lari.

## Ko'rib chiqamiz

### Brauzer: URL'ni bo'laklarga ajratish

Brauzerning `URL` interfeysi (MDN: URL) URL'ni tahlil qiladi (parse), qismlarini o'qish va o'zgartirishga imkon beradi. Quyidagilar Chromium'da (Playwright orqali) lokal sahifa `http://localhost:8642/maqola/?mavzu=url#bolim` ichida bajarildi.

```js
const u = new URL('https://ali:sir@www.example.com:8080/kitob/bob.html?q=salom&til=uz#oxiri')
for (const k of ['href','protocol','username','password','host','hostname','port','pathname','search','hash','origin'])
  console.log(k.padEnd(9), JSON.stringify(u[k]))
```

```text tashqi
href      "https://ali:sir@www.example.com:8080/kitob/bob.html?q=salom&til=uz#oxiri"
protocol  "https:"
username  "ali"
password  "sir"
host      "www.example.com:8080"
hostname  "www.example.com"
port      "8080"
pathname  "/kitob/bob.html"
search    "?q=salom&til=uz"
hash      "#oxiri"
origin    "https://www.example.com:8080"
```

- `protocol` oxirida `:` bor; `search` `?` bilan, `hash` `#` bilan boshlanadi.
- `host` — xost va port birga, `hostname` — faqat xost.
- `origin` — sxema, xost, port; login, parol, yo'l va boshqalar unda yo'q.

**Standart port** yozilsa, brauzer uni tashlab yuboradi:

```text tashqi
https://example.com:443/   → port ""  href https://example.com/
http://example.com:80/     → port ""  href http://example.com/
https://example.com:8443/  → port "8443"  href https://example.com:8443/
```

**Origin**'lar — MDN jadvalidagi manzillar va ikki maxsus holat:

```text tashqi
http://example.com/app1/index.html   → http://example.com
http://example.com/app2/index.html   → http://example.com
http://example.com:80                → http://example.com
https://example.com                  → https://example.com
http://www.example.com               → http://www.example.com
http://example.com:8080              → http://example.com:8080
mailto:ali@example.com               → null
file:///tmp/a.html                   → file://
```

- Birinchi uchtasi bir xil: `http://example.com`.
- `mailto:` — shaffof bo'lmagan origin, `null`.
- `file:` uchun Chromium `file://` ni qaytardi (kuzatildi). WHATWG URL Standard (4.7-bo'lim) `file:` uchun aniq qoida bermaydi — "o'quvchiga mashq" deb qoldiradi va shubha bo'lsa shaffof bo'lmagan origin qaytarishni aytadi; MDN ham "odatda shaffof bo'lmagan origin" deydi.
- Standartda origin `ftp`, `http`, `https`, `ws`, `wss` (va `blob`) uchun hisoblanadi; boshqa sxemalar (masalan, `mailto:`) — shaffof bo'lmagan origin.

### Brauzer: nisbiy URL'larni hal qilish

`new URL(nisbiy, asos)` — nisbiy URL'ni asos URL'ga qarab to'liq qiladi; brauzer `<a href>`, `<img src>` uchun xuddi shunday qiladi. Asos — joriy sahifa:

```text tashqi
# 4. nisbiy URL, joriy sahifa: http://localhost:8642/maqola/?mavzu=url#bolim
//cdn.example.com/a.js   → http://cdn.example.com/a.js
/rasm/logo.svg           → http://localhost:8642/rasm/logo.svg
izoh.html                → http://localhost:8642/maqola/izoh.html
../index.html            → http://localhost:8642/index.html
?sahifa=2                → http://localhost:8642/maqola/?sahifa=2
#boshi                   → http://localhost:8642/maqola/?mavzu=url#boshi
```

- `//cdn…` sahifaning sxemasini (`http`) oldi.
- `/rasm/…` — server ildizidan, `/maqola/` e'tiborsiz qoldi.
- `izoh.html` — `/maqola/` papkasidan; `../` — bir papka yuqoridan.
- `?sahifa=2` — eski so'rov qatori **va** fragment almashtirildi; `#boshi` — faqat fragment.

### Brauzer: kodlash

```text tashqi
encodeURIComponent("Jack & Jill")      → Jack%20%26%20Jill
encodeURIComponent("o'zbek tili?")    → o'zbek%20tili%3F
encodeURIComponent("Toshkent/Chilonzor") → Toshkent%2FChilonzor
encodeURI("https://example.com/a b?q=1&r=2") → https://example.com/a%20b?q=1&r=2
URLSearchParams      → q=Jack+%26+Jill&shahar=G%27ijduvon
get("q") dan          → a b+c
searchParams.set     → https://example.com/qidiruv?q=narx+100%25+%2B+soliq
pathname bilan       → https://example.com/hujjatlar/yangi%20fayl.pdf
```

| Natija | Izoh |
| --- | --- |
| `Jack%20%26%20Jill` | Bo'sh joy `%20`, `&` — `%26`: endi u parametrlarni ajratmaydi |
| `o'zbek%20tili%3F` | `'` kodlanmadi — u `encodeURIComponent` tegmaydigan belgilar ro'yxatida; `?` — `%3F` |
| `Toshkent%2FChilonzor` | `/` ham kodlandi — qiymat ichidagi `/` yo'l bo'lagiga aylanmaydi |
| `encodeURI(…)` | Faqat bo'sh joy kodlandi; `?`, `&`, `/` URL tuzilmasi sifatida qoldi |
| `q=Jack+%26+Jill&shahar=G%27ijduvon` | `URLSearchParams`: bo'sh joy `+`, `'` esa `%27` (form-urlencoded qoidasi) |
| `get("q")` → `a b+c` | O'qishda `+` bo'sh joyga, `%2B` esa `+` ga aylandi |
| `narx+100%25+%2B+soliq` | `searchParams.set` qiymatni o'zi kodlaydi: `%` → `%25`, `+` → `%2B` |
| `yangi%20fayl.pdf` | `pathname` ga yozilgan bo'sh joy `%20` bo'ldi |

Xulosa: qiymatni URL'ga **qo'lda ulamang** — `URLSearchParams`/`searchParams` yoki `encodeURIComponent` ishlating.

### Brauzer: xalqaro domen va xato URL

```text tashqi
https://☕.example/     → hostname xn--53h.example
https://тест.example/  → hostname xn--e1aybc.example
https://EXAMPLE.com/   → hostname example.com
URL.canParse("example.com") → false
new URL("example.com") → TypeError: Failed to construct 'URL': Invalid URL
URL.parse("/a")           → null
```

- Lotin bo'lmagan domen DNS'ga **ASCII** ko'rinishida, `xn--` bilan boshlanadigan **Punycode** bilan boradi. WHATWG URL Standard `☕.example` → `xn--53h.example` misolini keltiradi — natija aynan shu.
- Domen kichik harfga o'tkazildi.
- `example.com` — sxemasiz, asossiz: bu to'liq URL emas. `new URL` xato tashlaydi (MDN: "Throws if the passed arguments don't define a valid URL"), `URL.canParse()` — `false`, `URL.parse()` — `null`.

### Fragment serverga bormaydi

Brauzer `http://localhost:8642/maqola/?mavzu=url#bolim` ni ochdi. Sahifa `#bolim` sarlavhasigacha surildi:

```text tashqi
location.hash  → #bolim  scrollY>0: true
```

Shu paytda serverning (`python3 -m http.server`) jurnali:

```text tashqi
::1 - - [08/Nov/2026 12:40:52] "GET /maqola/?mavzu=url HTTP/1.1" 200 -
```

So'rovda `?mavzu=url` bor, `#bolim` **yo'q**: fragmentni brauzer o'zi ishlatadi.

### Server tomoni: `curl`

VPS'da `127.0.0.1:8080` da xuddi shunday kichik server (`python3 -m http.server`) ishga tushirildi.

`curl -w` ning `url.*` o'zgaruvchilari (curl 8.1.0 dan) URL qismlarini ko'rsatadi:

```text vps
$ curl -s -o /dev/null -w '%{url.scheme} | %{url.host} | %{url.port} | %{url.path} | %{url.query} | %{url.fragment}\n' 'http://127.0.0.1:8080/maqola/?mavzu=url#bolim'
http | 127.0.0.1 | 8080 | /maqola/ | mavzu=url | bolim
```

Parametrlarni `curl` o'zi kodlashi uchun `--data-urlencode` va `-G` (ma'lumotni so'rov qatoriga qo'shadi):

```text vps
$ curl -s -o /dev/null -G --data-urlencode "q=Jack & Jill" --data-urlencode "shahar=G'ijduvon" -w '%{url_effective}\n' http://127.0.0.1:8080/qidiruv
http://127.0.0.1:8080/qidiruv?q=Jack+%26+Jill&shahar=G%27ijduvon
```

Natija brauzerdagi `URLSearchParams` bilan bir xil chiqdi.

Kodlanmagan bo'sh joy:

```text vps
$ curl -s -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:8080/yangi fayl.pdf'; echo "exit: $?"
000
exit: 3
$ curl -s -o /dev/null -w '%{http_code}\n' 'http://127.0.0.1:8080/yangi%20fayl.pdf'
404
```

- Birinchisida so'rov **umuman ketmadi**: `000` — javob yo'q, chiqish kodi `3` — curl qo'llanmasida "URL malformed. The syntax was not correct."
- `%20` bilan so'rov ketdi; `404` — bunday fayl yo'q, lekin URL to'g'ri.

Server jurnali:

```text vps
$ cat /tmp/u.log
127.0.0.1 - - [08/Nov/2026 10:41:21] "GET /maqola/?mavzu=url HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2026 10:41:21] code 404, message File not found
127.0.0.1 - - [08/Nov/2026 10:41:21] "GET /qidiruv?q=Jack+%26+Jill&shahar=G%27ijduvon HTTP/1.1" 404 -
127.0.0.1 - - [08/Nov/2026 10:41:21] code 404, message File not found
127.0.0.1 - - [08/Nov/2026 10:41:21] "GET /yangi%20fayl.pdf HTTP/1.1" 404 -
```

Birinchi qatorda ham `#bolim` yo'q: `curl` fragmentni o'zi ko'rsatdi (`url.fragment`), lekin serverga yubormadi.

## Standartda nima deyilgan

Brauzerlar **WHATWG URL Standard** ga amal qiladi (Living Standard, 2026-10-19 tahriri). Uning maqsadlaridan biri — RFC 3986 va RFC 3987 ni hozirgi brauzerlar amalda qanday ishlashiga moslashtirish; "URI" va "IRI" atamalari o'rniga yagona "URL" atamasi.

**Maxsus sxemalar** (special scheme, 4.2-bo'lim) va ularning standart porti:

| Sxema | Standart port |
| --- | --- |
| `ftp` | 21 |
| `file` | — (yo'q) |
| `http` | 80 |
| `https` | 443 |
| `ws` | 80 |
| `wss` | 443 |

Shu jadval tufayli `https://example.com:443/` dan `:443` tashlab yuborildi.

**Foiz bilan kodlash to'plamlari** (percent-encode set, 1.3-bo'lim): URL'ning har qismida qaysi belgilar kodlanishi alohida belgilangan — fragment, so'rov qatori, yo'l, login/parol uchun turlicha to'plam. Eng kengi — **component** to'plami; standart bo'yicha u bilan kodlash JavaScript'dagi `encodeURIComponent()` bilan bir xil natija beradi. `application/x-www-form-urlencoded` to'plami bundan ham keng (`!`, `'`, `(`, `)`, `~` ham kodlanadi) — shuning uchun `URLSearchParams` `'` ni `%27` qildi, `encodeURIComponent` esa qoldirdi.

**Xalqaro domenlar**: standart IDNA2008 emas, Unicode IDNA Compatibility Processing (UTS #46) dan foydalanadi; `☕.example` → `xn--53h.example`.

**Origin** (4.7-bo'lim) HTML standartida ta'riflangan; URL Standard URL'dan origin qanday olinishini yozadi.

RFC 3986 — URI'ning umumiy sintaksisi (2005-yil yanvar); MDN (`URL`) URL'lar uning qoidalari bilan kodlanishini aytadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'risi |
| --- | --- | --- |
| Qiymatni URL'ga qo'lda ulash: `"?q=" + matn` | `&`, `#`, `+`, bo'sh joy URL tuzilmasini buzadi (`Jack & Jill` ikki parametrga bo'linadi) | `URLSearchParams` / `url.searchParams.set()` yoki `encodeURIComponent()` |
| Parametr qiymatini `encodeURI()` bilan kodlash | `encodeURI` `&`, `=`, `?`, `/` ni kodlamaydi | Qism uchun — `encodeURIComponent()` |
| Fragmentni serverda o'qishga urinish | Fragment serverga yuborilmaydi (jurnalda yo'q) | Serverga kerak bo'lsa — so'rov qatori yoki yo'lda |
| `+` ni so'rov qatorida "plyus" deb kutish | form-urlencoded o'qishda `+` — bo'sh joy (`a+b` → `a b`) | Plyus — `%2B` (`searchParams.set` o'zi shunday qiladi) |
| `http://example.com` va `https://example.com` ni bir sayt deb hisoblash | Sxema farqli — origin farqli | Origin = sxema + xost + port |
| `example.com` va `www.example.com` ni bir origin deb hisoblash | Xost farqli | Har biri alohida origin |
| `new URL("example.com")` | Sxemasiz to'liq URL emas — `TypeError` | `https://` qo'shish yoki asos URL berish; avval `URL.canParse()` |
| Login va parolni URL'ga yozish (`https://ali:sir@…`) | MDN: eskirgan, xavfsiz emas | 16-bob: `Authorization` header'i |

## Amaliyot

1. `https://shop.example.uz:8443/tovar/42?rang=qizil#sharh` — sxema, xost, port, yo'l, so'rov qatori va fragmentni ayting. Origin qanday?
2. `https://example.com` va `https://example.com:443/kirish` bir origin'dami?
3. Joriy sahifa `https://example.com/blog/2026/maqola.html`. `rasm.png`, `/rasm.png`, `../index.html` qaysi to'liq URL'larga aylanadi?
4. Qidiruv matni `100% & bepul` ni so'rov qatoriga qanday qo'shish kerak?
5. Nega `#sharh` ni server jurnalida ko'rmaysiz?
6. `encodeURIComponent` va `URLSearchParams` bo'sh joyni qanday kodlaydi?

<details>
<summary>Javoblar</summary>

1. Sxema `https`, xost `shop.example.uz`, port `8443`, yo'l `/tovar/42`, so'rov qatori `?rang=qizil`, fragment `#sharh`. Origin: `https://shop.example.uz:8443`.
2. Ha: `https` ning standart porti 443, yo'l origin'ga kirmaydi.
3. `https://example.com/blog/2026/rasm.png`, `https://example.com/rasm.png`, `https://example.com/blog/index.html`.
4. `url.searchParams.set('q', '100% & bepul')` (natija `q=100%25+%26+bepul`) yoki `encodeURIComponent` bilan.
5. Fragment serverga yuborilmaydi — uni brauzer sahifa ichidagi joyni topish uchun o'zi ishlatadi.
6. `encodeURIComponent` — `%20`; `URLSearchParams` — `+`.

</details>

## Rasmiy hujjat

- [MDN: What is a URL?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL)
- [MDN: Origin](https://developer.mozilla.org/en-US/docs/Glossary/Origin)
- [MDN: URL](https://developer.mozilla.org/en-US/docs/Web/API/URL)
- [MDN: URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
- [MDN: encodeURIComponent()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
- [WHATWG URL Standard](https://url.spec.whatwg.org/)
- [RFC 3986: URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [curl qo'llanmasi: `-w` (`url.*`), `--data-urlencode`, `-G`, chiqish kodlari](https://curl.se/docs/manpage.html)
