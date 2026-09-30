# 38 — `InjectionToken` va konfiguratsiya

[← Oldingi: Injector iyerarxiyasi](37-injector-iyerarxiyasi.md) · [Mundarija](README.md) · [Keyingi: DI naqshlari →](39-di-naqshlari.md)

## Tushuncha

Klass — o'zi token. Lekin `string`, `number`, obyekt, funksiya uchun klass yo'q. `InjectionToken` — **klass bo'lmagan qiymatlar** uchun tipli token:

```ts
import { InjectionToken } from '@angular/core';

export const API_URL = new InjectionToken<string>('API_URL');
```

```ts
providers: [{ provide: API_URL, useValue: 'https://api.example.uz' }]
```

```ts
private readonly apiUrl = inject(API_URL);     // tipi: string
```

Konstruktordagi `'API_URL'` — faqat **tavsif** (xato xabarlari va DevTools uchun). Tokenning o'ziga xosligi — obyektning o'zi. Ikki xil `new InjectionToken('API_URL')` — ikki xil token.

## Nega shunday

Nega oddiy satr kalit emas (`{ provide: 'apiUrl', ... }`)?

| Satr kalit | `InjectionToken` |
| --- | --- |
| Tip yo'q — `inject('apiUrl')` → `any` | `inject(API_URL)` → `string` |
| Ikki kutubxona bir xil satrni ishlatsa — to'qnashuv | Har token noyob |
| Xato yozilsa (`'apiURL'`) — runtime'da NG0201 | Import — kompilyatsiyada tekshiriladi |

## Kod: `factory` bilan token

Provayder yozmasdan standart qiymat:

```ts
export const PAGE_SIZE = new InjectionToken<number>('PAGE_SIZE', {
  factory: () => 20,
});
```

Tekshirildi: `providers` siz `inject(PAGE_SIZE)` → `20`. Kerak joyda almashtiriladi:

```ts
@Component({
  providers: [{ provide: PAGE_SIZE, useValue: 50 }],
})
```

Factory ichida `inject()` ishlaydi:

```ts
export const WINDOW = new InjectionToken<Window | null>('WINDOW', {
  factory: () => isPlatformBrowser(inject(PLATFORM_ID)) ? window : null,
});
```

Bu — brauzer global'larini **test va SSR** uchun o'rashning standart usuli. Komponent `inject(WINDOW)` qiladi, `window` ga to'g'ridan-to'g'ri murojaat qilmaydi.

Factory'siz va providers'siz (tekshirildi):

```
NG0201: No provider found for `InjectionToken PAGE_SIZE`.
```

## Kod: ilova konfiguratsiyasi

```ts
// app-config.ts
export interface AppConfig {
  readonly apiUrl: string;
  readonly sentryDsn: string | null;
  readonly features: Readonly<{ newCheckout: boolean }>;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
```

### Build vaqtidagi konfiguratsiya

```bash
ng generate environments
```

```ts
// src/environments/environment.ts
export const environment: AppConfig = {
  apiUrl: 'http://localhost:8000/api',
  sentryDsn: null,
  features: { newCheckout: true },
};
```

```ts
// src/environments/environment.development.ts — `ng serve` da almashtiriladi
```

```ts
// app.config.ts
providers: [{ provide: APP_CONFIG, useValue: environment }]
```

Komponent va xizmatlar `environment` ni **import qilmaydi** — `inject(APP_CONFIG)`. Sabab: testda `useValue` bilan almashtirish oson, `environment` fayli bitta joyda.

### Ishga tushish vaqtidagi konfiguratsiya

Bitta build'ni turli serverlarga (staging, prod) joylash kerak bo'lsa — konfiguratsiya build ichida bo'lmasligi kerak:

```ts
// main.ts
const config: AppConfig = await fetch('/config.json').then((r) => r.json());

bootstrapApplication(App, {
  ...appConfig,
  providers: [...appConfig.providers, { provide: APP_CONFIG, useValue: config }],
});
```

