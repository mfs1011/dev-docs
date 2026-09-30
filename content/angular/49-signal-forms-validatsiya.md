# 49 — Signal Forms: validatsiya

[← Oldingi: Signal Forms: model va maydonlar](48-signal-forms-model.md) · [Mundarija](README.md) · [Keyingi: Signal Forms: sxemalar va kesishuvchi mantiq →](50-signal-forms-sxema.md)

## Tushuncha

Validatsiya qoidalari `form()` ning ikkinchi argumenti — **sxema funksiyasi** ichida yoziladi:

```ts
protected readonly form = form(this.model, (p) => {
  required(p.email);
  email(p.email);
  minLength(p.password, 8);
});
```

`p` — **yo'l** (path) obyekti: model shaklini takrorlaydi, lekin qiymat emas, "qaysi maydon" ni bildiradi. Qoida funksiyalari (`required`, `email`...) shu yo'lga qoida biriktiradi.

Sxema funksiyasi **bir marta** ishlaydi — forma yaratilganda. Qoidalar ichidagi funksiyalar (`when`, `message`, `validate` logikasi) esa **reaktiv** — model o'zgarsa qayta hisoblanadi.

## Nega shunday

Reactive Forms'da validator — `FormControl` ga bog'langan funksiya massivi. Maydonlararo qoida uchun guruh validatori, shartli qoida uchun `setValidators` + `updateValueAndValidity`. Signal Forms'da har qoida — boshqa maydonlar qiymatini `valueOf` bilan o'qiy oladigan reaktiv funksiya. Shartli va kesishuvchi qoidalar alohida mexanizm talab qilmaydi.

## Kod: tayyor validatorlar

```ts
import { form, required, email, min, max, minLength, maxLength, pattern } from '@angular/forms/signals';

protected readonly form = form(this.model, (p) => {
  required(p.name);
  minLength(p.name, 2);
  maxLength(p.name, 50);
  email(p.email);
  min(p.age, 18);
  max(p.age, 120);
  pattern(p.phone, /^\+998\d{9}$/);
});
```

Tekshirilgan xato obyektlari:

| Validator | `errors()` elementi |
| --- | --- |
| `required` | `{ kind: 'required' }` |
| `email` | `{ kind: 'email' }` |
| `min(p, 10)` | `{ kind: 'min', min: 10 }` |
| `max(p, 3)` | `{ kind: 'max', max: 3 }` |
| `minLength(p, 3)` | `{ kind: 'minLength', minLength: 3 }` |
| `maxLength(p, 4)` | `{ kind: 'maxLength', maxLength: 4 }` |
| `pattern(p, re)` | `{ kind: 'pattern', pattern: re }` |

Sanalar uchun `minDate` / `maxDate` ham bor.

**Ikki muhim xulq** (tekshirildi):

