# 17 — Desegmentatsiya va nomlash

[← Oldingi: Yuqori qatlamda kompozitsiya](16-kompozitsiya.md) · [Mundarija](README.md) · [Keyingi: Ortiqcha entity'lar →](18-ortiqcha-entitylar.md)

## Qisqacha

**Desegmentatsiya** (gorizontal bo'linish, "qatlam bo'yicha paketlash") — fayllarni biznes sohasi emas, **texnik roli** bo'yicha guruhlash: hamma komponentlar `components/`'da, hamma hook'lar `hooks/`'da, hamma tiplar `types.ts`'da. Next.js va Nuxt loyihalarida juda keng tarqalgan, chunki boshlash oson. FSD ichida ham uchraydi — `ui/components/`, `utils.ts` ko'rinishida. Yechim: bir domenga oid kodni bir joyda saqlang va nomlarni domendan oling.

## Qoida

```text
❌ Desegmentatsiya                      ✅ Domen bo'yicha
app/                                    pages/delivery/
├── components/                         ├── ui/
│   ├── DeliveryCard.tsx                │   ├── DeliveryPage.tsx
│   ├── RegionSelect.tsx                │   ├── DeliveryCard.tsx
│   └── UserAvatar.tsx                  │   └── RegionSelect.tsx
├── composables/                        ├── model/
│   ├── delivery.ts                     │   ├── delivery.ts       DeliveryOption, formatDeliveryPrice
│   └── user.ts                         │   └── region.ts
├── utils/                              ├── api/
│   ├── delivery.ts                     │   └── load-delivery-options.ts
│   └── user.ts                         └── index.ts
└── stores/delivery/
    ├── getters.ts
    └── actions.ts
"Yetkazib berish"ni o'zgartirish = 5 papka   "Yetkazib berish"ni o'zgartirish = 1 papka
```

Muammolari:

| Muammo | Ma'no |
| --- | --- |
| **Past bog'liqlik** (cohesion) | Bitta funksiyani o'zgartirish — bir nechta katta papkada tahrir |
| **Kuchli bog'lanish** (coupling) | Komponentlarda kutilmagan bog'liqliklar, chalkash zanjirlar |
| **Refaktoring qiyin** | Bir domen kodini qo'lda yig'ib chiqarish kerak |

## Shablon: nomlash qoidalari

```text
Papka / segment nomlari             Fayl nomlari
❌ components/   hooks/   types/      ❌ types.ts   utils.ts   helpers.ts   constants.ts
❌ ui/components/  model/utils/       ✅ product.ts   delivery-price.ts   use-cart.ts
✅ ui/   model/   api/   lib/          ✅ order-status.ts   promo-code-schema.ts
✅ shared/lib/date/   shared/lib/money/

Savol: "Bu nom kod NIMA UCHUN ekanini aytadimi yoki QANDAY yozilganini?"
  types.ts      — qanday (tip)            → nima uchun? product.ts (mahsulot tipi va funksiyalari)
  hooks/        — qanday (hook)           → nima uchun? model/ (holat va mantiq)
  utils.ts      — qanday (yordamchi)      → nima uchun? format-price.ts
```

## Kod: aralash `types.ts` va `utils.ts`

::: react
```ts
// ❌ pages/delivery/model/types.ts — ikki domen bitta faylda
export interface DeliveryOption { id: string; name: string; price: number }
export interface UserInfo { id: string; name: string; avatar: string }

// ❌ pages/delivery/model/utils.ts
export const formatDeliveryPrice = (price: number) => `${price.toLocaleString('uz-UZ')} so'm`
export const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('')

// ✅ pages/delivery/model/delivery.ts — domen bo'yicha
export interface DeliveryOption { id: string; name: string; price: number }
export const formatDeliveryPrice = (price: number) => `${price.toLocaleString('uz-UZ')} so'm`

// ✅ pages/delivery/model/user.ts
export interface UserInfo { id: string; name: string; avatar: string }
export const getUserInitials = (name: string) => name.split(' ').map((n) => n[0]).join('')
```
:::

::: vue
```ts
// ❌ stores/delivery/getters.ts + stores/delivery/actions.ts + composables/delivery.ts + utils/delivery.ts
//    (Nuxt/Vue'ning "texnik papkalar" uslubi)

// ✅ pages/delivery/model/delivery-store.ts — Pinia store domen yonida
import { defineStore } from 'pinia'
import type { DeliveryOption } from './delivery'

export const useDeliveryStore = defineStore('delivery', {
  state: () => ({ selected: null as DeliveryOption | null }),
  actions: { select(option: DeliveryOption) { this.selected = option } },
})

// ✅ pages/delivery/model/delivery.ts
export interface DeliveryOption { id: string; name: string; price: number }
export const formatDeliveryPrice = (price: number) => `${price.toLocaleString('uz-UZ')} so'm`
```
:::

::: angular
```ts
// ❌ src/app/services/  src/app/models/  src/app/pipes/  src/app/components/
//    (Angular'ning eski "tur bo'yicha papkalar" uslubi — rasmiy style guide ham endi feature bo'yicha tavsiya qiladi)

// ✅ pages/delivery/model/delivery.ts
export interface DeliveryOption { id: string; name: string; price: number }
export const formatDeliveryPrice = (price: number) => `${price.toLocaleString('uz-UZ')} so'm`

// ✅ pages/delivery/ui/delivery-price-pipe.ts — pipe uni ishlatadigan UI yonida
import { Pipe, type PipeTransform } from '@angular/core'
import { formatDeliveryPrice } from '../model/delivery'

@Pipe({ name: 'deliveryPrice' })
export class DeliveryPricePipe implements PipeTransform {
  transform(price: number) { return formatDeliveryPrice(price) }
}
```
:::

## Qachon / qachon emas

| Holat | Normalmi? |
| --- | --- |
| `shared/ui` ichida 30 ta komponent | ✅ `shared` — biznessiz, texnik guruhlash shu yerda tabiiy |
| `shared/lib/date`, `shared/lib/money` | ✅ har biri bitta yo'nalish + README |
| Framework talab qilgan papka (`app/`, `pages/` Next/Nuxt'da) | ✅ — lekin ular faqat marshrutlash, kod FSD'da (28, 30-boblar) |
| Slice ichida `ui/components/` | ❌ ortiqcha daraja |
| Bitta slice'da `types.ts` 3 domen bilan | ❌ domen nomli fayllar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| FSD qatlamlari ichida `components/`, `hooks/` | Desegmentatsiya FSD ichida qaytdi | `ui/`, `model/` |
| `shared/lib/utils.ts` | Hamma narsaning axlat qutisi | Yo'nalishli kutubxonalar |
| `model/types.ts`, `model/utils.ts` | Domenlar aralashadi | `model/delivery.ts`, `model/user.ts` |
| `api/endpoints.ts` — hamma so'rovlar | Bir faylda bir nechta domen | `api/load-delivery-options.ts` |
| Nomlar ingliz/o'zbek aralash | Qidiruv qiyin | Bitta til (odatda ingliz), biznes atamalari bilan |

## Manbalar

- Rasmiy: *Desegmentation* <https://feature-sliced.design/docs/guides/issues/desegmented>
- Rasmiy: *Slices and segments — Segments* <https://feature-sliced.design/docs/reference/slices-segments>
- Arxitektura qo'llanmasi: [16-bob — Vertical slice va feature-based](../arxitektura/16-vertical-slice.md)
