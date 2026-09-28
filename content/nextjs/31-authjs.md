# 31 — Auth.js bilan

[← Oldingi: Himoyalangan marshrutlar](30-himoyalangan-marshrutlar.md) · [Mundarija](README.md) · [Keyingi: Ma'lumotlar bazasi: Prisma →](32-prisma.md)

## Tushuncha

25–30-boblarda auth qo'lda yozildi. Bu to'liq nazorat beradi, lekin OAuth (Google, GitHub) qo'shilganda kod tez o'sadi: `state` parametri, PKCE, callback URL, provayder farqlari.

**Auth.js** (ilgari NextAuth.js) shu qismni oladi:

| Nima | Qo'lda | Auth.js |
| --- | --- | --- |
| Email/parol | ~200 qator | `Credentials` provayderi |
| Google / GitHub OAuth | ~400 qator har biriga | 5 qator |
| Sessiya cookie | O'zingiz | Avtomatik, shifrlangan |
| CSRF himoyasi | O'zingiz | Avtomatik |
| Bazaga bog'lash | O'zingiz | Adapter |
| Tashqi backend tokenlari | Tabiiy | `jwt` callback orqali (murakkabroq) |

Oxirgi qator muhim: **sizning holatingizda** (tashqi Laravel/Symfony backend) Auth.js majburiy emas va ba'zan xalaqit beradi. Bu bob qachon olish, qachon olmaslikni ham ko'rsatadi.

## Nega shunday

Auth.js ikki sessiya strategiyasini qo'llab-quvvatlaydi:

```
strategy: 'jwt'       →  sessiya shifrlangan cookie ichida (JWE)
                         baza kerak emas, stateless

strategy: 'database'  →  sessiya bazada, cookie'da faqat ID
                         adapter kerak, bekor qilish oson
```

Tashqi backend bilan ishlaganda odatda `jwt` tanlanadi va backend tokenlari **shu cookie ichiga** joylanadi. Ya'ni Auth.js sizning access/refresh tokenlaringizni o'z sessiya obyektida saqlaydi va siz refreshni `jwt` callback'ida yozasiz.

## Kod: o'rnatish va asosiy konfiguratsiya

```bash
npm install next-auth@beta
```

```bash
# .env.local
AUTH_SECRET=...            # npx auth secret
AUTH_URL=http://localhost:3000
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
```

::: ts
```ts
// auth.ts (loyiha ildizida)
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Google,

    Credentials({
      credentials: {
        email: { label: 'Pochta', type: 'email' },
        password: { label: 'Parol', type: 'password' },
      },

      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)

        if (!parsed.success) return null

        // Tashqi backend'ga so'rov — 27-bobdagi bilan bir xil
        const response = await fetch(`${process.env.API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
          cache: 'no-store',
        })

        if (!response.ok) return null            // null → "Kirish amalga oshmadi"

        const data = await response.json()

        // Bu obyekt `jwt` callback'ga `user` bo'lib boradi
        return {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // 1. Birinchi kirish — `user` bor
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        }
      }

      // 2. Token hali yashaydi
      if (typeof token.expiresAt === 'number' && Date.now() / 1000 < token.expiresAt - 60) {
        return token
      }

      // 3. Yangilash kerak (28-bob)
      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.id = token.sub as string
      session.error = token.error as string | undefined

      // DIQQAT: accessToken'ni SESSIYAGA QO'SHMANG — u klientga boradi (26-bob)
      return session
    },

    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user)
      const isProtected = request.nextUrl.pathname.startsWith('/dashboard')

      if (isProtected && !isLoggedIn) return false     // → signIn sahifasiga

      return true
    },
  },
})
```
:::

::: js
```js
// auth.js
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },

  pages: { signIn: '/login', error: '/login' },

  providers: [
    Google,

    Credentials({
      credentials: {
        email: { label: 'Pochta', type: 'email' },
        password: { label: 'Parol', type: 'password' },
      },

      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw)

        if (!parsed.success) return null

        const response = await fetch(`${process.env.API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
          cache: 'no-store',
        })

        if (!response.ok) return null

        const data = await response.json()

        return {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          expiresAt: user.expiresAt,
        }
      }

      if (typeof token.expiresAt === 'number' && Date.now() / 1000 < token.expiresAt - 60) {
        return token
      }

      return refreshAccessToken(token)
    },

    async session({ session, token }) {
      session.user.id = token.sub
      session.error = token.error

      return session
    },

    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user)
      const isProtected = request.nextUrl.pathname.startsWith('/dashboard')

      if (isProtected && !isLoggedIn) return false

      return true
    },
  },
})
```
:::

## Kod: route handler va middleware

::: ts
```ts
// app/api/auth/[...nextauth]/route.ts
export { GET, POST } from '@/auth'
```

```ts
// middleware.ts
export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```
:::

::: js
```js
// app/api/auth/[...nextauth]/route.js
export { GET, POST } from '@/auth'

// middleware.js
export { auth as middleware } from '@/auth'

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```
:::

`auth` middleware `authorized` callback'ini chaqiradi. 30-bobdagi qoida bu yerda ham amal qiladi: **bu xavfsizlik chegarasi emas**, DAL'da qayta tekshiring.

## Kod: refresh Auth.js ichida

::: ts
```ts
// auth.ts ichida
import type { JWT } from 'next-auth/jwt'

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error('Refresh rad etildi')

    const data = await response.json()

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,   // rotation bo'lmasa eskisi
      expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
      error: undefined,
    }
  } catch {
    // Xatoni sessiyaga yozamiz — UI logout qiladi
    return { ...token, error: 'RefreshFailed' }
  }
}
```
:::

::: js
```js
async function refreshAccessToken(token) {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error('Refresh rad etildi')

    const data = await response.json()

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      expiresAt: Math.floor(Date.now() / 1000) + data.expiresIn,
      error: undefined,
    }
  } catch {
    return { ...token, error: 'RefreshFailed' }
  }
}
```
:::

Klient tomonida xatoni ushlash:

::: ts
```tsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

export function SessionGuard() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.error === 'RefreshFailed') {
      signOut({ redirectTo: '/login' })
    }
  }, [session?.error])

  return null
}
```
:::

::: js
```jsx
'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect } from 'react'

export function SessionGuard() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.error === 'RefreshFailed') signOut({ redirectTo: '/login' })
  }, [session?.error])

  return null
}
```
:::

**Race muammosi bu yerda ham bor** (28-bob): `jwt` callback parallel so'rovlarda bir necha marta ishlashi mumkin. Auth.js buni hal qilmaydi — backend'da grace period bo'lishi kerak.

## Kod: sessiyani o'qish

::: ts
```tsx
// Server komponentda
import { auth } from '@/auth'

export default async function Page() {
  const session = await auth()

  if (!session?.user) return null

  return <p>Salom, {session.user.name}</p>
}
```

```ts
// Backend'ga so'rov — token sessiyada emas, tokendan olinadi
import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function apiGet<T>(path: string): Promise<T> {
  const token = await getToken({
    req: { headers: { cookie: (await cookies()).toString() } } as never,
    secret: process.env.AUTH_SECRET!,
  })

  const response = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token?.accessToken}` },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`API ${response.status}`)

  return response.json() as Promise<T>
}
```
:::

::: js
```jsx
import { auth } from '@/auth'

