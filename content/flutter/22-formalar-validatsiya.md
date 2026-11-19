# 22 — Formalar va validatsiya

[Mundarija](README.md)

## Tushuncha

### Matn maydonlari: `TextField` va `TextFormField`

FD (Create and style a text field): Flutter'da ikki Material matn maydoni bor.

| | `TextField` | `TextFormField` |
| --- | --- | --- |
| Nima | eng ko'p ishlatiladigan matn kiritish widget'i | ichida `TextField`, ustiga `Form` bilan bog'lanish |
| Tekshirish (validatsiya) | yo'q | `validator`, `Form` orqali |
| Qachon | qidiruv, chat, alohida maydon | forma ichidagi maydon |

Ko'rinish `decoration: InputDecoration(…)` bilan beriladi: `labelText` (sarlavha), `hintText` (namuna), `helperText`
(pastdagi izoh), `errorText` (xato), `border`. FD: standartda maydon ostida chiziq bo'ladi; `decoration: null` bilan
bezakni butunlay olib tashlash mumkin.

### Matnni o'qish: `TextEditingController`

FD (Retrieve the value of a text field): maydondagi matnni olish uchun **`TextEditingController`** yaratiladi va
`controller:` ga beriladi. Matn — `controller.text`.

O'zgarishni kuzatishning ikki yo'li (FD, Handle changes to a text field):

| Yo'l | Qachon |
| --- | --- |
| `onChanged: (matn) { … }` | eng oddiy: har o'zgarishda chaqiriladi |
| `controller.addListener(…)` | kuchliroq: controller'ni boshqa joyda ham tinglash mumkin |

Muhim qoidalar (FD):

- Controller ishi tugagach **`dispose()`** chaqiriladi — u egallagan resurslar bo'shaydi. Shuning uchun controller
  `StatefulWidget` ning `State` ida yashaydi va `dispose()` metodida tozalanadi (14-bob).
- Foydalanuvchi matnini sanashda **`characters`** ishlatiladi: matnda murakkab belgilar (emoji va boshqalar) bo'lishi
  mumkin, `characters` har belgini foydalanuvchi ko'rgandek sanaydi (pastdagi testda farq ko'rinadi).

API (`TextFormField`): `controller` berilsa, `initialValue` `null` bo'lishi kerak — boshlang'ich matnni controller'ning
o'ziga yozing.

### Forma: `Form`, `GlobalKey` va `validator`

FD (Build a form with validation), uch qadam:

1. **`Form`** — bir nechta maydonni guruhlab tekshiradigan konteyner. Unga **`GlobalKey<FormState>`** beriladi. FD:
   kalitni `State` da bir marta yaratish kerak — `GlobalKey` ni har `build` da qayta yaratish qimmat.
2. Har **`TextFormField`** ga **`validator`**: qiymat noto'g'ri bo'lsa xato matnini (`String`), to'g'ri bo'lsa
   **`null`** qaytaradi.
3. Tugmada `_formKey.currentState!.validate()`. U har maydonning `validator` ini chaqiradi: hammasi to'g'ri — `true`;
   biror xato bo'lsa formani xatolar bilan qayta quradi va `false` qaytaradi.

API (`FormState`): `save()` — har maydonning `onSaved` ini chaqiradi; `reset()` — maydonlarni `initialValue` ga
qaytaradi.

**Avtomatik tekshirish** — `Form` yoki maydonning `autovalidateMode` i (API, `AutovalidateMode`):

| Qiymat | Qachon tekshiradi |
| --- | --- |
| `disabled` (standart) | faqat `validate()` chaqirilganda |
| `always` | doim, foydalanuvchi tegmasa ham |
| `onUserInteraction` | har o'zgarishdan keyin |
| `onUnfocus` | maydondan fokus ketganda |
| `onUserInteractionIfError` | har o'zgarishda, lekin faqat maydonda xato bo'lsa |

Oxirgisi qulay: foydalanuvchi yozayotganda oldindan qizil xato chiqmaydi, lekin "Yuborish"dan keyin chiqqan xato
tuzatilishi bilan yo'qoladi.

### Fokus

