# 18 — Scroll va sliver

[Mundarija](README.md)

## Tushuncha

### Oddiy skroll

FD (Scrolling): ko'p Flutter widget'lari skrollni o'zi qo'llab-quvvatlaydi:

- `SingleChildScrollView` — bitta bolani kerak bo'lganda skroll qiladi;
- `ListView` va `GridView` (17-bob).

Uzun yoki cheksiz ro'yxat uchun elementlarni ko'ringanda qurish kerak: `ListView.builder`, `GridView.builder` (FD).

### Sliver nima

FD (Scrolling): **sliver** — skroll maydonining **bir bo'lagi**. Uni `CustomScrollView` ga qo'yib, shu bo'lak qanday
skroll bo'lishini aniqroq boshqarish mumkin. Masalan:

- elastik skroll;
- parallaks;
- kichrayadigan yoki yo'qoladigan sarlavha.

FD (Slivers tutorial) — widget va sliver farqi:

- **widget** — umumiy UI bo'lagi, daraxtning istalgan joyida ishlatiladi;
- **sliver** — skroll uchun maxsus widget, uning cheklovlari bor:
  - sliver faqat skroll ko'rinishining (`CustomScrollView`, `NestedScrollView`) **bevosita bolasi** bo'la oladi;
  - ba'zi skroll ko'rinishlari faqat sliver qabul qiladi: `CustomScrollView.slivers` ga oddiy widget berib bo'lmaydi;
  - oddiy widget'ni sliver o'rnida ishlatish uchun `SliverToBoxAdapter` yoki `SliverFillRemaining` ga o'rash kerak.

Asosiy sliver'lar:

| Sliver | Vazifasi |
| --- | --- |
| `SliverAppBar` | `CustomScrollView` bilan ishlaydigan app bar; skroll bilan balandligi o'zgaradi (API) |
| `SliverList` / `SliverList.builder` | ro'yxat (ListView'ning sliver varianti) |
| `SliverGrid` | to'r (GridView'ning sliver varianti) |
| `SliverToBoxAdapter` | bitta oddiy widget'ni sliver qiladi |
| `SliverFillRemaining` | skroll maydonining qolgan joyini egallaydi; bolasi oddiy widget (FD) |
| `SliverPadding` | sliver atrofida bo'shliq |

### SliverAppBar

API (SliverAppBar): odatda `CustomScrollView` ning **birinchi** bolasi. Skroll siljishiga qarab balandligi o'zgaradi yoki
boshqa mazmun ustida suzadi. Asosiy xossalari:

| Xossa | Ma'nosi (API) |
| --- | --- |
| `expandedHeight` | to'liq ochilgandagi balandlik (status bar kirmaydi) |
| `flexibleSpace` | toolbar orqasida turadigan widget, odatda `FlexibleSpaceBar` |
| `pinned` | skroll boshida ko'rinib qoladi: kichrayishi mumkin, lekin ekrandan chiqib ketmaydi |
| `floating` | foydalanuvchi app bar tomon skroll qilishi bilan ko'rinadi (tepaga qaytish shart emas) |
| `snap` | faqat `floating: true` bilan; ko'rinishda app bar butunlay chiqib keladi |

Ichma-ich skroll haqida FD: skroll ichida skroll qo'yishda `shrinkWrap: true` yoki sliver — tanlov bor. FD bu mavzuni
"ShrinkWrap vs Slivers" videosiga yo'naltiradi. Bitta skroll maydonida bir nechta ro'yxat yoki to'r kerak bo'lsa, ularni
bitta `CustomScrollView` ichida sliver qilish — shu bobdagi yo'l.

## Ko'rib chiqamiz

Do'kon sahifasi — bitta skroll maydonida to'rt xil bo'lak:

1. kichrayadigan app bar;
2. sarlavha;
3. kategoriyalar to'ri;
4. kitoblar ro'yxati.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const KitobDokoniApp());
}

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
      home: const DokonSahifasi(),
    );
  }
}

