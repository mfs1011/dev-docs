# 13 — Quvurlar (pipes)

[← Oldingi: @defer](12-defer.md) · [Mundarija](README.md) · [Keyingi: Direktivalar →](14-direktivalar.md)

## Tushuncha

Quvur — shablonda qiymatni **ko'rsatish uchun formatlash**:

```html
<p>{{ order().createdAt | date:'longDate' }}</p>
<p>{{ order().total | currency:'UZS':'symbol-narrow':'1.0-0' }}</p>
```

`|` belgisidan keyin quvur nomi, `:` dan keyin parametrlar. Quvur asl qiymatni o'zgartirmaydi — faqat qanday ko'rinishini.

## Nega shunday

Sana, pul, son formatlash — har ilovada, har ekranda. Buni har komponentda qo'lda yozish takrorlanish va xato manbai. Quvur bir marta yoziladi, hamma joyda bir xil ishlaydi va **lokalga** (til va mintaqa) moslashadi.

Ikkinchi sabab — unumdorlik. Oddiy ("sof", *pure*) quvur faqat kirish qiymati o'zgarganda qayta hisoblanadi. Shablon 100 marta tekshirilsa ham, sana o'zgarmagan bo'lsa `date` quvuri qayta ishlamaydi.

## Kod: o'rnatilgan quvurlar

Hammasi `@angular/common` dan, har biri `imports` ga qo'shiladi:

```ts
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';

@Component({
  imports: [DatePipe, CurrencyPipe, DecimalPipe],
  ...
})
```

`uz` lokalida **haqiqiy natijalar** (Angular 22, test bilan olingan):

| Shablonda | Natija |
| --- | --- |
| `{{ d \| date }}` | `30-sen, 2026` |
| `{{ d \| date:'longDate' }}` | `30-sentabr, 2026` |
| `{{ d \| date:'fullDate' }}` | `chorshanba, 30-sentabr, 2026` |
| `{{ d \| date:'dd.MM.yyyy HH:mm' }}` | `30.09.2026 14:05` |
| `{{ 1250000 \| currency:'UZS' }}` | `1 250 000,00 soʻm` |
| `{{ 1250000 \| currency:'UZS':'symbol-narrow':'1.0-0' }}` | `1 250 000 soʻm` |
| `{{ 1250000 \| currency:'UZS':'code':'1.0-0' }}` | `1 250 000 UZS` |
| `{{ 1234567.891 \| number }}` | `1 234 567,891` |
| `{{ 1234567.891 \| number:'1.2-2' }}` | `1 234 567,89` |
| `{{ 0.256 \| percent }}` | `26%` |
| `{{ 'salom dunyo' \| titlecase }}` | `Salom Dunyo` |
| `{{ 'Angular qo\'llanmasi' \| slice:0:7 }}` | `Angular` |

Boshqa quvurlar:

| Quvur | Nima qiladi |
| --- | --- |
| `uppercase`, `lowercase` | Harf registri |
| `json` | Obyektni JSON matnga — faqat nosozlik tuzatish uchun |
| `keyvalue` | Obyektni `@for` uchun kalit-qiymat juftlariga |
| `async` | Observable yoki Promise qiymati (pastga qarang) |
| `i18nPlural`, `i18nSelect` | Ko'plik va tanlov matnlari (77-bob) |

### Son formati: `'1.0-0'`

`number`, `currency`, `percent` dagi raqam formati — `minButun.minKasr-maxKasr`:

| Format | 1234.5 | Ma'nosi |
| --- | --- | --- |
| `'1.0-0'` | `1 235` | Kasr yo'q, yaxlitlanadi |
| `'1.2-2'` | `1 234,50` | Doim 2 ta kasr |
| `'1.0-2'` | `1 234,5` | 0 dan 2 gacha kasr |
| `'3.0-0'` | `1 235` | Kamida 3 raqam: `7` → `007` |

So'm uchun deyarli har doim `'1.0-0'` — tiyinlar ko'rsatilmaydi.

## Kod: lokalni sozlash

Sukut bo'yicha Angular `en-US` lokalida ishlaydi: `Sep 30, 2026`, `$1,250,000.00`. O'zbekcha uchun ikki qadam:

```ts
// app.config.ts
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeUz from '@angular/common/locales/uz';

registerLocaleData(localeUz);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: LOCALE_ID, useValue: 'uz' },
  ],
};
```

