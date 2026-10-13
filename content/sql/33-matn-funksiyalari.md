# 33 — Matn funksiyalari

[← Oldingi: Shartli ifodalar](32-shartli-ifodalar.md) · [Mundarija](README.md) · [Keyingi: Sana funksiyalari →](34-sana-funksiyalari.md)

## Tushuncha

Matn (satr) bilan ishlash funksiyalari uch tizimda eng ko'p farq qiladigan joylardan biri. Bir xil nomli funksiya boshqa narsa qaytarishi (`length`), bir xil belgi boshqa amal bo'lishi (`||`) mumkin. Bu bobda eng ko'p ishlatiladigan funksiyalar va ularning farqlari.

PostgreSQL hujjatiga ko'ra satr funksiyalari `character`, `character varying` va `text` tiplari bilan ishlaydi. `character` (qat'iy uzunlikli `char(n)`) qiymatlari funksiyaga berilishdan oldin `text` ga o'giriladi va **oxiridagi bo'shliqlar olib tashlanadi** (7-bob).

### Satrlarni ulash: `||` va `concat()`

Standart SQL'da satrlarni ulash operatori — `||`. Lekin `NULL` bilan ikki yo'l bir xil ishlamaydi:

| | `NULL` argument | Hujjat |
| --- | --- | --- |
| `a \|\| b` | Natija `NULL` | `NULL` bilan har qanday amal `NULL` (10-bob) |
| PostgreSQL / SQLite `concat(a, b, …)` | `NULL` **tashlab yuboriladi** | PG: "NULL arguments are ignored" |
| MySQL `CONCAT(a, b, …)` | Natija **`NULL`** | MySQL: "returns NULL if any argument is NULL" |
| `concat_ws(ajratuvchi, a, b, …)` | `NULL` tashlab yuboriladi (uchala tizimda) | Ajratuvchi `NULL` bo'lsa — natija `NULL` |

Ya'ni `concat()` — bir nomli, lekin PostgreSQL/SQLite va MySQL'da **teskari** xatti-harakat.

PostgreSQL'da `||` satr bo'lmagan qiymatni ham qabul qiladi — kamida bitta tomon satr bo'lsa, ikkinchisi matnga o'giriladi: `'Qiymat: ' || 42` → `Qiymat: 42`.

**MySQL'da `||` — mantiqiy `OR`.** MySQL hujjatining "Logical Operators" bo'limiga ko'ra `||` — `OR` ning sinonimi. Faqat `PIPES_AS_CONCAT` SQL rejimi yoqilganda u standart ulash operatori bo'ladi. `OR` ma'nosidagi `||` **eskirgan** (deprecated) va kelajakda olib tashlanadi. 1-bobda bu tuzoq qisqa ko'rsatilgan edi; bu yerda to'liq.

### Uzunlik: belgi yoki bayt

UTF-8 da bitta belgi 1 dan 4 baytgacha oladi (11-bob). O'zbek lotin yozuvidagi `ʻ` (U+02BB) — 2 bayt.

| | Belgilar soni | Baytlar soni |
| --- | --- | --- |
| PostgreSQL | `length`, `char_length` | `octet_length` |
| MySQL | `CHAR_LENGTH` | **`LENGTH`**, `OCTET_LENGTH` |
| SQLite | `length` | `octet_length` |

MySQL hujjatiga ko'ra `LENGTH()` uzunlikni **baytlarda** o'lchaydi: ikki baytli beshta belgi uchun `LENGTH()` 10, `CHAR_LENGTH()` 5 qaytaradi. PostgreSQL va SQLite'da `length` — belgilar soni. Ya'ni `length` ham bir nomli, lekin turli ma'noli.

### Asosiy funksiyalar

| Vazifa | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Katta / kichik harf | `upper`, `lower` | `UPPER`, `LOWER` | `upper`, `lower` (**faqat ASCII**) |
| Bo'shliqlarni olish | `trim`, `ltrim`, `rtrim`, `btrim` | `TRIM`, `LTRIM`, `RTRIM` | `trim`, `ltrim`, `rtrim` |
| Qism satr | `substring(s FROM n FOR k)`, `substr` | `SUBSTRING`, `SUBSTR` | `substr`, `substring` |
| Boshidan / oxiridan n ta | `left`, `right` | `LEFT`, `RIGHT` | Yo'q (`substr`) |
| Topish | `position(x IN s)`, `strpos` | `POSITION`, `LOCATE`, `INSTR` | `instr` |
| Almashtirish | `replace` | `REPLACE` | `replace` |
| To'ldirish | `lpad`, `rpad` | `LPAD`, `RPAD` | Yo'q (`printf`/`format`) |
| Ajratuvchi bo'yicha bo'lak | `split_part` | `SUBSTRING_INDEX` | Yo'q (`substr` + `instr`) |

