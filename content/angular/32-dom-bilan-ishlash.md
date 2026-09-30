# 32 — DOM bilan ishlash

[← Oldingi: Hayot sikli](31-hayot-sikli.md) · [Mundarija](README.md) · [Keyingi: Dinamik komponentlar →](33-dinamik-komponentlar.md)

## Tushuncha

Angular'da DOM'ni odatda **shablon** boshqaradi — binding'lar, `@if`, `@for`. Siz `document.querySelector` yoki `element.style` yozmaysiz.

Lekin ba'zan to'g'ridan-to'g'ri DOM kerak:

| Vazifa | Misol |
| --- | --- |
| Fokus | Modal ochilganda birinchi maydonga |
| O'lchash | Element balandligi, ko'rinish maydoniga kirdimi |
| Scroll | Xatoli maydonga, yangi xabarga |
| Uchinchi tomon kutubxonasi | Xarita, grafik, muharrir |
| Brauzer API'lari | `ResizeObserver`, `IntersectionObserver`, clipboard |

Bu bob — buni **xavfsiz** qilish: SSR'da sinmasin, xotira oqmasin, Angular bilan to'qnashmasin.

## Nega shunday

Uchta xavf:

1. **Server rendering.** SSR'da (62-bob) kod serverda ham ishlaydi, u yerda `window`, `document`, `localStorage` yo'q. `window.innerWidth` — `ReferenceError`.
2. **Vaqt.** Element hali yaratilmagan yoki DOM'ga qo'shilmagan bo'lishi mumkin.
3. **Angular bilan to'qnashuv.** Angular boshqaradigan elementni qo'lda o'zgartirsangiz — keyingi yangilanishda Angular uni qaytarib yozadi yoki sizning o'zgarishingiz yo'qoladi.

## Kod: elementga murojaat

```ts
import { Component, ElementRef, inject, viewChild } from '@angular/core';

export class Editor {
  // Komponentning o'z host elementi
  private readonly host = inject(ElementRef<HTMLElement>);

  // Shablondagi element
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('ta');
}
```

`ElementRef.nativeElement` — haqiqiy DOM elementi. Undan faqat **o'qish** va **imperativ chaqiruvlar** (`focus`, `scrollIntoView`, `getBoundingClientRect`) uchun foydalaning. Klass, stil, atribut — binding orqali.

## Kod: qachon — `afterNextRender`

DOM bilan ishlashning to'g'ri joyi — `afterNextRender` yoki `afterRenderEffect` (31, 17-boblar). Ular:

| Kafolat | Nega muhim |
| --- | --- |
| DOM chizilgan | Element bor, o'lchami to'g'ri |
| Faqat brauzerda | SSR'da chaqirilmaydi — `window` xavfsiz |

```ts
export class ChatWindow {
  private readonly list = viewChild.required<ElementRef<HTMLElement>>('list');
  readonly messages = input.required<Message[]>();

  constructor() {
    // Yangi xabar kelganda pastga scroll
    afterRenderEffect(() => {
      this.messages();                               // bog'liqlik
      const el = this.list().nativeElement;

      el.scrollTop = el.scrollHeight;
    });
  }
}
```

## Kod: brauzer API'lari — kuzatuvchilar

`ResizeObserver` — element o'lchami o'zgarganda:

```ts
export class ResponsiveChart {
  private readonly host = inject(ElementRef<HTMLElement>);
  protected readonly width = signal(0);

  constructor() {
    afterNextRender(() => {
      const observer = new ResizeObserver(([entry]) => {
        this.width.set(entry.contentRect.width);
      });

      observer.observe(this.host.nativeElement);

      inject(DestroyRef).onDestroy(() => observer.disconnect());
    });
  }
}
```

Diqqat: `afterNextRender` callback'i ichida `inject()` ishlaydimi? — **yo'q**, u injection kontekstida emas. Tekshirildi:

```
NG0203: The `DestroyRef` token injection failed. `inject()` function must be called
from an injection context...
```

`DestroyRef` ni oldindan olish kerak:

```ts
constructor() {
  const destroyRef = inject(DestroyRef);          // ✅ konstruktorda

  afterNextRender(() => {
    const observer = new ResizeObserver(...);
    observer.observe(this.host.nativeElement);

    destroyRef.onDestroy(() => observer.disconnect());
  });
}
```

`IntersectionObserver` — element ko'rinishga kirganda (masalan "ko'rildi" belgisi yoki animatsiya):

```ts
@Directive({ selector: '[appInView]' })
export class InView {
  readonly appInView = output<boolean>();

  constructor() {
    const el = inject(ElementRef<HTMLElement>);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new IntersectionObserver(([entry]) => this.appInView.emit(entry.isIntersecting), {
        threshold: 0.5,
      });

      observer.observe(el.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
```

Komponentni kechiktirib yuklash uchun esa `@defer (on viewport)` (12-bob) — o'zi `IntersectionObserver` ishlatadi.

## Kod: `document` va `window` — DI orqali

```ts
import { DOCUMENT, inject } from '@angular/core';

export class ThemeService {
  private readonly document = inject(DOCUMENT);

  apply(theme: 'light' | 'dark') {
    this.document.documentElement.dataset['theme'] = theme;
  }
}
```

