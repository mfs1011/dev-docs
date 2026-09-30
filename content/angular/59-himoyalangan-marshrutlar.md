# 59 — Himoyalangan marshrutlar va rollar

[← Oldingi: Auth: token va refresh oqimi](58-auth-token-refresh.md) · [Mundarija](README.md) · [Keyingi: Holat boshqaruvi: signal xizmatlari →](60-signal-xizmatlar.md)

## Tushuncha

Ruxsat — uch qatlamda:

| Qatlam | Nima qiladi | Xavfsizlikmi |
| --- | --- | --- |
| **Server** | Har so'rovda tekshiradi, 401/403 qaytaradi | ✅ **Yagona haqiqiy himoya** |
| **Marshrut (guard)** | Ruxsatsiz sahifaga kirishni to'xtatadi | ❌ UX |
| **UI (tugma, menyu)** | Ruxsatsiz amallarni yashiradi | ❌ UX |

Frontend ruxsatlari — foydalanuvchini **chalkashtirmaslik** uchun: bosa olmaydigan tugmani ko'rmasin, ocholmaydigan sahifaga kirmasin. Brauzer kodini o'zgartirish yoki API'ni to'g'ridan-to'g'ri chaqirish mumkin — shuning uchun server har doim tekshiradi.

## Nega shunday

Ko'p loyihalarda xato: `if (user.role === 'admin')` 40 ta joyda tarqalgan. Rol qo'shilsa (masalan, `manager`) — 40 ta joyni topib tuzatish. Yaxshiroq: **rol emas, ruxsat** (`orders:delete`) bo'yicha tekshirish, ruxsatlar ro'yxati serverdan.

## Kod: rol emas — ruxsat

```ts
// permissions.ts
export type Permission =
  | 'orders:read'
  | 'orders:create'
  | 'orders:delete'
  | 'users:manage'
  | 'reports:view';
```

Server login/refresh javobida beradi:

```json
{ "user": { "id": 7, "name": "Ali", "permissions": ["orders:read", "orders:create"] } }
```

```ts
@Service()
export class Permissions {
  private readonly auth = inject(Auth);

  private readonly granted = computed(
    () => new Set<Permission>(this.auth.user()?.permissions ?? []),
  );

  can(p: Permission): boolean {
    return this.granted().has(p);
  }

  canAll(...ps: Permission[]): boolean {
    return ps.every((p) => this.granted().has(p));
  }
}
```

`can()` — signal ichida: shablon yoki `computed` da chaqirilsa, ruxsatlar o'zgarganda (boshqa foydalanuvchi kirdi) avtomatik yangilanadi.

Rol → ruxsat xaritasi **serverda**. Frontend faqat natijani biladi. Yangi rol qo'shish — frontend deploy'siz.

## Kod: guardlar

```ts
// auth.guards.ts
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  return auth.isLoggedIn()
    || inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = () =>
  !inject(Auth).isLoggedIn() || inject(Router).createUrlTree(['/']);

export function permissionGuard(...required: Permission[]): CanMatchFn {
  return () =>
    inject(Permissions).canAll(...required)
    || inject(Router).createUrlTree(['/forbidden']);
}
```

```ts
export const routes: Routes = [
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./auth/login') },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout'),
    children: [
      { path: 'orders', canMatch: [permissionGuard('orders:read')], loadChildren: () => import('./orders/orders.routes') },
      { path: 'users', canMatch: [permissionGuard('users:manage')], loadChildren: () => import('./users/users.routes') },
      { path: 'forbidden', loadComponent: () => import('./errors/forbidden') },
    ],
  },
];
```

Nega ruxsat uchun `canMatch`? Ruxsatsiz foydalanuvchiga bo'lim kodi **yuklanmaydi** (44-bob). `users` bo'limining JS'i admin bo'lmagan brauzerga bormaydi.

`guestGuard` — tizimga kirgan foydalanuvchi `/login` ga qaytmasin.

### Login'dan keyin qaytish

```ts
export class Login {
  private readonly returnUrl = inject(ActivatedRoute).snapshot.queryParamMap.get('returnUrl');

  protected async onSuccess() {
    const target = this.returnUrl?.startsWith('/') && !this.returnUrl.startsWith('//') ? this.returnUrl : '/';
    await this.router.navigateByUrl(target);
  }
}
```

`returnUrl` ni tekshiring: `/login?returnUrl=https://evil.uz` — **open redirect** zaifligi. Faqat ichki yo'llar (`/` bilan boshlanadigan, `//` emas).

## Kod: UI — ruxsat direktivasi

