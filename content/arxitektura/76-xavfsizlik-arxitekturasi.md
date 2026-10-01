# 76 — Xavfsizlik arxitekturasi

[← Oldingi: Kuzatuvchanlik](75-kuzatuvchanlik.md) · [Mundarija](README.md) · [Keyingi: API xavfsizligi →](77-api-xavfsizligi.md)

## Tushuncha

Xavfsizlik — feature emas, **arxitektura xususiyati**. U keyin "qo'shib" bo'lmaydi: ishonch chegaralari, ma'lumot oqimlari, sirlar qayerda — boshidan loyihalanadi.

Asosiy tushunchalar:

| Tushuncha | Ma'no |
| --- | --- |
| **Tahdid modeli** | Kim, nimaga, qanday hujum qilishi mumkin — va biz nima qilamiz |
| **Ishonch chegarasi** | Ma'lumot ishonchsiz zonadan ishonchli zonaga o'tadigan joy — tekshiruv shu yerda |
| **Eng kam imtiyoz** | Har komponent faqat kerakli huquqqa ega |
| **Chuqur himoya** (defense in depth) | Bir qatlam yiqilsa, keyingisi ushlaydi |
| **Hujum yuzasi** | Tashqaridan kirish mumkin bo'lgan hamma narsa — kichikroq = xavfsizroq |

## Nega shunday

Ko'p xavfsizlik muammolari kod xatosi emas, **arxitektura xatosi**: "bu ichki servis, auth kerak emas" (keyin u tashqariga ochildi), "frontend tekshiradi" (API ochiq), "admin panel — maxfiy URL'da" (topildi), "hamma servis bitta DB foydalanuvchisi bilan" (bitta sizish — hamma narsa).

## Psevdokod: ishonch chegaralari

```text
[Brauzer — ISHONCHSIZ]  ─────┐   kiritma: hammasi tekshiriladi (parse, 12-bob), auth, rate limit
                             ▼
[CDN / WAF] → [API gateway / BFF] ─────┐  autentifikatsiya, TLS
                                        ▼
[Servislar — ichki zona]  ── ham bir-biriga to'liq ishonmaydi (zero trust): servislararo auth, mTLS
            │
            ▼
[DB — eng ishonchli zona]  ── faqat servisning o'z foydalanuvchisi, eng kam huquqlar

Uchinchi tomon webhook'lari — ishonchsiz (imzo, 72-bob)
Navbat xabarlari — ichki, lekin sxema bo'yicha tekshirish (zaharli xabar)
LLM javoblari — ishonchsiz kiritma (88-bob)
```

## Psevdokod: tahdid modeli — STRIDE

```text
Har ma'lumot oqimi va komponent uchun so'rang:
  S — Spoofing         (o'zini boshqa deb ko'rsatish)     → autentifikatsiya, imzo
  T — Tampering        (ma'lumotni o'zgartirish)           → imzo, integrity, ruxsat
  R — Repudiation      ("men qilmadim")                    → audit log (31-bob)
  I — Information disclosure (sizish)                       → shifrlash, avtorizatsiya, maskalash
  D — Denial of service                                     → rate limit (30-bob), kvota, timeout
  E — Elevation of privilege (huquqni oshirish)             → avtorizatsiya har darajada (62-bob)

Natija: tahdidlar ro'yxati → har biriga himoya → qolgan risk (ongli qabul qilingan)
```

