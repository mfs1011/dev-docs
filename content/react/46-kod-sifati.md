# 46 — Kod sifati

[← Oldingi: TypeScript bilan React](45-typescript.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](47-xavfsizlik.md)

## Tushuncha

Kod sifati uch qatlamdan iborat va ular bir-birini almashtirmaydi:

| Qatlam | Nima ushlaydi | Qachon |
| --- | --- | --- |
| **Formatlash** (Prettier) | Bo'shliq, tirnoq, qator uzunligi | Saqlashda |
| **Lint** (ESLint) | Xato naqshlari, hooklar qoidalari, a11y | Saqlashda + CI |
| **Tiplar** (`tsc`) | Tip nomuvofiqligi | CI + IDE |

Ustiga testlar (43–44-bob) va CI gate qo'shiladi.

## Kod: ESLint flat config

```bash
npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-jsx-a11y eslint-plugin-import-x eslint-config-prettier
```

```js
// eslint.config.js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'playwright-report'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  reactHooks.configs['recommended-latest'],
  jsxA11y.flatConfigs.recommended,
  prettier,                                    // formatlash qoidalarini o'chiradi

  {
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      // Fast Refresh: fayl faqat komponent eksport qilsin (03-bob)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Hooklar — eng muhim ikkita qoida
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // Umumiy
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
)
```

React Compiler ishlatilsa (07-bob), qo'shimcha qoida:

```js
rules: {
  'react-hooks/react-compiler': 'error',
}
```

## Kod: eng muhim React qoidalari

| Qoida | Nima ushlaydi | Bob |
| --- | --- | --- |
| `react-hooks/rules-of-hooks` | Shart ichida hook chaqirish | 06 |
| `react-hooks/exhaustive-deps` | Yetishmayotgan bog'liqlik | 27 |
| `react-refresh/only-export-components` | HMR buzilishi | 03 |
| `jsx-a11y/alt-text` | Rasmda `alt` yo'q | 42 |
| `jsx-a11y/click-events-have-key-events` | `div onClick` | 42 |
| `jsx-a11y/label-has-associated-control` | Label bog'lanmagan | 42 |
| `@typescript-eslint/consistent-type-imports` | `import type` ishlatish | 45 |

**`exhaustive-deps` ni o'chirmang.** U ogohlantirsa, kodni qayta tuzing (27-bob), massivni qisqartirmang.

## Kod: Prettier

```json
// .prettierrc.json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "arrowParens": "always"
}
```

```
# .prettierignore
dist
coverage
package-lock.json
```

ESLint va Prettier to'qnashmasligi uchun `eslint-config-prettier` oxirgi bo'lib qo'shiladi — u ESLint'dagi barcha formatlash qoidalarini o'chiradi.

## Kod: skriptlar

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint . --fix",
    "lint:check": "eslint .",
    "format": "prettier --write src e2e",
    "format:check": "prettier --check src e2e",
    "test:run": "vitest run",
    "verify": "npm run lint:check && npm run typecheck && npm run test:run && npm run build"
  }
}
```

`verify` — siz ham, CI ham bir xil buyruq bilan tekshiradi.

## Kod: commit oldidan

```bash
npm i -D husky lint-staged
npx husky init
```

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

`lint-staged` faqat o'zgargan fayllarga ishlaydi — tez. Tiplar va testlarni pre-commit'ga **qo'ymang**: ular sekin va odamlar `--no-verify` qilishni o'rganadi.

## Kod: CI

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

      - name: Bundle hajmi
        run: |
          SIZE=$(find dist/assets -name 'index-*.js' -exec gzip -c {} \; | wc -c)
          echo "Bundle: $SIZE bayt (gzip)"
          [ "$SIZE" -lt 250000 ] || { echo "::error::Bundle 250 KB dan oshdi"; exit 1; }

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: coverage/
```

Tartib ataylab: eng tez tekshiruv birinchi — lint 10 soniyada yiqilsa, 5 daqiqalik testlarni kutish shart emas.

## Kod: import tartibi

