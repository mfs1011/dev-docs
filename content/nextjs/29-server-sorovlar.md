# 29 — Server komponentlardan so'rov

[← Oldingi: Refresh oqimi](28-refresh-oqimi.md) · [Mundarija](README.md) · [Keyingi: Himoyalangan marshrutlar →](30-himoyalangan-marshrutlar.md)

## Tushuncha

Token cookie'da (26-bob), refresh ishlaydi (28-bob). Endi kundalik ish: **sahifa ma'lumotni backend'dan qanday oladi**.

```
Brauzer ──▶ Next server ──▶ Backend API
            │                  ▲
            │ cookie'dan       │ Authorization: Bearer ...
            └─ token o'qiydi ──┘
```

Uchta savolga javob kerak:

1. Tokenni har joyda qo'lda o'qimaslik uchun nima qilish kerak;
2. Shaxsiy ma'lumot **keshlanib qolmasligini** qanday kafolatlash;
3. 401 kelganda sahifa nima qilishi kerak.

## Nega shunday

Server komponentda `fetch` — bu odatdagi `fetch` emas: Next uni o'rab olgan va **keshlaydi**. Bu keshdan ehtiyot bo'lish kerak:

| Nima | Nima bo'ladi | Xavf |
| --- | --- | --- |
| `fetch(url)` `cache` siz | Next 16'da sukut bo'yicha `no-store` | Yo'q |
| `fetch(url, { cache: 'force-cache' })` | Data Cache'ga tushadi | ⚠️ Foydalanuvchilar orasida bo'lishiladi |
| `fetch(url, { next: { revalidate: 60 } })` | 60 soniya keshlanadi | ⚠️ Bir xil |

Next 15 dan boshlab `fetch` sukut bo'yicha keshlanmaydi — bu aynan shu xato tufayli o'zgartirilgan (18-bob). Lekin `force-cache` ni qo'lda yozsangiz yoki eski qo'llanmadan ko'chirsangiz, **bir foydalanuvchining ma'lumoti boshqasiga ko'rinadi**.

Qoida: `Authorization` sarlavhasi bor so'rov **hech qachon keshlanmaydi**.

## Kod: API qatlami

28-bobdagi `api()` ustiga tipli funksiyalar quramiz:

::: ts
```ts
// lib/api.ts (28-bobdagi faylning davomi)
import 'server-only'

export async function apiGet<T>(path: string, options?: { tags?: string[] }): Promise<T> {
  const response = await api(path, {
    method: 'GET',
    cache: 'no-store',
    next: options?.tags ? { tags: options.tags } : undefined,
  })

  if (!response.ok) throw new ApiError(response.status, path)

  return response.json() as Promise<T>
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw await ApiError.from(response, path)

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    readonly fields?: Record<string, string[]>,
  ) {
    super(`API ${status} ${path}`)
  }

  static async from(response: Response, path: string) {
    if (response.status === 422) {
      const body = await response.json().catch(() => ({}))

      return new ApiError(422, path, body.errors)
    }

    return new ApiError(response.status, path)
  }
}
```
:::

::: js
```js
// lib/api.js (28-bobdagi faylning davomi)
import 'server-only'

export class ApiError extends Error {
  constructor(status, path, fields) {
    super(`API ${status} ${path}`)
    this.status = status
    this.path = path
    this.fields = fields
  }

  static async from(response, path) {
    if (response.status === 422) {
      const body = await response.json().catch(() => ({}))

      return new ApiError(422, path, body.errors)
    }

    return new ApiError(response.status, path)
  }
}

export async function apiGet(path, options) {
  const response = await api(path, {
    method: 'GET',
    cache: 'no-store',
    next: options?.tags ? { tags: options.tags } : undefined,
  })

  if (!response.ok) throw new ApiError(response.status, path)

  return response.json()
}

export async function apiPost(path, body) {
  const response = await api(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw await ApiError.from(response, path)

  return response.json()
}
```
:::

Endi sahifada:

::: ts
```tsx
// app/(app)/orders/page.tsx
import { apiGet } from '@/lib/api'

type Order = { id: number; number: string; total: number; status: string }

export default async function OrdersPage() {
  const orders = await apiGet<Order[]>('/orders')

  return (
    <table>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.number}</td>
            <td>{order.total.toLocaleString('uz-UZ')} so'm</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```
