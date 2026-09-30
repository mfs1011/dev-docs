# 30 — Stil, enkapsulatsiya va animatsiya

[← Oldingi: Host elementi va hostDirectives](29-host-va-host-directives.md) · [Mundarija](README.md) · [Keyingi: Hayot sikli →](31-hayot-sikli.md)

## Tushuncha

Komponent stillari **faqat o'sha komponentga** ta'sir qiladi:

```ts
@Component({
  selector: 'app-badge',
  template: `<span class="label">{{ text() }}</span>`,
  styles: `
    .label {
      padding: 2px 8px;
      border-radius: 999px;
      background: #eef;
    }
  `,
})
export class Badge {
  readonly text = input.required<string>();
}
```

Boshqa komponentda `.label` klassi bo'lsa — bu stil unga **tegmaydi**. Bu **stil enkapsulatsiyasi**.

## Nega shunday

Oddiy CSS global: `.label` hamma joyga ta'sir qiladi. Katta ilovada 50 ta dasturchi o'z `.title`, `.card`, `.button` klasslarini yozadi — ular to'qnashadi, biri boshqasini buzadi. BEM kabi nomlash qoidalari bu muammoni qo'lda hal qilishga urinadi.

Angular buni avtomatlashtiradi: kompilyator har komponent stillariga noyob atribut qo'shadi.

```html
<!-- Yakuniy DOM (Angular 22, haqiqiy natija) -->
<app-badge _nghost-a-c1306779797>
  <span _ngcontent-a-c1306779797 class="label">Yangi</span>
</app-badge>
```

```css
/* Yakuniy CSS */
.label[_ngcontent-a-c1306779797] { padding: 2px 8px; ... }
```

Stil faqat shu atributli elementlarga tushadi.

## Kod: enkapsulatsiya rejimlari

Rasmiy hujjat to'rtta rejimni sanaydi:

```ts
import { ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.Emulated,   // sukut
})
```

| Rejim | Qanday ishlaydi | Qachon |
| --- | --- | --- |
| `Emulated` (sukut) | Atributlar bilan taqlid | Deyarli har doim |
| `ShadowDom` | Brauzerning haqiqiy Shadow DOM'i | Web Components, to'liq izolyatsiya |
| `ExperimentalIsolatedShadowDom` | Qat'iyroq Shadow DOM (eksperimental) | Sinov |
| `None` | Enkapsulatsiya yo'q — stil global | Kamdan-kam — ataylab global stil |

`None` bilan komponent stillari **butun ilovaga** tarqaladi. Bu `styles.css` ga yozish bilan bir xil, faqat qidirish qiyinroq. Global stil kerak bo'lsa — `src/styles.css` ga yozing.

## Kod: `:host` — komponentning o'zi

Host elementi (29-bob) komponent shablonidan **tashqarida**, shuning uchun oddiy selektor unga yetmaydi:

```css
:host {
  display: block;                     /* maxsus element sukut bo'yicha inline */
  border: 1px solid var(--border);
}

:host(.compact) {
  padding: 4px;                       /* <app-card class="compact"> */
}

:host([disabled]) {
  opacity: 0.5;                       /* <app-card disabled> */
}
```

`:host-context()` — ota element holatiga qarab:

```css
:host-context(.dark-theme) {
  background: #1e1e1e;                /* qaysidir ota'da .dark-theme bo'lsa */
}
```

Brauzerlarda `:host-context` eskirgan, lekin Angular kompilyatori uni `Emulated` rejimda to'liq qo'llab-quvvatlaydi. Mavzu uchun CSS o'zgaruvchilari (pastda) odatda yaxshiroq.

## Kod: `::ng-deep` — nega yo'q

Bola komponent ichiga stil "sindirib kirish":

```css
/* ❌ */
:host ::ng-deep .mat-button {
  border-radius: 0;
}
```

Rasmiy hujjat: Angular jamoasi `::ng-deep` ni yangi kodda ishlatishni **qat'iyan tavsiya qilmaydi** — u faqat orqaga moslik uchun qoldirilgan.

Nega yomon:

| Muammo | Tafsilot |
| --- | --- |
| Enkapsulatsiyani buzadi | Bola komponentning ichki tuzilmasiga bog'lanasiz |
| Mo'rt | Bola kutubxona yangilanib klass nomini o'zgartirsa — stil jim yo'qoladi |
| Tarqaladi | `:host` siz yozilsa — butun ilovaga |

O'rniga — **CSS o'zgaruvchilari**. Bola komponent o'zini sozlash nuqtalarini e'lon qiladi:

```css
/* button.css — bola */
:host {
  --button-radius: 8px;
  --button-bg: #2563eb;
}

button {
  border-radius: var(--button-radius);
  background: var(--button-bg);
}
```

```css
/* ota */
.toolbar app-button {
  --button-radius: 0;
  --button-bg: transparent;
}
```

CSS o'zgaruvchilari enkapsulatsiyadan **o'tadi** — bu ularning maqsadi. Bola nimani sozlash mumkinligini o'zi belgilaydi, ota faqat shuni o'zgartiradi. Angular Material ham xuddi shu yo'l bilan sozlanadi (66-bob).

## Kod: stil fayli

```ts
@Component({
  styleUrl: './card.css',          // bitta fayl
  // styleUrls: ['./a.css', './b.css'],   // bir nechta
  // styles: `...`,                // shu faylda
})
```