export default async function Page() {
  const session = await auth()

  if (!session?.user) return null

  return <p>Salom, {session.user.name}</p>
}

// lib/api.js
import { getToken } from 'next-auth/jwt'
import { cookies } from 'next/headers'

export async function apiGet(path) {
  const token = await getToken({
    req: { headers: { cookie: (await cookies()).toString() } },
    secret: process.env.AUTH_SECRET,
  })

  const response = await fetch(`${process.env.API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token?.accessToken}` },
    cache: 'no-store',
  })

  if (!response.ok) throw new Error(`API ${response.status}`)

  return response.json()
}
```
:::

`getToken` — shifrlangan sessiya cookie'sini serverda ochish yo'li. `auth()` qaytaradigan `session` obyektida access token **bo'lmasligi kerak** (u klientga ham boradi).

## Kod: login sahifasi

::: ts
```tsx
// app/(auth)/login/page.tsx
import { signIn } from '@/auth'

export default function LoginPage() {
  return (
    <>
      <form
        action={async (formData) => {
          'use server'
          await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/dashboard',
          })
        }}
      >
        <input name="email" type="email" autoComplete="email" required />
        <input name="password" type="password" autoComplete="current-password" required />
        <button type="submit">Kirish</button>
      </form>

      <form
        action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/dashboard' })
        }}
      >
        <button type="submit">Google bilan kirish</button>
      </form>
    </>
  )
}
```
:::

::: js
```jsx
// app/(auth)/login/page.jsx
import { signIn } from '@/auth'

export default function LoginPage() {
  return (
    <>
      <form
        action={async (formData) => {
          'use server'
          await signIn('credentials', {
            email: formData.get('email'),
            password: formData.get('password'),
            redirectTo: '/dashboard',
          })
        }}
      >
        <input name="email" type="email" required />
        <input name="password" type="password" required />
        <button type="submit">Kirish</button>
      </form>

      <form
        action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/dashboard' })
        }}
      >
        <button type="submit">Google bilan kirish</button>
      </form>
    </>
  )
}
```
:::

Xatolarni ko'rsatish uchun `AuthError` ni ushlash kerak:

::: ts
```ts
'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function login(prev: State, formData: FormData): Promise<State> {
  try {
    await signIn('credentials', Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin'
        ? { message: 'Pochta yoki parol noto\'g\'ri' }
        : { message: 'Kirishda xato' }
    }

    throw error                                  // redirect xatosi — o'tkazib yuborish shart
  }

  return {}
}
```
:::

::: js
```js
'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'

