# 38 — Pages Router asoslari

[← Oldingi: Real vaqt](37-real-vaqt.md) · [Mundarija](README.md) · [Keyingi: API Routes →](39-api-routes.md)

## Tushuncha

App Router 2023-yilda barqaror bo'ldi. Undan oldingi hamma narsa — **Pages Router**. Bu qism (38–41) uni o'rgatish uchun emas: **yangi loyihada Pages Router ishlatilmaydi**. Maqsad boshqa:

1. Mavjud loyihani olib ketganingizda uni **o'qiy olish**;
2. Internetdagi eski javoblar va qo'llanmalarni **ajrata olish**;
3. Migratsiyani (40-bob) **rejalashtira olish**.

```
pages/                          app/
├── index.tsx        →          ├── page.tsx
├── about.tsx        →          ├── about/page.tsx
├── blog/[slug].tsx  →          ├── blog/[slug]/page.tsx
├── _app.tsx         →          ├── layout.tsx (qisman)
├── _document.tsx    →          ├── layout.tsx (qisman)
└── api/hello.ts     →          └── api/hello/route.ts
```

Pages Router hali ham qo'llab-quvvatlanadi va **o'chirilmaydi**. Ishlab turgan loyihani shoshilib ko'chirish shart emas.

## Nega shunday

Pages Router modeli sodda: **har fayl — bitta sahifa, hammasi klientda ishlaydi**, serverda esa faqat ma'lumot olinadi.

```
Pages Router:
  Server: getServerSideProps → props (JSON)
  Klient: butun sahifa komponenti React bilan render qilinadi

App Router:
  Server: komponentlarning o'zi render qilinadi → RSC payload
  Klient: faqat "use client" komponentlari
```

Shundan asosiy farq chiqadi: Pages Router'da **har bir komponent klient bundle'ga tushadi**. Markdown parseri, sana kutubxonasi, ORM tiplar — hammasi. App Router buni hal qiladi (04, 16-bob).

## Kod: marshrutlash

```
pages/
├── index.tsx                 →  /
├── about.tsx                 →  /about
├── blog/index.tsx            →  /blog
├── blog/[slug].tsx           →  /blog/nima-gap
├── shop/[...path].tsx        →  /shop/a/b/c
├── docs/[[...slug]].tsx      →  /docs va /docs/a/b
└── 404.tsx                   →  topilmadi sahifasi
```

Konvensiya App Router'ga o'xshaydi, lekin `page.tsx` papka ichida emas — **fayl nomining o'zi marshrut**.

::: ts
```tsx
// pages/blog/[slug].tsx
import { useRouter } from 'next/router'        // 'next/navigation' EMAS

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query                // string | string[] | undefined

  // Statik generatsiyada birinchi renderda query BO'SH bo'ladi
  if (router.isFallback) return <p>Yuklanmoqda…</p>

  return <h1>{slug}</h1>
}
```
:::

::: js
```jsx
// pages/blog/[slug].jsx
import { useRouter } from 'next/router'

export default function BlogPost() {
  const router = useRouter()
  const { slug } = router.query

  if (router.isFallback) return <p>Yuklanmoqda…</p>

  return <h1>{slug}</h1>
}
```
:::

`next/router` va `next/navigation` — **ikki xil modul**. Eski kodda `next/router` ni ko'rsangiz, bu Pages Router.

| | Pages Router | App Router |
| --- | --- | --- |
| Modul | `next/router` | `next/navigation` |
| Parametr | `router.query` | `useParams()`, `params` |
| Query | `router.query` (birga) | `useSearchParams()` |
| Yo'l | `router.pathname` | `usePathname()` |
| O'tish | `router.push()` | `useRouter().push()` |
| Yangilash | `router.replace(router.asPath)` | `router.refresh()` |

## Kod: ma'lumot olish — uch funksiya

Bu Pages Router'ning yuragi.

**1. `getServerSideProps` — har so'rovda serverda:**

