# 03 — Loyiha tuzilmasi va Vite

[← Oldingi: O'rnatish va ishga tushirish](02-ornatish-va-ishga-tushirish.md) · [Mundarija](README.md) · [Keyingi: React'dan foydalanish usullari →](04-foydalanish-usullari.md)

## Tushuncha

Vite bergan loyiha:

```
my-app/
├── index.html              ← kirish nuqtasi (Vite uchun ham)
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/                 ← o'zgarishsiz ko'chiriladigan fayllar
└── src/
    ├── main.tsx            ← createRoot(...).render(<App />)
    ├── App.tsx
    ├── index.css
    └── assets/
```

React, Vue'dan farqli, **papka tuzilmasi bo'yicha hech narsa talab qilmaydi**. Bu erkinlik ham imkoniyat, ham tuzoq: har loyiha o'zicha tuziladi va yangi odam har safar qaytadan o'rganadi.

## Kod: `vite.config.ts`

::: ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true,
  },
})
```
:::

::: js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: true,
  },
})
```
:::

`@` aliasi IDE ham bilishi uchun `tsconfig.json` da takrorlanadi:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`server.proxy` — backend bilan ishlaganda CORS muammosini yo'q qiladi: brauzer `/api/...` ni o'z domenida so'raydi, Vite esa uni backendga uzatadi.

## Kod: muhit o'zgaruvchilari

```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

```ts
const apiUrl = import.meta.env.VITE_API_URL
const isDev = import.meta.env.DEV
```

Ikki qat'iy qoida (47-bobda batafsil):

1. Faqat **`VITE_`** prefiksli o'zgaruvchilar klientga chiqadi;
2. Ular **maxfiy emas** — build'da kodga matn sifatida yoziladi.

TypeScript uchun tiplar:

```ts
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Kod: papka tuzilmasi — ikki maktab

**1. Turiga qarab** (kichik loyihalar uchun):

```
src/
├── components/
├── hooks/
├── pages/
├── lib/
└── types/
```

