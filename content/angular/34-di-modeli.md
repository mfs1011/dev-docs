# 34 — DI modeli

[← Oldingi: Dinamik komponentlar](33-dinamik-komponentlar.md) · [Mundarija](README.md) · [Keyingi: `inject()` va injection konteksti →](35-inject-va-kontekst.md)

## Tushuncha

**Dependency Injection** (bog'liqliklarni kiritish) — klass o'ziga kerakli narsalarni **o'zi yaratmaydi**, balki **so'raydi**, ularni esa tizim beradi.

```ts
// DI siz — klass o'zi yaratadi
export class OrderList {
  private readonly api = new OrderApi(new HttpClient(/* ??? */));
}

// DI bilan — klass so'raydi
export class OrderList {
  private readonly api = inject(OrderApi);
}
```

Uch tushuncha:

| Tushuncha | Nima | Misol |
| --- | --- | --- |
| **Token** | "Nima kerak" kaliti | `OrderApi` klassi, `API_URL` tokeni |
| **Provayder** | "Qanday yaratiladi" retsepti | `@Service()`, `{ provide, useValue }` |
| **Injector** | Retseptlarni saqlab, nusxalarni beradigan konteyner | Ildiz injector, komponent injectori |

`inject(OrderApi)` — injectorga "`OrderApi` tokeniga mos narsani ber" deyish. Injector provayderni topadi, kerak bo'lsa yaratadi, keyingi so'rovlarda **o'sha nusxani** qaytaradi.

## Nega shunday

DI siz `new` bilan yozilgan klass uch muammoga ega:

| Muammo | DI qanday hal qiladi |
| --- | --- |
| Klass bog'liqlikning bog'liqliklarini ham bilishi kerak (`HttpClient` nimani talab qiladi?) | Injector zanjirni o'zi yig'adi |
| Har komponent o'z nusxasini yaratadi — umumiy holat yo'q | Bitta nusxa hammaga ulashiladi |
| Testda haqiqiy `OrderApi` o'rniga soxtasini qo'yib bo'lmaydi | Provayderni almashtirish kifoya |

Angular butunlay DI ustiga qurilgan: `Router`, `HttpClient`, `ActivatedRoute`, `DestroyRef` — hammasi `inject()` bilan olinadi.

## Kod: `@Service()` — asosiy yo'l

Angular 22 da xizmat shunday yoziladi (`ng generate service order-api`):

```ts
// order-api.ts
import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Service()
export class OrderApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Order[]>('/api/orders');
  }
}
```

```ts
// order-list.ts
@Component({ ... })
export class OrderList {
  private readonly api = inject(OrderApi);
}
```

`@Service()` — `@Injectable({ providedIn: 'root' })` ning qisqa shakli. U xizmatni **ildiz injectoriga** avtomatik qo'shadi:

- Butun ilovada **bitta nusxa** (singleton).
- Hech qayerda `providers` ga yozish shart emas.
- Hech kim `inject` qilmasa — **bundle'ga kirmaydi** (tree-shaking).

Tekshirildi: `TestBed.inject(Counter) === TestBed.inject(Counter)` → `true`.

### `@Service` da konstruktor DI yo'q

```ts
@Service()
export class OrderApi {
  constructor(private http: HttpClient) {}   // ❌
}
```

Kompilyatsiya xatosi (tekshirildi):

```
NG2028: @Service class cannot use constructor dependency injection.
Use the `inject` function instead.
```

Hatto oddiy `constructor(public v: string)` ham shu xatoni beradi — `@Service` klassida konstruktor parametrlari umuman bo'lmasligi kerak.

## Kod: `@Injectable` — qachon kerak

`@Injectable` yo'qolmagan, lekin endi **maxsus holatlar** uchun:

```ts
import { Injectable } from '@angular/core';

@Injectable()                               // providedIn yo'q — providers'da ko'rsatiladi
export class FormState { ... }

@Injectable({ providedIn: 'platform' })     // bir sahifadagi bir nechta ilova uchun umumiy
export class SharedBus { ... }
```

| Kerak bo'lganda | Nimani ishlating |
| --- | --- |
| Oddiy global xizmat | `@Service()` |
| Global, lekin nusxani o'zingiz yaratasiz | `@Service({ factory: () => ... })` |
| Global emas — komponent/marshrut darajasida | `@Service({ autoProvided: false })` yoki `@Injectable()` + `providers` |
| Eski kod, konstruktor DI | `@Injectable()` (yoki `ng g @angular/core:inject-migration`) |
| `providedIn: 'platform'` | `@Injectable({ providedIn: 'platform' })` |

`providedIn: 'any'` va `providedIn: SomeModule` — **deprecated** (tekshirildi, `.d.ts` da `@deprecated`).

Eski `@Injectable({ providedIn: 'root' })` larni yangi shaklga o'tkazish:

```bash
ng g @angular/core:service-migration
```

## Kod: `autoProvided: false`

Xizmat faqat ma'lum joyda mavjud bo'lishi kerak bo'lsa:

```ts
@Service({ autoProvided: false })
export class CheckoutState {
  readonly step = signal(1);
}

@Component({
  selector: 'app-checkout',
  providers: [CheckoutState],      // shu komponent va bolalari uchun
  ...
})
export class Checkout { }
```

Provayder ko'rsatilmasa (tekshirildi):

```
NG0201: No provider found for `CheckoutState`.
```

Qayerda qanday nusxa yaratilishi — 37-bobda.

## Kod: `factory`

```ts
@Service({ factory: () => new SystemClock(inject(APP_CONFIG).timezone) })
export abstract class Clock {
  abstract now(): Date;
}

class SystemClock extends Clock {
  constructor(private readonly timezone: string) { super(); }
  now() { return new Date(); }
}
```

```ts
private readonly clock = inject(Clock);     // SystemClock nusxasi
```

`factory` — injector nusxani qanday yaratishini o'zingiz belgilaysiz. `inject()` ichida ishlaydi (factory injection kontekstida chaqiriladi). Tekshirildi: abstrakt klassga `@Service({ factory })` qo'yish ishlaydi — token abstrakt, nusxa esa factory'dan. `SystemClock` da konstruktor bor, lekin u `@Service` emas, oddiy klass — NG2028 tegishli emas. Testda `{ provide: Clock, useValue: fakeClock }` bilan almashtiriladi.

## Muhandislik nuqtai nazari

**Xizmat nima bo'lishi kerak?** Qoida: komponent — ko'rinish va foydalanuvchi bilan muloqot; xizmat — **qolgani**:

| Xizmatga | Komponentda qoladi |
| --- | --- |
| HTTP so'rovlar | Shablon holati (ochiq/yopiq) |
| Bir nechta komponent ulashadigan holat | Forma ko'rinishi |
| Biznes qoidalari (narx hisobi, ruxsatlar) | Hodisa → xizmat metodi chaqiruvi |
| Brauzer API o'rami (`localStorage`, `Clipboard`) | |

**Singleton — global holat.** `@Service()` dagi signal butun ilova uchun bitta. Bu kuchli, lekin xavfli: foydalanuvchi chiqib, boshqasi kirsa — eski holat qoladi. Global holatni **aniq tozalash** yo'lini o'ylang (39-bob).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `new OrderApi()` komponentda | Bog'liqliklar yo'q, test qiyin | `inject(OrderApi)` |
| `@Service` + `constructor(private http: HttpClient)` | NG2028 | `inject(HttpClient)` maydonda |
| `@Service()` klassini yana `providers` ga yozish | Komponent darajasida **ikkinchi nusxa** — holat bo'linadi | Yozmang yoki `autoProvided: false` |
| `autoProvided: false` + providers yo'q | NG0201 | Kerakli joyda `providers: [X]` |
| Hamma narsani komponentda | Takrorlanish, test qiyin | Mantiqni xizmatga |
| Global xizmatda foydalanuvchi ma'lumoti, tozalanmaydi | Chiqib-kirganda eski ma'lumot | `reset()` va logout'da chaqirish |

## Amaliyot

1. `ng g service cart` — yaratilgan faylni oching, `@Service()` ni ko'ring.
2. `Cart` xizmatida `items` signali va `add()` metodi yozing; ikki komponentdan ishlating — umumiy holatni tekshiring.
3. Konstruktorga `HttpClient` qo'shing — NG2028 ni ko'ring, `inject()` ga o'tkazing.
4. `@Service({ autoProvided: false })` yozing va providers'siz inject qiling — NG0201.
5. `factory` bilan xizmat yarating, ichida `inject()` ishlating.
6. Eski loyihada `ng g @angular/core:service-migration` ni ishga tushirib, diffni ko'ring.

## Rasmiy hujjat

- DI'ga kirish: <https://angular.dev/guide/di>
- Xizmat yaratish: <https://angular.dev/guide/di/creating-and-using-services>
- NG0201: <https://angular.dev/errors/NG0201>
