# 28 — Refresh oqimi

[← Oldingi: Tashqi backend bilan login](27-tashqi-backend-login.md) · [Mundarija](README.md) · [Keyingi: Server komponentlardan so'rov →](29-server-sorovlar.md)

## Tushuncha

Access token qisqa muddatli (25-bob) — 15 daqiqa. Foydalanuvchi 8 soat ishlaydi. Oradagi farqni **refresh oqimi** yopadi:

```
Access token muddati tugadi
        │
        ▼
Refresh token bilan backend'ga so'rov
        │
        ├── ✅ Yangi access (+ yangi refresh) → cookie yangilanadi → so'rov qaytariladi
        └── ❌ Refresh ham yaroqsiz → logout → /login
```

Oddiy ko'rinadi. Amalda bu qo'llanmadagi eng ko'p xato qilinadigan joy, chunki uchta qiyinchilik bor:

1. **Next'da server komponent cookie yoza olmaydi** — javob sarlavhalari allaqachon oqimga (stream) ketgan;
2. **Parallel so'rovlar** — sahifada 5 ta so'rov bir vaqtda 401 olsa, 5 ta refresh ketadi va rotation ularning 4 tasini kuydiradi;
3. **Rotation reuse detection** — backend eski refresh token qayta ishlatilganini hujum deb bilib, butun oilani bekor qiladi.

## Nega shunday

### Nega server komponent cookie yoza olmaydi

```
Server komponent render qilinadi ──▶ HTML oqimi boshlanadi ──▶ ... ──▶ tugaydi
                  ▲                        ▲
            cookies().set()          sarlavhalar allaqachon
            shu yerda ishlamaydi      yuborilgan
```

Next `cookies().set()` ni faqat **javob hali shakllanmagan** kontekstlarda ruxsat beradi:

| Kontekst | Cookie yozish | Nega |
| --- | --- | --- |
| Server komponent / sahifa | ❌ | Javob oqimda |
| Server Action | ✅ | Javob keyin shakllanadi |
| Route Handler | ✅ | `NextResponse` siz yaratasiz |
| Middleware | ✅ | Javobdan oldin ishlaydi |

Demak, refresh **Middleware, Route Handler yoki Server Action'da** bo'lishi kerak.

### Uch strategiya

| Strategiya | Qayerda | Afzalligi | Kamchiligi |
| --- | --- | --- | --- |
| **Proaktiv (middleware)** | Har navigatsiyada muddat tekshiriladi | Sodda, 401 umuman bo'lmaydi | Har so'rovda middleware ishlaydi |
| **Reaktiv (fetch o'rami)** | 401 kelganda | Keraksiz refresh yo'q | Server komponentda cookie yozilmaydi |
| **Klient taymeri** | `setInterval` bilan `/api/auth/refresh` | Fon rejimida ham yangi | Tab yopilsa to'xtaydi |

Real loyihada **proaktiv (middleware) + reaktiv (fallback)** birga ishlatiladi.

## Kod: refresh funksiyasi (yagona manba)

Avval refreshning o'zi — bir joyda, hamma joydan chaqiriladi.

::: ts
```ts
// lib/refresh.ts
import 'server-only'

export type Tokens = {
  accessToken: string
  refreshToken: string
  expiresIn: number                          // sekundlarda
}

export async function refreshTokens(refreshToken: string): Promise<Tokens | null> {
  const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  if (!response.ok) return null                // 401 — refresh ham o'ldi

  return response.json() as Promise<Tokens>
}

/** Cookie parametrlari bir joyda — 26-bobdagi qoidalar */
export function accessCookie(token: string, maxAge: number) {
  return {
    name: 'access_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

export function refreshCookie(token: string) {
  return {
    name: 'refresh_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
```
:::

::: js
```js
// lib/refresh.js
import 'server-only'

export async function refreshTokens(refreshToken) {
  const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    cache: 'no-store',
  })

  if (!response.ok) return null

  return response.json()
}

export function accessCookie(token, maxAge) {
  return {
    name: 'access_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  }
}

export function refreshCookie(token) {
  return {
    name: 'refresh_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }
}
```
:::

> **Diqqat.** 26-bobda refresh cookie'ga `path: '/api/auth'` berilgan edi. Agar refresh **middleware**'da bo'ladigan bo'lsa, `path` `/` bo'lishi shart — aks holda middleware uni ko'rmaydi. Ikki variantdan birini tanlang va izchil qo'llang.

## Kod: proaktiv refresh middleware'da

::: ts
```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { decodeJwt } from 'jose'
import { refreshTokens, accessCookie, refreshCookie } from '@/lib/refresh'

const PUBLIC = ['/login', '/register', '/']

/** Token muddati shu sekunddan kam qolgan bo'lsa yangilaymiz */
const SKEW = 60

function expiresSoon(token: string) {
  try {
    const { exp } = decodeJwt(token)          // imzo tekshirilmaydi — faqat muddat

    return typeof exp !== 'number' || exp - SKEW <= Math.floor(Date.now() / 1000)
  } catch {
    return true                                // o'qib bo'lmadi — yangilashga urinamiz
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  // 1. Access bor va hali yashaydi — tegmaymiz
  if (access && !expiresSoon(access)) return NextResponse.next()

  // 2. Refresh yo'q — himoyalangan sahifa bo'lsa login'ga
  if (!refresh) {
    if (PUBLIC.includes(pathname)) return NextResponse.next()

    return redirectToLogin(request)
  }

  // 3. Yangilaymiz
  const tokens = await refreshTokens(refresh)

  if (!tokens) {
    const response = PUBLIC.includes(pathname)
      ? NextResponse.next()
      : redirectToLogin(request)

    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
  }

  // 4. MUHIM: yangi tokenni shu so'rovning o'ziga ham beramiz.
  //    `request.cookies.set` downstream (layout, sahifa) o'qiydigan cookie'ni o'zgartiradi.
  request.cookies.set('access_token', tokens.accessToken)

  const response = NextResponse.next({ request })

  response.cookies.set(accessCookie(tokens.accessToken, tokens.expiresIn))
  response.cookies.set(refreshCookie(tokens.refreshToken))

  return response
}

function redirectToLogin(request: NextRequest) {
  const url = new URL('/login', request.url)

  url.searchParams.set('from', request.nextUrl.pathname)

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
}
```
:::

::: js
```js
// middleware.js
import { NextResponse } from 'next/server'
import { decodeJwt } from 'jose'
import { refreshTokens, accessCookie, refreshCookie } from '@/lib/refresh'

const PUBLIC = ['/login', '/register', '/']
const SKEW = 60

function expiresSoon(token) {
  try {
    const { exp } = decodeJwt(token)

    return typeof exp !== 'number' || exp - SKEW <= Math.floor(Date.now() / 1000)
  } catch {
    return true
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const access = request.cookies.get('access_token')?.value
  const refresh = request.cookies.get('refresh_token')?.value

  if (access && !expiresSoon(access)) return NextResponse.next()

  if (!refresh) {
    if (PUBLIC.includes(pathname)) return NextResponse.next()

    return redirectToLogin(request)
  }

  const tokens = await refreshTokens(refresh)

  if (!tokens) {
    const response = PUBLIC.includes(pathname) ? NextResponse.next() : redirectToLogin(request)

    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
  }

  request.cookies.set('access_token', tokens.accessToken)

  const response = NextResponse.next({ request })

  response.cookies.set(accessCookie(tokens.accessToken, tokens.expiresIn))
  response.cookies.set(refreshCookie(tokens.refreshToken))

  return response
}

function redirectToLogin(request) {
  const url = new URL('/login', request.url)

  url.searchParams.set('from', request.nextUrl.pathname)

  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
}
```
:::

Uch nozik joy:

1. **`decodeJwt`, `jwtVerify` emas.** Middleware'da imzoni tekshirish shart emas: token backend'ga baribir yuboriladi va u tekshiradi. Bu yerda faqat "muddati tugadimi" kerak, va `decodeJwt` kalitsiz, tez ishlaydi. (Agar middleware'da **ruxsat** qaroriga token ichidagi rolga tayansangiz — u holda `jwtVerify` majburiy, 30-bob.)
2. **`SKEW = 60`.** Tokenni tugashidan **oldin** yangilaymiz. Aks holda so'rov yo'lda ekan muddati tugab qolishi mumkin (soat farqi, tarmoq kechikishi).
3. **`NextResponse.next({ request })`** — bu bo'lmasa, sahifa va layout **eski** access tokenni o'qiydi va 401 oladi. Bu eng ko'p o'tkazib yuboriladigan qator.

## Kod: parallel so'rovlar muammosi (single-flight)

Middleware bir navigatsiyaga bir marta ishlaydi — u yerda muammo yo'q. Lekin Route Handler yoki fon so'rovlarida bir vaqtda bir nechta refresh ketishi mumkin:

```
t=0   So'rov A → 401 → refresh(R1) ──▶ backend: R1 kuydi, R2 tug'ildi
t=0   So'rov B → 401 → refresh(R1) ──▶ backend: R1 qayta ishlatildi!
                                        → REUSE DETECTED → oila bekor qilindi
t=1   Foydalanuvchi chiqarib yuborildi
```

Yechim — **single-flight**: bir vaqtda faqat bitta refresh ketsin, qolganlari shu natijani kutsin.

::: ts
```ts
// lib/single-flight.ts
import 'server-only'
import { refreshTokens, type Tokens } from './refresh'

// Kalit — refresh tokenning o'zi: bir xil token uchun bitta so'rov
const inFlight = new Map<string, Promise<Tokens | null>>()

export function refreshOnce(refreshToken: string): Promise<Tokens | null> {
  const existing = inFlight.get(refreshToken)

  if (existing) return existing                // kutayotgan so'rovga qo'shilamiz

  const promise = refreshTokens(refreshToken).finally(() => {
    inFlight.delete(refreshToken)
  })

  inFlight.set(refreshToken, promise)

  return promise
}
```
:::

::: js
```js
// lib/single-flight.js
import 'server-only'
import { refreshTokens } from './refresh'

const inFlight = new Map()

export function refreshOnce(refreshToken) {
  const existing = inFlight.get(refreshToken)

  if (existing) return existing

  const promise = refreshTokens(refreshToken).finally(() => {
    inFlight.delete(refreshToken)
  })

  inFlight.set(refreshToken, promise)

  return promise
}
```
:::

**Chegarasi:** bu `Map` bitta Node protsessi ichida ishlaydi. Serversiz (serverless) muhitda har so'rov alohida instansiyada bo'lishi mumkin va `Map` bo'sh bo'ladi. Shuning uchun:

| Muhit | Single-flight ishlaydi | Nima qilish kerak |
| --- | --- | --- |
| Uzluksiz Node server (Docker, VPS) | ✅ Ha | Yuqoridagi `Map` yetarli |
| Vercel / Lambda | ⚠️ Qisman | Backend'da **grace period** bo'lishi kerak |
| Edge runtime | ⚠️ Qisman | Bir xil |

**Grace period** — backend tomonidagi yechim: kuydirilgan refresh token yana 10–30 soniya ishlayveradi va **o'sha yangi juftlikni** qaytaradi. Bu race'ni tabiiy hal qiladi. Backend'ga ta'sir qila olsangiz, shuni so'rang — bu eng ishonchli yechim.

## Kod: reaktiv refresh (fetch o'rami)

Route Handler va Server Action'lar uchun — 401'da bir marta qayta urinadi:

::: ts
```ts
// lib/api.ts
import 'server-only'
import { cookies } from 'next/headers'
import { refreshOnce } from './single-flight'
import { accessCookie, refreshCookie } from './refresh'

export class Unauthorized extends Error {}

type ApiInit = RequestInit & { canSetCookies?: boolean }

export async function api(path: string, init: ApiInit = {}): Promise<Response> {
  const cookieStore = await cookies()
  const access = cookieStore.get('access_token')?.value

  const send = (token: string | undefined) =>
    fetch(`${process.env.API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: init.cache ?? 'no-store',
    })

  let response = await send(access)

  if (response.status !== 401) return response

  // 401 — yangilashga urinamiz
  const refresh = cookieStore.get('refresh_token')?.value

  if (!refresh) throw new Unauthorized()

  const tokens = await refreshOnce(refresh)

  if (!tokens) throw new Unauthorized()

  // Cookie yozish faqat Server Action / Route Handler ichida mumkin
  if (init.canSetCookies !== false) {
    try {
      cookieStore.set(accessCookie(tokens.accessToken, tokens.expiresIn))
      cookieStore.set(refreshCookie(tokens.refreshToken))
    } catch {
      // Server komponent kontekstida — yozib bo'lmaydi.
      // Muammo emas: middleware keyingi navigatsiyada yangilaydi.
    }
  }

  response = await send(tokens.accessToken)

  if (response.status === 401) throw new Unauthorized()

  return response
}

export async function apiJson<T>(path: string, init?: ApiInit): Promise<T> {
  const response = await api(path, init)

  if (!response.ok) {
    throw new Error(`API ${response.status} ${path}`)
  }

  return response.json() as Promise<T>
}
```
:::

::: js
```js
// lib/api.js
import 'server-only'
import { cookies } from 'next/headers'
import { refreshOnce } from './single-flight'
import { accessCookie, refreshCookie } from './refresh'

export class Unauthorized extends Error {}

export async function api(path, init = {}) {
  const cookieStore = await cookies()
  const access = cookieStore.get('access_token')?.value

  const send = (token) =>
    fetch(`${process.env.API_URL}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: init.cache ?? 'no-store',
    })

  let response = await send(access)

  if (response.status !== 401) return response

  const refresh = cookieStore.get('refresh_token')?.value

  if (!refresh) throw new Unauthorized()

  const tokens = await refreshOnce(refresh)

  if (!tokens) throw new Unauthorized()

  try {
    cookieStore.set(accessCookie(tokens.accessToken, tokens.expiresIn))
    cookieStore.set(refreshCookie(tokens.refreshToken))
  } catch {
    // server komponent — cookie yozilmaydi, middleware keyin yangilaydi
  }

  response = await send(tokens.accessToken)

  if (response.status === 401) throw new Unauthorized()

  return response
}

export async function apiJson(path, init) {
  const response = await api(path, init)

  if (!response.ok) throw new Error(`API ${response.status} ${path}`)

  return response.json()
}
```
:::

`try/catch` atrofidagi `cookieStore.set` — ataylab. Server komponentda u xato tashlaydi, lekin **so'rovning o'zi muvaffaqiyatli** bo'ladi: yangi token shu render uchun ishlatiladi, cookie esa keyingi navigatsiyada middleware orqali yangilanadi. Sahifa buzilmaydi.

## Kod: refresh Route Handler (klient uchun)

Klient komponent (masalan TanStack Query) 401 olsa, bu endpointni chaqirib qayta urinadi:

::: ts
```ts
// app/api/auth/refresh/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import { refreshOnce } from '@/lib/single-flight'
import { accessCookie, refreshCookie } from '@/lib/refresh'

export async function POST(request: NextRequest) {
  const refresh = request.cookies.get('refresh_token')?.value

  if (!refresh) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const tokens = await refreshOnce(refresh)

  if (!tokens) {
    const response = NextResponse.json({ ok: false }, { status: 401 })

    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
  }

  // Tokenning O'ZI qaytarilmaydi — faqat cookie o'rnatiladi
  const response = NextResponse.json({ ok: true, expiresIn: tokens.expiresIn })

  response.cookies.set(accessCookie(tokens.accessToken, tokens.expiresIn))
  response.cookies.set(refreshCookie(tokens.refreshToken))

  return response
}
```
:::

::: js
```js
// app/api/auth/refresh/route.js
import { NextResponse } from 'next/server'
import { refreshOnce } from '@/lib/single-flight'
import { accessCookie, refreshCookie } from '@/lib/refresh'

export async function POST(request) {
  const refresh = request.cookies.get('refresh_token')?.value

  if (!refresh) return NextResponse.json({ ok: false }, { status: 401 })

  const tokens = await refreshOnce(refresh)

  if (!tokens) {
    const response = NextResponse.json({ ok: false }, { status: 401 })

    response.cookies.delete('access_token')
    response.cookies.delete('refresh_token')

    return response
  }

  const response = NextResponse.json({ ok: true, expiresIn: tokens.expiresIn })

  response.cookies.set(accessCookie(tokens.accessToken, tokens.expiresIn))
  response.cookies.set(refreshCookie(tokens.refreshToken))

  return response
}
```
:::

Klient tomonida — o'ram:

::: ts
```ts
// lib/client-api.ts  ('use client' fayllarda ishlatiladi)
let refreshing: Promise<boolean> | null = null

async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST' })
    .then((r) => r.ok)
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

export async function clientApi(path: string, init?: RequestInit): Promise<Response> {
  let response = await fetch(path, { ...init, credentials: 'same-origin' })

  if (response.status !== 401) return response

  const ok = await refreshSession()

  if (!ok) {
    window.location.href = `/login?from=${encodeURIComponent(location.pathname)}`

    throw new Error('Sessiya tugadi')
  }

  response = await fetch(path, { ...init, credentials: 'same-origin' })

  return response
}
```
:::

::: js
```js
// lib/client-api.js
let refreshing = null

async function refreshSession() {
  refreshing ??= fetch('/api/auth/refresh', { method: 'POST' })
    .then((r) => r.ok)
    .finally(() => {
      refreshing = null
    })

  return refreshing
}

export async function clientApi(path, init) {
  let response = await fetch(path, { ...init, credentials: 'same-origin' })

  if (response.status !== 401) return response

  const ok = await refreshSession()

  if (!ok) {
    window.location.href = `/login?from=${encodeURIComponent(location.pathname)}`

    throw new Error('Sessiya tugadi')
  }

  return fetch(path, { ...init, credentials: 'same-origin' })
}
```
:::

`refreshing` o'zgaruvchisi — brauzer tomonidagi single-flight. Bir sahifada 6 ta so'rov 401 olsa ham, `/api/auth/refresh` bir marta chaqiriladi.

## Muhandislik nuqtai nazari: rotation va reuse detection

**Rotation** — har refreshda yangi refresh token beriladi, eskisi kuydiriladi.

```
R1 ──refresh──▶ (A2, R2),  R1 kuydi
R2 ──refresh──▶ (A3, R3),  R2 kuydi
```

**Reuse detection** — agar kuydirilgan R1 yana kelsa, bu ikki narsani anglatadi:

1. Token o'g'irlangan (hujumchi ham, foydalanuvchi ham ishlatyapti), yoki
2. Race condition (yuqoridagi parallel muammo).

Backend farqni ajrata olmaydi, shuning uchun **butun zanjirni bekor qiladi** — foydalanuvchi chiqarib yuboriladi.

Shuning uchun single-flight **ixtiyoriy emas**: usiz foydalanuvchilar tasodifiy chiqib qoladi va siz sababini topa olmaysiz.

| Muammo belgisi | Sabab |
| --- | --- |
| Foydalanuvchilar "o'z-o'zidan chiqib ketyapti" deydi, log toza | Race → reuse detection |
| Faqat sekin internetda sodir bo'ladi | Parallel so'rovlar cho'zilyapti |
| Sahifani yangilaganda ko'proq | Bir vaqtda ko'p so'rov |
| Serverless'da ko'proq, Docker'da yo'q | `Map` instansiyalar orasida bo'lishilmaydi |

## Muhandislik nuqtai nazari: nima qilmaslik kerak

**Har so'rovda refresh qilish.** Ba'zilar `SKEW` ni katta qo'yib (masalan 10 daqiqa, access esa 15 daqiqa) amalda har navigatsiyada refresh qiladi. Bu backend'ga ortiqcha yuk va rotation zanjirini keraksiz uzaytiradi. `SKEW` — 30–60 soniya.

**Refresh tokenni klientga berish.** `/api/auth/refresh` javobida token qaytarilsa (`{ accessToken: '...' }`), u brauzer xotirasiga tushadi va httpOnly'ning butun foydasi yo'qoladi.

**Refreshni `useEffect` da taymer bilan qilish.** Tab fon rejimida bo'lsa brauzer taymerni sekinlashtiradi; noutbuk uyqudan uyg'onsa taymer allaqachon kechikkan. Middleware ishonchliroq: har navigatsiyada aniq ishlaydi. Taymer faqat **qo'shimcha** sifatida, uzoq ochiq turadigan sahifalar uchun (dashboard).

**Refreshni `generateStaticParams` yoki build vaqtidagi kodda chaqirish.** U yerda foydalanuvchi yo'q, cookie yo'q.

## Muhandislik nuqtai nazari: sessiya modeli bilan solishtirish

Agar backend'ingiz oddiy **server sessiyasi** bersa (Laravel Sanctum SPA rejimi, Symfony session):

| | JWT + refresh | Server sessiyasi |
| --- | --- | --- |
| Refresh oqimi kerakmi | ✅ Ha (shu bob) | ❌ Yo'q |
| Race muammosi | Bor | Yo'q |
| Darhol bekor qilish | Qiyin (25-bob) | Oson |
| Gorizontal skalalash | Oson (stateless) | Redis kerak |
| Next kodi | ~200 qator | ~20 qator |

Ko'p loyihalar JWT'ni "zamonaviy" deb tanlaydi va keyin shu bobdagi murakkablikni yozadi. Agar sizda bitta backend va bitta frontend bo'lsa va mikroservis yo'q bo'lsa — **sessiya modeli sodda va xavfsizroq**. JWT mikroservislar, mobil ilova yoki uchinchi tomon kliyentlari bo'lganda o'zini oqlaydi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Middleware'da `NextResponse.next({ request })` yozmaslik | Sahifa eski token bilan 401 oladi | `request.cookies.set` + `next({ request })` |
| Single-flight yo'q | Rotation reuse → tasodifiy logout | `refreshOnce` |
| `SKEW` yo'q (aniq muddatga tayanish) | Yo'ldagi so'rov 401 oladi | 30–60 s zaxira |
| Server komponentda `cookies().set()` | `Error: Cookies can only be modified...` | Middleware yoki Route Handler |
| Refresh tokenni javobda qaytarish | httpOnly foydasi yo'qoladi | Faqat cookie |
| Refresh cookie `path` mos kelmasligi | Middleware tokenni ko'rmaydi | Bitta `path` ni izchil qo'llash |
| Cheksiz sikl: refresh ham 401 → yana refresh | Brauzer qotadi | Bir marta urinish, keyin logout |
| `jwtVerify` ni middleware'da kalitsiz chaqirish | Har so'rovda JWKS yuklanadi | `decodeJwt` (faqat muddat uchun) |
| Refresh xatosida cookie'ni o'chirmaslik | Foydalanuvchi buzuq holatda qoladi | `cookies.delete` ikkalasini |

## Amaliyot

1. Middleware'ni yozing. Access token muddatini 60 soniyaga qo'yib, sahifani 2 daqiqa kutib turgandan keyin yangilang — foydalanuvchi chiqib ketmasligi kerak.
2. `NextResponse.next({ request })` dagi `{ request }` ni olib tashlang va nima bo'lishini ko'ring: sahifa 401 oladi. Qaytarib qo'ying — bu xatoni bir marta ko'rish yetadi.
3. Single-flight'siz 5 ta parallel so'rov yuboring (`Promise.all`) va backend logida nechta refresh kelganini sanang. `refreshOnce` qo'shib qayta sanang.
4. `/api/auth/refresh` ni `curl -v` bilan chaqiring: javobda `Set-Cookie` bor, lekin tanada token yo'qligini tasdiqlang.
5. Refresh tokenni qo'lda buzing (cookie qiymatini o'zgartiring) — foydalanuvchi `/login` ga yo'naltirilishi va ikkala cookie o'chishi kerak.
6. Backend'da grace period bor-yo'qligini so'rang yoki sinab ko'ring: bir refresh tokenni ketma-ket ikki marta ishlating.

## Rasmiy hujjat

- Middleware: <https://nextjs.org/docs/app/api-reference/file-conventions/middleware>
- `cookies()` cheklovlari: <https://nextjs.org/docs/app/api-reference/functions/cookies>
- Autentifikatsiya: <https://nextjs.org/docs/app/guides/authentication>
- OAuth 2.0 Security BCP (rotation, reuse detection): <https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics>
