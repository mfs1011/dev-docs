# 34 — Arxitektura amalda

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 va `provider` 6.1.5+1 bilan sinalgan. Tuzilma va `Result`, `Command` klasslari — FD'dagi
> rasmiy misol ilova (Compass) va FD dizayn naqshlari sahifalaridan. Skrinshotlar `flutter build web` natijasidan.

## Tushuncha

### Rasmiy misol: Compass

FD (Architecture case study): qo'llanmadagi kod misollari **Compass** ilovasidan — sayohat marshrutini tuzish va bron qilish
ilovasi, ko'p funksiya, yo'nalish (route) va ekranli. Manba: `flutter/samples` repozitoriysidagi `compass_app`. Bu bob uning
tuzilmasini kichik kitob do'konida takrorlaydi.

### Papkalar: funksiya bo'yicha va tur bo'yicha

FD: kodni ikki xil tartiblash mumkin — **funksiya bo'yicha** (masalan, `auth/` ichida shu funksiyaning hamma klasslari) yoki
**tur bo'yicha** (`repositories/`, `services/`, `viewmodels/`). Tavsiya — ikkalasining aralashmasi:

- `data/` — **tur bo'yicha**: repository va servislar bitta funksiyaga bog'lanmagan, ko'p view model ishlatadi;
- `ui/` — **funksiya bo'yicha**: har funksiyada aynan bitta view va bitta view model.

```text
lib/
├── ui/
│   ├── core/                  umumiy widget'lar, mavzular
│   └── <funksiya>/
│       ├── view_models/
│       └── widgets/           <funksiya>_screen.dart va boshqalar
├── domain/models/             domen modellari
├── data/
│   ├── repositories/
│   ├── services/
│   └── model/                 API modellari
├── config/  utils/  routing/
└── main.dart                  (Compass'da yana main_development.dart, main_staging.dart)
test/                          unit va widget testlar (data/, domain/, ui/, utils/)
testing/                       testlar uchun soxtalar (fakes/, models/)
```

### Ma'lumot qatlami

FD (Data layer):

- **Service** — holatsiz Dart klassi; har metodi bitta API manzilini o'rab, asinxron javob (`Future`) qaytaradi. Compass'da
  javob `Result` ga o'ralgan.
- **Repository** — yagona vazifasi ilova ma'lumotini boshqarish; bitta ma'lumot turi uchun haqiqat manbai va uni
  **o'zgartiradigan yagona joy**. Servis — repository'ning **shaxsiy** maydoni: UI uni chetlab o'tib servisni chaqira olmasin.
- Repository **abstrakt klass**dan meros oladi (masalan, `BookingRepository` → `BookingRepositoryRemote`): turli muhitlar
  uchun turli amalga oshirish.
- **API modeli** — serverning xom ma'lumoti; repository uni tozalab, **domen modeli** qilib beradi.

### UI qatlami

FD (UI layer):

- **ViewModel** — UI mantiqi uchun Dart klassi. Repository'lar — uning **shaxsiy** maydonlari (aks holda view ma'lumot
  qatlamiga to'g'ridan-to'g'ri kirardi).
- Chiqishi — **UI holati**: view'ni to'liq chizish uchun kerak bo'lgan ma'lumotning **o'zgarmas** surati. FD:
  `UnmodifiableListView` bilan view ro'yxatni o'zgartira olmaydi.
- Compass'da view model `ChangeNotifier` dan meros oladi; yangi holatdan keyin `notifyListeners()`; view
  **`ListenableBuilder`** bilan tinglaydi.

### `Command` va `Result`

**`Result`** (FD, Error handling with Result objects): Dart istisnolari e'lon qilinmaydi — metod uni tashlashi va chaqiruvchi
ushlashi shart emas. Katta loyihada ushlanmay qolgan istisno ilovani yiqitishi mumkin. `Result` — `sealed` klass: faqat `Ok`
(qiymat bilan) yoki `Error` (istisno bilan). Chaqiruvchi xatoni tekshirishga majbur — `switch` bilan.

**`Command`** (FD, Command pattern): metodni o'raydi va uning holatlarini beradi — `running`, `completed`, `error`. O'zi
`ChangeNotifier`: `execute()` davomida bir necha marta `notifyListeners()` chaqiradi, view holatlarni kam mantiq bilan
ko'rsatadi. **`running` bo'lsa, qayta ishga tushmaydi** — tugmani tez-tez bosish ikki so'rov yubormaydi. `Command0` — argumentsiz,
`Command1` — bitta argumentli. Natija bir marta ishlatilgach `clearResult()`.

