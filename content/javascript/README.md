# JavaScript chuqur

Bu qo'llanma JavaScript tilini boshidan oxirigacha, **ichidan** tushuntiradi: qiymat va tiplar qanday ishlaydi, `this` nimaga teng bo'ladi, closure nima uchun xotirani ushlab turadi, prototiplar zanjiri qanday ishlaydi, `await` dan keyingi kod qachon bajariladi, Proxy qanday qilib Vue reaktivligiga asos bo'ladi. Maqsad — Vue, React, Angular va Node kodida "nega bunday ishladi?" savoliga o'zingiz javob topa olish.

Har bob batafsil yoziladi: tushuncha, ichki mexanizm (spetsifikatsiya darajasida), haqiqiy ishga tushirilgan misollar, tipik xatolar va mashqlar.

> **Holat.** Qo'llanma tayyorlanmoqda — quyida rejalashtirilgan mundarija (ko'rib chiqish uchun).

## Manbalar va versiyalar

2026-10-15 da tekshirilgan:

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Til standarti | **ECMAScript 2026** (ECMA-262, 17-nashr) | <https://tc39.es/ecma262/2026/> — oxirgi chiqqan nashr; <https://tc39.es/ecma262/> — 2027 qoralamasi |
| Yangi imkoniyatlar | ES2026 va ES2027 ro'yxati | TC39 *Finished Proposals*: <https://github.com/tc39/proposals/blob/main/finished-proposals.md> |
| Node.js | **26.12.0** (2026-10-28 dan LTS; V8 14.6) — kitob shu vaqt ichida yoziladi, shuning uchun 24 emas | Node Release jadvali: <https://github.com/nodejs/Release> (`schedule.json`); <https://nodejs.org/en/about/previous-releases> |
| Asosiy hujjat | MDN JavaScript Guide va Reference | <https://developer.mozilla.org/en-US/docs/Web/JavaScript> (manbasi: <https://github.com/mdn/content>) |
| Brauzer event loop, taymerlar | WHATWG HTML Standard | <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops> |
| Mavzular qamrovi | javascript.info (The Modern JavaScript Tutorial) | <https://javascript.info/> — faqat **mavzular ro'yxati** sifatida, quyida batafsil |

**Manbalar tartibi.**

