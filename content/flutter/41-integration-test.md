# 41 — Integration test

[Mundarija](README.md)

> Butun ilova VPS'da (Ubuntu 26.04, Flutter 3.50.0) **Linux desktop** ilovasi sifatida, virtual ekranda (`xvfb`) sinaldi — FD
> buni rasmiy usullardan biri sifatida ko'rsatadi. ⚑ Android/iOS qurilmasida, web'da (ChromeDriver) va Firebase Test Lab'da
> ishga tushirish — hujjat asosida, sinalmagan.

## Tushuncha

### Nima uchun

FD (Integration testing concepts): unit va widget testlar alohida klass, funksiya yoki widget'ni tekshiradi; ular qismlarning
**birgalikda** ishlashini va haqiqiy qurilmadagi unumdorlikni tekshirmaydi. Buning uchun **integration test** — butun ilovani
tekshiradi; boshqa nomlari: end-to-end (E2E) yoki GUI test.

Atamalar (FD):

- **host machine** — siz ishlayotgan kompyuter;
- **target device** — ilova ishlaydigan qurilma: telefon, brauzer yoki desktop ilova.

Vositalar (FD):

- **`integration_test`** — Flutter SDK'ning rasmiy paketi: testlar nishon qurilmada ishlaydi, host'dan `flutter test
  integration_test` bilan ishga tushiriladi, `flutter_test` API'larini (`find`, `tap`, `pumpAndSettle` ...) ishlatadi. Lekin
  **native platforma UI'si** (ruxsat dialogi, bildirishnoma) bilan ishlay olmaydi.
- **`patrol`** — jamiyat paketi: native UI bilan ham ishlay oladi.

### Sozlash va ishga tushirish

FD (Write and run an integration test):

1. `flutter pub add "dev:integration_test:{sdk: flutter}"`
2. Testlar alohida papkada: `integration_test/app_test.dart`.
3. Test boshida `IntegrationTestWidgetsFlutterBinding.ensureInitialized();`
4. Ishga tushirish:

| Nishon | Buyruq (FD) |
| --- | --- |
| Desktop (Linux, macOS, Windows) | `flutter test integration_test/app_test.dart` (yoki `-d linux`) |
| Android / iOS qurilma | qurilmani ulab, `flutter test integration_test/app_test.dart` — test tugagach ilova o'chirilganini tekshiring ⚑ |
| Web | ChromeDriver (`chromedriver --port=4444`), `test_driver/integration_test.dart` va `flutter drive --driver=... --target=... -d chrome` (ekransiz — `-d web-server`) ⚑ |
| Firebase Test Lab | Android — Gradle bilan APK'lar, iOS — Xcode testlari ⚑ |

**Linux va CI** (FD): Linux ilovasini sinash uchun avval X server kerak — CI'da test `xvfb-run` bilan ishga tushiriladi
(`flutter test integration_test -d linux -r github`).

Linux desktop uchun FD (Set up Linux development) talab qiladigan paketlar: `clang cmake ninja-build pkg-config libgtk-3-dev
libstdc++-12-dev`.

## Ko'rib chiqamiz

