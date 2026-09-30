# 70 — DevTools, Language Service, CLI chuqur

[← Oldingi: NgModule'dan standalone'ga migratsiya](69-ngmodule-migratsiya.md) · [Mundarija](README.md) · [Keyingi: Testlash: birlik testlari →](71-birlik-testlari.md)

## Tushuncha

Uch vosita guruhi:

| Vosita | Nima uchun |
| --- | --- |
| **Angular DevTools** (brauzer kengaytmasi) | Komponent daraxti, signal grafigi, profiler, injector daraxti, marshrutlar |
| **Language Service** (IDE) | Shablonlarda avtokomplet, xato, "definition'ga o'tish" |
| **Angular CLI** | Generatsiya, build, test, update, tahlil, MCP |

## Nega shunday

Angular xatolarining ko'pi **ko'rinmas**: "nega bu komponent qayta chizilyapti?", "bu xizmat qaysi injector'dan kelyapti?", "bundle nega 2 MB?". Bu vositalar ko'rinmasni ko'rinadigan qiladi. Taxmin qilish o'rniga o'lchash.

## Kod: Angular DevTools

Chrome / Firefox kengaytmasi. Faqat **development** build'da to'liq ishlaydi (`ng serve`).

| Tab | Nima ko'rsatadi | Qachon foydali |
| --- | --- | --- |
| **Components** | Komponent daraxti, input/signal qiymatlari, tahrirlash | "Bu komponentda qanday holat bor?" |
| **Signal graph** | Signal → computed → effect → shablon bog'liqliklari | "Nega bu computed qayta hisoblanyapti?" |
| **Profiler** | Change detection sikllari, har komponent vaqti | Sekin interaksiya |
| **Injector tree** | Element va environment injectorlar, provayderlar | "Nega ikkita `CartStore` nusxasi?" (37-bob) |
| **Router tree** | Marshrut konfiguratsiyasi, faol marshrut | Lazy marshrutlar, guardlar |

Konsolda tanlangan komponent: `$0` — DOM element; DevTools'da tanlangandan keyin `$ng0` — komponent nusxasi.

### Profiler bilan ishlash

1. Profiler → Record.
2. Sekin amalni bajaring (masalan, 1000 qatorli ro'yxatda filtr).
3. Stop → har sikl bo'yicha qaysi komponent qancha vaqt olganini ko'ring.

Zoneless + OnPush ilovada (Angular 22 sukut) sikllar faqat signal o'zgargan joyda — agar profiler butun daraxt qayta tekshirilayotganini ko'rsatsa, `Eager` (eski `Default`) strategiyali komponentni qidiring.

## Kod: Language Service

VS Code — "Angular Language Service" kengaytmasi; WebStorm — o'rnatilgan. `strictTemplates` (Angular 22 da sukut) bilan:

- Shablonda noto'g'ri xususiyat — yozish paytida qizil (NG8002).
- `@if (user(); as u)` ichida `u.` — avtokomplet.
- Komponent selektoridan — Ctrl+Click bilan faylga.
- `imports` ga qo'shilmagan komponent — "Quick fix: import".

Language Service kompilyator bilan bir xil tekshiruvlarni qiladi — IDE'da xato yo'q bo'lsa, `ng build` da ham bo'lmaydi.

## Kod: CLI — kundalik

```bash
ng new shop --ssr --style=scss
ng g component features/orders/order-list      # order-list.ts, .html, .css
ng g service orders/order-api                  # @Service()
ng g guard auth --functional
ng g interceptor auth
ng g environments
ng serve --open
ng test --watch=false                           # Vitest
ng build
ng update                                       # nima yangilanishi mumkin
ng update @angular/core @angular/cli            # yangilash + migratsiyalar
```

Angular 22 CLI buyruqlari (tekshirildi, `ng help`): `add`, `analytics`, `build`, `cache`, `completion`, `config`, `deploy`, `e2e`, `extract-i18n`, `generate`, `lint`, `new`, `run`, `serve`, `test`, `update`, `version`, va `mcp`.

`ng lint` — sukut bo'yicha sozlanmagan: `ng add angular-eslint`.

### Sukut sozlamalarni o'zgartirish

```json
// angular.json → projects.<nom>.schematics
"schematics": {
  "@schematics/angular:component": { "style": "scss", "changeDetection": "OnPush", "skipTests": false }
}
```

Jamoa konvensiyalari (FSD papkalari, test fayllari) — shu yerda bir marta.

## Kod: bundle tahlili

```bash
ng build --stats-json
```

Tekshirildi: natija — `dist/<nom>/browser-stats.json` (esbuild metafile). Ko'rish:

- <https://esbuild.github.io/analyze/> — faylni yuklang, "treemap" yoki "sunburst".
- Yoki `npx source-map-explorer dist/<nom>/browser/*.js` (`sourceMap: true` bilan build).

Nimani qidirish:

| Belgi | Sabab | Yechim |
| --- | --- | --- |
| `moment`, `lodash` to'liq | Butun kutubxona import | `date-fns`/`Intl`, `lodash-es` nuqtaviy import |
| Admin kodi `main` chunk'ida | Statik import lazy bo'limdan (43-bob) | Importni tuzatish |
| Bir kutubxona ikki versiyada | Qaram paketlar | `npm ls <paket>`, dedupe |
| Katta JSON | Build'ga kiritilgan ma'lumot | Ish vaqtida yuklash |

### Byudjetlar

```json
// angular.json → configurations.production.budgets (ng new sukuti)
"budgets": [
  { "type": "initial", "maximumWarning": "500kB", "maximumError": "1MB" },
  { "type": "anyComponentStyle", "maximumWarning": "4kB", "maximumError": "8kB" }
]
```

Tekshirildi — `ng new` shu qiymatlar bilan yaratadi. `maximumError` oshsa — build **yiqiladi**. CI'da bu — bundle o'sishiga qarshi yagona avtomatik himoya.

### Kesh

```bash
ng cache info      # yo'l, holat (tekshirildi: .angular/cache, Enabled: Yes)
ng cache clean     # g'alati build xatolari bo'lsa
```

`.angular/` — `.gitignore` da bo'lishi kerak.

## Kod: MCP server — AI yordamchilari uchun

```bash
ng mcp
```

Angular CLI **MCP** (Model Context Protocol) serverini ishga tushiradi: AI kod yordamchilari (Claude Code, Cursor, Copilot) loyihangiz haqida aniq ma'lumot oladi — Angular versiyasi, eng yaxshi amaliyotlar, rasmiy hujjat qidiruvi, generatsiya. Tekshirildi — opsiyalar: `--read-only` (faqat o'qish vositalari), `--local-only` (internetsiz), `--root` (ruxsat etilgan papkalar).

