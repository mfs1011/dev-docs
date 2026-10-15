# 31 — Massiv metodlari

[← Oldingi: Massivlar](30-massivlar.md) · [Mundarija](README.md) · [Keyingi: Iterable obyektlar →](32-iterable-obyektlar.md)

## Tushuncha

`Array.prototype` da o'nlab metod bor. Ularni eslab qolishning eng yaxshi yo'li — MDN'dagi ikki tasnif:

1. **O'zgartiruvchi** (mutating) va **nusxa qaytaruvchi** (copying) metodlar. MDN: ba'zi metodlar asl massivni o'zgartiradi, boshqalari yangi massiv qaytaradi. Nusxa har doim **yuzaki** (17-bob): obyekt elementlarning havolasi ko'chiriladi.
2. **Iterativ** metodlar — callback oladigan va har element uchun ko'pi bilan bir marta chaqiradigan metodlar (`map`, `filter`, `find`, `some`, ...).

MDN jadvali — o'zgartiruvchi metod va uning o'zgartirmaydigan muqobili:

| O'zgartiradi | O'zgartirmaydigan muqobil |
| --- | --- |
| `push(v)` | `concat([v])` |
| `pop()` | `slice(0, -1)` |
| `shift()` | `slice(1)` |
| `unshift(v)` | `toSpliced(0, 0, v)` |
| `splice(...)` | `toSpliced(...)` |
| `sort()` | `toSorted()` |
| `reverse()` | `toReversed()` |
| `arr[i] = v` | `with(i, v)` |
| `fill()`, `copyWithin()` | Bitta metodli muqobil yo'q |

## Iterativ metodlar

MDN: iterativ metodlar bir xil imzoga ega — `metod(callbackFn, thisArg)`. Callback uchta argument oladi: **element**, **indeks** va **massivning o'zi**.

```js
const mahsulot = [
  { nom: 'non', narx: 4000, tur: 'oziq' },
  { nom: 'sut', narx: 12000, tur: 'oziq' },
  { nom: 'daftar', narx: 6000, tur: 'kantselyariya' },
  { nom: 'ruchka', narx: 3000, tur: 'kantselyariya' },
];
console.log(mahsulot.map(m => m.nom));
console.log(mahsulot.filter(m => m.narx > 5000).map(m => m.nom));
console.log(mahsulot.reduce((jami, m) => jami + m.narx, 0));
console.log(mahsulot.find(m => m.tur === 'kantselyariya').nom, mahsulot.findLast(m => m.tur === 'kantselyariya').nom);
console.log(mahsulot.findIndex(m => m.nom === 'yo\'q'), mahsulot.some(m => m.narx > 10000), mahsulot.every(m => m.narx > 1000));
console.log(Object.groupBy(mahsulot, m => m.tur));
console.log([[1, 2], [3, [4]]].flat(), ['a b', 'c'].flatMap(s => s.split(' ')));
```

```text
$ node asosiy.mjs
[ 'non', 'sut', 'daftar', 'ruchka' ]
[ 'sut', 'daftar' ]
25000
daftar ruchka
-1 true true
[Object: null prototype] {
  oziq: [
    { nom: 'non', narx: 4000, tur: 'oziq' },
    { nom: 'sut', narx: 12000, tur: 'oziq' }
  ],
  kantselyariya: [
    { nom: 'daftar', narx: 6000, tur: 'kantselyariya' },
    { nom: 'ruchka', narx: 3000, tur: 'kantselyariya' }
  ]
}
[ 1, 2, 3, [ 4 ] ] [ 'a', 'b', 'c' ]
```

| Metod | Qaytaradi | Qachon |
| --- | --- | --- |
| `map(f)` | Har elementdan yangi qiymat — teng uzunlikdagi massiv | O'zgartirish (transform) |
| `filter(f)` | `f` truthy qaytargan elementlar | Saralab olish |
| `reduce(f, boshlang'ich)` | Bitta yig'ilgan qiymat | Yig'indi, sanash, guruhlash |
| `find(f)` / `findLast(f)` | Birinchi / oxirgi mos element yoki `undefined` | Bitta elementni qidirish |
| `findIndex(f)` / `findLastIndex(f)` | Indeks yoki `-1` | |
| `some(f)` / `every(f)` | `true`/`false` | "Birortasi" / "hammasi" |
| `forEach(f)` | `undefined` | Faqat yon ta'sir uchun |
| `flat(chuqurlik)`, `flatMap(f)` | Tekislangan massiv (standart chuqurlik — 1) | Ichma-ich massivlar |

