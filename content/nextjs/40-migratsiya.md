# 40 — Pages → App migratsiyasi

[← Oldingi: API Routes](39-api-routes.md) · [Mundarija](README.md) · [Keyingi: Eski loyihani o'qish →](41-eski-loyiha.md)

## Tushuncha

Ishlab turgan Pages Router loyihasi bor. Uni App Router'ga o'tkazish kerak — yoki kerak emas. Bu bob ikkala savolga ham javob beradi.

Asosiy xushxabar: **ikkala router bir loyihada birga yashaydi.** Migratsiya bir kechada emas, bir necha oyda, sahifa-sahifa boradi.

```
Loyiha migratsiya davrida:

app/                    pages/
├── layout.tsx          ├── dashboard/
├── (new)/              │   └── index.tsx      ← hali ko'chirilmagan
│   ├── blog/           ├── settings.tsx        ← hali ko'chirilmagan
│   └── about/          └── api/
└── api/                    └── legacy.ts
    └── orders/
```

Qoida bitta: **bir yo'l faqat bitta routerda bo'lsin.**

## Nega shunday

Migratsiya arziydimi? Halol javob — **har doim emas**.

| Vaziyat | Migratsiya |
| --- | --- |
| Katta klient bundle, sekin sahifalar | ✅ Arziydi |
| Ma'lumot olish waterfall'lari | ✅ Arziydi |
| Ichma-ich layout kerak | ✅ Arziydi |
| Yangi funksiyalar faol qo'shilyapti | ✅ Arziydi (yangilarini App'da) |
| Barqaror, kam o'zgaradigan loyiha | ⚠️ Shart emas |
| Kichik jamoa, boshqa ustuvorliklar | ⚠️ Kutish mumkin |
| Loyiha 6 oydan keyin yopiladi | ❌ Arzimaydi |

Pages Router **o'chirilmaydi**. Next jamoasi uni qo'llab-quvvatlashda davom etadi. "Eskirgan" degani "ishlamaydi" degani emas.

Agar migratsiya qilsangiz, foyda o'lchanadigan bo'lsin: bundle hajmi, LCP, TTFB. "Zamonaviyroq" — o'lchov emas.

## Kod: 1-qadam — `app/` ni yonma-yon qo'shish

`app/` papkasi yaratilishi bilan Next uni taniydi. Hech narsa buzilmaydi — `pages/` ishlashda davom etadi.

::: ts
```tsx
// app/layout.tsx — birinchi fayl (majburiy)
import type { Metadata } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
  description: 'Onlayn do\'kon',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
```
:::

::: js
```jsx
// app/layout.jsx
import '@/styles/globals.css'

export const metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
  description: 'Onlayn do\'kon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>{children}</body>
    </html>
  )
}
```
:::

**Diqqat:** `app/layout.tsx` da `<html>` va `<body>` bo'lsa, `pages/_document.tsx` faqat `pages/` yo'llariga ta'sir qiladi. Ikkalasi mustaqil ishlaydi.

Global CSS ikkala joyda import qilinmasin — bir marta, `app/layout.tsx` da (yangi yo'llar uchun) va `pages/_app.tsx` da (eski yo'llar uchun) alohida bo'lishi normal.

## Kod: 2-qadam — provayderlarni ko'chirish

`_app.tsx` dagi provayderlar (TanStack Query, tema, i18n) — klient komponentlar. Ularni alohida faylga chiqaring:

::: ts
```tsx
// app/providers.tsx
'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/lib/theme'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  )
}
```

```tsx
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>{children}</Providers>
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

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

// app/layout.jsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body><Providers>{children}</Providers></body>
    </html>
  )
}
```
:::

`new QueryClient()` ni `useState` ichida yaratish majburiy — aks holda har render yangi klient bo'ladi va kesh yo'qoladi.

## Kod: 3-qadam — sahifani ko'chirish

Eng sodda sahifadan boshlang. Statik `about` yoki `pricing` — ideal.

**Oldin (Pages):**

::: ts
```tsx
// pages/about.tsx
import Head from 'next/head'
import type { GetStaticProps } from 'next'

type Props = { team: Member[] }

export default function AboutPage({ team }: Props) {
  return (
    <>
      <Head>
        <title>Biz haqimizda — Do'kon</title>
        <meta name="description" content="Jamoa va tarix" />
      </Head>

      <Layout>
        <h1>Biz haqimizda</h1>
        <TeamGrid members={team} />
      </Layout>
    </>
  )
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const team = await getTeam()

  return { props: { team }, revalidate: 3600 }
}

AboutPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>
```
:::

