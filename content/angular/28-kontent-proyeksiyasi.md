# 28 — Kontent proyeksiyasi: `ng-content`

[← Oldingi: Signal so'rovlari](27-signal-sorovlari.md) · [Mundarija](README.md) · [Keyingi: Host elementi va hostDirectives →](29-host-va-host-directives.md)

## Tushuncha

Kontent proyeksiyasi — komponentga **ichki HTML** berish, xuddi oddiy HTML elementiga bergandek:

```html
<app-card>
  <h2>Buyurtma №1024</h2>
  <p>3 ta mahsulot, 1 250 000 so'm</p>
</app-card>
```

`Card` komponenti bu kontent **qayerda** chiqishini hal qiladi:

```ts
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <ng-content />
    </div>
  `,
})
export class Card {}
```

`<ng-content />` — "otaning qo'ygan kontenti shu yerga". Natija:

```html
<app-card>
  <div class="card">
    <h2>Buyurtma №1024</h2>
    <p>3 ta mahsulot, 1 250 000 so'm</p>
  </div>
</app-card>
```

## Nega shunday

`input` bilan faqat **ma'lumot** uzatiladi — satr, son, obyekt. Lekin ko'p komponent "qobiq": karta, modal, panel, tugma. Ularning ichida nima bo'lishi har safar boshqa — matn, rasm, forma, boshqa komponentlar.

```html
<!-- ❌ input bilan HTML — noqulay va xavfli -->
<app-card [content]="'<h2>Sarlavha</h2><p>Matn</p>'" />

<!-- ✅ proyeksiya -->
<app-card>
  <h2>Sarlavha</h2>
  <p>Matn</p>
</app-card>
```

Proyeksiyada kontent **otaning** komponentida yaratiladi: uning binding'lari, hodisalari, stillari otaga tegishli. `Card` faqat joylashtiradi.

## Kod: bir nechta slot — `select`

```ts
@Component({
  selector: 'app-card',
  template: `
    <article class="card">
      <header>
        <ng-content select="[card-title]">Sarlavhasiz</ng-content>
      </header>

      <div class="body">
        <ng-content />
      </div>

      <footer>
        <ng-content select="app-actions, .actions" />
      </footer>
    </article>
  `,
})
export class Card {}
```

```html
<app-card>
  <h2 card-title>Buyurtma</h2>
  <p>Matn</p>
  <div class="actions">
    <button type="button">OK</button>
  </div>
</app-card>
```

Haqiqiy test natijasi (Angular 22): `<header>` da "Buyurtma", `<footer>` da "OK", qolgani — tanada.

`select` — CSS selektor:

| Selektor | Nimani oladi |
| --- | --- |
| `select="[card-title]"` | `card-title` atributli element |
| `select="app-actions"` | `<app-actions>` teg |
| `select=".actions"` | `actions` klassli element |
| `select="app-actions, .actions"` | Istalgan biri |
| `<ng-content />` (selektorsiz) | Qolgan hamma narsa |

Atribut selektori (`[card-title]`) — eng aniq va tavsiya etiladigan: kontent qaysi slotga ketishi otaning shablonida ko'rinib turadi.

## Kod: fallback kontent

`<ng-content>` ichiga yozilgan narsa — hech narsa proyeksiya qilinmaganda ko'rsatiladi:

```html
<ng-content select="[card-title]">Sarlavhasiz</ng-content>
```

```html
<app-card>
  <p>Faqat matn</p>
</app-card>
```

Tekshirildi: `<header>` da "Sarlavhasiz" chiqdi. Sukut tugmalar, bo'sh holat matni, sukut ikonka uchun qulay.

## Kod: `ngProjectAs` — boshqa slotga yo'naltirish

Kontent `<ng-container>` ichida bo'lsa (masalan `@if` sababli), selektor uni ko'rmaydi. `ngProjectAs` — "meni shu selektor sifatida qabul qil":

```html
<app-card>
  <ng-container ngProjectAs="[card-title]">
    @if (order(); as o) {
      <h2>{{ o.number }}</h2>
    }
  </ng-container>
  <p>Matn</p>
