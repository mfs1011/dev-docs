# 45 — Global obyekt

[← Oldingi: Eski `var`](44-var.md) · [Mundarija](README.md) · [Keyingi: Funksiya obyekti →](46-funksiya-obyekti.md)

## Tushuncha

**Global obyekt** (MDN Glossary) — global scope'ni ifodalovchi obyekt. Har muhitda u bitta va doim mavjud, lekin nomi va tarkibi muhitga bog'liq:

| Muhit | Global obyekt | Nomi |
| --- | --- | --- |
| Brauzer (oddiy sahifa) | `Window` | `window`, `self`, `frames` |
| Web Worker | `WorkerGlobalScope` | `self` |
| Node.js | `global` | `global` (Node: *Legacy*, o'rniga `globalThis`) |
| **Istalgan muhit** | — | **`globalThis`** |

`globalThis` (ES2020) — MDN: global `this` qiymatini, demak global obyektni **barcha muhitlarda bir xil** olishning standart yo'li. Undan oldin muhitni aniqlab, har birida boshqa nom ishlatish kerak edi.

### Global obyekt nimani saqlaydi

- O'rnatilgan obyektlar: `Math`, `Array`, `JSON`, `Promise` … Ular global o'zgaruvchidek ishlaydi, chunki global obyekt xossalari avtomatik global scope'ga qo'shiladi (MDN).
- Muhit API'lari: brauzerda `document`, `fetch`; Node'da `process`, `Buffer`, `setTimeout`.
- O'ziga havola: `globalThis.globalThis === globalThis`.
- **Skriptning** yuqori darajasidagi `var` va funksiya e'lonlari. `let`/`const` hech qachon global obyekt xossasi bo'lmaydi (44-bob).

### Yuqori darajadagi `this` (MDN *this*)

| Qayerda | `this` |
| --- | --- |
| Skript yuqori darajasi (strict yoki yo'q) | `globalThis` |
| **Modul** yuqori darajasi | **`undefined`** |
| Strict bo'lmagan funksiya, obyektsiz chaqirilgan | `globalThis` |
| Strict funksiya, obyektsiz chaqirilgan | `undefined` (19-bob) |

Node CommonJS fayllari esa funksiya ichiga o'raladi (Node: *module wrapper*). Shu sababli ulardagi `var`, `let`, `const` global obyektga emas, modulga tegishli.

MDN izohi: odatda `globalThis` global obyektning o'zi. Lekin brauzerda xavfsizlik sababli u haqiqiy global obyekt atrofidagi **Proxy** (`WindowProxy`). Host umuman boshqa qiymat berishi ham mumkin.

## Kod: nomlar va `this`

```js
console.log(globalThis === global, globalThis === globalThis.globalThis);
console.log(typeof window, typeof self);                    // Node'da yo'q (brauzer nomlari)
console.log(globalThis.Math === Math, Object.hasOwn(globalThis, 'Array'), Object.hasOwn(globalThis, 'setTimeout'));
console.log('modul darajasidagi this:', this);              // ES modul — undefined
```

```text
$ node nomlar.mjs
true true
undefined undefined
true true true
modul darajasidagi this: undefined
```

Node'da `globalThis` va `global` — bitta obyekt; `window` va `self` yo'q. `Math`, `Array`, `setTimeout` — global obyektning xossalari. ES modulning yuqori darajasidagi `this` — `undefined`.

## Kod: CommonJS va yashirin global

```js
// CommonJS, strict emas
console.log('CJS darajasidagi this === module.exports:', this === module.exports);
function oddiy() { return this; }
console.log('strict bo\'lmagan funksiya this === globalThis:', oddiy() === globalThis);
function yashirin() { yozuvXato = 42; }                      // e'lonsiz o'zlashtirish
yashirin();
console.log('yashirin global:', Object.hasOwn(globalThis, 'yozuvXato'), yozuvXato);
function qatiy() { 'use strict'; boshqaXato = 1; }
try { qatiy(); } catch (e) { console.log('strict:', e.name + ': ' + e.message); }
```

```text
$ node skript.cjs
CJS darajasidagi this === module.exports: true
strict bo'lmagan funksiya this === globalThis: true
yashirin global: true 42
strict: ReferenceError: boshqaXato is not defined
```

- Kuzatildi: CommonJS faylining yuqori darajasidagi `this` — `module.exports` (o'rash funksiyasi shunday chaqiriladi).
- Strict bo'lmagan funksiyada obyektsiz chaqiruvdagi `this` — `globalThis`.
- E'lon qilinmagan o'zgaruvchiga qiymat berish strict bo'lmagan kodda **jimgina** global obyekt xossasini yaratdi — **yashirin global** (MDN *var*: *Implicit globals*). Strict rejimda — `ReferenceError` (4-bob).

## Kod: global obyektga yozish

```js
globalThis.ilovaNomi = 'dev-docs';                          // global obyekt xossasi = global o'zgaruvchi
console.log(ilovaNomi, typeof ilovaNomi);
{
  const ilovaNomi = 'lokal';                               // lokal nom globalni to'sadi
  console.log(ilovaNomi, globalThis.ilovaNomi);
}
if (!('jamla' in Array.prototype)) {                       // polyfill namunasi: yo'q bo'lsa qo'shish
  Object.defineProperty(Array.prototype, 'jamla', { value() { return this.reduce((s, n) => s + n, 0); }, configurable: true, writable: true });
}
console.log([1, 2, 3].jamla());
delete Array.prototype.jamla;
```

```text
$ node qoshish.mjs
dev-docs string
lokal dev-docs
6
```

- `globalThis.ilovaNomi` — hamma joydan `ilovaNomi` sifatida ko'rinadi.
- Lokal `const ilovaNomi` globalni **to'sdi** (shadowing). To'silganda ham global qiymatga `globalThis.ilovaNomi` orqali yetiladi.
- MDN: global obyektga aniq yozish asosan **polyfill** uchun kerak — muhitda yo'q imkoniyatni qo'shish. Namuna: avval borligini tekshirib, keyin qo'shish. Sinovdan keyin xossa o'chirildi.

## Nega shunday

Global obyekt — til bilan muhit uchrashadigan joy: dvigatel o'rnatilgan obyektlarni, host esa o'z API'larini unga qo'yadi. Har muhit uni o'zicha nomlagani uchun universal kod yozish qiyin edi — `globalThis` shu muammoni yechish uchun qo'shildi. Global scope'ni hamma kod bo'lishadi: ikki skript bir nomni ishlatsa, ular to'qnashadi. Modullar va `let`/`const` global obyektga yozmaydi — bu to'qnashuvlarni kamaytiradi.

## Muhandislik nuqtai nazari

### Global holatdan qoching

Global obyektga ma'lumot yozish — har modul ko'radigan va o'zgartira oladigan holat. Kerakli qiymatlarni modul eksportlari va funksiya parametrlari orqali uzating.

### O'rnatilgan prototiplarni o'zgartirmang

`Array.prototype` ga o'z metodingizni qo'shish kelajakdagi standart metod bilan to'qnashishi mumkin. Polyfill — faqat **standart** imkoniyatni, faqat u yo'q bo'lganda qo'shish uchun.

### Universal kodda `globalThis`

Brauzer va Node'da ishlaydigan kutubxonada `window` yoki `global` emas, `globalThis` ishlating.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Node'da `window` ga murojaat | `ReferenceError` | `globalThis` |
| E'lonsiz o'zgaruvchiga qiymat berish | Yashirin global (strict bo'lmagan kodda) | `const`/`let`, strict rejim |
| Modulda `this` global deb kutish | `undefined` | `globalThis` |
| Global nomni lokal bilan to'sib, keyin globalni kutish | Lokal qiymat olinadi | Boshqa nom yoki `globalThis.nom` |
| Kutubxonada global o'zgaruvchilar yaratish | Boshqa kod bilan to'qnashuv | Modul eksportlari |

## Amaliyot

1. Brauzer konsolida `globalThis === window` va `this === window` ni tekshiring, keyin `<script type="module">` ichida `this` ni chiqaring.
2. CommonJS faylda `var`, `let` va e'lonsiz o'zlashtirish qilib, qaysi biri `globalThis` da paydo bo'lishini tekshiring.
3. `Object.getOwnPropertyNames(globalThis)` dan o'rnatilgan konstruktorlarni (bosh harf bilan boshlanadigan funksiyalar) ajratib chiqaring.
4. `Array.prototype.at` yo'q deb faraz qilib, uning polyfill'ini standartga mos yozing va faqat yo'q bo'lganda qo'shing.
5. MDN'dagi `globalThis` dan oldingi `check(...)` usulini ishga tushiring va Node'da qaysi tarmoq ishlashini aniqlang.

## Rasmiy hujjat

- MDN — `globalThis`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis>
- MDN Glossary — *Global object*: <https://developer.mozilla.org/en-US/docs/Glossary/Global_object>
- MDN — `this` (Global context): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
- Node.js — *Globals* (`global`): <https://nodejs.org/api/globals.html>
- Node.js — *Modules: CommonJS* (The module wrapper): <https://nodejs.org/api/modules.html>
