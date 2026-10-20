# 45 — `EXPLAIN`

[← Oldingi: Indeks turlari](44-indeks-turlari.md) · [Mundarija](README.md) · [Keyingi: Planner va statistika →](46-planner-va-statistika.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/45-1-tushuncha.jpg">
    <source src="/video/sql/45-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/45-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/45-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>45.1-video. EXPLAIN tushunchasi: reja daraxti, cost va actual natijalar</figcaption>
</figure>

41–44-boblarda `EXPLAIN` ko'p ishlatildi. Bu bob — uni **o'qish**.

**So'rov rejasi** (query plan) — ma'lumotlar bazasi so'rovni **qanday** bajarishi: qaysi jadvalni qanday o'qishi (to'liq yoki indeks orqali), jadvallarni qanday birlashtirishi, qayerda saralashi. SQL'da biz **nima** kerakligini yozamiz, rejani esa rejalashtiruvchi (planner, optimizer) tanlaydi. `EXPLAIN` shu tanlovni ko'rsatadi.

### Reja — daraxt

PostgreSQL hujjatiga ko'ra so'rov rejasi — **tugunlar daraxti** (tree of plan nodes):

- eng pastdagi tugunlar — **skanerlash tugunlari** (scan nodes): jadvaldan "xom" qatorlarni qaytaradi — ketma-ket skanerlash, indeks skanerlashi, bitmap indeks skanerlashi;
- ularning ustida — birlashtirish (join), agregatsiya, saralash kabi amallar tugunlari;
- har tugun pastdagilardan qatorlarni oladi va yuqoriga beradi. Natija eng yuqori tugundan chiqadi.

Daraxt chapga surilgan qatorlar bilan chiziladi: `->` belgisi bilan boshlangan qator — o'zidan yuqoridagi tugunning **bolasi**.

### Taxminiy narx: `EXPLAIN`

Oddiy `EXPLAIN` so'rovni **bajarmaydi** — faqat rejani va **taxminlarni** ko'rsatadi. PostgreSQL hujjatidagi misol:

```text
Seq Scan on tenk1  (cost=0.00..445.00 rows=10000 width=244)
```

Qavsdagi sonlar (chapdan o'ngga):

| Qism | Ma'nosi |
| --- | --- |
| `cost=0.00..` | **Boshlash narxi** — birinchi qatorni berishdan oldingi ish (masalan, saralash) |
| `..445.00` | **To'liq narx** — tugun oxirigacha bajarilsa |
| `rows=10000` | Tugun qaytaradigan **taxminiy qatorlar soni** |
| `width=244` | Qatorning taxminiy o'rtacha kengligi (bayt) |

Hujjatdagi muhim tushuntirishlar:

- narx — **ixtiyoriy birliklarda**, odatda disk sahifasini o'qish = 1.0 deb olinadi. Bu millisekund **emas**;
- yuqori tugun narxi barcha bolalarining narxini **o'z ichiga oladi**;
- narx faqat rejalashtiruvchi ta'sir qila oladigan narsalarni hisobga oladi — masalan, natijani mijozga uzatish vaqti kirmaydi;
- `rows` — tugun **oxirigacha** bajarilsa. Ota tugun (masalan, `LIMIT`) uni erta to'xtatishi mumkin.

### Haqiqiy natija: `EXPLAIN ANALYZE`

`ANALYZE` bilan so'rov **haqiqatan bajariladi** va har tugun uchun haqiqiy vaqt va qatorlar soni taxmin yonida ko'rsatiladi:

```text
(cost=4.37..41.61 rows=10 width=8) (actual time=0.002..0.004 rows=10.00 loops=5)
```

- `actual time=birinchi..oxirgi` — **millisekundlarda**, haqiqiy vaqt. Hujjat ogohlantiradi: narx birliklari bilan solishtirib bo'lmaydi;
- `rows` — haqiqiy qatorlar soni;
- **`loops`** — tugun necha marta bajarilgan. Ichma-ich takrorlashda (nested loop) ichki tugun har tashqi qator uchun bajariladi. Hujjatga ko'ra `actual time` va `rows` — **bitta bajarilishga o'rtacha**; umumiy vaqt uchun `loops` ga ko'paytirish kerak.

Hujjatning asosiy maslahati: **eng muhimi — taxminiy qatorlar soni haqiqatga yaqinmi**. Katta farq — rejalashtiruvchi noto'g'ri ma'lumot bilan qaror qilganining belgisi (41-bobdagi MySQL misoli: 99 907 kutildi, 196 000 chiqdi). Statistika — 46-bob.

**`BUFFERS`** — hujjatga ko'ra o'qilgan bloklar: `shared hit` — keshda topilgan (diskka borilmagan), `read` — o'qilgan, `dirtied`, `written`. PostgreSQL 18 da `ANALYZE` bilan buffer ma'lumoti **avtomatik** qo'shiladi.

**Xavf.** Hujjatdagi "Muhim" bloki: `ANALYZE` bilan operator **haqiqatan bajariladi**. `SELECT` natijasi tashlanadi, lekin boshqa yon ta'sirlar sodir bo'ladi. `INSERT`, `UPDATE`, `DELETE`, `MERGE` ni ma'lumotga ta'sir qilmasdan tekshirish uchun:

```sql
BEGIN;
EXPLAIN ANALYZE …;
ROLLBACK;
```

### Ehtiyot bo'lish kerak bo'lgan joylar

PostgreSQL hujjatining "Caveats" bo'limi:

- `EXPLAIN ANALYZE` vaqtiga natijani tarmoq orqali uzatish kirmaydi; o'lchashning o'zi qo'shimcha vaqt oladi;
- natijalarni boshqa sharoitga ko'chirmang: **kichik jadvaldagi reja katta jadvalga tegishli emas** — narxlar chiziqli emas. Bitta sahifali jadvalda indeks bo'lsa ham deyarli doim ketma-ket skanerlash tanlanadi;
- `LIMIT` erta to'xtatgan tugunda taxmin va haqiqat mos kelmasligi normal.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/45-2-kod.jpg">
    <source src="/video/sql/45-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/45-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/45-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>45.2-video. EXPLAIN amaliyoti: Nested Loop, Hash Join va DML tahlili</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. 20 000 mijoz (har 10-chi — Samarqand), 200 000 buyurtma (har mijozda 10 ta), `buyurtmalar.mijoz_id` da indeks.

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, shahar text NOT NULL);
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int NOT NULL REFERENCES mijozlar,
                          summa int NOT NULL, sana date NOT NULL);
INSERT INTO mijozlar SELECT g, CASE WHEN g % 10 = 0 THEN 'Samarqand' ELSE 'Toshkent' END
FROM generate_series(1, 20000) g;
INSERT INTO buyurtmalar SELECT g, (g % 20000) + 1, (g * 37) % 100000, date '2026-01-01' + (g % 365)
FROM generate_series(1, 200000) g;
CREATE INDEX buyurtmalar_mijoz_idx ON buyurtmalar (mijoz_id);
ANALYZE mijozlar; ANALYZE buyurtmalar;
```

### Eng sodda reja va narx

```sql
EXPLAIN SELECT * FROM buyurtmalar;
```

```text
                             QUERY PLAN                             
--------------------------------------------------------------------
 Seq Scan on buyurtmalar  (cost=0.00..3082.00 rows=200000 width=16)
```

`WHERE` yo'q — butun jadval ketma-ket o'qiladi; 200 000 qator, har biri ~16 bayt.

### Daraxt: pastdan yuqoriga o'qish

```sql
EXPLAIN SELECT * FROM buyurtmalar WHERE summa > 99000 ORDER BY summa LIMIT 10;
```

```text
 Limit  (cost=3579.63..3580.77 rows=10 width=16)
   ->  Gather Merge  (cost=3579.63..3822.05 rows=2127 width=16)
         Workers Planned: 1
         ->  Sort  (cost=2579.62..2582.75 rows=1251 width=16)
               Sort Key: summa
               ->  Parallel Seq Scan on buyurtmalar  (cost=0.00..2552.59 rows=1251 width=16)
                     Filter: (summa > 99000)
```

Pastdan:

1. `Parallel Seq Scan` — jadval ikki jarayonda (asosiy + 1 ishchi) o'qiladi, `Filter` sharti qo'llanadi. Har jarayonda ~1251 qator kutiladi.
2. `Sort` — har jarayon o'z qismini `summa` bo'yicha saralaydi. Boshlash narxi (2579.62) skanerlash to'liq narxiga yaqin — saralash hamma qatorni ko'rmaguncha birinchi qatorni bera olmaydi.
3. `Gather Merge` — saralangan qismlarni bitta tartiblangan oqimga birlashtiradi (~2127 qator).
4. `Limit` — birinchi 10 tasini oladi.

### `EXPLAIN ANALYZE`: taxmin va haqiqat

Besh mijozning buyurtmalari, shahar bo'yicha yig'indi:

```sql
EXPLAIN ANALYZE
SELECT m.shahar, sum(b.summa)
FROM mijozlar m JOIN buyurtmalar b ON b.mijoz_id = m.id
WHERE m.id <= 5
GROUP BY m.shahar;
```

```text
 GroupAggregate  (cost=218.35..218.75 rows=2 width=17) (actual time=0.035..0.035 rows=1.00 loops=1)
   Group Key: m.shahar
   Buffers: shared hit=63
   ->  Sort  (cost=218.35..218.48 rows=50 width=13) (actual time=0.030..0.031 rows=50.00 loops=1)
         Sort Key: m.shahar
         Sort Method: quicksort  Memory: 26kB
         Buffers: shared hit=63
         ->  Nested Loop  (cost=4.66..216.94 rows=50 width=13) (actual time=0.008..0.025 rows=50.00 loops=1)
               Buffers: shared hit=63
               ->  Index Scan using mijozlar_pkey on mijozlar m  (cost=0.29..8.38 rows=5 width=13) (actual time=0.002..0.002 rows=5.00 loops=1)
                     Index Cond: (id <= 5)
                     Index Searches: 1
                     Buffers: shared hit=3
               ->  Bitmap Heap Scan on buyurtmalar b  (cost=4.37..41.61 rows=10 width=8) (actual time=0.002..0.004 rows=10.00 loops=5)
                     Recheck Cond: (m.id = mijoz_id)
                     Heap Blocks: exact=50
                     Buffers: shared hit=60
                     ->  Bitmap Index Scan on buyurtmalar_mijoz_idx  (cost=0.00..4.37 rows=10 width=0) (actual time=0.001..0.001 rows=10.00 loops=5)
                           Index Cond: (mijoz_id = m.id)
                           Index Searches: 5
                           Buffers: shared hit=10
 Planning:
   Buffers: shared hit=60 read=3
 Planning Time: 0.162 ms
 Execution Time: 0.044 ms
```

O'qish:

- **`Nested Loop`** (ichma-ich takrorlash) — tashqi tomon (`mijozlar`, 5 qator) har qatori uchun ichki tomon (`buyurtmalar` indeks orqali) bajariladi;
- ichki tugunda **`loops=5`**, `rows=10.00` — har bajarilishda o'rtacha 10 qator, jami 50. Taxmin ham `rows=10` — **aniq mos**;
- `GroupAggregate` taxmini `rows=2`, haqiqatda `rows=1.00` — 1–5 mijozlar hammasi Toshkent'dan. Kichik farq, zarari yo'q;
- `Buffers: shared hit=63` — hammasi keshda; `Execution Time: 0.044 ms`.

### Katta birlashtirish: `Hash Join`

Barcha 200 000 buyurtma:

```sql
EXPLAIN (ANALYZE, COSTS OFF)
SELECT m.shahar, count(*) FROM mijozlar m JOIN buyurtmalar b ON b.mijoz_id = m.id GROUP BY m.shahar;
```

```text
 Finalize GroupAggregate (actual time=19.023..19.482 rows=2.00 loops=1)
   …
               ->  Partial HashAggregate (actual time=18.053..18.053 rows=2.00 loops=2)
                     Group Key: m.shahar
                     Batches: 1  Memory Usage: 32kB
                     ->  Hash Join (actual time=1.578..12.559 rows=100000.00 loops=2)
                           Hash Cond: (b.mijoz_id = m.id)
                           ->  Parallel Seq Scan on buyurtmalar b (actual time=0.002..2.630 rows=100000.00 loops=2)
                           ->  Hash (actual time=1.564..1.564 rows=20000.00 loops=2)
                                 Buckets: 32768  Batches: 1  Memory Usage: 1194kB
                                 ->  Seq Scan on mijozlar m (actual time=0.009..0.730 rows=20000.00 loops=2)
 …
 Execution Time: 19.497 ms
```

Endi rejalashtiruvchi boshqa yo'l tanladi:

- **`Hash Join`** — kichik jadval (`mijozlar`) xotirada **hash jadvalga** yig'iladi (`Hash` tugunida: 1194 kB, `Batches: 1` — xotiraga sig'di), keyin katta jadval bir marta o'qilib, har qatori hash'dan qidiriladi;
- 200 000 ta indeks qidiruvi (nested loop) o'rniga ikki jadvalni bir marta ketma-ket o'qish arzonroq.

Bir xil `JOIN`, boshqa hajm — boshqa reja. Hujjatdagi "natijalarni boshqa sharoitga ko'chirmang" ogohlantirishi shu.

### Saralash usuli

```sql
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF)
SELECT * FROM buyurtmalar ORDER BY summa DESC, id LIMIT 5;
```

```text
         ->  Sort (actual rows=4.00 loops=2)
               Sort Key: summa DESC, id
               Sort Method: top-N heapsort  Memory: 25kB
