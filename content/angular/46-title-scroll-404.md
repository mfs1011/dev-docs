# 46 — Title, scroll va 404

[← Oldingi: Navigatsiya va marshrut holati](45-navigatsiya.md) · [Mundarija](README.md) · [Keyingi: Uch yondashuv: qaysi birini tanlash →](47-formalar-tanlov.md)

## Tushuncha

Uchta kichik, lekin foydalanuvchi darhol sezadigan narsa:

| Mavzu | Muammo | Yechim |
| --- | --- | --- |
| **Title** | Barcha sahifalarda brauzer tabida bir xil nom | `title` marshrutda + `TitleStrategy` |
| **Scroll** | Yangi sahifa oldingi sahifaning pastidan ochiladi | `withInMemoryScrolling` |
| **404** | Noto'g'ri URL — bo'sh ekran | `**` marshruti |

## Nega shunday

Oddiy saytda brauzer bularni o'zi qiladi: har sahifa o'z `<title>` iga ega, yangi sahifa tepadan ochiladi, server 404 beradi. SPA'da sahifa almashmaydi — shuning uchun bularni Router qilishi kerak. Qilmasa: tab nomi o'zgarmaydi, ekran o'quvchisi sahifa almashganini sezmaydi, "orqaga" bosilganda scroll joyi yo'qoladi.

## Kod: `title`

```ts
export const routes: Routes = [
  { path: '', component: Home, title: 'Bosh sahifa' },
  { path: 'products', component: ProductList, title: 'Mahsulotlar' },
  { path: 'products/:id', component: ProductDetail, title: productTitleResolver },
];
```

```ts
export const productTitleResolver: ResolveFn<string> = (route) =>
  inject(ProductApi).get(route.paramMap.get('id')!).pipe(map((p) => p.name));
```

Tekshirildi: `title: 'Bosh'` → `document.title === 'Bosh'`; `title: (route) => \`Mahsulot ${route.paramMap.get('id')}\`` → `'Mahsulot 42'`.

### `TitleStrategy` — umumiy format

Har sahifa nomiga sayt nomini qo'shish:

```ts
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Service()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot) {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `${page} · Do'kon` : "Do'kon");
  }
}
```

```ts
// app.config.ts
providers: [
  provideRouter(routes),
  { provide: TitleStrategy, useExisting: AppTitleStrategy },
]
```

Tekshirildi: `title: 'Xatlar'` → `"Xatlar · Do'kon"`.

`buildTitle` — eng chuqur faol marshrutning `title` ini qaytaradi. `useExisting` — `@Service()` nusxasining o'zi (36-bob).

## Kod: scroll

```ts
provideRouter(
  routes,
  withInMemoryScrolling({
    scrollPositionRestoration: 'enabled',
    anchorScrolling: 'enabled',
  }),
)
```

| `scrollPositionRestoration` | Xulq |
| --- | --- |
| `'disabled'` (sukut) | Hech narsa — scroll joyida qoladi |
| `'top'` | Har navigatsiyada tepaga |
| `'enabled'` | Oldinga — tepaga (yoki `#anchor` ga); **orqaga** — oldingi joyga qaytaradi |

`'enabled'` — deyarli har doim to'g'ri tanlov (Angular hujjatida: "kelajakda sukut bo'ladi"). `anchorScrolling: 'enabled'` — `/docs#install` da `id="install"` elementga scroll.

### Asinxron ma'lumot bilan tiklash

`'enabled'` orqaga qaytganda **darhol** scroll qiladi. Agar ro'yxat hali yuklanmagan bo'lsa — sahifa qisqa, scroll tiklanmaydi. Yechim — `Scroll` hodisasini o'zingiz ushlab, ma'lumot kelgach tiklash:

```ts
export class ProductList {
  private readonly scroller = inject(ViewportScroller);
  private readonly router = inject(Router);
  protected readonly products = httpResource<Product[]>(() => '/api/products');

  private savedPosition: [number, number] | null = null;

  constructor() {
    this.router.events
      .pipe(filter((e): e is Scroll => e instanceof Scroll), takeUntilDestroyed())
      .subscribe((e) => (this.savedPosition = e.position));

    effect(() => {
      if (this.products.hasValue() && this.savedPosition) {
        afterNextRender(() => this.scroller.scrollToPosition(this.savedPosition!), { injector: this.injector });
      }
    });
  }

  private readonly injector = inject(Injector);
}
```

