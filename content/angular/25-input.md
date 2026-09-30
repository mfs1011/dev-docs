# 25 — `input()` — signal kiritmalari

[← Oldingi: RxJS va signallar birga](24-rxjs-va-signallar.md) · [Mundarija](README.md) · [Keyingi: output() va model() →](26-output-va-model.md)

## Tushuncha

Kiritma (input) — komponentga **tashqaridan** ma'lumot berish:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-user-card',
  template: `<h3>{{ name() }}</h3> <p>{{ role() }}</p>`,
})
export class UserCard {
  readonly name = input.required<string>();
  readonly role = input('Foydalanuvchi');
}
```

```html
<app-user-card name="Ali" />
<app-user-card [name]="user().name" role="Admin" />
```

`input()` — **faqat o'qiladigan signal**. Ota komponent qiymat bersa — o'zgaradi; bola uni o'zgartira olmaydi.

## Nega shunday

Ma'lumot oqimi **bir yo'nalishli**: otadan bolaga. Bola kiritmani o'zgartira olsa, "bu qiymat qayerdan keldi, kim o'zgartirdi?" degan savolga javob topish qiyin bo'ladi. Shuning uchun `input` da `set` yo'q — tekshirildi, `label.set` — funksiya emas.

Signal bo'lgani uchun kiritma bilan `computed` va `effect` tabiiy ishlaydi — eski `ngOnChanges` kerak emas:

```ts
export class PriceTag {
  readonly amount = input.required<number>();
  readonly currency = input('UZS');

  protected readonly formatted = computed(() =>
    new Intl.NumberFormat('uz', { style: 'currency', currency: this.currency(), maximumFractionDigits: 0 })
      .format(this.amount()),
  );
}
```

`amount` yoki `currency` o'zgarsa — `formatted` o'zi qayta hisoblanadi.

## Kod: majburiy va ixtiyoriy

```ts
readonly user = input.required<User>();      // bermaslik — kompilyator xatosi
readonly size = input(24);                   // tip number, sukut 24
readonly theme = input<'light' | 'dark'>('light');
readonly tooltip = input<string>();          // tip string | undefined
```

| Yozuv | Tip | Berilmasa |
| --- | --- | --- |
| `input.required<T>()` | `T` | Kompilyator xatosi |
| `input(x)` | `x` ning tipi | `x` |
| `input<T>(x)` | `T` | `x` |
| `input<T>()` | `T \| undefined` | `undefined` |

`input.required` — shablonda majburiy. Tushirib qoldirsangiz, build to'xtaydi.

## Kod: juda erta o'qish

Kiritma qiymati komponent **yaratilgandan keyin** keladi. Konstruktorda o'qisangiz — qiymat hali yo'q. Angular 22 da buni **kompilyator** tutadi:

```ts
export class UserCard {
  readonly name = input.required<string>();

  constructor() {
    console.log(this.name());      // ✘
  }
}
```

```
✘ [ERROR] NG8118: `name` is a required `input` and does not have a value in this context.
```

Qayerda o'qish mumkin:

| Joy | Kiritma tayyormi |
| --- | --- |
| Konstruktor | ❌ NG8118 |
| Shablon | ✅ |
| `computed(() => ...)` | ✅ (dangasa — o'qilganda tayyor) |
| `effect(() => ...)` | ✅ |
| `ngOnInit` | ✅ (tekshirildi) |
| Hodisa ishlovchisi | ✅ |

Konstruktorda `computed` yoki `effect` **yaratish** mumkin — ular kiritmani keyinroq o'qiydi.

## Kod: `alias` — tashqi nom

```ts
readonly size = input(10, { alias: 'sz' });
```

```html
<app-icon [sz]="16" />
```

Tekshirildi: `[sz]="5"` → ichkarida `size()` `5`. Kamdan-kam kerak — asosan direktivalarda, kiritma nomi selektor bilan bir xil bo'lishi kerak bo'lganda (14-bob).

## Kod: `transform` — qiymatni o'zgartirish

HTML atributlari doim **satr**. `<app-button disabled>` — `disabled` ga `""` keladi, `true` emas. Buni tuzatish uchun Angular tayyor funksiyalar beradi:

```ts
import { booleanAttribute, input, numberAttribute } from '@angular/core';

export class AppButton {
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly tabIndex = input(0, { transform: numberAttribute });
}
```

```html
<app-button disabled tabIndex="3">OK</app-button>
```

Tekshirildi: `disabled` (qiymatsiz atribut) → `true`, `n="42"` → `42` (son).

| Funksiya | Kirish | Chiqish |
| --- | --- | --- |
| `booleanAttribute` | `""`, `"true"`, `true`, atribut bor | `true` |
| `booleanAttribute` | `"false"`, `false`, `null`, `undefined` | `false` |
| `numberAttribute` | `"42"` | `42` |
| `numberAttribute` | `"abc"` | `NaN` (yoki ikkinchi argument sukuti) |

O'z transformingiz:

```ts
readonly tags = input([], {
  transform: (value: string | string[]) => (Array.isArray(value) ? value : value.split(',')),
});
```

```html
<app-tags tags="angular,signal,di" />
<app-tags [tags]="['a', 'b']" />
```

Transform **sof** bo'lsin — tez va yon ta'sirsiz. Murakkab qayta ishlash — `computed` ga.

## Kod: kiritmani "o'zgartirish" kerak bo'lsa

Kiritma faqat o'qiladi. Lekin ba'zan uni boshlang'ich qiymat sifatida olib, ichkarida o'zgartirish kerak — masalan tahrirlash formasi. `linkedSignal` (18-bob):

```ts
export class Counter {
  readonly initial = input(0);

