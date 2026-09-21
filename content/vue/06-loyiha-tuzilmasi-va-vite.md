# 06 — Loyiha tuzilmasi va Vite

[← Oldingi: Ikki API uslubi](05-ikki-api-uslubi.md) · [Mundarija](README.md) · [Keyingi: Reaktivlik mental modeli →](07-reaktivlik-mental-modeli.md)

## Tushuncha

`npm create vue@latest` bergan loyiha quyidagicha:

```
vue-mashq/
├── index.html              ← kirish nuqtasi (Vite uchun ham)
├── package.json
├── vite.config.js
├── jsconfig.json           ← IDE uchun yo'l aliaslari
├── public/                 ← o'zgarishsiz ko'chiriladigan fayllar
│   └── favicon.ico
└── src/
    ├── main.js             ← createApp(...).mount('#app')
    ├── App.vue             ← ildiz komponent
    ├── assets/             ← build ko'radigan rasm/CSS
    ├── components/
    ├── views/              ← marshrutga mos sahifalar (router bo'lsa)
    ├── router/index.js
    └── stores/             ← Pinia store'lari
```

Ikki papka chalkashtiradi: `public/` va `src/assets/`.

- `public/` — build vaqtida **ochilmaydi**: fayllar o'z nomi bilan `dist/` ga ko'chadi. URL: `/favicon.ico`. Hash yo'q, ya'ni brauzer keshi uzoq ushlab qolishi mumkin.
- `src/assets/` — build ko'radi: import qilingan rasm optimallashtiriladi, nomiga hash qo'shiladi (`logo-a1b2c3.svg`), ishlatilmagani `dist` ga umuman tushmaydi.

Qoida: **import qilinadigan hamma narsa `src/assets/` da, faqat URL orqali kerak bo'ladigan narsa `public/` da** (masalan `robots.txt`, `og-image.png`).

## Nega shunday: Vite qanday ishlaydi

Dev rejimda Vite **bundle qilmaydi**. Brauzer `import './App.vue'` ni ko'rib, `/src/App.vue` ni so'raydi; Vite uni o'sha zahoti JavaScript'ga aylantirib qaytaradi. Shuning uchun:

- Dev server ishga tushish vaqti loyiha hajmiga deyarli bog'liq emas;
- HMR faqat o'zgargan modulni almashtiradi — holat saqlanadi.

Production'da esa teskari: `npm run build` hamma narsani Rollup bilan bundle qiladi, chunki HTTP/2 bo'lsa ham minglab kichik faylni so'rash sekin.

Bu ikkilik bitta amaliy oqibat beradi: **dev'da ishlagan narsa build'da ishlamasligi mumkin.** Eng tipik sabablar — katta-kichik harf farqi (macOS fayl tizimi farqni sezmaydi, Linux CI sezadi) va faqat dev'da mavjud global narsalar. Shuning uchun `npm run build && npm run preview` ni haftada bir emas, har PR'da ishlating.

## Kod: `vite.config.js`

```js
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // /api/... so'rovlari backend'ga uzatiladi — CORS muammosi yo'qoladi
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,          // 68-bob: xatolarni o'qish uchun
    chunkSizeWarningLimit: 600,
  },
})
```

`@` aliasi sizga `../../../components/UiButton.vue` o'rniga `@/components/UiButton.vue` yozish imkonini beradi. IDE ham buni bilishi uchun `jsconfig.json` (yoki TS'da `tsconfig.json`) da takrorlanadi:

```json
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}
```

## Kod: muhit o'zgaruvchilari

```bash
# .env                — barcha rejimlarda
VITE_API_URL=https://api.example.com

# .env.development    — faqat `npm run dev`
VITE_API_URL=http://localhost:8000

# .env.production     — faqat `npm run build`
VITE_API_URL=https://api.example.com
```

```js
const url = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV        // boolean
const mode = import.meta.env.MODE        // 'development' | 'production'
```

Ikki qat'iy qoida:

1. **Faqat `VITE_` prefiksli o'zgaruvchilar klientga chiqadi.** Bu himoya ataylab: `DATABASE_PASSWORD` tasodifan bundle'ga tushmasin.
2. **Klientdagi hech narsa maxfiy emas.** `VITE_` bilan berilgan qiymat build'da kodga **matn sifatida yoziladi** va uni har kim ko'radi. API kalitlari faqat serverda (65-bob).

## Kod: statik import va dinamik import

```js
// Statik — build vaqtida bundle'ga kiradi
import UserCard from '@/components/UserCard.vue'

// Dinamik — alohida chunk, kerak bo'lganda yuklanadi (63-bob)
const AdminPanel = () => import('@/views/AdminPanel.vue')
```

Rasm va boshqa fayllar ham import qilinadi:

```js
import logoUrl from '@/assets/logo.svg'        // URL satr qaytadi
import styles from '@/styles/table.module.css' // CSS Modules obyekti
import data from '@/data/regions.json'         // JSON obyekt
```

Shablonda esa rasm yo'li **oddiy matn emas**:

```vue
<!-- ✗ Build'da yo'l buziladi -->
<img src="../assets/logo.svg">

<!-- ✓ Vite yo'lni aniqlaydi va hash qo'shadi -->
<img src="@/assets/logo.svg">

<!-- ✓ Dinamik holatda -->
<script setup>
import logoUrl from '@/assets/logo.svg'
</script>
<template>
    <img :src="logoUrl">
</template>
```

## Muhandislik nuqtai nazari: papkani nimaga qarab bo'lish

Ikki maktab bor:

**Turiga qarab** (standart shablon beradigan holat):

```
src/components/  src/views/  src/stores/  src/composables/
```

**Xususiyatga qarab** (feature-based), loyiha o'sganda:

```
src/
├── shared/           ← hamma joyda ishlatiladigan UI va yordamchilar
└── features/
    ├── auth/         ← components/ stores/ composables/ api.js
    ├── cart/
    └── catalog/
```

Chegara oddiy: **bitta papkani o'chirsangiz, faqat bitta funksionallik yo'qolishi kerak.** 10–15 komponentgacha birinchi usul yetarli; undan keyin ikkinchisi o'zini oqlaydi, chunki o'zgarish odatda bitta xususiyat ichida bo'ladi va hamma fayl yonma-yon turadi.

Qaysi usulni tanlasangiz ham, bitta qoidaga rioya qiling: **import yo'nalishi bir tomonlama.** `features/cart` `shared/` dan import qilishi mumkin, teskarisi — yo'q. Aks holda aylanma bog'liqlik paydo bo'ladi va "kim kimni yuklaydi" masalasi chigallashadi.

## Muhandislik nuqtai nazari: HMR nimani saqlaydi

Vite'ning `@vitejs/plugin-vue` moduli `.vue` faylni o'zgarganda butun sahifani emas, faqat komponentni almashtiradi:

| O'zgarish | Natija |
| --- | --- |
| Faqat `<template>` | Komponent qayta render qilinadi, holat saqlanadi |
| Faqat `<style>` | CSS almashadi, render ham bo'lmaydi |
| `<script setup>` ichidagi mantiq | Komponent qayta yaratiladi — **shu komponentning lokal holati yo'qoladi** |
| Pinia store fayli | Store HMR bilan yangilanadi (holat saqlanadi, 42-bob) |

Shuning uchun uzoq forma to'ldirib turib mantiqni o'zgartirsangiz, kiritilgan ma'lumot yo'qolishi normal — bu xato emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Rasmni `public/` ga qo'yib, `src` ichidan import qilish | Hash bo'lmaydi, keshda eski rasm qolib ketadi | `src/assets/` + import |
| `.env` faylini git'ga qo'shish | Sirlar tarixda qoladi | `.env.example` commit qilinadi, `.env` — `.gitignore` da |
| API kalitini `VITE_` bilan berish | Kalit bundle ichida ochiq turadi | Kalit serverda, klient faqat o'z backend'iga murojaat qiladi |
| `process.env.NODE_ENV` ni klient kodida ishlatish | Vite'da `process` yo'q | `import.meta.env.DEV` / `.PROD` |
| Nisbiy import zanjirlari (`../../../`) | Fayl ko'chirilsa hammasi sinadi | `@` aliasi |
| Faqat `npm run dev` bilan ishlash, build'ni deploy oldidan birinchi marta qilish | Katta-kichik harf, ishlatilmagan import, TS xatolari oxirida chiqadi | CI'da har PR uchun `npm run build` |

## Amaliyot

1. `@` aliasini sozlang (yoki mavjudini tekshiring) va bitta komponentni shu alias orqali import qiling.
2. `.env.development` da `VITE_API_URL` bering, komponentda `import.meta.env.VITE_API_URL` ni ekranga chiqaring. Keyin `npm run build` qilib, `dist/assets/*.js` ichida shu qiymatni `grep` bilan toping — nega maxfiy emasligini o'z ko'zingiz bilan ko'ring.
3. `server.proxy` sozlang va `/api/...` so'rovi backend'ga ketishini Network panelida tekshiring.
4. Bitta rasmni `public/` dan `src/assets/` ga ko'chiring, build qiling va `dist/` dagi fayl nomi qanday o'zgarganini solishtiring.

## Rasmiy hujjat

- Vite konfiguratsiyasi: <https://vite.dev/config/>
- Muhit o'zgaruvchilari: <https://vite.dev/guide/env-and-mode.html>
- Statik resurslar: <https://vite.dev/guide/assets.html>
