# 10 — Yuklanish va xato holatlari

[← Oldingi: Dinamik marshrutlar](09-dinamik-marshrutlar.md) · [Mundarija](README.md) · [Keyingi: Navigatsiya →](11-navigatsiya.md)

## Tushuncha

App Router uchta maxsus fayl bilan holatlarni boshqaradi:

| Fayl | Nima | Ichkarida |
| --- | --- | --- |
| `loading.tsx` | Yuklanish holati | `<Suspense>` bilan avtomatik o'raladi |
| `error.tsx` | Xato holati | Error Boundary (klient komponenti) |
| `not-found.tsx` | 404 | `notFound()` chaqirilganda |

Ular **marshrut segmenti darajasida** ishlaydi: `app/products/loading.tsx` faqat `/products/*` uchun.

## Kod: `loading.tsx`

::: ts
```tsx
// app/products/loading.tsx
export default function Loading() {
  return (
    <div className="grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  )
}
```
:::

::: js
```jsx
// app/products/loading.jsx
export default function Loading() {
  return (
    <div className="grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton-card" />
      ))}
    </div>
  )
}
```
:::

Next buni avtomatik shunday o'raydi:

```tsx
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

Natija: sahifa ma'lumoti yuklanayotganda layout **darhol** ko'rinadi, mazmun o'rnida skelet turadi — foydalanuvchi navigatsiya sodir bo'lganini darhol sezadi.

## Kod: `error.tsx`

::: ts
```tsx
// app/products/error.tsx
'use client'                                  // MAJBURIY

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    reportError(error)                        // monitoringga (49-bob)
  }, [error])

  return (
    <div className="error-state">
      <h2>Nimadir xato ketdi</h2>
      <p>Mahsulotlarni yuklab bo'lmadi.</p>

      <button onClick={reset}>Qayta urinish</button>
    </div>
  )
}
```
:::

::: js
```jsx
// app/products/error.jsx
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => {
    reportError(error)
  }, [error])

  return (
    <div className="error-state">
      <h2>Nimadir xato ketdi</h2>
      <button onClick={reset}>Qayta urinish</button>
    </div>
  )
}
```
:::

Uch muhim nuqta:

1. **`'use client'` majburiy** — Error Boundary faqat klientda ishlaydi;
2. **`reset()`** — segmentni qayta render qilishga urinadi;
3. **Production'da `error.message` umumiy bo'ladi** — Next server xatolarining tafsilotini yashiradi (xavfsizlik). Aniqlash uchun `error.digest` ishlatiladi: u server loglaridagi yozuv bilan bog'lanadi.

## Kod: xato chegaralari ierarxiyasi

```
app/
├── error.tsx                   ← ildizdagi xatolar (layoutdan tashqari)
├── global-error.tsx            ← ildiz LAYOUT ning o'zi buzilganda
├── products/
│   ├── error.tsx               ← faqat /products/* xatolari
│   └── [slug]/error.tsx        ← faqat mahsulot sahifasi
└── dashboard/error.tsx
```

`error.tsx` **o'z segmentidagi** xatolarni ushlaydi, lekin **o'sha segmentning layout'idagi** xatolarni emas — ular yuqoriga ko'tariladi. Shuning uchun ildiz layout uchun alohida fayl bor:

::: ts
```tsx
// app/global-error.tsx
'use client'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="uz">
      <body>
        <h2>Ilova ishga tushmadi</h2>
        <button onClick={reset}>Qayta urinish</button>
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// app/global-error.jsx
'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html lang="uz">
      <body>
        <h2>Ilova ishga tushmadi</h2>
        <button onClick={reset}>Qayta urinish</button>
      </body>
    </html>
  )
}
```
:::

`global-error.tsx` o'z `<html>` va `<body>` sini chiqaradi, chunki ildiz layout ishlamayapti.

## Kod: `not-found.tsx`

::: ts
```tsx
// app/products/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h2>Mahsulot topilmadi</h2>
      <p>Ehtimol u o'chirilgan yoki havola noto'g'ri.</p>

      <Link href="/products">Katalogga qaytish</Link>
    </div>
  )
}
```
:::

::: js
```jsx
// app/products/not-found.jsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="empty-state">
      <h2>Mahsulot topilmadi</h2>
      <Link href="/products">Katalogga qaytish</Link>
    </div>
  )
}
```
:::

`notFound()` chaqirilganda (07, 09-bob) eng yaqin `not-found.tsx` ko'rsatiladi va **HTTP 404** status qaytariladi — bu SEO uchun muhim.

## Kod: to'rt holat App Router'da

React qo'llanmasidagi to'rt holat naqshi (13-bob) bu yerda shunday taqsimlanadi:

| Holat | Qayerda |
| --- | --- |
| **Loading** | `loading.tsx` yoki `<Suspense>` |
| **Error** | `error.tsx` |
| **Empty** | Sahifa ichida (`if (items.length === 0) return <Empty />`) |
| **Data** | Sahifa |

::: ts
```tsx
// app/products/page.tsx — loading va error alohida fayllarda
export default async function ProductsPage({ searchParams }: Props) {
  const { q } = await searchParams
  const products = await getProducts({ q })

  if (products.length === 0) {
    return <EmptyState title="Hech narsa topilmadi" query={q} />
  }

  return <ProductGrid products={products} />
}
```
:::

::: js
```jsx
export default async function ProductsPage({ searchParams }) {
  const { q } = await searchParams
  const products = await getProducts({ q })

  if (products.length === 0) return <EmptyState title="Hech narsa topilmadi" query={q} />

  return <ProductGrid products={products} />
}
```
:::

Sahifa kodi soddalashadi: yuklanish va xato **fayl konvensiyasi** orqali hal qilingan.

## Kod: aniqroq Suspense chegaralari

`loading.tsx` butun sahifani qoplaydi. Agar sahifaning bir qismi tez, bir qismi sekin bo'lsa — qo'lda `<Suspense>` ishlating (20-bob):

::: ts
```tsx
export default function DashboardPage() {
  return (
    <>
      <QuickStats />                          {/* tez */}

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />                       {/* sekin */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />                       {/* sekin */}
      </Suspense>
    </>
  )
}
```
:::

::: js
```jsx
export default function DashboardPage() {
  return (
    <>
      <QuickStats />

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </>
  )
}
```
:::

## Muhandislik nuqtai nazari: skelet dizayni

| Kutish vaqti | Tavsiya |
| --- | --- |
| < 200 ms | Hech narsa (miltillash yomonroq) |
| 200 ms – 1 s | Skelet |
| > 1 s | Skelet + progress belgisi |
| > 5 s | Progress + bekor qilish |

Skelet **haqiqiy tuzilmani** takrorlasin: bir xil balandlik, bir xil ustunlar. Aks holda mazmun kelganda sahifa "sakraydi" (CLS, 43-bob).

```css
.skeleton-card {
    height: 220px;              /* haqiqiy kartochka balandligi */
    border-radius: 10px;
    background: linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

@media (prefers-reduced-motion: reduce) {
    .skeleton-card { animation: none; }
}
```

## Muhandislik nuqtai nazari: xatolarni toifalarga bo'lish

`error.tsx` — **kutilmagan** xatolar uchun. Kutilgan holatlar boshqacha hal qilinadi:

| Holat | Yechim |
| --- | --- |
| Resurs yo'q | `notFound()` → `not-found.tsx` (404 status) |
| Avtorizatsiya yo'q | `redirect('/login')` (30-bob) |
| Ruxsat yo'q | Maxsus sahifa yoki `forbidden()` |
| Validatsiya | Forma ichida xabar (22-bob) |
| Tashqi API tushdi | `error.tsx` + retry |
| Kod xatosi | `error.tsx` |

Ya'ni `error.tsx` — oxirgi to'siq, birinchi javob emas.

## Muhandislik nuqtai nazari: `digest` va monitoring

Production'da server xatosi klientga shunday keladi:

```
Error: An error occurred in the Server Components render.
The specific message is omitted in production builds to avoid leaking sensitive details.
digest: '1234567890'
```

`digest` — xato hashi. U **server loglarida** ham chiqadi, shuning uchun:

1. Loglarda `digest` bo'yicha qidiring;
2. Sentry'da `digest` ni tag sifatida yuboring (49-bob);
3. Foydalanuvchiga uni ko'rsatish mumkin ("Xato kodi: 1234567890") — qo'llab-quvvatlashga murojaat qilganda foydali.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `error.tsx` da `'use client'` yozmaslik | Ishlamaydi | U majburiy |
| Ildiz layout xatolari uchun `global-error.tsx` yo'q | Oq ekran | Qo'shing |
| `error.message` ni production'da ko'rsatish | Umumiy matn chiqadi | `digest` bilan loglarni bog'lang |
| `loading.tsx` ni butun ilovaga bitta qilib qo'yish | Har navigatsiyada butun sahifa skelet | Segmentlarga bo'ling |
| Skelet o'lchamlari haqiqiydan farq qilishi | Layout sakraydi (CLS) | Bir xil o'lcham |
| 404 uchun `error.tsx` ishlatish | 200 status qaytadi, SEO buziladi | `notFound()` |
| `reset()` ni ulash unutilishi | Foydalanuvchi qamalib qoladi | "Qayta urinish" tugmasi |

## Amaliyot

1. `/products` uchun `loading.tsx` yozing va sun'iy kechikish (`await new Promise(r => setTimeout(r, 2000))`) qo'shib sinab ko'ring.
2. `error.tsx` yozing va sahifada ataylab `throw new Error('test')` qiling; `reset()` ishlashini tekshiring.
3. `production` build'da xuddi shu xatoni takrorlang va `digest` ni server loglarida toping.
4. `notFound()` bilan 404 qiling va `curl -I` bilan status kodini tekshiring.
5. Dashboard sahifasini ikkita `<Suspense>` bilan bo'ling va Slow 3G da bo'lak-bo'lak kelishini kuzating.

## Rasmiy hujjat

- `loading.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/loading>
- `error.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/error>
- `not-found.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/not-found>
