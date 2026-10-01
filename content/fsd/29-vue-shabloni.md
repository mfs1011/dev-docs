# 29 — Vue + Vite shabloni

[← Oldingi: Next.js shabloni](28-nextjs-shabloni.md) · [Mundarija](README.md) · [Keyingi: Nuxt shabloni →](30-nuxt-shabloni.md)

## Qisqacha

Vue 3 + Vite + Vue Router + Pinia + TanStack Vue Query uchun **tayyor FSD shabloni**. 2026-yil oktabrda `npm create vue@latest` bilan yaratilgan haqiqiy loyihada qurildi: `npm run build` (`vue-tsc --build` + Vite build) va `npx steiger src` xatosiz o'tdi. Steiger `.vue` fayllar ichidagi importlarni ham tekshiradi — cross-import va public API'ni chetlab o'tish ushlanishi sinab ko'rildi.

| Paket | Versiya |
| --- | --- |
| vue | ^3.5.42 |
| vue-router | ^5.3.1 |
| pinia | ^4.0.3 |
| vite / vue-tsc | ^8.2 / ^3.3 |
| typescript | ~6.0 |
| @tanstack/vue-query | ^5.104 |
| steiger / @feature-sliced/steiger-plugin | ^0.7.0 / ^0.8.0 |

## Qoida: yaratish

```bash
npm create vue@latest my-shop -- --ts --router --pinia
cd my-shop && npm i
npm i @tanstack/vue-query
npm i -D steiger @feature-sliced/steiger-plugin
rm -rf src && mkdir src            # components/ views/ stores/ o'rniga FSD
```

create-vue'da `@` alias'i (`vite.config.ts`) va `"paths": { "@/*": ["./src/*"] }` (`tsconfig.app.json`) **allaqachon bor** — qo'shimcha sozlash kerak emas. Faqat `index.html`'dagi kirish nuqtasini o'zgartiring.

## Shablon: papka daraxti

```text
my-shop/
├── index.html                         <script src="/src/app/entrypoint/main.ts">
├── vite.config.ts  tsconfig.app.json  (create-vue sukuti)
├── steiger.config.ts
└── src/
    ├── app/
    │   ├── App.vue                    <AppHeader/> + <RouterView/>
    │   ├── entrypoint/main.ts         createApp + Pinia + VueQuery + router
    │   ├── routes/router.ts
    │   └── styles/global.css
    ├── pages/
    │   ├── home/      ui/HomePage.vue     index.ts
    │   └── product/   ui/ProductPage.vue  index.ts
    ├── widgets/
    │   └── header/    ui/AppHeader.vue    index.ts
    ├── features/
    │   └── add-to-cart/  ui/AddToCartButton.vue  index.ts
    ├── entities/
    │   ├── cart/
    │   │   ├── model/cart-store.ts        Pinia store — savat holati (qalin klient)
    │   │   ├── ui/CartCounter.vue
    │   │   └── index.ts
    │   └── product/
    │       ├── ui/ProductCard.vue         default slot + #actions slot
    │       ├── lib/format-price.ts
    │       └── index.ts
    └── shared/
        ├── api/     client.ts  product/  cart/  index.ts
        ├── config/  env.ts  index.ts
        ├── routes/  index.ts
        └── ui/button/  BaseButton.vue  index.ts
```

Pinia store'lar alohida `stores/` papkasida emas — ular tegishli slice'ning `model` segmentida (`stores` — Steiger taqiqlagan segment nomi, 5-bob).

## Kod: `app` qatlami

```ts
// src/app/entrypoint/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '../App.vue'
import { router } from '../routes/router'
import '../styles/global.css'

createApp(App).use(createPinia()).use(VueQueryPlugin).use(router).mount('#app')

// src/app/routes/router.ts — sahifalar public API orqali, lazy
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/shared/routes'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { ...ROUTES.home, component: () => import('@/pages/home').then((m) => m.HomePage) },
    { ...ROUTES.product, component: () => import('@/pages/product').then((m) => m.ProductPage) },
  ],
})

// src/shared/routes/index.ts
export const ROUTES = {
  home: { name: 'home', path: '/' },
  product: { name: 'product', path: '/products/:id' },
} as const
```

