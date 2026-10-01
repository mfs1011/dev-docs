# 30 — Nuxt shabloni

[← Oldingi: Vue + Vite shabloni](29-vue-shabloni.md) · [Mundarija](README.md) · [Keyingi: Angular shabloni →](31-angular-shabloni.md)

## Qisqacha

Nuxt'ning fayl asosidagi routeri `pages/` papkasini band qiladi, Nuxt 4 esa butun ilova kodini sukut bo'yicha ildizdagi `app/` papkasida kutadi — ikkalasi ham FSD qatlamlari nomlari. Bu shablonning yechimi Next.js bilan bir xil g'oya: **Nuxt'ning `app/` papkasi faqat marshrut qobig'i** (`app.vue`, `layouts/`, `pages/*.vue` — har biri FSD'dan bitta komponentni import qiladi), **FSD esa `src/` ichida standart nomlar bilan** yashaydi va `@` alias'i `src/`'ga qaraydi.

2026-yil oktabrda **Nuxt 4.5.2** loyihasida tekshirildi: `nuxt build` ✅, SSR sahifalar va 404 ✅, `nuxi typecheck` ✅, `npx steiger src` ✅ (cross-import va public API'ni chetlab o'tish ushlanishi ham sinaldi).

> **Rasmiy qo'llanma haqida.** FSD hujjatidagi Nuxt sahifasi (`alias: { '@': '../src' }`, `dir.pages: './src/app/routes'`) Nuxt 3 davrida yozilgan, u yerda `srcDir` loyiha ildizi edi. Nuxt 4'da `srcDir` sukut bo'yicha `app/` — bu qo'llanmadagi yondashuv shunga moslashtirilgan va real loyihada tekshirilgan. Rasmiy variant Nuxt 4'da bu yerda sinalmadi.

## Qoida

