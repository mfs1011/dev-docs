# 07 — React Compiler

[← Oldingi: Reaktivlik: React yo'li](06-reaktivlik-react-yoli.md) · [Mundarija](README.md) · [Keyingi: JSX sintaksisi →](08-jsx.md)

## Tushuncha

React Compiler — build vaqtida ishlaydigan vosita: u komponent kodini tahlil qilib, **memoizatsiyani avtomatik qo'shadi**. Ya'ni `useMemo`, `useCallback` va `memo` ni qo'lda yozish zarurati keskin kamayadi.

```tsx
// Siz shunday yozasiz
function ProductList({ products, query }) {
  const filtered = products.filter((p) => p.title.includes(query))

  return <List items={filtered} onSelect={(id) => console.log(id)} />
}

// Kompilyator taxminan shunday chiqaradi (soddalashtirilgan)
function ProductList({ products, query }) {
  const $ = useMemoCache(4)

  let filtered
  if ($[0] !== products || $[1] !== query) {
    filtered = products.filter((p) => p.title.includes(query))
    $[0] = products; $[1] = query; $[2] = filtered
  } else {
    filtered = $[2]
  }

  // onSelect ham keshlanadi
  // ...
}
```

Natija: ortiqcha renderlar va qayta hisoblar kamayadi, kod esa toza qoladi.

## Kod: o'rnatish

```bash
npm i -D babel-plugin-react-compiler
```

::: ts
```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
})
```
:::

::: js
```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
  ],
})
```
:::

Next.js'da:

```ts
// next.config.ts
export default {
  experimental: {
    reactCompiler: true,
  },
}
```

ESLint qoidasi (kompilyator tushunmaydigan kodni ogohlantiradi):

```bash
npm i -D eslint-plugin-react-hooks@rc
```

```js
// eslint.config.js
rules: {
  'react-hooks/react-compiler': 'error',
}
```

## Kod: kompilyator nimani talab qiladi

Kompilyator faqat **React qoidalariga rioya qiladigan** kodni optimallashtiradi:

```tsx
// ✗ Props'ni mutatsiya qilish — kompilyator bu komponentni o'tkazib yuboradi
function Bad({ user }) {
  user.name = user.name.trim()
  return <p>{user.name}</p>
}

// ✗ Render paytida tashqi holatni o'zgartirish
let renders = 0
function AlsoBad() {
  renders++
  return <p>{renders}</p>
}

// ✓ Toza
function Good({ user }) {
  const name = user.name.trim()
  return <p>{name}</p>
}
```

Agar kompilyator kodni tushunmasa, u shu komponentni **shunchaki o'tkazib yuboradi** — ilova buzilmaydi, faqat optimizatsiya bo'lmaydi. Buni tekshirish uchun React DevTools'da komponent yonida "Memo ✨" belgisi turadi.

## Kod: qo'lda memoizatsiya kerakmi

Kompilyator yoqilgandan keyin:

| Holat | Kerakmi |
| --- | --- |
| `useMemo` oddiy hisob uchun | Yo'q — kompilyator qiladi |
| `useCallback` bola komponentga funksiya uzatish uchun | Yo'q |
| `memo()` komponent uchun | Odatda yo'q |
| `useMemo` **juda qimmat** hisob uchun (masalan 100k element) | Ha, ochiq yozish tushunarliroq |
| `useMemo` **barqaror havola** kerak bo'lganda (`useEffect` bog'liqligi) | Ha, semantik sabab |

Ikkinchi qator muhim: memoizatsiya ba'zan unumdorlik uchun emas, **to'g'rilik** uchun kerak bo'ladi:

```tsx
// Obyekt har renderda yangi bo'lsa, effekt har safar qayta ishga tushadi
const options = useMemo(() => ({ threshold: 0.5 }), [])

useEffect(() => {
  const observer = new IntersectionObserver(onIntersect, options)
  // ...
}, [options])
```

Kompilyator bu holatlarni ham qamrab oladi, lekin kod o'quvchisi uchun aniq yozilgani tushunarliroq.

## Kod: mavjud loyihaga joriy qilish