::: js
```jsx
// pages/about.jsx
import Head from 'next/head'

export default function AboutPage({ team }) {
  return (
    <>
      <Head><title>Biz haqimizda — Do'kon</title></Head>
      <h1>Biz haqimizda</h1>
      <TeamGrid members={team} />
    </>
  )
}

export async function getStaticProps() {
  return { props: { team: await getTeam() }, revalidate: 3600 }
}

AboutPage.getLayout = (page) => <MarketingLayout>{page}</MarketingLayout>
```
:::

**Keyin (App):**

::: ts
```tsx
// app/(marketing)/layout.tsx — getLayout o'rniga
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  )
}
```

```tsx
// app/(marketing)/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Biz haqimizda',                  // template avtomatik qo'shadi
  description: 'Jamoa va tarix',
}

export const revalidate = 3600             // getStaticProps.revalidate o'rniga

export default async function AboutPage() {
  const team = await getTeam()             // props o'rniga to'g'ridan-to'g'ri

  return (
    <>
      <h1>Biz haqimizda</h1>
      <TeamGrid members={team} />
    </>
  )
}
```
:::

::: js
```jsx
// app/(marketing)/layout.jsx
export default function MarketingLayout({ children }) {
  return (
    <>
      <MarketingHeader />
      <main>{children}</main>
      <MarketingFooter />
    </>
  )
}

// app/(marketing)/about/page.jsx
export const metadata = { title: 'Biz haqimizda', description: 'Jamoa va tarix' }
export const revalidate = 3600

export default async function AboutPage() {
  const team = await getTeam()

  return (
    <>
      <h1>Biz haqimizda</h1>
      <TeamGrid members={team} />
    </>
  )
}
```
:::

Keyin `pages/about.tsx` ni **o'chiring** — shu commit'da.

## Kod: 4-qadam — `"use client"` chegarasini topish

Eng ko'p vaqt oladigan qism. Ko'chirilgan komponent hook ishlatsa, build sinadi:

```
Error: You're importing a component that needs `useState`.
This React hook only works in a Client Component.
```

Ikki yo'l bor:

**Yomon yo'l** — sahifaga `"use client"` qo'yish. Butun daraxt klientga tushadi, foyda yo'qoladi.

**To'g'ri yo'l** — chegarani pastga tushirish:

::: ts
```tsx
// ❌ Butun sahifa klientda
'use client'

export default function ProductsPage() {
  const [filter, setFilter] = useState('')
  const products = useProducts()               // klientda fetch

  return (
    <>
      <input value={filter} onChange={(e) => setFilter(e.target.value)} />
      <ProductGrid products={products} filter={filter} />
    </>
  )
}

// ✅ Faqat interaktiv qism klientda
// app/products/page.tsx — SERVER
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const products = await getProducts(q)        // serverda, bazadan

  return (
    <>
      <SearchInput defaultValue={q} />          {/* kichik klient komponent */}
      <ProductGrid products={products} />       {/* server komponent */}
    </>
  )
}

// app/products/SearchInput.tsx — KLIENT
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDeferredValue, useState, useEffect } from 'react'

export function SearchInput({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue)
  const deferred = useDeferredValue(value)
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const next = new URLSearchParams(params)

    deferred ? next.set('q', deferred) : next.delete('q')

    router.replace(`?${next}`, { scroll: false })
  }, [deferred])

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```
:::

::: js
```jsx
// app/products/page.jsx — SERVER
export default async function ProductsPage({ searchParams }) {
  const { q } = await searchParams
  const products = await getProducts(q)

  return (
    <>
      <SearchInput defaultValue={q} />
      <ProductGrid products={products} />
    </>
  )
}

// app/products/SearchInput.jsx — KLIENT
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDeferredValue, useState, useEffect } from 'react'

export function SearchInput({ defaultValue = '' }) {
  const [value, setValue] = useState(defaultValue)
  const deferred = useDeferredValue(value)
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const next = new URLSearchParams(params)

    deferred ? next.set('q', deferred) : next.delete('q')

    router.replace(`?${next}`, { scroll: false })
  }, [deferred])

  return <input value={value} onChange={(e) => setValue(e.target.value)} />
}
```
:::

Bu qadam migratsiyaning **asosiy qiymati**: bundle shu yerda kichrayadi.

## Kod: 5-qadam — router API'sini almashtirish

