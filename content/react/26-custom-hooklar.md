# 26 — O'z hookingiz

[← Oldingi: Actions](25-actions.md) · [Mundarija](README.md) · [Keyingi: `useEffect`: asoslar →](27-useeffect-asoslar.md)

## Tushuncha

Custom hook — **`use` bilan boshlanadigan funksiya**, u ichida boshqa hooklarni chaqiradi. Vazifasi: mantiqni komponentdan ajratib, qayta ishlatish.

::: ts
```tsx
// hooks/use-local-storage.ts
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key)

      return saved ? (JSON.parse(saved) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // kvota tugagan yoki private rejim
    }
  }, [key, value])

  return [value, setValue] as const
}

// Ishlatish
const [theme, setTheme] = useLocalStorage('theme', 'light')
```
:::

::: js
```jsx
// hooks/use-local-storage.js
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)

      return saved ? JSON.parse(saved) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // kvota tugagan yoki private rejim
    }
  }, [key, value])

  return [value, setValue]
}

// Ishlatish
const [theme, setTheme] = useLocalStorage('theme', 'light')
```
:::

## Nega shunday: hook holatni bo'lishmaydi

Muhim tushuncha: **ikki komponent bir xil hookni chaqirsa, ular alohida holat oladi.**

```jsx
function A() {
  const [count, setCount] = useCounter()    // o'z holati
}

function B() {
  const [count, setCount] = useCounter()    // boshqa holat
}
```

Hook — **kod bo'lishish** mexanizmi, holat bo'lishish emas. Holat bo'lishish kerak bo'lsa: context (20-bob), store (36-bob) yoki holatni ko'tarish (18-bob).

## Kod: hodisa tinglovchisi hooki

::: ts
```tsx
export function useEventListener<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  target: Window | Document | HTMLElement = window,
) {
  const savedHandler = useRef(handler)

  // Handler o'zgarsa — ref yangilanadi, effekt qayta ishga tushmaydi
  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event: Event) => savedHandler.current(event as WindowEventMap[K])

    target.addEventListener(type, listener)

    return () => target.removeEventListener(type, listener)
  }, [type, target])
}

// Ishlatish
useEventListener('keydown', (event) => {
  if (event.key === 'Escape') close()
})
```
:::

::: js
```jsx
export function useEventListener(type, handler, target = window) {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const listener = (event) => savedHandler.current(event)

    target.addEventListener(type, listener)

    return () => target.removeEventListener(type, listener)
  }, [type, target])
}

// Ishlatish
useEventListener('keydown', (event) => {
  if (event.key === 'Escape') close()
})
```
:::

`savedHandler` naqshi muhim: usiz har renderda yangi funksiya bo'lgani uchun tinglovchi qayta-qayta ulanib-uzilardi.

## Kod: media query va debounce

::: ts
```tsx
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)

    setMatches(mql.matches)
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
```
:::

::: js
```jsx
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event) => setMatches(event.matches)

    setMatches(mql.matches)
    mql.addEventListener('change', onChange)

    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)

    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
```
:::

## Kod: domen hooklari

Eng foydali custom hooklar — texnik emas, **domen** hooklari:

::: ts
```tsx
// features/cart/use-cart.ts
export function useCart() {
  const [lines, setLines] = useLocalStorage<CartLine[]>('cart', [])

  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)

  function add(product: Product, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id)

      if (!existing) return [...prev, { productId: product.id, price: product.price, qty }]

      return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l))
    })
  }

  function remove(productId: number) {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }

  return { lines, count, subtotal, add, remove }
}
```
:::

::: js
```jsx
// features/cart/use-cart.js
export function useCart() {
  const [lines, setLines] = useLocalStorage('cart', [])

  const count = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)

  function add(product, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id)

      if (!existing) return [...prev, { productId: product.id, price: product.price, qty }]

      return prev.map((l) => (l.productId === product.id ? { ...l, qty: l.qty + qty } : l))
    })
  }

  function remove(productId) {
    setLines((prev) => prev.filter((l) => l.productId !== productId))
  }

  return { lines, count, subtotal, add, remove }
}
```
:::

Komponent endi faqat ko'rinish bilan shug'ullanadi — biznes mantiq hookda va u alohida test qilinadi (44-bob).

> Diqqat: yuqoridagi `useCart` **holatni bo'lishmaydi** — har chaqiruv o'z nusxasini oladi. Butun ilova bo'ylab bitta savat kerak bo'lsa, uni context yoki store bilan bering (20, 36-bob).

