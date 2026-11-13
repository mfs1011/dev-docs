# 13 — Hamma narsa — widget

[Mundarija](README.md)

## Tushuncha

Bu bobdan Flutter'ning o'zi boshlanadi. Misollar sinov VPS'ida **Flutter 3.50.0** (stable) bilan sinalgan:

- `flutter test` bilan widget testi;
- `flutter build web` bilan web'ga yig'ish;
- yig'ilgan ilova brauzerda (telefon o'lchamida, 390×640) ochilgan va skrinshot olingan.

Emulyatorda sinash keyingi boblarda bo'ladi; widget kodi platformadan qat'i nazar bir xil.

### Widget nima

FD (User interface): Flutter'da interfeys **widget**lardan quriladi. Widget o'zining joriy sozlamasi va holatiga qarab
ko'rinishi qanday bo'lishini **tasvirlaydi**. Holat o'zgarsa, widget tasvirini qayta quradi. Framework yangi tasvirni
eskisi bilan solishtiradi (diff) va ekranda faqat kerakli eng kam o'zgarishni qiladi. FD bu g'oya React'dan ilhomlanganini
aytadi.

- `runApp(widget)` berilgan widget'ni **widget daraxti**ning (widget tree) ildizi qiladi. FD: framework ildiz widget'ni
  butun ekranga yoyadi.
- Odatda o'z widget'laringiz `StatelessWidget` yoki `StatefulWidget` dan meros oladi. Qaysi biri — widget holat
  boshqaradimi-yo'qmi, shunga bog'liq; `StatefulWidget` 14-bobda.
- Widget'ning asosiy ishi — **`build()`** metodi. U widget'ni boshqa, quyiroq darajadagi widget'lar orqali tasvirlaydi.
- Widget'ga ma'lumot **konstruktor** orqali beriladi. FD (Widget fundamentals): widget'ni qayta ishlatiladigan qiladigan
  asosiy narsa shu.

### Uchta paket

FD (User interface) Flutter UI qatlamini ikki pog'onaga ajratadi:

| | `widgets` | `material_ui` | `cupertino_ui` |
| --- | --- | --- | --- |
| Qayerdan | Flutter SDK | pub.dev | pub.dev |
| Dizayn tizimi | yo'q (uslubsiz) | Material 3 | Apple HIG (iOS) |
| Ilova ildizi | `WidgetsApp` | `MaterialApp` | `CupertinoApp` |
| Ekran karkasi | `Stack`, `Column` | `Scaffold`, `AppBar` | `CupertinoPageScaffold` |

`flutter create` yaratgan loyiha `pubspec.yaml` ga `material_ui` ni qo'shadi va
`import 'package:material_ui/material_ui.dart';` dan boshlanadi (VPS'da tekshirilgan, Flutter 3.50.0).

### `MaterialApp` va `Scaffold`

- **`MaterialApp`** (FD): ilova ildizida bir qator foydali widget'larni quradi, jumladan ekranlar orasida o'tishni
  boshqaradigan `Navigator` ni (23-bob). Ko'p Material widget'lari mavzu (theme) ma'lumotini olish uchun `MaterialApp`
  ichida bo'lishi kerak. Matn yo'nalishi (`Directionality`) ham shu yerda beriladi.
- **`Scaffold`** (FD): ekran karkasi. Turli widget'larni nomli argument sifatida oladi (`appBar`, `body`,
  `floatingActionButton` …) va har birini o'z joyiga qo'yadi.

FD: widget'larni boshqa widget'larga **argument qilib berish** framework bo'ylab takrorlanadigan usul. O'z widget'laringizni
loyihalashda ham undan foydalanish mumkin.

### Oddiy widget'lar

FD (User interface) eng ko'p ishlatiladiganlar:

| Widget | Vazifasi (FD) |
| --- | --- |
| `Text` | uslub berilgan matn |
| `Row`, `Column` | gorizontal / vertikal joylash; web'dagi flexbox'ga asoslangan (15-bob) |
| `Stack` | widget'larni ustma-ust qo'yish; `Positioned` bilan chetlarga nisbatan joylash |
| `Container` | to'rtburchak element: `BoxDecoration` (fon, chegara, soya), `margin`, `padding`, o'lcham cheklovlari |

