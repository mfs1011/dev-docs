# 08 — Layout va shablon

[← Oldingi: Marshrutlash asoslari](07-marshrutlash.md) · [Mundarija](README.md) · [Keyingi: Dinamik marshrutlar →](09-dinamik-marshrutlar.md)

## Tushuncha

**Layout** — bir nechta sahifa uchun umumiy o'ram. App Router'da u **ichma-ich** bo'ladi va navigatsiyada **qayta render qilinmaydi**:

```
app/
├── layout.tsx                  ← ildiz (barcha sahifalar)
└── dashboard/
    ├── layout.tsx              ← faqat /dashboard/* uchun
    ├── page.tsx                → /dashboard
    └── settings/page.tsx       → /dashboard/settings
```

Natijaviy daraxt:

```
RootLayout
 └── DashboardLayout
      └── SettingsPage
```

`/dashboard` dan `/dashboard/settings` ga o'tganda **layoutlar qayta render bo'lmaydi** — faqat sahifa almashadi. Shuning uchun sidebar'dagi scroll pozitsiyasi, ochiq akkardeon va klient holati saqlanadi.

## Kod: ildiz layout

::: ts
```tsx
// app/layout.tsx — MAJBURIY
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
```
:::

::: js
```jsx
// app/layout.jsx — MAJBURIY
import './globals.css'

export const metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
```
:::

Ildiz layout `<html>` va `<body>` ni **o'zi chiqaradi** — bu faqat shu yerda bo'ladi.

## Kod: ichma-ich layout

::: ts
```tsx
// app/dashboard/layout.tsx
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()        // layout ham server komponent

  if (!user) redirect('/login')

  return (
    <div className="dashboard">
      <DashboardSidebar user={user} />
      <div className="dashboard-content">{children}</div>
    </div>
  )
}
```
:::

::: js
```jsx
// app/dashboard/layout.jsx
export default async function DashboardLayout({ children }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')

  return (
    <div className="dashboard">
      <DashboardSidebar user={user} />
      <div className="dashboard-content">{children}</div>
    </div>
  )
}
```
:::

> **Xavfsizlik eslatmasi:** layout'dagi tekshiruv — qulaylik, himoya emas. Layout har navigatsiyada qayta ishlamaydi, shuning uchun auth tekshiruvini **har sahifada yoki middleware'da** ham qiling (30-bob).

## Kod: layout yoki template

