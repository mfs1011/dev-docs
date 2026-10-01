# 37 — Amaliy loyiha: do'kon frontendi

[← Oldingi: Migratsiya](36-migratsiya.md) · [Mundarija](README.md) · [Keyingi: Code review checklist →](38-review-checklist.md)

## Qisqacha

Bu bob — butun qo'llanmani bitta loyihada qo'llash: **"Bozor"** onlayn do'konining frontendi (Arxitektura qo'llanmasining 90-bobidagi keys bilan bir xil mahsulot). Maqsad — tayyor kod emas, **qarorlar ketma-ketligi**: v2.1 tamoyiliga ko'ra sahifalardan boshlaymiz va qatlamlarni faqat haqiqiy qayta ishlatish paydo bo'lganda qo'shamiz. Har bosqichda Steiger nima deyishi — 27–31-bob shablonlarida olingan haqiqiy xabarlar.

## Qoida: bosqichlar

| Bosqich | Talab | Qatlamlar |
| --- | --- | --- |
| 1 | Katalog, mahsulot, savat, checkout, kirish | `app`, `pages`, `shared` |
| 2 | Mahsulot kartasi katalog va qidiruvda | + `entities/product` |
| 3 | "Savatga" tugmasi 3 sahifada | + `features/add-to-cart` |
| 4 | Header hamma sahifada: qidiruv, savat soni, foydalanuvchi | + `widgets/header` |
| 5 | Admin: buyurtmalar ro'yxati, tafsilot, tahrirlash | Slice guruhi `pages/admin-order/*` |
| 6 | Mobil veb va admin alohida reliz qilinadi | Monorepo (32-bob) — kerak bo'lsa |

## Shablon: 1-bosqich — faqat uch qatlam

```text
src/
├── app/      entrypoint/  providers/  routes/  styles/
├── pages/
│   ├── catalog/     ui/CatalogPage  ui/ProductCard  ui/Filters  api/load-catalog
│   ├── product/     ui/ProductPage  ui/Gallery                  api/load-product
│   ├── cart/        ui/CartPage                                 api/cart
│   ├── checkout/    ui/CheckoutPage  model/checkout-schema      api/place-order
│   └── sign-in/     ui/SignInPage  ui/RegisterPage  model/registration-schema
└── shared/
    ├── api/      client  endpoints/product  endpoints/order  endpoints/auth
    ├── auth/     session (joriy foydalanuvchi)
    ├── config/   env
    ├── routes/   ROUTES
    └── ui/       button/  input/  modal/  page-shell/
```

`ProductCard` — hali katalog **ichida**. Agar kimdir uni "oldindan" `entities/product`'ga qo'ysa, Steiger darhol aytadi:

```text
✘ This slice has only one reference in slice "pages/catalog". Consider merging them.
└ fsd/insignificant-slice
```

## Shablon: 2–4-bosqichlar — takrorlanish paydo bo'ladi

```text
2-bosqich: qidiruv sahifasi ham ProductCard'ni so'radi
  pages/catalog/ui/ProductCard  →  entities/product/ui/ProductCard
                                    entities/product/lib/format-price
                                    entities/product/index.ts
  pages/catalog, pages/search    →  import { ProductCard } from '@/entities/product'

3-bosqich: "Savatga" — katalog, mahsulot, qidiruv sahifalarida
  →  features/add-to-cart/ui/AddToCartButton  +  api (yoki shared/api)  +  index.ts
  ProductCard tugmani BILMAYDI — "actions" slot/prop orqali (8, 16-boblar):
     <ProductCard product={p} actions={<AddToCartButton productId={p.id} />} />

4-bosqich: header hamma sahifada
  →  widgets/header/ui/Header  (features/search, entities/cart, shared/ui/logo'ni yig'adi)
  →  app/routes/layouts/MainLayout  (Header + PageShell + <Outlet/>)
```

## Kod: 3-bosqichdagi kompozitsiya

::: react
```tsx
// pages/catalog/ui/CatalogPage.tsx
import { useQuery } from '@tanstack/react-query'
import { PRODUCT_QUERIES } from '@/shared/api'
import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { Filters } from './Filters'                       // faqat shu sahifada — sahifa ichida

export function CatalogPage() {
  const { data = [] } = useQuery(PRODUCT_QUERIES.list())
  return (
    <main>
      <Filters />
      {data.map((p) => <ProductCard key={p.id} product={p} actions={<AddToCartButton productId={p.id} />} />)}
    </main>
  )
}
```
:::

