# 18 — Kesh: to'liq manzara

[← Oldingi: Ma'lumot yuklash](17-malumot-yuklash.md) · [Mundarija](README.md) · [Keyingi: Qayta validatsiya →](19-revalidatsiya.md)

## Tushuncha

"Nega ma'lumot yangilanmayapti?" — Next'dagi eng ko'p beriladigan savol. Sababi: **to'rtta mustaqil kesh qatlami** bor va ular ketma-ket ishlaydi.

```
Brauzer
  │
  ├─▶ ❶ Router Cache        (klientda, navigatsiya uchun)
  │
Server
  ├─▶ ❷ Full Route Cache    (render qilingan HTML/RSC)
  │
  ├─▶ ❸ Data Cache          (fetch natijalari, deploy'lar orasida saqlanadi)
  │
  └─▶ ❹ Request Memoization (bitta render ichida)
```

Ma'lumot yangilanmasa — **qaysi qatlamda qolib ketganini** aniqlash kerak.

## Kod: ❹ Request Memoization — bitta render ichida

Eng ichki qatlam. Bitta render davomida bir xil `fetch` (yoki `cache()` bilan o'ralgan funksiya) **bir marta** bajariladi:

::: ts
```tsx
// Uchala chaqiruv — bitta so'rov
async function getUser(id: string) {
  const res = await fetch(`https://api.example.com/users/${id}`)

  return res.json()
}

export async function generateMetadata({ params }) {
  const user = await getUser(id)          // so'rov ketadi
  return { title: user.name }
}

export default async function Page({ params }) {
  const user = await getUser(id)          // memoizatsiyadan
  return <Profile user={user} />
}

async function Sidebar({ id }) {
  const user = await getUser(id)          // memoizatsiyadan
  return <Avatar src={user.avatar} />
}
```
:::

::: js
```jsx
async function getUser(id) {
  const res = await fetch(`https://api.example.com/users/${id}`)

  return res.json()
}
```
:::

| Xususiyat | Qiymat |
| --- | --- |
| Qamrov | Bitta so'rov (request) |
| Nima keshlanadi | `fetch` (GET) va `cache()` funksiyalari |
| Muddat | Render tugagach bo'shatiladi |
| Foydalanuvchilar orasida | Bo'lishilmaydi |
| O'chirish | Kerak emas (bu har doim foydali) |

ORM so'rovlari uchun `cache()` ni o'zingiz qo'shasiz (16-bob):

```ts
export const getUser = cache(async (id: number) => db.user.findUnique({ where: { id } }))
```

## Kod: ❸ Data Cache — `fetch` natijalari

Serverda saqlanadigan **doimiy** kesh: deploy'lar orasida ham yashaydi (agar tozalanmasa).

::: ts
```tsx
// Next 15+ da STANDART: keshlanmaydi
const res = await fetch('https://api.example.com/products')

// Keshlash: aniq belgilash kerak
const res = await fetch(url, { cache: 'force-cache' })

// ISR: 1 soatda yangilanadi
const res = await fetch(url, { next: { revalidate: 3600 } })

// Teg bilan (19-bobda invalidatsiya uchun)
const res = await fetch(url, { next: { revalidate: 3600, tags: ['products'] } })

// Hech qachon keshlamaslik
const res = await fetch(url, { cache: 'no-store' })
```
:::

::: js
```jsx
const res = await fetch(url, { cache: 'force-cache' })
const res = await fetch(url, { next: { revalidate: 3600, tags: ['products'] } })
const res = await fetch(url, { cache: 'no-store' })
```
:::

> **Next 15 dagi eng muhim o'zgarish:** avval `fetch` **standart holda keshlanardi** (`force-cache`), endi — **yo'q** (`no-store`). Eski maqolalar shu sababdan chalkashtiradi.

| Xususiyat | Qiymat |
| --- | --- |
| Qamrov | Butun ilova, barcha foydalanuvchilar |
| Nima keshlanadi | `fetch` natijalari (opt-in) |
| Muddat | `revalidate` yoki qo'lda invalidatsiyagacha |
| Deploy'dan keyin | Saqlanadi |
| O'chirish | `cache: 'no-store'` |

**Diqqat:** ORM so'rovlari (`db.product.findMany()`) Data Cache'ga **tushmaydi** — ular faqat Request Memoization bilan cheklanadi. Ularni keshlash uchun `unstable_cache` (yoki Next 16 dagi `'use cache'`) ishlatiladi:

::: ts
```ts
import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async (categoryId: number) => db.product.findMany({ where: { categoryId } }),
  ['products-by-category'],                          // kesh kaliti prefiksi
  { revalidate: 3600, tags: ['products'] },
)
```
:::

::: js
```js
import { unstable_cache } from 'next/cache'

