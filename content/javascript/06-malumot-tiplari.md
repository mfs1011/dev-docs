# 06 — Ma'lumot tiplari

[← Oldingi: O'zgaruvchilar](05-ozgaruvchilar.md) · [Mundarija](README.md) · [Keyingi: Tip o'zgartirish →](07-tip-ozgartirish.md)

## Tushuncha

JavaScript'dagi har bir qiymat aniq bir **tip**ga tegishli. Standartda jami **8 tip** bor: 7 ta **primitiv** va **Object**.

| Tip | Qiymatlar | `typeof` | O'rov obyekt |
| --- | --- | --- | --- |
| Null | faqat `null` | `"object"` (!) | yo'q |
| Undefined | faqat `undefined` | `"undefined"` | yo'q |
| Boolean | `true`, `false` | `"boolean"` | `Boolean` |
| Number | `42`, `3.14`, `NaN`, `Infinity`, `-0` | `"number"` | `Number` |
| BigInt | `42n`, `2n ** 64n` | `"bigint"` | `BigInt` |
| String | `'matn'` | `"string"` | `String` |
| Symbol | `Symbol('id')` | `"symbol"` | `Symbol` |
| **Object** | `{}`, `[]`, funksiyalar, `Date`, `Map`... | `"object"` yoki `"function"` | — |

(Jadval — MDN *JavaScript data types and data structures* sahifasidan.)

### Primitiv qiymat

MDN: Object'dan boshqa barcha tiplar tilning eng quyi darajasida bevosita ifodalanadigan **o'zgarmas** (immutable) qiymatlarni belgilaydi — ular **primitiv qiymatlar** deyiladi.

"O'zgarmas" degani — qiymatning **o'zini** o'zgartirib bo'lmaydi. Satrda metodlar yangi satr qaytaradi:

```js
const s = 'salom';
const katta = s.toUpperCase();
console.log(s, katta);
```

```text
salom SALOM
```

`s` o'zgarmadi. `5` sonini "6 ga aylantirib" bo'lmaydi — faqat o'zgaruvchiga boshqa son yozish mumkin.

### Obyekt

MDN: JavaScript'da obyektlar — **yagona o'zgaruvchan** (mutable) qiymatlar. Funksiyalar ham aslida obyekt, faqat qo'shimcha ravishda **chaqirilishi** mumkin. Obyektni **xossalar to'plami** sifatida ko'rish mumkin: kalit (satr yoki Symbol) — qiymat juftliklari.

```js
const a = { n: 1 };
const b = a;
b.n = 2;
console.log(a.n);      // 2 — a va b bitta obyektga qarab turibdi

let x = 5;
let y = x;
y = 6;
console.log(x);        // 5 — primitiv nusxalanadi
```

```text
2
5
```

Bu farq — JavaScript'dagi eng muhim tushunchalardan biri: primitiv **qiymat bo'yicha**, obyekt **havola bo'yicha** saqlanadi va uzatiladi. 17-bobda chuqur.

## Kod: `typeof` — 13 ta qiymat, 8 ta javob

```js
const qiymatlar = [
  ['undefined', undefined], ['null', null], ['true', true], ['42', 42],
  ['42n', 42n], ["'matn'", 'matn'], ["Symbol('id')", Symbol('id')],
  ['{}', {}], ['[]', []], ['function () {}', function () {}],
  ['class {}', class {}], ['new Date()', new Date()], ['/re/', /re/],
];
for (const [yozuv, q] of qiymatlar) console.log(yozuv.padEnd(16), typeof q);
```

```text
$ node typeof.mjs
undefined        undefined
null             object
true             boolean
42               number
42n              bigint
'matn'           string
Symbol('id')     symbol
{}               object
[]               object
function () {}   function
class {}         function
new Date()       object
/re/             object
```

MDN: `typeof` qaytaradigan qiymatlar ro'yxati **to'liq** — `"undefined"`, `"object"`, `"boolean"`, `"number"`, `"bigint"`, `"string"`, `"symbol"`, `"function"`. Standartga mos hech bir engine boshqa qiymat qaytarmaydi.