Byudjet eslatmasi: `angular.json` da **bitta komponent stili** uchun 4 kB ogohlantirish, 8 kB xato (2-bob). Komponent stili 8 kB dan oshsa — build to'xtaydi. Katta stil — belgi: komponent juda ko'p ish qiladi yoki umumiy stil global faylda bo'lishi kerak.

## Kod: animatsiya — `animate.enter` va `animate.leave`

Zamonaviy Angular'da animatsiya — **CSS** va shablondagi ikki maxsus atribut. Rasmiy hujjat: ular direktiva emas, kompilyator to'g'ridan-to'g'ri qo'llab-quvvatlaydi. Import va provayder kerak emas.

```ts
@Component({
  selector: 'app-toast',
  template: `
    @if (visible()) {
      <div class="toast" animate.enter="toast-in" animate.leave="toast-out">
        {{ message() }}
      </div>
    }
  `,
  styles: `
    .toast-in {
      animation: slide-in 200ms ease-out;
    }

    .toast-out {
      animation: slide-out 150ms ease-in forwards;
    }

    @keyframes slide-in {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes slide-out {
      to { opacity: 0; transform: translateY(16px); }
    }
  `,
})
export class Toast {
  readonly message = input.required<string>();
  readonly visible = input(false);
}
```

| Atribut | Qachon | Nima qiladi |
| --- | --- | --- |
| `animate.enter="klass"` | Element DOM'ga qo'shilganda | Klassni qo'shadi, animatsiya tugagach olib tashlaydi |
| `animate.leave="klass"` | Element DOM'dan olib tashlanayotganda | Klassni qo'shadi, animatsiya **tugaguncha** elementni ushlab turadi |

`animate.leave` — asosiy yutuq. Oddiy CSS bilan `@if` elementni **darhol** o'chiradi — chiqish animatsiyasini ko'rsatishga vaqt yo'q. `animate.leave` o'chirishni animatsiya tugaguncha kechiktiradi.

`@for` bilan ham ishlaydi — ro'yxatga qo'shilgan va o'chirilgan elementlar animatsiyalanadi.

Harakatni kamaytirish sozlamasini hurmat qiling (75-bob):

```css
@media (prefers-reduced-motion: reduce) {
  .toast-in, .toast-out {
    animation-duration: 1ms;
  }
}
```

> **Ilgari:** `@angular/animations` paketi — `trigger`, `state`, `transition`, `animate` va `provideAnimationsAsync()`. Endi u **legacy** hisoblanadi va `ng new` uni o'rnatmaydi. Eski loyihalarda ishlaydi; yangi kodda — `animate.enter/leave` va CSS.

## Muhandislik nuqtai nazari: stillar qayerda yashaydi

| Stil turi | Joy |
| --- | --- |
| Reset, tipografiya, rang tokenlari (CSS o'zgaruvchilar) | `src/styles.css` |
| Umumiy yordamchi klasslar (`.sr-only`, `.visually-hidden`) | `src/styles.css` |
| Komponent ko'rinishi | Komponent stil fayli |
| Komponentni tashqaridan sozlash | Komponentning CSS o'zgaruvchilari |
| Tema (light/dark) | `:root` va `[data-theme]` dagi o'zgaruvchilar |

Tailwind ishlatilsa — `ng add` yoki qo'lda sozlanadi, klasslar shablonda, komponent stil fayllari ko'pincha bo'sh qoladi. Bu ham to'g'ri yo'l — muhimi, loyihada **bitta** yondashuv bo'lsin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `:host { display }` yo'q | Kenglik, margin ishlamaydi | `display: block` |
| `::ng-deep` yangi kodda | Mo'rt, rasman tavsiya etilmaydi | CSS o'zgaruvchilari |
| `ViewEncapsulation.None` "tezroq" deb | Stil butun ilovaga tarqaladi | `styles.css` yoki `Emulated` |
| Bola komponentning ichki klassiga ota'dan stil | Enkapsulatsiya ruxsat bermaydi | Bola CSS o'zgaruvchilari |
| Komponent stili 8 kB dan oshdi | Build xatosi | Bo'ling yoki global'ga |
| `@if` bilan chiqish animatsiyasi CSS'da | Element darhol yo'qoladi | `animate.leave` |
| `prefers-reduced-motion` e'tiborsiz | Vestibulyar muammoli foydalanuvchilarga zarar | Media query |
| Yangi kodda `@angular/animations` | Legacy | `animate.enter/leave` |

## Amaliyot

1. Ikki komponentda bir xil `.title` klassini turli stil bilan yozing — to'qnashmasligini DevTools'da `_ngcontent` atributlari bilan tekshiring.
2. `encapsulation: ViewEncapsulation.None` qo'yib, stil boshqa komponentga tarqalishini ko'ring. Qaytaring.
3. `AppButton` ga `--button-radius` va `--button-bg` o'zgaruvchilarini qo'shing va otadan o'zgartiring.
4. `:host(.compact)` va `:host([disabled])` stillarini yozing.
5. `Toast` ni `animate.enter` va `animate.leave` bilan yozing; `animate.leave` siz elementning darhol yo'qolishini solishtiring.
6. `prefers-reduced-motion` ni OS sozlamalarida yoqib, animatsiya qisqarishini tekshiring.

## Rasmiy hujjat

- Komponent stillari: <https://angular.dev/guide/components/styling>
- Animatsiyalar: <https://angular.dev/guide/animations>
- `ViewEncapsulation`: <https://angular.dev/api/core/ViewEncapsulation>
