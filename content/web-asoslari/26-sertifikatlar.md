# 26 — Sertifikatlar

[Mundarija](README.md)

## Tushuncha

25-bobda TLS'ning uchinchi xususiyati — **autentifikatsiya**: server haqiqatan `example.com` ekanini isbotlaydi. Buning vositasi — **raqamli sertifikat**.

### Sertifikat va tasdiqlovchi markaz

MDN:

- **Raqamli sertifikat** (digital certificate) — **ochiq kalit**ni egasiga (tashkilot, domen) bog'laydigan fayl. Unda egasi haqida ma'lumot (masalan, `mozilla.org`) bo'ladi va odatda uni **tasdiqlovchi markaz** imzolaydi.
- **Tasdiqlovchi markaz** (certificate authority, **CA**) — sertifikatlar va ulardagi ochiq kalitlarni **imzolab**, ichidagi ma'lumot to'g'ri ekanini tasdiqlaydigan tashkilot. CA'lar internetdagi ochiq kalit infratuzilmasining (PKI) qismi.
- Brauzerlarda oldindan **ildiz sertifikatlar** (root certificates) ro'yxati bor. Brauzer sayt sertifikati ildizga **zanjir** orqali bog'lanishini tekshiradi. Butun tizim har bir CA shaxsni yetarli tekshirishiga tayanadi.

Sayt sertifikatining ochiq kaliti — 25-bobdagi `CertificateVerify` imzosini tekshirish uchun: server shu kalitning **shaxsiy** juftiga egaligini isbotlaydi (MDN TLS: sertifikat saytning kalitlarini domen nomiga bog'laydi). Bepul sertifikatlarni keng tarqalgan notijorat CA — **Let's Encrypt** beradi; zamonaviy xostinglar sertifikatni o'zi boshqaradi.

### Zanjir

```text
ildiz CA (brauzer/OS omborida)
   └─ imzolaydi → oraliq CA (intermediate)
                     └─ imzolaydi → sayt sertifikati (example.com)
```

Server o'z sertifikatini va **oraliq** sertifikatlarni yuboradi; ildiz brauzerda bor. Brauzer har bo'g'in imzosini yuqoridagi bilan tekshiradi va ildiz ishonchli ro'yxatda bo'lishini talab qiladi (RFC 5280 — yo'lni tekshirish).

### Domen nomi mosligi

RFC 9525 (2023-yil noyabr; RFC 6125 o'rnini egallagan):

- Server nomi **faqat `subjectAltName`** (SAN) kengaytmasidan tekshiriladi; `commonName` (`CN=…`) dan foydalanish **endi to'g'ri emas**.
- **Wildcard** (`*.example.com`): `*` faqat bitta va faqat **eng chap yorliq**ning o'zi bo'lishi mumkin; u **bitta** yorliqqa mos keladi — `www.example.com` ga mos, `a.b.example.com` ga emas.

### Certificate Transparency

MDN (Certificate Transparency): **CT** — sertifikatlarning noto'g'ri berilishini oldini olish va kuzatish uchun ochiq tizim. Yangi sertifikat ommaviy **CT jurnallariga** (CT logs) yoziladi — faqat qo'shib boriladigan, kriptografik kafolatlangan ro'yxat (Merkle daraxti asosida). Shu tufayli CA'lar jamoatchilik nazorati ostida: zararli yoki qoidalarni buzgan sertifikat tez topiladi va bekor qilinadi. CT 2013-yilda, CA buzilishlari fonida paydo bo'lgan (masalan, 2011-yildagi DigiNotar).

Jurnalga yozilganda **SCT** (Signed Certificate Timestamp) — "qo'shildi" degan imzolangan kvitansiya beriladi. Uni mijozga yetkazish usullari: sertifikatning o'z X.509 kengaytmasida (MDN: 2021-yil iyunidan buyon amaldagi ommaviy sertifikatlarning ko'pchiligida shunday), TLS kengaytmasida yoki OCSP stapling orqali. Chrome, Safari va Firefox (desktop 135-versiyadan) ommaviy sertifikatlardan CT talab qiladi. Joriy standart — RFC 9162 (CT 2.0); brauzerlar hali eski RFC 6962 ga asoslanadi (MDN).

