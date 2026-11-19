# 26 — Animatsiyalar

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan. Animatsiyaning oraliq qiymatlari testda vaqtni qadamma-qadam surib
> (`tester.pump(Duration)`) o'lchandi; skrinshotlar `flutter build web` natijasidan.

## Tushuncha

### Ikki tur: tween va fizika

FD (Introduction to animations): animatsiyalar odatda ikki xil bo'ladi:

- **Tween** (inglizcha *in-between* — "oraliq") — boshlanish va tugash nuqtasi, vaqt va **egri chiziq** (curve) beriladi;
  oraliq qiymatlarni Flutter o'zi hisoblaydi. Egri chiziq — harakat tezligi qanday o'zgarishi: bir tekis, sekin
  boshlanib tezlashadigan va h.k.
- **Fizikaga asoslangan** (physics-based) — harakat haqiqiy dunyodagidek modellanadi (masalan, prujina).

Bu bob tween animatsiyalar haqida.

### Yashirin va aniq animatsiya

| | Yashirin (implicit) | Aniq (explicit) |
| --- | --- | --- |
| Kim boshqaradi | Flutter: yangi qiymat berildi — o'zi unga o'tadi | siz: `AnimationController` bilan boshlash, to'xtatish, teskari yurgizish |
| Nima kerak | `duration` va (ixtiyoriy) `curve` | `AnimationController`, `vsync`, `dispose()` |
| Misollar | `AnimatedContainer`, `AnimatedOpacity`, `AnimatedPadding`, `AnimatedPositioned`, `AnimatedSwitcher`, `TweenAnimationBuilder` | `FadeTransition`, `ScaleTransition`, `SlideTransition`, `SizeTransition`, `AnimatedBuilder` |

FD: tayyor yashirin animatsiyalar — "amalga oshirish eng oson" animatsiya; ehtiyojingizga mos kelsa, ulardan boshlang.
Kerakli xususiyat uchun tayyor widget bo'lmasa — `TweenAnimationBuilder` (o'z yashirin animatsiyangiz).

### Yashirin animatsiya qanday ishlaydi

FD (Implicit animations): `AnimationController` yoki `Ticker` ni boshqarish shart emas. Widget'ga `duration` va ixtiyoriy
`curve` berasiz; keyin `setState()` dan so'ng yangi qiymat bilan qayta qurilsa — eski qiymatdan yangisiga o'zi animatsiya
qiladi. FD (AnimatedContainer): `AnimatedContainer` `Container` kabi eni, bo'yi, rangi va boshqalarni oladi, faqat ular
o'zgarganda sakramasdan silliq o'tadi.

### Aniq animatsiya: asosiy sinflar

FD (Introduction to animations, Animations tutorial):

- **`Animation<T>`** — joriy qiymat (`value`) va holat (`status`: `dismissed`, `forward`, `reverse`, `completed`). U ekranga
  hech narsa chizmaydi — faqat sonlar beradi.
- **`AnimationController`** — har yangi kadr (frame) uchun yangi qiymat beradigan `Animation`. Standart holatda berilgan
  `duration` davomida 0.0 dan 1.0 gacha bir tekis o'sadi. `forward()`, `reverse()`, `repeat()`, `stop()` bilan boshqariladi.
- **`vsync`** — FD: ekranda ko'rinmayotgan animatsiya ortiqcha resurs sarflamasligi uchun. `State` klassiga
  `SingleTickerProviderStateMixin` qo'shib, `vsync: this` beriladi.
- **`Tween`** — kirish oralig'ini (0..1) chiqish oralig'iga (masalan, 1..1.5) moslaydi. `tween.animate(controller)` yoki
  `animation.drive(tween)` bilan ishlatiladi.
- **`CurvedAnimation`** — bir tekis o'sishni egri chiziq bo'yicha o'zgartiradi (`Curves.easeOut` va h.k.).
- **`dispose()`** — FD: `State` yo'q qilinganda boshqaruvchini yo'q qiling, aks holda xotira oqadi (memory leak).

Qiymat o'zgarganda widget'ni qayta qurishning uch yo'li bor (FD tutorial): `addListener` + `setState`, `AnimatedWidget` dan
meros olish, yoki `AnimatedBuilder`. Eng qulayi — tayyor `*Transition` widget'lari (`ScaleTransition` va boshqalar): ular
`AnimatedWidget` asosida, animatsiyani berasiz — qolganini o'zi qiladi.

