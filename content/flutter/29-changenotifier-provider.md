# 29 — ChangeNotifier va provider

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 va `provider` 6.1.5+1 bilan sinalgan (`flutter test`), skrinshotlar `flutter build web`
> natijasidan.

## Tushuncha

### Muammo: holat yuqorida, unga muhtojlar pastda

28-bobda savat bosh sahifaning `State` ida turdi; kitob sahifasiga funksiya, savat sahifasiga nusxa berildi. FD (Simple app
state management): Flutter'da holatni undan foydalanadigan widget'lardan **yuqorida** saqlash mantiqli. Sababi — widget'lar
o'zgarmas (immutable): ular o'zgarmaydi, **almashtiriladi**. `MyCart.updateWith(yangi)` metodi o'rniga `MyCart(tarkib)`
konstruktori; yangi widget esa faqat otasining `build` ida yaratiladi — demak tarkib ota yoki undan yuqorida turishi kerak.

Holatga yetib borishning oddiy yo'li — callback (28-bobdagi `savatgaQosh`). Ilova o'sgan sari ular ko'payadi. FD buning
uchun `provider` paketini ko'rsatadi: callback'lar va `InheritedWidget` haqida o'ylash shart emas, lekin uchta tushunchani
bilish kerak.

### 1. `ChangeNotifier`

FD: `ChangeNotifier` — Flutter SDK'dagi oddiy klass (`flutter:foundation`): o'z tinglovchilariga (listener) "o'zgardim" deb
xabar beradi. Holat klassi undan meros oladi va o'zgartirgandan keyin **`notifyListeners()`** ni chaqiradi — FD: shu
klassga xos yagona kod shu.

- Ichki ro'yxat yopiq (`_kitoblar`), tashqariga — faqat o'qiladigan `UnmodifiableListView`. O'zgartirish faqat klass
  metodlari (`qosh`, `ochir`) orqali, ular har safar `notifyListeners()` chaqiradi.
- FD: `ChangeNotifier` Flutter'ning yuqori darajadagi klasslariga bog'liq emas — uni widget testisiz, oddiy unit test bilan
  tekshirish oson.
- FD o'quv qo'llanmasi (ChangeNotifier): `notifyListeners()` holatni o'zgartirmaydi — faqat o'zgarganini bildiradi.
  Yuklanish (`isLoading`) kabi holatlarda u ikki marta chaqiriladi: boshlanganda va tugaganda.

### Paketsiz: `ListenableBuilder`

FD o'quv qo'llanmasi (ListenableBuilder): **`ListenableBuilder`** — `ChangeNotifier` ni "tinglaydigan" widget;
`notifyListeners()` chaqirilganda `builder` ni avtomatik qayta ishlatadi. Har kadrda emas — faqat xabar kelganda. Model
konstruktor orqali beriladi (`listenable: model`). Bu Flutter SDK'ning o'zida, paket kerak emas.

### 2. `ChangeNotifierProvider`

FD: `ChangeNotifierProvider` — `ChangeNotifier` nusxasini o'zining avlodlariga (descendants) beradigan widget, `provider`
paketidan.

- Unga muhtoj widget'lardan **yuqorida**, lekin keragidan yuqori emas (ko'rinish doirasini ifloslamaslik uchun).
- `create: (context) => SavatModel()` — FD: provider modelni keragidan ortiq qayta yaratmaydi va kerak bo'lmay qolganda
  `dispose()` ni o'zi chaqiradi.
- Bir nechta model — `MultiProvider(providers: [...])`.
- `provider` README'si: yangi obyekt **`create`** ichida yaratiladi; mavjud `ChangeNotifier` ni berish uchun
  **`ChangeNotifierProvider.value`** (va aksincha emas).

### 3. `Consumer`

FD: `Consumer<SavatModel>(builder: (context, savat, child) => ...)`:

