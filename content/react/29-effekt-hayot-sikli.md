# 29 — Effekt hayot sikli

[← Oldingi: Effekt kerak emas](28-effekt-kerak-emas.md) · [Mundarija](README.md) · [Keyingi: Tashqi tizimlar bilan ishlash →](30-tashqi-tizimlar.md)

## Tushuncha

Komponentning hayot sikli: mount → update → unmount. Effektning hayot sikli esa boshqacha: u **sinxronlashni boshlaydi va to'xtatadi**, va buni bir necha marta qilishi mumkin.

```
Render (roomId = "general")
  → Effekt ishga tushdi: "general" ga ulandi

roomId "travel" ga o'zgardi
  → Tozalash: "general" dan uzildi
  → Effekt ishga tushdi: "travel" ga ulandi

Komponent o'chirildi
  → Tozalash: "travel" dan uzildi
```

Shuning uchun effektni "mount'da bir marta ishlaydi" deb emas, **"holat o'zgarganda qayta sinxronlanadi"** deb tasavvur qiling.

## Kod: `StrictMode` va ikki marta ishlash

Ishlab chiqish rejimida `<StrictMode>` har effektni: **ishga tushiradi → tozalaydi → yana ishga tushiradi**.

```jsx
useEffect(() => {
  console.log('ulandi')

  return () => console.log('uzildi')
}, [])

// Dev konsolda:
// ulandi
// uzildi
// ulandi
```

Bu **xato emas** — bu tekshiruv. React sizga: "effekting qayta ishga tushsa ham to'g'ri ishlaydimi?" degan savolni beradi. Production'da bunday bo'lmaydi.

Agar ikki marta ishlash muammo tug'dirsa — demak **tozalash yetishmayapti**:

```jsx
// ✗ Har ishga tushishda yangi ulanish, eskisi qoladi
useEffect(() => {
  const socket = new WebSocket(url)
  socket.onmessage = handleMessage
}, [url])

// ✓
useEffect(() => {
  const socket = new WebSocket(url)
  socket.onmessage = handleMessage

  return () => socket.close()
}, [url])
```

`StrictMode` ni o'chirish — **noto'g'ri yechim**: u faqat muammoni yashiradi, va u production'da poyga holati yoki xotira oqishi sifatida qaytadi.

## Kod: poyga holati (race condition)

Eng ko'p uchraydigan async effekt xatosi:

::: ts
```tsx
// ✗ Tez almashtirishda eski javob yangisini bosib ketishi mumkin
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then(setUser)
}, [userId])
```
:::

::: js
```jsx
// ✗ Tez almashtirishda eski javob yangisini bosib ketishi mumkin
useEffect(() => {
  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then(setUser)
}, [userId])
```
:::

Ssenariy: `userId` 1 → 2 ga o'zgardi. Birinchi so'rov sekin, ikkinchisi tez. Natija: ekranda 2-foydalanuvchi ko'rindi, keyin 1-foydalanuvchi javob keldi va uni **almashtirdi**.

Ikki yechim:

::: ts
```tsx
// 1. Bekor qilish bayrog'i
useEffect(() => {
  let ignore = false

  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then((data) => {
      if (!ignore) setUser(data)
    })

  return () => { ignore = true }
}, [userId])

// 2. AbortController (so'rovni ham to'xtatadi — afzal)
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== 'AbortError') setError(e) })

  return () => controller.abort()
}, [userId])
```
:::

::: js
```jsx
// 1. Bekor qilish bayrog'i
useEffect(() => {
  let ignore = false

  fetch(`/api/users/${userId}`)
    .then((r) => r.json())
    .then((data) => {
      if (!ignore) setUser(data)
    })

  return () => { ignore = true }
}, [userId])

// 2. AbortController (afzal)
useEffect(() => {
  const controller = new AbortController()

  fetch(`/api/users/${userId}`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setUser)
    .catch((e) => { if (e.name !== 'AbortError') setError(e) })

  return () => controller.abort()
}, [userId])
```
:::

`StrictMode` bu xatoni **ishlab chiqishda** ochib beradi — effekt ikki marta ishlagani uchun ikkita so'rov ketadi va tartib buzilishi ko'rinadi.

## Kod: reaktiv va reaktiv bo'lmagan qiymatlar

Effekt ichida ishlatilgan har bir **reaktiv** qiymat bog'liqlikda bo'lishi kerak. Reaktiv — props, holat va ular asosida hisoblangan qiymatlar.

```jsx
function ChatRoom({ roomId, theme }) {
  useEffect(() => {
    const connection = createConnection(serverUrl, roomId)

    connection.on('connected', () => {
      showNotification('Ulandi!', theme)      // ✗ theme reaktiv, lekin uni bog'liqlikka qo'ysak,
    })                                        //   tema o'zgarganda qayta ulanadi — bu noto'g'ri

    connection.connect()

    return () => connection.disconnect()
  }, [roomId, theme])
}
```

Muammo: tema o'zgarganda chat qayta ulanishi kerak emas. Yechim — **Effect Event** (`useEffectEvent`, hozircha eksperimental):

