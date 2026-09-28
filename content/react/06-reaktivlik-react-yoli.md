# 06 — Reaktivlik: React yo'li

[← Oldingi: Render modeli](05-render-modeli.md) · [Mundarija](README.md) · [Keyingi: React Compiler →](07-react-compiler.md)

## Tushuncha

"Reaktivlik" — ma'lumot o'zgarganda interfeys o'zi yangilanishi. Buning ikki maktabi bor:

| Maktab | Kim | Mexanizm |
| --- | --- | --- |
| **Qayta ishga tushirish** | React | Holat o'zgardi → komponent funksiyasi qayta chaqiriladi → natija solishtiriladi |
| **Kuzatuv (signal)** | Vue, Solid, Svelte 5, Angular signals | Qiymat o'qilganda kim o'qiganini eslab qoladi → o'zgarganda faqat o'sha joy yangilanadi |

React ataylab birinchi yo'lni tanlagan. Bu bobda **nega** shunday qilingani va bu qanday amaliy oqibatlarga olib kelishi ko'riladi — chunki React'dagi ko'p "g'alati" narsalar aynan shundan kelib chiqadi.

## Nega shunday: React'ning tanlovi

Signal modelida qiymat o'ralgan bo'lishi kerak:

```js
// Vue
const count = ref(0)
count.value++              // .value orqali — chunki o'zgarish kuzatilishi kerak

// Solid
const [count, setCount] = createSignal(0)
count()                    // funksiya chaqiruvi
```

React esa oddiy qiymat beradi:

```js
const [count, setCount] = useState(0)
count                      // oddiy son, hech qanday o'ram yo'q
```

Narxi: React `count` o'zgarganini **kuzata olmaydi**, shuning uchun siz `setCount` orqali aniq xabar berasiz va React butun komponentni qayta chaqiradi.

Yutuq — **model soddaligi**: komponent ichida hech qanday "sehrli" obyekt yo'q, faqat oddiy JavaScript qiymatlari. Shuning uchun React'da closure, `map`, shartlar va oddiy funksiyalar hech qanday maxsus qoidasiz ishlaydi.

Chalkashlik esa boshqa joyda paydo bo'ladi: har render yangi funksiya va obyektlar yaratadi, natijada memoizatsiya kerak bo'lib qoladi (22-bob).

## Kod: ikki modelni yonma-yon ko'rish

Bir xil vazifa — filtrlangan ro'yxat:

```js
// Vue (signal/kuzatuv)
const items = ref([])
const query = ref('')

// `filtered` faqat items yoki query o'zgarganda qayta hisoblanadi
const filtered = computed(() => items.value.filter((i) => i.title.includes(query.value)))
```

::: ts
```tsx
// React (qayta ishga tushirish)
function List() {
  const [items, setItems] = useState<Item[]>([])
  const [query, setQuery] = useState('')

  // Har renderda qayta hisoblanadi — va bu odatda MUAMMO EMAS
  const filtered = items.filter((i) => i.title.includes(query))

  return <ul>{filtered.map((i) => <li key={i.id}>{i.title}</li>)}</ul>
}
```
:::

::: js
```jsx
// React (qayta ishga tushirish)
function List() {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState('')

  // Har renderda qayta hisoblanadi — va bu odatda MUAMMO EMAS
  const filtered = items.filter((i) => i.title.includes(query))

  return <ul>{filtered.map((i) => <li key={i.id}>{i.title}</li>)}</ul>
}
```
:::

Vue'da `computed` keshlanadi; React'da esa hisob har renderda takrorlanadi. 1 000 elementgacha bu sezilmaydi. Katta bo'lsa — `useMemo` (22-bob) yoki React Compiler (07-bob).

## Kod: nega `.value` yo'q, lekin `useState` bor

React holatni **komponent nusxasiga bog'langan ro'yxatda** saqlaydi. `useState` chaqiruvining tartibi shu ro'yxatdagi indeksni belgilaydi:

```tsx
function Profile() {
  const [name, setName] = useState('')       // slot 0
  const [age, setAge] = useState(0)          // slot 1

  if (someCondition) {
    const [x, setX] = useState(0)            // ✗ TAQIQLANGAN
  }
}
```

Shuning uchun **hooklar qoidasi** mavjud:

1. Hooklarni faqat komponent yoki boshqa hook ichida chaqiring;
2. Faqat **yuqori darajada** — shart, sikl yoki `return` dan keyin emas.

Sabab endi aniq: shart bo'lsa, chaqiruvlar tartibi renderlar orasida o'zgaradi va React qaysi holat qaysi hookka tegishli ekanini aniqlay olmaydi. ESLint plugini (`eslint-plugin-react-hooks`) buni avtomatik tekshiradi (46-bob).

## Kod: "reaktivlik" React'da qanday ko'rinadi

Signal dunyosidagi `watch` ning React'dagi ekvivalenti — `useEffect` **emas**. Ko'p boshlovchi shu joyda adashadi:

::: ts
```tsx
// ✗ Vue'dagi watch kabi ishlatishga urinish
const [items, setItems] = useState<Item[]>([])
const [count, setCount] = useState(0)

useEffect(() => {
  setCount(items.length)          // keraksiz effekt + ortiqcha render
}, [items])

// ✓ React yo'li: hosila qiymat — oddiy o'zgaruvchi
const count = items.length
```
:::

::: js
```jsx
// ✗ Vue'dagi watch kabi ishlatishga urinish
const [items, setItems] = useState([])
const [count, setCount] = useState(0)

useEffect(() => {
  setCount(items.length)          // keraksiz effekt + ortiqcha render
}, [items])

// ✓ React yo'li: hosila qiymat — oddiy o'zgaruvchi
const count = items.length
```
:::

Qoida: **`useEffect` — tashqi tizim bilan sinxronlash uchun** (tarmoq, DOM API, kutubxona), hosila qiymat uchun emas. 28-bob shu mavzuga to'liq bag'ishlangan.

## Kod: bir xil natija, uch xil yo'l

Boshqa framework'lardan kelganlar uchun tarjima jadvali:

| Vue / Svelte | React |
| --- | --- |
| `ref(0)` | `useState(0)` |
| `computed(() => a + b)` | `const c = a + b` (yoki `useMemo`) |
| `watch(x, fn)` | Odatda **kerak emas**; kerak bo'lsa `useEffect([x])` |
| `watchEffect(fn)` | `useEffect(fn)` bog'liqliklarsiz — ehtiyot bo'ling |
| `onMounted` | `useEffect(fn, [])` |
| `onUnmounted` | `useEffect(() => () => cleanup(), [])` |
| `provide/inject` | `createContext` + `useContext` |
| Direktivalar (`v-if`, `v-for`) | Oddiy JS: ternar, `map` |
| `nextTick` | `flushSync` yoki `useEffect` |

Eng muhim qatorlar — 3 va 4: React'da `watch` ekvivalentini izlash deyarli har doim keraksiz effektga olib keladi.

## Muhandislik nuqtai nazari: render narxi haqiqatan qancha

"Har renderda butun komponent qayta ishlaydi" — qo'rqinchli eshitiladi. Amaldagi raqamlar:

| Ish | Taxminiy narx |
| --- | --- |
| Komponent funksiyasini chaqirish | Mikrosoniyalar |
| 100 elementli `map` va JSX yaratish | < 1 ms |
| Virtual daraxtni solishtirish | < 1 ms (kichik daraxt) |
| DOM'ni yangilash | Eng qimmat qism, lekin faqat farq |
| Layout/paint | Brauzer ishi, odatda eng katta ulush |

Ya'ni render odatda **muammo emas**. Muammo bo'ladigan joylar: 1 000+ elementli ro'yxatlar, har renderda og'ir hisob, chuqur daraxtda keng tarqaladigan context yangilanishi (20, 41-bob).

Shuning uchun optimizatsiya tartibi: **avval o'lchang** (React DevTools Profiler), keyin memoizatsiya.

## Muhandislik nuqtai nazari: signal'lar React'ga kelyaptimi

React jamoasi signal'larni komponent modelining bir qismi qilishni rejalashtirmagan. O'rniga ular **React Compiler** yo'lini tanladi: kod o'zgarmaydi, kompilyator memoizatsiyani o'zi qo'shadi (07-bob).

Amaliy xulosa: React'da "signal'lar kelishini" kutib turish o'rniga, hozirgi modelni tushunib ishlash kerak — `useState`, hosila qiymatlar va kerak bo'lganda memoizatsiya.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hosila qiymat uchun `useEffect` + `setState` | Ikki render, sinxronlik muammosi | Oddiy o'zgaruvchi |
| Hooklarni shart ichida chaqirish | Tartib buziladi, React chalkashadi | Yuqori darajada |
| `useEffect` ni `watch` deb tushunish | Keraksiz effektlar zanjiri | 28-bob |
| Har render uchun `useMemo` qo'yish | Qo'shimcha xotira va murakkablik | O'lchang, keyin qo'ying |
| Holatni mutatsiya qilib `setState` chaqirish | Havola bir xil — React sezmaydi | Yangi qiymat |
| "React sekin" deb Vue/Solid bilan taqqoslash | Kontekstsiz taqqoslash foydasiz | O'z ilovangizni profiling qiling |

## Amaliyot

1. Filtrlangan ro'yxatni `useMemo` siz yozing, 10 000 element bilan sinang va Profiler'da vaqtni o'lchang. Keyin `useMemo` qo'shib solishtiring.
2. Hosila holatni `useEffect` bilan saqlaydigan kod yozing, keyin uni oddiy o'zgaruvchiga aylantiring — nechta render kamaydi?
3. Hookni `if` ichiga qo'yib ko'ring va React bergan xatoni o'qing.
4. Vue yoki Svelte'da yozilgan kichik komponentni React'ga o'girib, yuqoridagi tarjima jadvalini amalda sinang.

## Rasmiy hujjat

- Holat: <https://react.dev/learn/state-a-components-memory>
- Hooklar qoidalari: <https://react.dev/reference/rules/rules-of-hooks>
- Effekt kerak emas: <https://react.dev/learn/you-might-not-need-an-effect>
