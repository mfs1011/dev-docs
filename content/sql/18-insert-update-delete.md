# 18 — `INSERT`, `UPDATE`, `DELETE`

[← Oldingi: View va materialized view](17-view-va-materialized-view.md) · [Mundarija](README.md) · [Keyingi: RETURNING va yangi ID →](19-returning-va-yangi-id.md)

## Tushuncha

Jadval yaratilganda bo'sh bo'ladi. Ma'lumot bilan ishlashning uchta asosiy buyrug'i bor. Ular **DML** (*Data Manipulation Language*) deyiladi:

| Buyruq | Vazifasi |
| --- | --- |
| `INSERT` | Yangi qator qo'shadi |
| `UPDATE` | Mavjud qatorlarni o'zgartiradi |
| `DELETE` | Qatorlarni o'chiradi |

PostgreSQL hujjatidagi ikkita asosiy qoida:

- **Faqat butun qator.** Bir nechta qatorni bitta buyruq bilan qo'shish mumkin, lekin to'liq bo'lmagan qatorni qo'shib bo'lmaydi. Ba'zi ustunlarning qiymati noma'lum bo'lsa ham, to'liq qator yaratiladi: qolgan ustunlar sukut bo'yicha qiymat oladi. O'chirish ham faqat butun qator bilan bo'ladi.
- **Qatorlar shart bilan tanlanadi.** SQL qatorlarga yagona identifikator bermaydi (12-bob). Shuning uchun `UPDATE` va `DELETE` da qaysi qatorlar o'zgarishini **shart** bilan aytamiz. Bitta aniq qatorga ishonchli murojaat qilishning yagona yo'li — birlamchi kalit bo'yicha shart.

### `INSERT`

```sql
INSERT INTO products VALUES (1, 'Cheese', 9.99);
```

Bu ko'rinishda qiymatlar jadvaldagi ustunlar tartibida yoziladi, demak ustunlar tartibini bilish kerak. Shuning uchun ustunlarni aniq sanab yozish yaxshiroq. Hujjatga ko'ra ko'p foydalanuvchilar buni "yaxshi amaliyot" deb biladi:

```sql
INSERT INTO products (product_no, name, price) VALUES (1, 'Cheese', 9.99);
INSERT INTO products (name, price, product_no) VALUES ('Cheese', 9.99, 1);   -- bir xil
```

Boshqa ko'rinishlar:

| Ko'rinish | Ma'nosi |
| --- | --- |
| `INSERT INTO t (a, b) VALUES (1, 'x')` | Sanalmagan ustunlar sukut bo'yicha qiymat oladi |
| `INSERT INTO t VALUES (1, 'x')` | Qiymatlar chapdan to'ldiriladi, qolgani sukut bo'yicha. Bu PostgreSQL kengaytmasi |
| `VALUES (1, DEFAULT)` | Bitta ustun uchun aniq sukut bo'yicha qiymat |
| `INSERT INTO t DEFAULT VALUES` | Butun qator sukut bo'yicha qiymatlardan |
| `VALUES (…), (…), (…)` | Bir buyruqda bir nechta qator |
| `INSERT INTO t (…) SELECT …` | So'rov natijasini qo'shish: 0, 1 yoki ko'p qator |

Hujjatdagi maslahat: juda ko'p ma'lumot yuklashda `COPY` ni ko'rib chiqing. U `INSERT` dek moslashuvchan emas, lekin samaraliroq (21-bob).

### `UPDATE`

`UPDATE` ga uchta narsa kerak: jadval va ustun, yangi qiymat va qaysi qatorlar.

```sql
UPDATE products SET price = 10 WHERE price = 5;
UPDATE products SET price = price * 1.10;          -- WHERE siz: hamma qatorlar
UPDATE mytable SET a = 5, b = 3, c = 1 WHERE a > 0;
```

Hujjatdagi nuqtalar:

- `UPDATE` 0, 1 yoki ko'p qatorni o'zgartirishi mumkin. Hech bir qator mos kelmasa, bu **xato emas**;
- yangi qiymat ifoda bo'lishi va qatorning eski qiymatiga murojaat qilishi mumkin;
- `WHERE` yozilmasa, **jadvaldagi hamma qator** yangilanadi;
- `SET` dagi `=` — qiymat berish, `WHERE` dagi `=` — solishtirish.

