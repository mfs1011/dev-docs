# 30 — Massivlar

[← Oldingi: Unicode va satr ichki tuzilishi](29-unicode.md) · [Mundarija](README.md) · [Keyingi: Massiv metodlari →](31-massiv-metodlari.md)

## Tushuncha

**Massiv** (array) — tartiblangan qiymatlar ro'yxati. MDN: JavaScript'da massivlar primitiv emas, `Array` **obyektlari** va ularning asosiy xususiyatlari:

- **o'lchami o'zgaradi** va **turli turdagi** qiymatlarni saqlay oladi (bu kerak bo'lmasa — typed array'lar, 91-bob);
- **assotsiativ emas** — elementlarga ixtiyoriy satr bilan emas, faqat manfiy bo'lmagan butun son (yoki uning satr ko'rinishi) indeks bilan murojaat qilinadi;
- **noldan indekslanadi** — birinchi element `0`-indeksda, oxirgisi `length - 1` da;
- nusxalash amallari **yuzaki nusxa** yaratadi (17-bob).

## Kod: yaratish va murojaat

```js
const a = ['olma', 42, { x: 1 }, [1, 2], null];
console.log(a.length, a[0], a.at(-1), a[10], typeof a, Array.isArray(a));
console.log([42], Array(3), Array.of(3), Array.from({ length: 3 }, (_, i) => i * i));
try { Array(9.3); } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node asos.mjs
5 olma null undefined object true
[ 42 ] [ <3 empty items> ] [ 3 ] [ 0, 1, 4 ]
RangeError: Invalid array length
```

- `typeof` massiv uchun `'object'` — massivni tekshirish uchun **`Array.isArray()`**.
- Mavjud bo'lmagan indeks — `undefined` (xato emas).
- **Literal `[...]`** — MDN: qisqaroq, shuning uchun odatda afzal.
- **`Array(3)` tuzog'i** — MDN: `Array()` ga **bitta son** berilsa, u element emas, **uzunlik** deb qabul qilinadi. Natija — 3 ta **bo'sh katak**, elementsiz. `Array(9.3)` — `RangeError`. Bitta elementli massiv uchun literal yoki `Array.of`.
- `Array.from({ length: n }, fn)` — `n` ta elementni funksiya bilan to'ldirish.

## Indekslar — aslida xossa nomlari

MDN (*Indexed collections*): amalga oshirish darajasida massivlar elementlarini **oddiy obyekt xossalari** sifatida saqlaydi, indeks — xossa nomi. ECMA-262 (10.4.2): massiv — **ekzotik obyekt** (exotic object), u **massiv indeksi** nomli xossalarga alohida munosabatda bo'ladi; bunday xossa **element** deyiladi.

```js
const yillar = ['2024', '2025', '2026'];
yillar['02'] = 'boshqa';
console.log(yillar[2] === yillar['2'], yillar['02'], yillar.length, Object.keys(yillar));
```

```text
true boshqa 3 [ '0', '1', '2', '02' ]
```

MDN misoli: `yillar[2]` dagi `2` satrga (`'2'`) aylantiriladi — shuning uchun `yillar[2]` va `yillar['2']` bir xil. Lekin `'02'` — massiv indeksi **emas**, oddiy xossa: u `length` ga ta'sir qilmaydi va massiv bo'ylab iteratsiyada ko'rinmaydi. `arr.0` esa sintaksis xatosi — raqam bilan boshlanadigan nom faqat kvadrat qavsda.

## Kod: `length` va bo'sh kataklar

ECMA-262: har massivda o'chirib bo'lmaydigan `length` xossasi bor; u har doim **eng katta indeksdan bitta katta** (2<sup>32</sup> dan kichik). Element qo'shilsa `length` kerak bo'lganda oshadi; `length` kamaytirilsa, undan katta indeksli elementlar **o'chiriladi**.

```js
const m = ['banan', 'olma', 'shaftoli'];
m[5] = 'mango';
console.log(m, m.length, Object.keys(m));
m.length = 2;
console.log(m, m.length);
m.length = 0;
console.log(m);
```

```text
$ node length.mjs
[ 'banan', 'olma', 'shaftoli', <2 empty items>, 'mango' ] 6 [ '0', '1', '2', '5' ]
[ 'banan', 'olma' ] 2
[]
```

