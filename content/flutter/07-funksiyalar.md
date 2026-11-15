# 07 — Funksiyalar va boshqaruv oqimi

[Mundarija](README.md)

## Tushuncha

### Funksiyalar

DD (Functions): Dart — to'liq obyektga yo'naltirilgan til, shuning uchun **funksiyalar ham obyekt** va ularning turi bor
(`Function`). Funksiyani o'zgaruvchiga berish, boshqa funksiyaga argument qilib uzatish va funksiyadan qaytarish mumkin.

```dart
int kvadrat(int x) {
  return x * x;
}

int kub(int x) => x * x * x;   // bitta ifodali funksiya — "strelka" (arrow) yozuvi
```

DD: `=> ifoda` — `{ return ifoda; }` ning qisqa shakli. `=>` dan keyin faqat **ifoda** bo'ladi (qiymat beradigan narsa),
`if` kabi operator emas — kerak bo'lsa shartli ifoda (`? :`). Effective Dart ochiq API'lar uchun turlarni yozishni tavsiya
qiladi. DD: har funksiya qiymat qaytaradi; `return` bo'lmasa — `return null;` avtomatik qo'shiladi.

### Parametrlar

DD: funksiyada istalgancha **majburiy pozitsion** parametr bo'ladi. Ulardan keyin yo **nomli**, yo **ixtiyoriy
pozitsion** parametrlar keladi (ikkalasi birga emas).

| Tur | E'lon | Chaqirish | Qoida (DD) |
| --- | --- | --- | --- |
| Majburiy pozitsion | `f(String a)` | `f('x')` | tartib bo'yicha |
| Nomli | `f({String? a, int b = 0})` | `f(b: 1, a: 'x')` | `required` bo'lmasa ixtiyoriy; standart qiymat yo'q bo'lsa turi nullable bo'lishi kerak (standarti `null`); standart qiymat — kompilyatsiya vaqtidagi o'zgarmas; argumentlar tartibi muhim emas |
| Majburiy nomli | `f({required String a})` | `f(a: 'x')` | berilmasa — tahlilchi xato beradi |
| Ixtiyoriy pozitsion | `f(String a, [String? b])` | `f('x')` yoki `f('x', 'y')` | `[ ]` ichida; standarti `null` yoki berilgan qiymat |

DD'dagi muhim eslatma: ba'zi API'lar — ayniqsa **Flutter widget konstruktorlari** — majburiy parametrlar uchun ham faqat
**nomli** parametrlarni ishlatadi. Flutter kodida eng ko'p ko'radiganingiz shu: `Text('Salom', style: …)`,
`Padding(padding: …, child: …)`.

### Anonim funksiya va closure

DD: nomsiz funksiyalar — **anonim funksiya**, **lambda** yoki **closure** deyiladi. Ko'pincha boshqa funksiyaga uzatiladi:
`list.map((item) => item.toUpperCase())`.

DD (Lexical closures): **closure** — o'zi yaratilgan joydagi o'zgaruvchilarga, o'sha joydan tashqarida ham murojaat qila
oladigan funksiya obyekti. Funksiya qayerga borsa ham ushlab olgan o'zgaruvchini "eslab qoladi".

### Shartlar: `if` va `switch`

DD (Branches): `if` sharti `bool` bo'lishi kerak (5-bob). `switch` ikki xil:

| | `switch` operatori (statement) | `switch` ifodasi (expression) |
| --- | --- | --- |
| Nima | Mos `case` ning tanasini bajaradi | Mos holatning **qiymatini** qaytaradi |
| Holat | `case naqsh:` | `naqsh =>` |
| Tana | bir nechta operator | bitta ifoda |
| `break` | shart emas — bo'sh bo'lmagan `case` tugagach switch'dan chiqiladi. **Bo'sh** `case` keyingisiga o'tadi | yo'q, har holatda tana bo'lishi shart |
| Boshqa hollar | `default` yoki `_` | faqat `_` |
| Ajratgich | — | `,` |

DD: `case` larda **naqshlar** (pattern) ishlatiladi — masalan, `< 0 || > 100` (mantiqiy-yoki va solishtirish naqshlari).
Naqshlar batafsil — 8-bobda. `when` bilan qo'shimcha shart (guard) qo'yiladi. DD: Dart **to'liqlik tekshiruvi**ni
(exhaustiveness checking) qiladi — qiymat switch'ga kirib, hech bir holatga mos kelmasligi mumkin bo'lsa, bu
kompilyatsiya xatosi.

### Sikllar

