# 32 — Ma'lumotni saqlash

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: `shared_preferences` 2.5.6, `path_provider` 2.1.6, `sqflite` 2.4.6.
> `sqflite` Linux'da ishlamaydi — testlarda haqiqiy SQLite `sqflite_common_ffi` 2.4.7 orqali. Skrinshotlar `flutter build web`
> dan (web'da faqat `shared_preferences` ishlaydi).

## Tushuncha

### Qaysi birini tanlash

Ilova yopilganda xotiradagi hamma narsa yo'qoladi (28-bobdagi holat ham). Saqlab qolish uchun ma'lumot diskka yoki serverga
yoziladi. FD (Choose a database): Flutter'da o'rnatilgan baza yo'q — ma'lumot shakli va qayerda yashashiga qarab tanlanadi:

| Variant | Ma'lumot modeli | Qayerda | Paket (FD) |
| --- | --- | --- | --- |
| Kalit-qiymat | kalit → oddiy qiymat | faqat qurilmada | `shared_preferences` |
| Fayl | ixtiyoriy matn/bayt | qurilmada | `path_provider` + `dart:io` |
| SQLite | relyatsion (jadvallar) | qurilmada | `sqflite` (to'g'ridan-to'g'ri SQL) yoki `drift` |
| Bulutli baza | hujjatlar (NoSQL) yoki relyatsion | bulutda, sinxronlanadi | `cloud_firestore`, `firebase_data_connect` |

FD bo'yicha qisqa qoidalar:

- **Kalit-qiymat** — oz va oddiy ma'lumot: foydalanuvchi sozlamalari. Maxfiy ma'lumot (masalan, autentifikatsiya tokeni) uchun
  — `flutter_secure_storage`.
- **SQLite** — ko'proq tuzilgan, relyatsion ma'lumot.
- **Qurilmadagi** baza va kalit-qiymat ma'lumoti boshqa qurilmalarga sinxronlanmaydi; zaxira yoki sinxronlash bo'lmasa, ilova
  o'chirilganda yo'qoladi. Foydalanuvchi ma'lumotini telefon almashtirganda ham kutsa — bulutli baza.
- Bittasini tanlash shart emas — birga ishlatish mumkin.

### `shared_preferences`

FD (Store key-value data on disk):

- `SharedPreferences.getInstance()` → `setInt`, `setBool`, `setString` ... va `getInt`, `getBool` ... (`null` — kalit yo'q).
- Setter avval xotiradagi qiymatni darhol yangilaydi, keyin diskka yozadi.
- Getter saqlangan qiymat turi boshqacha bo'lsa — istisno tashlaydi.
- `remove(kalit)` — o'chirish.

Cheklovlar (FD): faqat `int`, `double`, `bool`, `String`, `List<String>`; katta ma'lumot uchun mo'ljallanmagan; ilova qayta
ishga tushganda saqlanishiga **kafolat yo'q**.

Testda — `SharedPreferences.setMockInitialValues({...})`: xotiradagi soxta ombor (FD).

### Fayl

FD (Read and write files): `path_provider` plagini + `dart:io`. Ikki papka:

- **vaqtinchalik** (`getTemporaryDirectory`) — kesh, tizim istalgan payt tozalashi mumkin;
- **hujjatlar** (`getApplicationDocumentsDirectory`) — faqat shu ilova kira oladi, ilova o'chirilgandagina tozalanadi.

FD: bu retsept hozircha **web'da ishlamaydi**.

### SQLite: `sqflite`

FD (Persist data with SQLite):

- `openDatabase(join(await getDatabasesPath(), 'fayl.db'), onCreate: ..., version: 1)` — `onCreate` baza birinchi yaratilganda
  jadvalni yaratadi; `version` keyinchalik bazani yangilash (upgrade) yo'lini beradi. `join` (`path` paketi) — har platformada
  to'g'ri yo'l.
- Model `toMap()` — kalitlar ustun nomlari bilan bir xil.
- `insert` (`conflictAlgorithm: ConflictAlgorithm.replace` — shu `id` bor bo'lsa almashtiradi), `query`, `update`, `delete`.
- **Har doim `whereArgs`**: `where: 'id = ?', whereArgs: [id]`. FD: satr ichiga qo'shish (`where: "id = ${dog.id}"`) — SQL
  injection xavfi.
- FD: `sqflite` **faqat macOS, iOS va Android** da ishlaydi.

`runApp` dan oldin plagin chaqirilsa, avval `WidgetsFlutterBinding.ensureInitialized()` (FD SQLite misolidagi kabi).

### Linux'da test: `sqflite_common_ffi`

`sqflite` Linux'da yo'q — bizning sinov VPS'ida ham. `sqflite_common_ffi` paketi (o'sha `sqflite` muallifidan, pub.dev: "desktop
va unit testlar uchun") haqiqiy SQLite'ni FFI orqali ishlatadi. Testda: `sqfliteFfiInit(); databaseFactory = databaseFactoryFfi;`
— shundan keyin `sqflite` ning `openDatabase` i ishlaydi. Kod o'zgarmaydi.

## Ko'rib chiqamiz

Uch xil saqlash, har biri o'z klassida:

| Klass | Nima | Qayerda |
| --- | --- | --- |
| `Sozlamalar` | qorong'i mavzu, ilova necha marta ochilgan | `shared_preferences` |
| `Eslatmalar` | kitob haqidagi matnli eslatmalar | fayl |
| `KitobBazasi` | kitoblar jadvali | SQLite |

```text vps
$ flutter pub add shared_preferences path_provider sqflite path dev:sqflite_common_ffi
...
+ path_provider 2.1.6
+ shared_preferences 2.5.6
+ sqflite 2.4.6
+ sqflite_common_ffi 2.4.7
Changed 44 dependencies!
```

### Kalit-qiymat: `lib/saqlash/sozlamalar.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';

/// Kichik kalit-qiymat sozlamalar (shared_preferences)
class Sozlamalar {
  Sozlamalar(this._prefs);

  final SharedPreferences _prefs;

  static Future<Sozlamalar> yukla() async => Sozlamalar(await SharedPreferences.getInstance());

  bool get qorongi => _prefs.getBool('qorongi') ?? false;
  Future<void> qorongiQil(bool qiymat) => _prefs.setBool('qorongi', qiymat);

  int get ochilishlar => _prefs.getInt('ochilishlar') ?? 0;
  Future<void> ochilishniSana() => _prefs.setInt('ochilishlar', ochilishlar + 1);

  Future<void> tozala() => _prefs.clear();
}
```

### Fayl: `lib/saqlash/eslatmalar.dart`

Papka konstruktordan beriladi. Ilovada `Eslatmalar(await getApplicationDocumentsDirectory())`, testda — vaqtinchalik papka
(sababini "Tipik xatolar"da ko'rasiz).

```dart
import 'dart:io';

/// Matnli fayl: kitob eslatmalari. Papka tashqaridan beriladi —
/// ilovada path_provider'dan, testda vaqtinchalik papkadan.
class Eslatmalar {
  Eslatmalar(this.papka);

  final Directory papka;

  File get _fayl => File('${papka.path}/eslatmalar.txt');

  Future<void> qosh(String matn) => _fayl.writeAsString('$matn\n', mode: FileMode.append);

  Future<List<String>> hammasi() async {
    try {
      return (await _fayl.readAsLines()).where((q) => q.isNotEmpty).toList();
    } on FileSystemException {
      return []; // fayl hali yo'q
    }
  }
}
```

### SQLite: `lib/saqlash/kitob_bazasi.dart`

```dart
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class Kitob {
  const Kitob({this.id, required this.nom, required this.narx});

  final int? id;
  final String nom;
  final int narx;

  // Kalitlar jadval ustunlari bilan bir xil (FD)
  Map<String, Object?> toMap() => {'id': id, 'nom': nom, 'narx': narx};

  factory Kitob.fromMap(Map<String, Object?> m) =>
      Kitob(id: m['id'] as int, nom: m['nom'] as String, narx: m['narx'] as int);

  @override
  String toString() => '$id:$nom:$narx';
}

/// SQLite (sqflite): tuzilgan, ko'p ma'lumot uchun
class KitobBazasi {
  KitobBazasi._(this._db);

  final Database _db;

  static Future<KitobBazasi> och(String yol) async {
    final db = await openDatabase(
      yol,
      version: 1,
      onCreate: (db, version) => db.execute(
        'CREATE TABLE kitoblar(id INTEGER PRIMARY KEY, nom TEXT NOT NULL, narx INTEGER NOT NULL)',
      ),
    );
    return KitobBazasi._(db);
  }

  /// Qurilmadagi standart joy: getDatabasesPath() + fayl nomi
  static Future<KitobBazasi> standart() async => och(join(await getDatabasesPath(), 'kitoblar.db'));

  Future<int> qosh(Kitob k) => _db.insert('kitoblar', k.toMap(), conflictAlgorithm: ConflictAlgorithm.replace);

  Future<List<Kitob>> hammasi() async => [for (final m in await _db.query('kitoblar', orderBy: 'id')) Kitob.fromMap(m)];

  Future<List<Kitob>> arzon(int chegara) async =>
      [for (final m in await _db.query('kitoblar', where: 'narx < ?', whereArgs: [chegara])) Kitob.fromMap(m)];

  Future<int> yangila(Kitob k) => _db.update('kitoblar', k.toMap(), where: 'id = ?', whereArgs: [k.id]);

  Future<int> ochir(String nom) => _db.delete('kitoblar', where: 'nom = ?', whereArgs: [nom]);

  Future<void> yop() => _db.close();
}
```

### Ilova: `lib/main.dart`

Web'da ishlaydigan qismi — sozlamalar:

```dart
import 'package:material_ui/material_ui.dart';

import 'saqlash/sozlamalar.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized(); // plaginlar runApp'dan oldin
  final sozlamalar = await Sozlamalar.yukla();
  await sozlamalar.ochilishniSana();
  runApp(DokonApp(sozlamalar: sozlamalar));
}

class DokonApp extends StatefulWidget {
  const DokonApp({super.key, required this.sozlamalar});

  final Sozlamalar sozlamalar;

  @override
  State<DokonApp> createState() => _DokonAppState();
}

class _DokonAppState extends State<DokonApp> {
  late bool _qorongi = widget.sozlamalar.qorongi;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal, brightness: Brightness.dark),
      ),
      themeMode: _qorongi ? ThemeMode.dark : ThemeMode.light,
      home: Scaffold(
        appBar: AppBar(title: const Text('Sozlamalar')),
        body: ListView(
          children: [
            SwitchListTile(
              title: const Text('Qorong\'i mavzu'),
              value: _qorongi,
              onChanged: (v) {
                setState(() => _qorongi = v);
                widget.sozlamalar.qorongiQil(v); // diskka
              },
            ),
            ListTile(
              title: const Text('Ilova ochilgan'),
              trailing: Text('${widget.sozlamalar.ochilishlar} marta'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Testlar

`test/sozlamalar_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';
import 'package:salom/saqlash/sozlamalar.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  setUp(() => SharedPreferences.setMockInitialValues(<String, Object>{'ochilishlar': 2}));

  test('O\'qish va yozish', () async {
    final s = await Sozlamalar.yukla();
    debugPrint('boshida: qorongi=${s.qorongi}, ochilishlar=${s.ochilishlar}');
    await s.qorongiQil(true);
    await s.ochilishniSana();
    final yangi = await Sozlamalar.yukla(); // qayta yuklaymiz
    debugPrint('keyin: qorongi=${yangi.qorongi}, ochilishlar=${yangi.ochilishlar}');
  });

  testWidgets('Kalit bosilsa — saqlanadi', (tester) async {
    await tester.pumpWidget(DokonApp(sozlamalar: await Sozlamalar.yukla()));
    await tester.tap(find.byType(Switch));
    await tester.pumpAndSettle(); // mavzu almashishi animatsiyasi
    final prefs = await SharedPreferences.getInstance();
    debugPrint('ekranda: ${Theme.of(tester.element(find.byType(ListView))).brightness}, diskda: qorongi=${prefs.getBool('qorongi')}');
  });
}
```

```text vps
$ flutter test test/sozlamalar_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/sozlamalar_test.dart
00:00 +0: O'qish va yozish
boshida: qorongi=false, ochilishlar=2
keyin: qorongi=true, ochilishlar=3
00:00 +1: Kalit bosilsa — saqlanadi
ekranda: Brightness.dark, diskda: qorongi=true
00:02 +2: All tests passed!
```

`test/eslatmalar_test.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:salom/saqlash/eslatmalar.dart';

void main() {
  test('Faylga yozish va qayta o\'qish', () async {
    final papka = await Directory.systemTemp.createTemp('eslatma');
    addTearDown(() => papka.delete(recursive: true));

    debugPrint('fayl yo\'q: ${await Eslatmalar(papka).hammasi()}');
    await Eslatmalar(papka).qosh('Toza kod: 3-bobni qayta o\'qish');
    await Eslatmalar(papka).qosh('Dart tili: misollarni yozib ko\'rish');
    debugPrint('yangi obyekt o\'qidi: ${await Eslatmalar(papka).hammasi()}');
    debugPrint('fayl: ${File('${papka.path}/eslatmalar.txt').lengthSync()} bayt');
  });
}
```

```text vps
$ flutter test test/eslatmalar_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/eslatmalar_test.dart
00:00 +0: Faylga yozish va qayta o'qish
fayl yo'q: []
yangi obyekt o'qidi: [Toza kod: 3-bobni qayta o'qish, Dart tili: misollarni yozib ko'rish]
fayl: 67 bayt
00:00 +1: All tests passed!
```

`test/baza_test.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:salom/saqlash/kitob_bazasi.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  // Linux'da sqflite plagini yo'q — testda FFI orqali haqiqiy SQLite
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  });

  test('CRUD va qayta ochish', () async {
    final papka = await Directory.systemTemp.createTemp('baza');
    final yol = '${papka.path}/kitoblar.db';

    var baza = await KitobBazasi.och(yol);
    await baza.qosh(const Kitob(nom: 'Dart tili', narx: 45000));
    await baza.qosh(const Kitob(nom: 'Toza kod', narx: 80000));
    await baza.qosh(const Kitob(nom: 'Algoritmlar', narx: 60000));
    debugPrint('hammasi: ${await baza.hammasi()}');
    debugPrint('arzon (< 70000): ${await baza.arzon(70000)}');

    await baza.yangila(const Kitob(id: 2, nom: 'Toza kod', narx: 75000));
    await baza.qosh(const Kitob(id: 1, nom: 'Dart tili (2-nashr)', narx: 50000)); // id bor — replace
    await baza.ochir('Algoritmlar');
    await baza.yop();

    baza = await KitobBazasi.och(yol); // diskdan qayta
    debugPrint('qayta ochildi: ${await baza.hammasi()}');
    await baza.yop();
    await papka.delete(recursive: true);
  });
}
```

```text vps
$ flutter test test/baza_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/baza_test.dart
00:00 +0: (setUpAll)
00:00 +0: CRUD va qayta ochish
hammasi: [1:Dart tili:45000, 2:Toza kod:80000, 3:Algoritmlar:60000]
arzon (< 70000): [1:Dart tili:45000, 3:Algoritmlar:60000]
qayta ochildi: [1:Dart tili (2-nashr):50000, 2:Toza kod:75000]
00:00 +1: (tearDownAll)
00:00 +1: All tests passed!
```

Natijada:

- **Sozlamalar** qayta yuklangandan keyin ham bor (`qorongi=true`, `ochilishlar=3`); widget testida kalit bosilganda ekran ham,
  "disk" ham o'zgardi.
- **Fayl**: avval yo'q — bo'sh ro'yxat (istisno emas); yozilgandan keyin boshqa obyekt ham o'qidi.
- **SQLite**: `where: 'narx < ?'` bilan filtr; `id: 1` bilan `insert` — `replace` tufayli yangi qator emas, almashtirish; baza
  yopilib, fayldan qayta ochilganda o'zgarishlar joyida.

### Brauzerda

Web'da `shared_preferences` brauzerning `localStorage` iga yozadi (pastdagi chiqishda ko'rinadi). Chapda — birinchi ochilish, qorong'i mavzu yoqildi; o'ngda — sahifa
qayta yuklangandan keyin (mavzu saqlangan, hisoblagich 2):

<img src="/rasmlar/flutter/32-birinchi.png" alt="Sozlamalar: Qorong'i mavzu yoqilgan, Ilova ochilgan 1 marta" width="300"> <img src="/rasmlar/flutter/32-qayta.png" alt="Qayta yuklangandan keyin: qorong'i mavzu, Ilova ochilgan 2 marta" width="300">

Playwright bilan brauzer xotirasini (`localStorage`) ham o'qidik — kalitlar `flutter.` prefiksi bilan:

```text tashqi
localStorage: {"flutter.ochilishlar":"1","flutter.qorongi":"true"}
qayta yuklangandan keyin: {"flutter.ochilishlar":"2","flutter.qorongi":"true"}
```

## Tipik xatolar

`test/xato_test.dart`:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:path_provider/path_provider.dart';
import 'package:salom/saqlash/kitob_bazasi.dart';
import 'package:salom/saqlash/sozlamalar.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

String birinchi(Object e) => e.toString().split('\n').first;

void main() {
  test('Tur mos emas', () async {
    SharedPreferences.setMockInitialValues(<String, Object>{'ochilishlar': 'uch'});
    final s = await Sozlamalar.yukla();
    try {
      s.ochilishlar;
    } catch (e) {
      debugPrint(birinchi(e));
    }
  });

  test('Testda path_provider', () async {
    TestWidgetsFlutterBinding.ensureInitialized();
    try {
      await getApplicationDocumentsDirectory();
    } catch (e) {
      debugPrint(birinchi(e));
    }
  });

  test('Testda sqflite (FFI siz)', () async {
    try {
      await KitobBazasi.och(inMemoryDatabasePath);
    } catch (e) {
      debugPrint(birinchi(e));
    }
  });

  test('SQL: satr ichida va whereArgs', () async {
    sqfliteFfiInit();
    // Foydalanuvchi qidiruvga yozgan matnlar
    for (final kiritilgan in ["Ma'lumotlar bazasi", "x' OR '1'='1"]) {
      for (final xavfsiz in [false, true]) {
        final db = await databaseFactoryFfi.openDatabase(inMemoryDatabasePath);
        await db.execute('CREATE TABLE kitoblar(id INTEGER PRIMARY KEY, nom TEXT)');
        for (final n in ['Dart tili', 'Toza kod', "Ma'lumotlar bazasi"]) {
          await db.insert('kitoblar', {'nom': n});
        }
        try {
          final ochdi = xavfsiz
              ? await db.delete('kitoblar', where: 'nom = ?', whereArgs: [kiritilgan])
              : await db.delete('kitoblar', where: "nom = '$kiritilgan'"); // xato joy
          debugPrint('[$kiritilgan] ${xavfsiz ? 'whereArgs' : 'satr ichida'}: $ochdi ta o\'chdi, '
              'qoldi ${(await db.query('kitoblar')).length}');
        } catch (e) {
          debugPrint('[$kiritilgan] satr ichida: ${e.toString().split('\n').first.substring(0, 120)}');
        }
        await db.close();
      }
    }
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: Tur mos emas
type 'String' is not a subtype of type 'int?' in type cast
00:00 +1: Testda path_provider
MissingPluginException(No implementation found for method getApplicationDocumentsDirectory on channel plugins.flutter.io/path_provider)
00:00 +2: Testda sqflite (FFI siz)
Bad state: databaseFactory not initialized
00:00 +3: SQL: satr ichida va whereArgs
[Ma'lumotlar bazasi] satr ichida: DatabaseException(ffi sqlite_error 1: SqliteException(1): while executing, near "lumotlar": syntax error, SQL logic erro
[Ma'lumotlar bazasi] whereArgs: 1 ta o'chdi, qoldi 2
[x' OR '1'='1] satr ichida: 3 ta o'chdi, qoldi 0
[x' OR '1'='1] whereArgs: 0 ta o'chdi, qoldi 3
00:00 +4: All tests passed!
```

Ikkinchi holat ayniqsa o'zbekcha matnda muhim: tutuq belgisi (`'`) SQL'da satr chegarasi. Satr ichiga qo'shilgan
"Ma'lumotlar bazasi" so'rovni buzdi; "x' OR '1'='1" esa shartni "doim rost" qilib, **jadvaldagi hammasini o'chirdi**.
`whereArgs` bilan ikkalasi ham oddiy matn sifatida qaraldi.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `type 'String' is not a subtype of type 'int?'` | Kalitda boshqa turdagi qiymat saqlangan | Har kalit uchun bitta tur; FD: getter turi mos bo'lmasa istisno |
| `MissingPluginException(... getApplicationDocumentsDirectory ...)` | Testda plagin (platforma kodi) yo'q | Papkani tashqaridan bering, testda vaqtinchalik papka |
| `Bad state: databaseFactory not initialized` | Linux/test muhitida `sqflite` plagini yo'q | Testda `sqflite_common_ffi`: `sqfliteFfiInit()` + `databaseFactory = databaseFactoryFfi` |
| `syntax error` / hamma qator o'chdi | Qiymat SQL satriga qo'shilgan | `where: 'nom = ?', whereArgs: [nom]` (FD) |
| Token `shared_preferences` da | Maxfiy ma'lumot uchun emas | `flutter_secure_storage` (FD) |
| Katta ro'yxat `shared_preferences` da | Katta ma'lumot uchun mo'ljallanmagan, saqlanish kafolati yo'q | SQLite yoki fayl (FD) |
| Fayl/SQLite web'da ishlamaydi | FD: fayl retsepti web'da yo'q, `sqflite` faqat macOS/iOS/Android | Web uchun `shared_preferences` yoki serverdagi baza |

## Amaliyot

1. FD bo'yicha sozlamalar, ko'p tuzilgan ma'lumot va maxfiy token uchun nima tanlanadi?
2. `shared_preferences` ning uch cheklovi qaysi?
3. Vaqtinchalik va hujjatlar papkasi farqi nima?
4. `sqflite` da `version` va `onCreate` nima uchun?
5. Nega `whereArgs`? Testda nima bo'ldi?
6. Nega `Eslatmalar` papkani o'zi topmaydi, tashqaridan oladi?
7. Ilovaning yangi versiyasida kitoblarga `muallif` ustuni kerak. Telefonda eski (1-versiya) baza turibdi. Bazani qanday
   yangilaysiz va eski qatorda `muallif` nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Sozlamalar — `shared_preferences`; ko'p tuzilgan (relyatsion) — SQLite (`sqflite` yoki `drift`); token — `flutter_secure_storage`.
2. Faqat oddiy turlar (`int`, `double`, `bool`, `String`, `List<String>`); katta ma'lumot uchun emas; qayta ishga tushganda
   saqlanish kafolati yo'q.
3. Vaqtinchalik — kesh, tizim istalgan payt tozalaydi; hujjatlar — faqat ilovaniki, ilova o'chirilgandagina tozalanadi.
4. `onCreate` — baza birinchi marta yaratilganda jadvallarni yaratadi; `version` — keyingi versiyada bazani yangilash
   (`onUpgrade`) uchun.
5. SQL injection'dan himoya: qiymat SQL matni bo'lib o'qilmaydi. Testda satr ichida "Ma'lumotlar bazasi" so'rovni buzdi,
   "x' OR '1'='1" hammasini o'chirdi; `whereArgs` bilan — 1 va 0 ta o'chdi.
6. `path_provider` plagin — testda yo'q (`MissingPluginException`). Papka berilsa, testda vaqtinchalik papka ishlatiladi.
7. `version: 2` va `onUpgrade: (db, eski, yangi) async { if (eski < 2) await db.execute('ALTER TABLE kitoblar ADD COLUMN muallif
   TEXT'); }`; yangi o'rnatishlar uchun `onCreate` dagi jadvalda ham `muallif`. Eski qatorda `muallif` — `null`. VPS'dagi
   testda: `onUpgrade: 1 → 2`, keyin `[{id: 1, nom: Dart tili, narx: 45000, muallif: null}, {id: 2, nom: Toza kod, narx: 80000,
   muallif: R. Martin}]`.

</details>

## Rasmiy hujjat

- [FD: Choose a database](https://docs.flutter.dev/data-and-backend/persistence/choose-a-database)
- [FD: Store key-value data on disk](https://docs.flutter.dev/cookbook/persistence/key-value)
- [FD: Read and write files](https://docs.flutter.dev/cookbook/persistence/reading-writing-files)
- [FD: Persist data with SQLite](https://docs.flutter.dev/cookbook/persistence/sqlite)
- [shared_preferences](https://pub.dev/packages/shared_preferences) · [path_provider](https://pub.dev/packages/path_provider) · [sqflite](https://pub.dev/packages/sqflite) · [sqflite_common_ffi](https://pub.dev/packages/sqflite_common_ffi)