Pozitsiyalar uchala tizimda **1 dan** boshlanadi. Topilmasa `position`/`instr` 0 qaytaradi.

SQLite hujjatiga ko'ra o'rnatilgan `lower()`/`upper()` **faqat ASCII** harflar uchun ishlaydi; boshqa harflar uchun ICU kengaytmasini yuklash kerak.

### Regex funksiyalari

23-bobda regex **operatorlari** (`~`, `REGEXP`) ko'rildi. Bu yerda regex bilan matnni **o'zgartiradigan va ajratadigan** funksiyalar:

| Vazifa | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Almashtirish | `regexp_replace(s, p, r [, flags])` | `REGEXP_REPLACE(s, p, r [, pos [, occ [, type]]])` | Yo'q |
| Mos qismni olish | `regexp_substr` (PG 15+), `regexp_match` | `REGEXP_SUBSTR` | Yo'q |
| Mos kelishlar soni | `regexp_count` | Yo'q | Yo'q |
| Mos kelish pozitsiyasi | `regexp_instr` | `REGEXP_INSTR` | Yo'q |

**Diqqat — almashtirish soni teskari:**

- PostgreSQL hujjatiga ko'ra `regexp_replace` sukut bo'yicha **faqat birinchi** mosni almashtiradi; hammasini almashtirish uchun `'g'` bayrog'i (flag) kerak;
- MySQL hujjatiga ko'ra `REGEXP_REPLACE` da `occurrence` sukut bo'yicha 0 — **hammasini** almashtiradi.

MySQL regex'i ICU kutubxonasiga, PostgreSQL'niki POSIX regex'iga asoslangan — sintaksis tafsilotlari farq qilishi mumkin.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

```sql
CREATE TABLE odamlar (
    id int PRIMARY KEY, ism varchar(30), familiya varchar(30),
    otasining varchar(30), email varchar(50), telefon varchar(30)
);
INSERT INTO odamlar VALUES
    (1, 'Ali', 'Valiyev', 'Karimovich', 'ali.valiyev@misol.uz', '+998 90 123-45-67'),
    (2, 'Oʻgʻiloy', 'Sobirova', NULL, 'OGILOY@Misol.UZ', '(90) 765 43 21'),
    (3, '  Jasur  ', 'Tursunov', NULL, NULL, '901112233');
```

`otasining` ikki qatorda `NULL`; `Jasur` atrofida bo'shliq; `Oʻgʻiloy` da ikki baytli `ʻ` belgisi. Natijalar PostgreSQL'dan.

### `||`, `concat` va `concat_ws`

```sql
SELECT id, ism || ' ' || familiya AS toliq,
           ism || ' ' || otasining AS ota_bilan
FROM odamlar ORDER BY id;

SELECT id, concat(ism, ' ', otasining) AS c,
           concat_ws(' ', familiya, ism, otasining) AS cw
FROM odamlar ORDER BY id;
```

```text
 id |       toliq        |   ota_bilan    
----+--------------------+----------------
  1 | Ali Valiyev        | Ali Karimovich
  2 | Oʻgʻiloy Sobirova  | 
  3 |   Jasur   Tursunov | 
(3 rows)

 id |       c        |           cw           
----+----------------+------------------------
  1 | Ali Karimovich | Valiyev Ali Karimovich
  2 | Oʻgʻiloy       | Sobirova Oʻgʻiloy
  3 |   Jasur        | Tursunov   Jasur  
(3 rows)
```

- `||`: `otasining` `NULL` — butun natija `NULL`.
- `concat`: `NULL` tashlandi, lekin uning oldidagi `' '` qoldi (`'Oʻgʻiloy '`).
- `concat_ws`: `NULL` va uning ajratuvchisi tashlandi — ism uchun eng qulay.

### Uzunlik

```sql
SELECT id, length(ism) AS len, char_length(ism) AS chr, octet_length(ism) AS bayt
FROM odamlar ORDER BY id;
```

```text
 id | len | chr | bayt 
----+-----+-----+------
  1 |   3 |   3 |    3
  2 |   8 |   8 |   10
  3 |   9 |   9 |    9
(3 rows)
```

`Oʻgʻiloy` — 8 belgi, 10 bayt (ikkita `ʻ` 2 baytdan). `Jasur` — atrofidagi bo'shliqlar bilan 9.

### `trim`, `upper`, `lower`