:::

::: js
```jsx
// app/(app)/orders/page.jsx
import { apiGet } from '@/lib/api'

export default async function OrdersPage() {
  const orders = await apiGet('/orders')

  return (
    <table>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id}>
            <td>{order.number}</td>
            <td>{order.total.toLocaleString('uz-UZ')} so'm</td>
            <td>{order.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```
:::

Token bu yerda ko'rinmaydi — bu maqsad. Sahifa kodi autentifikatsiya haqida hech narsa bilmaydi.

## Kod: parallel so'rovlar

Ketma-ket `await` — waterfall (17-bob). Auth bilan ham xuddi shunday:

::: ts
```tsx
// ❌ Sekin: 3 ta so'rov navbat bilan, 300 ms
export default async function DashboardPage() {
  const user = await apiGet<User>('/me')
  const orders = await apiGet<Order[]>('/orders?limit=5')
  const stats = await apiGet<Stats>('/stats')
  ...
}

// ✅ Tez: bir vaqtda, 100 ms
export default async function DashboardPage() {
  const [user, orders, stats] = await Promise.all([
    apiGet<User>('/me'),
    apiGet<Order[]>('/orders?limit=5'),
    apiGet<Stats>('/stats'),
  ])
  ...
}
```
:::

::: js
```jsx
// ❌ Sekin
export default async function DashboardPage() {
  const user = await apiGet('/me')
  const orders = await apiGet('/orders?limit=5')
  const stats = await apiGet('/stats')
}

// ✅ Tez
export default async function DashboardPage() {
  const [user, orders, stats] = await Promise.all([
    apiGet('/me'),
    apiGet('/orders?limit=5'),
    apiGet('/stats'),
  ])
}
```
:::

**Ammo:** agar access token muddati tugagan bo'lsa, uchala so'rov ham 401 oladi va uchtasi ham refresh qilmoqchi bo'ladi. Shuning uchun 28-bobdagi `refreshOnce` kerak. Middleware proaktiv yangilagan bo'lsa, bu holat umuman kelib chiqmaydi.

## Kod: 401 ni sahifada ushlash

`api()` `Unauthorized` tashlaydi. Uni qayerda ushlash kerak?

::: ts
```tsx
// app/(app)/layout.tsx — himoyalangan qism uchun bitta joy
import { redirect } from 'next/navigation'
import { Unauthorized } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return (
    <div className="app">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  )
}
```

```tsx
// app/(app)/error.tsx — qolgan holatlar uchun
'use client'

import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert">
      <h2>Nimadir noto'g'ri ketdi</h2>
      <button onClick={reset}>Qayta urinish</button>
    </div>
  )
}
```
:::

::: js
```jsx
// app/(app)/layout.jsx
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default async function AppLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return (
    <div className="app">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  )
}

// app/(app)/error.jsx
'use client'

import { useEffect } from 'react'

export default function AppError({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert">
      <h2>Nimadir noto'g'ri ketdi</h2>
      <button onClick={reset}>Qayta urinish</button>
    </div>
  )
}
```
:::

`Unauthorized` ni `error.tsx` ga tushirmaslik yaxshiroq: foydalanuvchi "xato" emas, **login sahifasini** ko'rishi kerak. `api()` ichida `Unauthorized` da darhol `redirect('/login')` chaqirish ham mumkin:

::: ts
```ts
// lib/api.ts ichida, 401 yakuniy bo'lganda
import { redirect } from 'next/navigation'

if (response.status === 401) {
  redirect(`/login?from=${encodeURIComponent(currentPath)}`)
}
```
:::

::: js
```js
import { redirect } from 'next/navigation'

if (response.status === 401) {
  redirect(`/login?from=${encodeURIComponent(currentPath)}`)
}
```
:::

Lekin unda `api()` ni Route Handler'dan chaqirib bo'lmaydi (u yerda `redirect` JSON javob o'rniga yo'naltirish beradi). **Tavsiya:** `api()` xato tashlasin, yo'naltirish qarorini chaqiruvchi qabul qilsin.

## Kod: keshlash — qachon mumkin

