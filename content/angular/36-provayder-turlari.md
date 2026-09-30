# 36 — Provayder turlari

[← Oldingi: `inject()` va injection konteksti](35-inject-va-kontekst.md) · [Mundarija](README.md) · [Keyingi: Injector iyerarxiyasi →](37-injector-iyerarxiyasi.md)

## Tushuncha

Provayder — injectorga "shu token so'ralsa, **mana bunday** qiymat ber" degan retsept. To'liq shakli:

```ts
{ provide: TOKEN, useXxx: ... }
```

| Tur | Qiymat qayerdan | Misol |
| --- | --- | --- |
| `useClass` | Klassdan nusxa yaratiladi | `{ provide: Logger, useClass: ConsoleLogger }` |
| `useValue` | Tayyor qiymat | `{ provide: API_URL, useValue: '/api' }` |
| `useFactory` | Funksiya natijasi | `{ provide: Storage, useFactory: () => ... }` |
| `useExisting` | Boshqa tokenning **o'sha nusxasi** | `{ provide: OldLogger, useExisting: Logger }` |

Qisqa shakl `providers: [Store]` — `{ provide: Store, useClass: Store }` bilan bir xil.

## Nega shunday

Token (so'raladigan narsa) va amalga oshirish (beriladigan narsa) **ajratilgan**. Komponent `inject(Logger)` deydi — qaysi `Logger` kelishini provayder hal qiladi. Shuning uchun:

- Testda haqiqiy xizmat o'rniga soxtasi.
- Muhitga qarab turli amalga oshirish (dev: konsol, prod: server).
- Kutubxona interfeysni belgilaydi, ilova amalga oshiradi.

## Kod: `useClass` — abstrakt token

```ts
export abstract class Logger {
  abstract log(message: string): void;
}

@Injectable()
export class ConsoleLogger extends Logger {
  log(message: string) { console.log(message); }
}

@Injectable()
export class RemoteLogger extends Logger {
  private readonly http = inject(HttpClient);
  log(message: string) { this.http.post('/api/logs', { message }).subscribe(); }
}
```

```ts
// app.config.ts
providers: [
  { provide: Logger, useClass: isDevMode() ? ConsoleLogger : RemoteLogger },
]
```

```ts
// Ishlatish — qaysi biri ekanini bilmaydi
private readonly logger = inject(Logger);
```

Nega `interface` emas, `abstract class`? TypeScript interfeyslari runtime'da **yo'q** — token bo'la olmaydi. Abstrakt klass esa ham tip, ham runtime qiymati.

Tekshirildi: `{ provide: Logger, useClass: ConsoleLogger }` → `inject(Logger).log('x')` → `ConsoleLogger` ishladi.

## Kod: `useValue`

```ts
providers: [
  { provide: API_URL, useValue: 'https://api.example.uz' },
  { provide: FEATURE_FLAGS, useValue: { newCheckout: true, darkMode: false } },
]
```

Testlarda eng ko'p ishlatiladi:

```ts
TestBed.configureTestingModule({
  providers: [{ provide: UserApi, useValue: { get: () => of(fakeUser) } }],
});
```

Tekshirildi: `@Service()` bilan e'lon qilingan `Api` ni `{ provide: Api, useValue: { get: () => 'fake' } }` almashtirdi — komponent `fake` ni ko'rsatdi.

**Diqqat:** `useValue` obyekti **muzlatilmaydi**. Bir joyda o'zgartirsangiz, hamma ko'radi. Konfiguratsiya uchun `Object.freeze` yoki `readonly` tip.

## Kod: `useFactory`

Qiymatni hisoblash kerak bo'lsa:

```ts
providers: [
  {
    provide: Storage,
    useFactory: () => {
      const platform = inject(PLATFORM_ID);
      return isPlatformBrowser(platform) ? window.localStorage : new MemoryStorage();
    },
  },
]
```

Factory ichida `inject()` ishlaydi. Eski `deps: [...]` massivi endi kerak emas.

## Kod: `useExisting` — taxallus

```ts
providers: [
  Logger,
  { provide: AuditLogger, useExisting: Logger },
]
```

`inject(AuditLogger)` — **o'sha** `Logger` nusxasi (tekshirildi, `===` → `true`). `useClass` bo'lganda esa — **ikkinchi** nusxa.

Asosiy ishlatilishi — bir klassni bir nechta token ostida taqdim etish:

```ts
@Component({
  selector: 'app-date-input',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DateInput), multi: true },
  ],
})
export class DateInput implements ControlValueAccessor { ... }
```

`forwardRef` — klass hali e'lon qilinmagan paytda unga murojaat qilish (dekorator klass tanasidan oldin ishlaydi).

## Kod: `multi: true`

Bir tokenga **bir nechta** qiymat — massiv sifatida:

```ts
export const VALIDATION_RULES = new InjectionToken<Rule[]>('VALIDATION_RULES');

providers: [
  { provide: VALIDATION_RULES, useValue: requiredRule, multi: true },
  { provide: VALIDATION_RULES, useValue: emailRule, multi: true },
]
```

```ts
private readonly rules = inject(VALIDATION_RULES);   // [requiredRule, emailRule]
```

Tekshirildi: ikki `multi` provayder → `['a', 'b']`.

Angular'ning o'zi shunday ishlaydi: `NG_VALUE_ACCESSOR`, `APP_INITIALIZER` (endi `provideAppInitializer`), eski `HTTP_INTERCEPTORS` — hammasi `multi` tokenlar. Plagin tizimi uchun qulay: har modul o'z qiymatini qo'shadi.

**Diqqat:** `multi` va oddiy provayderni bitta tokenga aralashtirsangiz (tekshirildi):

```
Error: Cannot mix multi providers and regular providers
```

Hammasi `multi` bo'lsin.

## Kod: `provide*` funksiyalari

Angular kutubxonalari provayderlarni funksiyalar orqali beradi:

```ts
providers: [
  provideRouter(routes, withComponentInputBinding()),
  provideHttpClient(withInterceptors([authInterceptor])),
  provideAppInitializer(() => inject(Config).load()),
]
```

O'zingiz ham shunday qiling — foydalanuvchi ichki tokenlarni bilishi shart emas:

```ts
// analytics.providers.ts
export function provideAnalytics(config: AnalyticsConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS_CONFIG, useValue: config },
    { provide: Analytics, useClass: config.enabled ? GaAnalytics : NoopAnalytics },
  ]);
}
```

```ts
providers: [provideAnalytics({ enabled: !isDevMode(), id: 'G-XXX' })]
```

`makeEnvironmentProviders` — natijani faqat **environment injector** da (app.config, marshrut) ishlatish mumkin qiladi; komponent `providers` ga qo'yilsa (tekshirildi):

```
error TS2322: Type 'EnvironmentProviders' is not assignable to type 'Provider'.
```

Shunday qilib global xizmatlar komponent darajasida tasodifan qayta yaratilmaydi.

## Muhandislik nuqtai nazari

| Vaziyat | Provayder |
| --- | --- |
| Oddiy xizmat | `@Service()` — provayder yozmaysiz |
| Interfeys + bir nechta amalga oshirish | Abstrakt klass + `useClass` |
| Konfiguratsiya | `InjectionToken` + `useValue` (38-bob) |
| Muhitga bog'liq yaratish | `useFactory` |
| Bitta nusxa, ikki nom | `useExisting` |
| Kengaytiriladigan ro'yxat | `multi: true` |
| Kutubxona/modul sozlamasi | `provideXxx()` + `makeEnvironmentProviders` |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `interface` ni token qilish | Runtime'da yo'q — kompilyatsiya xatosi | Abstrakt klass yoki `InjectionToken` |
| `useExisting` o'rniga `useClass` | Ikki nusxa, holat bo'linadi | `useExisting` |
| `multi` va oddiy provayderni aralashtirish | Xato | Hammasi `multi` |
| `useValue` obyektini o'zgartirish | Butun ilova ta'sirlanadi | `readonly` / `Object.freeze` |
| `useFactory` da `deps` bilan eski yozuv | Keraksiz | Ichida `inject()` |
| Global provayder qaytaruvchi funksiyani komponentga qo'yish | Qayta nusxa | `makeEnvironmentProviders` |

## Amaliyot

1. `abstract class Logger` + `ConsoleLogger` / `SilentLogger` — `isDevMode()` ga qarab `useClass`.
2. Testda `useValue` bilan soxta `UserApi` qo'ying.
3. `Storage` ni `useFactory` bilan: brauzerda `localStorage`, serverda xotira.
4. `useExisting` va `useClass` bilan bir xil sinov: `===` natijasini solishtiring.
5. `VALIDATION_RULES` multi-token yarating, ikki joydan qoida qo'shing.
6. `provideAnalytics(config)` funksiyasini `makeEnvironmentProviders` bilan yozing.

## Rasmiy hujjat

- Provayderlarni aniqlash: <https://angular.dev/guide/di/defining-dependency-providers>
- `makeEnvironmentProviders`: <https://angular.dev/api/core/makeEnvironmentProviders>
- `forwardRef`: <https://angular.dev/api/core/forwardRef>
