# 71 — Testlash: birlik testlari

[← Oldingi: DevTools, Language Service, CLI chuqur](70-devtools-va-cli.md) · [Mundarija](README.md) · [Keyingi: Testlash: komponentlar va DI →](72-komponent-testlari.md)

## Tushuncha

Angular 22 da test muhiti — **Vitest** (Angular 21 dan sukut). Tekshirildi — `ng new` loyihasida:

| Qism | Qiymat |
| --- | --- |
| Builder | `@angular/build:unit-test` |
| Runner | Vitest 5 |
| DOM | jsdom 30 |
| API | `describe`, `it`, `expect`, `vi` — global |

```bash
ng test                  # watch rejimi
ng test --watch=false    # CI uchun bir marta
```

Test turlari va nisbati:

| Tur | Nimani tekshiradi | Tezlik | Soni |
| --- | --- | --- | --- |
| **Birlik** (bu bob) | Sof funksiya, xizmat, store | ms | Ko'p |
| **Komponent** (72-bob) | Shablon + mantiq + DI | 10–100 ms | O'rtacha |
| **E2E** (73-bob) | Butun ilova brauzerda | Soniyalar | Kam, asosiy oqimlar |

## Nega shunday

Birlik testlari — eng arzon va eng tez fikr-mulohaza. Biznes mantiqni (narx hisobi, ruxsatlar, validatorlar) komponentdan ajratib, **sof funksiya** va **xizmat** qilib yozsangiz (39, 60-boblar) — ular DOM'siz, bir necha millisekundda test qilinadi.

Komponent ichiga yashiringan mantiq faqat komponent testi bilan tekshiriladi — sekinroq va mo'rtroq. Test qilish qiyin bo'lsa — bu dizayn signali.

## Kod: sof funksiya

```ts
// price.ts
export function orderTotal(items: { price: number; qty: number }[], discountPercent = 0) {
  const sum = items.reduce((s, i) => s + i.price * i.qty, 0);
  return Math.round(sum * (1 - discountPercent / 100));
}
```

```ts
// price.spec.ts
describe('orderTotal', () => {
  it("bo'sh savat — 0", () => {
    expect(orderTotal([])).toBe(0);
  });

  it('miqdor va narxni ko\'paytiradi', () => {
    expect(orderTotal([{ price: 1000, qty: 3 }, { price: 500, qty: 1 }])).toBe(3500);
  });

  it('chegirmani qo\'llaydi va yaxlitlaydi', () => {
    expect(orderTotal([{ price: 999, qty: 1 }], 10)).toBe(899);
  });
});
```

`TestBed` kerak emas — oddiy TypeScript.

## Kod: signal xizmati

```ts
@Service()
export class CartStore {
  private readonly _items = signal<CartItem[]>([]);
  readonly items = this._items.asReadonly();
  readonly total = computed(() => orderTotal(this._items()));
  add(item: CartItem) { this._items.update((i) => [...i, item]); }
}
```

```ts
describe('CartStore', () => {
  let store: CartStore;

  beforeEach(() => {
    store = TestBed.inject(CartStore);
  });

  it('total qo\'shilganda yangilanadi', () => {
    store.add({ productId: 'a', price: 2, qty: 1 });
    store.add({ productId: 'b', price: 3, qty: 1 });
    expect(store.total()).toBe(5);
  });
});
```

`TestBed.inject` — `inject()` ishlatadigan xizmatlar uchun (injection konteksti). Har test — yangi `TestBed`, yangi nusxa.

### `effect` va `TestBed.tick()`

Tekshirildi:

```ts
constructor() {
  effect(() => this.log.push(this.total()));
}
```

| Qadam | `log` |
| --- | --- |
| `add(2)`, `add(3)` | `[]` — effect hali ishlamagan |
| `TestBed.tick()` | `[5]` |
| `add(5)`, `TestBed.tick()` | `[5, 10]` |

`computed` — **sinxron**, darhol o'qiladi. `effect` — rejalashtiriladi; testda `TestBed.tick()` bilan majburan ishga tushiriladi. Effect ikki marta o'zgarishdan keyin **bir marta** ishladi (`[5]`, `[2, 5]` emas) — birlashtirish.

## Kod: vaqt — fake timers

```ts
it('debounce oxirgi qiymatni chiqaradi', () => {
  vi.useFakeTimers();
  const input = new Subject<string>();
  const out: string[] = [];
  input.pipe(debounceTime(300)).subscribe((v) => out.push(v));

  input.next('a');
  input.next('ab');
  vi.advanceTimersByTime(299);
  expect(out).toEqual([]);

  vi.advanceTimersByTime(1);
  expect(out).toEqual(['ab']);

  vi.useRealTimers();
});
```

