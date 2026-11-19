# 42 — Debug va xatolar

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: debug rejimi — `flutter test`, release rejimi — `flutter build web` va
> brauzer (konsol xabarlari haqiqiy). DevTools (grafik debugger) bu bobda ishlatilmagan.

## Tushuncha

### Rejimlar

FD (Flutter's build modes) — xatolarni qanday ko'rishingiz rejimga bog'liq:

| | Debug | Release |
| --- | --- | --- |
| `assert` | **ishlaydi** | **o'chiq** |
| Debugging, servis kengaytmalari | yoqilgan | o'chiq |
| Hot reload | faqat shu rejimda | — |
| Web | `dartdevc`, kichraytirilmagan | `dart2js`, kichraytirilgan (minified), tree shaking |
| Buyruq | `flutter run` (standart) | `flutter run --release`, `flutter build ...` |

Rejimni kodda bilish: `kDebugMode`, `kReleaseMode`, `kProfileMode` (`package:flutter/foundation.dart`).

### Chiqarish (log)

FD (Use a debugger / Debug Flutter apps from code):

| Usul | Qayerdan | Izoh (FD) |
| --- | --- | --- |
| `print()` | `dart:core` | oddiy chiqish |
| `debugPrint()` | `foundation` | chiqish ko'p bo'lsa qatorlar tashlab yuborilmasin; debug tekshiruvi yoki `assert` ichida bo'lmasa, release'da ham chiqadi |
| `log()` | `dart:developer` | batafsilroq: `name:` (kategoriya), `error:` |
| `debugger(when: ...)` | `dart:developer` | shart bajarilganda to'xtash nuqtasi |

Daraxtni ko'rish: `debugDumpApp()` — widget daraxti (build paytida chaqirib bo'lmaydi), `debugDumpRenderTree()` — render
daraxti (`size` va `constraints` ga qarang: cheklovlar pastga, o'lchamlar yuqoriga — 16-bob).

### Xatolarni ushlash

FD (Handling errors in Flutter):

- **`FlutterError.onError`** — Flutter o'z callback'lari ichida (build, layout, paint, tugma ishlovchisi ...) ushlagan
  hamma xato shu yerga keladi. Standart holatda `FlutterError.presentError` — qurilma logiga. O'zingiznikini bersangiz ham
  `presentError` ni chaqiring; xatoni log servisiga yuborish uchun ham shu joy.
- **`PlatformDispatcher.instance.onError`** — Flutter callback'i chaqiruvlar stekida **bo'lmagan** xatolar (masalan, `async`
  funksiya ichidagi plagin chaqiruvi). `true` qaytarsa — ushlandi.
- **`ErrorWidget.builder`** — build paytida xato bo'lsa, buzilgan widget o'rnida shu widget chiziladi. Standart: debug'da
  qizil xato matni, release'da kulrang fon. O'z ko'rinishingiz — `MaterialApp.builder` ichida.

### Ko'p uchraydigan xatolar

FD (Common Flutter errors) ro'yxatidan 16-bobda ko'rilmaganlari:

| Xato | Sabab va tuzatish (FD) |
| --- | --- |
| `An InputDecorator...cannot have an unbounded width` | `TextField` `Row` ichida — kengligi cheklanmagan. `Expanded` yoki `SizedBox` ga o'rang |
| `Incorrect use of ParentData widget` | `Expanded`/`Flexible` faqat `Row`/`Column`/`Flex` ichida, `Positioned` — `Stack` ichida |
| `setState called during build` | `build` ichida `setState` yoki `showDialog` — ularni hodisa ishlovchisiga (masalan, `onPressed`) ko'chiring |
| `RenderBox was not laid out` | Odatda boshqa xatoning oqibati — birinchi xatoni tuzating |
| Qizil yoki kulrang ekran | Debug/profile'da qizil, release'da kulrang: konsoldagi xatoni o'qing |

## Ko'rib chiqamiz

Uch tugma — uch xil xato: build'dagi xato, `async` xato va `assert`. `lib/main.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  // 1. Flutter callback'lari ichidagi xatolar (build, layout, paint, tugma bosilishi)
  FlutterError.onError = (details) {
    FlutterError.presentError(details); // konsolga (debug'da to'liq)
    debugPrint('[FlutterError.onError] ${details.exceptionAsString()}');
  };
  // 2. Flutter callback'idan tashqaridagi xatolar (masalan, async)
  PlatformDispatcher.instance.onError = (error, stack) {
    debugPrint('[PlatformDispatcher.onError] $error');
    return true; // ushlandi
  };
  runApp(const XatolarIlovasi());
}