export const getProducts = unstable_cache(
  async (categoryId) => db.product.findMany({ where: { categoryId } }),
  ['products-by-category'],
  { revalidate: 3600, tags: ['products'] },
)
```
:::

## Kod: ❷ Full Route Cache — render natijasi

Build vaqtida (yoki birinchi so'rovda) hosil qilingan **HTML va RSC payload**.

```
Route (app)                     Revalidate
┌ ○ /about                              -      ← Full Route Cache'da (static)
├ ● /blog/[slug]                        1h      ← ISR: keshlanadi, yangilanadi
└ ƒ /dashboard                           -      ← keshlanmaydi (dinamik)
```

Marshrut **dinamik** bo'lsa, bu kesh ishlamaydi. Dinamik qiladigan narsalar:

| Sabab | Misol |
| --- | --- |
| Dinamik API | `cookies()`, `headers()`, `connection()` |
| `searchParams` o'qish | Sahifa props'idan |
| Keshlanmagan `fetch` | `cache: 'no-store'` |
| Aniq belgilash | `export const dynamic = 'force-dynamic'` |

::: ts
```tsx
// Bu sahifa DINAMIK bo'ladi — cookies() sababli
export default async function Page() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value

  return <div data-theme={theme}>…</div>
}

// Bu sahifa STATIC qoladi — cookie faqat kichik klient bo'lakda o'qiladi
export default function Page() {
  return (
    <div>
      <StaticContent />
      <Suspense fallback={null}>
        <ThemeAwareWidget />       {/* faqat shu qism dinamik */}
      </Suspense>
    </div>
  )
}
```
:::

::: js
```jsx
export default async function Page() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value

  return <div data-theme={theme}>…</div>
}
```
:::

Bu — **PPR (Partial Prerendering)** g'oyasi: sahifaning statik qobig'i keshlanadi, dinamik teshiklar streaming bilan to'ldiriladi (20-bob).

## Kod: ❶ Router Cache — klientda

Navigatsiya paytida RSC payload **brauzerda** saqlanadi.

| Xususiyat | Qiymat |
| --- | --- |
| Qamrov | Bitta foydalanuvchi sessiyasi |
| Muddat | Sahifa yangilanishigacha (Next 15+ da standart `staleTimes: 0`) |
| Nima uchun | Orqaga/oldinga tugmasi bir zumda ishlaydi |
| Tozalash | `router.refresh()`, `revalidatePath` (Server Action ichida) |

::: ts
```ts
// next.config.ts — Router Cache muddatini sozlash
export default {
  experimental: {
    staleTimes: {
      dynamic: 30,        // dinamik sahifalar 30 s keshda
      static: 180,        // static sahifalar 3 daqiqa
    },
  },
}
```
:::

::: js
```js
export default {
  experimental: {
    staleTimes: { dynamic: 30, static: 180 },
  },
}
```
:::

Next 15+ da `dynamic: 0` standart — ya'ni dinamik sahifalar navigatsiyada **qayta so'raladi**. Bu "eski ma'lumot" muammosini kamaytirdi, lekin navigatsiyani biroz sekinlashtirdi.

## Kod: `'use cache'` (Next 15+ / 16)

Yangi, soddaroq model — funksiya yoki komponentni to'g'ridan-to'g'ri keshlash:

::: ts
```tsx
// Butun sahifa
'use cache'

export default async function ProductsPage() {
  const products = await db.product.findMany()

  return <ProductGrid products={products} />
}

// Yoki alohida funksiya
async function getProducts() {
  'use cache'
  cacheTag('products')
  cacheLife('hours')

  return db.product.findMany()
}
```
:::

::: js
```jsx
async function getProducts() {
  'use cache'
  cacheTag('products')
  cacheLife('hours')

  return db.product.findMany()
}
```
:::

`cacheLife` profillari: `seconds`, `minutes`, `hours`, `days`, `weeks`, `max` — yoki o'zingizniki (`next.config` da).

Bu API `unstable_cache` ning o'rnini bosadi va ORM so'rovlarini keshlashni soddalashtiradi. Yoqish:

```ts
// next.config.ts
export default { experimental: { useCache: true } }
```

Versiyangizda mavjudligini tekshiring — bu qism hali rivojlanmoqda.

## Kod: diagnostika — "nega yangilanmayapti?"

Tartib bilan tekshiring:

```bash
# 1. Build chiqishi: sahifa static (○/●) yoki dinamik (ƒ)?
npm run build

# 2. Kesh loglarini yoqish
```

::: ts
```ts
// next.config.ts
export default {
  logging: {
    fetches: { fullUrl: true },       // har fetch va uning kesh holati konsolda
  },
}
```
:::

::: js
```js
export default {
  logging: { fetches: { fullUrl: true } },
}
```
:::

Konsolda shunday chiqadi:

```
GET /products 200 in 45ms
  │ GET https://api.example.com/products 200 in 42ms (cache skip)
  │   Cache missed reason: (cache: no-store)
