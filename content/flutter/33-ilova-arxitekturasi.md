# 33 — Ilova arxitekturasi

[Mundarija](README.md)

> Bu bob — tushunchalar: Flutter jamoasi tavsiya qiladigan qatlamlar va qoidalar. Kod va sinov — keyingi, 34-bobda
> (rasmiy misol ilova asosida).

## Tushuncha

### Arxitektura nima va nega kerak

FD (Architecting Flutter apps): bu yerda "arxitektura" — ilovani loyiha talablari va jamoa o'sgan sari kengayadigan qilib
**tuzish, tartiblash va loyihalash**. FD sanagan foydalari:

| Foyda | FD |
| --- | --- |
| Qo'llab-quvvatlash (maintainability) | o'zgartirish, yangilash va xatolarni tuzatish vaqt o'tib ham oson |
| Kengayish (scalability) | ko'p odam bir kodda kam to'qnashuv bilan ishlaydi |
| Testlash | klasslar sodda, kirish va chiqishi aniq — soxtasini qo'yish va testlash oson |
| Kamroq aqliy yuk | yangi dasturchi tezroq samarali bo'ladi, kod ko'rib chiqish (review) tezroq |
| Yaxshiroq UX | funksiyalar tezroq va kamroq xato bilan chiqadi |

FD: qo'llanma **bir nechta dasturchi** ishlaydigan, **ko'p funksiyali** ilova uchun yozilgan. Ayrim kutubxonalarni
almashtirish mumkin, juda katta jamoalarga ba'zi qismlar mos kelmasligi mumkin — lekin g'oyalar o'z kuchida; FD buni
"Flutter ilovasini qurishning tavsiya etilgan yo'li" deydi.

### Asosiy tamoyillar

FD (Common architecture concepts):

**Vazifalarni ajratish** (separation of concerns) — ilova funksiyalarini mustaqil bo'laklarga bo'lish. Yuqori darajada — UI
mantiqini biznes mantiqidan ajratish (qatlamlar). Har qatlam ichida — funksiya bo'yicha: masalan, autentifikatsiya mantiqi
qidiruv mantiqidan boshqa klassda.

**Qatlamlar** (layered architecture) — odatda 2–3 ta:

| Qatlam | Vazifasi (FD) |
| --- | --- |
| UI (presentation) | biznes mantiq bergan ma'lumotni ko'rsatadi, foydalanuvchi harakatini qabul qiladi |
| Mantiq (domain) — **ixtiyoriy** | murakkab biznes mantiq; faqat mijozda murakkab mantiq bo'lsa |
| Ma'lumot (data) | ma'lumot manbalari (baza, platforma plaginlari) bilan ishlaydi, ma'lumot va metodlarni yuqoriga beradi |

Har qatlam faqat **qo'shnisi** bilan gaplashadi: UI ma'lumot qatlami borligini bilmasligi kerak, va aksincha.

**Yagona haqiqat manbai** (single source of truth, SSOT) — har bir ma'lumot turi uchun bitta joy; ma'lumotni o'zgartirish
mumkin bo'lsa, faqat shu klass o'zgartiradi. Odatda bu ma'lumot qatlamidagi **Repository** klassi.

**Bir tomonlama ma'lumot oqimi** (unidirectional data flow, UDF):

```text
holat:   ma'lumot qatlami → (mantiq qatlami) → UI
hodisa:  UI → (mantiq qatlami) → ma'lumot qatlami
```

FD: eng muhim g'oya — ma'lumot o'zgarishi **doim** SSOT'da, ya'ni ma'lumot qatlamida bo'ladi.

**UI — holat funksiyasi** (28-bobdagi `UI = f(holat)`). FD: ma'lumot UI'ni boshqarsin, aksincha emas; ma'lumot o'zgarmas
(immutable) bo'lsin, view'larda mantiq imkon qadar kam bo'lsin.

**Kengaytirish va testlash** — har bo'lakning kirish va chiqishi aniq. Masalan, view model faqat repository'larni oladi va
faqat buyruqlar (command) hamda view uchun tayyor ma'lumot beradi. Shunda repository o'rniga soxtasini qo'yib, view model'ni
alohida testlash mumkin.

