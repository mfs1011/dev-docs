# 05 — Baza, sxema va jadval

[← Oldingi: SQL sintaksisi](04-sql-sintaksisi.md) · [Mundarija](README.md) · [Keyingi: Raqamlar →](06-raqamlar.md)

## Tushuncha

Jadval bazada "shunchaki" turmaydi. U obyektlar ierarxiyasining bir qismi. PostgreSQL hujjati to'liq ierarxiyani shunday beradi:

```text
klaster (bitta server)
├── rollar, bazalar ro'yxati, tablespace'lar   ← butun klasterga umumiy
└── baza
    └── sxema
        └── jadval (yoki funksiya, tip, view, indeks…)
```

Har bir darajani ko'rib chiqamiz.

### Baza (database)

**Baza** — nomlangan SQL obyektlari to'plami. Bitta klasterda ko'p baza bo'lishi mumkin. Ular bir-biridan **ajratilgan**, lekin klaster darajasidagi obyektlardan (masalan, rollardan) birgalikda foydalanadi.

PostgreSQL'ning eng muhim qoidasi: **bitta ulanish faqat bitta bazaga** kiradi. Ulanayotganda baza nomi ko'rsatiladi va shu ulanishda boshqa bazadagi jadvalni o'qib bo'lmaydi. Boshqa bazaga kerak bo'lsa, yangi ulanish ochiladi. Bundan tashqari `postgres_fdw` va `dblink` kengaytmalari bor, ular boshqa bazadagi obyektlarga vakil (*proxy*) yaratadi.

Hujjat bazalarni qachon ajratishni maslahat beradi:

- **bir-biriga aloqasi yo'q** loyihalar yoki foydalanuvchilar — **alohida bazalarga**;
- **bir-biri bilan bog'liq**, bir-birining resurslaridan foydalanadiganlar — **bitta bazaga**, lekin alohida **sxemalarga**.

Hujjat yana ogohlantiradi: foydalanuvchi uchun bazalar ajratilgan bo'lsa ham, administrator uchun ular bir-biriga **mahkam bog'langan**. Masalan, WAL jurnali hamma bazalarga umumiy. Bu zaxiralash va tiklash imkoniyatlariga ta'sir qiladi (66-bob).

### Shablon bazalar

`CREATE DATABASE` yangi bazani noldan qurmaydi, mavjud bazadan **nusxa oladi**. Sukut bo'yicha nusxa `template1` dan olinadi. Shuning uchun:

- `template1` ga qo'shilgan obyekt keyin yaratilgan **hamma** bazaga o'tadi. Hujjat buni ataylab qilmasangiz, `template1` da obyekt yaratmaslikni maslahat beradi;
- `template0` — PostgreSQL versiyasining "toza" boshlang'ich holati. U klaster yaratilgandan keyin **hech qachon o'zgartirilmasligi** kerak.

`template0` dan nusxa ikki holatda kerak bo'ladi:

1. `pg_dump` faylini tiklashda — toza baza kerak bo'lganda;
2. boshqa kodlash yoki locale bilan baza yaratishda. `template1` da shu sozlamalarga bog'liq ma'lumot bo'lishi mumkin, `template0` da esa yo'q.

Har qanday bazani shablon qilib ko'rsatish mumkin. Lekin hujjat ogohlantiradi: bu umumiy "bazani nusxalash" vositasi emas. Nusxa olinayotgan bazaga **boshqa hech kim ulanmagan** bo'lishi kerak.

### Sxema (schema)

**Sxema** — baza ichidagi **nomlar fazosi** (*namespace*). Unda jadvallar, ma'lumot tiplari, funksiyalar, operatorlar va boshqa nomlangan obyektlar turadi. Qoidalar:

- bitta sxemada bir turdagi ikki obyekt bir xil nomga ega bo'lolmaydi;
- jadval, sequence, indeks, view, materialized view va tashqi jadval **bitta** nomlar fazosida turadi. Shuning uchun bitta sxemada indeks va jadvalning nomi bir xil bo'lolmaydi;
- turli sxemalarda bir xil nom bemalol ishlatiladi: `ombor.mahsulot` va `savdo.mahsulot`.

