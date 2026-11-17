# 20 — Material, Cupertino va mavzu

[Mundarija](README.md)

## Tushuncha

### Ikki dizayn tizimi

13-bobda ko'rganimizdek, Flutter'da tayyor widget'lar ikki paketda:

| | Material | Cupertino |
| --- | --- | --- |
| Nima | Google'ning ochiq dizayn tizimi (FD: Material Design) | Apple'ning iOS dizayn tili (FD: Cupertino) |
| Paket | `material_ui` | `cupertino_ui` |
| Ko'rinishi | Material 3 | yumaloq burchaklar, minimal dizayn, iOS'dagi harakat va animatsiyalar |

FD (Cupertino design): Cupertino ilgari Flutter SDK ichida edi, endi **framework'dan ajratilgan** — `cupertino_ui` paketi
pub.dev'dan olinadi. `flutter create` loyihaga faqat `material_ui` ni qo'shadi, Cupertino kerak bo'lsa:

```text vps
$ flutter pub add cupertino_ui
Resolving dependencies...
Downloading packages...
  cupertino_icons 1.0.9 (2.0.0 available)
  cupertino_ui 1.1.6 (from transitive dependency to direct dependency)
  material_color_utilities 0.13.0 (0.13.1 available)
  test_api 0.7.14 (0.7.15 available)
  vector_math 2.4.3 (2.4.4 available)
Changed 1 dependency!
4 packages have newer versions incompatible with dependency constraints.
Try `flutter pub outdated` for more information.
```

"from transitive dependency to direct dependency" — paket loyihada allaqachon bor edi (`material_ui` orqali bilvosita),
endi to'g'ridan-to'g'ri bog'liqlik (dependency) bo'ldi va uni `import` qilish mumkin.

Ikkalasini bitta ekranda aralashtirib ishlatish mumkin: `MaterialApp` ichida `CupertinoButton` ham ishlaydi (pastdagi
misol).

### Mavzu (theme)

FD (Use themes to share colors and font styles): ranglar va shrift uslublarini butun ilovada bir xil qilish uchun
**mavzu** (theme) ishlatiladi. Mavzu `ThemeData` obyektida yoziladi va `MaterialApp(theme: …)` ga beriladi. Berilmasa,
Flutter standart mavzuni o'zi yaratadi.

`ThemeData` da ko'pincha ikki xususiyat beriladi (FD):

| Xususiyat | Nima |
| --- | --- |
| `colorScheme` | ranglar (ranglar sxemasi) |
| `textTheme` | matn uslublari: sarlavha, asosiy matn va hokazo |

**`ColorScheme.fromSeed`** (API): bitta **urug'** (seed) rangdan Material 3 rang tizimi bo'yicha butun sxema yasaladi:
`primary`, `onPrimary`, `primaryContainer`, `surface` … Bu ranglar bir-biriga mos va kirish qulayligi (accessibility) bo'yicha
kontrast talablariga javob beradigan qilib tanlanadi. API: algoritm tufayli urug' rangning o'zi sxemada **chiqmasligi
mumkin**.

`on…` ranglar — shu fon ustidagi matn yoki belgi rangi: `primary` fonda `onPrimary` matn, `primaryContainer` fonda
`onPrimaryContainer` matn.

### Mavzudan foydalanish: `Theme.of(context)`

FD: `Theme.of(context)` widget daraxtida yuqoriga qarab **eng yaqin `Theme`** ni topadi. Alohida `Theme` widget bo'lmasa —
ilovaning mavzusi. API: mavzu o'zgarsa, `Theme.of` ishlatgan widget avtomatik qayta quriladi.

```dart
Container(
  color: Theme.of(context).colorScheme.primaryContainer,
  child: Text('…', style: Theme.of(context).textTheme.titleMedium),
)
```

Qisqa yozuv (API): `ColorScheme.of(context)` va `TextTheme.of(context)` — `Theme.of(context).colorScheme` /
`.textTheme` bilan bir xil.

### Ilovaning bir qismida boshqa mavzu

