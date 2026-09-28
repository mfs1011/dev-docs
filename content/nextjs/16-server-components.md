# 16 — Server Components

[← Oldingi: Route Handlers](15-route-handlers.md) · [Mundarija](README.md) · [Keyingi: Ma'lumot yuklash →](17-malumot-yuklash.md)

## Tushuncha

React Server Components (RSC) — komponentni **serverda bajarish va natijani seriyalangan daraxt sifatida** klientga yuborish. Bu HTML ham emas, JS ham emas — maxsus format (RSC payload).

```
Server                              Klient
──────                              ──────
ProductsPage (async)
  await db.query()
  → RSC payload  ────────────────▶  React daraxtni tiklaydi
                                    'use client' komponentlar jonlanadi
```

04-bobda chegarani ko'rdik; bu bobda **nima uchun bunday qilingan** va uning oqibatlari.

## Nega shunday: uch muammo

| Muammo (SPA'da) | RSC yechimi |
| --- | --- |
| Ma'lumot uchun HTTP zanjiri: HTML → JS → so'rov → render | Server bazaga to'g'ridan-to'g'ri murojaat qiladi |
| Kutubxonalar bundle'ga tushadi (markdown, sana, syntax highlight) | Ular serverda qoladi |
| Sirlar klientga chiqish xavfi | Server kodi hech qachon yuborilmaydi |

Misol: markdown render qiluvchi komponent.

::: ts
```tsx
// Server komponent — `marked` (50 KB) klientga YUBORILMAYDI
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

export async function Article({ slug }: { slug: string }) {
  const post = await db.post.findUnique({ where: { slug } })

  if (!post) return null

  const html = DOMPurify.sanitize(await marked(post.markdown))

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```
:::

::: js
```jsx
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

export async function Article({ slug }) {
  const post = await db.post.findUnique({ where: { slug } })

  if (!post) return null

  const html = DOMPurify.sanitize(await marked(post.markdown))

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```
:::

SPA'da bu kutubxonalar **har foydalanuvchiga** yuklanardi.

## Kod: RSC payload nima

Server HTML bilan birga shunday narsa yuboradi (soddalashtirilgan):

```
1:["$","div",null,{"className":"card","children":[
  ["$","h3",null,{"children":"Klaviatura"}],
  ["$","$L2",null,{"productId":42}]        ← klient komponentga havola
]}]
2:I["./AddToCartButton.tsx",["chunk-abc"],"AddToCartButton"]
```

Bu — **React elementlar daraxti**, HTML emas. Shuning uchun:

- Navigatsiyada butun sahifa emas, faqat o'zgargan qism so'raladi;
- Klient holati saqlanadi (layout qayta render bo'lmaydi);
- Klient komponentlar `$L2` kabi havolalar orqali ulanadi.

DevTools → Network → `?_rsc=` so'rovlarida buni ko'rish mumkin.

## Kod: seriyalash chegarasi

Server → klient props **seriyalanishi** kerak:

```tsx
// ✓ Mumkin
<ClientComp
  text="salom"
  count={5}
  items={[{ id: 1, title: 'X' }]}
  date={new Date()}
  map={new Map([['a', 1]])}
  promise={getData()}            // Promise ham! (klientda `use()` bilan o'qiladi)
/>

// ✗ Mumkin emas
<ClientComp
  onSave={() => {}}              // oddiy funksiya
  instance={new Chart()}         // sinf nusxasi
  el={document.body}             // DOM
  symbol={Symbol('x')}
/>
```

**Istisno:** Server Action — funksiya bo'lsa ham uzatiladi (21-bob), chunki u aslida havola (ID) sifatida seriyalanadi.

Promise uzatish — kuchli naqsh (20-bob):

::: ts
```tsx
// Server
export default function Page() {
  const commentsPromise = getComments()      // await QILINMAYDI

  return (
    <>
      <Article />
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments promise={commentsPromise} />
      </Suspense>
    </>
  )
}

// Klient
'use client'

import { use } from 'react'

export function Comments({ promise }: { promise: Promise<Comment[]> }) {
  const comments = use(promise)

  return <ul>{comments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>
}
```
:::

::: js
```jsx
// Server
export default function Page() {
  const commentsPromise = getComments()

  return (
    <>
      <Article />
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments promise={commentsPromise} />
      </Suspense>
    </>
  )
}

// Klient
'use client'

import { use } from 'react'

export function Comments({ promise }) {
  const comments = use(promise)

  return <ul>{comments.map((c) => <li key={c.id}>{c.text}</li>)}</ul>
}
```
:::

## Kod: server komponentlarda nima yo'q

```tsx
// ✗ Hooklar
const [state, setState] = useState()          // xato
useEffect(() => {})                            // xato
const ctx = useContext(ThemeContext)           // xato

// ✗ Hodisalar
<button onClick={handleClick}>                 // xato: funksiya seriyalanmaydi

// ✗ Brauzer API'lari
window.localStorage                            // ReferenceError

// ✓ Mavjud
await db.query()
await fetch(url)
await cookies()
await headers()
process.env.SECRET
```

Bu cheklovlar tabiiy: server komponent **bir marta** ishlaydi va natija yuboriladi — u foydalanuvchi bilan muloqot qila olmaydi.

## Kod: `cache()` bilan so'rovni birlashtirish

Bitta render davomida bir xil ma'lumot bir necha joyda kerak bo'lsa:

::: ts
```ts
// lib/queries.ts
import { cache } from 'react'
import 'server-only'

export const getUser = cache(async (id: number) => {
  console.log('DB so\'rov:', id)              // bir render davomida BIR MARTA chiqadi

  return db.user.findUnique({ where: { id } })
})
```
:::

::: js
```js
// lib/queries.js
import { cache } from 'react'
import 'server-only'

export const getUser = cache(async (id) => {
  console.log('DB so\'rov:', id)

  return db.user.findUnique({ where: { id } })
})
```
:::

```tsx
// Uch joyda chaqiriladi, so'rov bitta
export async function generateMetadata({ params }) {
  const user = await getUser(id)               // 1
  return { title: user.name }
}

export default async function Page({ params }) {
  const user = await getUser(id)               // 2 — keshdan
  return <Profile user={user} />
}

async function Sidebar({ id }) {
  const user = await getUser(id)               // 3 — keshdan
  return <Avatar src={user.avatar} />
}
```

`cache()` — **so'rov darajasidagi** memoizatsiya: har so'rovda bo'shatiladi, foydalanuvchilar orasida bo'lishilmaydi. `fetch` uchun bu avtomatik ishlaydi (18-bob).

Bu naqsh **props drilling'dan qutqaradi**: har komponent o'ziga kerak ma'lumotni o'zi so'raydi, so'rov esa takrorlanmaydi.

## Kod: `server-only` va `client-only`

```ts
// lib/db.ts
import 'server-only'                 // klient faylidan import qilinsa — BUILD XATOSI

export const db = new PrismaClient()
```

```ts
// lib/analytics.ts
import 'client-only'

export function track(event: string) {
  window.gtag?.('event', event)
}
```

Bu — 45-bobdagi xavfsizlik qatlamlaridan biri. `lib/db.ts` va `lib/auth.ts` ga uni **boshidanoq** qo'ying.

## Kod: kompozitsiya naqshlari

::: ts
```tsx
// 1. Klient o'ram + server mazmun (eng muhim naqsh)
<ClientTabs>
  <ServerPanel />          {/* children sifatida — serverda render qilingan */}
</ClientTabs>

// 2. Server ma'lumot + klient interaktivlik
export default async function Page() {
  const product = await getProduct(slug)

  return (
    <>
      <ProductInfo product={product} />              {/* server */}
      <AddToCartButton productId={product.id} />     {/* klient */}
    </>
  )
}

// 3. Klientga faqat kerakli ma'lumot
<ClientChart data={chartData} />                     {/* butun obyekt emas */}
```
:::

::: js
```jsx
// 1. Klient o'ram + server mazmun
<ClientTabs>
  <ServerPanel />
</ClientTabs>

// 2. Server ma'lumot + klient interaktivlik
export default async function Page() {
  const product = await getProduct(slug)

  return (
    <>
      <ProductInfo product={product} />
      <AddToCartButton productId={product.id} />
    </>
  )
}
```
:::

Uchinchi qoida muhim: klientga **faqat kerakli maydonlarni** uzating. Butun `product` obyektini uzatsangiz, uning hamma maydoni RSC payload'ga (ya'ni HTML'ga) tushadi va sahifa hajmi o'sadi (43-bob).

## Muhandislik nuqtai nazari: RSC va an'anaviy SSR farqi

| | An'anaviy SSR (Pages Router) | RSC (App Router) |
| --- | --- | --- |
| Server nima yuboradi | HTML + **butun** komponent JS | HTML + faqat klient komponentlar JS |
| Hydration | Butun daraxt | Faqat klient orollar |
| Ma'lumot | `getServerSideProps` (sahifa darajasida) | Har komponentda `await` |
| Navigatsiya | Klient router, ma'lumot `fetch` bilan | RSC payload |
| Bundle | Barcha komponentlar | Faqat interaktivlar |

Amaliy natija: RSC'da **"ma'lumotni sahifa tepasidan pastga uzatish"** muammosi yo'qoladi — har komponent o'zi so'raydi (`cache()` bilan takrorlanmaydi).

## Muhandislik nuqtai nazari: nima serverda, nima klientda qolishi kerak

| Kod | Qayerda |
| --- | --- |
| Baza so'rovlari, ORM | Server |
| API kalitlari, sirlar | Server |
| Markdown, syntax highlight, sana kutubxonalari | Server |
| Katta ma'lumotni filtrlash/agregatsiya | Server |
| Formalar, tugmalar, modallar | Klient |
| Animatsiya, drag-and-drop | Klient |
| Grafik kutubxonalari (canvas) | Klient (lekin ma'lumot serverda tayyorlanadi) |
| `localStorage`, `window` | Klient |

Belgisi: **agar komponent faqat ma'lumot ko'rsatsa — u server komponent bo'lishi kerak.**

## Muhandislik nuqtai nazari: RSC cheklovlari

RSC hamma narsani yechmaydi:

| Cheklov | Oqibat |
| --- | --- |
| Har navigatsiya server so'rovi | Offline ishlamaydi, tarmoq kechikishi seziladi |
| Interaktiv holat klientda | Murakkab UI baribir klient komponentlar talab qiladi |
| Seriyalash narxi | Katta ma'lumot RSC payload'ni shishiradi |
| Debug qiyinroq | Xato serverda, stack trace boshqacha |
| Ekotizm | Ba'zi kutubxonalar hali `'use client'` talab qiladi |

Shuning uchun real ilovada RSC va klient holati **birga** ishlatiladi (24-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Server komponentga `onClick` berish | Funksiya seriyalanmaydi | Klient komponent |
| Butun obyektni klientga uzatish | RSC payload shishadi | Kerakli maydonlar |
| `cache()` ni ishlatmaslik | Bir xil so'rov bir necha marta | `cache()` yoki `fetch` |
| `server-only` yozmaslik | Sir klientga tushishi mumkin | Har server modulida |
| Har ma'lumot uchun `/api` qatlami | Keraksiz sakrash (15-bob) | To'g'ridan-to'g'ri |
| Klient faylidan server komponentni import qilish | U ham klientga aylanadi | `children` orqali |
| RSC'ni "tezroq SSR" deb tushunish | Model boshqacha | Bundle va ma'lumot yaqinligi |

## Amaliyot

1. Markdown render qiluvchi server komponent yozing va `npm run build` da bundle hajmini klient variantidagi bilan solishtiring.
2. `cache()` bilan `getUser` yozing, uni uch joyda chaqiring va `console.log` orqali so'rov bir marta ketishini tasdiqlang.
3. `server-only` ni `lib/db.ts` ga qo'shing va klient komponentdan import qilishga urinib ko'ring.
4. Server komponentdan klientga `Promise` uzating va `use()` bilan o'qing.
5. DevTools → Network'da `?_rsc=` so'rovini toping va uning mazmunini ko'ring.

## Rasmiy hujjat

- Server Components: <https://nextjs.org/docs/app/getting-started/server-and-client-components>
- React Server Components: <https://react.dev/reference/rsc/server-components>
- `cache()`: <https://react.dev/reference/react/cache>
