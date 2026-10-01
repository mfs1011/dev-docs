# 90 — Amaliy keys: to'liq tizim

[← Oldingi: AI bilan tizim loyihalash](89-ai-bilan-loyihalash.md) · [Mundarija](README.md) · [Keyingi: Checklist →](91-checklist.md)

## Tushuncha

Bu bob — butun kitobning bir loyihada qo'llanishi. Mavzu: **"Bozor" — o'rta hajmli onlayn do'kon** (O'zbekiston, bir nechta sotuvchi, to'lov — mahalliy provayderlar orqali). Maqsad — tayyor kod emas, **qarorlar ketma-ketligi**: har qadamda nima hal qilindi, qaysi variantlar rad etildi va qaysi bobga tayanildi.

Boshlang'ich kontekst:

| Parametr | Qiymat |
| --- | --- |
| Jamoa | 6 dasturchi (3 backend, 2 frontend, 1 full-stack), 1 dizayner, ops — yarim stavka |
| Muddat | MVP — 4 oy |
| Yuklama | Boshida 2 000 buyurtma/kun, aksiya kunlari ×10 |
| Platformalar | Veb (mobil brauzer asosiy), keyinroq mobil ilova |
| Integratsiyalar | 2 ta to'lov provayderi, SMS, yetkazib berish xizmati, 1C (hisobot) |

## Nega shunday

Arxitektura bitta "katta qaror" emas — o'nlab kichik, bir-biriga bog'liq qarorlar. Ularni alohida o'rgandik; real loyihada ular **tartib bilan** va **cheklovlar ichida** qabul qilinadi. Eng muhim saboq: har qaror kontekstdan kelib chiqadi — boshqa jamoa va boshqa yuklamada xuddi shu keys boshqacha yechimlarga olib keladi.

## 1-qadam: sifat atributlari va cheklovlar

```text
Ustuvorlik (2, 3-boblar):
  1. To'g'rilik (pul, qoldiq)        — ikki marta to'lov, manfiy qoldiq — qabul qilinmaydi
  2. O'zgartirish tezligi            — biznes har hafta yangi aksiya so'raydi
  3. Mobil unumdorlik                 — LCP < 2.5s 4G'da (47-bob)
  4. Ishonchlilik                     — checkout SLO 99.9% (79-bob)
  5. Masshtab                         — aksiya kunlari ×10 — muhim, lekin 1–4 dan keyin

Cheklovlar: 6 kishi, 4 oy, ops kuchsiz, jamoa PHP + Vue/React'ni biladi
Rad etilgan: "Netflix kabi masshtab" — kontekstga mos emas
```

## 2-qadam: chegaralar va arxitektura uslubi

```text
Bounded context'lar (4, 14-boblar):
  Catalog      — mahsulot, kategoriya, narx
  Inventory    — qoldiq, rezerv
  Cart         — savat
  Ordering     — buyurtma hayot sikli
  Payments     — to'lov, qaytarish, provayderlar
  Identity     — foydalanuvchi, sotuvchi, rollar
  Fulfillment  — yetkazib berish
  Notifications, Search (texnik)

Qaror: MODULLI MONOLIT (19, 20-boblar)              → ADR-0001
  Rad etildi: mikroservislar — 6 kishiga 9 servis, ops yo'q (21, 81-boblar)
  Rad etildi: oddiy monolit — chegaralarsiz, 1 yilda "katta loy"
  Qayta ko'rish: alohida masshtab yoki alohida jamoa talab qilinganda — avval Search va Notifications
Chegaralar CI'da tekshiriladi: Deptrac (83-bob)
Modul ichida: Ordering, Payments — Domain/Application/Infrastructure (15-bob)
              Catalog CRUD qismi — oddiy vertical slice (16-bob)
```

## 3-qadam: ma'lumot va izchillik

