# 13 — Funksiyalar asoslari

[← Oldingi: Sikllar](12-sikllar.md) · [Mundarija](README.md) · [Keyingi: Arrow funksiyalar →](14-arrow-funksiyalar.md)

## Tushuncha

**Funksiya** — nom berilgan (yoki nomsiz) kod bo'lagi: uni bir marta yozib, ko'p marta **chaqirish** mumkin. MDN (*Functions*): funksiyani **aniqlash** uni bajarmaydi — faqat nom beradi va chaqirilganda nima qilishini belgilaydi. **Chaqirish** esa amallarni berilgan qiymatlar bilan haqiqatan bajaradi.

Atamalar:

| Atama | Ma'nosi | Misolda |
| --- | --- | --- |
| **Parametr** | Funksiya e'lonidagi nom | `function kvadrat(son)` dagi `son` |
| **Argument** | Chaqiruvda beriladigan qiymat | `kvadrat(5)` dagi `5` |
| **Qaytariladigan qiymat** | `return` bilan beriladigan natija | `son * son` |
| **Tana** | `{ }` ichidagi instruksiyalar | — |

Funksiya yaratishning ikki asosiy usuli bor — **e'lon** (declaration) va **ifoda** (expression). Ular orasidagi farq hoisting va nomlashda ko'rinadi. Uchinchi usul — arrow funksiya — 14-bobda.

## Kod: e'lon, chaqiruv, `return`

```js
function kvadrat(son) {
  return son * son;
}
console.log(kvadrat(5), typeof kvadrat);
function salom(ism) { console.log(`Salom, ${ism}!`); }
console.log(salom('Ali'));
function f(a, b) { return [a, b]; }
console.log(f(1), f(1, 2, 3));
```

```text
$ node asos.mjs
25 function
Salom, Ali!
undefined
[ 1, undefined ] [ 1, 2 ]
```

MDN: funksiya e'loni `function` kalit so'zi, funksiya **nomi**, qavsdagi vergul bilan ajratilgan **parametrlar** ro'yxati va `{ }` ichidagi **tanadan** iborat.

- **`return`** funksiya ijrosini to'xtatadi va qiymat qaytaradi (MDN *return*). `return` bo'lmasa (yoki qiymatsiz `return;`) — funksiya **`undefined`** qaytaradi (6-bob). `salom` hech narsa qaytarmagani uchun ikkinchi `console.log` `undefined` chiqardi.
- **Argumentlar soni erkin.** Kam berilsa, yetishmagan parametrlar — `undefined`; ko'p berilsa, ortiqchasi e'tiborsiz qoladi (lekin `arguments` va rest parametr orqali olish mumkin — 42-bob). JavaScript buning uchun xato bermaydi.
- `return` dan keyin yangi qatorga ifoda yozmang — ASI uni `return;` qiladi (3-bob).

## Kod: argumentlar qiymat bo'yicha uzatiladi

MDN muhim narsani ta'kidlaydi: parametrlar funksiyaga **qiymat bo'yicha** uzatiladi — funksiya ichida parametrga **butunlay yangi qiymat** berilsa, bu tashqariga ta'sir qilmaydi. Lekin **obyekt** uzatilsa va funksiya uning **xossalarini** o'zgartirsa, o'zgarish tashqarida ko'rinadi.

```js
function ozgartir(son, mashina, royxat) {
  son = 99;
  mashina.rusum = 'Toyota';
  royxat[0] = 30;
  royxat = ['yangi'];
}
let n = 1;
const m = { rusum: 'Honda' };
const r = [45];
ozgartir(n, m, r);
console.log(n, m.rusum, r);
```

```text
$ node qiymat.mjs
1 Toyota [ 30 ]
```

- `son = 99` — tashqaridagi `n` o'zgarmadi.
- `mashina.rusum = ...` — obyekt **ichi** o'zgardi, tashqarida ham ko'rinadi.
- `royxat[0] = 30` — massiv ichi o'zgardi.
- `royxat = ['yangi']` — faqat **lokal** parametr boshqa massivga qaratildi; tashqaridagi `r` ga ta'siri yo'q.

Ya'ni obyekt uzatilganda **havolaning nusxasi** uzatiladi: ikkalasi bitta obyektga qaraydi (6-bobdagi rasm). Havolaning o'zini almashtirish tashqariga ta'sir qilmaydi, havola orqali obyektni o'zgartirish esa ta'sir qiladi. 17-bobda chuqur.

## Kod: hoisting — e'lon "ko'tariladi", ifoda yo'q

```js
console.log(kvadrat(5));
function kvadrat(n) { return n * n; }
try { console.log(kub(2)); } catch (e) { console.log(e.name + ':', e.message); }
const kub = function (n) { return n ** 3; };
console.log(kub(2));
```

