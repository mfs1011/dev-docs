# 48 — `setTimeout` va `setInterval`

[← Oldingi: `new Function` va `eval`](47-new-function-eval.md) · [Mundarija](README.md) · [Keyingi: Dekoratorlar va `call`/`apply` →](49-dekoratorlar.md)

## Tushuncha

Taymerlar funksiyani **keyinroq** bajarishga rejalashtiradi:

| Funksiya | Nima qiladi | Bekor qilish |
| --- | --- | --- |
| `setTimeout(fn, kechikish, ...arg)` | `fn` ni **bir marta**, kamida `kechikish` ms dan keyin | `clearTimeout(id)` |
| `setInterval(fn, oraliq, ...arg)` | `fn` ni har `oraliq` ms da **takroran** | `clearInterval(id)` |

Taymerlar ECMAScript'ning emas, **host**'ning (brauzer — WHATWG HTML standarti, Node.js) API'si. Shuning uchun ular ikki muhitda biroz farq qiladi.

### Asosiy qoidalar (MDN)

- `setTimeout` **asinxron**: callback'ni rejalashtiradi va **darhol qaytadi**. Keyingi qatorlar kutmaydi.
- Kechikish — **eng kami**, aniq vaqt emas. Callback navbatga qo'yiladi va joriy kod tugamaguncha bajarilmaydi. Shuning uchun `setTimeout(fn, 0)` ham sinxron koddan **keyin** ishlaydi (navbat va event loop — 76–78-boblar).
- Qo'shimcha argumentlar callback'ga uzatiladi.
- Oddiy funksiya callback `this` sifatida `globalThis` ni oladi. Obyekt metodini to'g'ridan-to'g'ri bersangiz, `this` yo'qoladi (19, 49-boblar).
- Kechikish 32 bitli ishorali butun songa aylantiriladi: eng ko'pi **2 147 483 647 ms** (~24,8 kun). Undan katta qiymat to'lib ketadi. MDN: Node.js'da bundan katta har qanday kechikish darhol bajariladi.

### Kechikish uzayadigan holatlar (MDN)

- **Ichma-ich taymerlar**: HTML standarti bo'yicha brauzerlar `setTimeout` 5 marta ichma-ich chaqirilgandan keyin kechikishni kamida **4 ms** qiladi.
- Faol bo'lmagan tablar, kuzatuv skriptlari — brauzer ularni sekinlashtiradi.
- **Band oqim**: sahifa yoki tizim boshqa ish bilan band bo'lsa, taymer kech ishlaydi.

### `setInterval` va ish uzunligi (MDN)

Agar ish oraliqdan uzoq davom etishi mumkin bo'lsa (masalan, serverni har 5 soniyada so'rash), MDN **rekursiv `setTimeout`** andozasini tavsiya qiladi: keyingi chaqiruv oldingisi tugagandan keyin rejalashtiriladi.

### Node.js'dagi farqlar (Node *Timers*)

| | Node.js |
| --- | --- |
| Qaytaradi | `Timeout` obyekti (brauzerda — son). `Symbol.toPrimitive` bilan songa aylanadi |
| Kechikish | Standart 1. 2 147 483 647 dan katta, 1 dan kichik yoki `NaN` — 1 ga aylanadi; kasr qismi tashlanadi |
| Aniqlik | Node aniq vaqt va tartibni kafolatlamaydi — iloji boricha yaqin |
| `unref()` | Taymer jarayonni tirik ushlab turmaydi: boshqa ish bo'lmasa, Node kutmasdan chiqadi |

## Kod: tartib

MDN misoli, qisqartirilgan kechikishlar bilan:

```js
setTimeout(() => console.log('birinchi (300 ms)'), 300);   // MDN misoli, qisqartirilgan kechikishlar
setTimeout(() => console.log('ikkinchi (200 ms)'), 200);
setTimeout(() => console.log('uchinchi (100 ms)'), 100);
setTimeout(() => console.log('nol kechikish'), 0);
console.log('sinxron kod tugadi');                          // taymer kutmaydi
```

```text
$ node tartib.mjs
sinxron kod tugadi
nol kechikish
uchinchi (100 ms)
ikkinchi (200 ms)
birinchi (300 ms)
```

Taymerlar rejalashtirilgan tartibda emas, **kechikish** tartibida ishladi. `0` ms bo'lsa ham callback sinxron koddan keyin keldi.

## Kod: argumentlar, bekor qilish, Node xususiyatlari

```js
const t = setTimeout((ism, son) => console.log(`salom, ${ism}! ${son}`), 10, 'Ali', 7);   // qo'shimcha argumentlar
console.log(typeof t, t.constructor.name, typeof Number(t));   // Node: Timeout obyekti (brauzerda — son)
const bekor = setTimeout(() => console.log('bu chiqmaydi'), 20);
clearTimeout(bekor);
setTimeout(() => console.log('katta kechikish bajarildi'), 2 ** 31);   // 2147483647 dan katta — Node: 1 ms
setTimeout(() => console.log('unref qilingan — kutilmaydi'), 1000).unref();
```

```text
$ node boshqaruv.mjs 2>&1
object Timeout number
(node:791510) TimeoutOverflowWarning: 2147483648 does not fit into a 32-bit signed integer.
Timeout duration was set to 1.
(Use `node --trace-warnings ...` to show where the warning was created)
katta kechikish bajarildi
salom, Ali! 7
```

