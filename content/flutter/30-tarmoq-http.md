# 30 — Tarmoq: HTTP

[Mundarija](README.md)

> Misollar VPS'da Flutter 3.50.0, `http` 1.6.0 va `web_socket_channel` 3.0.3 bilan sinalgan. Ilova shu VPS'dagi kichik
> Dart serveriga haqiqiy so'rov yuboradi; UI testlarida esa soxta mijoz (`MockClient`) ishlatildi. Skrinshotlar
> `flutter build web` natijasidan — brauzer o'sha serverga ulangan.

## Tushuncha

### `http` paketi

FD (Networking): **`http`** paketi — HTTP so'rov yuborishning eng oddiy yo'li; Android, iOS, macOS, Windows, Linux va web'da
ishlaydi. FD (Fetch data): `dart:io` yoki `dart:html` bilan to'g'ridan-to'g'ri so'rov yuborishdan qoching — ular platformaga
bog'liq va bitta amalga oshirishga (implementation) bog'langan.

```dart
import 'package:http/http.dart' as http;
```

Platforma sozlamalari (FD) — Android va macOS'da ilovaga internetga chiqish ruxsati kerak:

- Android — `AndroidManifest.xml`: `<uses-permission android:name="android.permission.INTERNET" />`
- macOS — `DebugProfile.entitlements` va `Release.entitlements`: `com.apple.security.network.client` = `true`

(Bu sozlamalar bu bobda sinalmagan — biz web va `flutter test` da ishladik.)

### To'rt amal

FD cookbook retseptlari bo'yicha:

| Amal | HTTP | `http` | Muvaffaqiyat kodi (FD) |
| --- | --- | --- | --- |
| Olish | GET | `http.get(uri)` | 200 |
| Yaratish | POST | `http.post(uri, headers: ..., body: jsonEncode(...))` | 201 (Created) |
| Yangilash | PUT | `http.put(...)` | 200 |
| O'chirish | DELETE | `http.delete(uri)` | 200 |

Har biri `Future<http.Response>` qaytaradi. FD maslahatlari:

- **Javobni Dart obyektiga aylantiring** — xom `http.Response` bilan ishlash noqulay. `fromJson` fabrika konstruktori
  (FD'da `switch` va naqsh (pattern) bilan).
- **Kutilgan koddan boshqasi — istisno (exception).** FD: "404 Not Found" bo'lsa ham `null` qaytarmang, xato tashlang.
  Sababi pastdagi `FutureBuilder` da: `snapshot.hasData` faqat `null` bo'lmagan ma'lumotda `true`; `null` qaytsa, aylanma
  (spinner) abadiy aylanadi.
- POST/PUT tanasi JSON bo'lsa — `'Content-Type': 'application/json; charset=UTF-8'` sarlavhasi.

### Autentifikatsiya sarlavhasi

FD (Make authenticated requests): ko'p servislar ruxsat (authorization) talab qiladi; eng keng tarqalgan usul — `Authorization`
HTTP sarlavhasi. `http` paketi sarlavhalarni `headers:` bilan beradi (FD misolida qiymat `'Basic your_api_token_here'`). Bizning
server `Bearer <token>` ni kutadi.

### `FutureBuilder` va so'rov qayerda yuboriladi

FD (Fetch data): `FutureBuilder` — Flutter'dagi asinxron ma'lumotni ko'rsatish widget'i. `builder` ga `snapshot` keladi:
`hasData` → ma'lumot, `hasError` → xato matni, aks holda — yuklanish belgisi.

**So'rovni `build` ichida yubormang.** FD: Flutter `build` ni juda tez-tez chaqiradi; so'rov u yerda bo'lsa, har qayta
qurilishda qaytariladi. `initState` bir marta chaqiriladi — `Future` shu yerda yaratilib, `State` maydonida saqlanadi.

### WebSocket

FD (Communicate with WebSockets): WebSocket — server bilan **ikki tomonlama** aloqa, so'rovsiz kutish (polling) siz. Paket —
**`web_socket_channel`**:

- `WebSocketChannel.connect(uri)` — ulanish;
- `channel.stream` — serverdan kelgan xabarlar oqimi (`Stream`), `StreamBuilder` bilan ko'rsatiladi;
- `channel.sink.add(...)` — serverga yuborish;
- `channel.sink.close()` — ish tugagach yopish (FD misolida `dispose()` da).

## Ko'rib chiqamiz

### Sinov serveri

FD misollari tashqi sinov API'siga (jsonplaceholder.typicode.com) murojaat qiladi. Biz token, xato kodlari va o'zgarishlarni
o'zimiz nazorat qilish uchun VPS'da kichik server ishga tushirdik (`dart:io` — u serverda; ilovada `dart:io` emas, `http`
paketi):

```dart
// Sinov uchun kitoblar API'si: GET/POST/PUT/DELETE /kitoblar, WebSocket /ws
import 'dart:convert';
import 'dart:io';

const token = 'Bearer maxfiy-token';
final kitoblar = <int, String>{1: 'Dart tili', 2: 'Flutter asoslari'};
var keyingiId = 3;

Future<void> main() async {
  final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 8080);
  print('server: http://localhost:8080');
  await for (final req in server) {
    final res = req.response;
    // Brauzerdagi ilova boshqa manzildan kelgani uchun (CORS)
    res.headers
      ..set('Access-Control-Allow-Origin', '*')
      ..set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
      ..set('Access-Control-Allow-Headers', 'authorization, content-type');
    print('${req.method} ${req.uri.path}');

    if (req.uri.path == '/ws' && WebSocketTransformer.isUpgradeRequest(req)) {
      final ws = await WebSocketTransformer.upgrade(req);
      ws.listen((xabar) => ws.add('server oldi: $xabar'));
      continue;
    }
    if (req.method == 'OPTIONS') {
      await res.close();
      continue;
    }
    if (req.headers.value('authorization') != token) {
      res.statusCode = 401;
      res.write(jsonEncode({'xato': 'token yo\'q yoki noto\'g\'ri'}));
      await res.close();
      continue;
    }

    res.headers.contentType = ContentType.json;
    final qism = req.uri.pathSegments; // ['kitoblar'] yoki ['kitoblar', '3']
    final id = qism.length == 2 ? int.tryParse(qism[1]) : null;
    Map<String, Object?> kitob(int id) => {'id': id, 'nom': kitoblar[id]};

    switch ((req.method, qism.firstOrNull, id)) {
      case ('GET', 'kitoblar', null):
        res.write(jsonEncode([for (final id in kitoblar.keys) kitob(id)]));
      case ('POST', 'kitoblar', null):
        final body = jsonDecode(await utf8.decodeStream(req)) as Map<String, dynamic>;
        final yangi = keyingiId++;
        kitoblar[yangi] = body['nom'] as String;
        res.statusCode = 201;
        res.write(jsonEncode(kitob(yangi)));
      case ('PUT', 'kitoblar', final int id) when kitoblar.containsKey(id):
        final body = jsonDecode(await utf8.decodeStream(req)) as Map<String, dynamic>;
        kitoblar[id] = body['nom'] as String;
        res.write(jsonEncode(kitob(id)));
      case ('DELETE', 'kitoblar', final int id) when kitoblar.containsKey(id):
        kitoblar.remove(id);
        res.write('{}');
      default:
        res.statusCode = 404;
        res.write(jsonEncode({'xato': 'topilmadi'}));
    }
    await res.close();
  }
}
```

```text vps
$ dart run server/server.dart
server: http://localhost:8080
```

### Paketlar

```text vps
$ flutter pub add http web_socket_channel
...
+ http_parser 4.1.2
+ typed_data 1.4.0
+ web 1.1.2
+ web_socket 1.0.1
+ web_socket_channel 3.0.3
Changed 7 dependencies!
```

(`pubspec.lock` da: `http` 1.6.0, `web_socket_channel` 3.0.3.)

### Server bilan ishlovchi klass

`lib/kitob_api.dart` — barcha so'rovlar bitta joyda. `http.Client` konstruktordan beriladi: ilovada haqiqiysi, testda soxtasi.

```dart
import 'dart:convert';

import 'package:http/http.dart' as http;

class Kitob {
  const Kitob({required this.id, required this.nom});

  final int id;
  final String nom;

  factory Kitob.fromJson(Map<String, dynamic> json) {
    return switch (json) {
      {'id': int id, 'nom': String nom} => Kitob(id: id, nom: nom),
      _ => throw const FormatException('Kitob JSON\'i noto\'g\'ri'),
    };
  }
}

/// Server bilan ishlash. http.Client tashqaridan beriladi — testda soxtasi qo'yiladi.
class KitobApi {
  KitobApi(this._client, {required this.asos, required this.token});

  final http.Client _client;
  final String asos;
  final String token;

  Map<String, String> get _sarlavhalar => {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json; charset=UTF-8',
      };

  Future<List<Kitob>> royxat() async {
    final javob = await _client.get(Uri.parse('$asos/kitoblar'), headers: _sarlavhalar);
    if (javob.statusCode != 200) {
      // 404 bo'lsa ham null emas — xato (FD)
      throw Exception('Ro\'yxat olinmadi: ${javob.statusCode}');
    }
    final royxat = jsonDecode(javob.body) as List<dynamic>;
    return [for (final j in royxat) Kitob.fromJson(j as Map<String, dynamic>)];
  }

  Future<Kitob> qosh(String nom) async {
    final javob = await _client.post(
      Uri.parse('$asos/kitoblar'),
      headers: _sarlavhalar,
      body: jsonEncode({'nom': nom}),
    );
    if (javob.statusCode != 201) throw Exception('Qo\'shilmadi: ${javob.statusCode}');
    return Kitob.fromJson(jsonDecode(javob.body) as Map<String, dynamic>);
  }

  Future<Kitob> yangila(int id, String nom) async {
    final javob = await _client.put(
      Uri.parse('$asos/kitoblar/$id'),
      headers: _sarlavhalar,
      body: jsonEncode({'nom': nom}),
    );
    if (javob.statusCode != 200) throw Exception('Yangilanmadi: ${javob.statusCode}');
    return Kitob.fromJson(jsonDecode(javob.body) as Map<String, dynamic>);
  }

  Future<void> ochir(int id) async {
    final javob = await _client.delete(Uri.parse('$asos/kitoblar/$id'), headers: _sarlavhalar);
    if (javob.statusCode != 200) throw Exception('O\'chirilmadi: ${javob.statusCode}');
  }
}
```

### Ilova

`lib/main.dart`:

```dart
import 'package:http/http.dart' as http;
import 'package:material_ui/material_ui.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import 'kitob_api.dart';

void main() {
  final api = KitobApi(http.Client(), asos: 'http://localhost:8080', token: 'maxfiy-token');
  runApp(DokonApp(api: api, ws: Uri.parse('ws://localhost:8080/ws')));
}

class DokonApp extends StatelessWidget {
  const DokonApp({super.key, required this.api, this.ws});

  final KitobApi api;
  final Uri? ws;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal)),
      home: KitoblarSahifasi(api: api, ws: ws),
    );
  }
}

class KitoblarSahifasi extends StatefulWidget {
  const KitoblarSahifasi({super.key, required this.api, this.ws});

  final KitobApi api;
  final Uri? ws; // null bo'lsa WebSocket paneli yo'q

  @override
  State<KitoblarSahifasi> createState() => _KitoblarSahifasiState();
}

class _KitoblarSahifasiState extends State<KitoblarSahifasi> {
  late Future<List<Kitob>> _kitoblar;
  final _nom = TextEditingController();

  @override
  void initState() {
    super.initState();
    _kitoblar = widget.api.royxat(); // build ichida emas — bir marta
  }

  @override
  void dispose() {
    _nom.dispose();
    super.dispose();
  }

  // Amal tugagach ro'yxatni serverdan qayta olamiz
  void _keyin(Future<Object?> amal) {
    setState(() {
      _kitoblar = amal.then((_) => widget.api.royxat());
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Kitoblar (server)')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(controller: _nom, decoration: const InputDecoration(labelText: 'Yangi kitob')),
                ),
                IconButton(
                  tooltip: 'Qo\'shish',
                  icon: const Icon(Icons.add),
                  onPressed: () {
                    _keyin(widget.api.qosh(_nom.text));
                    _nom.clear();
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Kitob>>(
              future: _kitoblar,
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return ListView(
                    children: [
                      for (final k in snapshot.data!)
                        ListTile(
                          title: Text(k.nom),
                          subtitle: Text('id: ${k.id}'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                tooltip: 'Yangilash',
                                icon: const Icon(Icons.edit),
                                onPressed: () => _keyin(widget.api.yangila(k.id, '${k.nom} (2-nashr)')),
                              ),
                              IconButton(
                                tooltip: 'O\'chirish',
                                icon: const Icon(Icons.delete),
                                onPressed: () => _keyin(widget.api.ochir(k.id)),
                              ),
                            ],
                          ),
                        ),
                    ],
                  );
                } else if (snapshot.hasError) {
                  return Center(child: Text('Xato: ${snapshot.error}'));
                }
                return const Center(child: CircularProgressIndicator());
              },
            ),
          ),
          if (widget.ws case final ws?) AloqaPaneli(manzil: ws),
        ],
      ),
    );
  }
}

/// WebSocket: ikki tomonlama aloqa, so'rovsiz kutish (polling) yo'q
class AloqaPaneli extends StatefulWidget {
  const AloqaPaneli({super.key, required this.manzil});

  final Uri manzil;

  @override
  State<AloqaPaneli> createState() => _AloqaPaneliState();
}

class _AloqaPaneliState extends State<AloqaPaneli> {
  late final WebSocketChannel _kanal = WebSocketChannel.connect(widget.manzil);

  @override
  void dispose() {
    _kanal.sink.close();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      tileColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      title: StreamBuilder(
        stream: _kanal.stream,
        builder: (context, snapshot) => Text(snapshot.hasData ? '${snapshot.data}' : 'Serverdan xabar yo\'q'),
      ),
      trailing: TextButton(
        onPressed: () => _kanal.sink.add('salom'),
        child: const Text('Yuborish'),
      ),
    );
  }
}
```

Muhim joylar:

- **`_kitoblar` `initState` da** — so'rov bir marta. Qo'shish/yangilash/o'chirishdan keyin `_keyin` yangi `Future`
  yaratadi: avval amal, keyin ro'yxat qaytadan serverdan. `setState` `FutureBuilder` ga yangi `Future` beradi.
- **Har xato — istisno.** `royxat` 200 dan boshqa javobda `Exception` tashlaydi → `FutureBuilder` da `hasError`.
- **WebSocket paneli** `ws` berilganda chiqadi; kanal `dispose()` da yopiladi.

### Haqiqiy server bilan test

`test/api_test.dart`. Unda `testWidgets` yo'q — faqat `test()`: so'rovlar haqiqatan serverga boradi (nega bu muhim —
"Tipik xatolar"da).

```dart
// Haqiqiy server bilan (VPS'da localhost:8080). testWidgets yo'q — oddiy test().
import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:salom/kitob_api.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

void main() {
  final api = KitobApi(http.Client(), asos: 'http://localhost:8080', token: 'maxfiy-token');
  String nomlar(List<Kitob> r) => r.map((k) => '${k.id}:${k.nom}').join(', ');

  test('GET, POST, PUT, DELETE', () async {
    debugPrint('GET    → ${nomlar(await api.royxat())}');
    final yangi = await api.qosh('Toza kod');
    debugPrint('POST   → ${yangi.id}:${yangi.nom}');
    final ozgargan = await api.yangila(yangi.id, 'Toza kod (2-nashr)');
    debugPrint('PUT    → ${ozgargan.id}:${ozgargan.nom}');
    await api.ochir(yangi.id);
    debugPrint('DELETE → ${nomlar(await api.royxat())}');
  });

  test('Noto\'g\'ri token va yo\'q kitob', () async {
    final begona = KitobApi(http.Client(), asos: 'http://localhost:8080', token: 'eski');
    await expectLater(begona.royxat(), throwsException);
    try {
      await begona.royxat();
    } catch (e) {
      debugPrint('$e');
    }
    try {
      await api.ochir(99);
    } catch (e) {
      debugPrint('$e');
    }
  });

  test('WebSocket', () async {
    final kanal = WebSocketChannel.connect(Uri.parse('ws://localhost:8080/ws'));
    await kanal.ready;
    kanal.sink.add('salom');
    debugPrint('${await kanal.stream.first}');
    await kanal.sink.close();
  });
}
```

```text vps
$ flutter test test/api_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/api_test.dart
00:00 +0: GET, POST, PUT, DELETE
GET    → 1:Dart tili, 2:Flutter asoslari
POST   → 3:Toza kod
PUT    → 3:Toza kod (2-nashr)
DELETE → 1:Dart tili, 2:Flutter asoslari
00:00 +1: Noto'g'ri token va yo'q kitob
Exception: Ro'yxat olinmadi: 401
Exception: O'chirilmadi: 404
00:00 +2: WebSocket
server oldi: salom
00:00 +3: All tests passed!
```

Server logida — ilova yuborgan so'rovlar:

```text vps
$ cat server.log
server: http://localhost:8080
GET /kitoblar
POST /kitoblar
PUT /kitoblar/3
DELETE /kitoblar/3
GET /kitoblar
GET /kitoblar
GET /kitoblar
DELETE /kitoblar/99
GET /ws
```

- To'rt amal haqiqiy serverda bajarildi: POST yangi `id: 3` berdi, PUT nomini o'zgartirdi, DELETE dan keyin ro'yxat yana ikki
  kitobli.
- Token noto'g'ri — server 401 qaytardi, `royxat` istisno tashladi; yo'q kitob — 404.
- WebSocket: yuborilgan "salom" serverdan qaytib keldi.

### UI testi: `MockClient`

`http` paketidagi `MockClient` (`package:http/testing.dart`) — tarmoqqa chiqmaydigan soxta mijoz: so'rovni oladi, siz bergan
javobni qaytaradi. `KitobApi` mijozni konstruktordan olgani uchun uni almashtirish oson. `test/widget_test.dart`:

```dart
// UI testi: haqiqiy server o'rniga MockClient (http paketidagi soxta mijoz)
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/kitob_api.dart';
import 'package:salom/main.dart';

void main() {
  testWidgets('Yuklanmoqda → ro\'yxat', (tester) async {
    final soxta = MockClient((sorov) async {
      debugPrint('so\'rov: ${sorov.method} ${sorov.url} [${sorov.headers['Authorization']}]');
      return http.Response(jsonEncode([
        {'id': 1, 'nom': 'Dart tili'},
        {'id': 2, 'nom': 'Flutter asoslari'},
      ]), 200);
    });
    await tester.pumpWidget(DokonApp(api: KitobApi(soxta, asos: 'http://x', token: 't')));
    debugPrint('birinchi kadr: aylanma ${find.byType(CircularProgressIndicator).evaluate().length} ta');
    await tester.pumpAndSettle();
    debugPrint('keyin: ${find.byType(ListTile).evaluate().length} ta kitob');
  });

  testWidgets('Server xatosi', (tester) async {
    final soxta = MockClient((_) async => http.Response('ichki xato', 500));
    await tester.pumpWidget(DokonApp(api: KitobApi(soxta, asos: 'http://x', token: 't')));
    await tester.pumpAndSettle();
    debugPrint(find.textContaining('Xato').evaluate().map((e) => (e.widget as Text).data).single);
  });
}
```

```text vps
$ flutter test test/widget_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/widget_test.dart
00:00 +0: Yuklanmoqda → ro'yxat
so'rov: GET http://x/kitoblar [Bearer t]
birinchi kadr: aylanma 1 ta
keyin: 2 ta kitob
00:02 +1: Server xatosi
Xato: Exception: Ro'yxat olinmadi: 500
00:02 +2: All tests passed!
```

- Birinchi kadrda — aylanma (ma'lumot hali yo'q), keyin — ikki kitob. So'rovda `Authorization: Bearer t` sarlavhasi bor.
- 500 javobi — ekranda xato matni, ilova yiqilmadi.

### Brauzerda

Ilova web'da VPS'dagi serverga ulangan. Chapda — ro'yxat: "Toza kod" qo'shilgan, WebSocket orqali "salom" yuborilib javob
olingan ("Toza kod" ning `id` si 4: 3-raqamni oldinroq `api_test` yaratib o'chirgan, server raqamni qayta bermaydi); o'ngda —
server CORS sarlavhalarisiz ishga tushirilganda:

<img src="/rasmlar/flutter/30-royxat.png" alt="Kitoblar (server): Dart tili, Flutter asoslari, Toza kod; pastda server oldi: salom" width="300"> <img src="/rasmlar/flutter/30-cors.png" alt="Xato: ClientException: Failed to fetch, uri=http://localhost:8080/kitoblar" width="300">

Brauzer boshqa manzildagi (bu yerda boshqa port) serverga so'rov yuborishdan oldin unga `OPTIONS` so'rovi bilan "ruxsat
bormi?" deb so'raydi — server logida `OPTIONS /kitoblar` qatorlari shu. Server `Access-Control-Allow-*` sarlavhalarini
bermasa, brauzer asosiy so'rovni bloklaydi. Brauzer konsolida:

```text tashqi
Access to fetch at 'http://localhost:8080/kitoblar' from origin 'http://localhost:8736' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Ilova esa faqat `ClientException: Failed to fetch` ni oladi — sababini bilmaydi. Bu Flutter'ga emas, brauzerga xos:
`flutter test` va mobil ilovada bunday tekshiruv yo'q. Tuzatish — serverda (bizning serverdagi uch `Access-Control-*`
qatori).

## Tipik xatolar

`test/xato_test.dart`:

```dart
import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:material_ui/material_ui.dart';
import 'package:salom/kitob_api.dart';

var sorovlar = 0;
final soxta = MockClient((_) async {
  sorovlar++;
  return http.Response(jsonEncode([{'id': 1, 'nom': 'Dart tili'}]), 200);
});

// 1. So'rov build ichida
class BuilddaSorov extends StatefulWidget {
  const BuilddaSorov({super.key});

  @override
  State<BuilddaSorov> createState() => _BuilddaSorovState();
}

class _BuilddaSorovState extends State<BuilddaSorov> {
  final api = KitobApi(soxta, asos: 'http://x', token: 't');
  var bosildi = 0;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      FutureBuilder(
        future: api.royxat(), // xato joy: har build'da yangi so'rov
        builder: (context, s) => Text(s.hasData ? '${s.data!.length} ta' : '...'),
      ),
      TextButton(onPressed: () => setState(() => bosildi++), child: Text('bosildi: $bosildi')),
    ]);
  }
}

