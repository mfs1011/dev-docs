# 36 — Migratsiya

[← Oldingi: FSD'da testlash](35-testlash.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha: do'kon frontendi →](37-amaliy-loyiha.md)

## Qisqacha

Mavjud loyihani FSD'ga **bosqichma-bosqich** o'tkazish mumkin — yangi funksiyalarni to'xtatmasdan. Rasmiy yo'l: avval `@` alias, keyin kodni **sahifalarga** bo'lish, qolganini `shared` va `app`'ga ajratish, sahifalararo importlarni yo'qotish, `shared`'ni "ochish" va oxirida segmentlarga tartiblash. `entities`/`features` — ixtiyoriy, eng oxirida. Lekin eng muhim savol undan oldin: **bu sizga rostdan kerakmi?**

## Qoida: boshlashdan oldin

Rasmiy hujjat o'tish uchun uchta sababni sanaydi:
1. Yangi jamoa a'zolari samarali bo'lish qiyinligidan shikoyat qiladi.
2. Kodning bir qismini o'zgartirish **tez-tez** boshqa, bog'liq bo'lmagan qismni buzadi.
3. Yangi funksiya qo'shish o'ylash kerak bo'lgan narsalar ko'pligidan qiyin.

Va ikki ogohlantirish: **jamoa xohishiga qarshi o'tmang** (hatto lead bo'lsangiz ham) va menejmentni oldindan ko'ndiring — arxitektura o'zgarishi ularga darhol ko'rinmaydi. Ular uchun dalillar: migratsiya bosqichma-bosqich (yangi ishlar to'xtamaydi), yangi dasturchi tezroq samarali bo'ladi, FSD — hujjatlangan arxitektura (o'z hujjatingizni yuritish shart emas).

## Shablon: 8 qadam

```text
0. @ → src alias (34-bob)

1. Sahifalarga bo'lish
   routes/products.[id].jsx  →  routes/: faqat re-export;  pages/product/: komponent kodi + index.js
   Hozircha sahifalar bir-birini import qilsa — mayli.

2. Qolganini ajratish
   pages yoki routes'ni import QILMAYDIGAN hamma narsa → shared/
   pages yoki routes'ni import QILADIGAN hamma narsa (routes, App, index) → app/
   (shared slice'siz — ichida importlar erkin)

3. Sahifalararo importlarni yo'qotish — har biri uchun:
   a) nusxa ko'chirish (biznes mantiqi bo'lmasa — bu xato emas)
   b) shared'ning to'g'ri segmentiga: UI kit → shared/ui, konstanta → shared/config, backend → shared/api

4. shared'ni "ochish": faqat BITTA sahifa ishlatadigan narsa → o'sha sahifaga
   (actions, reducers, selectors ham — ularni guruhlab saqlashda foyda yo'q)

5. Segmentlarga tartiblash
   pages/*: ui, model (actions/reducers/selectors), api (thunks, mutatsiyalar)
   shared: components, containers → shared/ui;  helpers, utils → shared/lib/<yo'nalish>;  constants → shared/config

── ixtiyoriy ──
6. Bir nechta sahifa ishlatadigan Redux slice'lar → entities (har biri alohida); harakat bo'lsa → features
7. modules/ → ko'pincha features; katta UI bloklari (header) → widgets
8. shared/ui'ni toza qilish: biznes mantiqini yuqori qatlamlarga, kerak bo'lsa nusxa
```

Rasmiy hujjatning qisqa varianti (Overview): avval `app` va `shared`'ni modulma-modul shakllantiring → butun UI'ni `widgets` va `pages`'ga keng shtrixlar bilan taqsimlang (qoidalar buzilsa ham) → importlardagi buzilishlarni asta-sekin tuzating va `entities`/`features`'ni ajrating. Refaktoring paytida yangi katta entity'lar qo'shmang.

## Kod: 1-qadam — marshrut fayli va sahifa

::: react
```jsx
// src/app/routes/products.[id].jsx — faqat re-export
export { ProductPage as default } from '@/pages/product'

// src/pages/product/index.js
export { ProductPage } from './ui/ProductPage'

// src/pages/product/ui/ProductPage.jsx — oldingi routes/ faylidagi kod shu yerga
export function ProductPage(props) {
  /* … */
}
```
:::

