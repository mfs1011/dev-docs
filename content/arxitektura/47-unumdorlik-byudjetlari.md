# 47 — Unumdorlik byudjetlari

[← Oldingi: Erishimlilik va ko'p tillilik](46-a11y-va-i18n.md) · [Mundarija](README.md) · [Keyingi: Frontend xatolari va kuzatuvchanlik →](48-frontend-xatolari.md)

## Tushuncha

Unumdorlik byudjeti — oshirib bo'lmaydigan **o'lchanadigan chegara**: "boshlang'ich JS ≤ 200 kB (transfer)", "LCP ≤ 2.5 s mobil 4G'da (p75)". Byudjet unumdorlikni "his" dan **shartnoma**ga aylantiradi.

| Byudjet turi | Misol | Qayerda tekshiriladi |
| --- | --- | --- |
| **Resurs** | Initial JS ≤ 200 kB, rasm ≤ 150 kB | Build (CI) |
| **Metrika (laboratoriya)** | Lighthouse Performance ≥ 90 | CI (Lighthouse CI) |
| **Metrika (haqiqiy)** | LCP p75 ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 | Production RUM |

## Nega shunday

Unumdorlik — **sekin eriydi**: har feature 10 kB qo'shadi, hech biri alohida "muammo" emas, lekin bir yildan keyin sahifa 2 MB. Byudjetsiz buni hech kim sezmaydi — chunki dasturchilar tez noutbuk va tez internetda ishlaydi.

Core Web Vitals — Google qidiruv reytingiga ta'sir qiladi va biznes metrikalari bilan bog'liq (konversiya, bounce rate).

## Psevdokod: byudjet — CI'da

```text
build:
  initial JS (transfer)     ≤ 200 kB   → oshsa: build XATO
  any lazy chunk            ≤ 100 kB   → ogohlantirish
  component style           ≤ 8 kB     → xato

PR tekshiruvi:
  "Bu PR initial bundle'ni +34 kB oshiradi (moment.js)" — review'da ko'rinsin
  Lighthouse CI: asosiy 3 sahifa, mobil profil, 3 marta — o'rtachasi
```

Byudjet oshsa — **byudjetni oshirish emas**, sababini topish (katta kutubxona, lazy bo'lmagan bo'lim, rasm).

## Psevdokod: unumdorlik manbalari — tartib bo'yicha

```text
1. Yuklanadigan JS hajmi      lazy bo'limlar, @defer, tree-shaking, kutubxona tanlovi
2. Render strategiyasi         SSR/SSG ommaviy sahifalar uchun (37-bob)
3. Rasmlar                     to'g'ri o'lcham, AVIF/WebP, lazy, LCP rasmi — priority
4. Shriftlar                   font-display: swap, subset, preload
5. Uchinchi tomon skriptlari   analitika, chat, reklama — ko'pincha eng katta og'irlik
6. Interaksiya (INP)           uzun vazifalarni bo'lish, og'ir ishlar — worker
7. Layout barqarorligi (CLS)   rasm/reklama joyini oldindan ajratish, shrift almashishi
```

Uchinchi tomon skriptlari alohida e'tiborga loyiq: marketing jamoasi Tag Manager orqali qo'shgan 5 ta skript — dasturchilar yozgan hamma koddan og'irroq bo'lishi mumkin. Byudjet ularga ham tegishli.

## Framework'larda

| Mavzu | Angular | React / Next | Vue / Nuxt |
| --- | --- | --- | --- |
| Byudjet konfiguratsiyasi | `angular.json` `budgets` (sukut: initial 500 kB ogohlantirish / 1 MB xato) — [Angular 70-bob](../angular/70-devtools-va-cli.md) | `size-limit`, bundler plugin'lari | `size-limit` |
| Bundle tahlili | `ng build --stats-json` → `browser-stats.json` → esbuild analyzer | `@next/bundle-analyzer` | `rollup-plugin-visualizer` — [Vue 63-bob](../vue/63-bundle-va-yuklash.md) |
| Unumdorlik qo'llanmasi | [74-bob](../angular/74-unumdorlik.md) | [React 41](../react/41-unumdorlik.md), [Next.js 43-bob](../nextjs/43-unumdorlik.md) | [62-bob](../vue/62-unumdorlik.md) |
| Rasm | `NgOptimizedImage` (`priority` → `fetchpriority=high`) | `next/image` | `@nuxt/image` |

`ng new` sukut byudjetlari (500 kB / 1 MB) — boshlang'ich nuqta, maqsad emas. Mobil auditoriyali ommaviy sayt uchun ancha qat'iyroq chegara kerak.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Qat'iy byudjet | Unumdorlik saqlanadi | Feature'lar sekinroq, kutubxona tanlovida cheklov |
| Faqat laboratoriya o'lchovi | Arzon, CI'da | Haqiqiy foydalanuvchi tajribasini ko'rsatmaydi |
| RUM (haqiqiy o'lchov) | Haqiqat | Analitika infratuzilmasi, shaxsiy ma'lumot masalasi |
| Byudjetsiz | Tez rivojlanish | Sekin, sezilmas yomonlashuv |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Byudjet oshsa — chegarani ko'tarish | Muammo yashirinadi | Sababni topish |
| Faqat tez noutbukda tekshirish | Mobil foydalanuvchi boshqacha | Mobil profil, 4G throttling |
| Uchinchi tomon skriptlari byudjetdan tashqari | Eng katta og'irlik nazoratsiz | Ular ham byudjetda |
| O'lchovsiz optimallashtirish | Murakkablik, foyda noma'lum | Avval o'lchash |
| Faqat Lighthouse balli | Laboratoriya ≠ haqiqat | RUM p75 |

## Amaliyot

1. Joriy initial JS hajmini (transfer) o'lchang va byudjet belgilang.
2. CI'da byudjet buzilganda build yiqilsin.
3. Uchinchi tomon skriptlari hajmini alohida o'lchang.
4. `web-vitals` bilan haqiqiy foydalanuvchilardan LCP/INP/CLS yig'ing.

## Manbalar

- web.dev — *Performance budgets 101* <https://web.dev/articles/performance-budgets-101>
- Addy Osmani — *The Cost of JavaScript*
- Lighthouse CI <https://github.com/GoogleChrome/lighthouse-ci>
