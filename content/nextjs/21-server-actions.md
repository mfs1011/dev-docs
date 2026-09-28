# 21 — Server Actions

[← Oldingi: Streaming va Suspense](20-streaming-suspense.md) · [Mundarija](README.md) · [Keyingi: Formalar va validatsiya →](22-formalar.md)

## Tushuncha

Server Action — **klientdan chaqiriladigan server funksiyasi**. U `'use server'` direktivasi bilan belgilanadi va Next uni avtomatik HTTP endpoint'ga aylantiradi.

::: ts
```ts
// app/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function createProduct(formData: FormData) {
  const title = formData.get('title') as string

  await db.product.create({ data: { title } })

  revalidateTag('products')
}
```
:::

::: js
```js
// app/actions.js
'use server'

import { db } from '@/lib/db'
import { revalidateTag } from 'next/cache'

export async function createProduct(formData) {
  const title = formData.get('title')

  await db.product.create({ data: { title } })

  revalidateTag('products')
}
```
:::

```tsx
// Ishlatish — formaga to'g'ridan-to'g'ri
<form action={createProduct}>
  <input name="title" required />
  <button type="submit">Yaratish</button>
</form>
```

API endpoint yozilmadi, `fetch` chaqirilmadi, JSON seriyalanmadi — Next hammasini o'zi qildi.

## Kod: `'use server'` ikki shakli

::: ts
```ts
// 1. Fayl darajasida — barcha eksportlar action bo'ladi
'use server'

export async function createProduct(formData: FormData) { /* ... */ }
export async function deleteProduct(id: number) { /* ... */ }
```
:::

::: ts
```tsx
// 2. Funksiya ichida — server komponent ichida
export default function Page() {
  async function createProduct(formData: FormData) {
    'use server'

    await db.product.create({ data: { title: formData.get('title') as string } })
    revalidateTag('products')
  }

  return <form action={createProduct}>…</form>
}
```
:::

::: js
```jsx
export default function Page() {
  async function createProduct(formData) {
    'use server'

    await db.product.create({ data: { title: formData.get('title') } })
    revalidateTag('products')
  }

  return <form action={createProduct}>…</form>
}
```
:::

Birinchi shakl afzal: action'lar alohida faylda yashaydi, test qilinadi va qayta ishlatiladi.

**Muhim:** `'use server'` — `'use client'` ning teskarisi emas. U "bu funksiya serverda ishlaydi va klientdan chaqirilishi mumkin" degani.

## Kod: validatsiya va xato qaytarish

::: ts
```ts
'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'

const schema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
  categoryId: z.coerce.number().int(),
})

export type ActionState = {
  errors?: Record<string, string[]>
  message?: string
  success?: boolean
}

export async function createProduct(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1. Avtorizatsiya — HAR ACTION'DA
  const user = await getCurrentUser()

  if (!user) return { message: 'Avtorizatsiya kerak' }
  if (!user.roles.includes('admin')) return { message: 'Ruxsat yo\'q' }

  // 2. Validatsiya
  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // 3. Biznes mantiq
  try {
    await db.product.create({ data: { ...parsed.data, authorId: user.id } })
  } catch (error) {
    return { message: 'Saqlab bo\'lmadi' }
  }

  // 4. Kesh invalidatsiyasi
  revalidateTag('products')

  return { success: true }
}
```
:::

::: js
```js
'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'

const schema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
})

export async function createProduct(prevState, formData) {
  const user = await getCurrentUser()

  if (!user) return { message: 'Avtorizatsiya kerak' }
  if (!user.roles.includes('admin')) return { message: 'Ruxsat yo\'q' }

  const parsed = schema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  try {
    await db.product.create({ data: { ...parsed.data, authorId: user.id } })
  } catch {
    return { message: 'Saqlab bo\'lmadi' }
  }

  revalidateTag('products')

  return { success: true }
}
```
:::

**To'rt qadam tartibi majburiy:** avtorizatsiya → validatsiya → mantiq → invalidatsiya.

## Kod: `useActionState` bilan

::: ts
```tsx
'use client'

import { useActionState } from 'react'
import { createProduct, type ActionState } from '@/app/actions'

const initial: ActionState = {}

export function ProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, initial)

  return (
    <form action={formAction}>
      <label>
        Nomi
        <input name="title" required aria-invalid={!!state.errors?.title} />
      </label>
      {state.errors?.title && <p role="alert">{state.errors.title[0]}</p>}

      <label>
        Narx
        <input name="price" type="number" required />
      </label>
      {state.errors?.price && <p role="alert">{state.errors.price[0]}</p>}

      {state.message && <p role="alert">{state.message}</p>}
      {state.success && <p>Saqlandi</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saqlanmoqda…' : 'Saqlash'}
      </button>
    </form>
  )
}
```
:::

