# 09 — Boolean, UUID va enum

[← Oldingi: Sana va vaqt](08-sana-va-vaqt.md) · [Mundarija](README.md) · [Keyingi: NULL va tip konversiyasi →](10-null-va-tip-konversiyasi.md)

## Tushuncha

Bu bobda uchta kichik, lekin har kuni ishlatiladigan tip ko'riladi:

- **boolean** — ha yoki yo'q: "to'langanmi", "faolmi";
- **UUID** — hamma joyda takrorlanmas 128 bitlik identifikator;
- **enum** — oldindan belgilangan qiymatlardan biri: "yangi", "jarayonda", "yopildi".

### Boolean

SQL standartida `boolean` tipi bor. PostgreSQL hujjatiga ko'ra uning **uch** holati bo'ladi:

- `TRUE` — rost;
- `FALSE` — yolg'on;
- **noma'lum** — `NULL` bilan ifodalanadi.

Bu uch qiymatli mantiqning o'zi (10-bob).

PostgreSQL `boolean` 1 bayt oladi. Kiritishda bir nechta yozuvni qabul qiladi:

| Rost | Yolg'on |
| --- | --- |
| `true`, `yes`, `on`, `1` | `false`, `no`, `off`, `0` |

Bularning yagona boshlang'ich harflari ham qabul qilinadi (`t`, `n`). Katta-kichik harf va chetidagi bo'sh joy ahamiyatsiz. Chiqishda doim `t` yoki `f`.

Hujjatning tavsiyasi: SQL'da `TRUE` va `FALSE` **kalit so'zlarini** yozing. Bu standartga mos usul.

### UUID

**UUID** (*Universally Unique Identifier*) — 128 bitlik identifikator. U shunday algoritm bilan yaratiladiki, xuddi shu qiymatni "ma'lum olamdagi" boshqa birov yaratishi ehtimoli juda kichik. Ba'zi tizimlarda uni **GUID** deyishadi.

Hujjat uni sequence bilan solishtiradi: sequence faqat **bitta baza ichida** takrorlanmas. UUID esa taqsimlangan tizimlarda ham yagonaligini yaxshiroq kafolatlaydi. Masalan, ilova yozuvni bazaga yubormasdan oldin ID yaratishi kerak bo'lganda.

UUID standart ko'rinishda 32 ta o'n oltilik raqam bo'lib yoziladi va chiziqchalar bilan 8-4-4-4-12 guruhlarga ajratiladi:

```text
a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
```

RFC 9562 da UUID'ning **8 ta versiyasi** bor. Ikkitasi muhim:

| Versiya | Qanday yaratiladi | PostgreSQL funksiyasi |
| --- | --- | --- |
| **v4** | Tasodifiy | `uuidv4()`, `gen_random_uuid()` |
| **v7** | Vaqt bo'yicha tartiblangan: Unix vaqti (millisekund) + qo'shimcha aniqlik + tasodifiy qism | `uuidv7()` (PostgreSQL 18 dan) |

`uuid` tipiga qaysi algoritmda yaratilgan bo'lishidan qat'i nazar istalgan UUID'ni yozish mumkin. `uuid_extract_version()` versiyani, `uuid_extract_timestamp()` esa v1 va v7 dan vaqtni ajratib beradi.

UUID'ni birlamchi kalit qilish va uning indeksga ta'siri 39-bobda ko'riladi.

### Enum

**Enum** (*enumerated type*) — o'zgarmas, **tartiblangan** qiymatlar to'plamidan iborat tip. Dasturlash tillaridagi enum'larga o'xshaydi. PostgreSQL'da enum avval alohida tip sifatida yaratiladi, keyin ustunlarda ishlatiladi:

```sql
CREATE TYPE holat AS ENUM ('yangi', 'jarayonda', 'yopildi');
```

PostgreSQL hujjatidagi qoidalar:

