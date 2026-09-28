# 17 — Ma'lumot yuklash

[← Oldingi: Server Components](16-server-components.md) · [Mundarija](README.md) · [Keyingi: Kesh: to'liq manzara →](18-kesh.md)

## Tushuncha

App Router'da ma'lumot yuklashning to'rt yo'li bor:

| Usul | Qayerda | Qachon |
| --- | --- | --- |
| **`await` server komponentda** | Server | Standart tanlov |
| **Server Action** | Server | Mutatsiya (21-bob) |
| **Route Handler + `fetch`** | Klient | Tashqi klient, real-time |
| **Klient kutubxonasi** (TanStack Query) | Klient | Interaktiv, tez-tez yangilanadigan (24-bob) |

Birinchisi — 90% holatda to'g'ri javob.

## Kod: to'g'ridan-to'g'ri bazaga

::: ts
```tsx
// app/products/page.tsx
import { db } from '@/lib/db'

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 24,
    select: { id: true, slug: true, title: true, price: true, image: true },   // faqat kerakli maydonlar
  })

  return <ProductGrid products={products} />
}
```
:::

::: js
```jsx
// app/products/page.jsx
import { db } from '@/lib/db'

export default async function ProductsPage() {
  const products = await db.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    take: 24,
    select: { id: true, slug: true, title: true, price: true, image: true },
  })

  return <ProductGrid products={products} />
}
```
:::

`select` bilan faqat kerakli maydonlarni oling: ular RSC payload'ga tushadi va sahifa hajmini oshiradi (16, 43-bob).

## Kod: tashqi API

::: ts
```tsx
export default async function ProductsPage() {
  const response = await fetch('https://api.example.com/products', {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    next: { revalidate: 3600, tags: ['products'] },      // kesh (18, 19-bob)
  })

  if (!response.ok) {
    throw new Error(`API xatosi: ${response.status}`)     // error.tsx ushlaydi (10-bob)
  }

  const products = await response.json()

  return <ProductGrid products={products} />
}
```
:::

::: js
```jsx
export default async function ProductsPage() {
  const response = await fetch('https://api.example.com/products', {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    next: { revalidate: 3600, tags: ['products'] },
  })

  if (!response.ok) throw new Error(`API xatosi: ${response.status}`)

  const products = await response.json()

  return <ProductGrid products={products} />
}
```
:::

`process.env.API_TOKEN` — server komponentda xavfsiz (04-bob): u brauzerga yuborilmaydi.

## Kod: waterfall va parallel so'rovlar

Eng ko'p uchraydigan unumdorlik xatosi — **ketma-ket so'rovlar**:

::: ts
```tsx
// ✗ Waterfall: 300 + 250 + 200 = 750 ms
export default async function DashboardPage() {
  const user = await getUser()               // 300 ms
  const orders = await getOrders()           // 250 ms — user ni kutdi
  const stats = await getStats()             // 200 ms — orders ni kutdi

  return <Dashboard user={user} orders={orders} stats={stats} />
}

// ✓ Parallel: max(300, 250, 200) = 300 ms
export default async function DashboardPage() {
  const [user, orders, stats] = await Promise.all([getUser(), getOrders(), getStats()])

  return <Dashboard user={user} orders={orders} stats={stats} />
}
```
:::

::: js
```jsx
// ✗ Waterfall
const user = await getUser()
const orders = await getOrders()
const stats = await getStats()

// ✓ Parallel
const [user, orders, stats] = await Promise.all([getUser(), getOrders(), getStats()])
```
:::

Haqiqiy bog'liqlik bo'lsa (`orders` uchun `user.id` kerak), waterfall muqarrar — lekin qolganini parallel qiling:

```tsx
const user = await getUser()

const [orders, recommendations] = await Promise.all([
  getOrders(user.id),
  getRecommendations(user.id),
])
```

## Kod: `Promise.allSettled` — qisman muvaffaqiyat

::: ts
```tsx
export default async function DashboardPage() {
  const [userResult, statsResult] = await Promise.allSettled([getUser(), getExternalStats()])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null

  if (!user) throw new Error('Foydalanuvchi yuklanmadi')   // kritik

  return (
    <>
      <Profile user={user} />
      {stats ? <StatsPanel stats={stats} /> : <StatsUnavailable />}   {/* kritik emas */}
    </>
  )
}
```
:::

::: js
```jsx
export default async function DashboardPage() {
  const [userResult, statsResult] = await Promise.allSettled([getUser(), getExternalStats()])

  const user = userResult.status === 'fulfilled' ? userResult.value : null
  const stats = statsResult.status === 'fulfilled' ? statsResult.value : null

  if (!user) throw new Error('Foydalanuvchi yuklanmadi')

  return (
    <>
      <Profile user={user} />
      {stats ? <StatsPanel stats={stats} /> : <StatsUnavailable />}
    </>
  )
}
```
:::

Tashqi xizmat tushib qolsa, butun sahifa yiqilmasligi kerak.

## Kod: komponent darajasida ma'lumot

RSC'ning kuchli tomoni — **har komponent o'zi so'raydi**, props drilling yo'q:

::: ts
```tsx
// app/products/[slug]/page.tsx
export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  return (
    <>
      <ProductInfo slug={slug} />

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews slug={slug} />              {/* o'z so'rovini qiladi */}
      </Suspense>

      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts slug={slug} />      {/* o'z so'rovini qiladi */}
      </Suspense>
    </>
  )
}

// components/Reviews.tsx
async function Reviews({ slug }: { slug: string }) {
  const reviews = await getReviews(slug)

  return <ReviewList reviews={reviews} />
}
```
:::

::: js
```jsx
export default async function ProductPage({ params }) {
  const { slug } = await params

  return (
    <>
      <ProductInfo slug={slug} />

      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews slug={slug} />
      </Suspense>
    </>
  )
}

async function Reviews({ slug }) {
  const reviews = await getReviews(slug)

  return <ReviewList reviews={reviews} />
}
```
:::

`<Suspense>` bilan o'ralgan komponentlar **parallel** yuklanadi va tayyor bo'lgani darhol ko'rinadi (20-bob).

Diqqat: `Suspense` siz ichma-ich komponentlar **waterfall** hosil qiladi — ota o'z so'rovini tugatmaguncha bola boshlanmaydi.

## Kod: preload naqshi

Waterfall'ni oldini olishning ilg'or usuli:

::: ts
```ts
// lib/queries.ts
import { cache } from 'react'

export const getProduct = cache(async (slug: string) => {
  return db.product.findUnique({ where: { slug } })
})

// Preload: natijani kutmasdan so'rovni boshlash
export function preloadProduct(slug: string) {
  void getProduct(slug)
}
```
:::

::: js
```js
// lib/queries.js
import { cache } from 'react'

export const getProduct = cache(async (slug) => db.product.findUnique({ where: { slug } }))

export function preloadProduct(slug) {
  void getProduct(slug)
}
```
:::

```tsx
export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  preloadProduct(slug)          // so'rov hozir boshlanadi
  const user = await getUser()  // parallel ishlaydi

  return <ProductDetails slug={slug} user={user} />   // ichkarida getProduct keshdan oladi
}
```

## Kod: ma'lumot qatlamini tashkil qilish

```
src/
├── lib/
│   ├── db.ts                   import 'server-only'
│   └── api-client.ts           tashqi API (29-bob)
└── features/
    └── catalog/
        ├── queries.ts          ← o'qish (cache bilan)
        ├── actions.ts          ← yozish (Server Actions, 21-bob)
        └── schemas.ts          ← zod
```

::: ts
```ts
// features/catalog/queries.ts
import 'server-only'
import { cache } from 'react'
import { db } from '@/lib/db'

export const getProduct = cache(async (slug: string) =>
  db.product.findUnique({ where: { slug }, include: { category: true } }),
)

export const getProducts = cache(async (filters: CatalogFilters) =>
  db.product.findMany({
    where: buildWhere(filters),
    orderBy: buildOrderBy(filters.sort),
    skip: (filters.page - 1) * 24,
    take: 24,
  }),
)
```
:::

::: js
```js
// features/catalog/queries.js
import 'server-only'
import { cache } from 'react'
import { db } from '@/lib/db'

export const getProduct = cache(async (slug) =>
  db.product.findUnique({ where: { slug }, include: { category: true } }),
)
```
:::

Qoida: **so'rovlar sahifa fayllarida emas, `queries.ts` da** — shunda ular qayta ishlatiladi, test qilinadi va kesh siyosati bir joyda bo'ladi.

## Kod: autentifikatsiya bilan

::: ts
```ts
// lib/auth.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const payload = await verifyToken(token)

    return db.user.findUnique({ where: { id: payload.sub } })
  } catch {
    return null
  }
})
```
:::

::: js
```js
// lib/auth.js
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const payload = await verifyToken(token)

    return db.user.findUnique({ where: { id: payload.sub } })
  } catch {
    return null
  }
})
```
:::

**Muhim:** `cookies()` ni o'qish sahifani **dinamik** qiladi (03, 18-bob). Bu to'g'ri xatti-harakat: shaxsiy ma'lumot keshlanmasligi kerak.

Batafsil — 29, 30-boblar.

## Muhandislik nuqtai nazari: N+1 muammosi

::: ts
```tsx
// ✗ 1 + 24 ta so'rov
const products = await db.product.findMany({ take: 24 })

return products.map(async (p) => {
  const category = await db.category.findUnique({ where: { id: p.categoryId } })
  // ...
})

// ✓ Bitta so'rov
const products = await db.product.findMany({
  take: 24,
  include: { category: true },
})
```
:::

::: js
```jsx
// ✓ Bitta so'rov
const products = await db.product.findMany({ take: 24, include: { category: true } })
```
:::

RSC'da bu muammo osongina paydo bo'ladi, chunki har komponent o'z so'rovini qiladi. Yechimlar:

1. **`include`/`join`** — ORM darajasida;
2. **DataLoader naqshi** — so'rovlarni to'plash;
3. **`cache()`** — takroriy so'rovlarni birlashtiradi (bir xil argument bilan);
4. **Ota komponentda yuklab, props bilan uzatish** — eng oddiy.

Baza so'rovlarini loglang (`prisma: { log: ['query'] }`) — N+1 darhol ko'rinadi.

## Muhandislik nuqtai nazari: qayerda `fetch`, qayerda ORM

| Vaziyat | Yondashuv |
| --- | --- |
| O'z bazangiz, Next server bilan bir joyda | ORM (Prisma/Drizzle) to'g'ridan-to'g'ri |
| Alohida backend (Laravel, Go) | `fetch` + kesh teglari |
| Uchinchi tomon API | `fetch` + kesh + xato boshqaruvi |
| Mikroservislar | `fetch` yoki gRPC |

Alohida backend holatida Next **BFF** (Backend for Frontend) rolini o'ynaydi: u API'dan ma'lumot oladi, uni UI uchun moslashtiradi va sirlarni yashiradi (29-bob).

## Muhandislik nuqtai nazari: ma'lumot va streaming

| Ma'lumot turi | Strategiya |
| --- | --- |
| Sahifaning asosiy mazmuni | `await` (sahifa tayyor bo'lguncha kutiladi) |
| Ikkilamchi bo'laklar (izohlar, tavsiyalar) | `<Suspense>` (streaming, 20-bob) |
| Foydalanuvchiga xos (savat soni) | `<Suspense>` yoki klient |
| Real-time | Klient (WebSocket/SSE, 37-bob) |

Qoida: **LCP elementi `await` bilan, qolgani `Suspense` bilan.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Ketma-ket `await` (waterfall) | Sahifa sekin | `Promise.all` |
| Butun jadvalni olish (`select` siz) | RSC payload shishadi | Kerakli maydonlar |
| N+1 so'rovlar | Baza yuklanadi | `include`/`join`, `cache()` |
| So'rovlarni sahifa faylida yozish | Qayta ishlatib bo'lmaydi | `queries.ts` |
| O'z API'siga `fetch` qilish | Keraksiz HTTP sakrash | To'g'ridan-to'g'ri baza |
| Xatoni tekshirmaslik (`response.ok`) | Noto'g'ri ma'lumot render bo'ladi | `if (!response.ok) throw` |
| Tashqi xizmat xatosida butun sahifani yiqitish | Kritik bo'lmagan bo'lak sabab | `Promise.allSettled` |

## Amaliyot

1. Uchta ketma-ket `await` yozing va sahifa yuklanish vaqtini o'lchang; keyin `Promise.all` ga o'tkazing.
2. `cache()` bilan `getUser` yozing va uni sahifa hamda `generateMetadata` da chaqiring; baza loglarida bitta so'rov borligini tasdiqlang.
3. N+1 yarating (ro'yxatdagi har element uchun alohida so'rov) va Prisma loglarida ko'ring; `include` bilan tuzating.
4. Izohlarni `<Suspense>` bilan ajrating va Slow 3G da bo'lak-bo'lak kelishini kuzating.
5. `preloadProduct` naqshini qo'llang va waterfall qisqarganini o'lchang.

## Rasmiy hujjat

- Ma'lumot yuklash: <https://nextjs.org/docs/app/getting-started/fetching-data>
- `fetch` kengaytmalari: <https://nextjs.org/docs/app/api-reference/functions/fetch>
- Ketma-ket va parallel: <https://nextjs.org/docs/app/getting-started/fetching-data#sequential-and-parallel-data-fetching>