## Kod: hookni test qilish

```jsx
import { act, renderHook } from '@testing-library/react'
import { useCounter } from './use-counter'

it('maksimumdan oshmaydi', () => {
  const { result } = renderHook(() => useCounter(0, { max: 2 }))

  act(() => {
    result.current.increment()
    result.current.increment()
    result.current.increment()
  })

  expect(result.current.count).toBe(2)
})
```

`renderHook` hookni sun'iy komponent ichida ishga tushiradi — bu Vue'dagi `withSetup` naqshining ekvivalenti.

## Muhandislik nuqtai nazari: qachon hook yaratish kerak

| Belgi | Hook kerakmi |
| --- | --- |
| Bir xil `useState` + `useEffect` juftligi 2+ joyda | ✅ Ha |
| Komponentda 3+ hook bitta vazifaga xizmat qiladi | ✅ Ha |
| Mantiqni test qilmoqchisiz | ✅ Ha |
| Faqat hisob, hooksiz | ❌ Oddiy funksiya |
| Faqat bitta joyda ishlatiladi va qisqa | ❌ Komponentda qoldiring |
| Server ma'lumoti | Kutubxona (32-bob) |

Belgi: agar funksiyada `useState`, `useEffect`, `useRef` yoki boshqa hook **yo'q** bo'lsa — u hook emas, oddiy utilita. `use` prefiksi faqat chalg'itadi.

## Muhandislik nuqtai nazari: hook API'sini loyihalash

```jsx
// ✗ Ko'p qiymat, tartib esda qolmaydi
const [a, b, c, d] = useThing()

// ✓ Obyekt — nomlar aniq
const { value, setValue, reset, isDirty } = useThing()

// ✓ Ikkita qiymat bo'lsa massiv ham maqbul (useState uslubi)
const [value, setValue] = useToggle(false)
```

Qoida: **2 tagacha — massiv, ko'proq bo'lsa — obyekt.**

Argumentlar uchun: 1–2 ta pozitsion, undan ko'p bo'lsa options obyekti:

```jsx
useFetch(url, { retry: 3, timeout: 5000, enabled: isReady })
```

## Muhandislik nuqtai nazari: hooklarni tashkil qilish

```
src/
├── shared/hooks/           ← texnik hooklar (useDebounce, useMediaQuery)
└── features/
    ├── cart/use-cart.ts    ← domen hooklari xususiyat yonida
    └── auth/use-auth.ts
```

Texnik hooklarni o'zingiz yozishdan oldin tayyor to'plamlarni ko'rib chiqing: **`usehooks-ts`**, **`react-use`**, **`@mantine/hooks`**. Ular sinovdan o'tgan va chekka holatlarni qamrab olgan (masalan `useLocalStorage` da tablar orasidagi sinxronlash).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hook holatni bo'lishadi deb o'ylash | Har chaqiruv — alohida holat | Context yoki store |
| `use` prefiksisiz hook yozish | Lint qoidalari ishlamaydi | `useX` |
| Hookni shart ichida chaqirish | Hooklar tartibi buziladi (06-bob) | Yuqori darajada |
| Tozalashni unutish | Xotira oqishi | `useEffect` cleanup |
| Handler'ni effekt bog'liqligiga qo'yish | Har renderda qayta ulanadi | `useRef` naqshi |
| Oddiy utilitaga `use` prefiksi | Chalg'itadi | Oddiy funksiya |
| Har texnik hookni o'zi yozish | Chekka holatlar e'tibordan chetda | Tayyor kutubxona |

## Amaliyot

1. `useLocalStorage` ni yozing va ikki komponentda ishlating — holat alohida ekanini tasdiqlang.
2. `useEventListener` ni yozing va `Escape` bilan modalni yoping; `savedHandler` naqshini olib tashlab, tinglovchi qayta ulanishini kuzating.
3. `useDebouncedValue` ni yozing va qidiruv so'rovlari sonini Network panelida solishtiring.
4. `useCart` domen hookini yozing va komponentdan butun biznes mantiqni ko'chiring.
5. `renderHook` bilan hookka test yozing.

## Rasmiy hujjat

- Custom hooklar: <https://react.dev/learn/reusing-logic-with-custom-hooks>
- Hooklar qoidalari: <https://react.dev/reference/rules/rules-of-hooks>
- `renderHook`: <https://testing-library.com/docs/react-testing-library/api#renderhook>
