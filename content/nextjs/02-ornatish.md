# 02 — O'rnatish va loyiha tuzilmasi

[← Oldingi: Next.js nima va nega shunday](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Render strategiyalari →](03-render-strategiyalari.md)

## Tushuncha

```bash
npx create-next-app@latest my-app
```

Savollar va tavsiya etiladigan javoblar:

| Savol | Javob | Sabab |
| --- | --- | --- |
| TypeScript | **Yes** | Ekotizm TS-first |
| ESLint | **Yes** | 42, 45-bob |
| Tailwind CSS | Ixtiyoriy | React qo'llanmasi, 15-bob |
| `src/` directory | **Yes** | Kod va konfiguratsiya ajraladi |
| App Router | **Yes** | Standart (01-bob) |
| Turbopack | **Yes** | Next 16 da standart |
| Import alias | `@/*` | Nisbiy yo'llardan qutulish |

```bash
cd my-app
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # production serverni ishga tushirish
```

## Kod: papka tuzilmasi

```
my-app/
├── src/
│   ├── app/                    ← marshrutlar (App Router)
│   │   ├── layout.tsx          ildiz layout (majburiy)
│   │   ├── page.tsx            /
│   │   ├── globals.css
│   │   ├── (marketing)/        guruh — URL'ga kirmaydi
│   │   ├── products/
│   │   │   ├── page.tsx        /products
│   │   │   └── [slug]/page.tsx /products/:slug
│   │   └── api/
│   │       └── health/route.ts GET /api/health
│   ├── components/             qayta ishlatiladigan UI
│   ├── lib/                    db, api klient, yordamchilar
│   ├── hooks/
│   └── types/
├── public/                     statik fayllar (/logo.svg)
├── next.config.ts
├── tsconfig.json
└── package.json
```

`app/` ichidagi maxsus fayllar (07–10-boblar):

| Fayl | Vazifasi |
| --- | --- |
| `page.tsx` | Marshrut sahifasi (URL hosil qiladi) |
| `layout.tsx` | O'ram; navigatsiyada qayta render bo'lmaydi |
| `template.tsx` | O'ram; har navigatsiyada qayta yaratiladi |
| `loading.tsx` | Suspense fallback |
| `error.tsx` | Error Boundary (klient komponenti) |
| `not-found.tsx` | 404 |
| `route.ts` | HTTP handler (API) |
| `middleware.ts` | So'rov oldidagi qatlam (ildizda) |

**Muhim:** `app/` ichidagi hamma fayl marshrut emas — faqat yuqoridagi nomlar maxsus. `components/ProductCard.tsx` ni `app/products/` ichida saqlash mumkin, u URL hosil qilmaydi.

## Kod: ildiz layout

::: ts
```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
  description: 'Onlayn do\'kon',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// src/app/layout.jsx
import './globals.css'

export const metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
  description: 'Onlayn do\'kon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```
:::

Ildiz layout **majburiy** va u `<html>` hamda `<body>` teglarini o'zi chiqaradi.

## Kod: `next.config.ts`

::: ts
```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Rasm optimizatsiyasi uchun ruxsat etilgan manbalar (43-bob)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com', pathname: '/**' },
    ],
  },

  // Qayta yo'naltirishlar
  async redirects() {
    return [{ source: '/eski-yol', destination: '/yangi-yol', permanent: true }]
  },

  // Tashqi API'ga proksi (CORS'siz)
  async rewrites() {
    return [{ source: '/api/proxy/:path*', destination: 'https://api.example.com/:path*' }]
  },

  // Xavfsizlik sarlavhalari (45-bob)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },

  // Docker deploy uchun (48-bob)
  output: 'standalone',
}

export default config
```
:::

::: js
```js
/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com', pathname: '/**' }],
  },

  async redirects() {
    return [{ source: '/eski-yol', destination: '/yangi-yol', permanent: true }]
  },

  async rewrites() {
    return [{ source: '/api/proxy/:path*', destination: 'https://api.example.com/:path*' }]
  },

  output: 'standalone',
}

export default config
```
:::

## Kod: muhit o'zgaruvchilari

```bash
# .env.local           — lokal, git'ga kirmaydi
DATABASE_URL=postgres://localhost:5432/shop
API_SECRET=super-secret
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**Eng muhim qoida:**

| Prefiks | Qayerda mavjud | Maxfiymi |
| --- | --- | --- |
| `NEXT_PUBLIC_*` | Server **va** klient | ❌ Yo'q — bundle'da ochiq |
| Prefiks siz | Faqat server | ✅ Ha |

```tsx
// Server komponentda — ikkalasi ham ishlaydi
const dbUrl = process.env.DATABASE_URL           // ✓
const apiUrl = process.env.NEXT_PUBLIC_API_URL   // ✓

