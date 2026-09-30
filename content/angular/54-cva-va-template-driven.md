# 54 — `ControlValueAccessor` va template-driven

[← Oldingi: Qat'iy tiplangan Reactive Forms](53-tiplangan-reactive-forms.md) · [Mundarija](README.md) · [Keyingi: HttpClient chuqur →](55-http-client.md)

## Tushuncha

Bu bob — ikkita "eski, lekin tirik" mavzu va ular orasidagi ko'prik:

| Mavzu | Nima | Hozir qachon kerak |
| --- | --- | --- |
| `ControlValueAccessor` (CVA) | Komponentni Reactive / template-driven formaga ulash interfeysi | Reactive Forms bilan ishlaydigan kontrol, UI kutubxona |
| Template-driven (`ngModel`) | Forma holati shablonda | Juda oddiy formalar, eski kod |
| Compat (`@angular/forms/signals/compat`) | Signal Forms ↔ Reactive Forms ko'prigi | Bosqichma-bosqich ko'chirish |

## Nega shunday

Signal Forms'da maxsus kontrol — `FormValueControl` (`value = model()`), bir necha qator (51-bob). Lekin Angular ekotizimidagi minglab kontrollar (datepicker, select, rich-editor) **CVA** bilan yozilgan. Ularni tushunish, ba'zan yozish, va Signal Forms bilan ishlatish kerak.

## Kod: `ControlValueAccessor`

To'rt metod — forma va komponent orasidagi shartnoma:

| Metod | Kim chaqiradi | Ma'no |
| --- | --- | --- |
| `writeValue(v)` | Forma → komponent | "Yangi qiymat — ko'rsat" |
| `registerOnChange(fn)` | Forma | "Qiymat o'zgarsa, `fn(v)` ni chaqir" |
| `registerOnTouched(fn)` | Forma | "Foydalanuvchi tegsa, `fn()` ni chaqir" |
| `setDisabledState(d)` | Forma (ixtiyoriy) | "O'chirilgan/yoqilgan" |

```ts
import { Component, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-rating',
  template: `
    @for (star of stars; track star) {
      <button
        type="button"
        [attr.aria-pressed]="star <= value()"
        [disabled]="disabled()"
        (click)="select(star)"
        (blur)="onTouched()"
      >★</button>
    }
  `,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Rating), multi: true },
  ],
})
export class Rating implements ControlValueAccessor {
  protected readonly stars = [1, 2, 3, 4, 5];
  protected readonly value = signal(0);
  protected readonly disabled = signal(false);

  private onChange: (v: number) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(v: number | null): void { this.value.set(v ?? 0); }
  registerOnChange(fn: (v: number) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(d: boolean): void { this.disabled.set(d); }

  protected select(star: number) {
    this.value.set(star);
    this.onChange(star);
  }
}
```

```html
<!-- Reactive -->
<app-rating formControlName="rating" />

<!-- Template-driven -->
<app-rating name="rating" [(ngModel)]="rating" />
```

Nozik joylar:

- **`writeValue(null)`** — `reset()` da `null` keladi. Himoyalang.
- **`onChange` ni `writeValue` ichida chaqirmang** — cheksiz sikl yoki `dirty` noto'g'ri bo'ladi.
- **`multi: true`** va **`forwardRef`** — 36-bob.
- Holat — signallarda: zoneless/OnPush'da `writeValue` dan keyin shablon o'zi yangilanadi.

Solishtiring — xuddi shu kontrol Signal Forms uchun (51-bob):

```ts
export class Rating implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
}
```

## Kod: CVA komponentini Signal Forms bilan

Tekshirildi — `[formField]` CVA komponentini ham qo'llaydi:

```html
<app-rating [formField]="form.rating" />
```

| Harakat | Natija |
| --- | --- |
| Boshlanishda | `writeValue(5)` — model qiymati |
| `onChange(6)` | `model().rating === 6` |
| `onTouched()` | `form.rating().touched() === true` |

Ya'ni mavjud CVA kutubxonalarini (masalan, eski datepicker) Signal Forms formasida ishlatish mumkin. Angular hujjati buni "orqaga moslik uchun" deydi — yangi kontrollar uchun `FormValueControl`.

## Kod: Reactive formaga Signal Forms qoidalari

Katta Reactive formani bir kunda ko'chirib bo'lmaydi. `SignalFormControl` — `FormGroup` ichida yashaydigan, lekin Signal Forms qoidalari bilan ishlaydigan kontrol:

```ts
import { SignalFormControl } from '@angular/forms/signals/compat';
import { required, email } from '@angular/forms/signals';

export class Checkout {
  protected readonly emailControl = new SignalFormControl('', (p) => {
    required(p);
    email(p);
  });

  protected readonly form = new FormGroup({
    email: this.emailControl,
    phone: new FormControl('', { nonNullable: true }),
  });
}
```

```html
<form [formGroup]="form">
  <input [formField]="emailControl.fieldTree" />
  <input formControlName="phone" />
</form>
```

Tekshirildi: `SignalFormControl` validligi `FormGroup` ga tarqaladi (bo'sh → `form.valid === false`, qiymat berilgach → `true`). **Injection konteksti kerak** — maydon initsializatorida yarating; aks holda NG0203.

Teskari yo'nalish — `compatForm`: Signal Forms modeli ichida mavjud `FormControl` saqlash:

```ts
import { compatForm } from '@angular/forms/signals/compat';

const legacyDate = new FormControl<Date | null>(null);   // eski kutubxona kontroli
const model = signal({ name: '', date: legacyDate });
const f = compatForm(model, (p) => { required(p.name); });

f.date().value();   // Date | null — FormControl emas, uning qiymati
```

Tekshirildi: `legacyDate.setValue(new Date(0))` dan keyin `f.date().value()` — `Date`.

Ko'chirish strategiyasi:

1. Yangi maydonlar — `SignalFormControl` bilan, mavjud `FormGroup` ichida.
2. Mustaqil qismlar — alohida Signal Forms formalarga.
3. Oxirida `FormGroup` ni `form()` ga almashtirish.

## Kod: template-driven

```ts
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <form #f="ngForm" (ngSubmit)="save(f)">
      <input name="email" [(ngModel)]="email" required email #emailCtrl="ngModel" />
      @if (emailCtrl.touched && emailCtrl.invalid) {
        <small>Email noto'g'ri</small>
      }

      <input name="nick" [(ngModel)]="nick" />
      <button [disabled]="f.invalid">Saqlash</button>
    </form>
  `,
})
export class Settings {
  protected email = '';
  protected readonly nick = signal('');

