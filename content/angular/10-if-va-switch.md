# 10 — Boshqaruv oqimi: `@if` va `@switch`

[← Oldingi: Hodisalar](09-hodisalar.md) · [Mundarija](README.md) · [Keyingi: @for va track →](11-for-va-track.md)

## Tushuncha

Shablonning bir qismini shartga qarab ko'rsatish yoki yashirish:

```html
@if (user()) {
  <p>Salom, {{ user()!.name }}</p>
} @else {
  <a routerLink="/login">Kirish</a>
}
```

`@if`, `@else if`, `@else`, `@switch`, `@case`, `@default` — Angular 17 dan boshlab shablonning **o'rnatilgan sintaksisi**. Ular direktiva emas, `imports` ga hech narsa qo'shish shart emas.

## Nega shunday

Ilgari shart `*ngIf` direktivasi bilan yozilardi:

```html
<!-- Ilgari -->
<p *ngIf="user; else guest">Salom, {{ user.name }}</p>
<ng-template #guest><a routerLink="/login">Kirish</a></ng-template>
```

Muammolar: `else` uchun alohida `<ng-template>` va nom kerak edi, `else if` umuman yo'q edi, `NgIf` ni import qilish kerak edi, va o'qish qiyin edi.

Yangi sintaksis — oddiy dasturlash tilidagi `if` ga o'xshaydi. Kompilyator uni to'g'ridan-to'g'ri tushunadi, shuning uchun tiplarni ham yaxshiroq toraytiradi va biroz tezroq ishlaydi.

## Kod: `@if`, `@else if`, `@else`

```html
@if (orders().length === 0) {
  <p class="empty">Buyurtmalar yo'q</p>
} @else if (orders().length === 1) {
  <p>Bitta buyurtma</p>
} @else {
  <p>{{ orders().length }} ta buyurtma</p>
}
```

Jingalak qavslar majburiy. Blok ichida istalgan shablon — komponentlar, boshqa `@if`, `@for`.

## Kod: `as` — qiymatni saqlash va toraytirish

Signal `null` bo'lishi mumkin bo'lsa, `as` bilan qiymatni o'zgaruvchiga olamiz:

```ts
protected readonly user = signal<User | null>(null);
```

```html
@if (user(); as u) {
  <h2>{{ u.name }}</h2>
  <p>{{ u.email }}</p>
  <app-avatar [src]="u.photo" />
}
```

Ikkita foyda:

1. **Tip toraytiriladi** — blok ichida `u` ning tipi `User`, `null` emas. `user()!.name` yoki `user()?.name` yozish shart emas.
2. **Bir marta o'qiladi** — `user()` ni har qatorda qayta chaqirmaymiz.

Toraytirish `as` siz ham ishlaydi, lekin faqat to'g'ridan-to'g'ri ifodada:

```html
@if (order().discount) {
  <!-- order().discount bu yerda undefined emas -->
  <p>Chegirma: {{ order().discount }}%</p>
}
```

## Kod: `@switch`

Bitta qiymatni bir nechta variantga solishtirish:

```ts
type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

protected readonly status = signal<OrderStatus>('pending');
```

```html
@switch (status()) {
  @case ('pending') {
    <span class="badge badge-warning">Kutilmoqda</span>
  }
  @case ('paid') {
    <span class="badge badge-success">To'langan</span>
  }
  @case ('shipped') {
    <span class="badge badge-info">Jo'natildi</span>
  }
  @case ('cancelled') {
    <span class="badge badge-muted">Bekor qilindi</span>
  }
}
```

JavaScript'dagi `switch` dan farqi: `break` kerak emas, bir `@case` dan keyingisiga **o'tib ketmaydi**. Solishtirish `===` bilan.

### `@default never` — hech bir holat unutilmasin

`OrderStatus` ga yangi qiymat qo'shilsa (`'refunded'`), `@switch` jim qoladi — yangi holat ekranda hech narsa ko'rsatmaydi. Buni kompilyator tutishi uchun:

```html
@switch (status()) {
  @case ('pending') { ... }
  @case ('paid') { ... }
  @case ('shipped') { ... }
  @case ('cancelled') { ... }
  @default never;
}
```

Bitta holat unutilsa — build to'xtaydi (Angular 22 da tekshirildi):

```
✘ [ERROR] TS2322: Type 'Status' is not assignable to type 'never'.
```

Birlashma tiplar (`'a' | 'b' | 'c'`) bilan ishlaganda `@default never;` ni odat qiling.

Oddiy standart holat kerak bo'lsa:

```html
@switch (role()) {
  @case ('admin') { <app-admin-menu /> }
  @case ('manager') { <app-manager-menu /> }
  @default { <app-user-menu /> }
}
```

## Kod: `@if` va `[hidden]` farqi

Ikkalasi ham "ko'rinmasin" degani, lekin ishlashi butunlay boshqa:

