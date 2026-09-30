# 42 — Ichma-ich marshrutlar va layout

[← Oldingi: Parametrlar va komponentga bog'lash](41-parametrlar.md) · [Mundarija](README.md) · [Keyingi: Lazy loading →](43-lazy-loading.md)

## Tushuncha

Ko'p sahifalar umumiy "ramka"ga ega: yon menyu, sarlavha, tablar. Har sahifada takrorlamaslik uchun — **ichma-ich marshrutlar**: ota komponent ramkani chizadi, ichidagi `<router-outlet />` ga bola sahifa tushadi.

```
/account              → AccountLayout
  ├── /account        → AccountOverview    (path: '')
  ├── /account/orders → AccountOrders
  └── /account/settings → AccountSettings
```

## Nega shunday

Layout'ni har sahifaga `<app-account-sidebar />` qilib qo'yish ham mumkin. Farqi:

| Har sahifada layout | Ichma-ich marshrut |
| --- | --- |
| Sahifa almashganda layout **qayta yaratiladi** — menyu holati, scroll yo'qoladi | Layout **qoladi**, faqat ichi almashadi |
| Umumiy guard/provider har sahifada | Ota marshrutda bir marta |
| Takrorlanish | Bir joyda |

## Kod: layout

```ts
// account.routes.ts
export default [
  {
    path: '',
    component: AccountLayout,
    children: [
      { path: '', component: AccountOverview, title: 'Hisob' },
      { path: 'orders', component: AccountOrders, title: 'Buyurtmalar' },
      { path: 'orders/:id', component: AccountOrder },
      { path: 'settings', component: AccountSettings, title: 'Sozlamalar' },
    ],
  },
] satisfies Routes;
```

```ts
@Component({
  selector: 'app-account-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="account">
      <aside>
        <a routerLink="." routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Umumiy</a>
        <a routerLink="orders" routerLinkActive="active">Buyurtmalar</a>
        <a routerLink="settings" routerLinkActive="active">Sozlamalar</a>
      </aside>

      <section>
        <router-outlet />
      </section>
    </div>
  `,
})
export class AccountLayout {}
```

Nisbiy havolalar (`orders`, `.`) — layout ichida, uning marshrutiga nisbatan. Layout boshqa URL'ga ko'chirilsa ham havolalar ishlaydi.

## Kod: komponentsiz ota

Ota faqat **guruhlash** uchun bo'lsa — komponent kerak emas:

```ts
{
  path: 'admin',
  canActivate: [adminGuard],
  providers: [AdminStore],
  children: [
    { path: 'users', component: AdminUsers },
    { path: 'reports', component: AdminReports },
  ],
}
```

Bu yerda `admin` — guard va provayderni **bir marta** berish uchun. `<router-outlet />` kerak emas — bolalar yuqoridagi outlet'ga tushadi.

## Kod: turli layoutlar

Kirish sahifasi — menyusiz, qolgani — menyu bilan:

```ts
export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,                 // markazda karta, fon
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  {
    path: '',
    component: MainLayout,                 // header + sidebar
    canActivate: [authGuard],
    children: [
      { path: '', component: Dashboard },
      { path: 'products', loadChildren: () => import('./products/products.routes') },
    ],
  },
  { path: '**', component: NotFound },
];
```

Ikkala ota `path: ''` — Router bolalarga qarab tanlaydi: `/login` birinchi guruhda topiladi, `/products` — ikkinchisida.

**Diqqat:** `/` (bo'sh yo'l) birinchi guruhda yo'q, shuning uchun ikkinchisiga tushadi. Agar birinchi guruhda `{ path: '', ... }` bo'lsa — `/` o'shanga tushardi. Tartibni o'ylab tuzing.

## Kod: bola marshrutda ota ma'lumoti

```ts
{
  path: 'shops/:shopId',
  component: ShopLayout,
  resolve: { shop: shopResolver },
  children: [
    { path: '', component: ShopHome },
    { path: 'products', component: ShopProducts },
  ],
}
```

```ts
export class ShopProducts {
  readonly shopId = input.required<string>();
  readonly shop = input.required<Shop>();       // ota resolver natijasi
}
```

41-bobda ko'rilganidek, Angular 22 da ota parametrlari, `data` va resolver natijalari bolaga sukut bo'yicha meros qoladi.

## Kod: nomli outlet'lar

Bir sahifada ikkita mustaqil marshrutlanadigan joy — masalan, asosiy kontent va yon panel chat:

```html
<main><router-outlet /></main>
<aside><router-outlet name="aside" /></aside>
```

```ts
{ path: 'inbox', component: Inbox },
{ path: 'chat', component: Chat, outlet: 'aside' },
```

```ts
// Yon panelni ochish
this.router.navigate([{ outlets: { aside: ['chat'] } }]);

