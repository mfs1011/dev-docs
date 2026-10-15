# 17 — Havola va nusxa

[← Oldingi: Obyektlar](16-obyektlar.md) · [Mundarija](README.md) · [Keyingi: Garbage collection →](18-garbage-collection.md)

## Tushuncha

6- va 13-boblarda ko'rgan qoidani endi to'liq ochamiz: **primitiv** o'zgaruvchida **qiymatning o'zi** saqlanadi, **obyekt** o'zgaruvchisida esa obyektga **havola** (reference) — "u xotirada qayerda" degan ko'rsatkich.

```text
let x = 5;  let y = x;            const a = {...};  const b = a;

 x ─ 5                             a ──┐
 y ─ 5   (alohida nusxa)               ├──▶ { ism: 'Ali', ... }   (bitta obyekt)
                                   b ──┘
```

Shuning uchun obyektni boshqa o'zgaruvchiga berish, funksiyaga uzatish yoki massivga qo'yish **nusxa yaratmaydi** — faqat havolani nusxalaydi. Haqiqiy nusxa kerak bo'lsa, uni ataylab yaratish kerak, va bu yerda ikki xil nusxa bor:

| | **Yuzaki nusxa** (shallow copy) | **Chuqur nusxa** (deep copy) |
| --- | --- | --- |
| Yuqori daraja xossalari | Yangi | Yangi |
| Ichma-ich obyektlar | **Asl bilan umumiy** (bir xil havola) | Ular ham **yangi** |
| Vositalar | `{...obj}`, `Object.assign`, `slice`, `Array.from`, `concat` | `structuredClone()`, (cheklov bilan) JSON |

## Kod: havola — bitta obyekt, ikki nom

```js
const a = { ism: 'Ali', manzil: { shahar: 'Toshkent' } };
const b = a;
b.ism = 'Vali';
console.log(a.ism, a === b);
```

```text
Vali true
```

`b = a` nusxa emas — `a` va `b` **bitta** obyektga qaraydi. Biri orqali o'zgartirish ikkinchisida ham ko'rinadi. `a === b` — `true`, chunki obyektlar havola bo'yicha solishtiriladi (9-bob).

## Kod: yuzaki nusxa

```js
const asl = { ism: 'Ali', teglar: ['js'], manzil: { shahar: 'Toshkent' } };
const n1 = { ...asl };
const n2 = Object.assign({}, asl);
n1.ism = 'Vali';
n1.manzil.shahar = 'Samarqand';
n2.teglar.push('css');
console.log(asl);
console.log(n1 === asl, n1.manzil === asl.manzil);
```

```text
$ node yuzaki.mjs
{
  ism: 'Ali',
  teglar: [ 'js', 'css' ],
  manzil: { shahar: 'Samarqand' }
}
false true
```

MDN (*Shallow copy* glossary): yuzaki nusxaning xossalari asl obyekt xossalari bilan **bir xil havolalarni** bo'lishadi. Shuning uchun:

- nusxaning **yuqori darajadagi** xossasiga yangi qiymat berish aslga ta'sir qilmaydi — `n1.ism = 'Vali'` dan keyin `asl.ism` — hamon `'Ali'`;
- nusxadagi **ichma-ich obyektni** o'zgartirish **aslga ham ta'sir qiladi** — `manzil.shahar` va `teglar` asl obyektda ham o'zgardi. `n1.manzil === asl.manzil` — `true`: bu bitta obyekt.

MDN: JavaScript'dagi **barcha standart built-in nusxalash amallari** — spread sintaksisi, `Array.prototype.concat()`, `slice()`, `Array.from()`, `Object.assign()` — **yuzaki** nusxa yaratadi.

Massivlarda ham xuddi shunday:

```js
const royxat = [1, [2, 3]];
const k = royxat.slice();
k[0] = 100; k[1].push(4);
console.log(royxat);
```

```text
[ 1, [ 2, 3, 4 ] ]
```

`k[0] = 100` aslga tegmadi, ichki massivga `push` esa tegdi.

## Kod: chuqur nusxa — `structuredClone`

MDN (*Deep copy* glossary): chuqur nusxa asl obyekt bilan **hech qanday havolani bo'lishmaydi** — biridagi o'zgarish ikkinchisiga ta'sir qilmasligiga ishonch hosil qilish mumkin. MDN (`structuredClone()`): bu funksiya JavaScript qiymatlarining **chuqur nusxasi**ni yaratadi va **aylanma havolalarni** (obyekt o'ziga ishora qilsa) ham qo'llab-quvvatlaydi.

