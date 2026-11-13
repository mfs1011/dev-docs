# 01 — Flutter nima

[Mundarija](README.md)

## Tushuncha

FD (Flutter architectural overview): **Flutter** — bir nechta platforma uchun **UI to'plami** (UI toolkit, ya'ni ekran va
boshqaruv elementlarini quradigan kutubxonalar to'plami). U bitta kodni iOS, Android, web va desktop (Windows, macOS,
Linux) operatsion tizimlarida qayta ishlatishga mo'ljallangan. Shu bilan birga ilova har platformaning o'z xizmatlariga
(kamera, fayllar, bildirishnomalar …) to'g'ridan-to'g'ri murojaat qila oladi.

Hujjatdagi maqsad: ilova har platformada "o'zinikidek" tuyulsin va tez ishlasin, platformalar farq qiladigan joyda farq
qilsin, qolgan kodning iloji boricha ko'p qismi umumiy bo'lsin.

Ilova kodi **Dart** tilida yoziladi (kitobning II qismi). FD bo'yicha ilova ikki xil ishlaydi:

| Rejim | Kod qanday bajariladi | Nima beradi |
| --- | --- | --- |
| Ishlab chiqish (development) | Virtual mashinada (VM) | **Hot reload** — o'zgarish ilovani to'xtatmasdan, holatini saqlagan holda ko'rinadi (3-bob) |
| Chiqarish (release) | To'g'ridan-to'g'ri mashina kodiga (Intel x64 yoki ARM) kompilyatsiya qilingan; web uchun — JavaScript'ga | Tez ishlash |

Framework ochiq kodli, ruxsat beruvchi **BSD litsenziyasi** bilan. Asosiy kutubxonani to'ldiradigan ko'plab uchinchi tomon
paketlari bor (pub.dev — 35-bob).

### Qatlamlar

FD: Flutter — qatlamli tizim. Har qatlam pastdagisiga tayanadigan mustaqil kutubxonalar to'plami; hech bir qatlam
pastdagisiga imtiyozli kirishga ega emas, framework'ning har qismi ixtiyoriy va almashtirilishi mumkin.

```text
┌──────────────────────────────────────────────────────────────┐
│  Ilovangiz (Dart)                                            │
├──────────────────────────────────────────────────────────────┤
│  FRAMEWORK (Dart)                                            │
│    Material, Cupertino  — dizayn tizimlari (pub.dev paketlari)│
│    Widgets              — kompozitsiya, reaktiv model        │
│    Rendering            — layout, chiziladigan obyektlar     │
│    Foundation, animation, painting, gestures                 │
├──────────────────────────────────────────────────────────────┤
│  dart:ui — engine'ning eng past darajadagi API'si            │
├──────────────────────────────────────────────────────────────┤
│  ENGINE (asosan C++)                                         │
│    rasterlash (Impeller), matn, fayl va tarmoq, Dart runtime │
├──────────────────────────────────────────────────────────────┤
│  EMBEDDER (platformaga xos)                                  │
│    Android: Java, C++ · iOS/macOS: Swift, Objective-C        │
│    Windows, Linux: C++                                       │
├──────────────────────────────────────────────────────────────┤
│  Operatsion tizim                                            │
└──────────────────────────────────────────────────────────────┘
```

Pastdan yuqoriga, FD bo'yicha:

- **Embedder** — platformaga xos qism. Operatsion tizim uchun Flutter ilovasi boshqa har qanday native ilova kabi
  paketlanadi. Embedder ilovaning kirish nuqtasini beradi, tizim bilan muvofiqlashadi (chizish yuzasi, qulaylik
  (accessibility) xizmatlari, kiritish) va xabarlar sikli (event loop)ni boshqaradi. U platformaga mos tilda yozilgan:
  Android uchun Java va C++, iOS va macOS uchun Swift va Objective-C/Objective-C++, Windows va Linux uchun C++.
- **Engine** (dvigatel) — Flutter'ning yadrosi, asosan C++ da. Har yangi kadr kerak bo'lganda sahnani **rasterlaydi**
  (rasterize — piksellarga aylantiradi). Matn joylashuvi, fayl va tarmoq kiritish-chiqarishi, Dart runtime va kompilyatsiya
  vositalari ham shu yerda. Framework'ga `dart:ui` kutubxonasi orqali ochilgan — u C++ kodni Dart klasslariga o'raydi.
- **Framework** — dasturchi odatda shu bilan ishlaydi; Dart'da yozilgan reaktiv framework:
  - asosiy (foundation) klasslar va ularning ustida animatsiya, chizish (painting), imo-ishoralar (gestures);
  - **rendering** qatlami — layout bilan ishlash; chiziladigan obyektlar daraxti, o'zgarganda layout o'zi yangilanadi;
  - **widgets** qatlami — kompozitsiya (bo'laklardan yig'ish). Rendering qatlamidagi har obyektning widgets qatlamida
    mos klassi bor. **Reaktiv dasturlash modeli** shu qatlamda boshlanadi;
  - **Material** va **Cupertino** — Material dizayn tili va iOS dizayn tilidagi tayyor boshqaruv elementlari. FD bo'yicha
    ular pub.dev'dagi paketlar: ilovaga ularni ulash yoki asosiy `widgets` kutubxonasi ustida o'z dizayn tizimingizni
    qurish mumkin.

