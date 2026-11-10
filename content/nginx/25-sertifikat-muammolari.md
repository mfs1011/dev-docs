# 25 — Sertifikat muammolari

[Mundarija](README.md)

## Tushuncha

Sertifikat bilan bog'liq xatolar ko'pincha birdaniga chiqadi: kecha ishlagan sayt bugun "Your connection is not private" ko'rsatadi. HSTS yoqilgan bo'lsa (23-bob), foydalanuvchi uni chetlab o'ta olmaydi ham.

Eng ko'p uchraydigan to'rt sabab:

| Muammo | Mijoz nima deydi (curl / OpenSSL) | Bob |
| --- | --- | --- |
| Zanjir to'liq emas | `unable to get local issuer certificate` (20) | 21 |
| Nom mos kelmaydi | `no alternative certificate subject name matches` / `hostname mismatch` (62) | shu bob |
| Muddati o'tgan | `certificate has expired` (10) | shu bob |
| Yangilash ishlamadi | Muddati o'tadi — yuqoridagi xato, faqat kechroq | shu bob |

Asosiy asbob — `openssl s_client` (NG Configuring HTTPS servers zanjirni ham shu bilan tekshiradi). U serverga TLS orqali ulanadi, sertifikatni ko'rsatadi va tekshiruv natijasini **`Verify return code`** qatorida beradi.

> **Chiqishlar haqida.** Sinov VPS'ida haqiqiy domen bilan sinalgan. Domen `example.com` bilan, VPS IP'si `203.0.113.10` bilan almashtirilgan. Muddati o'tgan sertifikat — sinov uchun o'zimiz yaratgan CA'dan.

## Hammasi joyida bo'lsa

```text vps
$ echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null | grep -E "Verify return code|Verification"
Verification: OK
Verify return code: 0 (ok)
    Verify return code: 0 (ok)
    Verify return code: 0 (ok)
```