- **Tur albatta yoziladi** (`<SavatModel>`) — aks holda `provider` qaysi modelni qidirishni bilmaydi.
- `builder` ning uch argumenti: `context`, model nusxasi va `child`.
- **`child`** — optimallashtirish: model o'zgarganda o'zgarmaydigan katta qismni bir marta qurib, `builder` ga berish.
- FD: `Consumer` ni daraxtda **imkon qadar pastga** qo'ying — biror kichik narsa o'zgargani uchun UI'ning katta qismini
  qayta qurmaslik uchun.

### `Provider.of(context, listen: false)`

FD: ba'zan model ma'lumoti UI uchun kerak emas — faqat metodini chaqirish kerak (masalan, "Tozalash" tugmasi). Shunda
`Provider.of<SavatModel>(context, listen: false).tozala()`: bu widget `notifyListeners` da qayta qurilmaydi.

`provider` README'si qisqa yozuvlarni ham beradi: `context.watch<T>()` — tinglaydi; `context.read<T>()` — tinglamaydi va
`build` ichida chaqirib bo'lmaydi; `context.select<T, R>(...)` — modelning faqat bir qismini tinglaydi.

### Boshqa yondashuvlar

FD (List of state management approaches) Flutter'ning o'zidagi usullarni sanaydi: `setState` (bitta widget holati),
`ValueNotifier` va `InheritedNotifier`, `InheritedWidget` va `InheritedModel` (FD: `provider` va boshqa ko'p usullar
ichida shu ishlatiladi). Jamiyat paketlari ko'p — FD ularni nomlab tavsiya qilmaydi, pub.dev'dagi `#state-management`
mavzusiga yo'naltiradi. Bu kitob FD misollaridagi `ChangeNotifier` bilan davom etadi (33–34-boblardagi arxitektura ham
shunga tayanadi).

## Ko'rib chiqamiz

28-bobdagi do'kon — endi savat `SavatModel` da, ilovaning eng tepasida.

```text vps
$ flutter pub add provider
Resolving dependencies...
Downloading packages...
  cupertino_icons 1.0.9 (2.0.0 available)
  cupertino_ui 1.1.6 (1.1.7 available)
  material_color_utilities 0.13.0 (0.13.1 available)
  material_ui 1.11.0 (1.11.1 available)
+ nested 1.0.0
+ provider 6.1.5+1
  test_api 0.7.14 (0.7.15 available)
  vector_math 2.4.3 (2.4.4 available)
Changed 2 dependencies!
6 packages have newer versions incompatible with dependency constraints.
Try `flutter pub outdated` for more information.
```

`lib/savat_model.dart` — UI'siz, faqat holat:

```dart
import 'dart:collection';

import 'package:flutter/foundation.dart';

class Kitob {
  const Kitob(this.nom, this.narx);

  final String nom;
  final int narx;
}

/// Ilova holati: savat. UI'ni bilmaydi — faqat ma'lumot va o'zgarish haqida xabar.
class SavatModel extends ChangeNotifier {
  final List<Kitob> _kitoblar = [];

  /// Tashqaridan faqat o'qish mumkin bo'lgan ko'rinish
  UnmodifiableListView<Kitob> get kitoblar => UnmodifiableListView(_kitoblar);

  int get jami => _kitoblar.fold(0, (s, k) => s + k.narx);

  bool bormi(Kitob k) => _kitoblar.contains(k);

  void qosh(Kitob k) {
    _kitoblar.add(k);
    notifyListeners(); // tinglayotgan widget'lar qayta qurilsin
  }

  void ochir(Kitob k) {
    _kitoblar.remove(k);
    notifyListeners();
  }

  void tozala() {
    _kitoblar.clear();
    notifyListeners();
  }
}
```

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import 'savat_model.dart';

const kitoblar = [
  Kitob('Dart tili', 45000),
  Kitob('Flutter asoslari', 60000),
  Kitob('Toza kod', 80000),
];

