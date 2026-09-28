# 01 — React nima va nega shunday

[Mundarija](README.md) · [Keyingi: O'rnatish va ishga tushirish →](02-ornatish-va-ishga-tushirish.md)

## Tushuncha

React — foydalanuvchi interfeysi quradigan JavaScript kutubxonasi. Uning butun g'oyasi bitta formulaga sig'adi:

```
UI = f(state)
```

Ekranda ko'ringan narsa — holatning funksiyasi. Holat o'zgarsa, React funksiyani qayta chaqiradi va yangi natijani eskisi bilan solishtirib, DOM'ni kerakli joyida yangilaydi.

Vue'dan (agar tanish bo'lsa) asosiy farq shu yerda: Vue qaysi qiymat qayerda ishlatilganini **kuzatadi**, React esa komponentni **butunlay qayta ishga tushiradi**. Ikkala yondashuv ham ishlaydi, lekin ularning oqibatlari boshqacha — 06-bobda batafsil.

## Nega shunday: imperativdan deklarativga

Vanilla JS bilan yozilgan oddiy sanoq:

```js
let count = 0

const output = document.getElementById('output')

document.getElementById('btn').addEventListener('click', () => {
  count++
  output.textContent = count        // ← qo'lda sinxronlash
})
```

Bu yerda ikkita haqiqat bor: `count` o'zgaruvchisi va DOM'dagi matn. Ularni bir xil ushlab turish — dasturchining ishi. 3 ta holat va 10 ta elementda bu ish kombinatoriyaga aylanadi.

React'da:

::: ts
```tsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Bosildi: {count} marta</p>
      <button onClick={() => setCount(count + 1)}>Bosish</button>
    </div>
  )
}
```
:::

::: js
```jsx
import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Bosildi: {count} marta</p>
      <button onClick={() => setCount(count + 1)}>Bosish</button>
    </div>
  )
}
```
:::

DOM'ni yangilaydigan qator yo'q. Siz faqat "shu holatda ekran shunday ko'rinadi" deb yozasiz.

## Nega shunday: komponent — funksiya

React'da komponent — oddiy JavaScript funksiyasi. U props qabul qiladi va **nima ko'rinishi kerakligini** (JSX) qaytaradi:

::: ts
```tsx
type GreetingProps = {
  name: string
  isAdmin?: boolean
}

function Greeting({ name, isAdmin = false }: GreetingProps) {
  return (
    <h1>
      Salom, {name}
      {isAdmin && <span className="badge">admin</span>}
    </h1>
  )
}

// Ishlatish
<Greeting name="Aziz" isAdmin />
```
:::

::: js
```jsx
function Greeting({ name, isAdmin = false }) {
  return (
    <h1>
      Salom, {name}
      {isAdmin && <span className="badge">admin</span>}
    </h1>
  )
}

// Ishlatish
<Greeting name="Aziz" isAdmin />
```
:::

Bundan uchta natija kelib chiqadi:

1. **Komponentlar oddiy qiymat qaytaradi** — ularni massivga solish, funksiyaga uzatish, shart bilan tanlash mumkin;
2. **Shablon tili yo'q** — sikl `map`, shart `if`/ternar, ya'ni JavaScript'ning o'zi;
3. **Har render — funksiyaning yangi chaqiruvi** — ichidagi barcha o'zgaruvchi va funksiyalar qaytadan yaratiladi. Bu React'dagi ko'p tushunmovchilikning ildizi (05, 22-bob).

## Kod: birinchi to'liq komponent

::: ts
```tsx
import { useState } from 'react'

type Todo = {
  id: number
  title: string
  done: boolean
}

export function TodoList() {
  const [items, setItems] = useState<Todo[]>([
    { id: 1, title: 'Sut olish', done: true },
    { id: 2, title: 'React o\'rganish', done: false },
  ])
  const [draft, setDraft] = useState('')

  const pending = items.filter((item) => !item.done)

  function add(event: React.FormEvent) {
    event.preventDefault()

    const title = draft.trim()
    if (!title) return

    setItems([...items, { id: Date.now(), title, done: false }])
    setDraft('')
  }

  function toggle(id: number) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  return (
    <section>
      <h2>Vazifalar ({pending.length} ta bajarilmagan)</h2>

      <form onSubmit={add}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Yangi vazifa" />
        <button type="submit">Qo'shish</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
              {item.title}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
```
:::

::: js
```jsx
import { useState } from 'react'

export function TodoList() {
  const [items, setItems] = useState([
    { id: 1, title: 'Sut olish', done: true },
    { id: 2, title: 'React o\'rganish', done: false },
  ])
  const [draft, setDraft] = useState('')

  const pending = items.filter((item) => !item.done)

  function add(event) {
    event.preventDefault()

    const title = draft.trim()
    if (!title) return

    setItems([...items, { id: Date.now(), title, done: false }])
    setDraft('')
  }

  function toggle(id) {
    setItems(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
  }

  return (
    <section>
      <h2>Vazifalar ({pending.length} ta bajarilmagan)</h2>

      <form onSubmit={add}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Yangi vazifa" />
        <button type="submit">Qo'shish</button>
      </form>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={item.done} onChange={() => toggle(item.id)} />
              {item.title}
            </label>
          </li>
        ))}
      </ul>
    </section>
  )
}
```
:::

