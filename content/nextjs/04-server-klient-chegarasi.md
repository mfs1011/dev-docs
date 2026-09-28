# 04 — Server va klient chegarasi

[← Oldingi: Render strategiyalari](03-render-strategiyalari.md) · [Mundarija](README.md) · [Keyingi: TypeScript va konfiguratsiya →](05-typescript-konfiguratsiya.md)

## Tushuncha

Bu — Next'dagi eng ko'p chalkashlik keltiradigan mavzu. Qoida oddiy:

> **`app/` ichidagi hamma komponent standart holda Server Component.** Klient komponenti bo'lishi uchun fayl boshida `'use client'` yozilishi kerak.

| | Server Component | Client Component |
| --- | --- | --- |
| Qayerda ishlaydi | Faqat serverda | Serverda (SSR) + brauzerda |
| JS bundle'ga tushadimi | ❌ Yo'q | ✅ Ha |
| `async`/`await` | ✅ Ha | ❌ Yo'q (`use()` bilan) |
| `useState`, `useEffect` | ❌ Yo'q | ✅ Ha |
| `onClick`, `onChange` | ❌ Yo'q | ✅ Ha |
| Bazaga to'g'ridan-to'g'ri murojaat | ✅ Ha | ❌ Yo'q |
| `window`, `localStorage` | ❌ Yo'q | ✅ Ha (effektda) |
| Context o'qish | ❌ Yo'q | ✅ Ha |
| Sirlar (`process.env.SECRET`) | ✅ Xavfsiz | ❌ Ochiladi |

## Kod: `'use client'` nimani anglatadi

```tsx
'use client'
```

Bu **"bu komponent brauzerda ishlaydi"** degani emas — aniqrog'i: **"bu fayldan boshlanadigan import grafi klient bundle'iga kiradi"**.

```
app/page.tsx                 (server)
 └── components/Chart.tsx    'use client'  ← chegara shu yerda
      └── lib/format.ts      → klient bundle'iga kiradi
      └── chart.js           → klient bundle'iga kiradi (300 KB!)
```

Shuning uchun `'use client'` ni **imkon qadar pastga** (barglarga) qo'ying: yuqorida qo'ysangiz, butun daraxt klientga ketadi.

## Kod: noto'g'ri va to'g'ri joylashtirish

::: ts
```tsx
// ✗ Butun sahifa klientga ketadi
'use client'

import { useState } from 'react'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const products = useProducts(query)          // klientda so'rov

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ProductGrid products={products} />       {/* bu ham klientga ketdi */}
    </>
  )
}
```
:::

::: js
```jsx
// ✗ Butun sahifa klientga ketadi
'use client'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const products = useProducts(query)

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ProductGrid products={products} />
    </>
  )
}
```
:::

::: ts
```tsx
// ✓ Sahifa serverda, faqat qidiruv inputi klientda
// app/products/page.tsx  (server)
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const products = await db.product.findMany({ where: { title: { contains: q } } })

  return (
    <>
      <SearchInput defaultValue={q} />          {/* klient komponenti */}
      <ProductGrid products={products} />       {/* server — JS yuborilmaydi */}
    </>
  )
}

// components/SearchInput.tsx  (klient)
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const params = useSearchParams()

  return (
    <input
      defaultValue={defaultValue}
      onChange={(e) => {
        const next = new URLSearchParams(params)

        next.set('q', e.target.value)
        router.replace(`?${next}`)
      }}
    />
  )
}
```
:::

::: js
```jsx
// ✓ app/products/page.jsx  (server)
export default async function ProductsPage({ searchParams }) {
  const { q = '' } = await searchParams
  const products = await db.product.findMany({ where: { title: { contains: q } } })

  return (
    <>
      <SearchInput defaultValue={q} />
      <ProductGrid products={products} />
    </>
  )
}

// components/SearchInput.jsx  (klient)
'use client'

export function SearchInput({ defaultValue }) {
  const router = useRouter()
  const params = useSearchParams()

  return (
    <input
      defaultValue={defaultValue}
      onChange={(e) => {
        const next = new URLSearchParams(params)

        next.set('q', e.target.value)
        router.replace(`?${next}`)
      }}
    />
  )
}
```
:::

