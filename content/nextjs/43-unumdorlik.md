# 43 — Unumdorlik

[← Oldingi: Testlash](42-testlash.md) · [Mundarija](README.md) · [Keyingi: Erishimlilik →](44-erishimlilik.md)

## Tushuncha

Unumdorlik ustida ishlash uchta bosqichdan iborat: **o'lchash → sababni topish → tuzatish**. Ko'pchilik ikkinchisini o'tkazib yuboradi va taxmin bilan optimizatsiya qiladi.

Next ilovasida to'rtta asosiy joy bor:

```
1. Server javob vaqti (TTFB)     ← ma'lumot, kesh, waterfall
2. Klient bundle hajmi            ← "use client" chegarasi
3. Rasm va shrift                 ← LCP ning asosiy sababi
4. Render/interaktivlik           ← INP, uzun vazifalar
```

Har birining o'z o'lchovi va o'z vositasi bor.

## Nega shunday

Core Web Vitals — Google o'lchaydigan va reyting'ga ta'sir qiladigan uch ko'rsatkich:

| Ko'rsatkich | Nima o'lchaydi | Yaxshi | Yomon |
| --- | --- | --- | --- |
| **LCP** (Largest Contentful Paint) | Eng katta element qachon ko'rindi | < 2.5 s | > 4 s |
| **INP** (Interaction to Next Paint) | Bosishdan javobgacha | < 200 ms | > 500 ms |
| **CLS** (Cumulative Layout Shift) | Kontent qancha "sakradi" | < 0.1 | > 0.25 |

Yordamchi o'lchovlar:

| Ko'rsatkich | Nima | Nega muhim |
| --- | --- | --- |
| **TTFB** | Birinchi bayt | LCP ning poydevori |
| **First Load JS** | Birinchi yuklanadigan JS | INP va batareyaga ta'sir |
| **Hydration vaqti** | JS "tirilishi" | Sahifa ko'rinadi, lekin bosilmaydi |

Next'ning arxitekturasi LCP va bundle uchun yaxshi (server komponentlar), lekin **noto'g'ri ishlatilsa** ikkalasini ham buzadi.

## Kod: o'lchash

**1. Build chiqishi — birinchi o'rin:**

```bash
npm run build
```

```
Route (app)                              Size     First Load JS
┌ ○ /                                    1.2 kB          89.3 kB
├ ○ /about                               512 B           88.6 kB
├ ƒ /dashboard                           45.8 kB        134 kB     ← 🚩
├ ● /blog/[slug]                         2.1 kB          90.2 kB
└ ƒ /api/orders                          0 B                0 B
+ First Load JS shared by all            88.1 kB
  ├ chunks/framework-x.js                45.2 kB
  ├ chunks/main-x.js                     31.4 kB
  └ other shared chunks                  11.5 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML
ƒ  (Dynamic)  server-rendered on demand
```

O'qish:

- **`First Load JS`** — foydalanuvchi shu sahifaga birinchi kirganda yuklanadigan JS. 130 kB dan oshsa — tekshiring.
- **`○` / `●` / `ƒ`** — sahifa statikmi yoki dinamik. Statik bo'lishi kerak sahifa `ƒ` bo'lsa, biror joyda `cookies()` yoki `no-store` bor (03-bob).
- **Shared chunk** — hamma sahifada yuklanadi; u yerga katta kutubxona tushib qolmasin.

**2. Bundle tahlili:**

```bash
npm install -D @next/bundle-analyzer
```

::: ts
```ts
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

export default withBundleAnalyzer({
  // ... qolgan sozlamalar
})
```
:::

::: js
```js
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

export default withBundleAnalyzer({})
```
:::

```bash
ANALYZE=true npm run build
```

Brauzerda interaktiv xarita ochiladi. Qidiriladigan narsalar: `moment`, `lodash` (to'liq), `date-fns` (to'liq), ikki marta kirgan kutubxona, `@aws-sdk` klient bundle'da.

