# 07 — Marshrutlash asoslari

[← Oldingi: Turbopack va build](06-turbopack-va-build.md) · [Mundarija](README.md) · [Keyingi: Layout va shablon →](08-layout-va-template.md)

## Tushuncha

App Router'da **papka tuzilmasi marshrutlarni belgilaydi**. Konfiguratsiya fayli yo'q.

```
app/
├── page.tsx                    → /
├── about/page.tsx              → /about
├── products/
│   ├── page.tsx                → /products
│   └── [slug]/page.tsx         → /products/:slug
└── (marketing)/
    └── pricing/page.tsx        → /pricing   (guruh URL'ga kirmaydi)
```

Qoida: **papka — URL segmenti, `page.tsx` — sahifa.** Papkada `page.tsx` bo'lmasa, u URL hosil qilmaydi (faqat guruhlash yoki layout uchun).

## Kod: maxsus fayllar

| Fayl | Vazifasi | Bob |
| --- | --- | --- |
| `page.tsx` | Sahifa (URL hosil qiladi) | shu bob |
| `layout.tsx` | O'ram, navigatsiyada saqlanadi | 08 |
| `template.tsx` | O'ram, har navigatsiyada qayta yaratiladi | 08 |
| `loading.tsx` | Suspense fallback | 10 |
| `error.tsx` | Error Boundary (klient) | 10 |
| `not-found.tsx` | 404 | 10 |
| `route.ts` | HTTP handler (API) | 15 |
| `default.tsx` | Parallel marshrut uchun zaxira | 12 |
| `middleware.ts` | So'rov oldidagi qatlam (ildizda) | 14 |

**Muhim:** `app/` ichidagi boshqa fayllar (`ProductCard.tsx`, `utils.ts`) marshrut hosil qilmaydi — ularni sahifa yoniga qo'yish mumkin (colocation).

## Kod: sahifa

::: ts
```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <section>
      <h1>Mahsulotlar</h1>
      <ProductGrid products={products} />
    </section>
  )
}
```
:::

::: js
```jsx
// app/products/page.jsx
export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <section>
      <h1>Mahsulotlar</h1>
      <ProductGrid products={products} />
    </section>
  )
}
```
:::

`page.tsx` **default eksport** qilishi shart — nomli eksport ishlamaydi.

## Kod: marshrut turlari

```
app/
├── blog/[slug]/page.tsx              → /blog/vue-3-6
├── shop/[category]/[id]/page.tsx     → /shop/laptops/42
├── docs/[...slug]/page.tsx           → /docs/a/b/c   (catch-all)
├── help/[[...slug]]/page.tsx         → /help va /help/a/b  (ixtiyoriy catch-all)
└── (auth)/login/page.tsx             → /login  (guruh)
```

::: ts
```tsx
// Dinamik segment
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return <article>{slug}</article>
}

// Catch-all
export default async function Docs({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params        // ['a', 'b', 'c']

  return <article>{slug.join('/')}</article>
}
```
:::

::: js
```jsx
export default async function BlogPost({ params }) {
  const { slug } = await params

  return <article>{slug}</article>
}

export default async function Docs({ params }) {
  const { slug } = await params        // ['a', 'b', 'c']

  return <article>{slug.join('/')}</article>
}
```
:::

## Kod: `searchParams`

::: ts
```tsx
type Props = {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '', page = '1', sort = 'relevance' } = await searchParams

  const results = await search(q, { page: Number(page), sort })

  return <SearchResults results={results} />
}
```
:::

::: js
```jsx
export default async function SearchPage({ searchParams }) {
  const { q = '', page = '1', sort = 'relevance' } = await searchParams

  const results = await search(q, { page: Number(page), sort })

  return <SearchResults results={results} />
}
```
:::

**Muhim:** `searchParams` ni o'qish sahifani **dinamik** qiladi (03-bob) — u build vaqtida ma'lum emas. Agar sahifaning bir qismi static bo'lishi kerak bo'lsa, `searchParams` ni faqat pastki komponentda `Suspense` ichida o'qing (20-bob).

## Kod: `generateStaticParams`

::: ts
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

// Ichma-ich segmentlar uchun
export async function generateStaticParams() {
  return [
    { category: 'laptops', id: '1' },
    { category: 'phones', id: '2' },
  ]
}

// Ro'yxatda yo'q yo'llar uchun 404 (standart: ISR bilan yaratiladi)
export const dynamicParams = false
```
:::

::: js
```jsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export const dynamicParams = false
```
:::

## Kod: marshrut guruhlari

```
app/
├── (marketing)/
│   ├── layout.tsx              → marketing layout
│   ├── page.tsx                → /
│   └── about/page.tsx          → /about
└── (shop)/
    ├── layout.tsx              → do'kon layout
    ├── products/page.tsx       → /products
    └── cart/page.tsx           → /cart
