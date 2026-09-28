# 01 — Next.js nima va nega shunday

[Mundarija](README.md) · [Keyingi: O'rnatish va loyiha tuzilmasi →](02-ornatish.md)

## Tushuncha

Next.js — React ustiga qurilgan **to'liq framework**. React faqat "holatdan UI qanday hosil bo'ladi" degan savolga javob beradi; qolgan hamma narsani (marshrutlash, ma'lumot yuklash, SSR, build, deploy) o'zingiz yig'asiz (React qo'llanmasi, 04-bob).

Next shu bo'shliqni to'ldiradi va ustiga bitta katta g'oya qo'shadi: **komponentning bir qismi serverda ishlaydi va brauzerga umuman yuborilmaydi.**

```
Vite SPA:   HTML (bo'sh) → JS yuklandi → so'rov → render
Next:       Server render → tayyor HTML → JS faqat interaktiv qismlar uchun
```

## Nega shunday: qaysi muammoni yechadi

SPA'da to'rtta muammo bor:

| Muammo | SPA'da | Next'da |
| --- | --- | --- |
| Birinchi ekran sekin | Bo'sh HTML, JS kutiladi | Tayyor HTML darhol |
| SEO va ijtimoiy preview | Bot JS'ni kutadi yoki bajarmaydi | HTML'da mazmun bor |
| Ma'lumot zanjiri uzun | HTML → JS → so'rov → render | Serverda ma'lumot olinadi |
| Sirlar klientda | API kaliti bundle'da ko'rinadi | Server kodida qoladi |

Narxi: server kerak, server/klient chegarasini o'ylash kerak, kesh murakkab.

## Kod: birinchi farq — Server Component

::: ts
```tsx
// app/products/page.tsx — bu SERVER komponenti (standart)
import { db } from '@/lib/db'

export default async function ProductsPage() {
  // To'g'ridan-to'g'ri bazaga murojaat — bu kod brauzerga YUBORILMAYDI
  const products = await db.product.findMany({ take: 20 })

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
// app/products/page.jsx — bu SERVER komponenti (standart)
import { db } from '@/lib/db'

export default async function ProductsPage() {
  const products = await db.product.findMany({ take: 20 })

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

Uch narsa e'tiborga loyiq:

1. **Komponent `async`** — React'da (klientda) bu mumkin emas edi;
2. **Bazaga to'g'ridan-to'g'ri murojaat** — API qatlami kerak emas;
3. **`useState` yo'q** — bu komponent interaktiv emas, u faqat HTML chiqaradi.

Interaktivlik kerak bo'lsa — alohida klient komponenti:

::: ts
```tsx
// app/products/AddToCartButton.tsx
'use client'

import { useState } from 'react'

export function AddToCartButton({ productId }: { productId: number }) {
  const [added, setAdded] = useState(false)

  return (
    <button onClick={() => setAdded(true)}>
      {added ? 'Qo\'shildi' : 'Savatga'}
    </button>
  )
}
```
:::

::: js
```jsx
// app/products/AddToCartButton.jsx
'use client'

import { useState } from 'react'

export function AddToCartButton({ productId }) {
  const [added, setAdded] = useState(false)

  return <button onClick={() => setAdded(true)}>{added ? 'Qo\'shildi' : 'Savatga'}</button>
}
```
:::

`'use client'` — "bu fayldan boshlab kod brauzerga ham yuboriladi" degan belgi (04-bob).

## Kod: fayl tuzilmasi — marshrutlar

```
app/
├── layout.tsx              → barcha sahifalar uchun umumiy o'ram
├── page.tsx                → /
├── products/
│   ├── page.tsx            → /products
│   ├── loading.tsx         → yuklanish holati
│   ├── error.tsx           → xato holati
│   └── [slug]/page.tsx     → /products/:slug
├── (marketing)/            → guruh, URL'ga kirmaydi
│   └── about/page.tsx      → /about
└── api/
    └── health/route.ts     → GET /api/health
```

Router konfiguratsiya fayli yo'q — **papka tuzilmasi marshrutlarni belgilaydi** (07-bob).

## Kod: Next tarixi va App Router

Next'da ikki router bor va ikkalasi bir loyihada yashashi mumkin:

| | Pages Router (eski) | App Router (yangi) |
| --- | --- | --- |
| Papka | `pages/` | `app/` |
| Ma'lumot | `getServerSideProps`, `getStaticProps` | `async` komponent |
| Layout | `_app.tsx` (bitta) | `layout.tsx` (ichma-ich) |
| Server Components | Yo'q | Ha |
| Streaming | Cheklangan | To'liq |
| Kesh | Sodda | To'rt qatlamli |
| Holat | Qo'llab-quvvatlanadi | **Tavsiya etiladi** |

Yangi loyihada — App Router. Eski loyihalar uchun VI qism (38–41-boblar) bor.

## Muhandislik nuqtai nazari: Next kerakmi

| Vaziyat | Javob |
| --- | --- |
| Marketing sayti, blog, e-commerce katalogi | ✅ Ha — SEO va birinchi ekran |
| Login orqasidagi admin panel | ❌ Vite SPA yetarli |
| Mavjud backend bor, faqat frontend kerak | ⚖️ Ikkalasi ham mumkin (28–31-boblar bunga bag'ishlangan) |
| Jamoa server tomonini boshqara olmaydi | ⚖️ Statik eksport rejimi yoki SPA |
| Real-time dashboard | ❌ SPA soddaroq |
| Ko'p sahifali kontent sayti | ✅ Ha |

Eng ko'p uchraydigan xato — **"React = Next"** deb o'ylab, oddiy ichki tizimni server render bilan murakkablashtirish.

## Muhandislik nuqtai nazari: Next'ni o'rganishdagi uchta qiyinchilik

Bu qo'llanma aynan shu uchtasiga e'tibor beradi:

**1. Server va klient chegarasi.** "Nega `useState` ishlamayapti?", "Nega `window` topilmadi?" — 04-bob.

**2. Kesh.** "Nega ma'lumot yangilanmayapti?" — Next'da to'rtta kesh qatlami bor va ular birgalikda ishlaydi — 18, 19-boblar.

**3. Auth va tokenlar.** Tashqi backend bilan ishlaganda cookie qayerda o'qiladi, refresh qanday bo'ladi, server komponentdan so'rov qanday yuboriladi — IV qism (25–31-boblar).

## Muhandislik nuqtai nazari: versiya va o'zgarishlar

Next tez rivojlanadi va materiallar tez eskiradi. 2026-yil sentabr holati:

| Versiya | Asosiy o'zgarish |
| --- | --- |
| 13 | App Router (beta), Server Components |
| 14 | Server Actions barqaror, Turbopack (dev) |
| 15 | Kesh standartlari o'zgardi (`fetch` endi standart holda keshlanmaydi), React 19 |
| **16** | Turbopack standart, kesh boshqaruvi soddalashtirildi, `next/image` yaxshilandi |

Shuning uchun **maqolalarga emas, rasmiy hujjatga** tayaning va versiyani tekshiring:

```bash
npx next --version
npm view next version
```

Bu qo'llanma **Next 16.3** va **React 19.3** uchun yozilgan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har komponentga `'use client'` qo'shish | RSC foydasi yo'qoladi, bundle o'sadi | Faqat interaktiv barglarga (04-bob) |
| Server komponentda `useState` ishlatishga urinish | Xato: hooklar faqat klientda | `'use client'` yoki holatni pastga tushirish |
| Admin panelni Next'da SSR qilish | Ortiqcha murakkablik | SPA |
| Eski (Next 12–14) maqolalarga tayanish | Kesh va API'lar o'zgargan | Rasmiy hujjat + versiya |
| Pages va App Router'ni aralashtirib, farqini bilmaslik | Chalkash kod | 38–41-boblar |
| `fetch` keshini Next 15+ da eski qoidalar bo'yicha kutish | Standart o'zgargan | 18-bob |

## Amaliyot

1. `npm view next version` bilan joriy versiyani tekshiring va qo'llanmadagi bilan solishtiring.
2. Vite SPA va Next'da bir xil sahifani ochib, "View source" bilan HTML'ni solishtiring: mazmun qayerda bor?
3. JavaScript'ni o'chirib (DevTools → Settings → Disable JavaScript) ikkala variantni oching.
4. Loyihangiz uchun "Next kerakmi" jadvalidan o'ting va qarorni bir jumlada yozing.

## Rasmiy hujjat

- Next.js hujjati: <https://nextjs.org/docs>
- App Router asoslari: <https://nextjs.org/docs/app/getting-started>
- React Server Components: <https://react.dev/reference/rsc/server-components>
