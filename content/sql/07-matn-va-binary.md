# 07 — Matn va binary

[← Oldingi: Raqamlar](06-raqamlar.md) · [Mundarija](README.md) · [Keyingi: Sana va vaqt →](08-sana-va-vaqt.md)

## Tushuncha

Satrlar ikki xil bo'ladi:

- **Matnli satr** (*character string*) — belgilar ketma-ketligi: ism, manzil, izoh. Uning baytlari bazaning **kodlashiga** (masalan, UTF-8) mos bo'lishi shart. Solishtirish va tartiblash tilga bog'liq qoidalar bilan bajariladi (11-bob).
- **Binary satr** (*binary string*) — oddiy **baytlar** ketma-ketligi: rasm, PDF, shifrlangan ma'lumot. Unda istalgan bayt, jumladan noldan iborat bayt ham bo'lishi mumkin. Amallar baytlarning o'zi ustida bajariladi.

PostgreSQL hujjatining qisqa xulosasi: dasturchi "xom baytlar" deb biladigan ma'lumot uchun binary satr, **matn** uchun esa matnli satr.

### Standartdagi matn tiplari

SQL standartida ikkita asosiy matn tipi bor. Ikkalasida ham `n` — **belgilar** soni, bayt emas:

| Tip | Qisqa nomi | Ma'nosi |
| --- | --- | --- |
| `character varying(n)` | `varchar(n)` | O'zgaruvchan uzunlik, eng ko'pi `n` belgi |
| `character(n)` | `char(n)` | Qat'iy uzunlik: qisqa qiymat **probellar bilan** `n` gacha to'ldiriladi |

Standart talab qiladigan qoidalar:

- uzun qiymat yozilsa — **xato**. Faqat ortiqcha qism butunlay **probellardan** iborat bo'lsa, ular jimgina kesiladi. Hujjat buni "biroz g'alati" deydi, lekin standart shunday;
- qiymat **aniq** `CAST` bilan `varchar(n)` ga o'girilsa, ortig'i xatosiz kesiladi.

### PostgreSQL'da `text`

PostgreSQL'da yana bir tip bor — `text`. U istalgan uzunlikdagi satrni saqlaydi. `text` standartda yo'q, lekin boshqa ko'p tizimlarda bor. U PostgreSQL'ning "ona" matn tipi: satr funksiyalarining aksariyati `text` qabul qiladi va qaytaradi. `varchar` deyarli `text` ustiga qo'yilgan cheklovdek ishlaydi.

Uzunliklar:

- `varchar(n)` va `char(n)` da `n` 1 dan 10 485 760 gacha;
- uzunliksiz `varchar` — istalgan uzunlik;
- uzunliksiz `char` — `char(1)`;
- eng uzun satr taxminan **1 GB**.

**Qaysi birini tanlash kerak.** Hujjatdagi maslahat:

> Bu uch tip o'rtasida tezlik farqi **yo'q**. Faqat `char(n)` probellar uchun qo'shimcha joy egallaydi, cheklangan ustunga yozishda esa uzunlik tekshiruvi bir necha protsessor taktini oladi. Ba'zi boshqa tizimlarda `char(n)` tezroq bo'lishi mumkin, PostgreSQL'da esa unday emas. Aslida `char(n)` ko'pincha **eng sekini**. Ko'p holatda `text` yoki `varchar` ishlatish kerak.

Yana bir maslahat: aniq yuqori chegara kerak bo'lmasa, uzunlikni o'ylab topmang. `text` yoki uzunliksiz `varchar` ishlating.

**`char(n)` ning xususiyatlari:**

- qiymat diskda probellar bilan to'ldirilib saqlanadi;
- ikki `char` qiymatini solishtirganda oxiridagi probellar **hisobga olinmaydi**;
- `char` boshqa matn tipiga o'tkazilganda oxiridagi probellar **olib tashlanadi**.

`varchar` va `text` da esa oxiridagi probellar ma'noga ega.

**Saqlash.** 126 baytgacha bo'lgan satr "1 bayt + satrning o'zi" joy oladi, undan uzuni "4 bayt + satr". Uzun satrlar avtomatik **siqiladi**. Juda uzunlari esa alohida fon jadvallarida saqlanadi, shuning uchun qisqa ustunlarga murojaatni sekinlashtirmaydi.

**Nol bayt.** Matnli ustunlarga kodi nol bo'lgan belgini (NUL) saqlab bo'lmaydi. Kodlash qanday bo'lishidan qat'i nazar.

### Binary: `bytea` va `BLOB`

