# 33 — `Map` va `Set`

[← Oldingi: Iterable obyektlar](32-iterable-obyektlar.md) · [Mundarija](README.md) · [Keyingi: `WeakMap` va `WeakSet` →](34-weakmap-va-weakset.md)

## Tushuncha

MDN ularni **kalitli to'plamlar** (keyed collections) deb ataydi:

- **`Map`** — kalit → qiymat juftliklari to'plami. Kalit **istalgan** qiymat bo'lishi mumkin.
- **`Set`** — **takrorlanmaydigan** qiymatlar to'plami.

Ikkalasi ham elementlarni **qo'shilish tartibida** saqlaydi va iterable (32-bob).

MDN: tarixan satrni qiymatga bog'lash uchun oddiy obyektlar ishlatilgan — o'rnatilgan muqobil yo'q edi. `Map` esa ba'zi hollarda uni yaxshiroq qiladigan muhim farqlarga ega.

## Kod: `Map` asoslari

```js
const m = new Map();
const kalitObj = { id: 1 };
m.set('1', 'satr').set(1, 'son').set(kalitObj, 'obyekt').set(NaN, 'NaN');
console.log(m.size, m.get('1'), m.get(1), m.get(kalitObj), m.get({ id: 1 }), m.get(NaN));
console.log(m.has(1), m.delete(1), m.has(1), m.size);
console.log([...m.keys()]);
const obj = {};
obj[kalitObj] = 'x'; obj[{ boshqa: 2 }] = 'y';
console.log(Object.keys(obj), obj['[object Object]']);
console.log(new Map(Object.entries({ a: 1, b: 2 })), Object.fromEntries(new Map([['x', 1]])));
for (const [k, v] of new Map([['b', 2], ['a', 1]])) console.log(k, v);
```

```text
$ node map.mjs
4 satr son obyekt undefined NaN
true true false 3
[ '1', { id: 1 }, NaN ]
[ '[object Object]' ] y
Map(2) { 'a' => 1, 'b' => 2 } { x: 1 }
b 2
a 1
```

- `'1'` va `1` — **ikki xil** kalit. Obyektda ular bir xil bo'lardi (kalit satrga aylanadi).
- Obyekt kalit **havola** bo'yicha topiladi: `m.get({ id: 1 })` — boshqa obyekt, `undefined`.
- Oddiy obyektda obyekt kalit `'[object Object]'` satriga aylanadi — ikki turli obyekt **bitta** kalitga tushdi va ikkinchisi birinchisini ustidan yozdi (23-bob).
- **Kalit tengligi** — MDN: **SameValueZero** algoritmi. `NaN` o'ziga teng hisoblanadi (`===` dan farqli), `0` va `-0` bir xil.
- `set` `Map` ning o'zini qaytaradi — zanjir qilish mumkin.
- `Object.entries` → `new Map(...)` va `Object.fromEntries(map)` — obyekt va `Map` orasida o'tish.
- Iteratsiya **qo'shilish tartibida** (`b`, keyin `a`).

## `Map` va obyekt — MDN taqqoslashi

| | `Map` | `Object` |
| --- | --- | --- |
| Tasodifiy kalitlar | Faqat siz qo'ygan kalitlar | Prototipdan meros kalitlar bor, ular sizniki bilan to'qnashishi mumkin |
| Xavfsizlik | Foydalanuvchi kalitlari bilan xavfsiz | Prototipni ustidan yozish — **object injection** va **prototype pollution** hujumlari mumkin |
| Kalit turi | Istalgan qiymat | Faqat satr yoki symbol |
| Tartib | Oddiy — qo'shilish tartibi | Murakkab qoidalar (16-bob); MDN: tartibga tayanmaslik yaxshi |
| Hajm | `size` | `Object.keys(obj).length` — aylanma yo'l |
| Iteratsiya | To'g'ridan-to'g'ri iterable | Iterable emas (`Object.entries` kerak) |
| Unumdorlik | Tez-tez qo'shish/o'chirishda yaxshiroq | Bunga optimallashtirilmagan |
| JSON | O'rnatilgan qo'llab-quvvatlash yo'q | `JSON.stringify`/`parse` |

MDN maslahati (*Keyed collections*):

- Kalitlar **ishga tushish vaqtigacha noma'lum** bo'lsa, ayniqsa tashqi kiritishdan kelsa — `Map`.
- Kalitlar satr emas bo'lsa — `Map`.
- Tuzilma (shakl) oldindan ma'lum va hamma kalitlar satr bo'lsa — obyekt.

## Kod: obyekt-lug'at tuzoqlari

```js
const sanoq = {};
for (const soz of ['olma', 'constructor', 'toString']) sanoq[soz] = (sanoq[soz] || 0) + 1;
console.log(sanoq);
const m = new Map();
for (const soz of ['olma', 'constructor', 'toString']) m.set(soz, (m.get(soz) ?? 0) + 1);
console.log(m);
const kirish = JSON.parse('{"__proto__": {"admin": true}}');
const sozlama = Object.assign({}, kirish);
console.log(sozlama.admin, Object.keys(kirish));
```

