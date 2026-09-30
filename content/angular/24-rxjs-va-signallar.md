# 24 — RxJS va signallar birga

[← Oldingi: Zoneless](23-zoneless.md) · [Mundarija](README.md) · [Keyingi: input() →](25-input.md)

## Tushuncha

Angular'da reaktivlikning ikki tizimi bor:

| | Signal | RxJS Observable |
| --- | --- | --- |
| Nima | **Qiymat** — hozir nima | **Oqim** — vaqt davomida hodisalar |
| Doim qiymati bormi | Ha | Yo'q — keyin keladi yoki hech qachon |
| O'qish | `count()` — sinxron | `subscribe(...)` — asinxron |
| Obuna boshqaruvi | Kerak emas | Kerak — `unsubscribe` |
| Kuchli tomoni | Holat, hisoblash, shablon | Hodisalar, vaqt, bekor qilish, birlashtirish |

Ular raqib emas. Qoida:

> **Holat — signal. Hodisalar oqimi — RxJS.**

Ularni bog'lash uchun `@angular/core/rxjs-interop`:

| Funksiya | Yo'nalish |
| --- | --- |
| `toSignal(obs$)` | Observable → Signal |
| `toObservable(sig)` | Signal → Observable |
| `rxResource({ params, stream })` | `resource`, lekin Observable bilan |
| `takeUntilDestroyed()` | Komponent yo'q qilinganda obunani to'xtatish |
| `outputFromObservable(obs$)` | Observable → komponent chiqishi |

## Nega shunday

Angular 2–16 da hamma narsa RxJS edi: holat `BehaviorSubject`, HTTP — `Observable`, shablonda `| async`. Bu kuchli, lekin oddiy holat uchun og'ir:

```ts
// Ilgari: hisoblagich uchun RxJS
private readonly count$ = new BehaviorSubject(0);
readonly doubled$ = this.count$.pipe(map((n) => n * 2));

increment() {
  this.count$.next(this.count$.value + 1);
}
```

```html
<p>{{ doubled$ | async }}</p>
```

Signal bilan xuddi shu — uch baravar qisqa (16-bob). Shuning uchun holat signalga ko'chdi.

Lekin RxJS'ning o'rni bor: WebSocket xabarlari, klaviatura hodisalari oqimi, "oxirgi so'rovni bekor qilib yangisini boshla" (`switchMap`), bir nechta manbani vaqt bo'yicha birlashtirish. Bularni signal bilan yozish noqulay.

## Kod: `toSignal` — Observable'dan signal

```ts
import { toSignal } from '@angular/core/rxjs-interop';

export class Clock {
  private readonly tick$ = interval(1000).pipe(map(() => new Date()));

  protected readonly now = toSignal(this.tick$, { initialValue: new Date() });
}
```

```html
<p>{{ now() | date:'HH:mm:ss' }}</p>
```

`toSignal` obuna bo'ladi va komponent yo'q qilinganda **o'zi** obunani bekor qiladi. `unsubscribe` yozish shart emas.

Boshlang'ich qiymat masalasi — tekshirildi:

| Chaqiruv | Boshida `sig()` | Tip |
| --- | --- | --- |
| `toSignal(subject$)` | `undefined` | `T \| undefined` |
| `toSignal(obs$, { initialValue: x })` | `x` | `T` |
| `toSignal(behaviorSubject$, { requireSync: true })` | Darhol qiymat (masalan `7`) | `T` |

`requireSync` — Observable **sinxron** qiymat beradi deb kafolat (`BehaviorSubject`, `startWith`). Bermasa — xato.

Injection konteksti majburiy — tekshirildi:

```ts
ngOnInit() {
  this.data = toSignal(this.data$);
}
```

```
NG0203: toSignal() can only be used within an injection context such as a constructor...
```

Maydon initsializatori yoki konstruktorda yarating (19-bob).

## Kod: `toObservable` — signaldan Observable

