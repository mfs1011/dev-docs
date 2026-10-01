# 83 — Evolyutsion arxitektura

[← Oldingi: Legacy bilan ishlash](82-legacy.md) · [Mundarija](README.md) · [Keyingi: Qaror qabul qilish →](84-qaror-qabul-qilish.md)

## Tushuncha

Evolyutsion arxitektura — **o'zgarishni asosiy talab sifatida** loyihalash: tizim bir martalik "to'g'ri dizayn" emas, yillar davomida o'zgarib boradi, va arxitektura bu o'zgarishni boshqariladigan qilishi kerak.

Uch tarkibiy qism (Ford, Parsons, Kua):

| Qism | Ma'no |
| --- | --- |
| **Fitness function** | Arxitektura xususiyatini avtomatik tekshiradigan test (bog'liqlik qoidasi, latency, bundle hajmi) |
| **Bosqichma-bosqich o'zgarish** | Kichik qadamlar, har biri deploy qilinadigan (80-bob) |
| **Mos bog'lanish** (appropriate coupling) | Bog'lanish faqat kerakli joyda; qolgani — almashtirish mumkin (5-bob) |

## Nega shunday

Arxitektura asta-sekin **eroziyaga** uchraydi: har kichik "vaqtincha" istisno o'zicha zararsiz — lekin bir yildan keyin qatlamlar aralashgan, modullar bir-birini import qiladi, sahifa 3 MB. Hech kim buni qaror qilmagan; shunchaki hech kim tekshirmagan. Wiki'dagi qoida eroziyani to'xtatmaydi; CI'dagi qizil test — to'xtatadi.

## Psevdokod: fitness function turlari

```text
Strukturaviy (har PR'da, CI):
  "Domain qatlami Infrastructure'ni import qilmaydi"           (15-bob)
  "Catalog moduli Checkout ichki papkasini import qilmaydi"    (11, 20-boblar)
  "Sikl bog'liqliklar yo'q"
  "features/ bir-birini import qilmaydi — faqat shared/ orqali" (38-bob)

Unumdorlik (CI / nightly):
  "Asosiy sahifa JS bundle ≤ 180 KB gzip"   (47-bob)
  "GET /products p95 ≤ 200ms yuk testida"   (78-bob)

Shartnoma (CI):
  "OpenAPI'da buzuvchi o'zgarish yo'q"       (54, 58-boblar: oasdiff)
  "Hodisa sxemasi orqaga mos"                (27-bob)

Production (doimiy):
  "SLO bajarilmoqda"                         (79-bob)
  "Hech bir bog'liqlikda kritik CVE yo'q"    (76-bob)
```

## Psevdokod: strukturaviy fitness function misoli

```text
// Psevdokod — Deptrac / ArchUnit / eslint-plugin-boundaries g'oyasi
rules:
  layer Domain:          src/*/Domain/**
  layer Application:     src/*/Application/**
  layer Infrastructure:  src/*/Infrastructure/**

  Domain         may depend on: (hech narsa)
  Application    may depend on: Domain
  Infrastructure may depend on: Domain, Application

test "arxitektura qoidalari":
  violations = analyze(sourceCode, rules)
  assert violations.isEmpty(), violations.format()

Mavjud kodda 40 ta buzilish bo'lsa: baseline fayl — eskilari ruxsat, YANGILARI taqiqlangan.
Baseline kichrayib borishi kerak (o'zi ham metrika).
```

## Psevdokod: qaytariladigan va qaytarilmaydigan qarorlar

```text
Bezos: "Ikki tomonlama eshik" vs "bir tomonlama eshik"

Qaytariladigan (tez qaror qiling):     Qaytarilmaydigan (sekin, ehtiyotkor):
  kutubxona tanlash (adapter ortida)     ommaviy API shartnomasi (53-bob)
  ichki modul tuzilmasi                  ma'lumot modeli, ID formati
  kesh strategiyasi                      hodisa sxemasi (ko'p iste'molchi)
  UI komponent kutubxonasi               multi-tenant izolyatsiya modeli (33-bob)

Evolyutsion yondashuv: qaytarilmaydigan qarorlarni KAMAYTIRISH
  - tashqi narsalarni port/adapter ortiga (15-bob)
  - shartnomani kichik saqlash
  - "oxirgi mas'uliyatli lahza"gacha kutish — lekin undan keyin emas
```

## Psevdokod: arxitektura qarzi

```text
Texnik qarz ro'yxati (ADR kabi, git'da):
  | Qarz                              | Ta'sir              | Narx  | Foiz (har oy)           |
  | Orders va Billing bitta jadvalda  | Billing'ni ajratib bo'lmaydi | 3 hafta | har feature +2 kun |
  | Eski auth moduli (MD5 hash)       | Xavfsizlik          | 1 hafta | risk o'sadi         |

"Foiz" — qarzni to'lamaslik narxi. Eng yuqori foizli qarz — birinchi.
Har sprint/oyda vaqtning 15–20% — qarz va platforma ishlari (rejalashtirilgan, "qolgan vaqt" emas).
```

## Framework'larda

| Fitness function | Vosita | Qayerda |
| --- | --- | --- |
| PHP qatlam qoidalari | Deptrac, PHPArkitect | [Symfony 39](../symfony/39-arxitektura.md), [34-bob](../symfony/34-kod-sifati.md) |
| Frontend import chegaralari | `eslint-plugin-boundaries`, dependency-cruiser, Nx module boundaries | [Arxitektura 38](38-modul-tuzilmasi.md), [React 34-bob](../react/34-arxitektura.md) |
| Bundle hajmi | size-limit; Angular `budgets` | [Arxitektura 47-bob](47-unumdorlik-byudjetlari.md), [Angular 43-bob](../angular/43-lazy-loading.md) |
| API shartnomasi | oasdiff, Spectral | [Arxitektura 54-bob](54-openapi.md) |
| Monorepo chegaralari | Nx tags, Turborepo | [Arxitektura 74-bob](74-monorepo.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Ko'p fitness function | Eroziya to'xtaydi | CI sekinroq, noto'g'ri qoida — to'siq |
| Baseline bilan boshlash | Darhol joriy qilish mumkin | Eski buzilishlar qoladi |
| Qarorni kechiktirish | Ko'proq ma'lumot bilan qaror | Juda kech — qimmat qayta ishlash |
| Har narsani almashtiriladigan qilish | Moslashuvchanlik | Ortiqcha abstraksiya (6-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Qoidalar faqat wiki'da | Hech kim tekshirmaydi | CI'da fitness function |
| "Keyinroq tuzatamiz" — rejasiz | Qarz o'sadi | Qarz ro'yxati, foiz bilan |
| Har narsaga abstraksiya "kelajak uchun" | YAGNI, murakkablik | Faqat qaytarilmaydigan joylarda |
| Bir martalik "katta arxitektura" | Real hayotga mos kelmaydi | Kichik qadamlar, o'lchash |
| Fitness function'lar qizil — e'tiborsiz | Ma'nosini yo'qotadi | Bloklovchi yoki o'chirish |

## Amaliyot

1. Arxitekturangizning 3 ta muhim qoidasini yozing va har biri uchun fitness function tuzing.
2. Deptrac yoki `eslint-plugin-boundaries` ni baseline bilan CI'ga qo'shing.
3. Texnik qarz ro'yxatini "foiz" ustuni bilan tuzing va eng qimmatini tanlang.
4. Oxirgi 5 ta katta qaroringizni "qaytariladigan / qaytarilmaydigan" deb belgilang.

## Manbalar

- Neal Ford, Rebecca Parsons, Patrick Kua — *Building Evolutionary Architectures* (2-nashr)
- Deptrac <https://deptrac.github.io/deptrac/>; dependency-cruiser
- Martin Fowler — *Technical Debt Quadrant*
