# 43 — Lazy loading

[← Oldingi: Ichma-ich marshrutlar va layout](42-ichma-ich-marshrutlar.md) · [Mundarija](README.md) · [Keyingi: Funksional guardlar va resolverlar →](44-guard-va-resolver.md)

## Tushuncha

Lazy loading — sahifa kodini foydalanuvchi **o'sha sahifaga kirganda** yuklash. Admin panel kodi oddiy foydalanuvchiga hech qachon yuklanmaydi.

| Usul | Nimani kechiktiradi |
| --- | --- |
| `loadComponent` | Bitta komponent |
| `loadChildren` | Marshrutlar guruhi (bo'lim) |
| `@defer` (12-bob) | Sahifa ichidagi qism |

## Nega shunday

Hamma sahifa bitta bundle'da bo'lsa — birinchi ochilishda **hammasi** yuklanadi. 20 sahifali ilovada foydalanuvchi odatda 2–3 tasini ko'radi. Qolgani — behuda trafik va ishga tushish vaqti, ayniqsa mobil internetda.

## Kod: `loadComponent`

```ts
export const routes: Routes = [
  { path: '', component: Home },                                           // asosiy bundle'da
  { path: 'about', loadComponent: () => import('./about/about') },          // alohida chunk
];
```

```ts
// about/about.ts
@Component({ ... })
export default class About {}
```

`export default` — `import()` natijasidan `.then(m => m.About)` yozish shart emas. Nomli eksport bilan:

```ts
{ path: 'about', loadComponent: () => import('./about/about').then((m) => m.About) }
```

## Kod: `loadChildren`

Bo'lim — o'z marshrutlar fayli bilan:

```ts
// app.routes.ts
{ path: 'admin', loadChildren: () => import('./admin/admin.routes') },
```

```ts
// admin/admin.routes.ts
import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./admin-dashboard') },
  { path: 'users', loadComponent: () => import('./admin-users') },
] satisfies Routes;
```

Tekshirildi — `ng build` natijasi:

```
Lazy chunk files    | Names         |  Raw size
chunk-N2S4MPWI.js   | admin-page    | 303 bytes
chunk-NLXLRSSZ.js   | admin-routes  | 116 bytes
```

`satisfies Routes` — tip tekshiruvi, lekin massivning aniq tipi saqlanadi.

### Eski marshrutlarni o'tkazish

```bash
ng g @angular/core:route-lazy-loading-migration
```

`component: X` ni `loadComponent: () => import(...)` ga aylantiradi.

## Kod: bundle chegarasi buzilishi

Lazy loading faqat **statik import bo'lmasa** ishlaydi:

```ts
// app.routes.ts
import { AdminUsers } from './admin/admin-users';     // ❌ statik import

export const routes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin/admin.routes') },
];

// boshqa joyda
console.log(AdminUsers.name);
```

`AdminUsers` statik import qilingani uchun u **asosiy bundle'ga** tushadi — lazy chunk bo'sh qoladi. Umumiy qoida: lazy bo'limdagi faylni bo'limdan tashqaridan import qilmang. Umumiy kod — `shared/` papkada.

Tekshirish: `ng build --stats-json` va `npx esbuild-visualizer` yoki `source-map-explorer` (70-bob).

## Kod: preloading

Lazy chunk'ni foydalanuvchi bosishidan **oldin** fon rejimida yuklash:

```ts
provideRouter(routes, withPreloading(PreloadAllModules))
```

| Strategiya | Xulq |
| --- | --- |
| Sukut (`NoPreloading`) | Faqat kirganda |
| `PreloadAllModules` | Ilova ochilgach, barcha `loadChildren` fon rejimida |
| O'zingizniki | Tanlab (`data: { preload: true }`) |

```ts
@Service()
export class SelectivePreloading implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<unknown>) {
    return route.data?.['preload'] ? load() : of(null);
  }
}

provideRouter(routes, withPreloading(SelectivePreloading))
```

**Diqqat:** `PreloadAllModules` `loadChildren` ni yuklaydi. Admin bo'limini oddiy foydalanuvchiga ham fon rejimida yuklaydi — trafik tejalmaydi. Katta ilovalarda tanlab preload.

## Kod: yuklash vaqtidagi indikator

Chunk sekin internetda bir necha soniya yuklanishi mumkin:

```ts
@Component({
  selector: 'app-root',
  template: `
    @if (loading()) { <div class="top-progress"></div> }
    <router-outlet />
  `,
})
export class App {
  private readonly router = inject(Router);
  protected readonly loading = computed(() => this.router.currentNavigation() !== null);
}
```

`router.currentNavigation` — signal: navigatsiya davomida obyekt, tugagach `null` (tekshirildi). Chunk yuklanishi, guard va resolver kutilishi — hammasi shu vaqtga kiradi.

## Kod: yuklash xatosi

Deploy'dan keyin eski tab'da chunk nomi o'zgargan — `import()` 404 beradi:

```ts
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed/i;

provideRouter(routes, withNavigationErrorHandler((navError) => {
  if (CHUNK_ERROR.test(String(navError.error))) {
    location.reload();
  }
}))
```

Xabar matni brauzerga qarab farq qiladi: Chrome — "Failed to fetch dynamically imported module", Firefox — "error loading dynamically imported module", Safari — "Importing a module script failed". Shuning uchun regex. Cheksiz qayta yuklanishdan saqlash uchun `sessionStorage` da bayroq qo'ying.

Yangi versiya chiqqanda eski chunk'lar serverda bir muddat qolsa — bu muammo kamroq.

## Muhandislik nuqtai nazari

| Nima | Qanday yuklansin |
| --- | --- |
| Bosh sahifa, login | Asosiy bundle (`component`) |
| Har bir bo'lim (mahsulotlar, hisob, admin) | `loadChildren` |
| Kam ishlatiladigan sahifa | `loadComponent` |
| Og'ir vidjet sahifa ichida | `@defer` |
| Ko'p kiriladigan bo'lim | `loadChildren` + tanlab preload |

**Byudjet:** `angular.json` dagi `budgets` asosiy bundle o'sishini kuzatadi — `initial` chegarasidan oshsa build ogohlantiradi yoki xato beradi. Uni o'chirmang, sababini toping.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Lazy faylni tashqaridan statik import | Asosiy bundle'ga tushadi | Umumiy kod `shared/` da |
| Hamma sahifa `component:` bilan | Katta boshlang'ich bundle | `loadComponent` / `loadChildren` |
| `PreloadAllModules` + katta admin | Trafik tejalmaydi | Tanlab preload |
| Nomli eksport + `.then` yo'q | TS xatosi — `default` yo'q | `export default` yoki `.then(m => m.X)` |
| Chunk yuklash xatosini ushlamaslik | Deploy'dan keyin "oq ekran" | `withNavigationErrorHandler` |
| Byudjet ogohlantirishini o'chirish | Bundle sezilmay o'sadi | Sababini topish |

## Amaliyot

1. `about` sahifasini `loadComponent` ga o'tkazing, `ng build` da lazy chunk'ni toping.
2. `admin` bo'limini `loadChildren` + `admin.routes.ts` bilan ajrating.
3. `app.routes.ts` dan admin komponentini statik import qiling — chunk qayerga ketganini ko'ring, keyin tuzating.
4. `SelectivePreloading` strategiyasini yozing, bitta bo'limga `data: { preload: true }`.
5. `currentNavigation()` bilan yuqori progress chizig'ini qiling; DevTools'da tarmoqni "Slow 3G" ga qo'yib sinang.

## Rasmiy hujjat

- Lazy loading: <https://angular.dev/guide/routing/define-routes#lazily-loaded-components-and-routes>
- Preloading: <https://angular.dev/api/router/withPreloading>
- Bundle byudjetlari: <https://angular.dev/tools/cli/build#configuring-size-budgets>
