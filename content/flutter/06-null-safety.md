# 06 — Null safety

[Mundarija](README.md)

## Tushuncha

Ko'p tillarda eng ko'p uchraydigan xatolardan biri — qiymati `null` (hech narsa yo'q) bo'lgan o'zgaruvchining metodini
chaqirish. Bu dastur ishlab turganda yiqilishiga olib keladi.

DD (Sound null safety): Dart **null safety**ni (null xavfsizligi) majburiy qo'llaydi — `null` qiymatning a'zosiga
bexosdan murojaat qilish mumkin emas. Dart'da turlar **sukut bo'yicha null bo'lmaydi** (non-nullable by default):

- null bo'lmaydigan turdagi o'zgaruvchi qiymat bilan to'ldirilishi va faqat null bo'lmagan qiymat olishi kerak;
- tahlilchi (analyzer) va kompilyatorlar xavfli joylarni **kod yozish paytida** topadi — boshqa tillarda **ish vaqtidagi
  xato** (runtime error) bo'ladigan narsa Dart'da deploy'dan oldin tuzatiladigan **tahlil xatosi** bo'ladi.

DD'dagi ikki tamoyil:

| Tamoyil (DD) | Ma'nosi |
| --- | --- |
| **Sukut bo'yicha null emas** | Aniq aytilmaguncha o'zgaruvchi null bo'la olmaydi. Tadqiqotlar API'larda null bo'lmaydigan qiymat eng ko'p tanlov ekanini ko'rsatgani uchun shunday tanlangan |
| **To'liq ishonchli** (fully sound) | Tur tizimi o'zgaruvchi null bo'lmaydi desa — u ish vaqtida hech qachon null bo'lmaydi |

DD: natijada xatolar kamroq, dastur hajmi kichikroq va tezroq ishlaydi. Dart 3 (2023-yil may) dan beri null safety majburiy.

### Nullable tur va operatorlar

Null bo'la oladigan tur — turdan keyin `?`:

```dart
String? familiya;  // null yoki satr — boshlang'ich qiymati null
String ism = 'Ali'; // faqat satr
```

DD (Understanding null safety): nullable turdagi qiymatning metodlarini to'g'ridan-to'g'ri chaqirib bo'lmaydi (null ham
qo'llaydigan `toString()` va `hashCode` bundan mustasno). U bilan ishlash yo'llari:

| Yozuv | Ma'nosi (DD) |
| --- | --- |
| `a?.b` | `a` null bo'lsa, `.b` o'tkazib yuboriladi va butun ifoda null bo'ladi |
| `a ?? b` | `a` null bo'lsa — `b` (if-null operatori) |
| `a ??= b` | `a` ga faqat u null bo'lsa `b` beriladi |
| `if (a != null) …` | tekshiruvdan keyin `a` null bo'lmaydigan turga **ko'tariladi** (type promotion) — oqim tahlili (flow analysis) shuni ko'radi |
| `a!` | "bu null emas" degan **tasdiq** (not-null assertion): nullable turni null bo'lmaydigan turga aylantiradi; **noto'g'ri bo'lsa — ish vaqtida xato** |

DD: oqim tahlili (flow analysis) bilan tur ko'tarilishi lokal o'zgaruvchilar va parametrlarda (Dart 3.2 dan — xususiy
`final` maydonlarda ham) ishlaydi.

DD: `Map` dan `[]` bilan o'qish **nullable** qaytaradi (`V?`) — kalit yo'q bo'lsa natija null. Kalit borligini aniq
bilsangiz — `map['kalit']!`.

### `late`

DD (Variables): `late` ikki holat uchun:

1. **Keyinroq beriladigan** null bo'lmaydigan o'zgaruvchi — Dart uning ishlatilishdan oldin berilishini isbotlay olmasa
   (ko'pincha yuqori darajadagi (top-level) o'zgaruvchilar va klass maydonlari).
2. **Kechiktirilgan hisoblash** (lazy) — `late` o'zgaruvchiga e'lon qilinganda qiymat yozilsa, uni hisoblash birinchi marta
   ishlatilganda bajariladi. Hisob qimmat bo'lsa va o'zgaruvchi umuman kerak bo'lmasligi mumkin bo'lsa, foydali.

DD ogohlantiradi: `late` o'zgaruvchi berilmasdan ishlatilsa — **ish vaqtida xato**. `late` tekshiruvni kompilyatsiyadan ish
vaqtiga ko'chiradi.

## Ko'rib chiqamiz

`null_safety.dart`:

```dart
String tavsif() {
  print('  (tavsif() chaqirildi)');
  return 'Qimmat hisob natijasi';
}

late String kechikkan = tavsif(); // birinchi ishlatilganda hisoblanadi

void salomla(String? ism) {
  if (ism != null) {
    // tekshiruvdan keyin ism — String (null bo'lmaydi)
    print('Salom, ${ism.toUpperCase()}!');
  } else {
    print('Salom, mehmon!');
  }
}

void main() {
  // 1. Nullable tur: ? bilan
  String? familiya;
  print('familiya: $familiya');

  // 2. ?. — null bo'lsa, chaqiruv o'tkazib yuboriladi
  print('uzunligi: ${familiya?.length}');

  // 3. ?? — null bo'lsa, o'rniga boshqa qiymat
  print('ko\'rsatiladi: ${familiya ?? 'noma\'lum'}');

  // 4. ??= — faqat null bo'lsa beriladi
  familiya ??= 'Valiyev';
  familiya ??= 'Karimov';
  print('familiya: $familiya');

  // 5. Null tekshiruvidan keyin tur "ko'tariladi" (promotion)
  salomla('ali');
  salomla(null);

  // 6. Map'dan o'qish — natija nullable
  var narxlar = {'non': 4000, 'sut': 12000};
  int? narx = narxlar['non'];
  print('non: $narx, guruch: ${narxlar['guruch']}');
  print('sut ×2: ${narxlar['sut']! * 2}'); // kalit borligini bilamiz — !

  // 7. late — kechiktirilgan (lazy) qiymat
  print('kechikkan ishlatilmoqda:');
  print(kechikkan);
}
```

```text vps
$ dart run null_safety.dart
familiya: null
uzunligi: null
ko'rsatiladi: noma'lum
familiya: Valiyev
Salom, ALI!
Salom, mehmon!
non: 4000, guruch: null
sut ×2: 24000
kechikkan ishlatilmoqda:
  (tavsif() chaqirildi)
Qimmat hisob natijasi
```

Natijada:

- berilmagan nullable o'zgaruvchi — `null`; `?.length` ham `null` qaytardi, xato bermadi;
- ikkinchi `??=` ishlamadi: `familiya` endi null emas edi, shuning uchun `Valiyev` qoldi;
- `salomla` ichida `ism != null` tekshiruvidan keyin `toUpperCase()` ni `?.` siz chaqirsa bo'ldi;
- yo'q kalit (`guruch`) — `null`;
- `tavsif()` dastur boshida emas, `kechikkan` birinchi ishlatilganda chaqirildi.

### `!` va `late` noto'g'ri bo'lsa

`!` — va'da. Va'da noto'g'ri bo'lsa, dastur ish vaqtida yiqiladi:

```dart
void main() {
  var narxlar = {'non': 4000};
  print(narxlar['guruch']! * 2);
}
```

```text vps
$ dart run undov_xato.dart
Unhandled exception:
Null check operator used on a null value
#0      main (file:///root/dart/06/undov_xato.dart:3:26)
#1      _delayEntrypointInvocation.<anonymous closure> (dart:isolate-patch/isolate_patch.dart:313:19)
#2      _RawReceivePort._handleMessage (dart:isolate-patch/isolate_patch.dart:192:12)
```

`late` o'zgaruvchi berilmasdan o'qilsa — xuddi shunday, ish vaqtida:

```dart
late String sozlama;

void main() {
  print(sozlama);
}
```

```text vps
$ dart run late_xato.dart
Unhandled exception:
LateInitializationError: Field 'sozlama' has not been initialized.
#0      sozlama (file:///root/dart/06/late_xato.dart)
#1      main (file:///root/dart/06/late_xato.dart:4:9)
#2      _delayEntrypointInvocation.<anonymous closure> (dart:isolate-patch/isolate_patch.dart:313:19)
#3      _RawReceivePort._handleMessage (dart:isolate-patch/isolate_patch.dart:192:12)
```

Ikkala holatda ham xatoni kompilyator emas, ish vaqti topdi — `!` va `late` null safety himoyasini o'z mas'uliyatingizga
o'chiradi.

## Tipik xatolar

To'rt xato bitta faylda — `xatolar.dart`:

```dart
void main() {
  String ism = null;

  int? son;
  print(son.abs());

  var narxlar = {'non': 4000};
  print(narxlar['non'] + 1);

  String shahar;
  print(shahar);
}
```

Bularni Dart dastur ishga tushmasdan oldin topadi:

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:2:16 - A value of type 'Null' can't be assigned to a variable of type 'String'. Try changing the type of the variable, or casting the right-hand type to 'String'. - invalid_assignment
  error - xatolar.dart:5:13 - The method 'abs' can't be unconditionally invoked because the receiver can be 'null'. Try making the call conditional (using '?.') or adding a null check to the target ('!'). - unchecked_use_of_nullable_value
  error - xatolar.dart:8:24 - The operator '+' can't be unconditionally invoked because the receiver can be 'null'. Try adding a null check to the target ('!'). - unchecked_use_of_nullable_value
  error - xatolar.dart:11:9 - The non-nullable local variable 'shahar' must be assigned before it can be used. Try giving it an initializer expression, or ensure that it's assigned on every execution path. - not_assigned_potentially_non_nullable_local_variable
warning - xatolar.dart:2:10 - The value of the local variable 'ism' isn't used. Try removing the variable or using it. - unused_local_variable

5 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `String ism = null;` | `String` null bo'lmaydi | Null bo'lishi mumkin bo'lsa — `String?`; aks holda haqiqiy qiymat bering |
| `son.abs()` — `son` nullable | Null'da metod chaqirib bo'lmaydi | `if (son != null) son.abs()`, yoki `son?.abs()`, yoki `(son ?? 0).abs()` |
| `narxlar['non'] + 1` | Map'dan o'qish nullable (`int?`) | `(narxlar['non'] ?? 0) + 1`; kalit aniq bor bo'lsa — `narxlar['non']! + 1` |
| Berilmagan `shahar` ni o'qish | Null bo'lmaydigan o'zgaruvchi ishlatilishdan oldin har yo'lda berilishi kerak | E'londa qiymat bering yoki `if`/`else` ning ikkala tarmog'ida bering |
| Hamma joyda `!` | Xatoni kompilyatsiyadan ish vaqtiga ko'chiradi (`Null check operator used on a null value`) | Avval `if (x != null)`, `??`, `?.`; `!` — faqat null bo'lmasligi aniq bo'lganda |
| Shubhali joyda `late` | Berilmasa — `LateInitializationError` ish vaqtida | Iloji bo'lsa e'londa yoki konstruktorda qiymat bering; `late` — ishlatilishdan oldin albatta berilishiga ishonch bo'lganda yoki lazy hisob uchun |

## Amaliyot

1. `String` va `String?` farqi nima? `String? s;` ning boshlang'ich qiymati qanday?
2. `a?.length`, `a ?? 'x'` va `a ??= 'x'` nima qiladi?
3. Nega `if (ism != null)` ichida `ism.length` ni `?.` siz yozsa bo'ladi?
4. `map['kalit']` ning turi nima uchun nullable?
5. `!` qachon xavfli? U noto'g'ri ishlatilsa qanday xato chiqadi?
6. `late` ning ikki ishlatilish holati qaysi? Berilmagan `late` o'qilsa nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. `String` null bo'lmaydi; `String?` — satr yoki null. `String? s;` ning boshlang'ich qiymati — `null`.
2. `a?.length` — `a` null bo'lsa, `length` o'qilmaydi va natija null; `a ?? 'x'` — `a` null bo'lsa `'x'`; `a ??= 'x'` — `a` ga faqat u null bo'lsa `'x'` beriladi.
3. Oqim tahlili tekshiruvni ko'radi va shu blok ichida `ism` ni `String?` dan `String` ga ko'taradi (type promotion).
4. Kalit yo'q bo'lsa `[]` null qaytaradi, shuning uchun qaytish turi `V?`.
5. Qiymat aslida null bo'lishi mumkin bo'lganda. Noto'g'ri bo'lsa ish vaqtida `Null check operator used on a null value` bilan yiqiladi.
6. Keyinroq beriladigan null bo'lmaydigan o'zgaruvchi va kechiktirilgan (lazy) hisob. Berilmagan `late` o'qilsa — `LateInitializationError` (ish vaqtida).

</details>

## Rasmiy hujjat

- [DD: Sound null safety](https://dart.dev/null-safety)
- [DD: Understanding null safety](https://dart.dev/null-safety/understanding-null-safety)
- [DD: Variables — Late variables](https://dart.dev/language/variables#late-variables)
- [DD: Operators](https://dart.dev/language/operators)