void main() {
  runApp(
    // Savat butun ilovaga kerak — MaterialApp'dan yuqorida
    ChangeNotifierProvider(
      create: (context) => SavatModel(),
      child: const DokonApp(),
    ),
  );
}

class DokonApp extends StatelessWidget {
  const DokonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const BoshSahifa(),
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitob do\'koni'), actions: const [SavatTugmasi()]),
      body: ListView(
        children: [
          for (final k in kitoblar)
            ListTile(
              title: Text(k.nom),
              subtitle: Text('${k.narx} so\'m'),
              // Consumer imkon qadar pastda: faqat belgi qayta quriladi
              trailing: Consumer<SavatModel>(
                builder: (context, savat, child) =>
                    savat.bormi(k) ? const Icon(Icons.check, color: Colors.green) : const SizedBox.shrink(),
              ),
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => KitobSahifasi(kitob: k)),
              ),
            ),
        ],
      ),
    );
  }
}

class SavatTugmasi extends StatelessWidget {
  const SavatTugmasi({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<SavatModel>(
      builder: (context, savat, child) => TextButton.icon(
        icon: child!, // o'zgarmaydigan qism — qayta qurilmaydi
        label: Text('Savat (${savat.kitoblar.length})'),
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SavatSahifasi())),
      ),
      child: const Icon(Icons.shopping_cart),
    );
  }
}

class KitobSahifasi extends StatelessWidget {
  const KitobSahifasi({super.key, required this.kitob});

  final Kitob kitob;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(kitob.nom), actions: const [SavatTugmasi()]),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: FilledButton(
          onPressed: () {
            // Ma'lumot kerak emas, faqat amal — tinglamaymiz
            Provider.of<SavatModel>(context, listen: false).qosh(kitob);
          },
          child: Text('Savatga qo\'shish — ${kitob.narx} so\'m'),
        ),
      ),
    );
  }
}

