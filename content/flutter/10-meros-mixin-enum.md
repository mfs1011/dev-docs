# 10 — Meros, mixin, enum va extension

[Mundarija](README.md)

## Tushuncha

Flutter'ning o'zi shu mexanizmlarga qurilgan: har widget `StatelessWidget` yoki `StatefulWidget` dan **meros** oladi
(14-bob), animatsiya klasslari **mixin** ishlatadi, holatlar ko'pincha **enum** yoki **sealed** klass bilan ifodalanadi.

### Meros: `extends` va `super`

DD (Extend a class): `extends` — quyi klass (subclass) yaratadi, `super` — ota klass (superclass) ga murojaat. Quyi klass
nusxa metodlari, getter va setter'larni **qayta yozishi** (override) mumkin; `@override` izohi buni ataylab qilinganini
bildiradi. DD qoidalari: qayta yozilgan metodning qaytish turi ota klassnikidek yoki uning quyi turi, parametr turlari
esa o'shandek yoki undan kengroq bo'lishi kerak; pozitsion parametrlar soni bir xil.

DD (Constructors, "Super parameters"): konstruktorda `super.tomon` — argumentni ota klass konstruktoriga uzatish.

### Abstrakt klass va interfeys

DD (Class modifiers): `abstract class` — to'liq amalga oshirilishi shart bo'lmagan klass; **uni yaratib bo'lmaydi**
(o'z kutubxonasida ham). Ko'pincha **abstrakt metodlar** bo'ladi — tanasiz e'lonlar, ularni quyi klass beradi.

DD (Classes, "Implicit interfaces"): har klass avtomatik **interfeys** ham — uning barcha nusxa a'zolari. B klassning
API'sini uning amalga oshirilishini meros qilmasdan qo'llash uchun — `class A implements B` va hamma a'zolarni o'zi
yozadi.

### Mixin

DD (Mixins): **mixin** — bir nechta klass ierarxiyasida qayta ishlatiladigan kod. `mixin` bilan e'lon qilinadi, `with`
bilan ulanadi. Mixin'da `extends` va generativ konstruktor bo'lmaydi.

### Enum

DD (Enums): **enum** (sanab o'tiladigan tur) — belgilangan sondagi o'zgarmas qiymatlarni ifodalaydigan maxsus klass.
Har enum avtomatik `Enum` dan meros oladi va **sealed** — undan meros olib yoki yangi nusxa yaratib bo'lmaydi.
Har qiymatda `name` va `index`, enum'da `values` (hamma qiymatlar) bor.

DD: **kengaytirilgan enum** (enhanced enum, til versiyasi 2.17 dan) — maydon, metod va `const` konstruktorli enum.
Shartlar: maydonlar `final`, generativ konstruktorlar `const`, barcha qiymatlar e'lon boshida va kamida bitta qiymat.

### Extension

DD (Extension methods): mavjud kutubxonaga (o'zgartira olmaydigan API'ga) yangi imkoniyat qo'shish:
`extension Nom on String { … }`. Shunda `'42'.sonmi()` kabi yozish mumkin.

### `sealed` va boshqa modifikatorlar

DD (Class modifiers): klass oldiga qo'yiladigan kalit so'zlar uning qanday ishlatilishini boshqaradi — `abstract`,
`base`, `final`, `interface`, `sealed`, `mixin`. Ulardan ikkitasi Flutter ilovasida eng ko'p kerak:

| Modifikator | Ma'nosi (DD) |
| --- | --- |
| `final` | o'z kutubxonasidan tashqarida undan meros olib ham, uni `implements` qilib ham bo'lmaydi — tur ierarxiyasini yopadi |
| `sealed` | quyi turlarning **ma'lum, sanaladigan** to'plami: tashqarida kengaytirib yoki amalga oshirib bo'lmaydi, avtomatik `abstract`. Kompilyator barcha bevosita quyi turlarni biladi — `switch` hammasini qamramasa, **xato** beradi |

`sealed` klass + switch ifodasi (7-bob) — "javob yo muvaffaqiyat, yo xato" kabi holatlarni xavfsiz ifodalashning
DD'dagi usuli: keyin yangi quyi tur qo'shilsa, uni ishlamaydigan har `switch` darhol xato beradi.

## Ko'rib chiqamiz

`meros.dart`:

```dart
import 'dart:math' as math;

// 1. abstract klass: o'zi yaratilmaydi, abstrakt a'zolarni quyi klass beradi
abstract class Shakl {
  String get nom;
  double get yuza;

  @override
  String toString() => '$nom: ${yuza.toStringAsFixed(2)}';
}

// 2. extends — meros: Shakl'ning toString() i shu yerga o'tadi
class Doira extends Shakl {
  final double r;
  Doira(this.r);

  @override
  String get nom => 'doira';

  @override
  double get yuza => math.pi * r * r;
}

class Kvadrat extends Shakl {
  final double tomon;
  Kvadrat(this.tomon);

  @override
  String get nom => 'kvadrat';

  @override
  double get yuza => tomon * tomon;
}

// 3. super — ota klassning metodini chaqirish
class RangliKvadrat extends Kvadrat {
  final String rang;
  RangliKvadrat(super.tomon, this.rang);

  @override
  String toString() => '${super.toString()} ($rang)';
}

// 4. mixin — bir nechta klassga qo'shiladigan kod
mixin Jurnalli {
  final List<String> yozuvlar = [];
  void yoz(String matn) => yozuvlar.add(matn);
}

class Savat with Jurnalli {
  int soni = 0;
  void qosh() {
    soni++;
    yoz('qo\'shildi, jami $soni');
  }
}

// 5. enum — oddiy va kengaytirilgan (maydonli)
enum Holat { yangi, yolda, yetkazildi }

enum Tarif {
  oddiy(narx: 0, kun: 5),
  tezkor(narx: 15000, kun: 1);

  const Tarif({required this.narx, required this.kun});
  final int narx;
  final int kun;

  String get tavsif => '$name: $kun kun, ${narx == 0 ? 'bepul' : '$narx so\'m'}';
}

// 6. extension — mavjud turga (String) yangi metod qo'shish
extension SatrQulayliklari on String {
  String get bosh => isEmpty ? this : this[0].toUpperCase() + substring(1);
  int? sonmi() => int.tryParse(this);
}

// 7. sealed — quyi turlar ro'yxati yopiq, switch to'liqligi tekshiriladi
sealed class Javob {}

class Muvaffaqiyat extends Javob {
  final String malumot;
  Muvaffaqiyat(this.malumot);
}

class Xatolik extends Javob {
  final int kod;
  Xatolik(this.kod);
}

String korsat(Javob j) => switch (j) {
  Muvaffaqiyat(:var malumot) => 'OK: $malumot',
  Xatolik(:var kod) => 'xato, kod $kod',
};

void main() {
  List<Shakl> shakllar = [Doira(1), Kvadrat(2), RangliKvadrat(3, 'qizil')];
  for (var s in shakllar) {
    print(s);
  }
  print('hammasi Shakl: ${shakllar.every((s) => s is Shakl)}');

  var savat = Savat()..qosh()..qosh(); // .. — kaskad: bitta obyektga ketma-ket chaqiruv
  print(savat.yozuvlar);

  print('${Holat.yolda}, nomi: ${Holat.yolda.name}, indeksi: ${Holat.yolda.index}, hammasi: ${Holat.values}');
  for (var t in Tarif.values) {
    print(t.tavsif);
  }

  print('toshkent'.bosh);
  print('${'42'.sonmi()}, ${'qirq'.sonmi()}');

  print(korsat(Muvaffaqiyat('3 ta buyurtma')));
  print(korsat(Xatolik(404)));
}
```

```text vps
$ dart run meros.dart
doira: 3.14
kvadrat: 4.00
kvadrat: 9.00 (qizil)
hammasi Shakl: true
[qo'shildi, jami 1, qo'shildi, jami 2]
Holat.yolda, nomi: yolda, indeksi: 1, hammasi: [Holat.yangi, Holat.yolda, Holat.yetkazildi]
oddiy: 5 kun, bepul
tezkor: 1 kun, 15000 so'm
Toshkent
42, null
OK: 3 ta buyurtma
xato, kod 404
```

Natijada:

- `Doira` va `Kvadrat` faqat `nom` va `yuza` ni berdi, `toString()` esa `Shakl` dan meros bo'lib keldi;
- `RangliKvadrat` `super.tomon` bilan ota konstruktorni chaqirdi va `super.toString()` ga rangni qo'shdi;
- `Savat` `Jurnalli` mixin'idagi `yozuvlar` va `yoz` ni oldi; `Savat()..qosh()..qosh()` — **kaskad** (`..`, DD Operators):
  bitta obyektga ketma-ket chaqiruvlar;
- enum qiymatining `name`, `index` va `Holat.values`; `Tarif` ning har qiymatida o'z `narx` va `kun` i bor;
- `'toshkent'.bosh` va `'42'.sonmi()` — `String` ga qo'shilgan extension;
- `korsat` dagi switch ikkala `Javob` turini qamradi — `_` kerak bo'lmadi.

## Tipik xatolar

`xatolar.dart`:

```dart
abstract class Shakl {
  double get yuza;
}

class Uchburchak extends Shakl {}

sealed class Javob {}
class Muvaffaqiyat extends Javob {}
class Xatolik extends Javob {}
class Kutilmoqda extends Javob {}

String korsat(Javob j) => switch (j) {
  Muvaffaqiyat() => 'OK',
  Xatolik() => 'xato',
};

void main() {
  var s = Shakl();
  print(korsat(Xatolik()));
}
```

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:5:7 - Missing concrete implementation of 'getter Shakl.yuza'. Try implementing the missing method, or make the class abstract. - non_abstract_class_inherits_abstract_member
  error - xatolar.dart:12:27 - The type 'Javob' isn't exhaustively matched by the switch cases since it doesn't match the pattern 'Kutilmoqda()'. Try adding a wildcard pattern or cases that match 'Kutilmoqda()'. - non_exhaustive_switch_expression
  error - xatolar.dart:18:11 - Abstract classes can't be instantiated. Try creating an instance of a concrete subtype. - instantiate_abstract_class
warning - xatolar.dart:18:7 - The value of the local variable 's' isn't used. Try removing the variable or using it. - unused_local_variable

4 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Abstrakt a'zoni bermasdan meros olish | Oddiy klass ota klassning abstrakt a'zolarini to'liq berishi kerak | `@override double get yuza => …;` qo'shing yoki klassni ham `abstract` qiling |
| `sealed` klassga yangi quyi tur qo'shib, switch'ni yangilamaslik | Kompilyator `Kutilmoqda()` holati yo'qligini ko'radi | Yangi holatni switch'ga qo'shing (`_` qo'yish xatoni yashiradi) |
| Abstrakt klassdan obyekt yaratish | DD: abstrakt klassni yaratib bo'lmaydi | Aniq quyi klassni yarating (`Doira(1)`) |
| `@override` yozmaslik | Xato emas, lekin ota klassdagi nom o'zgarsa, metod jimgina "yangi" metodga aylanadi | Qayta yozilgan har a'zoga `@override` |
| Faqat kod bo'lishish uchun meros | Meros "bu — u" munosabati; bir nechta klassga umumiy xatti-harakat uchun mo'ljallanmagan | Umumiy kod uchun mixin |

## Amaliyot

1. `extends` va `implements` farqi nima?
2. `super` qayerlarda ishlatiladi? Ikki misol.
3. Abstrakt klass nima uchun kerak? Undan obyekt yaratsa bo'ladimi?
4. Mixin va meros farqi nima? Bitta klassga bir nechta mixin qo'shsa bo'ladimi?
5. Kengaytirilgan enum qiymatiga maydon qo'shish uchun qanday shartlar bor?
6. `sealed` klass switch'da nima beradi?

<details>
<summary>Javoblar</summary>

1. `extends` — ota klassning amalga oshirilishini meros oladi (bitta ota klass); `implements` — faqat interfeysini (API) qabul qiladi, barcha a'zolarni o'zi yozadi (bir nechta bo'lishi mumkin).
2. Masalan: konstruktorda argumentni ota konstruktorga uzatish (`super.tomon`) va qayta yozilgan metodda ota metodni chaqirish (`super.toString()`).
3. Umumiy interfeys va qisman amalga oshirilgan kod uchun; abstrakt a'zolarni quyi klasslar beradi. Undan obyekt yaratib bo'lmaydi.
4. Meros — bitta ota klass, "bu — u" munosabati; mixin — kodni bir nechta ierarxiyaga qo'shish (`with A, B`). Ha, bir nechta mixin mumkin.
5. Maydonlar `final`, generativ konstruktor `const`, qiymatlar e'lon boshida (kamida bitta).
6. Kompilyator barcha quyi turlarni biladi: switch ularning hammasini qamramasa — kompilyatsiya xatosi; keyin yangi quyi tur qo'shilsa, ishlanmagan joylar darhol ko'rinadi.

</details>

## Rasmiy hujjat

- [DD: Extend a class](https://dart.dev/language/extend)
- [DD: Constructors — Super parameters](https://dart.dev/language/constructors#super-parameters)
- [DD: Classes — Implicit interfaces](https://dart.dev/language/classes#implicit-interfaces)
- [DD: Mixins](https://dart.dev/language/mixins)
- [DD: Enums](https://dart.dev/language/enums)
- [DD: Extension methods](https://dart.dev/language/extension-methods)
- [DD: Class modifiers](https://dart.dev/language/class-modifiers)
