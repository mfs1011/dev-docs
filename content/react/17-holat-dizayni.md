# 17 — Holatni to'g'ri loyihalash

[← Oldingi: `useState`](16-usestate.md) · [Mundarija](README.md) · [Keyingi: Holatni ko'tarish →](18-holatni-kotarish.md)

## Tushuncha

React'dagi xatolarning katta qismi hooklarni bilmaslikdan emas, **holatni noto'g'ri loyihalashdan** kelib chiqadi. To'rt tamoyil bor:

1. Bog'liq holatlarni birlashtiring;
2. Zid holatlarni imkonsiz qiling;
3. Hosila qiymatni saqlamang — hisoblang;
4. Takrorlanishdan qoching (normalizatsiya).

## Kod: 1 — bog'liq holatlarni birlashtirish

```jsx
// ✗ Har doim birga o'zgaradi, lekin alohida saqlangan
const [x, setX] = useState(0)
const [y, setY] = useState(0)

// ✓
const [position, setPosition] = useState({ x: 0, y: 0 })
```

Belgisi: har safar bittasini yangilaganda ikkinchisini ham yangilayotgan bo'lsangiz — ular bitta holat.

## Kod: 2 — zid holatlarni imkonsiz qilish

```jsx
// ✗ 8 ta kombinatsiya, 5 tasi imkonsiz (masalan isLoading && isError)
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)
```

::: ts
```tsx
// ✓ To'rt holat, hammasi mantiqiy
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User[] }
  | { status: 'error'; error: Error }

const [state, setState] = useState<State>({ status: 'idle' })

// TypeScript endi `state.data` ni faqat success holatida ruxsat beradi
if (state.status === 'success') {
  console.log(state.data.length)
}
```
:::

::: js
```jsx
// ✓ Bitta status maydoni
const [state, setState] = useState({ status: 'idle' })

setState({ status: 'loading' })
setState({ status: 'success', data })
setState({ status: 'error', error })
```
:::

TypeScript'da bu **diskriminatsiyalangan birlashma** deyiladi va u xatolarni kompilyatsiya vaqtida ushlaydi (45-bob).

## Kod: 3 — hosila qiymatni hisoblang

```jsx
// ✗ Ikki manba — bir kun farq qiladi
const [items, setItems] = useState([])
const [count, setCount] = useState(0)
const [total, setTotal] = useState(0)

// ✓ Bitta manba, qolgani render paytida
const [items, setItems] = useState([])

const count = items.length
const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
const hasItems = count > 0
```

Vue'da bunga `computed` javob berardi; React'da esa **oddiy o'zgaruvchi yetarli**, chunki funksiya baribir qaytadan ishlaydi (06-bob). `useMemo` faqat hisob qimmat bo'lganda (22-bob).

Xuddi shu qoida props uchun ham:

```jsx
// ✗
const [fullName, setFullName] = useState(`${firstName} ${lastName}`)

// ✓
const fullName = `${firstName} ${lastName}`
```

## Kod: 4 — normalizatsiya va takrorlash

```jsx
// ✗ Tanlangan element nusxasi saqlangan — ro'yxatdagi nusxa yangilansa, bu eskiradi
const [items, setItems] = useState([])
const [selectedItem, setSelectedItem] = useState(null)

// ✓ Faqat ID saqlanadi, obyekt ro'yxatdan olinadi
const [items, setItems] = useState([])
const [selectedId, setSelectedId] = useState(null)

const selectedItem = items.find((i) => i.id === selectedId) ?? null
```

Katta ro'yxatlarda va bir obyekt bir nechta joyda uchraganda — normalizatsiya:

::: ts
```tsx
type State = {
  byId: Record<number, Item>
  ids: number[]
}

const [state, setState] = useState<State>({ byId: {}, ids: [] })

// Bitta elementni yangilash — butun massivni aylanish shart emas
function updateItem(id: number, patch: Partial<Item>) {
  setState((s) => ({ ...s, byId: { ...s.byId, [id]: { ...s.byId[id], ...patch } } }))
}

const items = state.ids.map((id) => state.byId[id])
```
:::

::: js
```jsx
const [state, setState] = useState({ byId: {}, ids: [] })

function updateItem(id, patch) {
  setState((s) => ({ ...s, byId: { ...s.byId, [id]: { ...s.byId[id], ...patch } } }))
}

const items = state.ids.map((id) => state.byId[id])
```
:::

Normalizatsiya narxi — qo'shimcha kod. 200 elementgacha va bitta ro'yxatda ishlatilsa, oddiy massiv yetarli.

## Kod: chuqur ichma-ich holatdan qochish

```jsx
// ✗ Yangilash uchun uch daraja spread kerak
const [state, setState] = useState({
  user: { profile: { address: { city: '' } } },
})

setState((s) => ({
  ...s,
  user: { ...s.user, profile: { ...s.user.profile, address: { ...s.user.profile.address, city: 'Toshkent' } } },
}))

// ✓ Tekisroq tuzilma
const [city, setCity] = useState('')
// yoki immer
```

Chuqur tuzilma ko'pincha **server javobini shundayligicha holatga solishdan** kelib chiqadi. Kerakli qismini ajratib oling yoki `useReducer` + `immer` ishlating (19-bob).

## Muhandislik nuqtai nazari: minimal holat printsipi

Har bir `useState` uchun savol bering: **bu qiymatni boshqa narsadan hisoblab bo'ladimi?**

| Savol | Javob → |
| --- | --- |
| Props'dan hisoblanadimi? | Holat kerak emas |
| Boshqa holatdan hisoblanadimi? | Holat kerak emas |
| Render paytida o'zgarmaydimi va UI'ga ta'sir qilmaydimi? | `useRef` (21-bob) |
| Serverdan keladimi? | So'rov keshi (32-bob) |
| URL'da bo'lishi mantiqiymi? | URL (35-bob) |
| Foydalanuvchi o'zgartiradimi va UI shunga qarab yangilanadimi? | ✅ `useState` |

Minimal holat — kamroq xato, kamroq render, oson debug.

## Muhandislik nuqtai nazari: server holati alohida

Eng ko'p uchraydigan arxitektura xatosi — server ma'lumotini oddiy `useState` da saqlash:

```jsx
// ✗ Kesh, eskirish, qayta yuklash, poyga — hammasini o'zingiz yozasiz
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  fetch('/api/users').then(...)
}, [])
```

Bu kod kichik loyihada ishlaydi, lekin quyidagilarni o'zingiz hal qilishingiz kerak bo'ladi: takroriy so'rovlarni birlashtirish, eskirgan ma'lumotni yangilash, sahifa fokusga qaytganda yangilash, xato bo'lganda qayta urinish, optimistik yangilash, poyga holatlari.

Shuning uchun **server holati** uchun alohida qatlam bor (32-bob: TanStack Query). Klient holati (`useState`) va server holati — ikki boshqa narsa:

| | Klient holati | Server holati |
| --- | --- | --- |
| Egasi | Brauzer | Server |
| Eskiradimi | Yo'q | Ha |
| Boshqa foydalanuvchi o'zgartira oladimi | Yo'q | Ha |
| Misol | Modal ochiq, forma qoralamasi | Mahsulotlar ro'yxati |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hosila qiymatni holatda saqlash | Ikki manba, sinxronlik xatolari | Render paytida hisoblang |
| Bir nechta zid boolean | Imkonsiz kombinatsiyalar | `status` birlashmasi |
| Obyekt nusxasini saqlash (tanlangan element) | Eskiradi | ID saqlang |
| Chuqur ichma-ich holat | Yangilash og'ir, xatoga moyil | Tekislang yoki `immer` |
| Server javobini `useState` da keshlash | Eskirish mantiqi qo'lda | So'rov qatlami |
| Props'ni holatga nusxalash | Yangilanmaydi | To'g'ridan-to'g'ri props yoki `key` |
| URL'ga tegishli holatni komponentda saqlash | Ulashib, yangilab bo'lmaydi | `searchParams` |

## Amaliyot

1. Loyihangizdagi bitta komponentni oling va har `useState` uchun "minimal holat" savollarini bering: nechtasi ortiqcha?
2. Uchta boolean holatli yuklash logikasini diskriminatsiyalangan birlashmaga aylantiring.
3. Tanlangan elementni obyekt sifatida saqlang, ro'yxatdagi nusxasini yangilang va eskirishni ko'ring; keyin ID ga o'tkazing.
4. Chuqur ichma-ich holatni yangilaydigan kod yozing, so'ng `immer` bilan solishtiring.
5. `useState` + `useEffect` bilan yozilgan ma'lumot yuklashni sanab chiqing: qancha holat va qancha chekka holat qo'lda yozilgan?

## Rasmiy hujjat

- Holat tuzilmasini tanlash: <https://react.dev/learn/choosing-the-state-structure>
- Holatni ko'tarish: <https://react.dev/learn/sharing-state-between-components>