**3. Web Vitals — haqiqiy foydalanuvchilardan:**

::: ts
```tsx
// app/web-vitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Dev'da konsolga
    if (process.env.NODE_ENV === 'development') {
      console.log(metric.name, Math.round(metric.value), metric.rating)

      return
    }

    // Production'da analitikaga — sendBeacon sahifa yopilsa ham yuboradi
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      path: window.location.pathname,
    })

    navigator.sendBeacon?.('/api/vitals', body) ??
      fetch('/api/vitals', { body, method: 'POST', keepalive: true })
  })

  return null
}
```

```tsx
// app/layout.tsx
import { WebVitals } from './web-vitals'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <WebVitals />
        {children}
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// app/web-vitals.jsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(metric.name, Math.round(metric.value), metric.rating)

      return
    }

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
    })

    navigator.sendBeacon?.('/api/vitals', body)
  })

  return null
}
```
:::

**Lab (Lighthouse) va field (haqiqiy foydalanuvchi) ma'lumotlari farq qiladi.** Lighthouse — bitta tez kompyuter, tez internet. Foydalanuvchilaringiz — eski telefon, 3G. Faqat field ma'lumotiga qaror qiling.

## Kod: 1 — server javob vaqti (TTFB)

Eng ko'p uchraydigan sabab — **waterfall**:

::: ts
```tsx
// ❌ 3 ta so'rov navbat bilan: 300 ms
export default async function Page() {
  const user = await getUser()
  const orders = await getOrders(user.id)        // user ni kutadi — MAJBURIY
  const stats = await getStats()                 // hech narsani kutmaydi — ORTIQCHA

  return <Dashboard user={user} orders={orders} stats={stats} />
}

// ✅ Mustaqillarini parallel: 200 ms
export default async function Page() {
  const [user, stats] = await Promise.all([getUser(), getStats()])
  const orders = await getOrders(user.id)

  return <Dashboard user={user} orders={orders} stats={stats} />
}

// ✅✅ Yoki streaming bilan: TTFB ~20 ms
export default async function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </>
  )
}
```
:::

::: js
```jsx
// ✅ Parallel
export default async function Page() {
  const [user, stats] = await Promise.all([getUser(), getStats()])
  const orders = await getOrders(user.id)

  return <Dashboard user={user} orders={orders} stats={stats} />
}

// ✅✅ Streaming
export default async function Page() {
  return (
    <>
      <Suspense fallback={<UserSkeleton />}><UserSection /></Suspense>
      <Suspense fallback={<StatsSkeleton />}><StatsSection /></Suspense>
    </>
  )
}
```
:::

Streaming TTFB'ni deyarli nolga tushiradi: HTML darhol ketadi, bo'laklar keyin keladi (20-bob).

Baza tomonidagi sabablar (32, 33-bob): N+1, indekssiz `where`, `limit` yo'qligi. `log: ['query']` bilan sahifaga nechta so'rov ketayotganini sanang.

## Kod: 2 — bundle hajmi

**Eng katta g'alaba — `"use client"` chegarasini pastga tushirish:**

::: ts
```tsx
// ❌ Butun sahifa klientda: markdown parseri, sana kutubxonasi — hammasi bundle'da
'use client'

import { marked } from 'marked'                 // 45 kB
import { format } from 'date-fns'               // 20 kB

export default function PostPage({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false)     // ← FAQAT shu klientda kerak

  return (
    <article>
      <time>{format(post.date, 'dd MMMM yyyy')}</time>
      <div dangerouslySetInnerHTML={{ __html: marked(post.body) }} />
      <button onClick={() => setLiked(!liked)}>{liked ? '❤️' : '🤍'}</button>
    </article>
  )
}

// ✅ Parser va formatlash serverda qoladi: bundle'da faqat tugma
// app/blog/[slug]/page.tsx — SERVER
import { marked } from 'marked'
import { format } from 'date-fns'
import { LikeButton } from './LikeButton'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <time dateTime={post.date}>{format(new Date(post.date), 'dd MMMM yyyy')}</time>
      <div dangerouslySetInnerHTML={{ __html: marked(post.body) }} />
      <LikeButton postId={post.id} initial={post.likes} />
    </article>
  )
}

// app/blog/[slug]/LikeButton.tsx — KLIENT (~1 kB)
'use client'

export function LikeButton({ postId, initial }: { postId: number; initial: number }) {
  const [liked, setLiked] = useState(false)

  return <button onClick={() => setLiked(!liked)}>{liked ? '❤️' : '🤍'}</button>
}
```
:::