// 2. Xato o'rniga null
Future<List<Kitob>?> nullQaytaradi() async {
  final javob = http.Response('topilmadi', 404);
  if (javob.statusCode != 200) return null; // xato joy
  return [];
}

void main() {
  testWidgets('build ichida so\'rov', (tester) async {
    await tester.pumpWidget(const MaterialApp(home: BuilddaSorov()));
    for (var i = 0; i < 3; i++) {
      await tester.tap(find.byType(TextButton));
      await tester.pumpAndSettle();
    }
    debugPrint('3 marta bosildi — serverga $sorovlar ta so\'rov');
  });

  testWidgets('404 da null', (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: FutureBuilder(
        future: nullQaytaradi(),
        builder: (context, s) {
          if (s.hasData) return const Text('ro\'yxat');
          if (s.hasError) return const Text('xato');
          return const CircularProgressIndicator();
        },
      ),
    ));
    await tester.pump(const Duration(seconds: 10));
    debugPrint('10 soniyadan keyin: aylanma ${find.byType(CircularProgressIndicator).evaluate().length} ta, '
        'hasData=${find.text('ro\'yxat').evaluate().isNotEmpty}, hasError=${find.text('xato').evaluate().isNotEmpty}');
  });

  testWidgets('testWidgets ichida haqiqiy http.Client', (tester) async {
    final api = KitobApi(http.Client(), asos: 'http://localhost:8080', token: 'maxfiy-token');
    await tester.runAsync(() async {
      try {
        await api.royxat();
      } catch (e) {
        debugPrint('$e');
      }
    });
  });
}
```

```text vps
$ flutter test test/xato_test.dart
00:00 +0: loading /home/dasturchi/flutter/salom/test/xato_test.dart
00:00 +0: build ichida so'rov
3 marta bosildi — serverga 4 ta so'rov
00:01 +1: 404 da null
10 soniyadan keyin: aylanma 1 ta, hasData=false, hasError=false
00:01 +2: testWidgets ichida haqiqiy http.Client
Exception: Ro'yxat olinmadi: 400
00:02 +3: All tests passed!
```

Uchinchi holatda server logiga yangi qator qo'shilmadi — so'rov serverga yetib bormadi: `testWidgets` ichida haqiqiy
`http.Client` javobi — 400.

| Xato | Nega | To'g'ri |
| --- | --- | --- |
| 3 marta bosildi — serverga 4 ta so'rov | `future: api.royxat()` `build` ichida — har qayta qurilishda yangi so'rov | `Future` ni `initState` da yaratib, maydonda saqlang (FD) |
| Aylanma abadiy aylanadi (`hasData=false, hasError=false`) | 404 da `null` qaytarildi | Kutilmagan kodda istisno tashlang (FD) |
| `testWidgets` da haqiqiy server 400 qaytaradi | Widget testida haqiqiy HTTP so'rov serverga bormaydi | UI testida `MockClient`; haqiqiy server bilan — `testWidgets` siz `test()` |
| `Ro'yxat olinmadi: 401` | `Authorization` sarlavhasi yo'q yoki token noto'g'ri | `headers: {'Authorization': 'Bearer $token'}` |
| Brauzerda `ClientException: Failed to fetch` | Server CORS sarlavhalarini bermaydi — brauzer javobni ilovaga bermaydi | Serverda `Access-Control-Allow-Origin` va kerakli sarlavhalar |
| JSON tanasi server tomonda o'qilmaydi | `Content-Type` yo'q | `'Content-Type': 'application/json; charset=UTF-8'` (FD) |

