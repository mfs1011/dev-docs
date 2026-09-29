# 46 — Ko'p tillilik

[← Oldingi: Xavfsizlik](45-xavfsizlik.md) · [Mundarija](README.md) · [Keyingi: Deploy: Vercel →](47-vercel.md)

## Tushuncha

O'zbekistonda ilova odatda kamida uch tilda bo'ladi: **o'zbek (lotin), rus, ingliz**. Ba'zan o'zbek kirill ham qo'shiladi.

Ko'p tillilik uch qatlamdan iborat:

| Qatlam | Nima | Misol |
| --- | --- | --- |
| **Marshrutlash** | URL'da til | `/uz/mahsulotlar`, `/ru/tovary` |
| **Interfeys matni** | Tugma, yorliq, xabar | "Saqlash" / "Сохранить" |
| **Kontent** | Ma'lumotlar bazasidagi matn | Mahsulot nomi, tavsif |

Ko'pchilik ikkinchisini hal qilib, uchinchisini unutadi — keyin ma'lumotlar bazasi sxemasini qayta yozishga to'g'ri keladi.

**Muhim:** App Router'da Next'ning o'rnatilgan `i18n` konfiguratsiyasi **ishlamaydi** (38-bob). Marshrutlash qo'lda quriladi.

## Nega shunday

URL strategiyasini tanlash — birinchi qaror, keyin o'zgartirish qiyin:

| Strategiya | URL | SEO | Murakkablik |
| --- | --- | --- | --- |
| **Yo'l prefiksi** | `example.com/uz/...` | ✅ Yaxshi | ⭐⭐ |
| Subdomen | `uz.example.com` | ✅ Yaxshi | ⭐⭐⭐ (DNS, sertifikat) |
| Alohida domen | `example.uz` | ✅ Eng yaxshi (mahalliy) | ⭐⭐⭐⭐ |
| Cookie/sozlama | `example.com/...` | ❌ Yomon | ⭐ |

Oxirgisini tanlamang: qidiruv tizimi bir URL'ni ko'radi va faqat bitta tilni indekslaydi.

**Yo'l prefiksi** — deyarli har doim to'g'ri tanlov.

## Kod: marshrut tuzilmasi

```
app/
├── [locale]/
│   ├── layout.tsx              ← lang, dir, provayder
│   ├── page.tsx                ← /uz, /ru, /en
│   ├── products/
│   │   ├── page.tsx            ← /uz/products
│   │   └── [slug]/page.tsx
│   └── (auth)/
│       └── login/page.tsx
├── api/                        ← tilsiz
└── layout.tsx                  ← minimal ildiz
```

::: ts
```ts
// i18n/config.ts
export const locales = ['uz', 'ru', 'en'] as const
export const defaultLocale = 'uz' satisfies Locale

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  uz: 'O\'zbekcha',
  ru: 'Русский',
  en: 'English',
}

// HTML lang atributi uchun to'liq teg
export const htmlLang: Record<Locale, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}
```
:::

::: js
```js
// i18n/config.js
export const locales = ['uz', 'ru', 'en']
export const defaultLocale = 'uz'

export const localeNames = {
  uz: 'O\'zbekcha',
  ru: 'Русский',
  en: 'English',
}

export const htmlLang = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }

export function isLocale(value) {
  return locales.includes(value)
}
```
:::

## Kod: middleware — tilni aniqlash va yo'naltirish

::: ts
```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, defaultLocale, isLocale } from '@/i18n/config'

const COOKIE = 'NEXT_LOCALE'

function detectLocale(request: NextRequest): string {
  // 1. Foydalanuvchi tanlovi (cookie) — eng yuqori ustuvorlik
  const saved = request.cookies.get(COOKIE)?.value

  if (saved && isLocale(saved)) return saved

  // 2. Accept-Language sarlavhasi
  const headers = { 'accept-language': request.headers.get('accept-language') ?? '' }
  const languages = new Negotiator({ headers }).languages()

  try {
    return match(languages, locales as unknown as string[], defaultLocale)
  } catch {
    return defaultLocale
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Yo'lda til prefiksi bormi?
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )

  if (hasLocale) {
    // Cookie'ni joriy til bilan yangilaymiz
    const current = pathname.split('/')[1]
    const response = NextResponse.next()

    if (request.cookies.get(COOKIE)?.value !== current) {
      response.cookies.set(COOKIE, current, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      })
    }

    return response
  }

  // Prefiks yo'q — aniqlab, yo'naltiramiz
  const locale = detectLocale(request)
  const url = request.nextUrl.clone()

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // api, statik fayllar va kengaytmali fayllar chetlab o'tiladi
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
```
:::

