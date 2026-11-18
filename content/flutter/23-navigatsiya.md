# 23 — Navigatsiya

[Mundarija](README.md)

## Tushuncha

### Ekran — bu route

FD (Navigate to a new screen and back): Flutter'da ekran va sahifalar **route** (yo'nalish) deb ataladi. Android'da route
`Activity` ga, iOS'da `ViewController` ga to'g'ri keladi. Flutter'da route — oddiy widget.

FD (Navigation and routing): **`Navigator`** ekranlarni **stek** (stack) ko'rinishida ushlaydi va har platformaga mos
o'tish animatsiyasini beradi. Stek — ustma-ust qo'yilgan kitoblar kabi: yangi ekran ustiga qo'yiladi, orqaga qaytilganda
ustidagisi olinadi.

| Metod | Nima qiladi (FD) |
| --- | --- |
| `Navigator.push(context, route)` | yangi route'ni stek ustiga qo'yadi |
| `Navigator.pop(context)` | ustidagi route'ni olib tashlaydi |
| `pushReplacement` | ustidagi route'ni yangisiga almashtiradi |
| `pushAndRemoveUntil` | yangisini qo'yib, shart bajarilguncha eskilarini olib tashlaydi |
| `popUntil` | shart bajarilguncha ustidagilarni olib tashlaydi |

Route ob'ekti: **`MaterialPageRoute`** (Material o'tish animatsiyasi) yoki **`CupertinoPageRoute`** (iOS uslubi: o'ngdan
kirish, chetdan surib orqaga qaytish).

### Qaysi usul (FD)

| Usul | Qachon |
| --- | --- |
| `Navigator` + `MaterialPageRoute` | kichik ilova, murakkab deep link yo'q |
| Nomli route'lar (`MaterialApp.routes`, `pushNamed`) | FD **tavsiya qilmaydi**: deep link xatti-harakatini sozlab bo'lmaydi, brauzerning "oldinga" tugmasi ishlamaydi |
| `Router` + routing paketi (masalan, `go_router`) | murakkab navigatsiya, har ekranga to'g'ridan-to'g'ri havola, web'da manzil satri bilan sinxron (24-bob) |

Bu bobda — birinchisi.

### Ma'lumot yuborish va qaytarish

- **Yuborish** (FD, Send data to a new screen): ekran — oddiy widget, ma'lumot unga **konstruktor** orqali beriladi:
  `KitobSahifasi(kitob: k)`.
- **Qaytarish** (FD, Return data from a screen): `Navigator.pop(context, natija)` — ikkinchi argument. `push` esa
  **`Future`** qaytaradi, u `pop` chaqirilganda shu natija bilan tugaydi: `final soni = await Navigator.push<int>(…)`.
  Foydalanuvchi orqaga tugmasi bilan qaytsa — natija `null`.
- FD: `StatefulWidget` dan olingan `BuildContext` `await` dan keyin ishlatilsa, avval **`context.mounted`** tekshiriladi —
  ekran shu orada yopilgan bo'lishi mumkin.

### Tab va drawer

FD (Add a drawer): Material ilovalarda ikki asosiy navigatsiya varianti — **tab**lar va **drawer** (yon menyu). Tablarga
joy yetmasa, drawer qulay.

- **Tablar** (FD, Work with tabs): `TabBar` (tugmalar) va `TabBarView` (mazmun) bir-biriga **`TabController`** orqali
  bog'lanadi. Eng oddiy yo'li — `DefaultTabController`: u controller'ni o'zi yaratib, avlodlariga beradi. FD: `TabBarView`
  dagi tartib `TabBar` dagi tartibga mos bo'lishi shart.
- **Drawer** (FD): `Scaffold(drawer: Drawer(…))`. `AppBar` ochish tugmasini (`DrawerButton`) o'zi qo'shadi. FD: drawer
  ochilganda u navigatsiya stekiga qo'shiladi, shuning uchun uni `Navigator.pop(context)` bilan yopasiz.

## Ko'rib chiqamiz

Kitob do'koni: ikki tab (yangi va ommabop kitoblar), drawer'da "Sozlamalar", kitob bosilsa uning sahifasi ochiladi va
tanlangan miqdor qaytariladi.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

class Kitob {
  const Kitob(this.nom, this.muallif, this.narx);

  final String nom;
  final String muallif;
  final int narx;
}

const yangi = [
  Kitob('Dart tili', 'D. Rasulov', 85000),
  Kitob('Flutter asoslari', 'N. Karimova', 120000),
];
const ommabop = [
  Kitob('Toza kod', 'R. Martin', 99000),
  Kitob('Algoritmlar', 'T. Kormen', 150000),
];

