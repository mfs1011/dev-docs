# 20 — Konstruktor va `new`

[← Oldingi: Metodlar va `this`](19-metodlar-va-this.md) · [Mundarija](README.md) · [Keyingi: Optional chaining →](21-optional-chaining.md)

## Tushuncha

Bir xil tuzilishdagi ko'p obyekt kerak bo'lsa (talabalar, mahsulotlar), har birini literal bilan yozish o'rniga **konstruktor** (constructor) ishlatiladi — obyekt "qolipi" vazifasini bajaradigan funksiya. MDN: funksiya **`new`** kalit so'zi bilan chaqirilsa, u konstruktor sifatida ishlatiladi.

Odatda konstruktor nomi **katta harf** bilan yoziladi (`Talaba`, `Mashina`) — bu til qoidasi emas, kelishuv: "bu funksiyani `new` bilan chaqiring" degan belgi.

Bugungi kodda konstruktorlar ko'pincha `class` (59-bob) bilan yoziladi. Lekin `class` ham ichida xuddi shu `new` mexanizmidan foydalanadi — uni tushunish klasslarni tushunishning asosi.

## `new` nima qiladi — to'rt qadam

MDN `new F(...)` ni quyidagicha ta'riflaydi:

1. Bo'sh, oddiy obyekt yaratiladi — uni `yangiNusxa` deb ataylik.
2. `yangiNusxa` ning `[[Prototype]]` i konstruktorning `prototype` xossasiga yo'naltiriladi (agar u obyekt bo'lsa; aks holda `Object.prototype`).
3. Konstruktor berilgan argumentlar bilan bajariladi, `this` — `yangiNusxa`.
4. Konstruktor **primitiv bo'lmagan** qiymat qaytarsa — butun `new` ifodasining natijasi o'sha. Hech narsa yoki primitiv qaytarsa — `yangiNusxa` qaytariladi.

## Kod: konstruktor funksiya

```js
function Talaba(ism, kurs) {
  this.ism = ism;
  this.kurs = kurs;
}
Talaba.prototype.tanishtir = function () {
  return `${this.ism}, ${this.kurs}-kurs`;
};
const a = new Talaba('Ali', 2);
const b = new Talaba('Lola', 3);
console.log(a, b.tanishtir());
console.log(Object.getPrototypeOf(a) === Talaba.prototype, a.tanishtir === b.tanishtir);
```

```text
$ node qadamlar.mjs
Talaba { ism: 'Ali', kurs: 2 } Lola, 3-kurs
true true
```

- `this.ism = ism` — 3-qadam: `this` yangi obyekt, unga xossalar yoziladi.
- `Object.getPrototypeOf(a) === Talaba.prototype` — 2-qadam ishlagani.
- `a.tanishtir === b.tanishtir` — metod **bitta**, ikkala nusxa uni prototip orqali topadi. MDN: konstruktorning `prototype` xossasiga qo'shilgan narsalar shu konstruktordan yaratilgan **hamma** nusxalarga ko'rinadi. Prototiplar — 54–55-boblarda.

## Kod: konstruktordan qaytarish

```js
function Obyekt() { this.a = 1; return { a: 2 }; }
function Primitiv() { this.a = 1; return 42; }
console.log(new Obyekt(), new Primitiv());
```

```text
$ node qaytarish.mjs
{ a: 2 } Primitiv { a: 1 }
```

4-qadam: `Obyekt` boshqa obyekt qaytardi — `this` ga yozilgan obyekt tashlab yuborildi. `Primitiv` esa `42` qaytardi — e'tiborsiz qoldirildi, natija — yangi nusxa. MDN: odatda konstruktorlar qiymat qaytarmaydi; qaytarish — oddiy yaratish jarayonini **almashtirish** uchun.

## Kod: `new.target` va `new` siz chaqiruv

