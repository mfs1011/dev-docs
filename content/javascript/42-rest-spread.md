# 42 — Rest va spread

[← Oldingi: Rekursiya va stek](41-rekursiya.md) · [Mundarija](README.md) · [Keyingi: Leksik muhit va closure →](43-closure.md)

## Tushuncha

Bir xil `...` (uch nuqta) ikki **qarama-qarshi** ish qiladi:

| | Qayerda | Nima qiladi |
| --- | --- | --- |
| **Rest parametri** | Funksiya parametrlari ro'yxatining **oxirida** | Ortiqcha argumentlarni **bitta massivga yig'adi** |
| **Spread sintaksisi** | Chaqiruv argumentlari, massiv literali, obyekt literali | Iterable'ni yoki obyekt xossalarini **yoyib chiqaradi** |

### Rest parametri (MDN)

- Funksiya ta'rifidagi **oxirgi** parametr oldiga `...` qo'yilsa, qolgan barcha argumentlar haqiqiy `Array` ga joylanadi.
- U faqat bitta va faqat oxirida bo'ladi, standart qiymat (`= []`) va oxirgi vergul olmaydi — aks holda sintaksis xatosi.
- Rest parametri funksiyaning `length` xossasiga **kirmaydi**.
- Uni destrukturizatsiya qilish mumkin: `...[, b, c]`.

### `arguments` obyekti (MDN)

MDN: zamonaviy kodda **rest parametri afzal**. `arguments` — strelkadan boshqa barcha funksiyalarda bor lokal o'zgaruvchi. MDN sanagan to'rt farq:

| | `arguments` | Rest parametri |
| --- | --- | --- |
| Turi | Massivga **o'xshash** obyekt (`map`, `sort` yo'q) | Haqiqiy `Array` |
| `callee` | Bor (eskirgan) | Yo'q |
| Parametr bilan sinxronlik | Strict bo'lmagan, oddiy parametrli funksiyada indekslar parametrlar bilan **bog'langan** | Hech qachon |
| Tarkibi | **Barcha** argumentlar | Faqat nomli parametrlardan keyingilari |

Strelka funksiyasida o'z `arguments`'i yo'q (MDN *Arrow functions*).

### Spread sintaksisi (MDN)

Uch joyda ishlaydi, ma'nosi biroz farq qiladi:

| Joy | Nima yoyiladi |
| --- | --- |
| Chaqiruv argumentlari — `f(a, ...it, b)` | Faqat **iterable** (32-bob) |
| Massiv literali — `[1, ...it, 4]` | Faqat **iterable** |
| Obyekt literali — `{ ...obj, k: 1 }` | Qiymatning **o'z sanaladigan xossalari** |

- Oddiy obyekt iterable emas: `[...obj]` — `TypeError`.
- Obyektga massiv yoyilsa, indekslar xossa bo'ladi. Primitivlardan faqat satrning xossalari bor, qolganlari hech narsa qo'shmaydi.
- Nusxa **sayoz** (shallow): bir daraja chuqur. MDN: JavaScript'da chuqur nusxa oladigan o'rnatilgan amal yo'q, Web API'dagi `structuredClone()` bundan mustasno (17-bob).
- Obyekt spread sanalmaydigan xossalarni va prototipni ko'chirmaydi.
- Bir xil nomli xossalar: **oxirgi qiymat** oladi, lekin xossa **birinchi** paydo bo'lgan joyida qoladi.
- `Object.assign()` maqsad obyektni o'zgartiradi va uning **setter**'larini chaqiradi. Spread yangi obyekt yaratadi, setter chaqirmaydi.
- Chaqiruvda juda katta massivni yoyish dvigatelning argumentlar soni chegarasiga urilishi mumkin (MDN, `apply()`).

## Kod: rest parametri