1. **`message` sukut bo'yicha yo'q** — `undefined`. Foydalanuvchiga ko'rsatiladigan matnni siz berasiz.
2. **`email()` bo'sh satrni xato demaydi** — faqat to'ldirilgan qiymatni tekshiradi (tekshirildi: `minLength`, `pattern` bo'sh satrda, `min` — `null` da ham xato bermadi). Majburiy bo'lsa — `required` ham qo'shing. `min`, `minLength`, `pattern` ham xuddi shunday: bo'sh qiymatni `required` ga qoldiradi.

### Metama'lumot va native atributlar

Validatorlar maydonga **metama'lumot** ham beradi:

```ts
this.form.name().required();     // true
this.form.name().minLength();    // 2
```

Tekshirildi: `required(p.name)` bog'langan `<input>` ga native `required` atributi qo'yildi. Bu ekran o'quvchilari uchun muhim — "majburiy maydon" deb o'qiydi. `FormRoot` esa `novalidate` qo'yadi, shuning uchun brauzer pufakchalari chiqmaydi.

## Kod: xato xabarlari

### Qoidada

```ts
required(p.name, { message: 'Ismni kiriting' });
minLength(p.name, 2, { message: 'Kamida 2 ta harf' });
min(p.age, 18, { message: ({ value }) => `${value()} yosh — ro'yxatdan o'tish 18 dan` });
```

`message` — satr yoki `FieldContext` oladigan funksiya (reaktiv).

### Markazlashgan xaritada

Har qoidaga matn yozish o'rniga — `kind` bo'yicha bitta joyda:

```ts
// form-errors.ts
import { ValidationError } from '@angular/forms/signals';

export function errorText(error: ValidationError): string {
  if (error.message) return error.message;

  switch (error.kind) {
    case 'required': return 'Majburiy maydon';
    case 'email': return "Email noto'g'ri";
    case 'minLength': return `Kamida ${(error as { minLength: number }).minLength} belgi`;
    case 'maxLength': return `Ko'pi bilan ${(error as { maxLength: number }).maxLength} belgi`;
    case 'min': return `Eng kami — ${(error as { min: number }).min}`;
    case 'max': return `Eng ko'pi — ${(error as { max: number }).max}`;
    case 'pattern': return "Format noto'g'ri";
    default: return "Qiymat noto'g'ri";
  }
}
```

`getError(kind)` tipli xatoni qaytaradi:

```ts
this.form.password().getError('minLength')?.minLength;   // 8 (tekshirildi: 3 bilan → 3)
```

### Ko'rsatish komponenti

Har maydon ostida bir xil `@if` yozmaslik uchun:

```ts
@Component({
  selector: 'app-field-errors',
  template: `
    @if (show()) {
      <ul class="errors" [id]="id()" role="alert">
        @for (e of field()().errors(); track e.kind) {
          <li>{{ text(e) }}</li>
        }
      </ul>
    }
  `,
})
export class FieldErrors {
  readonly field = input.required<FieldTree<unknown>>();
  readonly id = input<string>();

  protected readonly show = computed(() => {
    const state = this.field()();
    return state.touched() && state.invalid();
  });

  protected readonly text = errorText;
}
```

```html
<label for="email">Email</label>
<input id="email" type="email" [formField]="form.email" aria-describedby="email-errors" />
<app-field-errors [field]="form.email" id="email-errors" />
```

`touched() && invalid()` — xato foydalanuvchi maydondan **chiqqandan keyin** ko'rinadi. Har harfda qizil matn — yomon tajriba.

## Kod: o'z validatoringiz

```ts
import { validate } from '@angular/forms/signals';

validate(p.username, ({ value }) =>
  /\s/.test(value()) ? { kind: 'noSpaces', message: "Bo'sh joy bo'lmasin" } : undefined,
);
```

Qaytarish: xato obyekti (`{ kind, message? }`), xatolar massivi yoki `undefined` (xato yo'q).

Tayyor xato yaratuvchilar — standart shaklda:

```ts
import { requiredError, minLengthError } from '@angular/forms/signals';

validate(p.tags, ({ value }) => value().length === 0 ? requiredError({ message: 'Kamida bitta teg' }) : undefined);
```

Tekshirildi: `requiredError({ message: 'helper' })` → `{ kind: 'required', message: 'helper' }`.

### Qayta ishlatiladigan validator

```ts
// validators.ts
export function uzPhone(path: SchemaPath<string>, message = "Telefon: +998XXXXXXXXX") {
  validate(path, ({ value }) =>
    value() && !/^\+998\d{9}$/.test(value()) ? { kind: 'uzPhone', message } : undefined,
  );
}
```

```ts
form(this.model, (p) => {
  required(p.phone);
  uzPhone(p.phone);
});
```

Oddiy funksiya — sxema ichida chaqiriladi. Hech qanday "validator klassi" yoki direktiva kerak emas.

## Kod: maydonlararo qoidalar

```ts
form(this.model, (p) => {
  required(p.password);
  minLength(p.password, 8);

  validate(p.confirm, ({ value, valueOf }) =>
    value() !== valueOf(p.password) ? { kind: 'mismatch', message: 'Parollar mos emas' } : undefined,
  );
});
```

`valueOf(p.password)` — boshqa maydon qiymati, **reaktiv**: parol o'zgarsa, `confirm` xatosi qayta hisoblanadi (tekshirildi).

Xato qaysi maydonda chiqishini tanlang: `validate(p.confirm, ...)` — `confirm` ostida. Bir nechta maydonga tegishli bo'lsa — `validateTree` (50-bob).

## Kod: shartli majburiylik

```ts
required(p.companyName, {
  message: 'Kompaniya nomini kiriting',
  when: ({ valueOf }) => valueOf(p.accountType) === 'business',
});
```

Tekshirildi: shart `false` bo'lganda xato yo'q; `true` bo'lganda `required` xatosi chiqdi. **E'tibor:** `required()` metama'lumoti shart `false` bo'lganda ham `true` qaytardi — `*` belgisini ko'rsatishda buni hisobga oling (shartni o'zingiz ham tekshiring).

## Kod: Zod va Standard Schema

Ma'lumot sxemasi allaqachon Zod'da bo'lsa (backend bilan ulashilgan):

```ts
import { validateStandardSchema } from '@angular/forms/signals';
import { z } from 'zod';

