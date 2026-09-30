# 78 — Amaliy loyiha va checklist

[← Oldingi: Ko'p tillilik](77-i18n.md) · [Mundarija](README.md)

## Tushuncha

Bu bob — kitobdagi hamma narsani bitta ilovada birlashtirish: **"Do'kon"** — katalog, mahsulot sahifasi, savat, checkout, kabinet va admin. Maqsad — kod emas, **qarorlar**: har qism uchun qaysi vosita va nega.

| Talab | Qaror | Bob |
| --- | --- | --- |
| Katalog va mahsulotlar SEO bilan | SSR/SSG, `getPrerenderParams` | 62–65 |
| Tez birinchi ochilish | Lazy bo'limlar, `@defer`, `NgOptimizedImage` | 43, 12, 74 |
| Savat — butun sessiya | Signal store (`@Service()`), persist | 60 |
| Checkout formasi | Signal Forms, server xatolari | 48–51 |
| Login, token | Access xotirada, refresh `HttpOnly` cookie, single-flight | 58 |
| Admin — faqat ruxsat bilan | `canMatch` + ruxsatlar | 44, 59 |
| O'zbek va ingliz tillari | `@angular/localize` | 77 |
| Brend dizayni | Aria + CDK + o'z tokenlari | 66–67 |

## Kod: papka tuzilishi

```
src/app/
├── app.ts, app.config.ts, app.config.server.ts
├── app.routes.ts, app.routes.server.ts
│
├── core/                       # bir marta, butun ilova uchun
│   ├── auth/                   # Auth, authInterceptor, guardlar
│   ├── http/                   # baseUrl, error, loading interceptorlari
│   ├── config/                 # APP_CONFIG, API_URL tokenlari
│   └── layout/                 # MainLayout, AuthLayout, header
│
├── shared/                     # biznesdan xabarsiz
│   ├── ui/                     # ui-button, ui-tabs (Aria), ui-dialog (CDK)
│   ├── forms/                  # FieldErrors, errorText, uzPhone
│   └── utils/                  # cleanParams, userMessage
│
├── entities/                   # biznes obyektlari
│   ├── product/                # Product tipi, ProductApi, productSchema
│   ├── order/
│   └── user/
│
└── features/                   # foydalanuvchi ssenariylari = lazy bo'limlar
    ├── catalog/                # catalog.routes.ts, ro'yxat, filtrlar
    ├── product/                # mahsulot sahifasi
    ├── cart/                   # CartStore, savat sahifasi
    ├── checkout/               # CheckoutFacade, forma
    ├── account/                # kabinet (Client rejim)
    └── admin/                  # canMatch bilan
```

Bog'liqlik yo'nalishi — faqat **pastga**: `features → entities → shared`, `core` hamma joyda. `features/cart` `features/checkout` ni import qilmaydi — umumiy narsa `entities` ga tushadi. Bu — Feature-Sliced Design g'oyalarining soddalashtirilgan shakli (alohida FSD qo'llanmasida batafsil). Qoidani `eslint` bilan majburlash mumkin (`import/no-restricted-paths` yoki `eslint-plugin-boundaries`).

## Kod: marshrutlar

```ts
// app.routes.ts
export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', loadComponent: () => import('./features/catalog/home'), title: 'Bosh sahifa' },
      { path: 'catalog', loadChildren: () => import('./features/catalog/catalog.routes') },
      { path: 'products/:slug', loadComponent: () => import('./features/product/product-page'), title: productTitle },
      { path: 'cart', loadComponent: () => import('./features/cart/cart-page'), title: 'Savat' },
      { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.routes') },
      { path: 'account', canActivate: [authGuard], loadChildren: () => import('./features/account/account.routes') },
      { path: 'admin', canMatch: [permissionGuard('admin:access')], loadChildren: () => import('./features/admin/admin.routes') },
    ],
  },
  { path: '', component: AuthLayout, canActivate: [guestGuard], children: [
    { path: 'login', loadComponent: () => import('./core/auth/login'), title: 'Kirish' },
  ] },
  { path: '**', loadComponent: () => import('./core/layout/not-found'), title: 'Topilmadi' },
];
```

