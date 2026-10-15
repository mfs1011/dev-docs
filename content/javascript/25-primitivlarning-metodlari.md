# 25 — Primitivlarning metodlari

[← Oldingi: Reference Type](24-reference-type.md) · [Mundarija](README.md) · [Keyingi: Number →](26-number.md)

## Tushuncha

6-bobda ma'lumot turlarini ikki guruhga ajratdik: **primitivlar** va **obyektlar**. MDN (glossary) ta'rifi: primitiv — obyekt bo'lmagan va **metodlari ham, xossalari ham yo'q** ma'lumot. Yetti primitiv tur bor: `string`, `number`, `bigint`, `boolean`, `undefined`, `symbol`, `null`.

Lekin har kuni `'salom'.toUpperCase()` yoki `(3.14).toFixed(1)` yozamiz. Metodi yo'q qiymatda qanday qilib metod chaqiriladi?

MDN javobi: primitivlarda metod yo'q, lekin ular **xuddi bordek** ishlaydi. Primitivning xossasiga murojaat qilinganda JavaScript qiymatni **avtomatik o'raydi** (auto-boxing). Ya'ni uni mos **o'rov obyektiga** (wrapper object) joylab, xossani o'sha obyektdan oladi.

| Primitiv | `typeof` | O'rov obyekt |
| --- | --- | --- |
| `'abc'` | `'string'` | `String` |
| `42` | `'number'` | `Number` |
| `42n` | `'bigint'` | `BigInt` |
| `true` | `'boolean'` | `Boolean` |
| `Symbol()` | `'symbol'` | `Symbol` |
| `null` | `'object'` | — |
| `undefined` | `'undefined'` | — |

MDN (*Data structures*): `null` va `undefined` dan boshqa hamma primitiv turlarning o'rov obyekti bor.

## Kod: metodlar qayerdan keladi

```js
const s = 'salom';
console.log(s.toUpperCase(), s.length, s.at(-1), (3.14159).toFixed(2), true.toString());
console.log(typeof s, s instanceof String, Object.getPrototypeOf(s) === String.prototype);
console.log(s.toUpperCase === String.prototype.toUpperCase);
```

```text
$ node metod.mjs
SALOM 5 m 3.14 true
string false true
true
```

- `s` — primitiv satr (`typeof` — `'string'`), `String` nusxasi emas (`instanceof` — `false`).
- Lekin `s.toUpperCase` — aynan `String.prototype.toUpperCase`. Metodlar o'rov turining **prototipida** turadi (54-bob), primitiv ularni o'rov orqali "ko'radi".
- `Object.getPrototypeOf(s)` ham primitivni avval obyektga aylantiradi — shuning uchun `String.prototype` qaytadi.

## Spetsifikatsiya bo'yicha: `ToObject`

24-bobda ko'rgan **`GetValue`** — xossani o'qish algoritmi. ECMA-262 6.2.5.5 da u xossa havolasi uchun shunday boshlanadi: `baseObj = ToObject(V.[[Base]])`. **`ToObject`** (7.1.18) primitivni mos o'rov obyektga aylantiradi: satr uchun yangi `String` obyekti, son uchun `Number` obyekti va hokazo. `undefined` yoki `null` bo'lsa — **`TypeError`**.

Xossa shu obyektdan o'qiladi, lekin `this` sifatida `GetThisValue(V)` — ya'ni **primitivning o'zi** uzatiladi. MDN (`this`): strict mode'da metod ichidagi `this` primitiv bo'ladi:

```js
String.prototype.kimman = function () { return typeof this; };
console.log('a'.kimman());
delete String.prototype.kimman;
```

```text
string
```

(O'rnatilgan prototipni o'zgartirish — faqat namoyish uchun; nega yomonligi — 56-bobda.)

MDN muhim eslatma beradi: avtomatik o'rash JavaScript kodida **kuzatib bo'lmaydi**. Dvigatel haqiqatan har safar obyekt yaratadimi — bu uning ichki ishi. Lekin u turli xatti-harakatlarni tushuntirish uchun yaxshi **fikriy model**.