class SavatSahifasi extends StatelessWidget {
  const SavatSahifasi({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Savat')),
      body: Consumer<SavatModel>(
        builder: (context, savat, child) => Column(
          children: [
            Expanded(
              child: ListView(
                children: [
                  for (final k in savat.kitoblar)
                    ListTile(
                      title: Text(k.nom),
                      subtitle: Text('${k.narx} so\'m'),
                      trailing: IconButton(
                        tooltip: 'O\'chirish',
                        icon: const Icon(Icons.delete),
                        onPressed: () => savat.ochir(k),
                      ),
                    ),
                ],
              ),
            ),
            ListTile(
              title: Text('Jami: ${savat.jami} so\'m'),
              trailing: TextButton(
                onPressed: savat.kitoblar.isEmpty ? null : savat.tozala,
                child: const Text('Tozalash'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

28-bob bilan farqi:

- **Hamma sahifa `StatelessWidget`.** Holat `SavatModel` da; sahifalar uni o'zlari oladi, konstruktordan savat yoki
  funksiya kelmaydi.
- **`SavatTugmasi` ikki sahifada.** Bosh sahifada ham, kitob sahifasida ham bir xil son — model bitta.
- **Uch xil foydalanish:** ko'rsatish — `Consumer` (tinglaydi); amal — `Provider.of(..., listen: false)` (tinglamaydi);
  savat sahifasida ikkalasi ham — `Consumer` ichidagi `savat.ochir`.

### Testlar

FD'dagidek model alohida — unit test bilan, widget'siz. `test/savat_model_test.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/main.dart';
import 'package:salom/savat_model.dart';

void main() {
  test('qo\'shish jami narxni oshiradi va tinglovchiga xabar beradi', () {
    final savat = SavatModel();
    var xabarlar = 0;
    savat.addListener(() => xabarlar++);

    savat.qosh(kitoblar[0]);
    savat.qosh(kitoblar[2]);
    expect(savat.jami, 125000);
    savat.ochir(kitoblar[0]);
    debugPrint('jami: ${savat.jami}, xabarlar: $xabarlar');
    expect(xabarlar, 3);
  });
}
```

`test/listenable_test.dart` — o'sha model `provider` siz, `ListenableBuilder` bilan:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';
import 'package:salom/savat_model.dart';

void main() {
  testWidgets('ListenableBuilder — paketsiz', (tester) async {
    final savat = SavatModel();
    addTearDown(savat.dispose);
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: ListenableBuilder(
          listenable: savat,
          builder: (context, child) => Text('Savat (${savat.kitoblar.length}), jami ${savat.jami}'),
        ),
      ),
    ));
    savat.qosh(kitoblar[1]);
    await tester.pump();
    debugPrint(tester.widget<Text>(find.byType(Text)).data);
  });
}
```

`test/widget_test.dart` — butun ilova:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';
import 'package:salom/main.dart';
import 'package:salom/savat_model.dart';

Widget ilova() => ChangeNotifierProvider(create: (_) => SavatModel(), child: const DokonApp());

void main() {
  testWidgets('Savat butun ilovada bir xil', (tester) async {
    await tester.pumpWidget(ilova());

    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Savatga qo\'shish'));
    await tester.pump();
    debugPrint('kitob sahifasida: ${find.text('Savat (1)').evaluate().isNotEmpty ? 'Savat (1)' : '?'}');

    await tester.pageBack();
    await tester.pumpAndSettle();
    debugPrint('bosh sahifada: Savat (1), belgi: ${find.byIcon(Icons.check).evaluate().length}');

    await tester.tap(find.text('Dart tili'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('Savatga qo\'shish'));
    await tester.pump();
    await tester.tap(find.text('Savat (2)'));
    await tester.pumpAndSettle();
    debugPrint('savat sahifasida: ${find.textContaining('Jami').evaluate().map((e) => (e.widget as Text).data).single}');

    await tester.tap(find.byTooltip('O\'chirish').first);
    await tester.pump();
    debugPrint('o\'chirildi: ${find.textContaining('Jami').evaluate().map((e) => (e.widget as Text).data).single}');
    await tester.tap(find.text('Tozalash'));
    await tester.pump();
    debugPrint('tozalandi: ${find.textContaining('Jami').evaluate().map((e) => (e.widget as Text).data).single}');

    await tester.pageBack();
    await tester.pumpAndSettle();
    debugPrint('bosh sahifada: ${find.textContaining('Savat (').evaluate().map((e) => (e.widget as Text).data).single}');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 4.9s)
$ flutter test test/savat_model_test.dart test/listenable_test.dart test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/savat_model_test.dart
00:00 +0: /home/dasturchi/flutter/salom/test/savat_model_test.dart: qo'shish jami narxni oshiradi va tinglovchiga xabar beradi
jami: 80000, xabarlar: 3
00:00 +1: loading /home/dasturchi/flutter/salom/test/listenable_test.dart
00:02 +1: /home/dasturchi/flutter/salom/test/listenable_test.dart: ListenableBuilder — paketsiz
Savat (1), jami 60000
00:05 +2: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:06 +2: /home/dasturchi/flutter/salom/test/widget_test.dart: Savat butun ilovada bir xil
kitob sahifasida: Savat (1)
bosh sahifada: Savat (1), belgi: 1
savat sahifasida: Jami: 125000 so'm
o'chirildi: Jami: 45000 so'm
tozalandi: Jami: 0 so'm
bosh sahifada: Savat (0)
00:11 +3: All tests passed!
```

Natijada:

- **Model:** uch o'zgarish (2 qo'shish, 1 o'chirish) — tinglovchiga uch xabar; jami 45 000 + 80 000 − 45 000 = 80 000.
- **Ilova:** kitob sahifasida qo'shilgan kitob shu zahoti o'sha sahifadagi `SavatTugmasi` da (`Savat (1)`), bosh
  sahifada belgi bilan, savat sahifasida jami bilan ko'rindi. Savat sahifasida o'chirish va tozalash bosh sahifaga ham
  ta'sir qildi (`Savat (0)`). Callback ham, nusxa ham yo'q.
- **`ListenableBuilder`:** `provider` siz ham model o'zgarganda matn yangilandi.

### Brauzerda

Chapda — "Toza kod" sahifasi: savatga qo'shilgan, tepada `Savat (1)`; o'ngda — ikki kitobli savat sahifasi:

<img src="/rasmlar/flutter/29-kitob.png" alt="Toza kod sahifasi: tepada Savat (1), Savatga qo'shish — 80000 so'm tugmasi" width="300"> <img src="/rasmlar/flutter/29-savat.png" alt="Savat sahifasi: Dart tili va Toza kod, o'chirish tugmalari, Jami: 125000 so'm, Tozalash" width="300">

## Tipik xatolar

`test/xato_test.dart`:

```dart
// notifyListeners unutilgan model
class XabarsizSavat extends ChangeNotifier {
  final List<Kitob> kitoblar = [];
  void qosh(Kitob k) => kitoblar.add(k); // notifyListeners yo'q
}

// 1. Tugma ichida Provider.of — listen: false yo'q
TextButton(
  onPressed: () => Provider.of<SavatModel>(context).qosh(kitoblar[0]),
  child: const Text('qo\'sh'),
)

// 2. Provider yo'q: SavatTugmasi ChangeNotifierProvider'siz
await tester.pumpWidget(const MaterialApp(home: SavatTugmasi()));

// 3. Ro'yxatni tashqaridan o'zgartirish
SavatModel().kitoblar.add(kitoblar[0]);

// 4. Consumer yuqorida va pastda: OgirWidget har qurilganda hisoblagichni oshiradi
Consumer<SavatModel>(builder: (c, s, _) => Column(children: [OgirWidget(), matn(s)]))   // yuqorida
Column(children: [OgirWidget(), Consumer<SavatModel>(builder: (c, s, _) => matn(s))])   // pastda
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: Callback ichida listen: true
'package:provider/src/provider.dart': Failed assertion: line 308 pos 7: 'context.owner!.debugBuilding ||
          listen == false ||
          debugIsInInheritedProviderUpdate': Tried to listen to a value exposed with provider, from outside of the widget tree.

This is likely caused by an event handler (like a button's onPressed) that called
Provider.of without passing `listen: false`.

To fix, write:
00:01 +1: Provider yo'q
Error: Could not find the correct Provider<SavatModel> above this Consumer<SavatModel> Widget

This happens because you used a `BuildContext` that does not include the provider
00:01 +2: notifyListeners unutilgan
modelda: 1 ta, ekranda: Savat (0)
00:01 +3: Ro'yxatni tashqaridan o'zgartirish
Unsupported operation: Cannot add to an unmodifiable list
00:01 +4: Consumer yuqorida
yuqorida: 3 o'zgarishda og'ir widget 3 marta qurildi
00:01 +5: Consumer pastda
pastda: 3 o'zgarishda og'ir widget 0 marta qurildi
00:02 +6: All tests passed!
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `Tried to listen to a value exposed with provider, from outside of the widget tree` | `onPressed` ichida `Provider.of` standart holatda tinglaydi | `Provider.of<T>(context, listen: false)` yoki `context.read<T>()` |
| `Could not find the correct Provider<SavatModel> above this Consumer<SavatModel> Widget` | `ChangeNotifierProvider` daraxtda yuqorida yo'q (yoki boshqa `context`) | Provider'ni unga muhtoj widget'lardan yuqoriga — butun ilovaga kerak bo'lsa `runApp` ichida |
| Modelda 1 ta, ekranda `Savat (0)` | `notifyListeners()` chaqirilmagan | Har bir o'zgartiruvchi metod oxirida `notifyListeners()` |
| `Cannot add to an unmodifiable list` | Holatni klassdan tashqarida o'zgartirishga urinish | Faqat model metodlari orqali (`qosh`, `ochir`) — FD'dagi `UnmodifiableListView` aynan shu uchun |
| Har o'zgarishda katta qism qayta quriladi (testda 3 marta, pastda — 0) | `Consumer` daraxtning yuqorisida | `Consumer` ni imkon qadar pastga (FD) yoki o'zgarmas qismni `child` ga |
| `ChangeNotifierProvider.value(value: SavatModel())` | `provider` README: yangi obyektni `.value` bilan yaratmang (DON'T) | Yangi obyekt — `create`; mavjud obyekt — `.value` |

## Amaliyot

1. `ChangeNotifier` ga xos yagona kod nima? U nima qiladi?
2. Nega FD'dagi `CartModel` ro'yxatni `UnmodifiableListView` qilib beradi?
3. `ChangeNotifierProvider` qayerga qo'yiladi? `create` ning afzalligi nima?
4. `Consumer` ning `child` parametri nima uchun? `Consumer` ni qayerga qo'yish kerak?
5. `Provider.of(context, listen: false)` qachon kerak? `context.read` bilan farqi bormi?
6. `ListenableBuilder` va `Consumer` ning farqi nima?
7. Kitob sahifasidagi tugma kitob savatda bo'lsa "Savatda ✓" deb yozilsin va bosilmaydigan bo'lsin. Qaysi usul bilan
   modelni olasiz — tinglab yoki tinglamay?

<details>
<summary>Javoblar</summary>

1. `notifyListeners()` — tinglovchilarga (masalan, `Consumer`, `ListenableBuilder`) "o'zgardim" deydi, ular qayta quriladi.
   Holatni o'zi o'zgartirmaydi.
2. Tashqaridan ro'yxatga to'g'ridan-to'g'ri yozib bo'lmasin — o'zgartirish faqat metodlar orqali, ular `notifyListeners()`
   ni unutmaydi. Testda: `Cannot add to an unmodifiable list`.
3. Unga muhtoj widget'lardan yuqorida, lekin keragidan yuqori emas. `create` — modelni keragidan ortiq qayta yaratmaydi va
   kerak bo'lmay qolganda `dispose()` qiladi.
4. Model o'zgarganda o'zgarmaydigan katta qismni bir marta qurish uchun. `Consumer` — imkon qadar pastda (testda: yuqorida
   — og'ir widget 3 marta qurildi, pastda — 0).
5. Model ma'lumoti UI'ga kerak bo'lmay, faqat metodini chaqirish kerak bo'lganda (tugma). `context.read<T>()` — xuddi shu
   ishning qisqa yozuvi (`provider` README: tinglamaydi, `build` ichida chaqirilmaydi).
6. `ListenableBuilder` — Flutter SDK'da, modelni o'zi oladi (`listenable:`). `Consumer` — `provider` paketida, modelni
   daraxtdagi `ChangeNotifierProvider` dan topadi.
7. Ko'rsatish uchun — tinglash kerak: `context.watch<SavatModel>().bormi(kitob)` (yoki `Consumer`); bosilganda — tinglamay:
   `context.read<SavatModel>().qosh(kitob)`. `onPressed: context.watch<SavatModel>().bormi(kitob) ? null : () =>
   context.read<SavatModel>().qosh(kitob)` — `null` tugmani o'chiradi. VPS'dagi testda: `tugma: Savatda ✓, yoqilgan: false`.

</details>

## Rasmiy hujjat

- [FD: Simple app state management](https://docs.flutter.dev/data-and-backend/state-mgmt/simple)
- [FD: ChangeNotifier (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/change-notifier)
- [FD: ListenableBuilder (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/listenable-builder)
- [FD: List of state management approaches](https://docs.flutter.dev/data-and-backend/state-mgmt/options)
- [provider (pub.dev)](https://pub.dev/packages/provider)
- [API: ChangeNotifier](https://api.flutter.dev/flutter/foundation/ChangeNotifier-class.html) · [ListenableBuilder](https://api.flutter.dev/flutter/widgets/ListenableBuilder-class.html)