Sxemalar bazalardan farqli o'laroq **qat'iy ajratilmagan**. Foydalanuvchi ulangan bazadagi istalgan sxemadagi obyektga, huquqi bo'lsa, murojaat qila oladi.

Hujjat sxemadan foydalanishning uch sababini aytadi:

- ko'p foydalanuvchi bitta bazada bir-biriga xalal bermasdan ishlashi;
- obyektlarni mantiqiy guruhlarga ajratish;
- tashqi ilovalarni alohida sxemaga qo'yib, nomlar to'qnashuvining oldini olish.

Sxemani operatsion tizimdagi **papka**ga o'xshatish mumkin. Faqat bitta farq bor: sxema ichida sxema bo'lmaydi.

**Malakali nom** (*qualified name*) — `sxema.jadval` ko'rinishidagi to'liq nom. Standart `baza.sxema.jadval` shaklini ham beradi. PostgreSQL buni faqat rasmiy moslik uchun qabul qiladi: baza nomi joriy bazaning nomi bilan bir xil bo'lishi shart.

### `public` sxemasi

Har yangi bazada `public` degan sxema bo'ladi. Sxema ko'rsatilmasa, jadval o'sha yerda yaratiladi:

```sql
CREATE TABLE products (…);
CREATE TABLE public.products (…);   -- xuddi shu
```

Hujjatga ko'ra `public` da hech qanday maxsuslik yo'q, u shunchaki sukut bo'yicha mavjud. Uni o'chirish ham mumkin.

### Qidiruv yo'li (`search_path`)

Har safar `sxema.jadval` deb yozish noqulay. Shuning uchun qisqa nom (`mahsulot`) ishlatilsa, PostgreSQL uni **qidiruv yo'li** (`search_path`) bo'yicha izlaydi. Bu tartib bilan ko'riladigan sxemalar ro'yxati:

- yo'ldagi **birinchi** mos obyekt olinadi;
- yo'lda topilmasa, boshqa sxemada shu nomli jadval bo'lsa ham, **xato** beriladi;
- yo'ldagi birinchi mavjud sxema **joriy sxema** deyiladi. Yangi jadvallar sxema ko'rsatilmasa, shu yerda yaratiladi.

Sukut bo'yicha qiymati `"$user", public`:

1. joriy foydalanuvchi nomi bilan atalgan sxema. U bo'lmasa, e'tiborsiz qoldiriladi;
2. `public`.

**`pg_catalog`.** Har bazada `pg_catalog` sxemasi bor. Unda tizim jadvallari, ichki tiplar, funksiyalar va operatorlar turadi. U `search_path` da yozilmagan bo'lsa ham **har doim birinchi** qidiriladi. Shuning uchun hujjat o'z jadvallaringizni `pg_` bilan boshlamaslikni tavsiya qiladi. `pg_` bilan boshlanadigan sxema nomlarini esa foydalanuvchi yarata olmaydi.

### `search_path` va xavfsizlik

Hujjatda muhim ogohlantirish bor. Qidiruv yo'liga sxema qo'shish **o'sha sxemada `CREATE` huquqi bor hamma foydalanuvchiga ishonish** degani.

Sababi shu: yovuz niyatli foydalanuvchi sizning yo'lingizdagi sxemada siz ishlatadigan nom bilan obyekt, masalan funksiya, yaratishi mumkin. Shunda sizning oddiy so'rovingiz **uning kodini sizning nomingizdan** bajaradi.

Shuning uchun PostgreSQL 15 dan boshlab `public` sxemasida hamma foydalanuvchiga `CREATE` huquqi **berilmaydi**. Eski versiyadan yangilangan bazalarda bu huquq qolgan bo'lishi mumkin. Hujjat uni olib tashlashni tavsiya qiladi:

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

Bu yerda birinchi `public` — sxema nomi (identifikator), ikkinchi `PUBLIC` — "hamma foydalanuvchi" ma'nosidagi kalit so'z. Shuning uchun ular har xil harfda yozilgan (4-bob).

### Standart va ko'chiriluvchanlik

Hujjat standart bilan farqlarni ham aytadi:

- standartda bitta sxemadagi obyektlar **turli foydalanuvchilarga tegishli** bo'lishi tushunchasi yo'q;
- ba'zi tizimlarda sxema va foydalanuvchi deyarli bir narsa: `foydalanuvchi.jadval`;
- standartda `public` sxemasi **yo'q**;
- ba'zi tizimlarda sxema umuman yo'q yoki uning o'rnini bazalararo murojaat bosadi.

Hujjatning xulosasi: maksimal ko'chiriluvchanlik uchun sxemalarni umuman ishlatmaslik kerak. Bu MySQL va SQLite'ga to'g'ridan-to'g'ri tegishli, quyida ko'ramiz.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Klasterdagi bazalar

`postgres` bazasiga ulanib:

```sql
SELECT datname, datistemplate, datallowconn FROM pg_database ORDER BY datname;
```

```text
  datname  | datistemplate | datallowconn 
-----------+---------------+--------------
 postgres  | f             | t
 qollanma  | f             | t
 template0 | t             | f
 template1 | t             | t
(4 rows)
```

Jadval ustunlari:

- `datistemplate` — baza shablon sifatida belgilanganmi;
- `datallowconn` — unga yangi ulanish mumkinmi. `template0` ga ulanib bo'lmaydi, uni tasodifan o'zgartirib qo'ymaslik uchun.

### Baza yaratish

```sql
CREATE DATABASE dokon;
```

```text
CREATE DATABASE
```

Bazani yaratgan rol uning **egasi** bo'ladi. Shell'dan xuddi shuni `createdb dokon` bilan qilish mumkin. Hujjatga ko'ra `createdb` "hech qanday sehr qilmaydi": `postgres` bazasiga ulanib, shu SQL buyrug'ini yuboradi.

`CREATE DATABASE` ni tranzaksiya ichida bajarib bo'lmaydi (tranzaksiyalar — 50-bob):

```sql
BEGIN;
CREATE DATABASE dokon2;
```

```text
ERROR:  CREATE DATABASE cannot run inside a transaction block
```

### Bitta ulanish — bitta baza

`dokon` bazasiga ulanib, `qollanma` bazasidagi jadvalni o'qishga urinamiz:

```sql
SELECT current_database();
SELECT * FROM qollanma.public.talabalar;
```

```text
 current_database 
------------------
 dokon
(1 row)

ERROR:  cross-database references are not implemented: "qollanma.public.talabalar"
LINE 1: SELECT * FROM qollanma.public.talabalar;
                      ^
```

### Shablondan nusxa: boshqa ulanish bo'lmasligi kerak

`dokon` bazasiga boshqa seans ulangan paytda undan nusxa olishga urinamiz:

```sql
CREATE DATABASE dokon_nusxa TEMPLATE dokon;
```

```text
ERROR:  source database "dokon" is being accessed by other users
DETAIL:  There is 1 other session using the database.
```

Sinovda server xato berishdan oldin **taxminan 5 soniya** kutdi. Shu vaqt ichida boshqa seans uzilganda nusxa muvaffaqiyatli yaratildi.

### Sxemalar va `search_path`

Yangi bazadagi sxemalar:

```sql
SHOW search_path;
SELECT current_schema();
SELECT nspname FROM pg_namespace
WHERE nspname NOT LIKE 'pg_toast%' AND nspname NOT LIKE 'pg_temp%'
ORDER BY nspname;
```

```text
   search_path   
-----------------
 "$user", public
(1 row)

 current_schema 
----------------
 public
(1 row)

      nspname       
--------------------
 information_schema
 pg_catalog
 public
(3 rows)
```

- `postgres` nomli sxema yo'q, shuning uchun `"$user"` o'tkazib yuborildi va joriy sxema `public` bo'ldi.
- `information_schema` — standartdagi metadata sxemasi (59-bob).

Ikki sxema yaratib, ikkalasida bir xil nomli jadval qo'yamiz:

```sql
CREATE SCHEMA ombor;
CREATE SCHEMA savdo;
CREATE TABLE ombor.mahsulot (id integer, nom text);
CREATE TABLE savdo.mahsulot (id integer, narx numeric);
INSERT INTO ombor.mahsulot VALUES (1, 'Non');
INSERT INTO savdo.mahsulot VALUES (1, 4000);
```

