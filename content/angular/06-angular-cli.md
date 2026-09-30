# 06 — Angular CLI

[← Oldingi: Komponent anatomiyasi](05-komponent-anatomiyasi.md) · [Mundarija](README.md) · [Keyingi: Standalone ilova: provayderlar →](07-standalone-provayderlar.md)

## Tushuncha

Angular CLI (`ng`) — loyihaning butun hayoti davomida ishlatiladigan vosita: yaratish, generatsiya, ishga tushirish, build, test, yangilash. Bu bobda kundalik ishda kerak bo'ladigan buyruqlar va ularning to'g'ri ishlatilishi.

## Nega shunday

CLI orqali ishlashning uchta foydasi:

1. **Bir xil kod.** `ng generate` rasmiy uslub qo'llanmasiga mos fayl yaratadi — nomlash, joylashuv, test fayli.
2. **Konfiguratsiya bir joyda.** Build, dev server, test — hammasi `angular.json` da, CLI uni o'qiydi.
3. **Avtomatik migratsiya.** `ng update` kodni ham o'zgartiradi — masalan v22 ga o'tishda eski komponentlarga `ChangeDetectionStrategy.Eager` ni o'zi qo'shadi.

## Kod: buyruqlar xaritasi

Angular 22 CLI dagi buyruqlar (`ng --help`):

| Buyruq | Qisqa | Nima qiladi |
| --- | --- | --- |
| `ng new` | `ng n` | Yangi workspace |
| `ng generate` | `ng g` | Fayl generatsiya |
| `ng serve` | `ng s`, `ng dev` | Dev server |
| `ng build` | `ng b` | Production build |
| `ng test` | `ng t` | Unit testlar (Vitest) |
| `ng e2e` | `ng e` | E2E testlar (sozlash kerak) |
| `ng lint` | — | Lint (sozlash kerak) |
| `ng add` | — | Kutubxonani qo'shish va sozlash |
| `ng update` | — | Versiyani yangilash + migratsiya |
| `ng extract-i18n` | — | Tarjima matnlarini chiqarish (77-bob) |
| `ng deploy` | — | Deploy (adapter kerak) |
| `ng config` | — | `angular.json` ni o'qish/yozish |
| `ng cache` | — | Disk keshini boshqarish |
| `ng version` | `ng v` | Versiyalar |

Loyiha ichida `ng` o'rniga `npm run ng -- ...` ham ishlaydi — u lokal CLI versiyasini aniq ishlatadi.

## Kod: `ng generate`

Eng ko'p ishlatiladigan buyruq. Haqiqiy Angular 22 natijasi:

| Buyruq | Yaratadi | Klass / nom |
| --- | --- | --- |
| `ng g c user-card` | `user-card/user-card.ts` + `.html`, `.css`, `.spec.ts` | `UserCard` |
| `ng g s user-api` | `user-api.ts` + `.spec.ts` | `UserApi` (`@Service()`) |
| `ng g d highlight` | `highlight.ts` + `.spec.ts` | `Highlight`, `[appHighlight]` |
| `ng g p short-date` | `short-date-pipe.ts` + `.spec.ts` | `ShortDatePipe`, `shortDate` |
| `ng g guard auth` | `auth-guard.ts` + `.spec.ts` | `authGuard: CanActivateFn` |
| `ng g resolver user` | `user-resolver.ts` | Funksional resolver |
| `ng g interceptor auth` | `auth-interceptor.ts` | Funksional interceptor |
| `ng g interface order` | `order.ts` | `interface Order` |
| `ng g environments` | `environments/*.ts` + `angular.json` yangilanadi | — |

E'tibor bering: pipe'da `Pipe` qo'shimchasi **qoladi** (`ShortDatePipe`), komponent va xizmatda — yo'q.

Yo'l bilan generatsiya — papka tuzilmasini birdaniga yaratadi:

```bash
ng g c orders/order-list          # src/app/orders/order-list/order-list.ts
ng g s orders/order-api           # src/app/orders/order-api.ts
```