FD: `load` buyrug'i view model'ning xossasi — qachon chaqirilishi va qachon tugashi muhim emas, view uning holatini ko'rsatadi.

### Bog'liqlik in'ektsiyasi (dependency injection)

FD (Dependency injection): qatlamlar orasidagi aloqa — komponentni konstruktorga berish (Service → Repository → ViewModel).
Ularni **qayerda yaratish** savoliga javob — bog'liqlik in'ektsiyasi. Compass'da `provider` bilan: servis va repository'lar
daraxt tepasida `MultiProvider` da, repository'ga servis `context.read()` bilan beriladi; ekran view model'i yo'nalish
(`go_router`) quruvchisida yaratilib, repository `context.read()` bilan olinadi.

### Testlash

FD (Testing each layer):

- **ViewModel** — Flutter widget'larisiz unit test; yagona tayyorgarlik — repository'ning soxtasi (`FakeBookingRepository
  implements BookingRepository`).
- **View** — widget test; view model testi uchun yozilgan soxtalar shu yerda ham ishlaydi, view model'ning o'zi soxta emas.
- **Repository** — unit test, u bog'liq servislarning soxtasi bilan.
- FD: arxitektura to'g'ri bo'lsa, view va view model testlari faqat repository soxtasini talab qiladi.

## Ko'rib chiqamiz

Kitob do'koni — bitta funksiya (`kitoblar`), ma'lumot `shared_preferences` da (32-bob) — web'da ham ishlaydi:

```text
lib/
├── main.dart
├── utils/            result.dart, command.dart
├── domain/models/    kitob.dart
├── data/
│   ├── services/     kitob_storage_service.dart
│   └── repositories/ kitob_repository.dart (abstrakt), kitob_repository_local.dart
└── ui/kitoblar/
    ├── view_models/  kitoblar_view_model.dart
    └── widgets/      kitoblar_screen.dart
testing/fakes/        fake_kitob_repository.dart
test/ui/              kitoblar_view_model_test.dart, kitoblar_screen_test.dart
test/data/            kitob_repository_local_test.dart
```

```text vps
$ flutter pub add provider
+ provider 6.1.5+1
Changed 2 dependencies!
```

### `utils/`

`lib/utils/result.dart` — FD'dagi klass (izohlari qisqartirilgan):

```dart
// FD (Result pattern) dagi klass — o'zgarishsiz, izohlari qisqartirilgan
sealed class Result<T> {
  const Result();

  /// Muvaffaqiyatli natija
  const factory Result.ok(T value) = Ok._;

  /// Xato natija
  const factory Result.error(Exception error) = Error._;
}

final class Ok<T> extends Result<T> {
  const Ok._(this.value);

  final T value;

  @override
  String toString() => 'Result<$T>.ok($value)';
}

final class Error<T> extends Result<T> {
  const Error._(this.error);

  final Exception error;

  @override
  String toString() => 'Result<$T>.error($error)';
}
```

`lib/utils/command.dart` — FD'dagi klass (izohlari o'zbekcha):

```dart
// FD (Command pattern) dagi klass — mantiq o'sha, izohlari o'zbekcha
import 'dart:async';

import 'package:flutter/foundation.dart';

import 'result.dart';

typedef CommandAction0<T> = Future<Result<T>> Function();
typedef CommandAction1<T, A> = Future<Result<T>> Function(A);

/// Amalni o'raydi: ishlayaptimi (running), xato bo'ldimi (error),
/// tugadimi (completed) — va tugamaguncha qayta ishga tushirmaydi.
abstract class Command<T> extends ChangeNotifier {
  bool _running = false;
  bool get running => _running;

  Result<T>? _result;
  bool get error => _result is Error;
  bool get completed => _result is Ok;
  Result<T>? get result => _result;

  void clearResult() {
    _result = null;
    notifyListeners();
  }

  Future<void> _execute(CommandAction0<T> action) async {
    if (_running) return; // ikki marta bosilsa — ikkinchisi e'tiborsiz
    _running = true;
    _result = null;
    notifyListeners();
    try {
      _result = await action();
    } finally {
      _running = false;
      notifyListeners();
    }
  }
}

final class Command0<T> extends Command<T> {
  Command0(this._action);

  final CommandAction0<T> _action;

  Future<void> execute() async => _execute(_action);
}

final class Command1<T, A> extends Command<T> {
  Command1(this._action);

  final CommandAction1<T, A> _action;

  Future<void> execute(A argument) async => _execute(() => _action(argument));
}
```

