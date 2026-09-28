# 25 — Actions: `useActionState`, `useFormStatus`, `useOptimistic`

[← Oldingi: `use()` va Suspense](24-use-va-suspense.md) · [Mundarija](README.md) · [Keyingi: O'z hookingiz →](26-custom-hooklar.md)

## Tushuncha

React 19 da **Action** — `<form>` ga to'g'ridan-to'g'ri beriladigan async funksiya:

::: ts
```tsx
function SearchForm() {
  async function search(formData: FormData) {
    const query = formData.get('query') as string

    await doSearch(query)
  }

  return (
    <form action={search}>
      <input name="query" />
      <button type="submit">Qidirish</button>
    </form>
  )
}
```
:::

::: js
```jsx
function SearchForm() {
  async function search(formData) {
    const query = formData.get('query')

    await doSearch(query)
  }

  return (
    <form action={search}>
      <input name="query" />
      <button type="submit">Qidirish</button>
    </form>
  )
}
```
:::

React `action` ni ko'rsa: `preventDefault` ni o'zi chaqiradi, funksiyani transition ichida ishga tushiradi va tugagach formani tozalaydi.

Uchta yordamchi hook shu atrofda ishlaydi: `useActionState`, `useFormStatus`, `useOptimistic`.

## Kod: `useActionState`

Forma holati (natija, xato, pending) — bitta hookda:

::: ts
```tsx
type State = { error?: string; success?: boolean }

async function loginAction(prevState: State, formData: FormData): Promise<State> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    await api.post('/login', { email, password })

    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {})

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />

      {state.error && <p role="alert">{state.error}</p>}

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
async function loginAction(prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    await api.post('/login', { email, password })

    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, {})

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />

      {state.error && <p role="alert">{state.error}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Kirilmoqda…' : 'Kirish'}
      </button>
    </form>
  )
}
```
:::

Nima yo'qoldi: `useState` bilan yozilgan `loading`, `error`, `preventDefault`, ikki marta bosishdan himoya — hammasi hook ichida.

## Kod: `useFormStatus`

Tugma **o'zi turgan formaning** holatini bilishi kerak bo'lsa:

::: ts
```tsx
// components/SubmitButton.tsx
import { useFormStatus } from 'react-dom'

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Yuborilmoqda…' : children}
    </button>
  )
}
```
:::

::: js
```jsx
import { useFormStatus } from 'react-dom'

export function SubmitButton({ children }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Yuborilmoqda…' : children}
    </button>
  )
}
```
:::

```jsx
<form action={formAction}>
  <input name="title" />
  <SubmitButton>Saqlash</SubmitButton>       {/* props uzatilmadi */}
</form>
```

**Muhim:** `useFormStatus` faqat `<form>` ning **bolasida** ishlaydi — o'sha formani render qiladigan komponentda emas.

## Kod: `useOptimistic`

Foydalanuvchi natijani server javobini kutmasdan ko'rsin:

::: ts
```tsx
function MessageList({ messages, sendMessage }: Props) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current: Message[], newText: string) => [
      ...current,
      { id: 'temp', text: newText, sending: true },
    ],
  )

  async function action(formData: FormData) {
    const text = formData.get('text') as string

    addOptimistic(text)              // darhol ekranda
    await sendMessage(text)          // server javobi kelgach ro'yxat yangilanadi
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((m) => (
          <li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>{m.text}</li>
        ))}
      </ul>

      <form action={action}>
        <input name="text" />
        <SubmitButton>Yuborish</SubmitButton>
      </form>
    </>
  )
}
```
:::

::: js
```jsx
function MessageList({ messages, sendMessage }) {
  const [optimisticMessages, addOptimistic] = useOptimistic(
    messages,
    (current, newText) => [...current, { id: 'temp', text: newText, sending: true }],
  )

  async function action(formData) {
    const text = formData.get('text')

    addOptimistic(text)
    await sendMessage(text)
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((m) => (
          <li key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>{m.text}</li>
        ))}
      </ul>

      <form action={action}>
        <input name="text" />
        <SubmitButton>Yuborish</SubmitButton>
      </form>
    </>
  )
}
```
:::

Xato bo'lsa, React optimistik holatni **avtomatik bekor qiladi** va haqiqiy ma'lumotga qaytadi.

## Kod: validatsiya bilan (zod)

::: ts
```tsx
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Pochta noto\'g\'ri'),
  password: z.string().min(8, 'Kamida 8 belgi'),
})

type State = {
  errors?: Record<string, string[]>
  message?: string
  values?: { email: string }
}

async function loginAction(prev: State, formData: FormData): Promise<State> {
  const raw = Object.fromEntries(formData)
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { email: String(raw.email ?? '') },      // qiymatlarni saqlab qolish
    }
  }

  try {
    await api.post('/login', parsed.data)

    return {}
  } catch (error) {
    return { message: 'Kirish amalga oshmadi', values: { email: parsed.data.email } }
  }
}
```
:::

::: js
```jsx
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Pochta noto\'g\'ri'),
  password: z.string().min(8, 'Kamida 8 belgi'),
})

async function loginAction(prev, formData) {
  const raw = Object.fromEntries(formData)
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values: { email: String(raw.email ?? '') } }
  }

  try {
    await api.post('/login', parsed.data)

    return {}
  } catch (error) {
    return { message: 'Kirish amalga oshmadi', values: { email: parsed.data.email } }
  }
}
```
:::

Diqqat: xato holatida **kiritilgan qiymatlarni qaytaring** — aks holda foydalanuvchi hammasini qaytadan yozadi.

## Muhandislik nuqtai nazari: Actions va boshqa yondashuvlar

| Vazifa | Action (React 19) | Klassik `useState` | Forma kutubxonasi (RHF) |
| --- | --- | --- | --- |
| Oddiy forma (login, izoh) | ✅ Eng qisqa | Ko'proq kod | Ortiqcha |
| Murakkab validatsiya, dinamik maydonlar | Cheklangan | Og'ir | ✅ React Hook Form |
| Progressive enhancement (JS'siz ishlash) | ✅ (SSR bilan) | ❌ | ❌ |
| Server bilan ishlash (Next Server Actions) | ✅ Asosiy vosita | — | — |
| Har harfda validatsiya | Cheklangan | Mumkin | ✅ |

Amaliy tavsiya: **oddiy formalar — Actions**, murakkab formalar — React Hook Form + zod (38-bob).

## Muhandislik nuqtai nazari: `FormData` va controlled inputlar

Actions `FormData` bilan ishlaydi, ya'ni inputlar **uncontrolled** bo'lishi mumkin:

```jsx
{/* useState kerak emas — qiymat FormData dan olinadi */}
<input name="email" defaultValue={state.values?.email} />
```

Bu forma kodini sezilarli qisqartiradi. Har harfda validatsiya kerak bo'lsagina controlled inputga o'ting (18-bob).

## Muhandislik nuqtai nazari: Next.js bilan bog'liqlik

Actions React 19 ning klient imkoniyati, lekin uning to'liq kuchi **Server Actions** bilan ochiladi (Next qo'llanmasi, 21-bob):

```tsx
'use server'

export async function createPost(prevState, formData) {
  // Bu kod SERVERDA ishlaydi: bazaga to'g'ridan-to'g'ri yozish mumkin
  await db.post.create({ data: { title: formData.get('title') } })

  revalidatePath('/posts')
}
```

Shuning uchun bu bobdagi naqshlar Next.js'ga o'tganingizda bevosita davom etadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `useFormStatus` ni forma render qiladigan komponentda chaqirish | Har doim `pending: false` | Bola komponentda |
| Action'da `preventDefault` chaqirish | React o'zi qiladi | Kerak emas |
| Xato holatida kiritilgan qiymatlarni qaytarmaslik | Foydalanuvchi qaytadan yozadi | `values` ni state'ga qo'shing |
| Optimistik yangilashda xatoni boshqarmaslik | Foydalanuvchi muvaffaqiyat deb o'ylaydi | React bekor qiladi + xabar ko'rsating |
| Har formada `useActionState` o'rniga qo'lda `useState` | Ko'p takroriy kod | Actions |
| Murakkab formani Actions bilan qurishga urinish | Dinamik maydonlar og'ir | React Hook Form (38-bob) |
| Faqat klient validatsiyasiga ishonish | Chetlab o'tiladi | Serverda ham tekshiring (47-bob) |

## Amaliyot

1. Login formasini `useActionState` bilan yozing: xato, pending, qiymatlarni saqlash.
2. `SubmitButton` ni `useFormStatus` bilan alohida komponent qiling va ikki formada ishlating.
3. Izohlar ro'yxatiga `useOptimistic` qo'shing; so'rovni ataylab xato qildiring va holat qaytishini ko'ring.
4. zod validatsiyasini action ichiga qo'shing va maydonlar yonida xatolarni ko'rsating.
5. Xuddi shu formani klassik `useState` bilan yozing va qatorlar sonini solishtiring.

## Rasmiy hujjat

- `useActionState`: <https://react.dev/reference/react/useActionState>
- `useFormStatus`: <https://react.dev/reference/react-dom/hooks/useFormStatus>
- `useOptimistic`: <https://react.dev/reference/react/useOptimistic>
- `<form action>`: <https://react.dev/reference/react-dom/components/form>
