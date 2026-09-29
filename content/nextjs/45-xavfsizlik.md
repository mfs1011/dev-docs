# 45 — Xavfsizlik

[← Oldingi: Erishimlilik](44-erishimlilik.md) · [Mundarija](README.md) · [Keyingi: Ko'p tillilik →](46-kop-tillilik.md)

## Tushuncha

Next ilovasida xavfsizlik bitta savolga bog'lanadi: **kod qayerda ishlaydi va nima uzatiladi?**

```
Server                    ║  Chegara  ║              Klient
──────────────────────────╫───────────╫──────────────────────────
Sirlar, DB parollari      ║           ║  Hech narsa maxfiy emas
ORM, fayl tizimi          ║  RSC      ║  Hamma narsa ochiq
Ruxsat qarorlari          ║  payload  ║  Hamma narsa o'zgartirilishi
                          ║  Action   ║  mumkin
                          ║  ID'lari  ║
```

Chegaradan o'tgan hamma narsa — **ochiq**. RSC payload'ini DevTools'da o'qish mumkin, Server Action'ni `curl` bilan chaqirish mumkin, `NEXT_PUBLIC_` o'zgaruvchi bundle'da matn bo'lib turadi.

Bu bob oldingi boblardagi xavfsizlik qoidalarini bir joyga yig'adi va yangilarini qo'shadi.

## Nega shunday

Uchta Next'ga xos xavf, ular boshqa freymvorklarda yo'q:

1. **Server Action — ochiq endpoint.** U komponentga o'xshab ko'rinadi, lekin aslida POST endpoint. Sahifani ko'rmasdan ham chaqirish mumkin (30-bob).
2. **RSC payload — server ma'lumoti.** Server komponentdan klient komponentga uzatilgan har narsa HTML bilan birga yuboriladi va DevTools'da ko'rinadi (26-bob).
3. **Middleware — xavfsizlik chegarasi emas.** 2025-yilda uni chetlab o'tish zaifligi topilgan edi (CVE-2025-29927). Himoya ma'lumotga yaqin bo'lishi kerak (30-bob).

## Kod: sirlarni ajratish

::: ts
```ts
// ❌ NEXT_PUBLIC_ = bundle'da OCHIQ matn
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_live_...        // 🚩 falokat
NEXT_PUBLIC_DATABASE_URL=postgres://...          // 🚩 falokat
NEXT_PUBLIC_API_SECRET=...                       // 🚩 falokat

// ✅ To'g'ri ajratish
STRIPE_SECRET_KEY=sk_live_...                    // faqat server
DATABASE_URL=postgres://...                      // faqat server
AUTH_SECRET=...                                  // faqat server

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...   // ochiq bo'lishi KERAK
NEXT_PUBLIC_APP_URL=https://example.com          // ochiq
```
:::

::: js
```bash
# .env.local
STRIPE_SECRET_KEY=sk_live_...
DATABASE_URL=postgres://...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://example.com
```
:::

Tekshirish:

```bash
# Build'dan keyin sirlar bundle'da bormi?
npm run build
grep -r "sk_live\|postgres://\|AUTH_SECRET" .next/static/ && echo "🚩 SIR SIZDI"

# Muhit o'zgaruvchilarini audit qilish
grep -rn "NEXT_PUBLIC_.*\(SECRET\|KEY\|TOKEN\|PASSWORD\|PRIVATE\)" --include="*.ts" --include="*.tsx" .
```

Ikkinchi qatlam — `server-only` paketi:

```bash
npm install server-only
```

::: ts
```ts
// lib/db.ts
import 'server-only'                             // klientga import qilinsa BUILD sinadi

export const db = drizzle(...)
```

```ts
// lib/config.ts — klient uchun mo'ljallangan
import 'client-only'                             // serverda ishlatilsa build sinadi

export const config = { appUrl: process.env.NEXT_PUBLIC_APP_URL }
```
:::

::: js
```js
// lib/db.js
import 'server-only'

export const db = drizzle(/* ... */)
```
:::

`import 'server-only'` — bir qator, lekin u **butun import daraxtini** himoya qiladi: bu fayl klient komponentga (to'g'ridan-to'g'ri yoki bilvosita) kirsa, build to'xtaydi.

`taintObjectReference` bilan aniq obyektlarni belgilash ham mumkin:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  experimental: { taint: true },
}
```

```ts
// lib/dal.ts
import { experimental_taintObjectReference as taint } from 'react'