- **Tartib.** Qiymatlar tip yaratilganda yozilgan tartibda keladi. `<`, `>`, `min()`, `max()` shu tartib bo'yicha ishlaydi;
- **Tip xavfsizligi.** Har enum alohida tip. Ikki xil enum'ni bir-biri bilan solishtirib bo'lmaydi;
- **Katta-kichik harf.** Yorliqlar sezgir: `'yangi'` ≠ `'Yangi'`. Bo'sh joy ham ahamiyatli;
- **O'zgartirish.** Yangi qiymat qo'shish va qiymat nomini o'zgartirish mumkin (`ALTER TYPE`). Lekin qiymatni **o'chirish** yoki tartibini o'zgartirish faqat tipni o'chirib qayta yaratish bilan mumkin;
- **Hajm.** Bitta qiymat diskda 4 bayt oladi. Yorliq 63 baytgacha.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Boolean

```sql
CREATE TABLE vazifalar (nom text, bajarildi boolean);
INSERT INTO vazifalar VALUES ('xat', TRUE), ('qongiroq', 'no'), ('hisobot', 'on'), ('sinov', NULL);
INSERT INTO vazifalar VALUES ('xato', 2);
SELECT * FROM vazifalar;
```

```text
INSERT 0 4
ERROR:  column "bajarildi" is of type boolean but expression is of type integer
HINT:  You will need to rewrite or cast the expression.
   nom    | bajarildi 
----------+-----------
 xat      | t
 qongiroq | f
 hisobot  | t
 sinov    | 
(4 rows)
```

`'no'` va `'on'` matnlari boolean'ga aylandi. `2` soni esa rad etildi: PostgreSQL butun sonni boolean'ga o'zi o'girmaydi.

`WHERE` ga boolean ustunni to'g'ridan-to'g'ri yozish mumkin:

```sql
SELECT nom FROM vazifalar WHERE bajarildi;
SELECT nom FROM vazifalar WHERE NOT bajarildi;
```

```text
   nom   
---------
 xat
 hisobot
(2 rows)

   nom    
----------
 qongiroq
(1 row)
```

`sinov` qatori **hech biriga** tushmadi. Uning qiymati `NULL`, ya'ni noma'lum. `NOT NULL` ham noma'lum, `WHERE` esa faqat rost qatorlarni oladi. "Bajarilmagan yoki noma'lum" kerak bo'lsa, `IS NOT TRUE` ishlatiladi:

```sql
SELECT nom, bajarildi IS NOT TRUE AS bajarilmagan FROM vazifalar;
```

```text
   nom    | bajarilmagan 
----------+--------------
 xat      | f
 qongiroq | t
 hisobot  | f
 sinov    | t
(4 rows)
```

### UUID

```sql
SELECT uuidv4() AS v4, uuidv7() AS v7;
```

```text
                  v4                  |                  v7                  
--------------------------------------+--------------------------------------
 5d506841-97ea-498c-b10d-814467d10026 | 01a12e9c-b1d4-7e67-a706-75765e539e60
(1 row)
```

Uchinchi guruhning birinchi raqami versiyani ko'rsatadi: `4…` va `7…`.

v7 ichida yaratilgan vaqt bor:

```sql
SELECT uuid_extract_version(uuidv7()) AS versiya, uuid_extract_timestamp(uuidv7()) AS vaqt;
```

```text
 versiya |            vaqt            
---------+----------------------------
       7 | 2026-10-12 10:36:23.508+05
(1 row)
```

Ketma-ket yaratilgan v7 qiymatlari **o'sib boradi**:

```sql
SELECT u FROM (SELECT uuidv7() AS u FROM generate_series(1,3)) s;
```

```text
                  u                   
--------------------------------------
 01a12e9c-b1d5-724c-8ff8-a3117521ac2b
 01a12e9c-b1d5-7251-940b-23edc9c2daca
 01a12e9c-b1d5-7256-83bc-4f07fc4c063d
(3 rows)
```

PostgreSQL boshqa yozuvlarni ham qabul qiladi: katta harflar, jingalak qavslar, chiziqchasiz ko'rinish. Lekin chiqishda doim standart ko'rinish beradi:

```sql
SELECT '{A0EEBC99-9C0B-4EF8-BB6D-6BB9BD380A11}'::uuid AS kiritish;
```

```text
               kiritish               
--------------------------------------
 a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11
(1 row)
```

`uuid` tipi va matn ko'rinishining hajmi:

```sql
SELECT pg_column_size(uuidv4()) AS uuid_bayt, pg_column_size(uuidv4()::text) AS matn_bayt;
```

```text
 uuid_bayt | matn_bayt 
-----------+-----------
        16 |        40
(1 row)
```

UUID'ni `text` da saqlash 2,5 baravar ko'p joy oladi.

### Enum

```sql
CREATE TYPE holat AS ENUM ('yangi', 'jarayonda', 'yopildi');
CREATE TABLE murojaatlar (id int, h holat);
INSERT INTO murojaatlar VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');
INSERT INTO murojaatlar VALUES (4, 'bekor');
```

```text
INSERT 0 3
ERROR:  invalid input value for enum holat: "bekor"
```

Saralash va solishtirish alifbo bo'yicha emas, **e'lon qilingan tartib** bo'yicha:

```sql
SELECT * FROM murojaatlar ORDER BY h;
SELECT * FROM murojaatlar WHERE h > 'yangi';
```

```text
 id |     h     
----+-----------
  2 | yangi
  3 | jarayonda
  1 | yopildi
(3 rows)

 id |     h     
----+-----------
  1 | yopildi
  3 | jarayonda
(2 rows)
```

Yangi qiymat kerakli joyga qo'shiladi:

```sql
ALTER TYPE holat ADD VALUE 'bekor' BEFORE 'yopildi';
SELECT enum_range(NULL::holat);
```

```text
           enum_range            
---------------------------------
 {yangi,jarayonda,bekor,yopildi}
(1 row)
```

## Dialektlar

### MySQL

**Boolean yo'q.** MySQL hujjatiga ko'ra `BOOL` va `BOOLEAN` — `TINYINT(1)` ning sinonimi. `TRUE` va `FALSE` esa shunchaki `1` va `0`:

```sql
SELECT TRUE, FALSE, TRUE + TRUE AS yigindi;
```

```text
+------+-------+---------+
| TRUE | FALSE | yigindi |
+------+-------+---------+
|    1 |     0 |       2 |
+------+-------+---------+
```

`BOOLEAN` deb yaratilgan ustun aslida butun son:

```sql
CREATE TABLE vazifalar (nom VARCHAR(20), bajarildi BOOLEAN);
SELECT COLUMN_TYPE FROM information_schema.COLUMNS
WHERE TABLE_NAME = 'vazifalar' AND COLUMN_NAME = 'bajarildi';
INSERT INTO vazifalar VALUES ('xat', TRUE), ('qongiroq', FALSE), ('xato', 2), ('salbiy', -5);
SELECT nom, bajarildi, bajarildi = TRUE AS teng_true, IF(bajarildi, 'ha', 'yoq') AS shart
FROM vazifalar;
```

```text
+-------------+
| COLUMN_TYPE |
+-------------+
| tinyint(1)  |
+-------------+
+----------+-----------+-----------+-------+
| nom      | bajarildi | teng_true | shart |
+----------+-----------+-----------+-------+
| xat      |         1 |         1 | ha    |
| qongiroq |         0 |         0 | yoq   |
| xato     |         2 |         0 | ha    |
| salbiy   |        -5 |         0 | ha    |
+----------+-----------+-----------+-------+
```

Bu jadvalda muhim tuzoq bor:

- `2` va `-5` ustunga bemalol yozildi. `TINYINT` oralig'idan (−128…127) chiqadigan `300` esa qat'iy rejimda xato beradi;
- shartda (`IF`, `WHERE`) noldan farqli har son **rost**;
- lekin `bajarildi = TRUE` aslida `bajarildi = 1`. Shuning uchun `2` va `-5` uchun **yolg'on** chiqdi.

