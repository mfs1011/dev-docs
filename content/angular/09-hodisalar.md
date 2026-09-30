# 09 — Hodisalar

[← Oldingi: Binding](08-binding.md) · [Mundarija](README.md) · [Keyingi: Boshqaruv oqimi: @if va @switch →](10-if-va-switch.md)

## Tushuncha

Hodisa binding — foydalanuvchi harakatiga javob berish: bosish, yozish, yuborish, klaviatura.

```html
<button (click)="save()">Saqlash</button>
```

Qavs `( )` — yo'nalish **shablondan klassga**. Hodisa sodir bo'lganda Angular qo'shtirnoq ichidagi ifodani bajaradi.

## Nega shunday

`addEventListener` ni o'zingiz yozsangiz, `removeEventListener` ni ham unutmaslik kerak — aks holda xotira oqadi. Angular hodisa tinglovchisini komponent bilan birga yaratadi va **komponent yo'q qilinganda o'zi olib tashlaydi**.

Ikkinchi sabab — o'zgarishlarni aniqlash. Shablondagi hodisa Angular'ga "bu komponentni tekshir" deb xabar beradi. Shuning uchun hodisa ishlovchisida oddiy maydon o'zgartirilsa ham ekran yangilanadi (5-bobda test bilan ko'rsatilgan).

## Kod: asosiy shakl

```html
<button type="button" (click)="increment()">+1</button>
<form (submit)="submit()">...</form>
<input (focus)="showHints()" (blur)="hideHints()">
<select (change)="applyFilter()">...</select>
```

Ifoda bitta chaqiruv bo'lsin. Ishlovchi nomi — **nima qilishini** aytsin (`saveOrder`), hodisa nomini emas (`onClick`, `handleClick`). Bu rasmiy uslub qo'llanmasining qoidasi: shablonni o'qib, tugma nima qilishini bilasiz.

## Kod: `$event`

Hodisa obyektiga murojaat:

```html
<input (input)="updateQuery($event)">
<button (click)="select($event)">Tanlash</button>
<input (keyup)="onKey($event)">
```

`$event` ning tipi hodisaga bog'liq. Haqiqiy Angular 22 loyihasida tekshirilgan:

| Hodisa | `$event` tipi |
| --- | --- |
| `(click)` | `PointerEvent` |
| `(keyup)`, `(keydown)` | `KeyboardEvent` |
| `(input)`, `(change)` | `Event` |
| `(submit)` | `SubmitEvent` |
| `(keyup.enter)` — kalit filtri bilan | **`Event`** (!) |

`(input)` da tip `Event` — `target` ning tipi noma'lum. Qiymatni olish:

```ts
protected updateQuery(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  this.query.set(value);
}
```

Shablonda `as` yozib bo'lmaydi, shuning uchun tipni klassda aniqlaymiz.

Yaxshiroq yo'l — shablon havolasi bilan (15-bob), `$event` umuman kerak emas:

```html
<input #search (input)="query.set(search.value)">
```

`#search` — elementning o'zi, `search.value` tipi `string`.

## Kod: klaviatura filtrlari

Angular kalit nomi bo'yicha filtrlaydi — `if (event.key === 'Enter')` yozish shart emas:

```html
<input (keyup.enter)="search()">
<input (keydown.escape)="clear()">
<textarea (keydown.shift.enter)="newLine()" (keydown.enter)="send()"></textarea>
<div (keydown.control.s)="save()"></div>
```

| Filtr | Qachon ishlaydi |
| --- | --- |
| `keyup.enter` | Enter qo'yib yuborilganda |
| `keydown.escape` | Escape bosilganda |
| `keydown.shift.enter` | Shift + Enter |
| `keydown.control.s` | Ctrl + S |
| `keydown.arrowdown` | Pastga strelka |
| `keydown.space` | Bo'sh joy |

**Tip haqida ogohlantirish.** Kalit filtri bor hodisada `$event` tipi `KeyboardEvent` emas, `Event` bo'ladi — tekshirildi:

```html
<input (keyup.enter)="save($event)">
```

```ts
protected save(event: KeyboardEvent) { ... }
// ✘ TS2345: Argument of type 'Event' is not assignable to parameter of type 'KeyboardEvent'.
```

Yechim: parametr tipini `Event` qiling yoki `$event` ni umuman uzatmang — filtr allaqachon Enter ekanini kafolatlagan.

## Kod: argument uzatish

```html
@for (order of orders(); track order.id) {
  <li>
    {{ order.number }}
    <button type="button" (click)="remove(order.id)">O'chirish</button>
    <button type="button" (click)="open(order, $event)">Ochish</button>
  </li>
}
```

```ts
protected remove(id: number) {
  this.orders.update((list) => list.filter((o) => o.id !== id));
}

protected open(order: Order, event: PointerEvent) {
  if (event.ctrlKey || event.metaKey) {
    window.open(`/orders/${order.id}`, '_blank');
  } else {
    this.router.navigate(['/orders', order.id]);
  }
}
```

## Kod: `preventDefault` va `stopPropagation`

```html
<form (submit)="submit($event)">...</form>
```

```ts
protected submit(event: SubmitEvent) {
  event.preventDefault();       // sahifa qayta yuklanmasin

  // ... yuborish
}
```

