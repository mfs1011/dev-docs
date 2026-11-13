# 11 — Asinxronlik

[Mundarija](README.md)

## Tushuncha

Mobil ilova doim nimanidir kutadi: tarmoqdan javob, fayl, foydalanuvchi bosishi. Kutish paytida ekran qotib qolmasligi
kerak. Dart buni **asinxron** (asynchronous) dasturlash bilan hal qiladi.

### Event loop

DD (Concurrency): Dart'ning ish vaqti modeli **event loop**'ga (hodisalar sikli) asoslangan. Ilova ishlayotganda barcha
hodisalar — ekranni qayta chizish so'rovlari, bosishlar, tugma bosishlari, diskdan o'qish — **hodisalar navbatiga**
(event queue) tushadi va event loop ularni **bittadan, kelgan tartibida** bajaradi.

DD (Isolates): agar sinxron (to'xtamasdan bajariladigan) ish juda uzoq davom etsa, keyingi hodisalar kechikadi — ilova
qotib qolgandek ko'rinadi, animatsiya uzilib-uzilib ketadi (**jank**).

### Future va async/await

DD (Asynchronous programming tutorial):

| Atama (DD) | Ma'nosi |
| --- | --- |
| sinxron amal | tugaguncha boshqa amallarni bloklaydi |
| asinxron amal | boshlangach, u tugamasdan boshqa amallar bajarilishiga imkon beradi |
| **future** (`Future<T>`) | asinxron amalning natijasi; ikki holatda bo'ladi: **tugallanmagan** (uncompleted) va **tugallangan** — qiymat bilan yoki xato bilan |

DD (Concurrency): `async` va `await` asinxron funksiyalarni va ularning natijasini **deklarativ** yozish usuli:

- funksiya tanasi oldida `async` — u `Future` qaytaradi;
- `await` — `Future` tugashini kutadi va uni qiymatga aylantiradi (`Future<String>` → `String`). Kutish paytida boshqa Dart
  kodi (masalan, hodisa ishlovchilari) protsessordan foydalanadi;
- `await` faqat `async` funksiya ichida ishlaydi.

DD (tutorial, "Handling errors"): `async` funksiyadagi xatolar oddiy `try`/`catch` bilan ushlanadi.

### Stream

DD: **stream** (`Stream<T>`) — qiymatlarni kelajakda va **vaqt o'tishi bilan qayta-qayta** beradi (Future esa bitta
qiymat). `await for` — oqimdan har yangi qiymat kelganda siklni aylantiradi. Stream qaytaradigan funksiya `async*` bilan
belgilanadi va qiymatlarni `return` emas, `yield` bilan beradi.

DD (Using streams): ikki xil stream bor:

| Tur | Nima uchun (DD) |
| --- | --- |
| **bitta obunali** (single subscription) | butunning bo'laklari (fayl, web so'rov): tartib bilan, hech birini yo'qotmasdan; faqat bir marta tinglanadi |
| **broadcast** | alohida xabarlar (masalan, sichqoncha hodisalari): istalgan paytda tinglash mumkin, bir vaqtda bir nechta tinglovchi |

### Isolate

DD (Concurrency): barcha Dart kodi **isolate**'larda ishlaydi — dastur asosiy (main) isolate'da boshlanadi. Isolate —
oqim (thread) yoki jarayonga o'xshaydi, lekin har birining **o'z xotirasi** va event loop'li bitta oqimi bor. Isolate'lar
holatni bo'lishmaydi, faqat **xabar** almashadi — shuning uchun mutex/qulf va data race muammolari bo'lmaydi.

DD (Isolates): ko'p hollarda isolate haqida o'ylash shart emas — asosiy isolate va async/await yetarli. Lekin og'ir hisob
(masalan, katta JSON faylni o'qish) UI'ni qotirsa, uni **fon ishchisi**ga (background worker isolate) o'tkazing. Eng
oddiy yo'l — `Isolate.run()`: natijasi doim `Future`. DD: isolate'larni faqat **Dart native** platformasi qo'llaydi (web'da
yo'q).

## Ko'rib chiqamiz

`asinxron.dart`:

```dart
import 'dart:isolate';

// Tarmoq so'rovini taqlid qiladi: 1 soniyadan keyin javob
Future<String> buyurtmaniOl(int id) =>
    Future.delayed(const Duration(seconds: 1), () => 'buyurtma #$id: Latte');

Future<int> narxniOl() async {
  await Future.delayed(const Duration(milliseconds: 500));
  throw Exception('narx serveri javob bermadi');
}

// async* — qiymatlar oqimini (Stream) yield bilan beradi
Stream<int> sanoq(int gacha) async* {
  for (var i = 1; i <= gacha; i++) {
    await Future.delayed(const Duration(milliseconds: 200));
    yield i;
  }
}

int fibonachchi(int n) => n < 2 ? n : fibonachchi(n - 1) + fibonachchi(n - 2);

void main() async {
  // 1. await qilinmagan Future — qiymat emas, "kutilayotgan ish"
  var kutmasdan = buyurtmaniOl(1);
  print('await siz: $kutmasdan');

  // 2. await — natija kelguncha shu funksiya kutadi, qolgan kod (event loop) bloklanmaydi
  print('so\'rov yuborildi');
  var javob = await buyurtmaniOl(2);
  print('await bilan: $javob');

  // 3. Xato — try/catch bilan, xuddi sinxron koddagidek
  try {
    var narx = await narxniOl();
    print('narx: $narx');
  } catch (e) {
    print('ushlandi: $e');
  }

  // 4. Bir nechta Future'ni birga kutish
  var soat = Stopwatch()..start();
  var hammasi = await Future.wait([buyurtmaniOl(3), buyurtmaniOl(4), buyurtmaniOl(5)]);
  print('${hammasi.length} ta javob, ~${(soat.elapsedMilliseconds / 1000).round()} s da (ketma-ket bo\'lsa 3 s)');

  // 5. Stream — vaqt o'tishi bilan bir nechta qiymat; await for bilan o'qish
  await for (var n in sanoq(3)) {
    print('oqimdan: $n');
  }

  // 6. Isolate.run — og'ir hisobni alohida isolate'da (o'z xotirasi bilan) bajarish
  var natija = await Isolate.run(() => fibonachchi(30));
  print('fibonachchi(30) = $natija (alohida isolate\'da hisoblandi)');
}
```

```text vps
$ dart run asinxron.dart
await siz: Instance of 'Future<String>'
so'rov yuborildi
await bilan: buyurtma #2: Latte
ushlandi: Exception: narx serveri javob bermadi
3 ta javob, ~1 s da (ketma-ket bo'lsa 3 s)
oqimdan: 1
oqimdan: 2
oqimdan: 3
fibonachchi(30) = 832040 (alohida isolate'da hisoblandi)
```

Natijada:

- `await` siz chaqiruv qiymat emas, `Instance of 'Future<String>'` qaytardi — DD tutorial'idagi "noto'g'ri ishlatish"
  misolidagi holat;
- `narxniOl()` dagi xato `try`/`catch` bilan ushlandi;
- uchta 1 soniyalik so'rov `Future.wait` bilan **birga** ~1 soniyada tugadi (ketma-ket `await` bilan 3 soniya bo'lardi);
- `sanoq` — `async*` funksiya: qiymatlar `await for` ga bittadan keldi;
- `fibonachchi(30)` asosiy isolate'ni band qilmasdan alohida isolate'da hisoblandi.

