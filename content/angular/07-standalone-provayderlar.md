# 07 — Standalone ilova: provayderlar

[← Oldingi: Angular CLI](06-angular-cli.md) · [Mundarija](README.md) · [Keyingi: Binding →](08-binding.md)

## Tushuncha

3-bobda `app.config.ts` ni ko'rdik:

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
  ],
};
```

`providers` — ilova **qanday ishlashini** belgilaydigan ro'yxat: qaysi router, qaysi HTTP sozlamalari, qanday xato ishlovchisi, ishga tushishdan oldin nima yuklanadi. Bu bobda shu ro'yxat qanday to'ldirilishi.

Provayder — Dependency Injection tizimining tushunchasi. DI to'liq V qismda (34–39) ochiladi; bu yerda faqat **ilova konfiguratsiyasi** uchun kerak bo'lgan qismi.

## Nega shunday

Ilgari (v14 gacha) konfiguratsiya `NgModule` lar orqali berilardi:

```ts
// Ilgari
@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
```

Muammo: modul — bir vaqtning o'zida komponentlarni guruhlash **va** xizmatlarni sozlash vositasi edi. Bu ikki vazifa aralashib ketardi, qaysi modul nimani ta'minlashini topish qiyin edi.

Standalone ilovada ular ajratilgan:

| Vazifa | Qayerda |
| --- | --- |
| Shablonda nima ishlatiladi | Komponentning `imports` i |
| Ilova qanday ishlaydi | `app.config.ts` dagi `providers` |

## Kod: `provide*` funksiyalari

Angular paketlari o'zini `provide*` funksiyasi orqali ulaydi:

| Funksiya | Paket | Qachon kerak |
| --- | --- | --- |
| `provideRouter(routes)` | `@angular/router` | Marshrutlash (40-bob) |
| `provideHttpClient(...)` | `@angular/common/http` | HTTP'ni **sozlash** uchun (pastga qarang) |
| `provideBrowserGlobalErrorListeners()` | `@angular/core` | Ushlanmagan xatolarni tutish |
| `provideServerRendering(...)` | `@angular/ssr` | SSR (62-bob) |
| `provideZoneChangeDetection()` | `@angular/core` | zone.js ga qaytish (23-bob) |

> **Animatsiya uchun provayder kerak emas.** Zamonaviy Angular'da animatsiya — shablondagi `animate.enter` va `animate.leave` (kompilyator o'zi qo'llab-quvvatlaydi, CSS bilan ishlaydi). Eski `@angular/animations` paketi (`provideAnimationsAsync`, `trigger`, `state`) endi "legacy" hisoblanadi va `ng new` uni o'rnatmaydi.

### Xususiyat funksiyalari (`with*`)

`provide*` funksiyalari qo'shimcha sozlamalarni `with*` funksiyalari orqali oladi:

```ts
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withComponentInputBinding(),                                   // 41-bob
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' }), // 46-bob
    ),

    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor]),         // 56-bob
    ),
  ],
};
```

Nega obyekt emas, funksiya? **Tree-shaking**: ishlatilmagan xususiyat build'ga tushmaydi. `withInMemoryScrolling` ni chaqirmasangiz, uning kodi bundle'da yo'q.

### HTTP haqida muhim o'zgarish

Angular 22 da `HttpClient` **root darajasida sukut bo'yicha** taqdim etiladi. Ya'ni `provideHttpClient()` ni yozmasangiz ham `inject(HttpClient)` ishlaydi — haqiqiy loyihada test bilan tekshirildi.

`provideHttpClient()` endi **sozlash** uchun kerak:

```ts
provideHttpClient(withInterceptors([authInterceptor]))  // interceptorlar
provideHttpClient(withXhr())                            // fetch o'rniga XMLHttpRequest
```

Sukut bo'yicha so'rovlar **`fetch` API** orqali ketadi. `withFetch()` endi kerak emas va eskirgan deb belgilangan. `withXhr()` faqat bitta holatda kerak: fayl yuklashda **progress** ko'rsatish (fetch buni qo'llab-quvvatlamaydi).

> **Ilgari:** `HttpClientModule` import qilinardi, keyin `provideHttpClient()` majburiy edi, keyin `withFetch()` alohida qo'shilardi. Eski loyihada ularni ko'rsangiz — hammasi ishlaydi, lekin yangi kodda kerak emas.

## Kod: oddiy provayder obyektlari

`provide*` funksiyasi bo'lmagan narsalar uchun — to'g'ridan-to'g'ri provayder obyekti:

```ts
import { ErrorHandler } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Xato ishlovchisini almashtirish
    { provide: ErrorHandler, useClass: AppErrorHandler },

    // Konfiguratsiya qiymati
    { provide: API_URL, useValue: environment.apiUrl },
  ],
};
```

Provayder turlari (`useClass`, `useValue`, `useFactory`, `useExisting`) 36-bobda, `InjectionToken` (`API_URL`) — 38-bobda.

## Kod: ishga tushishdan oldin yuklash

Ilova ko'rinishidan oldin nimadir tayyor bo'lishi kerak — masalan serverdan konfiguratsiya yoki joriy foydalanuvchi:

```ts
import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    provideAppInitializer(() => {
      const config = inject(RemoteConfig);

      return config.load();           // Promise qaytsa — tugashini kutadi
    }),
  ],
};
```

```ts
// remote-config.ts
import { Service, signal } from '@angular/core';

