# 23 — Optimistik yangilash

[← Oldingi: Formalar va validatsiya](22-formalar.md) · [Mundarija](README.md) · [Keyingi: Klient holati Next ichida →](24-klient-holati.md)

## Tushuncha

Optimistik yangilash — foydalanuvchiga natijani **server javobini kutmasdan** ko'rsatish. Server muvaffaqiyatli javob bersa — hech narsa o'zgarmaydi; xato bo'lsa — holat qaytariladi.

```
Oddiy:        bosildi → [kutish 400 ms] → natija
Optimistik:   bosildi → natija darhol → (fon'da server javobi)
```

Bu — ilovani "tez" his qilishning eng arzon usuli.

## Kod: `useOptimistic`

::: ts
```tsx
'use client'

import { useOptimistic } from 'react'
import { toggleLike } from './actions'

type Post = { id: number; likes: number; likedByMe: boolean }

export function LikeButton({ post }: { post: Post }) {
  const [optimisticPost, addOptimistic] = useOptimistic(
    post,
    (current, liked: boolean) => ({
      ...current,
      likedByMe: liked,
      likes: current.likes + (liked ? 1 : -1),
    }),
  )

  async function action() {
    const next = !optimisticPost.likedByMe

    addOptimistic(next)                     // darhol ekranda
    await toggleLike(post.id, next)         // server
  }

  return (
    <form action={action}>
      <button type="submit" aria-pressed={optimisticPost.likedByMe}>
        {optimisticPost.likedByMe ? '♥' : '♡'} {optimisticPost.likes}
      </button>
    </form>
  )
}
```
:::

::: js
```jsx
'use client'

import { useOptimistic } from 'react'
import { toggleLike } from './actions'

export function LikeButton({ post }) {
  const [optimisticPost, addOptimistic] = useOptimistic(post, (current, liked) => ({
    ...current,
    likedByMe: liked,
    likes: current.likes + (liked ? 1 : -1),
  }))

  async function action() {
    const next = !optimisticPost.likedByMe

    addOptimistic(next)
    await toggleLike(post.id, next)
  }

  return (
    <form action={action}>
      <button type="submit" aria-pressed={optimisticPost.likedByMe}>
        {optimisticPost.likedByMe ? '♥' : '♡'} {optimisticPost.likes}
      </button>
    </form>
  )
}
```
:::

`useOptimistic` ikki ish qiladi:

1. Action tugaguncha optimistik qiymatni ko'rsatadi;
2. Action tugagach, **haqiqiy props'ga qaytadi** — muvaffaqiyat bo'lsa, `revalidateTag` orqali kelgan yangi ma'lumot; xato bo'lsa — eski qiymat.

## Kod: ro'yxatga element qo'shish

::: ts
```tsx
'use client'

import { useOptimistic, useRef } from 'react'
import { addComment } from './actions'

type Comment = { id: string; text: string; author: string; pending?: boolean }

export function Comments({ comments, postId }: { comments: Comment[]; postId: number }) {
  const formRef = useRef<HTMLFormElement>(null)

  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current, text: string) => [
      ...current,
      { id: `temp-${Date.now()}`, text, author: 'Siz', pending: true },
    ],
  )

  async function action(formData: FormData) {
    const text = formData.get('text') as string

    if (!text.trim()) return

    formRef.current?.reset()                // formani darhol tozalash
    addOptimistic(text)

    await addComment(postId, text)
  }

  return (
    <>
      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>
            <strong>{c.author}:</strong> {c.text}
            {c.pending && <span aria-live="polite"> (yuborilmoqda…)</span>}
          </li>
        ))}
      </ul>

      <form ref={formRef} action={action}>
        <input name="text" required />
        <button type="submit">Yuborish</button>
      </form>
    </>
  )
}
```
:::

::: js
```jsx
'use client'

import { useOptimistic, useRef } from 'react'
import { addComment } from './actions'

export function Comments({ comments, postId }) {
  const formRef = useRef(null)

  const [optimisticComments, addOptimistic] = useOptimistic(comments, (current, text) => [
    ...current,
    { id: `temp-${Date.now()}`, text, author: 'Siz', pending: true },
  ])

  async function action(formData) {
    const text = formData.get('text')

    if (!text.trim()) return

    formRef.current?.reset()
    addOptimistic(text)

    await addComment(postId, text)
  }

  return (
    <>
      <ul>
        {optimisticComments.map((c) => (
          <li key={c.id} style={{ opacity: c.pending ? 0.5 : 1 }}>
            <strong>{c.author}:</strong> {c.text}
          </li>
        ))}
      </ul>

      <form ref={formRef} action={action}>
        <input name="text" required />
        <button type="submit">Yuborish</button>
      </form>
    </>
  )
}
```
:::

