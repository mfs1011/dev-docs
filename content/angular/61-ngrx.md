# 61 — NgRx: Store va SignalStore

[← Oldingi: Holat boshqaruvi: signal xizmatlari](60-signal-xizmatlar.md) · [Mundarija](README.md) · [Keyingi: SSR asoslari →](62-ssr-asoslari.md)

## Tushuncha

NgRx — Angular uchun eng keng tarqalgan holat kutubxonasi. Angular 22 bilan mos versiya — **NgRx 22** (`@angular/core ^22` peer). Uch paket:

| Paket | Nima | Uslub |
| --- | --- | --- |
| `@ngrx/signals` | **SignalStore** — signal asosidagi store | Funksional, kompozitsion |
| `@ngrx/signals/events` | SignalStore uchun hodisalar | Redux'ga o'xshash, lekin yengil |
| `@ngrx/store` + `@ngrx/effects` | Klassik **Store** — Redux naqshi | Action → Reducer → Selector, Effects |

```bash
npm i @ngrx/signals
```

## Nega shunday

60-bobdagi signal xizmati naqshi yaxshi, lekin katta ilovada **takrorlanadi**: har xizmatda `_items`, `loading`, `error`, `asReadonly`, `patch`... SignalStore — shu naqshning **standartlashtirilgan** shakli: bir xil tuzilma, qayta ishlatiladigan "feature"lar, entity yordamchilari, DevTools.

Klassik Store — bundan ham qat'iy: har o'zgarish — nomlangan **action**, hammasi bitta global holat daraxtida, har qadam kuzatiladi. Katta jamoa va murakkab o'zaro bog'liqliklar uchun.

## Kod: SignalStore

```ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { withEntities, addEntity, updateEntity, removeEntity, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';

type Todo = { id: number; title: string; done: boolean };

export const TodoStore = signalStore(
  { providedIn: 'root' },

  withState({ filter: 'all' as 'all' | 'done', loading: false, query: '' }),
  withEntities<Todo>(),

  withComputed(({ entities, filter }) => ({
    visible: computed(() => (filter() === 'done' ? entities().filter((t) => t.done) : entities())),
    doneCount: computed(() => entities().filter((t) => t.done).length),
  })),

  withMethods((store, api = inject(TodoApi)) => ({
    add(title: string) {
      patchState(store, addEntity<Todo>({ id: Date.now(), title, done: false }));
    },
    toggle(id: number) {
      patchState(store, updateEntity({ id, changes: (t) => ({ done: !t.done }) }));
    },
    remove(id: number) {
      patchState(store, removeEntity(id));
    },
    setFilter(filter: 'all' | 'done') {
      patchState(store, { filter });
    },
    search: rxMethod<string>(
      pipe(
        debounceTime(300),
        tap((query) => patchState(store, { query, loading: true })),
        switchMap((query) => api.search(query)),
        tap((todos) => patchState(store, setAllEntities(todos), { loading: false })),
      ),
    ),
  })),

  withHooks({
    onInit(store) { store.search(''); },
  }),
);
```

```ts
@Component({ ... })
export class TodoPage {
  protected readonly store = inject(TodoStore);
}
```

```html
<input (input)="store.search($any($event.target).value)" />
@for (t of store.visible(); track t.id) { ... }
<p>Bajarildi: {{ store.doneCount() }}</p>
```

Tekshirildi (NgRx 22.0.1):

| Qism | Natija |
| --- | --- |
| `withState` + `withEntities` | Holat kalitlari: `filter`, `loading`, `query`, `entityMap`, `ids` |
| `store.entities()`, `store.ids()` | Entity signallari |
| `withComputed` | `doneCount()` — 1, `visible()` — filtrlangan |
| `rxMethod` + `debounceTime` | Ketma-ket `search('x')`, `search('kitob')` → faqat `kitob` bajarildi |
| `withHooks({ onInit })` | Store birinchi `inject` da ishga tushdi |

### Himoyalangan holat

```ts
// komponentda
patchState(this.store, { filter: 'done' });   // ❌ TS2345
```