Flutter'da bu qanday ko'rinadi: tarmoqdan ma'lumot — `Future` (30-bob, `FutureBuilder`), real vaqtdagi yangilanishlar —
`Stream` (`StreamBuilder`), katta JSON'ni o'qish — `Isolate.run` / `compute` (31-bob).

## Tipik xatolar

`xatolar.dart`:

```dart
Future<String> ism() async => 'Ali';

void salomla() {
  var i = await ism();
  print(i);
}

void main() {
  String s = ism();
  print(s);
}
```

```text vps
$ dart analyze xatolar.dart
Analyzing xatolar.dart...

  error - xatolar.dart:4:11 - The await expression can only be used in an async function. Try marking the function body with either 'async' or 'async*'. - await_in_wrong_context
  error - xatolar.dart:9:14 - A value of type 'Future<String>' can't be assigned to a variable of type 'String'. Try changing the type of the variable, or casting the right-hand type to 'String'. - invalid_assignment

2 issues found.
```

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| `async` siz funksiyada `await` | DD: `await` faqat `async` funksiyada | `Future<void> salomla() async { … }` |
| `Future<String>` ni `String` ga berish | Future — qiymat emas, kelajakdagi natija | `String s = await ism();` (`async` funksiyada) |
| `await` ni unutish | Kod natijani kutmay davom etadi, xatolar ushlanmay qoladi | `await` qo'ying; DD tutorial `unawaited_futures` va `discarded_futures` lint'larini yoqishni tavsiya qiladi |
| Mustaqil so'rovlarni ketma-ket `await` qilish | Har biri oldingisini kutadi — umumiy vaqt yig'iladi | `Future.wait([...])` |
| Og'ir sinxron hisobni UI isolate'ida | Event loop band — ekran qotadi (jank) | `Isolate.run(...)` |

## Amaliyot

1. Event loop nima va u hodisalarni qanday tartibda bajaradi?
2. Future'ning qanday holatlari bor?
3. `var x = buyurtmaniOl(1); print(x);` nima chiqaradi va nega?
4. `async`/`await` funksiyada xato qanday ushlanadi?
5. Future va Stream farqi nima? Stream qaytaradigan funksiya qanday belgilanadi?
6. Isolate oqimdan (thread) nimasi bilan farq qiladi? Qachon kerak?

<details>
<summary>Javoblar</summary>

1. Hodisalar navbatini (qayta chizish, bosishlar, I/O …) bittadan, kelgan tartibida (birinchi kelgan — birinchi) bajaradigan sikl.
2. Tugallanmagan va tugallangan (qiymat bilan yoki xato bilan).
3. `Instance of 'Future<String>'` — `await` qilinmagani uchun natija emas, tugallanmagan future chiqadi.
4. Oddiy `try`/`catch` bilan, `await` ni `try` ichida yozib.
5. Future — bitta kelajakdagi qiymat; Stream — vaqt o'tishi bilan bir nechta qiymat. Stream funksiyasi `async*` bilan, qiymatlar `yield` bilan beriladi.
6. Har isolate'ning o'z xotirasi bor, holat bo'lishilmaydi, faqat xabar almashiladi (mutex va data race yo'q). Uzoq sinxron hisob UI'ni qotirsa kerak.

</details>

## Rasmiy hujjat

- [DD: Concurrency in Dart](https://dart.dev/language/concurrency)
- [DD: Asynchronous programming](https://dart.dev/language/async)
- [DD: Asynchronous programming: futures, async, await](https://dart.dev/libraries/async/async-await)
- [DD: Using streams](https://dart.dev/libraries/async/using-streams)
- [DD: Isolates](https://dart.dev/language/isolates)
