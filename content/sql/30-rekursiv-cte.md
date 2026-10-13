# 30 — Rekursiv CTE

[← Oldingi: CTE](29-cte.md) · [Mundarija](README.md) · [Keyingi: Window funksiyalar →](31-window-funksiyalar.md)

## Tushuncha

PostgreSQL hujjatiga ko'ra `RECURSIVE` `WITH` ni oddiy qulaylikdan standart SQL'da boshqa yo'l bilan qilib bo'lmaydigan imkoniyatga aylantiradi: CTE **o'z natijasiga** murojaat qila oladi. SQLite hujjati: rekursiv CTE daraxt (tree) va graf (graph) bo'ylab yurish imkonini beradi.

**Daraxt** — har element bitta "ota"ga ega bo'lgan ierarxiya: tashkilot tuzilmasi, kategoriyalar, izohga javoblar. **Graf** — elementlar orasidagi ixtiyoriy bog'lanishlar: yo'llar, do'stlik, bog'liqliklar. Grafda **aylana** (cycle) bo'lishi mumkin: A → B → C → A.

### Tuzilish

```sql
WITH RECURSIVE nom (ustunlar) AS (
    boshlang'ich so'rov          -- o'ziga murojaat qilmaydi
    UNION ALL                    -- yoki UNION
    rekursiv so'rov              -- FROM da nom ga bir marta murojaat
)
SELECT … FROM nom;
```

- **Boshlang'ich qism** (non-recursive term) — birinchi qatorlar. O'ziga murojaat qilmaydi.
- **Rekursiv qism** (recursive term) — oldingi qadamda chiqqan qatorlardan yangilarini hosil qiladi.
- `UNION ALL` — hamma qator qoladi; `UNION` — takrorlar olib tashlanadi.

### Qanday bajariladi

PostgreSQL hujjatidagi algoritm. Nomiga qaramay, rekursiv so'rov ichkarida **takrorlash** (iteratsiya) bilan bajariladi:

1. Boshlang'ich qism hisoblanadi (`UNION` bo'lsa — takrorlar tashlanadi). Qatorlar natijaga va **ishchi jadval**ga (working table) yoziladi.
2. Ishchi jadval bo'sh bo'lmaguncha:
   - rekursiv qism hisoblanadi — o'ziga murojaat o'rniga **faqat ishchi jadval** (oxirgi qadamda chiqqan qatorlar) qo'yiladi;
   - `UNION` bo'lsa — takrorlar va avval chiqqan qatorlarning takrorlari tashlanadi;
   - qolgan qatorlar natijaga qo'shiladi va yangi ishchi jadvalga aylanadi.

Rekursiv qism yangi qator bermay qo'yganda so'rov tugaydi. Demak to'xtash sharti (masalan, `WHERE n < 100`) yoki takrorlanmaydigan ma'lumot **shart**. Aks holda so'rov cheksiz ishlaydi.

### Cheklovlar

Hujjatlarga ko'ra rekursiv qismda:

- CTE'ga **bir marta** va faqat `FROM` da murojaat qilinadi (subquery ichida emas);
- agregat funksiyalar va window funksiyalar ishlatilmaydi (uchala tizim);
- MySQL'da qo'shimcha: `GROUP BY`, `ORDER BY`, `DISTINCT` ham yo'q; CTE `LEFT JOIN` ning o'ng tomonida turmaydi.

MySQL hujjati yana bir muhim narsani aytadi: natija ustunlarining tiplari **faqat boshlang'ich qismdan** aniqlanadi.

### Tartib: chuqurlik yoki kenglik bo'yicha

Daraxtni ikki tartibda chiqarish mumkin:

- **kenglik bo'yicha** (breadth-first) — avval bir daraja, keyin keyingisi: direktor, uning o'rinbosarlari, ularning xodimlari;
- **chuqurlik bo'yicha** (depth-first) — har shoxni oxirigacha: direktor, birinchi o'rinbosar, uning xodimlari, keyin ikkinchi o'rinbosar.

PostgreSQL hujjatiga ko'ra so'rov qatorlarni qaysi tartibda "ko'rishi"ni boshqarib bo'lmaydi. Lekin tartib ustunini hisoblab, oxirida shu bo'yicha saralash mumkin: chuqurlik uchun — **yo'l** (path, o'tilgan elementlar ro'yxati), kenglik uchun — **daraja** (depth). Hujjatga ko'ra algoritm amalda kenglik bo'yicha chiqaradi, lekin bu ichki tafsilot, unga tayanish noto'g'ri.