PostgreSQL'da binary tip `bytea` deyiladi. Standartda uning o'rnida `BLOB` (*BINARY LARGE OBJECT*) bor. Hujjatga ko'ra ularning kiritish formati boshqa, lekin funksiya va operatorlari asosan bir xil.

`bytea` sukut bo'yicha **hex** formatida chiqariladi. Har bayt ikki o'n oltilik raqam bilan yoziladi, boshida `\x` turadi: `\x53616c6f6d`.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `char`, `varchar`, `text`

```sql
CREATE TABLE matnlar (c char(4), v varchar(5), t text);
INSERT INTO matnlar VALUES ('ok', 'ok', 'ok');
INSERT INTO matnlar (v) VALUES ('juda uzun');
INSERT INTO matnlar (v) VALUES ('salom   ');
INSERT INTO matnlar (v) VALUES ('juda uzun'::varchar(5));
```

```text
INSERT 0 1
ERROR:  value too long for type character varying(5)
INSERT 0 1
INSERT 0 1
```

- `'juda uzun'` (9 belgi) `varchar(5)` ga sig'madi — xato.
- `'salom   '` ham 8 belgi, lekin ortiqcha qismi faqat probellar. Standart bo'yicha ular jimgina kesildi.
- `::varchar(5)` bilan aniq o'girilganda ortiqcha qism xatosiz kesildi.

```sql
SELECT '(' || c || ')' AS c, char_length(c) AS c_uzunlik,
       '(' || v || ')' AS v, octet_length(v) AS bayt
FROM matnlar;
```

```text
  c   | c_uzunlik |    v    | bayt 
------+-----------+---------+------
 (ok) |         2 | (ok)    |    2
      |           | (salom) |    5
      |           | (juda ) |    5
(3 rows)
```

`char(4)` dagi `'ok'` diskda `'ok  '` bo'lib saqlangan. Lekin `||` bilan ulash uchun `text` ga o'tkazilganda oxiridagi probellar olib tashlandi, uzunligi ham 2 chiqdi.

```sql
SELECT 'ab'::char(4) = 'ab  '::char(4) AS char_teng,
       'ab'::varchar = 'ab  '::varchar AS varchar_teng;
```

```text
 char_teng | varchar_teng 
-----------+--------------
 t         | f
(1 row)
```

`char` da oxiridagi probellar hisobga olinmaydi, `varchar` da esa ular ma'noga ega.

### Belgi va bayt

`n` — belgilar soni. Lekin UTF-8 da bitta belgi bir nechta bayt bo'lishi mumkin:

```sql
SELECT char_length('Oʻzbekiston') AS belgi, octet_length('Oʻzbekiston') AS bayt;
```

```text
 belgi | bayt 
-------+------
    11 |   12
(1 row)
```