```vue
<!-- src/app/App.vue -->
<script setup lang="ts">
import { AppHeader } from '@/widgets/header'
</script>

<template>
  <AppHeader />
  <RouterView />
</template>
```

## Kod: `.vue` komponentlar uchun public API

```ts
// src/entities/product/index.ts — SFC'lar default eksport, public API'da nomlanadi
export { default as ProductCard } from './ui/ProductCard.vue'
export { formatPrice } from './lib/format-price'

// src/entities/cart/index.ts
export { useCartStore } from './model/cart-store'
export { default as CartCounter } from './ui/CartCounter.vue'
```

## Kod: feature entity store'ini yangilaydi, sahifa slot bilan yig'adi

```vue
<!-- src/features/add-to-cart/ui/AddToCartButton.vue -->
<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { addToCart } from '@/shared/api'
import { BaseButton } from '@/shared/ui/button'
import { useCartStore } from '@/entities/cart'

const props = defineProps<{ productId: string }>()
const cart = useCartStore()
const { mutate, isPending } = useMutation({
  mutationFn: () => addToCart(props.productId),
  onSuccess: (summary) => cart.apply(summary),
})
</script>

<template>
  <BaseButton :disabled="isPending" @click="mutate()">Savatga</BaseButton>
</template>
```

```vue
<!-- src/pages/home/ui/HomePage.vue -->
<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query'
import { PRODUCT_QUERIES } from '@/shared/api'
import { ROUTES } from '@/shared/routes'
import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'

const { data, isPending } = useQuery(PRODUCT_QUERIES.list())
</script>

<template>
  <p v-if="isPending">Yuklanmoqda…</p>
  <main v-else>
    <ProductCard v-for="p in data" :key="p.id" :product="p">
      <RouterLink :to="{ name: ROUTES.product.name, params: { id: p.id } }">Batafsil</RouterLink>
      <template #actions><AddToCartButton :product-id="p.id" /></template>
    </ProductCard>
  </main>
</template>
```

```vue
<!-- src/pages/product/ui/ProductPage.vue — marshrut parametri o'zgarsa query ham o'zgaradi -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { PRODUCT_QUERIES } from '@/shared/api'
import { formatPrice } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'

const route = useRoute()
const { data: product, isPending, isError } = useQuery(
  computed(() => PRODUCT_QUERIES.detail(String(route.params.id))),
)
</script>
```

## Kod: Steiger sozlamasi

```ts
// steiger.config.ts — bu shablon uchun qo'shimcha istisno kerak emas
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([...fsd.configs.recommended])
```

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Pinia store qayerda? | Bitta sahifaga — sahifa `model`; bir nechta joyga — entity `model`; sessiya — `shared/auth` |
| Composable'lar (`useX`) | Segment nomi `composables` emas — `model` yoki `lib` (Steiger `composables`'ni rad etadi) |
| Global komponentlarni `app.component()` bilan ro'yxatdan o'tkazish | Tavsiya etilmaydi — importlar ko'rinmaydi, Steiger bog'liqlikni ko'rmaydi |
| `unplugin-vue-components` auto-import | Xuddi shu sabab: importlar yashirin, FSD chegaralari tekshirilmaydi |
| Options API | Tuzilma bir xil — faqat komponent ichi farq qiladi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `src/stores/`, `src/composables/`, `src/views/` qoldirish | Desegmentatsiya, Steiger nomlarni rad etadi | Slice'lar va `model`/`ui` |
| `index.ts`'da `export * from './ui/ProductCard.vue'` | SFC default eksport — nom yo'qoladi | `export { default as ProductCard }` |
| `useQuery({ queryKey: ['p', route.params.id] })` | Kalit reaktiv emas, sahifa almashganda eski ma'lumot | `computed(() => …)` |
| `App.vue`'ni `src/` ildizida qoldirish | `app` qatlamidan tashqarida | `src/app/App.vue` |

## Manbalar

- create-vue <https://github.com/vuejs/create-vue>
- Rasmiy: *Cross-imports — Slots example (Vue)* <https://feature-sliced.design/docs/guides/issues/cross-imports>
- Saytda: [Vue 6-bob — Loyiha tuzilmasi va Vite](../vue/06-loyiha-tuzilmasi-va-vite.md), [Vue 42-bob — Pinia](../vue/42-pinia.md), [Vue 26-bob — Slotlar](../vue/26-slotlar.md)
