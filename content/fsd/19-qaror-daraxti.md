# 19 — Qaror daraxti: kod qayerga?

[← Oldingi: Ortiqcha entity'lar](18-ortiqcha-entitylar.md) · [Mundarija](README.md) · [Keyingi: API so'rovlari →](20-api-sorovlari.md)

## Qisqacha

FSD bilan ishlashdagi eng ko'p savol: **"bu fayl qayerga boradi?"** Bu bob — bitta diagramma va 30 ta tipik holat uchun tayyor javob. Asosiy tamoyil: **eng lokal joydan boshlang**, qayta ishlatish paydo bo'lgandagina pastga tushiring.

## Qoida: diagramma

```text
                         Yangi kod
                             │
          Ilovani ishga tushirish / sozlash / ulashmi?  ── ha ──▶  app
          (router, provayder, global stil, analitika)
                             │ yo'q
          Biznesdan butunlay xoli va loyihadan       ── ha ──▶  shared
          tashqarida ham ma'nosi bormi?                         (ui / api / lib / config / routes / i18n)
          (tugma, HTTP klient, formatDate)
                             │ yo'q
          Faqat BITTA sahifada ishlatiladimi?       ── ha ──▶  pages/<sahifa>   ← ko'p hollarda javob shu
                             │ yo'q (2+ joyda)
          Katta mustaqil UI blokimi                 ── ha ──▶  widgets
          (header, filtrlar paneli, izohlar bo'limi)?
                             │ yo'q
          Foydalanuvchi HARAKATImi                  ── ha ──▶  features
          (qo'shish, yuborish, kirish, baholash)?
                             │ yo'q
          Biznes OBYEKTI, uning ko'rinishi          ── ha ──▶  entities
          yoki qoidasimi?
                             │ yo'q
          Qaytadan o'ylang: ehtimol bu shared/lib yoki sahifa ichida
```

Keyin segment: ko'rinish → `ui`, backend → `api`, holat/sxema/qoida → `model`, slice ichidagi yordamchi → `lib`, sozlama → `config`.

## Shablon: 30 ta tipik holat

