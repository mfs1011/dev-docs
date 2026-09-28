# 22 — `useMemo` va `useCallback`

[← Oldingi: `useRef`](21-useref.md) · [Mundarija](README.md) · [Keyingi: Concurrent hooklar →](23-concurrent-hooklar.md)

## Tushuncha

Har render — komponent funksiyasining yangi chaqiruvi (05-bob). Demak ichidagi barcha qiymat va funksiya **qaytadan yaratiladi**:

```jsx
function List({ items }) {
  const sorted = [...items].sort(compare)      // har renderda qayta hisoblanadi
  const handleClick = () => {}                 // har renderda yangi funksiya obyekti
}
```

`useMemo` va `useCallback` — natijani **renderlar orasida saqlash** vositalari:

```jsx
const sorted = useMemo(() => [...items].sort(compare), [items])
const handleClick = useCallback(() => {}, [])
```

> **Muhim:** React Compiler (07-bob) yoqilgan bo'lsa, bu ikkisi deyarli kerak emas — kompilyator memoizatsiyani o'zi qo'shadi. Quyidagi qoidalar kompilyatorsiz loyihalar va kompilyator qamramaydigan holatlar uchun.

## Kod: `useMemo`

::: ts
```tsx
function ProductList({ products, query }: Props) {
  // Faqat products yoki query o'zgarganda qayta hisoblanadi
  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  )

  return <List items={filtered} />
}
```
:::

::: js
```jsx
function ProductList({ products, query }) {
  const filtered = useMemo(
    () => products.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  )

  return <List items={filtered} />
}
```
:::

`useMemo` ikki holatda foydali:

1. **Hisob qimmat** — 10 000 element ustida saralash/filtrlash;
2. **Natija havolasi barqaror bo'lishi kerak** — u bola `memo` komponentga props sifatida ketadi yoki effekt bog'liqligi bo'ladi.

Ikkinchi sabab ko'pincha muhimroq: bu **unumdorlik emas, to'g'rilik** masalasi.

## Kod: `useCallback`

::: ts
```tsx
const handleSelect = useCallback((id: number) => {
  setSelectedId(id)
}, [])

// Bola memoizatsiya qilingan bo'lsa — endi ortiqcha render bo'lmaydi
<MemoizedList items={items} onSelect={handleSelect} />
```
:::

::: js
```jsx
const handleSelect = useCallback((id) => {
  setSelectedId(id)
}, [])

<MemoizedList items={items} onSelect={handleSelect} />
```
:::

`useCallback(fn, deps)` — bu `useMemo(() => fn, deps)` ning qisqartmasi.

**Muhim:** `useCallback` faqat bola `memo` bilan o'ralgan bo'lsa yoki funksiya effekt bog'liqligi bo'lsa ma'no beradi. Oddiy DOM tugmasiga uzatilsa — foydasi yo'q:

```jsx
{/* useCallback bu yerda hech narsa bermaydi */}
<button onClick={useCallback(() => setOpen(true), [])}>Ochish</button>
```

## Kod: `memo`

```jsx
import { memo } from 'react'

const ExpensiveRow = memo(function ExpensiveRow({ item, onSelect }) {
  // Props o'zgarmasa — qayta render bo'lmaydi
  return <li onClick={() => onSelect(item.id)}>{item.title}</li>
})
```

`memo` props'ni **sayoz** solishtiradi (`Object.is` har maydon uchun). Shuning uchun:

```jsx
{/* ✗ Har renderda yangi obyekt va funksiya — memo foydasiz */}
<ExpensiveRow item={item} config={{ compact: true }} onSelect={(id) => pick(id)} />

{/* ✓ Barqaror havolalar */}
const config = { compact: true }                    // modul darajasida
const handleSelect = useCallback((id) => pick(id), [pick])

<ExpensiveRow item={item} config={config} onSelect={handleSelect} />
```

Ya'ni `memo` yolg'iz ishlamaydi — u `useMemo`/`useCallback` bilan **birga** ishlatiladi. Bu uchlik React kodini og'irlashtirgan asosiy sabab va aynan shuning uchun React Compiler yaratilgan.

## Kod: qachon KERAK EMAS

```jsx
// ✗ Arzon hisob — memoizatsiya narxi foydadan katta
const total = useMemo(() => price * qty, [price, qty])
const fullName = useMemo(() => `${first} ${last}`, [first, last])

// ✓
const total = price * qty
const fullName = `${first} ${last}`
```

`useMemo` ning o'zi ham narxga ega: bog'liqliklarni solishtirish, natijani saqlash, xotira. Oddiy arifmetika uchun bu narx foydadan katta.

Amaliy chegara: **10 000 elementdan kichik massiv ustida oddiy `filter`/`map`** — memoizatsiyasiz qoldiring.

## Kod: to'g'rilik uchun memoizatsiya

::: ts
```tsx
// ✗ options har renderda yangi → effekt har renderda qayta ishga tushadi
function Widget({ threshold }: { threshold: number }) {
  const options = { threshold }

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, options)
    observer.observe(ref.current!)

    return () => observer.disconnect()
  }, [options])          // ← har render yangi havola
}

// ✓
const options = useMemo(() => ({ threshold }), [threshold])
```
:::

