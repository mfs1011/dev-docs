# 13 — Metadata va SEO

[← Oldingi: Marshrut guruhlari va parallel marshrutlar](12-route-groups-parallel.md) · [Mundarija](README.md) · [Keyingi: Middleware →](14-middleware.md)

## Tushuncha

Next'da meta teglar **server tomonda** hosil bo'ladi — ya'ni ular HTML'da darhol bor va botlar (Google, Telegram, Facebook) ularni ko'radi. SPA'dagi asosiy SEO muammosi shu bilan yo'qoladi.

Ikki yo'l:

| Usul | Qachon |
| --- | --- |
| `export const metadata` | Statik qiymatlar |
| `export async function generateMetadata()` | Ma'lumotga bog'liq qiymatlar |

## Kod: statik metadata

::: ts
```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),        // nisbiy URL'lar uchun asos
  title: {
    default: 'Do\'kon — onlayn xaridlar',
    template: '%s — Do\'kon',
  },
  description: 'Klaviatura, sichqoncha va aksessuarlar',
  keywords: ['klaviatura', 'sichqoncha', 'aksessuar'],
  authors: [{ name: 'Do\'kon jamoasi' }],
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    siteName: 'Do\'kon',
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg', apple: '/apple-touch-icon.png' },
}
```
:::

::: js
```jsx
// app/layout.jsx
export const metadata = {
  metadataBase: new URL('https://example.com'),
  title: { default: 'Do\'kon — onlayn xaridlar', template: '%s — Do\'kon' },
  description: 'Klaviatura, sichqoncha va aksessuarlar',
  openGraph: { type: 'website', locale: 'uz_UZ', siteName: 'Do\'kon' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}
```
:::

`metadataBase` — **majburiy** deb hisoblang: usiz nisbiy rasm yo'llari (`/og.png`) to'liq URL'ga aylanmaydi va ijtimoiy tarmoqlar rasmni ko'rmaydi.

`template` — bola sahifalar sarlavhasini o'raydi: `Mahsulotlar` → `Mahsulotlar — Do'kon`.

## Kod: dinamik metadata

::: ts
```tsx
// app/products/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Topilmadi' }

  return {
    title: product.title,
    description: product.excerpt,

    alternates: {
      canonical: `/products/${product.slug}`,
    },

    openGraph: {
      type: 'website',
      title: product.title,
      description: product.excerpt,
      url: `/products/${product.slug}`,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }],
    },
  }
}
```
:::

::: js
```jsx
export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Topilmadi' }

  return {
    title: product.title,
    description: product.excerpt,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.title,
      images: [{ url: product.image, width: 1200, height: 630, alt: product.title }],
    },
  }
}
```
:::

**Muhim:** `generateMetadata` va sahifa ikkalasi ham `getProduct` ni chaqirsa ham, so'rov **bir marta** ketadi — Next bir render davomida bir xil chaqiruvlarni birlashtiradi (17, 18-bob).

## Kod: metadata merosi

```
app/layout.tsx           title.template = '%s — Do'kon', openGraph.siteName
 └── app/blog/layout.tsx openGraph.type = 'article'
      └── app/blog/[slug]/page.tsx  title, description, openGraph.images
```

Metadata **birlashadi**: pastki segment yuqoridagini to'ldiradi yoki almashtiradi. Faqat `title` va `description` to'liq almashtiriladi, `openGraph` maydonlari esa birlashadi.

## Kod: JSON-LD (structured data)

::: ts
```tsx
export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.excerpt,
    sku: product.sku,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UZS',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <ProductDetails product={product} />
    </>
  )
}
```
:::

::: js
```jsx
export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'UZS',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetails product={product} />
    </>
  )
}
```
:::

`.replace(/</g, '\\u003c')` — XSS himoyasi (45-bob): mahsulot nomida `</script>` bo'lsa, sahifa buzilmasin.

Keng tarqalgan turlar: `Product`, `Article`, `BreadcrumbList`, `FAQPage`, `Organization`, `LocalBusiness`.

## Kod: sitemap va robots

::: ts
```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts()
  const posts = await getAllPosts()

  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://example.com/products', lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    ...products.map((p) => ({
      url: `https://example.com/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),

    ...posts.map((p) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ]
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/account'] },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```
:::

::: js
```js
// app/sitemap.js
export default async function sitemap() {
  const products = await getAllProducts()

  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...products.map((p) => ({
      url: `https://example.com/products/${p.slug}`,
      lastModified: p.updatedAt,
    })),
  ]
}

