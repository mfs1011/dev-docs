# 34 — Papka tuzilmasi va modullar

[← Oldingi: Xatolar bilan ishlash](33-xatolar.md) · [Mundarija](README.md) · [Keyingi: React Router →](35-react-router.md)

## Tushuncha

React papka tuzilmasi bo'yicha hech narsa talab qilmaydi — bu erkinlik katta loyihada muammoga aylanadi. Ikki keng tarqalgan yondashuv bor:

**1. Turiga qarab** (kichik loyiha):

```
src/
├── components/
├── hooks/
├── pages/
├── lib/
└── types/
```

**2. Xususiyatga qarab** (o'sgan loyiha):

```
src/
├── app/                    ← ilova darajasi: provider'lar, router, global CSS
├── shared/                 ← hamma joyda ishlatiladigan
│   ├── ui/                 Button, Input, Modal
│   ├── api/                HTTP klient (31-bob)
│   ├── lib/                formatlash, yordamchilar
│   └── hooks/              texnik hooklar (26-bob)
├── entities/               ← domen obyektlari (ixtiyoriy qatlam)
│   └── user/               UserCard, user tiplari, user API
└── features/               ← foydalanuvchi ssenariylari
    ├── auth/
    ├── cart/
    └── catalog/
        ├── api.ts
        ├── use-catalog.ts
        ├── CatalogPage.tsx
        └── components/
```

Chegara: **bitta papkani o'chirsangiz, faqat bitta funksionallik yo'qolishi kerak.**

## Kod: import yo'nalishi

Eng muhim qoida — bog'liqliklar **bir tomonlama**:

```
app  →  features  →  entities  →  shared
```

```ts
// ✓ Yuqoridan pastga
import { Button } from '@/shared/ui/Button'          // features → shared
import { UserCard } from '@/entities/user'            // features → entities

// ✗ Pastdan yuqoriga — taqiqlangan
import { CartPage } from '@/features/cart'            // shared → features ✗

// ✗ Yonma-yon — taqiqlangan (aylanma bog'liqlik xavfi)
import { useAuth } from '@/features/auth/use-auth'    // features/cart → features/auth ✗
```

Oxirgi qoida qattiq ko'rinadi, lekin u aylanma bog'liqliklarni oldini oladi. Agar `cart` ga `auth` kerak bo'lsa, ikkita yo'l bor:

1. Umumiy qismni `shared` yoki `entities` ga chiqarish;
2. Bog'lanishni yuqori qatlamda (`app` yoki sahifada) qilish.

ESLint bilan majburlash:

```js
// eslint.config.js
import boundaries from 'eslint-plugin-boundaries'

// yoki oddiyroq:
rules: {
  'no-restricted-imports': ['error', {
    patterns: [
      { group: ['@/features/*'], message: 'shared/entities dan features import qilinmaydi' },
    ],
  }],
}
```

## Kod: barrel fayllar

```ts
// features/cart/index.ts
export { CartPage } from './CartPage'
export { useCart } from './use-cart'
export type { CartLine } from './types'
```

```ts
import { CartPage, useCart } from '@/features/cart'
```

Foydasi: modulning **ommaviy API'si** aniq bo'ladi — ichki fayllar tashqaridan import qilinmaydi.

Zarari: katta barrel fayllar tree-shaking'ni yomonlashtiradi va aylanma importlar keltirib chiqaradi. Qoida:

| Holat | Barrel |
| --- | --- |
| Modul ommaviy API'si (5–10 eksport) | ✅ Foydali |
| `shared/ui` (barqaror komponentlar) | ✅ Foydali |
| Butun `src` uchun bitta `index.ts` | ❌ Muammo |
| Har papkada avtomatik barrel | ❌ Ortiqcha |

## Kod: modul ichki tuzilmasi

```
features/catalog/
├── index.ts                ← ommaviy API
├── api.ts                  ← so'rovlar (31-bob)
├── queries.ts              ← useQuery hooklari (32-bob)
├── types.ts
├── CatalogPage.tsx         ← sahifa
├── components/
│   ├── ProductGrid.tsx
│   ├── ProductCard.tsx
│   └── CatalogFilters.tsx
└── use-catalog-filters.ts  ← URL holati (35-bob)
```

Bir modul — bir domen. Fayl nomlari ichkarida takrorlanishi mumkin (`api.ts` har modulda bor) — bu normal.

## Kod: sahifa va komponent chegarasi

::: ts
```tsx
// features/catalog/CatalogPage.tsx — ma'lumot va orkestratsiya
export function CatalogPage() {
  const filters = useCatalogFilters()                 // URL holati
  const { data, isPending, error } = useProducts(filters)   // server holati

  if (isPending) return <CatalogSkeleton />
  if (error) return <ErrorState error={error} />

  return (
    <CatalogLayout
      filters={<CatalogFilters value={filters} />}
      content={<ProductGrid products={data.items} />}
    />
  )
}

// components/ProductGrid.tsx — faqat ko'rinish, props oladi
export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </ul>
  )
}
```
:::

::: js
```jsx
// features/catalog/CatalogPage.jsx
export function CatalogPage() {
  const filters = useCatalogFilters()
  const { data, isPending, error } = useProducts(filters)

  if (isPending) return <CatalogSkeleton />
  if (error) return <ErrorState error={error} />

  return (
    <CatalogLayout
      filters={<CatalogFilters value={filters} />}
      content={<ProductGrid products={data.items} />}
    />
  )
}

export function ProductGrid({ products }) {
  return (
    <ul className="grid">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </ul>
  )
}
```
:::

Naqsh (10-bob): **sahifa — ma'lumot oladi va tarqatadi, komponent — faqat props bilan ishlaydi.** Shunda komponentlarni Storybook'da ko'rsatish va test qilish oson.

## Kod: `app/` qatlami

```tsx
// app/providers.tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={(e, reset) => <FullPageError error={e} onRetry={reset} />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

// app/router.tsx — marshrutlar (35-bob)
// app/App.tsx
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  )
}
```

Ilova darajasidagi hamma narsa bitta papkada: provider'lar, router, global uslublar, i18n sozlamasi.

## Muhandislik nuqtai nazari: qachon tuzilmani o'zgartirish kerak

| Signal | Harakat |
| --- | --- |
| `components/` da 40+ fayl | Domen bo'yicha guruhlash |
| Bitta o'zgarish 5+ papkaga tegadi | Modul chegarasi noto'g'ri |
| Import yo'llari `../../../` | Alias yoki tuzilmani qayta ko'rish |
| Yangi odam "bu qayerda?" deb so'rayveradi | Nomlash yoki tuzilma noaniq |
| Aylanma import xatolari | Qatlam qoidasi buzilgan |

Erta optimizatsiya ham xato: 10 komponentli loyihaga `entities/features/shared` uch qatlamini joriy qilish — ortiqcha.

Amaliy yo'l: **turiga qarab boshlang, 20–30 komponentdan keyin xususiyatga ko'chiring.**

## Muhandislik nuqtai nazari: nomlash

| Narsa | Konvensiya | Misol |
| --- | --- | --- |
| Komponent fayli | PascalCase | `ProductCard.tsx` |
| Hook fayli | kebab-case | `use-cart.ts` |
| Utilita fayli | kebab-case | `format-price.ts` |
| Papka | kebab-case | `features/order-history/` |
| Komponent | PascalCase | `ProductCard` |
| Hook | `useX` | `useCart` |
| Callback prop | `onX` | `onSelect` |
| Handler | `handleX` | `handleSelect` |
| Boolean | `is/has/can` | `isLoading`, `hasAccess` |

Muhimi — jamoada bir xil bo'lishi. ESLint (`unicorn/filename-case`) buni avtomatlashtiradi.

## Muhandislik nuqtai nazari: monorepo kerakmi

| Vaziyat | Yechim |
| --- | --- |
| Bitta ilova | Oddiy repo |
| Ilova + dizayn tizimi (alohida versiyalanadi) | Monorepo (pnpm workspaces, Turborepo) |
| Web + mobil (React Native) kod bo'lishish | Monorepo |
| 2–3 mustaqil jamoa | Monorepo yoki alohida repolar |

Monorepo narxi: build orkestratsiyasi, CI murakkabligi, IDE sekinlashuvi. 1–2 ilovali loyihada oddiy repo yetarli.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `shared` dan `features` ni import qilish | Aylanma bog'liqlik | Qatlam qoidasi |
| Butun loyiha uchun bitta barrel | Tree-shaking, aylanma import | Modul darajasida |
| 10 komponentli loyihaga 3 qatlamli arxitektura | Ortiqcha murakkablik | Oddiy boshlang |
| Sahifa komponentida 300 qator | Ma'lumot + ko'rinish aralash | Ajrating |
| Modul ichki fayllarini tashqaridan import qilish | Refaktoring sinadi | `index.ts` orqali |
| Har papkada turli nomlash uslubi | O'qish qiyin | Bitta konvensiya + lint |
| Tuzilmani hech qachon qayta ko'rmaslik | Loyiha o'sadi, tuzilma qolib ketadi | Signal chiqsa qayta tuzing |

## Amaliyot

1. Loyihangizni ko'rib chiqing: qaysi yondashuv (tur yoki xususiyat) ishlatilgan? Signal jadvalidan nechtasi mos keladi?
2. Bitta xususiyatni (masalan savat) alohida papkaga yig'ing: API, hooklar, komponentlar, tiplar.
3. `index.ts` bilan ommaviy API belgilang va tashqaridan faqat u orqali import qiling.
4. ESLint qoidasi bilan `shared → features` importini taqiqlang va sinab ko'ring.
5. Bitta sahifa komponentini ikkiga ajrating: ma'lumot (hook) va ko'rinish (props oladigan komponent).

## Rasmiy hujjat

- React'da o'ylash: <https://react.dev/learn/thinking-in-react>
- Fayl tuzilmasi (rasmiy pozitsiya): <https://react.dev/learn/thinking-in-react#step-1-break-the-ui-into-a-component-hierarchy>
- Feature-Sliced Design (ekotizm konvensiyasi): <https://feature-sliced.design>; shu saytda — [FSD qo'llanmasi](../fsd/README.md)
