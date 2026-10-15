# 27 — BigInt

[← Oldingi: Number](26-number.md) · [Mundarija](README.md) · [Keyingi: Satrlar →](28-satrlar.md)

## Tushuncha

26-bobda ko'rdik: `Number` butun sonlarni faqat 2<sup>53</sup> − 1 gacha aniq saqlaydi. Undan katta butun sonlar — ma'lumotlar bazasidagi 64 bitli ID'lar, kriptografik hisoblar, juda katta faktoriallar — `Number` da buziladi.

**BigInt** — MDN: `bigint` primitiv turi. U **ixtiyoriy kattalikdagi butun sonlarni** aniq saqlaydi. Ikki yo'l bilan yaratiladi:

- butun son literali oxiriga `n` qo'shib: `123n`;
- `BigInt()` funksiyasi bilan (`new` siz): `BigInt(123)`, `BigInt('123')`, `BigInt('0xff')`.

`typeof 1n` — `'bigint'`.

## Kod: asosiy ishlatilishi

```js
const katta = 2n ** 64n;
console.log(katta, typeof katta, BigInt('0xff'), BigInt(Number.MAX_SAFE_INTEGER) + 2n);
console.log(2 ** 64, Number.MAX_SAFE_INTEGER + 2);
console.log(7n / 2n, -7n / 2n, 7n % 3n, 'id: ' + 10n);
```

```text
$ node asos.mjs
18446744073709551616n bigint 255n 9007199254740993n
18446744073709552000 9007199254740992
3n -3n 1n id: 10
```

- `2n ** 64n` — aniq. `2 ** 64` (`Number`) esa oxirgi raqamlarini yo'qotdi.
- `MAX_SAFE_INTEGER + 2` — `Number` da `...992` (noto'g'ri), `BigInt` da `...993` (to'g'ri).
- **Bo'lish** — MDN: `/` kasr qismini **nol tomonga kesadi**, chunki BigInt kasrni ifodalay olmaydi. `7n / 2n` → `3n`, `-7n / 2n` → `-3n`.
- Satr bilan `+` — MDN: natija satr.

## Kod: aralashtirib bo'lmaydi

MDN: BigInt'ni `Math` metodlari bilan ishlatib bo'lmaydi va amallarda `Number` bilan **aralashtirib bo'lmaydi** — ikkalasi bir turga aylantirilishi kerak.

```js
try { 1n + 1; } catch (e) { console.log(e.name + ': ' + e.message); }
try { +1n; } catch (e) { console.log(e.name + ': ' + e.message); }
try { Math.max(1n, 2n); } catch (e) { console.log(e.name + ': ' + e.message); }
try { BigInt(1.5); } catch (e) { console.log(e.name + ': ' + e.message); }
try { 1n >>> 0n; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(1n + BigInt(1), Number(1n) + 1);
```

```text
TypeError: Cannot mix BigInt and other types, use explicit conversions
TypeError: Cannot convert a BigInt value to a number
TypeError: Cannot convert a BigInt value to a number
RangeError: The number 1.5 cannot be converted to a BigInt because it is not an integer
TypeError: BigInts have no unsigned right shift, use >> instead
2n 2
```

MDN qoidalari:

| Operator | BigInt bilan |
| --- | --- |
| `+ - * / % **`, bit operatorlari, unar `-`, `++`/`--` | Ishlaydi, lekin **ikkala operand ham BigInt** bo'lishi kerak |
| `< > <= >= == != === !==` | `Number` bilan **aralashtirsa bo'ladi** |
| `\|\| && !` | Faqat truthy/falsy'ga qaraydi |
| Unar `+` | **Yo'q** — MDN: asm.js ni buzmaslik uchun |
| `>>>` | **Yo'q** — har BigInt ishorali (signed) |

Aylantirish **aniq** bo'lishi kerak: `BigInt(son)` yoki `Number(bigint)`. `BigInt(1.5)` — `RangeError`: kasrli son butun songa aylantirilmaydi.

## Kod: taqqoslash va saralash

```js
console.log(0n === 0, 0n == 0, 1n < 2, 2n >= 2, 0n ? 'rost' : 'yolg\'on');
const aral = [4n, 6, -12n, 10, 4, 0, 0n];
console.log([...aral].sort());
try { [...aral].sort((a, b) => a - b); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log([...aral].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
```

