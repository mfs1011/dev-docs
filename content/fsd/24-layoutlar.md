# 24 — Layout'lar

[← Oldingi: Tiplar va validatsiya](23-tiplar.md) · [Mundarija](README.md) · [Keyingi: Assetlar, stillar va i18n →](25-assetlar-va-i18n.md)

## Qisqacha

Layout — bir nechta sahifa umumiy tuzilmaga ega bo'lib, faqat asosiy mazmuni farq qilganda paydo bo'ladigan abstraksiya (header, sidebar, footer + o'rtada sahifa). **Oddiy layout** (faqat markup va UI mantiqi: tema almashtirish) — `shared/ui/layout`. **Ichida biznes widget'lari bor layout** — `shared`'da bo'lolmaydi (import qoidasi): uni `app`'da saqlang yoki widget'larni slot/render props bilan bering. Va eng avval so'rang: layout umuman kerakmi?

## Qoida

| Holat | Yechim |
| --- | --- |
| Layout faqat markup + UI mantiqi | `shared/ui/layout` |
| Layout bir necha qator | Har sahifada takrorlash — abstraksiyadan arzonroq |
| Ichma-ich marshrutlashli router | Layout'ni `app`'da, marshrutlar konfiguratsiyasida inline — kerakli marshrut guruhiga qo'llash |
| Layout ichida widget kerak | (1) slot / render props — layout `shared`'da qoladi; (2) layout'ni `app/layouts`'ga ko'chirib, widget'larni o'zi yig'ishi |
| Layout'lar widget yoki sahifa sifatida | Ham mumkin — `app`'da router konfiguratsiyasida yig'iladi |

Nusxa ko'chirish ham haqiqiy variant: layout'lar kamdan-kam o'zgaradi va bitta sahifa o'zgarishi kerak bo'lganda boshqalariga ta'sir qilmaydi.

## Shablon

```text
shared/ui/layout/
├── Layout.tsx              header/sidebar/footer uchun joylar (slot/props), <Outlet/>
├── use-theme-switcher.ts   UI mantiqi — mumkin
└── index.ts

app/
├── layouts/
│   └── MainLayout.tsx      widgets/header + widgets/sidebar + shared/ui/layout
└── routes/router.tsx       MainLayout → children: pages
```

## Kod: `app`'dagi layout widget'lar bilan

::: react
```tsx
// app/layouts/MainLayout.tsx — app hamma qatlamni import qila oladi
import { Outlet } from 'react-router'
import { Header } from '@/widgets/header'
import { CategorySidebar } from '@/widgets/category-sidebar'
import { PageShell } from '@/shared/ui/layout'

export function MainLayout() {
  return (
    <PageShell header={<Header />} sidebar={<CategorySidebar />}>
      <Outlet />
    </PageShell>
  )
}

// app/routes/router.tsx
createBrowserRouter([
  { Component: MainLayout, children: [/* catalog, product, … */] },
  { path: '/sign-in', lazy: async () => ({ Component: (await import('@/pages/sign-in')).SignInPage }) },  // layout'siz
])
```
:::

::: vue
```vue
<!-- app/layouts/MainLayout.vue — app hamma qatlamni import qila oladi -->
<script setup lang="ts">
import { AppHeader } from '@/widgets/header'
import { CategorySidebar } from '@/widgets/category-sidebar'
import { PageShell } from '@/shared/ui/layout'
</script>

<template>
  <PageShell>
    <template #header><AppHeader /></template>
    <template #sidebar><CategorySidebar /></template>
    <RouterView />
  </PageShell>
</template>

<!-- app/routes/router.ts: { path: '/', component: MainLayout, children: [ … ] } -->
```
:::

::: angular
```ts
// app/layouts/main-layout.ts — app hamma qatlamni import qila oladi
import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Header } from '@/widgets/header'
import { CategorySidebar } from '@/widgets/category-sidebar'
import { PageShell } from '@/shared/ui/layout'

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, CategorySidebar, PageShell],
  template: `
    <app-page-shell>
      <app-header header />
      <app-category-sidebar sidebar />
      <router-outlet />
    </app-page-shell>
  `,
})
export class MainLayout {}

// app/routes/app.routes.ts: { path: '', component: MainLayout, children: [ … ] }
```
:::

`PageShell` (`shared/ui/layout`) faqat joylarni beradi: React'da props, Vue'da nomli slot'lar, Angular'da `ng-content select="[header]"`. U widget'larni bilmaydi.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Layout'ni widget qilsam bo'ladimi? | Faqat ichida pages bo'lmasa; sahifalar — router orqali (`Outlet`/`RouterView`/`router-outlet`) |
| Har sahifa o'z header'ini xohlasa? | Header — widget, sahifalar uni o'zi qo'yadi; layout kerak emas |
| Next.js `app/layout.tsx` | Framework fayli — ichida `_app`/`widgets`'dan import (28-bob) |
| Nuxt `layouts/` | `dir.layouts: './src/app/layouts'` (30-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `shared/ui/layout` ichida `import { Header } from '@/widgets/header'` | `shared` → `widgets` — import qoidasi | Slot/props yoki layout'ni `app`'ga |
| 3 qatorlik layout uchun abstraksiya | Keraksiz bog'lanish | Takrorlash |
| Layout'da sahifaga xos ma'lumot yuklash | Layout har sahifani biladi | Sahifa o'zi yuklaydi |
| Layout `widgets`'da, ichida `pages` import | Import qoidasi | Router orqali |

## Manbalar

- Rasmiy: *Page Layouts* <https://feature-sliced.design/docs/guides/examples/page-layout>
- Rasmiy: *FAQ — Where to store the layout/template of pages?* <https://feature-sliced.design/docs/get-started/faq>
