# 27 — `useEffect`: asoslar

[← Oldingi: O'z hookingiz](26-custom-hooklar.md) · [Mundarija](README.md) · [Keyingi: Effekt kerak emas →](28-effekt-kerak-emas.md)

## Tushuncha

`useEffect` — komponentni **tashqi tizim bilan sinxronlash** vositasi. "Tashqi" degani React boshqarmaydigan hamma narsa: brauzer API'lari, tarmoq, taymerlar, uchinchi tomon kutubxonalari, `document.title`.

::: ts
```tsx
useEffect(() => {
  // Sinxronlashni boshlash
  const connection = createConnection(roomId)
  connection.connect()

  // Tozalash: sinxronlashni to'xtatish
  return () => connection.disconnect()
}, [roomId])        // ← bog'liqliklar
```
:::

::: js
```jsx
useEffect(() => {
  const connection = createConnection(roomId)
  connection.connect()

  return () => connection.disconnect()
}, [roomId])
```
:::

Effekt **render tugagandan va DOM yangilangandan keyin** ishlaydi.

## Kod: bog'liqliklar massivi

```jsx
useEffect(() => { /* ... */ })              // HAR renderdan keyin
useEffect(() => { /* ... */ }, [])          // faqat birinchi mount'dan keyin
useEffect(() => { /* ... */ }, [a, b])      // a yoki b o'zgarganda
```

Bog'liqliklar `Object.is` bilan solishtiriladi. Shuning uchun har renderda yangi obyekt/funksiya — har safar effekt qayta ishga tushadi (22-bob):

```jsx
// ✗ options har renderda yangi
const options = { threshold: 0.5 }

useEffect(() => { /* ... */ }, [options])

// ✓ Primitiv bog'liqlik, obyekt effekt ichida
useEffect(() => {
  const options = { threshold: 0.5 }
  // ...
}, [threshold])
```

## Kod: tozalash (cleanup)

Tozalash funksiyasi uch holatda chaqiriladi:

1. Komponent o'chirilganda;
2. Bog'liqlik o'zgarib, effekt qayta ishga tushishidan **oldin**;
3. `StrictMode` da (ishlab chiqishda) mount'dan darhol keyin (29-bob).

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000)

  return () => clearInterval(id)          // majburiy
}, [])

useEffect(() => {
  window.addEventListener('resize', onResize)

  return () => window.removeEventListener('resize', onResize)
}, [])

useEffect(() => {
  const socket = new WebSocket(url)

  return () => socket.close()
}, [url])
```

Qoida: **effektda nimadir ochsangiz, tozalashda yoping.** Tozalanmagan resurs — xotira oqishi va "zombi" tinglovchilar.

## Kod: ma'lumot yuklash (soddalashtirilgan)

::: ts
```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        return res.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()      // eski so'rovni bekor qilish
  }, [userId])

  if (isLoading) return <Skeleton />
  if (error) return <ErrorBox error={error} />

  return <Profile user={user!} />
}
```
:::

::: js
```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        return res.json()
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [userId])

  if (isLoading) return <Skeleton />
  if (error) return <ErrorBox error={error} />

  return <Profile user={user} />
}
```
:::

`AbortController` **majburiy**: usiz tez almashtirishda eski javob yangisini bosib ketishi mumkin (poyga holati, 29-bob).

> Bu kod ishlaydi, lekin kesh, qayta urinish, fon'da yangilash — hammasi yo'q. Shuning uchun amalda ma'lumot yuklash uchun kutubxona ishlatiladi (31, 32-bob).

## Kod: `useEffect` va `useLayoutEffect`

| | `useEffect` | `useLayoutEffect` |
| --- | --- | --- |
| Qachon | Brauzer chizgandan **keyin** | DOM yangilangach, chizishdan **oldin** |
| Bloklaydimi | Yo'q | Ha (sinxron) |
| Qachon kerak | Deyarli har doim | O'lchash + darhol o'zgartirish (miltillashning oldini olish) |
| SSR | Ishlamaydi | Ogohlantirish beradi |

```jsx
// Tooltip pozitsiyasini o'lchab, darhol qo'yish — miltillamasligi uchun
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect()

  setPosition({ top: rect.bottom + 8, left: rect.left })
}, [isOpen])
```

Qoida: **standart tanlov — `useEffect`**; faqat vizual miltillash ko'rsangiz `useLayoutEffect` ga o'ting.

## Kod: effektni hookka ajratish

```jsx
// Takrorlanadigan effektni hookka ko'chiring (26-bob)
function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title

    document.title = title

    return () => { document.title = previous }
  }, [title])
}

