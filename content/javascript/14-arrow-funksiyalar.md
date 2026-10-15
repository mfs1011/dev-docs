# 14 — Arrow funksiyalar

[← Oldingi: Funksiyalar asoslari](13-funksiyalar-asoslari.md) · [Mundarija](README.md) · [Keyingi: Polyfill va transpilyator →](15-polyfill-va-transpilyator.md)

## Tushuncha

**Arrow funksiya** (o'q funksiya, `=>`) — MDN: an'anaviy funksiya ifodasining **ixcham muqobili**, lekin ba'zi **semantik farqlar** va **ataylab qo'yilgan cheklovlar** bilan:

- o'zining `this`, `arguments` va `super` bog'lanishlari **yo'q** — shuning uchun **metod** sifatida ishlatilmasligi kerak;
- **konstruktor** bo'la olmaydi — `new` bilan chaqirish `TypeError` beradi; `new.target` ham yo'q;
- tanasida `yield` ishlatib bo'lmaydi, generator bo'la olmaydi.

Bu bob — sintaksis va asosiy ishlatilishi. `this` bilan bog'liq chuqur farq 19- va 51-boblarda.

## Kod: an'anaviy funksiyadan arrow'ga — qadamba-qadam

MDN shu soddalashtirishni ko'rsatadi; har bir qadam — to'g'ri arrow funksiya:

```js
// An'anaviy anonim funksiya
(function (a) {
  return a + 100;
});

// 1. "function" ni olib tashlab, parametr va { orasiga => qo'yamiz
(a) => {
  return a + 100;
};

// 2. { } va "return" ni olib tashlaymiz — qaytarish yashirin
(a) => a + 100;

// 3. Parametr qavslarini olib tashlaymiz
a => a + 100;
```

Qachon nimani tashlab yuborish mumkin (MDN):

- **Parametr qavslari** — faqat **bitta oddiy** parametr bo'lsa. Parametr yo'q, bir nechta, default, destructuring yoki rest bo'lsa — qavs **majburiy**.
- **Tana qavslari `{ }`** — faqat funksiya to'g'ridan-to'g'ri **bitta ifoda** qaytarsa. Tanada instruksiyalar bo'lsa — `{ }` kerak, va u holda `return` **aniq** yoziladi. MDN: arrow funksiya nimani va qachon qaytarishni "taxmin qila olmaydi".

```js
const qosh = (a, b) => a + b;
const kvadrat = x => x * x;
const salom = () => 'Salom!';
const yigindi = (...s) => s.reduce((a, b) => a + b, 0);
const daraja = (a, n = 2) => a ** n;
console.log(qosh(2, 3), kvadrat(4), salom(), yigindi(1, 2, 3), daraja(3));
const ortacha = (sonlar) => {
  const jami = sonlar.reduce((a, b) => a + b, 0);
  return jami / sonlar.length;
};
console.log(ortacha([4, 8, 6]));
const unutilgan = (a, b) => { a + b };
console.log(unutilgan(2, 3));
```

```text
$ node sintaksis.mjs
5 16 Salom! 6 9
6
undefined
```

Oxirgisi — eng ko'p uchraydigan xato: `{ }` qo'yildi, lekin `return` yozilmadi. MDN: blok tana oxiriga `return` siz yetib borsa, funksiya `undefined` qaytaradi.

**Ikki xil tana** (MDN):

| Tana | Ko'rinishi | Qaytarish |
| --- | --- | --- |
| **Ifoda tanasi** (expression body) | `x => x * 2` | Ifoda **yashirin** qaytariladi |
| **Blok tanasi** (block body) | `x => { ... }` | Faqat **aniq** `return` bilan |

## Kod: obyekt qaytarish tuzog'i

```js
const yomon = () => { nom: 'Ali' };
const yaxshi = () => ({ nom: 'Ali' });
console.log(yomon(), yaxshi());
console.log([1, 2, 3].map(n => ({ son: n, kv: n * n })));
```

```text
$ node obyekt.mjs
undefined { nom: 'Ali' }
[ { son: 1, kv: 1 }, { son: 2, kv: 4 }, { son: 3, kv: 9 } ]
```

MDN tushuntirishi: JavaScript `=>` dan keyingi token `{` bo'lmasagina tanani **ifoda** deb biladi. `{` bo'lsa — bu **blok**, ichidagi `nom:` esa **label** (12-bob), `'Ali'` — oddiy ifoda-instruksiya. Natija — `undefined`, xatosiz. Yechim: obyekt literalini **qavsga** o'rang — `({ ... })`.

## Kod: arrow funksiya — callback uchun

Arrow funksiyalarning eng ko'p ishlatiladigan joyi — boshqa funksiyaga beriladigan qisqa funksiyalar:

```js
const narxlar = [12000, 8000, 25000, 4000];
console.log(narxlar.filter(n => n > 5000).map(n => n * 1.12).sort((a, b) => a - b));
setTimeout(() => console.log('taymer ishladi'), 0);
```

```text
[ 8960, 13440.000000000002, 28000.000000000004 ]
taymer ishladi
```

`filter`, `map`, `sort` (31-bob), `setTimeout` (48-bob) — barchasiga bir qatorli funksiya kerak, va arrow sintaksisi shunda o'qishga oson. (`13440.000000000002` — suzuvchi nuqtali son aniqligi, 26-bobda.)

MDN: arrow funksiyalar o'zi **nomsiz**. O'zini chaqirishi (rekursiya) kerak bo'lsa — nomli funksiya ifodasi ishlating; yoki arrow funksiyani o'zgaruvchiga saqlab, o'sha nom orqali murojaat qiling (`const bob2 = (a) => a + 100`).

## Kod: oddiy funksiyadan farqlari (birinchi ko'rinish)

```js
const strelka = () => {};
function oddiy() {}
try { new strelka(); } catch (e) { console.log(e.name + ':', e.message); }
console.log(typeof new oddiy(), 'prototype' in strelka, 'prototype' in oddiy);
const obj = {
  ism: 'Ali',
  oddiyMetod() { return this.ism; },
  strelkaMetod: () => typeof this,
};
console.log(obj.oddiyMetod(), obj.strelkaMetod());
```

```text
$ node farq.mjs
TypeError: strelka is not a constructor
object false true
Ali undefined
```

- **`new` bilan chaqirib bo'lmaydi** — MDN: arrow funksiya konstruktor emas. Uning `prototype` xossasi ham yo'q.
- **Metod sifatida `this` ishlamaydi.** `obj.oddiyMetod()` da `this` — `obj`, shuning uchun `'Ali'`. `strelkaMetod` da esa arrow funksiyaning o'z `this` i yo'q — u **atrofdagi** `this` ni oladi; modulning yuqori darajasida `this` — `undefined`. MDN qoidasi: arrow funksiyalarni metod sifatida ishlatmang.

Bu "o'z `this` i yo'q" xususiyati ba'zan aynan **foydali** — masalan, metod ichidagi callback tashqi `this` ni ko'rishi kerak bo'lganda. Bu 19- (`this`) va 51-bobda (arrow funksiyalar chuqur) to'liq ochiladi.

## Nega shunday

MDN (*Functions* qo'llanmasi): arrow funksiyalarning paydo bo'lishiga **ikki omil** ta'sir qilgan — *qisqaroq funksiyalar* va `this` ning *bog'lanmasligi*:

1. **Qisqalik** — callback'lar uchun `function (x) { return x * 2; }` o'rniga `x => x * 2`.
2. **`this` chalkashligi** — oddiy funksiyada `this` chaqiruv usuliga qarab o'zgaradi (19-bob), callback ichida esa ko'pincha "yo'qoladi". Arrow funksiyaning o'z `this` i yo'qligi uni atrofdagi kodning `this` ini ko'radigan qiladi.

Cheklovlar (konstruktor emas, `yield` yo'q, metod sifatida yaramaydi) — MDN ta'biri bilan "ataylab": arrow funksiya **yengil funksiya** sifatida loyihalangan, oddiy funksiyaning hamma rolini bajarish uchun emas.

## Muhandislik nuqtai nazari

### Qachon arrow, qachon oddiy funksiya

| Vaziyat | Tanlov |
| --- | --- |
| Callback (`map`, `filter`, `then`, hodisa ishlovchisi) | Arrow |
| Metod ichidagi callback tashqi `this` ni ko'rishi kerak | Arrow |
| Obyekt metodi (`this` kerak) | Metod sintaksisi `m() {}` — arrow emas |
| Konstruktor | `class` (59-bob) |
| Generator | `function*` |
| Yuqori darajadagi nomli funksiya | E'lon yoki `const f = () => ...` — loyiha uslubiga qarab |

### Juda uzun zanjirlardan saqlaning

`a => b => c => ...` kabi ichma-ich arrow'lar yoki bir qatorga sig'dirilgan uzun mantiq o'qishni qiyinlashtiradi. Mantiq bir necha qadamdan iborat bo'lsa — blok tana va oraliq o'zgaruvchilar yoki nomli funksiya yaxshiroq.

### Stek izida nom

MDN (`Function.prototype.name`): o'zgaruvchi va metodlar anonim funksiya nomini uning sintaktik o'rnidan "chiqarib oladi" — `const f = () => {}` da `f.name` → `"f"` (46-bob). Bunday nom debugger stekida ham ko'rinadi. Lekin to'g'ridan-to'g'ri uzatilgan anonim callback stekda nomsiz chiqadi — murakkab callback'larga nom bering.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `() => { qiymat }` (`return` siz blok) | `undefined` | `() => qiymat` yoki `return` |
| `() => { nom: 'Ali' }` | `undefined` (label) | `() => ({ nom: 'Ali' })` |
| Arrow funksiyani obyekt metodi qilish | `this` — tashqi kontekst | Metod sintaksisi |
| `new` bilan arrow funksiyani chaqirish | `TypeError: ... is not a constructor` | `class` yoki oddiy funksiya |
| Bir nechta parametrda qavsni tashlab yuborish: `a, b => a + b` | Sintaksis xatosi yoki boshqa ma'no | `(a, b) => a + b` |
| `=>` ni parametrlardan keyin yangi qatorga yozish | `SyntaxError` (3-bob, ASI) | `=>` parametrlar bilan bir qatorda |

## Amaliyot

1. Quyidagilarni arrow funksiyaga aylantiring: `function (x) { return x + 1; }`, `function () { return 42; }`, `function (a, b) { const s = a + b; return s / 2; }`.
2. `foydalanuvchilar.map(f => { ism: f.ism })` nima qaytaradi? Tuzating.
3. `[3, 1, 2].sort((a, b) => a - b)` va `[3, 1, 2].sort((a, b) => b - a)` — natijalar qanday? Taqqoslash funksiyasi qanday ishlashini taxmin qiling (31-bobda javob).
4. `const hisob = { qiymat: 10, ikkila: () => this.qiymat * 2 };` — `hisob.ikkila()` nima beradi va nega? Metod sintaksisi bilan tuzating.
5. `qoshuvchi(n)` funksiyasini arrow bilan yozing: u `x => x + n` qaytarsin. `qoshuvchi(5)(10)` nimaga teng? (Bu closure — 43-bob.)

## Rasmiy hujjat

- MDN — *Arrow function expressions*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions>
- MDN — *Functions* (Guide, "Arrow functions"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#arrow_functions>
- ECMA-262 — *Arrow Function Definitions*: <https://tc39.es/ecma262/2026/#sec-arrow-function-definitions>