```text
$ node xavf.mjs
{
  olma: 1,
  constructor: 'function Object() { [native code] }1',
  toString: 'function toString() { [native code] }1'
}
Map(3) { 'olma' => 1, 'constructor' => 1, 'toString' => 1 }
true [ '__proto__' ]
```

1. **Tasodifiy kalitlar.** Matndagi `constructor` va `toString` so'zlari bo'sh `{}` da ham "bor" — ular `Object.prototype` dan meros. `sanoq[soz] || 0` meros funksiyani olib, unga `1` ni satr sifatida qo'shdi. `Map` da bunday muammo yo'q.
2. **Prototype pollution.** `JSON.parse` `"__proto__"` ni **oddiy o'z xossasi** sifatida yaratadi. `Object.assign` uni nusxalaganda esa `sozlama.__proto__ = ...` — ya'ni **prototipni** o'rnatish bo'lib chiqdi. Natija: `sozlama.admin` — `true`, garchi `sozlama` da bunday xossa yozilmagan bo'lsa ham. MDN aynan shu xavfni sanaydi va yechim sifatida `Map` yoki prototipsiz obyekt (`Object.create(null)`) ni ko'rsatadi.

## Kod: `Set` va to'plam amallari

```js
const s = new Set([1, 2, 2, 3, 3, 3]);
console.log(s, s.size, s.has(2), [...new Set('mississippi')].join(''));
s.add(4).add(1); s.delete(2);
console.log([...s]);
const a = new Set(['js', 'ts', 'go']), b = new Set(['go', 'rust', 'js']);
console.log(a.union(b), a.intersection(b), a.difference(b), a.symmetricDifference(b));
console.log(new Set(['js']).isSubsetOf(a), a.isSupersetOf(new Set(['ts'])), a.isDisjointFrom(new Set(['c'])));
console.log(new Set([{ x: 1 }, { x: 1 }]).size, new Set([NaN, NaN, 0, -0]).size);
```

```text
$ node set.mjs
Set(3) { 1, 2, 3 } 3 true misp
[ 1, 3, 4 ]
Set(4) { 'js', 'ts', 'go', 'rust' } Set(2) { 'js', 'go' } Set(1) { 'ts' } Set(2) { 'ts', 'rust' }
true true true
2 2
```

- Takrorlar avtomatik olib tashlanadi — `[...new Set(arr)]` massivdan takrorlarni olib tashlashning eng qisqa yo'li.
- `add` mavjud qiymatni qayta qo'shmaydi (`1` joyida qoldi).
- Obyektlar havola bo'yicha: ikki `{ x: 1 }` — ikki element. `NaN` bitta, `0` va `-0` bitta (SameValueZero).

**To'plam amallari (ES2025)** — MDN jadvali:

| Metod | Natija | Matematikada |
| --- | --- | --- |
| `a.union(b)` | `Set` | A ∪ B — birlashma |
| `a.intersection(b)` | `Set` | A ∩ B — kesishma |
| `a.difference(b)` | `Set` | A ∖ B — ayirma |
| `a.symmetricDifference(b)` | `Set` | (A ∖ B) ∪ (B ∖ A) |
| `a.isSubsetOf(b)` | `boolean` | A ⊆ B |
| `a.isSupersetOf(b)` | `boolean` | A ⊇ B |
| `a.isDisjointFrom(b)` | `boolean` | A ∩ B = ∅ |

MDN: bu metodlar faqat `Set` ni emas, istalgan **set-like** obyektni (`size`, `has`, `keys` bor obyekt, masalan, `Map`) qabul qiladi. Asl to'plam o'zgarmaydi.

## Kod: upsert — `getOrInsert` (ES2026)

Ko'p uchraydigan vazifa: "kalit bo'lsa qiymatini ol, bo'lmasa standart qiymat qo'yib, uni ol". ES2026 da buning uchun ikki metod qo'shildi (ES2025 spetsifikatsiyasida yo'q) — **upsert** (update + insert):

```js
const guruh = new Map();
for (const [ism, sinf] of [['Ali', '9A'], ['Vali', '9B'], ['Lola', '9A']]) {
  guruh.getOrInsert(sinf, []).push(ism);
}
console.log(guruh);
const kesh = new Map();
let hisob = 0;
const ogir = (n) => { hisob++; return n * n; };
console.log(kesh.getOrInsertComputed(5, ogir), kesh.getOrInsertComputed(5, ogir), hisob);
const eski = new Map();
for (const [ism, sinf] of [['Ali', '9A'], ['Lola', '9A']]) {
  if (!eski.has(sinf)) eski.set(sinf, []);
  eski.get(sinf).push(ism);
}
console.log(eski);
console.log(Map.groupBy([1, 2, 3, 4, 5], n => n % 2 ? 'toq' : 'juft'));
```

