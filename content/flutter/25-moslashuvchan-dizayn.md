# 25 — Moslashuvchan dizayn

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: oyna o'lchami testda o'zgartirildi (`flutter test`), skrinshotlar
> brauzerdan (`flutter build web`). Telefon kesigi (notch) testda `FakeViewPadding` bilan taqlid qilindi.

## Tushuncha

### Responsive va adaptive

Flutter ilovasi soatdan tortib katlanadigan telefon va katta monitorgacha ishlaydi. FD (Adaptive and responsive design)
ikki atamani ajratadi:

| Atama | FD ta'rifi | Savol |
| --- | --- | --- |
| **Responsive** (moslashuvchan joylashuv) | UI'ni bor joyga *sig'dirish* — elementlar joylashuvini o'zgartirish | ustunlar nechta bo'lsin? |
| **Adaptive** (moslashuvchan foydalanish) | UI shu joyda *qulay* bo'lishi — mos joylashuv va kiritish usulini tanlash | planshetda pastki panelmi yoki yon panelmi? |

FD: ko'pincha ikkalasi bitta atama bilan ataladi — odatda *adaptive design*.

### Uch qadam: ajrat, o'lcha, tarmoqla

FD (General approach):

1. **Ajratish** (abstract) — qaysi widget'lar o'zgarishini aniqlash va umumiy ma'lumotini ajratib olish. Ko'p uchraydigan
   misollar: dialoglar, navigatsiya (yon panel yoki pastki panel), "joy balandmi yoki kengmi" ga qarab joylashuv.
2. **O'lchash** (measure) — ikki yo'l: `MediaQuery` va `LayoutBuilder`.
3. **Tarmoqlash** (branch) — chegara (breakpoint) qiymatlarini tanlab, UI'ning qaysi variantini ko'rsatishni hal qilish.

### `MediaQuery.sizeOf` va `LayoutBuilder`

| | `MediaQuery.sizeOf(context)` | `LayoutBuilder` |
| --- | --- | --- |
| Nimani beradi | **butun oyna** o'lchami (`Size`) | **ota widget** bergan cheklovlar (`BoxConstraints`: eng kichik va eng katta eni, bo'yi) |
| Qachon | ilova umumiy tuzilishi: navigatsiya turi | daraxtning aniq bir joyi: shu yerga tegan joy |

FD: `MediaQuery.of(context).size` emas, **`MediaQuery.sizeOf(context)`** — "unumdorlik uchun". API: `sizeOf` faqat o'lcham
o'zgarganda `context` ni qayta quradi; `of` esa `MediaQueryData` ning istalgan qismi (chekinishlar, shrift o'lchami,
yorqinlik…) o'zgarganda.

`MediaQuery` faqat o'lcham emas: FD bo'yicha unda shrift kattalashtirish, yuqori kontrast, ekran o'quvchi (TalkBack,
VoiceOver) yoqilgani, ekrandagi bukilish joyi (hinge) kabi ma'lumotlar ham bor.

### Chegara — qurilma turi emas, oyna kengligi

FD (General approach): Material ko'rsatmasi bo'yicha **600 mantiqiy pikseldan tor** oynada pastki navigatsiya paneli,
**600 va undan keng** oynada yon panel (navigation rail). "Tanlov qurilma *turiga* emas, oynaning mavjud o'lchamiga
bog'liq bo'lishi kerak." FD o'quv qo'llanmasi (Adaptive layout) ham 600 ni telefon va planshet orasidagi keng tarqalgan
chegara deydi.

FD (Best practices) — nima qilmaslik:

- **Qurilma turini tekshirmang** — "telefonmi yoki planshetmi" degan kod yozmang. Ko'p qurilmalar bir nechta oynada
  ishlaydi: ilova jismoniy ekrandan kichik joyda chizilishi mumkin; web va desktopda oyna har qanday o'lchamda bo'ladi.
- **Ekran yo'nalishiga (orientation) qarab joylashuv tanlamang** — daraxtning yuqorisida `MediaQuery` ning `orientation` i
  yoki `OrientationBuilder` o'rniga `sizeOf` yoki `LayoutBuilder` va chegaralar.