Angular formalar moduli (47–54-boblar) `submit` ni o'zi boshqaradi. Oddiy `<form>` bilan ishlasangiz — `preventDefault` ni unutmang.

Ichki tugma tashqi elementning hodisasini qo'zg'atmasin:

```html
<li (click)="select(item)">
  {{ item.name }}
  <button type="button" (click)="remove(item); $event.stopPropagation()">✕</button>
</li>
```

Bir nechta ifoda `;` bilan — mumkin, lekin kamdan-kam. Ko'pincha metod ichida qilish tozaroq.

## Kod: `type="button"` — kichik, lekin muhim

```html
<form (submit)="save()">
  <input ...>
  <button (click)="addRow()">Qator qo'shish</button>   <!-- ❌ formani yuboradi! -->
  <button type="button" (click)="addRow()">Qator qo'shish</button>   <!-- ✅ -->
  <button type="submit">Saqlash</button>
</form>
```

`<form>` ichidagi `<button>` ning sukut tipi — `submit`. `type="button"` yozilmasa, "Qator qo'shish" formani yuboradi. Odat qiling: har tugmaga `type` yozing.

## Kod: global hodisalar

Butun oyna yoki hujjat hodisasini tinglash — komponentning `host` xossasi orqali:

```ts
@Component({
  selector: 'app-modal',
  host: {
    '(document:keydown.escape)': 'close()',
    '(window:resize)': 'measure()',
  },
  template: `...`,
})
export class Modal {
  protected close() { ... }
  protected measure() { ... }
}
```

`document:` va `window:` prefikslari. Tinglovchi komponent bilan birga olib tashlanadi. `host` to'liq — 29-bobda.

> **Ilgari:** `@HostListener('document:keydown.escape')` dekoratori. Hali ishlaydi, lekin uslub qo'llanmasi `host` obyektini tavsiya qiladi.

## Kod: komponent hodisalari

Komponentlar ham hodisa chiqaradi — `output()` orqali (26-bob). Tinglash sintaksisi bir xil:

```html
<app-user-card [user]="u" (follow)="followUser($event)" />
```

Bu yerda `$event` — DOM hodisasi emas, komponent yuborgan qiymat (masalan foydalanuvchi ID'si).

## Muhandislik nuqtai nazari: tez-tez sodir bo'ladigan hodisalar

`input`, `scroll`, `mousemove`, `resize` — sekundiga o'nlab marta keladi. Har birida og'ir ish (API so'rovi, filtr) — sekinlik.

| Hodisa | Muammo | Yechim |
| --- | --- | --- |
| Qidiruv maydoni `(input)` | Har harfda so'rov | Debounce (22-bob) |
| `(scroll)` | Har pikselda hisob | `IntersectionObserver` yoki `@defer (on viewport)` |
| `(window:resize)` | O'nlab chaqiruv | CSS media query yoki `ResizeObserver` |
| `(mousemove)` | Juda tez-tez | `requestAnimationFrame` bilan cheklash |

Qoida: **hodisa ishlovchisi tez bo'lsin** — signalni o'zgartirsin, xolos. Og'ir ish signaldan hosil bo'ladigan `computed`, `resource` yoki debounced signalga ketsin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Forma ichida `type` siz tugma | Forma yuboriladi | `type="button"` |
| `(keyup.enter)` + `KeyboardEvent` parametr | TS2345 | `Event` yoki `$event` uzatmang |
| `event.target.value` to'g'ridan-to'g'ri | TS xatosi: `target` tipi noma'lum | `(event.target as HTMLInputElement).value` yoki `#ref` |
| `onClick()`, `handleClick()` nomlari | Tugma nima qilishi noma'lum | `saveOrder()` |
| Oddiy `<form>` da `preventDefault` yo'q | Sahifa qayta yuklanadi | `event.preventDefault()` |
| `addEventListener` qo'lda | Olib tashlash unutiladi | `(event)` yoki `host` |
| Har `(input)` da API so'rov | Yuzlab so'rov | Debounce (22-bob) |
| `if (e.key === 'Enter')` | Keraksiz kod | `(keyup.enter)` |

## Amaliyot

1. Hisoblagich yozing: `+1`, `-1`, `Tozalash` tugmalari, har biri `type="button"`.
2. Qidiruv maydonini ikki usulda yozing: `$event` bilan va `#search` havolasi bilan. Qaysi biri qisqaroq?
3. `(keyup.enter)` ga `KeyboardEvent` parametrli metod ulang — TS2345 ni ko'ring, keyin tuzating.
4. Ro'yxatda "O'chirish" tugmasini qiling; qator bosilganda tanlansin, tugma bosilganda faqat o'chsin (`stopPropagation`).
5. Modal komponentiga `(document:keydown.escape)` bilan yopilishni qo'shing.
6. `<form>` ichiga `type` siz tugma qo'ying va nima bo'lishini kuzating.

## Rasmiy hujjat

- Hodisa binding: <https://angular.dev/guide/templates/event-listeners>
- Klaviatura hodisalari: <https://angular.dev/guide/templates/event-listeners#listening-for-keyboard-events>
- Host elementi: <https://angular.dev/guide/components/host-elements>
