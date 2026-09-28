# 14 — Kompozitsiya naqshlari

[← Oldingi: Shartli render](13-shartli-render.md) · [Mundarija](README.md) · [Keyingi: Uslublar →](15-uslublar.md)

## Tushuncha

React'da "meros" yo'q — komponentlar **kompozitsiya** orqali birlashtiriladi. Asosiy vosita: `children` va JSX qabul qiladigan props.

::: ts
```tsx
function Layout({ sidebar, children }: { sidebar: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  )
}

// Ishlatish
<Layout sidebar={<Nav items={navItems} />}>
  <ProductList products={products} />
</Layout>
```
:::

::: js
```jsx
function Layout({ sidebar, children }) {
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{children}</main>
    </div>
  )
}

// Ishlatish
<Layout sidebar={<Nav items={navItems} />}>
  <ProductList products={products} />
</Layout>
```
:::

## Kod: kompozitsiya props drilling'ni kesadi

Muammo: `theme` ni 4 qavat pastga uzatish kerak.

```jsx
{/* ✗ Props drilling */}
<Layout theme={theme}>
  <Sidebar theme={theme}>
    <Menu theme={theme}>
      <MenuItem theme={theme} />
```

Yechim: mazmunni **yuqorida yarating**, pastga faqat tayyor JSX tushsin:

```jsx
{/* ✓ theme faqat bir joyda ishlatildi */}
<Layout sidebar={<Menu theme={theme} />}>
  <Content />
</Layout>
```

Bu — context'ga o'tishdan **oldin** sinab ko'rish kerak bo'lgan usul (20-bob).

## Kod: slot naqshi

Bir nechta "teshik" kerak bo'lsa, props orqali beriladi:

::: ts
```tsx
type CardProps = {
  header?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}

export function Card({ header, footer, children }: CardProps) {
  return (
    <section className="card">
      {header && <header className="card-header">{header}</header>}
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  )
}
```
:::

::: js
```jsx
export function Card({ header, footer, children }) {
  return (
    <section className="card">
      {header && <header className="card-header">{header}</header>}
      <div className="card-body">{children}</div>
      {footer && <footer className="card-footer">{footer}</footer>}
    </section>
  )
}
```
:::

```jsx
<Card
  header={<h3>Buyurtma #1024</h3>}
  footer={<Button onClick={pay}>To'lash</Button>}
>
  <OrderLines lines={lines} />
</Card>
```

## Kod: compound komponentlar

Bir-biriga bog'liq komponentlar to'plami — context orqali muloqot qiladi (20-bob):

::: ts
```tsx
const TabsContext = createContext<{ active: string; setActive: (id: string) => void } | null>(null)

export function Tabs({ defaultTab, children }: { defaultTab: string; children: React.ReactNode }) {
  const [active, setActive] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>
}

export function Tab({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('<Tab> faqat <Tabs> ichida ishlaydi')

  return (
    <button
      role="tab"
      aria-selected={ctx.active === id}
      onClick={() => ctx.setActive(id)}
    >
      {children}
    </button>
  )
}

export function TabPanel({ id, children }: { id: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)

  if (ctx?.active !== id) return null

  return <div role="tabpanel">{children}</div>
}
```
:::

::: js
```jsx
const TabsContext = createContext(null)

export function Tabs({ defaultTab, children }) {
  const [active, setActive] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

export function TabList({ children }) {
  return <div role="tablist">{children}</div>
}

export function Tab({ id, children }) {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('<Tab> faqat <Tabs> ichida ishlaydi')

  return (
    <button role="tab" aria-selected={ctx.active === id} onClick={() => ctx.setActive(id)}>
      {children}
    </button>
  )
}

export function TabPanel({ id, children }) {
  const ctx = useContext(TabsContext)

  if (ctx?.active !== id) return null

  return <div role="tabpanel">{children}</div>
}
```
:::

```jsx
<Tabs defaultTab="profile">
  <TabList>
    <Tab id="profile">Profil</Tab>
    <Tab id="settings">Sozlamalar</Tab>
  </TabList>

  <TabPanel id="profile"><Profile /></TabPanel>
  <TabPanel id="settings"><Settings /></TabPanel>
</Tabs>
```

Foydalanuvchi hech qanday `active` prop uzatmaydi — komponentlar bir-birini kontekst orqali topadi. Radix UI, Headless UI, Ark UI — hammasi shu naqshda qurilgan.

## Kod: render prop

Mantiqni bo'lishish, lekin ko'rinishni chaqiruvchiga qoldirish:

::: ts
```tsx
function MousePosition({ children }: { children: (pos: { x: number; y: number }) => React.ReactNode }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })

    window.addEventListener('mousemove', onMove)

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return <>{children(pos)}</>
}

// Ishlatish
<MousePosition>{({ x, y }) => <p>{x}, {y}</p>}</MousePosition>
```
:::

