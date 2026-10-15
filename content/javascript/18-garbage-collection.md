# 18 — Garbage collection

[← Oldingi: Havola va nusxa](17-havola-va-nusxa.md) · [Mundarija](README.md) · [Keyingi: Metodlar va `this` →](19-metodlar-va-this.md)

## Tushuncha

C kabi past darajali tillarda xotirani dasturchi o'zi ajratadi (`malloc()`) va o'zi bo'shatadi (`free()`). JavaScript'da esa bu avtomatik: obyekt yaratilganda xotira ajratiladi, u endi kerak bo'lmaganda bo'shatiladi. Bu jarayon **garbage collection** (axlat yig'ish, qisqacha **GC**) deyiladi. Uni bajaradigan qism — **garbage collector** (axlat yig'uvchi).

MDN ogohlantiradi: bu avtomatiklik dasturchida "xotira haqida o'ylash shart emas" degan **noto'g'ri taassurot** uyg'otishi mumkin. Xotira o'z-o'zidan bo'shamaydi — GC faqat **endi hech qayerdan yetib bo'lmaydigan** narsani yig'adi. Biror joyda havola qolib ketsa, obyekt xotirada qoladi.

MDN bo'yicha xotiraning **hayot sikli** har qanday tilda bir xil:

1. Kerakli xotirani **ajratish** (allocate).
2. Ajratilgan xotiradan **foydalanish** — o'qish va yozish.
3. Kerak bo'lmay qolganda **bo'shatish** (release).

Ikkinchi qadam hamma tilda aniq yoziladi. Birinchi va uchinchi qadam JavaScript'da **yashirin**: `const o = { a: 1 }` yozganingizda xotira ajratiladi, uni bo'shatish esa GC ning ishi.

Bu bobda: GC "kerak emas" ni qanday aniqlaydi, nega aylanma havolalar muammo emas, nima xotirada qolib ketadi va buni qanday kuzatish mumkin.

## Kod: qachon xotira ajratiladi

MDN misollari — xotira qiymat e'lon qilinganda va ba'zi chaqiruvlarda ajratiladi:

```js
const n = 123;                    // son uchun
const s = 'satr';                 // satr uchun
const o = { a: 1, b: null };      // obyekt va uning qiymatlari uchun
const a = [1, null, 'satr2'];     // massiv va elementlari uchun
function f(x) { return x + 2; }   // funksiya — chaqirsa bo'ladigan obyekt
const d = new Date();             // Date obyekti
const s2 = s.substring(0, 3);     // yangi satr
const a2 = a.concat([4, 5]);      // yangi massiv
```

MDN izohi: satrlar o'zgarmas bo'lgani uchun (28-bob) `substring` uchun dvigatel yangi xotira ajratmasdan, faqat `[0, 3]` oralig'ini eslab qolishi **mumkin**. Bu — dvigatelning ichki ishi; tilning o'zi buni kafolatlamaydi ham, man qilmaydi ham.

## Asosiy g'oya: erishib bo'ladiganlik

"Bu xotira endi kerakmi?" degan savolga umumiy holda javob topish MDN ta'biri bilan **hal qilib bo'lmaydigan** (undecidable) masala: dastur kelajakda nimaga murojaat qilishini oldindan aniq bilib bo'lmaydi. Shuning uchun GC **taxminiy** ishlaydi — u savolni soddaroq savolga almashtiradi.

Buning asosi — **havola** (reference) tushunchasi. MDN: bir obyekt ikkinchisiga **yetib bora olsa** (aniq yoki yashirin), u ikkinchisiga havola qiladi. Masalan, obyekt o'z **prototipiga** (54-bob) yashirin havola qiladi, xossasidagi obyektga esa aniq havola qiladi. Bu yerda "obyekt" so'zi kengroq: unga **funksiya ko'lamlari** (scope) va global leksik ko'lam ham kiradi (43-bob).

### Havola sanash — eski usul

MDN eng sodda algoritmni ham tushuntiradi — **havola sanash** (reference counting): obyektga **nechta havola** borligi sanaladi, nolga tushsa — obyekt axlat.

```js
let x = { a: { b: 2 } };  // ikki obyekt: biri ikkinchisining xossasida
let y = x;                // tashqi obyektga ikkinchi havola
x = 1;                    // endi faqat y orqali
let z = y.a;              // ichki obyektga ham ikkinchi havola
y = 'mozilla';            // tashqi obyektga havola qolmadi — yig'sa bo'ladi
                          // lekin ichki obyektni z hali ushlab turibdi
z = null;                 // endi ichki obyektni ham yig'sa bo'ladi
```

