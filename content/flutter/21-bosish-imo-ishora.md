# 21 — Bosish va imo-ishoralar

[Mundarija](README.md)

## Tushuncha

### Ikki qatlam: pointer va imo-ishora

FD (Taps, drags, and other gestures): Flutter'da foydalanuvchi harakati ikki qatlamda keladi.

1. **Pointer hodisalari** — xom ma'lumot: barmoq, sichqoncha yoki stilus (pointer) ekranning qayeriga tegdi va qanday
   siljidi. To'rt turi bor:

   | Hodisa | Ma'nosi |
   | --- | --- |
   | `PointerDownEvent` | pointer ekranga tegdi |
   | `PointerMoveEvent` | pointer siljidi |
   | `PointerUpEvent` | pointer ekrandan ko'tarildi |
   | `PointerCancelEvent` | bu pointer endi ilovaga tegishli emas |

2. **Imo-ishoralar** (gestures) — ma'noli harakat: bosish (tap), surish (drag), kattalashtirish (scale). Ular bir nechta
   pointer hodisasidan tanib olinadi.

FD: pointer tekkanda Flutter **hit test** qiladi — shu nuqtada qaysi widget borligini aniqlaydi. Hodisa eng ichki widget'ga
beriladi, keyin daraxt bo'ylab ildizgacha ko'tariladi. Uni yo'lda to'xtatish mexanizmi yo'q. Xom hodisalarni `Listener`
widget bilan eshitish mumkin, lekin FD odatda imo-ishoralarni ishlatishni tavsiya qiladi.

### `GestureDetector`

Widget'ga imo-ishora qo'shish — `GestureDetector`. API: u faqat **`null` bo'lmagan callback'lariga** mos imo-ishoralarni
taniydi. Asosiy callback'lar (FD):

| Imo-ishora | Callback'lar |
| --- | --- |
| Bosish | `onTapDown`, `onTapUp`, `onTap`, `onTapCancel` |
| Ikki marta bosish | `onDoubleTap` |
| Uzoq bosish | `onLongPress` |
| Vertikal surish | `onVerticalDragStart` / `Update` / `End` |
| Gorizontal surish | `onHorizontalDragStart` / `Update` / `End` |
| Ixtiyoriy yo'nalishda surish (pan) | `onPanStart` / `Update` / `End` |

FD: Material widget'larining ko'pi bosishga o'zi javob beradi: `IconButton`, `TextButton` bosiladi, `ListView` surilsa
aylanadi. `GestureDetector` — o'zingiz yasagan element uchun.

### `InkWell`: Material "to'lqini"

FD (Add Material touch ripples): Material widget'lari bosilganda **to'lqin** (ripple) animatsiyasini ko'rsatadi. O'z
elementingizga shu effekt kerak bo'lsa — `GestureDetector` o'rniga `InkWell`.

API (`InkWell`): to'lqin `InkWell` ning o'zida emas, ota **`Material`** widget ustida chiziladi. Shuning uchun:

- `InkWell` ning ota daraxtida `Material` bo'lishi shart (`Scaffold`, `Card` ichida u bor);
- `InkWell` bilan `Material` orasida shaffof bo'lmagan rangli `Container` bo'lsa, to'lqin uning **ostida qolib ketadi** —
  rangni `Material(color: …)` ga bering yoki `Ink` widget'ini ishlating.

### Imo-ishoralar maydoni (gesture arena)

FD: bitta joyda bir nechta tanib oluvchi (recognizer) bo'lishi mumkin. Masalan, `GestureDetector` da ham `onTap`, ham
`onDoubleTap` bor: birinchi bosishdan keyin bu oddiy bosishmi yoki ikki martalikning boshimi — hali noma'lum. Flutter
tanib oluvchilarni **maydon**ga (arena) kiritadi:

- istalgan payt tanib oluvchi maydondan chiqishi mumkin; bitta qolsa — u yutadi;
- istalgan payt tanib oluvchi o'zini g'olib deb e'lon qilishi mumkin — qolganlari yutqazadi.

Misol (FD): gorizontal va vertikal surish ikkalasi bor. Barmoq gorizontal yo'nalishda ma'lum pikseldan ko'proq siljisa,
gorizontal tanib oluvchi yutadi. Faqat bitta tanib oluvchi bo'lsa, u darhol yutadi — birinchi pikseldanoq surish
boshlanadi.

