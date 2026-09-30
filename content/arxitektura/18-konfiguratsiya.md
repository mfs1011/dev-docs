# 18 — Konfiguratsiya va muhitlar

[← Oldingi: Xatolar modeli](17-xatolar-modeli.md) · [Mundarija](README.md) · [Keyingi: Monolit: to'g'ri qilingan →](19-monolit.md)

## Tushuncha

Konfiguratsiya — muhitlar (**dev, test, staging, production**) orasida farq qiladigan hamma narsa. Kod esa barcha muhitlarda **bir xil** bo'lishi kerak.

| Konfiguratsiya | Kod |
| --- | --- |
| DB manzili, API kalitlari, domenlar | Biznes qoidalari |
| Feature flag'lar | Algoritmlar |
| Limitlar (timeout, pool hajmi) | Marshrutlar, sxemalar |
| Log darajasi | |

Twelve-Factor App (III-faktor): *konfiguratsiyani muhit o'zgaruvchilarida saqlang*, kodda emas.

## Nega shunday

Konfiguratsiya kodda bo'lsa:

```text
if env == "production":
    apiUrl = "https://api.shop.uz"
    stripeKey = "sk_live_…"                 // sir git tarixida — abadiy
else:
    apiUrl = "http://localhost:8000"
```

- **Sir sizishi:** git tarixidan o'chirish deyarli imkonsiz; repo ochilsa yoki nusxalansa — kalit oshkor.
- **Har muhitga alohida build:** staging'da sinalgan artefakt production'ga boradigan artefakt emas.
- **Yangi muhit** (masalan, demo) — kod o'zgarishi.

Maqsad: **bitta build — ko'p muhit**. Artefakt bir marta yig'iladi, konfiguratsiya ishga tushishda beriladi.

## Psevdokod: konfiguratsiya qatlamlari

```text
Ustunlik (pastdagisi yuqoridagini bosadi):
1. Kodda standart qiymatlar         timeout = 5s
2. Konfiguratsiya fayli (git'da)    config/app.yaml — sirsiz, muhitdan mustaqil
3. Muhitga xos fayl                 .env.staging (git'da emas yoki sirsiz)
4. Muhit o'zgaruvchilari            DATABASE_URL, PAYMENT_API_KEY
5. Sirlar menejeri                  Vault, AWS Secrets Manager, Docker/K8s secrets
```

```text
// Ishga tushishda bir marta — tipli va tekshirilgan
config = parseConfig(env):
    DATABASE_URL:     required, url
    PAYMENT_API_KEY:  required, secret
    HTTP_TIMEOUT_MS:  integer, default 5000, min 100
    FEATURE_NEW_CHECKOUT: boolean, default false
// Noto'g'ri yoki yetishmayotgan qiymat — ilova ISHGA TUSHMAYDI (fail fast), 3 soatdan keyin emas
```

Parse, don't validate (12-bob) konfiguratsiyaga ham tegishli: `env("TIMEOUT")` ni har joyda satr sifatida o'qish o'rniga — bir marta tipli ob'ektga.

## Psevdokod: sirlar

```text
Sir: parol, API kaliti, imzo kaliti, token
  ✅ muhit o'zgaruvchisi / sirlar menejeri / fayl (read-only mount)
  ✅ rotatsiya rejasi (kalit o'g'irlansa — qancha vaqtda almashtiriladi?)
  ✅ minimal ruxsat (har xizmat faqat o'z sirlarini ko'radi)
  ❌ git, Docker image qatlami, log, xato xabari, frontend bundle
```

**Frontend konfiguratsiyasi — sir emas.** Brauzerga ketgan har narsa ommaviy: `environment.ts`, `NEXT_PUBLIC_*`, `import.meta.env.VITE_*`. U yerda faqat ommaviy qiymatlar (API URL, publishable key).

## Psevdokod: feature flag'lar

```text
Turlari:
  release flag      — tugallanmagan kod production'da o'chiq turadi (qisqa umr!)
  experiment flag   — A/B test
  ops flag          — og'ir funksiyani yuk paytida o'chirish ("kill switch")
  permission flag   — ma'lum mijozlar uchun

if flags.enabled("new-checkout", user):
    newCheckout()
else:
    oldCheckout()
```