### Aylanalarni aniqlash

Hujjatga ko'ra ba'zan `UNION ALL` o'rniga `UNION` yetarli: takror qatorlar tashlanadi va aylana to'xtaydi. Lekin qatorda `qadam` kabi har safar o'zgaradigan ustun bo'lsa, qatorlar to'liq takrorlanmaydi va `UNION` yordam bermaydi. Standart yo'l — **o'tilgan nuqtalar ro'yxatini** saqlab, yangi nuqta unda bor-yo'qligini tekshirish.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Daraxt — SQLite hujjatidagi `org` jadvali; graf — aylanali yo'llar:

```sql
CREATE TABLE org (name varchar(20) PRIMARY KEY, boss varchar(20));
INSERT INTO org VALUES
    ('Alice',NULL), ('Bob','Alice'), ('Cindy','Alice'),
    ('Dave','Bob'), ('Emma','Bob'), ('Fred','Cindy'), ('Gail','Cindy');

CREATE TABLE yol (dan varchar(5), ga varchar(5));
INSERT INTO yol VALUES ('A','B'), ('B','C'), ('C','A'), ('C','D');
```

```text
org:        Alice                yol:   A → B → C → D
           /     \                      ↑       |
         Bob     Cindy                  └───────┘
        /   \    /   \
     Dave  Emma Fred  Gail
```

Natijalar PostgreSQL'dan.

### Sonlar ketma-ketligi

PostgreSQL hujjatidagi misol — 1 dan 100 gacha yig'indi:

```sql
WITH RECURSIVE t(n) AS (
    VALUES (1)
    UNION ALL
    SELECT n + 1 FROM t WHERE n < 100
)
SELECT sum(n) FROM t;
```

```text
 sum  
------
 5050
(1 row)
```

Har qadamda ishchi jadvalda bitta qator: 1, 2, …, 100. 100-qadamda `WHERE n < 100` hech narsa o'tkazmaydi — so'rov tugaydi.

### Daraxt: darajalar

```sql
WITH RECURSIVE ostida(name, daraja) AS (
    SELECT name, 0 FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT name, daraja FROM ostida ORDER BY daraja, name;
```

```text
 name  | daraja 
-------+--------
 Alice |      0
 Bob   |      1
 Cindy |      1
 Dave  |      2
 Emma  |      2
 Fred  |      2
 Gail  |      2
(7 rows)
```

1-qadam: `Alice` (boshlig'i yo'q). 2-qadam: boshlig'i `Alice` bo'lganlar. 3-qadam: boshlig'i `Bob` yoki `Cindy` bo'lganlar. 4-qadam: hech kim — tugadi.

### Daraxt: yo'l va chuqurlik bo'yicha tartib

```sql
WITH RECURSIVE ostida(name, daraja, yol) AS (
    SELECT name, 0, CAST(name AS text) FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1, u.yol || '/' || o.name
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT repeat('   ', daraja) || name AS daraxt, yol FROM ostida ORDER BY yol;
```

```text
   daraxt   |       yol        
------------+------------------
 Alice      | Alice
    Bob     | Alice/Bob
       Dave | Alice/Bob/Dave
       Emma | Alice/Bob/Emma
    Cindy   | Alice/Cindy
       Fred | Alice/Cindy/Fred
       Gail | Alice/Cindy/Gail
(7 rows)
```

`yol` bo'yicha saralash — chuqurlik bo'yicha tartib: har shox oxirigacha chiqadi. (Matnli yo'l bilan saralash nomlarda `/` dan kichik belgilar bo'lmasa to'g'ri ishlaydi; PostgreSQL hujjati shuning uchun massiv ishlatadi.)

### PostgreSQL: `SEARCH`

PostgreSQL'da tartib ustunini qo'lda yozish shart emas — `SEARCH` bandi uni o'zi qo'shadi:

```sql
WITH RECURSIVE ostida(name, daraja) AS (
    SELECT name, 0 FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1 FROM org o JOIN ostida u ON o.boss = u.name
) SEARCH DEPTH FIRST BY name SET tartib
SELECT repeat('   ', daraja) || name AS daraxt, tartib FROM ostida ORDER BY tartib;
```

