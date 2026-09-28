# 11 — Props

[← Oldingi: Komponent asoslari](10-komponent-asoslari.md) · [Mundarija](README.md) · [Keyingi: Hodisalar →](12-hodisalar.md)

## Tushuncha

Props — komponentga tashqaridan beriladigan ma'lumot. Funksiya nuqtai nazaridan bu **argument**, React nuqtai nazaridan esa **faqat o'qish uchun** obyekt.

::: ts
```tsx
type UserCardProps = {
  user: User
  compact?: boolean
  onSelect?: (id: number) => void
}

export function UserCard({ user, compact = false, onSelect }: UserCardProps) {
  return (
    <article className={compact ? 'card card-compact' : 'card'}>
      <h3>{user.name}</h3>
      {onSelect && <button onClick={() => onSelect(user.id)}>Tanlash</button>}
    </article>
  )
}
```
:::

::: js
```jsx
export function UserCard({ user, compact = false, onSelect }) {
  return (
    <article className={compact ? 'card card-compact' : 'card'}>
      <h3>{user.name}</h3>
      {onSelect && <button onClick={() => onSelect(user.id)}>Tanlash</button>}
    </article>
  )
}
```
:::

Destrukturizatsiya va standart qiymatlar — oddiy JavaScript. React'da alohida "default props" mexanizmi kerak emas (u eskirgan).

## Kod: uzatish shakllari

```jsx
{/* Satr */}
<UserCard title="Profil" />

{/* Boshqa har qanday qiymat — {} ichida */}
<UserCard count={5} active={true} tags={['a', 'b']} user={{ id: 1 }} onSelect={handleSelect} />

{/* Boolean qisqartma */}
<UserCard active />

{/* Obyektni yoyish */}
<UserCard {...userProps} />

{/* Qolganlarini uzatish */}
function Input({ label, ...rest }) {
  return (
    <label>
      {label}
      <input {...rest} />
    </label>
  )
}
```

`title="5"` va `title={5}` farqi: birinchisi satr, ikkinchisi son.

## Kod: `children`

Eng ko'p ishlatiladigan maxsus prop — teglar orasidagi mazmun:

::: ts
```tsx
type CardProps = {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Card({ title, children, footer }: CardProps) {
  return (
    <section className="card">
      <header><h3>{title}</h3></header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  )
}
```
:::

::: js
```jsx
export function Card({ title, children, footer }) {
  return (
    <section className="card">
      <header><h3>{title}</h3></header>
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  )
}
```
:::

```jsx
<Card title="Buyurtma" footer={<Button>To'lash</Button>}>
  <p>Buyurtma tafsilotlari</p>
  <OrderLines lines={lines} />
</Card>
```

`children` — oddiy prop: uni `props.children` sifatida ham olish mumkin va JSX ham qabul qiladi. Bu kompozitsiyaning asosi (14-bob).

## Kod: props — faqat o'qish uchun

```jsx
function Bad({ user, items }) {
  user.name = user.name.trim()          // ✗ mutatsiya
  items.sort((a, b) => a.id - b.id)      // ✗ mutatsiya (sort joyida ishlaydi)

  return <p>{user.name}</p>
}

function Good({ user, items }) {
  const name = user.name.trim()          // ✓ yangi qiymat
  const sorted = [...items].sort((a, b) => a.id - b.id)

  return <p>{name}</p>
}
```

Nega qat'iy: props — otaning holati. Uni bolada o'zgartirsangiz, ota bu haqda bilmaydi va ekran holat bilan mos kelmay qoladi. Ustiga React Compiler (07-bob) bunday komponentni optimallashtirishdan voz kechadi.

Ma'lumotni o'zgartirish kerak bo'lsa — **otaga xabar bering** (callback prop):

::: ts
```tsx
function Parent() {
  const [items, setItems] = useState<Item[]>([])

  return <ItemList items={items} onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />
}

function ItemList({ items, onRemove }: { items: Item[]; onRemove: (id: number) => void }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.title}
          <button onClick={() => onRemove(item.id)}>O'chirish</button>
        </li>
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
function Parent() {
  const [items, setItems] = useState([])

  return <ItemList items={items} onRemove={(id) => setItems(items.filter((i) => i.id !== id))} />
}

function ItemList({ items, onRemove }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.title}
          <button onClick={() => onRemove(item.id)}>O'chirish</button>
        </li>
      ))}
    </ul>
  )
}
```
:::

Bu — React'dagi asosiy ma'lumot oqimi: **pastga props, yuqoriga callback.**

## Kod: props tiplash (TypeScript)

::: ts
```tsx
// Oddiy
type Props = {
  title: string
  count?: number
  variant: 'primary' | 'ghost' | 'danger'
  onSelect: (id: number) => void
  children: React.ReactNode
}

// HTML atributlarini meros qilib olish
type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className, ...rest }: ButtonProps) {
  return <button className={`btn btn-${variant} ${className ?? ''}`} {...rest} />
}
```

`ComponentPropsWithoutRef<'button'>` — `onClick`, `type`, `disabled`, `aria-*` va boshqa barcha standart atributlarni bir qatorda beradi. Dizayn tizimi komponentlari uchun standart naqsh (40, 45-bob).
:::

