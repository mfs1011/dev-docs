# 51 — Signal Forms: yuborish va dinamik formalar

[← Oldingi: Signal Forms: sxemalar va kesishuvchi mantiq](50-signal-forms-sxema.md) · [Mundarija](README.md) · [Keyingi: Reactive Forms →](52-reactive-forms.md)

## Tushuncha

Bu bob — formaning "oxirgi mili":

| Mavzu | Savol |
| --- | --- |
| **Yuborish** | Yaroqsiz bo'lsa nima? Yuborish davomida? Server xatosi? |
| **Async validatsiya** | "Bu login band emasmi?" — serverdan so'rab |
| **Maxsus kontrollar** | O'z komponentingizni `[formField]` ga ulash |
| **Dinamik formalar** | Maydonlar ro'yxati konfiguratsiyadan |

## Nega shunday

Yuborish — eng ko'p xato qilinadigan joy: ikki marta bosish, yuborish davomida tahrirlash, server xatosini `alert()` bilan ko'rsatish, yaroqsiz formada hech narsa bo'lmasligi. Signal Forms bularning hammasini `submit` ichiga yig'adi.

## Kod: `submission` va `FormRoot`

```ts
@Component({
  imports: [FormField, FormRoot, FieldErrors],
  template: `
    <form [formRoot]="form">
      <input [formField]="form.email" />
      <app-field-errors [field]="form.email" />

      <input type="password" [formField]="form.password" />

      <button [disabled]="form().submitting()">
        {{ form().submitting() ? 'Yuborilmoqda…' : 'Kirish' }}
      </button>
    </form>
  `,
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly model = signal({ email: '', password: '' });

  protected readonly form = form(this.model, (p) => {
    required(p.email);
    email(p.email);
    required(p.password);
  }, {
    submission: {
      action: async (f) => {
        const result = await this.auth.login(f().value());
        if (!result.ok) {
          return { kind: 'server', message: result.message, fieldTree: f.password };
        }
        await this.router.navigate(['/']);
        return undefined;
      },
      onInvalid: (f) => {
        f().errorSummary()[0]?.fieldTree().focusBoundControl();
      },
    },
  });
}
```

Tekshirilgan oqim:

| Holat | Nima bo'ladi |
| --- | --- |
| Yaroqsiz formada submit | `action` **chaqirilmaydi**, `onInvalid` ishlaydi, barcha maydonlar `touched` |
| `onInvalid` da `focusBoundControl()` | Fokus birinchi xatoli input'ga |
| `action` davomida | `submitting()` → `true` |
| `action` xato qaytarsa | Xato ko'rsatilgan maydonning `errors()` ida |
| Foydalanuvchi o'sha maydonni tahrirlasa | Server xatosi **o'zi yo'qoladi** |

Oxirgi nuqta juda qulay: "Parol noto'g'ri" xatosi foydalanuvchi parolni o'zgartira boshlaganda yo'qoladi — qo'lda tozalash kerak emas.

### `submit()` funksiyasi

`FormRoot` siz yoki boshqa joydan:

```ts
import { submit } from '@angular/forms/signals';

protected async save() {
  const ok = await submit(this.form, async (f) => {
    await firstValueFrom(this.api.save(f().value()));
    return undefined;
  });
  if (ok) this.toast.show('Saqlandi');
}
```

Tekshirildi: `action` `undefined` qaytarsa → `true`; xato qaytarsa → `false`; forma yaroqsiz bo'lsa action ishlamaydi → `false`.

### Server validatsiya xatolarini xaritalash

Laravel/Symfony odatda shunday qaytaradi:

```json
{ "errors": { "email": ["Bu email band"], "phone": ["Format noto'g'ri"] } }
```

```ts
function toFormErrors<T>(f: FieldTree<T>, errors: Record<string, string[]>) {
  return Object.entries(errors).flatMap(([key, messages]) =>
    messages.map((message) => ({
      kind: 'server',
      message,
      fieldTree: (f as Record<string, FieldTree<unknown>>)[key] ?? f,
    })),
  );
}

action: async (f) => {
  try {
    await firstValueFrom(this.api.register(f().value()));
    return undefined;
  } catch (e) {
    if (e instanceof HttpErrorResponse && e.status === 422) {
      return toFormErrors(f, e.error.errors);
    }
    return { kind: 'server', message: "Server bilan bog'lanib bo'lmadi", fieldTree: f };
  }
},
```

Noma'lum maydon xatosi — formaning o'ziga (`fieldTree: f`), `form().errors()` da umumiy xabar sifatida ko'rsatiladi.