### Tavsiya etilgan tuzilma

FD (Guide to app architecture): ilova ikki katta qatlamga bo'linadi — **UI** va **Data**. Har bir funksiya (feature) uchun:

- bitta **View** — UI'ni tasvirlaydi;
- bitta **ViewModel** — mantiqni boshqaradi;
- bir yoki bir nechta **Repository** — ma'lumot uchun haqiqat manbai;
- nol yoki bir nechta **Service** — tashqi API'lar (server, platforma plaginlari) bilan ishlaydi.

```text
UI qatlami          View  ⇄  ViewModel
                                ↓ ↑
Data qatlami              Repository
                                ↓ ↑
                             Service  →  server, baza, plagin
```

| Komponent | Vazifasi (FD) |
| --- | --- |
| **View** | funksiyani tashkil qiluvchi widget'lar to'plami. Ma'lumotni ko'rsatadi, foydalanuvchi hodisalarini ViewModel'ga uzatadi. Biznes mantiq yo'q — kerakli hamma narsa ViewModel'dan keladi |
| **ViewModel** | repository ma'lumotini **UI holati**ga aylantiradi; view qayta qurilganda ma'lumot yo'qolmasligi uchun joriy holatni saqlaydi; view'ga **buyruqlar** (commands) beradi — tugma bosilishi kabi hodisalarga ulanadigan funksiyalar |
| **Repository** | model ma'lumotining haqiqat manbai: servislardan ma'lumot oladi va uni **domen model**ga aylantiradi; kesh, xato, qayta urinish, yangilash mantiqi ham shu yerda |
| **Service** | eng pastki qatlam: API manzillarini o'rab, `Future` va `Stream` beradi. Faqat ma'lumot yuklashni ajratadi, **holat saqlamaydi** |

Munosabatlar (FD):

- View ↔ ViewModel — **birga-bir**.
- ViewModel ↔ Repository — **ko'pga-ko'p**: view model bir necha repository'dan, repository bir necha view model'ga.
- Repository'lar bir-birini **bilmasligi kerak**.
- Repository ↔ Service — ko'pga-ko'p.

**Buyruq** (command) — "command pattern" dan: view murakkab mantiqni uning qanday ishlashini bilmasdan bajaradi. ViewModel
klassining a'zosi, view'dagi hodisa ishlovchilaridan chaqiriladi.

### Domen qatlami — faqat kerak bo'lsa

FD: **use-case** (yoki interactor) klasslari — view model'da bo'ladigan biznes mantiqni ajratadi, agar u:

1. bir nechta repository ma'lumotini birlashtirsa;
2. juda murakkab bo'lsa;
3. turli view model'larda qayta ishlatilsa.

| Afzalligi | Kamchiligi |
| --- | --- |
| view model'larda kod takrorlanmaydi | arxitektura murakkablashadi: ko'proq klass, ko'proq aqliy yuk |
| murakkab biznes mantiq UI mantiqidan ajraladi — testlash oson | testda qo'shimcha soxta obyektlar |
| view model'lar o'qilishi oson | qo'shimcha takroriy kod |

FD: use-case'larni **faqat kerak bo'lganda** qo'shing.

### Tavsiyalar ro'yxati

