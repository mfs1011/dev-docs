# 14 — Stateless va Stateful

[Mundarija](README.md)

## Tushuncha

FD (Add interactivity): har widget yo **stateless** (holatsiz), yo **stateful** (holatli).

| | `StatelessWidget` | `StatefulWidget` |
| --- | --- | --- |
| O'zgaradimi | hech qachon | ha: foydalanuvchi harakati yoki yangi ma'lumot kelganda |
| Misollar (FD) | `Icon`, `IconButton`, `Text` | `Checkbox`, `Radio`, `Slider`, `InkWell`, `Form`, `TextField` |
| Klasslar | bitta | **ikkita**: `StatefulWidget` va `State` |

**Holat** (state) — o'zgarishi mumkin bo'lgan qiymatlar: masalan, slayderning joriy qiymati yoki belgi qo'yilgan-qo'yilmagani.
FD: holat **`State`** obyektida saqlanadi. Shu bilan widget'ning holati uning ko'rinishidan ajratiladi.

### StatefulWidget qanday yoziladi

FD bo'yicha ikki klass kerak:

1. `StatefulWidget` dan meros olgan klass. U `createState()` ni qayta yozadi. Framework widget'ni qurmoqchi bo'lganda
   `createState()` ni chaqiradi.
2. `State<T>` dan meros olgan klass. O'zgaradigan holat va `build()` metodi shu klassda.

FD: `State` klass nomi odatda `_` bilan boshlanadi. `_` bilan boshlangan nom kutubxonaga xususiy bo'ladi (12-bob).

### `setState`

FD: holat o'zgarganda `State` obyekti **`setState()`** ni chaqiradi. Bu framework'ga widget'ni qayta chizish kerakligini
aytadi. FD (Widget fundamentals tutorial) ogohlantiradi: ma'lumotni `setState` siz o'zgartirsangiz, ichki ma'lumot o'zgaradi,
lekin Flutter ekranni qayta chizish kerakligini bilmaydi. Natijada foydalanuvchi o'zgarishni ko'rmaydi.

### Holatni kim boshqaradi

FD (Managing state) — uch keng tarqalgan yo'l:

- widget o'z holatini **o'zi** boshqaradi;
- holatni **ota** (parent) widget boshqaradi; bola bosilganini callback orqali aytadi;
- aralash yo'l.

FD tanlash mezoni:

- holat **foydalanuvchi ma'lumoti** bo'lsa (masalan, checkbox belgisi yoki slayder joyi) → ota boshqargani yaxshi;
- holat **estetik** bo'lsa (masalan, animatsiya) → widget o'zi boshqargani yaxshi;
- **ikkilansangiz — otadan boshlang.**

FD misoli: `IconButton` — stateless. Tugma bosilganini ota widget bilishi kerak, shuning uchun u holat saqlamaydi.

### `State` hayot sikli

API hujjati (State class) bo'yicha asosiy bosqichlar:

| Bosqich | Qachon (API) | Nima uchun |
| --- | --- | --- |
| `createState()` | framework `State` obyektini yaratadi | — |
| `initState()` | bir marta, `context` va `widget` tayyor bo'lgach | bir martalik boshlang'ich sozlash |
| `didChangeDependencies()` | `initState` dan keyin; bog'liq `InheritedWidget` o'zgarsa yana | `InheritedWidget` ga bog'liq sozlash |
| `build()` | istalgancha marta | UI tasviri |
| `didUpdateWidget(eski)` | ota widget'ni bir xil tur va `key` bilan qayta qursa | widget parametrlari o'zgarishiga javob (masalan, animatsiyani boshlash); undan keyin har doim `build` chaqiriladi |
| `deactivate()` | daraxtdan olib tashlansa | daraxtdagi boshqa elementlar bilan bog'lanishni uzish |
| `dispose()` | joriy kadr oxirigacha qayta qo'yilmasa | resurslarni bo'shatish (masalan, animatsiyani to'xtatish) |

API: `dispose` dan keyin `mounted` `false` bo'ladi va **`setState` chaqirish xato**. Bu bosqichdan qaytish yo'q.

## Ko'rib chiqamiz

13-bobdagi "Kitob do'koni" endi interaktiv. Unda ikki yo'l bor:

- **Ota boshqaradi:** savatdagi kitoblar soni `_BoshSahifaState` da turadi. `KitobKartasi` stateless, tugma bosilganini
  `onQosh` callback orqali aytadi.
- **Widget o'zi boshqaradi:** `Sevimli` yulduzchasi faqat o'zini o'zgartiradi. U `initState` va `dispose` ni ham ko'rsatadi.

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
      home: const BoshSahifa(),
    );
  }
}

