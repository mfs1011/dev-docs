# 24 — `use()` va Suspense

[← Oldingi: Concurrent hooklar](23-concurrent-hooklar.md) · [Mundarija](README.md) · [Keyingi: Actions →](25-actions.md)

## Tushuncha

**Suspense** — komponent "hali tayyor emasman" deb ayta oladigan mexanizm. React o'sha paytda **fallback** ko'rsatadi:

```jsx
<Suspense fallback={<Skeleton />}>
  <UserProfile userId={id} />
</Suspense>
```

**`use()`** (React 19) — promise yoki context'ni render ichida o'qiydigan API:

```jsx
function UserProfile({ userPromise }) {
  const user = use(userPromise)      // promise hal bo'lguncha komponent "to'xtaydi"

  return <h1>{user.name}</h1>
}
```

`use()` — hooklar qoidasidan istisno: uni shart va sikl ichida chaqirish mumkin.

## Kod: lazy komponentlar (eng keng tarqalgan ishlatilish)

::: ts
```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))
const Reports = lazy(() => import('./Reports'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  )
}
```
:::

::: js
```jsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./Dashboard'))
const Reports = lazy(() => import('./Reports'))

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  )
}
```
:::

Bu — Suspense'ning **barqaror va tavsiya etiladigan** qo'llanilishi: kod bo'lish (41-bob).

## Kod: `use()` bilan ma'lumot o'qish

::: ts
```tsx
// Ota: promise YARATADI (render ichida emas!)
function ProfilePage({ userId }: { userId: number }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId])

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ErrorBoundary fallback={<ErrorBox />}>
        <Profile userPromise={userPromise} />
      </ErrorBoundary>
    </Suspense>
  )
}

// Bola: promise'ni o'qiydi
function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise)

  return <h1>{user.name}</h1>
}
```
:::

::: js
```jsx
function ProfilePage({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId])

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ErrorBoundary fallback={<ErrorBox />}>
        <Profile userPromise={userPromise} />
      </ErrorBoundary>
    </Suspense>
  )
}

function Profile({ userPromise }) {
  const user = use(userPromise)

  return <h1>{user.name}</h1>
}
```
:::

**Kritik nozik joy:** promise render ichida yaratilmasligi kerak:

```jsx
// ✗ Har renderda yangi promise → cheksiz sikl
function Profile({ userId }) {
  const user = use(fetchUser(userId))
}
```

Shuning uchun klient tomonda `use()` ni **to'g'ridan-to'g'ri ma'lumot yuklash uchun ishlatish tavsiya etilmaydi** — buning uchun kesh qatlami kerak (32-bob: TanStack Query, yoki Next'da server komponentlar).

## Kod: `use()` bilan context

```jsx
function Button({ variant }) {
  // Shart ichida chaqirish mumkin — useContext bilan bunday qilib bo'lmaydi
  if (variant === 'themed') {
    const theme = use(ThemeContext)

    return <button className={theme} />
  }

  return <button />
}
```

Bu — `use()` ning klient tomonda eng amaliy qo'llanilishi.

## Kod: Suspense chegaralarini joylashtirish

```jsx
{/* ✗ Bitta chegara: eng sekin qism butun sahifani ushlab turadi */}
<Suspense fallback={<PageSkeleton />}>
  <Header />
  <ProductList />
  <Reviews />
</Suspense>

{/* ✓ Har bo'lak o'z chegarasida — tayyor bo'lgani darhol ko'rinadi */}
<Header />

<Suspense fallback={<ListSkeleton />}>
  <ProductList />
</Suspense>

<Suspense fallback={<ReviewsSkeleton />}>
  <Reviews />
</Suspense>
```

Bu Next.js'da streaming bilan ayniqsa kuchli ishlaydi (Next qo'llanmasi, 20-bob).

## Kod: xato chegarasi bilan birga

Suspense faqat "yuklanmoqda" holatini boshqaradi. Xatolar uchun **Error Boundary** kerak (33-bob):

::: ts
```tsx
<ErrorBoundary fallback={<ErrorBox onRetry={refetch} />}>
  <Suspense fallback={<Skeleton />}>
    <UserProfile userPromise={userPromise} />
  </Suspense>
</ErrorBoundary>
```
:::

::: js
```jsx
<ErrorBoundary fallback={<ErrorBox onRetry={refetch} />}>
  <Suspense fallback={<Skeleton />}>
    <UserProfile userPromise={userPromise} />
  </Suspense>
</ErrorBoundary>
```
:::

