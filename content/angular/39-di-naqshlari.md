# 39 — DI naqshlari

[← Oldingi: `InjectionToken` va konfiguratsiya](38-injection-token.md) · [Mundarija](README.md) · [Keyingi: Marshrutlash asoslari →](40-marshrutlash-asoslari.md)

## Tushuncha

34–38-boblar — DI **mexanizmi**. Bu bob — undan qanday qilib **yaxshi tuzilgan** kod qilish. Beshta naqsh:

| Naqsh | Muammo | Yechim |
| --- | --- | --- |
| API xizmati | HTTP komponentlarga tarqalgan | Bitta resurs — bitta xizmat |
| Holat xizmati (store) | Ulashiladigan holat | Yopiq signal + ochiq `computed` + metodlar |
| Fasad | Komponent 5 ta xizmatni biladi | Bitta xizmat — bitta ekran uchun |
| Adapter | Tashqi kutubxona / brauzer API | Abstrakt token + amalga oshirish |
| Testda almashtirish | Haqiqiy HTTP, vaqt, `localStorage` | `useValue` / `useClass` |

## Nega shunday

DI ning o'zi hech narsani tartibga keltirmaydi — `inject` bilan ham spagetti yozish mumkin: komponent 8 ta xizmat inject qiladi, xizmatlar bir-birini aylanma chaqiradi, holat hamma joydan `set` qilinadi. Naqshlar — chegaralar: **kim nimani biladi, kim nimani o'zgartiradi**.

## Kod: API xizmati

Faqat HTTP — holat yo'q, mantiq yo'q:

```ts
@Service()
export class ProductApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${inject(APP_CONFIG).apiUrl}/products`;

  list(params: ProductQuery) {
    return this.http.get<Page<Product>>(this.base, { params: { ...params } });
  }

  get(id: string) {
    return this.http.get<Product>(`${this.base}/${id}`);
  }

  update(id: string, patch: Partial<Product>) {
    return this.http.patch<Product>(`${this.base}/${id}`, patch);
  }
}
```

Nega alohida? URL, sarlavhalar, DTO ↔ model o'girish **bir joyda**. Backend o'zgarsa — bitta fayl.

## Kod: holat xizmati

```ts
@Service()
export class CartStore {
  // Yopiq, yoziladigan
  private readonly _items = signal<CartItem[]>([]);

  // Ochiq, faqat o'qish
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.qty, 0));
  readonly total = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));

  // O'zgartirish — faqat metodlar orqali
  add(product: Product) {
    this._items.update((items) => {
      const found = items.find((i) => i.id === product.id);
      return found
        ? items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { id: product.id, price: product.price, qty: 1 }];
    });
  }

  remove(id: string) {
    this._items.update((items) => items.filter((i) => i.id !== id));
  }

  reset() {
    this._items.set([]);
  }
}
```

Uch qoida:

1. `WritableSignal` tashqariga **chiqmaydi** — `asReadonly()` yoki `computed`.
2. O'zgarish — **nomlangan metodlar** (`add`, `remove`), `cart.items.set(...)` emas. Qayerda o'zgarganini qidirish oson.
3. `reset()` — global holat tozalanadigan bo'lsin (logout).

Katta ilovada bu naqsh NgRx SignalStore'ga o'sadi (61-bob) — g'oya bir xil.

## Kod: logout'da tozalash

```ts
@Service()
export class Session {
  private readonly cart = inject(CartStore);
  private readonly profile = inject(ProfileStore);
  private readonly router = inject(Router);

  logout() {
    this.cart.reset();
    this.profile.reset();
    this.router.navigate(['/login']);
  }
}
```

Muqobil — tozalanishi kerak bo'lgan holatni **foydalanuvchi marshruti** ostidagi komponent darajasida provide qilish (37-bob) — komponent o'lganda holat ham o'ladi.

## Kod: fasad

Ekran bir nechta xizmatni birlashtiradi. Komponent esa faqat fasadni biladi:

```ts
@Service({ autoProvided: false })
export class CheckoutFacade {
  private readonly cart = inject(CartStore);
  private readonly orders = inject(OrderApi);
  private readonly payments = inject(PaymentGateway);
  private readonly router = inject(Router);

  readonly items = this.cart.items;
  readonly total = this.cart.total;
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  async submit(address: Address) {
    this.submitting.set(true);
    this.error.set(null);
    try {
      const order = await firstValueFrom(this.orders.create({ items: this.items(), address }));
      await this.payments.pay(order.id, this.total());
      this.cart.reset();
      await this.router.navigate(['/orders', order.id]);
    } catch (e) {
      this.error.set(toMessage(e));
    } finally {
      this.submitting.set(false);
    }
  }
}
```

```ts
@Component({
  selector: 'app-checkout-page',
  providers: [CheckoutFacade],
  ...
})
export class CheckoutPage {
  protected readonly facade = inject(CheckoutFacade);
}
```

Komponent — faqat ko'rinish: `facade.items()`, `facade.submit(...)`. Test — fasadni `useValue` bilan almashtirish, 4 ta xizmatni emas.

Fasad qachon **kerak emas**: komponent bitta xizmatdan foydalansa — ortiqcha qatlam.

## Kod: adapter

Tashqi narsaga to'g'ridan-to'g'ri bog'lanmaslik:

```ts
export abstract class KeyValueStorage {
  abstract get(key: string): string | null;
  abstract set(key: string, value: string): void;
}

