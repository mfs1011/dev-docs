# 28 — Holat: vaqtinchalik va ilova holati

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan (`flutter test`), skrinshotlar `flutter build web` natijasidan.

## Tushuncha

### Holat nima

FD (Ephemeral vs app state): keng ma'noda holat (state) — ilova ishlayotganda xotirada bor hamma narsa. Lekin ilovani
loyihalash uchun foydaliroq ta'rif: **istalgan paytda UI'ni qaytadan qurish uchun kerak bo'ladigan ma'lumot**. Masalan,
savatdagi kitoblar, tanlangan tab, maydonga yozilgan matn.

### Deklarativ fikrlash: UI = f(holat)

FD (Think declaratively): Flutter **deklarativ** — UI ilovaning joriy holatini aks ettirish uchun quriladi:

```text
UI = f(holat)
```

Bu yerda `UI` — ekrandagi ko'rinish, `f` — `build` metodlaringiz, `holat` — ilova holati.

Holat o'zgarganda (masalan, foydalanuvchi sozlamada kalitni bosdi) siz **holatni** o'zgartirasiz — bu UI'ni qayta chizishga
olib keladi. UI'ning o'zini buyruq bilan o'zgartirish yo'q (masalan, `widget.setText` kabi) — holat o'zgaradi, UI noldan
qayta quriladi. FD: Flutter bunga yetarlicha tez, kerak bo'lsa har kadrda ham.

Natijada UI'ning har qanday holati uchun **bitta kod yo'li** bor: "shu holatda UI qanday ko'rinadi" — bir marta yoziladi.
FD: boshida bu imperativ uslubdek tabiiy tuyulmasligi mumkin.

| Imperativ (buyruq bilan) | Deklarativ (Flutter) |
| --- | --- |
| `matn.setText('Savat (1)')` — mavjud UI obyektini o'zgartirish | `setState(() => _savat.add(nom))` — holatni o'zgartirish |
| Har o'zgarish uchun alohida kod: qo'shildi, o'chirildi, tozalandi | `Text('Savat (${_savat.length})')` — har qanday holat uchun bitta |

### Ikki xil holat

FD ikkiga ajratadi:

| | Vaqtinchalik holat (ephemeral) | Ilova holati (app state) |
| --- | --- | --- |
| Boshqa nomi | UI holati, mahalliy holat (local) | umumiy holat (shared) |
| Ta'rif | Bitta widget ichiga bemalol sig'adi | Ilovaning ko'p joyiga kerak, foydalanuvchi sessiyalari orasida ham saqlanishi mumkin |
| FD misollari | `PageView` dagi joriy sahifa, murakkab animatsiyaning joriy holati, `BottomNavigationBar` da tanlangan tab | foydalanuvchi sozlamalari, kirish (login) ma'lumoti, ijtimoiy tarmoqdagi bildirishnomalar, do'kondagi savat, yangilikning o'qilgan/o'qilmaganligi |
| Qanday | `State` + `setState()` — boshqa joyga kerak emas | `setState` ham bo'ladi; ko'p joyga kerak bo'lsa — 29-bobdagi usullar |

FD: vaqtinchalik holat uchun boshqa hech qanday holat boshqaruv usuli kerak emas — `State` ichidagi maydon va `setState()`
bu yerda "butunlay tabiiy".

**Aniq qoida yo'q.** FD: ilovaning hamma holatini `State` va `setState()` bilan boshqarish *mumkin*. O'zgaruvchi
vaqtinchalikmi yoki ilova holatimi — universal qoida yo'q; ba'zan biridan ikkinchisiga o'tkazishga to'g'ri keladi.
Masalan, tanlangan tabni klassdan tashqaridan o'zgartirish yoki sessiyalar orasida saqlash kerak bo'lsa — u ilova holatiga
aylanadi.

FD'dagi oddiy sxema (u ham "qattiq qoida emas"):

```text
Ma'lumot → Kimga kerak?
  ├─ ko'p widget'larga  → ilova holati
  ├─ ba'zi widget'larga → ilova holati
  └─ bitta widget'ga    → vaqtinchalik holat
```

FD Redux muallifi Dan Abramovning gapini keltiradi: "Qaysi biri kamroq noqulay bo'lsa, shuni qiling" ("Do whatever is
less awkward").

### Holat qayerda turadi

Ilova holati unga muhtoj widget'lardan **yuqorida** — ularning umumiy ajdodida turadi. Bolalarga konstruktor orqali
qiymat (savat) va o'zgartirish uchun funksiya (`savatgaQosh`) beriladi. Bola holatni o'zi o'zgartirmaydi — funksiyani
chaqiradi, holat egasi `setState` qiladi va pastga yangi qiymat ketadi.

FD: ilova qayta ishga tushganda (restart) holat nega yo'qolishi va uni qanday tiklash — alohida mavzu (Restore state on
Android / iOS sahifalari).

