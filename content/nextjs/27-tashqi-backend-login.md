# 27 — Tashqi backend bilan login oqimi

[← Oldingi: Token qayerda saqlanadi](26-token-saqlash.md) · [Mundarija](README.md) · [Keyingi: Refresh oqimi →](28-refresh-oqimi.md)

## Tushuncha

Eng keng tarqalgan holat: backend allaqachon bor (Laravel, Symfony, Go, Django) va u JWT yoki sessiya beradi. Next — frontend.

Ikki arxitektura mumkin:

| Model | Brauzer kim bilan gaplashadi | Token qayerda |
| --- | --- | --- |
| **BFF (tavsiya)** | Faqat Next bilan | Next'dagi httpOnly cookie'da |
| **To'g'ridan-to'g'ri** | Backend bilan ham | Brauzerda (cookie yoki xotira) |

```
BFF:
  Brauzer ──▶ Next ──▶ Backend API
             (cookie)  (Bearer token)

To'g'ridan-to'g'ri:
  Brauzer ──▶ Next (faqat sahifalar)
     └────▶ Backend API (token bilan)
```

Bu bobda **BFF** modeli ko'riladi: u xavfsizroq (token brauzer JS'iga tegmaydi) va SSR bilan tabiiy ishlaydi.

## Kod: login — Server Action

::: ts
```ts
// app/(auth)/login/actions.ts
'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Pochta noto\'g\'ri'),
  password: z.string().min(8, 'Kamida 8 belgi'),
})

export type LoginState = {
  errors?: { email?: string[]; password?: string[] }
  message?: string
  values?: { email: string }
}

export async function login(prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: { email: raw.email ?? '' } }
  }

  // 1. Backend'ga so'rov
  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (!response.ok) {
    // Backend'ning aniq xabarini ko'rsatmang — u ma'lumot sizdirishi mumkin
    return { message: 'Pochta yoki parol noto\'g\'ri', values: { email: parsed.data.email } }
  }

  const { accessToken, refreshToken, expiresIn } = await response.json()

  // 2. Cookie'ga solish (26-bob)
  const cookieStore = await cookies()

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 30,
  })

  // 3. Yo'naltirish — try/catch DAN TASHQARIDA (07-bob)
  const from = formData.get('from')

  redirect(typeof from === 'string' && from.startsWith('/') ? from : '/dashboard')
}
```
:::

::: js
```js
// app/(auth)/login/actions.js
'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Pochta noto\'g\'ri'),
  password: z.string().min(8, 'Kamida 8 belgi'),
})

export async function login(prev, formData) {
  const raw = Object.fromEntries(formData)
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: { email: raw.email ?? '' } }
  }

  const response = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (!response.ok) {
    return { message: 'Pochta yoki parol noto\'g\'ri', values: { email: parsed.data.email } }
  }

  const { accessToken, refreshToken, expiresIn } = await response.json()
  const cookieStore = await cookies()

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  })

  cookieStore.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 30,
  })

  const from = formData.get('from')

  redirect(typeof from === 'string' && from.startsWith('/') ? from : '/dashboard')
}
```
:::

**Ikki xavfsizlik detali:**

1. Xato xabari umumiy ("pochta yoki parol noto'g'ri") — aks holda hujumchi qaysi email ro'yxatdan o'tganini bilib oladi;
2. `from.startsWith('/')` tekshiruvi — **ochiq yo'naltirish** (open redirect) hujumining oldini oladi: `?from=https://evil.com` ishlamaydi.

## Kod: login formasi

::: ts
```tsx
// app/(auth)/login/page.tsx — server komponent
import { LoginForm } from './LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>
}) {
  const { from } = await searchParams

  return (
    <div className="auth-layout">
      <h1>Kirish</h1>
      <LoginForm from={from} />
    </div>
  )
}
```

```tsx
// app/(auth)/login/LoginForm.tsx
'use client'

import { useActionState } from 'react'
import { login, type LoginState } from './actions'

const initial: LoginState = {}

export function LoginForm({ from }: { from?: string }) {
  const [state, formAction, isPending] = useActionState(login, initial)

  return (
    <form action={formAction} noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <Field label="Pochta" error={state.errors?.email?.[0]}>
        {(props) => (
          <input {...props} name="email" type="email" autoComplete="email" defaultValue={state.values?.email} />
        )}
      </Field>

      <Field label="Parol" error={state.errors?.password?.[0]}>
        {(props) => <input {...props} name="password" type="password" autoComplete="current-password" />}
      </Field>

      {state.message && <p role="alert" className="error">{state.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Kirilmoqda…' : 'Kirish'}
      </button>
    </form>
  )
}
```
:::

