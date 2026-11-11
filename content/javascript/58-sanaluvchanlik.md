# 58 — Sanaluvchanlik va egalik

[← Oldingi: Prototip metodlari](57-prototip-metodlari.md) · [Mundarija](README.md) · [Keyingi: Klass sintaksisi →](59-klass-sintaksisi.md)

## Tushuncha

MDN (*Enumerability and ownership of properties*): obyektning har xossasi **uch belgi** bo'yicha tasniflanadi:

| Belgi | Qiymatlari | Qayerdan |
| --- | --- | --- |
| **Sanaluvchanlik** | sanaladigan (enumerable) / sanalmaydigan | `enumerable` bayrog'i (52-bob). Oddiy o'zlashtirish — `true`, `defineProperty` — standart `false` |
| **Kalit turi** | satr / symbol | Kalit (22-bob) |
| **Egalik** | o'z (own) / meros (inherited) | Obyektning o'zidami yoki prototip zanjiridami (54-bob) |

Bularning barchasiga nuqta yoki kvadrat qavs bilan murojaat qilish mumkin. Farq — xossalarni **birma-bir aylanish** va **tekshirish** usullarida: har usul bu 8 turning faqat ba'zilarini ko'radi. Bobning asosi — shu jadval.

## Kod: 8 xil xossa va 11 usul

Bitta obyektda (va uning prototipida) har turdan bittadan xossa yaratamiz va har usul qaysilarini ko'rishini tekshiramiz:

```js
// 8 xil xossa: sanaladigan/sanalmaydigan × o'z/meros × satr/symbol. Har usul qaysilarini ko'radi?
const sE = Symbol('sE'), sN = Symbol('sN'), iE = Symbol('iE'), iN = Symbol('iN');
const proto = {};
Object.defineProperties(proto, {
  merosE: { value: 1, enumerable: true }, merosN: { value: 1, enumerable: false },
  [iE]: { value: 1, enumerable: true }, [iN]: { value: 1, enumerable: false },
});
const obj = Object.create(proto);
Object.defineProperties(obj, {
  ozE: { value: 1, enumerable: true }, ozN: { value: 1, enumerable: false },
  [sE]: { value: 1, enumerable: true }, [sN]: { value: 1, enumerable: false },
});
const turlar = [['ozE', 'o\'z, sanaladi, satr'], ['ozN', 'o\'z, sanalmaydi, satr'], ['merosE', 'meros, sanaladi, satr'], ['merosN', 'meros, sanalmaydi, satr'],
  [sE, 'o\'z, sanaladi, symbol'], [sN, 'o\'z, sanalmaydi, symbol'], [iE, 'meros, sanaladi, symbol'], [iN, 'meros, sanalmaydi, symbol']];
const nom = (k) => typeof k === 'symbol' ? k.description : k;
const korgan = (royxat) => turlar.map(([k]) => royxat.includes(k) ? '✅' : '❌').join(' ');
const tekshir = (fn) => turlar.map(([k]) => fn(k) ? '✅' : '❌').join(' ');
const forIn = []; for (const k in obj) forIn.push(k);
const usullar = {
  'propertyIsEnumerable': tekshir(k => obj.propertyIsEnumerable(k)),
  'Object.hasOwn': tekshir(k => Object.hasOwn(obj, k)),
  'in': tekshir(k => k in obj),
  'Object.keys': korgan(Object.keys(obj)),
  'getOwnPropertyNames': korgan(Object.getOwnPropertyNames(obj)),
  'getOwnPropertySymbols': korgan(Object.getOwnPropertySymbols(obj)),
  'Reflect.ownKeys': korgan(Reflect.ownKeys(obj)),
  'for...in': korgan(forIn),
  'Object.assign': korgan(Reflect.ownKeys(Object.assign({}, obj))),
  'spread {...}': korgan(Reflect.ownKeys({ ...obj })),
  'JSON.stringify': korgan(Object.keys(JSON.parse(JSON.stringify(obj)))),
};
console.log('ustunlar:', turlar.map(([k]) => nom(k)).join(' '));
for (const [u, n] of Object.entries(usullar)) console.log(u.padEnd(22), n);
```

```text
$ node jadval.mjs
ustunlar: ozE ozN merosE merosN sE sN iE iN
propertyIsEnumerable   ✅ ❌ ❌ ❌ ✅ ❌ ❌ ❌
Object.hasOwn          ✅ ✅ ❌ ❌ ✅ ✅ ❌ ❌
in                     ✅ ✅ ✅ ✅ ✅ ✅ ✅ ✅
Object.keys            ✅ ❌ ❌ ❌ ❌ ❌ ❌ ❌
getOwnPropertyNames    ✅ ✅ ❌ ❌ ❌ ❌ ❌ ❌
getOwnPropertySymbols  ❌ ❌ ❌ ❌ ✅ ✅ ❌ ❌
Reflect.ownKeys        ✅ ✅ ❌ ❌ ✅ ✅ ❌ ❌
for...in               ✅ ❌ ✅ ❌ ❌ ❌ ❌ ❌
Object.assign          ✅ ❌ ❌ ❌ ✅ ❌ ❌ ❌
spread {...}           ✅ ❌ ❌ ❌ ✅ ❌ ❌ ❌
JSON.stringify         ✅ ❌ ❌ ❌ ❌ ❌ ❌ ❌
```

Ustunlar: `ozE`/`ozN` — o'z, sanaladigan/sanalmaydigan satr; `merosE`/`merosN` — meros satr; `sE`/`sN` — o'z symbol; `iE`/`iN` — meros symbol.

