# 22 — Symbol

[← Oldingi: Optional chaining](21-optional-chaining.md) · [Mundarija](README.md) · [Keyingi: Obyektdan primitivga →](23-obyektdan-primitivga.md)

## Tushuncha

**Symbol** — MDN (glossary): **noyob va qalbakilashtirib bo'lmaydigan** (unique, unforgeable) identifikatorni ifodalaydigan ma'lumot turi. JavaScript'da `symbol` — yettita primitiv turdan biri (6-bob).

Obyekt xossasining kaliti faqat ikki xil bo'lishi mumkin: **satr** yoki **symbol**. Satr kalitlari bir-biri bilan to'qnashishi mumkin. Masalan, ikki kutubxona bitta obyektga `id` yozsa, biri ikkinchisini o'chiradi. MDN: symbol kalitlar esa **hech qachon tasodifan** boshqa xossalar bilan to'qnashmaydi.

Symbol'larning uch toifasi bor (MDN):

| Toifa | Qanday olinadi | Noyobmi |
| --- | --- | --- |
| Oddiy | `Symbol('tavsif')` | Ha — har chaqiruv yangi symbol |
| Ro'yxatga olingan (registered) | `Symbol.for('kalit')` | Yo'q — bir kalitga bitta symbol |
| Mashhur (well-known) | `Symbol.iterator` va boshqalar | Ha — til belgilagan qat'iy to'plam |

## Kod: symbol yaratish

```js
const a = Symbol('id');
const b = Symbol('id');
console.log(typeof a, a === b, a.description, a.toString());
try { new Symbol(); } catch (e) { console.log(e.name + ': ' + e.message); }
try { `${a}`; } catch (e) { console.log(e.name + ': ' + e.message); }
try { a + ''; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log(String(a), typeof Object(a));
```

```text
$ node yaratish.mjs
symbol false id Symbol(id)
TypeError: Symbol is not a constructor
TypeError: Cannot convert a Symbol value to a string
TypeError: Cannot convert a Symbol value to a string
Symbol(id) object
```

- `Symbol('id')` dagi satr — faqat **tavsif** (description): nosozliklarni tuzatishda ko'rinadi, `a.description` bilan o'qiladi. MDN: `Symbol('foo')` satrni symbolga aylantirmaydi — har safar **yangi** symbol yaratadi, shuning uchun `a === b` — `false`.
- `new Symbol()` — MDN: `TypeError`. Bu `new Number` kabi o'rov obyektni tasodifan yaratishning oldini oladi. O'rov obyekt kerak bo'lsa — `Object(sym)` (amalda deyarli kerak bo'lmaydi).
- **Satrga yashirin aylantirish** — MDN (*String coercion*): symbol'lar `TypeError` beradi. Template literal ham, `+ ''` ham ishlamaydi. Aniq aylantirish uchun `String(sym)` yoki `sym.toString()` ishlatiladi — ular `"Symbol(id)"` qaytaradi. Bu tasodifiy aylantirishdan himoya: symbol kalitni bilmasdan satr kalitga aylantirib yuborish xatoga olib kelardi.

## Kod: symbol — xossa kaliti

```js
const id = Symbol('id');
const user = { ism: 'Ali', [id]: 101 };
user.yosh = 25;
console.log(user[id], user);
for (const k in user) console.log('for...in:', k);
console.log(Object.keys(user), Object.getOwnPropertyNames(user));
console.log(Object.getOwnPropertySymbols(user), Reflect.ownKeys(user));
console.log(JSON.stringify(user));
const nusxa = { ...user };
const nusxa2 = Object.assign({}, user);
console.log(nusxa[id], nusxa2[id]);
const begona = { id: 'tashqi kod' };
begona[id] = 'bizniki';
console.log(begona.id, begona[id]);
```

```text
$ node kalit.mjs
101 { ism: 'Ali', yosh: 25, Symbol(id): 101 }
for...in: ism
for...in: yosh
[ 'ism', 'yosh' ] [ 'ism', 'yosh' ]
[ Symbol(id) ] [ 'ism', 'yosh', Symbol(id) ]
{"ism":"Ali","yosh":25}
101 101
tashqi kod bizniki
```

- Literalda symbol kalit **kvadrat qavsda** yoziladi: `[id]: 101` (hisoblanadigan kalit, 16-bob). `{ id: 101 }` yozilsa, kalit `'id'` satri bo'lardi.
- MDN: `for...in` symbol kalitlarni **ko'rmaydi**, `Object.getOwnPropertyNames()` ham qaytarmaydi. Ular uchun alohida `Object.getOwnPropertySymbols()` bor. `Reflect.ownKeys()` esa ikkalasini birga beradi.
- MDN: `JSON.stringify()` symbol kalitli xossalarni **butunlay** e'tiborsiz qoldiradi.
- Spread va `Object.assign` symbol xossalarni **nusxalaydi**. MDN (`Object.assign`): satr va symbol xossalarning ikkalasi ham ko'chiriladi.
- Oxirgi qator — symbol'ning asosiy foydasi: `begona` obyektdagi `id` satr kaliti va bizning `[id]` symbol kalitimiz bir-biriga **tegmaydi**.

