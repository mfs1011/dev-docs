# 15 — Layout: Row, Column, Stack

[Mundarija](README.md)

## Tushuncha

FD (Layouts in Flutter): Flutter'da joylashuv (layout) ham **widget**lar bilan quriladi. Ekranda ko'rinadigan rasm,
ikonka, matn — widget. Ko'rinmaydigan narsalar ham widget: ko'rinadigan widget'larni joylaydigan, cheklaydigan va
tekislaydigan qatorlar, ustunlar, to'rlar. Murakkab ko'rinish oddiy widget'larni bir-biriga joylash orqali yig'iladi.

FD: layout widget'larida yo **`child`** (bitta bola: `Center`, `Container`), yo **`children`** (bolalar ro'yxati: `Row`,
`Column`, `ListView`, `Stack`) xossasi bo'ladi.

### Row va Column

FD: eng ko'p ishlatiladigan ikki naqsh:

- `Row` bolalarni **gorizontal** joylaydi;
- `Column` bolalarni **vertikal** joylaydi.

Har bola o'zi ham `Row` yoki `Column` bo'lishi mumkin, ichma-ichlik chuqurligi cheklanmagan.

| Xossa | Ma'nosi (FD) |
| --- | --- |
| **asosiy o'q** (main axis) | `Row` da gorizontal, `Column` da vertikal |
| **ko'ndalang o'q** (cross axis) | `Row` da vertikal, `Column` da gorizontal |
| `mainAxisAlignment` | asosiy o'q bo'yicha tekislash (`MainAxisAlignment` enum'i: `start`, `center`, `spaceEvenly` …) |
| `crossAxisAlignment` | ko'ndalang o'q bo'yicha tekislash (`CrossAxisAlignment`) |
| `mainAxisSize` | FD: sukut bo'yicha asosiy o'qda **imkon qadar ko'p** joy egallaydi; `MainAxisSize.min` — bolalarni zich joylash |

FD misoli: `spaceEvenly` bo'sh joyni bolalar orasida, oldidan va keyin teng bo'ladi.

### Expanded

FD: joylashuv qurilmaga sig'masa, toshgan chetida **sariq-qora chiziqli** belgi chiqadi. Bolani `Row`/`Column` ga
sig'dirish uchun **`Expanded`** ishlatiladi. FD: `Expanded` ning `flex` xossasi — bolaning ulushi (butun son, sukut
bo'yicha 1). `flex: 2` bo'lsa, widget qo'shnilaridan ikki baravar ko'p joy oladi.

### Container va Padding

FD (Container): `Container` ga bitta bola joylanadi va unga quyidagilarni beradi:

- ichki bo'shliq (`padding`) va tashqi bo'shliq (`margin`);
- chegara (`border`);
- fon rangi yoki rasm.

Bolasi `Row`, `Column` yoki butun widget daraxti bo'lishi mumkin. Faqat ichki bo'shliq kerak bo'lsa, bobdagi misolda
`Padding` widget'i ishlatilgan.

### Stack

FD (Stack):

- widget'larni asosiy widget (ko'pincha rasm) **ustiga** qo'yadi, to'liq yoki qisman qoplab;
- `children` dagi **birinchi** widget asosiy, keyingilari uning ustiga chiziladi;
- `Stack` ichidagi narsa skroll bo'lmaydi;
- chegaradan chiqqan bolalarni kesish (clip) mumkin.

FD (User interface): `Positioned` bolani `Stack` ning yuqori, o'ng, past yoki chap chetiga nisbatan joylaydi.

### Tayyor yuqori darajali widget'lar

FD: `Row` va `Column` — eng past darajadagi, eng moslashuvchan widget'lar. Ko'pincha tayyor widget yetarli:

- `Row` o'rniga — **`ListTile`**: oldida va oxirida ikonka, 3 qatorgacha matn (14-bobda ishlatildi);
- `Column` o'rniga — **`ListView`**: sig'masa o'zi skroll bo'ladi (17-bob).

FD maslahati: ichma-ich kod chalkash bo'lmasligi uchun UI bo'laklarini o'zgaruvchi va funksiyalarga ajrating.

## Ko'rib chiqamiz

Kitob sahifasi. Unda:

- muqova `Stack` bilan quriladi;
- ma'lumot `Row` + `Expanded` bilan joylanadi;
- reyting `MainAxisSize.min` bilan zich turadi;
- belgilar `spaceEvenly` bilan teng taqsimlanadi;
- tugmalar `flex` bilan bo'linadi.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const KitobDokoniApp());
}

class KitobDokoniApp extends StatelessWidget {
  const KitobDokoniApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const KitobSahifasi(),
    );
  }
}