class DokonSahifasi extends StatelessWidget {
  const DokonSahifasi({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Bitta skroll maydoni — bir nechta sliver'dan
      body: CustomScrollView(
        slivers: [
          // 1. Skroll bilan kichrayadigan, lekin yo'qolmaydigan (pinned) app bar
          const SliverAppBar(
            pinned: true,
            expandedHeight: 180,
            flexibleSpace: FlexibleSpaceBar(
              title: Text('Kitob do\'koni'),
              background: ColoredBox(
                color: Colors.teal,
                child: Icon(Icons.local_library, size: 96, color: Colors.white24),
              ),
            ),
          ),
          // 2. Oddiy widget — SliverToBoxAdapter ichida
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text('Kategoriyalar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ),
          // 3. To'r — SliverGrid
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            sliver: SliverGrid.count(
              crossAxisCount: 2,
              mainAxisSpacing: 8,
              crossAxisSpacing: 8,
              childAspectRatio: 3,
              children: [
                for (final (nom, ikonka) in kategoriyalar)
                  Card(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(ikonka, color: Colors.teal),
                        const SizedBox(width: 6),
                        // Sig'masa — toshib ketmasdan "…" bilan qisqaradi
                        Flexible(child: Text(nom, overflow: TextOverflow.ellipsis)),
                      ],
                    ),
                  ),
              ],
            ),
          ),
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text('Yangi kitoblar', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ),
          // 4. Uzun ro'yxat — SliverList.builder (ListView.builder kabi, talab bo'yicha)
          SliverList.builder(
            itemCount: 50,
            itemBuilder: (context, i) => ListTile(
              leading: const Icon(Icons.menu_book),
              title: Text('Kitob $i'),
              trailing: Text('${20000 + i * 1000} so\'m'),
            ),
          ),
        ],
      ),
    );
  }
}
```

Test — skroll paytida app bar balandligini o'lchaydi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('SliverAppBar skroll bilan kichrayadi, lekin qoladi', (tester) async {
    tester.view.physicalSize = const Size(390, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const KitobDokoniApp());

    // Sliver — RenderBox emas, o'lchamini ichidagi FlexibleSpaceBar'dan olamiz
    double appBarBalandligi() => tester.getSize(find.byType(FlexibleSpaceBar)).height;
    debugPrint('boshida: ${appBarBalandligi()} px');

    await tester.drag(find.byType(CustomScrollView), const Offset(0, -100));
    await tester.pump();
    debugPrint('100 px skrolldan keyin: ${appBarBalandligi()} px');

    await tester.drag(find.byType(CustomScrollView), const Offset(0, -2000));
    await tester.pump();
    debugPrint('2100 px skrolldan keyin: ${appBarBalandligi()} px');
    expect(find.text('Kitob do\'koni'), findsOneWidget); // pinned — ko'rinib turibdi
    expect(find.text('Kategoriyalar'), findsNothing); // u esa skroll bo'lib ketdi
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 11.9s)
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: SliverAppBar skroll bilan kichrayadi, lekin qoladi
boshida: 180.0 px
100 px skrolldan keyin: 80.0 px
2100 px skrolldan keyin: 56.0 px
00:07 +1: All tests passed!
```

Natijada:

- **180 px** — `expandedHeight`. 100 px skrolldan keyin u **80 px**, ya'ni app bar skroll bilan birga kichraydi.
- Yana skroll qilinganda **56 px** da to'xtadi. Bu toolbar balandligi (`kToolbarHeight`). `pinned: true` bo'lgani uchun
  app bar shu balandlikda ekranda qoldi, "Kategoriyalar" esa skroll bo'lib ketdi.
- Butun sahifa — **bitta** skroll. To'r va ro'yxat alohida skroll bo'lmaydi, birga siljiydi.

Brauzerda (`flutter build web`) — boshida va pastga skroll qilingandan keyin:

<img src="/rasmlar/flutter/18-boshida.png" alt="Ochilgan katta app bar, kategoriyalar to'ri va ro'yxat boshi" width="300"> <img src="/rasmlar/flutter/18-skroll.png" alt="Skrolldan keyin: kichik app bar tepada qolgan, ostida kitoblar ro'yxati" width="300">

## Tipik xatolar