`main.ts` dagi top-level `await` — Angular 22 build'dan muammosiz o'tadi (tekshirildi; zoneless ilovada `zone.js` cheklovi yo'q). `config.json` — deploy vaqtida serverga qo'yiladi. Ilova ishga tushishdan **oldin** yuklanadi, shuning uchun `APP_CONFIG` hamma joyda sinxron mavjud.

Alternativa — `provideAppInitializer`:

```ts
providers: [
  provideAppInitializer(() => inject(ConfigStore).load()),   // Promise qaytarsa kutadi
]
```

Farqi: `provideAppInitializer` da konfiguratsiya **xizmat ichida signal** — boshqa provayderlarning `factory` si uni sinxron ishlata olmaydi. `main.ts` usuli soddaroq va ishonchliroq.

## Kod: kutubxona sozlamasi

Kutubxona (yoki ilovaning mustaqil qismi) sozlamani token orqali oladi:

```ts
// toast/toast.config.ts
export interface ToastConfig {
  duration: number;
  position: 'top' | 'bottom';
}

const DEFAULTS: ToastConfig = { duration: 3000, position: 'bottom' };

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG', {
  factory: () => DEFAULTS,
});

export function provideToast(config: Partial<ToastConfig> = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TOAST_CONFIG, useValue: { ...DEFAULTS, ...config } },
  ]);
}
```

```ts
providers: [provideToast({ position: 'top' })]
```

Uch darajali naqsh: token (+ standart qiymat) → `provideXxx` funksiyasi → foydalanuvchi faqat funksiyani ko'radi.

## Kod: funksiya token

```ts
export type Now = () => Date;
export const NOW = new InjectionToken<Now>('NOW', { factory: () => () => new Date() });
```

```ts
// Testda vaqtni muzlatish
providers: [{ provide: NOW, useValue: () => new Date('2026-01-01T09:00:00') }]
```

Vaqt, tasodifiy son, UUID generatori — test qiyin bo'lgan narsalarni token orqali bering.

## Muhandislik nuqtai nazari

| Qiymat | Qanday |
| --- | --- |
| Muhitga qarab, build'da ma'lum | `environment.ts` → `APP_CONFIG` |
| Deploy'da o'zgaradi (bitta build) | `config.json` → `main.ts` |
| Standart qiymatli sozlama | `InjectionToken` + `factory` |
| Brauzer global'i (`window`, `localStorage`) | Token + `factory` + platform tekshiruvi |
| Test qilinmaydigan narsa (vaqt, random) | Funksiya token |

**Maxfiy ma'lumot** — konfiguratsiya brauzerga boradi. `environment.ts` va `config.json` da API kalitlar, parollar bo'lmasin. Ular faqat serverda (SSR yoki backend).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `{ provide: 'apiUrl', ... }` | `any` tip, to'qnashuv | `InjectionToken<string>` |
| Tokenni ikki joyda `new` qilish | Ikki xil token, NG0201 | Bitta faylda e'lon, import |
| Komponentda `import { environment }` | Testda almashtirib bo'lmaydi | `inject(APP_CONFIG)` |
| Maxfiy kalit `environment.ts` da | Bundle'da hamma ko'radi | Serverda saqlash |
| Komponentda `window.innerWidth` | SSR'da `window is not defined` | `WINDOW` tokeni |
| Konfiguratsiyani har muhitga alohida build | Staging/prod turli artefakt | `config.json` ishga tushishda |

## Amaliyot

1. `API_URL` tokeni yarating va `UserApi` da ishlating; testda boshqa URL bering.
2. `PAGE_SIZE` ni `factory: () => 20` bilan yozing, bitta komponentda 50 ga almashtiring.
3. `WINDOW` tokenini SSR-xavfsiz qilib yozing.
4. `ng generate environments` → `APP_CONFIG` orqali ulang.
5. `main.ts` da `config.json` ni yuklab, `APP_CONFIG` ga bering; faylni o'zgartirib, qayta build'siz farqni ko'ring.
6. `provideToast(config)` ni standart qiymatlar bilan yozing.

## Rasmiy hujjat

- `InjectionToken`: <https://angular.dev/api/core/InjectionToken>
- Muhitlar: <https://angular.dev/tools/cli/environments>
- `provideAppInitializer`: <https://angular.dev/api/core/provideAppInitializer>