```ts
@Directive({ selector: '[appCan]' })
export class Can {
  readonly appCan = input.required<Permission>();
  readonly appCanElse = input<TemplateRef<unknown>>();

  private readonly permissions = inject(Permissions);
  private readonly tpl = inject(TemplateRef);
  private readonly vcr = inject(ViewContainerRef);

  private readonly allowed = computed(() => this.permissions.can(this.appCan()));

  constructor() {
    effect(() => {
      this.vcr.clear();
      if (this.allowed()) {
        this.vcr.createEmbeddedView(this.tpl);
      } else {
        const fallback = this.appCanElse();
        if (fallback) this.vcr.createEmbeddedView(fallback);
      }
    });
  }
}
```

```html
<button *appCan="'orders:delete'; else noAccess" (click)="remove()">O'chirish</button>
<ng-template #noAccess><span class="muted">Ruxsat yo'q</span></ng-template>
```

Tekshirildi: ruxsat yo'q — "Ruxsat yo'q" ko'rindi; `granted` signaliga `orders:delete` qo'shilgach — tugma paydo bo'ldi, qayta yuklashsiz.

Oddiyroq variant — direktivasiz:

```html
@if (permissions.can('orders:delete')) {
  <button (click)="remove()">O'chirish</button>
}
```

Direktiva — `else` shablon va takrorlanish ko'p bo'lganda qulay; oddiy holatda `@if` yetadi.

### Yashirish yoki o'chirish?

| Holat | Tavsiya |
| --- | --- |
| Foydalanuvchi bu amal borligini bilishi shart emas | Yashirish |
| Amal bor, lekin hozir mumkin emas ("Tasdiqlangan buyurtmani o'chirib bo'lmaydi") | `disabled` + sabab (`title` yoki matn) |
| Rolga qarab (ruxsat yo'q, lekin so'rash mumkin) | Ko'rsatish + "Ruxsat so'rash" |

## Kod: 401 va 403 ni boshqarish

```ts
// errorInterceptor ichida (57-bob)
if (e.status === 403) {
  toast.error("Bu amal uchun ruxsat yo'q");
  inject(Auth).reloadPermissions();     // ruxsatlar serverda o'zgargan bo'lishi mumkin
}
```

| Kod | Ma'no | Frontend javobi |
| --- | --- | --- |
| 401 | "Kimligingiz noma'lum" (token yo'q/eskirgan) | Refresh → bo'lmasa login (58-bob) |
| 403 | "Kimligingiz ma'lum, lekin ruxsat yo'q" | Xabar, ruxsatlarni yangilash; **logout emas** |

## Muhandislik nuqtai nazari

**Ruxsatlar — frontend va backend shartnomasi.** `Permission` tipi va backenddagi ro'yxat sinxron bo'lsin. Ideal — OpenAPI sxemasidan generatsiya yoki umumiy paket.

**Test qilish:**

```ts
TestBed.configureTestingModule({
  providers: [{ provide: Permissions, useValue: { can: (p: Permission) => p === 'orders:read', canAll: () => false } }],
});
```

Har rol uchun asosiy sahifalarni e2e testda (73-bob) tekshiring: admin ko'radi, oddiy foydalanuvchi — `/forbidden`.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Guard — yagona himoya | API ochiq | Server har so'rovda tekshiradi |
| `role === 'admin'` tarqalgan | Yangi rol — ko'p joyni o'zgartirish | Ruxsat bo'yicha, `Permissions.can` |
| Ruxsat uchun `canActivate` | Chunk baribir yuklanadi | `canMatch` |
| `returnUrl` tekshirilmaydi | Open redirect | Faqat `/` bilan boshlanadigan ichki yo'l |
| 403 da logout | Foydalanuvchi bekorga chiqariladi | Xabar + ruxsatlarni yangilash |
| Ruxsatlar frontendda qattiq yozilgan | Rol o'zgarsa deploy kerak | Serverdan |
| Tizimga kirgan foydalanuvchi `/login` ni ko'radi | Chalkash | `guestGuard` |

## Amaliyot

1. `Permissions` xizmati va `Permission` tipi; ruxsatlar `user` dan.
2. `authGuard`, `guestGuard`, `permissionGuard(...)` — yuqoridagi marshrutlar bilan.
3. `returnUrl` ga `https://example.com` berib, open redirect himoyasini tekshiring.
4. `*appCan` direktivasini `else` bilan yozing.
5. Admin va oddiy foydalanuvchi bilan kirib, `users` bo'limi chunk'i yuklanmasligini Network'da tekshiring.
6. 403 javobida ruxsatlarni qayta yuklash.

## Rasmiy hujjat

- Guardlar: <https://angular.dev/guide/routing/route-guards>
- Xavfsizlik: <https://angular.dev/best-practices/security>
- OWASP open redirect: <https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html>