## Amaliyot

1. FD nega `dart:io` emas, `http` paketini tavsiya qiladi?
2. Android va macOS'da tarmoq uchun nima qo'shiladi?
3. Nega 404 da ham `null` emas, istisno kerak?
4. So'rovni qayerda yuborish kerak va nega `build` da emas?
5. `KitobApi` nega `http.Client` ni konstruktordan oladi?
6. WebSocket'da xabar qanday yuboriladi va qanday o'qiladi? Ulanish qachon yopiladi?
7. Server javob bermay qolsa, ilova 5 soniyadan keyin xato ko'rsatsin. `royxat` ga nima qo'shasiz? Testda javobni 30 soniya
   kechiktiradigan `MockClient` bilan ekranda nima chiqadi?

<details>
<summary>Javoblar</summary>

1. `http` — Android, iOS, desktop va web'da ishlaydi; `dart:io` / `dart:html` platformaga bog'liq.
2. Android — `AndroidManifest.xml` ga `android.permission.INTERNET`; macOS — entitlements fayllariga
   `com.apple.security.network.client`.
3. `FutureBuilder` da `hasData` faqat `null` bo'lmagan qiymatda `true`; `null` bo'lsa na ma'lumot, na xato — aylanma abadiy
   (testda 10 soniyadan keyin ham shunday).
