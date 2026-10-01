# 01 — FSD nima va qachon kerak

[Mundarija](README.md) · [Keyingi: Pages-first: v2.1 fikrlash modeli →](02-pages-first.md)

## Qisqacha

**Feature-Sliced Design (FSD)** — frontend ilovada kodni tartiblash uchun qoidalar va kelishuvlar to'plami. U uchta savolga qat'iy javob beradi: **fayl qaysi papkaga boradi**, **kim kimni import qila oladi** va **modulning tashqi interfeysi qayerda**. Natija — har bir FSD loyiha bir-biriga o'xshaydi: yangi dasturchi tuzilmani birinchi kundan taniydi.

FSD framework'ga bog'liq emas: React, Vue, Angular, Svelte, Next.js, Nuxt — qoidalar bir xil. U faqat **ilova** uchun (kutubxona uchun emas) va faqat **frontend** uchun mo'ljallangan.

## Qoida: uch daraja

```text
Qatlam (layer)   →  Slice              →  Segment
"qanchalik umumiy"   "qaysi biznes sohasi"   "texnik vazifasi"

src/
├── app/                    qatlam (slice'siz → to'g'ridan-to'g'ri segmentlar)
│   ├── routes/             segment
│   └── styles/             segment
├── pages/                  qatlam
│   ├── home/               slice
│   └── product/            slice
│       ├── ui/             segment
│       ├── api/            segment
│       └── index.ts        public API
├── entities/
│   └── product/
│       ├── model/
│       ├── ui/
│       └── index.ts
└── shared/                 qatlam (slice'siz)
    ├── ui/                 segment
    └── api/                segment
```

| Daraja | Nima bo'yicha bo'ladi | Nomlari |
| --- | --- | --- |
| **Qatlam** | Mas'uliyat va bog'liqlik darajasi | Standart: `app`, `pages`, `widgets`, `features`, `entities`, `shared` (+ eskirgan `processes`) |
| **Slice** | Biznes sohasi | Erkin: `product`, `cart`, `checkout`, `user-profile` |
| **Segment** | Texnik vazifa | Odatiy: `ui`, `api`, `model`, `lib`, `config` |

Ikki asosiy qoida (6-bobda batafsil):

1. **Import faqat pastga** — slice faqat o'zidan **qat'iy pastdagi** qatlamlardagi slice'larni import qila oladi. Bir qatlamdagi slice'lar bir-birini bilmaydi.
2. **Public API** — slice'ga tashqaridan faqat uning `index.ts` fayli orqali kiriladi.

## Kod: qoida amalda

::: react
```tsx
// pages/product/ui/ProductPage.tsx
import { ProductCard } from '@/entities/product'      // ✅ pastdagi qatlam, public API orqali
import { Button } from '@/shared/ui/button'           // ✅ shared — eng past qatlam
import { AddToCart } from '@/features/add-to-cart'    // ✅ features < pages

// ❌ import { CartWidget } from '@/widgets/cart'               — agar shu fayl entities'da bo'lsa (yuqoriga)
// ❌ import { formatPrice } from '@/entities/product/lib/price' — public API'ni chetlab o'tish
```
:::

::: vue
```vue
<!-- pages/product/ui/ProductPage.vue -->
<script setup lang="ts">
import { ProductCard } from '@/entities/product'      // ✅ pastdagi qatlam, public API orqali
import { BaseButton } from '@/shared/ui/button'       // ✅ shared — eng past qatlam
import { AddToCart } from '@/features/add-to-cart'    // ✅ features < pages

// ❌ import { CartWidget } from '@/widgets/cart'               — agar shu fayl entities'da bo'lsa (yuqoriga)
// ❌ import { formatPrice } from '@/entities/product/lib/price' — public API'ni chetlab o'tish
</script>
```
:::

