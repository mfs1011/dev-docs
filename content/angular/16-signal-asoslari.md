# 16 — Signal nima: `signal()` va `computed()`

[← Oldingi: ng-template, ng-container, @let](15-ng-template-va-let.md) · [Mundarija](README.md) · [Keyingi: effect() va afterRenderEffect() →](17-effect.md)

## Tushuncha

Signal — **o'zgarganini o'zi xabar qiladigan** qiymat.

```ts
import { computed, signal } from '@angular/core';

const count = signal(0);                         // yozib bo'ladigan signal
const doubled = computed(() => count() * 2);     // hisoblanadigan signal

count();        // 0     — o'qish: funksiya chaqiruvi
doubled();      // 0

count.set(5);   // yozish
doubled();      // 10    — o'zi yangilandi
```

Oddiy o'zgaruvchidan farqi: signalni o'qigan har narsa (shablon, `computed`, `effect`) **ro'yxatga olinadi**. Signal o'zgarganda faqat o'shalar yangilanadi.

```
count ──────► doubled ──────► shablon: {{ doubled() }}
   │
   └────────► shablon: {{ count() }}

count.set(5) → ikkala shablon joyi va doubled yangilanadi
             → boshqa hech narsa tekshirilmaydi
```

Bu **reaktivlik grafigi**. Angular uni avtomatik quradi: `computed` ichida `count()` o'qildi — demak `doubled` `count` ga bog'liq.

## Nega shunday

Eski Angular'da (zone.js) freymvork **qaysi qiymat o'zgarganini bilmasdi**. Har hodisadan keyin — bosish, taymer, HTTP javobi — butun komponentlar daraxtini tekshirib chiqardi: "bu ifoda o'zgardimi? bunisi-chi?". Katta ilovada bu sezilarli ish edi.

Signal bilan Angular **aniq biladi**. `count` o'zgardi → faqat `count` ni o'qigan joylar. Qolgan 500 komponentga tegilmaydi.

Bu bitta o'zgarish Angular'ning butun yo'nalishini o'zgartirdi:

| Signal bilan mumkin bo'ldi | Bob |
| --- | --- |
| OnPush sukut bo'yicha | 5 |
| zone.js siz ishlash (zoneless) | 23 |
| Signal kiritmalar, so'rovlar | 25–27 |
| Asinxron holat (`resource`) | 20–21 |
| Signal Forms | 48–51 |

## Kod: yozib bo'ladigan signal

```ts
const name = signal('Ali');
const tags = signal<string[]>([]);
const user = signal<User | null>(null);
```

Boshlang'ich qiymat bo'sh massiv yoki `null` bo'lsa, tipni aniq yozing (4-bob).

**O'qish** — funksiya chaqiruvi:

```ts
name();          // 'Ali'
```

**Yozish** — ikki usul:

```ts
name.set('Vali');                                  // yangi qiymat

tags.update((list) => [...list, 'yangi']);         // oldingi qiymatdan hisoblab
count.update((n) => n + 1);
```

`update` — oldingi qiymatga tayanib yozishda. Ichida **yangi** massiv yoki obyekt qaytaring (pastda — nega).

## Kod: `computed` — hisoblanadigan signal

```ts
const items = signal<CartItem[]>([]);

const total = computed(() =>
  items().reduce((sum, item) => sum + item.price * item.quantity, 0),
);

const isEmpty = computed(() => items().length === 0);
const hasDiscount = computed(() => total() > 500_000);   // computed'dan computed
```

`computed` — **faqat o'qiladi**, `set` yo'q. Qiymati bog'liqliklardan kelib chiqadi.

Uchta xususiyat — Angular 22 da test bilan tekshirildi:

**1. Dangasa (lazy).** Hech kim o'qimasa — umuman hisoblanmaydi:

```ts
let runs = 0;
const b = signal(1);
const c = computed(() => { runs++; return b(); });

b.set(2);
b.set(3);
// runs === 0 — hali hech kim c() ni o'qimadi

c();   // runs === 1
```

