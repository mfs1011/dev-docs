# 50 — Amaliy loyiha va checklist

[← Oldingi: Monitoring va xatolar](49-monitoring.md) · [Mundarija](README.md)

## Tushuncha

Qo'llanma tugadi. Bu bob ikki ishni qiladi:

1. **To'liq loyiha** — o'rganilgan hamma narsa bir joyda ishlaydigan ilova sifatida;
2. **Checklist'lar** — kundalik ishda ishlatiladigan ro'yxatlar.

Loyiha: **tashqi backend bilan ishlaydigan onlayn do'kon**. U qo'llanmaning asosiy og'riq nuqtasini qamraydi — Laravel/Symfony API bilan auth, token va ma'lumot oqimi (IV qism).

## Loyiha: nima quriladi

```
Mahsulot katalogi          →  ISR, kategoriya filtri, qidiruv
Mahsulot sahifasi          →  Statik + dinamik qism (PPR)
Savat                      →  Klient holati + server tekshiruvi
Auth                       →  Tashqi backend, httpOnly cookie, refresh
Buyurtma                   →  Server Action, tranzaksiya
To'lov                     →  Stripe Checkout + webhook
Buyurtmalar tarixi         →  Himoyalangan, DAL orqali
Profil                     →  Avatar yuklash (presigned URL)
Admin                      →  Rol tekshiruvi, mahsulot boshqaruvi
Ko'p tillilik              →  uz / ru / en
```

## Loyiha: tuzilma

```
app/
├── [locale]/
│   ├── layout.tsx                  # lang, providers, Suspense'li header
│   ├── page.tsx                    # bosh sahifa — ISR
│   │
│   ├── (shop)/                     # ochiq qism
│   │   ├── layout.tsx
│   │   ├── products/
│   │   │   ├── page.tsx            # ISR + qidiruv (dinamik qism)
│   │   │   ├── loading.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # generateStaticParams + ISR
│   │   │       └── AddToCart.tsx   # 'use client'
│   │   └── cart/
│   │       ├── page.tsx
│   │       └── actions.ts
│   │
│   ├── (auth)/                     # faqat kirmaganlar
│   │   ├── layout.tsx              # kirgan bo'lsa → /account
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (account)/                  # faqat kirganlar
│   │   ├── layout.tsx              # requireSession()
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── profile/
│   │       ├── page.tsx
│   │       └── AvatarUpload.tsx    # 'use client'
│   │
│   └── (admin)/                    # faqat adminlar
│       ├── layout.tsx              # requirePermission('admin.access')
│       └── products/
│
├── api/
│   ├── auth/refresh/route.ts       # klient uchun refresh
│   ├── webhooks/stripe/route.ts    # to'lov webhook'i
│   ├── jobs/route.ts               # navbat ishchisi
│   ├── cron/cleanup/route.ts       # kunlik tozalash
│   ├── health/route.ts             # sog'liq
│   └── vitals/route.ts             # Web Vitals
│
├── global-error.tsx
└── layout.tsx                      # minimal ildiz

lib/
├── dal.ts                          # verifySession, requireSession, requirePermission
├── api.ts                          # apiGet, apiPost (token bilan)
├── refresh.ts                      # refreshTokens, cookie parametrlari
├── single-flight.ts                # refreshOnce
├── storage.ts                      # S3 presigned URL
├── stripe.ts
├── queue.ts                        # enqueue
├── email.ts
├── logger.ts
├── alert.ts
├── rate-limit.ts
├── errors.ts                       # UserError, SystemError, UpstreamError
└── format.ts                       # Intl o'ramlari

i18n/
├── config.ts
├── index.ts
└── dictionaries/{uz,ru,en}.json

instrumentation.ts                  # Sentry + OTel
middleware.ts                       # til + proaktiv refresh + CSP nonce
```

Bu tuzilma **tasodifiy emas**: har papka qo'llanmadagi bir bobga mos keladi.

## Loyiha: middleware — hammasi bir joyda

Uch vazifa bitta faylda, to'g'ri tartibda:

::: ts
```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { decodeJwt } from 'jose'
import { locales, defaultLocale, isLocale } from '@/i18n/config'
import { refreshTokens, accessCookie, refreshCookie } from '@/lib/refresh'

const PUBLIC_PREFIXES = ['/login', '/register', '/products', '/']
const SKEW = 60

export async function middleware(request: NextRequest) {
  // ── 1. CSP nonce (45-bob) ────────────────────────────────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // ── 2. Til (46-bob) ──────────────────────────────────────────
  const { pathname } = request.nextUrl
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))

  if (!hasLocale) {
    const locale = detectLocale(request)
    const url = request.nextUrl.clone()

    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

    return NextResponse.redirect(url)
  }

  const locale = pathname.split('/')[1]
  const pathWithoutLocale = pathname.slice(locale.length + 1) || '/'

  // ── 3. Proaktiv token yangilash (28-bob) ─────────────────────
  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-request-id', request.headers.get('x-request-id') ?? crypto.randomUUID())
  requestHeaders.set('x-pathname', pathname)

  if (access && !expiresSoon(access)) {
    return withHeaders(NextResponse.next({ request: { headers: requestHeaders } }), csp)
  }

  const isPublic = PUBLIC_PREFIXES.some((p) => pathWithoutLocale.startsWith(p))

  if (!refresh) {
    if (isPublic) {
      return withHeaders(NextResponse.next({ request: { headers: requestHeaders } }), csp)
    }

    return withHeaders(redirectToLogin(request, locale, pathWithoutLocale), csp)
  }

  const tokens = await refreshTokens(refresh)

  if (!tokens) {
    const response = isPublic
      ? NextResponse.next({ request: { headers: requestHeaders } })
      : redirectToLogin(request, locale, pathWithoutLocale)

    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return withHeaders(response, csp)
  }

  // Yangi tokenni SHU so'rovga ham beramiz — bo'lmasa sahifa 401 oladi
  request.cookies.set('access_token', tokens.accessToken)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.cookies.set(accessCookie(tokens.accessToken, tokens.expiresIn))
  response.cookies.set(refreshCookie(tokens.refreshToken))

  return withHeaders(response, csp)
}

function expiresSoon(token: string) {
  try {
    const { exp } = decodeJwt(token)

    return typeof exp !== 'number' || exp - SKEW <= Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

function redirectToLogin(request: NextRequest, locale: string, from: string) {
  const url = new URL(`/${locale}/login`, request.url)

  url.searchParams.set('from', from)

  return NextResponse.redirect(url)
}

function withHeaders(response: NextResponse, csp: string) {
  response.headers.set('Content-Security-Policy', csp)

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
```
:::

::: js
```js
// middleware.js
import { NextResponse } from 'next/server'
import { decodeJwt } from 'jose'
import { locales } from '@/i18n/config'
import { refreshTokens, accessCookie, refreshCookie } from '@/lib/refresh'

const PUBLIC_PREFIXES = ['/login', '/register', '/products', '/']
const SKEW = 60

export async function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  const { pathname } = request.nextUrl
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))

  if (!hasLocale) {
    const locale = detectLocale(request)
    const url = request.nextUrl.clone()

    url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`

    return NextResponse.redirect(url)
  }

  const locale = pathname.split('/')[1]
  const pathWithoutLocale = pathname.slice(locale.length + 1) || '/'

  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-request-id', request.headers.get('x-request-id') ?? crypto.randomUUID())

  if (access && !expiresSoon(access)) {
    const response = NextResponse.next({ request: { headers: requestHeaders } })

    response.headers.set('Content-Security-Policy', csp)

    return response
  }

  // ... refresh mantiqi (28-bob bilan bir xil)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
```
:::

## Loyiha: buyurtma oqimi — uchtadan-uchgacha

Bu — qo'llanmaning yakuniy misoli. Unda **o'nta bob** birga ishlaydi.

::: ts
```ts
// app/[locale]/(shop)/cart/actions.ts
'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { requireSession } from '@/lib/dal'                    // 30-bob
import { stripe } from '@/lib/stripe'                          // 35-bob
import { rateLimit, clientIp } from '@/lib/rate-limit'         // 45-bob
import { getLogger } from '@/lib/context'                      // 49-bob
import { UserError, UpstreamError } from '@/lib/errors'        // 49-bob
import { track } from '@/lib/metrics'                          // 49-bob

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        qty: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1, 'Savat bo\'sh')
    .max(50, 'Juda ko\'p mahsulot'),
  locale: z.enum(['uz', 'ru', 'en']),
})