// app/robots.js
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/account'] }],
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```
:::

50 000 dan ko'p URL bo'lsa, sitemap'ni bo'lish kerak (`generateSitemaps`).

## Kod: OG rasm generatsiyasi

Har mahsulot uchun qo'lda rasm tayyorlash o'rniga — dinamik generatsiya:

::: ts
```tsx
// app/products/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 64,
          background: '#0f1115',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700 }}>{product?.title}</div>
        <div style={{ fontSize: 36, opacity: 0.8 }}>{product?.price} so'm</div>
      </div>
    ),
    size,
  )
}
```
:::

::: js
```jsx
// app/products/[slug]/opengraph-image.jsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }) {
  const product = await getProduct(params.slug)

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 64, background: '#0f1115', color: '#fff' }}>
        <div style={{ fontSize: 64, fontWeight: 700 }}>{product?.title}</div>
      </div>
    ),
    size,
  )
}
```
:::

`ImageResponse` cheklangan CSS to'plamini qo'llab-quvvatlaydi (flexbox bor, grid yo'q).

## Kod: canonical va takroriy mazmun

```tsx
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { sort } = await searchParams

  return {
    alternates: { canonical: '/products' },              // filtrlangan sahifalar ham asosiyga ishora qiladi
    robots: sort ? { index: false, follow: true } : { index: true, follow: true },
  }
}
```

Filtrlangan va saralangan sahifalar (`?sort=price&page=3`) minglab takroriy URL hosil qiladi. Ular `noindex` bo'lishi va canonical orqali asosiy sahifaga ishora qilishi kerak.

## Muhandislik nuqtai nazari: SEO tekshiruv ro'yxati

Har sahifa uchun:

- [ ] Noyob `<title>` (50–60 belgi)
- [ ] `description` (140–160 belgi)
- [ ] Bitta `<h1>`
- [ ] `og:title`, `og:description`, `og:image` (1200×630)
- [ ] `canonical`
- [ ] Rasmlarda `alt`
- [ ] Mazmun HTML'da (JS o'chirilganda ham ko'rinadi)
- [ ] Ichki havolalar `<Link>` orqali (`<a href>` hosil qiladi)
- [ ] Sahifa `sitemap.xml` da
- [ ] Filtrlangan variantlar `noindex`

Tez tekshiruv:

```bash
curl -s https://example.com/products/42 | grep -E '<title>|og:image|canonical'
```

## Muhandislik nuqtai nazari: metadata va kesh

`generateMetadata` **sahifa render qilinishidan oldin** ishlaydi va uning ma'lumot so'rovlari sahifa bilan bir xil kesh qoidalariga bo'ysunadi (18-bob). Shuning uchun:

- Dinamik metadata sahifani dinamik qilmaydi (agar ma'lumot keshlangan bo'lsa);
- `generateMetadata` ichida `cookies()` ishlatsangiz — sahifa dinamik bo'ladi;
- Og'ir so'rovni faqat metadata uchun qilmang — u sahifa bilan bo'lishilsin.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `metadataBase` ni bermaslik | Nisbiy OG rasm yo'llari ishlamaydi | `new URL('https://...')` |
| Barcha sahifada bir xil `title` | Qidiruvda farqlanmaydi | Sahifaga xos |
| `og:image` ni nisbiy yo'l bilan | Ko'pchilik platforma ochmaydi | To'liq URL yoki `metadataBase` |
| Filtrlangan sahifalarni indekslash | Minglab takroriy mazmun | `noindex` + canonical |
| JSON-LD ni escape qilmaslik | XSS | `.replace(/</g, '\\u003c')` |
| `sitemap.xml` ni qo'lda yozish | Eskiradi | `app/sitemap.ts` |
| `generateMetadata` da `cookies()` | Sahifa dinamik bo'ladi | Kerak bo'lmasa ishlatmang |
| Rasm o'lchamini ko'rsatmaslik | Preview buziladi | `width: 1200, height: 630` |

## Amaliyot

1. Ildiz layoutga `metadataBase` va `title.template` qo'ying; bola sahifada sarlavha qanday birlashishini `curl` bilan tekshiring.
2. Mahsulot sahifasiga `generateMetadata` yozing va Telegram/Facebook debugger'da preview'ni ko'ring.
3. JSON-LD (`Product`) qo'shing va Google Rich Results Test'dan o'tkazing.
4. `app/sitemap.ts` va `app/robots.ts` yozing; `/sitemap.xml` ni brauzerda oching.
5. `opengraph-image.tsx` bilan dinamik OG rasm yarating va uni `/products/42/opengraph-image` da ko'ring.
6. Filtrlangan sahifaga `noindex` qo'ying va `curl` bilan tasdiqlang.

## Rasmiy hujjat

- Metadata: <https://nextjs.org/docs/app/getting-started/metadata-and-og-images>
- `generateMetadata`: <https://nextjs.org/docs/app/api-reference/functions/generate-metadata>
- `sitemap.xml`: <https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap>
- `ImageResponse`: <https://nextjs.org/docs/app/api-reference/functions/image-response>
