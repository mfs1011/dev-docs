# 24 — Deep link va URL

[Mundarija](README.md)

> ⚑ Android App Links va iOS Universal Links o'z domeningiz, unda joylashgan tasdiqlash fayli va qurilma yoki emulyator
> talab qiladi — bu bobda ular **sinalmagan**, rasmiy hujjat asosida yozilgan. `go_router` bilan route'lar va web'dagi
> URL VPS'da Flutter 3.50.0 bilan sinalgan.

## Tushuncha

### Deep link nima

FD (Deep linking): **deep link** — ilovani shunchaki ochmaydigan, balki uning ichidagi aniq joyga olib boradigan havola.
Masalan, krossovka reklamasidagi havola do'kon ilovasini ochib, aynan o'sha krossovka sahifasini ko'rsatadi. Flutter deep
link'ni iOS, Android va web'da qo'llab-quvvatlaydi: URL ochilsa, ilovada shu ekran ko'rsatiladi.

FD (Navigation and routing): murakkab deep link talablari bor ilovalar **`Router`** dan foydalanishi kerak. Shunda deep
link Android va iOS'da to'g'ri ishlaydi, web'da esa manzil satri bilan sinxron bo'ladi. 23-bobdagi nomli route'lar deep
link'ni qo'llasa ham, FD ularni tavsiya qilmaydi.

| Holat | `Navigator` (23-bob) | `Router` |
| --- | --- | --- |
| Ilova ishlab turganda yangi deep link | stekka yangi route qo'shiladi | ekranlar to'plami URL bo'yicha qayta quriladi |
| Bir xil URL | joriy holatga qarab har xil natija | doim bir xil ekran(lar) (deklarativ) |

### `go_router`

FD (App links va Universal links misollari) routing uchun **`go_router`** paketini ishlatadi — uni Flutter jamoasi
qo'llab-quvvatlaydi. `go_router` README'si: URL andozalari (`/users/:id`), URL bilan o'tish, deep link, qayta yo'naltirish
(redirect) va boshqalar.

```text vps
$ flutter pub add go_router
Resolving dependencies...
Downloading packages...
  cupertino_icons 1.0.9 (2.0.0 available)
  cupertino_ui 1.1.6 (1.1.7 available)
+ flutter_web_plugins 0.0.0 from sdk flutter
+ go_router 18.1.4
+ logging 1.3.0
  material_color_utilities 0.13.0 (0.13.1 available)
  material_ui 1.11.0 (1.11.1 available)
  test_api 0.7.14 (0.7.15 available)
  vector_math 2.4.3 (2.4.4 available)
Changed 3 dependencies!
6 packages have newer versions incompatible with dependency constraints.
Try `flutter pub outdated` for more information.
```

Asosiy tushunchalar (go_router, Configuration va Navigation):

| Narsa | Nima |
| --- | --- |
| `GoRoute(path: '/users/:userId', builder: …)` | URL andozasi va ekran. `:userId` — **path parametr** |
| `state.pathParameters['userId']` | path parametr qiymati |
| `state.uri.queryParameters['filter']` | **query parametr** (`?` dan keyingi qism: `/users?filter=admins`) |
| `routes: [...]` ichida `GoRoute` | **ichki route**: ota ekran ustiga ochiladi, `AppBar` da orqaga tugmasi bilan |
| `context.go('/users/123')` | shu manzilga o'tish: ekranlar steki **shu route uchun sozlangan ekranlar bilan almashtiriladi** |
| `context.push(…)` | stek ustiga qo'shish. go_router: bunday imperativ navigatsiya brauzer tarixida muammo tug'dirishi ma'lum |
| `errorBuilder` | hech bir route'ga mos kelmagan URL uchun ekran |

Ulash: `MaterialApp` o'rniga **`MaterialApp.router(routerConfig: router)`**.

FD: `Navigator.push` yoki `showDialog` bilan qo'shilgan route'lar "sahifasiz" (pageless) — router paketida ular deep
link bilan ochilmaydi. Deep link kerak bo'lgan ekranni `GoRoute` qilib yozing.

### Web'da URL

FD (Configuring the URL strategy on the web): web'da deep link uchun qo'shimcha sozlash shart emas — manzil satridagi yo'l
mobil deep link kabi ishlanadi. Ikki strategiya bor:

| Strategiya | Manzil | Qanday yoqiladi |
| --- | --- | --- |
| Hash (**standart**) | `example.dev/#/kitob/2` | hech narsa |
| Path | `example.dev/kitob/2` | `usePathUrlStrategy()` — `runApp` dan oldin |

`usePathUrlStrategy` SDK'dagi `flutter_web_plugins` kutubxonasida. FD: uni `pub add` bilan qo'shib bo'lmaydi —
`pubspec.yaml` ga SDK bog'liqligi sifatida yoziladi:

```yaml
dependencies:
  flutter:
    sdk: flutter
  flutter_web_plugins:
    sdk: flutter
```

FD: path strategiyasi brauzerning History API'sidan foydalanadi, shuning uchun **web server** ham sozlanishi kerak: har
qanday yo'l so'ralganda `index.html` qaytarilsin (bitta sahifali ilova, SPA). Ilova sayt ildizida bo'lmasa (masalan,
`my_app.dev/flutter_app`), `web/index.html` dagi `<base href="/">` shu yo'lga o'zgartiriladi.

### Android va iOS ⚑

Mobil qurilmada `https://` havola ilovani ochishi uchun domen va ilova bir-birini "tanishi" kerak. FD:

| | Android: App Links | iOS: Universal Links |
| --- | --- | --- |
| Ilovada | `AndroidManifest.xml` da `.MainActivity` ichiga `intent-filter` (`android:autoVerify="true"`, `http`/`https`, `android:host="example.com"`) | Xcode → Runner → Signing & Capabilities → Associated Domains: `applinks:example.com` |
| Domenda | `https://example.com/.well-known/assetlinks.json`: paket nomi va imzolash kalitining SHA-256 izi | `https://example.com/.well-known/apple-app-site-association` (kengaytmasiz): `<team id>.<bundle id>` va yo'llar |
| Tekshirish | `adb shell 'am start -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d "http://<domen>/details"' <paket>` — faqat ilova sozlamasini tekshiradi | Simulator: `xcrun simctl openurl booted https://<domen>/details` |
| Eslatma | — | Apple CDN faylni 24 soatgacha kechikib olishi mumkin; shaxsiy (personal) dasturchi jamoasi Associated Domains'ni qo'llamaydi |

FD: ikkalasi uchun ham **o'z domeningiz** kerak (vaqtincha — Firebase Hosting yoki GitHub Pages). Flutter 3.27 dan beri
Flutter'ning standart deep link ishlovchisi yoqilgan; `app_links` kabi uchinchi tomon plaginini ishlatsangiz, uni
`flutter_deeplinking_enabled` (Android) / `FlutterDeepLinkingEnabled` (iOS) = `false` bilan o'chirasiz.

FD (Deep linking — Behavior): `Router` bilan ilova ishga tushmagan bo'lsa ham, ishlab turgan bo'lsa ham, yo'l tahlil
qilinib `Navigator` mos sahifalar bilan sozlanadi.

## Ko'rib chiqamiz

Kitob do'koni `go_router` bilan: `/` — ro'yxat, `/kitob/:id` — kitob sahifasi, `?manba=` — havola qayerdan kelgani.

`lib/main.dart`:

```dart
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:go_router/go_router.dart';
import 'package:material_ui/material_ui.dart';

class Kitob {
  const Kitob(this.id, this.nom, this.muallif);

  final int id;
  final String nom;
  final String muallif;
}

const kitoblar = [
  Kitob(1, 'Dart tili', 'D. Rasulov'),
  Kitob(2, 'Flutter asoslari', 'N. Karimova'),
  Kitob(3, 'Toza kod', 'R. Martin'),
];

GoRouter yaratRouter({String boshlangich = '/'}) {
  return GoRouter(
    initialLocation: boshlangich,
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const BoshSahifa(),
        routes: [
          // Ichki route: /kitob/2 ochilsa, ostida '/' ham bo'ladi (orqaga tugmasi bilan)
          GoRoute(
            path: 'kitob/:id',
            builder: (context, state) {
              final id = int.tryParse(state.pathParameters['id']!);
              final kitob = kitoblar.where((k) => k.id == id).firstOrNull;
              return KitobSahifasi(kitob: kitob, manba: state.uri.queryParameters['manba']);
            },
          ),
        ],
      ),
    ],
    // Hech bir route'ga mos kelmagan manzil
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(title: const Text('Topilmadi')),
      body: Center(child: Text('Bunday sahifa yo\'q: ${state.uri}')),
    ),
  );
}

void main() {
  usePathUrlStrategy(); // web: /#/kitob/2 emas, /kitob/2
  runApp(const DokonApp());
}

class DokonApp extends StatefulWidget {
  const DokonApp({super.key, this.boshlangich = '/'});

  final String boshlangich;

  @override
  State<DokonApp> createState() => _DokonAppState();
}

class _DokonAppState extends State<DokonApp> {
  late final GoRouter _router = yaratRouter(boshlangich: widget.boshlangich);

  @override
  void dispose() {
    _router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // MaterialApp.router: navigatsiyani Router (go_router) boshqaradi
    return MaterialApp.router(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      routerConfig: _router,
    );
  }
}

class BoshSahifa extends StatelessWidget {
  const BoshSahifa({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitob do\'koni')),
      body: ListView(
        children: [
          for (final k in kitoblar)
            ListTile(
              title: Text(k.nom),
              subtitle: Text(k.muallif),
              onTap: () => context.go('/kitob/${k.id}'), // URL bilan o'tish
            ),
        ],
      ),
    );
  }
}

class KitobSahifasi extends StatelessWidget {
  const KitobSahifasi({super.key, required this.kitob, this.manba});

  final Kitob? kitob;
  final String? manba;

  @override
  Widget build(BuildContext context) {
    final k = kitob;
    return Scaffold(
      appBar: AppBar(title: Text(k?.nom ?? 'Kitob topilmadi')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (k != null) Text('Muallif: ${k.muallif}'),
            if (manba != null) Text('Manba: $manba'),
          ],
        ),
      ),
    );
  }
}
```

E'tibor bering:

- Kitob sahifasi kitobni **URL'dan** oladi (`:id`), konstruktordagi ob'ektdan emas (23-bobdan farqi). Shuning uchun uni
  istalgan joydan — havola, reklama, brauzer manzili — ochish mumkin.
- `int.tryParse` va `firstOrNull`: URL'ni foydalanuvchi yozadi, unda `abc` yoki `99` bo'lishi mumkin — ilova yiqilmasligi
  kerak.
- `boshlangich` (`initialLocation`) — testda ilovani deep link'dan ochilgandek boshlash uchun.