Uch detal: **vaqtinchalik ID**, **`pending` belgisi** (shaffoflik bilan), **formani darhol tozalash**.

## Kod: xatoni ko'rsatish

`useOptimistic` xato bo'lganda holatni qaytaradi, lekin **foydalanuvchiga xabar bermaydi**. Buni o'zingiz qilasiz:

::: ts
```tsx
'use client'

import { useOptimistic, useState } from 'react'
import { toast } from '@/components/toast'

export function LikeButton({ post }: { post: Post }) {
  const [optimisticPost, addOptimistic] = useOptimistic(post, likeReducer)

  async function action() {
    const next = !optimisticPost.likedByMe

    addOptimistic(next)

    const result = await toggleLike(post.id, next)

    if (!result.success) {
      toast.error('Saqlab bo\'lmadi')        // holat avtomatik qaytadi
    }
  }

  return <form action={action}>{/* ... */}</form>
}
```
:::

::: js
```jsx
'use client'

export function LikeButton({ post }) {
  const [optimisticPost, addOptimistic] = useOptimistic(post, likeReducer)

  async function action() {
    const next = !optimisticPost.likedByMe

    addOptimistic(next)

    const result = await toggleLike(post.id, next)

    if (!result.success) toast.error('Saqlab bo\'lmadi')
  }

  return <form action={action}>{/* ... */}</form>
}
```
:::

## Kod: savat misolida

::: ts
```tsx
'use client'

import { useOptimistic } from 'react'
import { updateCartQty } from './actions'

type CartLine = { id: number; title: string; price: number; qty: number }

export function CartList({ lines }: { lines: CartLine[] }) {
  const [optimisticLines, updateOptimistic] = useOptimistic(
    lines,
    (current, update: { id: number; qty: number }) =>
      update.qty <= 0
        ? current.filter((l) => l.id !== update.id)
        : current.map((l) => (l.id === update.id ? { ...l, qty: update.qty } : l)),
  )

  const total = optimisticLines.reduce((sum, l) => sum + l.price * l.qty, 0)

  return (
    <>
      <ul>
        {optimisticLines.map((line) => (
          <li key={line.id}>
            {line.title}

            <form
              action={async (formData) => {
                const qty = Number(formData.get('qty'))

                updateOptimistic({ id: line.id, qty })
                await updateCartQty(line.id, qty)
              }}
            >
              <input name="qty" type="number" defaultValue={line.qty} min={0} />
              <button type="submit">Yangilash</button>
            </form>
          </li>
        ))}
      </ul>

      <p>Jami: {total.toLocaleString('uz-UZ')} so'm</p>
    </>
  )
}
```
:::

::: js
```jsx
'use client'

import { useOptimistic } from 'react'
import { updateCartQty } from './actions'

export function CartList({ lines }) {
  const [optimisticLines, updateOptimistic] = useOptimistic(lines, (current, update) =>
    update.qty <= 0
      ? current.filter((l) => l.id !== update.id)
      : current.map((l) => (l.id === update.id ? { ...l, qty: update.qty } : l)),
  )

  const total = optimisticLines.reduce((sum, l) => sum + l.price * l.qty, 0)

  return (
    <>
      <ul>{/* ... */}</ul>
      <p>Jami: {total.toLocaleString('uz-UZ')} so'm</p>
    </>
  )
}
```
:::

E'tibor bering: **jami summa ham optimistik ro'yxatdan hisoblanadi** — ya'ni u ham darhol yangilanadi.

## Muhandislik nuqtai nazari: qachon optimistik yangilash