- **Yo'nalishni qulflamang** — FD: Android ham, Flutter ham yo'nalishni qulflamaslikni tavsiya qiladi; katlanadigan
  qurilmada qulflangan ilova chetlari bo'sh "qutida" (letterbox) ko'rinadi.
- **Butun kenglikni egallab olmang** — keng ekranda butun kenglikka cho'zilgan matn va maydonlar noqulay. FD (Large
  screens): `ConstrainedBox` bilan eng katta enini (`maxWidth`) bering yoki `ListView` ni `GridView` ga almashtiring.

### `Platform.isIOS` — joylashuv uchun emas

FD (Capabilities & policies): `Platform.isAndroid`, `Platform.isIOS`, `kIsWeb` kod qayerda ishlayotganini aytadi, lekin
**joylashuv yoki qurilma nima qila olishi haqida qaror uchun ishlatilmasin**. Buning o'rniga nimaga qarab tarmoqlanayotganingizni
nomlangan metodga chiqaring:

- **imkoniyat** (capability) — kod yoki qurilma nima *qila oladi*: API borligi, OS cheklovi, kamera kabi qurilma;
- **siyosat** (policy) — kod nima *qilishi kerak*: do'kon qoidalari, dizayn tanlovi, server tomonda yoqilgan funksiya.

FD misoli:

```dart
class Policy {
  bool shouldAllowPurchaseClick() {
    // Banned by Apple App Store guidelines.
    return !Platform.isIOS;
  }
}
```

Shunda widget testi `shouldAllowPurchaseClick` ni almashtirib, ilova qayerda ishlashidan qat'i nazar tekshira oladi;
keyinchalik qoida o'zgarsa, faqat shu metod o'zgaradi.

### `SafeArea`

Telefon ekranining bir qismini tizim paneli (status bar), kesik (notch) yoki yumaloq burchaklar to'sadi. FD (SafeArea &
MediaQuery): **`SafeArea`** `MediaQuery` ning `padding` qiymatiga qarab ichidagi widget'ni shuncha ichkariga suradi.

Nega `MediaQueryData.padding` ni qo'lda qo'shmaslik kerak? FD: `SafeArea` o'z ichidagilar uchun `MediaQuery` ni o'zgartiradi
— go'yo chekinish yo'qdek. Shuning uchun `SafeArea` larni **ichma-ich qo'yish mumkin**: chekinishni faqat eng tashqisi
qo'shadi. To'rt tomonning har birini o'chirib qo'yish mumkin (standart — to'rttasi ham yoqilgan).

Qayerga: FD **`Scaffold` ning `body`** sini o'rashni tavsiya qiladi, butun `Scaffold` ni emas — `AppBar` o'zi tizim
paneli ostiga kirib, tepani to'ldiradi.

### Ro'yxat holatini saqlash

FD (Best practices): oyna o'lchami o'zgarganda, aylantirilgan, katlangan yoki ochilganda ilova holatini saqlashi kerak.
Joylashuv o'zgarganda `ListView` qayta yaratilsa, aylantirish (scroll) joyi yo'qoladi — FD **`PageStorageKey`** ni
tavsiya qiladi: u widget yo'q qilinganda holatini saqlab, qayta yaratilganda tiklaydi.

## Ko'rib chiqamiz

Kitob do'koni ikki bo'lim bilan — "Kitoblar" (ro'yxat) va "Javon" (muqovalar to'ri):

| Oyna | Navigatsiya (`MediaQuery.sizeOf`) | Kitoblar (`LayoutBuilder`) |
| --- | --- | --- |
| < 600 | pastki `NavigationBar` | ro'yxat; bosilganda yangi sahifa |
| ≥ 600 | yon `NavigationRail` | ro'yxat ≥ 600 joy olsa — ikki ustun: chapda ro'yxat, o'ngda tanlangan kitob |

`NavigationBar` — API: Material 3 navigatsiya paneli; FD (Large screens) misolida eski `BottomNavigationBar` nomi
keladi, ikkalasining vazifasi bir: asosiy bo'limlar orasida o'tish.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

/// Material: 600 dan tor oynada pastki panel, 600 va undan kengida yon panel (rail).
const kengOyna = 600.0;

class Kitob {
  const Kitob(this.nom, this.muallif, this.yil);

  final String nom;
  final String muallif;
  final int yil;
}

const kitoblar = [
  Kitob('Dart tili', 'D. Rasulov', 2024),
  Kitob('Flutter asoslari', 'N. Karimova', 2025),
  Kitob('Toza kod', 'R. Martin', 2008),
  Kitob('Algoritmlar', 'A. Qodirov', 2021),
  Kitob('Tarmoq asoslari', 'S. Aliyeva', 2023),
  Kitob('Ma\'lumotlar bazasi', 'B. Usmonov', 2022),
  Kitob('Linux buyruqlari', 'J. Tursunov', 2020),
  Kitob('Git bilan ishlash', 'M. Ergasheva', 2026),
];

void main() => runApp(const DokonApp());

class DokonApp extends StatelessWidget {
  const DokonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const DokonSahifasi(),
    );
  }
}

