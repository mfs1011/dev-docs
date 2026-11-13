# 09 — Klass va konstruktor

[Mundarija](README.md)

## Tushuncha

Flutter'da har ekran va har tugma — **klass** nusxasi (widget, 13-bob). Shuning uchun klasslarni yaxshi bilish shart.

DD (Classes): Dart'da har obyekt — klass nusxasi (instance). Klassda:

| A'zo | Nima |
| --- | --- |
| **nusxa o'zgaruvchilari** (instance variables, maydonlar) | har obyektning o'z ma'lumoti; har biri uchun avtomatik getter (va `final` bo'lmasa — setter) bor |
| **metodlar** | obyekt bajaradigan funksiyalar |
| **getter / setter** (`get`, `set`) | DD (Methods): xossaga o'qish/yozish kirishini beradigan maxsus metodlar; avval oddiy maydon bo'lib, keyin uni metodga o'rash mumkin — klassdan foydalanuvchi kod o'zgarmaydi |
| **statik** a'zolar (`static`) | obyektga emas, klassning o'ziga tegishli |

DD: obyekt turini ish vaqtida bilish — `runtimeType`; lekin turni **tekshirish** uchun `is` operatori tavsiya etiladi
(`obj is T`), `runtimeType == T` emas.

### Konstruktorlar

DD (Constructors): konstruktor — klass nusxasini yaratadigan maxsus funksiya; standart konstruktordan boshqalari klass
nomi bilan ataladi.

| Konstruktor | Nima uchun (DD) | Ko'rinishi |
| --- | --- | --- |
| **Generativ** | yangi nusxa yaratadi va maydonlarni to'ldiradi | `Mahsulot(this.nom, this.narx);` |
| **Standart** (default) | konstruktor yozilmasa — argumentsiz, nomsiz generativ konstruktor | — |
| **Nomli** | maqsadini aniq aytish yoki bir klassda bir nechta konstruktor | `Mahsulot.fromJson(...)` |
| **Const** | kompilyatsiya vaqtidagi o'zgarmas obyektlar; **barcha maydonlar `final`** bo'lishi kerak | `const Rang(this.r, this.g, this.b);` |
| **Factory** | har doim yangi nusxa yaratmaydi: keshdan mavjudini yoki quyi turning nusxasini qaytaradi; yaratishdan oldin murakkab ish kerak bo'lsa ham. `this` ga kira olmaydi | `factory Jurnal(String nom) => …` |
| **Yo'naltiruvchi** (redirecting) | shu klassdagi boshqa konstruktorga uzatadi | `Mahsulot.bitta(String n) : this(n, 0);` |

Maydonlarni to'ldirish yo'llari (DD):

- **`this.maydon` parametrlari** (initializing formal parameters) — parametr to'g'ridan-to'g'ri maydonga; null
  bo'lmaydigan va `final` maydonlarni ham shunday to'ldirish mumkin. Nomli va standart qiymatli ham bo'ladi:
  `{this.soni = 1}`.
- **Initializer list** — konstruktor tanasidan oldin, `:` dan keyin, vergul bilan: `: nom = json['nom'] as String`.
  DD: o'ng tomoni `this` ga kira olmaydi; `final` maydonlarni hisoblab to'ldirish uchun qulay; `assert` ham qo'yish mumkin.

DD (Constructors, "Constant constructors"): `const` konstruktor har doim ham o'zgarmas yaratmaydi — u `const` bo'lmagan
joyda chaqirilsa, oddiy yangi obyekt bo'ladi. Pastdagi natijada buni `identical` ko'rsatadi. Flutter'da `const` widget'lar
qayta ishlatiladi va qayta qurilmaydi (13-bob).

### Yangi: qisqa va primary konstruktorlar

DD: Dart 3.13 dan ikki yangi qisqa yozuv bor (Dart 3.14.0 da ishlaydi):

- **qisqa konstruktor** — klass ichida klass nomi o'rniga `new` yoki `factory`: `new(this.x, this.y);`,
  `new origin() : x = 0, y = 0;`;