### Domen modeli: `lib/domain/models/kitob.dart`

```dart
/// Domen modeli: o'zgarmas (immutable) — o'zgartirish uchun yangi nusxa
class Kitob {
  const Kitob({required this.id, required this.nom, required this.narx});

  final int id;
  final String nom;
  final int narx;

  Map<String, Object> toJson() => {'id': id, 'nom': nom, 'narx': narx};

  factory Kitob.fromJson(Map<String, dynamic> json) => switch (json) {
        {'id': int id, 'nom': String nom, 'narx': int narx} => Kitob(id: id, nom: nom, narx: narx),
        _ => throw const FormatException('Kitob JSON\'i noto\'g\'ri'),
      };

  @override
  String toString() => '$nom ($narx)';
}
```

### Ma'lumot qatlami

`lib/data/services/kitob_storage_service.dart` — holatsiz; xatolar `Result.error` ga o'raladi:

```dart
import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../utils/result.dart';

/// Service: faqat ma'lumotni o'qish/yozish. Holat saqlamaydi.
class KitobStorageService {
  static const _kalit = 'kitoblar';

  Future<Result<List<Map<String, dynamic>>>> oqi() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final matn = prefs.getString(_kalit);
      if (matn == null) return const Result.ok([]);
      return Result.ok((jsonDecode(matn) as List<dynamic>).cast<Map<String, dynamic>>());
    } on Exception catch (e) {
      return Result.error(e);
    }
  }

  Future<Result<void>> yoz(List<Map<String, dynamic>> royxat) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_kalit, jsonEncode(royxat));
      return const Result.ok(null);
    } on Exception catch (e) {
      return Result.error(e);
    }
  }
}
```

`lib/data/repositories/kitob_repository.dart` — abstrakt:

```dart
import '../../domain/models/kitob.dart';
import '../../utils/result.dart';

/// Abstrakt repository: kitoblar uchun yagona haqiqat manbai.
/// Amalga oshirishlari: ilovada — KitobRepositoryLocal, testda — soxtasi.
abstract class KitobRepository {
  Future<Result<List<Kitob>>> hammasi();

  Future<Result<Kitob>> qosh(String nom, int narx);

  Future<Result<void>> ochir(int id);
}
```

`lib/data/repositories/kitob_repository_local.dart` — kesh, servisdan o'qish, JSON'ni domen modeliga aylantirish:

```dart
import '../../domain/models/kitob.dart';
import '../../utils/result.dart';
import '../services/kitob_storage_service.dart';
import 'kitob_repository.dart';

class KitobRepositoryLocal implements KitobRepository {
  KitobRepositoryLocal({required KitobStorageService storageService}) : _service = storageService;

  final KitobStorageService _service; // shaxsiy: UI servisni to'g'ridan-to'g'ri chaqira olmaydi
  List<Kitob>? _kesh;

  @override
  Future<Result<List<Kitob>>> hammasi() async {
    if (_kesh case final kesh?) return Result.ok(List.unmodifiable(kesh));
    final natija = await _service.oqi();
    switch (natija) {
      case Ok(:final value):
        try {
          _kesh = value.map(Kitob.fromJson).toList();
          return Result.ok(List.unmodifiable(_kesh!));
        } on FormatException catch (e) {
          return Result.error(e);
        }
      case Error(:final error):
        return Result.error(error);
    }
  }

  @override
  Future<Result<Kitob>> qosh(String nom, int narx) async {
    final joriy = await hammasi();
    if (joriy case Error(:final error)) return Result.error(error);
    final royxat = (joriy as Ok<List<Kitob>>).value;
    final id = royxat.fold(0, (m, k) => k.id > m ? k.id : m) + 1;
    final yangi = Kitob(id: id, nom: nom, narx: narx);
    final yangiRoyxat = [...royxat, yangi];
    final yozildi = await _service.yoz([for (final k in yangiRoyxat) k.toJson()]);
    if (yozildi case Error(:final error)) return Result.error(error);
    _kesh = yangiRoyxat;
    return Result.ok(yangi);
  }

  @override
  Future<Result<void>> ochir(int id) async {
    final joriy = await hammasi();
    if (joriy case Error(:final error)) return Result.error(error);
    final yangiRoyxat = [for (final k in (joriy as Ok<List<Kitob>>).value) if (k.id != id) k];
    final yozildi = await _service.yoz([for (final k in yangiRoyxat) k.toJson()]);
    if (yozildi case Error(:final error)) return Result.error(error);
    _kesh = yangiRoyxat;
    return const Result.ok(null);
  }
}
```

