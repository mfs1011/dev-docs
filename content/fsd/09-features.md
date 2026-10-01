# 09 — features

[← Oldingi: entities](08-entities.md) · [Mundarija](README.md) · [Keyingi: widgets →](10-widgets.md)

## Qisqacha

`features` — foydalanuvchi **qilmoqchi bo'lgan** asosiy harakatlar: savatga qo'shish, izoh qoldirish, promo-kod qo'llash, kirish. Ular odatda entity'lar ustida ishlaydi. Eng muhim qoida — **hamma narsa feature emas**: harakat bir nechta sahifada qayta ishlatilsagina u feature bo'lishga loyiq.

## Qoida

- **Feature bo'lish belgisi** — bir necha sahifada qayta ishlatilishi. Bir nechta muharrirda izohlar bor → `features/comments`.
- Slice'lar kodni tez topish mexanizmi. Feature'lar juda ko'p bo'lsa, muhimlari ko'rinmay qoladi. Yangi odam loyihaga kelganda **pages va features'ni ko'rib**, ilova nima qilishini tushunishi kerak — shunga moslab optimallashtiring.
- Feature slice'ida odatda: harakat UI'si (forma, tugma) — `ui`; kerakli so'rovlar — `api`; validatsiya va ichki holat — `model`; feature flag'lar — `config`.
- Feature boshqa feature'ni import qilmaydi. Ularni birga ishlatish — yuqoriroq: `widgets` yoki `pages` (16-bob).

```text
Entity vs feature (rasmiy FAQ):
  entity  — ilova ishlaydigan real dunyo tushunchasi              product, order, comment
  feature — foydalanuvchiga real qiymat beradigan harakat          add-to-cart, leave-comment, cancel-order
```

## Shablon

```text
features/
├── add-to-cart/
│   ├── ui/AddToCartButton.tsx      tugma + miqdor
│   ├── api/add-to-cart.ts          POST /cart/items
│   ├── model/use-add-to-cart.ts    optimistik yangilash, xato holati
│   └── index.ts                    export { AddToCartButton }
├── leave-review/
│   ├── ui/ReviewForm.tsx
│   ├── model/review-schema.ts
│   ├── api/create-review.ts
│   └── index.ts
└── auth/                           kirish dialogi bir necha joyda bo'lsa (yoki widget, 22-bob)
```

## Kod: feature — entity ustidagi harakat

::: react
```tsx
// features/add-to-cart/ui/AddToCartButton.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartQueries } from '@/shared/api'            // kesh kalitlari shared'da (21-bob)
import { Button } from '@/shared/ui/button'
import { addToCart } from '../api/add-to-cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () => addToCart(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueries.all() }),
  })
  return <Button onClick={() => mutate()} disabled={isPending}>Savatga</Button>
}

// features/add-to-cart/index.ts
export { AddToCartButton } from './ui/AddToCartButton'
```
:::

::: vue
```vue
<!-- features/add-to-cart/ui/AddToCartButton.vue -->
<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { cartQueries } from '@/shared/api'            // kesh kalitlari shared'da (21-bob)
import { BaseButton } from '@/shared/ui/button'
import { addToCart } from '../api/add-to-cart'

const props = defineProps<{ productId: string }>()
const queryClient = useQueryClient()
const { mutate, isPending } = useMutation({
  mutationFn: () => addToCart(props.productId),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: cartQueries.all() }),
})
</script>

<template>
  <BaseButton :disabled="isPending" @click="mutate()">Savatga</BaseButton>
</template>
```
:::

::: angular
```ts
// features/add-to-cart/ui/add-to-cart-button.ts
import { Component, inject, input, signal } from '@angular/core'
import { CartStore } from '@/entities/cart'           // savat holati entity'da (qalin klient)
import { Button } from '@/shared/ui/button'
import { CartApi } from '../api/cart-api'

@Component({
  selector: 'app-add-to-cart-button',
  imports: [Button],
  template: `<app-button [disabled]="pending()" (click)="add()">Savatga</app-button>`,
})
export class AddToCartButton {
  readonly productId = input.required<string>()
  private readonly api = inject(CartApi)
  private readonly cart = inject(CartStore)
  protected readonly pending = signal(false)

  add() {
    this.pending.set(true)
    this.api.add(this.productId()).subscribe({
      next: (cart) => this.cart.set(cart),
      complete: () => this.pending.set(false),
      error: () => this.pending.set(false),
    })
  }
}
```
:::

## Qachon / qachon emas

| Holat | Qayerga |
| --- | --- |
| "Savatga qo'shish" katalog, mahsulot va qidiruv sahifalarida | ✅ `features/add-to-cart` |
| "Parolni o'zgartirish" faqat sozlamalar sahifasida | ❌ `pages/settings` ichida |
| Ikki feature doim birga o'zgaradi (`profile` + `profile-settings`) | Bitta feature'ga birlashtirish |
| Harakat emas, ko'rinish (`ProductCard`) | ❌ `entities` |
| Butun bir sidebar (filtr + saralash + natijalar soni) | `widgets` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har tugma — alohida feature | 60 slice, muhimlari ko'rinmaydi (`excessive-slicing`) | Qayta ishlatilganda ajratish |
| `features/cart` — butun savat domeni | Feature use-case emas, domen bo'lib qoldi | Use-case nomlari: `add-to-cart`, `remove-from-cart`; savat holati — `entities/cart` |
| `features/a` → `features/b` import | Import qoidasi | Yuqorida kompozitsiya yoki domen oqimini entity'ga (15-bob) |
| Feature boshqa feature store'ini to'g'ridan-to'g'ri o'zgartiradi | Yashirin bog'lanish | Public API orqali yoki yuqorida ulash |
| Feature ichida sahifa layout'i | Feature qayta ishlatilmaydi | Layout — sahifa/`app`'da |

## Manbalar

- Rasmiy: *Layers — Features* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *FAQ — difference between a feature and an entity* <https://feature-sliced.design/docs/get-started/faq>
