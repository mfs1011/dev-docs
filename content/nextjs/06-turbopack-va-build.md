# 06 — Turbopack va build

[← Oldingi: TypeScript va konfiguratsiya](05-typescript-konfiguratsiya.md) · [Mundarija](README.md) · [Keyingi: Marshrutlash asoslari →](07-marshrutlash.md)

## Tushuncha

Next 16 da **Turbopack** — standart bundler (dev va build uchun). U Rust'da yozilgan va webpack o'rnini bosadi.

```bash
next dev              # Turbopack (standart)
next dev --webpack    # eski bundler (plugin kerak bo'lsa)
next build            # Turbopack
```

Amaliy farq: katta loyihada dev server 10–30 soniya o'rniga 1–3 soniyada ko'tariladi, HMR sezilarli tez.

## Kod: build chiqishini o'qish

```
Route (app)                              Size  First Load JS  Revalidate
┌ ○ /                                   1.2 kB       102 kB          -
├ ○ /about                              142 B         89 kB          -
├ ● /blog/[slug]                        2.1 kB       104 kB         1h
├ ƒ /dashboard                          12.4 kB      156 kB          -
└ ƒ /api/products                       0 B            0 B          -

+ First Load JS shared by all            88 kB
  ├ chunks/framework-a1b2.js             45 kB
  ├ chunks/main-c3d4.js                  31 kB
  └ other shared chunks                  12 kB

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Nimaga qarash kerak:

| Ustun | Ma'nosi | Maqsad |
| --- | --- | --- |
| **Size** | Shu marshrutga xos JS | Kichik bo'lsin |
| **First Load JS** | Umumiy + marshrut JS (foydalanuvchi yuklaydigan) | < 150 kB |
| **Shared by all** | Har sahifada yuklanadigan asos | < 100 kB |
| **Belgi** (○ ● ƒ) | Render strategiyasi (03-bob) | Kutilganidek bo'lsinmi? |

**Eng muhim tekshiruv:** `ƒ` (dinamik) bo'lishi kerak bo'lmagan sahifa dinamik bo'lib qolgan bo'lsa — sabab odatda `cookies()`, `headers()` yoki `searchParams` ning kutilmagan ishlatilishi (18-bob).

## Kod: bundle tahlili

```bash
npm i -D @next/bundle-analyzer
```

::: ts
```ts
// next.config.ts
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })

export default withBundleAnalyzer({
  // ... qolgan sozlamalar
})
```
:::

::: js
```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({})
```
:::

```bash
ANALYZE=true npm run build
```

Ochiladigan hisobotda uchta daraxt bo'ladi: klient, server va Edge. **Klient** daraxtiga e'tibor bering — u foydalanuvchi yuklaydigan kod (04-bob).

Tipik "og'ir mehmonlar": `moment`, butun `lodash`, ikonka to'plamlari, `chart.js`, sana-vaqt kutubxonalari, `@mui/material` ning to'liq importi.

## Kod: dinamik import

::: ts
```tsx
import dynamic from 'next/dynamic'

// Klient komponenti, kerak bo'lganda yuklanadi
const Chart = dynamic(() => import('@/components/Chart'), {
  loading: () => <ChartSkeleton />,
})

// Faqat brauzerda (SSR o'chirilgan) — window ishlatadigan kutubxonalar uchun
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})
```
:::

::: js
```jsx
import dynamic from 'next/dynamic'

const Chart = dynamic(() => import('@/components/Chart'), { loading: () => <ChartSkeleton /> })
const Map = dynamic(() => import('@/components/Map'), { ssr: false, loading: () => <MapSkeleton /> })
```
:::

**Muhim:** `ssr: false` faqat **klient komponentida** ishlaydi (Next 15+). Server komponentda uni ishlatib bo'lmaydi — o'rniga ota klient komponent yarating.

## Kod: paketlarni optimallashtirish

```ts
// next.config.ts
export default {
  experimental: {
    // Katta kutubxonalardan faqat ishlatilgan qismini olish
    optimizePackageImports: ['lucide-react', 'date-fns', '@mui/icons-material'],
  },
}
```

Bu `import { Icon } from 'lucide-react'` ni avtomatik `import Icon from 'lucide-react/dist/esm/icons/icon'` ga aylantiradi — bundle sezilarli kichrayadi.

## Kod: shrift va rasm optimizatsiyasi

::: ts
```tsx
// app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-sans',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```
:::

