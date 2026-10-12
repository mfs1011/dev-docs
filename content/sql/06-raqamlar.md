# 06 — Raqamlar

[← Oldingi: Baza, sxema va jadval](05-baza-sxema-jadval.md) · [Mundarija](README.md) · [Keyingi: Matn va binary →](07-matn-va-binary.md)

## Tushuncha

Har bir ustunning **ma'lumot tipi** bo'ladi. Tip ikki narsani belgilaydi:

- ustunga qanday qiymat yozish mumkin;
- u bilan qanday amallar bajariladi.

Raqamli tiplar uch guruhga bo'linadi. Ular bir-biridan juda farq qiladi:

| Guruh | Standart tiplar | Qachon |
| --- | --- | --- |
| **Butun sonlar** | `smallint`, `integer`, `bigint` | Hisob, miqdor, identifikator |
| **Aniq kasr sonlar** | `numeric(p, s)`, `decimal(p, s)` | Pul va aniqlik talab qilinadigan har qanday qiymat |
| **Taqribiy kasr sonlar** | `real`, `double precision`, `float(p)` | Fizik o'lchovlar, ilmiy hisob — kichik xato muhim bo'lmagan joy |

### Butun sonlar

PostgreSQL'dagi butun son tiplari:

| Tip | Hajmi | Oralig'i |
| --- | --- | --- |
| `smallint` | 2 bayt | −32 768 … +32 767 |
| `integer` | 4 bayt | −2 147 483 648 … +2 147 483 647 |
| `bigint` | 8 bayt | −9 223 372 036 854 775 808 … +9 223 372 036 854 775 807 |

Oraliqdan tashqari qiymat yozilsa — **xato**.

Hujjatning tavsiyasi:

- `integer` — odatiy tanlov, chunki oraliq, hajm va tezlik o'rtasida eng yaxshi muvozanat;
- `smallint` — faqat disk joyi juda qimmat bo'lsa;
- `bigint` — `integer` oralig'i yetmasa.

Standartda faqat `integer` (`int`), `smallint` va `bigint` bor. `int2`, `int4`, `int8` nomlari — PostgreSQL kengaytmasi.

### Aniq sonlar: `numeric`

`numeric` juda ko'p raqamli sonlarni **aniq** saqlaydi. Hujjat uni **pul summalari** va aniqlik talab qilinadigan boshqa miqdorlar uchun alohida tavsiya qiladi. Qo'shish, ayirish va ko'paytirish aniq natija beradi. Lekin `numeric` bilan hisob butun son va `real`/`double` tiplariga qaraganda **ancha sekin**.

Ikki atama:

- **precision** (aniqlik) — sondagi barcha muhim raqamlar soni, vergulning ikki tomonida;
- **scale** (masshtab) — verguldan keyingi raqamlar soni.

Masalan, `23.5141` da precision 6, scale 4.

```sql
NUMERIC(precision, scale)   -- masalan, numeric(10, 2)
NUMERIC(precision)          -- scale = 0
NUMERIC                     -- cheklanmagan
```

Qiymat yozilganda ikki narsa bo'ladi:

1. Verguldan keyingi raqamlar scale'dan ko'p bo'lsa, qiymat scale'gacha **yaxlitlanadi**.
2. Yaxlitlangandan keyin ham vergulgacha raqamlar `precision − scale` dan ko'p bo'lsa — **xato**.

Masalan, `numeric(5, 2)` −999.99 dan 999.99 gacha saqlaydi.

Cheklanmagan `NUMERIC` qiymatni hech qanday scale'ga keltirmaydi. Hujjat bu yerda standart bilan bitta farqni aytadi:

- standartga ko'ra `NUMERIC` ning sukut bo'yicha scale'i 0, ya'ni butun songa yaxlitlanadi;
- PostgreSQL buni "biroz befoyda" deb hisoblaydi va cheklamaydi.

Hujjatning maslahati: ko'chiriluvchanlik muhim bo'lsa, precision va scale'ni **doim aniq** yozing.

