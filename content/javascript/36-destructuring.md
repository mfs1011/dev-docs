# 36 — Destructuring

[← Oldingi: `Object.keys`, `values`, `entries`](35-object-keys-values-entries.md) · [Mundarija](README.md) · [Keyingi: Sana va vaqt →](37-sana-va-vaqt.md)

## Tushuncha

**Destructuring** (qismlarga ajratib olish) — MDN: massiv yoki obyekt literalining **teskari** amali. Literal bir nechta qiymatdan to'plam yasaydi (`const arr = [a, b, c]`). Destructuring esa xuddi shunday sintaksisni tayinlashning **chap** tomonida ishlatib, to'plamdagi har qiymatni alohida o'zgaruvchiga oladi:

```js
const [a, b, c] = arr;         // a = arr[0], b = arr[1], c = arr[2]
const { x, y } = obj;          // x = obj.x, y = obj.y
```

Ikki xil shakli bor:

| Shakl | Nimadan oladi | Qanday |
| --- | --- | --- |
| **Massiv destructuring** | Istalgan **iterable** (32-bob) | **Tartib** bo'yicha |
| **Obyekt destructuring** | Istalgan qiymat xossalari | **Nom** bo'yicha |

## Kod: massiv destructuring

```js
const [a, b] = ['olma', 'nok', 'uzum'];
const [, , uchinchi = 'yo\'q', tortinchi = 'yo\'q'] = ['olma', 'nok', 'uzum'];
console.log(a, b, uchinchi, tortinchi);
const [bosh, ...qolgan] = [1, 2, 3, 4];
console.log(bosh, qolgan);
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y);
const [h1, h2] = 'Ali';
const [[k1, v1]] = new Map([['til', 'uz']]);
console.log(h1, h2, k1, v1);
const [, yil, oy] = /(\d{4})-(\d{2})/.exec('Sana: 2026-10');
console.log(yil, oy);
```

```text
$ node massiv.mjs
olma nok uzum yo'q
1 [ 2, 3, 4 ]
2 1
A l til uz
2026 10
```

- Ortiqcha elementlar e'tiborsiz qoldiriladi; keraksizlari **bo'sh vergul** bilan o'tkazib yuboriladi.
- **Standart qiymat** (default) — element yo'q bo'lganda ishlatiladi.
- **Rest element** `...qolgan` — qolgan elementlarni **yangi massivga** yig'adi. MDN: u naqshning **oxirida** bo'lishi va undan keyin vergul bo'lmasligi shart.
- **O'rin almashtirish** — `[x, y] = [y, x]`, vaqtinchalik o'zgaruvchisiz.
- Massiv destructuring **iterable** bilan ishlaydi: satr (belgilarga), `Map` (juftliklarga — ichma-ich destructuring bilan), muntazam ifoda natijasi.

## Kod: obyekt destructuring

```js
const user = { ism: 'Ali', yosh: 25, manzil: { shahar: 'Toshkent' }, 'to\'liq-ism': 'Ali Valiyev' };
const { ism, yosh: umr, kasb = 'noma\'lum', manzil: { shahar }, 'to\'liq-ism': toliq } = user;
console.log(ism, umr, kasb, shahar, toliq);
const { ism: _, ...boshqalar } = user;
console.log(boshqalar);
const kalit = 'yosh';
const { [kalit]: qiymat } = user;
console.log(qiymat);
```

```text
$ node obyekt.mjs
Ali 25 noma'lum Toshkent Ali Valiyev
{
  yosh: 25,
  manzil: { shahar: 'Toshkent' },
  "to'liq-ism": 'Ali Valiyev'
}
25
```

| Naqsh | Ma'nosi |
| --- | --- |
| `{ ism }` | `ism` xossasi → `ism` o'zgaruvchisi |
| `{ yosh: umr }` | `yosh` xossasi → **`umr`** o'zgaruvchisi (qayta nomlash) |
| `{ kasb = '...' }` | Xossa yo'q yoki `undefined` bo'lsa — standart qiymat |
| `{ manzil: { shahar } }` | Ichma-ich: `user.manzil.shahar` → `shahar`. `manzil` o'zgaruvchisi **yaratilmaydi** |
| `{ "to'liq-ism": toliq }` | Identifikator bo'la olmaydigan nom — qo'shtirnoqda, yangi nom bilan |
| `{ [kalit]: qiymat }` | Hisoblanadigan nom |
| `{ ism: _, ...boshqalar }` | **Rest xossa** — qolgan o'z sanaladigan xossalar yangi obyektga |