::: ts
```tsx
// pages/orders/index.tsx
import type { GetServerSideProps } from 'next'

type Props = { orders: Order[] }

export default function OrdersPage({ orders }: Props) {
  return (
    <ul>
      {orders.map((order) => <li key={order.id}>{order.number}</li>)}
    </ul>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const token = context.req.cookies.access_token

  if (!token) {
    return { redirect: { destination: '/login', permanent: false } }
  }

  const response = await fetch(`${process.env.API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 404) return { notFound: true }

  const orders = await response.json()

  // Props JSON-seriyalanadigan bo'lishi SHART: Date, Map, undefined — xato
  return { props: { orders } }
}
```
:::

::: js
```jsx
// pages/orders/index.jsx
export default function OrdersPage({ orders }) {
  return <ul>{orders.map((order) => <li key={order.id}>{order.number}</li>)}</ul>
}

export async function getServerSideProps(context) {
  const token = context.req.cookies.access_token

  if (!token) return { redirect: { destination: '/login', permanent: false } }

  const response = await fetch(`${process.env.API_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 404) return { notFound: true }

  return { props: { orders: await response.json() } }
}
```
:::

App Router ekvivalenti — shunchaki `async` server komponent:

::: ts
```tsx
// app/orders/page.tsx — bir xil ish, uchdan bir kod
export default async function OrdersPage() {
  const orders = await apiGet<Order[]>('/orders')     // 29-bob

  return <ul>{orders.map((o) => <li key={o.id}>{o.number}</li>)}</ul>
}
```
:::

::: js
```jsx
// app/orders/page.jsx
export default async function OrdersPage() {
  const orders = await apiGet('/orders')

  return <ul>{orders.map((o) => <li key={o.id}>{o.number}</li>)}</ul>
}
```
:::

**2. `getStaticProps` — build vaqtida:**

::: ts
```tsx
// pages/blog/[slug].tsx
import type { GetStaticProps, GetStaticPaths } from 'next'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts()

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',       // yangi slug kelsa serverda render qilib keshlaydi
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await getPost(String(params?.slug))

  if (!post) return { notFound: true }

  return {
    props: { post },
    revalidate: 3600,           // ISR — soatiga bir marta qayta quriladi
  }
}
```
:::

::: js
```jsx
export async function getStaticPaths() {
  const posts = await getAllPosts()

  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: 'blocking',
  }
}

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug)

  if (!post) return { notFound: true }

  return { props: { post }, revalidate: 3600 }
}
```
:::

App Router'da bu `generateStaticParams` + `export const revalidate` (09, 19-bob).

`fallback` uch qiymati:

| Qiymat | Ro'yxatda yo'q yo'l | Qachon |
| --- | --- | --- |
| `false` | 404 | Yo'llar to'liq ma'lum |
| `true` | Skelet, keyin to'ldiradi (`router.isFallback`) | Ko'p sahifa, tez build kerak |
| `'blocking'` | Serverda render, keyin keshlanadi | Odatda eng yaxshi |

**3. `getStaticPaths` bilan birga ishlatiladi** (yuqorida).

Uchta funksiyaning ham umumiy xususiyati: ular **faqat sahifa faylida** ishlaydi. Komponentda emas, `_app` da emas.

## Kod: `_app` va `_document`

::: ts
```tsx
// pages/_app.tsx — har sahifa atrofida, KLIENTDA ishlaydi
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import '@/styles/globals.css'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  )
}
```

```tsx
// pages/_document.tsx — HTML skeleti, FAQAT serverda, bir marta
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="uz">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```
:::

::: js
```jsx
// pages/_app.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import '@/styles/globals.css'

export default function MyApp({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </QueryClientProvider>
  )
}

// pages/_document.jsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="uz">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```
:::

| Fayl | Qayerda ishlaydi | App Router ekvivalenti |
| --- | --- | --- |
| `_app.tsx` | Klient va server, har navigatsiyada | `app/layout.tsx` + provayderlar |
| `_document.tsx` | Faqat server, bir marta | `app/layout.tsx` dagi `<html>`, `<body>` |

`_document` da hooklar, holat, hodisa ishlatib bo'lmaydi — u faqat HTML skeleti.

**Muhim farq:** `_app` har navigatsiyada qayta render qilinadi va u yerdagi holat **saqlanadi**. App Router'da layout ham holatni saqlaydi (08-bob), lekin u server komponent.

## Kod: `<Head>` va metadata

::: ts
```tsx
// pages/blog/[slug].tsx
import Head from 'next/head'

export default function BlogPost({ post }: { post: Post }) {
  return (
    <>
      <Head>
        <title>{post.title} — Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.image} />
      </Head>

      <article>{post.body}</article>
    </>
  )
}
```
:::

::: js
```jsx
import Head from 'next/head'

export default function BlogPost({ post }) {
  return (
    <>
      <Head>
        <title>{post.title} — Blog</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <article>{post.body}</article>
    </>
  )
}
```
:::

App Router'da `next/head` **ishlamaydi** — u yerda `metadata` yoki `generateMetadata` (13-bob):

::: ts
```ts
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  return {
    title: `${post.title} — Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, images: [post.image] },
  }
}
```
:::

::: js
```js
export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  return { title: `${post.title} — Blog`, description: post.excerpt }
}
```
:::

## Kod: ISR va on-demand revalidatsiya

::: ts
```ts
// pages/api/revalidate.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.query.secret !== process.env.REVALIDATE_SECRET) {
    return response.status(401).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    await response.revalidate('/blog/nima-gap')      // aniq YO'L, teg emas

    return response.json({ revalidated: true })
  } catch {
    return response.status(500).send('Xato')
  }
}
```
:::

::: js
```js
// pages/api/revalidate.js
export default async function handler(request, response) {
  if (request.query.secret !== process.env.REVALIDATE_SECRET) {
    return response.status(401).json({ message: 'Ruxsat yo\'q' })
  }

  try {
    await response.revalidate('/blog/nima-gap')

    return response.json({ revalidated: true })
  } catch {
    return response.status(500).send('Xato')
  }
}
```
:::

Pages Router'da **faqat yo'l bo'yicha** revalidatsiya bor. App Router'ga `revalidateTag` qo'shildi (19-bob) — bir teg bilan bog'langan hamma sahifani birdan yangilash mumkin. Bu katta farq: "mahsulot o'zgardi → uni ko'rsatadigan 40 ta sahifani yangilash" Pages Router'da qo'lda ro'yxat talab qiladi.

## Kod: middleware

Middleware **ikkala routerda ham bir xil** — `middleware.ts` ildizda (14-bob):

::: ts
```ts
// middleware.ts — Pages va App uchun bir xil
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (!request.cookies.get('access_token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }
```
:::

::: js
```js
import { NextResponse } from 'next/server'

export function middleware(request) {
  if (!request.cookies.get('access_token')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/dashboard/:path*'] }
```
:::

Shu sababli middleware migratsiya paytida ikkala routerni ham qamrab oladi (40-bob).

## Muhandislik nuqtai nazari: to'liq taqqoslash

| Narsa | Pages Router | App Router |
| --- | --- | --- |
| Marshrut | Fayl nomi | Papka + `page.tsx` |
| Ichma-ich layout | ❌ Qo'lda (`getLayout` naqshi) | ✅ `layout.tsx` |
| Server komponentlar | ❌ Yo'q | ✅ Sukut bo'yicha |
| Klient bundle | Hamma komponent | Faqat `"use client"` |
| Ma'lumot olish | `getServerSideProps` (faqat sahifada) | Har komponentda `await` |
| Streaming | Cheklangan | ✅ `Suspense` |
| Yuklanish holati | Qo'lda | ✅ `loading.tsx` |
| Xato chegarasi | Qo'lda | ✅ `error.tsx` |
| Mutatsiya | API route + `fetch` | ✅ Server Actions |
| Metadata | `<Head>` | `metadata` / `generateMetadata` |
| Revalidatsiya | Yo'l bo'yicha | Yo'l **va teg** bo'yicha |
| Parallel/intercepting marshrutlar | ❌ Yo'q | ✅ Bor |
| O'rganish egri chizig'i | Pastroq | Tikroq |
| Barqarorlik | Juda barqaror | Barqaror, tez rivojlanadi |

## Muhandislik nuqtai nazari: `getLayout` naqshi

Pages Router'da ichma-ich layout yo'q edi, shuning uchun hamjamiyat naqsh o'ylab topdi. Eski loyihalarda uni ko'p uchratasiz:

::: ts
```tsx
// pages/dashboard/index.tsx
import type { ReactElement } from 'react'
import { DashboardLayout } from '@/layouts/DashboardLayout'

export default function DashboardPage() {
  return <h1>Dashboard</h1>
}

// Sahifa o'z layoutini "e'lon qiladi"
DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>
}
```

```tsx
// pages/_app.tsx
export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(<Component {...pageProps} />)
}
```
:::

::: js
```jsx
// pages/dashboard/index.jsx
export default function DashboardPage() {
  return <h1>Dashboard</h1>
}

DashboardPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

// pages/_app.jsx
export default function MyApp({ Component, pageProps }) {
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(<Component {...pageProps} />)
}
```
:::

Bu naqsh **App Router'da keraksiz** — `layout.tsx` uni tabiiy hal qiladi. Migratsiyada (40-bob) `getLayout` birinchi olib tashlanadigan narsa.

## Muhandislik nuqtai nazari: nega App Router yaratildi

Pages Router'ning uchta hal qilib bo'lmaydigan muammosi bor edi:

1. **Ma'lumot faqat sahifa darajasida.** Chuqurdagi komponentga ma'lumot kerak bo'lsa, uni sahifaga ko'tarib, props bilan pastga uzatish kerak edi. Yoki `useEffect` bilan klientda olish — waterfall.
2. **Hammasi klientga tushadi.** Sahifada markdown parseri ishlatsangiz, u foydalanuvchi brauzeriga yuklanadi, garchi u faqat serverda kerak bo'lsa ham.
3. **Layout yo'q.** Sahifalar orasida o'tganda butun daraxt qayta render qilinadi; sidebar holati, scroll pozitsiyasi yo'qoladi.

App Router uchalasini ham hal qiladi. Narxi — yangi tushunchalar (RSC, chegaralar, kesh) va tikroq o'rganish egri chizig'i.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `next/router` ni App Router'da | `NextRouter was not mounted` | `next/navigation` |
| `next/head` ni App Router'da | Ishlamaydi | `metadata` |
| `getServerSideProps` ni komponentda | Jim ishlamaydi | Faqat sahifa faylida |
| `props` da `Date` obyekti | Seriyalash xatosi | `.toISOString()` |
| `props` da `undefined` | Xato | `null` yoki maydonni tushiring |
| `getStaticPaths` siz `[slug]` + `getStaticProps` | Build xatosi | Ikkalasi birga |
| `fallback: true` da `isFallback` ni ushlamaslik | `undefined` parametr | `router.isFallback` |
| `getServerSideProps` ni statik sahifada | Sahifa dinamik bo'lib qoladi | Kerak bo'lmasa olib tashlang |
| `_document` da hook | Xato | Faqat HTML |
| Pages'da katta kutubxona import qilish | Klient bundle shishadi | Dinamik import yoki App Router |

## Amaliyot

1. Kichik Pages Router loyihasi yarating: `index`, `[slug]`, `_app`, `_document`.
2. `getServerSideProps` da `Date` obyekti qaytaring — xatoni ko'ring, keyin `toISOString()` bilan tuzating.
3. `fallback: 'blocking'` va `fallback: true` ni solishtiring: mavjud bo'lmagan slug'ni oching.
4. `getLayout` naqshini qo'llang va sahifalar orasida o'tganda layout holati saqlanishini tekshiring.
5. Bir xil sahifani App Router'da qayta yozing va ikki versiyaning qator sonini solishtiring.
6. Ikkala versiyada ham bundle hajmini o'lchang (`next build` chiqishi) — farqni ko'ring.
7. Eski Next loyihasini GitHub'da toping va `pages/` tuzilmasini o'qing: qaysi naqshlarni tanidingiz?

## Rasmiy hujjat

- Pages Router: <https://nextjs.org/docs/pages>
- `getServerSideProps`: <https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props>
- `getStaticProps`: <https://nextjs.org/docs/pages/api-reference/functions/get-static-props>
- `_app` va `_document`: <https://nextjs.org/docs/pages/building-your-application/routing/custom-app>