Bosqichma-bosqich rejim — faqat ba'zi papkalarga:

```js
plugins: [
  ['babel-plugin-react-compiler', {
    sources: (filename) => filename.includes('src/features/catalog'),
  }],
]
```

Tartib:

1. ESLint qoidasini yoqing va ogohlantirishlarni tuzating (bu React qoidalariga rioya qilishni anglatadi);
2. Kompilyatorni bitta papkada yoqing;
3. Testlarni ishlating, Profiler bilan solishtiring;
4. Butun loyihaga yoying;
5. Keraksiz `useMemo`/`useCallback` larni bosqichma-bosqich olib tashlang (shoshilmang — ular zarar qilmaydi).

## Muhandislik nuqtai nazari: nega kompilyator, signal emas

06-bobda ko'rdik: signal modeli aniq bog'liqlik grafini beradi, lekin qiymatlarni o'raydi (`.value`, `count()`). React jamoasi model soddaligini saqlab qolishni tanladi va unumdorlik masalasini **build vaqtiga** ko'chirdi.

Solishtirish:

| | Signal (Vue, Solid) | React Compiler |
| --- | --- | --- |
| Kod ko'rinishi | O'ram bor (`.value`) | Oddiy qiymatlar |
| Bog'liqlik | Runtime'da kuzatiladi | Build'da statik tahlil |
| Aniqlik | Juda aniq (tugun darajasida) | Komponent darajasida |
| Talab | — | React qoidalariga rioya |
| Buzilsa | — | Optimizatsiya o'tkazib yuboriladi |

Ikkala yondashuv ham bir maqsadga xizmat qiladi: **ortiqcha ishni kamaytirish**.

## Muhandislik nuqtai nazari: kompilyator hal qilmaydigan narsalar

- **Katta ro'yxatlar** — 10 000 element baribir 10 000 DOM tuguni (virtualizatsiya kerak, 41-bob);
- **Og'ir hisob** — memoizatsiya uni birinchi marta baribir bajaradi (Web Worker yoki server);
- **Tarmoq** — ma'lumot yuklash strategiyasi (32-bob);
- **Bundle hajmi** — kod baribir yuboriladi (41-bob);
- **Noto'g'ri arxitektura** — butun ilova bitta context'da bo'lsa, kompilyator buni tuzatmaydi (20, 37-bob).

Ya'ni kompilyator "unumdorlik haqida umuman o'ylamaslik" degani emas; u faqat eng zerikarli qismini — qo'lda memoizatsiyani — o'z zimmasiga oladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Kompilyator yoqilgach barcha `useMemo` ni darhol o'chirish | Ba'zilari semantik sabab bilan kerak | Bosqichma-bosqich, testlar bilan |
| React qoidalarini buzgan kodda kompilyatordan foyda kutish | U bunday komponentni o'tkazib yuboradi | ESLint ogohlantirishlarini tuzating |
| Kompilyatorni unumdorlik muammolarining yechimi deb bilish | Ro'yxat, bundle, tarmoq — boshqa mavzular | O'lchang va mos vositani tanlang |
| Eski `eslint-plugin-react-hooks` bilan ishlash | Kompilyator qoidasi yo'q | Yangi versiyaga o'ting |
| Kompilyatorni sinovsiz production'ga chiqarish | Kamdan-kam bo'lsa ham xatti-harakat farqi mumkin | Testlar + bosqichma-bosqich |

## Amaliyot

1. Kompilyatorni loyihangizda yoqing va React DevTools'da "Memo ✨" belgisini qidiring.
2. ESLint qoidasini yoqing: nechta komponent ogohlantirish beryapti? Bitta-ikkitasini tuzating.
3. Profiler bilan bitta og'ir ekranning render vaqtini kompilyatorsiz va kompilyator bilan o'lchang.
4. Props'ni mutatsiya qiladigan komponent yozing va kompilyator uni o'tkazib yuborishini tekshiring.

## Rasmiy hujjat

- React Compiler: <https://react.dev/learn/react-compiler>
- O'rnatish: <https://react.dev/learn/react-compiler/installation>
- React qoidalari: <https://react.dev/reference/rules>
