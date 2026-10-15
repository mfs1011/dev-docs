# 26 — Number

[← Oldingi: Primitivlarning metodlari](25-primitivlarning-metodlari.md) · [Mundarija](README.md) · [Keyingi: BigInt →](27-bigint.md)

## Tushuncha

MDN: JavaScript kodidagi `37` kabi son literali **suzuvchi nuqtali** (floating-point) qiymat, butun son emas. Kundalik ishlatishda alohida butun son turi **yo'q**. Juda katta butun sonlar uchun `BigInt` bor (27-bob), lekin u `Number` ning o'rnini bosish uchun mo'ljallanmagan.

`Number` turi — **IEEE 754 standartidagi 64 bitli ikki karra aniqlikdagi** (double-precision) son, Java yoki C# dagi `double` kabi. MDN bo'yicha 64 bit uch qismga bo'linadi:

| Qism | Bit | Vazifasi |
| --- | --- | --- |
| Ishora (sign) | 1 | Musbat yoki manfiy |
| Daraja (exponent) | 11 | 2 ning darajasi (−1022 dan 1023 gacha) |
| Mantissa (significand) | 52 | Sonning muhim raqamlari |

Ilmiy yozuvdagi kabi: son = (−1)<sup>ishora</sup> × (1 + mantissa) × 2<sup>daraja</sup>. Bundan uch muhim chegara kelib chiqadi (MDN):

- **Aniqlik** — mantissa 52 bit, ya'ni taxminan **15–17 o'nli raqam**. Undan nozik hisoblar yaxlitlanadi.
- **Eng katta qiymat** — `Number.MAX_VALUE` (~1.8 × 10<sup>308</sup>). Undan kattasi `Infinity` ga aylanadi.
- **Xavfsiz butun sonlar** — faqat −(2<sup>53</sup> − 1) dan 2<sup>53</sup> − 1 gacha (`Number.MIN_SAFE_INTEGER`, `Number.MAX_SAFE_INTEGER`) butun sonlar aniq saqlanadi.

## Kod: aniqlik chegaralari

```js
console.log(0.1 + 0.2, 0.1 + 0.2 === 0.3);
console.log((0.1).toFixed(20));
console.log(Number.EPSILON, Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(1000.1 + 1000.2, Math.abs(1000.1 + 1000.2 - 2000.3) < Number.EPSILON);
console.log(Number.MAX_SAFE_INTEGER, 2 ** 53 === 2 ** 53 + 1, Number.isSafeInteger(2 ** 53));
console.log(Number.MAX_VALUE, Number.MAX_VALUE * 2, 1 / 0, -1 / 0);
console.log(9007199254740993);
```

```text
$ node aniqlik.mjs
0.30000000000000004 false
0.10000000000000000555
2.220446049250313e-16 true
2000.3000000000002 false
9007199254740991 true false
1.7976931348623157e+308 Infinity Infinity -Infinity
9007199254740992
```

- **`0.1 + 0.2`** — MDN (`Number.EPSILON`): cheklangan bitli har qanday sanoq tizimi hamma sonni aniq ifodalay olmaydi. O'nlik tizim 1/3 ni aniq yoza olmaganidek, ikkilik tizim `0.1` ni aniq yoza olmaydi. `(0.1).toFixed(20)` buni ko'rsatadi: xotiradagi qiymat `0.1` dan biroz katta.
- **`Number.EPSILON`** — 1 va undan keyingi ifodalanadigan son orasidagi farq (2<sup>−52</sup>). MDN: kattaligi 1 atrofidagi hisoblar uchun "yetarlicha yaqin" chegarasi sifatida maqbul. Lekin **katta sonlar uchun yaramaydi**: `1000.1 + 1000.2` xatosi `EPSILON` dan katta. Son kattalashgan sari mutlaq aniqlik kamayadi.
- **`2 ** 53 === 2 ** 53 + 1`** — `true`! Xavfsiz chegaradan keyin qo'shni butun sonlar bir xil qiymatga tushadi. `9007199254740993` literali ham eng yaqin ifodalanadigan son — `...992` ga aylandi.
- **`Infinity`** — `MAX_VALUE` dan oshganda va nolga bo'lishda. Xato emas, maxsus qiymat.

## Kod: `NaN`

**`NaN`** (Not-a-Number — "son emas") — son turidagi, lekin haqiqiy son bo'lmagan maxsus qiymat.

