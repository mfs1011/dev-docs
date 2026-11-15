# 19 — Matn, rasm va asset

[Mundarija](README.md)

## Tushuncha

### Asset nima

FD (Assets and images): Flutter ilovasida kod bilan birga **asset**lar (resurslar) bo'ladi. Asset — ilova bilan birga
yig'ilib tarqatiladigan va ishlayotganda o'qiladigan fayl. Asset'ning keng tarqalgan turlari:

- statik ma'lumot, masalan JSON fayllar;
- sozlama fayllari;
- ikonkalar;
- rasmlar: JPEG, WebP, GIF, animatsiyali WebP/GIF, PNG, BMP, WBMP.

Asset'lar loyiha ildizidagi **`pubspec.yaml`** da, `flutter:` bo'limi ichidagi `assets:` ro'yxatida e'lon qilinadi:

| Yozuv | Ma'nosi (FD) |
| --- | --- |
| `- assets/my_icon.png` | bitta fayl (yo'l `pubspec.yaml` ga nisbatan) |
| `- directory/` | papkadagi fayllar — **faqat bevosita shu papkadagilari**; ichki papkalar uchun alohida qator |

FD: YAML'da **chekinish muhim**. `assets:` qatori `flutter:` dan aynan ikki bo'sh joy ichkarida bo'lishi kerak. Aks
holda `Error: unable to find directory entry in pubspec.yaml` kabi xato chiqishi mumkin.

FD: yig'ishda asset'lar **asset bundle** degan maxsus arxivga joylanadi, ilova ishlayotganda ularni shu yerdan o'qiydi.

### Asset'ni o'qish

FD: asset'lar `AssetBundle` orqali o'qiladi:

- `loadString()` — matn asset'i;
- `load()` — rasm yoki ikkilik (binary) asset.

Har ilovada asosiy bundle uchun `rootBundle` bor (`package:flutter/services.dart`). Lekin FD widget ichida
**`DefaultAssetBundle.of(context)`** ni tavsiya qiladi: bunda ota widget ishlayotganda boshqa bundle berishi mumkin
(lokalizatsiya yoki test uchun foydali). `rootBundle` — widget konteksti yo'q joyda.

### Rasmlar

| Usul | Qachon (FD) |
| --- | --- |
| `Image.asset('…')` / `Image(image: AssetImage('…'))` | ilova ichidagi rasm |
| `Image.network('https://…')` | internetdagi rasm; animatsiyali GIF'ni ham ko'rsatadi |

**Piksel zichligiga mos rasm** (FD, resolution-aware): `AssetImage` qurilmaning piksel zichligiga (device pixel ratio) eng
yaqin variantni tanlaydi. Buning uchun variantlar `Nx/` papkalarga qo'yiladi:

```text
assets/images/muqova.png        ← asosiy (1.0)
assets/images/2.0x/muqova.png   ← 2 baravar zich ekranlar uchun
assets/images/3.0x/muqova.png
```

- FD misoli: zichlik 1.8 bo'lsa `2.0x` varianti, 2.7 bo'lsa `3.0x` varianti tanlanadi.
- `Image` ga `width`/`height` berilmasa, zich variant asosiy rasm bilan **bir xil mantiqiy o'lchamda**, lekin aniqroq chiziladi.
- FD: piksel zichligini aniqlash uchun ota daraxtda `MaterialApp` yoki `CupertinoApp` bo'lishi kerak.

### Shriftlar

FD (Use a custom font):

- qo'llab-quvvatlanadigan formatlar: `.ttc`, `.ttf`, `.otf`;
- `.woff` / `.woff2` desktop platformalarda qo'llab-quvvatlanmaydi.

Ulash tartibi:

1. Shrift fayllarini loyihaga ko'chirish (masalan, `fonts/`).
2. `pubspec.yaml` da `fonts:` ostida `family` (nom) va fayllarni yozish. Kursiv fayl — `style: italic`, qalin fayl —
   `weight: 700`.
3. Ishlatish: butun ilova uchun `ThemeData(fontFamily: …)`, bitta widget uchun `TextStyle(fontFamily: …)`.

FD ogohlantirishlari:

- Flutter shriftning qalinligi yoki uslubini **fayl nomidan aniqlamaydi**. `weight`/`style` aniq yozilishi kerak.
- Mos fayl bo'lmasa, Flutter qalin yoki kursiv ko'rinishni **taqlid qiladi** (simulate). Natija haqiqiy fayldagidan
  ancha farq qiladi.
- 1000 dan ortiq ochiq shrift oilasi uchun `google_fonts` paketi bor.

## Ko'rib chiqamiz

Loyiha tuzilmasi:

```text
salom/
├─ assets/
│  ├─ data/kitoblar.json
│  └─ images/
│     ├─ muqova.png          72×96, yashil
│     └─ 2.0x/muqova.png    144×192, to'q sariq — qaysi variant tanlangani ko'rinsin
├─ fonts/
│  ├─ Raleway[wght].ttf          (Google Fonts, OFL litsenziyasi)
│  └─ Raleway-Italic[wght].ttf
└─ pubspec.yaml
```

`pubspec.yaml` ning `flutter:` bo'limi. E'tibor bering: 2.0x varianti alohida yozilmagan:

```yaml
flutter:
  uses-material-design: true

  assets:
    - assets/images/muqova.png
    - assets/data/kitoblar.json

  fonts:
    - family: Raleway
      fonts:
        - asset: fonts/Raleway[wght].ttf
        - asset: fonts/Raleway-Italic[wght].ttf
          style: italic
```

`lib/main.dart`:

```dart
import 'dart:convert';

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
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        fontFamily: 'Raleway', // pubspec.yaml dagi family — butun ilova uchun
      ),
      home: const KitoblarSahifasi(),
    );
  }
}

class KitoblarSahifasi extends StatelessWidget {
  const KitoblarSahifasi({super.key});

  // JSON asset'ni joriy BuildContext'ning AssetBundle'idan o'qish (FD tavsiyasi)
  Future<List<Map<String, dynamic>>> _yukla(BuildContext context) async {
    final matn = await DefaultAssetBundle.of(context).loadString('assets/data/kitoblar.json');
    return (jsonDecode(matn) as List).cast<Map<String, dynamic>>();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitoblar')),
      body: FutureBuilder(
        future: _yukla(context),
        builder: (context, holat) {
          final kitoblar = holat.data;
          if (kitoblar == null) return const Center(child: CircularProgressIndicator());
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text(
                'Muallif tanlovi',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
              ),
              const Text(
                'Raleway shrifti, kursiv (italic) varianti alohida fayldan',
                style: TextStyle(fontStyle: FontStyle.italic),
              ),
              const SizedBox(height: 12),
              for (final k in kitoblar)
                ListTile(
                  // Asset rasm: qurilmaning piksel zichligiga mos variant tanlanadi
                  leading: Image.asset('assets/images/muqova.png', width: 36),
                  title: Text(k['nom'] as String),
                  subtitle: Text(k['muallif'] as String),
                ),
              const SizedBox(height: 12),
              const Text('Internetdan rasm (Image.network):'),
              const SizedBox(height: 8),
              Image.network(
                'https://picsum.photos/250?image=9',
                height: 140,
                // Tarmoq yo'q yoki xato bo'lsa — ilova yiqilmaydi, o'rniga belgi chiqadi
                errorBuilder: (context, xato, stack) => const Icon(Icons.broken_image, size: 64),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

Testlar:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('JSON asset o\'qiladi va ro\'yxatga chiqadi', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: KitoblarSahifasi()));
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 100)));
    await tester.pump();
    expect(find.text('Flutter asoslari'), findsOneWidget);
    expect(find.text('D. Rasulov'), findsOneWidget);
    debugPrint('ro\'yxatda: ${find.byType(ListTile).evaluate().length} ta kitob');

    // Testda tarmoq yopiq (HTTP 400) — errorBuilder ishlaydi
    await tester.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 300)));
    await tester.pump();
    expect(find.byIcon(Icons.broken_image), findsOneWidget);
  });

  test('Piksel zichligiga qarab asset varianti tanlanadi', () async {
    TestWidgetsFlutterBinding.ensureInitialized();
    const rasm = AssetImage('assets/images/muqova.png');
    for (final zichlik in [1.0, 1.8, 2.7]) {
      final kalit = await rasm.obtainKey(ImageConfiguration(devicePixelRatio: zichlik));
      debugPrint('devicePixelRatio $zichlik → ${kalit.name} (scale ${kalit.scale})');
    }
  });
}
```

```text vps
$ flutter analyze
Analyzing 2 items...                                            
No issues found! (ran in 6.6s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: JSON asset o'qiladi va ro'yxatga chiqadi
ro'yxatda: 3 ta kitob
00:02 +1: Piksel zichligiga qarab asset varianti tanlanadi
devicePixelRatio 1.0 → assets/images/muqova.png (scale 1.0)
devicePixelRatio 1.8 → assets/images/2.0x/muqova.png (scale 2.0)
devicePixelRatio 2.7 → assets/images/2.0x/muqova.png (scale 2.0)
00:02 +2: All tests passed!
```

Natijada:

- JSON asset'dan 3 kitob o'qildi va ro'yxatga chiqdi.
- **1.8** zichlikda `2.0x/muqova.png` tanlandi — FD aytganidek. **2.7** da ham `2.0x`: bizda `3.0x` varianti yo'q, shuning
  uchun mavjudlaridan eng mosi olindi.
- 2.0x varianti `pubspec.yaml` da alohida yozilmagan bo'lsa ham bundle'ga tushdi. Asosiy asset e'lon qilingani yetarli bo'ldi.

Brauzerda (`flutter build web`). Bu ekranning piksel zichligi 2, shuning uchun muqova **to'q sariq** — 2.0x varianti.
Matnlar Raleway shriftida, ikkinchi qator kursiv fayldan. Pastdagi rasm internetdan yuklangan:

<img src="/rasmlar/flutter/19-assetlar.png" alt="Kitoblar ro'yxati: Raleway shriftida sarlavha, to'q sariq muqova rasmlari va internetdan yuklangan rasm" width="320">

## Tipik xatolar

`pubspec.yaml` da e'lon qilinmagan asset'ni o'qish:

```dart
import 'package:flutter/services.dart' show rootBundle;
import 'package:flutter_test/flutter_test.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('pubspec.yaml da e\'lon qilinmagan asset', () async {
    await rootBundle.loadString('assets/data/narxlar.json');
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: pubspec.yaml da e'lon qilinmagan asset
00:00 +0 -1: pubspec.yaml da e'lon qilinmagan asset [E]
  Unable to load asset: "assets/data/narxlar.json".
  The asset does not exist or has empty data.
  package:flutter/src/services/asset_bundle.dart 340:7   PlatformAssetBundle.load
  package:flutter/src/services/asset_bundle.dart 92:33   AssetBundle.loadString
  package:flutter/src/services/asset_bundle.dart 193:56  CachingAssetBundle.loadString.<fn>
  dart:_compact_hash                                     _LinkedHashMapMixin.putIfAbsent
  package:flutter/src/services/asset_bundle.dart 193:27  CachingAssetBundle.loadString
  test/xato_test.dart 8:22                               main.<fn>
  
00:00 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/xato_test.dart: pubspec.yaml da e'lon qilinmagan asset
```

`Image.network` testda. Widget testlarida haqiqiy tarmoq **yopiq**. Shu bobni yozishda `errorBuilder` siz birinchi
urinish yiqildi va test quyidagini chiqardi:

```text vps
HTTP request failed, statusCode: 400, https://picsum.photos/250?image=9
…
Warning: At least one test in this suite creates an HttpClient. When running a test suite that uses
TestWidgetsFlutterBinding, all HTTP requests will return status code 400, and no network request
will actually be made. Any test expecting a real network connection and status code will fail.
To test code that needs an HttpClient, provide your own HttpClient implementation to the code under
test, so that your test can consistently provide a testable response to the code under test.
```

Shuning uchun `errorBuilder` qo'shildi. Endi tarmoq bo'lmaganda ilova yiqilmaydi va `broken_image` belgisi chiqadi.
Testdagi tekshiruv ham shuni tasdiqlaydi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `Unable to load asset: "…"` | Fayl `pubspec.yaml` da e'lon qilinmagan yoki yo'li xato | `flutter: assets:` ga qo'shing, yo'lni tekshiring |
| Papka e'lon qilindi, ichki papkadagi fayl topilmaydi | FD: faqat bevosita shu papkadagi fayllar olinadi | Har ichki papka uchun alohida qator |
| `assets:` noto'g'ri chekinish bilan | FD: YAML'da chekinish muhim | `flutter:` dan 2 bo'sh joy ichkarida |
| Qalin matn "soxta" ko'rinadi | FD: mos `weight` fayli e'lon qilinmagan, Flutter taqlid qilyapti | Qalin faylni `weight: 700` bilan e'lon qiling |
| `Image.network` xato bo'lsa ekran buziladi | Tarmoq yo'q yoki rasm topilmagan | `errorBuilder` (va kerak bo'lsa `loadingBuilder`) |
| Testda haqiqiy tarmoqqa tayanish | Test so'rovlarga 400 qaytaradi | O'z `HttpClient` / soxta javob (40-bob) |

## Amaliyot

1. Asset nima? Uni ilovaga qo'shish uchun nima qilish kerak?
2. `assets: - images/` yozildi. `images/ikonkalar/a.png` bundle'ga tushadimi?
3. `rootBundle` va `DefaultAssetBundle.of(context)` farqi nima? FD qaysi birini tavsiya qiladi?
4. Qurilma zichligi 1.8. `muqova.png`, `2.0x/` va `3.0x/` variantlari bor. Qaysi biri tanlanadi? 2.7 bo'lsa-chi?
5. `fonts:` da `Raleway-Bold.ttf` yozildi, lekin `weight` berilmadi. `FontWeight.w700` qanday ko'rinadi?
6. Ro'yxatdagi har kitob uchun JSON'ga `"narx"` maydonini qo'shing va uni `trailing` da ko'rsating.

<details>
<summary>Javoblar</summary>

1. Ilova bilan birga tarqatiladigan va ishlayotganda o'qiladigan fayl. `pubspec.yaml` dagi `flutter: assets:` ro'yxatiga yoziladi.
2. Yo'q: papka yozilganda faqat bevosita undagi fayllar olinadi. `images/ikonkalar/` ni alohida yozish kerak.
3. `rootBundle` — ilova bilan yig'ilgan asosiy bundle; `DefaultAssetBundle.of(context)` — kontekstdagi bundle, ota widget uni almashtira oladi. FD widget ichida ikkinchisini tavsiya qiladi.
4. 1.8 da `2.0x`, 2.7 da `3.0x` (FD).
5. Flutter fayl nomidan qalinlikni aniqlamaydi. U bu faylni qalin deb bilmaydi va oddiy shriftdan qalin ko'rinishni taqlid qiladi.
6. JSON'ga `"narx": 85000` va hokazo; `trailing: Text('${k['narx']} so\'m')`.

</details>

## Rasmiy hujjat

- [FD: Adding assets and images](https://docs.flutter.dev/ui/assets/assets-and-images)
- [FD: Use a custom font](https://docs.flutter.dev/cookbook/design/fonts)
- [FD: Display images from the internet](https://docs.flutter.dev/cookbook/images/network-image)
- [FD: Text](https://docs.flutter.dev/ui/design/text)
- [API: Image.network — errorBuilder](https://api.flutter.dev/flutter/widgets/Image/Image.network.html)