```text
$ node taqqos.mjs
false true true true yolg'on
[
  -12n,  0, 0n,
    10, 4n,  4,
     6
]
TypeError: Cannot mix BigInt and other types, use explicit conversions
[
  -12n, 0, 0n,
    4n, 4,  6,
    10
]
```

- `0n === 0` — `false` (turlar har xil), `0n == 0` — `true` (MDN).
- MDN: shartlarda BigInt `Number` kabi ishlaydi — faqat `0n` **falsy**.
- Standart `sort()` satr sifatida saralaydi (`10` `4n` dan oldin) — 31-bob.
- `a - b` taqqoslagichi aralash massivda `TypeError`. MDN yechimi — `<` va `>` bilan taqqoslagich, chunki ular aralashtirishga ruxsat beradi.

## Kod: aniqlik yo'qolishi va bit kengligi

```js
const id = 9007199254740993n;
console.log(Number(id), BigInt(Number(id)) === id);
console.log(BigInt.asIntN(8, 255n), BigInt.asUintN(8, 256n), BigInt.asUintN(64, -1n));
console.log((2n ** 100n).toString().length, (255n).toString(16), (123456789n).toLocaleString('uz-UZ'));
```

```text
$ node aniqlik.mjs
9007199254740992 false
-1n 0n 18446744073709551615n
31 ff 123 456 789
```

- `Number(id)` — `...992`. MDN ogohlantiradi: BigInt'ni `Number` ga aylantirganda aniqlik yo'qolishi mumkin. Qaytarib aylantirsangiz, asl qiymat tiklanmaydi.
- `BigInt.asIntN(bit, x)` / `asUintN(bit, x)` — qiymatni berilgan bit kengligidagi ishorali/ishorasiz butun songa "o'raydi". Masalan, 8 bitda `255` → `-1`. 64 bitli tizimlar bilan ishlashda kerak.
- `toString(asos)` va `toLocaleString` — `Number` dagi kabi.

## Kod: JSON bilan

MDN: `JSON.stringify()` BigInt'ni ko'rsa `TypeError` beradi — JSON'da BigInt uchun standart ko'rinish yo'q.

```js
try { JSON.stringify({ a: 1n }); } catch (e) { console.log(e.name + ': ' + e.message); }
const replacer = (k, v) => typeof v === 'bigint' ? { $bigint: v.toString() } : v;
const reviver = (k, v) => v !== null && typeof v === 'object' && typeof v.$bigint === 'string' ? BigInt(v.$bigint) : v;
const s = JSON.stringify({ son: 1, katta: 18014398509481982n }, replacer);
console.log(s);
console.log(JSON.parse(s, reviver));
console.log(JSON.parse('{"id": 9007199254740993}').id);
```

```text
$ node json.mjs
TypeError: Do not know how to serialize a BigInt
{"son":1,"katta":{"$bigint":"18014398509481982"}}
{ son: 1, katta: 18014398509481982n }
9007199254740992
```

MDN usuli: `replacer` BigInt'ni belgili obyektga, `reviver` esa qaytarib BigInt'ga aylantiradi. Lekin oxirgi qator jiddiyroq muammoni ko'rsatadi: JSON'dagi oddiy **katta son** `JSON.parse` da darhol `Number` bo'ladi va buziladi.

### JSON manba matniga kirish (ES2026)

ES2026 spetsifikatsiyasida bu muammoga yechim bor. MDN (`JSON.parse`): `reviver` uchinchi argument — **`context`** oladi. Primitiv qiymatlar uchun undagi `context.source` — qiymatning JSON'dagi **asl matni**. `JSON.rawJSON(matn)` esa `JSON.stringify` ga qiymatni aynan shu matn bilan yozishni aytadi. Node.js 26.12.0 da ikkalasi ham bor:

```js
const matn = '{"id": 9007199254740993, "nom": "Ali"}';
const obj = JSON.parse(matn, (k, v, ctx) => k === 'id' ? BigInt(ctx.source) : v);
console.log(obj);
console.log(JSON.stringify({ id: JSON.rawJSON(obj.id.toString()) }));
console.log(JSON.isRawJSON(JSON.rawJSON('1')));
```

```text
$ node manba.mjs
{ id: 9007199254740993n, nom: 'Ali' }
{"id":9007199254740993}
true
```

