# 41 — Rekursiya va stek

[← Oldingi: Execution context va call stack](40-execution-context.md) · [Mundarija](README.md) · [Keyingi: Rest va spread →](42-rest-spread.md)

## Tushuncha

**Rekursiya** (recursion) — funksiyaning o'zini o'zi chaqirishi. MDN (*Functions → Recursion*):

- Funksiya o'ziga nomi orqali (deklaratsiya yoki nomli funksiya ifodasi) yoki o'ziga ishora qiluvchi istalgan o'zgaruvchi orqali murojaat qila oladi.
- Rekursiya ma'lum ma'noda **siklga** o'xshaydi: ikkalasi ham bir kodni ko'p marta bajaradi va ikkalasiga ham **to'xtash sharti** kerak. Aks holda sikl cheksiz aylanadi, rekursiya esa cheksiz chaqiradi.
- Ba'zi algoritmlar oddiy sikl bo'la olmaydi. Masalan, daraxt tuzilmasining (DOM kabi) barcha tugunlarini aylanish rekursiya bilan osonroq: har chaqiruv o'zi yana bir nechta chaqiruv qiladi.
- Har qanday rekursiv algoritmni rekursiyasiz yozish mumkin, lekin mantiq ko'pincha murakkabroq bo'ladi va **stek** kerak bo'ladi.
- Aslida rekursiyaning o'zi ham stekdan foydalanadi — funksiyalar stekidan (40-bob).

Rekursiv funksiyaning ikki qismi bor:

| Qism | Vazifasi |
| --- | --- |
| **Asosiy holat** (base case) | Javob to'g'ridan-to'g'ri ma'lum — o'zini chaqirmaydi |
| **Rekursiv qadam** | Masalani kichikroq qismga keltiradi va o'zini shu qism bilan chaqiradi |