```

Tekshiruv ro'yxati:

| Savol | Qayerga qarash |
| --- | --- |
| Sahifa static bo'lib qolganmi? | `npm run build` chiqishi (○/●/ƒ) |
| `fetch` keshlanganmi? | `logging.fetches` loglari |
| ORM so'rovi `unstable_cache` da yopilganmi? | Kod |
| Mutatsiyadan keyin invalidatsiya qilinganmi? | `revalidatePath`/`revalidateTag` (19-bob) |
| Klientda eski RSC payload'mi? | `router.refresh()` |
| CDN keshimi? | Javob sarlavhalari (`x-vercel-cache`, `age`) |

**Muhim:** `next dev` da kesh xatti-harakati **boshqacha** (06-bob) — har doim `npm run build && npm start` bilan tekshiring.

## Muhandislik nuqtai nazari: kesh strategiyasini tanlash

| Ma'lumot turi | Strategiya |
| --- | --- |
| Statik mazmun (about, hujjat) | Full Route Cache (static) |
| Katalog, blog | ISR: `revalidate: 3600` + teg |
| Mahsulot narxi/qoldiq | Qisqa `revalidate` (60 s) yoki dinamik |
| Foydalanuvchi profili | Dinamik (`cookies()`) |
| Qidiruv natijalari | Dinamik |
| Valyuta kurslari, ob-havo | `revalidate` + teg |
| Real-time | Klient (WebSocket/SSE, 37-bob) |

**Qat'iy qoida:** shaxsiy ma'lumot bor sahifa **hech qachon** static yoki ISR bo'lmasin — u keshga tushadi va boshqa foydalanuvchiga ko'rsatilishi mumkin (45-bob).

## Muhandislik nuqtai nazari: keshni to'g'ri joyda ushlash

```
Foydalanuvchi ──▶ CDN ──▶ Next (Route/Data Cache) ──▶ Baza/API
                  ▲        ▲                          ▲
                  │        │                          └─ eng qimmat
                  │        └─ eng moslashuvchan
                  └─ eng tez, lekin invalidatsiya qiyin
```

Qoida: **keshni iste'molchiga qanchalik yaqin ushlasangiz, shunchalik tez — lekin invalidatsiya shunchalik qiyin.**

Amaliy yondashuv: Data Cache'da teglar bilan (invalidatsiya oson), CDN'da esa qisqa TTL bilan.

## Muhandislik nuqtai nazari: kesh va xavfsizlik

```tsx
// ✗ XAVFLI: foydalanuvchiga xos ma'lumot keshlangan sahifada
export const revalidate = 3600

export default async function Page() {
  const user = await getCurrentUser()        // cookies() — aslida dinamik qiladi

  return <div>Salom, {user.name}</div>
}
```

Next bunday holatda sahifani dinamik qiladi (chunki `cookies()` ishlatilgan), lekin **`unstable_cache` ichida cookie o'qisangiz** himoya ishlamaydi:

```ts
// ✗ JUDA XAVFLI
const getUserData = unstable_cache(async () => {
  const cookieStore = await cookies()        // birinchi foydalanuvchining cookie'si keshlanadi!
  // ...
})
```

Qoida: **`unstable_cache` / `'use cache'` ichida hech qachon `cookies()`, `headers()` yoki foydalanuvchiga xos ma'lumot ishlatmang.**

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Next 15+ da `fetch` keshlanadi deb o'ylash | Standart o'zgargan | `cache: 'force-cache'` yoki `revalidate` |
| ORM so'rovi keshlanadi deb o'ylash | U faqat memoizatsiyada | `unstable_cache` / `'use cache'` |
| `force-dynamic` bilan muammoni "hal qilish" | Kesh foydasi yo'qoladi | Sababni toping |
| Kesh xatti-harakatini `dev` da sinash | Dev'da boshqacha | `build && start` |
| Shaxsiy ma'lumotni ISR sahifada | Boshqa foydalanuvchiga ko'rinadi | Dinamik |
| `unstable_cache` ichida `cookies()` | Ma'lumot sizib chiqadi | Tashqarida o'qing |
| Mutatsiyadan keyin invalidatsiya qilmaslik | Eski ma'lumot | `revalidateTag` (19-bob) |
| Build chiqishidagi belgilarni tekshirmaslik | Kutilmagan dinamik sahifalar | Har build'da ko'ring |

## Amaliyot

1. `logging.fetches` ni yoqing va bir sahifada uchta `fetch` qiling: keshlanmagan, `force-cache`, `revalidate: 60`. Loglarda farqni ko'ring.
2. Bitta sahifada `cookies()` ni chaqiring va `npm run build` da u `ƒ` bo'lganini tasdiqlang; keyin cookie o'qishni `<Suspense>` ichidagi kichik komponentga ko'chiring.
3. `unstable_cache` bilan ORM so'rovini keshlang va ikkinchi so'rovda baza logida so'rov yo'qligini tekshiring.
4. ISR sahifa yarating (`revalidate: 30`), ma'lumotni bazada o'zgartiring va 30 soniyadan keyin yangilanishini kuzating.
5. `router.refresh()` ni chaqirib, Router Cache tozalanishini ko'ring.

## Rasmiy hujjat

- Keshlash: <https://nextjs.org/docs/app/guides/caching>
- `fetch` sozlamalari: <https://nextjs.org/docs/app/api-reference/functions/fetch>
- `unstable_cache`: <https://nextjs.org/docs/app/api-reference/functions/unstable_cache>
- `'use cache'`: <https://nextjs.org/docs/app/api-reference/directives/use-cache>