export async function getUser(id: number) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) })

  // Bu obyekt klient komponentga uzatilsa — XATO
  taint('Foydalanuvchi obyektini klientga uzatmang', user)

  return user
}
```
:::

::: js
```js
import { experimental_taintObjectReference as taint } from 'react'

export async function getUser(id) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) })

  taint('Foydalanuvchi obyektini klientga uzatmang', user)

  return user
}
```
:::

## Kod: Server Action himoyasi

Har Server Action — **uch qadam, istisnosiz**:

::: ts
```ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireSession, requirePermission } from '@/lib/dal'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  orderId: z.coerce.number().int().positive(),
  note: z.string().trim().max(500),
})

export async function updateOrderNote(formData: FormData) {
  // 1. RUXSAT
  const session = await requireSession()

  // 2. TEZLIK CHEGARASI
  const limited = await rateLimit(`note:${session.userId}`, { max: 20, windowSec: 60 })

  if (!limited.ok) return { message: 'Juda ko\'p urinish. Biroz kuting.' }

  // 3. VALIDATSIYA
  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  // 4. EGALIK — bu eng ko'p unutiladigan qadam
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parsed.data.orderId),
    columns: { id: true, userId: true },
  })

  if (!order) return { message: 'Topilmadi' }

  if (order.userId !== session.userId && !session.roles.includes('admin')) {
    return { message: 'Topilmadi' }              // 403 emas, 404 — mavjudligi bilinmasin
  }

  // 5. AMAL
  await db
    .update(orders)
    .set({ note: parsed.data.note })
    .where(eq(orders.id, parsed.data.orderId))

  revalidatePath(`/orders/${parsed.data.orderId}`)

  return { ok: true }
}
```
:::

::: js
```js
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { requireSession } from '@/lib/dal'
import { rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  orderId: z.coerce.number().int().positive(),
  note: z.string().trim().max(500),
})

export async function updateOrderNote(formData) {
  const session = await requireSession()

  const limited = await rateLimit(`note:${session.userId}`, { max: 20, windowSec: 60 })

  if (!limited.ok) return { message: 'Juda ko\'p urinish. Biroz kuting.' }

  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const order = await getOrderOwner(parsed.data.orderId)

  if (!order) return { message: 'Topilmadi' }

  if (order.userId !== session.userId && !session.roles.includes('admin')) {
    return { message: 'Topilmadi' }
  }

  await db.update(orders).set({ note: parsed.data.note }).where(eq(orders.id, parsed.data.orderId))

  revalidatePath(`/orders/${parsed.data.orderId}`)

  return { ok: true }
}
```
:::

**Yopiq o'zgaruvchilar (closure) — yashirin xavf:**

::: ts
```tsx
// ⚠️ Diqqat: bu qiymatlar shifrlangan holda KLIENTGA yuboriladi va qaytadi
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  async function approve() {
    'use server'

    // `order` — closure orqali keladi. Next uni shifrlab klientga yuboradi,
    // action chaqirilganda qaytarib oladi. Shifrlangan, lekin hajmi katta.
    await db.update(orders).set({ status: 'APPROVED' }).where(eq(orders.id, order.id))
  }

  return <form action={approve}><button>Tasdiqlash</button></form>
}

// ✅ Yaxshiroq: faqat ID uzating va serverda qayta yuklang
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  return (
    <form action={approveOrder}>
      <input type="hidden" name="orderId" value={order.id} />
      <button type="submit">Tasdiqlash</button>
    </form>
  )
}

