# 23 — Obyektdan primitivga

[← Oldingi: Symbol](22-symbol.md) · [Mundarija](README.md) · [Keyingi: Reference Type →](24-reference-type.md)

## Tushuncha

7-bobda primitivlar bir-biriga qanday aylanishini ko'rdik. Lekin `obj + 1`, `` `${obj}` ``, `+sana` yoki `obj > 10` kabi ifodalarda **obyekt** ishtirok etadi. Til bunday joyda avval obyektni **primitivga** aylantiradi, keyin odatdagi qoidalarni qo'llaydi.

Bu aylantirishni spetsifikatsiyadagi **`ToPrimitive`** mavhum amali (abstract operation) bajaradi. Mavhum amal — spetsifikatsiya ichki ishlatadigan algoritm, uni koddan to'g'ridan-to'g'ri chaqirib bo'lmaydi. ECMA-262: `ToPrimitive(input, preferredType)` kirish qiymatini **obyekt bo'lmagan** turga aylantiradi. Obyekt bir nechta primitiv turga aylana olsa, ixtiyoriy `preferredType` **ishorasi** (hint) bilan qaysi turni afzal ko'rishini bildiradi.

## Uch ishora (hint)

MDN (`Symbol.toPrimitive`): ishora — `"number"`, `"string"` yoki `"default"`. Har biri o'z aylantirish yo'liga mos keladi:

| Ishora | Qayerda | Tartib (`Symbol.toPrimitive` bo'lmasa) |
| --- | --- | --- |
| `"string"` | `` `${obj}` ``, `String(obj)`, xossa kaliti `o[obj]` | `toString()` → `valueOf()` |
| `"number"` | `+obj`, `Number(obj)`, `*`, `-`, `/`, `<`, `>` | `valueOf()` → `toString()` |
| `"default"` | ikkilik `+`, `==` | `valueOf()` → `toString()` |

MDN (*Data structures*, "Primitive coercion"): `"default"` holati — kerakli tur aniq bo'lmagan joylar. Masalan, `+` operandlardan biri satr bo'lsa birlashtiradi, aks holda qo'shadi. `==` da esa obyekt primitiv bilan solishtiriladi.

## Algoritm — spetsifikatsiya bo'yicha

ECMA-262 7.1.1 *ToPrimitive*:

1. Kirish qiymati obyekt bo'lmasa — o'zgarishsiz qaytariladi.
2. Obyektda **`Symbol.toPrimitive`** metodi bo'lsa — ishora bilan chaqiriladi. Natija primitiv bo'lsa, u qaytariladi; obyekt bo'lsa — `TypeError`.
3. Aks holda ishora berilmagan bo'lsa, `"number"` deb olinadi va **`OrdinaryToPrimitive`** ishlaydi:
   - ishora `string` bo'lsa — avval `toString`, keyin `valueOf`;
   - aks holda — avval `valueOf`, keyin `toString`.
   - Har birida metod chaqiriladi, natija **primitiv** bo'lsa — qaytariladi. Obyekt bo'lsa — keyingi metodga o'tiladi. Ikkalasi ham yaramasa — `TypeError`.

Spetsifikatsiya izohi: ishorasiz chaqiruv odatda `number` kabi ishlaydi. O'rnatilgan obyektlardan faqat **`Date`** va **`Symbol`** buni o'zgartiradi — `Date` ishorasizlikni `string` deb qabul qiladi.

## Kod: ishorani ko'zdan kuzatish

```js
const kuzat = {
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    return hint === 'number' ? 42 : hint === 'string' ? 'satr' : 'standart';
  },
};
console.log(+kuzat);
console.log(`${kuzat}`);
console.log(kuzat + '');
console.log(kuzat * 2);
console.log(kuzat == 'standart');
console.log(String(kuzat), Number(kuzat));
const o = {}; o[kuzat] = 1; console.log(Object.keys(o));
console.log(kuzat > 10);
```

```text
$ node hint.mjs
hint: number
42
hint: string
satr
hint: default
standart
hint: number
84
hint: default
true
hint: string
hint: number
satr 42
hint: string
[ 'satr' ]
hint: number
true
```

- `kuzat + ''` — `"default"`, garchi ikkinchi operand satr bo'lsa ham. Ikkilik `+` obyektni avval **ishorasiz** primitivga aylantiradi, birlashtirish yoki qo'shishni keyin hal qiladi.
- `o[kuzat]` — `"string"`: ECMA-262 *ToPropertyKey* kalitni `ToPrimitive(argument, string)` bilan oladi.
- `kuzat > 10` — `"number"`: taqqoslash sonli ishora bilan.
- MDN: ishora faqat **zaif signal** — metod uni e'tiborsiz qoldirib, istalgan primitivni qaytara oladi.

## Kod: `valueOf` va `toString` tartibi

Ko'p obyektda `Symbol.toPrimitive` yo'q. Ular uchun 3-qadam ishlaydi:

```js
const narx = {
  summa: 12000,
  valueOf() { console.log('  valueOf'); return this.summa; },
  toString() { console.log('  toString'); return `${this.summa} so'm`; },
};
console.log('+narx:'); console.log(+narx);
console.log('`${narx}`:'); console.log(`${narx}`);
console.log('narx + 1:'); console.log(narx + 1);
console.log('narx + "":'); console.log(narx + '');
console.log([{} + [], [] + [], [1, 2] + [3], +[], +[5], +{}]);
```

```text
$ node tartib.mjs
+narx:
  valueOf
