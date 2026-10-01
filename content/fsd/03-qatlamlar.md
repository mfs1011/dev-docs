# 03 — Qatlamlar

[← Oldingi: Pages-first: v2.1 fikrlash modeli](02-pages-first.md) · [Mundarija](README.md) · [Keyingi: Slice'lar →](04-slicelar.md)

## Qisqacha

Qatlam (layer) — FSD'dagi birinchi daraja: `src/` ichidagi standart nomli papka. Qatlamlar kodni **mas'uliyati va bog'liqligi** bo'yicha ajratadi: yuqoridagi qatlam ko'p narsani biladi va ko'p narsaga bog'liq, pastdagisi kam narsani biladi va ko'p joyda ishlatiladi. Jami 7 qatlam bor, ulardan biri (`processes`) eskirgan.

## Qoida

Yuqoridan pastga (eng ko'p mas'uliyatdan eng kamiga):

| # | Qatlam | Nima uchun | Slice'lar | Kim import qila oladi |
| --- | --- | --- | --- | --- |
| 1 | `app` | Ilovani ishga tushiradigan hamma narsa: marshrutlar, entrypoint, global stil, provayderlar | Yo'q — segmentlar | Hech kim |
| 2 | `processes` | **Eskirgan.** Ko'p sahifali ssenariylar | — | Ishlatmang: tarkibini `features` va `app`'ga ko'chiring |
| 3 | `pages` | To'liq sahifalar (ichma-ich marshrutlashda — sahifaning katta qismi) | Ha | `app` |
| 4 | `widgets` | Katta mustaqil UI bloklari, ko'pincha butun bir foydalanish holati | Ha | `app`, `pages` |
| 5 | `features` | Foydalanuvchiga qiymat beradigan harakatlarning **qayta ishlatiladigan** implementatsiyasi | Ha | `app`, `pages`, `widgets` |
| 6 | `entities` | Loyiha ishlaydigan biznes obyektlari: `user`, `product`, `order` | Ha | `app`, `pages`, `widgets`, `features` |
| 7 | `shared` | Qayta ishlatiladigan, odatda biznesdan xoli kod | Yo'q — segmentlar | Hamma |

Uchta muhim qoida:

1. **Hamma qatlam majburiy emas.** Faqat foyda beradiganlarini qo'shing. Ko'p loyihada kamida `shared`, `pages` va `app` bo'ladi.
2. **Nomlar standart.** Qatlamlar — kichik harfli papkalar. **Yangi qatlam qo'shish tavsiya etilmaydi** — ularning ma'nosi standartlashtirilgan, va aynan shu har loyihani tanish qiladi.
3. **`app` va `shared` — istisno.** Ular bir vaqtda ham qatlam, ham slice: ichida slice yo'q, to'g'ridan-to'g'ri segmentlar. Shuning uchun ularning segmentlari **bir-birini erkin import qiladi** (`shared/ui` → `shared/lib` ✅).

## Shablon

```text
src/
├── app/                   ← ilova darajasi (slice'siz)
│   ├── entrypoint/        main.ts / main.tsx (framework'ga xos)
│   ├── routes/            router konfiguratsiyasi
│   ├── store/             global store sozlamasi (kerak bo'lsa)
│   └── styles/            global stil
├── pages/                 ← har sahifa — slice
├── widgets/               ← kerak bo'lganda
├── features/              ← kerak bo'lganda
├── entities/              ← kerak bo'lganda
└── shared/                ← poydevor (slice'siz)
    ├── api/
    ├── ui/
    ├── lib/
    ├── config/
    ├── routes/
    └── i18n/
```

Qatlamni qo'shish tartibi odatda shunday: `shared` + `pages` + `app` → (takrorlanuvchi biznes obyektlari) `entities` → (takrorlanuvchi harakatlar) `features` → (takrorlanuvchi katta bloklar) `widgets`.

## Kod: qatlamlararo import

Har qatlam faqat **qat'iy pastdagilarni** ko'radi. Bir qatlam ichidagi slice'lar bir-birini ko'rmaydi:

::: react
```tsx
// widgets/header/ui/Header.tsx — widgets qatlami
import { CurrentUserMenu } from '@/features/auth'      // ✅ features < widgets
import { CartCounter } from '@/entities/cart'          // ✅ entities < widgets
import { Logo } from '@/shared/ui/logo'                // ✅ shared
// import { Sidebar } from '@/widgets/sidebar'         // ❌ bir qatlam — boshqa slice
// import { HomePage } from '@/pages/home'             // ❌ yuqoridagi qatlam

export function Header() {
  return (
    <header>
      <Logo />
      <CartCounter />
      <CurrentUserMenu />
    </header>
  )
}
```
:::

::: vue
```vue
<!-- widgets/header/ui/AppHeader.vue — widgets qatlami -->
<script setup lang="ts">
import { CurrentUserMenu } from '@/features/auth'      // ✅ features < widgets
import { CartCounter } from '@/entities/cart'          // ✅ entities < widgets
import { AppLogo } from '@/shared/ui/logo'             // ✅ shared
// import { AppSidebar } from '@/widgets/sidebar'      // ❌ bir qatlam — boshqa slice
// import { HomePage } from '@/pages/home'             // ❌ yuqoridagi qatlam
</script>

<template>
  <header>
    <AppLogo />
    <CartCounter />
    <CurrentUserMenu />
  </header>
</template>
```
:::

::: angular
```ts
// widgets/header/ui/header.ts — widgets qatlami
import { Component } from '@angular/core'
import { CurrentUserMenu } from '@/features/auth'      // ✅ features < widgets
import { CartCounter } from '@/entities/cart'          // ✅ entities < widgets
import { Logo } from '@/shared/ui/logo'                // ✅ shared
// import { Sidebar } from '@/widgets/sidebar'         // ❌ bir qatlam — boshqa slice
// import { HomePage } from '@/pages/home'             // ❌ yuqoridagi qatlam

@Component({
  selector: 'app-header',
  imports: [Logo, CartCounter, CurrentUserMenu],
  template: `
    <header>
      <app-logo />
      <app-cart-counter />
      <app-current-user-menu />
    </header>
  `,
})
export class Header {}
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Kichik ilovada `widgets` kerakmi? | Yo'q, toki katta blok bir necha sahifada takrorlanmaguncha |
| `entities`'siz loyiha FSD hisoblanadimi? | Ha. Yupqa klient (mantiq backend'da) uchun bu normal (18-bob) |
| `processes`'ni ishlatsam bo'ladimi? | Yangi loyihada — yo'q. Mavjud loyihada — `features` va `app`'ga ko'chirish |
| `core/` yoki `modules/` qo'shsam-chi? | Qo'shmang: standart buziladi. `shared` yoki `app` segmenti sifatida yechish |
| Qatlam nomi framework bilan to'qnashsa? | Next.js: `_app`, `_pages` (28-bob); Nuxt: `dir.pages` sozlamasi (30-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hamma 6 qatlamni bo'sh papka bilan yaratish | Shovqin, "bu yerga nimadir qo'yish kerak" bosimi | Faqat kerakli qatlamlar |
| `shared`'ga biznes mantiqi | Poydevor biznesga bog'lanadi, hamma joyga tarqaladi | Biznes — `entities`/`features` yoki sahifada |
| `app`'da sahifa komponentlari | `app` shishadi, sahifalar ajralmaydi | `app` — faqat yig'ish va sozlash |
| `entities` → `features` import | Import qoidasi buziladi, sikllar paydo bo'ladi | Kompozitsiyani yuqori qatlamda qilish (16-bob) |
| Qatlamlarni `src/` dan tashqariga sochish | Alias va linter sozlamalari murakkablashadi | Hamma qatlam bitta FSD ildizida |

## Manbalar

- Rasmiy: *Layers* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Overview — Layers* <https://feature-sliced.design/docs/get-started/overview>
