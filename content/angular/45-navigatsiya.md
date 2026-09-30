# 45 — Navigatsiya va marshrut holati

[← Oldingi: Funksional guardlar va resolverlar](44-guard-va-resolver.md) · [Mundarija](README.md) · [Keyingi: Title, scroll va 404 →](46-title-scroll-404.md)

## Tushuncha

Navigatsiyaning ikki yo'li:

| Usul | Qachon |
| --- | --- |
| `routerLink` (shablonda) | Foydalanuvchi bosadigan havola |
| `Router.navigate` / `navigateByUrl` (kodda) | Saqlagandan keyin, login'dan keyin, shartli |

Havola uchun **har doim** `routerLink` — u haqiqiy `<a href>` yaratadi: yangi tabda ochish, sichqoncha o'rta tugmasi, "havolani nusxalash", ekran o'quvchilari ishlaydi. `(click)="router.navigate(...)"` li `<div>` yoki `<button>` — bularning hammasini buzadi.

## Nega shunday

Router URL'ni **holat** sifatida boshqaradi. Navigatsiya — "holatni o'zgartirish so'rovi": u guardlar tomonidan rad etilishi, resolverlar tomonidan kechiktirilishi, yangi navigatsiya tomonidan bekor qilinishi mumkin. Shuning uchun `navigate` — `Promise<boolean>`.

## Kod: `navigate` va `navigateByUrl`

```ts
private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);

// Segmentlar massivi
this.router.navigate(['/products', product.id]);

// Nisbiy
this.router.navigate(['7'], { relativeTo: this.route });          // /shop → /shop/7

// Tayyor URL satri
this.router.navigateByUrl('/products/42?tab=reviews');

// Natijani kutish
const ok = await this.router.navigate(['/checkout']);
if (!ok) { /* guard rad etdi yoki bekor qilindi */ }
```

Tekshirildi: `navigate(['7'], { relativeTo })` → `/shop/7`.

| | `navigate(commands, extras)` | `navigateByUrl(url, extras)` |
| --- | --- | --- |
| Kirish | Segmentlar massivi | Satr yoki `UrlTree` |
| Nisbiy | `relativeTo` bilan | Yo'q — doim mutlaq |
| Parametrlar | `queryParams`, `fragment` opsiyalari | URL ichida |

## Kod: `NavigationExtras`

```ts
this.router.navigate(['/products'], {
  queryParams: { page: 2 },
  queryParamsHandling: 'merge',        // 'merge' | 'preserve' | '' (sukut: almashtirish)
  fragment: 'reviews',                 // #reviews
  replaceUrl: true,                    // tarixga yangi yozuv qo'shmaslik
  skipLocationChange: true,            // URL o'zgarmaydi (kam kerak)
  state: { from: 'cart' },             // URL'da ko'rinmaydigan ma'lumot
});
```

Tekshirildi: `/shop?a=1` da `queryParams: { b: 2 }, queryParamsHandling: 'merge'` → `/shop?a=1&b=2`.

**`replaceUrl`** — qidiruv maydonidan har harf bosilganda URL'ni yangilasangiz, "orqaga" tugmasi 20 marta bosilmasligi uchun:

```ts
effect(() => {
  this.router.navigate([], { queryParams: { q: this.search() || null }, queryParamsHandling: 'merge', replaceUrl: true });
});
```

`q: null` — parametrni URL'dan olib tashlaydi.

### `state` — URL'siz ma'lumot

```ts
export class ProductDetail {
  private readonly router = inject(Router);
  protected readonly from = this.router.currentNavigation()?.extras.state?.['from'];
}
```

Tekshirildi: komponent konstruktorida (maydon initsializatorida) `currentNavigation()?.extras.state` → `{ from: 'list' }`. Navigatsiya tugagach `currentNavigation()` → `null` — keyinroq o'qib bo'lmaydi. Keyinroq kerak bo'lsa — `history.state`.

`state` sahifa yangilanganda ham `history.state` da qoladi, lekin havola ulashilsa — **yo'q**. Faqat "qo'shimcha qulaylik" uchun (masalan, "orqaga" tugmasi matni), muhim ma'lumot uchun emas.

## Kod: `UrlTree` yaratish

```ts
const tree = this.router.createUrlTree(['/shop', 5], { queryParams: { tab: 'x' }, fragment: 'top' });
this.router.serializeUrl(tree);      // '/shop/5?tab=x#top' (tekshirildi)
```

Guard'larda qaytarish, havolani matn sifatida olish (ulashish tugmasi) uchun.

## Kod: marshrut holatini o'qish

```ts
private readonly router = inject(Router);

// Joriy URL
this.router.url;                                     // '/products/42?tab=reviews'

// Navigatsiya ketyaptimi — signal
protected readonly navigating = computed(() => this.router.currentNavigation() !== null);

// URL faolmi — signal (Angular 21.1+)
protected readonly onProducts = isActive('/products', this.router);
```