```ts
// app.routes.server.ts
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'catalog/**', renderMode: RenderMode.Server, headers: { 'Cache-Control': 'public, s-maxage=300' } },
  {
    path: 'products/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    getPrerenderParams: async () => (await inject(ProductApi).popularSlugs()).map((slug) => ({ slug })),
  },
  { path: 'cart', renderMode: RenderMode.Client },
  { path: 'checkout/**', renderMode: RenderMode.Client },
  { path: 'account/**', renderMode: RenderMode.Client },
  { path: 'admin/**', renderMode: RenderMode.Client },
  { path: 'login', renderMode: RenderMode.Client },
  { path: '**', renderMode: RenderMode.Server, status: 404 },
];
```

Ommaviy sahifalar — SSR/SSG (SEO, tezlik); shaxsiy sahifalar — Client (sodda, xavfsiz, keshlanmaydi).

## Kod: ilova konfiguratsiyasi

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions(),
      withNavigationErrorHandler(reloadOnChunkError),
    ),
    provideHttpClient(withInterceptors([baseUrlInterceptor, authInterceptor, loadingInterceptor, errorInterceptor])),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(() => firstValueFrom(inject(Auth).refresh()).catch(() => null)),
    { provide: TitleStrategy, useExisting: AppTitleStrategy },
    { provide: APP_CONFIG, useValue: environment },
  ],
};
```

Har qator — kitobning bir bobi: input bog'lash va uning tuzog'i (41), scroll (46), chunk xatosi (43), interceptor tartibi (56), hydration (64), sessiyani tiklash (58), title (46), konfiguratsiya (38).

## Kod: bitta feature — oxirigacha

Mahsulot sahifasi:

```ts
@Component({
  selector: 'app-product-page',
  imports: [NgOptimizedImage, CurrencyPipe, AddToCart, ProductReviews, UiTabs],
  template: `
    @if (product.hasValue()) {
      @let p = product.value();
      <img [ngSrc]="p.image" width="800" height="800" priority [alt]="p.name" />
      <h1>{{ p.name }}</h1>
      <p class="price">{{ p.price | currency: 'UZS' }}</p>
      <app-add-to-cart [product]="p" />

      @defer (hydrate on viewport) {
        <app-product-reviews [productId]="p.id" />
      } @placeholder {
        <p i18n>Sharhlar yuklanmoqda…</p>
      }
    } @else if (product.error()) {
      <app-not-found-message />
    } @else {
      <app-product-skeleton />
    }
  `,
})
export default class ProductPage {
  readonly slug = input.required<string>();
  protected readonly product = httpResource<Product>(() => `/products/${this.slug()}`, {
    parse: (raw) => ProductSchema.parse(raw),
  });