4. `initState` da (yoki kerak bo'lsa `didChangeDependencies` da), natija `State` maydonida. `build` tez-tez chaqiriladi —
   testda 3 bosishga 4 so'rov.
5. Testda haqiqiy mijoz o'rniga `MockClient` berish uchun — tarmoqsiz, oldindan aytilgan javob bilan.
6. `channel.sink.add(...)` — yuborish; `channel.stream` (masalan, `StreamBuilder` bilan) — o'qish; `channel.sink.close()` —
   `dispose()` da.
7. `_client.get(...)` ga `.timeout(const Duration(seconds: 5))`. Vaqt tugasa `TimeoutException` → `FutureBuilder` da
   `hasError`. VPS'dagi testda ekranda: `Xato: TimeoutException after 0:00:05.000000: Future not completed`.

</details>

## Rasmiy hujjat

- [FD: Networking](https://docs.flutter.dev/data-and-backend/networking)
- [FD: Fetch data from the internet](https://docs.flutter.dev/cookbook/networking/fetch-data)
- [FD: Send data to the internet](https://docs.flutter.dev/cookbook/networking/send-data)
- [FD: Update data over the internet](https://docs.flutter.dev/cookbook/networking/update-data)
- [FD: Delete data on the internet](https://docs.flutter.dev/cookbook/networking/delete-data)
- [FD: Make authenticated requests](https://docs.flutter.dev/cookbook/networking/authenticated-requests)
- [FD: Communicate with WebSockets](https://docs.flutter.dev/cookbook/networking/web-sockets)
- [FD: HTTP requests (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/http-requests)
- [http (pub.dev)](https://pub.dev/packages/http) · [MockClient](https://pub.dev/documentation/http/latest/testing/MockClient-class.html) · [web_socket_channel (pub.dev)](https://pub.dev/packages/web_socket_channel)
- [API: FutureBuilder](https://api.flutter.dev/flutter/widgets/FutureBuilder-class.html) · [StreamBuilder](https://api.flutter.dev/flutter/widgets/StreamBuilder-class.html)