class BrowserStorage extends KeyValueStorage {
  get(key: string) { return localStorage.getItem(key); }
  set(key: string, value: string) { localStorage.setItem(key, value); }
}

class MemoryStorage extends KeyValueStorage {
  private readonly map = new Map<string, string>();
  get(key: string) { return this.map.get(key) ?? null; }
  set(key: string, value: string) { this.map.set(key, value); }
}
```

```ts
// app.config.ts
{
  provide: KeyValueStorage,
  useFactory: () => isPlatformBrowser(inject(PLATFORM_ID)) ? new BrowserStorage() : new MemoryStorage(),
}
```

Afzallik: SSR'da ishlaydi, testda `MemoryStorage`, keyinchalik `IndexedDB` ga o'tish — faqat yangi klass.

## Kod: testda almashtirish

```ts
describe('CheckoutPage', () => {
  it('xatoni ko\'rsatadi', async () => {
    const facade = {
      items: signal([]),
      total: signal(0),
      submitting: signal(false),
      error: signal('To\'lov rad etildi'),
      submit: vi.fn(),
    } satisfies Partial<CheckoutFacade>;

    TestBed.overrideComponent(CheckoutPage, {
      set: { providers: [{ provide: CheckoutFacade, useValue: facade }] },
    });

    const fixture = TestBed.createComponent(CheckoutPage);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('To\'lov rad etildi');
  });
});
```

**Diqqat:** fasad komponentning **o'z** `providers` ida — `TestBed` providers'dagi almashtirish yetmaydi, komponent o'zinikini yaratadi. `overrideComponent` bilan komponent provayderini almashtiring. Tekshirildi: faqat `configureTestingModule({ providers: [...] })` bilan komponent **haqiqiy** fasadni ishlatdi; `overrideComponent` bilan — soxtasini.

Testlash — 71–73-boblarda batafsil.

## Muhandislik nuqtai nazari: bog'liqlik yo'nalishi

```
Komponent  →  Fasad / Store  →  API xizmati  →  HttpClient
   │                │
   └── ko'rinish    └── biznes mantiq, holat
```

- Strelka faqat **o'ngga**. API xizmati store'ni bilmaydi, store komponentni bilmaydi.
- Ikki xizmat bir-birini inject qilsa — NG0200 (aylanma) yoki dizayn muammosi. Umumiy qismni uchinchi xizmatga chiqaring.
- Bitta xizmat 7+ ta xizmat inject qilsa — u juda ko'p ish qilyapti.

Bu yo'nalish — Feature-Sliced Design va toza arxitekturaning asosi; Arxitektura qo'llanmasida batafsil.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `readonly items = signal([])` ochiq | Har kim `set` qiladi, qayerdan o'zgargani noma'lum | Yopiq `_items` + `asReadonly()` |
| Komponentda HTTP + holat + navigatsiya | 300 qatorli komponent | API xizmati + store/fasad |
| Har komponentga fasad | Keraksiz qatlam | Faqat ko'p xizmatli ekranlarda |
| Ikki xizmat bir-birini inject qiladi | NG0200 | Umumiy qismni ajratish |
| Komponent `providers` dagi xizmatni `TestBed` providers bilan almashtirish | Haqiqiy xizmat ishlaydi | `overrideComponent` |
| Global store tozalanmaydi | Boshqa foydalanuvchi eski ma'lumotni ko'radi | `reset()` logout'da |
| `localStorage` ga to'g'ridan-to'g'ri | SSR va testda buziladi | Adapter |

## Amaliyot

1. `ProductApi` + `CartStore` yozing; `CartStore` da `WritableSignal` tashqariga chiqmasin.
2. Komponentdan `cart.items.set([])` qilib ko'ring — `TS2339: Property 'set' does not exist on type 'Signal<CartItem[]>'`.
3. `Session.logout()` barcha store'larni tozalasin.
4. `CheckoutFacade` ni komponent darajasida yozing va testda `overrideComponent` bilan almashtiring.
5. `KeyValueStorage` adapterini yozing, SSR va testda `MemoryStorage` ishlatilsin.
6. Loyihangizdagi eng katta komponentni oling va bog'liqlik yo'nalishi bo'yicha qatlamlarga ajrating.

## Rasmiy hujjat

- Xizmatlar: <https://angular.dev/guide/di/creating-and-using-services>
- Signallar bilan holat: <https://angular.dev/guide/signals>
- Test'da provayderlar: <https://angular.dev/guide/testing/services>
