# 64 — Hydration va incremental hydration

[← Oldingi: Server marshrutlari va `RenderMode`](63-server-marshrutlar.md) · [Mundarija](README.md) · [Keyingi: Prerendering va deploy →](65-prerender-va-deploy.md)

## Tushuncha

**Hydration** — serverda tayyorlangan HTML'ni brauzerda **qayta yaratmasdan** "jonlantirish": Angular mavjud DOM tugunlarini topadi, ularga hodisa tinglovchilari va bog'lanishlarni ulaydi.

Hydration'siz (eski usul) Angular server HTML'ini **o'chirib**, hammasini qaytadan chizar edi — ekran miltillaydi, scroll va fokus yo'qoladi.

Uch darajali tizim (Angular 22):

| Qism | Nima | Sukut |
| --- | --- | --- |
| **Full hydration** | DOM qayta ishlatiladi | `provideClientHydration()` bilan yoqiladi |
| **Event replay** | Hydration'dan oldingi bosishlar yo'qolmaydi | Amalda yoqilgan (quyida) |
| **Incremental hydration** | `@defer (hydrate ...)` bloklari kerak bo'lgandagina jonlanadi | **v22 da sukut** |

```ts
// app.config.ts
provideClientHydration()
```

## Nega shunday

SSR sahifasi tez **ko'rinadi**, lekin JS yuklanib, hydration tugaguncha **ishlamaydi** — tugmalar javob bermaydi. Bu oraliq — "uncanny valley". Uch yechim:

- **Event replay** — shu oraliqdagi bosishlarni yozib, keyin bajaradi.
- **Incremental hydration** — sahifaning faqat kerakli qismlarini hydration qiladi: kam JS, tezroq interaktivlik.
- **Kichik bundle** — `@defer`, lazy loading.

## Kod: tekshirilgan xulq

Playwright bilan (real SSR server, Angular 22.2):

| Tajriba | Natija |
| --- | --- |
| Sahifa ochildi, keyin `httpResource` ma'lumoti | Brauzer API'ga **qayta so'rov yubormadi** (transfer cache) |
| JS 1.5 s kechiktirildi, shu vaqtda tugma bosildi | Bosilganda — `bos 0`; hydration'dan keyin — **`bos 1`** (event replay) |
| Xuddi shu, `withEventReplay()` **siz** | Baribir `bos 1` — incremental hydration event replay'ni o'zi yoqadi |
| `isPlatformServer` ga bog'liq matn | Serverda "server", hydration'dan keyin "browser" — xatosiz yangilandi |

HTML'da ko'rinadigan belgilar: `ngh="0"` (hydration ma'lumoti), `jsaction="click:;"` (event replay tinglovchisi), `ngb="d0"` (defer bloki).

## Kod: incremental hydration

```html
<app-product-gallery [product]="product()" />

<div class="below-fold">
  @defer (hydrate on viewport) {
    <app-reviews [productId]="id()" />
  } @placeholder {
    <p>Sharhlar…</p>
  }

  @defer (hydrate on interaction) {
    <app-size-picker />
  }

  @defer (hydrate never) {
    <app-static-footer />
  }
</div>
```

Tekshirildi — `@defer (hydrate on interaction) { <app-heavy /> }`:

1. Serverda komponent **to'liq render** qilindi — HTML'da `heavy 0` tugmasi (placeholder emas!).
2. Brauzerda sahifa ochilganda `heavy` chunk'i **yuklanmadi**.
3. Tugma bosilganda — chunk yuklandi, komponent hydration qilindi va **bosishning o'zi** ham bajarildi → `heavy 1`.

Oddiy `@defer` (12-bob) bilan farq:

| | `@defer (on viewport)` | `@defer (hydrate on viewport)` |
| --- | --- | --- |
| SSR'da | **Placeholder** render qilinadi | **Haqiqiy kontent** render qilinadi |
| SEO | Kontent HTML'da yo'q | Kontent HTML'da bor |
| Brauzerda | Trigger'da yuklanib, chiziladi | Trigger'da yuklanib, **jonlanadi** |

Trigger'lar: `hydrate on idle | viewport | interaction | hover | immediate | timer(ms)`, `hydrate when shart`, `hydrate never` (hech qachon — statik HTML bo'lib qoladi).

`hydrate never` — interaktivligi yo'q katta bloklar uchun (footer, maqola matni): JS umuman yuklanmaydi.

Incremental hydration'ni o'chirish (kamdan-kam kerak): `provideClientHydration(withNoIncrementalHydration())`. `withIncrementalHydration()` — deprecated (v22 dan sukut), v24 da olib tashlanadi.

