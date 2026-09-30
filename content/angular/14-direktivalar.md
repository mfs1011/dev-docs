# 14 — Direktivalar

[← Oldingi: Quvurlar (pipes)](13-pipes.md) · [Mundarija](README.md) · [Keyingi: ng-template, ng-container, @let →](15-ng-template-va-let.md)

## Tushuncha

Direktiva — mavjud elementga **xulq qo'shadigan** klass. Komponentdan farqi: o'z shabloni yo'q.

```html
<p appHighlight="pink">Belgilangan matn</p>
<input appAutofocus>
<button appConfirm="O'chirishga ishonchingiz komilmi?" (confirmed)="remove()">O'chirish</button>
```

| | Komponent | Direktiva |
| --- | --- | --- |
| Shablon | Bor | Yo'q |
| Selektor odatda | Element: `app-user-card` | Atribut: `[appHighlight]` |
| Nima uchun | Ekranning bir qismini chizish | Mavjud elementga xulq qo'shish |

Aslida komponent — shablonli direktiva.

Ikki tur bor:

| Tur | Nima qiladi | Misol |
| --- | --- | --- |
| **Atribut** direktivasi | Element ko'rinishi yoki xulqini o'zgartiradi | `appHighlight`, `appAutofocus`, `appTooltip` |
| **Strukturaviy** direktiva | Elementni DOM'ga qo'shadi yoki olib tashlaydi | `*appIfRole` |

## Nega shunday

Bir xil xulq ko'p elementda kerak bo'ladi: "tashqarini bosganda yopilsin", "sahifa ochilganda fokus olsin", "ko'rinishga kirganda animatsiya bo'lsin". Buni har komponentda qayta yozish o'rniga — bitta direktiva, istalgan elementga biriktiriladi.

Direktiva **kompozitsiya** vositasi: element o'zi nima ekanini biladi (tugma, input), direktiva unga qo'shimcha qobiliyat beradi.

## Kod: atribut direktivasi

```bash
ng g directive highlight
```

Angular 22 yaratadi `highlight.ts`:

```ts
import { Directive } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
})
export class Highlight {}
```

To'ldiramiz — `host` bilan (element atributlari, klasslari, hodisalari):

```ts
import { Directive, input, signal } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '[style.background-color]': 'appHighlight() || "yellow"',
    '[class.hovered]': 'hovered()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
export class Highlight {
  readonly appHighlight = input('');
  protected readonly hovered = signal(false);
}
```

```html
<p appHighlight="pink">Pushti fon</p>
<p appHighlight>Sariq fon (sukut)</p>
```

Haqiqiy test natijasi: birinchisida `background-color: pink`, ikkinchisida `yellow`.

Kiritma nomi **selektor bilan bir xil** (`appHighlight`) — shuning uchun `appHighlight="pink"` bir vaqtda direktivani qo'llaydi va qiymat beradi.

> **Ilgari:** `@HostBinding('style.backgroundColor')` va `@HostListener('mouseenter')` dekoratorlari, `ElementRef` bilan to'g'ridan-to'g'ri DOM. Hali ishlaydi, lekin uslub qo'llanmasi `host` obyektini tavsiya qiladi — barcha bog'lanishlar bir joyda ko'rinadi.

## Kod: amaliy direktivalar

**Avtomatik fokus:**

```ts
import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({ selector: '[appAutofocus]' })
export class Autofocus {
  constructor() {
    const el = inject(ElementRef<HTMLElement>);

    // Element DOM'da paydo bo'lgandan keyin
    afterNextRender(() => el.nativeElement.focus());
  }
}
```

```html
<input appAutofocus placeholder="Qidirish">
```

`afterNextRender` — brauzerda, element chizilgandan keyin bir marta. Serverda (SSR) ishlamaydi — bu yaxshi, serverda `focus()` yo'q (32-bob).

**Tashqarini bosganda:**

```ts
import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickOutside]',
  host: { '(document:click)': 'check($event)' },
})
export class ClickOutside {
  readonly appClickOutside = output<void>();
  private readonly el = inject(ElementRef<HTMLElement>);

  protected check(event: PointerEvent) {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.appClickOutside.emit();
    }
  }
}
```

```html
<div class="dropdown" (appClickOutside)="close()">...</div>
```

Chiqish nomi ham selektor bilan bir xil — `(appClickOutside)="..."` bitta atribut bilan ham qo'llaydi, ham tinglaydi.

Ishlatish uchun — komponentning `imports` iga:

```ts
@Component({
  imports: [Highlight, Autofocus, ClickOutside],
  ...
})
```

## Kod: strukturaviy direktiva

Elementni shartga qarab chiqarish — `@if` o'rniga o'z qoidangiz bilan. Signal va `effect` bilan (Angular 22 da test bilan tekshirildi):

```ts
import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

interface RoleContext {
  $implicit: string;
}

@Directive({ selector: '[appIfRole]' })
export class IfRole {
  readonly appIfRole = input.required<string>();          // kerakli rol
  readonly appIfRoleCurrent = input.required<string>();   // joriy rol

  private readonly template = inject(TemplateRef<RoleContext>);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      this.container.clear();

      if (this.appIfRole() === this.appIfRoleCurrent()) {
        this.container.createEmbeddedView(this.template, { $implicit: this.appIfRole() });
      }
    });
  }

  // Shablonda `let r` ning tipini kompilyatorga aytadi
  static ngTemplateContextGuard(_dir: IfRole, ctx: unknown): ctx is RoleContext {
    return true;
  }
}
```

```html
<div *appIfRole="'admin'; current: role(); let r">
  Admin paneli ({{ r }})
</div>
```

