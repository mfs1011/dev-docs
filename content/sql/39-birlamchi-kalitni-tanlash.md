# 39 — Birlamchi kalitni tanlash

[← Oldingi: Normalizatsiya va tuzilma](38-normalizatsiya-va-tuzilma.md) · [Mundarija](README.md) · [Keyingi: Vaqt, tarix va audit →](40-vaqt-tarix-va-audit.md)

## Tushuncha

Birlamchi kalit (primary key) — qatorning yagona, `NULL` bo'lmagan identifikatori (14-bob). Uni yaratish usullari 13-bobda (identity, sequence, `AUTO_INCREMENT`), UUID tipi 9-bobda ko'rildi. Bu bob — **tanlov**: qaysi kalit qachon, va u saqlash tuzilishiga qanday ta'sir qiladi.

### Ikki xil kalit

- **Tabiiy kalit** (natural key) — ma'lumotning o'zidagi noyob qiymat: email, pasport raqami, mamlakat kodi `UZ`.
- **Sun'iy kalit** (surrogate key) — faqat identifikatsiya uchun qo'shilgan qiymat: avtomatik oshadigan son yoki UUID.

MySQL hujjati (InnoDB klasterli indeks bo'limi) amaliy tavsiya beradi: har jadvalda birlamchi kalit bo'lsin; mantiqan noyob va `NULL` bo'lmagan ustun (yoki ustunlar to'plami) bo'lmasa — **avtomatik oshadigan ustun** qo'shing.

### Son yoki UUID

| | Avtomatik oshadigan son | UUID v4 | UUID v7 |
| --- | --- | --- | --- |
| Hajmi | 4 bayt (`int`) yoki 8 bayt (`bigint`) | 16 bayt | 16 bayt |
| Tartibi | O'sib boradi | **Tasodifiy** | Vaqt bo'yicha o'sib boradi |
| Kim yaratadi | Baza (bitta manba) | Istalgan joyda (ilova, boshqa server) | Istalgan joyda |
| Qiymatdan nima bilinadi | Qatorlar soni, tartib | Hech narsa | Yaratilgan vaqt |

PostgreSQL hujjatiga ko'ra `uuidv7()` vaqt bo'yicha tartiblangan UUID yaratadi: Unix vaqti (millisekund aniqlikda) + millisekunddan kichik qism + tasodifiy qism. `uuidv4()` (= `gen_random_uuid()`) — tasodifiy. `uuid_extract_timestamp()` 1- va 7-versiya UUID'dan vaqtni ajratib oladi — demak v7 kalit **yaratilgan vaqtni oshkor qiladi**. Buni ochiq API'da ko'rsatishda hisobga olish kerak.

### InnoDB: klasterli indeks

Bu — kalit tanlovi eng ko'p ta'sir qiladigan joy. MySQL hujjatiga ko'ra:

- har InnoDB jadvalida qator ma'lumotini saqlaydigan maxsus indeks bor — **klasterli indeks** (clustered index). Odatda bu birlamchi kalitning o'zi. Ya'ni jadval **birlamchi kalit tartibida** saqlanadi;
- birlamchi kalit bo'lmasa — barcha ustunlari `NOT NULL` bo'lgan birinchi `UNIQUE` indeks; u ham bo'lmasa — InnoDB yashirin `GEN_CLUST_INDEX` yaratadi (6 baytli, o'sib boradigan qator ID);
- klasterli indeks orqali qatorga kirish tez: indeks qidiruvi to'g'ridan-to'g'ri qator ma'lumoti turgan sahifaga olib boradi;
- **ikkilamchi indekslar** (secondary indexes) — qolgan barcha indekslar. Ularning har yozuvida indekslangan ustunlar **va birlamchi kalit ustunlari** saqlanadi. InnoDB qatorni topish uchun shu birlamchi kalit bo'yicha klasterli indeksda qidiradi.

Hujjatning xulosasi: **birlamchi kalit uzun bo'lsa, ikkilamchi indekslar ko'proq joy egallaydi — shuning uchun qisqa birlamchi kalit foydali.** `char(36)` UUID kalit har ikkilamchi indeksning har yozuviga 36 bayt qo'shadi.

