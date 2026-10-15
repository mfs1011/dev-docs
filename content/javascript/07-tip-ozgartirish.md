# 07 — Tip o'zgartirish

[← Oldingi: Ma'lumot tiplari](06-malumot-tiplari.md) · [Mundarija](README.md) · [Keyingi: Operatorlar va matematika →](08-operatorlar.md)

## Tushuncha

6-bobda ko'rdik: JavaScript — **kuchsiz tiplangan** til. MDN: bir tipdagi qiymatni boshqa tip kutilgan joyda ishlatish mumkin va til uni o'zi kerakli tipga aylantiradi. Buning uchun tilda bir nechta **aylantirish qoidalari** (coercion) belgilangan.

Aylantirish ikki xil bo'ladi:

- **Yashirin** (implicit) — til o'zi aylantiradi: `'5' - 3`, `if (qiymat)`, `` `${x}` ``.
- **Aniq** (explicit) — dasturchi o'zi chaqiradi: `Number(x)`, `String(x)`, `Boolean(x)`.

Ikkalasi ham **bir xil algoritm**dan foydalanadi. Spetsifikatsiyada ular *abstract operation*lar deyiladi: `ToNumber`, `ToString`, `ToBoolean`, `ToPrimitive`. Bu bobda har birini MDN va spetsifikatsiya bo'yicha ko'rib chiqamiz — shunda `[] + {}` kabi "sehrli" natijalar oddiy qoidalarga aylanadi.

## Kod: songa aylantirish (`ToNumber`)

MDN (*Number coercion*) qoidalari:

| Qiymat | Natija |
| --- | --- |
| son | o'zi |
| `undefined` | `NaN` |
| `null` | `0` |
| `true` / `false` | `1` / `0` |
| satr | son literali kabi tahlil qilinadi; muvaffaqiyatsiz bo'lsa — `NaN` |
| BigInt | **`TypeError`** (aniqlik yo'qolmasligi uchun) |
| Symbol | **`TypeError`** |
| obyekt | avval primitivga (`"number"` ishorasi bilan), keyin songa |

Satrni tahlil qilishda son literalidan farqlar (MDN):

- boshidagi va oxiridagi bo'sh joylar e'tiborga olinmaydi;
- boshidagi `0` sonni sakkizlik qilmaydi;
- boshida **bitta** `+` yoki `-` bo'lishi mumkin;
- `"Infinity"` tanib olinadi;
- **bo'sh yoki faqat bo'sh joydan iborat satr — `0`**;
- raqam ajratgichlari (`1_000`) ruxsat etilmagan.

```js
const misollar = [undefined, null, true, false, '', '   ', '42', ' 42 ', '0x1F', '042', '1_000', '4 2', '12px', 'Infinity', '+-5', [], [7], [1, 2], {}];
for (const q of misollar) console.log(JSON.stringify(q)?.padEnd(12) ?? 'undefined   ', '→', Number(q));
```

```text
$ node soni.mjs
undefined    → NaN
null         → 0
true         → 1
false        → 0
""           → 0
"   "        → 0
"42"         → 42
" 42 "       → 42
"0x1F"       → 31
"042"        → 42
"1_000"      → NaN
"4 2"        → NaN
"12px"       → NaN
"Infinity"   → Infinity
"+-5"        → NaN
[]           → 0
[7]          → 7
[1,2]        → NaN
{}           → NaN
```

Diqqat qiladigan joylar:

- **`null` → 0, `undefined` → NaN.** Ikkalasi "bo'sh", lekin songa har xil aylanadi.
- **Bo'sh satr → 0.** Formadagi bo'sh input `Number('')` da `0` beradi, `NaN` emas — validatsiyada keng tarqalgan xato manbai.
- **Massivlar**: `[]` → `""` → `0`; `[7]` → `"7"` → `7`; `[1,2]` → `"1,2"` → `NaN`. Bu obyektni primitivga aylantirish natijasi (pastda).

### `Number()`, unar `+` va `parseInt`

```js
try { +10n } catch (e) { console.log('+10n →', e.name + ':', e.message); }
console.log('Number(10n) →', Number(10n));
try { Number(Symbol('s')) } catch (e) { console.log('Symbol →', e.name + ':', e.message); }
console.log(parseInt('12px'), parseFloat('3.5kg'), parseInt('0x1F'), parseFloat('0x1F'));
```

```text
+10n → TypeError: Cannot convert a BigInt value to a number
Number(10n) → 10
Symbol → TypeError: Cannot convert a Symbol value to a number
12 3.5 31 0
```

MDN:

- **unar `+x`** — aynan yuqoridagi qadamlar; BigInt'da xato.
- **`Number(x)`** — xuddi shunday, lekin BigInt'ni xatosiz songa aylantiradi (aniqlik yo'qolishi mumkin).
- **`parseInt` / `parseFloat`** — faqat satrlar bilan ishlaydi va qoidalari boshqacha: satr **boshidan** iloji boricha ko'p o'qiydi va qolganini tashlaydi (`'12px'` → `12`). `parseInt` kasr nuqtani tanimaydi, `parseFloat` esa `0x` prefiksini.

Qachon qaysi: foydalanuvchi kiritgan butun qiymat **to'liq** son bo'lishi kerak bo'lsa — `Number()` (keyin `Number.isNaN` tekshiruvi); "12px" kabi birlikli qiymatdan sonni ajratib olish — `parseInt`/`parseFloat`.

## Kod: satrga aylantirish (`ToString`)

MDN (*String coercion*): `undefined` → `"undefined"`, `null` → `"null"`, mantiqiy → `"true"`/`"false"`, son va BigInt → `toString(10)` algoritmi, **Symbol → `TypeError`**, obyekt → avval primitivga (`"string"` ishorasi bilan).

```js
const misollar = [undefined, null, true, 0, -0, 1e21, 0.000001, 1e-7, 10n, [1, [2, 3]], {}, [null, undefined]];
for (const q of misollar) console.log(String(q));
const s = Symbol('id');
console.log(String(s));
try { `${s}` } catch (e) { console.log('`${s}` →', e.name + ':', e.message); }
```

```text
$ node satr.mjs
undefined
null
true
0
0
1e+21
0.000001
1e-7
10
1,2,3
[object Object]
,
Symbol(id)
`${s}` → TypeError: Cannot convert a Symbol value to a string
```

- `-0` satrda `"0"` bo'lib qoladi — minus yo'qoladi.
- Juda katta va juda kichik sonlar eksponensial ko'rinishda (`1e+21`, `1e-7`).
- Massiv elementlarini vergul bilan qo'shadi, ichma-ich massivlarni ham; `null` va `undefined` elementlar **bo'sh satr** bo'ladi (`[null, undefined]` → `","`).
- Oddiy obyekt — `"[object Object]"`.
- Symbol: `String(s)` ishlaydi (`"Symbol(id)"`), template literal esa — `TypeError`.

MDN uch usulni solishtiradi:

| Usul | Xulqi |
| --- | --- |
| `` `${x}` `` | Aynan yuqoridagi qadamlar — built-in xulqqa eng yaqin |
| `String(x)` | Xuddi shunday, lekin Symbol'da xato emas — `"Symbol(...)"` |
| `"" + x` | Obyektni **satrga emas, primitivga** aylantiradi — ba'zi obyektlarda butunlay boshqa natija |

MDN tavsiyasi: `` `${x}` `` yoki `String(x)` ishlating, **`"" + x` emas** (sababi pastda, `narx` misolida).

## Kod: mantiqiy qiymatga aylantirish (`ToBoolean`)

MDN (*Boolean coercion*): faqat bir nechta qiymat `false` ga aylanadi — ular **falsy** deyiladi. Qolgan **hammasi** — **truthy**.

```js
const misollar = [
  ['0', 0], ['-0', -0], ['NaN', NaN], ['0n', 0n], ["''", ''], ['null', null],
  ['undefined', undefined], ['false', false],
  ["'0'", '0'], ["'false'", 'false'], ["' '", ' '], ['[]', []], ['{}', {}],
  ['new Boolean(false)', new Boolean(false)], ['Symbol()', Symbol()],
];
for (const [yozuv, q] of misollar) console.log(yozuv.padEnd(20), Boolean(q));
```

```text
$ node mantiq.mjs
0                    false
-0                   false
NaN                  false
0n                   false
''                   false
null                 false
undefined            false
false                false
'0'                  true
'false'              true
' '                  true
[]                   true
{}                   true
new Boolean(false)   true
Symbol()             true
```

**Falsy ro'yxati** (MDN *Falsy* glossary) — yod olish kerak bo'lgan to'liq ro'yxat:

```text
false   0   -0   0n   NaN   ""   null   undefined   (+ document.all)
```

`document.all` — MDN: JavaScript'dagi yagona falsy **obyekt**, eski va nostandart xulq; ishlatilmasligi kerak.

Tuzoqlar:

- `'0'`, `'false'`, `' '` — bo'sh bo'lmagan satr, demak **truthy**;
- `[]` va `{}` — obyekt, demak **truthy** (bo'sh massiv ham!);
- `new Boolean(false)` — obyekt, demak **truthy**.

MDN muhim farqni ta'kidlaydi: boshqa aylantirishlardan farqli, `ToBoolean` **obyektni primitivga aylantirishga urinmaydi** — har qanday obyekt shunchaki `true`.

Aylantirish usullari: `Boolean(x)` yoki ikki marta inkor `!!x`.

## Kod: obyektdan primitivga (`ToPrimitive`)

Obyekt son, satr yoki "har qanday primitiv" kutilgan joyga tushsa, avval **primitivga** aylantiriladi. MDN uchta yo'lni ko'rsatadi — ular faqat **ishora** (hint) va metodlar **tartibi** bilan farq qiladi:

| Kontekst | Ishora | Tartib |
| --- | --- | --- |
| Primitiv (`+` binar, `==`, `Date()` konstruktori) | `"default"` | `[Symbol.toPrimitive]` → `valueOf()` → `toString()` |
| Son (`-`, `*`, unar `+`, `Number()`) | `"number"` | `[Symbol.toPrimitive]` → `valueOf()` → `toString()` |
| Satr (`` `${}` ``, `String()`) | `"string"` | `[Symbol.toPrimitive]` → **`toString()` → `valueOf()`** |

Qoidalar (MDN):

- `[Symbol.toPrimitive]()` bo'lsa, u **doim birinchi** va primitiv qaytarishi shart — obyekt qaytarsa `TypeError`;
- `valueOf` yoki `toString` obyekt qaytarsa, natija e'tiborsiz qoldiriladi va keyingisi chaqiriladi; ikkalasi ham primitiv bermasa — `TypeError`;
- oddiy obyekt va massivda `valueOf()` (`Object.prototype` dan) **obyektning o'zini** qaytaradi — shuning uchun amalda `toString()` ishlaydi.

```js
console.log({} + []);
console.log([] + []);
console.log([1, 2] + [3]);
console.log(+[], +{}, +[5], +['5']);
```

```text
[object Object]

1,23
0 NaN 5 5
```

MDN tushuntirishi: `{}` va `[]` da `Symbol.toPrimitive` yo'q; `valueOf()` obyektning o'zini qaytaradi va e'tiborsiz qoladi; `toString()` chaqiriladi — `{}` → `"[object Object]"`, `[]` → `""`. Natija — ikki satrning qo'shilishi. `[] + []` → `""` (bo'sh qator chiqdi), `[1,2] + [3]` → `"1,2" + "3"` → `"1,23"`.

### O'z obyektingizda: qaysi metod qachon chaqiriladi

```js
const narx = {
  valueOf() { console.log('  valueOf chaqirildi'); return 100; },
  toString() { console.log('  toString chaqirildi'); return 'narx: 100'; },
};
console.log('+narx:'); console.log(+narx);
console.log('`${narx}`:'); console.log(`${narx}`);
console.log("narx + '':"); console.log(narx + '');
```

```text
+narx:
  valueOf chaqirildi
100
`${narx}`:
  toString chaqirildi
narx: 100
narx + '':
  valueOf chaqirildi
100
```

Uchinchi qatorga e'tibor bering: `narx + ''` **satrga** aylantirishga o'xshaydi, lekin `+` ishora `"default"` bilan **primitivga** aylantiradi — `valueOf` ishladi va `"100"` chiqdi, `"narx: 100"` emas. MDN'ning "`"" + x` ishlatmang" degan tavsiyasi aynan shu sababli.

### `Symbol.toPrimitive` — to'liq nazorat

```js
const harorat = {
  [Symbol.toPrimitive](hint) { console.log('  hint =', hint); return hint === 'number' ? 23 : hint === 'string' ? '23°C' : 'default'; },
};
console.log(+harorat); console.log(`${harorat}`); console.log(harorat + '');
```

```text
  hint = number
23
  hint = string
23°C
  hint = default
default
```

MDN: built-in obyektlardan faqat **`Date`** va **`Symbol`** `[Symbol.toPrimitive]` ni o'zgartiradi. `Date` `"default"` ishorasini `"string"` kabi qabul qiladi:

```js
const kun = new Date(0);
console.log(typeof (kun + 1), typeof (kun - 1));
```

```text
string number
```

`kun + 1` — satr (sana matni + "1"), `kun - 1` — son (millisekundlar). Bu farq 23-bobda `ToPrimitive` algoritmi bilan batafsil.

Ikkala metod ham primitiv bermasa:

```js
const yomon = { valueOf() { return {}; }, toString() { return {}; } };
try { +yomon } catch (e) { console.log(e.name + ':', e.message); }
```

```text
TypeError: Cannot convert object to primitive value
```

## Kod: operatorlarda yashirin aylantirish

```js
console.log('5' + 3, '5' - 3, '5' * '2', '10' / '4', true + 1, null + 1, undefined + 1, '3' + 4 + 5, 3 + 4 + '5');
```

```text
53 2 10 2.5 2 1 NaN 345 75
```

- **`+` binar** — MDN: operandlardan biri satr bo'lsa, satrlarni qo'shadi; aks holda sonlarni. `'5' + 3` → `"53"`.
- **`-`, `*`, `/`** — faqat sonlar uchun; satrlar songa aylanadi. `'5' - 3` → `2`.
- `true + 1` → `2`, `null + 1` → `1`, `undefined + 1` → `NaN` — `ToNumber` jadvali bo'yicha.
- **Tartib muhim**: `+` chapdan o'ngga bajariladi. `'3' + 4 + 5` → `"34" + 5` → `"345"`; `3 + 4 + '5'` → `7 + '5'` → `"75"`.

## Nega shunday

MDN aytganidek, yashirin aylantirish **qulay**, lekin kutilmagan joyda yoki teskari yo'nalishda (masalan, satr → son o'rniga son → satr) bo'lsa — nozik xatolar manbai.

Muhimi — bu tasodifiy emas. Hammasi to'rtta aniq algoritmga tushadi: `ToPrimitive`, `ToNumber`, `ToString`, `ToBoolean`. Keyingi boblardagi `==` (9-bob), `+` (8-bob), `if` (11-bob) — barchasi shu algoritmlarni chaqiradi.

## Muhandislik nuqtai nazari

### Chegarada aniq aylantiring

Tashqi ma'lumot (forma, URL parametri, `localStorage`) — satr. Uni tizimga kirgan joyda **bir marta, aniq** aylantiring va tekshiring:

```js
function sonniOl(matn) {
  if (matn.trim() === '') return null;          // bo'sh satr → 0 bo'lib qolmasin
  const n = Number(matn);
  return Number.isNaN(n) ? null : n;
}
```

Ichkarida esa yashirin aylantirishga tayanmang — `a + b` da ikkalasi son ekaniga ishonch hosil qiling.

### `if (qiymat)` — qachon xavfli

Truthy tekshiruvi `null`/`undefined` ni ushlash uchun qulay, lekin `0` va `''` ham "yo'q" deb hisoblanadi:

```js
function chegirma(foiz) {
  if (!foiz) return 'chegirma yo\'q';   // ❌ foiz = 0 ham shu yerga tushadi
  ...
}
```

`0` yoki `''` haqiqiy qiymat bo'lishi mumkin bo'lsa — aniq tekshiruv: `foiz == null` yoki `foiz ?? standart` (10-bob).

### Obyektlaringizga ma'noli `toString`

Log va xato xabarlarida `[object Object]` o'rniga foydali matn chiqishi uchun klassingizga `toString()` (yoki `Symbol.toPrimitive`) qo'shing. Lekin `valueOf` ni songa o'xshamaydigan obyektga qo'shmang — `+` va `==` kutilmagan natija beradi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `Number('')` ni "noto'g'ri kiritish" deb kutish | `0` | Avval bo'sh satrni tekshirish |
| `parseInt` bilan to'liq validatsiya | `'12abc'` → `12` | `Number()` + `Number.isNaN` |
| `if (arr)` bilan bo'sh massivni tekshirish | `[]` — truthy | `arr.length === 0` |
| `if ('false')` | truthy | Satrni aniq solishtirish: `s === 'true'` |
| `x + ''` bilan satrga aylantirish | `valueOf` chaqiriladi | `String(x)` yoki `` `${x}` `` |
| Input qiymatlarini `+` bilan qo'shish | `'2' + '3'` → `'23'` | Avval `Number()` |
| `` `${symbol}` `` | `TypeError` | `String(symbol)` yoki `symbol.description` |

## Amaliyot

1. Oldindan ayting, keyin tekshiring: `Number(' \n 12 \t ')`, `Number('1e3')`, `Number('.5')`, `Number('5.')`, `Number(false)`, `Number([[]])`, `Number([null])`.
2. `String([1, [2, [3, [4]]]])` va `String({ toString: () => 'salom' })` nima beradi?
3. `[] == false` va `![] == false` — ikkalasi ham `true`. Nega? (Yordam: `![]` — `ToBoolean`, `==` — 9-bob.)
4. `pul` obyekti yarating: `+pul` → `15000`, `` `${pul}` `` → `"15 000 so'm"`, `pul + 1000` → `16000`. `Symbol.toPrimitive` bilan.
5. Formadan keladigan yoshni (`'25'`, `''`, `'  '`, `'abc'`, `'25.5'`) xavfsiz butun songa aylantiradigan funksiya yozing.

## Rasmiy hujjat

- MDN — *JavaScript data types and data structures* ("Type coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#type_coercion>
- MDN — `Number` ("Number coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number#number_coercion>
- MDN — `String` ("String coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion>
- MDN — `Boolean` ("Boolean coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean#boolean_coercion>
- MDN — *Falsy*: <https://developer.mozilla.org/en-US/docs/Glossary/Falsy>
- MDN — `Symbol.toPrimitive`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive>
- ECMA-262 — *Type Conversion* (7.1: ToPrimitive, ToBoolean, ToNumber, ToString): <https://tc39.es/ecma262/2026/#sec-type-conversion>