Yulduzcha `*` — qisqa yozuv (mikrosintaksis). Angular uni shunday ochadi:

```html
<ng-template [appIfRole]="'admin'" [appIfRoleCurrent]="role()" let-r>
  <div>Admin paneli ({{ r }})</div>
</ng-template>
```

| Mikrosintaksisda | Nimaga aylanadi |
| --- | --- |
| `'admin'` (birinchi ifoda) | `appIfRole` kiritmasi |
| `current: role()` | `appIfRoleCurrent` kiritmasi (prefiks + nom) |
| `let r` | Kontekstdagi `$implicit` |

Qanday ishlaydi:

| Qism | Vazifasi |
| --- | --- |
| `TemplateRef` | `<ng-template>` ichidagi "chizilmagan" shablon |
| `ViewContainerRef` | Shablonni qayerga chizish mumkin bo'lgan joy |
| `createEmbeddedView` | Shablonni chizish |
| `clear()` | Chizilganini olib tashlash |
| `effect` | Signal o'zgarsa — qayta qaror qilish |

**Muhim ogohlantirish:** bu direktiva **UI** uchun. U admin panelni yashiradi, lekin ma'lumotni himoya qilmaydi. Haqiqiy ruxsat — serverda (59-bob).

## Kod: o'rnatilgan direktivalar

| Direktiva | Holati | Bugun nima ishlatiladi |
| --- | --- | --- |
| `NgIf` (`*ngIf`) | **Eskirgan** (20.0 dan) | `@if` |
| `NgForOf` (`*ngFor`) | **Eskirgan** (20.0 dan) | `@for` |
| `NgSwitch` | **Eskirgan** (20.0 dan) | `@switch` |
| `NgClass` | Eskirmagan | `[class]` binding afzal |
| `NgStyle` | Eskirmagan | `[style]` binding afzal |
| `NgTemplateOutlet` | Faol | 15-bob |
| `NgComponentOutlet` | Faol | 33-bob |

`NgClass` va `NgStyle` ni avtomatik almashtirish:

```bash
ng g @angular/core:ngclass-to-class-migration
ng g @angular/core:ngstyle-to-style-migration
```

## Muhandislik nuqtai nazari: direktiva, komponent yoki funksiya

| Ehtiyoj | Tanlov |
| --- | --- |
| Elementga xulq qo'shish (fokus, klik, tooltip) | Atribut direktivasi |
| O'z qoidasi bilan DOM'ga qo'shish/olib tashlash | Strukturaviy direktiva (kamdan-kam) |
| Shablonli qayta ishlatiladigan bo'lak | Komponent |
| Bir nechta direktiva xulqini bitta komponentga ulash | `hostDirectives` (29-bob) |
| Faqat mantiq, DOM yo'q | Oddiy funksiya yoki xizmat |

Strukturaviy direktivani o'zingiz yozishingiz kam uchraydi — `@if`, `@for`, `@switch` ko'p holatni qoplaydi. Rol, xususiyat bayrog'i (feature flag), ruxsat kabi takrorlanuvchi shartlar uchun foydali.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Direktivani `imports` ga qo'shmaslik | Statik atributda jim ishlamaydi, binding'da NG8002 | `imports: [Highlight]` |
| `ElementRef.nativeElement.style` ni to'g'ridan-to'g'ri | SSR'da xato, Angular bilmaydi | `host: { '[style.x]': ... }` |
| Konstruktorda `focus()` | Element hali DOM'da yo'q | `afterNextRender` |
| Strukturaviy direktivada `clear()` yo'q | Har o'zgarishda nusxa ko'payadi | Avval `clear()` |
| `ngTemplateContextGuard` yo'q | `let r` tipi `any` | Qo'shing |
| Direktiva bilan xavfsizlikni ta'minlash | UI yashirinadi, API ochiq | Server tekshiruvi |
| Yangi kodda `*ngIf`, `*ngFor` | Eskirgan (20.0) | `@if`, `@for` |

**Birinchi qator** ayniqsa yashirin. Angular 22 da tekshirildi:

| Direktiva import qilinmagan, shablonda | Natija |
| --- | --- |
| `<p appHighlight="pink">` — statik atribut | **Xato yo'q.** `appHighlight` oddiy HTML atributi bo'lib qoladi, direktiva jimgina ishlamaydi |
| `<p [appHighlight]="color()">` — binding | `NG8002: Can't bind to 'appHighlight' since it isn't a known property of 'p'` |

Komponentni unutsangiz kompilyator NG8001 bilan to'xtatadi. Atribut direktivani statik qiymat bilan ishlatib, importni unutsangiz — hech kim ogohlantirmaydi. Direktiva "ishlamayapti" deb tuyulsa — birinchi navbatda `imports` ni tekshiring.

## Amaliyot

1. `Highlight` direktivasini yozing: rang kiritmasi, hover holati `host` orqali.
2. `Autofocus` ni yozing va modal ichidagi inputga qo'llang.
3. `ClickOutside` bilan ochiladigan menyu yasang.
4. `Highlight` ni `imports` dan olib tashlang — xato chiqmasligini va rang yo'qolishini kuzating.
5. `*appIfRole` strukturaviy direktivasini yozing; tugma bilan rolni almashtirib, reaktivligini tekshiring.
6. Eski `[ngClass]` li komponentga `ngclass-to-class-migration` ni qo'llang.

## Rasmiy hujjat

- Direktivalar: <https://angular.dev/guide/directives>
- Atribut direktivalari: <https://angular.dev/guide/directives/attribute-directives>
- Strukturaviy direktivalar: <https://angular.dev/guide/directives/structural-directives>
- Host elementi: <https://angular.dev/guide/components/host-elements>
