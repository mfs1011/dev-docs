# 28 — Effekt kerak emas

[← Oldingi: `useEffect`: asoslar](27-useeffect-asoslar.md) · [Mundarija](README.md) · [Keyingi: Effekt hayot sikli →](29-effekt-hayot-sikli.md)

## Tushuncha

`useEffect` — React'da eng ko'p noto'g'ri ishlatiladigan hook. Rasmiy hujjatda unga alohida sahifa bag'ishlangan: "You Might Not Need an Effect".

Qoida oddiy: **effekt faqat tashqi tizim bilan sinxronlash uchun** (27-bob). Quyidagi holatlarda u kerak **emas**:

1. Mavjud ma'lumotdan yangi qiymat hisoblash;
2. Foydalanuvchi hodisasiga javob berish;
3. Props o'zgarganda holatni tiklash;
4. Ota'ga xabar berish;
5. Ma'lumot yuklash (odatda kutubxona ishlatiladi).

## Kod: 1 — hosila qiymat

::: ts
```tsx
// ✗ Ortiqcha effekt + ikki render
function Cart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price * i.qty, 0))
  }, [items])
}

// ✓ Render paytida hisoblang
function Cart({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
```
:::

::: js
```jsx
// ✗ Ortiqcha effekt + ikki render
function Cart({ items }) {
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price * i.qty, 0))
  }, [items])
}

// ✓ Render paytida hisoblang
function Cart({ items }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
}
```
:::

Nega yomon: birinchi render eski qiymat bilan chiqadi, keyin effekt ishlaydi, keyin **ikkinchi render**. Foydalanuvchi bir lahza noto'g'ri qiymatni ko'radi.

Hisob qimmat bo'lsa — `useMemo` (22-bob), lekin baribir effekt emas.

## Kod: 2 — hodisaga javob

::: ts
```tsx
// ✗ "Buyurtma yuborilgan bo'lsa, xabar ko'rsat"
useEffect(() => {
  if (isSubmitted) {
    showToast('Buyurtma qabul qilindi')
  }
}, [isSubmitted])

// ✓ Hodisada bevosita
async function handleSubmit() {
  await createOrder(data)
  showToast('Buyurtma qabul qilindi')
}
```
:::

::: js
```jsx
// ✗
useEffect(() => {
  if (isSubmitted) showToast('Buyurtma qabul qilindi')
}, [isSubmitted])

// ✓
async function handleSubmit() {
  await createOrder(data)
  showToast('Buyurtma qabul qilindi')
}
```
:::

Qoida: **"foydalanuvchi bosgani uchun" bo'lgan ish — hodisada; "ekranda ko'rinib turgani uchun" bo'lgan ish — effektda.**

Bu farq muhim, chunki effekt `StrictMode` da va bog'liqlik o'zgarganda qayta ishlaydi — natijada buyurtma ikki marta yaratilishi mumkin.

## Kod: 3 — props o'zgarganda holatni tiklash

::: ts
```tsx
// ✗ Ortiqcha render va sinxronlash mantiqi
function ProfileForm({ userId }: { userId: number }) {
  const [name, setName] = useState('')

  useEffect(() => {
    setName('')
  }, [userId])
}

// ✓ key bilan komponentni qayta yaratish (09, 16-bob)
<ProfileForm key={userId} userId={userId} />
```
:::

::: js
```jsx
// ✗
function ProfileForm({ userId }) {
  const [name, setName] = useState('')

  useEffect(() => {
    setName('')
  }, [userId])
}

// ✓
<ProfileForm key={userId} userId={userId} />
```
:::

Qisman tiklash kerak bo'lsa — render paytida:

```jsx
function List({ items }) {
  const [selection, setSelection] = useState(null)
  const [prevItems, setPrevItems] = useState(items)

  // Render paytida holatni moslashtirish (React buni qo'llab-quvvatlaydi)
  if (items !== prevItems) {
    setPrevItems(items)
    setSelection(null)
  }
}
```

Bu g'alati ko'rinadi, lekin rasmiy hujjat aynan shu naqshni tavsiya qiladi: React bunday yangilanishni darhol qayta render bilan hal qiladi va effektdan tezroq ishlaydi.

## Kod: 4 — ota'ga xabar berish

::: ts
```tsx
// ✗ Ikki qadamda: holat o'zgardi → effekt → ota
function Toggle({ onChange }: { onChange: (v: boolean) => void }) {
  const [isOn, setIsOn] = useState(false)

  useEffect(() => {
    onChange(isOn)
  }, [isOn, onChange])
}

// ✓ Bitta qadamda
function Toggle({ onChange }: { onChange: (v: boolean) => void }) {
  const [isOn, setIsOn] = useState(false)

  function handleClick() {
    const next = !isOn

    setIsOn(next)
    onChange(next)
  }
}
```
:::

::: js
```jsx
// ✗
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  useEffect(() => {
    onChange(isOn)
  }, [isOn, onChange])
}

// ✓
function Toggle({ onChange }) {
  const [isOn, setIsOn] = useState(false)

  function handleClick() {
    const next = !isOn

    setIsOn(next)
    onChange(next)
  }
}
```
:::

Yanada yaxshisi — holatni butunlay otaga ko'tarish (18-bob, controlled komponent).

## Kod: 5 — zanjirli effektlar

