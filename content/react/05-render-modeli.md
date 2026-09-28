# 05 — Render modeli: mental model

[← Oldingi: React'dan foydalanish usullari](04-foydalanish-usullari.md) · [Mundarija](README.md) · [Keyingi: Reaktivlik: React yo'li →](06-reaktivlik-react-yoli.md)

## Tushuncha

React'dagi ko'p chalkashlik bitta narsani noto'g'ri tasavvur qilishdan kelib chiqadi: **komponent nima qiladi?**

To'g'ri javob: komponent — bu **suratga oluvchi funksiya**. U joriy props va holat bilan chaqiriladi va "shu daqiqada ekran shunday ko'rinishi kerak" degan tavsifni qaytaradi.

React uni uch bosqichda ishlatadi:

```
1. Trigger  — nimadir o'zgardi (holat yangilandi yoki ota qayta render bo'ldi)
2. Render   — React komponent funksiyasini chaqiradi va natijani oladi
3. Commit   — natija eskisi bilan solishtiriladi va DOM'ga faqat farq yoziladi
```

Muhimi: **render ≠ DOM yangilanishi.** Komponent 10 marta render bo'lib, DOM'da hech narsa o'zgarmasligi mumkin.

## Kod: har render — yangi dunyo

::: ts
```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // Har renderda BU QATOR qaytadan bajariladi
  const doubled = count * 2

  // Har renderda YANGI funksiya obyekti yaratiladi
  function handleClick() {
    setCount(count + 1)
  }

  console.log('render:', count)      // har renderda chiqadi

  return <button onClick={handleClick}>{count} / {doubled}</button>
}
```
:::

::: js
```jsx
function Counter() {
  const [count, setCount] = useState(0)

  // Har renderda BU QATOR qaytadan bajariladi
  const doubled = count * 2

  // Har renderda YANGI funksiya obyekti yaratiladi
  function handleClick() {
    setCount(count + 1)
  }

  console.log('render:', count)      // har renderda chiqadi

  return <button onClick={handleClick}>{count} / {doubled}</button>
}
```
:::

Bu — Vue yoki Svelte'dan kelgan odam uchun eng katta farq. U yerda `setup` bir marta ishlaydi; React'da esa **funksiya har renderda boshidan** bajariladi.

Shundan kelib chiqadigan natijalar:

1. Komponent ichidagi oddiy o'zgaruvchi renderlar orasida **saqlanmaydi** — saqlanishi kerak bo'lsa `useState` yoki `useRef` (16, 21-bob);
2. Har renderda yangi funksiya va obyekt yaratiladi — bu `useCallback`/`useMemo` mavzusining ildizi (22-bob);
3. Komponent **toza** bo'lishi kerak: bir xil kirish → bir xil chiqish, nojo'ya ta'sirsiz.

## Kod: holat "suratga tushgan" bo'ladi

::: ts
```tsx
function Delayed() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)

    setTimeout(() => {
      alert(count)        // ← 3 soniyadan keyin ham ESKI qiymat
    }, 3000)
  }

  return <button onClick={handleClick}>{count}</button>
}
```
:::

::: js
```jsx
function Delayed() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1)

    setTimeout(() => {
      alert(count)        // ← 3 soniyadan keyin ham ESKI qiymat
    }, 3000)
  }

  return <button onClick={handleClick}>{count}</button>
}
```
:::

Sabab: `handleClick` — o'sha renderning funksiyasi va u o'sha renderning `count` qiymatini "yopib olgan" (closure). Keyingi render yangi funksiya yaratadi, lekin eski `setTimeout` eski funksiyani ushlab turadi.

Bu **xato emas, model**: har render o'z holat suratiga ega. Yangi qiymat kerak bo'lsa — funksional shakl:

```ts
setCount((prev) => prev + 1)          // React eng so'nggi qiymatni beradi
```

## Kod: yangilanishlar guruhlanadi (batching)

::: ts
```tsx
function handleClick() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
  // Natija: +1 (hammasi bir xil `count` dan hisoblandi)
}

function handleClickCorrect() {
  setCount((c) => c + 1)
  setCount((c) => c + 1)
  setCount((c) => c + 1)
  // Natija: +3
}
```
:::

::: js
```jsx
function handleClick() {
  setCount(count + 1)
  setCount(count + 1)
  setCount(count + 1)
  // Natija: +1 (hammasi bir xil `count` dan hisoblandi)
}

function handleClickCorrect() {
  setCount((c) => c + 1)
  setCount((c) => c + 1)
  setCount((c) => c + 1)
  // Natija: +3
}
```
:::

React holat yangilanishlarini **navbatga qo'yadi** va hodisa ishlov beruvchisi tugagach bir marta render qiladi. React 18+ da bu `setTimeout`, promise va native hodisalarda ham ishlaydi (automatic batching).

Amaliy oqibat: `setState` dan keyin darhol yangi qiymatni o'qib bo'lmaydi:

```ts
setCount(count + 1)
console.log(count)         // hali eski qiymat — normal
```

## Kod: render nima uchun qayta ishga tushadi

Komponent uch holatda qayta render bo'ladi:

1. **O'z holati o'zgardi** (`setState`);
2. **Ota qayta render bo'ldi** (props o'zgarmasa ham!);
3. **Ishlatgan context qiymati o'zgardi** (20-bob).

Ikkinchi punkt ko'pchilikni hayron qoldiradi:

::: ts
```tsx
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child />           {/* props yo'q, lekin baribir qayta render bo'ladi */}
    </div>
  )
}
```
:::

::: js
```jsx
function Parent() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child />           {/* props yo'q, lekin baribir qayta render bo'ladi */}
    </div>
  )
}
```
:::

