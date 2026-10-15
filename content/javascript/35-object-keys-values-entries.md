# 35 — `Object.keys`, `values`, `entries`

[← Oldingi: `WeakMap` va `WeakSet`](34-weakmap-va-weakset.md) · [Mundarija](README.md) · [Keyingi: Destructuring →](36-destructuring.md)

## Tushuncha

Oddiy obyekt iterable emas (32-bob): `for...of obj` — `TypeError`. Obyekt ma'lumotlari bilan massiv metodlari (`map`, `filter`, `reduce`) orqali ishlash uchun uni avval **massivga** aylantirish kerak. Buning uchun uchta statik metod bor:

| Metod | Qaytaradi |
| --- | --- |
| `Object.keys(obj)` | Kalitlar massivi |
| `Object.values(obj)` | Qiymatlar massivi |
| `Object.entries(obj)` | `[kalit, qiymat]` juftliklari massivi |

Va teskarisi — **`Object.fromEntries(juftliklar)`**: juftliklardan obyekt yasaydi.

MDN: uchala metod obyektning **o'z** (own), **sanaladigan** (enumerable), **satr kalitli** xossalarini qaytaradi. Bu `for...in` bilan bir xil, faqat `for...in` prototip zanjiridagi xossalarni ham aylanadi. Tartib ham `for...in` dagi bilan bir xil.

## Kod: obyektni o'zgartirish naqshi

```js
const narxlar = { non: 4000, sut: 12000, tuxum: 1500 };
console.log(Object.keys(narxlar), Object.values(narxlar), Object.entries(narxlar));
const qimmat = Object.fromEntries(Object.entries(narxlar).map(([k, v]) => [k, Math.round(v * 1.1)]));
console.log(qimmat);
const arzon = Object.fromEntries(Object.entries(narxlar).filter(([, v]) => v < 5000));
console.log(arzon, Object.values(narxlar).reduce((a, b) => a + b, 0));
for (const [nom, narx] of Object.entries(narxlar)) console.log(`${nom}: ${narx}`);
console.log(Array.isArray(Object.keys(narxlar)), Object.prototype.toString.call(new Map().keys()));
```

```text
$ node asos.mjs
[ 'non', 'sut', 'tuxum' ] [ 4000, 12000, 1500 ] [ [ 'non', 4000 ], [ 'sut', 12000 ], [ 'tuxum', 1500 ] ]
{ non: 4400, sut: 13200, tuxum: 1650 }
{ non: 4000, tuxum: 1500 } 17500
non: 4000
sut: 12000
tuxum: 1500
true [object Map Iterator]
```

Asosiy naqsh — **entries → massiv metodi → fromEntries**:

1. `Object.entries(obj)` — obyektdan juftliklar massivi.
2. `map` / `filter` — massiv metodlari bilan ishlov.
3. `Object.fromEntries(...)` — qaytarib obyektga.

`for (const [k, v] of Object.entries(obj))` — obyektni kalit va qiymati bilan aylanib chiqishning eng aniq yo'li (destructuring — 36-bob).

Diqqat: `Object.keys` **massiv** qaytaradi, `Map` ning `keys()` metodi esa **iterator** (`[object Map Iterator]`). Nomlari bir xil, natijalari har xil: massivda `map`, `filter` bor, iteratorda — iterator helper'lari (82-bob).

## Kod: qaysi xossalar kiradi

```js
const ota = { meros: 1 };
const obj = Object.create(ota);
obj.oz = 2;
obj[Symbol('s')] = 3;
Object.defineProperty(obj, 'yashirin', { value: 4, enumerable: false });
const forIn = []; for (const k in obj) forIn.push(k);
console.log('for...in:          ', forIn);
console.log('Object.keys:       ', Object.keys(obj));
console.log('getOwnPropertyNames:', Object.getOwnPropertyNames(obj));
console.log('Reflect.ownKeys:   ', Reflect.ownKeys(obj));
console.log('Object.hasOwn:     ', Object.hasOwn(obj, 'meros'), Object.hasOwn(obj, 'oz'));
```

```text
$ node qamrov.mjs
for...in:           [ 'oz', 'meros' ]
Object.keys:        [ 'oz' ]
getOwnPropertyNames: [ 'oz', 'yashirin' ]
Reflect.ownKeys:    [ 'oz', 'yashirin', Symbol(s) ]
Object.hasOwn:      false true
```

| Usul | O'z xossalari | Meros | Sanalmaydigan | Symbol |
| --- | --- | --- | --- | --- |
| `for...in` | Ha | **Ha** | Yo'q | Yo'q |
| `Object.keys/values/entries` | Ha | Yo'q | Yo'q | Yo'q |
| `Object.getOwnPropertyNames` | Ha | Yo'q | **Ha** | Yo'q |
| `Object.getOwnPropertySymbols` | Ha | Yo'q | Ha | **Faqat symbol** |
| `Reflect.ownKeys` | Ha | Yo'q | Ha | Ha |