```js
const asl = {
  ism: 'Ali', sana: new Date('2026-10-15'), teglar: new Set(['js']),
  ichki: { a: [1, 2] }, yoq: undefined,
};
asl.ozi = asl;
const nusxa = structuredClone(asl);
nusxa.ichki.a.push(3);
console.log(asl.ichki.a, nusxa.ichki.a, nusxa.ozi === nusxa, nusxa.sana instanceof Date, nusxa.teglar);
```

```text
[ 1, 2 ] [ 1, 2, 3 ] true true Set(1) { 'js' }
```

- ichki massiv mustaqil — asl `[1, 2]` bo'lib qoldi;
- aylanma havola to'g'ri nusxalandi: `nusxa.ozi` — **nusxaning o'zi**, asl emas;
- `Date` — `Date` bo'lib, `Set` — `Set` bo'lib qoldi.

`structuredClone()` — host API: u ECMAScript'da yo'q (1-bob), uni HTML standarti belgilaydi va brauzerlar beradi; Node.js'da u v17.0.0 dan beri global funksiya (Node.js *Globals* hujjati). Brauzerlardagi holati — MDN sahifasidagi "Browser compatibility" jadvalida.

### JSON orqali "nusxa" — va uning chegaralari

MDN: obyekt **serializatsiya qilinadigan** bo'lsa, chuqur nusxaning bir usuli — `JSON.parse(JSON.stringify(obj))`. Lekin bu faqat JSON'da ifodalanadigan ma'lumot uchun:

```js
const json = JSON.parse(JSON.stringify({ ism: 'Ali', sana: new Date('2026-10-15'), teglar: new Set(['js']), yoq: undefined, f() {} }));
console.log(json);
try { JSON.stringify(asl); } catch (e) { console.log(e.name + ':', e.message.split('\n')[0]); }
```

```text
{ ism: 'Ali', sana: '2026-10-15T00:00:00.000Z', teglar: {} }
TypeError: Converting circular structure to JSON
```

- `Date` — **satrga** aylanib qoldi;
- `Set` — bo'sh obyekt `{}`;
- `undefined` qiymatli xossa va funksiya — **tushib qoldi**;
- aylanma havola — **xato**.

JSON usulini faqat "toza ma'lumot" (satr, son, boolean, `null`, oddiy obyekt va massiv) uchun ishlating. Boshqa holatlarda — `structuredClone`.

### `structuredClone` nimani nusxalay olmaydi

MDN (*The structured clone algorithm*):

```js
try { structuredClone({ f() {} }); } catch (e) { console.log(e.name + ':', e.message); }
class Nuqta { constructor(x) { this.x = x; } uzunlik() { return Math.abs(this.x); } }
const n = structuredClone(new Nuqta(-3));
console.log(n, n instanceof Nuqta, typeof n.uzunlik);
```

```text
DataCloneError: f() {} could not be cloned.
{ x: -3 } false undefined
```

- **Funksiyalar** nusxalanmaydi — `DataCloneError`. DOM tugunlari ham.
- **Prototiplar zanjiri** kezilmaydi va nusxalanmaydi — klass nusxasi **oddiy obyektga** aylanadi: `n instanceof Nuqta` — `false`, metodlar yo'q.
- Klassning **private** maydonlari (`#x`) nusxalanmaydi.
- Ba'zi xossalar saqlanmaydi (masalan, `RegExp` ning `lastIndex` i).

Ya'ni `structuredClone` — **ma'lumot** uchun (holat, sozlamalar, server javobi), xulqli obyektlar (klasslar) uchun emas. Klass nusxasi kerak bo'lsa — klassga o'zining nusxalash metodini yozing.

## Nega shunday

Havola bo'yicha ishlashning foydasi — katta obyektni funksiyaga uzatish yoki massivga qo'yish uni nusxalashni talab qilmaydi: faqat havola ko'chadi. Narxi — **umumiy o'zgaruvchan holat**: bitta obyektni bir necha joy o'zgartirsa, kim nimani o'zgartirganini kuzatish qiyin.