// Komponentda bitta qator
useDocumentTitle(`${user.name} — Profil`)
```

React 19 da `<title>` ni to'g'ridan-to'g'ri JSX'da ham yozish mumkin:

```jsx
return (
  <>
    <title>{user.name} — Profil</title>
    <Profile user={user} />
  </>
)
```

## Muhandislik nuqtai nazari: effekt — "sinxronlash", "hayot sikli" emas

Sinf komponentlar davridan kelgan odat: `componentDidMount` → `useEffect(..., [])`. Bu tarjima **noto'g'ri mental model** beradi.

To'g'ri model: effekt **"tashqi tizim shu holatga mos bo'lsin"** deydi. Shuning uchun:

- Bog'liqlik o'zgarsa, effekt **to'xtaydi va qaytadan boshlanadi** (tozalash → ishga tushirish);
- Bu ikki marta ishlashi mumkin va bu normal (29-bob);
- Effekt "bir marta ishga tushsin" degan kafolat bermaydi.

Amaliy natija: effektni shunday yozing, u **istalgan paytda qayta ishga tushsa ham to'g'ri ishlasin**.

## Muhandislik nuqtai nazari: bog'liqliklar bilan kurashmang

ESLint `react-hooks/exhaustive-deps` ogohlantirishini **o'chirmang**. U ogohlantirsa, uchta to'g'ri yo'l bor:

```jsx
// 1. Funksiyani effekt ichiga ko'chirish
useEffect(() => {
  function load() { /* ... */ }

  load()
}, [userId])

// 2. Funksiyani komponentdan tashqariga chiqarish (holatga bog'liq bo'lmasa)
function formatUrl(id) { return `/api/users/${id}` }

// 3. Barqaror qilib memoizatsiya qilish
const load = useCallback(() => { /* ... */ }, [userId])
```

Noto'g'ri yo'l — massivdan olib tashlash: bu **jim xatolar** (eskirgan qiymat) keltiradi va ular production'da topilishi qiyin.

## Muhandislik nuqtai nazari: effektlar ko'pligi — arxitektura signali

Komponentda 4–5 ta effekt bo'lsa, ehtimol ular kerak emas (28-bob). Tipik ortiqcha effektlar:

| Effekt nima qilyapti | To'g'ri yechim |
| --- | --- |
| Props'dan holat hisoblash | Render paytida hisoblang |
| Holat o'zgarganda boshqa holatni yangilash | Bitta holatga birlashtiring |
| Hodisaga javob berish (bosildi → so'rov) | Hodisa ishlov beruvchisi |
| Ota'ga xabar berish | Callback prop |
| Ma'lumot yuklash | Kutubxona (32-bob) yoki framework |

Haqiqiy effekt qoladigan joylar: WebSocket, `IntersectionObserver`, tashqi kutubxona, analitika, `document.title`, klaviatura yorliqlari.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tozalashni unutish | Xotira oqishi, zombi tinglovchilar | `return () => ...` |
| Bog'liqliklarni olib tashlash | Eskirgan qiymat, jim xato | Kodni qayta tuzing |
| Obyekt/funksiyani bog'liqlik qilish | Har renderda qayta ishga tushadi | Primitiv yoki `useMemo` |
| So'rovni bekor qilmaslik | Poyga holati | `AbortController` |
| `useEffect` da holat o'zgartirib, uni bog'liqlikka qo'yish | Cheksiz sikl | Mantiqni qayta ko'ring |
| Hamma joyda `useLayoutEffect` | Renderni bloklaydi | Faqat o'lchash uchun |
| Hodisaga javobni effektda yozish | Ikki marta ishlaydi | Hodisa ishlov beruvchisida |

## Amaliyot

1. `useDocumentTitle` hookini yozing va sahifa nomini o'zgartiring; tozalashsiz qoldirib, orqaga qaytganda sarlavha noto'g'ri qolishini ko'ring.
2. `setInterval` bilan soat yozing va tozalashni olib tashlab, komponentni o'chiring — konsolda nima bo'ladi?
3. Ma'lumot yuklashni `AbortController` bilan yozing, `userId` ni tez almashtirib, Network panelida bekor qilingan so'rovlarni ko'ring.
4. `exhaustive-deps` ogohlantirishini ataylab chiqaring va uch xil yo'l bilan tuzating.
5. Tooltip pozitsiyasini `useEffect` bilan hisoblang (miltillashni ko'ring), keyin `useLayoutEffect` ga o'tkazing.

## Rasmiy hujjat

- `useEffect`: <https://react.dev/reference/react/useEffect>
- Effektlar bilan sinxronlash: <https://react.dev/learn/synchronizing-with-effects>
- `useLayoutEffect`: <https://react.dev/reference/react/useLayoutEffect>
