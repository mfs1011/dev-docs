# 21 — HTTPS server

[Mundarija](README.md)

## Tushuncha

19-bobda Certbot sertifikatni oldi, lekin nginx'ga ulamadik. Endi buni qo'lda qilamiz: Certbot'ning `--nginx` o'zgartirishlarisiz, nima nimaga kerakligini bilgan holda.

NG (Configuring HTTPS servers): HTTPS server uchun `server` blokidagi `listen` da **`ssl`** parametri yoqiladi va ikki fayl ko'rsatiladi:

| Direktiva | Fayl | Kimga ko'rinadi |
| --- | --- | --- |
| `ssl_certificate` | Server sertifikati (va zanjir) | **Ochiq**: har bir mijozga yuboriladi |
| `ssl_certificate_key` | Shaxsiy kalit | **Maxfiy**: faqat ruxsati cheklangan faylda, lekin nginx'ning master jarayoni o'qiy olishi kerak |

`ssl_protocols` va `ssl_ciphers` ni yozish shart emas: hujjat bo'yicha standart qiymatlar — `TLSv1.2 TLSv1.3` va `HIGH:!aNULL:!MD5` (22-bob).

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domen bilan sinalgan. Domen `example.com` bilan almashtirilgan. `lab.example.com` — 20-bobdagi ACME moduli bilan ishlayotgan ikkinchi sayt.

## Ko'rib chiqamiz

```text vps
$ cat /etc/nginx/conf.d/sayt.conf
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com www.example.com;
    root /var/www/sayt;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}
$ nginx -t -q && nginx -s reload
```

- 443-port, `ssl`, Certbot'ning `live/` fayllari: `fullchain.pem` — sertifikat va zanjir, `privkey.pem` — kalit (19-bob).
- 80-portdagi server faqat yo'naltiradi: `$host` — so'ralgan nom, `$request_uri` — yo'l va so'rov qatori (redirect — 7-bob). Certbot'ning `if ($host = …)` lari o'rniga bitta `return`: `server_name` allaqachon faqat shu ikki nomni qabul qiladi.

Noutbukdan:

```text tashqi
$ curl -sI http://example.com/sahifa?x=1
HTTP/1.1 301 Moved Permanently
Server: nginx/1.31.8
Date: Mon, 09 Nov 2026 12:00:40 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
Location: https://example.com/sahifa?x=1

$ curl -s https://www.example.com/
<h1>Salom</h1>
```

Yo'l va `?x=1` saqlandi. HTTPS'da `curl` `-k` siz ishladi — sertifikat ishonchli.

`301` — doimiy yo'naltirish: brauzer uni eslab qoladi. Shuning uchun HTTPS to'liq ishlashini tekshirmasdan `301` qo'ymang; avval `302` bilan sinash mumkin (7-bob).

## Sertifikat zanjiri

NG: CA server sertifikatini ko'pincha **oraliq** (intermediate) sertifikat bilan imzolaydi. U brauzerlarning ishonchli ro'yxatida yo'q, shuning uchun server uni o'z sertifikati bilan birga yuborishi kerak. Fayl tartibi: avval server sertifikati, keyin oraliqlar. Let's Encrypt'da bu tayyor fayl — `fullchain.pem`:

```text vps
$ grep -c BEGIN /etc/letsencrypt/live/example.com/fullchain.pem /etc/letsencrypt/live/example.com/cert.pem /etc/letsencrypt/live/example.com/chain.pem
/etc/letsencrypt/live/example.com/fullchain.pem:4
/etc/letsencrypt/live/example.com/cert.pem:1
/etc/letsencrypt/live/example.com/chain.pem:3
```

`fullchain.pem` = `cert.pem` (1 ta) + `chain.pem` (3 ta). Hujjat zanjirni `openssl s_client` bilan tekshirishni ko'rsatadi:

```text vps
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com 2>/dev/null | sed -n "/Certificate chain/,/^---/p"
Certificate chain
 0 s:CN=example.com
   i:C=US, O=Let's Encrypt, CN=YE1
   a:PKEY: EC, (prime256v1); sigalg: ecdsa-with-SHA384
   v:NotBefore: Nov  9 10:52:01 2026 GMT; NotAfter: Feb  7 10:52:00 2027 GMT
 1 s:C=US, O=Let's Encrypt, CN=YE1
   i:C=US, O=ISRG, CN=Root YE
   a:PKEY: EC, (secp384r1); sigalg: ecdsa-with-SHA384
   v:NotBefore: Sep  3 00:00:00 2025 GMT; NotAfter: Sep  2 23:59:59 2028 GMT
 2 s:C=US, O=ISRG, CN=Root YE
   i:C=US, O=Internet Security Research Group, CN=ISRG Root X2
   a:PKEY: EC, (secp384r1); sigalg: ecdsa-with-SHA384
   v:NotBefore: May 13 00:00:00 2026 GMT; NotAfter: Sep  2 23:59:59 2032 GMT
 3 s:C=US, O=Internet Security Research Group, CN=ISRG Root X2
   i:C=US, O=Internet Security Research Group, CN=ISRG Root X1
   a:PKEY: EC, (secp384r1); sigalg: sha256WithRSAEncryption
   v:NotBefore: May 13 00:00:00 2026 GMT; NotAfter: Sep  2 23:59:59 2032 GMT
---
```

