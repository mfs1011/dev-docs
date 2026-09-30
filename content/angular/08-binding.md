# 08 — Binding: property, attribute, class, style

[← Oldingi: Standalone ilova: provayderlar](07-standalone-provayderlar.md) · [Mundarija](README.md) · [Keyingi: Hodisalar →](09-hodisalar.md)

## Tushuncha

Binding — komponent klassidagi qiymatni shablondagi elementga **ulash**. Qiymat o'zgarsa, element o'zi yangilanadi.

| Sintaksis | Nima | Misol |
| --- | --- | --- |
| `{{ ... }}` | Matn (interpolatsiya) | `<h1>{{ title() }}</h1>` |
| `[prop]` | DOM xossasi yoki komponent kiritmasi | `<img [src]="photo()">` |
| `[attr.x]` | HTML atributi | `<td [attr.colspan]="span()">` |
| `[class.x]` | Bitta CSS klass | `<li [class.active]="selected()">` |
| `[class]` | Bir nechta klass | `<div [class]="classes()">` |
| `[style.x]` | Bitta stil | `<div [style.width.px]="w()">` |
| `[style]` | Bir nechta stil | `<div [style]="styles()">` |
| `(event)` | Hodisa — keyingi bob | `<button (click)="save()">` |

Yo'nalish: `{{ }}` va `[ ]` — **klassdan shablonga**. `( )` — **shablondan klassga**.

## Nega shunday

Angular shablonni kompilyatsiya qiladi va har bog'lanish uchun "bu qiymat o'zgarsa, shu joyni yangila" degan kod yaratadi. Siz DOM'ga qo'l tekkizmaysiz — `element.textContent = ...` yoki `classList.add(...)` yozish shart emas.

Qavslar ma'noni aniq qiladi:

```html
<img src="photo.jpg">          <!-- oddiy HTML: satr "photo.jpg" -->
<img [src]="photo()">          <!-- binding: photo() ning QIYMATI -->
<img src="{{ photo() }}">      <!-- interpolatsiya: xuddi yuqoridagidek -->
```

Qavssiz `src="photo()"` yozsangiz, brauzer `photo()` degan faylni qidiradi.

## Kod: interpolatsiya

```html
<h1>{{ title() }}</h1>
<p>Jami: {{ price() * quantity() }} so'm</p>
<p>{{ user()?.name ?? 'Mehmon' }}</p>
<p>{{ isAdmin() ? 'Administrator' : 'Foydalanuvchi' }}</p>
```

Interpolatsiya ichida TypeScript ifodasi yoziladi, lekin **cheklangan**:

| Mumkin | Mumkin emas |
| --- | --- |
| Arifmetika, taqqoslash, `? :`, `?.`, `??` | `=`, `+=`, `++` (tayinlash) |
| Metod va signal chaqirish | `new`, `typeof` ning ba'zi shakllari |
| Quvurlar: `{{ date \| date }}` | Ko'p qatorli mantiq |

Qoida: shablonda **hisob-kitob emas, ko'rsatish**. Murakkab ifoda — `computed()` ga (16-bob):

```ts
// ❌ shablonda
{{ items().filter(i => i.active).reduce((s, i) => s + i.price, 0) }}

// ✅ klassda
protected readonly activeTotal = computed(() =>
  this.items().filter((i) => i.active).reduce((sum, i) => sum + i.price, 0),
);
```

```html
{{ activeTotal() }}
```

`computed` qiymati keshlanadi — `items` o'zgarmaguncha qayta hisoblanmaydi.

## Kod: property binding

```html
<img [src]="product().image" [alt]="product().title">
<button [disabled]="!canSubmit()">Yuborish</button>
<input [value]="query()">
<a [href]="profileUrl()">Profil</a>
```

