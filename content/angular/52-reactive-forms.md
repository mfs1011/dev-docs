# 52 — Reactive Forms

[← Oldingi: Signal Forms: yuborish va dinamik formalar](51-signal-forms-yuborish.md) · [Mundarija](README.md) · [Keyingi: Qat'iy tiplangan Reactive Forms →](53-tiplangan-reactive-forms.md)

## Tushuncha

Reactive Forms — Angular 2 dan beri asosiy forma API'si. Mavjud loyihalarning katta qismi shunda yozilgan, UI kutubxonalar (Angular Material, PrimeNG) u bilan ishlaydi. Yangi formalar uchun Signal Forms tavsiya etilsa ham, Reactive Forms'ni **o'qish va saqlash** — har bir Angular dasturchisi uchun zarur ko'nikma.

To'rtta qurilish bloki:

| Klass | Nima |
| --- | --- |
| `FormControl<T>` | Bitta qiymat |
| `FormGroup<{...}>` | Nomlangan kontrollar obyekti |
| `FormArray<C>` | Kontrollar massivi |
| `FormRecord<C>` | Kalitlari oldindan noma'lum obyekt |

Hammasi `AbstractControl` dan: `value`, `status`, `valid`, `touched`, `dirty`, `errors`, `valueChanges`, `statusChanges`, `events`.

## Nega shunday

Signal Forms'dan asosiy farq: **holat `FormGroup` ichida yashaydi**. Sizning `user` obyektingiz va forma qiymati — ikki alohida narsa; ularni `setValue` / `patchValue` va `getRawValue` bilan sinxronlaysiz. O'zgarishlar — RxJS Observable'lar orqali.

## Kod: asosiy forma

```ts
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input formControlName="name" />
      @if (form.controls.name.touched && form.controls.name.hasError('required')) {
        <small>Ism majburiy</small>
      }

      <input type="email" formControlName="email" />

      <div formGroupName="address">
        <input formControlName="city" />
        <input formControlName="street" />
      </div>

      <button [disabled]="form.pending">Yuborish</button>
    </form>
  `,
})
export class Contact {
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    address: new FormGroup({
      city: new FormControl('', { nonNullable: true }),
      street: new FormControl('', { nonNullable: true }),
    }),
  });

  protected save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.api.send(this.form.getRawValue());
  }
}
```

| Direktiva | Vazifa |
| --- | --- |
| `[formGroup]="form"` | Ildiz guruhni `<form>` ga bog'lash |
| `formControlName="name"` | Guruh ichidagi kontrol |
| `formGroupName="address"` | Ichki guruh |
| `formArrayName="items"` | Ichki massiv |
| `[formControl]="ctrl"` | Guruhsiz, alohida kontrol |
| `(ngSubmit)` | Yuborish (sahifa qayta yuklanmaydi) |

## Kod: `FormBuilder`

Katta formalarda `new FormControl` takrorlanishi o'rniga:

```ts
private readonly fb = inject(NonNullableFormBuilder);

protected readonly form = this.fb.group({
  name: ['', [Validators.required, Validators.maxLength(50)]],
  email: ['', [Validators.required, Validators.email]],
  address: this.fb.group({ city: [''], street: [''] }),
  tags: this.fb.array<string>([]),
});
```

`NonNullableFormBuilder` (yoki `inject(FormBuilder).nonNullable`) — barcha kontrollar `nonNullable`. Nega muhim — 53-bobda.

## Kod: qiymatni o'qish va yozish

```ts
this.form.value;            // disabled maydonlarsiz
this.form.getRawValue();    // hammasi

this.form.setValue({ ... });       // BARCHA maydonlar shart
this.form.patchValue({ name: 'Ali' });   // faqat berilganlari
this.form.reset();
```

Tekshirildi:

| Amal | Natija |
| --- | --- |
| `extra.disable()` dan keyin `form.value` | `{ name: '' }` — `extra` **yo'q** |
| `form.getRawValue()` | `{ name: '', extra: null }` |
| `setValue({ name: 'x' })` (`extra` yo'q) | `NG01002: Must supply a value for form control with name: 'extra'` |

Serverga yuborishda deyarli har doim **`getRawValue()`** — `value` disabled maydonlarni jim tashlab ketadi.

## Kod: `FormArray`

```ts
protected readonly form = this.fb.group({
  items: this.fb.array([this.createItem()]),
});

private createItem() {
  return this.fb.group({
    product: ['', Validators.required],
    qty: [1, [Validators.required, Validators.min(1)]],
  });
}

protected get items() {
  return this.form.controls.items;
}

protected add() { this.items.push(this.createItem()); }
protected remove(i: number) { this.items.removeAt(i); }
```

```html
<div formArrayName="items">
  @for (item of items.controls; track item; let i = $index) {
    <div [formGroupName]="i">
      <input formControlName="product" />
      <input type="number" formControlName="qty" />
      <button type="button" (click)="remove(i)">×</button>
    </div>
  }
</div>
<button type="button" (click)="add()">+ Qator</button>
```

`track item` — kontrol obyektining o'zi (o'chirilganda boshqa qatorlar qayta yaratilmaydi).

## Kod: `FormRecord`

Kalitlar oldindan noma'lum — masalan, ruxsatlar ro'yxati serverdan:

```ts
protected readonly permissions = new FormRecord<FormControl<boolean>>({});

