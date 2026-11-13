# 05 — O'zgaruvchilar va turlar

[Mundarija](README.md)

## Tushuncha

Flutter ilovasi **Dart** tilida yoziladi. Bu va keyingi 7 ta bob — Dart'ning ilova yozish uchun kerakli qismi. Misollar
sinov VPS'ida Dart SDK 3.14.0 da (Flutter 3.50.0 ichidagi versiya) `dart run` bilan ishga tushirilgan.

DD (Variables): o'zgaruvchi **havola** (reference) saqlaydi. `var name = 'Bob';` — `name` o'zgaruvchisi "Bob" qiymatli
`String` obyektiga havola. DD (Built-in types): Dart'da har o'zgaruvchi obyektga — biror **klass** nusxasiga ishora qiladi,
sonlar ham obyekt.

Turni yozish uch xil:

```dart
var name = 'Bob';      // tur qiymatdan xulosa qilinadi (type inference) — String
String name = 'Bob';   // xulosa qilinadigan turni aniq yozish
Object name = 'Bob';   // bitta tur bilan cheklanmagan qiymat
```

DD: obyekt bitta tur bilan cheklanmasa — `Object` (zarurat bo'lsa `dynamic`). `dynamic` statik tekshiruvni o'chiradi, shuning
uchun DD odatda `Object` yoki `Object?` ni tavsiya qiladi. DD'ning uslub qo'llanmasi lokal o'zgaruvchilar uchun tur yozish
o'rniga `var` ni tavsiya qiladi.

### `final` va `const`

DD: o'zgaruvchini hech qachon o'zgartirmoqchi bo'lmasangiz — `var` o'rniga yoki tur bilan birga `final` yoki `const`:

| Kalit so'z | Ma'nosi (DD) | Qiymat qachon ma'lum |
| --- | --- | --- |
| `final` | faqat bir marta beriladi | dastur ishlayotganda (masalan, hozirgi vaqt) |
| `const` | **kompilyatsiya vaqtidagi o'zgarmas** (compile-time constant); `const` o'zgaruvchi avtomatik `final` | kompilyatsiyada: son yoki satr literali, boshqa `const`, ular ustidagi arifmetika |

DD: klass ichidagi `const` o'zgaruvchi `static const` bo'ladi; nusxa (instance) o'zgaruvchilari `final` bo'lishi mumkin,
`const` emas. `final` obyektning maydonlari o'zgarishi mumkin, `const` obyekt va uning maydonlari esa o'zgarmas (immutable).
Flutter'da `const` widget'lar shu sababli muhim (13-bob).

### Sonlar

DD: Dart'da ikki xil son, ikkalasi `num` turining quyi turi:

| Tur | Nima (DD) |
| --- | --- |
| `int` | butun son, 64 bitdan oshmaydi. Native platformalarda −2⁶³ … 2⁶³−1; **web'da** JavaScript soni sifatida −2⁵³ … 2⁵³−1 |
| `double` | 64 bitli kasr son, IEEE 754 standarti bo'yicha |
| `num` | ikkalasini ham saqlay oladi |

Butun son kerak bo'lgan joyda kasrga avtomatik aylanadi: `double z = 1;` — `1.0` bilan bir xil. Uzun sonlarni o'qish
uchun `_` ajratgich mumkin (`1_000_000`, DD: til versiyasi 3.6 dan).

### Satrlar va bool

DD: `String` — UTF-16 kod birliklari ketma-ketligi. Bittalik yoki qo'shtirnoq; ichiga ifoda `${...}` bilan qo'yiladi
(oddiy nom bo'lsa `{}` siz: `$ism`); ko'p qatorli satr — uchta qo'shtirnoq; `r` prefiksli **xom** (raw) satrda `\n` ham
oddiy belgi.

DD: `bool` turining faqat ikki qiymati bor — `true` va `false`. Dart'da `if (son)` yoki `if (satr)` yozib bo'lmaydi —
shartni aniq tekshirish kerak (`satr.isEmpty`, `son == 0`).

### Asosiy operatorlar

DD (Operators) dan bu bobda kerakli qismi:

| Operator | Ma'nosi (DD) |
| --- | --- |
| `+` `-` `*` `/` | qo'shish, ayirish, ko'paytirish, bo'lish (`/` natijasi doim `double`) |
| `~/` | bo'lib, **butun** natija qaytarish |
| `%` | butun bo'lishdagi qoldiq |
| `==` `!=` `>` `<` `>=` `<=` | solishtirish |
| `is`, `is!` | obyekt shu turdanmi / emasmi |
| `as` | turga keltirish (cast) |
| `&&` `\|\|` `!` | mantiqiy VA, YOKI, EMAS |
| `shart ? a : b` | shartli ifoda |

`??`, `??=`, `?.` kabi null bilan ishlaydigan operatorlar — 6-bobda.

## Ko'rib chiqamiz

Hammasini bitta dasturda — `ozgaruvchilar.dart`:

```dart
void main() {
  // 1. var — tur qiymatdan xulosa qilinadi
  var ism = 'Ali';
  var yosh = 25;
  print('$ism — ${ism.runtimeType}, $yosh — ${yosh.runtimeType}');

  // 2. Turni aniq yozish va Object
  String shahar = 'Toshkent';
  Object nimadir = 'satr';
  nimadir = 42; // Object — har qanday qiymat
  print('$shahar, $nimadir (${nimadir.runtimeType})');

  // 3. final — bir marta beriladi, const — kompilyatsiya vaqtidagi o'zgarmas
  final boshlandi = DateTime(2026, 11, 13);
  const sekundMs = 1000;
  const kutish = 5 * sekundMs;
  print('boshlandi: $boshlandi, kutish: $kutish ms');

  // 4. Sonlar
  var butun = 7;
  var kasr = 2.5;
  num ikkalasi = 1;
  ikkalasi += 2.5;
  double d = 1; // 1.0 ga aylanadi
  print('$butun ${butun.runtimeType}, $kasr ${kasr.runtimeType}, $ikkalasi, $d');
  print('7 / 2 = ${7 / 2}, 7 ~/ 2 = ${7 ~/ 2}, 7 % 2 = ${7 % 2}');
  print('aholi: ${36_000_000}');

  // 5. Aylantirish
  var son = int.parse('42');
  var narx = double.parse('19.9');
  print('${son + 1}, ${narx * 2}, ${3.14159.toStringAsFixed(2)}, ${(42).toString().length} belgi');

  // 6. Satrlar
  var salom = 'Salom, ${ism.toUpperCase()}!';
  var kop = '''
Birinchi qator
Ikkinchi qator''';
  var xom = r'Xom satrda \n maxsus emas';
  print(salom);
  print(kop);
  print(xom);

  // 7. bool — faqat true va false
  var bosh = '';
  print('bo\'shmi: ${bosh.isEmpty}, 0 mi: ${butun == 0}');

  // 8. Tur tekshiruvi va shartli ifoda
  Object qiymat = 'Dart';
  if (qiymat is String) print('uzunligi: ${qiymat.length}'); // is dan keyin String deb ko'riladi
  var holat = yosh >= 18 ? 'katta' : 'yosh';
  print('holat: $holat');
}
```

```text vps
$ dart run ozgaruvchilar.dart
Ali — String, 25 — int
Toshkent, 42 (int)
boshlandi: 2026-11-13 00:00:00.000, kutish: 5000 ms
7 int, 2.5 double, 3.5, 1.0
7 / 2 = 3.5, 7 ~/ 2 = 3, 7 % 2 = 1
aholi: 36000000
43, 39.8, 3.14, 2 belgi
Salom, ALI!
Birinchi qator
Ikkinchi qator
Xom satrda \n maxsus emas
bo'shmi: true, 0 mi: false
uzunligi: 4
holat: katta
```

Natijada ko'rinadi:

- `var` bilan e'lon qilingan `ism` — `String`, `yosh` — `int`: tur qiymatdan aniqlandi.
- `Object` turidagi o'zgaruvchiga avval satr, keyin son berildi.
- `7 / 2` — `3.5` (`double`), `7 ~/ 2` — `3` (butun), `7 % 2` — `1`.
- `double d = 1` — `1.0`.
- Xom satrda `\n` yangi qator emas, ikki oddiy belgi bo'lib chiqdi.
- `qiymat` `Object` deb e'lon qilingan, lekin `is String` tekshiruvidan keyin uning `.length` xossasini ishlatsa bo'ldi.

## Tipik xatolar

Uchta xato bitta faylda — `xatolar.dart`:

```dart
void main() {
  final ism = 'Ali';
  ism = 'Vali';

  var son = 0;
  const kutish = son * 2;

  var bosh = '';
  if (bosh) print('bo\'sh emas');
}
```

Dart bularni dastur ishga tushmasdan oldin, tahlil (`dart analyze`) bosqichida topadi:

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:3:3 - The final variable 'ism' can only be set once. Try making 'ism' non-final. - assignment_to_final_local
  error - xatolar.dart:6:18 - Const variables must be initialized with a constant value. Try changing the initializer to be a constant expression. - const_initialized_with_non_constant_value
  error - xatolar.dart:9:7 - Conditions must have a static type of 'bool'. Try changing the condition. - non_bool_condition
warning - xatolar.dart:2:9 - The value of the local variable 'ism' isn't used. Try removing the variable or using it. - unused_local_variable
warning - xatolar.dart:6:9 - The value of the local variable 'kutish' isn't used. Try removing the variable or using it. - unused_local_variable

5 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `final` o'zgaruvchiga qayta qiymat berish | `final` faqat bir marta beriladi | O'zgaradigan qiymat uchun `var` |
| `const` ga oddiy o'zgaruvchidan hisoblangan qiymat | `const` qiymati kompilyatsiyada ma'lum bo'lishi kerak, `son` esa dastur ishlaganda | `final` ishlating yoki `son` ni ham `const` qiling |
| `if (bosh)` — satrni shart qilish | Dart'da shart faqat `bool` | `if (bosh.isNotEmpty)` |
| Hamma joyda `dynamic` | Statik tekshiruv o'chadi: xato faqat ishlaganda chiqadi | `var` yoki aniq tur; har qanday qiymat kerak bo'lsa — `Object` |
| Butun bo'lish uchun `/` | `/` doim `double` qaytaradi (`7 / 2` — `3.5`) | `~/` (`7 ~/ 2` — `3`) |

## Amaliyot

1. `var x = 3.0;` — `x` ning turi nima? `var y = 3;` chi?
2. `final` va `const` farqi nima? `DateTime.now()` ni qaysi biriga berish mumkin?
3. `10 / 4`, `10 ~/ 4` va `10 % 4` natijalari qanday?
4. Web'da `int` ning chegarasi nega boshqacha?
5. `'Narx: $narx so\'m'` va `'Jami: ${narx * 2}'` — ikkinchisida nega `{}` kerak?
6. Bo'sh satrni tekshirish uchun `if (satr)` nega xato beradi va qanday yoziladi?

<details>
<summary>Javoblar</summary>

1. `x` — `double`, `y` — `int` (tur qiymatdan xulosa qilinadi).
2. `final` — bir marta beriladi, qiymat dastur ishlaganda ham hisoblanishi mumkin; `const` — kompilyatsiya vaqtida ma'lum bo'lishi shart. `DateTime.now()` ni faqat `final` ga.
3. `2.5`, `2`, `2`.
4. Web'da `int` JavaScript soni sifatida (kasr qismsiz 64 bitli kasr son) ifodalanadi, shuning uchun −2⁵³ … 2⁵³−1.
5. `$narx` — oddiy nom, `{}` shart emas; `narx * 2` — ifoda, uni `${...}` ichiga olish kerak.
6. Dart'da shart faqat `bool` bo'ladi (`non_bool_condition` xatosi); `if (satr.isEmpty)` yoki `if (satr.isNotEmpty)`.

</details>

## Rasmiy hujjat

- [DD: Variables](https://dart.dev/language/variables)
- [DD: Built-in types](https://dart.dev/language/built-in-types)
- [DD: Operators](https://dart.dev/language/operators)
