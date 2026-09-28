# 35 — React Router

[← Oldingi: Papka tuzilmasi va modullar](34-arxitektura.md) · [Mundarija](README.md) · [Keyingi: Klient holati: Zustand →](36-zustand.md)

## Tushuncha

React'da rasmiy router yo'q. Amaldagi standart — **React Router** (v7). U uch rejimda ishlaydi: `declarative` (oddiy SPA), `data` (loader/action bilan) va `framework` (Remix o'rnini bosgan to'liq rejim).

```bash
npm i react-router
```

Bu bobda **data rejimi** ko'riladi: u SPA uchun eng foydali va `loader`/`action` konvensiyalarini beradi.

## Kod: marshrutlarni e'lon qilish

::: ts
```tsx
// app/router.tsx
import { createBrowserRouter, RouterProvider } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootError />,            // 33-bob
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <CatalogPage /> },
      { path: 'products/:slug', element: <ProductPage /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        loader: requireAdmin,                // guard (pastda)
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])

// app/App.tsx
<RouterProvider router={router} />
```
:::

::: js
```jsx
// app/router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RootError />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <CatalogPage /> },
      { path: 'products/:slug', element: <ProductPage /> },
      {
        path: 'admin',
        element: <AdminLayout />,
        loader: requireAdmin,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'users', element: <AdminUsers /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
```
:::

```jsx
// RootLayout.tsx
export function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />          {/* bolalar shu yerda render bo'ladi */}
      </main>
      <Footer />
    </>
  )
}
```

## Kod: navigatsiya

```jsx
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router'

<Link to="/products">Mahsulotlar</Link>
<Link to={`/products/${slug}`}>Ochish</Link>
<Link to="/login" replace>Kirish</Link>

{/* Aktiv holat bilan */}
<NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-active' : 'nav')}>
  Mahsulotlar
</NavLink>
```

```jsx
const navigate = useNavigate()

navigate('/products')
navigate(`/products/${slug}`, { replace: true })
navigate(-1)                                        // orqaga
navigate('/checkout', { state: { from: 'cart' } })  // holat bilan
```

## Kod: parametrlar va query

::: ts
```tsx
import { useParams, useSearchParams } from 'react-router'

function ProductPage() {
  const { slug } = useParams()                 // /products/:slug
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? 1)
  const sort = searchParams.get('sort') ?? 'created'

  function setPage(next: number) {
    setSearchParams((prev) => {
      prev.set('page', String(next))

      return prev
    }, { replace: true })                      // tarixni to'ldirmaslik
  }
}
```
:::

::: js
```jsx
import { useParams, useSearchParams } from 'react-router'

function ProductPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get('page') ?? 1)
  const sort = searchParams.get('sort') ?? 'created'

  function setPage(next) {
    setSearchParams((prev) => {
      prev.set('page', String(next))

      return prev
    }, { replace: true })
  }
}
```
:::

**URL — holat manbai** (17, 37-bob): filtr, sahifa, saralash shu yerda yashashi kerak, aks holda havola ulashilmaydi va sahifa yangilanganda holat yo'qoladi.

Qulay hook:

::: ts
```tsx
export function useUrlState<T extends string>(key: string, fallback: T) {
  const [params, setParams] = useSearchParams()

  const value = (params.get(key) ?? fallback) as T

  const setValue = useCallback(
    (next: T) => {
      setParams((prev) => {
        if (next === fallback) prev.delete(key)
        else prev.set(key, next)

        return prev
      }, { replace: true })
    },
    [key, fallback, setParams],
  )

  return [value, setValue] as const
}
```
:::

::: js
```jsx
export function useUrlState(key, fallback) {
  const [params, setParams] = useSearchParams()

  const value = params.get(key) ?? fallback

  const setValue = useCallback(
    (next) => {
      setParams((prev) => {
        if (next === fallback) prev.delete(key)
        else prev.set(key, next)

        return prev
      }, { replace: true })
    },
    [key, fallback, setParams],
  )

  return [value, setValue]
}
```
:::

## Kod: himoyalangan marshrutlar

::: ts
```tsx
// 1. Loader orqali (navigatsiya bloklanadi)
export async function requireAuth({ request }: LoaderFunctionArgs) {
  const user = await getCurrentUser()

  if (!user) {
    const from = new URL(request.url).pathname

    throw redirect(`/login?from=${encodeURIComponent(from)}`)
  }

  return user
}

// 2. Komponent orqali (sahifa ochiladi, keyin yo'naltiriladi)
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}
```
:::

::: js
```jsx
export async function requireAuth({ request }) {
  const user = await getCurrentUser()

  if (!user) {
    const from = new URL(request.url).pathname

    throw redirect(`/login?from=${encodeURIComponent(from)}`)
  }

  return user
}

function RequireAuth({ children }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}
```
:::