FD (Focus and text fields): tanlangan va matn qabul qilayotgan maydon **fokus**da (focus) deyiladi.

- `autofocus: true` — ekran ochilishi bilan fokus shu maydonda.
- Fokusni kod bilan berish: **`FocusNode`** yaratib, maydonning `focusNode:` iga berish va `requestFocus()` chaqirish.
  FD: `FocusNode` uzoq yashaydigan obyekt — `initState` da yaratib, `dispose` da tozalanadi.

Klaviatura (API): `keyboardType` — qaysi klaviatura (`TextInputType.phone`, `emailAddress`, `number` …);
`textInputAction` — klaviaturadagi asosiy tugma ("keyingi", "tayyor" …), bosilganda `onFieldSubmitted` chaqiriladi.

### Snackbar

FD (Display a snackbar): qisqa xabar uchun Material'da **`SnackBar`**. U `ScaffoldMessenger.of(context).showSnackBar(…)`
bilan ko'rsatiladi; `Scaffold` uni ekran pastida, boshqa muhim widget'larni yopmasdan joylaydi. `action:` ga
`SnackBarAction` — masalan, "Bekor qilish" (undo).

## Ko'rib chiqamiz

Buyurtma formasi: ism, telefon (tekshiriladi), ixtiyoriy izoh (belgilar soni bilan) va yuborish tugmasi.

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
      home: Scaffold(
        appBar: AppBar(title: const Text('Buyurtma')),
        body: const BuyurtmaFormasi(),
      ),
    );
  }
}

class BuyurtmaFormasi extends StatefulWidget {
  const BuyurtmaFormasi({super.key});

  @override
  State<BuyurtmaFormasi> createState() => _BuyurtmaFormasiState();
}

class _BuyurtmaFormasiState extends State<BuyurtmaFormasi> {
  // Formani tekshirish uchun kalit — build'da emas, State'da bir marta yaratiladi
  final _formKey = GlobalKey<FormState>();

  // Matnni o'qish uchun controller'lar
  final _ism = TextEditingController();
  final _telefon = TextEditingController();
  final _izoh = TextEditingController();

  // Fokusni boshqarish uchun
  late final FocusNode _telefonFokus;

  @override
  void initState() {
    super.initState();
    _telefonFokus = FocusNode();
    // Izoh o'zgarganda belgilar sonini yangilash
    _izoh.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    // Controller va FocusNode — uzoq yashaydigan obyektlar, o'zimiz tozalaymiz
    _ism.dispose();
    _telefon.dispose();
    _izoh.dispose();
    _telefonFokus.dispose();
    super.dispose();
  }

  String? _telefonniTekshir(String? qiymat) {
    final raqam = (qiymat ?? '').replaceAll(' ', '');
    if (raqam.isEmpty) return 'Telefon raqamini kiriting';
    if (!RegExp(r'^\+998\d{9}$').hasMatch(raqam)) return 'Format: +998 90 123 45 67';
    return null;
  }