Signal o'zgarishini RxJS operatorlari bilan qayta ishlash:

```ts
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

protected readonly query = signal('');

protected readonly suggestions = toSignal(
  toObservable(this.query).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter((q) => q.length >= 2),
    switchMap((q) => this.api.suggest(q)),     // eski so'rovni bekor qiladi
  ),
  { initialValue: [] },
);
```

Muhim xususiyatlari — Angular 22 da test bilan tekshirildi:

1. **Obunada darhol hech narsa chiqmaydi** — hatto signalning joriy qiymati ham. Birinchi qiymat Angular keyingi o'zgarishlarni qayta ishlaganda keladi.
2. **Oraliq qiymatlar tashlanadi** — `set(2); set(3)` dan keyin faqat `3` keladi, `2` emas.

Ya'ni `toObservable` — "har o'zgarish" oqimi emas, "barqarorlashgan qiymat" oqimi. Har bir o'zgarish muhim bo'lsa (masalan hodisalar jurnali) — signal emas, `Subject` ishlating.

## Kod: `rxResource` — Observable asosidagi resurs

`resource` ning `loader` i `Promise` qaytaradi. Observable qaytaradigan API bo'lsa (masalan `HttpClient`):

```ts
import { rxResource } from '@angular/core/rxjs-interop';

private readonly http = inject(HttpClient);

protected readonly user = rxResource({
  params: () => this.userId(),
  stream: ({ params: id }) => this.http.get<User>(`/api/users/${id}`),
});
```

Tekshirildi: `rxResource({ params, stream })` → holat `resolved`, qiymat keldi. Holatlar va qoidalar `resource` bilan bir xil (20-bob) — shu jumladan **xato holatida `value()` xato tashlashi**.

Qaysi biri:

| Holat | Tanlov |
| --- | --- |
| Oddiy GET so'rov | `httpResource` (21-bob) — eng qisqa |
| Mavjud Observable qaytaradigan servis | `rxResource` |
| Observable bir necha qiymat beradi (oqim) | `rxResource` — oxirgisi `value()` da |
| `fetch` yoki boshqa Promise API | `resource` |

## Kod: `takeUntilDestroyed` — qo'lda obuna

Ba'zan `subscribe` kerak — natija signalga emas, yon ta'sirga ketadi:

```ts
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export class Chat {
  private readonly socket = inject(ChatSocket);
  protected readonly messages = signal<Message[]>([]);

  constructor() {
    this.socket.messages$
      .pipe(takeUntilDestroyed())                 // komponent yo'q qilinganda to'xtaydi
      .subscribe((msg) => this.messages.update((list) => [...list, msg]));
  }
}
```

Konstruktordan tashqarida — `DestroyRef` ni uzating:

```ts
private readonly destroyRef = inject(DestroyRef);

protected connect() {
  this.socket.messages$
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(...);
}
```

> **Ilgari:** `private destroy$ = new Subject<void>()`, `takeUntil(this.destroy$)`, `ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }` — uch joyda kod. `takeUntilDestroyed` bitta operator.

## Kod: qaysi biri qachon — amaliy misollar

**Holat — signal:**

```ts
protected readonly selectedTab = signal<'info' | 'orders'>('info');
protected readonly cart = signal<CartItem[]>([]);
protected readonly total = computed(() => ...);
```

**Bir martalik so'rov — `httpResource` yoki `firstValueFrom`:**

```ts
protected readonly profile = httpResource<User>(() => '/api/me');

protected async save() {
  await firstValueFrom(this.http.put('/api/me', this.draft()));
}
```

**Hodisalar oqimi — RxJS:**

```ts
// WebSocket
this.socket.messages$.pipe(takeUntilDestroyed()).subscribe(...)

// Klaviatura: Ctrl+K ketma-ketligi
fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  filter((e) => e.ctrlKey && e.key === 'k'),
  takeUntilDestroyed(),
).subscribe(() => this.openSearch());

// Bir nechta manba vaqt bo'yicha
combineLatest([this.prices$, this.rates$]).pipe(
  throttleTime(1000),
)
```