Har qator juftligi: `s:` — sertifikat kimniki (subject), `i:` — kim imzolagan (issuer). Har sertifikatning `i:` keyingisining `s:` i bilan bir xil — bu **zanjir**: `example.com` ← `YE1` ← `Root YE` ← `ISRG Root X2` ← `ISRG Root X1`. Mijoz zanjir bo'ylab yuradi va o'zining ishonchli ro'yxatidagi sertifikatga yetib boradi.

### Zanjirsiz sertifikat

Sinov uchun alohida portda faqat `cert.pem` (oraliqlarsiz):

```text vps
$ cat /etc/nginx/conf.d/zanjir.conf
server {
    listen 8443 ssl;
    server_name example.com;
    root /var/www/sayt;
    ssl_certificate     /etc/letsencrypt/live/example.com/cert.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
}
$ nginx -t -q && nginx -s reload; sleep 2
$ echo | openssl s_client -connect 127.0.0.1:8443 -servername example.com 2>/dev/null | sed -n "/Certificate chain/,/^---/p"
Certificate chain
 0 s:CN=example.com
   i:C=US, O=Let's Encrypt, CN=YE1
   a:PKEY: EC, (prime256v1); sigalg: ecdsa-with-SHA384
   v:NotBefore: Nov  9 10:52:01 2026 GMT; NotAfter: Feb  7 10:52:00 2027 GMT
---
$ curl -sS --resolve example.com:8443:127.0.0.1 https://example.com:8443/; echo kod: $?
curl: (60) SSL certificate OpenSSL verify result: unable to get local issuer certificate (20)
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the webpage mentioned above.
kod: 60
$ curl -sS --resolve example.com:443:127.0.0.1 https://example.com/; echo kod: $?
<h1>Salom</h1>
kod: 0
```