**2. Xususiyatga qarab** (o'sganda — 34-bobda batafsil):

```
src/
├── shared/                 ← hamma joyda ishlatiladigan UI va yordamchilar
│   ├── ui/                 Button, Input, Modal
│   ├── lib/                formatlash, yordamchilar
│   └── api/                HTTP klient
└── features/
    ├── auth/               components/ hooks/ api.ts store.ts
    ├── cart/
    └── catalog/
```

Chegara: **bitta papkani o'chirsangiz, faqat bitta funksionallik yo'qolishi kerak.** 15–20 komponentgacha birinchi usul yetarli.

Import yo'nalishi bir tomonlama: `features/*` → `shared/*`, teskarisi emas. Buni ESLint bilan majburlash mumkin (46-bob).

## Kod: fayl nomlash konvensiyalari

React ekotizmida yagona standart yo'q. Keng tarqalgan ikki variant:

```
Button.tsx          UserCard.tsx        ← PascalCase (komponentlar uchun)
use-auth.ts         format-date.ts      ← kebab-case (qolgani uchun)
```

yoki hamma narsa `kebab-case`. Muhimi — **bitta loyihada bir xil bo'lishi**.

Amaliy tavsiya: komponent fayli — PascalCase (import qilinganda bir xil ko'rinadi), hook va utilitalar — kebab-case yoki camelCase.

Barrel fayllar (`index.ts` bilan re-export) qulay ko'rinadi, lekin katta loyihada muammo tug'diradi: aylanma importlar va tree-shaking'ning yomonlashuvi. Ularni faqat `shared/ui` kabi barqaror modullarda ishlating.

## Kod: absolyut import va tartib

```ts
// 1. Tashqi paketlar
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Ichki modullar (alias bilan)
import { Button } from '@/shared/ui/Button'
import { useAuth } from '@/features/auth/use-auth'

// 3. Nisbiy (faqat yaqin fayllar)
import { CartLine } from './CartLine'

// 4. Uslublar va aktivlar
import styles from './Cart.module.css'
```

Bu tartibni ESLint (`import/order`) avtomatik saqlab turadi.

## Muhandislik nuqtai nazari: `public/` va `src/assets/`

| | `public/` | `src/assets/` |
| --- | --- | --- |
| Build ko'radimi | Yo'q | Ha |
| Nomga hash qo'shiladimi | Yo'q | Ha |
| Ishlatilmagani bundle'ga kiradimi | Ha (ko'chiriladi) | Yo'q |
| Murojaat | `/logo.svg` | `import logo from '@/assets/logo.svg'` |

Qoida: **import qilinadigan narsa `src/assets/` da**, faqat URL orqali kerak bo'ladigan (`robots.txt`, `og-image.png`, favicon) `public/` da.

## Muhandislik nuqtai nazari: HMR nima saqlaydi

Vite'ning React plugini **Fast Refresh** ishlatadi:

| O'zgarish | Natija |
| --- | --- |
| Komponent JSX'i | Qayta render, holat **saqlanadi** |
| Hook mantiqi | Komponent qayta yaratiladi, holat yo'qoladi |
| Komponentdan tashqaridagi kod (utilita) | Modul qayta yuklanadi |
| Fayl komponentdan boshqa narsa ham eksport qilsa | Fast Refresh o'chadi, sahifa to'liq yangilanadi |

Oxirgi qator amaliy ahamiyatga ega: **bitta faylda komponent va oddiy funksiyani birga eksport qilmang** — HMR buziladi. Shuning uchun `Button.tsx` faqat `Button` ni eksport qilsin, konstantalar alohida faylga chiqsin.

## Muhandislik nuqtai nazari: dev va build farqi

`npm run dev` va `npm run build` bir xil kodni ikki xil ishlaydi (Vite haqida — Vue qo'llanmasidagi 06-bob bilan bir xil mantiq):

- Dev'da modullar alohida beriladi, `NODE_ENV=development`, React ogohlantirishlari yoqilgan;
- Build'da hammasi bundle qilinadi, `NODE_ENV=production`, ogohlantirishlar olib tashlanadi, React ~45 KB gzip.

Shuning uchun "dev'da ishladi, production'da buzildi" holatlari bo'ladi: katta-kichik harf (macOS vs Linux), faqat dev'da mavjud global narsalar, tip xatolari. Har PR'da `npm run build` — eng arzon himoya.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Nisbiy import zanjirlari (`../../../`) | Fayl ko'chirilsa sinadi | `@` aliasi |
| `.env` ni git'ga qo'shish | Sirlar tarixda qoladi | `.env.example` |
| API kalitini `VITE_` bilan berish | Bundle'da ochiq | Serverda saqlang (47-bob) |
| Komponent fayldan qo'shimcha narsa eksport qilish | Fast Refresh o'chadi | Alohida fayl |
| `process.env` ishlatish | Vite'da yo'q | `import.meta.env` |
| Papka tuzilmasini oldindan haddan ortiq bo'lish | Ortiqcha murakkablik | 15 komponentgacha oddiy tuzilma |
| Hamma joyda barrel `index.ts` | Aylanma importlar, tree-shaking yomonlashadi | Faqat barqaror modullarda |

## Amaliyot

1. `@` aliasini sozlang (Vite va tsconfig'da) va bitta komponentni shu orqali import qiling.
2. `server.proxy` sozlab, backend so'rovini Network panelida tekshiring.
3. `.env` da `VITE_API_URL` bering, build qiling va `grep` bilan uni `dist/assets/*.js` ichidan toping.
4. Komponent faylidan qo'shimcha konstanta eksport qiling va HMR buzilishini kuzating; keyin ajrating.
5. Loyihangizni "xususiyatga qarab" tuzilmaga ko'chirish rejasini chizing (34-bobda qaytamiz).

## Rasmiy hujjat

- Vite: <https://vite.dev/guide/>
- `@vitejs/plugin-react`: <https://github.com/vitejs/vite-plugin-react>
- React fayl tuzilmasi haqida: <https://react.dev/learn/thinking-in-react>
