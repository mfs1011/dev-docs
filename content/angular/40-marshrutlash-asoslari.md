# 40 — Marshrutlash asoslari

[← Oldingi: DI naqshlari](39-di-naqshlari.md) · [Mundarija](README.md) · [Keyingi: Parametrlar va komponentga bog'lash →](41-parametrlar.md)

## Tushuncha

SPA'da sahifa qayta yuklanmaydi — URL o'zgaradi, Angular esa **qaysi komponent** chiqishini URL'ga qarab hal qiladi. Buni **Router** qiladi.

Uch qism:

| Qism | Vazifa |
| --- | --- |
| `Routes` | URL → komponent xaritasi |
| `<router-outlet />` | Tanlangan komponent chiqadigan joy |
| `routerLink` | Sahifa qayta yuklanmaydigan havola |

`ng new` Router'ni tayyor ulaydi:

```ts
// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
```

## Nega shunday

Nega `@if (page() === 'orders')` bilan qilmaymiz?

| `@if` bilan | Router bilan |
| --- | --- |
| URL o'zgarmaydi — havolani ulashib bo'lmaydi | `/orders/42` — to'g'ridan-to'g'ri ochiladi |
| Brauzerning "orqaga" tugmasi ishlamaydi | Tarix ishlaydi |
| Hamma sahifa bitta bundle'da | Lazy loading (43-bob) |
| Ruxsat tekshiruvi qo'lda | Guardlar (44-bob) |

## Kod: marshrutlar

```ts
// app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', component: Home, title: 'Bosh sahifa' },
  { path: 'products', component: ProductList, title: 'Mahsulotlar' },
  { path: 'products/:id', component: ProductDetail },
  { path: 'about', component: About, title: 'Biz haqimizda' },
  { path: 'info', redirectTo: 'about' },
  { path: '**', component: NotFound, title: 'Topilmadi' },
];
```

| Maydon | Ma'no |
| --- | --- |
| `path: ''` | Ildiz (`/`) |
| `path: 'products/:id'` | `:id` — parametr (41-bob) |
| `title` | `document.title` (46-bob) |
| `redirectTo` | Boshqa yo'lga yo'naltirish |
| `path: '**'` | Hech narsa mos kelmasa — **har doim oxirida** |

### Tartib muhim

Router ro'yxatni **yuqoridan pastga** ko'rib chiqadi va **birinchi** mos kelganini oladi:

```ts
[
  { path: '**', component: NotFound },          // ❌ hamma narsani yutadi
  { path: 'products', component: ProductList }, // hech qachon yetib kelmaydi
]
```

Aniq yo'llar — yuqorida, umumiylari — pastda, `**` — eng oxirida.

### `pathMatch`

```ts
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
```

Bo'sh `path` + `redirectTo` da `pathMatch: 'full'` **shart**. Aks holda `''` har qanday URL'ning boshiga mos keladi (`'prefix'` sukut bo'yicha) va hamma narsa `dashboard` ga ketadi.

## Kod: outlet va havolalar

```ts
// app.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" ariaCurrentWhenActive="page">Bosh</a>
      <a routerLink="/products" routerLinkActive="active" ariaCurrentWhenActive="page">Mahsulotlar</a>
    </nav>

    <main>
      <router-outlet />
    </main>
  `,
})
export class App {}
```

| Direktiva | Vazifa |
| --- | --- |
| `routerLink="/products"` | Sahifa qayta yuklanmaydi; `href` avtomatik |
| `[routerLink]="['/products', p.id]"` | Segmentlar massivi — `/products/42` |
| `routerLinkActive="active"` | Faol havolaga klass |
| `[routerLinkActiveOptions]="{ exact: true }"` | `/` hamma sahifada faol bo'lmasligi uchun |
| `ariaCurrentWhenActive="page"` | Ekran o'quvchilari uchun `aria-current` |

Oddiy `<a href="/products">` ishlaydi, lekin **butun sahifani qayta yuklaydi** — holat yo'qoladi, ilova qayta ishga tushadi.

### Nisbiy havolalar

```html
<!-- /products sahifasida -->
<a routerLink="42">...</a>          <!-- /products/42 -->
<a routerLink="../about">...</a>    <!-- /about -->
<a routerLink="/about">...</a>      <!-- har doim /about -->
```

`/` bilan boshlansa — mutlaq, aks holda joriy marshrutga nisbatan.

## Kod: dasturiy navigatsiya

```ts
export class ProductForm {
  private readonly router = inject(Router);

