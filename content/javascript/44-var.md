# 44 — Eski `var`

[← Oldingi: Leksik muhit va closure](43-closure.md) · [Mundarija](README.md) · [Keyingi: Global obyekt →](45-global-obyekt.md)

## Tushuncha

`var` — `let` va `const` paydo bo'lishidan (ES2015) oldingi o'zgaruvchi e'loni. Yangi kodda u deyarli ishlatilmaydi, lekin eski kodda, kutubxonalarda va suhbatlarda (interview) uchraydi. U `let` dan to'rt jihati bilan farq qiladi.

| | `var` | `let` / `const` (5-bob) |
| --- | --- | --- |
| **Scope** | Funksiya (yoki modul / global skript) | Blok `{ }` |
| **Hoisting** | E'lon ko'tariladi, qiymat — `undefined` | E'lon ko'tariladi, lekin TDZ: e'londan oldin murojaat — `ReferenceError` |
| **Qayta e'lon** | Xatosiz (strict rejimda ham) | `SyntaxError` |
| **Global skriptda** | Global obyektning xossasi bo'ladi | Xossa bo'lmaydi |

### Scope (MDN)

`var` ning scope'i — uni o'rab turgan eng yaqin: **funksiya tanasi** yoki statik ishga tushirish bloki. Ular bo'lmasa — **joriy modul** (modul rejimida) yoki **global scope** (skript rejimida). Blok, `try...catch`, `switch`, `for` sarlavhasi `var` uchun scope **yaratmaydi**: ichida e'lon qilingan `var` tashqarida ham ko'rinadi.

### Hoisting (MDN)

`var` e'lonlari kod bajarilishidan **oldin** qayta ishlanadi: kodning istalgan joyidagi e'lon boshida yozilgandek ishlaydi. Faqat **e'lon** ko'tariladi, qiymat berish emas — u o'z qatoriga yetganda bajariladi. Shu paytgacha o'zgaruvchi `undefined`. MDN tavsiyasi: `var` ni scope boshida e'lon qiling.

### Qayta e'lon (MDN)

`var` ni qayta e'lon qilish xato bermaydi (strict rejimda ham). Initializer bo'lmasa, qiymat yo'qolmaydi. Bir scope'da `var` va funksiya e'loni bo'lsa, ikkalasi ko'tariladi: funksiya qiymati `var` ga birinchi qiymat berilgunga qadar ko'rinadi. `var` ni `let`, `const`, `class`, `import` bilan bir scope'da e'lon qilib bo'lmaydi.

### Global obyekt (MDN)

Skriptda `var` global obyektga **o'chirib bo'lmaydigan** (non-configurable) xossa sifatida qo'shiladi. CommonJS va ES modullarda yuqori darajadagi e'lonlar modulga tegishli va global obyektga qo'shilmaydi (45-bob).

### IIFE (MDN Glossary)

`let` bo'lmagan davrda `var` ni yashirishning yagona yo'li — funksiya. **IIFE** (Immediately Invoked Function Expression) — e'lon qilinishi bilan darhol bajariladigan funksiya ifodasi: `(function () { ... })()`.

## Kod: scope

```js
if (true) { var blokVar = 'var'; let blokLet = 'let'; }
console.log(blokVar);                                   // blok var uchun scope emas
console.log(typeof blokLet);                            // let blokdan chiqmaydi
for (var a of [1, 2, 3]);
console.log('sikldan keyin a =', a);                    // MDN misoli
function f() { var ichki = 1; }
f();
console.log(typeof ichki);                              // funksiya — var uchun scope
```

```text
$ node scope.mjs
var
undefined
sikldan keyin a = 3
undefined
```

`if` bloki ichidagi `var` tashqarida ko'rindi, `let` esa yo'q. `for` sarlavhasidagi `a` sikldan keyin ham bor (MDN misoli). Funksiya ichidagi `var` tashqariga chiqmadi — `var` uchun chegara faqat funksiya.

## Kod: hoisting

```js
function doSomething() {                                // MDN misoli
  console.log(bar);                                     // e'lon ko'tarildi, qiymat yo'q
  var bar = 111;
  console.log(bar);
}
doSomething();
try { console.log(yangi); let yangi = 1; }
catch (e) { console.log('let:', e.name + ': ' + e.message); }   // TDZ (5-bob)
```

```text
$ node hoist.mjs
undefined
111
let: ReferenceError: Cannot access 'yangi' before initialization
```

`bar` e'londan oldin — `undefined`, xato emas: e'lon ko'tarilgan, qiymat hali berilmagan. `let` xuddi shu holatda `ReferenceError` beradi — vaqtinchalik o'lik zona (TDZ, 5-bob). TDZ xatoni darhol ko'rsatadi, `var` esa uni `undefined` ostida yashiradi.

## Kod: qayta e'lon — skript va modulda

Bir xil kod, CommonJS (`.cjs`) va ES modul (`.mjs`):

```js
var a = 1;
var a = 2;
var a;                                                  // initializer'siz — qiymat yo'qolmaydi
console.log(a);
console.log(typeof b);                                  // funksiya e'loni ham ko'tariladi
var b = 1;
function b() {}
console.log(b);                                         // var'ning initializer'i ustun keldi
```

```text
$ node qayta.cjs
2
function
1
$ node qayta.mjs 2>&1 | grep -E "^(SyntaxError|function b)"
function b() {}
SyntaxError: Identifier 'b' has already been declared
```

- CommonJS'da — MDN'dagidek: `a` 2 qoldi, `typeof b` boshida `function`, `var b = 1` dan keyin `1`.
- ES modulda — **`SyntaxError`**, bitta qator ham bajarilmadi. ECMA-262: modulning yuqori darajasida funksiya e'lonlari `var` kabi emas, **leksik e'lonlar** (`let` kabi) hisoblanadi (8.2.4). Modulda leksik nom `var` nomi bilan takrorlanishi esa sintaksis xatosi (16.2.1.1).

