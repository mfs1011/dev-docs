# 18 — Ortiqcha entity'lar

[← Oldingi: Desegmentatsiya va nomlash](17-desegmentatsiya.md) · [Mundarija](README.md) · [Keyingi: Qaror daraxti: kod qayerga? →](19-qaror-daraxti.md)

## Qisqacha

`entities` — pastki va **keng ochiq** qatlam: `shared`'dan tashqari hamma uni import qila oladi. Shuning uchun undagi o'zgarish keng ta'sir qiladi. Keraksiz entity'lar noaniqlik ("bu kod shu yerdami?"), bog'lanish va doimiy "qayerdan import qilay?" muammolarini tug'diradi. Rasmiy hujjatning beshta qoidasi va bitta "nolinchi" maslahati bor.

## Qoida

| # | Qoida | Ma'no |
| --- | --- | --- |
| 0 | **`entities`'siz loyiha — normal** | Bu FSD'ni buzmaydi, aksincha soddalashtiradi va qatlamni kelajakdagi o'sish uchun bo'sh qoldiradi |
| 1 | **Oldindan bo'lmang** | Avval kodni sahifa (widget, feature) `model`'iga qo'ying; biznes talablari barqaror bo'lgach — ko'chiring. Qanchalik kech ko'chirsangiz, refaktoring xavfi shunchalik kam |
| 2 | **Keraksiz entity yaratmang** | Har biznes mantiqi uchun entity shart emas. Tiplar — `shared/api`'dan, mantiq — joriy slice `model`'ida |
| 3 | **CRUD — entity'da emas** | Oddiy CRUD so'rovlari — `shared/api/endpoints`. Murakkab (atomar yangilash, qaytarish) — ehtiyotkorlik bilan entity'da |
| 4 | **Auth ma'lumoti — `shared`'da** | Token va backend qaytargan foydalanuvchi DTO — `shared/auth` yoki `shared/api`, `entities/user` emas |
| 5 | **Cross-importni kamaytiring** | Entity'larni izolyatsiyalangan biznes kontekstlari sifatida loyihalang — `@x` kerak bo'lmasin |

**Yupqa va qalin klient.** Yupqa klient mantiqni backend'ga qoldiradi — frontend faqat ma'lumot almashadi: `entities` deyarli kerak emas. Qalin klient klientda jiddiy biznes mantiqini bajaradi — `entities` uchun yaxshi nomzod. Bir ilovaning turli qismlari turlicha bo'lishi mumkin.

## Shablon

```text
Qoida 2–3: mantiq entity'da, ma'lumot va CRUD shared'da
entities/
└── order/
    ├── model/apply-discount.ts      shared/api'dagi OrderDto bilan ishlaydigan biznes mantiqi
    └── index.ts
shared/
└── api/
    ├── client.ts
    ├── endpoints/
    │   ├── order.ts                 getOrders, getOrder, createOrder, updateOrder — CRUD
    │   ├── product.ts
    │   └── cart.ts
    └── index.ts

Qoida 4: auth
shared/
├── auth/
│   ├── use-auth.ts                  joriy foydalanuvchi va token
│   └── index.ts
└── api/client.ts                    tokenni sarlavhaga qo'shadi

Qoida 5: izolyatsiyalangan kontekst
❌ entities/order + entities/order-item + entities/order-customer-info  (har birida @x)
✅ entities/order-info/model/order-info.ts                              (bir kontekst — bir slice)
```

## Kod: entity'siz boshlash, keyin ko'chirish

::: react
```ts
// 1-bosqich: pages/orders/model/discount.ts — faqat shu sahifa ishlatadi
import type { OrderDto } from '@/shared/api'

export function applyDiscount(order: OrderDto, percent: number): number {
  return Math.round(order.totalMinor * (1 - percent / 100))
}

// 2-bosqich: checkout sahifasi ham shu qoidani so'radi → entities/order/model/apply-discount.ts
// entities/order/index.ts
export { applyDiscount } from './model/apply-discount'
```
:::

::: vue
```ts
// 1-bosqich: pages/orders/model/discount.ts — faqat shu sahifa ishlatadi
import type { OrderDto } from '@/shared/api'

export function applyDiscount(order: OrderDto, percent: number): number {
  return Math.round(order.totalMinor * (1 - percent / 100))
}

// 2-bosqich: checkout sahifasi ham shu qoidani so'radi → entities/order/model/apply-discount.ts
// entities/order/index.ts
export { applyDiscount } from './model/apply-discount'
```
:::

::: angular
```ts
// 1-bosqich: pages/orders/model/discount.ts — faqat shu sahifa ishlatadi
import type { OrderDto } from '@/shared/api'

export function applyDiscount(order: OrderDto, percent: number): number {
  return Math.round(order.totalMinor * (1 - percent / 100))
}

// 2-bosqich: checkout sahifasi ham shu qoidani so'radi → entities/order/model/apply-discount.ts
// entities/order/index.ts
export { applyDiscount } from './model/apply-discount'
```
:::

Biznes mantiqi — sof TypeScript funksiya: framework'ga bog'liq emas. Bu yaxshi belgi — entity'dagi mantiq oson test qilinadi (35-bob).

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Admin panel: jadval, forma, filtr — mantiq backend'da | Entity'siz: `pages` + `shared/api` |
| Savatda klientda narx, chegirma, cheklovlar hisoblanadi | `entities/cart` — qalin klient |
| `User` tipi 5 sahifada | Tip — `shared/api`; entity faqat umumiy UI yoki mantiq bo'lsa |
| Joriy foydalanuvchi vs boshqa foydalanuvchilar profili | Joriy — `shared/auth`; ommaviy profil ko'rinishi — kerak bo'lsa `entities/user` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Birinchi kunda 15 entity | Bo'sh yoki bir martalik slice'lar | Kechiktirilgan dekompozitsiya |
| Entity — faqat CRUD o'rami | Shovqin, mazmunli kod ko'rinmaydi | CRUD `shared/api`'da |
| `entities/user` auth uchun | `shared` → `entities` import yoki `@x` paydo bo'ladi | `shared/auth` |
| Mayda entity'lar + ko'p `@x` | Sikllar, birga refaktoring | Bitta kontekst slice'i |
| Backend modeli = entity | Backend o'zgarishi butun UI'ga tarqaladi | DTO `shared/api`'da, mapper bilan |

## Manbalar

- Rasmiy: *Excessive Entities* <https://feature-sliced.design/docs/guides/issues/excessive-entities>
- Rasmiy: *Handling API Requests* <https://feature-sliced.design/docs/guides/examples/api-requests>
