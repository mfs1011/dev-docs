# 15 — `ng-template`, `ng-container`, `@let`

[← Oldingi: Direktivalar](14-direktivalar.md) · [Mundarija](README.md) · [Keyingi: Signal nima →](16-signal-asoslari.md)

## Tushuncha

Shablon bilan ishlashning to'rtta yordamchi vositasi:

| Vosita | Nima |
| --- | --- |
| `#ref` | Shablon havolasi — elementga nom berish |
| `<ng-container>` | DOM'da **ko'rinmaydigan** guruhlovchi |
| `<ng-template>` | **Chizilmagan** shablon bo'lagi — keyinroq ishlatish uchun |
| `@let` | Shablonda lokal o'zgaruvchi |

Ularning umumiy maqsadi — shablonni toza va takrorlanmas qilish.

## Nega shunday

HTML'da "ko'rinmaydigan o'rovchi" yoki "bu qismni hozir emas, keyin chiz" degan tushuncha yo'q. `<div>` bilan o'rasangiz — keraksiz element qo'shiladi, CSS (flex, grid) buziladi. Angular bu bo'shliqni o'z elementlari bilan to'ldiradi — ular yakuniy DOM'da **qolmaydi**.

## Kod: shablon havolasi `#ref`

Elementga nom berib, shablonning boshqa joyidan murojaat qilish:

```html
<input #search type="search" placeholder="Qidirish">
<button type="button" (click)="find(search.value)">Topish</button>
<button type="button" (click)="search.value = ''; search.focus()">Tozalash</button>
```

`search` — `HTMLInputElement`, tipi aniq. `$event` va `as HTMLInputElement` kerak emas (9-bob).

Komponentga havola — uning **ommaviy** metodlari va maydonlariga:

```html
<app-video-player #player [src]="video()" />
<button type="button" (click)="player.play()">▶</button>
```

Klass kodidan havolaga murojaat — `viewChild('search')` (27-bob).

## Kod: `<ng-container>`

Ko'rinmaydigan o'rovchi — DOM'ga hech narsa qo'shmaydi:

```html
<!-- ❌ jadval buziladi: <tr> ichida <div> bo'lishi mumkin emas -->
<tr>
  <div>
    <td>{{ a }}</td>
    <td>{{ b }}</td>
  </div>
</tr>

<!-- ✅ -->
<tr>
  <ng-container>
    <td>{{ a }}</td>
    <td>{{ b }}</td>
  </ng-container>
</tr>
```

Zamonaviy Angular'da `@if`/`@for` o'z-o'zidan DOM element qo'shmaydi, shuning uchun `ng-container` kamroq kerak. Hozir asosiy ishlatilishi — direktivani o'rovchisiz qo'llash:

```html
<ng-container *ngTemplateOutlet="row; context: { $implicit: item }" />
```

## Kod: `<ng-template>`

Chizilmagan shablon. O'z-o'zidan ko'rinmaydi — uni kimdir chizishi kerak:

```html
<ng-template #loadingTpl>
  <div class="spinner" role="status">Yuklanmoqda…</div>
</ng-template>
```

Chizish usullari:

**1. `ngTemplateOutlet` bilan:**

```ts
import { NgTemplateOutlet } from '@angular/common';

@Component({
  imports: [NgTemplateOutlet],
  ...
})
```

```html
<ng-container *ngTemplateOutlet="loadingTpl" />
```

**2. Kontekst bilan — shablonga ma'lumot uzatish:**

```html
<ng-template #userRow let-user let-i="index">
  <li>{{ i + 1 }}. {{ user.name }} — {{ user.email }}</li>
</ng-template>

<ul>
  @for (u of admins(); track u.id) {
    <ng-container *ngTemplateOutlet="userRow; context: { $implicit: u, index: $index }" />
  }
</ul>

<ul>
  @for (u of guests(); track u.id) {
    <ng-container *ngTemplateOutlet="userRow; context: { $implicit: u, index: $index }" />
  }
</ul>
```

| Shablonda | Kontekstdan |
| --- | --- |
| `let-user` | `$implicit` |
| `let-i="index"` | `index` maydoni |

Bitta qator shabloni — ikki ro'yxatda, takrorlanmasdan.

**3. Komponentga uzatish** — "bu qismni o'zing chiz" (kuchli naqsh):

```ts
// data-table.ts
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <table>
      <tbody>
        @for (row of rows(); track $index) {
          <tr>
            <ng-container *ngTemplateOutlet="rowTemplate(); context: { $implicit: row }" />
          </tr>
        } @empty {
          <tr><td>Ma'lumot yo'q</td></tr>
        }
      </tbody>
    </table>
  `,
})
export class DataTable<T> {
  readonly rows = input.required<T[]>();
  readonly rowTemplate = input.required<TemplateRef<{ $implicit: T }>>();
}
```

```html
<!-- Ishlatish: jadval tuzilmasi — komponentda, qator ko'rinishi — chaqiruvchida -->
<app-data-table [rows]="orders()" [rowTemplate]="orderRow" />

<ng-template #orderRow let-order>
  <td>{{ order.number }}</td>
  <td>{{ order.total | currency:'UZS':'symbol-narrow':'1.0-0' }}</td>
