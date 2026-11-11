# 53 — Getter va setter

[← Oldingi: Property flag'lari va descriptor'lar](52-property-flaglari.md) · [Mundarija](README.md) · [Keyingi: Prototip merosi →](54-prototip-merosi.md)

## Tushuncha

52-bobda ikki xil xossa ko'rdik: **data** (`value`) va **accessor** (`get`/`set`). Bu bob — accessor xossalar haqida.

| | Data xossa | Accessor xossa |
| --- | --- | --- |
| O'qilganda | Saqlangan `value` | **`get` funksiyasi** chaqiriladi, natijasi — qiymat |
| Yozilganda | `value` almashtiriladi | **`set` funksiyasi** yangi qiymat bilan chaqiriladi |
| Tashqi ko'rinishi | `obj.x`, `obj.x = 1` | Xuddi shunday — chaqiruvchi farqni ko'rmaydi |

MDN: getter **dinamik hisoblanadigan** qiymatni qaytarishga yoki ichki holatni metodni aniq chaqirmasdan ko'rsatishga imkon beradi. Setter xossani o'zgartirishga urinishda funksiya bajaradi — ko'pincha getter bilan juft.

Xossa yo data, yo accessor bo'ladi — ikkalasi birga emas.

### Qayerda e'lon qilinadi (MDN)

| Usul | Qayerda | `enumerable` |
| --- | --- | --- |
| Obyekt literalida `get x() {}` | Obyektning o'z xossasi | `true` (`configurable` ham) |
| Klassda `get x() {}` | **Prototipda** — barcha nusxalar bo'lishadi | `false` |
| `Object.defineProperty(obj, 'x', { get })` | Aynan shu obyektda | Berilganicha (standart `false`) |

Faqat `get` bo'lsa — faqat o'qiladigan xossa: unga yozish strict rejimda `TypeError`.

### "Aqlli" (lazy) getter (MDN)

Getter qiymatni **murojaat qilinguncha** hisoblamaydi. Agar hisob qimmat bo'lsa, natijani keshlash mumkin: birinchi o'qishda getter o'zini o'chirib, natijani oddiy data xossa sifatida yozadi. MDN: bu faqat qiymati o'zgarmaydigan xossa uchun — aks holda u qayta hisoblanmaydi. Getter'lar tabiatan lazy yoki keshlovchi emas — buni o'zingiz yozasiz.

## Kod: getter va setter

```js
const user = {
  ism: 'Ali', familiya: 'Valiyev',
  get toliqIsm() { return `${this.ism} ${this.familiya}`; },          // o'qishda hisoblanadi
  set toliqIsm(qiymat) { [this.ism, this.familiya] = qiymat.split(' '); },
};
console.log(user.toliqIsm);
user.toliqIsm = 'Vali Karimov';
console.log(user.ism, '|', user.familiya, '|', user.toliqIsm);
console.log(Object.getOwnPropertyDescriptor(user, 'toliqIsm'));
const faqatOqish = { get pi() { return 3.14; } };                  // setter'siz accessor
try { faqatOqish.pi = 3; } catch (e) { console.log(e.name + ': ' + e.message); }
```

```text
$ node asos.mjs
Ali Valiyev
Vali | Karimov | Vali Karimov
{
  get: [Function: get toliqIsm],
  set: [Function: set toliqIsm],
  enumerable: true,
  configurable: true
}
TypeError: Cannot set property pi of #<Object> which has only a getter
```

- `toliqIsm` — saqlanmaydi, har o'qishda `ism` va `familiya` dan yig'iladi. Unga yozish setter orqali ikki xossani o'zgartirdi.
- Descriptor'da `value`/`writable` yo'q — `get`, `set`, `enumerable`, `configurable`.
- Faqat getter'li `pi` ga yozish — `TypeError`.

## Kod: tekshiruvli setter (klassda)

```js
class Mahsulot {
  #narx = 0;                                                         // haqiqiy qiymat — xususiy maydonda
  get narx() { return this.#narx; }
  set narx(qiymat) {
    if (typeof qiymat !== 'number' || qiymat < 0) throw new RangeError(`noto'g'ri narx: ${qiymat}`);
    this.#narx = qiymat;
  }
}
const m = new Mahsulot();
m.narx = 15000;
console.log(m.narx);
try { m.narx = -5; } catch (e) { console.log(e.name + ': ' + e.message); }
console.log('o\'z xossasimi:', Object.hasOwn(m, 'narx'), '| prototipda:', Object.hasOwn(Mahsulot.prototype, 'narx'), '| keys:', Object.keys(m));
```

```text
$ node tekshir.mjs
15000
RangeError: noto'g'ri narx: -5
o'z xossasimi: false | prototipda: true | keys: []
```