Testlar (`test/widget_test.dart`):

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Ro\'yxatdan kitobga va orqaga', (tester) async {
    await tester.pumpWidget(const DokonApp());
    await tester.tap(find.text('Toza kod'));
    await tester.pumpAndSettle();
    expect(find.text('Muallif: R. Martin'), findsOneWidget);
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Kitob do\'koni'), findsOneWidget);
    debugPrint('/ → /kitob/3 → orqaga → /');
  });

  testWidgets('Deep link: ilova /kitob/2?manba=reklama dan ochiladi', (tester) async {
    await tester.pumpWidget(const DokonApp(boshlangich: '/kitob/2?manba=reklama'));
    await tester.pumpAndSettle();
    expect(find.text('Flutter asoslari'), findsOneWidget);
    expect(find.text('Manba: reklama'), findsOneWidget);
    debugPrint('ochildi: Flutter asoslari, Manba: reklama');

    // Ota route ('/') ham qurilgan — orqaga tugmasi bor
    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.text('Kitob do\'koni'), findsOneWidget);
    debugPrint('orqaga → bosh sahifa');
  });

  testWidgets('Noma\'lum manzil va yo\'q kitob', (tester) async {
    await tester.pumpWidget(const DokonApp(boshlangich: '/savat'));
    await tester.pumpAndSettle();
    expect(find.text('Bunday sahifa yo\'q: /savat'), findsOneWidget);
    debugPrint('/savat → Bunday sahifa yo\'q: /savat');

    await tester.pumpWidget(const DokonApp(key: ValueKey(2), boshlangich: '/kitob/99'));
    await tester.pumpAndSettle();
    expect(find.text('Kitob topilmadi'), findsOneWidget);
    debugPrint('/kitob/99 → Kitob topilmadi');
  });
}
```

```text vps
$ flutter analyze
Analyzing salom...                                              
No issues found! (ran in 5.8s)
$ flutter test
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Ro'yxatdan kitobga va orqaga
/ → /kitob/3 → orqaga → /
00:03 +1: Deep link: ilova /kitob/2?manba=reklama dan ochiladi
ochildi: Flutter asoslari, Manba: reklama
orqaga → bosh sahifa
00:04 +2: Noma'lum manzil va yo'q kitob
/savat → Bunday sahifa yo'q: /savat
/kitob/99 → Kitob topilmadi
00:05 +3: All tests passed!
```

Natijada:

- Ilova to'g'ridan-to'g'ri `/kitob/2?manba=reklama` dan ochildi: path parametr kitobni, query parametr manbani berdi.
- Deep link'dan ochilganda ham **orqaga tugmasi bor**: `kitob/:id` — `/` ning ichki route'i, shuning uchun go_router
  ostiga bosh sahifani ham qo'ydi.
- Noma'lum `/savat` — `errorBuilder` ekrani; mavjud bo'lmagan `/kitob/99` — ilova yiqilmadi.

### Brauzerda: server va manzil satri

`flutter build web` natijasini ikki xil server bilan ochamiz. Ikkalasi ham oddiy statik server (Node.js, 20 qator); ikkinchisi
`--spa` rejimida — fayl topilmasa, `index.html` ni qaytaradi (FD aytgan sozlama):

```text tashqi
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8724/kitob/2   # oddiy server
404
$ curl -s -o /dev/null -w '%{http_code}' http://localhost:8725/kitob/2   # --spa
200
```

Oddiy serverda `/kitob/2` — 404: diskda bunday fayl yo'q, ilova umuman yuklanmaydi. Foydalanuvchi havolani ochsa yoki
sahifani yangilasa, xuddi shu bo'ladi.

SPA serverda Chromium (Playwright) bilan manzil satriga havolani yozib, keyin tugmalarni bosdik. Har qadamdan keyingi
manzil:

```text tashqi
1. manzil satriga yozildi: /kitob/2?manba=reklama
2. ilovadagi orqaga tugmasi: /?manba=reklama
3. "Toza kod" bosildi: /kitob/3
4. brauzerning Orqaga tugmasi: /?manba=reklama
5. yana brauzerning Orqaga tugmasi: /kitob/2?manba=reklama
```

- Manzil `#` siz — `usePathUrlStrategy` ishladi. Har ekranga o'tish manzil satrini o'zgartirdi.
- 5-qadam: ilovaning orqaga tugmasi bilan `/kitob/2` yopilgan edi, lekin brauzerning Orqaga tugmasi uni **qaytardi**. FD
  (Navigation and routing — Web support): brauzerdagi "orqaga" — teskari xronologik navigatsiya, ya'ni oldin ko'rilgan
  manzilga qaytaradi, `Navigator` stekidagi oldingi ekranga emas.
- 2-qadam: ilovadagi orqaga tugmasidan keyin `?manba=reklama` bosh sahifa manzilida ham qoldi (go_router 18.1.4 da
  kuzatildi). Bosh sahifa uni ishlatmaydi, shuning uchun ta'siri yo'q.

Chapda — havoladan to'g'ridan-to'g'ri ochilgan kitob sahifasi (orqaga tugmasi bilan); o'ngda — orqaga bosilgandan keyingi
bosh sahifa:

<img src="/rasmlar/flutter/24-deeplink.png" alt="Flutter asoslari sahifasi: orqaga strelkasi, Muallif: N. Karimova, Manba: reklama" width="300"> <img src="/rasmlar/flutter/24-bosh.png" alt="Kitob do'koni bosh sahifasi: uchta kitob ro'yxati" width="300">