`ʻ` (o'zbek lotin yozuvidagi tutuq belgisi, U+02BB) UTF-8 da 2 bayt. Shuning uchun 11 belgi 12 bayt bo'ldi.

Bu belgi oddiy tirnoqqa (`'`) o'xshasa ham, **boshqa belgi**:

```sql
SELECT 'O''zbek' = 'Oʻzbek' AS bir_xilmi;
```

```text
 bir_xilmi 
-----------
 f
(1 row)
```

Ilova bir joyda `'`, boshqa joyda `ʻ` yozsa, qidiruv natija bermaydi.

### Nol bayt

```sql
SELECT E'a\000b';
```

```text
ERROR:  invalid byte sequence for encoding "UTF8": 0x00
```

### `bytea`

```sql
CREATE TABLE fayllar (nom text, mazmun bytea);
INSERT INTO fayllar VALUES ('salom.txt', 'Salom'::bytea), ('nol', '\x00ff10'::bytea);
SELECT nom, mazmun, length(mazmun) AS bayt FROM fayllar;
```

```text
    nom    |    mazmun    | bayt 
-----------+--------------+------
 salom.txt | \x53616c6f6d |    5
 nol       | \x00ff10     |    3
(2 rows)
```

`'Salom'` baytlari hex ko'rinishida chiqdi. Ikkinchi qatorda nol bayt bemalol saqlandi.

Binary satr baytlarni solishtiradi va matn funksiyalarini bilmaydi:

```sql
SELECT 'Salom'::bytea = 'salom'::bytea AS teng;
SELECT upper('Salom'::bytea);
```

```text
 teng 
------
 f
(1 row)

ERROR:  function upper(bytea) does not exist
```

## Dialektlar

### MySQL

**`CHAR` va `VARCHAR`.** Ulardagi qoidalar:

- `CHAR(n)` da `n` 0 dan 255 gacha. Saqlashda probellar bilan to'ldiriladi, o'qishda esa oxiridagi probellar **olib tashlanadi**. Bundan istisno — `PAD_CHAR_TO_FULL_LENGTH` rejimi;
- `VARCHAR(n)` da `n` 0 dan 65 535 gacha. Lekin haqiqiy chegara **qator hajmiga** (65 535 bayt, barcha ustunlar uchun umumiy) va kodlashga bog'liq;
- `VARCHAR` oxiridagi probellarni saqlaydi va qaytaradi. Hujjat buni standartga mos deydi.

```sql
CREATE TABLE matnlar (c CHAR(4), v VARCHAR(5), t TEXT);
INSERT INTO matnlar VALUES ('ab  ', 'ab  ', 'ab  ');
SELECT CONCAT('(', c, ')') AS c, CONCAT('(', v, ')') AS v, CONCAT('(', t, ')') AS t FROM matnlar;
```

```text
+------+---------+--------+
| c    | v       | t      |
+------+---------+--------+
| (ab) | (ab  )  | (ab  ) |
+------+---------+--------+
```

**Uzun qiymat** `sql_mode` ga bog'liq. Qat'iy rejimda xato, aks holda qiymat kesilib, ogohlantirish beriladi. Ortiqcha **probellar** esa har qanday rejimda kesiladi:

```text
ERROR 1406 (22001) at line 3: Data too long for column 'v' at row 1
| Note  | 1265 | Data truncated for column 'v' at row 1 |
```

**Oxiridagi probellar bilan solishtirish.** Hujjatga ko'ra MySQL collation'larida `PAD SPACE` atributi bor: solishtirishda oxiridagi probellar hisobga olinmaydi. Lekin UCA 9.0.0 va undan yangi Unicode collation'larida `NO PAD` atributi bor. MySQL 9.7 dagi sukut bo'yicha `utf8mb4_0900_ai_ci` aynan shunday:

```sql
SELECT 'ab' = 'ab  ' AS teng;
SELECT 'Salom' = 'salom' AS katta_kichik;
```

```text
+------+
| teng |
+------+
|    0 |
+------+
+--------------+
| katta_kichik |
+--------------+
|            1 |
+--------------+
```

Ikkinchi natijaga e'tibor bering: sukut bo'yicha collation **katta-kichik harfni farqlamaydi** (`_ci` — *case-insensitive*). PostgreSQL'da `'Salom' = 'salom'` yolg'on bo'ladi. Collation'lar 11-bobda batafsil ko'riladi.

**`TEXT` va `BLOB` oilalari.** MySQL'da `TEXT` to'rt o'lchamda bo'ladi. Ular `BLOB` oilasiga mos keladi:

| Matn | Binary | Eng ko'p hajm |
| --- | --- | --- |
| `TINYTEXT` | `TINYBLOB` | 2⁸ − 1 bayt (255) |
| `TEXT` | `BLOB` | 2¹⁶ − 1 bayt (~64 KB) |
| `MEDIUMTEXT` | `MEDIUMBLOB` | 2²⁴ − 1 bayt (~16 MB) |
| `LONGTEXT` | `LONGBLOB` | 2³² − 1 bayt (~4 GB) |

Chegara **baytlarda**. `utf8mb4` da bitta belgi 4 baytgacha bo'lgani uchun `TEXT` ga 65 535 belgidan ancha kam sig'ishi mumkin.

`TEXT`/`BLOB` ning `VARCHAR`/`VARBINARY` dan farqlari (hujjat bo'yicha):

- ularga indeks qo'yishda **prefiks uzunligini** ko'rsatish shart (43-bob);
- ularga `DEFAULT` qiymat berib bo'lmaydi;
- qator hajmiga faqat 9–12 bayt qo'shadi, chunki mazmuni alohida saqlanadi.

```sql
CREATE TABLE b (x BLOB DEFAULT 'a');
```

```text
ERROR 1101 (42000) at line 11: BLOB, TEXT, GEOMETRY or JSON column 'x' can't have a default value
```

**Qator hajmi 65 535 bayt.** Ikkita katta `VARCHAR` ustun:

```sql
CREATE TABLE katta (a VARCHAR(16000), b VARCHAR(16000));
```

```text
ERROR 1118 (42000) at line 10: Row size too large. The maximum row size for the used table type, not counting BLOBs, is 65535. This includes storage overhead, check the manual. You have to change some columns to TEXT or BLOBs
```

`utf8mb4` da 16 000 belgi 64 000 baytgacha yetishi mumkin. Ikkalasi birga chegaradan oshdi. PostgreSQL'da bunday umumiy chegara yo'q.

**`BINARY` va `VARBINARY`** — `CHAR`/`VARCHAR` ning binary varianti. Uzunligi belgilarda emas, **baytlarda**:

```sql
CREATE TABLE fayllar (mazmun VARBINARY(10));
INSERT INTO fayllar VALUES ('Salom');
SELECT mazmun, HEX(mazmun), mazmun = 'salom' AS teng FROM fayllar;
```

```text
+--------+-------------+------+
| mazmun | HEX(mazmun) | teng |
+--------+-------------+------+
| Salom  | 53616C6F6D  |    0 |
+--------+-------------+------+
```

Binary solishtirish baytlar bo'yicha: `'Salom'` ≠ `'salom'`.

### SQLite

SQLite'da matn uchun `TEXT` saqlash klassi, baytlar uchun `BLOB` bor. Qoidalar 6-bobdagi affinity qoidasidan kelib chiqadi:

- `CHAR`, `CLOB` yoki `TEXT` so'zi bor tip TEXT affinity'ga ega. `VARCHAR` ham, chunki unda `CHAR` bor;
- qavsdagi uzunlik **e'tiborsiz**. SQLite hujjatiga ko'ra satr uzunligiga faqat umumiy `SQLITE_MAX_LENGTH` chegarasi ta'sir qiladi, u sukut bo'yicha 1 milliard bayt;
- `CHAR(n)` probel bilan to'ldirmaydi;
- oxiridagi probellar solishtirishda hisobga olinadi.

```sql
CREATE TABLE matnlar (c CHAR(4), v VARCHAR(5));
INSERT INTO matnlar VALUES ('ab', 'juda ham uzun matn');
SELECT '(' || c || ')' AS c, v, length(v) AS uzunlik, typeof(v) AS tip FROM matnlar;
SELECT 'ab' = 'ab  ' AS teng;
```

```text
 c            v           uzunlik  tip
----  ------------------  -------  ----
(ab)  juda ham uzun matn       18  text
teng
----
   0
```

`VARCHAR(5)` 18 belgilik matnni xatosiz qabul qildi.

**`BLOB` literali** — `x'…'`, ichida o'n oltilik raqamlar:

```sql
SELECT x'53616C6F6D' AS blob, typeof(x'53616C6F6D') AS tip, x'53616C6F6D' = 'Salom' AS teng;
```

```text
blob   tip   teng
-----  ----  ----
Salom  blob     0
```

Baytlar bir xil, lekin `BLOB` va `TEXT` turli saqlash klassi, shuning uchun teng emas.

**Nol bayt.** SQLite "Quirks" sahifasi matn ichida NUL belgi bo'lishiga ruxsat beradi. PostgreSQL'da bu xato edi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Asosiy matn tipi | `text`; `varchar(n)`, `char(n)` | `VARCHAR(n)`, `TEXT` oilasi | `TEXT` |
| `n` nimani o'lchaydi | Belgilar | Belgilar (`CHAR`/`VARCHAR`); `TEXT` chegarasi baytlarda | E'tiborsiz |
| Uzun qiymat | Xato | Qat'iy rejimda xato | Qabul qilinadi |
| `char(n)` to'ldirish | Ha, o'qishda olib tashlanadi | Ha, o'qishda olib tashlanadi | Yo'q |
| `'ab' = 'ab  '` | `varchar` — yolg'on; `char` — rost | `utf8mb4_0900_ai_ci` da yolg'on (`NO PAD`) | Yolg'on |
| `'Salom' = 'salom'` | Yolg'on | Rost (`_ci` collation) | Yolg'on |
| Binary tip | `bytea` | `BINARY`, `VARBINARY`, `BLOB` oilasi | `BLOB` |
| Matnda NUL | Mumkin emas | — | Mumkin |
| Qator hajmi chegarasi | Yo'q | 65 535 bayt (`TEXT`/`BLOB` siz) | — |
| `TEXT`/`BLOB` da `DEFAULT` | Mumkin | Mumkin emas | Mumkin |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| PostgreSQL'da har matn ustuniga `varchar(255)` yozish | Tezlik foydasi yo'q; 255 — o'ylab topilgan chegara | `text`, yoki biznes qoidasi bor bo'lsa — aniq `varchar(n)` yoki `CHECK` |
| `char(n)` ni "tezroq" deb tanlash | PostgreSQL'da odatda eng sekini; probellar chalkashtiradi | `text` / `varchar` |
| `n` ni bayt deb o'ylash | `varchar(n)` — belgilar; bayt soni UTF-8 da ko'proq | `char_length` va `octet_length` farqini bilish |
| MySQL'da `TEXT` ga 65 535 belgi sig'adi deb o'ylash | Chegara baytlarda; `utf8mb4` da 4 marta kam belgi sig'ishi mumkin | Kerakli hajmga qarab `MEDIUMTEXT` |
| MySQL'da ko'p katta `VARCHAR` ustun | Qator hajmi 65 535 baytdan oshib, jadval yaratilmaydi | Katta matnlar uchun `TEXT` |
| Ma'lumot ko'chirishda `'ab'` va `'ab  '` ni bir xil deb hisoblash | Natija tip va collation'ga bog'liq (`PAD SPACE` / `NO PAD`) | Oxiridagi probellarni ilovada tozalash yoki `CHECK` |
| MySQL'dan PostgreSQL'ga o'tib, `WHERE nom = 'salom'` `Salom` ni topadi deb kutish | MySQL'da `_ci` collation tufayli topardi, PostgreSQL'da yo'q | 11-bob: collation va `lower()` |
| O'zbek matnida `'` va `ʻ` aralashib ketishi | Ko'rinishi bir xil, baytlari har xil — qidiruv ishlamaydi | Kiritishda bitta belgiga keltirish |
| Fayllarni `text` da saqlash | Nol bayt va noto'g'ri UTF-8 ketma-ketliklari xato beradi | `bytea` / `BLOB` (yoki faylni tashqarida, bazada yo'li) |
| SQLite'da `VARCHAR(50)` uzunlikni tekshiradi deb o'ylash | Uzunlik e'tiborsiz | `CHECK (length(nom) <= 50)` (14-bob) |

## Amaliyot

1. PostgreSQL'da `char(5)`, `varchar(5)` va `text` ustunli jadval yarating. Uchalasiga `'abc'` ni yozing va `octet_length()` bilan har biri necha bayt ekanini ko'ring.
2. `SELECT 'abc  '::varchar(3), 'abc  '::char(3), 'abcd'::varchar(3);` natijasini oldindan ayting, keyin tekshiring.
3. Kirill harfli `'Тошкент'` va o'zbek lotin `'Oʻzbekiston'` uchun `char_length` va `octet_length` ni uchala tizimda solishtiring.
4. MySQL'da `CREATE TABLE t (a VARCHAR(20000));` ni `utf8mb4` bilan yarating. Keyin `CHARACTER SET latin1` bilan takrorlang. Nega natija farq qiladi?
5. PostgreSQL'da kichik rasm faylini `pg_read_binary_file()` yoki ilova orqali `bytea` ustunga yozing va `length()` bilan hajmini tekshiring.
6. SQLite'da `CREATE TABLE t (kod CHAR(3));` ga `'ABCDEF'` yozing. Keyin uzunlikni `CHECK` bilan cheklang va qayta urinib ko'ring.

## Rasmiy hujjat

- PostgreSQL — 8.3. Character Types: <https://www.postgresql.org/docs/18/datatype-character.html>
- PostgreSQL — 8.4. Binary Data Types: <https://www.postgresql.org/docs/18/datatype-binary.html>
- PostgreSQL — 9.4. String Functions and Operators: <https://www.postgresql.org/docs/18/functions-string.html>
- MySQL — 13.3.2 The CHAR and VARCHAR Types: <https://dev.mysql.com/doc/refman/9.7/en/char.html>
- MySQL — 13.3.3 The BINARY and VARBINARY Types: <https://dev.mysql.com/doc/refman/9.7/en/binary-varbinary.html>
- MySQL — 13.3.4 The BLOB and TEXT Types: <https://dev.mysql.com/doc/refman/9.7/en/blob.html>
- MySQL — 13.7 Data Type Storage Requirements: <https://dev.mysql.com/doc/refman/9.7/en/storage-requirements.html>
- MySQL — 10.4.7 Limits on Table Column Count and Row Size: <https://dev.mysql.com/doc/refman/9.7/en/column-count-limit.html>
- SQLite — Datatypes In SQLite: <https://www.sqlite.org/datatype3.html>
- SQLite — Limits In SQLite: <https://www.sqlite.org/limits.html>
- SQLite — Quirks (NUL belgilar): <https://www.sqlite.org/quirks.html>