```

Qavs ichidagi nom **URL'ga kirmaydi**. Foydasi: bir necha sahifaga alohida layout berish yoki kodni mantiqan guruhlash (12-bob).

## Kod: colocation — fayllarni sahifa yoniga qo'yish

```
app/products/
├── page.tsx                    → /products
├── loading.tsx
├── error.tsx
├── components/                 ← URL hosil qilmaydi
│   ├── ProductGrid.tsx
│   └── ProductFilters.tsx
├── actions.ts                  ← Server Actions (21-bob)
└── queries.ts                  ← ma'lumot funksiyalari
```

Bu — App Router'ning kuchli tomoni: **bitta xususiyatga tegishli hamma narsa bir joyda**. Faqat umumiy komponentlar `src/components` yoki `src/shared` ga chiqadi (02-bob).

## Kod: `not-found` va dinamik 404

::: ts
```tsx
// app/products/[slug]/page.tsx
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()        // app/products/[slug]/not-found.tsx yoki eng yaqin not-found

  return <ProductDetails product={product} />
}
```
:::

::: js
```jsx
import { notFound } from 'next/navigation'

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return <ProductDetails product={product} />
}
```
:::

## Kod: `redirect`

::: ts
```tsx
import { redirect, permanentRedirect } from 'next/navigation'

export default async function OldPage() {
  redirect('/new-page')                    // 307 (vaqtincha)
  permanentRedirect('/new-page')           // 308 (doimiy)
}

// Shartli
export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return <Dashboard user={user} />
}
```
:::

::: js
```jsx
import { redirect, permanentRedirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return <Dashboard user={user} />
}
```
:::

`redirect()` va `notFound()` **exception tashlaydi** — ular `try/catch` ichida bo'lsa ushlanib qoladi va ishlamaydi. Shuning uchun ularni `catch` blokidan tashqarida chaqiring.

## Muhandislik nuqtai nazari: marshrut tuzilmasini loyihalash

| Qoida | Misol |
| --- | --- |
| URL foydalanuvchi uchun, papka tuzilmasi ham shunga mos | `/products/laptops/42` |
| Guruhlar — layout va tashkiliylik uchun | `(marketing)`, `(shop)`, `(auth)` |
| Ichma-ich segmentlar 3–4 darajadan oshmasin | `/a/b/c/d/e` — o'qib bo'lmaydi |
| Catch-all faqat haqiqatan kerak bo'lsa | Hujjat, CMS sahifalari |
| Sahifaga xos komponentlar yonida | `app/products/components/` |
| Umumiy komponentlar tashqarida | `src/components/ui/` |

## Muhandislik nuqtai nazari: `params` — endi Promise

Next 15+ da barcha dinamik API'lar `Promise` qaytaradi:

```ts
const { slug } = await params
const { q } = await searchParams
const cookieStore = await cookies()
const headersList = await headers()
```

Sabab — **PPR va streaming**: Next sahifaning statik qismini oldindan render qilib, dinamik qismni keyin to'ldirishi mumkin. `await` bu chegarani belgilaydi.

Eski kod uchun kodmod bor:

```bash
npx @next/codemod@latest next-async-request-api .
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `page.tsx` ni nomli eksport qilish | Next topa olmaydi | `export default` |
| `params` ni `await` qilmaslik | Xato yoki `undefined` | `await params` |
| `searchParams` ni sahifa ildizida o'qib, static kutish | Sahifa dinamik bo'ladi | `Suspense` ichida (20-bob) |
| `redirect()` ni `try/catch` ichida | Exception ushlanadi, redirect ishlamaydi | Tashqarida |
| Har papkaga `page.tsx` qo'shish | Keraksiz URL'lar | Faqat kerakli joyda |
| Umumiy komponentni `app/` ichida saqlash | Marshrut tuzilmasi chalkashadi | `src/components` |
| Catch-all ni hamma joyda ishlatish | Marshrutlar noaniq bo'ladi | Aniq segmentlar |

## Amaliyot

1. To'rt marshrut yarating: `/`, `/products`, `/products/[slug]`, `/about` (guruh ichida).
2. `generateStaticParams` bilan 3 ta mahsulot sahifasini oldindan yarating; ro'yxatda yo'q slug'ni so'rang.
3. `dynamicParams = false` qo'shing va farqni ko'ring.
4. `searchParams` bilan qidiruv sahifasini yozing; `npm run build` da u `ƒ` (dinamik) bo'lishini tasdiqlang.
5. `notFound()` va `redirect()` ni ishlatib ko'ring; `redirect` ni `try/catch` ichiga solib, nima bo'lishini kuzating.

## Rasmiy hujjat

- Marshrutlash: <https://nextjs.org/docs/app/getting-started/layouts-and-pages>
- Dinamik marshrutlar: <https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes>
- `generateStaticParams`: <https://nextjs.org/docs/app/api-reference/functions/generate-static-params>
