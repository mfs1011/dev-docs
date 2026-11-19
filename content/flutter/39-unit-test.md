# 39 — Unit test

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: `test` 1.32.0, `mockito` 5.8.1, `build_runner` 2.16.2. Bu bob — faqat kod
> va testlar.

## Tushuncha

### Uch xil test

FD (Testing Flutter apps):

| | Unit | Widget | Integration |
| --- | --- | --- | --- |
| Nimani sinaydi | bitta funksiya, metod yoki klass | bitta widget (boshqa freymvorklarda "komponent testi") | butun ilova yoki uning katta qismi |
| Ishonch | past | yuqoriroq | eng yuqori |
| Qo'llab-quvvatlash narxi | past | yuqoriroq | eng yuqori |
| Bog'liqliklar | oz | ko'proq | eng ko'p |
| Tezlik | tez | tez | sekin |

FD: yaxshi sinalgan ilovada **ko'p unit va widget test** (kod qamrovi — code coverage — bilan kuzatiladi) va barcha muhim
holatlarni qamraydigan **yetarli integration test** bo'ladi. Testlarni har o'zgarishda avtomatik ishga tushirish — CI (47-bob).

Bu bob — unit test; 40 — widget, 41 — integration.

### `test` paketi

FD (An introduction to unit testing):

- `flutter pub add dev:test` — `test` paketi Dart'da test yozishning asosi (web, server va Flutter uchun bir xil).
- Sinaladigan klass `lib/` da, test — `test/` papkasida; fayl nomi **`_test.dart`** bilan tugaydi — test ishga tushiruvchi
  fayllarni shu bo'yicha topadi.
- `test('tavsif', () { ... })` — bitta test; `expect(haqiqiy, kutilgan)` — tekshiruv.
- `group('nom', () { ... })` — bog'liq testlarni guruhlash; `flutter test --plain-name "nom"` bilan faqat shu guruh.
- Ishga tushirish: `flutter test` (hammasi) yoki `flutter test test/fayl_test.dart`; IDE'da ham (eng tez, to'xtash nuqtalari bilan).

`expect` ning ikkinchi argumenti — **matcher**: `isEmpty`, `isA<Kitob>()`, `throwsException`, `throwsUnsupportedError` va
boshqalar.

### Mock: tashqi bog'liqlikni almashtirish

FD (Mock dependencies using Mockito): unit test jonli veb-servis yoki bazaga bog'liq bo'lsa:

- testlar sekinlashadi;
- servis kutilmagan javob bersa, o'tib turgan test yiqila boshlaydi — **"beqaror test"** (flaky test);
- barcha muvaffaqiyat va xato holatlarini jonli servis bilan sinash qiyin.

Shuning uchun bog'liqlik **mock** bilan almashtiriladi: u jonli servisni taqlid qiladi va holatga qarab aniq natija qaytaradi.
Shart — funksiya `http.Client` ni **parametr** sifatida olsin (30, 34-boblardagi kabi).

`mockito` (FD):

1. `flutter pub add http dev:mockito dev:build_runner`
2. Test faylida `@GenerateMocks([], customMocks: [MockSpec<http.Client>(as: #MockHttpClient)])` — `MockHttpClient` klassi
   generatsiya qilinadi (nomi `package:http/testing.dart` dagi `MockClient` bilan adashmaslik uchun).
3. `dart run build_runner build` → `<test_fayli>.mocks.dart`.
4. `when(client.get(...)).thenAnswer((_) async => http.Response(...))` — "shunday so'rovga shunday javob".