::: angular
```ts
// pages/product/ui/product-page.ts
import { Component } from '@angular/core'
import { ProductCard } from '@/entities/product'      // ✅ pastdagi qatlam, public API orqali
import { Button } from '@/shared/ui/button'           // ✅ shared — eng past qatlam
import { AddToCart } from '@/features/add-to-cart'    // ✅ features < pages

// ❌ import { CartWidget } from '@/widgets/cart'               — agar shu fayl entities'da bo'lsa (yuqoriga)
// ❌ import { formatPrice } from '@/entities/product/lib/price' — public API'ni chetlab o'tish

@Component({
  selector: 'app-product-page',
  imports: [ProductCard, Button, AddToCart],
  templateUrl: './product-page.html',
})
export class ProductPage {}
```
:::

## Nega kerak

Texnik papkalar (`components/`, `hooks/`, `store/`, `utils/`) kichik loyihada qulay. 50+ komponentdan keyin muammo boshlanadi: bitta funksiyani o'zgartirish uchun 5 ta papkani aylanasiz, `utils.ts` 800 qatorga yetadi, har bir komponent istalgan boshqasini import qiladi va hech kim "buni o'chirsam nima buziladi?" savoliga javob bera olmaydi. FSD buni uchta mexanizm bilan hal qiladi:

| Mexanizm | Nima beradi |
| --- | --- |
| **Standart tuzilma** | Har loyiha bir xil — onboarding tez, "bu fayl qayerga?" bahslari yo'q |
| **Import qoidasi** | O'zgarish ta'siri bashorat qilinadi: `entities/product`'ni o'zgartirsangiz, faqat yuqoridagilar ta'sirlanadi |
| **Boshqariladigan qayta ishlatish** | Kod qatlamiga qarab juda umumiy (`shared`) yoki juda lokal (`pages/x`) bo'ladi |

Bundan tashqari FSD — **asboblar to'plami** ham: Steiger linteri (33-bob), papka generatorlari (CLI) va ko'plab misollar.

## Qachon / qachon emas

| FSD mos keladi | FSD ortiqcha bo'lishi mumkin |
| --- | --- |
| Ilova o'sib boradi, 3+ dasturchi, 6+ oy | Landing sahifa, 5 ekranli prototip |
| Yangi odamlar tez-tez qo'shiladi | Bir kishi, bir hafta |
| Mavjud tuzilma **muammo** tug'diryapti | Mavjud arxitektura ishlayapti — o'zgartirish shart emas |
| Bir nechta jamoa bitta frontend'da | Komponent kutubxonasi (ilova emas) |

Rasmiy hujjat ham shuni aytadi: agar hozirgi arxitektura jamoaga muammo tug'dirmasa, uni almashtirishga arzimasligi mumkin. FSD'ni bosqichma-bosqich ham joriy qilish mumkin (36-bob).

Kichik loyihada ham FSD'ning **minimal** shakli ishlaydi: faqat `app`, `pages`, `shared` qatlamlari (2-bob). Qolgan qatlamlar — ehtiyoj paydo bo'lganda.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Birinchi kunda 6 qatlam va 40 slice | Bo'sh papkalar, "bu feature'mi?" bahslari | `app` + `pages` + `shared` dan boshlash (2-bob) |
| FSD'ni papka nomlari deb tushunish | Qoidalar buziladi — tuzilma faqat ko'rinishda | Import qoidasi va public API'ni linter bilan tekshirish (33-bob) |
| O'z qatlamlarini qo'shish (`modules/`, `core/`) | Standart buziladi, yangi odam tanimaydi | Mavjud 6 qatlam ichida yechim topish |
| Backend kodini FSD'ga joylash | FSD frontend uchun; kutilmagan joy | Backend — alohida paket (32-bob) |
| Ishlayotgan arxitekturani "moda uchun" ko'chirish | Xarajat bor, foyda yo'q | Avval muammoni aniqlash |

## Manbalar

- Rasmiy: *Overview* <https://feature-sliced.design/docs/get-started/overview>
- Rasmiy: *FAQ* <https://feature-sliced.design/docs/get-started/faq>
- Arxitektura qo'llanmasi: [38-bob — Modul tuzilmasi](../arxitektura/38-modul-tuzilmasi.md), [16-bob — Vertical slice](../arxitektura/16-vertical-slice.md)