export async function checkout(input: unknown) {
  const log = await getLogger()

  // 1. RUXSAT (30-bob)
  const session = await requireSession()

  // 2. TEZLIK CHEGARASI (45-bob)
  const limited = await rateLimit(`checkout:${session.userId}`, 'api')

  if (!limited.ok) return { message: 'Juda ko\'p urinish. Biroz kuting.' }

  // 3. VALIDATSIYA (22, 45-bob)
  const parsed = schema.strict().safeParse(input)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { items, locale } = parsed.data

  log.info({ event: 'checkout.start', userId: session.userId, items: items.length }, 'Checkout')

  let checkoutUrl: string

  try {
    // 4. NARX BAZADAN — klientdan EMAS (35-bob)
    const rows = await db
      .select({
        id: products.id,
        title: products.title,
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(inArray(products.id, items.map((i) => i.productId)))

    if (rows.length !== items.length) throw new UserError('Ba\'zi mahsulotlar topilmadi')

    for (const item of items) {
      const product = rows.find((r) => r.id === item.productId)!

      if (product.stock < item.qty) {
        throw new UserError(`"${product.title}" yetarli emas`, 'OUT_OF_STOCK')
      }
    }

    const total = items.reduce((sum, item) => {
      const product = rows.find((r) => r.id === item.productId)!

      return sum + Number(product.price) * item.qty
    }, 0)

    // 5. BUYURTMA — PENDING holatida, TRANZAKSIYADA (32, 33-bob)
    const order = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(orders)
        .values({
          number: `ORD-${Date.now()}`,
          userId: session.userId,
          total: total.toFixed(2),
          status: 'PENDING',
          locale,                                             // email tili uchun (46-bob)
        })
        .returning({ id: orders.id, number: orders.number })

      await tx.insert(orderItems).values(
        items.map((item) => {
          const product = rows.find((r) => r.id === item.productId)!

          return {
            orderId: created.id,
            title: product.title,
            price: product.price,
            qty: item.qty,
          }
        }),
      )

      return created
    })

    // 6. STRIPE SESSIYASI — idempotent (35-bob)
    const checkoutSession = await stripe.checkout.sessions
      .create(
        {
          mode: 'payment',
          customer_email: session.email,
          client_reference_id: String(order.id),
          metadata: { orderId: String(order.id), userId: String(session.userId) },
          locale: locale === 'uz' ? 'auto' : locale,
          line_items: items.map((item) => {
            const product = rows.find((r) => r.id === item.productId)!

            return {
              quantity: item.qty,
              price_data: {
                currency: 'uzs',
                unit_amount: Math.round(Number(product.price) * 100),
                product_data: { name: product.title },
              },
            }
          }),
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/orders/${order.id}?paid=1`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/cart?cancelled=1`,
          expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
        },
        { idempotencyKey: `checkout-${order.id}` },
      )
      .catch(() => {
        throw new UpstreamError('Stripe')
      })

    await db
      .update(orders)
      .set({ stripeSessionId: checkoutSession.id })
      .where(eq(orders.id, order.id))

    await track('checkout.started', { orderId: order.id, total })

    log.info({ event: 'checkout.created', orderId: order.id }, 'Checkout yaratildi')

    checkoutUrl = checkoutSession.url!
  } catch (error) {
    // 7. XATOLARNI AJRATISH (49-bob)
    if (error instanceof UserError) {
      log.info({ event: 'checkout.rejected', reason: error.code }, error.message)

      return { message: error.message }
    }

    if (error instanceof UpstreamError) {
      log.warn({ event: 'checkout.upstream', service: error.service }, 'Tashqi xizmat')

      return { message: 'To\'lov tizimi vaqtincha ishlamayapti' }
    }

    log.error({ event: 'checkout.failed', err: error }, 'Checkout xatosi')

    throw error                                               // Sentry ushlaydi (49-bob)
  }

  // 8. YO'NALTIRISH — try/catch DAN TASHQARIDA (07-bob)
  redirect(checkoutUrl)
}
```
:::

::: js
```js
// app/[locale]/(shop)/cart/actions.js
'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { requireSession } from '@/lib/dal'
import { stripe } from '@/lib/stripe'
import { rateLimit } from '@/lib/rate-limit'
import { getLogger } from '@/lib/context'
import { UserError, UpstreamError } from '@/lib/errors'

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        qty: z.coerce.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
  locale: z.enum(['uz', 'ru', 'en']),
})