- MDN: `every`, `find`, `findIndex`, `findLast`, `findLastIndex` va `some` natija aniq bo'lishi bilan **to'xtaydi** — callback hamma elementda chaqirilmasligi mumkin.
- `Object.groupBy(massiv, f)` — elementlarni `f` qaytargan kalit bo'yicha guruhlaydi. Natija — **prototipsiz** obyekt (`[Object: null prototype]`), shuning uchun `toString` kabi meros kalitlar bilan to'qnashmaydi.

## Kod: `reduce` va callback argumentlari

```js
try { [].reduce((a, b) => a + b); } catch (e) { console.log(e.name + ': ' + e.message); }
console.log([].reduce((a, b) => a + b, 0));
const sozlar = ['olma', 'nok', 'olma', 'uzum', 'olma'];
console.log(sozlar.reduce((acc, s) => { acc[s] = (acc[s] ?? 0) + 1; return acc; }, {}));
const chaqiruv = [];
[10, 20, 30].map((x, i, arr) => chaqiruv.push(`${x}@${i}/${arr.length}`));
console.log(chaqiruv);
console.log(['1', '2', '3'].map(parseInt), ['1', '2', '3'].map(Number));
```

```text
$ node reduce.mjs
TypeError: Reduce of empty array with no initial value
0
{ olma: 3, nok: 1, uzum: 1 }
[ '10@0/3', '20@1/3', '30@2/3' ]
[ 1, NaN, NaN ] [ 1, 2, 3 ]
```

- MDN: massiv bo'sh va boshlang'ich qiymat berilmagan bo'lsa — `TypeError`. Boshlang'ich qiymatni **har doim** bering.
- `reduce` — yig'ishning umumiy vositasi: bu yerda so'zlarni sanash.
- `['1', '2', '3'].map(parseInt)` — mashhur tuzoq. `map` callback'ga uch argument beradi: `parseInt('2', 1)` (asos 1 — yaroqsiz) va `parseInt('3', 2)` (ikkilikda `3` yo'q) → `NaN`. Yechim — bitta argument oladigan funksiya yoki aniq arrow: `s => parseInt(s, 10)`.

## Kod: `sort` va uning tuzoqlari

```js
console.log([9, 80, 1, 100].sort());
console.log([9, 80, 1, 100].sort((a, b) => a - b), [9, 80, 1, 100].sort((a, b) => b - a));
console.log([3, undefined, 1, , 2].sort());
const asl = [3, 1, 2];
const tartib = asl.sort();
console.log(tartib === asl, asl);
```

```text
$ node sort.mjs
[ 1, 100, 80, 9 ]
[ 1, 9, 80, 100 ] [ 100, 80, 9, 1 ]
[ 1, 2, 3, undefined, <1 empty item> ]
true [ 1, 2, 3 ]
```

