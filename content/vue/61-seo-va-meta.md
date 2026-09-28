# 61 — SEO va meta teglar

[← Oldingi: Nuxt: data va server](60-nuxt-data-va-server.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik →](62-unumdorlik.md)

## Tushuncha

SEO frontend tomonidan uch qismdan iborat:

1. **Mazmun HTML'da bo'lishi** — SSR/SSG (56, 58-bob);
2. **Meta teglar** — title, description, Open Graph, canonical;
3. **Texnik signal'lar** — sitemap, robots.txt, structured data, Core Web Vitals.

## Kod: Nuxt'da meta teglar

```vue
<script setup>
const { data: post } = await useFetch(`/api/posts/${route.params.slug}`)

useHead({
  title: post.value.title,
  meta: [
    { name: 'description', content: post.value.excerpt },
    { property: 'og:title', content: post.value.title },
    { property: 'og:description', content: post.value.excerpt },
    { property: 'og:image', content: post.value.coverUrl },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
  link: [
    { rel: 'canonical', href: `https://example.com/blog/${post.value.slug}` },
  ],
})
</script>
```

Qisqaroq shakl SEO uchun:

```js
useSeoMeta({
  title: post.value.title,
  description: post.value.excerpt,
  ogTitle: post.value.title,
  ogDescription: post.value.excerpt,
  ogImage: post.value.coverUrl,
  twitterCard: 'summary_large_image',
})
```

Global standart qiymatlar:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      titleTemplate: '%s — Mening saytim',
      htmlAttrs: { lang: 'uz' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },
})
```

## Kod: Nuxt'siz (toza Vue)

```bash
npm i @unhead/vue
```

```js
// main.js
import { createHead } from '@unhead/vue'

app.use(createHead())
```

```vue
<script setup>
import { useHead } from '@unhead/vue'

useHead({ title: 'Sahifa' })
</script>
```

SPA'da bu ishlaydi, lekin **faqat JS ishlagandan keyin**: ijtimoiy tarmoq botlari (Facebook, Telegram) JS'ni bajarmaydi va bo'sh preview ko'rsatadi. Shuning uchun Open Graph teglari uchun SSR/SSG amalda majburiy.

Google esa JS'ni bajaradi, lekin ikkinchi to'lqinda va kechikish bilan — shu sababli SSR baribir afzal.

## Kod: structured data (JSON-LD)

```js
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value.title,
        datePublished: post.value.publishedAt,
        author: { '@type': 'Person', name: post.value.author.name },
        image: post.value.coverUrl,
      }),
    },
  ],
})
```

Tez-tez ishlatiladigan turlar: `Article`, `Product` (narx, mavjudlik), `BreadcrumbList`, `FAQPage`, `Organization`. Ular qidiruv natijalarida boy ko'rinish (rich snippet) beradi.

Tekshirish: <https://search.google.com/test/rich-results>.

## Kod: sitemap va robots

```bash
npm i -D @nuxtjs/sitemap @nuxtjs/robots
```

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap', '@nuxtjs/robots'],

  site: { url: 'https://example.com' },

  robots: {
    disallow: ['/admin', '/api'],
  },
})
```

Dinamik URL'lar uchun:

```js
// server/api/__sitemap__/urls.js
export default defineSitemapEventHandler(async () => {
  const posts = await db.post.findMany({ select: { slug: true, updatedAt: true } })

  return posts.map((post) => ({
    loc: `/blog/${post.slug}`,
    lastmod: post.updatedAt,
    changefreq: 'weekly',
  }))
})
```

## Kod: canonical va takroriy mazmun

```js
const route = useRoute()

useHead({
  link: [{ rel: 'canonical', href: `https://example.com${route.path}` }],
})
```

Canonical kerak bo'ladigan holatlar:

| Holat | Muammo |
| --- | --- |
| `?utm_source=...` parametrlari | Har havola alohida sahifa deb qabul qilinadi |
| Filtr va saralash (`?sort=price`) | Minglab takroriy sahifa |
| `/products` va `/products/` | Ikki xil URL |
| Sahifalash (`?page=2`) | Har sahifa o'z canonical'iga ega bo'lishi kerak |

Filtrlangan sahifalarni indekslashdan chiqarish:

```js
useHead({
  meta: [{ name: 'robots', content: route.query.sort ? 'noindex, follow' : 'index, follow' }],
})
```

## Kod: ko'p tilli sayt (hreflang)

```js
useHead({
  link: [
    { rel: 'alternate', hreflang: 'uz', href: 'https://example.com/uz/blog/post' },
    { rel: 'alternate', hreflang: 'ru', href: 'https://example.com/ru/blog/post' },
    { rel: 'alternate', hreflang: 'x-default', href: 'https://example.com/blog/post' },
  ],
})
```

`@nuxtjs/i18n` moduli buni avtomatik qiladi (66-bob).

## Muhandislik nuqtai nazari: Core Web Vitals

Google reyting omili sifatida uchta ko'rsatkichni ishlatadi:

| Ko'rsatkich | Nima o'lchaydi | Maqsad | Vue tomonidagi ta'sir |
| --- | --- | --- | --- |
| **LCP** | Eng katta element ko'rinishi | < 2.5 s | SSR/SSG, rasm optimizatsiyasi, bundle hajmi (63-bob) |
| **INP** | Bosishga javob vaqti | < 200 ms | Og'ir render, uzun vazifalar (62-bob) |
| **CLS** | Layout siljishi | < 0.1 | Rasm/shrift o'lchamlari, skelet (36-bob) |

Amaliy qadamlar:

```html
<!-- Rasm o'lchamlarini ko'rsating — CLS oldini oladi -->
<img src="/hero.jpg" width="1200" height="600" alt="...">