| Amal | Optimistik | Sabab |
| --- | --- | --- |
| Like, bookmark, follow | ✅ Ha | Deyarli har doim muvaffaqiyatli |
| Ro'yxatga element qo'shish | ✅ Ha | Natija oldindan ma'lum |
| Miqdorni o'zgartirish | ✅ Ha | Oddiy operatsiya |
| Belgilash (done/undone) | ✅ Ha | — |
| O'chirish | ⚖️ Ehtiyot bilan | Qaytarilsa chalkash |
| To'lov | ❌ Yo'q | Natija noaniq va muhim |
| Ro'yxatdan o'tish | ❌ Yo'q | Server tekshiruvi kerak |
| Fayl yuklash | ❌ Yo'q | Uzoq va xato ehtimoli yuqori |

Qoida: **natija deyarli har doim oldindan ma'lum bo'lsa** — optimistik. Aks holda oddiy `pending` holati.

## Muhandislik nuqtai nazari: ID muammosi

Optimistik element **haqiqiy ID ga ega emas**. Bu ikki muammo tug'diradi:

```tsx
// 1. React key
{optimisticComments.map((c) => (
  <li key={c.id}>          {/* temp-1234567890 */}
))}

// 2. Element bilan ishlash
<button onClick={() => deleteComment(c.id)}>   {/* temp ID serverda yo'q! */}
```

Yechim: optimistik elementlarda amallarni **o'chirib qo'ying**:

```tsx
<li key={c.id}>
  {c.text}
  {!c.pending && <DeleteButton id={c.id} />}
</li>
```

## Muhandislik nuqtai nazari: `useOptimistic` va `revalidateTag`

Oqim shunday ishlaydi:

```
1. addOptimistic(...)        → UI darhol yangilanadi
2. await serverAction()      → server ishlaydi
3. revalidateTag(...)        → server komponent qayta render qilinadi
4. Yangi props keladi        → optimistik holat tashlanadi, haqiqiy ma'lumot ko'rinadi
```

Agar 3-qadam bo'lmasa (`revalidateTag` chaqirilmasa), optimistik holat **eski props'ga qaytadi** va o'zgarish yo'qolganday ko'rinadi — bu eng ko'p uchraydigan xato.

Shuning uchun: **har optimistik action'da invalidatsiya bo'lishi shart** (19-bob).

## Muhandislik nuqtai nazari: erishimlilik

Optimistik o'zgarishlar skrinrider foydalanuvchisiga ham yetkazilishi kerak:

```tsx
<span aria-live="polite" className="sr-only">
  {pending ? 'Yuborilmoqda' : 'Yuborildi'}
</span>

<button aria-pressed={optimisticPost.likedByMe} aria-busy={pending}>
```

Vizual `opacity: 0.5` — ko'rmaydigan foydalanuvchi uchun ma'no bermaydi (44-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Action'da `revalidateTag` yo'q | Optimistik holat eski qiymatga qaytadi | Invalidatsiya qo'shing |
| Xato haqida xabar bermaslik | Foydalanuvchi o'zgarish saqlanmaganini bilmaydi | `toast` yoki xabar |
| Optimistik elementga amal tugmalari | Vaqtinchalik ID serverda yo'q | `pending` bo'lsa yashiring |
| To'lov yoki muhim amalni optimistik qilish | Noto'g'ri tasavvur | Oddiy `pending` |
| `useOptimistic` ni server komponentda | U klient hooki | `'use client'` |
| Faqat vizual belgi (`opacity`) | Skrinrider bilmaydi | `aria-live`, `aria-busy` |
| Optimistik holatni `useState` bilan qo'lda boshqarish | Qaytarish mantiqi murakkab | `useOptimistic` |

## Amaliyot

1. Like tugmasini `useOptimistic` bilan yozing; server javobiga 2 soniya kechikish qo'shib, darhol yangilanishini ko'ring.
2. Action'dan `revalidateTag` ni olib tashlang va optimistik holat qaytib ketishini kuzating.
3. Izohlar ro'yxatiga optimistik qo'shishni amalga oshiring: vaqtinchalik ID, `pending` belgisi, formani tozalash.
4. Server'da ataylab xato qildiring va holat qaytishini hamda `toast` chiqishini tasdiqlang.
5. `aria-live` qo'shing va VoiceOver bilan tinglang.
6. Savat miqdorini optimistik yangilang va jami summa darhol o'zgarishini ta'minlang.

## Rasmiy hujjat

- `useOptimistic`: <https://react.dev/reference/react/useOptimistic>
- Ma'lumotni yangilash: <https://nextjs.org/docs/app/getting-started/updating-data>
