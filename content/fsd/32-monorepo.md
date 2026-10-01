# 32 — Monorepo va bir nechta FSD ildizi

[← Oldingi: Angular shabloni](31-angular-shabloni.md) · [Mundarija](README.md) · [Keyingi: Steiger →](33-steiger.md)

## Qisqacha

Juda katta frontend bir nechta katta, deyarli mustaqil qismga bo'linadi: Google Docs'da hujjat muharriri va fayl brauzeri butunlay boshqa mas'uliyatlar. Bunday holatda rasmiy tavsiya — **monorepo, har paket alohida FSD ildizi** o'z qatlamlari bilan. Ba'zi paketlarda faqat `shared` va `entities` bo'ladi, boshqalarida faqat `pages` va `app`, uchinchilarida o'zining kichik `shared`'i va yana boshqa paketdagi katta `shared` ham.

## Qoida

- **Paket — FSD ildizi.** Har paket ichida qoidalar o'sha-o'sha: import faqat pastga, public API orqali.
- **Paketlararo import — tashqi kutubxona kabi.** `apps/admin` → `@shop/ui` — bu FSD qatlami emas, `node_modules`'dagi paketga o'xshash bog'liqlik. Paketning o'z `package.json` `exports`'i — uning public API'si.
- **Umumiy kod faqat haqiqiy qayta ishlatishda.** Bir ilova ishlatadigan narsani paketga chiqarmang — 2-bobdagi tamoyil paketlar darajasida ham amal qiladi.
- **Backend kodi alohida paket.** FSD frontend uchun; ko'p Route Handler yoki BFF — o'z paketida (rasmiy Next.js qo'llanmasi ham shuni aytadi).
- **Steiger har ildizga alohida** ishga tushiriladi.

## Shablon

```text
shop/
├── package.json                  workspaces: ["apps/*", "packages/*"]
├── apps/
│   ├── storefront/               ← FSD ildizi #1 (to'liq: app … shared)
│   │   ├── src/ app/ pages/ widgets/ features/ entities/ shared/
│   │   └── steiger.config.ts
│   └── admin/                    ← FSD ildizi #2
│       └── src/ app/ pages/ shared/            (kichik ilova — 3 qatlam yetarli)
├── packages/
│   ├── ui/                       ← "katta shared": dizayn tizimi
│   │   └── src/ button/ input/ modal/          paketning o'zi = shared/ui
│   ├── api-client/               ← OpenAPI'dan generatsiya, ikki ilova ishlatadi
│   └── catalog-domain/           ← FSD ildizi #3: faqat entities + shared
│       └── src/ entities/ product/ category/   shared/
└── services/
    └── bff/                      ← backend (FSD emas)
```

## Kod: paketni `shared` orqali ulash

Ilova ichida tashqi paket to'g'ridan-to'g'ri hamma joyda import qilinishi mumkin, lekin uni `shared` segmenti orqali o'rash ko'pincha qulayroq: almashtirish va moslashtirish bir joyda.

::: react
```ts
// apps/storefront/src/shared/ui/button/index.ts — paketni o'rash (ixtiyoriy)
export { Button } from '@shop/ui/button'

// apps/storefront/src/shared/api/index.ts
export { createApiClient } from '@shop/api-client'
export type { ProductDto } from '@shop/api-client'

// apps/storefront/src/pages/catalog/ui/CatalogPage.tsx
import { ProductCard } from '@shop/catalog-domain/entities/product'   // boshqa FSD ildizining public API'si
import { Button } from '@/shared/ui/button'
```
:::

::: vue
```ts
// apps/storefront/src/shared/ui/button/index.ts — paketni o'rash (ixtiyoriy)
export { BaseButton } from '@shop/ui/button'

// apps/storefront/src/shared/api/index.ts
export { createApiClient } from '@shop/api-client'
export type { ProductDto } from '@shop/api-client'

// apps/storefront/src/pages/catalog/ui/CatalogPage.vue (<script setup>)
import { ProductCard } from '@shop/catalog-domain/entities/product'   // boshqa FSD ildizining public API'si
import { BaseButton } from '@/shared/ui/button'
```
:::

::: angular
```ts
// apps/storefront/src/shared/ui/button/index.ts — paketni o'rash (ixtiyoriy)
export { Button } from '@shop/ui/button'

// apps/storefront/src/shared/api/index.ts
export { provideApiClient } from '@shop/api-client'
export type { ProductDto } from '@shop/api-client'

// apps/storefront/src/pages/catalog/ui/catalog-page.ts
import { ProductCard } from '@shop/catalog-domain/entities/product'   // boshqa FSD ildizining public API'si
import { Button } from '@/shared/ui/button'
```
:::

```jsonc
// packages/catalog-domain/package.json — paketning public API'si exports bilan
{
  "name": "@shop/catalog-domain",
  "exports": {
    "./entities/product": "./src/entities/product/index.ts",
    "./entities/category": "./src/entities/category/index.ts"
  }
}
```

```jsonc
// apps/storefront/package.json (har FSD paketida xuddi shunday)
{ "scripts": { "lint:fsd": "steiger src" } }
```

```bash
# Ildizdan: har paket o'z papkasida ishga tushadi va o'z steiger.config.ts'ini o'qiydi
npm run lint:fsd --workspaces --if-present
```

Diqqat (tekshirildi): `npx steiger apps/storefront/src` ni **ildizdan** ishga tushirsangiz, Steiger alias'larni to'g'ri hal qiladi, lekin paketning `steiger.config.ts`'ini o'qimaydi — config joriy papkadan qidiriladi va istisnolaringiz (12, 28-boblar) yo'qoladi. Shuning uchun har paketda o'z skripti.

## Qachon / qachon emas

| Monorepo'ga bo'ling | Bitta FSD ildizi yetarli |
| --- | --- |
| Ilovaning katta qismlari butunlay boshqa mas'uliyatda (muharrir vs fayl brauzeri) | Bitta mahsulot, bitta jamoa |
| Bir nechta ilova (do'kon, admin, mobil veb) bir dizayn tizimini ishlatadi | Faqat "papkalar ko'p" degani |
| Jamoalar mustaqil reliz qilishi kerak | Dev server barrel'lar tufayli sekin — avval 14-bobdagi choralar |
| Barrel'lar va qatlam hajmi dev serverni sezilarli sekinlashtirgan | |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `packages/shared-utils` — hamma narsa | Paket darajasidagi "axlat qutisi" | Yo'nalishli paketlar (`ui`, `api-client`, `date`) |
| Paket ichki fayliga chuqur import (`@shop/ui/src/button/Button`) | Paket public API'si chetlab o'tildi | `exports` va faqat ruxsat etilgan yo'llar |
| Bitta ilovaga kerak kodni paketga chiqarish | Versiyalash va ko'chirish xarajati behuda | Avval ilova ichida |
| Ikki ilova bir-birini import qiladi | Ilovalar bog'lanadi | Umumiy qismni paketga |
| Steiger faqat bitta ildizda | Qolgan paketlar tekshirilmaydi | Har FSD ildiziga alohida |

## Manbalar

- Rasmiy: *Public API — Worse performance of bundlers on large projects* (monorepo tavsiyasi) <https://feature-sliced.design/docs/reference/public-api>
- Rasmiy: *Overview — Is it right for me?* <https://feature-sliced.design/docs/get-started/overview>
- Saytda: [Arxitektura 74-bob — Monorepo va kod ulashish](../arxitektura/74-monorepo.md), [Arxitektura 43-bob — Dizayn tizimi](../arxitektura/43-dizayn-tizimi.md)