int chegirmaliNarx(int narx) {
  assert(narx >= 0, 'narx manfiy: $narx'); // faqat debug'da tekshiriladi
  return narx * 9 ~/ 10;
}

class XatolarIlovasi extends StatelessWidget {
  const XatolarIlovasi({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      // FD: build'da xato bo'lsa, buzilgan widget o'rniga ko'rsatiladigan widget
      builder: (context, widget) {
        ErrorWidget.builder = (details) => Container(
              color: Colors.amber.shade100,
              padding: const EdgeInsets.all(8),
              child: Text('Bu qism chizilmadi (${kReleaseMode ? 'release' : 'debug'})'),
            );
        return widget!;
      },
      home: const XatolarSahifasi(),
    );
  }
}

class XatolarSahifasi extends StatefulWidget {
  const XatolarSahifasi({super.key});

  @override
  State<XatolarSahifasi> createState() => _XatolarSahifasiState();
}

class _XatolarSahifasiState extends State<XatolarSahifasi> {
  bool _buzuqKorinsin = false;
  String _natija = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Rejim: ${kReleaseMode ? 'release' : kProfileMode ? 'profile' : 'debug'}')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          OutlinedButton(
            onPressed: () => setState(() => _buzuqKorinsin = true),
            child: const Text('Build xatosi'),
          ),
          if (_buzuqKorinsin) const BuzuqWidget(),
          OutlinedButton(
            onPressed: () {
              Future<void>.delayed(Duration.zero, () => throw StateError('server javob bermadi'));
            },
            child: const Text('Async xato'),
          ),
          OutlinedButton(
            onPressed: () => setState(() => _natija = 'chegirmaliNarx(-5000) = ${chegirmaliNarx(-5000)}'),
            child: const Text('assert'),
          ),
          Text(_natija),
        ],
      ),
    );
  }
}

class BuzuqWidget extends StatelessWidget {
  const BuzuqWidget({super.key});

