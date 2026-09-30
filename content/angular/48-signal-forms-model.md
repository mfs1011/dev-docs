# 48 — Signal Forms: model va maydonlar

[← Oldingi: Uch yondashuv](47-formalar-tanlov.md) · [Mundarija](README.md) · [Keyingi: Signal Forms: validatsiya →](49-signal-forms-validatsiya.md)

## Tushuncha

Signal Forms uch qismdan iborat:

| Qism | Nima | Kim yaratadi |
| --- | --- | --- |
| **Model** | Oddiy `WritableSignal` — forma ma'lumoti | Siz |
| **FieldTree** | Model shaklini takrorlovchi maydonlar daraxti | `form(model)` |
| **`[formField]`** | Maydonni HTML elementga bog'laydigan direktiva | Shablonda |

```ts
import { form } from '@angular/forms/signals';

const model = signal({ name: '', address: { city: '' } });
const f = form(model);

f.name              // name maydoni (FieldTree)
f.address.city      // ichki maydon
f.name()            // FieldState — holat: value, touched, errors...
f()                 // butun forma holati
```

Asosiy g'oya: forma o'z nusxasini **saqlamaydi**. `f.name().value.set('Ali')` — to'g'ridan-to'g'ri `model` ni o'zgartiradi, va aksincha.

## Nega shunday

Reactive Forms'da ma'lumot ikki joyda: sizning `user` obyektingiz va `FormGroup` ichidagi qiymat. Ularni sinxron ushlash — `patchValue`, `valueChanges`, `getRawValue` bilan doimiy ish. Signal Forms'da **bitta manba** — model. Forma — modelning ustidagi metama'lumot qatlami: "bu maydon tegilganmi, xatosi bormi".

## Kod: birinchi forma

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';

interface Profile {
  name: string;
  email: string;
  age: number | null;
  newsletter: boolean;
  plan: 'free' | 'pro';
  city: string;
  bio: string;
}