DD (Loops): `for`, `for-in` (ro'yxat kabi to'plamlarni aylanib chiqish), `while` (shart avval tekshiriladi), `do-while`
(shart keyin), `break` (sikldan chiqish) va `continue` (keyingi aylanishga o'tish). DD'dagi farq: Dart `for` sikli ichidagi
closure indeksning **qiymatini** ushlaydi — DD'dagi misol JavaScript'da `2` va `2` chiqaradi, Dart'da esa
`0` va `1` — bu tuzoq Dart'da yo'q.

## Ko'rib chiqamiz

`funksiyalar.dart`:

```dart
// 1. Oddiy funksiya va => qisqa yozuv
int kvadrat(int x) {
  return x * x;
}

int kub(int x) => x * x * x;

// 2. Nomli parametrlar: standart qiymat va required
String salom({required String ism, String til = 'uz'}) =>
    til == 'uz' ? 'Salom, $ism!' : 'Hello, $ism!';

// 3. Ixtiyoriy pozitsion parametr — [ ] ichida
String manzil(String shahar, [String? tuman]) =>
    tuman == null ? shahar : '$shahar, $tuman';

// 4. Funksiya qaytaradigan funksiya (closure)
int Function(int) qoshuvchi(int qancha) => (int x) => x + qancha;

void main() {
  print('kvadrat(4) = ${kvadrat(4)}, kub(3) = ${kub(3)}');
  print(salom(ism: 'Ali'));
  print(salom(til: 'en', ism: 'Vali')); // nomli argument tartibi muhim emas
  print('${manzil('Toshkent')} | ${manzil('Toshkent', 'Chilonzor')}');

  // 5. Funksiya — qiymat: o'zgaruvchiga berish va uzatish
  var baland = (String s) => s.toUpperCase();
  print(['olma', 'nok'].map(baland).toList());
  var ikkiQosh = qoshuvchi(2);
  print('ikkiQosh(5) = ${ikkiQosh(5)}');

  // 6. if / else if / else
  var harorat = 28;
  if (harorat > 30) {
    print('issiq');
  } else if (harorat > 15) {
    print('iliq');
  } else {
    print('salqin');
  }

  // 7. switch operatori: break shart emas, bo'sh case keyingisiga o'tadi
  var buyurtma = 'yetkazilmoqda';
  switch (buyurtma) {
    case 'yangi':
    case 'tasdiqlangan':
      print('tayyorlanmoqda');
    case 'yetkazilmoqda':
      print('yo\'lda');
    default:
      print('noma\'lum holat');
  }

  // 8. switch ifodasi va when (guard)
  for (var ball in [95, 72, 40, -5]) {
    var baho = switch (ball) {
      < 0 || > 100 => 'xato ball',
      >= 86 => '5',
      >= 71 => '4',
      int b when b >= 56 => '3',
      _ => '2',
    };
    print('$ball → $baho');
  }

  // 9. Sikllar
  for (var i = 1; i <= 3; i++) {
    print('for: $i');
  }
  for (var meva in ['olma', 'nok']) {
    print('for-in: $meva');
  }
  var n = 3;
  while (n > 0) {
    n--;
  }
  print('while dan keyin n = $n');
  for (var i = 0; i < 10; i++) {
    if (i.isOdd) continue; // toqlarni o'tkazib yuborish
    if (i > 6) break; // 6 dan keyin to'xtash
    print('juft: $i');
  }

  // 10. for ichidagi closure indeksning QIYMATINI saqlaydi
  var chaqiruvlar = <void Function()>[];
  for (var i = 0; i < 2; i++) {
    chaqiruvlar.add(() => print('closure: $i'));
  }
  for (final c in chaqiruvlar) {
    c();
  }
}
```

```text vps
$ dart run funksiyalar.dart
kvadrat(4) = 16, kub(3) = 27
Salom, Ali!
Hello, Vali!
Toshkent | Toshkent, Chilonzor
[OLMA, NOK]
ikkiQosh(5) = 7
iliq
yo'lda
95 → 5
72 → 4
40 → 2
-5 → xato ball
for: 1
for: 2
for: 3
for-in: olma
for-in: nok
while dan keyin n = 0
juft: 0
juft: 2
juft: 4
juft: 6
closure: 0
closure: 1
```

Natijada:

- `salom(til: 'en', ism: 'Vali')` — nomli argumentlar teskari tartibda berilsa ham ishladi; `til` berilmaganda standart
  `'uz'` olindi;
- `ikkiQosh` — `qoshuvchi(2)` qaytargan funksiya; u `qancha = 2` ni eslab qoldi (closure);
- `switch` operatorida `'yetkazilmoqda'` holati ishladi va `default` ga o'tib ketmadi — `break` yozilmagan bo'lsa ham;
- switch ifodasi holatlarni yuqoridan pastga tekshirdi: `95` — `>= 86`, `40` — hech biriga mos kelmay `_` ga tushdi;
- `continue` toq sonlarni o'tkazib yubordi, `break` 6 dan keyin siklni to'xtatdi;
- closure'lar `0` va `1` ni chiqardi — har biri o'z aylanishidagi `i` qiymatini ushlagan.

## Tipik xatolar

`xatolar.dart`:

```dart
String salom({required String ism}) => 'Salom, $ism!';

String baho(bool? otdi) => switch (otdi) {
  true => 'o\'tdi',
  false => 'o\'tmadi',
};

void main() {
  print(salom());
  print(salom('Ali'));
  print(baho(true));
}
```

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:3:28 - The type 'bool?' isn't exhaustively matched by the switch cases since it doesn't match the pattern 'null'. Try adding a wildcard pattern or cases that match 'null'. - non_exhaustive_switch_expression
  error - xatolar.dart:9:9 - The named parameter 'ism' is required, but there's no corresponding argument. Try adding the required argument. - missing_required_argument
  error - xatolar.dart:10:9 - The named parameter 'ism' is required, but there's no corresponding argument. Try adding the required argument. - missing_required_argument
  error - xatolar.dart:10:15 - Too many positional arguments: 0 expected, but 1 found. Try removing the extra positional arguments, or specifying the name for named arguments. - extra_positional_arguments_could_be_named

4 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `required` nomli parametrni bermaslik | `required` — majburiy | `salom(ism: 'Ali')` |
| Nomli parametrga pozitsion argument (`salom('Ali')`) | Nomli parametr faqat nomi bilan beriladi | `salom(ism: 'Ali')` — Flutter widget'larida ham shunday: `Text('a', style: …)` |
| `bool?` ustida `true`/`false` bilan switch ifodasi | `null` ham kirishi mumkin — holatlar to'liq emas | `null => …` holatini qo'shing yoki `_` |
| `switch` operatorida har `case` ga `break` yozish (boshqa tillardan odat) | Dart'da shart emas — bo'sh bo'lmagan `case` o'zi tugaydi | `break` faqat bo'sh, lekin keyingisiga o'tmasligi kerak bo'lgan `case` uchun |
| `=>` dan keyin `if` yozish | `=>` dan keyin faqat ifoda | Shartli ifoda `? :` yoki switch ifodasi; murakkab bo'lsa `{ … }` tanali funksiya |

## Amaliyot

1. `int f(int x) => x + 1;` ni `{ }` tanali shaklda yozing.
2. Nomli va ixtiyoriy pozitsion parametr farqi nima? Ularni bitta funksiyada birga ishlatsa bo'ladimi?
3. Nomli parametrga standart qiymat berilmasa, uning turi qanday bo'lishi kerak va nega?
4. Closure nima? `qoshuvchi(10)` qaytargan funksiya `5` bilan chaqirilsa, natija qanday?
5. Switch operatori va switch ifodasi farqini uchta belgi bilan ayting.
6. `switch (ball) { >= 86 => '5', >= 71 => '4', _ => '?' }` da `90` qaysi holatga tushadi va nega?

<details>
<summary>Javoblar</summary>

1. `int f(int x) { return x + 1; }`
2. Nomli — nomi bilan beriladi (`f(a: 1)`), tartib muhim emas; ixtiyoriy pozitsion — `[ ]` ichida, tartib bilan. DD: bitta funksiyada ikkalasi birga bo'lmaydi.
3. Nullable (masalan, `String?`) — standart qiymati `null` bo'ladi; null bo'lmaydigan tur esa null'ni qabul qilmaydi.
4. Yaratilgan joydagi o'zgaruvchilarni (bu yerda `qancha`) eslab qoladigan funksiya. Natija — `15`.
5. Masalan: ifoda qiymat qaytaradi; holat `case` siz, `=>` bilan yoziladi; har holatda bitta ifoda bo'ladi va boshqa hollar faqat `_` (yana: holatlar `,` bilan ajratiladi).
6. `>= 86` — `'5'`: holatlar yuqoridan pastga tekshiriladi va birinchi mos keladigani tanlanadi.

</details>

## Rasmiy hujjat

- [DD: Functions](https://dart.dev/language/functions)
- [DD: Branches](https://dart.dev/language/branches)
- [DD: Loops](https://dart.dev/language/loops)
