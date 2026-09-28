# 22 — Formalar va validatsiya

[← Oldingi: Server Actions](21-server-actions.md) · [Mundarija](README.md) · [Keyingi: Optimistik yangilash →](23-optimistik.md)

## Tushuncha

Next'da forma yozishning uch darajasi bor:

| Daraja | Vosita | Qachon |
| --- | --- | --- |
| 1 | `<form action={serverAction}>` | Oddiy forma, JS'siz ham ishlaydi |
| 2 | `useActionState` + zod | Xato ko'rsatish kerak bo'lganda |
| 3 | React Hook Form + Server Action | Murakkab, dinamik formalar |

Birinchi ikkisi — 80% holat uchun yetarli.

## Kod: 1-daraja — eng oddiy

::: ts
```tsx
// app/contact/page.tsx
import { sendMessage } from './actions'

export default function ContactPage() {
  return (
    <form action={sendMessage}>
      <input name="name" required minLength={2} />
      <input name="email" type="email" required />
      <textarea name="message" required minLength={10} />

      <button type="submit">Yuborish</button>
    </form>
  )
}
```
:::

::: js
```jsx
import { sendMessage } from './actions'

export default function ContactPage() {
  return (
    <form action={sendMessage}>
      <input name="name" required minLength={2} />
      <input name="email" type="email" required />
      <textarea name="message" required minLength={10} />

      <button type="submit">Yuborish</button>
    </form>
  )
}
```
:::

Sahifa **server komponent** bo'lib qoladi — `'use client'` kerak emas. Brauzer validatsiyasi (`required`, `type="email"`) bepul keladi.

## Kod: 2-daraja — `useActionState` bilan to'liq forma

::: ts
```ts
// app/products/actions.ts
'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'

const schema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
  description: z.string().max(2000).optional(),
})

export type FormState = {
  errors?: Partial<Record<keyof z.infer<typeof schema>, string[]>>
  message?: string
  values?: Record<string, string>          // xato holatida qiymatlarni saqlash
  success?: boolean
}

export async function createProduct(prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser()

  if (!user?.roles.includes('admin')) {
    return { message: 'Ruxsat yo\'q' }
  }

  const raw = Object.fromEntries(formData) as Record<string, string>
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: raw,                          // foydalanuvchi yozganini qaytarish
    }
  }

  try {
    await db.product.create({ data: { ...parsed.data, authorId: user.id } })
  } catch (error) {
    return { message: 'Saqlab bo\'lmadi', values: raw }
  }

  revalidateTag('products')

  return { success: true }
}
```
:::

::: js
```js
// app/products/actions.js
'use server'

import { z } from 'zod'
import { revalidateTag } from 'next/cache'

const schema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
  description: z.string().max(2000).optional(),
})

export async function createProduct(prev, formData) {
  const user = await getCurrentUser()

  if (!user?.roles.includes('admin')) return { message: 'Ruxsat yo\'q' }

  const raw = Object.fromEntries(formData)
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: raw }
  }

  await db.product.create({ data: { ...parsed.data, authorId: user.id } })

  revalidateTag('products')

  return { success: true }
}
```
:::

::: ts
```tsx
// app/products/ProductForm.tsx
'use client'

import { useActionState } from 'react'
import { createProduct, type FormState } from './actions'
import { Field } from '@/components/Field'
import { SubmitButton } from '@/components/SubmitButton'

const initial: FormState = {}

export function ProductForm() {
  const [state, formAction] = useActionState(createProduct, initial)

  return (
    <form action={formAction} noValidate>
      <Field label="Nomi" error={state.errors?.title?.[0]}>
        {(props) => <input {...props} name="title" defaultValue={state.values?.title} />}
      </Field>

      <Field label="Narx" error={state.errors?.price?.[0]}>
        {(props) => <input {...props} name="price" type="number" defaultValue={state.values?.price} />}
      </Field>

      {state.message && <p role="alert" className="error">{state.message}</p>}
      {state.success && <p role="status">Saqlandi</p>}

      <SubmitButton>Saqlash</SubmitButton>
    </form>
  )
}
```
:::

::: js
```jsx
'use client'

import { useActionState } from 'react'
import { createProduct } from './actions'

export function ProductForm() {
  const [state, formAction] = useActionState(createProduct, {})

  return (
    <form action={formAction} noValidate>
      <Field label="Nomi" error={state.errors?.title?.[0]}>
        {(props) => <input {...props} name="title" defaultValue={state.values?.title} />}
      </Field>

      {state.message && <p role="alert">{state.message}</p>}

      <SubmitButton>Saqlash</SubmitButton>
    </form>
  )
}
```
:::

**Muhim detal:** xato holatida `values` ni qaytaring — aks holda foydalanuvchi hamma narsani qaytadan yozadi.

