# 12 — `@defer` — kechiktirilgan ko'rinishlar

[← Oldingi: @for va track](11-for-va-track.md) · [Mundarija](README.md) · [Keyingi: Quvurlar (pipes) →](13-pipes.md)

## Tushuncha

`@defer` — shablonning bir qismini **keyinroq yuklash**. Blok ichidagi komponentlar alohida JavaScript fayliga ajratiladi va faqat kerak bo'lganda yuklanadi:

```html
@defer (on viewport) {
  <app-comments [postId]="post().id" />
} @placeholder {
  <div class="comments-placeholder">Izohlar</div>
} @loading (after 150ms; minimum 500ms) {
  <app-spinner />
} @error {
  <p>Izohlarni yuklab bo'lmadi</p>
}
```

Sahifa ochilganda `Comments` komponentining kodi **yuklanmaydi**. Foydalanuvchi pastga tushib, placeholder ekranga kirganda — yuklanadi.

## Nega shunday

Foydalanuvchi sahifani ochganda hamma narsani darhol ko'rmaydi. Izohlar, tavsiyalar, grafiklar, xarita — ko'pincha pastda yoki tugma ortida. Ularning kodini birinchi yuklashga qo'shish — boshlang'ich bundle'ni kattalashtiradi va sahifani sekinlashtiradi.

Ilgari buning uchun marshrut darajasida lazy loading (43-bob) yoki `import()` bilan qo'lda dinamik komponent yaratish kerak edi. `@defer` buni **shablon darajasida, bitta blok bilan** qiladi.

Haqiqiy build'da ko'rinishi:

```
Lazy chunk files    | Names         |  Raw size | Estimated transfer size
chunk-JR3G3INN.js   | heavy         | 345 bytes |               345 bytes
```

`heavy` — `@defer` ichidagi komponent. U asosiy bundle'da emas, alohida faylda.

## Kod: bloklar

| Blok | Qachon ko'rinadi | Majburiymi |
| --- | --- | --- |
| `@defer { }` | Yuklangandan keyin — asosiy kontent | Ha |
| `@placeholder { }` | Trigger ishga tushguncha | Ko'p triggerlar uchun **ha** |
| `@loading { }` | Yuklanayotganda | Yo'q |
| `@error { }` | Yuklab bo'lmasa | Yo'q |

`@placeholder` va `@loading` ga vaqt parametrlari:

```html
@placeholder (minimum 500ms) { ... }
@loading (after 100ms; minimum 1s) { ... }
```

| Parametr | Ma'nosi | Nega kerak |
| --- | --- | --- |
| `minimum 500ms` (placeholder) | Kamida shuncha ko'rsatiladi | Tez yuklansa "miltillash" bo'lmasin |
| `after 100ms` (loading) | Yuklash shuncha davom etsagina ko'rsatiladi | Tez yuklanishda spinner chiqmasin |
| `minimum 1s` (loading) | Ko'rsatilgan bo'lsa, kamida shuncha | Spinner bir lahza chiqib yo'qolmasin |

Placeholder va loading ichidagi komponentlar **darhol** yuklanadi — ular yengil bo'lsin.

## Kod: triggerlar

Qachon yuklash boshlanishi:

| Trigger | Qachon | Misol |
| --- | --- | --- |
| `on idle` | Brauzer bo'sh qolganda (**sukut**) | Pastki qism, muhim emas |
| `on viewport` | Placeholder ekranga kirganda | Izohlar, tavsiyalar |
| `on interaction` | Placeholder bosilganda yoki fokuslanganda | "Xaritani ko'rsatish" |
| `on hover` | Sichqoncha placeholder ustiga kelganda | Tooltip, oldindan ko'rish |
| `on immediate` | Darhol, lekin alohida chunk | Kodni ajratish, kechiktirmaslik |
| `on timer(2s)` | Belgilangan vaqtdan keyin | Reklama, chat vidjeti |
| `when condition` | Shart `true` bo'lganda | `when showChart()` |

Bir nechta trigger — **"yoki"**:

```html
@defer (on interaction; on timer(5s)) {
  <app-chat-widget />
} @placeholder {
  <button type="button">Yordam</button>
}
```

Foydalanuvchi bossa — darhol, bosmasa — 5 soniyadan keyin.

`when` — signal bilan:

```html
@defer (when chartVisible()) {
  <app-sales-chart [data]="sales()" />
} @placeholder {
  <button type="button" (click)="chartVisible.set(true)">Grafikni ko'rsatish</button>
}
```

Diqqat: `when` bir marta `true` bo'lgach, blok **yuklangan holda qoladi**. Keyin `false` bo'lsa ham yopilmaydi. Yashirish kerak bo'lsa — ichida `@if`.

## Kod: placeholder qoidalari

`on viewport`, `on interaction`, `on hover` triggerlari **qaysi elementni** kuzatishni bilishi kerak. Sukut bo'yicha — placeholder. Shuning uchun Angular 22 da ikkita qat'iy qoida (tekshirildi):

**1. Placeholder bo'lishi shart:**

```html
@defer (on viewport) { <app-heavy /> }
```

```
✘ [ERROR] NG8019: Trigger with no target can only be placed on an @defer that has a @placeholder block
```

**2. Placeholder'da aynan bitta ildiz element:**

```html
@defer (on viewport) { <app-heavy /> } @placeholder { <p>a</p><p>b</p> }
```

```
✘ [ERROR] NG8020: Trigger with no target can only be placed on an @defer that has
          a @placeholder block with exactly one root element node
```

To'g'risi:

```html
@defer (on viewport) {
  <app-heavy />
} @placeholder {
  <div class="placeholder">
    <p>a</p>
    <p>b</p>
  </div>
}
```

Placeholder o'rniga boshqa elementni kuzatish — shablon havolasi bilan:

```html
<h2 #commentsTitle>Izohlar</h2>

@defer (on viewport(commentsTitle)) {
  <app-comments />
}
```

Bu holda placeholder shart emas.

## Kod: oldindan yuklash (prefetch)

Yuklashni **ko'rsatishdan** ajratish mumkin — kod oldinroq yuklansin, ko'rsatish keyinroq bo'lsin:

```html
@defer (on interaction; prefetch on idle) {
  <app-rich-editor />
} @placeholder {
  <div class="editor-placeholder">Izoh yozish uchun bosing</div>
}
```

Brauzer bo'sh qolganda kod yuklab olinadi. Foydalanuvchi bosganda — yuklash kutilmaydi, darhol ko'rinadi.

| Naqsh | Natija |
| --- | --- |
| `on interaction` | Bosilganda yuklanadi — kechikish seziladi |
| `on interaction; prefetch on idle` | Oldindan yuklangan, bosilganda darhol |
| `on viewport; prefetch on hover` | Ekranga kirishi yaqinlashganda |

## Kod: jim tuzoq — komponent ajralmay qolishi

`@defer` ning ishlashi uchun ichidagi komponent **faqat `@defer` ichida** ishlatilishi kerak. Aks holda u asosiy bundle'da qoladi — va **hech qanday ogohlantirish chiqmaydi**. Tekshirildi:

```ts
@Component({
  selector: 'app-lab',
  imports: [Heavy],
  template: `
    <app-heavy />                                    <!-- ← tashqarida ham -->
    @defer (on viewport) { <app-heavy /> } @placeholder { <div>joy</div> }
  `,
})
```

Build natijasida "Lazy chunk files" qatori **yo'q** — `Heavy` asosiy bundle'da. Kod xuddi ishlayotgandek ko'rinadi, lekin hech narsa kechiktirilmagan.

Komponent ajralmaydigan holatlar:

| Holat | Nega |
| --- | --- |
| Shablonning boshqa joyida ham ishlatilgan | Darhol kerak, ajratib bo'lmaydi |
| Klass kodida murojaat bor (`viewChild(Heavy)`, `Heavy` tipidan foydalanish) | Import darhol bajariladi |
| Standalone emas (eski `NgModule` ichida) | Ajratish faqat standalone uchun |