```

`top-N heapsort` — `LIMIT` borligi uchun hamma qatorni to'liq saralash emas, faqat eng yaxshi N tasi xotirada ushlanadi (25 kB). `TIMING OFF` — tugunlar vaqtini o'lchamaslik (o'lchashning o'z narxini kamaytiradi).

### DML ni xavfsiz tekshirish

```sql
BEGIN;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF) DELETE FROM buyurtmalar WHERE sana = '2026-03-01';
ROLLBACK;
SELECT count(*) FROM buyurtmalar WHERE sana = '2026-03-01';
```

```text
 Delete on buyurtmalar (actual rows=0.00 loops=1)
   Buffers: shared hit=1630
   ->  Seq Scan on buyurtmalar (actual rows=548.00 loops=1)
         Filter: (sana = '2026-03-01'::date)
         Rows Removed by Filter: 199452
         Buffers: shared hit=1082
ROLLBACK
 count 
-------
   548
```

548 qator **haqiqatan o'chirildi** (reja shuni ko'rsatadi), lekin `ROLLBACK` ularni qaytardi. `ROLLBACK` siz `EXPLAIN ANALYZE DELETE` — oddiy `DELETE`.

### Mashina uchun format: JSON

```sql
EXPLAIN (FORMAT JSON, COSTS OFF) SELECT * FROM buyurtmalar WHERE id = 5;
```

```text
 [
   {
     "Plan": {
       "Node Type": "Index Scan",
       "Index Name": "buyurtmalar_pkey",
       "Relation Name": "buyurtmalar",
       "Index Cond": "(id = 5)",
       …
     }
   }
 ]