`[disabled]="!canSubmit()"` — `true` bo'lsa tugma bloklanadi. HTML'da `disabled="false"` yozish tugmani **baribir** bloklaydi (atribut borligining o'zi yetadi); binding esa haqiqiy boolean bilan ishlaydi.

Komponent kiritmasiga ham xuddi shu sintaksis:

```html
<app-user-card [user]="currentUser()" />
```

Angular avval element **komponent kiritmasi** borligini tekshiradi, keyin **DOM xossasi**ni.

## Kod: property va attribute farqi

Bu — eng ko'p chalkashlik tug'diradigan joy.

| | HTML atributi | DOM xossasi |
| --- | --- | --- |
| Qayerda | HTML matnida | JavaScript obyektida |
| Qachon o'rnatiladi | Sahifa yuklanganda, bir marta | Doim joriy qiymat |
| Misol | `<input value="salom">` | `input.value` |

`[value]` — **xossa** bilan ishlaydi. Lekin ba'zi atributlarning xossasi yo'q. Ular uchun `[attr.x]`. Angular 22 da haqiqiy loyihada tekshirildi:

```html
<!-- data-*, role, colspan, SVG — attr. KERAK -->
<div [attr.data-testid]="'order-' + order().id"></div>
<div [attr.role]="isList() ? 'list' : null"></div>
<td [attr.colspan]="columns()">Jami</td>
<circle [attr.r]="radius()" [attr.fill]="color()" />
```

`attr.` siz yozilsa:

```
✘ [ERROR] NG8002: Can't bind to 'colspan' since it isn't a known property of 'td'.
✘ [ERROR] NG8002: Can't bind to 'r' since it isn't a known property of ':svg:circle'.
```

**ARIA atributlari — istisno.** Zamonaviy Angular `aria-*` ni `attr.` siz ham tushunadi va atribut sifatida qo'yadi:

```html
<!-- Ikkalasi ham ishlaydi, natija bir xil -->
<button [aria-expanded]="open()" [aria-controls]="panelId">Menyu</button>
<button [attr.aria-expanded]="open()" [attr.aria-controls]="panelId">Menyu</button>
```

Eski kodda `[attr.aria-...]` ni ko'p uchratasiz — u ham to'g'ri, faqat uzunroq. `role` esa ARIA'ga tegishli bo'lsa ham, `aria-` bilan boshlanmaydi — unga `attr.` kerak.

Qiymat `null` bo'lsa — atribut **butunlay olib tashlanadi** (tekshirildi):

```html
<!-- Tanlanmagan bo'lsa aria-current umuman bo'lmasin -->
<a [aria-current]="active() ? 'page' : null">Bosh sahifa</a>
```

`false` bersangiz — `aria-current="false"` bo'lib **qoladi**. Olib tashlash uchun faqat `null`.

Qoida: avval `[prop]`, kompilyator NG8002 desa — `[attr.prop]`.

## Kod: class binding

**Bitta klass:**

```html
<li [class.active]="item.id === selectedId()">{{ item.name }}</li>
<button [class.loading]="saving()">Saqlash</button>
```

**Bir nechta klass** — obyekt, satr yoki massiv:

```html
<!-- Obyekt: kalit — klass, qiymat — yoqilganmi -->
<div [class]="{ card: true, selected: isSelected(), disabled: !enabled() }"></div>

<!-- Satr -->
<div [class]="'card card-' + size()"></div>

<!-- Massiv -->
<div [class]="['card', theme()]"></div>
```

Statik va dinamik klasslar birga ishlaydi — Angular ularni birlashtiradi:

```html
<button class="btn" [class.btn-primary]="primary()">OK</button>
<!-- natija: class="btn btn-primary" yoki class="btn" -->
```

Obyektli variantni klassga chiqarish yaxshiroq:

```ts
protected readonly cardClasses = computed(() => ({
  card: true,
  selected: this.isSelected(),
  disabled: !this.enabled(),
}));
```

```html
<div [class]="cardClasses()"></div>
```

> **Ilgari:** `[ngClass]="{ ... }"` direktivasi ishlatilardi. Hali ishlaydi, lekin `[class]` binding bir xil ishni qiladi va `imports` ga hech narsa qo'shish shart emas.

## Kod: style binding

```html
<!-- Bitta stil -->
<div [style.color]="textColor()"></div>
<div [style.background-color]="bg()"></div>

<!-- O'lchov birligi bilan -->
<div [style.width.px]="width()"></div>
<div [style.height.%]="progress()"></div>
<div [style.font-size.rem]="scale()"></div>

<!-- Bir nechta -->
<div [style]="{ width: width() + 'px', opacity: visible() ? 1 : 0.4 }"></div>
```

`[style.width.px]="120"` → `width: 120px`. Birlik qo'shimchasi (`.px`, `.%`, `.rem`, `.em`, `.vh`) qiymatni satrga aylantirish zaruratidan qutqaradi.

CSS o'zgaruvchisi — mavzu va dinamik ranglar uchun juda qulay:

```html
<div class="progress" [style.--value]="percent() + '%'"></div>
```

```css
.progress::after {
  width: var(--value);
}
```

Qachon `[style]` va qachon `[class]`?

| Holat | Ishlating |
| --- | --- |
| Holatga qarab ko'rinish (faol, xato, yuklanmoqda) | `[class.x]` — stil CSS faylda qoladi |
| Hisoblangan son (kenglik, pozitsiya, foiz) | `[style.x]` yoki CSS o'zgaruvchisi |
| Foydalanuvchi tanlagan rang | CSS o'zgaruvchisi |

Klass afzal: stil CSS'da, TypeScript'da faqat holat.

## Kod: xavfsizlik

Angular bog'langan qiymatlarni **avtomatik tozalaydi** (sanitize):

```ts
protected readonly comment = signal('<img src=x onerror="alert(1)"> Salom');
```

```html
<p>{{ comment() }}</p>
<!-- Ekranda matn bo'lib chiqadi: <img src=x ...> Salom — HTML emas -->

<p [innerHTML]="comment()"></p>
<!-- HTML sifatida, lekin xavfli qismi (onerror) olib tashlanadi -->
```

`[href]` ga `javascript:` protokoli ham bloklanadi. Bu himoyani chetlab o'tadigan `DomSanitizer.bypassSecurityTrust...` — 76-bobda, va u deyarli hech qachon kerak emas.

## Muhandislik nuqtai nazari: shablondagi funksiya chaqiruvi

Eski Angular'da shablonda metod chaqirish yomon amaliyot edi:

```html
<!-- Ilgari: har o'zgarishlarni aniqlashda qayta chaqirilardi -->
<p>{{ calculateTotal() }}</p>
```

zone.js butun daraxtni har hodisada tekshirgani uchun `calculateTotal()` sekundiga o'nlab marta chaqirilishi mumkin edi.

Zamonaviy Angular'da (OnPush + signallar):

| Shablonda | Narxi |
| --- | --- |
| Signal o'qish: `{{ total() }}` | Arzon — qiymat o'qiladi |
| `computed` o'qish | Arzon — keshlangan |
| Oddiy metod: `{{ calculate() }}` | Komponent tekshirilganda har safar chaqiriladi |

Qoida o'zgarmadi, faqat sabab boshqacha: **hisob-kitob — `computed`, shablonda — faqat o'qish**.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `src="photo()"` (qavssiz) | Satr "photo()" | `[src]="photo()"` |
| `[colspan]`, `[data-id]`, `[role]` | NG8002 | `[attr.colspan]` va h.k. |
| Shablonda murakkab filtr/reduce | O'qish qiyin, har safar qayta hisoblanadi | `computed()` |
| `[style.width]="120"` | Birlik yo'q, ishlamaydi | `[style.width.px]="120"` |
| Ranglarni `[style]` bilan yozish | Stil TS'ga tarqaladi | `[class.x]` yoki CSS o'zgaruvchi |
| `[attr.x]="false"` atributni olib tashlaydi deb o'ylash | `x="false"` qoladi | `null` bering |
| `[ngClass]` yangi kodda | Keraksiz import | `[class]` |
| `[innerHTML]` ga foydalanuvchi matni | Tozalanadi, lekin xavf joyi | Matn uchun `{{ }}` |

## Amaliyot

1. Mahsulot kartasini yozing: `[src]`, `[alt]`, narx interpolatsiyasi, `[disabled]` tugma.
2. Ro'yxatdagi tanlangan bandga `[class.active]` bering; tanlash signalda saqlansin.
3. Progress chizig'ini `[style.width.%]` bilan, keyin CSS o'zgaruvchisi bilan qiling — ikkalasini solishtiring.
4. Menyu tugmasiga `[aria-expanded]` qo'shing; keyin `<td [colspan]>` yozib NG8002 xatosini ko'ring va `attr.` bilan tuzating.
5. `[aria-current]` ga `null` va `false` berib, DevTools'da farqni ko'ring.
6. Shablondagi murakkab ifodani `computed` ga ko'chiring.

## Rasmiy hujjat

- Binding: <https://angular.dev/guide/templates/binding>
- Class va style: <https://angular.dev/guide/templates/binding#css-class-and-style-property-bindings>
- Xavfsizlik: <https://angular.dev/best-practices/security>
