# 38 — Modul tuzilmasi

[← Oldingi: Render strategiyasi](37-render-strategiyasi.md) · [Mundarija](README.md) · [Keyingi: Komponent API dizayni →](39-komponent-api.md)

## Tushuncha

Frontend kodini tashkil qilishning uch asosiy yondashuvi:

| Yondashuv | Tuzilma | Qachon |
| --- | --- | --- |
| **Texnik papkalar** | `components/`, `services/`, `store/`, `utils/` | Juda kichik ilova, prototip |
| **Feature-based** | `features/cart/`, `features/checkout/` + `shared/` | O'rta ilovalar — ko'p loyihada yetarli |
| **Qatlamli + slice'lar (FSD)** | `app → pages → widgets → features → entities → shared`, har qatlamda slice'lar | Katta ilova, ko'p dasturchi, uzoq muddat |

Bu bob — tamoyillar. **Feature-Sliced Design'ning to'liq tafsiloti, qoidalari va tayyor shablonlari — alohida FSD qo'llanmasida.**

## Nega shunday

Texnik papkalar kichik ilovada qulay, lekin 50+ komponentda muammo: `components/` ichida 200 fayl, qaysi biri qaysi feature'ga tegishli — noma'lum; bitta feature'ni o'zgartirish — 5 papkani aylanish (16-bob). Feature-based tuzilma buni hal qiladi, lekin savol qoladi: **feature'lar orasidagi umumiy kod qayerda?** FSD aynan shu savolga qat'iy javob beradi — qatlamlar va import qoidalari bilan.

## Psevdokod: uch qoida — har qanday tuzilmada

```text
1. Import yo'nalishi — faqat bir tomonga (yuqoridan pastga)
     pages → features → entities → shared         ✅
     shared → features                             ❌ (shared biznesdan xabarsiz)
     features/cart → features/checkout             ❌ (bir qatlamdagi slice'lar bir-birini bilmaydi)

2. Har slice — ochiq API orqali (11-bob)
     import { AddToCart } from "features/add-to-cart"          ✅
     import { x } from "features/add-to-cart/model/internal"   ❌

3. Kod qayerda yashashi — ishlatilishiga qarab
     bitta feature ishlatadi       → o'sha feature ichida
     ko'p feature, biznes tushuncha → entities/
     biznesdan mustaqil            → shared/
```

## Psevdokod: namuna tuzilma (FSD uslubida)

```text
src/
├── app/            # ilova: provayderlar, marshrutlar, global stillar
├── pages/          # sahifalar: product-page, cart-page
├── widgets/        # mustaqil katta bloklar: header, product-reviews
├── features/       # foydalanuvchi amallari: add-to-cart, apply-promo, auth-by-phone
├── entities/       # biznes ob'ektlari: product, order, user (tip, API, UI kartalar)
└── shared/         # ui-kit, api-client, config, lib
                    # ichida ham "segmentlar": ui/, model/, api/, lib/, config/
```

Har slice ichida — **segmentlar** (texnik maqsad bo'yicha):

```text
features/add-to-cart/
├── ui/          AddToCartButton
├── model/       holat, hodisalar, store
├── api/         so'rovlar
├── lib/         yordamchilar
└── index        ochiq API
```

## Psevdokod: qoidalarni majburlash

```text
ESLint (eslint-plugin-boundaries yoki @feature-sliced/eslint-config / steiger):
  qatlam A faqat pastdagi qatlamlarni import qila oladi
  bir qatlamdagi slice'lar bir-birini import qilmaydi
  slice'ga faqat index orqali
CI'da — buzilish PR'ni to'xtatadi
```

Qoida faqat hujjatda bo'lsa — 3 oyda buziladi (4, 11-boblar).

## Framework'larda

Tuzilma framework'dan deyarli mustaqil — faqat "app" va "pages" qatlamlari framework konvensiyasiga moslashadi:

| Framework | Moslashuv | Qayerda |
| --- | --- | --- |
| Angular | `app/` — `app.config.ts`, marshrutlar; `pages/` — lazy `loadComponent`; har slice — standalone komponentlar va `@Service()`lar | [Angular 78-bob](../angular/78-amaliy-loyiha.md) (soddalashtirilgan variant) |
| React | `app/` — providerlar, router; hook'lar `model/` segmentida | [React 34-bob](../react/34-arxitektura.md) |
| Vue | `app/` — `createApp`, plugin'lar; composable'lar `model/` da, Pinia store'lar entity/feature ichida | [Vue 6-bob](../vue/06-loyiha-tuzilmasi-va-vite.md) |
| Next.js | App Router `app/` va Pages Router `pages/` papkalari band — rasmiy tavsiya: FSD qatlamlarini `src/_app` va `src/_pages` deb nomlash, Next papkalaridan re-export qilish ([FSD qo'llanmasi](../fsd/README.md), V qism) | [Next.js 7-bob](../nextjs/07-marshrutlash.md) |

Next.js konflikti — FSD bilan eng ko'p uchraydigan amaliy muammo: framework `app/` va `pages/` nomlarini o'zi ishlatadi. FSD qo'llanmasida har framework uchun tayyor shablon bo'ladi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Texnik papkalar | Oddiy, framework sukutiga mos | O'sganda tartibsizlik |
| Feature-based | Lokal o'zgarishlar | "Umumiy kod qayerda?" — har safar bahs |
| FSD | Qat'iy, bashorat qilinadigan, onboarding tez | O'rganish egri chizig'i; kichik loyihaga og'ir; "bu feature'mi yoki entity'mi?" savollari |

**Boshlash tavsiyasi:** feature-based + uch qoida. Loyiha 3+ dasturchi va 6+ oyga o'sganda — FSD'ga bosqichma-bosqich o'tish (qatlamlar avval, qoidalar keyin).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `shared/` ga biznes kod | Hamma narsa hamma narsaga bog'lanadi | Biznes — `entities/` |
| Slice'lar bir-birini import qiladi | Yashirin bog'lanish | Umumiy qism pastki qatlamga yoki kompozitsiya yuqori qatlamda |
| Chuqur importlar | Ochiq API ma'nosiz | Faqat `index` |
| Hamma narsa `features/` | Feature va entity farqi yo'qoladi | Feature — amal, entity — tushuncha |
| Qoidalar lint'siz | Tez buziladi | ESLint/steiger CI'da |
| Kichik loyihaga to'liq FSD | Ortiqcha marosim | Feature-based'dan boshlash |

## Amaliyot

1. Joriy tuzilmangizda "yuqoriga" ketayotgan importlarni sanang.
2. Bitta feature uchun `index` ochiq API yarating.
3. ESLint bilan import yo'nalishi qoidasini qo'shing.
4. Mavjud kodni FSD qatlamlariga ajratish xaritasini chizing: qaysi papka qaysi qatlamga tushadi?

## Manbalar

- Feature-Sliced Design: <https://feature-sliced.design>
- Steiger (FSD linter): <https://github.com/feature-sliced/steiger>
- eslint-plugin-boundaries: <https://github.com/javierbrea/eslint-plugin-boundaries>