FD: framework nisbatan kichik. Ko'p yuqori darajadagi imkoniyatlar paket sifatida beriladi — masalan, kamera va webview
kabi platforma plaginlari yoki `http` kabi platformaga bog'liq bo'lmagan paketlar.

### Flutter ekranni qanday chizadi

FD ("Flutter's rendering model") boshqa yondashuvlar bilan solishtiradi:

| Yondashuv | Qanday ishlaydi (FD) |
| --- | --- |
| An'anaviy Android ilova | Android framework'ining Java kodi chaqiriladi; tizim kutubxonalaridagi komponentlar o'zini `Canvas` ga chizadi, Android uni Skia (C/C++ grafika dvigateli) bilan chizadi |
| Odatiy cross-platform framework | Android va iOS'ning native UI kutubxonalari ustida abstraksiya qatlami quriladi; ilova kodi ko'pincha interpretatsiya qilinadigan tilda (masalan, JavaScript) bo'ladi va UI'ni ko'rsatish uchun tizim kutubxonalari bilan muloqot qiladi. Bu qo'shimcha xarajat, ayniqsa UI va ilova mantig'i orasida muloqot ko'p bo'lsa |
| **Flutter** | Tizimning UI widget kutubxonalarini **chetlab o'tadi** va **o'z widget to'plamini** ishlatadi. Chizadigan Dart kodi native kodga kompilyatsiya qilinadi va chizish uchun **Impeller** ishlatiladi. Impeller ilova bilan birga keladi — telefonning Android versiyasi yangilanmasa ham ilova yangi ishlash tezligi yaxshilanishlarini oladi |

Shuning uchun Flutter ilovasidagi tugma — tizim tugmasi emas, uni Flutter'ning o'zi chizgan. Har platformada bir xil
ko'rinish shundan; platformaga mos ko'rinish kerak bo'lsa — Cupertino va moslashuvchan dizayn (20 va 25-boblar).

### Deklarativ UI

FD (Introduction to declarative UI): Win32'dan web, Android va iOS'gacha ko'p framework'lar **imperativ** (buyruq beruvchi)
uslubda ishlaydi: UI elementi qo'lda yaratiladi va UI o'zgarganda uning metodlari va setter'lari bilan o'zgartiriladi.
Flutter esa **deklarativ** (tavsiflovchi): dasturchi UI'ning **hozirgi holatini tasvirlaydi**, bir holatdan boshqasiga
o'tishni framework o'zi bajaradi.

FD'dagi misol: B ko'rinish ichida c1 va c2 bor edi, endi u qizil bo'lib, ichida faqat c3 qolishi kerak.

Imperativ uslubda — mavjud `b` obyektini topib, uni o'zgartirish:

```java
// Imperative style
b.setColor(red)
b.clearChildren()
ViewC c3 = new ViewC(...)
b.add(c3)
```

Deklarativ uslubda — yangi holatning tavsifini qaytarish:

```dart
// Declarative style
return ViewB(color: red, child: const ViewC());
```

FD: deklarativ uslubda ko'rinish sozlamalari (Flutter'da `Widget`'lar) **o'zgarmas** (immutable) va faqat yengil
**"chizmalar"** (blueprint). UI'ni o'zgartirish uchun widget o'zini qayta quradi (ko'pincha `StatefulWidget` da `setState`
chaqirib — 14-bob) va yangi widget daraxtini yaratadi.

FD (Architectural overview, "Reactive user interfaces") buni bitta formula bilan ifodalaydi — widget `build()` metodida
holatni UI'ga aylantiradi:

```plaintext
UI = f(state)
```

FD: `build()` tez bajarilishi va **yon ta'sirsiz** (side effect'siz — masalan, tarmoqqa so'rov yubormasligi) bo'lishi kerak,
chunki framework uni kerak bo'lgan har safar chaqiradi — har kadrda bir martagacha. Hujjat bu modelni React framework'i
g'oyalaridan ilhomlanganini aytadi; Flutter'dagi widget React'dagi komponentga o'xshaydi.

### Qaysi platformalar

FD (Supported deployment platforms), Flutter 3.50 uchun. **Qo'llab-quvvatlanadi** — Flutter jamoasi qo'llab-quvvatlaydigan
versiyalar; **CI'da sinaladi** — har commit'da sinaladiganlari:

| Platforma | Arxitektura | Qo'llab-quvvatlanadi | CI'da sinaladi | Qo'llab-quvvatlanmaydi |
| --- | --- | --- | --- | --- |
| Android | x64, Arm32, Arm64 | 24 dan 37 gacha | 24 dan 37 gacha | 23 va undan eski |
| iOS | Arm64 | 15 dan 27 gacha | 18 va 26 | 14 va undan eski |
| Windows | x64, Arm64 | 10, 11 | 10 | 8 va undan eski |
| macOS | x64, Arm64 | Monterey (12) dan Golden Gate (27) gacha | Sequoia (15) va Tahoe (26) | Big Sur (11) va undan eski |
| Debian | x64, Arm64 | 10 dan 13 gacha | 12 | 9 va undan eski |
| Ubuntu | x64, Arm64 | 20.04 LTS dan 24.04 LTS gacha | 22.04 LTS | 25.10 va undan eski LTS bo'lmaganlar |
| Chrome (web) | JavaScript, WebAssembly | oxirgi 2 versiya | 145 | 95 va undan eski |

