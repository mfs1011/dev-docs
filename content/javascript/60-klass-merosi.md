# 60 — Klass merosi

[← Oldingi: Klass sintaksisi](59-klass-sintaksisi.md) · [Mundarija](README.md) · [Keyingi: Static →](61-static.md)

## Tushuncha

`class Bola extends Ota` — `Bola` `Ota` ning xatti-harakatini meros qilib oladi va kengaytiradi. MDN (*extends*): `extends` bilan o'z klasslarni ham, o'rnatilgan obyektlarni ham (63-bob) kengaytirish mumkin. Ota bo'lish uchun konstruktor `new` bilan chaqiriladigan **va** `prototype` xossasi bor bo'lishi kerak. Shuning uchun bog'langan funksiyadan (50-bob) yoki Proxy'dan meros olib bo'lmaydi; eski uslubdagi konstruktor funksiyadan esa olsa bo'ladi.

### Ikki zanjir (MDN)

`extends` **ikkita** prototipni o'rnatadi:

```text
Bola.prototype ──► Ota.prototype    (nusxa metodlari merosi)
Bola           ──► Ota              (static metodlar merosi, 61-bob)
```

### `super` (MDN)

`super` — o'zgaruvchi emas, maxsus sintaksis. U ikki shaklda ishlaydi:

| Shakl | Qayerda | Nima qiladi |
| --- | --- | --- |
| `super(...args)` | Faqat hosila klass konstruktorida | Ota konstruktorini chaqiradi va ota maydonlarini o'rnatadi |
| `super.metod()` | Metodlarda (klass va obyekt literalida) | Prototip zanjirining yuqorisidagi metodni chaqiradi |

Qoidalar:

- Hosila konstruktorida `super()` **`this` dan oldin** va konstruktor qaytishidan oldin chaqirilishi shart. Aks holda — `ReferenceError`.
- Konstruktor yozilmasa, MDN bo'yicha **standart konstruktor** qo'yiladi: asosiy klassda — bo'sh, hosilada — `constructor(...args) { super(...args); }`.
- `super` qaysi obyektga ishora qilishi metod **qayerda e'lon qilinganiga** bog'liq, qaysi obyektda chaqirilganiga emas. Metodni ajratish yoki qayta bog'lash `this` ni o'zgartiradi, `super` ni esa yo'q.

### Maydonlar va ota konstruktori (MDN *Evaluation order*)

Hosila klassning maydonlari `super()` **qaytishi bilan** o'rnatiladi. Demak ota konstruktori ishlayotganda bola maydonlari hali yo'q — lekin bola **metodlari** prototipda bor va chaqirilishi mumkin.

## Kod: `extends`, override va `super.metod`

```js
class Hayvon {
  constructor(nom) { this.nom = nom; this.tezlik = 0; }
  yugur(t) { this.tezlik = t; return `${this.nom} ${t} km/soat bilan yuguryapti`; }
  toxta() { this.tezlik = 0; return `${this.nom} to'xtadi`; }
}
class Quyon extends Hayvon {
  yashirin() { return `${this.nom} yashirindi`; }
  toxta() { return `${super.toxta()}, keyin ${this.yashirin()}`; }   // override + super.metod
}
const q = new Quyon('Oq quyon');                                      // konstruktor yo'q — standart: super(...args)
console.log(q.yugur(5), '|', q.toxta());
console.log(Object.getPrototypeOf(Quyon.prototype) === Hayvon.prototype, Object.getPrototypeOf(Quyon) === Hayvon);
console.log(q instanceof Quyon, q instanceof Hayvon);
```

```text
$ node meros.mjs
Oq quyon 5 km/soat bilan yuguryapti | Oq quyon to'xtadi, keyin Oq quyon yashirindi
true true
true true
```

- `Quyon` da konstruktor yo'q — standart konstruktor `nom` ni `Hayvon` ga uzatdi.
- `yugur` — meros. `toxta` — **qayta yozilgan** (override), lekin `super.toxta()` bilan otaning versiyasini ham chaqirdi.
- Ikki zanjir: `Quyon.prototype → Hayvon.prototype` va `Quyon → Hayvon`.

## Kod: hosila konstruktori

```js
class Hayvon { constructor(nom) { this.nom = nom; } }
class Ilon extends Hayvon {
  constructor(nom, uzunlik) {
    try { this.uzunlik = uzunlik; } catch (e) { console.log('super dan oldin this:', e.name + ': ' + e.message); }
    super(nom);                                // avval ota konstruktor
    this.uzunlik = uzunlik;
  }
}
console.log(new Ilon('Kobra', 2));
class Unutgan extends Hayvon { constructor() { } }
try { new Unutgan(); } catch (e) { console.log('super siz:', e.name + ': ' + e.message); }
```

```text
$ node konstruktor.mjs
super dan oldin this: ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
Ilon { nom: 'Kobra', uzunlik: 2 }
super siz: ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