### UI qatlami

`lib/ui/kitoblar/view_models/kitoblar_view_model.dart`:

```dart
import 'dart:collection';

import 'package:flutter/foundation.dart';

import '../../../data/repositories/kitob_repository.dart';
import '../../../domain/models/kitob.dart';
import '../../../utils/command.dart';
import '../../../utils/result.dart';

class KitoblarViewModel extends ChangeNotifier {
  KitoblarViewModel({required KitobRepository kitobRepository}) : _repository = kitobRepository {
    load = Command0(_load)..execute(); // ekran ochilishi bilan yuklash
    qosh = Command1(_qosh);
    ochir = Command1(_ochir);
  }

  final KitobRepository _repository; // shaxsiy — view repository'ni ko'rmaydi

  late final Command0<void> load;
  late final Command1<void, (String, int)> qosh;
  late final Command1<void, int> ochir;

  List<Kitob> _kitoblar = [];

  /// UI holati: view o'zgartira olmaydi
  UnmodifiableListView<Kitob> get kitoblar => UnmodifiableListView(_kitoblar);

  int get jami => _kitoblar.fold(0, (s, k) => s + k.narx);

  Future<Result<void>> _load() async {
    try {
      final natija = await _repository.hammasi();
      switch (natija) {
        case Ok(:final value):
          _kitoblar = value;
          return const Result.ok(null);
        case Error(:final error):
          return Result.error(error);
      }
    } finally {
      notifyListeners();
    }
  }

  Future<Result<void>> _qosh((String, int) kitob) async {
    final (nom, narx) = kitob;
    final natija = await _repository.qosh(nom, narx);
    if (natija case Error(:final error)) return Result.error(error);
    return _load(); // haqiqat manbaidan qayta o'qiymiz
  }

  Future<Result<void>> _ochir(int id) async {
    final natija = await _repository.ochir(id);
    if (natija case Error(:final error)) return Result.error(error);
    return _load();
  }
}
```

`lib/ui/kitoblar/widgets/kitoblar_screen.dart` — ikki `ListenableBuilder`: tashqisi `load` buyrug'ini (aylanma/xato),
ichkisi view model'ni (ma'lumot) tinglaydi:

```dart
import 'package:material_ui/material_ui.dart';

import '../view_models/kitoblar_view_model.dart';

/// View: faqat ko'rsatadi va hodisani view model buyrug'iga uzatadi
class KitoblarScreen extends StatefulWidget {
  const KitoblarScreen({super.key, required this.viewModel});

  final KitoblarViewModel viewModel;

  @override
  State<KitoblarScreen> createState() => _KitoblarScreenState();
}

class _KitoblarScreenState extends State<KitoblarScreen> {
  final _nom = TextEditingController();

  @override
  void dispose() {
    _nom.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final vm = widget.viewModel;
    return Scaffold(
      appBar: AppBar(title: const Text('Kitoblar')),
      body: ListenableBuilder(
        listenable: vm.load, // yuklash buyrug'ining holati
        builder: (context, child) {
          if (vm.load.running) return const Center(child: CircularProgressIndicator());
          if (vm.load.error) {
            return Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Text('Yuklab bo\'lmadi'),
                TextButton(onPressed: vm.load.execute, child: const Text('Qayta urinish')),
              ]),
            );
          }
          return child!;
        },
        child: ListenableBuilder(
          listenable: vm, // ma'lumot
          builder: (context, _) => Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Row(children: [
                  Expanded(child: TextField(controller: _nom, decoration: const InputDecoration(labelText: 'Nomi'))),
                  ListenableBuilder(
                    listenable: vm.qosh,
                    builder: (context, _) => IconButton(
                      tooltip: 'Qo\'shish',
                      icon: const Icon(Icons.add),
                      // Ishlayotgan bo'lsa — tugma o'chiq
                      onPressed: vm.qosh.running
                          ? null
                          : () {
                              vm.qosh.execute((_nom.text, 50000));
                              _nom.clear();
                            },
                    ),
                  ),
                ]),
              ),
              Expanded(
                child: ListView(children: [
                  for (final k in vm.kitoblar)
                    ListTile(
                      key: ValueKey(k.id),
                      title: Text(k.nom),
                      subtitle: Text('${k.narx} so\'m'),
                      trailing: IconButton(
                        tooltip: 'O\'chirish',
                        icon: const Icon(Icons.delete),
                        onPressed: () => vm.ochir.execute(k.id),
                      ),
                    ),
                ]),
              ),
              ListTile(title: Text('Jami: ${vm.kitoblar.length} ta, ${vm.jami} so\'m')),
            ],
          ),
        ),
      ),
    );
  }
}
```

