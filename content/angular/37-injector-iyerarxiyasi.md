# 37 — Injector iyerarxiyasi

[← Oldingi: Provayder turlari](36-provayder-turlari.md) · [Mundarija](README.md) · [Keyingi: `InjectionToken` va konfiguratsiya →](38-injection-token.md)

## Tushuncha

Angular'da bitta injector emas — **daraxt**. `inject(X)` pastdan yuqoriga qidiradi va birinchi topilgan provayderni ishlatadi.

Ikki turdagi injector bor:

```
Element injectorlari (komponent/direktiva providers)
  app-order-item  →  app-order-list  →  app-root
                                           │
                                           ▼  topilmasa
Environment injectorlari
  marshrut providers  →  ildiz (root)  →  platform  →  NullInjector (NG0201)
```

| Daraja | Qayerda e'lon qilinadi | Nusxa soni |
| --- | --- | --- |
| Platform | `@Injectable({ providedIn: 'platform' })` | Sahifada bitta |
| Root | `@Service()`, `app.config.ts` providers | Ilovada bitta |
| Marshrut | Route `providers: [...]` | Marshrut guruhi uchun bitta |
| Element | Komponent `providers` / `viewProviders` | **Har komponent nusxasiga bitta** |

## Nega shunday

Hamma narsa global bo'lsa — ikki mustaqil forma bitta holatni ulashib qoladi. Daraxt esa **holatni chegaralash** imkonini beradi:

- Sahifadagi har "savat" kartasi o'z `CartItemState` iga ega.
- Admin bo'limi o'z `AdminStore` iga ega — foydalanuvchi qismida yo'q.
- Global `Auth` esa hammaga bitta.

## Kod: element darajasi

```ts
@Service({ autoProvided: false })
export class PanelState {
  readonly open = signal(false);
}

@Component({
  selector: 'app-panel',
  providers: [PanelState],
  template: `<ng-content />`,
})
export class Panel {
  protected readonly state = inject(PanelState);
}
```

```html
<app-panel>
  <app-panel-toggle />          <!-- 1-panelning PanelState'i -->
</app-panel>
<app-panel />                   <!-- boshqa nusxa -->
```

Tekshirildi: ikki `app-panel` → ikki xil nusxa (`id` 1 va 2); birinchi panel ichiga **proyeksiya qilingan** bola panelning nusxasini oldi (1). Proyeksiya qilingan kontentning injector otasi — u joylashgan element.

Bu naqsh murakkab komponentlar uchun juda qulay: `Tabs` + `Tab`, `Accordion` + `AccordionItem`, `Stepper` + `Step` — ota holatni `providers` da e'lon qiladi, bolalar `inject` qiladi, `input` zanjiri kerak emas.

## Kod: `providers` va `viewProviders`

| | O'z shablonidagi bolalar | Proyeksiya qilingan kontent (`<ng-content>`) |
| --- | --- | --- |
| `providers` | ✅ ko'radi | ✅ ko'radi |
| `viewProviders` | ✅ ko'radi | ❌ ko'rmaydi |

```ts
@Component({
  selector: 'app-box',
  viewProviders: [{ provide: THEME, useValue: 'dark' }],
  template: `<app-leaf /> <ng-content />`,
})
export class Box {}
```

```html
<app-box>
  <app-leaf />                  <!-- THEME ko'rinmaydi -->
</app-box>
```

Tekshirildi: shablondagi `app-leaf` → `dark`, proyeksiya qilingandagi → topilmadi. `viewProviders` — ichki amalga oshirishni tashqaridan qo'yilgan kontentdan **yashirish** uchun.

## Kod: marshrut darajasi

```ts
export const routes: Routes = [
  {
    path: 'admin',
    providers: [AdminStore, provideAdminApi()],
    children: [
      { path: 'users', component: AdminUsers },
      { path: 'settings', component: AdminSettings },
    ],
  },
  { path: 'shop', component: Shop },
];
```

Tekshirildi:

| Harakat | Natija |
| --- | --- |
| `/admin/users` → `/admin/settings` | Ikkala sahifa **bitta** `AdminStore` |
| `/shop` da `inject(AdminStore, { optional: true })` | `null` |
| `/admin` dan chiqib qaytish | **O'sha** nusxa — marshrut injectori yo'q qilinmaydi |

Oxirgi nuqta muhim: sukut bo'yicha marshrut injectori "sahifadan chiqqanda tozalanadigan holat" **emas**. Ikki yo'l bor:

```ts
provideRouter(routes, withAutoCleanupInjectors())   // Angular 22.2
```