12000
`${narx}`:
  toString
12000 so'm
narx + 1:
  valueOf
12001
narx + "":
  valueOf
12000
[ '[object Object]', '', '1,23', 0, 5, NaN ]
```

- `narx + ''` — `"12000 so'm"` emas, `"12000"`. Ishora `"default"`, bu esa `valueOf` ni **birinchi** chaqiradi. Satr kerak bo'lsa — template literal yoki `String(narx)`.
- Oxirgi qator — mashhur "g'alati" natijalar, endi tushunarli. MDN tushuntiradi: oddiy obyekt va massivda `valueOf()` (`Object.prototype` dan meros) **obyektning o'zini** qaytaradi. Bu primitiv emas, shuning uchun e'tiborsiz qoldiriladi va `toString()` chaqiriladi:
  - `{}.toString()` → `"[object Object]"`, `[].toString()` → `""`, shuning uchun `{} + []` → `"[object Object]"`;
  - `[1, 2] + [3]` → `"1,2"` + `"3"`;
  - `+[]` → `+""` → `0`; `+[5]` → `+"5"` → `5`; `+{}` → `+"[object Object]"` → `NaN`.

## Kod: aylantirib bo'lmaganda

```js
const yomon1 = { [Symbol.toPrimitive]() { return {}; } };
try { +yomon1; } catch (e) { console.log(e.name + ': ' + e.message); }
const yomon2 = { valueOf() { return {}; }, toString() { return {}; } };
try { `${yomon2}`; } catch (e) { console.log(e.name + ': ' + e.message); }
const yalang = Object.create(null);
try { yalang + ''; } catch (e) { console.log(e.name + ': ' + e.message); }
const faqatValue = { valueOf() { return {}; }, toString() { return 'toString yutdi'; } };
console.log(faqatValue + '');
```

```text
$ node xato.mjs
TypeError: Cannot convert object to primitive value
TypeError: Cannot convert object to primitive value
TypeError: Cannot convert object to primitive value
toString yutdi
```

- `Symbol.toPrimitive` obyekt qaytardi — MDN: `TypeError` (`valueOf`/`toString` ga o'tilmaydi).
- Ikkala metod ham obyekt qaytardi — `TypeError`.
- `Object.create(null)` — prototipsiz obyekt (57-bob). Unda `valueOf` ham, `toString` ham yo'q — `TypeError`.
- `valueOf` obyekt qaytardi — MDN: e'tiborsiz qoldiriladi va keyingi metod (`toString`) natijasi olinadi.

## Kod: `Date` — istisno

```js
const d = new Date(Date.UTC(2026, 9, 15));
console.log(typeof (d + 1), typeof (d - 1));
console.log(d - new Date(Date.UTC(2026, 9, 14)));
console.log(+d);
```

```text
$ node sana.mjs
string number
86400000
1792022400000
```

`Date` o'z `Symbol.toPrimitive` iga ega. MDN: u `"default"` ni `"string"` deb qabul qiladi. Shuning uchun `d + 1` — satrga birlashtirish. `-` esa doim sonli ishora beradi: ikki sana farqi — millisekundlarda (bir kun = 86 400 000). Sanalar — 37-bobda.

## Nega shunday

Til obyektlar ustida arifmetika va satr amallarini **taqiqlamaydi** — buning o'rniga ularni primitivga aylantirish yo'lini belgilaydi. Ishora tizimi bir obyekt kontekstga qarab turlicha ko'rinishiga imkon beradi: `Date` sonli kontekstda vaqt belgisi (timestamp), satr kontekstida o'qiladigan sana.

`Symbol.toPrimitive` nega symbol? 22-bobda ko'rganimizdek, yangi protokolga satr nom berish mavjud kodni buzishi mumkin edi. `valueOf` va `toString` esa eski, satr nomli protokol — moslik uchun saqlanadi.

## Muhandislik nuqtai nazari

### Yashirin aylantirishga tayanmang

`obj + ''`, `+obj`, `obj == 'x'` — o'quvchi qaysi metod chaqirilishini bilishi uchun bu bobni yodda tutishi kerak. Aniq yozing: `String(obj)`, `Number(obj)`, `obj.toString()`. `==` o'rniga `===` (9-bob) — u aylantirmaydi.

### `toString` — foydali, `valueOf` — ehtiyot bilan

O'z obyektingizga `toString()` qo'shish log va xabarlar uchun foydali. `valueOf()` esa obyektni **sonli** kontekstda ishlatishga ruxsat beradi (`a < b`). Bu faqat obyekt haqiqatan son kabi ma'noga ega bo'lsa o'rinli (`Pul`, `Masofa`). Aks holda `+` dagi `"default"` tartibi kutilmagan natija beradi (yuqoridagi `narx + ''`).

### Pul va o'lchovlar uchun aniq metodlar

`narx1 + narx2` ishlashi qulay ko'rinadi, lekin valyuta, birlik va yaxlitlashni yashiradi. Bunday turlar uchun `narx1.qosh(narx2)` kabi aniq metodlar xatolarni kamaytiradi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `obj + ''` toString chaqiradi deb o'ylash | `valueOf` birinchi (`"default"`) | `String(obj)` yoki template literal |
| `Symbol.toPrimitive` dan obyekt qaytarish | `TypeError: Cannot convert object to primitive value` | Doim primitiv qaytarish |
| `date + 1` son beradi deb kutish | Satr birlashtiriladi | `date.getTime() + 1` yoki `+date + 1` |
| `Object.create(null)` obyektni log'da birlashtirish | `TypeError` | `JSON.stringify` yoki aniq xossa |
| `[] == false` kabi taqqoslashlar | Aylantirish zanjiri, chalkash natija | `===` |
| Massivni `+` bilan birlashtirish: `[1,2] + [3]` | `"1,23"` satri | `[...a, ...b]` yoki `concat` |

## Amaliyot

1. `hint.mjs` dagi har qator uchun ishorani oldindan yozing, keyin ishga tushirib tekshiring. Qayerda adashdingiz?
2. `Harorat` obyektini yozing: `Symbol.toPrimitive` `"number"` da selsiy qiymatini, `"string"` da `"21°C"` ni qaytarsin. `"default"` uchun nima qaytarish mantiqiy?
3. `[] + {}`, `[0] == false`, `+[1, 2]`, `` `${[1, [2, 3]]}` `` — natijalarni algoritm bo'yicha qadamma-qadam chiqaring.
4. `valueOf` va `toString` ning ikkalasi `{}` qaytaradigan obyekt yasang. `String(obj)` va `` `${obj}` `` qanday xato beradi?
5. Nega `new Date() - new Date()` son, `new Date() + new Date()` esa satr? Spetsifikatsiya izohidan foydalanib tushuntiring.

## Rasmiy hujjat

- ECMA-262 — *ToPrimitive*: <https://tc39.es/ecma262/2026/#sec-toprimitive>
- ECMA-262 — *OrdinaryToPrimitive*: <https://tc39.es/ecma262/2026/#sec-ordinarytoprimitive>
- ECMA-262 — *ToPropertyKey*: <https://tc39.es/ecma262/2026/#sec-topropertykey>
- MDN — `Symbol.toPrimitive`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive>
- MDN — *JavaScript data types and data structures* ("Type coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Data_structures#type_coercion>
- MDN — `Date.prototype[Symbol.toPrimitive]()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Symbol.toPrimitive>
