# 19 — Metodlar va `this`

[← Oldingi: Garbage collection](18-garbage-collection.md) · [Mundarija](README.md) · [Keyingi: Konstruktor va `new` →](20-konstruktor-va-new.md)

## Tushuncha

**Metod** (method) — MDN: obyektga bog'langan funksiya, boshqacha aytganda, qiymati funksiya bo'lgan xossa. Metod ichida joriy obyektga murojaat qilish uchun maxsus kalit so'z bor — **`this`**.

MDN `this` ni funksiyaning **yashirin parametri** deb tushunishni taklif qiladi. Oddiy parametrlar kabi, `this` ham funksiya tanasi bajarilganda til yaratadigan bog'lanish. Eng muhim qoida:

> Oddiy funksiyada `this` qiymati funksiya **qanday chaqirilganiga** bog'liq — qayerda yozilganiga emas.

Agar chaqiruv `obj.f()` ko'rinishida bo'lsa, `this` — `obj`. Ya'ni nuqtadan **oldingi** qism.

## Kod: metod yozish

MDN ikki sintaksisni ko'rsatadi — qiymati funksiya bo'lgan xossa va qisqa **metod sintaksisi** (method definition):

```js
const hisob = {
  egasi: 'Ali',
  qoldiq: 100,
  toldirish(summa) {
    this.qoldiq += summa;
    return this.qoldiq;
  },
  eskiUslub: function () {
    return `${this.egasi}: ${this.qoldiq}`;
  },
};
console.log(hisob.toldirish(50));
console.log(hisob.eskiUslub());
try { new hisob.toldirish(1); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(typeof new hisob.eskiUslub());
```

```text
$ node metod.mjs
150
Ali: 150
TypeError: hisob.toldirish is not a constructor
object
```

MDN: ikki shakl **bir xil emas**. Metod sintaksisi bilan yozilgan funksiya **konstruktor bo'la olmaydi** (`new` — `TypeError`), va faqat u `super` ga murojaat qila oladi (60-bob). Bu metodlarni klasslardagi metodlarga (59-bob) moslashtiradi. Obyekt metodlari uchun qisqa sintaksis — odatiy tanlov.

## Kod: `this` chaqiruvda aniqlanadi

Bitta funksiya — turli obyektlar:

```js
function salom() {
  return `Salom, ${this.ism}`;
}
const ali = { ism: 'Ali', salom };
const vali = { ism: 'Vali', salom };
console.log(ali.salom());
console.log(vali.salom());
const bola = { __proto__: ali, ism: 'Bola' };
console.log(bola.salom());
vali.boshqa = ali.salom;
console.log(vali.boshqa());
```

```text
$ node chaqiruv.mjs
Salom, Ali
Salom, Vali
Salom, Bola
Salom, Vali
```

- Funksiya **bitta**, lekin `this` har chaqiruvda boshqa — xuddi argument kabi.
- `bola` da `salom` yo'q, u prototipdan (`ali`) topiladi (54-bob). Shunga qaramay `this` — `bola`. MDN: `this` — funksiya **o'z xossasi** bo'lgan obyekt emas, funksiyani **chaqirish uchun ishlatilgan** obyekt.
- `vali.boshqa = ali.salom` — funksiya `ali` da yaratilgan bo'lsa ham, `vali.boshqa()` da `this` — `vali`. Funksiya obyektga "yopishib qolmaydi".

## Kod: obyektsiz chaqiruv — `this` yo'qoladi

Metodni o'zgaruvchiga olib, alohida chaqirsangiz — nuqtadan oldin hech narsa yo'q:

```js
const user = {
  ism: 'Ali',
  salom() { return this?.ism; },
};
const f = user.salom;
console.log(f());
function korsat() { return this; }
console.log(korsat());
console.log([1].map(function () { return this; }));
console.log([1].map(function () { return this; }, user));
```

```text
$ node yoqolish.mjs
undefined
undefined
[ undefined ]
[ { ism: 'Ali', salom: [Function: salom] } ]
```