::: js
```js
// middleware.js
import { NextResponse } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { locales, defaultLocale, isLocale } from '@/i18n/config'

const COOKIE = 'NEXT_LOCALE'

function detectLocale(request) {
  const saved = request.cookies.get(COOKIE)?.value

  if (saved && isLocale(saved)) return saved

  const headers = { 'accept-language': request.headers.get('accept-language') ?? '' }
  const languages = new Negotiator({ headers }).languages()

  try {
    return match(languages, locales, defaultLocale)
  } catch {
    return defaultLocale
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  )

  if (hasLocale) return NextResponse.next()

  const locale = detectLocale(request)
  const url = request.nextUrl.clone()

  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```
:::

**Cookie tanlovi `Accept-Language` dan ustun turishi shart.** Foydalanuvchi tilni qo'lda tanlagan bo'lsa, brauzer sozlamasi uni bekor qilmasin.

## Kod: tarjimalar — o'z yechimingiz

Kichik loyihada kutubxona kerak emas:

```
i18n/
├── config.ts
├── dictionaries/
│   ├── uz.json
│   ├── ru.json
│   └── en.json
└── index.ts
```

```json
// i18n/dictionaries/uz.json
{
  "nav": {
    "home": "Bosh sahifa",
    "products": "Mahsulotlar",
    "cart": "Savat",
    "account": "Hisobim"
  },
  "product": {
    "addToCart": "Savatga qo'shish",
    "outOfStock": "Mavjud emas",
    "inStock": "{count} dona mavjud",
    "price": "Narxi"
  },
  "cart": {
    "empty": "Savat bo'sh",
    "itemCount": "{count, plural, one {# ta mahsulot} other {# ta mahsulot}}",
    "total": "Jami"
  },
  "auth": {
    "login": "Kirish",
    "logout": "Chiqish",
    "invalidCredentials": "Pochta yoki parol noto'g'ri"
  }
}
```

::: ts
```ts
// i18n/index.ts
import 'server-only'
import type { Locale } from './config'

// Dinamik import — faqat kerakli til bundle'ga kiradi
const dictionaries = {
  uz: () => import('./dictionaries/uz.json').then((m) => m.default),
  ru: () => import('./dictionaries/ru.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
}

export type Dictionary = Awaited<ReturnType<typeof dictionaries.uz>>

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]()
```
:::

::: js
```js
// i18n/index.js
import 'server-only'

const dictionaries = {
  uz: () => import('./dictionaries/uz.json').then((m) => m.default),
  ru: () => import('./dictionaries/ru.json').then((m) => m.default),
  en: () => import('./dictionaries/en.json').then((m) => m.default),
}

export const getDictionary = async (locale) => dictionaries[locale]()
```
:::

Ishlatish:

::: ts
```tsx
// app/[locale]/layout.tsx
import { notFound } from 'next/navigation'
import { locales, htmlLang, isLocale, type Locale } from '@/i18n/config'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  return (
    <html lang={htmlLang[locale]}>
      <body>{children}</body>
    </html>
  )
}
```

```tsx
// app/[locale]/products/page.tsx
import { getDictionary } from '@/i18n'
import type { Locale } from '@/i18n/config'

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const [dict, products] = await Promise.all([getDictionary(locale), getProducts(locale)])

  return (
    <>
      <h1>{dict.nav.products}</h1>

      {products.map((product) => (
        <article key={product.id}>
          <h2>{product.title}</h2>
          <p>{dict.product.price}: {formatMoney(product.price, locale)}</p>

          <button>{dict.product.addToCart}</button>
        </article>
      ))}
    </>
  )
}
```
:::

