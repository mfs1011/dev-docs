# 47 — Deploy: Vercel

[← Oldingi: Ko'p tillilik](46-kop-tillilik.md) · [Mundarija](README.md) · [Keyingi: Deploy: Docker va self-host →](48-docker-selfhost.md)

## Tushuncha

Vercel — Next'ni yaratgan kompaniya platformasi. U Next'ning hamma imkoniyatini qutidan qo'llab-quvvatlaydi: ISR, streaming, Image Optimization, Edge middleware, Server Actions.

Nima sodir bo'lishini tushunish muhim:

```
git push
   │
   ▼
Vercel build
   ├── Statik sahifalar     →  CDN'ga (edge)
   ├── Dinamik sahifalar    →  Serverless funksiyalar
   ├── Middleware           →  Edge runtime
   ├── Route Handlers       →  Serverless funksiyalar
   └── public/, _next/static →  CDN
```

Bitta `next build` chiqishi **uch xil joyga** tarqaladi. Sahifangiz statikmi yoki dinamik — narx va tezlik shunga bog'liq (03, 43-bob).

## Nega shunday

Vercel'ning modeli — **hech narsani sozlamaslik**. `next.config` va kod tuzilmasining o'zi deploy shaklini belgilaydi.

Bu qulay, lekin ikki oqibat bor:

1. **Tasodifiy dinamik sahifa** — narx va TTFB'ni oshiradi, siz sezmaysiz;
2. **Vendor lock-in darajasi** — `after()`, ISR, Image Optimization boshqa joyda boshqacha ishlaydi.

Ikkinchisi ko'pincha bo'rttiriladi: Next self-host qilinadi (48-bob) va asosiy funksiyalar ishlaydi. Lekin ISR keshi, rasm optimizatsiyasi va cron'ni o'zingiz qurishingiz kerak bo'ladi.

## Kod: birinchi deploy

```bash
npm install -g vercel

vercel login
vercel link                  # loyihani bog'lash
vercel env pull .env.local   # productiondagi o'zgaruvchilarni olish

vercel                       # preview deploy
vercel --prod                # production
```

Odatda CLI kerak emas: GitHub repozitoriysini ulasangiz, har push avtomatik deploy bo'ladi.

```
main branch      →  Production
boshqa branch    →  Preview (har PR uchun alohida URL)
```

## Kod: `vercel.json`

Ko'p loyihada bu fayl kerak emas. Kerak bo'ladigan holatlar:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",

  "regions": ["fra1"],

  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" },
    { "path": "/api/cron/weekly-report", "schedule": "0 8 * * 1" }
  ],

  "functions": {
    "app/api/reports/**": { "maxDuration": 300, "memory": 2048 },
    "app/api/webhooks/**": { "maxDuration": 60 }
  },

  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "no-store" }]
    }
  ],

  "redirects": [
    { "source": "/old-blog/:slug", "destination": "/blog/:slug", "permanent": true }
  ]
}
```

**`regions`** — eng muhim sozlama. Funksiyalar bazangizga yaqin bo'lishi kerak:

```
Baza Frankfurtda, funksiya Vashingtonda:
  Har so'rov: 100 ms × 3 so'rov = 300 ms faqat tarmoqqa

Ikkalasi Frankfurtda:
  Har so'rov: 2 ms × 3 = 6 ms