- **Faktlar** — faqat rasmiy manbadan: ECMA-262 (til qanday ishlashini aniqlaydigan standart), MDN, WHATWG HTML (brauzer), Node.js hujjati. Munozarali joyda spetsifikatsiya hal qiladi.
- **javascript.info** — rasmiy manba emas (Ilya Kantor'ning darsligi). Foydalanuvchi so'rovi bilan (2026-10-15) u **qamrov ro'yxati** sifatida ishlatiladi: undagi til mavzularining hammasi bu qo'llanmada bor (o'ng ustunda havola). Uning litsenziyasi matnni faqat o'qishga ruxsat beradi — shuning uchun matn va misollar **ko'chirilmaydi**, har bob o'zimizcha, rasmiy manba asosida yoziladi.
- `javascript.info` ustunida `—` — mavzu u yerda yo'q, rasmiy hujjat asosida qo'shilgan.

**ES2026 yangiliklari** (TC39, nashr yili 2026): `Map`/`WeakMap` uchun upsert (`getOrInsert`), `JSON.parse` manba matni, `Iterator.concat`, `Uint8Array` ↔ Base64/hex, `Math.sumPrecise`, `Error.isError`, `Array.fromAsync`.

**ES2027 ga yakunlangan** (standartga kirgan, nashr hali chiqmagan): Temporal, Explicit Resource Management (`using`), iterator chunking, `Iterator.zip` va boshqalar. Ular bobda alohida belgilanadi; Node va brauzerlarda qo'llab-quvvatlanishi har bobni yozishdan oldin tekshiriladi.

**Sinash.** Misollar Node.js'da ishga tushiriladi, brauzerga xoslari — Chrome'da. Chiqish natijalari haqiqiy.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 01 | [JavaScript, ECMAScript va TC39](01-javascript-va-ecmascript.md) | Til va standart farqi, engine va host, nashrlar, taklif bosqichlari (Stage 0–4) | ECMA-262 *Introduction*; MDN *JavaScript technologies overview*; TC39 *Process document* | `/intro`, `/manuals-specifications` |
| 02 | [Ishga tushirish muhiti](02-ishga-tushirish-muhiti.md) | Brauzer konsoli, Node REPL, debugger, breakpoint | Chrome DevTools *Console*; Node.js *REPL*, *Debugger* | `/devtools`, `/debugging-chrome` |
| 03 | [Kod tuzilishi](03-kod-tuzilishi.md) | Ifoda va instruksiya, nuqta-vergul va ASI tuzoqlari, izohlar | MDN *Lexical grammar* | `/structure`, `/comments` |
| 04 | [Strict mode](04-strict-mode.md) | `"use strict"` nimani o'zgartiradi, modul va klasslarda avtomatik | MDN *Strict mode* | `/strict-mode` |

## II qism — Asoslar (5–15)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 05 | [O'zgaruvchilar](05-ozgaruvchilar.md) | `let`, `const`, nomlash, o'zgarmas havola va o'zgarmas qiymat farqi | MDN `let`, `const`; *Grammar and types* | `/variables` |
| 06 | [Ma'lumot tiplari](06-malumot-tiplari.md) | 7 primitiv + obyekt, `typeof` va uning g'alati javoblari (`null`) | MDN *JavaScript data types and data structures* | `/types` |
| 07 | [Tip o'zgartirish](07-tip-ozgartirish.md) | Satrga, songa, mantiqiyga o'tkazish qoidalari; truthy/falsy | ECMA-262 7.1 (*Type Conversion*); MDN *Data types* ("Type coercion") | `/type-conversions` |
| 08 | [Operatorlar va matematika](08-operatorlar.md) | Unar `+`, ustunlik, `**`, inkrement, bit operatorlar, vergul | MDN *Expressions and operators*, *Operator precedence* | `/operators` |
| 09 | [Taqqoslash](09-taqqoslash.md) | `<`, `>`, satrlarni taqqoslash, `null`/`undefined` tuzoqlari, `==` va `===` | MDN *Equality comparisons and sameness* | `/comparison` |
| 10 | [Mantiqiy operatorlar va `??`](10-mantiqiy-operatorlar.md) | `||`, `&&` qiymat qaytaradi, qisqa tutashuv, `??` va `||` farqi, `??=` | MDN *Logical OR/AND*, *Nullish coalescing* | `/logical-operators`, `/nullish-coalescing-operator` |
| 11 | [Shartlar](11-shartlar.md) | `if`, ternar, `switch` va qat'iy tenglik | MDN *Control flow and error handling* | `/ifelse`, `/switch` |
| 12 | [Sikllar](12-sikllar.md) | `while`, `for`, `break`/`continue`, label'lar | MDN *Loops and iteration*, `label` | `/while-for` |
| 13 | [Funksiyalar asoslari](13-funksiyalar-asoslari.md) | E'lon va ifoda, parametrlar, default qiymat, `return`, hoisting farqi | MDN *Functions* (Guide) | `/function-basics`, `/function-expressions` |
| 14 | [Arrow funksiyalar](14-arrow-funksiyalar.md) | Qisqa sintaksis, qachon ishlatiladi (chuqur farqlari — 50-bobda) | MDN *Arrow function expressions* | `/arrow-functions-basics` |
| 15 | [Polyfill va transpilyator](15-polyfill-va-transpilyator.md) | Yangi imkoniyatni eski muhitda ishlatish, Babel nima qiladi | MDN *Polyfill* (glossary); Babel docs | `/polyfills` |

## III qism — Obyektlar (16–24)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 16 | [Obyektlar](16-obyektlar.md) | Literal, xossa nomlari, `in`, `for...in`, kalitlar tartibi | MDN *Working with objects* | `/object` |
| 17 | [Havola va nusxa](17-havola-va-nusxa.md) | Havola bo'yicha saqlash, yuzaki va chuqur nusxa, `structuredClone()` | MDN *Working with objects*, `structuredClone()` | `/object-copy` |
| 18 | [Garbage collection](18-garbage-collection.md) | Erishib bo'ladiganlik (reachability), mark-and-sweep, nima xotirada qoladi | MDN *Memory management* | `/garbage-collection` |
| 19 | [Metodlar va `this`](19-metodlar-va-this.md) | `this` qoidalari, chaqiruv vaqtida aniqlanishi, arrow'da `this` yo'qligi | MDN `this` | `/object-methods` |
| 20 | [Konstruktor va `new`](20-konstruktor-va-new.md) | `new` bosqichlari, `new.target`, konstruktordan qaytarish | MDN `new`, `new.target` | `/constructor-new` |
| 21 | [Optional chaining](21-optional-chaining.md) | `?.`, `?.()`, `?.[]`, qachon ishlatmaslik | MDN *Optional chaining* | `/optional-chaining` |
| 22 | Symbol | Noyob kalit, yashirin xossa, `Symbol.for`, well-known symbol'lar | MDN `Symbol` | `/symbol` |
| 23 | Obyektdan primitivga | `ToPrimitive` algoritmi, hint'lar, `Symbol.toPrimitive`, `valueOf`/`toString` | ECMA-262 *ToPrimitive*; MDN `Symbol.toPrimitive` | `/object-toprimitive` |
| 24 | Reference Type | `obj.method()` va `(obj.method)()` farqi, nega `this` "yo'qoladi" — spetsifikatsiyadagi Reference Record | ECMA-262 *The Reference Record Specification Type* | `/reference-type` |

## IV qism — Ma'lumot turlari (25–39)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 25 | Primitivlarning metodlari | Primitiv qanday qilib metodga ega: vaqtinchalik o'rov obyekt | MDN *Primitive* (glossary); ECMA-262 6.1 | `/primitives-methods` |
| 26 | Number | IEEE 754, `0.1 + 0.2`, `NaN`, `-0`, `Number.EPSILON`, xavfsiz butun son, `Math`, `Math.sumPrecise` (ES2026) | MDN *Numbers and strings*, `Number`, `Math` | `/number` |
| 27 | BigInt | Katta butun sonlar, `Number` bilan aralashtirish, JSON'da | MDN `BigInt` | `/bigint` |
| 28 | Satrlar | O'zgarmaslik, qidirish, kesish, taqqoslash, `localeCompare`, template literal, tagged template | MDN `String`, *Template literals* | `/string` |
| 29 | Unicode va satr ichki tuzilishi | UTF-16, code unit va code point, surrogate juftlar, emoji, normalizatsiya | ECMA-262 *The String Type*; MDN `String` ("UTF-16 characters...") | `/unicode` |
| 30 | Massivlar | Ichki tuzilishi, `length`, siyrak massiv, unumdorlik | MDN *Indexed collections*, `Array` | `/array` |
| 31 | Massiv metodlari | `map`/`filter`/`reduce`, `sort` tuzoqlari, o'zgartirmaydigan metodlar (`toSorted`, `with`), `findLast`, `Array.fromAsync` (ES2026) | MDN `Array` | `/array-methods` |
| 32 | Iterable obyektlar | Iteration protocol, `Symbol.iterator`, array-like va iterable farqi | MDN *Iteration protocols* | `/iterable` |
| 33 | `Map` va `Set` | `Map` vs obyekt, `Set` metodlari (ES2025), upsert (ES2026) | MDN *Keyed collections* | `/map-set` |
| 34 | `WeakMap` va `WeakSet` | Kuchsiz havola, kesh va metama'lumot uchun | MDN `WeakMap`, `WeakSet` | `/weakmap-weakset` |
| 35 | `Object.keys`, `values`, `entries` | Obyektni aylantirish, `Object.fromEntries`, `Object.groupBy` | MDN `Object` | `/keys-values-entries` |
| 36 | Destructuring | Massiv va obyekt, default qiymatlar, ichma-ich, funksiya parametrlarida | MDN *Destructuring* | `/destructuring-assignment` |
| 37 | Sana va vaqt | `Date` muammolari (oylar 0 dan, vaqt zonasi), Temporal (ES2027) | MDN *Representing dates & times*, `Date`, `Temporal` | `/date` |
| 38 | JSON | `parse`/`stringify`, replacer va reviver, `toJSON`, katta sonlar, manba matni (ES2026) | MDN `JSON` | `/json` |
| 39 | Intl | Raqam, valyuta, sana, ro'yxat formatlash, `Intl.Segmenter`, o'zbek tili (`uz`) | MDN *Internationalization* | — |

## V qism — Funksiyalar chuqur (40–51)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 40 | Execution context va call stack | Global va funksiya konteksti, stek, kontekst nimadan iborat (spetsifikatsiya bo'yicha) | ECMA-262 *Execution Contexts*; MDN *Execution model* ("Stack and execution contexts") | — |
| 41 | Rekursiya va stek | Rekursiya stekda qanday ko'rinadi, chuqurlik chegarasi, rekursiv tuzilmalar | MDN *Functions* ("Recursion"), *Execution model* | `/recursion` |
| 42 | Rest va spread | `...args`, `arguments` obyekti, spread massiv va obyektda | MDN *Rest parameters*, *Spread syntax* | `/rest-parameters-spread` |
| 43 | Leksik muhit va closure | Environment Record, `[[Environment]]`, closure qanday hosil bo'ladi, sikldagi klassik xato | ECMA-262 *Environment Records*; MDN *Closures* | `/closure` |
| 44 | Eski `var` | Funksiya scope, hoisting, IIFE, nega endi ishlatilmaydi | MDN `var` | `/var` |
| 45 | Global obyekt | `globalThis`, `window`, Node'da `global`, global o'zgaruvchilar | MDN `globalThis` | `/global-object` |
| 46 | Funksiya obyekti | `name`, `length`, xossalar, Named Function Expression | MDN `Function` | `/function-object` |
| 47 | `new Function` va `eval` | Satrdan kod, closure'siz scope, xavfsizlik | MDN `Function()` konstruktori, `eval()` | `/new-function`, `/eval` |
| 48 | `setTimeout` va `setInterval` | Rejalashtirish, nolinchi kechikish, ichma-ich `setTimeout`, brauzer va Node farqi | WHATWG HTML *Timers*; Node.js *Timers* | `/settimeout-setinterval` |
| 49 | Dekoratorlar va `call`/`apply` | Wrapper funksiyalar, kesh dekoratori, kontekstni uzatish | MDN `Function.prototype.call`, `apply` | `/call-apply-decorators` |
| 50 | `bind` va partial | Kontekstni bog'lash, qisman qo'llash (partial application), currying | MDN `Function.prototype.bind` | `/bind`, `/currying-partials` |
| 51 | Arrow funksiyalar chuqur | O'z `this`, `arguments`, `super`, `new` yo'qligi va bundan foyda | MDN *Arrow function expressions* | `/arrow-functions` |

## VI qism — Xossalar va prototiplar (52–58)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 52 | Property flag'lari va descriptor'lar | `writable`, `enumerable`, `configurable`, `defineProperty`, `freeze`/`seal` | MDN `Object.defineProperty` | `/property-descriptors` |
| 53 | Getter va setter | Accessor xossalar, aqlli getter/setter, moslik uchun | MDN `get`, `set` | `/property-accessors` |
| 54 | Prototip merosi | `[[Prototype]]`, `__proto__`, `this` prototipda, `for...in` va meros | MDN *Inheritance and the prototype chain* | `/prototype-inheritance` |
| 55 | `F.prototype` | Konstruktor funksiyaning `prototype` xossasi, `constructor` | MDN *Inheritance and the prototype chain* | `/function-prototype` |
| 56 | Native prototiplar | `Object.prototype`, built-in prototiplar, ularni o'zgartirish xavfi | MDN *Inheritance and the prototype chain* | `/native-prototypes` |
| 57 | Prototip metodlari | `Object.create`, `getPrototypeOf`/`setPrototypeOf`, `__proto__`siz "toza" obyekt | MDN `Object.create` | `/prototype-methods` |
| 58 | Sanaluvchanlik va egalik | Own va meros xossalar, qaysi metod nimani ko'radi (jadval) | MDN *Enumerability and ownership of properties* | — |

## VII qism — Klasslar (59–65)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 59 | Klass sintaksisi | Klass — funksiya, metodlar prototipda, maydonlar, getter/setter | MDN *Using classes*, *Classes* | `/class` |
| 60 | Klass merosi | `extends`, `super`, konstruktorni almashtirish, `[[HomeObject]]` | MDN `extends`, `super` | `/class-inheritance` |
| 61 | Static | Statik metod va xossalar, static blok, statik meros | MDN `static`, *Static initialization blocks* | `/static-properties-methods` |
| 62 | Private va protected | `#private` maydon va metodlar, `#x in obj`, "protected" kelishuvi | MDN *Private elements* | `/private-protected-properties-methods` |
| 63 | Built-in klasslarni kengaytirish | `Array`, `Error`, `Map` dan meros, `Symbol.species` | MDN `extends`, `Symbol.species` | `/extend-natives` |
| 64 | `instanceof` | Qanday ishlaydi, `Symbol.hasInstance`, `Object.prototype.toString` bilan tip aniqlash | MDN `instanceof`, `Symbol.hasInstance` | `/instanceof` |
| 65 | Mixin'lar | Bir nechta manbadan xulq qo'shish, mixin klasslar | MDN `extends` ("Mix-ins") | `/mixins` |

## VIII qism — Xatolar (66–67)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 66 | `try...catch` | `finally`, xato obyekti, `throw`, qayta tashlash, global xato ushlagichlar | MDN *Control flow and error handling*, `try...catch` | `/try-catch` |
| 67 | O'z xato klasslari | `Error` dan meros, xatoni o'rash, `cause`, `AggregateError`, `Error.isError` (ES2026) | MDN `Error` | `/custom-errors` |

## IX qism — Asinxronlik (68–79)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 68 | Callback'lar | Asinxron kod nima, "callback hell" va nega Promise kerak bo'ldi | MDN *Using promises* | `/callbacks` |
| 69 | Promise | Holatlar, `resolve`/`reject`, `then`/`catch`/`finally` | MDN *Using promises*, `Promise` | `/promise-basics` |
| 70 | Promise zanjiri | Zanjirda qiymat va promise qaytarish, thenable | MDN *Using promises* ("Chaining") | `/promise-chaining` |
| 71 | Promise'da xatolar | Yashirin `try...catch`, qayta tashlash, `unhandledrejection` | MDN *Using promises*; `unhandledrejection` hodisasi | `/promise-error-handling` |
| 72 | Promise API | `all`, `allSettled`, `any`, `race`, `withResolvers`, `Promise.try` (ES2025) | MDN `Promise` | `/promise-api` |
| 73 | Promisification | Callback funksiyani Promise'ga o'rash, Node'da `util.promisify` | MDN *Using promises* ("Creating a Promise around an old callback API"); Node.js `util.promisify` | `/promisify` |
| 74 | Microtask'lar | Promise handler'lari qachon bajariladi, microtask navbati | ECMA-262 *Jobs*; MDN *Using microtasks* | `/microtask-queue` |
| 75 | `async`/`await` | Ichki ishlashi, xatolar, ketma-ket va parallel, top-level `await` | MDN *async function*, `await` | `/async-await` |
| 76 | Event loop: spetsifikatsiya | Agent, job queue, "run-to-completion", nega bloklamaslik kerak | MDN *Execution model* ("Job queue and event loop") | — |
| 77 | Brauzerda event loop | Macrotask va microtask, rendering qachon, og'ir vazifani bo'lish | WHATWG HTML *Event loops*; MDN *In depth: Microtasks* | `/event-loop` |
| 78 | Node.js'da event loop | Fazalar, `process.nextTick`, `setImmediate` va `setTimeout` | Node.js *The Node.js Event Loop* | — |
| 79 | Bekor qilish | `AbortController` va `AbortSignal`, timeout, `fetch`ni bekor qilish | MDN `AbortController`, `AbortSignal` | `/fetch-abort` |

## X qism — Generatorlar va iteratsiya (80–82)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 80 | Generatorlar | `function*`, `yield`, generator — iterable, `yield*`, ichkariga qiymat yuborish | MDN *Iterators and generators* | `/generators` |
| 81 | Asinxron iteratsiya | `Symbol.asyncIterator`, async generator, `for await...of`, sahifalab yuklash | MDN *Iteration protocols*, `for await...of` | `/async-iterators-generators` |
| 82 | Iterator helper'lari | `Iterator` global (ES2025): `map`/`filter`/`take`..., `Iterator.concat` (ES2026), dangasa hisoblash | MDN `Iterator` | — |

## XI qism — Modullar (83–86)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 83 | Modullar kirish | Modul nima, o'z scope'i, bir marta bajarilishi, `import.meta`, brauzerda `type="module"` | MDN *JavaScript modules* | `/modules-intro` |
| 84 | Export va import | Nomli va default, qayta eksport, import attributes va JSON modullar (ES2025) | MDN `export`, `import` | `/import-export` |
| 85 | Dinamik import | `import()`, kodni bo'lib yuklash | MDN `import()` | `/modules-dynamic-imports` |
| 86 | Node.js'da modullar | ESM va CommonJS, `package.json` `"type"`, o'zaro ishlash | Node.js *ECMAScript modules*, *Modules: CommonJS* | — |

## XII qism — Metaprogramming va xotira (87–90)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 87 | Proxy va Reflect | Trap'lar, invariantlar, `Reflect`, validatsiya va kuzatuvchi, Vue 3 reaktivligi g'oyasi, cheklovlar | MDN *Meta programming*, `Proxy`, `Reflect` | `/proxy` |
| 88 | `WeakRef` va `FinalizationRegistry` | Kuchsiz havola, tozalash qayta chaqiruvi, nega ehtiyotkorlik kerak | MDN `WeakRef`, `FinalizationRegistry` | `/weakref-finalizationregistry` |
| 89 | Resurslarni boshqarish | `using` va `await using`, `Symbol.dispose`, `DisposableStack` (ES2027) | MDN *JavaScript resource management* | — |
| 90 | Xotira oqishini topish | Tipik sabablar (closure, taymer, listener), heap snapshot bilan qidirish | MDN *Memory management*; Chrome DevTools *Fix memory problems* | — |

## XIII qism — Binar ma'lumot (91–92)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 91 | `ArrayBuffer` va typed array'lar | Bufer va ko'rinish, `DataView`, bayt tartibi, `Float16Array` (ES2025), Base64/hex (ES2026) | MDN *JavaScript typed arrays* | `/arraybuffer-binary-arrays` |
| 92 | `TextEncoder` va `TextDecoder` | Satr ↔ baytlar, UTF-8 | WHATWG *Encoding Standard*; MDN `TextDecoder` | `/text-decoder` |

## XIV qism — Regular expressions (93–100)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 93 | Pattern, bayroqlar va metodlar | `RegExp` va literal, bayroqlar, `match`/`matchAll`/`replace`/`split`/`test`/`exec` | MDN *Regular expressions* (Guide), `RegExp` | `/regexp-introduction`, `/regexp-methods` |
| 94 | Belgi sinflari va Unicode | `\d`, `\w`, `.`, `u` va `v` bayroqlari, `\p{...}` | MDN *Character classes*, *Unicode character class escape* | `/regexp-character-classes`, `/regexp-unicode` |
| 95 | Ankerlar va chegaralar | `^`, `$`, `m` bayrog'i, `\b` | MDN *Assertions* | `/regexp-anchors`, `/regexp-multiline-mode`, `/regexp-boundary` |
| 96 | To'plamlar va escape | `[...]`, oraliqlar, maxsus belgilar, `RegExp.escape` (ES2025) | MDN *Character class*, `RegExp.escape` | `/regexp-character-sets-and-ranges`, `/regexp-escaping` |
| 97 | Kvantifikatorlar | `+`, `*`, `?`, `{n,m}`, ochko'z (greedy) va dangasa (lazy) | MDN *Quantifiers* | `/regexp-quantifiers`, `/regexp-greedy-and-lazy` |
| 98 | Guruhlar va alternatsiya | Ushlovchi va nomli guruhlar, backreference, `|`, inline modifier'lar (ES2025) | MDN *Groups and backreferences*, *Disjunction*, *Modifier* | `/regexp-groups`, `/regexp-backreferences`, `/regexp-alternation` |
| 99 | Lookaround va sticky | Lookahead, lookbehind, `y` bayrog'i, pozitsiyadan qidirish | MDN *Lookahead/Lookbehind assertion*, `RegExp.prototype.sticky` | `/regexp-lookahead-lookbehind`, `/regexp-sticky` |
| 100 | Katastrofik backtracking | Nega regex "osilib qoladi", ReDoS, yechimlar | MDN *Regular expressions* (Reference) | `/regexp-catastrophic-backtracking` |

## XV qism — Parallellik (101–102)

| # | Bob | Mazmun | Rasmiy asos | javascript.info |
| --- | --- | --- | --- | --- |
| 101 | Worker'lar | Alohida oqimda JS, `postMessage`, structured clone, Node'da `worker_threads` | MDN *Web Workers API*; Node.js *Worker threads* | — |
| 102 | `SharedArrayBuffer` va `Atomics` | Umumiy xotira, agent clusters, `Atomics.wait`/`notify`, xavfsizlik talablari | MDN *Execution model* ("Agent clusters"), `SharedArrayBuffer`, `Atomics` | — |

---

### javascript.info'dan kiritilmaganlar

- **Brauzer qismi** (DOM, hodisalar, formalar, sahifa yuklanishi, oynalar, tarmoq so'rovlari, saqlash, animatsiya, Web Components; `Blob`/`File`) — bu til emas, brauzer API'lari. Ular alohida qo'llanma mavzusi (masalan, "Brauzer va DOM" yoki "Web asoslari").
- **`alert`/`prompt`/`confirm`** — misollarda `console.log` ishlatiladi.
- **Code editors, Coding style, Ninja code** — muhit va uslub mavzulari; uslub qisman 15-bobda (Babel) eslatiladi, linter alohida emas.
- **Mocha bilan testlash** — alohida "Testlash" qo'llanmasi mavzusi.
- **XMLHttpRequest, long polling, resumable upload** — tarmoq mavzulari, brauzer qo'llanmasiga.
