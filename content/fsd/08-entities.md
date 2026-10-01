# 08 — entities

[← Oldingi: shared](07-shared.md) · [Mundarija](README.md) · [Keyingi: features →](09-features.md)

## Qisqacha

`entities` — loyiha ishlaydigan **real dunyo tushunchalari**: biznes o'z mahsulotini tasvirlashda ishlatadigan otlar. Ijtimoiy tarmoqda — `user`, `post`, `group`; do'konda — `product`, `order`, `customer`. Entity slice'ida ma'lumot modeli, validatsiya sxemasi, shu obyektga oid so'rovlar va uning **ko'rinishi** (karta, qator, avatar) bo'lishi mumkin.

Muhim: entity'lar — **majburiy emas**. v2.1 da ular kechiktirilib, faqat haqiqiy qayta ishlatish paydo bo'lganda yaratiladi (18-bob).

## Qoida

| Segment | Entity'da nima |
| --- | --- |
| `model` | Ma'lumot tiplari, validatsiya sxemalari, store, **biznes qoidalari** (`canBeCancelled(order)`) |
| `api` | Shu entity'ga oid so'rovlar (lekin oddiy CRUD — `shared/api`'da yaxshiroq) |
| `ui` | Qayta ishlatiladigan ko'rinish: `ProductCard`, `UserAvatar`. Har xil biznes mantiqi props yoki slot orqali biriktiriladi |

- Entity'lar bir-birini import qilmaydi. Bog'liqlik zarur bo'lsa — `@x` (15-bob), lekin bu "oxirgi chora".
- Entity'lar orasidagi **o'zaro ta'sir mantiqi** (savatga mahsulot qo'shish) — yuqoriroq: `features` yoki `pages`.
- Entity UI to'liq blok bo'lishi shart emas — maqsad bir xil ko'rinishni bir nechta sahifada qayta ishlatish.

## Shablon

```text
entities/
├── product/
│   ├── model/
│   │   ├── product.ts           type Product, mapProductDto()
│   │   └── availability.ts      isInStock(product), canBePreordered(product)
│   ├── ui/
│   │   ├── ProductCard.tsx      rasm, nom, narx; harakat tugmasi — slot/props orqali
│   │   └── ProductPrice.tsx
│   └── index.ts
├── order/
│   ├── model/
│   │   └── order-status.ts      canBeCancelled(order), statusLabel(status)
│   ├── ui/OrderStatusBadge.tsx
│   └── index.ts
└── user/
    ├── ui/UserAvatar.tsx
    └── index.ts

shared/api/endpoints/product.ts  ← getProducts(), getProduct(id) — CRUD shu yerda (18-bob)
```

## Kod: entity UI — harakat tashqaridan

`ProductCard` savatga qo'shishni **bilmaydi** — tugma tashqaridan beriladi:

::: react
```tsx
// entities/product/ui/ProductCard.tsx
import type { ReactNode } from 'react'
import type { Product } from '../model/product'
import { isInStock } from '../model/availability'

export function ProductCard({ product, actions }: { product: Product; actions?: ReactNode }) {
  return (
    <article>
      <img src={product.imageUrl} alt="" />
      <h3>{product.title}</h3>
      {!isInStock(product) && <p>Tugagan</p>}
      {actions}
    </article>
  )
}

// pages/catalog/ui/CatalogPage.tsx — kompozitsiya yuqorida
<ProductCard product={p} actions={<AddToCartButton productId={p.id} />} />
```
:::

::: vue
```vue
<!-- entities/product/ui/ProductCard.vue -->
<script setup lang="ts">
import type { Product } from '../model/product'
import { isInStock } from '../model/availability'

defineProps<{ product: Product }>()
</script>

<template>
  <article>
    <img :src="product.imageUrl" alt="" />
    <h3>{{ product.title }}</h3>
    <p v-if="!isInStock(product)">Tugagan</p>
    <slot name="actions" />
  </article>
</template>

<!-- pages/catalog/ui/CatalogPage.vue — kompozitsiya yuqorida -->
<!-- <ProductCard :product="p"><template #actions><AddToCartButton :product-id="p.id" /></template></ProductCard> -->
```
:::

::: angular
```ts
// entities/product/ui/product-card.ts
import { Component, computed, input } from '@angular/core'
import type { Product } from '../model/product'
import { isInStock } from '../model/availability'

@Component({
  selector: 'app-product-card',
  template: `
    <article>
      <img [src]="product().imageUrl" alt="" />
      <h3>{{ product().title }}</h3>
      @if (!inStock()) { <p>Tugagan</p> }
      <ng-content select="[actions]" />
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>()
  protected readonly inStock = computed(() => isInStock(this.product()))
}

// pages/catalog/ui/catalog-page.html — kompozitsiya yuqorida
// <app-product-card [product]="p"><app-add-to-cart actions [productId]="p.id" /></app-product-card>
```
:::

## Qachon / qachon emas

| Entity yarating | Entity yaratmang |
| --- | --- |
| Biznes obyekti 2+ sahifada bir xil ko'rinishda | Faqat bir sahifada ishlatiladi — sahifa `model`'ida qoldiring |
| Klient tomonida jiddiy biznes qoidalari bor ("qalin klient") | Yupqa klient: hamma mantiq backend'da, frontend faqat ko'rsatadi |
| Qoida bir joyda bo'lishi shart (`canBeCancelled`) | Faqat CRUD so'rovlari — `shared/api` |
| | Auth tokeni va joriy foydalanuvchi DTO — `shared/auth` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Backend'dagi har jadval uchun entity | Bo'sh slice'lar, `@x` ko'payadi | Faqat frontend'da ma'nosi bor tushunchalar |
| `entities/product` ichida `AddToCartButton` | Entity harakatni biladi — feature'lar bilan bog'lanadi | Harakat — `features`, kompozitsiya yuqorida |
| `order`, `order-item`, `order-customer-info` alohida + `@x` | Bir kontekst bo'lingan, sikllar | Bitta izolyatsiyalangan kontekst: `order` |
| Backend DTO = entity modeli | Backend o'zgarsa butun UI buziladi | `api`/`model`'da mapper |
| `entities/user` = auth sessiyasi | Joriy foydalanuvchi va boshqa foydalanuvchilar aralashadi | Auth — `shared`'da (22-bob) |

## Manbalar

- Rasmiy: *Layers — Entities* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Excessive Entities* <https://feature-sliced.design/docs/guides/issues/excessive-entities>
- Arxitektura qo'llanmasi: [13-bob — Domen modeli](../arxitektura/13-domen-modeli.md)
