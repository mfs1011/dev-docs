# 39 — Intl

[← Oldingi: JSON](38-json.md) · [Mundarija](README.md) · [Keyingi: Execution context va call stack →](40-execution-context.md)

## Tushuncha

**Intl** — ECMAScript'ning **xalqarolashtirish** (internationalization) API'si: son, valyuta, sana, ro'yxat va boshqalarni foydalanuvchi tili va mintaqasi qoidalariga moslab formatlaydi. MDN: `Intl` — `Math` kabi konstruktor emas, nomlar fazosi. Ichidagi konstruktorlar (`Intl.NumberFormat`, `Intl.DateTimeFormat`, ...) umumiy naqsh bilan ishlaydi — **`locales`** va **`options`** argumentlarini oladi.

**Locale** (til-mintaqa identifikatori) — MDN: defis bilan ajratilgan qismlar: til (`uz`), ixtiyoriy yozuv (`Latn`, `Cyrl`), ixtiyoriy mintaqa (`UZ`) va kengaytmalar. Masalan, `uz-Latn-UZ`, `uz-Cyrl`. Dvigatel so'ralgan locale'ni o'zi qo'llab-quvvatlaydiganlari bilan **muzokara** qilib, eng yaqinini tanlaydi.

Bu bobdagi natijalar Node.js 26.12.0 (ICU 78.3) da olingan. Formatlash ma'lumotlari Unicode CLDR'dan keladi va boshqa versiyalarda farq qilishi mumkin.

## Kod: sonlar

```js
const n = 1234567.891;
for (const til of ['uz', 'uz-Cyrl', 'ru', 'en-US', 'de']) console.log(til.padEnd(8), new Intl.NumberFormat(til).format(n));
console.log(new Intl.NumberFormat('uz', { style: 'currency', currency: 'UZS' }).format(1250000));
console.log(new Intl.NumberFormat('uz', { style: 'currency', currency: 'USD' }).format(19.9));
console.log(new Intl.NumberFormat('uz', { style: 'percent' }).format(0.256));
console.log(new Intl.NumberFormat('uz', { notation: 'compact' }).format(2500000), new Intl.NumberFormat('en', { notation: 'compact' }).format(2500000));
console.log(new Intl.NumberFormat('uz', { style: 'unit', unit: 'kilometer-per-hour' }).format(60));
console.log(new Intl.NumberFormat('uz', { maximumFractionDigits: 1 }).format(3.14159), (1234.5).toLocaleString('uz'));
```

```text
$ node son.mjs
uz       1 234 567,891
uz-Cyrl  1 234 567,891
ru       1 234 567,891
en-US    1,234,567.891
de       1.234.567,891
1 250 000,00 soʻm
19,90 US$
26%
2,5 mln 2.5M
60 km/soat
3,1 1 234,5
```

- Minglik ajratgich va o'nli belgi tilga qarab o'zgaradi: o'zbekchada bo'sh joy va vergul.
- `style`: `'currency'` (valyuta kodi bilan), `'percent'`, `'unit'`; `notation: 'compact'` — qisqa yozuv (`2,5 mln`).
- `Number.prototype.toLocaleString(locale, options)` — xuddi shu API'ning qisqa shakli.

## Kod: sana va nisbiy vaqt

```js
const d = new Date(Date.UTC(2026, 9, 15, 9, 30));
for (const s of ['full', 'long', 'medium', 'short']) console.log(s.padEnd(7), new Intl.DateTimeFormat('uz', { dateStyle: s, timeZone: 'Asia/Tashkent' }).format(d));
console.log(new Intl.DateTimeFormat('uz-Cyrl', { dateStyle: 'full', timeZone: 'Asia/Tashkent' }).format(d));
console.log(new Intl.DateTimeFormat('uz', { weekday: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' }).format(d));
const rtf = new Intl.RelativeTimeFormat('uz', { numeric: 'auto' });
console.log(rtf.format(-1, 'day'), '|', rtf.format(2, 'hour'), '|', rtf.format(-3, 'month'));
```

```text
$ node sana.mjs
full    payshanba, 15-oktabr, 2026
long    15-oktabr, 2026
medium  15-okt, 2026
short   15/10/26
пайшанба, 15 октябр, 2026
payshanba, 14:30
kecha | 2 soatdan keyin | 3 oy oldin
```

- `dateStyle`/`timeStyle` — tayyor uslublar; alohida qismlar (`weekday`, `hour`, ...) bilan o'zingiz tuzasiz.
- `timeZone` — IANA zona nomi; `Date` ning faqat UTC va mahalliy zonasi cheklovini (37-bob) formatlashda yechadi.
- `uz-Cyrl` — kirill yozuvidagi o'zbekcha.
- `Intl.RelativeTimeFormat` — "kecha", "2 soatdan keyin"; `numeric: 'auto'` "1 kun oldin" o'rniga "kecha" beradi.

## Kod: ro'yxat, ko'plik, nomlar, saralash

```js
console.log(new Intl.ListFormat('uz', { type: 'conjunction' }).format(['olma', 'nok', 'uzum']));
console.log(new Intl.ListFormat('uz', { type: 'disjunction' }).format(['choy', 'qahva']));
const pr = new Intl.PluralRules('en');
console.log([1, 2].map(n => pr.select(n)), [1, 2, 5].map(n => new Intl.PluralRules('ru').select(n)), [1, 2].map(n => new Intl.PluralRules('uz').select(n)));
console.log(new Intl.DisplayNames('uz', { type: 'region' }).of('UZ'), new Intl.DisplayNames('uz', { type: 'language' }).of('en'), new Intl.DisplayNames('uz', { type: 'currency' }).of('UZS'));
console.log(['shaftoli', 'olma', 'Ölma', 'chaqmoq', 'sabzi', 'shirin'].sort(new Intl.Collator('uz').compare));
const loc = new Intl.Locale('uz-Latn-UZ');
console.log(loc.language, loc.script, loc.region, loc.baseName, Intl.getCanonicalLocales('UZ-latn-uz'));
console.log(Intl.DateTimeFormat().resolvedOptions().locale, new Intl.NumberFormat('xx-YY').resolvedOptions().locale);
try { new Intl.NumberFormat('not a locale!'); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(Intl.supportedValuesOf('currency').includes('UZS'), process.versions.icu);
```