Yoki soddaroq: tez-tez qaytiladigan ro'yxat ma'lumotini xizmatda **keshlash** — qaytganda ma'lumot darhol bor, `'enabled'` o'zi ishlaydi.

### Fokus — erishimlilik

Sahifa almashganda ekran o'quvchisi foydalanuvchisi yangi kontent paydo bo'lganini bilmaydi. Asosiy sarlavhaga fokus berish:

```ts
export class App {
  private readonly router = inject(Router);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.main().nativeElement.focus({ preventScroll: true }));
  }
}
```

```html
<main #main tabindex="-1"><router-outlet /></main>
```

## Kod: 404

```ts
export const routes: Routes = [
  // ... barcha marshrutlar
  { path: '**', component: NotFound, title: 'Sahifa topilmadi' },
];
```

```ts
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <h1>Sahifa topilmadi</h1>
    <p>Siz qidirgan manzil mavjud emas yoki ko'chirilgan.</p>
    <a routerLink="/">Bosh sahifaga</a>
  `,
})
export default class NotFound {}
```

### Ikki xil "topilmadi"

| Holat | Misol | Kim aniqlaydi |
| --- | --- | --- |
| Marshrut yo'q | `/prodcts` | `**` |
| Marshrut bor, ma'lumot yo'q | `/products/99999` | API 404 → komponent yoki resolver |

Ikkinchisi uchun — resolver'da `RedirectCommand` (44-bob) yoki komponentda:

```html
@if (product.error()) {
  <app-not-found-message />
} @else if (product.hasValue()) {
  ...
}
```

`/not-found` ga yo'naltirish o'rniga joyida ko'rsatish yaxshiroq — URL saqlanadi, foydalanuvchi xatoni ko'radi va tuzatishi mumkin.

### SSR'da haqiqiy 404 status

SPA'da `**` sahifasi serverdan **200** bilan keladi — Google uni oddiy sahifa deb indekslaydi. SSR bilan (62–63-boblar) server marshrut konfiguratsiyasida status kodini berish mumkin:

```ts
// app.routes.server.ts
{ path: '**', renderMode: RenderMode.Server, status: 404 }
```

## Muhandislik nuqtai nazari

Har yangi sahifada tekshirish ro'yxati:

- [ ] `title` bor (dinamik bo'lsa — resolver)
- [ ] Tepadan ochiladi, "orqaga" joyiga qaytaradi
- [ ] Ma'lumot topilmasa — tushunarli xabar
- [ ] Fokus yangi kontentga o'tadi

Title — SEO, tab'lar orasida yo'l topish, brauzer tarixi va ekran o'quvchilari uchun. "Keyinroq qo'shamiz" — hech qachon qo'shilmaydi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `title` yo'q | Barcha tablar bir xil nom | Har marshrutda `title` |
| Sayt nomini har `title` ga qo'lda | Takrorlanish, nomuvofiqlik | `TitleStrategy` |
| `withInMemoryScrolling` yo'q | Yangi sahifa pastdan ochiladi | `scrollPositionRestoration: 'enabled'` |
| `'top'` tanlash | "Orqaga" da joy yo'qoladi | `'enabled'` |
| `**` o'rtada | Keyingi marshrutlar ishlamaydi | Eng oxirida |
| Ma'lumot 404 ni `**` ga | `/products/99999` bo'sh sahifa | API xatosini komponentda |
| SSR'da 404 status 200 | Google "topilmadi" sahifasini indekslaydi | Server marshrutida `status: 404` |

## Amaliyot

1. Barcha marshrutlarga `title` qo'shing, mahsulot sahifasiga title resolver.
2. `AppTitleStrategy` — "Sahifa · Sayt nomi" formati.
3. `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })` — uzun ro'yxatda pastga tushib, detail'ga o'ting va "orqaga" bosing.
4. `/docs#install` havolasi bilan anchor scroll'ni sinang.
5. `NotFound` sahifasi va `/products/99999` uchun joyida xabar.
6. Navigatsiyadan keyin `<main>` ga fokus; VoiceOver yoki NVDA bilan sinang.

## Rasmiy hujjat

- Sahifa title: <https://angular.dev/guide/routing/define-routes#page-titles>
- `withInMemoryScrolling`: <https://angular.dev/api/router/withInMemoryScrolling>
- `TitleStrategy`: <https://angular.dev/api/router/TitleStrategy>
