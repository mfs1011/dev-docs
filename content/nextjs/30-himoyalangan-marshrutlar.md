# 30 — Himoyalangan marshrutlar

[← Oldingi: Server komponentlardan so'rov](29-server-sorovlar.md) · [Mundarija](README.md) · [Keyingi: Auth.js bilan →](31-authjs.md)

## Tushuncha

"Bu sahifani faqat kirgan foydalanuvchi ko'rsin", "bu bo'limni faqat admin ochsin" — ruxsat tekshiruvi. Next'da uni **uch qatlamda** qo'yish mumkin, va ularning roli har xil:

| Qatlam | Nima uchun | Xavfsizlik chegarasimi |
| --- | --- | --- |
| **Middleware** | Tez yo'naltirish, UX | ❌ Yo'q |
| **Layout / sahifa** | Ma'lumotni yuklashdan oldin tekshirish | ⚠️ Qisman |
| **Ma'lumot qatlami (DAL)** | Har so'rovda haqiqiy tekshiruv | ✅ Ha |

Eng muhim qoida shu jadvalda: **middleware xavfsizlik chegarasi emas**. U foydalanuvchini `/login` ga yo'naltiradi, lekin himoya qilmaydi.

## Nega shunday

### Nega middleware yetarli emas

Middleware bir nechta sababga ko'ra o'tkazib yuborilishi mumkin:

1. **Server Action'lar** — ular POST so'rov, lekin matcher ularni qamramasligi mumkin va Action o'z marshrutidan mustaqil chaqiriladi;
2. **Route Handler'lar** — ba'zi matcher naqshlari `/api/*` ni chiqarib tashlaydi;
3. **RSC so'rovlari** — klient navigatsiyasida sahifa qismi alohida so'raladi;
4. **Konfiguratsiya xatosi** — matcher regex'ida bitta xato butun bo'limni ochib qo'yadi;
5. **Tarixiy zaifliklar** — 2025-yilda Next'da middleware'ni sarlavha orqali chetlab o'tish zaifligi topilgan edi (CVE-2025-29927).

Beshinchi punkt eng muhimi: bu **haqiqatda bo'lgan**. Agar himoya faqat middleware'da bo'lganida, butun ilova ochilib qolar edi.

```
Middleware    ──▶  "kirmagan bo'lsa /login ga yubor"      ← UX
Layout        ──▶  "user yo'q bo'lsa redirect"            ← qulaylik
DAL (lib/dal) ──▶  "user yo'q bo'lsa xato tashla"         ← XAVFSIZLIK
```

### Nega layout ham to'liq yetarli emas

Layout bir marta render qilinadi va **bolalar navigatsiyasida qayta ishlamasligi mumkin** (08-bob): `/dashboard/a` dan `/dashboard/b` ga o'tganda layout saqlanadi. Agar ruxsat shu oraliqda o'zgarsa (foydalanuvchi rolidan mahrum bo'lsa), layout buni sezmaydi.

Shuning uchun haqiqiy tekshiruv — **ma'lumotga eng yaqin joyda**.

## Kod: DAL (Data Access Layer)

Rasmiy hujjat aynan shuni tavsiya qiladi: ma'lumotga kirishning yagona nuqtasi, va tekshiruv shu yerda.

::: ts
```ts
// lib/dal.ts
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect, forbidden } from 'next/navigation'

export type Session = { userId: number; roles: string[]; email: string }

/** Sessiyani tekshiradi. Bir render davomida bir marta ishlaydi. */
export const verifySession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get('access_token')?.value

  if (!token) return null

  const response = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const user = await response.json()

  return { userId: user.id, roles: user.roles ?? [], email: user.email }
})

/** Sessiya majburiy. Yo'q bo'lsa — login. */
export const requireSession = cache(async (): Promise<Session> => {
  const session = await verifySession()

  if (!session) redirect('/login')

  return session
})

/** Rol majburiy. Yo'q bo'lsa — 403. */
export async function requireRole(role: string): Promise<Session> {
  const session = await requireSession()

  if (!session.roles.includes(role)) {
    forbidden()                                  // app/forbidden.tsx ni ko'rsatadi
  }

  return session
}
```
:::

::: js
```js
// lib/dal.js
import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect, forbidden } from 'next/navigation'

export const verifySession = cache(async () => {
  const token = (await cookies()).get('access_token')?.value

  if (!token) return null

  const response = await fetch(`${process.env.API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  })

  if (!response.ok) return null

  const user = await response.json()

  return { userId: user.id, roles: user.roles ?? [], email: user.email }
})

export const requireSession = cache(async () => {
  const session = await verifySession()

  if (!session) redirect('/login')

  return session
})

