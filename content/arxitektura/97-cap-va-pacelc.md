# 97 — CAP, PACELC va izchillik modellari

[← Oldingi: Ma'lumotlar bazasi oilasini tanlash](96-baza-oilasi.md) · [Mundarija](README.md) · [Keyingi: Taqsimlangan ID generatsiyasi →](98-taqsimlangan-id.md)

## Tushuncha

94–95-boblarda ma'lumot bir nechta serverga tarqaldi: replikalar va shard'lar. Endi savol: serverlar o'rtasidagi aloqa **uzilsa** nima bo'ladi? Va uzilmagan bo'lsa ham, har yozuvni barcha nusxalarga yetkazishni **kutish** kerakmi?

### CAP

Eric Brewer 2012-yilgi "CAP Twelve Years Later" maqolasida teoremani shunday bayon qiladi: tarmoq orqali ulangan, ma'lumot ulashadigan har qanday tizim uchta xususiyatdan **ko'pi bilan ikkitasiga** ega bo'lishi mumkin:

- **C** — izchillik (consistency): ma'lumotning **yagona, yangilangan** nusxasi borligiga teng;
- **A** — yuqori mavjudlik (availability): ma'lumot o'zgartirish uchun ham mavjud;
- **P** — tarmoq bo'linishiga chidamlilik (partition tolerance).

Lekin maqolaning asosiy fikri — **"3 tadan 2 tasi" ifodasi doim chalg'ituvchi bo'lgan**:

- tasavvur qiling: ikki tugun bo'linishning ikki tomonida. Bittasiga yozishga ruxsat bersangiz — tugunlar nomuvofiq bo'ladi (C yo'qoladi). Izchillikni saqlasangiz — bir tomon o'zini mavjud emasdek tutishi kerak (A yo'qoladi). Faqat tugunlar **aloqada** bo'lgandagina ikkalasini saqlash mumkin;
- CAP faqat dizayn maydonining **kichik qismini** taqiqlaydi: **bo'linish paytida** mukammal mavjudlik va izchillik. Bo'linishlar esa **kam uchraydi**;
- demak bo'linish bo'lmaganda C yoki A dan voz kechish uchun sabab kam;
- C va A orasidagi tanlov bitta tizimda **juda mayda darajada** ko'p marta bo'lishi mumkin: turli qismlar turli tanlov qiladi, tanlov operatsiyaga, ma'lumotga yoki foydalanuvchiga qarab ham o'zgaradi;
- uchala xususiyat ham ikkilik emas, **uzluksiz**: mavjudlik 0–100%, izchillikning ko'p darajasi bor, bo'linishning ham nozik tomonlari bor — hatto bo'linish bor-yo'qligi haqida tizim ichida kelishmovchilik bo'lishi mumkin.

### Bo'linish — vaqt chegarasi

Brewer klassik CAP kechikishni hisobga olmasligini, amalda esa kechikish va bo'linish chambarchas bog'liqligini aytadi. CAP'ning mohiyati **timeout** paytida yuz beradi: dastur "bo'linish qarori"ni qilishi kerak:

- operatsiyani **bekor qilish** — mavjudlik kamayadi;
- yoki **davom etish** — nomuvofiqlik xavfi.

Muloqotni cheksiz qayta urinish — amalda C ni A dan ustun tanlash. Shuning uchun amaliy ta'rif: **bo'linish — muloqotga qo'yilgan vaqt chegarasi**. Belgilangan vaqtda izchillikka erishilmasa — bu bo'linish va shu operatsiya uchun C va A orasida tanlov. Natijalar: bo'linishning **global tushunchasi yo'q** (ba'zi tugunlar sezadi, ba'zilari yo'q); tugun bo'linishni sezib, **bo'linish rejimiga** o'tishi mumkin.

### Bo'linishni boshqarish

Brewer tavsiyasi — bo'linishni **aniq** boshqarish, uch qadamda:

1. bo'linish boshlanganini **aniqlash**;
2. ba'zi operatsiyalarni cheklashi mumkin bo'lgan aniq **bo'linish rejimiga** o'tish;
3. aloqa tiklanganda **tiklash** jarayoni: izchillikni qaytarish va bo'linish paytidagi xatolarni **kompensatsiya** qilish.

Shu bilan birga bo'linish paytida buzilishi mumkin bo'lgan barcha **invariantlar** (qoidalar) uchun reja tuziladi.

### PACELC

Daniel Abadi (2010) CAP'da muhim harf — **L** (latency, kechikish) yo'qligini ko'rsatdi. Uning taklifi — **PACELC**:

```text
Agar bo'linish (P) bo'lsa  → mavjudlik (A) va izchillik (C) orasida tanlov
Aks holda (E, else)       → kechikish (L) va izchillik (C) orasida tanlov
```

Ikkinchi qism nega muhim: Abadi'ga ko'ra replikalarni keng hududli tarmoqda (WAN) izchil saqlash uchun yozishning **kritik yo'lida** kamida bitta WAN xabari kerak — bu tranzaksiyaga **yuzlab millisekund** qo'shadi. Kechikishni kamaytirish uchun replikatsiya asinxron bo'ladi — bu esa ta'rifga ko'ra izchillikni kamaytiradi (94-bobdagi tanlov aynan shu).

Abadi'ning tasnifi:

| Tizim | PACELC | Ma'nosi |
| --- | --- | --- |
| Amazon Dynamo, Cassandra, SimpleDB | **PA/EL** | Bo'linishda C ni A uchun, normal holatda C ni kechikish uchun beradi |
| To'liq ACID tizimlar | **PC/EC** | Izchillikdan voz kechmaydi; mavjudlik va kechikish narxini to'laydi |
| Yahoo PNUTS | **PC/EL** | Normal holatda kechikish uchun izchillikni beradi; bo'linishda — mavjudlikni |

Abadi kuzatuvi: bo'linishda izchillikdan voz kechadigan tizimlar odatda normal holatda ham kechikish uchun undan voz kechadi — ilova nomuvofiqlikka bir marta moslashgan bo'lsa, ikkala holatda ham voz kechish dizaynni soddalashtiradi.

### Operatsiya darajasida tanlov: kvorumlar

Brewer aytgan "tanlov operatsiyaga qarab" — Cassandra'da aniq mexanizm. Hujjatga ko'ra Cassandra **har bir operatsiya uchun** izchillik va mavjudlik orasidagi murosani **izchillik darajalari** (consistency levels) orqali beradi — Dynamo'ning `R + W > N` mexanizmi versiyasi:

| Daraja | Javob kutiladi |
| --- | --- |
| `ONE` | Bitta replikadan |
| `QUORUM` | Ko'pchilikdan: n/2 + 1 |
| `ALL` | Barcha replikalardan |
| `LOCAL_QUORUM` | Lokal datamarkazdagi ko'pchilikdan |
| `EACH_QUORUM` | Har bir datamarkazdagi ko'pchilikdan |
| `ANY` | Bittasidan yoki koordinator "hint" saqlaydi (faqat yozish) |

Qoida (hujjat): `W + R > RF` bo'lsa — yozish va o'qish replikalari to'plamlari **kesishadi**, va tasdiqlangan har yozuv keyingi o'qishda **ko'rinadi**. Misol: `RF = 3`, yozish va o'qish `QUORUM` (har biri 2 ta) — 2 + 2 > 3, kamida bitta replika ikkalasida ishtirok etadi. Kuchli izchillik kerak bo'lmasa — `ONE`/`LOCAL_ONE`: o'tkazuvchanlik, kechikish va mavjudlik yaxshiroq.

Hujjatdagi muhim tafsilot: yozish **har doim barcha** replikalarga yuboriladi; izchillik darajasi faqat koordinator klientga javob berishdan oldin **nechta javobni kutishini** belgilaydi.

### Izchillik spektri

| Model | Ma'nosi | Qayerda uchradi |
| --- | --- | --- |
| Kuchli (yagona yangilangan nusxa) | Har o'qish oxirgi yozuvni ko'radi | Bitta primary; sinxron replika (94); `W + R > RF` |
| O'z yozuvini o'qish | Foydalanuvchi o'z yozuvini ko'radi, boshqalarniki kechikishi mumkin | Laravel `sticky` (94); `LOCAL_QUORUM` — o'z datamarkazida |
| Yakuniy (eventual) | Yozuvlar oxir-oqibat hamma joyga yetadi | Asinxron replika; `ONE`; kesh (25); hodisalar (27) |

## Nega shunday

CAP va PACELC — "qaysi bazani tanlash" emas, **har bir operatsiya uchun** savol: bu yerda eskirgan yoki nomuvofiq ma'lumot qanchalik zarar qiladi?

- Bank o'tkazmasi, ombor qoldig'i — nomuvofiqlik qimmat → izchillik (PC/EC), mavjudlik va kechikish narxida.
- Lenta, layklar soni, "onlayn" belgisi — biroz eskirish zarar qilmaydi → mavjudlik va tezlik (PA/EL).
- Brewer tavsiyasi: bo'linish paytida ham ishlaydigan operatsiyalar uchun **tiklash va kompensatsiya** rejasi — saga (27-bob), idempotentlik (70-bob).

## Psevdokod: operatsiya bo'yicha tanlov

```text
// RF = 3 (har yozuv 3 replikada)

like(postId):                       // eskirish qabul qilinadi, tezlik muhim
    write(likes, consistency = ONE)

getLikes(postId):
    read(likes, consistency = ONE)  // W + R = 2, RF = 3 → eski qiymat bo'lishi mumkin

reserveSeat(eventId, seat):         // ikki marta sotish — qimmat
    write(seats, consistency = QUORUM)

getSeat(eventId, seat):
    read(seats, consistency = QUORUM)   // 2 + 2 > 3 → oxirgi tasdiqlangan yozuv ko'rinadi
```

## Psevdokod: bo'linish rejimi (Brewer'ning uch qadami)

```text
on timeout(remoteDc):                        // 1. aniqlash
    enterPartitionMode()

in partitionMode:                            // 2. cheklangan rejim
    allow:    savatga qo'shish, ko'rish
    restrict: oxirgi nusxani sotish (qoldiq invarianti buzilishi mumkin)
    log every operation for later reconciliation

on reconnect:                                // 3. tiklash
    merge(logs)
    for each violated invariant (oversold item):
        compensate()                         // uzr + qaytarish, saga (27-bob)
```

## Framework'larda

| Vazifa | Qayerda |
| --- | --- |
| O'qish/yozish bo'linishi, `sticky` | 94-bob (Laravel) |
| Kompensatsiya, saga, outbox | 27-bob |
| Qayta urinish va idempotentlik | 70-bob; timeout va circuit breaker — 79-bob |
| Kesh va eskirish | 25-bob, 93-bob |

## Trade-off

| Tanlov | Yutuq | Narx |
| --- | --- | --- |
| PC (bo'linishda izchillik) | Nomuvofiq yozuv yo'q | Bo'linishda ba'zi operatsiyalar rad etiladi |
| PA (bo'linishda mavjudlik) | Har doim javob beradi | Tiklashda nomuvofiqlikni hal qilish kerak |
| EC (normal holatda izchillik) | Har o'qish yangi | Har yozuvga replikalar orasidagi kechikish |
| EL (normal holatda kechikish) | Tez javob | Eskirgan o'qish |
| `QUORUM` / `QUORUM` | `W + R > RF` — yozuv ko'rinadi | Ko'proq replika kutiladi |
| `ONE` / `ONE` | Eng tez, eng mavjud | Eskirgan qiymat |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Biz CP/AP tizim" deb butun tizimga bitta yorliq | Brewer: tanlov operatsiya va ma'lumot darajasida | Har operatsiya uchun alohida qaror |
| Faqat bo'linish haqida o'ylash | PACELC: normal holatda ham kechikish ↔ izchillik | Asinxron replika — bu ham izchillik tanlovi |
| Cheksiz qayta urinish | Brewer: bu amalda A o'rniga C ni tanlash, foydalanuvchi kutib qoladi | Aniq timeout va bo'linish qarori |
| `W + R ≤ RF` bilan kuchli izchillik kutish | O'qish yangi yozuvni o'tkazib yuborishi mumkin | `W + R > RF` (masalan, `QUORUM`/`QUORUM`) |
| Bo'linishdan keyingi tiklash rejasi yo'q | Nomuvofiqlik qo'lda topiladi | Bo'linish rejimi, log, kompensatsiya |
| Har joyda kuchli izchillik | Kechikish va mavjudlik narxi hamma joyda to'lanadi | Faqat nomuvofiqlik qimmat bo'lgan joyda |

## Amaliyot

1. Ilovangizdagi 10 ta asosiy operatsiyani ro'yxatlang va har biriga yozing: eskirgan ma'lumot qanchalik zarar qiladi? (qimmat / qabul qilinadi).
2. Har operatsiya uchun PACELC belgisini qo'ying (PC/EC, PA/EL…). Hozirgi texnik yechim bunga mosmi?
3. Ikki datamarkaz (yoki asosiy baza va replika) orasidagi aloqa uzilsa nima bo'ladi? Qaysi operatsiyalar to'xtaydi, qaysilari davom etadi?
4. Bitta "qimmat" operatsiya (ombor qoldig'i, joy band qilish) uchun Brewer'ning uch qadamli bo'linish rejasini yozing.
5. Kvorumli tizimda `RF = 5` uchun `W` va `R` ning kuchli izchillik beradigan barcha juftliklarini toping.

## Manbalar

- Eric Brewer — *CAP Twelve Years Later: How the "Rules" Have Changed* (InfoQ, IEEE Computer, 2012): <https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/>
- Daniel Abadi — *Problems with CAP, and Yahoo's little known NoSQL system* (2010, PACELC): <https://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html>
- Apache Cassandra — Dynamo (Tunable Consistency, Picking Consistency Levels): <https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html>
