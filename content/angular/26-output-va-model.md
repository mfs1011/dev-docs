# 26 — `output()` va `model()`

[← Oldingi: input()](25-input.md) · [Mundarija](README.md) · [Keyingi: Signal so'rovlari →](27-signal-sorovlari.md)

## Tushuncha

`input` — otadan bolaga. Teskari yo'nalish uchun ikkita vosita:

| Vosita | Nima | Misol |
| --- | --- | --- |
| `output()` | Bola **hodisa** chiqaradi, ota tinglaydi | "Tanlandi", "O'chirildi", "Yuborildi" |
| `model()` | **Ikki tomonlama** bog'langan qiymat | Tanlagich, slayder, tab, ochiq/yopiq |

```ts
@Component({ selector: 'app-rating', template: `...` })
export class Rating {
  readonly value = model(0);              // ikki tomonlama
  readonly submitted = output<number>();  // hodisa
}
```

```html
<app-rating [(value)]="stars" (submitted)="save($event)" />
```

## Nega shunday

Bola ma'lumotni **o'zgartirmaydi** — u o'zgarish **so'raydi** (`output`), qarorni ota qabul qiladi. Bu 25-bobdagi bir yo'nalishli oqimning davomi: holat bir joyda, o'zgarish so'rovlari bitta yo'l bilan keladi.

`model` — bu qoidaning ruxsat etilgan istisnosi: ota **ongli ravishda** "shu qiymatni birga boshqaramiz" deydi (`[(value)]`). Tanlagich, slayder, ochiq/yopiq panel — har safar `input` + `output` juftini yozish o'rniga.

## Kod: `output()`

```ts
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-todo-item',
  template: `
    <label>
      <input type="checkbox" [checked]="todo().done" (change)="toggle.emit(todo().id)">
      {{ todo().title }}
    </label>
    <button type="button" (click)="remove.emit(todo().id)">✕</button>
  `,
})
export class TodoItem {
  readonly todo = input.required<Todo>();

  readonly toggle = output<number>();
  readonly remove = output<number>();
}
```

```html
@for (t of todos(); track t.id) {
  <app-todo-item [todo]="t" (toggle)="toggleTodo($event)" (remove)="removeTodo($event)" />
}
```

`$event` — `emit()` ga berilgan qiymat. Tipi `output<number>()` dan: `number`.

Qiymatsiz hodisa:

```ts
readonly closed = output<void>();

protected close() {
  this.closed.emit();
}
```

Nomlash: hodisa **nima bo'lganini** aytsin — o'tgan zamon yoki fe'l: `selected`, `removed`, `toggle`, `submit`. `onSelect` — yomon (`(onSelect)="..."` ikki marta "on").

## Kod: `model()` — ikki tomonlama

```ts
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-rating',
  template: `
    @for (star of [1, 2, 3, 4, 5]; track star) {
      <button type="button" [class.active]="star <= value()" (click)="value.set(star)">★</button>
    }
  `,
})
export class Rating {
  readonly value = model(0);
}
```

Ota tomonida — "banan qutisi" sintaksisi `[( )]`:

```ts
export class Review {
  protected readonly stars = signal(3);
}
```

```html
<app-rating [(value)]="stars" />
<p>Tanlandi: {{ stars() }}</p>
```

Haqiqiy test natijasi: ota `stars` = `3`, bola `value.update(v => v + 1)` qildi → otaning `stars()` = `4`. Bog'lanish ikki tomonlama.

`[(value)]="stars"` aslida ikkita bog'lanishning qisqa yozuvi:

```html
<app-rating [value]="stars()" (valueChange)="stars.set($event)" />
```

`model('value')` avtomatik ravishda `valueChange` chiqishini yaratadi.

| | `input` | `model` |
| --- | --- | --- |
| Bola o'qiydi | ✅ | ✅ |
| Bola yozadi | ❌ | ✅ `set` / `update` |
| Otaga qaytadi | ❌ | ✅ `[( )]` orqali |
| Majburiy variant | `input.required` | `model.required` |

## Kod: qachon `model`, qachon `input` + `output`

```ts
// model — qiymatning o'zi almashadi
readonly open = model(false);             // panel ochiq/yopiq
readonly selectedTab = model('info');     // tab
readonly page = model(1);                 // sahifalash

// input + output — bola faqat so'raydi, ota hal qiladi
readonly items = input.required<Item[]>();
readonly removeRequested = output<number>();   // ota tasdiqlashi mumkin
```

| Holat | Tanlov |
| --- | --- |
| Qiymat o'zgarishi — oddiy va har doim qabul qilinadi | `model` |
| O'zgarish tekshiruv, tasdiqlash yoki server so'rovi talab qiladi | `input` + `output` |
| Bola faqat xabar beradi, qiymati yo'q | `output` |
| Forma boshqaruvi (input, select, checkbox) | Signal Forms (48-bob) yoki `model` |

## Kod: `output` va Observable

Mavjud Observable'ni chiqishga aylantirish:

```ts
import { outputFromObservable } from '@angular/core/rxjs-interop';

export class LiveSearch {
  private readonly input$ = new Subject<string>();

  readonly search = outputFromObservable(
    this.input$.pipe(debounceTime(300), distinctUntilChanged()),
  );
}
```

Teskarisi — komponentning chiqishini dasturiy tinglash:

```ts
const ref = viewContainerRef.createComponent(Rating);

ref.instance.value.subscribe((v) => console.log('yangi reyting', v));
```

`output()` qaytargan `OutputEmitterRef` da `subscribe` bor — lekin bu RxJS emas, operatorlar yo'q. Kerak bo'lsa: `outputToObservable(ref.instance.submitted)`.

## Kod: eski `@Output()` dan ko'chirish

```ts
// Ilgari
@Output() removed = new EventEmitter<number>();

// Ikki tomonlama uchun — ikkita dekorator
@Input() value = 0;
@Output() valueChange = new EventEmitter<number>();
```

```ts
// Bugun
readonly removed = output<number>();

readonly value = model(0);
```

`EventEmitter` — RxJS `Subject` ning vorisi edi, shuning uchun unga `pipe` qilish mumkin edi va ba'zilar buni suiiste'mol qilardi. `output()` — faqat hodisa, boshqa hech narsa.

Avtomatik migratsiya:

```bash
ng generate @angular/core:output-migration
```

## Muhandislik nuqtai nazari: hodisalar zanjiri

Uch-to'rt daraja chuqurlikdagi bola hodisasini yuqoriga uzatish:

```
Page ← (removed) ← List ← (removed) ← Row ← (removed) ← DeleteButton
```

Har darajada `output` va uzatish kodi. Belgilar va yechimlar:

| Belgi | Yechim |
| --- | --- |
| Hodisa 2 darajadan ortiq uzatiladi | Umumiy xizmat — bola to'g'ridan-to'g'ri metod chaqiradi |
| Oraliq komponentlar hodisani faqat uzatadi | Xizmat yoki `model` |
| Ko'p komponent bir holatni o'zgartiradi | Holat xizmatda (60-bob) |

```ts
// Chuqur bola — xizmat orqali
export class DeleteButton {
  private readonly todos = inject(TodoStore);
  readonly id = input.required<number>();

  protected remove() {
    this.todos.remove(this.id());
  }
}
```

Qoida: **bir daraja — `output`, ko'p daraja — xizmat**.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Kiritmani o'zgartirish uchun `output` o'rniga obyektni o'zgartirish | Otaning ma'lumoti jim buziladi | `output` bilan so'rov |
| `onSelect` nomli chiqish | `(onSelect)` — ikki marta "on" | `selected` |
| `[(value)]="3"` (oddiy qiymat) | `NG5002: Unsupported expression in a two-way binding` | Signal yoki maydon |
| Tasdiqlash kerak joyda `model` | Bola to'g'ridan-to'g'ri o'zgartiradi | `input` + `output` |
| `output` ni `pipe` qilishga urinish | RxJS emas | `outputToObservable` |
| 3–4 darajali hodisa zanjiri | Ko'p uzatuvchi kod | Xizmat |
| Yangi kodda `EventEmitter` | Eski uslub | `output()` |

## Amaliyot

1. `TodoItem` ni `toggle` va `remove` chiqishlari bilan yozing; ota ro'yxatni `update` bilan o'zgartirsin.
2. `Rating` ni `model` bilan yozing va `[(value)]="stars"` bilan ulang; ikkala tomondan o'zgartirib ko'ring.
3. `[(value)]` ni `[value]` + `(valueChange)` ga ochib yozing — bir xil ishlashini tasdiqlang.
4. O'chirishni tasdiqlash bilan qiling: bola `removeRequested` chiqaradi, ota `confirm` so'rab, keyin o'chiradi.
5. Uch darajali hodisa zanjirini xizmatga ko'chiring.
6. Eski `@Output() EventEmitter` li komponentga `output-migration` ni qo'llang.

## Rasmiy hujjat

- Chiqishlar: <https://angular.dev/guide/components/outputs>
- Ikki tomonlama bog'lanish (`model`): <https://angular.dev/guide/templates/two-way-binding>
- Migratsiya: <https://angular.dev/reference/migrations/outputs>