  constructor() {
    const res = inject(RESPONSE_INIT);
    effect(() => { if (res && this.product.error()) res.status = 404; });
  }
}
```

Bitta komponentda: marshrut input (41), `httpResource` + Zod (21, 57), `NgOptimizedImage` LCP (74), incremental hydration (64), SSR status (62), uch holat — yuklanish/xato/ma'lumot (57).

Testlar:

| Qatlam | Test |
| --- | --- |
| `CartStore`, `orderTotal` | Birlik (71) |
| `ProductPage` — uch holat | Komponent, `RouterTestingHarness` (72) |
| Katalog → mahsulot → savat → checkout | E2E (73) |
| a11y | `@axe-core/playwright` (73, 75) |

## Reliz checklist

### Kod sifati
- [ ] `ng build` — ogohlantirishsiz; byudjetlar ichida (70)
- [ ] `ng test --watch=false` — yashil; biznes mantiq testlangan (71–72)
- [ ] E2E asosiy oqimlar — yashil (73)
- [ ] `ng lint` (angular-eslint) — `templateAccessibility` bilan (75)
- [ ] `strictTemplates`, TypeScript `strict` — o'chirilmagan (4)

### Unumdorlik
- [ ] LCP ≤ 2.5 s (mobil, 4G) — Lighthouse va RUM (74)
- [ ] LCP rasmida `priority`; barcha rasmlar `NgOptimizedImage` (74)
- [ ] Bo'limlar lazy; og'ir bloklar `@defer` (43, 12)
- [ ] Katta ro'yxatlar — virtual scroll yoki sahifalash (66, 74)
- [ ] Shablonda metod chaqiruvlari yo'q — `computed` (74)

### SSR va deploy
- [ ] `allowedHosts` sozlangan (62)
- [ ] Har marshrut uchun to'g'ri `RenderMode` va `Cache-Control` (63)
- [ ] `**` → 404 status (63)
- [ ] Serverda `window`/`localStorage` yo'q — `afterNextRender`, adapterlar (62)
- [ ] Statik fayllar `immutable`, HTML `no-cache` (65)
- [ ] Health check, loglar, xato monitoringi (Sentry) (65)

### Xavfsizlik
- [ ] `bypassSecurityTrust*` — faqat asoslangan joylarda (76)
- [ ] CSP (`autoCsp` yoki server sarlavhasi), `frame-ancestors` (76)
- [ ] Bundle'da sirlar yo'q (76)
- [ ] Token saqlash va refresh — 58-bob bo'yicha
- [ ] `returnUrl` tekshiriladi (59)
- [ ] `npm audit --omit=dev` (76)

### Erishimlilik
- [ ] Klaviatura bilan asosiy oqimlar (75)
- [ ] Marshrut almashishi e'lon qilinadi, fokus `<main>` ga (75)
- [ ] Forma xatolari `aria-describedby` bilan (49, 75)
- [ ] Kontrast AA, `:focus-visible` (75)
- [ ] `lang` atributi to'g'ri (3, 77)

### Ko'p tillilik
- [ ] Barcha matnlar `i18n` / `$localize` (77)
- [ ] `i18nMissingTranslation: "error"` CI'da (77)
- [ ] Sana/raqam/valyuta — pipe'lar orqali (13, 77)

### Kuzatish
- [ ] Web Vitals RUM (74)
- [ ] Xatolar: brauzer va SSR server (57, 65)
- [ ] `ng update` rejasi — har asosiy versiyada (70)

## Muhandislik nuqtai nazari

Angular 22 ning asosiy yo'nalishi — **kamroq sehr, ko'proq aniqlik**:

| Oldin | Hozir |
| --- | --- |
| Zone.js avtomatik CD | Signallar — nima o'zgarsa, faqat shu |
| NgModule bilvosita importlar | Standalone — har komponent o'z importlarini aytadi |
| `@Input` / `@Output` dekoratorlari | `input()`, `output()`, `model()` — tipli signallar |
| Konstruktor DI | `inject()` — funksiyalarda ham |
| `*ngIf` direktivalari | `@if` — kompilyator tushunadi |
| Reactive Forms'da ikki model | Signal Forms — bitta model |
| To'liq hydration | Incremental — faqat kerak joyda |

Bu yo'nalishni tushunsangiz, keyingi versiyalar ham oldindan aytib bo'ladigan bo'ladi.

Kitob shu yerda tugaydi, o'rganish — yo'q. Rasmiy hujjat (<https://angular.dev>) — birinchi manba; har yangi versiyada **"What's new"** va `ng update` migratsiyalarini o'qing.

## Amaliyot

1. "Do'kon" ilovasini yuqoridagi papka tuzilishi bilan yarating (`ng new shop --ssr`).
2. Katalog + mahsulot sahifasi (SSR/SSG) + savat (signal store).
3. Login + refresh oqimi + himoyalangan checkout.
4. Checkout formasi — Signal Forms, server 422 xatolari bilan.
5. Admin bo'limi — `canMatch` + ruxsatlar; chunk yuklanmasligini tekshiring.
6. Ikki til, CSP, Lighthouse ≥ 90, E2E asosiy oqim — reliz checklist'ini to'liq o'ting.

## Rasmiy hujjat

- Angular hujjati: <https://angular.dev>
- Yangilash qo'llanmasi: <https://angular.dev/update-guide>
- Eng yaxshi amaliyotlar: <https://angular.dev/best-practices>
- Style guide: <https://angular.dev/style-guide>
