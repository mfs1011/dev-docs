# 31 — JSON

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0 bilan sinalgan: `json_annotation` 4.12.0, `json_serializable` 6.15.2, `build_runner` 2.17.1.
> Bu bob — Dart kodi va testlar; ekran yo'q.

## Tushuncha

### JSON va Dart

**JSON** — server va ilova orasidagi eng keng tarqalgan ma'lumot formati. `dart:convert` dagi `jsonDecode` matnni
`Map<String, dynamic>` / `List<dynamic>` ga, `jsonEncode` esa aksincha aylantiradi. Lekin `Map` bilan ishlash xavfli: kalit
nomida xato yoki noto'g'ri tur faqat ishlab turganda chiqadi. Shuning uchun JSON **model klass**larga aylantiriladi.

### Ikki yo'l

FD (JSON and serialization):

| | Qo'lda | Kod generatsiyasi (`json_serializable`) |
| --- | --- | --- |
| Qachon | kichik loyiha, tez prototip | o'rta va katta loyiha, ko'p model |
| Afzalligi | qo'shimcha paket va qadam yo'q | takroriy kod yo'q, xato kamroq |
| Kamchiligi | ko'p model bo'lsa — zerikarli, takroriy va mayda xatolarga moyil | generator ishga tushiriladi, `.g.dart` fayllar |

**Nega Java'dagi GSON kabi avtomatik kutubxona yo'q?** FD: bunday kutubxona ish vaqtidagi aks ettirishni (runtime reflection)
talab qiladi, u Flutter'da o'chirilgan. Reflection hamma kodni "ishlatilgan" qilib qo'yadi va **tree shaking**ga — ilovadan
ishlatilmagan kodni olib tashlashga — xalaqit beradi.

### Qo'lda

FD: model ichida `fromJson` nomli konstruktor va `toJson()` metodi. Dekodlash mantig'i modelning o'zida turadi. `jsonEncode`
obyektni o'zi `toJson()` orqali aylantiradi.

### `json_serializable`

FD bo'yicha qadamlar:

1. `flutter pub add json_annotation dev:build_runner dev:json_serializable`
2. Klass ustida `@JsonSerializable()`, faylda `part 'kitob.g.dart';`
3. `factory Kitob.fromJson(json) => _$KitobFromJson(json);` va `toJson() => _$KitobToJson(this);`
4. Generator: `dart run build_runner build` (bir marta) yoki `dart run build_runner watch` (fayl o'zgarishini kuzatib).

`@JsonKey` bilan sozlash (FD):

- `name: 'nashr_yili'` — JSON'dagi nom Dart'dagidan boshqacha bo'lsa;
- `defaultValue: false` — kalit yo'q yoki `null` bo'lsa;
- `required: true` — kalit bo'lishi shart, bo'lmasa istisno;
- ichma-ich klass (masalan, `Muallif`) bo'lsa — `@JsonSerializable(explicitToJson: true)`, aks holda `toJson()` ichida
  `Instance of 'Muallif'` qoladi.

### Katta JSON — fonda

FD (Parse JSON in the background): Dart ilovasi standart holatda hamma ishni bitta oqimda qiladi. Og'ir hisob (masalan, juda
katta JSON'ni o'qish) **16 millisekunddan** uzoq cho'zilsa, foydalanuvchi qotishni (jank) ko'radi. Yechim — ishni alohida
**isolate**ga (o'z xotirasi bor alohida ishchi) o'tkazish. Flutter'dagi **`compute(funksiya, argument)`** funksiyani fonda
ishlatib, natijani qaytaradi.

FD: isolate'lar xabar almashadi — oddiy qiymatlar (`null`, `num`, `bool`, `double`, `String`) yoki `List<Photo>` kabi sodda
obyektlar. `Future` yoki `http.Response` kabi murakkab obyektlarni o'tkazishda xato bo'lishi mumkin — shuning uchun `compute`
ga javob emas, uning matni (`response.body`) beriladi.

## Ko'rib chiqamiz

### Paketlar

```text vps
$ flutter pub add json_annotation dev:build_runner dev:json_serializable
...
+ build_runner 2.17.1
+ json_annotation 4.12.0
+ json_serializable 6.15.2
Changed 38 dependencies!
```

### Qo'lda: `lib/model/qolda.dart`

```dart
// Qo'lda serializatsiya: fromJson va toJson o'zimiz yozamiz
class Muallif {
  Muallif(this.ism, this.mamlakat);

  final String ism;
  final String mamlakat;

  Muallif.fromJson(Map<String, dynamic> json)
      : ism = json['ism'] as String,
        mamlakat = json['mamlakat'] as String;

  Map<String, dynamic> toJson() => {'ism': ism, 'mamlakat': mamlakat};
}

class Kitob {
  Kitob(this.nom, this.narx, this.muallif);

  final String nom;
  final int narx;
  final Muallif muallif;

  Kitob.fromJson(Map<String, dynamic> json)
      : nom = json['nom'] as String,
        narx = json['narx'] as int,
        muallif = Muallif.fromJson(json['muallif'] as Map<String, dynamic>);

  Map<String, dynamic> toJson() => {'nom': nom, 'narx': narx, 'muallif': muallif.toJson()};
}
```

### Generatsiya: `lib/model/kitob.dart`

```dart
// Kod generatsiyasi: json_serializable fromJson/toJson ni kitob.g.dart ga yozadi
import 'package:json_annotation/json_annotation.dart';

part 'kitob.g.dart';

@JsonSerializable()
class Muallif {
  Muallif(this.ism, this.mamlakat);

  final String ism;
  final String mamlakat;

  factory Muallif.fromJson(Map<String, dynamic> json) => _$MuallifFromJson(json);

  Map<String, dynamic> toJson() => _$MuallifToJson(this);
}

@JsonSerializable(explicitToJson: true) // ichidagi Muallif ham toJson bo'lsin
class Kitob {
  Kitob({required this.nom, required this.narx, required this.nashrYili, required this.muallif, this.mavjud = false});

  @JsonKey(required: true) // JSON'da bo'lishi shart
  final String nom;
  final int narx;

  @JsonKey(name: 'nashr_yili') // JSON'dagi nomi boshqacha
  final int nashrYili;

  @JsonKey(defaultValue: false) // kalit yo'q yoki null bo'lsa
  final bool mavjud;

  final Muallif muallif;

  factory Kitob.fromJson(Map<String, dynamic> json) => _$KitobFromJson(json);

  Map<String, dynamic> toJson() => _$KitobToJson(this);
}
```

Generatorni ishga tushiramiz. Bizning VPS'da `dart` buyrug'i Dart qismi (5–12-boblar) uchun o'rnatilgan alohida Dart SDK'ga
ishora qiladi — Flutter loyihasida u ishlamadi:

```text vps
$ which dart
/usr/local/bin/dart
$ dart run build_runner build --delete-conflicting-outputs
Because salom depends on flutter_test from sdk which doesn't exist (the Flutter SDK is not available), version solving failed.

Flutter users should use `flutter pub` instead of `dart pub`.
```

Flutter loyihasida Flutter ichidagi `dart` kerak (oddiy o'rnatishda `flutter/bin` PATH'da bo'lgani uchun `dart` aynan shu):

```text vps
$ /opt/flutter/bin/dart run build_runner build --delete-conflicting-outputs
  compiling builders/aot
  94s compiling builders/aot
W These options have been removed and were ignored: --delete-conflicting-outputs
  ...
  Built with build_runner/aot in 138s; wrote 4 outputs.
```

E'tibor bering: FD'dagi `--delete-conflicting-outputs` build_runner 2.17.1 da **olib tashlangan** — ogohlantirish beradi va
e'tiborga olinmaydi. Birinchi ishga tushirish uzoq (138 s — generatorlar kompilyatsiya qilinadi); keyingisi 19 soniya bo'ldi.

Generatsiya qilingan `lib/model/kitob.g.dart`:

```dart
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'kitob.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Muallif _$MuallifFromJson(Map<String, dynamic> json) =>
    Muallif(json['ism'] as String, json['mamlakat'] as String);

Map<String, dynamic> _$MuallifToJson(Muallif instance) => <String, dynamic>{
  'ism': instance.ism,
  'mamlakat': instance.mamlakat,
};

Kitob _$KitobFromJson(Map<String, dynamic> json) {
  $checkKeys(json, requiredKeys: const ['nom']);
  return Kitob(
    nom: json['nom'] as String,
    narx: (json['narx'] as num).toInt(),
    nashrYili: (json['nashr_yili'] as num).toInt(),
    muallif: Muallif.fromJson(json['muallif'] as Map<String, dynamic>),
    mavjud: json['mavjud'] as bool? ?? false,
  );
}

Map<String, dynamic> _$KitobToJson(Kitob instance) => <String, dynamic>{
  'nom': instance.nom,
  'narx': instance.narx,
  'nashr_yili': instance.nashrYili,
  'mavjud': instance.mavjud,
  'muallif': instance.muallif.toJson(),
};
```

Ko'rinib turibdiki, generator qo'lda yozadigan kodimizni yozdi: `nashr_yili` kaliti, `mavjud` uchun `?? false`, `nom` uchun
`$checkKeys`, ichidagi `muallif.toJson()`. Bu faylni qo'lda o'zgartirilmaydi — model o'zgarsa, generator qayta ishga
tushiriladi.

### Testlar: `test/json_test.dart`

Oxirgi test `lib/model/oddiy.dart` dagi klassni ishlatadi (`explicitToJson` siz) — u "Tipik xatolar"da.

```dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/model/kitob.dart';
import 'package:salom/model/oddiy.dart';
import 'package:salom/model/qolda.dart' as qolda;

const matn = '{"nom": "Toza kod", "narx": 80000, "nashr_yili": 2008, '
    '"muallif": {"ism": "R. Martin", "mamlakat": "US"}}';

void main() {
  test('Qo\'lda', () {
    final k = qolda.Kitob.fromJson(jsonDecode(matn) as Map<String, dynamic>);
    debugPrint('qo\'lda: ${k.nom}, ${k.narx}, ${k.muallif.ism}');
    debugPrint('qo\'lda → JSON: ${jsonEncode(k)}');
  });

  test('json_serializable', () {
    final k = Kitob.fromJson(jsonDecode(matn) as Map<String, dynamic>);
    debugPrint('generatsiya: ${k.nom}, nashrYili=${k.nashrYili}, mavjud=${k.mavjud}');
    debugPrint('generatsiya → JSON: ${jsonEncode(k)}');
  });

  test('Xato JSON', () {
    for (final yomon in [
      '{"narx": 1, "nashr_yili": 1, "muallif": {"ism": "a", "mamlakat": "b"}}', // nom yo'q
      '{"nom": "a", "narx": "50000", "nashr_yili": 1, "muallif": {"ism": "a", "mamlakat": "b"}}', // narx satr
    ]) {
      try {
        Kitob.fromJson(jsonDecode(yomon) as Map<String, dynamic>);
      } catch (e) {
        debugPrint('${e.runtimeType}: ${e.toString().split('\n').first}');
      }
    }
  });

  test('explicitToJson yo\'q', () {
    final k = OddiyKitob('Toza kod', Muallif('R. Martin', 'US'));
    debugPrint('toJson(): ${k.toJson()}');
  });
}
```

```text vps
$ flutter test test/json_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/json_test.dart
00:00 +0: Qo'lda
qo'lda: Toza kod, 80000, R. Martin
qo'lda → JSON: {"nom":"Toza kod","narx":80000,"muallif":{"ism":"R. Martin","mamlakat":"US"}}
00:00 +1: json_serializable
generatsiya: Toza kod, nashrYili=2008, mavjud=false
generatsiya → JSON: {"nom":"Toza kod","narx":80000,"nashr_yili":2008,"mavjud":false,"muallif":{"ism":"R. Martin","mamlakat":"US"}}
00:00 +2: Xato JSON
MissingRequiredKeysException: MissingRequiredKeysException: Required keys are missing: nom.
_TypeError: type 'String' is not a subtype of type 'num' in type cast
00:00 +3: explicitToJson yo'q
toJson(): {nom: Toza kod, muallif: Instance of 'Muallif'}
00:00 +4: All tests passed!
```

- Ikkala usul bir xil natija berdi; generatsiyadagisi JSON'da `nashr_yili` nomini va yo'q `mavjud` uchun `false` ni qo'ydi.
- `required: true` — `nom` yo'q JSON'da `MissingRequiredKeysException`.
- `narx` satr bo'lib kelsa — `type 'String' is not a subtype of type 'num'`. JSON xatosi model chegarasida ushlanadi, UI'ga
  noto'g'ri ma'lumot o'tmaydi.

### Fonda o'qish: `lib/model/fonda.dart`

```dart
import 'dart:convert';

import 'package:flutter/foundation.dart';

import 'kitob.dart';

/// Katta JSON matnini Kitob ro'yxatiga aylantiradi (og'ir ish)
List<Kitob> kitoblarniOqi(String matn) {
  final royxat = (jsonDecode(matn) as List<Object?>).cast<Map<String, dynamic>>();
  return royxat.map(Kitob.fromJson).toList();
}

/// Xuddi shu ish — alohida isolate'da, asosiy oqim bo'sh qoladi
Future<List<Kitob>> kitoblarniFondaOqi(String matn) => compute(kitoblarniOqi, matn);
```

`test/fonda_test.dart` — 200 000 kitobli JSON. Ish davomida asosiy oqimda har 1 ms da ishlashi kerak bo'lgan taymer necha
marta ishlaganini sanaymiz: taymer ishlamasa, asosiy oqim band — ilovada bu kadr chizilmasligi (qotish) degani.

```dart
import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:salom/model/fonda.dart';

// 200 000 ta kitobli katta JSON
final katta = jsonEncode([
  for (var i = 0; i < 200000; i++)
    {'nom': 'Kitob $i', 'narx': i, 'nashr_yili': 2000 + i % 26, 'muallif': {'ism': 'M$i', 'mamlakat': 'UZ'}},
]);

/// Ish davomida asosiy oqim har 1 ms da necha marta "nafas oldi"
Future<int> taymerBilan(Future<void> Function() ish) async {
  var tik = 0;
  final t = Timer.periodic(const Duration(milliseconds: 1), (_) => tik++);
  await ish();
  t.cancel();
  return tik;
}

void main() {
  test('Asosiy oqimda va fonda', () async {
    debugPrint('JSON hajmi: ${(katta.length / 1024 / 1024).toStringAsFixed(1)} MB');

    final s = Stopwatch()..start();
    var tik = await taymerBilan(() async => kitoblarniOqi(katta));
    debugPrint('asosiy oqimda: ${s.elapsedMilliseconds} ms, taymer $tik marta ishladi');

    s.reset();
    tik = await taymerBilan(() => kitoblarniFondaOqi(katta));
    debugPrint('compute bilan: ${s.elapsedMilliseconds} ms, taymer $tik marta ishladi');
  });
}
```

```text vps
$ flutter test test/fonda_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/fonda_test.dart
00:00 +0: Asosiy oqimda va fonda
JSON hajmi: 18.6 MB
asosiy oqimda: 2201 ms, taymer 0 marta ishladi
compute bilan: 2060 ms, taymer 1187 marta ishladi
00:07 +1: All tests passed!
```

- 18.6 MB JSON'ni o'qish ~2 soniya oldi — FD aytgan 16 ms dan 130 martadan ham ko'p.
- **Asosiy oqimda** taymer **0** marta ishladi: 2 soniya davomida oqim hech narsaga javob bermadi. Ilovada bu — 2 soniya
  qotgan ekran.
- **`compute` bilan** ish vaqti deyarli bir xil, lekin taymer 1187 marta ishladi: asosiy oqim bo'sh edi, ekran chizilishda
  davom etardi. `compute` ishni tezlashtirmaydi — uni asosiy oqimdan olib ketadi.

## Tipik xatolar

FD'dagi `@JsonKey(ignore: true)` bilan `lib/model/oddiy.dart`:

```dart
// Tipik xatolar uchun: explicitToJson yo'q va FD'dagi @JsonKey(ignore: true)
import 'package:json_annotation/json_annotation.dart';

import 'kitob.dart';

part 'oddiy.g.dart';

@JsonSerializable()
class OddiyKitob {
  OddiyKitob(this.nom, this.muallif, {this.tasdiqKodi = ''});

  final String nom;
  final Muallif muallif;

  @JsonKey(ignore: true)
  final String tasdiqKodi;

  factory OddiyKitob.fromJson(Map<String, dynamic> json) => _$OddiyKitobFromJson(json);

  Map<String, dynamic> toJson() => _$OddiyKitobToJson(this);
}
```

```text vps
$ flutter analyze
   info • 'ignore' is deprecated and shouldn't be used. Use `includeFromJson` and `includeToJson` with a value of `false` instead. Try replacing the use of the deprecated member with the replacement • lib/model/oddiy.dart:15:12 • deprecated_member_use
```

`json_annotation` 4.12.0 da `ignore` eskirgan. Uning o'rniga `@JsonKey(includeFromJson: false, includeToJson: false)` —
shunda `flutter analyze` toza (`No issues found!`), generatsiya qilingan `oddiy.g.dart` da `tasdiqKodi` yo'q va `toJson()`
natijasi: `{nom: Toza kod, muallif: Instance of 'Muallif'}`.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `toJson()` da `Instance of 'Muallif'` | Ichma-ich klass, `explicitToJson` yo'q | `@JsonSerializable(explicitToJson: true)` (FD) |
| `Target of URI hasn't been generated: '...oddiy.g.dart'` | Generator ishga tushirilmagan | `dart run build_runner build` (yoki `watch`) |
| `the Flutter SDK is not available` | Flutter loyihasida alohida Dart SDK'ning `dart` i | Flutter ichidagi `dart` (`flutter/bin`) |
| `--delete-conflicting-outputs ... removed and were ignored` | build_runner 2.17 da bu bayroq yo'q | Bayroqsiz `dart run build_runner build` |
| `'ignore' is deprecated` | `json_annotation` 4.12 da eskirgan | `includeFromJson: false, includeToJson: false` |
| `MissingRequiredKeysException` | `required: true` kalit JSON'da yo'q | Server bilan kelishuv yoki `defaultValue` |
| `type 'String' is not a subtype of type 'num'` | JSON'dagi tur modeldagidan boshqa | Server formatini tekshiring; kerak bo'lsa maxsus `fromJson` |
| Katta JSON'da ekran qotadi | O'qish asosiy oqimda | `compute(...)` (FD) |
| `compute` ga `http.Response` berilgan | Isolate'lar orasida murakkab obyekt | `response.body` (matn) bering (FD) |

## Amaliyot

1. FD bo'yicha qachon qo'lda, qachon kod generatsiyasi?
2. Nega Flutter'da reflection'ga asoslangan JSON kutubxonasi yo'q?
3. `part 'kitob.g.dart';` va `_$KitobFromJson` nima?
4. `explicitToJson: true` nimani hal qiladi?
5. FD qachon JSON'ni fonda o'qishni tavsiya qiladi? `compute` ishni tezlashtiradimi?
6. `compute` ga nimani berish mumkin, nimani — yo'q?
7. Kitob sharhi uchun `Sharh` modeli yozing: `matn`, `baho` (JSON'da `baho_ball`), `teglar` (ro'yxat, JSON'da bo'lmasa — bo'sh).
   `{"matn": "Foydali", "baho_ball": 5}` dan o'qib, qayta JSON qilsangiz nima chiqadi?

<details>
<summary>Javoblar</summary>

1. Qo'lda — kichik loyiha va prototip; generatsiya — o'rta/katta loyiha, ko'p va murakkab model.
2. Reflection Flutter'da o'chirilgan: u hamma kodni ishlatilgandek ko'rsatib, tree shaking'ga xalaqit beradi.
3. `part` — generatsiya qilingan fayl shu kutubxonaning bir qismi (shaxsiy `_$...` funksiyalarga kirish uchun). `_$KitobFromJson`
   — generator yozgan funksiya.
4. Ichma-ich obyekt (`Muallif`) `toJson()` da ham `Map` bo'lishi — aks holda `Instance of 'Muallif'`.
5. Ish 16 ms dan uzoq bo'lsa (FD). Tezlashtirmaydi: testda ~2 s ikkalasida ham, lekin `compute` da asosiy oqim bo'sh (taymer 0
   o'rniga 1187 marta).
6. Oddiy qiymatlar va sodda obyektlar (masalan, `String`, `List<Kitob>`); `Future`, `http.Response` kabilar — muammo (FD).
7. `@JsonSerializable()` klass: `@JsonKey(name: 'baho_ball') final int baho;`, `@JsonKey(defaultValue: <String>[]) final
   List<String> teglar;`, `fromJson`/`toJson` va `part 'sharh.g.dart';`. VPS'dagi testda: `teglar: [], JSON:
   {"matn":"Foydali","baho_ball":5,"teglar":[]}`.

</details>

## Rasmiy hujjat

- [FD: JSON and serialization](https://docs.flutter.dev/data-and-backend/serialization/json)
- [FD: Parse JSON in the background](https://docs.flutter.dev/cookbook/networking/background-parsing)
- [json_serializable (pub.dev)](https://pub.dev/packages/json_serializable) · [json_annotation: JsonKey](https://pub.dev/documentation/json_annotation/latest/json_annotation/JsonKey-class.html) · [build_runner (pub.dev)](https://pub.dev/packages/build_runner)
- [API: compute](https://api.flutter.dev/flutter/foundation/compute.html) · [dart:convert](https://api.dart.dev/dart-convert/dart-convert-library.html)
