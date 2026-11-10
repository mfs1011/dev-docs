# 20 — nginx'ning ACME moduli

[Mundarija](README.md)

## Tushuncha

19-bobda sertifikatni alohida dastur — Certbot oldi. nginx'ning o'z ACME mijozi ham bor: **`ngx_http_acme_module`**. NG (acme module): modul ACMEv2 protokolini amalga oshiradi va 1.29.0 dan beri tayyor `nginx-module-acme` paketi sifatida tarqatiladi.

Farqi: Certbot sertifikatni faylga yozadi, nginx esa uni o'qiydi. Modulda esa **nginx'ning o'zi** sertifikat so'raydi, HTTP-01 challenge'ga javob beradi, sertifikatni xotirada saqlaydi va muddati yaqinlashganda yangilaydi. Alohida dastur ham, timer ham kerak emas.

Asosiy direktivalar (NG acme module):

| Direktiva | Joyi | Nima qiladi |
| --- | --- | --- |
| `acme_issuer nom { … }` | `http` | Sertifikat beruvchi (CA) |
| `uri` | `acme_issuer` | CA'ning ACME katalogi (directory) manzili. Majburiy |
| `contact` | `acme_issuer` | CA hisob muammolari haqida xabar beradigan manzil (`mailto:` qo'shiladi) |
| `state_path` | `acme_issuer` | Hisob kaliti, sertifikatlar va kalitlar saqlanadigan papka. Hujjat: bu papkada **maxfiy** ma'lumot bor |
| `accept_terms_of_service` | `acme_issuer` | CA shartlariga rozilik |
| `acme_certificate nom` | `server` | Shu `server` uchun sertifikat so'rash. Nomlar ko'rsatilmasa `server_name` dan olinadi (regex va wildcard bo'lmaydi) |
| `$acme_certificate`, `$acme_certificate_key` | `server` | Olingan sertifikat va kalit — `ssl_certificate` va `ssl_certificate_key` ga beriladi |

Yana ikki talab:

- Modul DNS nomlarini o'zi aniqlaydi, shuning uchun `http` blokida **`resolver`** bo'lishi shart (modul README'si).
- HTTP-01 challenge uchun **80-portda** tinglovchi server bo'lishi kerak (NA ACME; hujjatdagi misolda — `listen 80` va `return 404`).

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domenning `lab` subdomeni bilan sinalgan. Chiqishlarda domen `example.com` bilan, email `admin@example.com` bilan almashtirilgan.

## O'rnatish va ulash

Modul nginx.org repozitoriyasidagi paket (nginx'ni o'rnatish — 2-bob). NA ACME bo'yicha modul `nginx.conf` ning eng yuqori (main) qismida `load_module` bilan ulanadi:

```text vps
$ apt-get install -y -qq nginx-module-acme >/dev/null 2>&1; echo kod: $?
kod: 0
$ dpkg -L nginx-module-acme | grep \.so
/usr/lib/nginx/modules/ngx_http_acme_module-debug.so
/usr/lib/nginx/modules/ngx_http_acme_module.so
$ sed -i "1i load_module modules/ngx_http_acme_module.so;" /etc/nginx/nginx.conf
$ head -3 /etc/nginx/nginx.conf
load_module modules/ngx_http_acme_module.so;

user  nginx;
```

## Avval staging

Sinov uchun issuer'ning `uri` si — Let's Encrypt staging katalogi (18-bob). `/etc/nginx/conf.d/` dagi fayllar `http` blokiga kiradi (3-bob), shuning uchun `resolver` va `acme_issuer` shu yerda yozildi:

```text vps
$ cat /etc/nginx/conf.d/acme.conf
resolver 127.0.0.53;

acme_issuer sinov {
    uri         https://acme-staging-v02.api.letsencrypt.org/directory;
    contact     admin@example.com;
    state_path  /var/cache/nginx/acme-sinov;
    accept_terms_of_service;
}

server {
    listen 443 ssl;
    server_name lab.example.com;
    root /var/www/sayt;

    acme_certificate sinov;

    ssl_certificate       $acme_certificate;
    ssl_certificate_key   $acme_certificate_key;
    ssl_certificate_cache max=2;
}
$ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

- `resolver 127.0.0.53` — Ubuntu'dagi `systemd-resolved` manzili (`/etc/resolv.conf` dagi `nameserver`).
- `ssl_certificate_cache max=2` — hujjatdagi misoldan: sertifikat har so'rovda qayta o'qilmasin.
- 80-port uchun alohida server yozmadik: VPS'da `default.conf` allaqachon `listen 80` da.

### Sinovda nima bo'ldi

`nginx -t` o'tdi, lekin `nginx -s reload` dan keyin nginx **to'xtab qoldi**:

```text vps
$ systemctl status nginx --no-pager | head -8
× nginx.service - nginx - high performance web server
     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: failed (Result: signal) since Mon 2026-11-09 14:57:15 MSK; 20s ago
   Duration: 14h 36min 4.031s
 Invocation: a5faf0b5fc684d639c588168770302f5
       Docs: https://nginx.org/en/docs/
   Main PID: 966 (code=killed, signal=SEGV)
   Mem peak: 7.1M (swap: 840K)
$ journalctl -u nginx --since "-10min" --no-pager | tail -3
Nov 09 14:57:15 lab systemd[1]: nginx.service: Main process exited, code=killed, status=11/SEGV
Nov 09 14:57:15 lab systemd[1]: nginx.service: Failed with result 'signal'.
Nov 09 14:57:15 lab systemd[1]: nginx.service: Consumed 2.742s CPU time over 14h 36min 4.301s wall clock time, 7.1M memory peak, 840K memory swap peak.
$ systemctl start nginx
$ systemctl is-active nginx
active
```

Master jarayon `SEGV` (xotiraga noto'g'ri murojaat) bilan qulagan — 14 soat ishlagan nginx'ga `reload` orqali yangi modul yuklanayotganda. Toza ishga tushirishdan keyin hammasi ishladi. Bu holat sinov serverimizda kuzatildi; sababini tekshirmadik. Amaliy xulosa: `load_module` qo'shilganda `reload` emas, oldindan rejalashtirilgan `systemctl restart` qiling va keyin `systemctl is-active nginx` bilan tekshiring.

Ishga tushgach, modul sertifikat so'radi. Error log'da bitta xato bor:

```text vps
$ grep -E "acme|letsencrypt" /var/log/nginx/error.log | tail -3
2026/11/09 14:57:43 [error] 62565#62565: connect() to acme-staging-v02.api.letsencrypt.org failed (101: Network is unreachable) while connecting, server: acme-staging-v02.api.letsencrypt.org, addr: [2606:4700:60:0:f41b:d4fe:4325:6026]:443
```

NG core module (`resolver`): nginx standart holatda IPv4 va IPv6 manzillarni ham aniqlaydi. VPS'da IPv6 yo'q, shuning uchun IPv6 manzilga ulanish `Network is unreachable` bo'ldi; shunga qaramay bir daqiqa ichida sertifikat olindi (IPv4 orqali):

```text vps
$ ls -l /var/cache/nginx/acme-sinov/
total 20
-rw-r--r-- 1 root  root   241 Nov  9 14:57 account.key
-rw-rw-rw- 1 nginx nginx   64 Nov  9 14:57 account.url
-rw-rw-rw- 1 nginx nginx 5095 Nov  9 14:58 lab.example.com-69d9e81ee345aae7.crt
-rw-rw-rw- 1 nginx nginx  241 Nov  9 14:58 lab.example.com-69d9e81ee345aae7.key
$ echo | openssl s_client -connect 127.0.0.1:443 -servername lab.example.com 2>/dev/null | openssl x509 -noout -issuer -subject -dates -ext subjectAltName
issuer=C=US, O=Let's Encrypt, CN=(STAGING) Baloney Bulgur YE2
subject=CN=lab.example.com
notBefore=Nov  9 10:59:26 2026 GMT
notAfter=Jan 12 10:59:25 2027 GMT
X509v3 Subject Alternative Name: 
    DNS:lab.example.com
```

- `state_path` papkasida: hisob kaliti (`account.key`), hisob manzili (`account.url`), sertifikat va uning kaliti.
- `openssl s_client` nginx'ga TLS orqali ulanib, u bergan sertifikatni ko'rsatadi (`-servername` — qaysi nom so'ralayotgani, SNI; 21-bob). `issuer` da **(STAGING)** — bu sinov sertifikati.

## Production

Ikki o'zgarish: `uri` — production katalogi va `resolver` da `ipv6=off` (NG core module: IPv6 manzillarni qidirmaslik):

```text vps
$ cat /etc/nginx/conf.d/acme.conf
resolver 127.0.0.53 ipv6=off;

acme_issuer letsencrypt {
    uri         https://acme-v02.api.letsencrypt.org/directory;
    contact     admin@example.com;
    state_path  /var/cache/nginx/acme-letsencrypt;
    accept_terms_of_service;
}

server {
    listen 443 ssl;
    server_name lab.example.com;
    root /var/www/sayt;

    acme_certificate letsencrypt;

    ssl_certificate       $acme_certificate;
    ssl_certificate_key   $acme_certificate_key;
    ssl_certificate_cache max=2;
}
$ nginx -t -q && nginx -s reload; sleep 15
$ systemctl is-active nginx
active
$ ls -l /var/cache/nginx/acme-letsencrypt/
total 20
-rw-r--r-- 1 root  root   241 Nov  9 14:58 account.key
-rw-rw-rw- 1 nginx nginx   57 Nov  9 14:58 account.url
-rw-rw-rw- 1 nginx nginx 4820 Nov  9 14:58 lab.example.com-69d9e81ee345aae7.crt
-rw-rw-rw- 1 nginx nginx  241 Nov  9 14:58 lab.example.com-69d9e81ee345aae7.key
$ grep -E "acme|letsencrypt" /var/log/nginx/error.log | tail -3
2026/11/09 14:57:43 [error] 62565#62565: connect() to acme-staging-v02.api.letsencrypt.org failed (101: Network is unreachable) while connecting, server: acme-staging-v02.api.letsencrypt.org, addr: [2606:4700:60:0:f41b:d4fe:4325:6026]:443
$ curl -s https://lab.example.com/
<h1>Salom</h1>
$ echo | openssl s_client -connect 127.0.0.1:443 -servername lab.example.com 2>/dev/null | openssl x509 -noout -issuer -subject -dates -ext subjectAltName
issuer=C=US, O=Let's Encrypt, CN=YE1
subject=CN=lab.example.com
notBefore=Nov  9 11:00:19 2026 GMT
notAfter=Feb  7 11:00:18 2027 GMT
X509v3 Subject Alternative Name: 
    DNS:lab.example.com
```

- Modul yuklangan bo'lgani uchun bu safar `reload` muammosiz o'tdi.
- Error log'da yangi xato yo'q — oxirgi qator eski, staging'dagi xato.
- `curl` `-k` siz ishladi: sertifikatga ishonildi (Let's Encrypt `YE1`), muddati 90 kun.
- Fayllar `0666` bilan yozilgan, lekin `state_path` papkasining o'zi faqat `nginx` uchun ochiq:

```text vps
$ ls -ld /var/cache/nginx/acme-letsencrypt
drwx------ 2 nginx root 4096 Nov  9 14:58 /var/cache/nginx/acme-letsencrypt
```

### Yangilash

Modul README'si: modul ACME Renewal Information (ARI, RFC 9773) kengaytmasini qo'llaydi — CA sertifikatni qachon yangilash kerakligini o'zi aytadi. Yangilashni nginx o'zi bajaradi (NA ACME: `acme_certificate` sertifikatni berish va yangilashni avtomatlashtiradi). `state_path` sozlangani uchun hisob va sertifikatlar nginx qayta ishga tushganda ham saqlanadi (NG acme module: busiz hisob kaliti `restart` da yo'qoladi).

## Variantlar

| | Certbot (19-bob) | ACME moduli |
| --- | --- | --- |
| Qo'shimcha dastur | Certbot (snap) va timer | Yo'q, nginx'ning o'zi |
| Sertifikat qayerda | `/etc/letsencrypt/live/…` fayllari | Xotirada va `state_path` da |
| Boshqa dasturlar ham ishlatadimi | Ha (fayllarni boshqa servis ham o'qiy oladi) | Faqat shu nginx |
| Challenge | HTTP-01, DNS-01 (plaginlar) | HTTP-01, TLS-ALPN-01 (`challenge`) |
| Wildcard (`*.example.com`) | DNS plaginlari bilan | Yo'q (DNS-01 yo'q) |
| Yangi texnologiya | Yillar davomida ishlatilgan | Paket 1.29.0 dan, modul versiyasi 0.x |

## Tipik xatolar

| Xato | Belgisi | To'g'ri yo'l |
| --- | --- | --- |
| `resolver` yo'q | Modul CA nomini aniqlay olmaydi | `http` blokida `resolver` |
| IPv6'siz serverda `resolver` standart holatda | Logda `Network is unreachable` | `resolver … ipv6=off;` |
| 80-port yopiq yoki tinglovchi yo'q | HTTP-01 o'tmaydi | `listen 80` server va firewall'da 80 ochiq (25-bob) |
| `state_path` siz | Har `restart` da yangi hisob kaliti va qayta so'rovlar — cheklovlarga yaqinlashish | `state_path` papkasi |
| `load_module` dan keyin faqat `reload` va tekshirmaslik | Bizning sinovda nginx qulab tushdi | `restart`, keyin `systemctl is-active nginx` |
| `server_name` da regex yoki `*.` | Sertifikat nomi bo'la olmaydi | Aniq nomlar |

## Amaliyot

1. `acme_certificate sinov www.lab.example.com lab.example.com;` kabi nomlarni aniq ko'rsatish `server_name` dan olishdan nimasi bilan farq qiladi? (NG acme module, `acme_certificate`.)
2. `acme_certificate letsencrypt key=rsa:2048;` qilsangiz `openssl s_client … | openssl x509 -noout -text` da kalit turi qanday o'zgaradi?
3. `profile shortlived;` direktivasi nima so'raydi (18-bobdagi profillar)?
4. `systemctl restart nginx` dan keyin `state_path` dagi fayllar o'zgaradimi? `ls -l` vaqtlarini solishtiring.

## Rasmiy hujjat

- NG — `ngx_http_acme_module`: <https://nginx.org/en/docs/http/ngx_http_acme_module.html>
- NA — ACME (o'rnatish va sozlash): <https://docs.nginx.com/nginx/admin-guide/dynamic-modules/acme/>
- Modul manbasi va README: <https://github.com/nginx/nginx-acme>
- NG — `resolver` (`ipv6=off`): <https://nginx.org/en/docs/http/ngx_http_core_module.html#resolver>
- RFC 9773 — ACME Renewal Information: <https://www.rfc-editor.org/rfc/rfc9773>
