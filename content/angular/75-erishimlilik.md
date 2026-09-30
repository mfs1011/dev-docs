# 75 — Erishimlilik

[← Oldingi: Unumdorlik](74-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](76-xavfsizlik.md)

## Tushuncha

Erishimlilik (accessibility, a11y) — ilovadan **hamma** foydalana olishi: ekran o'quvchisi (VoiceOver, NVDA, TalkBack), faqat klaviatura, kattalashtirilgan shrift, rang ko'rishda muammo, harakatga sezgirlik. Standart — **WCAG 2.2**, AA darajasi.

To'rt tamoyil (POUR):

| Tamoyil | Ma'no | Misol |
| --- | --- | --- |
| **Perceivable** | Qabul qilsa bo'ladi | Rasmga `alt`, yetarli kontrast |
| **Operable** | Boshqarsa bo'ladi | Klaviatura bilan hamma narsa |
| **Understandable** | Tushunarli | Aniq xato xabarlari, `lang` |
| **Robust** | Yordamchi texnologiyalar bilan ishlaydi | To'g'ri HTML, ARIA |

## Nega shunday

SPA'lar erishimlilikni oddiy saytlardan ko'ra osonroq buzadi: `<div (click)>` tugmalar, sahifa almashganini ekran o'quvchisi sezmaydi, dinamik kontent e'lon qilinmaydi, modal fokusni ushlamaydi. Angular vositalari (CDK, Aria, Router) bularni hal qiladi — lekin ularni ishlatish kerak.

Ko'p mamlakatlarda (EU Accessibility Act 2025 dan) ommaviy xizmatlar uchun erishimlilik — **qonuniy talab**.

## Kod: semantik HTML — birinchi qadam

```html
<!-- ❌ -->
<div class="btn" (click)="save()">Saqlash</div>
<div class="link" (click)="router.navigate(['/about'])">Biz haqimizda</div>

<!-- ✅ -->
<button type="button" (click)="save()">Saqlash</button>
<a routerLink="/about">Biz haqimizda</a>
```

`<button>` bepul beradi: fokus, Enter/Space, `role="button"`, `disabled`. `<div>` bilan buni qayta yozish — `tabindex="0"`, `role="button"`, `(keydown.enter)`, `(keydown.space)`... va baribir kamchilik qoladi.

Sahifa tuzilishi:

```html
<header>...</header>
<nav aria-label="Asosiy menyu">...</nav>
<main id="main" tabindex="-1">
  <h1>{{ title() }}</h1>          <!-- har sahifada bitta h1 -->
  ...
</main>
<footer>...</footer>
```

Sarlavhalar ierarxiyasi (`h1 → h2 → h3`) — ekran o'quvchi foydalanuvchilari sahifani shular bo'yicha "varaqlaydi".

`index.html` da `lang="uz"` (3-bob) — ekran o'quvchisi to'g'ri talaffuz qiladi.

## Kod: formalar

```html
<label for="email">Email</label>
<input id="email" type="email" [formField]="form.email" aria-describedby="email-hint email-errors" />
<small id="email-hint">Ish emailingiz</small>
<app-field-errors [field]="form.email" id="email-errors" />
```

| Qoida | Nega |
| --- | --- |
| Har input'ga `<label>` | Placeholder label emas — yozganda yo'qoladi |
| Xato `aria-describedby` bilan bog'langan | Ekran o'quvchi xatoni o'qiydi |
| Xatolar ro'yxati `role="alert"` | Paydo bo'lganda e'lon qilinadi |
| Majburiy maydon | Signal Forms `required()` native `required` qo'yadi (49-bob) |
| Yuborishda xato bo'lsa — fokus birinchi xatoga | `focusBoundControl()` (51-bob) |

## Kod: marshrut almashishini e'lon qilish

SPA'da sahifa almashganda ekran o'quvchisi **jim** — hech narsa qayta yuklanmadi. Ikki narsa kerak:

```ts
export class App {
  private readonly router = inject(Router);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly title = inject(Title);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => {
        // 1. Fokusni asosiy kontentga
        this.main().nativeElement.focus({ preventScroll: true });
        // 2. Yangi sahifa nomini e'lon qilish
        afterNextRender(() => this.announcer.announce(this.title.getTitle()), { injector: this.injector });
      });
  }

  private readonly injector = inject(Injector);
}
```

Har marshrutda `title` (46-bob) — e'lon uchun ham kerak.

**"Kontentga o'tish" havolasi** — klaviatura foydalanuvchisi har sahifada menyuni 20 marta Tab bosib o'tmasin:

```html
<a class="skip-link" href="#main">Asosiy kontentga o'tish</a>
```

```css
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 16px; top: 16px; z-index: 100; }
```

## Kod: dinamik kontent

```ts
// Savatga qo'shildi, saqlandi, 5 ta natija topildi
inject(LiveAnnouncer).announce("Savatga qo'shildi");
```

