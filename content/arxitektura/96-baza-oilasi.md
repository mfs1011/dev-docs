# 96 — Ma'lumotlar bazasi oilasini tanlash

[← Oldingi: Sharding va consistent hashing](95-sharding.md) · [Mundarija](README.md) · [Keyingi: CAP, PACELC va izchillik modellari →](97-cap-va-pacelc.md)

## Tushuncha

23-bobda baza tanlash qisqa — bitta jadval qatorida — ko'rilgan edi. Bu bob — katta tizimlarda uchraydigan asosiy **ma'lumot modellari** (oilalar) va ularni tanlash mezoni.

| Oila | Asosiy birlik | Misol (rasmiy hujjatlari shu bobda) |
| --- | --- | --- |
| **Relyatsion** | Jadval, qator, `JOIN` | PostgreSQL, MySQL, SQLite (SQL kitobi) |
| **Hujjat** (document) | JSON-ga o'xshash hujjat | MongoDB |
| **Kalit-qiymat** / ma'lumot tuzilmalari | Kalit → qiymat (satr, ro'yxat, to'plam…) | Redis |
| **Keng ustunli** (wide-column) | Bo'lim (partition) kaliti bo'yicha taqsimlangan jadval | Apache Cassandra |
| **Graf** | Tugun va bog'lanish | Neo4j |

Hamma oilalarga umumiy savol bitta: **ma'lumotga qanday murojaat qilinadi** (access pattern)? Turli hujjatlar buni turlicha aytadi, lekin xulosa bir xil.

### Relyatsion

Sxema oldindan belgilanadi; munosabatlar tashqi kalitlar bilan; istalgan so'rov `JOIN` bilan yoziladi; tranzaksiyalar va cheklovlar baza darajasida (SQL kitobi, 37–38-boblar). Cassandra hujjati relyatsion yondashuvni shunday tasvirlaydi: avval domendagi tushunchalar jadvallarga aylantiriladi, kalitlar qo'yiladi — so'rovlar esa **ikkinchi darajali**, chunki jadvallar to'g'ri modellashtirilgan bo'lsa, kerakli ma'lumotni istalgan so'rov bilan olish mumkin deb hisoblanadi.

### Hujjat (MongoDB)

MongoDB hujjatiga ko'ra:

- ma'lumot modeli **moslashuvchan**: bitta kolleksiyadagi hujjatlarda bir xil maydonlar bo'lishi **shart emas**, maydon tipi ham hujjatdan hujjatga farq qilishi mumkin;
- asosiy tamoyil — **birga o'qiladigan ma'lumot birga saqlanadi**; model ilovaning ma'lumotga murojaat qilish naqshlariga qarab tuziladi;
- hujjat maydoni boshqa hujjatlar, massivlar va hujjatlar massivini o'z ichiga olishi mumkin — munosabatlar **ichiga joylash** (embedding) yoki havola orqali;
- sxema tekshiruvi (schema validation) qat'iy nazorat kerak bo'lgan qismlarga **qo'shiladi**.

