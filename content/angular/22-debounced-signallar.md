# 22 — Debounced signallar

[← Oldingi: httpResource()](21-http-resource.md) · [Mundarija](README.md) · [Keyingi: Zoneless →](23-zoneless.md)

## Tushuncha

Foydalanuvchi qidiruv maydoniga "noutbuk" yozsa — 7 ta harf, 7 ta o'zgarish. Har birida server so'rovi — 7 ta so'rov, oltitasi keraksiz.

**Debounce** — "yozish to'xtaguncha kut, keyin oxirgi qiymatni ol":

```
Yozish:     n  no  nou  nout  noutb  noutbu  noutbuk
            ─┬──┬───┬────┬─────┬──────┬───────┬─────── 300 ms jimlik ──►
So'rov:                                                 "noutbuk"  (bitta)
```

Angular 22 da buning uchun `debounced()` funksiyasi bor:

```ts
import { debounced, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

export class ProductSearch {
  protected readonly query = signal('');
  protected readonly debouncedQuery = debounced(this.query, 300);

  protected readonly results = httpResource<Product[]>(() => {
    const q = this.debouncedQuery.value();

    return q.length >= 2 ? { url: '/api/products', params: { q } } : undefined;
  });
}
```

```html
<input type="search" [value]="query()" (input)="query.set($any($event.target).value)">

@if (debouncedQuery.isLoading()) {
  <small>Yozilmoqda…</small>
}
```

> **Holati: eksperimental.** `debounced` Angular 22.0 da `@experimental` deb belgilangan. API keyingi versiyalarda o'zgarishi mumkin. Pastda — RxJS bilan barqaror muqobil.

## Nega shunday

Ilgari debounce faqat RxJS orqali qilinardi:

```ts
// Ilgari: signal → Observable → debounce → signal
protected readonly query = signal('');

protected readonly debouncedQuery = toSignal(
  toObservable(this.query).pipe(debounceTime(300), distinctUntilChanged()),
  { initialValue: '' },
);
```

Ishlaydi, lekin uchta dunyo aralashadi: signal, Observable, yana signal. `debounced` — shu naqshni bitta chaqiruvga aylantiradi va natija `Resource` bo'lgani uchun "kutilmoqda" holati ham bepul keladi.

## Kod: qanday ishlaydi — test bilan tasdiqlangan

```ts
debounced(source, wait, options?)   // → Resource<T>
```

Qaytgan narsa — **`Resource`** (20-bob), oddiy signal emas. Shuning uchun `value()`, `status()`, `isLoading()` bor.

Angular 22 da test natijalari:

| Nima bo'ldi | `status()` | `value()` |
| --- | --- | --- |
| Boshida, `query` = `'a'` | `resolved` | `'a'` |
| `query.set('ab')` — darhol | **`loading`** | `'a'` — **eski qiymat saqlanadi** |
| 300 ms o'tdi | `resolved` | `'ab'` |

Kutish paytida eski qiymat saqlanishi muhim: natijalar ro'yxati yo'qolib, bo'sh ekran chiqmaydi. `isLoading()` esa "yozilmoqda" ko'rsatkichi uchun.

Tez yozishda **oraliq qiymatlar tashlab yuboriladi** — tekshirildi: `ab → abc → abcd` tez kiritilganda `abc` hech qachon `value()` da ko'rinmadi, faqat oxirgi `abcd`.

## Kod: kutish funksiyasi

`wait` son o'rniga funksiya bo'lishi mumkin — qiymatga qarab kutish vaqtini tanlash:

```ts
protected readonly debouncedQuery = debounced(this.query, (value) =>
  value === ''
    ? undefined                                            // bo'sh — darhol
    : new Promise<void>((resolve) => setTimeout(resolve, 300)),   // matn — 300 ms
);
```

Tekshirildi: bo'sh satr uchun `status` darhol `resolved`; matn uchun `loading`, keyin `resolved`.

Nega kerak: foydalanuvchi maydonni **tozalaganda** natijalar darhol yo'qolsin — 300 ms kutish ma'nosiz.

Funksiya ikkinchi argument ham oladi — oldingi holat (`ResourceSnapshot`):

```ts
debounced(this.query, (value, last) =>
  last.status === 'resolved' && value.startsWith(last.value)
    ? new Promise<void>((r) => setTimeout(r, 150))   // davom ettirilmoqda — tezroq
    : new Promise<void>((r) => setTimeout(r, 400)),
);
```