1. **Standart tartib — satr tartibi.** MDN: taqqoslagich berilmasa, elementlar **satrga aylantiriladi** va UTF-16 kod birliklari tartibida solishtiriladi. Shuning uchun `"80"` `"9"` dan oldin. Sonlar uchun **har doim** taqqoslagich: `(a, b) => a - b` (o'sish), `(a, b) => b - a` (kamayish).
2. **Taqqoslagich qoidasi** (MDN): manfiy — `a` oldin, musbat — `b` oldin, `0` — asl tartib saqlanadi.
3. `undefined` lar oxiriga, bo'sh kataklar esa ulardan ham keyin (MDN).
4. **`sort` asl massivni o'zgartiradi** va **o'sha massivni** qaytaradi (`tartib === asl`).

MDN taqqoslagichdan **sof** (tashqi holatni o'zgartirmaydigan) va **izchil** (bir juft uchun doim bir xil javob) bo'lishni talab qiladi, chunki u qachon va necha marta chaqirilishi kafolatlanmagan.

**Barqarorlik** (stability) — MDN: ES2019 dan beri spetsifikatsiya `sort` ning **barqaror** bo'lishini talab qiladi. Teng elementlar asl tartibini saqlaydi.

## Kod: o'zgartirmaydigan metodlar

```js
const b = [3, 1, 2];
console.log(b.toSorted(), b, b.toReversed(), b.with(0, 99), b.toSpliced(1, 1), b);
const talaba = [{ ism: 'Ali', baho: 5 }, { ism: 'Bek', baho: 4 }, { ism: 'Dil', baho: 5 }, { ism: 'Eli', baho: 4 }];
console.log(talaba.toSorted((x, y) => y.baho - x.baho).map(t => t.ism).join(' '));
```

```text
[ 1, 2, 3 ] [ 3, 1, 2 ] [ 2, 1, 3 ] [ 99, 1, 2 ] [ 3, 2 ] [ 3, 1, 2 ]
Ali Dil Bek Eli
```

- `toSorted`, `toReversed`, `toSpliced`, `with` — asl `b` o'zgarmadi. MDN: ular har doim oddiy `Array` qaytaradi.
- Ikkinchi qator — barqarorlik: baho bo'yicha saralanganda Ali Dil'dan, Bek Eli'dan oldin qoldi (asl tartib).

## Kod: `splice`, `slice` va boshqalar

```js
const a = ['a', 'b', 'c', 'd'];
console.log(a.splice(1, 2), a);
a.splice(1, 0, 'X', 'Y');
console.log(a);
console.log(a.slice(1, 3), a.indexOf('Y'), a.includes('Z'), a.join('|'), a.concat(['e'], 'f'));
const n = [1, 2, 3];
n.reverse(); console.log(n);
console.log(new Array(3).fill(0), [1, 2, 3, 4].copyWithin(0, 2));
```

```text
$ node ozgartirish.mjs
[ 'b', 'c' ] [ 'a', 'd' ]
[ 'a', 'X', 'Y', 'd' ]
[ 'X', 'Y' ] 2 false a|X|Y|d [ 'a', 'X', 'Y', 'd', 'e', 'f' ]
[ 3, 2, 1 ]
[ 0, 0, 0 ] [ 3, 4, 3, 4 ]
```

- **`splice(boshi, soni, ...yangi)`** — "shveytsariya pichog'i": o'chiradi, qo'shadi, almashtiradi; **asl massivni o'zgartiradi** va o'chirilganlarni qaytaradi.
- **`slice(boshi, oxiri)`** — nusxa, asl massiv o'zgarmaydi. Nomlari o'xshash, xulqi qarama-qarshi — eng ko'p chalkashtiriladigan juftlik.
- `concat` massiv argumentlarni ochadi, boshqa qiymatlarni qo'shadi.

## Kod: `Array.fromAsync` (ES2026)

**`Array.fromAsync`** — ES2026 da qo'shildi (ES2025 spetsifikatsiyasida yo'q). MDN: u massivni **asinxron iterable**'dan (async generator, stream), oddiy iterable'dan yoki massivga o'xshash obyektdan yaratadi. U `for await...of` ga juda o'xshash ishlaydi va **Promise** qaytaradi.

```js
async function* sahifalar() {
  for (let i = 1; i <= 3; i++) {
    await new Promise(r => setTimeout(r, 10));
    yield `sahifa-${i}`;
  }
}
console.log(await Array.fromAsync(sahifalar()));
console.log(await Array.fromAsync([Promise.resolve(1), 2, Promise.resolve(3)], x => x * 10));
```

```text
$ node async.mjs
[ 'sahifa-1', 'sahifa-2', 'sahifa-3' ]
[ 10, 20, 30 ]
```

Ikkinchi qator: oddiy massivdagi Promise'lar ham kutildi, keyin `x => x * 10` qo'llandi. Async generatorlar — 81-bobda.

## Nega shunday

MDN ikki xil metod borligini ochiq aytadi: ba'zilari asl massivni o'zgartiradi, ba'zilari yangi massiv qaytaradi. O'zgartiruvchi metodning nusxa beruvchi muqobilini olishning eski usuli — avval nusxa olish: `[...arr].sort()` yoki `arr.slice().sort()`. `toSorted`, `toReversed`, `toSpliced` va `with` buni bitta chaqiruvga aylantiradi: MDN jadvalida `sort`, `reverse`, `splice` va indeks bo'yicha yozishning har biriga to'g'ridan-to'g'ri jufti bor.

`sort` ning standart xulqi — MDN bo'yicha: taqqoslagich berilmasa, `undefined` bo'lmagan hamma elementlar satrga aylantirilib, UTF-16 kod birliklari tartibida solishtiriladi. Bu har qanday turdagi qiymatlar aralashmasi uchun aniq natija beradi, lekin sonlar uchun kutilgan tartib emas — shuning uchun sonlarda taqqoslagich majburiy.

## Muhandislik nuqtai nazari

### `forEach` + `push` o'rniga `map`/`filter`

```js
// Yomon:
const nomlar = [];
mahsulot.forEach(m => { if (m.narx > 5000) nomlar.push(m.nom); });
// Yaxshi:
const nomlar2 = mahsulot.filter(m => m.narx > 5000).map(m => m.nom);
```

Ikkinchisi niyatni ifodalaydi va tashqi o'zgaruvchini o'zgartirmaydi.

### `reduce` ni haddan oshirmang

`reduce` bilan hamma narsani yozish mumkin, lekin o'qish qiyin. Yig'indi, sanash — `reduce`; guruhlash — `Object.groupBy`/`Map.groupBy`; "bormi?" — `some`; filtrlash + o'zgartirish — `filter` + `map` yoki `flatMap`.

### Iteratsiya paytida massivni o'zgartirmang

MDN: iterativ metodlar ichida massivni o'zgartirmaslik kerak (`array` argumenti bunga imkon bersa ham). Natija kutilmagan bo'ladi.

### Katta massivlarda zanjir

`a.filter(...).map(...).slice(0, 10)` har bosqichda yangi massiv yaratadi. Ko'p ming elementda va birinchi bir nechtasi kerak bo'lsa, iterator helper'lari (82-bob) foydali: MDN bo'yicha ular iteratorni bir marta aylanib chiqadi va oraliq qiymatlarni saqlab qo'ymaydi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `[10, 9, 1].sort()` | `[1, 10, 9]` | `sort((a, b) => a - b)` |
| `const s = arr.sort()` — `arr` o'zgarmaydi deb o'ylash | `arr` ham saralandi | `arr.toSorted()` |
| `['1','2'].map(parseInt)` | `[1, NaN]` | `.map(Number)` yoki `s => parseInt(s, 10)` |
| `[].reduce(f)` | `TypeError` | Boshlang'ich qiymat bering |
| `map` natijasini ishlatmaslik | Bekor massiv yaratiladi | `forEach` yoki `for...of` |
| `find` natijasini tekshirmaslik | `undefined.xossa` — `TypeError` | `?.` yoki tekshiruv |
| `splice` va `slice` ni chalkashtirish | Asl massiv kutilmaganda o'zgaradi | Jadvalni eslang |
| Taqqoslagichda `a > b` (mantiqiy) qaytarish | Noto'g'ri tartib | Son qaytaring: `a - b` |

## Amaliyot

1. `mahsulot` massividan: eng qimmat mahsulot nomini, har turdagi jami narxni (`Object.groupBy` + `reduce`) va narxi 5000 dan kam mahsulotlar sonini toping.
2. `talaba` massivini avval baho (kamayish), keyin ism (`localeCompare`) bo'yicha saralang — bitta taqqoslagich bilan.
3. `unikal(arr)` funksiyasini ikki xil yozing: `filter` + `indexOf` va `Set` (33-bob). 10 000 elementda vaqtini o'lchang.
4. `ichki = [1, [2, [3, [4]]]]` ni to'liq tekislang (`flat(Infinity)`).
5. `Array.fromAsync` bilan uchta `fetch` o'xshatmasini (`setTimeout` li Promise) ketma-ket kuting va `Promise.all` bilan farqini o'lchang.

## Rasmiy hujjat

- MDN — `Array` ("Copying methods and mutating methods", "Iterative methods"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods>
- MDN — `Array.prototype.sort()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort>
- MDN — `Array.prototype.reduce()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce>
- MDN — `Array.prototype.toSorted()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted>
- MDN — `Object.groupBy()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy>
- MDN — `Array.fromAsync()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fromAsync>
- ECMA-262 — *Array.fromAsync*: <https://tc39.es/ecma262/2026/#sec-array.fromasync>
- ECMA-262 — *Array.prototype.toSorted*: <https://tc39.es/ecma262/2026/#sec-array.prototype.tosorted>