**Rekursiya chuqurligi** — stekda bir vaqtda turgan chaqiruvlar soni. U stek hajmi bilan cheklangan (40-bob: Node'da ~12 500 oddiy freym).

## Kod: stek tartibi

MDN misoli:

```js
function foo(i) {                 // MDN misoli
  if (i < 0) return;              // to'xtash sharti (asosiy holat)
  console.log(`begin: ${i}`);
  foo(i - 1);                     // rekursiv chaqiruv
  console.log(`end: ${i}`);
}
foo(3);
```

```text
$ node tartib.mjs
begin: 3
begin: 2
begin: 1
begin: 0
end: 0
end: 1
end: 2
end: 3
```

Har `foo(i)` o'z freymini ochadi va `foo(i - 1)` qaytmaguncha kutadi. `begin` lar chaqiruv tartibida, `end` lar **teskari** tartibda — stekdan freymlar oxirgisidan boshlab chiqadi.

## Kod: nomli funksiya ifodasi

```js
const sanash = function ichki(n) {        // nomli funksiya ifodasi: ichida `ichki` bilan o'zini chaqiradi
  return n === 0 ? [] : [...ichki(n - 1), n];
};
console.log(sanash(5));
console.log(typeof ichki);                 // tashqarida bu nom ko'rinmaydi
```

```text
$ node nom.mjs
[ 1, 2, 3, 4, 5 ]
undefined
```

MDN: funksiya o'ziga ifoda nomi (`ichki`) yoki uni saqlagan o'zgaruvchi (`sanash`) orqali murojaat qila oladi. Sinov ko'rsatdi: ifoda nomi faqat funksiyaning **ichida** ko'rinadi — tashqarida `typeof ichki` → `undefined`.

## Kod: rekursiv tuzilma

Har bo'limda xodimlar va **xuddi shunday** bo'limlar. Bunday tuzilma (daraxt) uchun rekursiya tabiiy:

```js
// Rekursiv tuzilma: har bo'limda xodimlar va ichki bo'limlar
const kompaniya = {
  nom: 'Bosh ofis', xodimlar: [{ ism: 'Ali', maosh: 900 }],
  bolimlar: [
    { nom: 'Savdo', xodimlar: [{ ism: 'Vali', maosh: 700 }, { ism: 'Sami', maosh: 650 }], bolimlar: [] },
    { nom: 'IT', xodimlar: [{ ism: 'Laylo', maosh: 1200 }],
      bolimlar: [{ nom: 'Backend', xodimlar: [{ ism: 'Jasur', maosh: 1100 }], bolimlar: [] }] },
  ],
};
function jamiMaosh(bolim) {
  const ozi = bolim.xodimlar.reduce((s, x) => s + x.maosh, 0);
  return ozi + bolim.bolimlar.reduce((s, b) => s + jamiMaosh(b), 0);   // har bo'limga — o'sha funksiya
}
function chiqar(bolim, chuqurlik = 0) {
  console.log('  '.repeat(chuqurlik) + `${bolim.nom}: ${jamiMaosh(bolim)}`);
  for (const b of bolim.bolimlar) chiqar(b, chuqurlik + 1);
}
chiqar(kompaniya);
```

```text
$ node daraxt.mjs
Bosh ofis: 4550
  Savdo: 1350
  IT: 2300
    Backend: 1100
```

`jamiMaosh` bo'limning o'z xodimlarini qo'shadi va har ichki bo'lim uchun **o'zini** chaqiradi. Asosiy holat — ichki bo'limi yo'q bo'lim (`reduce` bo'sh massivda 0 qaytaradi). Ichma-ichlik qancha chuqur bo'lishini oldindan bilmasak ham kod bir xil.

## Kod: chuqurlik chegarasi va o'z stekimiz

```js
// 100 000 qavat ichma-ich obyekt: { ichki: { ichki: ... } }
let obj = null;
for (let i = 0; i < 100_000; i++) obj = { ichki: obj };

function chuqurlikRek(o) { return o === null ? 0 : 1 + chuqurlikRek(o.ichki); }
try { console.log('rekursiya:', chuqurlikRek(obj)); }
catch (e) { console.log('rekursiya:', e.name + ': ' + e.message); }

function chuqurlikStek(o) {               // o'z stekimiz — oddiy massiv
  let n = 0;
  const stek = [o];
  while (stek.length) {
    const t = stek.pop();
    if (t !== null) { n++; stek.push(t.ichki); }
  }
  return n;
}
console.log('o\'z stekimiz bilan:', chuqurlikStek(obj));
try { console.log('JSON.stringify: satr uzunligi', JSON.stringify(obj).length); }
catch (e) { console.log('JSON.stringify:', e.name + ': ' + e.message); }
```

```text
$ node chuqur.mjs
rekursiya: RangeError: Maximum call stack size exceeded
o'z stekimiz bilan: 100000
JSON.stringify: satr uzunligi 1000004
```

- 100 000 qavatli tuzilmada rekursiya stekni to'ldirdi.
- Xuddi shu ishni **o'z stekimiz** (oddiy massiv, `push`/`pop`) bilan qildik — MDN aytganidek, rekursiyasiz yozish uchun stek kerak. Massiv heap'da turadi va chaqiruvlar stekidan ancha katta bo'la oladi.
- Kuzatildi: Node'dagi `JSON.stringify` xuddi shu tuzilmani xatosiz satrga aylantirdi. Uning chuqurlik chegarasi spetsifikatsiyada yo'q — bu dvigatelga bog'liq.

## Nega shunday

Rekursiv tuzilmani (daraxt, ichma-ich ro'yxat, fayl tizimi) ta'riflashning o'zi rekursiv: "bo'lim — xodimlar va bo'limlar". Kod ta'rifga mos kelsa, uni o'qish va tekshirish oson. Narxi — har chaqiruv stekda freym egallaydi va chuqurlik cheklangan. Sikl esa freym ochmaydi, lekin daraxt aylanishida "qaytish joylarini" o'zingiz saqlashingiz kerak — aynan shu stek.

## Muhandislik nuqtai nazari

### Kirish ma'lumotiga bog'liq chuqurlik — xavf

O'zingiz yaratgan, chuqurligi ma'lum tuzilma uchun rekursiya yaxshi. Tashqaridan kelgan ma'lumot (foydalanuvchi JSON'i, fayl, API javobi) har qancha chuqur bo'lishi mumkin. Unda rekursiv kod `RangeError` bilan yiqiladi. Bunday joyda o'z stekingiz yoki chuqurlik chegarasi kerak.

### Asosiy holatni birinchi yozing

Asosiy holat yo'q yoki unga yetib bo'lmaydigan rekursiya — eng ko'p uchraydigan xato. Funksiya boshida "qachon to'xtaydi?" savoliga javob bering.

### Takror hisoblarni saqlang

Bitta qiymatni ko'p marta hisoblaydigan rekursiyada (masalan, Fibonachchi) natijani `Map` da saqlash (memoizatsiya) ishni keskin kamaytiradi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Asosiy holat yo'q | `RangeError: Maximum call stack size exceeded` | Avval to'xtash sharti |
| Rekursiv qadam masalani kichraytirmaydi | Cheksiz chaqiruv | Har qadamda argument asosiy holatga yaqinlashsin |
| Tashqi ma'lumotni rekursiv aylanish | Chuqur kirishda yiqiladi | O'z stekingiz yoki chuqurlik chegarasi |
| Rekursiv natijani `return` qilmaslik | `undefined` | `return f(...)` |
| Bir qiymatni qayta-qayta hisoblash | Eksponensial vaqt | Memoizatsiya |

## Amaliyot

1. `jamiMaosh` ni rekursiyasiz, o'z stekingiz bilan qayta yozing.
2. Ichma-ich massivni tekislaydigan `tekis(arr)` funksiyasini rekursiya bilan yozing va natijani `arr.flat(Infinity)` bilan solishtiring.
3. `fib(n)` ni oddiy rekursiya va memoizatsiya bilan yozing. `fib(35)` vaqtini o'lchang.
4. Bog'langan ro'yxat (`{ qiymat, keyingi }`) elementlari yig'indisini rekursiya va sikl bilan hisoblang. 100 000 elementda nima bo'ladi?
5. `chiqar` funksiyasiga eng katta chuqurlik parametrini qo'shing: undan chuqurroq bo'limlar `...` bilan ko'rsatilsin.

## Rasmiy hujjat

- MDN — *Functions* (Recursion): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#recursion>
- MDN — *JavaScript execution model* (Stack and execution contexts): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model>
- MDN — *Too much recursion* (RangeError): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Too_much_recursion>