| Narsa | Joy |
| --- | --- |
| `app.vue`, `layouts/default.vue`, `pages/**/*.vue` (Nuxt konvensiyasi) | Ildizdagi `app/` — ichida faqat FSD'dan import + bitta komponent |
| FSD qatlamlari | `src/app`, `src/pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` |
| Global CSS | `src/app/styles/global.css`, `nuxt.config` → `css` |
| Layout tarkibi | `src/app/layouts/MainLayout.vue`; Nuxt layout'i uni o'raydi |
| Server API (`server/api/*.ts`, Nitro) | Ildizdagi `server/` — Nuxt konvensiyasi. Klient so'rovlari esa `src/shared/api`'da; ikkalasini bir faylda aralashtirmang |
| `@` alias'i | `src/` (FSD); `~` — Nuxt'ning `app/` papkasi (o'zgarmaydi) |

## Shablon: papka daraxti

```text
my-shop/
├── nuxt.config.ts                   alias '@' → src, css
├── app/                             Nuxt srcDir — FAQAT marshrut qobig'i
│   ├── app.vue                      <NuxtLayout><NuxtPage/></NuxtLayout>
│   ├── layouts/default.vue          import { MainLayout } from '@/app/layouts'
│   └── pages/
│       ├── index.vue                import { HomePage } from '@/pages/home'
│       └── products/[id].vue        import { ProductPage } from '@/pages/product'
├── server/                          (kerak bo'lsa) Nitro API
├── public/
├── steiger.config.ts
└── src/
    ├── app/
    │   ├── layouts/  MainLayout.vue  index.ts
    │   └── styles/global.css
    ├── pages/
    │   ├── home/      ui/HomePage.vue     index.ts
    │   └── product/   ui/ProductPage.vue  index.ts
    ├── widgets/header/
    ├── features/add-to-cart/
    ├── entities/product/
    └── shared/  api/  routes/  ui/button/
```

## Kod: sozlama

```ts
// nuxt.config.ts
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // FSD qatlamlari src/ ichida; Nuxt'ning app/ papkasi — faqat marshrut qobig'i
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  css: ['@/app/styles/global.css'],
})
```

```bash
npm i -D steiger @feature-sliced/steiger-plugin
npm i -D vue-tsc typescript @types/node    # nuxi typecheck uchun; @types/node — node:url tiplari
```

Nuxt `.nuxt/tsconfig.app.json`'ni o'zi yaratadi: u yerda `"@": ["../src"]` va `"~": ["../app"]` paydo bo'ladi. Steiger importlarni shu fayl orqali hal qiladi — qo'shimcha `paths` kerak emas.

## Kod: marshrut qobig'i

```vue
<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<!-- app/layouts/default.vue -->
<script setup lang="ts">
import { MainLayout } from '@/app/layouts'
</script>
<template>
  <MainLayout><slot /></MainLayout>
</template>

<!-- app/pages/products/[id].vue -->
<script setup lang="ts">
import { ProductPage } from '@/pages/product'
</script>
<template>
  <ProductPage />
</template>
```

## Kod: FSD sahifasi

```vue
<!-- src/pages/product/ui/ProductPage.vue -->
<script setup lang="ts">
import { useAsyncData, useRoute, createError } from '#imports'
import { getProduct } from '@/shared/api'
import { formatPrice } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'

const route = useRoute()
const id = String(route.params.id)
const { data: product } = await useAsyncData(`product-${id}`, () => getProduct(id))
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Mahsulot topilmadi' })
</script>

<template>
  <main v-if="product">
    <h1>{{ product.title }}</h1>
    <p>{{ formatPrice(product.priceMinor) }}</p>
    <AddToCartButton :product-id="product.id" />
  </main>
</template>
```

**Auto-import haqida.** Nuxt composable'larni (`useRoute`, `useAsyncData`) `src/` ichida ham avtomatik import qiladi — tekshirildi: importsiz ham typecheck o'tadi. Lekin bu shablonda ular **aniq** `#imports`'dan import qilinadi: kod qayerdan kelayotgani ko'rinadi. Komponentlar uchun auto-import (`app/components/`) ishlatilmaydi — FSD komponentlari har doim public API orqali aniq import qilinadi, aks holda Steiger bog'liqlikni ko'rmaydi.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Pinia (`@pinia/nuxt`) | Store'lar slice `model`'ida, xuddi Vue shabloni kabi (29-bob) |
| `app/components/` auto-import | Ishlatmang — FSD tashqarisida, chegaralar tekshirilmaydi |
| `app/composables/` | Ishlatmang — `model`/`lib` segmentlari; `composables` Steiger taqiqlagan nom |
| `middleware/` (marshrut middleware) | Nuxt konvensiyasi — ildiz `app/middleware/`; mantiq (`requireAuth`) — `src/shared/auth` |
| `server/` papkasi | Nuxt/Nitro konvensiyasi; ko'p endpoint bo'lsa — alohida backend paket (32-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Sahifa kodi `app/pages/*.vue`'ning o'zida | FSD tashqarisida, Steiger tekshirmaydi | Faqat bitta FSD komponentini ko'rsatish |
| `'@'` ni o'zgartirmasdan `src/` ishlatish | Nuxt 4'da `@` → `app/` — FSD importlari topilmaydi | `alias['@']` → `src` |
| `~/` bilan FSD importlari | `~` — Nuxt qobig'i, FSD emas | `@/` |
| `@types/node`siz `fileURLToPath` | `nuxi typecheck` xatosi: `Cannot find module 'node:url'` | `npm i -D @types/node` |
| FSD `pages` qatlamini Nuxt `pages/` bilan birlashtirish | Nuxt har faylni marshrut deb o'qiydi | Ikki alohida papka |

## Manbalar

- Rasmiy: *Usage with NuxtJS* (Nuxt 3 davri) <https://feature-sliced.design/docs/guides/tech/with-nuxtjs>
- Nuxt: *Directory structure* <https://nuxt.com/docs/4.x/guide/directory-structure/app/app>, *alias* <https://nuxt.com/docs/4.x/api/nuxt-config#alias>
- Saytda: [Vue 59-bob — Nuxt asoslari](../vue/59-nuxt-asoslari.md), [Vue 60-bob — Nuxt: data va server](../vue/60-nuxt-data-va-server.md)