`addStatusListener` — holat o'zgarishlarini kuzatadi. FD misolida `completed` bo'lganda `reverse()` chaqiriladi; doimiy
borib-kelish uchun `controller.repeat(reverse: true)` yetarli.

### Hero — umumiy element o'tishi

FD (Hero animations): bir sahifadan ikkinchisiga "uchib o'tadigan" widget — **hero**. Boshqa nomi — umumiy element o'tishi
(shared element transition). Masalan, ro'yxatdagi kichik muqova bosilganda kitob sahifasidagi katta muqovaga aylanadi.

Qoidalar va ishlash tartibi (FD):

- Ikkala sahifada **`Hero` widget'i bir xil `tag`** bilan bo'lishi shart — odatda shu ma'lumotni bildiruvchi obyekt.
  Ichidagi widget daraxtlari deyarli bir xil bo'lsa, natija eng yaxshi.
- `Navigator` ning `push` va `pop` amallari teglari mos har bir hero juftligi uchun animatsiyani ishga tushiradi.
- Uchish paytida hero ilova **overlay** iga ko'chiriladi — ikkala sahifaning ustida ko'rinadi. Chegarasi `RectTween`
  bilan hisoblanadi. Uchish tugagach, hero yangi sahifaga o'tadi.
- Sekin ko'rish uchun FD `timeDilation` ni beradi (`import 'package:flutter/scheduler.dart' show timeDilation;`,
  `timeDilation = 5;` — 5 marta sekin).

### Sahifa o'tishini o'zgartirish

