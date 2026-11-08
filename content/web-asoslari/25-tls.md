# 25 — TLS nima beradi

[Mundarija](README.md)

## Tushuncha

MDN (Transport Layer Security): **TLS** — mijoz va serverga **ishonchsiz tarmoq** orqali xavfsiz aloqa qilish imkonini beradigan protokol. Eng muhim qo'llanishi — HTTP ulanishlarini himoyalash: natija **HTTPS**.

TLS ulanishni uch yo'l bilan himoyalaydi (MDN; RFC 9846, 1-bo'lim):

| Xususiyat | Ma'nosi |
| --- | --- |
| **Shifrlash** (confidentiality) | Uzatilayotgan ma'lumotni faqat ikki uchi ko'radi. RFC 9846: TLS ma'lumot **uzunligini** yashirmaydi (yozuvlarni to'ldirish — padding bilan qisman yashirish mumkin) |
| **Yaxlitlik** (integrity) | Hujumchi ma'lumotni yo'lda **sezdirmasdan** o'zgartira olmaydi |
| **Autentifikatsiya** (authentication) | Tomon o'zi aytgan shaxs ekanini isbotlaydi. Vebda odatda faqat **server** o'zini isbotlaydi (sertifikat bilan, 26-bob); mijozni tekshirish — kam uchraydigan maxsus holat |

Bu xususiyatlar hujumchi **tarmoqni to'liq nazorat qilsa ham** saqlanishi kerak (RFC 9846). HTTPS — MITM hujumiga qarshi himoya (28-bob). HTTPS sahifa — xavfsiz kontekst (23-bob). MDN: **barcha saytlar barcha sahifa va resurslarni HTTPS orqali bersin**.

### Versiyalar

| Versiya | Holat (MDN) |
| --- | --- |
| **TLS 1.3** | Joriy va eng keng qo'llanadigan. Standart: RFC 9846 (2026-yil iyul) — RFC 8446 o'rnini egallagan |
| TLS 1.2 | Ba'zi saytlarda hali ishlatiladi |
| TLS 1.1, 1.0 | Endi ishlatilmasligi kerak |
| SSL | TLS'ning o'tmishdoshi (5-bob: Netscape, 1994) |

### Kelishuv (handshake)

Ulanish boshida **kelishuv** bo'ladi (MDN):

1. TLS **versiyasi** tanlanadi.
2. **Shifr to'plami** (cipher suite) tanlanadi — kalitni kelishish, autentifikatsiya, shifrlash va xabar autentifikatsiyasi algoritmlari.
3. Ixtiyoriy: tomonlar bir-birini tekshiradi (vebda — server).
4. Ikki tomon **umumiy maxfiy kalit**ga (symmetric key) keladi.

Kelishuvdan keyin hamma xabarlar — HTTP header'lari ham, tanasi ham — shu kalit bilan shifrlanadi.

TLS 1.3 to'liq kelishuvi (RFC 9846, 2-bo'lim, Figure 1, soddalashtirilgan):

```text
Mijoz                                          Server
ClientHello + key_share         ──────►
                                                ServerHello + key_share
                                                {EncryptedExtensions}
                                                {Certificate}
                                                {CertificateVerify}
                                ◄──────         {Finished}
{Finished}                      ──────►
[Ilova ma'lumoti]               ◄──────►       [Ilova ma'lumoti]

{} — kelishuv kalitlari bilan shifrlangan   [] — ilova kalitlari bilan
```

Uch bosqich (RFC 9846):

| Bosqich | Nima |
| --- | --- |
| **Kalit almashinuvi** | `ClientHello`: tasodifiy son, versiyalar, shifr to'plamlari, `key_share` (kalit almashinuvi ulushi). `ServerHello`: tanlangan parametrlar va serverning ulushi. Ikkalasidan umumiy kalit kelib chiqadi. **Shundan keyingi hamma narsa shifrlangan** |
| **Server parametrlari** | `EncryptedExtensions` — boshqa sozlamalar (mijoz sertifikati kerakmi va h.k.) |
| **Autentifikatsiya** | `Certificate` (server sertifikati), `CertificateVerify` (server shu sertifikat kalitiga egaligini imzo bilan isbotlaydi), `Finished` (butun kelishuv buzilmaganini tasdiqlash) |

TLS 1.2 dan asosiy farqlar (RFC 9846, 1.3):