</app-card>
```

## Kod: `@if` bilan proyeksiya — muhim cheklov

```ts
// ❌ kutilgandek ishlamaydi
@Component({
  template: `
    @if (open()) {
      <ng-content />
    }
  `,
})
export class Collapsible {
  readonly open = input(false);
}
```

Kontent `@if` yopiq bo'lsa ham **yaratiladi** — ichidagi komponentlar ishga tushadi, so'rovlar ketadi. Angular 22 da tekshirildi: konstruktorida hisoblagich oshiradigan komponent yopiq `@if` + `<ng-content />` ichida **yaratildi**, `<ng-template>` ichida esa — yo'q. `ng-content` faqat uni **qayerga qo'yishni** hal qiladi, **yaratish-yaratmaslikni** emas. Kontent har doim ota tomonidan yaratiladi.

Kontentni haqiqatan kechiktirish kerak bo'lsa — `ng-template` (15-bob):

```ts
@Component({
  selector: 'app-collapsible',
  imports: [NgTemplateOutlet],
  template: `
    <button type="button" (click)="open.set(!open())">{{ title() }}</button>
    @if (open()) {
      <ng-container *ngTemplateOutlet="content()" />
    }
  `,
})
export class Collapsible {
  readonly title = input.required<string>();
  readonly open = model(false);
  protected readonly content = contentChild.required(TemplateRef);
}
```

```html
<app-collapsible title="Batafsil">
  <ng-template>
    <app-heavy-details />     <!-- faqat ochilganda yaratiladi -->
  </ng-template>
</app-collapsible>
```

| Kontent | Qachon yaratiladi |
| --- | --- |
| `<ng-content />` | Doim — ota render qilganda |
| `<ng-template>` + `ngTemplateOutlet` | Faqat chizilganda |

## Kod: proyeksiya qilingan kontentni tekshirish

`contentChild` bilan (27-bob):

```ts
export class Card {
  private readonly title = contentChild<ElementRef>('title');
  protected readonly hasTitle = computed(() => !!this.title());
}
```

```html
<article class="card" [class.no-title]="!hasTitle()">...</article>
```

## Muhandislik nuqtai nazari: proyeksiya yoki `input`

| Holat | Tanlov |
| --- | --- |
| Faqat matn yoki son | `input` |
| Erkin HTML — matn, rasm, havola, komponent | `ng-content` |
| Aniq tuzilma, lekin har element boshqacha ko'rinadi (jadval qatori) | `TemplateRef` input (15-bob) |
| Og'ir kontent, faqat ba'zan kerak | `ng-template` + `contentChild` |

Umumiy komponentlar kutubxonasi (dizayn tizimi) uchun proyeksiya — asosiy vosita. `<app-button>` ichiga ikonka va matn, `<app-dialog>` ichiga forma, `<app-tabs>` ichiga tab'lar.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| HTML'ni `input` satri bilan uzatish | Xavfli, noqulay | `ng-content` |
| `@if` ichida `ng-content` — yashirish uchun | Kontent baribir yaratiladi | `ng-template` + `ngTemplateOutlet` |
| Selektorsiz `ng-content` ni ikki marta | Kontent faqat **oxirgisiga** tushadi (tekshirildi) | `select` bilan slotlar |
| `<ng-container>` dagi kontent slotga tushmaydi | Selektor ko'rmaydi | `ngProjectAs` |
| Klass bo'yicha slot (`.title`) | Stil klassi bilan chalkashadi | Atribut (`[card-title]`) |
| Bo'sh slot uchun `@if` + `contentChild` | Ortiqcha kod | Fallback kontent |

## Amaliyot

1. `Card` ni uchta slot bilan yozing: sarlavha, tana, amallar.
2. Sarlavha slotiga fallback qo'shing va sarlavhasiz karta yarating.
3. `@if` ichida `<ng-content />` qiling va ichiga `console.log` li komponent qo'ying — yopiq paytda ham ishga tushishini kuzating.
4. `Collapsible` ni `ng-template` + `contentChild(TemplateRef)` bilan qayta yozing va kontent faqat ochilganda yaratilishini tasdiqlang.
5. `ngProjectAs` bilan `@if` ichidagi sarlavhani to'g'ri slotga yo'naltiring.

## Rasmiy hujjat

- Kontent proyeksiyasi: <https://angular.dev/guide/components/content-projection>
- `ng-content`: <https://angular.dev/api/core/ng-content>