/// 1) StatefulWidget — ikki klass: widget va uning State'i
class BoshSahifa extends StatefulWidget {
  const BoshSahifa({super.key});

  @override
  State<BoshSahifa> createState() => _BoshSahifaState();
}

class _BoshSahifaState extends State<BoshSahifa> {
  // O'zgaradigan holat State'da saqlanadi
  int _savatda = 0;

  void _savatgaQosh() {
    // setState — framework'ga "holat o'zgardi, qayta chiz" deydi
    setState(() {
      _savatda++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kitob do\'koni'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Text('Savatda: $_savatda', style: const TextStyle(fontSize: 16)),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // 2) Holatni ota boshqaradi: karta stateless, bosilganini callback bilan aytadi
            KitobKartasi(nom: 'Flutter asoslari', narx: 85000, onQosh: _savatgaQosh),
            KitobKartasi(nom: 'Dart tili', narx: 72000, onQosh: _savatgaQosh),
          ],
        ),
      ),
    );
  }
}

class KitobKartasi extends StatelessWidget {
  const KitobKartasi({
    super.key,
    required this.nom,
    required this.narx,
    required this.onQosh,
  });

  final String nom;
  final int narx;
  final VoidCallback onQosh;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        // 3) Holatni widget o'zi boshqaradi: yulduzcha faqat o'zini o'zgartiradi
        leading: const Sevimli(),
        title: Text(nom),
        subtitle: Text('$narx so\'m'),
        trailing: FilledButton(onPressed: onQosh, child: const Text('Savatga')),
      ),
    );
  }
}

class Sevimli extends StatefulWidget {
  const Sevimli({super.key});

  @override
  State<Sevimli> createState() => _SevimliState();
}

class _SevimliState extends State<Sevimli> {
  bool _tanlangan = false;

  @override
  void initState() {
    super.initState(); // bir martalik boshlang'ich sozlash
    debugPrint('Sevimli: initState');
  }

  @override
  void dispose() {
    debugPrint('Sevimli: dispose'); // resurslarni bo'shatish
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: Icon(_tanlangan ? Icons.star : Icons.star_border),
      color: Colors.amber.shade700,
      onPressed: () => setState(() => _tanlangan = !_tanlangan),
    );
  }
}
```

Testlar — tugma bosish va natijani tekshirish (`tester.tap`, keyin `tester.pump()` — yangi kadr):

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Savatga tugmasi hisoblagichni oshiradi', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    expect(find.text('Savatda: 0'), findsOneWidget);

    await tester.tap(find.text('Savatga').first);
    await tester.tap(find.text('Savatga').last);
    await tester.pump(); // setState'dan keyin yangi kadr
    expect(find.text('Savatda: 2'), findsOneWidget);
  });

  testWidgets('Yulduzcha faqat o\'z kartasida o\'zgaradi', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    await tester.tap(find.byIcon(Icons.star_border).first);
    await tester.pump();
    expect(find.byIcon(Icons.star), findsOneWidget);
    expect(find.byIcon(Icons.star_border), findsOneWidget);
  });

  testWidgets('Daraxtdan olib tashlansa — dispose', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    await tester.pumpWidget(const SizedBox());
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 33.3s)
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Savatga tugmasi hisoblagichni oshiradi
Sevimli: initState
Sevimli: initState
Sevimli: dispose
Sevimli: dispose
00:02 +1: Yulduzcha faqat o'z kartasida o'zgaradi
Sevimli: initState
Sevimli: initState
Sevimli: dispose
Sevimli: dispose
00:02 +2: Daraxtdan olib tashlansa — dispose
Sevimli: initState
Sevimli: initState
Sevimli: dispose
Sevimli: dispose
00:02 +3: All tests passed!
```

Natijada:

- ikki "Savatga" bosilgach, `AppBar` dagi matn `Savatda: 2` ga o'zgardi: `setState` → qayta `build`;
- yulduzcha bosilganda **faqat bitta** karta `star` ga o'tdi: har `Sevimli` ning o'z `State` obyekti bor;
- har test ikkita `Sevimli: initState` (har kartaga bittadan) va tugashida ikkita `dispose` chiqardi. Widget daraxtdan
  olib tashlanganda `State` yo'q qilinadi.

Brauzerda (`flutter build web`), bir kitob savatga qo'shilib, yulduzchasi bosilgandan keyin:

<img src="/rasmlar/flutter/14-savat.png" alt="Kitob do'koni: AppBar'da 'Savatda: 1', birinchi kartada to'ldirilgan yulduzcha" width="320">

## Tipik xatolar

`_savatgaQosh` dan `setState` olib tashlansa (`_savatda++;` o'zi qoladi), birinchi test shunday tushadi:

```text vps
$ flutter test --plain-name "Savatga tugmasi"
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Savatga tugmasi hisoblagichni oshiradi
Sevimli: initState
Sevimli: initState
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following TestFailure was thrown running a test:
Expected: exactly one matching candidate
  Actual: _TextWidgetFinder:<Found 0 widgets with text "Savatda: 2": []>
   Which: means none were found but one was expected
…
  
00:05 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/widget_test.dart: Savatga tugmasi hisoblagichni oshiradi
```

`_savatda` ichida 2 bo'ldi, lekin Flutter qayta chizishni bilmadi, shuning uchun ekranda `Savatda: 0` qoldi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Holatni `setState` siz o'zgartirish | Framework qayta chizishni bilmaydi (FD) | `setState(() { … })` ichida o'zgartiring |
| O'zgaradigan maydonni `StatelessWidget` ga qo'yish | Widget o'zgarmas, ota qayta qurganda yangi nusxa yaratiladi (FD tutorial: controller'lar har safar qayta yaratilib, fokus yo'qolgan) | Holatni `State` ga ko'chiring |
| `dispose` dan keyin `setState` (masalan, `await` dan keyin) | API: `dispose` dan keyin `setState` — xato | `if (!mounted) return;` tekshiring |
| `initState` da resurs ochib, `dispose` da yopmaslik | Resurs bo'shatilmaydi | `dispose` da bo'shating, `super.dispose()` ni chaqiring |
| Hamma holatni eng yuqoriga yoki hammasini pastga qo'yish | Holat egasi noto'g'ri tanlangan | FD mezoni: foydalanuvchi ma'lumoti — ota, estetik — widget o'zi |

## Amaliyot

1. `Text` stateless, `TextField` esa stateful. Nega?
2. StatefulWidget uchun nega ikki klass kerak?
3. `setState` chaqirilmasa nima bo'ladi?
4. Checkbox belgisini kim boshqargani yaxshi — checkbox'ning o'zimi yoki ota? Animatsiyani-chi?
5. `initState` va `dispose` da nima qilinadi?
6. Savatdagi sonni 0 ga qaytaradigan "Tozalash" tugmasini `AppBar` ga qo'shing.

<details>
<summary>Javoblar</summary>

1. `Text` hech qachon o'zgarmaydi; `TextField` foydalanuvchi yozganda o'zgaradi.
2. Widget o'zgarmas (yangilanishda qayta yaratiladi), holat esa saqlanib qolishi kerak. Holat alohida `State` obyektida turadi.
3. Ma'lumot o'zgaradi, lekin ekran qayta chizilmaydi — foydalanuvchi o'zgarishni ko'rmaydi.
4. Checkbox belgisi foydalanuvchi ma'lumoti — ota; animatsiya estetik — widget'ning o'zi (FD).
5. `initState` — bir martalik boshlang'ich sozlash; `dispose` — resurslarni bo'shatish.
6. `IconButton(icon: const Icon(Icons.delete), onPressed: () => setState(() => _savatda = 0))` ni `actions` ga.

</details>

## Rasmiy hujjat

- [FD: Add interactivity to your Flutter app](https://docs.flutter.dev/ui/interactivity)
- [FD: Stateful widgets (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/stateful-widget)
- [API: State class — lifecycle](https://api.flutter.dev/flutter/widgets/State-class.html)
- [API: State.setState](https://api.flutter.dev/flutter/widgets/State/setState.html)
