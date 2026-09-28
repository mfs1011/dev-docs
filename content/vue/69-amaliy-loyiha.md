# 69 — Amaliy loyiha

[← Oldingi: Monitoring va xatolar](68-monitoring-va-xatolar.md) · [Mundarija](README.md) · [Keyingi: Checklist va migratsiya →](70-checklist-va-migratsiya.md)

## Tushuncha

Bu bobda qo'llanmadagi hamma bo'lakni bitta ilovaga yig'amiz: **kichik e-commerce** — katalog, mahsulot sahifasi, savat, buyurtma va admin bo'limi.

Maqsad — kod nusxa ko'chirish emas, **qarorlar ketma-ketligini** ko'rsatish: qaysi bosqichda nima tanlanadi va nega.

## Qadam 1 — arxitektura qarorlari

| Savol | Qaror | Sabab | Bob |
| --- | --- | --- | --- |
| Render rejimi | Nuxt: katalog SSG/ISR, savat va admin SPA | SEO katalogga kerak, admin login orqasida | 04, 58 |
| API uslubi | Composition API + `<script setup>` | Composable'lar, TS | 05 |
| TypeScript | Ha, `strict` | Domen modellari murakkab | 48 |
| Holat | Pinia: `auth`, `cart`; server ma'lumoti — `useFetch` | Klient/server holatini ajratish | 41, 44 |
| Formalar | zod sxemasi + `useForm` | Validatsiya bir manbadan | 45 |
| Testlar | Vitest (birlik + komponent), Playwright (checkout oqimi) | Piramida | 51 |
| Uslublar | CSS o'zgaruvchilari + `scoped` | Tema, izolyatsiya | 37 |

## Qadam 2 — papka tuzilmasi

```
app/
├── components/
│   ├── ui/                 UiButton, UiInput, UiModal, UiField
│   ├── product/            ProductCard, ProductGrid, ProductFilters
│   └── cart/               CartDrawer, CartLine, CartSummary
├── composables/
│   ├── useCatalog.ts
│   └── useCheckout.ts
├── layouts/                default.vue, admin.vue
├── middleware/             auth.ts
├── pages/
│   ├── index.vue
│   ├── products/index.vue
│   ├── products/[slug].vue
│   ├── cart.vue
│   ├── checkout.vue
│   └── admin/products/index.vue
├── stores/                 auth.ts, cart.ts
└── types/                  index.ts
server/
├── api/products/index.get.ts
├── api/orders/index.post.ts
└── middleware/auth.ts
```

Chegara qoidasi (06-bob): `components/product` `components/ui` dan import qiladi, teskarisi — yo'q.

## Qadam 3 — domen modellari va sxemalar

```ts
// app/types/index.ts
import { z } from 'zod'

export const productSchema = z.object({
  id: z.number(),
  slug: z.string(),
  title: z.string(),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()),
})

export type Product = z.infer<typeof productSchema>

export const orderSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 belgi'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Telefon +998XXXXXXXXX shaklida'),
  address: z.string().min(10, 'Manzilni to\'liq yozing'),
  items: z.array(z.object({ productId: z.number(), qty: z.number().int().positive() })).min(1),
})

export type OrderInput = z.infer<typeof orderSchema>
```

Tip va validatsiya bitta manbadan (45, 48-bob).

## Qadam 4 — savat store'i

```ts
// app/stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  const lines = ref<{ product: Product; qty: number }[]>([])

  const count = computed(() => lines.value.reduce((sum, l) => sum + l.qty, 0))
  const subtotal = computed(() => lines.value.reduce((sum, l) => sum + l.product.price * l.qty, 0))
  const isEmpty = computed(() => lines.value.length === 0)

  function add(product: Product, qty = 1) {
    const line = lines.value.find((l) => l.product.id === product.id)

    if (!line) {
      lines.value.push({ product, qty })
      return
    }

    line.qty = Math.min(line.qty + qty, product.stock)      // qoldiqdan oshmasin
  }

  function setQty(productId: number, qty: number) {
    const line = lines.value.find((l) => l.product.id === productId)
    if (!line) return

    if (qty <= 0) remove(productId)
    else line.qty = Math.min(qty, line.product.stock)
  }

  function remove(productId: number) {
    lines.value = lines.value.filter((l) => l.product.id !== productId)
  }

  function clear() {
    lines.value = []
  }

  return { lines, count, subtotal, isEmpty, add, setQty, remove, clear }
}, { persist: true })                                       // 43-bobdagi plugin
```

Diqqat: savat **klient holati**, katalog esa **server holati** — ular alohida qatlamlarda (41-bob).

## Qadam 5 — katalog sahifasi