::: js
```jsx
'use client'

import { useActionState } from 'react'
import { createProduct } from '@/app/actions'

export function ProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, {})

  return (
    <form action={formAction}>
      <input name="title" required aria-invalid={!!state.errors?.title} />
      {state.errors?.title && <p role="alert">{state.errors.title[0]}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Saqlanmoqda…' : 'Saqlash'}
      </button>
    </form>
  )
}
```
:::

Batafsil forma naqshlari — 22-bobda (React qo'llanmasining 25-bobi ham shu mavzuda).

## Kod: argument bilan chaqirish

::: ts
```tsx
// Server
'use server'

export async function deleteProduct(id: number) {
  await db.product.delete({ where: { id } })

  revalidateTag('products')
}

// Klient — bind bilan
<form action={deleteProduct.bind(null, product.id)}>
  <button type="submit">O'chirish</button>
</form>

// Yoki yashirin maydon bilan
<form action={deleteProductFromForm}>
  <input type="hidden" name="id" value={product.id} />
  <button type="submit">O'chirish</button>
</form>
```
:::

::: js
```jsx
'use server'

export async function deleteProduct(id) {
  await db.product.delete({ where: { id } })

  revalidateTag('products')
}

<form action={deleteProduct.bind(null, product.id)}>
  <button type="submit">O'chirish</button>
</form>
```
:::

**Xavfsizlik:** `bind` bilan uzatilgan argument klientda **ko'rinadi va o'zgartirilishi mumkin** — u yashirin maydon kabi. Shuning uchun action ichida **har doim tekshiring**: bu foydalanuvchi shu mahsulotni o'chira oladimi?

## Kod: formasiz chaqirish

::: ts
```tsx
'use client'

import { useTransition } from 'react'
import { toggleFavorite } from '@/app/actions'

export function FavoriteButton({ productId, initial }: { productId: number; initial: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initial)

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorite(productId)

      if (result.success) setIsFavorite(result.isFavorite)
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending} aria-pressed={isFavorite}>
      {isFavorite ? '★' : '☆'}
    </button>
  )
}
```
:::

::: js
```jsx
'use client'

import { useState, useTransition } from 'react'
import { toggleFavorite } from '@/app/actions'

export function FavoriteButton({ productId, initial }) {
  const [isPending, startTransition] = useTransition()
  const [isFavorite, setIsFavorite] = useState(initial)

  function handleClick() {
    startTransition(async () => {
      const result = await toggleFavorite(productId)

      if (result.success) setIsFavorite(result.isFavorite)
    })
  }

  return (
    <button onClick={handleClick} disabled={isPending} aria-pressed={isFavorite}>
      {isFavorite ? '★' : '☆'}
    </button>
  )
}
```
:::

`startTransition` ichida chaqirish muhim: usiz UI bloklanadi va `isPending` ishlamaydi.

## Kod: yo'naltirish va cookie

::: ts
```ts
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(prevState: ActionState, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await authenticate(parsed.data)

  if (!result.ok) return { message: 'Login yoki parol noto\'g\'ri' }

  const cookieStore = await cookies()

  cookieStore.set('session', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/dashboard')                  // try/catch DAN TASHQARIDA
}
```
:::

::: js
```js
'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(prevState, formData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const result = await authenticate(parsed.data)

  if (!result.ok) return { message: 'Login yoki parol noto\'g\'ri' }

  const cookieStore = await cookies()

  cookieStore.set('session', result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/dashboard')
}
```
:::

`redirect()` **exception tashlaydi** — `try/catch` ichida bo'lsa ushlanib qoladi (07-bob). Cookie'lar faqat Server Action va Route Handler'da yoziladi (server komponentda o'qish mumkin, yozish emas).

## Kod: action'ni qayta ishlatiladigan qilish

::: ts
```ts
// lib/action-wrapper.ts
import 'server-only'

export function authedAction<TInput, TOutput>(
  schema: z.ZodType<TInput>,
  handler: (input: TInput, user: User) => Promise<TOutput>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<ActionState> => {
    const user = await getCurrentUser()

    if (!user) return { message: 'Avtorizatsiya kerak' }

    const parsed = schema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

    try {
      await handler(parsed.data, user)

      return { success: true }
    } catch (error) {
      if (error instanceof AppError) return { message: error.message }

      throw error
    }
  }
}

// Ishlatish
export const createProduct = authedAction(productSchema, async (data, user) => {
  await db.product.create({ data: { ...data, authorId: user.id } })

  revalidateTag('products')
})
```
:::

::: js
```js
// lib/action-wrapper.js
import 'server-only'

export function authedAction(schema, handler) {
  return async (prevState, formData) => {
    const user = await getCurrentUser()

    if (!user) return { message: 'Avtorizatsiya kerak' }

    const parsed = schema.safeParse(Object.fromEntries(formData))

    if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

    try {
      await handler(parsed.data, user)

      return { success: true }
    } catch (error) {
      if (error instanceof AppError) return { message: error.message }

      throw error
    }
  }
}
```
:::