```text
$ node upsert.mjs
Map(2) { '9A' => [ 'Ali', 'Lola' ], '9B' => [ 'Vali' ] }
25 25 1
Map(1) { '9A' => [ 'Ali', 'Lola' ] }
Map(2) { 'toq' => [ 1, 3, 5 ], 'juft' => [ 2, 4 ] }
```

- **`getOrInsert(kalit, standart)`** — MDN: `has` → `get` yoki `set` + qaytarish ketma-ketligiga teng. `map.set(k, map.get(k) ?? standart)` ga ham o'xshaydi, lekin `null`/`undefined` qiymatlar bo'lsa undan ishonchliroq.
- **`getOrInsertComputed(kalit, f)`** — standart qiymat qimmat bo'lsa: `f(kalit)` faqat kalit **yo'q** bo'lgandagina chaqiriladi (`hisob` — 1).
- Uchinchi blok — shu metodlargacha yozilgan eski usul: uch qator va kalitni ikki marta qidirish.
- `Map.groupBy` — `Object.groupBy` (31-bob) ning `Map` qaytaradigan versiyasi; kalitlar istalgan turda bo'lishi mumkin.

Node.js 26.12.0 da ikkala upsert metodi `Map` da ham, `WeakMap` da ham bor.

## Nega shunday

Oddiy obyekt bir vaqtning o'zida ikki rolni bajarardi: **yozuv** (record — oldindan ma'lum maydonli tuzilma) va **lug'at** (dictionary — oldindan noma'lum kalitli to'plam). Lug'at rolida prototip meros kalitlari, faqat satr kalitlar va `__proto__` xavfi muammo bo'ldi — MDN taqqoslashi aynan shularni sanaydi. `Map` va `Set` lug'at va to'plam uchun maxsus tuzilma: kalit turi cheklanmagan, meros kalitlar yo'q, tartib aniq.

## Muhandislik nuqtai nazari

### Foydalanuvchi kalitlari — faqat `Map`

URL parametrlari, forma maydonlari, JSON kalitlari kabi tashqi kalitlarni oddiy obyektga yozish prototype pollution'ga yo'l ochadi. Ularni `Map` da saqlang yoki `Object.create(null)` ishlating.

### JSON bilan ishlash

`JSON.stringify(new Map(...))` — `{}` beradi (xossalari yo'q obyekt). Saqlash uchun `Object.fromEntries(map)` (kalitlar satr bo'lsa) yoki `[...map]` (juftliklar massivi) va qaytarishda `new Map(...)`.

### `Set` bilan tez qidiruv

Katta ro'yxatda qayta-qayta `arr.includes(x)` o'rniga ro'yxatni bir marta `Set` ga aylantirib, `set.has(x)` ishlating — 31-bob amaliyotidagi o'lchov farqni ko'rsatadi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `map[kalit] = qiymat` | `Map` ga emas, obyekt xossasiga yoziladi | `map.set(kalit, qiymat)` |
| `map.length` | `undefined` | `map.size` |
| `m.get({ id: 1 })` yangi obyekt bilan | `undefined` | Bir xil havola yoki primitiv kalit |
| Obyektda foydalanuvchi kalitlari | Meros kalitlar, prototype pollution | `Map` |
| `JSON.stringify(map)` | `'{}'` | `Object.fromEntries(map)` yoki `[...map]` |
| `has` + `set` + `get` qo'lda | Uzun va ikki marta qidirish | `getOrInsert` (ES2026) |
| `new Set(obyektlar)` bilan "takrorlarni" olib tashlash | Bir xil mazmunli obyektlar qoladi | Kalit bo'yicha `Map` |

## Amaliyot

1. Matndagi so'zlar chastotasini `Map` bilan hisoblang (`getOrInsert` yoki `?? 0`) va eng ko'p uchragan 3 so'zni chiqaring.
2. Ikki talabalar ro'yxatidan: ikkala kursga yozilganlar, faqat birinchisiga yozilganlar va hammasi (`Set` metodlari bilan).
3. `Map` ni JSON'ga yozib, qaytarib o'qiydigan `saqla`/`yukla` funksiyalarini yozing (kalitlar son bo'lsin).
4. `xavf.mjs` dagi `Object.assign({}, kirish)` o'rniga `Object.assign(Object.create(null), kirish)` ni sinang. `admin` chiqadimi?
5. `getOrInsertComputed` bilan `fib(n)` uchun kesh yozing.

## Rasmiy hujjat

- MDN — *Keyed collections* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_collections>
- MDN — `Map` ("Objects vs. Maps", "Key equality"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map>
- MDN — `Set` ("Set composition"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set>
- MDN — `Map.prototype.getOrInsert()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsert>
- MDN — `Map.prototype.getOrInsertComputed()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/getOrInsertComputed>
- ECMA-262 — *Map.prototype.getOrInsert*: <https://tc39.es/ecma262/2026/#sec-map.prototype.getorinsert>
- ECMA-262 — *Set.prototype.union*: <https://tc39.es/ecma262/2026/#sec-set.prototype.union>