  protected async save() {
    const product = await this.api.create(this.form.value());
    await this.router.navigate(['/products', product.id]);
  }
}
```

`navigate` / `navigateByUrl` — batafsil 45-bobda.

## Kod: server sozlamasi

Router HTML5 History API'dan foydalanadi — URL `/products/42`, `#` siz. Muammo: foydalanuvchi `/products/42` ni to'g'ridan-to'g'ri ochsa, server shunday **faylni** qidiradi va 404 beradi.

Yechim — server barcha noma'lum yo'llar uchun `index.html` qaytarsin:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

`ng serve` buni o'zi qiladi. SSR ishlatsangiz (62-bob) — server o'zi render qiladi.

Server sozlab bo'lmasa (masalan, ba'zi statik hostinglar) — `withHashLocation()`: URL `/#/products/42` bo'ladi. Oxirgi chora — SEO va chiroyli URL yo'qoladi.

## Muhandislik nuqtai nazari

**Marshrutlar faylini tartibli saqlang:**

```ts
export const routes: Routes = [
  { path: '', component: Home },
  { path: 'products', loadChildren: () => import('./products/products.routes') },
  { path: 'account', loadChildren: () => import('./account/account.routes') },
  { path: '**', component: NotFound },
];
```

Ildiz faylda — faqat yuqori darajali bo'limlar. Har bo'lim o'z `*.routes.ts` fayliga ega (43-bob). 50 ta marshrutli bitta fayl — o'qib bo'lmaydi.

**URL — interfeys.** `/products/42` ni foydalanuvchilar saqlaydi, ulashadi, Google indekslaydi. O'zgartirsangiz — eski yo'ldan `redirectTo` qoldiring.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `**` ro'yxat boshida | Hamma sahifa NotFound | Eng oxirida |
| `path: '', redirectTo` + `pathMatch` yo'q | Hamma URL yo'naltiriladi | `pathMatch: 'full'` |
| `<a href>` ichki havola uchun | Sahifa to'liq qayta yuklanadi | `routerLink` |
| `RouterLink` ni `imports` ga qo'shmaslik | Havola oddiy matn, bosilmaydi | `imports: [RouterLink]` |
| `/` havolasida `exact` yo'q | "Bosh" doim faol | `[routerLinkActiveOptions]="{ exact: true }"` |
| Serverda `try_files` yo'q | To'g'ridan-to'g'ri ochilganda 404 | `index.html` ga fallback |
| `path: '/products'` | Xato — yo'l `/` bilan boshlanmaydi | `path: 'products'` |

## Amaliyot

1. `Home`, `Products`, `About`, `NotFound` sahifalari bilan marshrutlar yozing.
2. Navigatsiyada `routerLinkActive` + `ariaCurrentWhenActive` ishlating; `/` uchun `exact`.
3. `**` ni ro'yxat boshiga qo'yib, natijani ko'ring — keyin tuzating.
4. `pathMatch` siz `{ path: '', redirectTo: 'products' }` yozing — `/about` ga kirib ko'ring.
5. `ng build` qiling va natijani oddiy statik server bilan oching; `/about` ni to'g'ridan-to'g'ri ochib, fallback kerakligini ko'ring.

## Rasmiy hujjat

- Marshrutlashga kirish: <https://angular.dev/guide/routing>
- Marshrutlarni aniqlash: <https://angular.dev/guide/routing/define-routes>
- Navigatsiya: <https://angular.dev/guide/routing/navigate-to-routes>