1. `registerLocaleData` — oy nomlari, ajratgichlar va boshqa ma'lumotlarni yuklaydi.
2. `LOCALE_ID` — barcha quvurlar shu lokaldan foydalanadi.

Mavjud o'zbek lokallari: `uz` (lotin), `uz-Latn`, `uz-Cyrl` (kirill), `uz-Arab`.

Ko'p tilli ilovada lokal build vaqtida tanlanadi — 77-bob.

### Test tuzog'i: maxsus belgilar

`uz` lokali minglik ajratgich sifatida **oddiy bo'sh joy emas**, bo'linmas bo'sh joy (`U+00A0`) ishlatadi. "soʻm" dagi belgi ham oddiy apostrof emas — `U+02BB`. Tekshirildi:

```
"1 250 000 soʻm" → ajratgichlar U+00A0, 'ʻ' U+02BB
```

Testda oddiy matn bilan solishtirsangiz — yiqiladi:

```ts
// ❌ ko'rinishi bir xil, lekin belgilar boshqa
expect(el.textContent).toBe('1 250 000 soʻm');

// ✅ bo'sh joylarni normallashtirish
expect(el.textContent.replace(/\s/g, ' ')).toBe('1 250 000 soʻm');
```

Bo'linmas bo'sh joyning foydasi ham bor: satr oxirida `1 250` va `000` ikki qatorga bo'linib ketmaydi.

## Kod: `keyvalue`

Obyektni ro'yxat qilib chiqarish:

```ts
protected readonly stats = signal({ views: 120, likes: 34, comments: 8 });
```

```html
@for (item of stats() | keyvalue; track item.key) {
  <p>{{ item.key }}: {{ item.value }}</p>
}
```

Diqqat: `keyvalue` kalitlarni **alifbo tartibida saralaydi** — `{ b: 2, a: 1 }` → `a, b` (tekshirildi). Asl tartib kerak bo'lsa:

```html
@for (item of stats() | keyvalue: keepOrder; track item.key) { ... }
```

```ts
protected keepOrder = () => 0;
```

Ko'p hollarda obyekt o'rniga massiv saqlash yaxshiroq — tartib aniq, `keyvalue` kerak emas.

## Kod: `async`

Observable yoki Promise qiymatini shablonda ochish:

```html
<p>{{ user$ | async }}</p>

@if (orders$ | async; as orders) {
  @for (o of orders; track o.id) { ... }
}
```

`async` obunani o'zi boshqaradi: komponent yo'q qilinganda obunani bekor qiladi. Eski Angular'da bu asosiy vosita edi.

Zamonaviy Angular'da **signal afzal**: Observable'ni signalga aylantirib (`toSignal`, 24-bob) shablonda oddiy `orders()` deb o'qish. `async` — mavjud Observable'lar bilan ishlaganda.

## Kod: o'z quvuringiz

```bash
ng g pipe file-size
```

