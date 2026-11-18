# 40 — Widget test

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan (`flutter test`). Golden rasm — testning o'zi chizgan haqiqiy fayl.

## Tushuncha

### Widget testi nima

FD (An introduction to widget testing): widget testi bitta widget'ni (ko'pincha bitta ekranni) **qurilmasiz**, test muhitida
quradi va u bilan foydalanuvchidek ishlaydi. Kerak bo'ladigan narsalar `flutter_test` paketida (`dev_dependencies` da, loyiha
yaratilganda bor):

| Narsa | Vazifasi (FD) |
| --- | --- |
| `testWidgets()` | oddiy `test()` o'rniga; har test uchun yangi `WidgetTester` yaratadi |
| `WidgetTester` | widget'ni quradi va u bilan ishlaydi: `pumpWidget`, `tap`, `enterText`, `drag` ... |
| `Finder` | test muhitida widget qidiradi: `find.text`, `find.byKey`, `find.byType`, `find.byWidget` ... |
| `Matcher` | `Finder` natijasini tekshiradi: `findsOneWidget`, `findsNothing`, `findsWidgets`, `findsNWidgets(n)`, `matchesGoldenFile` |

### `pump` — test muhitida vaqt o'zi o'tmaydi

FD: tugma bosilsa `setState()` chaqiriladi, lekin test muhitida Flutter widget'ni **o'zi qayta qurmaydi**.

- `tester.pump()` — bitta kadr: qayta qurish. `pump(Duration)` — soatni shuncha surib, bitta kadr (26-bob).
- `tester.pumpAndSettle()` — boshqa kadr rejalashtirilmay qolguncha `pump` qiladi, ya'ni animatsiyalar tugashini kutadi.

### Qidirish (finder) usullari

FD (Find widgets):

- `find.text('...')` — shu matnni ko'rsatayotgan widget'lar;
- `find.byKey(Key('...'))` — kalit bo'yicha. Bir xil matnli widget'lar ko'p bo'lganda (masalan, ro'yxatda) — har biriga kalit
  bering;
- `find.byWidget(w)` — aynan shu nusxa (masalan, `child` to'g'ri chizilganini tekshirish).

Bulardan tashqari API'da: `find.byType(ListTile)`, `find.byTooltip('...')`, `find.widgetWithText(ListTile, '...')`,
`find.descendant(of: ..., matching: ...)`.

### Foydalanuvchi harakatlari

FD (Tap, drag, and enter text): `enterText` — maydonga yozish, `tap` — bosish, `drag` — surish (masalan, `Dismissible`).
Har harakatdan keyin `pump()` yoki animatsiya bo'lsa `pumpAndSettle()`.

FD (Handle scrolling): `scrollUntilVisible(element, 500.0, scrollable: ...)` — kerakli element ko'ringuncha ro'yxatni aylantiradi
(element balandligi qurilmaga qarab o'zgarishi mumkin, shuning uchun aniq masofa emas).

### Golden test

`matchesGoldenFile('goldens/x.png')` — widget'ning chizilgan rasmini saqlangan "oltin" (golden) rasm bilan piksel-piksel solishtiradi
(FD). Birinchi marta yoki ataylab o'zgartirilganda rasm `flutter test --update-goldens` bilan yangilanadi.

## Ko'rib chiqamiz

Kitoblar ro'yxati: maydon + qo'shish tugmasi, surib o'chirish (`Dismissible`). `lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

void main() => runApp(const KitoblarIlovasi());

class KitoblarIlovasi extends StatelessWidget {
  const KitoblarIlovasi({super.key, this.boshlangich = const ['Dart tili', 'Toza kod']});

  final List<String> boshlangich;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: KitoblarSahifasi(boshlangich: boshlangich),
    );
  }
}

class KitoblarSahifasi extends StatefulWidget {
  const KitoblarSahifasi({super.key, required this.boshlangich});

  final List<String> boshlangich;

  @override
  State<KitoblarSahifasi> createState() => _KitoblarSahifasiState();
}

class _KitoblarSahifasiState extends State<KitoblarSahifasi> {
  late final List<String> _kitoblar = [...widget.boshlangich];
  final _nom = TextEditingController();