::: js
```jsx
// app/[locale]/layout.jsx
import { notFound } from 'next/navigation'
import { locales, htmlLang, isLocale } from '@/i18n/config'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params

  if (!isLocale(locale)) notFound()

  return (
    <html lang={htmlLang[locale]}>
      <body>{children}</body>
    </html>
  )
}

// app/[locale]/products/page.jsx
import { getDictionary } from '@/i18n'

export default async function ProductsPage({ params }) {
  const { locale } = await params
  const [dict, products] = await Promise.all([getDictionary(locale), getProducts(locale)])

  return (
    <>
      <h1>{dict.nav.products}</h1>
      {products.map((product) => (
        <article key={product.id}>
          <h2>{product.title}</h2>
          <button>{dict.product.addToCart}</button>
        </article>
      ))}
    </>
  )
}
```
:::

Server komponentda lug'at **bundle'ga tushmaydi** — bu App Router'ning i18n uchun katta foydasi.

## Kod: klient komponentda tarjima

Klient komponentga faqat **kerakli qismni** uzating:

::: ts
```tsx
// ✅ Faqat kerakli kalitlar
<AddToCartButton
  labels={{
    add: dict.product.addToCart,
    added: dict.product.added,
    outOfStock: dict.product.outOfStock,
  }}
  productId={product.id}
/>
```

```tsx
// app/[locale]/products/AddToCartButton.tsx
'use client'

export function AddToCartButton({
  labels,
  productId,
}: {
  labels: { add: string; added: string; outOfStock: string }
  productId: number
}) {
  const [state, setState] = useState<'idle' | 'added'>('idle')

  return (
    <button onClick={() => { addToCart(productId); setState('added') }}>
      {state === 'added' ? labels.added : labels.add}
    </button>
  )
}
```
:::

::: js
```jsx
<AddToCartButton
  labels={{ add: dict.product.addToCart, added: dict.product.added }}
  productId={product.id}
/>

// AddToCartButton.jsx
'use client'

export function AddToCartButton({ labels, productId }) {
  const [state, setState] = useState('idle')

  return (
    <button onClick={() => { addToCart(productId); setState('added') }}>
      {state === 'added' ? labels.added : labels.add}
    </button>
  )
}
```
:::

Butun lug'atni kontekst orqali uzatish mumkin, lekin unda **hamma tarjima klient bundle'ga tushadi**. 3 til × 500 kalit = sezilarli hajm.

## Kod: `next-intl` bilan

Katta loyihada kutubxona arziydi — u plural, sana, raqam va o'rnatilgan marshrutlashni beradi:

```bash
npm install next-intl
```

::: ts
```ts
// i18n/routing.ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',

  // Tarjima qilingan yo'llar — SEO uchun foydali
  pathnames: {
    '/': '/',
    '/products': {
      uz: '/mahsulotlar',
      ru: '/tovary',
      en: '/products',
    },
    '/products/[slug]': {
      uz: '/mahsulotlar/[slug]',
      ru: '/tovary/[slug]',
      en: '/products/[slug]',
    },
    '/cart': { uz: '/savat', ru: '/korzina', en: '/cart' },
  },
})

// Tilni o'zi biladigan navigatsiya
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
```

```ts
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'Asia/Tashkent',
    now: new Date(),
  }
})
```

```ts
// next.config.ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({})
```

```tsx
// Server komponentda
import { getTranslations, getFormatter } from 'next-intl/server'

export default async function CartPage() {
  const t = await getTranslations('cart')
  const format = await getFormatter()

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('itemCount', { count: items.length })}</p>
      <p>{format.number(total, { style: 'currency', currency: 'UZS' })}</p>
    </>
  )
}

// Klient komponentda
'use client'

import { useTranslations } from 'next-intl'

export function CartButton() {
  const t = useTranslations('cart')

  return <button>{t('checkout')}</button>
}
```
:::

