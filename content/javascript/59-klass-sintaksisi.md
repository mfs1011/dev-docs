# 59 — Klass sintaksisi

[← Oldingi: Sanaluvchanlik va egalik](58-sanaluvchanlik.md) · [Mundarija](README.md) · [Keyingi: Klass merosi →](60-klass-merosi.md)

## Tushuncha

MDN: klasslar — aslida **"maxsus funksiyalar"**. Ular konstruktor funksiya va `prototype` (55-bob) ustidagi **sintaktik qulaylik**: `class` bilan yozilgan metodlar ham `Klass.prototype` ga tushadi. Lekin bu shunchaki boshqa yozuv emas — klasslarda qo'shimcha qoidalar bor.

```js
class Tortburchak {
  rang = 'oq';                       // maydon
  constructor(boy, en) { ... }       // konstruktor
  get yuza() { ... }                 // getter
  kattalashtir(k) { ... }            // metod
}
```

### Klass elementlari (MDN *Classes*)

| Element | Qayerda | Izoh |
| --- | --- | --- |
| `constructor` | — | Nusxani yaratib, boshlang'ich holatga keltiradi. Faqat bitta bo'lishi mumkin, aks holda `SyntaxError` |
| Metod | **Prototipda** — barcha nusxalar bo'lishadi | Oddiy, `async`, generator bo'lishi mumkin |
| Getter / setter | Prototipda | 53-bob |
| **Maydon** (field) `x = 1` | **Har nusxada** | Qiymati konstruktor argumentiga bog'liq bo'lmasa — qulay |
| `static` | Klassning o'zida | 61-bob |
| `#private` | Nusxada, tashqaridan ko'rinmaydi | 62-bob |

Har element uch belgi bilan tasniflanadi: turi (metod, getter, setter, maydon), joyi (static yoki nusxa), ko'rinishi (public yoki private).

### Konstruktor funksiyadan farqlari

| | Klass | Konstruktor funksiya |
| --- | --- | --- |
| `new` siz chaqirish | `TypeError` | Ishlaydi (`this` — global yoki `undefined`) |
| Hoisting | TDZ: `let`/`const` kabi — e'londan oldin `ReferenceError` | Funksiya e'loni ko'tariladi |
| Strict rejim | Klass tanasi **doim** strict | Faylga bog'liq |
| Metodlarning `enumerable` i | `false` | Oddiy o'zlashtirishda `true` |

Klass ham ifoda bo'lishi mumkin: `const A = class B {}`. Ichki nom (`B`) faqat klass ichida ko'rinadi — nomli funksiya ifodasi kabi (46-bob). Metod nomi hisoblanadigan bo'lishi mumkin: `[nom]() {}`.

### Bajarilish tartibi (MDN *Evaluation order*, qisqartirilgan)

Klass e'loni bajarilganda: `extends`, kalitlar, metodlar prototipga yoziladi. Static maydonlar va static bloklar shu payt bajariladi. **Nusxa maydonlarining** qiymatlari esa nusxa yaratilganda hisoblanadi — asosiy klassda **konstruktor tanasining boshida**.

## Kod: klass va prototip

```js
class Tortburchak {
  rang = 'oq';                                   // maydon — har nusxada
  constructor(boy, en) { this.boy = boy; this.en = en; }
  get yuza() { return this.boy * this.en; }      // getter — prototipda (53-bob)
  kattalashtir(k) { this.boy *= k; this.en *= k; return this; }   // metod — prototipda
}
const t = new Tortburchak(2, 3);
console.log(t, t.yuza, t.kattalashtir(2).yuza);
console.log(typeof Tortburchak, Tortburchak.prototype.constructor === Tortburchak, Object.getPrototypeOf(t) === Tortburchak.prototype);
console.log('nusxada:', Object.keys(t), '| prototipda:', Object.getOwnPropertyNames(Tortburchak.prototype));
console.log('metod sanaladimi:', Object.getOwnPropertyDescriptor(Tortburchak.prototype, 'kattalashtir').enumerable);
```

```text
$ node asos.mjs
Tortburchak { rang: 'oq', boy: 4, en: 6 } 6 24
function true true
nusxada: [ 'rang', 'boy', 'en' ] | prototipda: [ 'constructor', 'yuza', 'kattalashtir' ]
metod sanaladimi: false
```

- `typeof Tortburchak` — `function`. Nusxaning prototipi — `Tortburchak.prototype`.
- `rang`, `boy`, `en` — nusxada (maydon va konstruktor yozgan). `yuza`, `kattalashtir` — prototipda.
- Klass metodi **sanalmaydi** — `for...in` va `Object.keys` da chiqmaydi (58-bob).

## Kod: farqlar

CommonJS fayl — u o'zi strict emas, shuning uchun klassning strict'ligi ko'rinadi:

```js
class K { }
function F() { }
try { K(); } catch (e) { console.log('new siz:', e.name + ': ' + e.message); }
console.log('funksiyani new siz chaqirish:', F());
try { new Oldin(); } catch (e) { console.log('e\'londan oldin:', e.name + ': ' + e.message); }   // TDZ
class Oldin { }
// CommonJS fayl — strict emas. Klass tanasi esa doim strict:
console.log('oddiy funksiya this:', (function () { return this; }).call(undefined) === globalThis, '| klass metodi this:', (class { static t() { return this; } }).t.call(undefined));
const Ifoda = class Ichki { nom() { return Ichki.name; } };    // klass ifodasi, ichki nom
console.log(Ifoda.name, new Ifoda().nom(), typeof Ichki);
const kalit = 'salom';
class Hisob { [kalit + 'Ber']() { return 'salom!'; } }          // hisoblanadigan metod nomi
console.log(new Hisob().salomBer());
```

```text
$ node farqlar.cjs
new siz: TypeError: Class constructor K cannot be invoked without 'new'
funksiyani new siz chaqirish: undefined
e'londan oldin: ReferenceError: Cannot access 'Oldin' before initialization
oddiy funksiya this: true | klass metodi this: undefined
Ichki Ichki undefined
salom!
```

- `K()` — `TypeError`, oddiy funksiya esa `new` siz ham chaqirildi.
- Klass e'londan oldin — `ReferenceError` (TDZ, 44-bob).
- Strict bo'lmagan faylda oddiy funksiyaning `this` i global obyektga aylandi, klass metodida esa `undefined` qoldi — klass tanasi strict.
- Klass ifodasining ichki nomi `Ichki` tashqarida yo'q.
- `[kalit + 'Ber']` — hisoblanadigan metod nomi.

## Kod: maydonlar qachon ishlaydi

```js
class Tartib {
  a = (console.log('  1) maydon a'), 1);
  constructor() { console.log('  2) konstruktor tanasi, this.a =', this.a); }
  b = (console.log('  1) maydon b'), 2);
}
console.log('nusxa yaratilmoqda:');
new Tartib();
```

```text
$ node tartib.mjs
nusxa yaratilmoqda:
  1) maydon a
  1) maydon b
  2) konstruktor tanasi, this.a = 1
```

Maydon initsializatorlari e'lon tartibida (`a`, keyin `b`) va **konstruktor tanasidan oldin** bajarildi: konstruktor `this.a` ni allaqachon ko'rdi.

## Nega shunday

Konstruktor funksiya bilan yozish xatoliklarga boy edi: `new` ni unutish, prototipni qo'lda to'ldirish, `constructor` ni yo'qotish, sanaladigan metodlar. Klass sintaksisi shu mexanizmni o'zgartirmagan holda (MDN: ostida o'sha prototiplar) xatolarni qiyinlashtiradi: `new` majburiy, metodlar sanalmaydi, tana strict.

## Muhandislik nuqtai nazari

### Maydon yoki konstruktor

Argumentga bog'liq bo'lmagan boshlang'ich qiymatlar — maydon (`son = 0`). Argumentdan keladiganlari — konstruktorda. Maydonlar ro'yxati klassning "shaklini" bir qarashda ko'rsatadi.

### Metodlar — prototipda, arrow maydonlar — nusxada

Arrow maydon (`f = () => {}`) har nusxaga alohida funksiya beradi (51-bob). Metodni callback qilib berish kerak bo'lsa, faqat o'sha joyda `bind` yoki arrow.

### Klass — funksiya

Klassni qiymat sifatida uzatish, funksiyadan qaytarish, ifoda sifatida yaratish mumkin. Bu mixin'lar (65-bob) va fabrikalar uchun asos.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `new` siz chaqirish | `TypeError` | `new Klass()` |
| Klassni e'lonidan oldin ishlatish | `ReferenceError` (TDZ) | Avval e'lon |
| Ikki `constructor` | `SyntaxError` (MDN) | Bitta |
| Metodni callback'ga to'g'ridan-to'g'ri berish | `this` yo'qoladi | `bind`, arrow |

## Amaliyot

1. `Talaba` klassini yozing: `ism`, `kurs` konstruktorda, `baholar = []` maydon, `ortacha` getter, `bahoQosh` metod.
2. Xuddi shuni konstruktor funksiya bilan yozing va `Object.getOwnPropertyDescriptor(prototype, 'bahoQosh').enumerable` ni solishtiring.
3. Maydon initsializatorida `this` dan foydalaning (`toliq = this.ism + '!'`) va konstruktorda berilgan `ism` bilan nima bo'lishini tekshiring.
4. Funksiya ichida klass ifodasini qaytaradigan "fabrika" yozing.
5. Klass ichida ikki xil hisoblanadigan nomli metod yarating (`['get' + nom]`).

## Rasmiy hujjat

- MDN — *Classes*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes>
- MDN — *Using classes*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_classes>
- MDN — *Public class fields*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Public_class_fields>
- MDN — *Inheritance and the prototype chain* (classes are syntax sugar): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain>
