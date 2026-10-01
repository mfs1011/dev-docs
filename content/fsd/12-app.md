# 12 — app

[← Oldingi: pages](11-pages.md) · [Mundarija](README.md) · [Keyingi: Slice guruhlari →](13-slice-guruhlari.md)

## Qisqacha

`app` — butun ilovaga tegishli hamma narsa: texnik ma'noda (provayderlar, router, entrypoint, global stil) va biznes ma'nosida (analitika). Bu eng yuqori qatlam: u hamma qatlamni import qila oladi, uni esa hech kim import qilmaydi. `shared` kabi slice'siz — to'g'ridan-to'g'ri segmentlar.

## Qoida

| Segment | Nima |
| --- | --- |
| `routes` | Router konfiguratsiyasi: qaysi URL — qaysi sahifa, layout'lar, guard'lar |
| `store` | Global store sozlamasi (Redux, Pinia instansiyasi, NgRx) |
| `styles` | Global stillar, CSS reset, mavzu o'zgaruvchilari |
| `entrypoint` | Ilovaning kirish nuqtasi (framework'ga xos) |
| `providers` (odatiy o'z segment) | Query client, tema, i18n, xato chegarasi provayderlari |

- `app` — **yig'ish va sozlash** joyi. Biznes UI va mantiq bu yerda emas.
- Eskirgan `processes` qatlamining ko'p sahifali ssenariylari ham odatda `app` va `features`'ga ko'chiriladi.
- Shriftlar: `app/fonts` yoki `public/`; global stil — `app/styles` (25-bob).

> **Hujjat va linter ziddiyati.** Rasmiy hujjat `app/store`'ni odatiy segment deb ko'rsatadi, TanStack Query qo'llanmasi esa `app/providers`'dan foydalanadi. Lekin Steiger'ning tavsiya etilgan sozlamasi (steiger 0.7.0, plugin 0.8.0) ikkalasini ham `fsd/segments-by-purpose` xatosi deb belgilaydi — real loyihada tekshirildi. Ikki yo'l bor:
> 1. **Nomni maqsad bo'yicha berish:** `app/providers` → `app/query-client`, `app/theme`; `app/store` → `app/redux` yoki `app/state`.
> 2. **`app` uchun qoidani o'chirish** (`app` — slice'siz, butun ilovani yig'adigan qatlam; texnik nomlar bu yerda zararsiz):
>
> ```ts
> // steiger.config.ts
> export default defineConfig([
>   ...fsd.configs.recommended,
>   { files: ['./src/app/**'], rules: { 'fsd/segments-by-purpose': 'off' } },
> ])
> ```
>
> Bu qo'llanmadagi shablonlar 2-yo'lni ishlatadi va `app/providers` nomini saqlaydi — rasmiy misollarga mos bo'lsin uchun.

## Shablon

```text
app/
├── entrypoint/
│   └── main.tsx              createRoot / createApp / bootstrapApplication
├── providers/
│   ├── QueryProvider.tsx
│   └── ThemeProvider.tsx
├── routes/
│   ├── router.tsx            marshrutlar → pages
│   └── layouts/              widget'li layout'lar (24-bob)
├── store/                    (kerak bo'lsa)
├── styles/
│   ├── reset.css
│   └── global.css
└── analytics/                biznes ma'nosidagi ilova darajasi
```

## Kod: router — sahifalarni ulash

::: react
```tsx
// app/routes/router.tsx
import { createBrowserRouter } from 'react-router'
import { RootLayout } from './layouts/RootLayout'
import { ROUTES } from '@/shared/routes'

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: ROUTES.home, lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }) },
      { path: ROUTES.catalog, lazy: async () => ({ Component: (await import('@/pages/catalog')).CatalogPage }) },
      { path: '/products/:id', lazy: async () => ({ Component: (await import('@/pages/product')).ProductPage }) },
    ],
  },
])

// app/entrypoint/main.tsx
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryProvider } from '../providers/QueryProvider'
import { router } from '../routes/router'
import '../styles/global.css'

createRoot(document.getElementById('root')!).render(
  <QueryProvider><RouterProvider router={router} /></QueryProvider>,
)
```
:::

::: vue
```ts
// app/routes/router.ts
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from '@/shared/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { ...ROUTES.home, component: () => import('@/pages/home').then((m) => m.HomePage) },
    { ...ROUTES.catalog, component: () => import('@/pages/catalog').then((m) => m.CatalogPage) },
    { ...ROUTES.product, component: () => import('@/pages/product').then((m) => m.ProductPage) },
  ],
})

// app/entrypoint/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from '../App.vue'
import { router } from '../routes/router'
import '../styles/global.css'

createApp(App).use(createPinia()).use(VueQueryPlugin).use(router).mount('#app')
```
:::

::: angular
```ts
// app/routes/app.routes.ts
import type { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', loadComponent: () => import('@/pages/home').then((m) => m.HomePage) },
  { path: 'catalog', loadComponent: () => import('@/pages/catalog').then((m) => m.CatalogPage) },
  { path: 'products/:id', loadComponent: () => import('@/pages/product').then((m) => m.ProductPage) },
]

// app/app.config.ts
import { type ApplicationConfig } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { provideHttpClient, withFetch } from '@angular/common/http'
import { APP_ENV } from '@/shared/config'
import { routes } from './routes/app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    { provide: APP_ENV, useValue: { apiUrl: '/api', isProd: false } },
  ],
}
```
:::

## Qachon / qachon emas

| Kod | `app`'gami? |
| --- | --- |
| Router, guard'larni ulash, layout tanlash | ✅ |
| Query client, tema, i18n provayderlari | ✅ |
| Analitika (sahifa ko'rishlari), xato monitoringi sozlamasi | ✅ |
| Global CSS, reset | ✅ |
| Sahifa komponenti | ❌ `pages` |
| Tugma, modal | ❌ `shared/ui` |
| Marshrut **konstantalari** (URL'lar) | ❌ `shared/routes` — ularni pastki qatlamlar ham ishlatadi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `App.tsx` 600 qator: layout, holat, sahifalar | `app` shishadi, test qilib bo'lmaydi | Faqat yig'ish; sahifalar — `pages` |
| Pastki qatlam `app`'dan import qiladi (`@/app/store`) | Import qoidasi, sikl | Kerakli narsani `shared`'ga yoki DI/kontekst orqali |
| Marshrut URL'lari `app/routes`'da, sahifalar ularni import qiladi | Sahifa `app`'ga bog'landi | URL konstantalari — `shared/routes` |
| Hamma sahifa eager import | Katta bundle | Lazy loading (26-bob) |
| `processes/` qatlamini yangi loyihada ochish | Eskirgan | `app` yoki `features` |

## Manbalar

- Rasmiy: *Layers — App* <https://feature-sliced.design/docs/reference/layers>
- Saytda: [React 35-bob — React Router](../react/35-react-router.md), [Vue 39-bob — Router](../vue/39-router-asoslari.md), [Angular 43-bob — Lazy loading](../angular/43-lazy-loading.md)
