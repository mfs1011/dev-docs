# 51 — Arrow funksiyalar chuqur

[← Oldingi: `bind` va partial](50-bind.md) · [Mundarija](README.md) · [Keyingi: Property flag'lari va descriptor'lar →](52-property-flaglari.md)

## Tushuncha

Arrow (strelka) funksiya — `=>` bilan yoziladigan qisqa funksiya ifodasi. MDN: uning oddiy funksiyadan farqi faqat sintaksisda emas. Asosiy farq — **ba'zi narsalar unda yo'q**:

| Arrow funksiyada yo'q | Natija |
| --- | --- |
| O'z `this` i | `this` tashqi (leksik) muhitdan olinadi — closure kabi (43-bob) |
| O'z `arguments` i | Tashqi oddiy funksiyaniki ko'rinadi (42-bob) |
| O'z `super` i | Tashqi metodniki |
| `new.target` | Konstruktor emas |
| `prototype` | `new` bilan chaqirib bo'lmaydi — `TypeError` |
| `yield` | Generator bo'la olmaydi |

MDN xulosasi: arrow funksiyalar **metod** sifatida ishlatilmasin.

### Sintaksis (MDN)

| Shakl | Misol |
| --- | --- |
| Bitta parametr | `x => x * 2` |
| Bir nechta yoki nol parametr | `(a, b) => a + b`, `() => 42` |
| **Ifoda tanasi** — qiymat yashirin qaytariladi | `(a, b) => a + b` |
| **Blok tanasi** — `return` aniq yoziladi | `(a, b) => { return a + b; }` |
| Obyekt qaytarish | `() => ({ foo: 1 })` — qavs ichida |

`=>` dan keyin `{` kelsa, u **blok** deb o'qiladi. Shuning uchun `() => { foo: 1 }` obyekt emas: `foo` — label, natija `undefined`.

`=>` operator emas, lekin ko'pchilik operatorlardan past ustuvorlikda o'qiladi. `cb || () => {}` — `SyntaxError`, to'g'risi — `cb || (() => {})`.

### `this` leksik

Arrow funksiya `this` ni o'zi aniqlamaydi — uni yozilgan joydagi tashqi muhitdan oladi. Shuning uchun:

- metod ichidagi callback'da (`map`, `setTimeout`) `this` metodnikiga teng — `bind` kerak emas;
- obyekt literalidagi arrow "metod" obyektni emas, tashqi `this` ni ko'radi;
- MDN: `call`, `apply`, `bind` arrow funksiyaning `this` ini **o'zgartirmaydi**.

**Klass maydonidagi arrow** (MDN): klass tanasida `this` bor, shuning uchun maydonga yozilgan arrow nusxaning `this` ini closure orqali "bog'lab" oladi. Lekin maydonlar prototipda emas, **har nusxada** — har obyekt uchun yangi funksiya va closure, ya'ni ko'proq xotira.

## Kod: sintaksis

```js
const kv = x => x * x;                       // bitta parametr — qavssiz
const qosh = (a, b) => a + b;                // ifoda tanasi — yashirin return
const blok = (a) => { a + 1; };              // blok tanasi — return yo'q
console.log(kv(4), qosh(2, 3), blok(1));
const yomon = () => { foo: 1 };              // { } — blok, foo — label
const yaxshi = () => ({ foo: 1 });           // obyekt literali — qavs ichida
console.log(yomon(), yaxshi());
try { new Function('let cb; cb = cb || () => {};'); }   // MDN: ustuvorlik — qavs kerak
catch (e) { console.log(e.name + ': ' + e.message); }
let cb; cb = cb || (() => 'standart');
console.log(cb());
```

```text
$ node sintaksis.mjs
16 5 undefined
undefined { foo: 1 }
SyntaxError: Malformed arrow function parameter list
standart
```

- Blok tanasida `return` yo'q — `undefined`.
- `() => { foo: 1 }` — `undefined`, `() => ({ foo: 1 })` — obyekt.
- `cb || () => {}` — `SyntaxError`, qavs bilan — ishladi.

## Kod: `this`

```js
const obj = {
  i: 10,
  b: () => typeof this,                      // strelka: o'z this'i yo'q — modulniki (undefined)
  c() { return this.i; },
  kechikkan() {
    return [1, 2, 3].map(n => n * this.i);   // ichki strelka metodning this'ini oladi
  },
  eski() {
    return [1, 2, 3].map(function (n) { return typeof this; });   // oddiy funksiya — o'z this'i
  },
};
console.log(obj.b(), obj.c(), obj.kechikkan(), obj.eski());
const strelka = () => this;
console.log('call/bind ta\'sir qilmaydi:', strelka.call({ a: 1 }), strelka.bind({ a: 1 })());
```

```text
$ node this.mjs
undefined 10 [ 10, 20, 30 ] [ 'undefined', 'undefined', 'undefined' ]
call/bind ta'sir qilmaydi: undefined undefined
```

