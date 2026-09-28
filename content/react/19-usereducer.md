# 19 — `useReducer`

[← Oldingi: Holatni ko'tarish](18-holatni-kotarish.md) · [Mundarija](README.md) · [Keyingi: Context →](20-context.md)

## Tushuncha

`useReducer` — holatni **o'tishlar** orqali boshqarish: "hozirgi holat + harakat = yangi holat".

::: ts
```tsx
type State = { count: number; step: number }
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; step: number }
  | { type: 'reset' }

const initial: State = { count: 0, step: 1 }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.step }
    case 'reset':
      return initial
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initial)

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+{state.step}</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Tozalash</button>
    </div>
  )
}
```
:::

::: js
```jsx
const initial = { count: 0, step: 1 }

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.step }
    case 'reset':
      return initial
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initial)

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+{state.step}</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Tozalash</button>
    </div>
  )
}
```
:::

Reducer — **toza funksiya**: u faqat yangi holat qaytaradi, so'rov yubormaydi, `Date.now()` ishlatmaydi, hech narsani mutatsiya qilmaydi.

## Kod: qachon `useReducer`, qachon `useState`

| Belgi | Vosita |
| --- | --- |
| 1–3 mustaqil qiymat | `useState` |
| Bir necha maydon birga o'zgaradi | `useState` (obyekt) yoki `useReducer` |
| Keyingi holat oldingisiga murakkab bog'liq | `useReducer` |
| Bir harakat bir nechta maydonni o'zgartiradi | `useReducer` |
| Holat o'tishlarini test qilmoqchisiz | `useReducer` (reducer — toza funksiya) |
| Bir xil mantiq bir necha komponentda | `useReducer` + umumiy reducer |

Amaliy misol — forma yuborish oqimi:

::: ts
```tsx
type FormState = {
  values: { email: string; password: string }
  errors: Partial<Record<'email' | 'password', string>>
  status: 'idle' | 'submitting' | 'success' | 'error'
  serverError: string | null
}

type FormAction =
  | { type: 'change'; field: 'email' | 'password'; value: string }
  | { type: 'submit' }
  | { type: 'success' }
  | { type: 'error'; message: string; fieldErrors?: FormState['errors'] }

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'change':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },   // yozayotganda xato tozalanadi
        serverError: null,
      }

    case 'submit':
      return { ...state, status: 'submitting', serverError: null }

    case 'success':
      return { ...state, status: 'success' }

    case 'error':
      return {
        ...state,
        status: 'error',
        serverError: action.message,
        errors: action.fieldErrors ?? state.errors,
      }

    default:
      return state
  }
}
```
:::

::: js
```jsx
function formReducer(state, action) {
  switch (action.type) {
    case 'change':
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
        serverError: null,
      }

    case 'submit':
      return { ...state, status: 'submitting', serverError: null }

    case 'success':
      return { ...state, status: 'success' }

    case 'error':
      return { ...state, status: 'error', serverError: action.message, errors: action.fieldErrors ?? state.errors }

    default:
      return state
  }
}
```
:::

E'tibor bering: `change` harakati **uch maydonni** birdan yangiladi. `useState` bilan bu uch chaqiruv va uchta joyda takrorlanadigan mantiq bo'lardi.

## Kod: dispatch va async

`dispatch` sinxron va toza. So'rovlar reducer'da emas, chaqiruvchi joyda bo'ladi:

::: ts
```tsx
async function handleSubmit(event: React.FormEvent) {
  event.preventDefault()
  dispatch({ type: 'submit' })

  try {
    await api.post('/login', state.values)
    dispatch({ type: 'success' })
  } catch (error) {
    dispatch({
      type: 'error',
      message: error.message,
      fieldErrors: error.status === 422 ? error.details : undefined,
    })
  }
}
```
:::

::: js
```jsx
async function handleSubmit(event) {
  event.preventDefault()
  dispatch({ type: 'submit' })

  try {
    await api.post('/login', state.values)
    dispatch({ type: 'success' })
  } catch (error) {
    dispatch({
      type: 'error',
      message: error.message,
      fieldErrors: error.status === 422 ? error.details : undefined,
    })
  }
}
```
:::

React 19 da forma oqimlari uchun `useActionState` ham bor — u shu naqshni qisqartiradi (25-bob).

## Kod: lazy boshlang'ich qiymat

```jsx
function init(initialCount) {
  return { count: initialCount, history: [] }
}

const [state, dispatch] = useReducer(reducer, props.initialCount, init)
```

Uchinchi argument — boshlang'ich holatni hisoblovchi funksiya. Foydasi: `reset` harakatida uni qayta ishlatish mumkin:

```jsx
case 'reset':
  return init(action.initialCount)
```

## Kod: reducer'ni test qilish

Reducer — toza funksiya, shuning uchun test yozish juda oson (44-bob):

```js
import { describe, expect, it } from 'vitest'
import { formReducer } from './form-reducer'

describe('formReducer', () => {
  it('maydon o\'zgarganda o\'sha maydon xatosini tozalaydi', () => {
    const state = {
      values: { email: 'x', password: '' },
      errors: { email: 'Noto\'g\'ri' },
      status: 'error',
      serverError: 'Xatolik',
    }

    const next = formReducer(state, { type: 'change', field: 'email', value: 'a@b.c' })

    expect(next.values.email).toBe('a@b.c')
    expect(next.errors.email).toBeUndefined()
    expect(next.serverError).toBeNull()
  })
})
```

Bu — `useReducer` ning eng kam baholanadigan afzalligi: **biznes mantiq React'dan mustaqil** funksiyada yashaydi.

## Kod: `useReducer` + context (mini-store)

::: ts
```tsx
const CartContext = createContext<{ state: CartState; dispatch: React.Dispatch<CartAction> } | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart)

  // Qiymatni memoizatsiya qilish (kompilyatorsiz loyihada muhim, 20-bob)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart: CartProvider topilmadi')

  return ctx
}
```
:::

::: js
```jsx
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart: CartProvider topilmadi')

  return ctx
}
```
:::

Bu — "Redux'siz Redux": kichik va o'rta ilovalar uchun ko'pincha yetarli. Katta bo'lsa — Zustand yoki boshqa store (36-bob).

## Muhandislik nuqtai nazari: holat mashinasi sifatida o'ylash

Reducer holatni **mashina** sifatida ko'rishga majburlaydi: qaysi holatdan qaysi harakat bilan qayerga o'tish mumkin.

```
idle ──submit──▶ submitting ──success──▶ success
                      │
                      └────error────▶ error ──submit──▶ submitting
```

Shu diagrammani chizsangiz, imkonsiz o'tishlar darhol ko'rinadi (17-bob). Murakkab oqimlar (ko'p qadamli forma, to'lov, yuklash) uchun `xstate` kabi kutubxonalar bor, lekin 90% holatda oddiy `switch` yetarli.

## Muhandislik nuqtai nazari: action nomlash

```js
// ✗ Setter uslubida — reducer'ning ma'nosi yo'qoladi
dispatch({ type: 'setLoading', value: true })
dispatch({ type: 'setError', value: 'Xatolik' })

// ✓ Nima sodir bo'lganini bildiradi
dispatch({ type: 'submitStarted' })
dispatch({ type: 'submitFailed', message: 'Xatolik' })
```

Birinchi shaklda reducer shunchaki `useState` ning murakkabroq versiyasiga aylanadi. Ikkinchisida u **hodisalar tarixini** ifodalaydi — logga yozish, qayta ijro etish va debug qilish mumkin bo'ladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Reducer'da so'rov yuborish yoki `Date.now()` | Toza emas, test qilib bo'lmaydi | Chaqiruvchi joyda |
| Holatni mutatsiya qilish (`state.count++`) | React o'zgarishni sezmaydi | Yangi obyekt |
| `default` holatda `throw` qilish (TS'da) | Noma'lum action ilovani buzadi | `return state` yoki tiplar bilan cheklash |
| Har `useState` ni `useReducer` ga aylantirish | Ortiqcha kod | 1–3 oddiy qiymat uchun `useState` |
| Action nomlarini setter uslubida yozish | Reducer foydasi yo'qoladi | Hodisa nomlari |
| Context + `useReducer` da qiymatni memoizatsiya qilmaslik | Ortiqcha renderlar (kompilyatorsiz) | `useMemo` yoki ikki context (20-bob) |
| Reducer'ni komponent ichida e'lon qilish | Har renderda yangi funksiya | Modul darajasida |

## Amaliyot

1. Sanoq komponentini `useReducer` bilan yozing: `increment`, `decrement`, `setStep`, `reset`.
2. Forma oqimini (idle → submitting → success/error) reducer bilan yozing va unga test yozing.
3. `useState` bilan yozilgan murakkab komponentni reducer'ga ko'chiring — nechta joyda takrorlangan mantiq yo'qoldi?
4. `CartProvider` ni `useReducer` + context bilan yozing va ikki komponentdan foydalaning.
5. Holat mashinasi diagrammasini chizing: qaysi o'tishlar imkonsiz ekanini belgilang.

## Rasmiy hujjat

- `useReducer`: <https://react.dev/reference/react/useReducer>
- Holat mantiqini reducer'ga ajratish: <https://react.dev/learn/extracting-state-logic-into-a-reducer>
- Reducer va context: <https://react.dev/learn/scaling-up-with-reducer-and-context>
