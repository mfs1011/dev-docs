# 16 — Vertical slice va feature-based

[← Oldingi: Qatlamli, olti burchakli, Clean](15-qatlamli-arxitektura.md) · [Mundarija](README.md) · [Keyingi: Xatolar modeli →](17-xatolar-modeli.md)

## Tushuncha

Kodni ikki o'q bo'yicha tashkil qilish mumkin:

```text
Gorizontal (texnik qatlam bo'yicha)        Vertikal (feature bo'yicha)
src/                                       src/
├── controllers/                           ├── orders/
│   ├── OrderController                    │   ├── place-order/    (controller, handler, dto, test)
│   ├── ProductController                  │   ├── cancel-order/
│   └── UserController                     │   └── list-orders/
├── services/                              ├── catalog/
│   ├── OrderService                       │   ├── search-products/
│   └── ProductService                     │   └── product-details/
├── repositories/                          └── users/
└── dto/
```

**Vertical slice** (Jimmy Bogard) — har use case (so'rov yoki buyruq) o'zining barcha qatlamlari bilan **bitta joyda**. Qatlamlar hali ham bor — lekin slice **ichida**.

## Nega shunday

Gorizontal tuzilmada bitta feature 4–6 papkaga tarqaladi: "Buyurtmani bekor qilish" ni o'zgartirish uchun `controllers/`, `services/`, `repositories/`, `dto/`, `tests/` ni aylanish kerak. Va `OrderService` 40 metodli klassga o'sadi — har feature unga biror narsa qo'shadi.

Vertikal tuzilmada:

- O'zgarish **bir papkada** (4-bobdagi "birga o'zgaradigan narsa birga turadi").
- Feature'lar bir-biridan mustaqil — biri uchun CQRS, boshqasi uchun oddiy SQL — mumkin.
- Yangi dasturchi bitta feature'ni to'liq ko'radi.
- O'chirish oson — papkani o'chiring.

## Psevdokod: bitta slice

```text
orders/cancel-order/
├── CancelOrderEndpoint      POST /orders/{id}/cancel
├── CancelOrderCommand       { orderId, reason }
├── CancelOrderHandler       yuklash → order.cancel(reason) → saqlash → hodisa
├── CancelOrderValidator
└── CancelOrderTest          endpoint'dan oxirigacha

orders/list-orders/
├── ListOrdersEndpoint       GET /orders?status=&page=
├── ListOrdersQuery
└── ListOrdersHandler        to'g'ridan-to'g'ri SQL — domen modeli shart emas (o'qish)
```

E'tibor bering: `list-orders` domen modelini **chetlab o'tadi** — o'qish uchun optimallashtirilgan so'rov. Bu vertical slice'ning kuchi: har slice o'z ehtiyojiga mos texnikani tanlaydi (28-bob, CQRS).

## Psevdokod: umumiy kod qayerda

Slice'lar orasida takrorlanish paydo bo'ladi. Qoida:

```text
1. Domen qoidalari (invariantlar)      → orders/domain/        (Order.cancel — hamma slice ishlatadi)
2. Infratuzilma (DB, mailer, auth)     → shared/infrastructure/
3. Slice'lar orasidagi o'xshash kod    → avval takrorlang; 3-marta paydo bo'lsa — ajrating
4. Slice boshqa slice'ni import qilmaydi
```

Domen modeli (13-bob) va vertical slice qarama-qarshi emas: domen — **qoidalar**, slice — **ssenariy**.

## Framework'larda

**Frontend'da feature-based tuzilma — deyarli standart:**

| Framework | Ko'rinishi | Qayerda |
| --- | --- | --- |
| Angular | `features/orders/` — lazy `*.routes.ts` bilan; har bo'lim o'z komponentlari, store'i, API xizmati | [Angular 42–43-boblar](../angular/43-lazy-loading.md), [78-bob](../angular/78-amaliy-loyiha.md) (papka tuzilishi) |
| React | Feature papkalari + ochiq `index.ts` | [React 34-bob](../react/34-arxitektura.md) |
| Vue / Nuxt | `features/` papkalari, import yo'nalishi bir tomonlama, composable'lar feature ichida | [Vue 6-bob](../vue/06-loyiha-tuzilmasi-va-vite.md) |
| Next.js | App Router — papka = marshrut; route groups bilan bo'lim | [Next.js 12-bob](../nextjs/12-route-groups-parallel.md) |

**Feature-Sliced Design** — frontend uchun eng tizimli variant: qatlamlar (`app`, `pages`, `widgets`, `features`, `entities`, `shared`) **va** har qatlamda slice'lar, qat'iy import qoidalari bilan. Alohida FSD qo'llanmasida batafsil.

**Backend'da:**
- Symfony — `src/Orders/CancelOrder/` kabi papkalar, Messenger command/handler juftligi tabiiy slice ([Symfony 26-bob](../symfony/26-messenger.md)).
- Laravel — sukut tuzilma gorizontal (`app/Http/Controllers`, `app/Models`); feature papkalari o'zingiz tashkil qiladi — Laravel buni cheklamaydi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Gorizontal (qatlam bo'yicha) | Framework sukutiga mos, kichik loyihada oddiy | Feature tarqaladi, "God service" |
| Vertical slice | Lokal o'zgarish, mustaqil feature'lar | Takrorlanish; qaysi kod "umumiy" — doimiy qaror |
| Feature + qatlamlar (FSD, modulli monolit) | Ikkalasining foydasi | Qoidalarni o'rganish va majburlash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `services/OrderService` 40 metod | Hamma feature bir faylni o'zgartiradi | Use case bo'yicha klasslar |
| Slice slice'ni import qiladi | Yashirin bog'lanish | Umumiy qism domen yoki shared'ga |
| Takrorlanishdan qo'rqib hammasini `shared/` ga | Yangi bog'lanish markazi | Uch marta qoidasi |
| Domen qoidalarini har slice'da qayta yozish | Invariant nomuvofiqligi | Qoidalar domen modelida |
| Framework sukutini "qonun" deb bilish | Loyiha o'sganda og'riq | Tuzilma — sizning qaroringiz |

## Amaliyot

1. So'nggi 5 feature'ingiz nechta papkaga tegdi? O'rtacha sonni hisoblang.
2. Eng katta `*Service` klassini use case klasslariga bo'lish rejasini tuzing.
3. Bitta yangi feature'ni vertical slice sifatida yozing (endpoint → handler → test bir papkada).
4. Frontend'da `components/`, `services/` kabi texnik papkalarni feature papkalariga ko'chirish rejasini chizing.

## Manbalar

- Jimmy Bogard — *Vertical Slice Architecture* <https://www.jimmybogard.com/vertical-slice-architecture/>
- Feature-Sliced Design: <https://feature-sliced.design>
- Oliver Drotbohm — *Spring Modulith* (modulli monolit, feature bo'yicha)