Xulosa: MySQL'da `WHERE bajarildi = TRUE` va `WHERE bajarildi` har xil qatorlarni qaytarishi mumkin.

**UUID.** MySQL'da alohida UUID tipi yo'q. `UUID()` funksiyasi RFC 4122 dagi **1-versiya** UUID'ni qaytaradi. Uning qismlari vaqt belgisi va tarmoq tugunining raqamidan olinadi. Hujjat ogohlantiradi: bu qiymatlar yagona bo'lishi uchun mo'ljallangan, lekin **taxmin qilib bo'lmaydigan emas**. Oldindan bilib bo'lmaydigan qiymat kerak bo'lsa, UUID boshqa yo'l bilan yaratilishi kerak.

```sql
SELECT UUID() AS v1, IS_UUID(UUID()) AS tekshir;
```

```text
+--------------------------------------+---------+
| v1                                   | tekshir |
+--------------------------------------+---------+
| e1b420a0-c5fe-11f1-8519-64d60596df9d |       1 |
+--------------------------------------+---------+
```

Uchinchi guruh `11f1` — `1` bilan boshlanadi, ya'ni 1-versiya. Sinovda `UUIDV7()` funksiyasi topilmadi:

```text
ERROR 1305 (42000) at line 9: FUNCTION qollanma.UUIDV7 does not exist
```

`UUID()` matn qaytaradi. Ixcham saqlash uchun `UUID_TO_BIN()` uni 16 baytlik `VARBINARY(16)` ga aylantiradi, `BIN_TO_UUID()` esa qaytaradi. Ikkinchi argument `1` bo'lsa, vaqtning tez o'zgaradigan qismi o'ngga suriladi. Hujjatga ko'ra bu indekslash samaradorligini oshirishi mumkin, lekin faqat 1-versiya UUID'lar uchun:

```sql
SELECT HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db'))    AS oddiy,
       HEX(UUID_TO_BIN('6ccd780c-baba-1026-9564-5b8c656024db', 1)) AS almashtirilgan;
```

```text
+----------------------------------+----------------------------------+
| oddiy                            | almashtirilgan                   |
+----------------------------------+----------------------------------+
| 6CCD780CBABA102695645B8C656024DB | 1026BABA6CCD780C95645B8C656024DB |
+----------------------------------+----------------------------------+
```

**`ENUM`.** MySQL'da `ENUM` alohida tip yaratmasdan, **ustunning o'zida** e'lon qilinadi. Ichida qiymatlar **raqam** (indeks) bo'lib saqlanadi. Ro'yxatdagi birinchisi 1 dan boshlanadi:

```sql
CREATE TABLE murojaatlar (id INT, h ENUM('yangi', 'jarayonda', 'yopildi') NOT NULL);
INSERT INTO murojaatlar VALUES (1, 'yopildi'), (2, 'yangi'), (3, 'jarayonda');
INSERT INTO murojaatlar VALUES (4, 'bekor');
INSERT INTO murojaatlar (id) VALUES (5);
SELECT id, h, h + 0 AS indeks FROM murojaatlar ORDER BY h;
```

```text
ERROR 1265 (01000) at line 12: Data truncated for column 'h' at row 1
+------+-----------+--------+
| id   | h         | indeks |
+------+-----------+--------+
|    2 | yangi     |      1 |
|    5 | yangi     |      1 |
|    3 | jarayonda |      2 |
|    1 | yopildi   |      3 |
+------+-----------+--------+
```

- Ro'yxatda yo'q qiymat qat'iy rejimda xato berdi.
- `NOT NULL` ustunda qiymat berilmasa, ro'yxatdagi **birinchi** qiymat olinadi (5-qator).
- Saralash PostgreSQL'dagidek e'lon tartibi (indeks) bo'yicha. Hujjat alifbo tartibi kerak bo'lsa, `ORDER BY CAST(h AS CHAR)` ni tavsiya qiladi.

