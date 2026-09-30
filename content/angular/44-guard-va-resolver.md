# 44 — Funksional guardlar va resolverlar

[← Oldingi: Lazy loading](43-lazy-loading.md) · [Mundarija](README.md) · [Keyingi: Navigatsiya va marshrut holati →](45-navigatsiya.md)

## Tushuncha

Navigatsiya bir necha bosqichdan o'tadi. Guard va resolver — shu bosqichlarga qo'shiladigan funksiyalar:

| Turi | Savol | Qaytaradi |
| --- | --- | --- |
| `CanMatchFn` | Bu marshrut umuman ko'rib chiqilsinmi? | `boolean \| UrlTree` |
| `CanActivateFn` | Kirish mumkinmi? | `boolean \| UrlTree \| RedirectCommand` |
| `CanActivateChildFn` | Bolalarga kirish mumkinmi? | Xuddi shunday |
| `CanDeactivateFn<T>` | Chiqish mumkinmi? | `boolean \| UrlTree` |
| `ResolveFn<T>` | Sahifadan oldin qanday ma'lumot kerak? | `T` |

Hammasi `Observable` yoki `Promise` ham qaytara oladi. Hammasi **injection kontekstida** — ichida `inject()` ishlaydi.

Tekshirilgan hodisalar tartibi (Angular 22):

```
NavigationStart → RoutesRecognized → GuardsCheckStart → ChildActivationStart
→ ActivationStart → GuardsCheckEnd → ResolveStart → ResolveEnd
→ ActivationEnd → ChildActivationEnd → NavigationEnd
```

Guard `false` qaytarsa: `GuardsCheckStart → ... → NavigationCancel`.

## Nega shunday

Klass guardlari (`implements CanActivate`) — eskirgan yo'l. Funksional guard qisqaroq, parametrlanadi, test qilish oson. `CanLoad` — **deprecated**, o'rniga `canMatch`.

**Muhim:** guard — foydalanuvchi tajribasi uchun, **xavfsizlik uchun emas**. Brauzer kodini foydalanuvchi o'zgartira oladi. Haqiqiy tekshiruv — serverda, har API so'rovida.

## Kod: `CanActivateFn`

```ts
// auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
```

```ts
{ path: 'account', canActivate: [authGuard], loadChildren: () => import('./account/account.routes') }
```

Tekshirildi:

| Guard qaytaradi | Natija |
| --- | --- |
| `false` | `navigateByUrl` → `false`, URL o'zgarmaydi |
| `UrlTree` | Yo'naltirish — `/login?returnUrl=...` |
| `new RedirectCommand(tree, { skipLocationChange: true })` | Yo'naltirish + navigatsiya opsiyalari |

`false` o'rniga deyarli har doim `UrlTree` qaytaring — foydalanuvchi nima bo'lganini tushunmasdan "havola ishlamayapti" deb o'ylaydi.

`ng g guard auth --functional` shablon yaratadi.

## Kod: parametrli guard

```ts
export function roleGuard(role: Role): CanActivateFn {
  return () => {
    const auth = inject(Auth);
    return auth.hasRole(role) || inject(Router).createUrlTree(['/forbidden']);
  };
}
```

```ts
{ path: 'admin', canActivate: [authGuard, roleGuard('admin')], ... }
```

Bir nechta guard — **hammasi** `true` bo'lishi kerak.

## Kod: `CanMatchFn`

`canActivate` — "marshrut topildi, kirish mumkinmi". `canMatch` — "bu marshrutni **tanlashdan oldin**" — `false` bo'lsa Router keyingi marshrutni sinaydi:

```ts
{ path: 'dashboard', canMatch: [() => inject(Auth).isAdmin()], loadComponent: () => import('./admin-dashboard') },
{ path: 'dashboard', loadComponent: () => import('./user-dashboard') },
```

Tekshirildi: `canMatch` `false` → ikkinchi `dashboard` ochildi; `true` bo'lganda — birinchisi.

Farqi muhim: `canMatch` `false` bo'lsa lazy chunk **yuklanmaydi** — admin kodi oddiy foydalanuvchiga bormaydi. `canActivate` da esa marshrut allaqachon tanlangan, `loadComponent` yuklanadi.

## Kod: `CanDeactivateFn`

Saqlanmagan o'zgarishlar bilan chiqib ketishning oldini olish:

```ts
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges() || confirm("Saqlanmagan o'zgarishlar bor. Chiqasizmi?");
```

```ts
{ path: 'products/:id/edit', component: ProductEdit, canDeactivate: [unsavedChangesGuard] }
```

Tekshirildi: `dirty` bo'lganda `navigateByUrl` → `false`, URL `/edit` da qoldi.

**Cheklov:** bu faqat ilova ichidagi navigatsiyani to'xtatadi. Tab yopish yoki boshqa saytga o'tish uchun — `beforeunload` hodisasi ham kerak.

## Kod: `ResolveFn`

Sahifa ochilishidan **oldin** ma'lumot yuklash:

```ts
export const productResolver: ResolveFn<Product> = (route) =>
  inject(ProductApi).get(route.paramMap.get('id')!);
```

```ts
{ path: 'products/:id', component: ProductDetail, resolve: { product: productResolver } }
```