- Hujjatda aytilganidek, zanjir qo'shilmasa faqat `0`-sertifikat ko'rinadi.
- `curl` `YE1` ni topa olmadi: `unable to get local issuer certificate`. 443-portdagi `fullchain.pem` bilan esa ishladi. (`--resolve` — nomni DNS'siz shu IP'ga bog'lash.)
- NG: brauzerlar ko'pincha ilgari ko'rgan oraliq sertifikatlarni saqlab qo'yadi. Shuning uchun zanjirsiz sayt **sizning brauzeringizda ochilib**, boshqa mijozlarda (curl, mobil ilovalar, boshqa serverlar) ishlamasligi mumkin. Tekshiruv — brauzer emas, `openssl s_client`.

### Tartib noto'g'ri bo'lsa

NG: fayllar teskari tartibda birlashtirilsa, nginx ishga tushmaydi — kalit birinchi sertifikatga mos kelmaydi:

```text vps
$ cat /etc/letsencrypt/live/example.com/chain.pem /etc/letsencrypt/live/example.com/cert.pem > /root/teskari.pem
$ sed -i "s|/etc/letsencrypt/live/example.com/cert.pem|/root/teskari.pem|" /etc/nginx/conf.d/zanjir.conf
$ nginx -t
nginx: [emerg] SSL_CTX_use_PrivateKey("/etc/letsencrypt/live/example.com/privkey.pem") failed (SSL: error:05800074:x509 certificate routines::key values mismatch)
nginx: configuration file /etc/nginx/nginx.conf test failed
$ rm /etc/nginx/conf.d/zanjir.conf /root/teskari.pem; nginx -t -q && nginx -s reload
```

`key values mismatch` — kalit faylning birinchi sertifikati (`YE1`) bilan solishtirildi. Shuning uchun nginx'ni yangi sertifikat bilan qayta yuklashdan oldin har doim `nginx -t`.

## Bir IP'da bir nechta HTTPS sayt: SNI

VPS'da 443-portda endi ikki sayt: `example.com` (`sayt.conf`) va `lab.example.com` (`acme.conf`, 20-bob). NG: TLS ulanish HTTP so'rovdan **oldin** o'rnatiladi. Shu paytda nginx hali qaysi sayt so'ralganini bilmaydi — `Host` header'i keyin keladi (server tanlash — 6-bob). Yechim — **SNI** (Server Name Indication, RFC 6066): mijoz kerakli nomni TLS ulanishining o'zida yuboradi.

```text vps
$ nginx -V 2>&1 | grep -iE "SNI|built with OpenSSL"
built with OpenSSL 3.5.5 27 Jan 2026
TLS SNI support enabled
$ echo | openssl s_client -connect 127.0.0.1:443 -servername example.com 2>/dev/null | openssl x509 -noout -subject
subject=CN=example.com
$ echo | openssl s_client -connect 127.0.0.1:443 -servername www.example.com 2>/dev/null | openssl x509 -noout -subject
subject=CN=example.com
$ echo | openssl s_client -connect 127.0.0.1:443 -servername lab.example.com 2>/dev/null | openssl x509 -noout -subject
subject=CN=lab.example.com
$ echo | openssl s_client -connect 127.0.0.1:443 -noservername 2>/dev/null | openssl x509 -noout -subject
subject=CN=lab.example.com
```

- `-servername` — SNI'da yuboriladigan nom. Bitta IP va port, lekin har nomga o'z sertifikati.
- `www.example.com` uchun ham `CN=example.com` keldi: bu sertifikatning `Subject Alternative Name` ida ikkala nom bor (19-bob).
- `-noservername` — SNI'siz ulanish. nginx **standart server**ning sertifikatini berdi. Bizda bu `lab.example.com`: `default_server` belgilanmagan, shuning uchun 443-portdagi birinchi server — `conf.d` da alifbo bo'yicha birinchi fayl `acme.conf` dagi (6-bob).

NG yana usullarni sanaydi: har saytga alohida IP (eng ishonchli, eski usul), bitta sertifikatda bir nechta nom (SAN) yoki wildcard. Hujjat: SNI zamonaviy brauzerlarning ko'pchiligida bor va TLS 1.3 da uni qo'llash majburiy, lekin ba'zi eski yoki maxsus mijozlar uni yubormasligi mumkin.

SNI'siz ulanishlarga noto'g'ri saytning sertifikati berilmasligi uchun hujjat standart serverda `ssl_reject_handshake on` ni ko'rsatadi:

```nginx
server {
    listen 443 ssl default_server;
    ssl_reject_handshake on;
    return 421;
}
```

## Variantlar

| Holat | Nima qilish |
| --- | --- |
| Bitta sayt | `listen 443 ssl` + `fullchain.pem` + `privkey.pem`, 80-portdan `301` |
| Bir sertifikatda ko'p nom | Sertifikatni `http` darajasida bir marta yozish (NG: xotirada bitta nusxa) |
| Bir IP'da har xil sertifikatli saytlar | SNI (standart holatda ishlaydi) |
| SNI'siz mijozlarga hech narsa bermaslik | `default_server` + `ssl_reject_handshake on` |
| Bitta server ham HTTP, ham HTTPS | `listen 80; listen 443 ssl;` bitta blokda (NG "A single HTTP/HTTPS server") |

## Tipik xatolar

| Xato | Belgisi | To'g'ri yo'l |
| --- | --- | --- |
| `fullchain.pem` o'rniga `cert.pem` | Brauzerda ochiladi, `curl` da `unable to get local issuer certificate` | `fullchain.pem` |
| Zanjir tartibi teskari | `nginx -t`: `key values mismatch` | Avval server sertifikati, keyin oraliqlar |
| `ssl` direktivasi (`ssl on;`) | NG: 1.25 da olib tashlangan | `listen 443 ssl` |
| 80-portni yopib qo'yish | Yo'naltirish ham, HTTP-01 yangilash ham ishlamaydi | 80 ochiq, `301` bilan (25-bob) |
| HTTPS sinalmasdan `301` | Brauzer eslab qoladi | Avval sinash |
| Kalitni hamma o'qiy oladigan joyda saqlash | Kalit sirligi | `privkey.pem` `0600`, `root` |

## Amaliyot

1. `openssl s_client -connect example.com:443 -servername example.com` ni o'z kompyuteringizdan ishlating. `Verify return code` qatori nima deydi?
2. 443-portdagi standart serverga `ssl_reject_handshake on` qo'ying. `-noservername` bilan ulanganda nima bo'ladi?
3. `http://www.example.com/` ga so'rov qaysi manzilga yo'naltiriladi va nega `$host` aynan shunday ishlaydi?
4. Nega `ssl_certificate_key` dagi fayl `root` niki bo'lsa ham nginx uni o'qiy oladi? (NG: master jarayon.)

## Rasmiy hujjat

- NG — Configuring HTTPS servers: <https://nginx.org/en/docs/http/configuring_https_servers.html>
- NG — `ngx_http_ssl_module`: <https://nginx.org/en/docs/http/ngx_http_ssl_module.html>
- NG — `listen` (`ssl`, `default_server`): <https://nginx.org/en/docs/http/ngx_http_core_module.html#listen>
- RFC 6066 — SNI (3-bo'lim): <https://www.rfc-editor.org/rfc/rfc6066#section-3>
- Certbot — Where are my certificates?: <https://eff-certbot.readthedocs.io/en/stable/using.html#where-are-my-certificates>