### "Yashirin", lekin maxfiy emas

MDN (glossary): symbol bilan bog'langan qiymatni faqat **asl symbol**ga havolasi borlar o'qiy oladi. Lekin `Object.getOwnPropertySymbols()` istalgan obyektning symbol kalitlarini qaytaradi. Demak symbol xossalar **tasodifiy** kirishdan himoyalangan, **ataylab** kirishdan emas. Haqiqiy maxfiylik uchun klasslarning `#private` maydonlari bor (62-bob).

## Kod: global registr — `Symbol.for`

```js
const a = Symbol.for('ilova.id');
const b = Symbol.for('ilova.id');
console.log(a === b, Symbol.keyFor(a), Symbol.keyFor(Symbol('x')));
console.log(Symbol.for('x') === Symbol('x'));
const w = new WeakMap();
w.set(Symbol('x'), 1); w.set(Symbol.iterator, 2);
try { w.set(Symbol.for('x'), 3); } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node registr.mjs
true ilova.id undefined
false
TypeError: Invalid value used as weak map key
```

- MDN: `Symbol.for(kalit)` **global symbol registridan** shu kalitli symbolni qaytaradi; yo'q bo'lsa yaratib, registrga yozadi. Shuning uchun bir xil kalit bilan ikki chaqiruv **bitta** symbol beradi — hatto turli fayllar va turli **realm**'lar orasida ham. (Realm — o'z global obyekti va o'rnatilgan obyektlari bo'lgan alohida muhit, masalan, brauzerdagi `iframe`.)
- `Symbol.keyFor(sym)` — teskari amal: registrdagi symbolning kalitini qaytaradi. Oddiy symbol uchun — `undefined`.
- MDN: registr — **xayoliy** tushuncha. Dvigatelda bunday ichki tuzilma bo'lmasligi ham mumkin, va unga faqat `for()`/`keyFor()` orqali murojaat qilinadi.
- MDN: ro'yxatga olingan symbol'larni istalgan joyda qayta yaratish mumkin. Shuning uchun ular deyarli o'zi o'ragan **satr kabi** ishlaydi: noyob emas va GC tomonidan yig'ilmaydi. Shu sabab ular `WeakMap`, `WeakSet`, `WeakRef` va `FinalizationRegistry` da taqiqlangan (18-bob). Oddiy va mashhur symbol'lar ruxsat etilgan.

## Kod: mashhur symbol'lar — tilning "protokollari"

MDN: `Symbol` konstruktorining statik xossalari ham symbol'lar. Ular **mashhur symbol'lar** (well-known symbols) deyiladi. Vazifasi — o'rnatilgan amallar uchun **protokol** bo'lish va tilning xatti-harakatini o'zgartirishga imkon berish.

```js
const oraliq = {
  dan: 1, gacha: 4,
  *[Symbol.iterator]() { for (let i = this.dan; i <= this.gacha; i++) yield i; },
  get [Symbol.toStringTag]() { return 'Oraliq'; },
};
console.log([...oraliq], String(oraliq), Object.prototype.toString.call([]));
class Juft {
  static [Symbol.hasInstance](x) { return Number.isInteger(x) && x % 2 === 0; }
}
console.log(4 instanceof Juft, 3 instanceof Juft);
console.log(typeof Symbol.iterator, Symbol.iterator.description, Symbol.keyFor(Symbol.iterator));
```

```text
$ node mashhur.mjs
[ 1, 2, 3, 4 ] [object Oraliq] [object Array]
true false
symbol Symbol.iterator undefined
```

- `[Symbol.iterator]` — obyektni **iterable** qiladi: spread, `for...of` uni ishlatadi (32-bob). `*` — generator metod (80-bob).
- `[Symbol.toStringTag]` — `Object.prototype.toString` chiqaradigan `[object ...]` dagi nomni belgilaydi.
- `[Symbol.hasInstance]` — MDN misoli: `instanceof` xatti-harakatini belgilaydi (64-bob).
- Mashhur symbol registrda **yo'q** — `Symbol.keyFor` `undefined` qaytaradi.

MDN ro'yxatidagi mashhur symbol'lar:

| Symbol | Qaysi amal uchun | Bob |
| --- | --- | --- |
| `Symbol.iterator`, `Symbol.asyncIterator` | `for...of`, `for await...of` | 32, 81 |
| `Symbol.toPrimitive` | Obyektni primitivga aylantirish | 23 |
| `Symbol.toStringTag` | `Object.prototype.toString` | — |
| `Symbol.hasInstance` | `instanceof` | 64 |
| `Symbol.species` | Hosila obyekt yaratishda konstruktor | — |
| `Symbol.isConcatSpreadable` | `Array.prototype.concat` | — |
| `Symbol.unscopables` | `with` | — |
| `Symbol.match`, `matchAll`, `replace`, `search`, `split` | Satr metodlari va RegExp | — |
| `Symbol.dispose`, `Symbol.asyncDispose` | `using` (ES2027 da yakunlangan) | 89 |

