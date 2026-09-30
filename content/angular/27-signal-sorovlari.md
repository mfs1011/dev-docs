# 27 — Signal so'rovlari: `viewChild`, `viewChildren`, `contentChild`

[← Oldingi: output() va model()](26-output-va-model.md) · [Mundarija](README.md) · [Keyingi: Kontent proyeksiyasi →](28-kontent-proyeksiyasi.md)

## Tushuncha

So'rov (query) — klass kodidan **shablondagi** elementga yoki komponentga murojaat:

```ts
import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-search',
  template: `<input #box type="search">`,
})
export class Search {
  private readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');

  focus() {
    this.box().nativeElement.focus();
  }
}
```

`viewChild` — signal. Element paydo bo'lsa yoki yo'qolsa — signal o'zgaradi.

| Funksiya | Nimani topadi | Qaytaradi |
| --- | --- | --- |
| `viewChild(x)` | O'z shablonidagi bitta element | `Signal<T \| undefined>` |
| `viewChild.required(x)` | Xuddi shu, lekin albatta bor | `Signal<T>` |
| `viewChildren(x)` | O'z shablonidagi hammasi | `Signal<readonly T[]>` |
| `contentChild(x)` | Ota **proyeksiya qilgan** kontentdagi bitta (28-bob) | `Signal<T \| undefined>` |
| `contentChildren(x)` | Proyeksiya qilingan hammasi | `Signal<readonly T[]>` |

## Nega shunday

Ko'p ishni shablonning o'zi qiladi — `#ref` va binding'lar (15-bob). Klassdan elementga murojaat faqat **imperativ** API kerak bo'lganda:

| Vazifa | Misol |
| --- | --- |
| Fokus, scroll, tanlash | `input.focus()`, `el.scrollIntoView()` |
| O'lchash | `getBoundingClientRect()` |
| Bola komponent metodini chaqirish | `player.play()` |
| Uchinchi tomon kutubxonasini ulash | Grafik, xarita, muharrir |

Eski `@ViewChild` dekoratori oddiy maydon edi — element qachon paydo bo'lishini bilish uchun `ngAfterViewInit` va `static: true/false` qoidalari kerak edi. Signal so'rovi bu muammoni yo'qotadi: element o'zgarsa, signal xabar beradi, `computed` va `effect` o'zi qayta ishlaydi.

## Kod: nima bo'yicha qidirish

**Shablon havolasi bo'yicha:**

```ts
readonly box = viewChild<ElementRef<HTMLInputElement>>('box');
```

```html
<input #box>
```

**Komponent yoki direktiva turi bo'yicha:**

```ts
readonly player = viewChild.required(VideoPlayer);
```

```html
<app-video-player [src]="url()" />
```

Tip avtomatik: `Signal<VideoPlayer>`. Endi `this.player().play()`.

**`read` — boshqa narsani olish.** Bitta elementda ham komponent, ham DOM element bor:

```ts
// Komponentning o'zi
readonly player = viewChild.required(VideoPlayer);

// O'sha komponentning DOM elementi
readonly playerEl = viewChild.required(VideoPlayer, { read: ElementRef });

// Havola orqali, lekin direktiva sifatida
readonly tooltip = viewChild.required('anchor', { read: Tooltip });
```

## Kod: shartli elementlar

`@if` ichidagi element — hamma vaqt bor emas. Angular 22 da test bilan tekshirildi:

```ts
@Component({
  template: `
    @if (show()) {
      <input #box>
    }
  `,
})
export class Lab {
  readonly show = signal(false);
  readonly box = viewChild<ElementRef<HTMLInputElement>>('box');
}
```

| `show()` | `box()` |
| --- | --- |
| `false` | `undefined` |
| `true` | `ElementRef` — `INPUT` |

Shuning uchun shartli element uchun **`required` emas**, oddiy `viewChild` — va `undefined` ni tekshirish:

```ts
constructor() {
  // Input paydo bo'lishi bilan fokus
  effect(() => {
    this.box()?.nativeElement.focus();
  });
}
```

`effect` `box` ga bog'liq: `@if` ochilganda `box()` o'zgaradi → effect ishlaydi → fokus. Eski usulda buning uchun `setTimeout` va `ngAfterViewChecked` kerak edi.

DOM bilan ishlash uchun `afterRenderEffect` aniqroq (17-bob) — u element chizilgandan keyin ishlashi kafolatlangan:

```ts
afterRenderEffect(() => {
  this.box()?.nativeElement.focus();
});
```

## Kod: `viewChildren` — ro'yxat

```ts
@Component({
  template: `
    @for (item of items(); track item.id) {
      <li #row [attr.data-id]="item.id">{{ item.title }}</li>
    }
  `,
})
export class List {
  readonly items = input.required<Item[]>();
  private readonly rows = viewChildren<ElementRef<HTMLLIElement>>('row');

  protected readonly rowCount = computed(() => this.rows().length);

  scrollTo(id: number) {
    this.rows()
      .find((r) => r.nativeElement.dataset['id'] === String(id))
      ?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
```

Tekshirildi: ro'yxatga element qo'shilganda `rows()` yangilandi va `rowCount` 2 dan 3 ga o'zgardi — qo'lda hech narsa qilinmadi.

## Kod: qachon o'qish mumkin

Konstruktorda `required` so'rovni o'qish — **kompilyator xatosi** (Angular 22):

```ts
constructor() {
  this.box().nativeElement.focus();    // ✘
}
```