MDN: funksiya hech qanday obyekt orqali olinmasdan chaqirilsa, **strict mode**'da (4-bob; modullar doim strict) `this` — `undefined`. Shuning uchun `this.ism` yozilgan oddiy metod bunday chaqiruvda `TypeError: Cannot read properties of undefined (reading 'ism')` beradi.

**Callback**'larda ham shunday: `this` ni API'ni yozgan tomon belgilaydi. MDN: massivning iteratsiya metodlari callback'ni odatda `this` = `undefined` bilan chaqiradi, lekin ixtiyoriy `thisArg` parametrini qabul qiladi — oxirgi qatorda `user` shu yo'l bilan uzatildi.

### Strict bo'lmagan rejimda

Sloppy mode'da (CommonJS fayl, `'use strict'` siz) MDN aytgan **`this` almashtirish** (this substitution) ishlaydi: `undefined`/`null` o'rniga `globalThis`, primitiv o'rniga uning o'rov obyekti (25-bob) qo'yiladi:

```js
function korsat() { return this; }
console.log(korsat() === globalThis);
console.log(typeof korsat.call(5), typeof (function () { 'use strict'; return this; }).call(5));
console.log(this === module.exports);
```

```text
$ node sloppy.cjs
true
object number
true
```

Oxirgi qator: MDN — Node.js CommonJS modullari funksiyaga o'rab bajariladi va yuqori darajadagi `this` — `module.exports`. ES modulda esa yuqori darajadagi `this` — `undefined`.

## Kod: taymerga metod uzatish

Klassik holat — metodni boshqa funksiyaga **qiymat sifatida** berish:

```js
const user = {
  ism: 'Ali',
  salom() { console.log(`Salom, ${this.ism}`); },
};
setTimeout(user.salom, 0);
setTimeout(() => user.salom(), 0);
setTimeout(user.salom.bind(user), 0);
```

```text
$ node timer.mjs
Salom, undefined
Salom, Ali
Salom, Ali
```

`setTimeout(user.salom)` funksiyaning **o'zini** oladi — `user` bilan aloqa yo'qoladi; taymer uni o'z qoidasi bilan chaqiradi va `this` endi `user` emas. Ikki yechim:

1. **O'rovchi arrow funksiya** — `() => user.salom()`: chaqiruv yana `obj.f()` shaklida.
2. **`bind`** — MDN: `this` qiymati qanday chaqirilishidan qat'i nazar o'zgarmaydigan **yangi funksiya** yaratadi. Batafsil — 50-bobda.

## Kod: arrow funksiyada o'z `this` yo'q

MDN: arrow funksiyada `this` **o'rab turgan leksik kontekstning** `this` ini saqlaydi — til yangi `this` bog'lanishini yaratmaydi. `call`/`bind` dagi `thisArg` e'tiborsiz qoldiriladi.

```js
const taymer = {
  nom: 'Taymer',
  soniyalar: [1, 2, 3],
  yomon() {
    return this.soniyalar.map(function (s) { return `${this?.nom}: ${s}`; });
  },
  yaxshi() {
    return this.soniyalar.map(s => `${this.nom}: ${s}`);
  },
};
console.log(taymer.yomon());
console.log(taymer.yaxshi());
const tashqi = () => this;
console.log(tashqi(), tashqi.call({ a: 1 }));
```

```text
$ node strelka.mjs
[ 'undefined: 1', 'undefined: 2', 'undefined: 3' ]
[ 'Taymer: 1', 'Taymer: 2', 'Taymer: 3' ]
undefined undefined
```