## Kod: `SubmitButton` va `useFormStatus`

::: ts
```tsx
// components/SubmitButton.tsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Saqlanmoqda…' : children}
    </button>
  )
}
```
:::

::: js
```jsx
'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ children }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Saqlanmoqda…' : children}
    </button>
  )
}
```
:::

`useFormStatus` **forma bolasida** ishlaydi — formani render qiladigan komponentda emas (React qo'llanmasi, 25-bob).

## Kod: `Field` komponenti (erishimlilik bilan)

::: ts
```tsx
'use client'

import { useId } from 'react'

type FieldProps = {
  label: string
  error?: string
  hint?: string
  children: (props: {
    id: string
    'aria-invalid'?: true
    'aria-describedby'?: string
  }) => React.ReactNode
}

export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={error ? 'field field-error' : 'field'}>
      <label htmlFor={id}>{label}</label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {error ? (
        <p id={errorId} role="alert" className="field-message">{error}</p>
      ) : hint ? (
        <p id={hintId} className="field-hint">{hint}</p>
      ) : null}
    </div>
  )
}
```
:::

::: js
```jsx
'use client'

import { useId } from 'react'

export function Field({ label, error, hint, children }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={error ? 'field field-error' : 'field'}>
      <label htmlFor={id}>{label}</label>

      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': error ? errorId : hint ? hintId : undefined,
      })}

      {error ? <p id={errorId} role="alert">{error}</p> : hint ? <p id={hintId}>{hint}</p> : null}
    </div>
  )
}
```
:::

## Kod: 3-daraja — React Hook Form + Server Action

Murakkab formalar uchun (dinamik qatorlar, har harfda validatsiya):

::: ts
```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { createProduct } from './actions'
import { productSchema, type ProductInput } from './schemas'

export function ProductForm() {
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    mode: 'onTouched',
  })

  function onSubmit(values: ProductInput) {
    startTransition(async () => {
      const result = await createProduct(values)         // to'g'ridan-to'g'ri chaqiruv

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          setError(field as keyof ProductInput, { message: messages[0] })
        }
      }
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Nomi" error={errors.title?.message}>
        {(props) => <input {...props} {...register('title')} />}
      </Field>

      <button type="submit" disabled={isPending}>Saqlash</button>
    </form>
  )
}
```
:::

::: js
```jsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTransition } from 'react'
import { createProduct } from './actions'
import { productSchema } from './schemas'

export function ProductForm() {
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
    mode: 'onTouched',
  })

  function onSubmit(values) {
    startTransition(async () => {
      const result = await createProduct(values)

      if (result?.errors) {
        for (const [field, messages] of Object.entries(result.errors)) {
          setError(field, { message: messages[0] })
        }
      }
    })
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Nomi" error={errors.title?.message}>
        {(props) => <input {...props} {...register('title')} />}
      </Field>

      <button type="submit" disabled={isPending}>Saqlash</button>
    </form>
  )
}
```
:::

Diqqat: bu yondashuvda **progressive enhancement yo'qoladi** (JS'siz ishlamaydi), lekin har harfda validatsiya va dinamik maydonlar mumkin bo'ladi.

## Kod: bir sxema — ikki tomonda

::: ts
```ts
// app/products/schemas.ts — 'use server' YO'Q, oddiy modul
import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
})

export type ProductInput = z.infer<typeof productSchema>
```
:::

::: js
```js
// app/products/schemas.js
import { z } from 'zod'

export const productSchema = z.object({
  title: z.string().min(3, 'Kamida 3 belgi'),
  price: z.coerce.number().int().positive('Narx musbat bo\'lishi kerak'),
})
```
:::

Bitta sxema uch joyda ishlatiladi:

1. Klientda — RHF resolver (tez javob);
2. Serverda — action validatsiyasi (haqiqiy himoya);
3. Tiplar manbai — `z.infer`.

Bu — 05-bobdagi "sxemadan tip" naqshining amaliy qo'llanilishi.

## Kod: fayl yuklash

::: ts
```tsx
// Forma
<form action={uploadAvatar} encType="multipart/form-data">
  <input type="file" name="avatar" accept="image/*" required />
  <SubmitButton>Yuklash</SubmitButton>
</form>
```

```ts
'use server'

export async function uploadAvatar(formData: FormData) {
  const user = await getCurrentUser()

  if (!user) return { message: 'Avtorizatsiya kerak' }

  const file = formData.get('avatar')

  if (!(file instanceof File)) return { message: 'Fayl yo\'q' }
  if (file.size > 2 * 1024 * 1024) return { message: 'Fayl 2 MB dan katta' }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { message: 'Faqat rasm' }
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToStorage(buffer, `avatars/${user.id}`, file.type)

  await db.user.update({ where: { id: user.id }, data: { avatarUrl: url } })

  revalidateTag(`user-${user.id}`)

  return { success: true }
}
```
:::

