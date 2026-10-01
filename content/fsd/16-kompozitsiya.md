# 16 — Yuqori qatlamda kompozitsiya

[← Oldingi: Cross-import va @x](15-cross-import.md) · [Mundarija](README.md) · [Keyingi: Desegmentatsiya va nomlash →](17-desegmentatsiya.md)

## Qisqacha

Bir qatlamdagi ikki slice birga ishlashi kerak bo'lsa, ularni **bir-biriga ulamang** — yuqoriroq qatlamda (`widgets`, `pages`, `app`) **yonma-yon qo'ying**. Bir slice boshqasining UI'sini ko'rsatishi kerak bo'lsa, unga "bo'sh joy" qoldiring: React'da render props/`children`, Vue'da slot, Angular'da content projection. Bu — boshqaruvni teskari qilish (IoC): slice nima ko'rsatilishini bilmaydi, yuqori qatlam beradi.

Rasmiy FAQ: "pages/features/entities'ni bir-biriga joylash mumkinmi? Ha, lekin bu **yuqori qatlamlarda** bo'lishi kerak."

## Qoida

| Usul | Qachon |
| --- | --- |
| **Oddiy yonma-yon** | Ikki slice bir-birini umuman bilishi shart emas |
| **Slot / render props / content projection** | Bir slice ichida boshqasining UI'si ko'rinishi kerak (izoh yonida avatar) |
| **Callback props** | Bir slice'dagi hodisa boshqasini ishga tushiradi |
| **DI / kontekst** | Bog'liqlik chuqur daraxt bo'ylab kerak (Angular `InjectionToken`, React context, Vue provide/inject) |

## Shablon

```text
features/comment-list/   — avatar'ni BILMAYDI, "avatar uchun joy" beradi
features/user-profile/   — UserAvatar'ni eksport qiladi
pages/post/              — ikkalasini import qiladi va ulaydi   ← kompozitsiya shu yerda

entities/product/ui/ProductCard   — "actions" uchun joy
features/add-to-cart              — tugma
pages/catalog                     — <ProductCard actions={<AddToCart/>} />
```

## Kod: izoh ro'yxati + avatar

::: react
```tsx
// features/comment-list/ui/CommentList.tsx — user-profile'ni import qilmaydi
import type { ReactNode } from 'react'
import type { Comment } from '../model/comment'

interface Props {
  comments: Comment[]
  renderAvatar?: (userId: string) => ReactNode
}

export function CommentList({ comments, renderAvatar }: Props) {
  return (
    <ul>
      {comments.map((c) => (
        <li key={c.id}>
          {renderAvatar?.(c.userId)}
          <span>{c.text}</span>
        </li>
      ))}
    </ul>
  )
}

// pages/post/ui/PostPage.tsx — ikkalasini ulaydi
import { CommentList } from '@/features/comment-list'
import { UserAvatar } from '@/features/user-profile'

<CommentList comments={comments} renderAvatar={(id) => <UserAvatar userId={id} />} />
```
:::

::: vue
```vue
<!-- features/comment-list/ui/CommentList.vue — user-profile'ni import qilmaydi -->
<script setup lang="ts">
import type { Comment } from '../model/comment'
defineProps<{ comments: Comment[] }>()
</script>

<template>
  <ul>
    <li v-for="c in comments" :key="c.id">
      <slot name="avatar" :user-id="c.userId" />
      <span>{{ c.text }}</span>
    </li>
  </ul>
</template>

<!-- pages/post/ui/PostPage.vue — ikkalasini ulaydi -->
<!--
<CommentList :comments="comments">
  <template #avatar="{ userId }"><UserAvatar :user-id="userId" /></template>
</CommentList>
-->
```
:::

::: angular
```ts
// features/comment-list/ui/comment-list.ts — user-profile'ni import qilmaydi
import { Component, contentChild, input, TemplateRef } from '@angular/core'
import { NgTemplateOutlet } from '@angular/common'
import type { Comment } from '../model/comment'

@Component({
  selector: 'app-comment-list',
  imports: [NgTemplateOutlet],
  template: `
    <ul>
      @for (c of comments(); track c.id) {
        <li>
          <ng-container *ngTemplateOutlet="avatar() ?? null; context: { $implicit: c.userId }" />
          <span>{{ c.text }}</span>
        </li>
      }
    </ul>
  `,
})
export class CommentList {
  readonly comments = input.required<Comment[]>()
  protected readonly avatar = contentChild<TemplateRef<{ $implicit: string }>>('avatar')
}

// pages/post/ui/post-page.html — ikkalasini ulaydi
// <app-comment-list [comments]="comments()">
//   <ng-template #avatar let-userId><app-user-avatar [userId]="userId" /></ng-template>
// </app-comment-list>
```
:::

## Kod: hodisa orqali ulash

Feature A tugagach feature B ishga tushishi kerak — A B'ni chaqirmaydi, hodisa chiqaradi, sahifa ulaydi:

::: react
```tsx
// pages/checkout/ui/CheckoutPage.tsx
<ApplyPromoCode onApplied={() => refetchCartTotals()} />
<CartTotals />
```
:::

::: vue
```vue
<!-- pages/checkout/ui/CheckoutPage.vue -->
<ApplyPromoCode @applied="refetchCartTotals" />
<CartTotals />
```
:::

::: angular
```html
<!-- pages/checkout/ui/checkout-page.html -->
<app-apply-promo-code (applied)="totals.reload()" />
<app-cart-totals />
```
:::

## Qachon / qachon emas

| Holat | Yechim |
| --- | --- |
| Feature UI'si boshqa feature UI'sini ichida ko'rsatadi | Slot / render props / projection |
| Ikki feature doim birga, ajratib bo'lmaydi | Birlashtirish (15-bob, A) |
| Bir nechta feature bir domen qoidasini ishlatadi | Qoidani `entities`'ga (15-bob, B) |
| Layout ichida widget kerak | Layout `app`'da yoki slot bilan (24-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `CommentList` ichida `import { UserAvatar } from '@/features/user-profile'` | Cross-import | Slot / render prop |
| 6 qatlam chuqur prop drilling | Kompozitsiya o'rniga og'riq | Kontekst/DI yoki kompozitsiyani yuqoriroqqa |
| Global event bus (feature'lar bir-biriga "xabar yuboradi") | Yashirin bog'lanish, kuzatib bo'lmaydi | Aniq callback yoki umumiy holat pastda |
| Entity UI'siga biznes harakatini qattiq yozish | Entity feature'larga bog'landi | Harakat — slot orqali tashqaridan |

## Manbalar

- Rasmiy: *Cross-imports — Strategy C* <https://feature-sliced.design/docs/guides/issues/cross-imports>
- Rasmiy: *FAQ — Can I embed pages/features/entities into each other?* <https://feature-sliced.design/docs/get-started/faq>
- Saytda: [React 14-bob — Kompozitsiya](../react/14-kompozitsiya.md), [Vue 26-bob — Slotlar](../vue/26-slotlar.md), [Angular 28-bob — Kontent proyeksiyasi](../angular/28-kontent-proyeksiyasi.md)
