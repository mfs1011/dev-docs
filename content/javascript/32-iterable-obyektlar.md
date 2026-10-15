# 32 — Iterable obyektlar

[← Oldingi: Massiv metodlari](31-massiv-metodlari.md) · [Mundarija](README.md) · [Keyingi: `Map` va `Set` →](33-map-va-set.md)

## Tushuncha

`for...of`, spread (`...`), massiv destructuring, `Array.from`, `new Map(...)`, `Promise.all` — bularning hammasi massiv, satr, `Map`, `Set` bilan ishlaydi. Ular qiymatlarni qanday oladi? Har biri uchun alohida kod yozilmagan. Hammasi bitta umumiy kelishuvga tayanadi — **iteratsiya protokollari** (iteration protocols).

MDN ikki protokolni ajratadi:

| Protokol | Talab | Kim |
| --- | --- | --- |
| **Iterable protokoli** | `[Symbol.iterator]()` metodi bor va u **iterator** qaytaradi | "Aylanib chiqsa bo'ladigan" obyekt: massiv, satr, `Map`, `Set` |
| **Iterator protokoli** | `next()` metodi bor va u `{ value, done }` qaytaradi | Aylanib chiqishni bajaradigan obyekt |

Ya'ni **iterable** — "menda qiymatlar bor, mana ularni beradigan iterator", **iterator** esa — "keyingi qiymat mana bu" deydigan obyekt.

## Kod: iteratorni qo'lda yurgizish

```js
const arr = ['a', 'b'];
const it = arr[Symbol.iterator]();
console.log(it.next(), it.next(), it.next(), it.next());
console.log(typeof it[Symbol.iterator], it[Symbol.iterator]() === it);
```

```text
$ node qolda.mjs
{ value: 'a', done: false } { value: 'b', done: false } { value: undefined, done: true } { value: undefined, done: true }
function true
```

- `next()` har chaqiruvda bitta natija obyekti (`IteratorResult`) qaytaradi. MDN: `done: false` — keyingi qiymat bor; `done: true` — ketma-ketlik tugadi.
- MDN: iterator `done: true` qaytargandan keyin keyingi `next()` chaqiruvlari ham `done: true` qaytarishi **kutiladi**, lekin til buni majburlamaydi.
- Oxirgi qator: o'rnatilgan iteratorlarning o'zi ham iterable — `[Symbol.iterator]()` **o'zini** qaytaradi. MDN bunday obyektni **iterable iterator** deydi. Barcha o'rnatilgan iteratorlar `Iterator.prototype` dan meros oladi, u esa shu metodni beradi.

`for...of` aslida shu ishni bajaradi: `[Symbol.iterator]()` ni chaqiradi, so'ng `done: true` bo'lguncha `next()` ni chaqiraveradi.

## Kod: o'z iterable'ingizni yozish

```js
class Oraliq {
  constructor(dan, gacha) { this.dan = dan; this.gacha = gacha; }
  [Symbol.iterator]() {
    let joriy = this.dan;
    const oxiri = this.gacha;
    return {
      next() {
        return joriy <= oxiri ? { value: joriy++, done: false } : { value: undefined, done: true };
      },
      [Symbol.iterator]() { return this; },
    };
  }
}
const r = new Oraliq(1, 4);
console.log([...r], Math.max(...r), Array.from(r, x => x * 10));
for (const x of r) process.stdout.write(x + ' ');
console.log();
const [birinchi, , uchinchi] = r;
console.log(birinchi, uchinchi, [...r]);
```

```text
$ node oraliq.mjs
[ 1, 2, 3, 4 ] 4 [ 10, 20, 30, 40 ]
1 2 3 4 
1 3 [ 1, 2, 3, 4 ]
```

- `[Symbol.iterator]` (mashhur symbol, 22-bob) bitta metodi bilan `Oraliq` spread, `for...of`, `Array.from` va destructuring bilan ishlay boshladi.
- MDN: `[Symbol.iterator]()` iterable obyektning **metodi** sifatida chaqiriladi, shuning uchun ichida `this` — obyektning o'zi (`this.dan`).
- `r` bir necha marta aylanib chiqildi va har safar boshidan boshladi — chunki har `[Symbol.iterator]()` chaqiruvi **yangi** iterator yaratadi. MDN tavsiyasi: iloji bo'lsa, `[Symbol.iterator]()` har safar boshidan boshlanadigan yangi iterator qaytarsin (`Set` kabi).
- Bunday iteratorni generator bilan ancha qisqa yozish mumkin (`*[Symbol.iterator]() { ... yield ... }`) — 80-bob.