```js
// eslint.config.js
import importX from 'eslint-plugin-import-x'

rules: {
  'import-x/order': ['warn', {
    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
    pathGroups: [{ pattern: '@/**', group: 'internal' }],
    'newlines-between': 'always',
    alphabetize: { order: 'asc', caseInsensitive: true },
  }],

  // Qatlam chegaralari (34-bob)
  'no-restricted-imports': ['error', {
    patterns: [{ group: ['@/features/*'], message: 'shared va entities features dan import qilmaydi' }],
  }],
}
```

## Muhandislik nuqtai nazari: qoidalar qancha qattiq bo'lsin

| Qoida turi | Daraja |
| --- | --- |
| Xatoga olib keladigan (`rules-of-hooks`, `no-unused-vars`) | `error` |
| Ehtimoliy muammo (`exhaustive-deps`, `no-explicit-any`) | `warn` |
| Uslub (`import/order`) | `warn` |
| Muhokamali | O'chiring |

CI **faqat `error`** larda yiqilsin, `warn` lar ko'rinib tursin. Aks holda odamlar `eslint-disable` yozishni o'rganadi.

`eslint-disable` yozilsa — sabab izohi bilan:

```js
// eslint-disable-next-line react-hooks/exhaustive-deps -- faqat mount'da ishlashi kerak
useEffect(() => { init() }, [])
```

## Muhandislik nuqtai nazari: texnik qarzni ko'rinadigan qilish

```bash
# Eng katta fayllar
find src -name '*.tsx' -exec wc -l {} + | sort -rn | head -10

# TODO/FIXME
grep -rn "TODO\|FIXME\|HACK" src | wc -l

# eslint-disable
grep -rn "eslint-disable" src | wc -l

# `any` soni
grep -rn ": any\|as any" src | wc -l
```

Bu to'rt raqamni oyda bir marta o'lchash — kod qayerda "og'riyotganini" ko'rsatadi. 500 qatorli `.tsx`, 40 ta TODO yoki 20 ta `any` — refaktoring signali.

## Muhandislik nuqtai nazari: kod ko'rigi (review) uchun ro'yxat

Katta qismini avtomatlashtirish mumkin, lekin quyidagilar odam ko'zini talab qiladi:

- Holat to'g'ri joyda yashayaptimi (37-bob)?
- Komponent shartnomasi (props) mantiqiy va minimalmi (11, 40-bob)?
- Xato va bo'sh holatlar qamrab olinganmi (13, 33-bob)?
- Effekt haqiqatan kerakmi (28-bob)?
- Erishimlilik: rol, label, fokus (42-bob)?
- Test xatti-harakatni tekshiryaptimi, tuzilmani emasmi (43-bob)?

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| ESLint va Prettier to'qnashuvi | Fayl har saqlashda o'zgaradi | `eslint-config-prettier` |
| `exhaustive-deps` ni o'chirish | Jim xatolar | Kodni qayta tuzing |
| Pre-commit'ga testlarni qo'yish | Commit sekinlashadi | CI'da |
| CI'da faqat testlarni ishlatish | Tip va lint xatolari o'tadi | To'liq `verify` |
| Eski `.eslintrc` format | ESLint 9+ flat config | `eslint.config.js` |
| `eslint-disable` ni sababsiz yozish | Qoida ma'nosini yo'qotadi | Izoh bilan yoki qoidani o'chiring |
| `tsc` ni build'ga qo'shmaslik | Tip xatolari production'ga chiqadi | `tsc -b && vite build` |

## Amaliyot

1. `eslint.config.js` ni flat config formatida yozing va `npm run lint:check` ni ishga tushiring.
2. Prettier'ni sozlang va butun loyihani formatlang (alohida commit qiling).
3. `husky` + `lint-staged` ni o'rnating va noto'g'ri formatlangan fayl bilan commit qilib ko'ring.
4. CI workflow'ini qo'shing va PR yaratib, gate ishlashini tekshiring.
5. Yuqoridagi to'rtta "texnik qarz" buyrug'ini ishga tushiring va natijani yozib qo'ying.
6. `react-hooks/exhaustive-deps` ogohlantirishlaridan uchtasini tuzating.

## Rasmiy hujjat

- ESLint flat config: <https://eslint.org/docs/latest/use/configure/configuration-files>
- `eslint-plugin-react-hooks`: <https://www.npmjs.com/package/eslint-plugin-react-hooks>
- `typescript-eslint`: <https://typescript-eslint.io>
- Prettier: <https://prettier.io/docs/en/options.html>