```js
function myFun(a, b, ...qolgan) {                 // MDN misoli
  console.log('a:', a, '| b:', b, '| qolgan:', qolgan, Array.isArray(qolgan));
}
myFun('bir', 'ikki', 'uch', 'tort', 'besh');
myFun('bir');
console.log('myFun.length =', myFun.length);      // rest parametri sanalmaydi
function yigindi(...sonlar) { return sonlar.reduce((s, n) => s + n, 0); }
console.log(yigindi(), yigindi(1, 2, 3), yigindi(...[10, 20], 5));
function birinchisizBC(...[, b, c]) { return b + c; }   // rest + destrukturizatsiya
console.log(birinchisizBC(1, 2, 3));
```

```text
$ node rest.mjs
a: bir | b: ikki | qolgan: [ 'uch', 'tort', 'besh' ] true
a: bir | b: undefined | qolgan: [] true
myFun.length = 2
0 6 35
5
```

- `qolgan` — doim haqiqiy massiv, argument bo'lmasa — bo'sh massiv.
- `length` 2 — rest hisobga olinmadi.
- `yigindi(...[10, 20], 5)` — chaqiruvda spread, ta'rifda rest: massiv yoyildi va yana yig'ildi.

## Kod: `arguments`

CommonJS fayl — strict rejim yo'q (4-bob):

```js
// CommonJS (strict emas) — arguments obyekti
function f(a, ...r) {
  console.log(typeof arguments, Array.isArray(arguments), arguments.length, [...arguments], r);
}
f(1, 2, 3);
function sinxron(a) { a = 99; return arguments[0]; }                 // oddiy parametrlar, strict emas
function sinxronEmas(a) { 'use strict'; a = 99; return arguments[0]; }
console.log('sloppy:', sinxron(1), '| strict:', sinxronEmas(1));
function tashqi() {
  const strelka = () => arguments[0];      // strelkada o'z arguments'i yo'q — tashqi funksiyaniki olinadi
  return strelka('strelka argumenti');
}
console.log('strelka ichida arguments[0]:', tashqi('tashqi argumenti'));
```

```text
$ node arguments.cjs
object false 3 [ 1, 2, 3 ] [ 2, 3 ]
sloppy: 99 | strict: 1
strelka ichida arguments[0]: tashqi argumenti
```

- `arguments` — `object`, massiv emas. Unda **barcha** 3 argument, rest'da esa faqat `a` dan keyingilari.
- Strict bo'lmagan funksiyada `a = 99` `arguments[0]` ni ham o'zgartirdi. Strict rejimda bog'lanish yo'q.
- Strelka ichidagi `arguments` — tashqi funksiyaniki.

## Kod: spread

```js
const sonlar = [5, 1, 9];
console.log(Math.max(...sonlar), Math.max(...sonlar, 12, ...[3]));
console.log([...'salom'], [...new Set([1, 1, 2])], [0, ...sonlar, 10]);
try { [...{ a: 1 }]; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log({ ...[1, 2, 3] }, { ...true, ...'ab', ...10 });

const a = [[1], [2]];
const b = [...a];                                  // sayoz nusxa
b[0].push('!'); b.push([3]);
console.log('a:', JSON.stringify(a), '| b:', JSON.stringify(b));

const obj1 = { foo: 'bar', x: 42 }, obj2 = { foo: 'baz', y: 13 };
console.log({ x: 41, ...obj1, ...obj2, y: 9 });    // MDN: oxirgi qiymat, birinchi o'rni
const yoz = false;
console.log({ olma: 10, ...(yoz ? { tarvuz: 30 } : {}) });

const maqsad = { set x(v) { console.log('  setter chaqirildi:', v); } };
Object.assign(maqsad, { x: 1 });
const nusxa = { ...maqsad, ...{ x: 2 } };
console.log('spread natijasi:', Object.getOwnPropertyDescriptor(nusxa, 'x'));
```

```text
$ node spread.mjs
9 12
[ 's', 'a', 'l', 'o', 'm' ] [ 1, 2 ] [ 0, 5, 1, 9, 10 ]
TypeError: {(intermediate value)} is not iterable
{ '0': 1, '1': 2, '2': 3 } { '0': 'a', '1': 'b' }
a: [[1,"!"],[2]] | b: [[1,"!"],[2],[3]]
{ x: 42, foo: 'baz', y: 9 }
{ olma: 10 }
  setter chaqirildi: 1
spread natijasi: { value: 2, writable: true, enumerable: true, configurable: true }
```

