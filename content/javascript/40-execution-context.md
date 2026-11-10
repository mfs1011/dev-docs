# 40 — Execution context va call stack

[← Oldingi: Intl](39-intl.md) · [Mundarija](README.md) · [Keyingi: Rekursiya va stek →](41-rekursiya.md)

## Tushuncha

Funksiya chaqirilganda dvigatel (engine) ikki narsani eslab qolishi kerak: shu funksiyaning o'zgaruvchilari va ish tugagach **qayerga qaytish**. Buning uchun ECMA-262'da **execution context** (bajarilish konteksti) tushunchasi bor. Kontekstlar **stek**da saqlanadi — **call stack** (chaqiruvlar steki).

MDN (*JavaScript execution model*) har bir agent'da — mustaqil bajaruvchida, taxminan bitta oqim (thread) — uch tuzilmani ajratadi:

| Tuzilma | Nima saqlaydi | Tartib |
| --- | --- | --- |
| **Heap** (uyum) | Obyektlar | — (xotira boshqaruvi, 18-bob) |
| **Queue** (navbat) | Bajariladigan ishlar (job) — event loop | Birinchi kelgan birinchi chiqadi (FIFO) |
| **Stack** (stek) | Execution context'lar | Oxirgi kirgan birinchi chiqadi (LIFO) |

Har job bo'sh stekka birinchi kontekstni qo'yish bilan boshlanadi va stek bo'shaganda tugaydi. Navbat va event loop — keyingi qismda.

### Kontekst nimadan iborat (ECMA-262, 9.4)

Spetsifikatsiya: har vaqt agent'da **ko'pi bilan bitta** kontekst kod bajaradi — *running execution context*. U doim stekning **tepasida**. Boshqa kodga o'tilganda (masalan, funksiya chaqirilganda) yangi kontekst yaratiladi va stekka qo'yiladi.

**Har qanday kontekst** (20-jadval):

| Komponent | Vazifasi |
| --- | --- |
| code evaluation state | Kodni bajarish, to'xtatish va davom ettirish uchun kerakli holat |
| Function | Funksiya kodi bo'lsa — o'sha funksiya obyekti; skript yoki modul bo'lsa — `null` |
| Realm | Kod foydalanadigan resurslar: o'rnatilgan obyektlar (`Array`, `Array.prototype` …), global obyekt |
| ScriptOrModule | Kod qaysi skript yoki moduldan kelgani |

**ECMAScript kodi konteksti** qo'shimcha (21-jadval):

| Komponent | Vazifasi |
| --- | --- |
| LexicalEnvironment | Kod ichidagi nomlarni (identifier) topish uchun Environment Record (43-bob) |
| VariableEnvironment | `var` bilan yaratilgan bog'lanishlar (44-bob) |
| PrivateEnvironment | Eng yaqin klassdagi `#private` nomlar; klass bo'lmasa — `null` |

Generator konteksti yana `Generator` komponentiga ega.

ECMA-262 muhim izoh beradi: execution context — **faqat spetsifikatsiya vositasi**. U dvigatelning biror aniq tuzilmasiga mos kelishi shart emas va **JavaScript kodidan uni to'g'ridan-to'g'ri ko'rib yoki o'qib bo'lmaydi**. Biz faqat uning izlarini ko'ramiz — xato stekida (stack trace).

MDN qisqacha: kontekst (stek freymi) — kod holati, kod qaysi modul/funksiyaga tegishli, realm, bog'lanishlar (`var`, `let`, `const`, funksiya, klass, `#private` nomlar) va `this`.

## Kod: stekni ko'rish

MDN'dagi misol. `foo` ichida `new Error().stack` — shu paytdagi stek:

```js
function foo(b) {
  const a = 10;
  console.log(new Error('stek').stack.split('\n').slice(0, 4).join('\n'));  // hozirgi stek
  return a + b + 11;
}
function bar(x) {
  const y = 3;
  return foo(x * y);
}
const baz = bar(7);
console.log('baz =', baz);
```