Qisqa nom bilan murojaat qilamiz:

```sql
SELECT * FROM mahsulot;
```

```text
ERROR:  relation "mahsulot" does not exist
LINE 1: SELECT * FROM mahsulot;
                      ^
```

Ikkita `mahsulot` jadvali bor, lekin hech biri qidiruv yo'lida emas. Yo'lni o'zgartiramiz:

```sql
SET search_path TO savdo, ombor;
SELECT * FROM mahsulot;
```

```text
 id | narx 
----+------
  1 | 4000
(1 row)
```

```sql
SET search_path TO ombor, savdo;
SELECT * FROM mahsulot;
```

```text
 id | nom 
----+-----
  1 | Non
(1 row)
```

**Bir xil** so'rov qidiruv yo'liga qarab **boshqa jadvalni** o'qidi. Xavfsizlik ogohlantirishi aynan shu xususiyatdan kelib chiqadi.

Sxemasiz yaratilgan jadval joriy sxemaga, ya'ni yo'ldagi birinchisiga tushadi:

```sql
CREATE TABLE yangi (x int);
SELECT schemaname, tablename FROM pg_tables
WHERE tablename IN ('mahsulot', 'yangi') ORDER BY 1, 2;
```

```text
 schemaname | tablename 
------------+-----------
 ombor      | mahsulot
 ombor      | yangi
 savdo      | mahsulot
(3 rows)
```

`SET` faqat joriy seansga ta'sir qiladi. Doimiy o'zgartirish uchun rol yoki baza darajasida sozlanadi (`ALTER ROLE … SET search_path …`). Bu 60-bobda ko'riladi.

### Sxemani o'chirish

```sql
DROP SCHEMA ombor;            -- faqat bo'sh bo'lsa
DROP SCHEMA ombor CASCADE;    -- ichidagi hamma obyekt bilan birga
```