::: vue
```vue
<!-- pages/catalog/ui/CatalogPage.vue -->
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { PRODUCT_QUERIES } from '@/shared/api'
import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import CatalogFilters from './CatalogFilters.vue'         // faqat shu sahifada — sahifa ichida

const { data } = useQuery(PRODUCT_QUERIES.list())
</script>

<template>
  <main>
    <CatalogFilters />
    <ProductCard v-for="p in data" :key="p.id" :product="p">
      <template #actions><AddToCartButton :product-id="p.id" /></template>
    </ProductCard>
  </main>
</template>
```
:::

::: angular
```ts
// pages/catalog/ui/catalog-page.ts
import { Component } from '@angular/core'
import { httpResource } from '@angular/common/http'
import { PRODUCT_REQUESTS, type ProductDto } from '@/shared/api'
import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { CatalogFilters } from './catalog-filters'        // faqat shu sahifada — sahifa ichida

@Component({
  selector: 'app-catalog-page',
  imports: [ProductCard, AddToCartButton, CatalogFilters],
  template: `
    <main>
      <app-catalog-filters />
      @for (p of products.value() ?? []; track p.id) {
        <app-product-card [product]="p">
          <app-add-to-cart-button actions [productId]="p.id" />
        </app-product-card>
      }
    </main>
  `,
})
export class CatalogPage {
  protected readonly products = httpResource<ProductDto[]>(() => PRODUCT_REQUESTS.list())
}
```
:::

## Shablon: 5-bosqich — admin va slice guruhi

```text
pages/
├── catalog/  product/  cart/  checkout/  sign-in/  search/
└── admin-order/               ← slice guruhi (13-bob): index.ts va umumiy kod YO'Q
    ├── list/     ui/  api/  index.ts
    ├── detail/   ui/  api/  index.ts
    └── edit/     ui/  model/edit-schema  api/  index.ts
entities/
└── order/                     ← endi ikki joyda kerak: mijoz kabineti va admin
    ├── model/order-status     canBeCancelled(), statusLabel()
    ├── ui/OrderStatusBadge
    └── index.ts
```

Qatlamda 20 tadan ko'p guruhlanmagan slice bo'lsa, Steiger `excessive-slicing` bilan guruhlashni taklif qiladi:

```text
✘ Layer "pages" has 23 ungrouped slices, which is above the recommended threshold of 20. Consider grouping them or moving the code inside to the layer where it's used.
```

## Qachon / qachon emas

| Qaror | Asos |
| --- | --- |
| `Filters` — sahifada, widget emas | Faqat katalog ishlatadi; qidiruv ham so'rasa — `widgets/product-filters` |
| Savat holati — `entities/cart` | Klientda soni, jami, optimistik yangilash — qalin klient (18-bob) |
| Auth — `shared/auth` | Token va joriy foydalanuvchi; `entities/user` emas (22-bob) |
| Buyurtma holati qoidalari — `entities/order` | Mijoz va admin bir xil qoidani ishlatishi shart |
| Monorepo'ga o'tmaslik | Bitta jamoa, bitta reliz — hali kerak emas |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| 1-kunda 6 qatlam va 25 slice | Steiger `insignificant-slice` xatolari, bo'sh papkalar | Uch qatlam |
| `ProductCard` ichida `AddToCartButton` import | Entity feature'ga bog'landi (yuqoriga import) | Slot/prop |
| Admin sahifalari `pages/`'da tekis, 23 ta | Navigatsiya qiyin | Slice guruhi |
| Har bosqichda Steiger'ni o'chirib qo'yish | Eroziya | Xabarni o'qib, qarorni ko'rib chiqish |

## Amaliyot

1. O'z loyihangizning sahifalar ro'yxatini yozing — bu sizning 1-bosqichdagi `pages/`.
2. Ikki yoki undan ortiq sahifada takrorlanayotgan 3 ta narsani toping va 19-bobdagi daraxt bo'yicha qatlamini aniqlang.
3. 27–31-boblardagi shablonlardan birini olib, shu bosqichlarni o'zingiz takrorlang va har bosqichda `npx steiger src` ishga tushiring.

## Manbalar

- Rasmiy: *Tutorial* (Conduit misoli) <https://feature-sliced.design/docs/get-started/tutorial>
- Saytda: [Arxitektura 90-bob — Amaliy keys: to'liq tizim](../arxitektura/90-amaliy-keys.md)
