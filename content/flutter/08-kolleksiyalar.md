# 08 — Kolleksiyalar, record va pattern

[Mundarija](README.md)

## Tushuncha

### Uch asosiy kolleksiya

DD (Collections):

| Tur | Nima (DD) | Literal |
| --- | --- | --- |
| `List` | tartiblangan obyektlar guruhi (boshqa tillardagi *massiv*); indeks 0 dan, oxirgisi — `length - 1` | `[1, 2, 3]` |
| `Set` | **tartibsiz**, **takrorlanmaydigan** elementlar to'plami | `{'a', 'b'}` |
| `Map` | kalit-qiymat juftlari; har kalit bir marta uchraydi, bitta qiymat bir nechta kalitda bo'lishi mumkin | `{'non': 4000}` |

DD: Dart literaldan turni xulosa qiladi — `[1, 2, 3]` — `List<int>`; noto'g'ri turdagi element qo'shilsa, tahlilchi
yoki ish vaqti xato beradi. DD'dagi muhim tuzoq: bo'sh `{}` — **Map**, bo'sh Set uchun turini yozish kerak:
`<String>{}`.

### Kolleksiya ichidagi elementlar

DD ("Collection elements"): kolleksiya literali ichida oddiy qiymatlardan tashqari:

| Element | Nima qiladi (DD) |
| --- | --- |
| `...ketma-ketlik` | **spread** — boshqa kolleksiyaning barcha elementlarini qo'shadi |
| `...?ketma-ketlik` | null bo'lsa hech narsa qo'shmaydigan spread |
| `?ifoda` | **null-aware element** — qiymat null bo'lmasagina qo'shadi (til versiyasi 3.8 dan) |
| `if (shart) qiymat` | shart rost bo'lsa qo'shadi (`else` ham bo'lishi mumkin) |
| `for (x in ...) qiymat` | har element uchun qiymat qo'shadi |

Flutter'da bu juda ko'p ishlatiladi: widget ro'yxatini shart bilan yoki boshqa ro'yxatdan qurish
(`children: [if (yuklanmoqda) Loader(), for (var x in items) Tile(x)]`).

### `Iterable` metodlari

DD (Iterable collections): `Iterable` — elementlarini ketma-ket o'qish mumkin bo'lgan kolleksiya; `List` va `Set` —
`Iterable`. `Map` ning `entries` va `values` xossalari ham `Iterable` beradi. Asosiy metodlar: `where` (filtrlash), `map`
(har elementni o'zgartirish), `any` / `every` (biri yoki hammasi shartga mosmi), `firstWhere` (birinchi mos kelgani).
DD: `map()` **dangasa** (lazy) `Iterable` qaytaradi — funksiya elementlar aylanib chiqilgandagina chaqiriladi; ro'yxat
kerak bo'lsa `.toList()`.

### Record

DD (Records): **record** — anonim, **o'zgarmas**, bir nechta qiymatni bitta obyektga yig'adigan tur. Boshqa
kolleksiyalardan farqi: o'lchami belgilangan, elementlari har xil turda bo'lishi mumkin va har biri turlangan.

- Maydonlar pozitsion yoki nomli: `('Ali', yosh: 25)`.
- Pozitsion maydon — `$1`, `$2` …, nomli maydon — o'z nomi bilan o'qiladi. Setter yo'q (o'zgarmas).
- Ikki record **tuzilmasi** (maydonlar, turlari, nomlari) va qiymatlari bir xil bo'lsa — teng.
- Asosiy foydasi — funksiyadan **bir nechta qiymat qaytarish**.

### Pattern

DD (Patterns): **pattern** (naqsh) qiymatni **tekshiradi** (match — ma'lum shaklda, ma'lum turda yoki ma'lum qiymatga
tengmi) va/yoki **bo'laklarga ajratadi** (destructure — qismlarini o'zgaruvchilarga oladi). Naqsh qayerda bo'ladi:
o'zgaruvchi e'lonida (`var (a, b) = …`), o'zlashtirishda (`(b, a) = (a, b)` — almashtirish), `switch` va `if-case` da
(7-bob), `for-in` siklida. DD'dagi amaliy misol — tarmoqdan kelgan JSON'ning tuzilmasini bitta `if-case` bilan
tekshirish.

## Ko'rib chiqamiz

`kolleksiyalar.dart`:

```dart
(String, int) engQimmat(List<int> narxlar) {
  final eng = narxlar.reduce((a, b) => a > b ? a : b);
  return ('eng qimmat', eng);
}

void main() {
  // 1. List — tartibli, indeks 0 dan
  var mevalar = ['olma', 'nok', 'uzum'];
  mevalar.add('anor');
  print('$mevalar, birinchisi: ${mevalar[0]}, uzunligi: ${mevalar.length}, turi: ${mevalar.runtimeType}');

  // 2. Set — takrorlanmaydigan elementlar
  var teglar = {'dart', 'flutter', 'dart'};
  print('$teglar — ${teglar.length} ta');
  var bosh = <String>{}; // bo'sh Set; faqat {} — bu Map bo'ladi
  print('bo\'sh set turi: ${bosh.runtimeType}, {} turi: ${{}.runtimeType}');

  // 3. Map — kalit: qiymat
  var narx = {'non': 4000, 'sut': 12000};
  narx['tuxum'] = 1500;
  print('$narx, sut: ${narx['sut']}, kalitlar: ${narx.keys.toList()}');

  // 4. Kolleksiya ichida if, for, spread (...), null-aware (?)
  var yetkazish = true;
  String? promo;
  var qatorlar = [
    'Buyurtma',
    for (var m in mevalar) '- $m',
    if (yetkazish) 'Yetkazib berish: bor',
    ?promo, // null bo'lgani uchun qo'shilmaydi
    ...['Rahmat!'],
  ];
  print(qatorlar);

  // 5. Iterable metodlari: where, map, any, every, firstWhere
  var sonlar = [4, 9, 15, 22, 7];
  print('juftlar: ${sonlar.where((n) => n.isEven).toList()}');
  print('ikki barobar: ${sonlar.map((n) => n * 2).toList()}');
  print('10 dan kattasi bormi: ${sonlar.any((n) => n > 10)}, hammasi musbatmi: ${sonlar.every((n) => n > 0)}');
  print('birinchi 10 dan katta: ${sonlar.firstWhere((n) => n > 10)}');

  // 6. Record — bir nechta qiymatni bitta qiymatga yig'ish
  var odam = ('Ali', yosh: 25, shahar: 'Toshkent');
  print('${odam.$1}, ${odam.yosh}, ${odam.shahar}');
  print('teng: ${(1, 2) == (1, 2)}');

  // 7. Funksiyadan bir nechta qiymat qaytarish va destructuring
  var (izoh, qiymat) = engQimmat([12000, 4000, 30000]);
  print('$izoh: $qiymat');

  // 8. Pattern: o'zgaruvchilarni almashtirish va for-in'da Map
  var (a, b) = ('chap', 'o\'ng');
  (b, a) = (a, b);
  print('$a $b');
  for (var MapEntry(:key, :value) in narx.entries) {
    print('$key — $value so\'m');
  }

  // 9. if-case bilan JSON'ni tekshirish
  Object maLumot = {
    'foydalanuvchi': ['Lola', 13],
  };
  if (maLumot case {'foydalanuvchi': [String ism, int yosh]}) {
    print('$ism $yosh yoshda');
  }
  Object notogri = {
    'foydalanuvchi': ['Lola', 'o\'n uch'],
  };
  if (notogri case {'foydalanuvchi': [String ism, int yosh]}) {
    print('$ism $yosh');
  } else {
    print('tuzilma mos emas');
  }
}
```

```text vps
$ dart run kolleksiyalar.dart
[olma, nok, uzum, anor], birinchisi: olma, uzunligi: 4, turi: List<String>
{dart, flutter} — 2 ta
bo'sh set turi: _Set<String>, {} turi: _Map<dynamic, dynamic>
{non: 4000, sut: 12000, tuxum: 1500}, sut: 12000, kalitlar: [non, sut, tuxum]
[Buyurtma, - olma, - nok, - uzum, - anor, Yetkazib berish: bor, Rahmat!]
juftlar: [4, 22]
ikki barobar: [8, 18, 30, 44, 14]
10 dan kattasi bormi: true, hammasi musbatmi: true
birinchi 10 dan katta: 15
Ali, 25, Toshkent
teng: true
eng qimmat: 30000
o'ng chap
non — 4000 so'm
sut — 12000 so'm
tuxum — 1500 so'm
Lola 13 yoshda
tuzilma mos emas
```

Natijada:

- `'dart'` Set'ga ikki marta yozilgan, lekin bir marta saqlandi;
- `<String>{}` — Set, oddiy `{}` esa — Map;
- `qatorlar` ro'yxati `for`, `if` va spread bilan qurildi; `?promo` null bo'lgani uchun qo'shilmadi;
- `engQimmat` ikki qiymat qaytardi, `var (izoh, qiymat) = …` ularni ikki o'zgaruvchiga ajratdi;
- `MapEntry(:key, :value)` — Map'ning har juftini to'g'ridan-to'g'ri `key` va `value` o'zgaruvchilariga oldi;
- `if-case` birinchi ma'lumotda mos keldi (`String`, `int`), ikkinchisida yosh satr bo'lgani uchun `else` ishladi.

## Tipik xatolar

`xatolar.dart`:

```dart
void main() {
  var sonlar = [1, 2, 3];
  sonlar.add('to\'rt');

  var bosh = {};
  bosh.add('a');

  var odam = ('Ali', yosh: 25);
  odam.yosh = 26;
}
```

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:3:14 - The argument type 'String' can't be assigned to the parameter type 'int'.  - argument_type_not_assignable
  error - xatolar.dart:6:8 - The method 'add' isn't defined for the type 'Map<dynamic, dynamic>'. Try correcting the name to the name of an existing method, or defining a method named 'add'. - undefined_method
  error - xatolar.dart:9:8 - The setter 'yosh' isn't defined for the type '(String, {int yosh})'. Try importing the library that defines 'yosh', correcting the name to the name of an existing setter, or defining a setter or field named 'yosh'. - undefined_setter

3 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `List<int>` ga satr qo'shish | Literaldan tur xulosa qilingan — `List<int>` | Har xil tur kerak bo'lsa — `<Object>[…]`; aks holda to'g'ri turdagi qiymat |
| Bo'sh Set uchun `var s = {};` | `{}` — Map (`Map<dynamic, dynamic>`), unda `add` yo'q | `var s = <String>{};` yoki `Set<String> s = {};` |
| Record maydonini o'zgartirish | Record o'zgarmas — setter yo'q | Yangi record yarating: `odam = (odam.$1, yosh: 26);` |
| `map(...)` natijasini ro'yxat deb ishlatish | `map` dangasa `Iterable` qaytaradi | `.toList()` (ro'yxat kerak bo'lsa) |
| Tashqi JSON'ni tekshirmasdan `as` bilan ajratish | Tuzilma kutilgandek bo'lmasa — ish vaqtida xato | `if (data case {'kalit': [String a, int b]})` — tekshirish va ajratish birga |

## Amaliyot

1. List, Set va Map farqi nima? Har biriga bitta misol keltiring.
2. `var x = {};` ning turi qanday? Bo'sh Set qanday yaratiladi?
3. `[1, if (false) 2, ...[3, 4], ?null]` natijasi qanday?
4. `where` va `map` nima qaytaradi? Nega ba'zan `.toList()` kerak?
5. Record nima uchun kerak? `var r = ('a', son: 1);` da `'a'` va `1` ga qanday murojaat qilinadi?
6. `if (data case {'user': [String name, int age]})` bir vaqtda nimalarni tekshiradi?

<details>
<summary>Javoblar</summary>

1. List — tartibli, indeksli (`['a', 'b']`); Set — tartibsiz, takrorlanmaydigan (`{'a', 'b'}`); Map — kalit-qiymat (`{'a': 1}`).
2. `Map<dynamic, dynamic>`. Bo'sh Set: `<String>{}` yoki `Set<String> s = {};`.
3. `[1, 3, 4]`.
4. Ikkalasi ham `Iterable` qaytaradi (`map` — dangasa); `List` kerak bo'lganda (masalan, indeks bilan o'qish yoki keyinroq bir necha marta ishlatish) — `.toList()`.
5. Bir nechta har xil turdagi qiymatni bitta qiymatga yig'ish, ayniqsa funksiyadan bir nechta qiymat qaytarish uchun. `r.$1` va `r.son`.
6. `data` Map ekanini, unda `'user'` kaliti borligini, qiymati ikki elementli List ekanini, birinchisi `String`, ikkinchisi `int` ekanini — va mos kelsa `name` va `age` ga ajratadi.

</details>

## Rasmiy hujjat

- [DD: Collections](https://dart.dev/language/collections)
- [DD: Iterable collections](https://dart.dev/libraries/collections/iterables)
- [DD: Records](https://dart.dev/language/records)
- [DD: Patterns](https://dart.dev/language/patterns)
