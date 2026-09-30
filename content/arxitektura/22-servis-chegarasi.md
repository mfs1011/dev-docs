# 22 — Servis chegarasini topish

[← Oldingi: Mikroservislar: narx va foyda](21-mikroservislar.md) · [Mundarija](README.md) · [Keyingi: Ma'lumotlar bazasi dizayni →](23-malumotlar-bazasi.md)

## Tushuncha

Servisga ajratish qaror bo'lsa (21-bob), eng qimmat savol — **chiziq qayerdan o'tadi**. Noto'g'ri chegara modulda arzon tuzatiladi (4-bob), servisda esa — tarmoq shartnomalari, ma'lumot ko'chirish, jamoalararo kelishuv bilan.

Chegara topishning to'rt o'lchovi:

| O'lchov | Savol |
| --- | --- |
| **Domen** | Qaysi bounded context (14-bob)? Til qayerda o'zgaradi? |
| **Ma'lumot egaligi** | Qaysi ma'lumotni kim yaratadi va o'zgartiradi? |
| **O'zgarish chastotasi** | Qaysi qismlar birga, qaysilari mustaqil o'zgaradi? |
| **Jamoa** | Kim ega bo'ladi? (Conway qonuni, 81-bob) |

## Nega shunday

Eng keng tarqalgan xato — **entity bo'yicha** bo'lish: `UserService`, `ProductService`, `OrderService` — har biri bitta jadval ustida CRUD. Natijada har biznes amali bir nechta servisni sinxron chaqiradi:

```text
"Buyurtma berish" = OrderService → UserService (manzil) → ProductService (narx)
                                  → InventoryService (qoldiq) → PricingService (chegirma)
5 ta tarmoq chaqiruvi, 5 ta xato nuqtasi, bitta biznes amali
```

To'g'ri chegara — **biznes imkoniyati** (business capability) bo'yicha: servis bitta biznes vazifasini **o'zi, oxirigacha** bajara oladi.

## Psevdokod: ma'lumot egaligi testi

```text
Har ma'lumot uchun:
  Kim YARATADI?        Kim O'ZGARTIRADI?      Kim O'QIYDI?
  price:    Catalog         Catalog              Ordering, Search
  stock:    Warehouse       Warehouse, Ordering? ← ikki yozuvchi = chegara noto'g'ri yoki mas'uliyat noaniq
  address:  Customer        Customer             Ordering, Shipping

Qoida: har ma'lumotning bitta egasi (yozuvchisi). Boshqalar — o'qiydi (API/hodisa/nusxa).
```

"Ordering stock'ni o'zgartiradi" — noto'g'ri: Ordering `ReserveStock` **so'raydi**, Warehouse o'zgartiradi (yoki rad etadi).

## Psevdokod: o'qish uchun ma'lumot nusxasi

Ordering har buyurtmada Catalog'dan narx so'rasa — Catalog yiqilganda buyurtma ham to'xtaydi. Muqobil — **hodisa orqali lokal nusxa**:

```text
Catalog publishes: ProductPriceChanged { sku, price, validFrom }

Ordering listens:
    on ProductPriceChanged(e): localPrices.upsert(e.sku, e.price)

placeOrder(cmd):
    price = localPrices.get(sku)          // tarmoqsiz, Catalog yiqilgan bo'lsa ham
```

Narx — ma'lumot bir necha soniya eskirishi mumkin (eventual consistency). Buyurtma paytida qat'iy narx kerak bo'lsa — narx buyurtmaga **nusxalanadi** (buyurtma paytidagi narx — tarixiy fakt, keyin o'zgarmaydi).

## Psevdokod: chegarani sinash

```text
Yaxshi chegara belgilari:
  ✅ Ko'p feature'lar bitta servisda boshlanib, tugaydi
  ✅ Servis boshqasi yiqilganda ham asosiy vazifasini bajaradi (degradatsiya bilan)
  ✅ Servislararo chaqiruvlar kam va "qalin" (bitta chaqiruv — ko'p ish)
  ✅ Ikki servis kamdan-kam bir PR'da o'zgaradi

Yomon chegara belgilari:
  ❌ Har feature 3+ servisni birga o'zgartiradi
  ❌ Servislar "suhbatdosh" (chatty) — bir sahifaga 20 ta ichki chaqiruv
  ❌ Ikki servis bir jadvalga yozadi
  ❌ Servislar birga deploy qilinishi shart
```