class DokonSahifasi extends StatefulWidget {
  const DokonSahifasi({super.key});

  @override
  State<DokonSahifasi> createState() => _DokonSahifasiState();
}

class _DokonSahifasiState extends State<DokonSahifasi> {
  int _bolim = 0;
  Kitob? _tanlangan;

  void _bolimTanla(int i) => setState(() => _bolim = i);

  @override
  Widget build(BuildContext context) {
    // Butun oyna kengligi — navigatsiya turini tanlash uchun
    final keng = MediaQuery.sizeOf(context).width >= kengOyna;
    final tarkib = _bolim == 0 ? _kitoblarBolimi() : const KitobJavoni();

    return Scaffold(
      appBar: AppBar(title: const Text('Kitob do\'koni')),
      body: SafeArea(
        child: keng
            ? Row(
                children: [
                  NavigationRail(
                    selectedIndex: _bolim,
                    onDestinationSelected: _bolimTanla,
                    labelType: NavigationRailLabelType.all,
                    destinations: const [
                      NavigationRailDestination(icon: Icon(Icons.list), label: Text('Kitoblar')),
                      NavigationRailDestination(icon: Icon(Icons.grid_view), label: Text('Javon')),
                    ],
                  ),
                  const VerticalDivider(width: 1),
                  Expanded(child: tarkib),
                ],
              )
            : tarkib,
      ),
      bottomNavigationBar: keng
          ? null
          : NavigationBar(
              selectedIndex: _bolim,
              onDestinationSelected: _bolimTanla,
              destinations: const [
                NavigationDestination(icon: Icon(Icons.list), label: 'Kitoblar'),
                NavigationDestination(icon: Icon(Icons.grid_view), label: 'Javon'),
              ],
            ),
    );
  }

  Widget _kitoblarBolimi() {
    // Shu joyga tegan kenglik — ro'yxat bitta yoki ikki ustun bo'lishini tanlash uchun
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= kengOyna) {
          final k = _tanlangan;
          return Row(
            children: [
              SizedBox(
                width: 280,
                child: KitoblarRoyxati(
                  tanlangan: k,
                  onTanla: (kitob) => setState(() => _tanlangan = kitob),
                ),
              ),
              const VerticalDivider(width: 1),
              Expanded(
                child: k == null ? const Center(child: Text('Kitob tanlang')) : KitobTafsiloti(kitob: k),
              ),
            ],
          );
        }
        return KitoblarRoyxati(
          onTanla: (kitob) {
            setState(() => _tanlangan = kitob);
            Navigator.push(context, MaterialPageRoute(builder: (_) => KitobSahifasi(kitob: kitob)));
          },
        );
      },
    );
  }
}

class KitoblarRoyxati extends StatelessWidget {
  const KitoblarRoyxati({super.key, this.tanlangan, required this.onTanla});

