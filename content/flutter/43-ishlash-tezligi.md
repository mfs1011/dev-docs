# 43 — Ishlash tezligi

[Mundarija](README.md)

> Qayta qurilishlar soni va ro'yxat o'lchovlari VPS'da Flutter 3.50.0 bilan `flutter test` da; build hajmlari — `flutter
> build web` (release va profile). ⚑ Unumdorlik qatlami (performance overlay), DevTools va Android/iOS ilova hajmi haqiqiy
> qurilma talab qiladi — ular hujjat asosida yozilgan, sinalmagan.

## Tushuncha

### 16 millisekund

FD (Performance best practices, Flutter performance profiling): Flutter soniyasiga 60 kadr (fps), qo'llaydigan qurilmada 120
kadr chizishga intiladi. 60 fps uchun har kadr **~16 ms** da chizilishi kerak. Qurish (build) va chizish (rasterlash) alohida
oqimlarda: 60 Hz ekranda qurish uchun 16 ms va chizish uchun 16 ms. Kechikish muhim bo'lsa — jami 16 ms (8 + 8). Kadr uzoq
cho'zilsa, u tashlab yuboriladi — animatsiyada ko'rinadigan **qotish** (jank).

FD: profile rejimida kadrlar 16 ms dan ancha tez chizilsa, ba'zi "yomon odatlar" bo'lsa ham xavotirga o'rin yo'q — lekin
iloji boricha tez qilishga intiling.

### Qayerda o'lchash

FD (Flutter performance profiling):

- Deyarli hamma unumdorlik tekshiruvi **haqiqiy qurilmada**, **profile** rejimida (`flutter run --profile`). Debug rejimidagi
  qo'shimcha tekshiruvlar (`assert` va boshqalar) qimmat; emulyator va simulyator real unumdorlikni ko'rsatmaydi — profile
  rejimi ularda o'chirilgan.
- Foydalanuvchilaringizning eng sekin qurilmasida tekshiring.
- ⚑ **Unumdorlik qatlami** (performance overlay) — DevTools'dagi Performance bo'limidan yoki `flutter run` da **P** tugmasi.
  Ikki grafik: yuqorida — rasterlash oqimi, pastda — UI oqimi. 16 ms dan oshgan kadr — qizil chiziq. UI grafigida qizil — Dart
  kodi qimmat; rasterlashda qizil — sahna murakkab (ko'pincha keraksiz `saveLayer`, ustma-ust shaffoflik, kesish yoki soya).
  Ikkalasi qizil bo'lsa — avval UI oqimi.

### Rejimlar

| | Debug | Profile | Release |
| --- | --- | --- | --- |
| Maqsad | ishlab chiqish, hot reload | unumdorlikni o'lchash | foydalanuvchiga |
| `assert` | bor | yo'q | yo'q |
| Debug/kuzatish | to'liq | tracing va DevTools ulanadi, unumdorlik qatlami | yo'q |
| Emulyatorda | ha | **yo'q** | mobilda — yo'q |
| Buyruq | `flutter run` | `flutter run --profile` | `flutter run --release` |

### `build()` narxini nazorat qilish

FD (Performance best practices):

- `build()` ichida takroriy va qimmat ish qilmang — u ota widget qayta qurilganda tez-tez chaqiriladi (30-bobdagi "so'rov
  `build` da" xatosi ham shundan).
- Katta widget'ni kichiklarga bo'ling — qanday o'zgarishiga qarab.
- `setState()` — barcha avlodlarni qayta quradi. Uni o'zgarish bo'ladigan **kichik qismga** joylang, daraxt tepasida emas.
- Qayta ishlatiladigan UI uchun funksiya emas, `StatelessWidget`.

API (StatelessWidget — Performance considerations): imkon qadar **`const` widget'lar**, widget'ingizga `const` konstruktor
bering — shunda Flutter qayta qurishning ko'p qismini o'tkazib yuboradi.

### Boshqa tavsiyalar (FD)

- **Ro'yxat va to'r** — katta bo'lsa `ListView.builder` / `GridView.builder`: faqat ko'rinadigan qism quriladi. Ko'p qismi
  ekranda ko'rinmaydigan bolalar ro'yxatini `Column()` yoki `ListView()` ga to'g'ridan-to'g'ri bermang.
- **`Opacity`** — faqat kerak bo'lganda; oddiy shakl yoki matn uchun yarim shaffof rang tezroq. **Kesish** (clip) `saveLayer`
  chaqirmaydi, lekin baribir qimmat; yumaloq burchak uchun `borderRadius`.
- **`saveLayer()`** — siz chaqirmasangiz ham ba'zi widget'lar ichida chaqiradi; ortiqchasi — qotish.
- **Ichki (intrinsic) o'lchov** — ikkinchi layout o'tishini talab qiladi va sekinlashtiradi; hujayralarga oldindan o'lcham bering.
- Og'ir hisob — alohida isolate'da (31-bob, `compute`).

### Ilova hajmi

FD (Measuring your app's size):

- `flutter run` dagi **debug** build katta — hot reload va debug uchun qo'shimchalar; foydalanuvchi yuklab oladigan hajmni
  ko'rsatmaydi.
- ⚑ Taqsimot: `flutter build apk --analyze-size` (shuningdek `appbundle`, `ios`, `linux`, `macos`, `windows`) — terminalda qisqa
  hisobot va DevTools uchun `*-code-size-analysis_*.json`. Haqiqiy yuklab olish hajmi — Play Console / App Store Connect'da.
- Kamaytirish: release build'da `--split-debug-info` (FD: kod hajmini "keskin" kamaytirishi mumkin); ishlatilmagan
  resurslarni olib tashlash; kutubxonalardan kamroq resurs; PNG/JPEG siqish. Kompilyator nishon platformada erishib bo'lmaydigan
  kodni (masalan, `if (Platform.isWindows)` ichini Android build'da) olib tashlaydi.

## Ko'rib chiqamiz

### Qayta qurilishlar: `setState` qayerda va `const`

`lib/olchov.dart` — har qurilganda hisoblagichni oshiradigan "og'ir" widget va ikki xil tuzilma:

```dart
import 'package:material_ui/material_ui.dart';