::: js
```jsx
// ✗ options har renderda yangi → effekt har renderda qayta ishga tushadi
function Widget({ threshold }) {
  const options = { threshold }

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, options)
    observer.observe(ref.current)

    return () => observer.disconnect()
  }, [options])
}

// ✓
const options = useMemo(() => ({ threshold }), [threshold])
```
:::

Muqobil yechim — obyektni effekt **ichida** yaratish va faqat primitiv bog'liqlik qoldirish:

```jsx
useEffect(() => {
  const observer = new IntersectionObserver(onIntersect, { threshold })
  // ...
}, [threshold])          // ← primitiv, barqaror
```

Ikkinchisi ko'pincha soddaroq (27-bob).

## Kod: `useMemo` bilan komponent memoizatsiyasi

```jsx
{/* Og'ir pastki daraxtni memoizatsiya qilish */}
const chart = useMemo(() => <HeavyChart data={data} />, [data])

return (
  <div>
    <Filters value={filters} onChange={setFilters} />
    {chart}                    {/* filtrlar o'zgarganda qayta render bo'lmaydi */}
  </div>
)
```

Bu naqsh `memo()` ga muqobil — komponentni o'zgartirmasdan uning natijasini saqlaydi. Amalda kompozitsiya (14-bob) ko'pincha yaxshiroq yechim.

## Muhandislik nuqtai nazari: o'lchamasdan optimallashtirmang

Tartib:

1. **Profiler'da o'lchang** (React DevTools → Profiler → "Record why each component rendered");
2. Sababni toping: katta ro'yxatmi, og'ir hisobmi, context'mi?
3. Eng arzon yechimni qo'llang: kamroq element, kompozitsiya, holatni pastroqqa tushirish;
4. Faqat shundan keyin memoizatsiya.

Sabab: memoizatsiya kodni murakkablashtiradi va bog'liqlik ro'yxatidagi xato **jim xatolar** keltirib chiqaradi (eskirgan qiymat ishlatilishi).

## Muhandislik nuqtai nazari: React Compiler bilan

Kompilyator yoqilgach (07-bob):

| Holat | Qo'lda memoizatsiya |
| --- | --- |
| Oddiy hisob | Kerak emas |
| Bola komponentga funksiya uzatish | Kerak emas |
| `memo()` o'ramlari | Odatda kerak emas |
| Juda qimmat hisob (100k element) | Aniq yozilgani tushunarliroq |
| Tashqi kutubxona uchun barqaror havola | Kerak (semantik sabab) |
| Effekt bog'liqligi | Kerak yoki effekt ichida yarating |

Mavjud `useMemo`/`useCallback` larni kompilyator yoqilgach darhol o'chirish shart emas — ular zarar qilmaydi.

## Muhandislik nuqtai nazari: memoizatsiya xatolari

Eng xavfli xato — **bog'liqlikni tushirib qoldirish**:

```jsx
// ✗ `multiplier` o'zgarsa, natija yangilanmaydi — jim xato
const result = useMemo(() => items.map((i) => i.price * multiplier), [items])
```

ESLint qoidasi (`react-hooks/exhaustive-deps`) buni ushlaydi — uni **o'chirmang** (46-bob). Ogohlantirish chiqsa, ikki yo'l bor: bog'liqlikni qo'shish yoki kodni qayta tuzish (masalan, funksiyani effekt ichiga ko'chirish).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hamma joyga `useMemo`/`useCallback` | Kod shovqini, xotira, foyda yo'q | O'lchang, keyin qo'ying |
| `memo` ni barqaror bo'lmagan props bilan | Solishtirish har doim `false` | `useMemo`/`useCallback` bilan birga |
| Bog'liqlik ro'yxatini tushirib qoldirish | Eskirgan qiymat — jim xato | `exhaustive-deps` qoidasi |
| `exhaustive-deps` ni o'chirish | Xatolar yashiriladi | Kodni qayta tuzing |
| `useCallback` ni oddiy DOM handler uchun | Foydasi yo'q | Shunchaki funksiya |
| Har render `useMemo` ichida `new Date()` | Bog'liqliksiz bo'lsa ham noto'g'ri semantika | Holat yoki effekt |
| Optimizatsiyani arxitektura muammosi o'rniga ishlatish | Sabab yo'qolmaydi | Holatni qayta joylashtiring |

## Amaliyot

1. 50 000 elementli massivni filtrlang: `useMemo` siz va bilan — Profiler'da farqni o'lchang.
2. `memo` bilan o'ralgan bolaga inline obyekt uzating va u baribir qayta render bo'lishini ko'ring; keyin tuzating.
3. `useMemo` dan bog'liqlikni ataylab olib tashlang va eskirgan natijani kuzating.
4. `IntersectionObserver` misolini ikki xil yozing: `useMemo` bilan va obyektni effekt ichida yaratib.
5. React Compiler'ni yoqing va yozgan `useMemo` laringizdan qaysi biri endi ortiqcha ekanini aniqlang.

## Rasmiy hujjat

- `useMemo`: <https://react.dev/reference/react/useMemo>
- `useCallback`: <https://react.dev/reference/react/useCallback>
- `memo`: <https://react.dev/reference/react/memo>