`inject(DOCUMENT)` — serverda ham ishlaydi (SSR soxta `document` beradi) va testda almashtiriladi. Global `document` — yo'q.

`window`, `localStorage`, `navigator` — faqat brauzerda. Platformani tekshirish:

```ts
import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Service()
export class Storage {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  get(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }
}
```

Ko'p hollarda `isPlatformBrowser` kerak emas — kodni `afterNextRender` ichiga qo'yish yetarli, u baribir faqat brauzerda ishlaydi.

## Kod: `Renderer2` — kerakmi

`Renderer2` — DOM'ni Angular orqali o'zgartirish API'si:

```ts
private readonly renderer = inject(Renderer2);

this.renderer.addClass(el, 'active');
this.renderer.setStyle(el, 'width', '100px');
this.renderer.listen(el, 'click', handler);
```

Ilgari u "to'g'ri yo'l" hisoblanardi — serverda ham, Web Worker'da ham ishlaydi. Bugun ko'p hollarda **binding yaxshiroq**:

| Vazifa | Yaxshiroq |
| --- | --- |
| Klass qo'shish | `[class.active]` yoki `host: { '[class.active]': ... }` |
| Stil | `[style.width.px]` |
| Hodisa | `(click)` yoki `host: { '(click)': ... }` |
| Dinamik yaratilgan element (kutubxona ichida) | `Renderer2` hali ham o'rinli |

`Renderer2` ni kod bazasida ko'rsangiz — ko'pincha uni binding bilan almashtirish mumkin.

## Kod: `nativeElement.innerHTML` — xavfli

```ts
// ❌ XSS teshigi
this.el().nativeElement.innerHTML = this.userComment();
```

Angular'ning avtomatik tozalashi (sanitize) faqat **binding'da** ishlaydi. `nativeElement.innerHTML` ga to'g'ridan-to'g'ri yozish — himoyasiz. Foydalanuvchi matni `<img src=x onerror=...>` bo'lsa — kod bajariladi.

```html
<!-- ✅ tozalanadi -->
<div [innerHTML]="userComment()"></div>

<!-- ✅✅ matn sifatida — eng xavfsiz -->
<div>{{ userComment() }}</div>
```

Xavfsizlik — 76-bobda.

## Muhandislik nuqtai nazari: uchinchi tomon kutubxonasini o'rash

Xarita, grafik, muharrir — ularni to'g'ridan-to'g'ri sahifada emas, **o'rovchi komponent**da ulang:

```ts
@Component({
  selector: 'app-line-chart',
  template: `<canvas #canvas></canvas>`,
})
export class LineChart {
  readonly data = input.required<number[]>();
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: ChartInstance;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.chart = new Chart(this.canvas().nativeElement, { type: 'line', data: this.data() });
      destroyRef.onDestroy(() => this.chart?.destroy());
    });

    // Ma'lumot o'zgarsa — yangilash
    afterRenderEffect(() => {
      const data = this.data();

      if (this.chart) {
        this.chart.data = data;
        this.chart.update();
      }
    });
  }
}
```

Foyda: kutubxona bitta joyda, ilovaning qolgan qismi `<app-line-chart [data]="sales()" />` ni biladi, xolos. Kutubxonani almashtirish — bitta faylni o'zgartirish. Og'ir kutubxonani `@defer` bilan kechiktirish ham oson.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Konstruktorda `window` / `document.querySelector` | SSR'da `ReferenceError` | `afterNextRender`, `inject(DOCUMENT)` |
| `afterNextRender` ichida `inject()` | NG0203 — kontekst yo'q | Oldindan konstruktorda oling |
| Kuzatuvchini `disconnect` qilmaslik | Xotira oqishi | `destroyRef.onDestroy` |
| `nativeElement.style/classList` o'zgartirish | Angular bilan to'qnashuv | Binding |
| `nativeElement.innerHTML` ga foydalanuvchi matni | XSS | `{{ }}` yoki `[innerHTML]` |
| Global `document` | Testda almashtirib bo'lmaydi | `inject(DOCUMENT)` |
| `afterEveryRender` da DOM sinxronlash | Har yangilanishda ishlaydi | `afterRenderEffect` |
| Kutubxonani sahifa komponentida to'g'ridan-to'g'ri | Tarqoq, almashtirib bo'lmaydi | O'rovchi komponent |

## Amaliyot

1. `ChatWindow` ni yozing: yangi xabar kelganda pastga scroll (`afterRenderEffect`).
2. `ResponsiveChart` da `ResizeObserver` ni ulang; `afterNextRender` ichida `inject(DestroyRef)` qilib NG0203 ni ko'ring, keyin tuzating.
3. `InView` direktivasini yozing va element 50% ko'ringanda hodisa chiqarsin.
4. `ThemeService` ni `inject(DOCUMENT)` bilan yozing.
5. Loyihangizda `Renderer2` ishlatilgan joyni binding bilan almashtiring.
6. Kutubxonani (masalan grafik) o'rovchi komponentga oling va `@defer` bilan kechiktiring.

## Rasmiy hujjat

- DOM API'lari: <https://angular.dev/guide/components/dom-apis>
- `afterNextRender`: <https://angular.dev/api/core/afterNextRender>
- `DOCUMENT`: <https://angular.dev/api/core/DOCUMENT>
- Xavfsizlik: <https://angular.dev/best-practices/security>