## Kod: iteratsiyani erta tugatish — `return()`

MDN: iterator ixtiyoriy **`return()`** metodiga ham ega bo'lishi mumkin. O'rnatilgan sintaksislar iteratorni oxirigacha yurgizmasdan to'xtatsa (`for...of` dagi `break` yoki `return`, yoki destructuring kerakli o'zgaruvchilarni to'ldirib bo'lsa), `return()` chaqiriladi. U tozalash uchun — masalan, ma'lumotlar bazasi ulanishini yopish.

```js
const manba = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() { i++; console.log('  next', i); return { value: i, done: i > 5 }; },
      return() { console.log('  return() — tozalash'); return { done: true }; },
    };
  },
};
console.log('for...of + break:');
for (const x of manba) { if (x === 2) break; }
console.log('destructuring:');
const [a] = manba;
console.log('spread (oxirigacha):');
console.log([...manba]);
```

```text
$ node yopish.mjs
for...of + break:
  next 1
  next 2
  return() — tozalash
destructuring:
  next 1
  return() — tozalash
spread (oxirigacha):
  next 1
  next 2
  next 3
  next 4
  next 5
  next 6
[ 1, 2, 3, 4, 5 ]
```

Spread oxirigacha bordi (`done: true`) — `return()` chaqirilmadi, chunki to'xtatish kerak bo'lmadi.

## Kod: iterable va massivga o'xshash — farq

```js
const oxshash = { 0: 'a', 1: 'b', length: 2 };
try { for (const x of oxshash) {} } catch (e) { console.log(e.name + ': ' + e.message); }
try { [...{ a: 1 }]; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(Array.from(oxshash), Array.from('salom'), Array.from(new Set([1, 1, 2])));
const obj = { ism: 'Ali', yosh: 25 };
for (const [k, v] of Object.entries(obj)) console.log(k, v);
const m = new Map([['x', 1], ['y', 2]]);
console.log([...m.keys()], [...m.values()], [...m], [...'😄a']);
```

```text
$ node arraylike.mjs
TypeError: oxshash is not iterable
TypeError: {(intermediate value)} is not iterable
[ 'a', 'b' ] [ 's', 'a', 'l', 'o', 'm' ] [ 1, 2 ]
ism Ali
yosh 25
[ 'x', 'y' ] [ 1, 2 ] [ [ 'x', 1 ], [ 'y', 2 ] ] [ '😄', 'a' ]
```

Ikki tushuncha tez-tez chalkashtiriladi:

| | Iterable | Massivga o'xshash (array-like) |
| --- | --- | --- |
| Belgisi | `[Symbol.iterator]()` bor | `length` va `0, 1, ...` indeksli xossalar bor |
| `for...of`, spread | Ishlaydi | `TypeError: ... is not iterable` |
| `Array.from` | Ishlaydi | Ishlaydi |
| Misol | `Set`, `Map`, satr | `{ 0: 'a', length: 1 }`, `arguments` |

- `Array.from` ikkalasini ham qabul qiladi — shuning uchun u universal "massivga aylantiruvchi".
- Massiv va satr — **ikkalasi ham**.
- Oddiy obyekt — **hech biri**. Obyekt bo'ylab yurish uchun `Object.keys`/`values`/`entries` (ular massiv qaytaradi).
- MDN: o'rnatilgan iterable'lar — `String`, `Array`, typed array'lar, `Map`, `Set` va `Intl.Segmenter` ning `Segments` obyekti.
- Satr iteratori kod nuqtalari bo'yicha yuradi (`'😄'` butun qoldi, 29-bob).

## Kod: cheksiz iteratorlar va bir martalik iteratorlar

```js
function* fib() { let [a, b] = [0, 1]; for (;;) { yield a; [a, b] = [b, a + b]; } }
console.log(fib().take(10).toArray());
console.log(fib().filter(n => n % 2 === 0).take(5).toArray());
const it = [1, 2, 3].values();
console.log([...it], [...it]);
```

```text
$ node cheksiz.mjs
[
  0, 1,  1,  2,  3,
  5, 8, 13, 21, 34
]
[ 0, 2, 8, 34, 144 ]
[ 1, 2, 3 ] []
```

