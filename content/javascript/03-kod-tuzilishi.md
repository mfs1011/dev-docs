# 03 — Kod tuzilishi

[← Oldingi: Ishga tushirish muhiti](02-ishga-tushirish-muhiti.md) · [Mundarija](README.md) · [Keyingi: Strict mode →](04-strict-mode.md)

## Tushuncha

Engine kodni bajarishdan oldin uni ikki bosqichda o'qiydi:

1. **Leksik tahlil** — matnni **tokenlar**ga (eng kichik ma'noli bo'laklarga) ajratish: `const`, `narx`, `=`, `100`, `;`.
2. **Sintaktik tahlil** (parsing) — tokenlardan grammatika qoidalari bo'yicha tuzilma qurish: "bu — o'zgaruvchi e'loni, uning qiymati — ifoda".

Bu bob uch savolga javob beradi: kod qanday bo'laklardan tuziladi, **instruksiya**, **e'lon** va **ifoda** nima, va JavaScript nuqta-vergulni o'zi qanday qo'yadi (**ASI**).

### Leksik grammatika: kod nimalardan iborat

MDN *Lexical grammar* sahifasi JavaScript matnini quyidagi elementlarga ajratadi:

| Element | Misol | Izoh |
| --- | --- | --- |
| Bo'sh joy (white space) | probel, tab | Tokenlarni ajratadi, ma'nosi yo'q |
| Qator tugashi (line terminator) | yangi qator | Ko'pincha ma'nosiz, lekin **ASI uchun muhim** |
| Izohlar | `// ...`, `/* ... */`, `#!...` | Bajarilmaydi |
| Identifikatorlar | `narx`, `$el`, `_id` | O'zgaruvchi, funksiya, xossa nomlari |
| Kalit so'zlar | `const`, `if`, `return` | Tilda maxsus ma'noli so'zlar |
| Literallar | `null`, `true`, `42`, `0xff`, `10n`, `'matn'`, `/re/g`, `` `shablon` `` | Qiymatni to'g'ridan-to'g'ri yozish |

Literallarning har biri keyingi boblarda o'z mavzusi bilan chuqur ochiladi (sonlar — 26, BigInt — 27, satrlar — 28, regex — 93-boblar).

### Izohlar

MDN uch xil izohni ko'rsatadi:

```js
// Qator izohi: shu qatorning oxirigacha

/* Blok izohi —
   bir necha qatorga cho'zilishi mumkin */

console.log("Salom " + ism /* qator o'rtasida ham */ + "!");
```

Uchinchisi — **hashbang** izohi (`#!`). U `//` izohi kabi ishlaydi, lekin **faqat skript yoki modulning eng boshida** to'g'ri bo'ladi, oldida hatto bo'sh joy ham bo'lmasligi kerak. U Unix'dagi *shebang*ga o'xshaydi: terminal faylni qaysi dastur bilan ishga tushirishni shundan biladi. JavaScript engine uchun bu oddiy izoh.

```js
#!/usr/bin/env node
console.log('hashbang izoh sifatida o\'tkazib yuborildi')
```

```text
$ chmod +x hash.mjs
$ ./hash.mjs
hashbang izoh sifatida o'tkazib yuborildi
```

MDN ogohlantirishi: bunday skriptlar shell'da to'g'ridan-to'g'ri ishga tushishi uchun faylni **BOM'siz UTF-8** da saqlang. `#!` ni faqat interpretatorni ko'rsatish uchun ishlating, boshqa hamma joyda `//` yoki `/* */`.

Bitta nozik joy: kamida bitta qator tugashini o'z ichiga olgan blok izohi ASI uchun **yangi qator kabi** hisoblanadi (pastda).

## Tushuncha: instruksiya, e'lon va ifoda

MDN (*Statements and declarations*): har qanday JavaScript dasturi yuqori darajadagi konstruksiyalar ketma-ketligidan iborat. Ular ikki turga bo'linadi — **instruksiyalar** (statements) va **e'lonlar** (declarations). Ularning ichida esa **ifodalar** (expressions) ishlatiladi.