::: js
```jsx
// ✅ app/blog/[slug]/page.jsx — SERVER
import { marked } from 'marked'
import { format } from 'date-fns'
import { LikeButton } from './LikeButton'

export default async function PostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  return (
    <article>
      <time dateTime={post.date}>{format(new Date(post.date), 'dd MMMM yyyy')}</time>
      <div dangerouslySetInnerHTML={{ __html: marked(post.body) }} />
      <LikeButton postId={post.id} initial={post.likes} />
    </article>
  )
}
```
:::

65 kB → 1 kB. Bu App Router'ning asosiy foydasi (04, 16-bob).

**Og'ir komponentni kechiktirish:**

::: ts
```tsx
'use client'

import dynamic from 'next/dynamic'

// Faqat kerak bo'lganda yuklanadi
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div className="chart-skeleton" />,
  ssr: false,                                   // recharts SSR'da foyda bermaydi
})

const RichEditor = dynamic(() => import('@/components/RichEditor'), { ssr: false })

export function Dashboard({ data }: { data: Stats }) {
  const [showChart, setShowChart] = useState(false)

  return (
    <>
      <Summary data={data} />

      <button onClick={() => setShowChart(true)}>Grafikni ko'rsatish</button>

      {showChart && <Chart data={data} />}       {/* 180 kB faqat shu yerda */}
    </>
  )
}
```
:::

::: js
```jsx
'use client'

import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <div className="chart-skeleton" />,
  ssr: false,
})

export function Dashboard({ data }) {
  const [showChart, setShowChart] = useState(false)

  return (
    <>
      <Summary data={data} />
      <button onClick={() => setShowChart(true)}>Grafikni ko'rsatish</button>
      {showChart && <Chart data={data} />}
    </>
  )
}
```
:::

**Kutubxonalarni almashtirish:**

| Og'ir | Hajm | Yengil almashtiruv | Hajm |
| --- | --- | --- | --- |
| `moment` | 72 kB | `date-fns` (tanlab) yoki `Intl` | 2 kB / 0 |
| `lodash` | 71 kB | `lodash-es` + tanlab import | 2–5 kB |
| `axios` | 13 kB | `fetch` | 0 |
| `uuid` | 5 kB | `crypto.randomUUID()` | 0 |
| `classnames` | 0.5 kB | `clsx` | 0.2 kB |
| `recharts` | 180 kB | Dinamik import yoki server SVG | 0 dastlab |

Ko'p holatda platformaning o'zi yetarli:

::: ts
```ts
// ❌ import { format } from 'date-fns'
// ✅
new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'long' }).format(date)

// ❌ import { v4 as uuid } from 'uuid'
// ✅
crypto.randomUUID()

// ❌ import { debounce } from 'lodash'
// ✅ 5 qator o'zingiz yozasiz, yoki useDeferredValue
```
:::

::: js
```js
new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'long' }).format(date)

crypto.randomUUID()
```
:::

**Barrel fayllar (`index.ts` re-export) — yashirin sabab:**

```ts
// components/index.ts
export * from './Button'
export * from './Chart'        // 180 kB
export * from './Editor'       // 90 kB
```

```ts
// Bitta tugma import qilsangiz ham, hammasi tahlil qilinadi
import { Button } from '@/components'
```