### Hammasini ulash: `lib/main.dart`

```dart
import 'package:material_ui/material_ui.dart';
import 'package:provider/provider.dart';

import 'data/repositories/kitob_repository.dart';
import 'data/repositories/kitob_repository_local.dart';
import 'data/services/kitob_storage_service.dart';
import 'ui/kitoblar/view_models/kitoblar_view_model.dart';
import 'ui/kitoblar/widgets/kitoblar_screen.dart';

void main() {
  runApp(
    // Bog'liqliklar bir joyda: service → repository
    MultiProvider(
      providers: [
        Provider(create: (context) => KitobStorageService()),
        Provider(
          create: (context) => KitobRepositoryLocal(storageService: context.read()) as KitobRepository,
        ),
      ],
      child: const DokonApp(),
    ),
  );
}

class DokonApp extends StatelessWidget {
  const DokonApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      // Ekran view model'i shu yerda yaratiladi, repository provider'dan
      home: KitoblarScreen(viewModel: KitoblarViewModel(kitobRepository: context.read())),
    );
  }
}
```

### Testlar

`testing/fakes/fake_kitob_repository.dart` — xotirada; kechikish va xato rejimi bor:

```dart
import 'package:salom/data/repositories/kitob_repository.dart';
import 'package:salom/domain/models/kitob.dart';
import 'package:salom/utils/result.dart';

/// Testlar uchun soxta repository: xotirada, ixtiyoriy kechikish va xato bilan
class FakeKitobRepository implements KitobRepository {
  FakeKitobRepository({this.xato = false, this.kechikish = Duration.zero});

  final bool xato;
  final Duration kechikish;
  final List<Kitob> kitoblar = [const Kitob(id: 1, nom: 'Dart tili', narx: 45000)];
  int qoshishlar = 0;

  @override
  Future<Result<List<Kitob>>> hammasi() async {
    await Future<void>.delayed(kechikish);
    if (xato) return Result.error(Exception('disk o\'qilmadi'));
    return Result.ok(List.unmodifiable(kitoblar));
  }

  @override
  Future<Result<Kitob>> qosh(String nom, int narx) async {
    qoshishlar++;
    await Future<void>.delayed(kechikish);
    final k = Kitob(id: kitoblar.length + 1, nom: nom, narx: narx);
    kitoblar.add(k);
    return Result.ok(k);
  }

  @override
  Future<Result<void>> ochir(int id) async {
    kitoblar.removeWhere((k) => k.id == id);
    return const Result.ok(null);
  }
}
```

`test/ui/kitoblar_view_model_test.dart` — widget'siz:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/ui/kitoblar/view_models/kitoblar_view_model.dart';

import '../../testing/fakes/fake_kitob_repository.dart';

void main() {
  group('KitoblarViewModel', () {
    test('yuklash va qo\'shish', () async {
      final vm = KitoblarViewModel(kitobRepository: FakeKitobRepository());
      await Future<void>.delayed(Duration.zero); // konstruktordagi load tugasin
      debugPrint('load: completed=${vm.load.completed}, kitoblar=${vm.kitoblar}');

      await vm.qosh.execute(('Toza kod', 80000));
      debugPrint('qosh: completed=${vm.qosh.completed}, kitoblar=${vm.kitoblar}, jami=${vm.jami}');

      try {
        vm.kitoblar.add(vm.kitoblar.first); // view ro'yxatni o'zgartira olmaydi
      } on UnsupportedError catch (e) {
        debugPrint('view o\'zgartirmoqchi: $e');
      }
    });

    test('repository xatosi', () async {
      final vm = KitoblarViewModel(kitobRepository: FakeKitobRepository(xato: true));
      await Future<void>.delayed(Duration.zero);
      debugPrint('load: error=${vm.load.error}, result=${vm.load.result}');
    });

    test('ikki marta tez bosish', () async {
      final repo = FakeKitobRepository(kechikish: const Duration(milliseconds: 50));
      final vm = KitoblarViewModel(kitobRepository: repo);
      await Future<void>.delayed(const Duration(milliseconds: 100));
      final birinchi = vm.qosh.execute(('A', 1));
      debugPrint('ishlayapti: running=${vm.qosh.running}');
      final ikkinchi = vm.qosh.execute(('A', 1)); // hali tugamagan
      await Future.wait([birinchi, ikkinchi]);
      debugPrint('2 marta bosildi — repository\'ga ${repo.qoshishlar} ta so\'rov');
    });
  });
}
```

`test/ui/kitoblar_screen_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/ui/kitoblar/view_models/kitoblar_view_model.dart';
import 'package:salom/ui/kitoblar/widgets/kitoblar_screen.dart';