- Setter noto'g'ri qiymatni rad etdi — haqiqiy qiymat yopiq `#narx` maydonida (62-bob).
- MDN: klass getter'i **prototipda**: nusxada o'z xossasi yo'q, `Object.keys` bo'sh.

## Kod: moslik va lazy getter

```js
// Eski kod: yosh — xossa. Yangi talab: tug'ilgan yil saqlansin. Getter bilan eski kod buzilmaydi.
function Foydalanuvchi(ism, tugilganYil) {
  this.ism = ism;
  this.tugilganYil = tugilganYil;
  Object.defineProperty(this, 'yosh', {
    get() { return 2026 - this.tugilganYil; },
    enumerable: true,
  });
}
const f = new Foydalanuvchi('Laylo', 2000);
console.log(f.yosh, JSON.stringify(f));

let hisoblandi = 0;
const sozlama = {                                                    // MDN: "aqlli" (lazy) getter
  get ogirQiymat() {
    hisoblandi++;
    delete this.ogirQiymat;                                          // accessor'ni olib tashlab...
    return (this.ogirQiymat = [...Array(5).keys()].map(n => n * n)); // ...oddiy xossa sifatida keshlash
  },
};
console.log(sozlama.ogirQiymat, sozlama.ogirQiymat, 'hisoblandi:', hisoblandi);
console.log(Object.getOwnPropertyDescriptor(sozlama, 'ogirQiymat').writable);
```

```text
$ node moslik.mjs
26 {"ism":"Laylo","tugilganYil":2000,"yosh":26}
[ 0, 1, 4, 9, 16 ] [ 0, 1, 4, 9, 16 ] hisoblandi: 1
true
```

- **Moslik**: eski kod `f.yosh` ni xossa sifatida ishlatardi. Endi `tugilganYil` saqlanadi, `yosh` esa getter bilan hisoblanadi (sinov uchun joriy yil kodga yozilgan). Eski kod o'zgarmadi. `enumerable: true` tufayli `yosh` JSON'da ham bor.
- **Lazy getter**: `ogirQiymat` ikki marta o'qildi, lekin hisob **bir marta** bajarildi. Birinchi o'qishdan keyin xossa oddiy data xossaga aylandi (`writable: true`).

## Nega shunday

Xossani o'qish va yozish — eng oddiy interfeys. Getter/setter shu interfeysni saqlagan holda orqasiga mantiq qo'yadi: hisoblash, tekshirish, moslik. Chaqiruvchi kodni o'zgartirmasdan ichki tuzilmani o'zgartirish mumkin — "yosh" misoli shu.

## Muhandislik nuqtai nazari

### Getter — arzon va yon ta'sirsiz bo'lsin

`obj.x` ni o'qigan dasturchi og'ir hisob, tarmoq so'rovi yoki holat o'zgarishini kutmaydi. Qimmat ish — metod (`hisobla()`) yoki lazy getter.

### Setter'da tekshirish

Setter — qiymatni bitta joyda tekshirish uchun yaxshi joy. Haqiqiy qiymatni `#private` maydonda saqlang, aks holda tashqi kod uni setter'siz o'zgartiradi.

### Prototipdagi getter va serializatsiya

Klass getter'lari prototipda va `enumerable: false` — `JSON.stringify` va `Object.keys` ularni ko'rmaydi. Ular kerak bo'lsa, `toJSON()` (38-bob) yozing.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| Getter ichida o'sha xossani o'qish (`get x() { return this.x; }`) | Cheksiz rekursiya — `RangeError` | Qiymatni boshqa nomda yoki `#x` da saqlash |
| Setter'siz xossaga yozish | Strict rejimda `TypeError` | Setter qo'shish yoki yozmaslik |
| O'zgaradigan qiymatga lazy getter | Eskirgan qiymat (MDN) | Oddiy getter |
| Klass getter'ini `JSON.stringify` da kutish | Chiqmaydi | `toJSON` |
| Getter'da yon ta'sir | Kutilmagan xatti-harakat | Metod |

## Amaliyot

1. `Aylana` klassini yozing: `radius` saqlansin, `diametr` va `yuza` getter bilan, `diametr` setter bilan.
2. `harorat` obyektida `selsiy` saqlansin, `farengeyt` getter/setter orqali ishlasin.
3. Getter ichida o'z nomini o'qiydigan xatoni yozing va `RangeError` ni ko'ring, keyin tuzating.
4. `Object.defineProperty` bilan faqat o'qiladigan, lekin sanaladigan `id` accessor'ini yarating.
5. Lazy getter bilan "ogir" hisobni keshlang va `console.count` bilan necha marta hisoblanganini tekshiring.

## Rasmiy hujjat

- MDN — `get`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get>
- MDN — `set`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set>
- MDN — `Object.defineProperty()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty>
