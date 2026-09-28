# 04 — React'dan foydalanish usullari

[← Oldingi: Loyiha tuzilmasi va Vite](03-loyiha-tuzilmasi-va-vite.md) · [Mundarija](README.md) · [Keyingi: Render modeli →](05-render-modeli.md)

## Tushuncha

React — kutubxona, framework emas. U faqat bitta savolga javob beradi: **"holatdan UI qanday hosil bo'ladi?"** Qolgan hamma narsa (marshrutlash, ma'lumot yuklash, build, SSR) sizning yoki framework'ning zimmasida.

Shuning uchun React bilan ishlashning bir necha shakli bor:

| Shakl | Vosita | Qachon |
| --- | --- | --- |
| SPA | Vite + React Router | Admin, dashboard, ichki tizim |
| Fullstack framework | Next.js, React Router v7 (Remix), TanStack Start | SEO, SSR, server ma'lumoti |
| Statik sayt | Astro (React orollari), Next SSG | Blog, hujjat, landing |
| Vidjet | CDN yoki kichik build | Mavjud serverda render bo'ladigan sahifa |
| Mobil | React Native / Expo | iOS va Android |
| Desktop | Electron, Tauri | Desktop ilova |

## Kod: 1 — SPA (Vite)

```
dist/
├── index.html          ← barcha URL shu faylga yo'naltiriladi
└── assets/
```

Serverda fallback majburiy:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Ustunligi: arzon deploy (statik fayllar), sodda mental model. Kamchiligi: birinchi yuklanishda bo'sh HTML, SEO yomon, ma'lumot yuklash zanjiri uzun (HTML → JS → so'rov → render).

## Kod: 2 — framework (server render bilan)

Next.js misolida:

::: ts
```tsx
// app/products/page.tsx — Server Component
export default async function ProductsPage() {
  const products = await db.product.findMany()      // to'g'ridan-to'g'ri bazaga

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
// app/products/page.jsx — Server Component
export default async function ProductsPage() {
  const products = await db.product.findMany()      // to'g'ridan-to'g'ri bazaga

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  )
}
```
:::

Bu komponent **brauzerga umuman yuborilmaydi**: server uni HTML'ga aylantiradi. Natijada bundle kichik, ma'lumot yaqin, SEO ishlaydi.

Narxi: server kerak, server/klient chegarasini o'ylash kerak, kesh murakkab. Next.js qo'llanmasi shu masalalarga bag'ishlangan.

## Kod: 3 — statik sayt (Astro bilan orollar)

```astro
---
// src/pages/index.astro — server'da bir marta ishlaydi
import Counter from '../components/Counter.tsx'

const posts = await getPosts()
---

<html>
  <body>
    <h1>Blog</h1>
    <ul>{posts.map((p) => <li>{p.title}</li>)}</ul>

    <!-- Faqat shu komponent uchun JS yuboriladi -->
    <Counter client:visible />
  </body>
</html>
```

"Islands architecture": sahifa asosan statik HTML, React faqat interaktiv bo'laklar uchun yuklanadi. Blog va marketing saytlar uchun eng tez variant.

## Kod: 4 — vidjet

02-bobdagi CDN misoli. Asosiy qoidalar:

- Ma'lumot `data-*` atributlar orqali kiradi (global o'zgaruvchi emas);
- Bir sahifada bir nechta ildiz bo'lishi mumkin: har biriga o'z `createRoot`;
- Uslublar to'qnashmasligi uchun izolyatsiya kerak (CSS Modules, prefiks yoki Shadow DOM).

## Kod: 5 — React Native (qisqacha)

```tsx
import { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <View style={{ padding: 24 }}>
      <Text style={{ fontSize: 24 }}>Sanoq: {count}</Text>
      <TouchableOpacity onPress={() => setCount((c) => c + 1)}>
        <Text>+1</Text>
      </TouchableOpacity>
    </View>
  )
}
```

Hooklar, props, holat — aynan bir xil. Farq: HTML elementlari o'rniga platforma komponentlari (`View`, `Text`), CSS o'rniga style obyektlari. Ya'ni bu qo'llanmadagi 05–33-boblar React Native'da ham to'liq amal qiladi.

## Muhandislik nuqtai nazari: framework tanlash

React jamoasi endi rasman framework tavsiya qiladi. Amaliy qaror daraxti:

| Savol | Javob → tanlov |
| --- | --- |
| SEO va ijtimoiy preview kerakmi? | Ha → Next.js / React Router v7 |
| Login orqasidagi ichki tizimmi? | Ha → Vite SPA yetarli |
| Kontent asosan statikmi (blog, hujjat)? | Ha → Astro yoki Next SSG |
| Backend allaqachon bormi (Laravel, Django, Go)? | Ha → Vite SPA yoki Next faqat frontend sifatida |
| Jamoa server tomonini boshqara oladimi? | Yo'q → SPA (statik deploy) |
| Mobil ilova ham kerakmi? | Ha → React Native + kod bo'lishish |

Eng ko'p uchraydigan xato — **Next.js ni "React'ning standart usuli" deb olib, keyin uning server modeli bilan kurashish.** Agar ilovangiz login orqasida bo'lsa va SEO kerak bo'lmasa, Vite SPA kamroq murakkablik beradi.

Teskari xato ham bor: marketing sayti yoki katalogni SPA qilib, keyin SEO muammosini "tuzatishga" urinish.

## Muhandislik nuqtai nazari: mavjud backend bilan

O'zbekistondagi ko'p loyihalarda backend allaqachon bor (Laravel, Symfony, Django). Uch variant:

1. **Alohida SPA** — `api.example.com` + `app.example.com`. Eng keng tarqalgan; auth tokenlar bilan ishlanadi (39-bob va Next qo'llanmasining IV qismi).
2. **Backend shablonlari ichida vidjetlar** — Blade/Twig ichida React bo'laklari. Migratsiya bosqichida qulay.
3. **Next.js frontend + tashqi API** — SSR foydasi bor, lekin token boshqaruvi murakkablashadi (Next qo'llanmasi, 25–31-boblar).

Uchinchi variant eng ko'p savol tug'diradi va aynan shu sababli alohida ochilgan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Admin panelni Next.js'da SSR qilish | Ortiqcha murakkablik, foyda yo'q | Vite SPA |
| Marketing saytini SPA qilish | SEO va birinchi ko'rinish yomon | SSG/SSR |
| SPA'da fallback sozlamaslik | Ichki URL'da 404 | `try_files` |
| Vidjetda global o'zgaruvchilar | Ikkita vidjet to'qnashadi | `data-*` props |
| "React = Next.js" deb o'ylash | Keraksiz server qatlami | Ehtiyojdan kelib chiqing |
| Har sahifaga alohida `createRoot` (SPA ichida) | Holat bo'linadi | Bitta ildiz + router |

## Amaliyot

1. Loyihangiz (yoki rejangiz) uchun yuqoridagi qaror daraxtidan o'ting va tanlovni bir jumlada asoslang.
2. Vite SPA yasang, `dist/` ni statik server orqali oching, ichki URL'da 404 ni ko'ring, keyin fallback sozlang.
3. Mavjud server-rendered sahifaga React vidjeti qo'shing (`data-*` dan props oling).
4. Bitta komponentni React Native (Expo Snack) da ishga tushirib ko'ring — kod qanchalik o'xshash?

## Rasmiy hujjat

- Framework tanlash: <https://react.dev/learn/creating-a-react-app>
- Mavjud loyihaga qo'shish: <https://react.dev/learn/add-react-to-an-existing-project>
- React Native: <https://reactnative.dev>