Tekshirildi: bu bilan `/admin` dan chiqib qaytganda **yangi** `AdminStore` yaratildi — foydalanilmayotgan marshrut injectorlari yo'q qilinadi (ichidagi xizmatlarning `DestroyRef` / `ngOnDestroy` ishlaydi). Ikkinchi yo'l — holatni komponent darajasida provide qilish.

`loadChildren` bilan dangasa yuklangan marshrutning `providers` i ham xuddi shunday — ular alohida chunk'ga tushadi.

## Kod: qidiruv modifikatorlari

```ts
inject(X, { self: true })       // faqat shu element/injector
inject(X, { skipSelf: true })   // o'zini o'tkazib, otadan boshlab
inject(X, { host: true })       // host komponent chegarasigacha
inject(X, { optional: true })   // topilmasa null
```

**`skipSelf`** — rekursiv komponentlarda ota nusxasini olish:

```ts
@Component({
  selector: 'app-menu',
  providers: [MenuLevel],
})
export class Menu {
  private readonly parent = inject(MenuLevel, { skipSelf: true, optional: true });
  protected readonly depth = (this.parent?.depth ?? -1) + 1;
}
```

**`host`** — direktivalar uchun. Tekshirildi — direktiva komponent shablonidagi elementda turganda:

| Host komponentda | `inject(T, { host: true })` | `inject(T)` |
| --- | --- | --- |
| `providers: [T]` | topilmadi | topildi |
| `viewProviders: [T]` | **topildi** | topildi |
| Hech narsa (yuqorida bor) | topilmadi | yuqoridagini topdi |

Ya'ni `host: true` — "faqat meni ishlatayotgan komponent o'z ko'rinishi uchun bergan narsa". Komponentning o'zida `host: true` faqat o'z elementiga qaraydi.

## Kod: global xizmatni qayta provide qilish tuzog'i

```ts
@Service()
export class Cart { ... }

@Component({
  selector: 'app-mini-cart',
  providers: [Cart],             // ❌ tasodifan
})
export class MiniCart {
  private readonly cart = inject(Cart);   // YANGI, bo'sh savat!
}
```

Tekshirildi: `providers: [Cart]` → komponent **ikkinchi** nusxani oldi, qolgan ilova root nusxasini ko'radi. Belgisi: "savatga qo'shdim, lekin mini-savatda ko'rinmayapti".

## Muhandislik nuqtai nazari

Holat qaysi darajada yashashi kerak — **uning umri** qancha?

| Holat umri | Daraja | Misol |
| --- | --- | --- |
| Butun sessiya | Root | `Auth`, `Cart`, `Theme` |
| Bo'lim ichida, chiqib-kirganda saqlanadi | Marshrut | Admin filtrlari |
| Komponent yashaguncha | Element | Forma qoralamasi, `Tabs` holati |
| Faqat ichki ko'rinishda | `viewProviders` | Kutubxona komponentining ichki xizmati |

Element darajasidagi xizmat komponent bilan **birga o'ladi** — `DestroyRef` va `ngOnDestroy` xizmatda ham ishlaydi, obunalar avtomatik tozalanadi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `@Service()` ni komponent `providers` ga | Ikkinchi nusxa, holat bo'linadi | Olib tashlang |
| Har nusxaga alohida holat kerak, lekin `@Service()` | Barcha kartalar bitta holat | `autoProvided: false` + komponent `providers` |
| Marshrut injectori chiqqanda tozalanadi deb kutish | Eski holat qaytib keladi | `withAutoCleanupInjectors()`, komponent darajasi yoki `reset()` |
| Proyeksiya qilingan kontentga `viewProviders` dan kutish | NG0201 | `providers` |
| Rekursiv komponentda `skipSelf` yo'q | O'zining nusxasini oladi | `{ skipSelf: true, optional: true }` |
| `host: true` bilan host'ning `providers` ini kutish | Topilmaydi | `viewProviders` yoki `host` siz |

## Amaliyot

1. `Tabs` + `Tab` komponentlarini yozing: `TabsState` `Tabs` ning `providers` ida, `Tab` inject qiladi. Sahifaga ikkita `Tabs` qo'ying — mustaqilligini tekshiring.
2. `viewProviders` bilan xuddi shuni qiling — proyeksiya qilingan `Tab` NG0201 beradi.
3. `/admin` marshrutiga `providers: [AdminStore]` qo'shing, chiqib-kirib nusxa saqlanishini ko'ring.
4. Rekursiv `Menu` da `skipSelf` bilan chuqurlikni hisoblang.
5. `@Service() Cart` ni tasodifan komponentga provide qiling — xatoni takrorlang, keyin tuzating.

## Rasmiy hujjat

- Injector iyerarxiyasi: <https://angular.dev/guide/di/hierarchical-dependency-injection>
- Marshrut provayderlari: <https://angular.dev/guide/di/dependency-injection-providers>