export async function requireRole(role) {
  const session = await requireSession()

  if (!session.roles.includes(role)) forbidden()

  return session
}
```
:::

Endi **har bir** ma'lumot funksiyasi shu yerdan boshlanadi:

::: ts
```ts
// lib/queries/orders.ts
import 'server-only'
import { forbidden } from 'next/navigation'
import { requireSession } from '@/lib/dal'
import { apiGet } from '@/lib/api'

export async function getMyOrders() {
  await requireSession()                         // ← tekshiruv shu yerda

  return apiGet<Order[]>('/orders')
}

export async function getOrder(id: string) {
  const session = await requireSession()
  const order = await apiGet<Order>(`/orders/${id}`)

  // Egalik tekshiruvi — backend ham qilishi kerak, lekin ikki qatlam yaxshi
  if (order.userId !== session.userId && !session.roles.includes('admin')) {
    forbidden()
  }

  return order
}
```
:::

::: js
```js
// lib/queries/orders.js
import 'server-only'
import { forbidden } from 'next/navigation'
import { requireSession } from '@/lib/dal'
import { apiGet } from '@/lib/api'

export async function getMyOrders() {
  await requireSession()

  return apiGet('/orders')
}

export async function getOrder(id) {
  const session = await requireSession()
  const order = await apiGet(`/orders/${id}`)

  if (order.userId !== session.userId && !session.roles.includes('admin')) {
    forbidden()
  }

  return order
}
```
:::

`cache()` tufayli `requireSession()` ni 20 joyda chaqirsangiz ham, bitta so'rov ketadi.

## Kod: `forbidden()` va `unauthorized()`

Next 15.1 dan `forbidden()` va `unauthorized()` funksiyalari bor — `notFound()` ga o'xshaydi, lekin 403 va 401 qaytaradi:

::: ts
```ts
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    authInterrupts: true,                        // forbidden() / unauthorized() uchun
  },
}

export default config
```

```tsx
// app/forbidden.tsx
import Link from 'next/link'

export default function Forbidden() {
  return (
    <main>
      <h1>403 — Ruxsat yo'q</h1>
      <p>Bu sahifani ko'rish uchun huquqingiz yetarli emas.</p>
      <Link href="/dashboard">Bosh sahifaga</Link>
    </main>
  )
}
```

```tsx
// app/unauthorized.tsx
import { LoginForm } from '@/app/(auth)/login/LoginForm'

export default function Unauthorized() {
  return (
    <main>
      <h1>401 — Kirish kerak</h1>
      <LoginForm />
    </main>
  )
}
```
:::

::: js
```js
// next.config.mjs
const config = {
  experimental: {
    authInterrupts: true,
  },
}

export default config

// app/forbidden.jsx
import Link from 'next/link'

export default function Forbidden() {
  return (
    <main>
      <h1>403 — Ruxsat yo'q</h1>
      <Link href="/dashboard">Bosh sahifaga</Link>
    </main>
  )
}
```
:::

Farqi:

| Funksiya | Status | Qachon |
| --- | --- | --- |
| `redirect('/login')` | 307 | Kirish kerak, forma boshqa sahifada |
| `unauthorized()` | 401 | Kirish kerak, shu yerda ko'rsatiladi |
| `forbidden()` | 403 | Kirgan, lekin huquqi yo'q |
| `notFound()` | 404 | Yo'q, **yoki** bor-yo'qligini yashirmoqchisiz |

Oxirgi qator muhim: ba'zan 403 o'rniga 404 qaytarish to'g'riroq. `/admin/users/42` 403 bersa, hujumchi 42-raqamli foydalanuvchi **borligini** bilib oladi. Maxfiy resurslar uchun `notFound()`.

## Kod: marshrut guruhlari bilan tuzilma

12-bobdagi guruhlar ruxsat uchun juda qulay:

```
app/
├── (public)/              ← hamma ko'radi
│   ├── page.tsx
│   └── blog/
├── (auth)/                ← faqat kirmaganlar
│   ├── layout.tsx         ← kirgan bo'lsa /dashboard ga
│   ├── login/
│   └── register/
├── (app)/                 ← faqat kirganlar
│   ├── layout.tsx         ← requireSession()
│   ├── dashboard/
│   └── orders/
└── (admin)/               ← faqat adminlar
    ├── layout.tsx         ← requireRole('admin')
    └── users/