::: ts
```tsx
// ❌ Pages
import { useRouter } from 'next/router'

const router = useRouter()
const { id } = router.query
const path = router.pathname
const full = router.asPath

router.push('/orders')
router.replace(router.asPath)                 // "yangilash"
router.events.on('routeChangeStart', handler)

// ✅ App
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'

const router = useRouter()
const params = useParams()                     // { id: '42' }
const path = usePathname()                     // '/orders/42'
const search = useSearchParams()               // ReadonlyURLSearchParams

router.push('/orders')
router.refresh()                               // server komponentni qayta so'raydi
// router.events — YO'Q. usePathname/useSearchParams effekti bilan almashtiriladi
```
:::

::: js
```jsx
// ✅ App
import { useRouter, usePathname, useSearchParams, useParams } from 'next/navigation'

const router = useRouter()
const params = useParams()
const path = usePathname()
const search = useSearchParams()

router.push('/orders')
router.refresh()
```
:::

`router.events` yo'qoldi. Marshrut o'zgarishini kuzatish kerak bo'lsa:

::: ts
```tsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    analytics.page(pathname + (searchParams.size ? `?${searchParams}` : ''))
  }, [pathname, searchParams])

  return null
}
```
:::

::: js
```jsx
'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function RouteTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    analytics.page(pathname + (searchParams.size ? `?${searchParams}` : ''))
  }, [pathname, searchParams])

  return null
}
```
:::

`useSearchParams()` ishlatgan komponent `<Suspense>` bilan o'ralishi kerak — aks holda butun sahifa dinamik bo'ladi.

## Kod: 6-qadam — API Routes

39-bobdagi taqqoslash bo'yicha:

```
pages/api/orders/[id].ts   →   app/api/orders/[id]/route.ts
```

Ko'pincha bu **kerak emas**: sahifa ma'lumotni server komponentda oladi, forma Server Action ishlatadi. Endpoint faqat tashqi iste'molchi bo'lsa qoladi.

Eski API'ni saqlash kerak bo'lsa, uni o'z joyida qoldiring — `pages/api/` App Router bilan muammosiz ishlaydi.

## Kod: migratsiya tartibi

Amalda ishlaydigan ketma-ketlik:

| Qadam | Nima | Xavf |
| --- | --- | --- |
| 1 | `app/layout.tsx` + `providers.tsx` | Yo'q |
| 2 | Bitta statik sahifa (`/about`) | Past |
| 3 | Marketing bo'limi (`(marketing)` guruhi) | Past |
| 4 | Autentifikatsiya (`(auth)`) | O'rta |
| 5 | Ma'lumotli sahifalar, birma-bir | O'rta |
| 6 | Formalar → Server Actions | O'rta |
| 7 | Dashboard / murakkab bo'limlar | Yuqori |
| 8 | API Routes (kerak bo'lsa) | Past |
| 9 | `pages/_app`, `_document` o'chirish | Oxirgi |

Har qadamdan keyin: **deploy va o'lchash**. Bundle hajmi kamayayaptimi? LCP yaxshilandimi? Agar yo'q bo'lsa, chegarani noto'g'ri qo'ygansiz (4-qadam).

## Kod: qo'sh kod va tekshiruv

Migratsiya davrida ikkala routerda ham ishlaydigan kod kerak bo'ladi:

::: ts
```ts
// lib/session.ts — ikkala routerda ishlaydi
import 'server-only'
import type { NextApiRequest } from 'next'

/** App Router: cookies() bilan */
export async function getSessionFromCookies() {
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get('access_token')?.value

  return token ? verifyToken(token) : null
}

/** Pages Router: req bilan */
export async function getSessionFromRequest(request: NextApiRequest) {
  const token = request.cookies.access_token

  return token ? verifyToken(token) : null
}
```
:::

::: js
```js
// lib/session.js
import 'server-only'

export async function getSessionFromCookies() {
  const { cookies } = await import('next/headers')
  const token = (await cookies()).get('access_token')?.value

  return token ? verifyToken(token) : null
}

export async function getSessionFromRequest(request) {
  const token = request.cookies.access_token

  return token ? verifyToken(token) : null
}
```
:::

Biznes mantiq (`verifyToken`) bir joyda — faqat kirish nuqtasi ikki xil.

Tekshiruv ro'yxati har sahifa uchun:

```
□ Sahifa ochiladi, ma'lumot to'g'ri
□ Metadata to'g'ri (title, description, OG)
□ Klient bundle kichraydi (yoki kattalashmadi)
□ Yuklanish holati bor (loading.tsx)
□ Xato holati bor (error.tsx)
□ Auth tekshiruvi ishlaydi
□ Eski yo'l o'chirildi
□ Ichki havolalar ishlaydi
□ Kesh xatti-harakati kutilganday (18-bob)
```

## Muhandislik nuqtai nazari: eng ko'p uchraydigan to'siqlar

| To'siq | Sabab | Yechim |
| --- | --- | --- |
| "Hamma joyda `use client` kerak bo'lib qoldi" | Chegara yuqorida | Interaktiv qismni ajrating |
| Kontekst provayder ishlamaydi | Server komponent kontekst o'qiy olmaydi | Provayderni klient faylga, ma'lumotni props bilan |
| `window is not defined` | Server komponentda brauzer API | `"use client"` yoki `useEffect` |
| CSS-in-JS sinadi | Emotion/styled-components RSC'ni qo'llamaydi | CSS Modules, Tailwind yoki `next/dynamic` |
| Sahifa dinamik bo'lib qoldi | `cookies()`/`headers()` chaqirilgan | Kerak bo'lsa normal (03-bob) |
| Ma'lumot yangilanmaydi | Kesh | `revalidatePath`, `no-store` (18, 19-bob) |
| `useSearchParams` build'ni sindiradi | `Suspense` yo'q | `<Suspense>` bilan o'rang |
| Redirect ishlamaydi | `try/catch` ichida | Tashqarida (07-bob) |
| Hydration xatosi | Server/klient farqi | `suppressHydrationWarning` yoki sabab topish |

CSS-in-JS alohida og'riq: Emotion va styled-components server komponentlarda ishlamaydi. Katta loyihada bu **eng qimmat** qism bo'lishi mumkin — migratsiyani rejalashtirishda uni alohida baholang.

## Muhandislik nuqtai nazari: `next/dynamic` va `ssr: false`

Pages Router'da keng ishlatilgan naqsh:

::: ts
```tsx
// Pages'da ishlaydi
const Map = dynamic(() => import('@/components/Map'), { ssr: false })
```
:::

::: js
```jsx
const Map = dynamic(() => import('@/components/Map'), { ssr: false })
```
:::

App Router'da `ssr: false` **server komponentda ishlamaydi** — u faqat klient komponent ichida ruxsat etiladi:

::: ts
```tsx
// app/map/MapLoader.tsx
'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="map-skeleton" />,
})

export function MapLoader(props: MapProps) {
  return <Map {...props} />
}
```
:::

::: js
```jsx
// app/map/MapLoader.jsx
'use client'

import dynamic from 'next/dynamic'

const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="map-skeleton" />,
})

export function MapLoader(props) {
  return <Map {...props} />
}
```
:::

Ya'ni bir qatlam ko'proq: server sahifa → klient loader → dinamik komponent.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Hammasini bir vaqtda ko'chirish | Oylab sinmagan branch | Sahifa-sahifa, deploy bilan |
| Eski faylni o'chirmaslik | Yo'l to'qnashuvi | Bir commit'da o'chiring |
| Sahifaga `"use client"` | Foyda yo'qoladi | Chegarani pastga |
| `next/router` ni qoldirish | Ishlamaydi | `next/navigation` |
| `next/head` ni qoldirish | Metadata chiqmaydi | `metadata` eksporti |
| `getLayout` ni saqlash | Keraksiz murakkablik | `layout.tsx` |
| `useSearchParams` ni `Suspense` siz | Build ogohlantirishi | O'rang |
| Kesh xatti-harakatini tekshirmaslik | Eski ma'lumot | 18-bobni qayta o'qing |
| O'lchamasdan ko'chirish | Foyda bormi — noma'lum | Bundle va Web Vitals |
| CSS-in-JS'ni rejaga qo'shmaslik | Kutilmagan katta ish | Oldindan baholang |

## Amaliyot

1. Mavjud Pages loyihasiga `app/layout.tsx` qo'shing — hech narsa buzilmasligini tasdiqlang.
2. Bitta statik sahifani ko'chiring, eski faylni o'chiring, deploy qiling.
3. Ko'chirishdan oldin va keyin `next build` chiqishidagi First Load JS ni yozib oling.
4. Ma'lumotli sahifani ko'chiring: `getServerSideProps` → `async` komponent.
5. Interaktiv sahifani ko'chiring va `"use client"` chegarasini iloji boricha pastga tushiring.
6. `router.events` ishlatadigan analitikani `usePathname` + `useSearchParams` ga o'tkazing.
7. Migratsiya rejasini yozing: qaysi sahifa qaysi tartibda, har biriga taxminiy vaqt.

## Rasmiy hujjat

- Migratsiya qo'llanmasi: <https://nextjs.org/docs/app/guides/migrating/app-router-migration>
- `next/navigation`: <https://nextjs.org/docs/app/api-reference/functions/use-router>
- `next/dynamic`: <https://nextjs.org/docs/app/api-reference/functions/dynamic>
- Metadata: <https://nextjs.org/docs/app/api-reference/functions/generate-metadata>
