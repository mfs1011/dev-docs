# 63 — Bundle va yuklanish

[← Oldingi: Unumdorlik](62-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Erishimlilik →](64-erishimlilik.md)

## Tushuncha

Foydalanuvchi sahifani ochganda uchta narsa ketma-ket bo'ladi: HTML keladi → JS yuklanadi → JS bajariladi → ekran ko'rinadi. JS qancha katta bo'lsa, bu zanjir shuncha uzun.

Bundle hajmi ikki tomondan qisqartiriladi:

1. **Kamroq kod yuborish** — code splitting, tree shaking, bog'liqliklarni tanlash;
2. **Kerakligini oldinroq yuborish** — preload, prefetch, prioritet.

## Kod: bundle'ni tahlil qilish

```bash
npm i -D rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true }),
  ],
})
```

```bash
npm run build && open dist/stats.html
```

Qarash tartibi: eng katta to'rtburchaklar → ular haqiqatan kerakmi → kichikroq muqobili bormi → lazy qilish mumkinmi.

Tipik "og'ir mehmonlar": `moment` (→ `date-fns`/`Temporal`), `lodash` (→ alohida funksiyalar yoki native), butun UI kutubxonasi (→ tanlab import), `chart.js` + adapterlar (→ lazy), ikonkalar to'plami (→ faqat ishlatilganlari).

## Kod: marshrut bo'yicha bo'lish

```js
// router/index.js — har sahifa alohida chunk (28, 39-bob)
const routes = [
  { path: '/', component: () => import('@/views/HomeView.vue') },
  { path: '/admin', component: () => import('@/views/AdminView.vue') },
]
```

Bir nechta marshrutni bitta chunk'ga yig'ish:

```js
// vite.config.js
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) return 'vendor-vue'
            if (id.includes('chart.js')) return 'vendor-chart'

            return 'vendor'
          }
        },
      },
    },
  },
})
```

Maqsad — **keshni uzoq saqlash**: `vendor-vue` kamdan-kam o'zgaradi, ilova kodi esa har deployda yangilanadi. Ularni ajratsangiz, foydalanuvchi har deployda faqat kichik faylni qayta yuklaydi.

## Kod: og'ir komponentlarni lazy qilish

```vue
<script setup>
import { defineAsyncComponent, ref } from 'vue'

const showChart = ref(false)

// Chart.js faqat kerak bo'lganda yuklanadi
const ChartPanel = defineAsyncComponent(() => import('@/components/ChartPanel.vue'))
</script>

<template>
    <button v-if="!showChart" @mouseenter="preload" @click="showChart = true">
        Grafikni ko'rsatish
    </button>

    <ChartPanel v-if="showChart" :data="data" />
</template>

<script setup>
function preload() {
  import('@/components/ChartPanel.vue')          // kursor kelganda oldindan
}
</script>
```

Nomzodlar: grafik, xarita, rich-text editor, PDF ko'ruvchi, emoji picker, video pleer, admin paneli.

## Kod: kutubxonalarni tanlab import qilish

```js
// ✗ Butun kutubxona
import _ from 'lodash'
import * as dateFns from 'date-fns'

// ✓ Faqat kerakli funksiya (tree shaking ishlaydi)
import debounce from 'lodash-es/debounce'
import { format } from 'date-fns'

// ✓ Ko'pincha kutubxona umuman kerak emas
const debounce = (fn, ms) => {
  let timer

  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}
```

Sana formatlash uchun ko'p hollarda native yetarli:

```js
new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium' }).format(date)
new Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' }).format(price)
new Intl.RelativeTimeFormat('uz').format(-3, 'day')      // "3 kun oldin"
```

## Kod: preload va prefetch

Vite muhim chunklar uchun `modulepreload` ni avtomatik qo'shadi. Qo'lda boshqarish:

```html
<!-- Darhol kerak -->
<link rel="modulepreload" href="/assets/vendor-vue.js">

<!-- Ehtimol keyin kerak bo'ladi (bo'sh vaqtda yuklanadi) -->
<link rel="prefetch" href="/assets/AdminView.js">

<!-- Tashqi domenga ulanishni oldindan ochish -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="https://cdn.example.com">

<!-- Birinchi ekran rasmi -->
<link rel="preload" as="image" href="/hero.avif" fetchpriority="high">
```

Router bilan aqlli prefetch:

```vue
<RouterLink to="/admin" @mouseenter="prefetchAdmin">Admin</RouterLink>
```

Nuxt'da `<NuxtLink>` ko'rinish maydoniga kirganda chunk'ni **o'zi** prefetch qiladi.

## Kod: CSS va shriftlar

```js
// vite.config.js — CSS'ni chunk'larga bo'lish (standart yoqilgan)
export default defineConfig({
  build: {
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
  },
})
```

```html
<!-- Shriftni oldindan yuklash + swap -->
<link rel="preload" as="font" type="font/woff2" href="/fonts/inter.woff2" crossorigin>
```

