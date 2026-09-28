# 38 — Formalar

[← Oldingi: Holat qayerda yashaydi](37-holat-qayerda.md) · [Mundarija](README.md) · [Keyingi: Autentifikatsiya (klient tomoni) →](39-auth-klient.md)

## Tushuncha

React'da forma yozishning uch darajasi bor:

1. **Uncontrolled + `FormData`** — eng kam kod, React 19 Actions bilan (25-bob);
2. **Controlled `useState`** — har harfda nazorat kerak bo'lganda;
3. **Forma kutubxonasi** (React Hook Form) — murakkab formalar uchun.

Tanlov forma murakkabligiga qarab qilinadi, "har doim shunday" degan qoida yo'q.

## Kod: 1-daraja — uncontrolled

::: ts
```tsx
function ContactForm() {
  async function submit(formData: FormData) {
    const values = Object.fromEntries(formData) as { name: string; email: string; message: string }

    await api.post('/contact', values)
  }

  return (
    <form action={submit}>
      <input name="name" required minLength={2} />
      <input name="email" type="email" required />
      <textarea name="message" required />

      <SubmitButton>Yuborish</SubmitButton>
    </form>
  )
}
```
:::

::: js
```jsx
function ContactForm() {
  async function submit(formData) {
    const values = Object.fromEntries(formData)

    await api.post('/contact', values)
  }

  return (
    <form action={submit}>
      <input name="name" required minLength={2} />
      <input name="email" type="email" required />
      <textarea name="message" required />

      <SubmitButton>Yuborish</SubmitButton>
    </form>
  )
}
```
:::

Brauzer validatsiyasi (`required`, `type="email"`, `minLength`) bepul keladi. Kamchiligi: xato xabarlari brauzerniki va ularni moslashtirib bo'lmaydi.

## Kod: 2-daraja — controlled + zod

::: ts
```tsx
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Pochta noto\'g\'ri'),
  password: z.string().min(8, 'Kamida 8 belgi'),
})

type Values = z.infer<typeof schema>

function LoginForm() {
  const [values, setValues] = useState<Values>({ email: '', password: '' })
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const result = schema.safeParse(values)

  const errors: Partial<Record<keyof Values, string>> = {}

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof Values

      if (submitted || touched[field]) errors[field] ??= issue.message
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: Values) => api.post('/login', data),
    onError: (error: ApiError) => setServerError(error.message),
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    setServerError(null)

    if (result.success) mutate(result.data)
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Field label="Pochta" error={errors.email}>
        <input
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
      </Field>

      {serverError && <p role="alert">{serverError}</p>}

      <button type="submit" disabled={isPending}>Kirish</button>
    </form>
  )
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

function LoginForm() {
  const [values, setValues] = useState({ email: '', password: '' })
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState(null)

  const result = schema.safeParse(values)
  const errors = {}

  if (!result.success) {
    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (submitted || touched[field]) errors[field] ??= issue.message
    }
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => api.post('/login', data),
    onError: (error) => setServerError(error.message),
  })

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setServerError(null)

    if (result.success) mutate(result.data)
  }

  return (
    <form noValidate onSubmit={handleSubmit}>
      <Field label="Pochta" error={errors.email}>
        <input
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        />
      </Field>

      {serverError && <p role="alert">{serverError}</p>}

      <button type="submit" disabled={isPending}>Kirish</button>
    </form>
  )
}
```
:::

Asosiy g'oya: **validatsiya — render paytida hisoblanadi** (17-bob), ko'rsatish esa `touched`/`submitted` bilan boshqariladi.

## Kod: 3-daraja — React Hook Form

```bash
npm i react-hook-form @hookform/resolvers zod
```

::: ts
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  email: z.string().email('Pochta noto\'g\'ri'),
  age: z.coerce.number().int().min(18, '18 dan katta bo\'lishi kerak'),
})

type Values = z.infer<typeof schema>

function ProfileForm({ defaultValues }: { defaultValues?: Partial<Values> }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',            // xatolar blur'dan keyin ko'rinadi
  })

  async function onSubmit(values: Values) {
    try {
      await api.put('/profile', values)
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        // Server xatolarini maydonlarga bog'lash
        for (const [field, messages] of Object.entries(error.details ?? {})) {
          setError(field as keyof Values, { message: messages[0] })
        }
      } else {
        setError('root', { message: 'Saqlab bo\'lmadi' })
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Ism" error={errors.name?.message}>
        <input {...register('name')} />
      </Field>

      <Field label="Pochta" error={errors.email?.message}>
        <input type="email" {...register('email')} />
      </Field>

      {errors.root && <p role="alert">{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting || !isDirty}>Saqlash</button>
    </form>
  )
}
```
:::

::: js
```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  name: z.string().min(2, 'Kamida 2 belgi'),
  email: z.string().email('Pochta noto\'g\'ri'),
  age: z.coerce.number().int().min(18, '18 dan katta bo\'lishi kerak'),
})

function ProfileForm({ defaultValues }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(schema), defaultValues, mode: 'onTouched' })

  async function onSubmit(values) {
    try {
      await api.put('/profile', values)
    } catch (error) {
      if (error.status === 422) {
        for (const [field, messages] of Object.entries(error.details ?? {})) {
          setError(field, { message: messages[0] })
        }
      } else {
        setError('root', { message: 'Saqlab bo\'lmadi' })
      }
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <Field label="Ism" error={errors.name?.message}>
        <input {...register('name')} />
      </Field>

      <button type="submit" disabled={isSubmitting || !isDirty}>Saqlash</button>
    </form>
  )
}
```
:::

React Hook Form uncontrolled inputlarga tayanadi — shuning uchun har harfda butun forma qayta render bo'lmaydi. Katta formalarda bu sezilarli farq.

## Kod: `Field` komponenti

::: ts
```tsx
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={error ? 'field field-error' : 'field'}>
      <label htmlFor={id}>{label}</label>

      {children({ id, describedBy: error ? errorId : hint ? hintId : undefined, invalid: !!error })}

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
export function Field({ label, error, hint, children }) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={error ? 'field field-error' : 'field'}>
      <label htmlFor={id}>{label}</label>

      {children({ id, describedBy: error ? errorId : hint ? hintId : undefined, invalid: !!error })}

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

