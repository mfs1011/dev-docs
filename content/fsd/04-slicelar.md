# 04 — Slice'lar

[← Oldingi: Qatlamlar](03-qatlamlar.md) · [Mundarija](README.md) · [Keyingi: Segmentlar →](05-segmentlar.md)

## Qisqacha

Slice — qatlam ichidagi papka, kodni **biznes ma'nosi** bo'yicha guruhlaydi: `pages/catalog`, `entities/product`, `features/add-to-cart`. Slice nomlari standart emas — ular sizning domeningizdan keladi. Ideal slice o'z qatlamidagi boshqa slice'lardan **mustaqil** (nol bog'lanish) va o'z maqsadiga oid kodning **ko'p qismini** o'zida saqlaydi (yuqori bog'liqlik).

## Qoida

- Slice'lar faqat `pages`, `widgets`, `features`, `entities` qatlamlarida bo'ladi. `app` va `shared`'da slice yo'q.
- **Bir qatlamdagi slice'lar bir-birini import qilmaydi** (import qoidasi, 6-bob). Istisno — `entities` orasidagi `@x` (15-bob).
- Har slice'da **public API** bo'lishi shart — odatda `index.ts`. Tashqaridan faqat u orqali kiriladi.
- Slice ichini qanday tashkil qilish — sizning ishingiz, faqat public API yaxshi bo'lsin.

```text
Past bog'lanish (coupling)           Yuqori bog'liqlik (cohesion)
features/add-to-cart  ✕  features/wishlist      features/add-to-cart/
  bir-birini bilmaydi                              ├── ui/AddToCartButton
                                                   ├── api/add-to-cart
                                                   ├── model/cart-optimistic
                                                   └── index.ts
                                                   "savatga qo'shish" haqidagi hamma narsa — shu yerda
```

## Shablon: nomlash

```text
pages/               entities/            features/                 widgets/
├── home/            ├── user/            ├── auth/                 ├── header/
├── catalog/         ├── product/         ├── add-to-cart/          ├── product-filters/
├── product/         ├── order/           ├── apply-promo-code/     └── cart-summary/
├── cart/            └── review/          └── leave-review/
├── checkout/
└── profile/

Nomlash kelishuvi:
  - kebab-case: add-to-cart, user-profile (fayl tizimi va URL bilan bir xil)
  - entities — ot (birlik):   product, order, user
  - features — harakat:        add-to-cart, apply-promo-code, sign-in
  - pages — sahifa/ekran nomi: catalog, product, checkout
  - widgets — blok nomi:        header, product-filters, cart-summary
  - biznes tili: jamoa va mahsulot egasi ishlatadigan so'zlar (Arxitektura 14-bob: umumiy til)
```

## Kod: slice va uning public API'si

::: react
```tsx
// entities/product/index.ts — public API
export { ProductCard } from './ui/ProductCard'
export { formatPrice } from './lib/format-price'
export type { Product } from './model/product'

// entities/product/ui/ProductCard.tsx — slice ichida nisbiy import
import { formatPrice } from '../lib/format-price'
import type { Product } from '../model/product'

export function ProductCard({ product }: { product: Product }) {
  return (
    <article>
      <h3>{product.title}</h3>
      <p>{formatPrice(product.price)}</p>
    </article>
  )
}
```
:::

::: vue
```ts
// entities/product/index.ts — public API
export { default as ProductCard } from './ui/ProductCard.vue'
export { formatPrice } from './lib/format-price'
export type { Product } from './model/product'
```

```vue
<!-- entities/product/ui/ProductCard.vue — slice ichida nisbiy import -->
<script setup lang="ts">
import { formatPrice } from '../lib/format-price'
import type { Product } from '../model/product'

defineProps<{ product: Product }>()
</script>

<template>
  <article>
    <h3>{{ product.title }}</h3>
    <p>{{ formatPrice(product.price) }}</p>
  </article>
</template>
```
:::

::: angular
```ts
// entities/product/index.ts — public API
export { ProductCard } from './ui/product-card'
export { formatPrice } from './lib/format-price'
export type { Product } from './model/product'

// entities/product/ui/product-card.ts — slice ichida nisbiy import
import { Component, input } from '@angular/core'
import { formatPrice } from '../lib/format-price'
import type { Product } from '../model/product'

@Component({
  selector: 'app-product-card',
  template: `
    <article>
      <h3>{{ product().title }}</h3>
      <p>{{ price() }}</p>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>()
  protected price = () => formatPrice(this.product().price)
}
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Ikkita juda o'xshash sahifa (login va register) | Bitta slice: `pages/sign-in` ichida ikkala komponent |
| Slice juda katta bo'lib ketdi | Avval ichini segmentlarga yaxshilab bo'ling; keyin haqiqiy mustaqil qismlar bo'lsa — alohida slice |
| Ikki slice doim birga o'zgaradi va bir-birini import qiladi | Ular aslida bitta — birlashtiring (15-bob, A strategiya) |
| Qatlamda 30+ slice | Slice guruhlari (13-bob) yoki ortiqcha bo'linish belgisi (`excessive-slicing`, 33-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Slice nomi texnik: `forms`, `modals`, `tables` | Biznes ma'nosi yo'q — desegmentatsiya (17-bob) | Biznes nomi: `checkout`, `product-filters` |
| `features/product-feature-new` kabi noaniq nom | Nimani qilishini bilib bo'lmaydi | Harakat nomi: `compare-products` |
| `export *` bilan public API | Ichki tafsilotlar tashqariga chiqadi | Aniq nomlangan eksportlar (14-bob) |
| Slice ichida absolyut import (`@/entities/product/...`) | Siklik import xavfi | Slice ichida — nisbiy, slice'lar orasida — absolyut |
| Har kichik narsaga slice | Navigatsiya qiyinlashadi | Sahifada qoldirish (2-bob) |

## Manbalar

- Rasmiy: *Slices and segments* <https://feature-sliced.design/docs/reference/slices-segments>
- Arxitektura qo'llanmasi: [5-bob — Bog'liqlik va bog'lanish](../arxitektura/05-bogliqlik.md), [14-bob — DDD: til va kontekst](../arxitektura/14-ddd.md)