## Kod: komponent generatsiya sozlamalari

```bash
ng g c badge --inline-template --inline-style --skip-tests
```

| Bayroq | Qisqa | Nima qiladi |
| --- | --- | --- |
| `--inline-template` | `-t` | Shablon `.ts` ichida |
| `--inline-style` | `-s` | Stil `.ts` ichida |
| `--skip-tests` | — | `.spec.ts` yaratmaydi |
| `--flat` | — | Alohida papka yaratmaydi |
| `--style=scss` / `none` | — | Stil formati yoki stilsiz |
| `--change-detection=Eager` | `-c` | OnPush o'rniga eski strategiya |
| `--display-block` | `-b` | `:host { display: block; }` qo'shadi |
| `--prefix=admin` | `-p` | `admin-` selektor prefiksi |
| `--dry-run` | `-d` | Faqat ko'rsatadi, fayl yozmaydi |

`--dry-run` ni odat qiling — nima yaratilishini oldindan ko'rasiz:

```bash
ng g c orders/order-list --dry-run
```

Sozlamalarni har safar yozmaslik uchun `angular.json` da standart qilib qo'yish mumkin:

```json
"schematics": {
  "@schematics/angular:component": {
    "style": "scss",
    "displayBlock": true
  }
}
```

## Kod: `ng serve`

```bash
ng serve                       # http://localhost:4200
ng serve --port 4300           # boshqa port
ng serve --open                # brauzerni o'zi ochadi
ng serve --host 0.0.0.0        # tarmoqdagi boshqa qurilmadan kirish (telefon)
ng serve --configuration production   # production build bilan ishga tushirish
```

API'ga proksi — backend boshqa portda bo'lsa, CORS muammosiz ishlash uchun:

```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true
  }
}
```

```bash
ng serve --proxy-config proxy.conf.json
```

Endi `fetch('/api/users')` → `http://localhost:8000/api/users`. Doimiy qilish uchun `angular.json` dagi `serve.options` ga `"proxyConfig": "proxy.conf.json"` qo'shing.

## Kod: `ng build`

```bash
ng build                                # production (sukut)
ng build --configuration development    # siqilmagan, source map bilan
ng build --stats-json                   # bundle tahlili uchun (74-bob)
```

Chiqish: `dist/my-app/browser/`. Build oxirida bundle hajmi jadvali chiqadi:

```
Initial chunk files | Names         |  Raw size | Estimated transfer size
main-JNWI62KU.js    | main          | 194.14 kB |                53.11 kB
                    | Initial total | 194.14 kB |                53.11 kB
```

(Haqiqiy Angular 22 loyihasi, bitta sahifa va router bilan.)

**"Estimated transfer size"** — foydalanuvchi aslida yuklaydigan hajm (siqilgan). Shunga qarang.

## Kod: muhit fayllari

API manzili dev va productionda farq qilsa:

```bash
ng g environments
```

Yaratadi:

```
src/environments/
├── environment.ts               ← production
└── environment.development.ts   ← development
```

Va `angular.json` ga almashtirish qoidasini qo'shadi:

```json
"development": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.development.ts"
    }
  ]
}
```

To'ldirish:

```ts
// environment.ts
export const environment = {
  apiUrl: 'https://api.example.com',
};

// environment.development.ts
export const environment = {
  apiUrl: 'http://localhost:8000',
};
```

Ishlatish — **doim** `environment.ts` dan import qiling, CLI build vaqtida almashtiradi:

```ts
import { environment } from '../environments/environment';

fetch(`${environment.apiUrl}/users`);
```

> **Diqqat: bu fayllar brauzerga ketadi.** `environment.ts` ga API kaliti, parol yoki sir **qo'ymang** — ular bundle ichida ochiq matn bo'lib turadi (76-bob).

## Kod: `ng add`

Kutubxonani **o'rnatadi va sozlaydi** — `npm install` dan farqi shu:

```bash
ng add @angular/material     # tema, shriftlar, animatsiya — 66-bob
ng add @angular/ssr          # server rendering — 62-bob
ng add @angular/localize     # ko'p tillilik — 77-bob
ng add angular-eslint        # lint — pastda
```