### `DELETE`

```sql
DELETE FROM products WHERE price = 10;
DELETE FROM products;          -- hamma qatorlar
```

Hamma qatorni o'chirish uchun `TRUNCATE` ham bor (16-bob).

### Boshqa jadvallarga tayanib o'zgartirish

Ko'pincha qaysi qatorni qanday o'zgartirishni **boshqa jadval** belgilaydi. Masalan, kunlik sotuvlarga qarab ombordagi qoldiqni kamaytirish kerak. PostgreSQL'da buning uchun ikki kengaytma bor:

- `UPDATE … FROM boshqa_jadval WHERE …`;
- `DELETE … USING boshqa_jadval WHERE …`.

Hujjatga ko'ra `FROM`, `USING` va `RETURNING` (19-bob) — PostgreSQL kengaytmalari, standartda yo'q.

`UPDATE … FROM` da muhim ogohlantirish bor. `FROM` bo'lsa, maqsad jadval boshqa jadvallar bilan **birlashtiriladi** (JOIN, 25-bob). Har natija qatori bitta yangilashni bildiradi. Agar bitta maqsad qatoriga bir nechta qator mos kelsa, **ulardan faqat bittasi** ishlatiladi va qaysi biri ekanini "oldindan aytib bo'lmaydi". Hujjatning maslahati: har maqsad qatoriga eng ko'pi bitta qator mos kelishini ta'minlang. Yoki boshqa jadvallarga subquery orqali murojaat qiling: bu xavfsizroq, lekin ko'pincha o'qish qiyinroq va sekinroq.

Hujjatda yana bir ogohlantirish bor: boshqa tizimlarda `FROM` da maqsad jadval **qayta** yoziladi. PostgreSQL `FROM` ni bunday tushunmaydi, shuning uchun ko'chirishda ehtiyot bo'lish kerak.

### `VALUES` alohida buyruq sifatida

`VALUES` faqat `INSERT` ning qismi emas. Hujjatga ko'ra u qiymatlardan "doimiy jadval" yasaydi va `SELECT` bo'lishi mumkin bo'lgan har joyda ishlatiladi. Unga `ORDER BY`, `LIMIT` va `OFFSET` ham qo'llanadi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `INSERT` ko'rinishlari

```sql
CREATE TABLE ombor (
    mahsulot_id int PRIMARY KEY, nom text NOT NULL,
    soni int NOT NULL DEFAULT 0, narx numeric NOT NULL DEFAULT 0
);
CREATE TABLE sotuvlar (id int GENERATED ALWAYS AS IDENTITY, mahsulot_id int, soni int);

INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (1, 'Non', 100, 4000);
INSERT INTO ombor (nom, mahsulot_id) VALUES ('Sut', 2);
INSERT INTO ombor VALUES (3, 'Choy');
INSERT INTO ombor (mahsulot_id, nom, soni, narx) VALUES (4, 'Tuz', 50, 2000), (5, 'Shakar', 80, 11000);
INSERT INTO sotuvlar (mahsulot_id, soni) VALUES (1, 10), (1, 5), (4, 3), (5, 20);
SELECT * FROM ombor ORDER BY mahsulot_id;
```

```text
INSERT 0 1
INSERT 0 1
INSERT 0 1
INSERT 0 2
INSERT 0 4
 mahsulot_id |  nom   | soni | narx  
-------------+--------+------+-------
           1 | Non    |  100 |  4000
           2 | Sut    |    0 |     0
           3 | Choy   |    0 |     0
           4 | Tuz    |   50 |  2000
           5 | Shakar |   80 | 11000
(5 rows)
```

`INSERT 0 2` dagi oxirgi son — qo'shilgan qatorlar soni. `Choy` faqat ikkita qiymat bilan qo'shildi, qolgan ustunlar sukut bo'yicha qiymatni oldi. Bu PostgreSQL kengaytmasi.

### `UPDATE`

```sql
UPDATE ombor SET narx = narx * 1.10 WHERE narx > 0;
UPDATE ombor SET soni = 999, narx = 1 WHERE mahsulot_id = 42;
```

