# 60 — Holat boshqaruvi: signal xizmatlari

[← Oldingi: Himoyalangan marshrutlar va rollar](59-himoyalangan-marshrutlar.md) · [Mundarija](README.md) · [Keyingi: NgRx: Store va SignalStore →](61-ngrx.md)

## Tushuncha

"Holat boshqaruvi" — ilovadagi ma'lumotlar **qayerda yashashi**, **kim o'zgartirishi** va **kim kuzatishi** haqidagi qarorlar. Angular 22 da ko'p ilovalar uchun kutubxona shart emas: `signal` + `computed` + `@Service()` — to'liq holat qatlami.

Holat turlari:

| Tur | Misol | Qayerda |
| --- | --- | --- |
| **Server holati** | Mahsulotlar, buyurtmalar | `httpResource` — kesh, yuklanish, xato |
| **Global klient holati** | Joriy foydalanuvchi, savat, tema | `@Service()` signal xizmati |
| **Bo'lim holati** | Admin filtrlari, checkout qadamlari | Marshrut yoki komponent darajasidagi xizmat |
| **Komponent holati** | Modal ochiq/yopiq, hover | Komponent `signal` |
| **URL holati** | Sahifa, filtr, tanlangan tab | Query parametrlar (41-bob) |

Eng katta xato — hammasini bitta global "store" ga yig'ish.

## Nega shunday

Signallardan oldin Angular'da holat uchun RxJS `BehaviorSubject` + `async` pipe yoki NgRx kerak edi — change detection'ni to'g'ri ishlatish uchun. Signallar bilan:

- O'qish — `store.items()`, shablonda to'g'ridan-to'g'ri.
- Hosila — `computed`, memoizatsiya bilan.
- Zoneless / OnPush — avtomatik to'g'ri yangilanish.

Kutubxonasiz holat xizmati 30–50 qator. NgRx (61-bob) — qachon bu yetmasa.

## Kod: holat xizmati naqshi

39-bobdagi naqshning to'liq ko'rinishi:

```ts
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

@Service()
export class CartStore {
  private readonly storage = inject(KeyValueStorage);

  // 1. Yopiq holat
  private readonly _items = signal<CartItem[]>(this.restore());

  // 2. Ochiq o'qish
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().reduce((n, i) => n + i.qty, 0));
  readonly total = computed(() => this._items().reduce((s, i) => s + i.price * i.qty, 0));
  readonly isEmpty = computed(() => this._items().length === 0);

  constructor() {
    // 3. Yon ta'sir — persist
    effect(() => this.storage.set('cart', JSON.stringify(this._items())));
  }

  // 4. Nomlangan o'zgarishlar
  add(product: Pick<CartItem, 'productId' | 'name' | 'price'>) {
    this._items.update((items) => {
      const existing = items.find((i) => i.productId === product.productId);
      return existing
        ? items.map((i) => (i === existing ? { ...i, qty: i.qty + 1 } : i))
        : [...items, { ...product, qty: 1 }];
    });
  }

  setQty(productId: string, qty: number) {
    this._items.update((items) =>
      qty <= 0 ? items.filter((i) => i.productId !== productId) : items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    );
  }

  clear() {
    this._items.set([]);
  }

  private restore(): CartItem[] {
    try {
      return JSON.parse(this.storage.get('cart') ?? '[]');
    } catch {
      return [];
    }
  }
}
```

To'rt qoida:

| Qoida | Nega |
| --- | --- |
| `WritableSignal` yopiq, `asReadonly()` ochiq | O'zgarish faqat metodlar orqali — qidirish oson |
| Hosila — `computed` | Takrorlanmaydi, har doim sinxron |
| O'zgarmas yangilanish (`[...items]`, `{ ...i }`) | `signal` `===` bilan solishtiradi — mutatsiya sezilmaydi (16-bob) |
| Yon ta'sir — `effect`, bitta joyda | Persist, analitika — mantiqdan ajralgan |

## Kod: server holati — `httpResource` bilan

Server ma'lumotini signal xizmatida qo'lda keshlashdan oldin — `httpResource` yetadimi?

```ts
@Service({ autoProvided: false })
export class ProductListStore {
  readonly page = signal(1);
  readonly query = signal('');

  readonly products = httpResource<Page<Product>>(() => ({
    url: '/api/products',
    params: { page: this.page(), q: this.query() },
  }));

  readonly items = computed(() => this.products.value()?.items ?? []);
  readonly totalPages = computed(() => this.products.value()?.totalPages ?? 0);

  search(q: string) {
    this.query.set(q);
    this.page.set(1);
  }
}
```

