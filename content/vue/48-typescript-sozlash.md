# 48 — TypeScript'ni sozlash

[← Oldingi: Vapor mode va Vue 3.6](47-vapor-mode.md) · [Mundarija](README.md) · [Keyingi: TS + Composition API →](49-ts-composition-api.md)

## Tushuncha

TypeScript Vue loyihasiga uch joydan kiradi:

1. **IDE** — yozayotganda xatolarni ko'rsatadi (Vue - Official kengaytmasi);
2. **`vue-tsc`** — CI va build'da tekshiradi (`tsc` ning `.vue` fayllarni tushunadigan versiyasi);
3. **Vite** — tiplarni **tekshirmaydi**, faqat olib tashlaydi (esbuild, tezlik uchun).

Uchinchi nuqta muhim: `npm run dev` tip xatosi bo'lsa ham ishlaydi. Shuning uchun `vue-tsc` build va CI'ga qo'shilishi shart (38, 55-bob).

## Kod: yangi loyihada

```bash
npm create vue@latest
# TypeScript → Yes
```

Hosil bo'ladigan sozlama uch faylga bo'linadi:

```
tsconfig.json          ← faqat havolalar (references)
tsconfig.app.json      ← src/ uchun (DOM, Vue)
tsconfig.node.json     ← vite.config.ts uchun (Node)
```

```json
// tsconfig.app.json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

`@vue/tsconfig` ichida muhim standartlar bor: `strict: true`, `jsx: "preserve"`, `moduleResolution: "bundler"`, `verbatimModuleSyntax`.

## Kod: mavjud JS loyihaga qo'shish

```bash
npm i -D typescript vue-tsc @vue/tsconfig @types/node
```

```json
// package.json
{
  "scripts": {
    "typecheck": "vue-tsc --noEmit",
    "build": "vue-tsc --noEmit && vite build"
  }
}
```

```json
// tsconfig.json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["src/**/*.ts", "src/**/*.vue", "env.d.ts"],
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] },
    // Bosqichma-bosqich o'tish uchun:
    "allowJs": true,
    "strict": false
  }
}
```

Ko'chish tartibi (bir kunda hammasini emas):

1. `allowJs: true`, `strict: false` bilan boshlang — mavjud kod ishlayveradi;
2. Yangi fayllarni `.ts` / `<script setup lang="ts">` da yozing;
3. Eng ko'p ishlatiladigan modullarni (API klient, store'lar, tiplar) ko'chiring;
4. `strict: true` ni yoqing va chiqqan xatolarni fayl-fayl tuzating;
5. Oxirida `allowJs: false`.

## Kod: `env.d.ts` va modul deklaratsiyalari

```ts
/// <reference types="vite/client" />

// Muhit o'zgaruvchilari uchun tiplar
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Tipsiz kutubxona uchun
declare module 'some-untyped-lib' {
  export function doThing(input: string): number
}
```

Shundan keyin `import.meta.env.VITE_API_URL` avtomatik `string` bo'ladi va nomi xato yozilsa IDE darhol aytadi.

## Kod: `.vue` fayl ichida TS

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

const user = ref<User | null>(null)
const isAdmin = computed(() => user.value?.role === 'admin')

function greet(target: User): string {
  return `Salom, ${target.name}`
}
</script>
```

`lang="ts"` yozilishi kifoya — boshqa hech narsa sozlanmaydi.

## Kod: tiplarni qayerda saqlash

```
src/
├── types/
│   ├── index.ts        ← umumiy domen tiplari (User, Product, Order)
│   └── api.ts          ← API javob shakllari
├── api/client.ts
└── stores/
```

```ts
// types/index.ts
export interface User {
  id: number
  name: string
  email: string
  createdAt: string        // ISO satr — API shunday qaytaradi
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
}
```

```ts
// api/client.ts
export async function getUsers(page = 1): Promise<Paginated<User>> {
  return api.get(`/users?page=${page}`)
}
```

Muqobil yondashuv — tiplarni **sxemadan** chiqarish (45-bob):

```ts
import { z } from 'zod'

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
})

export type User = z.infer<typeof userSchema>       // tip sxemadan avtomatik
```