@Service()
export class RemoteConfig {
  readonly features = signal<Record<string, boolean>>({});

  async load() {
    const response = await fetch('/api/config');

    this.features.set(await response.json());
  }
}
```

`provideAppInitializer` ichida `inject()` ishlaydi — bu **injection konteksti** (35-bob).

**Ehtiyot bo'ling:** initializer ilovani **bloklaydi**. Server 3 soniya javob bermasa, foydalanuvchi 3 soniya bo'sh ekran ko'radi. Faqat haqiqatan majburiy narsani yuklang, qolganini ilova ichida kechiktirib yuklang.

> **Ilgari:** `{ provide: APP_INITIALIZER, useFactory: ..., multi: true }`. Hali ishlaydi, lekin `provideAppInitializer` qisqaroq va `inject()` bilan tabiiy ishlaydi.

## Kod: eski `NgModule` kutubxonalari

Ba'zi kutubxonalar hali ham faqat `NgModule` beradi. Ularni standalone ilovaga ulash:

```ts
import { importProvidersFrom } from '@angular/core';
import { LegacyChartsModule } from 'legacy-charts';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(LegacyChartsModule.forRoot({ theme: 'dark' })),
  ],
};
```

`importProvidersFrom` moduldan faqat **provayderlarni** oladi. Moduldagi komponentlarni shablonda ishlatish uchun esa modulni komponentning `imports` iga qo'shasiz.

Kutubxonaning `provide*` funksiyasi bo'lsa — doim o'shani afzal ko'ring.

## Kod: o'z `provide*` funksiyangiz

Bir nechta provayderni bitta funksiyaga yig'ish — kutubxona yoki katta xususiyat uchun:

```ts
// analytics/provide-analytics.ts
import { EnvironmentProviders, makeEnvironmentProviders, provideAppInitializer, inject } from '@angular/core';

export interface AnalyticsOptions {
  siteId: string;
  enabled: boolean;
}

