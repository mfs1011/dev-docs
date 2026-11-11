# 57 — Prototip metodlari

[← Oldingi: Native prototiplar](56-native-prototiplar.md) · [Mundarija](README.md) · [Keyingi: Sanaluvchanlik va egalik →](58-sanaluvchanlik.md)

## Tushuncha

Prototip bilan ishlashning zamonaviy vositalari — `Object` ning statik metodlari. Eskirgan `obj.__proto__` (54-bob) o'rniga ular ishlatiladi:

| Metod | Nima qiladi |
| --- | --- |
| `Object.create(proto, [descriptorlar])` | Berilgan prototip (va ixtiyoriy xossalar) bilan **yangi** obyekt |
| `Object.getPrototypeOf(obj)` | `obj` ning `[[Prototype]]` i |
| `Object.setPrototypeOf(obj, proto)` | **Mavjud** obyektning prototipini almashtiradi |

### `Object.create` (MDN)

- Ikkinchi argument — `Object.defineProperties` dagi kabi: kalit → **descriptor** (52-bob). Unda bayroqlar standart `false`.
- MDN: obyekt literali aslida `Object.create()` ning sintaktik qulayligi: `{}` ≈ `Object.create(Object.prototype)`.
- `Object.create(null)` yoki literalda `{ __proto__: null }` — **prototipsiz** ("toza") obyekt.
- Prototipni yaratish paytida berish dvigatelga obyektni yaxshiroq optimallashtirish imkonini beradi (MDN). Shuning uchun `Object.create` `setPrototypeOf` dan afzal.

### `Object.setPrototypeOf` (MDN)

Mavjud obyekt prototipini o'zgartiradi, `null` ham berish mumkin. MDN: iloji bo'lsa prototipni yaratish paytida bering — dinamik o'zgartirish dvigatel optimizatsiyalarini buzadi.

### Prototipsiz obyekt (MDN `Object` → *Null-prototype objects*)

Deyarli barcha obyektlar oxir-oqibat `Object.prototype` dan meros oladi. Prototipsiz obyektda esa `toString`, `valueOf`, `hasOwnProperty`, `constructor` yo'q:

- satrga aylantirish (`${obj}`) — `TypeError`;
- tuzatish (debug) va konvertatsiya funksiyalari kutilmagan xato berishi mumkin.

Lekin MDN: amalda bunday obyektlar **arzon lug'at** (Map o'rniga) sifatida ishlatiladi. Oddiy obyektda `'toString' in yosh` — `true`: `Object.prototype` xossalari foydalanuvchi kalitlari bilan to'qnashadi. Kalitlarni tekshirish uchun `Object.hasOwn` — u prototipsiz obyektda ham ishlaydi.

## Kod: `Object.create`

```js
const hayvon = { yur() { return `${this.nom} yuryapti`; } };
const quyon = Object.create(hayvon, {                          // prototip + descriptor'lar
  nom: { value: 'Quyon', enumerable: true },                    // qolgan bayroqlar — false
  tur: { value: 'sutemizuvchi' },
});
console.log(quyon.yur(), Object.getPrototypeOf(quyon) === hayvon);
console.log(Object.keys(quyon), Object.getOwnPropertyDescriptor(quyon, 'nom'));
try { quyon.nom = 'Boshqa'; } catch (e) { console.log(e.name + ': ' + e.message); }

const nusxa = Object.create(Object.getPrototypeOf(quyon), Object.getOwnPropertyDescriptors(quyon));   // to'liq sayoz nusxa
console.log(nusxa.yur(), Object.getOwnPropertyDescriptor(nusxa, 'nom').writable, { ...quyon });
```

```text
$ node create.mjs
Quyon yuryapti true
[ 'nom' ] {
  value: 'Quyon',
  writable: false,
  enumerable: true,
  configurable: false
}
TypeError: Cannot assign to read only property 'nom' of object '#<Object>'
Quyon yuryapti false { nom: 'Quyon' }
```

- Prototip va xossalar bitta chaqiruvda. `nom` — `enumerable: true`, qolgan bayroqlar `false` (52-bob); `tur` umuman sanalmaydi.
- Faqat o'qiladigan `nom` ga yozish — `TypeError` (strict).
- `Object.create(prototip, Object.getOwnPropertyDescriptors(obj))` — prototipi va **barcha** bayroqlari saqlangan sayoz nusxa. `{ ...quyon }` esa faqat sanaladigan xossani oddiy (yoziladigan) qilib ko'chirdi va prototipni yo'qotdi (42-bob).

## Kod: prototipsiz obyekt — lug'at

```js
const yosh = { ali: 18, vali: 27 };                            // MDN misoli: oddiy obyekt — lug'at
console.log('"toString" in:', 'toString' in yosh, '| yosh.toString:', typeof yosh.toString);
const toza = Object.create(null);                              // prototipsiz
toza.ali = 18; toza.toString = 'foydalanuvchi kaliti';         // istalgan kalit — to'qnashuvsiz
console.log('"hasOwnProperty" in:', 'hasOwnProperty' in toza, '| toza.toString:', toza.toString);
try { console.log(`${Object.create(null)}`); } catch (e) { console.log('satrga:', e.name + ': ' + e.message); }
console.log('Object.hasOwn ishlaydi:', Object.hasOwn(toza, 'ali'), '| literal:', Object.getPrototypeOf({ __proto__: null }));
```