constructor() {
  for (const p of this.allPermissions) {
    this.permissions.addControl(p.key, new FormControl(false, { nonNullable: true }));
  }
}
```

Tekshirildi: `addControl('perm1', ...)` → `value` → `{ perm1: true }`.

## Kod: o'zgarishlarni kuzatish

```ts
// Faqat qiymat
this.form.controls.country.valueChanges
  .pipe(takeUntilDestroyed())
  .subscribe((country) => this.loadRegions(country));

// Barcha hodisalar (Angular 18+)
this.form.events.pipe(takeUntilDestroyed()).subscribe((e) => {
  if (e instanceof FormSubmittedEvent) { ... }
  if (e instanceof FormResetEvent) { ... }
});
```

Tekshirilgan `events` turlari: `ValueChangeEvent`, `StatusChangeEvent`, `TouchedChangeEvent`, `PristineChangeEvent`, `FormSubmittedEvent`, `FormResetEvent`.

Signal kerak bo'lsa:

```ts
protected readonly country = toSignal(this.form.controls.country.valueChanges, {
  initialValue: this.form.controls.country.value,
});
```

`initialValue` — `valueChanges` boshlang'ich qiymatni **chiqarmaydi**, faqat o'zgarishlarni.

### Zoneless bilan

Tekshirildi: zoneless + `OnPush` komponentda `setTimeout` ichida `setValue('Ali')` — shablondagi `{{ form.controls.name.value }}` yangilandi. Reactive Forms Angular 22 da zoneless bilan muammosiz ishlaydi.

## Kod: validatorlar

```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function uzPhone(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    !control.value || /^\+998\d{9}$/.test(control.value) ? null : { uzPhone: true };
}

// Guruh validatori — maydonlararo
export const passwordsMatch: ValidatorFn = (group) =>
  group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
```

```ts
this.fb.group(
  { password: [''], confirm: [''] },
  { validators: [passwordsMatch] },
);
```

Guruh validatori xatosi **guruhda** (`form.errors`), maydonda emas — ko'rsatishda buni hisobga oling. Signal Forms'da `validate(p.confirm, ...)` xatoni to'g'ridan-to'g'ri maydonga qo'yadi — bu farqlardan biri.

Async validator:

```ts
export function usernameAvailable(api: UserApi): AsyncValidatorFn {
  return (control) =>
    timer(300).pipe(
      switchMap(() => api.check(control.value)),
      map((taken) => (taken ? { taken: true } : null)),
      catchError(() => of(null)),
    );
}

username: ['', { validators: [Validators.required], asyncValidators: [usernameAvailable(this.api)], updateOn: 'blur' }],
```

## Kod: shartli yoqish/o'chirish

```ts
constructor() {
  this.form.controls.accountType.valueChanges.pipe(takeUntilDestroyed()).subscribe((type) => {
    const company = this.form.controls.companyName;
    if (type === 'business') {
      company.enable();
      company.addValidators(Validators.required);
    } else {
      company.disable();
      company.removeValidators(Validators.required);
    }
    company.updateValueAndValidity();
  });
}
```

Bu — Reactive Forms'ning og'riq nuqtasi: shartli mantiq imperativ, obunalar orqali. Signal Forms'da xuddi shu — bitta `applyWhen` yoki `disabled(p, fn)`.

## Muhandislik nuqtai nazari

**Mavjud Reactive formani qachon Signal Forms'ga ko'chirish:**

| Belgi | Ko'chirish |
| --- | --- |
| Forma ishlayapti, kam o'zgaradi | Yo'q |
| Ko'p `valueChanges` obunalari, `enable/disable` zanjirlari | Ha — eng katta foyda |
| Signal-asosli sahifaga integratsiya (ko'p `toSignal`) | Ha |
| UI kit faqat `formControlName` qo'llaydi | Hozircha yo'q, yoki `SignalFormControl` (54-bob) |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `ReactiveFormsModule` import qilinmagan | `formGroup` noma'lum xususiyat (NG8002) | `imports: [ReactiveFormsModule]` |
| `form.value` serverga | Disabled maydonlar tushib qoladi | `getRawValue()` |
| `setValue` qisman obyekt bilan | NG01002 | `patchValue` |
| `valueChanges` boshlang'ich qiymatni beradi deb kutish | Birinchi qiymat yo'q | `startWith(ctrl.value)` yoki `initialValue` |
| Obuna tozalanmaydi | Xotira oqishi | `takeUntilDestroyed()` |
| Yuborishda `markAllAsTouched` yo'q | Xatolar ko'rinmaydi | `if (invalid) markAllAsTouched()` |
| Guruh xatosini maydonda qidirish | Ko'rinmaydi | `form.hasError('mismatch')` |
| `@for` da `track $index` + `removeAt` | Qatorlar chalkashadi | `track item` |

## Amaliyot

1. `Contact` formasini ichki `address` guruhi bilan yozing.
2. Bitta maydonni `disable()` qilib, `value` va `getRawValue()` ni solishtiring.
3. `FormArray` bilan buyurtma qatorlari: qo'shish, o'chirish.
4. `passwordsMatch` guruh validatori va xatoni ko'rsatish.
5. `accountType` bo'yicha `companyName` ni yoqish/o'chirish — keyin xuddi shuni Signal Forms'da yozib solishtiring.
6. `form.events` ga obuna bo'lib, har bir hodisa turini konsolga chiqaring.

## Rasmiy hujjat

- Reactive Forms: <https://angular.dev/guide/forms/reactive-forms>
- Validatsiya: <https://angular.dev/guide/forms/form-validation>
- `FormArray`: <https://angular.dev/api/forms/FormArray>
