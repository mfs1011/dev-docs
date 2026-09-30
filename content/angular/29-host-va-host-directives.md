# 29 — Host elementi va `hostDirectives`

[← Oldingi: Kontent proyeksiyasi](28-kontent-proyeksiyasi.md) · [Mundarija](README.md) · [Keyingi: Stil, enkapsulatsiya va animatsiya →](30-stil-va-enkapsulatsiya.md)

## Tushuncha

**Host elementi** — komponent selektoriga mos keladigan element. `<app-button>` — `AppButton` komponentining host elementi.

```html
<app-button>              ← host elementi
  <button>...</button>    ← komponent shabloni
</app-button>
```

Komponent o'z shablonini boshqaradi. Host elementiga atribut, klass, hodisa qo'shish uchun — `host` xossasi:

```ts
@Component({
  selector: 'app-button',
  host: {
    'role': 'button',
    '[class.loading]': 'loading()',
    '[attr.aria-busy]': 'loading()',
    '(keydown.enter)': 'activate()',
  },
  template: `<ng-content />`,
})
export class AppButton {
  readonly loading = input(false, { transform: booleanAttribute });

  protected activate() { ... }
}
```

**`hostDirectives`** — boshqa direktivalarning xulqini host elementiga **ulash**. Kompozitsiya vositasi.

## Nega shunday

Komponent ko'pincha host elementining o'zini boshqarishi kerak: ARIA roli, holat klassi, klaviatura. Bular uchun qo'shimcha o'rovchi `<div>` qo'shish — keraksiz DOM daraja va CSS'ni murakkablashtiradi.

`hostDirectives` esa boshqa muammoni hal qiladi: bir xil xulqni (masalan "bosilganda analitika yuborish", "tooltip", "fokus halqasi") ko'p komponentga qo'shish. Meros (`extends`) bilan qilsa — bitta ota klass, qattiq bog'lanish. Direktiva bilan — har bir xulq alohida, istagancha birlashtiriladi.

## Kod: `host` xossasi

| Yozuv | Nima |
| --- | --- |
| `'role': 'button'` | Statik atribut |
| `'[class.active]': 'active()'` | Klass binding |
| `'[style.width.px]': 'width()'` | Stil binding |
| `'[attr.aria-label]': 'label()'` | Atribut binding |
| `'(click)': 'toggle()'` | Hodisa |
| `'(document:keydown.escape)': 'close()'` | Global hodisa |

Qiymatlar — shablon ifodasi, xuddi shablondagidek.

```ts
@Component({
  selector: 'app-tab',
  host: {
    'role': 'tab',
    '[attr.aria-selected]': 'selected()',
    '[attr.tabindex]': 'selected() ? 0 : -1',
    '[class.tab-selected]': 'selected()',
    '(click)': 'select()',
  },
  template: `<ng-content />`,
})
export class Tab {
  readonly selected = input(false);
  readonly activated = output<void>();

  protected select() {
    this.activated.emit();
  }
}
```

> **Ilgari:** `@HostBinding('class.active') get isActive() {...}` va `@HostListener('click') onClick() {...}`. Hali ishlaydi, lekin uslub qo'llanmasi `host` obyektini tavsiya qiladi — barcha host bog'lanishlari bir joyda ko'rinadi.