| | `layout.tsx` | `template.tsx` |
| --- | --- | --- |
| Navigatsiyada | **Saqlanadi** (qayta render bo'lmaydi) | **Qayta yaratiladi** |
| Klient holati | Saqlanadi | Yo'qoladi |
| `useEffect` | Bir marta | Har navigatsiyada |
| Animatsiya | Qiyin | Oson (har sahifa uchun) |
| Qachon | Standart tanlov | Kirish animatsiyasi, har sahifada analitika |

::: ts
```tsx
// app/template.tsx — har navigatsiyada yangi nusxa
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
}
```
:::

::: js
```jsx
// app/template.jsx
'use client'

import { motion } from 'framer-motion'

export default function Template({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
      {children}
    </motion.div>
  )
}
```
:::

Amalda `template.tsx` kamdan-kam kerak. Standart tanlov — `layout.tsx`.

## Kod: guruhlar bilan turli layoutlar

```
app/
├── layout.tsx                  ← ildiz: html, body, providers
├── (marketing)/
│   ├── layout.tsx              ← keng konteyner, marketing header
│   ├── page.tsx                → /
│   └── pricing/page.tsx        → /pricing
├── (shop)/
│   ├── layout.tsx              ← savat, katalog navigatsiyasi
│   └── products/page.tsx       → /products
└── (auth)/
    ├── layout.tsx              ← markazlashtirilgan, header'siz
    ├── login/page.tsx          → /login
    └── register/page.tsx       → /register
```

Bu — guruhlarning asosiy foydasi: **bir xil URL darajasida turli layoutlar** (07-bob).

## Kod: layout'da ma'lumot

::: ts
```tsx
// app/products/layout.tsx
export default async function ProductsLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories()      // navigatsiyada QAYTA yuklanmaydi

  return (
    <div className="catalog">
      <CategoryNav categories={categories} />
      {children}
    </div>
  )
}
```
:::

::: js
```jsx
export default async function ProductsLayout({ children }) {
  const categories = await getCategories()

  return (
    <div className="catalog">
      <CategoryNav categories={categories} />
      {children}
    </div>
  )
}
```
:::

Layout'lar navigatsiyada qayta ishlamagani uchun **kamdan-kam o'zgaradigan ma'lumot** ular uchun ideal: kategoriyalar, menyu, foydalanuvchi profili.

Diqqat: layout **`searchParams` ni ololmaydi** — u faqat `params` bilan ishlaydi. Sabab: layout navigatsiyada qayta render bo'lmaydi, `searchParams` esa tez-tez o'zgaradi.

## Kod: layoutlar va metadata

::: ts
```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
  description: 'Onlayn do\'kon',
}

// app/products/page.tsx
export const metadata: Metadata = {
  title: 'Mahsulotlar',        // natija: "Mahsulotlar — Do'kon"
}
```
:::

::: js
```jsx
// app/layout.jsx
export const metadata = {
  title: { default: 'Do\'kon', template: '%s — Do\'kon' },
}

// app/products/page.jsx
export const metadata = { title: 'Mahsulotlar' }
```
:::

Metadata **meros bo'ladi va birlashadi** — batafsil 13-bobda.

## Muhandislik nuqtai nazari: layout ierarxiyasini loyihalash

```
RootLayout            html, body, providers, global CSS
 ├── (marketing)      keng konteyner, marketing nav
 ├── (shop)           savat holati, katalog nav
 │    └── products    kategoriya paneli
 └── (auth)           minimal, markazlashtirilgan
```

Qoidalar:

1. **Ildiz layout minimal bo'lsin** — faqat provider'lar va global tuzilma;
2. **Har layout o'z ma'lumotini oladi** — u qayta yuklanmaydi;
3. **Chuqurlik 3 darajadan oshmasin** — aks holda kuzatish qiyin;
4. **Klient holati layoutda saqlanadi** — sidebar, akkordeon uchun foydali.

## Muhandislik nuqtai nazari: layout va kesh

Navigatsiya paytida Next **Router Cache** ishlatadi: layout va sahifa RSC natijasi klientda vaqtincha saqlanadi (18-bob). Natija:

- Orqaga qaytish — darhol (keshdan);
- Layout qayta so'ralmaydi;
- Sahifa `staleTime` ichida bo'lsa ham keshdan.

Bu — App Router'dagi navigatsiya tezligining asosiy sababi va ayni paytda "nega eski ma'lumot ko'rinyapti?" savolining manbai (19-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Ildiz layoutda `<html>`/`<body>` yozmaslik | Next xato beradi | Ular majburiy |
| Layoutda `searchParams` kutish | U mavjud emas | Sahifada o'qing |
| Auth tekshiruvini faqat layoutda qilish | Layout har safar ishlamaydi | Middleware + sahifa (30-bob) |
| Har sahifa uchun alohida layout | Ierarxiya chuqurlashadi | Guruhlar bilan birlashtiring |
| `template.tsx` ni standart qilib ishlatish | Holat har navigatsiyada yo'qoladi | `layout.tsx` |
| Layoutga tez o'zgaradigan ma'lumot solish | U yangilanmaydi | Sahifaga ko'chiring |
| Ildiz layoutga og'ir klient provider'lar | Butun ilova bundle'i o'sadi | Kerakli shoxga ko'chiring (04-bob) |

## Amaliyot

1. Ikki guruh yarating (`(marketing)`, `(shop)`) va ularga turli layout bering.
2. `dashboard/layout.tsx` da foydalanuvchini yuklang va ikkita ichki sahifa orasida yurib, so'rov qayta ketmasligini Network panelida tasdiqlang.
3. Layoutga `console.log` qo'ying va navigatsiyada u chaqirilmasligini ko'ring.
4. `template.tsx` qo'shib, farqni kuzating (log har navigatsiyada chiqadi).
5. Layoutda `searchParams` ni olishga urinib ko'ring va nima bo'lishini tekshiring.

## Rasmiy hujjat

- Layout va sahifalar: <https://nextjs.org/docs/app/getting-started/layouts-and-pages>
- `layout.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/layout>
- `template.js`: <https://nextjs.org/docs/app/api-reference/file-conventions/template>