// actions.ts — ruxsat va egalik shu yerda qayta tekshiriladi
export async function approveOrder(formData: FormData) {
  'use server'

  await requirePermission('orders.approve')

  const orderId = Number(formData.get('orderId'))

  // ... egalik tekshiruvi, keyin amal
}
```
:::

::: js
```jsx
// ✅ Faqat ID
export default async function OrderPage({ params }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  return (
    <form action={approveOrder}>
      <input type="hidden" name="orderId" value={order.id} />
      <button type="submit">Tasdiqlash</button>
    </form>
  )
}
```
:::

`<input type="hidden">` qiymatiga **ishonmang** — foydalanuvchi uni o'zgartirishi mumkin. Shuning uchun serverda egalik qayta tekshiriladi.

## Kod: XSS

React sukut bo'yicha ekranlaydi. Ikki teshik bor:

::: ts
```tsx
// 1. dangerouslySetInnerHTML
import DOMPurify from 'isomorphic-dompurify'

export function RichContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3', 'blockquote', 'code'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,   // javascript: bloklanadi
  })

  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}

// 2. href / src ga foydalanuvchi kiritmasi
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
  let safe: string

  try {
    const parsed = new URL(url)

    // javascript:, data:, vbscript: — bloklanadi
    safe = ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? url : '#'
  } catch {
    safe = '#'
  }

  return (
    <a href={safe} rel="noopener noreferrer nofollow" target="_blank">
      {children}
    </a>
  )
}
```
:::

::: js
```jsx
import DOMPurify from 'isomorphic-dompurify'

export function RichContent({ html }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
  })

  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```
:::

**Sanitizatsiya serverda qilinsin** — klientda qilinsa, hujumchi uni chetlab o'tishi mumkin.

`target="_blank"` bilan `rel="noopener"` majburiy: usiz ochilgan sahifa `window.opener` orqali sizning sahifangizni boshqara oladi.

## Kod: CSP (Content Security Policy)

CSP — XSS'ga qarshi oxirgi himoya qatlami. Nonce bilan:

::: ts
```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,            // Next inline stil ishlatadi
    `img-src 'self' blob: data: https://cdn.example.com`,
    `font-src 'self'`,
    `connect-src 'self' https://api.example.com`,
    `frame-ancestors 'none'`,                      // clickjacking himoyasi
    `form-action 'self'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ')

  const headers = new Headers(request.headers)

  headers.set('x-nonce', nonce)
  headers.set('Content-Security-Policy', csp)

  const response = NextResponse.next({ request: { headers } })

  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
```

```tsx
// app/layout.tsx — nonce'ni skriptlarga berish
import { headers } from 'next/headers'
import Script from 'next/script'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="uz">
      <body>
        {children}

        <Script src="https://analytics.example.com/s.js" nonce={nonce} strategy="afterInteractive" />
      </body>
    </html>
  )
}
```
:::

::: js
```js
// middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https://cdn.example.com`,
    `frame-ancestors 'none'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ')

  const headers = new Headers(request.headers)

  headers.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers } })

  response.headers.set('Content-Security-Policy', csp)

  return response
}
```
:::

CSP'ni birdan yoqmang — avval **hisobot rejimida**:

```
Content-Security-Policy-Report-Only: ...; report-uri /api/csp-report
```

Bir hafta hisobotlarni kuzating, buzilishlarni tuzating, keyin haqiqiy rejimga o'ting.

Qolgan xavfsizlik sarlavhalari:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  poweredByHeader: false,                          // X-Powered-By: Next.js — kerak emas

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ]
  },
}
```
:::

::: js
```js
// next.config.mjs
const config = {
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ]
  },
}
```
:::

## Kod: CSRF

Server Action'lar uchun Next o'zi himoya beradi: u `Origin` sarlavhasini `Host` bilan solishtiradi. Qo'shimcha token kerak emas.

Lekin bu **faqat Server Action'larga** taalluqli. Route Handler'lar (`POST /api/...`) o'zingizniki:

::: ts
```ts
// lib/csrf.ts
import { headers } from 'next/headers'