Hamma ma'lumot ham shaxsiy emas:

::: ts
```ts
// Umumiy ma'lumot — token kerak emas, keshlansa bo'ladi
export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${process.env.API_URL}/categories`, {
    next: { revalidate: 3600, tags: ['categories'] },     // 1 soat
  })

  return response.json()
}

// Shaxsiy ma'lumot — hech qachon
export async function getMyOrders(): Promise<Order[]> {
  return apiGet<Order[]>('/orders')                        // cache: 'no-store'
}
```
:::

::: js
```js
export async function getCategories() {
  const response = await fetch(`${process.env.API_URL}/categories`, {
    next: { revalidate: 3600, tags: ['categories'] },
  })

  return response.json()
}

export async function getMyOrders() {
  return apiGet('/orders')
}
```
:::

Sinov: **"bu javobni boshqa foydalanuvchi ko'rsa muammo bo'ladimi?"** Ha bo'lsa — keshlamang.

Kesh kalitiga `Authorization` sarlavhasi kirmasligini yodda tuting: ikki foydalanuvchining bir xil URL'ga so'rovi Next uchun **bir xil so'rov**.

## Kod: `cache()` bilan takrorlanishni yo'qotish

Layout ham, sahifa ham, komponent ham foydalanuvchini so'rasa — uchta so'rov bo'ladi. React'ning `cache()` buni bitta qiladi (16-bob):

::: ts
```ts
// lib/queries.ts
import 'server-only'
import { cache } from 'react'
import { apiGet } from './api'

export const getUser = cache(async () => apiGet<User>('/me'))

export const getOrder = cache(async (id: string) => apiGet<Order>(`/orders/${id}`))
```

```tsx
// Endi bemalol:
// layout.tsx → getUser()
// page.tsx   → getUser()
// Header.tsx → getUser()
// Backend'ga bitta so'rov ketadi
```
:::

::: js
```js
// lib/queries.js
import 'server-only'
import { cache } from 'react'
import { apiGet } from './api'

export const getUser = cache(async () => apiGet('/me'))

export const getOrder = cache(async (id) => apiGet(`/orders/${id}`))
```
:::

`cache()` **bir render doirasida** ishlaydi: so'rovlar orasida saqlanmaydi, foydalanuvchilar orasida bo'lishilmaydi. Shuning uchun shaxsiy ma'lumot uchun xavfsiz.

| | `cache()` (React) | `fetch` Data Cache (Next) |
| --- | --- | --- |
| Yashash muddati | Bitta so'rov | Bir necha so'rov / deploy |
| Foydalanuvchilar orasida | ❌ Yo'q | ✅ Ha |
| Shaxsiy ma'lumot uchun | ✅ Xavfsiz | ❌ Xavfli |

## Kod: streaming bilan

Sekin so'rovni sahifani to'sib qo'yishiga yo'l qo'ymaslik (20-bob):

::: ts
```tsx
// app/(app)/dashboard/page.tsx
import { Suspense } from 'react'

export default async function DashboardPage() {
  const user = await getUser()                    // tez, kutamiz

  return (
    <>
      <h1>Salom, {user.name}</h1>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />                                  {/* sekin — oqimda keladi */}
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </>
  )
}

async function Stats() {
  const stats = await apiGet<Stats>('/stats')      // token o'zi olinadi

  return <StatsGrid data={stats} />
}
```
:::

::: js
```jsx
import { Suspense } from 'react'

export default async function DashboardPage() {
  const user = await getUser()

  return (
    <>
      <h1>Salom, {user.name}</h1>

      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </>
  )
}

async function Stats() {
  const stats = await apiGet('/stats')

  return <StatsGrid data={stats} />
}
```
:::

`Stats` ichida `cookies()` chaqirilgani uchun sahifa dinamik bo'ladi — bu kutilgan holat (03-bob).

## Muhandislik nuqtai nazari: `fetch` o'rami vs SDK

Ikki yondashuv:

| | Qo'lda `fetch` o'rami | Yaratilgan SDK (OpenAPI) |
| --- | --- | --- |
| Tiplar | Qo'lda yoziladi | Avtomatik, backend bilan sinxron |
| Auth | O'zingiz ulaysiz | Interceptor kerak |
| Backend o'zgarsa | Ish vaqtida sinadi | Build vaqtida sinadi |
| Boshlash tezligi | Darhol | Sozlash kerak |

Backend OpenAPI sxemasi bersa, `openapi-typescript` bilan tiplarni yarating va ularni o'z `api()` o'ramingiz bilan birlashtiring — eng yaxshi kombinatsiya:

```bash
npx openapi-typescript https://api.example.com/openapi.json -o lib/api-types.ts
```

::: ts
```ts
import type { paths } from './api-types'