export async function login(prev, formData) {
  try {
    await signIn('credentials', Object.fromEntries(formData))
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin'
        ? { message: 'Pochta yoki parol noto\'g\'ri' }
        : { message: 'Kirishda xato' }
    }

    throw error
  }

  return {}
}
```
:::

`throw error` majburiy: `signIn` muvaffaqiyatda `redirect` xatosini tashlaydi va uni ushlab qolish yo'naltirishni buzadi (07-bob).

## Kod: TypeScript tiplarini kengaytirish

::: ts
```ts
// types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }

  interface Session {
    error?: string
    user: {
      id: string
      name?: string | null
      email?: string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
    error?: string
  }
}
```
:::

::: js
```js
// JavaScript loyihasida bu fayl kerak emas.
// Lekin JSDoc bilan tahrirlagichda yordam olish mumkin:

/**
 * @typedef {Object} AppSession
 * @property {{ id: string, name?: string, email?: string }} user
 * @property {string} [error]
 */
```
:::

## Muhandislik nuqtai nazari: Auth.js kerakmi

| Vaziyat | Tavsiya |
| --- | --- |
| Faqat email/parol, tashqi backend | ❌ Qo'lda (25–30-bob) — soddaroq |
| Google/GitHub/Apple OAuth kerak | ✅ Auth.js |
| Next'ning o'zi backend (Prisma bilan) | ✅ Auth.js + adapter |
| Backend allaqachon OAuth qiladi | ❌ Backend'ga yo'naltiring |
| Ko'p tenant, murakkab huquqlar | ⚠️ Auth.js + o'z qatlamingiz |
| Mobil ilova ham bor | ❌ Backend markazda bo'lsin |

Tashqi backend + Auth.js kombinatsiyasining narxi: **ikki sessiya tizimi**. Backend'ning o'z tokeni bor, Auth.js'ning o'z cookie'si bor, va ular sinxron turishi kerak. Backend'da foydalanuvchi bloklansa, Auth.js cookie'si hali 30 kun yashaydi.

Shuning uchun: **OAuth kerak bo'lmasa, Auth.js olmang.**

## Muhandislik nuqtai nazari: `strategy: 'database'`

Agar Next'ning o'zi bazaga yozsa (32-bob), `database` strategiyasi yaxshiroq:

::: ts
```ts
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [Google],
})
```
:::

::: js
```js
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  providers: [Google],
})
```
:::

| | `jwt` | `database` |
| --- | --- | --- |
| Baza so'rovi har navigatsiyada | ❌ Yo'q | ✅ Ha |
| Darhol logout (hamma qurilmada) | ❌ Qiyin | ✅ Oson |
| Edge runtime'da middleware | ✅ Ishlaydi | ❌ Ishlamaydi |
| Sessiyalar ro'yxati ("mening qurilmalarim") | ❌ Yo'q | ✅ Bor |

`database` bilan middleware'da `auth()` ishlatib bo'lmaydi (Edge'da Prisma yo'q) — split config kerak: `auth.config.ts` (Edge uchun, adaptersiz) va `auth.ts` (to'liq).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `accessToken` ni `session` ga qo'shish | Klientga boradi, XSS'da o'g'irlanadi | Faqat `token` ichida, `getToken` bilan o'qing |
| `signIn` ni `try/catch` da `throw` siz | Yo'naltirish ishlamaydi | `throw error` oxirida |
| `AUTH_SECRET` sozlanmagan | Production'da xato | `npx auth secret` |
| Faqat `authorized` callback'ga tayanish | Chetlab o'tish mumkin | DAL'da tekshiring (30-bob) |
| `jwt` callback'da refresh race | Rotation kuyadi | Backend grace period |
| `database` strategiyasi + Edge middleware | Prisma Edge'da ishlamaydi | Split config |
| `authorize` da xato tashlash | Foydalanuvchi ichki xatoni ko'radi | `return null` |
| Callback URL'ni provayder panelida sozlamaslik | `redirect_uri_mismatch` | `/api/auth/callback/google` qo'shing |
| Auth.js'ni OAuth kerak bo'lmasa qo'shish | Ortiqcha murakkablik | Qo'lda (25–30-bob) |

## Amaliyot

1. Auth.js'ni `Credentials` provayderi bilan ulab, tashqi backend'ga login qiling.
2. `session` obyektida `accessToken` yo'qligini brauzer DevTools'da (`/api/auth/session` javobida) tasdiqlang.
3. Google provayderini qo'shing va callback URL'ni Google Console'da sozlang.
4. Access token muddatini 60 soniyaga qisqartirib, `jwt` callback'dagi refresh ishlashini loglar bilan kuzating.
5. Refresh'ni ataylab sindiring (noto'g'ri URL) — `SessionGuard` foydalanuvchini chiqarishini ko'ring.
6. Middleware'ni o'chirib, `/dashboard` hali ham himoyalanganligini tekshiring (DAL qatlami).
7. 25–30-boblardagi qo'lda yechim bilan solishtiring: qaysi biri sizning loyihangizga mos?

## Rasmiy hujjat

- Auth.js: <https://authjs.dev>
- Next.js bilan: <https://authjs.dev/getting-started/installation?framework=next-js>
- Credentials provayderi: <https://authjs.dev/getting-started/authentication/credentials>
- Refresh token rotation: <https://authjs.dev/guides/refresh-token-rotation>
- Adapterlar: <https://authjs.dev/getting-started/database>