void main() {
  runApp(const DokonApp());
}

class DokonApp extends StatelessWidget {
  const DokonApp({super.key, this.kuzatuvchilar = const []});

  final List<NavigatorObserver> kuzatuvchilar;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      navigatorObservers: kuzatuvchilar, // stekdagi o'zgarishlarni kuzatish (test uchun)
      home: const BoshSahifa(),
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    // DefaultTabController: TabBar va TabBarView ni sinxron ushlaydi
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Kitob do\'koni'),
          bottom: const TabBar(tabs: [Tab(text: 'Yangi'), Tab(text: 'Ommabop')]),
        ),
        drawer: Drawer(
          child: ListView(
            padding: EdgeInsets.zero,
            children: [
              const DrawerHeader(child: Text('Menyu')),
              ListTile(
                leading: const Icon(Icons.settings),
                title: const Text('Sozlamalar'),
                onTap: () {
                  Navigator.pop(context); // avval drawer'ni yopish — u ham stekda
                  Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      settings: const RouteSettings(name: 'sozlamalar'),
                      builder: (context) => Scaffold(
                        appBar: AppBar(title: const Text('Sozlamalar')),
                        body: const Center(child: Text('Hozircha bo\'sh')),
                      ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
        // Tartib TabBar'dagi tab'lar tartibiga mos bo'lishi shart
        body: const TabBarView(
          children: [KitoblarRoyxati(kitoblar: yangi), KitoblarRoyxati(kitoblar: ommabop)],
        ),
      ),
    );
  }
}

class KitoblarRoyxati extends StatelessWidget {
  const KitoblarRoyxati({super.key, required this.kitoblar});

  final List<Kitob> kitoblar;

  Future<void> _och(BuildContext context, Kitob kitob) async {
    // push — yangi ekran stek ustiga; Future pop() qaytargan natija bilan tugaydi
    final soni = await Navigator.push<int>(
      context,
      MaterialPageRoute<int>(
        settings: RouteSettings(name: kitob.nom),
        builder: (context) => KitobSahifasi(kitob: kitob), // ma'lumot konstruktor orqali
      ),
    );
    // await'dan keyin context hali daraxtdami — tekshirish shart
    if (!context.mounted) return;
    ScaffoldMessenger.of(context)
      ..removeCurrentSnackBar()
      ..showSnackBar(SnackBar(
        content: Text(soni == null ? 'Hech narsa tanlanmadi' : '${kitob.nom}: savatga $soni dona'),
      ));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        for (final k in kitoblar)
          ListTile(
            title: Text(k.nom),
            subtitle: Text(k.muallif),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _och(context, k),
          ),
      ],
    );
  }
}

class KitobSahifasi extends StatelessWidget {
  const KitobSahifasi({super.key, required this.kitob});