export async function assertSameOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  const host = h.get('host')

  if (!origin) return                              // GET yoki server-server so'rov

  const allowed = [`https://${host}`, `http://${host}`]

  if (!allowed.includes(origin)) {
    throw new Error('CSRF: origin mos kelmadi')
  }
}
```

```ts
// app/api/orders/route.ts
export async function POST(request: Request) {
  await assertSameOrigin()

  // ...
}
```
:::

::: js
```js
// lib/csrf.js
import { headers } from 'next/headers'

export async function assertSameOrigin() {
  const h = await headers()
  const origin = h.get('origin')
  const host = h.get('host')

  if (!origin) return

  if (![`https://${host}`, `http://${host}`].includes(origin)) {
    throw new Error('CSRF: origin mos kelmadi')
  }
}
```
:::

`sameSite: 'lax'` cookie (26-bob) ko'p CSRF hujumini o'zi to'xtatadi — lekin ikki qatlam yaxshiroq.

Konfiguratsiya orqali ruxsat etilgan originlarni cheklash:

::: ts
```ts
// next.config.ts
const config: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['example.com', '*.example.com'],
    },
  },
}
```
:::

::: js
```js
const config = {
  experimental: {
    serverActions: { allowedOrigins: ['example.com', '*.example.com'] },
  },
}
```
:::

## Kod: tezlik chegarasi (rate limiting)

::: ts
```ts
// lib/rate-limit.ts
import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

const limiters = {
  // Login — qat'iy
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'rl:auth',
    analytics: true,
  }),
  // Oddiy API
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'rl:api',
  }),
  // Qimmat amallar (email, PDF)
  heavy: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'rl:heavy',
  }),
}

export async function rateLimit(
  identifier: string,
  kind: keyof typeof limiters = 'api',
) {
  const { success, limit, remaining, reset } = await limiters[kind].limit(identifier)

  return { ok: success, limit, remaining, reset }
}

/** IP ni ishonchli olish */
export async function clientIp() {
  const h = await headers()

  // Vercel: x-forwarded-for ishonchli. O'z proksingizda — eng o'ngdagi ishonchli qiymat
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? h.get('x-real-ip') ?? 'noma\'lum'
}
```

```ts
// Login Server Action'ida (27-bob)
export async function login(prev: State, formData: FormData) {
  const ip = await clientIp()
  const limited = await rateLimit(ip, 'auth')

  if (!limited.ok) {
    return { message: `Juda ko'p urinish. ${new Date(limited.reset).toLocaleTimeString('uz-UZ')} da qayta urining.` }
  }

  // ...
}
```
:::

::: js
```js
// lib/rate-limit.js
import 'server-only'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

const redis = Redis.fromEnv()

const limiters = {
  auth: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '15 m'), prefix: 'rl:auth' }),
  api: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '1 m'), prefix: 'rl:api' }),
}

export async function rateLimit(identifier, kind = 'api') {
  const { success, limit, remaining, reset } = await limiters[kind].limit(identifier)

  return { ok: success, limit, remaining, reset }
}

export async function clientIp() {
  const h = await headers()

  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'nomalum'
}
```
:::

**IP sarlavhalariga ehtiyot bo'ling.** `x-forwarded-for` ni foydalanuvchi soxtalashtirishi mumkin, agar sizning proksingiz uni qayta yozmasa. Vercel/Cloudflare orqasida ishonchli; o'z nginx'ingizda `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;` sozlangan bo'lishi kerak.

Chegara kalitini to'g'ri tanlang:

| Amal | Kalit | Nega |
| --- | --- | --- |
| Login | IP + email | Bitta hisobga hujumni ham to'xtatadi |
| Ro'yxatdan o'tish | IP | Spam hisoblar |
| Email yuborish | userId | Hisobdan spam |
| API o'qish | userId yoki IP | Odatiy |
| Parol tiklash | email | Hisobga hujum |

## Kod: SQL va NoSQL injection

ORM ishlatsangiz (32, 33-bob) himoyalangansiz — **xom SQL'dan tashqari**:

::: ts
```ts
// ❌ SQL injection
await db.execute(sql.raw(`SELECT * FROM users WHERE email = '${email}'`))
await prisma.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`)

// ✅ Parametrlangan
await db.execute(sql`SELECT * FROM users WHERE email = ${email}`)
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`