- Faqat **AEAD** shifrlash algoritmlari qoldi, eskilari olib tashlandi.
- `ServerHello` dan keyingi **barcha** kelishuv xabarlari shifrlangan (TLS 1.2 da sertifikat ochiq ketardi).
- Statik RSA va Diffie-Hellman olib tashlandi — barcha kalit almashinuvi **oldinga maxfiylik** (forward secrecy) beradi: keyinchalik serverning kaliti o'g'irlansa ham, oldingi yozib olingan trafikni ochib bo'lmaydi.
- **0-RTT** rejimi: qayta ulanishda birinchi ma'lumotni darhol yuborish (ba'zi xavfsizlik xususiyatlari evaziga).
- Kelishuv soddalashtirildi, ortiqcha xabarlar (`ChangeCipherSpec`) olib tashlandi — faqat oraliq qurilmalar bilan moslik uchun qoldirilishi mumkin.

Majburiy shifr to'plami (RFC 9846, 9.1): `TLS_AES_128_GCM_SHA256`; tavsiya etiladi: `TLS_AES_256_GCM_SHA384`, `TLS_CHACHA20_POLY1305_SHA256`. Kalit almashinuvi: `secp256r1` shart, `X25519` tavsiya.

### Sozlash

MDN: server TLS sozlamasi xavfsizlikka katta ta'sir qiladi. O'zingiz sozlasangiz — Mozilla'ning tavsiya etilgan sozlamalari va **sozlama generatori** (ssl-config.mozilla.org) dan foydalaning. Zamonaviy xostinglar HTTPS'ni o'zi yoqadi va sertifikatni boshqaradi. Bepul sertifikat — Let's Encrypt (26-bob).

## Ko'rib chiqamiz

Hammasi VPS'da, `openssl s_client` (OpenSSL 3.5.5) va `curl` bilan.

### Kelishuv natijasi

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -brief </dev/null 2>&1 | grep -v '^Verification\|^DONE'
Connecting to 8.6.112.0
CONNECTION ESTABLISHED
Protocol version: TLSv1.3
Ciphersuite: TLS_AES_256_GCM_SHA384
Peer certificate: CN=example.com
Hash used: SHA256
Signature type: ecdsa_secp256r1_sha256
Negotiated TLS1.3 group: X25519MLKEM768
```

| Qator | Ma'nosi |
| --- | --- |
| `Protocol version: TLSv1.3` | Versiya |
| `Ciphersuite: TLS_AES_256_GCM_SHA384` | TLS 1.3 shifr to'plami (AEAD — AES-256-GCM, xesh — SHA-384) |
| `Peer certificate: CN=example.com` | Server sertifikati kimga berilgan (26-bob) |
| `Signature type: ecdsa_secp256r1_sha256` | Server `CertificateVerify` da qanday imzo qo'ydi |
| `Negotiated TLS1.3 group: X25519MLKEM768` | Kalit almashinuvi guruhi: klassik `X25519` va `ML-KEM-768` birikmasi (kuzatildi). RFC 9846: kalit almashinuvida kalitni inkapsulyatsiya mexanizmlari (KEM) boshqa kengaytmalarda ta'riflanadi — ML-KEM shulardan biri |

TLS 1.2 va TLS 1.1 bilan:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -tls1_2 -brief </dev/null 2>&1 | grep -E 'Protocol version|Ciphersuite|group|Temp Key'
Protocol version: TLSv1.2
Ciphersuite: ECDHE-ECDSA-CHACHA20-POLY1305
Peer Temp Key: X25519, 253 bits
$ openssl s_client -connect example.com:443 -servername example.com -tls1_1 -brief </dev/null 2>&1 | head -3
Connecting to 8.6.112.0
40372AEF16720000:error:0A0000BF:SSL routines:tls_setup_handshake:no protocols available:../ssl/statem/statem_lib.c:155:
```

- TLS 1.2 da shifr to'plami nomi boshqacha tuzilgan: `ECDHE-ECDSA-CHACHA20-POLY1305` — kalit almashinuvi (ECDHE), autentifikatsiya (ECDSA) va shifr bitta nomda. TLS 1.3 da kalit almashinuvi va autentifikatsiya to'plamdan ajratilgan (RFC 9846, 1.3).
- TLS 1.1 — `no protocols available`: OpenSSL 3.5 ning standart xavfsizlik sozlamasi eski versiyani **mijozning o'zida** o'chirib qo'ygan (kuzatildi), so'rov serverga ham bormadi.

### Kelishuv bosqichlari

