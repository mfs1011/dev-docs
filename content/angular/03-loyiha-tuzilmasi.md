# 03 — Loyiha tuzilmasi va bootstrap

[← Oldingi: O'rnatish va birinchi ilova](02-ornatish.md) · [Mundarija](README.md) · [Keyingi: Angular uchun TypeScript →](04-typescript.md)

## Tushuncha

`ng new` yaratgan har fayl bitta savolga javob beradi. Bu bobda ular qanday bog'langanini ko'ramiz: brauzer `index.html` ni ochganidan to ekranda birinchi komponent paydo bo'lguncha.

```
index.html          <app-root></app-root>  ← bo'sh teg
    │
    ▼
main.ts             bootstrapApplication(App, appConfig)
    │                        │           │
    │                        │           └── app.config.ts — provayderlar
    │                        └── app.ts — ildiz komponent
    ▼
<app-root> ichiga App komponenti render qilinadi
```

Bu jarayon **bootstrap** deyiladi — ilovani "ishga tushirish".

## Nega shunday

Angular ilova konfiguratsiyasini (qaysi xizmatlar, qaysi marshrutlar) **komponentdan ajratadi**:

| Fayl | Javob beradi |
| --- | --- |
| `app.ts` | Ekranda nima ko'rinadi |
| `app.config.ts` | Ilova qanday ishlaydi (router, HTTP, xatolar) |
| `app.routes.ts` | Qaysi URL qaysi komponentni ochadi |
| `main.ts` | Uchalasini bog'laydi |

Shunda testda `App` ni boshqa konfiguratsiya bilan ishga tushirish, server rendering uchun alohida konfiguratsiya qo'shish (62-bob) oson bo'ladi.

## Kod: `index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MyApp</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
```

Uch narsa muhim:

1. **`<app-root>`** — bo'sh teg. Ilova shu yerga joylashadi. Nomi `App` komponentining `selector` iga mos keladi.
2. **`<base href="/">`** — marshrutlash nisbiy yo'llarni shunga nisbatan hisoblaydi. Ilova `/admin/` kabi ichki yo'lda joylashsa, shu qiymat o'zgaradi.
3. **Skript tegi yo'q.** Build vaqtida CLI JS va CSS fayllarni o'zi qo'shadi.

Birinchi qiladigan ish: `lang="en"` ni `lang="uz"` ga almashtiring — skrin rider va brauzer tarjimoni uchun muhim (75-bob).

## Kod: `main.ts`

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

Bitta chaqiruv: "`App` komponentini `appConfig` sozlamalari bilan ishga tushir". `.catch` — ishga tushirish xatosini konsolga chiqaradi (masalan, provayder topilmasa).

> **Ilgari shunday edi.** v14 gacha `main.ts` modul ishga tushirardi:
> `platformBrowserDynamic().bootstrapModule(AppModule)`. Eski loyihada shu qatorni ko'rsangiz — ilova `NgModule` asosida (69-bob).

## Kod: `app.config.ts`

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

`providers` — ilovaga nima kerakligi ro'yxati. Har element `provide*` funksiyasi bilan qo'shiladi:

| Provayder | Nima qiladi |
| --- | --- |
| `provideBrowserGlobalErrorListeners()` | Ushlanmagan xatolar va rad etilgan promise'larni Angular'ning xato ishlovchisiga yo'naltiradi |
| `provideRouter(routes)` | Marshrutlashni yoqadi |

Keyinchalik bu ro'yxatga qo'shiladi:

```ts
providers: [
  provideBrowserGlobalErrorListeners(),
  provideRouter(routes, withComponentInputBinding()),     // 41-bob
  provideHttpClient(withInterceptors([authInterceptor])), // 55–56-bob
  provideAppInitializer(() => inject(Session).restore()), // 7-bob
]
```

**Diqqat qiling, nima yo'q:** `provideZoneChangeDetection()` va `zone.js`. Angular 21 dan yangi loyihalar **zoneless** — o'zgarishlarni aniqlash signallar orqali ishlaydi. `package.json` da `zone.js` paketi umuman yo'q. Bu 23-bobda ochiladi.

## Kod: `app.routes.ts`

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [];
```

Hozircha bo'sh. Marshrutlar qo'shilgach:

```ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', loadComponent: () => import('./about/about').then((m) => m.About) },
  { path: '**', component: NotFound },
];
```

Marshrutlash 40–46-boblarda.

## Kod: `app.ts` — ildiz komponent

```ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-app');
}
```

| Qism | Nima |
| --- | --- |
| `imports: [RouterOutlet]` | Shablonda ishlatiladigan boshqa komponent va direktivalar |
| `selector: 'app-root'` | `index.html` dagi teg bilan bog'lanadi |
| `templateUrl` | Shablon alohida faylda |
| `styleUrl` | Stil alohida faylda, faqat shu komponentga ta'sir qiladi |

`standalone: true` yozilmagan — v19 dan bu sukut bo'yicha. Eski kodda ko'rsangiz, shunchaki olib tashlash mumkin.

`imports` — Angular'ning muhim qoidasi: **shablonda ishlatiladigan har narsa shu yerda import qilinishi kerak**. `<router-outlet />` ishlatilsa — `RouterOutlet` import qilinadi. Unutilsa, kompilyator xato beradi: `'router-outlet' is not a known element`.

## Kod: `angular.json`

Loyihaning "boshqaruv paneli". Asosiy qismlari:

```json
{
  "projects": {
    "my-app": {
      "prefix": "app",
      "architect": {
        "build": {
          "builder": "@angular/build:application",
          "options": {
            "browser": "src/main.ts",
            "tsConfig": "tsconfig.app.json",
            "assets": [{ "glob": "**/*", "input": "public" }],
            "styles": ["src/styles.css"]
          },
          "configurations": {
            "production": { "budgets": [ ... ], "outputHashing": "all" },
            "development": { "optimization": false, "sourceMap": true }
          },
          "defaultConfiguration": "production"
        },
        "serve": { "builder": "@angular/build:dev-server" },
        "test": { "builder": "@angular/build:unit-test" }
      }
    }
  }
}
```

| Maydon | Ma'nosi |
| --- | --- |
| `prefix: "app"` | `ng generate` yaratgan selektorlar `app-` bilan boshlanadi |
| `builder: "@angular/build:application"` | esbuild asosidagi build tizimi |
| `browser: "src/main.ts"` | Kirish nuqtasi |
| `assets` | `public/` dagi fayllar build'ga nusxalanadi |
| `styles` | Global stil fayllari |
| `configurations` | `production` va `development` rejimlari |

`npm run build` → `production`, `npm start` → `development`. Farqi: productionda kod siqiladi, fayl nomlariga hash qo'shiladi, byudjet tekshiriladi.

## Kod: `tsconfig.json`

```json
{
  "compilerOptions": {
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "preserve"
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true
  }
}
```

`strict: true` ko'rinmaydi — lekin u **yoqilgan**: TypeScript 6.0 dan sukut bo'yicha `true`. Xuddi shunday, Angular'ning `strictTemplates` (shablonlarni qat'iy tip tekshiruvi) ham sukut bo'yicha yoqilgan. Bu haqda 4-bobda.

