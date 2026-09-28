# 20 — Context

[← Oldingi: `useReducer`](19-usereducer.md) · [Mundarija](README.md) · [Keyingi: `useRef` →](21-useref.md)

## Tushuncha

Context — ma'lumotni **daraxt bo'ylab pastga**, har qavatdan props uzatmasdan yetkazish usuli.

::: ts
```tsx
// 1. Yaratish
type Theme = 'light' | 'dark'
const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void } | null>(null)

// 2. Berish
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// 3. Olish
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme: ThemeProvider topilmadi')

  return ctx
}
```
:::

::: js
```jsx
// 1. Yaratish
const ThemeContext = createContext(null)

// 2. Berish
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// 3. Olish
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme: ThemeProvider topilmadi')

  return ctx
}
```
:::

```jsx
<ThemeProvider>
  <App />              {/* istalgan chuqurlikdagi komponent useTheme() chaqira oladi */}
</ThemeProvider>
```

React 19 da `<ThemeContext>` ni to'g'ridan-to'g'ri provider sifatida ishlatish mumkin (`.Provider` siz):

```jsx
<ThemeContext value={value}>{children}</ThemeContext>
```

## Kod: `use()` bilan o'qish (React 19)

```jsx
import { use } from 'react'

function Button() {
  const { theme } = use(ThemeContext)       // useContext bilan bir xil, lekin shart ichida ham mumkin

  return <button className={theme} />
}
```

`use()` — hooklar qoidasidan istisno: uni shart ichida chaqirish mumkin (24-bob).

## Kod: custom hook bilan o'rash

Context'ni to'g'ridan-to'g'ri eksport qilmang — hook orqali bering:

| Foyda | Sabab |
| --- | --- |
| Provider yo'qligini aniq xato bilan ushlash | `throw new Error(...)` |
| Tiplar to'g'ri chiqadi | `null` tekshiruvidan keyin |
| Ichki implementatsiyani yashirish | Keyin store'ga ko'chirish oson |

```jsx
// ✗ Har joyda null tekshiruvi
const ctx = useContext(ThemeContext)
ctx?.setTheme('dark')

// ✓
const { setTheme } = useTheme()
setTheme('dark')
```

## Kod: context'ning unumdorlik muammosi

**Context qiymati o'zgarsa, uni o'qiydigan BARCHA komponentlar qayta render bo'ladi** — `memo` ham yordam bermaydi.

```jsx
// ✗ Har renderda yangi obyekt → barcha iste'molchilar qayta render
<AppContext.Provider value={{ user, theme, cart }}>

// ✓ Memoizatsiya
const value = useMemo(() => ({ user, theme, cart }), [user, theme, cart])
```

Lekin memoizatsiya ham yetarli emas, agar qiymatlar tez-tez o'zgarsa. To'g'ri yechim — **context'ni bo'lish**:

::: ts
```tsx
// ✗ Bitta katta context: savat o'zgarsa, temani o'qiydiganlar ham qayta render bo'ladi
const AppContext = createContext({ user, theme, cart, notifications })

// ✓ Domen bo'yicha alohida
const UserContext = createContext<User | null>(null)
const ThemeContext = createContext<Theme>('light')
const CartContext = createContext<CartState | null>(null)
```
:::

::: js
```jsx
// ✗ Bitta katta context
const AppContext = createContext({ user, theme, cart, notifications })

// ✓ Domen bo'yicha alohida
const UserContext = createContext(null)
const ThemeContext = createContext('light')
const CartContext = createContext(null)
```
:::

Qo'shimcha naqsh — **holat va dispatch'ni ajratish**:

::: ts
```tsx
const CartStateContext = createContext<CartState | null>(null)
const CartDispatchContext = createContext<React.Dispatch<CartAction> | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart)

  return (
    <CartStateContext.Provider value={state}>
      {/* dispatch hech qachon o'zgarmaydi — bu context'ni o'qiydiganlar qayta render bo'lmaydi */}
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}
```
:::

::: js
```jsx
const CartStateContext = createContext(null)
const CartDispatchContext = createContext(null)

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCart)

  return (
    <CartStateContext.Provider value={state}>
      <CartDispatchContext.Provider value={dispatch}>{children}</CartDispatchContext.Provider>
    </CartStateContext.Provider>
  )
}
```
:::

Shunda faqat "savatga qo'shish" tugmasi (dispatch ishlatadi) savat o'zgarganda qayta render bo'lmaydi.

## Kod: provider'ni to'g'ri joylashtirish

