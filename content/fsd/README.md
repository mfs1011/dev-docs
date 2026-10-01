# FSD — Feature-Sliced Design: qoidalar va tayyor shablonlar

Bu qo'llanma — **spravochnik**: kod qayerga borishini tez topish uchun. U rasmiy hujjatga (<https://feature-sliced.design>) tayanadi, uni o'zbekchada tartiblab beradi va ustiga React, Vue, Angular, Next.js va Nuxt uchun **tayyor papka shablonlari**, qaror daraxtlari va tipik xatolar jadvallarini qo'shadi. Versiyalar npm registry'dan tekshirilgan (2026-yil oktabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Feature-Sliced Design | 2.1 | Rasmiy hujjat (`feature-sliced.design`) |
| steiger (FSD linter) | 0.7.0 | `npm view steiger version` |
| @feature-sliced/steiger-plugin | 0.8.0 | `npm view @feature-sliced/steiger-plugin version` |
| @feature-sliced/cli | 1.0.0 | `npm view @feature-sliced/cli version` |
| React / Vite | 19.3 / 8.3 | `npm view react version`, `npm view vite version` |
| Next.js | 16.3 | `npm view next version` |
| Vue / Nuxt | 3.5 / 4.5 | `npm view vue version`, `npm view nuxt version` |
| Angular | 22.2 | `npm view @angular/core version` |

> **Talab.** Kamida bitta frontend framework'da real loyiha qilgan bo'lish. Arxitektura tamoyillari (chegaralar, bog'liqlik, modul tuzilmasi) — [Arxitektura qo'llanmasi](../arxitektura/38-modul-tuzilmasi.md)da; bu yerda — faqat FSD.

---

## Framework tanlagich

Kod misollari **bitta framework'da** ko'rsatiladi — sidebar'dagi **Framework** tanlagichidan React, Vue yoki Angular'ni tanlang, hamma boblardagi misollar shunga almashadi. Papka shablonlari esa framework'dan qat'i nazar bir xil — FSD'ning kuchi ham shunda.

Next.js va Nuxt'ning o'z marshrutlash papkalari FSD qatlam nomlari bilan to'qnashadi — ular uchun alohida shablon boblari bor (V qism).

## Har bobning skeleti

- **Qisqacha** — bitta abzatsda javob.
- **Qoida** — rasmiy hujjatdagi qoida, aniq so'zlar bilan.
- **Shablon** — papka daraxti, nusxa olib ishlatish mumkin.
- **Kod** — tanlangan framework'da.
- **Qachon / qachon emas** — chegaralovchi holatlar.
- **Tipik xatolar** — jadval: xato → nega yomon → to'g'ri yo'l.
- **Manbalar** — rasmiy hujjatning tegishli sahifasi.

## Asosiy g'oya bitta rasmda

```text
src/
├── app/        ← ilova: provayderlar, marshrutlar, global stil         (slice'siz)
├── pages/      ← sahifalar: har biri — slice                           ┐
├── widgets/    ← katta mustaqil UI bloklari                            │ slice'lar
├── features/   ← foydalanuvchi harakatlari, bir necha sahifada         │ → segmentlar
├── entities/   ← biznes obyektlari                                     ┘
└── shared/     ← poydevor: UI kit, API klient, kutubxonalar            (slice'siz)

Import qoidasi: faqat PASTGA. features → entities ✅   entities → features ❌   features/a → features/b ❌
v2.1 tavsiyasi: avval PAGES'dan boshlang; qayta ishlatish paydo bo'lgandagina pastga tushiring.
```

---

## I qism — Asoslar (1–6)

| # | Bob | Mazmun |
| --- | --- | --- |
| 01 | [FSD nima va qachon kerak](01-kirish.md) | Muammo, uch daraja (qatlam, slice, segment), qachon FSD ortiqcha |
| 02 | [Pages-first: v2.1 fikrlash modeli](02-pages-first.md) | Sahifadan boshlash, kechiktirilgan dekompozitsiya, v2.0 dan farqi |
| 03 | [Qatlamlar](03-qatlamlar.md) | 7 qatlam, `processes` eskirgan, qaysilari majburiy emas |
| 04 | [Slice'lar](04-slicelar.md) | Domen bo'yicha bo'lish, nomlash, past bog'lanish va yuqori bog'liqlik |
| 05 | [Segmentlar](05-segmentlar.md) | `ui`, `api`, `model`, `lib`, `config` va o'z segmentlaringiz |
| 06 | [Import qoidasi va public API](06-import-va-public-api.md) | Faqat pastga, `index.ts`, nisbiy va absolyut importlar |

## II qism — Qatlamlar chuqur (7–13)

| # | Bob | Mazmun |
| --- | --- | --- |
| 07 | [shared](07-shared.md) | UI kit, API klient, `lib` (helpers emas!), `config`, `routes`, `i18n` |
| 08 | [entities](08-entities.md) | Biznes obyektlari, qachon kerak emas, CRUD — `shared/api`'da |
| 09 | [features](09-features.md) | "Hamma narsa feature emas", foydalanuvchi harakati, qayta ishlatish mezoni |
| 10 | [widgets](10-widgets.md) | Katta mustaqil bloklar, ichma-ich marshrutlash, layout'lar |
| 11 | [pages](11-pages.md) | Sahifa slice'i, yuklanish va xato holatlari, o'xshash sahifalarni birlashtirish |
| 12 | [app](12-app.md) | Entrypoint, provayderlar, marshrutlar, global stil |
| 13 | [Slice guruhlari](13-slice-guruhlari.md) | Bog'liq slice'larni papkada yig'ish — umumiy kodsiz |

## III qism — Chegaralar va bog'lanish (14–19)

| # | Bob | Mazmun |
| --- | --- | --- |
| 14 | [Public API chuqur](14-public-api-chuqur.md) | Barrel fayllar muammolari: sikl, tree-shaking, `shared/ui` uchun alohida index |
| 15 | [Cross-import va `@x`](15-cross-import.md) | Nega code smell, entity'lar orasida `@x`, A–D strategiyalar |
| 16 | [Yuqori qatlamda kompozitsiya](16-kompozitsiya.md) | Render props, slot'lar, content projection — slice'lar bir-birini bilmaydi |
| 17 | [Desegmentatsiya va nomlash](17-desegmentatsiya.md) | `components/`, `utils.ts`, `types.ts` — nega yomon, nima o'rniga |
| 18 | [Ortiqcha entity'lar](18-ortiqcha-entitylar.md) | Yupqa va qalin klient, entity'siz loyiha, auth ma'lumoti — `shared`'da |
| 19 | [Qaror daraxti: kod qayerga?](19-qaror-daraxti.md) | Bitta diagramma va 30 ta tipik holat bo'yicha javob |

## IV qism — Tipik vazifalar (20–26)

| # | Bob | Mazmun |
| --- | --- | --- |
| 20 | [API so'rovlari](20-api-sorovlari.md) | `shared/api` klienti, endpoint'lar, slice'ga xos so'rovlar, OpenAPI generatsiya |
| 21 | [Server holati](21-server-holati.md) | TanStack Query, Pinia Colada, Angular `resource` — kalitlar va query factory |
| 22 | [Autentifikatsiya](22-autentifikatsiya.md) | Login sahifasi yoki dialog widget, token qayerda, chiqish |
| 23 | [Tiplar va validatsiya](23-tiplar.md) | DTO va domen tiplari, Zod/Valibot sxemalari, entity'lar orasidagi tiplar |
| 24 | [Layout'lar](24-layoutlar.md) | Oddiy layout `shared/ui`'da, widget'li layout — `app`'da yoki slot bilan |
| 25 | [Assetlar, stillar va i18n](25-assetlar-va-i18n.md) | Rasm slice ichida, global stil `app`'da, tarjimalar qayerda |
| 26 | [Marshrutlash va lazy loading](26-marshrutlash.md) | Marshrut konstantalari, sahifalarni kech yuklash, guard'lar |

## V qism — Framework shablonlari (27–32)

| # | Bob | Mazmun |
| --- | --- | --- |
| 27 | [React + Vite shabloni](27-react-shabloni.md) | To'liq papka daraxti, alias, React Router, TanStack Query |
| 28 | [Next.js shabloni](28-nextjs-shabloni.md) | `app/` va `_pages`, `index.server.ts`, Route Handlers, middleware |
| 29 | [Vue + Vite shabloni](29-vue-shabloni.md) | Vue Router, Pinia, `@/` alias, slot'lar bilan kompozitsiya |
| 30 | [Nuxt shabloni](30-nuxt-shabloni.md) | `dir.pages`, alias, layout'lar, auto-import bilan murosa |
| 31 | [Angular shabloni](31-angular-shabloni.md) | Standalone komponentlar, `loadComponent`, DI va FSD, `tsconfig` yo'llari |
| 32 | [Monorepo va bir nechta FSD ildizi](32-monorepo.md) | Paketlar bo'yicha bo'lish, umumiy `shared` |

## VI qism — Asboblar va jamoa (33–36)

| # | Bob | Mazmun |
| --- | --- | --- |
| 33 | [Steiger](33-steiger.md) | O'rnatish, qoidalar, `insignificant-slice`, `excessive-slicing`, CI |
| 34 | [ESLint, TypeScript va alias'lar](34-eslint-va-alias.md) | Import chegaralari linterda, `paths`, IDE auto-import tuzoqlari |
| 35 | [FSD'da testlash](35-testlash.md) | Testlar qayerda yashaydi, slice'ni alohida test qilish |
| 36 | [Migratsiya](36-migratsiya.md) | O'z arxitekturadan, v1 → v2, v2.0 → v2.1 |

## VII qism — Amaliyot (37–40)

| # | Bob | Mazmun |
| --- | --- | --- |
| 37 | [Amaliy loyiha: do'kon frontendi](37-amaliy-loyiha.md) | Pages-first boshlash → takrorlanish paydo bo'lganda refaktoring |
| 38 | [Code review checklist](38-review-checklist.md) | PR'da nimani tekshirish |
| 39 | [Tez-tez beriladigan savollar](39-faq.md) | "Bu feature'mi yoki entity'mi?" va boshqalar |
| 40 | [Shpargalka](40-shpargalka.md) | Bir sahifada hammasi |

---

## Qanday o'qish kerak

- **FSD'ni birinchi marta ko'ryapsizmi:** I qism → 19-bob (qaror daraxti) → o'z framework'ingiz shabloni (V qism).
- **Mavjud loyihani o'tkazyapsizmi:** 2, 18, 36-boblar → 33-bob (Steiger) → shablon.
- **Aniq savol bilan keldingizmi:** 19-bob (qaror daraxti) yoki 40-bob (shpargalka).

## Asosiy manbalar

- Rasmiy hujjat: <https://feature-sliced.design/docs>
- LLM'lar uchun to'liq matn: <https://feature-sliced.design/llms-full.txt>
- Steiger: <https://github.com/feature-sliced/steiger>
- Misollar: <https://github.com/feature-sliced/examples>