/// Har qurilganda hisoblagichni oshiradigan "og'ir" widget
class OgirWidget extends StatelessWidget {
  const OgirWidget({super.key});

  static int qurildi = 0;

  @override
  Widget build(BuildContext context) {
    qurildi++;
    return const SizedBox(height: 20);
  }
}

/// 1-variant: setState butun sahifada
class YuqoridaSetState extends StatefulWidget {
  const YuqoridaSetState({super.key, required this.constBilan});

  final bool constBilan;

  @override
  State<YuqoridaSetState> createState() => _YuqoridaSetStateState();
}

class _YuqoridaSetStateState extends State<YuqoridaSetState> {
  int _son = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      // ignore: prefer_const_constructors
      widget.constBilan ? const OgirWidget() : OgirWidget(),
      TextButton(onPressed: () => setState(() => _son++), child: Text('Bosildi: $_son')),
    ]);
  }
}

/// 2-variant: setState faqat o'zgaradigan kichik qismda
class PastdaSetState extends StatelessWidget {
  const PastdaSetState({super.key});

  @override
  Widget build(BuildContext context) {
    // ignore: prefer_const_constructors
    return Column(children: [OgirWidget(), const Hisoblagich()]);
  }
}

class Hisoblagich extends StatefulWidget {
  const Hisoblagich({super.key});

  @override
  State<Hisoblagich> createState() => _HisoblagichState();
}

class _HisoblagichState extends State<Hisoblagich> {
  int _son = 0;