::: js
```jsx
// app/(auth)/login/page.jsx
export default async function LoginPage({ searchParams }) {
  const { from } = await searchParams

  return (
    <div className="auth-layout">
      <h1>Kirish</h1>
      <LoginForm from={from} />
    </div>
  )
}

// app/(auth)/login/LoginForm.jsx
'use client'

import { useActionState } from 'react'
import { login } from './actions'

export function LoginForm({ from }) {
  const [state, formAction, isPending] = useActionState(login, {})

  return (
    <form action={formAction} noValidate>
      {from && <input type="hidden" name="from" value={from} />}

      <Field label="Pochta" error={state.errors?.email?.[0]}>
        {(props) => <input {...props} name="email" type="email" defaultValue={state.values?.email} />}
      </Field>

      {state.message && <p role="alert">{state.message}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Kirilmoqda…' : 'Kirish'}
      </button>
    </form>
  )
}
```
:::

`autoComplete="email"` va `current-password` — parol menejerlari uchun (44-bob).

## Kod: joriy foydalanuvchi

::: ts
```ts
// lib/auth.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'

export type User = { id: number; name: string; email: string; roles: string[] }

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) return null

  const response = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',                      // shaxsiy ma'lumot — KESHLANMAYDI
  })

  if (!response.ok) return null

  return response.json()
})

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return user
}
```
:::

::: js
```js
// lib/auth.js
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) return null

  const response = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) return null

  return response.json()
})

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return user
}
```
:::

Uch muhim detal:

1. **`cache()`** — bir render davomida `/auth/me` bir marta so'raladi (16-bob), garchi u 5 joyda chaqirilsa ham;
2. **`cache: 'no-store'`** — shaxsiy ma'lumot hech qachon keshlanmaydi (18, 45-bob);
3. **`server-only`** — bu fayl klientga tushmaydi.

Alternativa: `/auth/me` ga so'rov yubormasdan, JWT payload'ini o'qish (tezroq, lekin ma'lumot eskirishi mumkin):

```ts
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, publicKey, { algorithms: ['RS256'] })

    return { id: Number(payload.sub), roles: payload.roles as string[] }
  } catch {
    return null
  }
})
```

Tanlov: **har so'rovda `/me`** (ma'lumot yangi, lekin sekinroq) yoki **JWT payload** (tez, lekin rol o'zgarishi token muddati tugaguncha ko'rinmaydi).

## Kod: logout

::: ts
```ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  // 1. Backend'da refresh tokenni bekor qilish
  if (refreshToken) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => {})                      // backend tushib qolsa ham cookie o'chirilsin
  }

  // 2. Cookie'larni o'chirish
  cookieStore.delete('access_token')
  cookieStore.delete({ name: 'refresh_token', path: '/api/auth' })

  redirect('/login')
}
```
:::

::: js
```js
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function logout() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refresh_token')?.value

  if (refreshToken) {
    await fetch(`${process.env.API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => {})
  }

  cookieStore.delete('access_token')
  cookieStore.delete({ name: 'refresh_token', path: '/api/auth' })

  redirect('/login')
}
```
:::

**Backend'da bekor qilish majburiy:** faqat cookie o'chirilsa, o'g'irlangan refresh token ishlashda davom etadi.

```tsx
// Logout tugmasi
<form action={logout}>
  <button type="submit">Chiqish</button>
</form>
```

## Kod: Route Handler orqali login (muqobil)

Server Action o'rniga Route Handler ham ishlatilishi mumkin — masalan mobil ilova ham shu endpointni chaqirsa:

::: ts
```ts
// app/api/auth/login/route.ts
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const upstream = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (!upstream.ok) {
    return NextResponse.json({ message: 'Kirish amalga oshmadi' }, { status: 401 })
  }

  const { accessToken, refreshToken, expiresIn } = await upstream.json()

  const response = NextResponse.json({ ok: true })

  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresIn,
  })

  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 30,
  })

  return response
}
```
:::

::: js
```js
// app/api/auth/login/route.js
import { NextResponse } from 'next/server'

