# 34 — ESLint, TypeScript va alias'lar

[← Oldingi: Steiger](33-steiger.md) · [Mundarija](README.md) · [Keyingi: FSD'da testlash →](35-testlash.md)

## Qisqacha

Steiger butun loyiha tuzilmasini tekshiradi — CI uchun ideal. ESLint esa **tahrirlash paytida**, IDE'da darhol qizil chiziq beradi: dasturchi chuqur importni yozayotgan paytda ko'radi. Ikkalasi bir-birini to'ldiradi. Bu bobda ikki tekshirilgan ESLint sozlamasi (ESLint 9, flat config): core'dagi `no-restricted-imports` bilan public API himoyasi va `eslint-plugin-boundaries` 7 bilan qatlam yo'nalishi. Ikkalasi ham Next.js 16 shablonida (28-bob) real buzilishlarni ushlashi sinaldi.

## Qoida

| Nima | Vosita | Qachon ishlaydi |
| --- | --- | --- |
| Butun arxitektura (21 qoida) | Steiger | CI, `--watch` |
| Public API'ni chetlab o'tish | ESLint `no-restricted-imports` | IDE'da yozish paytida |
| Qatlam yo'nalishi va cross-import | `eslint-plugin-boundaries` | IDE'da yozish paytida |
| `@/` yo'llari | `tsconfig` `paths` + bundler alias | Hamma joyda — ikkala linter ham shunga tayanadi |

Asosiy ehtiyot: **IDE auto-import** bitta nom bir necha joydan eksport qilinganda ko'pincha eng chuqur yo'lni tanlaydi (`@/entities/product/ui/ProductCard`) — rasmiy hujjat ham shu haqda ogohlantiradi. Linter bu xatoni yozilgan zahoti ko'rsatadi.

## Shablon: alias sozlamalari

```text
Bundler alias          TypeScript paths                       Framework
vite.config.ts         tsconfig.app.json  "@/*": ["./src/*"]   React + Vite (27-bob)
(create-vue sukuti)    (create-vue sukuti)                     Vue + Vite (29-bob)
—                      tsconfig.json      "@/*": ["./src/*"]   Next.js (create-next-app sukuti "./*" — o'zgartiring!)
nuxt.config alias      .nuxt/ avtomatik yaratadi               Nuxt (30-bob)
—                      tsconfig.json      "@/*": ["./src/*"]   Angular (esbuild paths'ni o'zi tushunadi)
```

TypeScript 6'da `baseUrl` shart emas — `paths` tsconfig fayliga nisbatan hal qilinadi (beshala shablonda shunday).

## Kod: public API himoyasi — `no-restricted-imports`

Qo'shimcha paketsiz, ESLint'ning o'zida:

```js
// eslint.config.mjs (qism)
{
  files: ["src/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-imports": ["error", {
      patterns: [{
        // '@/<qatlam>/<slice>/<har-qanday-ichki-yo'l>' taqiq; Next.js'dagi index.server — ruxsat
        regex: "^@/(pages|widgets|features|entities)/[^/]+/(?!index\\.server$).+",
        message: "Slice'ga faqat public API orqali kiring: '@/<qatlam>/<slice>'",
      }],
    }],
  },
}
```

Natija (tekshirilgan):

```text
1:1  error  '@/entities/product/lib/format-price' import is restricted from being used by a pattern.
            Slice'ga faqat public API orqali kiring: '@/<qatlam>/<slice>'  no-restricted-imports
```

Next.js shablonida `pages` o'rniga `_pages` yozing. Slice guruhlari (13-bob) bo'lsa, regex guruh chuqurligini hisobga olishi kerak — bu holda Steiger'ga tayaning.

## Kod: qatlam yo'nalishi — `eslint-plugin-boundaries` 7

```bash
npm i -D eslint-plugin-boundaries eslint-import-resolver-typescript
```

```js
// eslint.config.mjs (qism) — 7-versiya API'si: boundaries/dependencies + policies
import boundaries from "eslint-plugin-boundaries";

// Har qatlam faqat o'zidan pastdagilarni ko'radi; shared — o'z segmentlarini ham
const layer = (type, ...below) => ({
  from: { element: { type } },
  allow: { to: { element: { types: { anyOf: [type === "shared" ? "shared" : null, ...below].filter(Boolean) } } } },
});

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "import/resolver": { typescript: { alwaysTryTypes: true } },
      "boundaries/elements": [
        { type: "app", pattern: "src/app" },
        { type: "pages", pattern: "src/pages/*" },
        { type: "widgets", pattern: "src/widgets/*" },
        { type: "features", pattern: "src/features/*" },
        { type: "entities", pattern: "src/entities/*" },
        { type: "shared", pattern: "src/shared" },
      ],
    },
    rules: {
      "boundaries/dependencies": [2, {
        default: "disallow",
        policies: [
          { allow: { to: { module: { origin: "external" } } } },      // npm paketlari
          layer("app", "app", "pages", "widgets", "features", "entities", "shared"),
          layer("pages", "widgets", "features", "entities", "shared"),
          layer("widgets", "features", "entities", "shared"),
          layer("features", "entities", "shared"),
          layer("entities", "shared"),
          layer("shared"),
        ],
      }],
    },
  },
];
```

Natija (tekshirilgan):

```text
error  There is no policy allowing dependencies from elements of type "entities" to elements of type "features"   ← yuqoriga
error  There is no policy allowing dependencies from elements of type "widgets" to elements of type "pages"        ← yuqoriga
error  There is no policy allowing dependencies from elements of type "features" to elements of type "features"    ← cross-import
```

Slice ichidagi nisbiy importlar (`'../lib/format-price'`) ushlanmaydi — ular bitta element ichida. `entities` orasidagi `@x` kerak bo'lsa, unga alohida `allow` policy qo'shiladi.

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Faqat Steiger yetarlimi? | CI uchun — ha. IDE'da tezkor fikr-mulohaza kerak bo'lsa — ESLint qo'shing |
| create-vite oxlint qo'yadi, ESLint yo'q | Steiger + oxlint yetarli; IDE himoyasi kerak bo'lsa ESLint'ni alohida qo'shish |
| `@feature-sliced/eslint-config` | npm'da 0.1.1; rasmiy hujjat arxitektura tekshiruvi uchun Steiger'ni tavsiya qiladi |
| Nx | Module boundaries (tag'lar) — xuddi shu g'oya Nx darajasida |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Faqat bundler alias, `paths` yo'q | IDE, `tsc`, Steiger va ESLint resolver `@/`ni topmaydi | Ikkalasi ham |
| Internetdagi eski `boundaries/element-types` misollarini nusxalash | 7-versiyada asosiy qoida `boundaries/dependencies` + `policies` | Paket README'sidagi joriy sintaksis |
| ESLint resolver o'rnatilmagan | Plugin `@/` importlarini element deb taniy olmaydi | `eslint-import-resolver-typescript` |
| Lint faqat lokal | CI'da buzilish o'tib ketadi | `lint` va `lint:fsd` CI'da |

## Manbalar

- ESLint: *no-restricted-imports* <https://eslint.org/docs/latest/rules/no-restricted-imports>
- eslint-plugin-boundaries <https://github.com/javierbrea/eslint-plugin-boundaries>
- Rasmiy: *Public API — No real protection against side-stepping* <https://feature-sliced.design/docs/reference/public-api>
- Saytda: [Arxitektura 38-bob — Modul tuzilmasi](../arxitektura/38-modul-tuzilmasi.md), [React 46-bob — Kod sifati](../react/46-kod-sifati.md)
