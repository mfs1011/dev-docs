# 09 — Dinamik marshrutlar

[← Oldingi: Layout va shablon](08-layout-va-template.md) · [Mundarija](README.md) · [Keyingi: Yuklanish va xato holatlari →](10-loading-va-error.md)

## Tushuncha

Dinamik segment — kvadrat qavs ichidagi papka nomi:

| Naqsh | URL | `params` |
| --- | --- | --- |
| `[slug]` | `/blog/hello` | `{ slug: 'hello' }` |
| `[category]/[id]` | `/shop/laptops/42` | `{ category: 'laptops', id: '42' }` |
| `[...slug]` | `/docs/a/b/c` | `{ slug: ['a','b','c'] }` |
| `[[...slug]]` | `/docs` va `/docs/a` | `{ slug: undefined }` / `{ slug: ['a'] }` |

`params` qiymatlari **har doim satr** (yoki satrlar massivi).

## Kod: to'liq sahifa

::: ts
```tsx
// app/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: 'Topilmadi' }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverUrl] },
  }
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <article>
      <h1>{post.title}</h1>
      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
```
:::

::: js
```jsx
// app/blog/[slug]/page.jsx
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) return { title: 'Topilmadi' }

  return { title: post.title, description: post.excerpt, openGraph: { images: [post.coverUrl] } }
}

export default async function BlogPost({ params }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </article>
  )
}
```
:::

`generateMetadata` va sahifa **ikkalasi ham** `getPost` ni chaqiradi — lekin so'rov **bir marta** bajariladi, chunki Next bir render davomida bir xil `fetch`/`cache()` chaqiruvlarini birlashtiradi (17, 18-bob).

## Kod: `generateStaticParams` strategiyalari

::: ts
```tsx
// 1. Hammasini oldindan (kichik katalog)
export async function generateStaticParams() {
  const posts = await getPosts()

  return posts.map((p) => ({ slug: p.slug }))
}

// 2. Faqat mashhurlarini (katta katalog)
export async function generateStaticParams() {
  const popular = await getPopularProducts(100)

  return popular.map((p) => ({ slug: p.slug }))
}
// Qolganlari birinchi so'rovda yaratiladi va keshlanadi (ISR)

// 3. Umuman oldindan yaratmaslik
export async function generateStaticParams() {
  return []
}

// 4. Faqat ro'yxatdagilar (boshqalarga 404)
export const dynamicParams = false
```
:::

::: js
```jsx
export async function generateStaticParams() {
  const popular = await getPopularProducts(100)

  return popular.map((p) => ({ slug: p.slug }))
}

export const dynamicParams = false
```
:::

| Strategiya | Build vaqti | Birinchi so'rov | Qachon |
| --- | --- | --- | --- |
| Hammasi | Uzun | Tez | < 1 000 sahifa |
| Mashhurlari | Qisqa | Mashhurlari tez | Katta katalog |
| Bo'sh massiv | Eng qisqa | Sekinroq | Juda katta yoki tez o'zgaruvchan |
| `dynamicParams: false` | — | 404 | Yopiq ro'yxat |

## Kod: ichma-ich dinamik segmentlar

```
app/shop/[category]/[id]/page.tsx     → /shop/laptops/42
```

::: ts
```tsx
type Props = { params: Promise<{ category: string; id: string }> }

export async function generateStaticParams() {
  const products = await getProducts()

  return products.map((p) => ({ category: p.category, id: String(p.id) }))
}

export default async function ProductPage({ params }: Props) {
  const { category, id } = await params
  const product = await getProduct(Number(id))

  // URL to'g'riligini tekshirish (noto'g'ri kategoriya bilan ochilmasin)
  if (!product || product.category !== category) notFound()

  return <ProductDetails product={product} />
}
```
:::

::: js
```jsx
export default async function ProductPage({ params }) {
  const { category, id } = await params
  const product = await getProduct(Number(id))

  if (!product || product.category !== category) notFound()

  return <ProductDetails product={product} />
}
```
:::

Oxirgi tekshiruv muhim: `/shop/phones/42` (noto'g'ri kategoriya) ham ishlaydigan bo'lib qolmasin — bu takroriy mazmun (SEO) va chalkashlik.

## Kod: catch-all marshrutlar

```
app/docs/[...slug]/page.tsx
```

::: ts
```tsx
type Props = { params: Promise<{ slug: string[] }> }

export async function generateStaticParams() {
  const pages = await getDocPages()        // ['guide/intro', 'api/reference']

  return pages.map((path) => ({ slug: path.split('/') }))
}

export default async function DocPage({ params }: Props) {
  const { slug } = await params
  const path = slug.join('/')
  const page = await getDocPage(path)

  if (!page) notFound()

  return <DocContent page={page} />
}
```
:::

