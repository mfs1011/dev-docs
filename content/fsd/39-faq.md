# 39 — Tez-tez beriladigan savollar

[← Oldingi: Code review checklist](38-review-checklist.md) · [Mundarija](README.md) · [Keyingi: Shpargalka →](40-shpargalka.md)

## Qisqacha

FSD bilan ishlashda eng ko'p takrorlanadigan savollar va qisqa javoblar. Har javob yonida — batafsil bob. Rasmiy FAQ'dagi savollar ham shu yerda.

## Asoslar

| Savol | Javob | Bob |
| --- | --- | --- |
| FSD menga kerakmi? | Frontend **ilova** (kutubxona emas) va hozirgi tuzilma muammo tug'dirsa — ha. Ishlayotgan arxitekturani "moda uchun" almashtirmang | 1, 36 |
| Hamma qatlamlar shartmi? | Yo'q. Ko'pincha `app` + `pages` + `shared` dan boshlanadi | 2, 3 |
| O'z qatlamimni (`core`, `modules`) qo'shsam bo'ladimi? | Tavsiya etilmaydi — standart buziladi | 3 |
| `processes` qatlami-chi? | Eskirgan — `features` va `app`'ga ko'chiring | 3, 12 |
| Yangi boshlovchiga arxitektura kerakmi? | Rasmiy javob: "yo'qdan ko'ra ha" — tanaffuslar va yangi a'zolar bilan muammolar boshlanadi | 1 |
| Atomic Design bilan birga ishlatsa bo'ladimi? | FSD buni talab ham qilmaydi, taqiqlamaydi ham — masalan `ui` segmenti ichida | 7 |

## Qatlam tanlash

| Savol | Javob | Bob |
| --- | --- | --- |
| Feature va entity farqi? | Entity — ilova ishlaydigan real tushuncha (ot); feature — foydalanuvchiga qiymat beradigan harakat (fe'l) | 8, 9 |
| Bir sahifada ishlatiladigan komponent qayerga? | Sahifa ichiga | 2, 11 |
| Layout qayerda? | Oddiy — `shared/ui`; widget'li — `app` yoki slot bilan; ba'zan nusxa ko'chirish yaxshiroq | 24 |
| Login sahifa yoki dialog? | Sahifa — `pages/sign-in`; har joydan ochiladigan dialog — `widgets` | 22 |
| Token qayerda? | `shared/auth`/`shared/api` yoki `entities/session`; sahifada emas | 22 |
| `User` tipi qayerda? | Odatda `shared/api` (so'rov yonida) | 18, 23 |
| Entity'siz loyiha FSD hisoblanadimi? | Ha | 18 |

## Chegaralar

| Savol | Javob | Bob |
| --- | --- | --- |
| Feature boshqa feature'ni ishlatishi kerak bo'lsa? | Yuqori qatlamda yig'ing (slot/props); yoki birlashtiring; yoki domen mantiqini `entities`'ga | 15, 16 |
| Ikki entity bir-biriga ishora qiladi | `@x` (faqat entities) yoki birlashtirish | 15 |
| Pages/features/entities'ni bir-biriga joylasa bo'ladimi? | Ha, lekin yuqori qatlamda (rasmiy FAQ) | 16 |
| `index.ts` barrel'lar sekinlashtiradimi? | Katta loyihada — ha; `shared/ui` va `shared/lib`'da komponent bo'yicha index, segment index'larisiz | 14 |

## Asboblar

| Savol | Javob | Bob |
| --- | --- | --- |
| Linter bormi? | Steiger — rasmiy | 33 |
| Steiger `app/providers`'ni xato deydi | Rasmiy hujjatga zid — `app` uchun `segments-by-purpose`'ni o'chiring yoki nomni maqsad bo'yicha bering | 12, 33 |
| Steiger Next.js'da `_app`'ni typo deydi | `typo-in-layer-name`'ni o'chiring — boshqa qoidalar `_pages`'ni pages deb tushunadi | 28 |
| Steiger hamma slice'ni "no references" deydi | `tsconfig` `paths` noto'g'ri — Steiger importlarni shu orqali hal qiladi | 33, 34 |
| Steiger `src/assets` yoki `src/tests`'ni tekshiradimi? | Yo'q — qatlamdan tashqari papkalar tekshirilmaydi | 27, 35 |
| ESLint kerakmi? | IDE'da darhol ko'rish uchun — `no-restricted-imports` yoki `eslint-plugin-boundaries` | 34 |

## Framework'lar

| Savol | Javob | Bob |
| --- | --- | --- |
| Next.js `app/` va `pages/` bilan to'qnashuv | Ildizda Next papkalari (re-export), `src/_app`, `src/_pages` | 28 |
| Next 16'da `middleware.ts`? | `proxy.ts` deb qayta nomlangan, ildizda | 28 |
| Nuxt 4'da `app/` papkasi | Nuxt qobig'i; FSD `src/`'da, `@` → `src` | 30 |
| Angular uchun rasmiy qo'llanma bormi? | Yo'q — 31-bobdagi tekshirilgan shablon | 31 |
| Pinia store'lar / composable'lar qayerda? | Slice `model`'ida; `stores/`, `composables/` — taqiqlangan segment nomlari | 29 |
| Nuxt/Vue auto-import'lari? | Komponentlar uchun ishlatmang — importlar ko'rinmasa, chegaralar tekshirilmaydi | 29, 30 |

## Manbalar

- Rasmiy: *FAQ* <https://feature-sliced.design/docs/get-started/faq>
- Hamjamiyat: Telegram (feature_sliced), Discord, GitHub Discussions — rasmiy FAQ sahifasidagi havolalar
