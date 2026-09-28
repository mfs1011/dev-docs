# 16 — `useState`

[← Oldingi: Uslublar](15-uslublar.md) · [Mundarija](README.md) · [Keyingi: Holatni to'g'ri loyihalash →](17-holat-dizayni.md)

## Tushuncha

`useState` — komponentga **xotira** beradi: renderlar orasida saqlanadigan qiymat.

::: ts
```tsx
const [count, setCount] = useState(0)
//     ↑ joriy qiymat
//            ↑ yangilash funksiyasi
//                        ↑ boshlang'ich qiymat (faqat birinchi renderda)
```
:::

::: js
```jsx
const [count, setCount] = useState(0)
//     ↑ joriy qiymat
//            ↑ yangilash funksiyasi
//                        ↑ boshlang'ich qiymat (faqat birinchi renderda)
```
:::

Ikki narsa muhim:

1. **Boshlang'ich qiymat faqat birinchi renderda o'qiladi** — keyingi renderlarda e'tiborsiz qoldiriladi;
2. **`setCount` chaqiruvi qayta renderni rejalashtiradi** — qiymat darhol o'zgarmaydi (05-bob).

## Kod: turli qiymat turlari

::: ts
```tsx
const [name, setName] = useState('')                          // string
const [count, setCount] = useState(0)                         // number
const [isOpen, setIsOpen] = useState(false)                   // boolean
const [user, setUser] = useState<User | null>(null)           // obyekt yoki null
const [items, setItems] = useState<Item[]>([])                // massiv
const [status, setStatus] = useState<'idle' | 'loading'>('idle')  // birlashma
```
:::

::: js
```jsx
const [name, setName] = useState('')
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [user, setUser] = useState(null)
const [items, setItems] = useState([])
const [status, setStatus] = useState('idle')
```
:::

## Kod: funksional yangilash

Yangi qiymat eskisiga bog'liq bo'lsa — **har doim funksional shakl**:

```jsx
setCount(count + 1)          // ✗ shu render suratidagi qiymatdan
setCount((c) => c + 1)       // ✓ eng so'nggi qiymatdan
```

Farq qachon ko'rinadi:

```jsx
function handleClick() {
  setCount(count + 1)
  setCount(count + 1)        // natija: +1
}

function handleClickCorrect() {
  setCount((c) => c + 1)
  setCount((c) => c + 1)     // natija: +2
}
```

Va async kodda:

```jsx
async function handleSave() {
  await api.save()
  setCount(count + 1)        // ✗ `count` — so'rovdan OLDINGI qiymat
  setCount((c) => c + 1)     // ✓
}
```

Amaliy qoida: **shubha bo'lsa, funksional shaklni ishlating** — u hech qachon noto'g'ri bo'lmaydi.

## Kod: lazy boshlang'ich qiymat

```jsx
// ✗ Har renderda `JSON.parse` ishlaydi (natija faqat birinchi marta ishlatiladi)
const [settings, setSettings] = useState(JSON.parse(localStorage.getItem('settings') ?? '{}'))

// ✓ Funksiya — faqat birinchi renderda chaqiriladi
const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('settings') ?? '{}'))
```

Farq: birinchi variantda argument **har renderda hisoblanadi** (keyin tashlab yuboriladi). Og'ir hisob yoki `localStorage` o'qish bo'lsa — sezilarli isrof.

## Kod: obyekt va massiv holati

React holatni **immutable** deb hisoblaydi (01, 05-bob): yangi qiymat — yangi havola.

```jsx
// Obyekt
setUser({ ...user, name: 'Yangi' })
setUser((u) => ({ ...u, name: 'Yangi' }))

// Ichma-ich obyekt
setForm((f) => ({ ...f, address: { ...f.address, city: 'Toshkent' } }))

// Massiv: qo'shish
setItems((prev) => [...prev, newItem])
setItems((prev) => [newItem, ...prev])              // boshiga

// Massiv: o'chirish
setItems((prev) => prev.filter((i) => i.id !== id))

// Massiv: yangilash
setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: true } : i)))

// Massiv: tartiblash (nusxa bilan!)
setItems((prev) => [...prev].sort((a, b) => a.order - b.order))
setItems((prev) => prev.toSorted((a, b) => a.order - b.order))
```

Mutatsiya qiladigan metodlar (`push`, `splice`, `sort`, `reverse`) — to'g'ridan-to'g'ri **ishlatilmaydi**:

```jsx
// ✗ Havola o'zgarmadi — React qayta render qilmaydi
items.push(newItem)
setItems(items)
```

Chuqur ichma-ich tuzilmalarda `immer` yordam beradi:

```jsx
import { produce } from 'immer'

setForm(produce((draft) => {
  draft.address.city = 'Toshkent'
  draft.tags.push('yangi')
}))
```

## Kod: bir nechta holat yoki bitta obyekt

::: ts
```tsx
// Variant A: alohida holatlar — mustaqil o'zgaradigan qiymatlar uchun
const [name, setName] = useState('')
const [email, setEmail] = useState('')

// Variant B: bitta obyekt — birga o'zgaradigan qiymatlar uchun
const [form, setForm] = useState({ name: '', email: '' })

function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
  setForm((f) => ({ ...f, [key]: value }))
}

<input value={form.name} onChange={(e) => update('name', e.target.value)} />
```
:::