## Kod: hydration xatolari

Hydration server va brauzer DOM'i **bir xil** bo'lishini kutadi. Mos kelmasa — NG0500-seriyali xatolar (dev rejimida konsolda):

| Sabab | Misol | Yechim |
| --- | --- | --- |
| DOM'ni qo'lda o'zgartirish | `el.innerHTML = ...`, jQuery plagin | `afterNextRender` ichida, yoki `ngSkipHydration` |
| Noto'g'ri HTML | `<p><div>` — brauzer tuzatadi, server tuzatmaydi | To'g'ri HTML |
| `<table>` da `<tbody>` yo'q | Brauzer qo'shadi | `<tbody>` ni yozing |
| Server/brauzer boshqa **tuzilma** chizadi | `@if (isBrowser) { ... }` | Tuzilmani bir xil qoldiring, faqat qiymat farq qilsin |

Oxirgi qator muhim: **qiymat** farqi (matn "server" → "browser") — muammosiz yangilanadi (tekshirildi). **Tuzilma** farqi (`@if` bilan element bor/yo'q) — mismatch.

```html
<!-- ❌ tuzilma farqi -->
@if (isBrowser) { <app-map /> }

<!-- ✅ ikkala muhitda bir xil blok, brauzerda jonlanadi -->
@defer (on viewport) { <app-map /> } @placeholder { <div class="map-skeleton"></div> }
```

Integratsiya qilib bo'lmaydigan komponent uchun — oxirgi chora:

```html
<app-legacy-widget ngSkipHydration />
```

Bu komponent serverdagi HTML'ni tashlab, brauzerda qaytadan chiziladi.

## Kod: brauzerga xos ishlar

```ts
export class Chart {
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterNextRender(() => {
      // Faqat brauzerda, hydration'dan keyin
      new ChartLib(this.canvas().nativeElement, this.data());
    });
  }
}
```

`afterNextRender` — hydration bilan mos: serverda ishlamaydi, brauzerda DOM tayyor bo'lgach ishlaydi.

## Muhandislik nuqtai nazari

**O'lchash:** Chrome DevTools → Performance → "Interaction to Next Paint" (INP) va Angular DevTools'dagi hydration ko'rinishi. Maqsad — foydalanuvchi ko'rgan narsa tez **ishlasin**.

Sahifani bo'limlarga ajratish strategiyasi:

| Qism | Hydration |
| --- | --- |
| Header, asosiy CTA (above the fold) | Darhol (oddiy) |
| Mahsulot galereyasi | `hydrate on viewport` |
| Sharhlar, tavsiyalar (pastda) | `hydrate on viewport` / `on idle` |
| Filtr, o'lcham tanlash | `hydrate on interaction` |
| Footer, statik matn | `hydrate never` |

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `provideClientHydration()` yo'q | Server HTML o'chirilib qayta chiziladi (miltillash) | Qo'shing |
| `@if (isBrowser)` bilan tuzilma | Hydration mismatch | `@defer` + placeholder |
| Komponentda DOM'ni qo'lda o'zgartirish | NG05xx | `afterNextRender`, Renderer |
| SEO kerak bo'lgan kontent oddiy `@defer` da | HTML'da placeholder | `@defer (hydrate ...)` |
| Hamma narsa darhol hydration | Katta JS, sekin INP | `hydrate on viewport/interaction/never` |
| `ngSkipHydration` hamma joyda | SSR foydasi yo'qoladi | Faqat moslashtirib bo'lmaydigan joyda |
| Interaktiv blokni `hydrate never` | Tugmalar hech qachon ishlamaydi | Mos trigger |

## Amaliyot

1. SSR loyihada tugmali sahifa: DevTools'da tarmoqni "Slow 3G" qilib, JS yuklanguncha bosing — keyin natija qo'llanganini ko'ring.
2. Pastdagi sharhlar blokini `@defer (hydrate on viewport)` qiling; Network'da chunk faqat scroll'da yuklanishini tekshiring.
3. Xuddi shu blokni oddiy `@defer (on viewport)` qilib, `curl` natijasida kontent yo'qligini solishtiring.
4. Footer'ni `hydrate never` qiling.
5. `@if (isBrowser)` bilan mismatch yarating va konsol xatosini o'qing; `@defer` bilan tuzating.

## Rasmiy hujjat

- Hydration: <https://angular.dev/guide/hydration>
- Incremental hydration: <https://angular.dev/guide/incremental-hydration>
- `@defer`: <https://angular.dev/guide/templates/defer>