`decimal` va `numeric` — bir xil tip, ikkalasi ham standartda bor.

**Qo'shimcha imkoniyatlar** (PostgreSQL):

- 15-versiyadan beri **manfiy scale** mumkin. Masalan, `numeric(2, -3)` qiymatni mingtalikkacha yaxlitlaydi. Standartda scale 0 dan precision'gacha bo'lishi kerak, shuning uchun bu ko'chiriluvchan emas.
- `Infinity`, `-Infinity`, `NaN` maxsus qiymatlari bor. Ular faqat cheklanmagan `numeric` ga sig'adi.
- IEEE 754 da `NaN` hech narsaga, hatto o'ziga ham teng emas. PostgreSQL esa saralash va indekslash uchun `NaN` larni **o'zaro teng** va boshqa barcha sonlardan **katta** deb hisoblaydi.

**Yaxlitlash.** `numeric` teng masofadagi qiymatni **noldan uzoqqa** yaxlitlaydi: 2.5 → 3, −2.5 → −3. `real` va `double` esa ko'p kompyuterlarda **eng yaqin juft songa** yaxlitlaydi: 2.5 → 2.

### Taqribiy sonlar: `real` va `double precision`

Bu tiplar IEEE 754 standartidagi ikkilik kasr sonlar:

- `real` — 4 bayt, kamida 6 o'nlik raqam aniqligi;
- `double precision` — 8 bayt, kamida 15 o'nlik raqam aniqligi.

"Taqribiy" degani shu: ba'zi qiymatlar ichki formatga **aniq** o'girilmaydi. Yozilgan va o'qilgan qiymat biroz farq qilishi mumkin. Hujjat bu borada uchta qoida beradi:

- aniq saqlash va hisob kerak bo'lsa (masalan, pul) — `numeric` ishlating;
- muhim narsalar uchun murakkab hisob qilsangiz, ayniqsa chegaraviy holatlarda (cheksizlik, juda kichik sonlar), amalga oshirilishini sinchiklab tekshiring;
- ikki kasr sonni **tenglikka** solishtirish har doim kutilgandek ishlamasligi mumkin.

Standartda `float(p)` yozuvi ham bor. Bu yerda `p` — ikkilik raqamlardagi minimal aniqlik:

- `float(1)` … `float(24)` → `real`;
- `float(25)` … `float(53)` → `double precision`;
- aniqliksiz `float` → `double precision`.

### `money` tipi

PostgreSQL'da `money` tipi bor. Uning verguldan keyingi raqamlari soni bazaning `lc_monetary` sozlamasiga, ya'ni **mintaqaga** bog'liq. Natija ham shu mintaqa formatida chiqadi, masalan `$1,000.00`.

Hujjat bu tipning ikki xavfini aytadi:

- bazaning dump'ini `lc_monetary` boshqacha bo'lgan bazaga tiklashda muammo chiqishi mumkin;
- `money` ni butun songa bo'lganda kasr qismi yaxlitlanmaydi, **kesib tashlanadi**.

Hujjat pul uchun **kasr sonlardan** (`real`, `double`) foydalanmaslikni aytadi, chunki yaxlitlash xatolari chiqadi. `numeric` esa mintaqaga bog'liq emas va hujjatda pul uchun alohida tavsiya qilingan.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `0.1 + 0.2`

```sql
SELECT 0.1 + 0.2 AS numeric_yigindi, 0.1::float8 + 0.2::float8 AS float_yigindi;
```

```text
 numeric_yigindi |    float_yigindi    
-----------------+---------------------
             0.3 | 0.30000000000000004
(1 row)
```

PostgreSQL'da `0.1` literali `numeric` bo'ladi (4-bob), shuning uchun yig'indi aniq chiqdi. `float8` (`double precision`) da esa ikkilik formatda 0.1 ni aniq yozib bo'lmaydi va xato ko'rindi.

```sql
SELECT 0.1::float8 + 0.2::float8 = 0.3::float8 AS teng_mi, 0.1 + 0.2 = 0.3 AS numeric_teng_mi;
```