  // initial'dan boshlanadi, lekin ichkarida o'zgartiriladi.
  // initial o'zgarsa — qayta boshlanadi.
  protected readonly count = linkedSignal(() => this.initial());

  protected increment() {
    this.count.update((n) => n + 1);
  }
}
```

Agar o'zgarish **otaga qaytishi** kerak bo'lsa — `model()` (26-bob).

## Kod: obyekt kiritmalar va o'zgaruvchanlik

```ts
readonly user = input.required<User>();

protected rename() {
  this.user().name = 'Yangi';     // ❌ otaning obyektini o'zgartiryapti!
}
```

Signal ichidagi obyektni o'zgartirish — 16-bobdagi xato, lekin bu yerda yomonroq: siz **otaning** ma'lumotini buzasiz, ota bundan bexabar. Obyekt kiritmalarini faqat o'qing. O'zgartirish — `output` bilan otaga so'rov yuborish (26-bob).

## Kod: eski `@Input()` dan ko'chirish

```ts
// Ilgari
@Input({ required: true }) name!: string;
@Input() size = 24;
@Input({ transform: booleanAttribute }) disabled = false;

ngOnChanges(changes: SimpleChanges) {
  if (changes['name']) this.initials = this.computeInitials(this.name);
}
```

```ts
// Bugun
readonly name = input.required<string>();
readonly size = input(24);
readonly disabled = input(false, { transform: booleanAttribute });

protected readonly initials = computed(() => this.computeInitials(this.name()));
```

`ngOnChanges` o'rniga `computed` — kamroq kod, xato kamroq.

Avtomatik migratsiya:

```bash
ng generate @angular/core:signal-input-migration
```

U `@Input` ni `input()` ga aylantiradi va barcha o'qishlarni (`this.name` → `this.name()`) yangilaydi.

## Muhandislik nuqtai nazari: nechta kiritma

| Belgi | Nima qilish |
| --- | --- |
| 10+ kiritma | Komponent juda ko'p ish qiladi — bo'ling |
| 5 ta kiritma bitta obyektdan (`name`, `email`, `avatar`...) | Bitta `user` kiritmasi |
| Bir nechta boolean (`primary`, `danger`, `outline`) | Bitta `variant: 'primary' \| 'danger' \| 'outline'` |
| Kiritma faqat bolaga uzatiladi (prop drilling) | Xizmat yoki DI (37-bob) |

Boolean'larni birlashtirish ayniqsa foydali: `primary` va `danger` bir vaqtda `true` bo'lishi mumkin emas, `variant` bilan bu imkonsiz.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Konstruktorda kiritmani o'qish | NG8118 | `computed`, `effect`, `ngOnInit` |
| `disabled` ni `transform` siz | `<x disabled>` → `""`, if'da `false` | `booleanAttribute` |
| Shablonda `name` (qavssiz) | NG8109 ogohlantirishi | `name()` |
| `input.required` ni bermaslik | Kompilyator xatosi | Bering yoki sukut qo'ying |
| Kiritmani `set` qilishga urinish | `set` yo'q | `linkedSignal` yoki `model` |
| Obyekt kiritmani o'zgartirish | Otaning ma'lumoti buziladi | `output` bilan so'rov |
| `ngOnChanges` yangi kodda | Keraksiz | `computed` |
| Ko'p boolean kiritma | Zid holatlar mumkin | Birlashma tipli bitta kiritma |

## Amaliyot

1. `UserCard` ni `input.required<User>()` va `input('Foydalanuvchi')` bilan yozing; majburiy kiritmani tushirib, xatoni ko'ring.
2. Konstruktorda kiritmani o'qing — NG8118; keyin `computed` ga ko'chiring.
3. `AppButton` ga `booleanAttribute` bilan `disabled` qo'shing; transform'siz va transform bilan `<app-button disabled>` ni solishtiring.
4. `tags` uchun o'z transformingizni yozing: satr ham, massiv ham qabul qilsin.
5. `Counter` ni `linkedSignal` bilan yozing — `initial` o'zgarganda qayta boshlansin.
6. Eski `@Input` li komponentga `signal-input-migration` ni qo'llang.

## Rasmiy hujjat

- Kiritmalar: <https://angular.dev/guide/components/inputs>
- `input()` API: <https://angular.dev/api/core/input>
- Migratsiya: <https://angular.dev/reference/migrations/signal-inputs>
