# 24 — Klient holati Next ichida

[← Oldingi: Optimistik yangilash](23-optimistik.md) · [Mundarija](README.md) · [Keyingi: Auth — kalit tushunchalar →](25-auth-kalit-tushunchalar.md)

## Tushuncha

App Router'da holat savolining javobi SPA'dagidan boshqacha: **ko'p holat endi serverda yashaydi**.

| Holat turi | SPA'da | Next App Router'da |
| --- | --- | --- |
| Server ma'lumoti | TanStack Query | **Server komponent** (`await`) |
| Filtr, sahifa, saralash | Store yoki URL | **URL** (`searchParams`) |
| Forma holati | `useState` / RHF | **Server Action** + `useActionState` |
| Modal ochiqligi | `useState` | `useState` yoki URL |
| Savat (mehmon) | Store | Cookie yoki store |
| Tema | Context | Cookie + Context |
| Real-time ma'lumot | Query/WebSocket | Klient (WebSocket/SSE) |

Amaliy natija: **klient holati kutubxonasi ko'pincha umuman kerak emas**.

## Kod: URL — birinchi tanlov

::: ts
```tsx
// app/products/page.tsx — server komponent
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}) {
  const { q = '', page = '1', sort = 'created' } = await searchParams

  // Ma'lumot SERVERDA filtrlanadi — klientga faqat natija keladi
  const products = await getProducts({ q, page: Number(page), sort })

  return (
    <>
      <CatalogFilters />              {/* klient: URL ni o'zgartiradi */}
      <ProductGrid products={products} />   {/* server */}
    </>
  )
}
```
:::

::: js
```jsx
export default async function ProductsPage({ searchParams }) {
  const { q = '', page = '1', sort = 'created' } = await searchParams
  const products = await getProducts({ q, page: Number(page), sort })

  return (
    <>
      <CatalogFilters />
      <ProductGrid products={products} />
    </>
  )
}
```
:::

Bu SPA'dan tubdan farq qiladi: u yerda filtr `useState` da bo'lib, ma'lumot klientda so'ralardi. Bu yerda filtr URL'da, ma'lumot serverda.

Foydasi: havola ulashiladi, SEO ishlaydi, klientga kamroq JS ketadi, birinchi ekran tez.

## Kod: cookie — server ko'radigan klient holati

Tema yoki til kabi holat **serverda ham kerak** bo'lsa (hydration mismatch bo'lmasligi uchun):

::: ts
```ts
// app/actions/theme.ts
'use server'

import { cookies } from 'next/headers'

export async function setTheme(theme: 'light' | 'dark') {
  const cookieStore = await cookies()

  cookieStore.set('theme', theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
```
:::

::: js
```js
'use server'

import { cookies } from 'next/headers'

export async function setTheme(theme) {
  const cookieStore = await cookies()

  cookieStore.set('theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
}
```
:::

::: ts
```tsx
// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? 'light'

  return (
    <html lang="uz" data-theme={theme}>      {/* server bilan klient mos keladi */}
      <body>{children}</body>
    </html>
  )
}
```
:::

::: js
```jsx
export default async function RootLayout({ children }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? 'light'

  return (
    <html lang="uz" data-theme={theme}>
      <body>{children}</body>
    </html>
  )
}
```
:::

`localStorage` bilan bu ishlamaydi: server uni o'qiy olmaydi va birinchi renderda tema noto'g'ri bo'lib, keyin "sakraydi".

**Narxi:** `cookies()` ni ildiz layoutda o'qish butun ilovani dinamik qiladi (18-bob). Kichik ilovada bu maqbul; katta saytda temani faqat kerakli joyda o'qing yoki PPR ishlating (20-bob).

## Kod: klient store qachon kerak

::: ts
```ts
// stores/ui-store.ts — faqat klient UI holati
'use client'

import { create } from 'zustand'

type UiStore = {
  isSidebarOpen: boolean
  isCommandPaletteOpen: boolean
  toggleSidebar: () => void
  openCommandPalette: () => void
  closeCommandPalette: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  isSidebarOpen: false,
  isCommandPaletteOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
}))
```
:::

::: js
```js
'use client'

import { create } from 'zustand'

export const useUiStore = create((set) => ({
  isSidebarOpen: false,
  isCommandPaletteOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}))
```
:::