## Kod: primitivlar o'zgarmas

MDN: barcha primitivlar **o'zgarmas** (immutable). Primitivning o'zini o'zgaruvchidan farqlash kerak: o'zgaruvchiga yangi qiymat berish mumkin, lekin mavjud primitiv qiymatni obyekt kabi o'zgartirib bo'lmaydi.

```js
let s = 'salom';
s.toUpperCase();
console.log(s);
s = s.toUpperCase();
console.log(s);
try { s[0] = 'X'; } catch (e) { console.log(e.name + ': ' + e.message); }
try { s.qoshimcha = 1; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(s, s.qoshimcha);
```

```text
$ node ozgarmas.mjs
salom
SALOM
TypeError: Cannot assign to read only property '0' of string 'SALOM'
TypeError: Cannot create property 'qoshimcha' on string 'SALOM'
SALOM undefined
```

- `s.toUpperCase()` — `s` ni o'zgartirmaydi, **yangi** satr qaytaradi. Natijani saqlash kerak.
- `s.qoshimcha = 1` — strict mode'da `TypeError`. ECMA-262 *PutValue* (6.2.5.6): yozish muvaffaqiyatsiz bo'lsa va havola strict kodda yaratilgan bo'lsa — `TypeError`.

Sloppy rejimda xuddi shu kod **jim** o'tadi:

```js
const s = 'salom';
s.qoshimcha = 1;
s[0] = 'X';
console.log(s, s.qoshimcha);
```

```text
$ node sloppy.cjs
salom undefined
```

MDN tushuntirishi: `s.qoshimcha = 1` xossani `s` ning o'ziga emas, **vaqtinchalik o'rov obyektga** yozadi. U darhol yo'qoladi, keyingi `s.qoshimcha` esa yangi o'rov yaratadi — unda xossa yo'q.

## Kod: o'rov obyektni qo'lda yaratmang

```js
const p = 0;
const o = new Number(0);
console.log(typeof p, typeof o);
console.log(p ? 'rost' : 'yolg\'on', o ? 'rost' : 'yolg\'on');
console.log(new Number(5) === new Number(5), new Number(5) == 5, Number('5') === 5);
console.log(typeof Object('a'), typeof Object(1n), o.valueOf());
```

```text
$ node orov.mjs
number object
yolg'on rost
false true true
object object 0
```

- `new Number(0)` — **obyekt**, va har qanday obyekt **truthy** (10-bob). Shuning uchun `o ? ... ` — `'rost'`, garchi ichida `0` bo'lsa ham.
- Ikki `new Number(5)` — ikki xil obyekt, `===` — `false` (MDN `Number()` misoli: `new Number("123") === 123` — `false`).
- `Number('5')` — `new` siz — **tip o'zgartirish** (7-bob), primitiv qaytaradi. `String()`, `Boolean()` ham shunday.
- `Symbol` va `BigInt` ni `new` bilan chaqirib bo'lmaydi (20, 22-boblar). Ularning o'rovi faqat `Object(qiymat)` bilan olinadi — amalda deyarli kerak bo'lmaydi.

## Kod: `null` va `undefined` — metodsiz

```js
try { null.toString(); } catch (e) { console.log(e.name + ': ' + e.message); }
try { undefined.length; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(null?.toString());
```

```text
TypeError: Cannot read properties of null (reading 'toString')
TypeError: Cannot read properties of undefined (reading 'length')
undefined
```

O'rov turi yo'q — `ToObject` `TypeError` beradi. MDN (*Data structures*): aynan shu sabab **optional chaining** operatorini (21-bob) kiritishga olib kelgan.

## Kod: son literalidagi nuqta

```js
console.log(5..toString(2), (5).toString(2), 5 .toString(2));
```

```text
101 101 101
```