```

O'zbekiston uchun eng yaqin regionlar: `fra1` (Frankfurt), `arn1` (Stokgolm), `dub1` (Dublin). Foydalanuvchilar O'zbekistonda bo'lsa, `fra1` — oqilona tanlov.

Statik kontent baribir CDN'dan, eng yaqin nuqtadan keladi — region faqat **funksiyalarga** taalluqli.

## Kod: muhit o'zgaruvchilari

Uch muhit bor: Production, Preview, Development.

```bash
# CLI orqali
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel env ls
vercel env pull .env.local          # lokalga tortish
```

Tavsiya etilgan taqsimot:

| O'zgaruvchi | Production | Preview | Development |
| --- | --- | --- | --- |
| `DATABASE_URL` | Prod baza | **Alohida** preview baza | Lokal |
| `STRIPE_SECRET_KEY` | `sk_live_...` | `sk_test_...` | `sk_test_...` |
| `RESEND_API_KEY` | Haqiqiy | Test rejimi | Test |
| `AUTH_SECRET` | Alohida | Alohida | Har qanday |
| `NEXT_PUBLIC_APP_URL` | Domen | `VERCEL_URL` | `localhost:3000` |

**Preview'da production bazasini ishlatmang.** PR'dagi migratsiya yoki xato kod haqiqiy ma'lumotni buzadi.

Vercel bergan tizim o'zgaruvchilari:

::: ts
```ts
// lib/env.ts
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_ENV === 'production'
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000')

export const isProduction = process.env.VERCEL_ENV === 'production'
export const isPreview = process.env.VERCEL_ENV === 'preview'

// Deploy versiyasi — Sentry release uchun (49-bob)
export const release = process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
```
:::

::: js
```js
// lib/env.js
export const appUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const isProduction = process.env.VERCEL_ENV === 'production'
export const isPreview = process.env.VERCEL_ENV === 'preview'
export const release = process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev'
```
:::

O'zgaruvchilarni build vaqtida tekshirish — juda foydali:

::: ts
```ts
// lib/env.server.ts
import 'server-only'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string().startsWith('re_'),
  API_URL: z.string().url(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Muhit o\'zgaruvchilari noto\'g\'ri:')
  console.error(parsed.error.flatten().fieldErrors)

  throw new Error('Muhit sozlanmagan')
}

export const env = parsed.data
```
:::

::: js
```js
// lib/env.server.js
import 'server-only'
import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  API_URL: z.string().url(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Muhit o\'zgaruvchilari noto\'g\'ri:', parsed.error.flatten().fieldErrors)

  throw new Error('Muhit sozlanmagan')
}