// Yopish
this.router.navigate([{ outlets: { aside: null } }]);
```

Tekshirildi: URL — `/inbox(aside:chat)`, ikkala outlet to'ldi; `aside: null` bilan URL `/inbox` ga qaytdi.

```html
<a [routerLink]="[{ outlets: { aside: ['chat'] } }]">Chatni ochish</a>
```

Nomli outlet'lar kamdan-kam kerak: URL chiroyli emas, mantiq murakkab. Yon panel holati ulashilishi shart bo'lmasa — oddiy signal yoki query parametr (`?panel=chat`) soddaroq.

## Kod: `router-outlet` hodisalari

```html
<router-outlet (activate)="onActivate($event)" (deactivate)="onDeactivate($event)" />
```

`$event` — faollashgan komponent nusxasi. Amalda kam ishlatiladi; sahifa almashishini kuzatish uchun Router hodisalari (45-bob) yaxshiroq.

## Muhandislik nuqtai nazari

**Daraxtni UI tuzilishiga moslang.** URL ierarxiyasi = layout ierarxiyasi:

```
/                     MainLayout
/products             MainLayout > ProductList
/products/42          MainLayout > ProductDetail
/account/orders       MainLayout > AccountLayout > AccountOrders
/login                AuthLayout > Login
```

Chuqurlik 3–4 darajadan oshsa — ehtimol ba'zi darajalar layout emas, oddiy komponent bo'lishi kerak.

**Komponentsiz ota — kuchli vosita:** guard, provider, resolver, `data` ni guruhga bir marta berish. Har bolaga takrorlashdan yaxshi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Ota komponentda `<router-outlet />` yo'q | Bola sahifa chiqmaydi | Layout'ga outlet qo'shing |
| Layout'ni har sahifaga qo'lda | Sahifa almashganda qayta yaratiladi | Ichma-ich marshrut |
| Layout havolalari mutlaq (`/account/orders`) | Ko'chirilsa buziladi | Nisbiy (`orders`) |
| `.` havolasida `exact` yo'q | "Umumiy" doim faol | `[routerLinkActiveOptions]="{ exact: true }"` |
| Guard'ni har bolaga takrorlash | Unutilgan sahifa ochiq qoladi | Komponentsiz ota |
| Ikki `path: ''` guruhni o'ylamay tartiblash | `/` noto'g'ri layout'ga | Qaysi guruh `''` ni qabul qilishini aniqlang |

## Amaliyot

1. `AccountLayout` ni uch bola sahifa bilan yozing; nisbiy havolalar ishlatib.
2. Sahifalar orasida o'tganda layout'dagi hisoblagich (signal) saqlanishini tekshiring.
3. `AuthLayout` va `MainLayout` — ikki guruh `path: ''` bilan.
4. `admin` komponentsiz ota: guard va provider bir marta.
5. Nomli `aside` outlet bilan chat panelini oching va yoping; URL'ni kuzating.

## Rasmiy hujjat

- Ichma-ich marshrutlar: <https://angular.dev/guide/routing/define-routes#nested-routes>
- Outlet'lar: <https://angular.dev/guide/routing/show-routes-with-outlets>