```text
$ node kotarish.mjs
25
ReferenceError: Cannot access 'kub' before initialization
8
```

MDN (*Function hoisting*): `kvadrat` e'lon qilinishidan **oldin** chaqirildi va ishladi — interpretator butun funksiya e'lonini joriy scope'ning **boshiga ko'taradi** (hoist). Kod quyidagiga teng:

```js
function kvadrat(n) { return n * n; }   // barcha e'lonlar amalda scope boshida
console.log(kvadrat(5));
```

MDN: hoisting faqat funksiya **e'lonlari** bilan ishlaydi, funksiya **ifodalari** bilan emas. `kub` — `const` o'zgaruvchisi, unga funksiya ifodasi berilgan; e'londan oldin u TDZ'da (5-bob).

MDN yana aytadi: funksiya chaqirilganda u **scope'da** bo'lishi kerak; e'lonning scope'i — u e'lon qilingan funksiya (yoki yuqori darajada bo'lsa — butun dastur).

## Kod: funksiya ifodasi

```js
const faktorial = function fak(n) { return n < 2 ? 1 : n * fak(n - 1); };
console.log(faktorial(5), typeof fak);
```

```text
120 undefined
```

MDN: funksiya ifodasi **anonim** (nomsiz) bo'lishi mumkin. Lekin unga nom berilsa (`fak`), funksiya **o'ziga murojaat qila oladi** va debugger stekida (2-bob, `bt`) nomi bilan ko'rinadi. Bu nom faqat funksiya **ichida** mavjud — tashqarida `typeof fak` → `"undefined"`. Bu **NFE** (Named Function Expression) — 46-bobda.

### Funksiyani argument sifatida uzatish

MDN: funksiya ifodalari boshqa funksiyaga argument sifatida berishda qulay:

```js
function qolla(fn, royxat) { const natija = []; for (const x of royxat) natija.push(fn(x)); return natija; }
console.log(qolla(function (x) { return x * x * x; }, [0, 1, 2, 5]));
```

```text
[ 0, 1, 8, 125 ]
```

Bu — **yuqori tartibli funksiya** (higher-order function) g'oyasi: funksiya boshqa funksiyani qabul qiladi yoki qaytaradi. Massivning `map`, `filter`, `sort` metodlari (31-bob), hodisa ishlovchilari, `setTimeout` — hammasi shunga quriladi. Argument sifatida berilgan funksiya **callback** deyiladi.

Bu imkon bor, chunki MDN aytganidek, **funksiyalar ham obyekt** (6-bob) — ularni o'zgaruvchiga saqlash, uzatish, qaytarish mumkin.

### IIFE — darhol chaqiriladigan funksiya ifodasi

```js
const qiymat = (function () { const ichki = 21; return ichki * 2; })();
console.log(qiymat, typeof ichki);
```

```text
42 undefined
```

MDN (*IIFE*): ifoda sifatida aniqlangan funksiyani **darhol** chaqirish. Afzalliklari: qo'shimcha **scope** yaratadi (`ichki` tashqariga chiqmaydi) va instruksiyalar ketma-ketligini **ifodaga** aylantiradi — murakkab hisob bilan o'zgaruvchini boshlash mumkin. Modullar va blok scope (`let`/`const`) paydo bo'lgach, IIFE kamroq kerak — lekin eski kodda ko'p uchraydi. 3-bobdagi ASI ogohlantirishi esingizdami: `;` siz uslubda IIFE oldiga `;` kerak.

## Kod: default va rest parametrlar

```js
function kopaytir(a, b = 1) { return a * b; }
console.log(kopaytir(5), kopaytir(5, 2), kopaytir(5, undefined), kopaytir(5, null));
function salom(ism = 'mehmon', xabar = `Salom, ${ism}`) { return xabar; }
console.log(salom(), salom('Ali'));
function yigindi(...sonlar) { return sonlar.reduce((a, b) => a + b, 0); }
console.log(yigindi(), yigindi(1, 2, 3, 4));
```

```text
5 10 5 0
Salom, mehmon Salom, Ali
0 10
```