Bu algoritmning **cheklovi** — aylanma havolalar. Ikki obyekt bir-biriga havola qilsa, ularning har birida kamida bitta havola qoladi va ular **hech qachon** nolga tushmaydi — tashqaridan hech kim ularga yetib bormasa ham. MDN: hozirgi JavaScript dvigatellarining **hech biri** havola sanashdan foydalanmaydi.

### Mark-and-sweep — hozirgi usul

**Mark-and-sweep** (belgilash va supurish) algoritmi savolni boshqacha qo'yadi: "obyekt kerak emas" degani — "obyektga **yetib bo'lmaydi**" (unreachable).

Algoritm **ildizlar** (roots) to'plamidan boshlaydi. MDN: JavaScript'da ildiz — **global obyekt**. GC vaqti-vaqti bilan:

1. **Belgilash** (mark): ildizlardan boshlab, ular havola qilgan obyektlarni, so'ng ular havola qilganlarni va hokazo — hamma **erishib bo'ladigan** (reachable) obyektlarni belgilaydi.
2. **Supurish** (sweep): belgilanmay qolgan hamma obyektni yig'ib, xotirasini bo'shatadi.

MDN: hozirgi **barcha** zamonaviy dvigatellarda mark-and-sweep yig'uvchi bor. So'nggi yillardagi yaxshilanishlar — avlodli (generational), bosqichma-bosqich (incremental), parallel va bir vaqtda ishlaydigan (concurrent) yig'ish — shu algoritmning **amalga oshirilishini** yaxshilaydi; "obyekt kerak emas" ta'rifining o'zi o'zgarmagan.

Havola sanashdan afzalligi: havolasi nol obyektga baribir yetib bo'lmaydi, lekin teskarisi to'g'ri emas — aylanma havolali, lekin ildizdan uzilgan obyektlar mark-and-sweep uchun **muammo emas**.

## Kod: GC ni ko'zdan kuzatish

Tilning o'zida GC ni chaqiradigan yoki kuzatadigan oddiy usul yo'q (pastda "Nega shunday"). O'rganish uchun ikki vositadan foydalanamiz:

- **`--expose-gc`** — Node.js ruxsat beradigan V8 bayrog'i (flag). U `globalThis.gc()` funksiyasini ochadi — GC ni qo'lda ishga tushiradi. Bu faqat **tajriba va nosozliklarni tuzatish** uchun; bayroqsiz `globalThis.gc()` — `TypeError: globalThis.gc is not a function`.
- **`WeakRef`** — obyektga **kuchsiz havola** (weak reference). U obyektni GC dan saqlamaydi; `deref()` obyekt hali tirik bo'lsa uni, yig'ilgan bo'lsa `undefined` qaytaradi. `WeakRef` va `FinalizationRegistry` to'liq — 88-bobda.

Bitta muhim noziklik (MDN, `WeakRef`): `WeakRef` yaratilgan yoki `deref()` chaqirilgan obyekt **joriy ish** (job) tugaguncha yig'ilmaydi — ya'ni yig'ilishni faqat hodisalar sikli (event loop, 76-bob) navbatlari **orasida** ko'rish mumkin. Shuning uchun har GC dan oldin `setTimeout` bilan bir navbat kutamiz.

```js
const kutish = () => new Promise(r => setTimeout(r, 0));

let foydalanuvchi = { ism: 'Ali' };
const kuzatuvchi = new WeakRef(foydalanuvchi);
let nusxa = foydalanuvchi;

await kutish(); globalThis.gc();
console.log('ikki havola bor:', kuzatuvchi.deref());

foydalanuvchi = null;
await kutish(); globalThis.gc();
console.log('bitta havola bor:', kuzatuvchi.deref());

nusxa = null;
await kutish(); globalThis.gc();
console.log('havola qolmadi:', kuzatuvchi.deref());
```

```text
$ node --expose-gc erishish.mjs
ikki havola bor: { ism: 'Ali' }
bitta havola bor: { ism: 'Ali' }
havola qolmadi: undefined
```

17-bobdagi xulosa shu yerda ko'rinadi: `foydalanuvchi = null` obyektni **o'chirmaydi** — faqat bitta havolani uzadi. `nusxa` orqali obyektga hali yetib boriladi. Ikkala havola uzilgandan keyingina GC uni yig'adi.

## Kod: aylanma havola yig'iladi

