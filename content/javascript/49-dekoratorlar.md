# 49 — Dekoratorlar va `call`/`apply`

[← Oldingi: `setTimeout` va `setInterval`](48-taymerlar.md) · [Mundarija](README.md) · [Keyingi: `bind` va partial →](50-bind.md)

## Tushuncha

### `call` va `apply` (MDN)

Odatda funksiya ichidagi `this` — funksiya qaysi obyekt orqali chaqirilgan bo'lsa, o'sha (19-bob). `call` va `apply` funksiyani **ixtiyoriy `this`** bilan chaqiradi — funksiyani obyektga xossa qilib qo'shmasdan. MDN: shunday qilib bir obyektning metodini boshqa obyekt uchun umumiy yordamchi funksiya sifatida ishlatish mumkin.

| | Argumentlar | Misol |
| --- | --- | --- |
| `fn.call(thisArg, a, b)` | Alohida-alohida | `greet.call(obj, 'salom')` |
| `fn.apply(thisArg, [a, b])` | Bitta massiv (yoki massivga o'xshash obyekt) | `greet.apply(obj, ['salom'])` |

- `thisArg` — funksiya strict rejimda **bo'lmasa**, `null`/`undefined` global obyekt bilan almashtiriladi, primitiv esa obyektga o'raladi. Strict rejimda o'zgarishsiz uzatiladi.
- `apply` ikkinchi argumenti — `length` va indeksli xossalari bor har qanday obyekt.
- MDN: `fn.apply(null, args)` deyarli `fn(...args)` ning o'zi (42-bob). Farqi: `apply` — massivga o'xshash, spread — iterable kutadi. Ikkalasi ham juda uzun ro'yxatda dvigatelning argumentlar chegarasiga urilishi mumkin.
- MDN ogohlantiradi: `call`/`apply` bilan konstruktorlarni zanjirlamang (meros uchun). Ular konstruktorni oddiy funksiya kabi chaqiradi, `new.target` — `undefined`, klasslar esa xato beradi. Buning uchun `extends` yoki `Reflect.construct()`.

### Dekorator (o'rovchi funksiya)

**Dekorator** — funksiyani qabul qilib, uni **o'rab olgan yangi funksiya** qaytaradigan funksiya. Yangi funksiya asl funksiyani chaqiradi va oldidan yoki keyin qo'shimcha ish qiladi: kesh, log, vaqtni o'lchash, tekshirish. Asl funksiya o'zgarmaydi.

Bu bobda dekorator — oddiy funksiyalar ustidagi **andoza** (pattern), alohida sintaksis emas.

O'rovchi funksiya ikki narsani to'liq uzatishi shart:

1. **Barcha argumentlar** — `...args` (42-bob);
2. **`this`** — o'rovchi oddiy funksiya bo'lishi va asl funksiyani `fn.call(this, ...)` yoki `fn.apply(this, args)` bilan chaqirishi kerak. Strelka o'rovchi o'z `this` iga ega emas.

## Kod: `call` va `apply`

```js
function greet(salom) {                              // MDN misoli asosida
  return `${salom}: ${this.hayvon} ${this.uyqu} uxlaydi`;
}
const obj = { hayvon: 'mushuklar', uyqu: '12–16 soat' };
console.log(greet.call(obj, 'call'));                // argumentlar alohida
console.log(greet.apply(obj, ['apply']));           // argumentlar massivda
console.log(Math.max.apply(null, [3, 9, 4]), Math.max(...[3, 9, 4]));
const qarz = { length: 2, 0: 'a', 1: 'b' };          // massivga o'xshash obyekt
console.log(Array.prototype.join.call(qarz, '+'));  // boshqa obyekt metodini "qarzga olish"
function kim() { return this; }                       // modul — strict: this o'zgarmaydi
console.log(kim.call(undefined), typeof kim.call(5));
```

```text
$ node call.mjs
call: mushuklar 12–16 soat uxlaydi
apply: mushuklar 12–16 soat uxlaydi
9 9
a+b
undefined number
```

- `call` va `apply` bir xil natija berdi, faqat argumentlarni berish usuli farq qiladi.
- `Math.max.apply(null, arr)` — `Math.max(...arr)` ning eski shakli.
- `Array.prototype.join.call(qarz, '+')` — massiv metodi massivga o'xshash obyektda ishladi ("metodni qarzga olish").
- Modul strict: `call(undefined)` da `this` — `undefined`, `call(5)` da — oddiy son (obyektga o'ralmadi).

## Kod: kesh dekoratori

```js
// Dekorator: funksiyani o'rab, xatti-harakat qo'shadigan funksiya. Asl funksiya o'zgarmaydi.
function keshla(fn) {
  const kesh = new Map();
  return function (x) {
    if (kesh.has(x)) return kesh.get(x);
    const natija = fn.call(this, x);                 // `this` ni o'ralgan funksiyaga uzatish
    kesh.set(x, natija);
    return natija;
  };
}
function sekinKvadrat(x) { console.log(`  hisoblanyapti: ${x}`); return x * x; }
const tez = keshla(sekinKvadrat);
console.log(tez(4), tez(4), tez(5));

const ishchi = {
  koeffitsient: 10,
  hisobla(x) { console.log(`  hisoblanyapti: ${x}`); return x * this.koeffitsient; },
};
ishchi.hisobla = keshla(ishchi.hisobla);             // metodni dekoratsiya qilish
console.log(ishchi.hisobla(2), ishchi.hisobla(2));

function thisSiz(fn) { return (x) => fn(x); }    // `this` yo'qoladi
ishchi.yomon = thisSiz(function (x) { return x * this.koeffitsient; });
try { ishchi.yomon(2); } catch (e) { console.log('this uzatilmagan:', e.name + ': ' + e.message); }
```

```text
$ node dekorator.mjs
  hisoblanyapti: 4
  hisoblanyapti: 5
16 16 25
  hisoblanyapti: 2
20 20
this uzatilmagan: TypeError: Cannot read properties of undefined (reading 'koeffitsient')
```

- `tez(4)` ikkinchi marta hisoblanmadi — natija keshdan olindi.
- Metod ham dekoratsiya qilindi: `fn.call(this, x)` tufayli `this.koeffitsient` ishladi.
- `thisSiz` strelka o'rovchi bilan `fn(x)` chaqirdi — `this` yo'qoldi va `TypeError`.

## Kod: ixtiyoriy argumentlar va metama'lumot

```js
// Ko'p argumentli dekorator: barcha argumentlar va this — `...args` va apply/call
function vaqtniOlcha(fn) {
  return function (...args) {
    const t = performance.now();
    try { return fn.apply(this, args); }
    finally { console.log(`  ${fn.name}(${args.join(', ')}) — ${(performance.now() - t) < 50 ? '<50' : '>=50'} ms`); }
  };
}
const kalk = { qosh(a, b, c = 0) { return a + b + c; } };
kalk.qosh = vaqtniOlcha(kalk.qosh);
console.log(kalk.qosh(1, 2), kalk.qosh(1, 2, 3));
console.log('name:', kalk.qosh.name, '| length:', kalk.qosh.length);   // o'ram nomi va length yo'qoladi
```

```text
$ node kop.mjs
  qosh(1, 2) — <50 ms
  qosh(1, 2, 3) — <50 ms
3 6
name:  | length: 0
```

- `...args` va `fn.apply(this, args)` — har qanday sondagi argument va `this` uzatildi.
- `finally` — natija qaytgandan keyin ham, xatoda ham log yoziladi.
- Kuzatildi: o'ralgan funksiyaning `name` i bo'sh, `length` 0 (46-bob): bular o'rovchiga tegishli, asl funksiyaga emas. Kerak bo'lsa `Object.defineProperty` bilan ko'chiriladi.

## Nega shunday

Funksiya — qiymat (46-bob), shuning uchun uni boshqa funksiyaga berish va o'rab qaytarish mumkin. Bu umumiy xatti-harakatni (kesh, log) asosiy mantiqdan ajratadi: `sekinKvadrat` keshlash haqida hech narsa bilmaydi. `this` esa chaqiruv paytida aniqlanadi (19-bob). O'rovchi uni ko'rinmas tarzda o'zgartirib yubormasligi uchun `call`/`apply` kerak.

## Muhandislik nuqtai nazari

### Kesh kalitiga e'tibor bering

Bitta argumentli kesh `Map` kaliti bilan oddiy. Ko'p argumentda kalitni yig'ish kerak (masalan, `JSON.stringify(args)`) — bu obyekt argumentlarda noto'g'ri yoki qimmat bo'lishi mumkin. Kesh cheksiz o'smasligi uchun hajm chegarasi qo'ying.

### Faqat sof funksiyalarni keshlang

Natijasi faqat argumentlarga bog'liq va yon ta'siri yo'q funksiyalarni keshlash mumkin. Vaqt, tarmoq yoki holatga bog'liq funksiya keshda eskirgan javob qaytaradi.

### Zamonaviy kodda

`fn.apply(null, args)` o'rniga ko'pincha `fn(...args)`. `call`/`apply` esa `this` ni boshqarish kerak bo'lganda qoladi — ayniqsa dekoratorlarda.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| O'rovchi strelka va `fn(...args)` | Metodlarda `this` yo'qoladi | Oddiy funksiya va `fn.apply(this, args)` |
| Faqat birinchi argumentni uzatish | Qolgan argumentlar yo'qoladi | `...args` |
| Yon ta'sirli funksiyani keshlash | Eskirgan natija | Faqat sof funksiyalar |
| `call`/`apply` bilan konstruktor merosi | Klassda `TypeError` (MDN) | `extends`, `Reflect.construct` |
| Juda katta massivni `apply` ga berish | Argumentlar chegarasi | Sikl yoki `reduce` |

## Amaliyot

1. `kesh` dekoratorini ko'p argumentli funksiyalar uchun kengaytiring (kalit — argumentlardan yig'ilgan satr).
2. `faqatBirMarta(fn)` dekoratorini yozing va uni obyekt metodiga qo'llab, `this` saqlanishini tekshiring.
3. `kechiktir(fn, ms)` dekoratori: har chaqiruvni `ms` ga kechiktirsin (48-bob), `this` va argumentlarni saqlasin.
4. `vaqtniOlcha` dekoratoriga asl funksiyaning `name` va `length` ini ko'chirishni qo'shing.
5. `Array.prototype.map.call` bilan satrdagi har belgini katta harfga aylantiring va natijani `[...satr].map` bilan solishtiring.

## Rasmiy hujjat

- MDN — `Function.prototype.call()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call>
- MDN — `Function.prototype.apply()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply>
- MDN — `this`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
