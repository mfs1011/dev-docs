# 17 — Ro'yxat va grid

[Mundarija](README.md)

## Tushuncha

### ListView

FD (Layouts — ListView): `ListView` — ro'yxat uchun moslashtirilgan `Column`:

- elementlarni vertikal yoki gorizontal joylaydi;
- mazmun sig'masligini o'zi aniqlaydi va **skroll** beradi;
- `Column` dan kamroq sozlanadi, lekin ishlatish oson.

### Uzun ro'yxat: `ListView.builder`

FD (Work with long lists):

- oddiy `ListView` konstruktori kichik ro'yxatlar uchun yaxshi;
- ko'p elementli ro'yxat uchun **`ListView.builder`** yaxshiroq;
- oddiy konstruktor barcha elementlarni **birdaniga** yaratishni talab qiladi, `ListView.builder()` esa elementlarni
  ekranga skroll qilinganda yaratadi.

`ListView.builder` ga ikki narsa beriladi: `itemCount` (nechta element) va `itemBuilder` (`index` bo'yicha widget
qaytaradigan funksiya).

FD (Children's extent): elementlar balandligini oldindan aytish skrollni tejamli qiladi — masalan, pozitsiya keskin
o'zgarganda. Elementlar bir xil o'lchamda bo'lsa, `prototypeItem` yoki `itemExtent`; har xil bo'lsa — `itemExtentBuilder`.

### Turli elementli ro'yxat

FD (Create lists with different types of items): masalan, sarlavha, uning ostida bir nechta element, keyin yana sarlavha.
FD usuli:

1. har element turi uchun alohida klass (FD misolida: `ListItem`, `HeadingItem`, `MessageItem`);
2. `ListView.builder` ning `itemBuilder` i element turini tekshiradi va shu turga mos widget qaytaradi.

Bobdagi misolda turlar `sealed` klass bilan yozilgan (10-bob). Bunda `switch` barcha turlarni qamraganini kompilyator
tekshiradi.

### GridView

FD (Layouts — GridView): `GridView` widget'larni ikki o'lchovli ro'yxat (to'r) qilib joylaydi. Mazmun sig'masa,
o'zi skroll bo'ladi. Ikki tayyor varianti bor:

| Konstruktor | Nima beriladi (FD) |
| --- | --- |
| `GridView.count` | ustunlar soni |
| `GridView.extent` | katakning eng katta kengligi (piksel) |

FD: qaysi qator va ustunda turgani muhim bo'lgan ma'lumot uchun (masalan, "avokado" qatoridagi "kaloriya" ustuni)
`Table` yoki `DataTable` ishlatiladi.

## Ko'rib chiqamiz

Kitob katalogi. Unda 10 000 kitob va 101 bo'lim sarlavhasi — jami 10 100 element. AppBar'dagi tugma kategoriyalar
to'riga o'tkazadi.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const KitobDokoniApp());
}

// Turli elementli ro'yxat uchun ma'lumot turlari (FD: har tur uchun klass).
// sealed — switch barcha turlarni tekshirganini kompilyator nazorat qiladi (10-bob).
sealed class Element {}

class Sarlavha extends Element {
  Sarlavha(this.matn);
  final String matn;
}

class Kitob extends Element {
  Kitob(this.nom, this.narx);
  final String nom;
  final int narx;
}

// 10 000 ta element: har 100 tadan oldin bo'lim sarlavhasi
final List<Element> katalog = [
  for (var i = 0; i < 10000; i++) ...[
    if (i % 100 == 0) Sarlavha('${i ~/ 100 + 1}-bo\'lim'),
    Kitob('Kitob $i', 20000 + i * 10),
  ],
];

const kategoriyalar = [
  ('Dasturlash', Icons.code),
  ('Tarix', Icons.history_edu),
  ('Bolalar', Icons.child_care),
  ('Ilm-fan', Icons.science),
  ('Badiiy', Icons.auto_stories),
  ('Tillar', Icons.translate),
];

class KitobDokoniApp extends StatelessWidget {
  const KitobDokoniApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const Katalog(),
    );
  }
}

class Katalog extends StatefulWidget {
  const Katalog({super.key});

  @override
  State<Katalog> createState() => _KatalogState();
}

class _KatalogState extends State<Katalog> {
  bool _grid = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_grid ? 'Kategoriyalar' : 'Katalog'),
        actions: [
          IconButton(
            icon: Icon(_grid ? Icons.view_list : Icons.grid_view),
            onPressed: () => setState(() => _grid = !_grid),
          ),
        ],
      ),
      body: _grid ? const KategoriyaGrid() : const KitobRoyxati(),
    );
  }
}

/// Uzun ro'yxat: ListView.builder elementlarni ekranga chiqqanda yaratadi
class KitobRoyxati extends StatelessWidget {
  const KitobRoyxati({super.key});

