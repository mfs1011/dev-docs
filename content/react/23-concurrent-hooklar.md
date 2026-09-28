# 23 — Concurrent hooklar: `useId`, `useTransition`, `useDeferredValue`

[← Oldingi: `useMemo` va `useCallback`](22-usememo-usecallback.md) · [Mundarija](README.md) · [Keyingi: `use()` va Suspense →](24-use-va-suspense.md)

## Tushuncha

React 18 dan boshlab render **uzilishi mumkin**: agar muhimroq ish (masalan foydalanuvchi bosishi) kelsa, React joriy renderni to'xtatib, keyin davom ettiradi. Bu — concurrent rendering.

Bu imkoniyatdan foydalanadigan hooklar:

| Hook | Vazifasi |
| --- | --- |
| `useTransition` | Yangilanishni "shoshilinch emas" deb belgilash |
| `useDeferredValue` | Qiymatning eski nusxasini vaqtincha ko'rsatish |
| `useId` | SSR'ga xavfsiz noyob identifikator |

## Kod: `useId`

::: ts
```tsx
function Field({ label, error, ...rest }: FieldProps) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...rest} />
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  )
}
```
:::

::: js
```jsx
function Field({ label, error, ...rest }) {
  const id = useId()
  const errorId = `${id}-error`

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...rest} />
      {error && <p id={errorId} role="alert">{error}</p>}
    </div>
  )
}
```
:::

Nega `Math.random()` emas: SSR'da server va klient boshqa qiymat hosil qiladi va hydration mismatch chiqadi. `useId` server bilan klientda **bir xil** qiymat beradi.

`useId` ro'yxat elementlari uchun `key` sifatida ishlatilmaydi — u faqat DOM identifikatorlari uchun.

## Kod: `useTransition`

Muammo: og'ir ro'yxat filtrlanayotganda input "qotadi" — har harf renderni kutadi.

::: ts
```tsx
function SearchableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value

    setQuery(value)                          // shoshilinch: input darhol yangilanadi

    startTransition(() => {
      // Shoshilinch emas: uzilishi mumkin
      setResults(items.filter((i) => i.title.includes(value)))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <List items={results} />
      </div>
    </>
  )
}
```
:::

::: js
```jsx
function SearchableList({ items }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(items)
  const [isPending, startTransition] = useTransition()

  function handleChange(event) {
    const value = event.target.value

    setQuery(value)

    startTransition(() => {
      setResults(items.filter((i) => i.title.includes(value)))
    })
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <List items={results} />
      </div>
    </>
  )
}
```
:::

Natija: foydalanuvchi yozgan harf **darhol** ko'rinadi, og'ir ro'yxat esa keyinroq yangilanadi va yangi harf kelsa — oldingi render bekor qilinadi.

React 19 da `startTransition` **async funksiyalarni** ham qabul qiladi (Actions, 25-bob):

```jsx
startTransition(async () => {
  await saveProfile(data)
  setSaved(true)
})
```

## Kod: `useDeferredValue`

`useTransition` ning soddaroq varianti: holat yangilanishini emas, **qiymatni** kechiktiradi.

::: ts
```tsx
function SearchableList({ items }: { items: Item[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  // Og'ir hisob eski qiymat bilan ishlaydi, input esa darhol yangilanadi
  const results = useMemo(
    () => items.filter((i) => i.title.includes(deferredQuery)),
    [items, deferredQuery],
  )

  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <List items={results} />
      </div>
    </>
  )
}
```
:::

::: js
```jsx
function SearchableList({ items }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const results = useMemo(
    () => items.filter((i) => i.title.includes(deferredQuery)),
    [items, deferredQuery],
  )

  const isStale = query !== deferredQuery

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <div style={{ opacity: isStale ? 0.6 : 1 }}>
        <List items={results} />
      </div>
    </>
  )
}
```
:::

| | `useTransition` | `useDeferredValue` |
| --- | --- | --- |
| Nimani belgilaydi | Yangilanishni (`setState` chaqiruvini) | Qiymatni |
| Kod qayerda | Hodisa ichida | Komponent tanasida |
| Qachon qulay | Siz `setState` ni nazorat qilasiz | Qiymat props'dan keladi |
| Pending holati | `isPending` | `value !== deferredValue` |

## Kod: debounce bilan farqi

