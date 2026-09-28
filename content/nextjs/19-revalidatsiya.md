# 19 — Qayta validatsiya

[← Oldingi: Kesh: to'liq manzara](18-kesh.md) · [Mundarija](README.md) · [Keyingi: Streaming va Suspense →](20-streaming-suspense.md)

## Tushuncha

18-bobda keshni ko'rdik. Endi savol: **keshni qachon va qanday yangilash kerak?**

Ikki yondashuv:

| Usul | Qachon ishlaydi | Nima uchun |
| --- | --- | --- |
| **Vaqt bo'yicha** (`revalidate`) | Belgilangan muddat o'tgach | Tashqi manba, taxminiy yangilik |
| **Talab bo'yicha** (`revalidateTag`, `revalidatePath`) | Mutatsiyadan keyin darhol | O'z ma'lumotingiz |

To'g'ri ilovada **ikkalasi birga** ishlatiladi: teglar bilan aniq invalidatsiya + zaxira sifatida vaqt chegarasi.

## Kod: vaqt bo'yicha (ISR)

::: ts
```tsx
// 1. Butun marshrut uchun
export const revalidate = 3600            // soatiga bir marta

export default async function ProductsPage() {
  const products = await db.product.findMany()

  return <ProductGrid products={products} />
}

// 2. Alohida so'rov uchun
const res = await fetch(url, { next: { revalidate: 600 } })

// 3. `unstable_cache` bilan
export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ['products'],
  { revalidate: 3600 },
)
```
:::

::: js
```jsx
export const revalidate = 3600

const res = await fetch(url, { next: { revalidate: 600 } })

export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ['products'],
  { revalidate: 3600 },
)
```
:::

ISR qanday ishlaydi:

```
t=0      Birinchi so'rov  → render qilinadi, keshlanadi
t=10m    So'rov           → keshdan (tez)
t=61m    So'rov           → ESKI nusxa beriladi + fon'da yangilanish boshlanadi
t=62m    So'rov           → yangi nusxa
```

Foydalanuvchi hech qachon kutmaydi — bu **stale-while-revalidate** naqshi.

## Kod: teglar bilan invalidatsiya

Eng aniq usul: ma'lumotga **teg** qo'yasiz, mutatsiyadan keyin o'sha tegni bekor qilasiz.

::: ts
```ts
// 1. Teg qo'yish
const res = await fetch('https://api.example.com/products', {
  next: { tags: ['products'], revalidate: 3600 },
})

// unstable_cache bilan
export const getProduct = unstable_cache(
  async (slug: string) => db.product.findUnique({ where: { slug } }),
  ['product'],
  { tags: ['products'], revalidate: 3600 },
)

// Aniqroq teglar
export const getProductById = unstable_cache(
  async (id: number) => db.product.findUnique({ where: { id } }),
  ['product-by-id'],
  { tags: ['products', `product-${id}`] },     // ikki darajali
)
```
:::

::: js
```js
const res = await fetch('https://api.example.com/products', {
  next: { tags: ['products'], revalidate: 3600 },
})

export const getProduct = unstable_cache(
  async (slug) => db.product.findUnique({ where: { slug } }),
  ['product'],
  { tags: ['products'], revalidate: 3600 },
)
```
:::

::: ts
```ts
// 2. Mutatsiyadan keyin bekor qilish
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id: number, data: ProductInput) {
  await db.product.update({ where: { id }, data })

  revalidateTag('products')                 // barcha mahsulot ro'yxatlari
  revalidateTag(`product-${id}`)            // shu mahsulotning o'zi
}
```
:::

::: js
```js
'use server'

import { revalidateTag } from 'next/cache'

export async function updateProduct(id, data) {
  await db.product.update({ where: { id }, data })

  revalidateTag('products')
  revalidateTag(`product-${id}`)
}
```
:::

## Kod: `revalidatePath`

Teg emas, **yo'l** bo'yicha bekor qilish:

::: ts
```ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(data: PostInput) {
  const post = await db.post.create({ data })

  revalidatePath('/blog')                          // aniq sahifa
  revalidatePath('/blog/[slug]', 'page')           // shu naqshdagi barcha sahifalar
  revalidatePath('/', 'layout')                    // layout va uning ostidagilar
}
```
:::

::: js
```js
'use server'

import { revalidatePath } from 'next/cache'

export async function createPost(data) {
  const post = await db.post.create({ data })

  revalidatePath('/blog')
  revalidatePath('/blog/[slug]', 'page')
}
```
:::

| | `revalidateTag` | `revalidatePath` |
| --- | --- | --- |
| Nima bekor qilinadi | Teg qo'yilgan barcha ma'lumot | Ko'rsatilgan yo'l(lar) |
| Aniqlik | Yuqori | Pastroq |
| Qachon | Ma'lumot bir necha sahifada ishlatilsa | Aniq sahifa yangilansa |
| Tavsiya | ✅ Asosiy vosita | Qo'shimcha |

Amalda: **teglarni asosiy vosita qiling**, `revalidatePath` ni layout yoki aniq sahifa uchun.

## Kod: teg strategiyasi

::: ts
```ts
// lib/cache-tags.ts — teglarni bitta joyda saqlash
export const tags = {
  products: {
    all: 'products',
    byId: (id: number) => `product-${id}`,
    byCategory: (categoryId: number) => `products-category-${categoryId}`,
  },
  orders: {
    all: 'orders',
    byUser: (userId: number) => `orders-user-${userId}`,
  },
} as const
```
:::

::: js
```js
// lib/cache-tags.js
export const tags = {
  products: {
    all: 'products',
    byId: (id) => `product-${id}`,
    byCategory: (categoryId) => `products-category-${categoryId}`,
  },
  orders: {
    all: 'orders',
    byUser: (userId) => `orders-user-${userId}`,
  },
}
```
:::

```ts
// Ishlatish
export const getProduct = unstable_cache(
  async (id: number) => db.product.findUnique({ where: { id } }),
  ['product'],
  { tags: [tags.products.all, tags.products.byId(id)] },
)

// Mutatsiyada
revalidateTag(tags.products.byId(id))
```

Teglarni satr sifatida har joyda yozish — xato manbai (imlo xatosi jim o'tadi). Fabrika bilan ular tiplanadi va bir joyda ko'rinadi.

## Kod: webhook orqali invalidatsiya

CMS'da mazmun o'zgarganda saytni yangilash:

::: ts
```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const body = await request.json()

  // CMS qaysi model o'zgarganini yuboradi
  switch (body.model) {
    case 'product':
      revalidateTag('products')
      revalidateTag(`product-${body.id}`)
      break

    case 'post':
      revalidateTag('posts')
      break
  }

  return NextResponse.json({ revalidated: true, now: Date.now() })
}
```
:::

::: js
```js
// app/api/revalidate/route.js
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const secret = request.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const body = await request.json()

  if (body.model === 'product') {
    revalidateTag('products')
    revalidateTag(`product-${body.id}`)
  }

  return NextResponse.json({ revalidated: true })
}
```
:::

**Sirni tekshirish majburiy** — aks holda har kim keshingizni bekor qilib, serverni yuklay oladi.

## Kod: `router.refresh()` — klient tomondan

::: ts
```tsx
'use client'

import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()

  return (
    <button onClick={() => router.refresh()}>
      Yangilash
    </button>
  )
}
```
:::

::: js
```jsx
'use client'

import { useRouter } from 'next/navigation'

export function RefreshButton() {
  const router = useRouter()

  return <button onClick={() => router.refresh()}>Yangilash</button>
}
```
:::

`router.refresh()`:

- Server komponentlarni **qayta so'raydi** (Router Cache'ni chetlab o'tadi);
- Klient holatini **saqlaydi** (forma, scroll, store);
- Data Cache'ga tegmaydi — ya'ni keshlangan `fetch` baribir keshdan keladi.

Shuning uchun **ma'lumotni haqiqatan yangilash** uchun `revalidateTag` + `router.refresh()` birga kerak bo'lishi mumkin.

Server Action ichida `revalidateTag` chaqirilsa, Next klientni avtomatik yangilaydi — qo'shimcha `refresh()` kerak emas (21-bob).

## Kod: to'liq oqim (mutatsiyadan yangilanishgacha)

::: ts
```tsx
// 1. Ma'lumot (teg bilan)
export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ['products-list'],
  { tags: [tags.products.all], revalidate: 3600 },
)

// 2. Sahifa
export default async function ProductsPage() {
  const products = await getProducts()

  return <ProductGrid products={products} />
}

// 3. Mutatsiya (Server Action)
'use server'

export async function deleteProduct(id: number) {
  await db.product.delete({ where: { id } })

  revalidateTag(tags.products.all)          // kesh bekor qilindi
  // Klient avtomatik yangilanadi
}

// 4. Klient komponenti
'use client'

export function DeleteButton({ id }: { id: number }) {
  return (
    <form action={deleteProduct.bind(null, id)}>
      <button type="submit">O'chirish</button>
    </form>
  )
}
```
:::

::: js
```jsx
export const getProducts = unstable_cache(
  async () => db.product.findMany(),
  ['products-list'],
  { tags: ['products'], revalidate: 3600 },
)

'use server'

export async function deleteProduct(id) {
  await db.product.delete({ where: { id } })

  revalidateTag('products')
}
```
:::

Bu — App Router'dagi **standart mutatsiya naqshi**: action → baza → `revalidateTag` → UI o'zi yangilanadi.

## Muhandislik nuqtai nazari: `revalidate` vaqtini tanlash

| Ma'lumot | `revalidate` |
| --- | --- |
| Statik mazmun (about) | Kerak emas |
| Blog, hujjat | 1 soat – 1 kun (+ webhook) |
| Katalog | 10–60 daqiqa (+ teg) |
| Narx, qoldiq | 30–60 soniya yoki dinamik |
| Valyuta kursi | 5–15 daqiqa |
| Shaxsiy ma'lumot | Keshlanmaydi |

Qoida: **teglar bilan aniq invalidatsiya qiling, `revalidate` ni zaxira sifatida qo'ying.** Shunda webhook ishlamay qolsa ham, ma'lumot oxir-oqibat yangilanadi.

## Muhandislik nuqtai nazari: invalidatsiya — eng qiyin qism

Kompyuter fanlarida mashhur ibora bor: *"Faqat ikki qiyin narsa bor: kesh invalidatsiyasi va nomlash."*

Amaliy qiyinchiliklar:

| Muammo | Yechim |
| --- | --- |
| Bitta o'zgarish bir necha joyga ta'sir qiladi | Teglar ierarxiyasi (`products`, `product-42`) |
| Qaysi teg qayerda ishlatilganini unutish | Teg fabrikasi (bitta fayl) |
| Tashqi tizim o'zgartirsa | Webhook |
| Invalidatsiya unutilsa | Zaxira `revalidate` |
| Juda ko'p invalidatsiya | Kesh foydasi yo'qoladi — aniqroq teglar |

Amaliy maslahat: har `db.*.update/create/delete` yonida **darhol** mos `revalidateTag` yozing. Buni keyinga qoldirsangiz, unutiladi.

## Muhandislik nuqtai nazari: CDN keshi bilan

Vercel yoki boshqa CDN'da yana bir qatlam bor:

```bash
curl -I https://example.com/products | grep -i 'x-vercel-cache\|age\|cache-control'
```

| Qiymat | Ma'nosi |
| --- | --- |
| `HIT` | CDN keshidan |
| `STALE` | Eski nusxa, fon'da yangilanmoqda |
| `MISS` | Serverdan olindi |
| `BYPASS` | Kesh chetlab o'tildi (dinamik) |

`revalidateTag` Vercel'da CDN keshini ham bekor qiladi. Boshqa platformalarda buni o'zingiz sozlashingiz kerak bo'lishi mumkin (48-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Mutatsiyadan keyin invalidatsiya qilmaslik | Eski ma'lumot ko'rinadi | `revalidateTag` |
| Teglarni satr sifatida har joyda yozish | Imlo xatosi jim o'tadi | Teg fabrikasi |
| Faqat `revalidate` ga tayanish | Yangilanish kechikadi | Teglar + zaxira vaqt |
| `revalidatePath('/')` ni hamma joyda | Butun kesh bekor bo'ladi | Aniq teglar |
| Webhook endpointini himoyalamaslik | Har kim keshni bekor qiladi | Sir tekshiruvi |
| `router.refresh()` Data Cache'ni tozalaydi deb o'ylash | U faqat Router Cache | `revalidateTag` |
| Invalidatsiyani `dev` da sinash | Dev'da kesh boshqacha | `build && start` |

## Amaliyot

1. ISR sahifa yarating (`revalidate: 30`), bazadagi ma'lumotni o'zgartiring va 30 soniyadan keyin yangilanishini kuzating.
2. Teg fabrikasini yozing va `unstable_cache` da ikki darajali teg ishlating.
3. Server Action yozing: baza yangilansin va `revalidateTag` chaqirilsin; UI o'zi yangilanishini tasdiqlang.
4. Invalidatsiyani olib tashlang va eski ma'lumot qolishini ko'ring.
5. `/api/revalidate` endpointini yozing (sir bilan) va `curl` orqali chaqiring.
6. `curl -I` bilan CDN kesh sarlavhalarini tekshiring (deploy qilingan saytda).

## Rasmiy hujjat

- `revalidateTag`: <https://nextjs.org/docs/app/api-reference/functions/revalidateTag>
- `revalidatePath`: <https://nextjs.org/docs/app/api-reference/functions/revalidatePath>
- ISR: <https://nextjs.org/docs/app/guides/incremental-static-regeneration>