40-bobdagi kitoblar ilovasini (`lib/main.dart` o'zgarishsiz) butunligicha sinaymiz.

### VPS'ni tayyorlash

```text vps
$ apt-get install -y clang cmake ninja-build pkg-config libgtk-3-dev libstdc++-12-dev xvfb
...
$ flutter doctor -v
[✓] Linux toolchain - develop for Linux desktop [429ms]
    • Ubuntu clang version 21.1.8 (6ubuntu1)
    • cmake version 4.2.3
    • ninja version 1.13.2
    • pkg-config version 2.5.1
    ! Unable to access driver information using 'eglinfo'.
      It is likely available from your distribution (e.g.: apt install mesa-utils)
$ flutter devices
  Linux (desktop) • linux • linux-x64 • Ubuntu 26.04.1 LTS 7.0.0-43-generic
```

(`xvfb` — FD'dagi Linux CI uchun; ekransiz serverda virtual X ekran.)

Loyihaga Linux platformasini va paketni qo'shamiz:

```text vps
$ flutter create . --platforms linux
  $ flutter run

Your application code is in ./lib/main.dart.

$ flutter pub add "dev:integration_test:{sdk: flutter}"
+ integration_test 0.0.0 from sdk flutter
Changed 6 dependencies!
  integration_test:
    sdk: flutter
$ ls linux
CMakeLists.txt
flutter
runner
```

### Test

`integration_test/app_test.dart` — ilovaning haqiqiy `main()` i chaqiriladi, xuddi foydalanuvchi ochgandek:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart' as ilova;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('Kitoblar ilovasi (to\'liq)', () {
    testWidgets('qo\'shish va surib o\'chirish', (tester) async {
      ilova.main(); // haqiqiy main() — xuddi foydalanuvchi ochgandek
      await tester.pumpAndSettle();
      expect(find.text('Kitoblar (2)'), findsOneWidget);
      final oyna = tester.view.physicalSize / tester.view.devicePixelRatio;
      debugPrint('oyna: $oyna');

      await tester.enterText(find.byKey(const Key('nom_maydoni')), 'Algoritmlar');
      await tester.tap(find.byTooltip('Qo\'shish'));
      await tester.pumpAndSettle();
      expect(find.text('Kitoblar (3)'), findsOneWidget);

      // Surish masofasi — qatorning to'liq eni (oyna o'lchamiga bog'liq emas)
      final eni = tester.getSize(find.byType(Dismissible).first).width;
      await tester.drag(find.text('Dart tili'), Offset(eni, 0));
      await tester.pumpAndSettle();
      expect(find.text('Dart tili'), findsNothing);
      expect(find.text('Kitoblar (2)'), findsOneWidget);
      debugPrint('qo\'shildi va o\'chirildi: ${find.textContaining('Kitoblar').evaluate().map((e) => (e.widget as Text).data).single}');
    });
  });
}
```

`xvfb` siz:

```text vps
$ flutter test integration_test -d linux
00:00 +0 -1: loading /home/dasturchi/flutter/salom/integration_test/app_test.dart [E]
  Failed to load "/home/dasturchi/flutter/salom/integration_test/app_test.dart": Unable to start the app on the device.
00:00 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/integration_test/app_test.dart: loading /home/dasturchi/flutter/salom/integration_test/app_test.dart
```

FD bu holatda `Error waiting for a debug connection: The log reader stopped unexpectedly, or never started.` xatosini keltiradi;
bizda Flutter 3.50.0 qisqaroq `Unable to start the app on the device.` dedi — ma'nosi bir: ilovani ochadigan ekran yo'q.

Virtual ekran bilan:

```text vps
$ xvfb-run -a flutter test integration_test -d linux
00:00 +0: loading /home/dasturchi/flutter/salom/integration_test/app_test.dart
Building Linux application...                                   
✓ Built build/linux/x64/debug/bundle/salom
00:00 +0: Kitoblar ilovasi (to'liq) qo'shish va surib o'chirish
oyna: Size(1280.0, 720.0)
qo'shildi va o'chirildi: Kitoblar (2)
00:05 +1: (tearDownAll)
00:05 +1: All tests passed!
```

- Flutter avval haqiqiy **Linux ilovasini yig'di** (`build/linux/x64/debug/bundle/salom`), keyin uni ishga tushirib, testni
  shu ilova ichida bajardi.
- Oyna — **1280×720** (widget testida standart 800×600 edi).
- Butun ssenariy: ilova ochildi → yozildi → qo'shildi → surib o'chirildi → sarlavha `Kitoblar (2)`.

## Tipik xatolar

Testning birinchi variantida 40-bobdagidek `drag(..., const Offset(500, 0))` yozilgan edi:

```text vps
The following TestFailure was thrown running a test:
Expected: no matching candidates
  Actual: _TextWidgetFinder:<Found 1 widget with text "Dart tili": [
            Text-[<'kitob_0'>]("Dart tili", dependencies: [DefaultSelectionStyle, DefaultTextStyle,
MediaQuery]),
          ]>
   Which: means one was found but none were expected
```

800 px kenglikdagi widget testida 500 px surish `Dismissible` uchun yetardi; 1280 px oynada — yo'q. Integration test
**haqiqiy ekran o'lchamida** ishlaydi — masofalarni piksel bilan qattiq yozmang, elementning o'lchamidan oling
(`tester.getSize(...)`).

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `Unable to start the app on the device.` (Linux, CI) | X server (ekran) yo'q | `xvfb-run -a flutter test integration_test -d linux` (FD) |
| Widget testida o'tgan surish/bosish integration testda ishlamaydi | Haqiqiy oyna o'lchami boshqa | Masofani element o'lchamidan oling |
| Ruxsat dialogini bosib bo'lmaydi | `integration_test` native UI bilan ishlamaydi (FD) | `patrol` paketi (FD) |
| Keyingi testlar telefonda yiqiladi | Oldingi test ilovasi qurilmada qolgan | Ilova o'chirilganini tekshiring (FD) |
| `IntegrationTestWidgetsFlutterBinding` chaqirilmagan | Test qurilmada emas, oddiy test muhitida ishlaydi | `main()` boshida `ensureInitialized()` (FD) |
| Hamma narsani integration test bilan sinash | Sekin, qimmat (39-bobdagi jadval) | Ko'p unit/widget test + muhim ssenariylar uchun integration (FD) |

## Amaliyot

1. Integration test widget testidan nimasi bilan farq qiladi?
2. `integration_test` va `patrol` farqi nima?
3. Integration testlar qaysi papkada? Test boshida nima chaqiriladi?
4. Linux'da (CI'da) integration test nega `xvfb-run` bilan?
5. Web'da integration test uchun nima kerak?
6. Nega 40-bobdagi `Offset(500, 0)` bu yerda ishlamadi?
7. Ilovani `main()` o'rniga `pumpWidget(KitoblarIlovasi(boshlangich: [...]))` bilan 50 kitob bilan oching va "Kitob 49" ni
   toping. Boshida va aylantirilgandan keyin nechta topiladi?

<details>
<summary>Javoblar</summary>

1. Widget testi — bitta widget, test muhitida (800×600, test shrifti); integration — butun ilova, nishon qurilmada (bizda Linux
   ilovasi, 1280×720).
2. `integration_test` — SDK'da, native UI bilan ishlamaydi; `patrol` — jamiyat paketi, native UI (ruxsat, bildirishnoma) bilan
   ham.
3. `integration_test/`; `IntegrationTestWidgetsFlutterBinding.ensureInitialized()`.
4. Linux ilovasi oyna ochadi — X server kerak; serverda ekran yo'q, `xvfb` virtual ekran beradi.
5. ChromeDriver, `test_driver/integration_test.dart` (`integrationDriver()`) va `flutter drive ... -d chrome` (yoki `web-server`).
6. Oyna 1280 px — `Dismissible` uchun 500 px kam; masofani qator enidan olish kerak.
7. `testWidgets` ichida `pumpWidget(KitoblarIlovasi(boshlangich: [for (var i = 0; i < 50; i++) 'Kitob $i']))`, keyin
   `scrollUntilVisible(find.text('Kitob 49'), 300, scrollable: ...)` (ro'yxatning `Scrollable` i — 40-bob). VPS'da Linux'da:
   `boshida: 0 ta`, `aylantirilgandan keyin: 1 ta`.

</details>

## Rasmiy hujjat

- [FD: Integration testing concepts](https://docs.flutter.dev/cookbook/testing/integration/introduction)
- [FD: Write and run an integration test](https://docs.flutter.dev/testing/integration-tests)
- [FD: Set up Linux development](https://docs.flutter.dev/platform-integration/linux/setup)
- [integration_test (GitHub)](https://github.com/flutter/flutter/tree/main/packages/integration_test) · [patrol (pub.dev)](https://pub.dev/packages/patrol)