## Natija: jadval

Sinov natijasi MDN jadvallari bilan aynan mos keldi:

| Usul | O'z, sanaladi | O'z, sanalmaydi | Meros, sanaladi | Meros, sanalmaydi | Kalit turi |
| --- | --- | --- | --- | --- | --- |
| `obj.propertyIsEnumerable(k)` | ✅ | ❌ | ❌ | ❌ | ikkalasi |
| `Object.hasOwn(obj, k)` / `hasOwnProperty` | ✅ | ✅ | ❌ | ❌ | ikkalasi |
| `k in obj` | ✅ | ✅ | ✅ | ✅ | ikkalasi |
| `Object.keys` / `values` / `entries` | ✅ | ❌ | ❌ | ❌ | faqat satr |
| `Object.getOwnPropertyNames` | ✅ | ✅ | ❌ | ❌ | faqat satr |
| `Object.getOwnPropertySymbols` | ✅ | ✅ | ❌ | ❌ | faqat symbol |
| `Reflect.ownKeys` / `getOwnPropertyDescriptors` | ✅ | ✅ | ❌ | ❌ | ikkalasi |
| `for...in` | ✅ | ❌ | ✅ | ❌ | faqat satr |
| `Object.assign`, spread `{...obj}` | ✅ | ❌ | ❌ | ❌ | ikkalasi |
| `JSON.stringify` | ✅ | ❌ | ❌ | ❌ | faqat satr |

Qoidalarni eslab qolish uchun:

- **Meros** xossalarni faqat ikki usul ko'radi: `in` va `for...in`.
- **Sanalmaydigan** xossalarni "o'z kalitlarini olish" usullari ko'radi: `getOwnPropertyNames`, `getOwnPropertySymbols`, `Reflect.ownKeys`, `hasOwn`, `in`.
- **Symbol** kalitlarni satrga yo'naltirilgan usullar (`keys`, `for...in`, `JSON`) ko'rmaydi. Nusxalash usullari (`assign`, spread) esa ko'radi.
- **Hamma o'z kalitlari** — `Reflect.ownKeys`.

## Nega shunday

Har usul o'z vazifasi uchun yaratilgan. `Object.keys` va `JSON` — ma'lumot sifatidagi xossalar uchun: yashirin xizmat xossalari va symbol'lar bunga kirmaydi. `for...in` — eski, prototip merosini ham hisobga oladigan aylanish. `Reflect.ownKeys` — metadasturlash uchun to'liq ro'yxat. Sanalmaslik o'rnatilgan metodlarni (`Array.prototype.map`) har aylanishda chiqib qolishdan himoya qiladi (56-bob).

## Muhandislik nuqtai nazari

### Kerakli usulni jadvaldan tanlang

| Vazifa | Usul |
| --- | --- |
| Obyekt ma'lumotini aylanish | `Object.entries` |
| Xossa obyektning o'zida bormi | `Object.hasOwn` |
| Prototip orqali ham bormi (metod mavjudligi) | `in` |
| Obyektni to'liq tekshirish yoki nusxalash | `Reflect.ownKeys` + `getOwnPropertyDescriptors` |
| Tarmoqqa yuborish | `JSON.stringify` (faqat sanaladigan satr kalitlar) |

### `for...in` dan qoching

U meros xossalarni ham beradi (sinovda `merosE`). O'z xossalari uchun `Object.keys`/`entries` aniqroq.

### Yashirin xossa — xavfsizlik emas

Sanalmaydigan yoki symbol kalitli xossa `JSON` va `Object.keys` da ko'rinmaydi, lekin `Reflect.ownKeys` bilan topiladi va o'qiladi. Haqiqiy yopiqlik uchun `#private` (62-bob) yoki closure (43-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `for...in` bilan o'z xossalarini aylanish | Meros xossalar ham chiqadi | `Object.keys` / `entries` |
| `in` bilan o'z xossasini tekshirish | Meros ham `true` | `Object.hasOwn` |
| Symbol kalitlarni `Object.keys` da kutish | Chiqmaydi | `getOwnPropertySymbols` yoki `Reflect.ownKeys` |
| `JSON` bilan to'liq nusxa | Sanalmaydigan va symbol xossalar yo'qoladi | Descriptor'lar bilan nusxa (57-bob) |
| Sanalmaydigan xossani yashirin deb hisoblash | `Reflect.ownKeys` bilan topiladi | `#private` |

## Amaliyot

1. `jadval.mjs` ga `structuredClone`, `Object.values` va `Object.getOwnPropertyDescriptors` qatorlarini qo'shing va natijani MDN bilan solishtiring.
2. Massivda `for...in` va `Object.keys` ni chaqiring: `length` nega chiqmaydi?
3. `barchaKalitlar(obj)` funksiyasini yozing: o'z va meros, satr va symbol — barcha kalitlarni `null` gacha zanjir bo'ylab yig'sin.
4. Klass nusxasida `Object.keys` va `for...in` metodlarni ko'rsatadimi? Nega?
5. Bitta obyektga sanalmaydigan `id` va symbol kalitli `meta` qo'shib, uni `JSON.stringify`, spread va `Object.assign` bilan nusxalang.

## Rasmiy hujjat

- MDN — *Enumerability and ownership of properties*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Enumerability_and_ownership_of_properties>
- MDN — `Reflect.ownKeys()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect/ownKeys>
- MDN — `Object.prototype.propertyIsEnumerable()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/propertyIsEnumerable>
