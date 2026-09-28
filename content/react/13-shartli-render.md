# 13 — Shartli render

[← Oldingi: Hodisalar](12-hodisalar.md) · [Mundarija](README.md) · [Keyingi: Kompozitsiya naqshlari →](14-kompozitsiya.md)

## Tushuncha

React'da shartli render uchun maxsus direktiva yo'q — oddiy JavaScript ishlatiladi:

```jsx
{isLoggedIn ? <Dashboard /> : <Login />}        {/* ternar */}
{hasError && <ErrorBox error={error} />}         {/* && */}
{items.length === 0 ? <Empty /> : <List items={items} />}
```

Yoki erta qaytish (early return) — eng o'qiladigan shakl:

```jsx
function UserProfile({ user, isLoading, error }) {
  if (isLoading) return <Spinner />
  if (error) return <ErrorBox error={error} />
  if (!user) return <Empty />

  return <Profile user={user} />
}
```

## Kod: `&&` tuzog'i

```jsx
{/* ✗ items bo'sh bo'lsa ekranda "0" chiqadi */}
{items.length && <List items={items} />}

{/* ✗ count 0 bo'lsa ekranda "0" */}
{count && <Badge count={count} />}

{/* ✓ */}
{items.length > 0 && <List items={items} />}
{count ? <Badge count={count} /> : null}
{!!count && <Badge count={count} />}
```

Sabab (08-bob): `0` — falsy qiymat, lekin React uni **render qiladi**. `false`, `null`, `undefined` esa render qilinmaydi.

## Kod: to'rt holat naqshi

Ma'lumot yuklaydigan har bir ekranda kamida to'rt holat bor. Boshlovchilar ikkitasini yozadi, qolgan ikkitasi production'da "oq ekran" bo'lib chiqadi:

::: ts
```tsx
function UserList() {
  const { data, isLoading, error, refetch } = useUsers()

  if (isLoading) return <UserListSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (data.length === 0) return <EmptyState title="Foydalanuvchi topilmadi" />

  return (
    <ul>
      {data.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
function UserList() {
  const { data, isLoading, error, refetch } = useUsers()

  if (isLoading) return <UserListSkeleton />
  if (error) return <ErrorState error={error} onRetry={refetch} />
  if (data.length === 0) return <EmptyState title="Foydalanuvchi topilmadi" />

  return (
    <ul>
      {data.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </ul>
  )
}
```
:::

Bu to'rtlikni odat qiling: **loading → error → empty → data**. 33-bobda xato holatlari, 32-bobda ma'lumot qatlami batafsil.

## Kod: holat mashinasi sifatida yozish

Bir nechta boolean bir-biriga zid holatlarga olib keladi:

::: ts
```tsx
// ✗ 8 ta kombinatsiya, ularning 5 tasi imkonsiz
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isEmpty, setIsEmpty] = useState(false)

// ✓ Bitta holat, aniq qiymatlar
type Status = 'idle' | 'loading' | 'success' | 'error'

const [status, setStatus] = useState<Status>('idle')

return (
  <>
    {status === 'loading' && <Spinner />}
    {status === 'error' && <ErrorBox />}
    {status === 'success' && <List items={items} />}
  </>
)
```
:::

::: js
```jsx
// ✗ 8 ta kombinatsiya, ularning 5 tasi imkonsiz
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isEmpty, setIsEmpty] = useState(false)

// ✓ Bitta holat, aniq qiymatlar
const [status, setStatus] = useState('idle')      // 'idle' | 'loading' | 'success' | 'error'

return (
  <>
    {status === 'loading' && <Spinner />}
    {status === 'error' && <ErrorBox />}
    {status === 'success' && <List items={items} />}
  </>
)
```
:::

"Imkonsiz holatni imkonsiz qiling" — 17 va 19-boblarda bu g'oya davom etadi.

## Kod: obyekt xaritasi bilan tanlash

Uzun `if/else` yoki `switch` o'rniga:

::: ts
```tsx
const STATUS_VIEW: Record<Status, React.ReactNode> = {
  idle: <Placeholder />,
  loading: <Spinner />,
  error: <ErrorBox />,
  success: <List items={items} />,
}

return STATUS_VIEW[status]
```
:::

::: js
```jsx
const STATUS_VIEW = {
  idle: <Placeholder />,
  loading: <Spinner />,
  error: <ErrorBox />,
  success: <List items={items} />,
}

return STATUS_VIEW[status]
```
:::

Diqqat: bu yerda **hamma variant darhol yaratiladi** (JSX obyektlari). Ular render qilinmaydi, lekin obyektlar yaratiladi. Og'ir komponentlar bo'lsa, funksiya xaritasini ishlating:

```jsx
const STATUS_VIEW = {
  loading: () => <Spinner />,
  success: () => <List items={items} />,
}

return STATUS_VIEW[status]?.() ?? null
```

