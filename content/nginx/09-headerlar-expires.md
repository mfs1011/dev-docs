# 09 — Javob header'lari va keshlash muddati

[Mundarija](README.md)

## Tushuncha

NG (`ngx_http_headers_module`): javobga `Expires` va `Cache-Control` header'larini va ixtiyoriy boshqa header'larni qo'shadi.

### `add_header`

```text
add_header nom qiymat [always];
```

NG:

- Header **faqat** javob kodi 200, 201, 204, 206, 301, 302, 303, 304, 307 yoki 308 bo'lsa qo'shiladi.
- `always` (1.7.5 dan) — **har qanday** kodda (masalan, 404, 500) ham.
- Qiymatda o'zgaruvchilar bo'lishi mumkin; bir nechta `add_header` bo'lishi mumkin.
- **Meros**: tashqi darajadagi `add_header` lar faqat joriy darajada bitta ham `add_header` bo'lmasa meros olinadi (3-bob).

`add_header_inherit on | off | merge;` (1.29.3 dan, standart `on`):

| Qiymat | Nima |
| --- | --- |
| `on` | Standart meros modeli |
| `merge` | Tashqi darajadagi qiymatlar joriy darajadagilarga **qo'shiladi** |
| `off` | Tashqi darajadan meros olinmaydi |

### `expires`

```text
expires [modified] vaqt;
expires epoch | max | off;
```

NG: `Expires` va `Cache-Control` header'larini qo'shadi yoki o'zgartiradi (yuqoridagi kodlar uchun):

| Qiymat | `Expires` | `Cache-Control` |
| --- | --- | --- |
| Musbat yoki 0 (`24h`) | Hozirgi vaqt + vaqt | `max-age=<soniya>` |
| Manfiy (`-1`) | Hozirgi vaqt + vaqt | `no-cache` |
| `modified +24h` | Faylning o'zgartirilgan vaqti + vaqt | Ishorasiga qarab |
| `@15h30m` | Kunning shu vaqti | — |
| `epoch` | `Thu, 01 Jan 1970 00:00:01 GMT` | `no-cache` |
| `max` | `Thu, 31 Dec 2037 23:55:55 GMT` | 10 yil |
| `off` (standart) | Qo'shilmaydi/o'zgartirilmaydi | |

Oxirgi parametrda o'zgaruvchi bo'lishi mumkin (1.7.9 dan) — masalan, `map` bilan tur bo'yicha (NG misoli):

```nginx
map $sent_http_content_type $expires {
    default         off;
    application/pdf 42d;
    ~image/         max;
}
expires $expires;
```

`Cache-Control` va `Expires` ma'nosi, brauzer keshi — Web asoslari kitobida.

## Ko'rib chiqamiz

VPS'da (nginx 1.31.8), `127.0.0.1:8101`:

```nginx
map $sent_http_content_type $muddat {
    default         off;
    application/pdf 42d;
    ~image/         max;
}

server {
    listen 127.0.0.1:8101;
    root /var/www/hd;

    add_header X-Content-Type-Options nosniff;

    location /oddiy/ {
        add_header X-Frame-Options DENY;
    }
    location /doim/ {
        add_header X-Frame-Options DENY always;
    }
    location /birlashtir/ {
        add_header_inherit merge;
        add_header X-Frame-Options DENY;
    }
    location /kun/      { expires 24h; }
    location /keshlama/ { expires -1; }
    location /epoch/    { expires epoch; }
    location /max/      { expires max; }
    location /fayldan/  { expires modified +1h; }
    location /turi/     { expires $muddat; }
}
```

```text vps
$ mkdir -p /var/www/hd; for d in oddiy doim birlashtir kun keshlama epoch max fayldan turi; do mkdir -p /var/www/hd/$d; echo salom > /var/www/hd/$d/a.html; done; touch -d '2026-01-01 10:00:00 UTC' /var/www/hd/fayldan/a.html; echo pdf > /var/www/hd/turi/h.pdf; echo png > /var/www/hd/turi/r.png; cp /root/headers.conf /etc/nginx/conf.d/headers.conf; rm /root/headers.conf; nginx -t -q && nginx -s reload; sleep 0.5; echo yuklandi
yuklandi
```

### `add_header`: kodlar, `always`, meros

`hd URI` — tanlangan header'lar:

```text vps
$ hd() { echo "== $1"; curl -s -D - -o /dev/null "http://127.0.0.1:8101$1" | grep -iE '^(HTTP|X-|Expires|Cache-Control|Date|Last-Modified)' | tr -d '\r'; }; hd /a.html; hd /oddiy/a.html; hd /oddiy/yoq.html; hd /doim/yoq.html; hd /birlashtir/a.html
== /a.html
HTTP/1.1 404 Not Found
Date: Sun, 08 Nov 2026 17:24:09 GMT
== /oddiy/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
X-Frame-Options: DENY
== /oddiy/yoq.html
HTTP/1.1 404 Not Found
Date: Sun, 08 Nov 2026 17:24:09 GMT
== /doim/yoq.html
HTTP/1.1 404 Not Found
Date: Sun, 08 Nov 2026 17:24:09 GMT
X-Frame-Options: DENY
== /birlashtir/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

| URI | Natija | Nega |
| --- | --- | --- |
| `/a.html` | 404, `X-Content-Type-Options` **yo'q** | 404 — `always` siz header qo'shilmaydi |
| `/oddiy/a.html` | Faqat `X-Frame-Options` | Location'da o'z `add_header` i — server'dagi `nosniff` meros olinmadi |
| `/oddiy/yoq.html` | 404, header yo'q | `always` yo'q |
| `/doim/yoq.html` | 404, `X-Frame-Options` bor | `always` |
| `/birlashtir/a.html` | Ikkalasi | `add_header_inherit merge` |

### `expires`

```text vps
$ hd /kun/a.html; hd /keshlama/a.html; hd /epoch/a.html; hd /max/a.html; hd /fayldan/a.html
== /kun/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Mon, 09 Nov 2026 17:24:09 GMT
Cache-Control: max-age=86400
X-Content-Type-Options: nosniff
== /keshlama/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Sun, 08 Nov 2026 17:24:08 GMT
Cache-Control: no-cache
X-Content-Type-Options: nosniff
== /epoch/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Thu, 01 Jan 1970 00:00:01 GMT
Cache-Control: no-cache
X-Content-Type-Options: nosniff
== /max/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Thu, 31 Dec 2037 23:55:55 GMT
Cache-Control: max-age=315360000
X-Content-Type-Options: nosniff
== /fayldan/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Thu, 01 Jan 2026 10:00:00 GMT
Expires: Thu, 01 Jan 2026 11:00:00 GMT
Cache-Control: no-cache
X-Content-Type-Options: nosniff
```

| Location | `Expires` | `Cache-Control` |
| --- | --- | --- |
| `24h` | Ertaga shu vaqt | `max-age=86400` |
| `-1` | Hozirgidan 1 s oldin | `no-cache` |
| `epoch` | 1970-01-01 | `no-cache` |
| `max` | 2037-12-31 | `max-age=315360000` (10 yil) |
| `modified +1h` | Fayl vaqti (2026-01-01 10:00) + 1 soat | `no-cache` — kuzatildi: hisoblangan vaqt allaqachon o'tgan, `max-age` manfiy bo'lardi |

### Tur bo'yicha (`map`)

```text vps
$ hd /turi/h.pdf; hd /turi/r.png; hd /turi/a.html
== /turi/h.pdf
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Sun, 20 Dec 2026 17:24:09 GMT
Cache-Control: max-age=3628800
X-Content-Type-Options: nosniff
== /turi/r.png
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
Expires: Thu, 31 Dec 2037 23:55:55 GMT
Cache-Control: max-age=315360000
X-Content-Type-Options: nosniff
== /turi/a.html
HTTP/1.1 200 OK
Date: Sun, 08 Nov 2026 17:24:09 GMT
Last-Modified: Sun, 08 Nov 2026 17:24:08 GMT
X-Content-Type-Options: nosniff
```

PDF — 42 kun (`3628800` s), PNG — `max`, HTML — `off` (header'lar yo'q).

```text vps
$ rm /etc/nginx/conf.d/headers.conf; rm -rf /var/www/hd; nginx -t -q && nginx -s reload; echo ok
ok
```

## Variantlar

Keshlash strategiyasi tafsilotlari — Web asoslari kitobi, 11-bob.

| Fayl turi | Odatiy tanlov | Sabab |
| --- | --- | --- |
| Nomida xesh bor (`app.3f9a.js`) | `expires max` | Mazmun o'zgarsa — nom o'zgaradi |
| HTML | `expires -1` yoki `off` | Har safar tekshirish |
| Rasm, shrift | Uzoq muddat yoki `map` | Kam o'zgaradi |
| Xavfsizlik header'lari | `add_header … always` | Xato sahifalarida ham kerak |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Location'da bitta `add_header` qo'shib, server'dagilar qoladi deb o'ylash | Meros to'xtaydi (sinovda `nosniff` yo'qoldi) | Takrorlash yoki `add_header_inherit merge` (1.29.3+) |
| Xavfsizlik header'ini `always` siz | 404/500 javoblarida yo'q (sinovda) | `always` |
| `expires modified …` ni eski fayllarga | Muddat o'tib ketgan bo'lishi mumkin — `no-cache` (sinovda) | Oddiy `expires` |
| Nomi o'zgarmaydigan faylga `expires max` | Yangilanganda brauzer eski nusxani ishlatadi | Xeshli nomlar yoki qisqa muddat |
| HTML'ga uzoq muddat | Foydalanuvchi yangi versiyani ko'rmaydi | HTML'ni qisqa yoki `no-cache` |

## Amaliyot

1. `add_header` qaysi javob kodlarida ishlaydi? `always` nima qiladi?
2. Server'da 3 ta `add_header`, location'da 1 ta — location javobida nechta header?
3. `add_header_inherit merge` nimani o'zgartiradi?
4. `expires 24h` qaysi header'larni qo'shadi?
5. `expires -1` va `expires epoch` farqi nima?
6. Faqat rasmlarga uzoq muddat berishning NG'dagi usuli qanday?

<details>
<summary>Javoblar</summary>

1. 200, 201, 204, 206, 301, 302, 303, 304, 307, 308; `always` — har qanday kodda.
2. Bitta — server'dagilar meros olinmaydi.
3. Tashqi darajadagi `add_header` qiymatlari joriy darajadagilarga qo'shiladi.
4. `Expires` (hozir + 24 soat) va `Cache-Control: max-age=86400`.
5. Ikkalasi `no-cache`; `-1` — `Expires` hozirgidan 1 s oldin, `epoch` — 1970-01-01.
6. `map $sent_http_content_type $expires { ~image/ max; … }` va `expires $expires;`.

</details>

## Rasmiy hujjat

- [NG: ngx_http_headers_module](https://nginx.org/en/docs/http/ngx_http_headers_module.html)
- [NG: map](https://nginx.org/en/docs/http/ngx_http_map_module.html)