Yechim — to'g'ridan-to'g'ri import, yoki Next sozlamasi:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', 'lucide-react', '@mui/icons-material'],
  },
}
```
:::

::: js
```js
const config = {
  experimental: {
    optimizePackageImports: ['@/components', 'lucide-react'],
  },
}
```
:::

## Kod: 3 — rasm va shrift

**LCP elementi deyarli har doim rasm.** Uni to'g'ri berish — eng katta LCP g'alabasi:

::: ts
```tsx
import Image from 'next/image'
import hero from '@/public/hero.jpg'            // statik import — o'lcham avtomatik

export default function Home() {
  return (
    <>
      {/* LCP rasmi — priority MAJBURIY */}
      <Image
        src={hero}
        alt="Bosh sahifa banneri"
        priority                                 // preload qilinadi, lazy emas
        placeholder="blur"                       // statik importda blur avtomatik
        sizes="100vw"
        className="hero"
      />

      {/* Pastdagi rasmlar — lazy (sukut bo'yicha) */}
      <Image
        src={product.image}
        alt={product.title}
        width={400}
        height={300}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
        quality={80}
      />
    </>
  )
}
```
:::

::: js
```jsx
import Image from 'next/image'
import hero from '@/public/hero.jpg'

export default function Home() {
  return (
    <>
      <Image src={hero} alt="Bosh sahifa banneri" priority placeholder="blur" sizes="100vw" />

      <Image
        src={product.image}
        alt={product.title}
        width={400}
        height={300}
        sizes="(max-width: 768px) 100vw, 400px"
        quality={80}
      />
    </>
  )
}
```
:::

Uchta qoida:

1. **`priority`** — faqat LCP rasmiga (sahifada 1 ta). Hammasiga qo'ysangiz, foyda yo'qoladi.
2. **`sizes`** — responsive rasmlarda majburiy. Usiz brauzer eng katta variantni yuklaydi.
3. **`width`/`height`** yoki `fill` — har doim. Usiz CLS bo'ladi.

**Shrift — CLS va LCP ning ikkinchi sababi:**

::: ts
```ts
// app/fonts.ts
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

export const inter = Inter({
  subsets: ['latin', 'cyrillic-ext'],
  display: 'swap',                               // matn darhol ko'rinadi
  variable: '--font-inter',
  preload: true,
  adjustFontFallback: true,                      // fallback metrikasi moslashtiriladi — CLS 0
})

