# 13 — Slice guruhlari

[← Oldingi: app](12-app.md) · [Mundarija](README.md) · [Keyingi: Public API chuqur →](14-public-api-chuqur.md)

## Qisqacha

Slice guruhi — bir qatlamdagi **bog'liq slice'larni bitta papkaga yig'ish**: `entities/payment/invoice`, `entities/payment/receipt`. Bu faqat **navigatsiya** uchun: bog'liqlik qoidalari o'zgarmaydi, guruh papkasi slice emas. Majburiy emas — slice'lar ko'payib, tekis ro'yxatni ko'zdan kechirish qiyinlashganda kiritiladi.

## Qoida

- Guruh **slice emas**: unda `model`, `ui`, `api` kabi segmentlar ham, `index.ts` public API ham yo'q.
- Guruh ichidagi slice'lar ham **mustaqil**: `entities/payment/invoice` → `entities/payment/receipt` — baribir cross-import.
- Guruh papkasiga **umumiy kod qo'yilmaydi** (`entities/payment/shared-utils.ts` ❌). Bir nechta slice'ga kerak kod — pastki qatlamga.
- `entities` va `pages`'da tabiiy; `features`'da ehtiyot bo'ling (pastda).

## Shablon

```text
entities/                              pages/
├── payment/          ← guruh          ├── order/              ← guruh
│   ├── invoice/      ← slice          │   ├── list/           ← slice
│   │   ├── model/                     │   │   ├── ui/
│   │   ├── ui/                        │   │   └── index.ts
│   │   └── index.ts                   │   ├── detail/
│   ├── receipt/                       │   ├── create/
│   └── transaction/                   │   └── edit/
├── user/             ← oddiy slice    ├── customer/
└── product/                           │   ├── list/
                                       │   └── detail/
❌ entities/payment/index.ts            └── settings/          ← oddiy slice
❌ entities/payment/model/
❌ entities/payment/format-amount.ts    import { InvoiceRow } from '@/entities/payment/invoice'  ✅
```

## Kod: importlar va alias

Guruh import yo'lining bir qismi bo'lib qoladi — boshqa hech narsa o'zgarmaydi:

::: react
```tsx
// pages/order/detail/ui/OrderDetailPage.tsx
import { InvoiceRow } from '@/entities/payment/invoice'
import { ReceiptLink } from '@/entities/payment/receipt'
import { UserAvatar } from '@/entities/user'

// app/routes/router.tsx
{ path: '/orders', lazy: async () => ({ Component: (await import('@/pages/order/list')).OrderListPage }) },
{ path: '/orders/:id', lazy: async () => ({ Component: (await import('@/pages/order/detail')).OrderDetailPage }) },
```
:::

::: vue
```ts
// pages/order/detail/ui/OrderDetailPage.vue (<script setup>)
import { InvoiceRow } from '@/entities/payment/invoice'
import { ReceiptLink } from '@/entities/payment/receipt'
import { UserAvatar } from '@/entities/user'

// app/routes/router.ts
{ path: '/orders', component: () => import('@/pages/order/list').then((m) => m.OrderListPage) },
{ path: '/orders/:id', component: () => import('@/pages/order/detail').then((m) => m.OrderDetailPage) },
```
:::

::: angular
```ts
// pages/order/detail/ui/order-detail-page.ts
import { InvoiceRow } from '@/entities/payment/invoice'
import { ReceiptLink } from '@/entities/payment/receipt'
import { UserAvatar } from '@/entities/user'

// app/routes/app.routes.ts
{ path: 'orders', loadComponent: () => import('@/pages/order/list').then((m) => m.OrderListPage) },
{ path: 'orders/:id', loadComponent: () => import('@/pages/order/detail').then((m) => m.OrderDetailPage) },
```
:::

Linter sozlamasida (Steiger, ESLint) guruh chuqurligini hisobga olish kerak — 33, 34-boblar.

## Qachon / qachon emas

| Guruh kiriting | Hali kerak emas |
| --- | --- |
| Bir biznes kontekstidagi slice'lar qatlam bo'ylab sochilgan | Nomlarning o'zi navigatsiya uchun yetarli |
| Slice nomlari bir mavzuni aniq ko'rsatadi (`invoice`, `receipt`, `transaction`) | Tabiiy guruhlash mezoni yo'q |
| Qatlamda slice'lar shunchalik ko'pki, bir qarashda ko'rib bo'lmaydi | Guruhga 2–3 slice tushadi xolos |
| Bir mavzuda ro'yxat, tafsilot, yaratish, tahrirlash sahifalari | |

**`features`'da ehtiyot.** Feature ko'pincha bir nechta entity'ni qamraydi — tabiiy mezon topish qiyin. `features/cart/` guruhi ochilsa, `add-to-cart`, `remove-from-cart` bilan birga savat DTO'lari va mapper'lari ham yig'ila boshlaydi — guruh navigatsiya emas, butun savat domenining "uyi"ga aylanadi. Avval slice'lar yetarlicha ko'pligini va guruhda faqat feature'lar ekanini tekshiring.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Guruhga `index.ts` qo'shish | Guruh soxta slice'ga aylanadi | Har slice'ning o'z `index.ts`'i |
| Guruh papkasida umumiy kod | Yashirin bog'lanish, qoidalar chetlab o'tiladi | Pastki qatlamga ko'chirish |
| Guruh ichida slice'lar erkin import qiladi | "Bir papkada-ku" — lekin cross-import | Qoidalar o'zgarmaydi; `@x` faqat entities'da |
| Hamma narsani guruhlash (`entities/core/user`) | Ma'nosiz daraja | Guruhsiz ham tushunarli slice'lar tekis qoladi |
| `features/cart/` — domen papkasi | Use-case bo'linishi buziladi | Holat — `entities/cart`, harakatlar — tekis feature'lar |

## Manbalar

- Rasmiy: *Slice groups* <https://feature-sliced.design/docs/reference/slice-groups>
- Rasmiy: *Slices and segments — Slice groups* <https://feature-sliced.design/docs/reference/slices-segments>