Angular 22 da `host` ifodalari ham **tip tekshiriladi** (`typeCheckHostBindings` sukut bo'yicha yoqilgan, 3-bob). `'[class.active]': 'actve()'` kabi xato build'ni to'xtatadi.

## Kod: `:host` bilan stil

Host elementini stillash — komponent CSS'ida `:host` (30-bob):

```css
:host {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

:host(.loading) {
  opacity: 0.6;
  pointer-events: none;
}
```

Muhim: maxsus element (`<app-button>`) sukut bo'yicha `display: inline`. Kenglik, padding ishlashi uchun `:host { display: block }` yoki `inline-flex` yozing. `ng g c --display-block` buni o'zi qo'shadi (6-bob).

## Kod: `hostDirectives` — xulqni ulash

Bosilganda analitika yuboradigan direktiva:

```ts
@Directive({
  selector: '[appTrack]',
  host: { '(click)': 'clicked.emit(appTrackName())' },
})
export class Track {
  readonly appTrackName = input('');
  readonly clicked = output<string>();
}
```

Uni komponentga ulash — ichkaridan:

```ts
@Component({
  selector: 'app-btn',
  template: `<button><ng-content /></button>`,
  hostDirectives: [
    {
      directive: Track,
      inputs: ['appTrackName: trackAs'],
      outputs: ['clicked: tracked'],
    },
  ],
})
export class Btn {}
```

```html
<app-btn trackAs="saqlash" (tracked)="log($event)">Saqlash</app-btn>
```

Haqiqiy test natijasi: tugma bosilganda `log` ga `'saqlash'` keldi.

Uchta muhim nuqta:

1. **`Btn` ni ishlatgan odam `Track` ni import qilmaydi** — u komponentning ichki qismi.
2. **Kiritma va chiqishlar sukut bo'yicha yashirin.** `inputs`/`outputs` da sanalganlar ochiladi. `'appTrackName: trackAs'` — tashqi nom boshqacha bo'lishi mumkin.
3. **Direktiva host elementda ishlaydi** — `Track` ning `host` hodisalari `<app-btn>` ga ulanadi.

## Kod: bir nechta xulqni birlashtirish

```ts
@Component({
  selector: 'app-menu-item',
  hostDirectives: [
    { directive: Track, inputs: ['appTrackName: trackAs'] },
    { directive: Tooltip, inputs: ['appTooltip: hint'] },
    FocusRing,                                   // kiritmasiz — shunchaki nomi
  ],
  template: `<ng-content />`,
})
export class MenuItem {}
```

Har xulq alohida yozilgan va test qilingan. `MenuItem` ularni **tanlab** birlashtiradi.

Direktiva ichidan host komponentga murojaat — DI orqali:

```ts
@Directive({ selector: '[appFocusRing]', host: { '[class.focus-ring]': 'visible()' } })
export class FocusRing {
  protected readonly visible = signal(false);
  private readonly el = inject(ElementRef<HTMLElement>);
  // ...
}
```

## Muhandislik nuqtai nazari: kompozitsiya yoki meros

```ts
// ❌ Meros — har komponent bitta ota klassga bog'lanadi
export class TrackedButton extends BaseTracked { ... }
export class TrackedLink extends BaseTracked { ... }
// Endi tooltip ham kerak: BaseTrackedWithTooltip?
```

```ts
// ✅ Kompozitsiya
hostDirectives: [Track, Tooltip]
```

| | Meros (`extends`) | `hostDirectives` |
| --- | --- | --- |
| Nechta xulq | Bitta ota | Istagancha |
| Bog'lanish | Qattiq | Bo'sh |
| Test | Ota bilan birga | Har direktiva alohida |
| Qayta ishlatish | Faqat meros zanjirida | Istalgan komponentda |

Meros hali ham kerak bo'lgan joylar — 33-bobdan keyingi murakkab holatlar, lekin xulq qo'shish uchun `hostDirectives` birinchi tanlov.

Angular Aria (67-bob) va CDK (66-bob) aynan shu naqshga qurilgan: erishimlilik xulqi direktivalar sifatida, siz ularni o'z komponentingizga ulaysiz.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Host uchun qo'shimcha `<div>` o'rovchi | Keraksiz DOM, CSS murakkab | `host` xossasi |
| `:host { display }` yo'q | Kenglik, padding ishlamaydi | `display: block` yoki `inline-flex` |
| `hostDirectives` kiritmasini `inputs` siz ishlatish | Tashqaridan berib bo'lmaydi | `inputs: ['x']` |
| Direktivani ham `hostDirectives` da, ham shablonda qo'llash | Ikki nusxa | Bittasi |
| Xulq qo'shish uchun meros | Qattiq bog'lanish | `hostDirectives` |
| `host` da xato ifoda | Build to'xtaydi (tip tekshiruvi) | To'g'ri nom |
| Yangi kodda `@HostBinding`/`@HostListener` | Eski uslub | `host: {}` |

## Amaliyot

1. `Tab` komponentini `host` bilan yozing: `role`, `aria-selected`, `tabindex`, klass va bosish.
2. `<app-button>` ga `:host { display: inline-flex }` qo'shing; olib tashlab farqni ko'ring.
3. `Track` direktivasini yozing va `Btn` ga `hostDirectives` bilan ulang; `trackAs` va `(tracked)` ishlashini tekshiring.
4. `inputs` ni olib tashlang — `trackAs` berilganda nima bo'lishini ko'ring.
5. `MenuItem` ga ikki-uch xulqni `hostDirectives` bilan birlashtiring.

## Rasmiy hujjat

- Host elementi: <https://angular.dev/guide/components/host-elements>
- Direktiva kompozitsiyasi: <https://angular.dev/guide/directives/directive-composition-api>