<!-- Birinchi ekrandagi rasmni tez yuklash -->
<img src="/hero.jpg" fetchpriority="high" loading="eager" alt="...">

<!-- Qolganlarini kechiktirish -->
<img src="/thumb.jpg" loading="lazy" decoding="async" alt="...">
```

Nuxt'da `@nuxt/image` moduli o'lcham, format (`webp`/`avif`) va `srcset` ni avtomatik qiladi.

## Muhandislik nuqtai nazari: SEO tekshiruv ro'yxati

Har sahifa uchun:

- [ ] Noyob `<title>` (50–60 belgi)
- [ ] `<meta name="description">` (140–160 belgi)
- [ ] Bitta `<h1>`
- [ ] `og:title`, `og:description`, `og:image` (1200×630)
- [ ] `canonical`
- [ ] Rasmlar uchun `alt`
- [ ] Mazmun HTML'da (JS o'chirilganda ham ko'rinadi)
- [ ] Ichki havolalar `<a href>` bilan (JS `@click` emas)
- [ ] Sahifa `sitemap.xml` da

Oxirgidan bitta oldingi punkt muhim: `<div @click="router.push('/x')">` — bot uchun havola emas. Navigatsiya har doim `<RouterLink>`/`<NuxtLink>` (ular `<a href>` chiqaradi) orqali bo'lsin.

## Muhandislik nuqtai nazari: tekshirish vositalari

| Vosita | Nima uchun |
| --- | --- |
| `curl -s https://sayt/sahifa \| grep '<title>'` | Server HTML'da meta bormi |
| DevTools → Disable JavaScript | Mazmun JS'siz ko'rinadimi |
| Lighthouse (DevTools → Lighthouse) | Performance, SEO, a11y bali |
| Google Rich Results Test | Structured data to'g'rimi |
| Facebook Sharing Debugger / Telegram | OG preview qanday ko'rinadi |
| Google Search Console | Haqiqiy indekslash holati |

Eng tez tekshiruv — birinchi ikkitasi: agar `curl` natijasida mazmun yo'q bo'lsa, SEO bilan bog'liq boshqa ishlar ma'nosiz.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| SPA'da OG teglarni JS bilan qo'yish | Botlar JS'ni bajarmaydi | SSR/SSG |
| Barcha sahifada bir xil `<title>` | Qidiruvda farqlanmaydi | Sahifaga xos |
| `og:image` ni nisbiy yo'l bilan berish | Ko'pchilik platforma ochmaydi | To'liq URL |
| Navigatsiyani `@click` bilan qilish | Bot havolani ko'rmaydi | `<NuxtLink>`/`<RouterLink>` |
| Filtrlangan sahifalarni indekslash | Minglab takror mazmun | `noindex` + canonical |
| Rasm o'lchamlarini bermaslik | CLS yomonlashadi | `width`/`height` |
| `useHead` ni faqat klientda chaqirish | SSR'da teg chiqmaydi | `setup` darajasida |

## Amaliyot

1. Blog sahifasiga `useSeoMeta` qo'shing va `curl` bilan meta teglar HTML'da borligini tekshiring.
2. JSON-LD (`Article`) qo'shing va Rich Results Test'dan o'tkazing.
3. Sitemap modulini o'rnating va dinamik URL'larni qo'shing.
4. Filtrlangan sahifaga `noindex` qo'ying.
5. Lighthouse'ni ishga tushiring va SEO bo'limidagi har bir ogohlantirishni tuzating.
6. Telegram yoki Facebook debugger'da havolangizni tekshiring — preview to'g'ri chiqadimi?

## Rasmiy hujjat

- Nuxt SEO: <https://nuxt.com/docs/getting-started/seo-meta>
- `useSeoMeta`: <https://nuxt.com/docs/api/composables/use-seo-meta>
- Unhead: <https://unhead.unjs.io>
- Core Web Vitals: <https://web.dev/articles/vitals>
