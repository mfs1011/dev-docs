# 28 — Next.js shabloni

[← Oldingi: React + Vite shabloni](27-react-shabloni.md) · [Mundarija](README.md) · [Keyingi: Vue + Vite shabloni →](29-vue-shabloni.md)

## Qisqacha

Next.js'ning fayl asosidagi routeri `app/` (App Router) va `pages/` (Pages Router) papkalarini band qiladi — aynan FSD qatlamlari nomlari. Rasmiy yechim: Next papkalari **loyiha ildizida** qoladi va faqat **re-export** qiladi, FSD esa `src/` ichida yashaydi va to'qnashadigan qatlamlar `_app` va `_pages` deb nomlanadi. Bu bob 2026-yil oktabrda `create-next-app` bilan yaratilgan **Next.js 16.3.8** loyihasida tekshirildi: `next build` (Turbopack) va `npx steiger src` xatosiz o'tdi.

## Qoida

| Narsa | Joy |
| --- | --- |
| Next marshrut fayllari (`page.tsx`, `layout.tsx`, `route.ts`) | Ildizdagi `app/` — faqat re-export |
| FSD qatlamlari | `src/_app`, `src/_pages`, `src/widgets`, `src/features`, `src/entities`, `src/shared` |
| Route Handler mantiqi | `src/_app/api-routes` |
| DB so'rovlari (server) | `src/shared/db` |
| Server-only eksportlar | Slice'da `index.server.ts` — faqat muammo paydo bo'lganda |
| `proxy.ts` (Next 16; ilgari `middleware.ts`) va `instrumentation.ts` | `app/` bilan bir darajada — ildizda |

> **Next.js 16 o'zgarishi.** `middleware` fayl nomi eskirgan va `proxy` deb qayta nomlangan (eksport ham `proxy`). Rasmiy FSD hujjati hali "middleware" deydi — joylashuv qoidasi o'sha: `app` yoki `pages` bilan bir darajada (Next 16 paketidagi hujjat, `node_modules/next/dist/docs/`).

## Shablon: papka daraxti

```text
my-shop/
├── app/                              Next.js App Router — FAQAT re-export
│   ├── layout.tsx                    export { RootLayout as default } from '@/_app/layouts'
│   ├── page.tsx                      export { HomePage as default, metadata } from '@/_pages/home'
│   ├── products/[id]/page.tsx        export { ProductPage as default } from '@/_pages/product'
│   └── api/products/route.ts         export { getProductsRoute as GET } from '@/_app/api-routes'
├── proxy.ts                          (kerak bo'lsa) — ildizda
├── public/
├── tsconfig.json                     "paths": { "@/*": ["./src/*"] }
├── steiger.config.ts
└── src/
    ├── _app/
    │   ├── layouts/       RootLayout.tsx  index.ts     <html>, <body>, widgets/header
    │   ├── api-routes/    get-products.ts index.ts
    │   └── styles/        global.css
    ├── _pages/
    │   ├── home/
    │   │   ├── ui/HomePage.tsx                         async server komponent
    │   │   ├── config/metadata.ts
    │   │   └── index.ts                                export { HomePage, metadata }
    │   └── product/   ui/ProductPage.tsx  index.ts
    ├── widgets/header/
    ├── features/add-to-cart/        'use client' komponent
    ├── entities/product/
    │   ├── ui/ lib/ api/
    │   ├── index.ts                 klient + server uchun xavfsiz
    │   └── index.server.ts          'server-only' modullar
    └── shared/
        ├── api/   routes/   ui/button/
        └── db/                      (DB bo'lsa)
```

## Kod: re-export fayllari

```tsx
// app/layout.tsx
export { RootLayout as default } from '@/_app/layouts'

// app/page.tsx — metadata ham sahifa slice'idan
export { HomePage as default, metadata } from '@/_pages/home'

// app/products/[id]/page.tsx
export { ProductPage as default } from '@/_pages/product'

// app/api/products/route.ts
export { getProductsRoute as GET } from '@/_app/api-routes'
```

```tsx
// src/_app/layouts/RootLayout.tsx
import type { ReactNode } from 'react'
import { Header } from '@/widgets/header'
import '../styles/global.css'

export function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}

// src/_pages/product/ui/ProductPage.tsx — server komponent, Next 16: params — Promise
import { formatPrice } from '@/entities/product'
import { getProductOrNotFound } from '@/entities/product/index.server'
import { AddToCartButton } from '@/features/add-to-cart'

export async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await getProductOrNotFound(id)
  return (
    <main>
      <h1>{product.title}</h1>
      <p>{formatPrice(product.priceMinor)}</p>
      <AddToCartButton productId={product.id} />
    </main>
  )
}
```

