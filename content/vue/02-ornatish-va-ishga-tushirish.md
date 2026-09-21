# 02 — O'rnatish va ishga tushirish

[← Oldingi: Vue nima va nega shunday](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Ilova yaratish va sozlash →](03-ilova-yaratish.md)

## Tushuncha

Vue'ni ishga tushirishning ikki yo'li bor va ular bir-birini almashtirmaydi:

1. **Build qadamisiz** — HTML faylga `<script>` qo'shasiz. Bir necha daqiqada ishlaydi, hech narsa o'rnatilmaydi.
2. **Build bilan** — `npm create vue@latest` orqali Vite loyihasi. `.vue` fayllar, avtomatik yangilanish (HMR), optimallashtirilgan production build.

Boshlovchiga: birinchi kunni 1-usulda o'tkazing (framework sehrini ko'rasiz), ikkinchi kundan 2-usulga o'ting (haqiqiy ish shunda bo'ladi).

## Nega shunday

`.vue` fayl — brauzer tushunmaydigan format. Uni JavaScript'ga aylantirish uchun kompilyator kerak. Demak, SFC (Single-File Component) ishlatmoqchi bo'lsangiz, build qadami majburiy. Build qadami esa Vite'ni olib keladi: dev server, HMR, bundling, minifikatsiya.

Nega aynan Vite? Vite'ni Vue muallifi Evan You yozgan va u brauzerning **native ES modullari**ga tayanadi: dev rejimda kod bundle qilinmaydi, brauzer modullarni o'zi so'raydi. Natija — loyiha hajmi qancha o'sishidan qat'i nazar dev server bir necha yuz millisekundda ko'tariladi. Production build esa Rollup (Vite 6+ da — Rolldown) orqali bundle qilinadi.

## Kod: 1-usul — build qadamisiz

Bitta `index.html` fayl yarating:

```html
<!doctype html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <title>Vue — birinchi qadam</title>
</head>
<body>
    <div id="app">
        <p>Bosildi: {{ count }} marta</p>
        <button @click="count++">Bosish</button>
    </div>

    <script type="importmap">
        { "imports": { "vue": "https://unpkg.com/vue@3.5.43/dist/vue.esm-browser.js" } }
    </script>

    <script type="module">
        import { createApp, ref } from 'vue'

        createApp({
            setup() {
                const count = ref(0)

                return { count }
            },
        }).mount('#app')
    </script>
</body>
</html>
```

Faylni brauzerda ochsangiz ishlaydi. Uchta nozik joy:

- **`vue.esm-browser.js`** — shablonni brauzerda kompilyatsiya qiladigan ("full") build. Shuning uchun HTML ichidagi `{{ count }}` ishlaydi. Production'da `vue.esm-browser.prod.js` ishlatiladi (kichikroq, ogohlantirishlarsiz).
- **`importmap`** — brauzerga `'vue'` nomini qayerdan olishni aytadi. Usiz `import { ref } from 'vue'` xato beradi.
- **`#app` ichidagi HTML — shablon.** Vue uni o'qib, o'rniga render qiladi.

> **Qachon shu usul yetarli.** Serverda render qilinadigan sahifaga (Laravel, Symfony, WordPress) kichik interaktiv bo'lak qo'shayotganda. Butun ilovani shu usulda qurish — mumkin, lekin `.vue` fayllar, tiplar va testlarsiz ish tezda og'irlashadi.

## Kod: 2-usul — Vite loyihasi

```bash
npm create vue@latest
```

Interaktiv savollar beradi. Boshlovchiga tavsiya:

| Savol | Javob | Nega |
| --- | --- | --- |
| Project name | `vue-mashq` | — |
| TypeScript | **No** (hozircha) | 48-bobda qo'shamiz |
| JSX Support | No | Kamdan-kam kerak (46-bob) |
| Vue Router | **Yes** | 39-bobda ishlatamiz |
| Pinia | **Yes** | 42-bobda ishlatamiz |
| Vitest | **Yes** | 52-bobda ishlatamiz |
| End-to-End Testing | No | 54-bobda alohida qo'shamiz |
| ESLint / Prettier | **Yes** | 55-bob |

Keyin:

```bash
cd vue-mashq
npm install
npm run dev
```

Terminal `http://localhost:5173` manzilini beradi. Fayl saqlansa — brauzer o'zi yangilanadi (HMR), sahifa qayta yuklanmaydi va holat saqlanib qoladi.

Ishlab chiqarish uchun:

```bash
npm run build     # dist/ papkasiga statik fayllar
npm run preview   # dist/ ni lokal serverda ochib ko'rish
```

## Kod: birinchi komponentni almashtirish

`src/App.vue` faylini butunlay quyidagiga almashtiring:

::: options
```vue
<script>
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    },
  },
}
</script>

<template>
    <main>
        <h1>Sanoq: {{ count }}</h1>
        <button @click="increment">+1</button>
    </main>
</template>

<style scoped>
main { font-family: system-ui, sans-serif; padding: 24px; }
button { padding: 6px 14px; }
</style>
```
:::

::: composition
```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)

function increment() {
  count.value++
}
</script>

<template>
    <main>
        <h1>Sanoq: {{ count }}</h1>
        <button @click="increment">+1</button>
    </main>
</template>

<style scoped>
main { font-family: system-ui, sans-serif; padding: 24px; }
button { padding: 6px 14px; }
</style>
```
:::

Saqlang — brauzerda darhol ko'rinadi.

## Muhandislik nuqtai nazari: build nima qiladi

`npm run dev` va `npm run build` bir xil kodni ikki xil ishlaydi:

| | Dev | Build |
| --- | --- | --- |
| Modullar | Brauzerga alohida-alohida beriladi (ESM) | Rollup bilan bundle qilinadi |
| `.vue` | So'ralganda kompilyatsiya qilinadi | Oldindan kompilyatsiya |
| Vue build | Ogohlantirishlar bilan (dev build) | `NODE_ENV=production`, ogohlantirishlarsiz, ~34 KB gzip |
| Shablon kompilyatori | Kerak emas (SFC oldindan kompilyatsiya qilingan) | Bundle'ga kirmaydi |
| Source map | To'liq | Sozlanadi (68-bob) |

Shuning uchun dev'da ko'ringan "Extraneous non-props attributes" kabi ogohlantirishlar production'da yo'q — lekin bu muammo yo'qoldi degani emas, faqat xabar o'chirilgan.

## Muhandislik nuqtai nazari: `node_modules` va versiyalar

`package.json` da `"vue": "^3.5.43"` yozuvi — "3.5.43 dan katta, lekin 4.0.0 dan kichik istalgan versiya" degani (caret). `package-lock.json` esa aniq qaysi versiya o'rnatilganini yozib qo'yadi. Jamoada bir xil natija olish uchun:

```bash
npm ci      # lock faylga qat'iy amal qiladi; CI'da shu ishlatiladi
npm install # lock faylni yangilashi mumkin
```

Bu farq CI'da "menda ishlayapti" muammosining yarmini yo'q qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `vue.runtime.esm-browser.js` bilan HTML ichida shablon yozish | Runtime-only build shablon kompilyatorisiz keladi; `{{ }}` ishlamaydi | CDN uchun `vue.esm-browser.js`, loyihada esa `.vue` fayl |
| `npm create vue@latest` o'rniga eski `vue-cli` | Vue CLI (webpack) endi maintenance rejimida | Yangi loyihada faqat Vite |
| `dist/` ni to'g'ridan-to'g'ri `file://` orqali ochish | ESM va yo'llar `file://` da ishlamaydi | `npm run preview` yoki har qanday static server |
| Vue'ni `dependencies` o'rniga `devDependencies` ga qo'yish | Ba'zi hosting/SSR stsenariylarida topilmaydi | `vue` — `dependencies`, `vite`/`vitest` — `devDependencies` |
| Global o'rnatish (`npm i -g vue`) | Vue global CLI emas; versiyalar loyihaga bog'liq bo'lishi kerak | Har doim loyiha ichida lokal bog'liqlik |

## Amaliyot

1. Build qadamisiz variantni yarating va `count` o'rniga ismingizni ko'rsatadigan input qo'shing (`v-model="name"`).
2. `npm create vue@latest` bilan loyiha yarating, `src/App.vue` ni yuqoridagi sanoq komponentiga almashtiring.
3. `npm run build` ni ishga tushiring, `dist/` hajmini ko'ring: `du -sh dist`. Keyin `npm run preview` bilan oching.
4. `package.json` dagi `vue` versiyasini `npm view vue version` bilan solishtiring — caret nimani anglatishini o'z loyihangizda tekshiring.

## Rasmiy hujjat

- Tez boshlash: <https://vuejs.org/guide/quick-start.html>
- Vite hujjati: <https://vite.dev/guide/>
- Build fayllari farqi: <https://vuejs.org/guide/scaling-up/tooling.html>