| Tur | Nima qiladi | Misollar |
| --- | --- | --- |
| **E'lon** (declaration) | Nomni qiymatga bog'laydi | `let`, `const`, `function`, `function*`, `async function`, `class`, `import`, `export`, `using` |
| **Instruksiya** (statement) | Amal bajaradi | `if`, `for`, `while`, `return`, `throw`, `try`, blok `{ }`, `var`, ifoda-instruksiya |
| **Ifoda** (expression) | **Qiymatga** hisoblanadi | `2 + 2`, `narx * 1.12`, `f()`, `x = 5`, `() => 1` |

Ifoda — yuqori darajadagi konstruksiya emas: u faqat instruksiya va e'lonlar ichidagi muayyan "o'rinlar"da turadi — `if (ifoda)`, `const x = ifoda`. **Ifoda-instruksiya** (expression statement) sintaksisi ko'p ifodalarni instruksiya sifatida yozishga ruxsat beradi: `console.log(x);` — shunday instruksiya.

### Nega bu farq muhim: `if` ichida `let`

Grammatikada ko'p boshqaruv tuzilmalarining tanasi **faqat instruksiya** qabul qiladi. `let` esa — e'lon:

```js
if (Math.random() > 0.5)
  let i = 0
```

```text
$ node iflet.mjs
.../iflet.mjs:2
  let i = 0
  ^^^

SyntaxError: Lexical declaration cannot appear in a single-statement context
```

`var` esa — **instruksiya** (MDN buni alohida holat deydi: `var` oddiy leksik scope qoidalariga bo'ysunmaydi va qo'shimcha ta'sirlar beradi — 44-bob), shuning uchun `if (shart) var i = 0;` xato bermaydi. Yechim — e'lonni **blok**ga o'rash: `if (shart) { let i = 0; }`.

### Instruksiyalar ham qiymat beradi (lekin ko'rinmaydi)

MDN: instruksiya va e'lonlar ham qiymat hosil qiladi, lekin u deyarli hech qachon ko'rinmaydi — `eval()` bundan istisno. REPL'da `const nom = 'Ali'` ning `undefined` chiqarishi (2-bob) shu bilan bog'liq.

```js
console.log(eval('const x = 1'))
console.log(eval('1 + 2'))
console.log(eval('if (true) { "ha" } else { "yoq" }'))
```

```text
$ node ifoda.mjs
undefined
3
ha
```

E'lonning qiymati — `undefined`, ifodaniki — natija, `if` instruksiyasiniki esa — ichida oxirgi bajarilgan ifodaning qiymati. Amalda bu faqat REPL va `eval` da ko'rinadi; `eval` ning o'zi 47-bobda.

## Tushuncha: avtomatik nuqta-vergul (ASI)

Ba'zi instruksiyalar sintaksisi oxirida `;` talab qiladi (MDN ro'yxati): `var`, `let`, `const`, `using`; ifoda-instruksiyalar; `do...while`; `continue`, `break`, `return`, `throw`; `debugger`; klass maydonlari; `import`, `export`.

Lekin JavaScript ba'zi "noto'g'ri" token ketma-ketliklarini o'zi to'g'rilaydi — **avtomatik nuqta-vergul qo'yish** (*Automatic Semicolon Insertion*, ASI). Bu tokenlarga ajratilgandan keyin bo'ladi. MDN uchta qoidani beradi:

**1-qoida.** Grammatikada ruxsat etilmagan token uchrasa va u oldingi tokendan **kamida bitta qator tugashi** bilan ajralgan bo'lsa (yoki u `}` bo'lsa), uning oldiga `;` qo'yiladi.

```js
{ 1
2 } 3

// ASI dan keyin:
{ 1
;2 ;} 3;
```

Istisnolar: `for (...)` sarlavhasidagi ajratgichlar hech qachon avtomatik qo'yilmaydi; avtomatik `;` hech qachon **bo'sh instruksiya** bo'lib qolmaydi.

**2-qoida.** Kiritish oxiriga yetilganda dastur to'liq bo'lmasa, oxiriga `;` qo'yiladi: `const a = 1` → `const a = 1;`.

