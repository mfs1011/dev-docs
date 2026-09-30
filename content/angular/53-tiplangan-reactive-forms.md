# 53 — Qat'iy tiplangan Reactive Forms

[← Oldingi: Reactive Forms](52-reactive-forms.md) · [Mundarija](README.md) · [Keyingi: `ControlValueAccessor` va template-driven →](54-cva-va-template-driven.md)

## Tushuncha

Angular 14 dan Reactive Forms **tiplangan**: `new FormControl('')` — `FormControl<string | null>`, `form.value.email` — `string | null | undefined`. Tiplar forma tuzilmasidan avtomatik chiqariladi.

Bu bob — tiplar nima uchun **shunday** chiqishi va ularni qanday qilib qulay qilish.

## Nega shunday

Uchta sabab tiplarni "kutilganidan kengroq" qiladi:

| Sabab | Tip ta'siri |
| --- | --- |
| `reset()` sukut bo'yicha `null` ga qaytaradi | `T \| null` |
| `form.value` disabled maydonlarni tashlab ketadi | Har maydon `?:` (ixtiyoriy) |
| `FormArray`/`FormRecord` o'lchami dinamik | Massiv/rekord tiplari |

Tekshirildi: `const c = new FormControl(''); c.reset();` → `c.value === null`. Shuning uchun tip `string | null` — TypeScript yolg'on gapirmayapti.

## Kod: `nonNullable`

```ts
const name = new FormControl('', { nonNullable: true });   // FormControl<string>
name.reset();                                               // '' ga qaytadi
```

Tekshirildi: `fb.nonNullable.group({ a: 'x' })` → `reset()` → `a === 'x'` (boshlang'ich qiymat).

Butun forma uchun:

```ts
private readonly fb = inject(NonNullableFormBuilder);

protected readonly form = this.fb.group({
  name: [''],
  age: [0],
  role: ['user' as 'user' | 'admin'],
});
// FormGroup<{ name: FormControl<string>; age: FormControl<number>; role: FormControl<'user' | 'admin'> }>
```

**Qoida:** yangi Reactive formalarda har doim `NonNullableFormBuilder` yoki `nonNullable: true`. `null` haqiqatan ma'noli bo'lgan maydon (masalan, "sana tanlanmagan") — aniq ko'rsating:

```ts
birthDate: this.fb.control<Date | null>(null),
```

## Kod: `value` va `getRawValue` tiplari

```ts
const form = fb.group({ name: [''], email: [''] });

form.value;          // Partial<{ name: string; email: string }>  — har maydon ixtiyoriy
form.getRawValue();  // { name: string; email: string }            — to'liq
```

Nega `value` — `Partial`? Chunki istalgan maydon `disable()` qilinishi mumkin va u `value` dan tushib qoladi (52-bobda tekshirilgan). TypeScript buni oldindan bilmaydi.

Amaliy natija:

```ts
save() {
  const dto: CreateUserDto = this.form.getRawValue();   // ✅ tip mos
  const bad: CreateUserDto = this.form.value;            // ❌ TS xatosi: string | undefined
}
```

## Kod: tipni aniq e'lon qilish

Forma tipini alohida e'lon qilish — boshqa joyda ishlatish (funksiya parametri, xizmat) uchun:

```ts
interface AddressForm {
  city: FormControl<string>;
  street: FormControl<string>;
  zip: FormControl<string | null>;
}

interface UserForm {
  name: FormControl<string>;
  address: FormGroup<AddressForm>;
  tags: FormArray<FormControl<string>>;
}

protected readonly form: FormGroup<UserForm> = this.fb.group({
  name: [''],
  address: this.fb.group({ city: [''], street: [''], zip: this.fb.control<string | null>(null) }),
  tags: this.fb.array<string>([]),
});
```

Yuqoridagi barcha tip da'volari `tsc` bilan tekshirildi (`value` → DTO xatosi, `ControlsOf` da maydon yetishmasa xato, `FormGroup.addControl` noma'lum kalit bilan xato).

Qiymat tipini chiqarish:

```ts
type UserFormValue = ReturnType<FormGroup<UserForm>['getRawValue']>;
// { name: string; address: { city: string; street: string; zip: string | null }; tags: string[] }
```

### Model tipidan forma tipi

Ko'p loyihalarda shunday yordamchi tip yoziladi:

```ts
type ControlsOf<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? FormArray<FormControl<U>>
    : T[K] extends Record<string, unknown>
      ? FormGroup<ControlsOf<T[K]>>
      : FormControl<T[K]>;
};

type ProfileForm = FormGroup<ControlsOf<Profile>>;
```