  final Kitob kitob;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(kitob.nom)), // orqaga tugmasini AppBar o'zi qo'shadi
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Muallif: ${kitob.muallif}'),
            Text('Narx: ${kitob.narx} so\'m'),
            const SizedBox(height: 16),
            Row(
              children: [
                for (final n in [1, 2, 3])
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: FilledButton(
                      // pop — ekranni yopish va natijani qaytarish
                      onPressed: () => Navigator.pop(context, n),
                      child: Text('$n dona'),
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

E'tibor bering:

- `RouteSettings(name: …)` faqat kuzatish uchun: testda stekka nima qo'shilganini nomi bilan ko'ramiz. Bu nomli route
  emas — ekran baribir `MaterialPageRoute` bilan ochiladi.
- `KitobSahifasi` stek haqida hech narsa bilmaydi: u kitobni konstruktordan oladi, natijani `pop` bilan qaytaradi.

Testlar (`test/widget_test.dart`). `NavigatorObserver` stekdagi har `push` va `pop` ni chop etadi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

/// Stekdagi har o'zgarishni yozib boradi
class Kuzatuvchi extends NavigatorObserver {
  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) =>
      debugPrint('  push: ${route.settings.name ?? route.runtimeType}');

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) =>
      debugPrint('  pop:  ${route.settings.name ?? route.runtimeType}');
}

void main() {
  testWidgets('Ma\'lumot yuborish va qaytarish', (tester) async {
    await tester.pumpWidget(DokonApp(kuzatuvchilar: [Kuzatuvchi()]));
    await tester.tap(find.text('Dart tili'));
    await tester.pumpAndSettle();
    expect(find.text('Narx: 85000 so\'m'), findsOneWidget);

    await tester.tap(find.text('2 dona'));
    await tester.pumpAndSettle();
    expect(find.text('Dart tili: savatga 2 dona'), findsOneWidget);
    debugPrint('snackbar: Dart tili: savatga 2 dona');
  });

  testWidgets('Orqaga tugmasi — natija null', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.tap(find.text('Flutter asoslari'));
    await tester.pumpAndSettle();
    await tester.pageBack(); // AppBar'dagi orqaga tugmasi
    await tester.pumpAndSettle();
    expect(find.text('Hech narsa tanlanmadi'), findsOneWidget);
    debugPrint('snackbar: Hech narsa tanlanmadi');
  });

  testWidgets('Tab va drawer', (tester) async {
    await tester.pumpWidget(DokonApp(kuzatuvchilar: [Kuzatuvchi()]));
    await tester.tap(find.text('Ommabop'));
    await tester.pumpAndSettle();
    expect(find.text('Toza kod'), findsOneWidget);
    expect(find.text('Dart tili'), findsNothing);
    debugPrint('Ommabop tab: Toza kod, Algoritmlar');

    await tester.tap(find.byTooltip('Open navigation menu'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sozlamalar'));
    await tester.pumpAndSettle();
    expect(find.text('Hozircha bo\'sh'), findsOneWidget);
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 4.7s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Ma'lumot yuborish va qaytarish
  push: /
  push: Dart tili
  pop:  Dart tili
snackbar: Dart tili: savatga 2 dona
00:03 +1: Orqaga tugmasi — natija null
snackbar: Hech narsa tanlanmadi
00:04 +2: Tab va drawer
  push: /
Ommabop tab: Toza kod, Algoritmlar
  push: sozlamalar
00:05 +3: All tests passed!
```

Natijada:

- Stek: ilova ochilganda `/` (`home`), kitob bosilganda `Dart tili` qo'shildi, "2 dona" bosilganda olib tashlandi va
  `push` ning `Future` i `2` bilan tugadi — snackbar shuni ko'rsatdi.
- Orqaga tugmasi bilan qaytilganda natija `null` — "Hech narsa tanlanmadi".
- Tab almashganda boshqa ro'yxat ko'rindi. Drawer'dan "Sozlamalar" ochildi. Kuzatuvchi drawer'ning o'zini alohida
  route sifatida ko'rsatmadi — faqat `sozlamalar` qo'shildi; drawer'ni esa FD aytganidek `Navigator.pop(context)` yopdi.
- `tester.byTooltip('Open navigation menu')` — `AppBar` qo'shgan drawer tugmasining standart maslahat matni.

Brauzerda (`flutter build web`). Chapda — bosh sahifa: tablar va ro'yxat; o'ngda — kitob sahifasi, `AppBar` da orqaga
tugmasi avtomatik paydo bo'lgan:

<img src="/rasmlar/flutter/23-bosh.png" alt="Kitob do'koni: tepada menyu tugmasi, Yangi va Ommabop tablari, ostida ikki kitob" width="300"> <img src="/rasmlar/flutter/23-kitob.png" alt="Dart tili sahifasi: chapda orqaga strelkasi, muallif, narx va 1, 2, 3 dona tugmalari" width="300">

## Tipik xatolar

### `Navigator` yo'q `context`

```dart
class Ilova extends StatelessWidget {
  const Ilova({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: TextButton(
          // Bu context — Ilova'niki, MaterialApp'dan YUQORIDA
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute<void>(builder: (_) => const Text('Ikkinchi')),
          ),
          child: const Text('Och'),
        ),
      ),
    );
  }
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: 1. Navigator yo'q context
══╡ EXCEPTION CAUGHT BY GESTURE ╞═══════════════════════════════════════════════════════════════════
The following assertion was thrown while handling a gesture:
Navigator operation requested with a context that does not include a Navigator.
The context used to push or pop routes from the Navigator must be that of a widget that is a
descendant of a Navigator widget.
```

(Stek izi qisqartirildi.) `Navigator` ni `MaterialApp` yaratadi, `Navigator.push(context, …)` esa shu `context` dan
**yuqoriga** qarab izlaydi. `Ilova.build` ning `context` i `MaterialApp` dan yuqorida — u yerda `Navigator` yo'q. Yechim:
tugmani alohida widget'ga chiqarish (misoldagi `KitoblarRoyxati` kabi) yoki `Builder`.

### Tablar soni mos emas

```dart
DefaultTabController(
  length: 3,
  child: Scaffold(
    appBar: AppBar(bottom: const TabBar(tabs: [Tab(text: 'Yangi'), Tab(text: 'Ommabop')])),
  ),
)
```

```text vps
00:01 +0 -1: 2. DefaultTabController length mos emas
══╡ EXCEPTION CAUGHT BY SCHEDULER LIBRARY ╞═════════════════════════════════════════════════════════
The following assertion was thrown during a scheduler callback:
Controller's length property (3) does not match the number of tabs (2) present in TabBar's tabs
property.
```

### `await` dan keyin `mounted` siz

```dart
Future<void> och(BuildContext context) async {
  final soni = await Navigator.push<int>(
    context,
    MaterialPageRoute<int>(builder: (context) => const Placeholder()),
  );
  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$soni')));
}
```

Bu xatoni `flutter analyze` o'zi topadi (`flutter create` loyihasidagi `flutter_lints` qoidasi):

```text vps
$ flutter analyze
Analyzing salom...                                              

   info • Don't use 'BuildContext's across async gaps. Try rewriting the code to not use the 'BuildContext', or guard the use with a 'mounted' check • lib/mounted_yoq.dart:9:24 • use_build_context_synchronously

1 issue found. (ran in 5.7s)
```

Yechim — FD'dagi kabi `if (!context.mounted) return;`.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `Navigator operation requested with a context that does not include a Navigator.` | `context` `MaterialApp` dan yuqorida | Alohida widget yoki `Builder` |
| `Controller's length property (3) does not match the number of tabs (2)` | `length` va tablar soni har xil | Bir xil son |
| `TabBarView` mazmuni boshqa tabda chiqadi | FD: tartib `TabBar` ga mos bo'lishi shart | Bir xil tartib |
| `use_build_context_synchronously` | `await` dan keyin `context` tekshirilmagan | `if (!context.mounted) return;` |
| Drawer'dagi bandni bosgandan keyin drawer ochiq qoladi | Drawer stekda | `Navigator.pop(context)` |
| `push` natijasini `!` bilan olish | Orqaga tugmasida natija `null` | `null` holatini ko'rib chiqing |
| Hamma ekran uchun nomli route'lar | FD tavsiya qilmaydi | `MaterialPageRoute` yoki routing paketi |

## Amaliyot

1. Flutter'da "route" nima va `Navigator` ularni qanday saqlaydi?
2. `push` va `pop` nima qiladi? `pushReplacement` qachon kerak (masalan, kirish ekranidan keyin)?
3. Yangi ekranga ma'lumot qanday yuboriladi va undan natija qanday qaytariladi?
4. Foydalanuvchi orqaga tugmasini bossa, `await Navigator.push(…)` nima qaytaradi?
5. Nega `await` dan keyin `context.mounted` tekshiriladi?
6. FD nega nomli route'larni tavsiya qilmaydi?
7. Kitob sahifasiga "Savatga o'tish" tugmasini qo'shing: u kitob sahifasini **almashtirib** savat ekranini ochsin
   (orqaga bosilganda bosh sahifaga qaytilsin).

<details>
<summary>Javoblar</summary>

1. Route — ekran (sahifa), Flutter'da oddiy widget. `Navigator` ularni stek ko'rinishida saqlaydi.
2. `push` — stek ustiga qo'yadi, `pop` — ustidagini olib tashlaydi. `pushReplacement` — joriy ekranni almashtiradi: kirish ekraniga orqaga qaytib bo'lmasligi kerak bo'lganda.
3. Yuborish — yangi ekran konstruktori orqali; qaytarish — `Navigator.pop(context, natija)`, uni `await Navigator.push(…)` oladi.
4. `null`.
5. `await` davomida ekran yopilgan bo'lishi mumkin; yopilgan widget'ning `context` i bilan ishlash xato.
6. Deep link xatti-harakatini sozlab bo'lmaydi (har safar stekka yangi route qo'shiladi) va brauzerning "oldinga" tugmasi ishlamaydi.
7. `Navigator.pushReplacement(context, MaterialPageRoute<void>(builder: (_) => const SavatSahifasi()))` — stekda kitob sahifasi o'rniga savat bo'ladi, orqaga bosilganda bosh sahifa. VPS'dagi testda: almashtirishdan keyin ekranda "Savat", orqaga — "Bosh".

</details>

## Rasmiy hujjat

- [FD: Navigation and routing](https://docs.flutter.dev/ui/navigation)
- [FD: Navigate to a new screen and back](https://docs.flutter.dev/cookbook/navigation/navigation-basics)
- [FD: Send data to a new screen](https://docs.flutter.dev/cookbook/navigation/passing-data)
- [FD: Return data from a screen](https://docs.flutter.dev/cookbook/navigation/returning-data)
- [FD: Stack-based navigation (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/navigation)
- [FD: Work with tabs](https://docs.flutter.dev/cookbook/design/tabs)
- [FD: Add a drawer to a screen](https://docs.flutter.dev/cookbook/design/drawer)