- `Math.max(...sonlar)` — massiv argumentlarga yoyildi.
- Satr va `Set` iterable — yoyildi. Oddiy obyekt — `TypeError: ... is not iterable`.
- `{ ...true, ...'ab', ...10 }` — faqat satr xossa qo'shdi.
- Sayoz nusxa: `b` ga yangi element qo'shish `a` ga ta'sir qilmadi, lekin ichki massiv (`b[0]`) **umumiy** — `'!'` ikkalasida.
- `{ x: 41, ...obj1, ...obj2, y: 9 }` → `x: 42`, `foo: 'baz'` — MDN misolidagi natija.
- Shartli xossa: `...(shart ? {...} : {})`.
- `Object.assign` setter'ni chaqirdi. Spread esa setter'ni chaqirmadi va oddiy `x` qiymat xossasini yaratdi.

## Nega shunday

Rest va spread — bir amalning ikki yo'nalishi: yig'ish va yoyish. Ular `arguments` va `apply()` ning noqulay joylarini almashtirdi: rest — haqiqiy massiv beradi va qaysi argumentlar "qolgani"ni aniq ko'rsatadi; spread — `apply` siz massivni argumentga, `concat`/`Object.assign` siz massiv va obyektlarni birlashtiradi. Obyekt spread'ning ishlash qoidasi (o'z sanaladigan xossalar, setter'siz) — "yangi obyekt yaratish", mavjudini o'zgartirish emas.

## Muhandislik nuqtai nazari

### O'zgarmas yangilash

`{ ...holat, ism: 'Vali' }` va `[...ro'yxat, yangi]` — eski obyektni o'zgartirmasdan yangisini yaratadi. Holat boshqaruvi (React, Vue) shunga tayanadi. Lekin bu sayoz: ichki obyektlar umumiy qoladi va ularni ham alohida nusxalash kerak.

### Katta massivni argumentga yoymang

`Math.max(...ulkanMassiv)` argumentlar chegarasiga urilishi mumkin (MDN). Katta ma'lumotda `reduce` yoki sikl ishlating.

### `arguments` emas, rest

Yangi kodda `arguments` dan foydalanmang: u massiv emas, strelkalarda yo'q va strict bo'lmagan kodda parametrlar bilan kutilmagan bog'lanadi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Rest parametrini oxirida emas yozish | `SyntaxError` | `(a, b, ...qolgan)` |
| `[...obj]` oddiy obyektda | `TypeError: ... is not iterable` | `Object.values(obj)` yoki `{ ...obj }` |
| Spread nusxani chuqur deb hisoblash | Ichki obyekt ikki nusxada ham o'zgaradi | `structuredClone` |
| `arguments.map(...)` | `TypeError` — massiv emas | Rest parametri |
| Strelkada `arguments` ishlatish | Tashqi funksiyaniki yoki `ReferenceError` | Rest parametri |
| `Object.assign` va spread'ni bir xil deb o'ylash | Setter chaqirilishi, maqsad o'zgarishi farq qiladi | Kerakli xatti-harakatga qarab tanlash |

## Amaliyot

1. `log(daraja, ...xabarlar)` funksiyasini yozing: daraja va qolgan barcha xabarlarni bitta qatorda chiqarsin.
2. Uchta massivni spread bilan birlashtirib, takrorlarni `Set` yordamida olib tashlang.
3. `{ ism, manzil: { shahar } }` obyektining shahrini o'zgarmas tarzda yangilang — asl obyekt o'zgarmasin.
4. `arguments` ishlatadigan eski funksiyani rest parametri bilan qayta yozing va `length` farqini tekshiring.
5. `Math.max(...arr)` ni 1 000 000 elementli massivda sinab ko'ring. Natija qanday?

## Rasmiy hujjat

- MDN — *Rest parameters*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters>
- MDN — *Spread syntax (...)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
- MDN — *The arguments object*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments>
- MDN — *Arrow function expressions* (No binding of arguments): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions>