- `m[5] = ...` — `length` 6 bo'ldi, 3 va 4 indekslar esa **bo'sh katak** (empty slot): ular `undefined` ham emas, umuman **yo'q** (`Object.keys` da ko'rinmaydi).
- `length = 2` — qolgan elementlar o'chirildi. `length = 0` — massivni tozalashning bir usuli.

### Siyrak massivlar

Bo'sh katakli massiv — **siyrak** (sparse). MDN: bo'sh katak `undefined` bilan to'ldirilgan katakdan **farq qiladi**, va metodlar ularni turlicha ko'radi:

```js
const s = [1, , 3];
console.log(s, 1 in s, s[1], s.map(x => x * 2), s.filter(() => true), [...s], Object.keys(s));
s.forEach(x => console.log('forEach:', x));
for (const x of s) console.log('for...of:', x);
```

```text
[ 1, <1 empty item>, 3 ] false undefined [ 2, <1 empty item>, 6 ] [ 1, 3 ] [ 1, undefined, 3 ] [ '0', '2' ]
forEach: 1
forEach: 3
for...of: 1
for...of: undefined
for...of: 3
```

MDN qoidasi: **eski** metodlar (`forEach`, `map`, `filter`, `some`, `every`, `indexOf`, ...) bo'sh katakni **o'tkazib yuboradi**; **yangi** metodlar (`find`, `includes`, `entries`, `keys`, ...) va `for...of`, spread esa uni `undefined` deb ko'radi. Siyrak massiv yaratadigan yo'llar (MDN): `Array(n)`, ketma-ket vergul `[1, , 3]`, `length` dan uzoq indeksga yozish, `length` ni oshirish va `delete arr[i]`.

## Kod: stek va navbat

```js
const q = [1, 2, 3];
q.push(4); q.unshift(0);
console.log(q);
console.log(q.pop(), q.shift(), q);
```

```text
$ node stek.mjs
[ 0, 1, 2, 3, 4 ]
4 0 [ 1, 2, 3 ]
```

| Metod | Qayerda | Nima qiladi |
| --- | --- | --- |
| `push(...x)` | Oxirida | Qo'shadi, yangi `length` qaytaradi |
| `pop()` | Oxirida | Olib tashlaydi va qaytaradi |
| `unshift(...x)` | Boshida | Qo'shadi |
| `shift()` | Boshida | Olib tashlaydi va qaytaradi |

`push`/`pop` — **stek** (oxirgi kirgan birinchi chiqadi), `push`/`shift` — **navbat** (birinchi kirgan birinchi chiqadi).

### Boshidan qo'shish qimmat

```js
function vaqt(nom, f) { const t = performance.now(); f(); console.log(nom, (performance.now() - t).toFixed(1), 'ms'); }
vaqt('push    x100000:', () => { const a = []; for (let i = 0; i < 100000; i++) a.push(i); });
vaqt('unshift x100000:', () => { const a = []; for (let i = 0; i < 100000; i++) a.unshift(i); });
```

```text
push    x100000: 0.9 ms
unshift x100000: 721.1 ms
```

(Node.js 26.12.0, Apple M4; raqamlar har ishga tushirishda biroz farq qiladi.)

Sababi spetsifikatsiyada ko'rinadi. ECMA-262 *Array.prototype.unshift* algoritmi mavjud elementlarning **har birini** oxiridan boshlab yangi joyga ko'chiradi, keyin yangi elementlarni boshiga yozadi. Ya'ni har `unshift` butun massivni siljitadi. `push` esa faqat oxiriga yozadi. `shift` ham xuddi shunday qolgan elementlarni siljitadi.

## Dvigatel ichida: V8 "elements kinds"

Til darajasida massiv — xossalari bor obyekt. Lekin dvigatellar massivlarni tezroq ishlashi uchun alohida saqlaydi. V8 jamoasining rasmiy blogi (*Elements kinds in V8*): V8 har massiv qanday turdagi elementlarni saqlashini **kuzatib boradi** va amallarni shunga moslab optimallashtiradi. Bu ichki ma'lumot JavaScript'ga ochilmaydi, lekin Node'ning `--allow-natives-syntax` bayrog'i bilan ko'rish mumkin:

```js
function tur(a) { %DebugPrint(a); }
const a = [1, 2, 3];   tur(a);
a.push(4.56);          tur(a);
a.push('x');           tur(a);
const b = [1, 2, 3];
b[10] = 4;             tur(b);
```

```text
$ node --allow-natives-syntax kind.mjs 2>&1 | grep 'elements kind:'
 - elements kind: PACKED_SMI_ELEMENTS
 - elements kind: PACKED_DOUBLE_ELEMENTS
 - elements kind: PACKED_ELEMENTS
 - elements kind: HOLEY_SMI_ELEMENTS
```

(`%DebugPrint` — oddiy JavaScript emas, faqat shu bayroq bilan ishlaydigan V8 ichki funksiyasi. Ishlab chiqarish kodida ishlatilmaydi.)

V8 blogi bo'yicha:

- **SMI** — kichik butun sonlar, **DOUBLE** — kasrli sonlar, oddiy **ELEMENTS** — qolgan hamma narsa.
- **PACKED** — zich massiv; **HOLEY** — bo'sh katakli. Blog: zich massivlardagi amallar teshikli massivlarga qaraganda **samaraliroq** optimallashtiriladi — teshikli massivda qo'shimcha tekshiruvlar va prototip zanjirida qidiruv kerak bo'ladi.
- O'tishlar faqat **bir tomonga** — aniqroq turdan umumiyroq turga. Bitta kasr son qo'shilsa, massiv keyin butun son bilan almashtirilsa ham DOUBLE bo'lib qoladi; teshik paydo bo'lsa — massiv HOLEY bo'lib qoladi (blogdagi 2025-yilgi yangilanish: `Array.prototype.fill` bundan istisno).

Blog ham ta'kidlaydi: ko'p hollarda bu kuzatuv ko'rinmas ishlaydi va u haqda o'ylash shart emas. Lekin uning maslahatlari foydali:

- **Massiv uzunligidan tashqarini o'qimang** — `i <= arr.length` kabi xato sikl chegarasi chegaradan tashqariga murojaat qiladi va V8 prototip zanjirini qidirishga majbur bo'ladi.
- **Keraksiz tur o'zgarishlaridan saqlaning** — masalan, butun sonlar massiviga `-0`, `NaN` yoki `Infinity` qo'shish uni DOUBLE ga o'tkazadi.

## Kod: massivga o'xshash obyektlar va ko'p o'lchamli massivlar

```js
function f() {
  try { arguments.forEach(x => x); } catch (e) { console.log(e.name + ': ' + e.message); }
  console.log(Array.isArray(arguments), Array.from(arguments), [...arguments]);
}
f('a', 'b');
const oxshash = { 0: 'a', 1: 'b', length: 2 };
console.log(Array.from(oxshash), Array.prototype.map.call(oxshash, x => x.toUpperCase()));
const matritsa = Array.from({ length: 3 }, (_, i) => Array.from({ length: 3 }, (_, j) => i * 3 + j));
console.log(matritsa, matritsa[1][2]);
const yomon = Array(3).fill([]);
yomon[0].push('x');
console.log(yomon);
```

```text
$ node arraylike.mjs
TypeError: arguments.forEach is not a function
false [ 'a', 'b' ] [ 'a', 'b' ]
[ 'a', 'b' ] [ 'A', 'B' ]
[ [ 0, 1, 2 ], [ 3, 4, 5 ], [ 6, 7, 8 ] ] 5
[ [ 'x' ], [ 'x' ], [ 'x' ] ]
```

- **Massivga o'xshash** (array-like) obyekt — MDN: `arguments` yoki DOM'dagi `NodeList` kabi — massivdek ko'rinadi, lekin massiv metodlari yo'q. Yechim: `Array.from()` bilan haqiqiy massivga aylantirish yoki MDN ko'rsatganidek `Array.prototype.metod.call(obyekt, ...)`.
- **Ko'p o'lchamli massiv** — massivlar massivi; `matritsa[qator][ustun]`.
- **`fill([])` tuzog'i** — uchala katakka **bitta** massivga havola yoziladi (17-bob). Har qatorga alohida massiv kerak bo'lsa — `Array.from({ length }, () => [])`.

