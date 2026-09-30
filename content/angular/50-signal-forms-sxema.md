# 50 — Signal Forms: sxemalar va kesishuvchi mantiq

[← Oldingi: Signal Forms: validatsiya](49-signal-forms-validatsiya.md) · [Mundarija](README.md) · [Keyingi: Signal Forms: yuborish va dinamik formalar →](51-signal-forms-yuborish.md)

## Tushuncha

Sxema funksiyasida faqat validatsiya emas — maydonning **butun xulqi** e'lon qilinadi:

| Qoida | Maydonga ta'siri |
| --- | --- |
| `required`, `email`, `validate`... | Xatolar |
| `disabled(p, fn?)` | O'chirilgan — tahrirlab bo'lmaydi |
| `readonly(p, fn?)` | Faqat o'qish |
| `hidden(p, fn?)` | Yashirin (UI'da ko'rsatmaslik uchun signal) |
| `debounce(p, ms)` | Modelga yozishni kechiktirish |
| `metadata(p, key, fn)` | O'z metama'lumotingiz |

Va sxemalarni **tuzish** vositalari:

| Vosita | Vazifa |
| --- | --- |
| `schema(fn)` | Qayta ishlatiladigan sxema |
| `apply(p, schema)` | Sxemani ichki obyektga qo'llash |
| `applyEach(p, schema)` | Massivning har elementiga |
| `applyWhen(p, cond, schema)` | Shart bajarilganda |
| `applyWhenValue(p, guard, schema)` | Qiymat turiga qarab (tip toraytirish bilan) |
| `validateTree(p, fn)` | Bir nechta maydonga xato tarqatish |

## Nega shunday

Real formalarda qoidalar **bog'liq**: "yetkazib berish tanlansa manzil majburiy", "buyurtma yopilgan bo'lsa hamma narsa o'chirilgan", "har mahsulot qatorida miqdor ≥ 1". Bu mantiqni komponentda `effect` lar bilan yozish — tartibsizlik. Sxemada esa u **deklarativ**: nima qachon qanday bo'lishi bir joyda.

## Kod: `disabled`, `readonly`, `hidden`

```ts
form(this.model, (p) => {
  // Doim o'chirilgan
  disabled(p.id);

  // Shartli, sabab bilan
  disabled(p.total, ({ valueOf }) => valueOf(p.status) === 'paid' ? "To'langan buyurtmani o'zgartirib bo'lmaydi" : false);

  // Faqat o'qish
  readonly(p.createdAt);

  // Shartli yashirish
  hidden(p.companyName, ({ valueOf }) => valueOf(p.accountType) !== 'business');
});
```

Tekshirildi:

| Qoida | DOM | Signal |
| --- | --- | --- |
| `disabled` | `<input disabled>` | `disabled()` → `true`, `disabledReasons()` → `[{ message: '...' }]` |
| `readonly` | `<input readonly>` | `readonly()` → `true` |
| `hidden` | **O'zgarmaydi** | `hidden()` → `true` |

`hidden` DOM'ga tegmaydi — shablonda o'zingiz olib tashlaysiz:

```html
@if (!form.companyName().hidden()) {
  <input [formField]="form.companyName" />
}
```

Sabab xabarini ko'rsatish:

```html
@for (r of form.total().disabledReasons(); track $index) {
  <small>{{ r.message }}</small>
}
```

### Muhim: o'chirilgan maydon validatsiya qilinmaydi

Tekshirildi: `required` + `disabled` / `hidden` / `readonly` maydon bo'sh bo'lsa ham — **xato yo'q**, forma `valid`, `submit` o'tadi. Mantiqan to'g'ri: foydalanuvchi o'zgartira olmaydigan yoki ko'rmaydigan maydon uchun uni jazolab bo'lmaydi.

