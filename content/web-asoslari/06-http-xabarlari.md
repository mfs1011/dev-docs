# 06 — HTTP xabarlari

[Mundarija](README.md)

## Tushuncha

MDN (HTTP messages): **HTTP xabarlari** — mijoz va server ma'lumot almashadigan vosita. Ikki turi bor: **so'rov** (request) — mijoz serverda biror amalni boshlash uchun yuboradi; **javob** (response) — server so'rovga qaytaradi.

Dasturchi xabarni qo'lda kamdan-kam yozadi: buni brauzer, proksi, veb-server qiladi. Lekin xabarni **o'qiy olish** — xatolarni topishning asosi. HTTP/1.x da xabarlar matn; HTTP/2 da ikkilik freymlarga o'ralgan, ammo ma'nosi bir xil. Shuning uchun tuzilmani HTTP/1.1 matnida o'rganamiz.

### Xabar tuzilishi

So'rov ham, javob ham bir xil qolipda (MDN; RFC 9112, 2.1):

| # | Qism | Nima |
| --- | --- | --- |
| 1 | **Boshlang'ich qator** (start-line) | Bitta qator: so'rovda — metod, manzil, versiya; javobda — versiya va natija |
| 2 | **Header'lar** (header fields) | Ixtiyoriy: xabar haqidagi qo'shimcha ma'lumot (metadata), har biri alohida qatorda |
| 3 | **Bo'sh qator** | Header'lar tugadi |
| 4 | **Tana** (body) | Ixtiyoriy: xabar bilan birga keladigan ma'lumot |

Boshlang'ich qator va header'lar birga — xabarning **boshi** (head), undan keyingisi — **tana**. Har qator `CRLF` (`\r\n`) bilan tugaydi. MDN (A typical HTTP session): `Content-Length` bo'lmagan `GET` so'rovida tana bo'sh — server **bo'sh qatorni** olishi bilan so'rovni ishlashga kirishadi.

### So'rov qatori

So'rovning boshlang'ich qatori — **so'rov qatori** (request-line), uch qism, bo'sh joy bilan ajratilgan:

```text
POST /users HTTP/1.1
└┬─┘ └─┬──┘ └──┬───┘
metod  manzil  versiya
```

| Qism | Nima (MDN) |
| --- | --- |
| **Metod** | So'rov ma'nosi: `GET` — resursni olish, `POST` — serverga ma'lumot yuborish va h.k. (7-bob) |
| **So'rov manzili** (request-target) | Odatda yo'l va so'rov qatori |
| **Versiya** | Deyarli doim `HTTP/1.1` (`HTTP/0.9` va `HTTP/1.0` eskirgan). HTTP/2 va undan keyin versiya xabarda yozilmaydi — u ulanish o'rnatilganda kelishiladi |

So'rov manzilining to'rt shakli (MDN):

