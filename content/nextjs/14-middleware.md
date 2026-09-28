# 14 — Middleware

[← Oldingi: Metadata va SEO](13-metadata-va-seo.md) · [Mundarija](README.md) · [Keyingi: Route Handlers →](15-route-handlers.md)

## Tushuncha

Middleware — **so'rov sahifaga yetib borishidan oldin** ishlaydigan funksiya. U loyiha ildizida bitta faylda yashaydi:

```
src/middleware.ts        (yoki loyiha ildizida middleware.ts)
```

Nima qila oladi:

| Vazifa | Misol |
| --- | --- |
| Yo'naltirish | Kirmagan foydalanuvchini `/login` ga |
| Qayta yozish (rewrite) | A/B test, ko'p ijarachilik |
| Sarlavha qo'shish | Xavfsizlik sarlavhalari, CSP nonce |
| Cookie o'qish/yozish | Til, tema, sessiya tekshiruvi |
| Geo/til aniqlash | `/uz`, `/ru` ga yo'naltirish |

## Kod: asosiy shakl

::: ts
```ts
// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Yo'naltirish
  if (pathname === '/eski-yol') {
    return NextResponse.redirect(new URL('/yangi-yol', request.url))
  }

  // 2. Sarlavha qo'shish
  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  matcher: [
    // Statik fayllar va rasm optimizatsiyasidan tashqari hamma narsa
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```
:::

::: js
```js
// src/middleware.js
import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (pathname === '/eski-yol') {
    return NextResponse.redirect(new URL('/yangi-yol', request.url))
  }

  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```
:::

`matcher` — middleware qaysi yo'llarda ishlashini cheklaydi. Usiz u **har bir so'rovda** (shu jumladan rasm va CSS) ishlaydi va kechikish qo'shadi.

## Kod: auth tekshiruvi

::: ts
```ts
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/account', '/orders']
const AUTH_PAGES = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  // Kirmagan foydalanuvchi himoyalangan sahifaga
  if (isProtected && !token) {
    const url = new URL('/login', request.url)

    url.searchParams.set('from', pathname)

    return NextResponse.redirect(url)
  }

  // Kirgan foydalanuvchi login sahifasiga
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*', '/orders/:path*', '/login', '/register'],
}
```
:::

::: js
```js
import { NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/account', '/orders']
const AUTH_PAGES = ['/login', '/register']

export function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p))

  if (isProtected && !token) {
    const url = new URL('/login', request.url)

    url.searchParams.set('from', pathname)

    return NextResponse.redirect(url)
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}
```
:::

> **Juda muhim:** middleware'da **faqat cookie borligini** tekshiring, tokenni to'liq tekshirmang (bazaga murojaat qilmang). Sabab 30-bobda: middleware har navigatsiyada ishlaydi va u **himoya chegarasi emas** — haqiqiy tekshiruv sahifa/action/route handler ichida bo'ladi.

## Kod: cookie bilan ishlash

::: ts
```ts
export function middleware(request: NextRequest) {
  // O'qish
  const theme = request.cookies.get('theme')?.value
  const all = request.cookies.getAll()

  const response = NextResponse.next()

  // Yozish
  response.cookies.set('visited', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  // O'chirish
  response.cookies.delete('temp')

  return response
}
```
:::

::: js
```js
export function middleware(request) {
  const theme = request.cookies.get('theme')?.value

  const response = NextResponse.next()

  response.cookies.set('visited', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}
```
:::

## Kod: rewrite va ko'p ijarachilik

::: ts
```ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const subdomain = hostname.split('.')[0]

  // shop1.example.com → /tenants/shop1/...
  if (subdomain && !['www', 'app'].includes(subdomain)) {
    const url = request.nextUrl.clone()

    url.pathname = `/tenants/${subdomain}${url.pathname}`

    return NextResponse.rewrite(url)          // URL foydalanuvchida o'zgarmaydi
  }

  return NextResponse.next()
}
```
:::

::: js
```js
export function middleware(request) {
  const hostname = request.headers.get('host') ?? ''
  const subdomain = hostname.split('.')[0]

  if (subdomain && !['www', 'app'].includes(subdomain)) {
    const url = request.nextUrl.clone()

    url.pathname = `/tenants/${subdomain}${url.pathname}`

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}
```
:::

`redirect` va `rewrite` farqi: birinchisida brauzer URL'ni o'zgartiradi, ikkinchisida — yo'q (foydalanuvchi `shop1.example.com/products` ni ko'radi, Next esa `/tenants/shop1/products` ni render qiladi).

## Kod: til yo'naltirish

::: ts
```ts
const LOCALES = ['uz', 'ru', 'en']
const DEFAULT_LOCALE = 'uz'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocale = LOCALES.some((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`)

  if (hasLocale) return NextResponse.next()

  // Cookie yoki Accept-Language dan aniqlash
  const cookieLocale = request.cookies.get('locale')?.value
  const headerLocale = request.headers
    .get('accept-language')
    ?.split(',')[0]
    ?.split('-')[0]

  const locale = LOCALES.includes(cookieLocale ?? '')
    ? cookieLocale!
    : LOCALES.includes(headerLocale ?? '')
      ? headerLocale!
      : DEFAULT_LOCALE

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
}
```
:::

::: js
```js
const LOCALES = ['uz', 'ru', 'en']
const DEFAULT_LOCALE = 'uz'