  protected save(f: NgForm) {
    if (f.invalid) return;
    // ...
  }
}
```

Tekshirildi: `[(ngModel)]="nick"` — `nick` **signal** bo'lsa ham ikki tomonlama ishlaydi (input'ga yozilganda `nick()` yangilandi).

`<form>` ichida `name` atributi **shart** (tekshirildi):

```
NG01352: If ngModel is used within a form tag, either the name attribute must be set
or the form control must be defined as 'standalone' in ngModelOptions.
```

Formadan tashqari yakka `ngModel` — `name` shart emas:

```html
<input [(ngModel)]="query" placeholder="Qidirish" />
```

### Template-driven qachon mos

| Mos | Mos emas |
| --- | --- |
| 1–3 maydonli sozlamalar | Maydonlararo qoidalar |
| Prototip | Dinamik maydonlar |
| Eski kodni saqlash | Murakkab async validatsiya |

Yangi kodda: bitta qidiruv maydoni uchun — oddiy `signal` + `(input)`; forma uchun — Signal Forms.

## Muhandislik nuqtai nazari

**Kontrol yozayotganda qaysi interfeys?**

```
Kontrol faqat shu loyihada, Signal Forms bilan?
├── Ha ────────────────────────────► FormValueControl / FormCheckboxControl
└── Yo'q — Reactive Forms ham, kutubxona sifatida ham
    └── ControlValueAccessor ──────► [formField] ham qo'llaydi
```

**Kutubxona muallifi bo'lsangiz** — CVA hali ham eng keng moslik beradi: Reactive, template-driven va Signal Forms (`[formField]` orqali) — uchalasi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `NG_VALUE_ACCESSOR` providersiz CVA | `NG01203: No value accessor for form control name: 'rating'` | `providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(...), multi: true }]` |
| `writeValue` da `null` ni hisobga olmaslik | `reset()` da xato | `v ?? default` |
| `writeValue` ichida `onChange` | Sikl, noto'g'ri `dirty` | Faqat foydalanuvchi harakatida |
| `onTouched` hech qachon chaqirilmaydi | `touched` doim `false`, xato ko'rinmaydi | `(blur)="onTouched()"` |
| `<form>` ichida `ngModel` + `name` yo'q | NG01352 | `name="..."` |
| `SignalFormControl` ni metodda yaratish | NG0203 | Maydon initsializatorida |
| Yangi kontrol uchun CVA (faqat Signal Forms'da ishlatiladi) | Keraksiz boilerplate | `FormValueControl` |

## Amaliyot

1. `Rating` ni CVA sifatida yozib, Reactive formada `formControlName` bilan ulang; `reset()` da `null` ni sinang.
2. Xuddi shu `Rating` ni Signal Forms formasida `[formField]` bilan ulang — `touched` ishlashini tekshiring.
3. Mavjud Reactive formaga bitta `SignalFormControl` maydon qo'shing.
4. Template-driven sozlamalar formasi: `ngModel` + signal.
5. `name` siz `ngModel` yozib NG01352 ni ko'ring.

## Rasmiy hujjat

- `ControlValueAccessor`: <https://angular.dev/api/forms/ControlValueAccessor>
- Template-driven formalar: <https://angular.dev/guide/forms/template-driven-forms>
- Signal Forms'ga ko'chirish: <https://angular.dev/guide/forms/signals/migration>
