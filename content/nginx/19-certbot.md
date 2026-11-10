# 19 — Certbot

[Mundarija](README.md)

## Tushuncha

**Certbot** — EFF (Electronic Frontier Foundation) yuritadigan ACME mijozi (18-bob). LE (Getting Started): ko'pchilik uchun Let's Encrypt aynan Certbot'ni tavsiya qiladi.

Certbot hujjati (User Guide) bo'yicha u ikki ishni bajaradi:

| Ish | Buyruq | Nima qiladi |
| --- | --- | --- |
| Sertifikat olish | `certbot certonly` | Domen sizniki ekanini isbotlaydi, sertifikatni `/etc/letsencrypt/live/` ga saqlaydi va uni muntazam yangilab turadi |
| Olish va o'rnatish | `certbot` (yoki `certbot run`) | Yuqoridagi + veb-server konfiguratsiyasini o'zi o'zgartirib, sertifikatni ulaydi |

Domenni qanday isbotlashni **plagin** belgilaydi. Bu bobda ikkitasi: `--nginx` (nginx'ning o'zi orqali) va `--webroot` (sayt papkasiga vaqtinchalik fayl qo'yish). Ikkalasi ham HTTP-01 challenge (18-bob).

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domen bilan sinalgan. Chiqishlarda domen `example.com` (RFC 2606) bilan, email `admin@example.com` bilan, VPS IP'si `203.0.113.10` bilan almashtirilgan. Haqiqiy sertifikatning seriya raqami ham yashirilgan: u ochiq Certificate Transparency jurnallarida domen bilan birga turadi.

## O'rnatish

Certbot hujjati (Install) — tavsiya etilgan yo'l **snap**. Ko'rsatma (certbot.eff.org, nginx + snapd): snapd o'rnatiladi, keyin `snap install --classic certbot`, so'ng `/snap/bin/certbot` ga `/usr/local/bin/certbot` dan havola qilinadi. OS paket menejeridagi Certbot paketi bo'lsa, oldin o'chirish kerak — `certbot` buyrug'i snap'dagisini chaqirishi uchun.

```text vps
$ apt-get install -y -qq snapd >/dev/null 2>&1; echo kod: $?
kod: 0
$ snap version
snap          2.77.1+ubuntu26.04.2
snapd         2.77.1+ubuntu26.04.2
series        16
ubuntu        26.04
kernel        7.0.0-43-generic
architecture  amd64
$ snap install --classic certbot
2026-11-09T14:41:06+03:00 INFO Waiting for automatic snapd restart...
2026-11-09T14:41:07+03:00 INFO Waiting for automatic snapd restart...
2026-11-09T14:41:08+03:00 INFO Waiting for automatic snapd restart...
2026-11-09T14:41:09+03:00 INFO Waiting for automatic snapd restart...
certbot 5.9.0 from Certbot Project (certbot-eff**) installed
$ ln -s /snap/bin/certbot /usr/local/bin/certbot
$ certbot --version
certbot 5.9.0
$ systemctl list-timers snap.certbot.renew.timer --no-pager
NEXT                        LEFT LAST PASSED UNIT                     ACTIVATES
Mon 2026-11-09 22:49:00 MSK   8h -         - snap.certbot.renew.timer snap.certbot.renew.service

1 timers listed.
Pass --all to see loaded but inactive timers, too.
```

Snap paketi bilan birga yangilash **timer**'i ham keldi (Linux kitobi, 38-bob). Ko'rsatma bo'yicha Certbot paketlari sertifikatni muddati tugashidan oldin avtomatik yangilaydigan cron yoki systemd timer bilan keladi — qayta ishga tushirish shart emas.

Domen VPS'ga yo'naltirilgan (A yozuvi), `www` — CNAME. nginx'da oddiy HTTP sayt:

```text vps
$ cat /etc/nginx/conf.d/sayt.conf
server {
    listen 80;
    server_name example.com www.example.com;
    root /var/www/sayt;
}
```

## `--nginx`: olish va o'rnatish (staging'da)

Avval **staging** (18-bob): `--test-cert` — Let's Encrypt'ning sinov muhiti. Bu yerda cheklovlar yumshoq, brauzerlar esa uning sertifikatlariga ishonmaydi. `-m` — email, `--agree-tos` — Let's Encrypt Subscriber Agreement'ga rozilik, `-n` — savol bermasdan ishlash.

```text vps
$ cp /etc/nginx/conf.d/sayt.conf /root/sayt.conf.asl
$ certbot --nginx --test-cert -d example.com -d www.example.com -m admin@example.com --agree-tos -n
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for example.com and www.example.com

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/example.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/example.com/privkey.pem
This certificate expires on 2027-01-12.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for example.com to /etc/nginx/conf.d/sayt.conf
Successfully deployed certificate for www.example.com to /etc/nginx/conf.d/sayt.conf
Congratulations! You have successfully enabled HTTPS on https://example.com and https://www.example.com
```

(Birinchi ishga tushirishda yuqorida `Account registered.` qatori ham chiqdi: Certbot ACME hisobini ochadi. Staging va production hisoblari alohida.)

Certbot nginx konfiguratsiyasini qanday o'zgartirdi:

```text vps
$ diff -u /root/sayt.conf.asl /etc/nginx/conf.d/sayt.conf
--- /root/sayt.conf.asl	2026-11-09 14:49:04.943469877 +0300
+++ /etc/nginx/conf.d/sayt.conf	2026-11-09 14:49:11.461791905 +0300
@@ -1,5 +1,31 @@
 server {
-    listen 80;
     server_name example.com www.example.com;
     root /var/www/sayt;
+
+    listen 443 ssl; # managed by Certbot
+    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem; # managed by Certbot
+    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem; # managed by Certbot
+    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
+    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
+
+
 }
+server {
+    if ($host = www.example.com) {
+        return 301 https://$host$request_uri;
+    } # managed by Certbot
+
+
+    if ($host = example.com) {
+        return 301 https://$host$request_uri;
+    } # managed by Certbot
+
+
+    listen 80;
+    server_name example.com www.example.com;
+    return 404; # managed by Certbot
+
+
+
+
+}
\ No newline at end of file
```

- Asl server endi **443-portda**, `ssl_certificate` va `ssl_certificate_key` — Certbot fayllari (21-bob). TLS sozlamalari — Certbot'ning o'z fayllaridan (`options-ssl-nginx.conf`, `ssl-dhparams.pem`; TLS sozlamalari — 22-bob).
- 80-port uchun yangi server: shu ikki nomga kelgan HTTP so'rov `301` bilan HTTPS'ga yo'naltiriladi (redirect — 7-bob), boshqasiga `404`.

```text vps
$ curl -s -o /dev/null https://example.com/; echo kod: $?
kod: 60
$ curl -sk -o /dev/null -w "%{http_code}\n" https://example.com/
200
$ curl -sI http://example.com/
HTTP/1.1 301 Moved Permanently
Server: nginx/1.31.8
Date: Mon, 09 Nov 2026 11:49:12 GMT
Content-Type: text/html
Content-Length: 169
Connection: keep-alive
Location: https://example.com/

$ certbot certificates
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: example.com
    Serial Number: (yashirilgan)
    Key Type: ECDSA
    Identifiers: example.com www.example.com
    Expiry Date: 2027-01-12 10:50:37+00:00 (INVALID: TEST_CERT)
    Certificate Path: /etc/letsencrypt/live/example.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/example.com/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

- HTTPS ishlaydi, lekin curl staging sertifikatiga ishonmadi: curl(1) bo'yicha `60` — server sertifikatini ma'lum CA sertifikatlari bilan tasdiqlab bo'lmadi. `-k` (tekshirmaslik) bilan — `200`.
- `INVALID: TEST_CERT` — Certbot ham bu sinov sertifikati ekanini aytyapti.

Sinov tugadi — sertifikatni o'chirib, konfiguratsiyani qaytaramiz. Haqiqiy sertifikatni qo'lda sozlaymiz (21-bob), shuning uchun `certonly`:

```text vps
$ certbot delete --cert-name example.com -n
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Deleted all files relating to certificate example.com.
$ cp /root/sayt.conf.asl /etc/nginx/conf.d/sayt.conf
$ nginx -t -q && nginx -s reload
```

## `certonly --webroot`: faqat olish

Certbot hujjati (Webroot): plagin har domen uchun `${webroot-path}/.well-known/acme-challenge` ichida vaqtinchalik fayl yaratadi. Let's Encrypt validatsiya serveri shu faylni HTTP orqali so'raydi. Veb-serverni to'xtatish kerak emas, lekin u `/.well-known` papkasidagi fayllarni berishi shart.

Production — `--test-cert` siz:

```text vps
$ certbot certonly --webroot -w /var/www/sayt -d example.com -d www.example.com -m admin@example.com --agree-tos -n
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Account registered.
Requesting a certificate for example.com and www.example.com
An unexpected error occurred:
Error finalizing order :: authorizations for these identifiers not valid: www.example.com
Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.
```

Birinchi urinish xato bilan tugadi. Certbot ko'rsatganidek, tafsilot logda (`/var/log/letsencrypt/`). Logda ikkala domenning HTTP-01 tekshiruvi `"status": "valid"` — ya'ni domen tekshiruvi **o'tgan**. Buyurtmani yakunlash (finalize) so'rovi esa shundan keyin `403` qaytargan; nega — logdan ko'rinmaydi. Tekshiruv muvaffaqiyatsiz bo'lmagani uchun qayta urinish mumkin edi (muvaffaqiyatsiz tekshiruvlar soni cheklangan — 25-bob):

```text vps
$ certbot certonly --webroot -w /var/www/sayt -d example.com -d www.example.com -m admin@example.com --agree-tos -n
Saving debug log to /var/log/letsencrypt/letsencrypt.log
Requesting a certificate for example.com and www.example.com

Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/example.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/example.com/privkey.pem
This certificate expires on 2027-02-07.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
If you like Certbot, please consider supporting our work by:
 * Donating to ISRG / Let's Encrypt:   https://letsencrypt.org/donate
 * Donating to EFF:                    https://eff.org/donate-le
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

## Fayllar

```text vps
$ ls -l /etc/letsencrypt/live/example.com/
total 4
-rw-r--r-- 1 root root 692 Nov  9 14:50 README
lrwxrwxrwx 1 root root  35 Nov  9 14:50 cert.pem -> ../../archive/example.com/cert1.pem
lrwxrwxrwx 1 root root  36 Nov  9 14:50 chain.pem -> ../../archive/example.com/chain1.pem
lrwxrwxrwx 1 root root  40 Nov  9 14:50 fullchain.pem -> ../../archive/example.com/fullchain1.pem
lrwxrwxrwx 1 root root  38 Nov  9 14:50 privkey.pem -> ../../archive/example.com/privkey1.pem
$ openssl x509 -in /etc/letsencrypt/live/example.com/fullchain.pem -noout -subject -issuer -dates -ext subjectAltName
subject=CN=example.com
issuer=C=US, O=Let's Encrypt, CN=YE1
notBefore=Nov  9 10:52:01 2026 GMT
notAfter=Feb  7 10:52:00 2027 GMT
X509v3 Subject Alternative Name: 
    DNS:example.com, DNS:www.example.com
```

Certbot hujjati (Where are my certificates?):

| Fayl | Nima | nginx'da |
| --- | --- | --- |
| `privkey.pem` | Sertifikatning shaxsiy kaliti. **Hech qachon hech kimga berilmaydi** | `ssl_certificate_key` |
| `fullchain.pem` | Server sertifikati va undan keyin oraliq (intermediate) sertifikatlar | `ssl_certificate` |
| `cert.pem`, `chain.pem` | Server sertifikati alohida va zanjir alohida | — |

- `live/` dagi fayllar — `archive/` dagi haqiqiy fayllarga **symlink**. Yangilanganda `archive/` ga yangi raqamli fayl (`cert2.pem`…) qo'shiladi, symlink unga o'tadi. Hujjat: fayllarni nusxalamang, konfiguratsiyada to'g'ridan-to'g'ri `live/` dagi yo'lni ko'rsating.
- `openssl x509`: sertifikat kimga (`subject`), kim tomonidan (`issuer` — Let's Encrypt'ning `YE1` oraliq sertifikati) berilgan, amal qilish muddati (90 kun) va qaysi nomlar uchun (`Subject Alternative Name`).

## Yangilash

```text vps
$ certbot certificates
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Found the following certs:
  Certificate Name: example.com
    Serial Number: (yashirilgan)
    Key Type: ECDSA
    Identifiers: example.com www.example.com
    Expiry Date: 2027-02-07 10:52:00+00:00 (VALID: 89 days)
    Certificate Path: /etc/letsencrypt/live/example.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/example.com/privkey.pem
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
$ certbot renew --dry-run
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/example.com.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Simulating renewal of an existing certificate for example.com and www.example.com

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Congratulations, all simulated renewals succeeded: 
  /etc/letsencrypt/live/example.com/fullchain.pem (success)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
```

- `certbot renew` — yangilanishga tayyor bo'lgan hamma sertifikatni yangilaydi. Certbot hujjati: 4.0.0 versiyasidan boshlab sertifikat muddatining **uchdan biridan kami** qolganda yangilanadi.
- `--dry-run` — haqiqiy sertifikat olmasdan, staging'da to'liq jarayonni sinash. Ko'rsatma avtomatik yangilashni aynan shu buyruq bilan tekshirishni tavsiya qiladi.
- Qanday yangilash kerakligi `/etc/letsencrypt/renewal/<nom>.conf` da saqlanadi (bu yerda — `webroot` va papka yo'li).

## Variantlar

| Usul | Qachon | Yutug'i | Kamchiligi |
| --- | --- | --- | --- |
| `certbot --nginx` | Oddiy sayt, konfiguratsiyani Certbot'ga ishonsangiz | Bitta buyruq bilan HTTPS va HTTP→HTTPS yo'naltirish | Konfiguratsiyangizni o'zi o'zgartiradi (`# managed by Certbot`) |
| `certbot certonly --nginx` | Sertifikatni nginx orqali olish, sozlashni o'zingiz qilish | Papka kerak emas | nginx ishlab turishi kerak |
| `certbot certonly --webroot` | Bir nechta sayt, aniq papkalar | Veb-server konfiguratsiyasiga tegmaydi | `/.well-known/acme-challenge` ochiq bo'lishi kerak |
| DNS plaginlari | `*.example.com`, 80-port yopiq | Wildcard | DNS provayderi API'si kerak |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| To'g'ridan-to'g'ri production'da tajriba qilish | Cheklovlarga urilish (25-bob) | Avval `--test-cert` / `--dry-run` |
| `live/` dagi fayllarni boshqa joyga nusxalash | Yangilangandan keyin nginx eski sertifikatda qoladi | Konfiguratsiyada `live/` yo'llari |
| `privkey.pem` ni ulashish yoki repozitoriyga qo'shish | Kalit sirligi buziladi | Faqat serverda, `0600` |
| Xatodan keyin o'ylamay qayta-qayta urinish | Muvaffaqiyatsiz tekshiruvlar soni cheklangan | Avval logni o'qish: tekshiruv o'tganmi yoki yo'qmi |
| Yangilash sinalmagan | 90 kundan keyin sayt "kutilmaganda" ishdan chiqadi | `certbot renew --dry-run` |

## Amaliyot

1. `systemctl list-timers` dan Certbot timer'ini toping. `systemctl cat snap.certbot.renew.timer` — u qanchada bir ishlaydi?
2. `/etc/letsencrypt/renewal/example.com.conf` ni o'qing. Qaysi qatorlar yangilash uchun webroot ishlatilishini ko'rsatadi?
3. `certbot certificates` dagi `VALID: 89 days` va hujjatdagi "uchdan bir" qoidasi bo'yicha sertifikat taxminan nechanchi kuni yangilanadi?
4. `--nginx` bilan staging'da qayta oling va `/etc/letsencrypt/options-ssl-nginx.conf` ichini o'qing. Uni 22-bobda o'zingiz yozadigan sozlamalar bilan solishtiring.

## Rasmiy hujjat

- LE — Getting Started: <https://letsencrypt.org/getting-started/>
- Certbot — Install: <https://eff-certbot.readthedocs.io/en/stable/install.html>
- Certbot — nginx + snapd ko'rsatmasi: <https://certbot.eff.org/instructions?ws=nginx&os=snap>
- Certbot — User Guide (plaginlar, webroot, fayllar, yangilash): <https://eff-certbot.readthedocs.io/en/stable/using.html>
- LE — Staging Environment: <https://letsencrypt.org/docs/staging-environment/>
- curl(1) — chiqish kodlari: <https://curl.se/docs/manpage.html>