Kirishdan keyin qaytish:

```jsx
const [params] = useSearchParams()
const from = params.get('from') ?? '/'

await login(credentials)
navigate(from, { replace: true })
```

Bu naqsh Next.js'da ham deyarli bir xil (Next qo'llanmasi, 30-bob).

## Kod: lazy marshrutlar

```jsx
{
  path: 'admin',
  lazy: async () => {
    const { AdminLayout, adminLoader } = await import('@/features/admin')

    return { Component: AdminLayout, loader: adminLoader }
  },
}
```

Yoki oddiy `lazy()` + `Suspense` (24-bob). Har ikkalasi ham chunk ajratadi (41-bob).

## Kod: scroll va navigatsiya holati

```jsx
import { ScrollRestoration, useNavigation } from 'react-router'

function RootLayout() {
  const navigation = useNavigation()
  const isNavigating = navigation.state !== 'idle'

  return (
    <>
      {isNavigating && <TopProgressBar />}
      <Outlet />
      <ScrollRestoration />        {/* orqaga qaytganda scroll tiklanadi */}
    </>
  )
}
```

## Muhandislik nuqtai nazari: loader yoki `useQuery`

React Router data rejimida ma'lumotni `loader` da yuklash mumkin. TanStack Query (32-bob) bilan birga ishlatilganda tanlov paydo bo'ladi:

| Yondashuv | Kuchli tomoni | Zaifligi |
| --- | --- | --- |
| Faqat `loader` | Navigatsiya bilan bog'langan, waterfall kam | Kesh, fon'da yangilash yo'q |
| Faqat `useQuery` | Kesh, retry, invalidatsiya | Ma'lumot komponent mount'idan keyin so'raladi |
| `loader` + `queryClient.ensureQueryData` | Ikkalasining foydasi | Biroz ko'proq kod |

Uchinchi variant amalda eng yaxshisi:

```jsx
export const productLoader = ({ params }) =>
  queryClient.ensureQueryData({
    queryKey: productKeys.detail(params.slug),
    queryFn: () => api.get(`/products/${params.slug}`),
  })

// Komponentda odatdagidek
const { data } = useQuery({ queryKey: productKeys.detail(slug), queryFn: ... })
```

Ma'lumot navigatsiya paytida yuklanadi, keyin komponent uni keshdan darhol oladi.

## Muhandislik nuqtai nazari: router tanlash

| Variant | Qachon |
| --- | --- |
| **React Router v7** | SPA uchun standart; framework rejimida SSR ham |
| **TanStack Router** | To'liq tipli marshrutlar, qidiruv parametrlari sxemasi |
| **Next.js App Router** | SSR/RSC kerak bo'lsa (alohida qo'llanma) |
| Router'siz | Bitta ekranli vidjet |

TanStack Router'ning kuchli tomoni — `search params` ni sxema bilan tiplash. React Router — ekotizm kattaligi va materiallar ko'pligi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| SPA fallback sozlanmagan | Ichki URL'da 404 (04-bob) | `try_files` / `404.html` |
| Filtrlarni `useState` da saqlash | Havola ulashilmaydi, yangilashda yo'qoladi | `useSearchParams` |
| Har filtr o'zgarishida `push` | Tarix to'ladi, orqaga tugmasi ishlamaydi | `replace: true` |
| `<a href>` bilan ichki navigatsiya | To'liq sahifa qayta yuklanadi | `<Link>` |
| 404 marshrutini boshiga qo'yish | Hamma yo'l unga tushadi | Oxirida (`path: '*'`) |
| Guard'ni faqat klientda qilish | Xavfsizlik emas (47-bob) | Serverda ham tekshirish |
| Har marshrutni statik import qilish | Bitta katta bundle | `lazy` |

## Amaliyot

1. To'rt marshrutli ilova yarating: bosh sahifa, ro'yxat, detal (`:slug`), 404.
2. Filtr va sahifani `useSearchParams` ga chiqaring; sahifani yangilab, holat saqlanishini tekshiring.
3. `RequireAuth` bilan himoyalangan bo'lim qiling va kirishdan keyin `from` ga qaytishni amalga oshiring.
4. Bitta marshrutni `lazy` qiling va Network panelida chunk yuklanishini kuzating.
5. `loader` + `ensureQueryData` naqshini sinab ko'ring va ma'lumot qachon so'ralishini solishtiring.

## Rasmiy hujjat

- React Router: <https://reactrouter.com/start/framework/installation>
- Data API'lari: <https://reactrouter.com/start/data/route-object>
- TanStack Router: <https://tanstack.com/router/latest>