  void _yubor() {
    // validate() har maydonning validator'ini chaqiradi; xato bo'lsa formani qayta quradi
    if (!_formKey.currentState!.validate()) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Qabul qilindi: ${_ism.text}, ${_telefon.text}'),
        action: SnackBarAction(
          label: 'Bekor qilish',
          onPressed: () {
            _ism.clear();
            _telefon.clear();
            _izoh.clear();
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      // Birinchi xatodan keyin har o'zgarishda qayta tekshiradi
      autovalidateMode: AutovalidateMode.onUserInteractionIfError,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextFormField(
            controller: _ism,
            autofocus: true,
            textInputAction: TextInputAction.next,
            // Klaviaturadagi "keyingi" tugmasi — fokus telefonga o'tadi
            onFieldSubmitted: (_) => _telefonFokus.requestFocus(),
            decoration: const InputDecoration(labelText: 'Ism', border: OutlineInputBorder()),
            validator: (q) => (q == null || q.trim().isEmpty) ? 'Ismni kiriting' : null,
          ),
          const SizedBox(height: 12),
          TextFormField(
            controller: _telefon,
            focusNode: _telefonFokus,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Telefon',
              hintText: '+998 90 123 45 67',
              border: OutlineInputBorder(),
            ),
            validator: _telefonniTekshir,
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _izoh,
            maxLines: 2,
            decoration: InputDecoration(
              labelText: 'Izoh (ixtiyoriy)',
              border: const OutlineInputBorder(),
              // FD: foydalanuvchi matnini characters bilan sanash
              helperText: '${_izoh.text.characters.length}/100 belgi',
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: _yubor, child: const Text('Buyurtma berish')),
        ],
      ),
    );
  }
}
```

E'tibor bering:

- Ism va telefon — `TextFormField` (tekshiriladi), izoh — oddiy `TextField` (`Form` uni tekshirmaydi).
- `validator` xato bo'lmasa **`null`** qaytaradi, bo'sh satr emas (pastdagi "Tipik xatolar").
- To'rtta uzoq yashaydigan obyekt (3 controller, 1 `FocusNode`) — to'rttasi ham `dispose()` da tozalanadi.

Testlar (`test/widget_test.dart`). Matn `tester.enterText` bilan yoziladi, klaviatura tugmasi —
`tester.testTextInput.receiveAction`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  final ism = find.widgetWithText(TextFormField, 'Ism');
  final telefon = find.widgetWithText(TextFormField, 'Telefon');
  final yubor = find.text('Buyurtma berish');

  testWidgets('Bo\'sh forma yuborilmaydi', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.tap(yubor);
    await tester.pump();
    expect(find.text('Ismni kiriting'), findsOneWidget);
    expect(find.text('Telefon raqamini kiriting'), findsOneWidget);
    expect(find.byType(SnackBar), findsNothing);
    debugPrint('xatolar: Ismni kiriting | Telefon raqamini kiriting');
  });

  testWidgets('Xato telefon, keyin to\'g\'ri — snackbar', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.enterText(ism, 'Ali');
    await tester.enterText(telefon, '90 123');
    await tester.tap(yubor);
    await tester.pump();
    expect(find.text('Format: +998 90 123 45 67'), findsOneWidget);

    // Xato bor — onUserInteractionIfError endi har o'zgarishda tekshiradi
    await tester.enterText(telefon, '+998 90 123 45 67');
    await tester.pump();
    expect(find.text('Format: +998 90 123 45 67'), findsNothing);
    debugPrint('to\'g\'ri raqam yozilishi bilan xato yo\'qoldi');

    await tester.tap(yubor);
    await tester.pumpAndSettle(); // snackbar chiqish animatsiyasi tugasin
    final xabar = tester.widget<Text>(find.descendant(of: find.byType(SnackBar), matching: find.byType(Text)).first);
    debugPrint('snackbar: ${xabar.data}');

    await tester.tap(find.text('Bekor qilish'));
    await tester.pumpAndSettle();
    debugPrint('Bekor qilishdan keyin ism: "${tester.widget<TextFormField>(ism).controller!.text}"');
  });

  testWidgets('Fokus: autofocus va "keyingi" tugmasi', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.pump();
    EditableText maydon(Finder f) => tester.widget<EditableText>(find.descendant(of: f, matching: find.byType(EditableText)));
    debugPrint('boshida fokus Ism\'da: ${maydon(ism).focusNode.hasFocus}');
    await tester.enterText(ism, 'Ali');
    await tester.testTextInput.receiveAction(TextInputAction.next);
    await tester.pump();
    debugPrint('next\'dan keyin fokus Telefon\'da: ${maydon(telefon).focusNode.hasFocus}');
    debugPrint('telefon klaviaturasi: ${maydon(telefon).keyboardType}');
  });

  testWidgets('Izoh: belgilar soni characters bilan', (tester) async {
    await tester.pumpWidget(const DokonApp());
    const matn = 'Rahmat 👍🏽';
    await tester.enterText(find.widgetWithText(TextField, 'Izoh (ixtiyoriy)'), matn);
    await tester.pump();
    debugPrint('String.length = ${matn.length}, characters.length = ${matn.characters.length}');
    expect(find.text('8/100 belgi'), findsOneWidget);
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 4.7s)
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Bo'sh forma yuborilmaydi
xatolar: Ismni kiriting | Telefon raqamini kiriting
00:02 +1: Xato telefon, keyin to'g'ri — snackbar
to'g'ri raqam yozilishi bilan xato yo'qoldi
snackbar: Qabul qilindi: Ali, +998 90 123 45 67
Bekor qilishdan keyin ism: ""
00:04 +2: Fokus: autofocus va "keyingi" tugmasi
boshida fokus Ism'da: true
next'dan keyin fokus Telefon'da: true
telefon klaviaturasi: TextInputType(name: TextInputType.phone, signed: null, decimal: null, password: null)
00:04 +3: Izoh: belgilar soni characters bilan
String.length = 11, characters.length = 8
00:04 +4: All tests passed!
```

