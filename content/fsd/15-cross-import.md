# 15 — Cross-import va `@x`

[← Oldingi: Public API chuqur](14-public-api-chuqur.md) · [Mundarija](README.md) · [Keyingi: Yuqori qatlamda kompozitsiya →](16-kompozitsiya.md)

## Qisqacha

**Cross-import** — bir qatlamdagi ikki slice orasidagi import: `features/cart` → `features/product`, `widgets/header` → `widgets/sidebar`. Bu **code smell**: slice'lar bog'lanib borayotganining belgisi. Ba'zan undan qochish qiyin — lekin u har doim ongli, hujjatlangan qaror bo'lishi kerak. `entities` orasida buning uchun maxsus `@x` belgisi bor; `features` va `widgets`'da esa to'rtta strategiya.

`shared` va `app` ichidagi importlar cross-import **emas** — ularda slice yo'q.

## Qoida

Nega code smell:

| Muammo | Ma'no |
| --- | --- |
| Egalik noaniq | `cart` `product` mantiqiga tayansa — u kimning kodi? `product` o'zgarsa, `cart` bilmasdan buziladi |
| Izolyatsiya va test | `cart`'ni test qilish uchun `product`'ni ham sozlash kerak |
| Kognitiv yuk | `cart` ustida ishlash uchun `product` tuzilmasini ham bilish kerak |
| Siklga yo'l | Bir tomonlama import vaqt o'tib ikki tomonlamaga aylanadi |

## Shablon: `@x` — entity'lar orasida

```text
entities/
├── song/
│   ├── @x/
│   │   └── artist.ts       ← faqat entities/artist uchun maxsus public API
│   ├── model/song.ts
│   └── index.ts            ← oddiy public API
└── artist/
    └── model/artist.ts     → import type { Song } from '@/entities/song/@x/artist'

O'qilishi: "song/@x/artist" = "song, artist bilan kesishgan"
```

```ts
// entities/song/@x/artist.ts
export type { Song } from '../model/song'

// entities/artist/model/artist.ts
import type { Song } from '@/entities/song/@x/artist'

export interface Artist {
  name: string
  songs: Song[]
}
```

`@x` qoidalari:
- **Faqat `entities` qatlamida.** U yerda cross-importni butunlay yo'qotish ko'pincha asossiz: real dunyoda obyektlar bir-biriga ishora qiladi.
- **Oxirgi chora**, tavsiya etilgan yondashuv emas. Avval so'rang: entity'lar haddan tashqari mayda bo'linmaganmi? Birlashtirish yaxshiroq emasmi (18-bob)?
- Bog'langan entity'lar birga refaktoring qilinadi — `@x` bu bog'liqlikni **ko'rinadigan** qiladi.

## Strategiyalar: `features` va `widgets`

| Strategiya | Qachon | Nima qilinadi |
| --- | --- | --- |
| **A. Birlashtirish** | Ikki slice doim birga o'zgaradi va bir-birini import qiladi | `features/profile` + `features/profile-settings` → `features/profile` |
| **B. Domen oqimini `entities`'ga** | Bir nechta feature bir domen mantiqini ishlatadi | Sessiya tekshiruvi → `entities/session/model`; UI feature'larda qoladi |
| **C. Yuqorida kompozitsiya (IoC)** | Bir feature boshqasining UI'sini ko'rsatishi kerak | Sahifa/widget ikkalasini yig'adi: render props, slot, content projection (16-bob) |
| **D. Faqat public API orqali** | Yuqoridagilar mos kelmaydi, qayta ishlatish muqarrar | Faqat eksport qilingan hook/komponent; store va ichki fayllarga kirish taqiq |

## Kod: D strategiya — chegarani qattiq saqlash

::: react
```tsx
// features/auth/index.ts
export { useAuth } from './model/use-auth'
export { AuthButton } from './ui/AuthButton'

// features/profile/ui/ProfileMenu.tsx — ongli cross-import (ADR/izoh bilan)
import { useAuth, AuthButton } from '@/features/auth'          // ✅ public API
// import { authStore } from '@/features/auth/model/internal'  // ❌ ichki store

export function ProfileMenu() {
  const { user } = useAuth()
  return user ? <div>{user.name}</div> : <AuthButton />
}
```
:::

::: vue
```vue
<!-- features/profile/ui/ProfileMenu.vue — ongli cross-import (ADR/izoh bilan) -->
<script setup lang="ts">
import { useAuth, AuthButton } from '@/features/auth'          // ✅ public API
// import { useAuthStore } from '@/features/auth/model/store'  // ❌ ichki store

const { user } = useAuth()
</script>

<template>
  <div v-if="user">{{ user.name }}</div>
  <AuthButton v-else />
</template>
```
:::

::: angular
```ts
// features/profile/ui/profile-menu.ts — ongli cross-import (ADR/izoh bilan)
import { Component, inject } from '@angular/core'
import { AuthSession, AuthButton } from '@/features/auth'      // ✅ public API
// import { AuthStateStore } from '@/features/auth/model/state' // ❌ ichki store

@Component({
  selector: 'app-profile-menu',
  imports: [AuthButton],
  template: `
    @if (auth.user(); as user) { <div>{{ user.name }}</div> }
    @else { <app-auth-button /> }
  `,
})
export class ProfileMenu {
  protected readonly auth = inject(AuthSession)
}
```
:::

## Qachon / qachon emas

Cross-importni **muammo** deb hisoblash belgilari:
- boshqa slice'ning store/model/biznes mantiqiga to'g'ridan-to'g'ri bog'liqlik;
- boshqa slice'ning ichki fayllariga chuqur import;
- **ikki tomonlama** bog'liqlik (A → B va B → A);
- bir slice'dagi o'zgarish doim boshqasini buzadi;
- `pages`/`app`'da yig'ilishi kerak bo'lgan oqim bir qatlamda cross-import bilan ulangan.

Qanchalik qat'iy bo'lish — **jamoa qarori**: tajriba bosqichidagi mahsulotda biroz cross-import — ongli tezlik trade-off'i; uzoq yashaydigan yoki tartibga solinadigan tizimda (fintech) qat'iy chegaralar o'zini oqlaydi. Har cross-import: ongli tanlov, sababi yozilgan, vaqti-vaqti bilan qayta ko'riladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `@x` ni features/widgets'da ishlatish | Belgi faqat entities uchun | A–D strategiyalar |
| Har ikki entity orasida `@x` | Chegaralar qotadi, refaktoring qimmat | Kontekstni birlashtirish |
| Cross-import izohsiz | Keyin "nega?" — javob yo'q | Izoh/ADR, muntazam qayta ko'rish |
| Ichki store'ga to'g'ridan-to'g'ri kirish | Yashirin bog'lanish | Faqat public API (D) |
| A → B → A | Sikl, ajratib bo'lmaydi | Birlashtirish yoki yuqorida kompozitsiya |

## Manbalar

- Rasmiy: *Cross-imports* <https://feature-sliced.design/docs/guides/issues/cross-imports>
- Rasmiy: *Public API — Public API for cross-imports* <https://feature-sliced.design/docs/reference/public-api>
