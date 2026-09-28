# 03 — Render strategiyalari

[← Oldingi: O'rnatish va loyiha tuzilmasi](02-ornatish.md) · [Mundarija](README.md) · [Keyingi: Server va klient chegarasi →](04-server-klient-chegarasi.md)

## Tushuncha

Next'da har bir marshrut **o'z render strategiyasiga** ega bo'lishi mumkin. Beshta variant bor:

| Strategiya | Qachon HTML hosil bo'ladi | Qachon ishlatiladi |
| --- | --- | --- |
| **Static** | Build vaqtida | O'zgarmaydigan mazmun: landing, hujjat, blog |
| **ISR** | Build + fon'da yangilanadi | Katalog, blog (tez-tez o'zgaradi) |
| **Dynamic (SSR)** | Har so'rovda | Shaxsiy sahifa, qidiruv natijasi |
| **Streaming** | Bo'lak-bo'lak | Sekin qismi bor sahifalar |
| **Client (CSR)** | Brauzerda | Login orqasidagi interaktiv panel |

Next 15+ dan boshlab marshrut **standart holda static** bo'ladi va dinamik API ishlatilsa avtomatik dinamikga o'tadi.

## Kod: static (standart)

::: ts
```tsx
// app/about/page.tsx — build vaqtida HTML hosil bo'ladi
export default function AboutPage() {
  return <article>Biz haqimizda…</article>
}
```
:::

::: js
```jsx
// app/about/page.jsx
export default function AboutPage() {
  return <article>Biz haqimizda…</article>
}
```
:::

Build chiqishida buni ko'rasiz:

```
Route (app)                    Size     Revalidate
┌ ○ /about                     142 B    -
├ ● /products                  1.2 kB   1h
└ ƒ /dashboard                 3.4 kB   -

○  (Static)   build vaqtida
●  (ISR)      vaqti-vaqti bilan yangilanadi
ƒ  (Dynamic)  har so'rovda
```

## Kod: dinamik marshrutlar va `generateStaticParams`

::: ts
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))     // build'da shu sahifalar yaratiladi
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params                          // Next 15+ da params — Promise
  const post = await getPost(slug)

  return <article>{post.title}</article>
}
```
:::

::: js
```jsx
// app/blog/[slug]/page.jsx
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export default async function PostPage({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  return <article>{post.title}</article>
}
```
:::

**Next 15+ o'zgarishi:** `params`, `searchParams`, `cookies()`, `headers()` — hammasi **`Promise`** qaytaradi va `await` qilinadi. Eski maqolalarda bu sinxron edi.

`generateStaticParams` da ro'yxat berilmagan yo'llar birinchi so'rovda yaratiladi (ISR kabi) — buni o'chirish uchun:

```tsx
export const dynamicParams = false      // ro'yxatda yo'q slug → 404
```

## Kod: ISR — qayta validatsiya

::: ts
```tsx
// Butun marshrut uchun
export const revalidate = 3600          // har soatda fon'da yangilanadi

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products').then((r) => r.json())

  return <ProductGrid products={products} />
}
```
:::

::: js
```jsx
export const revalidate = 3600

export default async function ProductsPage() {
  const products = await fetch('https://api.example.com/products').then((r) => r.json())

  return <ProductGrid products={products} />
}
```
:::

Yoki so'rov darajasida:

```tsx
const products = await fetch(url, { next: { revalidate: 3600, tags: ['products'] } })
```

ISR qanday ishlaydi:

1. Birinchi so'rov → sahifa hosil qilinadi va keshlanadi;
2. Keyingi so'rovlar → keshdan darhol javob;
3. `revalidate` vaqti o'tgach → keyingi so'rov **eski nusxani** oladi, fon'da yangilanish boshlanadi;
4. Yangilanish tugagach — keyingi so'rovlar yangi nusxani oladi.

Natija: SSG tezligi + yangilanish. Batafsil — 19-bob.

## Kod: dinamik render

Marshrut quyidagilardan birini ishlatsa, **avtomatik dinamik** bo'ladi:

```tsx
import { cookies, headers } from 'next/headers'