// ⚠️ Ustun nomi parametr bo'la olmaydi — OQ RO'YXAT
const SORTABLE = { created: 'created_at', total: 'total', number: 'number' } as const

function sortColumn(input: string) {
  return SORTABLE[input as keyof typeof SORTABLE] ?? 'created_at'
}

await db.execute(sql`SELECT * FROM orders ORDER BY ${sql.identifier(sortColumn(userInput))}`)
```
:::

::: js
```js
// ✅ Parametrlangan
await db.execute(sql`SELECT * FROM users WHERE email = ${email}`)

// ⚠️ Ustun nomi — oq ro'yxat
const SORTABLE = { created: 'created_at', total: 'total' }

const column = SORTABLE[userInput] ?? 'created_at'
```
:::

**Mass assignment** — kam eslanadigan xavf:

::: ts
```ts
// ❌ Foydalanuvchi `role: 'ADMIN'` yuborishi mumkin
const data = Object.fromEntries(formData)

await db.update(users).set(data).where(eq(users.id, session.userId))

// ✅ Zod faqat ruxsat etilgan maydonlarni o'tkazadi
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional(),
})
// strict() — noma'lum maydon bo'lsa rad etadi
const parsed = schema.strict().safeParse(Object.fromEntries(formData))

if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

await db.update(users).set(parsed.data).where(eq(users.id, session.userId))
```
:::

::: js
```js
// ✅
const schema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional(),
})

const parsed = schema.strict().safeParse(Object.fromEntries(formData))

if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

await db.update(users).set(parsed.data).where(eq(users.id, session.userId))
```
:::

## Kod: SSRF va ochiq yo'naltirish

::: ts
```ts
// ❌ SSRF: foydalanuvchi ichki tarmoqqa so'rov yubortiradi
export async function fetchPreview(url: string) {
  const response = await fetch(url)               // http://169.254.169.254/ — bulut metadata!

  return response.text()
}

// ✅ Oq ro'yxat va IP tekshiruvi
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const BLOCKED_RANGES = [
  /^127\./, /^10\./, /^192\.168\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^0\./, /^::1$/, /^fc00:/, /^fe80:/,
]

export async function fetchPreview(rawUrl: string) {
  let url: URL

  try {
    url = new URL(rawUrl)
  } catch {
    throw new Error('URL noto\'g\'ri')
  }

  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protokol ruxsat etilmagan')

  // DNS'ni yechib, ichki manzil emasligini tekshiramiz
  const host = url.hostname
  const address = isIP(host) ? host : (await lookup(host)).address

  if (BLOCKED_RANGES.some((range) => range.test(address))) {
    throw new Error('Ichki manzillarga ruxsat yo\'q')
  }

  return fetch(url, {
    redirect: 'error',                             // yo'naltirish orqali chetlab o'tishni to'xtatadi
    signal: AbortSignal.timeout(5000),
    headers: { 'User-Agent': 'PreviewBot/1.0' },
  })
}
```
:::

::: js
```js
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const BLOCKED_RANGES = [
  /^127\./, /^10\./, /^192\.168\./, /^169\.254\./,
  /^172\.(1[6-9]|2\d|3[01])\./, /^::1$/,
]