Store'ga **faqat klient UI holati** kiradi: ochiq sidebar, buyruq paneli, tanlangan elementlar (agar URL'ga tegishli bo'lmasa).

**Server ma'lumotini store'ga solmang** — u server komponentda yashaydi.

## Kod: mehmon savati (server holatisiz)

::: ts
```ts
// stores/cart-store.ts
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartStore = {
  lines: CartLine[]
  add: (product: Product, qty?: number) => void
  remove: (productId: number) => void
  clear: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, qty = 1) => set((s) => addLine(s.lines, product, qty)),
      remove: (productId) => set((s) => ({ lines: s.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'cart', version: 1, skipHydration: true },     // SSR uchun muhim
  ),
)
```
:::

::: js
```js
'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set) => ({
      lines: [],
      add: (product, qty = 1) => set((s) => addLine(s.lines, product, qty)),
      clear: () => set({ lines: [] }),
    }),
    { name: 'cart', version: 1, skipHydration: true },
  ),
)
```
:::

`skipHydration: true` — **majburiy**: `localStorage` serverda yo'q, shuning uchun birinchi render serverda bo'sh savat bilan bo'ladi. Keyin klientda tiklanadi:

::: ts
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'

export function CartBadge() {
  const [hydrated, setHydrated] = useState(false)
  const count = useCartStore((s) => s.lines.length)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  if (!hydrated) return <span className="badge-skeleton" />     // mismatch bo'lmasin

  return <span className="badge">{count}</span>
}
```
:::

::: js
```jsx
'use client'

import { useEffect, useState } from 'react'
import { useCartStore } from '@/stores/cart-store'

export function CartBadge() {
  const [hydrated, setHydrated] = useState(false)
  const count = useCartStore((s) => s.lines.length)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  if (!hydrated) return <span className="badge-skeleton" />

  return <span className="badge">{count}</span>
}
```
:::

Muqobil yondashuv: savatni **cookie yoki bazada** saqlash — shunda server ham biladi va hydration muammosi yo'qoladi.

## Kod: TanStack Query qachon kerak

Server komponentlar ko'p narsani qoplaydi, lekin quyidagilar uchun klient kutubxonasi kerak:

| Ehtiyoj | Nega server komponent yetmaydi |
| --- | --- |
| Cheksiz scroll | Har sahifa uchun navigatsiya kerak bo'lardi |
| Polling (har 5 s yangilash) | Server komponent qayta so'ralmaydi |
| Real-time yangilanishlar | WebSocket/SSE klientda |
| Murakkab optimistik oqimlar | `useOptimistic` bitta action uchun |
| Offline qo'llab-quvvatlash | Kesh klientda kerak |
| Tez-tez o'zgaruvchi dashboard | `router.refresh()` butun sahifani yangilaydi |

::: ts
```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // MUHIM: useState ichida — har so'rovda yangi nusxa (16-bob)
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000 } },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```
:::

::: js
```jsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }))

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```
:::

::: ts
```tsx
// Cheksiz scroll — server boshlang'ich ma'lumotni beradi
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

export function ProductList({ initialData }: { initialData: Page<Product> }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetch(`/api/products?cursor=${pageParam}`).then((r) => r.json()),
    initialPageParam: '',
    initialData: { pages: [initialData], pageParams: [''] },    // SSR dan
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  // ...
}
```
:::

::: js
```jsx
'use client'

import { useInfiniteQuery } from '@tanstack/react-query'

export function ProductList({ initialData }) {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['products'],
    queryFn: ({ pageParam }) => fetch(`/api/products?cursor=${pageParam}`).then((r) => r.json()),
    initialPageParam: '',
    initialData: { pages: [initialData], pageParams: [''] },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
}
```
:::

Naqsh: **birinchi sahifa serverdan** (SEO va tezlik uchun), keyingilari klientdan.

## Kod: `router.refresh()` bilan yangilash

Klient kutubxonasisiz ham ma'lumotni yangilash mumkin:

::: ts
```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AutoRefresh({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)

    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
```
:::

::: js
```jsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AutoRefresh({ intervalMs = 30_000 }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), intervalMs)

    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