- **primary konstruktor** — maydonlar va asosiy konstruktor klass sarlavhasida bitta qatorda:
  `class Nuqta(final int x, final int y);`. `var` yoki `final` bilan e'lon qilingan parametr avtomatik maydon bo'ladi.
  DD: bu faqat yozuvni qisqartiradi, ish vaqtidagi xatti-harakat o'zgarmaydi.

Flutter kodlari va hujjatlarida hozircha klassik yozuv ko'proq uchraydi, shuning uchun kitobda asosan u ishlatiladi.

## Ko'rib chiqamiz

`klasslar.dart`:

```dart
class Mahsulot {
  // Nusxa (instance) o'zgaruvchilari
  final String nom;
  final int narx;
  int soni;

  // Generativ konstruktor: this.maydon — parametr to'g'ridan-to'g'ri maydonga
  Mahsulot(this.nom, this.narx, {this.soni = 1});

  // Nomli konstruktor + initializer list (tanadan oldin maydonlarni to'ldiradi)
  Mahsulot.fromJson(Map<String, Object> json)
    : nom = json['nom'] as String,
      narx = json['narx'] as int,
      soni = 1;

  // Getter — hisoblanadigan xossa
  int get jami => narx * soni;

  // Setter — tekshirib yozish
  set miqdor(int yangi) {
    if (yangi < 0) throw ArgumentError('miqdor manfiy bo\'lmaydi');
    soni = yangi;
  }

  // Metod
  void oshir() => soni++;

  // Obyektni matnga aylantirish (print shu metodni chaqiradi)
  @override
  String toString() => '$nom × $soni = $jami so\'m';
}

// const konstruktor: barcha maydonlar final
class Rang {
  final int r, g, b;
  const Rang(this.r, this.g, this.b);
  static const qora = Rang(0, 0, 0); // klass darajasidagi o'zgarmas
}

// factory: har safar yangi obyekt yaratmasligi mumkin (keshdan qaytaradi)
class Jurnal {
  final String nom;
  static final Map<String, Jurnal> _kesh = {};
  factory Jurnal(String nom) => _kesh.putIfAbsent(nom, () => Jurnal._ichki(nom));
  Jurnal._ichki(this.nom);
}

// Primary konstruktor (til versiyasi 3.13 dan): maydon va konstruktor bir qatorda
class Nuqta(final int x, final int y);

void main() {
  var non = Mahsulot('Non', 4000, soni: 3);
  var sut = Mahsulot.fromJson({'nom': 'Sut', 'narx': 12000});
  print(non);
  print(sut);
  non.oshir();
  sut.miqdor = 2;
  print('$non | $sut');
  print('jami: ${non.jami + sut.jami} so\'m');

  try {
    sut.miqdor = -1;
  } on ArgumentError catch (e) {
    print('xato: ${e.message}');
  }

  // const obyektlar: bir xil qiymatli const — bitta obyekt
  const a = Rang(0, 0, 0);
  print('Rang.qora bilan bitta obyektmi: ${identical(a, Rang.qora)}');
  var b = Rang(0, 0, 0); // const so'zisiz — yangi obyekt
  print('const siz yaratilgani: ${identical(b, Rang.qora)}');

  // factory keshdan qaytaradi
  print('bitta jurnalmi: ${identical(Jurnal('api'), Jurnal('api'))}');

  var n = Nuqta(3, 4);
  print('Nuqta(${n.x}, ${n.y}), turi: ${n.runtimeType}');
}
```

```text vps
$ dart run klasslar.dart
Non × 3 = 12000 so'm
Sut × 1 = 12000 so'm
Non × 4 = 16000 so'm | Sut × 2 = 24000 so'm
jami: 40000 so'm
xato: miqdor manfiy bo'lmaydi
Rang.qora bilan bitta obyektmi: true
const siz yaratilgani: false
bitta jurnalmi: true
Nuqta(3, 4), turi: Nuqta
```

Natijada:

- `Mahsulot('Non', 4000, soni: 3)` — pozitsion `this.nom`, `this.narx` va nomli `this.soni`; `fromJson` da `soni`
  initializer list'da `1` bo'ldi;