Hujjatdagi misollar: xodim hujjatiga bo'lim ma'lumotini joylash (bitta so'rov bilan olinadi); mahsulot sahifasida oxirgi 5 ta sharh — barcha sharhlar alohida kolleksiyada, chunki ular kamroq o'qiladi; turli atributli mahsulotlar — bitta kolleksiyada.

### Kalit-qiymat (Redis)

Redis hujjati uni **ma'lumot tuzilmalari serveri** deb ataydi: o'zida satrlar, hash'lar, ro'yxatlar, to'plamlar, saralangan to'plamlar (sorted sets), oqimlar (streams), geofazoviy indekslar, vaqt qatorlari va boshqa tiplar — keshlashdan navbat va hodisalarni qayta ishlashgacha.

Asosiy saqlash bazasi sifatida tanlashdan oldin **saqlash kafolati** muhim. Redis hujjatidagi persistensiya variantlari:

- **RDB** — belgilangan oraliqlarda butun ma'lumotning nusxasi (snapshot);
- **AOF** — har bir yozish operatsiyasi log'ga yoziladi va qayta ishga tushganda qayta bajariladi;
- **persistensiyasiz** — hujjat aytganidek, ba'zan **kesh** uchun ishlatiladi;
- RDB + AOF birga.

Ya'ni bir xil Redis sozlamaga qarab ham kesh (25-bob), ham saqlash bo'lishi mumkin. Qaysi biri ekanini loyihada aniq belgilash kerak.

### Keng ustunli (Cassandra)

Cassandra hujjatining "RDBMS Design" bo'limi farqlarni aniq sanaydi:

- **`JOIN` yo'q.** `JOIN` kerak bo'lsa — yoki klient tomonida, yoki natijani ifodalaydigan **ikkinchi, denormallashgan jadval**. Hujjat ikkinchisini afzal deydi: klientdagi `JOIN` "juda kamdan-kam" bo'lishi kerak;
- **referensial yaxlitlik yo'q** — jadvallar orasida tashqi kalit tushunchasi yo'q;
- **denormalizatsiya — oddiy holat.** Relyatsion dunyoda Codd'ning normal shakllarini buzadi; Cassandra'da "mutlaqo normal". 3.0 dan beri server boshqaradigan materialized view'lar bor;
- **avval so'rov** (query-first design): ma'lumot modelidan emas, **so'rov modelidan** boshlanadi — eng ko'p ishlatiladigan so'rov yo'llari uchun jadvallar yaratiladi.

Ma'lumot bo'lim kaliti bo'yicha hash halqasida taqsimlanadi (95-bob, consistent hashing).

Hujjatning qiziq kuzatuvi: kompaniyalar ko'pincha **relyatsion** bazani ham denormallashtiradi. Ikki sabab: unumdorlik (yillar davomidagi ma'lumot ustida ko'p `JOIN`), va **hujjatni tarixda saqlash** zarurati. Misol — hisob-faktura: u mijoz va mahsulot jadvallariga havola qilsa, ularning narxi yoki ma'lumoti o'zgarganda faktura sanasidagi holat yo'qoladi. Bu audit, hisobot va qonun talablarini buzishi mumkin. (38-bobdagi "sotilgan narx — alohida fakt" g'oyasi aynan shu.)

### Graf (Neo4j)

Neo4j hujjatiga ko'ra relyatsion bazalar bog'lanishlar uchun hisoblash jihatidan **qimmat `JOIN`** larni ishlatadi. Graf bazalar `JOIN` ishlatmaydi — bog'lanishlar ma'lumot elementlari (tugunlar) bilan birga **tabiiy holda** saqlanadi. Bu chuqur va keng bo'ylab yurishni (traversal) optimallashtiradi. Tipik vazifalar: "do'stlarning do'stlari", tavsiyalar, firibgarlik zanjirlari — ko'p bosqichli bog'lanishlar.

## Nega shunday

Har oila o'z **murojaat naqshi** uchun optimallashtirilgan va boshqasi uchun qimmat:

| Oila | Kuchli | Zaif |
| --- | --- | --- |
| Relyatsion | Oldindan noma'lum so'rovlar, tranzaksiya, cheklovlar | Bitta serverdan tashqariga masshtab (95-bob) |
| Hujjat | Birga o'qiladigan, tuzilishi o'zgaruvchan ma'lumot | Ko'p hujjatlarni bog'lovchi so'rovlar |
| Kalit-qiymat | Kalit bo'yicha juda tez operatsiya, maxsus tuzilmalar | Kalitsiz qidiruv, murakkab so'rov |
| Keng ustunli | Katta hajmda yozish, gorizontal masshtab, oldindan ma'lum so'rovlar | `JOIN` yo'q, yangi so'rov — ko'pincha yangi jadval |
| Graf | Ko'p bosqichli bog'lanishlar | Oddiy jadvalli hisobot va agregatsiya |

Shuning uchun bitta tizimda **bir nechta** baza birga ishlatilishi mumkin (polyglot persistence). Masalan: asosiy ma'lumot relyatsion bazada, kesh va hisoblagichlar Redis'da, qidiruv alohida indeksda (29-bob), ulkan hodisalar oqimi keng ustunli bazada. Har yangi baza — qo'shimcha ekspluatatsiya, zaxira nusxa va izchillik muammosi (27-bob).

## Psevdokod: tanlash savollari

```text
1. Qanday so'rovlar bo'ladi?
   - oldindan noma'lum, hisobot, ad-hoc            → relyatsion
   - oldindan ma'lum, kalit bo'yicha, juda ko'p     → kalit-qiymat / keng ustunli
2. Ma'lumot qanday o'qiladi?
   - butun "hujjat" birga (buyurtma + qatorlari)    → hujjat (yoki relyatsion + JSON, SQL 35-bob)
   - ko'p bosqichli bog'lanishlar                   → graf
3. Izchillik va tranzaksiya qanchalik muhim?
   - pul, qoldiq, bir nechta jadvalni birga         → relyatsion (ACID, 24-bob)
4. Hajm va yozish tezligi (90-bob hisobi)
   - bitta server + replika yetadimi?               → yetsa — relyatsion qoladi
5. Jamoa nimani biladi va ekspluatatsiya qila oladi?
```

## Psevdokod: bitta vazifa — turli modellar

```text
Vazifa: mahsulot sahifasi — mahsulot, atributlar, oxirgi 5 sharh

Relyatsion
  products(id, name, price) + product_attributes(product_id, key, value) + reviews(...)
  SELECT … JOIN … ORDER BY created_at DESC LIMIT 5

Hujjat (MongoDB hujjatidagi misol)
  products: { _id, name, price, attributes: {…har xil…}, recentReviews: [5 ta] }
  reviews:  barcha sharhlar alohida — kam o'qiladi

Keng ustunli (query-first)
  reviews_by_product(product_id, created_at DESC, review)    -- aynan shu so'rov uchun jadval

Kalit-qiymat
  product:42 → JSON (kesh), reviews:42 → ro'yxat (oxirgi 5 tasi)
```

## Framework'larda

| Model | Qayerda |
| --- | --- |
| Relyatsion — sxema, cheklovlar, indekslar | SQL kitobi (II–VIII qismlar); ORM — Laravel Eloquent, Doctrine (Symfony kitobi) |
| Relyatsion ichida hujjat (`jsonb`, MySQL `JSON`) | [SQL 35-bob](../sql/35-json.md) |
| Redis — kesh, sessiya, navbat | [Laravel 27-bob](../laravel/27-kesh-va-fayllar.md), [Laravel 25-bob](../laravel/25-navbatlar.md); [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) |
| Qidiruv uchun alohida tizim | 29-bob |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Faqat relyatsion | Bitta tizim, ACID, moslashuvchan so'rovlar | Juda katta hajmda masshtab qiyin |
| Relyatsion + JSON ustunlar | Moslashuvchanlik va tranzaksiya birga | JSON ichidagi qoidalarni baza kamroq nazorat qiladi |
| Hujjat bazasi | Tuzilish o'zgaruvchan ma'lumotga mos | Hujjatlararo bog'lanish va yaxlitlik ilovaga tushadi |
| Keng ustunli | Ulkan yozish hajmi | Har yangi so'rov — yangi jadval; `JOIN` yo'q |
| Bir nechta baza | Har vazifaga mos vosita | Ekspluatatsiya, zaxira, ma'lumotni moslash |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "NoSQL tezroq" deb relyatsiondan voz kechish | Tranzaksiya, cheklov, ad-hoc so'rovlar yo'qoladi | Avval murojaat naqshlari va hajm hisobi |
| Cassandra'ni relyatsion kabi loyihalash | `JOIN` yo'q — so'rovlar ishlamaydi | Query-first: so'rov → jadval |
| Hujjat bazasida hammasini bitta hujjatga | Hujjat o'sib boradi, har yangilash og'ir | Hujjat tavsiyasi: birga o'qiladigan birga, kam o'qiladigan alohida |
| Redis'ni persistensiyasiz asosiy ombor qilish | Qayta ishga tushganda ma'lumot yo'qoladi | RDB/AOF ni ongli tanlash yoki faqat kesh |
| Fakturada mijoz/narxga faqat havola | Ma'lumot o'zgarsa tarixiy hujjat buziladi (Cassandra hujjatidagi misol) | Hujjat sanasidagi holatni saqlash |
| Har vazifaga yangi baza | Jamoa uchun ekspluatatsiya yuki | Mavjud bazaning imkoniyatlari (JSON, to'liq matnli qidiruv) yetmasa — keyin |

## Amaliyot

1. Loyihangizdagi eng muhim 10 ta so'rovni yozing. Ular oldindan ma'lummi yoki ad-hoc?
2. Bitta obyekt (masalan, buyurtma) uchun relyatsion va hujjat modelini chizing. Qaysi so'rovlar qaysi modelda osonroq?
3. Redis ishlatsangiz: u kesh yoki asosiy ombormi? Persistensiya sozlamasi bunga mosmi?
4. Tarixda o'zgarmasligi kerak bo'lgan hujjatlarni (faktura, shartnoma) toping. Ular hozir boshqa jadvallarga faqat havola qiladimi?
5. Ikkinchi baza qo'shish rejasi bo'lsa: mavjud bazada bu vazifani yechib bo'lmasligini isbotlang.

## Manbalar

- MongoDB — Data Modeling: <https://www.mongodb.com/docs/manual/data-modeling/>
- Redis — Data types: <https://redis.io/docs/latest/develop/data-types/>
- Redis — Persistence: <https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/>
- Apache Cassandra — Data Modeling: RDBMS Design: <https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/data-modeling_rdbms.html>
- Neo4j — What is a graph database: <https://neo4j.com/docs/getting-started/graph-database/>
