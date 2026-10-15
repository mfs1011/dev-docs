# 37 — Sana va vaqt

[← Oldingi: Destructuring](36-destructuring.md) · [Mundarija](README.md) · [Keyingi: JSON →](38-json.md)

## Tushuncha

JavaScript'da sana bilan ishlashning ikki API'si bor:

- **`Date`** — tilning birinchi kunlaridan beri bor. Hamma muhitda ishlaydi, lekin ko'p tuzoqlari bor.
- **`Temporal`** — yangi API. ES2027 da yakunlangan, ES2026 spetsifikatsiyasida hali yo'q. Node.js 26.12.0 da mavjud.

MDN (`Temporal`) `Date` haqida ochiq yozadi: u Java'dagi yomon loyihalangan `java.util.Date` klassiga asoslangan. Java'da u 2010-yillar boshida almashtirilgan, JavaScript'da esa orqaga moslik uchun qolgan. MDN xulosasi: **sana bilan ishlash murakkab**, va eng yaxshi yechim — noldan qurilgan yangi API, ya'ni `Temporal`.

Bu bobdagi barcha misollar `TZ=Asia/Tashkent` muhit o'zgaruvchisi bilan ishga tushirilgan. Mahalliy vaqt zonasi natijaga ta'sir qiladi.

## `Date` qanday tuzilgan

MDN: `Date` aslida **bitta son** — **epoch**'dan (1970-yil 1-yanvar, UTC yarim tun) beri o'tgan **millisekundlar**. Bu vaqt belgisi (timestamp) vaqt zonasiga bog'liq emas va tarixdagi bitta lahzani aniq belgilaydi.

Lekin sanadan yil, oy, soat kabi **qismlarni** olishda bu son ikki xil talqin qilinadi: **mahalliy vaqt** (dastur ishlayotgan tizimning vaqt zonasi) yoki **UTC**. Shuning uchun deyarli har metodning ikki versiyasi bor: `getHours()` / `getUTCHours()`, `setMonth()` / `setUTCMonth()` va hokazo. Mahalliy vaqt zonasi `Date` obyektida **saqlanmaydi** — u muhitdan olinadi.

## Kod: `Date` asoslari va tuzoqlari

```js
const d = new Date(2026, 9, 15, 14, 30);
console.log(d.getFullYear(), d.getMonth(), d.getDate(), d.getDay(), d.getHours());
console.log(d.toISOString(), d.getTime(), d.getTimezoneOffset());
console.log(new Date(0).toISOString(), Date.now() > 1.7e12);
console.log(new Date(2026, 12, 1).toDateString(), new Date(2026, 2, 0).getDate(), new Date(2026, 0, 31 + 1).toDateString());
console.log(new Date(99, 0, 1).getFullYear());
```

```text
$ TZ=Asia/Tashkent node date.mjs
2026 9 15 4 14
2026-10-15T09:30:00.000Z 1792056600000 -300
1970-01-01T00:00:00.000Z true
Fri Jan 01 2027 28 Sun Feb 01 2026
1999
```

- **Oylar 0 dan boshlanadi**: `new Date(2026, 9, 15)` — **oktabr** (MDN: dekabr — 11). Kun esa 1 dan. `getDay()` — hafta kuni, 0 — yakshanba (`4` — payshanba).
- `toISOString()` doim UTC: Toshkentdagi 14:30 — UTC bo'yicha 09:30. `getTimezoneOffset()` — UTC va mahalliy vaqt farqi daqiqalarda, **teskari ishora** bilan (UTC+5 uchun `-300`).
- **Toshib o'tish** — MDN: qism ruxsat etilgan oraliqdan chiqsa, keyingi yoki oldingi qismga o'tadi. 12-oy → keyingi yil yanvari; 0-kun → oldingi oyning oxirgi kuni (`new Date(2026, 2, 0)` — fevralning 28-kuni, oy uzunligini topishning mashhur usuli).
- **Ikki xonali yil** — MDN: `Date()` ikki xonali yilni 1900-yillar deb talqin qiladi. `99` — 1999.

## Kod: satrni o'qish