Bu model va forma tuzilmasini bog'laydi: `Profile` ga maydon qo'shilsa, forma yaratilgan joyda TS xatosi chiqadi. (Signal Forms'da bu muammo yo'q — forma to'g'ridan-to'g'ri modeldan quriladi.)

## Kod: kontrolga murojaat

```ts
this.form.controls.name;                 // FormControl<string> — tipli
this.form.controls.address.controls.city;

this.form.get('name');                   // AbstractControl<string> | null
this.form.get('address.city');           // satr yo'li — tip taxminiy
```

`controls` — **tipli va avtokompletli**. `get('...')` — satr bilan, xato yozilsa `null`. Yangi kodda `controls`.

## Kod: `FormRecord` va dinamik kalitlar

```ts
const flags = new FormRecord<FormControl<boolean>>({});
flags.addControl('darkMode', new FormControl(false, { nonNullable: true }));

flags.value;    // Partial<Record<string, boolean>>
```

`FormGroup` ga oldindan e'lon qilinmagan kontrol qo'shib bo'lmaydi (TS xatosi) — shu uchun `FormRecord`. `FormGroup` da ixtiyoriy kontrollar uchun — `?:` bilan e'lon qilish:

```ts
interface SearchForm {
  query: FormControl<string>;
  advanced?: FormGroup<AdvancedForm>;
}

this.form.addControl('advanced', this.createAdvanced());
this.form.removeControl('advanced');
```

## Kod: tiplanmagan kodni ko'chirish

Eski (v13-) kod `FormControl` ni `any` bilan ishlatadi. `ng update` avtomatik ravishda `UntypedFormControl`, `UntypedFormGroup` ga o'zgartiradi — kod ishlashda davom etadi, lekin tiplarsiz.

Bosqichma-bosqich:

1. `UntypedFormGroup` → `FormGroup` (tiplar avtomatik chiqadi).
2. Kompilyator xatolarini tuzating — ular **haqiqiy** xatolar (masalan, `number` o'rniga `string` yuborilgan).
3. `FormBuilder` → `NonNullableFormBuilder`, `null` tekshiruvlarini olib tashlang.

## Muhandislik nuqtai nazari

Reactive Forms tiplari — **forma tuzilmasini** tasvirlaydi, **biznes modelini** emas. Farq:

| Forma modeli | DTO |
| --- | --- |
| `age: FormControl<number \| null>` — bo'sh bo'lishi mumkin | `age: number` |
| `tags: FormControl<string>` — "a, b, c" | `tags: string[]` |

`getRawValue()` → **o'giruvchi funksiya** → DTO. To'g'ridan-to'g'ri `as CreateUserDto` qilmang — tip tekshiruvini aldaysiz.

```ts
function toDto(v: UserFormValue): CreateUserDto {
  return {
    name: v.name.trim(),
    age: v.age ?? 0,
    tags: v.tags.filter(Boolean),
  };
}
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `new FormControl('')` + `reset()` | `null` — kutilmagan | `nonNullable: true` |
| `form.value` ni DTO ga | `Partial` — TS xatosi yoki `as` bilan yashirish | `getRawValue()` |
| `form.get('adress.city')` (xato yozilgan) | `null`, runtime'da xato | `form.controls.address.controls.city` |
| `as any` bilan tip xatolarini o'chirish | Haqiqiy xatolar yashirinadi | Tipni to'g'rilash |
| `FormGroup` ga yangi kalit `addControl` | TS xatosi | `FormRecord` yoki `?:` bilan e'lon |
| `UntypedFormGroup` ni qoldirish | Tiplar foydasi yo'q | Bosqichma-bosqich ko'chirish |

## Amaliyot

1. `new FormControl('')` va `new FormControl('', { nonNullable: true })` ni `reset()` bilan solishtiring.
2. `NonNullableFormBuilder` bilan forma yozing va sichqonchani `form` ustiga olib, chiqarilgan tipni ko'ring.
3. `form.value` ni `CreateUserDto` ga berib TS xatosini ko'ring; `getRawValue()` bilan tuzating.
4. `ControlsOf<T>` yordamchi tipini yozing va `Profile` ga maydon qo'shib, xatoni kuzating.
5. `toDto` o'giruvchisini yozing.
6. Eski `UntypedFormGroup` li faylni tiplangan versiyaga o'tkazing.

## Rasmiy hujjat

- Tiplangan formalar: <https://angular.dev/guide/forms/typed-forms>
- `NonNullableFormBuilder`: <https://angular.dev/api/forms/NonNullableFormBuilder>
