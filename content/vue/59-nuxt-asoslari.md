# 59 — Nuxt asoslari

[← Oldingi: SSG va prerender](58-ssg-va-prerender.md) · [Mundarija](README.md) · [Keyingi: Nuxt: data va server →](60-nuxt-data-va-server.md)

## Tushuncha

Nuxt — Vue ustidagi to'liq framework. 57-bobda qo'lda yozgan narsalarimiz (SSR, holat uzatish, marshrutlash, meta teglar, build) unda tayyor keladi va ustiga fayl tuzilmasiga asoslangan konvensiyalar qo'shiladi.

```bash
npm create nuxt@latest my-app
cd my-app
npm run dev
```

Versiya: **Nuxt 4.5.2** (2026-yil sentabr). Nuxt 4 dagi asosiy o'zgarish — `app/` papkasi va yangilangan ma'lumot yuklash qatlami.

## Kod: papka tuzilmasi

```
my-app/
├── app/
│   ├── app.vue              ← ildiz komponent
│   ├── pages/               ← fayl-marshrutlar
│   │   ├── index.vue        → /
│   │   ├── about.vue        → /about
│   │   ├── blog/
│   │   │   ├── index.vue    → /blog
│   │   │   └── [slug].vue   → /blog/:slug
│   │   └── [...404].vue     → hamma qolganlari
│   ├── components/          ← avtomatik import (21-bob)
│   ├── composables/         ← avtomatik import
│   ├── layouts/
│   │   ├── default.vue
│   │   └── admin.vue
│   ├── middleware/          ← route guard'lar (40-bob)
│   ├── plugins/             ← Vue pluginlari (31-bob)
│   └── assets/
├── server/                  ← backend (Nitro)
│   ├── api/
│   └── middleware/
├── public/
└── nuxt.config.ts
```

Asosiy g'oya: **fayl joylashuvi — konfiguratsiya.** Marshrutlar, importlar, layoutlar qo'lda ro'yxatdan o'tkazilmaydi.

## Kod: sahifalar va marshrutlar

```vue
<!-- app/pages/blog/[slug].vue -->
<script setup>
const route = useRoute()

const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)
</script>

<template>
    <article>
        <h1>{{ post.title }}</h1>
        <div v-html="post.html" />
    </article>
</template>
```

Marshrut naqshlari:

| Fayl | URL |
| --- | --- |
| `pages/index.vue` | `/` |
| `pages/about.vue` | `/about` |
| `pages/users/[id].vue` | `/users/:id` |
| `pages/users/[id]/edit.vue` | `/users/:id/edit` |
| `pages/docs/[...slug].vue` | `/docs/*` (barcha chuqurlik) |
| `pages/(marketing)/pricing.vue` | `/pricing` (qavs — guruh, URL'ga kirmaydi) |

Navigatsiya:

```vue
<NuxtLink to="/blog">Blog</NuxtLink>
<NuxtLink :to="{ name: 'blog-slug', params: { slug: 'vue-3-6' } }">Post</NuxtLink>
```

```js
const router = useRouter()
await navigateTo('/login')                  // Nuxt'ning o'z yordamchisi
await navigateTo({ path: '/login', query: { redirect: route.fullPath } })
```

## Kod: layoutlar

```vue
<!-- app/layouts/default.vue -->
<template>
    <div class="layout">
        <AppHeader />
        <main><slot /></main>
        <AppFooter />
    </div>
</template>
```

```vue
<!-- app/app.vue -->
<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
```

Sahifada boshqa layout tanlash:

```vue
<script setup>
definePageMeta({ layout: 'admin' })
</script>
```

## Kod: `definePageMeta` va middleware

```vue
<script setup>
definePageMeta({
  layout: 'admin',
  middleware: 'auth',              // app/middleware/auth.js
  title: 'Foydalanuvchilar',
  keepalive: true,
})
</script>
```

```js
// app/middleware/auth.js
export default defineNuxtRouteMiddleware((to) => {
  const user = useCurrentUser()

  if (!user.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
```

Global middleware — fayl nomiga `.global` qo'shiladi:

```js
// app/middleware/analytics.global.js
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.client) trackPageView(to.fullPath)
})
```

`import.meta.client` / `import.meta.server` — Nuxt'dagi muhit tekshiruvi (56-bobdagi `isServer` ning o'rniga).

## Kod: avtomatik importlar

```vue
<script setup>
// Hech qanday import yo'q — hammasi avtomatik:
const count = ref(0)                      // vue
const route = useRoute()                  // vue-router
const { data } = await useFetch('/api/x') // nuxt
const cart = useCartStore()               // pinia (modul o'rnatilgan bo'lsa)
const { width } = useWindowSize()         // app/composables/useWindowSize.js
</script>

<template>
    <UserCard :user="user" />             <!-- app/components/UserCard.vue -->
</template>
```