```text
$ node boshqa.mjs
olma, nok va uzum
choy yoki qahva
[ 'one', 'other' ] [ 'one', 'few', 'many' ] [ 'one', 'other' ]
Oʻzbekiston inglizcha O‘zbekiston so‘mi
[ 'olma', 'Ölma', 'sabzi', 'shaftoli', 'shirin', 'chaqmoq' ]
uz Latn UZ uz-Latn-UZ [ 'uz-Latn-UZ' ]
en-US en-US
RangeError: Invalid language tag: not a locale!
true 78.3
```

- **`Intl.ListFormat`** — "olma, nok va uzum": bog'lovchi va vergullar tilga mos.
- **`Intl.PluralRules`** — son qaysi ko'plik toifasiga tushishini aytadi. Ingliz va o'zbek tilida ikki toifa, rus tilida ko'proq (`one`, `few`, `many`). "1 ta fayl / 5 ta fayl" kabi xabarlarni to'g'ri tuzish uchun.
- **`Intl.DisplayNames`** — mamlakat, til, valyuta nomlari foydalanuvchi tilida.
- **`Intl.Collator('uz')`** — o'zbek tili qoidalari bo'yicha saralaydi: `chaqmoq` `c` harfi o'rnida emas, ro'yxat **oxirida** keldi, `Ölma` esa `olma` yonida. Oddiy `sort()` kod birliklari bo'yicha saralaydi (28-bob).
- **`Intl.Locale`** — locale'ni qismlarga ajratadi; `getCanonicalLocales` — standart yozuvga keltiradi.
- MDN: tanilmagan locale e'tiborsiz qoldiriladi va standart locale ishlatiladi (`xx-YY` → `en-US`); sintaktik noto'g'ri identifikator esa `RangeError`.

E'tibor bering: CLDR ma'lumotlarida ham apostroflar bir xil emas — `Oʻzbekiston` da `U+02BB`, `so‘mi` da `U+2018`. Bu natijalarni boshqa matn bilan solishtirishda 29-bobdagi bir xillashtirish kerak bo'ladi.

## Nega shunday

Formatlash qoidalari — ajratgichlar, oy nomlari, ko'plik shakllari, alifbo tartibi — har til uchun turlicha. Dastur ularni o'zi saqlamaydi: faqat locale va opsiyalarni beradi, qoidalarni esa amalga oshirish ta'minlaydi. Node.js da buning manbai — ICU kutubxonasi (`process.versions.icu` — `78.3`). Shuning uchun natijalar muhit va uning versiyasiga bog'liq.

## Muhandislik nuqtai nazari

### Formatlovchini qayta ishlating

`new Intl.NumberFormat(...)` yaratish formatlashdan qimmatroq. Ko'p qiymatni formatlashda bitta formatlovchini yaratib, `format` ni qayta chaqiring.

### Satrni qo'lda yig'mang

`son + " so'm"`, `kun + "." + oy` kabi kodlar o'rniga `Intl` — u til, ajratgich va tartibni o'zi biladi.

### Testlarda locale va zonani belgilang

Natija muhitga bog'liq: testlarda `locale` va `timeZone` ni aniq bering. Natijani qat'iy satr bilan solishtirsangiz, ICU yangilanganda test buzilishi mumkin.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `locale` bermaslik | Server/muhit tiliga bog'liq natija | Aniq `'uz'` |
| `timeZone` bermaslik | Server zonasidagi vaqt | `timeZone: 'Asia/Tashkent'` |
| `n.toFixed(2) + ' so‘m'` | Ajratgich yo'q, til qoidalari yo'q | `NumberFormat` `currency` |
| Har chaqiruvda yangi formatlovchi | Sekin | Bittasini qayta ishlatish |
| Ko'plikni `n === 1 ? ... : ...` bilan | Rus va boshqa tillarda noto'g'ri | `Intl.PluralRules` |
| Natijani qat'iy satr bilan test qilish | ICU yangilanganda buziladi | Locale va versiyani qayd etish |

## Amaliyot

1. Narxlar ro'yxatini `uz`, `ru`, `en-US` uchun `currency: 'UZS'` bilan chiqaring.
2. "N ta yangi xabar" matnini `Intl.PluralRules('ru')` bilan to'g'ri shakllar bilan yozing (1, 2, 5, 21).
3. `nechaVaqtOldin(sana)` funksiyasini `RelativeTimeFormat` bilan yozing (soniya, daqiqa, soat, kun).
4. O'zbekcha so'zlar ro'yxatini `sort()` va `Intl.Collator('uz')` bilan saralab, farqlarni toping.
5. `Intl.Segmenter` (29-bob) bilan o'zbekcha matndagi so'zlar sonini hisoblang.

## Rasmiy hujjat

- MDN — `Intl`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl>
- MDN — `Intl.NumberFormat`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat>
- MDN — `Intl.DateTimeFormat`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat>
- MDN — `Intl.RelativeTimeFormat`, `Intl.ListFormat`, `Intl.PluralRules`, `Intl.Collator`, `Intl.DisplayNames`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#constructor_properties>
- ECMA-402 — *ECMAScript Internationalization API Specification*: <https://tc39.es/ecma402/>