export async function POST(request) {
  const body = await request.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 422 })
  }

  const upstream = await fetch(`${process.env.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (!upstream.ok) return NextResponse.json({ message: 'Kirish amalga oshmadi' }, { status: 401 })

  const { accessToken, refreshToken, expiresIn } = await upstream.json()
  const response = NextResponse.json({ ok: true })

  response.cookies.set('access_token', accessToken, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: expiresIn,
  })

  return response
}
```
:::

## Kod: ro'yxatdan o'tish va parol tiklash

Bir xil naqsh:

::: ts
```ts
'use server'

export async function register(prev: State, formData: FormData): Promise<State> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (response.status === 422) {
    const body = await response.json()

    return { errors: body.errors }             // backend validatsiyasi (masalan "email band")
  }

  if (!response.ok) return { message: 'Ro\'yxatdan o\'tib bo\'lmadi' }

  // Ba'zi backendlar darhol token beradi — unda login qilish shart emas
  const { accessToken, refreshToken, expiresIn } = await response.json()

  await setTokens(accessToken, refreshToken, expiresIn)

  redirect('/onboarding')
}
```
:::

::: js
```js
'use server'

export async function register(prev, formData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
    cache: 'no-store',
  })

  if (response.status === 422) {
    const body = await response.json()

    return { errors: body.errors }
  }

  if (!response.ok) return { message: 'Ro\'yxatdan o\'tib bo\'lmadi' }

  const { accessToken, refreshToken, expiresIn } = await response.json()

  await setTokens(accessToken, refreshToken, expiresIn)

  redirect('/onboarding')
}
```
:::

Backend validatsiya xatolarini (422) **maydonlarga bog'lang** — bu forma UX'ining eng muhim qismi (22-bob).

## Muhandislik nuqtai nazari: nega BFF

| Mezon | BFF (Next orqali) | To'g'ridan-to'g'ri |
| --- | --- | --- |
| Token brauzer JS'ida | ❌ Yo'q | ✅ Ha (xavf) |
| XSS'da token o'g'irlanishi | ❌ Mumkin emas | ✅ Mumkin |
| SSR'da foydalanuvchi ma'lum | ✅ Ha | ❌ Yo'q |
| CORS sozlash | Kerak emas | Kerak |
| Qo'shimcha sakrash | ✅ Bor (kechikish) | Yo'q |
| Backend o'zgarishi klientga ta'sir qiladi | Yo'q (Next qatlam) | Ha |
| Mobil ilova bilan bo'lishish | Backend'ni to'g'ridan-to'g'ri ishlatadi | Tabiiy |

BFF narxi — **qo'shimcha kechikish** (brauzer → Next → backend). Agar Next va backend bir regionda bo'lsa, bu 5–20 ms.

## Muhandislik nuqtai nazari: sessiya modeli bilan (Laravel Sanctum, Symfony)

Agar backend **cookie sessiyasi** ishlatsa va u bir xil domenda bo'lsa (`example.com` va `api.example.com`):

::: ts
```ts
// Cookie'larni uzatish
const response = await fetch(`${process.env.API_URL}/me`, {
  headers: {
    cookie: (await cookies()).toString(),      // brauzer cookie'larini backend'ga uzatish
  },
  cache: 'no-store',
})
```
:::

::: js
```js
const response = await fetch(`${process.env.API_URL}/me`, {
  headers: { cookie: (await cookies()).toString() },
  cache: 'no-store',
})
```
:::

Bu holatda Next tokenlarni boshqarmaydi — backend sessiyasi ishlaydi, Next faqat cookie'ni uzatadi. Soddaroq, lekin domenlar bir xil bo'lishi kerak (`sameSite` va `domain` sozlamalari).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Backend xato xabarini o'zgartirmasdan ko'rsatish | "Bu email topilmadi" — ma'lumot sizadi | Umumiy xabar |
| `from` parametrini tekshirmaslik | Ochiq yo'naltirish hujumi | `startsWith('/')` |
| Logout'da backend'ga xabar bermaslik | O'g'irlangan token ishlashda davom etadi | `/auth/logout` chaqiring |
| `/auth/me` ni keshlash | Boshqa foydalanuvchi ma'lumoti ko'rinadi | `cache: 'no-store'` |
| `getCurrentUser` ni `cache()` siz | Har chaqiruvda so'rov | `cache()` |
| Tokenni klient komponentga uzatish | RSC payload'da ko'rinadi (26-bob) | Faqat `user` obyekti |
| Login'ni klient `fetch` bilan qilish | Token brauzerga tushadi | Server Action |
| `redirect()` ni `try/catch` ichida | Ushlanib qoladi | Tashqarida |

## Amaliyot

1. Login Server Action'ini yozing: validatsiya, backend so'rovi, cookie o'rnatish, yo'naltirish.
2. `?from=https://evil.com` bilan login qiling — ochiq yo'naltirishni tekshiring va tuzating.
3. `getCurrentUser` ni `cache()` bilan yozing; uni layout, sahifa va komponentda chaqirib, backend loglarida bitta so'rov borligini tasdiqlang.
4. Logout'ni yozing va backend'da refresh token bekor qilinishini tekshiring.
5. DevTools → Application → Cookies da ikkala cookie'ni ko'ring; `document.cookie` da ular ko'rinmasligini tasdiqlang.
6. Ro'yxatdan o'tishda backend 422 qaytarsin va xatolar maydonlarga bog'lanishini ta'minlang.

## Rasmiy hujjat

- Autentifikatsiya: <https://nextjs.org/docs/app/guides/authentication>
- `cookies()`: <https://nextjs.org/docs/app/api-reference/functions/cookies>
- OWASP Authentication Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html>
