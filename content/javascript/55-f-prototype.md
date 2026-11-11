# 55 — `F.prototype`

[← Oldingi: Prototip merosi](54-prototip-merosi.md) · [Mundarija](README.md) · [Keyingi: Native prototiplar →](56-native-prototiplar.md)

## Tushuncha

54-bobda prototipni qo'lda berdik: `{ __proto__: p }`. MDN: har obyekt uchun buni yozish noqulay. **Konstruktor funksiya** (20-bob) buni avtomatik qiladi.

Har oddiy funksiyaning `prototype` degan **oddiy xossasi** bor. `new F()` bilan yaratilgan har nusxaning `[[Prototype]]` i **avtomatik** `F.prototype` ga teng bo'ladi:

```text
new Box(1) ──[[Prototype]]──► Box.prototype ──► Object.prototype ──► null
```

Uchta narsani adashtirmaslik kerak:

| | Nima | Misol |
| --- | --- | --- |
| `Box.prototype` | Funksiyaning **xossasi**: nusxalar uchun prototip | `{ constructor: Box, getValue }` |
| `Object.getPrototypeOf(nusxa)` | Nusxaning `[[Prototype]]` i | `=== Box.prototype` |
| `Object.getPrototypeOf(Box)` | Funksiyaning **o'z** `[[Prototype]]` i | `Function.prototype` |

MDN: `Constructor.prototype` faqat nusxa yaratishda kerak va u `Constructor.[[Prototype]]` bilan bog'liq emas.

### Nega prototipga

MDN misoli: har "quti" obyektiga bir xil `getValue` funksiyasini yozish ortiqcha — har nusxada o'z funksiyasi. Metodni prototipga qo'yilsa, barcha nusxalar **bitta** funksiyani ishlatadi va xotira tejaladi.

### `constructor` xossasi (MDN)

- Standart `F.prototype` — bitta xossali obyekt: `constructor`, u `F` ning o'ziga ishora qiladi.
- Shuning uchun har nusxada (prototip orqali) `nusxa.constructor === F`. Bu nusxaning o'z xossasi emas.
- Prototipsiz (`Object.create(null)`) obyektlardan tashqari har obyektda `constructor` bor.

### `F.prototype` ni almashtirish — yomon fikr (MDN)

`F.prototype` ni **o'zgartirish** (metod qo'shish) barcha nusxalarga ta'sir qiladi — ular o'sha obyektga havola qilgan. Lekin uni **butunlay almashtirish** (`F.prototype = {...}`) ikki sababga ko'ra yomon:

1. Almashtirishdan oldingi va keyingi nusxalar **turli** prototiplarga ishora qiladi — birini o'zgartirish ikkinchisiga ta'sir qilmaydi.
2. `constructor` qo'lda qayta qo'yilmasa, `nusxa.constructor` endi `F` emas. Ba'zi o'rnatilgan amallar ham `constructor` ni o'qiydi va noto'g'ri ishlashi mumkin.

## Kod: konstruktor va prototip

MDN'dagi `Box`:

```js
function Box(value) { this.value = value; }               // MDN misoli: konstruktor funksiya
Box.prototype.getValue = function () { return this.value; };
const a = new Box(1), b = new Box(2);
console.log(a.getValue(), b.getValue(), a.getValue === b.getValue);   // bitta umumiy funksiya
console.log(Object.getPrototypeOf(a) === Box.prototype, Object.hasOwn(a, 'getValue'));
console.log('standart prototype:', Object.getOwnPropertyNames(Box.prototype), Box.prototype.constructor === Box);
console.log('a.constructor:', a.constructor === Box, Object.hasOwn(a, 'constructor'));
console.log('Box ning o\'z [[Prototype]]i:', Object.getPrototypeOf(Box) === Function.prototype);
const c = new a.constructor(3);                            // constructor orqali "o'xshash" obyekt
console.log(c.getValue(), c instanceof Box);
```

```text
$ node asos.mjs
1 2 true
true false
standart prototype: [ 'constructor', 'getValue' ] true
a.constructor: true false
Box ning o'z [[Prototype]]i: true
3 true
```

