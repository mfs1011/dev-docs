# 05 — TypeScript va konfiguratsiya

[← Oldingi: Server va klient chegarasi](04-server-klient-chegarasi.md) · [Mundarija](README.md) · [Keyingi: Turbopack va build →](06-turbopack-va-build.md)

## Tushuncha

Next TypeScript'ni o'zi sozlaydi, lekin App Router'da bir nechta o'ziga xos tip naqshlari bor: `params` va `searchParams` — `Promise`, metadata tiplari, Route Handler imzolari, Server Action tiplari.

Bu bob shularni yig'adi. Umumiy React + TS mavzulari — React qo'llanmasining 45-bobida.

## Kod: sahifa va layout tiplari

::: ts
```tsx
// app/products/[slug]/page.tsx
type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { tab = 'description' } = await searchParams

  // ...
}

// Layout
type LayoutProps = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function ProductLayout({ children, params }: LayoutProps) {
  // ...
}

// Parallel marshrutlar bilan (12-bob)
type DashboardLayoutProps = {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}
```
:::

::: js
```jsx
// app/products/[slug]/page.jsx
export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params
  const { tab = 'description' } = await searchParams

  // ...
}

export default async function ProductLayout({ children, params }) {
  // ...
}
```
:::

**Next 15+ o'zgarishi:** `params` va `searchParams` — `Promise`. Eski kodda ular sinxron edi; migratsiya uchun `npx @next/codemod@latest next-async-request-api .` mavjud.

## Kod: metadata

::: ts
```tsx
import type { Metadata } from 'next'

// Statik
export const metadata: Metadata = {
  title: 'Mahsulotlar',
  description: 'Katalogdagi barcha mahsulotlar',
}

// Dinamik (13-bob)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Topilmadi' }

  return {
    title: product.title,
    description: product.excerpt,
    openGraph: {
      title: product.title,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
  }
}
```
:::

::: js
```jsx
export const metadata = {
  title: 'Mahsulotlar',
  description: 'Katalogdagi barcha mahsulotlar',
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return { title: 'Topilmadi' }

  return {
    title: product.title,
    description: product.excerpt,
    openGraph: { title: product.title, images: [{ url: product.image, width: 1200, height: 630 }] },
  }
}
```
:::

## Kod: Route Handler

::: ts
```ts
// app/api/products/route.ts
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const products = await db.product.findMany({ skip: (page - 1) * 20, take: 20 })

  return NextResponse.json({ items: products })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  return NextResponse.json({ id: 1 }, { status: 201 })
}

// Dinamik segment bilan
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // ...
}
```
:::

::: js
```js
// app/api/products/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const products = await db.product.findMany({ skip: (page - 1) * 20, take: 20 })

  return NextResponse.json({ items: products })
}

export async function GET(request, { params }) {
  const { id } = await params
  // ...
}
```
:::

Batafsil — 15-bob.

## Kod: muhit o'zgaruvchilarini tiplash

```ts
// src/lib/env.ts
import { z } from 'zod'

const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(16),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
})

// Server tomonda hammasi
export const env = {
  ...serverSchema.parse(process.env),
  ...clientSchema.parse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  }),
}
```

Diqqat: `process.env` klientda **to'liq obyekt sifatida mavjud emas** — Next `NEXT_PUBLIC_*` larni build vaqtida matn sifatida almashtiradi. Shuning uchun klient sxemasida har bir kalitni **aniq yozish** kerak (yuqoridagi kabi), aks holda `undefined` chiqadi.

## Kod: `tsconfig.json`

Next avtomatik yaratadi; qo'shishga arziydigan sozlamalar:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`.next/types/**/*.ts` — Next generatsiya qiladigan tiplar (marshrutlar, sahifa props'lari). Ular `next dev`/`next build` paytida yangilanadi.

## Kod: tipli marshrutlar

```ts
// next.config.ts
export default {
  typedRoutes: true,
}
```

```tsx
import Link from 'next/link'

<Link href="/products">Katalog</Link>          // ✓
<Link href="/prodcts">Katalog</Link>           // ✗ kompilyatsiya xatosi

// Dinamik
<Link href={`/products/${slug}`}>Mahsulot</Link>
```

Bu — Next'ning eng foydali TS imkoniyatlaridan biri: URL xatolari **build vaqtida** ushlanadi.

