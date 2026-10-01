# 33 — Steiger

[← Oldingi: Monorepo va bir nechta FSD ildizi](32-monorepo.md) · [Mundarija](README.md) · [Keyingi: ESLint, TypeScript va alias'lar →](34-eslint-va-alias.md)

## Qisqacha

**Steiger** — FSD'ning rasmiy arxitektura linteri. U papka tuzilmasini va importlarni o'qib, FSD qoidalari buzilganini topadi: yuqoriga import, cross-import, public API'ni chetlab o'tish, noto'g'ri segment nomlari, bir marta ishlatilgan slice'lar. FSD qoidalari faqat kelishuvda qolsa — bir oyda buziladi; Steiger ularni CI'da majburiy qiladi. Bu bobdagi hamma xabar va raqam **steiger 0.7.0 + @feature-sliced/steiger-plugin 0.8.0** bilan real loyihalarda olingan.

## Qoida: o'rnatish va ishga tushirish

```bash
npm i -D steiger @feature-sliced/steiger-plugin
npx steiger src                 # bir marta tekshirish
npx steiger src --watch         # o'zgarishlarni kuzatish
npx steiger src --fix           # avtomatik tuzatiladiganlarini tuzatish
```

| Parametr | Ma'no |
| --- | --- |
| `--watch`, `-w` | Fayl o'zgarishlarini kuzatadi |
| `--fix` | Avto-tuzatishlarni qo'llaydi (masalan yetishmayotgan public API) |
| `--fail-on-warnings` | Ogohlantirishlarda ham xato kodi bilan chiqadi |
| `--ignore-warnings` | Faqat xatolarni ko'rsatadi |
| `--reporter json` | Mashina o'qiydigan natija (CI integratsiyasi uchun) |

Xato topilsa Steiger **`exit 1`** bilan chiqadi — CI shu bilan to'xtaydi.

```ts
// steiger.config.ts — loyiha ildizida (Steiger config'ni JORIY papkadan qidiradi)
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  // Tavsiya etilgan sozlamada yo'q, lekin foydali ikki qoida (14-bob):
  { rules: { 'fsd/import-locality': 'error', 'fsd/no-wildcard-exports': 'error' } },
])
```

Muhim: Steiger importlarni **`tsconfig` `paths`** orqali hal qiladi. `@/` alias'i noto'g'ri sozlangan bo'lsa, u importlarni topolmaydi va slice'larni "hech kim ishlatmaydi" deb xato beradi — qoidalarni emas, avval `paths`'ni tekshiring.

## Shablon: qoidalar

Tavsiya etilgan sozlamada 17 qoida, hammasi `error`:

| Qoida | Nimani ushlaydi | Misol xabar |
| --- | --- | --- |
| `forbidden-imports` | Yuqoriga import va cross-import | `Forbidden import from higher layer "pages".` / `Forbidden cross-import from slice "product".` |
| `no-public-api-sidestep` | Slice ichki fayliga chuqur import | `Forbidden sidestep of public API when importing from "@/entities/product/lib/format-price".` |
| `public-api` | Slice/segmentda `index.ts` yo'q | `This slice is missing a public API.` |
| `insignificant-slice` | Bir marta yoki hech ishlatilmagan slice | `This slice has only one reference in slice "pages/product". Consider merging them.` |
| `excessive-slicing` | Qatlamda juda ko'p slice | 20 tadan ko'p guruhlanmagan slice (pages, widgets, features, entities har biri) |
| `segments-by-purpose` | Mohiyat bo'yicha segment nomlari | `This segment's name should describe the purpose of its contents, not what the contents are.` |
| `no-segmentless-slices` | Segmentsiz slice | `This slice has no segments. Consider dividing the code inside into segments.` |
| `no-segments-on-sliced-layers` | `features/ui` kabi — slice o'rnida segment | `Conventional segment "ui" should not be a direct child of a sliced layer…` |
| `no-layer-public-api` | `features/index.ts` kabi qatlam index'i | `Layer "features" should not have an index file` |
| `no-ui-in-app` | `app/ui` | `Layer "app" should not have "ui" segment.` |
| `shared-lib-grouping` | `shared/lib`'da 15 tadan ko'p modul | `Shared/lib has N modules, which is above the recommended threshold of 15.` |
| `ambiguous-slice-names` | Slice nomi `shared` segmenti bilan bir xil | `Slice "api" could be confused with a segment from Shared…` |
| `inconsistent-naming` | Entity nomlari aralash birlik/ko'plik | `… Prefer all singular names` |
| `repetitive-naming` | Slice nomlarida takrorlanuvchi so'z | `Repetitive word "page" in slice names.` |
| `no-reserved-folder-names` | Segment ichida `@x` yoki segment nomli papka | |
| `typo-in-layer-name` | Qatlam nomida xato | `Layer "_app" potentially contains a typo. Did you mean "app"?` |
| `no-processes` | Eskirgan `processes` qatlami | `Layer "processes" is deprecated, avoid using it` |

Tavsiya etilgan sozlamadan tashqarida yana 4 qoida bor: `import-locality` (slice ichida nisbiy, slice'lar orasida absolyut import — `shared` va `app` ham bitta slice hisoblanadi), `no-wildcard-exports` (`export *`), shuningdek `no-cross-imports` va `no-higher-level-imports` (`forbidden-imports`'ning alohida qismlari).

**`segments-by-purpose` rad etadigan nomlar:** `components`, `helpers`, `utils`, `constants`, `types`, `store`/`stores`, `modals`, `services`, `enums`, `interfaces`, `schemas`, `handlers`, `middlewares`, `validators`, `resolvers`, `mutations`, `assets`, `hooks`, `context`, `providers`, `composables`, `directives`, `actions`, `reducers`, `selectors`, `effects`, `sagas`, `thunks`, `pipes`.

## Kod: istisnolar

Qoidani butun loyihada yoki bir qismida o'chirish — ESLint flat config'iga o'xshash:

```ts
export default defineConfig([
  ...fsd.configs.recommended,
  // app/providers va app/store — rasmiy hujjatdagi nomlar, Steiger esa ularni rad etadi (12-bob)
  { files: ['./src/app/**'], rules: { 'fsd/segments-by-purpose': 'off' } },
  // Next.js: src/_app va src/_pages (28-bob) — boshqa qoidalar ularni app/pages deb tushunadi
  { rules: { 'fsd/typo-in-layer-name': 'off' } },
])
```

Har istisno — ongli qaror: izoh yozing, nega o'chirilganini va qachon qayta ko'rilishini.

## Kod: CI

```jsonc
// package.json
{ "scripts": { "lint:fsd": "steiger src" } }
```

```yaml
# .github/workflows/ci.yml (qism)
- run: npm ci
- run: npm run lint:fsd        # exit 1 → PR qizil
- run: npm run build
```

Mavjud katta loyihaga birinchi marta qo'shilganda yuzlab xato chiqishi mumkin. Strategiya: avval `--ignore-warnings` bilan faqat xatolarni ko'ring, `--fix` bilan avtomatiklarini tuzating, qolganini qoida bo'yicha guruhlab bosqichma-bosqich (yangi buzilishlarga yo'l qo'ymay) kamaytiring — 36-bob.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| `insignificant-slice` haqmi? | Ko'pincha ha — v2.1 ning "bir marta ishlatilsa — sahifada" tamoyili. Yangi slice birinchi ikkinchi foydalanuvchisini kutayotgan bo'lsa — vaqtincha normal |
| `src/assets/` kabi qatlamdan tashqari papka | Steiger uni **tekshirmaydi** — shuning uchun u yerga hech narsa qo'ymang |
| Monorepo | Har paket o'z papkasida, o'z config'i bilan (32-bob) |
| ESLint kerakmi? | Steiger arxitekturani tekshiradi; IDE'da darhol ogohlantirish va import tartibi uchun ESLint qo'shimcha (34-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Steiger faqat lokal, CI'da yo'q | Birinchi shoshilinch PR'da buziladi | `lint:fsd` CI'da |
| Xatolarni ko'rib chiqmasdan qoidani o'chirish | Arxitektura jimgina eroziyaga uchraydi | Faqat asoslangan istisno, izoh bilan |
| `tsconfig` `paths` noto'g'ri | Soxta "no references" xatolari | `"@/*": ["./src/*"]` |
| Monorepo ildizidan `npx steiger apps/x/src` | Paketning `steiger.config.ts`'i o'qilmaydi | Paket papkasida ishga tushirish |

## Manbalar

- Steiger <https://github.com/feature-sliced/steiger>
- Rasmiy: *Migration from v2.0 to v2.1* (`insignificant-slice`, `excessive-slicing`) <https://feature-sliced.design/docs/guides/migration/from-v2-0>