```ts
export class ProductDetail {
  readonly product = input.required<Product>();    // withComponentInputBinding bilan
}
```

Resolver xato tashlasa (tekshirildi): `navigateByUrl` **reject** bo'ladi, `NavigationError` hodisasi chiqadi, URL eskisida qoladi. Foydalanuvchi uchun — hech narsa bo'lmagandek. Xatoni resolver ichida ushlang:

```ts
export const productResolver: ResolveFn<Product | RedirectCommand> = (route) => {
  const router = inject(Router);
  return inject(ProductApi).get(route.paramMap.get('id')!).pipe(
    catchError(() => of(new RedirectCommand(router.parseUrl('/not-found')))),
  );
};
```

### Resolver yoki `httpResource`?

| Resolver | Komponentda `httpResource` |
| --- | --- |
| Ma'lumot kelguncha **eski sahifa** ko'rinadi | Yangi sahifa darhol, ichida skeleton |
| Komponentda `loading` holati yo'q | `isLoading()`, `error()` ni ko'rsatish kerak |
| Sekin API'da "bosdim, hech narsa bo'lmadi" hissi | Tez javob hissi |
| SEO / SSR uchun ma'lumot tayyor | SSR ham kutadi (62-bob) |

Zamonaviy tavsiya: ko'p hollarda **`httpResource`** komponentda. Resolver — ma'lumotsiz sahifa ma'nosiz bo'lganda (masalan, `title` uchun mahsulot nomi kerak).

## Kod: marshrut `resources` (22.2, developer preview)

Angular 22.2 ikki dunyoni birlashtiradi — marshrutda **resource** e'lon qilish:

```ts
provideRouter(routes, withRouterResources(), withComponentInputBinding())
```

```ts
{
  path: 'users/:id',
  component: UserPage,
  resources: ({ params }) => ({
    user: httpResource<User>(() => `/api/users/${params()['id']}`),
    activity: nonBlocking(httpResource<Activity[]>(() => `/api/users/${params()['id']}/activity`)),
  }),
}
```

```ts
export class UserPage {
  readonly user = input.required<User>();           // resource qiymati input'ga keladi
}
```

`resources` funksiyasi injection kontekstida ishlaydi — `httpResource` ichida to'g'ridan-to'g'ri yaratiladi (tekshirildi: `/u/3` → `GET /api/users/3`, natija `user` input'iga keldi).

Blokirovka xulqi (tekshirildi):

| Resurs | Navigatsiya |
| --- | --- |
| Oddiy | **Kutadi** — resolver kabi |
| `nonBlocking(...)` | Kutmaydi — sahifa ochilganda `status()` → `'loading'` |

`ActivatedRoute.resources` da ikkala resurs ham bor (`user`, `activity`) — `reload()` qilish mumkin. `params` — signal, shuning uchun `/users/1` → `/users/2` da resurs o'zi qayta yuklanadi.

Developer preview — API o'zgarishi mumkin. Yangi loyihada sinab ko'ring, production'da ehtiyot bo'ling.

## Muhandislik nuqtai nazari

| Vazifa | Vosita |
| --- | --- |
| Tizimga kirmagan → login | `canActivate` + `UrlTree` |
| Rolga qarab turli sahifa / kodni yubormaslik | `canMatch` |
| Saqlanmagan forma | `canDeactivate` |
| Sahifa ma'lumotsiz ma'nosiz | Resolver yoki blocking `resources` |
| Oddiy ma'lumot | Komponentda `httpResource` |

Guardlarni **toza** saqlang: ular faqat qaror qabul qiladi, ma'lumot yuklamaydi (bu resolver ishi), UI chizmaydi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Guard — yagona himoya | Foydalanuvchi API'ni to'g'ridan-to'g'ri chaqiradi | Server tekshiruvi |
| `false` qaytarish | Foydalanuvchi sababini bilmaydi | `UrlTree` bilan yo'naltirish |
| `canActivate` bilan admin kodini yashirish | Chunk baribir yuklanadi | `canMatch` |
| `canLoad` ishlatish | Deprecated | `canMatch` |
| Resolver xatosini ushlamaslik | Navigatsiya jim bekor bo'ladi | `catchError` + `RedirectCommand` |
| Har sahifa resolver bilan | Sekin API'da "qotib qolish" | `httpResource` komponentda |
| Guard ichida metoddan keyin `inject` | NG0203 | `inject` — funksiya boshida, sinxron |

## Amaliyot

1. `authGuard` ni `returnUrl` bilan yozing, login'dan keyin qaytaring.
2. `roleGuard('admin')` parametrli guard.
3. `canMatch` bilan `dashboard` ni admin va oddiy foydalanuvchiga ajrating; `ng build` + DevTools Network'da admin chunk yuklanmasligini tekshiring.
4. Forma sahifasiga `unsavedChangesGuard`.
5. `productResolver` da xatoni `RedirectCommand` bilan `/not-found` ga yo'naltiring.
6. `withRouterResources()` bilan `users/:id` sahifasini yozing; `activity` ni `nonBlocking` qiling.

## Rasmiy hujjat

- Guardlar: <https://angular.dev/guide/routing/route-guards>
- Resolverlar: <https://angular.dev/guide/routing/data-resolvers>
- `RedirectCommand`: <https://angular.dev/api/router/RedirectCommand>
