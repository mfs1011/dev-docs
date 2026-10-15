# 24 — Reference Type

[← Oldingi: Obyektdan primitivga](23-obyektdan-primitivga.md) · [Mundarija](README.md) · [Keyingi: Primitivlarning metodlari →](25-primitivlarning-metodlari.md)

## Tushuncha

19-bobda qoida bor edi: `obj.f()` da `this` — `obj`, lekin `const g = obj.f; g()` da `this` yo'qoladi. Savol: **nega**? `obj.f` ikkala holatda ham bir xil funksiyani beradi-ku.

Javob spetsifikatsiyada — **Reference Record** (havola yozuvi) degan ichki tur. U JavaScript **qiymati emas**: uni o'zgaruvchiga saqlab bo'lmaydi, `typeof` bilan ko'rib bo'lmaydi. Bu — spetsifikatsiya tili hodisalarni tushuntirish uchun ishlatadigan **spetsifikatsiya turi** (specification type).

ECMA-262 (6.2.5): Reference Record `delete`, `typeof`, tayinlash operatorlari, `super` va boshqa imkoniyatlarning xatti-harakatini tushuntirish uchun ishlatiladi. Masalan, tayinlashning chap tomoni Reference Record hosil qilishi kutiladi.

Bu bob ixtiyoriy chuqurlik: kundalik kod uchun 19-bobdagi qoidalar yetarli. Lekin `this` qachon yo'qolishini **taxmin qilish** o'rniga **aniq bilish** uchun shu mexanizm kerak.

## Reference Record nimadan iborat

ECMA-262, 8-jadval:

| Maydon | Nima saqlaydi |
| --- | --- |
| `[[Base]]` | Bog'lanishni ushlab turgan narsa: qiymat (masalan, obyekt), **Environment Record** (o'zgaruvchilar muhiti, 43-bob) yoki `unresolvable` (topilmadi) |
| `[[ReferencedName]]` | Bog'lanish nomi: xossa yoki o'zgaruvchi nomi |
| `[[Strict]]` | Strict mode kodida yaratilganmi |
| `[[ThisValue]]` | Faqat `super.x` uchun — o'sha paytdagi `this` |

Ya'ni `user.salom` ifodasi hisoblanganda natija darhol funksiya emas. Bu — taxminan "`user` obyektining `salom` nomli xossasi" degan yozuv: `{ Base: user, ReferencedName: 'salom' }`. Haqiqiy qiymatni olish uchun alohida qadam bor — **`GetValue`**.

## Chaqiruv qanday ishlaydi

ECMA-262 13.3.6.1 (*Function Calls*) bo'yicha `f(...)` chaqiruvi:

1. Qavsdan oldingi qism hisoblanadi → `ref` (Reference Record bo'lishi mumkin).
2. `func = GetValue(ref)` — chaqiriladigan funksiyaning o'zi.
3. **`EvaluateCall(func, ref, ...)`** — `this` shu yerda aniqlanadi.

`EvaluateCall` (13.3.6.2) qadamlari:

- `ref` Reference Record va **xossa havolasi** (IsPropertyReference) bo'lsa — `this` = `GetThisValue(ref)`, ya'ni `[[Base]]`: nuqtadan oldingi obyekt.
- `ref` Reference Record, lekin bazasi Environment Record (oddiy o'zgaruvchi) bo'lsa — `this` = `refEnv.WithBaseObject()`, bu oddiy holatda `undefined`.
- `ref` **umuman Reference Record bo'lmasa** (oddiy qiymat) — `this` = `undefined`.

Hammasi shu: `this` funksiyadan emas, chaqiruvdan oldingi ifoda **Reference Record bo'lib qolganmi** — shundan keladi.

## Kod: qaysi ifoda havolani saqlaydi

```js
const user = {
  ism: 'Ali',
  salom() { return this?.ism; },
};
console.log(user.salom());
console.log((user.salom)());
console.log((0, user.salom)());
console.log((user.salom || null)());
console.log((true ? user.salom : null)());
let f;
console.log((f = user.salom)());
console.log(user['salom']());
```

```text
$ node ref.mjs
Ali
Ali
undefined
undefined
undefined
undefined
Ali
```

Qatorma-qator, spetsifikatsiya bo'yicha:

| Ifoda | Qavsdan oldin nima | `this` |
| --- | --- | --- |
| `user.salom()` | Reference Record (`Base: user`) | `user` |
| `(user.salom)()` | Guruhlash operatori — ECMA-262 13.2.9.2: `GetValue` **qo'llamaydi**, havola saqlanadi | `user` |
| `(0, user.salom)()` | Vergul operatori — 13.16.1: `GetValue` qo'llab, **qiymat** qaytaradi | `undefined` |
| `(user.salom \|\| null)()` | Mantiqiy operator — qiymat qaytaradi | `undefined` |
| `(true ? user.salom : null)()` | Shartli operator — 13.14.1: `GetValue` bilan qiymat | `undefined` |
| `(f = user.salom)()` | Tayinlash — o'ng tomon qiymati | `undefined` |
| `user['salom']()` | Kvadrat qavs ham xossa havolasi | `user` |

Spetsifikatsiya guruhlash qavslari haqida izoh beradi: ular `GetValue` qo'llamasligining asosiy sababi — `delete` va `typeof` kabi operatorlarni qavsli ifodalarga ham qo'llash imkoni. `(user.salom)()` ning ishlashi shuning natijasi.

`const g = user.salom; g()` — 19-bobdagi holat: `g` ga **qiymat** (funksiya) yozildi. `g()` da `ref` — `g` o'zgaruvchisining havolasi, bazasi Environment Record, shuning uchun `this` — `undefined`.

## Kod: havola boshqa joylarda

Reference Record faqat `this` uchun emas:

```js
console.log(typeof aniqlanmagan);
try { aniqlanmagan; } catch (e) { console.log(e.name + ': ' + e.message); }
const m = { a: 1 };
console.log(delete (m.a), m);
```

```text
undefined
ReferenceError: aniqlanmagan is not defined
true {}
```

- `typeof aniqlanmagan` — ECMA-262 13.5.3.1: `typeof` avval qiymatni emas, **havolani** oladi. Havola `unresolvable` bo'lsa (nom topilmadi), xatosiz `"undefined"` qaytaradi. Oddiy murojaat esa `GetValue` ga boradi va `ReferenceError` beradi.
- `delete (m.a)` — `delete` ham havola bilan ishlaydi: qaysi obyektdan qaysi xossani o'chirishni aynan `[[Base]]` va `[[ReferencedName]]` aytadi. Qavslar havolani saqlagani uchun bu ishlaydi.
- Tayinlashning chap tomoni (`m.a = 2`) — qayerga yozishni ham havola beradi.

## Nega shunday

Til `obj.f` ni hisoblashda darhol funksiyani olsa, `obj` haqidagi ma'lumot yo'qolardi va `obj.f()` da `this` ni o'rnatib bo'lmasdi. Shuning uchun spetsifikatsiya oraliq natija — "qaysi obyektning qaysi nomi" — tushunchasini kiritadi. Bu yozuv chaqiruv, `delete`, `typeof` va tayinlash uchun yetarli ma'lumotni saqlaydi.

Lekin havola faqat **bevosita** chaqiruvgacha yashaydi. Har qanday operator (vergul, `||`, `?:`, tayinlash) yoki o'zgaruvchiga saqlash uni `GetValue` bilan oddiy qiymatga aylantiradi — va `[[Base]]` haqidagi ma'lumot yo'qoladi. 19-bobdagi "`this` yo'qolishi" aynan shu.

## Muhandislik nuqtai nazari

### `(0, obj.f)()` ni tanib oling

Bu shakl transpilyator chiqishida uchraydi. Babel 8 ning `@babel/plugin-transform-modules-commonjs` plagini `import { hisob } from './util.js'; hisob(1);` kodini shunday o'giradi:

```js
"use strict";

var _util = require("./util.js");
(0, _util.hisob)(1);
```

Asl ES modulda `hisob(1)` — oddiy o'zgaruvchi orqali chaqiruv, `this` — `undefined`. O'girilgan kodda funksiya `_util` obyektining xossasi bo'lib qoldi. `_util.hisob(1)` yozilsa, `this` — `_util` bo'lardi va xatti-harakat o'zgarardi. Vergul operatori havolani qiymatga aylantirib, asl semantikani saqlaydi.

### Qoida: chaqiruv nuqtadan to'g'ridan-to'g'ri keyin

`this` kerak bo'lgan metodni chaqirishda `obj.metod(...)` yoki `obj[kalit](...)` — boshqa hech narsa. Funksiyani biror joyga uzatish kerak bo'lsa — arrow o'rovchi yoki `bind` (19-bob).

### Bu bilim qachon kerak

Kundalik kodda — kamdan-kam. Lekin g'alati `this` xatosini tuzatishda va transpilyator chiqishini o'qishda `(obj.f)()` va `(obj.f = obj.f)()` kabi holatlarga aniq javob beradi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `(shart ? a.f : b.f)()` | `this` — `undefined` | `shart ? a.f() : b.f()` |
| `(obj.f \|\| standart)()` | `this` yo'qoladi | `obj.f ? obj.f() : standart()` |
| Qavslar `this` ni yo'qotadi deb o'ylash | `(obj.f)()` aslida ishlaydi | Guruhlash havolani saqlaydi |
| `typeof x` ni `x === undefined` bilan almashtirish | E'lon qilinmagan `x` da `ReferenceError` | `typeof` havolani tekshiradi |
| `const { f } = obj; f()` | `this` — `undefined` | `obj.f()` |

## Amaliyot

1. `(user.salom = user.salom)()` nima qaytaradi? Jadvaldagi qaysi qatorga mos?
2. `[user.salom][0]()` — `this` nima bo'ladi? Diqqat: bu ham kvadrat qavsli xossa havolasi, lekin `Base` — massiv.
3. `(user?.salom)()` va `user?.salom()` — natijalarni tekshiring.
4. `typeof (aniqlanmagan)` xato beradimi? Guruhlash haqidagi spetsifikatsiya izohi bilan tushuntiring.
5. Babel yoki TypeScript chiqishidan `(0, ...)()` shaklini toping va nima uchun ishlatilganini tushuntiring.

## Rasmiy hujjat

- ECMA-262 — *The Reference Record Specification Type*: <https://tc39.es/ecma262/2026/#sec-reference-record-specification-type>
- ECMA-262 — *Function Calls* (Evaluation): <https://tc39.es/ecma262/2026/#sec-function-calls-runtime-semantics-evaluation>
- ECMA-262 — *EvaluateCall*: <https://tc39.es/ecma262/2026/#sec-evaluatecall>
- ECMA-262 — *Grouping Operator* (Evaluation): <https://tc39.es/ecma262/2026/#sec-grouping-operator-runtime-semantics-evaluation>
- ECMA-262 — *Comma Operator* (Evaluation): <https://tc39.es/ecma262/2026/#sec-comma-operator-runtime-semantics-evaluation>
- ECMA-262 — *The typeof Operator* (Evaluation): <https://tc39.es/ecma262/2026/#sec-typeof-operator-runtime-semantics-evaluation>
- MDN — `this`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