| | `@if (false)` | `[hidden]="true"` |
| --- | --- | --- |
| DOM'da | **Yo'q** — element o'chiriladi | Bor, faqat `display: none` |
| Ichidagi komponent | Yo'q qilinadi, holati yo'qoladi | Tirik, holati saqlanadi |
| Qayta ko'rsatilganda | Noldan yaratiladi | Darhol ko'rinadi |
| Xotira | Tejaladi | Ishlatiladi |
| Ichidagi so'rovlar | Ketmaydi | Ketadi |

Qachon qaysi biri:

```html
<!-- Kamdan-kam ko'rinadi, og'ir — @if -->
@if (showReport()) {
  <app-heavy-report />
}

<!-- Tez-tez almashtiriladi, holat saqlansin — [hidden] -->
<app-filter-panel [hidden]="!filtersOpen()" />
```

Tab'lar misoli: foydalanuvchi forma to'ldirib, boshqa tabga o'tib qaytsa — `@if` bilan forma **tozalanadi**, `[hidden]` bilan saqlanadi.

## Kod: eski koddan ko'chirish

Angular avtomatik migratsiya beradi:

```bash
ng generate @angular/core:control-flow-migration
```

Haqiqiy natija (Angular 22):

```html
<!-- Oldin -->
<p *ngIf="items.length; else empty">Bor</p>
<ng-template #empty><p>Bo'sh</p></ng-template>

<!-- Keyin -->
@if (items.length) {
  <p>Bor</p>
} @else {
  <p>Bo'sh</p>
}
```

Migratsiya `NgIf` ni `imports` dan ham olib tashlaydi.

| Eski | Yangi |
| --- | --- |
| `*ngIf="x"` | `@if (x) { }` |
| `*ngIf="x; else y"` + `<ng-template #y>` | `@if (x) { } @else { }` |
| `*ngIf="user$ \| async as user"` | `@if (user(); as user) { }` (signal bilan) |
| `[ngSwitch]` + `*ngSwitchCase` | `@switch` + `@case` |
| `*ngSwitchDefault` | `@default` |

## Muhandislik nuqtai nazari: shablonda qancha mantiq

`@if` ichida murakkab shart — o'qib bo'lmaydigan shablon:

```html
<!-- ❌ -->
@if (user() && user()!.roles.includes('admin') && !user()!.blocked && settings().adminPanel) {
  <app-admin-panel />
}
```

Shartni nomlang:

```ts
// ✅
protected readonly canSeeAdminPanel = computed(() => {
  const u = this.user();

  return !!u && u.roles.includes('admin') && !u.blocked && this.settings().adminPanel;
});
```

```html
@if (canSeeAdminPanel()) {
  <app-admin-panel />
}
```

Foyda: shablon o'qiladi, shart test qilinadi, qayta ishlatiladi.

**Muhim:** bu **UI** tekshiruvi, xavfsizlik emas. Admin panelni yashirish — foydalanuvchi ma'lumotga kira olmasligi degani emas. Haqiqiy ruxsat serverda tekshiriladi (59-bob).

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `@if` ichida `user()!.name` qayta-qayta | Uzun, `!` xavfli | `@if (user(); as u)` |
| Birlashma tipda `@default never;` yo'q | Yangi holat jim yo'qoladi | Qo'shing |
| Forma tabini `@if` bilan | Tab almashganda ma'lumot yo'qoladi | `[hidden]` |
| Og'ir komponentni `[hidden]` bilan | Keraksiz yuklanadi, so'rov ketadi | `@if` yoki `@defer` |
| Shablonda 4 qismli shart | O'qib bo'lmaydi | `computed` bilan nomlang |
| `@if` bilan xavfsizlikni ta'minlash | UI yashiriladi, API ochiq | Server tekshiruvi |
| Yangi kodda `*ngIf` | Eski uslub, qo'shimcha import | `@if` |

## Amaliyot

1. Buyurtmalar soniga qarab uch xil matn chiqaring: `@if` / `@else if` / `@else`.
2. `signal<User | null>` ni `@if ... as` bilan chiqaring; `as` siz yozib, kompilyator xatosini solishtiring.
3. `OrderStatus` uchun `@switch` yozing, `@default never;` qo'shing, keyin tipga `'refunded'` qo'shib build'ni ishga tushiring.
4. Ikki tabli sahifa yozing: birinchi tab ichida `<input>`. `@if` va `[hidden]` bilan ikki marta sinab, matn saqlanishini solishtiring.
5. Eski `*ngIf ... else` li kodni `control-flow-migration` bilan ko'chiring va natijani o'qing.

## Rasmiy hujjat

- Boshqaruv oqimi: <https://angular.dev/guide/templates/control-flow>
- Migratsiya: <https://angular.dev/reference/migrations/control-flow>