```text
 teng_mi | numeric_teng_mi 
---------+-----------------
 f       | t
(1 row)
```

Hujjatdagi ogohlantirish aynan shu: kasr sonlarni tenglikka solishtirish ishonchsiz.

### Oraliqdan chiqish

```sql
SELECT 32767::smallint + 1::smallint;
SELECT 2147483647 + 1;
SELECT 2147483647::bigint + 1 AS bigint_bilan;
```

```text
ERROR:  smallint out of range
ERROR:  integer out of range
 bigint_bilan 
--------------
   2147483648
(1 row)
```

Ikkita `integer` ning yig'indisi ham `integer` bo'ladi. Natija sig'masa, PostgreSQL jimgina kattaroq tipga o'tmaydi, **xato** beradi.

### `numeric(5, 2)`: yaxlitlash va to'lib ketish

```sql
CREATE TABLE narxlar (n numeric(5,2));
INSERT INTO narxlar VALUES (123.456), (999.994);
INSERT INTO narxlar VALUES (999.995);
SELECT * FROM narxlar;
```

```text
CREATE TABLE
INSERT 0 2
ERROR:  numeric field overflow
DETAIL:  A field with precision 5, scale 2 must round to an absolute value less than 10^3.
   n    
--------
 123.46
 999.99
(2 rows)
```

- `123.456` → `123.46`: ikki xonagacha yaxlitlandi.
- `999.994` → `999.99`: sig'di.
- `999.995` yaxlitlanganda `1000.00` bo'ladi. U 3 ta butun xonaga sig'maydi, shuning uchun xato.

### Bo'lish

```sql
SELECT 10 / 4 AS butun_bolish, 10 / 4.0 AS numeric_bolish, 10 % 4 AS qoldiq;
```

```text
 butun_bolish |   numeric_bolish   | qoldiq 
--------------+--------------------+--------
            2 | 2.5000000000000000 |      2
(1 row)
```

Hujjatga ko'ra butun sonlarni bo'lishda natija **nolga qarab kesiladi**: `5 / 2` = 2, `(-5) / 2` = −2. Kasr natija kerak bo'lsa, operandlardan biri kasr son bo'lishi kerak.

### Yaxlitlash: `numeric` va `double`

Hujjatdagi misol:

```sql
SELECT x, round(x::numeric) AS num_round, round(x::double precision) AS dbl_round
FROM generate_series(-2.5, 2.5, 1) AS x;
```

```text
  x   | num_round | dbl_round 
------+-----------+-----------
 -2.5 |        -3 |        -2
 -1.5 |        -2 |        -2
 -0.5 |        -1 |        -0
  0.5 |         1 |         0
  1.5 |         2 |         2
  2.5 |         3 |         2
(6 rows)
```

Bir xil `round()` funksiyasi tipga qarab ikki xil natija berdi.

### Maxsus qiymatlar va manfiy scale

```sql
SELECT 'NaN'::numeric = 'NaN'::numeric AS nan_teng, 'Infinity'::numeric + 1 AS cheksiz;
SELECT 1234.5::numeric(2,-3) AS minglik;
```

```text
 nan_teng | cheksiz  
----------+----------
 t        | Infinity
(1 row)

 minglik 
---------
    1000
(1 row)
```

### `money`

```sql
SHOW lc_monetary;
SELECT 12.345::money AS pul, '1000'::money / 3 AS bolingan;
```

```text
 lc_monetary 
-------------
 en_US.UTF-8
(1 row)

  pul   | bolingan 
--------+----------
 $12.35 |  $333.33
(1 row)
```

Valyuta belgisi va format bazaning mintaqa sozlamasidan keldi. Ma'lumot emas, uning ko'rinishi.

## Dialektlar

### MySQL

**Butun sonlar.** Standart `INT` va `SMALLINT` dan tashqari MySQL'da kengaytma sifatida `TINYINT` (1 bayt), `MEDIUMINT` (3 bayt) va `BIGINT` bor.