  // Nechta element qurilganini hisoblaymiz (testda ko'rish uchun)
  static int qurildi = 0;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      itemCount: katalog.length,
      itemBuilder: (context, index) {
        qurildi++;
        return switch (katalog[index]) {
          Sarlavha(:final matn) => Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
              child: Text(matn, style: Theme.of(context).textTheme.titleMedium),
            ),
          Kitob(:final nom, :final narx) => ListTile(
              leading: const Icon(Icons.menu_book),
              title: Text(nom),
              trailing: Text('$narx so\'m'),
            ),
        };
      },
    );
  }
}

/// Grid: GridView.extent — har katak eni ko'pi bilan 160 px
class KategoriyaGrid extends StatelessWidget {
  const KategoriyaGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.extent(
      maxCrossAxisExtent: 160,
      padding: const EdgeInsets.all(12),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      children: [
        for (final (nom, ikonka) in kategoriyalar)
          Container(
            decoration: BoxDecoration(
              color: Colors.teal.shade50,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(ikonka, size: 40, color: Colors.teal),
                const SizedBox(height: 8),
                Text(nom),
              ],
            ),
          ),
      ],
    );
  }
}
```

Testlar:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  setUp(() {
    // Har test uchun test oynasi: 390×640
    final binding = TestWidgetsFlutterBinding.ensureInitialized();
    binding.platformDispatcher.views.first.physicalSize = const Size(390, 640);
    binding.platformDispatcher.views.first.devicePixelRatio = 1;
  });

  testWidgets('ListView.builder faqat ko\'rinadiganlarni quradi', (tester) async {
    KitobRoyxati.qurildi = 0;
    await tester.pumpWidget(const KitobDokoniApp());
    debugPrint('katalogda: ${katalog.length} element, qurildi: ${KitobRoyxati.qurildi}');
    expect(find.text('Kitob 0'), findsOneWidget);
    expect(find.text('Kitob 9999'), findsNothing);

    // 250-kitobgacha skroll
    await tester.scrollUntilVisible(find.text('Kitob 250'), 2000);
    debugPrint('Kitob 250 ko\'rindi, jami qurilgan: ${KitobRoyxati.qurildi}');
    expect(find.text('Kitob 250'), findsOneWidget);
    // Ekrandan chiqib ketgan elementlar daraxtdan olib tashlanadi
    expect(find.text('Kitob 0'), findsNothing);
  });

  testWidgets('GridView.extent — ustunlar soni kenglikdan', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    await tester.tap(find.byIcon(Icons.grid_view));
    await tester.pump();
    final birinchi = tester.getRect(find.ancestor(of: find.text('Dasturlash'), matching: find.byType(Container)).first);
    final ikkinchi = tester.getRect(find.ancestor(of: find.text('Tarix'), matching: find.byType(Container)).first);
    final uchinchi = tester.getRect(find.ancestor(of: find.text('Bolalar'), matching: find.byType(Container)).first);
    debugPrint('Dasturlash: $birinchi');
    debugPrint('Tarix: $ikkinchi');
    debugPrint('Bolalar: $uchinchi');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 25.1s)
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: ListView.builder faqat ko'rinadiganlarni quradi
katalogda: 10100 element, qurildi: 16
Kitob 250 ko'rindi, jami qurilgan: 266
00:05 +1: GridView.extent — ustunlar soni kenglikdan
Dasturlash: Rect.fromLTRB(12.0, 68.0, 126.0, 182.0)
Tarix: Rect.fromLTRB(138.0, 68.0, 252.0, 182.0)
Bolalar: Rect.fromLTRB(264.0, 68.0, 378.0, 182.0)
00:06 +2: All tests passed!
```

Natijada:

- 10 100 elementdan ekranga chiqishda faqat **16** tasi qurildi.
- 250-kitobgacha skroll qilinganda jami 266 ta qurildi, ya'ni faqat o'tilganlari. "Kitob 0" esa daraxtdan chiqib ketdi.
- `GridView.extent(maxCrossAxisExtent: 160)` 390 px ekranda **3 ustun** berdi:
  - mavjud kenglik 390 − 2×12 = 366 px;
  - 160 px dan katta bo'lmasligi uchun 3 ustun kerak;
  - har katak (366 − 2×12) / 3 = 114 px — testdagi `Rect` lar shuni ko'rsatadi (12→126, 138→252, 264→378).

Brauzerda (`flutter build web`):

<img src="/rasmlar/flutter/17-katalog.png" alt="Katalog ro'yxati: '1-bo'lim' sarlavhasi va kitoblar" width="300"> <img src="/rasmlar/flutter/17-grid.png" alt="Kategoriyalar to'ri: 3 ustunda 6 kategoriya" width="300">

## Tipik xatolar

