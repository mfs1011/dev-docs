# 06 — Import qoidasi va public API

[← Oldingi: Segmentlar](05-segmentlar.md) · [Mundarija](README.md) · [Keyingi: shared →](07-shared.md)

## Qisqacha

FSD'ning butun foydasi ikki qoidaga tayanadi. **Import qoidasi**: slice faqat o'zidan qat'iy pastdagi qatlamlarni ko'radi. **Public API qoidasi**: slice'ga tashqaridan faqat uning `index.ts` fayli orqali kiriladi. Birinchisi o'zgarish ta'sirini bashorat qilinadigan qiladi, ikkinchisi slice ichini erkin refaktoring qilishga imkon beradi. Ikkalasi ham linter bilan tekshiriladi (33, 34-boblar) — aks holda bir oyda buziladi.

## Qoida

> **Import qoidasi.** Slice ichidagi modul (fayl) boshqa slice'larni faqat ular qat'iy pastdagi qatlamlarda joylashgan bo'lsa import qila oladi.

> **Public API qoidasi.** Har slice (va slice'siz qatlamlarda har segment) public API'ga ega bo'lishi shart. Tashqaridagi modullar faqat public API'ga murojaat qiladi, slice'ning ichki fayl tuzilmasiga emas.

| Kim → kimni | `shared` | `entities` | `features` | `widgets` | `pages` | `app` |
| --- | --- | --- | --- | --- | --- | --- |
| `app` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ segmentlar |
| `pages/x` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| `widgets/x` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `features/x` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `entities/x` | ✅ | ❌ (`@x` bundan mustasno, 15-bob) | ❌ | ❌ | ❌ | ❌ |
| `shared` | ✅ segmentlar | ❌ | ❌ | ❌ | ❌ | ❌ |

O'z slice'ingiz ichidagi fayllar — har doim ✅ (`features/a/ui` → `features/a/model`).

Yaxshi public API'ning uch maqsadi (rasmiy hujjatdan):

1. Slice ichidagi tuzilma o'zgarishi (refaktoring) ilovaning qolgan qismini buzmasin.
2. Slice xatti-harakatidagi **jiddiy** o'zgarish public API o'zgarishida ko'rinsin.
3. Faqat kerakli narsa eksport qilinsin.

## Shablon: import yo'llari

```text
Slice ICHIDA    → nisbiy, to'liq yo'l bilan:   import { formatPrice } from '../lib/format-price'
Slice'lar ORASIDA → absolyut (alias) va public API orqali:  import { ProductCard } from '@/entities/product'
shared/ui, shared/lib → komponent/kutubxona bo'yicha alohida index:  import { Button } from '@/shared/ui/button'

Nega aynan shunday: slice o'z index.ts'idan import qilsa (`from '../'`) — siklik import paydo bo'ladi (14-bob).
```

## Kod: alias sozlash

Absolyut importlar uchun `@/` alias'i `src/`'ga qarashi kerak:

::: react
```ts
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
```

```json
// tsconfig.app.json (compilerOptions ichida)
{ "paths": { "@/*": ["./src/*"] } }
```
:::

::: vue
```ts
// vite.config.ts — create-vue shablonida bu allaqachon bor
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
```

```json
// tsconfig.app.json (compilerOptions ichida)
{ "paths": { "@/*": ["./src/*"] } }
```
:::

::: angular
```json
// tsconfig.json (compilerOptions ichida) — Angular CLI esbuild builder paths'ni o'zi tushunadi
{ "paths": { "@/*": ["./src/*"] } }
```
:::

## Kod: buzilish va tuzatish

::: react
```tsx
// ❌ features/add-to-cart/ui/AddToCart.tsx
import { useCartStore } from '@/entities/cart/model/cart-store'   // ichki faylga chuqur import
import { WishlistButton } from '@/features/wishlist'               // bir qatlam — boshqa slice

// ✅
import { useCart } from '@/entities/cart'                          // public API orqali
// WishlistButton — yuqori qatlamda yonma-yon qo'yiladi (widget yoki sahifa), 16-bob
```
:::

::: vue
```ts
// ❌ features/add-to-cart/ui/AddToCart.vue
import { useCartStore } from '@/entities/cart/model/cart-store'   // ichki faylga chuqur import
import { WishlistButton } from '@/features/wishlist'               // bir qatlam — boshqa slice

// ✅
import { useCartStore } from '@/entities/cart'                     // public API orqali
// WishlistButton — yuqori qatlamda slot orqali yonma-yon qo'yiladi, 16-bob
```
:::

::: angular
```ts
// ❌ features/add-to-cart/ui/add-to-cart.ts
import { CartStore } from '@/entities/cart/model/cart-store'      // ichki faylga chuqur import
import { WishlistButton } from '@/features/wishlist'               // bir qatlam — boshqa slice

// ✅
import { CartStore } from '@/entities/cart'                        // public API orqali
// WishlistButton — yuqori qatlamda content projection bilan yonma-yon, 16-bob
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Testdan slice ichki faylini import qilsam bo'ladimi? | Ha — slice ichidagi test o'sha slice'ning bir qismi (35-bob) |
| `app` hamma narsani import qila oladimi? | Ha — u eng yuqori qatlam, ichida slice yo'q |
| Public API'da tip eksport qilish kerakmi? | Ha, tashqariga kerak bo'lsa: `export type { Product }` |
| Kutubxona (`zod`, `axios`) importlari? | Qoida faqat loyiha ichidagi qatlamlarga tegishli |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| IDE auto-import chuqur yo'lni tanladi | Public API chetlab o'tildi, rasmiy hujjat ham ogohlantiradi | Steiger / ESLint qoidasi (33, 34-boblar) |
| Slice ichida `from '@/features/x'` | O'z index'idan import — sikl | Nisbiy yo'l |
| `export *` | Hamma narsa ochiq, interfeys noaniq | Aniq eksportlar |
| Qoidalar faqat kelishuvda | Birinchi shoshilinch PR'da buziladi | CI'da linter |
| Pastki qatlam yuqoridagisini "faqat tip uchun" import qiladi | Tip ham bog'liqlik — sikl va refaktoring muammosi | Tipni pastga ko'chirish yoki `@x` (faqat entities) |

## Manbalar

- Rasmiy: *Layers — Import rule on layers* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Public API* <https://feature-sliced.design/docs/reference/public-api>
- Arxitektura qo'llanmasi: [11-bob — Modulning ochiq API'si](../arxitektura/11-ochiq-api.md)