## Ko'rib chiqamiz

Hammasi VPS'da (OpenSSL 3.5.5, curl 8.18.0).

### `example.com` zanjiri

`-showcerts` — server yuborgan barcha sertifikatlar; `s:` — kimga berilgan (subject), `i:` — kim imzolagan (issuer), `v:` — amal qilish muddati:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -showcerts </dev/null 2>/dev/null | grep -E '^ *[0-9] s:|^ +i:|^ +a:|^ +v:|Verify return code'
 0 s:CN=example.com
   i:C=US, O=SSL Corporation, CN=Cloudflare TLS Issuing ECC CA 3
   a:PKEY: EC, (prime256v1); sigalg: ecdsa-with-SHA256
   v:NotBefore: Sep 26 22:49:11 2026 GMT; NotAfter: Dec 25 22:56:35 2026 GMT
 1 s:C=US, O=SSL Corporation, CN=Cloudflare TLS Issuing ECC CA 3
   i:C=US, O=SSL Corporation, CN=SSL.com TLS Transit ECC CA R2
   a:PKEY: EC, (prime256v1); sigalg: ecdsa-with-SHA384
   v:NotBefore: May 29 19:49:45 2025 GMT; NotAfter: May 27 19:49:44 2035 GMT
 2 s:C=US, O=SSL Corporation, CN=SSL.com TLS Transit ECC CA R2
   i:C=US, O=SSL Corporation, CN=SSL.com TLS ECC Root CA 2022
   a:PKEY: EC, (secp384r1); sigalg: ecdsa-with-SHA384
   v:NotBefore: Oct 21 17:02:23 2022 GMT; NotAfter: Oct 17 17:02:22 2037 GMT
 3 s:C=US, O=SSL Corporation, CN=SSL.com TLS ECC Root CA 2022
   i:C=GB, ST=Greater Manchester, L=Salford, O=Comodo CA Limited, CN=AAA Certificate Services
   a:PKEY: EC, (secp384r1); sigalg: sha256WithRSAEncryption
   v:NotBefore: Aug  1 00:00:00 2025 GMT; NotAfter: Dec 31 23:59:59 2028 GMT