## Nega shunday

Massivlar obyektlar ustiga qurilgan: indekslar — xossa nomlari, `length` — maxsus qoidali xossa (ECMA-262: massiv — ekzotik obyekt). Shuning uchun massivga istalgan xossa qo'shish, bo'sh katak qoldirish yoki `length` ni qo'lda o'zgartirish mumkin. Bu moslashuvchanlik bilan bir qatorda tuzoqlarni ham yaratadi: siyrak massivlar, `Array(n)` noaniqligi, `'02'` kabi "yolg'on indekslar".

Dvigatellar esa haqiqiy kodda massivlar ko'pincha zich va bir turli bo'lishiga tayanib, ularni alohida, tez tuzilmada saqlaydi (V8 elements kinds). Bu optimallash **tilning semantikasini o'zgartirmaydi** — faqat tezlikka ta'sir qiladi.

## Muhandislik nuqtai nazari

### Zich va bir turli massivlar

Massivni literal yoki `push` bilan to'ldiring, oraliq indeksga sakramang, `delete arr[i]` ishlatmang (element o'chirish uchun `splice` yoki `filter`, 31-bob). Bir massivda bitta turdagi qiymatlar saqlang. Bu ham o'qilishi oson kod, ham V8 blogidagi tavsiyaga mos.

### Navbat uchun `shift` — kichik massivlarda

Kichik navbatlar uchun `push`/`shift` yetarli. Yuz minglab elementli navbatda `shift`/`unshift` har chaqiruvda butun massivni siljitadi — o'lchab ko'ring; kerak bo'lsa boshqa tuzilma (masalan, indeks bilan yuradigan "bosh" ko'rsatkichi) ishlating.

### `Array.isArray` — yagona ishonchli tekshiruv

`typeof` — `'object'`, `instanceof Array` boshqa realm'dan (masalan, `iframe`) kelgan massivda `false` beradi. `Array.isArray` ikkala holatda ham to'g'ri.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `Array(5)` — 5 soni bor massiv deb o'ylash | 5 ta bo'sh katak | `[5]` yoki `Array.of(5)` |
| `typeof arr === 'array'` | Doim `false` | `Array.isArray(arr)` |
| `delete arr[i]` | Bo'sh katak qoladi, `length` o'zgarmaydi | `arr.splice(i, 1)` |
| `Array(n).fill([])` | Hamma qator bitta massiv | `Array.from({ length: n }, () => [])` |
| `Array(3).map((_, i) => i)` | `[ <3 empty items> ]` — `map` bo'sh kataklarni o'tkazadi | `Array.from({ length: 3 }, (_, i) => i)` |
| `for (let i = 0; i <= a.length; i++)` | Oxirgi qadam `undefined` o'qiydi | `i < a.length` yoki `for...of` |
| `arguments.map(...)` | `TypeError` | `Array.from(arguments)` yoki rest (42-bob) |

## Amaliyot

1. `const a = []; a[3] = 'x';` — `a.length`, `Object.keys(a)`, `a.indexOf(undefined)`, `a.includes(undefined)` natijalarini oldindan yozing va tekshiring.
2. `a.length = 0` va `a = []` farqi nimada? Massivga ikkinchi havola bo'lsa natijani taqqoslang (17-bob).
3. 5×5 ko'paytirish jadvalini ikki o'lchamli massiv sifatida yarating.
4. `stek.mjs` dagi o'lchovni `shift` uchun ham qo'shing. Nega `pop` tez, `shift` sekin?
5. `kind.mjs` ga `const c = [1, 2, 3]; c.push(-0);` qo'shing va elements kind'ni tekshiring.

## Rasmiy hujjat

- MDN — `Array`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array>
- MDN — *Indexed collections* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections>
- MDN — `Array.isArray()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray>
- ECMA-262 — *Array Exotic Objects*: <https://tc39.es/ecma262/2026/#sec-array-exotic-objects>
- ECMA-262 — *Array.prototype.unshift*: <https://tc39.es/ecma262/2026/#sec-array.prototype.unshift>
- V8 — *Elements kinds in V8*: <https://v8.dev/blog/elements-kinds>
