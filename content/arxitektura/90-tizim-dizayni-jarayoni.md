# 90 — Tizim dizayni jarayoni va taxminiy hisob

[← Oldingi: AI bilan tizim loyihalash](89-ai-bilan-loyihalash.md) · [Mundarija](README.md) · [Keyingi: Gorizontal masshtab va stateless servislar →](91-gorizontal-masshtab.md)

## Tushuncha

IX qism — **katta yuklama** ostidagi tizimlar: millionlab foydalanuvchi, sekundiga minglab so'rov, terabaytlab ma'lumot. Bunday tizimda "qaysi framework?" savoli ikkinchi darajali. Asosiy savollar:

- qancha so'rov keladi va ularni nechta mashina ko'taradi (91–92-boblar);
- ma'lumot bitta serverga sig'adimi, yo'qmi (94–96-boblar);
- tizimning bir qismi uzilganda nima qurbon qilinadi (97-bob).

Bu bob — shu savollarga **tartib bilan** javob berish jarayoni va ularning asosiy quroli: **taxminiy hisob** (back-of-the-envelope calculation, "konvert orqasidagi hisob") — aniq emas, lekin **tartib** (10 marta, 1000 marta) jihatidan to'g'ri raqam.

### Jarayon: to'rt qadam

```text
1. Talablar          Nima qiladi? (funksional)   Qanchalik yaxshi? (sifat atributlari, 2–3-boblar)
        ↓
2. Hajm hisobi       Foydalanuvchi → so'rov/sek → ma'lumot/kun → tarmoq → xotira
        ↓
3. Yuqori daraja     Bloklar: klient, balanser, servislar, kesh, navbat, baza — ma'lumot oqimi
        ↓
4. Chuqurlashish     Eng xavfli 1–2 joy: "baza sig'maydi" → sharding; "o'qish 10× ko'p" → replika + kesh
```

Har qadam keyingisini **cheklaydi**. Hajm hisobisiz sxema chizish — "Kafka kerakmi?" savoliga taxmin bilan javob berish. Hisob esa ko'pincha oddiyroq javobni ko'rsatadi: kuniga 100 ming so'rov bitta serverga bemalol sig'adi va mikroservislar kerak emas (19-bob).

### Kechikish raqamlari

Taxminiy hisobning asosi — operatsiyalar **tartibini** bilish. Peter Norvig o'z maqolasida "oddiy shaxsiy kompyuter uchun taxminiy vaqtlar" jadvalini bergan. Jeff Dean (Google) uni kengaytirgan va keng tarqalgan nusxasi "~2012" deb belgilangan. Undan asosiy qatorlar:

| Operatsiya | Vaqt | Tartib |
| --- | --- | --- |
| L1 kesh murojaati | 0.5 ns | |
| Asosiy xotira (RAM) murojaati | 100 ns | |
| 1 KB ni 1 Gbit/s tarmoqda yuborish | 10 µs | |
| SSD dan tasodifiy 4 KB o'qish | 150 µs | |
| RAM dan ketma-ket 1 MB o'qish | 250 µs | |
| Bitta datamarkaz ichida borib-kelish | 500 µs | ~0.5 ms |
| SSD dan ketma-ket 1 MB o'qish | 1 ms | |
| Diskda qidirish (seek) | 10 ms | |
| Diskdan ketma-ket 1 MB o'qish | 20 ms | |
| Kaliforniya → Niderlandiya → Kaliforniya paket | 150 ms | |

Bu raqamlar **2012-yildagi uskunalar** uchun; aniq qiymatlar o'zgargan. Ulardan foydalanishning to'g'ri usuli — **nisbatlarni** eslab qolish:

- RAM murojaati (100 ns) disk qidiruvidan (10 ms) **100 000 marta**, ketma-ket 1 MB o'qishda esa (250 µs va 20 ms) **80 marta** tez — shuning uchun kesh (25-bob) ishlaydi;
- datamarkaz ichidagi tarmoq (~0.5 ms) qit'alararo tarmoqdan (~150 ms) **300 marta** tez — shuning uchun CDN (93-bob) va foydalanuvchiga yaqin server;
- ketma-ket o'qish tasodifiydan ancha tez — shuning uchun indeks har doim ham yutmaydi (SQL kitobi, [41-bob](../sql/41-indeks-qanday-ishlaydi.md)).

### O'rtacha emas — persentil