`FinalizationRegistry` — obyekt yig'ilgandan keyin chaqiriladigan funksiyani (cleanup callback) ro'yxatdan o'tkazadi. Uni bu yerda faqat **kuzatish** uchun ishlatamiz:

```js
const royxat = new FinalizationRegistry(nom => console.log('tozalandi:', nom));

function oila() {
  const er = { ism: 'Vali' };
  const xotin = { ism: 'Lola' };
  er.juft = xotin;
  xotin.juft = er;
  royxat.register(er, 'er');
  royxat.register(xotin, 'xotin');
  return { er, xotin };
}

let uy = oila();
await new Promise(r => setTimeout(r, 0)); globalThis.gc();
await new Promise(r => setTimeout(r, 10));
console.log('uy hali bor');

uy = null;
await new Promise(r => setTimeout(r, 0)); globalThis.gc();
await new Promise(r => setTimeout(r, 10));
console.log('tugadi');
```

```text
$ node --expose-gc halqa.mjs
uy hali bor
tozalandi: er
tozalandi: xotin
tugadi
```

`er` va `xotin` bir-biriga havola qiladi — havola sanash ularni hech qachon yig'masdi. Mark-and-sweep uchun esa muhim savol bitta: **ildizdan** ularga yo'l bormi? `uy` bor ekan — bor. `uy = null` dan keyin yo'l uzildi, va ikkalasi birga yig'ildi. Ichki havolalar ahamiyatsiz.

## Kod: xotira hajmini o'lchash

Node.js da `process.memoryUsage()` jarayon xotirasini **baytlarda** qaytaradi. Node hujjati: `heapTotal` va `heapUsed` — V8 ning **uyum** (heap — obyektlar saqlanadigan xotira sohasi) ishlatilishi.

```js
import { memoryUsage } from 'node:process';
const mb = () => (memoryUsage().heapUsed / 1024 / 1024).toFixed(1) + ' MB';

globalThis.gc();
console.log('boshida:      ', mb());
let katta = Array.from({ length: 1_000_000 }, (_, i) => ({ i }));
console.log('ajratilgach:  ', mb());
katta = null;
globalThis.gc();
console.log('gc dan keyin: ', mb());
```

```text
$ node --expose-gc xotira.mjs
boshida:       4.0 MB
ajratilgach:   43.8 MB
gc dan keyin:  4.1 MB
```

Million kichik obyekt ~40 MB oldi. `katta = null` dan keyin massivga ham, ichidagi obyektlarga ham yo'l qolmadi — GC hammasini qaytardi. Aniq raqamlar sizda boshqacha bo'lishi mumkin (Node versiyasi, platforma); yo'nalish muhim.

## Kod: nima xotirada qolib ketadi

GC faqat erishib bo'lmaydigan narsani yig'adi. Demak obyektni biror tirik joy ushlab tursa, u **qoladi** — kerak bo'lmasa ham. Uchta tipik joy:

```js
const royxat = new FinalizationRegistry(nom => console.log('tozalandi:', nom));
const kutish = async () => {
  await new Promise(r => setTimeout(r, 0)); globalThis.gc();
  await new Promise(r => setTimeout(r, 10));
};

// 1. Map kalit obyektni kuchli ushlaydi
const kesh = new Map();
let a = { nom: 'a' };
kesh.set(a, 'hisob natijasi');
royxat.register(a, 'Map kaliti');

// 2. WeakMap kalitni kuchsiz ushlaydi
const zaifKesh = new WeakMap();
let b = { nom: 'b' };
zaifKesh.set(b, 'hisob natijasi');
royxat.register(b, 'WeakMap kaliti');

// 3. Closure tashqi o'zgaruvchini ushlab turadi
function yasash() {
  const katta = { nom: 'katta' };
  royxat.register(katta, 'closure ichidagi');
  return () => katta.nom;
}
let olish = yasash();

a = null; b = null;
await kutish();
console.log('--- olish ni ham qo\'yib yuboramiz');
olish = null;
await kutish();
console.log('Map hajmi:', kesh.size);
```

```text
$ node --expose-gc qoladi.mjs
tozalandi: WeakMap kaliti
--- olish ni ham qo'yib yuboramiz
tozalandi: closure ichidagi
Map hajmi: 1
```