```js
console.log(Number('12px'), parseInt('12px'), parseFloat('3.5kg'), Number(''), Number(' 42 '), Number(null), Number(undefined));
console.log(0 * Infinity, Math.sqrt(-1), 7 * 'abc');
console.log(NaN === NaN, NaN < 1, NaN > 1, [NaN].includes(NaN), [NaN].indexOf(NaN));
console.log(isNaN('abc'), Number.isNaN('abc'), Number.isNaN(NaN), Object.is(NaN, NaN));
```

```text
$ node nan.mjs
NaN 12 3.5 0 42 0 NaN
NaN NaN NaN
false false false true -1
true false true true
```

MDN `NaN` hosil bo'ladigan holatlarni sanaydi:

- **Muvaffaqiyatsiz son aylantirish** — `Number('12px')`. `parseInt`/`parseFloat` esa satr boshidagi sonni o'qib, qolganini tashlaydi. MDN (*Number coercion*): `Number('')` va faqat bo'sh joydan iborat satr — `0`, chetdagi bo'sh joylar e'tiborsiz qoldiriladi.
- **Haqiqiy son bo'lmagan natija** — `Math.sqrt(-1)`.
- **Aniqlanmagan shakl** — `0 * Infinity`, `Infinity - Infinity`.
- **"Yuqumli"** — operandlardan biri `NaN` bo'lsa, natija odatda `NaN`.

Taqqoslash (MDN; bu IEEE 754 qoidasi, JavaScript ixtirosi emas):

- `NaN` **o'ziga ham teng emas** — `NaN === NaN` → `false`. `<`, `>` bilan har qanday taqqoslash — `false`.
- `includes` topadi, `indexOf` topmaydi: MDN — `includes` **SameValueZero** algoritmidan foydalanadi, `indexOf` esa `===` dan.
- **`isNaN` va `Number.isNaN` farqi** (MDN): global `isNaN` avval qiymatni songa **aylantiradi** — `'abc'` → `NaN` → `true`. `Number.isNaN` aylantirmaydi, faqat qiymat **hozir** `NaN` bo'lsa `true` beradi. Doim `Number.isNaN` ishlating.

## Kod: `-0`

IEEE 754 da nolning ikki ko'rinishi bor: `+0` va `-0`.

```js
console.log(0 === -0, Object.is(0, -0), 1 / 0, 1 / -0);
console.log(-0, String(-0), (-0).toFixed(1), JSON.stringify(-0), Math.round(-0.4));
```

```text
$ node nol.mjs
true false Infinity -Infinity
-0 0 0.0 0 -0
```