Natijada:

- Bo'sh forma yuborilmadi: ikkala `validator` xato qaytardi, snackbar chiqmadi.
- Noto'g'ri telefon xato berdi. To'g'ri raqam yozilishi bilan xato **o'zi yo'qoldi** — `onUserInteractionIfError`
  maydonda xato borligi uchun qayta tekshirdi. "Bekor qilish" maydonlarni tozaladi.
- `autofocus` ekran ochilishi bilan ismga fokus berdi; "keyingi" tugmasi fokusni telefonga o'tkazdi.
- `'Rahmat 👍🏽'` — ekranda 8 belgi, lekin `String.length` **11**: rangli emoji bir nechta kod birligidan iborat.
  `characters.length` to'g'ri — 8. Shuning uchun FD foydalanuvchi matnini `characters` bilan sanashni aytadi.

Brauzerda (`flutter build web`). Chapda — bo'sh forma yuborilgandan keyin xatolar; o'ngda — to'ldirilgan forma va
snackbar. Izohdagi "Tez yetkazing 🙏" — 15 belgi, emoji bitta belgi sifatida sanalgan:

<img src="/rasmlar/flutter/22-xatolar.png" alt="Bo'sh forma: Ism va Telefon maydonlari qizil, ostida 'Ismni kiriting' va 'Telefon raqamini kiriting'" width="300"> <img src="/rasmlar/flutter/22-yuborildi.png" alt="To'ldirilgan forma va pastda 'Qabul qilindi: Ali, +998 90 123 45 67' snackbar'i, 'Bekor qilish' tugmasi bilan" width="300">

