# 31 — Hayot sikli

[← Oldingi: Stil, enkapsulatsiya va animatsiya](30-stil-va-enkapsulatsiya.md) · [Mundarija](README.md) · [Keyingi: DOM bilan ishlash →](32-dom-bilan-ishlash.md)

## Tushuncha

Komponent **yaratiladi**, ekranga **chiziladi**, **yangilanadi** va **yo'q qilinadi**. Har bosqichda Angular kodingizni chaqirishi mumkin — bu hayot sikli hooklari.

Angular 22 da haqiqiy tartib (test bilan o'lchangan):

```
YARATISH
  constructor
  ngOnChanges          ← kiritmalar birinchi marta keldi
  ngOnInit
  effect (birinchi)    ← komponent effectlari
  ngAfterContentInit   ← proyeksiya qilingan kontent tayyor
  ngAfterViewInit      ← o'z shabloni tayyor
  afterNextRender      ← DOM chizildi (bir marta)
  afterEveryRender     ← DOM chizildi (har safar)

KIRITMA O'ZGARDI
  ngOnChanges
  effect
  afterEveryRender

YO'Q QILISH
  ngOnDestroy
  DestroyRef.onDestroy
```

Diqqat: **signal `input` ham `ngOnChanges` ni chaqiradi** — tekshirildi. Eski va yangi API birga ishlaydi.

## Nega shunday

Eski Angular'da hooklar ko'p ishni bajarardi: `ngOnChanges` — kiritma o'zgarishiga javob, `ngOnInit` — ma'lumot yuklash, `ngAfterViewInit` — `@ViewChild` tayyor bo'lishi, `ngOnDestroy` — obunalarni tozalash.

Signallar bu ishlarning ko'pini boshqa vositalarga o'tkazdi:

| Eski usul | Bugun |
| --- | --- |
| `ngOnChanges` — kiritmadan hisoblash | `computed` (25-bob) |
| `ngOnInit` — ma'lumot yuklash | `resource` / `httpResource` (20–21) |
| `ngAfterViewInit` — `@ViewChild` ni kutish | `viewChild` signal + `afterNextRender` (27) |
| `ngOnDestroy` — obunani bekor qilish | `takeUntilDestroyed`, `toSignal`, `DestroyRef` (24) |
| `ngDoCheck` — qo'lda o'zgarish tekshirish | Signal |

Natija: zamonaviy komponentda hooklar **kam**. Bu yaxshi — kod "qachon" emas, "nima" haqida bo'ladi.

## Kod: hali ham kerak bo'lgan hooklar

**`ngOnInit`** — kiritmalar tayyor bo'lgandan keyin bir marta bajariladigan boshlang'ich ish. Ko'pincha konstruktor + `computed` yetadi, lekin bir martalik imperativ ish uchun qoladi:

```ts
export class Chart {
  readonly config = input.required<ChartConfig>();

  ngOnInit() {
    analytics.track('chart_viewed', { type: this.config().type });
  }
}
```

**`afterNextRender`** — DOM chizilgandan keyin bir marta. Uchinchi tomon kutubxonasi, o'lchash, fokus:

```ts
export class MapView {
  private readonly container = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private map?: LeafletMap;

  constructor() {
    afterNextRender(() => {
      this.map = L.map(this.container().nativeElement).setView([41.31, 69.28], 12);
    });

    inject(DestroyRef).onDestroy(() => this.map?.remove());
  }
}
```

`afterNextRender` **serverda ishlamaydi** — SSR'da xarita kutubxonasi `window` topolmay yiqilmaydi (32-bob).

**`DestroyRef.onDestroy`** — tozalash. `ngOnDestroy` dan afzalligi: tozalash kodi **yaratish** kodi yonida turadi:

```ts
constructor() {
  const socket = new WebSocket('wss://example.com/live');
  socket.onmessage = (e) => this.messages.update((l) => [...l, JSON.parse(e.data)]);

  inject(DestroyRef).onDestroy(() => socket.close());      // shu yerda — yaratish yonida
}
```

`ngOnDestroy` bilan `socket` ni maydonga saqlab, klassning boshqa joyida yopish kerak edi.

## Kod: `afterNextRender` va `afterEveryRender`

| | `afterNextRender` | `afterEveryRender` |
| --- | --- | --- |
| Qachon | Keyingi chizishdan keyin, **bir marta** | **Har** chizishdan keyin |
| Serverda | Ishlamaydi | Ishlamaydi |
| Ishlatilishi | Kutubxonani ishga tushirish, birinchi o'lchash | Kamdan-kam — har yangilanishda DOM sinxronlash |

`afterEveryRender` — qimmat: har o'zgarishlarni aniqlashdan keyin ishlaydi. Deyarli har doim `afterRenderEffect` (17-bob) to'g'riroq — u faqat bog'liq signal o'zgarganda ishlaydi.

Bosqichlar bilan (o'qish va yozishni ajratish):

```ts
afterNextRender({
  earlyRead: () => this.el().nativeElement.offsetHeight,
  write: (height) => { this.spacer().nativeElement.style.height = `${height}px`; },
});
```

Diqqat — ikki API'da bosqich argumenti **boshqacha** (tekshirildi):

| API | `write` nima oladi | Yozilishi |
| --- | --- | --- |
| `afterNextRender` | Oddiy qiymat | `write: (height) => ... height ...` |
| `afterRenderEffect` | **Signal** | `write: (width) => ... width() ...` |

`afterNextRender` da `height()` yozsangiz — `TS2349: This expression is not callable`.

## Kod: eski hooklar nima qilardi — o'qish uchun

Eski kodni o'qiyotganda uchraydigan hooklar:

| Hook | Qachon | Bugun kerakmi |
| --- | --- | --- |
| `ngOnChanges(changes)` | Kiritma o'zgarganda, `SimpleChanges` bilan | Kamdan-kam — `computed` |
| `ngOnInit()` | Birinchi `ngOnChanges` dan keyin, bir marta | Ba'zan |
| `ngDoCheck()` | Har o'zgarishlarni aniqlashda | Deyarli hech qachon |
| `ngAfterContentInit()` | Proyeksiya tayyor, bir marta | Kamdan-kam — `contentChild` signal |
| `ngAfterContentChecked()` | Har tekshirishdan keyin | Deyarli hech qachon |
| `ngAfterViewInit()` | Shablon tayyor, bir marta | `afterNextRender` |
| `ngAfterViewChecked()` | Har tekshirishdan keyin | Deyarli hech qachon |
| `ngOnDestroy()` | Yo'q qilinishdan oldin | `DestroyRef` |

`implements OnInit, OnDestroy` — faqat tip tekshiruvi uchun, majburiy emas, lekin foydali: metod nomida xato qilsangiz (`ngOninit`), kompilyator aytadi.

## Kod: hook ichida uzun mantiq — yo'q

Uslub qo'llanmasi: hook ichiga uzun mantiq yozmang, **nomlangan metod** chaqiring:

```ts
// ❌
ngOnInit() {
  const saved = localStorage.getItem('filters');
  if (saved) {
    const parsed = JSON.parse(saved);
    this.status.set(parsed.status ?? 'all');
    this.sort.set(parsed.sort ?? 'date');
    // ... yana 15 qator
  }
}

// ✅
ngOnInit() {
  this.restoreFilters();
}

private restoreFilters() { ... }
```

Hook "qachon", metod nomi "nima" deydi.

## Muhandislik nuqtai nazari: zamonaviy komponent skeleti

Signal davridagi odatiy komponent — deyarli hooksiz:

```ts
@Component({ ... })
export class OrderDetails {
  // 1. Kiritmalar
  readonly orderId = input.required<number>();

  // 2. Bog'liqliklar
  private readonly api = inject(OrderApi);

  // 3. Ma'lumot — kiritmadan o'zi yuklanadi
  protected readonly order = this.api.byId(this.orderId);

  // 4. Hisoblangan qiymatlar
  protected readonly total = computed(() => ...);

  // 5. Yon ta'sirlar (kerak bo'lsa)
  constructor() {
    effect(() => {
      document.title = `Buyurtma ${this.orderId()}`;
    });
  }

  // 6. Harakatlar
  protected cancel() { ... }
}
```

`ngOnInit`, `ngOnChanges`, `ngOnDestroy` yo'q — kerak ham emas. Ma'lumot `input` o'zgarganda o'zi qayta yuklanadi, tozalash o'zi bo'ladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `ngOnChanges` da kiritmadan hisoblash | Ortiqcha kod, `SimpleChanges` bilan qiyin | `computed` |
| `ngOnInit` da `subscribe` + `ngOnDestroy` da `unsubscribe` | Tozalash unutiladi | `toSignal` yoki `takeUntilDestroyed` |
| `ngAfterViewInit` da DOM kutubxonasi | SSR'da `window is not defined` | `afterNextRender` |
| `afterEveryRender` da og'ir ish | Har yangilanishda | `afterRenderEffect` |
| `ngDoCheck` bilan o'zgarish kuzatish | Juda tez-tez chaqiriladi | Signal |
| Hook ichida 30 qator | O'qib bo'lmaydi | Nomlangan metod |
| `ngOninit` (xato nom) | Jim chaqirilmaydi | `implements OnInit` |
| Konstruktorda required `input` o'qish | NG8118 (25-bob) | `computed` yoki `ngOnInit` |

## Amaliyot

1. Bitta komponentga barcha hooklarni `console.log` bilan qo'shing va yaratish, kiritma o'zgarishi, yo'q qilish tartibini o'zingiz kuzating — jadval bilan solishtiring.
2. `ngOnChanges` da kiritmadan hisoblaydigan eski komponentni `computed` ga o'tkazing.
3. WebSocket'ni konstruktorda oching va `DestroyRef.onDestroy` da yoping; sahifadan chiqib, ulanish yopilishini tekshiring.
4. Xarita yoki grafik kutubxonasini `afterNextRender` bilan ulang.
5. Mavjud komponentingizni "zamonaviy skelet" bo'yicha qayta tartiblang — nechta hook qoldi?

## Rasmiy hujjat

- Hayot sikli: <https://angular.dev/guide/components/lifecycle>
- `afterNextRender`: <https://angular.dev/api/core/afterNextRender>
- `DestroyRef`: <https://angular.dev/api/core/DestroyRef>