- `0 === -0` — `true`, lekin `Object.is` ularni **farqlaydi** (MDN: `Object.is` ikkala `+0` yoki ikkala `-0` bo'lsagina bir xil deydi).
- Farq bo'lishda ko'rinadi: `1 / -0` — `-Infinity`.
- Satrga aylantirishda `-0` "yo'qoladi" — `String(-0)` → `"0"`. `Math.round(-0.4)` esa `-0` qaytaradi (MDN `Math.round`: −0.5 ≤ x < 0 da `-0`).

## Kod: yozish va formatlash

```js
console.log(255 === 0xff, 255 === 0b11111111, 255 === 0o377, 255 === 2.55e2, 1_000_000);
console.log((255).toString(16), (255).toString(2), parseInt('ff', 16), Number('0x1f'), parseInt('1_000'), Number('1_000'));
console.log((1234.5678).toFixed(2), (0.000123).toExponential(1), (1234.5678).toPrecision(6));
console.log((1.005).toFixed(2), (2.5).toFixed(0), Math.round(2.5), Math.round(-2.5));
console.log(new Intl.NumberFormat('uz-UZ').format(1234567.891));
```

```text
$ node yozuv.mjs
true true true true 1000000
ff 11111111 255 31 1 NaN
1234.57 1.2e-4 1234.57
1.00 3 3 -2
1 234 567,891
```

- **Literallar**: `0x` (o'n oltilik), `0b` (ikkilik), `0o` (sakkizlik), `e` (daraja). `1_000_000` — **raqam ajratgichi** (numeric separator), faqat o'qishni osonlashtiradi. MDN (*Number coercion*): ajratgich `Number()` ga berilgan **satrda** ruxsat etilmaydi — `NaN`. `parseInt` esa `_` da to'xtaydi va `1` qaytaradi.
- **`toString(asos)`** — boshqa sanoq tizimida yozish; `parseInt(satr, asos)` — teskarisi.
- **`toFixed(n)`** — kasrdan keyin aniq `n` raqam, **satr** qaytaradi. `toPrecision(n)` — jami `n` muhim raqam.
- **`(1.005).toFixed(2)` → `"1.00"`**, `"1.01"` emas. MDN `(2.55).toFixed(1)` → `'2.5'` misolida sababni aytadi: literal float'da aniq ifodalanmaydi, eng yaqin float esa **kichikroq**. Haqiqatan, `(1.005).toFixed(20)` → `'1.00499999999999989342'`.
- **`Math.round`** — MDN: kasr qismi aynan 0.5 bo'lsa, **+∞ tomonga** yaxlitlaydi. Shuning uchun `Math.round(-2.5)` → `-2`. Bu ko'p tillardagi "noldan uzoqqa" yaxlitlashdan farq qiladi.
- **`Intl.NumberFormat`** — mahalliy formatlash (39-bob).

## Kod: `Math`

`Math` — konstruktor emas, statik metodlar to'plami:

```js
console.log(Math.round(4.5), Math.floor(-4.5), Math.ceil(-4.5), Math.trunc(-4.5));
console.log(Math.max(3, 7, 1), Math.min(), Math.max(), Math.max(...[4, 9, 2]));
console.log(Math.abs(-5), Math.sign(-3), Math.hypot(3, 4), Math.cbrt(27), 2 ** 10);
const r = Math.random(); console.log(r >= 0 && r < 1);
const tasodifiyButun = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
console.log([...Array(1000)].map(() => tasodifiyButun(1, 6)).every(n => n >= 1 && n <= 6));
```

```text
$ node math.mjs
5 -5 -4 -4
7 Infinity -Infinity 9
5 -1 5 3 1024
true
true
```

| Metod | Nima qiladi | `-4.5` uchun |
| --- | --- | --- |
| `Math.floor` | Pastga (−∞ tomon) | `-5` |
| `Math.ceil` | Yuqoriga (+∞ tomon) | `-4` |
| `Math.trunc` | Kasr qismini tashlash (nol tomon) | `-4` |
| `Math.round` | Eng yaqin butun, .5 da +∞ tomon | `-4` |

- MDN: `Math.max()` argumentsiz — `-Infinity`, `Math.min()` — `Infinity`. Massiv uchun — spread.
- `Math.random()` — `[0, 1)` oralig'ida. MDN `Math.random` sahifasi ogohlantiradi: u kriptografik xavfsiz **emas**. Parol yoki token uchun `crypto.getRandomValues()` kerak.

## Kod: `Math.sumPrecise` (ES2026)

ES2026 da `Math.sumPrecise(iterable)` qo'shildi. MDN: u sonlarni oddiy tsikldan **aniqroq** qo'shadi — xuddi sonlar aniq matematik qiymatlari bilan qo'shilib, natija eng yaqin 64 bitli float'ga aylantirilgandek.

**Node.js 26.12.0 da bu metod hali yo'q** (`typeof Math.sumPrecise` → `'undefined'`). Shuning uchun quyida core-js 3.50.0 polyfill'i (15-bob) bilan ishga tushirildi:

```js
console.log(typeof Math.sumPrecise);
await import('core-js/actual/math/sum-precise.js');
let sum = 0;
for (const n of [1e20, 0.1, -1e20]) sum += n;
console.log(sum, Math.sumPrecise([1e20, 0.1, -1e20]), Math.sumPrecise([0.1, 0.2]));
```

```text
$ node sum.mjs
undefined
0 0.1 0.30000000000000004
```

- Oddiy tsikl `0` berdi. MDN: `1e20 + 0.1` aniq ifodalanmaydi va `1e20` ga yaxlitlanadi, keyin `-1e20` bilan `0`.
- `Math.sumPrecise` — `0.1`.
- Lekin `0.1 + 0.2` muammosini **hal qilmaydi**. MDN: `0.1` va `0.2` literallari allaqachon `0.1` va `0.2` dan biroz katta qiymatlar. Ularning aniq yig'indisiga eng yaqin float — baribir `0.30000000000000004`.

## Nega shunday

IEEE 754 — protsessorlar apparat darajasida qo'llab-quvvatlaydigan standart. Shuning uchun `Number` arifmetikasi tez. Narxi — o'nli kasrlarning aniq emasligi. Bu JavaScript'ga xos emas: MDN `NaN` ning xatti-harakati, jumladan `NaN !== NaN`, IEEE 754 da belgilanganini ta'kidlaydi. Xuddi shu `0.1 + 0.2` natijasi `double` ishlatadigan boshqa tillarda ham chiqadi.

Bitta son turi tilni soddalashtiradi: butun va kasr uchun alohida operatorlar yo'q. Faqat 2<sup>53</sup> dan katta butun sonlar uchun `BigInt` qo'shilgan (27-bob).

## Muhandislik nuqtai nazari

### Pulni float'da hisoblamang

So'm, tiyin, sent — **butun** birliklarda saqlang: `12.50` so'm emas, `1250` tiyin. Ko'rsatishda bo'ling va `Intl.NumberFormat` bilan formatlang. Aks holda `0.1 + 0.2` kabi xatolar hisob-kitobda to'planadi.

### Kasr sonlarni `===` bilan solishtirmang

MDN tavsiyasi: suzuvchi nuqtali sonlarni `===` bilan solishtirmang, "yetarlicha yaqin"ligini tekshiring. Chegara (tolerance) sonlar kattaligiga mos tanlanadi. `Number.EPSILON` faqat 1 atrofidagi sonlar uchun yaroqli.

### Tashqaridan kelgan sonni tekshiring

`Number(kiritish)` — `NaN` bo'lishi mumkin, `''` esa `0` beradi. Forma va API qiymatlarida `Number.isFinite(x)` bilan tekshiring. ID kabi katta butun sonlar (masalan, ma'lumotlar bazasidagi 64 bitli ID) 2<sup>53</sup> dan oshsa — satr yoki `BigInt` sifatida saqlang.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `0.1 + 0.2 === 0.3` | `false` | Tolerans bilan yoki butun birliklarda |
| `x === NaN` | Doim `false` | `Number.isNaN(x)` |
| `isNaN('abc')` | `true` (aylantirish) | `Number.isNaN` |
| `(1.005).toFixed(2)` → `'1.01'` deb kutish | `'1.00'` | Butun birliklarda hisoblash |
| `Math.round(-2.5)` → `-3` deb kutish | `-2` | Kerakli yaxlitlashni o'zingiz yozing |
| 2<sup>53</sup> dan katta ID'ni `Number` ga | Oxirgi raqamlar buziladi | Satr yoki `BigInt` |
| `Math.random()` bilan token | Bashorat qilinishi mumkin | `crypto.getRandomValues()` |

## Amaliyot

1. `0.1 * 3`, `0.3 / 0.1`, `9.95.toFixed(1)` — natijalarni tekshiring va `toFixed(20)` bilan sababini toping.
2. `teng(a, b)` funksiyasini yozing: nisbiy tolerans bilan — `Math.abs(a - b) <= Number.EPSILON * Math.max(Math.abs(a), Math.abs(b))`. `1000.1 + 1000.2` va `2000.3` uchun sinang.
3. `Number.MAX_SAFE_INTEGER + 1`, `+ 2`, `+ 3` — qaysilari bir xil chiqadi?
4. `['1', '2', '3'].map(parseInt)` nima qaytaradi? (Ishora: `map` callback'ga ikkinchi argument sifatida indeks beradi, `parseInt` ikkinchi argumentni asos deb oladi.)
5. Narxlar massivini (`[12000.5, 8000.25, ...]`) tiyinda yig'ing va natijani `Intl.NumberFormat('uz-UZ', { style: 'currency', currency: 'UZS' })` bilan chiqaring.

## Rasmiy hujjat

- MDN — `Number`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number>
- MDN — *Numbers and strings* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Numbers_and_strings>
- MDN — `Number.EPSILON`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON>
- MDN — `NaN`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN>
- MDN — `Number.prototype.toFixed()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed>
- MDN — `Math`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math>
- MDN — `Math.round()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round>
- MDN — `Math.sumPrecise()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sumPrecise>
- ECMA-262 — *The Number Type*: <https://tc39.es/ecma262/2026/#sec-ecmascript-language-types-number-type>
- ECMA-262 — *Math.sumPrecise*: <https://tc39.es/ecma262/2026/#sec-math.sumprecise>