Diqqat: `yosh: umr` dagi ikki nuqta obyekt literalidagidan **teskari** o'qiladi — chapda **manba xossa**, o'ngda **yangi o'zgaruvchi**.

MDN: rest **chuqur nusxa** yaratmaydi — `boshqalar.manzil` va `user.manzil` bitta obyekt (17-bob).

## Kod: standart qiymat va chegaraviy holatlar

```js
const { a = 1, b = 2, c = 3 } = { a: undefined, b: null };
console.log(a, b, c);
const { length, toFixed } = 'salom';
console.log(length, typeof toFixed);
try { const { q } = null; } catch (e) { console.log(e.name + ': ' + e.message); }
let p, q;
({ p, q } = { p: 10, q: 20 });
console.log(p, q);
```

```text
1 null 3
5 undefined
TypeError: Cannot destructure property 'q' of 'null' as it is null.
10 20
```

- MDN: standart qiymat xossa **yo'q** bo'lganda yoki **`undefined`** bo'lganda ishlatiladi, `null` da **ishlatilmaydi** (`b` — `null`).
- **Primitivlar** — MDN: obyekt destructuring deyarli xossaga murojaatning o'zi. Primitiv o'rov obyektga o'raladi (25-bob): satrdan `length` olindi. `null`/`undefined` — `TypeError`.
- **E'lonsiz tayinlash** — MDN: `{ p, q } = ...` qatori yolg'iz turganda `{` **blok** deb o'qiladi va `SyntaxError: Unexpected token '='` beradi. Butun ifodani **qavsga** o'rash kerak: `({ p, q } = ...)`. Nuqtali vergulsiz uslubda oldingi qatorga yopishib qolmasligi uchun qavs oldiga `;` qo'yiladi.

## Kod: funksiya parametrlarida

Destructuring eng ko'p shu yerda ishlatiladi — **nomli parametrlar** sifatida:

```js
function chiz({ eni = 100, boyi = 50, rang = 'qora' } = {}) {
  return `${eni}x${boyi} ${rang}`;
}
console.log(chiz({ eni: 300 }), chiz(), chiz({ rang: 'qizil', boyi: 10 }));
function eski(eni, boyi, rang) { return `${eni}x${boyi} ${rang}`; }
console.log(eski(300, undefined, 'qizil'));
function yomon({ eni }) { return eni; }
try { yomon(); } catch (e) { console.log(e.name + ': ' + e.message); }
const users = [{ id: 1, ism: 'Ali' }, { id: 2, ism: 'Lola' }];
for (const { id, ism } of users) console.log(id, ism);
console.log(users.map(({ ism }) => ism.toUpperCase()));
```

```text
$ node param.mjs
300x50 qora 100x50 qora 100x10 qizil
300xundefined qizil
TypeError: Cannot destructure property 'eni' of 'undefined' as it is undefined.
1 Ali
2 Lola
[ 'ALI', 'LOLA' ]
```

- `chiz({ rang: 'qizil', boyi: 10 })` — tartib muhim emas, keraklilarini berasiz, qolgani standart. `eski` da esa o'tkazib yuborish uchun `undefined` yozish kerak va har argument nimaligini eslab qolish kerak.
- **`= {}`** — butun parametr uchun standart qiymat. Busiz argumentsiz chaqiruv `undefined` ni destructuring qilishga urinadi va `TypeError` beradi (`yomon()`).
- MDN: destructuring til o'zgaruvchi bog'laydigan boshqa joylarda ham ishlaydi — `for...of`/`for...in` o'zgaruvchisi, funksiya parametrlari va `catch` o'zgaruvchisi.

### Standart qiymat faqat kerak bo'lganda hisoblanadi

```js
let hisob = 0;
const { v = (hisob++, 'standart') } = { v: 'bor' };
console.log(v, hisob);
```