@Component({
  selector: 'app-profile-form',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="form">
      <label>Ism <input [formField]="form.name" /></label>
      <label>Email <input type="email" [formField]="form.email" /></label>
      <label>Yosh <input type="number" [formField]="form.age" /></label>
      <label><input type="checkbox" [formField]="form.newsletter" /> Yangiliklar</label>

      <label><input type="radio" value="free" [formField]="form.plan" /> Bepul</label>
      <label><input type="radio" value="pro" [formField]="form.plan" /> Pro</label>

      <select [formField]="form.city">
        <option value="">— tanlang —</option>
        <option value="tsh">Toshkent</option>
        <option value="sam">Samarqand</option>
      </select>

      <textarea [formField]="form.bio"></textarea>
    </form>

    <pre>{{ model() | json }}</pre>
  `,
})
export class ProfileForm {
  protected readonly model = signal<Profile>({
    name: '', email: '', age: null, newsletter: false, plan: 'free', city: '', bio: '',
  });

  protected readonly form = form(this.model);
}
```

Tekshirilgan bog'lanishlar:

| Element | Model tipi | Eslatma |
| --- | --- | --- |
| `<input>` | `string` | Har harfda modelga yoziladi |
| `<input type="number">` | `number \| null` | Bo'sh maydon → **`null`** |
| `<input type="checkbox">` | `boolean` | |
| `<input type="radio" value="...">` | `string` | Tanlangan `value` |
| `<select>` | `string` | |
| `<textarea>` | `string` | |

Model → input yo'nalishi ham ishlaydi: `this.model.update(m => ({ ...m, name: 'Alisher' }))` — input darhol yangilanadi.

`<pre>{{ model() | json }}</pre>` — ishlab chiqishda juda foydali: modelda nima borligini doim ko'rasiz.

### `form()` qayerda chaqiriladi

`form()` — injection kontekstida (maydon initsializatori, konstruktor). Metoddan chaqirilsa (tekshirildi):

```
NG0203: The `Injector` token injection failed. `inject()` function must be called from an injection context...
```

Kontekstdan tashqarida kerak bo'lsa — `form(model, { injector })`.

## Kod: `FormRoot`

```html
<form [formRoot]="form">
```

`FormRoot` direktivasi (tekshirildi):

- `<form>` ga `novalidate` qo'yadi — brauzerning o'z validatsiya pufakchalari chiqmaydi.
- `submit` hodisasida sahifa qayta yuklanishini to'xtatadi va formaning `submission` sozlamasini ishga tushiradi (51-bob).

`FormRoot` siz ham ishlaydi — faqat submit'ni o'zingiz boshqarasiz.

## Kod: maydon holati

`f.name()` — `FieldState`. Hamma xususiyat — signal:

| Signal | Ma'no |
| --- | --- |
| `value()` | Qiymat (`WritableSignal` — `.set()` mumkin) |
| `touched()` | Foydalanuvchi maydondan chiqqanmi (`blur`) |
| `dirty()` | Foydalanuvchi qiymatni o'zgartirganmi |
| `valid()` / `invalid()` | Xato yo'q / bor |
| `pending()` | Async validatsiya ketyapti |
| `errors()` | Shu maydon xatolari |
| `errorSummary()` | Shu maydon va barcha ichki maydonlar xatolari |
| `disabled()`, `readonly()`, `hidden()` | Holat (50-bob) |
| `required()`, `minLength()`, `max()`... | Validatorlardan kelgan metama'lumot |
| `submitting()` | Yuborish ketyapti |

Metodlar: `markAsTouched()`, `markAsDirty()`, `reset(value?)`, `focusBoundControl()`.

```html
<input [formField]="form.email" />
@if (form.email().touched() && form.email().invalid()) {
  <p class="error">{{ form.email().errors()[0].message }}</p>
}
```

`f()` — butun forma: `form().valid()`, `form().dirty()`, `form().value()`.

Tekshirildi: input'ga yozib `blur` qilinganda `touched()` → `true`, `dirty()` → `true`.

### `reset`

```ts
this.form().reset();                 // touched/dirty tozalanadi, qiymat QOLADI
this.form().reset(emptyProfile);     // qiymat ham
```

Tekshirildi: argumentsiz `reset()` dan keyin `touched()` va `dirty()` — `false`, lekin model qiymati o'zgarmadi. "Formani tozalash" uchun qiymatni ham bering yoki `model.set(...)`.

## Kod: ichki obyektlar va massivlar

```ts
interface Order {
  customer: { name: string; phone: string };
  items: { product: string; qty: number }[];
}

protected readonly model = signal<Order>({
  customer: { name: '', phone: '' },
  items: [{ product: '', qty: 1 }],
});

protected readonly form = form(this.model);
```

```html
<input [formField]="form.customer.name" />
<input [formField]="form.customer.phone" />

@for (item of form.items; track $index) {
  <div>
    <input [formField]="item.product" />
    <input type="number" [formField]="item.qty" />
    <button type="button" (click)="removeItem($index)">×</button>
  </div>
}
<button type="button" (click)="addItem()">+ Mahsulot</button>
```

```ts
protected addItem() {
  this.model.update((m) => ({ ...m, items: [...m.items, { product: '', qty: 1 }] }));
}

protected removeItem(index: number) {
  this.model.update((m) => ({ ...m, items: m.items.filter((_, i) => i !== index) }));
}
```

Massiv qo'shish/o'chirish — **modelni o'zgartirish** orqali (tekshirildi: `model.update` bilan element qo'shilganda `@for` yangi input chiqardi). `FormArray.push` kabi maxsus API yo'q — kerak ham emas. `form.items` — iteratsiya qilinadigan maydonlar ro'yxati.

`type="button"` — `<form>` ichidagi oddiy tugma sukut bo'yicha `submit`. Unutilsa, "+" bosilganda forma yuboriladi.

## Kod: mavjud ma'lumotni tahrirlash

```ts
export class ProductEdit {
  readonly product = input.required<Product>();

  protected readonly model = linkedSignal(() => structuredClone(this.product()));
  protected readonly form = form(this.model);
}
```

`linkedSignal` (18-bob) — `product` input'i o'zgarsa (boshqa mahsulotga o'tildi), model yangi qiymatdan qayta boshlanadi; oradagi tahrirlar esa yoziladigan. `structuredClone` — kiruvchi obyektni to'g'ridan-to'g'ri o'zgartirmaslik uchun. Tekshirildi: input'ga yozilganda ota komponentdagi obyekt o'zgarmadi; ota yangi mahsulot berganda input yangi qiymatni ko'rsatdi.

## Muhandislik nuqtai nazari

**Model tipi — shartnoma.** Forma modelini API DTO bilan bir xil qilish shart emas:

| Forma modeli | API DTO |
| --- | --- |
| `age: number \| null` (bo'sh bo'lishi mumkin) | `age: number` |
| `tags: string` (vergul bilan) | `tags: string[]` |
| `birthDate: string` (`<input type="date">`) | `birthDate: Date` |

Yuborishda o'giring (51-bob). Forma modeli **UI'ga** qulay bo'lsin.

**Boshlang'ich qiymatlar — to'liq.** Modelda `undefined` maydonlar bo'lmasin: `name: ''`, `age: null`, `tags: []`. `form()` maydonlar daraxtini model shaklidan quradi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `FormField` ni `imports` ga qo'shmaslik | `[formField]` noma'lum xususiyat (NG8002) | `imports: [FormField]` |
| `form()` ni metodda | NG0203 | Maydon initsializatorida |
| `type="number"` maydonni `number` deb tiplash | Bo'sh bo'lsa `null` keladi | `number \| null` |
| `reset()` qiymatni tozalaydi deb kutish | Qiymat qoladi | `reset(bo'shQiymat)` |
| Forma ichidagi tugmada `type="button"` yo'q | Forma yuboriladi | `type="button"` |
| Kiruvchi `input` obyektini to'g'ridan-to'g'ri model qilish | Ota komponentdagi ma'lumot o'zgaradi | `linkedSignal` + `structuredClone` |
| Modelda `undefined` maydon | Maydon daraxtida yo'q | To'liq boshlang'ich qiymat |

## Amaliyot

1. `ProfileForm` ni yozing va `<pre>{{ model() | json }}</pre>` bilan har maydonni sinang; `age` ni bo'shating — `null` ni ko'ring.
2. Tugma bilan `model.update(...)` qiling — input'lar yangilanishini ko'ring.
3. Har maydon ostida `touched` / `dirty` holatini chiqaring.
4. `Order` formasi: mijoz + mahsulotlar ro'yxati, qo'shish va o'chirish bilan.
5. `ProductEdit` ni `linkedSignal` bilan yozing; boshqa mahsulotga o'tganda forma yangilanishini tekshiring.
6. `reset()` va `reset(value)` farqini sinang.

## Rasmiy hujjat

- Signal Forms: <https://angular.dev/guide/forms/signals/overview>
- Forma modeli: <https://angular.dev/guide/forms/signals/models>
- Maydon holati: <https://angular.dev/guide/forms/signals/field-state-management>