`isActive(url, router, options?)` — `Signal<boolean>`. Tekshirildi: `/adm` da `true`, boshqa sahifaga o'tgach `false`. Eski `router.isActive()` metodi — deprecated. Injection konteksti shart emas (tekshirildi) — `router` argument sifatida beriladi.

Sukut moslashuv: `paths: 'subset'` — `/products/42` da `isActive('/products')` → `true`. Aniq moslik:

```ts
isActive('/products', this.router, { paths: 'exact', queryParams: 'ignored' });
```

## Kod: Router hodisalari

```ts
export class Analytics {
  private readonly router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe((e) => this.track(e.urlAfterRedirects));
  }
}
```

Asosiy hodisalar:

| Hodisa | Qachon |
| --- | --- |
| `NavigationStart` | Boshlandi |
| `RouteConfigLoadStart/End` | Lazy chunk yuklanmoqda |
| `GuardsCheckStart/End` | Guardlar |
| `ResolveStart/End` | Resolverlar |
| `NavigationEnd` | Muvaffaqiyatli tugadi |
| `NavigationCancel` | Guard rad etdi / yangi navigatsiya bosib o'tdi |
| `NavigationError` | Xato (resolver, chunk yuklash) |
| `NavigationSkipped` | Bir xil URL — o'tkazib yuborildi |

`e.urlAfterRedirects` — yo'naltirishlardan keyingi haqiqiy URL (`url` emas).

Bir xil URL'ga qayta navigatsiya sukut bo'yicha o'tkazib yuboriladi — tekshirildi, `navigateByUrl` → `false`. "Yangilash" tugmasi uchun — `withRouterConfig({ onSameUrlNavigation: 'reload' })` va `runGuardsAndResolvers`, yoki oddiyroq: `resource.reload()`.

## Kod: view transitions

```ts
provideRouter(routes, withViewTransitions())
```

Brauzerning View Transitions API'si bilan sahifalar orasida silliq o'tish — CSS bilan boshqariladi:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 200ms;
}
```

Developer preview (19.0 dan beri). API'ni qo'llamaydigan brauzerda — oddiy o'tish.

## Muhandislik nuqtai nazari

**Navigatsiya logikasini markazlashtiring.** `router.navigate(['/products', id, 'edit'])` 15 ta joyda — URL o'zgarsa 15 ta joyni tuzatasiz:

```ts
// product.links.ts
export const productLinks = {
  list: () => ['/products'],
  detail: (id: string) => ['/products', id],
  edit: (id: string) => ['/products', id, 'edit'],
};
```

```html
<a [routerLink]="links.detail(p.id)">{{ p.name }}</a>
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `<div (click)="router.navigate(...)">` | Yangi tab, nusxalash, erishimlilik yo'q | `<a routerLink>` |
| `navigate` natijasini tekshirmaslik | Guard rad etsa, keyingi kod baribir ishlaydi | `if (!(await navigate(...)))` |
| Qidiruvda `replaceUrl` yo'q | "Orqaga" har harfga qaytadi | `replaceUrl: true` |
| `NavigationEnd.url` analitikada | Yo'naltirishdan oldingi URL | `urlAfterRedirects` |
| `state` ga muhim ma'lumot | Havola ulashilsa yo'q | URL yoki server |
| `currentNavigation()` ni keyinroq o'qish | `null` | Konstruktorda yoki `history.state` |
| `router.isActive()` metodi | Deprecated | `isActive(url, router)` signal |
| Hodisa obunasi tozalanmaydi | Xotira oqishi | `takeUntilDestroyed()` |

## Amaliyot

1. Mahsulotni saqlagandan keyin `navigate` bilan detail sahifasiga o'ting; guard rad etsa xabar chiqaring.
2. Qidiruv maydonini `?q=` ga `replaceUrl` bilan bog'lang; "orqaga" tugmasini sinang.
3. Ro'yxatdan detail'ga `state: { from: 'list' }` bilan o'ting va "Ro'yxatga qaytish" tugmasini shunga qarab ko'rsating.
4. `isActive` signali bilan menyu elementini belgilang.
5. `NavigationEnd` ni `urlAfterRedirects` bilan analitikaga yuboring.
6. `withViewTransitions()` ni yoqib, o'tish animatsiyasini CSS'da sozlang.

## Rasmiy hujjat

- Navigatsiya: <https://angular.dev/guide/routing/navigate-to-routes>
- Marshrut holatini o'qish: <https://angular.dev/guide/routing/read-route-state>
- Router hodisalari: <https://angular.dev/guide/routing/lifecycle-and-events>
- View transitions: <https://angular.dev/guide/routing/route-transition-animations>