FD: ilovaning bir bo'lagini `Theme` widget bilan o'rash mumkin. Ikki usul:

| Usul | Kod | Natija |
| --- | --- | --- |
| Yangi `ThemeData` | `Theme(data: ThemeData(…), child: …)` | bo'lak umumiy mavzuni **e'tiborsiz** qoldiradi |
| Ota mavzuni kengaytirish | `Theme(data: Theme.of(context).copyWith(…), child: …)` | faqat ko'rsatilgan narsa o'zgaradi, qolgani otadan |

FD ikkinchisini tavsiya qiladi: hammasini almashtirish o'rniga ota mavzuni kengaytirish.

Uslub qaysi tartibda qo'llanadi (FD):

1. widget'ning o'ziga berilgan uslub (`style:`, `color:`);
2. ota mavzuni almashtirgan `Theme`;
3. butun ilovaning asosiy mavzusi.

### Qorong'i mavzu

`MaterialApp` uchta parametr bilan qorong'i rejimni boshqaradi (API):

| Parametr | Nima |
| --- | --- |
| `theme` | yorug' mavzu |
| `darkTheme` | qorong'i mavzu. API: uning `brightness` i `Brightness.dark` bo'lishi kerak |
| `themeMode` | qaysi biri ishlatiladi |

`themeMode` qiymatlari (API):

| Qiymat | Qaysi mavzu |
| --- | --- |
| `ThemeMode.system` (**standart**) | tizim sozlamasiga qarab: tizim yorug' bo'lsa `theme`, qorong'i bo'lsa `darkTheme` |
| `ThemeMode.light` | doim `theme` |
| `ThemeMode.dark` | doim `darkTheme`; u `null` bo'lsa — `theme` |

Qorong'i sxema o'sha urug'dan yasaladi, faqat `brightness: Brightness.dark` beriladi.

### Material ichidagi Cupertino widget'lari

API (`Theme`): `Theme` widget o'z avlodlariga `CupertinoTheme` ham beradi. U Material mavzudan **hosil qilinadi**
(`MaterialBasedCupertinoThemeData`): masalan, `ColorScheme` Cupertino'ning `primaryColor` ini ham belgilaydi. Shuning uchun
`MaterialApp` ichidagi `CupertinoButton.filled` Material mavzu rangini oladi. Alohida o'zgartirish kerak bo'lsa —
`ThemeData(cupertinoOverrideTheme: …)`; Material'dan butunlay ajratish — bo'lakni `CupertinoTheme` bilan o'rash.

## Ko'rib chiqamiz

Ekran: qorong'i mavzu kaliti, mavzudan rang olgan blok, ikki tugma (biri boshqa mavzu bilan) va ikki Cupertino widget.

`lib/main.dart`:

```dart
import 'package:cupertino_ui/cupertino_ui.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  runApp(const KitobDokoniApp());
}

class KitobDokoniApp extends StatefulWidget {
  const KitobDokoniApp({super.key, this.boshlangich = ThemeMode.light});

  final ThemeMode boshlangich;

  @override
  State<KitobDokoniApp> createState() => _KitobDokoniAppState();
}

class _KitobDokoniAppState extends State<KitobDokoniApp> {
  late ThemeMode _rejim = widget.boshlangich;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      // Yorug' mavzu: ranglar sxemasi bitta "urug'" rangdan yasaladi
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      // Qorong'i mavzu: o'sha urug', lekin Brightness.dark
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal, brightness: Brightness.dark),
      ),
      themeMode: _rejim, // qaysi biri ishlatilishini tanlaydi
      home: BoshSahifa(
        qorongi: _rejim == ThemeMode.dark,
        almashtir: (q) => setState(() => _rejim = q ? ThemeMode.dark : ThemeMode.light),
      ),
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key, required this.qorongi, required this.almashtir});

  final bool qorongi;
  final ValueChanged<bool> almashtir;

  @override
  Widget build(BuildContext context) {
    final mavzu = Theme.of(context); // daraxtdagi eng yaqin Theme
    return Scaffold(
      appBar: AppBar(title: const Text('Mavzular')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          SwitchListTile(
            title: const Text('Qorong\'i mavzu'),
            value: qorongi,
            onChanged: almashtir,
          ),
          const SizedBox(height: 8),
          // Mavzudan rang va matn uslubini olish
          Container(
            padding: const EdgeInsets.all(12),
            color: mavzu.colorScheme.primaryContainer,
            child: Text(
              'colorScheme.primaryContainer',
              style: mavzu.textTheme.titleMedium!.copyWith(color: mavzu.colorScheme.onPrimaryContainer),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              FilledButton(onPressed: () {}, child: const Text('Asosiy mavzu')),
              const SizedBox(width: 12),
              // Faqat shu bo'lak uchun mavzuni kengaytirish (copyWith)
              Theme(
                data: mavzu.copyWith(
                  colorScheme: ColorScheme.fromSeed(
                    seedColor: Colors.deepOrange,
                    brightness: mavzu.brightness,
                  ),
                ),
                child: FilledButton(onPressed: () {}, child: const Text('Chegirma')),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Text('Cupertino (iOS uslubi)', style: mavzu.textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              CupertinoButton.filled(onPressed: () {}, child: const Text('Sotib olish')),
              const SizedBox(width: 12),
              CupertinoSwitch(value: true, onChanged: (_) {}),
            ],
          ),
        ],
      ),
    );
  }
}
```

E'tibor bering:

- Holat (`_rejim`) ilova ildizida, chunki `themeMode` — `MaterialApp` parametri. Kalit (`SwitchListTile`) uni
  `almashtir` callback orqali o'zgartiradi (14-bob: holatni ota boshqaradi, bola callback orqali aytadi).
- "Chegirma" tugmasining `Theme` ida `brightness: mavzu.brightness` — aks holda qorong'i rejimda ham yorug' sxema
  bo'lardi.
- Ranglar hech qayerda qo'lda yozilmagan: hammasi `Theme.of(context)` dan.