## Tipik xatolar

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| Web'da sahifani yangilaganda yoki havola ochilganda 404 | Path strategiyasi, server SPA uchun sozlanmagan | Server barcha yo'llarda `index.html` qaytarsin (FD) |
| Web'da manzil `/#/kitob/2` | Standart — hash strategiyasi | `usePathUrlStrategy()` va `flutter_web_plugins` |
| Ilova saytning ichki papkasida, oq ekran | `<base href="/">` o'zgartirilmagan | `web/index.html` da to'g'ri `base href` |
| Deep link bilan ochiladigan ekran `Navigator.push` bilan | FD: sahifasiz route — deep link bilan ochilmaydi | `GoRoute` qiling |
| URL'dagi `id` ni `int.parse` bilan | Foydalanuvchi har narsa yozishi mumkin — ilova yiqiladi | `int.tryParse`, topilmasa xabar |
| Ko'p `context.push` | go_router: brauzer tarixida muammo | `context.go` |
| ⚑ App Links ishlamaydi, havola brauzerda ochiladi | `assetlinks.json` yo'q, noto'g'ri SHA-256 yoki `autoVerify` yo'q | FD bo'yicha uchala qism |
| ⚑ `app_links` plagini ishlamay qoldi | Flutter'ning standart ishlovchisi xalaqit beradi | `flutter_deeplinking_enabled` = `false` |

## Amaliyot

1. Deep link nima? Oddiy havoladan farqi nima?
2. FD qachon `Navigator` o'rniga `Router` (masalan, `go_router`) ni tavsiya qiladi?
3. `/kitob/:id?manba=x` da `id` va `manba` qanday olinadi?
4. `context.go` va `context.push` farqi nima?
5. Hash va path strategiyalari farqi nima? Path uchun serverda nima sozlanadi?
6. Android App Links uchun ilovada va domenda nima qilinadi?
7. `/qidiruv?q=dart` route'ini qo'shing: u `q` bo'yicha kitoblarni nomidan qidirib ko'rsatsin.

<details>
<summary>Javoblar</summary>

1. Ilovani ochibgina qolmay, ichidagi aniq ekranga olib boradigan havola.
2. Murakkab deep link talablari bo'lsa: Android/iOS'da deep link'ni to'g'ri ishlash va web'da manzil satri bilan sinxronlik uchun.
3. `state.pathParameters['id']` va `state.uri.queryParameters['manba']`.
4. `go` — stekni shu route uchun sozlangan ekranlar bilan almashtiradi; `push` — ustiga qo'shadi (brauzer tarixida muammo bo'lishi mumkin).
5. Hash — `/#/yo'l` (standart), path — `/yo'l` (`usePathUrlStrategy`). Path uchun server har qanday yo'lda `index.html` qaytarishi kerak.
6. Ilovada — `AndroidManifest.xml` ga `autoVerify` li `intent-filter`; domenda — `/.well-known/assetlinks.json` (paket nomi va SHA-256).
7. `GoRoute(path: 'qidiruv', builder: (context, state) { final q = (state.uri.queryParameters['q'] ?? '').toLowerCase(); final topildi = kitoblar.where((k) => k.nom.toLowerCase().contains(q)).toList(); return Scaffold(appBar: AppBar(title: Text('Qidiruv: $q')), body: ListView(children: [for (final k in topildi) ListTile(title: Text(k.nom))])); })` — `/` ning `routes` ichiga. VPS'dagi testda: `q=dart` → `[Dart tili]`, `q=o` → `[Flutter asoslari, Toza kod]`.

</details>

## Rasmiy hujjat

- [FD: Deep linking](https://docs.flutter.dev/ui/navigation/deep-linking)
- [FD: Navigation and routing — Using the Router](https://docs.flutter.dev/ui/navigation)
- [FD: Configuring the URL strategy on the web](https://docs.flutter.dev/ui/navigation/url-strategies)
- [FD: Set up app links for Android](https://docs.flutter.dev/cookbook/navigation/set-up-app-links)
- [FD: Set up universal links for iOS](https://docs.flutter.dev/cookbook/navigation/set-up-universal-links)
- [go_router (pub.dev)](https://pub.dev/packages/go_router) · [Configuration](https://pub.dev/documentation/go_router/latest/topics/Configuration-topic.html) · [Navigation](https://pub.dev/documentation/go_router/latest/topics/Navigation-topic.html) · [Error handling](https://pub.dev/documentation/go_router/latest/topics/Error%20handling-topic.html)
