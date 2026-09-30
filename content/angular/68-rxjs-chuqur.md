# 68 — RxJS chuqur

[← Oldingi: Angular Aria](67-angular-aria.md) · [Mundarija](README.md) · [Keyingi: NgModule'dan standalone'ga migratsiya →](69-ngmodule-migratsiya.md)

## Tushuncha

Signallar kelgach RxJS'ning roli **qisqardi**, lekin yo'qolmadi. Qoida:

| Signal | RxJS |
| --- | --- |
| **Holat** — "hozir qiymat nima?" | **Hodisalar oqimi** — "vaqt davomida nima bo'ldi?" |
| `computed`, shablon, forma | Debounce, bekor qilish, qayta urinish, WebSocket, bir nechta manbani birlashtirish |

Angular'da RxJS hali ham markazda: `HttpClient` (Observable), Router hodisalari, `valueChanges`, `rxMethod` (61-bob). Ko'prik — `toSignal` / `toObservable` (24-bob).

Loyihada: RxJS **7.8** (Angular 22 bilan).

## Nega shunday

RxJS kuchi — vaqtni boshqarish: "foydalanuvchi yozishni to'xtatgach 300 ms kut, oldingi so'rovni bekor qil, yangisini yubor, xato bo'lsa 3 marta urin". Signal bilan buni yozish — qo'lda `setTimeout`, `AbortController` va holat bayroqlari. RxJS'da — 5 qator.

Lekin RxJS'ning 100+ operatoridan kundalik ishda **15–20 tasi** yetadi. Bu bob — o'shalar va ularning tuzoqlari.

## Kod: flattening — eng muhim tanlov

Tashqi hodisa → ichki Observable (HTTP). To'rt operator, to'rt xil xulq:

| Operator | Yangi hodisa kelsa, oldingi ichki oqim | Qachon |
| --- | --- | --- |
| `switchMap` | **Bekor qilinadi** | Qidiruv, filtr, marshrut parametri — faqat oxirgisi muhim |
| `mergeMap` | Parallel davom etadi | Mustaqil amallar (har faylni yuklash) |
| `concatMap` | Navbatda kutadi | Tartib muhim (ketma-ket saqlash) |
| `exhaustMap` | Yangisi **e'tiborsiz** qoldiriladi | "Yuborish" tugmasi — ikki marta bosishdan himoya |

```ts
// Qidiruv — switchMap
this.query$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap((q) => this.api.search(q)),
);

// Saqlash tugmasi — exhaustMap
this.saveClicks$.pipe(
  exhaustMap(() => this.api.save(this.form.value())),
);

// Tartibli yozish — concatMap
this.changes$.pipe(
  concatMap((change) => this.api.patch(change)),
);
```

Xato tanlovning oqibati:

| Xato | Oqibat |
| --- | --- |
| Qidiruvda `mergeMap` | Sekin eski javob yangisidan **keyin** keladi — noto'g'ri natija ko'rinadi |
| Saqlashda `switchMap` | Ikkinchi bosish birinchi so'rovni bekor qiladi (server baribir qabul qilgan bo'lishi mumkin) |
| Tartibli amallarda `mergeMap` | Server'da tartib buziladi |

## Kod: birlashtirish

```ts
// Hammasi kamida bir marta chiqargach, har o'zgarishda — oxirgi qiymatlar
combineLatest([this.filters$, this.page$]).pipe(
  switchMap(([filters, page]) => this.api.list(filters, page)),
);

// Parallel so'rovlar, hammasi tugagach — bir marta
forkJoin({ user: this.api.user(id), orders: this.api.orders(id) }).subscribe(({ user, orders }) => ...);

// Istalganidan kelgan hodisa
merge(this.refreshClick$, interval(60_000)).pipe(switchMap(() => this.api.stats()));

// Asosiy hodisa + boshqasining oxirgi qiymati
this.submit$.pipe(withLatestFrom(this.form$), ...);
```

Signal dunyosida `combineLatest` o'rniga ko'pincha `computed` yetadi. `forkJoin` o'rniga — `Promise.all` + `firstValueFrom`, yoki ikki `httpResource`.

**Tuzoq:** `forkJoin` ichidagi biror Observable **tugamasa** (masalan, `interval`, `valueChanges`) — `forkJoin` hech qachon chiqarmaydi. HTTP so'rovlar tugaydi — xavfsiz.

## Kod: xato qayerda ushlanadi

```ts
// ❌ catchError tashqarida — birinchi xatoda butun oqim tugaydi
this.query$.pipe(
  switchMap((q) => this.api.search(q)),
  catchError(() => of([])),          // bir marta xato — keyingi qidiruvlar ishlamaydi
);

// ✅ ichki oqimda — faqat shu so'rov "yutiladi"
this.query$.pipe(
  switchMap((q) => this.api.search(q).pipe(
    catchError(() => of([])),
  )),
);
```

Bu RxJS'dagi eng keng tarqalgan xato: xato tashqi oqimga yetib borsa, u **complete** bo'ladi va boshqa hodisalarni qabul qilmaydi. Foydalanuvchi uchun — "qidiruv bir marta ishladi, keyin qotib qoldi".

## Kod: ulashish — `shareReplay`

```ts
// Har obunachi alohida HTTP so'rov yuboradi
const config$ = this.http.get('/api/config');

// Bitta so'rov, natija ulashiladi
const config$ = this.http.get('/api/config').pipe(
  shareReplay({ bufferSize: 1, refCount: true }),
);
```

| `refCount` | Hamma obunachi ketgach |
| --- | --- |
| `true` | Manba obunasi to'xtatiladi; keyingi obunada **qayta** so'rov |
| `false` | Manba tirik qoladi, natija abadiy keshda |

