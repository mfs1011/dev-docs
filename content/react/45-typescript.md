# 45 — TypeScript bilan React

[← Oldingi: Vitest va Testing Library](44-vitest-testing-library.md) · [Mundarija](README.md) · [Keyingi: Kod sifati →](46-kod-sifati.md)

## Tushuncha

React ekotizmi amalda TS-first: kutubxonalar tiplar bilan keladi, props shartnomasi tiplarsiz tez chalkashadi. Bu bobda React'ga xos tiplash naqshlari yig'ilgan.

Sozlash (Vite shabloni buni o'zi qiladi):

```json
// tsconfig.json — muhim qismlar
{
  "compilerOptions": {
    "strict": true,
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Vite **tiplarni tekshirmaydi** — shuning uchun `tsc` build va CI'ga qo'shiladi (02, 46-bob).

## Kod: props

::: ts
```tsx
// Oddiy
type UserCardProps = {
  user: User
  compact?: boolean
  variant: 'default' | 'highlighted'
  onSelect?: (id: number) => void
  children?: React.ReactNode
}

export function UserCard({ user, compact = false, variant, onSelect }: UserCardProps) {
  // ...
}

// HTML atributlarini meros qilib olish (11, 40-bob)
type ButtonProps = React.ComponentPropsWithRef<'button'> & {
  variant?: 'primary' | 'ghost'
  loading?: boolean
}

// Boshqa komponent props'larini kengaytirish
type IconButtonProps = ButtonProps & { icon: React.ReactNode }
```
:::

::: js
```jsx
// JavaScript'da tiplar yo'q — shartnoma testlar va hujjat bilan saqlanadi.
// Eski loyihalarda `prop-types` uchraydi, lekin React 19 da u alohida paket
// va yangi kodda TypeScript tavsiya etiladi.

export function UserCard({ user, compact = false, variant, onSelect }) {
  // ...
}
```
:::

Foydali yordamchi tiplar:

```ts
React.ReactNode          // har qanday render qilinadigan narsa (children uchun)
React.ReactElement       // aniq JSX element
React.CSSProperties      // style obyekti
React.ComponentProps<typeof Button>          // boshqa komponent props'lari
React.ComponentPropsWithoutRef<'input'>      // HTML atributlari (ref siz)
React.PropsWithChildren<{ title: string }>   // children qo'shadi
```

## Kod: hooklarni tiplash

```ts
// useState — ko'pincha chiqariladi
const [count, setCount] = useState(0)                   // number
const [user, setUser] = useState<User | null>(null)     // aniq yozish kerak
const [items, setItems] = useState<Item[]>([])          // bo'sh massivda kerak

// useRef — ikki xil semantika
const inputRef = useRef<HTMLInputElement>(null)         // DOM (read-only current)
const timerRef = useRef<number | null>(null)            // o'zgaruvchan qiymat

// useReducer — diskriminatsiyalangan birlashma (19-bob)
type Action = { type: 'add'; item: Item } | { type: 'remove'; id: number }

const [state, dispatch] = useReducer(reducer, initial)

// Context — null bilan boshlanadi
const ThemeContext = createContext<ThemeValue | null>(null)

// Custom hook qaytarishi — `as const` bilan kortej
export function useToggle(initial = false) {
  const [value, setValue] = useState(initial)
  const toggle = useCallback(() => setValue((v) => !v), [])

  return [value, toggle] as const       // [boolean, () => void]
}
```

## Kod: hodisalar

```ts
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {}
function handleChange(event: React.ChangeEvent<HTMLInputElement>) {}
function handleSubmit(event: React.FormEvent<HTMLFormElement>) {}
function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {}
function handleFocus(event: React.FocusEvent<HTMLInputElement>) {}

// Inline bo'lsa — tip avtomatik chiqadi
<input onChange={(e) => setValue(e.target.value)} />       // e — ChangeEvent
```

## Kod: generik komponentlar

::: ts
```tsx
type SelectProps<T> = {
  items: T[]
  value: T | null
  getLabel: (item: T) => string
  getKey: (item: T) => string | number
  onChange: (item: T) => void
}

export function Select<T>({ items, value, getLabel, getKey, onChange }: SelectProps<T>) {
  return (
    <select
      value={value ? String(getKey(value)) : ''}
      onChange={(e) => {
        const next = items.find((i) => String(getKey(i)) === e.target.value)

        if (next) onChange(next)
      }}
    >
      {items.map((item) => (
        <option key={getKey(item)} value={getKey(item)}>
          {getLabel(item)}
        </option>
      ))}
    </select>
  )
}

// Ishlatish — tip avtomatik chiqadi
<Select
  items={users}
  value={selectedUser}
  getLabel={(u) => u.name}       // u: User
  getKey={(u) => u.id}
  onChange={setSelectedUser}     // (item: User) => void
/>
```
:::

::: js
```jsx
export function Select({ items, value, getLabel, getKey, onChange }) {
  return (
    <select
      value={value ? String(getKey(value)) : ''}
      onChange={(e) => {
        const next = items.find((i) => String(getKey(i)) === e.target.value)

        if (next) onChange(next)
      }}
    >
      {items.map((item) => (
        <option key={getKey(item)} value={getKey(item)}>
          {getLabel(item)}
        </option>
      ))}
    </select>
  )
}
```
:::

## Kod: diskriminatsiyalangan birlashma bilan holat

```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }

const [state, setState] = useState<AsyncState<User[]>>({ status: 'idle' })