30-bobdagi `MockClient` (http paketining o'zida) bilan farqi: `mockito` istalgan klassning mock'ini yaratadi va
`verify(...)` bilan chaqiruvlarni tekshira oladi.

## Ko'rib chiqamiz

```text vps
$ flutter pub add dev:test
+ test 1.32.0 (1.33.0 available)
Changed 27 dependencies!
$ flutter pub add http dev:mockito dev:build_runner
+ build_runner 2.16.2 (2.17.1 available)
+ http 1.6.0
+ mockito 5.8.1
Changed 17 dependencies!
```

(`build_runner` 2.17.1 emas, 2.16.2 tanlandi — `mockito` ning cheklovlari bilan kelishadigan eng yangisi.)

### Sinaladigan kod

`lib/savat.dart`:

```dart
class Kitob {
  const Kitob(this.nom, this.narx);

  final String nom;
  final int narx;
}

/// Sinaladigan "birlik" (unit): UI'siz, faqat mantiq
class Savat {
  final List<Kitob> _kitoblar = [];

  List<Kitob> get kitoblar => List.unmodifiable(_kitoblar);

  void qosh(Kitob k) => _kitoblar.add(k);

  void ochir(Kitob k) => _kitoblar.remove(k);

  int get jami => _kitoblar.fold(0, (s, k) => s + k.narx);

  /// 3 va undan ko'p kitobga 10% chegirma
  int get tolov => _kitoblar.length >= 3 ? jami - jami ~/ 10 : jami;
}
```

`lib/kitob_api.dart`:

```dart
import 'dart:convert';

import 'package:http/http.dart' as http;

import 'savat.dart';

/// http.Client parametr — testda mock beriladi (FD)
Future<Kitob> kitobOl(http.Client client, int id) async {
  final javob = await client.get(Uri.parse('https://api.example.com/kitoblar/$id'));
  if (javob.statusCode == 200) {
    final json = jsonDecode(javob.body) as Map<String, dynamic>;
    return Kitob(json['nom'] as String, json['narx'] as int);
  }
  throw Exception('Kitob olinmadi: ${javob.statusCode}');
}
```

### Testlar

`test/savat_test.dart`:

```dart
import 'package:salom/savat.dart';
import 'package:test/test.dart';

void main() {
  group('Savat', () {
    const dart = Kitob('Dart tili', 45000);
    const toza = Kitob('Toza kod', 80000);
    const algo = Kitob('Algoritmlar', 60000);

    test('boshida bo\'sh', () {
      final s = Savat();
      expect(s.kitoblar, isEmpty);
      expect(s.jami, 0);
    });

    test('qo\'shish jamini oshiradi', () {
      final s = Savat()
        ..qosh(dart)
        ..qosh(toza);
      expect(s.jami, 125000);
      expect(s.tolov, 125000); // 2 ta — chegirma yo'q
    });

    test('3 ta kitobga 10% chegirma', () {
      final s = Savat()
        ..qosh(dart)
        ..qosh(toza)
        ..qosh(algo);
      expect(s.jami, 185000);
      expect(s.tolov, 166500);
    });

    test('o\'chirish', () {
      final s = Savat()
        ..qosh(dart)
        ..ochir(dart);
      expect(s.kitoblar, isEmpty);
    });

    test('ro\'yxatni tashqaridan o\'zgartirib bo\'lmaydi', () {
      expect(() => Savat().kitoblar.add(dart), throwsUnsupportedError);
    });
  });
}
```

`test/kitob_api_test.dart`:

```dart
import 'package:http/http.dart' as http;
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:salom/kitob_api.dart';
import 'package:salom/savat.dart';
import 'package:test/test.dart';

import 'kitob_api_test.mocks.dart';

// FD'dagidek: package:http/testing.dart dagi MockClient bilan adashmaslik uchun nomi MockHttpClient
@GenerateMocks([], customMocks: [MockSpec<http.Client>(as: #MockHttpClient)])
void main() {
  group('kitobOl', () {
    final manzil = Uri.parse('https://api.example.com/kitoblar/3');

    test('200 — Kitob qaytaradi', () async {
      final client = MockHttpClient();
      when(client.get(manzil)).thenAnswer((_) async => http.Response('{"nom": "Toza kod", "narx": 80000}', 200));

      final k = await kitobOl(client, 3);
      expect(k, isA<Kitob>());
      expect(k.nom, 'Toza kod');
      verify(client.get(manzil)).called(1); // so'rov aynan bir marta yuborildi
    });

    test('404 — istisno', () {
      final client = MockHttpClient();
      when(client.get(manzil)).thenAnswer((_) async => http.Response('Not Found', 404));

      expect(kitobOl(client, 3), throwsException);
    });
  });
}
```

Mock'ni generatsiya qilamiz (31-bobdagidek, Flutter ichidagi `dart`):

```text vps
$ dart run build_runner build
  6s mockito:mockBuilder on 2 inputs: 1 output; spent 5s sdk; test/savat_test.dart
  6s mockito:mockBuilder on 2 inputs: 1 output, 1 no-op; spent 5s sdk
  Built with build_runner/aot in 111s; wrote 1 output.
$ ls test
kitob_api_test.dart
kitob_api_test.mocks.dart
savat_test.dart
```

```text vps
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/kitob_api_test.dart
00:00 +0: /home/dasturchi/flutter/salom/test/kitob_api_test.dart: kitobOl 200 — Kitob qaytaradi
00:00 +1: /home/dasturchi/flutter/salom/test/kitob_api_test.dart: kitobOl 404 — istisno
00:00 +2: loading /home/dasturchi/flutter/salom/test/savat_test.dart
00:01 +2: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat boshida bo'sh
00:01 +3: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat qo'shish jamini oshiradi
00:01 +4: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat 3 ta kitobga 10% chegirma
00:01 +5: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat o'chirish
00:01 +6: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat ro'yxatni tashqaridan o'zgartirib bo'lmaydi
00:01 +7: All tests passed!
```

Faqat bitta guruh:

```text vps
$ flutter test --plain-name Savat
00:00 +4: /home/dasturchi/flutter/salom/test/savat_test.dart: Savat ro'yxatni tashqaridan o'zgartirib bo'lmaydi
00:00 +5: All tests passed!
```

### Kod qamrovi (coverage)

`flutter test --coverage` — qaysi qatorlar testda ishlaganini `coverage/lcov.info` ga yozadi. Fayl bo'yicha "ishlagan/jami
qator" ni `awk` bilan chiqardik:

```text vps
$ flutter test --coverage
00:05 +7: All tests passed!
lcov.info
lib/kitob_api.dart: 6/6
lib/savat.dart: 6/6
```

Ikkala faylning har bir qatori kamida bir test ichida bajarilgan. Qamrov — qaysi kod umuman sinalmaganini ko'rsatadi; lekin
100% "xato yo'q" degani emas: chegaraviy qiymatlar (7-mashq) alohida o'ylanadi.

## Tipik xatolar

`test/xato_test.dart` — ataylab xato yozilgan ikki test:

```dart
// Ataylab xato yozilgan testlar — chiqishni ko'rish uchun
import 'package:http/http.dart' as http;
import 'package:mockito/mockito.dart';
import 'package:salom/kitob_api.dart';
import 'package:salom/savat.dart';
import 'package:test/test.dart';

import 'kitob_api_test.mocks.dart';

void main() {
  final manzil = Uri.parse('https://api.example.com/kitoblar/3');

  test('await unutilgan', () {
    final client = MockHttpClient();
    when(client.get(manzil)).thenAnswer((_) async => http.Response('{"nom": "a", "narx": 1}', 200));
    expect(kitobOl(client, 3), isA<Kitob>());
  });

  test('stub yo\'q', () async {
    await kitobOl(MockHttpClient(), 3);
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: await unutilgan
00:00 +0 -1: await unutilgan [E]
  Expected: <Instance of 'Kitob'>
    Actual: <Instance of 'Future<Kitob>'>
     Which: is not an instance of 'Kitob'
  
  test/xato_test.dart 16:5  main.<fn>
  
00:00 +0 -1: stub yo'q
00:00 +0 -2: stub yo'q [E]
  MissingStubError: 'get'
  No stub was found which matches the arguments of this method call:
  get(https://api.example.com/kitoblar/3, {headers: null})
  
  Add a stub for this method using Mockito's 'when' API, or generate the MockHttpClient mock with the @GenerateNiceMocks annotation (see https://pub.dev/documentation/mockito/latest/annotations/MockSpec-class.html).
  test/kitob_api_test.mocks.dart 64:14  MockHttpClient.get
  test/xato_test.dart 20:11             main.<fn>
  
00:00 +0 -2: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/xato_test.dart: await unutilgan
  /home/dasturchi/flutter/salom/test/xato_test.dart: stub yo'q
```

Fayl nomi `_test.dart` bilan tugamasa (`test/narx_tekshiruv.dart`, ichida yiqiladigan test):

```text vps
$ ls test
kitob_api_test.dart
kitob_api_test.mocks.dart
narx_tekshiruv.dart
savat_test.dart
$ flutter test
00:01 +7: All tests passed!
```

Test **umuman ishga tushmadi** (avvalgidek 7 ta, hammasi o'tdi) — yiqiladigan test e'tiborsiz qoldi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `Actual: <Instance of 'Future<Kitob>'>` | `Future` kutilmagan (`await` yo'q) | `expect(await kitobOl(...), isA<Kitob>())`; xato uchun — `expect(future, throwsException)` |
| `MissingStubError: 'get'` | Mock'da bu chaqiruv uchun `when(...)` yo'q | Har ishlatiladigan chaqiruvga `when(...).thenAnswer(...)` |
| Test ishga tushmaydi | Fayl nomi `_test.dart` bilan tugamaydi | `narx_test.dart` (FD) |
| `kitob_api_test.mocks.dart` topilmaydi | Generator ishga tushirilmagan | `dart run build_runner build` |
| Test jonli serverga boradi, ba'zan yiqiladi | Bog'liqlik ichkarida yaratilgan (`http.get`) | `http.Client` ni parametr qilib, testda mock bering (FD) |
| Bitta test ichida hamma narsa | Qaysi qism buzilgani noma'lum | Har holatga alohida `test`, mavzu bo'yicha `group` |

## Amaliyot

1. Unit, widget va integration testning farqi nima (FD jadvali bo'yicha)?
2. Test fayllari qayerda va qanday nomlanadi?
3. `group` nima uchun? Faqat bitta guruhni qanday ishga tushirasiz?
4. FD nega jonli servis o'rniga mock tavsiya qiladi?
5. `when(...).thenAnswer(...)` va `verify(...)` nima qiladi?
6. `flutter test --coverage` nima beradi? 100% qamrov xato yo'qligini bildiradimi?
7. Har biri 33 333 so'mlik uch kitob savatda. `tolov` qancha bo'ladi? Shu holat uchun test yozing.

<details>
<summary>Javoblar</summary>

1. Unit — bitta funksiya/klass; widget — bitta widget; integration — butun ilova. Ishonch va narx unit → integration tomon
   oshadi, tezlik kamayadi.
2. Loyiha ildizidagi `test/` papkasida, nomi `_test.dart` bilan tugaydi.
3. Bog'liq testlarni birlashtirish uchun; `flutter test --plain-name "Savat"`.
4. Jonli servis testni sekinlashtiradi, beqaror (flaky) qiladi va barcha holatlarni sinashni qiyinlashtiradi.
5. `when` — mock'ga "shu chaqiruvga shu javob"ni o'rgatadi; `verify` — chaqiruv bo'lganini (va necha marta) tekshiradi.
6. Qaysi qator testda bajarilganini (`coverage/lcov.info`). Yo'q — qator bajarilgani uning hamma holatda to'g'ri ishlashini
   bildirmaydi.
7. Jami 99 999; chegirma `99999 ~/ 10 = 9999`; to'lov **90 000**. Test: uch marta `qosh(Kitob('K$i', 33333))`, keyin
   `expect(s.tolov, 90000)`. VPS'da: `jami=99999, tolov=90000`, test o'tdi. Butun songa bo'lish (`~/`) kasr qismini tashlaydi —
   chegirma 9 999,9 emas, 9 999 bo'ladi, ya'ni yaxlitlash do'kon foydasiga. Bunday qarorni test aniq qayd etadi.

</details>

## Rasmiy hujjat

- [FD: Testing Flutter apps](https://docs.flutter.dev/testing/overview)
- [FD: An introduction to unit testing](https://docs.flutter.dev/cookbook/testing/unit/introduction)
- [FD: Mock dependencies using Mockito](https://docs.flutter.dev/cookbook/testing/unit/mocking)
- [test (pub.dev)](https://pub.dev/packages/test) · [mockito (pub.dev)](https://pub.dev/packages/mockito)
