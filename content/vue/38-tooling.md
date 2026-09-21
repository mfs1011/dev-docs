# 38 — Tooling

[← Oldingi: SFC ichki tuzilishi](37-sfc-ichki-tuzilishi.md) · [Mundarija](README.md) · [Keyingi: Vue Router: asoslar →](39-router-asoslari.md)

## Tushuncha

Vue loyihasining kundalik asboblari:

| Asbob | Vazifasi |
| --- | --- |
| **Vite** | Dev server, HMR, build (06-bob) |
| **Vue DevTools** | Komponent daraxti, holat, hodisalar, unumdorlik |
| **Volar / Vue - Official** | IDE qo'llab-quvvatlashi (VS Code) |
| **vue-tsc** | `.vue` fayllarda TypeScript tekshiruvi (48-bob) |
| **ESLint + Prettier** | Kod sifati va format (55-bob) |
| **Vitest** | Birlik va komponent testlari (52-bob) |

## Kod: Vue DevTools

Ikki yo'l bilan o'rnatiladi:

**1. Brauzer kengaytmasi** — Chrome/Firefox do'konidan "Vue.js devtools".

**2. Vite plugini** (brauzerdan mustaqil, ichki panel):

```bash
npm i -D vite-plugin-vue-devtools
```

```js
// vite.config.js
import vueDevTools from 'vite-plugin-vue-devtools'

export default {
  plugins: [vue(), vueDevTools()],
}
```

Nimaga qaraysiz:

- **Components** — daraxt, props, holat (o'zgartirish ham mumkin);
- **Pinia** — store holati, action tarixi, time-travel (42-bob);
- **Router** — joriy marshrut, params, guard'lar;
- **Timeline** — hodisalar, render'lar, unumdorlik;
- **Inspector** — sahifadagi elementni bosib, komponentga o'tish.

Eng ko'p ishlatiladigan amal: komponentni tanlab, holatini o'zgartirish va natijani ko'rish — "shu holatda ekran qanday ko'rinadi?" savoliga eng tez javob.

## Kod: IDE sozlash (VS Code)

1. **Vue - Official** kengaytmasini o'rnating (eski nomi Volar).
2. Vetur o'rnatilgan bo'lsa — **o'chiring** (ikkalasi to'qnashadi).
3. TypeScript loyihasida "Takeover mode" endi kerak emas (Vue - Official 2.x dan o'zi hal qiladi).

Foydali sozlamalar (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" },
  "files.associations": { "*.vue": "vue" }
}
```

JetBrains (WebStorm) da Vue qo'llab-quvvatlashi o'rnatilgan holda keladi.

## Kod: foydali Vite pluginlari

```bash
npm i -D unplugin-vue-components unplugin-auto-import vite-plugin-vue-devtools rollup-plugin-visualizer
```

```js
// vite.config.js
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

    // <UserCard /> yozsangiz import avtomatik qo'shiladi (21-bob)
    Components({ dirs: ['src/components'], dts: 'src/components.d.ts' }),

    // ref, computed, watch, useRouter... importsiz ishlaydi
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
    }),

    // Build tahlili: dist/stats.html
    visualizer({ filename: 'dist/stats.html' }),
  ],
})
```

`AutoImport` bo'yicha ogohlantirish: kod qisqaradi, lekin "bu `ref` qayerdan keldi?" savoli yangi dasturchi uchun javobsiz qoladi va boshqa muharrirlarda (IDE sozlanmagan) qizil chiziqlar chiqadi. Jamoada kelishib oling.

## Kod: skriptlar to'plami

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint . --fix",
    "format": "prettier --write src/",
    "typecheck": "vue-tsc --noEmit"
  }
}
```

CI'da (55-bob) `npm run typecheck && npm run lint && npm run test && npm run build` ketma-ketligi ishlaydi.

## Muhandislik nuqtai nazari: DevTools bilan unumdorlik tekshirish

1. **Timeline** → "Component render" — qaysi komponent necha marta render qilinganini ko'rsatadi. Kutilmagan takroriy renderlar shu yerda ko'rinadi.
2. **Chrome Performance** → yozib olish → "Long tasks" — 50 ms dan uzun bloklar.
3. `app.config.performance = true` (03-bob) — komponent render vaqtlari Performance panelida `⚡` belgisi bilan chiqadi.

Odatiy sabablar (62-bob): `v-for` da noto'g'ri `key`, har renderda yangi obyekt/funksiya yaratish, `deep: true` watcher, katta ro'yxatda virtualizatsiya yo'qligi.

## Muhandislik nuqtai nazari: asbob tanlashda me'yor

Har bir plugin — jamoa uchun o'rganiladigan narsa va build uchun qo'shimcha vaqt. Foydali mezon:

| Plugin | Foyda | Narx |
| --- | --- | --- |
| DevTools | Juda yuqori | Yo'q (faqat dev) |
| `unplugin-vue-components` | O'rtacha (import yozilmaydi) | "Sehr", yangi odam chalkashadi |
| `unplugin-auto-import` | O'rtacha | Ko'proq "sehr" |
| `visualizer` | Yuqori (build tahlili) | Yo'q (ixtiyoriy ishga tushiriladi) |
| UI kutubxona (Vuetify, PrimeVue) | Yuqori | Bundle hajmi, dizayn cheklovi |

Yangi loyihada minimal to'plamdan boshlang: Vite + DevTools + ESLint + Vitest. Qolganini ehtiyoj tug'ilganda qo'shing.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Vetur va Vue - Official birga | Ikki tilli xizmat to'qnashadi, xato tiplar | Faqat bittasi |
| Production build'da DevTools qoldirish | Bundle'ga qo'shimcha kod | `vite-plugin-vue-devtools` faqat dev'da ishlaydi (standart) |
| `vue-tsc` ni CI'ga qo'shmaslik | Tip xatolari production'ga chiqadi | `build` skriptida |
| `npm run dev` da ishlagan kodni build qilmasdan deploy qilish | Katta-kichik harf, import xatolari | CI'da `npm run build` |
| Auto-import'ni jamoa bilan kelishmasdan qo'shish | Kod o'qilishi tushadi | Muhokama qiling |
| DevTools'da holatni o'zgartirib, "tuzatdim" deb o'ylash | O'zgarish faqat xotirada | Kodni tuzating |

## Amaliyot

1. Vue DevTools'ni o'rnating va komponent daraxtida `ref` qiymatini o'zgartirib ko'ring.
2. `vite-plugin-vue-devtools` ni qo'shing va ichki panelni oching (`Shift+Alt+D`).
3. `visualizer` bilan bundle tahlilini yarating: eng katta uch modulni toping.
4. `package.json` ga yuqoridagi skriptlar to'plamini qo'shing va hammasi ishlashini tekshiring.

## Rasmiy hujjat

- Tooling: <https://vuejs.org/guide/scaling-up/tooling.html>
- Vue DevTools: <https://devtools.vuejs.org>
- Vite pluginlari: <https://vite.dev/plugins/>
