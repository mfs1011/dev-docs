# 50 — `bind` va partial

[← Oldingi: Dekoratorlar va `call`/`apply`](49-dekoratorlar.md) · [Mundarija](README.md) · [Keyingi: Arrow funksiyalar chuqur →](51-arrow.md)

## Tushuncha

`call`/`apply` (49-bob) funksiyani **hozir** berilgan `this` bilan chaqiradi. `bind` esa funksiyani chaqirmaydi — u **yangi funksiya** qaytaradi: unda `this` va boshidagi argumentlar oldindan qotirilgan.

MDN: `bind()` yangi **bog'langan funksiya** (bound function) yaratadi. Uni chaqirish o'ralgan **maqsad funksiyani** (target function) bajaradi. `this` va birinchi argumentlar oldindan saqlanadi — chaqiruv paytida emas.

```js
const yangi = fn.bind(thisArg, arg1, arg2);
yangi(arg3);   // fn.call(thisArg, arg1, arg2, arg3) kabi
```

### Bog'langan funksiya xususiyatlari (MDN)

| | Qoida |
| --- | --- |
| Qayta `bind` | Yangi `thisArg` **e'tiborsiz** — maqsad allaqachon bog'langan. Argumentlar esa qo'shilib boradi |
| `call`/`apply` bilan | Bog'langan `this` o'zgarmaydi |
| `name` | `"bound " + maqsad nomi` |
| `length` | Maqsad `length` i minus bog'langan argumentlar soni (kamida 0) |
| `prototype` | Yo'q — shuning uchun `extends` uchun asos bo'la olmaydi |
| `new` bilan | Maqsad konstruktor bo'lsa — maqsad yaratiladi. Bog'langan `this` e'tiborsiz, argumentlar qo'shiladi |
| `instanceof` | O'ng tomonda bo'lsa, maqsad funksiyaning `prototype` i ishlatiladi |

### Qisman qo'llash (partial application)

**Qisman qo'llash** — ko'p argumentli funksiyaning bir qismini oldindan berib, qolganini kutadigan yangi funksiya yaratish. `bind(null, a)` buning eng oddiy yo'li (MDN *Partially applied functions*). Faqat `this` kerak bo'lmasa — `null`. `this` saqlanishi kerak bo'lsa, o'z yordamchi funksiyamiz kerak (pastda).

## Kod: `this` ni bog'lash

```js
const modul = {                                     // MDN misoli asosida
  x: 42,
  getX() { return this.x; },
};
const ajratilgan = modul.getX;
try { ajratilgan(); } catch (e) { console.log('ajratilgan:', e.name + ': ' + e.message); }
const bogliq = modul.getX.bind(modul);
console.log('bog\'langan:', bogliq());
setTimeout(() => console.log('taymerda:', bogliq()), 0);   // taymerga bog'langan funksiya (48-bob)

const qayta = bogliq.bind({ x: 1 });                // qayta bog'lash this'ni o'zgartirmaydi
console.log('qayta bind:', qayta(), '| call:', bogliq.call({ x: 2 }));
console.log('name:', bogliq.name, '| prototype:', bogliq.prototype);
```

```text
$ node bind.mjs
ajratilgan: TypeError: Cannot read properties of undefined (reading 'x')
bog'langan: 42
qayta bind: 42 | call: 42
name: bound getX | prototype: undefined
taymerda: 42
```

- Metod obyektdan ajratilganda `this` yo'qoldi (modul strict — `undefined`, 19-bob).
- `bind(modul)` dan keyin `this` doim `modul`: qayta `bind` ham, `call` ham uni o'zgartirmadi.
- Taymerga (48-bob) bog'langan funksiya berish — `this` yo'qolishining klassik yechimi.
- `name` — `bound getX`, `prototype` — yo'q.

## Kod: qisman qo'llash

```js
function kopaytir(a, b) { return a * b; }
const ikkiga = kopaytir.bind(null, 2);              // qisman qo'llash: birinchi argument qotirildi
console.log(ikkiga(5), ikkiga(10), 'length:', kopaytir.length, '→', ikkiga.length);

function log(...args) { return [this, ...args]; }   // MDN: ketma-ket bind — argumentlar qo'shiladi
const b1 = log.bind('birinchi this', 1, 2);
const b2 = b1.bind('yangi this', 3, 4);
console.log(b2(5, 6));

function qisman(fn, ...oldin) {                      // this'ni saqlaydigan qisman qo'llash
  return function (...keyin) { return fn.call(this, ...oldin, ...keyin); };
}
const narx = { valyuta: "so'm", formatla(soliq, summa) { return `${summa * (1 + soliq)} ${this.valyuta}`; } };
narx.qqs = qisman(narx.formatla, 0.12);
console.log(narx.qqs(1000));

const slice = Function.prototype.call.bind(Array.prototype.slice);   // MDN: metodni yordamchi funksiyaga
console.log(slice({ length: 3, 0: 'a', 1: 'b', 2: 'c' }, 1));
```