::: ts
```tsx
// ✗ Har biri keyingisini qo'zg'atadi — 4 ta render
useEffect(() => { if (card) setGoldCount(c => c + 1) }, [card])
useEffect(() => { if (goldCount > 3) setRound(r => r + 1) }, [goldCount])
useEffect(() => { if (round > 5) setIsGameOver(true) }, [round])

// ✓ Hodisada barcha o'tishlarni birga hisoblang
function handlePlaceCard(nextCard) {
  const nextGold = goldCount + (nextCard.gold ? 1 : 0)
  const nextRound = nextGold > 3 ? round + 1 : round

  setCard(nextCard)
  setGoldCount(nextGold)
  setRound(nextRound)
  setIsGameOver(nextRound > 5)
}
```
:::

::: js
```jsx
// ✗ Zanjir
useEffect(() => { if (card) setGoldCount(c => c + 1) }, [card])
useEffect(() => { if (goldCount > 3) setRound(r => r + 1) }, [goldCount])

// ✓ Hodisada
function handlePlaceCard(nextCard) {
  const nextGold = goldCount + (nextCard.gold ? 1 : 0)
  const nextRound = nextGold > 3 ? round + 1 : round

  setCard(nextCard)
  setGoldCount(nextGold)
  setRound(nextRound)
  setIsGameOver(nextRound > 5)
}
```
:::

Murakkab o'tishlar bo'lsa — `useReducer` (19-bob): u aynan shu muammo uchun yaratilgan.

## Kod: haqiqatan effekt kerak bo'ladigan joylar

```jsx
// ✅ Tashqi tizimga ulanish
useEffect(() => {
  const socket = new WebSocket(url)

  socket.onmessage = (e) => addMessage(JSON.parse(e.data))

  return () => socket.close()
}, [url])

// ✅ Brauzer API'lari
useEffect(() => {
  const observer = new IntersectionObserver(onIntersect)

  observer.observe(ref.current)

  return () => observer.disconnect()
}, [])

// ✅ Tashqi kutubxona
useEffect(() => {
  const map = new maplibregl.Map({ container: ref.current })

  return () => map.remove()
}, [])

// ✅ Analitika (sahifa ko'rildi)
useEffect(() => {
  trackPageView(pathname)
}, [pathname])

// ✅ Global klaviatura yorliqlari
useEffect(() => {
  const onKey = (e) => { if (e.key === 'Escape') close() }

  document.addEventListener('keydown', onKey)

  return () => document.removeEventListener('keydown', onKey)
}, [close])
```

Umumiy belgi: **React'dan tashqaridagi narsa bilan ishlash.**

## Muhandislik nuqtai nazari: tekshiruv ro'yxati

Har `useEffect` yozishdan oldin:

| Savol | Javob → |
| --- | --- |
| Bu qiymatni props/holatdan hisoblab bo'ladimi? | Effekt emas — oddiy o'zgaruvchi |
| Bu foydalanuvchi harakatiga javobmi? | Effekt emas — hodisa |
| Bu ikki holatni sinxron ushlash urinishimi? | Effekt emas — bitta holat yoki reducer |
| Bu props o'zgarganda tozalashmi? | Effekt emas — `key` |
| Bu ma'lumot yuklashmi? | Odatda kutubxona (32-bob) |
| Bu React'dan tashqaridagi tizim bilan ishlashmi? | ✅ Effekt |

## Muhandislik nuqtai nazari: nega bu muhim

Ortiqcha effektlar to'rt muammo keltiradi:

1. **Ortiqcha renderlar** — har effekt `setState` qilsa, yana bir render;
2. **Miltillash** — foydalanuvchi bir lahza eski/noto'g'ri holatni ko'radi;
3. **Poyga holatlari** — async effektlar tartibsiz tugaydi (29-bob);
4. **Ikki marta bajarilish** — `StrictMode` va bog'liqlik o'zgarishida.

Uchinchi va to'rtinchisi production'da "goh-goh chiqadigan" xatolar sifatida namoyon bo'ladi — ular eng qimmat xatolar.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Hosila qiymat uchun effekt | Ikki render, miltillash | Render paytida hisoblang |
| Hodisa mantiqini effektda yozish | Ikki marta ishlashi mumkin | Hodisa ishlov beruvchisi |
| Zanjirli effektlar | N ta ortiqcha render | Bitta hodisada hisoblang |
| Props'ni holatga sinxronlash | Ortiqcha kod | `key` yoki controlled |
| Ota'ga xabar berish uchun effekt | Kechikish | Hodisada `onChange` chaqiring |
| Ma'lumot yuklashni qo'lda yozish | Kesh, poyga, retry — hammasi qo'lda | TanStack Query (32-bob) |
| "Effekt = componentDidMount" deb o'ylash | Noto'g'ri model | Sinxronlash modeli (27-bob) |

## Amaliyot

1. Loyihangizdagi barcha `useEffect` larni sanang va yuqoridagi tekshiruv ro'yxatidan o'tkazing: nechtasi ortiqcha?
2. Hosila holatni effekt bilan hisoblaydigan kod yozing, Profiler'da ikki renderni ko'ring, keyin tuzating.
3. Zanjirli uchta effekt yozing va ular nechta render keltirishini o'lchang; `useReducer` bilan qayta yozing.
4. Props o'zgarganda holatni tozalaydigan effektni `key` bilan almashtiring.
5. Ma'lumot yuklashni effekt bilan yozing va unga kesh, retry, bekor qilish qo'shishga urinib ko'ring — nechta qator chiqdi?

## Rasmiy hujjat

- Effekt kerak emas: <https://react.dev/learn/you-might-not-need-an-effect>
- Reaktiv effektlar hayot sikli: <https://react.dev/learn/lifecycle-of-reactive-effects>
- Hodisalarni effektlardan ajratish: <https://react.dev/learn/separating-events-from-effects>