Lekin: `form().value()` da bu maydonlar **qoladi** (Reactive Forms'dagi `value` dan farqli — u yerda disabled maydonlar tushib qoladi). Serverga yuborishda yashirin maydonlarni o'zingiz olib tashlang, agar kerak bo'lsa.

## Kod: qayta ishlatiladigan sxema

```ts
// address.schema.ts
import { schema, required, maxLength, pattern } from '@angular/forms/signals';

export interface Address {
  region: string;
  city: string;
  street: string;
  zip: string;
}

export const addressSchema = schema<Address>((a) => {
  required(a.region, { message: 'Viloyatni tanlang' });
  required(a.city);
  required(a.street);
  maxLength(a.street, 200);
  pattern(a.zip, /^\d{6}$/, { message: 'Indeks — 6 raqam' });
});
```

```ts
form(this.model, (p) => {
  apply(p.shipping, addressSchema);
  apply(p.billing, addressSchema);
});
```

Bir sxema — ikki joyda. Profil sahifasida, checkout'da, admin panelda — bir xil qoidalar.

## Kod: massiv elementlari

```ts
const lineSchema = schema<OrderLine>((l) => {
  required(l.productId);
  min(l.qty, 1, { message: 'Kamida 1 dona' });
});

form(this.model, (p) => {
  applyEach(p.lines, lineSchema);

  validate(p.lines, ({ value }) =>
    value().length === 0 ? { kind: 'empty', message: "Kamida bitta mahsulot qo'shing" } : undefined,
  );
});
```

`applyEach` — hozirgi va **keyin qo'shiladigan** barcha elementlarga. Massivning o'zi uchun qoida (`length`) — oddiy `validate(p.lines, ...)`.

Inline yozish ham mumkin:

```ts
applyEach(p.tags, (t) => { required(t.label); });
```

## Kod: shartli sxema

```ts
form(this.model, (p) => {
  applyWhen(
    p.shipping,
    ({ valueOf }) => valueOf(p.delivery) === 'courier',
    addressSchema,
  );
});
```

Pickup tanlansa manzil tekshirilmaydi; kuryer tanlansa — `addressSchema` ning barcha qoidalari yoqiladi.

### Qiymat turiga qarab: `applyWhenValue`

Discriminated union — "to'lov usuli karta bo'lsa karta raqami bor":

```ts
type Payment =
  | { method: 'card'; cardNumber: string }
  | { method: 'cash' };

form(this.model, (p) => {
  applyWhenValue(
    p.payment,
    (v): v is Extract<Payment, { method: 'card' }> => v.method === 'card',
    (card) => {
      required(card.cardNumber);                 // tip: toraytirilgan — cardNumber bor
      pattern(card.cardNumber, /^\d{16}$/);
    },
  );
});
```

Tekshirildi: `method: 'cash'` da xato yo'q; `'card'` + bo'sh raqam → `required`. Type guard tufayli `card.cardNumber` TypeScript uchun mavjud.

## Kod: `validateTree` — xatoni kerakli maydonga

```ts
form(this.model, (p) => {
  validateTree(p.dates, ({ value, fieldTreeOf }) =>
    value().from > value().to
      ? { kind: 'range', message: 'Tugash sanasi boshlanishdan keyin bo\'lsin', fieldTree: fieldTreeOf(p.dates.to) }
      : undefined,
  );
});
```

Qoida `dates` obyektida, lekin xato **`to` maydonida** ko'rinadi (tekshirildi: `fieldTree: fieldTreeOf(p.a)` → xato `f.a().errors()` da). Foydalanuvchi qaysi maydonni tuzatishni aniq ko'radi.

## Kod: `debounce`

```ts
form(this.model, (p) => {
  debounce(p.search, 300);
});
```

**Diqqat** (tekshirildi): `debounce` modelga yozishni kechiktiradi — foydalanuvchi yozgandan keyin darhol `model().search` hali eski qiymat. 300 ms tinchlikdan keyin yoziladi. Shu model'ga bog'langan `httpResource` va async validatorlar ham kamroq ishga tushadi — asosiy maqsad shu.

`debounce(p, 'blur')` — faqat maydondan chiqqanda yozish.

## Kod: o'z metama'lumotingiz

```ts
export const HINT = createMetadataKey<string>();

form(this.model, (p) => {
  metadata(p.inn, HINT, () => '9 raqamli soliq to\'lovchi raqami');
});
```

```html
<small>{{ form.inn().metadata(HINT)?.() }}</small>
```

Tekshirildi — `metadata(KEY)` signal qaytaradi. Maslahatlar, placeholder, birlik ("so'm", "kg") — sxemada, shablonda emas.

## Muhandislik nuqtai nazari

**Sxema — domen qoidalari.** `addressSchema`, `passportSchema`, `phoneSchema` — bular UI emas, biznes qoidalari. Ularni `domain/` yoki `entities/` qatlamida saqlang (Feature-Sliced Design'da `entities/address/model`), komponentlar faqat `apply` qilsin.

**Qoidalar tartibi:**

```ts
form(this.model, (p) => {
  // 1. Umumiy sxemalar
  apply(p.customer, customerSchema);
  applyEach(p.lines, lineSchema);

  // 2. Shartli qismlar
  applyWhen(p.shipping, isCourier, addressSchema);

  // 3. Holat (disabled/hidden)
  disabled(p, ({ valueOf }) => valueOf(p.status) === 'closed');

  // 4. Maydonlararo qoidalar
  validateTree(p.dates, dateRange);
});
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `hidden` DOM'dan olib tashlaydi deb kutish | Maydon ko'rinib turadi | `@if (!f.x().hidden())` |
| O'chirilgan maydon qiymati yuborilmaydi deb kutish | Serverga ketadi | Yuborishda o'zingiz filtrlang |
| Bir xil qoidalarni har formada nusxalash | Nomuvofiqlik | `schema` + `apply` |
| Shartli qoidani `effect` bilan | Murakkab, kechikadi | `applyWhen` / `when` |
| Union tipda `applyWhen` | `cardNumber` TS'da yo'q | `applyWhenValue` + type guard |
| `debounce` + model darhol yangilanadi deb kutish | Eski qiymat | `debounce` — yozishni kechiktiradi |
| Xato umumiy obyektda, foydalanuvchi qayerni tuzatishni bilmaydi | Chalkashlik | `validateTree` + `fieldTreeOf` |

## Amaliyot

1. `addressSchema` yozing va `shipping` / `billing` ga qo'llang.
2. "Yetkazib berish: kuryer / olib ketish" — `applyWhen` bilan manzilni shartli tekshiring.
3. Buyurtma qatorlari: `applyEach` + "kamida bitta qator" qoidasi.
4. To'lov usuli union tipini `applyWhenValue` bilan yozing.
5. Buyurtma `closed` bo'lsa butun formani `disabled` qiling va sababini ko'rsating.
6. Sana oralig'i qoidasini `validateTree` bilan `to` maydoniga bog'lang.

## Rasmiy hujjat

- Sxemalar: <https://angular.dev/guide/forms/signals/schemas>
- Maydon holati (disabled, hidden, readonly): <https://angular.dev/guide/forms/signals/field-state-management>
- Metama'lumot: <https://angular.dev/guide/forms/signals/metadata>