::: vue
```ts
// src/app/routes/router.ts — marshrut faqat sahifani ko'rsatadi
{ path: '/products/:id', component: () => import('@/pages/product').then((m) => m.ProductPage) }

// src/pages/product/index.ts
export { default as ProductPage } from './ui/ProductPage.vue'
// src/pages/product/ui/ProductPage.vue — oldingi views/ProductView.vue kodi shu yerga
```
:::

::: angular
```ts
// src/app/routes/app.routes.ts — marshrut faqat sahifani ko'rsatadi
{ path: 'products/:id', loadComponent: () => import('@/pages/product').then((m) => m.ProductPage) }

// src/pages/product/index.ts
export { ProductPage } from './ui/product-page'
// src/pages/product/ui/product-page.ts — oldingi app/products/product-detail.component.ts kodi shu yerga
```
:::

## Kod: Steiger bilan bosqichma-bosqich

```bash
npx steiger src --ignore-warnings          # avval faqat xatolar
npx steiger src --fix                      # avto-tuzatiladiganlar (masalan yetishmayotgan public API)
npx steiger src --reporter json > fsd.json # qoida bo'yicha sanash — progressni kuzatish
```

Mavjud loyihada xatolar ko'p bo'lsa, qoidalarni **bosqichma-bosqich** yoqing: avval `forbidden-imports` va `public-api`, keyin `no-public-api-sidestep`, eng oxirida `insignificant-slice` va `segments-by-purpose`. Yangi kodda yangi buzilishga yo'l qo'ymaslik — eski xatolarni kamaytirishdan muhimroq.

## Versiyalar orasida

| O'tish | Asosiy o'zgarishlar |
| --- | --- |
| **v1 → v2** | Qatlamlar yuqori darajada aniq ajratildi; `/ui`, `/lib`, `/api` ildizdan `shared/`'ga ko'chdi; `entities` va `processes` qatlamlari qo'shildi; qatlam va segment nomlari standartlashtirildi (eski `core`, `common`, `components`, `containers`, `utils`, `helpers`, `store` o'rniga) |
| **v2.0 → v2.1** | Buzuvchi o'zgarish yo'q. Yangi fikrlash modeli — pages-first (2-bob); `@x` standartlashtirildi (15-bob); `processes` eskirgan. Steiger `insignificant-slice` va `excessive-slicing` bilan keraksiz slice'larni birlashtirish (33-bob) |

## Qachon / qachon emas

| Holat | Tavsiya |
| --- | --- |
| Jamoa qarshi | Avval muammoni birgalikda ko'ring; FSD — yechimlardan biri |
| Kichik ilova, muammo yo'q | O'tkazmang |
| Katta ilova, tez-tez regressiyalar | Bosqichma-bosqich, 1–5-qadamlar |
| Framework ham almashadi (Vue 2 → 3, NgModule → standalone) | Bir vaqtda ikki katta o'zgarish qilmang — avval framework yoki avval tuzilma |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Katta portlash" — hammasini bir PR'da | Konfliktlar, to'xtab qolgan reliz | Qadamlar, kichik PR'lar |
| 1-qadamda darhol `entities`/`features` qidirish | Noto'g'ri dekompozitsiya | Avval pages, shared, app |
| `shared`'ni "ochmaslik" | Hamma narsa poydevorda — har o'zgarish hammaga ta'sir | 4-qadam |
| Nusxa ko'chirishdan qo'rqish | Sun'iy abstraksiyalar | Biznes mantiqisiz kodni nusxalash normal |
| Biznes mantiqini nusxalash | Bir bug — bir necha joyda | Bitta joyga, public API bilan |

## Manbalar

- Rasmiy: *From a custom architecture* <https://feature-sliced.design/docs/guides/migration/from-custom>
- Rasmiy: *Migration from v1 to v2* <https://feature-sliced.design/docs/guides/migration/from-v1>
- Rasmiy: *Migration from v2.0 to v2.1* <https://feature-sliced.design/docs/guides/migration/from-v2-0>
- Saytda: [Arxitektura 82-bob — Legacy bilan ishlash](../arxitektura/82-legacy.md), [Angular 69-bob — NgModule migratsiyasi](../angular/69-ngmodule-migratsiya.md)