```json
// masalan, .mcp.json
{ "mcpServers": { "angular-cli": { "command": "npx", "args": ["-y", "@angular/cli", "mcp"] } } }
```

Foydasi: AI eski Angular (NgModule, `*ngIf`, konstruktor DI) o'rniga loyihangizdagi versiyaga mos kod yozadi.

## Muhandislik nuqtai nazari

**Unumdorlik muammosida tartib:**

```
1. O'lchash (DevTools Profiler, Lighthouse, Web Vitals)
2. Taxmin (qaysi komponent / qaysi chunk)
3. Bitta o'zgarish
4. Qayta o'lchash
```

"Optimizatsiya" o'lchovsiz — ko'pincha kodni murakkablashtiradi, tezlashtirmaydi. Batafsil — 74-bob.

**`ng update` ni muntazam:** har asosiy versiya (yarim yilda bir) — kichik sakrashlar oson, 3 versiyalik sakrash — og'riqli. `ng update` migratsiyalarni **o'zi** ishga tushiradi (masalan, v22 da `Default` → `Eager` change detection).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Production build'da DevTools kutish | Ma'lumot kam | `ng serve` (dev) |
| Language Service o'rnatilmagan | Shablon xatolari faqat build'da | IDE kengaytmasi |
| Byudjet xatosini oshirib "tuzatish" | Bundle o'sishda davom etadi | Tahlil va sababni tuzatish |
| `.angular/cache` git'da | Katta, ziddiyatli commitlar | `.gitignore` |
| Uzoq vaqt `ng update` qilmaslik | Og'riqli ko'p versiyali sakrash | Har versiyada |
| AI yordamchi eski Angular kodi yozadi | Nomuvofiq kod | `ng mcp` |

## Amaliyot

1. Angular DevTools'ni o'rnating; `CartStore` qaysi injector'da ekanini Injector tree'da toping.
2. Signal graph'da bitta `computed` ning bog'liqliklarini kuzating.
3. Profiler bilan sekin ro'yxatni o'lchang.
4. `ng build --stats-json` → esbuild analyzer; eng katta 3 modulni toping.
5. `initial` byudjetni joriy hajmdan biroz past qo'yib, build xatosini ko'ring.
6. `ng mcp` ni AI yordamchingizga ulang va "yangi komponent yarat" deb so'rab, natijani solishtiring.

## Rasmiy hujjat

- Angular DevTools: <https://angular.dev/tools/devtools>
- Language Service: <https://angular.dev/tools/language-service>
- CLI: <https://angular.dev/cli>
- AI va MCP: <https://angular.dev/ai/mcp>