Bobdagi misolda yana `Padding`, `SizedBox` (bo'sh joy), `Expanded` (qolgan joyni egallash) va `Icon` bor. To'liq ro'yxat:
[Widget catalog](https://docs.flutter.dev/ui/widgets).

### Widget, element va render obyekti (qisqacha)

FD (Architectural overview) — kod yozganda faqat widget ko'rinadi, lekin Flutter ichida uchta daraxt bor:

| Daraxt | Nima (FD) |
| --- | --- |
| **Widget** | **o'zgarmas** (immutable) tasvir. O'zgarish bo'lsa, yangi widget obyektlari yaratiladi |
| **Element** | har widget uchun bittadan; widget'ning daraxtdagi aniq o'rnidagi nusxasi. Kadrdan kadrga **saqlanadi**. Shu sabab Flutter faqat o'zgargan qismni qayta quradi |
| **RenderObject** | o'lcham hisoblash (layout) va chizish (paint) qiladi. `RenderParagraph` matnni, `RenderImage` rasmni chizadi |

FD: elementga **`BuildContext`** orqali murojaat qilinadi. `BuildContext` — widget'ning daraxtdagi joyiga "tutqich".
`build(BuildContext context)` dagi va `Theme.of(context)` dagi `context` aynan shu.

## Ko'rib chiqamiz

Loyiha (faqat web platformasi bilan):

```text vps
$ flutter create --platforms web salom
…
Wrote 19 files.

All done!
```

`lib/main.dart` — kichik "Kitob do'koni" ekrani:

```dart
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const KitobDokoniApp());
}

/// Ilovaning ildizi: MaterialApp — mavzu, sarlavha va birinchi ekran
class KitobDokoniApp extends StatelessWidget {
  const KitobDokoniApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kitob do\'koni',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const BoshSahifa(),
    );
  }
}

/// Ekran: Scaffold — yuqori panel (AppBar) va tana (body)
class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitob do\'koni')),
      body: const Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Yangi kitoblar',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            KitobKartasi(nom: 'Flutter asoslari', muallif: 'A. Karimov', narx: 85000),
            KitobKartasi(nom: 'Dart tili', muallif: 'B. Aliyeva', narx: 72000),
          ],
        ),
      ),
    );
  }
}

/// O'zimizning widget: bir nechta oddiy widget'dan yig'ilgan karta
class KitobKartasi extends StatelessWidget {
  const KitobKartasi({
    super.key,
    required this.nom,
    required this.muallif,
    required this.narx,
  });

  final String nom;
  final String muallif;
  final int narx;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.teal.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.teal.shade200),
      ),
      child: Row(
        children: [
          const Icon(Icons.menu_book, size: 40, color: Colors.teal),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(nom, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                Text(muallif, style: TextStyle(color: Colors.grey.shade700)),
              ],
            ),
          ),
          Text('$narx so\'m', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
```

Widget daraxti:

```text
KitobDokoniApp
└─ MaterialApp
   └─ BoshSahifa
      └─ Scaffold
         ├─ appBar: AppBar ─ Text
         └─ body: Padding ─ Column
                  ├─ Text 'Yangi kitoblar'
                  ├─ SizedBox
                  ├─ KitobKartasi ─ Container ─ Row (Icon, Expanded ─ Column, Text)
                  └─ KitobKartasi ─ …
```

Widget testi (`test/widget_test.dart`) — ekranni "chizib", unda nima borligini tekshiradi (testlar 40-bobda batafsil):

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('bosh sahifada ikkita kitob kartasi bor', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());

    expect(find.text('Yangi kitoblar'), findsOneWidget);
    expect(find.byType(KitobKartasi), findsNWidgets(2));
    expect(find.text('Dart tili'), findsOneWidget);
    expect(find.text('85000 so\'m'), findsOneWidget);
  });
}
```

```text vps
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: bosh sahifada ikkita kitob kartasi bor
00:01 +1: All tests passed!
```

Web'ga yig'ish:

```text vps
$ flutter build web
Compiling lib/main.dart for the Web...                          
Wasm dry run succeeded. Consider building and testing your application with the `--wasm` flag. See docs for more info: https://docs.flutter.dev/platform-integration/web/wasm
Use --no-wasm-dry-run to disable these warnings.
Font asset "CupertinoIcons.ttf" was tree-shaken, reducing it from 257628 to 844 bytes (99.7% reduction). Tree-shaking can be disabled by providing the --no-tree-shake-icons flag when building your app.
Font asset "MaterialIcons-Regular.otf" was tree-shaken, reducing it from 1645184 to 1400 bytes (99.9% reduction). Tree-shaking can be disabled by providing the --no-tree-shake-icons flag when building your app.
Compiling lib/main.dart for the Web...                            536.6s
✓ Built build/web
```

`build/web` brauzerda ochilganda (telefon o'lchami, konsolda xato yo'q):

<img src="/rasmlar/flutter/13-kitob-dokoni.png" alt="Kitob do'koni ilovasi: AppBar, 'Yangi kitoblar' sarlavhasi va ikkita kitob kartasi" width="320">

Natijada:

- `KitobKartasi` — o'zimiz yozgan widget. Ikki marta, har xil ma'lumot bilan ishlatildi: konstruktor parametrlari shu
  uchun kerak.
- `AppBar` sarlavhasi Material uslubini `MaterialApp` dagi mavzudan oldi. Biz faqat `seedColor: Colors.teal` berdik.
- Test ikki `KitobKartasi` ni va matnlarni ekranda topdi.
- Yig'ish paytida ikonka shriftlari faqat ishlatilgan belgilargacha qisqartirildi (tree-shaking): `MaterialIcons`
  1 645 184 baytdan 1 400 baytga.

## Tipik xatolar

`Text` ni `MaterialApp` siz, to'g'ridan-to'g'ri ildizga qo'yish:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  testWidgets('MaterialApp siz Text', (tester) async {
    await tester.pumpWidget(const Center(child: Text('Salom')));
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: MaterialApp siz Text
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building Text("Salom", dependencies: [MediaQuery]):
No Directionality widget found.
RichText widgets require a Directionality widget ancestor.
The specific widget that could not find a Directionality ancestor was:
  RichText
The ownership chain for the affected widget is: "RichText ← Text ← Center ← _FocusInheritedScope ←
  _FocusScopeWithExternalFocusNode ← _FocusInheritedScope ← Focus ← FocusTraversalGroup ← MediaQuery
  ← _MediaQueryFromView ← ⋯"
Typically, the Directionality widget is introduced by the WidgetsApp widget at the top of your
application widget tree. It determines the ambient reading direction and is used, for example, to
determine how to lay out text, how to interpret "start" and "end" values, and to resolve
EdgeInsetsDirectional, AlignmentDirectional, and other *Directional objects.

The relevant error-causing widget was:
  Text Text:file:///home/dasturchi/flutter/salom/test/xato_test.dart:6:49
…
00:01 +0 -1: Some tests failed.
```