::: js
```js
// i18n/routing.js
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/products': { uz: '/mahsulotlar', ru: '/tovary', en: '/products' },
    '/cart': { uz: '/savat', ru: '/korzina', en: '/cart' },
  },
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)

// Server komponentda
import { getTranslations } from 'next-intl/server'

export default async function CartPage() {
  const t = await getTranslations('cart')

  return <h1>{t('title')}</h1>
}
```
:::

`createNavigation` bergan `Link` — tilni avtomatik qo'shadi:

```tsx
<Link href="/products">…</Link>
// uz: /uz/mahsulotlar
// ru: /ru/tovary
```

## Kod: ko'plik (plural) va formatlash

Bu eng ko'p xato qilinadigan joy:

```json
// en.json — ingliz: 2 shakl
{ "items": "{count, plural, one {# item} other {# items}}" }

// ru.json — rus: 4 shakl
{ "items": "{count, plural, one {# товар} few {# товара} many {# товаров} other {# товара}}" }

// uz.json — o'zbek: son bilan shakl o'zgarmaydi
{ "items": "{count} ta mahsulot" }
```

```
1 товар, 2 товара, 5 товаров, 21 товар, 25 товаров
1 ta mahsulot, 2 ta mahsulot, 5 ta mahsulot
```

**`count === 1 ? 'товар' : 'товаров'` — rus tili uchun noto'g'ri.** ICU MessageFormat buni to'g'ri hal qiladi.

Sana, raqam va pul — har doim `Intl`:

::: ts
```ts
// lib/format.ts
import type { Locale } from '@/i18n/config'

const LOCALE_TAGS: Record<Locale, string> = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }

export function formatMoney(amount: number, locale: Locale, currency = 'UZS') {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(amount)
}

export function formatDate(date: Date | string, locale: Locale) {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'Asia/Tashkent',
  }).format(new Date(date))
}

export function formatRelative(date: Date | string, locale: Locale) {
  const diff = (new Date(date).getTime() - Date.now()) / 1000
  const rtf = new Intl.RelativeTimeFormat(LOCALE_TAGS[locale], { numeric: 'auto' })

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000], ['month', 2592000], ['day', 86400],
    ['hour', 3600], ['minute', 60], ['second', 1],
  ]

  for (const [unit, seconds] of units) {
    if (Math.abs(diff) >= seconds || unit === 'second') {
      return rtf.format(Math.round(diff / seconds), unit)
    }
  }
}

// Ro'yxatni to'g'ri birlashtirish
export function formatList(items: string[], locale: Locale) {
  return new Intl.ListFormat(LOCALE_TAGS[locale], { style: 'long', type: 'conjunction' }).format(items)
}
```
:::

::: js
```js
// lib/format.js
const LOCALE_TAGS = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' }

export function formatMoney(amount, locale, currency = 'UZS') {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(amount)
}

export function formatDate(date, locale) {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'Asia/Tashkent',
  }).format(new Date(date))
}
```
:::

**`timeZone` ni aniq bering.** Serverda UTC, foydalanuvchida Toshkent — sanalar bir kunga farq qilishi mumkin.

## Kod: ma'lumotlar bazasidagi kontent

Interfeys tarjimalari JSON'da, **kontent tarjimalari bazada**. Uch yondashuv:

**1. Alohida jadval (tavsiya):**

::: ts
```ts
// db/schema.ts
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: varchar('sku', { length: 64 }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  stock: integer('stock').notNull().default(0),
})

export const productTranslations = pgTable(
  'product_translations',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 5 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    description: text('description'),
  },
  (table) => [
    uniqueIndex('pt_product_locale_idx').on(table.productId, table.locale),
    uniqueIndex('pt_locale_slug_idx').on(table.locale, table.slug),
  ],
)
```

```ts
// So'rov — fallback bilan
export async function getProducts(locale: Locale) {
  const rows = await db
    .select({
      id: products.id,
      price: products.price,
      title: sql<string>`coalesce(t.title, f.title)`,
      slug: sql<string>`coalesce(t.slug, f.slug)`,
    })
    .from(products)
    .leftJoin(
      sql`${productTranslations} t`,
      sql`t.product_id = ${products.id} AND t.locale = ${locale}`,
    )
    .leftJoin(
      sql`${productTranslations} f`,
      sql`f.product_id = ${products.id} AND f.locale = ${defaultLocale}`,
    )
    .where(gt(products.stock, 0))
    .limit(20)

  return rows
}
```
:::