Bu naqsh takroriy kodni yo'q qiladi. Tayyor yechimlar ham bor: `next-safe-action`, `zsa`.

## Muhandislik nuqtai nazari: xavfsizlik

Server Action — **ommaviy HTTP endpoint**. Uni faqat sizning UI'ingiz chaqiradi deb o'ylash xato: har kim `POST` so'rov yuborishi mumkin.

Shuning uchun har action'da:

| Tekshiruv | Nega |
| --- | --- |
| **Autentifikatsiya** | Kim chaqirayapti? |
| **Avtorizatsiya** | Unga ruxsat bormi? (aynan shu resursga) |
| **Validatsiya** | Ma'lumot to'g'rimi? |
| **Rate limiting** | Suiiste'mol qilinmayaptimi? |

```ts
// ✗ XAVFLI: har kim istalgan mahsulotni o'chira oladi
export async function deleteProduct(id: number) {
  await db.product.delete({ where: { id } })
}

// ✓
export async function deleteProduct(id: number) {
  const user = await getCurrentUser()

  if (!user) return { message: 'Avtorizatsiya kerak' }

  const product = await db.product.findUnique({ where: { id } })

  if (!product) return { message: 'Topilmadi' }
  if (product.authorId !== user.id && !user.roles.includes('admin')) {
    return { message: 'Ruxsat yo\'q' }
  }

  await db.product.delete({ where: { id } })
  revalidateTag('products')
}
```

Next CSRF'dan `Origin` sarlavhasini tekshirish orqali himoyalaydi, lekin **avtorizatsiya sizning zimmangizda** (45-bob).

## Muhandislik nuqtai nazari: Server Action yoki Route Handler

| Vaziyat | Tanlov |
| --- | --- |
| Ilova ichidagi forma | ✅ Server Action |
| Tugma bilan mutatsiya | ✅ Server Action |
| Mobil ilova chaqiradi | ✅ Route Handler (15-bob) |
| Webhook | ✅ Route Handler |
| Ommaviy API | ✅ Route Handler |
| Fayl yuklash | Ikkalasi ham (34-bob) |
| GET so'rov (ma'lumot olish) | ❌ Ikkalasi ham emas — server komponent |

**Muhim:** Server Action'lar **faqat POST** bo'ladi. Ma'lumot o'qish uchun ularni ishlatmang — server komponentda `await` qiling (17-bob).

## Muhandislik nuqtai nazari: progressive enhancement

Server Action'ning kam baholanadigan afzalligi: **JavaScript o'chirilgan bo'lsa ham forma ishlaydi**.

```tsx
{/* JS'siz: brauzer formani POST qiladi, sahifa qayta yuklanadi — lekin ISHLAYDI */}
<form action={createProduct}>
  <input name="title" />
  <button type="submit">Yaratish</button>
</form>
```

Shart: forma **uncontrolled** bo'lsin (`useState` bilan boshqarilmasin) va action `FormData` bilan ishlasin.

Bu sekin tarmoqda ham foydali: JS hali yuklanmagan bo'lsa ham foydalanuvchi formani yubora oladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Action'da avtorizatsiyani unutish | Ochiq endpoint | Har action'da tekshiring |
| `bind` argumentiga ishonish | Klientda o'zgartiriladi | Serverda qayta tekshiring |
| Validatsiyasiz `formData` ni bazaga | Har qanday ma'lumot kiradi | zod |
| `redirect()` ni `try/catch` ichida | Ushlanib qoladi | Tashqarida |
| Invalidatsiyani unutish | UI eski ma'lumot ko'rsatadi | `revalidateTag` (19-bob) |
| Action'ni GET uchun ishlatish | U faqat POST | Server komponent |
| `startTransition` siz chaqirish | UI bloklanadi, `isPending` yo'q | `useTransition` |
| Xato obyektini to'g'ridan-to'g'ri qaytarish | Seriyalanmaydi yoki ma'lumot sizadi | Oddiy obyekt qaytaring |

## Amaliyot

1. `createProduct` action'ini yozing: avtorizatsiya, zod validatsiyasi, invalidatsiya bilan.
2. Uni `useActionState` bilan formaga ulang; xatolarni maydonlar yonida ko'rsating.
3. `deleteProduct` ni `bind` bilan yozing va DevTools'da ID ni o'zgartirib yuborib ko'ring — serverdagi tekshiruv ishlashini tasdiqlang.
4. JavaScript'ni o'chirib formani yuborib ko'ring (progressive enhancement).
5. `authedAction` o'ramini yozing va uni ikki action'da ishlating.
6. `redirect()` ni `try/catch` ichiga solib, nima bo'lishini kuzating.

## Rasmiy hujjat

- Server Actions: <https://nextjs.org/docs/app/getting-started/updating-data>
- `'use server'`: <https://nextjs.org/docs/app/api-reference/directives/use-server>
- Xavfsizlik: <https://nextjs.org/blog/security-nextjs-server-components-actions>