  @override
  Widget build(BuildContext context) =>
      TextButton(onPressed: () => setState(() => _son++), child: Text('Bosildi: $_son'));
}
```

`test/olchov_test.dart` — tugmani 3 marta bosib, og'ir widget necha marta qayta qurilganini sanaydi; keyin 10 000 elementli ro'yxat:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/olchov.dart';

Future<int> uchMartaBos(WidgetTester tester, Widget w) async {
  await tester.pumpWidget(MaterialApp(home: Material(child: w)));
  OgirWidget.qurildi = 0;
  for (var i = 0; i < 3; i++) {
    await tester.tap(find.byType(TextButton));
    await tester.pump();
  }
  return OgirWidget.qurildi;
}

void main() {
  testWidgets('setState qayerda va const', (tester) async {
    debugPrint('setState yuqorida, const yo\'q: ${await uchMartaBos(tester, const YuqoridaSetState(constBilan: false))} marta');
    debugPrint('setState yuqorida, const bor:  ${await uchMartaBos(tester, const YuqoridaSetState(constBilan: true))} marta');
    debugPrint('setState pastda (alohida widget): ${await uchMartaBos(tester, const PastdaSetState())} marta');
  });

  testWidgets('ListView va ListView.builder: 10 000 element', (tester) async {
    var yaratildi = 0;
    Widget element(int i) {
      yaratildi++;
      return ListTile(title: Text('Kitob $i'));
    }

    final s = Stopwatch()..start();
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ListView(children: [for (var i = 0; i < 10000; i++) element(i)]))));
    debugPrint('ListView(children): $yaratildi ta yaratildi, ${find.byType(ListTile).evaluate().length} ta qurildi, ${s.elapsedMilliseconds} ms');

    yaratildi = 0;
    s.reset();
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ListView.builder(itemCount: 10000, itemBuilder: (_, i) => element(i)))));
    debugPrint('ListView.builder:   $yaratildi ta yaratildi, ${find.byType(ListTile).evaluate().length} ta qurildi, ${s.elapsedMilliseconds} ms');
  });
}
```

```text vps
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/olchov_test.dart
00:00 +0: setState qayerda va const
setState yuqorida, const yo'q: 3 marta
setState yuqorida, const bor:  0 marta
setState pastda (alohida widget): 0 marta
00:01 +1: ListView va ListView.builder: 10 000 element
ListView(children): 10000 ta yaratildi, 11 ta qurildi, 471 ms
ListView.builder:   16 ta yaratildi, 11 ta qurildi, 104 ms
00:02 +2: All tests passed!
```

