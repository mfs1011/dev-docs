# 56 — Native prototiplar

[← Oldingi: `F.prototype`](55-f-prototype.md) · [Mundarija](README.md) · [Keyingi: Prototip metodlari →](57-prototip-metodlari.md)

## Tushuncha

O'rnatilgan (native) obyektlar ham 55-bobdagi mexanizm bilan ishlaydi: `Array`, `Date`, `RegExp` — konstruktorlar, ularning metodlari esa `Array.prototype`, `Date.prototype`… da turadi.

MDN (*Implicit constructors of literals*): ba'zi literal sintaksislar nusxa yaratib, `[[Prototype]]` ni o'zi qo'yadi:

| Literal | "Shakarsiz" shakli | `[[Prototype]]` |
| --- | --- | --- |
| `{ a: 1 }` | `new Object()` | `Object.prototype` |
| `[1, 2, 3]` | `new Array(1, 2, 3)` | `Array.prototype` |
| `/abc/` | `new RegExp('abc')` | `RegExp.prototype` |
| `function () {}` | — | `Function.prototype` |

MDN: `map()` kabi "massiv metodlari" — shunchaki `Array.prototype` dagi metodlar. Shuning uchun ular har massivda bor.

Umumiy ko'rinish:

```text
[1, 2]      ──► Array.prototype    ──► Object.prototype ──► null
function    ──► Function.prototype ──► Object.prototype ──► null
new Date()  ──► Date.prototype     ──► Object.prototype ──► null
```

Primitivlar (`5`, `'a'`) obyekt emas. Lekin ularning metodiga murojaat qilinganda vaqtinchalik o'rovchi obyekt yaratiladi va metod `Number.prototype` yoki `String.prototype` dan olinadi (25-bob).

Zanjirning pastidagi metod yuqoridagini **to'sadi**: `Array.prototype.toString` `Object.prototype.toString` ni yashiradi.

### Tarixiy g'aroyiblik (MDN)

Tarixiy sabablarga ko'ra ba'zi o'rnatilgan prototiplar o'z turining nusxasi: `Number.prototype` — 0, `Array.prototype` — bo'sh massiv, `String.prototype` — bo'sh satr, `RegExp.prototype` — `/(?:)/`, `Function.prototype` — hech narsa qilmaydigan funksiya. Foydalanuvchi konstruktorlari va zamonaviy konstruktorlar (`Map`) uchun bu to'g'ri emas.

### Monkey patching — xato amaliyot (MDN)

O'rnatilgan prototipni kengaytirish (`Array.prototype.meningMetodim = ...`) — MDN uni **misfeature** (noto'g'ri xususiyat) deydi. Uning nomi — **monkey patching**:

- **Kelajak bilan moslik** buziladi: til keyinroq shu nomli metodni boshqa imzo bilan qo'shsa, kodingiz buziladi.
- Bu SmooshGate kabi hodisalarga sabab bo'lgan va tilning rivojiga to'sqinlik qiladi — JavaScript "vebni buzmaslikka" harakat qiladi.
- **Yagona asosli sabab** — yangi dvigatellardagi **standart** imkoniyatni eski muhitga qo'shish (polyfill), masalan, `Array.prototype.forEach`.

## Kod: zanjirlar

```js
const p = Object.getPrototypeOf;
const arr = [1, 2], fn = function () {}, sana = new Date(0);
console.log(p({}) === Object.prototype, p(arr) === Array.prototype, p(p(arr)) === Object.prototype);
console.log(p(fn) === Function.prototype, p(sana) === Date.prototype, p(/abc/) === RegExp.prototype);
console.log('5 ning metodi:', (5).toFixed === Number.prototype.toFixed, '| "a":', 'a'.toUpperCase === String.prototype.toUpperCase);
console.log(String(arr), Object.prototype.toString.call(arr));    // Array.prototype.toString to'sadi
console.log(Object.hasOwn(Array.prototype, 'toString'), Object.hasOwn(Array.prototype, 'map'));
```

```text
$ node zanjir.mjs
true true true
true true true
5 ning metodi: true | "a": true
1,2 [object Array]
true true
```

- Har literal o'z turining prototipiga ulangan, massiv prototipi esa `Object.prototype` ga.
- `(5).toFixed` va `'a'.toUpperCase` — `Number.prototype` va `String.prototype` dagi funksiyalarning o'zi.
- `String(arr)` — `Array.prototype.toString` (`1,2`). `Object.prototype.toString` ni `call` (49-bob) bilan chaqirsak — `[object Array]`.

## Kod: prototip — nusxa

MDN misollari:

```js
console.log(Number.prototype + 1, Array.prototype.map(x => x + 1), String.prototype + 'a', RegExp.prototype.source);   // MDN misollari
console.log(typeof Function.prototype, Function.prototype());
try { Map.prototype.get(1); } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node tarixiy.mjs
1 [] a (?:)
function undefined
TypeError: Method Map.prototype.get called on incompatible receiver #<Map>
```