::: js
```js
'use server'

export async function uploadAvatar(formData) {
  const user = await getCurrentUser()

  if (!user) return { message: 'Avtorizatsiya kerak' }

  const file = formData.get('avatar')

  if (!file || typeof file === 'string') return { message: 'Fayl yo\'q' }
  if (file.size > 2 * 1024 * 1024) return { message: 'Fayl 2 MB dan katta' }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToStorage(buffer, `avatars/${user.id}`, file.type)

  await db.user.update({ where: { id: user.id }, data: { avatarUrl: url } })

  return { success: true }
}
```
:::

Server Action orqali fayl yuklash chegarasi — Next'ning tana hajmi limiti (standart 1 MB, `serverActions.bodySizeLimit` bilan oshiriladi). Katta fayllar uchun presigned URL (34-bob).

## Muhandislik nuqtai nazari: qaysi darajani tanlash

| Forma | Daraja |
| --- | --- |
| Aloqa, obuna, izoh (1–3 maydon) | 1 (oddiy `action`) |
| Login, ro'yxatdan o'tish, mahsulot yaratish | 2 (`useActionState`) |
| Ko'p qadamli, dinamik qatorlar, murakkab bog'liqliklar | 3 (RHF) |
| Har harfda hisob (narx kalkulyatori) | 3 yoki klient holati |

Boshlang'ich tanlov — **2-daraja**: u progressive enhancement'ni saqlaydi va xatolarni yaxshi ko'rsatadi.

## Muhandislik nuqtai nazari: klient va server validatsiyasi

```
Klient validatsiyasi  →  UX (tez javob)
Server validatsiyasi  →  HIMOYA (majburiy)
```

Klient validatsiyasini chetlab o'tish trivial: DevTools'da `novalidate` qo'shish yoki to'g'ridan-to'g'ri POST yuborish. Shuning uchun **server validatsiyasi hech qachon ixtiyoriy emas** (45-bob).

Xabarlar bir xil bo'lishi uchun bitta zod sxemasidan foydalaning.

## Muhandislik nuqtai nazari: forma UX qoidalari

| Qoida | Nega |
| --- | --- |
| Xato maydon yonida | Foydalanuvchi qayerga qarashni biladi |
| Xato faqat `blur`/`submit` dan keyin | Yozayotganda bosim bo'lmasin |
| Kiritilgan qiymatlarni saqlash | Qaytadan yozish — eng ko'p uchraydigan shikoyat |
| Yuborish tugmasini bloklash | Ikki marta yuborishning oldini oladi |
| Birinchi xato maydoniga fokus | Uzun formada topish oson |
| `aria-invalid` + `aria-describedby` | Skrinrider uchun (44-bob) |
| Muvaffaqiyat haqida xabar | Foydalanuvchi natijani bilsin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Xato holatida `values` qaytarmaslik | Foydalanuvchi qaytadan yozadi | `values` ni state'ga qo'shing |
| `noValidate` ni unutish | Brauzer xabarlari sizning validatsiyangiz bilan to'qnashadi | `<form noValidate>` |
| `useFormStatus` ni forma komponentida chaqirish | Har doim `false` | Bola komponentda |
| Faqat klient validatsiyasi | Chetlab o'tiladi | Server'da ham |
| Har forma uchun alohida sxema | Takror, mos kelmaslik | Bitta zod sxemasi |
| `aria-invalid` yo'q | Skrinrider xatoni bilmaydi | `Field` komponenti |
| Katta faylni Server Action bilan | Tana hajmi limiti | Presigned URL (34-bob) |
| Tugmani bloklamaslik | Ikki marta yuboriladi | `useFormStatus` |

## Amaliyot

1. Aloqa formasini 1-daraja bilan yozing (server komponent, `'use client'` siz) va JS o'chirilgan holda sinab ko'ring.
2. Mahsulot formasini 2-daraja bilan yozing: zod, xatolar, `values` saqlash, `SubmitButton`.
3. `Field` komponentini yozing va VoiceOver/NVDA bilan xato o'qilishini tekshiring.
4. Bitta sxemani klient (RHF) va server (action) da ishlating.
5. `values` qaytarishni olib tashlang va xato holatida forma tozalanishini ko'ring.
6. Fayl yuklash action'ini yozing va 2 MB dan katta fayl bilan sinang.

## Rasmiy hujjat

- Formalar: <https://nextjs.org/docs/app/guides/forms>
- `useActionState`: <https://react.dev/reference/react/useActionState>
- `useFormStatus`: <https://react.dev/reference/react-dom/hooks/useFormStatus>
- React Hook Form: <https://react-hook-form.com>