```

JSON (yoki `YAML`, `XML`) — rejani dastur bilan tahlil qilish va vizualizatsiya vositalari uchun.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/45-3-dialektlar.jpg">
    <source src="/video/sql/45-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/45-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/45-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>45.3-video. Dialektlar: MySQL (TRADITIONAL/TREE) va SQLite (EXPLAIN QUERY PLAN)</figcaption>
</figure>

### MySQL

MySQL hujjatiga ko'ra `EXPLAIN` uch formatda: `TRADITIONAL` (jadval), `TREE` (daraxt), `JSON`. Sukut formati `explain_format` o'zgaruvchisiga bog'liq — bizning serverda u `TREE` (`SELECT @@explain_format`), shuning uchun oldingi boblarda oddiy `EXPLAIN` ham daraxt chiqardi.

**`TRADITIONAL` — har jadvalga bitta qator:**

```sql
EXPLAIN FORMAT=TRADITIONAL
SELECT m.shahar, sum(b.summa) FROM mijozlar m JOIN buyurtmalar b ON b.mijoz_id = m.id
WHERE m.id <= 5 GROUP BY m.shahar;
```

```text
+----+-------------+-------+-------+---------------+----------+---------+---------------+------+----------+------------------------------+
| id | select_type | table | type  | possible_keys | key      | key_len | ref           | rows | filtered | Extra                        |
+----+-------------+-------+-------+---------------+----------+---------+---------------+------+----------+------------------------------+
|  1 | SIMPLE      | m     | range | PRIMARY       | PRIMARY  | 4       | NULL          |    5 |   100.00 | Using where; Using temporary |
|  1 | SIMPLE      | b     | ref   | mijoz_id      | mijoz_id | 4       | qollanma.m.id |   10 |   100.00 | NULL                         |
+----+-------------+-------+-------+---------------+----------+---------+---------------+------+----------+------------------------------+
```

Eng muhim ustunlar (MySQL hujjatining "EXPLAIN Output Format" bo'limi):

| Ustun | Ma'nosi |
| --- | --- |
| `type` | Kirish turi: `ALL` — to'liq skanerlash (eng yomon), `index` — butun indeks, `range` — indeks oralig'i, `ref` — indeks bo'yicha tenglik, `eq_ref` — `JOIN` da unique kalit bo'yicha, `const` — bitta qator |
| `possible_keys` / `key` | Ishlatilishi mumkin bo'lgan va tanlangan indeks |
| `rows` | Tekshiriladigan qatorlar taxmini |
| `filtered` | Shart bilan qoladigan qatorlar taxminiy foizi |
| `Extra` | Qo'shimcha: `Using index` (qoplovchi), `Using where`, `Using temporary` (vaqtinchalik jadval), `Using filesort` (alohida saralash) |

Masalan, `ORDER BY summa DESC LIMIT 5` (indekssiz):

```text
| buyurtmalar | ALL | NULL | NULL | … | 200226 | 100.00 | Using filesort |
```

`ALL` + `Using filesort` — butun jadval va alohida saralash.

**`TREE` va `EXPLAIN ANALYZE`** — PostgreSQL'ga o'xshash daraxt. Hujjatga ko'ra `EXPLAIN ANALYZE` operatorni bajaradi va har **iterator** uchun taxminiy narx va qatorlar, birinchi qator vaqti, umumiy vaqt (ms, bir nechta loop bo'lsa — o'rtacha), haqiqiy qatorlar va loop'lar sonini beradi:

```text
-> Table scan on <temporary>  (actual time=0.291..0.291 rows=1 loops=1)
    -> Aggregate using temporary table  (actual time=0.29..0.29 rows=1 loops=1)
        -> Nested loop inner join  (cost=18.9 rows=50.4) (actual time=0.0224..0.0511 rows=50 loops=1)
            -> Filter: (m.id <= 5)  (cost=1.26 rows=5) (actual time=0.00596..0.00721 rows=5 loops=1)
                -> Index range scan on m using PRIMARY over (id <= 5)  (cost=1.26 rows=5) (actual time=0.00504..0.00608 rows=5 loops=1)
            -> Index lookup on b using mijoz_id (mijoz_id = m.id)  (cost=2.72 rows=10.1) (actual time=0.00767..0.00832 rows=10 loops=5)