**3-qoida.** Grammatika **qator tugashini taqiqlagan** joyda qator tugashi uchrasa, `;` qo'yiladi. Bunday joylar (MDN):

```text
ifoda <bu yerda> ++          ifoda <bu yerda> --
continue <bu yerda> label    break <bu yerda> label
return <bu yerda> ifoda      throw <bu yerda> ifoda
yield <bu yerda> ifoda       yield <bu yerda> * ifoda
(param) <bu yerda> => {}
async <bu yerda> function    async <bu yerda> (param) => {}
using <bu yerda> id
```

## Kod: ASI tuzoqlari (Node 26 da)

### `return` dan keyin yangi qator

```js
function narx() {
  return
    100 * 1.12
}
console.log(narx())
```

```text
$ node return.mjs
undefined
```

3-qoida: `return` va ifoda orasida qator tugashi bo'lishi mumkin emas, shuning uchun `return;` bo'ladi. `100 * 1.12` — hech qachon bajarilmaydigan qator. Xato ham, ogohlantirish ham yo'q — eng xavfli tomoni shu.

### `++` boshqa qatorda

```js
let a = 1, b = 5, c = 10
a = b
++c
console.log(a, b, c)
```

```text
$ node inkrement.mjs
5 5 11
```

`b` va `++` orasida qator tugashi — 3-qoida bo'yicha `a = b;` va `++c;` bo'ladi. `++` `b` ga emas, `c` ga tegishli bo'lib qoldi.

### ASI **ishlamaydigan** holat: qator `(` yoki `[` bilan boshlanadi

MDN muhim narsani ta'kidlaydi: ASI faqat qator tugashi **noto'g'ri sintaksis** beradigan joyda ishlaydi. Agar keyingi token oldingi qatorning davomi sifatida to'g'ri o'qilsa, `;` **qo'yilmaydi**.

```js
const salom = 'salom'
(function () {
  console.log('IIFE ishladi')
})()
```

```text
$ node qavs.mjs
.../qavs.mjs:2
(function () {
^

TypeError: "salom" is not a function
```

Engine buni `const salom = 'salom'(function () {...})()` deb o'qidi — satrni funksiya sifatida chaqirishga urindi.

```js
const a = 1
[1, 2, 3].forEach(n => console.log(n))
```

```text
$ node kvadrat.mjs
.../kvadrat.mjs:2
[1, 2, 3].forEach(n => console.log(n))
          ^

TypeError: Cannot read properties of undefined (reading 'forEach')
```

Bu `const a = 1[1, 2, 3].forEach(...)` bo'ldi: `1[1, 2, 3]` — vergul operatori bilan `1[3]` ga teng xossa murojaati, natija `undefined`, undan `.forEach` o'qishga urinish — xato.

MDN ro'yxati: qator `(`, `[`, `` ` ``, `+`, `-` yoki `/` (regex) bilan boshlansa, u oldingi qatorga qo'shilib ketishi mumkin. Nuqta-vergulsiz uslubda bunday qator boshiga `;` qo'yiladi:

```js
const salom = 'salom'
;(function () {
  console.log('IIFE ishladi')
})()
;[1, 2, 3].forEach(n => console.log(n))
```

```text
$ node ok.mjs
IIFE ishladi
1
2
3
```

### Klass maydonlari

```js
class A {
  a = 1
  *gen() {}
}
```

MDN: bu `a = 1 * gen() {}` deb o'qiladi va `{` atrofida sintaksis xatosi beradi. Klass maydonlarini doim `;` bilan tugatish tavsiya etiladi (59-bob).

## Nega shunday

ASI tilni "yengilroq va qulayroq" qilish uchun qo'shilgan (MDN). Lekin u **taxmin qiluvchi** mexanizm emas — qat'iy uchta qoida. Shuning uchun natija ba'zan dasturchi kutganidan farq qiladi: engine kodni sizning niyatingiz bo'yicha emas, grammatika bo'yicha o'qiydi.