- `yomon` dagi ichki `function` — o'z `this` i bor va `map` uni `undefined` bilan chaqiradi.
- `yaxshi` dagi arrow — o'z `this` i yo'q, u `yaxshi()` metodining `this` ini (ya'ni `taymer`) ko'radi. Metod ichidagi callback uchun arrow aynan shu sababli qulay (14-bob).
- `tashqi` modul darajasida yaratilgan — atrofdagi `this` `undefined`, va `call({ a: 1 })` uni o'zgartira olmadi.

## Nega shunday

`this` ning chaqiruvda aniqlanishi **bitta funksiyani ko'p obyekt bilan qayta ishlatish** imkonini beradi: MDN misolidagi kabi bitta `salom` funksiyasini istalgan obyektga biriktirish, prototipdagi bitta metodni hamma nusxalar bilan ishlatish (54-bob). Agar `this` yaratilgan joyga bog'langan bo'lsa, prototip orqali meros bunday ishlamas edi.

Narxi — `this` ning "yo'qolishi": funksiya obyektdan ajratilsa, aloqa ham uziladi. `obj.f()` va `(obj.f)()` nega bir xil ishlashi, `f = obj.f; f()` esa nega boshqacha — spetsifikatsiyadagi **Reference Record** bilan izohlanadi (24-bob).

## Muhandislik nuqtai nazari

### Qaysi qoida ishlaydi — tez tekshiruv

| Chaqiruv | `this` |
| --- | --- |
| `obj.f()` | `obj` |
| `f()` (strict / modul) | `undefined` |
| `f()` (sloppy) | `globalThis` |
| `f.call(x)`, `f.apply(x)` | `x` (49-bob) |
| `f.bind(x)()` | `x` (50-bob) |
| `new F()` | yangi obyekt (20-bob) |
| arrow funksiya | atrofdagi `this`, o'zgarmaydi |

### Metodni uzatishdan oldin o'ylang

Metodni callback sifatida berish (`setTimeout`, hodisa ishlovchisi, `then`) — `this` yo'qolishining asosiy manbai. Uzatishda arrow o'rovchi yoki `bind` ishlating; kod ko'rib chiqishda (code review) `obj.metod` qavssiz uzatilgan joylarga e'tibor bering.

### Metodlarni arrow bilan yozmang

Obyekt literalida `nom: () => this.x` — `this` obyekt emas, atrofdagi kontekst bo'ladi (14-bob). MDN: obyekt literali o'zi `this` ko'lamini yaratmaydi — faqat uning ichidagi oddiy funksiyalar (metodlar) yaratadi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `setTimeout(obj.metod, 0)` | `this` — `obj` emas | `() => obj.metod()` yoki `bind` |
| `const f = obj.metod; f()` | strict'da `this` — `undefined`, `TypeError` | `obj.metod()` |
| Metod arrow bilan: `m: () => this.x` | `this` — tashqi kontekst | `m() { return this.x; }` |
| Metod ichida `function` callback'da `this` | `this` — `undefined` | Arrow callback yoki `thisArg` |
| `this` — funksiya yaratilgan obyekt deb o'ylash | Ko'chirilgan metodda boshqa obyekt | `this` chaqiruvda aniqlanadi |
| Sloppy kodda `this` ga yozish | Global o'zgaruvchi yaratiladi | Strict mode / modul |

## Amaliyot

1. `const kalk = { a: 0, qosh(n) { this.a += n; return this; } }` — `kalk.qosh(2).qosh(3).a` nima beradi? Nega zanjir ishlaydi?
2. `const { salom } = user; salom();` — natija qanday va nega? (Destructuring — 36-bob.)
3. `chaqiruv.mjs` dagi `salom` ni arrow funksiyaga almashtiring. Natijalar qanday o'zgaradi?
4. `[1, 2].forEach(function () { console.log(this); }, { x: 1 })` va xuddi shuni arrow bilan yozing — farq nimada?
5. `timer.mjs` dagi uchinchi variantda `bind` dan keyin `user.ism = 'Vali'` ni taymerdan oldin qo'shing. Nima chiqadi?

## Rasmiy hujjat

- MDN — `this`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
- MDN — *Working with objects* ("Defining methods", "Using this for object references"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects#defining_methods>
- MDN — *Method definitions*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions>
- MDN — *Strict mode* ("No this substitution"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#no_this_substitution>
- ECMA-262 — *Function Calls*: <https://tc39.es/ecma262/2026/#sec-function-calls>