- `a.getValue === b.getValue` — bitta funksiya, nusxalarda o'z nusxasi yo'q.
- `Box.prototype` da `constructor` va `getValue`. `a.constructor` prototip orqali keladi (o'z xossasi emas).
- `Box` ning o'z prototipi — `Function.prototype`.
- `new a.constructor(3)` — nusxa orqali uning konstruktorini topib, yangisini yaratish.

## Kod: o'zgartirish va almashtirish

```js
function Box(value) { this.value = value; }
Box.prototype.getValue = function () { return this.value; };
const eski = new Box(1);
Box.prototype.getValue = function () { return this.value + 1; };   // o'zgartirish — barcha nusxalarga ta'sir
console.log('o\'zgartirishdan keyin eski:', eski.getValue());

Box.prototype = { getValue() { return 'yangi prototip'; } };       // almashtirish — faqat yangi nusxalarga
const yangi = new Box(5);
console.log('eski:', eski.getValue(), '| yangi:', yangi.getValue());
console.log('yangi.constructor === Box:', yangi.constructor === Box, '| aslida:', yangi.constructor.name);
console.log('eski instanceof Box:', eski instanceof Box);         // eski — boshqa prototipda
```

```text
$ node almashtirish.mjs
o'zgartirishdan keyin eski: 2
eski: 2 | yangi: yangi prototip
yangi.constructor === Box: false | aslida: Object
eski instanceof Box: false
```

- `Box.prototype.getValue` ni **o'zgartirish** eski nusxaga ham ta'sir qildi (2).
- `Box.prototype` ni **almashtirish** dan keyin: eski nusxa eski prototipda qoldi, yangisi — yangida.
- Yangi prototipda `constructor` yo'q — `yangi.constructor` zanjir bo'ylab `Object` ni topdi.
- `instanceof` (keyingi qismlarda) `Box.prototype` ning **joriy** qiymatini tekshiradi — eski nusxa endi `Box` nusxasi emas.

Konstruktor obyekt qaytarsa nima bo'lishi — 20-bobda.

## Nega shunday

Klasslardan oldin JavaScript'da "sinf" vazifasini konstruktor funksiya va uning `prototype` xossasi bajargan. MDN: klasslar konstruktor funksiyalar ustidagi **sintaktik qulaylik** — `class` metodlari ham `Klass.prototype` ga yoziladi. Shuning uchun bu mexanizmni bilish klasslarni (59-bob) tushunishning asosi.

## Muhandislik nuqtai nazari

### Metodlarni prototipga, ma'lumotni nusxaga

Ma'lumot (`this.value`) — har nusxada o'zi. Metodlar — prototipda bitta. Konstruktor ichida metod yaratish (`this.f = function...`) har nusxaga yangi funksiya beradi (43-bob, MDN *Closures*).

### `prototype` ni almashtirmang, kengaytiring

Yangi metod kerak bo'lsa — `F.prototype.yangi = ...`. Butun obyektni almashtirish shart bo'lsa, `constructor` ni qaytaring (`enumerable: false` bilan — 52-bob).

### Yangi kodda — `class`

Konstruktor funksiya va `prototype` ni qo'lda yozish o'rniga `class` — xuddi shu natija, kamroq xato bilan.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `F.prototype` ni yangi obyekt bilan almashtirish | `constructor` yo'qoladi, eski va yangi nusxalar ajraladi (MDN) | Mavjud prototipga metod qo'shish |
| `nusxa.prototype` ga murojaat | `undefined` — `prototype` funksiyada bo'ladi | `Object.getPrototypeOf(nusxa)` |
| Metodlarni konstruktor ichida yaratish | Har nusxaga alohida funksiya | `F.prototype` yoki klass metodi |
| `constructor` ni qo'lda o'zgartirish | MDN: kutilmagan oqibatlar; ko'p hollarda `constructor` ishlatilmaydi | Unga tayanmaslik |
| `Object.getPrototypeOf(F)` ni `F.prototype` deb o'ylash | Bu `Function.prototype` | Ikkalasini farqlash |

## Amaliyot

1. `Talaba(ism, kurs)` konstruktorini yozing, `tanishtir` metodini prototipga qo'ying va 1000 nusxada funksiya bitta ekanini tekshiring.
2. `Talaba.prototype` ni almashtirib, `constructor` ni `Object.defineProperty` bilan to'g'ri (sanalmaydigan) qilib qaytaring.
3. Ikki nusxa yarating, prototipga keyin metod qo'shing — ikkalasida ishlaydimi?
4. `Box` ni `class` bilan qayta yozing va `Object.getOwnPropertyNames(Box.prototype)` natijasini solishtiring.
5. `[].constructor`, `({}).constructor`, `(5).constructor`, `Object.create(null).constructor` ni tekshiring.

## Rasmiy hujjat

- MDN — *Inheritance and the prototype chain* (Constructors): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain#constructors>
- MDN — `Object.prototype.constructor`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/constructor>
- MDN — `Function: prototype`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/prototype>