```text
$ node stek.mjs
Error: stek
    at foo (file:///root/js/stek.mjs:3:15)
    at bar (file:///root/js/stek.mjs:8:10)
    at file:///root/js/stek.mjs:10:13
baz = 42
```

MDN bo'yicha qadamlar:

1. Job boshlanadi — birinchi freym (modul): unda `foo`, `bar`, `baz`.
2. `bar(7)` — ikkinchi freym: `x = 7`, `y = 3`.
3. `foo(21)` — uchinchi freym: `b = 21`, `a = 10`. Stek tepasida — `foo`.
4. `foo` qaytdi — freym stekdan olinadi, `foo(x * y)` qiymati 42 bo'ladi. Keyin `bar` qaytadi, `baz = 42`, oxirida modul freymi chiqadi — stek bo'sh.

Stack trace — xuddi shu stek, tepadan pastga: `foo` ← `bar` ← modul (nomsiz qator).

## Kod: stek to'lishi

Stek cheksiz emas. To'xtamaydigan rekursiya uni to'ldiradi:

```js
let chuqurlik = 0;
function pastga() { chuqurlik++; pastga(); }
try { pastga(); } catch (e) { console.log(e.name + ': ' + e.message, '| chuqurlik:', chuqurlik); }

// .mjs — modul, u doim strict rejimda (4-bob). factorial — dum chaqiruv (tail call)
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}
try { console.log(factorial(10)); factorial(100000); } catch (e) { console.log('factorial(100000):', e.name + ': ' + e.message); }
```

```text
$ node toshish.mjs
RangeError: Maximum call stack size exceeded | chuqurlik: 12528
3628800
factorial(100000): RangeError: Maximum call stack size exceeded
```

- ~12 500 chuqurlikda `RangeError: Maximum call stack size exceeded`. Aniq son spetsifikatsiyada yo'q — dvigatel, muhit va freym o'lchamiga bog'liq.
- `factorial` oxirida faqat o'zini chaqiradi — **dum chaqiruv** (tail call). MDN: strict rejimda spetsifikatsiya bunday chaqiruvda joriy kontekstni **almashtirishni** (yangi freym qo'shmaslikni) talab qiladi — *proper tail call*. Lekin bu faqat Safari'da (JavaScriptCore) amalga oshirilgan. Node (V8) da `factorial(100000)` baribir stekni to'ldirdi.

## Kod: generator — to'xtatilgan kontekst

```js
function* gen() {
  console.log('gen ichida 1:', new Error().stack.split('\n')[1].trim());
  yield;
  console.log('gen ichida 2:', new Error().stack.split('\n')[1].trim());
}
const g = gen();                           // kontekst yaratildi, lekin to'xtatilgan — hech narsa chiqmaydi
console.log('gen() chaqirildi');
g.next();
console.log('yield dan keyin — gen konteksti stekdan chiqdi, lekin yo\'qolmadi');
g.next();
```

```text
$ node generator.mjs
gen() chaqirildi
gen ichida 1: at gen (file:///root/js/generator.mjs:2:32)
yield dan keyin — gen konteksti stekdan chiqdi, lekin yo'qolmadi
gen ichida 2: at gen (file:///root/js/generator.mjs:4:32)
```

MDN: freym stekdan olinsa ham har doim yo'qolmaydi. `gen()` chaqirilganda kontekst yaratiladi, lekin **to'xtatilgan** holda — ichidagi kod bajarilmaydi. `g.next()` uni stekka qaytaradi va kod `yield` gacha ishlaydi. Keyin kontekst yana stekdan chiqadi, lekin generator uni saqlab qoladi. Keyingi `next()` — aynan to'xtagan joydan davom (generatorlar — 80-bob).

## Kod: stack trace uzunligi

```js
function a(n) { if (n === 0) throw new Error('chuqurda'); a(n - 1); }
try { a(20); } catch (e) { console.log('qatorlar soni:', e.stack.split('\n').length - 1, '| Error.stackTraceLimit =', Error.stackTraceLimit); }
Error.stackTraceLimit = 30;
try { a(20); } catch (e) { console.log('limit 30 bilan:', e.stack.split('\n').length - 1); }
```