Android ustunidagi raqamlar — Android API darajalari (API level): FD (Build and release an Android app, "Android SDK versions") bo'yicha Flutter loyihasida eng past versiya `minSdk` sozlamasi bilan belgilanadi, Flutter vositalarining standart qiymati — 24. FD'dagi ogohlantirish: Flutter Intel protsessorli Mac'larni
qo'llab-quvvatlashdan bosqichma-bosqich chiqyapti — macOS Golden Gate (27) faqat Apple Silicon'da.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'ri |
| --- | --- | --- |
| "Flutter tizim tugmalari va ro'yxatlarini o'raydi" | FD: Flutter tizim UI widget kutubxonalarini chetlab o'tib, o'z widget'larini o'zi chizadi (Impeller bilan) | Ko'rinishni Flutter widget'lari belgilaydi; iOS uslubi kerak bo'lsa — Cupertino (20-bob) |
| UI'ni topib, o'zgartirishga urinish (`findViewById` kabi) | Deklarativ framework'da widget o'zgarmas chizma; mavjud obyektni "o'zgartirish" usuli yo'q | Holatni o'zgartiring va `setState` bilan qayta quring — framework farqni o'zi hisoblaydi (14-bob) |
| `build()` ichida tarmoq so'rovi yoki og'ir hisob | FD: `build()` har kadrda bir martagacha chaqirilishi mumkin, yon ta'sirsiz bo'lishi kerak | Ma'lumotni `build()` dan tashqarida oling (30-bob), `build()` faqat holatni UI'ga aylantirsin |
| Material'ni Flutter'ning ajralmas qismi deb o'ylash | FD bo'yicha Material va Cupertino — pub.dev'dagi paketlar, asosiy `widgets` kutubxonasi ustida qurilgan | Kerak bo'lsa ulang; o'z dizayn tizimini ham `widgets` ustida qurish mumkin |

## Amaliyot

1. Flutter ilovasi ishlab chiqish va chiqarish rejimlarida qanday bajariladi?
2. Engine va framework farqi nima? Ular qaysi tillarda yozilgan?
3. Embedder nima qiladi?
4. Flutter ekranni chizishda odatiy cross-platform framework'dan nimasi bilan farq qiladi?
5. `UI = f(state)` nimani anglatadi va `build()` ga qanday talab qo'yiladi?
6. Imperativ va deklarativ uslub farqini FD'dagi B/c3 misoli bilan tushuntiring.
7. Flutter 3.50 qaysi eng eski Android API darajasini va qaysi eng eski iOS versiyasini qo'llab-quvvatlaydi?

<details>
<summary>Javoblar</summary>

1. Ishlab chiqishda — virtual mashinada, hot reload bilan (o'zgarish to'liq qayta kompilyatsiyasiz). Chiqarishda — to'g'ridan-to'g'ri mashina kodiga (x64 yoki ARM), web uchun JavaScript'ga kompilyatsiya qilinadi.
2. Engine — yadro, asosan C++ da: kadrlarni rasterlash, matn, fayl/tarmoq, Dart runtime. Framework — Dart'da: foundation, rendering, widgets qatlamlari, Material va Cupertino. Ular `dart:ui` orqali bog'langan.
3. Platformaga xos kirish nuqtasini beradi, operatsion tizim bilan muvofiqlashadi (chizish yuzasi, qulaylik xizmatlari, kiritish) va xabarlar siklini boshqaradi.
4. Odatiy framework native UI kutubxonalari ustida abstraksiya quradi va ular bilan muloqot qiladi; Flutter tizim widget'larini chetlab o'tib, o'z widget'larini native kodga kompilyatsiya qilingan Dart kodi va Impeller bilan o'zi chizadi.
5. Widget `build()` metodida holatni UI'ga aylantiradi. `build()` tez va yon ta'sirsiz bo'lishi kerak, chunki u kerak bo'lgan har safar (har kadrda bir martagacha) chaqiriladi.
6. Imperativ: mavjud `b` ni topib, rangini o'zgartirish, bolalarini o'chirish, c3 ni qo'shish. Deklarativ: `ViewB(color: red, child: const ViewC())` — yangi holatning tavsifi qaytariladi, o'tishni framework bajaradi.
7. Android API 24, iOS 15.

</details>

## Rasmiy hujjat

- [FD: Flutter architectural overview](https://docs.flutter.dev/resources/architectural-overview)
- [FD: Introduction to declarative UI](https://docs.flutter.dev/flutter-for/declarative)
- [FD: Supported deployment platforms](https://docs.flutter.dev/reference/supported-platforms)
- [FD: Build and release an Android app — Android SDK versions](https://docs.flutter.dev/deployment/android#android-sdk-versions)