## Kod: kompozitsiya — server komponentni klient ichiga qo'yish

Klient komponent server komponentni **import qila olmaydi**, lekin uni **`children` sifatida qabul qila oladi**:

::: ts
```tsx
// ✗ Klient fayl ichida server komponentni import qilish
'use client'

import { ServerChart } from './ServerChart'    // ✗ u ham klientga aylanadi

// ✓ children orqali uzatish
// components/Accordion.tsx (klient)
'use client'

export function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && children}                        {/* mazmun serverda render qilingan */}
    </div>
  )
}

// app/page.tsx (server)
export default async function Page() {
  const stats = await getStats()

  return (
    <Accordion title="Statistika">
      <ServerChart data={stats} />              {/* server komponenti! */}
    </Accordion>
  )
}
```
:::

::: js
```jsx
// components/Accordion.jsx (klient)
'use client'

export function Accordion({ title, children }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setOpen(!open)}>{title}</button>
      {open && children}
    </div>
  )
}

// app/page.jsx (server)
export default async function Page() {
  const stats = await getStats()

  return (
    <Accordion title="Statistika">
      <ServerChart data={stats} />
    </Accordion>
  )
}
```
:::

Bu — **eng muhim naqsh**: interaktiv o'ram klientda, mazmun serverda. React qo'llanmasining 14-bobidagi kompozitsiya g'oyasi shu yerda ayniqsa kuchli ishlaydi.

## Kod: props orqali nima uzatish mumkin

Server → klient props **seriyalanadigan** bo'lishi kerak:

```tsx
// ✓ Mumkin
<ClientComp
  text="salom"
  count={5}
  items={[{ id: 1 }]}
  date={new Date()}          // Date — mumkin
  map={new Map()}            // Map, Set — mumkin
/>

// ✗ Mumkin emas
<ClientComp
  onSave={() => {}}          // funksiya (Server Action bundan mustasno — 21-bob)
  instance={new Chart()}     // sinf nusxasi
  el={document.body}         // DOM
  symbol={Symbol('x')}
/>
```

Xato xabari: *"Functions cannot be passed directly to Client Components"*.

## Kod: brauzer API'lari

```tsx
// ✗ Server komponentda
const width = window.innerWidth            // ReferenceError: window is not defined

// ✓ Klient komponentda, effekt ichida
'use client'

const [width, setWidth] = useState(0)

useEffect(() => setWidth(window.innerWidth), [])

// ✓ Yoki dinamik import bilan (butun komponent klientda)
const Map = dynamic(() => import('./Map'), { ssr: false })
```

Hydration mismatch'dan qochish (React qo'llanmasi, 05-bob mantiqi):

```tsx
'use client'

// ✗ Server va klientda boshqa natija
const id = Math.random()
const now = new Date().toLocaleTimeString()

// ✓
const id = useId()
const [now, setNow] = useState<string | null>(null)

useEffect(() => setNow(new Date().toLocaleTimeString()), [])
```

## Kod: provider'lar

Context faqat klientda ishlaydi, shuning uchun provider'lar alohida klient faylida bo'ladi:

::: ts
```tsx
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}

// app/layout.tsx (server)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>      {/* children — server komponentlar */}
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// app/providers.jsx
'use client'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
```
:::

Diqqat: `new QueryClient()` **`useState` ichida** yaratiladi — aks holda har so'rovda bir xil nusxa foydalanuvchilar orasida bo'lishiladi.

## Kod: `server-only` va `client-only`

Tasodifan sirni klientga olib chiqmaslik uchun:

```bash
npm i server-only client-only
```

```ts
// lib/db.ts
import 'server-only'          // klient faylidan import qilinsa — BUILD XATOSI

export const db = new PrismaClient()
```

```ts
// lib/analytics.ts
import 'client-only'          // serverdan import qilinsa — build xatosi

export function track(event: string) { window.gtag?.('event', event) }
```