```vue
<!-- app/pages/products/index.vue -->
<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// URL — holat manbai (39-bob)
const page = computed({
  get: () => Number(route.query.page ?? 1),
  set: (value) => router.replace({ query: { ...route.query, page: value } }),
})

const query = computed({
  get: () => (route.query.q as string) ?? '',
  set: (value) => router.replace({ query: { ...route.query, q: value || undefined, page: undefined } }),
})

const { data, status, error, refresh } = await useFetch('/api/products', {
  query: { page, q: query },
  key: 'products',
  transform: (res) => ({ items: res.items, total: res.total }),       // payload kichik (60-bob)
})

useSeoMeta({
  title: 'Mahsulotlar',
  description: 'Katalogdagi barcha mahsulotlar',
})
</script>

<template>
    <div class="catalog">
        <ProductFilters v-model:query="query" />

        <UiSkeletonGrid v-if="status === 'pending'" :count="12" />
        <UiError v-else-if="error" :error="error" @retry="refresh" />
        <UiEmpty v-else-if="!data.items.length" title="Hech narsa topilmadi" />
        <ProductGrid v-else :products="data.items" />

        <UiPagination v-model:page="page" :total="data.total" :per-page="24" />
    </div>
</template>
```

To'rt holat naqshi (12-bob) va URL holati (39-bob) shu yerda birga ishlaydi.

## Qadam 6 — mahsulot sahifasi

```vue
<!-- app/pages/products/[slug].vue -->
<script setup lang="ts">
const route = useRoute()
const cart = useCartStore()

const { data: product } = await useFetch<Product>(`/api/products/${route.params.slug}`)

if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Mahsulot topilmadi', fatal: true })
}

const qty = ref(1)
const canAdd = computed(() => product.value.stock > 0)

function addToCart() {
  cart.add(product.value, qty.value)
  useToast().success(`${product.value.title} savatga qo'shildi`)
}

useSeoMeta({
  title: product.value.title,
  ogImage: product.value.images[0],
})

useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.value.title,
      offers: {
        '@type': 'Offer',
        price: product.value.price,
        priceCurrency: 'UZS',
        availability: product.value.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
    }),
  }],
})
</script>

<template>
    <article class="product">
        <ProductGallery :images="product.images" :alt="product.title" />

        <div>
            <h1>{{ product.title }}</h1>
            <p class="price">{{ $n(product.price, 'currency') }}</p>

            <UiQuantity v-model="qty" :max="product.stock" />

            <UiButton :disabled="!canAdd" @click="addToCart">
                {{ canAdd ? 'Savatga' : 'Omborda yo\'q' }}
            </UiButton>
        </div>
    </article>
</template>
```

SEO (61-bob), i18n formatlash (66-bob), erishimlilik uchun `alt` (64-bob) — hammasi bir joyda.

## Qadam 7 — checkout

```vue
<!-- app/pages/checkout.vue -->
<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const cart = useCartStore()
const router = useRouter()

if (cart.isEmpty) await navigateTo('/cart')

const { values, errors, touch, handleSubmit } = useForm(orderSchema, {
  name: '', phone: '+998', address: '', items: [],
})

const { mutate: submitOrder, loading } = useMutation((payload: OrderInput) =>
  $fetch('/api/orders', { method: 'POST', body: payload }),
)

async function onSubmit() {
  await handleSubmit(async (data) => {
    const order = await submitOrder({
      ...data,
      items: cart.lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
    })

    cart.clear()
    await router.push(`/orders/${order.id}`)
  })
}
</script>

<template>
    <form novalidate class="checkout" @submit.prevent="onSubmit">
        <UiField v-slot="{ id, describedby }" label="Ism" :error="errors.name">
            <input :id="id" v-model.trim="values.name" :aria-describedby="describedby" @blur="touch('name')">
        </UiField>

        <UiField v-slot="{ id }" label="Telefon" :error="errors.phone">
            <input :id="id" v-model.trim="values.phone" type="tel" @blur="touch('phone')">
        </UiField>

        <CartSummary :lines="cart.lines" :subtotal="cart.subtotal" />

        <UiButton type="submit" :disabled="loading">
            {{ loading ? 'Yuborilmoqda…' : 'Buyurtma berish' }}
        </UiButton>
    </form>
</template>
```

Forma naqshi (45-bob), mutatsiya va ikki marta bosishdan himoya (44-bob), middleware (59-bob).

## Qadam 8 — server API

```ts
// server/api/orders/index.post.ts
import { orderSchema } from '~/app/types'

