# 18 — Sertifikat qanday olinadi

[Mundarija](README.md)

## Tushuncha

HTTPS uchun server brauzerlar ishonadigan **sertifikat**ga muhtoj (TLS va sertifikatlar — Web asoslari kitobi). **Let's Encrypt** — bepul, avtomatlashtirilgan, ochiq sertifikat markazi (CA).

LE (How It Works): Let's Encrypt va **ACME** protokolining maqsadi — HTTPS serverni **odam aralashuvisiz** brauzerlar ishonadigan sertifikat oladigan qilish. Buning uchun veb-serverda **ACME mijozi** ishlaydi (Certbot — 19-bob; nginx'ning o'z ACME moduli — 20-bob).

Jarayon ikki bosqich:

1. ACME mijozi CA'ga server domenni **boshqarishini isbotlaydi** (domen tekshiruvi).
2. Shundan keyin mijoz shu domen uchun sertifikat so'raydi yoki bekor qiladi.

### 1. Domen tekshiruvi

LE:

- Let's Encrypt ACME mijozini **ochiq kaliti** bilan taniydi. Birinchi murojaatda mijoz yangi **hisob kalit juftligi**ni yaratadi.
- Mijoz CA'dan "`example.com` ni boshqarishimni isbotlash uchun nima qilay?" deb so'raydi. CA bir yoki bir nechta **challenge** (topshiriq) beradi — masalan, `example.com` ostida DNS yozuvi yaratish yoki `http://example.com/` dagi ma'lum URI ostida HTTP resurs joylash.
- Mijoz topshiriqni bajarib, CA'ga xabar beradi; CA tekshiradi — **bir nechta tarmoq nuqtasidan** (multiple network perspectives).
- Tekshiruv HTTPS'siz bo'lgani uchun ba'zi hujumlarga zaif; LE buni turli tarmoq nuqtalaridan parallel tekshirish bilan kamaytiradi.

### 2. Sertifikat berish va bekor qilish

LE: mijoz **CSR** (PKCS#10 — Certificate Signing Request) yaratadi: "shu domenga shu ochiq kalit bilan sertifikat ber". CSR'da sertifikat kaliti bilan imzo va hisob kaliti bilan imzo bor. CA ikkalasini tekshiradi va sertifikat beradi; uni ko'plab ochiq **Certificate Transparency** (CT) jurnallariga ham yuboradi. **Yangilash** — jarayonni qaytadan (tekshiruv + yangi sertifikat). Bekor qilish — hisob kaliti bilan imzolangan so'rov.

### Challenge turlari

LE (Challenge Types): bilmasangiz — mijozning standart sozlamasi yoki HTTP-01.

| | **HTTP-01** | **DNS-01** | **TLS-ALPN-01** |
| --- | --- | --- | --- |
| Qanday | Mijoz `http://<domen>/.well-known/acme-challenge/<TOKEN>` faylini joylaydi (token + hisob kaliti izi); LE uni (bir necha nuqtadan) yuklab oladi | `_acme-challenge.<domen>` da TXT yozuvi | 443-portda maxsus ALPN protokoli bilan TLS (RFC 8737) |
| Port | Faqat **80** (ACME standarti) | — | 443 |
| Wildcard (`*.example.com`) | Yo'q | **Ha** | Yo'q |
| IP manzil uchun | Ha | Yo'q | Ha |
| Afzalligi | Oson avtomatlashtiriladi, oddiy veb-serverlar bilan ishlaydi | Bir nechta server, internetga ochiq bo'lmagan serverlar | 80-port yopiq bo'lsa |
| Kamchiligi | 80-port bloklangan bo'lsa ishlamaydi; bir nechta serverda fayl hammasida bo'lishi kerak | DNS API kerak; API kalitlarini serverda saqlash xavfli; DNS tarqalish vaqti | Mijozlar kam qo'llaydi; asosan katta xosting provayderlar uchun |

HTTP-01 tafsilotlari (LE): 10 tagacha yo'naltirishga ergashadi, faqat `http:`/`https:` va 80/443 portlarga; HTTPS'ga yo'naltirilganda sertifikatni **tekshirmaydi** (bu challenge sertifikat olish uchun, yo'lda self-signed yoki muddati o'tgan sertifikat uchrashi mumkin). TLS-SNI-01 — 2019-yil martda xavfsiz emasligi sababli olib tashlangan.

### Sinov muhiti (staging)

LE (Staging Environment): production'dan oldin **staging** bilan sinash qat'iy tavsiya etiladi — ishonchli sertifikat bermasdan hammasini to'g'ri qilib olish va **rate limit**larga (cheklovlar) urilmaslik uchun.

- Manzil: `https://acme-staging-v02.api.letsencrypt.org/directory`.
- Certbot'da: `--test-cert` yoki `--dry-run` (19-bob).
- ACME hisoblari har muhitda alohida.
- Cheklovlar production'dagi kabi, lekin ancha yumshoq (masalan, bir IP'dan yangi ro'yxatdan o'tish — 3 soatda 50).
- Staging sertifikatlari "(STAGING)" prefiksli root'lardan — brauzerlar ularga **ishonmaydi**; ularni oddiy ishonchli ro'yxatga qo'shmang.