Amaldagi natijasi: `onDoubleTap` qo'shilsa, `onTap` **kechikadi** — Flutter ikkinchi bosish kelmasligiga ishonch hosil
qilishi kerak (pastdagi testda o'lchangan).

### Surib o'chirish: `Dismissible`

FD (Implement swipe to dismiss): ro'yxat elementini surib o'chirish — `Dismissible`:

- har `Dismissible` da **`key`** bo'lishi shart: FD — kalit Flutter'ga widget'ni aniq ajratishga yordam beradi;
- `onDismissed` — element surib chiqarilgandan keyin nima qilish (ma'lumotdan o'chirish, snackbar);
- `background` — surilayotganda element ostida ko'rinadigan "qoldiq" belgi (FD misolida qizil fon);
- `direction` — qaysi yo'nalishga surish mumkin (`DismissDirection.endToStart` — faqat chapga, chapdan o'ngga yozuvda).

API: `confirmDismiss` — o'chirishdan oldin tasdiqlash (`Future<bool>`); `false` qaytsa, element joyiga qaytadi.

### Sudrab olib borish: `LongPressDraggable` va `DragTarget`

FD (Drag a UI element):

- **`LongPressDraggable<T>`** — uzoq bosilganda barmoq ostida yangi widget (`feedback`) paydo bo'ladi va barmoq bilan
  yuradi. `data` — tashlanganda yetkaziladigan ma'lumot.
- **`DragTarget<T>`** — tashlash joyi. `builder` ga ustidan sudralayotgan elementlar (`candidateItems`) keladi — shu
  bilan ko'rinishni o'zgartirish mumkin. Tashlanganda `onAcceptWithDetails` chaqiriladi.
- FD: `DragTarget` ning turi `LongPressDraggable` turiga **mos bo'lishi kerak**, aks holda `onAcceptWithDetails`
  chaqirilmaydi.

## Ko'rib chiqamiz

Savat ekrani: bitta kartada uch xil bosish, `InkWell` tugmasi, kitobni savatga sudrab tashlash va savatdan surib
o'chirish.

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const DokonApp());
}

class DokonApp extends StatelessWidget {
  const DokonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: const SavatSahifasi(),
    );
  }
}

class SavatSahifasi extends StatefulWidget {
  const SavatSahifasi({super.key});

  @override
  State<SavatSahifasi> createState() => _SavatSahifasiState();
}

class _SavatSahifasiState extends State<SavatSahifasi> {
  final _kitoblar = ['Flutter asoslari', 'Dart tili', 'Toza kod'];
  final _savat = ['Algoritmlar', 'SQL kitobi', 'Git qo\'llanmasi'];
  String _oxirgi = '—';
  int _yoqtirish = 0;