**2. Keshlanadi (memoized).** Bog'liqlik o'zgarmaguncha qayta hisoblanmaydi:

```ts
c();   // runs === 1
c();   // runs === 1 — o'sha qiymat qaytdi
```

Shuning uchun shablonda `{{ total() }}` ni 10 joyda yozsangiz ham, hisob bir marta.

**3. Dinamik bog'liqlik.** Faqat **haqiqatan o'qilgan** signallar hisobga olinadi:

```ts
const showFull = signal(false);
const firstName = signal('Ali');
const fullName = signal('Ali Valiyev');

const display = computed(() => (showFull() ? fullName() : firstName()));
```

`showFull` `false` bo'lganda `fullName` o'qilmaydi — demak u o'zgarsa, `display` qayta hisoblanmaydi (tekshirildi). `showFull` `true` bo'lganda bog'liqliklar o'zi almashadi.

## Kod: tenglik — qachon "o'zgardi" hisoblanadi

Signal yangi qiymatni eskisi bilan solishtiradi (`Object.is`). Teng bo'lsa — hech kimga xabar bermaydi:

```ts
const n = signal(1);
n.set(1);          // xabar yo'q — bog'liqlar qayta ishlamaydi
```

Obyekt va massivda solishtirish **havola** bo'yicha. Bu yerda eng xavfli tuzoq:

```ts
const settings = signal({ theme: 'light' });
const theme = computed(() => settings().theme);

theme();                      // 'light'

// ❌ obyektni o'zgartirib, o'sha havolani berish
const s = settings();
s.theme = 'dark';
settings.set(s);

theme();                      // 'light' (!) — ESKI qiymat
```

Test bilan tasdiqlandi: havola o'zgarmagani uchun signal "o'zgarmadi" deb hisoblaydi va `computed` keshlangan eski qiymatni qaytaradi. Obyektning ichida `'dark'`, ekranda `'light'`.

To'g'risi — doim yangi obyekt:

```ts
// ✅
settings.update((s) => ({ ...s, theme: 'dark' }));
```

11-bobda massiv bilan xuddi shu xato ko'rsatilgan — ro'yxat va hisoblagich bir-biriga zid bo'lib qoladi. Qoida bitta: **signal ichidagi obyekt va massivni o'zgartirmang, almashtiring**.

### O'z tenglik funksiyangiz

Ba'zan havola emas, mazmun muhim:

```ts
const position = signal(
  { x: 0, y: 0 },
  { equal: (a, b) => a.x === b.x && a.y === b.y },
);

position.set({ x: 0, y: 0 });   // yangi obyekt, lekin teng — xabar yo'q
```

Bu tez-tez yangi obyekt keladigan, lekin ko'pincha o'zgarmaydigan joyda foydali (masalan sichqoncha koordinatalari, server javobi).

## Kod: komponentda signallar

```ts
@Component({
  selector: 'app-cart',
  template: `
    <h2>Savat ({{ count() }})</h2>

    @for (item of items(); track item.id) {
      <div>
        {{ item.title }} × {{ item.quantity }}
        <button type="button" (click)="increase(item.id)">+</button>
      </div>
    } @empty {
      <p>Savat bo'sh</p>
    }

    <p>Jami: {{ total() | currency:'UZS':'symbol-narrow':'1.0-0' }}</p>
  `,
  imports: [CurrencyPipe],
})
export class Cart {
  protected readonly items = signal<CartItem[]>([]);

  protected readonly count = computed(() =>
    this.items().reduce((sum, i) => sum + i.quantity, 0),
  );

  protected readonly total = computed(() =>
    this.items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  protected increase(id: number) {
    this.items.update((list) =>
      list.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i)),
    );
  }
}
```

