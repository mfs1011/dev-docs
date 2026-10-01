# 10 — widgets

[← Oldingi: features](09-features.md) · [Mundarija](README.md) · [Keyingi: pages →](11-pages.md)

## Qisqacha

`widgets` — katta, **o'zi yetarli** UI bloklari: sarlavha (header), filtrlar paneli, savat xulosasi, izohlar bo'limi. Widget feature'lar, entity'lar va shared'ni birlashtirib, odatda butun bir foydalanish holatini yetkazadi. Widget eng foydali bo'ladi, agar u **bir necha sahifada** qayta ishlatilsa yoki sahifa bir nechta katta mustaqil bloklardan iborat bo'lsa.

## Qoida

- Agar UI bloki sahifaning **asosiy mazmunini** tashkil qilsa va hech qayerda qayta ishlatilmasa — u widget **emas**, sahifa ichida qoladi.
- Ichma-ich marshrutlash (React Router data router, Remix) ishlatilsa, widget'larni oddiy marshrutlashdagi sahifalar kabi ishlatish mumkin: o'z ma'lumot yuklashi, yuklanish holati va xato chegarasi bilan to'liq router bloklari.
- Sahifa layout'lari ham shu qatlamda saqlanishi mumkin (24-bob).
- Widget'lar bir-birini import qilmaydi (`widgets/header` → `widgets/sidebar` ❌).

## Shablon

```text
widgets/
├── header/
│   ├── ui/
│   │   ├── Header.tsx              logo + qidiruv + savat hisoblagichi + foydalanuvchi menyusi
│   │   └── header.css
│   ├── model/use-header-state.ts   mobil menyu ochiqmi (kerak bo'lsa)
│   └── index.ts
├── product-filters/
│   ├── ui/ProductFilters.tsx       narx, brend, reyting; URL query bilan sinxron
│   ├── lib/filters-to-query.ts
│   └── index.ts
└── cart-summary/                   savat va checkout sahifalarida
```

## Kod: widget — bir nechta qatlamni yig'adi

::: react
```tsx
// widgets/header/ui/Header.tsx
import { Link } from 'react-router'
import { SearchBox } from '@/features/search'
import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
import { Logo } from '@/shared/ui/logo'
import { ROUTES } from '@/shared/routes'

export function Header() {
  return (
    <header className="header">
      <Link to={ROUTES.home}><Logo /></Link>
      <SearchBox />
      <CartCounter />
      <CurrentUserMenu />
    </header>
  )
}
```
:::

::: vue
```vue
<!-- widgets/header/ui/AppHeader.vue -->
<script setup lang="ts">
import { SearchBox } from '@/features/search'
import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
import { AppLogo } from '@/shared/ui/logo'
import { ROUTES } from '@/shared/routes'
</script>

<template>
  <header class="header">
    <RouterLink :to="{ name: ROUTES.home.name }"><AppLogo /></RouterLink>
    <SearchBox />
    <CartCounter />
    <CurrentUserMenu />
  </header>
</template>
```
:::

::: angular
```ts
// widgets/header/ui/header.ts
import { Component } from '@angular/core'
import { RouterLink } from '@angular/router'
import { SearchBox } from '@/features/search'
import { CurrentUserMenu } from '@/features/auth'
import { CartCounter } from '@/entities/cart'
import { Logo } from '@/shared/ui/logo'

@Component({
  selector: 'app-header',
  imports: [RouterLink, SearchBox, CurrentUserMenu, CartCounter, Logo],
  template: `
    <header class="header">
      <a routerLink="/"><app-logo /></a>
      <app-search-box />
      <app-cart-counter />
      <app-current-user-menu />
    </header>
  `,
})
export class Header {}
```
:::

## Qachon / qachon emas

| Holat | Widget? |
| --- | --- |
| Header hamma sahifada | ✅ |
| Filtrlar paneli katalog va qidiruv sahifalarida | ✅ |
| Mahsulot sahifasidagi galereya — faqat shu sahifada | ❌ `pages/product/ui` |
| Dashboard: 4 ta mustaqil katta blok, har biri o'z ma'lumotini yuklaydi | ✅ har biri widget bo'lishi mumkin (qayta ishlatilmasa ham) |
| Kichik blok: bitta tugma + matn | ❌ feature yoki sahifa |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har sahifa bo'limi — widget | Sahifa bo'sh, mantiq tarqoq | Qayta ishlatilmasa — sahifada |
| `widgets/header` ichida `widgets/search-panel` import | Bir qatlam — cross-import | Ikkalasini sahifa/`app`'da yig'ish yoki slot |
| Widget'da global holat (token, tema) | Ilova darajasidagi holat noto'g'ri joyda | `shared` yoki `app` |
| Widget ma'lumotni props'siz "o'zi topadi" va qayta ishlatilmaydi | Qayta ishlatish uchun kontekst yetishmaydi | Kerakli parametrlarni props bilan berish |
| Layout'ni widget qilib, ichida sahifalarni import qilish | Import qoidasi (pages yuqorida) | Layout `app`'da yoki slot bilan (24-bob) |

## Manbalar

- Rasmiy: *Layers — Widgets* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Page Layouts* <https://feature-sliced.design/docs/guides/examples/page-layout>