Tekshirildi: store tashqarisidan `patchState` — **kompilyatsiya xatosi** (`StateSource` yozib bo'lmaydigan). O'zgartirish faqat `withMethods` dagi metodlar orqali — 60-bobdagi "yopiq signal" qoidasining o'zi. **Diqqat:** bu faqat TypeScript darajasida — `as any` bilan runtime'da o'tadi.

### Tip tuzog'i

```ts
patchState(store, addEntity({ id: 1, title, done: false }));   // ❌ TS2345: boolean → false
patchState(store, addEntity<Todo>({ id: 1, title, done: false })); // ✅
```

Tekshirildi: generiksiz `done: false` **literal** tip (`false`) sifatida chiqariladi va `Todo` ga mos kelmaydi. `addEntity<Todo>` yoki tipli o'zgaruvchi.

## Kod: qayta ishlatiladigan feature

Har store'da takrorlanadigan "yuklanish holati":

```ts
import { signalStoreFeature, withState, withComputed } from '@ngrx/signals';

export type RequestStatus = 'idle' | 'pending' | 'fulfilled' | { error: string };

export function withRequestStatus() {
  return signalStoreFeature(
    withState<{ requestStatus: RequestStatus }>({ requestStatus: 'idle' }),
    withComputed(({ requestStatus }) => ({
      isPending: computed(() => requestStatus() === 'pending'),
      error: computed(() => { const s = requestStatus(); return typeof s === 'object' ? s.error : null; }),
    })),
  );
}

export const setPending = () => ({ requestStatus: 'pending' as const });
export const setFulfilled = () => ({ requestStatus: 'fulfilled' as const });
export const setError = (error: string) => ({ requestStatus: { error } });
```

```ts
export const OrdersStore = signalStore(
  withEntities<Order>(),
  withRequestStatus(),
  withMethods((store, api = inject(OrderApi)) => ({
    async load() {
      patchState(store, setPending());
      try {
        patchState(store, setAllEntities(await firstValueFrom(api.list())), setFulfilled());
      } catch (e) {
        patchState(store, setError(userMessage(e)));
      }
    },
  })),
);
```

Bu — SignalStore'ning asosiy kuchi: kompozitsiya. 60-bobdagi qo'lda yozilgan xizmatlarda buni qilish qiyinroq.

## Kod: hodisalar (`@ngrx/signals/events`)

Bir nechta store bitta harakatga javob berishi kerak bo'lsa — metodlarni bir-biridan chaqirish o'rniga hodisalar:

```ts
import { type } from '@ngrx/signals';
import { eventGroup, withReducer, on, withEventHandlers, Events, injectDispatch } from '@ngrx/signals/events';

export const todoPageEvents = eventGroup({
  source: 'Todo Page',
  events: { opened: type<void>(), added: type<string>() },
});

export const todoApiEvents = eventGroup({
  source: 'Todo API',
  events: { loaded: type<string[]>() },
});

export const TodoStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as string[], loading: false }),

  withReducer(
    on(todoPageEvents.opened, () => ({ loading: true })),
    on(todoPageEvents.added, ({ payload }, state) => ({ items: [...state.items, payload] })),
    on(todoApiEvents.loaded, ({ payload }) => ({ items: payload, loading: false })),
  ),

  withEventHandlers((_, events = inject(Events), api = inject(TodoApi)) => ({
    load$: events.on(todoPageEvents.opened).pipe(
      switchMap(() => api.list()),
      map((items) => todoApiEvents.loaded(items)),
    ),
  })),
);
```

```ts
export class TodoPage {
  private readonly dispatch = injectDispatch(todoPageEvents);
  constructor() { this.dispatch.opened(); }
  protected add(title: string) { this.dispatch.added(title); }
}
```

Tekshirildi: `opened()` → `loading: true` → handler yukladi → `loaded` hodisasi **avtomatik dispatch** bo'ldi (handler qaytargan hodisa) → `items: ['a', 'b']`, `loading: false`. Hodisa turi: `'[Todo Page] added'`.

**Eslatma:** NgRx hujjatining ba'zi izohlarida `withEffects` nomi uchraydi — NgRx 22 eksportlarida u yo'q, nomi `withEventHandlers`.

## Kod: klassik Store (qisqacha)

Mavjud loyihalarda ko'p uchraydi:

```ts
import { createActionGroup, createFeature, createReducer, emptyProps, on, props, provideStore, Store } from '@ngrx/store';

export const CounterActions = createActionGroup({
  source: 'Counter',
  events: { Increment: emptyProps(), 'Set To': props<{ value: number }>() },
});

export const counterFeature = createFeature({
  name: 'counter',
  reducer: createReducer(
    { count: 0 },
    on(CounterActions.increment, (s) => ({ count: s.count + 1 })),
    on(CounterActions.setTo, (s, { value }) => ({ count: value })),
  ),
});
```

```ts
// app.config.ts
provideStore({ [counterFeature.name]: counterFeature.reducer })
```

```ts
export class Counter {
  private readonly store = inject(Store);
  protected readonly count = this.store.selectSignal(counterFeature.selectCount);
  protected inc() { this.store.dispatch(CounterActions.increment()); }
}
```

Tekshirildi: `selectSignal` — signal (`0 → 1 → 10`), `'Set To'` hodisasi `setTo` creator'iga aylanadi, turi `'[Counter] Set To'`. `createFeature` selektorlarni avtomatik yaratadi (`selectCount`).

## Muhandislik nuqtai nazari: qaror

```
Holat oddiy va bir nechta xizmatda?
├── Ha ───────────────────────────────► Signal xizmatlari (60-bob)
└── Yo'q
    ├── Takrorlanuvchi naqshlar, entity CRUD ─► SignalStore
    ├── Ko'p store bir harakatga javob beradi ─► SignalStore + Events
    └── Katta jamoa, Redux DevTools, mavjud NgRx ─► Klassik Store (yoki bosqichma-bosqich SignalStore)
```

**Migratsiya yo'li** (klassik Store → SignalStore):

1. Yangi feature'larni SignalStore'da yozing.
2. Komponentlarda `store.select(...)` → `store.selectSignal(...)` — shablonlar `async` pipe'siz.
3. Kichik, mustaqil feature'larni birma-bir ko'chiring.
4. Global holat daraxti qisqargach — `provideStore` faqat qolgan qismlar uchun.

Bir vaqtda ikkala usul — normal holat, lekin **bir feature — bir usul**.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Kichik ilovaga NgRx | Ortiqcha qatlam, sekin rivojlanish | Signal xizmatlari |
| Komponentdan `patchState` | TS2345 | Store metodi |
| `addEntity({ done: false })` | Literal tip xatosi | `addEntity<Todo>(...)` |
| `rxMethod` ichida `mergeMap` qidiruvda | Eski javob yangisini bosib o'tadi | `switchMap` |
| Server keshini store'da qo'lda | Ko'p kod | `httpResource` yoki `@ngrx/signals/resource` |
| Eski maqoladagi `withEffects` | Import xatosi | `withEventHandlers` |
| Klassik Store'da `store.select` + `async` pipe yangi kodda | Signal dunyosi bilan ko'prik | `selectSignal` |
| Bitta feature'da ikkala usul | Chalkashlik | Bir feature — bir usul |

## Amaliyot

1. 60-bobdagi `CartStore` ni SignalStore'ga ko'chiring — kod farqini solishtiring.
2. `TodoStore` ni `withEntities` + `rxMethod` qidiruv bilan yozing.
3. `withRequestStatus()` feature'ini yozib, ikki store'da qayta ishlating.
4. Komponentdan `patchState` qilib TS xatosini ko'ring.
5. Events bilan: `opened` hodisasi ikki store'da turli reaksiya chaqirsin.
6. Kichik klassik Store feature'ini `selectSignal` bilan ishlating.

## Rasmiy hujjat

- NgRx SignalStore: <https://ngrx.io/guide/signals/signal-store>
- Entities: <https://ngrx.io/guide/signals/signal-store/entity-management>
- Events: <https://ngrx.io/guide/signals/signal-store/events>
- Klassik Store: <https://ngrx.io/guide/store>