- `b` — arrow "metod": `this` modulning yuqori darajasidan (`undefined`, 45-bob).
- `c` — oddiy metod: `this` — `obj`.
- `kechikkan` ichidagi arrow callback metodning `this` ini oldi — `[10, 20, 30]`.
- `eski` ichidagi oddiy funksiya callback'ning o'z `this` i — `undefined` (strict, 19-bob).
- `call` va `bind` arrow'ning `this` ini o'zgartira olmadi.

## Kod: konstruktor emas, klass maydoni

```js
const Foo = () => {};
try { new Foo(); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log('prototype' in Foo);
class Hisob {
  son = 0;
  oshirStrelka = () => ++this.son;            // klass maydonidagi strelka — nusxaning this'i
  oshirMetod() { return ++this.son; }
}
const h = new Hisob();
const { oshirStrelka, oshirMetod } = h;       // metodlarni ajratib olish
console.log(oshirStrelka(), oshirStrelka());
try { oshirMetod(); } catch (e) { console.log('metod:', e.name + ': ' + e.message); }
console.log('prototipda:', Object.hasOwn(Hisob.prototype, 'oshirMetod'), Object.hasOwn(Hisob.prototype, 'oshirStrelka'), '| nusxada:', Object.hasOwn(h, 'oshirStrelka'));
```

```text
$ node cheklov.mjs
TypeError: Foo is not a constructor
false
1 2
metod: TypeError: Cannot read properties of undefined (reading 'son')
prototipda: true false | nusxada: true
```

- `new Foo()` — `TypeError: Foo is not a constructor`, `prototype` yo'q.
- `oshirStrelka` ajratib olinganda ham `this` — `h` (1, 2). Oddiy metod `oshirMetod` ajratilganda `this` yo'qoldi.
- Metod prototipda, arrow maydon esa **har nusxada** (MDN: ko'proq xotira).

## Nega shunday

Oddiy funksiya callback ichida tashqi `this` ga yetish uchun `this` ni o'zgaruvchiga saqlash yoki `.bind(this)` (50-bob) kerak. Arrow funksiyada bunga hojat yo'q: ular `this`, `arguments`, `super` ni o'zi yaratmaydi, oddiy o'zgaruvchi kabi tashqaridan oladi. Shu sababli ular metod yoki konstruktor bo'la olmaydi — bular aynan o'z `this` ini talab qiladi.

## Muhandislik nuqtai nazari

### Qachon arrow, qachon oddiy funksiya

| Holat | Tanlov |
| --- | --- |
| Callback (`map`, `filter`, taymer, Promise) | Arrow |
| Obyekt yoki klass metodi | Metod sintaksisi `metod() {}` |
| Konstruktor | Klass |
| Hodisa ishlovchisi `this` element bo'lishi kerak | Oddiy funksiya (yoki `event.currentTarget`) |
| Tashqi `this` kerak bo'lgan ichki funksiya | Arrow |

### Klass maydonidagi arrow — o'ylab ishlating

`onClick = () => {...}` ajratib berishda qulay, lekin har nusxaga yangi funksiya yaratadi va u prototipda emas (MDN). Ko'p nusxali klasslarda metod va kerakli joyda `bind`/arrow callback afzalroq.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Obyekt literalida arrow metod | `this` — tashqi, obyekt emas | `metod() {}` |
| `() => { a: 1 }` bilan obyekt qaytarish | `undefined` | `() => ({ a: 1 })` |
| Arrow'ni `new` bilan chaqirish | `TypeError` | Klass |
| Arrow'ga `bind`/`call` bilan `this` berish | E'tiborsiz (MDN) | Oddiy funksiya |
| Arrow ichida `arguments` | Tashqi funksiyaniki yoki xato | Rest parametri |
| `cb || () => {}` | `SyntaxError` | `cb || (() => {})` |

## Amaliyot

1. `taymer` obyektida `boshla()` metodini yozing: `setInterval` ichida `this.son` ni oshirsin — avval oddiy funksiya, keyin arrow bilan.
2. Bir xil funksiyani to'rt shaklda yozing: parametrsiz, bitta parametrli, ifoda tanali, obyekt qaytaradigan.
3. Klassda arrow maydon va metodni 10 000 nusxada solishtiring: `process.memoryUsage().heapUsed` farqini o'lchang.
4. `Hisob` klassidan meros oling va `oshirMetod` hamda `oshirStrelka` ni `super` bilan qayta yozishga urining. Qaysi biri ishlaydi?
5. Brauzerda tugma bosilganda `this` ni chiqaring: ishlovchi oddiy funksiya va arrow bo'lganda.

## Rasmiy hujjat

- MDN — *Arrow function expressions*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions>
- MDN — `this` (As a DOM event handler): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
- ECMA-262 — *15.3 Arrow Function Definitions*: <https://tc39.es/ecma262/2026/multipage/ecmascript-language-functions-and-classes.html#sec-arrow-function-definitions>