`-state` — OpenSSL mijozi qaysi xabarni yozgani yoki o'qiganini ko'rsatadi:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -tls1_3 -state </dev/null 2>&1 | grep '^SSL_connect' | head -12
SSL_connect:before SSL initialization
SSL_connect:SSLv3/TLS write client hello
SSL_connect:SSLv3/TLS write client hello
SSL_connect:SSLv3/TLS read server hello
SSL_connect:TLSv1.3 read encrypted extensions
SSL_connect:SSLv3/TLS read server certificate
SSL_connect:TLSv1.3 read server certificate verify
SSL_connect:SSLv3/TLS read finished
SSL_connect:SSLv3/TLS write change cipher spec
SSL_connect:SSLv3/TLS write finished
```

RFC'dagi rasmga mos: `client hello` → `server hello` → `encrypted extensions` → `server certificate` → `certificate verify` → `finished`, keyin mijozning `finished`. `change cipher spec` — moslik uchun qoldirilgan xabar (RFC 9846). `client hello` ikki marta yozilgan — bu OpenSSL holat chaqiruvi, tarmoqdagi ikkinchi xabar emas (kuzatildi).

TLS 1.2 da:

```text vps
$ openssl s_client -connect example.com:443 -servername example.com -tls1_2 -state </dev/null 2>&1 | grep '^SSL_connect' | head -14
SSL_connect:before SSL initialization
SSL_connect:SSLv3/TLS write client hello
SSL_connect:SSLv3/TLS write client hello
SSL_connect:SSLv3/TLS read server hello
SSL_connect:SSLv3/TLS read server certificate
SSL_connect:SSLv3/TLS read server key exchange
SSL_connect:SSLv3/TLS read server done
SSL_connect:SSLv3/TLS write client key exchange
SSL_connect:SSLv3/TLS write change cipher spec
SSL_connect:SSLv3/TLS write finished
SSL_connect:SSLv3/TLS write finished
SSL_connect:SSLv3/TLS read server session ticket
SSL_connect:SSLv3/TLS read change cipher spec
SSL_connect:SSLv3/TLS read finished
```

TLS 1.2 da qo'shimcha `server key exchange`, `server done`, `client key exchange` bosqichlari bor, server o'z `finished` ini mijozdan **keyin** yuboradi (kuzatildi). TLS 1.3 da esa server `finished` ni birinchi javobining o'zida yuborgan edi.

### Vaqt

`curl` bilan har versiyada uch marta; `tls bosqichi` = TLS tugagan vaqt − TCP tugagan vaqt:

```text vps
$ for v in 1.2 1.3; do for i in 1 2 3; do if [ $v = 1.2 ]; then o='--tls-max 1.2'; else o='--tlsv1.3'; fi; curl -4 -s $o -o /dev/null -w "%{time_connect} %{time_appconnect}\n" https://example.com/ | awk -v v=$v '{printf "TLS %s: tcp %.0f ms | tls tugadi %.0f ms | tls bosqichi %.0f ms\n", v, $1*1000, $2*1000, ($2-$1)*1000}'; done; done
TLS 1.2: tcp 42 ms | tls tugadi 115 ms | tls bosqichi 73 ms
TLS 1.2: tcp 38 ms | tls tugadi 120 ms | tls bosqichi 82 ms
TLS 1.2: tcp 33 ms | tls tugadi 101 ms | tls bosqichi 69 ms
TLS 1.3: tcp 46 ms | tls tugadi 108 ms | tls bosqichi 62 ms
TLS 1.3: tcp 35 ms | tls tugadi 75 ms | tls bosqichi 40 ms
TLS 1.3: tcp 17 ms | tls tugadi 40 ms | tls bosqichi 23 ms
```

O'lchovlar tarmoqqa qarab sakraydi; bu sinovda TLS 1.3 bosqichi o'rtacha qisqaroq chiqdi. Aniq xulosa uchun ko'p o'lchov kerak — bu yerda faqat tartibni ko'rsatish.

### Shifrlash ko'zga ko'rinadi

`tcpdump -A` — paketlarni matn ko'rinishida yozadi. Avval HTTP (80-port), keyin HTTPS (443-port):

```text vps
$ timeout 5 tcpdump -i any -n -A 'tcp port 80' > /tmp/td80.txt 2>/dev/null & sleep 1; curl -4 -s -o /dev/null http://example.com/; sleep 4; grep -a -o 'GET / HTTP/1.1' /tmp/td80.txt | head -1; grep -a -o 'Host: example.com' /tmp/td80.txt | head -1
GET / HTTP/1.1
Host: example.com
$ timeout 5 tcpdump -i any -n -A 'tcp port 443' > /tmp/td443.txt 2>/dev/null & sleep 1; curl -4 -s -o /dev/null https://example.com/; sleep 4; echo "GET qatori: $(grep -a -c 'GET / HTTP' /tmp/td443.txt) ta"; echo "domen nomi: $(grep -a -c 'example.com' /tmp/td443.txt) ta qatorda"; rm -f /tmp/td80.txt /tmp/td443.txt
GET qatori: 0 ta
domen nomi: 1 ta qatorda
```

- **HTTP**: so'rov qatori va `Host` tarmoqda **ochiq matn** — yo'ldagi har kim o'qiydi.
- **HTTPS**: `GET` qatori **yo'q** — shifrlangan. Lekin domen nomi `example.com` paketlarda **bitta joyda** ko'rindi: bu `ClientHello` dagi **SNI** (Server Name Indication) kengaytmasi — mijoz qaysi saytga ulanayotganini aytadi, `ClientHello` esa shifrlanmaydi (RFC 9846: `ServerHello` dan keyingi xabarlar shifrlangan). Ya'ni HTTPS **nima** so'ralayotganini yashiradi, lekin **qaysi saytga** ulanayotganingizni yo'ldagi kuzatuvchi baribir bilishi mumkin.

## Standartda nima deyilgan

| Hujjat | Bo'lim | Nima |
| --- | --- | --- |
| RFC 9846 (2026-yil iyul) | 1 | Autentifikatsiya, maxfiylik, yaxlitlik; tarmoqni to'liq nazorat qiluvchi hujumchiga qarshi |
| RFC 9846 | 1.3 | TLS 1.2 dan farqlar |
| RFC 9846 | 2 | Kelishuv: kalit almashinuvi, server parametrlari, autentifikatsiya |
| RFC 9846 | 2.3 | 0-RTT |
| RFC 9846 | 9.1 | Majburiy shifr to'plamlari va algoritmlar |
| RFC 6066 | 3 | SNI (`server_name`) |

RFC 9846 RFC 8446 (TLS 1.3 ning birinchi nashri), RFC 5246 (TLS 1.2) va boshqalarni bekor qiladi (Obsoletes).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat login sahifasini HTTPS qilish | Qolgan sahifalar va cookie ochiq ketadi | Butun sayt va barcha resurslar HTTPS (MDN) |
| TLS 1.0/1.1 ni yoqiq qoldirish | Eskirgan | TLS 1.2 va 1.3; Mozilla sozlama generatori |
| "HTTPS — hech kim hech narsani bilmaydi" | SNI'da domen, ma'lumot uzunligi, IP manzil ko'rinadi | HTTPS — mazmun va yaxlitlik himoyasi; to'liq anonimlik emas |
| Sertifikat tekshiruvini o'chirish (`curl -k`, `verify=False`) | Autentifikatsiya yo'qoladi — MITM mumkin | Tekshiruv doim yoqiq (26-bob) |
| HTTP → HTTPS redirect'ni yetarli deb hisoblash | Birinchi so'rov hali ochiq, uni to'xtatib qolish mumkin (SSL stripping) | HSTS (27-bob) |
| TLS'ni qo'lda yozilgan shifr ro'yxati bilan sozlash | Xatoga moyil | Tayyor tavsiya etilgan sozlamalar |

## Amaliyot

1. TLS qanday uch xususiyatni beradi? Vebda odatda kim o'zini tasdiqlaydi?
2. TLS 1.3 kelishuvining uch bosqichi va asosiy xabarlari qaysi?
3. TLS 1.3 da kelishuvning qaysi qismi shifrlangan? TLS 1.2 dan farqi?
4. Oldinga maxfiylik (forward secrecy) nima beradi?
5. Sinovda HTTPS paketlarida `GET` ko'rinmadi, lekin `example.com` ko'rindi. Nega?
6. `openssl s_client -tls1_1` nega ulanmadi?

<details>
<summary>Javoblar</summary>

1. Shifrlash, yaxlitlik, autentifikatsiya. Odatda server (sertifikat bilan).
2. Kalit almashinuvi (`ClientHello`, `ServerHello`), server parametrlari (`EncryptedExtensions`), autentifikatsiya (`Certificate`, `CertificateVerify`, `Finished`).
3. `ServerHello` dan keyingi hamma xabarlar, jumladan sertifikat. TLS 1.2 da sertifikat ochiq ketgan.
4. Server kaliti keyinchalik o'g'irlansa ham, oldin yozib olingan trafikni ochib bo'lmaydi.
5. `GET` shifrlangan ilova ma'lumotida; domen esa shifrlanmagan `ClientHello` dagi SNI'da.
6. OpenSSL 3.5 standart sozlamasida TLS 1.1 mijozning o'zida o'chirilgan (`no protocols available`).

</details>

## Rasmiy hujjat

- [MDN: Transport Layer Security (TLS)](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Transport_Layer_Security)
- [RFC 9846: The TLS Protocol Version 1.3](https://www.rfc-editor.org/rfc/rfc9846)
- [RFC 6066: TLS Extensions (SNI)](https://www.rfc-editor.org/rfc/rfc6066)
- [Mozilla: Server Side TLS](https://wiki.mozilla.org/Security/Server_Side_TLS) · [SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [OpenSSL: s_client](https://docs.openssl.org/3.5/man1/openssl-s_client/)