```text
$ node partial.mjs
10 20 length: 2 → 1
[ 'birinchi this', 1, 2, 3, 4, 5, 6 ]
1120 so'm
[ 'b', 'c' ]
```

- `ikkiga` — birinchi argumenti `2` ga qotirilgan `kopaytir`. `length` 2 dan 1 ga tushdi.
- Ketma-ket `bind` — MDN misoli: `this` birinchi bog'langanicha qoldi, argumentlar `1, 2, 3, 4, 5, 6` tartibida yig'ildi.
- `qisman` — `this` ni **saqlaydigan** qisman qo'llash: metod sifatida chaqirilganda `this.valyuta` ishladi. `bind` bunda yaramaydi — u `this` ni ham qotirib qo'yadi.
- `Function.prototype.call.bind(Array.prototype.slice)` — MDN: `this` talab qiladigan metodni oddiy yordamchi funksiyaga aylantirish.

## Kod: `new` va bog'langan konstruktor

```js
class Base {                                        // MDN misoli
  constructor(...args) { this.args = args; this.togri = new.target === Base; }
}
const BoundBase = Base.bind({ e: "e'tiborsiz" }, 1, 2);
const b = new BoundBase(3, 4);                      // bog'langan this e'tiborsiz, argumentlar qo'shiladi
console.log(b.args, b.togri, b instanceof Base, new Base() instanceof BoundBase);
try { class Hosila extends Base.bind(null) {} } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node konstruktor.mjs
[ 1, 2, 3, 4 ] true true true
TypeError: Class extends value does not have valid prototype property undefined
```

MDN misoli: `new BoundBase(3, 4)` — `Base` yaratildi (`new.target === Base`), argumentlar `[1, 2, 3, 4]`, bog'langan `this` e'tiborsiz. `instanceof` ikki tomonga ham ishladi. `prototype` yo'qligi sababli `extends` — `TypeError`.

## Nega shunday

`this` funksiya qanday **chaqirilganiga** qarab aniqlanadi (19-bob). Funksiya callback sifatida boshqa kodga berilganda (taymer, hodisa, massiv metodi) uni kim va qanday chaqirishini biz boshqarmaymiz. `bind` `this` ni yaratish paytida qotirib, shu muammoni yechadi. Argumentlarni qotirish esa funksiyalarni sozlangan variantlarga aylantirishga imkon beradi.

## Muhandislik nuqtai nazari

### `bind` yoki strelka

Callback'da `this` ni saqlashning ikki yo'li: `obj.metod.bind(obj)` yoki `() => obj.metod()`. Strelka o'qishga osonroq va argumentlarni aniq ko'rsatadi. `bind` esa bitta funksiyani ko'p joyga berish yoki uni keyinroq solishtirish kerak bo'lganda qulay.

### Hodisa obunasini bekor qilish

`removeEventListener` ishlovchini **aynan o'sha funksiya** bo'yicha topadi (MDN). Har `bind` esa **yangi** funksiya qaytaradi. Shuning uchun `addEventListener('click', this.f.bind(this))` dan keyin `removeEventListener('click', this.f.bind(this))` hech narsani o'chirmaydi. Bog'langan funksiyani bir marta yaratib, saqlang.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Metodni callback'ga to'g'ridan-to'g'ri berish | `this` yo'qoladi | `bind` yoki strelka |
| Bog'langan funksiyani qayta `bind` qilib `this` ni o'zgartirish | O'zgarmaydi (MDN) | Asl funksiyani bog'lash |
| `remove...Listener` ga yangi `bind` berish | Obuna o'chmaydi | Bog'langan funksiyani saqlab, o'shani berish |
| `this` kerak metodni `bind(null, ...)` bilan qisman qo'llash | `this` yo'qoladi | `this` ni uzatadigan yordamchi |
| Bog'langan klassdan `extends` | `TypeError` (MDN) | Asl klassdan meros |

## Amaliyot

1. `hisoblagich` obyektining `oshir` metodini `setInterval` ga `bind` bilan va strelka bilan bering. Natijalarni solishtiring.
2. `bind` ning soddalashtirilgan versiyasini yozing: `mening_bind(fn, thisArg, ...oldin)`. `name`, `length` va `new` bilan farqlarini aniqlang.
3. `formatla(valyuta, summa)` funksiyasidan qisman qo'llash bilan `somda` va `dollarda` funksiyalarini yasang.
4. Brauzerda tugmaga `bind` bilan bog'langan ishlovchini qo'shing va uni to'g'ri olib tashlang.
5. `Function.prototype.call.bind` usulida `Object.prototype.hasOwnProperty` dan `hasOwn(obj, kalit)` yordamchisini yasang va `Object.hasOwn` bilan solishtiring.

## Rasmiy hujjat

- MDN — `Function.prototype.bind()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind>
- MDN — `this`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>
- MDN — `EventTarget.removeEventListener()`: <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener>
