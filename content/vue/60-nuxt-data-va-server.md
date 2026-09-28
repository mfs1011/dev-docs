# 60 — Nuxt: ma'lumot yuklash va server

[← Oldingi: Nuxt asoslari](59-nuxt-asoslari.md) · [Mundarija](README.md) · [Keyingi: SEO va meta →](61-seo-va-meta.md)

## Tushuncha

Nuxt'dagi ma'lumot yuklash uchta funksiyaga tayanadi:

| Funksiya | Qachon | Xususiyati |
| --- | --- | --- |
| `useFetch` | Komponent `setup` da | SSR'da serverda ishlaydi, natija klientga uzatiladi |
| `useAsyncData` | Komponent `setup` da | Har qanday async funksiya uchun (faqat HTTP emas) |
| `$fetch` | Istalgan joyda | Oddiy HTTP chaqiruv, holat boshqarmaydi |

Asosiy farq: birinchi ikkitasi **SSR'da ma'lumotni serverda yuklaydi va klientda takrorlamaydi** (56-bobdagi holat uzatish avtomatik bajariladi).

## Kod: `useFetch`

```vue
<script setup>
const route = useRoute()

const { data: post, status, error, refresh } = await useFetch(`/api/posts/${route.params.slug}`)
</script>

<template>
    <UiSkeleton v-if="status === 'pending'" />
    <UiError v-else-if="error" :error="error" @retry="refresh" />
    <article v-else>
        <h1>{{ post.title }}</h1>
    </article>
</template>
```

Sozlamalar:

```js
const { data } = await useFetch('/api/products', {
  query: { page: pageRef },              // reaktiv — o'zgarsa qayta yuklanadi
  key: 'products',                       // kesh kaliti
  server: true,                          // SSR'da yuklansinmi (standart: true)
  lazy: false,                           // navigatsiyani bloklasinmi
  immediate: true,
  watch: [pageRef],                      // qaysi manbalarga qarab qayta yuklash
  transform: (res) => res.items,         // javobni o'zgartirish
  pick: ['id', 'title'],                 // faqat kerakli maydonlar (payload hajmi kamayadi)
  default: () => [],                     // boshlang'ich qiymat
})
```

`pick` va `transform` amaliy ahamiyatga ega: serverdan klientga uzatiladigan holat HTML ichiga yoziladi, shuning uchun uni kichik ushlash kerak.

## Kod: `useAsyncData`

```js
// HTTP bo'lmagan yoki bir nechta so'rov birlashtiriladigan holat
const { data } = await useAsyncData('dashboard', async () => {
  const [stats, orders] = await Promise.all([
    $fetch('/api/stats'),
    $fetch('/api/orders?limit=5'),
  ])

  return { stats, orders }
})
```

Birinchi argument — **kalit**: u bo'yicha natija keshlanadi va serverdan klientga uzatiladi. Kalitni takrorlamang — ikki joyda bir xil kalit bo'lsa, ma'lumot bir-birini almashtiradi.

## Kod: `$fetch` — hodisalar uchun

```vue
<script setup>
const form = reactive({ title: '' })
const saving = ref(false)

async function submit() {
  saving.value = true

  try {
    const created = await $fetch('/api/posts', { method: 'POST', body: form })

    await navigateTo(`/blog/${created.slug}`)
  } catch (error) {
    // Nuxt xatoni FetchError sifatida beradi: error.statusCode, error.data
    console.error(error.data?.message)
  } finally {
    saving.value = false
  }
}
</script>
```

Qoida: **`useFetch` — sahifa yuklanishida, `$fetch` — foydalanuvchi harakatida.** `useFetch` ni tugma bosilganda chaqirish noto'g'ri: u `setup` darajasidagi composable.

## Kod: server API (Nitro)

Nuxt ichida to'liq backend bor:

```
server/
├── api/
│   ├── posts/
│   │   ├── index.get.js       → GET  /api/posts
│   │   ├── index.post.js      → POST /api/posts
│   │   └── [slug].get.js      → GET  /api/posts/:slug
│   └── health.js              → har qanday metod
├── middleware/
│   └── auth.js                ← har so'rovda ishlaydi
└── utils/
```

```js
// server/api/posts/index.get.js
export default defineEventHandler(async (event) => {
  const { page = 1, limit = 20 } = getQuery(event)

  const posts = await db.post.findMany({
    skip: (page - 1) * limit,
    take: Number(limit),
  })

  return posts                      // avtomatik JSON
})
```

```js
// server/api/posts/index.post.js
import { z } from 'zod'

const schema = z.object({ title: z.string().min(3), body: z.string() })

export default defineEventHandler(async (event) => {
  const user = event.context.user           // middleware qo'ygan

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Avtorizatsiya kerak' })
  }

  const body = await readValidatedBody(event, schema.parse)

  return db.post.create({ data: { ...body, authorId: user.id } })
})
```

```js
// server/middleware/auth.js
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'token')

  if (token) event.context.user = await verifyToken(token)
})
```

Bu qatlam ikki sababga ko'ra qimmatli:

1. **Maxfiy kalitlar serverda qoladi** — klient hech qachon tashqi API kalitini ko'rmaydi (06, 65-bob);
2. **Bir xil til va bir xil tiplar** — `server/` va `app/` bitta loyihada, tiplarni bo'lishadi.

## Kod: server kesh

```js
// server/api/rates.get.js
export default defineCachedEventHandler(
  async () => {
    return $fetch('https://external-api.example.com/rates')
  },
  { maxAge: 60 * 10 },                     // 10 daqiqa
)
```

Tashqi API'ga soatiga 1 000 chaqiruv o'rniga 6 ta chaqiruv ketadi. 58-bobdagi ISR bilan birga bu server yukini keskin kamaytiradi.

## Kod: xatolar

```js
// Server tomonda
throw createError({ statusCode: 404, statusMessage: 'Post topilmadi' })

// Sahifada
const { data, error } = await useFetch(`/api/posts/${slug}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Topilmadi', fatal: true })
}
```

```vue
<!-- app/error.vue — global xato sahifasi -->
<script setup>
const props = defineProps({ error: Object })
</script>

<template>
    <div class="error-page">
        <h1>{{ error.statusCode }}</h1>
        <p>{{ error.statusMessage }}</p>
        <button @click="clearError({ redirect: '/' })">Bosh sahifaga</button>
    </div>
</template>
```

`fatal: true` — xato sahifasini ko'rsatadi; usiz xato faqat `error` ref'ida qoladi.

## Muhandislik nuqtai nazari: `useFetch` va `$fetch` chalkashligi

Eng ko'p uchraydigan Nuxt xatosi — ikkita so'rov ketishi:

```js
// ✗ useFetch ichida $fetch — ikki marta
const { data } = await useFetch(() => $fetch('/api/posts'))

// ✓
const { data } = await useFetch('/api/posts')

// ✓ murakkab mantiq bo'lsa
const { data } = await useAsyncData('posts', () => $fetch('/api/posts'))
```

Sabab: `useFetch` — `useAsyncData` + `$fetch` ning birlashmasi. Ichida yana `$fetch` yozsangiz, qatlam takrorlanadi.

## Muhandislik nuqtai nazari: payload hajmi

SSR'da yuklangan ma'lumot HTML ichiga yoziladi. 500 KB JSON — bu 500 KB qo'shimcha HTML, ya'ni sekin LCP.

Kamaytirish usullari:

| Usul | Ta'siri |
| --- | --- |
| `pick: ['id', 'title']` | Faqat kerakli maydonlar |
| `transform` | Serverda qayta ishlash, kichik natija |
| `lazy: true` + klientda yuklash | Payload'ga umuman tushmaydi |
| `server: false` | Faqat klientda (SEO kerak bo'lmasa) |

Amaliy tekshiruv: sahifa manbasini oching va `<script id="__NUXT_DATA__">` hajmini ko'ring.

## Muhandislik nuqtai nazari: `server/` qatlami qachon kerak

| Holat | Yechim |
| --- | --- |
| Mavjud backend bor (Laravel, Symfony, Go) | `server/` kerak emas, to'g'ridan-to'g'ri murojaat qiling |
| Tashqi API kaliti yashirilishi kerak | `server/api/` proksi sifatida |
| Kichik ilova, alohida backend ortiqcha | To'liq `server/` (Nitro + DB) |
| Webhook, cron, fayl yuklash | `server/` qulay |

Nitro Node, Deno, Bun, Cloudflare Workers, Vercel Edge va boshqalarga deploy bo'ladi — bu uni proksi qatlami sifatida ayniqsa foydali qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `useFetch` ichida `$fetch` | Ikki marta so'rov | Faqat bittasi |
| `useFetch` ni tugma bosilganda chaqirish | U setup composable'i | `$fetch` |
| `useAsyncData` kalitini takrorlash | Ma'lumot bir-birini almashtiradi | Noyob kalit |
| Katta javobni `pick`/`transform` siz uzatish | HTML shishadi | Kerakli maydonlar |
| Maxfiy kalitni klient kodida ishlatish | Ochiq ko'rinadi | `server/api/` proksi |
| `error.value` ni tekshirmasdan `data.value` ga murojaat | Runtime xato | Uchta holatni ham qarang |
| Server route'da validatsiya qilmaslik | Xavfsizlik teshigi | `readValidatedBody` + zod |

## Amaliyot

1. `server/api/posts/index.get.js` yozing va sahifada `useFetch` bilan ko'rsating.
2. `server: false` va `lazy: true` variantlarini sinab ko'ring; `__NUXT_DATA__` hajmi qanday o'zgaradi?
3. Tashqi API uchun proksi yozing: kalit faqat `runtimeConfig` da qolsin.
4. `defineCachedEventHandler` bilan keshni yoqing va Network panelida tashqi so'rovlar sonini solishtiring.
5. `createError({ fatal: true })` bilan 404 sahifasini ko'rsating va `app/error.vue` ni yozing.

## Rasmiy hujjat

- Ma'lumot yuklash: <https://nuxt.com/docs/getting-started/data-fetching>
- `useFetch`: <https://nuxt.com/docs/api/composables/use-fetch>
- Server qatlami: <https://nuxt.com/docs/guide/directory-structure/server>
- Nitro: <https://nitro.build>
