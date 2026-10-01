# 14 — Public API chuqur

[← Oldingi: Slice guruhlari](13-slice-guruhlari.md) · [Mundarija](README.md) · [Keyingi: Cross-import va @x →](15-cross-import.md)

## Qisqacha

Public API — slice va uni ishlatadigan kod o'rtasidagi **shartnoma** va **darvoza**. Amalda u `index.ts` — qayta eksportlar fayli (barrel). Barrel'lar qulay, lekin to'rtta ma'lum muammosi bor: siklik importlar, `shared`'da tree-shaking buzilishi, chetlab o'tishdan haqiqiy himoya yo'qligi va katta loyihada bundler sekinlashuvi. Bu bob — har biriga aniq yechim.

## Qoida

```text
✅ Aniq nomlangan eksportlar                    ❌ Hamma narsani ochish
// features/comments/index.ts                   // features/comments/index.ts
export { CommentList } from './ui/CommentList'  export * from './ui/Comment'
export { useComments } from './model/comments'  export * from './model/comments'
export type { Comment } from './model/types'

Nega: export * bilan slice interfeysi ko'rinmaydi, ichki narsa tasodifan tashqariga chiqadi,
      kimdir unga bog'lanadi — va endi refaktoring qilib bo'lmaydi.
```

### 1. Siklik importlar

```text
pages/home/index.ts         → export { HomePage } from './ui/HomePage'
                              export { loadUserStatistics } from './api/load-user-statistics'
pages/home/ui/HomePage.tsx  → import { loadUserStatistics } from '../'      ← index'dan!
                              index → HomePage → index → … SIKL

Qoida:
  bir slice ICHIDA      → har doim NISBIY va TO'LIQ yo'l:  '../api/load-user-statistics'
  slice'lar ORASIDA     → har doim ABSOLYUT (alias):        '@/pages/home'
```

### 2. `shared/ui` va `shared/lib`'da tree-shaking

`shared/ui` — bir-biriga bog'liq bo'lmagan komponentlar to'plami. Bitta `shared/ui/index.ts` bo'lsa, tugma import qilgan sahifaga syntax highlighter yoki drag'n'drop kutubxonasi ham tushib qolishi mumkin.

```text
shared/ui/
├── button/index.ts          import { Button } from '@/shared/ui/button'
├── text-field/index.ts      import { TextField } from '@/shared/ui/text-field'
├── code-editor/index.ts     ← og'ir bog'liqlik faqat kerak joyga tushadi
└── (index.ts YO'Q)
```

### 3. Chetlab o'tishdan himoya yo'q

`index.ts` hech narsani taqiqlamaydi — IDE auto-import ko'pincha `@/entities/product/model/product` kabi chuqur yo'lni tanlaydi. Yechim — linter: Steiger (33-bob) yoki ESLint import cheklovlari (34-bob).

### 4. Katta loyihada sekinlik

Ko'p barrel fayl dev serverni sekinlashtiradi. Choralar:
1. `shared/ui` va `shared/lib` — har komponent/kutubxonaga alohida index (yuqorida).
2. Slice'li qatlamlarda **segment index'lari yo'q**: `features/comments/index.ts` bor bo'lsa, `features/comments/ui/index.ts` keraksiz.
3. Juda katta loyiha — monorepo, har paket alohida FSD ildizi (32-bob).

## Shablon: muhitga xos public API

Bitta slice'da ham klient, ham server kodi bo'lsa (Next.js App Router), server-only modul `index.ts` orqali klient grafiga tushib qolishi mumkin. Muammo **haqiqatan paydo bo'lganda** — muhitga mos qo'shimcha fayl:

```text
entities/product/
├── index.ts            klient + server uchun xavfsiz: ProductCard, formatPrice, type Product
├── index.server.ts     faqat server: getProductFromDb() ('server-only' bilan belgilangan)
├── ui/ model/ api/
```

Rasmiy tavsiya: public API odatda `index.ts`, uni erkin moslashtirish tavsiya etilmaydi — bu istisno faqat real muammo uchun (28-bob).

## Kod: yaxshi public API

::: react
```ts
// entities/order/index.ts
export { OrderStatusBadge } from './ui/OrderStatusBadge'
export { OrderRow } from './ui/OrderRow'
export { canBeCancelled, statusLabel } from './model/order-status'
export type { Order, OrderStatus } from './model/order'
// ichki: mapOrderDto, OrderRowSkeleton, STATUS_COLORS — eksport qilinmaydi
```
:::

::: vue
```ts
// entities/order/index.ts
export { default as OrderStatusBadge } from './ui/OrderStatusBadge.vue'
export { default as OrderRow } from './ui/OrderRow.vue'
export { canBeCancelled, statusLabel } from './model/order-status'
export type { Order, OrderStatus } from './model/order'
// ichki: mapOrderDto, OrderRowSkeleton.vue, STATUS_COLORS — eksport qilinmaydi
```
:::

::: angular
```ts
// entities/order/index.ts
export { OrderStatusBadge } from './ui/order-status-badge'
export { OrderRow } from './ui/order-row'
export { canBeCancelled, statusLabel } from './model/order-status'
export type { Order, OrderStatus } from './model/order'
// ichki: mapOrderDto, OrderRowSkeleton, STATUS_COLORS — eksport qilinmaydi
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Slice'ning hamma komponentini eksport qilaymi? | Yo'q — faqat tashqarida kerak bo'lganlarini |
| Public API o'zgardi — bu buzuvchi o'zgarishmi? | Ha, agar xatti-harakat kutilganidan farq qilsa — bu ataylab ko'rinishi kerak |
| `shared/api/index.ts` bitta bo'lsa-chi? | Odatda muammo emas — so'rovlar bir-biriga yaqin; og'ir generatsiya bo'lsa — bo'lish |
| Har segmentga index? | Slice'li qatlamlarda — yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `export *` | Interfeys noaniq, ichki narsalar ochiq | Aniq eksportlar |
| Slice ichida `from '../'` yoki `from '@/features/x'` | Sikl | Nisbiy to'liq yo'l |
| Yagona `shared/ui/index.ts` | Og'ir kutubxonalar hamma joyga | Komponent bo'yicha index |
| `ui/index.ts`, `model/index.ts`, `api/index.ts` + slice index | Barrel'lar ko'payadi, sekinlik | Faqat slice index |
| Server-only kod klient index'ida | Bundle'ga server kodi yoki build xatosi | `index.server.ts` (Next.js) |

## Manbalar

- Rasmiy: *Public API* <https://feature-sliced.design/docs/reference/public-api>
- TkDodo — *Please Stop Using Barrel Files* <https://tkdodo.eu/blog/please-stop-using-barrel-files>
