# 20 — Streaming va Suspense

[← Oldingi: Qayta validatsiya](19-revalidatsiya.md) · [Mundarija](README.md) · [Keyingi: Server Actions →](21-server-actions.md)

## Tushuncha

Streaming — server HTML'ni **bo'lak-bo'lak** yuborishi: tayyor qismlar darhol ko'rinadi, sekinlari keyin "oqib" keladi.

```
Oddiy SSR:     [───── hammasi kutiladi ─────] → HTML
Streaming:     [qobiq] → [bo'lak 1] → [bo'lak 2] → [bo'lak 3]
                 ↑ darhol ko'rinadi
```

Bu Next'ning eng sezilarli UX afzalliklaridan biri: sekin so'rov butun sahifani ushlab turmaydi.

## Kod: `<Suspense>` bilan

::: ts
```tsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="dashboard">
      {/* Tez: darhol ko'rinadi */}
      <PageHeader title="Boshqaruv paneli" />

      {/* Sekin: har biri mustaqil oqib keladi */}
      <Suspense fallback={<StatsSkeleton />}>
        <QuickStats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>

      <Suspense fallback={<TableSkeleton rows={5} />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}

async function QuickStats() {
  const stats = await getStats()            // 200 ms

  return <StatsGrid stats={stats} />
}

async function RevenueChart() {
  const data = await getRevenue()           // 2 s

  return <Chart data={data} />
}
```
:::

::: js
```jsx
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <PageHeader title="Boshqaruv paneli" />

      <Suspense fallback={<StatsSkeleton />}>
        <QuickStats />
      </Suspense>

      <Suspense fallback={<ChartSkeleton />}>
        <RevenueChart />
      </Suspense>
    </div>
  )
}

async function QuickStats() {
  const stats = await getStats()

  return <StatsGrid stats={stats} />
}
```
:::

Natija: sarlavha 50 ms da, statistika 250 ms da, grafik 2 s da ko'rinadi — foydalanuvchi bo'sh ekranga qaramaydi.

## Kod: `loading.tsx` bilan farqi

| | `loading.tsx` | `<Suspense>` |
| --- | --- | --- |
| Qamrov | Butun marshrut segmenti | Aniq komponent |
| Sozlash | Fayl yaratish | Kod ichida |
| Aniqlik | Past (hammasi yoki hech nima) | Yuqori |
| Qachon | Sahifa butunlay sekin | Ba'zi qismlar sekin |

Ikkalasini birga ishlatish mumkin: `loading.tsx` navigatsiya paytida, `<Suspense>` sahifa ichida.

## Kod: parallel ma'lumot yuklash

**Muhim:** `<Suspense>` bilan o'ralgan komponentlar **parallel** yuklanadi:

::: ts
```tsx
// ✓ Parallel: uchala so'rov bir vaqtda boshlanadi
<Suspense fallback={<A />}><ComponentA /></Suspense>
<Suspense fallback={<B />}><ComponentB /></Suspense>
<Suspense fallback={<C />}><ComponentC /></Suspense>

// ✗ Ketma-ket: ota tugamaguncha bola boshlanmaydi
async function Parent() {
  const data = await getData()          // 1 s

  return <Child data={data} />          // bola so'rovi shundan keyin
}
```
:::

::: js
```jsx
// ✓ Parallel
<Suspense fallback={<A />}><ComponentA /></Suspense>
<Suspense fallback={<B />}><ComponentB /></Suspense>
```
:::

Waterfall'ni oldini olish uchun (17-bob): so'rovni **yuqorida boshlang**, `await` ni pastda qiling:

::: ts
```tsx
export default function Page() {
  // Promise'lar darhol yaratiladi — so'rovlar parallel ketadi
  const userPromise = getUser()
  const ordersPromise = getOrders()

  return (
    <>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile promise={userPromise} />
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <Orders promise={ordersPromise} />
      </Suspense>
    </>
  )
}

async function Profile({ promise }: { promise: Promise<User> }) {
  const user = await promise

  return <ProfileCard user={user} />
}
```
:::