```text
UPDATE 3
UPDATE 0
```

42-mahsulot yo'q. `UPDATE 0` xato emas, faqat hech narsa o'zgarmadi.

### `UPDATE … FROM`

Kunlik sotuvlarni ombordan ayiramiz. Avval sotuvlarni mahsulot bo'yicha jamlaymiz (agregatsiya — 26-bob), shunda har mahsulotga **bitta** qator to'g'ri keladi:

```sql
UPDATE ombor o
SET soni = o.soni - k.jami
FROM (SELECT mahsulot_id, sum(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) k
WHERE o.mahsulot_id = k.mahsulot_id;
SELECT * FROM ombor ORDER BY mahsulot_id;
```

```text
UPDATE 3
 mahsulot_id |  nom   | soni |   narx   
-------------+--------+------+----------
           1 | Non    |   85 |  4400.00
           2 | Sut    |    0 |        0
           3 | Choy   |    0 |        0
           4 | Tuz    |   47 |  2200.00
           5 | Shakar |   60 | 12100.00
(5 rows)
```

Non: 100 − (10 + 5) = 85.

**Hujjat ogohlantirgan xato.** Jamlamasdan, sotuvlar jadvalining o'zini `FROM` ga qo'ysak, 1-mahsulotga **ikkita** sotuv qatori mos keladi:

```sql
BEGIN;
UPDATE ombor o SET soni = s.soni FROM sotuvlar s WHERE o.mahsulot_id = s.mahsulot_id;
SELECT mahsulot_id, soni FROM ombor WHERE mahsulot_id IN (1, 4) ORDER BY 1;
ROLLBACK;
```

```text
UPDATE 2
 mahsulot_id | soni 
-------------+------
           1 |   10
           4 |    3
(2 rows)
```

1-mahsulotga 10 va 5 mos kelgan edi. Ulardan biri, 10, jimgina tanlandi. Xato ham, ogohlantirish ham chiqmadi. Hujjatga ko'ra qaysi biri tanlanishini oldindan aytib bo'lmaydi.

### `DELETE … USING`

```sql
DELETE FROM sotuvlar s USING ombor o
WHERE s.mahsulot_id = o.mahsulot_id AND o.nom = 'Shakar';
SELECT * FROM sotuvlar ORDER BY id;
```

```text
DELETE 1
 id | mahsulot_id | soni 
----+-------------+------
  1 |           1 |   10
  2 |           1 |    5
  3 |           4 |    3
(3 rows)
```

### `INSERT … SELECT`

```sql
CREATE TABLE ombor_arxiv (LIKE ombor);
INSERT INTO ombor_arxiv SELECT * FROM ombor WHERE soni = 0;
SELECT * FROM ombor_arxiv;
```

```text
INSERT 0 2
 mahsulot_id | nom  | soni | narx 
-------------+------+------+------
           2 | Sut  |    0 |    0
           3 | Choy |    0 |    0
(2 rows)
```

### `VALUES` alohida

```sql
VALUES (1, 'bir'), (2, 'ikki') ORDER BY 1 DESC;
SELECT * FROM (VALUES (1, 'bir'), (2, 'ikki')) AS t(raqam, soz);
```

```text
 column1 | column2 
---------+---------
       2 | ikki
       1 | bir
(2 rows)

 raqam | soz  
-------+------
     1 | bir
     2 | ikki
(2 rows)
```

Ustunlarning sukut bo'yicha nomlari `column1`, `column2`. Ularni `AS t(…)` bilan o'zgartirish mumkin.

### `WHERE` siz `UPDATE`

```sql
UPDATE ombor SET narx = 0;
```

```text
UPDATE 5
```

Buyruq xatosiz bajarilib, **hamma** narxni nolga aylantirdi. SQL "rostdan ham hammasinimi?" deb so'ramaydi.

## Dialektlar

### MySQL

**`INSERT`.** Ustun ro'yxatisiz qiymatlar soni ustunlar soniga **teng** bo'lishi shart. PostgreSQL'dagidek chapdan to'ldirish yo'q:

```sql
INSERT INTO ombor VALUES (3, 'Choy');
```

