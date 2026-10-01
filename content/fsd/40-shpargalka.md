# 40 — Shpargalka

[← Oldingi: Tez-tez beriladigan savollar](39-faq.md) · [Mundarija](README.md)

## Qisqacha

Butun qo'llanma bir sahifada. Chop eting yoki loyihangizning `AGENTS.md`/`CLAUDE.md` fayliga qo'shing — AI yordamchisi ham shu qoidalar bo'yicha yozsin.

## Qoida: tuzilma

```text
src/
├── app/        ilova: entrypoint, providers, routes, styles     slice'siz · hammani import qiladi · uni hech kim
├── pages/      sahifalar — har biri slice                       ← v2.1: BU YERDAN BOSHLANG
├── widgets/    katta mustaqil bloklar (2+ sahifa)              ┐
├── features/   foydalanuvchi harakatlari (2+ joy) — fe'l        │ kerak bo'lganda
├── entities/   biznes obyektlari — ot                          ┘
└── shared/     poydevor: ui, api, lib, config, routes, i18n     slice'siz · biznessiz

Qatlam → slice (biznes nomi, kebab-case) → segment (ui · api · model · lib · config)
```

## Qoida: ikki asosiy qonun

```text
1. IMPORT FAQAT PASTGA          app → pages → widgets → features → entities → shared
   bir qatlamdagi slice'lar bir-birini bilmaydi   (istisno: entities/A/@x/B — oxirgi chora)
   app va shared ichidagi segmentlar — erkin

2. PUBLIC API                   tashqaridan faqat '@/<qatlam>/<slice>' (index.ts)
   slice ICHIDA → nisbiy ('../lib/x')        slice'lar ORASIDA → absolyut ('@/entities/x')
   shared/ui, shared/lib → komponent/kutubxona bo'yicha index ('@/shared/ui/button')
   export * — yo'q · segment index'lari — yo'q
```

## Shablon: kod qayerga

| Kod | Joy |
| --- | --- |
| Faqat bitta sahifada | `pages/<sahifa>` |
| UI kit, logo, biznessiz karkas | `shared/ui/<komponent>` |
| HTTP klient, CRUD, DTO, mapper, query factory | `shared/api` |
| `formatDate`, `Money` | `shared/lib/<yo'nalish>` (+ README) |
| env, global flag | `shared/config` |
| URL konstantalari | `shared/routes` |
| Token, joriy foydalanuvchi | `shared/auth` |
| Test soxtalari (MSW) | `shared/testing` |
| Router, provayderlar, global stil, widget'li layout | `app` |
| Ko'rinish/qoida — 2+ joyda, biznes obyekti | `entities/<ot>` |
| Harakat — 2+ joyda | `features/<fe'l>` |
| Katta blok — 2+ sahifada | `widgets/<blok>` |

Shubha bo'lsa — **eng lokal joy**. Keyin ko'chirish oson; noto'g'ri pastga tushirilganini qaytarish qiyin.

## Shablon: taqiqlangan segment nomlari (Steiger)

```text
components helpers utils constants types store(s) modals services enums interfaces schemas
handlers middlewares validators resolvers mutations fixtures assets
hooks context providers · composables directives · actions reducers selectors effects sagas thunks · pipes
→ o'rniga: ui · model · api · lib · config · yoki MAQSAD nomi (testing, analytics, auth, routes, i18n)
```

## Kod: framework bo'yicha

| | Kirish nuqtasi | `@/` | Steiger istisnosi |
| --- | --- | --- | --- |
| React + Vite | `src/app/entrypoint/main.tsx` (`index.html`) | `vite.config` alias + `tsconfig.app.json` paths | `app/providers` uchun `segments-by-purpose` off |
| Next.js 16 | Ildizda `app/` — faqat re-export; FSD `src/_app`, `src/_pages` | `tsconfig.json` `"./src/*"` | `typo-in-layer-name` off |
| Vue + Vite | `src/app/entrypoint/main.ts`, `src/app/App.vue` | create-vue sukuti | — |
| Nuxt 4 | Ildizda `app/` — qobiq; FSD `src/` | `nuxt.config` `alias['@']` | — |
| Angular 22 | `src/app/entrypoint/main.ts` (`angular.json` → `browser`) | `tsconfig.json` paths | — |

```ts
// steiger.config.ts — tavsiya
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([
  ...fsd.configs.recommended,
  { rules: { 'fsd/import-locality': 'error', 'fsd/no-wildcard-exports': 'error' } },
])
```

```bash
npx steiger src            # CI'da: xato bo'lsa exit 1
```

## Qachon / qachon emas

| Pastga tushiring | Joyida qoldiring |
| --- | --- |
| 2+ joy ishlatadi va ular birga o'zgaradi | "Kelajakda kerak bo'ladi" |
| Biznes qoidasi bir joyda bo'lishi shart | O'xshash, lekin mustaqil o'zgaradi — nusxa yaxshiroq |
| Steiger `insignificant-slice` aytmayapti | Steiger "only one reference" deyapti |

## Tipik xatolar

| Xato | To'g'ri yo'l |
| --- | --- |
| Birinchi kunda 6 qatlam | `app` + `pages` + `shared` |
| `entities/x` → `features/y` | Kompozitsiya yuqorida (slot/props) |
| `@/entities/x/ui/Card` | `@/entities/x` |
| `utils.ts`, `types.ts` | Domen nomli fayllar |
| Token sahifada | `shared/auth` |
| Steiger faqat lokal | CI'da |

## Manbalar

- Rasmiy hujjat: <https://feature-sliced.design/docs>
- Steiger: <https://github.com/feature-sliced/steiger>
- Bu qo'llanma: [Mundarija](README.md) · [19-bob — Qaror daraxti](19-qaror-daraxti.md) · [V qism — Shablonlar](27-react-shabloni.md)