```text
Bitta PostgreSQL, har modul — o'z sxemasi; modullararo JOIN yo'q (23-bob)
Pul: Money(amountMinor, currency) — float yo'q (12, 13-boblar)
ID: UUIDv7 (tartiblanadigan, taxmin qilinmaydi)

Checkout — eng nozik oqim:
  1. Cart → Ordering: PlaceOrder (Idempotency-Key, 70-bob)
  2. Ordering: buyurtma "pending" + outbox: OrderPlaced          (24, 27-boblar)
  3. Inventory OrderPlaced'ga obuna: rezerv (yetmasa → OrderRejected)
  4. Payments: to'lov sessiyasi → provayder sahifasi
  5. Webhook (imzo tekshiruvi, 72-bob) → PaymentSucceeded → Ordering "paid"
  6. 30 daqiqa to'lov yo'q → rezerv bo'shatiladi (34-bob: rejalashtirilgan ish)
Saga — choreografiya bilan, chunki qadamlar kam; murakkablashsa — orkestrator (21, 27-boblar)  → ADR-0004
Navbat: avval DB outbox + worker; broker — hajm oshganda (26-bob, 84-bobdagi matritsa)
```

## 4-qadam: shartnoma va API

```text
Klientlar: veb (SSR + SPA), keyin mobil, admin panel
Uslub: REST + OpenAPI, contract-first (53–55-boblar)               → ADR-0005
  GraphQL rad etildi: bitta jamoa, klientlar kam, kesh muhim (56-bob)
BFF: hozircha yo'q — veb va API bitta jamoada; mobil ilova chiqqanda qayta ko'rish (69-bob)
Xatolar: RFC 9457 Problem Details + code maydoni → UI xaritasi (59-bob)
Ro'yxatlar: cursor pagination, filtrlar shartnomada (66-bob)
Versiyalash: qo'shimcha o'zgarishlar — versiyasiz; buzuvchi — /v2 + Sunset (58-bob); oasdiff CI'da
Auth: sessiya cookie (veb), OAuth 2.1 + PKCE (mobil, keyin) (60, 61-boblar)
Avtorizatsiya: sotuvchi faqat o'z mahsulotlari — har so'rovda (62, 77-boblar: BOLA testlari)
```

## 5-qadam: frontend

```text
Render (37-bob):
  katalog, mahsulot sahifalari — SSR/ISR (SEO, LCP)
  savat, checkout, kabinet — klient tomoni (SPA qismi)
  admin — to'liq SPA
Framework: Nuxt yoki Next.js — jamoa tajribasiga qarab (ikkalasi ham mos)       → ADR-0007
Tuzilma: feature-based (38-bob): features/cart, features/checkout, entities/product, shared/ui
Holat (40-bob): server holati — query kutubxona keshi; URL holati — filtrlar; global — faqat sessiya
Dizayn tizimi: tokenlar + asosiy komponentlar, a11y bilan (43, 46-boblar)
Formalar: checkout — sxema asosida, server xatolari maydonlarga (45-bob)
Optimistik UI: savatga qo'shish; to'lov — hech qachon optimistik emas (51-bob)
Byudjet: asosiy sahifa JS ≤ 180 KB, CI'da size-limit (47-bob)
```

## 6-qadam: qo'shimcha qismlar

```text
Qidiruv: boshida PostgreSQL full-text; katalog > 100k yoki fasetlar → Meilisearch/OpenSearch (29-bob)
Kesh: katalog javoblari — CDN + hodisa asosida invalidatsiya; savat va narx — keshsiz (25, 65-boblar)
Fayllar: rasmlar — obyekt saqlash, presigned yuklash, variantlar fon ishida (32, 63-boblar)
Rate limit: login, SMS kod, promo-kod — qat'iy; API — foydalanuvchi bo'yicha (30-bob)
Audit: narx o'zgarishi, qaytarish, rol o'zgarishi (31-bob)
Integratsiyalar: har provayder — adapter + ACL; 1C — kunlik eksport, real vaqt emas (72-bob)
Real vaqt: buyurtma holati — SSE (64-bob); WebSocket kerak emas
AI (keyinroq): "o'xshash mahsulotlar" — RAG emas, embedding qidiruv; yordamchi chat — faqat o'qish vositalari (85–88-boblar)
```

## 7-qadam: ishga tushirish va ishlatish