```text
   daraxt   |          tartib          
------------+--------------------------
 Alice      | {(Alice)}
    Bob     | {(Alice),(Bob)}
       Dave | {(Alice),(Bob),(Dave)}
       Emma | {(Alice),(Bob),(Emma)}
    Cindy   | {(Alice),(Cindy)}
       Fred | {(Alice),(Cindy),(Fred)}
       Gail | {(Alice),(Cindy),(Gail)}
(7 rows)
```

`SEARCH BREADTH FIRST BY name SET tartib` — kenglik bo'yicha; `tartib` ustuni `(daraja, name)` ko'rinishida:

```text
 name  | daraja |  tartib   
-------+--------+-----------
 Alice |      0 | (0,Alice)
 Bob   |      1 | (1,Bob)
 Cindy |      1 | (1,Cindy)
 Dave  |      2 | (2,Dave)
…
```

Hujjatga ko'ra bu sintaksis ichkarida yuqoridagi qo'lda yozilgan shakllarga o'xshash ko'rinishga yoyiladi.

### Graf: aylana

`A` dan qayerlarga borish mumkin? Oddiy yozilsa, `A → B → C → A → …` cheksiz aylanadi. Sinash uchun PostgreSQL hujjatidagi usul — tashqi so'rovga `LIMIT`:

```sql
WITH RECURSIVE borish(nuqta, qadam) AS (
    SELECT 'A'::varchar, 0
    UNION ALL
    SELECT y.ga, b.qadam + 1 FROM yol y JOIN borish b ON y.dan = b.nuqta
)
SELECT * FROM borish LIMIT 8;
```

```text
 nuqta | qadam 
-------+-------
 A     |     0
 B     |     1
 C     |     2
 A     |     3
 D     |     3
 B     |     4
 C     |     5
 A     |     6
(8 rows)
```

Hujjatga ko'ra bu ishlaydi, chunki PostgreSQL CTE'dan faqat tashqi so'rov so'ragancha qator hisoblaydi. Lekin hujjat buni production'da ishlatishni **tavsiya qilmaydi**: boshqa tizimlar boshqacha ishlashi mumkin, va tashqi so'rov saralasa yoki birlashtirsa, baribir hamma qatorni olishga urinadi.

**`UNION` bilan.** Faqat nuqtalar kerak bo'lsa (`qadam` siz), qatorlar takrorlanadi va `UNION` aylanani to'xtatadi:

```sql
WITH RECURSIVE borish(nuqta) AS (
    SELECT 'A'::varchar
    UNION
    SELECT y.ga FROM yol y JOIN borish b ON y.dan = b.nuqta
)
SELECT * FROM borish;
```

```text
 nuqta 
-------
 A
 B
 C
 D
(4 rows)
```

### PostgreSQL: `CYCLE`

`qadam` kerak bo'lsa, `UNION` yordam bermaydi. `CYCLE` bandi aylanani o'zi aniqlaydi:

```sql
WITH RECURSIVE borish(nuqta, qadam) AS (
    SELECT 'A'::varchar, 0
    UNION ALL
    SELECT y.ga, b.qadam + 1 FROM yol y JOIN borish b ON y.dan = b.nuqta
) CYCLE nuqta SET aylana USING yol_
SELECT nuqta, qadam, aylana, yol_ FROM borish;
```

```text
 nuqta | qadam | aylana |       yol_        
-------+-------+--------+-------------------
 A     |     0 | f      | {(A)}
 B     |     1 | f      | {(A),(B)}
 C     |     2 | f      | {(A),(B),(C)}
 A     |     3 | t      | {(A),(B),(C),(A)}
 D     |     3 | f      | {(A),(B),(C),(D)}
(5 rows)
```

Hujjatga ko'ra `CYCLE` birinchi kuzatiladigan ustunlarni (`nuqta`), keyin aylana belgisi ustunini (`aylana`), keyin yo'l ustunini (`yol_`) oladi. `A` ikkinchi marta uchraganda `aylana = t` bo'ldi va shu qatordan keyin rekursiya davom etmadi. Hujjat ichkarida bu `path || id` massivi va `id = ANY(path)` tekshiruvi bilan qo'lda yozilgan shaklga aylanishini ko'rsatadi.

### Rekursiv qismda `ORDER BY`, `LIMIT` va tiplar

