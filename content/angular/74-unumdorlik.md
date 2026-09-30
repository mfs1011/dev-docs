# 74 — Unumdorlik

[← Oldingi: E2E testlash](73-e2e.md) · [Mundarija](README.md) · [Keyingi: Erishimlilik →](75-erishimlilik.md)

## Tushuncha

Veb unumdorligi — uch **Core Web Vitals** bilan o'lchanadi:

| Metrika | Nima | Yaxshi |
| --- | --- | --- |
| **LCP** (Largest Contentful Paint) | Asosiy kontent qachon ko'rindi | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | Bosishdan ekran yangilanishigacha | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | Sahifa "sakrashi" | ≤ 0.1 |

Angular'da ularga ta'sir qiluvchi to'rt soha:

| Soha | Vosita | Qaysi metrika |
| --- | --- | --- |
| Yuklanadigan JS hajmi | Lazy loading, `@defer`, tree-shaking | LCP, INP |
| Birinchi render | SSR/SSG, incremental hydration | LCP |
| Rasmlar | `NgOptimizedImage` | LCP, CLS |
| Change detection | Signallar, zoneless, OnPush | INP |

## Nega shunday

Angular 22 ko'p narsani sukut bo'yicha to'g'ri qiladi: zoneless, `OnPush` sukut, `strictTemplates`, esbuild. Ko'pgina "sekin Angular ilovalar" — sekin **kod** bilan: katta boshlang'ich bundle, rasmlar, shablonda og'ir hisoblashlar, `track` siz ro'yxatlar. Birinchi qoida: **o'lchang** (70-bob), keyin tuzating.

## Kod: JS hajmi

```ts
// ✅ har bo'lim — alohida chunk
{ path: 'admin', loadChildren: () => import('./admin/admin.routes') },

// ✅ sahifa ichidagi og'ir qism
@defer (on viewport) { <app-chart [data]="stats()" /> } @placeholder { <div class="chart-skeleton"></div> }
```

Tekshirish ro'yxati:

- [ ] `ng build` — "Initial total" qancha? (Bitta sahifali demo: ~275 kB raw, ~76 kB transfer — 63-bob build.)
- [ ] Byudjet `initial` — `maximumError` bilan (70-bob).
- [ ] `browser-stats.json` tahlili: katta kutubxonalar kerakmi?
- [ ] Sana — `Intl`/`DatePipe`, `moment` emas; utilitlar — nuqtaviy import.
- [ ] Lazy bo'limlardan statik import yo'q (43-bob).

## Kod: rasmlar — `NgOptimizedImage`

```ts
import { NgOptimizedImage } from '@angular/common';

@Component({
  imports: [NgOptimizedImage],
  template: `
    <img ngSrc="/hero.jpg" width="1200" height="600" priority alt="Yangi kolleksiya" />
    <img ngSrc="/card.jpg" width="300" height="200" alt="{{ product().name }}" />

    <div class="banner">                  <!-- position: relative -->
      <img ngSrc="/bg.jpg" fill alt="" />
    </div>
  `,
})
```

Tekshirildi — direktiva qo'ygan atributlar:

| Rasm | Natija |
| --- | --- |
| `priority` | `loading="eager"`, `fetchpriority="high"`, `decoding="sync"` |
| Oddiy | `loading="lazy"` |
| `fill` | `sizes="auto, 100vw"`, `position: absolute; width: 100%; height: 100%; inset: 0` |
| `width`/`height` yo'q | **NG02954** — majburiy atributlar yetishmaydi |

`width`/`height` majburiyligi — CLS'ga qarshi: brauzer rasm yuklanguncha joy ajratadi. LCP rasmiga (odatda birinchi katta rasm) — `priority`. Dev rejimida direktiva LCP rasmida `priority` yo'qligi haqida ogohlantiradi.

CDN bilan (Cloudinary, Imgix, ...) — `provideImgixLoader('https://...')` kabi loaderlar: `srcset` avtomatik generatsiya.

## Kod: change detection