```text
$ node limit.mjs
qatorlar soni: 10 | Error.stackTraceLimit = 10
limit 30 bilan: 25
```

`Error.stackTraceLimit` — stack trace'ga nechta freym yozilishi. MDN: bu **nostandart** V8 stack trace API qismi (moslik uchun JavaScriptCore'da ham bor). Standart 10: 21 ta `a` chaqiruvidan faqat 10 qator ko'rindi. 30 bilan — 25 qator: 21 ta `a`, modul va Node'ning ichki freymlari. Bu stek chuqurligiga ta'sir qilmaydi — faqat xato matniga nechta qator yozilishiga.

## Nega shunday

Funksiyalar bir-birini chaqiradi va **teskari tartibda** tugaydi: oxirgi chaqirilgan birinchi qaytadi. Bunga eng mos tuzilma — stek. Har freym o'z o'zgaruvchilarini saqlaydi, shuning uchun bir funksiyaning bir nechta chaqiruvi bir-biriga xalaqit bermaydi (rekursiya, 41-bob). JavaScript bitta oqimda ishlaydi: bitta stek, bitta tepadagi kontekst. Shuning uchun job oxirigacha uzilmasdan bajariladi ("run-to-completion").

## Muhandislik nuqtai nazari

### Stack trace — eng arzon tashxis

Xato stekida xato **qayerda** va **qanday yo'l bilan** yetib kelgani yozilgan. Xatoni tutib, faqat `e.message` ni log qilish shu ma'lumotni yo'qotadi — `e.stack` ni saqlang.

### Funksiyalarga nom bering

Stack trace'da nomsiz (anonim) funksiyalar ham chiqadi, lekin nom bilan qaysi kod ekanini tez topasiz.

### Chuqurlikka tayanmang

Stek hajmi muhitga qarab o'zgaradi: Node, brauzer, mobil. Kirish ma'lumotiga qarab chuqurligi o'sadigan rekursiyani (masalan, chuqur ichma-ich JSON) sikl yoki o'z stekingiz bilan yozing (41-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| To'xtash sharti yo'q rekursiya | `RangeError: Maximum call stack size exceeded` | Asosiy holat (base case), sikl |
| Dum chaqiruv stekni tejaydi deb hisoblash | Node va Chrome'da baribir to'ladi | Sikl |
| `catch` da faqat `e.message` ni log qilish | Xato qayerdan kelgani yo'qoladi | `e.stack` |
| Execution context'ni koddan o'qishga urinish | Iloji yo'q — u spetsifikatsiya vositasi | Stack trace, debugger |
| `Error.stackTraceLimit` ni stek hajmi deb o'ylash | Faqat xato matnidagi freymlar soni | Stek hajmi dvigatel cheklovi |

## Amaliyot

1. Uch funksiya bir-birini chaqiradigan kod yozing va eng ichkisida `console.trace()` chaqiring. Natijani MDN misolidagi qadamlar bilan solishtiring.
2. `pastga()` misolidagi chuqurlikni funksiyaga katta lokal o'zgaruvchilar qo'shib o'lchang. Son o'zgaradimi? Nega?
3. `factorial` ni sikl bilan qayta yozing va `factorial(100000)` ni `BigInt` bilan hisoblang.
4. Generator ichida ikkita `yield` qo'yib, har `next()` dan oldin va keyin stack trace'ni chiqaring.
5. `Error.stackTraceLimit = 0` qilib xato chiqaring. `e.stack` da nima qoladi?

## Rasmiy hujjat

- ECMA-262 — *9.4 Execution Contexts*: <https://tc39.es/ecma262/2026/multipage/executable-code-and-execution-contexts.html#sec-execution-contexts>
- MDN — *JavaScript execution model* (Stack and execution contexts, Generators and reentry, Tail calls): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model>
- MDN — `Error.prototype.stack`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stack>
- MDN — `Error.stackTraceLimit`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/stackTraceLimit>
