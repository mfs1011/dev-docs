# 46 — Funksiya obyekti

[← Oldingi: Global obyekt](45-global-obyekt.md) · [Mundarija](README.md) · [Keyingi: `new Function` va `eval` →](47-new-function-eval.md)

## Tushuncha

MDN (*Functions*): JavaScript'da funksiyalar o'zi ham **obyekt**, va bu obyektlarning metodlari bor (`call`, `apply`, `bind` — 49-bob). Funksiyani o'zgaruvchiga yozish, argument qilib berish, qaytarish va unga xossa qo'shish mumkin.

Har funksiyada bir nechta tayyor xossa bor:

| Xossa | Ma'nosi |
| --- | --- |
| `name` | Funksiya nomi — tuzatish vositalari va xato xabarlari uchun. MDN: tilning o'zi uchun **semantik ahamiyati yo'q** |
| `length` | Funksiya **kutayotgan** argumentlar soni — rasmiy parametrlar |
| `prototype` | Oddiy funksiya va klasslarda: `new` bilan yaratilgan obyektlar prototipi (20-bob). MDN: metod, strelka va `async` funksiyada yo'q |

### `name` qanday aniqlanadi (MDN)

`name` faqat o'qish uchun: `=` bilan o'zgarmaydi, o'zgartirish uchun `Object.defineProperty()`. Qiymati funksiya **qanday yaratilganidan** kelib chiqadi:

| Qanday yaratilgan | `name` |
| --- | --- |
| Funksiya e'loni `function doSomething() {}` | `"doSomething"` |
| Anonim ifoda o'zgaruvchiga yoki xossaga: `const f = function () {}` | O'zgaruvchi yoki xossa nomi |
| Metod, getter/setter | Xossa nomi; `"get qiymat"`, `"set qiymat"` |
| Symbol kalitli metod | `"[tavsif]"` |
| `bind()` natijasi | `"bound " + nom` |
| `new Function()` | `"anonymous"` |
| Anonim `export default function` | `"default"` |

MDN ogohlantiradi: kodni siquvchi (minifier) va chalkashtiruvchi vositalar nomlarni o'zgartiradi. Dastur mantig'ini `name` ga bog'lamang.

### `length` (MDN)

- Faqat **birinchi standart qiymatli** parametrgacha bo'lganlar sanaladi.
- Destrukturizatsiya andozasi — bitta parametr.
- Rest parametri sanalmaydi (42-bob).
- `arguments.length` esa — chaqiruvda **haqiqatan** berilgan argumentlar soni.

### Nomli funksiya ifodasi (MDN *function expression*)

Funksiya tanasida o'ziga murojaat qilish uchun ifodaga nom beriladi. Bu nom faqat **funksiya ichida** ko'rinadi. MDN: shunday qilib eskirgan `arguments.callee` dan qochiladi.

## Kod: `name`

```js
function doSomething() {}
const f = function () {};
const strelka = () => {};
const obj = { metod() {}, eski: function () {}, get qiymat() { return 1; }, [Symbol('sim')]() {} };
const { get } = Object.getOwnPropertyDescriptor(obj, 'qiymat');
console.log(doSomething.name, '|', f.name, '|', strelka.name, '|', obj.metod.name, '|', obj.eski.name);
console.log(get.name, '|', obj[Object.getOwnPropertySymbols(obj)[0]].name, '|', doSomething.bind(null).name, '|', new Function().name);
console.log('massivdagi:', JSON.stringify([function () {}][0].name));   // nom chiqarib bo'lmaydi
try { doSomething.name = 'boshqa'; } catch (e) { console.log(e.name + ': ' + e.message.split(' of ')[0]); }   // faqat o'qish uchun (modul — strict)
console.log(doSomething.name, Object.getOwnPropertyDescriptor(doSomething, 'name'));
Object.defineProperty(doSomething, 'name', { value: 'yangiNom' });   // MDN: o'zgartirish yo'li
console.log(doSomething.name);
```

```text
$ node nom.mjs
doSomething | f | strelka | metod | eski
get qiymat | [sim] | bound doSomething | anonymous
massivdagi: ""
TypeError: Cannot assign to read only property 'name'
doSomething {
  value: 'doSomething',
  writable: false,
  enumerable: false,
  configurable: true
}
yangiNom
```

- Anonim funksiya ifodasi va strelka o'zgaruvchidan nom oldi (`f`, `strelka`).
- Massiv ichidagi anonim funksiyaga nom beradigan joy yo'q — `""`.
- Modul strict rejimda: `name` ga yozish `TypeError` berdi (strict bo'lmagan kodda indamay e'tiborsiz qolardi). Xossa: `writable: false`, lekin `configurable: true` — shuning uchun `Object.defineProperty` uni o'zgartira oldi.

## Kod: `length`

