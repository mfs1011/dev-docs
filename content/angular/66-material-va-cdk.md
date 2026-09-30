# 66 — Angular Material va CDK

[← Oldingi: Prerendering va deploy](65-prerender-va-deploy.md) · [Mundarija](README.md) · [Keyingi: Angular Aria →](67-angular-aria.md)

## Tushuncha

Angular jamoasi uchta UI paketi chiqaradi (hammasi 22.2.x):

| Paket | Nima | Qachon |
| --- | --- | --- |
| `@angular/material` | Tayyor, **stillangan** komponentlar (Material Design 3) | Admin panel, ichki tizim, tez prototip |
| `@angular/cdk` | Stilsiz **xulq-atvor** vositalari: overlay, dialog, drag-drop, virtual scroll, a11y | O'z dizayn tizimingiz |
| `@angular/aria` | Stilsiz, erishimli **komponent primitivlari** (tabs, menu, listbox) | 67-bob |

Material CDK ustiga qurilgan. CDK — Material'siz ham to'liq ishlatiladi.

```bash
ng add @angular/material     # material + cdk, tema, shriftlar
npm i @angular/cdk           # faqat CDK
```

## Nega shunday

Dialog, dropdown, tooltip — "oddiy" ko'rinadi, lekin to'g'ri qilish qiyin: fokus tuzog'i, Escape, scroll bloklash, ekran chetida joylashuv, ekran o'quvchilari, RTL. CDK bularni bir marta, to'g'ri qiladi. O'zingiz yozgan modal deyarli har doim erishimlilikda kamchilikka ega (33-bob).

## Kod: Material komponentlari

```ts
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  imports: [MatButton, MatFormField, MatLabel, MatError, MatInput, ReactiveFormsModule],
  template: `
    <mat-form-field>
      <mat-label>Email</mat-label>
      <input matInput [formControl]="email" />
      @if (email.hasError('email')) { <mat-error>Email noto'g'ri</mat-error> }
    </mat-form-field>

    <button matButton="filled" (click)="save()">Saqlash</button>
    <button matButton="outlined">Bekor qilish</button>
  `,
})
export class Profile { ... }
```

Tugma — `matButton` atributi bilan (tekshirildi — `.d.ts`): ko'rinishi `'text' | 'filled' | 'elevated' | 'outlined' | 'tonal'`. Eski `mat-raised-button`, `mat-flat-button` selektorlari hali ishlaydi.

Har komponent alohida import — standalone, tree-shaking: faqat ishlatilgan komponent bundle'ga tushadi.

`mat-form-field` + `matInput` — Reactive Forms, template-driven va **Signal Forms** bilan ishlaydi. Tekshirildi — `<input matInput [formField]="f.name" />` + `required(p.name)`: input'ga native `required` qo'yildi, blur'dan keyin `mat-form-field` xato holatiga o'tdi (`.mat-form-field-invalid`), yozilgan qiymat modelga tushdi. `[formField]` Material uchun `NgControl` moslik qatlamini beradi (54-bob).

## Kod: tema (Material 3)

```scss
// styles.scss
@use '@angular/material' as mat;

html {
  color-scheme: light dark;
  @include mat.theme((
    color: (primary: mat.$azure-palette, tertiary: mat.$blue-palette),
    typography: Roboto,
    density: 0,
  ));
}

body {
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}
```

Tekshirildi — build natijasi:

```css
--mat-sys-primary: light-dark(#005cbb, #abc7ff);
```

`mat.theme` **CSS o'zgaruvchilar** chiqaradi (`--mat-sys-*`), `light-dark()` bilan: `color-scheme: light dark` bo'lsa, tizim temasiga qarab avtomatik. Faqat yorug' — `color-scheme: light`. Qo'lda almashtirish:

```css
html.dark { color-scheme: dark; }
```

O'z komponentlaringizda ham shu o'zgaruvchilar:

```css
.card {
  background: var(--mat-sys-surface-container);
  border-radius: var(--mat-sys-corner-medium);
  color: var(--mat-sys-on-surface);
}
```

Brend rangi palitralarda yo'q bo'lsa: `ng generate @angular/material:theme-color` — o'z palitrangizni generatsiya qiladi.

### Nuqtaviy o'zgartirish

```scss
.danger-button {
  @include mat.button-overrides((filled-container-color: #c3002f));
}
```

Har komponentning `*-overrides` mixin'i bor — `::ng-deep` bilan ichki klasslarni bosib o'tish o'rniga (30-bob). Ichki klass nomlari versiyalar orasida o'zgaradi, token nomlari — barqaror.

## Kod: CDK Dialog

```ts
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
  template: `
    <h2 id="confirm-title">{{ data.title }}</h2>
    <p>{{ data.message }}</p>
    <button (click)="ref.close(false)">Yo'q</button>
    <button (click)="ref.close(true)">Ha</button>
  `,
})
export class ConfirmDialog {
  protected readonly data = inject<{ title: string; message: string }>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}
```

```ts
@Service()
export class Confirm {
  private readonly dialog = inject(Dialog);

  ask(title: string, message: string): Promise<boolean> {
    const ref = this.dialog.open<boolean>(ConfirmDialog, {
      data: { title, message },
      ariaLabelledBy: 'confirm-title',
    });
    return firstValueFrom(ref.closed).then((r) => r === true);
  }
}
```

