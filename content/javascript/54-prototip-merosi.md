# 54 — Prototip merosi

[← Oldingi: Getter va setter](53-getter-setter.md) · [Mundarija](README.md) · [Keyingi: `F.prototype` →](55-f-prototype.md)

## Tushuncha

MDN (*Inheritance and the prototype chain*): JavaScript obyektlari — xossalarning dinamik "xaltasi" (**o'z xossalari**). Har obyektda yana bir **prototip obyektga havola** bor. Xossa o'qilganda u faqat obyektning o'zida emas, keyin uning prototipida, prototipning prototipida… izlanadi. Izlash mos nomli xossa topilguncha yoki **zanjir oxirigacha** (`null`) davom etadi. Bu — **prototip zanjiri**.

```text
uzun ──► quyon ──► hayvon ──► Object.prototype ──► null
```

### `[[Prototype]]` va unga murojaat

ECMAScript standartida obyekt prototipi `obj.[[Prototype]]` deb belgilanadi — bu ichki slot. MDN:

| Usul | Holati |
| --- | --- |
| `Object.getPrototypeOf(obj)` / `Object.setPrototypeOf(obj, p)` | Tavsiya etiladi |
| Literalda `{ a: 1, __proto__: p }` | **Standart** va eskirmagan; obyekt yaratilganda prototip beradi |
| `obj.__proto__` (accessor) | **Eskirgan** (deprecated): faqat veb moslik uchun standartlashtirilgan, xavfsizlik muammolari bor |
| `Object.create(p)` | Berilgan prototipli yangi obyekt; `Object.create(null)` — prototipsiz |

Uni funksiyalarning `prototype` **xossasi** bilan adashtirmang — u boshqa narsa (55-bob).

MDN: prototipni iloji boricha **yaratish paytida** bering. `Object.setPrototypeOf` bilan mavjud obyektning prototipini o'zgartirish dvigatel optimizatsiyalarini buzadi.

### O'qish, yozish va `this` (MDN)

| Amal | Nima bo'ladi |
| --- | --- |
| **O'qish** | O'zida yo'q bo'lsa — zanjir bo'ylab izlanadi |
| **Yozish** `obj.x = 1` | Obyektning **o'z** xossasi yaratiladi, prototip o'zgarmaydi. Prototipdagi xossa "to'siladi" (shadowing). Istisno — prototipdagi **setter** (53-bob): u chaqiriladi |
| **`delete`** | Faqat o'z xossasini o'chiradi |
| **Meros metodida `this`** | Metod chaqirilgan **obyekt**, metod turgan prototip emas |

JavaScript'da sinflardagi kabi alohida "metod" yo'q: metod — funksiya qiymatli xossa, u boshqa xossalar kabi meros qilinadi va to'siladi.

### `for...in` va meros (MDN)

`for...in` obyektning o'zining **va meros qilingan** sanaladigan satr kalitlarini aylanadi. `Object.keys` — faqat o'zini. `in` operatori zanjirni ham ko'radi, `Object.hasOwn` — faqat o'zini. `Object.prototype` metodlari (`toString` …) sanalmaydi, shuning uchun `for...in` da chiqmaydi.

## Kod: zanjir bo'ylab izlash

```js
const hayvon = { yeydi: true, yur() { return `${this.nom} yuryapti`; } };
const quyon = { nom: 'Quyon', sakraydi: true, __proto__: hayvon };    // literaldagi __proto__ — standart
console.log(quyon.yeydi, quyon.sakraydi, quyon.yur());                 // yeydi — prototipdan
console.log(Object.getPrototypeOf(quyon) === hayvon, Object.getPrototypeOf(hayvon) === Object.prototype, Object.getPrototypeOf(Object.prototype));
console.log(quyon.yoq);                                               // butun zanjir ko'rildi — topilmadi
const uzun = { nom: 'Uzunquloq', __proto__: quyon };                  // zanjir: uzun → quyon → hayvon → Object.prototype → null
console.log(uzun.yur(), uzun.yeydi);
```

```text
$ node zanjir.mjs
true true Quyon yuryapti
true true null
undefined
Uzunquloq yuryapti true
```

- `quyon.yeydi` — o'zida yo'q, `hayvon` dan topildi. `yur()` ham prototipdan, lekin `this.nom` — `quyon` niki.
- `hayvon` ning prototipi — `Object.prototype`, uniki — `null`: zanjir oxiri.
- Mavjud bo'lmagan xossa uchun butun zanjir ko'rib chiqildi — `undefined`.
- Uch qavatli zanjir ham xuddi shunday ishladi.

## Kod: yozish va to'sish

```js
const parent = { value: 2, method() { return this.value + 1; } };    // MDN misoli
const child = { __proto__: parent };
console.log(child.method());                      // this = child, value — prototipdan
child.value = 4;                                  // yozish — child'ning o'z xossasi (prototip o'zgarmaydi)
console.log(child.method(), parent.value, Object.hasOwn(child, 'value'));
delete child.value;
console.log(child.value);                         // yana prototipdagisi ko'rinadi

const asos = { set ism(v) { this._ism = v.toUpperCase(); } };      // setter prototipda
const obj = { __proto__: asos };
obj.ism = 'ali';                                  // prototipdagi setter chaqirildi, yangi xossa yaratilmadi
console.log(obj._ism, Object.hasOwn(obj, 'ism'), Object.hasOwn(obj, '_ism'));
```

```text
$ node yozish.mjs
3
5 2 true
2
ALI false true
```

- MDN misoli: `child.method()` — `this` `child`, `value` prototipdan (2 + 1 = 3).
- `child.value = 4` — `child` ning o'z xossasi bo'ldi, `parent.value` 2 qoldi. Metod endi 5 qaytardi.
- `delete child.value` dan keyin prototipdagi 2 yana ko'rindi.
- Prototipdagi **setter** chaqirildi: `obj` da `ism` xossasi yaratilmadi, setter `_ism` ni yozdi.

## Kod: `for...in`, `in`, `hasOwn`

```js
const hayvon = { yeydi: true };
const quyon = { sakraydi: true, __proto__: hayvon };
const hammasi = [], ozi = [];
for (const k in quyon) { hammasi.push(k); if (Object.hasOwn(quyon, k)) ozi.push(k); }
console.log('for...in:', hammasi, '| o\'zi:', ozi, '| Object.keys:', Object.keys(quyon));
console.log('in:', 'yeydi' in quyon, '| hasOwn:', Object.hasOwn(quyon, 'yeydi'));
const bosh = Object.create(null);                 // prototipsiz obyekt
bosh.kalit = 1;
console.log(Object.getPrototypeOf(bosh), typeof bosh.toString, 'hasOwn:', Object.hasOwn(bosh, 'kalit'));
```

```text
$ node forin.mjs
for...in: [ 'sakraydi', 'yeydi' ] | o'zi: [ 'sakraydi' ] | Object.keys: [ 'sakraydi' ]
in: true | hasOwn: false
null undefined hasOwn: true
```

- `for...in` meros qilingan `yeydi` ni ham berdi. `Object.hasOwn` bilan faqat o'zinikini ajratish mumkin.
- `Object.create(null)` — prototipsiz obyekt: `toString` ham yo'q. Bunday obyekt kalit–qiymat lug'ati uchun xavfsiz: meros kalitlar bilan to'qnashmaydi.

## Nega shunday

Har obyektga barcha metodlarni nusxalash o'rniga ular bitta umumiy obyektda — prototipda — saqlanadi, nusxalar esa unga havola qiladi. Xotira tejaladi, umumiy xatti-harakatni bir joyda o'zgartirish mumkin. Yozishning o'z xossasini yaratishi esa bitta obyektdagi o'zgarish boshqa obyektlarga "oqib" o'tmasligini ta'minlaydi.

## Muhandislik nuqtai nazari

### `__proto__` emas, `Object.getPrototypeOf`/`Object.create`

`obj.__proto__` eskirgan va har obyektda mavjud bo'lishi ham shart emas (masalan, `Object.create(null)` da). Literalda `__proto__:` kaliti esa standart.

### Uzun zanjir va yo'q xossalar

MDN: zanjirning yuqorisidagi xossalarni izlash tezlik muhim joylarda sezilarli bo'lishi mumkin. Yo'q xossaga murojaat esa doim butun zanjirni aylanadi.

### Lug'at uchun `Object.create(null)` yoki `Map`

Tashqi kalitlarni (foydalanuvchi kiritgan nomlar) oddiy obyektda saqlash `toString`, `__proto__` kabi meros nomlar bilan to'qnashishi mumkin. Prototipsiz obyekt yoki `Map` (33-bob) xavfsizroq.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `for...in` ni o'z xossalari uchun ishlatish | Meros xossalar ham chiqadi | `Object.keys` yoki `Object.hasOwn` filtri |
| `'x' in obj` ni o'z xossasi tekshiruvi deb o'ylash | Zanjir ham tekshiriladi | `Object.hasOwn(obj, 'x')` |
| Nusxada prototip xossasini o'zgartirdim deb o'ylash | Faqat nusxada to'suvchi xossa yaratiladi | Prototipni aniq o'zgartirish |
| `obj.__proto__ = p` | Eskirgan, sekin | Yaratishda `Object.create(p)` |
| Prototipni keyinroq `setPrototypeOf` bilan almashtirish | Optimizatsiyalar buziladi (MDN) | Yaratish paytida berish |

## Amaliyot

1. Uch qavatli zanjir yarating va har qavatda bir xil nomli xossa qo'ying. Qaysi biri o'qilishini tekshiring.
2. Prototipdagi metodni nusxada qayta yozing (override) va asl metodni `Object.getPrototypeOf(this).metod.call(this)` bilan chaqiring.
3. `Object.create(null)` va `{}` da `'toString' in obj` ni solishtiring.
4. Prototipdagi massiv xossasiga `nusxa.royxat.push(...)` qiling. Boshqa nusxalarda nima bo'ladi va nega?
5. `for...in` bilan `Array` nusxasini aylaning va unga `Array.prototype` ga sanaladigan xossa qo'shilsa nima bo'lishini ko'ring (keyin uni o'chiring).

## Rasmiy hujjat

- MDN — *Inheritance and the prototype chain*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain>
- MDN — `Object.prototype.__proto__` (Deprecated): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto>
- MDN — `Object.getPrototypeOf()`, `Object.setPrototypeOf()`, `Object.create()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object>
- MDN — `for...in`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in>
