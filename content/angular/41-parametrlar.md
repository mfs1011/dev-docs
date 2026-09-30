# 41 — Parametrlar va komponentga bog'lash

[← Oldingi: Marshrutlash asoslari](40-marshrutlash-asoslari.md) · [Mundarija](README.md) · [Keyingi: Ichma-ich marshrutlar va layout →](42-ichma-ich-marshrutlar.md)

## Tushuncha

URL'dan komponentga ma'lumot uch xil yo'l bilan keladi:

| Tur | URL | Marshrutda |
| --- | --- | --- |
| **Yo'l parametri** | `/products/42` | `path: 'products/:id'` |
| **Query parametr** | `/products?page=2&sort=price` | Hech narsa yozilmaydi |
| **Statik data** | — | `data: { layout: 'wide' }` |

Qo'shimcha to'rtinchisi — **resolver** natijasi (44-bob).

Angular 22 da eng qulay yo'l — bularning hammasini **komponent `input()` lariga** to'g'ridan-to'g'ri bog'lash.

## Nega shunday

Eski yo'l — `ActivatedRoute` ga obuna:

```ts
export class ProductDetail {
  private readonly route = inject(ActivatedRoute);
  protected readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))));
}
```

Yangi yo'l:

```ts
export class ProductDetail {
  readonly id = input.required<string>();
}
```

Afzalliklari: kam kod, komponent Router'ga **bog'lanmaydi** (testda oddiy `input` beriladi), `computed` va `resource` bilan tabiiy ishlaydi.

## Kod: yoqish

`withComponentInputBinding()` — **sukut bo'yicha yoqilmagan**. Busiz `input()` lar `undefined` qoladi (tekshirildi):

```ts
// app.config.ts
provideRouter(routes, withComponentInputBinding())
```

## Kod: yo'l parametrlari

```ts
// app.routes.ts
{ path: 'products/:id', component: ProductDetail }
```

```ts
@Component({
  selector: 'app-product-detail',
  template: `
    @if (product.hasValue()) {
      <h1>{{ product.value().name }}</h1>
    }
  `,
})
export class ProductDetail {
  readonly id = input.required<string>();

  protected readonly product = httpResource<Product>(() => `/api/products/${this.id()}`);
}
```

`/products/42` → `/products/43` ga o'tganda Angular komponentni **qayta yaratmaydi** — faqat `id` signali o'zgaradi. `httpResource` shunga reaksiya qiladi va yangi mahsulotni yuklaydi. Eski usulda ko'p uchraydigan xato — `ngOnInit` da bir marta `snapshot.paramMap` o'qish, keyin "mahsulot o'zgarmayapti" deb hayron qolish.

Parametr — har doim **satr**. Raqam kerak bo'lsa:

```ts
readonly id = input.required({ transform: numberAttribute });   // '42' → 42
```

## Kod: query parametrlar

```ts
// /products?page=2&sort=price
export class ProductList {
  readonly page = input(1, { transform: (v: string | undefined) => Number(v ?? 1) || 1 });
  readonly sort = input('name', { transform: (v: string | undefined) => (v === 'price' ? 'price' : 'name') });
}
```

Nega `numberAttribute` emas? Ixtiyoriy query parametr yo'q bo'lsa router `undefined` beradi (quyida), `numberAttribute(undefined)` esa — `NaN` (tekshirildi: `/products` da `page()` → `NaN`). Yo'l parametri (`:id`) doim mavjud — u yerda `numberAttribute` xavfsiz.

### Tuzoq: standart qiymatlar ishlamaydi

Tekshirildi — `withComponentInputBinding()` sukut sozlamasi bilan:

```ts
export class ProductList {
  readonly q = input('def');          // URL'da ?q yo'q
  readonly other = input('keep');     // marshrutga umuman aloqasi yo'q
}
```

| Navigatsiya | `q()` | `other()` |
| --- | --- | --- |
| `/products` (birinchi) | `undefined` | `undefined` |
| `/products?q=hi` | `'hi'` | `undefined` |
| `/products` | `undefined` | `undefined` |

Router **mos kelmagan har bir input'ga** `undefined` yozadi — hatto marshrut bilan bog'liq bo'lmagan `other` ga ham. `input('def')` dagi standart qiymat routed komponentda amalda ishlamaydi. Sababi — `unmatchedInputBehavior` opsiyasining sukut qiymati `'alwaysUndefined'` ("eskirgan ma'lumot qolmasin").

Yechim — opsiyani o'zgartirish:

```ts
provideRouter(routes, withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }))
```

Xuddi shu sinov bilan:

| Navigatsiya | `q()` | `other()` |
| --- | --- | --- |
| `/products` (birinchi) | `'def'` | `'keep'` |
| `/products?q=hi` | `'hi'` | `'keep'` |
| `/products` | `undefined` | `'keep'` |

`'undefinedIfStale'` — input faqat avval router'dan qiymat olgan bo'lsa `undefined` ga qaytariladi. Oxirgi qatorga e'tibor bering: `q` baribir `undefined` — bir marta kelgan parametr yo'qolsa, standart qiymat qaytmaydi. Shuning uchun **ixtiyoriy** parametrlarni har doim `transform` bilan himoyalang:

```ts
readonly sort = input('name', { transform: (v: string | undefined) => v ?? 'name' });
readonly page = input(1, { transform: (v: string | undefined) => Number(v ?? 1) || 1 });
```

Tekshirildi: `/products` da `sort()` → `'name'`, `?page=3&sort=price` da → `3`, `'price'`.

