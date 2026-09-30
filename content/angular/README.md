# Angular 22 — signallar, DI va production

Bu qo'llanma **rasmiy hujjat** (<https://angular.dev>) tuzilmasiga tayanadi va ustiga real loyihada kerak bo'ladigan narsalarni qo'shadi: autentifikatsiya va token boshqaruvi, holat boshqaruvi, SSR, testlash va deploy. Versiyalar npm registry'dan va haqiqiy `ng new` loyihasidan tekshirilgan (2026-yil sentabr):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| @angular/core | 22.2.0 | `npm view @angular/core version` |
| @angular/cli | 22.2.0 | `npm view @angular/cli version` |
| @angular/material | 22.2.0 | `npm view @angular/material version` |
| @angular/ssr | 22.2.0 | `npm view @angular/ssr version` |
| @ngrx/store | 22.0.1 | `npm view @ngrx/store version` |
| @ngrx/signals | 22.0.1 | `npm view @ngrx/signals version` |
| rxjs | 7.8.2 | `npm view rxjs version` |
| typescript | 6.0.x | `ng new` yaratgan `package.json` (`~6.0.2`) — npm'dagi 7.0 hali qo'llab-quvvatlanmaydi |

> **Talab.** TypeScript bilan tanishlik: tiplar, interfeys, generik, dekorator sintaksisi. Angular'ning o'zi noldan tushuntiriladi.

---

## Bu qo'llanma nimani hal qiladi

Angular o'rganishdagi eng ko'p uchraydigan chalkashliklar:

1. **Ikki davr aralashib ketgan.** Internetdagi javoblarning yarmi `NgModule`, `*ngIf` va `BehaviorSubject` haqida; hujjat esa standalone komponentlar, `@if` va signallar haqida. Qaysi biri bugungi to'g'ri yo'l — aniq emas.
2. **Signallar va RxJS birga yashaydi.** Qachon `signal()`, qachon `Observable`, qachon ikkalasini ulash kerak — eng ko'p savol tug'diradigan joy.
3. **Uch xil forma tizimi.** Signal Forms, Reactive Forms va template-driven — uchalasi ham hujjatda turibdi. Yangi loyihada qaysi biri?
4. **Dependency Injection chuqur.** Angular'ning eng kuchli, lekin eng kam tushuniladigan qismi: injector iyerarxiyasi, injection konteksti, provayder turlari.

Bu to'rttasi qo'llanma bo'ylab alohida ochiladi, taxmin qoldirilmaydi.

Har bobning skeleti: **Tushuncha → Nega shunday → Kod → Muhandislik nuqtai nazari → Tipik xatolar → Amaliyot → Rasmiy hujjat**.

---

## Eski va yangi Angular

Qo'llanma **bugungi Angular** bo'yicha yoziladi: standalone komponentlar, signallar, yangi boshqaruv oqimi, funksional guardlar. Lekin eski loyihalar hali ham ko'p, shuning uchun har bobda eski ekvivalenti ham ko'rsatiladi:

| Bugun | Ilgari |
| --- | --- |
| Standalone komponent | `NgModule` + `declarations` |
| `@if`, `@for`, `@switch` | `*ngIf`, `*ngFor`, `ngSwitch` |
| `signal()`, `computed()` | `BehaviorSubject`, getter |
| `input()`, `output()` | `@Input()`, `@Output()` |
| `viewChild()` | `@ViewChild()` |
| `inject()` | Konstruktor parametri |
| Funksional guard | `CanActivate` klassi |
| `provideHttpClient()` | `HttpClientModule` |
| Zoneless | `zone.js` |

Eski loyihani olib ketayotgan bo'lsangiz — 69-bob (migratsiya) va shu jadval yetarli boshlanish.

---