FD (Architecture recommendations) — uch daraja: **Qat'iy tavsiya** (yangi ilovada qiling), **Tavsiya** (ehtimol yaxshilaydi),
**Shartli** (faqat ma'lum holatlarda).

| Tavsiya | Daraja | Izoh (FD) |
| --- | --- | --- |
| Aniq ajratilgan data va UI qatlamlari | Qat'iy | vazifalarni ajratish — eng muhim tamoyil |
| Data qatlamida repository naqshi | Qat'iy | ma'lumotga kirish mantiqini ilovaning qolgan qismidan ajratadi: Repository va Service klasslari |
| UI'da ViewModel va View (MVVM) | Qat'iy | widget'lar "soqov" qoladi — xato kamayadi |
| Widget yangilanishi uchun `ChangeNotifier` va `Listenable` | Shartli | SDK'da bor, view model o'zgarishlarini kuzatishning qulay yo'li |
| Widget'larda mantiq yo'q | Qat'iy | mantiq — ViewModel metodlarida (istisnolari pastda) |
| Domen qatlami | Shartli | view model'lar mantiqdan to'lib ketsa yoki takrorlansa |
| Bir tomonlama ma'lumot oqimi | Qat'iy | yangilanish data → UI; harakat UI → data |
| Foydalanuvchi hodisalari uchun buyruqlar (`Command`) | Tavsiya | UI'dan data'ga hodisa yuborishni bir xil qiladi |
| O'zgarmas (immutable) ma'lumot modellari | Qat'iy | o'zgarish faqat to'g'ri joyda; UI'da tasodifiy o'zgartirish yo'q |
| `freezed` yoki `built_value` bilan generatsiya | Tavsiya | JSON, chuqur tenglik, nusxa metodlari; model ko'p bo'lsa build vaqti uzayadi |
| Alohida API va domen modellari | Shartli | katta ilovalarda |
| Bog'liqlikni tashqaridan berish (dependency injection) | Qat'iy | global obyektlar yo'q; FD `provider` paketini tavsiya qiladi |
| Navigatsiya uchun `go_router` | Tavsiya | ilovalarning 90% i uchun afzal yo'l (24-bob) |
| Klass, fayl, papka nomlarida bir xil qoida | Tavsiya | masalan `HomeViewModel`, `HomeScreen`, `UserRepository`, `ClientApiService`; umumiy widget'lar — `/widgets` emas, `ui/core/` |
| Abstrakt repository klasslari | Qat'iy | turli muhit ("development", "staging") uchun turli amalga oshirish |
| Komponentlarni alohida va birga testlash | Qat'iy | har service, repository, ViewModel uchun unit test; view'lar uchun widget test |
| Test uchun soxta (fake) klasslar | Qat'iy | kirish-chiqishga e'tibor — modulli, yengil klasslar yozishga majbur qiladi |

**View'da qanday mantiq bo'lishi mumkin** (FD):

- ViewModel'dagi bayroq yoki `null` maydonga qarab widget'ni ko'rsatish/yashirish uchun oddiy `if`;
- widget hisoblashi kerak bo'lgan animatsiya mantiqi;
- qurilma ma'lumotiga (ekran o'lchami, yo'nalishi) qarab joylashuv mantiqi (25-bob);
- oddiy navigatsiya mantiqi.

### Oldingi boblar bilan bog'lanish

Kitobdagi misollar shu tuzilmaga qanchalik yaqin edi:

| Bob | Klass | Arxitekturadagi o'rni |
| --- | --- | --- |
| 29 | `SavatModel extends ChangeNotifier` | holatni saqlaydi va o'zgarish haqida xabar beradi — ViewModel'ga yaqin, lekin u ma'lumotning yagona manbai ham (repository vazifasi aralash) |
| 29 | `Provider.of<SavatModel>` / `Consumer` | bog'liqlikni tashqaridan berish (FD tavsiya qilgan `provider`) |
| 30 | `KitobApi` (`http.Client` konstruktordan) | Service: server manzillarini o'raydi, `Future` qaytaradi, holat saqlamaydi |
| 30 | `MockClient` bilan UI testi | soxta (fake) bilan testlash |
| 31 | `Kitob.fromJson` | API modeli (JSON shakli) |
| 32 | `Sozlamalar`, `KitobBazasi` | Service: `shared_preferences` va SQLite'ni o'raydi |

Bu boblarda **Repository** yo'q edi: masalan, 30-bobda `KitoblarSahifasi` (View) `KitobApi` (Service) ni to'g'ridan-to'g'ri
chaqirdi — FD tuzilmasida orada ViewModel va Repository bo'lishi kerak. 34-bob rasmiy misol ilova (Compass) asosida to'liq
tuzilmani ko'rsatadi.

## Tipik xatolar

| Xato | Nega yomon (FD) | To'g'ri |
| --- | --- | --- |
| Widget ichida server so'rovi va ma'lumotni qayta ishlash | Mantiq widget'da — testlash qiyin, view "soqov" emas | Mantiq ViewModel'da, ma'lumot olish Service/Repository'da |
| View to'g'ridan-to'g'ri Service'ni chaqiradi | UI ma'lumot qatlamini biladi — qatlamlar aralashdi | View → ViewModel → Repository → Service |
| Bir ma'lumotni ikki klass o'zgartiradi | Yagona haqiqat manbai yo'q — qaysi qiymat to'g'riligi noma'lum | O'zgartirish faqat Repository'da (SSOT) |
| Service holat saqlaydi (kesh, ro'yxat) | FD: service holatsiz | Holat va kesh — Repository'da |
| Repository boshqa repository'ni chaqiradi | FD: repository'lar bir-birini bilmasin | Birlashtirish — ViewModel'da yoki use-case'da |
| Har funksiya uchun use-case | Ortiqcha klass va aqliy yuk | Faqat kerak bo'lganda (FD) |
| Global obyekt (`final api = KitobApi(...)` fayl tepasida) | Bog'liqlik yashirin, testda almashtirish qiyin | Konstruktor yoki `provider` orqali berish |
| UI ma'lumot modelini o'zgartiradi (`kitob.nom = ...`) | Tasodifiy o'zgarish, oqim buziladi | O'zgarmas model; yangi nusxa ma'lumot qatlamida |

## Amaliyot

1. FD bo'yicha qatlamlar qaysilar? Qaysi biri ixtiyoriy?
2. "Yagona haqiqat manbai" nima va u odatda qaysi klassda?
3. Bir tomonlama ma'lumot oqimida holat va hodisa qaysi yo'nalishda yuradi?
4. View, ViewModel, Repository, Service — har birining bitta asosiy vazifasini ayting.
5. Qachon domen qatlami (use-case) qo'shiladi?
6. View'da qanday mantiqqa ruxsat bor?
7. 30-bobdagi kitoblar ilovasini FD tuzilmasiga keltirsangiz, qaysi klasslar bo'ladi va ular nima qiladi? Nomlarni FD qoidasi
   bo'yicha bering.

<details>
<summary>Javoblar</summary>

1. UI, mantiq (domain), ma'lumot (data). Mantiq qatlami ixtiyoriy.
2. Har ma'lumot turi uchun yagona joy; o'zgartirish faqat shu klassda. Odatda — data qatlamidagi Repository.
3. Holat: data → (domain) → UI. Hodisa: UI → (domain) → data. O'zgarish doim data qatlamida.
4. View — widget'lar bilan ko'rsatish va hodisani uzatish; ViewModel — ma'lumotni UI holatiga aylantirish, holatni saqlash,
   buyruqlar berish; Repository — haqiqat manbai, servis ma'lumotini domen modeliga aylantirish; Service — tashqi API'ni
   o'rash, holatsiz.
5. Mantiq bir nechta repository ma'lumotini birlashtirsa, juda murakkab bo'lsa yoki turli view model'larda takrorlansa.
6. Oddiy `if` (ko'rsatish/yashirish), animatsiya, ekran o'lchamiga qarab joylashuv, oddiy navigatsiya.
7. `BooksScreen` (View: ro'yxat, maydon, tugmalar), `BooksViewModel` (`ChangeNotifier`: ro'yxat holati, yuklanish/xato,
   `add`/`update`/`delete` buyruqlari), abstrakt `BookRepository` va uning `RemoteBookRepository` amalga oshirishi (haqiqat
   manbai, JSON'ni domen modeliga aylantirish), `BookApiService` (hozirgi `KitobApi`: `http` so'rovlari, holatsiz). Testda —
   `FakeBookRepository`. Bog'liqliklar `provider` bilan beriladi. (Kitobdagi o'zbekcha nomlar bilan: `KitoblarSahifasi`,
   `KitoblarViewModel`, `KitobRepository`, `KitobApiService` — muhimi, nom komponent turini aytsin.)

</details>

## Rasmiy hujjat

- [FD: Architecting Flutter apps](https://docs.flutter.dev/app-architecture)
- [FD: Common architecture concepts](https://docs.flutter.dev/app-architecture/concepts)
- [FD: Guide to app architecture](https://docs.flutter.dev/app-architecture/guide)
- [FD: Architecture recommendations](https://docs.flutter.dev/app-architecture/recommendations)