- `print(non)` — klassdagi `toString()` ni chaqirdi;
- `jami` — getter, maydon emas: `soni` o'zgargach o'zi qayta hisoblandi;
- setter manfiy qiymatni rad etdi (`ArgumentError` — xatolar 12-bobda);
- `const a = Rang(0, 0, 0)` va `Rang.qora` — **bitta** obyekt; `const` siz yaratilgan `b` esa boshqa obyekt;
- `Jurnal('api')` ikki marta chaqirildi, lekin factory keshdan bitta obyektni qaytardi;
- primary konstruktorli `Nuqta` ning `x` va `y` maydonlari bor.

## Tipik xatolar

`xatolar.dart`:

```dart
class Mahsulot {
  final String nom;
  final int narx;
  Mahsulot(this.nom);
}

class Rang {
  int r;
  const Rang(this.r);
}

void main() {
  var m = Mahsulot('Non');
  m.nom = 'Sut';
}
```

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:4:3 - All final variables must be initialized, but 'narx' isn't. Try adding an initializer for the field. - final_not_initialized_constructor
  error - xatolar.dart:9:9 - Can't define a const constructor for a class with non-final fields. Try making all of the fields final, or removing the keyword 'const' from the constructor. - const_constructor_with_non_final_field
  error - xatolar.dart:14:5 - 'nom' can't be used as a setter because it's final. Try finding a different setter, or making 'nom' non-final. - assignment_to_final

3 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `final` maydon konstruktorda to'ldirilmagan | DD: null bo'lmaydigan va `final` maydonlar albatta to'ldirilishi kerak | `Mahsulot(this.nom, this.narx);` yoki initializer list |
| `const` konstruktor, lekin maydon `final` emas | `const` obyekt o'zgarmas bo'lishi kerak | Barcha maydonlarni `final` qiling |
| `final` maydonga keyin qiymat berish | `final` maydonda setter yo'q | O'zgaradigan bo'lsa `final` siz (yoki yangi obyekt yarating) |
| `factory` ichida `this` | DD: factory `this` ga kira olmaydi | Kerakli ishni bajarib, generativ konstruktorni chaqiring (`Jurnal._ichki(nom)`) |
| Turni `obj.runtimeType == T` bilan tekshirish | DD: production'da `is` barqarorroq | `if (obj is T)` |

## Amaliyot

1. `Mahsulot(this.nom, this.narx);` dagi `this.nom` nima qiladi?
2. Nomli konstruktor nima uchun kerak? Bitta misol keltiring.
3. Initializer list'ga nima yoziladi va u qachon bajariladi?
4. `const` konstruktor uchun qanday shart bor? `Rang(0, 0, 0)` va `const Rang(0, 0, 0)` farqi nima?
5. Factory konstruktor qachon ishlatiladi?
6. Getter va oddiy maydon farqi nima? `jami` nega maydon emas, getter qilingan?

<details>
<summary>Javoblar</summary>

1. Konstruktorga berilgan argumentni to'g'ridan-to'g'ri `nom` maydoniga yozadi (initializing formal parameter).
2. Bir klassda bir nechta yaratish usuli bo'lishi va maqsadi aniq ko'rinishi uchun, masalan `Mahsulot.fromJson(json)`.
3. `:` dan keyin maydonlarni to'ldiradigan ifodalar (va `assert`); konstruktor tanasidan oldin bajariladi, o'ng tomoni `this` ga kira olmaydi.
4. Barcha maydonlar `final` bo'lishi kerak. `const Rang(0, 0, 0)` — kompilyatsiya vaqtidagi o'zgarmas (bir xil qiymatlilari bitta obyekt); `const` siz chaqiruv — oddiy yangi obyekt.
5. Har safar yangi nusxa kerak bo'lmaganda (keshdan qaytarish, quyi tur nusxasini qaytarish) yoki yaratishdan oldin murakkab ish (tekshirish, qayta ishlash) kerak bo'lganda.
6. Getter har o'qilganda hisoblanadi; maydon esa saqlangan qiymat. `jami` `narx` va `soni` dan kelib chiqadi — getter bo'lsa, ular o'zgarganda doim to'g'ri.

</details>

## Rasmiy hujjat

- [DD: Classes](https://dart.dev/language/classes)
- [DD: Constructors](https://dart.dev/language/constructors)
- [DD: Primary constructors](https://dart.dev/language/primary-constructors)
- [DD: Methods](https://dart.dev/language/methods)