`Number.prototype + 1` — 1, `Array.prototype` ustida `map` — bo'sh massiv. `Function.prototype()` — `undefined` qaytaradigan funksiya. `Map.prototype` esa `Map` nusxasi emas — `get` xato berdi.

## Kod: monkey patching va polyfill

```js
const arr = [10, 20];
Array.prototype.yigindi = function () { return this.reduce((s, n) => s + n, 0); };   // monkey patching
console.log(arr.yigindi());
const kalitlar = []; for (const k in arr) kalitlar.push(k);
console.log('for...in:', kalitlar);                                  // sanaladigan — massivlarda chiqib qoladi
delete Array.prototype.yigindi;

// Yagona asosli sabab (MDN): standart imkoniyatni yo'q muhitga qo'shish — faqat yo'q bo'lsa
console.log('Array.prototype.at bor:', typeof Array.prototype.at === 'function');
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, 'at', { value: function (i) { return this[i < 0 ? this.length + i : i]; }, writable: true, configurable: true });
}
console.log(arr.at(-1));
```

```text
$ node patch.mjs
30
for...in: [ '0', '1', 'yigindi' ]
Array.prototype.at bor: true
20
```

- Oddiy o'zlashtirish bilan qo'shilgan `yigindi` **sanaladigan** bo'ldi va har massivning `for...in` siklida chiqdi — boshqa kodni buzishi mumkin bo'lgan yon ta'sir. Sinovdan keyin o'chirildi.
- Polyfill namunasi: faqat **standart** metod va faqat u **yo'q** bo'lsa, sanalmaydigan qilib (`defineProperty`, 52-bob). Node 26'da `at` bor — polyfill qo'shilmadi.

## Nega shunday

O'rnatilgan turlar ham oddiy prototip zanjiri bilan qurilgan — til uchun alohida mexanizm yo'q. Bu kuchli: istalgan obyekt umumiy metodlarni zanjir orqali oladi. Lekin o'rnatilgan prototiplar **hammaga umumiy**: ularni o'zgartirish butun dasturga, kutubxonalarga va kelajakdagi standartga ta'sir qiladi.

## Muhandislik nuqtai nazari

### O'rnatilgan prototiplarni o'zgartirmang

Yordamchi kerak bo'lsa — oddiy funksiya (`yigindi(arr)`) yoki o'z klassingiz. Bu nomlar to'qnashuvi va kelajakdagi standart bilan ziddiyatdan saqlaydi.

### Polyfill — tayyor, tekshirilgan kutubxonadan

Polyfill standart xatti-harakatni aniq takrorlashi kerak: chegaraviy holatlar, `length`, sanalmaslik. O'zingiz yozgandan ko'ra standartga mos tayyor polyfill to'plamlari ishonchliroq.

### Metodlarni "qarzga olish" — `call`

Massivga o'xshash obyekt uchun massiv metodi kerak bo'lsa, prototipni o'zgartirish o'rniga `Array.prototype.join.call(obj)` yoki `Array.from(obj)` (49-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `Array.prototype.x = ...` | Kelajakdagi standart bilan to'qnashuv (MDN), `for...in` da chiqadi | Oddiy funksiya |
| Polyfill'ni har doim qo'shish | Standart metod o'z versiyangiz bilan almashadi | Faqat yo'q bo'lsa |
| Polyfill'ni oddiy o'zlashtirish bilan | Sanaladigan xossa | `Object.defineProperty`, `enumerable: false` |
| `Object.prototype` ga xossa qo'shish | **Hamma** obyektlarga ta'sir qiladi | Hech qachon |
| Metod yo'q obyektda massiv metodini kutish | `TypeError` | `Array.prototype.metod.call` yoki `Array.from` |

## Amaliyot

1. `Object.getOwnPropertyNames(Array.prototype)` dan nechta metod borligini sanang va 31-bobdagi ro'yxat bilan solishtiring.
2. Satr, son, funksiya, sana va `Map` uchun prototip zanjirini `null` gacha chiqaradigan funksiya yozing.
3. `Object.prototype` ga vaqtincha sanaladigan xossa qo'shib, oddiy obyektda `for...in` natijasini ko'ring. Keyin uni o'chiring.
4. `String.prototype.replaceAll` uchun standartga yaqin polyfill yozing (faqat yo'q bo'lsa qo'shilsin) va uni MDN tavsifi bilan solishtiring.
5. `Number.prototype`, `Array.prototype`, `Map.prototype` ning turi va qiymatini tekshiring — MDN'dagi tarixiy farqni toping.

## Rasmiy hujjat

- MDN — *Inheritance and the prototype chain* (Implicit constructors of literals): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain#implicit_constructors_of_literals>
- MDN — `Object.prototype.toString()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/toString>
- MDN Glossary — *Polyfill*: <https://developer.mozilla.org/en-US/docs/Glossary/Polyfill>
