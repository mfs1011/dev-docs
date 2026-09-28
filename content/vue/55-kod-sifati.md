# 55 — Kod sifati

[← Oldingi: E2E: Playwright](54-e2e-playwright.md) · [Mundarija](README.md) · [Keyingi: SSR mexanizmi →](56-ssr-mexanizmi.md)

## Tushuncha

Kod sifati uch qatlamdan iborat va ular bir-birini almashtirmaydi:

| Qatlam | Nima ushlaydi | Qachon ishlaydi |
| --- | --- | --- |
| **Formatlash** (Prettier) | Bo'shliq, tirnoq, qator uzunligi | Saqlashda |
| **Lint** (ESLint) | Xato naqshlari, Vue qoidalari, ishlatilmagan kod | Saqlashda + CI |
| **Tiplar** (`vue-tsc`) | Tip nomuvofiqligi | CI + IDE |

Ustiga testlar (51–54-boblar) va CI gate qo'shiladi.

## Kod: ESLint flat config

```bash
npm i -D eslint eslint-plugin-vue @vue/eslint-config-prettier
```

```js
// eslint.config.js (flat config — ESLint 9+ standarti)
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  { ignores: ['dist/**', 'coverage/**', 'playwright-report/**'] },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  skipFormatting,

  {
    rules: {
      // Komponent nomlari ikki so'zdan iborat bo'lsin (21-bob)
      'vue/multi-word-component-names': ['error', { ignores: ['index'] }],

      // v-for da key majburiy (13-bob)
      'vue/require-v-for-key': 'error',

      // Props default qiymatlari
      'vue/require-default-prop': 'warn',

      // Shablon tartibi
      'vue/attributes-order': 'warn',
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],

      // Ishlatilmagan o'zgaruvchilar
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // console faqat ogohlantirish va xato uchun
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
```

TypeScript loyihada qo'shimcha:

```bash
npm i -D @vue/eslint-config-typescript typescript-eslint
```

```js
import vueTsConfigs from '@vue/eslint-config-typescript'

export default [
  // ...
  ...vueTsConfigs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',   // import type {...}
    },
  },
]
```

## Kod: Prettier

```json
// .prettierrc.json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "vueIndentScriptAndStyle": false
}
```

```
# .prettierignore
dist
coverage
pnpm-lock.yaml
package-lock.json
```

Muhim: ESLint va Prettier **to'qnashmasligi** kerak. `@vue/eslint-config-prettier/skip-formatting` ESLint'dagi formatlash qoidalarini o'chiradi — formatlash faqat Prettier ishi bo'lib qoladi.

## Kod: skriptlar

```json
{
  "scripts": {
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write src/ e2e/",
    "format:check": "prettier --check src/ e2e/",
    "typecheck": "vue-tsc --noEmit",
    "test:run": "vitest run",
    "verify": "npm run lint:check && npm run format:check && npm run typecheck && npm run test:run && npm run build"
  }
}
```

`verify` — CI ham, siz ham bir xil buyruq bilan tekshirasiz.

## Kod: commit oldidan tekshirish

```bash
npm i -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

`lint-staged` faqat **o'zgargan fayllarga** ishlaydi — shuning uchun tez. Tiplar va testlarni pre-commit'ga qo'ymang (sekin, ishni to'sib qo'yadi) — ular CI'da ishlasin.

## Kod: CI gate

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci
      - run: npm run lint:check
      - run: npm run typecheck
      - run: npm run test:run -- --coverage
      - run: npm run build

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
```

Tartib ataylab shunday: eng tez tekshiruv birinchi bo'lsin — lint 10 soniyada yiqilsa, 5 daqiqalik testlarni kutish shart emas.

## Kod: eng foydali Vue lint qoidalari

| Qoida | Nima ushlaydi | Bob |
| --- | --- | --- |
| `vue/require-v-for-key` | `key` siz `v-for` | 13 |
| `vue/no-use-v-if-with-v-for` | Bir elementda `v-if` + `v-for` | 12 |
| `vue/no-mutating-props` | Props'ni o'zgartirish | 22 |
| `vue/require-explicit-emits` | E'lon qilinmagan emit | 23 |
| `vue/no-unused-components` | Import qilingan, ishlatilmagan komponent | 21 |
| `vue/multi-word-component-names` | `<Card>` kabi bir so'zli nom | 21 |
| `vue/no-v-html` | XSS xavfi | 65 |
| `vue/valid-v-slot` | Noto'g'ri slot sintaksisi | 26 |