**Default parametrlar** (MDN): parametrlar sukut bo'yicha `undefined`. Default qiymat faqat argument **berilmasa yoki `undefined`** bo'lsa ishlaydi — `null` da **ishlamaydi**: `kopaytir(5, null)` → `5 * null` → `0`. (`null` ni ham ushlash kerak bo'lsa — tanada `??`, 10-bob.) Keyingi parametrning default qiymati oldingisiga tayanishi mumkin (`xabar` → `ism`).

Default parametrlardan oldin MDN keltirgan eski usul: `b = typeof b !== 'undefined' ? b : 1;` — endi kerak emas.

**Rest parametr** `...sonlar` — qolgan barcha argumentlarni **haqiqiy massiv**ga yig'adi. Argument berilmasa — bo'sh massiv. 42-bobda batafsil.

## Nega shunday

MDN: funksiyalar — **obyekt**, faqat chaqirilishi mumkin bo'lgan obyekt (6-bob). Shuning uchun funksiyani boshqa qiymatlar kabi saqlash, uzatish va qaytarish mumkin — callback, closure va yuqori tartibli funksiyalar shunga tayanadi.

Argumentlar sonining erkinligi tilning "kechirimli" tabiatiga mos — lekin xatolarni yashiradi: yetishmagan argument jim `undefined` bo'ladi. Default va rest parametrlar shu bo'shliqni aniqroq to'ldiradi: MDN ko'rsatgan eski `typeof b !== 'undefined'` tekshiruvi endi kerak emas.

Hoisting esa funksiya e'lonlarini kodning istalgan joyida ishlatishga imkon beradi — masalan, faylning yuqorisida asosiy mantiq, pastida yordamchi funksiyalar.

## Muhandislik nuqtai nazari

### E'lon yoki ifoda?

| | Funksiya e'loni | `const` + funksiya ifodasi |
| --- | --- | --- |
| Hoisting | Bor — e'londan oldin chaqirish mumkin | Yo'q — TDZ |
| Qayta tayinlash | Mumkin (`kvadrat = ...`) | `const` — mumkin emas |
| Shartli yaratish | Blokdagi e'lon — strict mode'da faqat blokda (4-bob) | Tabiiy |

Ikkalasi ham to'g'ri — loyiha ichida bir xil uslub tanlang. Masalan: yuqori darajadagi nomli funksiyalar uchun e'lon, callback'lar uchun arrow funksiya (14-bob).

### Kichik va bir vazifali funksiyalar

Funksiya nomi u **nima qilishini** aytishi kerak (MDN uslub qo'llanmasi: funksiyalar uchun camelCase, qisqa va ma'noli). Agar nomni "va" so'zisiz ayta olmasangiz (`tekshirVaSaqla`) — funksiya ikkiga bo'linishi kerak.

### Argumentlarni o'zgartirmang

Funksiya o'ziga berilgan obyektni o'zgartirsa (yuqoridagi `mashina.rusum`), chaqiruvchi buni kutmagan bo'lishi mumkin — bunday xatolarni topish qiyin. Yangi obyekt qaytarish xavfsizroq: `return { ...mashina, rusum: 'Toyota' }` (42-bob).

### Ko'p parametr o'rniga obyekt

Parametrlar ko'payganda ularning tartibini eslab qolish qiyinlashadi. Bitta obyekt parametr va destructuring (36-bob) bilan: `function yarat({ nom, narx, soni = 1 })` — chaqiruvda nomlar ko'rinadi.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `return` ni unutish | Funksiya `undefined` qaytaradi | Natija kerak bo'lsa — `return` |
| Funksiya ifodasini e'londan oldin chaqirish | `ReferenceError` (TDZ) | E'lon ishlating yoki tartibni o'zgartiring |
| Default qiymat `null` da ishlaydi deb kutish | `null` uzatiladi | `??` tanada |
| Parametrga yangi qiymat berib, tashqarida o'zgarish kutish | O'zgarmaydi | Qiymatni `return` qiling |
| Kam argument bilan chaqirish | Jim `undefined`, keyin `NaN` | Default qiymat yoki tekshiruv |
| Funksiyani chaqirish o'rniga uzatish: `setTimeout(f(), 100)` | `f` darhol bajariladi, natijasi uzatiladi | `setTimeout(f, 100)` |

## Amaliyot

1. `ortacha(...sonlar)` funksiyasini yozing. Argumentsiz chaqirilganda `NaN` emas, `0` qaytarsin.
2. `salomlash(ism, til = 'uz')` — `til` ga qarab "Salom" yoki "Hello" qaytarsin. `salomlash('Ali', null)` nima beradi va nega?
3. Quyidagini ishga tushirmasdan ayting: `const f = function g() { return typeof g; }; console.log(f(), typeof g);`.
4. `qolla(fn, royxat)` ni `filtrla(shart, royxat)` ga o'zgartiring: faqat `shart(x)` truthy bo'lgan elementlarni qaytarsin.
5. `function yangilash(foydalanuvchi) { foydalanuvchi.faol = true; }` ni chaqiruvchini o'zgartirmaydigan qilib qayta yozing.

## Rasmiy hujjat

- MDN — *Functions* (Guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions>
- MDN — `function` declaration: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function>
- MDN — `function` expression: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function>
- MDN — `return`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/return>
- MDN — *Default parameters*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters>
- MDN — *IIFE* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/IIFE>
- ECMA-262 — *Function Definitions*: <https://tc39.es/ecma262/2026/#sec-function-definitions>