export async function fetchPreview(rawUrl) {
  const url = new URL(rawUrl)

  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Protokol ruxsat etilmagan')

  const host = url.hostname
  const address = isIP(host) ? host : (await lookup(host)).address

  if (BLOCKED_RANGES.some((range) => range.test(address))) {
    throw new Error('Ichki manzillarga ruxsat yo\'q')
  }

  return fetch(url, { redirect: 'error', signal: AbortSignal.timeout(5000) })
}
```
:::

Ochiq yo'naltirish (27-bobda ko'rilgan):

::: ts
```ts
export function safeRedirectPath(input: unknown, fallback = '/dashboard') {
  if (typeof input !== 'string') return fallback

  // Faqat ichki, nisbiy yo'l. `//evil.com` — protokolsiz tashqi URL, bloklanadi
  if (!input.startsWith('/') || input.startsWith('//')) return fallback

  return input
}
```
:::

::: js
```js
export function safeRedirectPath(input, fallback = '/dashboard') {
  if (typeof input !== 'string') return fallback

  if (!input.startsWith('/') || input.startsWith('//')) return fallback

  return input
}
```
:::

## Kod: keshdagi maxfiy ma'lumot

Bu Next'ga xos, jiddiy va sezilmay o'tadigan xato:

::: ts
```ts
// ❌ Authorization bor so'rovni keshlash — boshqa foydalanuvchi ko'radi
const response = await fetch(`${API}/me`, {
  headers: { Authorization: `Bearer ${token}` },
  next: { revalidate: 60 },                        // 🚩
})

// ✅
const response = await fetch(`${API}/me`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store',
})
```
:::

::: js
```js
// ✅
const response = await fetch(`${API}/me`, {
  headers: { Authorization: `Bearer ${token}` },
  cache: 'no-store',
})
```
:::

Sinov: **"bu javobni boshqa foydalanuvchi ko'rsa muammo bo'ladimi?"**

Sahifa darajasida ham:

::: ts
```ts
// Shaxsiy sahifalar uchun
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
:::

::: js
```js
export const dynamic = 'force-dynamic'
export const revalidate = 0
```
:::

## Kod: bog'liqliklar va zanjir

```bash
# Ma'lum zaifliklar
npm audit --audit-level=high

# Eskirganlar
npx npm-check-updates

# Yangi paket qo'shishdan oldin
npx is-my-node-vulnerable
npm view <paket> time.created downloads
```

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule: { interval: weekly }
    groups:
      minor-patch:
        update-types: [minor, patch]
    open-pull-requests-limit: 5
```

`package-lock.json` ni **har doim** commit qiling va CI'da `npm ci` ishlating (`npm install` emas) — aks holda build har safar boshqa versiyalarni oladi.

## Muhandislik nuqtai nazari: reliz oldidan xavfsizlik ro'yxati

```
SIRLAR
□ Hech bir sir NEXT_PUBLIC_ da emas
□ grep bilan .next/static tekshirildi
□ DB/API kodida `import 'server-only'`
□ .env.local git'da emas (.gitignore)
□ Production sirlari dev sirlaridan farq qiladi

AUTH VA RUXSAT
□ Har Server Action ruxsat bilan boshlanadi
□ Har Route Handler ruxsat tekshiradi
□ Egalik tekshiruvi ma'lumot yonida (DAL)
□ Middleware o'chirilsa ham ilova himoyalangan
□ Maxfiy resurslarga 404 (403 emas)
□ Token httpOnly cookie'da, localStorage'da emas

KIRITMA
□ Hamma kiritma Zod bilan validatsiya qilinadi
□ `.strict()` mass assignment'ga qarshi
□ Xom SQL parametrlangan
□ Ustun/jadval nomlari oq ro'yxatdan
□ Fayl turi sehrli baytlar bilan tekshiriladi
□ Yo'naltirish yo'li `/` bilan boshlanadi va `//` emas

CHIQISH
□ dangerouslySetInnerHTML sanitizatsiya bilan
□ Tashqi havolalarda rel="noopener"
□ Xato xabarlarida ichki tafsilot yo'q
□ Shaxsiy ma'lumot keshlanmaydi

SARLAVHALAR
□ CSP yoqilgan (avval Report-Only)
□ HSTS, X-Frame-Options, nosniff
□ poweredByHeader: false

TEZLIK
□ Login, ro'yxat, parol tiklash cheklangan
□ Qimmat amallar cheklangan