PostgreSQL'da rekursiv qismda `ORDER BY` ham, `LIMIT` ham yo'q:

```sql
WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM t LIMIT 5) SELECT * FROM t;
```

```text
ERROR:  LIMIT in a recursive query is not implemented
```

`ORDER BY` uchun xato: `ORDER BY in a recursive query is not implemented`. To'xtatish — `WHERE` sharti bilan (yoki sinovda tashqi `LIMIT`).

Ustun tiplari ikkala qismda mos bo'lishi kerak. `'abc'` (o'lchamsiz satr) bilan `str || str` ishladi (`abc`, `abcabc`, `abcabcabcabc`). Boshlang'ich qismda tip toraytirilsa — xato va maslahat:

```sql
WITH RECURSIVE cte AS (
    SELECT 1 AS n, 'abc'::varchar(3) AS str
    UNION ALL
    SELECT n + 1, str || str FROM cte WHERE n < 3
)
SELECT * FROM cte;
```

```text
ERROR:  recursive query "cte" column 2 has type character varying(3) in non-recursive term but type character varying overall
HINT:  Cast the output of the non-recursive term to the correct type.
```

Shuning uchun yo'l misolida `CAST(name AS text)`: `name` — `varchar(20)`, birlashtirilgan yo'l esa `text`.

### Cheklov xatolari

`RECURSIVE` unutilsa va rekursiv qismda agregat bo'lsa:

```sql
WITH ostida(name) AS (
    SELECT name FROM org WHERE name = 'Bob'
    UNION ALL
    SELECT o.name FROM org o JOIN ostida u ON o.boss = u.name
) SELECT * FROM ostida;

WITH RECURSIVE s(n) AS (SELECT 1 UNION ALL SELECT max(n) + 1 FROM s WHERE n < 3)
SELECT * FROM s;
```

```text
ERROR:  relation "ostida" does not exist
DETAIL:  There is a WITH item named "ostida", but it cannot be referenced from this part of the query.
HINT:  Use WITH RECURSIVE, or re-order the WITH items to remove forward references.
ERROR:  aggregate functions are not allowed in a recursive query's recursive term
```

## Dialektlar

### MySQL

**Asosiy so'rovlar bir xil.** Daraxt darajalari, `UNION DISTINCT` bilan aylanani to'xtatish — natijalar PostgreSQL bilan bir xil. `RECURSIVE` unutilsa, hujjatda aytilgan xato:

```text
ERROR 1146 (42S02) at line 12: Table 'qollanma.ostida' doesn't exist
```

Agregat:

```text
ERROR 3575 (HY000) at line 13: Recursive Common Table Expression 's' can contain neither aggregation nor window functions in recursive query block
```

**`VALUES (1)` emas, `VALUES ROW(1)`.** MySQL'ning `VALUES` operatori `ROW()` talab qiladi: `VALUES (1)` — sintaksis xatosi, `VALUES ROW(1)` yoki `SELECT 1` — 5050.

**`SEARCH` va `CYCLE` yo'q.** Yo'l ustuni qo'lda yoziladi. `||` MySQL'da sukut bo'yicha mantiqiy `OR`, shuning uchun `CONCAT`:

```sql
WITH RECURSIVE ostida(name, daraja, yol) AS (
    SELECT name, 0, CAST(name AS CHAR(200)) FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1, CONCAT(u.yol, '/', o.name)
    FROM org o JOIN ostida u ON o.boss = u.name
)
SELECT CONCAT(REPEAT('   ', daraja), name) AS daraxt, yol FROM ostida ORDER BY yol;
```

Natija PostgreSQL bilan bir xil.

**Ustun kengligi boshlang'ich qismdan.** Hujjatga ko'ra tiplar va uzunliklar faqat boshlang'ich qismdan olinadi. Rekursiv qism kengroq qiymat bersa, nostrict rejimda u **kesiladi**, strict rejimda xato beradi. Hujjatdagi misol (sukut bo'yicha `STRICT_TRANS_TABLES` yoqilgan):

```sql
WITH RECURSIVE cte AS (
    SELECT 1 AS n, 'abc' AS str
    UNION ALL
    SELECT n + 1, CONCAT(str, str) FROM cte WHERE n < 3
)
SELECT * FROM cte;
```

```text
ERROR 1406 (22001) at line 3: Data too long for column 'str' at row 1
```