import '../../testing/fakes/fake_kitob_repository.dart';

Widget ekran(FakeKitobRepository repo) =>
    MaterialApp(home: KitoblarScreen(viewModel: KitoblarViewModel(kitobRepository: repo)));

void main() {
  testWidgets('yuklanish → ro\'yxat → qo\'shish', (tester) async {
    await tester.pumpWidget(ekran(FakeKitobRepository(kechikish: const Duration(milliseconds: 300))));
    debugPrint('boshida: aylanma ${find.byType(CircularProgressIndicator).evaluate().length} ta');
    await tester.pumpAndSettle();
    debugPrint('keyin: ${find.byType(ListTile).evaluate().length - 1} ta kitob');

    await tester.enterText(find.byType(TextField), 'Toza kod');
    await tester.tap(find.byTooltip('Qo\'shish'));
    await tester.pump();
    debugPrint('bosildi: tugma o\'chiq=${tester.widget<IconButton>(find.byType(IconButton).first).onPressed == null}');
    await tester.pumpAndSettle();
    debugPrint('oxiri: ${find.textContaining('Jami').evaluate().map((e) => (e.widget as Text).data).single}');
  });

  testWidgets('xato va qayta urinish', (tester) async {
    await tester.pumpWidget(ekran(FakeKitobRepository(xato: true)));
    await tester.pumpAndSettle();
    debugPrint('ekranda: ${find.text('Yuklab bo\'lmadi').evaluate().length == 1 ? 'Yuklab bo\'lmadi' : '?'}, '
        'tugma: ${find.text('Qayta urinish').evaluate().length}');
  });
}
```

`test/data/kitob_repository_local_test.dart` — haqiqiy servis, `shared_preferences` ning xotiradagi soxtasi bilan:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/data/repositories/kitob_repository_local.dart';
import 'package:salom/data/services/kitob_storage_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  test('qo\'shish, o\'chirish va diskdan qayta o\'qish', () async {
    SharedPreferences.setMockInitialValues({});
    final repo = KitobRepositoryLocal(storageService: KitobStorageService());
    await repo.qosh('Dart tili', 45000);
    await repo.qosh('Toza kod', 80000);
    await repo.ochir(1);

    // Yangi repository — keshi bo'sh, ma'lumotni servis orqali diskdan oladi
    final yangi = KitobRepositoryLocal(storageService: KitobStorageService());
    debugPrint('yangi repository: ${await yangi.hammasi()}');
    debugPrint('diskda: ${(await SharedPreferences.getInstance()).getString('kitoblar')}');
  });

  test('buzilgan ma\'lumot', () async {
    SharedPreferences.setMockInitialValues({'kitoblar': '[{"id": "bir"}]'});
    final repo = KitobRepositoryLocal(storageService: KitobStorageService());
    debugPrint('${await repo.hammasi()}');
  });
}
```

```text vps
$ flutter test test/ui test/data
00:00 +0: loading /home/dasturchi/flutter/salom/test/ui/kitoblar_view_model_test.dart
00:00 +0: /home/dasturchi/flutter/salom/test/ui/kitoblar_view_model_test.dart: KitoblarViewModel yuklash va qo'shish
load: completed=true, kitoblar=[Dart tili (45000)]
qosh: completed=true, kitoblar=[Dart tili (45000), Toza kod (80000)], jami=125000
view o'zgartirmoqchi: Unsupported operation: Cannot add to an unmodifiable list
00:00 +1: /home/dasturchi/flutter/salom/test/ui/kitoblar_view_model_test.dart: KitoblarViewModel repository xatosi
load: error=true, result=Result<void>.error(Exception: disk o'qilmadi)
00:00 +2: /home/dasturchi/flutter/salom/test/ui/kitoblar_view_model_test.dart: KitoblarViewModel ikki marta tez bosish
ishlayapti: running=true
2 marta bosildi — repository'ga 1 ta so'rov
00:00 +3: loading /home/dasturchi/flutter/salom/test/ui/kitoblar_screen_test.dart
00:03 +3: /home/dasturchi/flutter/salom/test/ui/kitoblar_screen_test.dart: yuklanish → ro'yxat → qo'shish
boshida: aylanma 1 ta
keyin: 1 ta kitob
bosildi: tugma o'chiq=true
oxiri: Jami: 2 ta, 95000 so'm
00:07 +4: /home/dasturchi/flutter/salom/test/ui/kitoblar_screen_test.dart: xato va qayta urinish
ekranda: Yuklab bo'lmadi, tugma: 1
00:08 +5: loading /home/dasturchi/flutter/salom/test/data/kitob_repository_local_test.dart
00:09 +5: /home/dasturchi/flutter/salom/test/data/kitob_repository_local_test.dart: qo'shish, o'chirish va diskdan qayta o'qish
yangi repository: Result<List<Kitob>>.ok([Toza kod (80000)])
diskda: [{"id":2,"nom":"Toza kod","narx":80000}]
00:09 +6: /home/dasturchi/flutter/salom/test/data/kitob_repository_local_test.dart: buzilgan ma'lumot
Result<List<Kitob>>.error(FormatException: Kitob JSON'i noto'g'ri)
00:09 +7: All tests passed!
```