::: js
```jsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap', variable: '--font-sans' })

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```
:::

`next/font` shriftni **build vaqtida yuklab oladi** va o'z domeningizdan beradi: tashqi so'rov yo'q, `font-display: swap` avtomatik, layout siljishi (CLS) kamayadi.

## Kod: build vaqtini qisqartirish

| Usul | Ta'siri |
| --- | --- |
| `generateStaticParams` da kamroq sahifa | Build tez, qolgani ISR bilan (03-bob) |
| Turbopack (standart) | Sezilarli tez |
| CI'da `.next/cache` ni keshlash | Takroriy build'lar tez |
| Og'ir hisoblarni build'dan chiqarish | Rasm optimizatsiyasini CDN'ga berish |

```yaml
# GitHub Actions — Next kesh
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ${{ github.workspace }}/.next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
```

## Kod: standalone build

```ts
// next.config.ts
export default { output: 'standalone' }
```

```bash
npm run build
# .output emas — .next/standalone/ hosil bo'ladi
node .next/standalone/server.js
```

`standalone` faqat kerakli `node_modules` fayllarini nusxalaydi — Docker image hajmi bir necha barobar kichrayadi (48-bob).

## Muhandislik nuqtai nazari: nimani o'lchash

```bash
npm run build
```

Har PR'dan keyin uchta raqamni kuzating:

1. **Shared by all** — har sahifada yuklanadigan asos (o'sib ketmasin);
2. **Eng katta marshrut** — `First Load JS`;
3. **Dinamik marshrutlar soni** — kutilmagan `ƒ` belgilar.

CI'da avtomatlashtirish mumkin (42-bob):

```yaml
- run: npm run build | tee build.log
- run: |
    SHARED=$(grep "First Load JS shared by all" build.log | grep -oE '[0-9.]+ kB' | head -1)
    echo "Shared: $SHARED"
```

## Muhandislik nuqtai nazari: dev va production farqi

| | `next dev` | `next build && next start` |
| --- | --- | --- |
| Kompilyatsiya | So'ralganda (lazy) | Oldindan |
| Kesh | Ko'p hollarda o'chirilgan | To'liq ishlaydi |
| React | Dev build (ogohlantirishlar bilan) | Production build |
| Xato ekranlari | Batafsil overlay | `error.tsx` |
| Server Components | Har so'rovda qayta ishlaydi | Keshlanadi |

Shuning uchun **kesh xatti-harakatini `next dev` da tekshirib bo'lmaydi** (18-bob). Deploy oldidan har doim:

```bash
npm run build && npm start
```

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Build chiqishini o'qimaslik | Kutilmagan dinamik sahifalar sezilmaydi | Har build'da ko'ring |
| `ssr: false` ni server komponentda ishlatish | Qo'llab-quvvatlanmaydi | Klient o'rami |
| Bundle'ni hech tahlil qilmaslik | 500 KB kutubxona sezilmaydi | `@next/bundle-analyzer` |
| `next/font` o'rniga `<link>` bilan Google Fonts | Tashqi so'rov, CLS | `next/font` |
| Kesh xatti-harakatini `dev` da sinash | Dev'da kesh boshqacha | `build && start` |
| CI'da `.next/cache` ni keshlamaslik | Har build noldan | `actions/cache` |
| `optimizePackageImports` ni bilmaslik | Ikonka kutubxonalari bundle'ni shishiradi | Sozlang |

## Amaliyot

1. `npm run build` qiling va chiqishdagi uchta raqamni yozib oling (shared, eng katta marshrut, dinamiklar soni).
2. `ANALYZE=true npm run build` bilan tahlil oching va eng katta uch modulni aniqlang.
3. Og'ir komponentni `dynamic()` bilan ajrating va build chiqishida farqni ko'ring.
4. `next/font` bilan shrift ulang va Network panelida tashqi so'rov yo'qligini tasdiqlang.
5. `output: 'standalone'` bilan build qiling va `.next/standalone` hajmini `node_modules` bilan solishtiring.

## Rasmiy hujjat

- Turbopack: <https://nextjs.org/docs/app/api-reference/turbopack>
- Bundle analyzer: <https://nextjs.org/docs/app/guides/package-bundling>
- `next/font`: <https://nextjs.org/docs/app/api-reference/components/font>
- `next/dynamic`: <https://nextjs.org/docs/app/api-reference/functions/dynamic>
