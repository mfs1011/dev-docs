# 47 — Sekin so'rovlar

[← Oldingi: Planner va statistika](46-planner-va-statistika.md) · [Mundarija](README.md) · [Keyingi: Sahifalash →](48-sahifalash.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/47-1-tushuncha.jpg">
    <source src="/video/sql/47-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/47-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/47-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

Indeks bor, lekin so'rov sekin — bu bobda shunday holatning eng ko'p uchraydigan to'rt sababini ko'ramiz. Ularning umumiy jihati bitta: shart shunday yozilganki, rejalashtiruvchi indeksdan **foydalana olmaydi** yoki foydalanish uchun butun indeksni o'qishi kerak.

| Sabab | Misol | Nima uchun indeks yordam bermaydi |
| --- | --- | --- |
| Ustun funksiya ichida | `WHERE lower(email) = …`, `WHERE extract(year FROM sana) = 2025` | Indeksda `email` saqlangan, `lower(email)` emas |
| Yashirin turni o'zgartirish (implicit conversion) | `WHERE telefon = 998900000500` (`telefon` — matn) | Har qatorni songa aylantirib solishtirish kerak |
| `OR` turli ustunlarda | `WHERE email = … OR telefon = …` | Bitta indeks ikkala shartni qamramaydi |
| Butun jadvalni sanash | `SELECT count(*) FROM t` | Natija uchun hamma qatorni ko'rish kerak |

### Ustun funksiya ichida

PostgreSQL hujjati (11.7. Indexes on Expressions): indeks ustuni jadval ustunining o'zi bo'lishi shart emas — u bir yoki bir nechta ustundan hisoblangan **funksiya yoki ifoda** bo'lishi mumkin. Hujjatdagi misol — registrga befarq qidiruv:

```sql
SELECT * FROM test1 WHERE lower(col1) = 'value';
CREATE INDEX test1_lower_col1_idx ON test1 (lower(col1));
```

`lower(col1)` bo'yicha so'rov oddiy `col1` indeksidan foydalana olmaydi, lekin **ifoda indeksi**dan (expression index) foydalanadi. Hujjat narxini ham aytadi: ifoda har `INSERT` va (HOT bo'lmagan) `UPDATE` da qayta hisoblanadi, shuning uchun bunday indeks qidiruv tezligi yozish tezligidan muhimroq bo'lganda foydali. Qidiruv paytida ifoda qayta hisoblanmaydi — u indeksda saqlangan.

Ikkinchi yo'l — ifoda indeksi o'rniga **shartni qayta yozish**. Sanadan yilni ajratish o'rniga — sana oralig'i:

```sql
-- indeks ishlamaydi
WHERE extract(year FROM sana) = 2025
-- indeks ishlaydi
WHERE sana >= date '2025-01-01' AND sana < date '2026-01-01'
```

Bunday shart ustunni "yalang'och" qoldiradi — B-tree indeksi oraliq bo'yicha qidiradi (41-bob).

### Yashirin turni o'zgartirish

MySQL hujjati (Type Conversion in Expression Evaluation): matnli ustunni **son** bilan solishtirganda MySQL ustundagi indeksdan tez qidiruv uchun foydalana olmaydi. Hujjatdagi misol:

```sql
SELECT * FROM tbl_name WHERE str_col=1;
```

Sababi: `1` ga aylanadigan satrlar ko'p — `'1'`, `' 1'`, `'1a'` — shuning uchun MySQL har qatorni songa aylantirib solishtiradi.

PostgreSQL'da bunday yashirin aylantirish **yo'q**: `text = bigint` uchun operator topilmaydi va so'rov xato bilan tugaydi (pastda). SQLite'da esa aksincha — ustunning **turga moyilligi** (type affinity) qo'llanadi. SQLite hujjati (Datatypes, 4.2): solishtirishda bir tomon TEXT moyilligiga ega, ikkinchisi moyilliksiz bo'lsa (masalan, oddiy son), ikkinchisiga TEXT moyilligi qo'llanadi — son satrga aylanadi va indeks ishlaydi.

### `OR` turli ustunlarda

PostgreSQL hujjati (11.5. Combining Multiple Indexes): bitta indeks skanerlashi faqat `AND` bilan bog'langan shartlardan foydalana oladi — `(a, b)` indeksi `a = 5 AND b = 6` ga mos, `a = 5 OR b = 6` ga esa to'g'ridan-to'g'ri emas. Yechim — **bir nechta indeksni birlashtirish**: har indeks bo'yicha xotirada qatorlar joylashuvi **bitmap**ini (bitlar xaritasi) yasaydi, bitmap'larni `AND`/`OR` qiladi va keyin jadval qatorlarini fizik tartibda o'qiydi. Hujjat ogohlantiradi: shuning uchun indekslarning tartibi yo'qoladi (`ORDER BY` uchun alohida saralash kerak) va har qo'shimcha indeks skanerlash vaqt qo'shadi.

MySQL'da xuddi shu g'oya — **Index Merge** (hujjat: Index Merge Optimization): bir nechta oraliq skanerlash natijasini birlashtiradi; `EXPLAIN` ning `Extra` ustunida `Using union(...)`, `Using intersect(...)` yoki `Using sort_union(...)`. SQLite hujjati (The SQLite Query Optimizer Overview, 4-bo'lim) ikki usulni beradi: bitta ustundagi `OR` lar `IN (...)` ga aylantiriladi; turli ustunlar bo'lsa va har qism alohida indekslanadigan bo'lsa — har qism o'z indeksi bilan, natijalar birlashtiriladi (`MULTI-INDEX OR`).

### `COUNT(*)` — jadval hajmiga proporsional

PostgreSQL hujjati (9.21. Aggregate Functions): boshqa bazalardan kelganlar `count` ning butun jadvaldagi tezligidan "hafsalasi pir bo'lishi" mumkin — `SELECT count(*) FROM sometable` **jadval hajmiga proporsional** ish talab qiladi: PostgreSQL butun jadvalni yoki barcha qatorlarni o'z ichiga olgan indeksni to'liq skanerlashi kerak.

MySQL hujjati (Aggregate Function Descriptions): InnoDB jadvaldagi qatorlar sonini ichkarida saqlamaydi, chunki bir vaqtdagi tranzaksiyalar turli sondagi qatorlarni "ko'rishi" mumkin (52-bob: MVCC). `SELECT COUNT(*)` ni InnoDB **eng kichik ikkilamchi indeks** bo'ylab o'tib bajaradi (ikkilamchi indeks bo'lmasa — klasterli indeks bo'ylab). Hujjat maslahatlari: tez son kerak bo'lsa — ilova yangilab turadigan hisoblagich jadvali (lekin minglab parallel tranzaksiyalarda yaxshi masshtablanmasligi mumkin); taxminiy son yetarli bo'lsa — `SHOW TABLE STATUS`.

PostgreSQL'da taxminiy son — `pg_class.reltuples` (46-bob): hujjatga ko'ra u rejalashtiruvchi uchun **taxmin**, `VACUUM`/`ANALYZE` yangilaydi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/47-2-kod.jpg">
    <source src="/video/sql/47-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/47-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/47-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

100 000 mijoz: `email` (`Mijoz500@misol.uz` — katta harf bilan), `telefon` — **matn** (`'998900000500'`), `sana` — 2023-yildan 1000 kunlik oraliqda. Uch ustunda alohida indeks:

```sql
CREATE TABLE mijozlar (
    id      int PRIMARY KEY,
    email   text NOT NULL,
    telefon text NOT NULL,
    sana    date NOT NULL
);
INSERT INTO mijozlar
SELECT g, 'Mijoz' || g || '@misol.uz', '99890' || lpad(g::text, 7, '0'), date '2023-01-01' + (g % 1000)
FROM generate_series(1, 100000) g;
CREATE INDEX m_email ON mijozlar (email);
CREATE INDEX m_telefon ON mijozlar (telefon);
CREATE INDEX m_sana ON mijozlar (sana);
ANALYZE mijozlar;
```

### Funksiya ichidagi ustun va ifoda indeksi

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
CREATE INDEX m_email_lower ON mijozlar (lower(email));
ANALYZE mijozlar;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
```

```text
 Seq Scan on mijozlar  (cost=0.00..2425.00 rows=500 width=4) (actual rows=1.00 loops=1)
   Filter: (lower(email) = 'mijoz500@misol.uz'::text)
   Rows Removed by Filter: 99999
 Planning Time: 0.076 ms
 Execution Time: 10.075 ms

 Index Scan using m_email_lower on mijozlar  (cost=0.42..8.44 rows=1 width=4) (actual rows=1.00 loops=1)
   Index Cond: (lower(email) = 'mijoz500@misol.uz'::text)
   Index Searches: 1
 Planning Time: 0.056 ms
 Execution Time: 0.023 ms
```

- `m_email` indeksi bor bo'lsa ham — `Seq Scan`: 99 999 qator filtrda tashlab yuborildi, **10 ms**.
- Ifoda indeksidan keyin — `Index Scan using m_email_lower`, `Index Cond` da aynan `lower(email)`: **0.023 ms**, 400 baravardan ko'p tez.
- Birinchi rejadagi taxmin `rows=500` (kuzatildi: qatorlarning 0.5%) — `lower(email)` ifodasi uchun statistika yo'q edi. PostgreSQL hujjati (`pg_statistic`): ifoda indekslari qiymatlarining statistikasi ham saqlanadi — indeks yaratilib `ANALYZE` qilingach, taxmin `rows=1` bo'ldi.

### Sanadan yilni ajratish va oraliq

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT count(*) FROM mijozlar WHERE extract(year FROM sana) = 2025;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT count(*) FROM mijozlar WHERE sana >= date '2025-01-01' AND sana < date '2026-01-01';
```

```text
 Aggregate  (cost=2426.25..2426.26 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Seq Scan on mijozlar  (cost=0.00..2425.00 rows=500 width=0) (actual rows=26900.00 loops=1)
         Filter: (EXTRACT(year FROM sana) = '2025'::numeric)
         Rows Removed by Filter: 73100
 Planning Time: 0.242 ms
 Execution Time: 7.800 ms

 Aggregate  (cost=1756.86..1756.87 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Bitmap Heap Scan on mijozlar  (cost=365.47..1690.23 rows=26651 width=0) (actual rows=26900.00 loops=1)
         Recheck Cond: ((sana >= '2025-01-01'::date) AND (sana < '2026-01-01'::date))
         Heap Blocks: exact=347
         ->  Bitmap Index Scan on m_sana  (cost=0.00..358.80 rows=26651 width=0) (actual rows=26900.00 loops=1)
               Index Cond: ((sana >= '2025-01-01'::date) AND (sana < '2026-01-01'::date))
               Index Searches: 1
 Planning Time: 0.038 ms
 Execution Time: 1.245 ms
```

Natija bir xil (26 900 qator), lekin:

- `extract` bilan — `Seq Scan`, taxmin `rows=500` (haqiqatda 26 900 — 54 baravar xato), **7.8 ms**;
- oraliq bilan — `m_sana` indeksi, taxmin `rows=26651` (deyarli aniq), **1.2 ms**.

Ikkinchi foyda — **to'g'ri taxmin**: `sana` ustunining statistikasi bor, `extract(…)` ifodasiniki yo'q. Katta so'rovda bunday xato `JOIN` rejasini buzadi (46-bob).

### Matn ustuni va son

```sql
SELECT id FROM mijozlar WHERE telefon = 998900000500;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id FROM mijozlar WHERE telefon = '998900000500';
```

```text
ERROR:  operator does not exist: text = bigint
LINE 1: SELECT id FROM mijozlar WHERE telefon = 998900000500;
                                              ^
HINT:  No operator matches the given name and argument types. You might need to add explicit type casts.

 Index Scan using m_telefon on mijozlar  (cost=0.42..8.44 rows=1 width=4) (actual rows=1.00 loops=1)
   Index Cond: (telefon = '998900000500'::text)
   Index Searches: 1
 Planning Time: 0.014 ms
 Execution Time: 0.016 ms
```

PostgreSQL turni o'zi aylantirmadi — xato. Bu yoqimsiz, lekin **foydali**: muammo kod yozilayotganda chiqadi, production'da sekin so'rov bo'lib emas. Satr bilan — indeks.

### `OR` va bitmap'larni birlashtirish

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id FROM mijozlar WHERE email = 'Mijoz7@misol.uz' OR telefon = '998900000500';
```

```text
 Bitmap Heap Scan on mijozlar  (cost=8.85..16.60 rows=2 width=4) (actual rows=2.00 loops=1)
   Recheck Cond: ((email = 'Mijoz7@misol.uz'::text) OR (telefon = '998900000500'::text))
   Heap Blocks: exact=2
   ->  BitmapOr  (cost=8.85..8.85 rows=2 width=0) (actual rows=0.00 loops=1)
         ->  Bitmap Index Scan on m_email  (cost=0.00..4.43 rows=1 width=0) (actual rows=1.00 loops=1)
               Index Cond: (email = 'Mijoz7@misol.uz'::text)
               Index Searches: 1
         ->  Bitmap Index Scan on m_telefon  (cost=0.00..4.43 rows=1 width=0) (actual rows=1.00 loops=1)
               Index Cond: (telefon = '998900000500'::text)
               Index Searches: 1
 Planning Time: 0.013 ms
 Execution Time: 0.022 ms
```

Hujjatda tasvirlangan aynan shu: ikki `Bitmap Index Scan` → `BitmapOr` → jadvaldan 2 blok. Ikkala ustunda **alohida** indeks bo'lgani uchun `OR` tez. Bittasida indeks bo'lmasa, `OR` butun jadvalni o'qishga majbur qiladi — bitta qism ham indekssiz bo'lsa, birlashtirib bo'lmaydi.

### `count(*)`: 100 000 va 1 000 000 qator

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM mijozlar;
SELECT reltuples FROM pg_class WHERE relname = 'mijozlar';
```

```text
 Aggregate  (cost=2175.00..2175.01 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Seq Scan on mijozlar  (cost=0.00..1925.00 rows=100000 width=0) (actual rows=100000.00 loops=1)
 Planning Time: 0.010 ms
 Execution Time: 2.188 ms

 reltuples 
-----------
    100000
```

900 000 qator qo'shib, `VACUUM ANALYZE` dan keyin:

```text
 Finalize Aggregate  (cost=15228.97..15228.98 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Gather  (cost=15228.76..15228.97 rows=2 width=8) (actual rows=3.00 loops=1)
         Workers Planned: 2
         Workers Launched: 2
         ->  Partial Aggregate  (cost=14228.76..14228.77 rows=1 width=8) (actual rows=1.00 loops=3)
               ->  Parallel Index Only Scan using m_sana on mijozlar  (cost=0.42..13187.09 rows=416667 width=0) (actual rows=333333.33 loops=3)
                     Heap Fetches: 0
                     Index Searches: 1
 Planning Time: 0.795 ms
 Execution Time: 12.383 ms
```

- 100 000 qator — butun jadval (`Seq Scan`), 2.2 ms.
- 1 000 000 qator — hujjatda aytilgan ikkinchi yo'l: butun **indeks** (`Index Only Scan using m_sana` — eng kichik indeks, `Heap Fetches: 0` — `VACUUM` dan keyin jadvalga murojaat yo'q), uch jarayonda parallel; baribir **12.4 ms** va 1 million yozuv o'qildi. Jadval 10 baravar o'sdi — ish ham shuncha o'sdi.
- `reltuples` darhol javob beradi, lekin **taxmin** (46-bob).

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/47-3-dialektlar.jpg">
    <source src="/video/sql/47-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/47-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/47-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

### MySQL

Bir xil jadval (`varchar`, uchta indeks; ma'lumot `WITH RECURSIVE` bilan, 30-bob). `EXPLAIN` ning asosiy ustunlari:

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
EXPLAIN FORMAT=TRADITIONAL SELECT count(*) FROM mijozlar WHERE year(sana) = 2025;
EXPLAIN FORMAT=TRADITIONAL SELECT count(*) FROM mijozlar WHERE sana >= '2025-01-01' AND sana < '2026-01-01';
```

```text
| type  | possible_keys | key     | … | rows  | filtered | Extra                    |
| index | NULL          | m_email | … | 99869 |   100.00 | Using where; Using index |

| index | NULL          | m_sana  | … | 99869 |   100.00 | Using where; Using index |

| range | m_sana        | m_sana  | … | 49934 |   100.00 | Using where; Using index |
```

- `lower(email)` va `year(sana)`: `possible_keys = NULL` — indeksdan **qidiruv uchun** foydalanib bo'lmaydi; `type = index` — butun indeks o'qiladi (indeks jadvaldan ixcham bo'lgani uchun, lekin baribir 99 869 yozuv).
- Oraliq bilan — `type = range`.

MySQL'da ifoda indeksi — **funksional kalit qismi** (functional key part, `CREATE INDEX` hujjati), ifoda ikkita qavs ichida:

```sql
CREATE INDEX m_email_lower ON mijozlar ((lower(email)));
EXPLAIN FORMAT=TRADITIONAL SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
```

```text
| type | possible_keys | key           | … | ref   | rows | filtered | Extra |
| ref  | m_email_lower | m_email_lower | … | const |    1 |   100.00 | NULL  |
```

Lekin MySQL'da `lower()` ko'pincha **shart emas**: bazaning standart kollatsiyasi (collation — satrlarni solishtirish qoidasi) `utf8mb4_0900_ai_ci`, MySQL hujjatiga ko'ra `_ci` — registrga befarq (case-insensitive), `_ai` — urg'u belgilariga befarq. Shuning uchun oddiy `m_email` indeksi bilan:

```sql
SELECT @@collation_database AS kollatsiya;
SELECT id FROM mijozlar WHERE email = 'mijoz500@misol.uz';
```

```text
| kollatsiya         |
| utf8mb4_0900_ai_ci |

| id  |
| 500 |
```

`'mijoz500@…'` kichik harf bilan — `'Mijoz500@…'` topildi.

**Matn ustuni va son** — hujjatdagi `str_col=1` holati:

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT id FROM mijozlar WHERE telefon = 998900000500;
SHOW WARNINGS;
```

```text
| type  | possible_keys | key       | … | rows  | filtered | Extra                    |
| index | m_telefon     | m_telefon | … | 99869 |    10.00 | Using where; Using index |

| Warning | 1739 | Cannot use ref access on index 'm_telefon' due to type or collation conversion on field 'telefon'   |
| Warning | 1739 | Cannot use range access on index 'm_telefon' due to type or collation conversion on field 'telefon' |
```

MySQL xato bermadi — **ogohlantirish** berdi va butun indeksni o'qidi. `EXPLAIN ANALYZE` bilan farq:

```sql
EXPLAIN ANALYZE SELECT id FROM mijozlar WHERE telefon = 998900000500;
EXPLAIN ANALYZE SELECT id FROM mijozlar WHERE telefon = '998900000500';
```

```text
-> Filter: (mijozlar.telefon = 998900000500)  (cost=10101 rows=9997) (actual time=0.108..9.81 rows=1 loops=1)
    -> Covering index scan on mijozlar using m_telefon  (cost=10101 rows=99965) (actual time=0.0321..6.32 rows=100000 loops=1)

-> Covering index lookup on mijozlar using m_telefon (telefon = '998900000500')  (cost=0.35 rows=1) (actual time=0.0035..0.004 rows=1 loops=1)
```

100 000 yozuv va **9.8 ms** — bitta yozuv va **0.004 ms**. Natija bir xil, farq — faqat qo'shtirnoqda. Ilovada parametr turi noto'g'ri berilsa (masalan, ORM'da raqam), xuddi shu narsa jimgina sodir bo'ladi.

**`OR` — Index Merge:**

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT id FROM mijozlar WHERE email = 'Mijoz7@misol.uz' OR telefon = '998900000500';
```

```text
| type        | possible_keys     | key               | key_len | … | rows | Extra                                       |
| index_merge | m_email,m_telefon | m_email,m_telefon | 402,82  | … |    2 | Using union(m_email,m_telefon); Using where |
```

`Using union(m_email,m_telefon)` — hujjatdagi union algoritmi.

**`COUNT(*)`:**

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT count(*) FROM mijozlar;
```

```text
| type  | possible_keys | key    | key_len | … | rows  | Extra       |
| index | NULL          | m_sana | 3       | … | 99869 | Using index |
```

Hujjatda aytilganidek — **eng kichik** ikkilamchi indeks: `m_sana` (`key_len = 3` bayt, `email` — 402).

### SQLite

Bir xil jadval (`sana` — `text`, ISO formatida):

```sql
EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
CREATE INDEX m_email_lower ON mijozlar (lower(email));
EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE lower(email) = 'mijoz500@misol.uz';
EXPLAIN QUERY PLAN SELECT count(*) FROM mijozlar WHERE strftime('%Y', sana) = '2025';
EXPLAIN QUERY PLAN SELECT count(*) FROM mijozlar WHERE sana >= '2025-01-01' AND sana < '2026-01-01';
```

```text
QUERY PLAN
`--SCAN mijozlar USING COVERING INDEX m_email
QUERY PLAN
`--SEARCH mijozlar USING COVERING INDEX m_email_lower (<expr>=?)
QUERY PLAN
`--SCAN mijozlar USING COVERING INDEX m_sana
QUERY PLAN
`--SEARCH mijozlar USING COVERING INDEX m_sana (sana>? AND sana<?)
```

`SCAN` — butun indeks bo'ylab o'tish, `SEARCH` — indeksda qidiruv (45-bob). Ifoda indeksidan keyin — `(<expr>=?)`.

**Matn ustuni va son — SQLite'da indeks ishlaydi:**

```sql
EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE telefon = 998900000500;
SELECT id FROM mijozlar WHERE telefon = 998900000500;
```

```text
QUERY PLAN
`--SEARCH mijozlar USING COVERING INDEX m_telefon (telefon=?)
500
```

Hujjatdagi qoida: `telefon` ning moyilligi TEXT, `998900000500` — moyilliksiz; demak son satrga aylantiriladi va `telefon=?` qidiruvi indeks bilan. Uch bazada uch xil xatti-harakat — pastdagi jadvalda.

**`OR` — `MULTI-INDEX OR`:**

```sql
EXPLAIN QUERY PLAN SELECT id FROM mijozlar WHERE email = 'Mijoz7@misol.uz' OR telefon = '998900000500';
```

```text
QUERY PLAN
`--MULTI-INDEX OR
   |--INDEX 1
   |  `--SEARCH mijozlar USING INDEX m_email (email=?)
   `--INDEX 2
      `--SEARCH mijozlar USING INDEX m_telefon (telefon=?)
```

**`count(*)`:**

```sql
EXPLAIN QUERY PLAN SELECT count(*) FROM mijozlar;
```

```text
QUERY PLAN
`--SCAN mijozlar USING COVERING INDEX m_email_lower
```

`SCAN` — butun indeks o'qiladi. Qaysi indeksni tanlash — SQLite rejalashtiruvchisining qarori (bu sinovda `m_email_lower`).

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Ifoda indeksi | `CREATE INDEX … (lower(email))` | `CREATE INDEX … ((lower(email)))` | `CREATE INDEX … (lower(email))` |
| Registrga befarq solishtirish | `lower()` + ifoda indeksi | Standart kollatsiya `_ci` — `lower()` shart emas | `lower()` + ifoda indeksi |
| `text_ustun = son` | Xato: `operator does not exist` | Ishlaydi, indeks bilan qidiruv **yo'q** (ogohlantirish 1739) | Ishlaydi, indeks bilan (TEXT moyilligi) |
| `OR` turli ustunlarda | `BitmapOr` | `index_merge`, `Using union(...)` | `MULTI-INDEX OR` |
| `count(*)` | Butun jadval yoki indeks | Eng kichik ikkilamchi indeks | Butun indeks (`SCAN`) |
| Taxminiy son | `pg_class.reltuples` | `SHOW TABLE STATUS` | — |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `WHERE lower(ustun) = …` oddiy indeks bilan | Indeks qidiruv uchun ishlamaydi — butun jadval (sinovda 10 ms va 0.023 ms) | Ifoda indeksi; MySQL'da — kollatsiyani tekshirish |
| `WHERE extract(year FROM sana) = 2025` / `year(sana)` | Indeks ishlamaydi, taxmin noto'g'ri (sinovda 54×) | Oraliq: `sana >= … AND sana < …` |
| Matn ustunini son bilan solishtirish (MySQL) | Xato yo'q, faqat ogohlantirish — sekinlik sezilmay qoladi (100 000 yozuv va 1 yozuv) | Parametr turini ustun turiga moslash; `SHOW WARNINGS` |
| Telefon, pochta indeksi kabi "raqamlar"ni matn ustunida saqlab, ilovada son sifatida yuborish | Yuqoridagi muammo | Ilova va sxemada bir xil tur |
| `OR` qismlaridan birida indeks yo'q | Birlashtirib bo'lmaydi — butun jadval (PG hujjati 11.5; SQLite: har qism alohida indekslanadigan bo'lishi kerak) | Har qism ustuniga indeks |
| Har sahifada `SELECT count(*)` katta jadvaldan | Ish jadval hajmiga proporsional | Taxminiy son (`reltuples`, `SHOW TABLE STATUS`) yoki hisoblagich jadvali (MySQL hujjati) |

## Amaliyot

1. PostgreSQL'da `WHERE email ILIKE 'mijoz500@misol.uz'` ning rejasini oling. `m_email_lower` ishlatildimi? Shartni qanday qayta yozsangiz, ishlatiladi?
2. `WHERE sana + 30 > current_date` shartini ustun yalang'och qoladigan qilib qayta yozing va ikkala rejani solishtiring.
3. MySQL'da `telefon` ustuniga `CAST(998900000500 AS CHAR)` bilan solishtiring. `SHOW WARNINGS` nima deydi?
4. PostgreSQL'da `m_telefon` indeksini o'chirib, `OR` so'rovining rejasini qayta oling. Nima o'zgardi?
5. 1 000 000 qatorli jadvalda `count(*)` ni `SET max_parallel_workers_per_gather = 0` bilan bajaring va vaqtni solishtiring.

## Rasmiy hujjat

- PostgreSQL — 11.7. Indexes on Expressions: <https://www.postgresql.org/docs/18/indexes-expressional.html>
- PostgreSQL — 11.5. Combining Multiple Indexes: <https://www.postgresql.org/docs/18/indexes-bitmap-scans.html>
- PostgreSQL — 9.21. Aggregate Functions (`count`): <https://www.postgresql.org/docs/18/functions-aggregate.html>
- PostgreSQL — 52.51. `pg_statistic` (ifoda indekslari statistikasi): <https://www.postgresql.org/docs/18/catalog-pg-statistic.html>
- MySQL — 14.3 Type Conversion in Expression Evaluation: <https://dev.mysql.com/doc/refman/9.7/en/type-conversion.html>
- MySQL — 10.2.1.3 Index Merge Optimization: <https://dev.mysql.com/doc/refman/9.7/en/index-merge-optimization.html>
- MySQL — 15.1.18 CREATE INDEX Statement (Functional Key Parts): <https://dev.mysql.com/doc/refman/9.7/en/create-index.html>
- MySQL — 14.19.1 Aggregate Function Descriptions (`COUNT`): <https://dev.mysql.com/doc/refman/9.7/en/aggregate-functions.html>
- MySQL — 12.3.1 Collation Naming Conventions: <https://dev.mysql.com/doc/refman/9.7/en/charset-collation-names.html>
- SQLite — The SQLite Query Optimizer Overview (OR optimizations): <https://www.sqlite.org/optoverview.html>
- SQLite — Datatypes In SQLite (4.2. Type Conversions Prior To Comparison): <https://www.sqlite.org/datatype3.html>