```jsx
// ✗ Provider ichida statik mazmun — holat o'zgarganda hammasi qayta render
function App() {
  return (
    <ThemeProvider>
      <Header />
      <HeavyDashboard />
      <Footer />
    </ThemeProvider>
  )
}

// ✓ `children` sifatida uzatilgan mazmun ota'da yaratiladi va provider holati
//    o'zgarganda qayta render BO'LMAYDI (agar u context'ni o'qimasa)
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')
  const value = useMemo(() => ({ theme, setTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
```

Bu — 14-bobdagi kompozitsiya qoidasining amaliy ko'rinishi.

## Kod: bir nechta provider

```jsx
function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

Tartib muhim: pastdagi provider yuqoridagisini ishlatishi mumkin, aksincha emas. Masalan `CartProvider` `useAuth()` ni chaqira oladi.

"Provider do'zaxi" ko'rinsa, uni alohida faylga ajrating — bu normal holat.

## Muhandislik nuqtai nazari: context nima uchun emas

Context — **ma'lumot uzatish mexanizmi**, holat boshqaruvi kutubxonasi emas. Uning chegaralari:

| Ehtiyoj | Context | Muqobil |
| --- | --- | --- |
| Tema, til, joriy foydalanuvchi | ✅ | — |
| Bir oila komponentlari (`Tabs`) | ✅ | — |
| Tez-tez o'zgaradigan global holat | ❌ (barcha iste'molchi render) | Zustand (36-bob) |
| Server ma'lumoti | ❌ | TanStack Query (32-bob) |
| Tanlab obuna bo'lish (selector) | ❌ (yo'q) | Zustand, Redux |
| Katta obyekt ichidan bitta maydon | ❌ | Bo'lingan context yoki store |

Zustand kabi store'larda **selektor** bor: komponent faqat kerakli maydonga obuna bo'ladi va boshqasi o'zgarganda qayta render bo'lmaydi. Context'da bunday imkoniyat yo'q — shuning uchun bo'lish yagona yo'l.

## Muhandislik nuqtai nazari: qachon context'ga o'tish kerak

Tartib (14, 18-boblarni umumlashtirib):

1. **Props** — 1–2 qavat;
2. **Kompozitsiya** (`children`, slot props) — ko'rinish uzatilsa;
3. **Context** — bir domen, kamdan-kam o'zgaradigan qiymat;
4. **Store** — tez-tez o'zgaradigan yoki keng tarqalgan holat;
5. **So'rov keshi** — server ma'lumoti.

Eng ko'p uchraydigan xato — 2-bosqichni o'tkazib yuborish: props drilling ko'rinishi bilanoq context yozish.

## Muhandislik nuqtai nazari: SSR va context

Server komponentlar (Next.js) context'ni **o'qiy olmaydi** — u faqat klient komponentlarda ishlaydi. Shuning uchun Next loyihalarida provider'lar odatda alohida `"use client"` faylida bo'ladi va ular ildizga yaqin joyda o'raladi. Next qo'llanmasining 04 va 16-boblarida bu batafsil.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Provider `value` ni memoizatsiya qilmaslik | Har renderda barcha iste'molchi yangilanadi | `useMemo` yoki kompilyator |
| Bitta katta "AppContext" | Har o'zgarishda hamma render bo'ladi | Domen bo'yicha bo'lish |
| Context'ni store o'rniga ishlatish | Selektor yo'q, unumdorlik muammosi | Zustand (36-bob) |
| Provider yo'qligini tekshirmaslik | `undefined` xatosi keyinroq chiqadi | Custom hook + `throw` |
| Server ma'lumotini context'da saqlash | Kesh mantiqi qo'lda | So'rov qatlami |
| Provider ichida statik mazmun | Ortiqcha renderlar | `children` sifatida uzating |
| Props drilling ko'rinishi bilan darhol context | Ortiqcha murakkablik | Avval kompozitsiya |

## Amaliyot

1. `ThemeProvider` va `useTheme` ni yozing, `data-theme` atributini `document.documentElement` ga qo'ying.
2. Provider'siz `useTheme()` chaqiring va xato xabarini ko'ring.
3. Bitta katta context yasang, unga sanoqni qo'shing va Profiler'da qaysi komponentlar qayta render bo'layotganini ko'ring; keyin uni ikkiga bo'ling.
4. `useReducer` + ikki context (state/dispatch) naqshini yozing va faqat dispatch ishlatadigan komponent qayta render bo'lmasligini tasdiqlang.
5. `AppProviders` komponentini yig'ing va provider tartibini o'zgartirib, nima buzilishini ko'ring.

## Rasmiy hujjat

- Context: <https://react.dev/learn/passing-data-deeply-with-context>
- `createContext`: <https://react.dev/reference/react/createContext>
- `useContext`: <https://react.dev/reference/react/useContext>
- Reducer va context: <https://react.dev/learn/scaling-up-with-reducer-and-context>