export async function checkout(input) {
  const log = await getLogger()
  const session = await requireSession()

  const limited = await rateLimit(`checkout:${session.userId}`, 'api')

  if (!limited.ok) return { message: 'Juda ko\'p urinish' }

  const parsed = schema.strict().safeParse(input)

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  let checkoutUrl

  try {
    // ... narx bazadan, tranzaksiya, Stripe sessiyasi (TS versiyasi bilan bir xil)
  } catch (error) {
    if (error instanceof UserError) return { message: error.message }
    if (error instanceof UpstreamError) return { message: 'To\'lov tizimi ishlamayapti' }

    log.error({ event: 'checkout.failed', err: error }, 'Checkout xatosi')

    throw error
  }

  redirect(checkoutUrl)
}
```
:::

Sakkiz qadam, o'nta bob. Har biri alohida o'rganilgan; birga ishlaganda ishlaydigan ilova chiqadi.

Oqimning davomi — webhook (35-bob), navbat (36-bob), email (36-bob) — oldingi boblarda to'liq yozilgan.

## Checklist: yangi loyiha boshlash

```
POYDEVOR
□ npx create-next-app@latest --typescript --app --tailwind
□ TypeScript strict: true
□ ESLint + Prettier + eslint-plugin-jsx-a11y (44-bob)
□ Papka tuzilmasi: app/, lib/, db/, i18n/
□ Muhit o'zgaruvchilari Zod bilan tekshiriladi (47-bob)
□ .env.example yoziladi va commit qilinadi
□ server-only / client-only paketlari

MA'LUMOT
□ ORM tanlandi: Prisma yoki Drizzle (32, 33-bob)
□ Klient singleton naqshi
□ Migratsiya oqimi ishlaydi
□ Test bazasi (Docker) (42-bob)
□ Seed skripti

AUTH
□ Strategiya tanlandi: qo'lda yoki Auth.js (25–31-bob)
□ httpOnly cookie (26-bob)
□ Refresh oqimi + single-flight (28-bob)
□ DAL: verifySession, requireSession, requirePermission (30-bob)
□ Marshrut guruhlari: (public), (auth), (app), (admin)

SIFAT
□ Vitest sozlandi (42-bob)
□ Playwright sozlandi
□ CI: lint, typecheck, test, e2e
□ Lighthouse byudjeti (43-bob)