```text
ERROR 1136 (21S01) at line 4: Column count doesn't match value count at row 1
```

**Ko'p jadvalli `UPDATE`.** MySQL'da `FROM` yo'q. Birlashtirish `UPDATE` va `SET` orasida yoziladi. SQLite hujjatida ham shu farq tushuntirilgan:

```sql
UPDATE ombor o
JOIN (SELECT mahsulot_id, SUM(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) k USING (mahsulot_id)
SET o.soni = o.soni - k.jami;
```

```text
+-------------+--------+------+----------+
| mahsulot_id | nom    | soni | narx     |
+-------------+--------+------+----------+
|           1 | Non    |   85 |  4000.00 |
|           4 | Tuz    |   47 |  2000.00 |
|           5 | Shakar |   60 | 11000.00 |
+-------------+--------+------+----------+
```

Hujjatga ko'ra ko'p jadvalli `UPDATE` da qiymat berish tartibi **kafolatlanmaydi**. Bitta jadvalli `UPDATE` da esa odatda chapdan o'ngga.

**`ORDER BY` va `LIMIT`.** Bitta jadvalli `UPDATE` va `DELETE` da qatorlar tartibi va sonini cheklash mumkin. Ko'p jadvallisida mumkin emas:

```sql
UPDATE ombor SET narx = narx + 1 ORDER BY narx DESC LIMIT 1;
```

```text
|           5 | 11001.00 |
```

Eng qimmat bitta mahsulot yangilandi.

**Ko'p jadvalli `DELETE`.** O'chiriladigan jadval `DELETE` dan keyin yoziladi:

```sql
DELETE s FROM sotuvlar s JOIN ombor o USING (mahsulot_id) WHERE o.nom = 'Shakar';
```

**`NOT NULL` ustunni `NULL` ga yangilash.** Hujjatga ko'ra qat'iy rejimda bu xato beradi. Rejim o'chiq bo'lsa, ustunga tipning "yashirin" sukut bo'yicha qiymati yoziladi: 0, `''` yoki "nol" sana.

```text
ERROR 1048 (23000) at line 13: Column 'nom' cannot be null
```

**Qiymat o'zgarmasa, yangilanmaydi.** Hujjatga ko'ra ustunga uning joriy qiymati yozilsa, MySQL buni sezadi va qatorni yangilamaydi.

**`VALUES` va `TABLE` buyruqlari.** MySQL'da alohida `VALUES` bor, lekin har qator `ROW(…)` bilan yoziladi. Ustunlar `column_0`, `column_1`, … deb nomlanadi, ya'ni 0 dan boshlanadi. Oddiy qavslar ishlamaydi:

```sql
VALUES ROW(1, 'bir'), ROW(2, 'ikki');
VALUES (1, 'bir');
```

```text
+----------+----------+
| column_0 | column_1 |
+----------+----------+
|        1 | bir      |
|        2 | ikki     |
+----------+----------+
ERROR 1064 (42000) at line 15: … near '(1, 'bir')' at line 1
```

**Sinovda hujjatdan farq.** Hujjatga ko'ra `VALUES` ga `ORDER BY` "xuddi `SELECT` dagi kabi" qo'llanadi. Hujjat misol ham beradi: `ORDER BY column_1` natijani 1, 4, 5 tartibida chiqaradi. MySQL 9.7.2 da shu misol saralanmadi:

```sql
VALUES ROW(1,-2,3), ROW(5,7,9), ROW(4,6,8) ORDER BY column_1;
```

```text
+----------+----------+----------+
| column_0 | column_1 | column_2 |
+----------+----------+----------+
|        1 |       -2 |        3 |
|        5 |        7 |        9 |
|        4 |        6 |        8 |
+----------+----------+----------+
```

Subquery orqali esa saralash ishladi:

```sql
SELECT * FROM (VALUES ROW(1,'bir'), ROW(2,'ikki')) AS t ORDER BY column_0 DESC;
```

```text
+----------+----------+
| column_0 | column_1 |
+----------+----------+
|        2 | ikki     |
|        1 | bir      |
+----------+----------+
```

MySQL'da `TABLE jadval` buyrug'i ham bor. U `SELECT * FROM jadval` ning qisqa ko'rinishi:

```sql
TABLE ombor ORDER BY mahsulot_id LIMIT 2;
```

### SQLite

**`UPDATE … FROM`.** SQLite hujjatiga ko'ra u 3.33.0 dan beri bor va standartda yo'q. SQLite'ning amalga oshirilishi **PostgreSQL bilan mos** bo'lishga intiladi:

```text
SQLite-3.54 memory-> UPDATE ombor SET soni = soni - k.jami
                     FROM (SELECT mahsulot_id, sum(soni) AS jami FROM sotuvlar GROUP BY mahsulot_id) AS k
                     WHERE ombor.mahsulot_id = k.mahsulot_id;
SQLite-3.54 memory-> SELECT * FROM ombor;
1|Non|85
4|Tuz|47
5|Shakar|60
```

SQLite hujjati boshqa tizimlar bilan farqni ham ko'rsatadi:

- SQL Server'da maqsad jadval `FROM` da yana yoziladi;
- MySQL'da birlashtirish `UPDATE` va `SET` orasida bo'ladi.

**`DELETE … USING` yo'q.** Uning o'rnida subquery ishlatiladi:

```text
SQLite-3.54 memory-> DELETE FROM sotuvlar USING ombor WHERE sotuvlar.mahsulot_id = ombor.mahsulot_id;
Parse error near line 8: near "USING": syntax error
SQLite-3.54 memory-> DELETE FROM sotuvlar WHERE mahsulot_id IN (SELECT mahsulot_id FROM ombor WHERE nom = 'Shakar');
```

**`UPDATE`/`DELETE` da `ORDER BY … LIMIT`.** Hujjatga ko'ra ular faqat SQLite `SQLITE_ENABLE_UPDATE_DELETE_LIMIT` bilan yig'ilgan bo'lsa ishlaydi. Rasmiy `./configure` bilan yig'ilgan sinov versiyasida bu yo'q:

```text
SQLite-3.54 memory-> UPDATE ombor SET soni = 0 ORDER BY soni LIMIT 1;
Parse error near line 11: near "ORDER": syntax error
```

**`VALUES`.** `INSERT … DEFAULT VALUES` ishlaydi. Sinovda alohida `VALUES` ga `ORDER BY` qo'shib bo'lmadi:

```text
SQLite-3.54 memory-> VALUES (2, 'ikki'), (1, 'bir') ORDER BY 1;
Parse error near line 12: near "ORDER": syntax error
SQLite-3.54 memory-> CREATE TABLE d (a INT DEFAULT 7, b TEXT);
SQLite-3.54 memory-> INSERT INTO d DEFAULT VALUES;
SQLite-3.54 memory-> SELECT * FROM d;
7|
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `INSERT INTO t VALUES` (kam qiymat) | Chapdan to'ldiradi | Xato | — |
| `INSERT … DEFAULT VALUES` | Ha | Yo'q; o'rniga `INSERT INTO t VALUES ()` | Ha |
| Boshqa jadvalga tayangan `UPDATE` | `UPDATE … FROM` | `UPDATE t JOIN … SET` | `UPDATE … FROM` (3.33+) |
| Boshqa jadvalga tayangan `DELETE` | `DELETE … USING` | `DELETE t FROM t JOIN …` | Subquery |
| `UPDATE`/`DELETE` + `ORDER BY … LIMIT` | Yo'q | Bitta jadvalda | Faqat maxsus yig'ishda |
| Alohida `VALUES` | `VALUES (…)`, `column1…` | `VALUES ROW(…)`, `column_0…` | `VALUES (…)` |
| `NOT NULL` ga `NULL` (`UPDATE`) | Xato | Qat'iy rejimda xato | Xato |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `UPDATE`/`DELETE` ni `WHERE` siz yozish | Butun jadval o'zgaradi yoki o'chadi, ogohlantirishsiz | `WHERE` ni avval `SELECT` bilan sinash; muhim o'zgarishlarni tranzaksiyada qilish (50-bob) |
| `INSERT INTO t VALUES (…)` da ustunlarni sanamaslik | Jadvalga ustun qo'shilsa yoki tartib o'zgarsa, buyruq buziladi yoki noto'g'ri ustunga yozadi | Ustunlarni doim sanash |
| `UPDATE … FROM` da bitta maqsad qatoriga bir nechta mos qator | Qaysi biri ishlatilishi noma'lum, xato chiqmaydi | `FROM` da avval jamlash yoki subquery |
| Qatorni birlamchi kalitsiz shart bilan yangilash | Bir nechta qator o'zgarib ketishi mumkin | Kalit bo'yicha `WHERE` |
| Katta yuklashni ko'p sonli `INSERT` bilan qilish | Sekin | Ko'p qatorli `INSERT` yoki `COPY` (21-bob) |
| PostgreSQL `UPDATE … FROM` ni boshqa tizim uslubida yozish (maqsad jadvalni `FROM` da qayta yozish) | Jadval o'zi bilan birlashadi, natija noto'g'ri | Maqsad jadvalni `FROM` ga qo'shmaslik |
| MySQL'da ko'p jadvalli `UPDATE` da qiymatlar tartibiga tayanish | Hujjatga ko'ra tartib kafolatlanmaydi | Bitta `SET` da bir-biriga bog'liq qiymatlardan qochish |
| MySQL'da alohida `VALUES … ORDER BY` ga tayanish | 9.7.2 da saralamadi | Subquery orqali saralash |

## Amaliyot

1. `talabalar` jadvaliga uchta qatorni bitta `INSERT` bilan qo'shing. Keyin `INSERT INTO talabalar DEFAULT VALUES;` ni sinab, nima uchun xato berishini tushuntiring.
2. Hamma 1-kurs talabalarini 2-kursga o'tkazing. `UPDATE` necha qatorni o'zgartirdi?
3. `UPDATE` va `DELETE` ni avval `SELECT` bilan sinash odatini mashq qiling: `SELECT * FROM t WHERE …;` → natijani tekshirish → `DELETE FROM t WHERE …;`.
4. `baholar(talaba_id, ball)` jadvalini yarating. `talabalar` ga `ortacha_ball` ustunini qo'shib, uni `UPDATE … FROM` va jamlangan subquery bilan to'ldiring. Xuddi shuni MySQL'da `UPDATE … JOIN` bilan qiling.
5. `UPDATE … FROM` ga ataylab bir nechta mos qator beradigan holat yarating va natijani kuzating.
6. MySQL'da `UPDATE talabalar SET kurs = kurs + 1 ORDER BY id LIMIT 2;` ni bajaring. Xuddi shuni PostgreSQL'da subquery bilan qanday qilish mumkin?

## Rasmiy hujjat

- PostgreSQL — 6.1. Inserting Data: <https://www.postgresql.org/docs/18/dml-insert.html>
- PostgreSQL — 6.2. Updating Data: <https://www.postgresql.org/docs/18/dml-update.html>
- PostgreSQL — 6.3. Deleting Data: <https://www.postgresql.org/docs/18/dml-delete.html>
- PostgreSQL — UPDATE (`FROM`, Compatibility): <https://www.postgresql.org/docs/18/sql-update.html>
- PostgreSQL — DELETE (`USING`): <https://www.postgresql.org/docs/18/sql-delete.html>
- PostgreSQL — VALUES: <https://www.postgresql.org/docs/18/sql-values.html>
- MySQL — 15.2.7 INSERT Statement: <https://dev.mysql.com/doc/refman/9.7/en/insert.html>
- MySQL — 15.2.7.1 INSERT ... SELECT Statement: <https://dev.mysql.com/doc/refman/9.7/en/insert-select.html>
- MySQL — 15.2.17 UPDATE Statement: <https://dev.mysql.com/doc/refman/9.7/en/update.html>
- MySQL — 15.2.2 DELETE Statement: <https://dev.mysql.com/doc/refman/9.7/en/delete.html>
- MySQL — 15.2.19 VALUES Statement: <https://dev.mysql.com/doc/refman/9.7/en/values.html>
- SQLite — INSERT: <https://www.sqlite.org/lang_insert.html>
- SQLite — UPDATE (`UPDATE FROM`): <https://www.sqlite.org/lang_update.html>
- SQLite — DELETE: <https://www.sqlite.org/lang_delete.html>