  @override
  void dispose() {
    _nom.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Kitoblar (${_kitoblar.length})')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(8),
            child: TextField(
              key: const Key('nom_maydoni'),
              controller: _nom,
              decoration: const InputDecoration(labelText: 'Yangi kitob'),
            ),
          ),
          Expanded(
            child: ListView.builder(
              key: const Key('royxat'),
              itemCount: _kitoblar.length,
              itemBuilder: (context, i) {
                final nom = _kitoblar[i];
                return Dismissible(
                  key: ValueKey(nom),
                  onDismissed: (_) => setState(() => _kitoblar.removeAt(i)),
                  background: Container(color: Colors.red),
                  child: ListTile(title: Text(nom, key: Key('kitob_$i'))),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Qo\'shish',
        onPressed: () {
          if (_nom.text.trim().isEmpty) return;
          setState(() {
            _kitoblar.add(_nom.text.trim());
            _nom.clear();
          });
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

`test/widget_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Finder\'lar', (tester) async {
    await tester.pumpWidget(const KitoblarIlovasi());

    expect(find.text('Kitoblar (2)'), findsOneWidget); // matn bo'yicha
    expect(find.byKey(const Key('nom_maydoni')), findsOneWidget); // kalit bo'yicha
    expect(find.byType(ListTile), findsNWidgets(2)); // tur bo'yicha
    expect(find.byTooltip('Qo\'shish'), findsOneWidget); // tooltip bo'yicha
    expect(find.text('Algoritmlar'), findsNothing);
    debugPrint('Key(\'a\') == ValueKey(\'a\'): ${const Key('a') == const ValueKey('a')}');
  });

  testWidgets('Yozish, bosish, surib o\'chirish', (tester) async {
    await tester.pumpWidget(const KitoblarIlovasi());

    await tester.enterText(find.byKey(const Key('nom_maydoni')), 'Algoritmlar');
    await tester.tap(find.byTooltip('Qo\'shish'));
    debugPrint('pump\'dan oldin ro\'yxatda: ${find.widgetWithText(ListTile, 'Algoritmlar').evaluate().length} ta');
    await tester.pump();
    expect(find.widgetWithText(ListTile, 'Algoritmlar'), findsOneWidget);
    expect(find.text('Kitoblar (3)'), findsOneWidget);
    debugPrint('pump\'dan keyin: ro\'yxatda bor, sarlavha: Kitoblar (3)');

    await tester.drag(find.text('Toza kod'), const Offset(500, 0));
    await tester.pump(); // animatsiya hali tugamagan
    debugPrint('drag + pump: Toza kod ${find.text('Toza kod').evaluate().length} ta');
    await tester.pumpAndSettle();
    expect(find.text('Toza kod'), findsNothing);
    debugPrint('pumpAndSettle: Toza kod 0 ta, sarlavha: ${find.textContaining('Kitoblar').evaluate().map((e) => (e.widget as Text).data).single}');
  });

  testWidgets('Uzun ro\'yxatda aylantirish', (tester) async {
    await tester.pumpWidget(KitoblarIlovasi(boshlangich: [for (var i = 0; i < 100; i++) 'Kitob $i']));
    final element = find.byKey(const Key('kitob_80'));
    debugPrint('boshida kitob_80: ${element.evaluate().length} ta (hali qurilmagan)');

    debugPrint('ekrandagi Scrollable\'lar: ${find.byType(Scrollable).evaluate().length} ta');
    // Faqat ro'yxatning o'zidagi Scrollable
    final royxat = find.descendant(of: find.byKey(const Key('royxat')), matching: find.byType(Scrollable));
    await tester.scrollUntilVisible(element, 500, scrollable: royxat);
    expect(element, findsOneWidget);
    debugPrint('scrollUntilVisible dan keyin: ${(tester.widget<Text>(element)).data}');
  });

  testWidgets('Golden: ko\'rinish rasmi', (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(360, 300);
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const KitoblarIlovasi());
    await expectLater(find.byType(MaterialApp), matchesGoldenFile('goldens/kitoblar.png'));
  });
}
```

Birinchi ishga tushirishda golden fayl hali yo'q:

```text vps
$ flutter test
...
Expected: one widget whose rasterized image matches golden image "goldens/kitoblar.png"
  Actual: _TypeWidgetFinder:<Found 1 widget with type "MaterialApp": [
            MaterialApp(state: _MaterialAppState#da28c),
          ]>
   Which: Could not be compared against non-existent file: "goldens/kitoblar.png"
```

Uni yaratamiz:

```text vps
$ flutter test --update-goldens
...
00:06 +3: Golden: ko'rinish rasmi
00:06 +4: All tests passed!
$ ls test/goldens
kitoblar.png
```

Keyin:

```text vps
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Finder'lar
Key('a') == ValueKey('a'): true
00:02 +1: Yozish, bosish, surib o'chirish
pump'dan oldin ro'yxatda: 0 ta
pump'dan keyin: ro'yxatda bor, sarlavha: Kitoblar (3)
drag + pump: Toza kod 1 ta
pumpAndSettle: Toza kod 0 ta, sarlavha: Kitoblar (2)
00:03 +2: Uzun ro'yxatda aylantirish
boshida kitob_80: 0 ta (hali qurilmagan)
ekrandagi Scrollable'lar: 2 ta
scrollUntilVisible dan keyin: Kitob 80
00:05 +3: Golden: ko'rinish rasmi
00:06 +4: All tests passed!
```

Natijada:

- **Finder'lar**: matn, kalit, tur va tooltip bo'yicha topildi. `Key('a') == ValueKey('a')` — `true`: `Key('...')` aslida
  `ValueKey<String>` yaratadi, shuning uchun ilovada `Key`, testda `ValueKey` yozilsa ham topiladi.
- **`pump` dan oldin** yangi kitob ro'yxatda **yo'q** (0 ta) — `setState` chaqirildi, lekin kadr chizilmadi. `pump` dan keyin bor.
- **Surib o'chirish**: `drag` + bitta `pump` dan keyin "Toza kod" hali ekranda (animatsiya ketyapti); `pumpAndSettle` dan
  keyin — yo'q, sarlavha `Kitoblar (2)`.
- **Uzun ro'yxat**: 80-kitob boshida umuman **qurilmagan** (`ListView.builder` faqat ko'rinadiganlarni quradi);
  `scrollUntilVisible` dan keyin topildi.

Golden rasm (`test/goldens/kitoblar.png`, 360×300):

<img src="/rasmlar/flutter/40-golden.png" alt="Golden rasm: matnlar qora to'rtburchaklar bilan chizilgan ro'yxat va qo'shish tugmasi" width="360">

Matn o'rnida to'rtburchaklar — `flutter test` haqiqiy shriftlar o'rniga test shriftini ishlatadi; shu sababli golden rasm
platformaga bog'liq shrift farqlaridan holi. Ikon ham to'rtburchak.

## Tipik xatolar

FD misolidagi `scrollable: find.byType(Scrollable)` bizning ekranda:

```text vps
00:03 +2: Uzun ro'yxatda aylantirish
boshida kitob_80: 0 ta (hali qurilmagan)
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following StateError was thrown running a test:
Bad state: Too many elements

When the exception was thrown, this was the stack:
#0      Iterable.single (dart:core/iterable.dart:696:24)
#1      WidgetController.widget (package:flutter_test/src/controller.dart:827:30)
#2      WidgetController.scrollUntilVisible.<anonymous closure> (package:flutter_test/src/controller.dart:2428:15)
```

Testdagi `debugPrint` ko'rsatdi: ekranda **2 ta** `Scrollable` — ro'yxat va `TextField` (matn maydoni ham ichida
`Scrollable` ishlatadi). Yechim — ro'yxatning o'zidagisi: `find.descendant(of: find.byKey(const Key('royxat')),
matching: find.byType(Scrollable))`.

Golden'dan keyin ilovada sarlavhani `Kitob ro'yxati` ga o'zgartirsak:

```text vps
$ flutter test --plain-name Golden
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following assertion was thrown while running async test code:
Golden "goldens/kitoblar.png": Pixel test failed, 1.51%, 1630px diff detected.
Failure feedback can be found at /home/dasturchi/flutter/salom/test/failures

$ ls test/failures
kitoblar_isolatedDiff.png
kitoblar_maskedDiff.png
kitoblar_masterImage.png
kitoblar_testImage.png
```

`test/failures` da eski, yangi va farq rasmlari — nima o'zgarganini ko'rish uchun. O'zgarish ataylab bo'lsa —
`--update-goldens`, aks holda xato topildi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `tap` dan keyin yangi element topilmaydi | Test muhitida qayta qurish avtomatik emas | `await tester.pump()` (FD) |
| Animatsiyadan keyingi holat topilmaydi | Bitta `pump` animatsiyani tugatmaydi | `pumpAndSettle()` (cheksiz animatsiyada emas — 26-bob) |
| `Bad state: Too many elements` | Finder bir nechta widget topdi (`tap`, `widget`, `scrollUntilVisible` bittasini kutadi) | Aniqroq finder: `Key`, `find.descendant`, `.first` |
| Ro'yxat oxiridagi element topilmaydi | `ListView.builder` uni hali qurmagan | `scrollUntilVisible` (FD) |
| `Could not be compared against non-existent file` | Golden hali yaratilmagan | `flutter test --update-goldens` |
| `Pixel test failed, 1.51%` | Ko'rinish o'zgardi | Ataylab bo'lsa — `--update-goldens`; bo'lmasa — `test/failures` dagi farqni ko'ring |

## Amaliyot

1. `testWidgets`, `WidgetTester`, `Finder`, `Matcher` — har birining vazifasi nima?
2. Nega `tap` dan keyin `pump` kerak? `pump` va `pumpAndSettle` farqi?
3. Qachon `find.text`, qachon `find.byKey`?
4. Nega `ListView.builder` ning oxiridagi element `findsNothing` beradi?
5. Golden test nimani tekshiradi? Golden rasmda nega matn to'rtburchaklar?
6. `Too many elements` xatosini qanday tuzatish mumkin?
7. Bo'sh (faqat bo'sh joylardan iborat) nom bilan "Qo'shish" bosilsa, ro'yxat o'zgarmasligi kerak. Test yozing.

<details>
<summary>Javoblar</summary>

1. `testWidgets` — widget testi (yangi `WidgetTester` bilan); `WidgetTester` — qurish va harakatlar; `Finder` — widget qidirish;
   `Matcher` — topilganini tekshirish.
2. Test muhitida `setState` dan keyin qayta qurish avtomatik emas. `pump` — bitta kadr; `pumpAndSettle` — animatsiyalar
   tugaguncha.
3. `find.text` — matn noyob bo'lsa; `find.byKey` — bir xil matnli widget'lar ko'p bo'lsa yoki matn o'zgaruvchan bo'lsa.
4. U hali qurilmagan — `builder` faqat ko'rinadigan (va biroz atrofidagi) elementlarni quradi.
5. Chizilgan rasmni saqlangan rasm bilan piksel-piksel. Testda haqiqiy shriftlar o'rniga test shrifti.
6. Bitta widget'ni aniq ko'rsatadigan finder: kalit, `find.descendant`, `find.widgetWithText` yoki `.first`/`.at(i)`.
7. `enterText(find.byKey(const Key('nom_maydoni')), '   ')`, `tap(find.byTooltip("Qo'shish"))`, `pump()`, keyin
   `expect(find.byType(ListTile), findsNWidgets(2))` va `expect(find.text('Kitoblar (2)'), findsOneWidget)`. VPS'da:
   `ListTile: 2 ta`, test o'tdi (ilovadagi `trim().isEmpty` tekshiruvi ishladi).

</details>

## Rasmiy hujjat

- [FD: An introduction to widget testing](https://docs.flutter.dev/cookbook/testing/widget/introduction)
- [FD: Find widgets](https://docs.flutter.dev/cookbook/testing/widget/finders)
- [FD: Tap, drag, and enter text](https://docs.flutter.dev/cookbook/testing/widget/tap-drag)
- [FD: Handle scrolling](https://docs.flutter.dev/cookbook/testing/widget/scrolling)
- [API: WidgetTester](https://api.flutter.dev/flutter/flutter_test/WidgetTester-class.html) · [CommonFinders](https://api.flutter.dev/flutter/flutter_test/CommonFinders-class.html) · [matchesGoldenFile](https://api.flutter.dev/flutter/flutter_test/matchesGoldenFile.html)