::: js
```jsx
export default async function DocPage({ params }) {
  const { slug } = await params
  const path = slug.join('/')
  const page = await getDocPage(path)

  if (!page) notFound()

  return <DocContent page={page} />
}
```
:::

Ixtiyoriy catch-all (`[[...slug]]`) `/docs` ning o'zini ham ushlaydi — unda `slug` `undefined` bo'ladi.

## Kod: slug va ID

Ikki keng tarqalgan naqsh:

```
/products/42                    ID — oddiy, lekin SEO uchun yomon
/products/klaviatura-keychron    slug — SEO uchun yaxshi, lekin o'zgarishi mumkin
/products/42-klaviatura          ikkalasi — eng barqaror
```

::: ts
```tsx
// Uchinchi variant: ID dan o'qiymiz, slug faqat ko'rinish uchun
export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const id = Number(slug.split('-')[0])

  const product = await getProduct(id)

  if (!product) notFound()

  // Slug o'zgargan bo'lsa — kanonik URL'ga yo'naltirish
  const canonical = `${product.id}-${product.slug}`

  if (slug !== canonical) redirect(`/products/${canonical}`)

  return <ProductDetails product={product} />
}
```
:::

::: js
```jsx
export default async function ProductPage({ params }) {
  const { slug } = await params
  const id = Number(slug.split('-')[0])

  const product = await getProduct(id)

  if (!product) notFound()

  const canonical = `${product.id}-${product.slug}`

  if (slug !== canonical) redirect(`/products/${canonical}`)

  return <ProductDetails product={product} />
}
```
:::

Bu naqsh mahsulot nomi o'zgarganda eski havolalar ishlashda davom etishini ta'minlaydi.

## Muhandislik nuqtai nazari: URL dizayni

| Qoida | Yomon | Yaxshi |
| --- | --- | --- |
| Tushunarli | `/p/42?t=1` | `/products/42-klaviatura` |
| Barqaror | `/2024/blog/post` | `/blog/post` |
| Ierarxiya mantiqiy | `/product-laptops-42` | `/products/laptops/42` |
| Kichik harf va defis | `/Products/MyItem` | `/products/my-item` |
| Filtr — query'da | `/products/laptops/price-100-500` | `/products/laptops?price=100-500` |

URL — **ommaviy API**: o'zgartirsangiz, eski havolalar sinadi. Shuning uchun `redirect` bilan eski yo'llarni qo'llab-quvvatlang (`next.config` da `redirects()`).

## Muhandislik nuqtai nazari: `params` ni tekshirish

`params` — foydalanuvchi kiritadigan ma'lumot, shuning uchun unga ishonmang:

```ts
const id = Number(idParam)

if (!Number.isInteger(id) || id <= 0) notFound()
```

Yoki zod bilan (05-bob):

```ts
const paramsSchema = z.object({ id: z.coerce.number().int().positive() })

const parsed = paramsSchema.safeParse(await params)

if (!parsed.success) notFound()
```

Bu SQL in'ektsiyadan himoya emas (ORM buni qiladi), lekin kutilmagan xatolar va keraksiz baza so'rovlarining oldini oladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `params` ni `await` qilmaslik | Next 15+ da u Promise | `await params` |
| `params` qiymatini son deb hisoblash | U har doim satr | `Number(id)` + tekshiruv |
| Noto'g'ri kategoriya bilan sahifa ochilishi | Takroriy mazmun, SEO | Moslikni tekshiring |
| Slug o'zgarganda eski URL'ni tashlab yuborish | Havolalar sinadi | Kanonik URL'ga `redirect` |
| Katta katalogni to'liq `generateStaticParams` | Build soatlab | Mashhurlarini + ISR |
| `notFound()` ni `try/catch` ichida | Ushlanib qoladi | Tashqarida |
| Catch-all ni oddiy segment o'rniga | Marshrutlar noaniq | Aniq segmentlar |

## Amaliyot

1. Blog sahifasini `[slug]` bilan yozing: `generateStaticParams`, `generateMetadata`, `notFound`.
2. `generateStaticParams` da faqat 3 ta slug qoldiring va boshqasini so'rang — ISR bilan yaratilishini kuzating; keyin `dynamicParams = false` qo'shing.
3. `[category]/[id]` marshrutini yozing va noto'g'ri kategoriya bilan ochib ko'ring; moslik tekshiruvini qo'shing.
4. `42-klaviatura` naqshini amalga oshiring: slug o'zgarganda kanonik URL'ga yo'naltirish.
5. `[...slug]` bilan hujjat sahifasini yozing va ichma-ich yo'llarni sinab ko'ring.

## Rasmiy hujjat

- Dinamik marshrutlar: <https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes>
- `generateStaticParams`: <https://nextjs.org/docs/app/api-reference/functions/generate-static-params>
- `redirect` va `notFound`: <https://nextjs.org/docs/app/api-reference/functions/redirect>