::: js
```jsx
export default function Page() {
  const userPromise = getUser()
  const ordersPromise = getOrders()

  return (
    <>
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile promise={userPromise} />
      </Suspense>

      <Suspense fallback={<OrdersSkeleton />}>
        <Orders promise={ordersPromise} />
      </Suspense>
    </>
  )
}

async function Profile({ promise }) {
  const user = await promise

  return <ProfileCard user={user} />
}
```
:::

## Kod: PPR (Partial Prerendering)

Next 15+ dagi yangi model: sahifaning **statik qobig'i** oldindan render qilinadi, dinamik teshiklar streaming bilan to'ldiriladi.

::: ts
```ts
// next.config.ts
export default {
  experimental: { ppr: 'incremental' },
}
```
:::

::: js
```js
export default {
  experimental: { ppr: 'incremental' },
}
```
:::

::: ts
```tsx
// app/products/[slug]/page.tsx
export const experimental_ppr = true

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)     // keshlangan — statik qobiqqa kiradi

  return (
    <>
      <ProductInfo product={product} />       {/* STATIK: CDN'dan darhol */}

      <Suspense fallback={<PriceSkeleton />}>
        <LivePrice productId={product.id} />  {/* DINAMIK: oqib keladi */}
      </Suspense>

      <Suspense fallback={<CartSkeleton />}>
        <CartStatus />                        {/* cookies() ishlatadi */}
      </Suspense>
    </>
  )
}
```
:::

::: js
```jsx
export const experimental_ppr = true

export default async function ProductPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  return (
    <>
      <ProductInfo product={product} />

      <Suspense fallback={<PriceSkeleton />}>
        <LivePrice productId={product.id} />
      </Suspense>
    </>
  )
}
```
:::

Ilgari **bitta `cookies()` chaqiruvi butun sahifani dinamik qilardi** (18-bob). PPR bilan u faqat o'z `<Suspense>` chegarasini dinamik qiladi.

Natija: statik sahifa tezligi + shaxsiy mazmun.

## Kod: skeletlarni to'g'ri yozish

::: ts
```tsx
// ✗ Spinner — layout siljishi (CLS)
<Suspense fallback={<Spinner />}>
  <ProductGrid />
</Suspense>

// ✓ Haqiqiy tuzilmani takrorlaydigan skelet
function ProductGridSkeleton() {
  return (
    <div className="grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="card-skeleton" aria-hidden />
      ))}
    </div>
  )
}
```
:::

::: js
```jsx
function ProductGridSkeleton() {
  return (
    <div className="grid">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="card-skeleton" aria-hidden />
      ))}
    </div>
  )
}
```
:::

```css
.card-skeleton {
    height: 280px;                    /* haqiqiy kartochka balandligi */
    border-radius: 10px;
    background: linear-gradient(90deg, var(--surface) 25%, var(--surface-hover) 50%, var(--surface) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer {
    to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
    .card-skeleton { animation: none; }
}
```

Skelet **aniq o'lchamda** bo'lsin — aks holda mazmun kelganda sahifa sakraydi (CLS, 43-bob).

## Kod: `searchParams` va streaming

`searchParams` ni sahifa ildizida o'qish butun sahifani dinamik qiladi (18-bob). Yechim — uni pastki komponentga tushirish:

::: ts
```tsx
// ✗ Butun sahifa dinamik
export default async function Page({ searchParams }: Props) {
  const { q } = await searchParams
  const results = await search(q)

  return (
    <>
      <StaticHeader />          {/* bu ham dinamik bo'lib qoldi */}
      <Results results={results} />
    </>
  )
}

// ✓ Faqat natijalar dinamik
export default function Page({ searchParams }: Props) {
  return (
    <>
      <StaticHeader />          {/* statik qoladi */}

      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function SearchResults({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const results = await search(q)

  return <Results results={results} />
}
```
:::

::: js
```jsx
export default function Page({ searchParams }) {
  return (
    <>
      <StaticHeader />

      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </>
  )
}

async function SearchResults({ searchParams }) {
  const { q } = await searchParams
  const results = await search(q)

  return <Results results={results} />
}
```
:::

`searchParams` Promise sifatida pastga uzatiladi va `await` faqat `Suspense` ichida bo'ladi.

## Muhandislik nuqtai nazari: chegaralarni qayerga qo'yish