## Ko'rib chiqamiz

ACME — oddiy HTTPS ustidagi JSON API. Staging **katalogi** (directory) — mijoz birinchi o'qiydigan manzillar ro'yxati (kompyuterdan, VPS shart emas):

```text tashqi
$ curl -s https://acme-staging-v02.api.letsencrypt.org/directory | python3 -m json.tool
{
    "keyChange": "https://acme-staging-v02.api.letsencrypt.org/acme/key-change",
    "meta": {
        "caaIdentities": [
            "letsencrypt.org"
        ],
        "profiles": {
            "classic": "https://letsencrypt.org/docs/profiles#classic",
            "shortlived": "https://letsencrypt.org/docs/profiles#shortlived",
            "tlsserver": "https://letsencrypt.org/docs/profiles#tlsserver"
        },
        "termsOfService": "https://letsencrypt.org/documents/LE-SA-v1.8-July-06-2026.pdf",
        "website": "https://letsencrypt.org/docs/staging-environment/"
    },
    "newAccount": "https://acme-staging-v02.api.letsencrypt.org/acme/new-acct",
    "newNonce": "https://acme-staging-v02.api.letsencrypt.org/acme/new-nonce",
    "newOrder": "https://acme-staging-v02.api.letsencrypt.org/acme/new-order",
    "renewalInfo": "https://acme-staging-v02.api.letsencrypt.org/acme/renewal-info",
    "revokeCert": "https://acme-staging-v02.api.letsencrypt.org/acme/revoke-cert"
}
```

- `newAccount`, `newNonce`, `newOrder`, `revokeCert`, `keyChange` — ACME bosqichlari: hisob, buyurtma (order), bekor qilish, kalit almashtirish.
- `renewalInfo` — sertifikatni qachon yangilash tavsiyasi.
- `meta.profiles` — sertifikat profillari: `classic`, `shortlived`, `tlsserver` (README: `classic` — 90 kunlik, `shortlived` — 160 soatlik va IP manzil uchun ham).
- `caaIdentities` — DNS'dagi CAA yozuvida ruxsat berish uchun nom.

## Variantlar

| Vaziyat | Challenge |
| --- | --- |
| Bitta server, 80-port ochiq | HTTP-01 |
| `*.example.com` kerak | DNS-01 |
| Server internetga ochiq emas | DNS-01 |
| 80-port yopiq | DNS-01 yoki TLS-ALPN-01 |
| IP manzilga sertifikat | HTTP-01 yoki TLS-ALPN-01 (`shortlived` profili) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Birinchi urinishdan production | Xatolar rate limitga olib keladi (LE) | Avval staging |
| HTTP-01 da 80-portni yopish | Faqat 80-port (ACME) | 80-port ochiq; `/.well-known/acme-challenge/` ga ruxsat |
| HTTP → HTTPS yo'naltirish challenge'ni buzadi deb o'ylash | LE yo'naltirishga ergashadi va sertifikatni tekshirmaydi | Yo'naltirish mumkin, lekin 80/443 ga |
| Wildcard uchun HTTP-01 | Qo'llanmaydi | DNS-01 |
| To'liq huquqli DNS API kalitini veb-serverda | Server buzilsa — butun DNS (LE) | Cheklangan kalit yoki alohida server |
| Staging root'ini tizimning ishonchli ro'yxatiga qo'shish | LE taqiqlaydi | Faqat sinov mijozida |

## Amaliyot

1. ACME jarayonining ikki bosqichi qaysi?
2. HTTP-01 da Let's Encrypt qaysi URL'ni tekshiradi? Qaysi portda?
3. Wildcard sertifikat uchun qaysi challenge kerak?
4. Nega avval staging bilan sinash kerak?
5. Staging sertifikatiga brauzer ishonadimi?
6. CA sertifikatni bergandan keyin uni qayerga yuboradi?

<details>
<summary>Javoblar</summary>

1. Domenni boshqarishni isbotlash; sertifikat so'rash (yoki bekor qilish).
2. `http://<domen>/.well-known/acme-challenge/<TOKEN>`; faqat 80-port.
3. DNS-01.
4. Ishonchli sertifikat bermasdan xatolarni tuzatish va rate limitlarga urilmaslik uchun.
5. Yo'q — staging root'lari brauzer ro'yxatlarida yo'q.
6. Ochiq Certificate Transparency jurnallariga.

</details>

## Rasmiy hujjat

- [LE: How It Works](https://letsencrypt.org/how-it-works/)
- [LE: Challenge Types](https://letsencrypt.org/docs/challenge-types/)
- [LE: Staging Environment](https://letsencrypt.org/docs/staging-environment/)
- [LE: Profiles](https://letsencrypt.org/docs/profiles/)
