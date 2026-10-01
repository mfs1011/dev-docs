# 31 — Angular shabloni

[← Oldingi: Nuxt shabloni](30-nuxt-shabloni.md) · [Mundarija](README.md) · [Keyingi: Monorepo va bir nechta FSD ildizi →](32-monorepo.md)

## Qisqacha

Rasmiy FSD hujjatida Angular uchun alohida qo'llanma **yo'q** — bu shablon shu bo'shliqni to'ldiradi. Angular'da qulay tasodif bor: CLI allaqachon `src/app/` yaratadi, va u FSD'ning `app` qatlamiga to'g'ri keladi. Qolgan qatlamlar `src/` ichida uning yonida turadi, `@/` yo'li `tsconfig.json`'dagi `paths` orqali beriladi. Standalone komponentlar, `inject()` va signallar FSD bilan tabiiy ishlaydi: har komponent o'z importlarini o'zi e'lon qiladi, NgModule'lar yo'q.

2026-yil oktabrda `ng new` bilan yaratilgan **Angular 22.2** (zoneless, TypeScript 6.0) loyihasida tekshirildi: `ng build` ✅, `npx steiger src` ✅. Steiger Angular `.ts` fayllaridagi cross-import va public API'ni chetlab o'tishni ham ushlaydi — sinaldi.

## Qoida

| Narsa | Joy |
| --- | --- |
| Ildiz komponent (`App`) | `src/app/app.ts` |
| `main.ts`, `app.config.ts` | `src/app/entrypoint/` (`angular.json` → `"browser"`) |
| Marshrutlar | `src/app/routes/app.routes.ts` — sahifalar `loadComponent` bilan, public API orqali |
| Global stil | `src/app/styles/global.css` (`angular.json` → `"styles"`) |
| Interceptor'lar | `src/shared/api`; ulanishi — `app.config.ts`'da |
| `InjectionToken`'lar (env, konfiguratsiya) | `src/shared/config`; qiymati — `app.config.ts`'da |
| Signal store / servislar | Tegishli slice'ning `model` segmenti (`entities/cart/model/cart-store.ts`) |
| Pipe'lar | Ishlatiladigan `ui` yonida — `pipes/` segmenti yo'q (Steiger `pipes`'ni rad etadi) |

Fayl nomlari Angular 20+ uslub qo'llanmasiga mos: `product-card.ts`, sinf `ProductCard` (`.component` qo'shimchasisiz).

## Shablon: papka daraxti

```text
my-shop/
├── angular.json                        "browser": "src/app/entrypoint/main.ts", styles, assets
├── tsconfig.json                       "paths": { "@/*": ["./src/*"] }
├── steiger.config.ts
└── src/
    ├── index.html
    ├── app/
    │   ├── app.ts                       ildiz komponent: <app-header/> + <router-outlet/>
    │   ├── entrypoint/
    │   │   ├── main.ts                  bootstrapApplication
    │   │   └── app.config.ts            provideRouter, provideHttpClient, APP_ENV
    │   ├── routes/app.routes.ts
    │   └── styles/global.css
    ├── pages/
    │   ├── home/      ui/home-page.ts  ui/hero.svg   index.ts
    │   └── product/   ui/product-page.ts             index.ts
    ├── widgets/
    │   └── header/    ui/header.ts                   index.ts
    ├── features/
    │   └── add-to-cart/  ui/add-to-cart-button.ts     index.ts
    ├── entities/
    │   ├── cart/      model/cart-store.ts  ui/cart-counter.ts  index.ts
    │   └── product/   ui/product-card.ts   lib/format-price.ts index.ts
    └── shared/
        ├── api/       api-url.interceptor.ts  product/  cart/  index.ts
        ├── config/    env.ts  index.ts
        ├── routes/    index.ts
        └── ui/button/ button.ts  index.ts
```

## Kod: sozlama

```bash
ng new my-shop --defaults --zoneless --ssr=false --style=css
cd my-shop
npm i -D steiger @feature-sliced/steiger-plugin
rm -rf src/app/* src/main.ts src/styles.css     # CLI fayllari FSD tuzilmasi bilan almashtiriladi
```

```jsonc
// angular.json → projects.<nom>.architect.build.options
"browser": "src/app/entrypoint/main.ts",
"styles": ["src/app/styles/global.css"],
"assets": [
  { "glob": "**/*", "input": "public" },
  { "glob": "**/*.{svg,png,jpg,webp}", "input": "src/pages", "output": "pages" }   // slice rasmlari
]
```

```jsonc
// tsconfig.json → compilerOptions; baseUrl shart emas, esbuild builder paths'ni tushunadi
"paths": { "@/*": ["./src/*"] }
```

```ts
// steiger.config.ts — Angular shabloni uchun istisno kerak emas
import { defineConfig } from 'steiger'
import fsd from '@feature-sliced/steiger-plugin'

export default defineConfig([...fsd.configs.recommended])
```

## Kod: `app` qatlami

```ts
// src/app/entrypoint/main.ts
import { bootstrapApplication } from '@angular/platform-browser'
import { App } from '../app'
import { appConfig } from './app.config'

bootstrapApplication(App, appConfig).catch((err) => console.error(err))

// src/app/entrypoint/app.config.ts
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { APP_ENV } from '@/shared/config'
import { apiUrlInterceptor } from '@/shared/api'
import { routes } from '../routes/app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([apiUrlInterceptor])),
    { provide: APP_ENV, useValue: { apiUrl: '/api', isProd: false } },
  ],
}

// src/app/routes/app.routes.ts
import type { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', loadComponent: () => import('@/pages/home').then((m) => m.HomePage) },
  { path: 'products/:id', loadComponent: () => import('@/pages/product').then((m) => m.ProductPage) },
]
```