```
:::

Diqqat: `router.refresh()` **butun sahifani** qayta so'raydi. Kichik bo'lak uchun bu isrof — unda klient so'rovi afzal.

## Muhandislik nuqtai nazari: qaror daraxti

```
Bu ma'lumot serverdan keladimi?
├─ Ha
│  ├─ Sahifa yuklanganda kerakmi? → Server komponent (await)
│  ├─ Tez-tez yangilanadimi? → TanStack Query yoki router.refresh()
│  └─ Real-time? → WebSocket/SSE (37-bob)
└─ Yo'q (klient holati)
   ├─ Havolada ulashilsa mantiqiymi? → URL (searchParams)
   ├─ Server ham bilishi kerakmi? (tema, til) → Cookie
   ├─ Sahifa yangilanganda saqlanishi kerakmi? → Cookie yoki localStorage
   ├─ Butun ilovaga kerakmi? → Zustand / Context
   └─ Faqat shu komponentga? → useState
```

## Muhandislik nuqtai nazari: hydration mismatch'dan qochish

Klient holati SSR bilan to'qnashadigan uchta joy:

| Manba | Muammo | Yechim |
| --- | --- | --- |
| `localStorage` | Serverda yo'q | `skipHydration` + `mounted` bayrog'i |
| `window.matchMedia` | Serverda yo'q | Effektda o'qish yoki CSS media query |
| `new Date()`, `Math.random()` | Har xil natija | `useId`, serverdan uzatish |
| Vaqt zonasi | Server UTC, klient mahalliy | Serverda formatlash yoki `suppressHydrationWarning` |

```tsx
// Sana formatlash — eng ko'p uchraydigan mismatch
<time dateTime={post.createdAt} suppressHydrationWarning>
  {new Date(post.createdAt).toLocaleDateString('uz-UZ')}
</time>
```

Yaxshiroq yechim: sanani **serverda formatlab**, tayyor satr sifatida uzatish.

## Muhandislik nuqtai nazari: kamroq klient holati — kamroq bug

App Router'ga o'tgan jamoalarda tipik natija:

| | SPA (avval) | Next App Router (keyin) |
| --- | --- | --- |
| Global store hajmi | 500+ qator | 50 qator (faqat UI) |
| So'rov kutubxonasi | Majburiy | Ixtiyoriy |
| `useEffect` soni | Ko'p | Kam |
| Kesh mantiqi | Qo'lda | Framework darajasida |
| Holat sinxronizatsiyasi bug'lari | Ko'p | Kam |

Sabab: ma'lumot serverda qolgach, uni "klientda sinxron ushlash" muammosi yo'qoladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Server ma'lumotini Zustand'ga ko'chirish | Ikki manba, kesh mantiqi qo'lda | Server komponent |
| Filtrlarni `useState` da saqlash | Havola ulashilmaydi, SEO yo'q | `searchParams` |
| `localStorage` ni SSR'da o'qishga urinish | Hydration mismatch | `skipHydration` + effekt |
| `new QueryClient()` ni modul darajasida | Foydalanuvchilar keshi aralashadi | `useState(() => ...)` |
| Temani `localStorage` da saqlash | Birinchi renderda "sakraydi" | Cookie |
| Har bo'lak uchun `router.refresh()` | Butun sahifa qayta so'raladi | Klient so'rovi |
| TanStack Query'ni odat bo'yicha qo'shish | Ko'pincha kerak emas | Ehtiyojdan kelib chiqing |

## Amaliyot

1. Katalog filtrlarini `useState` dan `searchParams` ga ko'chiring va farqni o'lchang (klient JS hajmi, havola ulashilishi).
2. Temani `localStorage` bilan qiling va birinchi renderdagi "sakrash" ni ko'ring; keyin cookie'ga o'tkazing.
3. Savatni Zustand + `persist` bilan yozing va `skipHydration` siz qoldirib, hydration xatosini kuzating.
4. Cheksiz scroll qiling: birinchi sahifa serverdan, qolgani `useInfiniteQuery` bilan.
5. `AutoRefresh` komponentini yozing va `router.refresh()` butun sahifani yangilashini Network panelida ko'ring.
6. Loyihangizdagi barcha klient holatini qaror daraxti bo'yicha tekshiring: nechtasi serverga ko'chishi mumkin?

## Rasmiy hujjat

- Server va klient holati: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- `cookies()`: <https://nextjs.org/docs/app/api-reference/functions/cookies>
- TanStack Query + RSC: <https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr>
