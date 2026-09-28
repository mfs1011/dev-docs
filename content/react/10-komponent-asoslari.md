# 10 — Komponent asoslari

[← Oldingi: Ro'yxatlar va `key`](09-royxatlar-va-key.md) · [Mundarija](README.md) · [Keyingi: Props →](11-props.md)

## Tushuncha

React komponenti — **katta harf bilan boshlanadigan funksiya**, u JSX qaytaradi:

::: ts
```tsx
function Greeting() {
  return <h1>Salom</h1>
}

// Ishlatish
<Greeting />
```
:::

::: js
```jsx
function Greeting() {
  return <h1>Salom</h1>
}

// Ishlatish
<Greeting />
```
:::

Katta harf majburiy: JSX kompilyatori `<greeting />` ni HTML tegi, `<Greeting />` ni komponent deb tushunadi.

## Kod: eksport shakllari

::: ts
```tsx
// Nomli eksport — tavsiya etiladi
export function UserCard({ user }: { user: User }) {
  return <article>{user.name}</article>
}

// Default eksport — sahifa komponentlari va lazy uchun qulay
export default function HomePage() {
  return <main>Bosh sahifa</main>
}
```
:::

::: js
```jsx
// Nomli eksport — tavsiya etiladi
export function UserCard({ user }) {
  return <article>{user.name}</article>
}

// Default eksport — sahifa komponentlari va lazy uchun qulay
export default function HomePage() {
  return <main>Bosh sahifa</main>
}
```
:::

Nomli eksport afzal: IDE avtomatik import qiladi, nomi barcha fayllarda bir xil bo'ladi, refaktoring oson. Default eksport `React.lazy` va framework konvensiyalarida (Next `page.tsx`) ishlatiladi.

## Kod: har nusxa — o'z holati

::: ts
```tsx
function Counter({ label }: { label: string }) {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  )
}

function App() {
  return (
    <>
      <Counter label="A" />
      <Counter label="B" />
      <Counter label="C" />
    </>
  )
}
```
:::

::: js
```jsx
function Counter({ label }) {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      {label}: {count}
    </button>
  )
}

function App() {
  return (
    <>
      <Counter label="A" />
      <Counter label="B" />
      <Counter label="C" />
    </>
  )
}
```
:::

Uch tugma, uch mustaqil sanoq. Holat **komponent nusxasiga** bog'langan, funksiyaga emas.

Diqqat: modul darajasidagi o'zgaruvchi esa hammaga umumiy bo'ladi:

```tsx
let shared = 0                    // ✗ barcha nusxalar bo'lishadi

function Bad() {
  shared++                        // ustiga render paytida o'zgartirish — toza emas (05-bob)
  return <p>{shared}</p>
}
```

## Kod: komponent qayerda yashaydi

React'da fayl tuzilmasi erkin, lekin ikki qoida foydali:

1. **Bitta fayl — bitta asosiy komponent** (HMR va o'qish uchun, 03-bob);
2. **Faqat shu joyda ishlatiladigan kichik yordamchi komponent** o'sha faylda qolishi mumkin:

::: ts
```tsx
// UserCard.tsx
function Avatar({ src, alt }: { src: string; alt: string }) {
  return <img className="avatar" src={src} alt={alt} width={40} height={40} />
}

export function UserCard({ user }: { user: User }) {
  return (
    <article>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
    </article>
  )
}
```
:::

::: js
```jsx
// UserCard.jsx
function Avatar({ src, alt }) {
  return <img className="avatar" src={src} alt={alt} width={40} height={40} />
}

export function UserCard({ user }) {
  return (
    <article>
      <Avatar src={user.avatarUrl} alt={user.name} />
      <h3>{user.name}</h3>
    </article>
  )
}
```
:::

**Muhim taqiq:** komponentni boshqa komponent **ichida** e'lon qilmang:

```tsx
// ✗ Har renderda YANGI komponent turi yaratiladi
function Parent() {
  function Child() {                  // ✗
    return <p>Matn</p>
  }

  return <Child />
}
```

Nega yomon: React uchun har render "boshqa komponent" bo'ladi, shuning uchun u eski daraxtni tashlab, yangisini yaratadi — ichidagi barcha holat va DOM yo'qoladi (05-bobdagi solishtirish jadvali).

## Kod: komponentlar ierarxiyasi

Interfeysni komponentlarga bo'lish — ko'rinishni **ma'noli bo'laklarga** ajratish:

```
App
├── Header
│   ├── Logo
│   └── UserMenu
├── ProductPage
│   ├── ProductGallery
│   ├── ProductInfo
│   │   ├── PriceTag
│   │   └── AddToCartButton
│   └── ProductReviews
│       └── ReviewCard
└── Footer
```

Ajratish mezonlari:

| Belgi | Ajratish kerak |
| --- | --- |
| Bo'lak 2+ joyda takrorlanadi | Ha |
| O'z holati va mantiqi bor (modal, forma, jadval) | Ha |
| Komponent 150+ qator va bo'limlari aniq | Ha |
| Bitta jumlada nomini aytib bo'ladi ("mahsulot kartochkasi") | Ha |
| Faqat "chiroyliroq ko'rinsin" uchun | Yo'q — props ko'payadi |
| 10 qatorlik, bir joyda ishlatiladigan bo'lak | Yo'q |

Qo'shimcha mezon — **o'zgarish chastotasi**: birga o'zgaradigan narsalar birga tursin.

## Muhandislik nuqtai nazari: komponent shartnomasi

Komponentning tashqi yuzasi to'rt narsadan iborat:

1. **Props** — nima kiradi (11-bob);
2. **Callback props** — nima chiqadi (`onSelect`, `onSubmit` — 12-bob);
3. **`children` va slot props** — qayerga mazmun qo'yiladi (14-bob);
4. **Imperativ handle** — `ref` orqali ochilgan metodlar (21-bob, kamdan-kam).

Bu — komponentning API'si. Uni barqaror saqlang: ichini istagancha qayta yozing, lekin shartnomani o'zgartirsangiz, hamma ishlatgan joy sinadi.

Yaxshi shartnoma belgilari:

```tsx
// ✓ Ma'noli, kam sonli props
<Button variant="primary" size="lg" loading={saving} onClick={save}>Saqlash</Button>

// ✗ Ichki tafsilotlar tashqariga chiqqan
<Button bgColor="#0b7fa0" paddingX={16} fontWeight={600} spinnerSize={14} />
```

Ikkinchi holatda komponent hech narsani inkapsulyatsiya qilmayapti — u shunchaki `<button>` ning murakkabroq shakli.

## Muhandislik nuqtai nazari: "prezentatsion va konteyner" naqshi

Eski React adabiyotida komponentlarni ikkiga bo'lish tavsiya qilinardi: **konteyner** (ma'lumot oladi) va **prezentatsion** (faqat ko'rsatadi). Hooklar paydo bo'lgach bu qat'iy bo'linish ahamiyatini yo'qotdi — mantiqni custom hook (26-bob) ajratadi.

Lekin g'oyaning bir qismi hamon foydali: **ma'lumot yuklaydigan komponentni ko'rsatadigan komponentdan ajrating.** Shunda ikkinchisini test qilish, Storybook'da ko'rsatish va qayta ishlatish oson bo'ladi:

::: ts
```tsx
// Ma'lumot: hook orqali
function UserListPage() {
  const { data, isLoading, error } = useUsers()

  if (isLoading) return <Spinner />
  if (error) return <ErrorBox error={error} />

  return <UserList users={data} />          // toza, props oladigan komponent
}
```
:::

::: js
```jsx
// Ma'lumot: hook orqali
function UserListPage() {
  const { data, isLoading, error } = useUsers()

  if (isLoading) return <Spinner />
  if (error) return <ErrorBox error={error} />

  return <UserList users={data} />          // toza, props oladigan komponent
}
```
:::

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Komponentni boshqa komponent ichida e'lon qilish | Har renderda yangi tur, holat yo'qoladi | Modul darajasida |
| Kichik harf bilan nomlash (`myButton`) | JSX uni HTML tegi deb biladi | `MyButton` |
| Modul darajasida o'zgaruvchan holat | Nusxalar bo'lishadi | `useState` |
| 500 qatorlik komponent | O'qib bo'lmaydi, test qilinmaydi | Mezonlar bo'yicha bo'ling |
| Har `<div>` uchun komponent | Props drilling, ortiqcha qatlam | Faqat ma'noli bo'laklar |
| Ma'lumot yuklash va ko'rsatishni aralashtirish | Test va qayta ishlatish qiyin | Hook + toza komponent |
| Komponent ichida boshqa komponentning ichki tuzilmasiga tayanish | Sinadigan bog'lanish | Props/`children` orqali |

## Amaliyot

1. `Counter` ni uch marta joylang va mustaqilligini tasdiqlang. Keyin holatni modul darajasiga ko'chirib, farqni ko'ring.
2. Komponentni boshqa komponent ichida e'lon qiling, unga input qo'shing va ota qayta render bo'lganda matn yo'qolishini kuzating.
3. Mavjud katta komponentingizni oling va yuqoridagi mezonlar bo'yicha qaysi chiziq bo'ylab bo'lish kerakligini yozib chiqing.
4. Ma'lumot yuklaydigan sahifani ikkiga ajrating: hook + toza ko'rinish komponenti.

## Rasmiy hujjat

- Birinchi komponent: <https://react.dev/learn/your-first-component>
- Komponentlarni import/eksport: <https://react.dev/learn/importing-and-exporting-components>
- React'da o'ylash: <https://react.dev/learn/thinking-in-react>