## Kod: server va klient public API

```ts
// src/entities/product/api/get-product-for-page.ts
import 'server-only'
import { notFound } from 'next/navigation'
import { getProduct } from '@/shared/api'

export async function getProductOrNotFound(id: string) {
  const product = await getProduct(id)
  if (!product) notFound()
  return product
}

// src/entities/product/index.ts — klient komponentlar ham import qiladi
export { ProductCard } from './ui/ProductCard'
export { formatPrice } from './lib/format-price'

// src/entities/product/index.server.ts — faqat server
export { getProductOrNotFound } from './api/get-product-for-page'
```

Tekshirildi: `'use client'` komponentga `@/entities/product/index.server` import qilinsa, build to'xtaydi — `You're importing a module that depends on "server-only"`. Steiger esa `index.server` importini public API'ni chetlab o'tish deb hisoblamaydi.

## Kod: Steiger sozlamasi

```ts
// steiger.config.ts
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // _app va _pages — Next.js bilan to'qnashmaslik uchun rasmiy nomlar
    rules: { 'fsd/typo-in-layer-name': 'off' },
  },
])
```

Bu sozlamasiz Steiger `Layer "_app" potentially contains a typo. Did you mean "app"?` deydi. Qoida o'chirilgach ham Steiger `_pages`'ni **pages qatlami deb tushunadi** — tekshirildi: `_pages/home` → `_pages/product` importi "Forbidden cross-import", `widgets` → `_pages` importi "Forbidden import from higher layer pages" xatosini beradi. Ya'ni boshqa qoidalar to'liq ishlaydi.

## Muqobil: standart nomlar

Ildizda **bo'sh `pages/` papkasi** bo'lsa (masalan faqat `README.md` bilan), Next `src/app` va `src/pages`'ni o'zining router papkasi deb o'qimaydi — FSD qatlamlarini standart nomlar bilan qoldirish mumkin va Steiger sozlamasiz o'tadi (tekshirildi). Bo'sh `pages/` bo'lmasa, Next xato beradi: `` `pages` and `app` directories should be under the same folder ``.

| | `_app` / `_pages` (rasmiy) | Bo'sh ildiz `pages/` |
| --- | --- | --- |
| Rasmiy hujjatga mos | ✅ | ❌ |
| Steiger sozlamasi | Bitta qoida o'chiriladi | Kerak emas |
| Import yo'llari | `@/_pages/home` | `@/pages/home` |
| Xavf | Yo'q | Next xatti-harakatiga tayanadi; Pages Router ishlatib bo'lmaydi |

Tavsiya — rasmiy variant.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Pages Router (eski loyiha) | Xuddi shu: ildizda `pages/`, `src/_pages`; `_app.tsx` → `src/_app/custom-app` dan re-export |
| Juda ko'p Route Handler | Backend'ni monorepo'da alohida paketga (32-bob) — FSD frontend uchun |
| Kesh va revalidatsiya | So'rov yonida (`shared/api` yoki `shared/db`) — rasmiy tavsiya |
| `create-next-app` yaratgan `AGENTS.md`/`CLAUDE.md` | Next 16 AI yordamchilari uchun qo'yadi; FSD qoidalarini ham shu faylga yozish foydali |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `app/page.tsx` ichida 300 qator sahifa kodi | FSD tashqarisida, qatlamlar tekshirilmaydi | Faqat re-export |
| tsconfig `"@/*": ["./*"]` qoldirilgan (create-next-app sukuti) | `@/entities` topilmaydi; Steiger importlarni noto'g'ri hal qiladi va slice'larni "ishlatilmagan" deydi | `"@/*": ["./src/*"]` |
| Server-only funksiya `index.ts`'da | Klient grafiga tushadi yoki build buziladi | `index.server.ts` |
| `src/middleware.ts` Next 16'da | Eskirgan nom | Ildizda `proxy.ts` |
| `src/app` + ildiz `app/` (bo'sh `pages/`siz) | Next xatosi | `_app` yoki muqobil variant |

## Manbalar

- Rasmiy: *Usage with Next.js* <https://feature-sliced.design/docs/guides/tech/with-nextjs>
- Next.js: *Project structure* <https://nextjs.org/docs/app/getting-started/project-structure>, *Proxy* <https://nextjs.org/docs/app/getting-started/proxy>
- Saytda: [Next.js 4-bob — Server/klient chegarasi](../nextjs/04-server-klient-chegarasi.md), [Next.js 7-bob — Marshrutlash](../nextjs/07-marshrutlash.md)