Ikki uslub mavjud va ikkalasi ham to'g'ri ishlaydi, agar qoidalar bilinsa:

| Uslub | Nimaga e'tibor berish kerak |
| --- | --- |
| Har instruksiya oxirida `;` | `return`/`throw`/`yield`/`break`/`continue` dan keyin yangi qator baribir xavfli (3-qoida `;` bor-yo'qligiga qaramaydi) |
| `;` siz | Qator `(`, `[`, `` ` ``, `+`, `-`, `/` bilan boshlansa — boshiga `;`; klass maydonlari |

E'tibor bering: **`return` tuzog'i ikkala uslubda ham bor**. `;` qo'yib yozish uni hal qilmaydi.

## Muhandislik nuqtai nazari

### Qoidani odam emas, vosita kuzatsin

ASI va uslub masalasini jamoada bahs bilan emas, avtomatik formatlovchi va linter bilan hal qilinadi: ular `;` ni bir xil qo'yadi yoki olib tashlaydi va xavfli joylarni (masalan, `return` dan keyingi yetib bo'lmaydigan kod) belgilaydi. Bu boblarda aniqlik uchun `;` siz misollar ham bor — ular ASI'ni ko'rsatish uchun atayin shunday yozilgan.

### Ko'p qatorli `return`

Qaytarilayotgan ifoda uzun bo'lsa, uni qavs bilan boshlang — qavs `return` bilan bir qatorda:

```js
function foydalanuvchi() {
  return (
    ism.trim() +
    ' ' +
    familiya.trim()
  )
}
```

Xuddi shu qoida `throw`, `yield`, arrow funksiyadagi `=>` (parametrlar bilan bir qatorda) va `async` (keyingi so'z bilan bir qatorda) uchun ham amal qiladi.

## Tipik xatolar

| Xato | Nima bo'ladi | To'g'ri yo'l |
| --- | --- | --- |
| `return` dan keyin yangi qatorda ifoda | Funksiya `undefined` qaytaradi, jim | Ifodani `return` bilan bir qatorda yoki `return (` |
| `;` siz uslubda qator `(` yoki `[` bilan boshlanadi | Oldingi qator bilan qo'shiladi: `... is not a function` | Qator boshiga `;` |
| `if (...) let x = ...` | `SyntaxError: Lexical declaration cannot appear...` | Blok: `if (...) { let x = ... }` |
| `++`/`--` ni alohida qatorga yozish | Boshqa o'zgaruvchiga tegishli bo'lib qoladi | Operand bilan bir qatorda |
| Hashbang'ni ikkinchi qatorga yoki bo'sh joydan keyin yozish | Sintaksis xatosi | Faqat fayl boshida, birinchi belgi |

## Amaliyot

1. Quyidagi kodni ishga tushirmasdan, nima chiqishini ayting, keyin tekshiring:
   ```js
   const x = 1
   const y = x
   (x + 1).toString()
   ```
2. `return` tuzog'ini `throw` bilan takrorlang: `throw` dan keyin yangi qatorga `new Error('x')` yozing. Qanday xato chiqadi?
3. Har biri qaysi tur — e'lon, instruksiya yoki ifoda: `class A {}`, `x = 5`, `for (;;) {}`, `() => 1`, `import fs from 'fs'`, `{}`.
4. `#!/usr/bin/env node` bilan boshlanadigan skript yozing, `chmod +x` qilib, `./skript.mjs` bilan ishga tushiring.
5. MDN ro'yxatidan foydalanib, `;` siz uslubda yozilgan o'z kodingizdan ASI xavfi bor joylarni toping.

## Rasmiy hujjat

- MDN — *Lexical grammar* (izohlar, hashbang, ASI): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar>
- MDN — *Statements and declarations* ("What are statements, declarations, and expressions?"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements>
- MDN — *Expression statement*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/Expression_statement>
- ECMA-262 — *Automatic Semicolon Insertion* (12.10): <https://tc39.es/ecma262/2026/#sec-automatic-semicolon-insertion>
- ECMA-262 — *Hashbang Comments*: <https://tc39.es/ecma262/2026/#sec-hashbang>