MySQL'da UUID uchun `UUID_TO_BIN()` (9-bob) uni 16 baytli `BINARY(16)` ga aylantiradi; ikkinchi argument `1` 1-versiya UUID'ning vaqt qismlarini o'sish tartibiga keltiradi.

### PostgreSQL: jadval kalit bo'yicha saqlanmaydi

PostgreSQL'da birlamchi kalit — oddiy (alohida) B-tree indeks; jadval qatorlari unga qarab tartiblanmaydi. `CLUSTER` buyrug'i jadvalni indeks bo'yicha qayta tartiblaydi, lekin hujjatga ko'ra bu **bir martalik amal**: keyingi yangilanishlar va yangi qatorlar indeks tartibida saqlanmaydi. InnoDB'ning klasterli indeks qoidalari (ikkilamchi indeksda PK nusxasi) MySQL hujjatiga tegishli; PostgreSQL'da esa kalit indeksining o'z hajmi kalit uzunligiga va tartibiga bog'liqligi quyida o'lchangan.

### SQLite: `rowid` va `WITHOUT ROWID`

12-13-boblarda ko'rilganidek, oddiy SQLite jadvali — **rowid jadvali**: qatorlar 64 bitlik `rowid` bo'yicha B-tree'da saqlanadi, `INTEGER PRIMARY KEY` esa `rowid` ning boshqa nomi.

SQLite hujjatiga ko'ra `CREATE TABLE` oxiriga `WITHOUT ROWID` qo'shilsa, `rowid` bo'lmaydi va jadval **birlamchi kalitni klasterli indeks** sifatida ishlatadi (InnoDB'ga o'xshab). Hujjat ta'kidlaydi:

- bu faqat **optimizatsiya**, yangi imkoniyat bermaydi; ba'zan kamroq joy va biroz tezroq;
- `PRIMARY KEY` majburiy; `AUTOINCREMENT` ishlamaydi; `INTEGER PRIMARY KEY` `rowid` nomi bo'lib qolmaydi — oddiy butun sonli kalit;
- birlamchi kalitning har ustunida `NOT NULL` tekshiriladi (oddiy jadvaldagi tarixiy xato bu yerda yo'q, 14-bob);
- **qachon foydali:** birlamchi kaliti butun son bo'lmagan yoki ko'p ustunli, va katta satr/BLOB saqlamaydigan jadvallar. Bitta `INTEGER PRIMARY KEY` li jadvalga — **yo'q**, oddiy rowid jadval tezroq;
- qator o'rtacha sahifa hajmining taxminan 1/20 qismidan kichik bo'lsin (4 KiB sahifada ~200 bayt);
- hujjatning maslahati: ishlab chiqish oxirigacha `WITHOUT ROWID` haqida qayg'urmang, keyin sinab ko'ring.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. O'lchovlar macOS'dagi sinov muhitida, har jadvalga 200 000 qator.

### PostgreSQL: kalit indeksi hajmi

```sql
CREATE TABLE k_bigint (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, x int);
CREATE TABLE k_v4     (id uuid DEFAULT uuidv4() PRIMARY KEY, x int);
CREATE TABLE k_v7     (id uuid DEFAULT uuidv7() PRIMARY KEY, x int);

INSERT INTO k_bigint (x) SELECT g FROM generate_series(1, 200000) g;
INSERT INTO k_v4     (x) SELECT g FROM generate_series(1, 200000) g;
INSERT INTO k_v7     (x) SELECT g FROM generate_series(1, 200000) g;

SELECT relname, pg_size_pretty(pg_relation_size(relname::regclass)) AS indeks
FROM (VALUES ('k_bigint_pkey'), ('k_v4_pkey'), ('k_v7_pkey')) v(relname);
SELECT pg_column_size(1::bigint) AS bigint_bayt, pg_column_size(uuidv7()) AS uuid_bayt;
```

```text
    relname    | indeks  
---------------+---------
 k_bigint_pkey | 4408 kB
 k_v4_pkey     | 8584 kB
 k_v7_pkey     | 6184 kB
(3 rows)

 bigint_bayt | uuid_bayt 
-------------+-----------
           8 |        16
(1 row)
```

Qator soni bir xil, kalit tipi boshqa:

- `bigint` — eng kichik indeks;
- `uuid` ikki baravar uzun, shuning uchun v7 indeksi kattaroq;
- v4 va v7 — **bir xil** 16 bayt, lekin v4 indeksi v7 nikidan ~39% katta. Farq faqat **tartibda**: v7 qiymatlari o'sib boradi va har yangi kalit indeks oxiriga qo'shiladi; v4 qiymatlari tasodifiy va indeksning turli joylariga tushadi. (Bu kuzatilgan natija; B-tree ichki tuzilishi 41-bobda.)

### MySQL: klasterli indeks va ikkilamchi indeks

Uch jadval, har birida `x` ustunida **ikkilamchi** indeks:

```sql
SET SESSION cte_max_recursion_depth = 300000;
CREATE TABLE k_int  (id int AUTO_INCREMENT PRIMARY KEY, x int, KEY (x));
CREATE TABLE k_char (id char(36)   PRIMARY KEY, x int, KEY (x));
CREATE TABLE k_bin  (id binary(16) PRIMARY KEY, x int, KEY (x));

INSERT INTO k_int (x)
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 200000) SELECT n FROM g;
INSERT INTO k_char
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 200000) SELECT UUID(), n FROM g;
INSERT INTO k_bin
  WITH RECURSIVE g(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM g WHERE n < 200000) SELECT UUID_TO_BIN(UUID(), 1), n FROM g;

ANALYZE TABLE k_int, k_char, k_bin;
SELECT table_name, ROUND(data_length/1024/1024,1) AS data_mb,
       ROUND(index_length/1024/1024,1) AS ikkilamchi_mb
FROM information_schema.tables
WHERE table_schema = DATABASE() AND table_name IN ('k_int','k_char','k_bin')
ORDER BY data_length;
```

```text
+------------+---------+---------------+
| TABLE_NAME | data_mb | ikkilamchi_mb |
+------------+---------+---------------+
| k_int      |     6.5 |           3.5 |
| k_bin      |     8.5 |           5.5 |
| k_char     |    12.6 |           9.6 |
+------------+---------+---------------+
```

MySQL hujjatiga (`INFORMATION_SCHEMA.TABLES`) ko'ra InnoDB'da `DATA_LENGTH` — klasterli indeks (ya'ni jadvalning o'zi) hajmi, `INDEX_LENGTH` — klasterli bo'lmagan (ikkilamchi) indekslar yig'indisi. Ko'ring:

- `x` indeksi uchala jadvalda **bir xil ustunni** indekslaydi, lekin hajmi 3.5 → 5.5 → 9.6 MB. Hujjatda aytilganidek — ikkilamchi indeksning har yozuvida birlamchi kalit nusxasi bor;
- `char(36)` UUID (utf8mb4 matn) — eng katta; xuddi shu UUID `BINARY(16)` da ~40% kichik ikkilamchi indeks berdi;
- jadvaldagi har yangi ikkilamchi indeks shu farqni yana takrorlaydi.

### SQLite: `WITHOUT ROWID`

Hujjatdagi `wordcount` misoli va oddiy jadval bilan solishtirish:

```sql
CREATE TABLE wordcount (word TEXT PRIMARY KEY, cnt INTEGER) WITHOUT ROWID;
INSERT INTO wordcount VALUES ('salom', 3), ('dunyo', 1);
SELECT rowid, word FROM wordcount;

CREATE TABLE oddiy (word TEXT PRIMARY KEY, cnt INTEGER);
INSERT INTO oddiy VALUES ('salom', 3);
SELECT rowid, word FROM oddiy;
```

```text
Parse error near line 3: no such column: rowid
rowid  word
-----  -----
    1  salom
```

`WITHOUT ROWID` jadvalda `rowid` yo'q — qator `word` bo'yicha saqlanadi. Oddiy jadvalda esa ikkita tuzilma: `rowid` bo'yicha jadval va `word` uchun alohida unique indeks.

Hujjatdagi cheklovlar:

```sql
CREATE TABLE xpk (a INTEGER) WITHOUT ROWID;
CREATE TABLE xai (id INTEGER PRIMARY KEY AUTOINCREMENT, a) WITHOUT ROWID;
CREATE TABLE wi (id INTEGER PRIMARY KEY, a) WITHOUT ROWID;
INSERT INTO wi (a) VALUES ('x');
```

```text
Parse error near line 7: PRIMARY KEY missing on table xpk
Parse error near line 8: AUTOINCREMENT not allowed on WITHOUT ROWID tables
Error near line 10: NOT NULL constraint failed: wi.id
```

Oxirgisi muhim: oddiy jadvalda `INTEGER PRIMARY KEY` ga qiymat berilmasa, u avtomatik to'ldiriladi (`rowid` nomi). `WITHOUT ROWID` da bu yo'q — `id` oddiy butun sonli kalit, `NULL` bo'lishi mumkin emas va o'zi to'lmaydi. Taqqoslash uchun oddiy jadval:

```sql
CREATE TABLE ri (id INTEGER PRIMARY KEY, a);
INSERT INTO ri (a) VALUES ('x');
SELECT id, rowid FROM ri;
```

```text
id  id
--  --
 1   1
```

`rowid` ustuni sarlavhada ham `id` deb chiqdi — ular bitta ustun.

`WITHOUT ROWID` da `NOT NULL` birlamchi kalitning har ustunida tekshiriladi:

```sql
CREATE TABLE np (k TEXT PRIMARY KEY, x) WITHOUT ROWID;
INSERT INTO np VALUES (NULL, 1);
```

```text
Error near line 15: NOT NULL constraint failed: np.k
```

14-bobda oddiy jadvalga xuddi shunday `NULL` kalitli qator yozilgan edi.

## Dialektlar

Bu bobning o'zi dialektlar haqida — xulosa jadvalda.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Jadval kalit tartibida saqlanadimi | Yo'q (`CLUSTER` — bir martalik) | **Ha** — klasterli indeks | Oddiy: `rowid` bo'yicha; `WITHOUT ROWID`: PK bo'yicha |
| PK bo'lmasa | Kalitsiz jadval | Birinchi `NOT NULL` `UNIQUE` yoki yashirin `GEN_CLUST_INDEX` | `rowid` |
| Uzun PK narxi | PK indeksi kattalashadi | PK + **har ikkilamchi indeks** kattalashadi | `WITHOUT ROWID` da PK + ikkilamchi indekslar |
| UUID tipi | `uuid` (16 bayt), `uuidv4()`, `uuidv7()` | Tip yo'q: `BINARY(16)` + `UUID_TO_BIN` (`UUID()` — 1-versiya) | Tip yo'q: `blob`/`text` |
| Avtomatik son | `GENERATED … AS IDENTITY` | `AUTO_INCREMENT` | `INTEGER PRIMARY KEY` |

### Tanlov bo'yicha amaliy xulosa

Hujjatlardagi faktlar asosida:

- **Standart tanlov** — avtomatik oshadigan son (`bigint` identity / `AUTO_INCREMENT` / `INTEGER PRIMARY KEY`): eng qisqa, tartibli. MySQL hujjati ham shuni tavsiya qiladi.
- **UUID kerak bo'lsa** (kalit bazadan tashqarida yaratiladi, bir nechta manbani birlashtirish, ID'ni taxmin qilib bo'lmasligi kerak) — **v7**: tartibli, indeks v4 dan kichik. Lekin u yaratilgan vaqtni oshkor qiladi.
- **MySQL'da UUID** — `char(36)` emas, `BINARY(16)`: har ikkilamchi indeks shunga ko'payadi.
- **Tabiiy kalit** — faqat haqiqatan o'zgarmaydigan va noyob qiymat bo'lsa (mamlakat kodi). Email, telefon o'zgaradi — ular `UNIQUE` ustun bo'lsin, kalit emas: kalit o'zgarsa, unga murojaat qilgan barcha tashqi kalitlar ham o'zgarishi kerak (37-bob, `ON UPDATE`).
- **Oraliq jadval** (37-bob) — tabiiy kompozit kalit `(a_id, b_id)` odatda yetarli; SQLite'da bunday jadval `WITHOUT ROWID` uchun hujjatdagi tipik nomzod (kompozit, kichik qatorlar).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| MySQL'da `char(36)` UUID birlamchi kalit | Har ikkilamchi indeks ~2.7 baravar katta (o'lchovda 9.6 va 3.5 MB) | `BIGINT AUTO_INCREMENT` yoki `BINARY(16)` |
| Katta jadvalda tasodifiy UUID v4 kalit | Indeks kattaroq (o'lchovda v7 dan ~39%) | `uuidv7()` yoki son |
| InnoDB jadvalini birlamchi kalitsiz yaratish | Yashirin `GEN_CLUST_INDEX`; uni so'rovda ishlatib bo'lmaydi | Doim `PRIMARY KEY` |
| O'zgaradigan qiymatni (email) birlamchi kalit qilish | O'zgarganda barcha bog'liq jadvallar yangilanadi | Sun'iy kalit + `UNIQUE (email)` |
| UUID v7 ni ochiq URL'da "maxfiy" deb ishlatish | `uuid_extract_timestamp` yaratilgan vaqtni beradi | v4 yoki alohida ochiq identifikator |
| SQLite'da `INTEGER PRIMARY KEY … WITHOUT ROWID` | Hujjat: oddiy jadval tezroq; avtomatik to'ldirish yo'q | `WITHOUT ROWID` siz |
| SQLite'da katta qatorli jadvalni `WITHOUT ROWID` qilish | Hujjat: katta qatorlarda sekinroq | Qator ~1/20 sahifadan kichik bo'lsin |

## Amaliyot

1. PostgreSQL'da `k_v4` va `k_v7` jadvallariga `x` ustuni bo'yicha ikkilamchi indeks qo'shing va uning hajmini solishtiring. Natija InnoDB'dagidan nega boshqacha?
2. MySQL'da `k_bin` jadvaliga `UUID_TO_BIN(UUID())` (ikkinchi argumentsiz) bilan yozilgan variantni qo'shib, hajmlarni solishtiring.
3. `SELECT uuid_extract_timestamp(uuidv7());` ni bajaring. Qaysi ma'lumot oshkor bo'ladi?
4. SQLite'da 37-bobdagi `order_items` oraliq jadvalini `WITHOUT ROWID` bilan va usiz yarating. `sqlite3_analyzer` yoki fayl hajmi bilan solishtiring.
5. Quyidagilar uchun birlamchi kalitni tanlang va asoslang: (a) mamlakatlar ro'yxati, (b) foydalanuvchilar (ID mobil ilovada oflayn yaratiladi), (c) loglar jadvali (sekundiga minglab qator), (d) talaba–kurs oraliq jadvali.

## Rasmiy hujjat

- PostgreSQL — 9.14. UUID Functions (`uuidv4`, `uuidv7`, `uuid_extract_timestamp`): <https://www.postgresql.org/docs/18/functions-uuid.html>
- PostgreSQL — CLUSTER: <https://www.postgresql.org/docs/18/sql-cluster.html>
- MySQL — 17.6.2.1 Clustered and Secondary Indexes: <https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html>
- MySQL — 14.25 Miscellaneous Functions (`UUID`, `UUID_TO_BIN`): <https://dev.mysql.com/doc/refman/9.7/en/miscellaneous-functions.html>
- MySQL — 28.3.44 The INFORMATION_SCHEMA TABLES Table (`DATA_LENGTH`, `INDEX_LENGTH`): <https://dev.mysql.com/doc/refman/9.7/en/information-schema-tables-table.html>
- SQLite — Clustered Indexes and the WITHOUT ROWID Optimization: <https://www.sqlite.org/withoutrowid.html>
