# 09 — Taqqoslash

[← Oldingi: Operatorlar va matematika](08-operatorlar.md) · [Mundarija](README.md) · [Keyingi: Mantiqiy operatorlar va ?? →](10-mantiqiy-operatorlar.md)

## Tushuncha

Taqqoslash ikki xil savolga javob beradi:

1. **Tengmi?** — `==`, `===`, `!=`, `!==`, `Object.is()`.
2. **Qaysi biri katta?** — `<`, `>`, `<=`, `>=`.

MDN (*Equality comparisons and sameness*): JavaScript'da qiymatlarni solishtirishning **uchta** amali bor va ular spetsifikatsiyadagi to'rtta algoritmga mos keladi:

| Amal | Spetsifikatsiya algoritmi | Tipni aylantiradimi | `NaN` va `±0` |
| --- | --- | --- | --- |
| `==` (yumshoq tenglik) | **IsLooselyEqual** | Ha | `NaN != NaN`, `-0 == +0` |
| `===` (qat'iy tenglik) | **IsStrictlyEqual** | Yo'q | `NaN !== NaN`, `-0 === +0` |
| `Object.is()` | **SameValue** | Yo'q | `NaN` — o'ziga teng, `-0` va `+0` — har xil |
| — (API sifatida yo'q) | **SameValueZero** | Yo'q | `NaN` — o'ziga teng, `-0` = `+0` |

MDN muhim narsani ta'kidlaydi: bu farqlarning hammasi **primitivlar** bilan bog'liq. Hech biri tuzilishi bir xil bo'lgan **ikki alohida obyekt**ni teng demaydi.

## Kod: obyektlar — faqat havola bo'yicha

```js
const a = { n: 1 }, b = { n: 1 }, c = a;
console.log(a == b, a === b, a === c);
console.log([1, 2] === [1, 2], JSON.stringify([1, 2]) === JSON.stringify([1, 2]));
```

```text
false false true
false true
```

`a` va `b` ichi bir xil, lekin ular **ikki xil obyekt** — teng emas. `c` esa `a` ning o'zi (bitta obyektga havola) — teng. MDN: obyektlar va massivlarning ichini rekursiv solishtirish **chuqur tenglik** (deep equality) deyiladi va JavaScript'da buning umumiy operatori **yo'q**. `JSON.stringify` bilan solishtirish ba'zan ishlaydi, lekin kalitlar tartibi, `undefined`, `Date` kabi holatlarda noto'g'ri — bu vaqtinchalik usul, kafolat emas (38-bob).

## Kod: `===`, `==` va `Object.is` — yonma-yon

```js
const juftlar = [
  ['null', null, 'undefined', undefined], ["'0'", '0', '0', 0], ["''", '', '0', 0],
  ['0', 0, 'false', false], ["'1'", '1', 'true', true], ["'2'", '2', 'true', true],
  ['[]', [], 'false', false], ['[1]', [1], '1', 1], ['[1,2]', [1, 2], "'1,2'", '1,2'],
  ['null', null, '0', 0], ['undefined', undefined, '0', 0], ['NaN', NaN, 'NaN', NaN],
  ['+0', +0, '-0', -0], ['0n', 0n, '0', 0], ['1n', 1n, "'1'", '1'],
];
console.log('x'.padEnd(10), 'y'.padEnd(10), '=='.padEnd(7), '==='.padEnd(7), 'Object.is');
for (const [ax, x, ay, y] of juftlar)
  console.log(ax.padEnd(10), ay.padEnd(10), String(x == y).padEnd(7), String(x === y).padEnd(7), Object.is(x, y));
```

```text
$ node solish.mjs
x          y          ==      ===     Object.is
null       undefined  true    false   false
'0'        0          true    false   false
''         0          true    false   false
0          false      true    false   false
'1'        true       true    false   false
'2'        true       false   false   false
[]         false      true    false   false
[1]        1          true    false   false
[1,2]      '1,2'      true    false   false
null       0          false   false   false
undefined  0          false   false   false
NaN        NaN        false   false   true
+0         -0         true    true    false
0n         0          true    false   false
1n         '1'        true    false   false
```

### `===` — qat'iy tenglik

MDN: hech bir qiymat solishtirishdan oldin aylantirilmaydi. **Tiplar har xil bo'lsa — teng emas.** Tip bir xil va son bo'lmasa — qiymat bir xil bo'lsa teng. Sonlarda ikki istisno: `NaN` hech narsaga teng emas (o'ziga ham), `+0` va `-0` teng.

MDN: qat'iy tenglik **deyarli har doim to'g'ri tanlov**. Sonlardagi ikki istisno amaliy sabablarga ko'ra: ko'p holatlarda `+0` va `-0` farqi ahamiyatsiz, `NaN` esa "noto'g'ri natija" — u boshqa `NaN` ga teng deb hisoblanmasligi kerak.

### `==` — yumshoq tenglik va uning algoritmi

MDN (*Equality*) algoritmni shunday qisqartiradi:

1. **Tiplar bir xil** bo'lsa — `===` kabi solishtiriladi.
2. Operandlardan biri **`null` yoki `undefined`** bo'lsa — ikkinchisi ham `null` yoki `undefined` bo'lsagina `true`. Boshqa hech narsa bilan teng emas.
3. Biri **obyekt**, ikkinchisi primitiv bo'lsa — obyekt **primitivga** aylantiriladi (7-bob, `"default"` ishora).
4. Endi ikkalasi primitiv:
   - tiplar bir xil — 1-qadam;
   - biri Symbol, ikkinchisi emas — `false`;
   - biri **Boolean** bo'lsa — u **songa** aylantiriladi (`true` → 1, `false` → 0) va solishtirish qaytadan;
   - son va satr — **satr songa** aylantiriladi;
   - son va BigInt — matematik qiymat bo'yicha;
   - satr va BigInt — satr BigInt'ga aylantiriladi; muvaffaqiyatsiz bo'lsa `false`.

Jadvaldagi "g'alati" natijalar endi qoidaga aylanadi:

- **`'2' == true` → `false`**, lekin `'1' == true` → `true`. `true` avval songa (`1`) aylanadi, keyin `'2'` songa (`2`): `2 == 1` — `false`. Ya'ni `== true` "truthy'mi?" degani **emas**.
- **`[] == false` → `true`.** `false` → `0`; `[]` → primitiv `""` → son `0`; `0 == 0`.
- **`null == 0` → `false`.** 2-qadam: `null` faqat `null`/`undefined` ga teng. `null` songa aylantirilmaydi.
- **`null == undefined` → `true`** — 2-qadamning o'zi.

MDN xulosasi: **ko'p holatlarda `==` ishlatish tavsiya etilmaydi** — `===` natijasini oldindan aytish osonroq va tip aylantirilmagani uchun tezroq bo'lishi mumkin.

**Yagona keng tarqalgan istisno** — `x == null`. 2-qadam tufayli u **faqat** `null` va `undefined` uchun `true` beradi, `0`, `''`, `false` uchun emas. Bu "qiymat yo'qmi?" tekshiruvining qisqa va aniq shakli (`x === null || x === undefined` bilan bir xil).

### `Object.is()` — "aynan bir xilmi?"

MDN: SameValue ikki qiymat **har qanday kontekstda funksional jihatdan bir xil**mi, shuni aniqlaydi. U `===` dan faqat ikki joyda farq qiladi: `Object.is(NaN, NaN)` → `true`, `Object.is(+0, -0)` → `false`.

MDN: til ichida qiymatning aynan bir xilligi kerak bo'lgan deyarli hamma joyda SameValue ishlatiladi — masalan, o'zgarmas xossani `Object.defineProperty` bilan "qayta aniqlash"da yangi qiymat joriy qiymat bilan shu algoritm bo'yicha solishtiriladi. React ham shu algoritmga tayanadi: React hujjati (`useState`) — yangi qiymat joriy state bilan `Object.is` bo'yicha bir xil bo'lsa, React komponentni qayta render qilmaydi.

### SameValueZero — qidiruvda

```js
console.log([NaN].indexOf(NaN), [NaN].includes(NaN), new Set([NaN, NaN]).size);
console.log([-0].includes(0), new Map([[-0, 'nol']]).get(0));
```

```text
-1 true 1
true nol
```

MDN: `indexOf` va `lastIndexOf` qat'iy tenglikdan foydalanadi — shuning uchun `NaN` ni **topa olmaydi**. `includes`, `Set`, `Map` esa **SameValueZero** ishlatadi: `NaN` o'ziga teng, `-0` va `+0` bir xil. MDN: bu odatda **qidiruv uchun eng mantiqiy** xulq. `switch` ham `===` ishlatadi, shuning uchun `case NaN:` hech qachon ishlamaydi.

## Kod: `<`, `>`, `<=`, `>=`

MDN (*Less than*) algoritmi:

1. Obyektlar primitivga aylantiriladi (`"number"` ishora). **Chap operand doim birinchi.**
2. **Ikkalasi satr** bo'lsa — satr sifatida, **UTF-16 kod birliklari** qiymati bo'yicha solishtiriladi.
3. Aks holda songa aylantiriladi: `true`/`false` → 1/0, `null` → 0, `undefined` → `NaN`, satr — tarkibiga qarab (son bo'lmasa `NaN`).
4. Biri `NaN` bo'lsa — **`false`**.
5. Aks holda — sonlar sifatida. BigInt va Number'ni solishtirish **mumkin**.

```js
console.log('2' > '10', 2 > '10', '2' > 10);
console.log('a' < 'b', 'Z' < 'a', 'ab' < 'b', 'olma' < 'Olma');
console.log(null >= 0, null > 0, null == 0);
console.log(undefined > 0, undefined < 0, undefined == 0);
console.log(1n < 2, 2n > 1.5, 'x' < 1, 1n < 'x');
```

```text
$ node kichik.mjs
true false false
true true true false
true false false
false false false
true true false false
```

Har bir qatorni tahlil qilamiz:

- **`'2' > '10'` → `true`.** Ikkalasi satr — **lug'at tartibida** (belgima-belgi): `'2'` > `'1'`, qolganiga qaralmaydi. Agar bittasi son bo'lsa (`2 > '10'`), ikkalasi songa aylanadi: `2 > 10` — `false`. Formadan kelgan qiymatlarni solishtirishdagi eng keng tarqalgan xato.
- **`'Z' < 'a'` → `true`**, **`'olma' < 'Olma'` → `false`.** UTF-16 kodlarida barcha katta lotin harflari (`A`–`Z`: 65–90) kichiklardan (`a`–`z`: 97–122) oldin keladi. Bu **alifbo tartibi emas**.
- **`null >= 0` → `true`, lekin `null > 0` → `false` va `null == 0` → `false`.** `<`, `>`, `>=` `null` ni **songa** (`0`) aylantiradi, `==` esa aylantirmaydi (2-qadam). Natijada `null` 0 dan katta ham, 0 ga teng ham emas, lekin "katta yoki teng".
- **`undefined`** songa `NaN` bo'ladi — barcha taqqoslashlar `false`.
- **`1n < 'x'` → `false`.** MDN: BigInt'ga aylantirib bo'lmaydigan satr bilan solishtirishda to'rtala operator ham `false` qaytaradi.

MDN: ikki holatdan tashqari (`NaN` va BigInt-satr xatosi), to'rt operator o'zaro bog'liq: `x < y` ↔ `!(x >= y)`, `x > y` ↔ `y < x`.

### Satrlarni "to'g'ri" saralash

```js
console.log(['o', 'ch', 'sh', 'a', 'Ya'].sort(), ['o', 'ch', 'sh', 'a', 'Ya'].sort((p, q) => p.localeCompare(q, 'uz')));
```

```text
[ 'Ya', 'a', 'ch', 'o', 'sh' ] [ 'a', 'o', 'Ya', 'sh', 'ch' ]
```

`sort()` sukut bo'yicha UTF-16 tartibida saralaydi (`'Ya'` — katta harf bo'lgani uchun birinchi). `localeCompare(q, 'uz')` esa o'zbek tili (`'uz'` lokali) **saralash qoidalari** bo'yicha solishtiradi — natija butunlay boshqacha: katta-kichik harf ajratilmay saralandi, `sh` va `ch` esa `s`/`c` o'rnida emas, ro'yxat oxirida. Foydalanuvchiga ko'rinadigan ro'yxatlarni doim til qoidalari bilan saralang — 28- va 39-boblarda batafsil (`Intl.Collator`).

## Nega shunday

`==` ning murakkab qoidalari JavaScript'ning kuchsiz tiplashidan (6–7-boblar) kelib chiqadi: `'5' == 5` qulay ko'rinadi, lekin har bir qadamdagi aylantirish kutilmagan natijalarga olib keladi. `===` esa aylantirishni umuman qilmaydi — shuning uchun MDN uni "deyarli har doim to'g'ri tanlov" deydi.

`Object.is` esa boshqa ehtiyoj uchun: IEEE 754 standarti `NaN` ni o'ziga teng emas, `-0` ni `+0` ga teng deb belgilaydi — matematik hisob uchun to'g'ri, lekin "bu ikki qiymat aynan bir narsami?" degan savol uchun noto'g'ri. MDN ta'kidlaydi: bu amallar bitta "qat'iylik shkalasi"ni tashkil qilmaydi — `Object.is` `==` dan "yumshoqroq" ham, `===` dan "qat'iyroq" ham emas, u boshqa savolga javob beradi.

## Muhandislik nuqtai nazari

### Qoidalar

| Vazifa | Ishlating |
| --- | --- |
| Odatiy tenglik | `===`, `!==` |
| `null` yoki `undefined` ekanini tekshirish | `x == null` (yagona joiz `==`) yoki `x ?? ...` (10-bob) |
| `NaN` ni tekshirish | `Number.isNaN(x)` |
| Massivda `NaN` ni qidirish | `includes`, `indexOf` emas |
| `-0` ni ajratish | `Object.is(x, -0)` |
| Obyektlarni ichi bo'yicha solishtirish | O'z funksiyangiz yoki kutubxona (deep equal); `JSON.stringify` — faqat oddiy ma'lumotda |
| Formadan kelgan sonlarni solishtirish | Avval `Number()`, keyin `<` |
| Foydalanuvchiga ko'rinadigan matnlarni saralash | `localeCompare` / `Intl.Collator` |

### Linter

`==` ning tasodifan ishlatilishini linter ushlaydi — masalan, ESLint'ning `eqeqeq` qoidasi; uning `"smart"` yoki `null: "ignore"` sozlamasi `x == null` ga ruxsat beradi.

### Obyekt kalitlari va `Map`

`Map` va `Set` kalitlarni SameValueZero bo'yicha solishtiradi — obyekt kalit **havola** bo'yicha. `map.get({ id: 1 })` hech qachon oldin qo'yilgan `{ id: 1 }` ni topmaydi. Kalit sifatida primitiv (ID satri yoki soni) ishlating (33-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `if (x == true)` | `'2' == true` → `false` | `if (x)` yoki aniq tekshiruv |
| `if (qiymat == 0)` bilan "bo'shmi?" | `'' == 0`, `[] == 0` — `true` | `===` |
| `x === NaN` | Doim `false` | `Number.isNaN(x)` |
| `arr.indexOf(NaN)` | `-1` | `arr.includes(NaN)` |
| `'10' > '9'` (formadan) | `false` — lug'at tartibi | `Number('10') > Number('9')` |
| `{a:1} === {a:1}` dan `true` kutish | Ikki xil obyekt | Ichini solishtirish |
| `null >= 0` → `true` ni hisobga olmaslik | `null` "0 ga teng" deb o'tib ketadi | Avval `null` ni tekshirish |
| `.sort()` bilan ismlarni saralash | Katta harflar oldinda, til qoidalari yo'q | `localeCompare(…, 'uz')` |

## Amaliyot

1. Oldindan ayting, keyin tekshiring: `'abc' < 'abd'`, `'10' < '9'`, `10 < '9'`, `[2] > 1`, `[1, 2] > 1`, `null == false`, `undefined == null`, `NaN != NaN`.
2. `0 == ''`, `0 == '0'`, `'' == '0'` — birinchi ikkisi `true`, uchinchisi `false`. Bu "tranzitivlik" yo'qligini algoritm qadamlari bilan tushuntiring.
3. `sameValueZero(x, y)` funksiyasini MDN tavsifi bo'yicha yozing va `[NaN, NaN]`, `[0, -0]`, `['1', 1]` bilan sinang.
4. `deepEqual(a, b)` ning oddiy versiyasini yozing (faqat oddiy obyekt, massiv va primitivlar). `{a: [1, {b: 2}]}` bilan sinang.
5. Ismlar ro'yxatini (`['Zarina', 'akmal', 'Bobur', 'shaxlo', 'Chingiz']`) avval `sort()`, keyin `localeCompare(…, 'uz')` bilan saralang va farqni tushuntiring.

## Rasmiy hujjat

- MDN — *Equality comparisons and sameness*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness>
- MDN — *Equality (==)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Equality>
- MDN — *Strict equality (===)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality>
- MDN — *Less than (<)*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Less_than>
- MDN — `Object.is()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is>
- MDN — `String.prototype.localeCompare()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare>
- ECMA-262 — *IsLooselyEqual*, *IsStrictlyEqual*, *SameValue*, *SameValueZero*: <https://tc39.es/ecma262/2026/#sec-islooselyequal>
- ESLint — `eqeqeq`: <https://eslint.org/docs/latest/rules/eqeqeq>