```js
console.log(new Date('2026-10-15').toString());
console.log(new Date('2026-10-15T00:00').toString());
console.log(new Date('2026-10-15T00:00Z').toISOString());
const x = new Date('15.10.2026');
console.log(x.toString(), isNaN(x), Number.isNaN(x.getTime()));
console.log(new Date('2026-02-30').toString());
```

```text
$ TZ=Asia/Tashkent node parse.mjs
Thu Oct 15 2026 05:00:00 GMT+0500 (Uzbekistan Standard Time)
Thu Oct 15 2026 00:00:00 GMT+0500 (Uzbekistan Standard Time)
2026-10-15T00:00:00.000Z
Invalid Date true true
Mon Mar 02 2026 05:00:00 GMT+0500 (Uzbekistan Standard Time)
```

Spetsifikatsiya faqat **bitta** formatni hamma joyda qo'llab-quvvatlanishini talab qiladi — ISO 8601 ning soddalashtirilgan ko'rinishi: `YYYY-MM-DDTHH:mm:ss.sssZ`. MDN'dagi muhim qoida:

> Vaqt zonasi ko'rsatilmasa, **faqat sana** shakli **UTC** deb, **sana-vaqt** shakli esa **mahalliy vaqt** deb talqin qilinadi.

Shuning uchun `'2026-10-15'` — UTC yarim tun, ya'ni Toshkentda soat **05:00**. `'2026-10-15T00:00'` esa mahalliy yarim tun. MDN: bu ISO 8601 ga mos kelmaydigan tarixiy xato, lekin vebdagi moslik uchun tuzatib bo'lmaydi.

- Boshqa formatlar (`'15.10.2026'`) — MDN: amalga oshirishga bog'liq. Node'da — `Invalid Date`. Noto'g'ri sana `getTime()` da `NaN` beradi — `Number.isNaN(d.getTime())` bilan tekshiriladi.
- `'2026-02-30'` — haqiqatda yo'q sana. MDN: bu holda amalga oshirishlar **turlicha** ishlaydi. V8 uni 2-martga o'tkazdi.

## Kod: o'zgaruvchanlik va taqqoslash

```js
const boshlanish = new Date(2026, 9, 15);
function birOydanKeyin(sana) { sana.setMonth(sana.getMonth() + 1); return sana; }
const tugash = birOydanKeyin(boshlanish);
console.log(boshlanish.toDateString(), tugash.toDateString(), boshlanish === tugash);
const yanvar31 = new Date(2026, 0, 31);
yanvar31.setMonth(1);
console.log(yanvar31.toDateString());
const a = new Date(2026, 9, 15), b = new Date(2026, 9, 1);
console.log((a - b) / 86400000, a > b, a == new Date(2026, 9, 15), a.getTime() === new Date(2026, 9, 15).getTime());
console.log(new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Tashkent' }).format(a));
```

```text
$ TZ=Asia/Tashkent node mutatsiya.mjs
Sun Nov 15 2026 Sun Nov 15 2026 true
Tue Mar 03 2026
14 true false true
payshanba, 15-oktabr, 2026, 00:00
```

- MDN: `Date` ning hamma **setter**'lari obyektni **o'zgartiradi** — bu kutilmagan yon ta'sirlarga olib keladi. `birOydanKeyin` "boshlanish" sanasini ham buzdi: ikkalasi bitta obyekt.
- **31-yanvar + 1 oy** — 31-fevral yo'q, toshib o'tib **3-mart** bo'ldi.
- **Taqqoslash**: `<`, `>` va `-` sonli ishora bilan ishlaydi (23-bob) — vaqt belgilari solishtiriladi. `==` esa ikki **obyektni** havola bo'yicha solishtiradi — `false`. Tenglik uchun `getTime()`.
- Foydalanuvchiga ko'rsatish — `Intl.DateTimeFormat` (39-bob).

## `Temporal` — yangi API

MDN: `Temporal` — `Math` va `Intl` kabi **nomlar fazosi** (namespace), konstruktor emas. Uning asosiy g'oyasi — `Date` ning bir obyektga tiqilgan ikki rolini **ajratish**:

| Klass | Nimani ifodalaydi |
| --- | --- |
| `Temporal.Instant` | Tarixdagi aniq lahza (vaqt belgisi), zonasiz |
| `Temporal.ZonedDateTime` | Sana-vaqt + **vaqt zonasi** — aniq lahza |
| `Temporal.PlainDateTime` | Sana-vaqt, zonasiz ("devor soati") |
| `Temporal.PlainDate` | Faqat sana (tug'ilgan kun, bayram) |
| `Temporal.PlainTime` | Faqat vaqt (ish boshlanishi 09:00) |
| `Temporal.PlainYearMonth`, `PlainMonthDay` | Yil-oy, oy-kun |
| `Temporal.Duration` | Ikki lahza orasidagi davomiylik |
| `Temporal.Now` | Joriy vaqtni olish |

MDN `Date` dagi kamchiliklarni sanaydi: istalgan vaqt zonasini ko'rsatib bo'lmaydi (faqat UTC va mahalliy), "zonasiz sana" tushunchasi yo'q, kalendar tizimi yo'q, setter'lar o'zgartiradi, satr formatini izchil o'qib bo'lmaydi. `Temporal` hammasini hal qiladi.

## Kod: `Temporal` bilan

```js
const sana = Temporal.PlainDate.from('2026-10-15');
console.log(sana.toString(), sana.month, sana.dayOfWeek, sana.daysInMonth, sana.inLeapYear);
const keyin = sana.add({ months: 1 });
console.log(sana.toString(), keyin.toString());
console.log(Temporal.PlainDate.from('2026-01-31').add({ months: 1 }).toString());
try { Temporal.PlainDate.from('2026-02-30'); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(Temporal.PlainDate.from({ year: 2026, month: 2, day: 30 }).toString());
const t = Temporal.ZonedDateTime.from('2026-10-15T14:30[Asia/Tashkent]');
console.log(t.toString(), t.withTimeZone('America/New_York').toString());
console.log(t.toInstant().toString(), t.epochMilliseconds);
const d = Temporal.PlainDate.from('2026-12-31').since('2026-10-15');
console.log(d.toString(), d.days, Temporal.PlainDate.from('2026-12-31').since('2026-10-15', { largestUnit: 'months' }).toString());
console.log(Temporal.PlainDate.compare(sana, keyin), sana.equals(Temporal.PlainDate.from('2026-10-15')));
console.log(sana.toLocaleString('uz-UZ', { dateStyle: 'long' }));
console.log(typeof Temporal.Now.instant().epochNanoseconds);
```

```text
$ TZ=Asia/Tashkent node temporal.mjs
2026-10-15 10 4 31 false
2026-10-15 2026-11-15
2026-02-28
RangeError: Temporal error: Parsed day value not in a valid range.
2026-02-28
2026-10-15T14:30:00+05:00[Asia/Tashkent] 2026-10-15T05:30:00-04:00[America/New_York]
2026-10-15T09:30:00Z 1792056600000
P77D 77 P2M16D
-1 true
15-oktabr, 2026
bigint
```

- **Oylar 1 dan** (`month` — 10), hafta kuni 1 (dushanba) — 7 (yakshanba).
- **O'zgarmas**: `add` yangi obyekt qaytaradi, `sana` o'zgarmadi.
- **31-yanvar + 1 oy = 28-fevral**. MDN: obyektdan yaratishda `overflow` opsiyasi standart holatda `"constrain"` — qiymat ruxsat etilgan oraliqqa **qisiladi** (clamp), `Date` dagi kabi keyingi oyga o'tib ketmaydi.
- **Noto'g'ri satr** — `'2026-02-30'` satri `RangeError` berdi (`Date` jim 2-martga o'tkazgan edi).
- **Istalgan vaqt zonasi**: `ZonedDateTime` IANA zona nomini saqlaydi; `withTimeZone` — o'sha lahza boshqa zonada.
- **Davomiylik** — `since`/`until` `Duration` qaytaradi; ISO 8601 ko'rinishida (`P77D` — 77 kun, `P2M16D` — 2 oy 16 kun).
- Taqqoslash — `compare` va `equals`; aniqlik — **nanosekund** (`epochNanoseconds` — BigInt).

## Nega shunday

MDN `Date` haqida: uning muammolarining ko'pini metod qo'shib tuzatish mumkin, lekin asosiy loyiha xatosi qoladi — bitta obyekt juda ko'p narsani bajaradi va dasturchi qaysi metodni ishlatishni bilmay qoladi. Yaxshi API har abstraksiya darajasida ko'proq emas, **kamroq** ish qilishi kerak. `Temporal` shuning uchun "lahza", "zonali sana-vaqt", "zonasiz sana" kabi tushunchalarni alohida klasslarga ajratadi. `Date` esa moslik uchun tilda qoladi.

## Muhandislik nuqtai nazari

### Saqlash va uzatish — UTC va ISO satr

Ma'lumotlar bazasi va API'larda vaqtni **UTC** da, ISO 8601 satri (`toISOString()`) yoki vaqt belgisi sifatida saqlang. Mahalliy vaqtga faqat foydalanuvchiga ko'rsatishda o'giring.

### Faqat sana kerak bo'lsa — vaqt zonasini aralashtirmang

Tug'ilgan kun, to'lov muddati kabi "faqat sana" qiymatlarni `new Date('2026-10-15')` bilan o'qish UTC yarim tunini beradi — g'arbiy zonalarda bu **oldingi kun** bo'lib ko'rinadi. `Temporal.PlainDate` yoki oddiy `'YYYY-MM-DD'` satr bilan ishlang.

### Yangi kodda — `Temporal`, muhit ruxsat bersa

`Temporal` ES2027 da yakunlangan; Node.js 26 da bor. Brauzerlardagi holatini loyihangiz qo'llab-quvvatlaydigan muhitlar bo'yicha tekshiring (yoki polyfill — 15-bob). `Date` bilan ishlashga majbur bo'lsangiz: setter'lardan oldin nusxa oling (`new Date(d)`), oylar 0 dan ekanini unutmang, satrni faqat ISO formatda o'qing.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `new Date(2026, 10, 15)` — oktabr deb o'ylash | Noyabr | Oy `9` yoki `Temporal` (1 dan) |
| `new Date('2026-10-15')` — mahalliy yarim tun deb o'ylash | UTC yarim tun | `'2026-10-15T00:00'` yoki `PlainDate` |
| `new Date('15.10.2026')` | `Invalid Date` | ISO format |
| Funksiyada `sana.setMonth(...)` | Chaqiruvchining sanasi o'zgaradi | `new Date(sana)` nusxa yoki `Temporal` |
| `d1 == d2` | Havola taqqoslanadi | `d1.getTime() === d2.getTime()` |
| 31-yanvarga 1 oy qo'shish (`Date`) | 3-mart | `Temporal` `add` (28-fevral) |
| `(d2 - d1) / 86400000` ni kunlar soni deb hisoblash | Yozgi vaqt o'tishida xato bo'lishi mumkin | `Temporal` `since` |
| `isNaN(sana)` bilan tekshirmaslik | `Invalid Date` jim tarqaladi | `Number.isNaN(d.getTime())` |

## Amaliyot

1. `oyKunlari(yil, oy)` funksiyasini ikki xil yozing: `new Date(yil, oy, 0)` hiylasi va `Temporal.PlainYearMonth` (`daysInMonth`).
2. Tug'ilgan sanadan yoshni hisoblang (`Temporal.PlainDate` va `until` bilan, `largestUnit: 'years'`).
3. Toshkentdagi 2026-12-31 23:00 qaysi lahzaga to'g'ri keladi? Tokio va London vaqtida ko'rsating.
4. `parse.mjs` ni `TZ=America/New_York` bilan ishga tushiring. Qaysi qatorlar o'zgardi va nega?
5. `Date` bilan "keyingi dushanba" ni topadigan funksiya yozing, keyin `Temporal` bilan qayta yozing va taqqoslang.

## Rasmiy hujjat

- MDN — `Date`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date>
- MDN — `Date` ("Date time string format"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format>
- MDN — `Temporal`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal>
- MDN — `Temporal.PlainDate`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDate>
- MDN — `Temporal.ZonedDateTime`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime>
- MDN — *Representing dates & times* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Representing_dates_times>
- ECMA-262 — *Date Objects*: <https://tc39.es/ecma262/2026/#sec-date-objects>
- TC39 — *Temporal* taklifi: <https://tc39.es/proposal-temporal/>