Ustunligi: qoidalar va tiplar bir manbadan keladi va API javobi haqiqatan tekshiriladi (`userSchema.parse(response)`), ya'ni "tip aytdi-yu, aslida boshqa keldi" holati yo'qoladi.

## Kod: `vue-tsc` ni ishlatish

```bash
npm run typecheck                    # bir marta
npx vue-tsc --noEmit --watch         # kuzatuv rejimida
```

CI'da (55-bob):

```yaml
- run: npm ci
- run: npm run typecheck
- run: npm run test
- run: npm run build
```

Katta loyihada `vue-tsc` sekin bo'lishi mumkin (10 000+ fayl). Yechimlar: `composite`/project references (standart shablonda bor), `skipLibCheck: true` (standart), va tekshiruvni faqat CI + IDE'da qoldirish (dev serverda emas).

## Muhandislik nuqtai nazari: `strict` nima beradi

`strict: true` beshta tekshiruvni yoqadi, ulardan ikkitasi eng muhimi:

| Sozlama | Nima ushlaydi |
| --- | --- |
| `strictNullChecks` | `user.name` — `user` `null` bo'lishi mumkin bo'lgan joyda |
| `noImplicitAny` | Tipi aniqlanmagan parametrlar |

`strictNullChecks` — TypeScript'ning asosiy foydasi. Usiz `Cannot read properties of null` xatolarining katta qismi tutilmaydi va TS "chiroyli sintaksis" darajasida qolib ketadi.

Vue kontekstida bu ayniqsa ko'rinadi:

```ts
const user = ref<User | null>(null)

// ✗ TS xato beradi — to'g'ri qiladi
console.log(user.value.name)

// ✓
console.log(user.value?.name)
if (user.value) console.log(user.value.name)
```

## Muhandislik nuqtai nazari: `any` va uning o'rnini bosuvchilar

```ts
// ✗ tekshiruvni butunlay o'chiradi
function handle(payload: any) {}

// ✓ noma'lum, lekin tekshirishga majbur qiladi
function handle(payload: unknown) {
  if (typeof payload === 'string') { /* ... */ }
}

// ✓ generik
function first<T>(items: T[]): T | undefined {
  return items[0]
}
```

`any` ni faqat vaqtinchalik (migratsiya davrida) ishlating va `// TODO` bilan belgilang. ESLint qoidasi `@typescript-eslint/no-explicit-any` buni nazorat qiladi (55-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `vue-tsc` ni CI'ga qo'shmaslik | Vite tiplarni tekshirmaydi — xatolar production'ga chiqadi | `build`/`typecheck` skriptida |
| Vetur va Vue - Official birga o'rnatilgan | Tip xizmatlari to'qnashadi (38-bob) | Faqat Vue - Official |
| `strict: false` bilan uzoq yashash | TS foydasining yarmi yo'qoladi | Bosqichma-bosqich `strict: true` |
| Tiplarni API javobiga "ishonib" yozish | Server boshqa shakl qaytarsa runtime xato | zod bilan `parse` |
| Har joyda `as User` (type assertion) | Tekshiruvni chetlab o'tadi | Tip guard yoki sxema |
| `env.d.ts` ni yozmaslik | `import.meta.env` tipi yo'q | `ImportMetaEnv` interfeysi |

## Amaliyot

1. Mavjud JS loyihangizga TypeScript qo'shing (`allowJs`, `strict: false`) va `npm run typecheck` ishlashini tekshiring.
2. Bitta komponentni `lang="ts"` ga ko'chiring va `User` interfeysini yozing.
3. `env.d.ts` da `ImportMetaEnv` ni e'lon qiling, keyin `import.meta.env.VITE_XATO` deb yozib ko'ring — IDE xato berishini tasdiqlang.
4. `strict: true` ni yoqing va chiqqan birinchi 5 ta xatoni tuzating.
5. Bitta API javobini zod bilan `parse` qiling va serverdan noto'g'ri shakl kelganda nima bo'lishini ko'ring.

## Rasmiy hujjat

- TypeScript umumiy: <https://vuejs.org/guide/typescript/overview.html>
- `@vue/tsconfig`: <https://github.com/vuejs/tsconfig>
- `vue-tsc`: <https://github.com/vuejs/language-tools>
