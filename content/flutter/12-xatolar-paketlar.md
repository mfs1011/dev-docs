# 12 — Xatolar, kutubxonalar va paketlar

[Mundarija](README.md)

## Tushuncha

### Istisnolar

DD (Error handling): Dart kodi **istisno** (exception) tashlashi va ushlashi mumkin — kutilmagan narsa yuz berganini
bildiradigan xato. Istisno ushlanmasa, uni tashlagan isolate to'xtatiladi va odatda dastur tugaydi. Java'dan farqli,
Dart'ning **barcha istisnolari tekshirilmaydigan** (unchecked): metodlar qanday istisno tashlashini e'lon qilmaydi va ularni
ushlash majburiy emas.

| Yozuv | Nima qiladi (DD) |
| --- | --- |
| `throw X` | istisno tashlaydi; `throw` — ifoda, shuning uchun `=>` ichida ham bo'ladi |
| `try { … }` | istisno chiqishi mumkin bo'lgan kod |
| `on T` | faqat `T` turidagi istisnoni ushlaydi (obyekt kerak bo'lmasa) |
| `catch (e)` / `catch (e, s)` | istisno obyektini (va stack trace'ni) oladi; turi ko'rsatilmasa — hammasini |
| `on T catch (e)` | ikkalasi birga |
| `rethrow` | qisman ishlab, istisnoni yuqoriga uzatadi |
| `finally { … }` | istisno bo'ladimi-yo'qmi, **har doim** bajariladi (mos `catch` lardan keyin) |
| `assert(shart, xabar)` | faqat ishlab chiqishda: shart yolg'on bo'lsa, bajarilishni to'xtatadi; production kodda e'tiborga olinmaydi |

DD: Dart `Exception` va `Error` turlarini va ularning ko'p tayyor quyi turlarini beradi; o'z istisno turini yaratsa
bo'ladi. Istalgan null bo'lmagan obyektni tashlash mumkin, lekin DD: production sifatidagi kod odatda `Error` yoki
`Exception` ni amalga oshiradigan turlarni tashlaydi. Bir nechta `catch` bo'lsa, tashlangan obyekt turiga **birinchi mos
kelgani** ishlaydi.

### Kutubxonalar va `_`

DD (Libraries & imports): **har Dart fayli — kutubxona** (library), `library` direktivasi yozilmasa ham. Kutubxona —
**maxfiylik birligi**: `_` bilan boshlangan nomlar faqat o'sha kutubxona ichida ko'rinadi. Dart boshqa tillardagi
`public`, `protected`, `private` o'rniga shu qoidani ishlatadi.

`import` turlari (DD):

| Yozuv | Ma'nosi |
| --- | --- |
| `import 'dart:math';` | Dart'ning o'rnatilgan kutubxonasi (`dart:` sxemasi) |
| `import 'package:intl/intl.dart';` | paket kutubxonasi (`package:` sxemasi, pub boshqaradi) |
| `import 'fayl.dart';` | fayl yo'li bo'yicha |
| `import '…' as nom;` | nomlar to'qnashsa — prefiks bilan |
| `import '…' show a;` / `hide a;` | kutubxonaning faqat bir qismini olish / bir qismini chiqarib tashlash |

### Paketlar va pub

DD (How to use packages): Dart ekotizimi umumiy kutubxona va vositalarni **paketlar** bilan boshqaradi; paketlarni
**pub** paket menejeri oladi — ommaviy paketlar **pub.dev** saytida, yana lokal fayl tizimi yoki Git'dan. Pub versiya
bog'liqliklarini boshqaradi: bir-biriga va SDK versiyasiga mos versiyalarni tanlaydi.

Paket — kamida **`pubspec.yaml`** fayli bor papka. Paketdan foydalanish (DD):

1. `pubspec.yaml` da bog'liqlikni yozish — qo'lda yoki `dart pub add nom` bilan;
2. `dart pub get` — bog'liqliklarni olish (umumiy kesh — system cache'ga); `dart pub add` buni o'zi ham qiladi;
3. kerakli kutubxonani `import` qilish.

Flutter'da ham xuddi shu: `flutter pub add` va `pubspec.yaml` (35-bob).

### Effective Dart

DD (Effective Dart): Dart jamoasining uslub, hujjatlash, foydalanish va dizayn bo'yicha tavsiyalari. Kodni avtomatik
tekshirish uchun `dart create` loyihaga `lints` paketini (`dev_dependencies`) va `analysis_options.yaml` ni qo'shadi —
`dart analyze` shu qoidalar bo'yicha ham ogohlantiradi.

## Ko'rib chiqamiz

Loyiha yaratish:

```text vps
$ dart create -t console savat
Creating savat using template console...

  .gitignore
  analysis_options.yaml
  CHANGELOG.md
  pubspec.yaml
  README.md
  bin/savat.dart
  lib/savat.dart
  test/savat_test.dart

Running pub get...
  Resolving dependencies...
  Downloading packages...
  Changed 50 dependencies!

Created project savat in savat! In order to get started, run the following commands:

  cd savat
  dart run
```

pub.dev'dan paket qo'shish:

```text vps
$ dart pub add intl
Resolving dependencies...
Downloading packages...
+ clock 1.1.3
+ intl 0.20.3
Changed 2 dependencies!
```

`lib/savat.dart` — loyihaning kutubxonasi:

```dart
import 'package:intl/intl.dart';

/// Savatdagi xatolar uchun o'z istisno turimiz
class SavatXatosi implements Exception {
  final String sabab;
  SavatXatosi(this.sabab);

  @override
  String toString() => 'SavatXatosi: $sabab';
}

class Savat {
  // _ bilan boshlangan nom — faqat shu kutubxona (fayl) ichida ko'rinadi
  final Map<String, int> _narxlar = {};

  void qosh(String nom, int narx) {
    if (narx <= 0) throw SavatXatosi('$nom narxi musbat bo\'lishi kerak');
    _narxlar[nom] = narx;
  }

  int get jami => _narxlar.values.fold(0, (a, b) => a + b);
}

/// 1234567 -> "1,234,567 so'm" (intl paketidan NumberFormat)
String somda(int qiymat) => "${NumberFormat('#,###').format(qiymat)} so'm";
```

`bin/savat.dart` — dastur:

```dart
import 'package:savat/savat.dart';

void main() {
  var savat = Savat()
    ..qosh('Televizor', 4500000)
    ..qosh('Kabel', 85000);
  print('Jami: ${somda(savat.jami)}');

  // on — turi bo'yicha ushlash, catch — obyektni olish, finally — har doim
  try {
    savat.qosh('Sovg\'a', 0);
  } on SavatXatosi catch (e) {
    print('ushlandi: $e');
  } finally {
    print('tekshiruv tugadi');
  }

  // Ushlanmagan istisno: oddiy Dart xatosi
  try {
    int.parse('o\'n');
  } on FormatException catch (e) {
    print('FormatException: ${e.message}');
  }
}
```

```text vps
$ dart run
Jami: 4,585,000 so'm
ushlandi: SavatXatosi: Sovg'a narxi musbat bo'lishi kerak
tekshiruv tugadi
FormatException: Invalid radix-10 number
```

Natijada:

- `package:savat/savat.dart` — o'z loyihamiz kutubxonasi `package:` sxemasi bilan import qilindi;
- `NumberFormat` — pub.dev'dagi `intl` paketidan; summa `4,585,000` ko'rinishida chiqdi;
- `on SavatXatosi catch (e)` o'z istisno turimizni ushladi, `finally` baribir bajarildi;
- `int.parse('o\'n')` Dart'ning `FormatException` ini tashladi.

Kutubxona tashqarisidan `_` bilan boshlangan a'zoga murojaat (`bin/xato.dart`):

```dart
import 'package:savat/savat.dart';

void main() {
  var savat = Savat();
  print(savat._narxlar);
}
```

```text vps
$ dart analyze bin/xato.dart
Analyzing xato.dart...

  error - xato.dart:5:15 - The getter '_narxlar' isn't defined for the type 'Savat'. Try importing the library that defines '_narxlar', correcting the name to the name of an existing getter, or defining a getter or field named '_narxlar'. - undefined_getter

1 issue found.
```

Dart `_narxlar` ni boshqa kutubxonadan umuman ko'rmaydi — shuning uchun "isn't defined" xatosi.

## Tipik xatolar

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Satr yoki boshqa obyektni `throw` qilish (`throw 'xato'`) | Mumkin, lekin DD: production kod `Exception`/`Error` turlarini tashlaydi — ularni turi bo'yicha ushlash oson | `class MeningXatom implements Exception { … }` |
| Hammasini `catch (e)` bilan yutib yuborish | Dasturdagi haqiqiy xatolar ham yashirinadi | Kutilgan turlarni `on T` bilan ushlang; qolganini yuqoriga chiqaring |
| Resursni tozalashni `catch` ichida qilish | Istisno bo'lmasa yoki boshqa tur bo'lsa, tozalash bajarilmaydi | `finally` |
| `assert` ga production tekshiruvini ishonish | DD: production kodda `assert` e'tiborga olinmaydi | Haqiqiy tekshiruv — `if` + `throw` |
| Boshqa fayldan `_` a'zoga murojaat | `_` — kutubxonaga xususiy | Ochiq API (getter/metod) qo'shing |
| `pubspec.yaml` ni o'zgartirib, `pub get` qilmaslik | Bog'liqliklar olinmaydi, `import` ishlamaydi | `dart pub get` (yoki `dart pub add`) |

## Amaliyot

1. Dart'da istisnoni ushlash majburiymi? Java'dan farqi nima?
2. `on`, `catch` va `finally` farqi nima?
3. `rethrow` qachon kerak?
4. Dart'da `private` kalit so'zi bormi? Maxfiylik qanday ta'minlanadi?
5. `dart:`, `package:` va oddiy fayl yo'li bilan import farqi?
6. Loyihaga pub.dev'dagi paketni qo'shishning qadamlari qanday?

<details>
<summary>Javoblar</summary>

1. Yo'q. Dart istisnolari tekshirilmaydigan: metodlar ularni e'lon qilmaydi va ushlash majburiy emas (Java'da checked exception'lar e'lon qilinadi va ushlanadi).
2. `on T` — turi bo'yicha ushlash; `catch (e)` — istisno obyektini olish (turi ko'rsatilmasa — hammasini); `finally` — istisno bo'lsa ham, bo'lmasa ham bajariladigan kod.
3. Istisnoni qisman ishlab (masalan, log yozib), yuqoridagi chaqiruvchiga ham uzatish kerak bo'lganda.
4. Yo'q. `_` bilan boshlangan nom faqat o'z kutubxonasi (fayli) ichida ko'rinadi.
5. `dart:` — Dart'ning o'rnatilgan kutubxonalari; `package:` — paket menejeri (pub) bergan kutubxonalar, o'z loyihangiznikilari ham; fayl yo'li — nisbiy yo'l bilan boshqa fayl.
6. `dart pub add nom` (yoki `pubspec.yaml` ga yozib, `dart pub get`), keyin kodda `import 'package:nom/…';`.

</details>

## Rasmiy hujjat

- [DD: Error handling](https://dart.dev/language/error-handling)
- [DD: Libraries & imports](https://dart.dev/language/libraries)
- [DD: How to use packages](https://dart.dev/tools/pub/packages)
- [DD: Effective Dart](https://dart.dev/effective-dart)