::: js
```jsx
// JavaScript'da tiplar yo'q — shartnoma hujjat va testlar bilan saqlanadi.
// Eski loyihalarda `prop-types` uchraydi, lekin React 19 da u alohida paket
// va yangi kodda tavsiya etilmaydi: uning o'rniga TypeScript ishlatiladi.

export function Button({ variant = 'primary', className = '', ...rest }) {
  return <button className={`btn btn-${variant} ${className}`} {...rest} />
}
```
:::

## Kod: props drilling va uning chegarasi

Ma'lumotni 4–5 daraja pastga uzatish zerikarli:

```
App → Layout → Sidebar → Menu → MenuItem (theme kerak)
```

Yechimlar tartibi:

| Chuqurlik | Yechim |
| --- | --- |
| 1–2 daraja | Props — normal |
| Ko'rinish uzatiladi | `children` / kompozitsiya (14-bob) |
| 3+ daraja, bir domen | Context (20-bob) |
| Butun ilova | Store: Zustand va h.k. (36-bob) |
| Server ma'lumoti | So'rov keshi (32-bob) |

Ikkinchi qator ko'pincha e'tibordan chetda qoladi. Ko'p hollarda ma'lumotni pastga uzatish o'rniga **mazmunni yuqorida yozib**, pastga `children` sifatida berish mumkin:

```jsx
{/* ✗ theme ni 4 qavat pastga uzatish */}
<Layout theme={theme}>…</Layout>

{/* ✓ mazmun yuqorida yaratildi — pastga faqat u tushadi */}
<Layout sidebar={<Menu theme={theme} />}>
  <Content />
</Layout>
```

## Muhandislik nuqtai nazari: props API'sini loyihalash

```jsx
{/* ✗ 12 ta boolean — kombinatsiyalar portlaydi */}
<Button primary large rounded outlined loading disabled block iconOnly />

{/* ✓ O'lchovlar */}
<Button variant="primary" size="lg" loading={saving} />
```

Qoidalar:

1. **Bir o'lchov — bitta prop.** `primary`/`danger`/`ghost` — bu bitta `variant`;
2. **Boolean faqat haqiqiy ha/yo'q uchun** (`disabled`, `loading`);
3. **5–7 props dan oshsa** — komponent juda ko'p ish qilyapti; `children` yoki bo'lishga o'ting;
4. **Standart qiymat eng ko'p ishlatiladigani bo'lsin**;
5. **Callback nomlari `on` bilan** (`onSelect`, `onSubmit`), ularga javob beruvchi funksiyalar `handle` bilan (`handleSelect`).

## Muhandislik nuqtai nazari: obyekt props va barqarorlik

```jsx
{/* Har renderda yangi obyekt/funksiya — bola qayta render bo'ladi */}
<Chart options={{ animate: true }} onPointClick={(p) => log(p)} />
```

React Compiler (07-bob) buni avtomatik hal qiladi. Kompilyatorsiz loyihada:

```jsx
const chartOptions = { animate: true }        // modul darajasida yoki useMemo

<Chart options={chartOptions} onPointClick={handlePointClick} />
```

Bu faqat **memoizatsiya qilingan** (`memo`) yoki og'ir bolalar uchun muhim. Oddiy komponent uchun ortiqcha optimizatsiya (22, 41-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Props'ni mutatsiya qilish | Ota bilmaydi, ekran mos kelmaydi | Yangi qiymat + callback |
| `<Comp count="5" />` son kutilganda | Satr uzatiladi | `count={5}` |
| Props'ni `useState` boshlang'ich qiymati qilib, keyin yangilanmasligidan hayron bo'lish | `useState` faqat birinchi renderda o'qiydi | `key` bilan reset yoki hosila qiymat (17-bob) |
| 10+ boolean props | Kombinatsiyalar boshqarib bo'lmas holga keladi | `variant`/`size` |
| Ichki tafsilotlarni props qilib chiqarish (`paddingX`, `bgColor`) | Inkapsulyatsiya yo'qoladi | Ma'noli o'lchovlar |
| Props drilling'ni darhol context bilan yechish | Context ham narxga ega (20-bob) | Avval kompozitsiya |
| `props` ni butunlay uzatish (`{...props}`) o'ylamasdan | Keraksiz atributlar DOM'ga tushadi | Kerakli maydonlarni ajrating |

## Amaliyot

1. `Button` komponentini yozing: `variant`, `size`, `loading` props'lari va `ComponentPropsWithoutRef<'button'>` merosi bilan.
2. Bolada props'ni mutatsiya qilib ko'ring (`items.sort()`) va ekran bilan holat qanday farq qilishini kuzating.
3. Uch darajali props drilling yasang, keyin uni `children` bilan qayta yozing.
4. 8 ta boolean props'li komponent yozing, keyin uni 3 ta o'lchovga qisqartiring.
5. `onSelect` callback prop'li ro'yxat yasang: bola faqat xabar bersin, o'zgartirishni ota qilsin.

## Rasmiy hujjat

- Props: <https://react.dev/learn/passing-props-to-a-component>
- `children`: <https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children>
- TypeScript bilan props: <https://react.dev/learn/typescript#typing-component-props>