```text
Kuzatuvchanlik: OpenTelemetry, JSON loglar, traceId UI xatosigacha (75-bob)
  biznes alertlari: "15 daqiqada 0 buyurtma", "to'lov muvaffaqiyati < 90%"
SLO: checkout 99.9%, katalog p95 < 300ms (79-bob)
Tashqi chaqiruvlar: timeout + retry (faqat idempotent) + circuit breaker; to'lov provayderi 2 ta (79-bob)
Deploy: bitta artefakt, staging → canary 10% → 100%; flag'lar bilan yangi checkout (80-bob)
Migratsiyalar: expand/contract, katta jadvallarda online (71-bob)
Yuk testi: aksiya ssenariysi ×10 — k6, reliz oldidan (78-bob)
Xavfsizlik: STRIDE checkout va to'lov oqimi uchun, sirlar menejeri, bog'liqlik audit (76-bob)
```

## 8-qadam: bir yildan keyin — evolyutsiya

```text
Signal                                         → Qaror
Search yuklamasi katalogni sekinlashtiradi     → Search alohida servis (birinchi ajratish, 22-bob)
Mobil ilova chiqdi, ekranlar boshqacha        → mobil BFF (69-bob)
Ikkinchi jamoa — sotuvchilar kabineti         → modul egaligi, CODEOWNERS (81-bob)
Outbox worker'i ulgurmayapti                  → RabbitMQ (ADR-0004 "o'rnini bosadi")
Eski "aksiya" kodi qo'rqinchli                → characterization testlari + strangler (82-bob)
Har qaror — yangi ADR; eskisi o'chirilmaydi, "superseded" belgilanadi (84-bob)
```

## Framework'larda

Xuddi shu keysning aniq kodda bajarilgan qismlari saytdagi amaliy loyiha boblarida:

| Qism | Qayerda |
| --- | --- |
| Backend API (Symfony) | [Symfony 32-bob](../symfony/32-amaliy-loyiha.md), [39-bob](../symfony/39-arxitektura.md) |
| Backend API (Laravel) | [Laravel 31-bob](../laravel/31-amaliy-loyiha-api.md) |
| Frontend | [Vue 69](../vue/69-amaliy-loyiha.md), [React 49](../react/49-amaliy-loyiha.md), [Angular 78](../angular/78-amaliy-loyiha.md), [Next.js 50-bob](../nextjs/50-amaliy-loyiha.md) |
| To'lov va webhook | [Next.js 35-bob](../nextjs/35-stripe.md) — Stripe misolida, g'oya mahalliy provayderlarga ham mos |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Modulli monolit | Tez boshlash, bitta deploy | Chegaralar intizomi, CI qoidalari shart |
| Choreografiyali saga | Oddiy, kam bog'lanish | Oqimni ko'rish qiyin — trace kerak |
| DB outbox broker o'rniga | Yangi infratuzilma yo'q | Kechikish, keyin ko'chirish |
| SSR + SPA aralash | SEO va interaktivlik | Ikki render rejimi, murakkab kesh |
| BFF'siz boshlash | Kam qatlam | Mobil chiqqanda qayta ishlash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Birinchi kundan mikroservis | Ops va kelishuv yuki | Modulli monolit, keyin ajratish |
| Checkout'ni "baxtli yo'l" bilan loyihalash | Ikki marta to'lov, yo'qolgan buyurtma | Idempotentlik, saga, webhook imzo |
| Qarorlar yozilmaydi | Bir yildan keyin "nega?" | ADR har muhim qarorga |
| Hamma narsani birdan "to'g'ri" qilish | MVP kechikadi | Qaytariladigan qarorlarda tez, qaytarilmaydiganlarda ehtiyot |
| Evolyutsiya signallarisiz | Ajratish juda erta yoki juda kech | Har ADR'da qayta ko'rish sharti |

## Amaliyot

1. O'z loyihangiz uchun shu 8 qadamni yozing — har qadamda kamida bitta rad etilgan variant bilan.
2. Birinchi 5 ta ADR'ni yozing: uslub, ma'lumot, API, frontend render, deploy.
3. Eng nozik oqimingiz (checkout, to'lov, ro'yxatdan o'tish) uchun 3-qadamdagi kabi ketma-ketlik chizing.
4. "Bir yildan keyin" jadvalini to'ldiring: qaysi signal qaysi qarorni qayta ko'rishga majbur qiladi?

## Manbalar

- Sam Newman — *Building Microservices* (2-nashr), *Monolith to Microservices*
- Vaughn Vernon — *Implementing Domain-Driven Design*
- Gregor Hohpe — *The Software Architect Elevator*