Verify return code: 0 (ok)
```

| Daraja | Sertifikat | Kim imzolagan |
| --- | --- | --- |
| 0 | `example.com` — sayt | Cloudflare TLS Issuing ECC CA 3 |
| 1 | Cloudflare TLS Issuing ECC CA 3 — oraliq | SSL.com TLS Transit ECC CA R2 |
| 2 | SSL.com TLS Transit ECC CA R2 — oraliq | SSL.com TLS ECC Root CA 2022 |
| 3 | SSL.com TLS ECC Root CA 2022 | Comodo "AAA Certificate Services" (eski ildiz bilan o'zaro imzo — kuzatildi) |

Har qatorda `i:` keyingi qatordagi `s:` ga teng — zanjir uzluksiz. `Verify return code: 0 (ok)` — OpenSSL zanjirni tizim omboridagi ildizgacha tekshirdi. Sayt sertifikati **qisqa muddatli** (sentabr — dekabr, ~3 oy), oraliqlar — yillarga.

Tizimdagi ildizlar ombori:

```text vps
$ ls /etc/ssl/certs/*.pem | wc -l
120
```

### Sayt sertifikati ichida

```text vps
$ openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates -ext subjectAltName,basicConstraints,extendedKeyUsage
subject=CN=example.com
issuer=C=US, O=SSL Corporation, CN=Cloudflare TLS Issuing ECC CA 3
notBefore=Sep 26 22:49:11 2026 GMT
notAfter=Dec 25 22:56:35 2026 GMT
X509v3 Basic Constraints: critical
    CA:FALSE
X509v3 Subject Alternative Name: 
    DNS:example.com, DNS:*.example.com
X509v3 Extended Key Usage: 
    TLS Web Server Authentication
```

- `CA:FALSE` — bu sertifikat boshqa sertifikatni imzolay olmaydi (sayt sertifikati).
- `Subject Alternative Name: DNS:example.com, DNS:*.example.com` — **qaysi nomlar uchun** amal qiladi. RFC 9525 bo'yicha brauzer aynan shu ro'yxatga qaraydi.
- `TLS Web Server Authentication` — maqsadi: TLS server.

CT kvitansiyalari:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -text | grep -A1 'CT Precertificate SCTs'; openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null | openssl x509 -noout -text | grep -c 'Log ID'
            CT Precertificate SCTs: 
                Signed Certificate Timestamp:
2
```

Sertifikatga **2 ta** CT jurnalining SCT'si joylangan — u ommaviy jurnallarda qayd etilgan.

### Nom mosligi va wildcard

`-verify_hostname` — sertifikatni boshqa nomga solishtirish:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -verify_hostname www.example.com </dev/null 2>/dev/null | grep 'Verify return code'
Verify return code: 0 (ok)
$ openssl s_client -connect example.com:443 -servername example.com -verify_hostname a.b.example.com </dev/null 2>/dev/null | grep 'Verify return code'
Verify return code: 62 (hostname mismatch)
$ openssl s_client -connect example.com:443 -servername example.com -verify_hostname example.org </dev/null 2>/dev/null | grep 'Verify return code'
Verify return code: 62 (hostname mismatch)
$ curl -sS -o /dev/null https://8.47.69.0/ 2>&1 | head -1
curl: (60) SSL: no alternative certificate subject name matches target ipv4 address '8.47.69.0'
```

- `www.example.com` — `*.example.com` ga mos.
- `a.b.example.com` — **mos emas**: wildcard faqat bitta yorliqni almashtiradi (RFC 9525).
- `example.org` — SAN'da yo'q.
- IP manzil bilan ulanish — sertifikatda IP yo'q, `curl` rad etdi (`60`).

### Buzilgan sertifikatlar

`badssl.com` — atayin noto'g'ri sozlangan sinov sertifikatlari bo'lgan sayt: (`wrong.host` qatorlari olib tashlandi — sinov paytida bu xost ulanishni uzdi, `Connection reset by peer`; `exit:` qatorlari ham — u `head` ning kodi edi)

```text vps
$ for h in expired wrong.host self-signed untrusted-root; do printf '%-15s ' $h; curl -sS -o /dev/null https://$h.badssl.com/ 2>&1 | head -1; echo "   exit: $?"; done
expired         curl: (60) SSL certificate OpenSSL verify result: certificate has expired (10)
self-signed     curl: (60) SSL certificate OpenSSL verify result: self-signed certificate (18)
untrusted-root  curl: (60) SSL certificate OpenSSL verify result: self-signed certificate in certificate chain (19)
$ for h in expired wrong.host self-signed untrusted-root; do printf '%-15s ' $h; curl -s -o /dev/null -w '%{ssl_verify_result}\n' https://$h.badssl.com/; done
expired         10
self-signed     18
untrusted-root  19
$ openssl s_client -connect expired.badssl.com:443 -servername expired.badssl.com </dev/null 2>/dev/null | openssl x509 -noout -dates
notBefore=Apr  9 00:00:00 2015 GMT
notAfter=Apr 12 23:59:59 2015 GMT
```

| Holat | curl xabari | OpenSSL kodi |
| --- | --- | --- |
| Muddati o'tgan (2015-yil aprel) | `certificate has expired` | 10 |
| O'z-o'zidan imzolangan (23-bobdagi kabi) | `self-signed certificate` | 18 |
| Ishonchsiz ildiz | `self-signed certificate in certificate chain` | 19 |

Har holatda `curl` ulanishni **to'xtatdi** (`60`) — so'rov ham yuborilmadi. Brauzer ham shunday holatda ogohlantirish sahifasini ko'rsatadi.

## Standartda nima deyilgan

| Hujjat | Nima |
| --- | --- |
| RFC 5280 (2008-yil may) | X.509 sertifikat profili va sertifikat yo'lini tekshirish |
| RFC 9525 (2023-yil noyabr) | TLS'da server nomini tekshirish: faqat SAN; wildcard qoidalari |
| RFC 9162 (2021-yil dekabr) | Certificate Transparency 2.0 (RFC 6962 o'rnini egallagan) |
| CA/Browser Forum Baseline Requirements | Ommaviy CA'lar uchun talablar (MDN'da tilga olingan) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Serverda faqat sayt sertifikatini o'rnatish, oraliqni emas | Ba'zi mijozlar zanjirni qura olmaydi | To'liq zanjir (`fullchain`) |
| Sertifikat muddatini kuzatmaslik | Muddat o'tsa — sayt ochilmaydi (`certificate has expired`) | Avtomatik yangilash (ACME, Let's Encrypt) |
| `*.example.com` ni `example.com` va `a.b.example.com` ga ham yaraydi deb o'ylash | Wildcard ildiz domenga ham, ikki darajaga ham mos emas | SAN'ga kerakli nomlarni qo'shish |
| Nomni faqat `CN` ga yozish | RFC 9525: faqat SAN tekshiriladi | SAN |
| Xatoni `curl -k` / `verify=False` bilan "tuzatish" | Autentifikatsiya o'chadi | Sertifikatni to'g'rilash |
| O'z-o'zidan imzolangan sertifikatni ommaviy saytda | Brauzer ishonmaydi | CA sertifikati |
| Shaxsiy kalitni ochiq joyda saqlash | Kim olsa — sayt nomidan ishlay oladi | Faqat server, cheklangan huquqlar |

## Amaliyot

1. Sertifikat nima va uni kim imzolaydi?
2. Sinovdagi zanjirda nechta sertifikat bor va ular qanday bog'langan?
3. `*.example.com` sertifikati `shop.example.com`, `example.com` va `api.v2.example.com` uchun yaraydimi?
4. Nega server nomi `CN` emas, SAN'dan tekshiriladi?
5. Certificate Transparency nima uchun kerak? SCT nima?
6. `certificate has expired` xatosini qanday tuzatish kerak?

<details>
<summary>Javoblar</summary>

1. Ochiq kalitni egasiga (domenga) bog'laydigan fayl; tasdiqlovchi markaz (CA) imzolaydi.
2. To'rtta (sayt + uch oraliq/ildiz bo'g'ini); har birining imzolovchisi (`i:`) keyingisining egasi (`s:`).
3. `shop.example.com` — ha; `example.com` — yo'q (wildcard bitta yorliqni almashtiradi, yorliqsiz emas; sinovdagi sertifikatda `example.com` alohida yozilgan); `api.v2.example.com` — yo'q.
4. RFC 9525: server shaxsi faqat SAN'da ifodalanadi, `CN` dan foydalanish endi to'g'ri emas.
5. Sertifikatlar noto'g'ri berilishini ommaviy jurnallar orqali topish. SCT — sertifikat jurnalga qo'shilgani haqida jurnalning imzolangan kvitansiyasi.
6. Sertifikatni yangilash (va yangilashni avtomatlashtirish) — tekshiruvni o'chirish emas.

</details>

## Rasmiy hujjat

- [MDN: TLS configuration](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS)
- [MDN: Certificate Transparency](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Certificate_Transparency)
- [MDN: Certificate authority](https://developer.mozilla.org/en-US/docs/Glossary/Certificate_authority) · [Digital certificate](https://developer.mozilla.org/en-US/docs/Glossary/Digital_certificate)
- [RFC 5280: X.509 Certificate Profile](https://www.rfc-editor.org/rfc/rfc5280)
- [RFC 9525: Service Identity in TLS](https://www.rfc-editor.org/rfc/rfc9525)
- [RFC 9162: Certificate Transparency 2.0](https://www.rfc-editor.org/rfc/rfc9162)
- [OpenSSL: s_client](https://docs.openssl.org/3.5/man1/openssl-s_client/) · [x509](https://docs.openssl.org/3.5/man1/openssl-x509/)
- [Let's Encrypt](https://letsencrypt.org/)