```js
console.log((() => {}).length, ((a, b) => {}).length, ((...args) => {}).length);
console.log(((a, b = 1, c) => {}).length, (({ a, b }, [c, d]) => {}).length);   // MDN misollari
function bosqich(qadam, ...qolgan) { return [arguments.length, bosqich.length]; }
console.log('arguments.length va length:', bosqich(1, 2, 3));
```

```text
$ node uzunlik.mjs
0 2 0
1 2
arguments.length va length: [ 3, 1 ]
```

MDN misollari bilan bir xil: `(a, b = 1, c)` — 1, destrukturizatsiya ikki andozasi — 2. `bosqich` 3 ta argument oldi (`arguments.length`), lekin kutgani 1 ta (`length`).

## Kod: funksiya — obyekt

```js
function salom() { salom.chaqirildi++; return 'salom'; }
salom.chaqirildi = 0;                         // funksiya — obyekt, unga xossa qo'shish mumkin
salom(); salom();
console.log(typeof salom, salom instanceof Object, salom.chaqirildi);
console.log(Object.getOwnPropertyNames(salom));
const math = {                                // MDN: nomli funksiya ifodasi o'zini chaqiradi
  factorial: function fakt(n) { return n <= 1 ? 1 : n * fakt(n - 1); },
};
const nusxa = math.factorial;
math.factorial = null;                        // obyektdagi havola o'chdi
console.log(nusxa(5), typeof fakt);           // ichki nom baribir ishlaydi; tashqarida yo'q
```

```text
$ node xossa.mjs
function true 2
[ 'length', 'name', 'prototype', 'chaqirildi' ]
120 undefined
```

- `typeof salom` — `'function'`, lekin u `Object` ning nusxasi va o'z xossalari bor: `length`, `name`, `prototype` va biz qo'shgan `chaqirildi`.
- Funksiyadagi xossa uning chaqiruvlari orasida saqlanadi — closure (43-bob) bilan bir xil vazifa, lekin xossa tashqaridan ko'rinadi.
- Nomli ifoda `fakt` obyektdagi havola `null` qilinganidan keyin ham o'zini chaqira oldi. Tashqarida `fakt` nomi yo'q.

## Nega shunday

Funksiyalar obyekt bo'lgani uchun ularni boshqa qiymatlar kabi uzatish mumkin: callback, funksiya qaytaruvchi funksiya, dekorator (49-bob). `name` va `length` — shu obyektning metama'lumoti: tuzatish vositalari va kutubxonalar uni ishlatadi, til esa ishlashiga ta'sir qilmaydi.

## Muhandislik nuqtai nazari

### Anonim funksiyalarga nom bering

Callback'lar stack trace'da (40-bob) nomi bilan chiqadi. Nomli funksiya yoki nomli o'zgaruvchi xatoni topishni osonlashtiradi.

### `length` ga ehtiyot bo'lib tayaning

Ba'zi kutubxonalar `length` ga qarab xatti-harakatni o'zgartiradi: masalan, callback nechta parametr olishiga qarab. Standart qiymat yoki rest qo'shilsa, `length` o'zgaradi va bunday kod buziladi.

### Funksiya xossalari o'rniga closure yoki klass

Funksiyaga holat yozish ishlaydi, lekin u ochiq va har kim o'zgartira oladi. Yopiq holat uchun closure, murakkab holat uchun klass ishlating.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `fn.name = '...'` | Strict rejimda `TypeError`, aks holda o'zgarmaydi | `Object.defineProperty` |
| Mantiqni `name` ga bog'lash | Minifikatsiyadan keyin buziladi (MDN) | Aniq identifikator xossasi |
| `length` ni berilgan argumentlar soni deb o'ylash | Bu kutilgan parametrlar soni | `arguments.length` yoki rest |
| Rekursiya uchun `arguments.callee` | Eskirgan, strict rejimda xato | Nomli funksiya ifodasi |
| Strelkada `prototype` kutish | Yo'q | Oddiy funksiya yoki klass |

## Amaliyot

1. Turli usulda yaratilgan 8 ta funksiyaning `name` ini oldindan taxmin qiling, keyin tekshiring.
2. `sanoqli(f)` funksiyasini yozing: `f` ni o'rab, chaqiruvlar sonini qaytariladigan funksiyaning `soni` xossasida saqlasin.
3. `(a, b = 2, ...c)` va `({ a }, b)` parametrli funksiyalar `length` ini hisoblang va tekshiring.
4. Nomli funksiya ifodasi bilan rekursiv `sanoq(n)` yozing va uni boshqa o'zgaruvchiga ko'chirib, asl o'zgaruvchini `null` qiling.
5. `Object.getOwnPropertyDescriptors` bilan oddiy funksiya, strelka va klassning xossalarini solishtiring.

## Rasmiy hujjat

- MDN — `Function`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function>
- MDN — `Function.prototype.name`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/name>
- MDN — `Function: prototype`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype>
- MDN — `Function.prototype.length`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/length>
- MDN — *function expression* (Named function expression): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function>