**`new.target`** — MDN: maxsus sintaksis (xossaga murojaat emas, chunki `new` — zahiralangan so'z). Funksiya `new` bilan chaqirilsa — konstruktorning o'zi, aks holda — `undefined`. Funksiya yoki klass tanasidan tashqarida ishlatish — sintaksis xatosi.

```js
function Mashina(rang) {
  if (!new.target) return `${rang} mashina`;
  this.rang = rang;
}
console.log(Mashina('qizil'), new Mashina('qizil'));
function Qattiq(x) {
  if (!new.target) throw new TypeError('Qattiq ni new bilan chaqiring');
  this.x = x;
}
try { Qattiq(1); } catch (e) { console.log(e.message); }
function Unutilgan(x) { this.x = x; }
try { Unutilgan(1); } catch (e) { console.log(e.name + ': ' + e.message); }
class K {}
try { K(); } catch (e) { console.log(e.name + ': ' + e.message); }
try { new Symbol(); } catch (e) { console.log(e.name + ': ' + e.message); }
try { Map(); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(typeof Date(), typeof new Date(), typeof Number('5'), typeof new Number('5'));
```

```text
$ node target.mjs
qizil mashina Mashina { rang: 'qizil' }
Qattiq ni new bilan chaqiring
TypeError: Cannot set properties of undefined (setting 'x')
TypeError: Class constructor K cannot be invoked without 'new'
TypeError: Symbol is not a constructor
TypeError: Constructor Map requires 'new'
string object number object
```

- `Unutilgan(1)` — `new` unutildi. MDN: bunday chaqiruvda yangi obyekt yaratilmaydi va `this` boshqacha bo'ladi. Modulda (strict) `this` — `undefined`, shuning uchun `TypeError`. Sloppy rejimda esa `this` — `globalThis` va `x` **global o'zgaruvchiga** aylanardi — xato jim o'tib ketardi.
- **Klass** `new` siz chaqirilmaydi — MDN: `TypeError`.
- O'rnatilgan (built-in) funksiyalar: MDN bo'yicha ES6 dan keyin til qat'iyroq — `Symbol()` va `BigInt()` faqat `new` siz, `Map` va `Proxy` faqat `new` bilan. Eskilari ikki xil ishlaydi: `Date()` satr qaytaradi, `new Date()` — obyekt; `Number('5')` primitiv son, `new Number('5')` — o'rov obyekt (25-bob).

## Nega shunday

`new` "obyekt yaratish" ni ikki qismga ajratadi: **umumiy** qism (bo'sh obyekt, prototip, qaytarish) tilning ishi, **xos** qism (qaysi xossalar) — konstruktor funksiyaning ishi. Shu sababli istalgan oddiy funksiya konstruktor bo'la olardi — bu ES6 gacha yagona yo'l edi. Natijada `new` ni unutish oson va xato jim edi. `class` (MDN: faqat `new` bilan) va `new.target` shu muammoga javob.

## Muhandislik nuqtai nazari

### Yangi kodda — `class`

Konstruktor funksiya + `prototype` qo'lda yozish o'rniga `class` — `new` siz chaqiruvni til o'zi to'xtatadi, metodlar avtomatik prototipga tushadi (59-bob). Konstruktor funksiyalarni eski kodda va kutubxonalarda o'qish uchun bilish kerak.

### Konstruktordan obyekt qaytarmang

4-qadamdagi almashtirish kodni chalkashtiradi: `new X() instanceof X` — `false` bo'lib qolishi mumkin. Turli obyekt kerak bo'lsa — oddiy **fabrika funksiya** (`function yasash() { return {...}; }`), `new` siz.

### O'rov obyektlar yaratmang

`new Number`, `new String`, `new Boolean` — primitiv emas, obyekt beradi (`typeof` — `'object'`), taqqoslashda kutilmagan natija beradi. Tip o'zgartirish uchun `new` siz `Number(x)` (7-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `new` ni unutish | strict'da `TypeError`, sloppy'da global o'zgaruvchi | `class` yoki `new.target` tekshiruvi |
| Metodni `this.f = function` bilan konstruktor ichida yaratish | Har nusxada alohida funksiya | `prototype` yoki `class` metodi |
| Konstruktordan obyekt qaytarish | `this` ga yozilganlar yo'qoladi | Hech narsa qaytarmaslik |
| `new Symbol()`, `new BigInt(1)` | `TypeError` | `Symbol()`, `BigInt(1)` |
| `Map()` `new` siz | `TypeError: Constructor Map requires 'new'` | `new Map()` |
| `new Number(5)` primitiv deb o'ylash | `typeof` — `'object'` | `Number(5)` |

## Amaliyot

1. `Kalkulyator` konstruktorini yozing: `qiymat` xossasi va `prototype` da `qosh(n)` metodi. Ikki nusxa yarating, metod bitta ekanini tekshiring.
2. `new` ning to'rt qadamini oddiy funksiya bilan takrorlang: `yarat(F, ...args)` — `Object.create(F.prototype)`, `F.apply(...)`, natijani tekshirish (57- va 49-boblarda batafsil).
3. `function F() { return [1, 2]; }` — `new F()` nima qaytaradi? `return 'satr'` bo'lsa-chi?
4. `new.target` yordamida `new` siz chaqirilganda o'zini `new` bilan qayta chaqiradigan konstruktor yozing.
5. `typeof Date()` va `typeof new Date()` nega farq qiladi? MDN `Date()` sahifasidan tekshiring.

## Rasmiy hujjat

- MDN — `new`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new>
- MDN — `new.target`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target>
- MDN — `this` ("Constructors"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this#constructors>
- ECMA-262 — *The new Operator*: <https://tc39.es/ecma262/2026/#sec-new-operator>
