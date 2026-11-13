# Flutter — bitta koddan Android, iOS va web ilova

Bu qo'llanma Flutter bilan mobil ilova yozishni o'rgatadi: Dart tili, widget'lar va ekran tuzish, foydalanuvchi bilan
ishlash, ma'lumot va holat, platforma va paketlar, test, ishlash tezligi va ilovani do'konga chiqarish. Flutter — Google'ning
ochiq UI to'plami (framework): bitta Dart kodidan Android, iOS, web va desktop ilova yig'iladi.

Mundarija Flutter'ning rasmiy hujjati (docs.flutter.dev) tuzilmasiga solishtirib tuzilgan: "Learn Flutter" o'quv yo'li →
User interface → Data & backend → App architecture → Platform integration → Testing & debugging → Performance → Deployment.
Dart qismi — Dart'ning rasmiy hujjati (dart.dev, "Language" bo'limi). Flutter o'quv yo'lining o'zi Dart'ni avval o'rganishni
tavsiya qiladi ("Flutter uses the Dart programming language. If you're new to Dart, complete this interactive tutorial…").
Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi.
Misollar real muhitda ishga tushirilib tekshiriladi, chiqishlar va skrinshotlar haqiqiy.

Manbalar va versiyalar (2026-11-13 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Flutter SDK | **3.50.0**, stable kanal (2026-11-11). Hujjat: "The stable channel is the recommended channel for new users and for production app releases" | <https://docs.flutter.dev/install/archive> · relizlar ro'yxati: <https://storage.googleapis.com/flutter_infra_release/releases/releases_macos.json> |
| Dart SDK | **3.14.0** — Flutter 3.50.0 ichida keladi | o'sha relizlar ro'yxati (`dart_sdk_version`) · <https://dart.dev/language> |
| Rasmiy hujjat | docs.flutter.dev va dart.dev, 2026-11-13 holati (manbasi — `flutter/website`, `dart-lang/site-www` repozitoriylari) | <https://docs.flutter.dev> · <https://dart.dev/docs> |
| Android Studio, Android SDK, Xcode | 2-bobda o'rnatishda rasmiy sahifalardan tekshirib yoziladi | <https://docs.flutter.dev/platform-integration/android/setup> · <https://docs.flutter.dev/platform-integration/ios/setup> |

Muhit tanlovi haqida:

- **Stable kanal.** Hujjatdagi mezon bo'yicha: yangi boshlovchilar va production uchun tavsiya etilgan kanal. Beta (3.51) va
  main kanallari kitobda ishlatilmaydi.
- **Real qurilma o'rniga emulyator.** Mobil ilova Android emulyatorida va iOS simulyatorida ishga tushiriladi — ular sinov
  kompyuterida (macOS, Apple M3) ishlaydi. Sinov VPS'ida virtualizatsiya (`/dev/kvm`) yo'q va xotira 1 GB — u yerda emulyator
  ishlamaydi, faqat Dart dasturlari va emulyatorsiz testlar (`flutter test`) bajarilishi mumkin.
- **Brauzerda.** Flutter ilovani web'ga ham yig'adi. Saytdagi misollar va kelajakdagi Flutter trenajori shu yo'l bilan —
  haqiqiy Flutter brauzerda ishlaydi.

Qisqartmalar:

- **FD** — Flutter rasmiy hujjati (docs.flutter.dev).
- **DD** — Dart rasmiy hujjati (dart.dev).
- **API** — Flutter API ma'lumotnomasi (api.flutter.dev).

"Muhit" ustunida:

- **D** — Dart dasturi (`dart run`), emulyator kerak emas.
- **E** — Android emulyatori va iOS simulyatori (sinov kompyuteri), skrinshot bilan.
- **T** — testlar (`flutter test`), emulyatorsiz.
- **W** — brauzerda (Flutter web).
- **—** — tushuncha bobi, buyruqsiz.

⚑ belgisi: bobda rasmiy hujjatda bo'lsa ham to'liq sinab bo'lmaydigan qism bor (masalan, do'konga chiqarish pullik dasturchi
hisobini talab qiladi) — bobda bu ochiq aytiladi, sinab bo'ladigan qismi (yig'ish, imzolash) to'liq ko'rsatiladi.

Bu qo'llanmaga kirmaydigan mavzular (rasmiy hujjatda bor, lekin mobil ilova asoslaridan tashqarida):