Boshqa opsiya — `queryParams: false`: query parametrlar input'larga umuman bog'lanmaydi (faqat yo'l parametri, `data`, resolver).

### Query parametrlarni yangilash

```ts
protected goToPage(page: number) {
  this.router.navigate([], {
    queryParams: { page },
    queryParamsHandling: 'merge',       // sort va boshqalar saqlanadi
  });
}
```

```html
<a [routerLink]="[]" [queryParams]="{ page: page() + 1 }" queryParamsHandling="merge">Keyingi</a>
```

Filtr, saralash, sahifa raqami — **URL'da** bo'lsin: foydalanuvchi havolani ulashsa, xuddi shu ko'rinish ochiladi; "orqaga" oldingi filtrga qaytaradi.

## Kod: statik `data`

```ts
{ path: 'reports', component: Reports, data: { permission: 'reports:view', layout: 'wide' } }
```

```ts
export class Reports {
  readonly layout = input<'wide' | 'narrow'>('narrow');
}
```

## Kod: nom to'qnashuvi

Bitta nom bir nechta manbada bo'lsa — qaysi biri yutadi? Tekshirildi (`x` — yo'l parametri, query, `data` va resolver'da):

```
resolve  >  data  >  yo'l parametri  >  query parametr
```

Natija: `'resolved'`. Amalda — nomlarni takrorlamang.

## Kod: ota parametrlari

```ts
{
  path: 'shops/:shopId',
  component: ShopLayout,
  children: [
    { path: 'products/:productId', component: ShopProduct },
  ],
}
```

```ts
export class ShopProduct {
  readonly shopId = input.required<string>();      // ota parametri
  readonly productId = input.required<string>();
}
```

Angular 22 da `paramsInheritanceStrategy` sukut bo'yicha **`'always'`** — bola marshrut ota parametrlari, `data` va resolver natijalarini oladi (tekshirildi: komponentli ota bilan ham). Eski versiyalarda (`'emptyOnly'`) bu faqat ota komponentsiz bo'lganda ishlar edi — eski maqolalardagi `withRouterConfig({ paramsInheritanceStrategy: 'always' })` endi shart emas.

## Kod: `ActivatedRoute` — qachon kerak

`input` bog'lash yetmaydigan holatlar:

```ts
private readonly route = inject(ActivatedRoute);

// Fragment (#bo'lim)
protected readonly fragment = toSignal(this.route.fragment);

// Komponent emas, xizmat yoki direktivada
// Marshrut konfiguratsiyasini o'qish
protected readonly config = this.route.snapshot.routeConfig;
```

## Muhandislik nuqtai nazari

**URL — holat manbai.** Qoida: foydalanuvchi "shu ko'rinishni ulashmoqchi" bo'lsa — URL'da bo'lsin.

| URL'da | Signal/xizmatda |
| --- | --- |
| Tanlangan element (`/orders/42`) | Modal ochiq/yopiq |
| Filtr, saralash, sahifa | Hover, fokus |
| Tanlangan tab (`?tab=history`) | Forma qoralamasi |

Parametrlarni **tekshiring** — URL foydalanuvchi qo'lida. `?page=abc`, `?sort=<script>` — kelishi mumkin. `transform` yoki `computed` da xavfsiz qiymatga keltiring.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `withComponentInputBinding()` yo'q | `input()` lar `undefined` | `provideRouter(routes, withComponentInputBinding())` |
| `ngOnInit` da `snapshot.paramMap` bir marta | `/42` → `/43` da yangilanmaydi | `input()` + `computed`/`resource` |
| Routed komponentda `input('def')` standart qiymatiga ishonish | Sukut sozlamada har doim `undefined` | `unmatchedInputBehavior: 'undefinedIfStale'` + `transform` bilan `?? 'def'` |
| Parametrni raqam deb ishlatish | `'2' + 1 === '21'` | Yo'l param: `numberAttribute`; ixtiyoriy query: `Number(v ?? 1) \|\| 1` |
| Filtrni faqat signalda saqlash | Havola ulashilmaydi, "orqaga" ishlamaydi | Query parametr |
| Query yangilashda `queryParamsHandling` yo'q | Boshqa parametrlar o'chadi | `'merge'` |
| Bir nomni `data` va parametrda | Resolve > data > param — chalkash | Nomlarni ajrating |

## Amaliyot

1. `withComponentInputBinding()` ni yoqing va `products/:id` sahifasida `input.required<string>()` ishlating.
2. `httpResource` bilan mahsulotni yuklang; `/products/1` → `/products/2` havolasi bilan komponent qayta yaratilmasligini tekshiring.
3. `?page=2&sort=price` ni `input` larga bog'lang; `page` ni avval `numberAttribute` bilan yozib `/products` da `NaN` ni ko'ring, keyin xavfsiz `transform` bilan.
4. `sort = input('name')` ni `/products` da chiqaring — `undefined` ni ko'ring. `unmatchedInputBehavior: 'undefinedIfStale'` ni yoqing, keyin `?sort=price` → `/products` o'tishida yana `undefined` ni ko'rib, `transform` bilan tuzating.
5. "Keyingi sahifa" havolasini `queryParamsHandling="merge"` bilan yozing.
6. `shops/:shopId/products/:productId` da bola komponentda ikkala parametrni oling.

## Rasmiy hujjat

- Marshrut holatini o'qish: <https://angular.dev/guide/routing/read-route-state>
- `withComponentInputBinding`: <https://angular.dev/api/router/withComponentInputBinding>
- Parametr merosi: <https://angular.dev/guide/routing/customizing-route-behavior#control-parameter-inheritance>