`items` — manba. `count` va `total` — undan kelib chiqadi. Ular hech qachon sinxronlashtirilmaydi, chunki **alohida saqlanmaydi**. Bu signallarning asosiy g'oyasi: holatni bir joyda saqlash, qolganini hisoblash.

## Kod: xizmatda signallar — ichkarida yoziladi, tashqarida o'qiladi

```ts
import { Service, computed, signal } from '@angular/core';

@Service()
export class CartStore {
  private readonly _items = signal<CartItem[]>([]);

  // Tashqariga faqat o'qish uchun
  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, i) => sum + i.price * i.quantity, 0),
  );

  add(product: Product) {
    this._items.update((list) => {
      const existing = list.find((i) => i.id === product.id);

      return existing
        ? list.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
        : [...list, { ...product, quantity: 1 }];
    });
  }

  clear() {
    this._items.set([]);
  }
}
```

`asReadonly()` — `set` va `update` siz signal. Komponentlar `store.items()` ni o'qiydi, lekin `store.items.set(...)` qila olmaydi — o'zgartirish faqat `add`, `clear` orqali. Holat qayerda va qanday o'zgarishini topish oson bo'ladi.

Signal asosidagi holat boshqaruvi — 60-bobda.

## Muhandislik nuqtai nazari: nima signal bo'lishi kerak

| Qiymat | Signal? | Nega |
| --- | --- | --- |
| Ekranda ko'rinadigan va o'zgaradigan | ✅ Ha | OnPush + zoneless'da yangilanish kafolati |
| Boshqa qiymatdan hisoblanadigan | ✅ `computed` | Sinxronlash muammosi yo'q |
| O'zgarmas konstanta | ❌ Oddiy `readonly` | Signal keraksiz |
| Faqat klass ichida, ekranga ta'sir qilmaydi (taymer ID, kesh) | ❌ Oddiy maydon | Reaktivlik keraksiz |
| Servisdan olinadigan umumiy holat | ✅ Ha, `asReadonly()` bilan | Bir manba |

Amaliy qoida: **ekranda ko'rinadimi va o'zgaradimi? — signal**.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Shablonda `count` (qavssiz) | Funksiya matni, NG8109 ogohlantirishi | `count()` |
| Obyektni o'zgartirib o'sha havolani `set` | `computed` eski qiymat qaytaradi | `update(s => ({ ...s, ... }))` |
| `items().push(...)` | Ekran o'ziga zid (11-bob) | `update(l => [...l, x])` |
| Hisoblanadigan qiymatni alohida signalda saqlash va qo'lda sinxronlash | Sinxron bo'lmay qoladi | `computed` |
| `signal(null)` tipsiz | Tip `null` | `signal<User \| null>(null)` |
| Xizmatda yoziladigan signalni ochiq qoldirish | Istalgan joy o'zgartiradi | `private` + `asReadonly()` |
| `computed` ichida signal yozish | `NG0600: Writing to signals is not allowed in a computed` | `computed` — faqat hisob |

## Amaliyot

1. `count` va `doubled` ni yozing; `doubled` ichiga `console.log` qo'yib, u qachon ishlashini kuzating — o'qilmasa ishlamasligini tasdiqlang.
2. Savat komponentini yozing: `items`, `count`, `total` — `count` va `total` faqat `computed`.
3. `settings` signalida obyektni o'zgartirib o'sha havolani `set` qiling va `computed` eski qiymat qaytarishini ko'ring. Keyin `update` bilan tuzating.
4. `showFull` bilan dinamik bog'liqlik misolini yozing va `console.log` bilan qaysi signal o'zgarganda `computed` ishlashini tekshiring.
5. `CartStore` xizmatini yozing; komponentda `store.items.set(...)` qilib ko'ring — kompilyator xatosini o'qing.
6. `equal` opsiyasi bilan koordinata signali yozing.

## Rasmiy hujjat

- Signallar: <https://angular.dev/guide/signals>
- `signal()`: <https://angular.dev/api/core/signal>
- `computed()`: <https://angular.dev/api/core/computed>