Natijada:

- **ViewModel** Flutter widget'larisiz testlandi: `load` va `qosh` buyruqlari `completed`; view ro'yxatni o'zgartira olmadi
  (`Cannot add to an unmodifiable list`); repository xatosi `load.error=true` bo'ldi — istisno uchmadi.
- **Ikki marta tez bosish** — repository'ga **1 ta** so'rov: `Command` ishlayotganda qayta ishga tushmaydi.
- **View**: boshida aylanma, keyin ro'yxat; bosilganda "Qo'shish" tugmasi o'chdi (`qosh.running`); xatoda — "Yuklab bo'lmadi"
  va "Qayta urinish".
- **Repository**: yangi nusxa (keshi bo'sh) ma'lumotni servis orqali "disk"dan oldi; buzilgan JSON — `Result.error`, ilova
  yiqilmadi.

### Brauzerda

Chapda — ikki kitob qo'shilgan; o'ngda — sahifa qayta yuklangandan keyin (ma'lumot repository → servis → `localStorage`
orqali qaytdi):

<img src="/rasmlar/flutter/34-qoshildi.png" alt="Kitoblar: Dart tili va Toza kod, Jami: 2 ta, 100000 so'm" width="300"> <img src="/rasmlar/flutter/34-qayta.png" alt="Qayta yuklangandan keyin ham ikki kitob" width="300">

`localStorage` da — servis yozgan JSON (`shared_preferences` uni satr sifatida saqlaydi):

```text tashqi
localStorage: {"flutter.kitoblar":"\"[{\\\"id\\\":1,\\\"nom\\\":\\\"Dart tili\\\",\\\"narx\\\":50000},{\\\"id\\\":2,\\\"nom\\\":\\\"Toza kod\\\",\\\"narx\\\":50000}]\""}
```

## Tipik xatolar

`test/xato_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/data/repositories/kitob_repository.dart';
import 'package:salom/domain/models/kitob.dart';
import 'package:salom/utils/command.dart';
import 'package:salom/utils/result.dart';

import '../testing/fakes/fake_kitob_repository.dart';

// 1. notifyListeners unutilgan view model
class XabarsizViewModel extends ChangeNotifier {
  XabarsizViewModel(this._repo) {
    load = Command0(_load)..execute();
  }

  final KitobRepository _repo;
  late final Command0<void> load;
  List<Kitob> kitoblar = [];

  Future<Result<void>> _load() async {
    final natija = await _repo.hammasi();
    if (natija case Ok(:final value)) kitoblar = value;
    return const Result.ok(null); // notifyListeners yo'q
  }
}

// 2. Repository Result o'rniga istisno tashlaydi
class IstisnoliRepository extends FakeKitobRepository {
  @override
  Future<Result<List<Kitob>>> hammasi() async => throw const FormatException('buzilgan JSON');
}

void main() {
  testWidgets('notifyListeners yo\'q', (tester) async {
    final vm = XabarsizViewModel(FakeKitobRepository());
    await tester.pumpWidget(MaterialApp(
      home: ListenableBuilder(
        listenable: vm,
        builder: (context, _) => Text('${vm.kitoblar.length} ta kitob'),
      ),
    ));
    await tester.pumpAndSettle();
    debugPrint('view model\'da: ${vm.kitoblar.length} ta, ekranda: ${tester.widget<Text>(find.byType(Text)).data}');
  });

  test('Result o\'rniga istisno', () async {
    final load = Command0<List<Kitob>>(() => IstisnoliRepository().hammasi());
    try {
      await load.execute();
    } catch (e) {
      debugPrint('execute dan chiqib ketdi: $e; load.error=${load.error}');
    }
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: notifyListeners yo'q
view model'da: 1 ta, ekranda: 0 ta kitob
00:01 +1: Result o'rniga istisno
execute dan chiqib ketdi: FormatException: buzilgan JSON; load.error=false
00:01 +2: All tests passed!
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| View model'da 1 ta, ekranda 0 ta | Holat yangilandi, `notifyListeners()` yo'q | `_load` ning `finally` ida `notifyListeners()` (FD) |
| `execute` dan istisno chiqib ketdi, `load.error=false` | Repository `Result` o'rniga istisno tashladi — `Command` uni ushlamaydi | Repository va servisda `try`/`on Exception` → `Result.error` (FD) |
| View `repository` ga to'g'ridan-to'g'ri murojaat qiladi | Qatlamlar aralashdi | Repository view model'ning **shaxsiy** maydoni (FD) |
| Tugma tez bosilsa ikki yozuv | Amal ishlayotganini hech kim tekshirmaydi | `Command` — `running` da qayta ishga tushmaydi |
| Xato bir marta emas, har qayta qurilishda ko'rsatiladi | Buyruq natijasi "iste'mol qilinmagan" | Ko'rsatgandan keyin `clearResult()` (7-mashq) |
| Servis ichida ro'yxat (kesh) saqlanadi | FD: servis holatsiz | Kesh — repository'da |

## Amaliyot

1. Compass tuzilmasida `data/` va `ui/` papkalari qanday tartiblangan va nega?
2. Nega repository va servis shaxsiy (`_`) maydon bo'lib saqlanadi?
3. `Result` istisnodan nimasi bilan yaxshi?
4. `Command` qanday holatlarni beradi? Nega u ham `ChangeNotifier`?
5. FD bo'yicha view model testi uchun nima soxtalashtiriladi?
6. Bog'liqliklar qayerda yaratiladi va qanday uzatiladi?
7. Kitob qo'shish xato bilan tugasa, ekranda bir marta "Qo'shib bo'lmadi" degan `SnackBar` chiqsin. View'da nima o'zgaradi?

<details>
<summary>Javoblar</summary>

1. `data/` — tur bo'yicha (repository va servislar ko'p funksiyada ishlatiladi); `ui/` — funksiya bo'yicha (har funksiyada bitta
   view va bitta view model).
2. UI ma'lumot qatlamini chetlab o'tmasin: view faqat view model buyruqlari va holati bilan ishlaydi.
3. Chaqiruvchi xatoni tekshirishga majbur (`sealed` — faqat `Ok` yoki `Error`, `switch` bilan); ushlanmagan istisnolar kamayadi.
4. `running`, `completed`, `error` (va `result`). `ChangeNotifier` — holat o'zgarganda view `ListenableBuilder` bilan qayta
   quriladi; `running` paytida qayta ishga tushmaydi.
5. Faqat repository (`FakeKitobRepository implements KitobRepository`). View testida ham shu soxta, view model haqiqiy.
6. Ilova tepasida `MultiProvider`: servis → repository (`context.read()`); ekran view model'i ekran yaratilayotganda,
   repository `context.read()` bilan.
7. `initState` da `widget.viewModel.qosh.addListener(_qoshKuzat)`, `dispose` da `removeListener`; `_qoshKuzat` ichida
   `if (qosh.error) { qosh.clearResult(); ScaffoldMessenger.of(context).showSnackBar(...); }`. View model va repository
   o'zgarmaydi. VPS'dagi testda (`qosh` doim xato qaytaradigan soxta repository bilan): `SnackBar: 1 ta, natija tozalandi: true`.

</details>

## Rasmiy hujjat

- [FD: Architecture case study](https://docs.flutter.dev/app-architecture/case-study)
- [FD: UI layer](https://docs.flutter.dev/app-architecture/case-study/ui-layer)
- [FD: Data layer](https://docs.flutter.dev/app-architecture/case-study/data-layer)
- [FD: Dependency injection](https://docs.flutter.dev/app-architecture/case-study/dependency-injection)
- [FD: Testing each layer](https://docs.flutter.dev/app-architecture/case-study/testing)
- [FD: Design patterns](https://docs.flutter.dev/app-architecture/design-patterns) · [Result](https://docs.flutter.dev/app-architecture/design-patterns/result) · [Command](https://docs.flutter.dev/app-architecture/design-patterns/command)
- [Compass ilovasi manbasi (flutter/samples)](https://github.com/flutter/samples/tree/main/compass_app)