export default defineEventHandler(async (event) => {
  const user = event.context.user
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Avtorizatsiya kerak' })

  const body = await readValidatedBody(event, orderSchema.parse)      // serverda ham tekshiruv

  // Narxni klientdan olmang — bazadan oling
  const products = await db.product.findMany({
    where: { id: { in: body.items.map((i) => i.productId) } },
  })

  const total = body.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)
    if (!product) throw createError({ statusCode: 422, statusMessage: 'Mahsulot topilmadi' })
    if (product.stock < item.qty) throw createError({ statusCode: 422, statusMessage: `${product.title}: yetarli emas` })

    return sum + product.price * item.qty
  }, 0)

  return db.order.create({ data: { userId: user.id, total, items: { create: body.items } } })
})
```

**Narx va qoldiq har doim serverda hisoblanadi** (65-bob). Klientdan kelgan `price` ni ishonib olish — eng keng tarqalgan e-commerce zaifligi.

## Qadam 9 — testlar

```ts
// stores/cart.spec.ts — biznes mantiq
it('qoldiqdan oshib ketmaydi', () => {
  setActivePinia(createPinia())
  const cart = useCartStore()

  cart.add({ id: 1, price: 100, stock: 3 } as Product, 5)

  expect(cart.count).toBe(3)
})
```

```ts
// components/ProductCard.spec.ts — komponent
it('omborda yo\'q mahsulotda tugma o\'chirilgan', () => {
  render(ProductCard, { props: { product: { ...product, stock: 0 } } })

  expect(screen.getByRole('button', { name: /omborda/i })).toBeDisabled()
})
```

```ts
// e2e/checkout.spec.ts — oqim
test('mahsulotni buyurtma qilish', async ({ page }) => {
  await page.goto('/products')
  await page.getByRole('link', { name: /klaviatura/i }).click()
  await page.getByRole('button', { name: 'Savatga' }).click()
  await page.getByRole('link', { name: /savat/i }).click()
  await page.getByRole('button', { name: 'Buyurtma berish' }).click()

  await page.getByLabel('Ism').fill('Aziz')
  await page.getByLabel('Telefon').fill('+998901234567')
  await page.getByRole('button', { name: 'Buyurtma berish' }).click()

  await expect(page.getByText(/buyurtmangiz qabul qilindi/i)).toBeVisible()
})
```

## Qadam 10 — reliz

67-bobdagi checklist bo'yicha: CI (lint + types + test + build) → deploy → smoke test → monitoring (68-bob).

## Muhandislik nuqtai nazari: qurilish tartibi

Tajribasiz jamoalar odatda UI'dan boshlaydi va oxirida ma'lumot oqimini "yopishtirishga" harakat qiladi. Foydaliroq tartib:

1. **Domen modellari va sxemalar** — nima bilan ishlaymiz;
2. **API shartnomasi** — server nima qaytaradi;
3. **Store va composable'lar** — biznes mantiq (test bilan);
4. **Sahifalar** — ma'lumot oqimi;
5. **UI komponentlari** — ko'rinish;
6. **Sayqal** — animatsiya, skeletlar, chekka holatlar.

Sabab: 1–3 bosqichdagi xato eng qimmat; UI esa oxirida ham oson o'zgaradi.

## Muhandislik nuqtai nazari: nimani qo'shmaslik kerak

Birinchi versiyaga **kirmaydigan** narsalar:

- Mikro-optimizatsiyalar (62-bob) — o'lchamasdan;
- Umumlashtirilgan "hamma narsa uchun" komponentlar — 3-marta takrorlangandan keyin;
- Murakkab kesh qatlami — oddiy `useFetch` yetmaguncha;
- O'z dizayn tizimingiz — 10 komponentgacha oddiy CSS yetadi;
- Mikro-frontend, monorepo — jamoa 2–3 kishidan oshmaguncha.

Har biri keyinroq qo'shilishi mumkin; erta qo'shilsa, u shunchaki to'siq bo'ladi.

## Amaliyot

1. Yuqoridagi tuzilma bo'yicha loyiha yarating (mock ma'lumot bilan bo'lsa ham).
2. Domen sxemalarini yozing va tiplarni ulardan chiqaring.
3. Savat store'ini testlar bilan yozing (qoldiq chegarasi, miqdor, tozalash).
4. Katalog sahifasini to'rt holat bilan yig'ing va URL holatini ishlating.
5. Checkout formasini zod bilan validatsiya qiling, server xatolarini maydonlarga bog'lang.
6. Checkout oqimi uchun bitta E2E test yozing.
7. Lighthouse'ni ishga tushiring va SEO/a11y/performance bo'yicha uchtadan muammoni tuzating.

## Rasmiy hujjat

- Nuxt namunalari: <https://nuxt.com/docs/examples/hello-world>
- Vue uslub qo'llanmasi: <https://vuejs.org/style-guide/>
- Pinia: <https://pinia.vuejs.org>