MDN eslatmasi: spetsifikatsiya ilgari bularni `@@iterator` kabi yozardi. Hozir bu belgi ishlatilmaydi, lekin eski hujjatlarda uchrab qoladi.

## Nega shunday

MDN tarixni tushuntiradi: mashhur symbol'lardan oldin til o'rnatilgan amallar uchun **oddiy nomli** xossalardan foydalangan. Masalan, `JSON.stringify` obyektning `toJSON()` metodini, `String()` esa `toString()` va `valueOf()` ni chaqiradi. Lekin tilga yangi amallar qo'shilgan sari har biriga yangi "sehrli" satr nom berish **orqaga moslikni buzishi** mumkin edi. Mavjud kodda shu nomli xossa allaqachon bor bo'lishi mumkin.

Symbol bu muammoni hal qiladi: yangi protokol kaliti noyob, hech bir mavjud satr kalit bilan to'qnashmaydi. Masalan, `Symbol.iterator` va `Symbol.dispose` protokollari shu yo'l bilan qo'shilgan.

## Muhandislik nuqtai nazari

### Qachon symbol kalit

- **Begona obyektga metama'lumot** qo'shish (kutubxona foydalanuvchi obyektini belgilashi kerak): symbol to'qnashuvni yo'q qiladi, `for...in` va JSON'ga chiqmaydi.
- **Protokol** joriy qilish — o'z obyektingizni iterable qilish, `using` bilan ishlaydigan qilish: mashhur symbol'lar.
- **Ichki holat** — yangi kodda symbol emas, `#private` maydonlar (62-bob). Symbol "yashirin", lekin maxfiy emas.

### `Symbol.for` ehtiyotkorlik bilan

Registr — butun ilova uchun **bitta** global nomlar fazosi. Ya'ni satr to'qnashuvi muammosi qaytadi. Kalitga ilova yoki paket nomini prefiks qiling (`'mening-paketim.id'`). Registrdan faqat symbol turli realm'lar yoki paket nusxalari orasida **bir xil** bo'lishi shart bo'lganda foydalaning.

### Symbol'ni log qilish

Symbol'ni satrga qo'shib log qilish `TypeError` beradi. Log va xabarlarda `String(sym)` yoki `sym.description` ishlating.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `{ id: 1 }` symbol kalit deb o'ylash | Kalit — `'id'` satri | `{ [id]: 1 }` |
| `obj.id` bilan symbol xossani o'qish | `undefined` | `obj[id]` |
| `` `${sym}` `` yoki `sym + ''` | `TypeError: Cannot convert a Symbol value to a string` | `String(sym)`, `sym.description` |
| `new Symbol()` | `TypeError: Symbol is not a constructor` | `Symbol()` |
| Symbol xossani maxfiy deb hisoblash | `getOwnPropertySymbols` ochib beradi | `#private` maydon |
| Symbol xossa JSON'ga chiqadi deb kutish | `JSON.stringify` tashlab yuboradi | Kerak bo'lsa `toJSON` |
| `Symbol.for` ni WeakMap kaliti qilish | `TypeError: Invalid value used as weak map key` | Oddiy `Symbol()` |

## Amaliyot

1. `const s = Symbol('test')` — `s.description`, `s.toString()`, `String(s)` va `` `${s}` `` ni sinang. Qaysi biri xato beradi va nega?
2. Obyektga ikki satr va bitta symbol xossa qo'shing. `Object.keys`, `Object.entries`, `Reflect.ownKeys`, `JSON.stringify`, `structuredClone` (17-bob) natijalarini taqqoslang.
3. `Symbol.for('a') === Symbol.for('a')` va `Symbol('a') === Symbol('a')` — natijalar? `Symbol.keyFor` bilan tekshiring.
4. `oraliq` obyektiga `qadam` xossasini qo'shing (`dan: 0, gacha: 10, qadam: 3`) va `[Symbol.iterator]` ni moslang.
5. Klassga `get [Symbol.toStringTag]()` qo'shing va `String(new Klass())` natijasini kuzating.

## Rasmiy hujjat

- MDN — `Symbol`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol>
- MDN — *Symbol* (glossary): <https://developer.mozilla.org/en-US/docs/Glossary/Symbol>
- MDN — `Symbol.for()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/for>
- MDN — `Object.getOwnPropertySymbols()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertySymbols>
- MDN — `String` ("String coercion"): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String#string_coercion>
- ECMA-262 — *Symbol Objects*: <https://tc39.es/ecma262/2026/#sec-symbol-objects>
- ECMA-262 — *Well-Known Symbols*: <https://tc39.es/ecma262/2026/#sec-well-known-symbols>