Bu — 45-bobdagi xavfsizlik qatlamlaridan biri va uni **boshidanoq** qo'shish arziydi.

## Muhandislik nuqtai nazari: chegara qayerda bo'lishi kerak

Amaliy qoida: **`'use client'` — barglarda.**

```
app/products/page.tsx              server   ← ma'lumot
├── ProductFilters.tsx             client   ← interaktiv
├── ProductGrid.tsx                server   ← faqat ko'rinish
│   └── ProductCard.tsx            server
│       └── AddToCartButton.tsx    client   ← interaktiv
└── Pagination.tsx                 client
```

Har `'use client'` — bundle'ga qo'shimcha. Katta ilovada bu farq 100–300 KB bo'lishi mumkin.

Tekshirish: `npm run build` chiqishida "First Load JS" ustunini kuzating (43-bob).

## Muhandislik nuqtai nazari: qachon klient komponent kerak

| Ehtiyoj | Klient kerakmi |
| --- | --- |
| `onClick`, `onChange`, forma | ✅ Ha |
| `useState`, `useReducer` | ✅ Ha |
| `useEffect`, brauzer API | ✅ Ha |
| Context (o'qish yoki berish) | ✅ Ha |
| Animatsiya kutubxonalari | ✅ Ha |
| Faqat ma'lumot ko'rsatish | ❌ Yo'q |
| Sana formatlash, matn ishlash | ❌ Yo'q |
| Server ma'lumotini olish | ❌ Yo'q (server komponentda `await`) |
| Havola (`<Link>`) | ❌ Yo'q (u server komponentda ishlaydi) |

## Muhandislik nuqtai nazari: mental model

Eng foydali tasavvur:

> Server komponentlar — **shablon dvigateli** (Blade/Twig kabi), klient komponentlar — **vidjetlar** (React orollari).

Server komponent bir marta ishlaydi va HTML chiqaradi; klient komponent shu HTML ichida jonlanadi va foydalanuvchi bilan muloqot qiladi.

Shu modeldan kelib chiqadi: ma'lumot — serverda, interaktivlik — klientda, ular orasidagi chegara — props (seriyalanadigan).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `'use client'` ni sahifa boshiga qo'yish | Butun daraxt klientga ketadi | Barglarga qo'ying |
| Klient faylida server komponentni import qilish | U ham klientga aylanadi | `children` orqali uzating |
| Server komponentga `onClick` berish | Xato: funksiya seriyalanmaydi | Klient komponenti |
| Server komponentda `useState` | Hooklar faqat klientda | `'use client'` yoki holatni pastga |
| `window` ni server komponentda o'qish | `ReferenceError` | Effekt yoki `ssr: false` |
| `new QueryClient()` ni modul darajasida | Foydalanuvchilar keshi aralashadi | `useState(() => ...)` |
| Sirni klient faylidan import qilish | Bundle'da ochiq | `server-only` |
| Hydration mismatch (`Math.random`, `Date`) | Konsolda xato, qayta render | `useId`, effekt |

## Amaliyot

1. Sahifani server komponent qilib yozing va unga bitta klient tugma qo'shing; `npm run build` da "First Load JS" ni yozib oling.
2. Endi `'use client'` ni sahifa boshiga ko'chiring va bundle hajmini solishtiring.
3. Klient `Accordion` yozing va uning ichiga server komponentni `children` sifatida uzating.
4. Server komponentdan klientga funksiya uzatishga urinib ko'ring va xato xabarini o'qing.
5. `server-only` ni o'rnating va `lib/db.ts` ni klient komponentdan import qilishga urinib ko'ring.
6. `Math.random()` bilan hydration mismatch yarating va konsoldagi xabarni o'qing.

## Rasmiy hujjat

- Server va Client Components: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- Kompozitsiya naqshlari: <https://nextjs.org/docs/app/getting-started/server-and-client-components#interleaving-server-and-client-components>
- `server-only`: <https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning>