MDN (*Working with objects*) xossalarni sanashning uchta asosiy usulini aytadi: `for...in` (prototip zanjiri bilan), `Object.keys` (faqat o'z sanaladiganlari) va `Object.getOwnPropertyNames` (sanalmaydiganlari ham). `for...in` da faqat o'z xossalarini olish uchun MDN `Object.hasOwn()` tekshiruvini ko'rsatadi. Sanaluvchanlik va egalik to'liq — 58-bobda, xossa bayroqlari — 52-bobda.

## Kod: tartib va chegaraviy holatlar

```js
console.log(Object.keys({ b: 1, 2: 1, a: 1, 1: 1, '-1': 1, '01': 1 }));
console.log(Object.keys('abc'), Object.keys(42), Object.entries([7, 8]));
try { Object.keys(null); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(Object.fromEntries(new URLSearchParams('ism=Ali&yosh=25')));
console.log(Object.fromEntries([[Symbol.for('s'), 1]]));
```

```text
$ node tartib.mjs
[ '1', '2', 'b', 'a', '-1', '01' ]
[ '0', '1', '2' ] [] [ [ '0', 7 ], [ '1', 8 ] ]
TypeError: Cannot convert undefined or null to object
{ ism: 'Ali', yosh: '25' }
{ Symbol(s): 1 }
```

- **Tartib** (16-bob): avval butun son ko'rinishidagi kalitlar o'sish tartibida, keyin satr kalitlar qo'shilish tartibida. `'-1'` va `'01'` — massiv indeksi emas, oddiy satr kalitlar.
- **Primitivlar**: satr obyektga aylanadi va indekslari kalit bo'ladi; son uchun bo'sh massiv. `null`/`undefined` — `TypeError` (25-bob, `ToObject`).
- Massivda `Object.entries` — `[indeks, element]` juftliklari (kalit **satr**).
- `Object.fromEntries` istalgan **iterable** juftliklarni qabul qiladi (MDN): `Map`, `URLSearchParams` va boshqalar. URL parametrlari doim satr — `'25'`.
- MDN: `Object.entries` faqat satr kalitlarni qaytaradi, `Object.fromEntries` esa **symbol kalitli** xossa ham yarata oladi.

## Nega shunday

MDN (`Map` bilan taqqoslash, 33-bob): `Object` iteratsiya protokolini amalga oshirmaydi, shuning uchun obyektlar standart holatda `for...of` bilan aylanib chiqilmaydi. Obyektdan iterable olish uchun MDN aynan `Object.keys` yoki `Object.entries` ni ko'rsatadi. Bu metodlar `Object` ning **statik** metodlari (`obj.keys()` emas, `Object.keys(obj)`) va oddiy massiv qaytaradi — keyingi ishlov uchun massivning hamma metodlari tayyor.

## Muhandislik nuqtai nazari

### Obyekt lug'at sifatida ishlatilsa — `Map` ni o'ylang

Agar obyektni doim `Object.entries` bilan aylantirib, kalit qo'shib-o'chirayotgan bo'lsangiz, u aslida lug'at. MDN tavsiyasiga ko'ra (33-bob) kalitlar ishga tushish vaqtida ma'lum bo'lsa — `Map` qulayroq: `size`, iteratsiya, tartib to'g'ridan-to'g'ri.

### `for...in` o'rniga `Object.entries`

`for...in` meros xossalarni ham beradi — `Object.hasOwn` tekshiruvini unutish xatoga olib keladi. `for (const [k, v] of Object.entries(obj))` faqat o'z xossalarini beradi va qiymatni darhol oladi.

### Tashqi ma'lumotda tur

`Object.fromEntries(new URLSearchParams(...))` yoki forma ma'lumotlari — barcha qiymatlar satr. Sonlarni `Number()` bilan aylantiring va tekshiring (26-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `obj.map(...)` | `TypeError: obj.map is not a function` | `Object.entries(obj).map(...)` |
| `for (const x of obj)` | `TypeError: obj is not iterable` | `Object.entries(obj)` |
| `for...in` + `hasOwn` siz | Meros xossalar ham chiqadi | `Object.keys`/`entries` |
| `Object.keys(obj).length` ni `Map` dagi kabi tez deb o'ylash | Har safar yangi massiv | Ko'p o'zgaradigan to'plam — `Map` |
| `map.keys().map(...)` natijasini massiv deb ishlatish | Natija massiv emas, iterator | `[...map.keys()].map(...)` |
| Symbol xossalarni `Object.keys` da kutish | Chiqmaydi | `Reflect.ownKeys` |
| `Object.keys(null)` | `TypeError` | Avval tekshirish yoki `?? {}` |

## Amaliyot

1. `{ a: 1, b: 2, c: 3 }` dagi har qiymatni kvadratga oshiring (`entries` → `map` → `fromEntries`).
2. `teskari(obj)` funksiyasini yozing: kalit va qiymat o'rnini almashtiradi (`{ a: 'x' }` → `{ x: 'a' }`).
3. Ikki obyektni solishtiradigan `tengmi(a, b)` yozing (faqat bir darajali, `Object.keys` bilan).
4. Mahsulotlar massividan nom → narx obyektini `Object.fromEntries` bilan yasang.
5. `Object.groupBy` natijasini (31-bob) `Object.entries` bilan aylanib, har guruh uchun elementlar sonini chiqaring.

## Rasmiy hujjat

- MDN — `Object.keys()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys>
- MDN — `Object.values()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/values>
- MDN — `Object.entries()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries>
- MDN — `Object.fromEntries()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries>
- MDN — *Working with objects* ("Enumerating properties"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#enumerating_properties>
- MDN — *Enumerability and ownership of properties*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties>
- ECMA-262 — *Object.keys*: <https://tc39.es/ecma262/2026/#sec-object.keys>
