# 16 — Obyektlar

[← Oldingi: Polyfill va transpilyator](15-polyfill-va-transpilyator.md) · [Mundarija](README.md) · [Keyingi: Havola va nusxa →](17-havola-va-nusxa.md)

## Tushuncha

6-bobda ko'rdik: JavaScript'da primitivlardan tashqari hamma narsa — **obyekt**, va obyektlar — tilda **yagona o'zgaruvchan** qiymatlar. MDN (*Working with objects*): obyektni **xossalar to'plami** deb ko'rish mumkin; xossa — **nom (kalit)** va **qiymat** o'rtasidagi bog'lanish. Qiymati funksiya bo'lgan xossa **metod** deyiladi.

```text
 talaba ──▶ ┌──────────────────────────────────────┐
            │ ism     : 'Ali'                       │  ← xossa (kalit: qiymat)
            │ yosh    : 25                          │
            │ manzil  : ──▶ { tuman: 'Chilonzor' }  │  ← qiymati boshqa obyekt
            │ salom   : ƒ salom()                   │  ← metod
            └──────────────────────────────────────┘
```

III qism obyektlarni bosqichma-bosqich ochadi: bu bobda — yaratish, xossalarga murojaat, kalitlar va tekshirish; keyingilarida — havola va nusxa (17), xotira (18), `this` (19), konstruktorlar (20), `?.` (21), Symbol (22) va obyektning primitivga aylanishi (23–24).

## Kod: obyekt literali

MDN: obyektni yaratishning eng keng tarqalgan usuli — **obyekt initsializatori** yoki **obyekt literali** — jingalak qavslar ichida vergul bilan ajratilgan `kalit: qiymat` juftliklari.

```js
const ism = 'Ali', yosh = 25;
const kalit = 'shahar';
const talaba = {
  ism,                       // qisqa yozuv: ism: ism
  yosh,
  'tug\'ilgan yil': 2001,     // probelli/maxsus kalit — qo'shtirnoqda
  [kalit]: 'Toshkent',        // hisoblanadigan kalit
  [`${kalit}Kodi`]: 'TAS',
  salom() { return `Salom, men ${this.ism}`; },   // metod
  manzil: { tuman: 'Chilonzor' },
};
console.log(talaba);
console.log(talaba.ism, talaba['tug\'ilgan yil'], talaba.manzil.tuman, talaba.salom());
console.log(talaba.telefon, typeof talaba.yoq?.ichki);
```

```text
$ node yaratish.mjs
{
  ism: 'Ali',
  yosh: 25,
  "tug'ilgan yil": 2001,
  shahar: 'Toshkent',
  shaharKodi: 'TAS',
  salom: [Function: salom],
  manzil: { tuman: 'Chilonzor' }
}
Ali 2001 Chilonzor Salom, men Ali
undefined undefined
```

Literal ichida nimalar bo'lishi mumkin (MDN *Object initializer*):

| Yozuv | Ma'nosi |
| --- | --- |
| `ism: 'Ali'` | Oddiy xossa — kalit identifikator, son yoki satr literali bo'lishi mumkin |
| `ism` | **Qisqa yozuv** (shorthand) — `ism: ism`; o'zgaruvchi nomi kalit bo'ladi |
| `'tug\'ilgan yil': 2001` | Identifikator bo'la olmaydigan kalit — qo'shtirnoq ichida |
| `[ifoda]: qiymat` | **Hisoblanadigan kalit** (computed) — kalit ijro vaqtida hisoblanadi |
| `salom() { ... }` | **Metod** ta'rifi |
| `...boshqa` | **Spread** — boshqa obyekt xossalarini nusxalash (17- va 42-boblar) |

MDN yana ikki narsani ta'kidlaydi:

- obyekt literali — **ifoda**, va u **har safar bajarilganda yangi obyekt** yaratadi. Bir xil yozilgan ikki literal — **ikki xil**, teng bo'lmagan obyekt (9-bob);
- literal bilan yaratilgan obyektlar **oddiy obyektlar** (plain objects) deyiladi — ular `Object` ning nusxasi, boshqa maxsus tipniki emas.

Bir xil kalit ikki marta yozilsa — MDN: **ikkinchisi birinchisining ustidan yozadi**:

```js
const o = { a: 1, a: 2 };
console.log(o);    // { a: 2 }
```

## Kod: xossaga murojaat — nuqta va kvadrat qavs

MDN: xossaga ikki xil yozuv bilan murojaat qilinadi — **nuqta** (`obj.kalit`) va **kvadrat qavs** (`obj['kalit']`).

| | Nuqta: `obj.ism` | Qavs: `obj['ism']`, `obj[o'zgaruvchi]` |
| --- | --- | --- |
| Kalit | Haqiqiy identifikator bo'lishi kerak | **Istalgan** satr yoki Symbol |
| Probel, tire, raqam bilan boshlanadigan kalit | Mumkin emas | Mumkin |
| Kalit o'zgaruvchida | Mumkin emas (`obj.kalit` — "kalit" degan xossa) | `obj[kalit]` |

