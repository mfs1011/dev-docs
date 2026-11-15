# 16 — Cheklovlar qanday ishlaydi

[Mundarija](README.md)

## Tushuncha

FD (Understanding constraints): "`width: 100` berdim, nega widget 100 piksel emas?" — Flutter'da eng ko'p beriladigan
savol. FD javobi: Flutter layout'i HTML layout'idan butunlay boshqacha, va avval bitta qoidani yodlash kerak:

> **Constraints go down. Sizes go up. Parent sets position.**
>
> Cheklovlar pastga tushadi. O'lchamlar yuqoriga chiqadi. Joyni ota belgilaydi.

FD batafsil:

1. Widget o'z **cheklovi**ni (constraint) **ota**sidan oladi. Cheklov — 4 ta son: eng kichik va eng katta kenglik,
   eng kichik va eng katta balandlik.
2. Widget bolalarini birma-bir ko'rib chiqadi: har biriga cheklovini aytadi (har bolaga har xil bo'lishi mumkin) va
   qanday o'lcham xohlashini so'raydi.
3. Bolalarni birma-bir **joylaydi** (x va y bo'yicha).
4. Oxirida otasiga o'z **o'lcham**ini aytadi — albatta, olgan cheklovi doirasida.

### Natijalar (FD: Limitations)

Flutter layout'i bir o'tishda (one-pass) ishlaydi — tez, lekin cheklovlari bor:

- widget o'z o'lchamini faqat otasi bergan cheklov doirasida tanlaydi — odatda **xohlagan o'lchamda bo'la olmaydi**;
- widget ekrandagi **o'z joyini bilmaydi va tanlamaydi** — uni ota belgilaydi;
- otaning o'lchami va joyi ham o'z otasiga bog'liq, shuning uchun widget'ning o'lchami va joyini butun daraxtni
  hisobga olmasdan aniq aytib bo'lmaydi;
- bola otadan boshqa o'lcham xohlasa va otada uni tekislash uchun yetarli ma'lumot bo'lmasa, bolaning o'lchami
  e'tiborga olinmasligi mumkin. FD: **tekislashni aniq ko'rsating.**

### Qat'iy, bo'sh va cheksiz cheklovlar

| Tur | Ma'nosi (FD) | Misol (FD) |
| --- | --- | --- |
| **qat'iy** (tight) | yagona imkoniyat: eng kichik = eng katta | ilova ildizi ekran o'lchamini qat'iy oladi |
| **bo'sh** (loose) | eng kichik 0, eng katta 0 dan katta | `Center` otadan olgan qat'iy cheklovni bolasi uchun bo'shga aylantiradi |
| **cheksiz** (unbounded) | eng katta kenglik yoki balandlik `double.infinity` | `Row`/`Column` ichida va skroll bo'ladigan joyda (`ListView`) |

FD: imkon qadar katta bo'lishga urinadigan widget cheksiz cheklov olsa, foydali ishlay olmaydi va debug rejimida xato tashlaydi.

### Widget'lar cheklovga qanday javob beradi

FD bo'yicha uch xil:

- **imkon qadar katta bo'lishga** urinadiganlar — `Center`, `ListView`;
- **bolasi o'lchamida** bo'lishga urinadiganlar — `Transform`, `Opacity`;
- **muayyan o'lchamda** bo'lishga urinadiganlar — `Image`, `Text`.

`Container` konstruktor argumentlariga qarab o'zgaradi: sukut bo'yicha imkon qadar katta, `width` berilsa — shu
o'lchamga intiladi. FD: bu `Container` ni yaratganlarning dizayn qarori; har widget'ning qoidasini uning API hujjatidan o'qish kerak.

**Flex** (`Row`, `Column`) — FD:

- asosiy yo'nalishda chegaralangan cheklov olsa, imkon qadar katta bo'ladi;
- cheksiz cheklov olsa, bolalarini shu joyga sig'diradi; bunda bolalarning `flex` qiymati 0 bo'lishi kerak, ya'ni
  boshqa flex yoki skroll ichida `Expanded` ishlatib bo'lmaydi;
- ko'ndalang yo'nalish **hech qachon** cheksiz bo'lmasligi kerak.

## Ko'rib chiqamiz

FD sahifasidagi misollarni (1, 2, 3, 6-misollar) testda takrorlaymiz. Ekran 400×600. `LayoutBuilder` bolaga qanday
cheklov kelganini ko'rsatadi:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

/// Bolaga kelgan cheklovni chop etadigan yordamchi widget
Widget korsat(String nom, Widget bola) {
  return LayoutBuilder(builder: (context, cheklov) {
    debugPrint('$nom oldi: $cheklov');
    return bola;
  });
}

Future<void> ekran(WidgetTester tester, Widget ildiz) async {
  tester.view.physicalSize = const Size(400, 600);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(Directionality(textDirection: TextDirection.ltr, child: ildiz));
}

void main() {
  testWidgets('1. Ekran — qat\'iy (tight) cheklov', (tester) async {
    await ekran(tester, korsat('Container', Container(width: 100, height: 100, color: Colors.red)));
    debugPrint('Container o\'lchami: ${tester.getSize(find.byType(Container))}');
  });

  testWidgets('2. Center — bo\'sh (loose) cheklov', (tester) async {
    await ekran(tester,
        Center(child: korsat('Container', Container(width: 100, height: 100, color: Colors.red))));
    debugPrint('Container o\'lchami: ${tester.getSize(find.byType(Container))}');
    debugPrint('Container joyi: ${tester.getTopLeft(find.byType(Container))}');
  });

  testWidgets('3. O\'lchamsiz Container — imkon qadar katta', (tester) async {
    await ekran(tester, Center(child: Container(color: Colors.red)));
    debugPrint('Container o\'lchami: ${tester.getSize(find.byType(Container))}');
  });

  testWidgets('4. Column — balandlik bo\'yicha cheksiz', (tester) async {
    await ekran(tester, Column(children: [korsat('Column bolasi', const SizedBox(height: 50))]));
  });

  testWidgets('5. Padding — cheklovni toraytiradi', (tester) async {
    await ekran(tester,
        Center(child: Padding(padding: const EdgeInsets.all(20), child: korsat('Padding bolasi', const SizedBox()))));
  });
}
```

```text vps
$ flutter test test/cheklov_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/cheklov_test.dart
00:00 +0: 1. Ekran — qat'iy (tight) cheklov
Container oldi: BoxConstraints(w=400.0, h=600.0)
Container o'lchami: Size(400.0, 600.0)
00:00 +1: 2. Center — bo'sh (loose) cheklov
Container oldi: BoxConstraints(0.0<=w<=400.0, 0.0<=h<=600.0)
Container o'lchami: Size(100.0, 100.0)
Container joyi: Offset(150.0, 250.0)
00:01 +2: 3. O'lchamsiz Container — imkon qadar katta
Container o'lchami: Size(400.0, 600.0)
00:01 +3: 4. Column — balandlik bo'yicha cheksiz
Column bolasi oldi: BoxConstraints(0.0<=w<=400.0, 0.0<=h<=Infinity)
00:01 +4: 5. Padding — cheklovni toraytiradi
Padding bolasi oldi: BoxConstraints(0.0<=w<=360.0, 0.0<=h<=560.0)
00:01 +5: All tests passed!
```

Natijalarni FD qoidasi bilan solishtiramiz:

| Test | Kelgan cheklov | Natija | Nega (FD) |
| --- | --- | --- | --- |
| 1 | `w=400, h=600` — qat'iy | `width: 100` ga qaramay 400×600 | ekran ildizni o'z o'lchamiga majburlaydi (FD 2-misol) |
| 2 | `0≤w≤400, 0≤h≤600` — bo'sh | 100×100, (150, 250) da | `Center` cheklovni bo'shatdi va bolani markazga qo'ydi: (400−100)/2, (600−100)/2 (FD 3-misol) |
| 3 | — | 400×600 | bolasiz va o'lchamsiz `Container` imkon qadar katta (FD 6-misol) |
| 4 | `0≤h≤Infinity` | — | `Column` bolalariga balandlik bo'yicha chegara bermaydi |
| 5 | `0≤w≤360, 0≤h≤560` | — | `Padding` har tomondan 20 dan olib, cheklovni toraytirdi |

## Tipik xatolar

FD (Common Flutter errors): `ListView` ni `Column` ichiga qo'yish. FD tushuntirishi:

- `ListView` unga berilgan butun vertikal joyni egallaydi (otasi cheklamasa);
- `Column` esa bolalari balandligini sukut bo'yicha cheklamaydi (4-test);
- ikkalasi birga `ListView` o'lchamini aniqlab bo'lmaydigan holatga olib keladi.

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';

void main() {
  testWidgets('Column ichida ListView', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Column(
          children: [
            const Text('Kitoblar'),
            ListView(
              children: const [
                ListTile(title: Text('Flutter asoslari')),
                ListTile(title: Text('Dart tili')),
              ],
            ),
          ],
        ),
      ),
    ));
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: Column ichida ListView
══╡ EXCEPTION CAUGHT BY RENDERING LIBRARY ╞═════════════════════════════════════════════════════════
The following assertion was thrown during performResize():
Vertical viewport was given unbounded height.
Viewports expand in the scrolling direction to fill their container. In this case, a vertical
viewport was given an unlimited amount of vertical space in which to expand. This situation
typically happens when a scrollable widget is nested inside another scrollable widget.
If this widget is always nested in a scrollable widget there is no need to use a viewport because
there will always be enough vertical space for the children. In this case, consider using a Column
or Wrap instead. Otherwise, consider using a CustomScrollView to concatenate arbitrary slivers into
a single scrollable.
…
00:02 +0 -1: Some tests failed.

Failing tests:
  /home/dasturchi/flutter/salom/test/xato_test.dart: Column ichida ListView
```

FD tuzatishi: `ListView` qancha baland bo'lishini ko'rsatish. `Column` dagi qolgan joyni egallashi uchun — `Expanded`;
aniq balandlik — `SizedBox`; nisbiy balandlik — `Flexible`. `Expanded(child: ListView(…))` bilan:

```text vps
$ flutter test test/tuzat_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/tuzat_test.dart
00:00 +0: Expanded bilan
00:01 +1: All tests passed!
```

| Xato matni | Sababi (FD) | Tuzatish (FD) |
| --- | --- | --- |
| `A RenderFlex overflowed by … pixels` | bola flex'ga sig'maydi (15-bob) | `Expanded` / `Flexible`, yoki skroll |
| `Vertical viewport was given unbounded height` | `ListView`/`GridView` cheksiz balandlikda (`Column` ichida) | `Expanded`, `SizedBox` yoki `Flexible` bilan balandlik bering |
| `RenderBox was not laid out` | ko'pincha shu cheklov xatolarining natijasi | asl (birinchi) xatoni tuzating |
| `width: 100` ishlamaydi | ota qat'iy cheklov bergan | ota bilan bola orasiga `Center` yoki `Align` qo'ying |

## Amaliyot

1. Qoidani o'z so'zingiz bilan ayting: cheklov, o'lcham va joy qayerdan qayerga boradi?
2. Qat'iy va bo'sh cheklov farqi nima? `Center` nima qiladi?
3. Nega widget ekrandagi o'z joyini bilmaydi?
4. `Center(child: Container(color: Colors.red))` qanday o'lchamda bo'ladi? Nega?
5. `Row` ichidagi `Row` da `Expanded` nega xato beradi?
6. `Column` ichida 200 px balandlikdagi `ListView` qanday yoziladi?

<details>
<summary>Javoblar</summary>

1. Cheklovlar otadan bolaga tushadi, bolaning o'lchami otaga chiqadi, bolani ota joylaydi.
2. Qat'iy — eng kichik va eng katta teng (bitta o'lcham); bo'sh — eng kichigi 0. `Center` otadan olgan qat'iy cheklovni bolasi uchun bo'shga aylantiradi.
3. Uni ota joylaydi; otaning joyi ham o'z otasiga bog'liq.
4. Butun ekran: bolasiz va o'lchamsiz `Container` imkon qadar katta bo'lishga urinadi (3-test).
5. FD: tashqi `Row` ichki `Row` ga asosiy yo'nalishda cheksiz cheklov berishi mumkin; cheksiz cheklovda bolalarning `flex` qiymati 0 bo'lishi kerak.
6. `SizedBox(height: 200, child: ListView(…))`.

</details>

## Rasmiy hujjat

- [FD: Understanding constraints](https://docs.flutter.dev/ui/layout/constraints)
- [FD: Common Flutter errors](https://docs.flutter.dev/testing/common-errors)
- [API: BoxConstraints](https://api.flutter.dev/flutter/rendering/BoxConstraints-class.html)
- [API: LayoutBuilder](https://api.flutter.dev/flutter/widgets/LayoutBuilder-class.html)
