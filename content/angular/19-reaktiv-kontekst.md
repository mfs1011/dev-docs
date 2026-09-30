# 19 — Reaktiv kontekst qoidalari

[← Oldingi: linkedSignal()](18-linked-signal.md) · [Mundarija](README.md) · [Keyingi: resource() →](20-resource.md)

## Tushuncha

**Reaktiv kontekst** — signal o'qishlari **kuzatiladigan** joy. Uchta asosiy:

| Kontekst | Nima kuzatiladi |
| --- | --- |
| Shablon | Shablonda o'qilgan signallar |
| `computed(() => ...)` | Funksiya ichida o'qilgan signallar |
| `effect(() => ...)` | Funksiya ichida o'qilgan signallar |

Kontekstdan tashqarida — oddiy metodda, `setTimeout` ichida, hodisa ishlovchisida — signalni o'qish shunchaki qiymat oladi, hech narsa kuzatilmaydi.

Bu bobda — kontekst qoidalari va ular buzilganda nima bo'lishi. Barcha xatolar Angular 22 da test bilan olingan.

## Nega shunday

Reaktivlik "sehrli" emas. `computed` ishga tushganda Angular "hozir men `total` ni hisoblayapman" deb belgilaydi. Shu vaqtda o'qilgan har signal `total` ning bog'liqligi sifatida yoziladi. Hisob tugaganda belgi olib tashlanadi.

Shundan qoidalar kelib chiqadi:

1. **Kuzatish faqat sinxron.** `await` dan keyingi o'qish — belgi allaqachon olib tashlangan.
2. **Hisoblash paytida yozish mumkin emas.** Aks holda cheksiz sikl yoki bir-biriga zid holat.
3. **Bilmasdan o'qish ham bog'liqlik.** Chaqirilgan metod ichida signal o'qilsa — u ham kuzatiladi.

## Kod: 1-qoida — `computed` ichida yozish mumkin emas

```ts
const a = signal(1);
const b = signal(0);

const c = computed(() => {
  b.set(5);           // ✘
  return a();
});

c();
```

```
NG0600: Writing to signals is not allowed in a `computed`.
```

`computed` — **sof funksiya**: kirishdan chiqish hisoblaydi, dunyoni o'zgartirmaydi. Hisob davomida nimadir yozish kerak bo'lsa — mantiq noto'g'ri joyda.

## Kod: 2-qoida — `await` dan keyingi o'qish kuzatilmaydi

Test bilan tasdiqlandi: `await` dan **oldin** o'qilgan signal o'zgarsa — effect qayta ishlaydi; **keyin** o'qilgani o'zgarsa — yo'q.

```ts
// ❌
effect(async () => {
  const id = this.userId();            // ✅ kuzatiladi
  const user = await this.api.load(id);
  const lang = this.language();        // ❌ KUZATILMAYDI — await dan keyin
  this.render(user, lang);
});
```

`language` o'zgarsa — effect qayta ishlamaydi. Sabab: `await` funksiyani to'xtatadi, kuzatish belgisi o'sha payt olib tashlanadi, `language()` esa keyinroq, boshqa "tik"da o'qiladi.

To'g'risi — hamma signallarni boshida o'qish:

```ts
// ✅
effect(() => {
  const id = this.userId();
  const lang = this.language();

  this.api.load(id).then((user) => this.render(user, lang));
});
```

Yaxshiroq — asinxron ish uchun effect emas, `resource` (20-bob). U aynan shu muammoni hal qiladi: parametrlar sinxron o'qiladi, yuklash alohida.

## Kod: 3-qoida — yashirin bog'liqliklar

```ts
effect(() => {
  const page = this.page();
  this.logPageView(page);              // bu metod ichida this.user() o'qiladi!
});

private logPageView(page: number) {
  analytics.send({ page, user: this.user()?.id });
}
```

`user` o'zgarsa — effect ham qayta ishlaydi, garchi niyat faqat `page` edi. Effect kodida `user` ko'rinmaydi — shuning uchun bunday xatoni topish qiyin.

Yechim — `untracked` (17-bob):

```ts
effect(() => {
  const page = this.page();

  untracked(() => this.logPageView(page));
});
```

Qoida: **effect ichida siz yozmagan kodni chaqirsangiz — `untracked` ga o'rang**.

## Kod: 4-qoida — injection konteksti

Signal API'larining ko'pchiligi **injection kontekstini** talab qiladi (35-bob). Kontekst — Angular obyektni yaratayotgan payt: konstruktor, maydon initsializatori, `provideAppInitializer` ichi.

Kontekstdan tashqarida (tekshirildi):

```ts
ngOnInit() {
  effect(() => {});
}
```