```

PostgreSQL bilan bir xil reja (nested loop, 5 loop × 10 qator); agregatsiya — vaqtinchalik jadval orqali.

**Katta birlashtirishda farq.** 200 000 buyurtmada PostgreSQL `Hash Join` ni tanladi. MySQL esa nested loop'da qoldi — 20 000 ta indeks qidiruvi:

```text
        -> Nested loop inner join  (cost=28079 rows=207849) (actual time=0.0772..34.7 rows=200000 loops=1)
            -> Table scan on m  (cost=2088 rows=20640) (actual time=0.0752..1.74 rows=20000 loops=1)
            -> Covering index lookup on b using mijoz_id (mijoz_id = m.id)  (cost=0.252 rows=10.1) (actual time=895e-6..0.00129 rows=10 loops=20000)
```

`loops=20000` — ichki qidiruv 20 000 marta. Umumiy so'rov ~62 ms (PostgreSQL: ~19.5 ms). MySQL hujjatidagi o'z misolida `Inner hash join` ham uchraydi — MySQL ham hash join qila oladi, lekin bu yerda indeksli nested loop'ni arzonroq hisobladi.

**`EXPLAIN ANALYZE` va DML.** Hujjatga ko'ra `EXPLAIN ANALYZE` `SELECT`, **ko'p jadvalli** `UPDATE`/`DELETE` va `TABLE` bilan ishlaydi. Bitta jadvalli `DELETE`:

```text
-> <not executable by iterator executor>
```

### SQLite

**`EXPLAIN QUERY PLAN`** — hujjatga ko'ra SQLite so'rovni qanday bajarishining **yuqori darajadagi** tavsifi, eng avvalo **indekslardan qanday foydalanishi**. (Oddiy `EXPLAIN` esa SQLite'da ichki bytecode dasturini chiqaradi.) Reja ham daraxt:

```text
-- 5 mijoz, birlashtirish va GROUP BY
QUERY PLAN
|--SEARCH m USING INTEGER PRIMARY KEY (rowid<?)
|--SEARCH b USING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)
`--USE TEMP B-TREE FOR GROUP BY

-- hamma mijozlar
QUERY PLAN
|--SCAN m
|--SEARCH b USING COVERING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)
`--USE TEMP B-TREE FOR GROUP BY