HTTP kabi tugaydigan manbalar uchun farq kichik; `interval`, WebSocket kabi cheksiz manbalarda `refCount: false` — **xotira oqishi**. 58-bobdagi refresh — ataylab `refCount: false` + `finalize` bilan tozalash.

## Kod: obunani boshqarish

```ts
export class Dashboard {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    // 1. takeUntilDestroyed — injection kontekstida argumentsiz
    interval(10_000).pipe(takeUntilDestroyed()).subscribe(() => this.refresh());
  }

  ngOnInit() {
    // 2. kontekstdan tashqarida — destroyRef bilan
    this.socket.messages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
  }
}
```

Obunasiz yo'llar — eng yaxshisi:

| Usul | Obuna kim tozalaydi |
| --- | --- |
| `toSignal(obs$)` | Angular (komponent bilan) |
| `async` pipe | Angular |
| `rxMethod` (NgRx) | Store |
| `httpResource` | Angular |

Qo'lda `subscribe` — faqat yon ta'sir kerak bo'lganda (navigatsiya, toast), va har doim `takeUntilDestroyed` bilan.

**Tozalash shart emas:** `HttpClient` so'rovlari (tugaydi), `ActivatedRoute` observable'lari (Router tozalaydi). Lekin tozalash zarar qilmaydi va komponent yo'q bo'lganda javobni qayta ishlashni to'xtatadi — odat qilib qo'ying.

## Kod: signal ↔ observable naqshlari

```ts
export class ProductSearch {
  readonly query = signal('');

  // signal → observable → debounce + switchMap → signal
  protected readonly results = toSignal(
    toObservable(this.query).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => (q.length < 2 ? of([]) : this.api.search(q).pipe(catchError(() => of([]))))),
    ),
    { initialValue: [] },
  );
}
```

Muqobil — RxJS'siz:

```ts
readonly query = signal('');
readonly debouncedQuery = debounced(this.query, 300);        // 22-bob — Resource<string>
readonly results = httpResource<Product[]>(() => {
  const q = this.debouncedQuery.value();
  return q.length < 2 ? undefined : { url: '/api/search', params: { q } };
});
```

Ikkinchisi — oddiy qidiruv uchun zamonaviy yo'l: bekor qilish (`httpResource` o'zi), debounce, holatlar (`isLoading`, `error`). RxJS versiyasi — murakkabroq oqimlar uchun (retry strategiyasi, bir nechta manba, WebSocket).

## Kod: `Subject` turlari

| Tur | Yangi obunachi oladi | Qachon |
| --- | --- | --- |
| `Subject` | Hech narsa, faqat keyingilarni | Hodisalar (bosish, xabar) |
| `BehaviorSubject(initial)` | Oxirgi qiymatni | Holat — **endi signal yaxshiroq** |
| `ReplaySubject(n)` | Oxirgi `n` tasini | Kesh, kech obunachilar |

Yangi kodda `BehaviorSubject` bilan holat saqlash o'rniga — `signal`. `Subject` hodisa shinasi uchun hali ham mos.

## Muhandislik nuqtai nazari

**Qachon RxJS, qachon signal — amaliy test:**

- "Bu **qiymat**mi yoki **hodisa**mi?" Qiymat → signal. Hodisa (bosish, xabar, tick) → Observable.
- "Vaqt operatorlari kerakmi?" (debounce, throttle, retry, timeout, buffer) → RxJS.
- "Faqat HTTP GET va natijani ko'rsatish?" → `httpResource`.

RxJS kodini **chegaralarda** saqlang (xizmatlar, store'lar), komponentga signal sifatida chiqaring. Komponentda 10 qatorli `pipe` — o'qish qiyin, test qilish qiyin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Qidiruvda `mergeMap` | Eski javob yangisini bosib o'tadi | `switchMap` |
| Yuborishda `switchMap` | Ikki bosishda chalkashlik | `exhaustMap` |
| `catchError` tashqi oqimda | Birinchi xatodan keyin oqim o'ladi | Ichki oqimda |
| Ichma-ich `subscribe` | Bekor qilish yo'q, xotira oqishi | Flattening operator |
| Cheksiz manbada `shareReplay` + `refCount: false` | Xotira oqishi | `refCount: true` |
| `forkJoin` tugamaydigan oqim bilan | Hech qachon chiqarmaydi | `combineLatest` yoki `take(1)` |
| `takeUntilDestroyed()` kontekstdan tashqarida | NG0203 | `takeUntilDestroyed(this.destroyRef)` |
| Holat uchun `BehaviorSubject` | Signal bilan ko'prik kodi | `signal` |

## Amaliyot

1. Qidiruvni `mergeMap` bilan yozing, sekin API (DevTools throttling) bilan noto'g'ri natijani takrorlang; `switchMap` bilan tuzating.
2. "Saqlash" tugmasini `exhaustMap` bilan himoyalang — tez-tez bosing, Network'da bitta so'rovni ko'ring.
3. `catchError` ni tashqariga qo'yib, xatodan keyin qidiruv to'xtashini ko'ring; ichkariga ko'chiring.
4. `config$` ni `shareReplay` bilan ulashing; uch komponent — bitta so'rov.
5. Xuddi shu qidiruvni `debounced` + `httpResource` bilan RxJS'siz yozing va solishtiring.
6. Loyihangizdagi `BehaviorSubject` holatlarini topib, signalga o'tkazish rejasini tuzing.

## Rasmiy hujjat

- RxJS interop: <https://angular.dev/ecosystem/rxjs-interop>
- RxJS operatorlari: <https://rxjs.dev/guide/operators>
- `takeUntilDestroyed`: <https://angular.dev/api/core/rxjs-interop/takeUntilDestroyed>