- `super` dan oldin `this` ga murojaat — `ReferenceError`.
- `super(nom)` dan keyin — hammasi joyida.
- Konstruktor yozilgan, lekin `super` chaqirilmagan — nusxa yaratishda xato.

## Kod: maydonlar tartibi va `super` ning bog'lanishi

```js
class Ota {
  nom = 'ota';
  constructor() { console.log('  Ota konstruktori ko\'rgan nom:', this.nom, '| tanishtir():', this.tanishtir()); }
  tanishtir() { return 'ota metodi'; }
}
class Bola extends Ota {
  nom = 'bola';                                // super() qaytgach yoziladi
  tanishtir() { return 'bola metodi'; }        // metod — prototipda, darhol bor
}
new Bola();
const obj = { metod() { return super.toString === Object.prototype.toString; } };   // obyekt literalida super
console.log('literalda super:', obj.metod());
class Boshqa { salom() { return 'boshqa'; } }
console.log('super — e\'lon joyiga bog\'liq:', (class extends Boshqa { s() { return super.salom(); } }).prototype.s.call({}));
```

```text
$ node maydon.mjs
  Ota konstruktori ko'rgan nom: ota | tanishtir(): bola metodi
literalda super: true
super — e'lon joyiga bog'liq: boshqa
```

- Ota konstruktori ishlaganda `nom` — hali `'ota'`: bolaning `nom` maydoni `super()` qaytgandan keyin yoziladi. `tanishtir()` esa — **bola** metodi: u prototipda allaqachon bor.
- Obyekt literalidagi metodda ham `super` ishlaydi: u `Object.prototype` ga ishora qildi.
- Metod boshqa `this` (`{}`) bilan chaqirilganda ham `super.salom()` e'lon qilingan klassning otasidan topildi (MDN).

## Nega shunday

Hosila klass otaning "ustiga quriladi": avval ota o'z qismini (maydonlarini, invariantlarini) tayyorlashi kerak. Shuning uchun `this` faqat `super()` dan keyin paydo bo'ladi. `super` ning e'lon joyiga bog'lanishi esa metodni boshqa obyektga berganda ham "otaga murojaat" buzilmasligini ta'minlaydi.

## Muhandislik nuqtai nazari

### Ota konstruktorida overridable metod chaqirmang

Sinovda ota konstruktori bola metodini chaqirdi, lekin bola maydonlari hali yo'q edi. Bu — yashirin xato manbai: bola metodi `undefined` maydonlar bilan ishlaydi. Konstruktorda faqat o'z holatingizni sozlang.

### Meros emas, kompozitsiya

Meros "bola — otaning bir turi" (`Quyon` — `Hayvon`) bo'lganda mos. Faqat kodni qayta ishlatish kerak bo'lsa — obyektni boshqa obyekt ichida saqlash (kompozitsiya) yoki mixin (65-bob). Chuqur meros zanjirlari o'zgartirishni qiyinlashtiradi.

### Override'da `super` ni unutmang

Otaning xatti-harakatini kengaytirish kerak bo'lsa, `super.metod()` ni chaqiring. Butunlay almashtirish kerak bo'lsa — buni aniq izohlang.

## Tipik xatolar

| Xato | Natija | To'g'ri yo'l |
| --- | --- | --- |
| `super()` dan oldin `this` | `ReferenceError` | Birinchi qatorda `super(...)` |
| Konstruktor yozib, `super()` ni unutish | `ReferenceError` | `super()` yoki konstruktorni yozmaslik |
| Ota konstruktorida bola maydoniga tayanish | `undefined` | Maydonlarni ota konstruktorida ishlatmaslik |
| Bog'langan funksiyadan `extends` | `TypeError` (MDN) | Asl klass |
| `super` ni o'zgaruvchi kabi o'qish (`console.log(super)`) | `SyntaxError` (MDN) | `super.metod()` |

## Amaliyot

1. `Shakl` → `Tortburchak` → `Kvadrat` zanjirini yozing: `yuza()` ni har bosqichda kerakli joyda override qiling.
2. `Kvadrat` konstruktorida faqat bitta tomon olsin va `super(t, t)` chaqirsin.
3. Ota konstruktorida bola metodini chaqirish xatosini takrorlang va uni tuzating.
4. Eski uslubdagi konstruktor funksiyadan `class ... extends` bilan meros oling va metodlarini override qiling.
5. Obyekt literalida `__proto__` va `super.metod()` bilan meros yasang.

## Rasmiy hujjat

- MDN — `extends`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends>
- MDN — `super`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super>
- MDN — `constructor` (default constructor): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor>
- MDN — *Classes* (Evaluation order): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes>