## Kod: yashirish yoki render qilmaslik

```jsx
{/* DOM'da yo'q — holat ham yo'qoladi */}
{isOpen && <Panel />}

{/* DOM'da bor, faqat ko'rinmaydi — holat saqlanadi */}
<div hidden={!isOpen}><Panel /></div>
<div style={{ display: isOpen ? 'block' : 'none' }}><Panel /></div>
```

| Mezon | `&&` (render qilmaslik) | `hidden` (yashirish) |
| --- | --- | --- |
| Boshlang'ich narx | Nol | Har doim render |
| Ichki holat | Yo'qoladi | Saqlanadi |
| Effektlar | To'xtaydi/qayta ishga tushadi | Ishlab turadi |
| Tez almashadigan panel | Ortiqcha ish | Qulay |
| Og'ir komponent (xarita, grafik) | To'g'ri tanlov | Xotira egallaydi |

Vue'dagi `v-if` / `v-show` farqi bilan bir xil mantiq.

## Kod: shartli atributlar va bo'laklar

```jsx
{/* Atribut */}
<a href={isExternal ? url : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>

{/* Class */}
<div className={clsx('row', isSelected && 'row-selected', isDisabled && 'row-disabled')} />

{/* Butun komponentni almashtirish */}
const Wrapper = isLink ? 'a' : 'div'

<Wrapper className="card" {...(isLink ? { href } : {})}>
  {children}
</Wrapper>
```

Oxirgi naqsh (`as` prop) dizayn tizimlarida keng ishlatiladi (40-bob).

## Muhandislik nuqtai nazari: shart qayerda turishi kerak

Bitta shartni ikki joyda takrorlash — xato manbai:

```jsx
{/* ✗ Shart ikki joyda */}
{isAdmin && <AdminTools />}
{isAdmin && <AdminBadge />}
{!isAdmin && <UpgradeBanner />}

{/* ✓ Bitta joyda */}
{isAdmin ? (
  <>
    <AdminTools />
    <AdminBadge />
  </>
) : (
  <UpgradeBanner />
)}
```

Yoki alohida komponentga chiqaring: `<AdminSection />` va `<UserSection />`.

## Muhandislik nuqtai nazari: shart va xavfsizlik

`{isAdmin && <DeleteButton />}` — bu **interfeys** cheklovi, xavfsizlik emas (47-bob). Foydalanuvchi:

- DevTools'da holatni o'zgartirib tugmani ko'rsata oladi;
- Yoki to'g'ridan-to'g'ri API'ga so'rov yuborishi mumkin.

Demak: ruxsat tekshiruvi **har doim serverda**, va maxfiy ma'lumot klientga umuman yuborilmasligi kerak.

## Muhandislik nuqtai nazari: skelet yoki spinner

| Kutish vaqti | Tavsiya |
| --- | --- |
| < 200 ms | Hech narsa (miltillash yomonroq) |
| 200 ms – 1 s | Skelet |
| > 1 s | Skelet + progress |
| > 5 s | Progress + bekor qilish |

Skelet spinner'dan yaxshi: u layout siljishini (CLS) oldini oladi va kutilayotgan tuzilmani ko'rsatadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `{items.length && ...}` | Bo'sh bo'lsa `0` ko'rinadi | `> 0` yoki ternar |
| Ichma-ich ternarlar zanjiri | O'qib bo'lmaydi | Erta qaytish |
| Bir nechta zid boolean holat | Imkonsiz kombinatsiyalar | `status` birlashmasi |
| Faqat loading va data holatlari | Xato va bo'sh holat ko'rinmaydi | To'rt holat |
| Og'ir komponentni `hidden` bilan yashirish | Doim ishlaydi, xotira egallaydi | `&&` bilan render qilmaslik |
| Bir shartni bir necha joyda takrorlash | Sinxrondan chiqadi | Bitta joyga yig'ing |
| `v-if` o'rniga `display: none` deb o'ylab, effektlar to'xtaydi deb kutish | Effektlar ishlab turadi | Render qilmaslik |

## Amaliyot

1. `{count && <Badge />}` tuzog'ini takrorlang va ekranda `0` chiqishini ko'ring.
2. Ma'lumot yuklaydigan ekranni to'rt holat bilan yozing va har birini sun'iy ravishda ishga tushiring.
3. Uchta boolean holatli komponentni `status` birlashmasiga aylantiring.
4. Panelni avval `&&`, keyin `hidden` bilan yozing; ichiga input qo'yib, matn saqlanishini solishtiring.
5. `<Wrapper>` naqshi bilan `<a>`/`<div>` ni shartli almashtiradigan komponent yozing.

## Rasmiy hujjat

- Shartli render: <https://react.dev/learn/conditional-rendering>
- Holat tuzilmasini tanlash: <https://react.dev/learn/choosing-the-state-structure>