Uzun ro'yxatni oddiy `ListView(children: …)` bilan yozish. Ikki yo'lni solishtiramiz:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

int yaratildi = 0;

Widget qator(int i) {
  yaratildi++;
  return ListTile(title: Text('Kitob $i'));
}

void main() {
  testWidgets('Oddiy ListView(children: …)', (tester) async {
    yaratildi = 0;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: ListView(children: [for (var i = 0; i < 10000; i++) qator(i)])),
    ));
    debugPrint('ListView(children): $yaratildi ta widget yaratildi');
  });

  testWidgets('ListView.builder', (tester) async {
    yaratildi = 0;
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(body: ListView.builder(itemCount: 10000, itemBuilder: (_, i) => qator(i))),
    ));
    debugPrint('ListView.builder: $yaratildi ta widget yaratildi');
  });
}
```

```text vps
$ flutter test test/solishtir_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/solishtir_test.dart
00:00 +0: Oddiy ListView(children: …)
ListView(children): 10000 ta widget yaratildi
00:02 +1: ListView.builder
ListView.builder: 16 ta widget yaratildi
00:02 +2: All tests passed!
```

Ikkalasi ham ishlaydi, lekin oddiy konstruktor 10 000 widget obyektini **oldindan** yaratdi. `builder` esa ekranga
sig'adigan 16 tasini. FD tavsiyasi shundan: uzun ro'yxat — `ListView.builder`.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Uzun yoki cheksiz ro'yxat `ListView(children: …)` bilan | Hamma element birdaniga yaratiladi (FD) | `ListView.builder` |
| `ListView`/`GridView` ni `Column` ichiga to'g'ridan-to'g'ri qo'yish | "Vertical viewport was given unbounded height" (16-bob) | `Expanded` ichiga oling |
| Turli elementlarni `if`/`as` bilan aralash tekshirish | Yangi tur qo'shilsa, unutish oson | Har tur — alohida klass; `sealed` + `switch` |
| Qator/ustun ma'nosi bor jadval uchun `GridView` | `GridView` — bir xil kataklar to'ri | `Table` yoki `DataTable` (FD) |
| Bir xil balandlikdagi uzun ro'yxatda balandlikni bermaslik | Skroll mexanizmi o'lchamni oldindan bilmaydi | `itemExtent` yoki `prototypeItem` (FD) |

## Amaliyot

1. `ListView` va `ListView.builder` farqi nima? Qachon qaysi biri?
2. `itemCount` berilmasa nima bo'ladi deb o'ylaysiz? API hujjatidan tekshiring.
3. `GridView.count` va `GridView.extent` farqi?
4. 600 px kenglikda `GridView.extent(maxCrossAxisExtent: 160)` nechta ustun beradi (padding va oraliq 0)?
5. Ro'yxatga uchinchi element turi — reklama bannerini qo'shing. Kompilyator nimani talab qiladi?
6. Katalogga `itemExtent` qo'shish nega mumkin emas? Qaysi variant to'g'ri keladi?

<details>
<summary>Javoblar</summary>

1. Oddiy konstruktor hamma elementni birdaniga yaratadi — kichik ro'yxat uchun. `builder` elementni ekranga chiqqanda yaratadi — uzun yoki cheksiz ro'yxat uchun.
2. API (ListView.builder): konstruktor katta yoki **cheksiz** ro'yxat uchun mo'ljallangan. `itemBuilder` `null` qaytarsa, ro'yxat shu yerda to'xtaydi. `itemCount` berish esa skroll uzunligini baholashni yaxshilaydi: busiz oxirigacha yetmaguncha `maxScrollExtent` aniq bo'lmaydi.
3. `count` — ustunlar soni beriladi; `extent` — katakning eng katta kengligi, ustunlar soni kenglikdan hisoblanadi.
4. 4 ta: 600 / 160 = 3.75, katak 160 dan oshmasligi uchun 4 ustun (har biri 150 px).
5. Yangi `class Reklama extends Element {}`. `switch` endi hamma turni qamramaydi — kompilyator xato beradi, toki yangi tur uchun widget qo'shilmaguncha.
6. Sarlavha va kitob qatorining balandligi har xil; `itemExtentBuilder` mos keladi.

</details>

## Rasmiy hujjat

- [FD: Work with long lists](https://docs.flutter.dev/cookbook/lists/long-lists)
- [FD: Create lists with different types of items](https://docs.flutter.dev/cookbook/lists/mixed-list)
- [FD: Create a grid list](https://docs.flutter.dev/cookbook/lists/grid-lists)
- [FD: Layouts in Flutter — GridView, ListView](https://docs.flutter.dev/ui/layout#common-layout-widgets)
- [API: ListView.builder](https://api.flutter.dev/flutter/widgets/ListView/ListView.builder.html)