export function provideAnalytics(options: AnalyticsOptions): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS_OPTIONS, useValue: options },
    provideAppInitializer(() => {
      if (options.enabled) inject(Analytics).start();
    }),
  ]);
}
```

```ts
// app.config.ts
providers: [
  provideAnalytics({ siteId: 'abc-123', enabled: environment.production }),
]
```

`makeEnvironmentProviders` natijasi faqat ilova yoki marshrut darajasida ishlatiladi — komponentning `providers` iga qo'yib bo'lmaydi. Bu ataylab: global sozlamalar tasodifan komponent ichiga tushib qolmasin.

## Kod: provayderlar qayerda bo'lishi mumkin

| Joy | Qamrov | Misol |
| --- | --- | --- |
| `app.config.ts` | Butun ilova | Router, HTTP, xato ishlovchisi |
| Marshrut `providers` | Shu marshrut va uning bolalari | Admin bo'limiga xos xizmat |
| Komponent `providers` | Shu komponent va uning bolalari | Har forma uchun alohida holat |
| `@Service()` | Butun ilova, **avtomatik** | Ko'pchilik xizmatlar |

Oxirgi qator eng muhim: oddiy xizmatlarni `providers` ga **yozish shart emas**. `@Service()` bilan belgilangan klass root darajasida o'zi taqdim etiladi:

```ts
@Service()
export class OrderApi { ... }

// Istalgan joyda:
private readonly orders = inject(OrderApi);
```

`providers` faqat **sozlash** kerak bo'lganda yoki xizmatni **almashtirish** kerak bo'lganda kerak. Qamrov va iyerarxiya 37-bobda.

## Muhandislik nuqtai nazari: `app.config.ts` o'sib ketganda

Katta ilovada `providers` 30–40 qatorga yetadi. Tartib saqlash usullari:

**1. Guruhlab izoh qo'yish:**

```ts
providers: [
  // Asosiy
  provideBrowserGlobalErrorListeners(),
  { provide: ErrorHandler, useClass: AppErrorHandler },

  // Marshrutlash
  provideRouter(routes, withComponentInputBinding()),

  // Ma'lumot
  provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),

  // Ishga tushirish
  provideAppInitializer(() => inject(Session).restore()),
],
```

**2. Xususiyatlarni o'z `provide*` funksiyasiga chiqarish** — yuqoridagi `provideAnalytics` kabi.

**3. Muhitga qarab ajratish:**

```ts
providers: [
  ...commonProviders,
  ...(environment.production ? [] : [provideDevTools()]),
],
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Har xizmatni `providers` ga yozish | Keraksiz, `@Service()` o'zi taqdim etadi | Faqat sozlash uchun |
| `withFetch()` qo'shish | Keraksiz, eskirgan | Sukut bo'yicha fetch |
| Fayl yuklash progressi fetch bilan | Progress hodisasi kelmaydi | `withXhr()` |
| Initializer'da sekin so'rov | Uzoq bo'sh ekran | Faqat majburiy narsa |
| `HttpClientModule` ni import qilish | Eski uslub | Kerak emas yoki `provideHttpClient()` |
| Kutubxona modulini `imports` ga qo'yib, provayderlarni kutish | Xizmat topilmaydi | `importProvidersFrom(...)` |
| `makeEnvironmentProviders` natijasini komponentga | Xato | Ilova yoki marshrut darajasida |

## Amaliyot

1. `app.config.ts` ga `provideHttpClient` qo'shmasdan xizmatda `inject(HttpClient)` qiling — ishlashini tasdiqlang.
2. `ErrorHandler` ni almashtiring: `handleError` da xatoni `console.error` ga "[ILOVA]" prefiksi bilan chiqaring. Komponentda ataylab xato tashlab tekshiring.
3. `provideAppInitializer` bilan `/api/config` ni yuklang; javobni 2 soniya kechiktirib, bo'sh ekran vaqtini ko'ring.
4. `provideAnalytics({ siteId, enabled })` funksiyasini yozing va `app.config.ts` ga ulang.
5. `providers` ni guruhlarga ajratib izoh bilan tartiblang.

## Rasmiy hujjat

- Standalone ilovalar: <https://angular.dev/guide/components/importing>
- `bootstrapApplication`: <https://angular.dev/api/platform-browser/bootstrapApplication>
- `provideAppInitializer`: <https://angular.dev/api/core/provideAppInitializer>
- HTTP sozlash: <https://angular.dev/guide/http/setup>
- Provayderlar: <https://angular.dev/guide/di/defining-dependency-providers>