class KitobSahifasi extends StatelessWidget {
  const KitobSahifasi({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitob')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row: chapda muqova (qat'iy kenglik), o'ngda ma'lumot (qolgan joy)
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Muqova(),
                const SizedBox(width: 16),
                Expanded(child: _malumot()),
              ],
            ),
            const SizedBox(height: 24),
            // Row + spaceEvenly: bo'sh joy bolalar orasida teng bo'linadi
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Belgi(ikonka: Icons.menu_book, matn: '320 bet'),
                Belgi(ikonka: Icons.language, matn: 'O\'zbekcha'),
                Belgi(ikonka: Icons.schedule, matn: '6 soat'),
              ],
            ),
            const SizedBox(height: 24),
            // Expanded flex: ikkinchi tugma birinchisidan ikki baravar keng
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(onPressed: () {}, child: const Text('Sevimli')),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: FilledButton(onPressed: () {}, child: const Text('Savatga')),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Ichma-ich daraxtni o'qish oson bo'lishi uchun bo'lakni metodga ajratdik
  Widget _malumot() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Flutter asoslari',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('A. Karimov'),
        const SizedBox(height: 8),
        Row(
          mainAxisSize: MainAxisSize.min, // yulduzlarni zich joylash
          children: [
            for (var i = 0; i < 5; i++)
              Icon(i < 4 ? Icons.star : Icons.star_border,
                  size: 18, color: Colors.amber.shade700),
            const SizedBox(width: 6),
            const Text('(128)'),
          ],
        ),
        const SizedBox(height: 8),
        const Text('85000 so\'m',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

/// Stack: asosiy widget (muqova) ustiga "Yangi" yorlig'i
class Muqova extends StatelessWidget {
  const Muqova({super.key});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: 110,
          height: 150,
          decoration: BoxDecoration(
            color: Colors.teal,
            borderRadius: BorderRadius.circular(8),
          ),
          alignment: Alignment.center,
          child: const Icon(Icons.flutter_dash, size: 56, color: Colors.white),
        ),
        Positioned(
          top: 8,
          left: 8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.amber,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text('Yangi', style: TextStyle(fontSize: 12)),
          ),
        ),
      ],
    );
  }
}

class Belgi extends StatelessWidget {
  const Belgi({super.key, required this.ikonka, required this.matn});

  final IconData ikonka;
  final String matn;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(ikonka, color: Colors.teal),
        const SizedBox(height: 4),
        Text(matn),
      ],
    );
  }
}
```

Widget daraxti (asosiy qismi):

```text
Scaffold ─ body: Padding ─ Column
  ├─ Row
  │   ├─ Muqova ─ Stack ─ [Container (asos), Positioned ─ Container ─ Text 'Yangi']
  │   ├─ SizedBox
  │   └─ Expanded ─ Column ─ [Text, Text, Row (min: 5×Icon, Text), Text]
  ├─ Row (spaceEvenly) ─ 3×Belgi ─ Column ─ [Icon, Text]
  └─ Row ─ [Expanded ─ OutlinedButton, SizedBox, Expanded(flex: 2) ─ FilledButton]
```

O'lchamlarni testda o'lchaymiz (ekran 390×640 mantiqiy piksel):

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Kitob sahifasi joylashuvi', (tester) async {
    tester.view.physicalSize = const Size(390, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const KitobDokoniApp());

    // Expanded flex: 2 — "Savatga" tugmasi "Sevimli" dan ikki baravar keng
    final sevimli = tester.getSize(find.byType(OutlinedButton)).width;
    final savatga = tester.getSize(find.byType(FilledButton)).width;
    debugPrint('Sevimli: $sevimli px, Savatga: $savatga px');
    expect(savatga, closeTo(sevimli * 2, 1));

    // Stack: "Yangi" yorlig'i muqova ichida, chap yuqori burchakdan 8 px
    final muqova = tester.getTopLeft(find.byType(Muqova));
    final yangi = tester.getTopLeft(find.text('Yangi'));
    debugPrint('Muqova: $muqova, Yangi: $yangi');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 33.7s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Kitob sahifasi joylashuvi
Sevimli: 115.33333333333333 px, Savatga: 230.66666666666666 px
Muqova: Offset(16.0, 72.0), Yangi: Offset(30.0, 82.0)
00:01 +1: All tests passed!
```

Natijada:

- Tugmalar uchun joy: 390 − 2×16 (`Padding`) − 12 (`SizedBox`) = 346 px. U `flex` 1:2 nisbatda bo'lindi: 115.3 va 230.7.
- `Yangi` matni (30, 82) nuqtada turibdi. Muqova (16, 72) da, `Positioned` +8 px va yorliq ichidagi `padding` (6, 2) qo'shildi:
  16 + 8 + 6 = 30, 72 + 8 + 2 = 82.

Brauzerda (`flutter build web`, 390 px kenglik):

<img src="/rasmlar/flutter/15-kitob-sahifasi.png" alt="Kitob sahifasi: chapda 'Yangi' yorliqli muqova, o'ngda nom, muallif, 4 yulduz va narx; pastda uchta belgi va ikki tugma" width="320">