Tartib: `ErrorBoundary` tashqarida, `Suspense` ichkarida. Shunda yuklanish xatosi ham ushlanadi.

## Kod: `startTransition` bilan fallback'ni yashirish

Ma'lumot qayta yuklanganda skelet miltillashi noqulay. `startTransition` (23-bob) eski mazmunni saqlab turadi:

```jsx
const [isPending, startTransition] = useTransition()

function changeUser(id) {
  startTransition(() => {
    setUserId(id)            // Suspense fallback ko'rsatilmaydi, eski profil qoladi
  })
}

<div style={{ opacity: isPending ? 0.6 : 1 }}>
  <Suspense fallback={<Skeleton />}>
    <Profile userId={userId} />
  </Suspense>
</div>
```

Qoida: **birinchi yuklanishda skelet, keyingi yangilanishlarda eski mazmun + indikator.**

## Muhandislik nuqtai nazari: Suspense'ning klient tomondagi holati

React 19 da Suspense **barqaror**, lekin uning ishlatilishi kontekstga qarab farq qiladi:

| Ishlatilish | Holat |
| --- | --- |
| `lazy()` bilan kod bo'lish | ✅ Barqaror, tavsiya etiladi |
| Server Components (Next) | ✅ Asosiy ishlatilish |
| Kutubxona orqali ma'lumot (TanStack Query `suspense: true`) | ✅ Ishlaydi |
| `use()` + qo'lda promise (klient) | ⚠️ Kesh kerak, oson xato qilinadi |

Klient SPA'da ma'lumot uchun odatda `useQuery` (32-bob) ishlatiladi — u `isLoading` bilan ham, Suspense bilan ham ishlay oladi.

## Muhandislik nuqtai nazari: waterfall'dan qochish

```jsx
{/* ✗ Ketma-ket: user kelguncha posts so'ralmaydi */}
function Profile({ userId }) {
  const user = use(fetchUser(userId))
  const posts = use(fetchPosts(user.id))
}

{/* ✓ Parallel: ikkala so'rov birga boshlanadi */}
function ProfilePage({ userId }) {
  const userPromise = useMemo(() => fetchUser(userId), [userId])
  const postsPromise = useMemo(() => fetchPosts(userId), [userId])

  return (
    <Suspense fallback={<Skeleton />}>
      <Profile userPromise={userPromise} postsPromise={postsPromise} />
    </Suspense>
  )
}
```

Waterfall — ma'lumot yuklashdagi eng ko'p uchraydigan unumdorlik muammosi. Next.js qo'llanmasining 17-bobida bu server tomonda batafsil ko'riladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Render ichida promise yaratib `use()` ga berish | Cheksiz sikl | `useMemo` yoki kesh qatlami |
| Suspense'siz `use(promise)` | Xato: chegara topilmadi | `<Suspense>` bilan o'rang |
| Bitta katta Suspense chegarasi | Eng sekin qism hammasini ushlaydi | Bo'lak-bo'lak chegaralar |
| Xato chegarasini unutish | Xato bo'lsa fallback abadiy qoladi | `ErrorBoundary` |
| Har yangilanishda skelet ko'rsatish | Miltillash, yomon UX | `startTransition` |
| `lazy()` ni birinchi ekran komponenti uchun | LCP yomonlashadi | Statik import |
| Ma'lumot uchun `use()` ni keshsiz ishlatish | Takroriy so'rovlar | TanStack Query yoki RSC |

## Amaliyot

1. Ikki sahifani `lazy()` bilan bo'ling va Network panelida chunk'lar qachon yuklanishini ko'ring.
2. `use()` bilan promise o'qiydigan komponent yozing; promise'ni render ichida yaratib, cheksiz siklni ko'ring, keyin `useMemo` bilan tuzating.
3. Bitta katta Suspense chegarasini uchta kichikka bo'ling va farqni Slow 3G da kuzating.
4. `ErrorBoundary` qo'shing va so'rovni ataylab xato qildiring.
5. `startTransition` bilan foydalanuvchi almashganda skelet miltillamasligiga erishing.

## Rasmiy hujjat

- `use`: <https://react.dev/reference/react/use>
- `Suspense`: <https://react.dev/reference/react/Suspense>
- `lazy`: <https://react.dev/reference/react/lazy>