-- ORDER BY summa DESC LIMIT 5
QUERY PLAN
|--SCAN buyurtmalar
`--USE TEMP B-TREE FOR ORDER BY
```

Asosiy so'zlar:

| Yozuv | Ma'nosi |
| --- | --- |
| `SCAN t` | To'liq skanerlash (yoki `USING [COVERING] INDEX` — butun indeks) |
| `SEARCH t USING INDEX i (ustun=?)` | Indeks bo'yicha qidiruv |
| `USING INTEGER PRIMARY KEY (rowid=?)` | `rowid` bo'yicha qidiruv |
| `USE TEMP B-TREE FOR ORDER BY / GROUP BY` | Saralash uchun vaqtinchalik indeks |
| `LIST SUBQUERY` / `CORRELATED SCALAR SUBQUERY` | Subquery (27-bob) |

SQLite birlashtirishlarni doim **nested loop** bilan bajaradi (hujjat: "SQLite implements joins as nested loops") — tartibi qatorlar ketma-ketligida: yuqoridagisi tashqi tsikl.

Subquery'lar:

```text
-- WHERE id IN (SELECT mijoz_id FROM buyurtmalar WHERE summa > 99990)
|--SEARCH mijozlar USING INTEGER PRIMARY KEY (rowid=?)
`--LIST SUBQUERY 1
   `--SCAN buyurtmalar

-- SELECT …, (SELECT count(*) FROM buyurtmalar b WHERE b.mijoz_id = m.id) FROM mijozlar m
|--SCAN m
`--CORRELATED SCALAR SUBQUERY 1
   `--SEARCH b USING COVERING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)
```

