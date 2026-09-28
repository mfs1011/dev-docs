# 58 — SSG va prerender

[← Oldingi: Qo'lda SSR qurish](57-qolda-ssr.md) · [Mundarija](README.md) · [Keyingi: Nuxt asoslari →](59-nuxt-asoslari.md)

## Tushuncha

SSR har so'rovda HTML hisoblaydi. Lekin mazmun hamma foydalanuvchi uchun bir xil va kamdan-kam o'zgarsa — buni **build vaqtida bir marta** qilish mumkin. Bu — SSG (Static Site Generation).

```
SSR:  so'rov → server render → HTML   (har safar)
SSG:  build  → HTML fayllar → CDN     (bir marta)
```

Natija: server umuman kerak emas, javob vaqti CDN tezligida, narx deyarli nol.

## Kod: VitePress (hujjat va blog uchun)

```bash
npm add -D vitepress
npx vitepress init
```

```
docs/
├── .vitepress/config.js
├── index.md
├── guide/
│   ├── index.md
│   └── getting-started.md
└── public/
```

```js
// .vitepress/config.js
export default {
  title: 'Mening hujjatim',
  description: 'Vue bilan qurilgan',
  themeConfig: {
    sidebar: [
      { text: 'Qo\'llanma', items: [
        { text: 'Kirish', link: '/guide/' },
        { text: 'Boshlash', link: '/guide/getting-started' },
      ] },
    ],
  },
}
```

```bash
npm run docs:build     # .vitepress/dist/ — statik fayllar
```

Markdown ichida Vue komponentlarini ishlatish mumkin:

```md
# Sarlavha

<DemoCounter />

Oddiy matn davom etadi.
```

VitePress — Vue rasmiy hujjati va shu qo'llanma turidagi saytlar uchun tabiiy tanlov: markdown yozasiz, natija statik va tez.

## Kod: Nuxt bilan SSG

```js
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,                  // havolalar bo'yicha yurib, hammasini yaratadi
      routes: ['/', '/blog', '/sitemap.xml'],
    },
  },
})
```

```bash
npx nuxi generate      # .output/public/ — statik sayt
```

Dinamik marshrutlar (`/blog/[slug]`) uchun ro'yxatni berish kerak:

```ts
export default defineNuxtConfig({
  hooks: {
    async 'prerender:routes'(ctx) {
      const posts = await fetch('https://api.example.com/posts').then((r) => r.json())

      for (const post of posts) ctx.routes.add(`/blog/${post.slug}`)
    },
  },
})
```

## Kod: gibrid render (Nuxt route rules)

Real ilovada har sahifa bir xil emas. Nuxt buni marshrut qoidalari bilan hal qiladi:

```ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },                          // build vaqtida
    '/blog/**': { isr: 3600 },                         // ISR: 1 soatda yangilanadi
    '/products/**': { swr: 600 },                      // stale-while-revalidate
    '/admin/**': { ssr: false },                       // to'liq SPA
    '/api/**': { cors: true },
    '/old-page': { redirect: '/new-page' },
  },
})
```

| Qoida | Ma'nosi |
| --- | --- |
| `prerender: true` | Build vaqtida HTML yaratiladi |
| `isr: <soniya>` | Birinchi so'rovda render qilinadi, keshlanadi, muddati o'tgach fon'da yangilanadi |
| `swr: <soniya>` | Eski nusxa darhol beriladi, fon'da yangilanadi |
| `ssr: false` | Faqat klient (SPA rejimi) |

Bu — zamonaviy yondashuvning o'zagi: bitta ilovada har sahifa o'z render strategiyasiga ega bo'ladi.

## Kod: ISR nima va nega kerak

Muammo: 10 000 mahsulotli katalogni build'da prerender qilish — 10 000 HTML va uzoq build. Ustiga narxlar har kuni o'zgaradi.

ISR (Incremental Static Regeneration) yechimi:

1. Birinchi so'rov kelganda sahifa render qilinadi va keshlanadi;
2. Keyingi so'rovlar keshdan darhol javob oladi;
3. Kesh muddati o'tgach, keyingi so'rov eski nusxani oladi, lekin fon'da yangilanish boshlanadi.

Natijada: SSG tezligi + SSR yangiligi, build vaqti esa qisqa qoladi.

Cheklov: ISR uchun uni qo'llab-quvvatlaydigan hosting kerak (Vercel, Netlify, Cloudflare, yoki Nitro'ning o'z kesh qatlami bilan Node server).

## Muhandislik nuqtai nazari: qaysi sahifaga qaysi rejim

| Sahifa turi | Rejim | Sabab |
| --- | --- | --- |
| Landing, "Biz haqimizda", hujjat | `prerender` | O'zgarmaydi, SEO kerak |
| Blog post | `prerender` yoki `isr` | Kamdan-kam o'zgaradi |
| Mahsulot sahifasi (narx, qoldiq) | `isr` / `swr` | Tez-tez o'zgaradi, lekin har so'rovda emas |
| Qidiruv natijalari | SSR | Har so'rov noyob |
| Savat, profil, admin | `ssr: false` | Shaxsiy, SEO kerak emas |
| Dashboard | `ssr: false` | Login orqasida |

Qoida: **shaxsiy ma'lumot bor sahifani hech qachon prerender/ISR qilmang** — u keshga tushadi va boshqa foydalanuvchiga ko'rsatiladi (56-bob).

## Muhandislik nuqtai nazari: SSG chegaralari

SSG hamma joyda ishlamaydi:

| Muammo | Yechim |
| --- | --- |
| 100 000 sahifa → build soatlab davom etadi | ISR yoki faqat mashhur sahifalarni prerender |
| Mazmun tez-tez o'zgaradi | ISR/SWR yoki webhook bilan qayta build |
| Foydalanuvchiga qarab boshqacha mazmun | Klientda to'ldirish (`<ClientOnly>`) yoki SSR |
| A/B testlar | Edge middleware yoki klient |
| Real vaqt ma'lumoti (narx, qoldiq) | Klientda alohida so'rov bilan yangilash |

Amaliy naqsh: **HTML statik, o'zgaruvchan bo'laklar klientda to'ldiriladi.** Masalan mahsulot sahifasi prerender qilinadi, "omborda bormi" ma'lumoti esa yuklangandan keyin so'raladi.

## Muhandislik nuqtai nazari: qayta build oqimi

Kontent CMS'da bo'lsa, build'ni avtomatlashtiring:

```
CMS'da post e'lon qilindi
   → webhook → CI ishga tushadi
   → nuxi generate / vitepress build
   → statik fayllar CDN'ga
```

GitHub Actions bilan (67-bob):

```yaml
on:
  repository_dispatch:
    types: [content-updated]
  schedule:
    - cron: '0 3 * * *'        # har kuni yangilash
```

Bu shu qo'llanma joylashgan sayt ishlatadigan naqshning o'zi: kontent `.md` fayllarda, push bo'lganda build ishga tushadi va GitHub Pages'ga statik fayllar chiqadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Shaxsiy sahifani prerender qilish | Ma'lumot boshqa foydalanuvchiga ko'rinadi | `ssr: false` yoki SSR |
| Dinamik marshrutlar uchun ro'yxat bermaslik | Sahifalar yaratilmaydi, 404 | `prerender:routes` hooki |
| Butun katalogni prerender qilish | Build soatlab ketadi | ISR/SWR |
| Narx/qoldiq kabi ma'lumotni statik HTML'ga yozish | Eskiradi | Klientda yangilash |
| SSG'dan keyin SPA fallback sozlamaslik | Noma'lum yo'llarda 404 | `404.html` yoki hosting qoidasi |
| Kesh muddatini juda uzun qilish | Yangilanish ko'rinmaydi | Qisqa TTL + qayta build webhook |

## Amaliyot

1. VitePress bilan uch sahifali hujjat sayti yarating va `docs:build` natijasini ko'ring (nechta HTML fayl?).
2. Nuxt loyihasida `routeRules` yozing: bosh sahifa `prerender`, blog `isr`, admin `ssr: false`.
3. Dinamik marshrut uchun `prerender:routes` hookini yozing.
4. Statik sahifaga klientda yuklanadigan "omborda bormi" bo'lagini qo'shing.
5. Build natijasini statik hostingga (GitHub Pages, Netlify) chiqaring va javob vaqtini SSR bilan solishtiring.

## Rasmiy hujjat

- VitePress: <https://vitepress.dev>
- Nuxt prerender: <https://nuxt.com/docs/getting-started/prerendering>
- Nuxt route rules: <https://nuxt.com/docs/guide/concepts/rendering#hybrid-rendering>