Kutubxona `ng add` ni qo'llab-quvvatlasa — undan foydalaning. Qo'llab-quvvatlamasa — oddiy `npm install`.

## Kod: lint

`ng new` lint'ni sozlamaydi. Qo'shish:

```bash
ng add angular-eslint
ng lint
```

Angular-ESLint qoidalari shablonlarni ham tekshiradi: `@for` da `track` yo'q, erishimlilik muammolari (`alt` yo'q rasm) va boshqalar.

## Kod: `ng update`

```bash
ng update                               # nima yangilanishi mumkinligini ko'rsatadi
ng update @angular/core @angular/cli    # yangilash + migratsiya
```

`ng update` faqat `package.json` ni emas, **kodni** ham o'zgartiradi: eskirgan API'larni yangisiga almashtiradi. Qoidalar:

1. Bir vaqtda **bitta major** versiya: 20 → 21 → 22, to'g'ridan-to'g'ri 20 → 22 emas.
2. Oldin git toza bo'lsin — o'zgarishlarni alohida commit'da ko'rish uchun.
3. <https://angular.dev/update-guide> — versiyalar orasidagi qo'lda qilinadigan qadamlar ro'yxati.

## Kod: AI vositalari uchun sozlash

```bash
ng g ai-config
```

AI yordamchilar uchun ko'rsatma fayllari (`AGENTS.md`, `CLAUDE.md` va boshqalar) va Angular MCP server konfiguratsiyasini yaratadi. Maqsad — AI zamonaviy Angular kodini yozsin, 2019-yilgi uslubni emas.

## Muhandislik nuqtai nazari: generatsiya qachon kerak emas

`ng generate` foydali, lekin majburiy emas. Interfeys, oddiy funksiya, konstanta faylini qo'lda yaratish tezroq. Generatsiyadan foyda — bir nechta fayl birga yaratilganda (komponent) yoki `angular.json` o'zgarganda (`environments`, `ng add`).

Jamoada muhimi — natija bir xil bo'lsin. Buning uchun `angular.json` dagi `schematics` sozlamalari va lint qoidalari yetarli.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Global `ng` versiyasiga tayanish | Loyiha boshqa versiyada | `npm run ng -- ...` |
| `environment.ts` ga sir qo'yish | Bundle'da ochiq | Faqat ochiq sozlamalar |
| `environment.development.ts` dan import | Productionda ham dev manzili | Doim `environment.ts` |
| 20 → 22 bir sakrashda | Migratsiyalar o'tkazib yuboriladi | Bittadan |
| `npm install` bilan Material qo'shish | Tema, animatsiya sozlanmaydi | `ng add` |
| Proksisiz boshqa portdagi backend | CORS xatosi | `proxy.conf.json` |
| `--dry-run` siz katta generatsiya | Kutilmagan fayllar | Avval `-d` |

## Amaliyot

1. `ng g c orders/order-list --dry-run` qiling, keyin haqiqatda yarating.
2. `ng g s orders/order-api` va `ng g p short-date` yarating; klass nomlarini solishtiring.
3. `ng g environments` qiling, `apiUrl` qo'shing va `ng build --configuration development` bilan qaysi qiymat ketishini tekshiring.
4. Lokal backend uchun `proxy.conf.json` yozing va `/api` so'rovini sinab ko'ring.
5. `ng add angular-eslint` qiling va `ng lint` ning birinchi natijasini tuzating.
6. `ng build` natijasidagi "Estimated transfer size" ni yozib qo'ying — 74-bobda solishtiramiz.

## Rasmiy hujjat

- CLI umumiy: <https://angular.dev/tools/cli>
- `ng generate`: <https://angular.dev/cli/generate>
- Muhit fayllari: <https://angular.dev/tools/cli/environments>
- Dev server proksi: <https://angular.dev/tools/cli/serve#proxying-to-a-backend-server>
- Yangilash qo'llanmasi: <https://angular.dev/update-guide>
