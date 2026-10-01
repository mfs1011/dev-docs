# 07 — shared

[← Oldingi: Import qoidasi va public API](06-import-va-public-api.md) · [Mundarija](README.md) · [Keyingi: entities →](08-entities.md)

## Qisqacha

`shared` — ilovaning **poydevori**: tashqi dunyo bilan aloqa (backend, uchinchi tomon kutubxonalari, muhit) va loyihaning o'z kichik kutubxonalari. U eng past qatlam: hamma uni import qiladi, u esa hech kimni (o'zidan tashqari). Slice'lari yo'q — to'g'ridan-to'g'ri segmentlar, va ular bir-birini erkin import qiladi.

## Qoida

| Segment | Nima | Muhim shart |
| --- | --- | --- |
| `api` | API klienti va (ixtiyoriy) aniq endpoint'larga so'rov funksiyalari | Umumiy tiplar, kesh kalitlari ham shu yerda (20, 21-boblar) |
| `ui` | Ilovaning UI kit'i | **Biznes mantiqi yo'q**, lekin biznes mavzusidagi ko'rinish mumkin: kompaniya logosi, sahifa layout'i. UI mantiqli komponentlar ham mumkin (autocomplete, qidiruv maydoni) |
| `lib` | Ichki kutubxonalar to'plami | **helpers/utils emas.** Har kutubxona bitta yo'nalishga ega (sanalar, ranglar, matn) va README'da nima qo'shish mumkinligi yozilgan |
| `config` | Muhit o'zgaruvchilari, global feature flag'lar, global sozlamalar | |
| `routes` | Marshrut konstantalari yoki shablonlari | Router konfiguratsiyasi emas — u `app`'da |
| `i18n` | Tarjima sozlamalari, global tarjima satrlari | |

O'z segmentingizni qo'shishingiz mumkin (`auth`, `analytics`, `db`), lekin nomi **maqsadni** bildirsin: `components`, `hooks`, `types` — yomon.

## Shablon

```text
shared/
├── api/
│   ├── client.ts              fetch/axios o'rami: baseURL, sarlavhalar, xato modeli
│   ├── endpoints/             (ixtiyoriy) order.ts, product.ts — CRUD so'rovlari
│   ├── openapi/               (ixtiyoriy) generatsiya qilingan klient
│   └── index.ts
├── ui/
│   ├── button/
│   │   ├── Button.tsx
│   │   └── index.ts           har komponentga alohida index (14-bob: tree-shaking)
│   ├── input/
│   ├── modal/
│   └── layout/                biznessiz sahifa karkasi
├── lib/
│   ├── date/                  README.md: "faqat sana formatlash va hisoblash"
│   │   ├── format-date.ts
│   │   ├── README.md
│   │   └── index.ts
│   └── money/                 README.md: "Money tipi, formatlash; valyuta kursi YO'Q"
├── config/
│   ├── env.ts                 import.meta.env ni tekshirib, tiplangan obyekt
│   └── index.ts
├── routes/
│   └── index.ts               ROUTES.product(id) → "/products/42"
└── i18n/
```

## Kod: `shared/config` va `shared/routes`

::: react
```ts
// shared/config/env.ts — muhitni bir joyda tekshirish
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error('VITE_API_URL berilmagan')

export const env = { apiUrl, isProd: import.meta.env.PROD } as const

// shared/routes/index.ts — URL'lar bir joyda
export const ROUTES = {
  home: '/',
  catalog: '/catalog',
  product: (id: string) => `/products/${id}`,
} as const
```
:::

::: vue
```ts
// shared/config/env.ts — muhitni bir joyda tekshirish
const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) throw new Error('VITE_API_URL berilmagan')

export const env = { apiUrl, isProd: import.meta.env.PROD } as const

// shared/routes/index.ts — marshrut nomlari va URL'lar bir joyda
export const ROUTES = {
  home: { name: 'home', path: '/' },
  catalog: { name: 'catalog', path: '/catalog' },
  product: { name: 'product', path: '/products/:id' },
} as const
```
:::

::: angular
```ts
// shared/config/env.ts — Angular'da muhit: environment fayllari yoki InjectionToken
import { InjectionToken } from '@angular/core'

export interface AppEnv { apiUrl: string; isProd: boolean }
export const APP_ENV = new InjectionToken<AppEnv>('APP_ENV')   // qiymati app'da beriladi (12-bob)

// shared/routes/index.ts — URL'lar bir joyda
export const ROUTES = {
  home: '',
  catalog: 'catalog',
  product: (id: string) => ['/products', id],
} as const
```
:::

## Qachon / qachon emas

| Kod | `shared`'gami? |
| --- | --- |
| Tugma, input, modal, tooltip | ✅ `shared/ui` |
| Kompaniya logosi, oddiy sahifa karkasi | ✅ `shared/ui` (biznes mavzusi bor, mantiq yo'q) |
| `formatDate`, `debounce`, `Money` | ✅ `shared/lib/<yo'nalish>` |
| HTTP klient, token qo'shish, xato modeli | ✅ `shared/api` |
| Autentifikatsiya ma'lumoti (token, joriy foydalanuvchi DTO) | ✅ `shared/auth` yoki `shared/api` (18, 22-boblar) |
| "Savatga qo'shish" tugmasi | ❌ `features` — biznes harakati |
| Mahsulot kartasi | ❌ `entities` yoki sahifa — biznes obyekti |
| Narx chegirmasi qoidasi | ❌ biznes mantiqi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `shared/lib/utils.ts` (900 qator) | "Axlat qutisi": hamma narsa, hech kim egasi emas | Yo'nalishli kutubxonalar + README |
| `shared/ui/index.ts` hamma komponentlar bilan | Og'ir bog'liqlik (syntax highlighter) har sahifaga tushadi | Har komponentga alohida index |
| `shared` → `entities` import | Eng past qatlam yuqoriga bog'landi | Tipni `shared/api`'da saqlash |
| `shared/ui`'da `useCart()` chaqiruvi | UI kit biznesga bog'landi | Ma'lumotni props orqali berish |
| Muhit o'zgaruvchilari 20 faylda o'qiladi | Tekshiruvsiz, tarqoq | `shared/config` |

## Manbalar

- Rasmiy: *Layers — Shared* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Public API — Large bundles and broken tree-shaking in Shared* <https://feature-sliced.design/docs/reference/public-api>