| Bo'lak | Suspense kerakmi |
| --- | --- |
| Sahifa sarlavhasi, navigatsiya | ❌ Statik |
| Asosiy mazmun (LCP elementi) | ❌ `await` bilan — u tez bo'lishi kerak |
| Izohlar, tavsiyalar, statistika | ✅ Ha |
| Foydalanuvchiga xos (savat, bildirishnoma) | ✅ Ha |
| Tashqi API'ga bog'liq bo'lak | ✅ Ha |
| Reklama, uchinchi tomon vidjeti | ✅ Ha |

Qoida: **LCP elementi `await` bilan (tez bo'lsin), ikkilamchi bo'laklar `Suspense` bilan.**

Juda ko'p chegara ham yomon: har biri alohida HTML bo'lagi va JS ishini talab qiladi. 3–6 chegara — odatiy sahifa uchun yetarli.

## Muhandislik nuqtai nazari: streaming va SEO

Savol: Google streaming bilan kelgan mazmunni ko'radimi?

Javob: **ha** — Googlebot to'liq javobni kutadi va oqib kelgan bo'laklarni ham oladi. Lekin:

- LCP elementi streaming'da bo'lsa, Core Web Vitals yomonlashadi;
- Ba'zi eski botlar (ijtimoiy tarmoq preview) faqat birinchi bo'lakni o'qishi mumkin;
- **Metadata streaming'ga tushmaydi** — u har doim birinchi bo'lakda bo'ladi (13-bob).

Shuning uchun: SEO uchun muhim mazmun (sarlavha, tavsif, narx) `Suspense` **tashqarisida** bo'lsin.

## Muhandislik nuqtai nazari: streaming qachon foyda bermaydi

| Vaziyat | Sabab |
| --- | --- |
| Barcha so'rovlar tez (< 100 ms) | Qo'shimcha murakkablik, foyda yo'q |
| Sahifa to'liq statik | Streaming kerak emas |
| Bitta sekin so'rov, qolgani unga bog'liq | Waterfall baribir qoladi |
| Proksi yoki CDN streaming'ni qo'llab-quvvatlamasa | Bo'laklar buferlanadi |

Oxirgisi amaliy muammo: ba'zi nginx konfiguratsiyalari javobni buferlaydi va streaming yo'qoladi:

```nginx
proxy_buffering off;
proxy_cache off;
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Butun sahifani bitta `Suspense` ga solish | Eng sekin qism hammasini ushlaydi | Bo'lak-bo'lak |
| Skelet o'lchami haqiqiydan farq qilishi | Layout sakraydi (CLS) | Aniq o'lcham |
| LCP elementini `Suspense` ichiga solish | Core Web Vitals yomonlashadi | `await` bilan |
| Ota komponentda `await` qilib, bolalarni `Suspense` ga solish | Waterfall saqlanadi | So'rovni yuqorida boshlang |
| `searchParams` ni sahifa ildizida o'qish | Butun sahifa dinamik | Pastki komponentga tushiring |
| 15 ta `Suspense` chegarasi | Ortiqcha murakkablik | 3–6 ta |
| nginx buferlashini o'chirmaslik | Streaming ishlamaydi | `proxy_buffering off` |

## Amaliyot

1. Dashboard sahifasini uch `Suspense` chegarasi bilan yozing; har biriga turli kechikish bering (`setTimeout`) va Slow 3G da bo'lak-bo'lak kelishini kuzating.
2. `loading.tsx` va `<Suspense>` ni solishtiring: qaysi biri qachon ishlaydi?
3. Waterfall yarating (ota `await`, bola so'rovi) va uni promise'ni yuqorida boshlash bilan tuzating; vaqtni o'lchang.
4. `searchParams` ni sahifa ildizida o'qing va build'da `ƒ` bo'lganini ko'ring; keyin pastki komponentga tushiring.
5. PPR ni yoqing va statik qobiq + dinamik teshik naqshini sinab ko'ring.
6. Skeletni spinner bilan almashtiring va CLS farqini Lighthouse'da o'lchang.

## Rasmiy hujjat

- Streaming: <https://nextjs.org/docs/app/getting-started/fetching-data#streaming>
- `loading.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/loading>
- PPR: <https://nextjs.org/docs/app/getting-started/partial-prerendering>