// Klient komponentda ('use client')
const dbUrl = process.env.DATABASE_URL           // ✗ undefined
const apiUrl = process.env.NEXT_PUBLIC_API_URL   // ✓
```

Tiplar uchun:

```ts
// src/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    API_SECRET: string
    NEXT_PUBLIC_API_URL: string
  }
}
```

Yaxshiroq yechim — runtime'da tekshirish:

```ts
// src/lib/env.ts
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  API_SECRET: z.string().min(16),
  NEXT_PUBLIC_API_URL: z.string().url(),
})

export const env = schema.parse(process.env)      // noto'g'ri bo'lsa build yiqiladi
```

## Kod: skriptlar

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "verify": "npm run lint && npm run typecheck && npm run test && npm run build"
  }
}
```

`next build` tiplarni ham, lint'ni ham tekshiradi (standart holda) — lekin CI'da ularni alohida ishga tushirish tezroq javob beradi (42-bob).

## Kod: statik fayllar va rasm

```
public/
├── favicon.ico
├── robots.txt
└── images/hero.jpg      → /images/hero.jpg
```

```tsx
import Image from 'next/image'
import logo from '@/assets/logo.png'          // import qilingan — o'lchamlar avtomatik

<Image src={logo} alt="Logo" priority />
<Image src="/images/hero.jpg" alt="" width={1200} height={600} priority />
<Image src="https://cdn.example.com/p/1.jpg" alt="" width={400} height={400} />
```

`next/image` avtomatik: format (`avif`/`webp`), `srcset`, lazy loading, o'lcham. Tashqi manbalar `next.config` da ro'yxatdan o'tishi kerak.

## Muhandislik nuqtai nazari: `src/` ichida tuzilma

Loyiha o'sganda (React qo'llanmasi, 34-bob):

```
src/
├── app/                    ← FAQAT marshrutlar va maxsus fayllar
├── features/
│   ├── catalog/            components, queries, actions, types
│   └── cart/
├── shared/
│   ├── ui/                 Button, Input, Modal
│   ├── lib/                db.ts, api.ts, utils.ts
│   └── config/
└── types/
```

Qoida: **`app/` ichida faqat marshrutga tegishli fayllar** qolsin; biznes mantiq `features/` da yashasin. Shunda marshrutlarni qayta tashkil qilish oson bo'ladi.

## Muhandislik nuqtai nazari: Turbopack

Next 16 da `next dev` va `next build` standart holda Turbopack ishlatadi (webpack o'rniga). Amaliy natijalar:

| | Webpack | Turbopack |
| --- | --- | --- |
| Dev server ishga tushishi | Sekin (katta loyihada 10–30 s) | Tez (1–3 s) |
| HMR | Sekinroq | Tez |
| Build | Barqaror | Tez, lekin ba'zi pluginlar qo'llab-quvvatlanmaydi |

Agar webpack plugini kerak bo'lsa: `next dev --webpack`. Amalda bu kamdan-kam kerak.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Sirni `NEXT_PUBLIC_` bilan berish | Bundle'da ochiq ko'rinadi | Prefiks siz (faqat server) |
| `.env.local` ni git'ga qo'shish | Sirlar tarixda qoladi | `.env.example` |
| `app/` ichiga hamma komponentni solish | Marshrut tuzilmasi chalkashadi | `features/`, `components/` |
| Ildiz `layout.tsx` da `<html>`/`<body>` yozmaslik | Next xato beradi | Ular majburiy |
| Tashqi rasm uchun `remotePatterns` sozlamaslik | `next/image` xato beradi | `next.config` |
| `next build` ni CI'da ishlatmaslik | Tip/lint xatolari production'ga chiqadi | `verify` skripti |
| Muhit o'zgaruvchilarini tekshirmaslik | Runtime'da `undefined` | zod bilan `env.ts` |

## Amaliyot

1. `create-next-app` bilan loyiha yarating va `app/page.tsx` ni o'zgartiring.
2. `.env.local` ga ikki o'zgaruvchi qo'shing (biri `NEXT_PUBLIC_`), ikkalasini server va klient komponentda chop eting — farqni ko'ring.
3. `env.ts` ni zod bilan yozing va ataylab noto'g'ri qiymat berib, build yiqilishini tasdiqlang.
4. `next/image` bilan lokal va tashqi rasmni ko'rsating; tashqi manba uchun `remotePatterns` ni sozlang.
5. `npm run build` qiling va `.next/` ichida qanday fayllar borligini ko'ring.

## Rasmiy hujjat

- O'rnatish: <https://nextjs.org/docs/app/getting-started/installation>
- Loyiha tuzilmasi: <https://nextjs.org/docs/app/getting-started/project-structure>
- Muhit o'zgaruvchilari: <https://nextjs.org/docs/app/guides/environment-variables>
- `next.config`: <https://nextjs.org/docs/app/api-reference/config/next-config-js>