## Kod: `httpResource` bilan birga

Yuqoridagi misolda ikkita "yuklanish" bor:

| Signal | Ma'nosi |
| --- | --- |
| `debouncedQuery.isLoading()` | Foydalanuvchi hali yozyapti |
| `results.isLoading()` | Server javob kutilmoqda |

Ularni ajratib ko'rsatish mumkin:

```html
@if (debouncedQuery.isLoading()) {
  <small class="hint">Yozilmoqda…</small>
} @else if (results.isLoading()) {
  <app-spinner size="small" />
}

@if (results.hasValue()) {
  @for (p of results.value(); track p.id) {
    <app-product-card [product]="p" />
  } @empty {
    <p>"{{ debouncedQuery.value() }}" bo'yicha hech narsa topilmadi</p>
  }
}
```

`httpResource` so'rovni `debouncedQuery.value()` o'zgargandagina yuboradi — ya'ni yozish to'xtagandan keyin, bir marta.

## Kod: barqaror muqobil — RxJS

`debounced` eksperimental ekan, production'da barqaror yo'l kerak bo'lsa:

```ts
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

protected readonly query = signal('');

protected readonly debouncedQuery = toSignal(
  toObservable(this.query).pipe(
    debounceTime(300),
    distinctUntilChanged(),
  ),
  { initialValue: '' },
);
```

| | `debounced()` | RxJS |
| --- | --- | --- |
| Holati | Eksperimental (22.0) | Barqaror |
| Qaytaradi | `Resource<T>` — `isLoading()` bor | `Signal<T>` |
| "Yozilmoqda" ko'rsatkichi | Tayyor | Qo'lda |
| Qo'shimcha operatorlar (`filter`, `map`) | Yo'q | Bor |
| Bog'liqlik | Faqat `@angular/core` | RxJS |

RxJS va signallar birga — 24-bobda.

## Muhandislik nuqtai nazari: debounce qayerda kerak

| Joy | Kerakmi | Kutish |
| --- | --- | --- |
| Qidiruv, avtoto'ldirish | ✅ | 250–400 ms |
| Forma maydonini serverda tekshirish ("login band") | ✅ | 400–600 ms |
| Filtrlar (checkbox, select) | ❌ Odatda yo'q — har bosish maqsadli | — |
| Oyna o'lchami, scroll | ✅ yoki throttle | 100–200 ms |
| Qoralamani avtosaqlash | ✅ | 1–2 s |
| Tugma bosish | ❌ Debounce emas — tugmani bloklash | — |

Juda kichik kutish (50 ms) — foyda yo'q. Juda katta (1 s) — ilova "sekin" tuyuladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Debounce'siz qidiruv `httpResource` | Har harfda so'rov | `debounced` yoki RxJS |
| `debounced` natijasini signal deb o'qish (`dq()`) | Xato — bu `Resource` | `dq.value()` |
| Bo'sh satr uchun ham kutish | Tozalaganda natijalar kechikib yo'qoladi | `wait` funksiyasi |
| `isLoading` ni ajratmaslik | "Yozilmoqda" va "yuklanmoqda" bir xil | Ikkala resursni alohida |
| Production'da eksperimental API ga to'liq tayanish | Yangilanishda o'zgarishi mumkin | RxJS muqobili yoki o'rovchi funksiya |
| Tugma bosishga debounce | Foydalanuvchi "ishlamayapti" deb o'ylaydi | Yuborish paytida `disabled` |

## Amaliyot

1. Qidiruvni debounce'siz `httpResource` bilan yozing, "noutbuk" deb yozib Network'da so'rovlarni sanang.
2. `debounced(query, 300)` qo'shing va so'rovlar sonini qayta sanang.
3. "Yozilmoqda…" va spinner'ni alohida ko'rsating.
4. Bo'sh satr uchun darhol, matn uchun 300 ms kutadigan `wait` funksiyasini yozing.
5. Xuddi shu qidiruvni RxJS (`toObservable` + `debounceTime` + `toSignal`) bilan yozing va ikkalasini solishtiring.

## Rasmiy hujjat

- Debounced signallar: <https://angular.dev/guide/signals/debounced>
- `debounced` API: <https://angular.dev/api/core/debounced>
- RxJS `debounceTime`: <https://rxjs.dev/api/operators/debounceTime>