</ng-template>
```

Bu — umumiy komponentlarning (jadval, ro'yxat, tanlagich) asosiy naqshi. Kontent proyeksiyasi (`ng-content`, 28-bob) bilan birga ishlatiladi.

## Kod: `@let`

Shablonda lokal o'zgaruvchi:

```html
@let user = currentUser();
@let fullName = user ? user.firstName + ' ' + user.lastName : 'Mehmon';
@let total = cart().items.length;

<header>
  <p>{{ fullName }}</p>
  <span class="badge">{{ total }}</span>
</header>

@if (total > 0) {
  <p>Savatda {{ total }} ta mahsulot</p>
}
```

Xususiyatlari:

| Xususiyat | Tafsilot |
| --- | --- |
| Reaktiv | `currentUser()` o'zgarsa — `user` ham yangilanadi |
| Faqat o'qish | Qayta tayinlab bo'lmaydi |
| Qamrov | E'lon qilingan blok va uning ichidagi bloklar |
| Tartib | E'londan **keyin** ishlatiladi |

Qoidalar buzilsa (Angular 22 da tekshirildi):

```html
<p>{{ total }}</p>
@let total = items().length;
```

```
✘ [ERROR] NG8016: Cannot read @let declaration 'total' before it has been defined.
```

```html
@let total = items().length;
<button (click)="total = 5">x</button>
```

```
✘ [ERROR] NG8015: Cannot assign to @let declaration 'total'.
```

`@let` tip toraytirish bilan ham ishlaydi:

```html
@let u = user();

@if (u) {
  <!-- u — User, null emas -->
  <p>{{ u.name }}</p>
}
```

### `@let` qachon kerak, qachon `computed`

| Holat | Tanlov |
| --- | --- |
| Uzun ifodani shablonda qisqartirish | `@let` |
| Signalni bir marta o'qib, bir necha joyda ishlatish | `@let` |
| `@for` ichida har element uchun hisob | `@let` (klassda qilib bo'lmaydi) |
| Murakkab mantiq, test kerak | `computed` |
| Qiymat klass kodida ham kerak | `computed` |

`@for` ichida — `@let` ning eng foydali joyi:

```html
@for (item of cart().items; track item.id) {
  @let lineTotal = item.price * item.quantity;

  <tr [class.expensive]="lineTotal > 1000000">
    <td>{{ item.title }}</td>
    <td>{{ lineTotal | currency:'UZS':'symbol-narrow':'1.0-0' }}</td>
  </tr>
}
```

Bu yerda `computed` ishlatib bo'lmaydi — har element uchun alohida qiymat.

## Muhandislik nuqtai nazari: shablon qachon juda murakkab

`@let`, `ng-template`, `ngTemplateOutlet` — kuchli vositalar, lekin ko'p ishlatilsa shablon "dastur"ga aylanadi. Belgilar:

| Belgi | Nima qilish |
| --- | --- |
| 5+ `@let` bir shablonda | Mantiqni `computed` ga ko'chiring |
| `ng-template` faqat bir marta ishlatiladi | Oddiy shablonga qaytaring |
| Ichma-ich `ngTemplateOutlet` | Alohida komponentga ajrating |
| Shablon 200+ qator | Komponentlarga bo'ling (5-bob) |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `@let` ni e'londan oldin ishlatish | NG8016 | E'lonni yuqoriga |
| `@let` ga qiymat berish | NG8015 | Signal ishlating |
| `ngTemplateOutlet` + `imports` yo'q | Shablon chizilmaydi | `imports: [NgTemplateOutlet]` |
| Guruhlash uchun `<div>` | Flex/grid/jadval buziladi | `<ng-container>` |
| `<ng-template>` yozib, ko'rinishini kutish | Hech narsa chizilmaydi | `ngTemplateOutlet` yoki `@if ... else` |
| `let-x` va kontekst nomi mos emas | `undefined` | `$implicit` yoki aniq nom |
| Murakkab mantiq `@let` da | Test qilib bo'lmaydi | `computed` |

## Amaliyot

1. `#search` bilan qidiruv maydoni yozing: "Topish" va "Tozalash" tugmalari, `$event` siz.
2. Bitta `ng-template` bilan ikki ro'yxat (adminlar, mehmonlar) qatorini chizing.
3. `DataTable` komponentini yozing — qator ko'rinishi `rowTemplate` orqali tashqaridan kelsin.
4. Savat jadvalida `@for` ichida `@let lineTotal` bilan qator jamini hisoblang.
5. `@let` ni e'londan oldin ishlating (NG8016), keyin qayta tayinlang (NG8015) — xatolarni o'qing.
6. Shablondagi uzun ifodani `@let` bilan, keyin `computed` bilan qisqartiring — qaysi biri o'qishga osonroq?

## Rasmiy hujjat

- Shablon havolalari: <https://angular.dev/guide/templates/variables#template-reference-variables>
- `@let`: <https://angular.dev/guide/templates/variables#local-template-variables-with-let>
- `ng-template`: <https://angular.dev/guide/templates/ng-template>
- `ng-container`: <https://angular.dev/guide/templates/ng-container>