## Ko'rib chiqamiz

Kitob do'koni:

| Holat | Qayerda | Turi | Nega |
| --- | --- | --- | --- |
| Savat (`_savat`) | `BoshSahifa` | ilova holati | bosh sahifa (son va belgi), kitob sahifasi (qo'shish) va savat sahifasiga kerak |
| "Batafsil" kaliti (`_ochiq`) | `KitobSahifasi` | vaqtinchalik | faqat shu ekranga kerak |

`lib/main.dart`:

```dart
import 'package:material_ui/material_ui.dart';

const kitoblar = ['Dart tili', 'Flutter asoslari', 'Toza kod'];

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

class BoshSahifa extends StatefulWidget {
  const BoshSahifa({super.key});

  @override
  State<BoshSahifa> createState() => _BoshSahifaState();
}

class _BoshSahifaState extends State<BoshSahifa> {
  // Ilova holati: savat — bir nechta ekranga kerak
  final List<String> _savat = [];

  void _savatgaQosh(String nom) {
    setState(() => _savat.add(nom));
  }

  @override
  Widget build(BuildContext context) {
    // UI = f(holat): savat o'zgarsa, shu build qayta ishlaydi
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kitob do\'koni'),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.shopping_cart),
            label: Text('Savat (${_savat.length})'),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => SavatSahifasi(savat: List.of(_savat))),
            ),
          ),
        ],
      ),
      body: ListView(
        children: [
          for (final nom in kitoblar)
            ListTile(
              title: Text(nom),
              trailing: _savat.contains(nom) ? const Icon(Icons.check, color: Colors.green) : null,
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => KitobSahifasi(nom: nom, savatgaQosh: _savatgaQosh),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class KitobSahifasi extends StatefulWidget {
  const KitobSahifasi({super.key, required this.nom, required this.savatgaQosh});

  final String nom;
  final ValueChanged<String> savatgaQosh;

  @override
  State<KitobSahifasi> createState() => _KitobSahifasiState();
}

class _KitobSahifasiState extends State<KitobSahifasi> {
  // Vaqtinchalik holat: faqat shu ekranga kerak
  bool _ochiq = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.nom)),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SwitchListTile(
            title: const Text('Batafsil'),
            value: _ochiq,
            onChanged: (v) => setState(() => _ochiq = v),
          ),
          if (_ochiq) const Padding(padding: EdgeInsets.all(16), child: Text('Muqova: qattiq. 320 bet.')),
          Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton(
              onPressed: () {
                widget.savatgaQosh(widget.nom);
                Navigator.pop(context);
              },
              child: const Text('Savatga qo\'shish'),
            ),
          ),
        ],
      ),
    );
  }
}

class SavatSahifasi extends StatelessWidget {
  const SavatSahifasi({super.key, required this.savat});

  final List<String> savat;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Savat')),
      body: savat.isEmpty
          ? const Center(child: Text('Savat bo\'sh'))
          : ListView(children: [for (final nom in savat) ListTile(title: Text(nom))]),
    );
  }
}
```

Muhim joylar:

- **Savat bosh sahifada.** `KitobSahifasi` savatni bilmaydi — faqat `savatgaQosh` funksiyasini oladi. Chaqirilganda
  `_BoshSahifaState` da `setState` ishlaydi va bosh sahifa yangi holat bilan qayta quriladi: son ham, belgi ham.
- **`SavatSahifasi(savat: List.of(_savat))`** — savatning nusxasi: savat sahifasi faqat ko'rsatadi.
- **"Batafsil" kaliti `KitobSahifasi` ichida.** Sahifa yopilsa, `State` ham yo'q bo'ladi — keyingi safar yana `false`.

Bu usulning chegarasi ham ko'rinib turibdi: savat qancha ko'p ekranga kerak bo'lsa, shuncha ko'p konstruktordan qiymat va
funksiya o'tkazish kerak. Savat chuqurroq widget'ga kerak bo'lsa — oradagi har bir widget orqali. 29-bob shu muammoni
`ChangeNotifier` va `provider` bilan hal qiladi.

`test/widget_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Vaqtinchalik va ilova holati', (tester) async {
    await tester.pumpWidget(const DokonApp());
    debugPrint('boshida: ${find.textContaining('Savat (').evaluate().map((e) => (e.widget as Text).data).single}');

    // 1. Kitob sahifasi: "Batafsil"ni yoqamiz va savatga qo'shamiz
    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Batafsil'));
    await tester.pump();
    debugPrint('Toza kod: Batafsil = ${tester.widget<SwitchListTile>(find.byType(SwitchListTile)).value}');
    await tester.tap(find.text('Savatga qo\'shish'));
    await tester.pumpAndSettle();
    expect(find.text('Savat (1)'), findsOneWidget);
    expect(find.byIcon(Icons.check), findsOneWidget);
    debugPrint('orqaga: Savat (1), Toza kod yonida belgi');

    // 2. Shu kitobni qayta ochamiz
    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    debugPrint('qayta ochildi: Batafsil = ${tester.widget<SwitchListTile>(find.byType(SwitchListTile)).value}');
    await tester.pageBack();
    await tester.pumpAndSettle();

    // 3. Savat sahifasi
    await tester.tap(find.text('Savat (1)'));
    await tester.pumpAndSettle();
    expect(find.text('Toza kod'), findsOneWidget);
    debugPrint('Savat sahifasida: Toza kod');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 5.0s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Vaqtinchalik va ilova holati
boshida: Savat (0)
Toza kod: Batafsil = true
orqaga: Savat (1), Toza kod yonida belgi
qayta ochildi: Batafsil = false
Savat sahifasida: Toza kod
00:04 +1: All tests passed!
```

Natijada:

- **Ilova holati saqlandi:** kitob sahifasi yopilgandan keyin ham savatda "Toza kod" bor — bosh sahifada son, belgi va
  savat sahifasida ko'rinadi.
- **Vaqtinchalik holat yo'qoldi:** "Batafsil" yoqilgan edi (`true`), sahifa qayta ochilganda — `false`. Bu xato emas: u
  faqat o'sha ekranga tegishli edi.

### Brauzerda

Chapda — "Toza kod" sahifasi, "Batafsil" yoqilgan; o'ngda — savatga qo'shib qaytgandan keyingi bosh sahifa:

<img src="/rasmlar/flutter/28-kitob.png" alt="Toza kod sahifasi: Batafsil kaliti yoqilgan, Muqova: qattiq. 320 bet., Savatga qo'shish tugmasi" width="300"> <img src="/rasmlar/flutter/28-bosh.png" alt="Kitob do'koni: tepada Savat (1), Toza kod yonida yashil belgi" width="300">

## Tipik xatolar

`test/xato_test.dart` — uch xato va uchinchisining to'g'ri varianti:

```dart
// 1. setState siz o'zgartirish
class _SetStateYoqState extends State<SetStateYoq> {
  final List<String> _savat = [];

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => _savat.add('Toza kod'), // setState yo'q
      child: Text('Savat (${_savat.length})'),
    );
  }
}

// 2. Holat build ichida — har qurilishda yangidan
class _BuildIchidaState extends State<BuildIchida> {
  @override
  Widget build(BuildContext context) {
    var soni = 0; // xato joy
    return TextButton(
      onPressed: () => setState(() => soni++),
      child: Text('Bosildi: $soni'),
    );
  }
}

// 3. Sahifa yopilgandan keyin setState
class _KechikkanState extends State<Kechikkan> {
  String _narx = '...';

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      setState(() => _narx = '50 000 so\'m'); // mounted tekshirilmagan
    });
  }

  @override
  Widget build(BuildContext context) => Text('Narx: $_narx');
}

// 3 ning to'g'risi: mounted tekshiriladi
class _MountedBilanState extends State<MountedBilan> {
  String _narx = '...';

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      if (!mounted) return; // sahifa yopilgan bo'lsa — hech narsa qilmaymiz
      setState(() => _narx = '50 000 so\'m');
    });
  }

  @override
  Widget build(BuildContext context) => Text('Narx: $_narx');
}
```

Testlar: tugmani bosib ekrandagi matnni o'qiydi; 3 va 4-da widget daraxtdan olib tashlanadi va 2 soniya o'tkaziladi.

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: setState siz
bosgandan keyin ekranda: Savat (0)
00:02 +1: build ichidagi o'zgaruvchi
3 marta bosildi, ekranda: Bosildi: 0
00:02 +2: dispose dan keyin setState
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following assertion was thrown running a test:
setState() called after dispose(): _KechikkanState#82655(lifecycle state: defunct, not mounted)
This error happens if you call setState() on a State object for a widget that no longer appears in
the widget tree (e.g., whose parent widget no longer includes the widget in its build). This error
can occur when code calls setState() from a timer, from an animation callback, or after an
asynchronous operation (such as an awaited network request or other Future) completes after the
widget has been removed from the tree.
The preferred solution is to cancel the timer or stop listening to the animation in the dispose()
callback. Another solution is to check the "mounted" property of this object before calling
setState() to ensure the object is still in the tree.
...
00:02 +2 -1: mounted bilan
mounted bilan: xato yo'q
00:03 +3 -1: Some tests failed.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Ro'yxatga qo'shildi, ekranda `Savat (0)` | `setState` yo'q — Flutter holat o'zgarganini bilmaydi, `build` qayta ishlamaydi | O'zgartirishni `setState(() { ... })` ichida qiling |
| 3 marta bosildi, ekranda `Bosildi: 0` | O'zgaruvchi `build` ichida — har qurilishda yana 0 | Holat — `State` klassining maydoni |
| `setState() called after dispose()` | Kechikkan ish (taymer, so'rov) tugaganda sahifa allaqachon yopilgan | `if (!mounted) return;` yoki taymerni `dispose()` da bekor qilish (xato matni ikkalasini aytadi) |
| Savat sahifa yopilganda yo'qoladi | Ilova holati shu sahifaning `State` ida | Unga muhtoj widget'lardan yuqoriga ko'taring |
| Hamma narsa bitta yuqori `State` da, oddiy kalit uchun ham | Har o'zgarishda katta qism qayta quriladi, kod chalkashadi | Faqat bitta widget'ga kerak bo'lsa — o'sha widget'da (FD) |

## Amaliyot

1. FD bo'yicha holatning foydali ta'rifi qanday?
2. `UI = f(holat)` formulasida `f` nima? Holat o'zgarganda nima bo'ladi?
3. Vaqtinchalik va ilova holatiga FD'dan ikkitadan misol keltiring.
4. Qachon tanlangan tab ilova holatiga aylanadi?
5. Nega `KitobSahifasi` savatning o'zini emas, `savatgaQosh` funksiyasini oladi?
6. `setState() called after dispose()` xatosini qanday tuzatish mumkin?
7. Savat sahifasida har kitob yonida "O'chirish" tugmasi bo'lsin va u bosh sahifadagi savatdan ham o'chirsin. Qaysi
   holat qayerda turadi va `SavatSahifasi` ga nima beriladi? Bosh sahifadagi son qanday yangilanadi?

<details>
<summary>Javoblar</summary>

1. Istalgan paytda UI'ni qayta qurish uchun kerak bo'ladigan ma'lumot.
2. `f` — `build` metodlari. Holatni o'zgartirasiz (`setState`), Flutter UI'ni yangi holat bo'yicha qayta quradi; UI'ni
   buyruq bilan o'zgartirish yo'q.
3. Vaqtinchalik: `PageView` sahifasi, `BottomNavigationBar` dagi tab. Ilova holati: savat, login ma'lumoti (yoki sozlamalar,
   bildirishnomalar).
4. Uni klassdan tashqaridan o'zgartirish yoki sessiyalar orasida saqlash kerak bo'lsa (FD).
5. Savatning egasi — `BoshSahifa`. Bola holatni o'zgartirmaydi, egasiga "qo'sh" deb aytadi; `setState` egasida bo'lgani
   uchun bosh sahifa qayta quriladi.
6. Kechikkan ishda `if (!mounted) return;` (testda `mounted bilan: xato yo'q`), yoki taymer/obunani `dispose()` da bekor
   qilish.
7. Savat — baribir `BoshSahifa` da. `SavatSahifasi` `StatefulWidget` bo'ladi va `savat` nusxasi bilan `savatdanOchir`
   funksiyasini oladi; tugma bosilganda funksiyani chaqiradi va o'zining nusxasidan ham olib tashlab, o'z `setState` ini
   qiladi. Bosh sahifadagi `_savatdanOchir` `setState(() => _savat.remove(nom))` qiladi — orqaga qaytganda son kamaygan
   bo'ladi. Ikki joyda bir xil narsani yangilash noqulay — 29-bobdagi `ChangeNotifier` buni bitta joyga yig'adi. VPS'dagi
   testda: ikki kitob qo'shildi (`Savat (2)`), savat sahifasida bittasi o'chirildi, orqaga qaytilgach — `Savat (1)`.

</details>

## Rasmiy hujjat

- [FD: State management — introduction](https://docs.flutter.dev/data-and-backend/state-mgmt/intro)
- [FD: Think declaratively](https://docs.flutter.dev/data-and-backend/state-mgmt/declarative)
- [FD: Differentiate between ephemeral state and app state](https://docs.flutter.dev/data-and-backend/state-mgmt/ephemeral-vs-app)
- [API: State.setState](https://api.flutter.dev/flutter/widgets/State/setState.html) · [State.mounted](https://api.flutter.dev/flutter/widgets/State/mounted.html)
