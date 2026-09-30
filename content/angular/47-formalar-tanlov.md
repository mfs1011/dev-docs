# 47 — Uch yondashuv: qaysi birini tanlash

[← Oldingi: Title, scroll va 404](46-title-scroll-404.md) · [Mundarija](README.md) · [Keyingi: Signal Forms: model va maydonlar →](48-signal-forms-model.md)

## Tushuncha

Angular 22 da formalar uchun uchta API bor:

| API | Paket | Holat | Qachon paydo bo'lgan |
| --- | --- | --- | --- |
| **Signal Forms** | `@angular/forms/signals` | Stabil (22.0) | 21 da eksperimental, 22 da stabil |
| **Reactive Forms** | `@angular/forms` (`ReactiveFormsModule`) | Stabil, qo'llab-quvvatlanadi | Angular 2 |
| **Template-driven** | `@angular/forms` (`FormsModule`, `ngModel`) | Stabil, qo'llab-quvvatlanadi | Angular 2 |

Uchalasi ham ishlaydi, uchalasi ham "to'g'ri". Farq — **holat qayerda yashaydi** va **qanday kuzatiladi**.

## Nega shunday

### Template-driven: holat shablonda

```html
<input name="email" [(ngModel)]="email" required email />
```

Oddiy, lekin qoidalar HTML atributlarida tarqalgan, forma tuzilmasi shablondan **asinxron** yig'iladi. Katta formada test qilish va tushunish qiyin.

### Reactive Forms: holat `FormGroup` obyektida

```ts
readonly form = new FormGroup({
  email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
});
```

Qoidalar kodda, lekin model **ikki joyda**: sizning ma'lumotingiz va `FormGroup` ichidagi nusxa. O'zgarishlar — `valueChanges` Observable orqali. Signal dunyosi bilan ko'prik kerak (`toSignal`).

### Signal Forms: holat sizning signalingizda

```ts
readonly model = signal({ email: '' });
readonly form = form(this.model, (p) => {
  required(p.email);
  email(p.email);
});
```

Model — **bitta**, sizning `signal` ingiz. Forma — uning ustidagi "ko'rinish": validatsiya, touched, dirty. Hammasi signal — `computed`, `effect`, shablon to'g'ridan-to'g'ri ishlaydi.

## Kod: bir xil forma — uch usulda

Ro'yxatdan o'tish: email (majburiy, email formati), parol (kamida 8 belgi).

**Signal Forms:**

```ts
import { form, FormField, FormRoot, required, email, minLength } from '@angular/forms/signals';

@Component({
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="form">
      <input type="email" [formField]="form.email" />
      <input type="password" [formField]="form.password" />
      <button [disabled]="form().invalid()">Yuborish</button>
    </form>
  `,
})
export class Signup {
  protected readonly model = signal({ email: '', password: '' });
  protected readonly form = form(this.model, (p) => {
    required(p.email);
    email(p.email);
    minLength(p.password, 8);
  }, {
    submission: { action: async (f) => { await this.api.signup(f().value()); } },
  });
}
```

**Reactive Forms:**

```ts
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()">
      <input type="email" formControlName="email" />
      <input type="password" formControlName="password" />
      <button [disabled]="form.invalid">Yuborish</button>
    </form>
  `,
})
export class Signup {
  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.minLength(8)] }),
  });

  protected save() {
    if (this.form.invalid) return;
    this.api.signup(this.form.getRawValue());
  }
}
```

**Template-driven:**

```ts
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  template: `
    <form #f="ngForm" (ngSubmit)="save(f)">
      <input type="email" name="email" [(ngModel)]="email" required email />
      <input type="password" name="password" [(ngModel)]="password" minlength="8" />
      <button [disabled]="f.invalid">Yuborish</button>
    </form>
  `,
})
export class Signup {
  protected email = '';
  protected password = '';
}
```

## Kod: solishtirish