```text
bor 0
```

MDN: standart qiymat istalgan ifoda bo'lishi mumkin va u **faqat kerak bo'lganda** hisoblanadi — `v` bor edi, `hisob++` bajarilmadi.

## Nega shunday

MDN: obyekt va massiv literallari ma'lumotlarni "paketga" yig'ishning qulay usuli; destructuring — xuddi shu sintaksis bilan paketni ochish. Literal va naqsh bir-biriga **to'g'ridan-to'g'ri mos** keladi: `const obj = { a, b }` ↔ `const { a, b } = obj`. Shuning uchun yangi sintaksis o'rganish shart emas — literalni chap tomonga ko'chirish kifoya.

## Muhandislik nuqtai nazari

### Uch va undan ko'p parametr — obyekt

Funksiyada uch va undan ko'p parametr, ayniqsa ixtiyoriylari bo'lsa, ularni bitta destructuring qilinadigan obyektga yig'ing. Chaqiruv o'zini o'zi tushuntiradi (`yarat({ nom, rol: 'admin' })`), yangi parametr qo'shish eski chaqiruvlarni buzmaydi. Parametrga `= {}` ni unutmang.

### Haddan oshirmang

Uch-to'rt darajali ichma-ich naqsh (`{ a: { b: [{ c }] } }`) o'qishni qiyinlashtiradi va oraliq qiymat yo'q bo'lsa `TypeError` beradi. Chuqur yoki ixtiyoriy tuzilmada oddiy murojaat va `?.` (21-bob) aniqroq.

### Rest bilan keraksiz xossani olib tashlash

`const { parol, ...xavfsiz } = user;` — obyektdan bitta xossani olib tashlab, qolganini yangi obyektga olishning qisqa usuli (masalan, javobga parol chiqmasligi uchun). Asl obyekt o'zgarmaydi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `{ a } = obj;` (e'lonsiz) | `SyntaxError` | `({ a } = obj);` |
| `function f({ x }) {}` + `f()` | `TypeError: Cannot destructure ...` | `function f({ x } = {})` |
| `const { a = 1 } = { a: null }` — 1 kutish | `null` | `const a = obj.a ?? 1` |
| `const { yosh: umr }` dan keyin `yosh` ni ishlatish | `ReferenceError` — `yosh` yaratilmagan | `umr` |
| `const { manzil: { shahar } }` dan keyin `manzil` | `ReferenceError` | Kerak bo'lsa alohida oling |
| `const [a, ...b, c]` | `SyntaxError` — rest oxirida bo'lishi kerak | `const [a, ...b]` |
| `const { x } = undefined` | `TypeError` | `?? {}` bilan |
| Rest'ni chuqur nusxa deb o'ylash | Ichki obyektlar umumiy | `structuredClone` (17-bob) |

## Amaliyot

1. `const sana = '2026-10-15'` dan `[yil, oy, kun]` ni `split` va destructuring bilan oling; har birini songa aylantiring.
2. `foydalanuvchiKartasi({ ism, familiya = '', yosh, shahar = 'Toshkent' } = {})` funksiyasini yozing va 4 xil chaqiruv bilan sinang.
3. `const javob = { data: { items: [{ id: 7, nom: 'X' }] } }` dan birinchi elementning `nom` ini bitta destructuring bilan oling. `items` bo'sh bo'lsa nima bo'ladi?
4. `Object.entries(obj).map(([k, v]) => ...)` — 35-bobdagi misollarni destructuring'siz yozib, farqni ko'ring.
5. Obyektdan `parol` va `token` ni olib tashlaydigan `xavfsiz(user)` funksiyasini rest bilan yozing.

## Rasmiy hujjat

- MDN — *Destructuring*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring>
- MDN — *Default parameters*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters>
- MDN — *Expression statement* (nega `{` blok deb o'qiladi): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/Expression_statement>
- ECMA-262 — *Destructuring Assignment*: <https://tc39.es/ecma262/2026/#sec-destructuring-assignment>
- ECMA-262 — *Destructuring Binding Patterns*: <https://tc39.es/ecma262/2026/#sec-destructuring-binding-patterns>