Git tarixi — eng yaxshi dalil (5-bobdagi change coupling): qaysi modullar birga o'zgaradi, ular bir servisda bo'lishi kerak.

## Psevdokod: ajratish tartibi

```text
1. Modulli monolitda chegarani toza qiling (JOIN yo'q, faqat API/hodisa) — 20-bob
2. Modul jadvallarini alohida sxemaga ko'chiring (hali bir DB)
3. Modulni alohida jarayonga chiqaring — API o'sha, faqat tarmoq orqali
4. Ma'lumotni alohida DB'ga ko'chiring (expand/contract — 71-bob)
5. Eski yo'lni o'chiring
Har qadam — alohida reliz, orqaga qaytarsa bo'ladi (strangler fig, 82-bob)
```

## Framework'larda

| Bosqich | Backend vositasi | Frontend ta'siri |
| --- | --- | --- |
| Modul chegarasi | Deptrac, alohida namespace — [Symfony 39-bob](../symfony/39-arxitektura.md) | — |
| Hodisa orqali nusxa | Messenger/Queue + outbox — [Symfony 27-bob](../symfony/27-event-va-doctrine-hodisalari.md) | — |
| Servis ajratildi | Yangi API | Frontend URL'lari o'zgarmasin — gateway orqali (69-bob) |
| Frontend bo'limlari | — | Backend chegarasiga mos feature papkalar ([Angular 78-bob](../angular/78-amaliy-loyiha.md)) — lekin mikro-frontend shart emas (50-bob) |

Frontend uchun muhim: backend servislarga bo'linishi frontend'ni **majburan** bo'lishni talab qilmaydi. Bitta frontend + BFF ko'p servis bilan to'liq ishlaydi.

## Trade-off

| Chegara asosi | Yutuq | Xavf |
| --- | --- | --- |
| Entity (jadval) | Tushunarli, oddiy | Suhbatdosh servislar, har amal ko'p servisda |
| Biznes imkoniyati | Mustaqil amallar | Domenni chuqur tushunish kerak |
| Jamoa tuzilmasi | Mustaqil jamoalar | Jamoa o'zgarsa — chegara noto'g'ri qoladi |
| Texnik qatlam ("auth servis", "notification servis") | Qayta ishlatish | Ba'zan to'g'ri (umumiy infratuzilma), ko'pincha — markaziy bog'lanish |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Entity bo'yicha servislar | Suhbatdosh, sinxron zanjirlar | Biznes imkoniyati |
| Ma'lumotning ikki egasi | Nomuvofiqlik, kim haq? | Bitta yozuvchi |
| Har o'qishda boshqa servisni chaqirish | Mustaqillik yo'q | Hodisa orqali lokal nusxa |
| Monolitdan bir kunda ajratish | Katta xavf | Bosqichma-bosqich |
| Frontend'ni ham servislarga bo'lish "chunki backend bo'lindi" | Ortiqcha murakkablik | Bitta frontend + BFF |

## Amaliyot

1. Tizimingizdagi 10 ta asosiy ma'lumot uchun "yaratadi / o'zgartiradi / o'qiydi" jadvalini to'ldiring.
2. Ikki yozuvchiga ega ma'lumotni toping va egani aniqlang.
3. Eng ko'p birga o'zgaradigan modul juftligini git tarixidan toping.
4. Bitta sinxron o'qishni hodisa asosidagi lokal nusxaga almashtirish rejasini yozing.

## Manbalar

- Sam Newman — *Monolith to Microservices*, 2–3-boblar
- Vlad Khononov — *Balancing Coupling in Software Design*
- Martin Fowler — *How to break a Monolith into Microservices* (Zhamak Dehghani) <https://martinfowler.com/articles/break-monolith-into-microservices.html>