`CASCADE` ning qanday ishlashi (bog'liqliklarni kuzatish) 16-bobda ko'riladi.

## Dialektlar

### MySQL: baza = sxema

MySQL'da sxema va baza **bir narsa**. Hujjat aniq yozadi: `CREATE SCHEMA` — `CREATE DATABASE` ning sinonimi. Ierarxiyada PostgreSQL'dagi "baza" darajasi yo'q:

```text
server
└── baza (= sxema)
    └── jadval
```

Bundan kelib chiqadigan farqlar:

- **Bitta ulanishda istalgan bazaga murojaat qilish mumkin**, huquq bo'lsa. PostgreSQL'dagi kabi taqiq yo'q;
- `baza.jadval` — PostgreSQL'dagi `sxema.jadval` ning aynan o'zi;
- baza diskda **papka** bo'lib yaratiladi. Jadvallar shu papkadagi fayllar (4-bobdagi katta-kichik harf muammosining sababi ham shu).

```sql
CREATE SCHEMA ombor;
CREATE DATABASE savdo;
SHOW DATABASES;
```

```text
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| ombor              |
| performance_schema |
| qollanma           |
| savdo              |
| sys                |
+--------------------+
```

`CREATE SCHEMA` bilan yaratilgan `ombor` ham `SHOW DATABASES` da chiqdi. Endi ikki bazadagi jadvallarni **bitta so'rovda** birlashtiramiz (JOIN — 25-bob):

```sql
CREATE TABLE ombor.mahsulot (id int, nom varchar(50));
CREATE TABLE savdo.mahsulot (id int, narx decimal(10,2));
INSERT INTO ombor.mahsulot VALUES (1, 'Non');
INSERT INTO savdo.mahsulot VALUES (1, 4000);
SELECT o.nom, s.narx FROM ombor.mahsulot o JOIN savdo.mahsulot s ON s.id = o.id;
```

```text
+------+---------+
| nom  | narx    |
+------+---------+
| Non  | 4000.00 |
+------+---------+
```

Ma'lumot papkasida ham bazalar alohida papka bo'lib turibdi:

```text
$ ls my97/ombor
mahsulot.ibd
```

**Sukut bo'yicha baza.** MySQL'da `search_path` yo'q, uning o'rnida **sukut bo'yicha baza** bor. U ulanishda beriladi yoki `USE baza;` bilan tanlanadi. Qisqa nom shu bazadan qidiriladi. Baza tanlanmagan bo'lsa:

```sql
SELECT DATABASE();
CREATE TABLE t1 (i int);
```

```text
+------------+
| DATABASE() |
+------------+
| NULL       |
+------------+
ERROR 1046 (3D000) at line 1: No database selected
```

### SQLite: fayl = baza, `ATTACH`

SQLite'da baza — bitta **fayl**. Sxema tushunchasi boshqacha: bitta ulanishga bir nechta faylni **ulash** (`ATTACH`) mumkin. Har ulangan fayl o'z nomi bilan "sxema" bo'ladi.

Ikkita alohida nom doim mavjud:

- `main` — ulanishda ochilgan asosiy fayl;
- `temp` — vaqtinchalik jadvallar uchun baza.

Ularni `ATTACH` yoki `DETACH` qilib bo'lmaydi.

```sql
-- ombor.db ochilgan
ATTACH DATABASE 'savdo.db' AS savdo;
PRAGMA database_list;
SELECT o.nom, s.narx FROM main.mahsulot o JOIN savdo.mahsulot s ON s.id = o.id;
```

```text
seq  name                          file
---  -----  --------------------------------------------------
  0  main   /Users/mfsv/Projects/experiment/sql-sinov/ombor.db
  2  savdo  /Users/mfsv/Projects/experiment/sql-sinov/savdo.db
nom  narx
---  ----
Non  4000
```

`sxema.jadval` sintaksisi bu yerda `fayl_nomi.jadval` ma'nosini beradi. Hujjatdagi boshqa qoidalar:

- jadval nomi barcha ulangan bazalarda yagona bo'lsa, prefiks shart emas;
- bir xil nom bir nechta bazada bo'lsa va prefiks yozilmasa, **eng oldin ulangan** bazadagisi olinadi;
- bir nechta faylni o'zgartiradigan tranzaksiya atomar, faqat asosiy baza `:memory:` bo'lmasa va WAL rejimi ishlatilmasa. Aks holda kompyuter `COMMIT` paytida o'chib qolsa, fayllarning ba'zilari o'zgarib, ba'zilari o'zgarmay qolishi mumkin;
- ulanadigan fayllar soni `SQLITE_LIMIT_ATTACHED` bilan cheklangan.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Ierarxiya | klaster → baza → sxema → jadval | server → baza (= sxema) → jadval | ulanish → ulangan fayllar (`main`, `temp`, …) → jadval |
| `CREATE SCHEMA` | Baza ichida nomlar fazosi | `CREATE DATABASE` ning sinonimi | Yo'q, o'rniga `ATTACH` |
| Bitta ulanishda boshqa bazaga murojaat | Yo'q (`postgres_fdw`, `dblink` orqali) | Ha: `baza.jadval` | Ha, `ATTACH` qilingan fayllarga |
| Qisqa nomni qidirish | `search_path` | Sukut bo'yicha baza (`USE`) | Ulangan bazalar, eng oldin ulangani birinchi |
| Sukut bo'yicha joy | `public` sxemasi | Tanlangan baza; tanlanmagan bo'lsa — xato | `main` |
| Yangi baza qanday yaratiladi | Shablondan nusxa (`template1`) | Diskda papka | Fayl |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| PostgreSQL'da har modul uchun alohida baza ochib, keyin ular orasida JOIN qilmoqchi bo'lish | Bitta ulanish bitta bazaga kiradi, bazalararo so'rov yo'q | Bog'liq qismlarni bitta bazada, alohida sxemalarda saqlash |
| MySQL'dan kelib, PostgreSQL'da "baza" so'zini MySQL ma'nosida ishlatish | MySQL bazasi PostgreSQL'da sxemaga to'g'ri keladi | MySQL'dagi `baza.jadval` → PostgreSQL'da `sxema.jadval` |
| `template1` ga sinov uchun jadval qo'shib qo'yish | Keyingi har yangi bazaga o'tadi | `template1` ni toza saqlash |
| Dump'ni `template1` dan yaratilgan bazaga tiklash | `template1` dagi qo'shimcha obyektlar dump bilan to'qnashadi | `CREATE DATABASE … TEMPLATE template0` |
| `search_path` ga boshqalar yoza oladigan sxemani qo'shish | Boshqa foydalanuvchi sizning so'rovlaringiz bajaradigan obyektni yaratishi mumkin | Ishonchli sxemalargina; `public` da `CREATE` huquqini olib tashlash |
| Ilova kodida `search_path` ga tayanib, uni hech qayerda belgilamaslik | Boshqa muhitda bir xil so'rov boshqa jadvalni o'qishi mumkin | Muhim joylarda malakali nom (`sxema.jadval`) yoki `search_path` ni aniq belgilash |
| O'z jadvallarini `pg_` bilan nomlash | Kelajakdagi tizim jadvali bilan to'qnashishi mumkin; `pg_catalog` birinchi qidiriladi | `pg_` prefiksidan qochish |
| MySQL'da `USE` qilmasdan qisqa nom ishlatish | `No database selected` | Ulanishda bazani ko'rsatish yoki `baza.jadval` |
| SQLite'da `ATTACH` qilingan fayllarni WAL rejimida yozib, ular birga saqlanadi deb o'ylash | Ishdan chiqishda fayllar bir-biriga mos kelmay qolishi mumkin | Hujjatdagi atomarlik shartlarini hisobga olish |

## Amaliyot

1. PostgreSQL'da `CREATE DATABASE mashq;` qiling. `\l` bilan egasi kimligini ko'ring. Keyin `createdb mashq2` buyrug'ini sinang.
2. `template1` ga ulanib `CREATE TABLE shablon_test (x int);` qiling. Yangi `mashq3` bazasini yaratib, unda jadval borligini tekshiring. Oxirida jadvalni `template1` dan o'chiring.
3. `TEMPLATE template0 ENCODING 'LATIN1' LOCALE 'C'` bilan baza yarating. Xuddi shuni `template1` bilan sinab, xato xabarini o'qing.
4. Bitta bazada `hr` va `moliya` sxemalarini yarating, ikkalasida `xodim` jadvalini oching. `search_path` ni o'zgartirib, `SELECT * FROM xodim` qaysi jadvalni o'qishini kuzating.
5. `SHOW search_path;` va `SELECT current_schemas(true);` natijalarini solishtiring. Ikkinchisida `pg_catalog` paydo bo'lishini tushuntiring.
6. MySQL'da ikki baza yarating va ularning jadvallarini bitta `SELECT` da birlashtiring. Xuddi shuni PostgreSQL'da ikki bazada qilib ko'ring. Qanday xato chiqadi?
7. SQLite'da ikki faylni `ATTACH` qilib, ikkalasida bir xil nomli jadval yarating. Prefikssiz `SELECT` qaysi jadvalni o'qiydi?

## Rasmiy hujjat

- PostgreSQL — 22.1. Overview (bazalar): <https://www.postgresql.org/docs/18/manage-ag-overview.html>
- PostgreSQL — 22.2. Creating a Database: <https://www.postgresql.org/docs/18/manage-ag-createdb.html>
- PostgreSQL — 22.3. Template Databases: <https://www.postgresql.org/docs/18/manage-ag-templatedbs.html>
- PostgreSQL — CREATE DATABASE: <https://www.postgresql.org/docs/18/sql-createdatabase.html>
- PostgreSQL — 5.10. Schemas: <https://www.postgresql.org/docs/18/ddl-schemas.html>
- PostgreSQL — CREATE SCHEMA: <https://www.postgresql.org/docs/18/sql-createschema.html>
- MySQL — 15.1.14 CREATE DATABASE Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-database.html>
- MySQL — 11.2.2 Identifier Qualifiers: <https://dev.mysql.com/doc/refman/9.7/en/identifier-qualifiers.html>
- SQLite — ATTACH DATABASE: <https://www.sqlite.org/lang_attach.html>
