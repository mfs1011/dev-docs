# 27 — React + Vite shabloni

[← Oldingi: Marshrutlash va lazy loading](26-marshrutlash.md) · [Mundarija](README.md) · [Keyingi: Next.js shabloni →](28-nextjs-shabloni.md)

## Qisqacha

React + Vite + React Router + TanStack Query uchun **tayyor FSD shabloni**. Bu tuzilma 2026-yil oktabrda `npm create vite@latest` bilan yaratilgan haqiqiy loyihada qurildi: `npm run build` (TypeScript tekshiruvi + Vite build) va `npx steiger src` xatosiz o'tdi.

| Paket | Versiya |
| --- | --- |
| react / react-dom | ^19.2.8 (create-vite shabloni) |
| vite | ^8.3 |
| typescript | ~6.0.2 |
| react-router | ^8.4.0 |
| @tanstack/react-query | ^5.104 |
| steiger / @feature-sliced/steiger-plugin | ^0.7.0 / ^0.8.0 |

## Qoida: yaratish

```bash
npm create vite@latest my-shop -- --template react-ts --no-interactive
cd my-shop
npm i react-router @tanstack/react-query
npm i -D steiger @feature-sliced/steiger-plugin
rm -rf src && mkdir src          # create-vite'ning src/ tuzilmasi o'rniga FSD
```

Diqqat: create-vite hozir linter sifatida **oxlint** qo'yadi (ESLint emas) va TypeScript 6 bilan keladi; `verbatimModuleSyntax` yoqiq — tiplarni `import type` bilan import qiling.

## Shablon: papka daraxti

```text
my-shop/
├── index.html                    <script src="/src/app/entrypoint/main.tsx">
├── vite.config.ts                '@' → src
├── tsconfig.app.json             "paths": { "@/*": ["./src/*"] }
├── steiger.config.ts
└── src/
    ├── app/
    │   ├── entrypoint/main.tsx           createRoot + provayderlar + RouterProvider
    │   ├── providers/QueryProvider.tsx
    │   ├── routes/
    │   │   ├── router.tsx                createBrowserRouter, lazy sahifalar
    │   │   └── layouts/MainLayout.tsx    widgets/header + shared/ui/page-shell + <Outlet/>
    │   └── styles/global.css
    ├── pages/
    │   ├── home/      ui/HomePage.tsx      index.ts
    │   └── product/   ui/ProductPage.tsx   index.ts
    ├── widgets/
    │   └── header/    ui/Header.tsx        index.ts
    ├── features/
    │   └── add-to-cart/
    │       ├── ui/AddToCartButton.tsx
    │       ├── model/cart-count.ts
    │       └── index.ts
    ├── entities/
    │   └── product/
    │       ├── ui/ProductCard.tsx        "actions" va children — tashqaridan
    │       ├── lib/format-price.ts
    │       └── index.ts
    └── shared/
        ├── api/
        │   ├── client.ts
        │   ├── product/  get-products.ts  product.query.ts
        │   ├── cart/     add-to-cart.ts   cart.query.ts
        │   └── index.ts
        ├── config/   env.ts  index.ts
        ├── routes/   index.ts
        └── ui/
            ├── button/      Button.tsx      index.ts
            └── page-shell/  PageShell.tsx   index.ts
```

## Kod: sozlama fayllari

```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
```

```jsonc
// tsconfig.app.json — compilerOptions ichiga ("jsx" dan keyin); baseUrl shart emas
"paths": { "@/*": ["./src/*"] },
```

```ts
// steiger.config.ts
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Rasmiy hujjat app/providers'ni odatiy segment deb ko'rsatadi (12-bob)
    files: ['./src/app/**'],
    rules: { 'fsd/segments-by-purpose': 'off' },
  },
])
```

```html
<!-- index.html -->
<script type="module" src="/src/app/entrypoint/main.tsx"></script>
```

## Kod: `app` qatlami

```tsx
// src/app/entrypoint/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { QueryProvider } from '../providers/QueryProvider'
import { router } from '../routes/router'
import '../styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  </StrictMode>,
)

// src/app/providers/QueryProvider.tsx
import { useState, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

// src/app/routes/router.tsx — har sahifa alohida chunk
import { createBrowserRouter } from 'react-router'
import { ROUTES } from '@/shared/routes'
import { MainLayout } from './layouts/MainLayout'

export const router = createBrowserRouter([
  {
    Component: MainLayout,
    children: [
      { path: ROUTES.home, lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }) },
      { path: ROUTES.productPattern, lazy: async () => ({ Component: (await import('@/pages/product')).ProductPage }) },
    ],
  },
])
```