| # | Kod | Qayerga | Bob |
| --- | --- | --- | --- |
| 1 | Tugma, input, modal, tooltip | `shared/ui/<komponent>` | 7 |
| 2 | Kompaniya logosi | `shared/ui/logo` | 7 |
| 3 | Biznessiz sahifa karkasi (header/footer joylari) | `shared/ui/layout` | 24 |
| 4 | Ichida widget'lar bor layout | `app/layouts` yoki slot bilan | 24 |
| 5 | HTTP klient (baseURL, sarlavhalar, xatolar) | `shared/api/client` | 20 |
| 6 | Oddiy CRUD so'rovlari | `shared/api/endpoints/<resurs>` | 18, 20 |
| 7 | Faqat bir sahifa ishlatadigan so'rov | `pages/<sahifa>/api` | 20 |
| 8 | OpenAPI'dan generatsiya qilingan klient | `shared/api/openapi` | 20 |
| 9 | TanStack Query kalitlari va query factory'lar | `shared/api` (umumiy) yoki slice `api` | 21 |
| 10 | Token, joriy foydalanuvchi | `shared/auth` (yoki `entities/session`) | 22 |
| 11 | Login sahifasi | `pages/sign-in` | 22 |
| 12 | Har sahifadan ochiladigan login dialogi | `widgets/login-dialog` | 22 |
| 13 | Chiqish (logout) tugmasi | Uni ko'rsatadigan widget'da (header) | 22 |
| 14 | Muhit o'zgaruvchilari | `shared/config` | 7 |
| 15 | Global feature flag | `shared/config`; slice'ga xos — `<slice>/config` | 5, 7 |
| 16 | Marshrut konstantalari (URL'lar) | `shared/routes` | 7, 26 |
| 17 | Router konfiguratsiyasi, guard'larni ulash | `app/routes` | 12, 26 |
| 18 | `formatDate`, `Money`, `debounce` | `shared/lib/<yo'nalish>` | 7 |
| 19 | Faqat bir komponentga kerak formatlovchi | Komponent yonida (`ui`) | 5 |
| 20 | Mahsulot kartasi — 2+ sahifada | `entities/product/ui` | 8 |
| 21 | Mahsulot kartasi — faqat katalogda | `pages/catalog/ui` | 2, 11 |
| 22 | "Savatga qo'shish" — 2+ sahifada | `features/add-to-cart` | 9 |
| 23 | Parolni o'zgartirish — faqat sozlamalarda | `pages/settings` | 9 |
| 24 | Narx/chegirma qoidasi — 2+ joyda | `entities/<obyekt>/model` | 8, 18 |
| 25 | Header | `widgets/header` | 10 |
| 26 | Global stil, reset, shriftlar | `app/styles`, `app/fonts` | 12, 25 |
| 27 | Faqat bir sahifadagi rasm | `pages/<sahifa>/ui` yonida | 25 |
| 28 | Tarjima sozlamasi va global satrlar | `shared/i18n` | 25 |
| 29 | Validatsiya sxemasi (Zod) — forma uchun | Forma slice'ining `model` | 23 |
| 30 | Next.js Route Handler | `_app/api-routes` | 28 |

## Kod: bitta element hayoti

`ProductRating` (yulduzchalar) misolida — joy ehtiyojga qarab o'zgaradi:

::: react
```text
1-hafta: faqat mahsulot sahifasi         → pages/product/ui/ProductRating.tsx
3-hafta: katalog kartasida ham kerak     → entities/product/ui/ProductRating.tsx
         (mahsulotga bog'liq ko'rinish)     + export { ProductRating } from './ui/ProductRating'
5-hafta: "baho qo'yish" harakati qo'shildi → features/rate-product/ui/RateProduct.tsx
         (ProductRating'ni ichida ishlatadi — features → entities ✅)
8-hafta: sharhlar va baholar butun blok,  → widgets/product-reviews
         mahsulot va do'kon sahifalarida
```
:::

::: vue
```text
1-hafta: faqat mahsulot sahifasi         → pages/product/ui/ProductRating.vue
3-hafta: katalog kartasida ham kerak     → entities/product/ui/ProductRating.vue
         (mahsulotga bog'liq ko'rinish)     + export { default as ProductRating } from './ui/ProductRating.vue'
5-hafta: "baho qo'yish" harakati qo'shildi → features/rate-product/ui/RateProduct.vue
         (ProductRating'ni ichida ishlatadi — features → entities ✅)
8-hafta: sharhlar va baholar butun blok,  → widgets/product-reviews
         mahsulot va do'kon sahifalarida
```
:::

::: angular
```text
1-hafta: faqat mahsulot sahifasi         → pages/product/ui/product-rating.ts
3-hafta: katalog kartasida ham kerak     → entities/product/ui/product-rating.ts
         (mahsulotga bog'liq ko'rinish)     + export { ProductRating } from './ui/product-rating'
5-hafta: "baho qo'yish" harakati qo'shildi → features/rate-product/ui/rate-product.ts
         (ProductRating'ni ichida ishlatadi — features → entities ✅)
8-hafta: sharhlar va baholar butun blok,  → widgets/product-reviews
         mahsulot va do'kon sahifalarida
```
:::

## Qachon / qachon emas

Shubha bo'lsa:
- **Sahifada qoldiring.** Keyin ko'chirish — oson va xavfsiz; noto'g'ri pastga tushirilgan kodni yuqoriga qaytarish qiyinroq (ko'p joy unga bog'langan).
- **Feature yoki entity?** Fe'l bo'lsa (`add`, `rate`, `cancel`) — feature; ot bo'lsa (`product`, `order`) — entity.
- **Widget yoki feature?** Bitta harakat — feature; bir nechta harakat va ko'rinishni birlashtirgan katta blok — widget.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Kelajakda kerak bo'ladi" deb pastga | Bir martalik slice'lar | Haqiqiy ikkinchi foydalanuvchini kutish |
| Bir xil narsa ikki qatlamda nusxa | Farqlanib ketadi | Bir joyga, public API orqali |
| `shared`'ga "qayerga qo'yishni bilmadim" kodi | `shared` axlat qutisiga aylanadi | Diagramma bo'yicha qayta o'ylash |
| Har qaror uchun uzoq bahs | Vaqt isrofi | Shu jadval + jamoa kelishuvi (ADR) |

## Manbalar

- Rasmiy: *Layers — Layer definitions* <https://feature-sliced.design/docs/reference/layers>
- Rasmiy: *Tutorial* <https://feature-sliced.design/docs/get-started/tutorial>