// TypeScript `data` ni faqat success holatida ruxsat beradi
if (state.status === 'success') {
  console.log(state.data.length)      // ✓
}

console.log(state.data)               // ✗ kompilyatsiya xatosi
```

Bu — 17-bobdagi "imkonsiz holatni imkonsiz qiling" qoidasining TypeScript'dagi ko'rinishi.

## Kod: API javoblari va runtime tekshiruv

```ts
// ✗ TS "ishonadi", lekin runtime'da tekshiruv yo'q
const user = await api.get<User>('/users/1')
console.log(user.name.toUpperCase())        // server `name: null` qaytarsa — xato

// ✓ zod bilan chegarada tekshirish (38-bob)
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  createdAt: z.string().datetime(),
})

export type User = z.infer<typeof userSchema>       // tip sxemadan

const user = userSchema.parse(await api.get('/users/1'))
```

Qoida: **chegarada (server javobi, `localStorage`, URL) tekshiring, ichkarida tiplarga ishoning.**

## Kod: `any` o'rniga

```ts
// ✗ Tekshiruvni o'chiradi
function handle(payload: any) {}

// ✓ Noma'lum, lekin tekshirishga majbur qiladi
function handle(payload: unknown) {
  if (typeof payload === 'string') { /* ... */ }
}

// ✓ Generik
function first<T>(items: T[]): T | undefined {
  return items[0]
}

// ✓ Tip guard
function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

try {
  await save()
} catch (error) {
  if (isApiError(error) && error.status === 422) showFieldErrors(error.details)
}
```

## Kod: tez-tez uchraydigan tuzoqlar

```ts
// 1. children uchun noto'g'ri tip
type Props = { children: JSX.Element }        // ✗ faqat bitta element
type Props = { children: React.ReactNode }    // ✓ matn, massiv, null — hammasi

// 2. Funksiya prop
type Props = { onSelect: Function }           // ✗ imzo yo'q
type Props = { onSelect: (id: number) => void }  // ✓

// 3. Obyekt indeks
const config: Record<string, string> = {}
config.missing.toUpperCase()                  // ✗ TS ruxsat beradi (noUncheckedIndexedAccess siz)
// `noUncheckedIndexedAccess: true` bilan — `string | undefined`

// 4. `as` bilan majburlash
const el = document.querySelector('.x') as HTMLInputElement   // ✗ tekshirilmaydi
const el = document.querySelector<HTMLInputElement>('.x')     // ✓ HTMLInputElement | null

// 5. Enum o'rniga union
enum Status { Idle, Loading }                 // runtime kod qo'shadi
type Status = 'idle' | 'loading'              // ✓ yengilroq, JSON bilan mos
```

## Muhandislik nuqtai nazari: tipni qayerda yozish, qayerda chiqarish

| Joy | Tavsiya |
| --- | --- |
| Props va emitted callback'lar | Aniq yozing |
| Custom hook qaytarishi | Aniq yozing (hujjat sifatida) |
| Lokal o'zgaruvchi | Chiqarilsin |
| Bo'sh boshlang'ich qiymat (`null`, `[]`) | Aniq yozing |
| API funksiyasi qaytarishi | Aniq (yoki sxemadan) |
| Callback ichidagi parametrlar | Chiqarilsin |

Umumiy qoida: **chegarada aniq, ichkarida chiqarilsin.**

## Muhandislik nuqtai nazari: tiplar qayerda yashaydi

```
src/
├── shared/types/          ← umumiy domen tiplari (User, Product)
├── shared/api/schemas.ts  ← zod sxemalari + chiqarilgan tiplar
└── features/cart/types.ts ← xususiyatga xos tiplar
```

Komponent props tiplari **o'sha fayl ichida** qoladi — ularni alohida faylga chiqarish odatda ortiqcha.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `tsc` ni CI'ga qo'shmaslik | Vite tekshirmaydi (02-bob) | `build`/`typecheck` skriptida |
| `strict: false` | TS foydasining yarmi yo'qoladi | Bosqichma-bosqich `true` |
| Server javobiga `as User` | Runtime'da tekshirilmaydi | zod `parse` |
| Hamma joyda `any` | Tekshiruv yo'q | `unknown` + guard |
| `children: JSX.Element` | Massiv va matn o'tmaydi | `React.ReactNode` |
| `Function` tipi | Imzo yo'q | Aniq imzo |
| Har xil ma'lumot uchun alohida komponent | Takror kod | Generik komponent |
| `useState(null)` keyin obyekt yozish | Tip `null` bo'lib qoladi | `useState<User | null>(null)` |

## Amaliyot

1. `Button` komponentini `ComponentPropsWithRef<'button'>` merosi bilan tiplang.
2. `AsyncState<T>` birlashmasini yozing va `state.data` ni noto'g'ri joyda o'qishga urinib ko'ring.
3. Generik `Select` komponentini yozing va ikki xil ma'lumot turi bilan ishlating.
4. API javobiga zod sxemasi qo'shing; serverdan noto'g'ri shakl qaytaring va xatoni ko'ring.
5. `noUncheckedIndexedAccess` ni yoqing va chiqqan xatolarni tuzating.
6. Loyihangizda `any` larni sanang va uchtasini `unknown` + guard bilan almashtiring.

## Rasmiy hujjat

- React + TypeScript: <https://react.dev/learn/typescript>
- TypeScript hujjati: <https://www.typescriptlang.org/docs/handbook/react.html>
- zod: <https://zod.dev>