```sql
SELECT id, '[' || trim(ism) || ']' AS t, upper(familiya) AS katta, lower(email) AS kichik
FROM odamlar ORDER BY id;
```

```text
 id |     t      |  katta   |        kichik        
----+------------+----------+----------------------
  1 | [Ali]      | VALIYEV  | ali.valiyev@misol.uz
  2 | [Oʻgʻiloy] | SOBIROVA | ogiloy@misol.uz
  3 | [Jasur]    | TURSUNOV | 
(3 rows)
```

Email'ni taqqoslashdan oldin `lower()` bilan bir xil ko'rinishga keltirish — tipik ishlatilish (masalan, `WHERE lower(email) = lower($1)`; bunday so'rov uchun indeks — 43-bob).

### Qism satr, topish, almashtirish

```sql
SELECT id, substring(familiya, 1, 3) AS bosh, left(familiya, 3) AS chap,
           right(familiya, 2) AS ong, replace(familiya, 'ov', 'OV') AS alm
FROM odamlar ORDER BY id;

SELECT id, position('@' IN email) AS pos,
           substring(email, 1, position('@' IN email) - 1) AS login
FROM odamlar ORDER BY id;

SELECT id, split_part(email, '@', 2) AS domen FROM odamlar ORDER BY id;
```

```text
 id | bosh | chap | ong |   alm    
----+------+------+-----+----------
  1 | Val  | Val  | ev  | Valiyev
  2 | Sob  | Sob  | va  | SobirOVa
  3 | Tur  | Tur  | ov  | TursunOV
(3 rows)

 id | pos |    login    
----+-----+-------------
  1 |  12 | ali.valiyev
  2 |   7 | OGILOY
  3 |     | 
(3 rows)

 id |  domen   
----+----------
  1 | misol.uz
  2 | Misol.UZ
  3 | 
(3 rows)
```

`replace` katta-kichik harfni farqlaydi: `Valiyev` da kichik `ov` yo'q (`ev` bilan tugaydi), shuning uchun o'zgarmadi.

### `lpad`: kod yasash

```sql
SELECT id, lpad(CAST(id AS varchar), 5, '0') AS kod FROM odamlar ORDER BY id;
```

```text
 id |  kod  
----+-------
  1 | 00001
  2 | 00002
  3 | 00003
(3 rows)
```

Hujjatga ko'ra satr berilgan uzunlikdan uzun bo'lsa, `lpad` uni **o'ngdan kesadi**.

### Regex: telefon raqamini tozalash

```sql
SELECT id, regexp_replace(telefon, '[^0-9]', '', 'g') AS raqamlar FROM odamlar ORDER BY id;
SELECT id, regexp_count(telefon, '[0-9]') AS soni FROM odamlar ORDER BY id;
SELECT id, regexp_substr(email, '[a-z]+', 1, 2, 'i') AS ikkinchi FROM odamlar ORDER BY id;
```

```text
 id |   raqamlar   
----+--------------
  1 | 998901234567
  2 | 907654321
  3 | 901112233
(3 rows)

 id | soni 
----+------
  1 |   12
  2 |    9
  3 |    9
(3 rows)

 id | ikkinchi 
----+----------
  1 | valiyev
  2 | Misol
  3 | 
(3 rows)
```

- `[^0-9]` — raqam bo'lmagan har qanday belgi; `'g'` — hammasini almashtirish.
- `regexp_substr(…, 1, 2, 'i')` — 1-pozitsiyadan, **ikkinchi** mos kelish, katta-kichik harfga qaramay (`i`).

## Dialektlar

### MySQL

**`||` — `OR`.** Sukut bo'yicha rejimda satrlar songa o'giriladi va "yoki" hisoblanadi:

```sql
SELECT id, ism || ' ' || familiya AS toliq FROM odamlar ORDER BY id;
SHOW WARNINGS;
```

```text
+----+-------+
| id | toliq |
+----+-------+
|  1 |     0 |
|  2 |     0 |
|  3 |     0 |
+----+-------+
| Warning | 1287 | '|| as a synonym for OR' is deprecated and will be removed in a future release. Please use OR instead |
| Warning | 1292 | Truncated incorrect DOUBLE value: 'Ali'                                                               |
…
```

Xato yo'q — faqat ogohlantirishlar, natija esa uchta `0`. `PIPES_AS_CONCAT` yoqilsa — standart ulash (natija PostgreSQL bilan bir xil, `NULL` bilan ham):

```sql
SET SESSION sql_mode = CONCAT(@@sql_mode, ',PIPES_AS_CONCAT');
```

Lekin rejim sessiyaga bog'liq — ilova kodini unga tayantirish xavfli. MySQL'da ishonchli yo'l — `CONCAT`/`CONCAT_WS`.

**`CONCAT` — `NULL` bo'lsa `NULL`:**

```sql
SELECT id, CONCAT(ism, ' ', otasining) AS ota_bilan,
           CONCAT_WS(' ', familiya, ism, otasining) AS cw
FROM odamlar ORDER BY id;
```

```text
+----+----------------+------------------------+
| id | ota_bilan      | cw                     |
+----+----------------+------------------------+
|  1 | Ali Karimovich | Valiyev Ali Karimovich |
|  2 | NULL           | Sobirova Oʻgʻiloy      |
|  3 | NULL           | Tursunov   Jasur       |
+----+----------------+------------------------+
```

PostgreSQL'da `Oʻgʻiloy`, MySQL'da `NULL` — bir xil `concat` chaqiruvi. `CONCAT_WS` esa uchala tizimda bir xil.

**`LENGTH` — baytlar:**

```text
+----+------+------+
| id | len  | chr  |
+----+------+------+
|  1 |    3 |    3 |
|  2 |   10 |    8 |
|  3 |    9 |    9 |
+----+------+------+
```

**`SUBSTRING_INDEX` (`split_part` yo'q).** Hujjatga ko'ra `SUBSTRING_INDEX(s, ajratuvchi, n)`: `n` musbat bo'lsa — chapdan `n`-ajratuvchigacha, manfiy bo'lsa — o'ngdan:

```sql
SELECT id, SUBSTRING_INDEX(email, '@', -1) AS domen, SUBSTRING_INDEX(email, '@', 1) AS login
FROM odamlar ORDER BY id;
```

```text
+----+----------+-------------+
| id | domen    | login       |
+----+----------+-------------+
|  1 | misol.uz | ali.valiyev |
|  2 | Misol.UZ | OGILOY      |
|  3 | NULL     | NULL        |
+----+----------+-------------+
```

**Regex.** `REGEXP_REPLACE(telefon, '[^0-9]', '')` bayroqsiz **hammasini** almashtirdi (natija PostgreSQL'dagi `'g'` bilan bir xil). `REGEXP_SUBSTR(email, '[a-z]+', 1, 2, 'i')` — bir xil natija. `regexp_count` va `split_part` yo'q:

```text
ERROR 1305 (42000) at line 10: FUNCTION qollanma.split_part does not exist
ERROR 1305 (42000) at line 11: FUNCTION qollanma.regexp_count does not exist
```

`POSITION`, `LPAD` (son argumentni o'zi satrga o'giradi), `LEFT`, `RIGHT` — PostgreSQL bilan bir xil natija.

### SQLite

**`||` va `concat`/`concat_ws`** — PostgreSQL bilan bir xil. SQLite hujjatiga ko'ra `concat()` `NULL` argumentlarni tashlaydi; hammasi `NULL` bo'lsa — bo'sh satr.

**`length` — belgilar.** Hujjatga ko'ra `length(X)` satrdagi Unicode kod nuqtalari sonini qaytaradi, baytlarni emas: `Oʻgʻiloy` → 8, `octet_length` → 10. `char_length` yo'q (`no such function: char_length`).

**`upper`/`lower` — faqat ASCII.** Hujjatdagi qoida sinovda ham ko'rindi:

```sql
SELECT upper('ўзбек тили'), lower('ÇAĞ');
```

```text
-- SQLite                 -- PostgreSQL / MySQL
ўзбек тили|ÇaĞ            ЎЗБЕК ТИЛИ | çağ
```

Kirill harflari o'zgarmadi, `ÇAĞ` dan faqat ASCII `A` kichraydi. O'zbek lotin yozuvining ASCII harflari (`oʻgʻiloy` → `OʻGʻILOY`) to'g'ri ishlaydi, chunki `ʻ` ning katta-kichigi yo'q.

**Yo'q funksiyalar va o'rniga:**

| Kerak | SQLite'da |
| --- | --- |
| `left(s, n)` | `substr(s, 1, n)` |
| `position('@' IN s)` | `instr(s, '@')` |
| `split_part(s, '@', 2)` | `substr(s, instr(s, '@') + 1)` |
| `lpad(id, 5, '0')` | `printf('%05d', id)` |
| `regexp_replace` | Yo'q; oddiy holatlar uchun ichma-ich `replace` |

```sql
SELECT id, substr(email, instr(email, '@') + 1) AS domen FROM odamlar ORDER BY id;
SELECT id, printf('%05d', id) AS kod FROM odamlar ORDER BY id;
SELECT id, replace(replace(replace(replace(replace(telefon,' ',''),'-',''),'(',''),')',''),'+','') AS raqamlar
FROM odamlar ORDER BY id;
```

Natijalar PostgreSQL'dagi `split_part`, `lpad`, `regexp_replace` bilan bir xil chiqdi. `position(x IN s)` sintaksisi SQLite'da yo'q — tahlilchi uni boshqacha o'qib, `no such table: email` xatosini berdi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `a \|\| b` | Ulash | **`OR`** (eskirgan); `PIPES_AS_CONCAT` da ulash | Ulash |
| `concat(…, NULL, …)` | `NULL` tashlanadi | **`NULL`** | `NULL` tashlanadi |
| `concat_ws` | Ha | Ha | Ha |
| `length('Oʻgʻiloy')` | 8 (belgi) | **10 (bayt)** | 8 (belgi) |
| Belgilar soni | `length`, `char_length` | `CHAR_LENGTH` | `length` |
| `upper`/`lower` Unicode | Ha | Ha | Faqat ASCII |
| `left`/`right`, `lpad`/`rpad` | Ha | Ha | Yo'q |
| Bo'lak | `split_part` | `SUBSTRING_INDEX` | `substr` + `instr` |
| `regexp_replace` sukut | **Birinchi** mos (`'g'` — hammasi) | **Hammasi** | Yo'q |
| `regexp_count` | Ha | Yo'q | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| MySQL'da `||` bilan ulash | Jimgina `0`, faqat ogohlantirish | `CONCAT` / `CONCAT_WS` |
| `concat` `NULL` ni tashlaydi deb MySQL'da ishlatish | Butun natija `NULL` | `CONCAT_WS` yoki `COALESCE` |
| `||` bilan `NULL` bo'lishi mumkin ustunni ulash | Butun natija `NULL` | `concat_ws` yoki `COALESCE(x, '')` |
| MySQL'da `LENGTH` ni belgilar soni deb o'ylash | Baytlar qaytadi; ko'p baytli matnda farq qiladi | `CHAR_LENGTH` |
| `varchar(n)` chegarasini baytda hisoblash | `n` — belgilar (PG, MySQL) | 7-bob |
| SQLite'da kirill matnni `upper`/`lower` | O'zgarmaydi | ICU kengaytmasi yoki ilovada |
| PostgreSQL'da `regexp_replace` ni `'g'` siz | Faqat birinchi mos almashtiriladi | `'g'` bayrog'i |
| MySQL'dan PostgreSQL'ga `REGEXP_REPLACE` ni ko'chirish | Natija o'zgaradi (hammasi → birinchi) | `'g'` qo'shish |
| `replace` katta-kichik harfga qaramaydi deb o'ylash | Faqat aynan mos keladi | Avval `lower()` yoki regex `'i'` |

## Amaliyot

1. Har odam uchun "Familiya I. O." ko'rinishidagi qisqa ismni chiqaring (`otasining` bo'lmasa, faqat "Familiya I."). Uchala tizimda ishlaydigan qilib yozing.
2. Email'lardan domenni ajratib, har domendagi odamlar sonini hisoblang (domenni kichik harfga keltirib).
3. Telefon raqamlarini faqat raqamlarga keltiring va `+998` bilan boshlanmaganlariga `998` qo'shing.
4. MySQL'da `SELECT 'a' || 'b';` ni sukut rejimida va `PIPES_AS_CONCAT` bilan ishga tushiring. Ogohlantirishlarni o'qing.
5. `SELECT length('Oʻzbekiston'), octet_length('Oʻzbekiston');` ni uchala tizimda bajaring (MySQL'da `CHAR_LENGTH` va `LENGTH`). Natijalarni tushuntiring.

## Rasmiy hujjat

- PostgreSQL — 9.4. String Functions and Operators: <https://www.postgresql.org/docs/18/functions-string.html>
- PostgreSQL — 9.7.3. POSIX Regular Expressions (`regexp_replace`, `regexp_substr`, `regexp_count`): <https://www.postgresql.org/docs/18/functions-matching.html>
- MySQL — 14.8 String Functions and Operators: <https://dev.mysql.com/doc/refman/9.7/en/string-functions.html>
- MySQL — 14.4.3 Logical Operators (`||` va `PIPES_AS_CONCAT`): <https://dev.mysql.com/doc/refman/9.7/en/logical-operators.html>
- MySQL — 14.8.2 Regular Expressions: <https://dev.mysql.com/doc/refman/9.7/en/regexp.html>
- SQLite — Built-In Scalar SQL Functions: <https://www.sqlite.org/lang_corefunc.html>
- SQLite — SQL Language Expressions (`||` operatori): <https://www.sqlite.org/lang_expr.html>