| Mezon | Signal Forms | Reactive | Template-driven |
| --- | --- | --- | --- |
| Model manbai | Sizning `signal` | `FormGroup` ichida | Komponent maydonlari |
| Reaktivlik | Signal | Observable (`valueChanges`) | Change detection |
| Tiplar | Modeldan avtomatik | Qat'iy (14+ dan) | Yo'q |
| Validatsiya | Sxema funksiyasida | Validator massivlari | HTML atributlari |
| Maydonlararo qoidalar | `valueOf(p.x)` — oddiy | Guruh validatori | Direktiva yozish kerak |
| Shartli qoidalar | `applyWhen`, `disabled(p, fn)` | Qo'lda `enable()`/`disable()` | Qiyin |
| Async validatsiya | `validateHttp`, `validateAsync` | `AsyncValidatorFn` | Direktiva |
| Maxsus kontrol | `FormValueControl` (`model()`) | `ControlValueAccessor` | `ControlValueAccessor` |
| Zoneless / OnPush bilan | Tabiiy | Ishlaydi, `markForCheck` ba'zan | Ishlaydi |
| Ekotizim (kutubxonalar) | Yangi, o'smoqda | Juda katta | Katta |

## Muhandislik nuqtai nazari: qaror

```
Yangi forma yozyapsizmi?
├── Ha ─────────────────────────────────► Signal Forms
└── Yo'q, mavjud kod
    ├── Reactive Forms, ishlayapti ─────► Qoldiring; yangi formalarni Signal Forms'da
    ├── Template-driven, oddiy ─────────► Qoldiring
    └── Template-driven, murakkablashgan ► Signal Forms'ga ko'chiring
```

Qo'shimcha omillar:

- **Kutubxona Reactive Forms talab qilsa** (masalan, eski UI kit `formControlName` bilan ishlaydi) — o'sha joyda Reactive. Ko'prik uchun `@angular/forms/signals/compat` bor (54-bob).
- **Bitta loyihada uchalasi** — texnik jihatdan mumkin, lekin jamoaga og'ir. Yangi kod uchun bitta standart tanlang.
- **Juda oddiy forma** (bitta qidiruv maydoni) — forma API'si umuman shart emas: `signal` + `(input)` yetadi.

Keyingi to'rt bob — Signal Forms (asosiy yo'l). 52–53 — Reactive Forms (mavjud kodni tushunish va saqlash uchun). 54 — maxsus kontrollar va template-driven.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Bitta formada `ngModel` va `formControlName` aralash | Ikki manba, kutilmagan xulq | Bitta API |
| Yangi loyihada eski odat bilan Reactive | Signal dunyosi bilan ko'prik kodi | Signal Forms |
| Ishlayotgan Reactive formalarni "yangilash uchun" qayta yozish | Xavf, foyda kam | Faqat o'zgarayotgan formalarni |
| Signal Forms'ni eski maqolalardan o'rganish | v21 eksperimental API — direktiva va funksiya nomlari boshqacha bo'lgan | v22: `[formField]`, `FormRoot`, `@angular/forms/signals` |
| Oddiy qidiruv uchun to'liq forma | Keraksiz murakkablik | `signal` + `(input)` |

## Amaliyot

1. Yuqoridagi ro'yxatdan o'tish formasini uchala usulda yozing.
2. Har birida "parol va tasdiqlash mos kelsin" qoidasini qo'shing — qaysi biri eng oson?
3. Har birida `email` qiymatini sahifada "jonli" chiqaring (`{{ ... }}`) — qanday farq bor?
4. Loyihangizdagi formalarni sanang: qaysi API'da, qaysilari ko'chirishga arziydi?

## Rasmiy hujjat

- Formalarga kirish: <https://angular.dev/guide/forms>
- Signal Forms: <https://angular.dev/guide/forms/signals/overview>
- Reactive Forms: <https://angular.dev/guide/forms/reactive-forms>