::: js
```js
export const productTranslations = pgTable(
  'product_translations',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
    locale: varchar('locale', { length: 5 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
  },
  (table) => [uniqueIndex('pt_product_locale_idx').on(table.productId, table.locale)],
)
```
:::

**Fallback majburiy:** yangi mahsulot faqat o'zbekchada kiritilgan bo'lsa, ruscha sahifada bo'sh sarlavha emas, o'zbekcha sarlavha ko'rinsin.

**2. JSONB ustun (soddaroq, kamroq moslashuvchan):**

```sql
ALTER TABLE products ADD COLUMN title jsonb NOT NULL DEFAULT '{}';
-- {"uz": "Telefon", "ru": "Телефон", "en": "Phone"}

-- Indeks
CREATE INDEX products_title_uz_idx ON products ((title->>'uz'));
```

| | Alohida jadval | JSONB |
| --- | --- | --- |
| Indekslash | ✅ Oson | Har til uchun alohida |
| Til qo'shish | Qator qo'shish | Sxema o'zgarmaydi |
| To'liq matn qidiruv | ✅ Oson | Murakkabroq |
| So'rov murakkabligi | JOIN | Soddaroq |
| Tarjima holatini kuzatish | ✅ Oson | Qiyin |

## Kod: SEO — `hreflang` va sitemap

::: ts
```tsx
// app/[locale]/products/[slug]/page.tsx
import type { Metadata } from 'next'
import { locales, type Locale } from '@/i18n/config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug, locale)

  if (!product) return {}

  const base = process.env.NEXT_PUBLIC_APP_URL!

  // Har til uchun O'Z slug'i
  const languages = Object.fromEntries(
    await Promise.all(
      locales.map(async (l) => [l, `${base}/${l}/products/${await getSlug(product.id, l)}`]),
    ),
  )

  return {
    title: product.title,
    description: product.description?.slice(0, 160),

    alternates: {
      canonical: `${base}/${locale}/products/${slug}`,
      languages: {
        ...languages,
        'x-default': `${base}/${defaultLocale}/products/${await getSlug(product.id, defaultLocale)}`,
      },
    },

    openGraph: {
      title: product.title,
      locale: htmlLang[locale].replace('-', '_'),           // uz_UZ
      alternateLocale: locales.filter((l) => l !== locale).map((l) => htmlLang[l].replace('-', '_')),
      images: [product.image],
    },
  }
}
```

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { locales, defaultLocale } from '@/i18n/config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL!
  const products = await getAllProductsWithTranslations()

  const staticPages = ['', '/products', '/about'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    })),
  )

  const productPages = products.flatMap((product) =>
    locales.map((locale) => ({
      url: `${base}/${locale}/products/${product.slugs[locale] ?? product.slugs[defaultLocale]}`,
      lastModified: product.updatedAt,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${base}/${l}/products/${product.slugs[l] ?? product.slugs[defaultLocale]}`]),
        ),
      },
    })),
  )

  return [...staticPages, ...productPages]
}
```
:::

::: js
```js
// app/sitemap.js
import { locales, defaultLocale } from '@/i18n/config'

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL
  const products = await getAllProductsWithTranslations()

  const staticPages = ['', '/products', '/about'].flatMap((path) =>
    locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}${path}`])),
      },
    })),
  )

  return staticPages
}
```
:::

`hreflang` qoidalari:

1. **O'zaro bo'lishi shart** — `/uz` `/ru` ga ishora qilsa, `/ru` ham `/uz` ga ishora qilsin;
2. **O'z-o'ziga ham** — har sahifa o'z tilini ham ro'yxatga qo'shadi;
3. **`x-default`** — til aniqlanmaganda qaysi versiya;
4. **`canonical`** har til uchun o'ziniki (tarjimalar nusxa emas).

## Kod: til almashtirgich

::: ts
```tsx
// components/LocaleSwitcher.tsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { locales, localeNames, type Locale } from '@/i18n/config'