FD (Animate a page route transition): `PageRouteBuilder` ikki funksiya oladi — `pageBuilder` (sahifaning o'zi) va
`transitionsBuilder` (o'tish animatsiyasi). Pastdan chiqish uchun `Offset(0.0, 1.0)` dan `Offset.zero` gacha
`Tween`, unga `chain(CurveTween(...))` bilan egri chiziq qo'shiladi va `SlideTransition` ga `animation.drive(tween)`
beriladi.

### Boshqa namunalar

FD (Common animation patterns) yana ikkitasini sanaydi: ro'yxat yoki to'rga element qo'shilishi va o'chirilishini
animatsiya qilish (animated list/grid) va bosqichma-bosqich animatsiya (staggered) — kichik harakatlar ketma-ket yoki
bir-birining ustiga tushib boshlanadi. Ular bu bobda yo'q; havolalar oxirida.

## Ko'rib chiqamiz

Kitob do'koni to'rt animatsiya bilan:

| Joy | Animatsiya | Tur |
| --- | --- | --- |
| Ro'yxat → kitob sahifasi | muqova uchib kattalashadi | `Hero` |
| "Savatga" tugmasi | eni, rangi, burchagi o'zgaradi; ostida izoh paydo bo'ladi | yashirin: `AnimatedContainer`, `AnimatedOpacity` |
| Yurak (sevimli) | bosilganda kattalashib, joyiga qaytadi | aniq: `AnimationController` + `ScaleTransition` |
| Savat sahifasi | pastdan chiqadi | `PageRouteBuilder` + `SlideTransition` |

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

class Kitob {
  const Kitob(this.nom, this.muallif, this.rang);

  final String nom;
  final String muallif;
  final Color rang;
}

const kitoblar = [
  Kitob('Dart tili', 'D. Rasulov', Colors.indigo),
  Kitob('Flutter asoslari', 'N. Karimova', Colors.teal),
  Kitob('Toza kod', 'R. Martin', Colors.deepOrange),
];

void main() => runApp(const DokonApp());

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

/// Kitob muqovasi: ro'yxatda kichik, kitob sahifasida katta
class Muqova extends StatelessWidget {
  const Muqova({super.key, required this.kitob, required this.eni});

  final Kitob kitob;
  final double eni;

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: kitob, // ikkala sahifada bir xil teg
      child: Container(
        width: eni,
        height: eni * 1.4,
        decoration: BoxDecoration(color: kitob.rang, borderRadius: BorderRadius.circular(8)),
        child: Icon(Icons.menu_book, color: Colors.white, size: eni / 2),
      ),
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kitob do\'koni'),
        actions: [
          IconButton(
            tooltip: 'Savat',
            icon: const Icon(Icons.shopping_cart),
            onPressed: () => Navigator.push(context, pastdanChiqadi(const SavatSahifasi())),
          ),
        ],
      ),
      body: ListView(
        children: [
          for (final k in kitoblar)
            ListTile(
              leading: Muqova(kitob: k, eni: 40),
              title: Text(k.nom),
              subtitle: Text(k.muallif),
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

/// Sahifa pastdan yuqoriga chiqib keladi
Route<void> pastdanChiqadi(Widget sahifa) {
  return PageRouteBuilder(
    pageBuilder: (context, animation, secondaryAnimation) => sahifa,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final tween = Tween(begin: const Offset(0, 1), end: Offset.zero).chain(CurveTween(curve: Curves.ease));
      return SlideTransition(position: animation.drive(tween), child: child);
    },
  );
}

class KitobSahifasi extends StatefulWidget {
  const KitobSahifasi({super.key, required this.kitob});

  final Kitob kitob;

  @override
  State<KitobSahifasi> createState() => _KitobSahifasiState();
}

class _KitobSahifasiState extends State<KitobSahifasi> {
  bool _savatda = false;

  @override
  Widget build(BuildContext context) {
    final k = widget.kitob;
    return Scaffold(
      appBar: AppBar(title: Text(k.nom), actions: const [SevimliTugma()]),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Muqova(kitob: k, eni: 160),
            const SizedBox(height: 16),
            Text(k.muallif),
            const SizedBox(height: 24),
            // Yashirin animatsiya: yangi qiymat berilsa, eskisidan unga o'zi o'tadi
            AnimatedContainer(
              key: const ValueKey('savat-tugma'),
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              width: _savatda ? 220 : 160,
              height: 48,
              decoration: BoxDecoration(
                color: _savatda ? Colors.green : Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(_savatda ? 8 : 24),
              ),
              child: TextButton(
                onPressed: () => setState(() => _savatda = !_savatda),
                child: Text(
                  _savatda ? 'Savatda ✓' : 'Savatga',
                  style: const TextStyle(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height: 8),
            AnimatedOpacity(
              opacity: _savatda ? 1 : 0,
              duration: const Duration(milliseconds: 300),
              child: const Text('Savatni tepadagi tugmadan oching'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Aniq (explicit) animatsiya: yurak bosilganda kattalashib, joyiga qaytadi
class SevimliTugma extends StatefulWidget {
  const SevimliTugma({super.key});

  @override
  State<SevimliTugma> createState() => _SevimliTugmaState();
}

class _SevimliTugmaState extends State<SevimliTugma> with SingleTickerProviderStateMixin {
  late final AnimationController _boshqaruvchi = AnimationController(
    duration: const Duration(milliseconds: 200),
    vsync: this,
  );
  late final Animation<double> _olcham = Tween<double>(begin: 1, end: 1.5)
      .animate(CurvedAnimation(parent: _boshqaruvchi, curve: Curves.easeOut));
  bool _sevimli = false;

  @override
  void initState() {
    super.initState();
    _boshqaruvchi.addStatusListener((holat) {
      if (holat == AnimationStatus.completed) _boshqaruvchi.reverse();
    });
  }

  @override
  void dispose() {
    _boshqaruvchi.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _olcham,
      child: IconButton(
        tooltip: 'Sevimli',
        icon: Icon(_sevimli ? Icons.favorite : Icons.favorite_border, color: Colors.red),
        onPressed: () {
          setState(() => _sevimli = !_sevimli);
          _boshqaruvchi.forward(from: 0);
        },
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
      body: const Center(child: Text('Savat bo\'sh')),
    );
  }
}
```

Muhim joylar:

- **Hero tegi — `kitob` obyekti.** Ro'yxatdagi va sahifadagi `Muqova` bir xil `Kitob` ni oladi — teglar mos. Uch kitob —
  uch xil teg, bitta sahifada takror yo'q.
- **Yashirin animatsiyada animatsiya kodi yo'q.** `setState` faqat `_savatda` ni o'zgartiradi; `AnimatedContainer` va
  `AnimatedOpacity` eski qiymatdan yangisiga o'zi o'tadi.
- **Aniq animatsiyada hammasi qo'lda:** boshqaruvchi, `vsync: this`, `Tween` + `CurvedAnimation`, `completed` da `reverse()`
  va albatta `dispose()`. `forward(from: 0)` — har bosishda boshidan.

### Testda vaqtni surish

Testda vaqt o'zi o'tmaydi: `tester.pump(Duration(milliseconds: 75))` — "75 ms o'tdi, yangi kadr chiz". Shunday qilib
animatsiyaning har bosqichidagi qiymatni o'lchash mumkin.

`test/widget_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('AnimatedContainer: 300 ms da 160 → 220', (tester) async {
    await tester.pumpWidget(MaterialApp(home: KitobSahifasi(kitob: kitoblar[0])));
    final tugma = find.byKey(const ValueKey('savat-tugma'));
    await tester.tap(find.text('Savatga'));
    for (final ms in [0, 75, 75, 75, 75]) {
      await tester.pump(Duration(milliseconds: ms));
      debugPrint('eni: ${tester.getSize(tugma).width.toStringAsFixed(1)}');
    }
  });

  testWidgets('Hero: muqova ro\'yxatdan kitob sahifasiga uchadi', (tester) async {
    await tester.pumpWidget(const DokonApp());
    // "Toza kod" muqovasi — ekranda ko'rinib turgan nusxasi
    final muqova = find.byWidgetPredicate(
        (w) => w is Container && (w.decoration as BoxDecoration?)?.color == Colors.deepOrange);
    String joy() => muqova.evaluate().map((e) => tester.getRect(find.byWidget(e.widget))).join(', ');

    debugPrint('boshida: ${joy()}');
    await tester.tap(find.text('Toza kod'));
    await tester.pump(); // o'tish boshlandi
    for (final ms in [100, 100, 100]) {
      await tester.pump(Duration(milliseconds: ms));
      debugPrint('+$ms ms: ${joy()}');
    }
    await tester.pumpAndSettle();
    debugPrint('oxiri: ${joy()}');
  });

  testWidgets('Sevimli: aniq animatsiya 1 → 1.5 → 1', (tester) async {
    await tester.pumpWidget(MaterialApp(home: KitobSahifasi(kitob: kitoblar[1])));
    double olcham() => tester.widget<ScaleTransition>(
        find.descendant(of: find.byType(SevimliTugma), matching: find.byType(ScaleTransition))).scale.value;
    await tester.tap(find.byTooltip('Sevimli'));
    for (final ms in [0, 100, 100, 100, 100, 100]) {
      await tester.pump(Duration(milliseconds: ms));
      debugPrint('olcham: ${olcham().toStringAsFixed(2)}');
    }
    expect(find.byIcon(Icons.favorite), findsOneWidget);
  });

  testWidgets('Savat pastdan chiqadi', (tester) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = const Size(390, 640);
    addTearDown(tester.view.reset);
    await tester.pumpWidget(const DokonApp());
    await tester.tap(find.byTooltip('Savat'));
    await tester.pump(); // o'tish boshlandi
    for (final ms in [100, 100, 100]) {
      await tester.pump(Duration(milliseconds: ms));
      debugPrint('Savat sarlavhasi y: ${tester.getTopLeft(find.text('Savat').last).dy.toStringAsFixed(1)}');
    }
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 4.7s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: AnimatedContainer: 300 ms da 160 → 220
eni: 160.0
eni: 167.7
eni: 190.0
eni: 212.3
eni: 220.0
00:02 +1: Hero: muqova ro'yxatdan kitob sahifasiga uchadi
boshida: Rect.fromLTRB(16.0, 208.0, 56.0, 264.0)
+100 ms: Rect.fromLTRB(70.3, 206.2, 132.9, 267.3)
+100 ms: Rect.fromLTRB(229.9, 178.9, 357.0, 316.7)
+100 ms: Rect.fromLTRB(297.0, 157.0, 448.9, 355.8)
oxiri: Rect.fromLTRB(320.0, 148.0, 480.0, 372.0)
00:03 +2: Sevimli: aniq animatsiya 1 → 1.5 → 1
olcham: 1.00
olcham: 1.34
olcham: 1.50
olcham: 1.50
olcham: 1.34
olcham: 1.00
00:03 +3: Savat pastdan chiqadi
Savat sarlavhasi y: 285.2
Savat sarlavhasi y: 62.0
Savat sarlavhasi y: 14.0
00:03 +4: All tests passed!
```

Natijada:

- **`AnimatedContainer`:** 160 → 167,7 → 190 → 212,3 → 220. O'rtada (150 ms) aniq 190 — yarmi. Boshida va oxirida
  sekin (75 ms da atigi 7,7 px), o'rtada tez: bu `Curves.easeInOut` — sekin boshlanib, sekin tugaydi.
- **Hero:** ro'yxatdagi 40×56 muqova (chapda, `x=16`) uch qadamda sahifa o'rtasidagi 160×224 muqovaga uchib bordi. Har
  qadamda ekranda bitta muqova — uchayotgan nusxa; ikkala sahifadagi asl hero'lar uchish paytida ko'rinmaydi.
- **Sevimli:** 1,00 → 1,34 → 1,50 (200 ms, `completed`) → `reverse()` → 1,34 → 1,00. Status tinglovchisi ishladi:
  tugagach o'zi orqaga qaytdi. 300 ms dagi 1,50 — teskari yurish keyingi kadrdan hisoblandi.
- **Savat:** sarlavha pastdan (y=285) chiqib, 300 ms da joyiga (y=14) keldi.

### Brauzerda

Chapda — ro'yxat (har kitobning rangli muqovasi — `Hero`); o'rtada — "Toza kod" bosilgandan keyin muqova uchib kelayotgan
payt; o'ngda — kitob sahifasi: "Savatga" va yurak bosilgan:

<img src="/rasmlar/flutter/26-royxat.png" alt="Kitob do'koni ro'yxati: uch kitob, chapda rangli muqovalar" width="220"> <img src="/rasmlar/flutter/26-uchish.png" alt="Sahifa o'tishi paytida uchayotgan to'q sariq muqova" width="220"> <img src="/rasmlar/flutter/26-kitob.png" alt="Toza kod sahifasi: katta muqova, yashil 'Savatda ✓' tugmasi, qizil yurak" width="220">

## Tipik xatolar

To'rt xato alohida testda (`test/xato_test.dart`) chiqarildi — har biri alohida ishga tushirildi:

```dart
// 1. dispose() yo'q
class _DisposeYoqState extends State<DisposeYoq> with SingleTickerProviderStateMixin {
  late final _b = AnimationController(duration: const Duration(seconds: 1), vsync: this)..forward();

  @override
  Widget build(BuildContext context) => FadeTransition(opacity: _b, child: const Text('a'));
}

// 2. SingleTickerProviderStateMixin va ikki boshqaruvchi
class _IkkiBoshqaruvchiState extends State<IkkiBoshqaruvchi> with SingleTickerProviderStateMixin {
  late final _a = AnimationController(duration: const Duration(seconds: 1), vsync: this);
  late final _b = AnimationController(duration: const Duration(seconds: 1), vsync: this);
  // ... dispose() bor, build() ikkalasini ishlatadi
}

// 3. Bitta sahifada ikki Hero bir xil teg bilan — keyin Navigator.push
Column(children: [
  const Hero(tag: 'muqova', child: Icon(Icons.book)),
  const Hero(tag: 'muqova', child: Icon(Icons.book)),
  // ...
])

// 4. To'xtamaydigan animatsiya (repeat) va pumpAndSettle
late final _b = AnimationController(duration: const Duration(seconds: 1), vsync: this)..repeat(reverse: true);
// testda: await tester.pumpAndSettle();
```

```text vps
$ flutter test test/xato_test.dart --plain-name "dispose yo'q"
_DisposeYoqState#5860a(ticker active) was disposed with an active Ticker.
_DisposeYoqState created a Ticker via its SingleTickerProviderStateMixin, but at the time dispose() was called on the mixin, that Ticker was still active. The Ticker must be disposed before calling super.dispose().
Tickers used by AnimationControllers should be disposed by calling dispose() on the AnimationController itself. Otherwise, the ticker will leak.

$ flutter test test/xato_test.dart --plain-name "SingleTicker"
_IkkiBoshqaruvchiState is a SingleTickerProviderStateMixin but multiple tickers were created.
A SingleTickerProviderStateMixin can only be used as a TickerProvider once.
If a State is used for multiple AnimationController objects, or if it is passed to other objects and
those objects might use it more than one time in total, then instead of mixing in a
SingleTickerProviderStateMixin, use a regular TickerProviderStateMixin.

$ flutter test test/xato_test.dart --plain-name "Hero"
There are multiple heroes that share the same tag within a subtree.

$ flutter test test/xato_test.dart --plain-name "pumpAndSettle"
pumpAndSettle timed out
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `was disposed with an active Ticker` | `AnimationController.dispose()` chaqirilmagan — xotira oqadi | `dispose()` da `_boshqaruvchi.dispose()`, keyin `super.dispose()` |
| `is a SingleTickerProviderStateMixin but multiple tickers were created` | Bitta `State` da ikki boshqaruvchi | `TickerProviderStateMixin` (xato matnining o'zi aytadi) |
| `There are multiple heroes that share the same tag within a subtree` | Bitta sahifada ikki hero bir xil teg bilan — qaysi biri uchishi noma'lum | Har hero'ga noyob teg (masalan, ma'lumot obyekti) |
| `pumpAndSettle timed out` | `repeat()` hech qachon tugamaydi — "jim bo'lish" kutilmaydi | Bunday animatsiyani `pump(Duration)` bilan sinang |
| Yashirin animatsiya ishlamaydi | Qiymat `setState` siz o'zgartirilgan — widget qayta qurilmadi | Yangi qiymatni `setState` ichida bering (FD) |

## Amaliyot

1. Yashirin va aniq animatsiya farqi nima? Qachon qaysi biri (FD tavsiyasi)?
2. `AnimationController` qanday qiymatlar beradi? `vsync` nima uchun?
3. `Tween` va `CurvedAnimation` nima qiladi?
4. Hero animatsiya ishlashi uchun qanday shart bor? Uchish paytida hero qayerda bo'ladi?
5. `PageRouteBuilder` ning `pageBuilder` va `transitionsBuilder` farqi nima?
6. Nega testda animatsiyali widget uchun `pumpAndSettle` doim ham ishlamaydi?
7. "Savatga" ostidagi izoh `AnimatedOpacity` o'rniga `AnimatedSwitcher` bilan almashsin: `_savatda` bo'lsa "Savatda bor",
   aks holda "Savatda yo'q" matni (har biri o'z `key` i bilan). Testda bosgandan 150 ms keyin ekranda nechta matn bo'ladi?

<details>
<summary>Javoblar</summary>

1. Yashirin — yangi qiymat berasiz, Flutter o'zi animatsiya qiladi (`duration`, `curve`); aniq — `AnimationController` bilan
   o'zingiz boshqarasiz. FD: tayyor yashirin animatsiya ehtiyojga mos kelsa, undan boshlang.
2. Standart holatda `duration` davomida 0.0 dan 1.0 gacha bir tekis, har kadrda. `vsync` — ekranda ko'rinmayotgan
   animatsiya ortiqcha resurs sarflamasligi uchun.
3. `Tween` — 0..1 ni kerakli oraliqqa (masalan, 1..1.5 yoki `Offset`) moslaydi; `CurvedAnimation` — bir tekis o'sishni egri
   chiziq bo'yicha o'zgartiradi.
4. Ikkala sahifada bir xil `tag` li `Hero`; o'tish `Navigator` ning `push`/`pop` i bilan. Uchish paytida — overlay'da,
   ikkala sahifa ustida.
5. `pageBuilder` — sahifaning o'zi (bir marta quriladi), `transitionsBuilder` — uning ustidagi o'tish animatsiyasi.
6. `pumpAndSettle` kadr rejalashtirilmay qolguncha kutadi; `repeat()` kabi tugamaydigan animatsiyada bu hech qachon
   bo'lmaydi — `pumpAndSettle timed out`.
7. `AnimatedSwitcher(duration: const Duration(milliseconds: 300), child: Text(_savatda ? 'Savatda bor' : 'Savatda yo\'q',
   key: ValueKey(_savatda)))`. 150 ms da **2 ta** matn: eskisi so'nib ketayotgan, yangisi paydo bo'layotgan; 300 ms dan
   keyin — bitta. VPS'dagi testda: `150 ms: 2 ta matn`, `oxiri: 1 ta matn`.

</details>

## Rasmiy hujjat

- [FD: Introduction to animations](https://docs.flutter.dev/ui/animations)
- [FD: Implicit animations](https://docs.flutter.dev/ui/animations/implicit-animations)
- [FD: Animate the properties of a container](https://docs.flutter.dev/cookbook/animation/animated-container)
- [FD: Animations tutorial](https://docs.flutter.dev/ui/animations/tutorial)
- [FD: Hero animations](https://docs.flutter.dev/ui/animations/hero-animations)
- [FD: Animate a page route transition](https://docs.flutter.dev/cookbook/animation/page-route-animation)
- [FD: Staggered animations](https://docs.flutter.dev/ui/animations/staggered-animations)
- [API: AnimatedContainer](https://api.flutter.dev/flutter/widgets/AnimatedContainer-class.html) · [AnimationController](https://api.flutter.dev/flutter/animation/AnimationController-class.html) · [Hero](https://api.flutter.dev/flutter/widgets/Hero-class.html) · [PageRouteBuilder](https://api.flutter.dev/flutter/widgets/PageRouteBuilder-class.html) · [AnimatedSwitcher](https://api.flutter.dev/flutter/widgets/AnimatedSwitcher-class.html)