Yaratadi `file-size-pipe.ts` (Angular 22 da quvur klassi `Pipe` qo'shimchasini saqlaydi):

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  private readonly units = ['B', 'KB', 'MB', 'GB', 'TB'];

  transform(bytes: number | null | undefined, decimals = 1): string {
    if (bytes == null || Number.isNaN(bytes)) return '—';
    if (bytes === 0) return '0 B';

    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), this.units.length - 1);
    const value = bytes / 1024 ** index;

    return `${value.toFixed(index === 0 ? 0 : decimals)} ${this.units[index]}`;
  }
}
```

```html
<p>{{ file().size | fileSize }}</p>        <!-- 2.4 MB -->
<p>{{ file().size | fileSize:2 }}</p>      <!-- 2.37 MB -->
```

Yaxshi quvur qoidalari:

1. **`null` va `undefined` ni qabul qilsin** — signal hali yuklanmagan bo'lishi mumkin.
2. **Sof bo'lsin** — bir xil kirish, bir xil chiqish, yon ta'sir yo'q.
3. **Faqat formatlash** — so'rov, holat o'zgartirish yo'q.

Lokalga bog'liq quvur — `LOCALE_ID` ni `inject` qiling:

```ts
import { inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  private readonly formatter = new Intl.RelativeTimeFormat(inject(LOCALE_ID), { numeric: 'auto' });

  transform(value: Date | string | null): string {
    if (!value) return '';

    const minutes = Math.round((new Date(value).getTime() - Date.now()) / 60000);

    if (Math.abs(minutes) < 60) return this.formatter.format(minutes, 'minute');
    if (Math.abs(minutes) < 1440) return this.formatter.format(Math.round(minutes / 60), 'hour');

    return this.formatter.format(Math.round(minutes / 1440), 'day');
  }
}
```

`uz` lokalida haqiqiy natija (tekshirildi): `5 daqiqa oldin`, `kecha`, `2 soatdan keyin`.

Brauzerning `Intl` API'si ko'p ishni o'zi qiladi — o'zingiz matn yig'ishdan oldin tekshiring.

## Kod: sof va sof emas quvurlar

| | Sof (`pure: true`, sukut) | Sof emas (`pure: false`) |
| --- | --- | --- |
| Qachon qayta ishlaydi | Kirish qiymati (yoki havolasi) o'zgarganda | Komponent **har** tekshirilganda |
| Unumdorlik | Yaxshi | Og'ir bo'lsa — sekin |
| Massiv ichi o'zgarsa | Sezmaydi | Sezadi |

Sof emas quvur deyarli hech qachon kerak emas. Massiv o'zgarishini sezish uchun uni signal bilan almashtirish (11-bob) — to'g'ri yo'l.

## Muhandislik nuqtai nazari: quvur yoki `computed`

Ikkalasi ham "qiymatdan qiymat hosil qilish". Qachon qaysi biri:

| Holat | Tanlov |
| --- | --- |
| Ko'rsatish formati (sana, pul, hajm) — ko'p joyda | **Quvur** |
| Shu komponentga xos hisob (filtr, jami, holat) | **`computed`** |
| Bir nechta signaldan birlashtirish | **`computed`** |
| Natija boshqa mantiqda ham kerak (shablondan tashqari) | **`computed`** |

Oddiy qoida: **quvur — "qanday ko'rsatish"**, **`computed` — "nima ko'rsatish"**.

```ts
// computed: NIMA — to'langan buyurtmalar jami
protected readonly paidTotal = computed(() =>
  this.orders().filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.total, 0),
);
```

```html
<!-- quvur: QANDAY — so'mda, kasrsiz -->
<p>{{ paidTotal() | currency:'UZS':'symbol-narrow':'1.0-0' }}</p>
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yo'l |
| --- | --- | --- |
| Quvurni `imports` ga qo'shmaslik | `NG8004: No pipe found with name 'date'` | `imports: [DatePipe]` |
| `LOCALE_ID` sozlanmagan | `Sep 30, 2026`, `$` belgisi | `registerLocaleData` + `LOCALE_ID` |
| So'm uchun `'1.0-0'` yo'q | `1 250 000,00 soʻm` — tiyinlar | `'1.0-0'` |
| Testda oddiy bo'sh joy bilan solishtirish | Test yiqiladi (U+00A0) | Bo'sh joylarni normallashtiring |
| `keyvalue` asl tartibni saqlaydi deb o'ylash | Alifbo bo'yicha saralanadi | Taqqoslovchi yoki massiv |
| Quvur ichida HTTP so'rov | Har render'da so'rov | Xizmat + signal |
| `pure: false` "ishlashi uchun" | Sekinlik | Ma'lumotni signal bilan almashtiring |
| Quvur `null` ni qabul qilmaydi | Yuklanishda xato | `value: T \| null \| undefined` |
| `json` quvurini ekranda qoldirish | Foydalanuvchi xom JSON ko'radi | Faqat nosozlik tuzatishda |

## Amaliyot

1. `LOCALE_ID` ni `uz` ga sozlang va jadvaldagi barcha quvurlarni sinab ko'ring — natijalarni solishtiring.
2. So'mni `'1.0-0'` bilan va usiz chiqaring.
3. `FileSizePipe` ni yozing; `null`, `0`, `1023`, `1048576` bilan tekshiring.
4. `RelativeTimePipe` ni `Intl.RelativeTimeFormat` bilan yozing va "5 daqiqa oldin", "kecha" natijalarini oling.
5. Pul formatini tekshiradigan test yozing — avval oddiy bo'sh joy bilan (yiqiladi), keyin normallashtirib.
6. `{ b: 2, a: 1 }` ni `keyvalue` bilan chiqarib tartibni ko'ring, keyin `keepOrder` qo'shing.

## Rasmiy hujjat

- Quvurlar: <https://angular.dev/guide/templates/pipes>
- O'z quvuringiz: <https://angular.dev/guide/templates/pipes#creating-custom-pipes>
- Lokalizatsiya: <https://angular.dev/guide/i18n/locale-id>
- `DatePipe` formatlari: <https://angular.dev/api/common/DatePipe>