Endi katta ID JSON'dan **aniq** o'qildi va JSON'ga xuddi son sifatida (qo'shtirnoqsiz, belgili obyektsiz) qaytdi. JSON — 38-bobda.

## Nega shunday

MDN tavsiyalari: BigInt'ni faqat 2<sup>53</sup> dan katta qiymatlar **haqiqatan kutilganda** ishlating va BigInt bilan `Number` orasida aylantirmang. Yashirin aralashtirishning taqiqlanishi ham shu sababli: `1n + 0.5` ning "to'g'ri" natijasi yo'q — BigInt kasrni yo'qotadi, `Number` esa katta butun sonni buzadi. Til tanlovni dasturchiga qoldiradi.

MDN BigInt va **kriptografiya** haqida ham ogohlantiradi: BigInt amallari **doimiy vaqtda** (constant-time) bajarilmaydi. Shuning uchun ular **vaqt hujumlariga** (timing attacks) ochiq — hujumchi hisob vaqtini o'lchab, maxfiy kalit kattaligini taxmin qilishi mumkin. Kriptografiya uchun Web Crypto API.

## Muhandislik nuqtai nazari

### Katta ID'lar — satr yoki BigInt

Ma'lumotlar bazasidagi 64 bitli butun ID'lar JavaScript'ga `Number` bo'lib kelsa — oxirgi raqamlar jim buziladi. Variantlar:

1. API ID'larni **satr** sifatida qaytaradi — eng sodda yo'l.
2. Kerak bo'lsa `context.source` bilan BigInt'ga o'qish (ES2026).

### Hisob turi bitta bo'lsin

Bir funksiya ichida `Number` va `BigInt` aralashsa, har amalda aylantirish kerak bo'ladi va xato oson kiradi. Chegarada bir marta aylantiring, ichkarida bitta tur ishlating.

### Tezlik

BigInt — o'zgaruvchan uzunlikdagi son; `Number` esa protsessor to'g'ridan-to'g'ri qo'llaydigan 64 bitli float. Kichik sonlar uchun BigInt'ga o'tishning foydasi yo'q.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `1n + 1` | `TypeError: Cannot mix BigInt and other types` | `1n + BigInt(1)` |
| `+bigint` | `TypeError` | `Number(bigint)` |
| `Math.max(1n, 2n)` | `TypeError` | `a > b ? a : b` |
| `BigInt(1.5)` | `RangeError` | `BigInt(Math.trunc(x))` |
| `5n / 2n` → `2.5` deb kutish | `2n` | Kasr kerak bo'lsa `Number` |
| `JSON.stringify({ x: 1n })` | `TypeError` | `replacer` yoki `JSON.rawJSON` |
| `JSON.parse` da katta ID | Jim buziladi | Satr ID yoki `context.source` |
| `(a, b) => a - b` aralash massivda | `TypeError` | `<`/`>` bilan taqqoslagich |

## Amaliyot

1. `faktorial(n)` ni BigInt bilan yozing. `faktorial(25n)` va `Number` versiyasining natijasini taqqoslang — qaysi raqamdan farq boshlanadi?
2. `BigInt('12.5')`, `BigInt('  42  ')`, `BigInt('')`, `BigInt(true)` — natijalarni tekshiring.
3. `const narx = 15000n; const chegirma = 0.15;` — chegirmali narxni BigInt'da qanday hisoblaysiz? (Ishora: foizni butun songa aylantiring.)
4. `BigInt.asUintN(32, -1n)` va `BigInt.asIntN(32, 2n ** 31n)` — natijalarni tushuntiring.
5. `[{"id": 9223372036854775807}]` JSON'ini o'qib, ID'ni aniq BigInt sifatida oling va qaytarib JSON'ga yozing.

## Rasmiy hujjat

- MDN — `BigInt`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt>
- MDN — `BigInt.asIntN()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/asIntN>
- MDN — `JSON.parse()` (reviver `context`): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse>
- MDN — `JSON.rawJSON()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON>
- ECMA-262 — *The BigInt Type*: <https://tc39.es/ecma262/2026/#sec-ecmascript-language-types-bigint-type>
- ECMA-262 — *JSON.rawJSON*: <https://tc39.es/ecma262/2026/#sec-json.rawjson>
