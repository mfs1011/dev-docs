# 01 — Relyatsion model va SQL standarti

[← Mundarija](README.md) · [Keyingi: PostgreSQL, MySQL va SQLite →](02-uch-tizim.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/01-1-tushuncha.jpg" src="/video/sql/01-1-tushuncha.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/01-1-tushuncha.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/01-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: relyatsion model, asosiy atamalar, SQL standarti, dialekt va uch tizim — shu bob "Tushuncha" va "Standart" bo'limlarining qisqa ko'rinishi.</figcaption>
</figure>

**Ma'lumotlar bazasi** — ma'lumotni tartibli saqlaydigan va undan foydalanishga imkon beradigan tizim. Uni boshqaradigan dastur **MBBT** (ma'lumotlar bazasini boshqarish tizimi) deyiladi. Inglizchasi *DBMS*, ya'ni *Database Management System*. PostgreSQL, MySQL va SQLite — shunday tizimlar.

Bu qo'llanmadagi uchala tizim ham **relyatsion** (inglizcha *relational*). PostgreSQL hujjati buni bunday tushuntiradi: relyatsion MBBT ma'lumotni **relyatsiyalarda** saqlaydi, "relyatsiya" esa aslida **jadval**ning matematik nomi. Ma'lumotni saqlashning boshqa usullari ham bor. Masalan, kompyuterdagi papka va fayllar — **ierarxik** baza. Undan yangiroq yo'nalish — obyektga yo'naltirilgan bazalar.

MySQL qo'llanmasi ham shu fikrni aytadi: relyatsion baza ma'lumotni "bitta katta omborxonaga" emas, **alohida jadvallarga** joylaydi. Jadvallar orasidagi bog'lanishlar uchun qoidalar o'rnatiladi: "birga bir", "birga ko'p", "takrorlanmasin", "majburiy" va hokazo. Bu qoidalarni ilovaning o'zi emas, **baza** kuzatib boradi. Sxema yaxshi loyihalangan bo'lsa, ilova hech qachon qarama-qarshi, takrorlangan, "yetim" yoki yo'qolgan ma'lumotni ko'rmaydi.

### Asosiy atamalar

Atamalar PostgreSQL glossariysidan olingan. Bu qo'llanmada shular ishlatiladi.

| Atama | Inglizcha | Ma'nosi |
| --- | --- | --- |
| Jadval | *table* | Bir xil tuzilmadagi qatorlar to'plami: har qatorda ustunlar soni, tartibi, nomi va tipi bir xil |
| Qator | *row*, *tuple* | Bitta yozuv. Masalan, bitta talaba haqidagi ma'lumot. Nazariyada **kortej** (*tuple*) deyiladi |
| Ustun | *column*, *attribute* | Qatordagi nomlangan maydon, aniq bir **ma'lumot tipi**ga ega. Nazariyada **atribut** deyiladi |
| Relyatsiya | *relation* | Umumiy ma'noda — qatorlar to'plami. Jadval ham, so'rov natijasi ham relyatsiya |
| Cheklov | *constraint* | Jadvalga yozish mumkin bo'lgan qiymatlarga qo'yilgan qoida |
| Birlamchi kalit | *primary key* | Har qatorni yagona aniqlaydigan ustun(lar). Takrorlanmaydi va NULL bo'lmaydi. Jadvalda bittagina bo'ladi |
| Tashqi kalit | *foreign key* | Boshqa jadvaldagi bitta qatorga ishora qiluvchi ustun(lar) |
| NULL | *null* | "Qiymat yo'q" degani. Nol ham, bo'sh satr ham emas |

Bitta PostgreSQL serveri boshqaradigan bazalar to'plami **klaster** (*database cluster*) deyiladi.

```text
klaster (bitta server)
└── baza: qollanma
    └── jadval: talabalar
        ├── ustunlar: id | ism | kurs
        └── qatorlar: (1, 'Ali', 1), (2, 'Vali', 2), ...
```

### Eng muhim qoida: qatorlarda tartib yo'q

PostgreSQL hujjati alohida ta'kidlaydi: har qatorda **ustunlar** tartibi qat'iy, lekin SQL jadvaldagi **qatorlar tartibini hech qanday kafolatlamaydi**. Kerakli tartib bo'lsa, natijani so'rovda aniq saralash kerak.

Matematikada relyatsiya — **to'plam**, to'plam elementlarida esa tartib bo'lmaydi. Bu qoida aynan shundan kelib chiqadi. Quyidagi "Kod" bo'limida buni amalda ko'ramiz.

## Standart

**SQL** — *Structured Query Language*, ya'ni "tuzilmaviy so'rovlar tili". MySQL qo'llanmasida aytilganidek, bu bazalar bilan ishlash uchun eng keng tarqalgan **standartlashtirilgan** til. SQL'ni uch xil ishlatish mumkin:

- to'g'ridan-to'g'ri yozish, masalan, hisobot olish uchun;
- boshqa tildagi kod ichiga joylash;
- SQL'ni yashirib, uni o'zi yaratadigan kutubxona (masalan, ORM) orqali ishlash.

Standartning rasmiy nomi — **ISO/IEC 9075 "Database Language SQL"**. Uni xalqaro standartlashtirish tashkiloti ISO chiqaradi. PostgreSQL hujjatining D ilovasiga ko'ra versiyalar quyidagicha:

| Versiya | Izoh |
| --- | --- |
| SQL-92 | Moslikning uch darajasi bor edi: Entry, Intermediate, Full |
| SQL:1999 | Darajalar o'rniga alohida **xususiyatlar** (*features*) ro'yxati paydo bo'ldi |
| SQL:2003, SQL:2006, SQL:2008, SQL:2011, SQL:2016 | Keyingi tahrirlar |
| SQL:2023 | Eng so'nggisi, ISO/IEC 9075:2023 |

Har yangi versiya oldingisini **almashtiradi**. Shuning uchun hujjat "eski versiyaga moslik haqidagi da'volarning rasmiy ahamiyati yo'q" deydi. MySQL qo'llanmasi ham "standart" deganda doim uning joriy versiyasini nazarda tutadi.

**Core va ixtiyoriy xususiyatlar.** SQL:1999 dan boshlab standart yuzlab xususiyatni sanab chiqadi. Ulardan bir qismi **Core** deb ataladi: standartga mos deyilgan har qanday tizim ularni bajarishi shart. Qolganlari ixtiyoriy.

PostgreSQL 18 SQL:2023 dagi 177 ta majburiy Core xususiyatdan kamida 170 tasini bajaradi. Hujjatda yana bir muhim gap bor: yozilgan paytda **hech bir** MBBT Core SQL:2023 ga to'liq moslikni da'vo qilmaydi.

**Standart qismlari.** Standart bir nechta qismdan iborat:

| Qism | Nomi | Mazmuni |
| --- | --- | --- |
| 9075-1 | SQL/Framework | Umumiy tuzilma |
| 9075-2 | SQL/Foundation | Tilning asosi: jadvallar, so'rovlar, tiplar |
| 9075-3 | SQL/CLI | Dasturdan chaqirish interfeysi |
| 9075-4 | SQL/PSM | Saqlanadigan protseduralar |
| 9075-9 | SQL/MED | Tashqi ma'lumotlarni boshqarish |
| 9075-10 | SQL/OLB | Obyekt tillari bilan bog'lanish |
| 9075-11 | SQL/Schemata | Ma'lumot va ta'rif sxemalari (`information_schema`) |
| 9075-13 | SQL/JRT | Java'dagi rutinalar va tiplar |
| 9075-14 | SQL/XML | XML bilan ishlash |
| 9075-15 | SQL/MDA | Ko'p o'lchamli massivlar |
| 9075-16 | SQL/PGQ | Graf so'rovlari |

PostgreSQL yadrosi 1, 2, 9, 11 va 14-qismlarni qamraydi. Bu qo'llanmaning deyarli hammasi **2-qism — Foundation** haqida.

### Dialekt nima

Standart bor bo'lsa ham, SQLite hujjati ochiq aytadi: "ikkita SQL tizimi aynan bir xil ishlamaydi". Har tizimning o'z xususiyatlari bor. Standartdan farq qiladigan qism **dialekt** deyiladi. U ikki xil bo'ladi:

- **Kengaytma** (*extension*) — standartda yo'q, lekin tizim qo'shgan imkoniyat. MySQL qo'llanmasi: "agar bu foydalanuvchilarimizning katta qismi uchun qulaylikni ancha oshirsa, SQL'ga kengaytma qo'shishdan qo'rqmaymiz".
- **Farq** (*difference*) — standartdagi narsa tizimda boshqacha ishlaydi.

Shuning uchun bu qo'llanmaning har bobida ikki savolga javob beriladi: **standart nima deydi** va **har tizim aslida nima qiladi**.

### Uch tizim qisqacha

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| O'zini qanday ta'riflaydi | Obyekt-relyatsion MBBT (ORDBMS) | Relyatsion baza | O'rnatiladigan (*embedded*), serversiz SQL dvigateli |
| Kelib chiqishi | Berkeley universitetidagi POSTGRES loyihasi (1986-yildan); SQL 1994-yilda qo'shilgan; 1996-yildan PostgreSQL nomi | Oracle Corporation ishlab chiqaradi, tarqatadi va qo'llab-quvvatlaydi | Kutubxona sifatida ilova ichida ishlaydi |
| Standartga munosabati | Standartning so'nggi versiyasiga moslikka intiladi, "an'anaviy imkoniyatlar yoki sog'lom fikrga zid bo'lmasa" | Standartga intiladi, lekin "tezlik va ishonchlilikni qurbon qilmasdan"; kengaytmalar ko'p | Farqlari "Quirks" sahifasida alohida yozilgan |

Ularning arxitekturasi va qaysi biri qachon mos kelishi 2-bobda batafsil ko'riladi.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/01-2-kod.jpg" src="/video/sql/01-2-kod.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/01-2-kod.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/01-2-kod.uz.vtt">
</video>
<figcaption>Video: quyidagi buyruqlar haqiqiy psql terminalida (PostgreSQL 18.6) — qatorlar tartibi va <code>sql_features</code>.</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. SQLite rasmiy manba kodidan (`sqlite-autoconf-3540000`) hujjatdagi `./configure && make` usuli bilan yig'ilgan. Natijalar haqiqiy. O'rnatish va ulanish 3-bobda, hozircha natijalarni o'qish yetarli.

### Qatorlar tartibi kafolatlanmaydi

PostgreSQL'da jadval yaratib, uchta qator qo'shamiz:

```sql
CREATE TABLE talabalar (
    id    integer PRIMARY KEY,
    ism   text NOT NULL,
    kurs  integer
);

INSERT INTO talabalar VALUES (1, 'Ali', 1), (2, 'Vali', 2), (3, 'Dilnoza', 1);

SELECT * FROM talabalar;
```

```text
 id |   ism   | kurs 
----+---------+------
  1 | Ali     |    1
  2 | Vali    |    2
  3 | Dilnoza |    1
(3 rows)
```

Natija qo'shilgan tartibda chiqdi. Endi bitta qatorni o'zgartirib, xuddi shu so'rovni qaytaramiz:

```sql
UPDATE talabalar SET kurs = 2 WHERE id = 1;

SELECT * FROM talabalar;
```

```text
 id |   ism   | kurs 
----+---------+------
  2 | Vali    |    2
  3 | Dilnoza |    1
  1 | Ali     |    2
(3 rows)
```

`SELECT` so'rovi o'zgarmadi, lekin Ali endi **oxirida** chiqdi. Sababi shu: `ORDER BY` bo'lmasa, baza qatorlarni o'ziga qulay tartibda qaytaradi. PostgreSQL `UPDATE` da qatorning yangi versiyasini yozadi. Buning ichki mexanizmi — MVCC, u 52-bobda tushuntiriladi.

Tartib kerak bo'lsa, uni aniq so'rash kerak:

```sql
SELECT * FROM talabalar ORDER BY id;
```

```text
 id |   ism   | kurs 
----+---------+------
  1 | Ali     |    2
  2 | Vali    |    2
  3 | Dilnoza |    1
(3 rows)
```

### PostgreSQL standartning qaysi xususiyatlarini bajaradi

Standartning 11-qismi — `information_schema` — bazaning o'zi haqidagi ma'lumotni jadval ko'rinishida beradi. PostgreSQL unda `sql_features` jadvalini saqlaydi: standart xususiyatlarining ro'yxati va har biri bajarilgan-bajarilmagani.

```sql
SELECT is_supported, count(*)
FROM information_schema.sql_features
WHERE sub_feature_id = ''
GROUP BY is_supported
ORDER BY is_supported;
```

```text
 is_supported | count 
--------------+-------
 NO           |   295
 YES          |   320
(2 rows)
```

Bu yerda Core va ixtiyoriy xususiyatlarning hammasi sanalgan, shuning uchun 177 ta Core'dan katta son chiqdi. Bir nechta xususiyatni nomi bilan ko'ramiz:

```sql
SELECT feature_id, feature_name, is_supported
FROM information_schema.sql_features
WHERE feature_id IN ('E011', 'F302', 'T611', 'T626') AND sub_feature_id = ''
ORDER BY feature_id;
```

```text
 feature_id |        feature_name        | is_supported 
------------+----------------------------+--------------
 E011       | Numeric data types         | YES
 F302       | INTERSECT table operator   | YES
 T611       | Elementary OLAP operations | YES
 T626       | ANY_VALUE                  | YES
(4 rows)
```

Har xususiyatning kodi bor. `E011` — raqamli tiplar, `F302` — `INTERSECT` amali (28-bob), `T611` — window funksiyalar (31-bob), `T626` — `ANY_VALUE` (26-bob). Kitob davomida biror imkoniyatning standartdagi o'rnini shu kodlar bilan ko'rsatamiz.

Hujjat shuni ham ogohlantiradi: bu ro'yxatlar **taqribiy**. Aniq ma'lumot hujjatning asosiy qismida beriladi.

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/01-3-dialektlar.jpg" src="/video/sql/01-3-dialektlar.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/01-3-dialektlar.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/01-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: uchala misol PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 terminallarida yonma-yon, natijalar haqiqiy.</figcaption>
</figure>

Bitta so'rov uch tizimda turlicha ishlashi mumkin. Uchta misol bilan ko'ramiz.

### 1. Matnni `||` bilan birlashtirish

Standartda `||` — ikki satrni bir-biriga ulash amali.

**PostgreSQL:**

```sql
SELECT 'Salom, ' || 'dunyo' AS natija;
```

```text
    natija    
--------------
 Salom, dunyo
(1 row)
```

**SQLite** ham xuddi shunday javob beradi: `Salom, dunyo`.

**MySQL** esa butunlay boshqa narsa qaytaradi:

```sql
SELECT 'Salom, ' || 'dunyo' AS natija;
SHOW WARNINGS;
```

```text
+--------+
| natija |
+--------+
|      0 |
+--------+
+---------+------+-------------------------------------------------------------------------------------------------------+
| Level   | Code | Message                                                                                               |
+---------+------+-------------------------------------------------------------------------------------------------------+
| Warning | 1287 | '|| as a synonym for OR' is deprecated and will be removed in a future release. Please use OR instead |
| Warning | 1292 | Truncated incorrect DOUBLE value: 'Salom, '                                                           |
| Warning | 1292 | Truncated incorrect DOUBLE value: 'dunyo'                                                             |
+---------+------+-------------------------------------------------------------------------------------------------------+
```

MySQL'da `||` sukut bo'yicha mantiqiy **YOKI** (`OR`) degani. U ikki satrni songa aylantirdi: ikkalasi ham 0 bo'ldi, natijada "0 yoki 0" = `0` chiqdi. Xato emas, faqat **ogohlantirish** berildi. MySQL'da satrlar `CONCAT()` funksiyasi bilan ulanadi (33-bob).

### 2. Qo'shtirnoq: nom yoki satr?

Standartda bitta tirnoq `'...'` satrni, qo'shtirnoq `"..."` esa **identifikatorni** (jadval yoki ustun nomini) bildiradi.

**PostgreSQL** standartga amal qiladi. `"salom"` deb nomlangan ustun yo'q, shuning uchun xato beradi:

```sql
SELECT "salom";
```

```text
ERROR:  column "salom" does not exist
LINE 1: SELECT "salom";
               ^
```

**MySQL** qo'shtirnoqni satr deb tushunadi:

```text
+-------+
| salom |
+-------+
| salom |
+-------+
```

**SQLite** hujjati bu xususiyatni "misfeature", ya'ni "xato imkoniyat" deb ataydi. Qo'shtirnoqdagi so'z hech qanday nomga mos kelmasa, SQLite uni satr deb qabul qiladi. SQLite boshida MySQL 3.x bilan moslik uchun shunday qilingan. Hujjatda "orqaga qarab, bunday qilmasligimiz kerak edi" deb yozilgan.

Bu xususiyat kompilyatsiya paytida `SQLITE_DQS` parametri bilan boshqariladi. Hujjatga ko'ra:

- sukut bo'yicha qiymati `3`, ya'ni xususiyat yoqilgan. Bu eski ilovalar buzilmasligi uchun;
- tavsiya etilgan qiymati `0`, ya'ni o'chiq.

Rasmiy manba kodidan `./configure && make` bilan yig'ilgan `sqlite3` 3.54.0 aynan tavsiya etilgan `DQS=0` bilan chiqdi. Buni `PRAGMA compile_options` ko'rsatadi:

```text
SQLite-3.54 memory-> PRAGMA compile_options;
╭─────────────────────────────────╮
│         compile_options         │
╞═════════════════════════════════╡
…
│ DQS=0                           │
…
╰─────────────────────────────────╯
SQLite-3.54 memory-> SELECT "salom";
Parse error near line 2: no such column: "salom" - should this be a string literal in single-quotes?
  SELECT "salom";
         ^--- error here
```

Bu xususiyatni ulanish darajasida `.dbconfig` buyrug'i bilan yoqish mumkin. Yoqilganda SQLite qo'shtirnoqdagi so'zni satr deb qaytaradi:

```text
SQLite-3.54 memory-> .dbconfig dqs_dml on
            dqs_dml on
SQLite-3.54 memory-> SELECT "salom";
╭─────────╮
│ "salom" │
╞═════════╡
│ salom   │
╰─────────╯
```

Xulosa: SQLite qanday yig'ilganiga qarab bitta so'rov xato ham, satr ham qaytarishi mumkin. Ilovangizdagi SQLite kutubxonasi qanday yig'ilganini oldindan bilmaysiz.

**Qoida:** satrni doim **bitta tirnoq** bilan yozing. Shunda kodingiz uchala tizimda bir xil ishlaydi.

### 3. Ustun tipiga mos kelmaydigan qiymat

Butun son ustuniga matn yozib ko'ramiz:

```sql
CREATE TABLE sinov (n integer);
INSERT INTO sinov VALUES ('abc');
```

**PostgreSQL:**

```text
ERROR:  invalid input syntax for type integer: "abc"
```

**MySQL:**

```text
ERROR 1366 (HY000) at line 1: Incorrect integer value: 'abc' for column 'n' at row 1
```

**SQLite** qiymatni qabul qiladi:

```sql
SELECT n, typeof(n) FROM sinov;
```

```text
 n   typeof(n)
---  ---------
abc  text
```

SQLite hujjati buni **moslashuvchan tiplash** (*flexible typing*) deb ataydi: ustun tipi majburiy emas, maslahat xarakterida. Boshqa tizimlarni esa "qat'iy tiplangan" (*rigidly typed*) deydi. Bu mavzu va SQLite'dagi `STRICT` jadvallar 10-bobda ko'riladi.

### MySQL'da `sql_mode` — dialektni sozlash

MySQL'ning ko'p xatti-harakati **SQL rejimlari** (`sql_mode`) bilan boshqariladi. Rejimni butun server uchun ham, har bir ulanish uchun alohida ham o'rnatish mumkin. MySQL 9.7 dagi sukut bo'yicha qiymat:

```sql
SELECT @@sql_mode AS sql_mode;
```

```text
sql_mode: ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

Ulardan muhimlari:

- `STRICT_TRANS_TABLES` — **qat'iy rejim**. Noto'g'ri qiymat bo'lsa, MySQL ogohlantirish emas, xato beradi. Yuqoridagi `'abc'` xatosi shu rejim tufayli chiqdi. Qat'iy rejim o'chiq bo'lsa, MySQL qiymatni "moslab" yozib, faqat ogohlantirish beradi.
- `ONLY_FULL_GROUP_BY` — `GROUP BY` qoidalarini standartga yaqinlashtiradi (26-bob).

Hujjatda **`ANSI`** degan yig'ma rejim ham bor. U MySQL'ni standartga yaqinlashtiradi va boshqa rejimlarni o'z ichiga oladi:

- `PIPES_AS_CONCAT` — `||` satrlarni ulaydi;
- `ANSI_QUOTES` — `"..."` identifikator bo'ladi;
- va yana bir nechtasi.

Uni yoqsak, yuqoridagi ikki misol PostgreSQL'dagidek ishlaydi:

```sql
SET SESSION sql_mode = 'ANSI';
SELECT 'Salom, ' || 'dunyo' AS natija;
SELECT "salom";
```

```text
+--------------+
| natija       |
+--------------+
| Salom, dunyo |
+--------------+
ERROR 1054 (42S22) at line 1: Unknown column 'salom' in 'field list'
```

Muhim ogohlantirish: bitta SQL so'rov `sql_mode` ga qarab boshqa natija berishi mumkin. Hujjat partitsiyalangan jadvallar yaratilgandan keyin rejimni **hech qachon o'zgartirmaslikni** qat'iy tavsiya qiladi. Aks holda ma'lumot yo'qolishi yoki buzilishi mumkin.

Bu qo'llanmadagi MySQL misollari **sukut bo'yicha** rejimda ishga tushiriladi.

### Qisqacha jadval

| Narsa | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `'a' \|\| 'b'` | `ab` | `0` va ogohlantirish (`\|\|` = OR) | `ab` |
| `"..."` | Identifikator | Satr (`ANSI_QUOTES` bo'lmasa) | Identifikator; mos nom bo'lmasa — yig'ilishiga qarab xato yoki satr (`SQLITE_DQS`) |
| Butun son ustuniga `'abc'` | Xato | Xato (qat'iy rejimda) | Qabul qiladi, `text` sifatida saqlaydi |
| Xatti-harakatni sozlash | — | `sql_mode` | Kompilyatsiya parametrlari, `.dbconfig` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `ORDER BY` siz natijaning tartibiga tayanish | Tartib istalgan payt o'zgaradi: `UPDATE`dan keyin, versiya yangilanganda yoki reja boshqacha tuzilganda | Tartib kerak bo'lsa, doim `ORDER BY` yozish |
| "SQL hamma joyda bir xil" deb o'ylash | Bitta so'rov uch tizimda uch xil natija berishi mumkin (`\|\|` misoli) | Har tizimning hujjatidan dialekt farqlarini tekshirish |
| Satrni qo'shtirnoq bilan yozish (`"salom"`) | PostgreSQL'da xato; MySQL'da ishlaydi, lekin `ANSI_QUOTES` bilan buziladi; SQLite'da yig'ilishiga bog'liq (`SQLITE_DQS`) | Satr uchun doim bitta tirnoq: `'salom'` |
| MySQL'da `\|\|` bilan matn ulash | Sukut bo'yicha bu `OR`: natija `0` va faqat ogohlantirish chiqadi, xato emas | `CONCAT()` ishlatish yoki ataylab `PIPES_AS_CONCAT` ni yoqish |
| MySQL ogohlantirishlariga qaramaslik | Ma'lumot jimgina buzilishi mumkin | `SHOW WARNINGS`; qat'iy rejimni o'chirmaslik |
| SQLite'ga noto'g'ri tipdagi qiymat yozib "baza tekshiradi" deb o'ylash | SQLite qabul qilib yuboradi | `STRICT` jadvallar (10-bob) yoki ilovada tekshirish |
| "Bu tizim SQL:XXXX ga to'liq mos" degan gapga ishonish | Hujjatga ko'ra hech bir MBBT Core SQL:2023 ga to'liq moslikni da'vo qilmaydi | Aniq imkoniyatni tizim hujjatidan tekshirish |

## Amaliyot

1. O'z so'zlaringiz bilan tushuntiring: nima uchun relyatsiyani "jadval" deyish mumkin, lekin qatorlarni "birinchi, ikkinchi, uchinchi" deb bo'lmaydi?
2. `talabalar` jadvalidagi atamalarni ko'rsating: qaysi biri ustun, qaysi biri qator, qaysi biri birlamchi kalit? `id` ustuniga nega `NULL` yozib bo'lmaydi?
3. PostgreSQL'dagi "tartib" misolini o'zingiz takrorlang (o'rnatish — 3-bob). `UPDATE` ni boshqa qatorga qo'llab ko'ring: natija tartibi qanday o'zgaradi?
4. `information_schema.sql_features` dan `is_supported = 'NO'` bo'lgan bir nechta xususiyatni toping. Ularning nomini o'qib, nima ekanini taxmin qiling. Taxminingizni PostgreSQL hujjatining D.2 bo'limi bilan solishtiring.
5. MySQL'da `SELECT 'Salom, ' || 'dunyo';` ni avval sukut bo'yicha rejimda, keyin `SET SESSION sql_mode = 'ANSI';` dan keyin ishga tushiring. Ikkinchi holatda `SELECT @@sql_mode;` nima qaytaradi?
6. Uchala tizimda ham bir xil natija beradigan satr ulash usulini toping. Maslahat: SQLite'da ham `concat()` funksiyasi bor.

## Rasmiy hujjat

- PostgreSQL — 1. What Is PostgreSQL?: <https://www.postgresql.org/docs/18/intro-whatis.html>
- PostgreSQL — 2. A Brief History of PostgreSQL: <https://www.postgresql.org/docs/18/history.html>
- PostgreSQL — 2.2. Concepts: <https://www.postgresql.org/docs/18/tutorial-concepts.html>
- PostgreSQL — Appendix D. SQL Conformance: <https://www.postgresql.org/docs/18/features.html>
- PostgreSQL — Appendix M. Glossary: <https://www.postgresql.org/docs/18/glossary.html>
- PostgreSQL — `sql_features` jadvali: <https://www.postgresql.org/docs/18/infoschema-sql-features.html>
- MySQL — 1.2.1 What is MySQL?: <https://dev.mysql.com/doc/refman/9.7/en/what-is-mysql.html>
- MySQL — 1.7 MySQL Standards Compliance: <https://dev.mysql.com/doc/refman/9.7/en/compatibility.html>
- MySQL — 7.1.11 Server SQL Modes: <https://dev.mysql.com/doc/refman/9.7/en/sql-mode.html>
- SQLite — Quirks, Caveats, and Gotchas: <https://www.sqlite.org/quirks.html>
- SQLite — SQL Features That SQLite Does Not Implement: <https://www.sqlite.org/omitted.html>
- SQLite — Compile-time Options (`SQLITE_DQS`): <https://www.sqlite.org/compile.html>
- SQLite — `PRAGMA compile_options`: <https://www.sqlite.org/pragma.html#pragma_compile_options>