`aria-invalid` va `aria-describedby` — skrinrider foydalanuvchisi uchun majburiy (42-bob).

## Kod: dinamik maydonlar

```jsx
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({ control, name: 'items' })

{fields.map((field, index) => (
  <div key={field.id}>                       {/* field.id — barqaror key (09-bob) */}
    <input {...register(`items.${index}.title`)} />
    <button type="button" onClick={() => remove(index)}>O'chirish</button>
  </div>
))}

<button type="button" onClick={() => append({ title: '' })}>Qator qo'shish</button>
```

Bu — qo'lda yozish eng ko'p vaqt oladigan qism va kutubxonaning eng katta foydasi.

## Kod: saqlanmagan o'zgarishlar

```jsx
const { formState: { isDirty } } = useForm(...)

// Brauzer tab'ini yopishdan ogohlantirish
useEffect(() => {
  if (!isDirty) return

  const handler = (event) => event.preventDefault()

  window.addEventListener('beforeunload', handler)

  return () => window.removeEventListener('beforeunload', handler)
}, [isDirty])

// Router navigatsiyasidan ogohlantirish (React Router)
useBlocker(({ currentLocation, nextLocation }) =>
  isDirty && currentLocation.pathname !== nextLocation.pathname,
)
```

## Muhandislik nuqtai nazari: qaysi darajani tanlash

| Forma | Daraja |
| --- | --- |
| Qidiruv, obuna, izoh (1–3 maydon) | Uncontrolled + Actions |
| Login, ro'yxatdan o'tish (3–5 maydon) | Controlled yoki RHF |
| Profil, sozlamalar (5–15 maydon) | React Hook Form |
| Dinamik qatorlar, qadamli forma, shartli maydonlar | React Hook Form |
| Har harfda murakkab hisob (narx kalkulyatori) | Controlled |

Boshlang'ich tanlov: **RHF + zod** — u deyarli har holatni qoplaydi va kod hajmi barqaror qoladi.

## Muhandislik nuqtai nazari: xatolarni qachon ko'rsatish

| Payt | Ko'rsatilsinmi | Sabab |
| --- | --- | --- |
| Yozayotganda (birinchi marta) | Yo'q | Foydalanuvchi hali tugatmagan |
| `blur` da | Ha | Maydonni tark etdi |
| Yuborishda | Ha, hammasi + birinchi xatoga fokus | Aniq javob |
| Xato ko'ringandan keyin tuzatayotganda | Ha, jonli | Progress ko'rinsin |

RHF'da bu `mode: 'onTouched'` + `reValidateMode: 'onChange'` bilan sozlanadi.

Yuborishda birinchi xato maydoniga fokus:

```jsx
const onError = (errors) => {
  const first = Object.keys(errors)[0]

  document.querySelector(`[name="${first}"]`)?.focus()
}

<form onSubmit={handleSubmit(onSubmit, onError)}>
```

## Muhandislik nuqtai nazari: klient va server validatsiyasi

Klient validatsiyasi — **UX**, server validatsiyasi — **himoya** (47-bob). Ikkalasi ham kerak va ular bir manbadan kelishi mumkin:

```ts
// shared/schemas/user.ts — klient va server (Node bo'lsa) bir xil sxemani ishlatadi
export const userSchema = z.object({ /* ... */ })
```

Server 422 qaytarganda uni maydonlarga bog'lash — yuqoridagi `setError` naqshi. Bu qadam ko'pincha o'tkazib yuboriladi va foydalanuvchi "nimadir xato" degan umumiy xabarni ko'radi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har harfda qizil xato | Foydalanuvchi bosim ostida | `touched`/`onTouched` |
| `noValidate` ni unutish | Brauzer xabarlari sizning validatsiyangiz bilan to'qnashadi | `<form noValidate>` |
| Server xatolarini umumiy toast bilan | Qaysi maydon — noma'lum | `setError` bilan bog'lash |
| `<form>` siz tugma bilan yuborish | Enter ishlamaydi | `<form onSubmit>` |
| `aria-invalid`/`aria-describedby` yo'q | Skrinrider xatoni o'qimaydi | `Field` komponenti |
| Yuborishda tugmani bloklamaslik | Ikki marta yuboriladi | `isSubmitting` |
| Katta formani controlled qilish | Har harfda butun forma render | RHF (uncontrolled) |
| Saqlanmagan o'zgarishlarni ogohlantirmaslik | Ma'lumot yo'qoladi | `isDirty` + blocker |

## Amaliyot

1. Aloqa formasini uncontrolled + Actions bilan yozing.
2. Login formasini controlled + zod bilan yozing, `touched` mantiqi bilan.
3. Xuddi shu formani React Hook Form'ga ko'chiring va qatorlar sonini solishtiring.
4. Serverdan 422 qaytaring va xatolarni maydonlarga bog'lang.
5. `useFieldArray` bilan dinamik qatorli forma yasang.
6. `isDirty` bilan saqlanmagan o'zgarish ogohlantirishini qo'shing.

## Rasmiy hujjat

- Formalar (React): <https://react.dev/reference/react-dom/components/form>
- React Hook Form: <https://react-hook-form.com/get-started>
- zod: <https://zod.dev>
