# 27 — Qulaylik va tillar

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: qulaylik `flutter_test` ning Accessibility Guideline API'si bilan,
> tarjimalar `flutter gen-l10n` va widget testlari bilan. Haqiqiy ekran o'quvchi (TalkBack, VoiceOver) qurilma talab
> qiladi — u bilan sinalmagan.

## Tushuncha

### Qulaylik (accessibility)

**Qulaylik** — ilovadan imkoniyati cheklangan odamlar ham foydalana olishi: ko'rishi past (katta shrift, ekran o'quvchi),
rangni ajratishi qiyin, qo'li qaltiraydigan va h.k. FD (Accessibility) tekshiruv ro'yxati:

| Talab | FD |
| --- | --- |
| Katta shrift | Matn o'lchami juda kattalashtirilganda ham UI o'qiladigan va ishlatiladigan bo'lsin |
| Ekran o'quvchi | TalkBack (Android) va VoiceOver (iOS) har bir boshqaruv elementini tushunarli tasvirlab bera olsin |
| Kontrast | Matn yoki boshqaruv elementi va fon orasida kamida **4.5:1** (o'chirilgan elementlardan tashqari) |
| Bosiladigan joy | Har bir bosiladigan joy kamida **48×48** piksel |
| Xatolar | Muhim amallarni bekor qilish mumkin bo'lsin; xatoli maydonda iloji bo'lsa to'g'ri variant taklif qilinsin |
| Rang ko'rish | Rangni ajrata olmaydigan va kulrang rejimda ham ishlatiladigan bo'lsin |

Aniq raqamlar (FD, UI design & styling):

- **Kontrast** (W3C tavsiyasi): kichik matn uchun kamida 4.5:1, katta matn (18 pt va undan katta oddiy yoki 14 pt va undan
  katta qalin) uchun 3:1.
- **Bosiladigan joy**: Android — 48×48 dp, iOS — 44×44 pt; W3C — 44×44 CSS piksel.
- **Shrift o'lchami**: Flutter matn widget'lari OS sozlamasini o'zi hisobga oladi. Dasturchining vazifasi — shrift
  kattalashganda ham joy yetishi; FD maslahati: ilovani kichik ekranli qurilmada eng katta shrift sozlamasi bilan sinash.

### Semantika va ekran o'quvchi

Ekran o'quvchi ekrandagi piksellarni emas, **semantika daraxti**ni (semantics tree) o'qiydi — har bir element nima (tugma,
matn, rasm) va uning nomi. FD (Assistive technologies): Flutter'ning standart widget'lari bu daraxtni o'zi yaratadi;
boshqacha kerak bo'lsa — **`Semantics`** widget'i bilan sozlanadi.

Amalda eng ko'p uchraydigani: faqat ikonli tugma (`IconButton`). Unda matn yo'q — ekran o'quvchiga nom kerak. Buning uchun
`tooltip` beriladi — API: "tugma bosilganda nima bo'lishini tasvirlovchi matn". U tugmaning semantikasiga ham yoziladi
(pastdagi testda ko'rinadi) va nom tekshiruvi (`labeledTapTargetGuideline`) o'tadi.

FD (Assistive technologies): web'da ekran o'quvchi ishlatadigan foydalanuvchi semantika daraxtini yaratish uchun "Enable
accessibility" tugmasini bosishi kerak. Buni dasturda avtomatik yoqish mumkin:

```dart
import 'package:flutter/semantics.dart';

void main() {
  runApp(const MyApp());
  SemanticsBinding.instance.ensureSemantics();
}
```

### Avtomatik tekshiruv: Accessibility Guideline API

FD (Accessibility testing): `flutter_test` dagi `meetsGuideline` to'rt qoidani tekshiradi:

| Qoida | Nimani tekshiradi |
| --- | --- |
| `androidTapTargetGuideline` | bosiladigan joy kamida 48×48 (Android) |
| `iOSTapTargetGuideline` | bosiladigan joy kamida 44×44 (iOS) |
| `labeledTapTargetGuideline` | bosiladigan (tap, long press) joyning nomi bor |
| `textContrastGuideline` | matn kontrasti yetarli |

Test oldidan `tester.ensureSemantics()` bilan semantika daraxti yoqiladi, oxirida `handle.dispose()`. Qurilmada esa FD
Android Accessibility Scanner, Xcode Accessibility Inspector va web uchun Chrome DevTools'ni tavsiya qiladi.

### Tillar: lokalizatsiya

**Lokalizatsiya** (localization, qisqa — l10n: "l", 10 harf, "n") — ilova matnlarini bir nechta tilga tarjima qilish.
**Internatsionalizatsiya** (internationalization, i18n) — ilovani bunga tayyorlash. FD (Internationalizing Flutter apps)
yo'li:

1. `flutter_localizations` va `intl` paketlari.
2. `pubspec.yaml` ning `flutter:` bo'limida `generate: true` — kod generatsiyasi.
3. Loyiha ildizida `l10n.yaml` — tarjima fayllari qayerda va qaysi biri asosiy (template).
4. **`.arb`** fayllar (Application Resource Bundle) — JSON ko'rinishidagi "kalit: matn" ro'yxati, har til uchun bittadan.
5. `flutter pub get` yoki `flutter run` da (yoki qo'lda `flutter gen-l10n`) `AppLocalizations` klassi yaratiladi.
6. `MaterialApp` ga `localizationsDelegates` va `supportedLocales`; matnlar `AppLocalizations.of(context)!.kalit`.

`.arb` da (FD):

- **o'rinbosar** (placeholder) — `"Xush kelibsiz, {ism}!"`, `@kalit` dagi `placeholders` da turi bilan;
- **ko'plik** (plural) — `{soni, plural, =0{…} =1{…} other{…}}`: songa qarab har xil matn;
- **tanlov** (select) — `{jins, select, male{…} female{…} other{…}}`.

`GlobalMaterialLocalizations.delegates` — Material widget'larining o'z matnlari (orqaga tugmasi, sana tanlagich va h.k.)
tarjimasi.

## Ko'rib chiqamiz

Kitob do'koni ikki tilda — o'zbek (asosiy) va ingliz. Har bir ikonli tugmada nom bor.

### Paketlar va sozlama

```text vps
$ flutter pub add flutter_localizations:"{sdk: flutter}" intl:any
Resolving dependencies...
Downloading packages...
  cupertino_icons 1.0.9 (2.0.0 available)
  cupertino_ui 1.1.6 (1.1.7 available)
  flutter_localizations 0.0.0 from sdk flutter (from transitive dependency to direct dependency)
  intl 0.20.3 (from transitive dependency to direct dependency)
  material_color_utilities 0.13.0 (0.13.1 available)
  material_ui 1.11.0 (1.11.1 available)
  test_api 0.7.14 (0.7.15 available)
  vector_math 2.4.3 (2.4.4 available)
Changed 2 dependencies!
6 packages have newer versions incompatible with dependency constraints.
Try `flutter pub outdated` for more information.
```

Ikkala paket loyihada allaqachon bor edi — bilvosita (transitive), `material_ui` orqali; endi to'g'ridan-to'g'ri bog'liqlik
bo'ldi.

`pubspec.yaml`:

```yaml
flutter:
  generate: true
  uses-material-design: true
```

`l10n.yaml` (loyiha ildizida). FD misolida asosiy til ingliz (`app_en.arb`); bizda — o'zbek:

```yaml
arb-dir: lib/l10n
template-arb-file: app_uz.arb
output-localization-file: app_localizations.dart
```

`lib/l10n/app_uz.arb` — asosiy fayl: har kalitga `@kalit` da izoh (`description`) va o'rinbosarlar:

```json
{
  "dokonNomi": "Kitob do'koni",
  "@dokonNomi": {
    "description": "Ilova va bosh sahifa sarlavhasi"
  },
  "salom": "Xush kelibsiz, {ism}!",
  "@salom": {
    "description": "Bosh sahifadagi salomlashuv",
    "placeholders": {
      "ism": {
        "type": "String",
        "example": "Ali"
      }
    }
  },
  "kitoblarSoni": "{soni, plural, =0{Kitob yo'q} other{{soni} ta kitob}}",
  "@kitoblarSoni": {
    "description": "Ro'yxatdagi kitoblar soni",
    "placeholders": {
      "soni": {
        "type": "int"
      }
    }
  },
  "savat": "Savat",
  "@savat": {
    "description": "Savat tugmasi va sahifasi"
  },
  "sevimli": "Sevimlilarga qo'shish",
  "@sevimli": {
    "description": "Yurak tugmasi — ekran o'quvchi shu matnni o'qiydi"
  }
}
```

`lib/l10n/app_en.arb` — faqat tarjimalar. Inglizchada "1 book" va "5 books" farq qiladi, shuning uchun `=1{…}` ham bor;
o'zbekchada "1 ta kitob", "5 ta kitob" — bir xil, `other` yetadi:

```json
{
  "dokonNomi": "Book store",
  "salom": "Welcome, {ism}!",
  "kitoblarSoni": "{soni, plural, =0{No books} =1{1 book} other{{soni} books}}",
  "savat": "Cart",
  "sevimli": "Add to favorites"
}
```

```text vps
$ flutter gen-l10n
Because l10n.yaml exists, the options defined there will be used instead.
To use the command line arguments, delete the l10n.yaml file in the Flutter project.
$ ls lib/l10n
app_en.arb
app_localizations.dart
app_localizations_en.dart
app_localizations_uz.dart
app_uz.arb
```

### `material_ui` bilan: qaysi `GlobalMaterialLocalizations`

FD misolida `flutter_localizations` import qilinadi. Bizning loyiha esa Material widget'larini SDK'dan emas, `material_ui`
paketidan oladi (20-bob). Ikkalasini birga import qilsak:

```text vps
$ flutter analyze
  error • The name 'GlobalMaterialLocalizations' is defined in the libraries 'package:flutter_localizations/src/material_localizations.dart (via package:flutter_localizations/flutter_localizations.dart)' and 'package:material_ui/src/global_material_localizations.dart (via package:material_ui/material_ui.dart)'. Try using 'as prefix' for one of the import directives, or hiding the name from all but one of the imports • lib/main.dart:24:12 • ambiguous_import
```

FD'dagidek prefiks bilan (`import '…flutter_localizations.dart' as flutter_localizations;`) qilsak, import ishlatilmay
qoladi — `GlobalMaterialLocalizations` baribir `material_ui` dan keladi:

```text vps
warning • Unused import: 'package:flutter_localizations/flutter_localizations.dart'. Try removing the import directive • lib/main.dart:1:8 • unused_import
```

Demak `material_ui` bilan `flutter_localizations` ni `main.dart` ga import qilish shart emas. Generatsiya qilingan
`app_localizations.dart` esa uni hali ham import qiladi, shuning uchun paket `pubspec.yaml` da qoladi. Shu fayl ichidan
`flutter analyze` ikki ma'lumot (info) beradi — ular generatsiya qilingan kodda, bizning kodda emas:

```text vps
   info • 'GlobalMaterialLocalizations' is deprecated and shouldn't be used. Use GlobalMaterialLocalizations from package:material_ui/material_ui.dart instead. This feature was deprecated after v3.47.0-0.0.pre. Try replacing the use of the deprecated member with the replacement • lib/l10n/app_localizations.dart:90:9 • deprecated_member_use
   info • 'GlobalCupertinoLocalizations' is deprecated and shouldn't be used. Use GlobalCupertinoLocalizations from package:cupertino_ui/cupertino_ui.dart instead. This feature was deprecated after v3.47.0-0.0.pre. Try replacing the use of the deprecated member with the replacement • lib/l10n/app_localizations.dart:91:9 • deprecated_member_use
```

Ular generatsiya qilingan `AppLocalizations.localizationsDelegates` ro'yxatiga tegishli. Shuning uchun biz u ro'yxatni emas,
FD'dagidek o'z ro'yxatimizni yozamiz: `AppLocalizations.delegate` + `material_ui` dagi `GlobalMaterialLocalizations.delegates`.

### Ilova

`lib/main.dart`:

```dart
// GlobalMaterialLocalizations — material_ui paketidan (flutter_localizations dagisi eskirgan)
import 'package:material_ui/material_ui.dart';

import 'l10n/app_localizations.dart';

const kitoblar = ['Dart tili', 'Flutter asoslari', 'Toza kod'];

void main() => runApp(const DokonApp());

class DokonApp extends StatelessWidget {
  const DokonApp({super.key, this.til});

  /// null bo'lsa — qurilma tili
  final Locale? til;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      locale: til,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        ...GlobalMaterialLocalizations.delegates,
      ],
      supportedLocales: AppLocalizations.supportedLocales,
      onGenerateTitle: (context) => AppLocalizations.of(context)!.dokonNomi,
      home: const BoshSahifa(),
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(
        title: Text(l.dokonNomi),
        actions: [
          IconButton(
            tooltip: l.savat, // ekran o'quvchi uchun nom ham shu
            icon: const Icon(Icons.shopping_cart),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => Scaffold(appBar: AppBar(title: Text(l.savat)))),
            ),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 8),
        children: [
          ListTile(title: Text(l.salom('Ali')), subtitle: Text(l.kitoblarSoni(kitoblar.length))),
          for (final nom in kitoblar)
            ListTile(
              leading: const Icon(Icons.menu_book),
              title: Text(nom),
              trailing: IconButton(
                tooltip: l.sevimli,
                icon: const Icon(Icons.favorite_border),
                onPressed: () {},
              ),
            ),
        ],
      ),
    );
  }
}
```

Muhim joylar:

- **`locale: til`** — `null` bo'lsa ilova qurilma tilini oladi. Testda va misolda tilni majburan berish uchun parametr.
- **`onGenerateTitle`** — ilova nomi (masalan, brauzer yorlig'ida) ham tarjima qilinadi. API: bu funksiyaning `context`
  ida `Localizations` bor; oddiy `title` satrida esa tarjima olishning iloji yo'q.
- **`l.salom('Ali')`, `l.kitoblarSoni(3)`** — o'rinbosar va ko'plik oddiy Dart metodlariga aylandi: tur (`String`,
  `int`) `.arb` dagi `placeholders` dan.
- **Kitob nomlari tarjima qilinmagan** — ular ma'lumot, UI matni emas.

### Testlar

`test/widget_test.dart` — ikki tilda ishga tushirish, ko'plik, qo'llanmagan til:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/l10n/app_localizations.dart';
import 'package:salom/main.dart';

void main() {
  for (final til in ['uz', 'en']) {
    testWidgets('Ilova $til tilida', (tester) async {
      await tester.pumpWidget(DokonApp(til: Locale(til)));
      await tester.pumpAndSettle();
      final l = AppLocalizations.of(tester.element(find.byType(BoshSahifa)))!;
      debugPrint('[$til] ${l.dokonNomi} | ${l.salom('Ali')} | ${l.kitoblarSoni(3)}');

      await tester.tap(find.byTooltip(l.savat));
      await tester.pumpAndSettle();
      final m = MaterialLocalizations.of(tester.element(find.byType(BackButton)));
      debugPrint('[$til] orqaga tugmasi: "${m.backButtonTooltip}"');
    });
  }

  test('Ko\'plik (plural)', () {
    for (final til in ['uz', 'en']) {
      final l = lookupAppLocalizations(Locale(til));
      debugPrint('[$til] ${[0, 1, 5].map(l.kitoblarSoni).join(' | ')}');
    }
    debugPrint('supportedLocales: ${AppLocalizations.supportedLocales}');
  });

  testWidgets('Qo\'llanmagan til (ru)', (tester) async {
    await tester.pumpWidget(const DokonApp(til: Locale('ru')));
    await tester.pumpAndSettle();
    debugPrint('[ru] sarlavha: ${tester.widget<Text>(find.descendant(of: find.byType(AppBar), matching: find.byType(Text))).data}');
  });
}
```

`test/a11y_test.dart` — FD'dagi to'rt qoida va ikonli tugmalar semantikasi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Qulaylik ko\'rsatmalari', (tester) async {
    final SemanticsHandle handle = tester.ensureSemantics();
    await tester.pumpWidget(const DokonApp(til: Locale('uz')));
    await tester.pumpAndSettle();

    await expectLater(tester, meetsGuideline(androidTapTargetGuideline)); // 48×48
    await expectLater(tester, meetsGuideline(iOSTapTargetGuideline)); // 44×44
    await expectLater(tester, meetsGuideline(labeledTapTargetGuideline)); // bosiladigan joyda nom bor
    await expectLater(tester, meetsGuideline(textContrastGuideline)); // kontrast

    debugPrint('4 ta ko\'rsatma: o\'tdi');

    // Ekran o'quvchi nimani o'qiydi
    for (final f in [find.byTooltip('Savat'), find.byTooltip('Sevimlilarga qo\'shish').first]) {
      final s = tester.getSemantics(f).getSemanticsData();
      debugPrint('tooltip: "${s.tooltip}", tugma: ${s.flagsCollection.isButton}, o\'lcham: ${s.rect.size}');
    }
    debugPrint('ikonning o\'zi: ${tester.getSize(find.byIcon(Icons.shopping_cart))}');
    handle.dispose();
  });
}
```

```text vps
$ flutter test test/widget_test.dart test/a11y_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: /home/dasturchi/flutter/salom/test/widget_test.dart: Ilova uz tilida
[uz] Kitob do'koni | Xush kelibsiz, Ali! | 3 ta kitob
[uz] orqaga tugmasi: "Orqaga"
00:02 +1: /home/dasturchi/flutter/salom/test/widget_test.dart: Ilova en tilida
[en] Book store | Welcome, Ali! | 3 books
[en] orqaga tugmasi: "Back"
00:02 +2: /home/dasturchi/flutter/salom/test/widget_test.dart: Ko'plik (plural)
[uz] Kitob yo'q | 1 ta kitob | 5 ta kitob
[en] No books | 1 book | 5 books
supportedLocales: [en, uz]
00:02 +3: /home/dasturchi/flutter/salom/test/widget_test.dart: Qo'llanmagan til (ru)
[ru] sarlavha: Book store
00:03 +4: loading /home/dasturchi/flutter/salom/test/a11y_test.dart
00:04 +4: /home/dasturchi/flutter/salom/test/a11y_test.dart: Qulaylik ko'rsatmalari
4 ta ko'rsatma: o'tdi
tooltip: "Savat", tugma: true, o'lcham: Size(48.0, 48.0)
tooltip: "Sevimlilarga qo'shish", tugma: true, o'lcham: Size(48.0, 48.0)
ikonning o'zi: Size(24.0, 24.0)
00:09 +5: All tests passed!
```

Natijada:

- **Ikki til** — o'z matnlarimiz ham, Material'ning o'z matni ham ("Orqaga" / "Back") tarjima qilindi: o'zbek tili
  `GlobalMaterialLocalizations` da bor.
- **Ko'plik:** o'zbekchada 0 — "Kitob yo'q", qolgani "N ta kitob"; inglizchada 1 va 5 farq qiladi.
- **Rus tili** qo'llanmaydi — ilova inglizcha ochildi. API (basicLocaleListResolution): mos til topilmasa, `supportedLocales`
  dagi **birinchi** til olinadi. Generatsiya qilingan ro'yxatda birinchisi `en` (asosiy fayl `uz` bo'lsa ham).
- **Qulaylik:** to'rt qoida o'tdi. Ikonli tugmalarning semantikasida nom (`tooltip`) bor va bosiladigan joy 48×48 —
  ikon 24 px bo'lsa ham, `IconButton` bosish uchun 48×48 joy berdi.

### Brauzerda

Brauzer tili `uz-UZ` va `en-US` bo'lganda (`locale: til` berilmagan — ilova brauzer tilini oldi). Brauzer yorlig'idagi
nom ham tarjima qilindi (`onGenerateTitle`): `uz-UZ → title: Kitob do'koni`, `en-US → title: Book store`.

<img src="/rasmlar/flutter/27-uz.png" alt="Kitob do'koni o'zbekcha: Xush kelibsiz, Ali! 3 ta kitob" width="300"> <img src="/rasmlar/flutter/27-en.png" alt="Book store inglizcha: Welcome, Ali! 3 books" width="300">

## Tipik xatolar

`test/xato_test.dart` — har bir qoidani alohida widget'da buzamiz:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/l10n/app_localizations.dart';

Future<void> tekshir(WidgetTester tester, AccessibilityGuideline g, Widget w) async {
  final handle = tester.ensureSemantics();
  await tester.pumpWidget(MaterialApp(home: Scaffold(body: Center(child: w))));
  final natija = await g.evaluate(tester);
  debugPrint('${g.description}: ${natija.passed ? 'o\'tdi' : 'o\'tmadi'}');
  if (!natija.passed) debugPrint(natija.reason!.trim());
  handle.dispose();
}

void main() {
  testWidgets('Nomsiz ikon tugma', (tester) async {
    await tekshir(tester, labeledTapTargetGuideline,
        IconButton(icon: const Icon(Icons.favorite_border), onPressed: () {}));
  });

  testWidgets('Kichik bosiladigan joy', (tester) async {
    await tekshir(tester, androidTapTargetGuideline,
        GestureDetector(onTap: () {}, child: const SizedBox(width: 30, height: 30, child: Text('x'))));
  });

  testWidgets('Past kontrast', (tester) async {
    await tekshir(tester, textContrastGuideline,
        Text('Narxi: 50 000 so\'m', style: TextStyle(color: Colors.grey.shade300)));
  });

  testWidgets('Shrift 2 marta katta, balandlik qat\'iy', (tester) async {
    tester.platformDispatcher.textScaleFactorTestValue = 2;
    addTearDown(tester.platformDispatcher.clearAllTestValues);
    await tester.pumpWidget(const MaterialApp(
      home: Scaffold(
        body: SizedBox(height: 40, child: Column(children: [Text('Toza kod'), Text('R. Martin')])),
      ),
    ));
    debugPrint(tester.takeException().toString().split('\n').first);
  });

  testWidgets('AppLocalizations — MaterialApp dan tashqarida', (tester) async {
    await tester.pumpWidget(Builder(builder: (context) => Text(AppLocalizations.of(context)!.dokonNomi)));
    debugPrint(tester.takeException().toString().split('\n').first);
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: Nomsiz ikon tugma
Tappable widgets should have a semantic label: o'tmadi
SemanticsNode#4(Rect.fromLTRB(376.0, 276.0, 424.0, 324.0), actions: [focus, tap], flags: [isButton, hasEnabledState, isEnabled, isFocusable]): expected tappable node to have semantic label, but none was found.
00:01 +1: Kichik bosiladigan joy
Tappable objects should be at least Size(48.0, 48.0): o'tmadi
SemanticsNode#4(Rect.fromLTRB(385.0, 285.0, 415.0, 315.0), actions: [tap], label: "x", textDirection: ltr): expected tap target size of at least Size(48.0, 48.0), but found Size(30.0, 30.0)
See also: https://support.google.com/accessibility/android/answer/7101858?hl=en
00:02 +2: Past kontrast
Text contrast should follow WCAG guidelines: o'tmadi
SemanticsNode#4(Rect.fromLTRB(271.8, 290.0, 528.3, 310.0), label: "Narxi: 50 000 so'm", textDirection: ltr):
Expected contrast ratio of at least 4.5 but found 1.25 for a font size of 14.0.
The computed colors was:
light - Color(alpha: 1.0000, red: 0.9961, green: 0.9686, blue: 1.0000, colorSpace: ColorSpace.sRGB), dark - Color(alpha: 1.0000, red: 0.8784, green: 0.8784, blue: 0.8784, colorSpace: ColorSpace.sRGB)
See also: https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html
00:02 +3: Shrift 2 marta katta, balandlik qat'iy
A RenderFlex overflowed by 40 pixels on the bottom.
00:02 +4: AppLocalizations — MaterialApp dan tashqarida
Null check operator used on a null value
00:02 +5: All tests passed!
```

(Testlar o'tdi, chunki ular xatoni ushlab chop etadi; `expectLater(tester, meetsGuideline(...))` bilan yozilganda test
yiqiladi.)

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `expected tappable node to have semantic label` | Ikonli tugmada matn ham, nom ham yo'q — semantikada faqat `isButton` | `tooltip` (yoki `Semantics(label: …)`) |
| `expected tap target size of at least Size(48.0, 48.0), but found Size(30.0, 30.0)` | 30×30 li `GestureDetector` | Bosiladigan joy kamida 48×48 (FD) |
| `Expected contrast ratio of at least 4.5 but found 1.25` | Oq fonda och kulrang matn | 4.5:1 dan yuqori kontrast (FD, W3C) |
| `A RenderFlex overflowed by 40 pixels` (shrift ×2) | Balandlik qat'iy berilgan | Qat'iy balandlik o'rniga matnga moslashadigan joylashuv; eng katta shriftda sinash (FD) |
| `Null check operator used on a null value` | `AppLocalizations.of(context)!` `MaterialApp` dan tashqarida — FD: ilova ishga tushmaguncha `null` | Faqat `MaterialApp` ichidagi widget'larda; ilova nomi uchun `onGenerateTitle` |
| `ambiguous_import: GlobalMaterialLocalizations` | `material_ui` va `flutter_localizations` ikkalasi import qilingan | `material_ui` bilan `flutter_localizations` ni import qilmang |
| Kutilmagan til ochildi | Mos til yo'q — `supportedLocales` dagi birinchisi olinadi | Asosiy tilni ro'yxat boshiga qo'ying (7-mashq) |

## Amaliyot

1. FD bo'yicha bosiladigan joy va kontrast uchun eng kichik qiymatlar qancha?
2. Ekran o'quvchi nimani o'qiydi? Ikonli tugmaga nom qanday beriladi?
3. `meetsGuideline` qaysi to'rt qoidani tekshiradi? Testda nima uchun `ensureSemantics()` kerak?
4. `.arb` faylda o'rinbosar va ko'plik qanday yoziladi?
5. `material_ui` ishlatiladigan loyihada `GlobalMaterialLocalizations` qayerdan olinadi?
6. Nega `MaterialApp` ning `title` i o'rniga `onGenerateTitle`?
7. Qo'llanmagan tilda (masalan, rus) ilova o'zbekcha ochilsin. Nima o'zgaradi? Testdagi "Qo'llanmagan til" nima chiqaradi?

<details>
<summary>Javoblar</summary>

1. Bosiladigan joy: Android 48×48 dp, iOS 44×44 pt (FD tekshiruv ro'yxatida — 48×48). Kontrast: kichik matn 4.5:1, katta
   matn 3:1.
2. Semantika daraxtini — element turi va nomi. Ikonli tugmaga `tooltip` (yoki `Semantics(label: …)`).
3. `androidTapTargetGuideline`, `iOSTapTargetGuideline`, `labeledTapTargetGuideline`, `textContrastGuideline`. FD:
   `ensureSemantics()` testda semantika daraxtini yoqadi (oxirida `handle.dispose()`).
4. O'rinbosar: `"Xush kelibsiz, {ism}!"` va `@kalit.placeholders.ism.type`. Ko'plik: `{soni, plural, =0{…} other{…}}`.
5. `material_ui` ning o'zidan (`package:material_ui/material_ui.dart`); `flutter_localizations` dagisi 3.47 dan beri
   eskirgan (deprecated).
6. `title` — oddiy satr, uni yozish uchun `context` va tarjimalar yo'q. API: `onGenerateTitle` ga beriladigan `context`
   da `Localizations` bor — shuning uchun nom tarjima qilinadi.
7. `supportedLocales: AppLocalizations.supportedLocales` o'rniga `supportedLocales: const [Locale('uz'), Locale('en')]` —
   o'zbek birinchi. VPS'dagi test: `[ru] sarlavha: Kitob do'koni`.

</details>

## Rasmiy hujjat

- [FD: Accessibility](https://docs.flutter.dev/ui/accessibility)
- [FD: UI design & styling (accessibility)](https://docs.flutter.dev/ui/accessibility/ui-design-and-styling)
- [FD: Assistive technologies](https://docs.flutter.dev/ui/accessibility/assistive-technologies)
- [FD: Accessibility testing](https://docs.flutter.dev/ui/accessibility/accessibility-testing)
- [FD: Internationalizing Flutter apps](https://docs.flutter.dev/ui/internationalization)
- [API: Semantics](https://api.flutter.dev/flutter/widgets/Semantics-class.html) · [AccessibilityGuideline](https://api.flutter.dev/flutter/flutter_test/AccessibilityGuideline-class.html) · [IconButton.tooltip](https://api.flutter.dev/flutter/material/IconButton/tooltip.html) · [basicLocaleListResolution](https://api.flutter.dev/flutter/widgets/basicLocaleListResolution.html)