  final Kitob? tanlangan;
  final ValueChanged<Kitob> onTanla;

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      // Joylashuv o'zgarganda ham aylantirish (scroll) holati saqlanadi
      key: const PageStorageKey('kitoblar'),
      itemCount: kitoblar.length,
      itemBuilder: (context, i) {
        final k = kitoblar[i];
        return ListTile(
          title: Text(k.nom),
          subtitle: Text(k.muallif),
          selected: k == tanlangan,
          onTap: () => onTanla(k),
        );
      },
    );
  }
}

class KitobTafsiloti extends StatelessWidget {
  const KitobTafsiloti({super.key, required this.kitob});

  final Kitob kitob;

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topLeft,
      child: ConstrainedBox(
        // Keng ekranda matn butun kenglikka cho'zilib ketmasin
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(kitob.nom, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text('Muallif: ${kitob.muallif}'),
              Text('Nashr yili: ${kitob.yil}'),
            ],
          ),
        ),
      ),
    );
  }
}

class KitobSahifasi extends StatelessWidget {
  const KitobSahifasi({super.key, required this.kitob});

  final Kitob kitob;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(kitob.nom)),
      body: SafeArea(child: KitobTafsiloti(kitob: kitob)),
    );
  }
}

class KitobJavoni extends StatelessWidget {
  const KitobJavoni({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      // Ustunlar soni qurilma turidan emas, berilgan kenglikdan chiqadi
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
        maxCrossAxisExtent: 180,
        childAspectRatio: 3 / 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
      ),
      itemCount: kitoblar.length,
      itemBuilder: (context, i) => Card(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.menu_book, size: 48),
            const SizedBox(height: 8),
            Text(kitoblar[i].nom, textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}
```

Muhim joylar:

- **Ikki xil o'lchov.** Navigatsiya — butun oynaga qarab (`MediaQuery.sizeOf`), kitoblar bo'limi — o'ziga tegan joyga
  qarab (`LayoutBuilder`). Yon panel ham joy egallaydi, shuning uchun ular har doim bir xil javob bermaydi (pastda 650 px
  sinovi).
- **Holat yuqorida.** `_tanlangan` `DokonSahifasi` da turadi — oyna torayib-kengayganda tanlangan kitob yo'qolmaydi.
- **`GridView` ustunlari.** `SliverGridDelegateWithMaxCrossAxisExtent` — "har katak eng ko'pi bilan 180 px". API: delegat
  shu chegaradan oshmaydigan va enni teng bo'ladigan eng katta katak o'lchamini tanlaydi; ustunlar soni shundan chiqadi.
  FD (Large screens): ustunlar sonini "planshetmi" ga qarab qo'lda qo'ymang — u oyna o'lchamiga bog'liq bo'lsin.
- **`ConstrainedBox(maxWidth: 480)`** — keng ekranda kitob ma'lumoti butun kenglikka cho'zilmaydi.

### Testda oyna o'lchamini o'zgartirish

`flutter_test` da `tester.view` — test oynasi. `physicalSize` va `devicePixelRatio` bilan o'lcham beriladi, `padding` bilan
tizim paneli va kesik taqlid qilinadi; `addTearDown(tester.view.reset)` keyingi test uchun asl holatga qaytaradi.

`test/widget_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

// Test oynasi o'lchamini mantiqiy piksellarda beradi
void oyna(WidgetTester tester, double eni, double boyi) {
  tester.view.devicePixelRatio = 1;
  tester.view.physicalSize = Size(eni, boyi);
  addTearDown(tester.view.reset);
}

int ustunlar(WidgetTester tester) =>
    tester.widgetList(find.byType(Card)).map((w) => tester.getTopLeft(find.byWidget(w)).dx).toSet().length;

void main() {
  testWidgets('Telefon: pastki panel, bosilganda yangi sahifa', (tester) async {
    oyna(tester, 390, 844);
    await tester.pumpWidget(const DokonApp());
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.byType(NavigationRail), findsNothing);

    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    expect(find.text('Muallif: R. Martin'), findsOneWidget);
    expect(find.byType(BackButton), findsOneWidget);
    debugPrint('390: NavigationBar, bosildi → yangi sahifa (orqaga tugmasi bor)');
  });

  testWidgets('Planshet: yon panel va ikki ustun', (tester) async {
    oyna(tester, 1000, 700);
    await tester.pumpWidget(const DokonApp());
    expect(find.byType(NavigationRail), findsOneWidget);
    expect(find.byType(NavigationBar), findsNothing);
    expect(find.text('Kitob tanlang'), findsOneWidget);

    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    expect(find.text('Muallif: R. Martin'), findsOneWidget);
    expect(find.byType(BackButton), findsNothing);
    final x = tester.getTopLeft(find.text('Muallif: R. Martin')).dx;
    debugPrint('1000: NavigationRail, bosildi → shu ekranda o\'ngda (x=$x), yangi sahifa yo\'q');
  });

  testWidgets('650: oyna keng, lekin ro\'yxatga tegan joy tor', (tester) async {
    oyna(tester, 650, 800);
    await tester.pumpWidget(const DokonApp());
    final royxatEni = tester.getSize(find.byType(ListView)).width;
    expect(find.byType(NavigationRail), findsOneWidget);
    expect(find.text('Kitob tanlang'), findsNothing);
    debugPrint('650: NavigationRail bor, ro\'yxatga $royxatEni px → bitta ustun');
  });

  testWidgets('Javon: ustunlar soni kenglikka qarab', (tester) async {
    for (final eni in [390.0, 650.0, 1000.0]) {
      oyna(tester, eni, 900);
      await tester.pumpWidget(const DokonApp());
      await tester.tap(find.text('Javon'));
      await tester.pumpAndSettle();
      debugPrint('$eni: ${ustunlar(tester)} ustun');
    }
  });

  testWidgets('Oyna o\'zgarganda holat saqlanadi', (tester) async {
    oyna(tester, 1000, 500);
    await tester.pumpWidget(const DokonApp());
    await tester.tap(find.text('Algoritmlar'));
    await tester.pump();

    oyna(tester, 390, 500);
    await tester.pump();
    await tester.drag(find.byType(ListView), const Offset(0, -100));
    await tester.pump();
    double surilgan() => tester.state<ScrollableState>(find.byType(Scrollable).first).position.pixels;
    debugPrint('390: ro\'yxat ${surilgan()} px surildi');

    oyna(tester, 1000, 500);
    await tester.pump();
    expect(find.text('Muallif: A. Qodirov'), findsOneWidget);
    debugPrint('1000 ga qaytdi: tanlangan — Algoritmlar, ro\'yxat ${surilgan()} px da');
  });

  testWidgets('SafeArea: ichma-ich bo\'lsa ham bir marta chekinadi', (tester) async {
    oyna(tester, 390, 844);
    tester.view.padding = const FakeViewPadding(top: 47); // kesik (notch) va holat paneli
    await tester.pumpWidget(const Directionality(
      textDirection: TextDirection.ltr,
      child: Stack(children: [
        Positioned(left: 0, top: 0, child: Text('oddiy')),
        Positioned(left: 100, top: 0, right: 0, child: SafeArea(child: Text('bitta'))),
        Positioned(left: 200, top: 0, right: 0, child: SafeArea(child: SafeArea(child: Text('ikkita')))),
      ]),
    ));
    for (final s in ['oddiy', 'bitta', 'ikkita']) {
      debugPrint('$s: y=${tester.getTopLeft(find.text(s)).dy}');
    }
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 5.6s)
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Telefon: pastki panel, bosilganda yangi sahifa
390: NavigationBar, bosildi → yangi sahifa (orqaga tugmasi bor)
00:02 +1: Planshet: yon panel va ikki ustun
1000: NavigationRail, bosildi → shu ekranda o'ngda (x=422.0), yangi sahifa yo'q
00:03 +2: 650: oyna keng, lekin ro'yxatga tegan joy tor
650: NavigationRail bor, ro'yxatga 533.0 px → bitta ustun
00:03 +3: Javon: ustunlar soni kenglikka qarab
390.0: 2 ustun
650.0: 3 ustun
1000.0: 5 ustun
00:04 +4: Oyna o'zgarganda holat saqlanadi
390: ro'yxat 80.0 px surildi
1000 ga qaytdi: tanlangan — Algoritmlar, ro'yxat 80.0 px da
00:05 +5: SafeArea: ichma-ich bo'lsa ham bir marta chekinadi
oddiy: y=0.0
bitta: y=47.0
ikkita: y=47.0
00:05 +6: All tests passed!
```

Natijada:

- **390 px** — pastki panel; kitob bosilganda yangi sahifa ochildi (orqaga tugmasi bor).
- **1000 px** — yon panel; kitob shu ekranning o'ng ustunida ko'rindi, yangi sahifa ochilmadi.
- **650 px** — eng qiziq holat. Oyna 600 dan keng, shuning uchun `MediaQuery.sizeOf` yon panelni tanladi. Lekin yon panel
  joy olgach, kitoblar bo'limiga 533 px qoldi — `LayoutBuilder` bitta ustunni tanladi. Ikkala qaror ham to'g'ri: biri
  oynaga, biri joyga qarab.
- **Javon** 2 → 3 → 5 ustun: hech qayerda "telefon" yoki "planshet" deb yozilmagan.
- **Holat:** tanlangan kitob (Algoritmlar) va ro'yxatning aylantirilgan joyi (80 px) oyna torayib-kengayganda saqlandi.
- **SafeArea:** oddiy matn kesik ostida qoldi (y=0). Bitta `SafeArea` 47 px pastga surdi; ichma-ich ikkitasi ham 47 px —
  94 emas. FD aytganidek, ichkisi chekinishni ko'rmaydi.

### Brauzerda

`flutter build web` natijasi brauzerda. Tepada — 390 px oyna: pastki panel, "Kitoblar" bo'limi va "Javon" (2 ustun):

<img src="/rasmlar/flutter/25-telefon.png" alt="390 px: Kitob do'koni ro'yxati, pastda Kitoblar va Javon paneli" width="240"> <img src="/rasmlar/flutter/25-telefon-javon.png" alt="390 px: Javon bo'limi, ikki ustunli muqovalar" width="240">

Pastda — 1000 px oyna: yon panel, ikki ustun, "Toza kod" tanlangan:

<img src="/rasmlar/flutter/25-planshet.png" alt="1000 px: chapda yon panel, o'rtada kitoblar ro'yxati, o'ngda Toza kod ma'lumoti" width="640">

## Tipik xatolar

Quyidagi uch xato alohida testda (`test/xato_test.dart`) VPS'da tekshirildi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

int ofQurildi = 0;
int sizeOfQurildi = 0;

class OfBilan extends StatelessWidget {
  const OfBilan({super.key});

  @override
  Widget build(BuildContext context) {
    ofQurildi++;
    return Text('${MediaQuery.of(context).size.width}');
  }
}

class SizeOfBilan extends StatelessWidget {
  const SizeOfBilan({super.key});

  @override
  Widget build(BuildContext context) {
    sizeOfQurildi++;
    return Text('${MediaQuery.sizeOf(context).width}');
  }
}

void main() {
  testWidgets('MediaQuery.of va sizeOf: qayta qurilish', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: Column(children: [OfBilan(), SizeOfBilan()])));
    tester.platformDispatcher.textScaleFactorTestValue = 1.5; // shrift kattalashtirildi
    await tester.pump();
    tester.view.padding = const FakeViewPadding(top: 47); // tizim paneli o'zgardi
    await tester.pump();
    addTearDown(tester.platformDispatcher.clearAllTestValues);
    addTearDown(tester.view.reset);
    debugPrint('of: $ofQurildi marta, sizeOf: $sizeOfQurildi marta qurildi');
  });

  testWidgets('LayoutBuilder chegarasiz joyda', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: LayoutBuilder(builder: (context, c) {
          debugPrint('maxWidth = ${c.maxWidth}, >= 600: ${c.maxWidth >= 600}');
          return const SizedBox(width: 100, height: 100);
        }),
      ),
    ));
  });

  testWidgets('SafeArea Scaffold ustida va body ustida', (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 844);
    tester.view.padding = const FakeViewPadding(top: 47);
    addTearDown(tester.view.reset);

    final appBar = AppBar(title: const Text('Do\'kon'));
    await tester.pumpWidget(MaterialApp(home: SafeArea(child: Scaffold(appBar: appBar, body: const Text('tana')))));
    debugPrint('SafeArea(Scaffold): AppBar ${tester.getRect(find.byType(AppBar))}');

    await tester.pumpWidget(MaterialApp(home: Scaffold(appBar: appBar, body: const SafeArea(child: Text('tana')))));
    debugPrint('Scaffold(body: SafeArea): AppBar ${tester.getRect(find.byType(AppBar))}');
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: MediaQuery.of va sizeOf: qayta qurilish
of: 3 marta, sizeOf: 1 marta qurildi
00:01 +1: LayoutBuilder chegarasiz joyda
maxWidth = Infinity, >= 600: true
00:01 +2: SafeArea Scaffold ustida va body ustida
SafeArea(Scaffold): AppBar Rect.fromLTRB(0.0, 47.0, 390.0, 103.0)
Scaffold(body: SafeArea): AppBar Rect.fromLTRB(0.0, 0.0, 390.0, 103.0)
00:02 +3: All tests passed!
```

- Oyna o'lchami o'zgarmadi, faqat shrift va tizim paneli — `of` bilan widget yana 2 marta qurildi, `sizeOf` bilan bir
  marta ham.
- Gorizontal aylanadigan joyda `LayoutBuilder` cheksiz enni oladi — `>= 600` doim `true`.
- `SafeArea` butun `Scaffold` ni o'raganda `AppBar` 47 px pastga tushdi, tepasida bo'sh chiziq qoldi. `body` o'ralganda
  `AppBar` tepadan (y=0) boshlanib, tizim paneli ostini o'zi to'ldirdi (bo'yi 56 + 47 = 103).

`PageStorageKey` ni olib tashlab, "holat saqlanadi" testini qayta ishga tushirsak:

```text vps
390: ro'yxat 80.0 px surildi
1000 ga qaytdi: tanlangan — Algoritmlar, ro'yxat 0.0 px da
```

Ro'yxat joylashuv o'zgarganda qayta yaratildi va boshiga qaytdi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `MediaQuery.of(context).size` | Istalgan `MediaQuery` o'zgarishida qayta qurish (testda 2 ortiqcha) | `MediaQuery.sizeOf(context)` (FD, API) |
| "Telefonmi yoki planshetmi" tekshiruvi | Ko'p oynali rejim, web va desktopda oyna har xil | Oyna kengligi va chegara (FD) |
| `Platform.isIOS` bilan joylashuv tanlash | Qayerda ishlayotgani — imkoniyat emas | Imkoniyat yoki siyosat metodi (FD) |
| `orientation` ga qarab butun joylashuvni almashtirish | Yo'nalish o'lchamni aytmaydi | `sizeOf` yoki `LayoutBuilder` (FD) |
| Gorizontal aylanadigan joyda `LayoutBuilder` | `maxWidth` = `Infinity` | Chegaralangan ota ichida o'lchang |
| `SafeArea` butun `Scaffold` ustida | `AppBar` pastga tushadi, tepada bo'shliq | `SafeArea` `body` ustida (FD) |
| `MediaQuery.paddingOf` ni qo'lda qo'shish | Ichma-ich joylarda chekinish ikki marta | `SafeArea` (FD) |
| Joylashuv almashganda ro'yxat boshiga qaytadi | `ListView` qayta yaratildi | `PageStorageKey` (FD) |
| Keng ekranda matn butun kenglikda | FD: katta ekranda yaxshi ko'rinmaydi | `ConstrainedBox(maxWidth: …)` yoki `GridView` (FD) |

## Amaliyot

1. Responsive va adaptive dizayn farqi nima (FD ta'rifi bilan)?
2. `MediaQuery.sizeOf` va `LayoutBuilder` qaysi o'lchamni beradi? Navigatsiya turi uchun qaysi biri?
3. Nega `MediaQuery.of(context).size` emas, `MediaQuery.sizeOf(context)`?
4. Material bo'yicha pastki panel va yon panel chegarasi qancha?
5. Nega `SafeArea` ichma-ich bo'lsa ham chekinish ikki marta qo'shilmaydi?
6. FD nega `Platform.isIOS` ni joylashuv uchun ishlatmaslikni aytadi? O'rniga nima?
7. "Javon" da `maxCrossAxisExtent` ni 180 dan 240 ga o'zgartiring. 390, 650 va 1000 px oynada nechta ustun bo'ladi? Avval
   API qoidasi bo'yicha hisoblang, keyin testdagi `ustunlar` bilan tekshiring.

<details>
<summary>Javoblar</summary>

1. Responsive — UI'ni bor joyga sig'dirish (joylashuv), adaptive — shu joyda qulay ishlatiladigan qilish (mos joylashuv va
   kiritish usuli tanlash).
2. `sizeOf` — butun oyna o'lchami (`Size`), `LayoutBuilder` — ota widget bergan cheklovlar (`BoxConstraints`).
   Navigatsiya ilovaning umumiy tuzilishi — oynaga qarab, `sizeOf`.
3. `sizeOf` faqat o'lcham o'zgarganda qayta quradi; `of` — `MediaQueryData` ning istalgan qismi o'zgarganda. Testda shrift va
   tizim paneli o'zgarganda `of` 2 marta ortiqcha qurildi.
4. 600 mantiqiy piksel: torroq — pastki panel, 600 va kengroq — yon panel (navigation rail).
5. `SafeArea` ichidagilar uchun `MediaQuery` ni o'zgartiradi — go'yo chekinish yo'q; ichkisi 0 ko'radi. Testda bitta ham,
   ikkita ham — 47 px.
6. `Platform.isIOS` kod qayerda ishlayotganini aytadi, qurilma nima qila olishini yoki oyna o'lchamini emas. Joylashuv uchun
   — oyna o'lchami; boshqa qarorlar uchun nomlangan imkoniyat (capability) yoki siyosat (policy) metodi — testda
   almashtirish ham oson.
7. 2, 3 va 4 ustun. Kenglikdan avval `padding` (12 + 12) ayiriladi, so'ng eng kam ustunlar soni topiladi, unda katak eni
   (ustunlar orasidagi 12 px oraliqni ayirib) 240 dan oshmasin. 390 px: joy 366, 2 ustun → 177 px. 650 px: yon panel
   bor, javonga 533, joy 509: 2 ustun → 248,5 (oshadi), 3 ustun → 161,7. 1000 px: javonga 883, joy 859: 3 ustun → 278
   (oshadi), 4 ustun → 205,75. VPS'dagi test: `390.0: 2 ustun`, `650.0: 3 ustun`, `1000.0: 4 ustun`.

</details>

## Rasmiy hujjat

- [FD: Adaptive and responsive design](https://docs.flutter.dev/ui/adaptive-responsive)
- [FD: General approach](https://docs.flutter.dev/ui/adaptive-responsive/general)
- [FD: SafeArea & MediaQuery](https://docs.flutter.dev/ui/adaptive-responsive/safearea-mediaquery)
- [FD: Large screens & foldables](https://docs.flutter.dev/ui/adaptive-responsive/large-screens)
- [FD: Best practices for adaptive design](https://docs.flutter.dev/ui/adaptive-responsive/best-practices)
- [FD: Capabilities & policies](https://docs.flutter.dev/ui/adaptive-responsive/capabilities)
- [FD: Adaptive layout (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/adaptive-layout)
- [API: MediaQuery.sizeOf](https://api.flutter.dev/flutter/widgets/MediaQuery/sizeOf.html) · [LayoutBuilder](https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html) · [SafeArea](https://api.flutter.dev/flutter/widgets/SafeArea-class.html) · [NavigationRail](https://api.flutter.dev/flutter/material/NavigationRail-class.html) · [NavigationBar](https://api.flutter.dev/flutter/material/NavigationBar-class.html) · [SliverGridDelegateWithMaxCrossAxisExtent](https://api.flutter.dev/flutter/rendering/SliverGridDelegateWithMaxCrossAxisExtent-class.html) · [PageStorageKey](https://api.flutter.dev/flutter/widgets/PageStorageKey-class.html)