## I qism — Poydevor (1–7)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 01 | [Angular nima va nega shunday](01-kirish.md) | Muammo, tarix, ikki davr, boshqa freymvorklardan farqi |
| 02 | [O'rnatish va birinchi ilova](02-ornatish.md) | `ng new`, dev server, birinchi komponent |
| 03 | [Loyiha tuzilmasi va bootstrap](03-loyiha-tuzilmasi.md) | `main.ts`, `bootstrapApplication`, `app.config.ts` |
| 04 | [Angular uchun TypeScript](04-typescript.md) | Dekoratorlar, `strict`, tipli shablonlar |
| 05 | [Komponent anatomiyasi](05-komponent-anatomiyasi.md) | `@Component`, selektor, shablon, stil, klass |
| 06 | [Angular CLI](06-angular-cli.md) | `generate`, `build`, `test`, schematics, konfiguratsiya |
| 07 | [Standalone ilova: provayderlar](07-standalone-provayderlar.md) | `ApplicationConfig`, `provide*` funksiyalari |

## II qism — Shablon va boshqaruv oqimi (8–15)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 08 | [Binding: property, attribute, class, style](08-binding.md) | `[prop]`, `[attr.x]`, `[class.x]`, `[style.x]` |
| 09 | [Hodisalar](09-hodisalar.md) | `(click)`, `$event`, modifikatorlar, delegatsiya |
| 10 | [Boshqaruv oqimi: `@if` va `@switch`](10-if-va-switch.md) | Yangi sintaksis, `@else`, eski `*ngIf` bilan solishtirish |
| 11 | [`@for` va `track`](11-for-va-track.md) | `track` nega majburiy, `$index`, unumdorlik |
| 12 | [`@defer` — deferrable views](12-defer.md) | Triggerlar, `@placeholder`, `@loading`, `@error` |
| 13 | [Quvurlar (pipes)](13-pipes.md) | O'rnatilganlar, `async`, o'z quvuringiz, `pure` |
| 14 | [Direktivalar](14-direktivalar.md) | Atribut va strukturaviy direktivalar, o'z direktivangiz |
| 15 | [`ng-template`, `ng-container`, `@let`](15-ng-template-va-let.md) | Shablon bo'laklari, `ngTemplateOutlet`, lokal o'zgaruvchi |

## III qism — Signallar va reaktivlik (16–24)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 16 | [Signal nima](16-signal-asoslari.md) | `signal()`, `computed()`, o'qish va yozish, grafik |
| 17 | [`effect()` va `afterRenderEffect()`](17-effect.md) | Qachon kerak, qachon kerak emas, tozalash |
| 18 | [`linkedSignal()`](18-linked-signal.md) | Bog'liq, lekin yoziladigan holat |
| 19 | [Reaktiv kontekst qoidalari](19-reaktiv-kontekst.md) | `untracked()`, `isSignal()`, tipik tuzoqlar |
| 20 | [`resource()` — asinxron holat](20-resource.md) | Yuklanish, xato, qayta so'rash, bekor qilish |
| 21 | [`httpResource()`](21-http-resource.md) | HTTP uchun resurs, keshlash, tiplar |
| 22 | [Debounced signallar](22-debounced-signallar.md) | Kiritmani sekinlatish, oqimni boshqarish |
| 23 | [Zoneless o'zgarishlarni aniqlash](23-zoneless.md) | `provideZonelessChangeDetection()`, `zone.js` dan voz kechish |
| 24 | [RxJS va signallar birga](24-rxjs-va-signallar.md) | `toSignal`, `toObservable`, qaysi biri qachon |

## IV qism — Komponentlar chuqur (25–33)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 25 | [`input()` — signal kiritmalari](25-input.md) | `required`, `transform`, `alias`, `@Input()` bilan farq |
| 26 | [`output()` va `model()`](26-output-va-model.md) | Hodisa chiqarish, ikki tomonlama bog'lanish |
| 27 | [Signal so'rovlari](27-signal-sorovlari.md) | `viewChild`, `viewChildren`, `contentChild`, `required` |
| 28 | [Kontent proyeksiyasi](28-kontent-proyeksiyasi.md) | `ng-content`, ko'p slot, `select`, fallback |
| 29 | [Host elementi va `hostDirectives`](29-host-va-host-directives.md) | `host` obyekti, xulq-atvorni kompozitsiya qilish |
| 30 | [Stil, enkapsulatsiya va animatsiya](30-stil-va-enkapsulatsiya.md) | `ViewEncapsulation`, `:host`, `::ng-deep` nega yomon, `animate.enter`/`animate.leave` |
| 31 | [Hayot sikli](31-hayot-sikli.md) | Hooklar, signal davrida qaysilari kerak qoldi |
| 32 | [DOM bilan ishlash](32-dom-bilan-ishlash.md) | `ElementRef`, `Renderer2`, `afterNextRender` |
| 33 | [Dinamik komponentlar](33-dinamik-komponentlar.md) | `createComponent`, `ViewContainerRef`, `NgComponentOutlet` |

## V qism — Dependency Injection (34–39)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 34 | [DI modeli](34-di-modeli.md) | Nega DI, `@Injectable`, `providedIn: 'root'` |
| 35 | [`inject()` va injection konteksti](35-inject-va-kontekst.md) | Qayerda chaqirish mumkin, konstruktor bilan farq |
| 36 | [Provayder turlari](36-provayder-turlari.md) | `useClass`, `useValue`, `useFactory`, `useExisting`, `multi` |
| 37 | [Injector iyerarxiyasi](37-injector-iyerarxiyasi.md) | Ildiz, marshrut, element darajasi; qidiruv tartibi |
| 38 | [`InjectionToken` va konfiguratsiya](38-injection-token.md) | Tipli tokenlar, muhitga bog'liq sozlamalar |
| 39 | [DI naqshlari](39-di-naqshlari.md) | Xizmatlar, fasad, testda almashtirish, `inject` tuzoqlari |

## VI qism — Marshrutlash (40–46)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 40 | [Marshrutlash asoslari](40-marshrutlash-asoslari.md) | `provideRouter`, `Routes`, `RouterOutlet` |
| 41 | [Parametrlar va komponentga bog'lash](41-parametrlar.md) | `withComponentInputBinding`, signal `input` bilan |
| 42 | [Ichma-ich marshrutlar va layout](42-ichma-ich-marshrutlar.md) | Bola marshrutlar, bir necha `outlet` |
| 43 | [Lazy loading](43-lazy-loading.md) | `loadComponent`, `loadChildren`, bundle chegarasi |
| 44 | [Funksional guardlar va resolverlar](44-guard-va-resolver.md) | `CanActivateFn`, `ResolveFn`, `CanMatchFn` |
| 45 | [Navigatsiya va marshrut holati](45-navigatsiya.md) | `RouterLink`, `Router`, `NavigationExtras`, hodisalar |
| 46 | [Title, scroll va 404](46-title-scroll-404.md) | `TitleStrategy`, `withInMemoryScrolling`, wildcard |

## VII qism — Formalar (47–54)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 47 | [Uch yondashuv: qaysi birini tanlash](47-formalar-tanlov.md) | Signal Forms, Reactive, template-driven — solishtirish |
| 48 | [Signal Forms: model va maydonlar](48-signal-forms-model.md) | `form()`, `[formField]`, `FormRoot`, maydon holati |
| 49 | [Signal Forms: validatsiya](49-signal-forms-validatsiya.md) | Validatorlar, xato xabarlari, maydon metama'lumoti |
| 50 | [Signal Forms: sxemalar va kesishuvchi mantiq](50-signal-forms-sxema.md) | `schema`, maydonlararo qoidalar |
| 51 | [Signal Forms: yuborish va dinamik formalar](51-signal-forms-yuborish.md) | Async amallar, JSON'dan forma, maxsus boshqaruv |
| 52 | [Reactive Forms](52-reactive-forms.md) | `FormControl`, `FormGroup`, `FormArray`, `valueChanges` |
| 53 | [Qat'iy tiplangan Reactive Forms](53-tiplangan-reactive-forms.md) | Tiplar, `NonNullable`, tipik xatolar |
| 54 | [`ControlValueAccessor` va template-driven](54-cva-va-template-driven.md) | Maxsus boshqaruv, `ngModel`, qachon hali ham mos |

## VIII qism — HTTP, auth va holat (55–61)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 55 | [`HttpClient` asoslari](55-http-client.md) | `provideHttpClient`, so'rovlar, tiplar, parametrlar |
| 56 | [Interceptorlar](56-interceptorlar.md) | Funksional interceptor, sarlavha qo'shish, loglash |
| 57 | [Xatolar, qayta urinish, timeout](57-http-xatolar.md) | `catchError`, `retry`, `AbortSignal`, foydalanuvchiga xabar |
| 58 | [Auth: token va refresh oqimi](58-auth-token-refresh.md) | Access/refresh, single-flight, saqlash joyi |
| 59 | [Himoyalangan marshrutlar va rollar](59-himoyalangan-marshrutlar.md) | Guard, ruxsat tekshiruvi, UI va server chegarasi |
| 60 | [Holat boshqaruvi: signal xizmatlari](60-signal-xizmatlar.md) | Kutubxonasiz holat, chegaralar, qachon yetmaydi |
| 61 | [NgRx: Store va SignalStore](61-ngrx.md) | Qachon kerak, qachon ortiqcha; migratsiya yo'li |

## IX qism — SSR va hybrid rendering (62–65)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 62 | [SSR asoslari](62-ssr-asoslari.md) | `provideServerRendering`, `@angular/ssr`, Node adapteri |
| 63 | [Server marshrutlari va `RenderMode`](63-server-marshrutlar.md) | Server / Client / Prerender, `getPrerenderParams` |
| 64 | [Hydration va incremental hydration](64-hydration.md) | Event replay, `@defer` bilan bosqichma-bosqich |
| 65 | [Prerendering va deploy](65-prerender-va-deploy.md) | SSG, transfer cache, statik va Node deploy |

## X qism — Ekotizim (66–70)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 66 | [Angular Material va CDK](66-material-va-cdk.md) | Komponentlar, tema, CDK primitivlari |
| 67 | [Angular Aria](67-angular-aria.md) | Stilsiz, erishimli primitivlar |
| 68 | [RxJS chuqur](68-rxjs-chuqur.md) | Kerakli operatorlar, naqshlar, obuna boshqaruvi |
| 69 | [NgModule'dan standalone'ga migratsiya](69-ngmodule-migratsiya.md) | Bosqichma-bosqich reja, avtomatik schematics |
| 70 | [DevTools, Language Service, CLI chuqur](70-devtools-va-cli.md) | Profiling, signal grafigi, build tahlili |

## XI qism — Sifat va production (71–78)

| № | Bob | Nima o'rganasiz |
| --- | --- | --- |
| 71 | [Testlash: birlik testlari](71-birlik-testlari.md) | Sof funksiyalar, xizmatlar, signallar |
| 72 | [Testlash: komponentlar va DI](72-komponent-testlari.md) | `TestBed`, harness, provayderlarni almashtirish |
| 73 | [E2E testlash](73-e2e.md) | Playwright, asosiy oqimlar, CI |
| 74 | [Unumdorlik](74-unumdorlik.md) | Bundle, `@defer`, o'zgarishlarni aniqlash, Web Vitals |
| 75 | [Erishimlilik](75-erishimlilik.md) | Semantika, fokus, marshrut e'lonlari, Aria |
| 76 | [Xavfsizlik](76-xavfsizlik.md) | XSS, sanitizatsiya, CSP, token saqlash |
| 77 | [Ko'p tillilik](77-i18n.md) | `@angular/localize`, build, sana va raqam |
| 78 | [Amaliy loyiha va checklist](78-amaliy-loyiha.md) | To'liq ilova, reliz ro'yxati |

---

## Qanday o'qish kerak

- **Noldan:** 01 → 33 ketma-ket. Signallar (16–24) va DI (34–39) — eng muhim ikki qism, ular tushunilmasa qolgani chalkashadi.
- **Boshqa freymvorkdan kelgan bo'lsangiz:** 01, 03, 05 → keyin darhol 16–24 (signallar) va 34–39 (DI). Angular'ni boshqalardan aynan shu ikkitasi ajratadi.
- **Eski loyihani olib ketayotgan bo'lsangiz:** 69 (migratsiya) → yuqoridagi "eski va yangi" jadvali → 68 (RxJS) → 34–39.
- **Forma ustida ishlayotgan bo'lsangiz:** 47 (qaysi birini tanlash) → tanlaganingiz bo'yicha 48–51 yoki 52–54.
- **Production oldidan:** 74, 76, 62–65, 78.
