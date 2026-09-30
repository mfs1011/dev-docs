# 35 — `inject()` va injection konteksti

[← Oldingi: DI modeli](34-di-modeli.md) · [Mundarija](README.md) · [Keyingi: Provayder turlari →](36-provayder-turlari.md)

## Tushuncha

`inject()` — oddiy funksiya, lekin **faqat ma'lum vaqtda** ishlaydi: Angular klassni yoki funksiyani yaratayotgan paytda. Bu payt — **injection konteksti**.

| Injection konteksti | Misol |
| --- | --- |
| Klass maydonini e'lon qilish | `private api = inject(Api);` |
| Konstruktor tanasi | `constructor() { const r = inject(Router); }` |
| Provayder `useFactory` / `@Service({ factory })` | `factory: () => inject(X)` |
| `InjectionToken` ning `factory` si | `new InjectionToken('t', { factory: () => inject(X) })` |
| Funksional guard, resolver, interceptor | `canActivate: [() => inject(Auth).ok()]` |
| `provideAppInitializer` callback'i | `provideAppInitializer(() => inject(Config).load())` |
| `runInInjectionContext` ichida | Qo'lda yaratilgan kontekst |

Kontekstdan tashqari (metod, `setTimeout`, `subscribe` callback'i, `afterNextRender` ichi) — **xato**.

## Nega shunday

`inject()` qaysi injectordan qidirishni qayerdan biladi? Angular klassni yaratish paytida "joriy injector" ni global o'zgaruvchiga yozib qo'yadi, `inject()` shuni o'qiydi, yaratish tugagach tozalaydi. Keyin chaqirilsa — "joriy injector" yo'q.

Konstruktor DI ga nisbatan afzalliklari:

| `constructor(private api: Api)` | `api = inject(Api)` |
| --- | --- |
| Meros olishda `super(api, router, ...)` zanjiri | Ota klass o'zi inject qiladi |
| Faqat klasslarda | Funksiyalarda ham (guard, interceptor) |
| Tip — parametr tipidan (dekoratorlar metadata'si) | Tip — token'dan, aniq |
| TS `useDefineForClassFields` bilan nozik muammolar | Muammo yo'q |

## Kod: to'g'ri joylar

```ts
@Component({ ... })
export class Profile {
  private readonly api = inject(UserApi);               // ✅ maydon
  private readonly route = inject(ActivatedRoute);      // ✅
  private readonly destroyRef = inject(DestroyRef);     // ✅

  constructor() {
    const title = inject(Title);                        // ✅ konstruktor
    title.setTitle('Profil');
  }

  protected save() {
    const router = inject(Router);                      // ❌ metod — kontekst yo'q
  }
}
```

`save()` chaqirilganda (tekshirildi):

```
NG0203: The `Router` token injection failed. `inject()` function must be called
from an injection context such as a constructor, a factory function, a field
initializer, or a function used with `runInInjectionContext`.
```

To'g'ri yo'l — maydonda oldindan olish:

```ts
private readonly router = inject(Router);

protected save() {
  this.router.navigate(['/']);                          // ✅
}
```

## Kod: `inject()` opsiyalari

```ts
inject(Token, { optional: true })   // topilmasa null (xato emas)
inject(Token, { self: true })       // faqat shu injectorda qidir
inject(Token, { skipSelf: true })   // o'zini o'tkazib, otadan boshla
inject(Token, { host: true })       // host elementdan yuqoriga chiqma
```

Tekshirildi:

| Chaqiruv | Natija |
| --- | --- |
| `inject(UNKNOWN, { optional: true })` | `null` |
| `inject(UNKNOWN)` | NG0201 "No provider found for `InjectionToken UNKNOWN`" |
| Bola injector'da `inject(API_URL, { skipSelf: true })` | Ota qiymati |
| Bola injector'da root xizmatini `{ self: true }` | NG0201 — xizmat bolada emas, ildizda |

`optional` bilan tip avtomatik `T | null` bo'ladi:

```ts
private readonly analytics = inject(Analytics, { optional: true });   // Analytics | null

track() {
  this.analytics?.send('click');
}
```

Qidiruv tartibi va `self/skipSelf/host` ning mazmuni — 37-bobda.

## Kod: yordamchi `inject` funksiyalari

`inject()` ni **o'z funksiyangiz** ichida ishlatish mumkin — faqat u kontekst ichida chaqirilsa:

```ts
// route-param.ts
export function injectRouteParam(name: string) {
  const route = inject(ActivatedRoute);
  return toSignal(route.paramMap.pipe(map((p) => p.get(name))), { initialValue: null });
}
```

```ts
@Component({ ... })
export class ProductPage {
  protected readonly id = injectRouteParam('id');    // ✅ maydonda chaqirildi
}
```

Nomlash an'anasi: `inject` bilan boshlanadigan funksiyalar (`injectRouteParam`, `injectQueryParams`) — "faqat kontekstda chaqiring" degan signal. Bu kompozitsiya naqshi (Vue composables, React hooks'ga o'xshash).

## Kod: `runInInjectionContext`

Kontekstdan tashqarida `inject` kerak bo'lsa — injectorni saqlab, keyin kontekst yarating:

```ts
export class Reports {
  private readonly injector = inject(Injector);

  protected async export() {
    const { PdfExporter } = await import('./pdf-exporter');

    runInInjectionContext(this.injector, () => {
      const exporter = inject(PdfExporter);            // ✅
      exporter.run();
    });
  }
}
```

Ko'p API'lar `injector` opsiyasini qabul qiladi — `runInInjectionContext` o'rniga shu soddaroq:

```ts
protected startPolling() {
  effect(() => { ... }, { injector: this.injector });
  toSignal(this.updates$, { injector: this.injector });
}
```

Funksiya kontekstda ekanini tekshirish:

```ts
import { assertInInjectionContext } from '@angular/core';

export function injectRouteParam(name: string) {
  assertInInjectionContext(injectRouteParam);
  ...
}
```

Metoddan chaqirilsa — xato funksiya nomini aytadi (tekshirildi):

```
NG0203: injectRouteParam() can only be used within an injection context such as
a constructor, a factory function, a field initializer...
```

## Muhandislik nuqtai nazari

**Qoida:** barcha bog'liqliklar — klassning yuqorisida, maydon sifatida. Bu:

- Klass nimaga bog'liqligini bir qarashda ko'rsatadi.
- Metodlarda `inject` xatosining oldini oladi.
- Test yozishda nimani almashtirish kerakligini ko'rsatadi.

`runInInjectionContext` — kamdan-kam kerak (dinamik import, plagin). Tez-tez ishlatayotgan bo'lsangiz — dizaynni qayta ko'ring: bog'liqlikni maydonga ko'chirish mumkinmi?

`inject*` funksiyalari juda qulay, lekin **yashirin bog'liqlik** yaratadi: `injectRouteParam` ichida `ActivatedRoute` borligi tashqaridan ko'rinmaydi. Kichik va aniq nomlangan bo'lsin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Metod ichida `inject()` | NG0203 | Maydonda olish |
| `subscribe`/`setTimeout` ichida `inject()` | NG0203 | Maydonda yoki `runInInjectionContext` |
| `afterNextRender` ichida `inject(DestroyRef)` | NG0203 (32-bob) | Oldindan olish |
| `ngOnInit` da `toSignal` | NG0203 | Maydonda yoki `{ injector }` |
| `optional: true` va `null` ni tekshirmaslik | `Cannot read properties of null` | `?.` yoki `if` |
| `inject*` funksiyasini metoddan chaqirish | NG0203 | Maydon initsializatorida |

## Amaliyot

1. Komponent metodida `inject(Router)` yozing — NG0203 matnini o'qing, maydonga ko'chiring.
2. `injectRouteParam(name)` yordamchisini yozib, ikki sahifada ishlating.
3. Unga `assertInInjectionContext` qo'shing va metoddan chaqirib, xatoni ko'ring.
4. `inject(Analytics, { optional: true })` — provayder bor va yo'q holatlarda sinang.
5. Dinamik import + `runInInjectionContext` bilan kechiktirilgan xizmatni ishlating.

## Rasmiy hujjat

- Injection konteksti: <https://angular.dev/guide/di/dependency-injection-context>
- `inject`: <https://angular.dev/api/core/inject>
- NG0203: <https://angular.dev/errors/NG0203>