- **`setState` yuqorida, `const` yo'q** — har bosishda og'ir widget ham qayta qurildi (3 marta), garchi u o'zgarmasa ham.
- **`const OgirWidget()`** — 0 marta: o'sha bir xil (const) nusxa, Flutter uni qayta qurmaydi.
- **`setState` alohida `Hisoblagich` da** — `const` siz ham 0 marta: qayta qurish faqat o'zgaradigan qismda.
- **`ListView(children: [...])`** — 10 000 ta `ListTile` obyekti yaratildi (qurilgani baribir 11 ta — ko'rinadiganlari);
  **`ListView.builder`** — atigi 16 ta yaratildi. Vaqt (471 va 104 ms) — debug rejimidagi test, faqat nisbiy taqqoslash uchun.

### Build hajmi: release va profile

42-bobdagi ilovaning web build'lari:

```text vps
$ flutter build web --profile
...
$ ls -la ../web42_release/main.dart.js build/web/main.dart.js
-rw-rw-r-- 1 dasturchi dasturchi 2112483 Nov 18 14:36 ../web42_release/main.dart.js
-rw-rw-r-- 1 dasturchi dasturchi 6463280 Nov 18 14:47 build/web/main.dart.js
$ gzip -c build/web/main.dart.js | wc -c                 # profile, siqilgan
1073828
$ gzip -c ../web42_release/main.dart.js | wc -c          # release, siqilgan
626291
$ grep -c BuzuqWidget build/web/main.dart.js ../web42_release/main.dart.js
build/web/main.dart.js:7
../web42_release/main.dart.js:1
```

| | Release | Profile |
| --- | --- | --- |
| `main.dart.js` | 2,1 MB | 6,5 MB |
| gzip bilan (tarmoq orqali) | 0,63 MB | 1,07 MB |
| `BuzuqWidget` nomi | 1 marta (faqat xato matnida) | 7 marta (klass nomlari saqlangan) |

Profile build o'lchash uchun nomlar va kuzatish kodini saqlaydi — 3 baravar katta. Foydalanuvchiga faqat release.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri |
| --- | --- | --- |
| Debug rejimida "sekin" deb xulosa | Debug'dagi tekshiruvlar qimmat (FD) | Profile rejimida, haqiqiy qurilmada o'lchang |
| Emulyatorda o'lchash | Real unumdorlikni ko'rsatmaydi, profile u yerda o'chiq (FD) | Haqiqiy, imkon qadar sekin qurilma |
| `setState` butun sahifada, o'zgarish bitta matnda | Butun daraxt qayta quriladi (testda 3 marta keraksiz) | O'zgaradigan qismni alohida widget qiling |
| `const` qo'yilmagan | O'zgarmas widget ham qayta quriladi | `const` konstruktor va `const` chaqiruv (API) |
| Minglab elementni `ListView(children: ...)` ga | Hammasi oldindan yaratiladi (10 000 ta) | `ListView.builder` (FD) |
| `build` ichida so'rov, saralash, JSON o'qish | Har qayta qurilishda takrorlanadi | `initState` yoki holat klassida bir marta (FD) |
| Matnga `Opacity` | `saveLayer` — qimmat | Yarim shaffof rang (FD) |
| Profile yoki debug build'ni chiqarish | Katta (bizda 3 baravar), sekinroq | Faqat release |

## Amaliyot

1. 60 fps uchun bitta kadrga qancha vaqt bor? Qurish va chizish qanday bo'linadi?
2. Nega unumdorlikni debug rejimida yoki emulyatorda o'lchash noto'g'ri?
3. Unumdorlik qatlamida UI grafigi qizil bo'lsa, muammo qayerda? Rasterlash grafigi qizil bo'lsa-chi?
4. `const` widget nima uchun tezroq? Testda nechta qayta qurilish bo'ldi?
5. Nega `setState` ni daraxtning kichik qismiga joylash kerak?
6. Release va profile web build'ining hajmi nega farq qiladi?
7. 10 000 elementli `ListView.builder` ni oxirigacha aylantirsangiz, jami nechta element yaratiladi va bir paytda nechtasi
   quriladi?

<details>
<summary>Javoblar</summary>

1. ~16 ms; 60 Hz da qurish ham, chizish ham har biri 16 ms ichida (kechikish muhim bo'lsa jami 16 ms: 8 + 8).
2. Debug'da qimmat tekshiruvlar; emulyator real qurilmani aks ettirmaydi va profile rejimi u yerda o'chiq.
3. UI — Dart kodi qimmat; rasterlash — sahna murakkab (`saveLayer`, shaffoflik, kesish, soya). Ikkalasi bo'lsa — avval UI.
4. Bir xil `const` nusxa — Flutter uni qayta qurmaydi. Testda: 0 (`const` siz — 3).
5. `setState` barcha avlodlarni qayta quradi; kichik qismda bo'lsa, faqat o'sha qism (testda 0).
6. Profile o'lchash uchun nomlar va kuzatish kodini saqlaydi, release esa kichraytiradi (minify) va ishlatilmagan kodni
   olib tashlaydi: 6,5 MB va 2,1 MB.
7. Aylantirish davomida hamma 10 000 tasi navbat bilan yaratiladi, lekin bir paytda faqat ko'rinadiganlari quriladi. VPS'dagi
   testda (`scrollUntilVisible(..., 5000, maxScrolls: 1000)`): `oxirgisi ko'rindi: 10000 ta yaratildi, hozir 11 ta qurilgan`.
   `maxScrolls` siz (standart 50 marta × 5000 px) oxirigacha yetmay test yiqildi.

</details>

## Rasmiy hujjat

- [FD: Performance best practices](https://docs.flutter.dev/perf/best-practices)
- [FD: Flutter performance profiling](https://docs.flutter.dev/perf/ui-performance)
- [FD: Flutter's build modes](https://docs.flutter.dev/testing/build-modes)
- [FD: Measuring your app's size](https://docs.flutter.dev/perf/app-size)
- [API: StatelessWidget — Performance considerations](https://api.flutter.dev/flutter/widgets/StatelessWidget-class.html)