```
NG0203: effect() can only be used within an injection context such as a constructor,
a factory function, a field initializer, or a function used with `runInInjectionContext`.
```

```ts
toSignal(someObservable$);   // oddiy funksiyada
```

```
NG0203: toSignal() can only be used within an injection context ...
```

| API | Injection konteksti kerakmi |
| --- | --- |
| `signal()`, `computed()`, `linkedSignal()` | ❌ Yo'q — istalgan joyda |
| `effect()`, `afterRenderEffect()` | ✅ Ha (yoki `injector` opsiyasi) |
| `resource()`, `httpResource()` | ✅ Ha (yoki `injector`) |
| `toSignal()`, `toObservable()` | ✅ Ha (yoki `injector`) |
| `input()`, `output()`, `model()`, `viewChild()` | ✅ Ha — faqat maydon sifatida |
| `inject()` | ✅ Ha |

Kontekstdan tashqarida yaratish kerak bo'lsa:

```ts
private readonly injector = inject(Injector);

protected watch() {
  effect(() => { ... }, { injector: this.injector });

  // yoki
  runInInjectionContext(this.injector, () => {
    const data = toSignal(this.stream$);
  });
}
```

## Kod: `isSignal` va `isWritableSignal`

Qiymat signalmi — ish vaqtida tekshirish:

```ts
import { isSignal, isWritableSignal } from '@angular/core';

function read<T>(value: T | Signal<T>): T {
  return isSignal(value) ? value() : value;
}

isWritableSignal(signal(1));             // true
isWritableSignal(computed(() => 1));     // false
isWritableSignal(signal(1).asReadonly()); // false
```

Kutubxona yozganda foydali: funksiya ham oddiy qiymat, ham signal qabul qilsin.

## Kod: `assertNotInReactiveContext`

O'z kodingizda "bu funksiya reaktiv kontekstda chaqirilmasin" deb himoya qo'yish:

```ts
import { assertNotInReactiveContext } from '@angular/core';

export function trackEvent(name: string) {
  assertNotInReactiveContext(trackEvent, 'Analitika hodisasini untracked() ichida yuboring');

  analytics.send(name);
}
```

Kimdir `trackEvent` ni `computed` yoki `effect` ichidan to'g'ridan-to'g'ri chaqirsa — dev rejimida xato, sababi bilan (tekshirildi):

```
NG0602: trackEvent() cannot be called from within a reactive context.
Analitika hodisasini untracked() ichida yuboring
```

## Muhandislik nuqtai nazari: reaktiv kodni o'qish

Signal kodini ko'rib chiqishda (code review) uchta savol:

| Savol | Nima qidiriladi |
| --- | --- |
| Bu `computed` sofmi? | Ichida `set`, HTTP, `localStorage`, `console.log` yo'qmi |
| Bu `effect` nimaga bog'liq? | Barcha o'qishlar — to'g'ridan-to'g'ri va chaqirilgan metodlar ichida |
| `await` bormi? | Undan keyin signal o'qilmayaptimi |

Ko'p qiyin xatolar shu uchta savolga javob berish bilan topiladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `computed` ichida `set` | NG0600 | Mantiqni `effect` yoki metodga |
| `await` dan keyin signal o'qish | Kuzatilmaydi, effect qayta ishlamaydi | Hammasini boshida o'qing yoki `resource` |
| Effect ichida metod chaqirish | Yashirin bog'liqlik | `untracked(() => ...)` |
| `ngOnInit` da `effect` yoki `toSignal` | NG0203 | Konstruktor yoki `injector` |
| `async` effect | Kuzatish chalkash | Sinxron effect + `resource` |
| `computed` ichida `console.log` qoldirish | "Nega ikki marta?" chalkashligi — dangasa hisob | Faqat nosozlik tuzatishda |

## Amaliyot

1. `computed` ichida `set` qiling va NG0600 ni ko'ring.
2. `async` effect yozing: `await` dan keyin signal o'qing, o'sha signalni o'zgartirib, effect qayta ishlamasligini tasdiqlang. Keyin tuzating.
3. Effect ichidan signal o'qiydigan metodni chaqiring — kutilmagan qayta ishlashni `console.log` bilan toping, `untracked` bilan tuzating.
4. `ngOnInit` da `toSignal` chaqiring — NG0203; keyin `runInInjectionContext` bilan tuzating.
5. `read<T>(value: T | Signal<T>)` yordamchisini `isSignal` bilan yozing.

## Rasmiy hujjat

- Signallar: <https://angular.dev/guide/signals>
- `untracked`: <https://angular.dev/api/core/untracked>
- Injection konteksti: <https://angular.dev/guide/di/dependency-injection-context>
- NG0600: <https://angular.dev/errors/NG0600>
- NG0203: <https://angular.dev/errors/NG0203>
