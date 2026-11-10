# 22 — TLS sozlamalari

[Mundarija](README.md)

## Tushuncha

21-bobda HTTPS server ikki direktiva bilan ishladi. Qolgan TLS sozlamalari standart qiymatda qoldi. Bu bobda uchtasini ko'ramiz:

| Direktiva | Nima belgilaydi | Standart (NG ssl module) |
| --- | --- | --- |
| `ssl_protocols` | TLS versiyalari | `TLSv1.2 TLSv1.3` |
| `ssl_ciphers` | Shifrlash to'plamlari (cipher) | `HIGH:!aNULL:!MD5` |
| `ssl_session_cache` | Avvalgi ulanish parametrlarini qayta ishlatish uchun kesh | `none` |

NG (Configuring HTTPS servers): standart `ssl_protocols` va `ssl_ciphers` yaxshi, ularni aniq yozish **odatda kerak emas**. Hujjat ogohlantiradi: bu standart qiymatlar yillar davomida bir necha marta o'zgargan (1.27.3 dan — `TLSv1.2 TLSv1.3`).

> **Chiqishlar haqida.** Sinov VPS'ida (nginx 1.31.8, OpenSSL 3.5.5) haqiqiy domen bilan sinalgan, domen `example.com` bilan almashtirilgan.

## Protokollar

```text vps
$ grep -rnE "ssl_(protocols|ciphers|session)" /etc/nginx/ || echo yoq
yoq
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 2>&1 | grep -E "^(New|Protocol|    Cipher)|alert|no protocols" | head -3
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Protocol: TLSv1.2
    Cipher    : ECDHE-ECDSA-AES256-GCM-SHA384
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_3 2>&1 | grep -E "^(New|Protocol|    Cipher)|alert|no protocols" | head -3
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Protocol: TLSv1.3
    Cipher    : TLS_AES_256_GCM_SHA384
```

Konfiguratsiyada hech qanday TLS sozlamasi yo'q — TLS 1.2 ham, 1.3 ham ishlaydi. `-tls1_2` / `-tls1_3` — mijozni shu versiyaga majburlash.

TLS 1.1 ni sinab ko'rish uchun avval mijozning o'zida ruxsat berish kerak bo'ldi:

```text vps
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_1 2>&1 | grep -E "^(New|Protocol|    Cipher)|alert|no protocols" | head -3
40A7B38AD2770000:error:0A0000BF:SSL routines:tls_setup_handshake:no protocols available:../ssl/statem/statem_lib.c:155:
New, (NONE), Cipher is (NONE)
Protocol: TLSv1.3
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_1 -cipher "DEFAULT:@SECLEVEL=0" 2>&1 | grep -E "alert|^New"
4007E5C7D1710000:error:0A00042E:SSL routines:ssl3_read_bytes:tlsv1 alert protocol version:../ssl/record/rec_layer_s3.c:918:SSL alert number 70
New, (NONE), Cipher is (NONE)
```

- Birinchi urinish serverga yetib ham bormadi: `no protocols available` — mijozning o'zi TLS 1.1 ni ishlata olmaydi. OpenSSL hujjati (`SSL_CTX_set_security_level`): xavfsizlik darajasi 1 va undan yuqorida SSLv3, TLS 1.0 va TLS 1.1 o'chirilgan. `@SECLEVEL=0` — mijozda shu darajani 0 ga tushirish.
- Shundan keyin mijoz TLS 1.1 ni taklif qildi, endi **server** rad etdi: `alert protocol version` — TLS'da "bu versiyani qo'llamayman" xabari.

### Faqat TLS 1.3 qilsak

Sinov uchun `ssl_protocols TLSv1.3` ni avval faqat bitta `server` ga yozamiz:

```text vps
$ sed -i "/ssl_certificate_key/a\    ssl_protocols TLSv1.3;" /etc/nginx/conf.d/sayt.conf
$ sed -n "/listen 443/,/}/p" /etc/nginx/conf.d/sayt.conf
    listen 443 ssl;
    server_name example.com www.example.com;
    root /var/www/sayt;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.3;
}
$ nginx -t -q && nginx -s reload; sleep 2
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 2>&1 | grep -E "alert|^New"
40B7CCF2A1750000:error:0A00042E:SSL routines:ssl3_read_bytes:tlsv1 alert protocol version:../ssl/record/rec_layer_s3.c:918:SSL alert number 70
New, (NONE), Cipher is (NONE)
```

Bizda ishladi — `example.com` TLS 1.2 ni rad etdi. Lekin NG ssl module `ssl_protocols`, `ssl_session_cache` va boshqalar haqida ogohlantiradi: direktiva `server` darajasida yozilsa, **standart serverning** qiymati ishlatilishi mumkin ("Virtual server selection"). Sababi 21-bobdagi SNI muammosi: TLS kelishuvi qaysi `server` tanlanishidan oldin boshlanadi. Shuning uchun bunday sozlamalarni `http` darajasida yozish ishonchliroq:

```text vps
$ sed -i "/ssl_protocols TLSv1.3;/d" /etc/nginx/conf.d/sayt.conf
$ cat /etc/nginx/conf.d/tls.conf
ssl_protocols TLSv1.3;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
$ nginx -t -q && nginx -s reload; sleep 2
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 2>&1 | grep -E "alert|^New"
40F7230FD77C0000:error:0A00042E:SSL routines:ssl3_read_bytes:tlsv1 alert protocol version:../ssl/record/rec_layer_s3.c:918:SSL alert number 70
New, (NONE), Cipher is (NONE)
$ echo | openssl s_client -connect 127.0.0.1:443 -servername lab.example.com -tls1_2 2>&1 | grep -E "alert|^New"
4057C448FB7F0000:error:0A00042E:SSL routines:ssl3_read_bytes:tlsv1 alert protocol version:../ssl/record/rec_layer_s3.c:918:SSL alert number 70
New, (NONE), Cipher is (NONE)
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com 2>&1 | grep -E "^New"
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
```

`conf.d/tls.conf` `http` blokiga kiradi (3-bob) — endi ikkala sayt ham faqat TLS 1.3.

Faqat TLS 1.3 qilish kerakmi? Bu sizning mijozlaringizga bog'liq: eski qurilmalar va kutubxonalar TLS 1.3 ni bilmasligi mumkin. Hujjatdagi standart (`TLSv1.2 TLSv1.3`) ikkalasiga ham joy beradi. Biz standartga qaytamiz:

```text vps
$ sed -i "/ssl_protocols/d" /etc/nginx/conf.d/tls.conf
$ cat /etc/nginx/conf.d/tls.conf
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
$ nginx -t -q && nginx -s reload; sleep 2
```

## Shifrlash to'plamlari

Cipher (shifrlash to'plami) — kalit almashish, autentifikatsiya, shifrlash va yaxlitlik tekshiruvi algoritmlari birikmasi. Masalan, `ECDHE-ECDSA-AES256-GCM-SHA384`: kalit almashish `ECDHE`, sertifikat kaliti `ECDSA`, shifrlash `AES256-GCM`, xesh `SHA384`.

NG: `ssl_ciphers` OpenSSL formatida yoziladi, to'liq ro'yxatni `openssl ciphers` ko'rsatadi:

```text vps
$ openssl ciphers -s -tls1_2 "HIGH:!aNULL:!MD5" | tr : "\n" | wc -l
65
$ openssl ciphers -s -tls1_2 "HIGH:!aNULL:!MD5" | tr : "\n" | head -6
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
DHE-DSS-AES256-GCM-SHA384
DHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-CHACHA20-POLY1305
ECDHE-RSA-CHACHA20-POLY1305
$ openssl ciphers -s -tls1_3 | tr : "\n" | head -3
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
```

- `HIGH` — kuchli algoritmlar, `!aNULL` — autentifikatsiyasizlarni olib tashlash, `!MD5` — MD5'lilarni olib tashlash.
- `ssl_ciphers` faqat TLS 1.2 va undan eskisiga taalluqli. TLS 1.3 to'plamlari alohida (`TLS_…`) — ularni nginx'da `ssl_conf_command Ciphersuites …` bilan o'zgartirish mumkin. NG: OpenSSL'ni bevosita sozlash **kutilmagan natijaga** olib kelishi mumkin.
- `ssl_prefer_server_ciphers` — standart `off`: mijoz o'z ro'yxatidagi tartib bo'yicha tanlaydi.

## Sessiya keshi

NG (HTTPS server optimization): eng ko'p CPU talab qiladigan ish — TLS **handshake** (ulanishni o'rnatish). Uni kamaytirishning ikki yo'li: keepalive ulanishlar va **sessiyani qayta ishlatish** — mijoz qayta ulanganda to'liq handshake o'rniga avvalgi sessiya parametrlarini ishlatadi.

Qayta ishlatishning ikki usuli bor:

| Usul | Parametrlar qayerda | nginx'da |
| --- | --- | --- |
| Sessiya keshi | Serverda | `ssl_session_cache` (standart `none`) |
| Session ticket | Mijozda, server kaliti bilan shifrlangan | `ssl_session_tickets` (standart `on`) |

`openssl s_client -reconnect` — bir marta ulanadi, keyin 5 marta qayta ulanadi. `New` — to'liq handshake, `Reused` — sessiya qayta ishlatildi. Kesh yoqilishidan oldin olingan natijalar:

```text vps
$ openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 -reconnect </dev/null 2>/dev/null | grep -E "^(New|Reused)"
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
$ openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 -reconnect -no_ticket </dev/null 2>/dev/null | grep -E "^(New|Reused)"
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
```

- Standart holatda ham sessiya qayta ishlatildi — **ticket** orqali.
- `-no_ticket` (mijoz ticket'ni rad etadi) bilan har safar `New`: kesh `none` bo'lgani uchun server parametrlarni saqlamagan.

Yuqoridagi `tls.conf` dagi kesh bilan (hujjatdagi misol qiymatlari):

```text vps
$ openssl s_client -connect 127.0.0.1:443 -servername example.com -tls1_2 -reconnect -no_ticket </dev/null 2>/dev/null | grep -E "^(New|Reused)"
New, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
Reused, TLSv1.2, Cipher is ECDHE-ECDSA-AES256-GCM-SHA384
```

Endi ticket'siz ham `Reused` — parametrlar serverdagi keshda.

NG ssl module:

- `shared:SSL:10m` — barcha worker jarayonlari uchun **umumiy** kesh, nomi `SSL`, hajmi 10 MB. 1 MB taxminan **4000** sessiyani sig'diradi.
- `builtin` — OpenSSL'ning ichki keshi, faqat bitta worker uchun, xotira bo'linib ketishiga olib kelishi mumkin. Hujjat: faqat `shared` ishlatish samaraliroq.
- `ssl_session_timeout` — sessiyani qancha vaqt qayta ishlatish mumkin (standart `5m`).
- `shared` kesh 1.23.2 dan boshlab ticket kalitlarini ham yaratadi, saqlaydi va muntazam almashtiradi.

## Variantlar

| Holat | Tavsiya |
| --- | --- |
| Oddiy sayt | `ssl_protocols` va `ssl_ciphers` ni yozmaslik (standart), `ssl_session_cache shared:SSL:10m` |
| Mijozlar faqat zamonaviy | `ssl_protocols TLSv1.3` — `http` darajasida |
| Bir nechta nginx server, ticket'lar umumiy bo'lishi kerak | `ssl_session_ticket_key` fayllari (NG: busiz har server o'z tasodifiy kalitini ishlatadi) |
| Sozlamani har saytga alohida | Ehtiyot bo'ling: `server` darajasida standart server qiymati ishlatilishi mumkin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Internetdan eski `ssl_ciphers` qatorini nusxalash | Standartdan ham zaif bo'lishi mumkin (hujjatdagi `ssl_ciphers` misoli ham eski: `RC4`, `SSLv2`) | Standartni qoldirish |
| `ssl_protocols` da `TLSv1 TLSv1.1` | Eski; OpenSSL 1-darajada ularni o'chiradi | `TLSv1.2 TLSv1.3` |
| Protokolni faqat bitta `server` da cheklash | Standart server qiymati ishlatilishi mumkin | `http` darajasida |
| `ssl_session_cache builtin` | Bitta worker, xotira bo'linishi | `shared:NOM:hajm` |
| Sinovni faqat brauzerda qilish | Qaysi protokol va cipher ishlaganini ko'rmaysiz | `openssl s_client -tls1_2 / -tls1_3` |

## Amaliyot

1. O'z saytingizga `openssl s_client -connect example.com:443 -tls1_3` bilan ulaning. Qaysi cipher tanlandi?
2. `openssl ciphers -v "HIGH:!aNULL:!MD5" | head` — `-v` qo'shimcha nimalarni ko'rsatadi (`Kx`, `Au`, `Enc`, `Mac`)?
3. `ssl_session_tickets off;` qo'yib, kesh **o'chiq** holatda `-reconnect` (`-no_ticket` siz) natijasi qanday bo'ladi?
4. 4000 sessiya/MB bo'yicha `10m` kesh nechta sessiyani saqlaydi?

## Rasmiy hujjat

- NG — Configuring HTTPS servers (optimizatsiya, moslik jadvali): <https://nginx.org/en/docs/http/configuring_https_servers.html>
- NG — `ngx_http_ssl_module` (`ssl_protocols`, `ssl_ciphers`, `ssl_session_cache`, `ssl_session_tickets`, `ssl_conf_command`): <https://nginx.org/en/docs/http/ngx_http_ssl_module.html>
- OpenSSL — `openssl-ciphers`: <https://docs.openssl.org/3.5/man1/openssl-ciphers/>
- OpenSSL — `openssl-s_client` (`-reconnect`, `-no_ticket`): <https://docs.openssl.org/3.5/man1/openssl-s_client/>
- OpenSSL — xavfsizlik darajalari: <https://docs.openssl.org/3.5/man3/SSL_CTX_set_security_level/>