MDN: **mavjud bo'lmagan** xossaning qiymati — **`undefined`** (`null` emas). Yuqorida `talaba.telefon` → `undefined`. Mavjud bo'lmagan obyektning xossasiga murojaat esa xato beradi — `?.` buning oldini oladi (21-bob).

## Kod: kalitlar doim satr (yoki Symbol)

MDN: xossa nomi — istalgan **satr** yoki **Symbol**, hatto bo'sh satr ham. Boshqa tipdagi qiymat kalit sifatida berilsa, u **satrga aylantiriladi**.

```js
const o = {};
o.turi = 'nuqta';
o['ochiq kalit'] = 'probelli';
o[42] = 'son';
o[{}] = 'obyekt';
o[''] = 'bo\'sh';
o[Symbol('id')] = 'symbol';
o[true] = 'mantiqiy';
console.log(Object.keys(o));
console.log(typeof Object.keys(o)[1], o['42'] === o[42]);
```

```text
$ node kalitlar.mjs
[ '42', 'turi', 'ochiq kalit', '[object Object]', '', 'true' ]
string true
```

- `42` → `'42'`, `true` → `'true'` — satrga aylandi; `o[42]` va `o['42']` — **bitta** xossa.
- `{}` → `'[object Object]'` — MDN: obyekt kalit qilinsa, uning `toString()` chaqiriladi (7-bob). Har qanday ikki obyekt **bir xil** kalitga aylanadi — obyektni kalit sifatida ishlatish uchun `Map` kerak (33-bob).
- Symbol kalit `Object.keys` da ko'rinmaydi — 22-bobda.

### Kalitlar tartibi

```js
const tartib = { b: 1, 10: 'o\'n', a: 2, 2: 'ikki', '-1': 'minus' };
console.log(Object.keys(tartib));
```

```text
[ '2', '10', 'b', 'a', '-1' ]
```

MDN (*for...in*): aylanish tartibi zamonaviy spetsifikatsiyada **aniq belgilangan** va barcha engine'larda bir xil: avval **manfiy bo'lmagan butun son kalitlar** (massiv indeksi bo'la oladiganlar) **o'sish tartibida**, keyin **qolgan satr kalitlar** yaratilish **tartibida**. `'-1'` — butun son ko'rinishida, lekin manfiy, shuning uchun oddiy satr kalit sifatida oxirida.

Amaliy oqibat: obyektda kalitlar tartibiga tayanmang, ayniqsa kalitlar raqamga o'xshasa (ID'lar, yillar). Tartib muhim bo'lsa — massiv yoki `Map` (yaratilish tartibini aniq saqlaydi).

## Kod: xossa bormi? `in`, `Object.hasOwn`, `delete`

```js
const m = { nom: 'kitob', narx: undefined };
console.log('narx' in m, m.narx !== undefined, Object.hasOwn(m, 'narx'));
console.log('toString' in m, Object.hasOwn(m, 'toString'), typeof m.toString);
delete m.narx;
console.log(m, 'narx' in m, delete m.yoq);
```

```text
$ node tekshir.mjs
true false true
true false function
{ nom: 'kitob' } false true
```

| Usul | Nimani tekshiradi |
| --- | --- |
| `obj.kalit !== undefined` | Qiymatni — xossa **bor, lekin `undefined`** bo'lsa noto'g'ri javob beradi |
| `'kalit' in obj` | Xossa obyektda **yoki uning prototiplar zanjirida** bormi |
| `Object.hasOwn(obj, 'kalit')` | Xossa obyektning **o'zida** bormi (meros emas) |

- `narx: undefined` — xossa **bor**, lekin qiymat bo'yicha tekshiruv "yo'q" dedi.
- `toString` — `m` ning o'zida yo'q, u **meros** qilib olingan (`Object.prototype` dan — 54-bob). `in` uni "bor" deydi, `Object.hasOwn` — "yo'q". MDN o'z misolida ham `for...in` ichida aynan `Object.hasOwn` bilan meros xossalarni chiqarib tashlaydi.
- **`delete`** xossani butunlay o'chiradi (qiymatni `undefined` qilish bilan bir xil emas). Mavjud bo'lmagan xossani o'chirish — xatosiz, `true` qaytaradi. MDN: `delete` o'zgaruvchi nomlarini o'chirmaydi (strict mode'da `delete x` — sintaksis xatosi, 4-bob), private maydonlarni ham o'chira olmaydi.

### Xossalarni sanash

MDN uchta usulni ko'rsatadi:

| Usul | Nimani beradi |
| --- | --- |
| `for...in` | Sanaluvchi satr xossalar — **prototiplar zanjiridagilari ham** |
| `Object.keys(obj)` | Faqat **o'z**, sanaluvchi satr kalitlar |
| `Object.getOwnPropertyNames(obj)` | Barcha **o'z** satr kalitlar — sanaluvchi bo'lmaganlari ham |

"Sanaluvchi" (enumerable) nima ekani va to'liq jadval — 52- va 58-boblarda. Kundalik ishda `Object.keys`/`values`/`entries` (35-bob) yetarli.

