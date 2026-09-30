# 27 — Hodisaga asoslangan arxitektura

[← Oldingi: Navbat va fon ishlari](26-navbat.md) · [Mundarija](README.md) · [Keyingi: CQRS va o'qish modellari →](28-cqrs.md)

## Tushuncha

Hodisa (event) — **o'tgan zamondagi fakt**: `OrderPlaced`, `PaymentFailed`, `StockReserved`. Buyruq (command) esa — iltimos: `PlaceOrder`, `ReserveStock`.

| | Buyruq | Hodisa |
| --- | --- | --- |
| Zamon | Kelasi: "qil" | O'tgan: "bo'ldi" |
| Qabul qiluvchi | Bitta, aniq | Nol yoki ko'p, noma'lum |
| Rad etish | Mumkin | Yo'q — bu fakt |
| Bog'lanish | Yuboruvchi qabul qiluvchini biladi | Yuboruvchi kim eshitishini bilmaydi |

Hodisaga asoslangan arxitektura — tizim qismlari bir-birini **chaqirish** o'rniga **hodisalarga reaksiya** qiladi.

## Nega shunday

5-bobdagi misol: `placeOrder` email, ombor, analitika, bonuslarni bilsa — har yangi reaksiya uni o'zgartiradi. Hodisa bilan `placeOrder` faqat "bo'ldi" deydi — yangi reaksiya yangi tinglovchi.

Evaziga — **eventual consistency**: hodisa yuborildi, lekin reaksiyalar hali bajarilmagan. "Buyurtma berildi, lekin ombor hali band qilmagan" holati bir necha soniya mavjud. Buni biznes qabul qilishi kerak.

## Psevdokod: hodisa turlari

```text
// 1. Bildirishnoma hodisasi — minimal, "nimadir o'zgardi"
OrderPlaced { orderId, occurredAt }
// Tinglovchi kerakli ma'lumotni o'zi so'raydi → bog'lanish past, lekin qo'shimcha so'rov

// 2. Holatni ko'chiruvchi hodisa (event-carried state transfer)
OrderPlaced { orderId, customerId, lines: [{sku, qty, price}], total, occurredAt }
// Tinglovchi so'ramaydi → mustaqil, lekin hodisa shartnomasi katta — versiyalash kerak
```

Hodisa — **shartnoma**. Uni API kabi versiyalang (58-bob): maydon qo'shish — xavfsiz, o'chirish/o'zgartirish — yangi versiya (`OrderPlaced.v2`).

## Psevdokod: transactional outbox

26-bobdagi muammo — DB va broker ikki alohida tizim:

```text
BEGIN
  INSERT INTO orders ...
  INSERT INTO outbox (id, type, payload, created_at) VALUES (uuid, 'OrderPlaced', {...}, now())
COMMIT                                   // ikkalasi birga yoki hech biri

relay (fon jarayoni):
  loop:
    rows = SELECT * FROM outbox WHERE published_at IS NULL ORDER BY created_at LIMIT 100 FOR UPDATE SKIP LOCKED
    for r in rows: broker.publish(r); UPDATE outbox SET published_at = now() WHERE id = r.id
```

Kafolat: DB'ga yozilgan hodisa **albatta** yuboriladi (kamida bir marta). Tinglovchilar — idempotent (70-bob).

## Psevdokod: saga — taqsimlangan jarayon

Bitta tranzaksiya bo'lmaganda (21-bob) — ketma-ket lokal tranzaksiyalar va **kompensatsiya**:

```text
Checkout saga (orkestratsiya):
  1. Ordering:  PlaceOrder           → OrderPlaced
  2. Inventory: ReserveStock         → StockReserved      | StockUnavailable → CancelOrder
  3. Payment:   Charge               → PaymentSucceeded   | PaymentFailed    → ReleaseStock → CancelOrder
  4. Ordering:  ConfirmOrder

Har qadamning teskari amali (kompensatsiya): ReserveStock ↔ ReleaseStock, Charge ↔ Refund
```

| Uslub | Qanday | Qachon |
| --- | --- | --- |
| **Koreografiya** | Har servis hodisaga o'zi reaksiya qiladi | 2–3 qadam, oddiy oqim |
| **Orkestratsiya** | Markaziy saga koordinatori buyruq beradi | 4+ qadam, murakkab shartlar, jarayonni ko'rish kerak |

Koreografiyada jarayon hech qayerda yozilmagan — "buyurtma nega bekor bo'ldi?" savoliga javob topish qiyin. Murakkab oqimlar uchun orkestratsiya aniqroq.

## Psevdokod: event sourcing — qachon

Event sourcing — holatni saqlash o'rniga **barcha hodisalarni** saqlash; joriy holat — hodisalardan hisoblanadi.

```text
account events: Opened(0) → Deposited(500) → Withdrawn(200) → Deposited(100)
balance = fold(events) = 400
```

| Kerak | Kerak emas |
| --- | --- |
| To'liq audit majburiy (moliya, huquqiy) | Oddiy CRUD |
| "O'tgan holatni tiklash", vaqt bo'ylab tahlil | Jamoa bilan tajriba yo'q |
| Murakkab domen, ko'p o'qish modellari | "Zamonaviy" bo'lgani uchun |

Event sourcing — kuchli, lekin **qimmat**: sxema o'zgarishi (hodisalar abadiy), snapshot'lar, proyeksiyalarni qayta qurish. Ko'p hollarda oddiy audit log (31-bob) yetarli.

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Jarayon ichidagi hodisalar | Symfony EventDispatcher — [12-bob](../symfony/12-event-listener.md); Laravel Events — [26-bob](../laravel/26-hodisalar-va-observerlar.md) | Signal/computed reaksiyalari, NgRx Events — [Angular 61-bob](../angular/61-ngrx.md) |
| Asinxron hodisalar | Symfony Messenger — [26-bob](../symfony/26-messenger.md); Laravel queued listeners — [25-bob](../laravel/25-navbatlar.md) | — |
| Doctrine lifecycle | [Symfony 27-bob](../symfony/27-event-va-doctrine-hodisalari.md) — ehtiyot: ORM hodisalari ≠ domen hodisalari | — |
| Serverdan klientga | Mercure — [Symfony 35-bob](../symfony/35-mercure.md) | SSE/WebSocket — [Next.js 37-bob](../nextjs/37-real-vaqt.md) |

Frontend'dagi "hodisa" — ko'pincha komponent chiqishi (`output`, `emit`) yoki store hodisasi. G'oya bir xil: yuboruvchi kim reaksiya qilishini bilmaydi. NgRx Events'da tekshirilgan misol: handler qaytargan hodisa avtomatik dispatch qilinadi — bu frontend darajasidagi "hodisa → reaksiya → yangi hodisa" zanjiri.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| To'g'ridan-to'g'ri chaqiruv | Oqim ko'rinadi, izchil | Kuchli bog'lanish |
| Hodisalar | Past bog'lanish, kengayish oson | Eventual consistency, debug qiyin, oqim tarqalgan |
| Koreografiya | Markaziy nuqta yo'q | Jarayon ko'rinmas |
| Orkestratsiya | Jarayon aniq, boshqariladi | Koordinator — yana bir komponent |
| Event sourcing | To'liq tarix, audit | Katta murakkablik |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hodisani buyruq sifatida (`SendEmail` hodisa) | Bog'lanish yashirin | Hodisa — fakt, buyruq — alohida |
| Commit'dan keyin publish (outbox'siz) | Hodisa yo'qoladi | Outbox |
| Tinglovchi idempotent emas | Takrorlarda ikki marta ta'sir | Xabar ID tekshiruvi |
| Hodisa shartnomasini versiyasiz o'zgartirish | Iste'molchilar buziladi | Qo'shish — xavfsiz, o'zgartirish — yangi versiya |
| Hamma narsa hodisa | Oqimni hech kim tushunmaydi | Mustaqil reaksiyalar uchun |
| Correlation ID yo'q | Zanjirni kuzatib bo'lmaydi | Har hodisada `correlationId`, `causationId` (75-bob) |

## Amaliyot

1. Bitta funksiyadagi 3+ yon ta'sirni hodisa + tinglovchilarga ajrating.
2. Outbox jadvali va relay'ni yozing; jarayonni commit'dan keyin o'ldirib, hodisa yo'qolmasligini tekshiring.
3. Checkout jarayoni uchun saga qadamlari va kompensatsiyalarini chizing.
4. Hodisalaringizda `correlationId` bormi? Bitta buyurtmaning barcha hodisalarini logda topa olasizmi?

## Manbalar

- Martin Fowler — *What do you mean by "Event-Driven"?* <https://martinfowler.com/articles/201701-event-driven.html>
- Chris Richardson — *Saga pattern* <https://microservices.io/patterns/data/saga.html>
- Greg Young — *CQRS and Event Sourcing* (maqolalar va nutqlar)