const cookieStore = await cookies()        // dinamik
const headersList = await headers()        // dinamik
const { searchParams } = props             // dinamik (agar o'qilsa)
await fetch(url, { cache: 'no-store' })    // dinamik
```

Majburan belgilash:

```tsx
export const dynamic = 'force-dynamic'     // har doim dinamik
export const dynamic = 'force-static'      // har doim static (dinamik API'lar bo'sh qaytadi)
export const fetchCache = 'default-no-store'
```

Amalda `force-dynamic` ko'pincha "nega ma'lumot yangilanmayapti?" muammosiga shoshilinch yechim sifatida ishlatiladi — bu noto'g'ri (18-bob). Avval keshni tushuning.

## Kod: streaming va `loading.tsx`

::: ts
```tsx
// app/dashboard/loading.tsx — avtomatik Suspense fallback
export default function Loading() {
  return <DashboardSkeleton />
}
```
:::

::: js
```jsx
// app/dashboard/loading.jsx
export default function Loading() {
  return <DashboardSkeleton />
}
```
:::

Yoki aniqroq boshqarish uchun `<Suspense>`:

```tsx
export default function DashboardPage() {
  return (
    <>
      <QuickStats />                          {/* tez — darhol ko'rinadi */}

      <Suspense fallback={<ChartSkeleton />}>
        <SlowChart />                         {/* sekin — keyin keladi */}
      </Suspense>

      <Suspense fallback={<TableSkeleton />}>
        <RecentOrders />
      </Suspense>
    </>
  )
}
```

Server HTML'ni **bo'lak-bo'lak** yuboradi: tayyor qismlar darhol ko'rinadi, sekinlari keyin "oqib" keladi (20-bob).

## Kod: klient tomonda render

Ba'zi sahifalar serverda render qilinishi shart emas:

```tsx
// app/dashboard/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const { data } = useQuery({ queryKey: ['stats'], queryFn: getStats })
  // ...
}
```

Bu — login orqasidagi panel uchun normal: SEO kerak emas, ma'lumot foydalanuvchiga xos, interaktivlik yuqori (24-bob).

## Muhandislik nuqtai nazari: qaysi sahifaga qaysi strategiya

| Sahifa | Strategiya | Sabab |
| --- | --- | --- |
| Landing, "Biz haqimizda" | Static | O'zgarmaydi |
| Blog post | Static + ISR | Kamdan-kam o'zgaradi |
| Mahsulot sahifasi (narx, qoldiq) | ISR (qisqa `revalidate`) yoki dinamik | Tez-tez o'zgaradi |
| Katalog + filtrlar | Dinamik (`searchParams`) | Har so'rov noyob |
| Qidiruv natijalari | Dinamik | Noyob |
| Savat, profil, admin | Dinamik yoki CSR | Shaxsiy |
| Hisobot dashboard | CSR | Interaktiv, SEO kerak emas |

**Qat'iy qoida:** shaxsiy ma'lumot bor sahifani hech qachon static/ISR qilmang — u keshga tushadi va boshqa foydalanuvchiga ko'rsatilishi mumkin (18, 45-bob).

## Muhandislik nuqtai nazari: gibrid ilova

Real ilovada strategiyalar aralashadi:

```
/                     static           (marketing)
/products             ISR 1h           (katalog)
/products/[slug]      ISR 10m          (mahsulot)
/search               dynamic          (searchParams)
/cart                 client           (localStorage/store)
/account/*            dynamic          (cookie bilan auth)
/api/*                route handlers   (15-bob)
```

Bu — Next'ning asosiy afzalligi: bitta ilovada har sahifa o'ziga mos ishlaydi.

## Muhandislik nuqtai nazari: statik eksport

Agar server umuman bo'lmasa:

```ts
// next.config.ts
export default { output: 'export' }
```

```bash
npm run build      # out/ — statik fayllar
```

Cheklovlar: Server Actions yo'q, Route Handlers yo'q, ISR yo'q, `next/image` optimizatsiyasi yo'q (yoki custom loader), middleware yo'q.

Bu rejim — hujjat sayti yoki oddiy landing uchun. Ilova mantiqi bo'lsa, u SPA'ga aylanadi va Next'ning foydasi kamayadi (01-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Shaxsiy sahifani static qilish | Ma'lumot boshqa foydalanuvchiga ko'rinadi | Dinamik yoki CSR |
| Muammoni `force-dynamic` bilan "hal qilish" | Kesh foydasi yo'qoladi | Keshni tushuning (18-bob) |
| `params` ni `await` qilmaslik (Next 15+) | Xato yoki `undefined` | `const { slug } = await params` |
| `generateStaticParams` siz katta katalogni static qilish | Build soatlab ketadi | ISR |
| Butun sahifani bitta `Suspense` ichiga solish | Eng sekin qism hammasini ushlaydi | Bo'lak-bo'lak (20-bob) |
| Build chiqishidagi belgilarni (○ ● ƒ) tekshirmaslik | Kutilmagan dinamik sahifalar | Har build'da ko'ring |
| Statik eksportda Server Actions kutish | Qo'llab-quvvatlanmaydi | Node runtime |

## Amaliyot

1. Uch sahifa yarating: static, ISR (`revalidate = 60`) va dinamik (`cookies()` bilan). `npm run build` chiqishidagi belgilarni solishtiring.
2. ISR sahifasini ochib, 60 soniyadan keyin qayta yuklang va yangilanishni kuzating.
3. `generateStaticParams` bilan 5 ta blog sahifasini oldindan yarating; ro'yxatda yo'q slug'ni so'rang.
4. `loading.tsx` qo'shing va sun'iy kechikish (`await new Promise(r => setTimeout(r, 2000))`) bilan streaming'ni ko'ring.
5. Bitta sahifani `force-dynamic` qiling va build chiqishida nima o'zgarganini ko'ring.

## Rasmiy hujjat

- Render strategiyalari: <https://nextjs.org/docs/app/getting-started/partial-prerendering>
- ISR: <https://nextjs.org/docs/app/guides/incremental-static-regeneration>
- Marshrut segmenti sozlamalari: <https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config>