Bular `flat/recommended` ichida bor. `flat/strongly-recommended` va `flat/recommended` orasidagi farq — asosan uslub qoidalari.

## Muhandislik nuqtai nazari: qoidalar qancha qattiq bo'lsin

Ikki chekka ham zararli:

- **Juda yumshoq** — lint hech narsa ushlamaydi, PR sharhlarida uslub bahsi boshlanadi;
- **Juda qattiq** — ishlab chiqish sekinlashadi, odamlar `// eslint-disable` yozadi.

Amaliy yondashuv:

| Qoida turi | Daraja |
| --- | --- |
| Xatoga olib keladigan (`no-mutating-props`, `require-v-for-key`) | `error` |
| Uslub (`attributes-order`, `component-name-in-template-casing`) | `warn` |
| Muhokamali (`require-default-prop`) | `warn` yoki o'chiring |

Va eng muhimi: **CI faqat `error` larda yiqilsin**, `warn` lar ko'rinib tursin.

## Muhandislik nuqtai nazari: uslub qo'llanmasi

Vue'ning rasmiy uslub qo'llanmasidan amalda eng foydali to'rttasi:

1. **Komponent nomlari ikki so'z** (`UserCard`, `TheHeader`) — HTML elementlari bilan to'qnashmaydi;
2. **Fayl nomi PascalCase** (`UserCard.vue`) — import qilinganda bir xil ko'rinadi;
3. **Props camelCase JS'da, kebab-case shablonda**;
4. **Kompleks ifodalarni `computed` ga chiqarish** (08, 10-bob).

Qolganlari (atributlar tartibi, bo'sh qatorlar) — lint qiladigan mayda narsalar; ular haqida bahslashmang, avtomatlashtiring.

## Muhandislik nuqtai nazari: texnik qarzni ko'rinadigan qilish

```bash
# Eng katta fayllar
find src -name '*.vue' -exec wc -l {} + | sort -rn | head -10

# TODO/FIXME lar
grep -rn "TODO\|FIXME\|HACK" src/ | wc -l

# eslint-disable ishlatilishi
grep -rn "eslint-disable" src/ | wc -l
```

Bu uch raqamni oyda bir marta o'lchash — kodning qayerda "og'riyotganini" ko'rsatadi. 500 qatorli `.vue` fayl, 40 ta TODO yoki 20 ta `eslint-disable` — refaktoring vaqti kelgani haqidagi signal.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| ESLint va Prettier formatlash qoidalari to'qnashishi | Fayl har saqlashda o'zgaradi | `eslint-config-prettier` |
| Pre-commit'ga testlarni qo'yish | Commit sekinlashadi, odamlar `--no-verify` qiladi | CI'da |
| `eslint-disable` ni sababsiz yozish | Qoida ma'nosini yo'qotadi | Sabab izohi bilan yoki qoidani o'chiring |
| CI'da faqat testlarni ishlatish | Tip va lint xatolari o'tib ketadi | To'liq `verify` |
| Eski `.eslintrc` formatini ishlatish | ESLint 9+ flat config talab qiladi | `eslint.config.js` |
| Qoidalarni jamoa bilan kelishmasdan qattiqlashtirish | Qarshilik, `disable` lar | Muhokama + bosqichma-bosqich |

## Amaliyot

1. `eslint.config.js` ni flat config formatida yozing va `npm run lint:check` ni ishga tushiring.
2. Prettier'ni sozlang, `npm run format` ni bajaring va diff hajmini ko'ring (bir marta katta bo'ladi — alohida commit qiling).
3. `husky` + `lint-staged` ni o'rnating va noto'g'ri formatlangan fayl bilan commit qilib ko'ring.
4. CI workflow'ini qo'shing va PR yaratib, gate ishlashini tekshiring.
5. Yuqoridagi uchta "texnik qarz" buyrug'ini ishga tushiring va natijani yozib qo'ying — bir oydan keyin solishtirasiz.

## Rasmiy hujjat

- eslint-plugin-vue: <https://eslint.vuejs.org>
- Vue uslub qo'llanmasi: <https://vuejs.org/style-guide/>
- Prettier: <https://prettier.io/docs/en/options.html>
- lint-staged: <https://github.com/lint-staged/lint-staged>