::: js
```jsx
// Variant A: alohida holatlar — mustaqil o'zgaradigan qiymatlar uchun
const [name, setName] = useState('')
const [email, setEmail] = useState('')

// Variant B: bitta obyekt — birga o'zgaradigan qiymatlar uchun
const [form, setForm] = useState({ name: '', email: '' })

function update(key, value) {
  setForm((f) => ({ ...f, [key]: value }))
}

<input value={form.name} onChange={(e) => update('name', e.target.value)} />
```
:::

Mezon: **birga o'zgaradigan va birga ma'no beradigan qiymatlar** — bitta obyektda. Forma maydonlari — odatda bitta obyekt; ochiq/yopiq holat va qidiruv matni — alohida.

Holat 4–5 maydondan oshsa va o'tishlar murakkablashsa — `useReducer` (19-bob).

## Kod: holatni tiklash (`key`)

```jsx
{/* Foydalanuvchi almashganda forma tozalansin (09-bob) */}
<ProfileForm key={userId} userId={userId} />
```

Bu `useEffect` bilan qo'lda tozalashdan toza:

```jsx
// ✗ Ortiqcha effekt
useEffect(() => {
  setName('')
  setEmail('')
}, [userId])
```

## Muhandislik nuqtai nazari: props'dan holat yaratish

Eng ko'p uchraydigan tuzoqlardan biri:

```jsx
// ✗ Props o'zgarsa, holat yangilanmaydi
function Editor({ initialTitle }) {
  const [title, setTitle] = useState(initialTitle)
  // initialTitle keyin o'zgarsa — `title` eski qiymatda qoladi
}
```

Bu **ba'zan to'g'ri** (ataylab "boshlang'ich qiymat" semantikasi), lekin ko'pincha xato. Uch yechim:

| Ehtiyoj | Yechim |
| --- | --- |
| Props o'zgarsa holat tiklansin | `key` bilan komponentni qayta yaratish |
| Qiymat butunlay props'dan kelsin | Holat kerak emas — to'g'ridan-to'g'ri props |
| Ota boshqarsin, bola faqat ko'rsatsin | Controlled komponent (18-bob) |

Nomlash konvensiyasi yordam beradi: `initialX` — faqat boshlang'ich qiymat, `x` — doimiy manba.

## Muhandislik nuqtai nazari: holat qayerda yashashi kerak

React'dagi asosiy arxitektura savoli (17, 37-bobda davom etadi):

| Ma'lumot | Joyi |
| --- | --- |
| Input matni, modal ochiqligi, hover | Komponent ichida |
| Ikki aka-uka komponentga kerak | Umumiy otada (18-bob) |
| Filtr, sahifa, tanlangan tab | URL (35-bob) |
| Server ma'lumoti (ro'yxat, detal) | So'rov keshi (32-bob) |
| Foydalanuvchi, tema, savat | Global store yoki context (20, 36-bob) |

Qoida: **holatni ishlatiladigan joyga eng yaqin saqlang**, lekin barcha muhtojlar ko'radigan darajada yuqorida.

## Muhandislik nuqtai nazari: batching va `flushSync`

React 18+ da barcha yangilanishlar guruhlanadi — hodisalarda ham, `setTimeout` va promise ichida ham:

```jsx
setA(1)
setB(2)
setC(3)
// Bitta render
```

Kamdan-kam hollarda DOM'ni darhol yangilash kerak bo'ladi (masalan o'lchash uchun):

```jsx
import { flushSync } from 'react-dom'

flushSync(() => {
  setItems([...items, newItem])
})

// Endi DOM yangilangan
listRef.current.scrollTop = listRef.current.scrollHeight
```

`flushSync` — unumdorlikka zarar, shuning uchun faqat zarurat bo'lganda.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `setCount(count + 1)` ketma-ket bir necha marta | Hammasi bir xil suratdan | `setCount(c => c + 1)` |
| `setState` dan keyin darhol qiymatni o'qish | Navbatga qo'yilgan | Keyingi render yoki funksional shakl |
| Holatni mutatsiya qilish (`push`, `sort`) | Havola o'zgarmaydi | Yangi massiv/obyekt |
| `useState(expensiveCalc())` | Har renderda hisoblanadi | `useState(() => expensiveCalc())` |
| Props'dan holat yaratib, yangilanishini kutish | `useState` faqat birinchi renderda o'qiydi | `key` yoki controlled |
| Hosila qiymatni holatda saqlash | Ikki manba | Render paytida hisoblang (17-bob) |
| 10 ta alohida `useState` bir formada | Har o'zgarishda 10 joyga tegish | Bitta obyekt yoki `useReducer` |

## Amaliyot

1. Sanoq komponentida `setCount(count + 1)` ni uch marta chaqiring, keyin funksional shaklga o'tkazing — natijani solishtiring.
2. `localStorage` dan o'qiydigan holatni avval oddiy, keyin lazy boshlang'ich qiymat bilan yozing; `console.log` bilan necha marta o'qilishini tekshiring.
3. Ichma-ich obyekt holatini yangilang (`form.address.city`), keyin xuddi shuni `immer` bilan qiling.
4. `initialTitle` props'dan holat yaratib, ota qiymatni o'zgartiring — nima bo'ladi? Keyin `key` bilan tuzating.
5. Ro'yxatga element qo'shgandan keyin pastga scroll qiling — `flushSync` siz va bilan solishtiring.

## Rasmiy hujjat

- `useState`: <https://react.dev/reference/react/useState>
- Holat — surat: <https://react.dev/learn/state-as-a-snapshot>
- Obyekt holatni yangilash: <https://react.dev/learn/updating-objects-in-state>
- Massiv holatni yangilash: <https://react.dev/learn/updating-arrays-in-state>