**Signal → operatorlar → signal:**

```ts
protected readonly results = toSignal(
  toObservable(this.query).pipe(debounceTime(300), switchMap(...)),
  { initialValue: [] },
);
```

| Vazifa | Vosita |
| --- | --- |
| UI holati | `signal` |
| Hosila qiymat | `computed` |
| GET so'rov | `httpResource` |
| Observable API'dan ma'lumot | `rxResource` yoki `toSignal` |
| WebSocket, SSE, hodisalar | RxJS + `takeUntilDestroyed` |
| Debounce, throttle, `switchMap` | RxJS (yoki `debounced`, 22-bob) |
| Mutatsiya (POST/PUT) | `firstValueFrom(http.post(...))` |

## Muhandislik nuqtai nazari: eski RxJS kodini ko'chirish

Hamma `BehaviorSubject` ni birdan signalga aylantirish shart emas. Tartib:

| Ustuvorlik | Nima | Nega |
| --- | --- | --- |
| 1 | Shablondagi `\| async` → `toSignal` | OnPush + zoneless bilan eng oson yutuq |
| 2 | Komponent holati (`BehaviorSubject`) → `signal` | Kod qisqaradi |
| 3 | Servis holati → `signal` + `asReadonly()` | Bir manba |
| 4 | Hodisa oqimlari | **Qoldiring** — RxJS bunga mos |

Chegarada `toSignal` / `toObservable` — ikki dunyo tinch yashaydi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `ngOnInit` da `toSignal` | NG0203 | Maydon yoki konstruktor |
| `initialValue` siz `toSignal` | Tip `T \| undefined`, shablonda tekshiruv kerak | `initialValue` bering |
| `requireSync` ni asinxron Observable bilan | Xato | Faqat `BehaviorSubject`, `startWith` |
| `toObservable` har o'zgarishni beradi deb o'ylash | Oraliq qiymatlar yo'qoladi | Hodisalar uchun `Subject` |
| `toObservable` darhol qiymat beradi deb o'ylash | Birinchi qiymat kechikadi | `startWith(sig())` kerak bo'lsa |
| `subscribe` + `takeUntilDestroyed` siz | Xotira oqishi | `takeUntilDestroyed()` |
| Oddiy holat uchun `BehaviorSubject` | Ortiqcha murakkablik | `signal` |
| WebSocket'ni signal bilan "qo'lda" | Qayta ulanish, buferlash qiyin | RxJS |
| `rxResource` xatoda `value()` o'qish | Xato tashlaydi (20-bob) | `hasValue()` |

## Amaliyot

1. `interval(1000)` ni `toSignal` bilan soatga aylantiring; boshqa sahifaga o'tganda obuna to'xtashini tekshiring.
2. `toSignal(subject$)` va `toSignal(subject$, { initialValue: 0 })` ning tipini muharrirda solishtiring.
3. `toObservable(sig)` ga obuna bo'lib, uchta ketma-ket `set` qiling — nechta qiymat kelishini sanang.
4. Avtoto'ldirishni `toObservable` + `debounceTime` + `switchMap` + `toSignal` bilan yozing; Network'da eski so'rovlar bekor bo'lishini kuzating.
5. Mavjud `HttpClient` servisini `rxResource` bilan komponentga ulang.
6. Eski `destroy$ + takeUntil + ngOnDestroy` kodini `takeUntilDestroyed` ga o'tkazing.

## Rasmiy hujjat

- RxJS interop: <https://angular.dev/ecosystem/rxjs-interop>
- `toSignal`: <https://angular.dev/api/core/rxjs-interop/toSignal>
- `rxResource`: <https://angular.dev/api/core/rxjs-interop/rxResource>
- `takeUntilDestroyed`: <https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed>
- RxJS: <https://rxjs.dev>
