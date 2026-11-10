# 43 — Leksik muhit va closure

[← Oldingi: Rest va spread](42-rest-spread.md) · [Mundarija](README.md) · [Keyingi: Eski `var` →](44-var.md)

## Tushuncha

### Leksik muhit (ECMA-262, 9.1 Environment Records)

**Environment Record** (muhit yozuvi) — nomlarni (identifier) o'zgaruvchi va funksiyalarga bog'laydigan spetsifikatsiya turi. U kodning **leksik** (yozilgan joyidagi) ichma-ichligiga asoslanadi:

- Odatda ma'lum sintaksis bilan bog'liq: funksiya, blok `{ }`, `catch`. Shu kod **har bajarilganda yangi** Environment Record yaratiladi.
- Har yozuvda **`[[OuterEnv]]`** maydoni bor — tashqi (o'rab turgan) yozuvga havola yoki `null`. Shu havolalar zanjiri — **scope zanjiri**.
- Bitta tashqi yozuv bir nechta ichki yozuvning tashqisi bo'lishi mumkin: ikki ichki funksiyaning umumiy tashqisi — o'rab turgan funksiyaning yozuvi.
- Execution context kabi (40-bob) bu ham **faqat spetsifikatsiya vositasi**: dastur unga to'g'ridan-to'g'ri murojaat qila olmaydi.

| Turi | Nima uchun |
| --- | --- |
| Declarative | Funksiya, blok, `catch`, `let`/`const`/`class` |
| ↳ Function | Funksiya chaqiruvi: uning bog'lanishlari, `this`, `super` |
| ↳ Module | Modul darajasidagi e'lonlar va import'lar; tashqisi — global |
| Object | `with` — bog'lanishlar obyekt xossalaridan |
| Global | Skriptning global e'lonlari va global obyekt; tashqisi — `null` |

### `[[Environment]]` va closure

Har funksiya obyektida ichki slot bor — **`[[Environment]]`** (ECMA-262, 10.2): funksiya **yaratilgan** paytdagi Environment Record. Funksiya chaqirilganda uning yangi muhitining `[[OuterEnv]]` i shu slotdan olinadi.

MDN (*Closures*): **closure** — funksiya va u e'lon qilingan leksik muhitning birikmasi. Bu muhitga closure yaratilgan paytda ko'rinib turgan barcha o'zgaruvchilar kiradi. Shuning uchun ichki funksiya tashqi funksiya **tugagandan keyin ham** uning o'zgaruvchilarini ishlatadi.

Nom qanday topiladi: avval o'z muhitida, topilmasa `[[OuterEnv]]` da, keyin uning tashqisida… global muhitgacha. Topilmasa — `ReferenceError`.

## Kod: closure

MDN misollari:

```js
function makeFunc() {                      // MDN misoli
  const name = 'Mozilla';
  function displayName() { console.log(name); }
  return displayName;                      // ichki funksiya tashqi funksiya tugagach ham ishlatiladi
}
const myFunc = makeFunc();
myFunc();

function makeAdder(x) { return (y) => x + y; }
const add5 = makeAdder(5), add10 = makeAdder(10);
console.log(add5(2), add10(2));            // har chaqiruv — yangi muhit, o'z x'i
```

```text
$ node asos.mjs
Mozilla
7 12
```

- `makeFunc()` tugadi, lekin `myFunc` hali ham `name` ni chiqaradi: `displayName` ning `[[Environment]]` i o'sha muhitni saqlab turibdi.
- `makeAdder(5)` va `makeAdder(10)` — ikki chaqiruv, ikki **alohida** muhit. Har funksiya o'z `x` ini eslaydi.

## Kod: yopiq holat

```js
function yangiHisoblagich() {
  let son = 0;                             // tashqaridan ko'rinmaydi — faqat closure orqali
  return {
    oshir() { return ++son; },
    kamaytir() { return --son; },
    qiymat: () => son,
  };
}
const a = yangiHisoblagich(), b = yangiHisoblagich();
a.oshir(); a.oshir(); b.oshir();
console.log('a:', a.qiymat(), '| b:', b.qiymat(), '| a.son:', a.son);
const bir = a.oshir, ikki = a.qiymat;      // metodlarni ajratib olish — muhit baribir bitta
bir();
console.log('ajratilgandan keyin a:', ikki());
```

```text
$ node hisoblagich.mjs
a: 2 | b: 1 | a.son: undefined
ajratilgandan keyin a: 3
```

- `son` ga tashqaridan murojaat yo'q (`a.son` — `undefined`). Uni faqat `oshir`, `kamaytir`, `qiymat` o'zgartira oladi — MDN buni closure bilan **xususiy metodlarni** yaratish deydi.
- `a` va `b` — har biri o'z `son` i bilan.
- Metodlar obyektdan ajratib olinsa ham bitta muhitni bo'lishadi (`this` emas, closure — 19-bobdan farqi).

## Kod: sikldagi klassik xato

```js
const varBilan = [], letBilan = [];
for (var i = 0; i < 3; i++) varBilan.push(() => i);      // bitta umumiy i
for (let j = 0; j < 3; j++) letBilan.push(() => j);      // har iteratsiyada yangi j
console.log('var:', varBilan.map(f => f()), '| let:', letBilan.map(f => f()));

function yordam(matn) { return () => matn; }              // MDN yechimi: funksiya fabrikasi
const fabrika = [];
for (var k = 0; k < 3; k++) fabrika.push(yordam(`maydon ${k}`));
console.log('fabrika:', fabrika.map(f => f()));
```

```text
$ node sikl.mjs
var: [ 3, 3, 3 ] | let: [ 0, 1, 2 ]
fabrika: [ 'maydon 0', 'maydon 1', 'maydon 2' ]
```

MDN: `let` paydo bo'lishidan oldin sikldagi closure'lar keng tarqalgan xato edi.

- `var` — funksiya (bu yerda modul) darajasida **bitta** `i` (44-bob). Uchala funksiya bitta muhitni bo'lishadi va sikl tugagach `i = 3` ni ko'radi.
- `let` — har iteratsiyada **yangi** blok muhiti va o'z `j` i: 0, 1, 2.
- Eski yechim (MDN) — funksiya fabrikasi: har chaqiruv yangi muhit yaratadi. Zamonaviy yechim — `let`/`const`, `for...of` yoki `forEach`.

## Kod: scope zanjiri

```js
const yuqori = 'modul';
function tashqi() {
  const o = 'tashqi';
  return function orta() {
    const m = 'orta';
    return function ichki() {
      return [yuqori, o, m].join(' → ');   // nom ichkaridan tashqariga qarab izlanadi ([[OuterEnv]])
    };
  };
}
console.log(tashqi()()());
let x = 'birinchi';
const oqi = () => x;                        // closure qiymatni emas, o'zgaruvchini eslaydi
x = 'ikkinchi';
console.log(oqi());
```

```text
$ node zanjir.mjs
modul → tashqi → orta
ikkinchi
```

- `ichki` o'z muhitida `yuqori`, `o`, `m` ni topmaydi va zanjir bo'ylab tashqariga chiqadi.
- Closure qiymatning **nusxasini** emas, **o'zgaruvchining o'zini** eslaydi: `x` keyin o'zgargani `oqi()` da ko'rindi.

## Nega shunday

JavaScript'da funksiya — qiymat: uni qaytarish, saqlash, keyin chaqirish mumkin. Agar funksiya o'zi yaratilgan muhitni eslamasa, tashqi o'zgaruvchilarga murojaat qila olmasdi va tashqi funksiya tugashi bilan ular yo'qolardi. Shuning uchun nom **yozilgan joyga** (leksik) qarab izlanadi, chaqirilgan joyga qarab emas. Muhit esa unga funksiya havola qilib turgan ekan, xotirada qoladi.

## Muhandislik nuqtai nazari

### Closure — xotira

Closure eslagan muhit undagi barcha qiymatlarni xotirada ushlab turadi (18-bob). Uzoq yashaydigan callback'lar (taymer, event listener, kesh) katta obyektlarni bilmasdan saqlab qolishi mumkin. Keraksiz callback'ni olib tashlang.

### Keraksiz ichki funksiyalar

MDN: closure kerak bo'lmasa, funksiyani boshqa funksiya ichida yaratish tezlik va xotiraga ta'sir qiladi. Masalan, konstruktor ichida metod yaratish har obyekt uchun yangi funksiya beradi — metodlarni prototipga qo'ying (20-bob).

### Yopiq holat yoki `#private`

Closure — tashqaridan yashirilgan holatning eng oddiy yo'li. Klasslarda buning uchun `#private` maydonlari bor — klass boblarida.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Siklda `var` bilan callback | Hammasi oxirgi qiymatni ko'radi | `let`/`const`, `for...of` |
| Closure qiymatni saqlaydi deb o'ylash | Keyingi o'zgarish ko'rinadi | Kerak bo'lsa, qiymatni yangi o'zgaruvchiga oling |
| Uzoq yashaydigan closure'da katta obyekt | Xotira bo'shamaydi | Faqat keraklisini olish, callback'ni o'chirish |
| Konstruktor ichida metodlar | Har obyektga yangi funksiya | Prototip yoki klass metodi |
| Nom chaqirilgan joyga qarab izlanadi deb o'ylash | Kutilmagan qiymat | Leksik — yozilgan joy |

## Amaliyot

1. `yangiHisoblagich` ga `nolla()` metodini qo'shing va ikki hisoblagich mustaqil ekanini tekshiring.
2. `birMarta(f)` funksiyasini yozing: `f` ni faqat birinchi chaqiruvda bajarsin, keyin oldingi natijani qaytarsin.
3. `var` bilan sikldagi xatoni IIFE (44-bob) bilan tuzating va `let` yechimi bilan solishtiring.
4. `memo(f)` funksiyasini yozing: natijalarni closure ichidagi `Map` da saqlasin (41-bob, Fibonachchi).
5. MDN'dagi `sum(a)(b)(c)(d)` misolini yozib, har funksiya qaysi muhitdan qaysi o'zgaruvchini olishini izohlang.

## Rasmiy hujjat

- ECMA-262 — *9.1 Environment Records*: <https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-environment-records>
- ECMA-262 — *10.2 ECMAScript Function Objects* (`[[Environment]]`): <https://tc39.es/ecma262/2026/multipage/ordinary-and-exotic-objects-behaviours.html#sec-ecmascript-function-objects>
- MDN — *Closures*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures>
