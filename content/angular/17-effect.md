# 17 — `effect()` va `afterRenderEffect()`

[← Oldingi: Signal nima](16-signal-asoslari.md) · [Mundarija](README.md) · [Keyingi: linkedSignal() →](18-linked-signal.md)

## Tushuncha

`effect` — signal o'zgarganda **yon ta'sir** bajaradigan funksiya:

```ts
import { effect, signal } from '@angular/core';

export class Settings {
  protected readonly theme = signal<'light' | 'dark'>('light');

  constructor() {
    effect(() => {
      localStorage.setItem('theme', this.theme());
    });
  }
}
```

`theme` o'zgarsa — `localStorage` ga yoziladi. `computed` qiymat **qaytaradi**; `effect` hech narsa qaytarmaydi, **tashqi dunyoga ta'sir qiladi**.

| | `computed` | `effect` |
| --- | --- | --- |
| Qaytaradi | Qiymat | Hech narsa |
| Nima uchun | Hisoblash | Tashqi dunyo bilan sinxronlash |
| Qachon ishlaydi | O'qilganda (dangasa) | Bog'liqlik o'zgargandan keyin (o'zi) |
| Signal yozish | ❌ Mumkin emas | Mumkin, lekin ehtiyot bo'ling |

## Nega shunday

Signal dunyosi reaktiv, lekin ilova atrofida reaktiv bo'lmagan narsalar ko'p: `localStorage`, `document.title`, grafik kutubxonasi, analitika, xarita. Ularga "signal o'zgarsa — shu funksiyani chaqir" deyish kerak. `effect` — shu ko'prik.

Rasmiy hujjat buni aniq aytadi: `effect` — **reaktiv bo'lmagan API'lar uchun yon ta'sirlar**. Holat hisoblash uchun emas.

## Kod: qachon ishlaydi — test bilan tekshirilgan

**1. Sinxron emas.** `set` dan keyin darhol ishlamaydi:

```ts
const e = signal(0);
const seen: number[] = [];

effect(() => seen.push(e()));

e.set(1);
e.set(2);
e.set(3);
// seen === [] — hali ishlamadi

// ... Angular o'zgarishlarni qayta ishlagandan keyin:
// seen === [3] — bir marta, oxirgi qiymat bilan
```

Uch marta `set` — bir marta ishga tushish, oraliq qiymatlar (1, 2) ko'rilmaydi. Bu yaxshi: `effect` "har o'zgarish uchun" emas, "holat barqarorlashgandan keyin" ishlaydi.

**2. Birinchi marta o'zi ishlaydi** — bog'liqliklarni aniqlash uchun. Keyin faqat bog'liqlik o'zgarganda.

**3. Tozalash (cleanup)** — qayta ishlashdan oldin:

```ts
effect((onCleanup) => {
  const id = this.userId();
  const timer = setInterval(() => this.poll(id), 5000);

  onCleanup(() => clearInterval(timer));
});
```

Tekshirilgan tartib: `run:a → clean:a → run:b`. `userId` o'zgarsa — avval eski taymer to'xtatiladi, keyin yangisi boshlanadi. Komponent yo'q qilinganda ham `onCleanup` chaqiriladi.

## Kod: `untracked` — o'qish, lekin bog'lanmaslik

Ba'zan effect ichida signalni o'qish kerak, lekin u o'zgarganda effect **qayta ishlamasin**:

```ts
import { effect, untracked } from '@angular/core';

effect(() => {
  const page = this.currentPage();               // kuzatiladi

  untracked(() => {
    // user o'zgarsa effect qayta ishlamaydi
    this.analytics.track('page_view', { page, user: this.user()?.id });
  });
});
```

Tekshirildi: `untracked` ichidagi signal o'zgarsa — effect qayta ishlamaydi; tashqaridagisi o'zgarsa — ishlaydi.

Qachon kerak: effect ichida chaqirilgan metod o'zi signallarni o'qisa. Bilmasdan bog'liqlik qo'shilib, effect kutilmagan paytda ishlaydi. `untracked` bilan o'rab, faqat kerakli signallarga bog'lang.

## Kod: qayerda yaratish

`effect` — **injection kontekstida** yaratiladi: konstruktor, maydon initsializatori yoki `inject()` ishlaydigan joy (35-bob):

```ts
export class Profile {
  private readonly userId = input.required<number>();

  // ✅ maydon
  private readonly logEffect = effect(() => console.log('user', this.userId()));

  constructor() {
    // ✅ konstruktor
    effect(() => { ... });
  }

  ngOnInit() {
    // ❌ NG0203 — injection kontekstidan tashqari
    effect(() => { ... });
  }
}
```

Tashqarida yaratish kerak bo'lsa — injector'ni uzating:

```ts
private readonly injector = inject(Injector);

protected startWatching() {
  effect(() => { ... }, { injector: this.injector });
}
```

Effect komponent (yoki xizmat) bilan birga **o'zi yo'q qilinadi**. Qo'lda to'xtatish kerak bo'lsa — `effect()` qaytargan `EffectRef.destroy()`.

## Kod: yaxshi va yomon effectlar

**✅ Yaxshi — reaktiv bo'lmagan dunyo bilan sinxronlash:**

```ts
// Sahifa sarlavhasi
effect(() => {
  document.title = `${this.unread()} ta yangi xabar — Pochta`;
});

// localStorage
effect(() => {
  localStorage.setItem('cart', JSON.stringify(this.cart.items()));
});

// Uchinchi tomon kutubxonasi
effect(() => {
  this.chart?.update({ data: this.series() });
});

// Loglash
effect(() => {
  if (this.errors().length) console.warn('Forma xatolari:', this.errors());
});
```