## Kod: `public/` va `styles.css`

- **`public/`** — o'zgarmasdan build'ga ko'chiriladigan fayllar: favicon, `robots.txt`, rasmlar. `public/logo.svg` → `/logo.svg` manzilida ochiladi.
- **`src/styles.css`** — global stillar. Butun ilovaga ta'sir qiladi. Komponent stillari esa (`app.css`) faqat o'z komponentiga (30-bob).

## Muhandislik nuqtai nazari: papkalar qanday o'sadi

`ng new` faqat ildizni beradi. Ilova o'sganda, rasmiy uslub qo'llanmasi **xususiyat (feature) bo'yicha** guruhlashni tavsiya qiladi, turi bo'yicha emas:

```
❌ Turi bo'yicha                 ✅ Xususiyat bo'yicha
src/app/                        src/app/
├── components/                 ├── orders/
│   ├── order-list.ts           │   ├── order-list.ts
│   ├── order-card.ts           │   ├── order-card.ts
│   └── user-profile.ts         │   ├── order-api.ts
├── services/                   │   └── order.routes.ts
│   ├── order-api.ts            ├── profile/
│   └── user-api.ts             │   ├── user-profile.ts
└── models/                     │   └── user-api.ts
    └── order.ts                └── shared/
                                    └── ui/
```

Sabab: bitta xususiyat ustida ishlaganda barcha kerakli fayllar bir joyda. "Buyurtmalar" bo'limini o'chirish — bitta papkani o'chirish.

Katta ilovalar uchun qat'iyroq tuzilma — **Feature-Sliced Design** — alohida qo'llanmada ko'riladi: [FSD qo'llanmasi](../fsd/README.md), Angular shabloni — V qismda.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Shablonda ishlatilgan komponentni `imports` ga qo'shmaslik | `is not a known element` | `imports: [...]` |
| `<base href>` ni noto'g'ri qo'yish | Ichki sahifada 404, stillar yuklanmaydi | Joylashuv yo'liga moslang |
| Provayderni komponentga qo'yish (ilova darajasida kerak bo'lsa) | Har komponentda alohida nusxa | `app.config.ts` ga (37-bob) |
| `lang="en"` ni qoldirish | Noto'g'ri talaffuz, tarjima | `lang="uz"` |
| Statik faylni `src/` ga qo'yish | Build'ga tushmaydi | `public/` |
| `zone.js` ni qaytadan qo'shish | Keraksiz, sekinroq | Zoneless'da qoling (23-bob) |

## Amaliyot

1. `index.html` da `lang` ni `uz` ga o'zgartiring.
2. `main.ts` da `appConfig` ni olib tashlab ishga tushirib ko'ring — qanday xato chiqadi? Qaytaring.
3. `app.html` ga `<router-outlet />` qoldirib, `imports` dan `RouterOutlet` ni olib tashlang — kompilyator xatosini o'qing.
4. `public/` ga `robots.txt` qo'ying va `http://localhost:4200/robots.txt` da ochilishini tekshiring.
5. `angular.json` da `initial` byudjetni `1kB` ga tushiring va `npm run build` qiling — nima bo'ladi? Qaytaring.
6. `package.json` da `zone.js` borligini qidiring. Yo'qligining sababini 23-bobda o'qing.

## Rasmiy hujjat

- Fayl tuzilmasi: <https://angular.dev/reference/configs/file-structure>
- Ishga tushirish: <https://angular.dev/api/platform-browser/bootstrapApplication>
- Workspace konfiguratsiyasi: <https://angular.dev/reference/configs/workspace-config>
- Uslub qo'llanmasi: <https://angular.dev/style-guide>