**`UNSIGNED`.** Butun son tiplarida MySQL'ga xos `UNSIGNED` atributi bor. U manfiy qiymatni taqiqlaydi va oraliqni yuqoriga suradi. Masalan, `INT UNSIGNED` 0 dan 4 294 967 295 gacha. Lekin:

- `FLOAT`, `DOUBLE` va `DECIMAL` uchun `UNSIGNED` **eskirgan**. Hujjat uning o'rniga oddiy `CHECK` cheklovini (14-bob) tavsiya qiladi;
- `INT(4)` dagi display width (ko'rsatish kengligi) va `ZEROFILL` ham eskirgan.

```sql
CREATE TABLE eskirgan (a INT(4) ZEROFILL, b DECIMAL(5,2) UNSIGNED);
SHOW WARNINGS;
```

```text
| Warning | 1681 | The ZEROFILL attribute is deprecated and will be removed in a future release. Use the LPAD function to zero-pad numbers, or store the formatted numbers in a CHAR column. |
| Warning | 1681 | Integer display width is deprecated and will be removed in a future release. |
| Warning | 1681 | UNSIGNED for decimal and floating point data types is deprecated and support for it will be removed in a future release. |
```

**`SERIAL`** MySQL'da `BIGINT UNSIGNED NOT NULL AUTO_INCREMENT UNIQUE` ning qisqartmasi. PostgreSQL'dagi `serial` dan boshqa narsa (13-bob):

```text
CREATE TABLE `s` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB …
```

**Oraliqdan chiqish `sql_mode` ga bog'liq.** Qat'iy rejimda (sukut bo'yicha) xato beriladi:

```sql
CREATE TABLE sonlar (t TINYINT, tu TINYINT UNSIGNED, d DECIMAL(5,2));
INSERT INTO sonlar (t) VALUES (128);
INSERT INTO sonlar (tu) VALUES (-1);
```

```text
ERROR 1264 (22003) at line 2: Out of range value for column 't' at row 1
ERROR 1264 (22003) at line 3: Out of range value for column 'tu' at row 1
```

Qat'iy rejim o'chirilsa, MySQL qiymatni oraliq **chegarasigacha kesadi** va faqat ogohlantirish beradi:

```sql
SET SESSION sql_mode = '';
INSERT INTO sonlar (t, tu) VALUES (128, -1);
SELECT t, tu FROM sonlar WHERE t IS NOT NULL;
```

```text
| Warning | 1264 | Out of range value for column 't' at row 1  |
| Warning | 1264 | Out of range value for column 'tu' at row 1 |
+------+------+
| t    | tu   |
+------+------+
|  127 |    0 |
+------+------+
```

`128` → `127`, `-1` → `0`. Ma'lumot jimgina boshqa qiymatga aylandi.

Ifoda hisoblashda to'lib ketish esa doim xato:

```text
ERROR 1690 (22003) at line 13: BIGINT value is out of range in '(9223372036854775807 + 1)'
```

**`DECIMAL`.** Qoidalari:

- `NUMERIC` MySQL'da `DECIMAL` sifatida amalga oshirilgan;
- eng ko'pi 65 raqam, verguldan keyin 30 tagacha;
- standartga ko'ra `DECIMAL(M)` = `DECIMAL(M,0)`;
- `M` berilmasa, MySQL'da u 10 bo'ladi.

Ortiqcha kasr xonalari yaxlitlanadi, bu `Note` bilan xabar qilinadi. Sig'maydigan qiymat qat'iy rejimda xato beradi:

```sql
INSERT INTO sonlar (d) VALUES (123.456), (999.994);
SHOW WARNINGS;
INSERT INTO sonlar (d) VALUES (999.995);
```

```text
| Note  | 1265 | Data truncated for column 'd' at row 1 |
| Note  | 1265 | Data truncated for column 'd' at row 2 |
ERROR 1264 (22003) at line 6: Out of range value for column 'd' at row 1
```

Ustunda PostgreSQL'dagi kabi `123.46` va `999.99` qoldi.

**Literal aniq yoki taqribiy.** MySQL hujjatiga ko'ra `2.34` — aniq qiymat (fixed-point), `2.34E0` esa taqribiy (floating-point):

```sql
SELECT 0.1 + 0.2 AS decimal_yigindi, 0.1E0 + 0.2E0 AS double_yigindi;
```

```text
+-----------------+---------------------+
| decimal_yigindi | double_yigindi      |
+-----------------+---------------------+
|             0.3 | 0.30000000000000004 |
+-----------------+---------------------+
```

**`FLOAT(M,D)` va `DOUBLE(M,D)`** — standart bo'lmagan va eskirgan yozuv. Hujjat ko'chiriluvchanlik uchun aniqliksiz `FLOAT` yoki `DOUBLE PRECISION` ni tavsiya qiladi.

**Bo'lish.** MySQL'da `/` butun sonlarni ham kasr natija bilan bo'ladi. Butun bo'lish uchun alohida `DIV` operatori bor:

```sql
SELECT 10 / 4 AS bolish, 10 DIV 4 AS butun_bolish, 10 % 4 AS qoldiq;
```

```text
+--------+--------------+--------+
| bolish | butun_bolish | qoldiq |
+--------+--------------+--------+
| 2.5000 |            2 |      2 |
+--------+--------------+--------+
```

Bitta `10 / 4` PostgreSQL'da `2`, MySQL'da `2.5000`.

### SQLite

SQLite'da tip **qiymatga** tegishli, ustunga emas (1-bobdagi "moslashuvchan tiplash"). Raqamlar uchun ikki saqlash klassi bor:

- `INTEGER` — 8 baytgacha ishorali butun son. Diskda kattaligiga qarab 0, 1, 2, 3, 4, 6 yoki 8 bayt egallaydi;
- `REAL` — 8 baytli IEEE 754 kasr son.

**`DECIMAL` tipi yo'q.** Ustun tipi SQLite'da faqat **affinity** (moyillik)ni belgilaydi. Qoidasi:

| E'lon qilingan tip nomida | Affinity |
| --- | --- |
| `INT` bor | INTEGER |
| `CHAR`, `CLOB` yoki `TEXT` bor | TEXT |
| `BLOB` bor yoki tip yo'q | BLOB |
| `REAL`, `FLOA` yoki `DOUB` bor | REAL |
| Boshqa hammasi (`NUMERIC`, `DECIMAL(5,2)`, `BOOLEAN`…) | NUMERIC |

Qavs ichidagi sonlar (`DECIMAL(5,2)`, `VARCHAR(255)`) **e'tiborsiz** qoldiriladi.

```sql
CREATE TABLE t (n NUMERIC, d DECIMAL(5,2), i INTEGER);
INSERT INTO t VALUES ('3.0e+5', 123.456, 3.0), ('abc', 99999.999, 2.5);
SELECT n, typeof(n), d, typeof(d), i, typeof(i) FROM t;
```

```text
  n     typeof(n)      d      typeof(d)   i   typeof(i)
------  ---------  ---------  ---------  ---  ---------
300000  integer      123.456  real         3  integer
abc     text       99999.999  real       2.5  real
```

Har qatorni hujjat qoidalari bilan tushuntirish mumkin:

- `'3.0e+5'` matni NUMERIC ustunga yozilganda butun songa aylanadi: `300000`;
- `'abc'` son emas, matn bo'lib qoladi;
- `DECIMAL(5,2)` hech narsani yaxlitlamadi va cheklamadi: `123.456` va `99999.999` shundayligicha `real` bo'lib yozildi;
- `INTEGER` ustunga `3.0` butun songa aylandi, `2.5` esa `real` bo'lib qoldi.

**Arifmetika.** SQLite hujjati bo'yicha:

- ikki butun sonning amali, to'lib ketmasa, butun son bo'ladi;
- to'lib ketsa yoki operandlardan biri kasr bo'lsa, **IEEE 754 kasr** hisobiga o'tiladi;
- butun bo'lish nolga qarab kesiladi.

```sql
SELECT 10 / 4 AS bolish, 10 / 4.0 AS haqiqiy, 10 % 4 AS qoldiq;
SELECT 9223372036854775807 + 1 AS natija, typeof(9223372036854775807 + 1) AS tip;
```

```text
bolish  haqiqiy  qoldiq
------  -------  ------
     2      2.5       2
        natija          tip
----------------------  ----
9.2233720368547758e+18  real
```

PostgreSQL va MySQL xato bergan joyda SQLite jimgina **taqribiy** songa o'tdi.

**Aniq hisob kerak bo'lsa.** SQLite hujjati ochiq yozadi: "kasr qiymatlar taqribiy. Aniq javob kerak bo'lsa, ikkilik kasr sonlardan foydalanmang — SQLite'da ham, boshqa har qanday mahsulotda ham". Buning uchun `decimal` kengaytmasi bor. U sonlarni matn ko'rinishida saqlab, aniq hisoblaydi. Bu kengaytma kutubxonaga kirmagan, lekin `sqlite3` dasturida bor:

```sql
SELECT 0.1 + 0.2 AS yigindi, 0.1 + 0.2 = 0.3 AS teng_mi;
SELECT decimal_add('0.1', '0.2') AS aniq;
```

```text
      yigindi        teng_mi
-------------------  -------
0.30000000000000004        0
aniq
----
0.3
```

SQLite'da `0.1` literali `REAL`, shuning uchun oddiy yig'indida xato ko'rindi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Butun tiplar | `smallint`, `integer`, `bigint` | + `TINYINT`, `MEDIUMINT`; `UNSIGNED` | Bitta `INTEGER` klassi (8 baytgacha) |
| Aniq kasr | `numeric(p,s)`, 1000 xonagacha e'lon | `DECIMAL(M,D)`, 65 xonagacha | Yo'q (`decimal` kengaytmasi, CLI'da) |
| `0.1` literali | `numeric` (aniq) | `DECIMAL` (aniq) | `REAL` (taqribiy) |
| Ustunga sig'maydigan son | Xato | Qat'iy rejimda xato, aks holda chegaragacha kesiladi | Qabul qilinadi |
| Ifodada to'lib ketish | Xato | Xato | Kasr songa o'tadi |
| `10 / 4` | `2` | `2.5000` (`DIV` → 2) | `2` |
| `numeric(5,2)` ga `123.456` | `123.46` | `123.46` (`Note`) | `123.456` |
| Pul tipi | `money` (mintaqaga bog'liq) | Yo'q | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Pulni `float`/`double`/`real` da saqlash | Taqribiy: `0.1 + 0.2 ≠ 0.3`, yig'indilarda tiyinlar yo'qoladi | `numeric(p, s)` / `DECIMAL(M, D)` |
| Kasr sonlarni `=` bilan solishtirish | Taqribiy qiymat aynan teng chiqmasligi mumkin | Aniq tip yoki ruxsat etilgan farq: `abs(a - b) < 0.0001` |
| `integer` ni ID uchun tanlab, keyin to'lib qolish | 2 147 483 647 dan keyin har yozuv xato beradi | Katta jadvallar uchun boshidan `bigint` |
| `10 / 4` ni hamma joyda 2.5 deb kutish | PostgreSQL va SQLite'da butun bo'linadi: `2` | Kasr kerak bo'lsa: `10 / 4.0` yoki `CAST` |
| `numeric` ni precision/scale'siz ishlatib, ko'chiriluvchan deb o'ylash | Standartda scale 0, PostgreSQL'da cheklanmagan | `numeric(12, 2)` kabi aniq yozish |
| MySQL'da qat'iy rejimni o'chirish | Sig'maydigan son jimgina chegaraga aylanadi (`128` → `127`) | Qat'iy rejimni saqlash, ogohlantirishlarni kuzatish |
| MySQL'da `DECIMAL UNSIGNED`, `INT(11)`, `ZEROFILL` | Eskirgan, kelajakda olib tashlanadi | `CHECK (narx >= 0)`, `INT`, ko'rsatishda `LPAD()` |
| SQLite'da `DECIMAL(10,2)` pulni aniq saqlaydi deb o'ylash | Qavslar e'tiborsiz, qiymat `REAL` bo'ladi | Butun son (tiyinlarda) yoki matn va `decimal` kengaytmasi |
| PostgreSQL `money` tipini mintaqasi boshqa bazaga ko'chirish | Hujjat ogohlantiradi: `lc_monetary` farq qilsa, dump yuklanmasligi mumkin; butun songa bo'lishda kasr kesiladi | `lc_monetary` ni bir xil saqlash yoki `numeric` |

## Amaliyot

1. PostgreSQL'da `numeric(4, 1)` ustunli jadval yarating. Unga `99.94`, `99.95` va `-99.96` ni yozib ko'ring. Qaysi biri xato beradi va nega?
2. `SELECT 7 / 2, -7 / 2, 7 / 2.0, 7 % 2, -7 % 2;` ni PostgreSQL, MySQL va SQLite'da bajaring. Natijalarni jadvalga yozing.
3. 1 dan 10 gacha har birini `0.1` deb qo'shing: `SELECT sum(0.1::float8) FROM generate_series(1, 10);`. Xuddi shuni `numeric` bilan qiling. Natijalar teng chiqdimi?
4. MySQL'da `TINYINT UNSIGNED` ustunga `300` ni avval sukut bo'yicha rejimda, keyin `sql_mode = ''` da yozing. Ikkinchi holatda ustunda nima qoladi?
5. SQLite'da `CREATE TABLE p (narx DECIMAL(10,2));` yarating va `19.999` ni yozing. `typeof(narx)` va qiymatni ko'ring. Keyin `STRICT` jadval bilan takrorlang (10-bob).
6. Do'kondagi mahsulot narxi (so'mda, tiyinsiz), ombordagi miqdor (kilogrammda, 3 xona aniqlikda) va xaridlar soni (yiliga 10 milliardgacha) uchun PostgreSQL'da tip tanlang. Har tanlovni asoslang.

## Rasmiy hujjat

- PostgreSQL — 8.1. Numeric Types: <https://www.postgresql.org/docs/18/datatype-numeric.html>
- PostgreSQL — 8.2. Monetary Types: <https://www.postgresql.org/docs/18/datatype-money.html>
- PostgreSQL — 9.3. Mathematical Functions and Operators: <https://www.postgresql.org/docs/18/functions-math.html>
- MySQL — 13.1 Numeric Data Types: <https://dev.mysql.com/doc/refman/9.7/en/numeric-types.html>
- MySQL — 13.1.1 Numeric Data Type Syntax: <https://dev.mysql.com/doc/refman/9.7/en/numeric-type-syntax.html>
- MySQL — 13.1.2 Integer Types: <https://dev.mysql.com/doc/refman/9.7/en/integer-types.html>
- MySQL — 13.1.3 Fixed-Point Types: <https://dev.mysql.com/doc/refman/9.7/en/fixed-point-types.html>
- MySQL — 13.1.4 Floating-Point Types: <https://dev.mysql.com/doc/refman/9.7/en/floating-point-types.html>
- MySQL — 13.1.6 Numeric Type Attributes: <https://dev.mysql.com/doc/refman/9.7/en/numeric-type-attributes.html>
- MySQL — 13.1.7 Out-of-Range and Overflow Handling: <https://dev.mysql.com/doc/refman/9.7/en/out-of-range-and-overflow.html>
- MySQL — B.3.4.8 Problems with Floating-Point Values: <https://dev.mysql.com/doc/refman/9.7/en/problems-with-float.html>
- SQLite — Datatypes In SQLite: <https://www.sqlite.org/datatype3.html>
- SQLite — Floating Point Numbers: <https://www.sqlite.org/floatingpoint.html>
- SQLite — SQL Language Expressions (operatorlar): <https://www.sqlite.org/lang_expr.html>