Uchta nozik joy:

1. **`typeof null === "object"`** — tarixiy xato (pastda).
2. **Massiv — `"object"`.** Massiv alohida tip emas, u obyekt. Massivni tekshirish uchun — `Array.isArray()`.
3. **Funksiya — `"function"`**, garchi u ham obyekt bo'lsa. MDN: ECMA-262 atamalarida `[[Call]]` ichki metodini amalga oshiradigan obyekt; klasslar ham funksiya.

### Nega `typeof null` — `"object"`

MDN tushuntiradi: JavaScript'ning birinchi amalga oshirilishida qiymatlar **tip belgisi + qiymat** ko'rinishida saqlangan. Obyektlarning tip belgisi `0` edi. `null` esa NULL ko'rsatkich (ko'p platformalarda `0x00`) sifatida ifodalangan — demak uning tip belgisi ham `0` bo'lib, `typeof` `"object"` qaytargan. ECMAScript uchun tuzatish (ixtiyoriy yoqiladigan) taklif qilingan, lekin **rad etilgan** — bu `typeof null === "null"` qilgan bo'lardi.

Amaliy xulosa (MDN): `null` ni tekshirish uchun `=== null` ishlating.

### Ishonchli tekshirish usullari

```js
const bosh = null;
console.log(typeof bosh === 'object', bosh === null);
console.log(Array.isArray([]), Array.isArray({}));
console.log(Object.prototype.toString.call([]), Object.prototype.toString.call(null), Object.prototype.toString.call(new Date()));
```

```text
true true
true false
[object Array] [object Null] [object Date]
```