- MDN: iterator protokoli **chekli yoki cheksiz** qiymatlar ketma-ketligini ifodalay oladi. `fib()` hech qachon tugamaydi — `[...fib()]` dastur osilib qolishiga olib keladi. Iterator helper'lari (`take`, `filter`, `toArray`) bilan faqat kerakli qismini olish mumkin (82-bob). MDN: iterator helper'lari cheksiz iteratorlar bilan ishlash uchun zarur.
- **Iterator bir martalik**: `it` birinchi spread'da tugadi, ikkinchi spread bo'sh massiv berdi. Iterable (`[1, 2, 3]` ning o'zi) esa har safar yangi iterator beradi.

## Nega shunday

MDN: til iterable va iteratorlarni **ishlab chiqaradigan** va **iste'mol qiladigan** API'larni belgilaydi. Protokol ikkala tomonni ajratadi: `for...of`, spread, `Array.from`, `Promise.all`, `new Map()` kabi iste'molchilar faqat protokolni biladi; massiv, `Map`, generator, foydalanuvchi klassi kabi manbalar esa faqat protokolni bajaradi. Yangi manba qo'shish uchun iste'molchilarni o'zgartirish shart emas, va aksincha.

Iterable va iterator nega ikki xil narsa? Bitta to'plamni bir vaqtda bir necha joyda mustaqil aylanib chiqish uchun: har `[Symbol.iterator]()` chaqiruvi o'z holatiga (qaysi elementda turgani) ega yangi iterator beradi.

## Muhandislik nuqtai nazari

### O'z to'plamingizni iterable qiling

Agar sizda daraxt, bog'langan ro'yxat yoki sahifali API natijasi kabi to'plam klassi bo'lsa, unga `[Symbol.iterator]` qo'shing. Shunda foydalanuvchilar ichki tuzilmani bilmasdan `for...of`, spread va `Array.from` dan foydalana oladi.

### Resursli iteratorda `return()` ni yozing

Iterator fayl, ulanish yoki qulf ushlab tursa, `return()` da ularni bo'shating — `for...of` dagi `break` va istisno holatlarida ham chaqiriladi. Generatorlarda buni `try...finally` beradi (80-bob).

### Spread katta yoki cheksiz manbada xavfli

`[...manba]` hamma qiymatni xotiraga yig'adi. Katta oqimlar va cheksiz generatorlarda `for...of` bilan yoki iterator helper'lari bilan qismlab ishlang.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `for (const x of obj)` oddiy obyektda | `TypeError: obj is not iterable` | `Object.entries(obj)` |
| `[...arrayLike]` | `TypeError` | `Array.from(arrayLike)` |
| Iteratorni ikki marta ishlatish | Ikkinchisi bo'sh | Iterable'dan yangi iterator oling |
| `[...cheksizGenerator()]` | Dastur osilib qoladi | `.take(n).toArray()` |
| `next()` dan obyekt bo'lmagan qiymat qaytarish | `TypeError` (MDN) | `{ value, done }` qaytaring |
| `[Symbol.iterator]` ni oddiy satr kalit deb yozish: `'Symbol.iterator'()` | Iterable bo'lmaydi | Hisoblanadigan kalit `[Symbol.iterator]` |

## Amaliyot

1. `Oraliq` ga `qadam` parametri qo'shing (`new Oraliq(0, 10, 3)` → `0 3 6 9`).
2. `teskari(arr)` iterable'ini yozing: massivni oxiridan boshiga beradi, massivning o'zini o'zgartirmaydi.
3. `yopish.mjs` dagi `manba` ni `const [x, y, ...qolgan] = manba` bilan sinang. `return()` chaqiriladimi? Nega?
4. Bog'langan ro'yxat (`{ qiymat, keyingi }` tugunlar) klassini yozing va uni iterable qiling.
5. `Array.from({ length: 3 })` va `[...{ length: 3 }]` natijalarini solishtiring va farqni tushuntiring.

## Rasmiy hujjat

- MDN — *Iteration protocols*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols>
- MDN — `Symbol.iterator`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/iterator>
- MDN — `Iterator`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator>
- MDN — `for...of`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of>
- MDN — `Array.from()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from>
- ECMA-262 — *Iteration*: <https://tc39.es/ecma262/2026/#sec-iteration>