```html
<!-- Yoki shablonda -->
<div aria-live="polite">{{ results().length }} ta natija</div>
```

| `aria-live` | Qachon |
| --- | --- |
| `polite` | Oddiy xabarlar — joriy o'qish tugagach |
| `assertive` | Shoshilinch (xato, sessiya tugadi) — darhol |

Yuklanish holati:

```html
<section [attr.aria-busy]="products.isLoading()">...</section>
```

## Kod: murakkab vidjetlar — o'zingiz yozmang

| Vidjet | Vosita |
| --- | --- |
| Modal | CDK `Dialog` — fokus tuzog'i, Escape, fokusni qaytarish (66-bob) |
| Tabs, accordion, menu, listbox, combobox | `@angular/aria` (67-bob) |
| Tooltip, dropdown | CDK Overlay + Aria |

67-bobda tekshirilgan: Aria tabs `role`, `aria-selected`, roving `tabindex`, `aria-controls`, strelkalar — hammasini o'zi qo'yadi. Qo'lda yozilgan tabs'da bularning yarmi odatda yo'q.

## Kod: ko'rinish

```css
/* Fokus — hech qachon olib tashlamang */
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Harakatga sezgirlar uchun */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

| Talab | Qiymat (WCAG AA) |
| --- | --- |
| Matn kontrasti | ≥ 4.5:1 (katta matn 3:1) |
| UI elementlar kontrasti | ≥ 3:1 |
| Bosish maydoni | ≥ 24×24 px (tavsiya 44×44) |
| Faqat rang bilan ma'lumot | Yo'q — ikon/matn ham |

Xato holati — faqat qizil rang emas: ikon + matn ("⚠ Email noto'g'ri").

## Kod: avtomatik tekshiruv

```bash
ng add angular-eslint
```

```js
// eslint.config.js
...angular.configs.templateAccessibility,
```

`templateAccessibility` qoidalari: `alt-text`, `label-has-associated-control`, `click-events-have-key-events`, `interactive-supports-focus`, `valid-aria`, `role-has-required-aria`... Angular kompilyatorining o'zida a11y diagnostikalari yo'q (tekshirildi — kengaytirilgan diagnostikalar ro'yxatida yo'q), shuning uchun ESLint.

Brauzerda: axe DevTools kengaytmasi, Lighthouse Accessibility; E2E'da `@axe-core/playwright` (73-bob).

## Muhandislik nuqtai nazari

Avtomatik vositalar muammolarning bir qismini topadi. Qolgani — **qo'lda**, har reliz oldidan 10 daqiqa:

1. Sichqonchani qo'yib, faqat **klaviatura** bilan asosiy oqimni bajaring (Tab, Shift+Tab, Enter, Escape, strelkalar). Fokus doim ko'rinadimi?
2. **Ekran o'quvchisini** yoqing (macOS: Cmd+F5 VoiceOver) — sahifa almashishi, forma xatolari e'lon qilinadimi?
3. Brauzerni **200% kattalashtiring** — kontent sig'adimi, gorizontal scroll yo'qmi?
4. Tizimda "harakatni kamaytirish" ni yoqing.

Erishimlilik — dizayndan boshlanadi: kontrast, fokus holatlari, xato holatlari maketlarda bo'lsin.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `<div (click)>` | Klaviatura va ekran o'quvchi uchun ishlamaydi | `<button>` / `<a routerLink>` |
| `outline: none` | Klaviatura foydalanuvchisi adashadi | `:focus-visible` stili |
| Placeholder label o'rnida | Yozganda yo'qoladi | `<label>` |
| Marshrut almashishi e'lon qilinmaydi | Ekran o'quvchi foydalanuvchi adashadi | Fokus + `LiveAnnouncer` |
| O'z modal/tabs | Fokus, ARIA kamchiliklari | CDK / Aria |
| Rasmda `alt` yo'q | Ma'lumot yo'qoladi | Mazmunli `alt` yoki bezak uchun `alt=""` |
| Faqat rang bilan xato | Rang ko'rishda muammo bo'lganlar ko'rmaydi | Ikon + matn |
| `lang="en"` | Noto'g'ri talaffuz | `lang="uz"` |

## Amaliyot

1. Ilovadagi barcha `(click)` li `div`/`span` larni toping va almashtiring.
2. Skip-link, `<main tabindex="-1">`, marshrutda fokus + e'lon.
3. Formalarda label, `aria-describedby`, xatoga fokus.
4. `angular-eslint` + `templateAccessibility` — xatolarni tuzating.
5. VoiceOver/NVDA bilan checkout oqimini o'ting.
6. Kontrastni axe bilan tekshiring.

## Rasmiy hujjat

- Angular erishimlilik: <https://angular.dev/best-practices/a11y>
- WCAG 2.2: <https://www.w3.org/TR/WCAG22/>
- WAI-ARIA naqshlari: <https://www.w3.org/WAI/ARIA/apg/patterns/>
- angular-eslint: <https://github.com/angular-eslint/angular-eslint>