- Firebase, AI bilan ilova (Firebase AI Logic, Genkit, GenUI), o'yinlar, xaritalar, reklama va to'lovlar ("App solutions").
- Desktop ilovalar (Windows, Linux, macOS) va mavjud native ilovaga Flutter qo'shish ("Add to an existing app").
- Boshqa platformadan o'tuvchilar uchun sahifalar ("Flutter for Android/SwiftUI/React Native devs") — tegishli boblarda faqat havola.

> **Holat.** Tayyor: 1, 5–14-boblar (2026-11-13). Dart qismi VPS'da Dart 3.14.0 bilan; Flutter boblari VPS'da Flutter 3.50.0 bilan (`flutter test`, `flutter build web` va brauzerda skrinshot). Emulyator talab qiladigan
> boblar (E) uchun sinov kompyuteriga Flutter SDK, Android Studio va Xcode o'rnatish — egasining ruxsati kerak.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Kod** — to'liq, ishga tushiriladigan misol; natija — haqiqiy chiqish yoki emulyator skrinshoti.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l (Flutter'ning haqiqiy xato xabari bilan).
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Flutter nima](01-flutter-nima.md) | Bitta koddan bir nechta platforma. Deklarativ UI: ekran — holatning funksiyasi. Flutter qatlamlari: framework (Dart), engine, embedder. Flutter nima emas | — | [FD Architectural overview](https://docs.flutter.dev/resources/architectural-overview) · [FD Introduction to declarative UI](https://docs.flutter.dev/flutter-for/declarative) · [FD Supported platforms](https://docs.flutter.dev/reference/supported-platforms) |
| 02 | O'rnatish | Flutter SDK (stable), `PATH`, `flutter doctor`. Android Studio va emulyator, Xcode va simulyator. Kanallar va yangilash | E | [FD Install](https://docs.flutter.dev/install) · [FD Quick install](https://docs.flutter.dev/learn/pathway/quick-install) · [FD SDK archive (kanallar)](https://docs.flutter.dev/install/archive) · [FD Upgrade](https://docs.flutter.dev/install/upgrade) · [FD Android setup](https://docs.flutter.dev/platform-integration/android/setup) · [FD iOS setup](https://docs.flutter.dev/platform-integration/ios/setup) |
| 03 | Birinchi ilova | `flutter create`, loyiha tuzilishi (`lib/`, `pubspec.yaml`, `android/`, `ios/`), emulyatorda ishga tushirish. Hot reload va hot restart | E | [FD Create an app](https://docs.flutter.dev/learn/pathway/tutorial/create-an-app) · [FD Hot reload](https://docs.flutter.dev/tools/hot-reload) · [FD SDK overview](https://docs.flutter.dev/tools/sdk) |
| 04 | Muharrir va DevTools | VS Code va Android Studio'dagi Flutter vositalari. DevTools: widget daraxti (Inspector), log'lar. Kodni formatlash va avtomatik tuzatish | E | [FD VS Code](https://docs.flutter.dev/tools/vs-code) · [FD Android Studio & IntelliJ](https://docs.flutter.dev/tools/android-studio) · [FD DevTools](https://docs.flutter.dev/tools/devtools) · [FD Code formatting](https://docs.flutter.dev/tools/formatting) · [FD Automated fixes](https://docs.flutter.dev/tools/flutter-fix) |

## II qism — Dart tili (5–12)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [O'zgaruvchilar va turlar](05-ozgaruvchilar-turlar.md) | `var`, `final`, `const`, tur xulosasi (type inference). Sonlar, satrlar, bool. Operatorlar | D | [DD Variables](https://dart.dev/language/variables) · [DD Built-in types](https://dart.dev/language/built-in-types) · [DD Operators](https://dart.dev/language/operators) |
| 06 | [Null safety](06-null-safety.md) | Nullable va non-nullable turlar, `?`, `!`, `??`, `late`. Nega bu xatolarning katta qismini kompilyatsiyada ushlaydi | D | [DD Sound null safety](https://dart.dev/null-safety) · [DD Understanding null safety](https://dart.dev/null-safety/understanding-null-safety) |
| 07 | [Funksiyalar va boshqaruv oqimi](07-funksiyalar.md) | Nomli va ixtiyoriy parametrlar, anonim funksiya, `=>`. `if`, `switch`, sikllar | D | [DD Functions](https://dart.dev/language/functions) · [DD Branches](https://dart.dev/language/branches) · [DD Loops](https://dart.dev/language/loops) |
| 08 | [Kolleksiyalar, record va pattern](08-kolleksiyalar.md) | `List`, `Set`, `Map`, collection `if`/`for`. Record (bir nechta qiymat qaytarish). Pattern matching va destructuring | D | [DD Collections](https://dart.dev/language/collections) · [DD Records](https://dart.dev/language/records) · [DD Patterns](https://dart.dev/language/patterns) · [DD Iterable collections](https://dart.dev/libraries/collections/iterables) |
| 09 | [Klass va konstruktor](09-klass-konstruktor.md) | Klass, maydon, metod. Konstruktor turlari: oddiy, nomli, `const`, factory. Getter/setter | D | [DD Classes](https://dart.dev/language/classes) · [DD Constructors](https://dart.dev/language/constructors) · [DD Methods](https://dart.dev/language/methods) |
| 10 | [Meros, mixin, enum va extension](10-meros-mixin-enum.md) | `extends`, `abstract`, `implements`, `mixin`. Kengaytirilgan `enum`. Extension metodlar. Klass modifikatorlari (`sealed`, `final`) | D | [DD Extend a class](https://dart.dev/language/extend) · [DD Mixins](https://dart.dev/language/mixins) · [DD Enums](https://dart.dev/language/enums) · [DD Extension methods](https://dart.dev/language/extension-methods) · [DD Class modifiers](https://dart.dev/language/class-modifiers) |
| 11 | [Asinxronlik](11-asinxronlik.md) | `Future`, `async`/`await`, `Stream`. Event loop. Isolate — og'ir ishni alohida bajarish | D | [DD Concurrency](https://dart.dev/language/concurrency) · [DD Asynchronous programming](https://dart.dev/language/async) · [DD Async/await tutorial](https://dart.dev/libraries/async/async-await) · [DD Using streams](https://dart.dev/libraries/async/using-streams) · [DD Isolates](https://dart.dev/language/isolates) |
| 12 | [Xatolar, kutubxonalar va paketlar](12-xatolar-paketlar.md) | `try`/`catch`, istisnolar. `import`, kutubxonalar. `pub` va `pubspec.yaml`. Effective Dart'dan asosiy qoidalar | D | [DD Error handling](https://dart.dev/language/error-handling) · [DD Libraries & imports](https://dart.dev/language/libraries) · [DD How to use packages](https://dart.dev/tools/pub/packages) · [DD Effective Dart](https://dart.dev/effective-dart) |

## III qism — Widget'lar va ekran tuzish (13–20)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 13 | [Hamma narsa — widget](13-hamma-narsa-widget.md) | Widget daraxti, `build()`, `MaterialApp`, `Scaffold`. Widget, element va render obyekti farqi (qisqacha) | E | [FD User interface](https://docs.flutter.dev/ui) · [FD Widget fundamentals](https://docs.flutter.dev/learn/pathway/tutorial/widget-fundamentals) · [FD Widget catalog](https://docs.flutter.dev/ui/widgets) |
| 14 | [Stateless va Stateful](14-stateless-stateful.md) | `StatelessWidget`, `StatefulWidget`, `setState`. Widget hayot sikli | E | [FD Stateful widget](https://docs.flutter.dev/learn/pathway/tutorial/stateful-widget) · [FD Add interactivity](https://docs.flutter.dev/ui/interactivity) |
| 15 | Layout: Row, Column, Stack | Asosiy layout widget'lari, `Expanded`, `Padding`, `Container`. Ekranni bo'laklab qurish | E | [FD Layout](https://docs.flutter.dev/ui/layout) · [FD Build a layout](https://docs.flutter.dev/ui/layout/tutorial) · [FD Layout (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/layout) |
| 16 | Cheklovlar qanday ishlaydi | "Constraints go down. Sizes go up. Parent sets position." Overflow xatolari va ularni tuzatish | E | [FD Understanding constraints](https://docs.flutter.dev/ui/layout/constraints) · [FD Common Flutter errors](https://docs.flutter.dev/testing/common-errors) |
| 17 | Ro'yxat va grid | `ListView`, `ListView.builder` (uzun ro'yxat), `GridView`, turli elementli ro'yxat | E | [FD Lists & grids](https://docs.flutter.dev/ui/layout/lists) · [FD Work with long lists](https://docs.flutter.dev/cookbook/lists/long-lists) · [FD Create a grid view](https://docs.flutter.dev/cookbook/lists/grid-lists) |
| 18 | Scroll va sliver | `CustomScrollView`, sliver'lar, suzuvchi app bar | E | [FD Scrolling](https://docs.flutter.dev/ui/layout/scrolling) · [FD Slivers](https://docs.flutter.dev/ui/layout/scrolling/slivers) · [FD Slivers (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/slivers) |
| 19 | Matn, rasm va asset | `Text`, shriftlar, `Image.asset` va `Image.network`, `pubspec.yaml` da assetlar | E | [FD Text](https://docs.flutter.dev/ui/design/text) · [FD Use a custom font](https://docs.flutter.dev/cookbook/design/fonts) · [FD Assets and images](https://docs.flutter.dev/ui/assets/assets-and-images) · [FD Network image](https://docs.flutter.dev/cookbook/images/network-image) |
| 20 | Material, Cupertino va mavzu | Material va Cupertino (iOS uslubi) widget'lari. `ThemeData`, ranglar sxemasi, qorong'i mavzu | E | [FD Material design](https://docs.flutter.dev/ui/design/material) · [FD Cupertino design](https://docs.flutter.dev/ui/design/cupertino) · [FD Share styles with themes](https://docs.flutter.dev/cookbook/design/themes) |

## IV qism — Foydalanuvchi bilan ishlash (21–27)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 21 | Bosish va imo-ishoralar | `GestureDetector`, `InkWell`, surib o'chirish (`Dismissible`), sudrab olib borish | E | [FD Gestures](https://docs.flutter.dev/ui/interactivity/gestures) · [FD Handle taps](https://docs.flutter.dev/cookbook/gestures/handling-taps) · [FD Swipe to dismiss](https://docs.flutter.dev/cookbook/gestures/dismissible) |
| 22 | Formalar va validatsiya | `TextField`, `TextEditingController`, fokus, `Form` va tekshirish, snackbar | E | [FD Input & forms](https://docs.flutter.dev/ui/interactivity/input) · [FD Build a form with validation](https://docs.flutter.dev/cookbook/forms/validation) · [FD Manage focus](https://docs.flutter.dev/cookbook/forms/focus) · [FD Display a snackbar](https://docs.flutter.dev/cookbook/design/snackbars) |
| 23 | Navigatsiya | `Navigator`, ekranlar orasida o'tish, ma'lumot yuborish va qaytarish, tab va drawer | E | [FD Navigation & routing](https://docs.flutter.dev/ui/navigation) · [FD Navigation basics](https://docs.flutter.dev/cookbook/navigation/navigation-basics) · [FD Send data](https://docs.flutter.dev/cookbook/navigation/passing-data) · [FD Return data](https://docs.flutter.dev/cookbook/navigation/returning-data) · [FD Navigation (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/navigation) |
| 24 | Deep link va URL | Havoladan ilovaning kerakli ekraniga ochish: Android App Links, iOS Universal Links, web URL strategiyasi | E W ⚑ | [FD Deep linking](https://docs.flutter.dev/ui/navigation/deep-linking) · [FD App links (Android)](https://docs.flutter.dev/cookbook/navigation/set-up-app-links) · [FD Universal links (iOS)](https://docs.flutter.dev/cookbook/navigation/set-up-universal-links) · [FD URL strategies](https://docs.flutter.dev/ui/navigation/url-strategies) |
| 25 | Moslashuvchan dizayn | `MediaQuery`, `SafeArea`, telefon/planshet/katta ekran, platformaga mos xatti-harakat | E W | [FD Adaptive & responsive design](https://docs.flutter.dev/ui/adaptive-responsive) · [FD SafeArea & MediaQuery](https://docs.flutter.dev/ui/adaptive-responsive/safearea-mediaquery) · [FD Large screens](https://docs.flutter.dev/ui/adaptive-responsive/large-screens) · [FD Adaptive layout (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/adaptive-layout) |
| 26 | Animatsiyalar | Yashirin (implicit) animatsiyalar, `AnimatedContainer`, Hero, sahifa o'tishi, aniq (explicit) animatsiya qisqacha | E | [FD Animations](https://docs.flutter.dev/ui/animations) · [FD Implicit animations](https://docs.flutter.dev/ui/animations/implicit-animations) · [FD Hero animations](https://docs.flutter.dev/ui/animations/hero-animations) · [FD Animations tutorial](https://docs.flutter.dev/ui/animations/tutorial) |
| 27 | Qulaylik va tillar | Accessibility: semantika, ekran o'quvchi, kontrast. Ilovani bir nechta tilga tarjima qilish (`intl`, `.arb` fayllar) | E | [FD Accessibility](https://docs.flutter.dev/ui/accessibility) · [FD Internationalization](https://docs.flutter.dev/ui/internationalization) |

## V qism — Ma'lumot, holat va arxitektura (28–34)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 28 | Holat: vaqtinchalik va ilova holati | Deklarativ fikrlash. Widget ichidagi holat va butun ilova holati — qachon qaysi biri | E | [FD State management intro](https://docs.flutter.dev/data-and-backend/state-mgmt/intro) · [FD Think declaratively](https://docs.flutter.dev/data-and-backend/state-mgmt/declarative) · [FD Ephemeral vs app state](https://docs.flutter.dev/data-and-backend/state-mgmt/ephemeral-vs-app) |
| 29 | ChangeNotifier va provider | `ChangeNotifier`, `ListenableBuilder`, `provider` paketi bilan holatni ulashish. Boshqa yondashuvlar ro'yxati (faqat havola) | E T | [FD Simple app state management](https://docs.flutter.dev/data-and-backend/state-mgmt/simple) · [FD ChangeNotifier (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/change-notifier) · [FD ListenableBuilder (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/listenable-builder) · [FD State management options](https://docs.flutter.dev/data-and-backend/state-mgmt/options) |
| 30 | Tarmoq: HTTP | `http` paketi bilan GET/POST/PUT/DELETE, autentifikatsiya sarlavhasi, `FutureBuilder`, WebSocket | E T | [FD Networking](https://docs.flutter.dev/data-and-backend/networking) · [FD Fetch data](https://docs.flutter.dev/cookbook/networking/fetch-data) · [FD Send data](https://docs.flutter.dev/cookbook/networking/send-data) · [FD WebSockets](https://docs.flutter.dev/cookbook/networking/web-sockets) · [FD HTTP requests (tutorial)](https://docs.flutter.dev/learn/pathway/tutorial/http-requests) |
| 31 | JSON | Qo'lda serializatsiya va kod generatsiyasi (`json_serializable`). Katta JSON'ni fonda (isolate) o'qish | D T | [FD JSON serialization](https://docs.flutter.dev/data-and-backend/serialization/json) · [FD Parse JSON in the background](https://docs.flutter.dev/cookbook/networking/background-parsing) |
| 32 | Ma'lumotni saqlash | Kalit-qiymat (`shared_preferences`), fayl, SQLite. Qaysi birini tanlash | E | [FD Persistence](https://docs.flutter.dev/data-and-backend/persistence) · [FD Choose a database](https://docs.flutter.dev/data-and-backend/persistence/choose-a-database) · [FD Key-value](https://docs.flutter.dev/cookbook/persistence/key-value) · [FD SQLite](https://docs.flutter.dev/cookbook/persistence/sqlite) |
| 33 | Ilova arxitekturasi | Tavsiya etilgan qatlamlar: UI (view + view model) va data (repository + service). Bir tomonlama ma'lumot oqimi | — | [FD App architecture](https://docs.flutter.dev/app-architecture) · [FD Architecture concepts](https://docs.flutter.dev/app-architecture/concepts) · [FD Guide to app architecture](https://docs.flutter.dev/app-architecture/guide) · [FD Recommendations](https://docs.flutter.dev/app-architecture/recommendations) |
| 34 | Arxitektura amalda | Rasmiy misol ilova asosida: UI va data qatlami, dependency injection, har qatlamni testlash | E T | [FD Architecture case study](https://docs.flutter.dev/app-architecture/case-study) · [FD UI layer](https://docs.flutter.dev/app-architecture/case-study/ui-layer) · [FD Data layer](https://docs.flutter.dev/app-architecture/case-study/data-layer) · [FD Dependency injection](https://docs.flutter.dev/app-architecture/case-study/dependency-injection) · [FD Design patterns](https://docs.flutter.dev/app-architecture/design-patterns) |

## VI qism — Platforma va paketlar (35–38)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 35 | Paketlar va pubspec | pub.dev'dan paket qo'shish, versiya cheklovlari, `pubspec.yaml` imkoniyatlari, paket va plagin farqi | E | [FD Using packages](https://docs.flutter.dev/packages-and-plugins/using-packages) · [FD Dependency management](https://docs.flutter.dev/packages-and-plugins/dependency-management) · [FD Pubspec options](https://docs.flutter.dev/tools/pubspec) |
| 36 | Android va iOS sozlamalari | Ilova nomi va belgisi, splash/launch screen, ruxsatlar, minimal versiyalar | E | [FD Android](https://docs.flutter.dev/platform-integration/android) · [FD Splash screen](https://docs.flutter.dev/platform-integration/android/splash-screen) · [FD iOS](https://docs.flutter.dev/platform-integration/ios) · [FD Launch screen](https://docs.flutter.dev/platform-integration/ios/launch-screen) |
| 37 | Native kod bilan aloqa | Platform channels (Kotlin/Swift bilan xabar almashish), Pigeon bilan tur-xavfsiz aloqa | E | [FD Native interop](https://docs.flutter.dev/interop) · [FD Platform channels](https://docs.flutter.dev/platform-integration/platform-channels) · [FD Pigeon](https://docs.flutter.dev/interop/pigeon) |
| 38 | Flutter web | Web'ga yig'ish, WebAssembly, ishga tushish jarayoni, brauzerdagi cheklovlar | W | [FD Web](https://docs.flutter.dev/platform-integration/web) · [FD Build a web app](https://docs.flutter.dev/platform-integration/web/building) · [FD Compile to WebAssembly](https://docs.flutter.dev/platform-integration/web/wasm) |

## VII qism — Sifat (39–43)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 39 | Unit test | `test` paketi, mock bilan bog'liqlikni almashtirish | T | [FD Testing overview](https://docs.flutter.dev/testing/overview) · [FD Unit testing](https://docs.flutter.dev/cookbook/testing/unit/introduction) |
| 40 | Widget test | `WidgetTester`, `find`, bosish va yozishni simulyatsiya qilish | T | [FD Widget testing](https://docs.flutter.dev/cookbook/testing/widget/introduction) |
| 41 | Integration test | Butun ilovani emulyatorda avtomatik sinash | E | [FD Integration testing](https://docs.flutter.dev/cookbook/testing/integration/introduction) |
| 42 | Debug va xatolar | DevTools debugger, `debugPrint`, layout xatolarini topish, xatolarni ushlash (`FlutterError.onError`) | E | [FD Debugging tools](https://docs.flutter.dev/testing/debugging) · [FD Debug programmatically](https://docs.flutter.dev/testing/code-debugging) · [FD Common Flutter errors](https://docs.flutter.dev/testing/common-errors) · [FD Handle errors](https://docs.flutter.dev/testing/errors) |
| 43 | Ishlash tezligi | Build rejimlari (debug/profile/release), tavsiyalar, render tezligi, profil olish, isolate, ilova hajmi | E | [FD Build modes](https://docs.flutter.dev/testing/build-modes) · [FD Performance best practices](https://docs.flutter.dev/perf/best-practices) · [FD Rendering performance](https://docs.flutter.dev/perf/rendering-performance) · [FD Performance profiling](https://docs.flutter.dev/perf/ui-performance) · [FD Isolates](https://docs.flutter.dev/perf/isolates) · [FD App size](https://docs.flutter.dev/perf/app-size) |

## VIII qism — Chiqarish (44–47)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 44 | Android'ga chiqarish | Release yig'ish (`appbundle`), imzolash (keystore), Google Play'ga yuklash tartibi | E ⚑ | [FD Build and release an Android app](https://docs.flutter.dev/deployment/android) · [FD Obfuscate Dart code](https://docs.flutter.dev/deployment/obfuscate) |
| 45 | iOS'ga chiqarish | Release yig'ish, sertifikat va provisioning, App Store Connect | E ⚑ | [FD Build and release an iOS app](https://docs.flutter.dev/deployment/ios) |
| 46 | Web'ga chiqarish | Web build'ni serverga joylash (masalan, Nginx kitobidagi kabi) | W | [FD Build and release a web app](https://docs.flutter.dev/deployment/web) |
| 47 | Flavor va CI/CD | Bitta loyihadan dev/prod versiyalar (flavors), avtomatik yig'ish va chiqarish | E ⚑ | [FD Flavors (Android)](https://docs.flutter.dev/deployment/flavors) · [FD Flavors (iOS)](https://docs.flutter.dev/deployment/flavors-ios) · [FD Continuous deployment](https://docs.flutter.dev/deployment/cd) |

⚑ 44, 45, 47: Google Play va App Store'ga haqiqiy chiqarish uchun pullik dasturchi hisobi kerak (egasining qarori). Hisobsiz
ham yig'ish, imzolash va tekshirish to'liq ko'rsatiladi; do'kon sahifalari rasmiy hujjat asosida tushuntiriladi.
⚑ 24: App Links va Universal Links domen faylini talab qiladi (`kamgapir.uz` da sinab ko'rsa bo'ladi — egasining qarori).