```
✘ [ERROR] NG8118: `box` is a required `viewChild` and does not have a value in this context.
```

| Joy | So'rov tayyormi |
| --- | --- |
| Konstruktor | ❌ NG8118 |
| `computed`, `effect` ichida | ✅ — o'zgarsa qayta ishlaydi |
| `afterNextRender`, `afterRenderEffect` | ✅ — DOM chizilgan |
| `ngOnInit` | Statik element uchun ✅ (tekshirildi), `@if` ichidagisi hali yo'q bo'lishi mumkin |
| Hodisa ishlovchisi | ✅ |

Ishonchli qoida: **so'rovni `computed`, `effect` yoki `afterRenderEffect` ichida o'qing** — shunda "qachon tayyor?" degan savol yo'qoladi.

## Kod: `contentChild` — proyeksiya qilingan kontent

`viewChild` — **o'z** shablonidan. `contentChild` — ota `<ng-content>` orqali **ichiga qo'ygan** narsadan:

```ts
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class Card {
  private readonly title = contentChild<ElementRef>('title');

  protected readonly hasTitle = computed(() => !!this.title());
}
```

```html
<app-card>
  <h3 #title>Sarlavha</h3>
  <p>Matn</p>
</app-card>
```

`Card` o'z shablonida `<h3>` yo'q, lekin ota uni ichiga qo'ydi. `contentChild` shuni topadi. Kontent proyeksiyasi — 28-bobda.

Ichma-ich qidirish — `contentChildren` sukut bo'yicha faqat **to'g'ridan-to'g'ri** bolalarni topadi:

```ts
readonly tabs = contentChildren(Tab, { descendants: true });   // ichma-ich ham
```

## Kod: eski `@ViewChild` dan ko'chirish

```ts
// Ilgari
@ViewChild('box', { static: false }) box!: ElementRef<HTMLInputElement>;
@ViewChildren(Row) rows!: QueryList<Row>;

ngAfterViewInit() {
  this.box.nativeElement.focus();
  this.rows.changes.subscribe(() => this.count = this.rows.length);
}
```

```ts
// Bugun
readonly box = viewChild.required<ElementRef<HTMLInputElement>>('box');
readonly rows = viewChildren(Row);
protected readonly count = computed(() => this.rows().length);

constructor() {
  afterNextRender(() => this.box().nativeElement.focus());
}
```

| Eski | Yangi |
| --- | --- |
| `static: true/false` | Kerak emas |
| `ngAfterViewInit` | `afterNextRender` yoki `effect` |
| `QueryList` + `.changes.subscribe` | `Signal<readonly T[]>` + `computed` |
| `!` bilan "keyin bo'ladi" va'dasi | `required` yoki `T \| undefined` |

Avtomatik migratsiya:

```bash
ng generate @angular/core:signal-queries-migration
```

## Muhandislik nuqtai nazari: so'rov kerakmi

So'rov — shablon va klass orasidagi **qattiq bog'lanish**. Ko'p hollarda kerak emas:

| Vazifa | So'rovsiz yo'l |
| --- | --- |
| Input qiymatini olish | `#ref` shablonda yoki Signal Forms |
| Bola holatini o'qish | Bola `output` yoki `model` bilan xabar bersin |
| Elementga klass qo'shish | `[class.x]` binding |
| Fokus bir marta | `Autofocus` direktivasi (14-bob) |
| Bola metodini chaqirish | Ko'pincha `input` o'zgarishi bilan almashtirish mumkin |

So'rov kerak bo'ladigan joylar: fokus boshqaruvi (modal, forma xatosi), scroll, o'lchash, uchinchi tomon kutubxonasi. Qolganida — binding va `input`/`output`.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Konstruktorda `required` so'rovni o'qish | NG8118 | `computed`, `effect`, `afterNextRender` |
| `@if` ichidagi element uchun `required` | Yopiq paytda xato | Oddiy `viewChild` + `?.` |
| `viewChild` qiymatini maydonga bir marta saqlash | Element o'zgarsa eski havola | Har safar `box()` |
| `contentChild` o'rniga `viewChild` | Proyeksiya qilingan kontent topilmaydi | `contentChild` |
| Ichma-ich kontentni `descendants` siz qidirish | Topilmaydi | `{ descendants: true }` |
| `nativeElement.style.x = ...` | SSR'da xato, Angular bilmaydi | `[style.x]` binding |
| Bola holatini so'rov bilan o'qish | Qattiq bog'lanish | `output` / `model` |
| Yangi kodda `@ViewChild` + `ngAfterViewInit` | Eski uslub | `viewChild` + `afterNextRender` |

## Amaliyot

1. `Search` komponentini yozing — ota tugma bosganda `search.focus()` chaqirsin.
2. `@if` ichidagi input uchun `viewChild` yozing; ochilganda avtomatik fokus olsin (`afterRenderEffect`).
3. Ro'yxatda `viewChildren` bilan `scrollTo(id)` metodini yozing.
4. Konstruktorda `required` so'rovni o'qing — NG8118 ni ko'ring.
5. `Card` ga `contentChild` bilan "sarlavha bormi?" tekshiruvini qo'shing; sarlavha yo'q bo'lsa boshqa stil bersin.
6. Eski `@ViewChild` li komponentga `signal-queries-migration` ni qo'llang.

## Rasmiy hujjat

- So'rovlar: <https://angular.dev/guide/components/queries>
- `viewChild`: <https://angular.dev/api/core/viewChild>
- Migratsiya: <https://angular.dev/reference/migrations/signal-queries>
