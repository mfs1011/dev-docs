# 10 — NULL va tip konversiyasi

[← Oldingi: Boolean, UUID va enum](09-boolean-uuid-enum.md) · [Mundarija](README.md) · [Keyingi: Kodlash va collation →](11-kodlash-va-collation.md)

## Tushuncha

### NULL — "noma'lum"

PostgreSQL glossariysida `NULL` — relyatsion nazariyaning asosiy tushunchalaridan biri: **aniq qiymatning yo'qligi**. MySQL hujjati uni "yo'q, noma'lum qiymat" deb ataydi.

`NULL` na nol, na bo'sh satr. MySQL hujjatidagi misol farqni yaxshi ko'rsatadi:

```sql
INSERT INTO my_table (phone) VALUES (NULL);  -- telefon raqami noma'lum
INSERT INTO my_table (phone) VALUES ('');    -- ma'lumki, telefoni yo'q
```

### Uch qiymatli mantiq

SQL'da mantiqiy ifoda **uchta** qiymat beradi: rost, yolg'on va `NULL` (noma'lum). PostgreSQL hujjatidagi haqiqat jadvallari:

| a | b | a AND b | a OR b |
| --- | --- | --- | --- |
| TRUE | TRUE | TRUE | TRUE |
| TRUE | FALSE | FALSE | TRUE |
| TRUE | NULL | **NULL** | TRUE |
| FALSE | FALSE | FALSE | FALSE |
| FALSE | NULL | FALSE | **NULL** |
| NULL | NULL | NULL | NULL |

| a | NOT a |
| --- | --- |
| TRUE | FALSE |
| FALSE | TRUE |
| NULL | **NULL** |

Jadvalni oddiy fikr bilan tushunish mumkin: `NULL` o'rniga "rost yoki yolg'on — bilmayman" deb qo'ying.

- `TRUE AND noma'lum` — noma'lum, chunki natija noma'lumga bog'liq.
- `FALSE AND noma'lum` — aniq yolg'on, noma'lum nima bo'lishidan qat'i nazar.

### Taqqoslash va `NULL`

Hujjatga ko'ra oddiy taqqoslash operatorlari (`=`, `<>`, `<` …) kirishlardan biri `NULL` bo'lsa, **`NULL`** qaytaradi. Masalan, `7 = NULL` ham, `7 <> NULL` ham `NULL`. `NULL = NULL` ham `NULL`, chunki hujjat aytganidek, "ikki noma'lum qiymat teng-tengmasligi noma'lum".

`WHERE` faqat **rost** natijali qatorlarni oladi. Shuning uchun `WHERE ustun = NULL` hech qachon qator qaytarmaydi.

`NULL` ni tekshirish uchun maxsus predikatlar bor:

| Predikat | Natija |
| --- | --- |
| `x IS NULL` / `x IS NOT NULL` | `x` noma'lummi |
| `a IS DISTINCT FROM b` | `<>` kabi, lekin `NULL` ni oddiy qiymatdek ko'radi: ikkalasi `NULL` → yolg'on |
| `a IS NOT DISTINCT FROM b` | `=` kabi, lekin ikkalasi `NULL` → rost |
| `p IS TRUE`, `IS NOT TRUE`, `IS FALSE`, `IS NOT FALSE`, `IS UNKNOWN` | Doim rost yoki yolg'on qaytaradi, hech qachon `NULL` emas |

Hujjat ogohlantiradi: `x = NULL` deb yozmang. PostgreSQL'da `transform_null_equals` sozlamasi bor. U `x = NULL` ni `x IS NULL` ga aylantiradi. Lekin hujjat bunday ilovalarni **standartga moslab o'zgartirishni** qat'iy tavsiya qiladi.

### Tip konversiyasi

PostgreSQL hujjatiga ko'ra SQL **qat'iy tiplangan** til: har qiymatning tipi bor va u qiymatning xatti-harakatini belgilaydi. Turli tiplar uchrashadigan to'rtta joy bor:

1. funksiya chaqiruvi;
2. operator (`1 + x`);
3. jadvalga yozish (`INSERT`, `UPDATE`);
4. `UNION`, `CASE` va shunga o'xshashlar. Ularda bir nechta natijaga umumiy tip topiladi.

**Aniq konversiya.** PostgreSQL'da ikki yozuv bor:

```sql
CAST ( ifoda AS tip )   -- standart
ifoda::tip              -- PostgreSQL'ning tarixiy yozuvi
```

Funksiyaga o'xshash yozuv ham bor: `int4('7')`. Lekin u `double precision` kabi ko'p so'zli tiplarda ishlamaydi. Hujjat buni nomuvofiq deydi va undan qochishni maslahat beradi.

**Yashirin konversiya.** PostgreSQL faqat tizim katalogida "yashirin qo'llash mumkin" deb belgilangan konversiyalarni o'zi bajaradi. Hujjat buning sababini aytadi: "kutilmagan konversiyalar jimgina bajarilishining oldini olish uchun".

**Tipi noma'lum literal.** `'1'` kabi tirnoqdagi literalning tipi avval **noma'lum** (`unknown`) bo'ladi. U kontekstga qarab aniqlanadi. Shuning uchun `1 + '1'` ishlaydi: `'1'` `integer` sifatida o'qiladi. Ustundagi `text` qiymat bilan esa bunday bo'lmaydi.

**Jadvalga yozish.** Yozilayotgan qiymat ustun tipiga aylantiriladi. Ikki tip orasida "tayinlash" (*assignment*) konversiyasi bo'lsa, u qo'llanadi. Literal bo'lsa, ustun tipining kiritish funksiyasi chaqiriladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `NULL` bilan taqqoslash

```sql
SELECT 7 = NULL AS teng, 7 <> NULL AS teng_emas, NULL = NULL AS null_null;
SELECT NULL IS NULL AS a, 7 IS DISTINCT FROM NULL AS b, NULL IS NOT DISTINCT FROM NULL AS c;
```

```text
 teng | teng_emas | null_null 
------+-----------+-----------
      |           | 
(1 row)

 a | b | c 
---+---+---
 t | t | t
(1 row)
```

Birinchi so'rovning uchala ustuni ham bo'sh, ya'ni `NULL`.

```sql
SELECT TRUE AND NULL AS va, FALSE AND NULL AS va_yolgon, TRUE OR NULL AS yoki, NOT NULL::boolean AS emas;
```

```text
 va | va_yolgon | yoki | emas 
----+-----------+------+------
    | f         | t    | 
(1 row)
```

Haqiqat jadvalidagidek chiqdi.

### Jadvalda

```sql
CREATE TABLE telefonlar (ism text, tel text);
INSERT INTO telefonlar VALUES ('Ali', '+998901234567'), ('Vali', ''), ('Sobir', NULL);

SELECT ism FROM telefonlar WHERE tel = NULL;
SELECT ism FROM telefonlar WHERE tel IS NULL;
SELECT ism FROM telefonlar WHERE tel <> '+998901234567';
```

```text
 ism 
-----
(0 rows)

  ism  
-------
 Sobir
(1 row)

 ism  
------
 Vali
(1 row)
```

Uchinchi natijaga e'tibor bering. "Telefoni Alinikidan farq qiladiganlar" so'ralgan, lekin `Sobir` chiqmadi. Uning raqami noma'lum, shuning uchun `<>` natijasi ham noma'lum. Uni ham olish kerak bo'lsa: `WHERE tel IS DISTINCT FROM '+998901234567'`.

### `NULL` ifodalarda

```sql
SELECT count(*) AS hammasi, count(tel) AS tel_bor FROM telefonlar;
SELECT 1 + NULL AS yigindi, 'Salom ' || NULL AS ulash, concat('Salom ', NULL) AS concat_bilan;
```

```text
 hammasi | tel_bor 
---------+---------
       3 |       2
(1 row)

 yigindi | ulash | concat_bilan 
---------+-------+--------------
         |       | Salom 
(1 row)
```

- `count(*)` qatorlarni sanaydi, `count(ustun)` esa `NULL` bo'lmagan qiymatlarni.
- `NULL` qatnashgan arifmetika va `||` natijasi `NULL`.
- `concat()` funksiyasi esa `NULL` argumentlarni **e'tiborsiz qoldiradi** (33-bob).

### Aniq va yashirin konversiya

```sql
SELECT '42'::int + 1 AS a, CAST('3.5' AS numeric) * 2 AS b, int4('7') AS c;
```

```text
 a  |  b  | c 
----+-----+---
 43 | 7.0 | 7
(1 row)
```

Tipi noma'lum literal kontekstdan tip oladi:

```sql
SELECT 1 + '1' AS noma_lum_literal;
SELECT 1 + '1.5';
SELECT '1' = 1 AS literal_bilan;
```

```text
 noma_lum_literal 
------------------
                2
(1 row)

ERROR:  invalid input syntax for type integer: "1.5"

 literal_bilan 
---------------
 t
(1 row)
```

`'1.5'` `integer` sifatida o'qilmoqchi bo'ldi va xato berdi. Kontekstda butun son kutilgan edi.

Lekin tipi aniq bo'lgan `text` **ustun** son bilan qo'shilmaydi va solishtirilmaydi:

```sql
SELECT ism, 1 + tel FROM telefonlar;
```

```text
ERROR:  operator does not exist: integer + text
HINT:  No operator matches the given name and argument types. You might need to add explicit type casts.
```

```sql
CREATE TABLE sonlar (n integer, t text);
INSERT INTO sonlar VALUES ('42', 42);
SELECT n, t, pg_typeof(n), pg_typeof(t) FROM sonlar;
SELECT n FROM sonlar WHERE t = n;
```

```text
 n  | t  | pg_typeof | pg_typeof 
----+----+-----------+-----------
 42 | 42 | integer   | text
(1 row)

ERROR:  operator does not exist: text = integer
```

Jadvalga yozishda konversiya bajarildi: `'42'` → `integer`, `42` → `text`. Bu "tayinlash" konversiyasi. Lekin `WHERE t = n` da PostgreSQL `text` va `integer` ni solishtirish uchun yashirin konversiya qilmadi va xato berdi. Kerak bo'lsa, buni aniq yozish kerak: `WHERE t = n::text` yoki `WHERE t::int = n`.

```sql
SELECT 'abc'::int;
```

```text
ERROR:  invalid input syntax for type integer: "abc"
```

## Dialektlar

### MySQL

**`NULL`.** Asosiy qoidalar bir xil:

- taqqoslash `NULL` beradi;
- `IS NULL` va `IS NOT NULL` ishlaydi;
- `NULL` qatnashgan ifoda odatda `NULL`.

Farqlari:

- **`<=>`** — MySQL'ning "NULL-xavfsiz tenglik" operatori. Standartdagi `IS NOT DISTINCT FROM` ning vazifasini bajaradi.
- MySQL'da shart uchun `0` va `NULL` yolg'on, qolgan hammasi rost (9-bob). Mantiqiy amal natijasi `1`, `0` yoki `NULL`.
- **`CONCAT()`** argumentlardan biri `NULL` bo'lsa, `NULL` qaytaradi. PostgreSQL'dagi `concat()` dan farqli.

```sql
SELECT 1 = NULL AS teng, NULL <=> NULL AS null_xavfsiz, 1 <=> NULL AS bir_null, NULL IS NULL AS is_null;
SELECT CONCAT('Salom ', NULL) AS concat_null, CONCAT(2, ' ta') AS son_matn;
```

```text
+------+--------------+----------+---------+
| teng | null_xavfsiz | bir_null | is_null |
+------+--------------+----------+---------+
| NULL |            1 |        0 |       1 |
+------+--------------+----------+---------+
+-------------+----------+
| concat_null | son_matn |
+-------------+----------+
| NULL        | 2 ta     |
+-------------+----------+
```

**Yashirin konversiya ko'p va yumshoq.** Hujjatga ko'ra MySQL kerak bo'lsa satrni songa, sonni satrga **o'zi aylantiradi**. Satr va son solishtirilganda ikkalasi ham **kasr son** (`DOUBLE`) sifatida solishtiriladi.

```sql
SELECT 1 + '1' AS a, '10' + '5' AS b, 1 + '1.5' AS c, 1 + 'abc' AS d;
SHOW WARNINGS;
```

```text
+---+----+-----+---+
| a | b  | c   | d |
+---+----+-----+---+
| 2 | 15 | 2.5 | 1 |
+---+----+-----+---+
| Warning | 1292 | Truncated incorrect DOUBLE value: 'abc' |
```

Har bir natija PostgreSQL'dan farq qiladi:

- `'10' + '5'` = 15. Ikki satr son sifatida qo'shildi;
- `1 + '1.5'` = 2.5. PostgreSQL'da bu xato edi;
- `1 + 'abc'` = 1. `'abc'` jimgina `0` ga aylandi, faqat ogohlantirish berildi.

**Satr ustunni son bilan solishtirish — xavfli.** Hujjatdagi misolni takrorlaymiz:

```sql
CREATE TABLE t1 (c1 INT, c3 VARCHAR(25));
INSERT INTO t1 VALUES (1, 'grape'), (2, 'apple'), (3, '0'), (4, '0abc');
SELECT * FROM t1 WHERE c3 = 0;
SELECT * FROM t1 WHERE c3 = '0';
```

```text
+------+-------+
| c1   | c3    |
+------+-------+
|    1 | grape |
|    2 | apple |
|    3 | 0     |
|    4 | 0abc  |
+------+-------+
+------+------+
| c1   | c3   |
+------+------+
|    3 | 0    |
+------+------+
```

`c3 = 0` **hamma** qatorni qaytardi. `'grape'` ham, `'0abc'` ham son sifatida `0` ga aylandi. Hujjatga ko'ra bu **qat'iy rejimda ham** bo'ladi, chunki qat'iy rejim `SELECT` ga qo'llanmaydi. Hujjat buni "ma'lum muammo" deydi.

Hujjat bundan ham muhim narsani aytadi: satr ustun son bilan solishtirilganda, ustundagi **indeks ishlatilmaydi**. Ko'p turli satrlar bitta `1` soniga aylanishi mumkin: `'1'`, `' 1'`, `'1a'` (47-bob).

**`CAST`.** MySQL'da `CAST` ning maqsad tiplari cheklangan: `SIGNED`, `UNSIGNED`, `DECIMAL`, `CHAR`, `DATE` va boshqalar. `INTEGER` yozib bo'lmaydi:

```sql
SELECT CAST('42' AS SIGNED) AS a, CAST('3.7' AS DECIMAL(5,1)) AS b, CAST(3.7 AS SIGNED) AS c;
SELECT CAST('42' AS INTEGER);
```

```text
+----+-----+---+
| a  | b   | c |
+----+-----+---+
| 42 | 3.7 | 4 |
+----+-----+---+
ERROR 1064 (42000) at line 11: You have an error in your SQL syntax; … near 'INTEGER)' at line 1
```

`CAST(3.7 AS SIGNED)` `4` ga **yaxlitladi**.

### SQLite

**`NULL`.** SQLite hujjati ochiq tan oladi: standart `NULL` bilan ishlashni hamma holatlar uchun aniq tushuntirmaydi. Shuning uchun SQLite boshqa mashhur tizimlar qanday ishlashini sinab ko'rib, ularga o'xshatilgan. Asosiy qoidalar PostgreSQL bilan bir xil:

```sql
SELECT 7 = NULL AS teng, NULL IS NULL AS a, 7 IS NOT NULL AS b, NULL IS NOT DISTINCT FROM NULL AS c;
```

```text
teng  a  b  c
----  -  -  -
      1  1  1
```

**Konversiya — affinity orqali.** SQLite'da tip qiymatga tegishli (6-bob). Konversiya ustunning affinity'siga qarab bajariladi. Ifodalarda esa sonli amallar satrni son qilib o'qishga harakat qiladi:

```sql
SELECT 1 + '1' AS a, 1 + '1.5' AS b, 1 + 'abc' AS c, '10' + '5' AS d;
```

```text
a   b   c  d
-  ---  -  --
2  2.5  1  15
```

Natija MySQL bilan bir xil chiqdi: `'abc'` `0` ga aylandi. Ogohlantirish ham berilmadi.

**Taqqoslashdan oldin konversiya.** SQLite hujjatidagi qoida:

- bir operandda INTEGER, REAL yoki NUMERIC affinity bo'lsa, ikkinchisida esa TEXT, BLOB yoki affinity yo'q bo'lsa — ikkinchisiga NUMERIC affinity qo'llanadi;
- bir operand TEXT, ikkinchisida affinity yo'q bo'lsa — TEXT qo'llanadi.

Konversiya faqat **ma'lumot yo'qolmasa** bajariladi.

```sql
CREATE TABLE t (i INTEGER, s TEXT);
INSERT INTO t VALUES ('42', 42);
SELECT i, typeof(i), s, typeof(s), i = '42' AS i_matn, s = 42 AS s_son FROM t;
```

```text
i   typeof(i)  s   typeof(s)  i_matn  s_son
--  ---------  --  ---------  ------  -----
42  integer    42  text            1      1
```

PostgreSQL xato bergan `text = integer` solishtiruvi SQLite'da ishladi. Ustunning affinity'si literalga qo'llandi.

**`CAST`.** SQLite hujjatiga ko'ra `TEXT` ni `INTEGER` ga o'girganda matnning boshidan butun son bo'la oladigan **eng uzun qism** olinadi, qolgani tashlab yuboriladi. Bunday qism bo'lmasa — `0`:

```sql
SELECT CAST('42abc' AS INTEGER) AS a, CAST('abc' AS INTEGER) AS b, CAST(3.9 AS INTEGER) AS c;
```

```text
a   b  c
--  -  -
42  0  3
```

Uchala tizimda uch xil natija:

- `CAST(3.9 AS INTEGER)`: SQLite'da `3` (kesadi), MySQL'da `CAST(3.7 AS SIGNED)` → `4` (yaxlitlaydi);
- `CAST('abc' …)`: PostgreSQL'da xato, SQLite'da `0`.

**`STRICT` jadvallar.** SQLite 3.37.0 dan beri jadvalni **qat'iy** qilish mumkin. Buning uchun `CREATE TABLE` oxiriga `STRICT` yoziladi. Hujjatdagi qoidalar:

- har ustunga tip yozish shart. Ruxsat etilgan tiplar faqat `INT`, `INTEGER`, `REAL`, `TEXT`, `BLOB`, `ANY`;
- qiymat avval odatdagi affinity qoidalari bilan o'giriladi;
- ma'lumot yo'qotmasdan o'girib bo'lmasa — `SQLITE_CONSTRAINT_DATATYPE` xatosi.

```sql
CREATE TABLE q (n INTEGER, m TEXT) STRICT;
INSERT INTO q VALUES ('42', 'salom');
SELECT n, typeof(n) FROM q;
```

```text
n   typeof(n)
--  ---------
42  integer
```

```text
SQLite-3.54 memory-> INSERT INTO q VALUES ('abc', 'salom');
Error near line 2: cannot store TEXT value in INTEGER column q.n
SQLite-3.54 memory-> CREATE TABLE r (n VARCHAR(10)) STRICT;
Parse error near line 3: unknown datatype for r.n: "VARCHAR(10)"
```

`'42'` butun songa aylandi. `'abc'` esa rad etildi, xuddi PostgreSQL'dagidek. `STRICT` jadvalda `VARCHAR(10)` kabi boshqa tip nomlari ishlamaydi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `NULL = NULL` | `NULL` | `NULL` | `NULL` |
| NULL-xavfsiz tenglik | `IS NOT DISTINCT FROM` | `<=>` (va `IS NOT DISTINCT FROM` yo'q) | `IS NOT DISTINCT FROM`, `IS` |
| `concat('a', NULL)` | `'a'` | `NULL` | `'a'` |
| `1 + '1.5'` | Xato | `2.5` | `2.5` |
| `1 + 'abc'` | Xato | `1` + ogohlantirish | `1` |
| `text` ustun = son | Xato (aniq `CAST` kerak) | Ikkalasi `DOUBLE` ga; `'grape' = 0` rost | Affinity bo'yicha |
| `CAST` sintaksisi | `CAST(x AS t)`, `x::t` | `CAST(x AS SIGNED/DECIMAL/CHAR…)` | `CAST(x AS t)` |
| `CAST('abc' AS int)` | Xato | `CAST('abc' AS SIGNED)` → `0` + ogohlantirish | `0` |
| Qat'iy tiplash | Doim | Qat'iy rejim (faqat yozishda) | `STRICT` jadvallar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `WHERE ustun = NULL` | Hech qachon rost emas, qator qaytmaydi | `WHERE ustun IS NULL` |
| `WHERE ustun <> 'x'` bilan "x bo'lmaganlarning hammasi"ni olish | `NULL` qatorlar tushib qoladi | `WHERE ustun IS DISTINCT FROM 'x'` |
| `NULL` va bo'sh satrni bir xil deb hisoblash | "Noma'lum" va "yo'q" — boshqa ma'nolar; `IS NULL` bo'sh satrni topmaydi | Ma'noni tanlab, izchil ishlatish; kerak bo'lsa `NOT NULL` |
| `count(ustun)` bilan qatorlarni sanash | `NULL` lar sanalmaydi | Qatorlar uchun `count(*)` |
| `'Salom ' \|\| ism` — ism `NULL` bo'lishi mumkin | Butun natija `NULL` | `concat()` (PostgreSQL, SQLite) yoki `coalesce(ism, '')` (32-bob) |
| MySQL'da satr ustunni son bilan solishtirish (`WHERE kod = 0`) | `'grape'` ham `0` ga teng; indeks ishlatilmaydi | Qiymatni tirnoqqa olish: `WHERE kod = '0'` |
| MySQL va SQLite'da `'abc'` ning `0` ga aylanishiga e'tibor bermaslik | Xato ma'lumot jimgina hisobga kiradi | Kiritishni tekshirish; MySQL'da ogohlantirishlarni kuzatish; SQLite'da `STRICT` |
| Raqamlarni `text` ustunda saqlab, keyin son sifatida ishlatish | PostgreSQL'da har joyda `CAST` kerak; boshqalarida noaniq natijalar | To'g'ri tip tanlash |
| PostgreSQL'da `int4('7')` kabi funksiya ko'rinishidagi `CAST` | Ba'zi tiplarda ishlamaydi; hujjat tavsiya qilmaydi | `CAST(... AS ...)` yoki `::` |

## Amaliyot

1. Haqiqat jadvalini o'zingiz tekshiring: `SELECT a, b, a AND b, a OR b FROM (VALUES (TRUE), (FALSE), (NULL)) x(a), (VALUES (TRUE), (FALSE), (NULL)) y(b);`.
2. `telefonlar` jadvalida "telefoni yo'q yoki noma'lum" bo'lganlarni bitta so'rov bilan toping.
3. PostgreSQL'da `SELECT NULL IS UNKNOWN;` va `SELECT 1 IS UNKNOWN;` ni bajaring. Nega ikkinchisi xato beradi? Hujjatdagi `IS UNKNOWN` tavsifi bilan solishtiring.
4. Uchala tizimda `SELECT '5' * '4', '5' || '4';` ni bajaring. MySQL'da `||` ning ma'nosini eslang (1-bob).
5. MySQL'da `VARCHAR` ustunli jadvalga `'7'`, `'7 '`, `'7abc'`, `'abc'` ni yozing. `WHERE ustun = 7` va `WHERE ustun = '7'` natijalarini solishtiring.
6. SQLite'da bir xil jadvalni oddiy va `STRICT` qilib yarating. Har biriga `('12', 'matn', 3.5)` qatorini `INTEGER`, `INTEGER`, `INTEGER` ustunlarga yozib, natijalarni solishtiring.

## Rasmiy hujjat

- PostgreSQL — 9.1. Logical Operators: <https://www.postgresql.org/docs/18/functions-logical.html>
- PostgreSQL — 9.2. Comparison Functions and Operators: <https://www.postgresql.org/docs/18/functions-comparison.html>
- PostgreSQL — 4.2.9. Type Casts: <https://www.postgresql.org/docs/18/sql-expressions.html#SQL-SYNTAX-TYPE-CASTS>
- PostgreSQL — Chapter 10. Type Conversion: <https://www.postgresql.org/docs/18/typeconv-overview.html>
- PostgreSQL — 10.4. Value Storage: <https://www.postgresql.org/docs/18/typeconv-query.html>
- MySQL — 5.3.4.6 Working with NULL Values: <https://dev.mysql.com/doc/refman/9.7/en/working-with-null.html>
- MySQL — B.3.4.3 Problems with NULL Values: <https://dev.mysql.com/doc/refman/9.7/en/problems-with-null.html>
- MySQL — 14.3 Type Conversion in Expression Evaluation: <https://dev.mysql.com/doc/refman/9.7/en/type-conversion.html>
- MySQL — 14.10 Cast Functions and Operators: <https://dev.mysql.com/doc/refman/9.7/en/cast-functions.html>
- SQLite — NULL Handling in SQLite: <https://www.sqlite.org/nulls.html>
- SQLite — Datatypes In SQLite (affinity, taqqoslash): <https://www.sqlite.org/datatype3.html>
- SQLite — STRICT Tables: <https://www.sqlite.org/stricttables.html>
- SQLite — CAST expressions: <https://www.sqlite.org/lang_expr.html#castexpr>