Qat'iy rejim o'chirilgan bo'lsa, noto'g'ri qiymat o'rniga indeksi 0 bo'lgan **bo'sh satr** yoziladi. Hujjat uni "maxsus xato qiymati" deydi:

```text
+------+---+--------+
| id   | h | indeks |
+------+---+--------+
|    6 |   |      0 |
+------+---+--------+
```

Hujjat qiymatlari sonlarga o'xshaydigan enum yaratmaslikni **qat'iy tavsiya qiladi**. Masalan, `ENUM('0', '1', '2')`. Bu `TINYINT` dan joy tejamaydi, satr va indeksni esa adashtirish oson.

### SQLite

**Boolean.** SQLite hujjatiga ko'ra alohida boolean saqlash klassi **yo'q**. Qiymatlar `0` va `1` butun sonlari sifatida saqlanadi. `TRUE` va `FALSE` kalit so'zlari 3.23.0 dan beri bor, lekin ular `1` va `0` ning boshqacha yozilishi, xolos:

```sql
SELECT TRUE, FALSE, typeof(TRUE) AS tip;
CREATE TABLE v (b BOOLEAN);
INSERT INTO v VALUES (TRUE), (2), ('ha');
SELECT b, typeof(b) FROM v;
```

```text
TRUE  FALSE    tip
----  -----  -------
   1      0  integer
b   typeof(b)
--  ---------
 1  integer
 2  integer
ha  text
```

`BOOLEAN` ustunga `2` ham, `'ha'` matni ham yozildi (6-bobdagi affinity qoidalari).

**UUID.** SQLite'da UUID tipi yo'q. Sinovdagi `sqlite3` da `uuid()` funksiyasi ham topilmadi:

```text
SQLite-3.54 memory-> SELECT uuid();
Parse error near line 1: no such function: uuid
  SELECT uuid();
         ^--- error here
```

Odatda UUID ilovada yaratiladi va 16 baytlik `BLOB` yoki 36 belgilik `TEXT` ko'rinishida saqlanadi.

**Enum.** SQLite'da enum tipi yo'q. Ruxsat etilgan qiymatlar odatda `CHECK (h IN ('yangi', 'jarayonda', 'yopildi'))` cheklovi bilan beriladi (14-bob).

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Boolean | Haqiqiy `boolean` tipi | `TINYINT(1)` sinonimi | `0`/`1` butun son |
| `TRUE` | Boolean qiymat | `1` | `1` |
| Ustunga `2` yozish | Xato | Yoziladi | Yoziladi |
| UUID tipi | `uuid` (16 bayt) | Yo'q: `VARBINARY(16)` yoki `CHAR(36)` | Yo'q: `BLOB` yoki `TEXT` |
| UUID yaratish | `uuidv4()`, `uuidv7()` | `UUID()` — 1-versiya | Ichki funksiya yo'q |
| Enum | `CREATE TYPE … AS ENUM`, alohida tip | Ustun ichida `ENUM(…)`, ichida raqam | Yo'q, `CHECK` bilan |
| Ro'yxatda yo'q enum qiymati | Xato | Qat'iy rejimda xato, aks holda `''` | — |
| Enum tartibi | E'lon tartibi | E'lon tartibi (indeks) | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `WHERE NOT faol` bilan "faol bo'lmaganlar"ni olish | `NULL` qatorlar tushib qoladi | `WHERE faol IS NOT TRUE` yoki ustunga `NOT NULL` |
| MySQL'da `WHERE bajarildi = TRUE` yozish | Faqat `1` ni topadi; `2`, `-5` kabi "rost" qiymatlar tushib qoladi | `WHERE bajarildi` yoki ustunga `CHECK (bajarildi IN (0, 1))` |
| Boolean'ni `'Y'`/`'N'` matnida saqlash | Tekshiruvsiz har qanday matn tushib qoladi | PostgreSQL: `boolean`; boshqalarda `CHECK` |
| UUID'ni `text`/`VARCHAR(36)` da saqlash | 2,5 baravar ko'p joy; har xil yozilish (katta harf, qavs) | PostgreSQL: `uuid`; MySQL: `BINARY(16)` + `UUID_TO_BIN` |
| MySQL `UUID()` ni maxfiy token sifatida ishlatish | Hujjatga ko'ra 1-versiya UUID oldindan taxmin qilinishi mumkin | Kriptografik tasodifiy generator |
| Enum'ga keyin "o'chirib bo'ladi" deb ko'p qiymat qo'shish | PostgreSQL'da qiymatni o'chirib bo'lmaydi | Qiymatlar tez-tez o'zgarsa — alohida ma'lumotnoma jadvali va tashqi kalit |
| Enum ustunini alifbo bo'yicha saralanadi deb kutish | E'lon tartibi bo'yicha saralanadi | Kerak bo'lsa: `ORDER BY h::text` / `CAST(h AS CHAR)` |
| MySQL'da raqamga o'xshash enum (`ENUM('1','2','3')`) | Satr va indeks adashadi | `TINYINT` yoki ma'nodor nomlar |
| Ikki xil enum tipini solishtirish (PostgreSQL) | `operator does not exist` | Bir xil tip ishlatish yoki aniq `::text` |