**Haqiqiy vaqt va qatorlar yo'q.** SQLite rejasida taxminiy narx ham, haqiqiy qatorlar ham ko'rsatilmaydi. CLI'dagi `.scanstats on` bunday statistikani berishi mumkin, lekin bizning yig'ishda u yo'q (`.scanstats not available in this build`). Vaqtni butun so'rov uchun `.timer on` bilan o'lchash mumkin; `.eqp on` — har so'rovdan oldin rejani avtomatik chiqaradi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Faqat reja | `EXPLAIN` | `EXPLAIN [FORMAT=TRADITIONAL/TREE/JSON]` | `EXPLAIN QUERY PLAN` |
| Bajarib, haqiqiy natija | `EXPLAIN ANALYZE` | `EXPLAIN ANALYZE` (`TREE`) | Yo'q (`.timer on` — butun so'rov) |
| Taxminiy narx va qatorlar | `cost=…  rows=…` | `cost=… rows=…`; `TRADITIONAL` da `rows`, `filtered` | Yo'q |
| Bloklar | `BUFFERS` (18 da `ANALYZE` bilan avtomatik) | — | — |
| DML'ni `ANALYZE` bilan | Bajaradi — `BEGIN … ROLLBACK` | Ko'p jadvalli `UPDATE`/`DELETE` | — |
| Birlashtirish usullari | Nested Loop, Hash Join, Merge Join | Nested loop, hash join | Faqat nested loop |
| Mashina formati | `FORMAT JSON/YAML/XML` | `FORMAT=JSON` | `sqlite3_step()` jadvali (4 ustun) |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `cost` ni millisekund deb o'qish | Ixtiyoriy birliklar | Vaqt uchun `EXPLAIN ANALYZE` |
| Faqat oddiy `EXPLAIN` ga tayanish | Taxminlar noto'g'ri bo'lishi mumkin | `ANALYZE`: taxminiy va haqiqiy `rows` ni solishtirish |
| `loops` ni e'tiborsiz qoldirish | Ichki tugun vaqti/qatorlari — bitta bajarilishga | `actual time × loops` |
| `EXPLAIN ANALYZE DELETE …` ni tranzaksiyasiz | Ma'lumot haqiqatan o'chadi | `BEGIN; … ROLLBACK;` |
| Kichik test jadvalidagi rejadan production haqida xulosa | Hujjat: narxlar chiziqli emas, reja boshqacha bo'ladi | Haqiqiy hajmdagi ma'lumot |
| `ANALYZE` (statistika) yig'ilmagan jadvalda reja baholash | Rejalashtiruvchi taxminiy qiymatlar bilan ishlaydi | Avval statistika (`ANALYZE`, 46-bob) |
| MySQL `type = ALL` ni e'tiborsiz qoldirish | To'liq skanerlash | Indeks yoki so'rovni qayta yozish |
| `Using filesort` / `USE TEMP B-TREE FOR ORDER BY` ni ko'rmaslik | Katta jadvalda qimmat saralash | Mos indeks (42-bob) |