```

::: ts
```tsx
// app/(app)/layout.tsx
import { requireSession } from '@/lib/dal'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession()

  return (
    <div className="app-shell">
      <Sidebar roles={session.roles} />
      <main>{children}</main>
    </div>
  )
}
```

```tsx
// app/(admin)/layout.tsx
import { requireRole } from '@/lib/dal'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole('admin')

  return <div className="admin-shell">{children}</div>
}
```

```tsx
// app/(auth)/layout.tsx — teskari tekshiruv
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  if (session) redirect('/dashboard')            // kirgan odam login'ni ko'rmasin

  return <div className="auth-shell">{children}</div>
}
```
:::

::: js
```jsx
// app/(app)/layout.jsx
import { requireSession } from '@/lib/dal'

export default async function AppLayout({ children }) {
  const session = await requireSession()

  return (
    <div className="app-shell">
      <Sidebar roles={session.roles} />
      <main>{children}</main>
    </div>
  )
}

// app/(admin)/layout.jsx
import { requireRole } from '@/lib/dal'

export default async function AdminLayout({ children }) {
  await requireRole('admin')

  return <div className="admin-shell">{children}</div>
}

// app/(auth)/layout.jsx
import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'

export default async function AuthLayout({ children }) {
  const session = await verifySession()

  if (session) redirect('/dashboard')

  return <div className="auth-shell">{children}</div>
}
```
:::

Layout'dagi tekshiruv — **qulaylik**, DAL'dagisi — **xavfsizlik**. Ikkalasi ham bo'lsin.

## Kod: Server Action himoyasi

Bu eng ko'p unutiladigan joy. Server Action — **ochiq HTTP endpoint**. Uni chaqirish uchun sahifani ko'rish shart emas:

::: ts
```ts
// ❌ Xavfli: hech qanday tekshiruv yo'q
'use server'

export async function deleteUser(id: number) {
  await apiPost(`/users/${id}/delete`, {})
}

// ✅ To'g'ri
'use server'

import { requireRole } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({ id: z.coerce.number().int().positive() })

export async function deleteUser(formData: FormData) {
  await requireRole('admin')                     // 1. Ruxsat

  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { message: 'Noto\'g\'ri so\'rov' }   // 2. Validatsiya

  await apiPost(`/users/${parsed.data.id}/delete`, {})             // 3. Amal

  revalidatePath('/admin/users')
}
```
:::

::: js
```js
// ❌ Xavfli
'use server'

export async function deleteUser(id) {
  await apiPost(`/users/${id}/delete`, {})
}

// ✅ To'g'ri
'use server'

import { requireRole } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const schema = z.object({ id: z.coerce.number().int().positive() })

export async function deleteUser(formData) {
  await requireRole('admin')

  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { message: 'Noto\'g\'ri so\'rov' }

  await apiPost(`/users/${parsed.data.id}/delete`, {})

  revalidatePath('/admin/users')
}
```
:::

**Har bir Server Action** shu uch qadamdan boshlanadi: ruxsat → validatsiya → amal. Istisnosiz (21, 45-bob).

## Kod: UI'da rolga qarab ko'rsatish

Bu **xavfsizlik emas**, UX:

::: ts
```tsx
// app/(app)/_components/Sidebar.tsx — server komponent
import { verifySession } from '@/lib/dal'

export async function Sidebar() {
  const session = await verifySession()

  return (
    <nav>
      <Link href="/dashboard">Bosh sahifa</Link>
      <Link href="/orders">Buyurtmalar</Link>

      {session?.roles.includes('admin') && (
        <Link href="/admin/users">Foydalanuvchilar</Link>
      )}
    </nav>
  )
}
```
:::

::: js
```jsx
import { verifySession } from '@/lib/dal'

export async function Sidebar() {
  const session = await verifySession()

  return (
    <nav>
      <Link href="/dashboard">Bosh sahifa</Link>
      <Link href="/orders">Buyurtmalar</Link>

      {session?.roles.includes('admin') && <Link href="/admin/users">Foydalanuvchilar</Link>}
    </nav>
  )
}
```
:::

Tugmani yashirish — himoya emas. Havola yashirilgan bo'lsa ham, `/admin/users` ni brauzerda qo'lda yozish mumkin. Shuning uchun layout va DAL tekshiruvi baribir kerak.

## Muhandislik nuqtai nazari: rollar, huquqlar va ABAC

Uch model:

| Model | Misol | Qachon |
| --- | --- | --- |
| **Rol** (RBAC) | `admin`, `manager`, `user` | Kichik ilova, 3–5 rol |
| **Huquq** (permission) | `orders.delete`, `users.edit` | Rollar ko'payganda |
| **Atribut** (ABAC) | "o'z bo'limidagi buyurtmani tahrirlaydi" | Murakkab qoidalar |

Rolni tekshirish tez qotib qoladi: bugun `admin` o'chira oladi, ertaga `manager` ham. Kod bo'ylab `roles.includes('admin')` tarqalgan bo'lsa, o'zgartirish og'riqli.

Yaxshiroq: **huquq** tekshiring, rolni huquqqa backend aylantirsin:

::: ts
```ts
// lib/dal.ts
export async function requirePermission(permission: string) {
  const session = await requireSession()

  if (!session.permissions.includes(permission)) forbidden()

  return session
}