export function middleware(request) {
  const { pathname } = request.nextUrl

  if (LOCALES.some((l) => pathname.startsWith(`/${l}`))) return NextResponse.next()

  const cookieLocale = request.cookies.get('locale')?.value
  const headerLocale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]

  const locale = LOCALES.includes(cookieLocale) ? cookieLocale
    : LOCALES.includes(headerLocale) ? headerLocale
    : DEFAULT_LOCALE

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
}
```
:::

Batafsil — 46-bob.

## Kod: sarlavhalarni sahifaga uzatish

::: ts
```ts
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  requestHeaders.set('x-request-id', crypto.randomUUID())

  return NextResponse.next({ request: { headers: requestHeaders } })
}
```
:::

::: js
```js
export function middleware(request) {
  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-pathname', request.nextUrl.pathname)
  requestHeaders.set('x-request-id', crypto.randomUUID())

  return NextResponse.next({ request: { headers: requestHeaders } })
}
```
:::

Keyin server komponentda:

```tsx
import { headers } from 'next/headers'

const headersList = await headers()
const pathname = headersList.get('x-pathname')
```

Bu — layout'da joriy yo'lni bilishning yagona serverdagi usuli (layout `params`/`pathname` olmaydi, 08-bob). Ammo `headers()` ni o'qish sahifani **dinamik** qiladi (03-bob).

`x-request-id` — kuzatuvchanlik uchun: uni loglarga qo'shsangiz, bitta so'rovni butun tizim bo'ylab kuzatish mumkin (49-bob).

## Kod: CSP nonce

::: ts
```ts
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `frame-ancestors 'none'`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('content-security-policy', csp)

  return response
}
```
:::

::: js
```js
export function middleware(request) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline'`,
  ].join('; ')

  const requestHeaders = new Headers(request.headers)

  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  response.headers.set('content-security-policy', csp)

  return response
}
```
:::

Batafsil — 45-bob.

## Muhandislik nuqtai nazari: middleware cheklovlari

Middleware **Edge runtime** da ishlaydi (standart holda):

| Mavjud | Mavjud emas |
| --- | --- |
| `fetch`, `URL`, `crypto` | Node API'lari (`fs`, `net`) |
| Cookie va sarlavhalar | Baza drayverlari (`pg`, `mysql2`) |
| `Request`/`Response` | Og'ir kutubxonalar |
| Web Crypto (`jose` bilan JWT tekshirish) | `jsonwebtoken` (Node'ga bog'liq) |

Node runtime'ni tanlash mumkin:

```ts
export const config = {
  runtime: 'nodejs',        // Next 15.2+ (eksperimental edi, endi barqaror)
}
```

Lekin bu kechikish qo'shadi — middleware'ni **yengil** saqlash yaxshiroq.

## Muhandislik nuqtai nazari: middleware nima uchun EMAS

| Vazifa | Middleware'da | To'g'ri joy |
| --- | --- | --- |
| Cookie borligini tekshirish | ✅ Ha | — |
| Tokenni bazada tekshirish | ❌ Sekin | Sahifa/action (30-bob) |
| Ruxsatlarni tekshirish | ❌ | Sahifa/action |
| Ma'lumot yuklash | ❌ | Server komponent |
| Biznes mantiq | ❌ | Action yoki servis |
| Til aniqlash | ✅ Ha | — |
| Xavfsizlik sarlavhalari | ✅ Ha | yoki `next.config` |

Sabab: middleware **har navigatsiyada** (shu jumladan prefetch) ishlaydi va uning har millisekundi butun ilovaga qo'shiladi.

## Muhandislik nuqtai nazari: `matcher` yozish

```ts
export const config = {
  matcher: [
    // 1. Aniq yo'llar (tavsiya etiladi)
    '/dashboard/:path*',
    '/account/:path*',

    // 2. Yoki: hamma narsa, statiklardan tashqari
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
```

Birinchi yondashuv aniqroq va tezroq. Ikkinchisi til yo'naltirish kabi global vazifalar uchun.

`matcher` **build vaqtida** tahlil qilinadi — shuning uchun u statik bo'lishi kerak (o'zgaruvchi ishlatib bo'lmaydi).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `matcher` yozmaslik | Har rasm va CSS uchun ham ishlaydi | Aniq yo'llar |
| Middleware'ni himoya chegarasi deb bilish | U faqat birinchi to'siq | Sahifa/action'da ham tekshiring (30-bob) |
| Bazaga murojaat qilish | Edge runtime va sekinlik | Cookie tekshiruvi bilan cheklaning |
| `jsonwebtoken` ishlatish | Edge'da ishlamaydi | `jose` (Web Crypto) |
| Har so'rovda og'ir hisob | Butun ilova sekinlashadi | Yengil saqlang |
| `NextResponse.next()` ni qaytarmaslik | So'rov to'xtab qoladi | Har yo'lda qaytaring |
| Cheksiz yo'naltirish (`/login` ham himoyalangan) | Sahifa ochilmaydi | Chiqish shartini qo'shing |

## Amaliyot

1. Middleware yozing: `/dashboard/*` uchun cookie tekshiruvi va `/login?from=...` ga yo'naltirish.
2. `matcher` siz qoldiring va Network panelida middleware nechta so'rovda ishlayotganini kuzating; keyin cheklang.
3. `x-request-id` sarlavhasini qo'shing va uni server komponentda `headers()` orqali o'qing.
4. Subdomain rewrite qiling: `shop1.localhost:3000` → `/tenants/shop1`.
5. Cheksiz yo'naltirish yarating (`/login` ni ham himoyalangan ro'yxatga qo'shing) va brauzer xatosini ko'ring; keyin tuzating.

## Rasmiy hujjat

- Middleware: <https://nextjs.org/docs/app/api-reference/file-conventions/middleware>
- `NextRequest` / `NextResponse`: <https://nextjs.org/docs/app/api-reference/functions/next-request>
- Auth bilan middleware: <https://nextjs.org/docs/app/guides/authentication>