| Nimani tekshirish | Usul |
| --- | --- |
| `null` | `x === null` |
| `undefined` | `x === undefined` yoki `typeof x === 'undefined'` (e'lon qilinmagan nom uchun ham) |
| Massiv | `Array.isArray(x)` |
| Funksiya | `typeof x === 'function'` |
| "Haqiqiy" obyekt (`null` emas) | `x !== null && typeof x === 'object'` |
| Aniq ichki tur | `Object.prototype.toString.call(x)` — 64-bobda batafsil |

## Har bir primitiv tip — qisqacha

Har biriga keyin alohida bob bor; bu yerda — asosiy xususiyatlar (MDN).

### Undefined va Null

MDN: **`undefined`** — **qiymat** yo'qligi, **`null`** — **obyekt** yo'qligi. Til odatda biror narsa qiymatsiz bo'lsa `undefined` beradi:

- qiymatsiz `return;` — `undefined` qaytaradi;
- mavjud bo'lmagan xossaga murojaat (`obj.yoq`) — `undefined`;
- initializer'siz `let x;` — `undefined`;
- `Array.prototype.find()`, `Map.prototype.get()` kabi metodlar topa olmasa — `undefined`.

`null` asosiy tilda ancha kam uchraydi; eng muhim joyi — **prototiplar zanjirining oxiri** (54-bob), shuning uchun `Object.getPrototypeOf()`, `Object.create()` kabi metodlar `null` qabul qiladi yoki qaytaradi.

Yana bir farq: `null` — **kalit so'z**, `undefined` esa global xossa bo'lgan oddiy **identifikator**. MDN: amalda farq kichik, chunki `undefined` ni qayta aniqlamaslik kerak.

### Boolean

Ikki qiymat: `true` va `false`. Shartlarda (`if`, ternar, `while`) ishlatiladi. Boshqa tiplardan qanday mantiqiy qiymatga aylanishi — 7-bobda.

### Number

MDN: Number tipi — **IEEE 754 standartidagi 64 bitli ikkilik formatdagi** (double precision) qiymat. Butun va kasr sonlar uchun **bitta** tip.

```js
console.log(Number.MAX_SAFE_INTEGER, Number.MAX_VALUE, Number.MIN_VALUE);
console.log(Number.MAX_VALUE * 2, Number.MIN_VALUE / 2);
console.log(42 / +0, 42 / -0, +0 === -0, Object.is(+0, -0));
console.log(NaN === NaN, Number.isNaN(NaN), typeof NaN);
console.log(Number.MAX_SAFE_INTEGER + 1 === Number.MAX_SAFE_INTEGER + 2);
```

```text
9007199254740991 1.7976931348623157e+308 5e-324
Infinity 0
Infinity -Infinity true false
false true number
true
```

- **Xavfsiz butun sonlar** chegarasi — ±(2⁵³ − 1) = 9 007 199 254 740 991. Undan keyin butun sonlar aniq saqlanmaydi: `MAX_SAFE_INTEGER + 1` va `+ 2` — bir xil son.
- Diapazondan chiqqan qiymatlar avtomatik aylantiriladi (MDN): `MAX_VALUE` dan kattasi — `Infinity`, `MIN_VALUE` dan kichigi — `0`.
- **Ikki nol**: `+0` va `-0`. `===` ularni teng deydi, lekin nolga bo'lishda farq chiqadi; `Object.is` farqlaydi (8-bob).
- **`NaN`** ("Not a Number") — son tipidagi maxsus qiymat; MDN: JavaScript'dagi **o'ziga teng bo'lmagan yagona qiymat**. Tekshirish — `Number.isNaN()`.

Chuqur — 26-bobda (`0.1 + 0.2` ham shu yerda).

### BigInt

MDN: istalgan kattalikdagi **butun** sonlar uchun primitiv. Sonning oxiriga `n` qo'shiladi yoki `BigInt()` chaqiriladi.

```js
console.log(2n ** 64n);
try { console.log(1n + 1); } catch (e) { console.log(e.name + ':', e.message); }
```

```text
18446744073709551616n
TypeError: Cannot mix BigInt and other types, use explicit conversions
```

MDN: BigInt va Number arifmetikada aralashtirilsa — `TypeError`. BigInt kasr sonni ifodalay olmaydi; ikki tip bir-birining o'rnini bosmaydi. 27-bobda.

### String

MDN: matnli ma'lumot; **UTF-16 kod birliklari** (16 bitli butun sonlar) ketma-ketligi sifatida kodlanadi. Birinchi element `0` indeksda. Satrlar o'zgarmas — metodlar yangi satr yaratadi. 28–29-boblarda.

MDN alohida ogohlantirish beradi — **"stringly-typing"** dan saqlaning: murakkab ma'lumotni (ro'yxat, tuzilma) ajratgichli satrda saqlash vasvasali, lekin ajratgich elementlardan birida uchrasa, "ro'yxat" buziladi. Matn uchun — satr; murakkab ma'lumot uchun satrni **tahlil qiling** (parse) va mos tuzilmani ishlating.

### Symbol

MDN: **noyob** va o'zgarmas primitiv; obyekt xossasining kaliti bo'la oladi. Maqsadi — boshqa kod kalitlari bilan **to'qnashmasligi kafolatlangan** kalitlar yaratish. 22-bobda.

## Nega shunday: dinamik va kuchsiz tiplash

MDN JavaScript'ni ikki xususiyat bilan tavsiflaydi.

**Dinamik tiplash** — o'zgaruvchi biror tipga bog'lanmagan, unga istalgan tipdagi qiymat berish va qayta berish mumkin:

```js
let foo = 42;
console.log(typeof foo);
foo = 'bar';
console.log(typeof foo);
foo = true;
console.log(typeof foo);
```

```text
number
string
boolean
```

Tip **qiymat**da, o'zgaruvchida emas.

**Kuchsiz tiplash** (weak typing) — amalda tiplar mos kelmasa, JavaScript xato bermaydi, tipni **yashirin aylantiradi**:

```js
console.log(42 + '1', 42 - '1', '3' * '4');
```

```text
421 41 12
```