Mutatsiyadan keyin yangilash:

```ts
@Service()
export class ProductActions {
  private readonly api = inject(ProductApi);
  private readonly list = inject(ProductListStore);

  async remove(id: string) {
    await firstValueFrom(this.api.remove(id));
    this.list.products.reload();
  }
}
```

**Optimistik yangilash** — server javobini kutmasdan UI'ni o'zgartirish:

```ts
async toggleFavorite(id: string) {
  const prev = this.favorites();
  this._favorites.update((s) => toggle(s, id));      // darhol
  try {
    await firstValueFrom(this.api.toggleFavorite(id));
  } catch {
    this._favorites.set(prev);                       // xato — orqaga
    this.toast.error("Saqlab bo'lmadi");
  }
}
```

## Kod: holat chegarasi

```ts
// Global — butun ilova
@Service() export class CartStore { ... }

// Bo'lim — marshrut providers (37-bob)
{ path: 'admin', providers: [AdminFilters], ... }

// Komponent — har nusxaga
@Component({ providers: [WizardState] })
```

Savol: **"bu holat qachon o'lishi kerak?"**

| Javob | Daraja |
| --- | --- |
| Hech qachon (sessiya davomida) | Root (`@Service()`) |
| Bo'limdan chiqqanda | Marshrut + `withAutoCleanupInjectors()`, yoki komponent |
| Komponent yo'q bo'lganda | Komponent `providers` |

## Kod: `linkedSignal` — tanlov holati

```ts
readonly options = computed(() => this.products.value()?.items ?? []);
readonly selected = linkedSignal<Product[], Product | null>({
  source: this.options,
  computation: (opts, prev) => opts.find((o) => o.id === prev?.value?.id) ?? opts[0] ?? null,
});
```

Ro'yxat yangilanganda tanlov saqlanadi (agar element hali bor bo'lsa), aks holda birinchisiga o'tadi (18-bob).

## Muhandislik nuqtai nazari: qachon signal xizmatlari yetmaydi

| Belgi | Nima qilish |
| --- | --- |
| 5+ xizmat bir-birining holatini o'zgartiradi | Hodisalarga asoslangan arxitektura (NgRx Events) |
| "Bu holat qanday qilib shu qiymatga keldi?" — javob topilmaydi | DevTools, harakatlar tarixi (NgRx Store) |
| Ko'p xizmatda bir xil `loading/error/entities` shabloni | `signalStoreFeature` (NgRx SignalStore) |
| Jamoa 10+ kishi, qat'iy qoidalar kerak | NgRx konvensiyalari |
| Undo/redo, vaqt bo'ylab sayohat | Hodisalar jurnali |

Bu belgilarsiz — signal xizmatlari. Kutubxona qo'shish oson, olib tashlash qiyin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Hamma holat bitta global xizmatda | Hamma narsa hamma narsaga bog'liq | Holat turiga qarab daraja |
| `readonly items = signal([])` ochiq | Istalgan joydan `set` | Yopiq + `asReadonly()` |
| `this._items().push(x)` | Signal o'zgarganini bilmaydi | `update(items => [...items, x])` |
| Server ma'lumotini qo'lda keshlash + qo'lda loading/error | Ko'p kod, xatolar | `httpResource` |
| `effect` ichida boshqa signalni `set` qilish | Sikllar, tushunarsiz oqim | `computed` yoki `linkedSignal` |
| URL holatini signalda | Havola ulashilmaydi | Query parametr |
| Chiqishda global store tozalanmaydi | Keyingi foydalanuvchi ko'radi | `clear()` logout'da (39-bob) |

## Amaliyot

1. `CartStore` ni `KeyValueStorage` bilan persist qilib yozing; sahifani yangilab, savat saqlanishini tekshiring.
2. `ProductListStore` — `httpResource` + qidiruv + sahifalash.
3. Mahsulot o'chirilgach `reload()`.
4. "Sevimlilar" ni optimistik yangilash bilan; tarmoqni o'chirib, orqaga qaytishni sinang.
5. Loyihangizdagi holatlarni jadvalga yozing: tur, daraja, kim o'zgartiradi.

## Rasmiy hujjat

- Signallar: <https://angular.dev/guide/signals>
- `linkedSignal`: <https://angular.dev/guide/signals/linked-signal>
- `httpResource`: <https://angular.dev/guide/http/http-resource>