## Tipik xatolar

Uzun matn `Row` ga sig'masa:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  testWidgets('Juda keng Row', (tester) async {
    tester.view.physicalSize = const Size(390, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: Row(
          children: [
            Text('Flutter asoslari — to\'liq qo\'llanma, 2026-yil nashri'),
            Icon(Icons.star),
          ],
        ),
      ),
    ));
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: Juda keng Row
══╡ EXCEPTION CAUGHT BY RENDERING LIBRARY ╞═════════════════════════════════════════════════════════
The following assertion was thrown during layout:
A RenderFlex overflowed by 375 pixels on the right.

The relevant error-causing widget was:
  Row Row:file:///home/dasturchi/flutter/salom/test/xato_test.dart:11:15

The overflowing RenderFlex has an orientation of Axis.horizontal.
The edge of the RenderFlex that is overflowing has been marked in the rendering with a yellow and
black striped pattern. This is usually caused by the contents being too big for the RenderFlex.
Consider applying a flex factor (e.g. using an Expanded widget) to force the children of the
RenderFlex to fit within the available space instead of being sized to their natural size.
This is considered an error condition because it indicates that there is content that cannot be
seen. If the content is legitimately bigger than the available space, consider clipping it with a
ClipRect widget before putting it in the flex, or using a scrollable container rather than a Flex,
like a ListView.
…
  
00:02 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/xato_test.dart: Juda keng Row
```

Flutter'ning o'zi tuzatish yo'lini aytadi: bolani `Expanded` ga o'rash (sig'diriladi). Yoki, mazmun haqiqatan katta
bo'lsa, `ClipRect` bilan kesish yoki `ListView` kabi skroll bo'ladigan konteyner. Bu yerda `Expanded(child: Text(…))`
yetarli. Xuddi shu test matnni `Expanded` ga o'rab qayta ishga tushirildi va xatosiz o'tdi:

```text vps
00:00 +0: Expanded bilan
00:02 +1: All tests passed!
```

`Expanded` matnga faqat qolgan kenglikni beradi (FD: bolani mavjud joyga sig'diradi). Cheklovlar qanday ishlashi — 16-bobda.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Uzun matn yoki keng bola `Row` da | Bola o'z tabiiy o'lchamida, joy yetmaydi (sariq-qora chiziq) | `Expanded` / `Flexible` |
| Uzun ro'yxat `Column` da | `Column` skroll bo'lmaydi, pastdan toshadi | `ListView` (17-bob) |
| Ikonkalar `Row` da tarqalib ketadi | `Row` sukut bo'yicha butun kenglikni egallaydi | `mainAxisSize: MainAxisSize.min` |
| Bitta `build` da 6–7 daraja ichma-ich kod | O'qish qiyin (FD maslahati) | Bo'laklarni metod yoki alohida widget'ga ajrating |
| `Stack` da tartibni teskari yozish | Birinchi bola asos, keyingilari ustida chiziladi | Ustda turishi kerak bo'lganini oxiriga qo'ying |

## Amaliyot

1. `Column` uchun asosiy va ko'ndalang o'q qaysi yo'nalish?
2. `mainAxisAlignment: MainAxisAlignment.spaceEvenly` nima qiladi?
3. Uchta `Expanded` ning `flex` lari 1, 1, 2 bo'lsa, 400 px kenglik qanday bo'linadi?
4. `Stack` da qaysi bola eng ustda chiziladi?
5. "A RenderFlex overflowed by … pixels" xatosini qanday tuzatasiz?
6. Muqovaning o'ng pastki burchagiga chegirma yorlig'ini (`-20%`) qo'shing.

<details>
<summary>Javoblar</summary>

1. Asosiy — vertikal, ko'ndalang — gorizontal.
2. Asosiy o'qdagi bo'sh joyni bolalar orasida, birinchisidan oldin va oxirgisidan keyin teng bo'ladi.
3. 100, 100, 200 px (ulushlar 1:1:2, bolalar orasida boshqa widget bo'lmasa).
4. `children` ro'yxatidagi oxirgisi; birinchisi — asos.
5. Toshayotgan bolani `Expanded` (yoki `Flexible`) ga o'rash; mazmun haqiqatan katta bo'lsa — `ListView` kabi skroll bo'ladigan widget (17-bob).
6. `Stack` ga yana bitta `Positioned(right: 8, bottom: 8, child: …)`.

</details>

## Rasmiy hujjat

- [FD: Layouts in Flutter](https://docs.flutter.dev/ui/layout)
- [FD: Build a Flutter layout](https://docs.flutter.dev/ui/layout/tutorial)
- [FD: Layout (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/layout)
- [FD: Widget catalog — Layout](https://docs.flutter.dev/ui/widgets/layout)