  @override
  Widget build(BuildContext context) => throw StateError('BuzuqWidget qurilmadi');
}
```

### Debug rejimi: `flutter test`

`test/widget_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  // Ilova ErrorWidget.builder'ni o'zgartiradi. flutter_test test tanasi tugashi bilan buni
  // tekshiradi (tearDown'dan oldin) — shuning uchun test oxirida o'zimiz qaytaramiz.
  final asl = ErrorWidget.builder;

  testWidgets('Build xatosi → ErrorWidget', (tester) async {
    await tester.pumpWidget(const XatolarIlovasi());
    debugPrint('sarlavha: ${find.textContaining('Rejim').evaluate().map((e) => (e.widget as Text).data).single}');
    await tester.tap(find.text('Build xatosi'));
    await tester.pump();
    debugPrint('xato: ${tester.takeException()}');
    debugPrint('ekranda: ${find.textContaining('chizilmadi').evaluate().map((e) => (e.widget as Text).data).join()}');
    ErrorWidget.builder = asl;
  });

  testWidgets('assert debug\'da ishlaydi', (tester) async {
    await tester.pumpWidget(const XatolarIlovasi());
    await tester.tap(find.text('assert'));
    await tester.pump();
    debugPrint('xato: ${tester.takeException().toString().split('\n').first}');
    ErrorWidget.builder = asl;
  });

  test('print va debugPrint', () {
    // ignore: avoid_print
    print('print: oddiy chiqish');
    debugPrint('debugPrint: Flutter\'ning chiqishi');
  });
}
```

```text vps
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Build xatosi → ErrorWidget
sarlavha: Rejim: debug
xato: Bad state: BuzuqWidget qurilmadi
ekranda: Bu qism chizilmadi (debug)
00:02 +1: assert debug'da ishlaydi
xato: 'package:salom/main.dart': Failed assertion: line 19 pos 10: 'narx >= 0': narx manfiy: -5000
00:03 +2: print va debugPrint
print: oddiy chiqish
debugPrint: Flutter'ning chiqishi
00:03 +3: All tests passed!
```

- Build xatosi ilovani yiqitmadi: `BuzuqWidget` o'rnida bizning `ErrorWidget` (`Bu qism chizilmadi (debug)`).
- `assert` debug'da ishladi: `Failed assertion ... narx manfiy: -5000`.

### Release rejimi: brauzerda

Xuddi shu ilova `flutter build web` (release) bilan. Tugmalar ketma-ket bosildi: `assert` → `Async xato` → `Build xatosi`.
Brauzer konsoli (Playwright; JS stek qatorlarining bittasi qoldirildi):

```text tashqi
--- bosildi: assert
--- bosildi: Async xato
pageerror: Error
--- bosildi: Build xatosi
console: Bad state: BuzuqWidget qurilmadi
console: at Object.al (http://localhost:8747/main.dart.js:3877:30)
console: [FlutterError.onError] Bad state: BuzuqWidget qurilmadi
```

<img src="/rasmlar/flutter/42-release.png" alt="Release: sarlavha Rejim: release, Bu qism chizilmadi (release), chegirmaliNarx(-5000) = -4500" width="320">

- **`assert` o'chiq**: `chegirmaliNarx(-5000) = -4500` — manfiy narx hech qanday ogohlantirishsiz o'tdi. `assert` — faqat
  dasturchi uchun tekshiruv; foydalanuvchi ma'lumotini tekshirishga yaramaydi.
- **Build xatosi**: `FlutterError.onError` ishladi (`[FlutterError.onError] Bad state: ...`), ekranda bizning `ErrorWidget`.
  Stekda funksiya nomlari qisqartirilgan (`Object.al`, `A6.T`) — release'dagi minify (38-bob).
- **Async xato**: bizning web sinovida `PlatformDispatcher.onError` **chaqirilmadi** — brauzer uni sahifadagi ushlanmagan xato
  (`pageerror: Error`) sifatida oldi; xabar matni ham qisqartirilgan. Web'da async xatolarni log servisiga yuborish uchun bu
  ishlovchiga tayanmaslik, `try`/`catch` (yoki 34-bobdagi `Result`) bilan ushlash kerak.

## Tipik xatolar

`test/xato_test.dart` — FD ro'yxatidagi xatolar va `debugDumpApp` ga o'xshash daraxt chiqishi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

String birinchi(Object? e) => e.toString().split('\n').first;

void main() {
  testWidgets('TextField Row ichida', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Material(child: Row(children: [TextField()]))));
    debugPrint(birinchi(tester.takeException()));
  });

  testWidgets('Expanded Stack ichida', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Stack(children: [Expanded(child: Text('a'))])));
    debugPrint(birinchi(tester.takeException()));
  });

  testWidgets('build ichida setState', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: BuildDaSetState()));
    debugPrint(birinchi(tester.takeException()));
  });

  testWidgets('debugDumpApp', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Text('salom')));
    final daraxt = tester.binding.rootElement!.toStringDeep().split('\n');
    debugPrint('daraxtda ${daraxt.length} qator; boshi:\n${daraxt.take(4).join('\n')}');
  });
}

class BuildDaSetState extends StatefulWidget {
  const BuildDaSetState({super.key});

  @override
  State<BuildDaSetState> createState() => _BuildDaSetStateState();
}

class _BuildDaSetStateState extends State<BuildDaSetState> {
  var korildi = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('$korildi'),
      // Bola o'zining build'ida otaning setState'ini chaqiradi — xato joy
      Bola(onBuild: () => setState(() => korildi++)),
    ]);
  }
}

class Bola extends StatelessWidget {
  const Bola({super.key, required this.onBuild});

  final VoidCallback onBuild;

  @override
  Widget build(BuildContext context) {
    onBuild();
    return const Text('bola');
  }
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: TextField Row ichida
An InputDecorator, which is typically created by a TextField, cannot have an unbounded width.
00:02 +1: Expanded Stack ichida
Incorrect use of ParentDataWidget.
00:02 +2: build ichida setState
setState() or markNeedsBuild() called during build.
00:03 +3: debugDumpApp
daraxtda 160 qator; boshi:
[root]
└View(state: _ViewState#1c339)
00:03 +4: All tests passed!
```

Testda bitta tuzoq ham chiqdi: ilova `ErrorWidget.builder` ni o'zgartirgani uchun test shunday yiqildi:

```text vps
The following assertion was thrown:
The value of ErrorWidget.builder was changed by the test.
```

`flutter_test` buni test tanasi tugashi bilan (`tearDown` dan **oldin**) tekshiradi — shuning uchun asl qiymat test oxirida
qaytariladi (`ErrorWidget.builder = asl;`).

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Release'da noto'g'ri qiymat jimgina o'tdi | `assert` release'da o'chiq | Foydalanuvchi ma'lumotini oddiy `if` + xato/`Result` bilan tekshiring |
| Qizil/kulrang ekran, foydalanuvchi hech narsa tushunmaydi | Build xatosi, `ErrorWidget` standart | `MaterialApp.builder` da o'z `ErrorWidget.builder` ingiz (FD) |
| Xatolar log servisiga yetmaydi | `FlutterError.onError` faqat Flutter callback'laridagi xatolarni oladi | `PlatformDispatcher.instance.onError` ham; web'da async xatolarni `try`/`catch` bilan |
| `An InputDecorator ... unbounded width` | `TextField` `Row` ichida | `Expanded(child: TextField())` (FD) |
| `Incorrect use of ParentDataWidget.` | `Expanded` `Stack` ichida | `Expanded` — `Row`/`Column` da, `Stack` da — `Positioned` (FD) |
| `setState() or markNeedsBuild() called during build.` | Bola `build` ida otaning `setState` i | Hodisa ishlovchisida chaqiring (FD) |
| `The value of ErrorWidget.builder was changed by the test.` | Test global qiymatni o'zgartirdi | Test oxirida asl qiymatni qaytaring |
| Uzun chiqishning bir qismi yo'qoladi | `print` ko'p qatorni tashlab yuborishi mumkin | `debugPrint` (FD) |

## Amaliyot

1. Debug va release rejimlari xatolar nuqtai nazaridan nimasi bilan farq qiladi?
2. `print`, `debugPrint` va `log` farqi nima?
3. `FlutterError.onError` va `PlatformDispatcher.instance.onError` qaysi xatolarni oladi?
4. `ErrorWidget.builder` qachon ishlaydi? Uni qayerda o'rnatish tavsiya etiladi?
5. Nega `assert` bilan foydalanuvchi kiritgan narxni tekshirish xato?
6. `TextField` ni `Row` ichiga qo'yganda qanday xato chiqadi va qanday tuzatiladi?
7. `chegirmaliNarx` release'da ham manfiy narxni qabul qilmasin. Nima o'zgaradi? Debug va release'da nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Debug: `assert` ishlaydi, to'liq xato matnlari, qizil xato ekrani, hot reload. Release: `assert` o'chiq, kod
   kichraytirilgan (nomlar `minified`), kulrang xato ekrani.
2. `print` — oddiy; `debugPrint` — ko'p chiqishda qatorlarni yo'qotmaydi; `log` (`dart:developer`) — kategoriya va xato obyekti bilan
   batafsil.
3. `FlutterError.onError` — Flutter callback'lari (build, layout, paint, gesture) ichidagilar; `PlatformDispatcher` — ulardan
   tashqaridagilar (masalan, `async`).
4. Widget build paytida xato tashlaganda. `MaterialApp.builder` ichida (FD).
5. Release'da `assert` umuman bajarilmaydi — testda `-4500` jimgina chiqdi.
6. `An InputDecorator, which is typically created by a TextField, cannot have an unbounded width.` — `Expanded` bilan o'rash.
7. `assert` o'rniga `if (narx < 0) throw ArgumentError.value(narx, 'narx', 'manfiy bo\'lmasligi kerak');` — ikkala rejimda
   ham ishlaydi. Tugma ishlovchisidagi bu xato `FlutterError.onError` ga tushadi. VPS'dagi testda (debug):
   `xato: Invalid argument (narx): manfiy bo'lmasligi kerak: -5000`. `if` — oddiy Dart kodi, `assert` dan farqli
   rejimga bog'liq emas.

</details>

## Rasmiy hujjat

- [FD: Flutter's build modes](https://docs.flutter.dev/testing/build-modes)
- [FD: Debugging Flutter apps](https://docs.flutter.dev/testing/debugging)
- [FD: Debug Flutter apps from code](https://docs.flutter.dev/testing/code-debugging)
- [FD: Handling errors in Flutter](https://docs.flutter.dev/testing/errors)
- [FD: Common Flutter errors](https://docs.flutter.dev/testing/common-errors)