export const env = parsed.data
```
:::

Yetishmayotgan o'zgaruvchi **build'da** aniqlansin, ish vaqtida emas.

## Kod: build va migratsiya

```json
{
  "scripts": {
    "build": "next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

Vercel `vercel-build` bo'lsa uni ishlatadi.

**Migratsiya build'da — ehtiyotkorlik bilan:**

| Yondashuv | Afzalligi | Xavfi |
| --- | --- | --- |
| Build ichida (`vercel-build`) | Sodda, avtomatik | Preview deploy prod bazasini o'zgartirishi mumkin |
| Alohida CI qadami | Nazorat | Qo'shimcha sozlash |
| Qo'lda | To'liq nazorat | Unutiladi |

Xavfsizroq: faqat production'da:

```json
{
  "scripts": {
    "vercel-build": "node scripts/migrate-if-prod.mjs && next build"
  }
}
```

```js
// scripts/migrate-if-prod.mjs
import { execSync } from 'node:child_process'

if (process.env.VERCEL_ENV !== 'production') {
  console.log('⏭  Migratsiya o\'tkazib yuborildi (production emas)')
  process.exit(0)
}

execSync('npx prisma migrate deploy', { stdio: 'inherit' })
```

Migratsiya tartibi (32-bob): **avval migratsiya, keyin yangi kod**. Ya'ni migratsiya orqaga mos bo'lishi shart — eski kod hali ishlab turadi.

## Kod: kesh va ISR

Vercel'da ISR keshi avtomatik ishlaydi:

::: ts
```ts
// app/blog/[slug]/page.tsx
export const revalidate = 3600                    // soatiga bir marta

export async function generateStaticParams() {
  const posts = await getAllPosts()

  // Eng mashhur 100 tasi build'da, qolgani birinchi so'rovda
  return posts.slice(0, 100).map((post) => ({ slug: post.slug }))
}

export const dynamicParams = true                 // ro'yxatda yo'q slug — serverda render
```
:::

::: js
```js
export const revalidate = 3600

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts.slice(0, 100).map((post) => ({ slug: post.slug }))
}

export const dynamicParams = true
```
:::

On-demand revalidatsiya (19-bob) — kontent CMS'dan kelganda:

::: ts
```ts
// app/api/revalidate/route.ts
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidate-secret') ?? ''
  const expected = process.env.REVALIDATE_SECRET!

  const a = Buffer.from(secret)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { tag, path } = await request.json()

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```
:::

::: js
```js
// app/api/revalidate/route.js
import { NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { timingSafeEqual } from 'node:crypto'

export async function POST(request) {
  const secret = request.headers.get('x-revalidate-secret') ?? ''
  const expected = process.env.REVALIDATE_SECRET

  const a = Buffer.from(secret)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const { tag, path } = await request.json()

  if (tag) revalidateTag(tag)
  if (path) revalidatePath(path)

  return NextResponse.json({ revalidated: true })
}
```
:::

**Muhim:** deploy qilinganda ISR keshi **tozalanadi**. Ya'ni har deploydan keyin birinchi so'rovlar sekin bo'ladi. Kunda 20 marta deploy qilsangiz, ISR foydasi kamayadi.

## Kod: preview deploylar

Har PR o'z URL'ini oladi. Bu eng kuchli imkoniyatlardan biri:

```yaml
# .github/workflows/preview-checks.yml
name: Preview tekshiruvlari

on:
  deployment_status:

jobs:
  test:
    if: github.event.deployment_status.state == 'success'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with: { node-version: 22, cache: npm }

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      # Preview URL'ga qarshi E2E (42-bob)
      - run: npx playwright test
        env:
          BASE_URL: ${{ github.event.deployment_status.environment_url }}

      # Lighthouse (43-bob)
      - uses: treosh/lighthouse-ci-action@v12
        with:
          urls: ${{ github.event.deployment_status.environment_url }}
          budgetPath: ./lighthouse-budget.json
```

Preview'larni himoyalash — Vercel sozlamalarida "Deployment Protection". Yoki qo'lda:

::: ts
```ts
// middleware.ts — preview'ga parol
export function middleware(request: NextRequest) {
  if (process.env.VERCEL_ENV === 'preview') {
    const auth = request.headers.get('authorization')
    const expected = `Basic ${Buffer.from(`preview:${process.env.PREVIEW_PASSWORD}`).toString('base64')}`

    if (auth !== expected) {
      return new NextResponse('Ruxsat kerak', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Preview"' },
      })
    }
  }

  // ... qolgan middleware mantiqi
}
```
:::

::: js
```js
export function middleware(request) {
  if (process.env.VERCEL_ENV === 'preview') {
    const auth = request.headers.get('authorization')
    const expected = `Basic ${Buffer.from(`preview:${process.env.PREVIEW_PASSWORD}`).toString('base64')}`

    if (auth !== expected) {
      return new NextResponse('Ruxsat kerak', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="Preview"' },
      })
    }
  }
}
```
:::

Preview'lar indekslanmasligi kerak:

::: ts
```ts
// app/robots.ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_ENV === 'production'

  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
```
:::

::: js
```js
// app/robots.js
export default function robots() {
  const isProduction = process.env.VERCEL_ENV === 'production'

  if (!isProduction) return { rules: { userAgent: '*', disallow: '/' } }

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin/'] }],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
```
:::

## Kod: funksiya sozlamalari

::: ts
```ts
// app/api/reports/route.ts
export const maxDuration = 300                    // sekund (reja bo'yicha chegara)
export const runtime = 'nodejs'                   // yoki 'edge'
export const dynamic = 'force-dynamic'
export const preferredRegion = ['fra1']           // bazaga yaqin
```
:::

::: js
```js
export const maxDuration = 300
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const preferredRegion = ['fra1']
```
:::

`maxDuration` chegaralari rejaga bog'liq:

| Reja | Sukut | Maksimum |
| --- | --- | --- |
| Hobby | 10 s | 60 s |
| Pro | 15 s | 300 s |
| Enterprise | 15 s | 900 s |

Uzoqroq ish kerak bo'lsa — navbat (36-bob), funksiya vaqtini cho'zish emas.

**Edge vs Node runtime:**

| | Edge | Node |
| --- | --- | --- |
| Sovuq start | ~0 ms | 100–500 ms |
| Joylashuv | Foydalanuvchiga yaqin | Belgilangan region |
| Node API'lari | ❌ Yo'q (`fs`, `crypto` cheklangan) | ✅ To'liq |
| Paketlar | Faqat Web API'ga tayanganlar | Hammasi |
| Prisma | ⚠️ Accelerate bilan | ✅ |
| Xotira chegarasi | 128 MB | 1–3 GB |

Edge — middleware, oddiy yo'naltirish, A/B test uchun. Ma'lumotlar bazasi bilan ishlaydigan har narsa — Node.

## Kod: monorepo

```
repo/
├── apps/
│   ├── web/          ← Next ilova
│   └── admin/        ← ikkinchi Next ilova
├── packages/
│   ├── ui/
│   └── db/
└── package.json
```

Vercel loyiha sozlamalarida:

```
Root Directory:     apps/web
Build Command:      (bo'sh — avtomatik aniqlanadi)
Install Command:    npm install --workspaces
```

Keraksiz build'ni to'xtatish (Ignored Build Step):

```bash
# Faqat shu ilovaga tegishli o'zgarish bo'lsa build qilish
npx turbo-ignore

# yoki qo'lda
git diff --quiet HEAD^ HEAD -- ./apps/web ./packages
```

Bu buyruq `0` qaytarsa, build **o'tkazib yuboriladi**. Monorepo'da bu katta vaqt tejaydi.

::: ts
```ts
// next.config.ts — monorepo uchun
const config: NextConfig = {
  outputFileTracingRoot: join(__dirname, '../../'),  // umumiy paketlar qamrab olinsin
  transpilePackages: ['@repo/ui', '@repo/db'],
}
```
:::

::: js
```js
// next.config.mjs
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const config = {
  outputFileTracingRoot: join(__dirname, '../../'),
  transpilePackages: ['@repo/ui', '@repo/db'],
}

export default config
```
:::

## Kod: domen va yo'naltirishlar

```
Vercel → Settings → Domains
  example.com          (Production)
  www.example.com      → example.com ga yo'naltirish
```

DNS yozuvlari:

```
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

Eski saytdan ko'chayotgan bo'lsangiz, URL'larni saqlang:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  async redirects() {
    return [
      { source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/shop/:path*', destination: '/products/:path*', permanent: true },

      // Shartli — sarlavha yoki cookie bo'yicha
      {
        source: '/beta/:path*',
        has: [{ type: 'cookie', key: 'beta-access', value: 'true' }],
        destination: '/:path*',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return [
      // URL o'zgarmaydi, kontent boshqa joydan
      { source: '/docs/:path*', destination: 'https://docs.example.com/:path*' },
    ]
  },
}
```
:::

::: js
```js
const config = {
  async redirects() {
    return [
      { source: '/old-blog/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/shop/:path*', destination: '/products/:path*', permanent: true },
    ]
  },

  async rewrites() {
    return [{ source: '/docs/:path*', destination: 'https://docs.example.com/:path*' }]
  },
}
```
:::

`permanent: true` = 301 (brauzer va Google eslab qoladi), `false` = 307 (vaqtinchalik). **301 ni qaytarib bo'lmaydi** — brauzerlar uni uzoq keshlaydi. Ishonchingiz komil bo'lmasa, 307 dan boshlang.

## Kod: qaytarish (rollback)

```bash
vercel ls                              # deploylar ro'yxati
vercel rollback <deployment-url>       # oldingi versiyaga qaytish
vercel promote <deployment-url>        # aniq deploy'ni production qilish
```

Yoki panelda: Deployments → uch nuqta → "Promote to Production".

Qaytarish **darhol** ishlaydi (build kerak emas), lekin:

| Nima qaytadi | Nima qaytmaydi |
| --- | --- |
| Kod | Baza migratsiyasi |
| Statik fayllar | Yuborilgan emaillar |
| Konfiguratsiya | Stripe tranzaksiyalari |
| ISR keshi (tozalanadi) | Tashqi xizmatdagi o'zgarishlar |

Shuning uchun migratsiya **orqaga mos** bo'lishi shart: eski kod yangi sxemada ham ishlasin.

## Muhandislik nuqtai nazari: narx nimadan o'sadi

| Manba | Sabab | Kamaytirish |
| --- | --- | --- |
| **Funksiya chaqiruvlari** | Sahifalar keraksiz dinamik | Statik/ISR qiling |
| **Funksiya vaqti** | Sekin baza so'rovlari | Indeks, region, kesh |
| **Image Optimization** | Har o'lcham alohida hisoblanadi | `sizes` cheklang, `minimumCacheTTL` |
| **Trafik (bandwidth)** | Katta bundle, optimizatsiyasiz rasm | 43-bob |
| **Edge middleware** | Har so'rovda ishlaydi | `matcher` ni toraytiring |
| **ISR yozuvlari** | Tez-tez revalidatsiya | `revalidate` ni oshiring |

Eng ko'p uchraydigan qimmat xato — **root layout'da `cookies()`** (43-bob). U butun saytni dinamik qiladi:

```
Statik:   1 000 000 so'rov → CDN → $0
Dinamik:  1 000 000 so'rov → 1 000 000 funksiya chaqiruvi → $$$
```

Tekshiruv: `npm run build` chiqishida nechta `○` (statik) va nechta `ƒ` (dinamik) bor?

Image Optimization'ni cheklash:

::: ts
```ts
const config: NextConfig = {
  images: {
    // Faqat kerakli o'lchamlar — har biri alohida transformatsiya
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365,          // 1 yil
    formats: ['image/avif', 'image/webp'],
  },
}
```
:::

::: js
```js
const config = {
  images: {
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    formats: ['image/avif', 'image/webp'],
  },
}
```
:::

Rasm ko'p bo'lsa, Cloudflare Images yoki imgproxy arzonroq bo'lishi mumkin (34-bob).

## Muhandislik nuqtai nazari: Vercel qachon to'g'ri emas

| Holat | Muammo | Muqobil |
| --- | --- | --- |
| Ma'lumot chegarada qolishi shart | Vercel serverlari chet elda | Self-host (48-bob) |
| Doimiy WebSocket | Serverless ushlab turmaydi | O'z serveringiz (37-bob) |
| Og'ir fon ishlari | 300 s chegara | Navbat + ishchi (36-bob) |
| Juda katta trafik | Narx chiziqli o'sadi | O'z infratuzilmangiz |
| Mavjud Kubernetes | Ikki xil platforma | Docker (48-bob) |
| Byudjet juda cheklangan | Bepul reja kichik | VPS ~$5/oy |

Vercel'ning kuchli tomoni — **tezlik va soddalik**. Jamoangiz kichik bo'lsa va infratuzilmaga vaqt sarflashni xohlamasangiz, u deyarli har doim to'g'ri tanlov.

## Muhandislik nuqtai nazari: reliz jarayoni

```
1. PR ochiladi
   └─ Preview deploy avtomatik
   └─ CI: lint, tip, test (42-bob)
   └─ E2E preview URL'ga qarshi
   └─ Lighthouse byudjeti (43-bob)

2. Review va tasdiqlash

3. main ga merge
   └─ Migratsiya (orqaga mos)
   └─ Production deploy
   └─ Smoke test

4. Kuzatish (49-bob)
   └─ Xato darajasi
   └─ Web Vitals
   └─ Funksiya vaqtlari

5. Muammo bo'lsa: vercel rollback
```

Smoke test — deploydan keyingi 30 soniyalik tekshiruv:

```bash
#!/usr/bin/env bash
# scripts/smoke.sh
set -euo pipefail

BASE="${1:-https://example.com}"

echo "Smoke test: $BASE"

# Bosh sahifa
curl -fsS -o /dev/null -w "  / → %{http_code} (%{time_total}s)\n" "$BASE"

# Sog'liq endpointi
curl -fsS "$BASE/api/health" | grep -q '"ok":true' && echo "  /api/health → ok"

# Muhim sahifalar
for path in /products /login; do
  curl -fsS -o /dev/null -w "  $path → %{http_code}\n" "$BASE$path"
done

echo "✅ Smoke test o'tdi"
```

::: ts
```ts
// app/api/health/route.ts
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, boolean> = {}

  // Baza
  try {
    await db.execute(sql`SELECT 1`)
    checks.database = true
  } catch {
    checks.database = false
  }

  const ok = Object.values(checks).every(Boolean)

  return NextResponse.json(
    {
      ok,
      checks,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
      region: process.env.VERCEL_REGION ?? 'local',
    },
    { status: ok ? 200 : 503 },
  )
}
```
:::

::: js
```js
// app/api/health/route.js
import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks = {}

  try {
    await db.execute(sql`SELECT 1`)
    checks.database = true
  } catch {
    checks.database = false
  }

  const ok = Object.values(checks).every(Boolean)

  return NextResponse.json(
    { ok, checks, version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev' },
    { status: ok ? 200 : 503 },
  )
}
```
:::

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `regions` sozlanmagan | Funksiya bazadan uzoq | `fra1` yoki bazaga yaqin |
| Preview'da prod bazasi | Ma'lumot buziladi | Alohida baza |
| Preview indekslanadi | Google'da dublikat | `robots.ts` da bloklash |
| Build'da migratsiya (har muhitda) | Preview prod'ni o'zgartiradi | Faqat production'da |
| Muhit o'zgaruvchisi tekshirilmaydi | Ish vaqtida qulaydi | Zod bilan build'da |
| Root layout'da `cookies()` | Butun sayt dinamik, qimmat | `Suspense` |
| `maxDuration` yetmaydi | Funksiya uziladi | Navbat (36-bob) |
| Edge runtime'da Prisma | Ishlamaydi | Node runtime |
| `permanent: true` shoshilinch | 301 keshlanadi, qaytmaydi | Avval 307 |
| Rollback'dan keyin migratsiya mos emas | Ilova sinadi | Orqaga mos migratsiya |
| Monorepo'da hamma ilova build bo'ladi | Vaqt va limit isrof | `turbo-ignore` |
| Image o'lchamlari cheklanmagan | Qimmat transformatsiyalar | `deviceSizes` |

## Amaliyot

1. Loyihani Vercel'ga ulang va birinchi preview deploy'ni oling.
2. `npm run build` chiqishini o'qing: nechta sahifa `ƒ`? Kutilganidan ko'pmi?
3. `regions` ni bazangizga yaqin qiling va `/api/health` javob vaqtini oldin/keyin o'lchang.
4. Muhit o'zgaruvchilarini Zod bilan tekshirishni qo'shing va birini o'chirib, build sinishini ko'ring.
5. Preview uchun alohida baza yarating va PR ochib sinang.
6. `robots.ts` ni yozing va preview URL'da `Disallow: /` chiqishini tasdiqlang.
7. Preview URL'ga qarshi E2E ishga tushiradigan CI workflow qo'shing.
8. Smoke test skriptini yozing va deploydan keyin ishga tushiring.
9. `vercel rollback` ni sinab ko'ring — qancha vaqt oldi?

## Rasmiy hujjat

- Vercel + Next.js: <https://vercel.com/docs/frameworks/nextjs>
- `vercel.json`: <https://vercel.com/docs/project-configuration>
- Muhit o'zgaruvchilari: <https://vercel.com/docs/environment-variables>
- Funksiyalar: <https://vercel.com/docs/functions/configuring-functions>
- ISR: <https://vercel.com/docs/incremental-static-regeneration>
- Deploy himoyasi: <https://vercel.com/docs/deployment-protection>