BOG'LIQLIK
□ npm audit toza (high/critical)
□ Dependabot yoqilgan
□ package-lock.json commit qilingan
```

## Muhandislik nuqtai nazari: chuqur himoya

Bitta qatlamga ishonmang. Har xavf uchun kamida ikki qatlam:

| Xavf | 1-qatlam | 2-qatlam | 3-qatlam |
| --- | --- | --- | --- |
| Ruxsatsiz kirish | Middleware | Layout | DAL |
| XSS | React ekranlash | Sanitizatsiya | CSP |
| CSRF | `sameSite: lax` | Origin tekshiruvi | — |
| Token o'g'irlash | `httpOnly` | Qisqa muddat | Rotation |
| Brute force | Tezlik chegarasi | Hisobni bloklash | 2FA |
| SQL injection | ORM | Parametrlash | Kam huquqli DB foydalanuvchi |
| Sir sizishi | `server-only` | Nomlash qoidasi | Build tekshiruvi |

Middleware sinsa — layout ushlaydi. Layout o'tkazib yuborsa — DAL to'xtatadi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `NEXT_PUBLIC_` da sir | Bundle'da ochiq | Prefikssiz |
| Server Action'da ruxsat yo'q | Har kim chaqiradi | `requireSession()` |
| Egalik tekshirilmaydi | Boshqaning ma'lumoti | ID bo'yicha tekshirish |
| Faqat middleware'ga ishonish | Chetlab o'tiladi | DAL |
| `Authorization` bilan keshlash | Ma'lumot aralashadi | `no-store` |
| Sanitizatsiyasiz `innerHTML` | XSS | DOMPurify (serverda) |
| `Object.fromEntries` ni to'g'ridan-to'g'ri `set()` ga | Mass assignment | Zod `.strict()` |
| `sql.raw` ga foydalanuvchi kiritmasi | SQL injection | Parametrlash |
| Tekshirilmagan `fetch(url)` | SSRF | Oq ro'yxat + IP |
| `?from=` ni tekshirmaslik | Ochiq yo'naltirish | `startsWith('/')` |
| Tezlik chegarasi yo'q | Brute force, spam | Ratelimit |
| Xato tafsilotini ko'rsatish | Ma'lumot sizadi | Umumiy xabar |
| `target="_blank"` `rel` siz | Tabnabbing | `noopener noreferrer` |
| Closure'da katta obyekt | Shifrlangan, lekin og'ir | Faqat ID |

## Amaliyot

1. Build qiling va `grep -r "sk_live\|postgres://" .next/static/` ishga tushiring.
2. DB faylingizga `import 'server-only'` qo'shing va uni klient komponentga import qilib ko'ring.
3. Server Action'ingizni Network panelidan ko'chirib olib, `curl` bilan boshqa foydalanuvchi sifatida chaqiring.
4. `<input type="hidden" name="orderId">` qiymatini DevTools'da o'zgartirib, boshqaning buyurtmasini tahrirlashga urinib ko'ring.
5. CSP'ni Report-Only rejimida yoqing va bir hafta hisobotlarni kuzating.
6. Login'ga tezlik chegarasi qo'ying va 10 marta noto'g'ri parol kiriting.
7. `dangerouslySetInnerHTML` ga `<img src=x onerror=alert(1)>` bering — sanitizatsiyadan oldin va keyin.
8. `npm audit` ishga tushiring va high/critical zaifliklarni tuzating.
9. Yuqoridagi reliz ro'yxatini loyihangiz uchun to'ldiring.

## Rasmiy hujjat

- Next.js xavfsizlik (RSC va Server Actions): <https://nextjs.org/blog/security-nextjs-server-components-actions>
- Autentifikatsiya: <https://nextjs.org/docs/app/guides/authentication>
- CSP: <https://nextjs.org/docs/app/guides/content-security-policy>
- OWASP Top 10: <https://owasp.org/www-project-top-ten/>
- OWASP Cheat Sheets: <https://cheatsheetseries.owasp.org/>