Tekshirildi — RxJS `debounceTime` Vitest fake timer'lari bilan ishlaydi. `vi.useRealTimers()` — keyingi testlarga ta'sir qilmasligi uchun (yoki `afterEach` da).

## Kod: HTTP xizmati va `httpResource`

```ts
describe('ProductStore', () => {
  let store: ProductStore;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ProductStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());     // kutilmagan so'rov qolmasin

  it('mahsulotni yuklaydi', async () => {
    TestBed.tick();
    expect(store.product.status()).toBe('loading');

    http.expectOne('/api/p/1').flush({ name: 'Olma' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.product.value()).toEqual({ name: 'Olma' });
  });

  it('404 da xato holati', async () => {
    TestBed.tick();
    http.expectOne('/api/p/1').flush(null, { status: 404, statusText: 'Not Found' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(store.product.status()).toBe('error');
    expect((store.product.error() as HttpErrorResponse).status).toBe(404);
  });
});
```

Tekshirilgan nozik joylar:

- `httpResource` so'rovi `TestBed.tick()` dan keyin ketadi — undan oldin `expectOne` topa olmaydi.
- `flush` dan keyin — `await appRef.whenStable()`.
- Parametr o'zgarganda (`id.set(2)`) — `status` `'loading'`, `value()` **`undefined`** (eski qiymat saqlanmaydi). UI'da "miltillash"ni shu bilan tushuntiring.
- `http.verify()` — test oxirida ochiq so'rov qolmaganini tekshiradi.

`provideHttpClientTesting()` — `provideHttpClient()` dan **keyin** (56-bob).

## Kod: bog'liqlikni almashtirish

```ts
const fakeApi = {
  list: vi.fn(() => of([{ id: '1', name: 'Olma' }])),
};

TestBed.configureTestingModule({
  providers: [{ provide: ProductApi, useValue: fakeApi }],
});

const store = TestBed.inject(ProductListStore);
await store.load();

expect(fakeApi.list).toHaveBeenCalledTimes(1);
expect(store.items()).toHaveLength(1);
```

`vi.fn` — chaqiruvlar soni va argumentlarini yozib boradi. Faqat test qilinayotgan xizmatning **bevosita** bog'liqliklarini almashtiring.

## Muhandislik nuqtai nazari

**Nimani test qilish:**

| Ha | Yo'q |
| --- | --- |
| Biznes qoidalari (narx, ruxsat, validatsiya) | Angular'ning o'zi (`computed` ishlaydimi?) |
| Chegara holatlari (bo'sh, 0, manfiy, `null`) | Private metodlar — ochiq API orqali |
| Xato yo'llari (404, tarmoq) | Uchinchi tomon kutubxonasi |
| Regressiya — tuzatilgan har bug uchun test | Implementatsiya tafsilotlari |

**Test nomi — xulq:** "`total` qo'shilganda yangilanadi", "`calls computeTotal`" emas. Test — hujjat.

**Coverage** (`ng test --coverage`) — yo'nalish uchun, maqsad emas. Paket kerak (tekshirildi — busiz: "Code coverage requires either \"@vitest/coverage-v8\" or \"@vitest/coverage-istanbul\" to be installed."): `npm i -D @vitest/coverage-v8`. 100% coverage + ma'nosiz testlar < 70% + muhim yo'llar.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `effect` natijasini `tick` siz kutish | Test doim yiqiladi | `TestBed.tick()` |
| `httpResource` testida `tick` siz `expectOne` | "Expected one matching request, found none" | Avval `TestBed.tick()` |
| Fake timer'ni tiklamaslik | Keyingi testlar qotadi | `vi.useRealTimers()` / `afterEach` |
| `http.verify()` yo'q | Kutilmagan so'rovlar sezilmaydi | `afterEach` da |
| Mantiq komponentda | Faqat sekin komponent testi | Sof funksiya / xizmatga |
| Hamma bog'liqlikni mock | Test hech narsani tekshirmaydi | Faqat chegaradagilarni |
| `new CartStore()` | `inject()` NG0203 | `TestBed.inject` |

## Amaliyot

1. `orderTotal` uchun chegara holatlari bilan testlar.
2. `CartStore` — `add`, `setQty(0)` (o'chirish), `total` testlari.
3. `effect` bilan persist qiladigan xizmatni `TestBed.tick()` bilan testlang.
4. Qidiruv debounce'ini fake timer bilan.
5. `httpResource` store uchun muvaffaqiyat va 404 testlari.
6. `ng test --coverage` ni ishga tushiring va test qilinmagan biznes mantiqni toping.

## Rasmiy hujjat

- Testlash: <https://angular.dev/guide/testing>
- Xizmatlarni testlash: <https://angular.dev/guide/testing/services>
- HTTP testlash: <https://angular.dev/guide/http/testing>
- Vitest: <https://vitest.dev>