| Shakl | Misol | Qachon |
| --- | --- | --- |
| **Origin form** | `GET /en-US/docs/Web/HTTP/Guides/Messages HTTP/1.1` | Eng ko'p uchraydigan: yo'l (va so'rov qatori), server uni `Host` bilan birlashtiradi |
| **Absolute form** | `GET https://developer.mozilla.org/… HTTP/1.1` | Proksiga ulanganda — to'liq URL |
| **Authority form** | `CONNECT developer.mozilla.org:443 HTTP/1.1` | Faqat `CONNECT` bilan — tunnel ochish |
| **Asterisk form** | `OPTIONS * HTTP/1.1` | Faqat `OPTIONS` — butun server haqida |

### Header'lar

MDN: HTTP/1.x da har header — **katta-kichik harfni farqlamaydigan** (case-insensitive) nom, `:` va qiymat; hammasi bitta qatorda. Turlari:

| Tur | Nima |
| --- | --- |
| **So'rov header'lari** | So'rovga kontekst beradi yoki server uni qanday ishlashini o'zgartiradi (`Host`, `User-Agent`, `Accept`) |
| **Javob header'lari** | Javob haqida qo'shimcha ma'lumot: `Server` — server dasturi, `Date` — javob yaratilgan vaqt |
| **Taqdimot header'lari** (representation headers) | Tana bo'lsa — uning asl ko'rinishi va qanday kodlangani: `Content-Type`, `Content-Length`, `Content-Encoding` |

### Tana

So'rov tanasi — serverga yuboriladigan ma'lumot. Uning bir necha ko'rinishi bor (MDN):

| Ko'rinish | `Content-Type` | Misol |
| --- | --- | --- |
| Forma maydonlari | `application/x-www-form-urlencoded` | `name=Ali+Valiyev&email=ali%40example.com` (2-bobdagi kodlash) |
| JSON | `application/json` | `{"ism":"Ali","yosh":30}` |
| Ko'p qismli (fayl bilan) | `multipart/form-data` | Har qism alohida, chegaralovchi (boundary) qator bilan ajratilgan |

Javob tanasi — so'ralgan resurs yoki xato tavsifi. Uning uzunligi ikki usulda bildiriladi (MDN):

- `Content-Length` — tana necha bayt;
- `Transfer-Encoding: chunked` — uzunlik oldindan noma'lum, tana **bo'laklab** keladi; har bo'lakning o'z o'lchami bor (RFC 9112, 7.1).

**Tanasiz** javoblar — RFC 9112 (6.3): `HEAD` so'roviga javob, `1xx`, `204 No Content` va `304 Not Modified` — header'lardan keyingi bo'sh qator bilan tugaydi.

### Holat qatori

Javobning boshlang'ich qatori — **holat qatori** (status line):

```text
HTTP/1.1 201 Created
└──┬───┘ └┬┘ └──┬──┘
 versiya kod  izoh
```

- **Holat kodi** (status code) — so'rov muvaffaqiyatli bo'ldimi va nega: `200`, `404`, `302`… (8-bob).
- **Izoh** (reason phrase) — ixtiyoriy, odam uchun qisqa matn; MDN: faqat ma'lumot uchun.

### HTTP/2 xabarlari

MDN: HTTP/1.x ning kamchiliklari — header'lar siqilmaydi va har xabarda takrorlanadi; mijoz javobni kutib, keyin keyingi so'rovni yuboradi; parallel so'rov uchun bir nechta ulanish kerak. HTTP/2 da:

- xabarlar ikkilik **freym**larga o'raladi va ulanishdagi raqamlangan **oqim** (stream) larda yuboriladi;
- bitta TCP ulanishda bir vaqtda ko'p so'rov va javob — **multiplexing**;
- header'lar **HPACK** algoritmi bilan siqiladi;
- boshlang'ich qator o'rniga `:` bilan boshlanadigan **psevdo-header**'lar: so'rovda `:method`, `:scheme`, `:authority`, `:path`; javobda faqat `:status`.

Dasturchi API'lari uchun deyarli farq yo'q: brauzer va server ikkalasi qo'llasa, HTTP/2 o'zi yoqiladi.

## Ko'rib chiqamiz

Hammasi VPS'da.

### `curl -v`: so'rov va javob

`-v` da `>` — yuborilgan so'rov, `<` — olingan javob:

```text vps
$ curl -4 -sv --http1.1 http://example.com/ -o /dev/null 2>&1 | grep -E '^[<>]'
> GET / HTTP/1.1
> Host: example.com
> User-Agent: curl/8.18.0
> Accept: */*
> 
< HTTP/1.1 200 OK
< Date: Sun, 08 Nov 2026 08:36:01 GMT
< Content-Type: text/html; charset=utf-8
< Transfer-Encoding: chunked
< Connection: keep-alive
< Server: cloudflare
< Last-Modified: Thu, 05 Nov 2026 21:17:41 GMT
< Allow: GET, HEAD
< Accept-Ranges: bytes
< Age: 8033
< cf-cache-status: HIT
< alt-svc: h3=":443"; ma=86400
< 
```

**So'rov:**

| Qator | Ma'nosi |
| --- | --- |
| `GET / HTTP/1.1` | So'rov qatori: metod `GET`, manzil `/` (origin form), versiya |
| `Host: example.com` | Qaysi sayt (5-bob: HTTP/1.1 da majburiy) |
| `User-Agent: curl/8.18.0` | Qaysi dastur so'rayapti |
| `Accept: */*` | Qanday formatdagi javob qabul qilinadi — har qanday (9-bob) |
| bo'sh `>` | Header'lar tugadi; `GET` da tana yo'q |

**Javob:**

| Qator | Ma'nosi |
| --- | --- |
| `HTTP/1.1 200 OK` | Holat qatori |
| `Content-Type: text/html; charset=utf-8` | Tana — HTML, UTF-8 |
| `Transfer-Encoding: chunked` | Uzunlik oldindan aytilmagan, tana bo'laklab keladi |
| `Connection: keep-alive` | Ulanish ochiq qoladi (13-bob) |
| `Server`, `Date` | Javob header'lari |
| `Age: 8033`, `cf-cache-status: HIT` | Javob oraliq keshdan (Cloudflare) keldi, u yerda ~8000 soniya turgan (11-bob) |
| `Allow: GET, HEAD` | Bu resurs uchun ruxsat etilgan metodlar |

### So'rov tanasi: uch xil

Serverni oddiy `nc -l` (port tinglaydigan netcat) bilan almashtiramiz: u javob bermaydi, faqat kelgan so'rovni **baytma-bayt** yozib oladi. Shunda `curl` yuborgan xabar to'liq ko'rinadi.

**Forma** (`-d` va `--data-urlencode`):

```text vps
POST /users HTTP/1.1
Host: 127.0.0.1:9000
User-Agent: curl/8.18.0
Accept: */*
Content-Length: 40
Content-Type: application/x-www-form-urlencoded

name=Ali Valiyev&email=ali%40example.com
```

- `-d` bilan metod o'zi `POST` bo'ldi, `Content-Type` — `application/x-www-form-urlencoded` (curl qo'llanmasi).
- `Content-Length: 40` — tana aynan 40 bayt.
- Diqqat: `name=Ali Valiyev` dagi bo'sh joy **kodlanmadi**. curl qo'llanmasi: `-d` ma'lumotni "aynan berilganidek" yuboradi. `--data-urlencode` esa `@` ni `%40` qildi. Qiymat kodlanishi kerak bo'lsa — `--data-urlencode`.

**JSON** (`--json`):

```text vps
POST /users HTTP/1.1
Host: 127.0.0.1:9000
User-Agent: curl/8.18.0
Content-Type: application/json
Accept: application/json
Content-Length: 23

{"ism":"Ali","yosh":30}
```

`--json` — curl qo'llanmasi bo'yicha `--data-binary` va ikki header (`Content-Type: application/json`, `Accept: application/json`) ning qisqartmasi.

**Fayl bilan forma** (`-F`):

```text vps
POST /yuklash HTTP/1.1
Host: 127.0.0.1:9000
User-Agent: curl/8.18.0
Accept: */*
Content-Length: 312
Content-Type: multipart/form-data; boundary=------------------------BKzzSXlF2Tovk7TH9kcvTk

--------------------------BKzzSXlF2Tovk7TH9kcvTk
Content-Disposition: form-data; name="ism"

Ali
--------------------------BKzzSXlF2Tovk7TH9kcvTk
Content-Disposition: form-data; name="fayl"; filename="izoh.txt"
Content-Type: text/plain

Salom, fayl!

--------------------------BKzzSXlF2Tovk7TH9kcvTk--
```

- `boundary=…` — qismlarni ajratuvchi qator; tanada u `--` bilan boshlanadi, oxirgisi `--` bilan tugaydi.
- Har qismning **o'z** header'lari bor: `Content-Disposition` (maydon nomi, fayl nomi), fayl uchun `Content-Type: text/plain`.
- Fayl mazmuni (`Salom, fayl!`) tanada o'zgarmasdan ketdi.

### Javob uzunligi

```text vps
$ curl -4 -s --http1.1 -D - -o /dev/null https://www.google.com/ | grep -i '^transfer-encoding\|^content-length\|^HTTP'
HTTP/1.1 200 OK
Transfer-Encoding: chunked
```

5-bobdagi Python serveri esa `Content-Length: 15` yuborgan edi. Bu yerda `Content-Length` umuman yo'q: sahifa bo'laklab yuborildi.

### `HEAD`: faqat bosh

`curl -I` `HEAD` metodi bilan faqat header'larni so'raydi (curl qo'llanmasi):

```text vps
$ curl -4 -sI https://example.com/ | tr -d '\r'
HTTP/2 200 
date: Sun, 08 Nov 2026 08:36:08 GMT
content-type: text/html; charset=utf-8
server: cloudflare
last-modified: Thu, 05 Nov 2026 21:17:41 GMT
allow: GET, HEAD
accept-ranges: bytes
age: 10
cf-cache-status: HIT
alt-svc: h3=":443"; ma=86400

```

Tana yo'q — bo'sh qator bilan tugadi. Header nomlari endi **kichik harflarda**: bu HTTP/2 javobi, RFC 9113 (8.2) bo'yicha HTTP/2 da header nomlari kichik harfga o'tkazilishi **shart**. HTTP/1.1 da nomlar katta-kichik harfni farqlamaydi (RFC 9110, 5.1), shuning uchun `Content-Type` va `content-type` — bitta header.

### HTTP/2 psevdo-header'lari

```text vps
$ curl -4 -sv --http2 https://example.com/ -o /dev/null 2>&1 | grep -E '^\* \[HTTP/2\]|^> |^< (HTTP|content-type)'
* [HTTP/2] [1] OPENED stream for https://example.com/
* [HTTP/2] [1] [:method: GET]
* [HTTP/2] [1] [:scheme: https]
* [HTTP/2] [1] [:authority: example.com]
* [HTTP/2] [1] [:path: /]
* [HTTP/2] [1] [user-agent: curl/8.18.0]
* [HTTP/2] [1] [accept: */*]
> GET / HTTP/2
> Host: example.com
> User-Agent: curl/8.18.0
> Accept: */*
> 
< HTTP/2 200 
< content-type: text/html; charset=utf-8
```

- `[1]` — **oqim** raqami: so'rov 1-oqimda ketdi.
- `:method`, `:scheme`, `:authority`, `:path` — HTTP/1.1 dagi so'rov qatori va `Host` ning o'rnini bosuvchi psevdo-header'lar.
- `>` qatorlari — curl xuddi shu so'rovni odam o'qishi uchun HTTP/1.1 ko'rinishida ham ko'rsatadi. Simda esa ikkilik freym ketadi.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Nima |
| --- | --- | --- |
| RFC 9112 | 2.1 | Xabar: boshlang'ich qator, header qatorlari, bo'sh qator, ixtiyoriy tana; har qator `CRLF` bilan |
| RFC 9112 | 3 | So'rov qatori: `method SP request-target SP HTTP-version` |
| RFC 9112 | 4 | Holat qatori: `HTTP-version SP status-code SP [ reason-phrase ]` — izoh ixtiyoriy |
| RFC 9112 | 6.3 | Tana uzunligi qanday aniqlanadi; `HEAD`, `1xx`, `204`, `304` javoblarida tana yo'q |
| RFC 9112 | 7.1 | Bo'laklab uzatish (chunked) |
| RFC 9110 | 5.1 | Header nomlari katta-kichik harfni farqlamaydi |
| RFC 9113 | 8.2, 8.3 | HTTP/2: header nomlari kichik harfda; psevdo-header'lar |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `curl -d 'q=Ali Valiyev'` — "curl o'zi kodlaydi" | `-d` ma'lumotni aynan yuboradi (sinovda bo'sh joy kodlanmadi) | `--data-urlencode` |
| JSON'ni `-d` bilan yuborish | `Content-Type` `application/x-www-form-urlencoded` bo'lib qoladi — server JSON deb o'qimasligi mumkin | `--json` yoki `-H 'Content-Type: application/json'` |
| `Content-Length` ni qo'lda yozib, tanani o'zgartirish | Uzunlik mos kelmasa, xabar chegarasi buziladi | Uzunlikni vositaga hisoblatish |
| `Content-Type` va `content-type` ni ikki xil header deb o'qish | Nomlar katta-kichik harfni farqlamaydi | Kodda header'ni nomi bo'yicha harfga e'tiborsiz qidirish |
| "Javobda `Content-Length` yo'q — xato" | `Transfer-Encoding: chunked` bilan uzunlik kerak emas | Ikkalasidan biri, yoki `HEAD`/`204`/`304` — tanasiz |
| `curl -v` dagi `> GET / HTTP/2` ni simdagi matn deb o'ylash | HTTP/2 ikkilik; curl uni o'qish uchun matn ko'rinishida ko'rsatadi | Psevdo-header'lar: `[HTTP/2] [1] [:method: GET]` |

## Amaliyot

1. HTTP xabari qaysi to'rt qismdan iborat? Header'lar tugaganini qabul qiluvchi qanday biladi?
2. `GET /qidiruv?q=url HTTP/1.1` — so'rov qatorining uch qismini ayting. Bu so'rov manzilining qaysi shakli?
3. Forma, JSON va fayl yuborishda `Content-Type` qanday bo'ladi?
4. `Content-Length` va `Transfer-Encoding: chunked` farqi nima?
5. Qaysi javoblarda tana bo'lmaydi?
6. HTTP/2 da so'rov qatori o'rniga nima ishlatiladi?

<details>
<summary>Javoblar</summary>

1. Boshlang'ich qator, header'lar, bo'sh qator, tana. Bo'sh qatordan.
2. Metod `GET`, manzil `/qidiruv?q=url`, versiya `HTTP/1.1`. Origin form.
3. `application/x-www-form-urlencoded`, `application/json`, `multipart/form-data; boundary=…`.
4. `Content-Length` — tana o'lchami oldindan aytiladi; `chunked` — tana bo'laklab, har bo'lak o'lchami bilan keladi, umumiy uzunlik oldindan noma'lum.
5. `HEAD` so'roviga javob, `1xx`, `204`, `304` (RFC 9112, 6.3).
6. Psevdo-header'lar: `:method`, `:scheme`, `:authority`, `:path` (javobda — `:status`).

</details>

## Rasmiy hujjat

- [MDN: HTTP messages](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Messages)
- [MDN: A typical HTTP session](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Session)
- [RFC 9112: HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
- [RFC 9113: HTTP/2](https://www.rfc-editor.org/rfc/rfc9113)
- [curl qo'llanmasi: `-d`, `--data-urlencode`, `--json`, `-F`, `-I`](https://curl.se/docs/manpage.html)