Qulay, lekin 38-bobdagi ogohlantirish shu yerda ham amal qiladi: yangi dasturchi "bu funksiya qayerdan keldi?" degan savolga javob topa olmasligi mumkin. Nuxt buni `.nuxt/imports.d.ts` fayli va IDE integratsiyasi bilan yengillashtiradi.

## Kod: holat — `useState`

```js
// ✗ SSR'da xavfli (56-bob)
const counter = ref(0)

// ✓ Nuxt'ning SSR'ga xavfsiz holati
const counter = useState('counter', () => 0)
```

`useState` — so'rovga izolyatsiyalangan, serverdan klientga avtomatik uzatiladigan reaktiv holat. Kichik global holat uchun Pinia o'rniga ishlatilishi mumkin; katta ilovada esa Pinia (`@pinia/nuxt` moduli) qulayroq.

## Kod: modullar

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@nuxt/content',
    '@vueuse/nuxt',
  ],

  runtimeConfig: {
    apiSecret: '',                        // faqat serverda (NUXT_API_SECRET)
    public: {
      apiBase: '/api',                    // klientda ham (NUXT_PUBLIC_API_BASE)
    },
  },
})
```

```js
const config = useRuntimeConfig()

config.public.apiBase        // klient va server
config.apiSecret             // faqat serverda (klientda bo'sh)
```

`runtimeConfig` — `import.meta.env` dan farqli o'laroq **build'dan keyin** o'zgartirilishi mumkin: bir xil Docker image'ni turli muhitlarda ishlatish imkonini beradi (67-bob).

## Muhandislik nuqtai nazari: Nuxt kerakmi

| Vaziyat | Tavsiya |
| --- | --- |
| SEO muhim (marketing, e-commerce, blog) | Ha — SSR/SSG tayyor |
| Login orqasidagi admin panel | Yo'q — oddiy Vite SPA yetarli |
| Kichik vidjet yoki mavjud backend ichidagi sahifa | Yo'q (04-bob) |
| Tez prototip, konvensiyalar foydali | Ha |
| Jamoada Vue tajribasi bor, arxitektura bahsini kamaytirish kerak | Ha |
| Node server saqlashni istamaysiz | Ha, lekin SSG rejimida (58-bob) |

Nuxt qo'shadigan narxlar: build murakkabligi, "sehr" (avtomatik importlar, fayl konvensiyalari), modul ekotizmiga bog'liqlik va yangilanishlarda migratsiya ishi.

## Muhandislik nuqtai nazari: Nuxt va toza Vue farqi

Nuxt'da yozilgan komponent — **oddiy Vue komponenti**. Farq atrofdagi qatlamda:

| Vue (Vite) | Nuxt |
| --- | --- |
| `router/index.js` da marshrutlar | `pages/` papkasi |
| `main.js` da plugin ulash | `plugins/` papkasi |
| Komponentlarni import qilish | Avtomatik |
| SSR'ni o'zingiz qurasiz (57-bob) | Tayyor |
| Meta teglar — kutubxona | `useHead` tayyor (61-bob) |
| Backend alohida | `server/api/` ichida (60-bob) |

Shuning uchun 1–55-boblardagi hamma bilim Nuxt'da ham ishlaydi: reaktivlik, komponentlar, composable'lar, Pinia, testlash — hammasi bir xil.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Modul darajasida `ref` bilan global holat | SSR'da foydalanuvchilar aralashadi | `useState` yoki Pinia |
| `process.client` (eski API) | Nuxt 3+ da `import.meta.client` | Yangi shakl |
| Maxfiy kalitni `runtimeConfig.public` ga qo'yish | Klientga chiqadi | `runtimeConfig` ildizida |
| `pages/` da komponent fayllarini saqlash | Ular marshrut bo'lib qoladi | `components/` ga qo'ying |
| `useFetch` ni hodisa ishlov beruvchisida chaqirish | U — setup darajasidagi composable | `$fetch` ishlating (60-bob) |
| Avtomatik importga to'liq tayanib, IDE sozlamasdan ishlash | Qizil chiziqlar, chalkashlik | `.nuxt` tiplarini generatsiya qiling (`nuxi prepare`) |

## Amaliyot

1. Nuxt loyihasi yarating va uch sahifa qo'shing: `/`, `/blog`, `/blog/[slug]`.
2. `default` va `admin` layoutlarini yozing, bitta sahifada `definePageMeta` bilan layout almashtiring.
3. `auth` middleware yozing va himoyalangan sahifa yarating.
4. `useState` bilan global hisoblagich qiling va uni ikki sahifada ishlating; SSR'da qiymat saqlanishini tekshiring.
5. `runtimeConfig` ga maxfiy va ommaviy qiymat qo'shing; klientda qaysi biri ko'rinishini tekshiring.

## Rasmiy hujjat

- Nuxt: <https://nuxt.com/docs/getting-started/introduction>
- Marshrutlash: <https://nuxt.com/docs/getting-started/routing>
- `useState`: <https://nuxt.com/docs/api/composables/use-state>
- Runtime config: <https://nuxt.com/docs/guide/going-further/runtime-config>