Tahdid modeli — bir martalik hujjat emas: yangi feature (fayl yuklash, to'lov, AI) — yangi oqim — yangi tahdidlar.

## Psevdokod: sirlar boshqaruvi

```text
Sirlar: DB parollari, API kalitlari, imzo kalitlari, OAuth secret'lar

  ✅ sirlar menejeri (Vault, AWS/GCP Secret Manager, Doppler) yoki platforma sirlari
  ✅ har servis — o'z sirlari, o'z DB foydalanuvchisi
  ✅ rotatsiya: avtomatik yoki rejali; o'g'irlanganda — daqiqalarda almashtirish mumkin
  ✅ qisqa muddatli credentials (OIDC bilan CI → bulut, statik kalitsiz)
  ❌ git, Docker image, log, frontend bundle, Slack xabari
  CI: gitleaks / secret scanning har PR'da
```

## Psevdokod: ta'minot zanjiri

```text
Sizning kodingiz — tizimning kichik qismi; qolgani — bog'liqliklar (npm, composer, Docker image'lar)
  - lock fayllar commit'da, CI'da `npm ci` / `composer install` (lockdan)
  - avtomatik zaiflik skaneri (Dependabot, Renovate, `npm audit`, `composer audit`)
  - minimal base image, root'siz konteyner
  - yangi bog'liqlik qo'shishdan oldin: kim, qachon yangilangan, nechta yuklash
  - SBOM (dasturiy ta'minot tarkibi) — muhim tizimlar uchun
```

## Framework'larda

| Mavzu | Backend | Frontend |
| --- | --- | --- |
| Xavfsizlik asoslari | [Symfony 22](../symfony/22-xavfsizlik.md), [23-bob](../symfony/23-avtorizatsiya.md); [Laravel 21](../laravel/21-autentifikatsiya.md), [22-bob](../laravel/22-avtorizatsiya.md) | [Angular 76](../angular/76-xavfsizlik.md), [React 47](../react/47-xavfsizlik.md), [Vue 65](../vue/65-xavfsizlik.md), [Next.js 45-bob](../nextjs/45-xavfsizlik.md) |
| XSS / CSP | — | Angular `autoCsp`, sanitizatsiya — [Angular 76-bob](../angular/76-xavfsizlik.md) |
| SSR hujum yuzasi | — | SSRF himoyasi, `allowedHosts` — [Angular 62-bob](../angular/62-ssr-asoslari.md) |
| Sirlar | Symfony secrets vault — [Symfony 8-bob](../symfony/08-konfiguratsiya.md) | Frontend'da sir yo'q (18-bob) |

Angular 22'da tekshirilgan misol "xavfsiz sukut" tamoyilining yaxshi ko'rinishi: SSR server `allowedHosts` ko'rsatilmasa **har so'rovni rad etadi** — qulaylik hisobiga xavfsizlik. Yaxshi framework'lar xavfsiz holatni sukut qiladi; arxitektor esa sukutlarni o'chirmasligi kerak.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Perimetr modeli ("ichkari — xavfsiz") | Oddiy | Bitta teshik — hamma narsa ochiq |
| Zero trust (har servis tekshiradi) | Chuqur himoya | Servislararo auth, mTLS, murakkablik |
| Qat'iy sukutlar | Xatolar kam | Qulaylik pasayadi, ishlab chiqish sekinroq |
| Tahdid modellashtirish har feature'da | Erta topiladi | Vaqt va ko'nikma |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Ichki servis — auth shart emas" | Ichkariga kirgan hujumchi erkin | Zero trust |
| Hamma servis bitta DB superuser'i | Bitta sizish — hamma ma'lumot | Har servis — o'z foydalanuvchisi, eng kam huquq |
| Sirlar git'da / image'da | Tarixdan o'chmaydi | Sirlar menejeri, skaner |
| Xavfsizlik — reliz oldidan "audit" | Kech va qimmat | Dizayn bosqichida tahdid modeli |
| Framework xavfsiz sukutlarini o'chirish | Himoya yo'qoladi | Asoslangan istisnolar, ADR bilan |
| Bog'liqliklar yangilanmaydi | Ma'lum zaifliklar | Avtomatik PR'lar, `audit` CI'da |

## Amaliyot

1. Tizimingizning ishonch chegaralarini chizing: har chegarada nima tekshiriladi?
2. Bitta yangi feature uchun STRIDE bo'yicha tahdid modelini yozing.
3. Har servisning DB huquqlarini tekshiring — kimda ortiqcha huquq bor?
4. CI'ga secret scanning va bog'liqlik audit'ini qo'shing.

## Manbalar

- OWASP — *Threat Modeling Cheat Sheet*; OWASP ASVS
- Adam Shostack — *Threat Modeling: Designing for Security*
- NIST SP 800-207 — *Zero Trust Architecture*