Shu 40 qatorda React'ning kundalik lug'ati bor: holat, hosila qiymat, hodisa, ro'yxat, `key`, controlled input, immutable yangilash. Har biri keyingi boblarda alohida ochiladi.

## Muhandislik nuqtai nazari: immutability nega majburiy

E'tibor bering, `setItems` ga **yangi massiv** berildi:

```js
setItems([...items, newItem])                     // ✓
items.push(newItem); setItems(items)              // ✗ — React o'zgarishni sezmaydi
```

Sabab: React eski va yangi qiymatni `Object.is` bilan solishtiradi. Agar massiv o'zgartirilsa-yu, havola bir xil qolsa, React "hech narsa o'zgarmadi" deb qaror qiladi va qayta render qilmaydi.

Bu — React'ning butun modeli uchun tayanch nuqta: **holat o'zgarishi = yangi qiymat.** Shu tufayli:

- Render natijasi oldindan aytiladigan bo'ladi;
- Eski holatni saqlash (undo/redo, vaqt bo'ylab sayohat) oson;
- Solishtirish arzon (havolalar taqqoslanadi, chuqur tekshiruv emas).

Narxi — har o'zgarishda nusxa yasash. Amalda bu deyarli sezilmaydi; juda katta tuzilmalarda `immer` yoki normalizatsiya (17-bob) yordam beradi.

## Muhandislik nuqtai nazari: React 19 nima olib keldi

| Imkoniyat | Nima beradi | Bob |
| --- | --- | --- |
| **Server Components** | Komponentni serverda render qilish, JS bundle'ga tushmaydi | Next kitobi |
| **Actions** | `async` funksiyani to'g'ridan-to'g'ri formaga berish | 25 |
| **`useActionState`, `useFormStatus`, `useOptimistic`** | Forma holati va optimistik yangilash | 25 |
| **`use()`** | Promise va context'ni render ichida o'qish | 24 |
| **`ref` — oddiy prop** | `forwardRef` endi kerak emas | 21 |
| **Metadata teglari** | `<title>`, `<meta>` komponent ichida | 48 |
| **React Compiler** | Avtomatik memoizatsiya (`useMemo` kamayadi) | 07 |

React 18 da yozilgan kod 19 da ishlaydi. Eng sezilarli amaliy o'zgarish — `forwardRef` va qo'lda memoizatsiyaning kamayishi.

## Muhandislik nuqtai nazari: React yoki boshqasi

"React yaxshimi yoki Vue?" — foydasiz savol. To'g'ri mezonlar:

| Mezon | React holati |
| --- | --- |
| Ish bozori | Eng katta; ayniqsa xalqaro |
| Ekotizm | Eng keng: har muammoga bir necha kutubxona |
| Rasmiy yechimlar | Kam: router, store, forma — uchinchi tomondan (tanlov ko'p, bahs ham ko'p) |
| Mobil | React Native — bir xil model |
| Kirish narxi | O'rtacha: JSX oson, lekin render modeli va effektlar chalkash |
| Frameworksiz ishlatish | Mumkin (Vite SPA), lekin ekotizm Next tomon suriladi |
| Server tomoni | RSC — eng ilg'or, lekin murakkab |

React tanlashning eng kuchli sababi — **ekotizm va ish bozori**. Eng kuchli sabab qarshi — arxitektura qarorlarini o'zingiz qabul qilishingiz kerak: qaysi router, qaysi store, qaysi forma kutubxonasi, qanday papka tuzilmasi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Holatni mutatsiya qilish (`items.push`) | React o'zgarishni sezmaydi | Yangi massiv/obyekt |
| DOM'ni qo'lda o'zgartirish (`getElementById`) | Keyingi renderda bekor bo'ladi | Holat orqali |
| `class` yozish (`className` o'rniga) | JSX — JavaScript, `class` — zaxiralangan so'z | `className` |
| Hosila qiymatni holatda saqlash | Ikki manba, sinxronlik muammosi | Render paytida hisoblang (17-bob) |
| React 16–17 bo'yicha eski maqolalarga tayanish | Sinf komponentlar, `componentDidMount` eskirgan | `react.dev` (yangi hujjat) |
| "React — framework" deb kutish | Router/store yo'q | Ekotizmni o'zingiz yig'asiz yoki Next olasiz |

## Amaliyot

1. Yuqoridagi `TodoList` ni yozing va ishga tushiring (02-bobdan keyin qaytib keling).
2. `setItems([...items, item])` o'rniga `items.push(item)` yozib ko'ring — ekran yangilanmasligini tasdiqlang.
3. `pending` ni alohida `useState` da saqlashga urinib ko'ring va nega bu yomon ekanini yozib qo'ying (javob 17-bobda).
4. Yuqoridagi almashtirgichni bosib, bir xil kodni TypeScript va JavaScript ko'rinishida solishtiring.

## Rasmiy hujjat

- React hujjati: <https://react.dev/learn>
- Tez boshlash: <https://react.dev/learn/tutorial-tic-tac-toe>
- React 19 e'loni: <https://react.dev/blog/2024/12/05/react-19>