type Orders = paths['/orders']['get']['responses']['200']['content']['application/json']

export const getOrders = () => apiGet<Orders>('/orders')
```
:::

::: js
```js
// JS'da tiplar yo'q — JSDoc bilan qisman foyda olish mumkin
/** @returns {Promise<import('./api-types').Order[]>} */
export const getOrders = () => apiGet('/orders')
```
:::

## Muhandislik nuqtai nazari: timeout va qayta urinish

Backend osilib qolsa, Next sahifasi ham osiladi. `AbortSignal.timeout` majburiy:

::: ts
```ts
export async function api(path: string, init: ApiInit = {}): Promise<Response> {
  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(8_000),
  })
}
```
:::

::: js
```js
export async function api(path, init = {}) {
  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(8_000),
  })
}
```
:::

Qayta urinish (retry) — faqat **idempotent** so'rovlar uchun (GET, HEAD). POST'ni qayta urinish ikki marta buyurtma yaratishi mumkin:

::: ts
```ts
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown

  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, 2 ** i * 200))     // 200, 400, 800 ms
      }
    }
  }

  throw lastError
}
```
:::

::: js
```js
async function withRetry(fn, attempts = 3) {
  let lastError

  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 2 ** i * 200))
    }
  }

  throw lastError
}
```
:::

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `Authorization` bor so'rovni keshlash | Boshqa foydalanuvchi ma'lumotini ko'radi | `cache: 'no-store'` |
| Har komponentda tokenni qo'lda o'qish | Takrorlanish, unutilgan joylar | Bitta `api()` o'rami |
| Ketma-ket `await` | Waterfall, sekin sahifa | `Promise.all` |
| `cache()` ishlatmaslik | `/me` ga 4 ta so'rov | `cache(async () => ...)` |
| Timeout yo'q | Sahifa cheksiz osiladi | `AbortSignal.timeout` |
| POST'ni qayta urinish | Ikki marta buyurtma | Faqat GET uchun retry |
| `api()` ichida `redirect` | Route Handler buziladi | Xato tashlash, chaqiruvchi qaror qiladi |
| `server-only` yozmaslik | O'ram klient bundle'ga tushishi mumkin | `import 'server-only'` |
| Backend xatosini foydalanuvchiga ko'rsatish | Ichki tafsilot sizadi | Umumiy xabar + `console.error` |

## Amaliyot

1. `apiGet` / `apiPost` o'ramini yozing va sahifada tokenni qo'lda o'qimasdan ma'lumot oling.
2. Ketma-ket uchta `await` bilan sahifa yozing, Network panelida vaqtni o'lchang, keyin `Promise.all` ga o'tkazib qayta o'lchang.
3. Bitta `fetch` ga `cache: 'force-cache'` qo'ying, ikki xil foydalanuvchi bilan kiring va muammoni o'z ko'zingiz bilan ko'ring. Keyin qaytarib qo'ying.
4. `getUser` ni `cache()` bilan o'rang, uni layout va uchta komponentda chaqiring, backend logida bitta so'rov borligini tasdiqlang.
5. Backend'ni to'xtatib, sahifa 8 soniyada xato berishini (osilib qolmasligini) tekshiring.
6. `Suspense` qo'shib, tez qism darhol ko'rinishini va sekin qism keyin kelishini ko'ring.

## Rasmiy hujjat

- Ma'lumot yuklash: <https://nextjs.org/docs/app/getting-started/fetching-data>
- `fetch` kengaytmalari: <https://nextjs.org/docs/app/api-reference/functions/fetch>
- `cache()`: <https://react.dev/reference/react/cache>
- Suspense: <https://react.dev/reference/react/Suspense>