**❌ Yomon — signaldan signal hisoblash:**

```ts
// ❌ effect bilan sinxronlash
protected readonly firstName = signal('Ali');
protected readonly lastName = signal('Valiyev');
protected readonly fullName = signal('');

constructor() {
  effect(() => {
    this.fullName.set(`${this.firstName()} ${this.lastName()}`);
  });
}
```

Muammolar: `fullName` bir lahza eski qiymat bilan turadi (effect sinxron emas), qo'shimcha o'zgarishlarni aniqlash sikli, va mantiq tushunarsiz.

```ts
// ✅
protected readonly fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
```

Qoida: **effect ichida `set` yozayotgan bo'lsangiz — to'xtang va o'ylang**. Deyarli har doim `computed` yoki `linkedSignal` (18-bob) to'g'riroq.

| Vazifa | Vosita |
| --- | --- |
| Boshqa signallardan qiymat | `computed` |
| Boshqa signaldan boshlanib, qo'lda o'zgartiriladigan qiymat | `linkedSignal` (18-bob) |
| Signal asosida serverdan ma'lumot | `resource` / `httpResource` (20–21-bob) |
| DOM, `localStorage`, kutubxona, log | `effect` |

## Kod: `afterRenderEffect` — DOM bilan ishlash

`effect` o'zgarishlarni aniqlashdan **oldin** ham ishlashi mumkin — DOM hali yangilanmagan bo'ladi. DOM'ni o'qish yoki o'zgartirish kerak bo'lsa — `afterRenderEffect`:

```ts
import { ElementRef, afterRenderEffect, inject, input, viewChild } from '@angular/core';

export class AutoGrowTextarea {
  readonly value = input('');
  private readonly textarea = viewChild.required<ElementRef<HTMLTextAreaElement>>('ta');

  constructor() {
    afterRenderEffect(() => {
      this.value();                                 // bog'liqlik
      const el = this.textarea().nativeElement;

      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;     // DOM chizilgandan keyin o'lchash
    });
  }
}
```

Ko'p o'qish-yozish bo'lsa — bosqichlarga bo'lish, brauzer "layout thrashing" qilmasin:

```ts
afterRenderEffect({
  earlyRead: () => this.container().nativeElement.getBoundingClientRect().width,
  write: (width) => {
    this.chart().nativeElement.style.width = `${width()}px`;
  },
});
```

| Bosqich | Nima uchun |
| --- | --- |
| `earlyRead` | DOM'dan o'qish (yozishdan oldin) |
| `write` | DOM'ga yozish |
| `mixedReadWrite` | Ikkalasi — iloji boricha qochish |
| `read` | Yozishdan keyin o'qish |

`afterRenderEffect` serverda (SSR) **ishlamaydi** — u yerda DOM yo'q. Bu uni `window`, `document` bilan ishlash uchun xavfsiz qiladi.

## Muhandislik nuqtai nazari: effect ko'p bo'lsa

Komponentda 5–6 ta `effect` — deyarli har doim ogohlantiruvchi belgi. Tekshiring:

| Belgi | Ehtimoliy muammo |
| --- | --- |
| Effect ichida `set` | `computed` yoki `linkedSignal` bo'lishi kerak |
| Effect boshqa effect yozgan signalni o'qiydi | Zanjir — mantiqni tushunish qiyin |
| Effect HTTP so'rov yuboradi | `resource` / `httpResource` bo'lishi kerak |
| Effect ichida `if (this.x() !== this.prev)` | Qo'lda o'zgarish kuzatish — `linkedSignal` |

Yaxshi yozilgan komponentda effect kam: bitta-ikkita, har biri tashqi API bilan sinxronlash uchun.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Signaldan signal hisoblash uchun effect | Bir lahza eski qiymat, qo'shimcha sikl | `computed` |
| Effect `set` dan keyin darhol ishlaydi deb o'ylash | Testda noto'g'ri natija | Effect sinxron emas |
| `ngOnInit` da effect | NG0203 | Konstruktor yoki `injector` |
| `onCleanup` siz taymer/obuna | Xotira oqishi, ikki taymer | `onCleanup(...)` |
| Effect ichida metod chaqirish (u signal o'qiydi) | Kutilmagan bog'liqlik | `untracked` |
| Effect ichida HTTP so'rov | Poyga holati, bekor qilish yo'q | `resource` |
| DOM o'lchashni `effect` da | DOM hali yangilanmagan | `afterRenderEffect` |
| Effect zanjiri (A → signal → B → signal → C) | Tushunib bo'lmaydi | `computed` bilan qayta quring |

## Amaliyot

1. `theme` ni `localStorage` ga saqlaydigan effect yozing; sahifani yangilab, tiklanishini tekshiring.
2. Effect ichida `console.log` qo'yib, uchta ketma-ket `set` dan keyin necha marta ishlashini sanang.
3. `userId` o'zgarganda eski taymerni to'xtatib yangisini boshlaydigan effect yozing — `onCleanup` ni olib tashlab, taymerlar ko'payishini ko'ring.
4. `fullName` ni effect bilan yozing, keyin `computed` ga o'tkazing — farqni tushuntiring.
5. `untracked` bilan analitika effect yozing; `user` o'zgarsa effect ishlamasligini tekshiring.
6. `AutoGrowTextarea` ni `afterRenderEffect` bilan yozing.

## Rasmiy hujjat

- Effectlar: <https://angular.dev/guide/signals/effect>
- `afterRenderEffect`: <https://angular.dev/api/core/afterRenderEffect>
- `untracked`: <https://angular.dev/api/core/untracked>