  void _xabar(String matn) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(matn)));
  }

  @override
  Widget build(BuildContext context) {
    final rang = Theme.of(context).colorScheme;
    return Scaffold(
      appBar: AppBar(title: const Text('Savat')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 1) GestureDetector: bitta joyda uch xil imo-ishora
          GestureDetector(
            onTap: () => setState(() => _oxirgi = 'onTap'),
            onDoubleTap: () => setState(() {
              _yoqtirish++;
              _oxirgi = 'onDoubleTap';
            }),
            onLongPress: () => setState(() => _oxirgi = 'onLongPress'),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: rang.primaryContainer,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text('Kun kitobi · yoqtirish: $_yoqtirish\nOxirgi imo-ishora: $_oxirgi'),
            ),
          ),
          const SizedBox(height: 12),
          // 2) InkWell: Material "to'lqin" (ripple) effekti bilan bosish
          Material(
            color: rang.secondaryContainer,
            borderRadius: BorderRadius.circular(12),
            clipBehavior: Clip.antiAlias,
            child: InkWell(
              onTap: () => _xabar('Katalog ochiladi'),
              child: const Padding(
                padding: EdgeInsets.all(16),
                child: Text('Katalogga o\'tish (InkWell)'),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // 3) Sudrab olib borish: kitobni bosib turib savatga tashlash
          const Text('Kitobni bosib turing va savatga olib boring:'),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final k in _kitoblar)
                LongPressDraggable<String>(
                  data: k, // DragTarget'ga yetadigan ma'lumot
                  feedback: Material(color: Colors.transparent, child: Chip(label: Text(k))),
                  childWhenDragging: Opacity(opacity: 0.3, child: Chip(label: Text(k))),
                  child: Chip(label: Text(k)),
                ),
            ],
          ),
          const SizedBox(height: 8),
          DragTarget<String>(
            // Savatda bor kitob qabul qilinmaydi
            onWillAcceptWithDetails: (d) => !_savat.contains(d.data),
            onAcceptWithDetails: (d) {
              setState(() => _savat.add(d.data));
              _xabar('${d.data} savatga qo\'shildi');
            },
            builder: (context, nomzodlar, radEtilgan) => Container(
              key: const Key('savat'),
              height: 64,
              decoration: BoxDecoration(
                color: nomzodlar.isNotEmpty
                    ? rang.tertiaryContainer
                    : radEtilgan.isNotEmpty
                        ? rang.errorContainer
                        : rang.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.shopping_cart),
                  const SizedBox(width: 8),
                  Text('Savat: ${_savat.length} ta kitob'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),
          // 4) Surib o'chirish: chapga surilgan kitob savatdan olinadi
          for (final k in _savat)
            Dismissible(
              key: ValueKey(k),
              direction: DismissDirection.endToStart,
              background: Container(
                color: rang.error,
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 16),
                child: Icon(Icons.delete, color: rang.onError),
              ),
              onDismissed: (_) {
                setState(() => _savat.remove(k)); // ro'yxatdan ham olib tashlash shart
                _xabar('$k savatdan olindi');
              },
              child: ListTile(title: Text(k)),
            ),
        ],
      ),
    );
  }
}
```

E'tibor bering:

- `InkWell` ning rangi `Material(color: …)` da, `InkWell` ichidagi `Container` da emas — aks holda to'lqin ko'rinmaydi.
- `onWillAcceptWithDetails` — `DragTarget` kelgan ma'lumotni **rad etishi** mumkin. Rad etilgan element ustida turganda
  `builder` ning uchinchi argumentiga tushadi — savat qizg'ish bo'ladi.
- `Dismissible` kaliti — kitob nomi (`ValueKey(k)`), indeks emas: o'chirishdan keyin indekslar siljiydi.

Testlar (`test/widget_test.dart`). Widget testida imo-ishoralar `tester.tap`, `tester.longPress`, `tester.drag` va
qo'lda boshqariladigan `startGesture` bilan beriladi:

```dart
import 'package:flutter/gestures.dart' show kDoubleTapTimeout, kLongPressTimeout;
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  final karta = find.textContaining('Kun kitobi');

  testWidgets('onTap ikkinchi bosishni kutadi (gesture arena)', (tester) async {
    debugPrint('kDoubleTapTimeout = $kDoubleTapTimeout, kLongPressTimeout = $kLongPressTimeout');
    await tester.pumpWidget(const DokonApp());

    await tester.tap(karta);
    await tester.pump(const Duration(milliseconds: 100));
    debugPrint('100 ms dan keyin: ${find.textContaining('onTap').evaluate().isEmpty ? 'onTap hali yo\'q' : 'onTap bor'}');
    await tester.pump(kDoubleTapTimeout);
    expect(find.textContaining('Oxirgi imo-ishora: onTap'), findsOneWidget);
    debugPrint('300 ms dan keyin: onTap bor');
  });

  testWidgets('Ikki marta va uzoq bosish', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.tap(karta);
    await tester.pump(const Duration(milliseconds: 50));
    await tester.tap(karta);
    await tester.pumpAndSettle();
    expect(find.textContaining('yoqtirish: 1'), findsOneWidget);

    await tester.longPress(karta);
    await tester.pumpAndSettle();
    expect(find.textContaining('onLongPress'), findsOneWidget);
    debugPrint((tester.widget<Text>(karta)).data!);
  });

  testWidgets('Kitobni savatga sudrab olib borish', (tester) async {
    await tester.pumpWidget(const DokonApp());

    Future<void> sudra(String kitob, Finder qayerga) async {
      final g = await tester.startGesture(tester.getCenter(find.text(kitob).first));
      await tester.pump(kLongPressTimeout + const Duration(milliseconds: 100));
      await g.moveTo(tester.getCenter(qayerga));
      await tester.pump();
      await g.up();
      await tester.pumpAndSettle();
    }

    await sudra('Dart tili', find.byKey(const Key('savat')));
    expect(find.text('Savat: 4 ta kitob'), findsOneWidget);
    debugPrint('Dart tili tashlandi → Savat: 4 ta kitob');

    await sudra('Dart tili', find.byKey(const Key('savat'))); // ikkinchi marta — rad etiladi
    expect(find.text('Savat: 4 ta kitob'), findsOneWidget);
    debugPrint('Yana Dart tili → hali ham 4 ta (onWillAcceptWithDetails rad etdi)');

    await sudra('Toza kod', find.text('Katalogga o\'tish (InkWell)')); // DragTarget emas
    expect(find.text('Savat: 4 ta kitob'), findsOneWidget);
    debugPrint('Toza kod boshqa joyga tashlandi → hali ham 4 ta');
  });

  testWidgets('Chapga surilgan kitob savatdan olinadi', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.drag(find.text('SQL kitobi'), const Offset(-500, 0));
    await tester.pumpAndSettle();
    expect(find.widgetWithText(ListTile, 'SQL kitobi'), findsNothing);
    expect(find.text('Savat: 2 ta kitob'), findsOneWidget);
    expect(find.text('SQL kitobi savatdan olindi'), findsOneWidget);

    await tester.drag(find.text('Algoritmlar'), const Offset(500, 0)); // o'ngga — ruxsat yo'q
    await tester.pumpAndSettle();
    expect(find.widgetWithText(ListTile, 'Algoritmlar'), findsOneWidget);
    debugPrint('chapga: o\'chirildi, o\'ngga: joyida qoldi (direction: endToStart)');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 6.0s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: onTap ikkinchi bosishni kutadi (gesture arena)
kDoubleTapTimeout = 0:00:00.300000, kLongPressTimeout = 0:00:00.500000
100 ms dan keyin: onTap hali yo'q
300 ms dan keyin: onTap bor
00:03 +1: Ikki marta va uzoq bosish
Kun kitobi · yoqtirish: 1
Oxirgi imo-ishora: onLongPress
00:03 +2: Kitobni savatga sudrab olib borish
Dart tili tashlandi → Savat: 4 ta kitob
Yana Dart tili → hali ham 4 ta (onWillAcceptWithDetails rad etdi)
Toza kod boshqa joyga tashlandi → hali ham 4 ta
00:04 +3: Chapga surilgan kitob savatdan olinadi
chapga: o'chirildi, o'ngga: joyida qoldi (direction: endToStart)
00:04 +4: All tests passed!
```

Natijada:

- Ikki marta bosishni kutish vaqti — **300 ms**, uzoq bosish — **500 ms**. Karta bosilgach 100 ms o'tsa ham `onTap`
  chaqirilmagan: maydonda ikki marta bosish tanib oluvchisi hali kutyapti. 300 ms o'tgach u chiqib ketdi va `onTap` yutdi.
- Kitob savatga bir marta qo'shildi. Ikkinchi marta — `onWillAcceptWithDetails` rad etdi. `DragTarget` bo'lmagan joyga
  tashlangan kitob hech qayerga qo'shilmadi.
- Chapga surish o'chirdi, o'ngga surish — `direction: endToStart` tufayli ta'sir qilmadi.

Brauzerda (`flutter build web`). Chapda — "Dart tili" uzoq bosilib, savat ustiga olib kelindi: joyida xira nusxasi
(`childWhenDragging`), barmoq ostida `feedback`, savat esa `candidateItems` bo'sh emasligi uchun boshqa rangda. O'ngda —
"SQL kitobi" chapga surilmoqda, ostidan qizil fon va o'chirish belgisi (`background`) chiqyapti:

<img src="/rasmlar/flutter/21-sudrash.png" alt="Dart tili chipi savat ustida, savat ko'kish rangga o'zgargan, joyidagi chip xira" width="300"> <img src="/rasmlar/flutter/21-surish.png" alt="SQL kitobi qatori chapga surilgan, o'rnida qizil fon va o'chirish belgisi" width="300">

## Tipik xatolar

### `onDismissed` da ro'yxatdan o'chirmaslik

```dart
onDismissed: (_) {}, // ro'yxatdan olib tashlanmadi
```

Element surib chiqarildi, lekin ma'lumotda qoldi. Keyingi qayta qurishda (istalgan `setState`):

```text vps
$ flutter test test/dismiss_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/dismiss_test.dart
00:00 +0: Dismissible o'chdi, lekin ro'yxatda qoldi
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building Dismissible-[<'Algoritmlar'>](dependencies:
[Directionality], state: _DismissibleState#d5975(tickers: tracking 2 tickers)):
A dismissed Dismissible widget is still part of the tree.
Make sure to implement the onDismissed handler and to immediately remove the Dismissible widget from
the application once that handler has fired.
```

(Stek izi qisqartirildi.) Xabarning o'zi yechimni aytadi: `onDismissed` da elementni **darhol** ma'lumotdan olib
tashlang (`setState(() => _savat.remove(k))`).

### `InkWell` `Material` siz

```dart
Directionality(
  textDirection: TextDirection.ltr,
  child: InkWell(onTap: () {}, child: const Text('Bos')),
)
```

```text vps
$ flutter test test/inkwell_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/inkwell_test.dart
00:00 +0: InkWell Material ichida emas
══╡ EXCEPTION CAUGHT BY WIDGETS LIBRARY ╞═══════════════════════════════════════════════════════════
The following assertion was thrown building _InkResponseStateWidget(gestures: [tap], mouseCursor:
null, clipped to BoxShape.rectangle, dirty, state: _InkResponseState#94f05):
No Material widget found.
_InkResponseStateWidget widgets require a Material widget ancestor within the closest
LookupBoundary.
In Material Design, most widgets are conceptually "printed" on a sheet of material. In Flutter's
material library, that material is represented by the Material widget. It is the Material widget
that renders ink splashes, for instance. Because of this, many material library widgets require that
there be a Material widget in the tree above them.
To introduce a Material widget, you can either directly include one, or use a widget that contains
Material itself, such as a Card, Dialog, Drawer, or Scaffold.
```

(Stek izi qisqartirildi.) Yechim — `Material` yoki uni o'z ichiga olgan `Card`, `Scaffold` kabi widget.

### Ko'rinmas maydon bosilmaydi

API (`GestureDetector`): ko'rinmas bolali `GestureDetector` standartda bosishlarni **e'tiborsiz qoldiradi**; buni
`behavior` boshqaradi.

```dart
for (final behavior in [null, HitTestBehavior.opaque]) {
  testWidgets('Ko\'rinmas bola, behavior: $behavior', (tester) async {
    var bosildi = 0;
    await tester.pumpWidget(
      Center(
        child: GestureDetector(
          behavior: behavior,
          onTap: () => bosildi++,
          child: const SizedBox(width: 100, height: 100),
        ),
      ),
    );
    await tester.tap(find.byType(GestureDetector), warnIfMissed: false);
    debugPrint('bosildi: $bosildi');
  });
}
```

```text vps
$ flutter test test/bosish_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/bosish_test.dart
00:00 +0: Ko'rinmas bola, behavior: null
bosildi: 0
00:00 +1: Ko'rinmas bola, behavior: HitTestBehavior.opaque
bosildi: 1
00:00 +2: All tests passed!
```

100×100 bo'sh `SizedBox` ustidagi bosish standartda o'tib ketdi (0), `HitTestBehavior.opaque` bilan ushlandi (1).

### Pan va surishni aralashtirish

FD: `onPanStart`/`Update`/`End` ni `onHorizontalDrag…` yoki `onVerticalDrag…` bilan birga berish xatoga olib keladi.
Flutter 3.50.0 da sinab ko'rildi:

```dart
GestureDetector(
  onPanUpdate: (_) => kim.add('pan'),
  onHorizontalDragUpdate: (_) => kim.add('gorizontal'),
  child: const ColoredBox(color: Color(0xFF00897B)),
)
// ikkinchi test: onPanUpdate + onHorizontalDragUpdate + onVerticalDragUpdate
```

```text vps
$ flutter test test/pan_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/pan_test.dart
00:00 +0: onPanUpdate va onHorizontalDragUpdate birga
gorizontal surish: {gorizontal}
vertikal surish:   {}
00:00 +1: pan + gorizontal + vertikal birga
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following assertion was thrown running a test:
Incorrect GestureDetector arguments.
Simultaneously having a vertical drag gesture recognizer, a horizontal drag gesture recognizer, and
a pan gesture recognizer will result in the pan gesture recognizer being ignored, since the other
two will catch all drags.
```

- Pan + gorizontal: xato chiqmadi, lekin **vertikal surishda hech narsa chaqirilmadi**. Taqqoslash uchun faqat
  `onPanUpdate` qoldirilganda vertikal surish pan'ni chaqirdi (shu sinovda tekshirildi). Ya'ni aralashma jim ishlamay
  qoladi.
- Uchalasi birga: `GestureDetector` yaratilishidayoq xato — pan baribir e'tiborsiz qoladi.

Yechim: bitta widget'da yo pan, yo yo'nalishli surish.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `A dismissed Dismissible widget is still part of the tree` | `onDismissed` da ma'lumotdan o'chirilmagan | `setState` ichida darhol o'chirish |
| `Dismissible` kaliti — indeks | FD: kalit widget'ni aniq ajratadi; o'chirishdan keyin indeks boshqa elementniki bo'lib qoladi | Element identifikatori (`ValueKey(k)`) |
| `No Material widget found.` | `InkWell` ota daraxtida `Material` yo'q | `Material`, `Card`, `Scaffold` ichiga |
| `InkWell` to'lqini ko'rinmaydi | Orada rangli `Container` to'lqinni yopadi | Rang — `Material(color:)` da yoki `Ink` |
| Bo'sh joy bosilmaydi | Ko'rinmas bola standartda bosishni o'tkazib yuboradi | `behavior: HitTestBehavior.opaque` |
| `onTap` sekin ishlaydi | Yonida `onDoubleTap` — arena 300 ms kutadi | Ikki marta bosish kerak bo'lmasa, uni bermang |
| Pan va gorizontal/vertikal surish birga | Pan jim ishlamaydi yoki xato | Bittasini tanlang |
| `DragTarget<int>` ga `LongPressDraggable<String>` | FD: turlar mos bo'lmasa `onAcceptWithDetails` chaqirilmaydi | Bir xil tur |
| Tayyor tugma o'rniga `GestureDetector` | Fokus, to'lqin, qulaylik o'zingizda | Imkon bo'lsa `FilledButton`, `IconButton` |

## Amaliyot

1. Pointer hodisasi va imo-ishora farqi nima?
2. `GestureDetector` qaysi imo-ishoralarni taniydi?
3. Nega `onDoubleTap` qo'shilganda `onTap` kechikadi? Qancha?
4. `InkWell` nega `Material` ichida bo'lishi kerak?
5. `Dismissible` da `onDismissed` nima qilishi shart?
6. `DragTarget` kelgan elementni qanday rad etadi va bu ekranda qanday ko'rinadi?
7. Savatdan o'chirishdan oldin "Rostdan o'chirilsinmi?" deb so'rang (`confirmDismiss` va `showDialog`).

<details>
<summary>Javoblar</summary>

1. Pointer hodisasi — xom ma'lumot (tegdi, siljidi, ko'tarildi, bekor qilindi); imo-ishora — ulardan tanib olingan ma'noli harakat (bosish, surish, kattalashtirish).
2. Faqat `null` bo'lmagan callback'lariga mos imo-ishoralarni.
3. Imo-ishoralar maydonida ikki marta bosish tanib oluvchisi ikkinchi bosishni kutadi; u chiqib ketgandan keyingina `onTap` yutadi. Sinovda — 300 ms (`kDoubleTapTimeout`).
4. To'lqin `Material` ustida chiziladi; ota daraxtida bo'lmasa — `No Material widget found.`
5. Elementni ma'lumotdan darhol olib tashlashi (`setState`), aks holda keyingi qayta qurishda xato.
6. `onWillAcceptWithDetails` `false` qaytaradi; element `builder` ning `rejectedItems` (bizda `radEtilgan`) ro'yxatiga tushadi — shu bilan rangni o'zgartirish mumkin.
7. `confirmDismiss: (_) async => await showDialog<bool>(context: context, builder: (c) => AlertDialog(content: const Text('Rostdan o\'chirilsinmi?'), actions: [TextButton(onPressed: () => Navigator.pop(c, false), child: const Text('Yo\'q')), TextButton(onPressed: () => Navigator.pop(c, true), child: const Text('Ha'))])) ?? false`. API: `false` yoki `null` bo'lsa element joyiga qaytadi. VPS'dagi testda: "Yo'q" bosilganda ro'yxat `[SQL kitobi]` qoldi, "Ha" dan keyin `[]`.

</details>

## Rasmiy hujjat

- [FD: Taps, drags, and other gestures](https://docs.flutter.dev/ui/interactivity/gestures)
- [FD: Handle taps](https://docs.flutter.dev/cookbook/gestures/handling-taps)
- [FD: Add Material touch ripples](https://docs.flutter.dev/cookbook/gestures/ripples)
- [FD: Implement swipe to dismiss](https://docs.flutter.dev/cookbook/gestures/dismissible)
- [FD: Drag a UI element](https://docs.flutter.dev/cookbook/effects/drag-a-widget)
- [API: GestureDetector](https://api.flutter.dev/flutter/widgets/GestureDetector-class.html) · [Dismissible.confirmDismiss](https://api.flutter.dev/flutter/widgets/Dismissible/confirmDismiss.html)
- [API: InkWell](https://pub.dev/documentation/material_ui/latest/material_ui/InkWell-class.html)
