# 23 — HSTS

[Mundarija](README.md)

## Tushuncha

21-bobda HTTP so'rovlar `301` bilan HTTPS'ga yo'naltirildi. Lekin birinchi so'rov baribir **shifrlanmagan** HTTP orqali ketadi. Foydalanuvchi `example.com` ni yozsa yoki eski `http://` havolani bossa, shu so'rovni yo'lda turgan hujumchi o'zgartirib yuborishi mumkin. RFC 6797 (14.6) buni **bootstrap MITM** deb ataydi (MITM — man-in-the-middle, "o'rtadagi odam").

**HSTS** (HTTP Strict Transport Security, RFC 6797) — server brauzerga aytadi: "keyingi N soniya davomida menga **faqat HTTPS** orqali murojaat qil". Brauzer buni eslab qoladi va keyingi safar `http://` ni o'zi `https://` ga almashtiradi — HTTP so'rov tarmoqqa umuman chiqmaydi.

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

| Qism | RFC 6797 | Ma'nosi |
| --- | --- | --- |
| `max-age` | 6.1.1, majburiy | Necha soniya eslab qolish. `max-age=0` — unutish |
| `includeSubDomains` | 6.1.2, ixtiyoriy | Barcha subdomenlarga ham |

Muhim qoidalar (RFC 6797):

