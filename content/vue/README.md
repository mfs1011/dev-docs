# Vue 3 — noldan senior darajasigacha

Bu qo'llanma **rasmiy hujjat** (<https://vuejs.org>) tuzilmasini to'liq qamrab oladi va uning ustiga real loyihada kerak bo'ladigan narsalarni qo'shadi: router, Pinia, TypeScript, testlash, SSR/Nuxt, unumdorlik, xavfsizlik, deploy. Versiyalar npm registry'dan tekshirilgan (2026-yil sentabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Vue | 3.5.43 (stable) | `npm view vue version` |
| Vue (keyingi minor) | 3.6.0-rc.9 (Vapor mode, alien-signals) | `npm view vue dist-tags` |
| Vue Router | 5.3.1 | `npm view vue-router version` |
| Pinia | 4.0.3 | `npm view pinia version` |
| Vite | 8.3.0 | `npm view vite version` |
| Vitest | 5.0.1 | `npm view vitest version` |
| @vue/test-utils | 2.5.1 | `npm view @vue/test-utils version` |
| Nuxt | 4.5.2 | `npm view nuxt version` |

> **Versiya siyosati.** Vue 3 — yagona aktiv major. Vue 2 qo'llab-quvvatlashi 2023-yil 31-dekabrda tugagan (hatto xavfsizlik yamog'i ham chiqmaydi). Minor versiyalar (3.4 → 3.5 → 3.6) orqaga moslikni buzmaydi; yangi imkoniyat qo'shiladi, eskisi deprecated bo'ladi-yu ishlashda davom etadi. Qo'llanmadagi kod **3.5** uchun yozilgan; 3.6 olib keladigan o'zgarishlar (Vapor mode, yangi reaktivlik yadrosi) 47-bobda alohida ko'rsatilgan.

---

## Bu qo'llanma kimga

Ikki xil odam uchun yozilgan:

1. **Noldan boshlovchi.** Siz HTML, CSS va JavaScript asoslarini bilasiz (o'zgaruvchi, funksiya, massiv metodlari, `async/await`, ES modullar). Vue'ni umuman ko'rmagansiz. Birinchi bobdan ketma-ket o'qing — hech bir bob o'zidan keyingi bobning bilimini talab qilmaydi.
2. **Vue yozadigan, lekin "nega shunday" ini bilmaydigan dasturchi.** Siz `ref()` yozasiz, lekin `ref` va `reactive` farqini aniq aytib bera olmaysiz; `key` qo'yasiz, lekin u yo'qolganda nima buzilishini bilmaysiz. Sizga 07, 09, 17, 46, 47-boblar va har bobdagi "Muhandislik nuqtai nazari" bo'limlari kerak.

Har bobning skeleti bir xil:

- **Tushuncha** — nima va qaysi muammoni yechadi.
- **Nega shunday** — Vue jamoasi nega aynan shu dizaynni tanlagan, ichkarida nima bo'ladi.
- **Kod** — ishlaydigan, to'liq misollar. Qisqartirilgan `...` minimal.
- **Muhandislik nuqtai nazari** — umumiy dasturlash bilimi (brauzer ishlashi, DOM, hodisa sikli, keshlash, immutability, ma'lumot oqimi dizayni) aynan Vue kontekstida.
- **Tipik xatolar** — jadval: noto'g'ri yondashuv → nega yomon → to'g'ri yechim.
- **Amaliyot** — mashq. Mashqlar bir-biriga ulanadi va 69-bobdagi to'liq loyihaga yig'iladi.
- **Rasmiy hujjat** — o'sha mavzuning `vuejs.org/...` havolasi.

---

## Options API va Composition API

Vue'da bir xil komponentni ikki xil yozish mumkin. Rasmiy hujjatdagi kabi bu qo'llanmada ham **yuqoridagi almashtirgich** (`Options` / `Composition`) orqali istalgan paytda uslubni almashtirasiz — sahifadagi mos misollar avtomatik o'zgaradi. Ikkalasi bir xil dvigatelning ikki interfeysi: Composition API'da yozilgan narsani Options API'da ham yozish mumkin va aksincha.

Qisqa tavsiya: **yangi loyihada — Composition API + `<script setup>`**. Sabab 05-bobda batafsil.

---

## I qism — Poydevor (1–7)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [Vue nima va nega shunday](01-kirish.md) | Deklarativ render, reaktivlik, progressive framework |
| 02 | [O'rnatish va ishga tushirish](02-ornatish-va-ishga-tushirish.md) | CDN, `npm create vue@latest`, birinchi ilova |
| 03 | [Ilova yaratish va sozlash](03-ilova-yaratish.md) | `createApp`, `mount`, `app.config`, bir nechta ilova |
| 04 | [Vue'dan foydalanish usullari](04-foydalanish-usullari.md) | SPA, MPA, web component, SSR/SSG, o'rnatilgan vidjet |
| 05 | [Ikki API uslubi](05-ikki-api-uslubi.md) | Options vs Composition, `<script setup>`, qaysi birini tanlash |
| 06 | [Loyiha tuzilmasi va Vite](06-loyiha-tuzilmasi-va-vite.md) | Papkalar, HMR, `import.meta.env`, build |
| 07 | [Reaktivlik mental modeli](07-reaktivlik-mental-modeli.md) | Signal/effekt, Proxy, nega `.value` bor |

## II qism — Shablon va reaktivlik (8–17)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 08 | [Shablon sintaksisi](08-shablon-sintaksisi.md) | Interpolyatsiya, `v-bind`, direktiva anatomiyasi |
| 09 | [Reaktivlik asoslari](09-reaktivlik-asoslari.md) | `ref`, `reactive`, `data()`, DOM yangilanish vaqti |
| 10 | [Hisoblanuvchi xossalar](10-computed.md) | `computed`, kesh, yozuvchi computed |
| 11 | [Class va style bog'lash](11-class-va-style.md) | Obyekt/massiv sintaksisi, komponentga class berish |
| 12 | [Shartli render](12-shartli-render.md) | `v-if`, `v-show`, `<template>` bilan guruhlash |
| 13 | [Ro'yxat render](13-royxat-render.md) | `v-for`, `key`, massiv mutatsiyasi, filtr/sort |
| 14 | [Hodisalar](14-hodisalar.md) | `v-on`, modifikatorlar, hodisa obyekti |
| 15 | [Forma bog'lash (`v-model`)](15-forma-bogash.md) | Input turlari, `.lazy/.number/.trim` |
| 16 | [Kuzatuvchilar](16-watch-va-watcheffect.md) | `watch`, `watchEffect`, `flush`, to'xtatish |
| 17 | [Reaktivlik: chuqur qatlam](17-reaktivlik-chuqur.md) | `toRef`, `shallowRef`, `effectScope`, Proxy chegaralari |

## III qism — Komponentlar (18–28)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 18 | [Shablon ref'lari](18-shablon-reflari.md) | `useTemplateRef`, DOM elementiga kirish |
| 19 | [Komponent asoslari](19-komponent-asoslari.md) | Import, ierarxiya, bitta ildiz qoidasi |
| 20 | [Hayot sikli](20-hayot-sikli.md) | `onMounted` … `onUnmounted`, tozalash |
| 21 | [Registratsiya](21-registratsiya.md) | Global va lokal, nomlash konvensiyasi |
| 22 | [Props](22-props.md) | Deklaratsiya, validatsiya, bir tomonlama oqim |
| 23 | [Emits](23-emits.md) | `defineEmits`, validatsiya, native hodisalar |
| 24 | [Komponent `v-model`](24-komponent-v-model.md) | `defineModel`, bir nechta model, modifikator |
| 25 | [Fallthrough atributlar](25-fallthrough-atributlar.md) | `$attrs`, `inheritAttrs`, ko'p ildizli komponent |
| 26 | [Slotlar](26-slotlar.md) | Nomli, scoped, shartli slot, renderless komponent |
| 27 | [Provide / inject](27-provide-inject.md) | Chuqur uzatish, reaktiv provide, symbol kalit |
| 28 | [Async komponentlar](28-async-komponentlar.md) | `defineAsyncComponent`, yuklanish/xato holati |

## IV qism — Qayta ishlatish va ichki komponentlar (29–36)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 29 | [Composables](29-composables.md) | Mantiqni ajratish, konvensiya, hayot sikli bog'lash |
| 30 | [Custom direktivalar](30-custom-direktivalar.md) | Hooklar, argument, qachon kerak emas |
| 31 | [Pluginlar](31-pluginlar.md) | `app.use`, global xossalar, kutubxona yozish |
| 32 | [Transition](32-transition.md) | CSS klasslari, JS hooklari, rejimlar |
| 33 | [TransitionGroup va animatsiya](33-transitiongroup-va-animatsiya.md) | Ro'yxat animatsiyasi, FLIP, state animatsiyasi |
| 34 | [KeepAlive](34-keepalive.md) | Kesh, `include/exclude`, `onActivated` |
| 35 | [Teleport](35-teleport.md) | Modal, tooltip, `disabled`, SSR ehtiyoti |
| 36 | [Suspense](36-suspense.md) | Async setup, fallback, xato chegarasi |

## V qism — Ilova miqyosi (37–47)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 37 | [SFC ichki tuzilishi](37-sfc-ichki-tuzilishi.md) | Kompilyatsiya, `scoped`, CSS Modules, `v-bind()` CSS'da |
| 38 | [Tooling](38-tooling.md) | Vite, DevTools, ESLint, Prettier, IDE |
| 39 | [Vue Router: asoslar](39-router-asoslari.md) | Marshrutlar, `RouterLink`, dinamik segment |
| 40 | [Vue Router: chuqur](40-router-chuqur.md) | Ichma-ich marshrut, guard, lazy, scroll, meta |
| 41 | [Holat boshqaruvi](41-holat-boshqaruvi.md) | Reaktiv obyektdan store'gacha, qachon kerak |
| 42 | [Pinia](42-pinia.md) | Store yaratish, state/getters/actions |
| 43 | Pinia: chuqur *(tayyorlanmoqda)* | Plugin, SSR, testlash, store'lar aloqasi |
| 44 | HTTP qatlami *(tayyorlanmoqda)* | `fetch`, xato/yuklanish, abort, kesh, retry |
| 45 | Formalar arxitekturasi *(tayyorlanmoqda)* | Validatsiya (zod), server xatolari, UX |
| 46 | Render mexanizmi *(tayyorlanmoqda)* | Virtual DOM, patch flag, render funksiya, JSX |
| 47 | Vapor mode va Vue 3.6 *(tayyorlanmoqda)* | VDOM'siz render, alien-signals, migratsiya |

## VI qism — TypeScript (48–50)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 48 | TypeScript'ni sozlash *(tayyorlanmoqda)* | `vue-tsc`, `tsconfig`, IDE, `.vue` tiplari |
| 49 | TS + Composition API *(tayyorlanmoqda)* | `defineProps<T>`, generic komponent, `ref<T>` |
| 50 | TS + Options API *(tayyorlanmoqda)* | `defineComponent`, `PropType`, `this` tipi |

## VII qism — Sifat va testlash (51–55)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 51 | Testlash strategiyasi *(tayyorlanmoqda)* | Nimani test qilish, piramida, TDD chegarasi |
| 52 | Vitest va komponent testi *(tayyorlanmoqda)* | `mount`, Testing Library, so'rovni mock qilish |
| 53 | Composable va store testi *(tayyorlanmoqda)* | Izolyatsiya, fake timer, Pinia testi |
| 54 | E2E: Playwright *(tayyorlanmoqda)* | Ssenariy, selektorlar, CI'da ishga tushirish |
| 55 | Kod sifati *(tayyorlanmoqda)* | ESLint flat config, Prettier, strict TS, CI gate |

## VIII qism — SSR, Nuxt va SEO (56–61)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 56 | SSR mexanizmi *(tayyorlanmoqda)* | Server render, hydration, universal kod |
| 57 | Qo'lda SSR qurish *(tayyorlanmoqda)* | Vite SSR, `renderToString`, holat uzatish |
| 58 | SSG va prerender *(tayyorlanmoqda)* | Statik generatsiya, ISR, qachon qaysi |
| 59 | Nuxt asoslari *(tayyorlanmoqda)* | Fayl-marshrut, layout, avto-import |
| 60 | Nuxt: data va server *(tayyorlanmoqda)* | `useFetch`, server route, Nitro |
| 61 | SEO va meta *(tayyorlanmoqda)* | `useHead`, Open Graph, sitemap, structured data |

## IX qism — Production darajasi (62–70)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 62 | Unumdorlik *(tayyorlanmoqda)* | Render profiling, `shallowRef`, `v-memo`, virtual list |
| 63 | Bundle va yuklanish *(tayyorlanmoqda)* | Code splitting, tree shaking, tahlil, prefetch |
| 64 | Erishimlilik (a11y) *(tayyorlanmoqda)* | Semantik HTML, fokus, ARIA, klaviatura |
| 65 | Xavfsizlik *(tayyorlanmoqda)* | XSS, `v-html`, CSP, token saqlash |
| 66 | Ko'p tillilik (i18n) *(tayyorlanmoqda)* | `vue-i18n`, lazy locale, sana/son formati |
| 67 | Deploy *(tayyorlanmoqda)* | Statik hosting, Docker, nginx, kesh sarlavhalari |
| 68 | Monitoring va xatolar *(tayyorlanmoqda)* | `errorHandler`, Sentry, source map |
| 69 | Amaliy loyiha *(tayyorlanmoqda)* | Hamma bo'lakni bitta ilovaga yig'ish |
| 70 | Checklist va migratsiya *(tayyorlanmoqda)* | Vue 2 → 3, 3.5 → 3.6, reliz checklist |

---

> **Holat (2026-yil sentabr).** 1–42-boblar yozib bo'lindi. Qolgan boblar (43–70) reja bo'yicha tayyorlanmoqda — ular mundarijada `(tayyorlanmoqda)` belgisi bilan turibdi.

## Qanday o'qish kerak

- **Noldan:** 01 → 36 ketma-ket, har bobning "Amaliyot" bo'limini bajarib. Shundan keyin 37–47.
- **Ishlayotgan dasturchi:** 05, 07, 09, 17 (reaktivlik), keyin 22–27 (komponent shartnomasi), keyin 39–45 (ilova arxitekturasi).
- **Interview/senior daraja:** 07, 17, 46, 47, 56, 62, 63 — Vue'ning ichki ishlashi shu boblarda.

Har bob oxirida rasmiy hujjatga havola bor. Qo'llanma hujjatning o'rnini bosmaydi — u hujjatni **tushunib** o'qishga tayyorlaydi.