`slivers` ga oddiy widget berish:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  testWidgets('slivers ichida oddiy widget', (tester) async {
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: CustomScrollView(
          slivers: [
            Text('Kategoriyalar'),
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
00:00 +0: slivers ichida oddiy widget
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building Text("Kategoriyalar", dependencies:
[DefaultSelectionStyle, DefaultTextStyle, MediaQuery]):
A RenderViewport expected a child of type RenderSliver but received a child of type RenderParagraph.
RenderObjects expect specific types of children because they coordinate with their children during
layout and paint. For example, a RenderSliver cannot be the child of a RenderBox because a
RenderSliver does not understand the RenderBox layout protocol.

The RenderViewport that expected a RenderSliver child was created by:
  Viewport

The RenderParagraph that did not match the expected child type was created by:
  RichText

The relevant error-causing widget was:
  Text Text:file:///home/dasturchi/flutter/salom/test/xato_test.dart:10:13
```

Xato matni sababni aytadi: viewport `RenderSliver` kutgan, `Text` esa oddiy `RenderBox` (aniqrog'i `RenderParagraph`)
yaratadi. Sliver va box layout protokollari har xil. Tuzatish (FD): `SliverToBoxAdapter(child: Text(…))`.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `slivers` ichida oddiy widget | `CustomScrollView.slivers` faqat sliver qabul qiladi (FD) | `SliverToBoxAdapter` / `SliverFillRemaining` |
| Sliver'ni oddiy `Column` ichiga qo'yish | Sliver faqat skroll ko'rinishining bevosita bolasi (FD) | `CustomScrollView` ichiga |
| `Column` ichida bir nechta `ListView` / `GridView` | Har biri alohida skroll yoki "unbounded height" (16-bob) | Bitta `CustomScrollView` + `SliverList`/`SliverGrid` |
| `snap: true`, lekin `floating: false` | API: `snap` faqat `floating` bilan | `floating: true, snap: true` |
| Testda `getSize(find.byType(SliverAppBar))` | Sliver `RenderBox` emas — `_TypeError` (shu bobni yozishda tutilgan) | Ichidagi box widget'ni o'lchang (`FlexibleSpaceBar`) |
| Tor kartada `Row` + `Text` | Matn sig'masa toshadi (shu bobni yozishda testda chiqdi) | `Flexible(child: Text(…, overflow: TextOverflow.ellipsis))` |

## Amaliyot

1. Sliver nima va oddiy widget'dan nimasi bilan farq qiladi?
2. `CustomScrollView` ichiga sarlavha matnini qanday qo'yasiz?
3. `pinned` va `floating` farqi nima?
4. App bar 180 dan 56 px gacha kichraydi. 56 qayerdan keladi?
5. Nega `Column` ichida `GridView` va `ListView` o'rniga bitta `CustomScrollView` yaxshiroq?
6. App bar'ni `floating: true, snap: true` qiling. Pastga skroll qilib, ozgina tepaga qaytganda nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Skroll maydonining bir bo'lagi. Faqat skroll ko'rinishining bevosita bolasi bo'la oladi; oddiy widget'lar daraxtning istalgan joyida ishlatiladi.
2. `SliverToBoxAdapter(child: Text(…))`.
3. `pinned` — app bar skroll boshida ko'rinib qoladi, ekrandan chiqmaydi; `floating` — tepaga qarab skroll boshlanishi bilan ko'rinadi.
4. Toolbar balandligi — `kToolbarHeight`. `pinned: true` app bar'ni shu balandlikdan pastga tushirmaydi.
5. Hammasi bitta skroll bo'lib siljiydi va "unbounded height" xatosi bo'lmaydi.
6. API: ozgina tepaga skroll qilinishi bilan app bar to'liq chiqib keladi (`snap` animatsiyasi).

</details>

## Rasmiy hujjat

- [FD: Scrolling](https://docs.flutter.dev/ui/layout/scrolling)
- [FD: Using slivers to achieve fancy scrolling](https://docs.flutter.dev/ui/layout/scrolling/slivers)
- [FD: Advanced scrolling and slivers (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/slivers)
- [API: SliverAppBar](https://api.flutter.dev/flutter/material/SliverAppBar-class.html)
- [API: CustomScrollView](https://api.flutter.dev/flutter/widgets/CustomScrollView-class.html)