`5.toString(2)` — `SyntaxError: Invalid or unexpected token`. MDN (*Property accessors*): butun son literalidan keyingi nuqta **o'nli kasr nuqtasi** deb o'qiladi. Shuning uchun qavs, ikki nuqta yoki nuqtadan oldin bo'sh joy kerak. `3.14.toFixed(1)` esa ishlaydi — kasr nuqtasi allaqachon bor.

## Nega shunday

Primitivlar arzon va o'zgarmas: MDN bo'yicha ular ko'pincha til amalga oshirilishining eng past darajasida bevosita saqlanadi. Har satr yoki sonni to'liq obyekt qilish xotira va tezlik jihatidan qimmat bo'lardi. Boshqa tomondan, `trim`, `toFixed` kabi metodlar juda qulay. Avtomatik o'rash ikkalasini birlashtiradi: qiymat primitiv bo'lib qoladi, metodlar esa bitta umumiy prototipda — hamma satrlar uchun **bitta** `String.prototype`.

## Muhandislik nuqtai nazari

### Metod natijasini saqlang

Satr va son metodlari **yangi qiymat qaytaradi**, asl qiymatni o'zgartirmaydi. `ism.trim();` qatori hech narsa qilmaydi — `ism = ism.trim();` kerak. Bu qoida massivlarning `push`/`sort` kabi o'zgartiruvchi metodlaridan farq qiladi (30–31-boblar).

### `new String`/`new Number`/`new Boolean` — ishlatmang

O'rov obyektlar truthy, `===` bilan solishtirilmaydi, `typeof` — `'object'`. Kod ko'rib chiqishda ular deyarli har doim xato. Tip o'zgartirish uchun `new` siz chaqiruv.

### Primitivga xossa qo'shib bo'lmaydi

Satr yoki songa metama'lumot biriktirish kerak bo'lsa — obyekt ichiga joylang (`{ qiymat: 'abc', manba: 'api' }`) yoki `Map` ishlating.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `str.toUpperCase();` natijani saqlamasdan | `str` o'zgarmaydi | `str = str.toUpperCase()` |
| `if (new Boolean(false))` | Shart **bajariladi** (obyekt truthy) | `if (false)` yoki `Boolean(x)` |
| `str[0] = 'X'` | strict'da `TypeError`, sloppy'da jim | `'X' + str.slice(1)` |
| `str.belgi = 1` | strict'da `TypeError`, sloppy'da yo'qoladi | Obyekt yoki `Map` |
| `null.toString()` | `TypeError` | `x?.toString()` yoki `String(x)` |
| `5.toFixed(1)` | `SyntaxError` | `(5).toFixed(1)` |

## Amaliyot

1. `typeof 'a'`, `typeof new String('a')`, `typeof String('a')`, `typeof Object('a')` — oldindan yozing, keyin tekshiring.
2. `let s = 'abc'; s.length = 10;` dan keyin `s.length` nimaga teng? Strict va sloppy rejimda sinang.
3. `[new Boolean(false)].filter(Boolean).length` nimaga teng va nega?
4. `(255).toString(16)`, `255..toString(2)`, `255 .toString(8)` — natijalarni tushuntiring.
5. `String(null)` ishlaydi, `null.toString()` esa yo'q. 23-bobdagi aylantirish qoidalari bilan farqni tushuntiring.

## Rasmiy hujjat

- MDN — *Primitive* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Primitive>
- MDN — *JavaScript data types and data structures* ("Primitive values"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#primitive_values>
- MDN — `Number()` constructor: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/Number>
- MDN — *Property accessors*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors>
- ECMA-262 — *ECMAScript Language Types*: <https://tc39.es/ecma262/2026/#sec-ecmascript-language-types>
- ECMA-262 — *GetValue*: <https://tc39.es/ecma262/2026/#sec-getvalue>
- ECMA-262 — *ToObject*: <https://tc39.es/ecma262/2026/#sec-toobject>