## Amaliyot

1. `SELECT * FROM buyurtmalar WHERE mijoz_id = 77 ORDER BY sana` ning rejasini uchala tizimda oling. Saralash qayerda bajariladi? `(mijoz_id, sana)` indeksi qo'shilgach nima o'zgaradi?
2. PostgreSQL'da `m.id <= 5`, `m.id <= 500`, `m.id <= 20000` uchun `JOIN` rejalarini solishtiring. Qaysi nuqtada `Nested Loop` dan `Hash Join` ga o'tadi?
3. `EXPLAIN ANALYZE` natijasida taxminiy va haqiqiy `rows` keskin farq qiladigan so'rov toping (maslahat: ikki bog'liq ustunga shart, masalan `WHERE shahar = 'Samarqand' AND id % 10 = 0`).
4. `UPDATE buyurtmalar SET summa = summa + 1 WHERE sana = '2026-03-01'` ni PostgreSQL'da `EXPLAIN ANALYZE` bilan, ma'lumotni o'zgartirmasdan tekshiring.
5. MySQL'da `EXPLAIN FORMAT=TRADITIONAL` bilan `type` ustunida `const`, `eq_ref`, `ref`, `range`, `ALL` qiymatlarini beradigan beshta so'rov yozing.

## Rasmiy hujjat

- PostgreSQL — 14.1. Using EXPLAIN (EXPLAIN Basics, EXPLAIN ANALYZE, Caveats): <https://www.postgresql.org/docs/18/using-explain.html>
- PostgreSQL — EXPLAIN (`ANALYZE`, `BUFFERS`, `FORMAT`): <https://www.postgresql.org/docs/18/sql-explain.html>
- MySQL — 15.8.2 EXPLAIN Statement (EXPLAIN ANALYZE): <https://dev.mysql.com/doc/refman/9.7/en/explain.html>
- MySQL — 10.8.2 EXPLAIN Output Format: <https://dev.mysql.com/doc/refman/9.7/en/explain-output.html>
- SQLite — EXPLAIN QUERY PLAN: <https://www.sqlite.org/eqp.html>
- SQLite — The SQLite Query Optimizer Overview (Joins): <https://www.sqlite.org/optoverview.html>