KUZATUV
□ Sentry + onRequestError (49-bob)
□ Strukturalangan loglar (pino)
□ /api/health endpointi
□ Web Vitals yig'ish
```

## Checklist: har PR uchun

```
□ TypeScript xatosiz (tsc --noEmit)
□ ESLint xatosiz
□ Testlar o'tdi
□ Yangi Server Action'da: ruxsat → validatsiya → egalik → amal (45-bob)
□ Yangi so'rovda: cache strategiyasi ongli tanlangan (18-bob)
□ Yangi "use client": chegara iloji boricha pastda (43-bob)
□ Yangi forma: label, aria-describedby, xato holati (44-bob)
□ Yangi matn: i18n lug'atiga qo'shildi (46-bob)
□ Yangi rasm: sizes, alt, priority (LCP bo'lsa) (43-bob)
□ First Load JS oshmadi
□ Migratsiya orqaga mos (32-bob)
□ Preview deploy ko'zdan kechirildi
```

## Checklist: reliz oldidan

```
XAVFSIZLIK (45-bob)
□ grep -r "sk_live\|postgres://" .next/static/ — bo'sh
□ Har Server Action ruxsat bilan boshlanadi
□ Middleware o'chirilsa ham ilova himoyalangan
□ CSP yoqilgan
□ Tezlik chegarasi: login, ro'yxat, parol tiklash
□ npm audit — high/critical yo'q

UNUMDORLIK (43-bob)
□ next build: statik/dinamik nisbat kutilganday
□ First Load JS < 150 kB
□ LCP rasmida priority
□ next/font ishlatilgan
□ Lighthouse byudjeti o'tadi

ERISHIMLILIK (44-bob)
□ Klaviatura bilan asosiy oqim o'tiladi
□ axe testlari o'tadi
□ Fokus ko'rinadi
□ lang atributi to'g'ri

MA'LUMOT (32, 33-bob)
□ Migratsiya orqaga mos
□ Zaxira ishlaydi VA tiklash sinalgan
□ Indekslar tekshirildi

KUZATUV (49-bob)
□ Sentry release sozlangan
□ Source map yuklanadi
□ Kritik alertlar ishlaydi
□ /api/health javob beradi
□ Tashqi uptime tekshiruvi ulangan

DEPLOY (47, 48-bob)
□ Rollback rejasi bor va sinalgan
□ Smoke test skripti tayyor
□ Muhit o'zgaruvchilari production'da sozlangan
□ Cron ishlaydi
```

## Checklist: muammoni tuzatish

Nima buzilganda qayerga qarash:

| Alomat | Avval tekshiring | Bob |
| --- | --- | --- |
| "Ma'lumot yangilanmayapti" | `cache`, `revalidate`, `revalidatePath` | 18, 19 |
| "Sahifa sekin" | `next build` statik/dinamik, waterfall, N+1 | 43, 32 |
| "Bundle katta" | `ANALYZE=true`, `"use client"` chegarasi | 43 |
| "Foydalanuvchilar chiqib ketyapti" | Refresh single-flight, rotation | 28 |
| "401 olyapman" | `NextResponse.next({ request })` | 28 |
| "Cookie o'rnatilmayapti" | Server komponentda `set()` chaqirilgan | 28 |
| "Boshqaning ma'lumoti ko'rinyapti" | `Authorization` bilan kesh | 29, 45 |
| "Sir bundle'da" | `NEXT_PUBLIC_` prefiksi | 45 |
| "Streaming ishlamayapti" | nginx `proxy_buffering` | 48 |
| "ISR instansiyalar orasida farq qiladi" | Bo'lishilgan kesh handler | 48 |
| "Webhook ikki marta ishlayapti" | Idempotentlik jadvali | 35 |
| "Email ikki marta ketdi" | Ishchi idempotent emas | 36 |
| "Hydration xatosi" | Server/klient farqi, `Date`, `random` | 40 |
| "`window is not defined`" | Server komponentda brauzer API | 04, 40 |
| "Butun sayt dinamik" | Root layout'da `cookies()` | 43, 47 |
| "Sentry bo'sh" | `onRequestError` sozlanmagan | 49 |

## Muhandislik nuqtai nazari: nima o'rganildi

Qo'llanmaning asosiy g'oyalari, boblardan mustaqil:

**1. Chegara — eng muhim tushuncha.**
Server va klient orasidagi chiziq. Nima o'tadi, nima o'tmaydi. Bundle hajmi, xavfsizlik, unumdorlik — uchalasi ham shu chegaraga bog'lanadi. (04, 16, 26, 43, 45-bob)

**2. Kesh — kuchli va xavfli.**
Next to'rt qatlam kesh beradi. Har biri tezlashtiradi va har biri ma'lumot aralashtirishi mumkin. Savol har doim bitta: *"bu javobni boshqa foydalanuvchi ko'rsa muammo bo'ladimi?"* (18, 19, 29, 45-bob)

**3. Himoya ma'lumotga yaqin bo'lsin.**
Middleware — UX. Layout — qulaylik. DAL — xavfsizlik. Middleware chetlab o'tilishi mumkin; ma'lumot yonidagi tekshiruv — yo'q. (30, 45-bob)

**4. Token oqimi — uch qiyinchilik.**
Server komponent cookie yoza olmaydi. Parallel so'rovlar rotation'ni kuydiradi. Refresh muddat tugashidan oldin bo'lishi kerak. Uchalasining yechimi ma'lum va yozilgan. (26, 28-bob)

**5. Idempotentlik — pul bor joyda majburiy.**
Webhook takror keladi. Navbat qayta urinadi. Foydalanuvchi ikki marta bosadi. Har uchala holatda natija bir xil bo'lishi kerak. (35, 36-bob)

**6. O'lchash — taxmindan oldin.**
`next build` chiqishi, bundle tahlili, tracing, p75. Bularsiz optimizatsiya — taxmin. (43, 49-bob)

**7. Sodda yechim ko'pincha to'g'ri.**
Polling WebSocket'dan oson va ko'pincha yetarli. Sessiya JWT'dan sodda va xavfsizroq. Prisma Drizzle'dan tezroq boshlanadi. "Zamonaviyroq" — mezon emas. (28, 31, 33, 37-bob)

## Muhandislik nuqtai nazari: bundan keyin

Next tez rivojlanadi. Qo'llanma eskirmasligi uchun nimaga qarash kerak:

| Manba | Nima uchun |
| --- | --- |
| <https://nextjs.org/docs> | Rasmiy hujjat — birinchi manba |
| <https://nextjs.org/blog> | Reliz eslatmalari, migratsiya qo'llanmalari |
| <https://github.com/vercel/next.js/releases> | Har versiya nima o'zgardi |
| <https://react.dev/blog> | React o'zgarishlari Next'ga ta'sir qiladi |
| `npx @next/codemod@latest upgrade` | Versiya yangilashda avtomatik tuzatish |

Kuzatib borish arziydigan yo'nalishlar:

- **PPR (Partial Prerendering)** — statik qobiq + dinamik teshiklar bitta sahifada (03, 20-bob);
- **`use cache` direktivasi** — kesh boshqaruvining yangi modeli (18-bob);
- **React Compiler** — `useMemo`/`useCallback` ni avtomatik qiladi;
- **Turbopack** — build tezligi (06-bob).

Yangi versiya chiqqanda: **reliz eslatmalarini o'qing, codemod ishga tushiring, testlarni yurgizing** (42-bob). Testlar bor bo'lsa, yangilash bir soatlik ish.

## Amaliyot: yakuniy loyiha

Qo'llanmani yakunlash uchun to'liq ilova quring. Bosqichlar:

**1-bosqich — poydevor (1–2 kun)**
1. `create-next-app`, TypeScript strict, ESLint + a11y plugin.
2. Ma'lumotlar bazasi sxemasi: users, products, orders, order_items.
3. Seed skripti: 3 kategoriya, 20 mahsulot, 2 foydalanuvchi (oddiy + admin).
4. `lib/env.server.ts` — Zod bilan muhit tekshiruvi.

**2-bosqich — katalog (1 kun)**
5. Mahsulotlar ro'yxati — ISR, `revalidate: 3600`.
6. Mahsulot sahifasi — `generateStaticParams`, `generateMetadata`.
7. Qidiruv — URL holati, `useDeferredValue`, `Suspense`.
8. `next/image` bilan rasmlar: `sizes`, LCP'ga `priority`.

**3-bosqich — auth (2 kun)**
9. Tashqi backend (yoki mock) bilan login Server Action.
10. httpOnly cookie, refresh oqimi, single-flight.
11. Middleware'da proaktiv yangilash.
12. DAL: `verifySession`, `requireSession`, `requirePermission`.
13. Marshrut guruhlari va layout tekshiruvlari.

**4-bosqich — savat va buyurtma (2 kun)**
14. Savat — klient holati (Zustand yoki kontekst) + server tekshiruvi.
15. Checkout Server Action — yuqoridagi to'liq misol.
16. Stripe Checkout + webhook + idempotentlik jadvali.
17. Buyurtmalar tarixi — DAL orqali, egalik tekshiruvi bilan.

**5-bosqich — qo'shimchalar (2 kun)**
18. Avatar yuklash — presigned URL.
19. Email — navbat orqali, foydalanuvchi tilida.
20. Admin bo'limi — rol tekshiruvi.
21. Ko'p tillilik: uz/ru/en.

**6-bosqich — sifat (2 kun)**
22. Vitest: DAL, Server Action'lar, validatsiya.
23. Playwright: login → savat → buyurtma → to'lov oqimi.
24. axe testlari, klaviatura bilan qo'lda tekshiruv.
25. Lighthouse byudjeti, bundle tahlili.

**7-bosqich — production (1–2 kun)**
26. Sentry, loglar, `/api/health`, Web Vitals.
27. Deploy: Vercel yoki Docker.
28. Cron: tozalash.
29. Zaxira va tiklash sinovi.
30. Yuqoridagi reliz checklist'ini to'liq o'tkazing.

Har bosqichdan keyin **deploy qiling**. Oxirida bir marta emas — har bosqichda. Muammolar shunda erta topiladi.

## Yakun

Ellik bob. Ular bitta narsani o'rgatishga qaratilgan edi: **Next'da kod qayerda ishlaydi va nima uzatiladi** — buni bilsangiz, qolgan hamma narsa shundan kelib chiqadi.

Endi rasmiy hujjat o'qish osonroq bo'ladi: siz tushunchalarni bilasiz, hujjat esa tafsilotlarni beradi.

Muvaffaqiyat tilaymiz.

## Rasmiy hujjat

- Production checklist: <https://nextjs.org/docs/app/guides/production-checklist>
- Next.js Learn: <https://nextjs.org/learn>
- Misollar: <https://github.com/vercel/next.js/tree/canary/examples>
- App Router playground: <https://app-router.vercel.app>
- React hujjati: <https://react.dev>