export function LocaleSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(locale: Locale) {
    // /uz/products → /ru/products
    const segments = pathname.split('/')

    segments[1] = locale

    // Cookie'ni yozamiz — keyingi tashriflarda eslab qoladi
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`

    startTransition(() => {
      router.push(segments.join('/'))
      router.refresh()
    })
  }

  return (
    <div role="group" aria-label="Til tanlash">
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => switchTo(locale)}
          disabled={isPending || locale === current}
          aria-current={locale === current ? 'true' : undefined}
          lang={locale}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  )
}
```
:::

::: js
```jsx
'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { locales, localeNames } from '@/i18n/config'

export function LocaleSwitcher({ current }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchTo(locale) {
    const segments = pathname.split('/')

    segments[1] = locale

    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`

    startTransition(() => {
      router.push(segments.join('/'))
      router.refresh()
    })
  }

  return (
    <div role="group" aria-label="Til tanlash">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchTo(locale)}
          disabled={isPending || locale === current}
          aria-current={locale === current ? 'true' : undefined}
          lang={locale}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  )
}
```
:::

Til nomlari **o'z tilida** yozilsin: "Русский", "English" — "Ruscha", "Inglizcha" emas. Ruschani izlaydigan odam "Ruscha" so'zini tushunmasligi mumkin.

Tugmaga `lang` atributi — skrin rider uni to'g'ri talaffuz qilsin (44-bob).

## Kod: tarjimalarni tekshirish

::: ts
```ts
// scripts/check-translations.ts
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'i18n/dictionaries'
const BASE = 'uz'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    return typeof value === 'object' && value !== null
      ? flatten(value as Record<string, unknown>, path)
      : [path]
  })
}

const files = readdirSync(DIR).filter((f) => f.endsWith('.json'))
const base = new Set(flatten(JSON.parse(readFileSync(join(DIR, `${BASE}.json`), 'utf8'))))

let failed = false

for (const file of files) {
  const locale = file.replace('.json', '')

  if (locale === BASE) continue

  const keys = new Set(flatten(JSON.parse(readFileSync(join(DIR, file), 'utf8'))))

  const missing = [...base].filter((k) => !keys.has(k))
  const extra = [...keys].filter((k) => !base.has(k))

  if (missing.length) {
    console.error(`❌ ${locale}: ${missing.length} ta kalit yetishmaydi`)
    missing.slice(0, 10).forEach((k) => console.error(`   - ${k}`))
    failed = true
  }

  if (extra.length) {
    console.warn(`⚠️  ${locale}: ${extra.length} ta ortiqcha kalit`)
  }
}

if (failed) process.exit(1)

console.log('✅ Tarjimalar to\'liq')
```
:::

::: js
```js
// scripts/check-translations.mjs — bir xil mantiq
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIR = 'i18n/dictionaries'
const BASE = 'uz'

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    return typeof value === 'object' && value !== null ? flatten(value, path) : [path]
  })
}

// ... qolgani bir xil
```
:::

Buni CI'ga qo'shing (42-bob) — yetishmayotgan tarjima bilan reliz chiqmasin.

## Muhandislik nuqtai nazari: kutubxona kerakmi

| Ehtiyoj | O'z yechimingiz | `next-intl` |
| --- | --- | --- |
| 2–3 til, sodda matnlar | ✅ Yetadi | Ortiqcha |
| Plural (rus, arab) | ❌ Qo'lda qiyin | ✅ ICU |
| Tarjima qilingan URL'lar | ❌ Qo'lda | ✅ `pathnames` |
| Klient komponentlarda ko'p matn | ❌ Props zanjiri | ✅ Kontekst |
| Sana/raqam formatlash | `Intl` bilan o'zingiz | ✅ O'rnatilgan |
| Tarjimon jamoasi, TMS | ❌ | ✅ Integratsiyalar |
| Bundle hajmi | ✅ 0 | ~15 kB |

**O'zbek + ingliz, oddiy matnlar** — o'z yechimingiz. **Rus tili plural bilan yoki 5+ til** — `next-intl`.

## Muhandislik nuqtai nazari: nima unutiladi

Loyihalarda eng ko'p o'tkazib yuboriladigan joylar:

| Joy | Muammo |
| --- | --- |
| Email shablonlari (36-bob) | Foydalanuvchi tilida yuborilmaydi |
| Xato xabarlari (Zod) | Faqat inglizcha |
| Sana formati | `toLocaleDateString()` locale'siz |
| Valyuta | Doim `so'm`, ruscha sahifada ham |
| `alt` matnlari | Tarjima qilinmagan |
| Meta tavsiflar | Faqat asosiy tilda |
| 404 va xato sahifalari | Til prefiksisiz |
| PDF/hisob-faktura | Faqat bitta tilda |
| Skrin rider e'lonlari (44-bob) | Tarjimasiz |
| Vaqt zonasi | Server UTC, foydalanuvchi boshqa |