Subset qiling: kirill+lotin to'liq shrift 200 KB bo'lishi mumkin, faqat kerakli belgilar bilan 30 KB. Vosita: `glyphhanger`, `fonttools`.

## Kod: CI'da hajm nazorati

```yaml
# .github/workflows/size.yml
- run: npm ci
- run: npm run build
- name: Bundle hajmini tekshirish
  run: |
    SIZE=$(find dist/assets -name 'index-*.js' -exec gzip -c {} \; | wc -c)
    echo "Bundle: $SIZE bayt (gzip)"
    if [ "$SIZE" -gt 250000 ]; then
      echo "::error::Bundle 250 KB dan oshdi"
      exit 1
    fi
```

Yoki tayyor vositalar: `size-limit`, `bundlesize`. Maqsad — hajm **sekin-asta** o'sib ketishini oldini olish: har PR'da 5 KB qo'shilsa, yil oxirida 250 KB bo'ladi.

## Muhandislik nuqtai nazari: nimani o'lchash

| Ko'rsatkich | Qanday olinadi | Maqsad |
| --- | --- | --- |
| Boshlang'ich JS (gzip) | `dist/stats.html` yoki `gzip -c` | < 200 KB |
| Marshrut chunk'i | Build chiqishi | < 100 KB |
| Umumiy so'rovlar soni | Network paneli | < 30 (birinchi yuklanish) |
| LCP | Lighthouse / web-vitals | < 2.5 s |
| Vue runtime | Doimiy | ~34 KB gzip |

"Vue 34 KB" — bu **faqat runtime**. Real ilovada router, store, UI kutubxona, ikonkalar qo'shiladi va 200 KB tez to'planadi.

## Muhandislik nuqtai nazari: bog'liqlik qo'shish qarori

Har `npm i` — bundle'ga qo'shimcha va uzoq muddatli majburiyat. Qo'shishdan oldin:

1. **Hajmi qancha?** <https://bundlephobia.com> da tekshiring;
2. **Tree-shakeable mi?** ESM modul bormi;
3. **Native muqobili bormi?** `Intl`, `structuredClone`, `AbortController`, `URLSearchParams` ko'p narsani qoplaydi;
4. **Faqat bitta funksiya uchunmi?** Uni ko'chirib yozish arzonroq bo'lishi mumkin;
5. **Qo'llab-quvvatlanadimi?** Oxirgi reliz, ochiq issue'lar.

Misol: `moment` (70 KB gzip) → `date-fns` tanlab import (2–5 KB) → `Intl.DateTimeFormat` (0 KB).

## Muhandislik nuqtai nazari: deploy va kesh

```
dist/
├── index.html                    ← kesh YO'Q (har doim yangi)
└── assets/
    ├── index-a1b2c3.js           ← kesh 1 yil (immutable)
    └── vendor-vue-d4e5f6.js      ← kesh 1 yil
```

```nginx
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}

location = /index.html {
    add_header Cache-Control "no-cache";
}
```

Hash nomdagi fayllar hech qachon o'zgarmaydi, shuning uchun ularni abadiy keshlash mumkin. `index.html` esa har doim yangi bo'lishi kerak — u yangi hash'larga ishora qiladi (67-bob).

Eslatma (28-bob): deploydan keyin eski sahifa ochiq turgan foydalanuvchi eski chunk'ni so'rashi mumkin. Eski fayllarni bir necha kun saqlang va `onError` da sahifani yangilang.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Bundle'ni hech qachon tahlil qilmaslik | Kutilmagan 500 KB kutubxona | `visualizer` |
| Butun kutubxonani import qilish | Tree shaking ishlamaydi | Tanlab import |
| Hamma narsani lazy qilish | Ko'p so'rov, sekinroq | Faqat og'ir/kam ishlatiladiganlari |
| Birinchi ekran komponentini async qilish | LCP yomonlashadi | Statik import |
| `index.html` ni uzoq keshlash | Foydalanuvchi eski versiyada qoladi | `no-cache` |
| Hash'siz asset nomlari | Kesh yangilanmaydi | Vite standart (hash bor) |
| Shriftni subset qilmaslik | 200 KB shrift | Subset + `font-display: swap` |

## Amaliyot

1. `visualizer` bilan bundle tahlilini yarating va eng katta uch modulni yozib oling.
2. Bittasini lazy qiling yoki kichikroq muqobilga almashtiring; hajm farqini o'lchang.
3. `manualChunks` bilan vendor'ni ajrating va ikki build orasida qaysi fayllar o'zgarganini solishtiring.
4. `@mouseenter` prefetch qo'shing va Network panelida chunk qachon yuklanishini kuzating.
5. CI'ga bundle hajmi tekshiruvini qo'shing va chegaradan oshirib, PR yiqilishini ko'ring.

## Rasmiy hujjat

- Vite build: <https://vite.dev/guide/build.html>
- Rollup manualChunks: <https://rollupjs.org/configuration-options/#output-manualchunks>
- Bundlephobia: <https://bundlephobia.com>