## Kod: global obyekt

```js
import vm from 'node:vm';
var modulVar = 1;                                       // modulda — global obyektga qo'shilmaydi
console.log('modul var globalThis da:', Object.hasOwn(globalThis, 'modulVar'));
vm.runInThisContext('var skriptVar = 1; let skriptLet = 2;');   // skript rejimida bajarish
console.log('skript var:', Object.hasOwn(globalThis, 'skriptVar'), '| skript let:', Object.hasOwn(globalThis, 'skriptLet'));
console.log('configurable:', Object.getOwnPropertyDescriptor(globalThis, 'skriptVar').configurable);
try { delete globalThis.skriptVar; } catch (e) { console.log('delete:', e.name + ': ' + e.message); }
```

```text
$ node global.mjs
modul var globalThis da: false
skript var: true | skript let: false
configurable: false
delete: TypeError: Cannot delete property 'skriptVar' of #<Object>
```

- Modulda `var` global obyektga tushmadi.
- `vm.runInThisContext` (Node hujjati: kodni joriy global kontekstda bajaradi, lokal scope'ga kirmaydi) — skript sifatida: `var` global obyekt xossasi bo'ldi, `let` — yo'q.
- Xossa `configurable: false`. Modul strict rejimda, shuning uchun `delete` `TypeError` berdi (MDN: strict bo'lmagan kodda indamay muvaffaqiyatsiz bo'ladi).

## Kod: IIFE

```js
const hisob = (function () {                            // IIFE: darhol chaqiriladigan funksiya ifodasi
  var son = 0;                                          // tashqaridan ko'rinmaydi
  return { oshir: () => ++son };
})();
hisob.oshir();
console.log(hisob.oshir(), typeof son);
{                                                       // bugun: blok + let yetarli
  let son2 = 0;
}
console.log(typeof son2);
```

```text
$ node iife.mjs
2 undefined
undefined
```

IIFE ichidagi `son` tashqaridan ko'rinmaydi — closure (43-bob) orqali yashirilgan holat. Bugun buning uchun blok va `let` yetarli: `son2` blokdan chiqmadi.

## Nega shunday

JavaScript dastlab faqat `var` va funksiya scope bilan yaratilgan edi. Blok scope yo'qligi, hoisting'dagi `undefined` va global obyektga tushish ko'p xatolarga sabab bo'ldi: siklda closure (43-bob), nomlar to'qnashuvi, sezilmagan yozuv xatolari. ES2015'da `let`/`const` qo'shildi, lekin `var` eski kod ishlashi uchun o'zgarmay qoldi. Modullar esa yangi qoidalarni qat'iyroq qo'llaydi.

## Muhandislik nuqtai nazari

### Yangi kodda `var` yo'q

`const` — standart, qiymat qayta beriladigan bo'lsa `let`. Linter'larda `no-var` qoidasi shuni majburlaydi.

### Eski kodni o'zgartirishda ehtiyot bo'ling

`var` ni `let` ga mexanik almashtirish xatti-harakatni o'zgartirishi mumkin: blokdan tashqarida ishlatilgan o'zgaruvchi `ReferenceError` beradi, global skriptda esa global xossa yo'qoladi. Har almashtirishni scope bo'yicha tekshiring.

### Skript va modul farqi

Bir xil kod skriptda ishlab, modulda `SyntaxError` berishi mumkin (sinovda). Eski skriptni modulga o'tkazishda shunday joylarni qidiring.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Blok ichidagi `var` blokda qoladi deb o'ylash | Tashqarida ko'rinadi, nomlar to'qnashadi | `let` / `const` |
| `var` ni e'londan oldin o'qish | `undefined` — xato yashirinadi | `let` (TDZ xatoni ko'rsatadi) |
| Bir nomni ikki marta `var` bilan e'lon qilish | Indamay qayta yoziladi | `const`/`let` — darhol `SyntaxError` |
| Skriptda global `var` ni `delete` qilish | O'chmaydi | Global o'zgaruvchidan qochish |
| Siklda `var` bilan callback | Hammasi oxirgi qiymatni ko'radi (43-bob) | `let` |

## Amaliyot

1. `for (var i ...)` ichidagi `setTimeout` xatosini uch xil yo'l bilan tuzating: `let`, IIFE, funksiya fabrikasi.
2. Hoisting'ni ko'rsatadigan funksiya yozing va uni "dvigatel ko'rganidek" — `var` e'lonlari boshida — qayta yozing.
3. `qayta.cjs` dagi `function b() {}` ni `var b = 1` dan oldinga ko'chiring. Natija o'zgaradimi? Nega?
4. `vm.runInThisContext` bilan skriptda `const` e'lon qilib, `globalThis` da borligini tekshiring.
5. Eski uslubdagi `var` bilan yozilgan 20 qatorli kodni `let`/`const` ga o'tkazing va har o'zgarishni izohlang.

## Rasmiy hujjat

- MDN — `var`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var>
- MDN Glossary — *IIFE*: <https://developer.mozilla.org/en-US/docs/Glossary/IIFE>
- ECMA-262 — *8.2.4 Static Semantics: LexicallyDeclaredNames*: <https://tc39.es/ecma262/2026/multipage/syntax-directed-operations.html#sec-static-semantics-lexicallydeclarednames>
- ECMA-262 — *16.2.1.1 Modules: Static Semantics: Early Errors*: <https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-module-semantics-static-semantics-early-errors>
- Node.js — *VM* (`vm.runInThisContext()`): <https://nodejs.org/api/vm.html>