## Kod: async validatsiya

### `validateHttp`

```ts
form(this.model, (p) => {
  required(p.username);
  debounce(p.username, 300);

  validateHttp(p.username, {
    request: ({ value }) => (value() ? `/api/users/check?username=${encodeURIComponent(value())}` : undefined),
    onSuccess: (res: { taken: boolean }) => (res.taken ? { kind: 'taken', message: 'Bu login band' } : undefined),
    onError: () => ({ kind: 'network', message: 'Tekshirib bo\'lmadi' }),
  });
});
```

Tekshirilgan ketma-ketlik: yozildi → 300 ms kutildi (debounce) → `GET /api/check?u=ali` → `pending()` `true` → javob `{ taken: true }` → `errors()` `[taken]`, `pending()` `false`.

`request` `undefined` qaytarsa — so'rov yuborilmaydi (bo'sh maydon uchun).

```html
<input [formField]="form.username" />
@if (form.username().pending()) { <small>Tekshirilmoqda…</small> }
```

`submission` sukut bo'yicha `pending` validatorlarni **kutmaydi** (`ignoreValidators: 'pending'`) — server baribir tekshiradi. Qat'iy bo'lishi kerak bo'lsa — `ignoreValidators: 'none'`.

### `validateAsync` — ixtiyoriy resource bilan

HTTP bo'lmagan async tekshiruv (masalan, WebSocket yoki xizmat metodi):

```ts
validateAsync(p.promoCode, {
  params: ({ value }) => value() || undefined,
  factory: (params) => resource({
    params,
    loader: ({ params: code }) => this.promo.check(code),
  }),
  onSuccess: (valid) => (valid ? undefined : { kind: 'promo', message: 'Promo-kod yaroqsiz' }),
  onError: () => ({ kind: 'network' }),
});
```

Tekshirildi: `'BAD'` → `pending` → `promo` xatosi; `'OK'` → xato yo'q.

## Kod: maxsus kontrol — `FormValueControl`

O'z komponentingizni `[formField]` ga ulash uchun — `value` nomli `model()`:

```ts
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-rating',
  template: `
    @for (star of stars; track star) {
      <button type="button" [attr.aria-pressed]="star <= value()" [disabled]="disabled()" (click)="value.set(star)">★</button>
    }
  `,
})
export class Rating implements FormValueControl<number> {
  readonly value = model(0);
  readonly disabled = input(false);
  protected readonly stars = [1, 2, 3, 4, 5];
}
```

```html
<app-rating [formField]="form.rating" />
```

Tekshirildi: tugma bosilganda `model().rating` yangilandi, `dirty()` → `true`.

`FormValueControl` ixtiyoriy input'lari — forma holatini qabul qilish uchun: `disabled`, `readonly`, `hidden`, `invalid`, `errors`, `touched`, `required`, `min`, `max`... E'lon qilganingiz avtomatik to'ldiriladi. `ControlValueAccessor` (54-bob) ga nisbatan — bir necha qator.

### Checkbox turidagi kontrol

```ts
@Component({ selector: 'app-switch', ... })
export class Switch implements FormCheckboxControl {
  readonly checked = model(false);
}
```

### Qiymatni o'girish: `transformedValue`

Kontrol ichida xom qiymat (satr) va model qiymati (son) farq qilsa:

```ts
@Component({
  selector: 'app-money-input',
  template: `<input [value]="raw()" (input)="raw.set($any($event.target).value)" /> so'm`,
})
export class MoneyInput implements FormValueControl<number | null> {
  readonly value = model.required<number | null>();

  protected readonly raw = transformedValue(this.value, {
    parse: (text: string) => {
      const clean = text.replace(/\s/g, '');
      if (!clean) return { value: null };
      const n = Number(clean);
      return Number.isNaN(n) ? { error: { kind: 'parse', message: `"${text}" — son emas` } } : { value: n };
    },
    format: (n) => (n === null ? '' : n.toLocaleString('uz-UZ')),
  });
}
```

Tekshirildi: `abc` yozilganda model **o'zgarmadi**, maydonda `parse` xatosi paydo bo'ldi; `7` yozilganda model `7`, xato yo'qoldi.

## Kod: dinamik forma (konfiguratsiyadan)

```ts
interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'checkbox';
  required?: boolean;
}