- Node'da `setTimeout` `Timeout` obyekti qaytardi, u songa aylanadi.
- `clearTimeout` bilan bekor qilingan callback chiqmadi.
- `2 ** 31` — chegaradan katta: Node `TimeoutOverflowWarning` berdi va kechikishni **1 ms** qildi. Shuning uchun u 10 ms'li taymerdan **oldin** ishladi.
- `unref()` qilingan 1 soniyalik taymer kutilmadi — boshqa ish qolmagach jarayon tugadi.

## Kod: `setInterval` va rekursiv `setTimeout`

Har chaqiruvdagi ish 80 ms, oraliq 50 ms:

```js
const band = (ms) => { const t = Date.now(); while (Date.now() - t < ms); };   // ish 80 ms davom etadi
const boshi = Date.now(), vaqt = () => Date.now() - boshi;
let n = 0;
const qadamlar = [];
const id = setInterval(() => {
  qadamlar.push(vaqt()); band(80);
  if (++n === 5) { clearInterval(id); console.log('setInterval(50) boshlanishlar:', qadamlar.map(v => Math.round(v / 10) * 10).join(', ')); ichma(); }
}, 50);
function ichma() {
  const b = Date.now(), q = [];
  (function sikl(i) {                                    // MDN: rekursiv setTimeout andozasi
    setTimeout(() => {
      q.push(Date.now() - b); band(80);
      if (i < 4) sikl(i + 1); else console.log('ichma-ich setTimeout(50):', q.map(v => Math.round(v / 10) * 10).join(', '));
    }, 50);
  })(0);
}
```

```text
$ node interval.mjs
setInterval(50) boshlanishlar: 50, 130, 210, 290, 370
ichma-ich setTimeout(50): 50, 180, 310, 440, 570
```

| | Boshlanishlar (ms) | Oraliq |
| --- | --- | --- |
| `setInterval(50)` | 50, 130, 210, 290, 370 | ~80 — ish tugashi bilan keyingisi, dam yo'q |
| Rekursiv `setTimeout(50)` | 50, 180, 310, 440, 570 | ~130 — ish (80) + doim 50 ms tanaffus |

`setInterval` ish uzun bo'lsa, chaqiruvlarni ketma-ket "tiqib" yuboradi. Rekursiv `setTimeout` esa chaqiruvlar orasida **kafolatlangan** bo'sh vaqt qoldiradi.

## Nega shunday

JavaScript bitta oqimda ishlaydi va kodni bo'lib bajarmaydi (run-to-completion, 40-bob). Taymer joriy kodni to'xtata olmaydi — u faqat "vaqt kelganda shu funksiyani navbatga qo'y" deydi. Shuning uchun kechikish doim minimal qiymat. Host esa resurslarni tejash uchun uni uzaytirishi mumkin: fon tablar, ichma-ich taymerlar.

## Muhandislik nuqtai nazari

### Vaqtni taymer bilan o'lchamang

Taymer kech ishlashi mumkin. Sanoq, animatsiya yoki o'yin uchun o'tgan vaqtni haqiqiy soatdan (`Date.now()`, `performance.now()`) hisoblang, chaqiruvlar sonidan emas.

### Davriy ish uchun rekursiv `setTimeout`

Tarmoq so'rovi yoki og'ir ish oraliqdan uzoq bo'lishi mumkin bo'lsa — rekursiv `setTimeout` (MDN). Shunda so'rovlar ustma-ust tushmaydi.

### Har taymerni tozalang

Komponent o'chganda yoki ish kerak bo'lmay qolganda `clearTimeout`/`clearInterval` chaqiring. Aks holda callback va u ushlab turgan closure xotirada qoladi (43-bob). Node'da fon taymerlari uchun `unref()`.

### Satrni taymerga bermang

`setTimeout('kod', ...)` — `eval` kabi (47-bob). Har doim funksiya bering.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `setTimeout(fn, 0)` darhol ishlaydi deb o'ylash | Sinxron koddan keyin ishlaydi | Tartibni event loop bilan tushunish (76-bob) |
| `setTimeout(obj.metod, 100)` | `this` yo'qoladi | `() => obj.metod()` yoki `bind` |
| Ish uzun bo'lgan `setInterval` | Chaqiruvlar orasida tanaffus qolmaydi | Rekursiv `setTimeout` |
| 24,8 kundan uzun kechikish | Darhol bajariladi | Bo'lib rejalashtirish yoki boshqa vosita |
| Taymerni tozalamaslik | Xotira va kutilmagan chaqiruvlar | `clear*`, `unref()` |

## Amaliyot

1. 1 dan 5 gacha har soniyada sanaydigan funksiyani `setInterval` va rekursiv `setTimeout` bilan yozing.
2. `kechiktir(fn, ms)` funksiyasini yozing: `fn` ni `ms` dan keyin chaqiradigan va bekor qilish funksiyasini qaytaradigan.
3. Brauzerda `setTimeout(..., 0)` ni 10 marta ichma-ich chaqirib, har chaqiruv orasidagi vaqtni o'lchang. MDN'dagi 4 ms qoidasini toping.
4. `class Hisob { son = 0; oshir() { this.son++; } }` metodini `setTimeout` ga to'g'ridan-to'g'ri bering, xatoni ko'ring va ikki usulda tuzating.
5. Node'da `setTimeout(..., 3000).unref()` va `setInterval` bilan jarayon qachon tugashini tekshiring.

## Rasmiy hujjat

- MDN — `setTimeout()`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout>
- MDN — `setInterval()`: <https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval>
- WHATWG HTML — *Timers*: <https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers>
- Node.js — *Timers*: <https://nodejs.org/api/timers.html>