// Ishlatish
await requirePermission('orders.delete')
```
:::

::: js
```js
export async function requirePermission(permission) {
  const session = await requireSession()

  if (!session.permissions.includes(permission)) forbidden()

  return session
}

await requirePermission('orders.delete')
```
:::

Egalik (ownership) tekshiruvi rolga sig'maydi — u har doim ma'lumot yonida bo'ladi (yuqoridagi `getOrder`).

## Muhandislik nuqtai nazari: middleware'da nimani tekshirish mumkin

Middleware'da **token ichidagi rolga** tayanish mumkin, lekin faqat `jwtVerify` bilan:

::: ts
```ts
// middleware.ts — admin bo'limi uchun tez filtr
import { jwtVerify, createRemoteJWKSet } from 'jose'

const jwks = createRemoteJWKSet(new URL(`${process.env.API_URL}/.well-known/jwks.json`))

async function rolesFrom(token: string): Promise<string[]> {
  try {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] })

    return (payload.roles as string[]) ?? []
  } catch {
    return []
  }
}
```
:::

::: js
```js
import { jwtVerify, createRemoteJWKSet } from 'jose'

const jwks = createRemoteJWKSet(new URL(`${process.env.API_URL}/.well-known/jwks.json`))

async function rolesFrom(token) {
  try {
    const { payload } = await jwtVerify(token, jwks, { algorithms: ['RS256'] })

    return payload.roles ?? []
  } catch {
    return []
  }
}
```
:::

Bu tez yo'naltirish beradi (foydalanuvchi 403 sahifasini ko'rmaydi, darhol `/dashboard` ga qaytadi). Lekin **baribir DAL'da qayta tekshiring**: token eskirgan bo'lishi, rol o'zgargan bo'lishi mumkin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Faqat middleware'da himoya | Chetlab o'tish mumkin | DAL'da ham tekshiring |
| Server Action'da tekshiruv yo'q | Har kim chaqira oladi | `requireSession()` birinchi qator |
| Faqat UI'da tugmani yashirish | URL'ni qo'lda yozish mumkin | Server tekshiruvi |
| Egalikni tekshirmaslik | `/orders/999` — boshqaning buyurtmasi | `order.userId !== session.userId` |
| Maxfiy resursga 403 | Resurs borligi bilinadi | `notFound()` |
| `roles.includes('admin')` ni hamma joyga tarqatish | O'zgartirish qiyin | `requirePermission` |
| `verifySession` ni `cache()` siz | Har chaqiruvda `/me` so'rovi | `cache()` |
| Layout tekshiruviga to'liq ishonish | Layout qayta render bo'lmasligi mumkin | Ma'lumot yonida tekshirish |
| `authInterrupts` yoqilmagan holda `forbidden()` | Ishlamaydi | `next.config` da yoqing |

## Amaliyot

1. `lib/dal.ts` yozing: `verifySession`, `requireSession`, `requireRole`. Hammasi `cache()` bilan.
2. Marshrut guruhlarini `(public)`, `(auth)`, `(app)`, `(admin)` ga bo'ling va har biriga mos layout tekshiruvini qo'ying.
3. Admin Server Action'ini oddiy foydalanuvchi sifatida `curl` bilan chaqirishga urinib ko'ring (Network panelidan Action ID va so'rov shaklini oling) — u rad etilishi kerak.
4. `forbidden()` va `app/forbidden.tsx` ni ishlating; `authInterrupts` ni o'chirib nima bo'lishini ko'ring.
5. Boshqa foydalanuvchining buyurtmasini `/orders/<id>` orqali ochishga urinib ko'ring — egalik tekshiruvini qo'shing.
6. Middleware'ni butunlay o'chiring va ilova hali ham himoyalanganligini tasdiqlang. Agar biror sahifa ochilib qolsa — himoya noto'g'ri joyda.

## Rasmiy hujjat

- Autentifikatsiya va avtorizatsiya: <https://nextjs.org/docs/app/guides/authentication>
- `forbidden()`: <https://nextjs.org/docs/app/api-reference/functions/forbidden>
- `unauthorized()`: <https://nextjs.org/docs/app/api-reference/functions/unauthorized>
- Middleware: <https://nextjs.org/docs/app/api-reference/file-conventions/middleware>