## Nega shunday

JavaScript obyekti — sinflarsiz, **erkin kalit-qiymat to'plami**: xossani istalgan paytda qo'shish va o'chirish mumkin. Bu moslashuvchanlik obyektlarni ham "yozuv" (bitta narsaning maydonlari), ham "lug'at" (ixtiyoriy kalitlar) sifatida ishlatishga imkon beradi.

Lekin MDN (*Data types*) ogohlantiradi: obyektlar ko'pincha **map** sifatida ishlatiladi, ammo bunda **qulaylik, xavfsizlik va unumdorlik** muammolari bo'lishi mumkin — ixtiyoriy ma'lumotni saqlash uchun **`Map`** ishlating. Yuqorida ko'rganimizdek: kalitlar satrga aylanadi, meros xossalar (`toString`) "bor" bo'lib chiqadi, kalitlar tartibi raqamli kalitlarda o'zgaradi.

## Muhandislik nuqtai nazari

### Tashqi kiritilgan kalitlar bilan ehtiyot bo'ling

MDN: nomi **tashqi kiritishdan** keladigan xossalarga kvadrat qavs bilan murojaat qilish kodni **obyekt in'ektsiyasi** hujumlariga ochiq qilishi mumkin. Masalan, foydalanuvchi `'__proto__'` yoki `'constructor'` kalitini yuborsa, oddiy obyekt kutilmagan narsani qaytaradi yoki prototipni o'zgartirib yuboradi. Tashqi kalitlar uchun:

- `Map` (33-bob);
- yoki prototipsiz obyekt `Object.create(null)` (57-bob);
- yoki kalitni ruxsat etilganlar ro'yxati bilan tekshirish va `Object.hasOwn`.

### Yozuv yoki lug'at?

| Obyekt roli | Belgilari | Tavsiya |
| --- | --- | --- |
| **Yozuv** (`foydalanuvchi`, `buyurtma`) | Kalitlar oldindan ma'lum va qat'iy | Oddiy obyekt (yoki klass, 59-bob) |
| **Lug'at** (ID → ma'lumot, so'z → son) | Kalitlar ijro vaqtida, ixtiyoriy | `Map` |

### `undefined` qiymat va xossa yo'qligi — har xil

API'lar va JSON'da bu farq muhim: `JSON.stringify({ a: undefined })` — `'{}'`, xossa umuman tushib qoladi (38-bob). "Qiymat yo'q" degan ma'noni aniq bildirish kerak bo'lsa — `null` (6-bob).

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `obj.kalit` (kalit — o'zgaruvchi) | "kalit" nomli xossa qidiriladi | `obj[kalit]` |
| `obj.ochiq kalit` | Sintaksis xatosi | `obj['ochiq kalit']` |
| Obyektni boshqa obyektning kaliti qilish | Barchasi `'[object Object]'` bo'ladi | `Map` |
| `if (obj.x)` bilan xossa borligini tekshirish | `0`, `''`, `undefined` qiymatlar "yo'q" bo'ladi | `Object.hasOwn(obj, 'x')` |
| `'toString' in obj` dan "o'z xossasi" deb xulosa | Meros xossalar ham `true` | `Object.hasOwn` |
| Raqamli kalitlar tartibiga tayanish | O'sish tartibida qayta saralanadi | Massiv yoki `Map` |
| `() => { a: 1 }` bilan obyekt qaytarish | Blok + label (14-bob) | `() => ({ a: 1 })` |

## Amaliyot

1. `kitob` obyektini yarating: `nom`, `muallif`, `yil`, hisoblanadigan kalit (`const k = 'nashrYili'` va literal ichida `[k]: 2020`) va `tavsif()` metodi. Natijani `console.log` qiling.
2. `const o = { 1: 'a', b: 'b', 0: 'c', '01': 'd' };` — `Object.keys(o)` tartibini oldindan ayting, keyin tekshiring. `'01'` qayerga tushdi va nega?
3. `const sanoq = {}; for (const soz of 'olma nok olma uzum olma'.split(' ')) sanoq[soz] = (sanoq[soz] ?? 0) + 1;` — natijani tekshiring. Keyin `soz` sifatida `'constructor'` qo'shib ko'ring — nima bo'ldi? `Map` bilan qayta yozing.
4. `Object.hasOwn`, `in` va `!== undefined` uchala usulini `{ a: undefined }` obyektida `'a'`, `'b'` va `'hasOwnProperty'` kalitlari bilan solishtiring.
5. `delete` va `= undefined` farqini `Object.keys` va `JSON.stringify` orqali ko'rsating.

## Rasmiy hujjat

- MDN — *Working with objects*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects>
- MDN — *Object initializer*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer>
- MDN — *Property accessors*: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors>
- MDN — `for...in` (aylanish tartibi): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in>
- MDN — `Object.hasOwn()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn>
- MDN — `in`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/in>
- MDN — `delete`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete>
- ECMA-262 — *Object Initializer*: <https://tc39.es/ecma262/2026/#sec-object-initializer>