::: js
```jsx
function MousePosition({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })

    window.addEventListener('mousemove', onMove)

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return <>{children(pos)}</>
}

// Ishlatish
<MousePosition>{({ x, y }) => <p>{x}, {y}</p>}</MousePosition>
```
:::

> **Eslatma:** hooklar paydo bo'lgandan keyin bu naqsh o'z o'rnini **custom hook** ga bo'shatdi (26-bob):
>
> ```jsx
> const { x, y } = useMousePosition()
> ```
>
> Render prop hamon foydali bo'ladigan joy — mantiq bilan birga **shablon tuzilmasi** ham kerak bo'lganda (masalan, virtual ro'yxat qator render qilishni chaqiruvchiga qoldiradi).

## Kod: HOC (yuqori darajali komponent)

```jsx
function withAuth(Component) {
  return function Guarded(props) {
    const { user, isLoading } = useAuth()

    if (isLoading) return <Spinner />
    if (!user) return <Navigate to="/login" />

    return <Component {...props} user={user} />
  }
}

const ProtectedDashboard = withAuth(Dashboard)
```

HOC ham eskirgan naqsh hisoblanadi: u props manbasini yashiradi, tiplash murakkab va ichma-ich o'ralganda debug qiyin. Zamonaviy alternativalar: custom hook (`useAuth`) yoki marshrut darajasidagi himoya (35-bob).

## Muhandislik nuqtai nazari: naqshlar tarixi va bugungi holat

| Naqsh | Holat | O'rnini nima egalladi |
| --- | --- | --- |
| Mixin'lar (sinf davri) | O'lik | Hooklar |
| HOC | Eskirgan | Hook + kompozitsiya |
| Render prop | Kamdan-kam | Hook |
| `children` va slot props | **Standart** | — |
| Compound + context | **Standart** (murakkab UI uchun) | — |
| Custom hook | **Standart** (mantiq uchun) | — |

Amaliy qoida: **mantiq — hookka, ko'rinish — kompozitsiyaga.**

## Muhandislik nuqtai nazari: qachon context, qachon kompozitsiya

| Holat | Yechim |
| --- | --- |
| Ma'lumot 1–2 qavat pastga | Props |
| Ko'rinish pastga uzatiladi | `children`/slot props |
| Bir oila komponentlari (`Tabs`, `Accordion`, `Select`) | Compound + context |
| Butun ilova uchun (tema, til, foydalanuvchi) | Context (20-bob) |
| Tez-tez o'zgaradigan global holat | Store (36-bob) |

Context'ni "props drilling'dan qutulish vositasi" sifatida darhol ishlatish — keng tarqalgan xato. Avval kompozitsiyani sinab ko'ring: u hech qanday qo'shimcha mexanizmsiz ishlaydi va unumdorlikka ta'sir qilmaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har variatsiya uchun yangi prop (`showHeader`, `headerText`, `headerAlign`) | Props portlaydi | Slot (`header={<... />}`) |
| HOC zanjiri (`withAuth(withTheme(withRouter(X)))`) | Debug qiyin, props manbasi noaniq | Hooklar |
| Compound komponentda context tekshiruvi yo'q | Tashqarida ishlatilsa tushunarsiz xato | `throw new Error(...)` |
| Render prop ni hook o'rniga ishlatish | Ortiqcha ichma-ichlik | Custom hook |
| `children` ni `React.Children` bilan ko'p manipulyatsiya qilish | Sinadigan, murakkab | Context yoki aniq props |
| Kompozitsiyani sinab ko'rmasdan context'ga o'tish | Ortiqcha qayta renderlar | Avval `children` |

## Amaliyot

1. `Card` komponentini `header`/`footer` slotlari bilan yozing va `footer` bo'lmaganda o'ram chiqmasligini ta'minlang.
2. Props drilling'li kodni `children` bilan qayta yozing — nechta qavatdan `theme` yo'qoldi?
3. `Tabs`/`TabList`/`Tab`/`TabPanel` compound to'plamini yozing va bir sahifada ikkita mustaqil guruh joylang.
4. `<Tab>` ni `<Tabs>` tashqarisida ishlatib ko'ring va xato xabarini o'qing.
5. `MousePosition` render prop komponentini yozing, keyin uni `useMousePosition` hookga aylantiring (26-bobdan keyin) va solishtiring.

## Rasmiy hujjat

- Kompozitsiya: <https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children>
- Context: <https://react.dev/learn/passing-data-deeply-with-context>
- Mantiqni hookga ajratish: <https://react.dev/learn/reusing-logic-with-custom-hooks>