## Kod: sahifa → feature → entity → shared

```ts
// src/shared/api/product/product.ts — httpResource uchun so'rovlar bir joyda
import type { HttpResourceRequest } from '@angular/common/http'

export interface ProductDto { id: string; title: string; priceMinor: number }

export const PRODUCT_REQUESTS = {
  list: (): HttpResourceRequest => ({ url: '/products' }),
  detail: (id: string): HttpResourceRequest => ({ url: `/products/${id}` }),
}

// src/pages/product/ui/product-page.ts — marshrut parametri input orqali
@Component({
  selector: 'app-product-page',
  imports: [AddToCartButton],
  template: `
    @if (product.isLoading()) {
      <p>Yuklanmoqda…</p>
    } @else if (product.error()) {
      <p>Mahsulot topilmadi</p>
    } @else if (product.value(); as p) {
      <main>
        <h1>{{ p.title }}</h1>
        <p>{{ price(p.priceMinor) }}</p>
        <app-add-to-cart-button [productId]="p.id" />
      </main>
    }
  `,
})
export class ProductPage {
  readonly id = input.required<string>()   // withComponentInputBinding()
  protected readonly product = httpResource<ProductDto>(() => PRODUCT_REQUESTS.detail(this.id()))
  protected readonly price = formatPrice
}

// src/features/add-to-cart/ui/add-to-cart-button.ts — entity store'ini yangilaydi
@Component({
  selector: 'app-add-to-cart-button',
  imports: [Button],
  template: `<app-button [disabled]="pending()" (click)="add()">Savatga</app-button>`,
})
export class AddToCartButton {
  readonly productId = input.required<string>()
  private readonly api = inject(CartApi)
  private readonly cart = inject(CartStore)
  protected readonly pending = signal(false)

  add() {
    this.pending.set(true)
    this.api.add(this.productId())
      .pipe(finalize(() => this.pending.set(false)))
      .subscribe((summary) => this.cart.apply(summary))
  }
}

// src/entities/product/ui/product-card.ts — harakat content projection orqali tashqaridan
@Component({
  selector: 'app-product-card',
  template: `
    <article>
      <h3>{{ product().title }}</h3>
      <p>{{ price() }}</p>
      <ng-content />
      <ng-content select="[actions]" />
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<ProductDto>()
  protected readonly price = computed(() => formatPrice(this.product().priceMinor))
}
```

## Kod: slice rasmlari — ikki tekshirilgan yo'l

```ts
// 1) assets glob (yuqoridagi angular.json) — URL yo'l bilan
template: `<img src="pages/home/ui/hero.svg" alt="" />`        // dist/browser/pages/home/ui/hero.svg

// 2) esbuild loader — import bilan, nomida hash (keshlash uchun yaxshiroq)
// angular.json → build.options:  "loader": { ".svg": "file" }
// src/shared/lib/untyped-assets/svg.d.ts:  declare module '*.svg' { const url: string; export default url }
// src/shared/lib/untyped-assets/index.ts:  export {}      ← Steiger shared/lib papkasidan public API talab qiladi
import heroUrl from './hero.svg'                              // → media/hero-E5SYJHAT.svg
protected readonly hero = heroUrl                             // <img [src]="hero" />
```

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| NgRx Store | Store sozlamasi `app.config.ts`'da; feature state'lar tegishli slice `model`'ida (NgRx Signals — xuddi shunday) |
| `providedIn: 'root'` servislar | Mumkin; lekin servis slice'da yashaydi va public API orqali eksport qilinadi |
| Slice'ga xos provayder | Marshrut `providers` massivida (`app.routes.ts`) yoki komponent `providers` |
| NgModule'li eski loyiha | Avval standalone'ga migratsiya (Angular 69-bob), keyin FSD |
| Nx workspace | Har kutubxona — slice yoki qatlam; module boundaries tag'lari bilan (32, 34-boblar) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `src/app/components/`, `services/`, `models/`, `pipes/` | Tur bo'yicha papkalar; Steiger nomlarni rad etadi | Slice'lar + `ui`/`model`/`api` |
| `loadComponent: () => import('@/pages/home/ui/home-page')` | Public API chetlab o'tildi | `import('@/pages/home')` |
| Interceptor'ni `features`'da | Hamma so'rovga ta'sir qiladigan narsa feature emas | `shared/api` |
| Hamma servis `providedIn: 'root'` va `shared/services`'da | `shared` biznesga bog'lanadi | Servis o'z slice'ida |
| `tsconfig.app.json`'ga `paths` yozish | IDE va spec tsconfig'i ko'rmasligi mumkin | Ildiz `tsconfig.json`'da |

## Manbalar

- Angular: *Style guide* <https://angular.dev/style-guide>, *Workspace configuration* <https://angular.dev/reference/configs/workspace-config>
- Saytda: [Angular 3-bob — Loyiha tuzilmasi](../angular/03-loyiha-tuzilmasi.md), [Angular 43-bob — Lazy loading](../angular/43-lazy-loading.md), [Angular 60-bob — Signal xizmatlar](../angular/60-signal-xizmatlar.md), [Angular 28-bob — Kontent proyeksiyasi](../angular/28-kontent-proyeksiyasi.md)