Angular 22 sukutlari: **zoneless** + **`OnPush`** (`ChangeDetectionStrategy.Eager` — eski `Default`, faqat `ng update` qo'shgan joylarda). Bu bilan komponent faqat quyidagilarda qayta tekshiriladi:

- Shablonda o'qilgan **signal** o'zgarsa.
- Komponentdagi hodisa tinglovchisi ishlasa.
- `input` o'zgarsa.

Tuzoqlar:

```html
<!-- ❌ har CD siklida qayta hisoblanadi -->
<p>{{ calculateTotal() }}</p>
@for (item of filterItems(); track item.id) { ... }

<!-- ✅ computed — faqat bog'liqlik o'zgarganda -->
<p>{{ total() }}</p>
@for (item of visibleItems(); track item.id) { ... }
```

```ts
protected readonly total = computed(() => this.items().reduce((s, i) => s + i.price, 0));
protected readonly visibleItems = computed(() => this.items().filter(...));
```

Metod chaqiruvi (`calculateTotal()`) — signal emas, har tekshiruvda ishlaydi. `computed` — memoizatsiyalangan. Pure pipe ham memoizatsiyalanadi (13-bob).

### `@for` va `track`

```html
@for (row of rows(); track row.id) { <app-row [row]="row" /> }
```

`track row.id` — ro'yxat yangilanganda faqat o'zgargan qatorlar qayta yaratiladi. `track $index` — tartib o'zgarganda **hamma** qator qayta yaratiladi (11-bob). 1000 qatorli jadvalda — sezilarli farq.

### Katta ro'yxatlar

| Elementlar | Yechim |
| --- | --- |
| < 200 | Oddiy `@for` |
| 200–2000 | Sahifalash yoki "ko'proq ko'rsatish" |
| 2000+ | `cdk-virtual-scroll-viewport` (66-bob) |

## Kod: INP — og'ir ishlarni bo'lish

Bosishdan keyin 300 ms'lik sinxron hisob — INP yomon. Variantlar:

```ts
// 1. UI'ni avval yangilash, og'ir ishni keyin
protected async onFilter(q: string) {
  this.query.set(q);                          // darhol
  await new Promise((r) => setTimeout(r));     // brauzerga chizishga imkon
  this.heavyIndex.set(buildIndex(this.items(), q));
}

// 2. Web Worker
const worker = new Worker(new URL('./search.worker', import.meta.url), { type: 'module' });
```

`ng generate web-worker search` — Angular CLI worker sozlaydi. CPU-og'ir ishlar (katta CSV parse, qidiruv indeksi, rasm ishlash) — worker'ga.

## Kod: o'lchash

```ts
// Real foydalanuvchilardan (RUM)
import { onLCP, onINP, onCLS } from 'web-vitals';

afterNextRender(() => {
  onLCP((m) => analytics.send('LCP', m.value));
  onINP((m) => analytics.send('INP', m.value));
  onCLS((m) => analytics.send('CLS', m.value));
});
```

| Vosita | Nima |
| --- | --- |
| Lighthouse (DevTools) | Laboratoriya o'lchovi, tavsiyalar |
| Angular DevTools Profiler | CD sikllari, sekin komponentlar |
| Chrome Performance tab | Uzun vazifalar (long tasks), INP sabablari |
| `web-vitals` + analitika | Haqiqiy foydalanuvchilar (eng muhimi) |

Laboratoriya natijasi (tez noutbuk, tez internet) ≠ foydalanuvchi tajribasi. Lighthouse'da "Mobile" + "Slow 4G" bilan o'lchang.

## Muhandislik nuqtai nazari

**Unumdorlik byudjeti** — jamoa kelishuvi: "initial JS ≤ 200 kB (transfer), LCP ≤ 2.5 s (75-persentil)". CI'da byudjet, prod'da RUM monitoring. Buzilsa — feature emas, bug.

**Tartib** (eng katta foydadan):

1. Katta boshlang'ich JS → lazy / `@defer`.
2. LCP rasmi → `NgOptimizedImage` + `priority`, to'g'ri o'lcham, zamonaviy format (AVIF/WebP).
3. Ommaviy sahifalar → SSR/SSG (62–65).
4. Sekin interaksiyalar → Profiler → `computed`, `track`, virtual scroll, worker.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Shablonda metod chaqiruvi | Har CD'da hisob | `computed` |
| `track $index` o'zgaruvchan ro'yxatda | Hamma qator qayta yaratiladi | `track item.id` |
| `<img>` o'lchamsiz | CLS | `NgOptimizedImage` width/height |
| LCP rasmi `lazy` | LCP kechikadi | `priority` |
| Hamma narsa asosiy bundle'da | Sekin ochilish | Lazy loading, `@defer` |
| 10 000 qator oddiy `@for` | Sekin scroll va render | Virtual scroll |
| O'lchovsiz "optimizatsiya" | Murakkablik, foyda yo'q | Avval Profiler/Lighthouse |
| Faqat laboratoriya o'lchovi | Haqiqiy foydalanuvchi boshqacha | `web-vitals` RUM |

## Amaliyot

1. Lighthouse (Mobile) bilan bosh sahifani o'lchang; LCP elementini aniqlang.
2. LCP rasmiga `NgOptimizedImage` + `priority`; qayta o'lchang.
3. Shablondagi barcha metod chaqiruvlarini topib, `computed` ga o'tkazing.
4. 5000 qatorli ro'yxatni virtual scroll bilan; Profiler'da farqni ko'ring.
5. Og'ir filtrni Web Worker'ga ko'chiring.
6. `web-vitals` bilan RUM ma'lumotlarini konsolga (yoki analitikaga) yuboring.

## Rasmiy hujjat

- Unumdorlik: <https://angular.dev/best-practices/runtime-performance>
- `NgOptimizedImage`: <https://angular.dev/guide/image-optimization>
- Web Workers: <https://angular.dev/ecosystem/web-workers>
- Web Vitals: <https://web.dev/articles/vitals>
