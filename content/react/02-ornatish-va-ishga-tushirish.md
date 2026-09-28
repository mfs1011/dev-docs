# 02 — O'rnatish va ishga tushirish

[← Oldingi: React nima va nega shunday](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Loyiha tuzilmasi va Vite →](03-loyiha-tuzilmasi-va-vite.md)

## Tushuncha

React'ni ishga tushirishning uch yo'li bor va ular bir xil emas:

| Yo'l | Nima uchun | Build |
| --- | --- | --- |
| **Vite + React** | Toza SPA: admin panel, dashboard, ichki tizim | Ha |
| **Framework** (Next.js, React Router v7, TanStack Start) | SEO, SSR, server ma'lumoti kerak bo'lsa | Ha |
| **CDN `<script>`** | Mavjud sahifaga kichik vidjet | Yo'q |

Rasmiy hujjat (react.dev) yangi loyiha uchun **framework** tavsiya qiladi. Bu qo'llanmada esa avval **Vite** bilan boramiz: shunda React'ning o'zini framework sehri aralashmagan holda o'rganasiz. Next.js — alohida qo'llanmada.

`create-react-app` **eskirgan** (2025-da rasman arxivlangan) — uni yangi loyihada ishlatmang.

## Kod: Vite bilan yangi loyiha

```bash
npm create vite@latest my-app
# Framework: React
# Variant:   TypeScript  (yoki JavaScript)

cd my-app
npm install
npm run dev
```

Natija: `http://localhost:5173`, HMR bilan.

```bash
npm run build      # dist/ — statik fayllar
npm run preview    # production build'ni lokal ko'rish
```

## Kod: birinchi komponent

::: ts
```tsx
// src/App.tsx
import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Sanoq: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </main>
  )
}
```
:::

::: js
```jsx
// src/App.jsx
import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui' }}>
      <h1>Sanoq: {count}</h1>
      <button onClick={() => setCount((c) => c + 1)}>+1</button>
    </main>
  )
}
```
:::

## Kod: kirish nuqtasi

::: ts
```tsx
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
:::

::: js
```jsx
// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```
:::

Uchta narsaga e'tibor:

1. **`createRoot`** — React 18+ dagi API. Eski `ReactDOM.render` olib tashlangan.
2. **`<StrictMode>`** — faqat ishlab chiqishda ishlaydi va **effektlarni ataylab ikki marta** ishga tushiradi. Bu xato emas: u tozalanmagan effektlarni ochib beradi (29-bob). Production'da bunday bo'lmaydi.
3. **`index.css`** — CSS oddiy import bilan ulanadi; Vite uni build'da alohida faylga ajratadi.

## Kod: CDN orqali (build qadamisiz)

Mavjud sahifaga kichik interaktiv bo'lak qo'shish uchun:

```html
<div id="rating-widget" data-product-id="42"></div>

<script type="importmap">
  {
    "imports": {
      "react": "https://esm.sh/react@19.3.0",
      "react-dom/client": "https://esm.sh/react-dom@19.3.0/client"
    }
  }
</script>

<script type="module">
  import { createElement as h, useState } from 'react'
  import { createRoot } from 'react-dom/client'

  function Rating({ productId }) {
    const [value, setValue] = useState(0)

    return h('div', null,
      [1, 2, 3, 4, 5].map((n) =>
        h('button', { key: n, onClick: () => setValue(n) }, n <= value ? '★' : '☆'),
      ),
    )
  }

  const el = document.getElementById('rating-widget')

  createRoot(el).render(h(Rating, { productId: Number(el.dataset.productId) }))
</script>
```

JSX bu yerda ishlamaydi (brauzer uni tushunmaydi), shuning uchun `createElement` qo'lda yoziladi — JSX aslida shunga aylanadi (08-bob). Serverdan kelgan ma'lumot `data-*` atribut orqali props sifatida uzatildi.

## Kod: TypeScript bilan boshlash

Vite shablonida TS allaqachon sozlangan. Diqqat qilinadigan narsa — Vite **tiplarni tekshirmaydi** (esbuild faqat olib tashlaydi). Shuning uchun:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc --noEmit",
    "preview": "vite preview"
  }
}
```

`npm run dev` tip xatosi bilan ham ishlayveradi — bu ataylab, tezlik uchun. Tekshiruv IDE va CI zimmasida (46-bob).

## Muhandislik nuqtai nazari: Vite yoki framework

| Savol | Vite SPA | Framework (Next va h.k.) |
| --- | --- | --- |
| SEO kerakmi | Yo'q | Ha |
| Login orqasidagi ilovami | Ha | Ortiqcha |
| Server ma'lumoti va kesh | O'zingiz yig'asiz | Tayyor |
| Deploy | Statik fayllar (arzon) | Node/Edge runtime |
| Kirish murakkabligi | Past | O'rtacha |
| Router, ma'lumot qatlami | Tanlaysiz (React Router, TanStack Query) | Tayyor |

Qoida: **birinchi ekranda mazmun ko'rinishi va qidiruv tizimlari muhimmi?** → framework. Aks holda Vite SPA sodda va yetarli.

## Muhandislik nuqtai nazari: `StrictMode` nima qiladi

Ishlab chiqish rejimida `StrictMode`:

- Komponent funksiyasini **ikki marta** chaqiradi (toza emasligini ochish uchun);
- `useEffect` ni ishga tushiradi → tozalaydi → yana ishga tushiradi;
- Eskirgan API'lar haqida ogohlantiradi.

Ko'p boshlovchilar buni "xato" deb hisoblab, `StrictMode` ni o'chiradi. Bu — noto'g'ri qaror: u ochib bergan muammolar production'da poyga holatlari va xotira oqishlari sifatida qaytadi (29-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `create-react-app` bilan boshlash | Arxivlangan, sekin, eskirgan | Vite yoki framework |
| `StrictMode` ni o'chirish | Haqiqiy xatolar yashiriladi | Sababini toping (29-bob) |
| `ReactDOM.render` ishlatish | React 19 da olib tashlangan | `createRoot` |
| Vite tiplarni tekshiradi deb o'ylash | Tip xatolari build'gacha ko'rinmaydi | `tsc -b` skriptda |
| CDN rejimida JSX yozish | Brauzer tushunmaydi | `createElement` yoki build |
| `npm run dev` da ishlagan kodni build qilmasdan deploy | Katta-kichik harf, import xatolari | CI'da `npm run build` |

## Amaliyot

1. Vite bilan React loyihasi yarating va sanoq komponentini yozing.
2. `StrictMode` ichida `useEffect(() => console.log('effekt'), [])` yozing — konsolda nechta marta chiqdi? Keyin `StrictMode` ni olib tashlab solishtiring (so'ng qaytaring).
3. `npm run build` qilib `dist/` hajmini ko'ring: `du -sh dist`.
4. CDN variantini yasang va mavjud HTML sahifaga vidjet sifatida joylang.

## Rasmiy hujjat

- Yangi loyiha: <https://react.dev/learn/start-a-new-react-project>
- Mavjud loyihaga qo'shish: <https://react.dev/learn/add-react-to-an-existing-project>
- `StrictMode`: <https://react.dev/reference/react/StrictMode>