```jsx
// Debounce: vaqt bo'yicha kechiktirish
const debouncedQuery = useDebounce(query, 300)      // 300 ms kutadi

// useDeferredValue: React navbatiga qarab
const deferredQuery = useDeferredValue(query)       // brauzer bo'sh bo'lganda
```

| | Debounce | `useDeferredValue` |
| --- | --- | --- |
| Asos | Vaqt (ms) | React prioritetlari |
| Tez mashinada | Baribir 300 ms kutadi | Deyarli darhol |
| Sekin mashinada | 300 ms + render | Moslashadi |
| Tarmoq so'rovini kechiktirish | ✅ To'g'ri vosita | ❌ Emas |
| Og'ir renderni kechiktirish | Ishlaydi | ✅ To'g'ri vosita |

Qoida: **so'rovni kechiktirish uchun debounce, renderni kechiktirish uchun `useDeferredValue`.** Ikkalasini birga ishlatish ham mumkin.

## Kod: navigatsiya bilan

```jsx
function Navigation() {
  const [isPending, startTransition] = useTransition()
  const navigate = useNavigate()

  function go(path) {
    startTransition(() => {
      navigate(path)            // sahifa og'ir bo'lsa, eski sahifa ko'rinib turadi
    })
  }

  return (
    <nav aria-busy={isPending}>
      <button onClick={() => go('/reports')}>Hisobotlar</button>
      {isPending && <Spinner />}
    </nav>
  )
}
```

React Router v7 va Next.js buni ichkarida o'zi qiladi — siz odatda qo'lda yozmaysiz.

## Muhandislik nuqtai nazari: qachon kerak

Bu hooklar **hamma joyda** kerak emas. Belgilar:

| Belgisi | Vosita |
| --- | --- |
| Input yozganda kechikish seziladi | `useDeferredValue` yoki `useTransition` |
| Katta ro'yxat filtrlanadi (1 000+) | Ikkalasidan biri + virtualizatsiya (41-bob) |
| Tab almashganda ekran qotadi | `useTransition` |
| Har harfda API so'rovi | Debounce (`useDeferredValue` emas) |
| Oddiy forma, kichik ro'yxat | Hech biri |

Avval o'lchang: agar INP ko'rsatkichi 200 ms dan past bo'lsa (41-bob), bu hooklar hech narsa bermaydi.

## Muhandislik nuqtai nazari: concurrent render va toza komponentlar

Concurrent rendering **faqat komponentlar toza bo'lsa** ishlaydi (05-bob): React renderni to'xtatib, keyin **qaytadan boshlashi** mumkin. Agar komponent render paytida tashqi holatni o'zgartirsa, u ikki marta bajariladi va natija buziladi.

`StrictMode` ishlab chiqishda funksiyani ikki marta chaqirishi aynan shu sababdan: u concurrent rejimda buziladigan kodni oldindan ochib beradi (29-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `useId` ni `key` sifatida ishlatish | U elementni emas, DOM id ni belgilaydi | Ma'lumot ID si |
| `Math.random()` bilan id yaratish | SSR mismatch | `useId` |
| `startTransition` ichida input qiymatini yangilash | Input kechikadi | Shoshilinch yangilanish tashqarida |
| API so'rovini `useDeferredValue` bilan kechiktirishga urinish | U renderni kechiktiradi, so'rovni emas | Debounce |
| Hamma joyda `useTransition` | Foydasiz murakkablik | O'lchangan muammo uchun |
| `isPending` da butun ekranni spinner bilan yopish | Eski mazmun foydali | Opacity yoki kichik indikator |
| Toza bo'lmagan komponent + concurrent | Kutilmagan natijalar | `StrictMode` ogohlantirishlarini tuzating |

## Amaliyot

1. 20 000 elementli ro'yxatni filtrlaydigan qidiruv yozing va inputdagi kechikishni seziting.
2. Uni `useDeferredValue` bilan tuzating, `isStale` holatini opacity bilan ko'rsating.
3. Xuddi shu vazifani `useTransition` bilan yozing va ikkalasini solishtiring.
4. `useId` bilan forma maydonini `label` va xato xabariga bog'lang.
5. INP ko'rsatkichini o'lchang (`web-vitals`) — optimizatsiyadan oldin va keyin.

## Rasmiy hujjat

- `useTransition`: <https://react.dev/reference/react/useTransition>
- `useDeferredValue`: <https://react.dev/reference/react/useDeferredValue>
- `useId`: <https://react.dev/reference/react/useId>