MDN (*Shallow copy*) yana bir nozik joyni ta'kidlaydi: JavaScript'da **umumiy** yuzaki nusxa mexanizmi yo'q — mavjudlari faqat muayyan tiplar (oddiy obyekt, massiv) uchun. Shuning uchun kutubxonalar texnik tafsilotlarda farq qiladi: sanaluvchi bo'lmagan va Symbol xossalar nusxalanadimi, getter/setter getter bo'lib qoladimi va h.k. Chuqur nusxada ham xuddi shunday (MDN *Deep copy*): "haqiqiy" chuqur nusxaning built-in mexanizmi yo'q, `structuredClone` ham o'z cheklovlari bilan.

## Muhandislik nuqtai nazari

### O'zgarmas yangilash — React misolida

React holat o'zgarganini **havola** bo'yicha aniqlaydi (9-bob: React hujjatiga ko'ra yangi va eski qiymat `Object.is` bilan solishtiriladi). Shuning uchun holatni joyida o'zgartirish (`state.items.push(x)`) o'zgarishni "ko'rinmas" qiladi. To'g'ri yo'l — **o'zgargan yo'l bo'ylab yangi obyektlar** yaratish:

```js
const yangi = {
  ...holat,
  foydalanuvchi: { ...holat.foydalanuvchi, ism: 'Vali' },
  // holat.royxat — o'zgarmagan, havolasi saqlanadi (bu yaxshi: arzon)
};
```

Bu — yuzaki nusxaning **ataylab** ishlatilishi: o'zgarmagan qismlar umumiy qoladi, o'zgarganlari yangi.

### Funksiya argumentlarini o'zgartirmang

13-bobda aytilganidek: funksiya o'ziga berilgan obyektni o'zgartirsa, chaqiruvchi buni kutmasligi mumkin. Yangi obyekt qaytaring. Massivlarda — o'zgartirmaydigan metodlar: `toSorted`, `toReversed`, `with` (31-bob).

### Chuqur nusxani kerak bo'lganda emas, kerak bo'lgani uchun

`structuredClone` har chaqiruvda butun tuzilmani kezadi — katta ma'lumotda qimmat. Avval savol bering: haqiqatan mustaqil nusxa kerakmi yoki faqat bir qismni yangilash (yuqoridagi pattern) yetadimi?

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `const b = a` ni nusxa deb o'ylash | Ikkalasi bitta obyekt | `{ ...a }` yoki `structuredClone(a)` |
| `{...obj}` ni chuqur nusxa deb o'ylash | Ichki obyektlar umumiy | `structuredClone` |
| JSON bilan `Date`, `Map`, `Set` nusxalash | Satr va `{}` bo'lib qoladi | `structuredClone` |
| `structuredClone` bilan klass nusxalash | Oddiy obyekt, metodlarsiz | O'z nusxalash metodi |
| Funksiyali obyektni `structuredClone` | `DataCloneError` | Faqat ma'lumot qismini nusxalash |
| React state'ni joyida o'zgartirish | O'zgarish aniqlanmaydi | Yangi obyekt |

## Amaliyot

1. `const a = [1, 2]; const b = a; b.push(3);` va `const c = [...a]; c.push(4);` — `a` nimaga teng? Har bir qatordan keyin chizma chizing.
2. `const sozlama = { mavzu: { rang: 'oq' }, til: 'uz' };` ni yuzaki nusxalab, nusxada `mavzu.rang` ni o'zgartiring. Aslga ta'sir qildimi? `structuredClone` bilan takrorlang.
3. `Map`, `Date`, `RegExp`, `Error` va aylanma havolali obyektni `structuredClone` va JSON usuli bilan nusxalang. Natijalarni jadvalga yozing.
4. `yangilaShahar(foydalanuvchi, shahar)` funksiyasini yozing: asl obyektga tegmasdan, `manzil.shahar` o'zgargan yangi obyekt qaytarsin. `asl.manzil !== yangi.manzil` va `asl.teglar === yangi.teglar` ekanini tekshiring.
5. O'zingiz uchun `chuqurNusxa(x)` yozing (oddiy obyekt, massiv va primitivlar uchun, rekursiv). Aylanma havolada nima bo'ladi? `structuredClone` buni qanday hal qiladi deb o'ylaysiz?

## Rasmiy hujjat

- MDN — *Shallow copy* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy>
- MDN — *Deep copy* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy>
- MDN — `structuredClone()`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone>
- MDN — *The structured clone algorithm*: <https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm>
- MDN — *Spread syntax*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax>
- MDN — `Object.assign()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign>
- HTML Standard — *Safe passing of structured data*: <https://html.spec.whatwg.org/multipage/structured-data.html>
- Node.js — *Globals* (`structuredClone`): <https://nodejs.org/api/globals.html>