Bu odatda **muammo emas**: render arzon, DOM esa o'zgarmaydi (commit bosqichida farq topilmaydi). Muammo bo'lsa — `memo`, `useMemo` yoki kompozitsiya (14, 22, 41-bob). React Compiler (07-bob) buni avtomatik hal qiladi.

## Muhandislik nuqtai nazari: toza komponent

React komponentni **toza funksiya** deb hisoblaydi:

```tsx
// ✗ Nojo'ya ta'sir: render paytida tashqi holatni o'zgartiradi
let counter = 0

function Bad() {
  counter++                       // toza emas
  return <p>{counter}</p>
}

// ✗ Render paytida boshqa komponent holatini yangilash
function AlsoBad({ onRender }) {
  onRender()                      // toza emas
  return null
}

// ✓ Faqat hisoblash va qaytarish
function Good({ items }) {
  const total = items.reduce((sum, i) => sum + i.price, 0)

  return <p>{total}</p>
}
```

Nega bu qat'iy talab: React komponentni **bir necha marta chaqirishi**, chaqiruvni bekor qilishi yoki kechiktirishi mumkin (concurrent render, 23-bob). `StrictMode` shu sababli ishlab chiqishda funksiyani ikki marta chaqiradi — nojo'ya ta'sirlar darhol ko'rinsin.

Nojo'ya ta'sir joyi ikkita: **hodisa ishlov beruvchisi** (bosildi, yuborildi) va **effekt** (`useEffect`, 27-bob).

## Muhandislik nuqtai nazari: solishtirish qanday ishlaydi

Commit bosqichida React eski va yangi elementlar daraxtini solishtiradi:

| Holat | Natija |
| --- | --- |
| Element turi bir xil (`<div>` → `<div>`) | DOM tuguni qayta ishlatiladi, faqat o'zgargan atribut yangilanadi |
| Turi boshqa (`<div>` → `<section>`) | Eski tugun o'chiriladi, yangisi yaratiladi (bolalari bilan) |
| Komponent turi bir xil | Holat saqlanadi |
| Komponent turi boshqa | Holat **yo'qoladi** |
| Ro'yxatda `key` bir xil | Element tanildi, holat saqlanadi |
| `key` o'zgardi | Yangi element deb qabul qilinadi, holat yo'qoladi |

Oxirgi ikkitasi 09-bobda batafsil. Ammo bitta amaliy hiyla hozir foydali:

```tsx
{/* Foydalanuvchi almashganda forma holatini tozalash */}
<ProfileForm key={userId} user={user} />
```

`key` o'zgarishi React'ga "bu butunlay boshqa element" deydi va u eski holatni tashlab, yangisini yaratadi.

## Muhandislik nuqtai nazari: `UI = f(state)` amalda nimani anglatadi

Ikki amaliy qoida:

**1. DOM'dan o'qib qaror qabul qilmang.**

```tsx
// ✗
if (document.querySelector('.modal')) { /* ... */ }

// ✓
if (isModalOpen) { /* ... */ }
```

**2. Hosila ma'lumotni holatda saqlamang.**

```tsx
// ✗ Ikki manba — bir kun farq qiladi
const [items, setItems] = useState([])
const [count, setCount] = useState(0)

// ✓ Render paytida hisoblang
const [items, setItems] = useState([])
const count = items.length
```

Vue'da bunga `computed` javob berardi; React'da **shunchaki oddiy o'zgaruvchi** yetarli, chunki funksiya baribir qaytadan ishlaydi. `useMemo` faqat hisob qimmat bo'lganda kerak (22-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `setState` dan keyin darhol yangi qiymatni o'qish | Holat navbatga qo'yilgan | Funksional shakl yoki keyingi render |
| `setCount(count + 1)` ni bir necha marta chaqirish | Hammasi eski qiymatdan hisoblanadi | `setCount(c => c + 1)` |
| Render ichida holat o'zgartirish | Cheksiz sikl | Hodisa yoki effektda |
| Render ichida `fetch` yoki log yuborish | Toza emas, bir necha marta ishlaydi | `useEffect` yoki hodisa |
| Hosila qiymatni `useState` da saqlash | Sinxronlik muammosi | Render paytida hisoblang |
| "Komponent qayta render bo'ldi = sekin" deb o'ylash | Render arzon, DOM o'zgarmasligi mumkin | Profiler bilan o'lchang (41-bob) |
| Closure'dagi eski qiymatdan hayron bo'lish | Har render o'z suratiga ega | Funksional yangilash yoki `useRef` |

## Amaliyot

1. `Counter` da `console.log('render')` qo'ying va tugmani bosib, konsolni kuzating. Keyin `<Child />` qo'shib, unda ham log qo'ying.
2. `setTimeout` ichida `alert(count)` misolini takrorlang va nega eski qiymat chiqishini o'z so'zlaringiz bilan yozing.
3. `setCount(count + 1)` ni uch marta chaqiring, keyin funksional shaklga o'tkazing — natijani solishtiring.
4. Formaga `key={userId}` qo'ying va foydalanuvchi almashganda maydonlar tozalanishini ko'ring.
5. Render ichida `counter++` qiladigan "iflos" komponent yozing va `StrictMode` da nima bo'lishini kuzating.

## Rasmiy hujjat

- Render va commit: <https://react.dev/learn/render-and-commit>
- Holat surati: <https://react.dev/learn/state-as-a-snapshot>
- Komponentlarni toza saqlash: <https://react.dev/learn/keeping-components-pure>
- Yangilanishlarni navbatga qo'yish: <https://react.dev/learn/queueing-a-series-of-state-updates>