const SignupSchema = z.object({
  email: z.email('Email xato'),
  age: z.number().min(18, "18 yoshdan"),
});

protected readonly form = form(this.model, (p) => {
  validateStandardSchema(p, SignupSchema);
});
```

Tekshirildi (zod 4.6): xatolar tegishli maydonlarga taqsimlandi — `form.age().errors()` → `{ kind: 'standardSchema', message: '18 yoshdan', issue: {...} }`. Standard Schema qo'llaydigan boshqa kutubxonalar (Valibot, ArkType) ham ishlaydi.

## Muhandislik nuqtai nazari

**Client validatsiya — qulaylik, server validatsiya — haqiqat.** Brauzer kodini chetlab o'tish oson. Server baribir tekshiradi; uning xatolarini formaga qaytarish — 51-bob.

**Qachon xatoni ko'rsatish:**

| Vaqt | Tajriba |
| --- | --- |
| Har harfda | Yomon — hali yozib bo'lmagan |
| Maydondan chiqqanda (`touched`) | Yaxshi — standart |
| Faqat yuborishda | Qabul qilinadi, lekin kech |
| Xato tuzatilganda — darhol yo'qolsin | Yaxshi — `invalid()` reaktiv |

**Xabar matni** — nima noto'g'ri va **qanday tuzatish**: "Noto'g'ri" emas, "Telefon +998 bilan boshlansin, 12 raqam".

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Standart xabar kutish | `message` — `undefined`, bo'sh joy | `message` yoki `errorText` xaritasi |
| Faqat `email()` — majburiy deb o'ylash | Bo'sh maydon o'tadi | `required` + `email` |
| Xatoni `touched` siz ko'rsatish | Sahifa ochilishi bilan qizil | `touched() && invalid()` |
| Maydonlararo qoidani `effect` bilan | Murakkab, sinxron emas | `validate` + `valueOf` |
| `when` bilan `required()` metama'lumotiga ishonish | `*` doim ko'rinadi | Shartni ham tekshirish |
| `aria-describedby` yo'q | Ekran o'quvchisi xatoni o'qimaydi | Xato elementi `id` + `aria-describedby` |
| Faqat client validatsiya | Xavfsizlik teshigi | Server ham tekshiradi |

## Amaliyot

1. Ro'yxatdan o'tish formasi: ism (2–50), email, yosh (18+), telefon (`+998...`).
2. `errorText` xaritasini yozing va `FieldErrors` komponentida ishlating.
3. `uzPhone` qayta ishlatiladigan validatorini yozing.
4. Parol + tasdiqlash qoidasi; parolni o'zgartirganda tasdiqlash xatosi yangilanishini tekshiring.
5. "Yuridik shaxs" belgilansa kompaniya nomi majburiy bo'lsin (`when`).
6. Xuddi shu qoidalarni Zod sxemasi bilan yozib, `validateStandardSchema` bilan ulang.

## Rasmiy hujjat

- Validatsiya: <https://angular.dev/guide/forms/signals/validation>
- Maxsus validatorlar: <https://angular.dev/guide/forms/signals/validation#using-validate>
- Standard Schema: <https://standardschema.dev>