Yechim — hujjatdagidek boshlang'ich qismda `CAST(… AS CHAR(n))`. Yuqoridagi yo'l misolida `CAST(name AS CHAR(200))` shuning uchun.

**`cte_max_recursion_depth`.** Hujjatga ko'ra bu o'zgaruvchi rekursiya darajalari sonini cheklaydi, sukut bo'yicha **1000**. Aylanali graf `UNION ALL` bilan:

```text
ERROR 3636 (HY000) at line 26: Recursive query aborted after 1001 iterations. Try increasing @@cte_max_recursion_depth to a larger value.
```

Cheklov **qatorlar** emas, **qadamlar** soniga. Shuning uchun 100 qadamli to'g'ri so'rov ham cheklov kichik bo'lsa to'xtaydi:

```sql
SET SESSION cte_max_recursion_depth = 10;
WITH RECURSIVE t(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM t WHERE n < 100) SELECT sum(n) FROM t;
```

```text
ERROR 3636 (HY000) at line 45: Recursive query aborted after 11 iterations. Try increasing @@cte_max_recursion_depth to a larger value.
```

Hujjatdagi boshqa himoyalar: `max_execution_time` (sessiya vaqt chegarasi), `MAX_EXECUTION_TIME(…)` optimizator ishorasi, `/*+ SET_VAR(cte_max_recursion_depth = 1M) */` bitta so'rov uchun.

**Rekursiv qismda `LIMIT`.** MySQL hujjatiga ko'ra rekursiv qismdagi `LIMIT` tashqi `LIMIT` bilan bir xil natija beradi, lekin samaraliroq — kerakli qatorlar soni yig'ilgach, hosil qilish to'xtaydi:

```sql
WITH RECURSIVE borish(nuqta, qadam) AS (
    SELECT CAST('A' AS CHAR(5)), 0
    UNION ALL
    SELECT y.ga, b.qadam + 1 FROM yol y JOIN borish b ON y.dan = b.nuqta LIMIT 8
)
SELECT * FROM borish;
```

Natija PostgreSQL'dagi `LIMIT 8` bilan bir xil (8 qator).

### SQLite

**Algoritm — navbat.** SQLite hujjatidagi algoritm PostgreSQL'nikidan biroz farq qiladi: boshlang'ich qatorlar **navbatga** (queue) qo'yiladi; har qadamda navbatdan **bitta** qator olinadi, natijaga yoziladi va rekursiv qism faqat shu qator bilan ishga tushiriladi.

**Rekursiv qismda `ORDER BY`, `LIMIT`, `OFFSET` bor.** Hujjatga ko'ra:

- `ORDER BY` navbatdan qaysi qator olinishini belgilaydi. Shu bilan chuqurlik yoki kenglik bo'yicha qidiruvni boshqarish mumkin;
- `LIMIT` rekursiv jadvalga qo'shiladigan qatorlar sonini cheklaydi; yetganda rekursiya to'xtaydi;
- `ORDER BY` siz navbatdan olish tartibi aniqlanmagan (hozircha FIFO, lekin hujjat bunga tayanmaslikni aytadi).

Hujjatdagi misol: `ORDER BY 2 DESC` (daraja kamayishi) — chuqurlik bo'yicha:

```sql
WITH RECURSIVE ostida(name, daraja) AS (
    SELECT name, 0 FROM org WHERE boss IS NULL
    UNION ALL
    SELECT o.name, u.daraja + 1 FROM org o JOIN ostida u ON o.boss = u.name
    ORDER BY 2 DESC
)
SELECT substr('............', 1, daraja * 3) || name FROM ostida;
```

```text
Alice
...Bob
......Dave
......Emma
...Cindy
......Fred
......Gail
```

Tashqi `ORDER BY` yo'q — tartib rekursiv qismdagi `ORDER BY` dan kelgan. `ORDER BY 2` (o'sish) bo'lsa — kenglik bo'yicha.

**`LIMIT` bilan aylana** — PostgreSQL va MySQL'dagidek 8 qator (`A, B, C, A, D, B, C, A`). `UNION` bilan — `A, B, C, D`.

**`RECURSIVE` shart emas.** Hujjatga ko'ra SQL:1999 talab qilsa ham, SQLite SQL Server va Oracle bilan moslik uchun `RECURSIVE` ni talab qilmaydi. PostgreSQL va MySQL xato bergan so'rov SQLite'da ishladi:

```text
Bob
Dave
Emma
```

**Agregat** — xato: `recursive aggregate queries not supported`. **`SEARCH`/`CYCLE` yo'q**:

```text
Parse error near line 29: near "DEPTH": syntax error
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `WITH RECURSIVE` | Ha | Ha | Ha |
| `RECURSIVE` siz o'ziga murojaat | Xato | Xato 1146 | Ishlaydi |
| `UNION` (takrorsiz) | Ha | `UNION [DISTINCT]` | Ha |
| Rekursiv qismda `ORDER BY` | Yo'q (`not implemented`) | Yo'q | Ha (qidiruv tartibi) |
| Rekursiv qismda `LIMIT` | Yo'q (`not implemented`; tashqi `LIMIT` ishlaydi) | Ha | Ha |
| `SEARCH DEPTH/BREADTH FIRST` | Ha | Yo'q | Yo'q (`ORDER BY` orqali) |
| `CYCLE` | Ha | Yo'q | Yo'q |
| Cheksiz rekursiyadan himoya | Yo'q (o'zingiz to'xtatasiz) | `cte_max_recursion_depth` = 1000 | Yo'q (`LIMIT`) |
| Ustun tipi | Ikkala qism tipi mos bo'lishi kerak, aks holda xato | Faqat boshlang'ich qismdan | Har qiymat o'z tipida |

PostgreSQL "himoya yo'q" — hujjatda MySQL'dagi kabi chuqurlik o'zgaruvchisi tasvirlanmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| To'xtash sharti yo'q | Cheksiz so'rov (MySQL'da 1001 qadamda xato) | `WHERE` sharti, `UNION`, `CYCLE` yoki yo'l tekshiruvi |
| Aylanali grafda `UNION ALL` + o'zgaruvchan ustun | `UNION` ham to'xtatmaydi | O'tilgan nuqtalar yo'li; PG'da `CYCLE` |
| Natija tartibiga tayanish | Tartib aniqlanmagan | Daraja yoki yo'l ustuni bo'yicha `ORDER BY` |
| MySQL'da boshlang'ich qismda qisqa satr | Xato 1406 yoki kesilish | `CAST(… AS CHAR(n))` |
| MySQL'da yo'lni `||` bilan qurish | `||` — `OR` | `CONCAT` |
| Production'da tashqi `LIMIT` ga ishonish (PG) | Saralash/`JOIN` bo'lsa ishlamaydi; boshqa tizimlarda boshqacha | Haqiqiy to'xtash sharti |
| SQLite'da `RECURSIVE` ni tushirib qoldirish | PG/MySQL'ga ko'chirganda xato | Doim `WITH RECURSIVE` |
| Rekursiv qismda agregat | Uchala tizimda xato | Agregatni tashqi so'rovga chiqarish |

## Amaliyot

1. 1 dan 10 gacha sonlar va ularning kvadratlarini rekursiv CTE bilan chiqaring.
2. `org` da `Cindy` ning barcha bo'ysunuvchilarini (bevosita va bilvosita) toping.
3. Teskari yo'nalish: `Gail` dan yuqoriga — uning barcha boshliqlari zanjiri.
4. Har xodim uchun ostidagi xodimlar sonini toping (rekursiv CTE + tashqi `GROUP BY`).
5. `yol` jadvaliga `D → A` qo'shing. PostgreSQL'da `CYCLE` bilan, MySQL'da qo'lda yo'l ustuni bilan (`FIND_IN_SET` yoki `LIKE`) aylanani to'xtating.
6. MySQL'da `cte_max_recursion_depth` ni 5 ga tushiring va 2-mashqni qayta ishga tushiring. Nima bo'ldi va nega?

## Rasmiy hujjat

- PostgreSQL — 7.8.2. Recursive Queries (Search Order, Cycle Detection): <https://www.postgresql.org/docs/18/queries-with.html#QUERIES-WITH-RECURSIVE>
- MySQL — 15.2.20 WITH (Recursive Common Table Expressions, Limiting Common Table Expression Recursion): <https://dev.mysql.com/doc/refman/9.7/en/with.html>
- SQLite — The WITH Clause (Recursive Common Table Expressions): <https://www.sqlite.org/lang_with.html>