```jsx
function ChatRoom({ roomId, theme }) {
  const onConnected = useEffectEvent(() => {
    showNotification('Ulandi!', theme)        // eng so'nggi `theme` ni o'qiydi
  })

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId)

    connection.on('connected', () => onConnected())
    connection.connect()

    return () => connection.disconnect()
  }, [roomId])                                // theme bog'liqlikda emas
}
```

`useEffectEvent` hali barqaror emas. Hozircha muqobil — 26-bobdagi `useRef` naqshi:

```jsx
const themeRef = useRef(theme)

useEffect(() => { themeRef.current = theme }, [theme])

useEffect(() => {
  const connection = createConnection(serverUrl, roomId)

  connection.on('connected', () => showNotification('Ulandi!', themeRef.current))
  connection.connect()

  return () => connection.disconnect()
}, [roomId])
```

## Kod: effektni qanday tekshirish

Effekt to'g'ri yozilganini bilish uchun uchta savol:

1. **Ikki marta ishga tushsa, natija bir xilmi?** (`StrictMode` tekshiradi)
2. **Tozalash ochilgan hamma narsani yopadimi?**
3. **Bog'liqlik o'zgarganda qayta sinxronlash mantiqiymi?**

Amaliy test: komponentni `v-if` kabi shartli render qiling va uni 10 marta oching-yoping. Xotira oshib borsa (DevTools → Memory), tozalash yetishmayapti.

## Muhandislik nuqtai nazari: bog'liqliklar "tanlanmaydi"

Ko'p boshlovchi bog'liqliklarni "effekt qachon ishlashini boshqarish tugmasi" deb o'ylaydi va keraksizini olib tashlaydi. Aslida:

> **Bog'liqliklar ro'yxati — effekt kodidan kelib chiqadi, siz uni tanlamaysiz.**

Agar ro'yxat noqulay bo'lsa, **kodni o'zgartirish** kerak, ro'yxatni emas:

| Muammo | Yechim |
| --- | --- |
| Funksiya bog'liqlik bo'lib, har renderda o'zgaradi | Funksiyani effekt ichiga ko'chiring |
| Obyekt bog'liqlik | Primitivlarni ajrating yoki effekt ichida yarating |
| Qiymat kerak, lekin reaksiya kerak emas | `useEffectEvent` yoki `useRef` naqshi |
| Effekt juda ko'p narsaga bog'liq | Uni bir nechta effektga bo'ling |

## Muhandislik nuqtai nazari: bitta effekt — bitta maqsad

```jsx
// ✗ Ikki mustaqil vazifa bitta effektda
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()

  logVisit(roomId)

  return () => connection.disconnect()
}, [roomId])

// ✓ Ajratilgan
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()

  return () => connection.disconnect()
}, [roomId])

useEffect(() => {
  logVisit(roomId)
}, [roomId])
```

Ajratilgan effektlar mustaqil sinxronlanadi va har birini alohida hookka ko'chirish oson (26-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `StrictMode` ni o'chirish | Muammo yashiriladi, production'da qaytadi | Tozalashni to'g'rilang |
| Async effektda poyga holatini boshqarmaslik | Eski javob yangisini bosadi | `ignore` bayrog'i yoki `AbortController` |
| `useEffect(async () => {})` | Effekt promise qaytarolmaydi | Ichida async funksiya e'lon qiling |
| Bog'liqlikni "qulaylik uchun" olib tashlash | Eskirgan qiymat | Kodni qayta tuzing |
| Bir effektda bir nechta mustaqil vazifa | Keraksiz qayta sinxronlash | Bo'ling |
| Tozalashda faqat bitta resursni yopish | Boshqalari oqadi | Hammasini yoping |
| Effektni "faqat bir marta" ishlashiga tayanish | Kafolat yo'q | Qayta ishga tushishga chidamli yozing |

## Amaliyot

1. `StrictMode` da effekt ikki marta ishlashini `console.log` bilan ko'ring; tozalash qo'shib, "ulandi/uzildi" juftligi to'g'ri chiqishiga erishing.
2. Poyga holatini sun'iy yarating: birinchi so'rovga 2 s kechikish qo'ying, `userId` ni tez almashtiring va noto'g'ri natijani ko'ring. Keyin `AbortController` bilan tuzating.
3. Chat komponentini yozing: `roomId` bog'liqlikda, `theme` esa yo'q (`useRef` naqshi bilan).
4. Bitta effektni ikkita mustaqil effektga bo'ling va qaysi biri qachon qayta ishga tushishini log bilan kuzating.
5. Komponentni 20 marta mount/unmount qiling va DevTools → Memory'da "Detached elements" ni tekshiring.

## Rasmiy hujjat

- Effektlar hayot sikli: <https://react.dev/learn/lifecycle-of-reactive-effects>
- Effekt bog'liqliklarini olib tashlash: <https://react.dev/learn/removing-effect-dependencies>
- Hodisalarni effektlardan ajratish: <https://react.dev/learn/separating-events-from-effects>
