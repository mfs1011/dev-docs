# 18 — Holatni ko'tarish

[← Oldingi: Holatni to'g'ri loyihalash](17-holat-dizayni.md) · [Mundarija](README.md) · [Keyingi: `useReducer` →](19-usereducer.md)

## Tushuncha

Ikki komponentga bir xil ma'lumot kerak bo'lsa, uni **umumiy otaga ko'taring** va pastga props sifatida uzating. O'zgartirish esa callback orqali yuqoriga qaytadi.

::: ts
```tsx
function FilterableList({ items }: { items: Item[] }) {
  // Holat ikkala bolaga kerak — shuning uchun otada
  const [query, setQuery] = useState('')

  const visible = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ItemList items={visible} />
    </>
  )
}

function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
```
:::

::: js
```jsx
function FilterableList({ items }) {
  const [query, setQuery] = useState('')

  const visible = items.filter((i) => i.title.toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <ItemList items={visible} />
    </>
  )
}

function SearchInput({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
```
:::

## Kod: controlled va uncontrolled

Bu — React'dagi asosiy komponent dizayni tanlovi:

::: ts
```tsx
// Uncontrolled: komponent o'z holatini o'zi boshqaradi
function SearchInputUncontrolled({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        onSearch(e.target.value)
      }}
    />
  )
}

// Controlled: holat otada, komponent faqat ko'rsatadi
function SearchInputControlled({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
```
:::

::: js
```jsx
// Uncontrolled: komponent o'z holatini o'zi boshqaradi
function SearchInputUncontrolled({ onSearch }) {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => {
        setQuery(e.target.value)
        onSearch(e.target.value)
      }}
    />
  )
}

// Controlled: holat otada
function SearchInputControlled({ value, onChange }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} />
}
```
:::

| | Uncontrolled | Controlled |
| --- | --- | --- |
| Holat qayerda | Komponent ichida | Otada |
| Ishlatish osonligi | Osonroq (kamroq props) | Ko'proq kod |
| Tashqaridan boshqarish | Mumkin emas | Mumkin (tozalash, oldindan to'ldirish) |
| Bir nechta joydan sinxronlash | Mumkin emas | Mumkin |
| Qachon | Mustaqil vidjet | Forma, filtr, umumiy holat |

Ko'plab kutubxonalar **ikkalasini ham** qo'llab-quvvatlaydi: `value` berilsa controlled, berilmasa ichki holat ishlatiladi.

## Kod: ikkalasini qo'llab-quvvatlaydigan komponent

::: ts
```tsx
type ToggleProps = {
  checked?: boolean                          // berilsa — controlled
  defaultChecked?: boolean                   // berilmasa — uncontrolled boshlang'ich
  onChange?: (checked: boolean) => void
}

export function Toggle({ checked, defaultChecked = false, onChange }: ToggleProps) {
  const [internal, setInternal] = useState(defaultChecked)

  const isControlled = checked !== undefined
  const value = isControlled ? checked : internal

  function handleClick() {
    const next = !value

    if (!isControlled) setInternal(next)

    onChange?.(next)
  }

  return <button role="switch" aria-checked={value} onClick={handleClick} />
}
```
:::

::: js
```jsx
export function Toggle({ checked, defaultChecked = false, onChange }) {
  const [internal, setInternal] = useState(defaultChecked)

  const isControlled = checked !== undefined
  const value = isControlled ? checked : internal

  function handleClick() {
    const next = !value

    if (!isControlled) setInternal(next)

    onChange?.(next)
  }

  return <button role="switch" aria-checked={value} onClick={handleClick} />
}
```
:::

Bu naqsh dizayn tizimi komponentlari uchun standart (40-bob).

## Kod: holatni qayerga ko'tarish kerak

```
        App
         │
    ┌────┴────┐
 Sidebar   Content         ← ikkalasiga `selectedId` kerak
    │         │
  Menu    Details
```

Holat **eng yaqin umumiy ota** da yashaydi — bu yerda `App`. Uni yuqoriroqqa ko'tarish (masalan global store'ga) shart emas: qanchalik yuqori bo'lsa, shuncha ko'p komponent qayta render bo'ladi.

Agar umumiy ota juda uzoqda bo'lsa (5+ qavat), variantlar:

1. **Kompozitsiya** — mazmunni yuqorida yarating (14-bob);
2. **Context** — bir domen uchun (20-bob);
3. **Store** — butun ilova uchun (36-bob);
4. **URL** — ulashilishi mantiqiy bo'lsa (35-bob).

## Kod: callback nomlash

```jsx
{/* Prop nomi — `on` + hodisa */}
<SearchInput onChange={...} onClear={...} onSubmit={...} />

{/* Uni qabul qiluvchi funksiya — `handle` + hodisa */}
function Parent() {
  function handleSearchChange(value) { /* ... */ }

  return <SearchInput onChange={handleSearchChange} />
}
```

Bu konvensiya butun ekotizmda amal qiladi va kodni o'qishni yengillashtiradi: `onX` — komponentdan chiqadigan hodisa, `handleX` — unga javob.

## Muhandislik nuqtai nazari: "holat ko'tarish" va unumdorlik

Holatni yuqoriga ko'tarish — butun pastki daraxtni qayta render qiladi:

```jsx
function App() {
  const [query, setQuery] = useState('')      // har harfda App qayta render

  return (
    <>
      <SearchInput value={query} onChange={setQuery} />
      <HeavyDashboard />                      {/* ham qayta render bo'ladi */}
    </>
  )
}
```

Yechimlar tartibi:

1. **Kompozitsiya** — og'ir qismni `children` sifatida uzating, u qayta render bo'lmaydi:

```jsx
function App() {
  return (
    <SearchProvider>
      <HeavyDashboard />        {/* App'da yaratilgan, SearchProvider holati o'zgarganda qayta render bo'lmaydi */}
    </SearchProvider>
  )
}
```

2. **Holatni pastroqqa tushiring** — agar faqat bitta shox ishlatsa;
3. **`memo`** — o'lchangandan keyin (22, 41-bob);
4. React Compiler (07-bob) — ko'p holatni avtomatik hal qiladi.

## Muhandislik nuqtai nazari: bir tomonlama oqim

React'ning ma'lumot oqimi qat'iy: **pastga qiymat, yuqoriga hodisa.** Bu ikki tomonlama bog'lanishdan (Vue'dagi `v-model`) ko'ra ko'proq kod talab qiladi, lekin bitta muhim afzallikka ega: **"kim o'zgartirdi?" savoliga javob har doim bitta joyda.**

Ekranda noto'g'ri qiymat ko'rinsa, uni faqat holat egasi bo'lgan komponent o'zgartirgan bo'ladi — 10 ta komponent orasida qidirish shart emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Holatni ikkala bolada nusxalash | Sinxrondan chiqadi | Umumiy otaga ko'tarish |
| Holatni darhol global store'ga chiqarish | Ortiqcha murakkablik | Eng yaqin umumiy ota |
| Props'dan `useState` boshlang'ich qiymati qilib, sinxronlashni kutish | Yangilanmaydi | Controlled yoki `key` |
| Controlled inputga `value` berib, `onChange` bermaslik | Input "muzlaydi" | `onChange` majburiy |
| `onChange` o'rniga `onInput`/`onChangeText` | React'da `onChange` har bosishda ishlaydi | `onChange` |
| Holat ko'tarilgach unumdorlik muammosini `memo` bilan tuzatishga shoshilish | Sabab boshqa bo'lishi mumkin | Avval kompozitsiya |
| Callback'larni `on`/`handle` konvensiyasisiz nomlash | O'qish qiyinlashadi | Konvensiyaga rioya |

## Amaliyot

1. Qidiruv inputi va ro'yxatni ikki alohida komponentga ajrating, holatni otaga ko'taring.
2. `Toggle` komponentini controlled va uncontrolled rejimlarni qo'llab-quvvatlaydigan qilib yozing.
3. Controlled inputga `value` berib `onChange` bermang — konsoldagi ogohlantirishni o'qing.
4. Og'ir komponentni holat o'zgarganda qayta render bo'lishini Profiler'da ko'ring, keyin `children` kompozitsiyasi bilan tuzating.
5. Ikki aka-uka komponent orasidagi holatni avval store'ga, keyin umumiy otaga qo'ying — qaysi biri qisqaroq?

## Rasmiy hujjat

- Holatni ko'tarish: <https://react.dev/learn/sharing-state-between-components>
- Controlled va uncontrolled: <https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components>
