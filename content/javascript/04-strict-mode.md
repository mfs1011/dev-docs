# 04 — Strict mode

[← Oldingi: Kod tuzilishi](03-kod-tuzilishi.md) · [Mundarija](README.md) · [Keyingi: O'zgaruvchilar →](05-ozgaruvchilar.md)

## Tushuncha

**Strict mode** (qat'iy rejim) — JavaScript'ning **cheklangan varianti**ni ixtiyoriy ravishda yoqish usuli. Uni yoqmagan kod ba'zan norasmiy ravishda **sloppy mode** ("beparvo rejim") deyiladi — MDN ta'kidlaydi: bu rasmiy atama emas.

MDN: strict mode shunchaki tilning qisqartirilgan qismi emas, uning semantikasi **atayin farq qiladi**. Strict va oddiy kod bir dasturda birga yashay oladi, shuning uchun unga asta-sekin o'tish mumkin.

Strict mode uch narsani o'zgartiradi (MDN):

1. ba'zi **jim xatolarni** haqiqiy xatoga aylantiradi;
2. engine'lar uchun optimallashtirishni qiyinlashtiradigan kamchiliklarni tuzatadi — strict kod ba'zan tezroq ishlashi mumkin;
3. ECMAScript'ning kelajakdagi versiyalarida ishlatilishi mumkin bo'lgan sintaksisni taqiqlaydi.

### Qanday yoqiladi

| Qayerda | Qanday |
| --- | --- |
| **Butun skript** | Fayl boshida, boshqa barcha instruksiyalardan oldin aynan `"use strict";` (yoki `'use strict';`) |
| **Bitta funksiya** | Funksiya tanasining boshida `"use strict";` |
| **ES modul** | **Avtomatik** — hech narsa yozish shart emas |
| **Klass** | Klass tanasining hamma qismi **avtomatik** strict |
| Blok `{ }` | **Ishlamaydi** — blokka qo'yilsa, hech narsa qilmaydi |

`"use strict"` — bu **direktiva**: oddiy satr literali, lekin skript yoki funksiya boshida turgani uchun engine uni maxsus belgi deb taniydi. Boshqa joyda u shunchaki hech narsa qilmaydigan satr.

Bu qo'llanmadagi deyarli barcha misollar `.mjs` — ES modul, ya'ni **strict mode'da** ishlaydi. Zamonaviy kodda ham shunday: `import`/`export` bilan yoziladigan har qanday modul va har qanday klass sukut bo'yicha strict.

## Kod: bir xil kod — ikki xil natija

Yetti holatni uch muhitda ishga tushiramiz: oddiy CommonJS fayl (`sloppy.cjs`), boshida `"use strict";` bor fayl (`strict.cjs`) va ES modul (`modul.mjs`). Kodning o'zi bir xil:

```js
function sinov(nom, fn) {
  try { console.log(nom.padEnd(30), '→', fn()); }
  catch (e) { console.log(nom.padEnd(30), '→', e.constructor.name + ':', e.message); }
}
sinov('xato nomga qiymat', () => { natijja = 17; return typeof globalThis.natijja; });
sinov('NaN = 5', () => { NaN = 5; return NaN; });
sinov('primitivga xossa', () => { const s = 'matn'; s.uzunlik = 4; return s.uzunlik; });
sinov('delete Object.prototype', () => delete Object.prototype);
sinov('freeze qilingan obyekt', () => { const o = Object.freeze({ x: 1 }); o.x = 2; return o.x; });
sinov('oddiy chaqiruvda this', () => { function f() { return this === globalThis ? 'globalThis' : String(this); } return f(); });
sinov('arguments sinxronligi', () => { function f(a) { a = 42; return arguments[0]; } return f(17); });
```

```text
$ node sloppy.cjs
xato nomga qiymat              → number
NaN = 5                        → NaN
primitivga xossa               → undefined
delete Object.prototype        → false
freeze qilingan obyekt         → 1
oddiy chaqiruvda this          → globalThis
arguments sinxronligi          → 42

$ node strict.cjs
xato nomga qiymat              → ReferenceError: natijja is not defined
NaN = 5                        → TypeError: Cannot assign to read only property 'NaN' of object '#<Object>'
primitivga xossa               → TypeError: Cannot create property 'uzunlik' on string 'matn'
delete Object.prototype        → TypeError: Cannot delete property 'prototype' of function Object() { [native code] }
freeze qilingan obyekt         → TypeError: Cannot assign to read only property 'x' of object '#<Object>'
oddiy chaqiruvda this          → undefined
arguments sinxronligi          → 17
```

`modul.mjs` — `strict.cjs` bilan **aynan bir xil** natija beradi, garchi unda `"use strict"` yozilmagan bo'lsa ham.

Har bir qatorni MDN bo'yicha tahlil qilamiz.

### 1. Xato yozilgan nom — tasodifiy global o'zgaruvchi

Sloppy rejimda `natijja` (bitta harf ortiqcha) degan e'lon qilinmagan nomga qiymat berish **global obyektda yangi xossa yaratadi** va dastur "ishlashda davom etadi". Natija: `globalThis.natijja` — `number`, asl o'zgaruvchi esa o'zgarmagan. Strict mode'da — `ReferenceError`. MDN: strict mode tasodifan global o'zgaruvchi yaratishni **imkonsiz** qiladi. Haqiqatan global qiymat kerak bo'lsa, buni aniq yozing: `globalThis.x = ...`.

### 2–3, 5. Jim muvaffaqiyatsiz yozish

MDN: xossaga yozish uch holatda muvaffaqiyatsiz bo'ladi — yozib bo'lmaydigan (non-writable) xossa, faqat getter'i bor xossa, kengaytirib bo'lmaydigan obyektga yangi xossa. Sloppy rejimda bular **jim** o'tib ketadi:

- `NaN` — yozib bo'lmaydigan global; `NaN = 5` hech narsa qilmadi;
- `Object.freeze` qilingan obyektda `o.x = 2` — qiymat `1` bo'lib qoldi, xabar yo'q;
- primitivga (satrga) xossa qo'shish — MDN: primitivning xossasiga murojaat ko'rinmaydigan vaqtinchalik o'rov obyekt yaratadi (25-bob), shuning uchun yozish yo'qoladi; `s.uzunlik` — `undefined`.

Strict mode'da uchalasi ham `TypeError`. Bu eng foydali o'zgarish: **xato yuz bergan joyda to'xtaydi**, keyinroq tushunarsiz natija sifatida chiqmaydi.

### 4. O'chirib bo'lmaydigan xossani `delete`

Sloppy: `delete Object.prototype` → `false`, jim. Strict: `TypeError`. Bundan tashqari strict mode'da oddiy nomni o'chirish — `delete x` — **sintaksis xatosi**.

### 6. `this` almashtirilmaydi

MDN: sloppy rejimda funksiyadagi `this` doim obyekt — `f()` kabi oddiy chaqiruvda u **global obyekt**ga aylantiriladi, primitiv esa o'rov obyektga o'raladi. Strict mode'da `this` hech narsaga aylantirilmaydi: `f()` da u `undefined`. Bu xavfsizlik uchun muhim — funksiya tasodifan global obyektga yozib yubormaydi. `this` ning to'liq qoidalari — 19-bobda.

### 7. `arguments` parametrlar bilan sinxronlanmaydi

Sloppy rejimda `a = 42` qilinganda `arguments[0]` ham `42` bo'ladi — ikkalasi bog'langan. Strict mode'da `arguments` chaqiruv paytidagi **asl qiymatlar**ni saqlaydi: `17`. MDN: bu sinxronlik engine optimallashtirishini murakkablashtirgan va kodni tushunishni qiyinlashtirgan.

## Kod: sintaksis xatolari — kod ishga tushmasdan oldin

Ba'zi o'zgarishlar ijro paytida emas, **tahlil paytida** xato beradi — bitta qator ham bajarilmaydi:

```js
"use strict";
function yig(a, a, c) { return a + a + c; }
```

```text
SyntaxError: Duplicate parameter name not allowed in this context
```

```js
"use strict";
const ruxsat = 0644;
```

```text
SyntaxError: Octal literals are not allowed in strict mode.
```

```js
"use strict";
with (Math) { console.log(PI); }
```

```text
SyntaxError: Strict mode code may not include a with statement
```

```js
"use strict";
const private = 1;
```

```text
SyntaxError: Unexpected strict mode reserved word
```

Sloppy rejimda esa xuddi shu kod ishlaydi — va kutilmagan natija beradi:

```js
console.log(0644, 0o644);
with (Math) { console.log(PI); }
```

```text
$ node s5.cjs
420 420
3.141592653589793
```

`0644` — **sakkizlik** (octal) son, ya'ni 420, o'nlik 644 emas. MDN: yangi boshlovchilar boshidagi nolni "ma'nosiz", tekislash uchun deb o'ylashi mumkin — bu esa sonning ma'nosini o'zgartiradi. Sakkizlik sonning standart yozuvi — `0o644`.

### Nega `with` taqiqlangan

MDN: `with (obj) { x }` ichidagi `x` ijro paytida yo `obj.x`, yo tashqi o'zgaruvchi bo'lishi mumkin — **oldindan bilib bo'lmaydi**. Engine'ning ko'p optimallashtirishlari esa "X o'zgaruvchi aynan *shu* joyda saqlanadi" deb aytishga tayanadi. Strict mode `with` ni sintaksis xatosi qilib, bu noaniqlikni yo'qotadi. O'rniga obyektni qisqa nomli o'zgaruvchiga oling: `const m = Math; m.PI`.

### Strict mode'da qo'shimcha band so'zlar

MDN ro'yxati: `implements`, `interface`, `let`, `package`, `private`, `protected`, `public`, `static`, `yield`. Ulardan ba'zilari tilda allaqachon ishlatiladi, qolganlari — kelajak sintaksisi uchun zaxira.

## Kod: direktiva qayerda ishlaydi, qayerda yo'q

**Boshida bo'lmasa — ishlamaydi:**

```js
const x = 1;
"use strict";
function f() { return this === globalThis; }
console.log(f());
```

```text
$ node s6.cjs
true
```

`"use strict"` birinchi instruksiya emas — u oddiy satr bo'lib qoldi, fayl sloppy rejimda ishladi (`this` — global obyekt).

**Murakkab parametrli funksiyada — taqiqlangan:**

```js
function yig(a = 1, b = 2) {
  "use strict";
  return a + b;
}
```

```text
SyntaxError: Illegal 'use strict' directive in function with non-simple parameter list
```

MDN: funksiya darajasidagi `"use strict"` faqat **oddiy parametrli** funksiyada ruxsat etilgan; default qiymatli, rest yoki destructuring parametrli funksiyada — sintaksis xatosi. Yechim: butun faylni (yoki modulni) strict qiling.

## Nega shunday

MDN strict mode o'zgarishlarini besh guruhga ajratadi:

| Guruh | Misollar |
| --- | --- |
| Xatolarni xatoga aylantirish | E'lon qilinmagan nomga yozish, jim muvaffaqiyatsiz yozish va o'chirish, takroriy parametrlar, eski sakkizlik literallar, primitivga xossa |
| Scope'ni soddalashtirish | `with` yo'q, `eval` atrofga o'zgaruvchi "oqizmaydi", blok ichidagi funksiya e'loni faqat blokda ko'rinadi |
| `eval` va `arguments` ni soddalashtirish | Ularni qayta bog'lab bo'lmaydi, `arguments` sinxronlanmaydi |
| "Xavfsizroq" JavaScript | `this` almashtirilmaydi, `fn.caller` va `fn.arguments` bilan stekni kezib bo'lmaydi |
| Kelajakka tayyorgarlik | Qo'shimcha band so'zlar |

Strict mode **ixtiyoriy** (opt-in): uning semantikasi atayin farq qiladi, lekin MDN aytganidek strict va oddiy kod birga yashay oladi — shuning uchun unga fayl yoki funksiya darajasida bosqichma-bosqich o'tish mumkin. Yangi konstruksiyalarda (modul, klass) esa u **avtomatik**. MDN qo'shimcha qiladi: ilgari xato bergan narsani xatosiz qilish doim orqaga mos; tilning xatolarga qat'iyligi kelajakdagi o'zgarishlar uchun joy qoldiradi.

## Muhandislik nuqtai nazari

### Qachon hali ham sloppy kodga duch kelasiz

- Brauzerda `<script>` (`type="module"` siz) — sloppy;
- Node.js'da CommonJS fayllar (`.cjs`, yoki `"type"` siz `.js` fayllarda ES modul sintaksisi bo'lmasa) — sloppy;
- `eval`, `new Function`, HTML'dagi `onclick="..."` atributlari, `setTimeout` ga berilgan satr — MDN: ular funksiya tanasi yoki to'liq skript sifatida qaraladi, strict mode ularning boshida alohida yoqiladi.

Eski kod bazasini ko'chirishda MDN tavsiyasi: `"use strict"` ni bo'lak-bo'lak (fayl yoki hatto funksiya darajasida) qo'shing, ijro xatolarini tuzating va **semantik farqlarga** — `this`, `arguments`, `eval`, blokdagi funksiyalar — alohida e'tibor bering, chunki ularni testlar har doim ham ushlamaydi.

### `"use strict"` ni modulga yozish kerakmi?

Yo'q — ES modul va klass allaqachon strict. Yozilsa, zarari yo'q, lekin ma'nosi ham yo'q. Build natijasida esa uni ko'rishingiz mumkin: masalan, TypeScript'ning `alwaysStrict` sozlamasi fayllarni strict mode'da tahlil qiladi va har bir chiqish fayliga `"use strict"` qo'shadi (TypeScript hujjati).

## Tipik xatolar

| Xato | Nima bo'ladi | To'g'ri yo'l |
| --- | --- | --- |
| `"use strict"` ni fayl o'rtasiga yozish | Oddiy satr, hech qanday ta'siri yo'q | Birinchi instruksiya sifatida |
| Default parametrli funksiyaga `"use strict"` | `SyntaxError` | Butun fayl/modulni strict qilish |
| Blokka `"use strict"` yozish | Hech narsa qilmaydi | Fayl yoki funksiya darajasida |
| Sonni tekislash uchun boshiga 0 qo'yish (`0644`) | Sloppy'da sakkizlik son (420) | `644` yoki aniq `0o644` |
| Strict'ga o'tganda faqat sintaksis xatolarini tuzatish | `this`/`arguments` farqi jim natija o'zgarishiga olib keladi | Semantik farqlarni ko'rib chiqish va test |

## Amaliyot

1. `sloppy.cjs` misolini ishga tushiring, keyin boshiga `"use strict";` qo'shib takrorlang. Qaysi qatorlar o'zgardi?
2. `function f() { return typeof this; }` ni sloppy va strict rejimda `f()`, `f.call(5)`, `f.call(null)` bilan chaqiring. Natijalarni jadvalga yozing.
3. `class A { m() { x = 1; } }` — `new A().m()` qanday xato beradi va nega (klass ichida `"use strict"` yozilmagan)?
4. Brauzer konsolida `natijja = 5; window.natijja` ni bajaring. Keyin `"use strict"; natijja2 = 5` ni bitta qatorda bajaring.
5. Eski loyihangizdagi bitta CommonJS faylga `"use strict"` qo'shing va testlarni ishga tushiring.

## Rasmiy hujjat

- MDN — *Strict mode*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode>
- MDN — *Sloppy mode* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Sloppy_mode>
- ECMA-262 — *The Strict Mode of ECMAScript* (Annex C): <https://tc39.es/ecma262/2026/#sec-strict-mode-of-ecmascript>
- ECMA-262 — *Directive Prologues and the Use Strict Directive*: <https://tc39.es/ecma262/2026/#sec-directive-prologues-and-the-use-strict-directive>
- TypeScript — `alwaysStrict`: <https://www.typescriptlang.org/tsconfig/alwaysStrict.html>