```text
$ node toza.mjs
"toString" in: true | yosh.toString: function
"hasOwnProperty" in: false | toza.toString: foydalanuvchi kaliti
satrga: TypeError: Cannot convert object to primitive value
Object.hasOwn ishlaydi: true | literal: null
```

- MDN misoli: oddiy obyekt-lug'atda `toString` "bor" — kalit sifatida tekshirish xato natija beradi.
- Prototipsiz obyektda meros nomlar yo'q, `toString` ham oddiy kalit bo'ldi.
- Uni satrga aylantirib bo'lmaydi — MDN'dagi xato.
- `{ __proto__: null }` literali ham prototipsiz obyekt beradi.

## Kod: `setPrototypeOf`

```js
const a = { salom() { return 'a dan salom'; } }, b = { salom() { return 'b dan salom'; } };
const obj = Object.create(a);
console.log(obj.salom());
Object.setPrototypeOf(obj, b);                                 // MDN: ishlaydi, lekin optimizatsiyalarni buzadi
console.log(obj.salom(), Object.getPrototypeOf(obj) === b);
try { Object.setPrototypeOf(Object.preventExtensions({}), a); } catch (e) { console.log(e.name + ': ' + e.message); }
try { Object.setPrototypeOf(a, Object.create(a)); } catch (e) { console.log(e.name + ': ' + e.message); }   // halqa bo'lardi
```

```text
$ node setproto.mjs
a dan salom
b dan salom true
TypeError: #<Object> is not extensible
TypeError: Cyclic __proto__ value
```

- Prototip almashtirildi — metod endi `b` dan.
- Kengaytirib bo'lmaydigan obyektning (52-bob) prototipini o'zgartirib bo'lmaydi.
- Halqa hosil qiladigan prototip — `Cyclic __proto__ value`: zanjir `null` bilan tugashi shart.

## Nega shunday

Prototip — obyektning asosiy tuzilma xossasi, shuning uchun uni o'qish va o'rnatish uchun aniq API kerak: `getPrototypeOf`, `create`, `setPrototypeOf`. `__proto__` tarixan brauzerlarda paydo bo'lib, keyin faqat moslik uchun standartlashtirilgan (MDN). U har obyektda ham bo'lavermaydi (prototipsiz obyektda yo'q), kalit nomi sifatida ham xavfli.

## Muhandislik nuqtai nazari

### Tashqi kalitlar uchun `Map` yoki prototipsiz obyekt

Foydalanuvchi kiritgan nomlarni kalit qiladigan joyda oddiy obyekt `toString`, `constructor`, `__proto__` bilan to'qnashadi. `Map` (33-bob) yoki `Object.create(null)` + `Object.hasOwn` xavfsizroq.

### Prototipni bir marta, yaratishda

`Object.create(proto)`, klass yoki literaldagi `__proto__:` — prototip yaratishda beriladi. `setPrototypeOf` — faqat boshqa iloj bo'lmaganda.

### To'liq nusxa — descriptor'lar bilan

`{ ...obj }` getter'larni qiymatga aylantiradi, bayroqlar va prototipni tashlaydi. Obyektni aynan nusxalash kerak bo'lsa — `Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))`.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `Object.create(p, { x: { value: 1 } })` dan keyin `x` ni o'zgartirish | Faqat o'qiladi | Bayroqlarni aniq berish |
| Prototipsiz obyektni satrga aylantirish | `TypeError` (MDN) | Kerak bo'lsa `toString` qo'shish yoki `JSON.stringify` |
| Lug'at-obyektda `key in obj` | Meros nomlar ham `true` | `Object.hasOwn` yoki prototipsiz obyekt |
| `obj.__proto__ = p` | Eskirgan; prototipsiz obyektda ishlamaydi | `Object.setPrototypeOf` yoki yaratishda |
| Spread bilan "to'liq" nusxa | Prototip va bayroqlar yo'qoladi | `Object.create` + descriptor'lar |

## Amaliyot

1. `Object.create` bilan `hayvon` → `quyon` → `uzunquloq` zanjirini yarating va har bosqichda `getPrototypeOf` ni tekshiring.
2. Getter'li obyektni spread va `Object.create` + descriptor'lar bilan nusxalang. Getter qayerda saqlanib qoldi?
3. Prototipsiz obyekt asosida so'z sanovchi yozing va `'constructor'` so'zi bilan sinab ko'ring. Oddiy obyekt bilan solishtiring.
4. `Object.setPrototypeOf(obj, null)` dan keyin `obj` ni `console.log` va `String()` bilan chiqaring.
5. `Object.create(Array.prototype)` dan yasalgan obyekt haqiqiy massivmi? `Array.isArray` va `length` ni tekshiring.

## Rasmiy hujjat

- MDN — `Object.create()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create>
- MDN — `Object.setPrototypeOf()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf>
- MDN — `Object.getPrototypeOf()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf>
- MDN — `Object` (Null-prototype objects): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object#null-prototype_objects>