Tekshirish usuli — **har doim build natijasiga qarang**: `@defer` qo'shgandan keyin "Lazy chunk files" da yangi qator paydo bo'lishi kerak.

## Kod: qachon `@defer` kerak emas

```html
<!-- ❌ Sahifaning asosiy kontenti — foydalanuvchi darhol ko'rishi kerak -->
@defer {
  <app-product-details [product]="product()" />
}
```

Asosiy kontentni kechiktirish — LCP'ni (eng katta element qachon ko'rinadi) yomonlashtiradi va foydalanuvchi placeholder'ga qarab qoladi.

| Kechiktiring | Kechiktirmang |
| --- | --- |
| Pastdagi izohlar, tavsiyalar | Sahifa sarlavhasi, asosiy ma'lumot |
| Og'ir grafik, xarita, muharrir | Navigatsiya, menyu |
| Modal oyna ichi | Birinchi ekrandagi kontent |
| Chat vidjeti, reklama | Kichik komponentlar (foydasi yo'q) |

Kichik komponent (bir necha KB) uchun `@defer` — foydadan ko'ra ko'proq murakkablik: qo'shimcha so'rov, placeholder, yuklanish holati.

## Muhandislik nuqtai nazari: SSR va `@defer`

Server rendering bilan (62-bob) `@defer` boshqacha ishlaydi: serverda **placeholder** render qilinadi, asosiy kontent emas. Brauzerda trigger ishlaganda yuklanadi.

Bu SEO uchun muhim: `@defer` ichidagi matnni qidiruv tizimi **ko'rmaydi**. Mahsulot tavsifi, maqola matni — `@defer` da bo'lmasin.

Angular'ning **incremental hydration** xususiyati (64-bob) buni rivojlantiradi: serverda to'liq render qilinadi, brauzerda esa `hydrate on viewport` kabi triggerlar bilan bosqichma-bosqich "jonlantiriladi".

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| `on viewport` + placeholder yo'q | NG8019 | `@placeholder { <div>...</div> }` |
| Placeholder'da bir nechta ildiz | NG8020 | Bitta o'rovchi element |
| Komponent `@defer` dan tashqarida ham ishlatilgan | Jimgina ajralmaydi | Faqat `@defer` ichida; build'ni tekshiring |
| Asosiy kontentni `@defer` ga | LCP yomonlashadi | Faqat ikkinchi darajali qism |
| `@loading` da `after` yo'q | Tez yuklanishda spinner miltillaydi | `after 100ms` |
| `when` ni yopish uchun ishlatish | Bir marta ochilgach yopilmaydi | Ichida `@if` |
| SEO uchun muhim matn `@defer` da | Qidiruv tizimi ko'rmaydi | Asosiy shablonda |
| 2 KB komponentga `@defer` | Foydadan ko'ra ko'p murakkablik | Oddiy import |

## Amaliyot

1. Maqola sahifasi yozing: matn asosiy shablonda, `<app-comments>` — `@defer (on viewport)` da.
2. `npm run build` qiling va "Lazy chunk files" da yangi chunk paydo bo'lganini tasdiqlang.
3. `<app-comments>` ni `@defer` dan tashqarida ham qo'shing va build'ni qayta ishga tushiring — chunk yo'qolishini ko'ring.
4. Placeholder'ni olib tashlang (NG8019), keyin ikkita ildiz qiling (NG8020) — xatolarni o'qing.
5. `on interaction; prefetch on idle` bilan muharrir yozing; DevTools Network'da kod qachon yuklanishini kuzating.
6. `@loading (after 100ms; minimum 1s)` ni sekin tarmoqda (DevTools → Slow 3G) sinang.

## Rasmiy hujjat

- `@defer`: <https://angular.dev/guide/templates/defer>
- Triggerlar: <https://angular.dev/guide/templates/defer#triggers>
- Incremental hydration: <https://angular.dev/guide/incremental-hydration>