```ts
if (await this.confirm.ask("O'chirish", 'Buyurtma o\'chirilsinmi?')) { ... }
```

Tekshirildi:

| Harakat | Natija |
| --- | --- |
| `open(...)` | Kontent `.cdk-overlay-container` ichida, `role="dialog"` |
| Ochilganda | Fokus dialog ichiga ko'chdi |
| `ref.close(true)` | `closed` → `true` |
| Escape | Yopildi, `closed` → `undefined` |

`aria-modal` sukut bo'yicha `false` — CDK hujjatiga ko'ra dialog ochilganda tashqi kontent `aria-hidden` qilinadi, shuning uchun `aria-modal` ortiqcha va `mat-select` kabi overlay'lar bilan to'qnashishi mumkin. Escape natijasi `undefined` — shuning uchun `r === true` tekshiruvi.

Material versiyasi — `MatDialog` (xuddi shu API + Material stillari, `mat-dialog-title`, `mat-dialog-content`, `[mat-dialog-close]`): tekshirildi, `[mat-dialog-close]="'ok'"` → `afterClosed()` → `'ok'`.

## Kod: boshqa CDK vositalari

| Modul | Vazifa | Misol |
| --- | --- | --- |
| `@angular/cdk/overlay` | Istalgan joyda suzuvchi panel | Dropdown, tooltip, popover |
| `@angular/cdk/a11y` | `FocusTrap`, `LiveAnnouncer`, `FocusMonitor`, `ListKeyManager` | Ekran o'quvchiga xabar |
| `@angular/cdk/drag-drop` | Sudrab tashlash, ro'yxatni tartiblash | Kanban |
| `@angular/cdk/scrolling` | Virtual scroll | 10 000 qatorli ro'yxat |
| `@angular/cdk/layout` | `BreakpointObserver` | Mobil/desktop |
| `@angular/cdk/clipboard` | Nusxalash | "Havolani nusxalash" |
| `@angular/cdk/table` | Stilsiz jadval | O'z dizayningizdagi jadval |

Virtual scroll:

```html
<cdk-virtual-scroll-viewport itemSize="48" class="list">
  <div *cdkVirtualFor="let order of orders(); trackBy: byId" class="row">{{ order.number }}</div>
</cdk-virtual-scroll-viewport>
```

Faqat ko'rinadigan ~20 qator DOM'da — 10 000 element uchun ham tez.

`LiveAnnouncer` — ko'rinmas o'zgarishlarni ekran o'quvchiga aytish:

```ts
inject(LiveAnnouncer).announce('Savatga qo\'shildi');
```

## Muhandislik nuqtai nazari

| Vaziyat | Tanlov |
| --- | --- |
| Ichki tizim, dizayner yo'q | Material — tez va izchil |
| Brend dizayn tizimi (Figma'dan) | CDK + Aria + o'z CSS'ingiz |
| Material, lekin brend ranglari | Material + `mat.theme` + `*-overrides` |
| Bitta murakkab vidjet (dialog, virtual scroll) | Faqat CDK moduli |

**Material'ni "juda boshqacha" ko'rinishga majburlamang.** `::ng-deep` bilan qayta stillash — har yangilanishda buziladi. Dizayn Material'dan uzoq bo'lsa — CDK/Aria to'g'ri tanlov.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| O'z modal/dropdown'ingiz | Fokus, Escape, ARIA kamchiliklari | CDK Dialog / Overlay |
| Material ichki klasslarini `::ng-deep` bilan | Yangilanishda buziladi | `mat.*-overrides` tokenlari |
| Rang HEX kodlari komponentlarda | Dark mode ishlamaydi | `var(--mat-sys-*)` |
| `color-scheme` yo'q | `light-dark()` doim yorug' | `color-scheme: light dark` |
| Dialog natijasini `if (r)` bilan, `undefined` ni hisobga olmay | — (xavfsiz), lekin `false`/`undefined` farqi yo'qoladi | `r === true` aniq |
| Katta ro'yxat oddiy `@for` bilan | Sekin scroll | `cdk-virtual-scroll-viewport` |
| Butun `MatModule` ro'yxatini import | Bundle katta | Faqat kerakli komponentlar |

## Amaliyot

1. `ng add @angular/material` — tema faylini va `index.html` o'zgarishlarini ko'ring.
2. `mat.theme` bilan o'z palitrangiz; tizim temasini almashtirib, dark mode'ni tekshiring.
3. `Confirm` xizmatini CDK Dialog bilan yozing; Escape va tugmalar natijasini sinang.
4. Xavfli tugma uchun `mat.button-overrides`.
5. 10 000 buyurtmani `cdk-virtual-scroll-viewport` bilan ko'rsating; DevTools'da DOM tugunlari sonini solishtiring.
6. "Savatga qo'shildi" ni `LiveAnnouncer` bilan; VoiceOver/NVDA bilan eshiting.

## Rasmiy hujjat

- Angular Material: <https://material.angular.dev>
- Tema: <https://material.angular.dev/guide/theming>
- CDK: <https://material.angular.dev/cdk/categories>