1. **`Map`** — `a = null` dan keyin ham obyekt yig'ilmadi: `kesh` (global o'zgaruvchi) uni kalit sifatida ushlab turibdi. `kesh.size` hali `1`. Bu — xotira oqishining (memory leak) eng ko'p uchraydigan shakli: hech qachon tozalanmaydigan kesh yoki ro'yxat.
2. **`WeakMap`** — kalitni **kuchsiz** ushlaydi (MDN: *weakly held*). Kalitga boshqa hech kim kuchli havola qilmasa, mark-and-sweep uni erishib bo'ladigan deb hisoblamaydi va yig'adi; qiymat ham u bilan birga ketadi. To'liq — 34-bobda.
3. **Closure** — `yasash()` tugadi, lekin qaytgan funksiya `katta` ni ishlatadi, shuning uchun funksiya ko'lami tirik qoladi. MDN "obyekt" tushunchasiga funksiya ko'lamini kiritgani shu sababdan. `olish = null` dan keyingina `katta` yig'ildi. Closure'lar — 43-bobda.

## Kod: kuchsiz to'plamlar nimani saqlay oladi

MDN: `WeakMap` va `WeakSet` faqat **obyekt** yoki **symbol** saqlaydi, chunki faqat ular yig'iladi. Primitivlarni istalgan vaqt qayta "yasash" mumkin (`1 === 1`, lekin `{} !== {}`) — ular to'plamda abadiy qolardi. Xuddi shu sabab bilan `Symbol.for('k')` (ro'yxatga olingan symbol, 22-bob) ham qabul qilinmaydi, oddiy `Symbol('k')` esa qabul qilinadi.

```js
const w = new WeakMap();
try { w.set(1, 2); } catch (e) { console.log(e.name + ': ' + e.message); }
try { w.set(Symbol.for('k'), 2); } catch (e) { console.log(e.name + ': ' + e.message); }
w.set(Symbol('k'), 2);
console.log('Symbol(k) kalit: ok', typeof w.keys);
```

```text
TypeError: Invalid value used as weak map key
TypeError: Invalid value used as weak map key
Symbol(k) kalit: ok undefined
```

`w.keys` — `undefined`: MDN bo'yicha `WeakMap` va `WeakSet` **aylanib chiqib bo'lmaydi** (not iterable). Agar kalitlarni sanash mumkin bo'lganida, GC qachon ishlaganini kod orqali ko'rish mumkin bo'lardi — MDN: "garbage collection imkon qadar ko'rinmas bo'lishi kerak".

## Nega shunday

### GC ni chaqirib bo'lmaydi

MDN: JavaScript'da GC ni dastur ichidan ishga tushirish **mumkin emas** va bu tilning o'ziga, ehtimol, hech qachon kiritilmaydi; dvigatellar buni faqat maxsus bayroq bilan (`--expose-gc` kabi) ochishi mumkin. Obyekt xotirasini bo'shatishning yagona yo'li — unga yo'lni **uzish**.

### Spetsifikatsiya hech narsani kafolatlamaydi

ECMA-262 (9.9 *Processing Model of WeakRef and FinalizationRegistry Targets*): spetsifikatsiya biror obyekt **yig'ilishini kafolatlamaydi**. Tirik bo'lmagan obyektlar uzoq vaqtdan keyin yoki **umuman** bo'shatilmasligi mumkin — shuning uchun matnda "may" (mumkin) so'zi ishlatiladi.

Spetsifikatsiya "kerakli" obyektni **tiriklik** (liveness) orqali ta'riflaydi: obyektning **o'ziga xosligi** (identity) kelajakda biror yo'l bilan — `===` taqqoslash yoki `Map` kaliti sifatida — kuzatilishi mumkin bo'lsa, u tirik. Va qo'shimcha qiladi: bu ta'rifni tekshirib bo'lmaydi (undecidable), amalda dvigatellar **erishib bo'ladiganlik** kabi ehtiyotkor yaqinlashuvdan foydalanadi. Mark-and-sweep — aynan shu yaqinlashuv.

Bundan bir amaliy xulosa: GC vaqti — dvigatelning ichki ishi. Kodning to'g'riligi **hech qachon** GC qachon ishlashiga bog'liq bo'lmasligi kerak. Yuqoridagi misollar natijasi — Node 26 da kuzatilgan xatti-harakat, til kafolati emas.

## Muhandislik nuqtai nazari

### Xotirani bo'shatish = havolani uzish

GC'ga "bo'shat" deb aytib bo'lmaydi, lekin unga **yordam** berish mumkin: uzoq yashaydigan joylarda (global o'zgaruvchi, modul darajasidagi kesh, singleton) kerak bo'lmay qolgan obyektga havola qoldirmaslik. Funksiya ichidagi lokal o'zgaruvchilarni `null` qilish odatda shart emas — funksiya tugagach, ularga yo'l o'zi uziladi (closure ushlab qolmasa).

### Tozalashni GC ga yuklamang

MDN: `FinalizationRegistry` callback'i **qachon** chaqirilishi, hatto **chaqirilishi** ham kafolatlanmagan; u faqat muhim bo'lmagan tozalash uchun. Fayl, ulanish, qulf kabi resurslarni yopish uchun aniq usullar bor — `try...finally` (66-bob) va `using` (ES2027 da yakunlangan, 89-bob). `WeakRef` va `FinalizationRegistry` MDN ta'biri bilan faqat **uzoq ishlaydigan dasturlarda xotirani optimallash** uchun mavjud, va iloji bo'lsa ulardan qochish tavsiya etiladi.

### Kesh — o'lchami cheklangan bo'lsin

`Map` dagi kesh o'z-o'zidan kichraymaydi. Kalit obyekt bo'lsa va yozuv faqat obyekt tirik ekan kerak bo'lsa — `WeakMap`. Kalit satr bo'lsa (masalan, URL) — `WeakMap` ishlamaydi; u holda keshga yuqori chegara qo'yiladi va eski yozuvlar o'chiriladi.

### Avval o'lchang

Node.js da `heapUsed` vaqt o'tishi bilan faqat o'sib borsa — oqish belgisi. Uni qayerdan kelayotganini topish — heap snapshot va DevTools bilan — 90-bobda. Node `--max-old-space-size` bayrog'i uyum chegarasini o'zgartiradi (MDN misoli: `node --max-old-space-size=6000 index.js`), lekin oqishni davolamaydi — faqat kechiktiradi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `obj = null` obyektni o'chiradi deb o'ylash | Boshqa havola bo'lsa, obyekt qoladi | Hamma havolani uzish kerak |
| Hech qachon tozalanmaydigan `Map`/massiv kesh | Xotira doim o'sadi | `WeakMap` yoki o'lcham chegarasi |
| `FinalizationRegistry` da muhim tozalash (faylni yopish) | Callback umuman chaqirilmasligi mumkin | `try...finally`, `using` |
| Kod GC vaqtiga tayanadi | Boshqa dvigatel yoki versiyada buziladi | GC ni ko'rinmas deb hisoblash |
| `WeakMap` ga satr yoki son kalit berish | `TypeError: Invalid value used as weak map key` | Obyekt kalit yoki oddiy `Map` |
| Ishlab chiqarish kodida `globalThis.gc()` | Bayroqsiz — `TypeError` | Faqat tajribada, `--expose-gc` bilan |

## Amaliyot

1. `let a = {}; let b = a; a = null;` — obyekt yig'iladimi? `b = null` dan keyin-chi? `erishish.mjs` ni o'zgartirib tekshiring.
2. Uch obyektdan halqa yasang (`a.k = b; b.k = c; c.k = a`), har birini `FinalizationRegistry` ga yozing. Halqaga tashqi havolani uzgach, nechta "tozalandi" chiqadi?
3. `xotira.mjs` da `katta = null` qatorini olib tashlang. `gc dan keyin` qiymati qanday o'zgaradi va nega?
4. `qoladi.mjs` da `kesh.delete(a)` ni `a = null` dan oldin qo'shing. Natija qanday o'zgaradi?
5. `MyWeakMap` haqida o'ylang: MDN `WeakMap` ni "kalit obyektga yashirin belgi qo'shadigan" tuzilma sifatida tasavvur qilishni taklif qiladi. Shu modeldan kelib chiqib, nega `WeakMap` da `clear()` va `size` yo'qligini tushuntiring.

## Rasmiy hujjat

- MDN — *Memory management*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Memory_management>
- MDN — `WeakRef` ("Avoid where possible", "Notes on WeakRefs"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakRef>
- MDN — `FinalizationRegistry`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry>
- ECMA-262 — *Processing Model of WeakRef and FinalizationRegistry Targets*: <https://tc39.es/ecma262/2026/#sec-weakref-processing-model>
- ECMA-262 — *Liveness*: <https://tc39.es/ecma262/2026/#sec-liveness>
- Node.js — `process.memoryUsage()`: <https://nodejs.org/api/process.html#processmemoryusage>
- Node.js — *Command-line API* (V8 options, `--expose-gc`, `--max-old-space-size`): <https://nodejs.org/api/cli.html>
