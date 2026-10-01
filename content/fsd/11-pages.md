# 11 — pages

[← Oldingi: widgets](10-widgets.md) · [Mundarija](README.md) · [Keyingi: app →](12-app.md)

## Qisqacha

`pages` — veb-sayt yoki ilovaning sahifalari (ekranlar). Odatda **bitta sahifa — bitta slice**. v2.1 da bu eng muhim qatlam: sahifaga xos UI, so'rovlar va kichik holat **sahifa ichida** yashaydi. Kodning qancha qismi sahifada bo'lishiga cheklov yo'q — jamoa uni oson aylana olsa, bas.

## Qoida

- Bitta sahifa — bitta slice. Bir nechta **juda o'xshash** sahifa bitta slice'da bo'lishi mumkin (login va ro'yxatdan o'tish formalari).
- Sahifadagi UI bloki qayta ishlatilmasa — u sahifa ichida qoladi, widget/feature emas.
- Odatda sahifada: UI, yuklanish holatlari va xato chegaralari — `ui`; ma'lumot yuklash va o'zgartirish so'rovlari — `api`.
- Sahifaga alohida ma'lumot modeli kamdan-kam kerak; kichik holat komponentlarning o'zida.
- Sahifalar bir-birini import qilmaydi. Ikki sahifa bir narsani ishlatsa — u pastga tushadi (2-bob).
- Ichma-ich marshrutlashda sahifa — sahifaning katta qismi bo'lishi mumkin.

## Shablon

```text
pages/
├── home/
│   ├── ui/HomePage.tsx
│   └── index.ts
├── catalog/
│   ├── ui/
│   │   ├── CatalogPage.tsx
│   │   ├── CatalogSkeleton.tsx      yuklanish holati
│   │   └── EmptyCatalog.tsx
│   ├── api/load-catalog.ts          GET /products?…  (faqat shu sahifa)
│   └── index.ts                      export { CatalogPage }
├── product/
│   ├── ui/
│   │   ├── ProductPage.tsx
│   │   ├── ProductGallery.tsx        qayta ishlatilmaydi — sahifada
│   │   └── ProductErrorBoundary.tsx
│   ├── api/load-product.ts
│   └── index.ts
└── sign-in/
    ├── ui/
    │   ├── SignInPage.tsx
    │   └── RegisterPage.tsx          o'xshash sahifa — shu slice'da
    ├── model/registration-schema.ts
    ├── api/sign-in.ts
    └── index.ts                      export { SignInPage, RegisterPage }
```

## Kod: sahifa slice'i

::: react
```tsx
// pages/product/ui/ProductPage.tsx
import { useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ProductPrice } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { loadProduct } from '../api/load-product'
import { ProductGallery } from './ProductGallery'

export function ProductPage() {
  const { id = '' } = useParams()
  const { data: product, isPending, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => loadProduct(id),
  })

  if (isPending) return <p>Yuklanmoqda…</p>
  if (isError) return <p>Mahsulot topilmadi</p>

  return (
    <main>
      <ProductGallery images={product.images} />
      <h1>{product.title}</h1>
      <ProductPrice price={product.price} />
      <AddToCartButton productId={product.id} />
    </main>
  )
}

// pages/product/index.ts
export { ProductPage } from './ui/ProductPage'
```
:::

::: vue
```vue
<!-- pages/product/ui/ProductPage.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { ProductPrice } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { loadProduct } from '../api/load-product'
import ProductGallery from './ProductGallery.vue'

const route = useRoute()
const { data: product, isPending, isError } = useQuery({
  queryKey: computed(() => ['product', route.params.id]),
  queryFn: () => loadProduct(String(route.params.id)),
})
</script>

<template>
  <p v-if="isPending">Yuklanmoqda…</p>
  <p v-else-if="isError">Mahsulot topilmadi</p>
  <main v-else-if="product">
    <ProductGallery :images="product.images" />
    <h1>{{ product.title }}</h1>
    <ProductPrice :price="product.price" />
    <AddToCartButton :product-id="product.id" />
  </main>
</template>
```
:::

::: angular
```ts
// pages/product/ui/product-page.ts
import { Component, input } from '@angular/core'
import { httpResource } from '@angular/common/http'
import { ProductPrice } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'
import { productUrl, type ProductDetails } from '../api/load-product'
import { ProductGallery } from './product-gallery'

@Component({
  selector: 'app-product-page',
  imports: [ProductPrice, AddToCartButton, ProductGallery],
  template: `
    @if (product.isLoading()) {
      <p>Yuklanmoqda…</p>
    } @else if (product.error()) {
      <p>Mahsulot topilmadi</p>
    } @else if (product.value(); as p) {
      <main>
        <app-product-gallery [images]="p.images" />
        <h1>{{ p.title }}</h1>
        <app-product-price [price]="p.price" />
        <app-add-to-cart-button [productId]="p.id" />
      </main>
    }
  `,
})
export class ProductPage {
  readonly id = input.required<string>()      // withComponentInputBinding() bilan marshrut parametri
  protected readonly product = httpResource<ProductDetails>(() => productUrl(this.id()))
}
```
:::

## Qachon / qachon emas

| Holat | Yechim |
| --- | --- |
| Login va register | Bitta `pages/sign-in` slice'i |
| Ro'yxat, tafsilot, yaratish, tahrirlash — bir mavzu | Slice guruhi: `pages/order/list`, `pages/order/detail` (13-bob) |
| Sahifa 2000 qatorga yetdi | Ichini segmentlarga yaxshilab bo'lish; qayta ishlatiladiganini pastga |
| Ikki sahifa bir xil blokni ko'rsatadi | Blokni `widgets`/`entities`'ga tushirish |
| Marshrut konfiguratsiyasi | Sahifada emas — `app/routes` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Sahifa faqat widget'larni ro'yxat qiladi | Mantiq 10 slice'ga sochilgan | Sahifaga xos kod sahifada |
| `pages/cart` → `pages/checkout` import | Import qoidasi | Umumiy qismni pastga |
| Sahifa `model`'ida global holat (token) | Ilova holati sahifaga bog'landi | `shared`/`entities` (22-bob) |
| Har sahifaga bo'sh `model/`, `lib/`, `config/` | Shovqin | Faqat kerakli segmentlar |
| Yuklanish/xato holatlari layout'da umumiy, sahifada yo'q | Sahifaga xos holat yo'qoladi | Sahifa `ui`'da skeleton va xato chegarasi |

## Manbalar

- Rasmiy: *Layers — Pages* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Authentication — Dedicated page for login* <https://feature-sliced.design/docs/guides/examples/auth>