Diqqat: snackbar'dagi "Bekor qilish" bu misolda faqat maydonlarni tozalaydi. Haqiqiy ilovada u yuborilgan buyurtmani ham
bekor qilishi kerak (masalan, serverga so'rov).

## Tipik xatolar

### `validator` xato bo'lmasa bo'sh satr qaytaradi

```dart
validator: (q) => q!.length < 2 ? 'Kamida 2 harf' : '', // xato: null bo'lishi kerak
```

`initialValue: 'Ali'` — 3 harf, ya'ni qiymat to'g'ri:

```text vps
$ flutter test test/xato_test.dart
…
00:00 +0 -1: 2. validator bo'sh satr qaytaradi
validate() = false, ekrandagi xato matni: ""
```

Forma **yuborilmadi** (`validate()` = `false`), lekin ekranda hech qanday xato matni yo'q — foydalanuvchi nima
bo'lganini tushunmaydi. FD: xato bo'lmasa `validator` **`null`** qaytarishi shart. Sinov ko'rsatdiki, bo'sh satr ham
"xato" hisoblanadi.

### `controller` va `initialValue` birga

```dart
TextFormField(controller: TextEditingController(), initialValue: 'Ali')
```

```text vps
00:00 +0: 1. controller va initialValue birga
══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞════════════════════════════════════════════════════
The following assertion was thrown running a test:
'package:material_ui/src/text_form_field.dart': Failed assertion: line 211 pos 15: 'initialValue ==
null || controller == null': is not true.
```

(Stek izi qisqartirildi.) Boshlang'ich matnni controller'ga bering: `TextEditingController(text: 'Ali')`.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Forma yuborilmaydi, xato matni ko'rinmaydi | `validator` to'g'ri qiymatda `''` qaytaradi | `null` qaytarish |
| `'initialValue == null \|\| controller == null': is not true` | Ikkalasi birga berilgan | Boshlang'ich matn — controller'da |
| `GlobalKey<FormState>()` `build` ichida | FD: har `build` da yangi `GlobalKey` yaratish qimmat | `State` maydoni sifatida bir marta |
| Controller yoki `FocusNode` `dispose()` qilinmaydi | FD: resurslar bo'shamaydi | `State.dispose()` da tozalash |
| `TextField` ni `Form` ichiga qo'yib, tekshirilishini kutish | `Form` faqat `FormField` larni (`TextFormField`) tekshiradi | `TextFormField` + `validator` |
| Matn uzunligi `text.length` bilan | Emoji va murakkab belgilar noto'g'ri sanaladi | `text.characters.length` |
| Telefon maydonida oddiy klaviatura | `keyboardType` berilmagan | `TextInputType.phone` |
| `always` bilan forma ochilishi bilan qizil xatolar | Foydalanuvchi hali hech narsa yozmagan | `onUserInteractionIfError` yoki `onUnfocus` |

## Amaliyot

1. `TextField` va `TextFormField` farqi nima?
2. Maydondagi matnni olishning va o'zgarishini kuzatishning qanday yo'llari bor?
3. Nega `GlobalKey<FormState>` `State` da yaratiladi?
4. `validate()` nima qiladi va nima qaytaradi?
5. `AutovalidateMode.onUserInteraction` va `onUserInteractionIfError` farqi nima?
6. Ism yozilib "keyingi" bosilganda fokusni telefonga qanday o'tkazasiz?
7. Formaga e-pochta maydonini qo'shing: `@` va nuqta bo'lmasa — "E-pochta noto'g'ri", e-pochta klaviaturasi bilan.

<details>
<summary>Javoblar</summary>

1. `TextField` — oddiy matn maydoni; `TextFormField` — `TextField` + `Form` bilan bog'lanish (`validator`, `onSaved`).
2. `TextEditingController` va `controller.text`; o'zgarish — `onChanged` yoki `controller.addListener`.
3. FD: `GlobalKey` ni har `build` da yaratish qimmat; `State` da bir marta yaratilib, keyin formaga murojaat qilish uchun ishlatiladi.
4. Har maydonning `validator` ini chaqiradi; xato bo'lsa formani xatolar bilan qayta quradi. Hammasi to'g'ri — `true`, aks holda `false`.
5. `onUserInteraction` — har o'zgarishdan keyin doim; `onUserInteractionIfError` — faqat maydonda xato bo'lsa.
6. Telefonga `FocusNode` berib, ism maydonida `textInputAction: TextInputAction.next` va `onFieldSubmitted: (_) => fokus.requestFocus()`.
7. `TextFormField(keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'E-pochta'), validator: (q) => (q != null && q.contains('@') && q.contains('.')) ? null : 'E-pochta noto\'g\'ri')`. VPS'dagi testda: `ali` → `false`, `ali@pochta` → `false`, `ali@pochta.uz` → `true`.

</details>

## Rasmiy hujjat

- [FD: Create and style a text field](https://docs.flutter.dev/cookbook/forms/text-input)
- [FD: Retrieve the value of a text field](https://docs.flutter.dev/cookbook/forms/retrieve-input)
- [FD: Handle changes to a text field](https://docs.flutter.dev/cookbook/forms/text-field-changes)
- [FD: Build a form with validation](https://docs.flutter.dev/cookbook/forms/validation)
- [FD: Focus and text fields](https://docs.flutter.dev/cookbook/forms/focus)
- [FD: Display a snackbar](https://docs.flutter.dev/cookbook/design/snackbars)
- [API: AutovalidateMode](https://api.flutter.dev/flutter/widgets/AutovalidateMode.html) · [FormState](https://api.flutter.dev/flutter/widgets/FormState-class.html)
- [API: TextFormField](https://pub.dev/documentation/material_ui/latest/material_ui/TextFormField/TextFormField.html)