Google SRE kitobi ("Service Level Objectives" bobi) ogohlantiradi: faqat **o'rtacha** kechikishga qarash xatarli. Kitobdagi misolda tipik so'rov ~50 ms da bajariladi, lekin **5% so'rov 20 baravar sekin**. O'rtacha kechikish kun davomida o'zgarmay ko'rinadi, holbuki "dum" (tail latency) keskin o'zgaradi. Shuning uchun:

- **p50** (median) — tipik holat;
- **p99, p99.9** — "mumkin bo'lgan eng yomon" holat.

Kitobga ko'ra foydalanuvchilar odatda **biroz sekinroq, lekin barqaror** tizimni tez, lekin javob vaqti keskin o'zgarib turadigan tizimdan afzal ko'radi. Talablarni yozganda (1-qadam) — "p99 < 300 ms" kabi persentil bilan.

### QPS — boshlanish nuqtasi, o'lchov emas

Hajm hisobi odatda **QPS** (queries per second, sekundiga so'rovlar) bilan boshlanadi. Lekin SRE kitobi ("Handling Overload" bobi) bu raqamning cheklovini ochiq aytadi: turli so'rovlar resurs talabi jihatidan **keskin farq qiladi**, va sig'imni "sekundiga so'rovlar" bilan modellashtirish ko'pincha **yomon o'lchov** — nisbatlar vaqt o'tishi bilan o'zgaradi. Kitob tavsiyasi — sig'imni to'g'ridan-to'g'ri **resurslarda** o'lchash: masalan, "bu servis uchun 500 CPU yadrosi va 1 TB xotira".

Xulosa: QPS — **tartibni** baholash uchun (bitta servermi, o'ntami, mingtami?). Haqiqiy sig'im — yuklama sinovida resurslar bo'yicha o'lchanadi (78-bob).

## Nega shunday

Katta tizim xatolari qimmat va kech topiladi. Masalan, foydalanuvchilar o'n baravar ko'payganda baza sig'may qolsa, sharding (95-bob) ishlayotgan tizimda, ma'lumotni ko'chirib bajariladi. Jarayon va hisob shu xavfni **chizish bosqichida** ko'rsatadi:

- **talablar** — "nimani qurmaymiz"ni aniqlaydi (har qism qo'shimcha murakkablik);
- **hisob** — oddiy yechim yetarlimi, yo'qmi;
- **chuqurlashish** — vaqtni haqiqiy xavfga sarflash, hamma joyni "masshtablanadigan" qilishga emas.

## Psevdokod: taxminiy hisob

Misol — xabar almashish servisi. Quyidagi **dastlabki shartlar — misol uchun tanlangan farazlar**, haqiqiy loyihada ular biznes talablaridan keladi:

```text
Farazlar (misol):
  kunlik faol foydalanuvchi (DAU)      10 000 000
  har biri kuniga yuboradi              40 xabar
  bitta xabar (matn + metama'lumot)     200 bayt
  o'qish yozishdan                      10× ko'p
  cho'qqi o'rtachadan                   3×

Yozish:
  kunlik xabar     = 10 000 000 × 40          = 400 000 000
  o'rtacha QPS     = 400 000 000 / 86 400     ≈ 4 630 /sek
  cho'qqi QPS      ≈ 4 630 × 3                ≈ 13 900 /sek

O'qish:
  o'rtacha QPS     ≈ 4 630 × 10               ≈ 46 300 /sek

Saqlash:
  kuniga           = 400 000 000 × 200 B      = 80 GB
  yiliga           ≈ 80 GB × 365              ≈ 29 TB
  5 yil, 3 nusxa   ≈ 29 TB × 5 × 3            ≈ 438 TB

Tarmoq (kiruvchi, yozish):
  4 630 × 200 B                               ≈ 0.9 MB/sek
```

Hisobdan chiqadigan xulosalar:

```text
✔ Kiruvchi tarmoq — muammo emas (≈1 MB/sek)
✔ O'qish yozishdan 10× ko'p → o'qish replikalari va kesh (94-, 25-boblar)
✘ 438 TB bitta serverga sig'maydi → bo'lish (sharding, 95-bob) yoki eski xabarlarni arxivlash
? 13 900 yozish/sek bitta baza ko'taradimi → hisob bilan emas, yuklama sinovi bilan (78-bob)
```

Hisob qulay bo'lishi uchun yaxlitlash: kunda 86 400 sekund ≈ **10⁵**. Unda 400 mln / 10⁵ = **4 000** — aniq 4 630 emas, lekin tartib to'g'ri. Taxminiy hisobning maqsadi aynan shu.

## Psevdokod: yuqori darajadagi sxema

```text
             ┌──────────┐
 Klientlar ─▶│ Balanser │─▶ API servislar (stateless, N nusxa)    91–92-boblar
             └──────────┘          │
                      ┌────────────┼──────────────┐
                      ▼            ▼              ▼
                 Kesh (Redis)   Navbat      Xabarlar bazasi
                   25-bob       26-bob    (shard'lar + replikalar, 94–95)
                                   │
                                   ▼
                     Fan-out / bildirishnoma servisi   99-bob
```

Har blok yonida — hisobdagi qaysi raqam uni talab qilganini yozing. Raqam bilan asoslanmagan blok — olib tashlashga nomzod.

## Framework'larda

Taxminiy hisob tilga bog'liq emas; uni tekshirish esa aniq vositalar bilan:

| Nimani tekshirish | Qayerda |
| --- | --- |
| Jadval va indeks real hajmi (bir qatorga bayt) | PostgreSQL `pg_relation_size`, MySQL `information_schema.tables` — [SQL 39-bob](../sql/39-birlamchi-kalitni-tanlash.md) |
| So'rov nechta qator o'qiydi, qancha vaqt | `EXPLAIN ANALYZE` — [SQL 45-bob](../sql/45-explain.md) |
| p50/p99 kechikish production'da | Metrikalar va tracing — 75-bob |
| Frontend tomonidagi byudjet | Unumdorlik byudjetlari — 47-bob |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Hisobsiz, "o'sganda ko'ramiz" | Tez boshlash | Masshtab muammosi production'da topiladi |
| Taxminiy hisob | Tartib xatolarini erta ko'rsatadi | Farazlar noto'g'ri bo'lsa — xulosa ham |
| To'liq yuklama sinovi | Haqiqiy raqam | Qimmat, ishlaydigan tizim kerak |
| "Hamma narsa masshtablanadigan" | Kelajakka zaxira | Bugun keraksiz murakkablik (19-bob) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Talabsiz to'g'ridan-to'g'ri sxema | Keraksiz bloklar, muhim talab unutiladi | Avval funksional va sifat talablari |
| Faqat o'rtacha kechikish | SRE: "dum" o'zgarishi ko'rinmaydi | p50 + p99/p99.9 |
| QPS ni sig'im o'lchovi deb olish | SRE: so'rovlar narxi har xil, nisbat o'zgaradi | QPS — tartib uchun; sig'im — resurslarda |
| Saqlash hisobida nusxalar va o'sish yo'q | Hajm bir necha baravar kam baholanadi | Replikatsiya koeffitsienti × yillar |
| 2012 jadvalidagi raqamlarni aniq deb olish | Uskunalar o'zgargan | Nisbatlar va tartiblar |
| Farazlarni yozmaslik | Keyin hisobni tekshirib bo'lmaydi | Har faraz alohida qator, manbasi bilan |
| Hisobni sinov o'rniga qo'yish | Taxmin ±10× xato bo'lishi mumkin | Muhim raqam — yuklama sinovi bilan tasdiqlash |

## Amaliyot

1. O'z loyihangiz uchun to'rt qadamni yozing: funksional talablar, 3 ta sifat atributi (raqam bilan), hajm hisobi, yuqori darajadagi sxema.
2. Hajm hisobini qiling: DAU, kunlik so'rovlar, o'rtacha va cho'qqi QPS, kunlik va 3 yillik saqlash.
3. Production metrikalaringizda bitta endpoint uchun p50 va p99 ni solishtiring. Farq necha baravar?
4. Sxemangizdagi har blok uchun: qaysi raqam uni talab qildi? Asossiz blokni olib tashlang.
5. Hisobdagi eng xavfli raqamni toping (masalan, cho'qqi yozish QPS) va uni qanday sinov bilan tasdiqlashni rejalashtiring.

## Manbalar

- Peter Norvig — *Teach Yourself Programming in Ten Years* (Answers: approximate timing for various operations): <https://norvig.com/21-days.html#answers>
- Jeff Dean — *Latency Comparison Numbers (~2012)* (Jonas Bonér gist): <https://gist.github.com/jboner/2841832>
- Google — *Site Reliability Engineering*, 4-bob: Service Level Objectives (persentillar): <https://sre.google/sre-book/service-level-objectives/>
- Google — *Site Reliability Engineering*, 21-bob: Handling Overload ("Queries per Second" tuzog'i): <https://sre.google/sre-book/handling-overload/>