## Kod: sahifa → feature → entity → shared

```tsx
// src/pages/home/ui/HomePage.tsx — kompozitsiya sahifada
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { PRODUCT_QUERIES } from '@/shared/api'
import { ROUTES } from '@/shared/routes'
import { ProductCard } from '@/entities/product'
import { AddToCartButton } from '@/features/add-to-cart'

export function HomePage() {
  const { data, isPending } = useQuery(PRODUCT_QUERIES.list())
  if (isPending) return <p>Yuklanmoqda…</p>
  return (
    <main>
      {data?.map((p) => (
        <ProductCard key={p.id} product={p} actions={<AddToCartButton productId={p.id} />}>
          <Link to={ROUTES.product(p.id)}>Batafsil</Link>
        </ProductCard>
      ))}
    </main>
  )
}

// src/features/add-to-cart/ui/AddToCartButton.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCart, CART_QUERIES } from '@/shared/api'
import { Button } from '@/shared/ui/button'

export function AddToCartButton({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CART_QUERIES.all() }),
  })
  return <Button onClick={() => mutate()} disabled={isPending}>Savatga</Button>
}

// src/shared/api/product/product.query.ts
import { queryOptions } from '@tanstack/react-query'
import { getProduct, getProducts } from './get-products'

export const PRODUCT_QUERIES = {
  all: () => ['products'] as const,
  list: () => queryOptions({ queryKey: [...PRODUCT_QUERIES.all(), 'list'], queryFn: getProducts }),
  detail: (id: string) => queryOptions({
    queryKey: [...PRODUCT_QUERIES.all(), 'detail', id],
    queryFn: () => getProduct(id),
  }),
}

// src/shared/api/index.ts — shared/api uchun bitta public API yetarli
export { client } from './client'
export { PRODUCT_QUERIES } from './product/product.query'
export type { ProductDto } from './product/get-products'
export { CART_QUERIES } from './cart/cart.query'
export { addToCart } from './cart/add-to-cart'
```

Qolgan fayllar (`client.ts`, `env.ts`, `ROUTES`, `Button`, `PageShell`, `ProductCard`, `Header`) — 7, 8, 10, 20, 24-boblardagi misollar bilan bir xil.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Redux Toolkit ishlatsam? | Store sozlamasi — `app/redux` (yoki `app/store` + Steiger istisnosi); slice'lar `model`'da (23-bob: `RootState`) |
| Zustand? | Store — ishlatiladigan slice'ning `model`'ida yoki `shared/auth` kabi `shared` segmentida |
| React Router framework mode (fayl marshrutlari) | `app/routes` o'rniga framework papkasi — faqat re-export, Next.js kabi (28-bob) |
| ESLint kerakmi? | oxlint + Steiger yetarli boshlanishga; import cheklovlari uchun ESLint — 34-bob |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `src/main.tsx` va `App.tsx`'ni qoldirish | `app` qatlamidan tashqarida ilova kodi | `app/entrypoint` |
| Faqat vite alias, tsconfig `paths`'siz | IDE va `tsc -b` `@/` ni topolmaydi | Ikkalasi ham |
| `lazy: () => import('@/pages/home/ui/HomePage')` | Public API chetlab o'tildi (Steiger xatosi) | `import('@/pages/home')` |
| `src/assets/` papkasini qoldirish | Qatlamlardan tashqaridagi umumiy papka — Steiger uni **tekshirmaydi** (sinab ko'rildi), shuning uchun u jimgina "axlat qutisi"ga aylanadi | Rasmlar ishlatiladigan joyda (25-bob) |

## Manbalar

- Vite: *Scaffolding Your First Vite Project* <https://vite.dev/guide/>
- React Router: *Data mode* <https://reactrouter.com/start/data/installation>
- Saytda: [React 3-bob — Loyiha tuzilmasi va Vite](../react/03-loyiha-tuzilmasi-va-vite.md), [React 35-bob — React Router](../react/35-react-router.md)