@Component({
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="form">
      @for (d of defs(); track d.key) {
        <label [for]="d.key">{{ d.label }}</label>
        @switch (d.type) {
          @case ('checkbox') { <input type="checkbox" [id]="d.key" [formField]="bool(d.key)" /> }
          @case ('number') { <input type="number" [id]="d.key" [formField]="num(d.key)" /> }
          @default { <input [id]="d.key" [formField]="text(d.key)" /> }
        }
      }
      <button>Yuborish</button>
    </form>
  `,
})
export class DynamicForm {
  readonly defs = input.required<FieldDef[]>();

  protected readonly model = linkedSignal(() =>
    Object.fromEntries(this.defs().map((d) => [d.key, d.type === 'checkbox' ? false : d.type === 'number' ? null : ''])),
  );

  protected readonly form = form(this.model, (p) => {
    for (const d of this.defs()) {
      if (d.required) required(p[d.key]!);
    }
  });

  protected text(key: string) { return this.form[key] as unknown as FieldTree<string>; }
  protected num(key: string) { return this.form[key] as unknown as FieldTree<number | null>; }
  protected bool(key: string) { return this.form[key] as unknown as FieldTree<boolean>; }
}
```

Uch nozik joy (tekshirildi):

1. **`strictTemplates` native input turini tekshiradi.** `<input type="checkbox">` — `FieldTree<boolean>`, `type="number"` — `string | number | null`, oddiy — `string`. `Record<string, unknown>` model bilan `TS2322: Type 'unknown' is not assignable to type 'boolean'`. Shuning uchun tipli yordamchi metodlar.
2. **`p[key]` — `undefined` bo'lishi mumkin** (`Record` indeksi) → `p[d.key]!`.
3. **Sxema funksiyasi bir marta ishlaydi** — `defs()` o'zgarsa qoidalar qayta qurilmaydi. Konfiguratsiya o'zgaradigan bo'lsa — komponentni qayta yarating (`@for (... track configId)` yoki `@if`).

Dinamik formalar kuchli, lekin **tip xavfsizligi yo'qoladi**. 10 ta forma bo'lsa — har birini oddiy yozish ko'pincha soddaroq. Dinamik — CMS, so'rovnoma konstruktori, admin panel generatori uchun.

## Muhandislik nuqtai nazari

**Yuborish tugmasi:**

| Yondashuv | Muammo |
| --- | --- |
| `[disabled]="form().invalid()"` | Foydalanuvchi **nima** noto'g'riligini bilmaydi — tugma shunchaki ishlamaydi |
| Doim yoqilgan + `onInvalid` fokus | Bosadi → xatolar ko'rinadi → birinchisiga fokus. Yaxshiroq |
| `[disabled]="form().submitting()"` | Ikki marta yuborishdan himoya — **shart** |

**Muvaffaqiyatli yuborishdan keyin** — `form().reset(boshlangich)` yoki sahifadan chiqish. "Saqlandi" xabari + forma hali `dirty` — chalkash.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `submitting` da tugmani o'chirmaslik | Ikki marta yuborish | `[disabled]="form().submitting()"` |
| Server xatosini `alert()` | Qaysi maydon — noma'lum | `action` dan `{ fieldTree }` bilan qaytarish |
| 422 javobni maydonlarga xaritalamaslik | Umumiy "xato" | `toFormErrors` |
| Async validator + `debounce` yo'q | Har harfga so'rov | `debounce(p, 300)` |
| Async validator bo'sh qiymatda | Keraksiz so'rov | `request` → `undefined` |
| `ControlValueAccessor` yangi kontrol uchun | Ko'p boilerplate | `FormValueControl` + `model()` |
| Dinamik formada `$any` hamma joyda | Tip xatolari yashirinadi | Tipli yordamchi metodlar |
| `defs` o'zgarganda qoidalar yangilanadi deb kutish | Eski qoidalar | Komponentni qayta yaratish |

## Amaliyot

1. Login formasi: `submission`, `submitting`, server xatosi paroldagi maydonga.
2. `onInvalid` da birinchi xatoli maydonga fokus bering.
3. Laravel 422 javobini `toFormErrors` bilan maydonlarga taqsimlang.
4. `username` uchun `validateHttp` + `debounce` + "Tekshirilmoqda…" matni.
5. `Rating` va `MoneyInput` maxsus kontrollarini yozib, formaga ulang.
6. JSON konfiguratsiyadan dinamik forma quring; checkbox maydonni `unknown` tip bilan ulab `TS2322` ni ko'ring, keyin tuzating.

## Rasmiy hujjat

- Yuborish: <https://angular.dev/guide/forms/signals/form-submission>
- Async validatsiya: <https://angular.dev/guide/forms/signals/async-operations>
- Maxsus kontrollar: <https://angular.dev/guide/forms/signals/custom-controls>