## Amaliyot

1. PostgreSQL'da `SELECT 'yes'::boolean, 'OFF'::boolean, 't'::boolean, ' 1 '::boolean;` ni bajaring. Keyin `'2'::boolean` ni sinang.
2. `faol boolean` ustunli jadvalda `TRUE`, `FALSE` va `NULL` qatorlarni yarating. `WHERE faol`, `WHERE NOT faol`, `WHERE faol IS NOT TRUE`, `WHERE faol IS DISTINCT FROM TRUE` natijalarini solishtiring.
3. 5 ta `uuidv4()` va 5 ta `uuidv7()` yarating va har birini `ORDER BY` bilan saralang. Qaysi biri yaratilish tartibini saqlaydi?
4. MySQL'da `UUID()` ni ikki marta ketma-ket chaqiring. Qaysi guruhlar o'zgardi, qaysilari bir xil qoldi? Hujjatdagi 1-versiya tavsifi bilan solishtiring.
5. PostgreSQL'da `CREATE TYPE ustuvorlik AS ENUM ('past', 'orta', 'yuqori');` yarating. `max()` qaysi qiymatni qaytaradi? `'orta'` ni o'chirishga urinib ko'ring.
6. Xuddi shu ustuvorlikni SQLite'da `CHECK` bilan amalga oshiring. Noto'g'ri qiymat yozib, xatoni ko'ring.

## Rasmiy hujjat

- PostgreSQL — 8.6. Boolean Type: <https://www.postgresql.org/docs/18/datatype-boolean.html>
- PostgreSQL — 8.7. Enumerated Types: <https://www.postgresql.org/docs/18/datatype-enum.html>
- PostgreSQL — 8.12. UUID Type: <https://www.postgresql.org/docs/18/datatype-uuid.html>
- PostgreSQL — 9.14. UUID Functions: <https://www.postgresql.org/docs/18/functions-uuid.html>
- MySQL — 13.1.1 Numeric Data Type Syntax (`BOOL`, `BOOLEAN`): <https://dev.mysql.com/doc/refman/9.7/en/numeric-type-syntax.html>
- MySQL — 11.1.6 Boolean Literals: <https://dev.mysql.com/doc/refman/9.7/en/boolean-literals.html>
- MySQL — 14.25 Miscellaneous Functions (`UUID()`, `UUID_TO_BIN()`): <https://dev.mysql.com/doc/refman/9.7/en/miscellaneous-functions.html>
- MySQL — 13.3.6 The ENUM Type: <https://dev.mysql.com/doc/refman/9.7/en/enum.html>
- SQLite — Datatypes In SQLite (2.1. Boolean Datatype): <https://www.sqlite.org/datatype3.html>