Release flag'lar — **texnik qarz**: har biriga o'chirish muddati. 50 ta unutilgan flag — test qilib bo'lmaydigan kombinatsiyalar (80-bob).

## Framework'larda

| Stack | Mexanizm | Nozik joy | Qayerda |
| --- | --- | --- | --- |
| Symfony | `.env` + `.env.local`, `%env()%` protsessorlari, `secrets:set` (vault) | `.env` git'da — faqat sirsiz standartlar | [Symfony 8-bob](../symfony/08-konfiguratsiya.md) |
| Laravel | `.env`, `config/*.php`, `config:cache` | `config:cache` dan keyin `env()` kod ichida ishlamaydi — faqat `config()` | [Laravel 8-bob](../laravel/08-konfiguratsiya-va-muhit.md) |
| Angular | `environment.ts` (build vaqtida) yoki `config.json` (ishga tushishda) + `APP_CONFIG` tokeni | Bundle'da — ommaviy | [Angular 38-bob](../angular/38-injection-token.md), [76-bob](../angular/76-xavfsizlik.md) |
| Vue / Vite | `import.meta.env.VITE_*` | Faqat `VITE_` prefiksli — va ular ommaviy | [Vue 6-bob](../vue/06-loyiha-tuzilmasi-va-vite.md) |
| Next.js | `process.env` serverda, `NEXT_PUBLIC_*` klientda | Build vaqtida "pishiriladi" | [Next.js 5-bob](../nextjs/05-typescript-konfiguratsiya.md) |

"Bitta build — ko'p muhit" frontend uchun qiyinroq, chunki Vite/Angular konfiguratsiyani build'ga kiritadi. Yechim — ishga tushishda `config.json` yuklash ([Angular 38-bob](../angular/38-injection-token.md) — `main.ts` da top-level `await`).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Kodda konfiguratsiya | Oddiy | Sirlar oshkor, har muhitga build |
| Muhit o'zgaruvchilari | Standart, har platformada | Tip yo'q (satr), ko'p bo'lsa boshqarish qiyin |
| Sirlar menejeri | Rotatsiya, audit, ruxsatlar | Infratuzilma murakkabligi, bog'liqlik |
| Build vaqtidagi frontend konfiguratsiyasi | Tez, sodda | Har muhitga alohida build |
| Ishga tushishdagi `config.json` | Bitta artefakt | Qo'shimcha so'rov, ishga tushish kechikishi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Sir git'da | Tarixdan o'chmaydi | Darhol rotatsiya + muhit o'zgaruvchisi |
| `if env == "prod"` kod ichida | Muhitlar kodda | Konfiguratsiya qiymati |
| Konfiguratsiya xatosi ish vaqtida chiqadi | Soatlardan keyin yiqilish | Ishga tushishda parse, fail fast |
| Frontend'da maxfiy kalit | Hamma ko'radi | Backend orqali |
| Feature flag'lar o'chirilmaydi | Kombinatsiyalar portlashi | Har flag'ga muddat va ega |
| Staging va production konfiguratsiyasi tuzilmasi farqli | "Staging'da ishladi" | Bir xil kalitlar, turli qiymatlar |

## Amaliyot

1. Repo tarixida sirlarni qidiring (`gitleaks`, `trufflehog`); topilsa — rotatsiya.
2. Ilova ishga tushishda barcha konfiguratsiyani tipli ob'ektga parse qilsin va yetishmasa to'xtasin.
3. Frontend build'ingizda `grep` bilan maxfiy qiymat yo'qligini tekshiring.
4. Barcha feature flag'lar ro'yxatini tuzing: egasi, muddati, o'chirilishi mumkinmi?

## Manbalar

- The Twelve-Factor App — III. Config <https://12factor.net/config>
- OWASP — *Secrets Management Cheat Sheet* <https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html>
- Pete Hodgson — *Feature Toggles* <https://martinfowler.com/articles/feature-toggles.html>