Zod xatolarini tarjima qilish:

::: ts
```ts
import { z } from 'zod'

export function localizedSchema(dict: Dictionary) {
  return z.object({
    email: z.string().email(dict.errors.invalidEmail),
    password: z.string().min(8, dict.errors.passwordTooShort),
  })
}
```
:::

::: js
```js
export function localizedSchema(dict) {
  return z.object({
    email: z.string().email(dict.errors.invalidEmail),
    password: z.string().min(8, dict.errors.passwordTooShort),
  })
}
```
:::

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| App Router'da `i18n` konfiguratsiyasi | Ishlamaydi | `[locale]` marshruti |
| `Accept-Language` cookie'dan ustun | Foydalanuvchi tanlovi bekor bo'ladi | Cookie birinchi |
| `hreflang` o'zaro emas | Google e'tiborsiz qoldiradi | Har tomonlama |
| `x-default` yo'q | Noma'lum til uchun yo'nalish yo'q | Qo'shing |
| Lug'atni klientga to'liq uzatish | Bundle shishadi | Faqat kerakli kalitlar |
| `count === 1 ? a : b` | Rus tilida noto'g'ri | ICU plural |
| `toLocaleDateString()` locale'siz | Server va klient farq qiladi | Aniq locale + timeZone |
| Kontent uchun fallback yo'q | Bo'sh sarlavhalar | `coalesce` |
| Til nomlari tarjima qilingan | "Ruscha" ni rus tushunmaydi | "Русский" |
| Email tili hisobga olinmaydi | Foydalanuvchi tushunmaydi | Til ustunini saqlang |
| Tarjima to'liqligi tekshirilmaydi | Bo'sh matnlar productionda | CI skripti |
| `middleware` matcher statik fayllarni qamraydi | Rasm `/uz/logo.png` ga ketadi | `.*\\..*` chetlatish |

## Amaliyot

1. `[locale]` marshrutini va middleware'ni sozlang; `/products` ni oching — `/uz/products` ga yo'naltirilishini tekshiring.
2. Brauzer tilini rus qilib, cookie'ni tozalab kiring — ruscha versiya ochilishi kerak.
3. Til almashtirgichni yozing; almashtirgandan keyin cookie saqlanishini va qayta kirganda eslab qolinishini tasdiqlang.
4. Ruscha plural qoidasini sinang: 1, 2, 5, 21, 25 mahsulot uchun to'g'ri shakl chiqadimi?
5. `hreflang` teglarini sahifa manbasida ko'ring va o'zaro to'g'ri ekanini tekshiring.
6. Sitemap'ni oching va har URL'da `alternates` borligini tasdiqlang.
7. Tarjima tekshirish skriptini yozing va bitta kalitni ataylab o'chirib, CI qizil bo'lishini ko'ring.
8. Ma'lumotlar bazasida tarjimasi yo'q mahsulot yarating va fallback ishlashini tekshiring.

## Rasmiy hujjat

- Next.js i18n (App Router): <https://nextjs.org/docs/app/guides/internationalization>
- `next-intl`: <https://next-intl.dev>
- ICU MessageFormat: <https://unicode-org.github.io/icu/userguide/format_parse/messages/>
- `Intl` API: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl>
- Google: ko'p tilli saytlar: <https://developers.google.com/search/docs/specialty/international/localized-versions>