- Brauzer header'ni faqat **HTTPS** javobidan va faqat sertifikatda xato bo'lmasa qabul qiladi (8.1).
- HSTS host'ga ulanishda **har qanday** TLS xatosi bo'lsa (muddati o'tgan sertifikat, noto'g'ri nom), brauzer ulanishni uzadi (8.4) va foydalanuvchiga "baribir davom etish" tugmasini bermaydi — **no user recourse** (12.1).

Oxirgi qoida HSTS'ning kuchi ham, xavfi ham: sertifikat bilan muammo chiqsa (25-bob), sayt `max-age` tugaguncha foydalanuvchilar uchun **butunlay** yopiladi.

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domen bilan sinalgan, domen `example.com` bilan almashtirilgan. Haqiqiy domen bo'lgani uchun sinovda qisqa `max-age=300` (5 daqiqa) ishlatildi.

## nginx'da

Header `add_header` bilan qo'shiladi (9-bob). `/rasmlar/` uchun alohida `location` — o'zining `add_header` i bilan:

```text vps
$ sed -n "/listen 443/,\$p" /etc/nginx/conf.d/sayt.conf
    listen 443 ssl;
    server_name example.com www.example.com;
    root /var/www/sayt;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    add_header Strict-Transport-Security "max-age=300";

    location /rasmlar/ {
        add_header Cache-Control "public, max-age=86400";
    }
}
$ nginx -t -q && nginx -s reload; sleep 2
$ curl -sI https://example.com/ | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=300
$ curl -sI https://example.com/yoq | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 404 Not Found
$ curl -sI http://example.com/ | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 301 Moved Permanently
$ curl -sI https://example.com/rasmlar/a.txt | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 200 OK
Cache-Control: public, max-age=86400
```

Header faqat birinchi so'rovda keldi. Qolgan uchtasida yo'q:

| So'rov | Nega header yo'q |
| --- | --- |
| `404` | NG headers module: `add_header` faqat 200, 201, 204, 206, 301, 302, 303, 304, 307, 308 kodlarida ishlaydi. Boshqa kodlar uchun `always` kerak |
| `http://` (`301`) | HTTP server blokida `add_header` yo'q. Bu to'g'ri: RFC 6797 bo'yicha brauzer HTTP javobidagi header'ni baribir e'tiborsiz qoldiradi |
| `/rasmlar/` | `location` da o'z `add_header` i bor. NG: yuqori darajadagi `add_header` lar faqat joriy darajada bittasi ham bo'lmasa meros olinadi (9-bob) |

Tuzatish: `always` va 1.29.3 dagi `add_header_inherit merge` (NG headers module: yuqori darajadagi qiymatlarni joriy darajadagilarga qo'shadi; bu qoidaning o'zi ichki darajalarga meros o'tadi):

```text vps
$ sed -i "s|max-age=300\";|max-age=300\" always;|" /etc/nginx/conf.d/sayt.conf
$ sed -i "s|^    location /rasmlar/ {|    add_header_inherit merge;\n\n    location /rasmlar/ {|" /etc/nginx/conf.d/sayt.conf
$ sed -n "/add_header/,\$p" /etc/nginx/conf.d/sayt.conf
    add_header Strict-Transport-Security "max-age=300" always;

    add_header_inherit merge;

    location /rasmlar/ {
        add_header Cache-Control "public, max-age=86400";
    }
}
$ nginx -t -q && nginx -s reload; sleep 2
$ curl -sI https://example.com/yoq | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 404 Not Found
Strict-Transport-Security: max-age=300
$ curl -sI https://example.com/rasmlar/a.txt | grep -iE "^(HTTP|strict|cache-control)"
HTTP/1.1 200 OK
Cache-Control: public, max-age=86400
Strict-Transport-Security: max-age=300
```

## Mijoz HSTS'ni qanday eslab qoladi

Brauzer ichini ko'rsatish qiyin, lekin `curl` da ham HSTS keshi bor: `--hsts fayl`. Noutbukdan:

```text tashqi
$ curl --version | head -1
curl 8.7.1 (x86_64-apple-darwin25.0) libcurl/8.7.1 (SecureTransport) LibreSSL/3.3.6 zlib/1.2.12 nghttp2/1.68.1
$ curl -s --hsts hsts.txt -o /dev/null -w "%{http_code} %{url_effective}\n" http://example.com/
301 http://example.com/
$ curl -s --hsts hsts.txt -o /dev/null -w "%{http_code} %{url_effective}\n" https://example.com/
200 https://example.com/
$ grep -v "^#" hsts.txt
example.com "20261109 12:10:37"
$ curl -s --hsts hsts.txt -o /dev/null -w "%{http_code} %{url_effective}\n" http://example.com/
200 https://example.com/
$ curl -s --hsts hsts.txt -o /dev/null -w "%{http_code} %{url_effective}\n" http://www.example.com/
301 http://www.example.com/
```

1. Birinchi `http://` — keshda hech narsa yo'q, so'rov HTTP orqali ketdi, server `301` qaytardi.
2. `https://` javobida HSTS header bor — curl `example.com` ni faylga yozdi, muddati bilan (5 daqiqadan keyin, UTC).
3. Yana `http://example.com/` — endi curl so'rovni **o'zi** `https://` ga almashtirdi (`url_effective`) va to'g'ridan-to'g'ri `200` oldi. Tarmoqqa HTTP so'rov chiqmadi.
4. `www.example.com` — boshqa host, u uchun HSTS olinmagan va `includeSubDomains` ham yo'q. Shuning uchun yana HTTP va `301`.

## Xavfsiz yoqish

`max-age` uzoq bo'lsa, xato ham uzoq yashaydi: brauzerlar header'ni olgan paytdan boshlab shuncha vaqt saytga faqat HTTPS orqali kiradi. Sertifikat yangilanmay qolsa (yoki `includeSubDomains` dan keyin biror subdomen HTTPS'siz bo'lsa), uni server tomondan tezda "bekor qilib" bo'lmaydi: `max-age=0` faqat saytga qayta kirgan brauzerlarga yetib boradi.

Shuning uchun bosqichma-bosqich:

1. Butun sayt (va kerak bo'lsa barcha subdomenlar) HTTPS'da ishlashiga, sertifikat avtomatik yangilanishiga (19–20-boblar) ishonch hosil qiling.
2. Kichik `max-age` bilan boshlang (bizdagi `300`), muammo bo'lmasa oshiring. RFC 6797 (11.2) misoli — `max-age=7776000` (90 kun).
3. `includeSubDomains` ni faqat **barcha** subdomenlar HTTPS'da bo'lganda qo'shing. RFC 6797 (11.4) shu bilan bog'liq muammolarni alohida ko'rib chiqadi.

RFC 6797 (12.3) brauzerlarga oldindan o'rnatilgan HSTS ro'yxatini (pre-loaded list) ham eslatadi: birinchi tashrifdagi bootstrap MITM'dan shu himoya qiladi. Bunday ro'yxatlarni brauzer ishlab chiqaruvchilari yuritadi; RFC ularning tartibini belgilamaydi.

## Variantlar

| Holat | Header |
| --- | --- |
| Sinov | `max-age=300` |
| Ishonch hosil qilingan bitta host | `max-age=7776000` yoki undan ko'p |
| Barcha subdomenlar HTTPS'da | `max-age=…; includeSubDomains` |
| HSTS'dan voz kechish | `max-age=0` (faqat qayta kirgan brauzerlarga ta'sir qiladi) |

## Tipik xatolar

| Xato | Oqibati | To'g'ri yo'l |
| --- | --- | --- |
| Birdan yil-uzoq `max-age` va `includeSubDomains` | HTTPS'siz subdomen (masalan, ichki panel) foydalanuvchilarga yopiladi | Kichikdan boshlash |
| `always` siz | Xato sahifalarida (404, 500) header yo'q | `add_header … always` |
| `location` da boshqa `add_header` | HSTS shu `location` da yo'qoladi | `add_header_inherit merge` yoki HSTS'ni har `location` da takrorlash |
| HSTS'ni HTTP serverga qo'shish | Foydasi yo'q — brauzer e'tiborsiz qoldiradi | Faqat 443-port serverda |
| Sertifikat yangilanishini tekshirmaslik | Sertifikat muddati o'tsa, sayt butunlay ochilmaydi (no user recourse) | `certbot renew --dry-run`, monitoring (25-bob) |

## Amaliyot

1. `--hsts` faylini o'chirib, `max-age=300` tugaguncha kutmasdan qanday qilib curl'ni "unutdirish" mumkin?
2. `includeSubDomains` qo'shib curl tajribasini qaytaring: endi `http://www.example.com/` nima qaytaradi? (Header `example.com` javobidan olinishi kerak.)
3. Nega HSTS'ni `http` (80-port) serverga qo'yish foydasiz?
4. `add_header_inherit merge` ni `http` darajasiga ko'chirsangiz nima o'zgaradi?

## Rasmiy hujjat

- RFC 6797 — HTTP Strict Transport Security: <https://www.rfc-editor.org/rfc/rfc6797>
- NG — `ngx_http_headers_module` (`add_header`, `always`, `add_header_inherit`): <https://nginx.org/en/docs/http/ngx_http_headers_module.html>
- curl — `--hsts`: <https://curl.se/docs/manpage.html#--hsts>