## Kod: Server Action tiplari

::: ts
```ts
// app/actions.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  title: z.string().min(3),
  price: z.coerce.number().int().positive(),
})

export type ActionState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createProduct(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  await db.product.create({ data: parsed.data })

  return { success: true }
}
```
:::

::: js
```js
// app/actions.js
'use server'

import { z } from 'zod'

const schema = z.object({
  title: z.string().min(3),
  price: z.coerce.number().int().positive(),
})

export async function createProduct(prevState, formData) {
  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  await db.product.create({ data: parsed.data })

  return { success: true }
}
```
:::

Batafsil — 21, 22-boblar.

## Kod: konfiguratsiya sozlamalari

```ts
// next.config.ts — amaliy to'plam
import type { NextConfig } from 'next'

const config: NextConfig = {
  typedRoutes: true,

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }],
    formats: ['image/avif', 'image/webp'],
  },

  experimental: {
    reactCompiler: true,          // React Compiler (React qo'llanmasi, 07-bob)
  },

  // Docker uchun (48-bob)
  output: 'standalone',

  // Build'da lint va tiplarni o'tkazib yuborish — TAVSIYA ETILMAYDI
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
}

export default config
```

Oxirgi ikki sozlama vaqtinchalik "tezda deploy qilish" uchun ishlatiladi va keyin unutiladi — natijada xatolar production'ga chiqadi. Ularni yozmang (42-bob).

## Muhandislik nuqtai nazari: server va klient tiplarini ajratish

```
src/
├── lib/
│   ├── db.ts                 import 'server-only'
│   ├── auth.ts               import 'server-only'
│   └── api-client.ts         klient uchun (28-bob)
└── types/
    ├── domain.ts             ikkalasida ishlatiladi (User, Product)
    └── api.ts                API shakllari
```

Domen tiplari umumiy bo'ladi, lekin **implementatsiya** ajratiladi: `db.ts` hech qachon klientga tushmasligi kerak (04-bob).

## Muhandislik nuqtai nazari: sxemadan tip chiqarish

```ts
// Bir manba: sxema → tip + validatsiya
export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  price: z.number().int().positive(),
})

export type Product = z.infer<typeof productSchema>
```

Bu naqsh Next'da ayniqsa foydali, chunki bir xil sxema **uch joyda** ishlatiladi:

1. Server Action'da forma validatsiyasi (22-bob);
2. Route Handler'da so'rov tanasi (15-bob);
3. Tashqi API javobini tekshirish (29-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `params` ni `await` qilmaslik | Next 15+ da u Promise | `const { slug } = await params` |
| `typescript.ignoreBuildErrors` | Xatolar production'ga chiqadi | Tuzating |
| Klientda `process.env` obyektini o'qish | Faqat `NEXT_PUBLIC_*` almashtiriladi | Har kalitni aniq yozing |
| `typedRoutes` ni yoqmaslik | URL xatolari runtime'da chiqadi | Yoqing |
| Server va klient tiplarini aralashtirish | `db.ts` klientga tushishi mumkin | `server-only` (04-bob) |
| Metadata tiplarini yozmaslik | Xato maydonlar jim o'tadi | `Metadata` tipi |
| `.next/types` ni `tsconfig` dan chiqarib tashlash | Generatsiya qilingan tiplar ishlamaydi | `include` da qoldiring |

## Amaliyot

1. Dinamik sahifa yozing va `params` ni `await` qilmasdan ishlatib ko'ring — xatoni o'qing.
2. `typedRoutes: true` ni yoqing va noto'g'ri URL bilan `<Link>` yozib, kompilyatsiya xatosini ko'ring.
3. `env.ts` ni zod bilan yozing; `.env.local` dan bitta kalitni o'chirib, build yiqilishini tasdiqlang.
4. `generateMetadata` yozing va `curl` bilan HTML'da meta teglar borligini tekshiring.
5. Route Handler yozing va uning tiplarini `NextRequest`/`NextResponse` bilan to'ldiring.

## Rasmiy hujjat

- TypeScript: <https://nextjs.org/docs/app/api-reference/config/typescript>
- Sahifa va layout tiplari: <https://nextjs.org/docs/app/api-reference/file-conventions/page>
- `typedRoutes`: <https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes>