Testlar (`test/widget_test.dart`):

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  Color fon(WidgetTester tester) =>
      Theme.of(tester.element(find.byType(ListView))).colorScheme.surface;

  testWidgets('themeMode almashtirilsa — boshqa ranglar sxemasi', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    final yoruq = Theme.of(tester.element(find.byType(ListView)));
    debugPrint('yorug\': brightness=${yoruq.brightness}, surface=${fon(tester)}');

    await tester.tap(find.byType(Switch));
    await tester.pumpAndSettle();
    final qorongi = Theme.of(tester.element(find.byType(ListView)));
    debugPrint('qorong\'i: brightness=${qorongi.brightness}, surface=${fon(tester)}');
    expect(qorongi.brightness, Brightness.dark);
  });

  testWidgets('Theme widget faqat o\'z bolalariga ta\'sir qiladi', (tester) async {
    await tester.pumpWidget(const KitobDokoniApp());
    Color tugmaRangi(String matn) {
      final m = tester.widget<Material>(
        find.descendant(of: find.widgetWithText(FilledButton, matn), matching: find.byType(Material)).first,
      );
      return m.color!;
    }

    final asosiy = tugmaRangi('Asosiy mavzu');
    final chegirma = tugmaRangi('Chegirma');
    debugPrint('Asosiy mavzu tugmasi: $asosiy');
    debugPrint('Chegirma tugmasi:     $chegirma');
    expect(asosiy, isNot(chegirma));
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 5.4s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: themeMode almashtirilsa — boshqa ranglar sxemasi
yorug': brightness=Brightness.light, surface=Color(alpha: 1.0000, red: 0.9569, green: 0.9843, blue: 0.9725, colorSpace: ColorSpace.sRGB)
qorong'i: brightness=Brightness.dark, surface=Color(alpha: 1.0000, red: 0.0549, green: 0.0824, blue: 0.0745, colorSpace: ColorSpace.sRGB)
00:03 +1: Theme widget faqat o'z bolalariga ta'sir qiladi
Asosiy mavzu tugmasi: Color(alpha: 1.0000, red: 0.0000, green: 0.4157, blue: 0.3765, colorSpace: ColorSpace.sRGB)
Chegirma tugmasi:     Color(alpha: 1.0000, red: 0.5608, green: 0.2980, blue: 0.2196, colorSpace: ColorSpace.sRGB)
00:04 +2: All tests passed!
```

Natijada:

- Kalit bosilgach `brightness` `light` dan `dark` ga o'tdi, fon (`surface`) deyarli oqdan (0.96 / 0.98 / 0.97) deyarli
  qoraga (0.05 / 0.08 / 0.07) o'zgardi. Hech bir widget'da rang qo'lda o'zgartirilmagan — faqat `themeMode`.
- Ikki tugma bir xil `FilledButton`, lekin ranglari har xil: "Chegirma" `Theme` ichida, shuning uchun `deepOrange`
  urug'idan yasalgan sxemani oldi. Qo'shnisi — ilova mavzusini.
- Ranglar sRGB'da 0–1 oralig'ida chiqadi; masalan `0.4157` = 106/255.

Brauzerda (`flutter build web`), chapda yorug', o'ngda kalit bosilgandan keyingi qorong'i mavzu:

<img src="/rasmlar/flutter/20-yorug.png" alt="Yorug' mavzu: och yashil blok, to'q yashil va jigarrang tugmalar, Cupertino tugmasi va kaliti" width="300"> <img src="/rasmlar/flutter/20-qorongi.png" alt="Qorong'i mavzu: to'q fon, och yashil va och to'q sariq tugmalar, Cupertino tugmasi och yashil" width="300">

Ko'rinib turibdi:

- Qorong'i rejimda tugmalar **och** ranga o'tdi — `fromSeed` qorong'i fon uchun kontrastni o'zi tanladi.
- **"Sotib olish"** (`CupertinoButton.filled`) Material mavzu rangini oldi va u bilan birga o'zgardi:
  Cupertino mavzusi Material'dan hosil qilingan.
- **`CupertinoSwitch`** ikkala rejimda ham iOS'ning yashil rangida qoldi.

## Tipik xatolar

`brightness` va `colorScheme` ni bir-biriga zid berish:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  test('brightness va colorScheme bir-biriga zid', () {
    ThemeData(
      brightness: Brightness.dark,
      colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
    );
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: brightness va colorScheme bir-biriga zid
00:00 +0 -1: brightness va colorScheme bir-biriga zid [E]
  'package:material_ui/src/theme_data.dart': Failed assertion: line 517 pos 7: 'colorScheme?.brightness == null ||
            brightness == null ||
            colorScheme!.brightness == brightness': ThemeData.brightness does not match ColorScheme.brightness. Either override ColorScheme.brightness or ThemeData.brightness to match the other.
  dart:core                                      _AssertionError._throwNew
  package:material_ui/src/theme_data.dart 517:7  new ThemeData
  test/xato_test.dart 6:5                        main.<fn>
  
00:00 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/xato_test.dart: brightness va colorScheme bir-biriga zid
```

`fromSeed` da `brightness` berilmasa, sxema **yorug'** bo'ladi; `ThemeData` esa `dark` deyapti. To'g'risi — qorong'ilikni
sxemaning o'ziga berish: `ColorScheme.fromSeed(seedColor: …, brightness: Brightness.dark)` (yuqoridagi `darkTheme` kabi).

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `ThemeData.brightness does not match ColorScheme.brightness` | `ThemeData(brightness:)` va sxemaning `brightness` i har xil | `brightness` ni `fromSeed` ga bering |
| `darkTheme` berildi, lekin ilova doim yorug' | `themeMode: ThemeMode.light` | `ThemeMode.system` (standart) yoki `dark` |
| `darkTheme` berilmagan, `ThemeMode.dark` | API: `darkTheme` `null` bo'lsa `theme` ishlatiladi | `darkTheme` ni bering |
| Ranglar `Color(0xFF…)` bilan har widget'da qo'lda | Qorong'i rejimda o'zgarmaydi, ilova bo'ylab bir xil emas | `Theme.of(context).colorScheme…` |
| `Theme(data: ThemeData(…))` bo'lakda shrift va boshqa sozlamalarni "yo'qotdi" | Yangi `ThemeData` ota mavzuni e'tiborsiz qoldiradi | `Theme.of(context).copyWith(…)` |
| `Theme.of(context)` `MaterialApp` yaratilgan `build` ning o'zida | API: bu `context` mavzudan **yuqorida** | `Builder` yoki alohida widget |
| `import 'package:cupertino_ui/…'` topilmadi | Cupertino SDK'dan ajratilgan | `flutter pub add cupertino_ui` |

## Amaliyot

1. Material va Cupertino nima? Cupertino widget'lari qaysi paketda?
2. `ColorScheme.fromSeed(seedColor: Colors.teal)` nima qiladi? `teal` rangi sxemada aynan bo'ladimi?
3. `themeMode` berilmasa, qaysi mavzu ishlatiladi?
4. Bo'lakka boshqa mavzu berishning ikki usuli qaysi va FD qaysi birini tavsiya qiladi?
5. Tugmada `style:` ham bor, uni o'rab turgan `Theme` ham, ilova mavzusi ham. Qaysi biri ustun?
6. Misoldagi `CupertinoButton.filled` nega qorong'i rejimda och yashil bo'ldi?
7. Misolga "Tizimga moslash" uchinchi rejimini qo'shing.

<details>
<summary>Javoblar</summary>

1. Material — Google'ning dizayn tizimi (`material_ui`), Cupertino — Apple iOS dizayn tili. Cupertino SDK'dan ajratilgan, `cupertino_ui` paketida.
2. Urug' rangdan Material 3 bo'yicha mos va kontrasti yetarli butun ranglar sxemasini yasaydi. Yo'q — API: urug' rang sxemada chiqmasligi mumkin.
3. `ThemeMode.system` — tizim sozlamasiga qarab `theme` yoki `darkTheme`.
4. Yangi `ThemeData` (ota mavzuni e'tiborsiz qoldiradi) va `Theme.of(context).copyWith(…)` (kengaytiradi). FD ikkinchisini tavsiya qiladi.
5. Widget'ning o'z `style` i; keyin o'rab turgan `Theme`; keyin ilova mavzusi.
6. `Theme` avlodlariga Material mavzudan hosil qilingan `CupertinoTheme` beradi — `primaryColor` `ColorScheme` dan olinadi, u esa qorong'i sxemada och.
7. Masalan, `SegmentedButton<ThemeMode>` yoki uchta `RadioListTile`: `ThemeMode.light`, `ThemeMode.dark`, `ThemeMode.system`, tanlangani `_rejim` ga yoziladi.

</details>

## Rasmiy hujjat

- [FD: Use themes to share colors and font styles](https://docs.flutter.dev/cookbook/design/themes)
- [FD: Material Design for Flutter](https://docs.flutter.dev/ui/design/material)
- [FD: Cupertino design for Flutter](https://docs.flutter.dev/ui/design/cupertino)
- [API: MaterialApp.themeMode](https://pub.dev/documentation/material_ui/latest/material_ui/MaterialApp/themeMode.html) · [darkTheme](https://pub.dev/documentation/material_ui/latest/material_ui/MaterialApp/darkTheme.html)
- [API: ColorScheme.fromSeed](https://pub.dev/documentation/material_ui/latest/material_ui/ColorScheme/ColorScheme.fromSeed.html)
- [API: Theme.of](https://pub.dev/documentation/material_ui/latest/material_ui/Theme/of.html) · [Theme](https://pub.dev/documentation/material_ui/latest/material_ui/Theme-class.html)
- [API: ThemeData.cupertinoOverrideTheme](https://pub.dev/documentation/material_ui/latest/material_ui/ThemeData/cupertinoOverrideTheme.html)