Flutter'ning xato matni sababni o'zi aytadi: `Directionality` (matn yo'nalishi) odatda `WidgetsApp` (yoki `MaterialApp`)
tomonidan beriladi. FD (User interface) ham shuni aytadi: `MaterialApp` siz `Text` ga `textDirection` ni qo'lda berish kerak.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `MaterialApp` siz `Text` / Material widget'lari | `Directionality` va mavzu (theme) yo'q | Ildizda `MaterialApp` (yoki `Text(textDirection: …)`) |
| Bitta katta `build()` metodi | Qayta ishlatib bo'lmaydi, o'qish qiyin | Bo'laklarni alohida widget klasslarga ajrating (`KitobKartasi` kabi) |
| Widget ichida o'zgaruvchan maydon (`var`) | FD: widget o'zgarmas; yangilanish yangi widget orqali bo'ladi | Maydonlar `final`; o'zgaradigan holat — `StatefulWidget` (14-bob) |
| O'zgarmas widget'ni `const` siz yaratish | `const` widget kompilyatsiya vaqtida bir marta yaratiladi (5-bob) | Imkon bo'lsa `const Text(…)`, `const SizedBox(…)` |

## Amaliyot

1. `runApp()` nima qiladi?
2. `build()` metodi nima qaytaradi?
3. `widgets`, `material_ui` va `cupertino_ui` farqi nima? Har birining ilova ildizi qaysi widget?
4. `MaterialApp` nega kerak? U nima beradi?
5. Widget o'zgarmas bo'lsa, Flutter qanday qilib faqat o'zgargan joyni qayta quradi?
6. `BuildContext` nima?
7. `KitobKartasi` ga `rasm` (`IconData`) parametrini qo'shing va har kitobga boshqa ikonka bering.

<details>
<summary>Javoblar</summary>

1. Berilgan widget'ni widget daraxtining ildizi qiladi va uni butun ekranga yoyadi.
2. Boshqa widget'ni: widget o'zini quyiroq darajadagi widget'lar orqali tasvirlaydi.
3. `widgets` — Flutter SDK'dagi uslubsiz asos (`WidgetsApp`); `material_ui` — Material 3 (`MaterialApp`); `cupertino_ui` — iOS uslubi (`CupertinoApp`). Oxirgi ikkisi pub.dev'dan.
4. Ildizda `Navigator`, mavzu, matn yo'nalishi kabi foydali widget'larni quradi; ko'p Material widget'lari mavzuni shundan oladi.
5. Element daraxti kadrdan kadrga saqlanadi. Yangi widget'lar eskisi bilan solishtirilib, faqat o'zgargan elementlar qayta sozlanadi.
6. Widget'ning daraxtdagi joyiga tutqich (uning elementi); `Theme.of(context)` shu orqali yuqoridagi ma'lumotni topadi.
7. `final IconData rasm;` maydoni, konstruktorda `required this.rasm`, `Icon(rasm, …)`; chaqiruvda `rasm: Icons.code`.

</details>

## Rasmiy hujjat

- [FD: Building user interfaces with Flutter](https://docs.flutter.dev/ui)
- [FD: Create widgets (Widget fundamentals)](https://docs.flutter.dev/learn/pathway/tutorial/widget-fundamentals)
- [FD: Widget catalog](https://docs.flutter.dev/ui/widgets)
- [FD: Flutter architectural overview — widgets, elements, render objects](https://docs.flutter.dev/resources/architectural-overview)