export const brand = localFont({
  src: [
    { path: '../public/fonts/Brand-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../public/fonts/Brand-Bold.woff2', weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-brand',
})
```

```tsx
// app/layout.tsx
import { inter, brand } from './fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} ${brand.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```
:::

::: js
```js
// app/fonts.js
import { Inter } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: true,
})

// app/layout.jsx
import { inter } from './fonts'

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```
:::

`next/font` shriftni **build vaqtida yuklab oladi** va o'z domeningizdan beradi: Google'ga so'rov yo'q, `preconnect` kerak emas, maxfiylik yaxshiroq.

`adjustFontFallback` — fallback shrift metrikasini asosiy shriftga moslashtiradi. Shrift yuklanganda matn "sakramaydi" (CLS = 0).

## Kod: 4 — INP va uzun vazifalar

INP yomon bo'lsa, sabab odatda **asosiy oqimni bloklaydigan JS**:

::: ts
```tsx
'use client'

import { useState, useDeferredValue, useMemo, useTransition } from 'react'

export function ProductFilter({ products }: { products: Product[] }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)       // kiritish darhol, filtr keyin

  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(deferred.toLowerCase())),
    [products, deferred],
  )

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ProductGrid products={filtered} />
    </>
  )
}
```
:::

::: js
```jsx
'use client'

import { useState, useDeferredValue, useMemo } from 'react'

export function ProductFilter({ products }) {
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)

  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(deferred.toLowerCase())),
    [products, deferred],
  )

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ProductGrid products={filtered} />
    </>
  )
}
```
:::

Katta ro'yxat uchun **virtualizatsiya**:

::: ts
```tsx
'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function BigList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtual) => (
          <div
            key={virtual.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtual.start}px)`,
              height: virtual.size,
              width: '100%',
            }}
          >
            <Row item={items[virtual.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```
:::

::: js
```jsx
'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

export function BigList({ items }) {
  const parentRef = useRef(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 64,
    overscan: 5,
  })

  return (
    <div ref={parentRef} style={{ height: 600, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtual) => (
          <div
            key={virtual.key}
            style={{ position: 'absolute', transform: `translateY(${virtual.start}px)` }}
          >
            <Row item={items[virtual.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```
:::

Lekin avval so'rang: **1000 qator kerakmi?** Sahifalash (32-bob) ko'pincha to'g'riroq javob.

**Uchinchi tomon skriptlari** — INP ning eng ko'p e'tibordan chetda qoladigan sababi:

::: ts
```tsx
import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        {children}

        {/* Sahifa interaktiv bo'lgandan KEYIN yuklanadi */}
        <Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />

        {/* Bo'sh vaqtda — chat, heatmap kabi kechiktirilishi mumkin bo'lganlar */}
        <Script src="https://chat.example.com/widget.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
import Script from 'next/script'

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}
        <Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />
        <Script src="https://chat.example.com/widget.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
```
:::

| `strategy` | Qachon yuklanadi | Nimaga |
| --- | --- | --- |
| `beforeInteractive` | Hydration'dan oldin | Faqat kritik (bot himoyasi) |
| `afterInteractive` (sukut) | Hydration'dan keyin | Analitika, teglar |
| `lazyOnload` | Bo'sh vaqtda | Chat, heatmap, reklama |
| `worker` | Web Worker'da (eksperimental) | Og'ir skriptlar |

## Kod: prefetch va navigatsiya

::: ts
```tsx
import Link from 'next/link'

// Sukut bo'yicha: ko'rinish maydoniga kirganda prefetch
<Link href="/products">Mahsulotlar</Link>

// Prefetch'ni o'chirish — ro'yxatda 500 ta havola bo'lsa
<Link href={`/products/${id}`} prefetch={false}>{title}</Link>

// Hover'da prefetch — ro'yxat uchun oltin o'rta
'use client'

export function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  const router = useRouter()

  return (
    <Link href={href} prefetch={false} onMouseEnter={() => router.prefetch(href)}>
      {children}
    </Link>
  )
}
```
:::

::: js
```jsx
import Link from 'next/link'

<Link href="/products">Mahsulotlar</Link>

<Link href={`/products/${id}`} prefetch={false}>{title}</Link>

// Hover'da
'use client'

export function SmartLink({ href, children }) {
  const router = useRouter()

  return (
    <Link href={href} prefetch={false} onMouseEnter={() => router.prefetch(href)}>
      {children}
    </Link>
  )
}
```
:::

500 ta havolali sahifada sukut bo'yicha prefetch — 500 ta so'rov. `prefetch={false}` + hover — 2–3 ta.

## Muhandislik nuqtai nazari: kesh — eng katta g'alaba

Optimizatsiyadan oldin savol: **bu sahifa umuman dinamik bo'lishi kerakmi?**

| Sahifa | Ko'pincha | Bo'lishi kerak |
| --- | --- | --- |
| Marketing, blog | Dinamik (sabab: layout'da `cookies()`) | Statik |
| Mahsulot sahifasi | Dinamik | ISR (`revalidate`) |
| Kategoriya ro'yxati | Dinamik | ISR |
| Dashboard | Dinamik | Dinamik ✅ |
| Buyurtmalar | Dinamik | Dinamik ✅ |

Eng ko'p uchraydigan xato: **root layout'da `cookies()` chaqirish**. Bu **butun ilovani** dinamik qiladi.

::: ts
```tsx
// ❌ app/layout.tsx — butun sayt dinamik bo'ladi
export default async function RootLayout({ children }) {
  const session = await verifySession()          // cookies() → hamma sahifa ƒ

  return (
    <html>
      <body>
        <Header user={session?.user} />
        {children}
      </body>
    </html>
  )
}

// ✅ Header'ni Suspense bilan ajrating
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Suspense fallback={<HeaderSkeleton />}>
          <UserHeader />                          {/* faqat shu dinamik */}
        </Suspense>
        {children}
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// ✅
export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Suspense fallback={<HeaderSkeleton />}>
          <UserHeader />
        </Suspense>
        {children}
      </body>
    </html>
  )
}
```
:::

`npm run build` chiqishida `○` belgilari `ƒ` ga aylangan bo'lsa — shu muammo.

## Muhandislik nuqtai nazari: byudjet va CI

O'lchov faqat qo'lda qilinsa, regressiya sezilmay o'tadi. Byudjet qo'ying:

```yaml
# .github/workflows/perf.yml
name: Unumdorlik

on: pull_request

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22, cache: npm }

      - run: npm ci && npm run build

      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/products
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

```json
[
  {
    "path": "/*",
    "resourceSizes": [
      { "resourceType": "script", "budget": 150 },
      { "resourceType": "total", "budget": 500 }
    ],
    "timings": [
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "cumulative-layout-shift", "budget": 100 }
    ]
  }
]
```

Byudjet buzilsa, PR qizil bo'ladi. Bu "keyinroq optimizatsiya qilamiz" ni to'xtatadi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| O'lchamasdan optimizatsiya | Vaqt isrof, natija yo'q | Avval profil |
| Root layout'da `cookies()` | Butun sayt dinamik | `Suspense` bilan ajrating |
| Sahifaga `"use client"` | Butun daraxt bundle'da | Chegarani pastga |
| LCP rasmiga `priority` yo'q | LCP 2 s kechikadi | `priority` |
| `sizes` yo'q | Eng katta rasm yuklanadi | `sizes` bering |
| `width`/`height` yo'q | CLS | Har doim o'lcham |
| Shriftni CSS'dan yuklash | CLS, tashqi so'rov | `next/font` |
| Ketma-ket `await` | Waterfall | `Promise.all` / `Suspense` |
| 500 ta havolada prefetch | 500 ta so'rov | `prefetch={false}` |
| Barrel import | Katta bundle | To'g'ridan-to'g'ri yoki `optimizePackageImports` |
| Uchinchi tomon skript `beforeInteractive` | INP yomon | `afterInteractive` / `lazyOnload` |
| Faqat Lighthouse'ga qarash | Haqiqiy foydalanuvchi boshqacha | Field ma'lumoti (RUM) |
| Byudjet yo'q | Regressiya sezilmaydi | CI'da Lighthouse |

## Amaliyot

1. `npm run build` chiqishini o'qing: qaysi sahifa `ƒ`, qaysi biri `○`? Kutilganidek emasmi?
2. `ANALYZE=true npm run build` bilan bundle xaritasini oching va eng katta uchta paketni toping.
3. Bitta sahifadan `"use client"` ni olib tashlab, chegarani pastga tushiring; First Load JS farqini yozib oling.
4. LCP rasmiga `priority` qo'shing va Lighthouse'da LCP farqini o'lchang.
5. `next/font` ga o'ting va CLS o'zgarishini ko'ring.
6. DevTools → Performance'da sahifani yozib oling; 50 ms dan uzun vazifalarni toping.
7. CPU'ni 4x sekinlashtirib (DevTools) sahifani sinang — real telefon shunday ishlaydi.
8. Lighthouse byudjetini CI'ga qo'shing va uni ataylab buzib, PR qizil bo'lishini ko'ring.

## Rasmiy hujjat

- Unumdorlik: <https://nextjs.org/docs/app/guides/production-checklist>
- `next/image`: <https://nextjs.org/docs/app/api-reference/components/image>
- `next/font`: <https://nextjs.org/docs/app/api-reference/components/font>
- `next/script`: <https://nextjs.org/docs/app/api-reference/components/script>
- Bundle tahlili: <https://nextjs.org/docs/app/guides/package-bundling>
- Web Vitals: <https://web.dev/vitals/>