`0 (ok)` — zanjir ishonchli ildizgacha yetdi, muddat va nom to'g'ri. (`Verify return code` bir necha marta chiqadi: `s_client` uni har sessiya bo'limida takrorlaydi.)

## Nom mos kelmaydi

DNS'da yangi subdomen qo'shildi, lekin sertifikatga kiritilmadi. Sinov uchun DNS o'rniga `curl --resolve`:

```text vps
$ curl -sS --resolve boshqa.example.com:443:127.0.0.1 https://boshqa.example.com/; echo kod: $?
curl: (60) SSL: no alternative certificate subject name matches target hostname 'boshqa.example.com'
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the webpage mentioned above.
kod: 60
$ echo | openssl s_client -connect 127.0.0.1:443 -servername boshqa.example.com -verify_hostname boshqa.example.com 2>/dev/null | grep -E "subject=|Verify return code"
subject=CN=lab.example.com
Verify return code: 62 (hostname mismatch)
    Verify return code: 62 (hostname mismatch)
    Verify return code: 62 (hostname mismatch)
```

- `boshqa.example.com` uchun `server` yo'q, shuning uchun nginx 443-portdagi **standart server**ning sertifikatini berdi — `lab.example.com` (21-bob, SNI).
- `s_client` nomni o'zi tekshirmaydi — buning uchun `-verify_hostname`. Natija: `62 (hostname mismatch)`.
- Tuzatish: nomni sertifikatga qo'shish (`certbot … -d boshqa.example.com`, ACME modulida — `server_name`) yoki noma'lum nomlar uchun `ssl_reject_handshake` (21-bob).

## Muddati o'tgan

Sinov uchun o'z CA'miz va 2026-yil fevralda muddati tugagan sertifikat:

```text vps
$ openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout ca.key -out ca.pem -subj /CN=Sinov-CA -days 30 2>/dev/null && echo ok
ok
$ openssl req -newkey ec -pkeyopt ec_paramgen_curve:P-256 -nodes -keyout eski.key -out eski.csr -subj /CN=eski.example.com 2>/dev/null && echo ok
ok
$ openssl x509 -req -in eski.csr -CA ca.pem -CAkey ca.key -out eski.pem -not_before 20260101000000Z -not_after 20260201000000Z -extfile <(echo subjectAltName=DNS:eski.example.com) 2>&1
Certificate request self-signature ok
subject=CN=eski.example.com
$ openssl x509 -in eski.pem -noout -subject -enddate
subject=CN=eski.example.com
notAfter=Feb  1 00:00:00 2026 GMT
$ cat /etc/nginx/conf.d/eski.conf
server {
    listen 8443 ssl;
    server_name eski.example.com;
    ssl_certificate     /root/ssl-sinov/eski.pem;
    ssl_certificate_key /root/ssl-sinov/eski.key;
    return 200 "eski\n";
}
$ nginx -t -q && nginx -s reload; sleep 2
$ curl -sS --cacert ca.pem --resolve eski.example.com:8443:127.0.0.1 https://eski.example.com:8443/; echo kod: $?
curl: (60) SSL certificate OpenSSL verify result: certificate has expired (10)
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the webpage mentioned above.
kod: 60
$ echo | openssl s_client -connect 127.0.0.1:8443 -servername eski.example.com -CAfile ca.pem 2>/dev/null | grep -E "Verify return code"
Verify return code: 10 (certificate has expired)
    Verify return code: 10 (certificate has expired)
    Verify return code: 10 (certificate has expired)
```

- `--cacert ca.pem` / `-CAfile ca.pem` — sinov CA'miz ishonchli deb hisoblansin. Shunda boshqa hamma narsa to'g'ri bo'lib, faqat muddat xato qoladi.
- E'tibor bering: **nginx muddati o'tgan sertifikat bilan bemalol ishga tushdi** — `nginx -t` ham, `reload` ham xato bermadi. Muddatni nginx emas, mijoz tekshiradi.

Shuning uchun muddatni o'zingiz kuzating. `openssl x509 -checkend N` — sertifikat N soniyadan keyin ham amal qiladimi:

```text vps
$ openssl x509 -in eski.pem -noout -checkend 0; echo kod: $?
Certificate will expire
kod: 1
$ openssl x509 -in /etc/letsencrypt/live/example.com/cert.pem -noout -checkend $((30*24*3600)); echo kod: $?
Certificate will not expire
kod: 0
$ rm /etc/nginx/conf.d/eski.conf; nginx -t -q && nginx -s reload
```

Chiqish kodi `1` / `0` — monitoring skriptlari uchun qulay (masalan, "30 kundan kam qolsa ogohlantir").

## 80-port nega ochiq turishi kerak

HTTP-01 challenge (18-bob) Let's Encrypt serverlarining **80-portga** HTTP so'rovi bilan tekshiriladi. "Bizda hamma narsa HTTPS'da, 80 kerak emas" deb portni yopsak — sertifikat olinadi, lekin **yangilanmaydi**. Sinov: 80-port qoidasini vaqtincha olib tashlaymiz.

```text vps
$ ufw delete allow 80/tcp
Rule deleted
Rule deleted (v6)
$ ufw status | grep -cE "^80"
0
$ timeout 240 certbot renew --dry-run
Saving debug log to /var/log/letsencrypt/letsencrypt.log

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Processing /etc/letsencrypt/renewal/example.com.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Simulating renewal of an existing certificate for example.com and www.example.com

Certbot failed to authenticate some domains (authenticator: webroot). The Certificate Authority reported these problems:
  Identifier: example.com
  Type:   connection
  Detail: 203.0.113.10: Fetching http://example.com/.well-known/acme-challenge/o7ljZd8HAMC86Lp4yiRRHVpfCsUC2vNFZ8iHDUw8EnA: Timeout during connect (likely firewall problem)

  Identifier: www.example.com
  Type:   connection
  Detail: 203.0.113.10: Fetching http://www.example.com/.well-known/acme-challenge/nfrd0c_Fxkcckk50IVt0z3o9DVyv4RQ4ySR6g5JX9Ws: Timeout during connect (likely firewall problem)

Hint: The Certificate Authority failed to download the temporary challenge files created by Certbot. Ensure that the listed identifiers serve their content from the provided --webroot-path/-w and that files created there can be downloaded from the internet.

Failed to renew certificate example.com with error: Some challenges have failed.

- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
All simulated renewals failed. The following certificates could not be renewed:
  /etc/letsencrypt/live/example.com/fullchain.pem (failure)
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
1 renew failure(s), 0 parse failure(s)
Ask for help or search for solutions at https://community.letsencrypt.org. See the logfile /var/log/letsencrypt/letsencrypt.log or re-run Certbot with -v for more details.
$ ufw allow 80/tcp
Rule added
Rule added (v6)
$ ufw status | grep -E "^80"
80/tcp                     ALLOW       Anywhere                  
80/tcp (v6)                ALLOW       Anywhere (v6)             
```

- Let's Encrypt `http://example.com/.well-known/acme-challenge/…` ni ocha olmadi: `Timeout during connect (likely firewall problem)`.
- Bu `--dry-run` edi (staging), haqiqiy sertifikatga tegmadi. Lekin timer orqali haqiqiy yangilashda xuddi shu xato bo'ladi va sertifikat muddati tugaguncha hech kim sezmasligi mumkin.

LE (Keep Port 80 Open) buni alohida tushuntiradi:

- Umumiy foydalanishdagi har bir server 80-portda HTTP va 443-portda HTTPS berishi, 80-portdagi barcha so'rovlarni yo'naltirishi (va 443-portda HSTS qo'yishi mumkin) kerak.
- 80-portni ochish hujum yuzasini kattalashtirmaydi: unga ham 443-portdagi dastur javob beradi.
- 80-portni yopish tasodifan HTTP orqali kirgan odamni himoya qilmaydi: faol MITM bo'lsa, 80-portga hujumchining o'zi javob beradi.
- Provayder 80-portni to'sib qo'ygan bo'lsa — DNS-01 yoki TLS-ALPN-01 (443-portda).

## Yangilangan sertifikatni nginx qachon oladi

nginx sertifikat fayllarini konfiguratsiyani yuklaganda o'qiydi. Certbot `--nginx` bilan ishlasa, yangilashdan keyin nginx'ni o'zi qayta yuklaydi. 19-bobdagi `certonly --webroot` esa faqat fayllarni yangilaydi. nginx qayta yuklanmasa, eski (muddati tugayotgan) sertifikatni berishda davom etadi.

Certbot hujjati (Pre and Post Validation Hooks): `--deploy-hook` faqat **muvaffaqiyatli** yangilashdan keyin ishlaydi. Buyruq qatori o'rniga `/etc/letsencrypt/renewal-hooks/deploy/` papkasiga bajariladigan fayl qo'yish ham mumkin:

```text vps
$ chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
$ cat /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
#!/bin/sh
nginx -t -q && nginx -s reload
$ ls -l /etc/letsencrypt/renewal-hooks/deploy/
total 4
-rwxr-xr-x 1 root root 41 Nov  9 15:21 nginx-reload.sh
```

`--dry-run` standart holatda deploy hook'larni ishga tushirmaydi. `certbot --help all` bo'yicha `--run-deploy-hooks` ularni sinov paytida ham bajaradi:

```text vps
$ certbot renew --dry-run --run-deploy-hooks 2>&1 | grep -iE "hook|success|fail"
  /etc/letsencrypt/live/example.com/fullchain.pem (success)
$ grep -h -iE "deploy.hook" /var/log/letsencrypt/letsencrypt.log | tail -1 | cut -c1-200
2026-11-09 15:26:41,295:INFO:certbot.compat.misc:Running deploy-hook command: /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
$ grep "SIGHUP" /var/log/nginx/error.log | tail -1
2026/11/09 15:26:41 [notice] 62564#62564: signal 1 (SIGHUP) received from 64712, reconfiguring
```

Hook ishladi va shu soniyada nginx `SIGHUP` oldi — bu `nginx -s reload` (4-bob).

## Let's Encrypt cheklovlari

LE (Rate Limits): cheklovlar "token bucket" usulida — limit tugagach, vaqt o'tishi bilan asta-sekin to'ladi; tezroq tiklab berish yo'li yo'q, sertifikatni bekor qilish (revoke) ham limitni qaytarmaydi. Asosiylari:

| Cheklov | Qiymat |
| --- | --- |
| Bir IP'dan yangi hisob | 3 soatda 10 ta |
| Bitta hisobdan yangi buyurtma (order) | 3 soatda 300 ta |
| Bitta ro'yxatdan o'tgan domenga (`example.com` va uning barcha subdomenlari) | 7 kunda 50 ta sertifikat |
| Aynan bir xil nomlar to'plamiga | 7 kunda 5 ta sertifikat |
| Muvaffaqiyatsiz tekshiruv, bitta nom uchun, bitta hisobdan | Soatiga 5 ta |
| Ketma-ket muvaffaqiyatsiz tekshiruv | 1152 tagacha, keyin shu nom uchun so'rov to'xtatiladi |

- **Yangilash** deyarli hech qachon cheklovga urilmaydi. ARI orqali yangilash (20-bob) barcha cheklovlardan ozod. ARI'siz yangilash ham aynan bir xil nomlar to'plami bo'lsa yangilash deb hisoblanadi.
- Cheklovga urilganda xato matnida qachon qayta urinish mumkinligi yoziladi (`retry after …`) va `Retry-After` header beriladi.
- Tajriba va nosozliklarni tuzatish — **staging**'da (18–19-boblar). LE ham shuni tavsiya qiladi: u yerda limitlar ancha baland.

80-port sinovidagi kabi xato production'da takrorlansa, har urinish "muvaffaqiyatsiz tekshiruv" limitiga yoziladi. Shuning uchun avval sababni topib, keyin `--dry-run` bilan tekshirib, so'ng production.

## Variantlar

| Tekshiruv | Buyruq |
| --- | --- |
| Zanjir va umumiy holat | `openssl s_client -connect host:443 -servername host` → `Verify return code` |
| Nom | `… -verify_hostname host` |
| Qaysi sertifikat berilmoqda | `… \| openssl x509 -noout -subject -issuer -dates -ext subjectAltName` |
| Muddat (fayl) | `openssl x509 -in cert.pem -noout -checkend SONIYA` |
| Yangilash ishlaydimi | `certbot renew --dry-run` |
| Hamma Certbot sertifikatlari | `certbot certificates` |

## Tipik xatolar

| Xato | Oqibati | To'g'ri yo'l |
| --- | --- | --- |
| "HTTPS bor" deb 80-portni yopish | Yangilash jim yiqiladi, 90 kundan keyin sayt ochilmaydi | 80 ochiq, `301` bilan |
| Faqat brauzerda tekshirish | Oraliq sertifikatlar keshi zanjir xatosini yashiradi (21-bob) | `openssl s_client` |
| Muddatni kuzatmaslik | nginx muddati o'tgan sertifikat bilan ham ishga tushadi | `-checkend` bilan monitoring |
| Yangi subdomenni sertifikatga qo'shmaslik | `hostname mismatch` | `-d` bilan qayta olish / `server_name` |
| Production'da qayta-qayta urinish | Muvaffaqiyatsiz tekshiruvlar limiti | Avval `--dry-run`, staging |
| `--webroot` bilan olib, nginx'ni qayta yuklamaslik | nginx eski sertifikatni beraveradi | `renewal-hooks/deploy/` dagi hook yoki `--nginx` |

## Amaliyot

1. O'z saytingiz uchun `openssl s_client … -verify_hostname` bilan `www` siz va `www` li nomni tekshiring. Ikkalasi ham `0 (ok)` mi?
2. `openssl x509 -checkend` bilan "sertifikatga 14 kundan kam qolganda xabar chiqaradigan" bir qatorli buyruq yozing.
3. Nega 80-port yopiq bo'lsa ham **birinchi** sertifikat olish paytida xato sezilmasligi mumkin? (Ishora: sertifikatni qachon va kim olgan.)
4. LE cheklovlari jadvaliga qarab: bir hafta ichida `example.com` uchun 6-marta aynan shu nomlar bilan sertifikat so'rasangiz nima bo'ladi?

## Rasmiy hujjat

- NG — Configuring HTTPS servers (zanjir, `openssl s_client`): <https://nginx.org/en/docs/http/configuring_https_servers.html>
- LE — Rate Limits: <https://letsencrypt.org/docs/rate-limits/>
- LE — Keep Port 80 Open: <https://letsencrypt.org/docs/allow-port-80/>
- Certbot — User Guide (renew, hooks): <https://eff-certbot.readthedocs.io/en/stable/using.html>
- OpenSSL — `openssl-s_client`: <https://docs.openssl.org/3.5/man1/openssl-s_client/>
- OpenSSL — `openssl-x509` (`-checkend`): <https://docs.openssl.org/3.5/man1/openssl-x509/>
- curl — SSL sertifikatlarini tekshirish: <https://curl.se/docs/sslcerts.html>