`+` satrni ko'rib sonni satrga aylantirdi (`"421"`), `-` va `*` esa satrlarni songa. MDN: yashirin aylantirishlar qulay, lekin kutilmagan joyda yoki **teskari yo'nalishda** (son → satr o'rniga satr → son) sodir bo'lsa, nozik xatolarga olib keladi. Symbol va BigInt uchun ba'zi yashirin aylantirishlar **atayin taqiqlangan** (yuqoridagi `1n + 1`). Aylantirish qoidalari — 7-bobda.

## Muhandislik nuqtai nazari

### Tip — qiymatda, shuning uchun chegarada tekshiring

Dinamik tiplash ichki kodda qulay, lekin tashqaridan keladigan ma'lumot (formadagi input, `fetch` javobi, `localStorage`) ko'pincha **satr**. MDN ham satrni ko'p API'larning "umumiy maxraji" deydi. Shuning uchun ma'lumot tizimga kirgan joyda tipini aniq aylantiring va tekshiring — ichkarida esa unga ishonsangiz bo'ladi. TypeScript (alohida qo'llanma) shu tekshiruvni kompilyatsiya vaqtiga ko'chiradi, lekin ijro vaqtidagi qiymatlar baribir JavaScript tiplari.

### `null` mi, `undefined` mi?

Ikkalasi ham "yo'q" degani, lekin MDN farqini ko'rsatadi: `undefined` — til o'zi beradigan "qiymat berilmagan", `null` — "obyekt yo'q". Shundan kelib chiqadigan oddiy kelishuv: "qiymat berilmagan" holatini tilga qoldiring (`undefined`), "ataylab bo'sh" degan ma'noni esa o'zingiz `null` bilan bildiring. Qaysi kelishuv tanlansa ham, muhimi — loyiha ichida bir xil bo'lish. Ikkalasini birga tekshirish uchun `x == null` yoki `??` (10-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `typeof x === 'object'` bilan obyektni tekshirish | `null` ham o'tib ketadi | `x !== null && typeof x === 'object'` |
| `typeof arr === 'array'` | Hech qachon `true` emas | `Array.isArray(arr)` |
| `x === NaN` | Doim `false` | `Number.isNaN(x)` |
| Katta ID'larni (masalan, 64 bitli) Number'da saqlash | `MAX_SAFE_INTEGER` dan keyin aniqlik yo'qoladi | Satr yoki BigInt (27-bob) |
| `1n + 1` | `TypeError` | Bitta tipga aylantirish |
| Ro'yxatni `'a,b,c'` satrida saqlash | Ajratgich ma'lumotda uchrasa buziladi | Massiv; tashqariga — JSON (38-bob) |

## Amaliyot

1. Ushbu qiymatlarning `typeof` ini oldindan ayting va tekshiring: `NaN`, `[]`, `null`, `class {}`, `Symbol.iterator`, `new String('a')`, `String('a')`.
2. `function f() {}` funksiyasiga `f.versiya = 2` xossasini qo'shing va o'qing. Bu nimani isbotlaydi?
3. `Number.MAX_SAFE_INTEGER + 1`, `+ 2`, `+ 3` ni chiqaring. Qaysilari teng va nega?
4. `let a = [1, 2]; let b = a; b.push(3);` — `a` nimaga teng? Xuddi shuni `let a = 'ab'; let b = a; b += 'c';` bilan qiling.
5. `isTip(x)` funksiyasini yozing: `'null'`, `'array'`, `'function'` yoki `typeof` natijasini qaytarsin.

## Rasmiy hujjat

- MDN — *JavaScript data types and data structures*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures>
- MDN — `typeof` ("typeof null"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof>
- MDN — *Primitive* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Primitive>
- MDN — `Array.isArray()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray>
- ECMA-262 — *ECMAScript Data Types and Values*: <https://tc39.es/ecma262/2026/#sec-ecmascript-data-types-and-values>
- ECMA-262 — *The typeof Operator*: <https://tc39.es/ecma262/2026/#sec-typeof-operator>
