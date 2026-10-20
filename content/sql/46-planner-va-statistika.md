# 46 — Planner va statistika

[← Oldingi: `EXPLAIN`](45-explain.md) · [Mundarija](README.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/46-1-tushuncha.jpg">
    <source src="/video/sql/46-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/46-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/46-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>46.1-video. Planner va statistika tushunchasi</figcaption>
</figure>

45-bobda ko'rildi: rejalashtiruvchi har reja uchun **narx** hisoblaydi va eng arzonini tanlaydi. Narx esa asosan bitta savolga bog'liq — **nechta qator** qaytadi? Buni u jadvalni o'qimasdan, oldindan yig'ilgan **statistika** bo'yicha taxmin qiladi. Statistika noto'g'ri bo'lsa — taxmin noto'g'ri, reja ham noto'g'ri (41-bobdagi MySQL: 99 907 kutildi, 196 000 chiqdi).

PostgreSQL hujjati (14.2): rejalashtiruvchiga so'rov qaytaradigan qatorlar sonini baholash kerak. Ko'p so'rovlar `WHERE` tufayli qatorlarning faqat bir qismini oladi, shuning uchun har shartning **selektivligini** (selectivity) — shartga mos qatorlar ulushini — baholash kerak.

### PostgreSQL statistikasi

**Jadval hajmi.** `pg_class` jadvalida `reltuples` (qatorlar soni) va `relpages` (disk bloklari). Hujjatga ko'ra ular samaradorlik uchun **har o'zgarishda yangilanmaydi** — `VACUUM`, `ANALYZE` va `CREATE INDEX` kabi buyruqlar yangilaydi, shuning uchun odatda biroz eskirgan. Rejalashtiruvchi ularni jadvalning joriy fizik hajmiga moslab masshtablaydi.

**Ustun statistikasi.** `pg_statistic` katalogida, o'qish uchun qulayi — **`pg_stats`** view'i. Hujjatga ko'ra bu yozuvlarni `ANALYZE` va `VACUUM ANALYZE` yangilaydi va ular yangi yig'ilgan bo'lsa ham **doim taxminiy** (`ANALYZE` jadvalning tasodifiy namunasini o'qiydi). Asosiy maydonlar:

| `pg_stats` ustuni | Ma'nosi |
| --- | --- |
| `n_distinct` | Turli qiymatlar soni (manfiy bo'lsa — qatorlar soniga nisbati) |
| `most_common_vals` / `most_common_freqs` | Eng ko'p uchraydigan qiymatlar va ularning ulushi |
| `histogram_bounds` | Qolgan qiymatlarni teng guruhlarga bo'luvchi chegaralar |
| `correlation` | Qiymatlar tartibi bilan fizik tartib o'rtasidagi bog'liqlik (BRIN uchun muhim, 44-bob) |

Qancha qiymat saqlanishi — **statistika maqsadi** (statistics target): sukut bo'yicha `default_statistics_target = 100`, alohida ustun uchun `ALTER TABLE … ALTER COLUMN … SET STATISTICS n`.

**Avtomatik yig'ish.** PostgreSQL'da **autovacuum** fon jarayoni o'zgargan jadvallar uchun `ANALYZE` ni o'zi bajaradi (65-bob). Lekin katta `INSERT`/`UPDATE` dan keyin u ishga tushguncha vaqt o'tadi — shu orada statistika eskirgan.

### Bog'liq ustunlar: kengaytirilgan statistika

Hujjatning "Extended Statistics" bo'limi: sekin so'rovlarning tez-tez uchraydigan sababi — so'rov shartlaridagi ustunlar **o'zaro bog'liq** (correlated). Rejalashtiruvchi odatda shartlarni **mustaqil** deb hisoblaydi: `tuman = 'T17'` ulushi 1%, `viloyat = 'V7'` — 10%, demak ikkalasi — 0.1%. Lekin tuman viloyatni **aniqlasa**, haqiqiy natija 1%. Oddiy statistika har ustun uchun alohida yig'ilgani sababli bunday bog'liqlikni bilmaydi.

Yechim — **statistika obyekti**:

```sql
CREATE STATISTICS nom (dependencies) ON viloyat, tuman FROM jadval;
ANALYZE jadval;
```

Hujjatga ko'ra:

- obyekt yaratish faqat "qiziqish" yozuvini yaratadi; ma'lumotni keyingi `ANALYZE` (qo'lda yoki avtomatik) yig'adi;
- ustunlar kombinatsiyalari juda ko'p bo'lgani uchun bu avtomatik qilinmaydi — qaysi ustunlar bog'liqligini dasturchi ko'rsatadi;
- turlar: `dependencies` (**funksional bog'liqlik** — 26-, 38-boblardagi tushuncha: `a` ni bilish `b` ni aniqlaydi), `ndistinct` (guruhlar soni), `mcv` (eng ko'p uchraydigan kombinatsiyalar).

### Rejalashtiruvchiga ta'sir qilish

**PostgreSQL** — so'rov ichidagi ishoralar (hints) yo'q. Hujjat `enable_seqscan`, `enable_indexscan`, `enable_hashjoin` va boshqa `enable_*` parametrlarini "rejalarga ta'sir qilishning **qo'pol** usuli" deydi: tanlangan reja yomon bo'lsa — **vaqtinchalik** yechim. Yaxshiroq yo'llar (hujjat): narx konstantalarini sozlash, `ANALYZE` ni qo'lda bajarish, `default_statistics_target` ni oshirish, alohida ustunlar uchun `SET STATISTICS`.

**MySQL** — ikki usul (hujjat):

- `optimizer_switch` o'zgaruvchisi — barcha keyingi so'rovlarga ta'sir qiladi;
- **optimizer hints** — so'rov ichida `/*+ … */` izohi ko'rinishida, faqat shu operator uchun. Masalan: `/*+ NO_INDEX(t idx) */`, `/*+ JOIN_ORDER(…) */`, `/*+ SET_VAR(…) */`. Hint `optimizer_switch` dan ustun turadi. Eski usul — indeks ishoralari: `USE INDEX`, `FORCE INDEX`, `IGNORE INDEX` (41-bob).

**SQLite** — `INDEXED BY indeks` (shu indeksni ishlatishga majburlash), `NOT INDEXED` (indeks ishlatmaslik), `CROSS JOIN` (jadvallar tartibini qotirish, 25-bob).

### MySQL statistikasi

- **Indeks statistikasi** — InnoDB `ANALYZE TABLE` bilan (va fon jarayonida) yig'adi. Indekslangan ustunda tenglik uchun optimizator yana **index dives** dan foydalanadi — so'rov paytida indeksga to'g'ridan-to'g'ri "sho'ng'ib" qatorlarni taxmin qilish.
- **Histogramma** — `ANALYZE TABLE t UPDATE HISTOGRAM ON ustun [WITH n BUCKETS]` (n — 1…1024, sukut 100). Natija `information_schema.column_statistics` da JSON ko'rinishida. Ikki tur: `singleton` (har qiymat uchun alohida savat) va `equi-height`.

MySQL hujjatining muhim qoidasi: **histogrammalar asosan indeksi yo'q ustunlar uchun foydali.** Optimizator range optimizer taxminlarini histogrammadan afzal ko'radi; indekslangan ustunda tenglik uchun index dives yaxshiroq taxmin berishi mumkin, shuning uchun histogramma "shart emas". Bu 41-bobdagi kuzatuvni tushuntiradi: indeksli `holat` ga histogramma qo'shish rejani o'zgartirmadi.

### SQLite statistikasi

Hujjatga ko'ra `ANALYZE` jadvallar va indekslar haqidagi statistikani ichki jadvallarga (`sqlite_stat1` va boshqalar) yozadi. Hujjat: `ANALYZE` **hech qachon majburiy emas**, lekin ko'p mumkin bo'lgan rejali murakkab so'rovlarda rejalashtiruvchiga yordam beradi. Statistikasiz SQLite taxminiy qiymatlardan foydalanadi (masalan, indeks chap ustunida o'rtacha 10 ta takror — 42-bob).

Hujjatning tavsiyasi — **`PRAGMA optimize`**: kerak bo'lganda `ANALYZE` ni o'zi bajaradi. Qisqa ulanishli ilovalar — ulanishni yopishdan oldin; uzoq ulanishlilar — ochilganda `PRAGMA optimize=0x10002;`, keyin vaqti-vaqti bilan (masalan, kuniga bir marta). Sxema o'zgarganda, ayniqsa `CREATE INDEX` dan keyin — doim. 3.46.0 dan beri u katta bazada ham tez tugashi uchun `ANALYZE` hajmini o'zi cheklaydi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/46-2-kod.jpg">
    <source src="/video/sql/46-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/46-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/46-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>46.2-video. Planner va statistika amaliyoti</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `pg_stats` ni o'qish

100 000 manzil: 10 ta viloyat, 100 ta tuman (har tuman bitta viloyatda — `tuman` `viloyat` ni aniqlaydi), `holat` — 2% `'yangi'`. Natijani boshqarish uchun autovacuum o'chirilgan.

```sql
CREATE TABLE manzillar (id int PRIMARY KEY, viloyat text NOT NULL, tuman text NOT NULL, holat text NOT NULL)
    WITH (autovacuum_enabled = false);
INSERT INTO manzillar
SELECT g, 'V' || (g % 10), 'T' || (g % 100), CASE WHEN g % 50 = 0 THEN 'yangi' ELSE 'faol' END
FROM generate_series(1, 100000) g;
ANALYZE manzillar;

SELECT attname, n_distinct, most_common_vals, most_common_freqs
FROM pg_stats WHERE tablename = 'manzillar' AND attname IN ('holat', 'viloyat') ORDER BY attname;
SELECT reltuples, relpages FROM pg_class WHERE relname = 'manzillar';
```

```text
 attname | n_distinct |        most_common_vals         |                    most_common_freqs
---------+------------+---------------------------------+-------------------------------------------------------
 holat   |          2 | {faol,yangi}                    | {0.97966665,0.020333333}
 viloyat |         10 | {V8,V5,V4,V2,V3,V1,V7,V6,V0,V9} | {0.103933334,0.101966664,0.100933336,…}
(2 rows)

 reltuples | relpages 
-----------+----------
    100000 |      541
```

`holat` ning haqiqiy ulushlari 98% va 2% — statistika 97.97% va 2.03% deydi: namuna asosida, **taxminiy**. Bunga qarab `holat = 'yangi'` uchun rejalashtiruvchi ~2033 qator kutadi.

### Bog'liq ustunlar va `CREATE STATISTICS`

```sql
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT * FROM manzillar WHERE tuman = 'T17' AND viloyat = 'V7';
```

```text
 Seq Scan on manzillar  (cost=0.00..2041.00 rows=89 width=15) (actual rows=1000.00 loops=1)
   Filter: ((tuman = 'T17'::text) AND (viloyat = 'V7'::text))
   Rows Removed by Filter: 99000
```

Taxmin **89**, haqiqat **1000** — 11 baravar kam. Rejalashtiruvchi `1% × 10%` deb hisobladi, lekin `T17` dagi hamma manzil `V7` da — ikkinchi shart hech narsani kamaytirmaydi.

```sql
CREATE STATISTICS manzil_dep (dependencies) ON viloyat, tuman FROM manzillar;
ANALYZE manzillar;
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT * FROM manzillar WHERE tuman = 'T17' AND viloyat = 'V7';
SELECT statistics_name, dependencies FROM pg_stats_ext WHERE tablename = 'manzillar';
```

```text
 Seq Scan on manzillar  (cost=0.00..2041.00 rows=963 width=15) (actual rows=1000.00 loops=1)

 statistics_name |     dependencies     
-----------------+----------------------
 manzil_dep      | {"3 => 2": 1.000000}
```

Taxmin endi **963**. `{"3 => 2": 1.000000}` — 3-ustun (`tuman`) 2-ustunni (`viloyat`) to'liq (1.0) aniqlaydi. Bu yerda reja o'zgarmadi (baribir to'liq skanerlash), lekin katta so'rovda bunday 11 baravar xato `JOIN` usuli va tartibini noto'g'ri tanlashga olib keladi (45-bob).

### Eskirgan statistika

200 000 ta `'yangi'` qator qo'shamiz va `ANALYZE` qilmaymiz:

```sql
INSERT INTO manzillar SELECT g, 'V1', 'T1', 'yangi' FROM generate_series(100001, 300000) g;
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF) SELECT * FROM manzillar WHERE holat = 'yangi';
ANALYZE manzillar;
EXPLAIN (ANALYZE, TIMING OFF, SUMMARY OFF, BUFFERS OFF) SELECT * FROM manzillar WHERE holat = 'yangi';
```

```text
 Seq Scan on manzillar  (cost=0.00..5369.69 rows=6026 width=15) (actual rows=202000.00 loops=1)

 Seq Scan on manzillar  (cost=0.00..5372.00 rows=202490 width=15) (actual rows=202000.00 loops=1)
```

`ANALYZE` dan oldin: **6026** kutildi, **202 000** chiqdi — 33 baravar. Rejalashtiruvchi jadval hajmini masshtabladi (hujjatda aytilganidek), lekin `'yangi'` ulushi hali eski — 2%. `ANALYZE` dan keyin taxmin deyarli aniq. Katta yuklashdan keyin `ANALYZE` — shuning uchun (21-bob).

### `enable_*`: rejani majburlash

300 000 qator, 2/3 qismi `'yangi'`, `holat` da indeks:

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM manzillar WHERE holat = 'yangi';
SET enable_seqscan = off;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM manzillar WHERE holat = 'yangi';
RESET enable_seqscan;
```

```text
 Finalize Aggregate  (cost=5121.95..5121.96 rows=1 width=8) (actual rows=1.00 loops=1)
   …
               ->  Parallel Seq Scan on manzillar  (cost=0.00..3827.88 rows=117541 width=0) (actual rows=100000.00 loops=2)
 Execution Time: 6.753 ms

 Finalize Aggregate  (cost=6622.36..6622.37 rows=1 width=8) (actual rows=1.00 loops=1)
   …
               ->  Parallel Bitmap Heap Scan on manzillar  (cost=2237.03..5328.29 rows=117541 width=0) (actual rows=100000.00 loops=2)
                     ->  Bitmap Index Scan on m_holat  (cost=0.00..2187.07 rows=199820 width=0) (actual rows=200000.00 loops=1)
 Execution Time: 6.145 ms
```

`enable_seqscan = off` ketma-ket skanerlashni "taqiqlamaydi", balki uni juda qimmat qilib ko'rsatadi — rejalashtiruvchi indeksli rejani oldi. Narx bo'yicha u qimmatroq (6622 va 5121), amalda esa bu sinovda vaqtlar yaqin (6.1 va 6.8 ms). Hujjat tavsiyasidek, bu — **tekshirish** vositasi: ikkala variantni o'lchash. Production'da doimiy yechim emas.

PostgreSQL'da `/*+ IndexScan(t) */` kabi yozuv — shunchaki SQL izohi; sinovda so'rov odatdagidek bajarildi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/46-3-dialektlar.jpg">
    <source src="/video/sql/46-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/46-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/46-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>46.3-video. Dialektlar: MySQL va SQLite da statistika va hintlar</figcaption>
</figure>

### MySQL

**Histogramma indeksi yo'q ustunda yordam beradi.** Indekssiz `holat` (2% `'yangi'`):

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT * FROM b WHERE holat = 'yangi';
ANALYZE TABLE b UPDATE HISTOGRAM ON holat WITH 10 BUCKETS;
EXPLAIN FORMAT=TRADITIONAL SELECT * FROM b WHERE holat = 'yangi';
```

```text
| type | … | rows   | filtered | Extra       |
| ALL  | … | 199876 |    10.00 | Using where |

| ALL  | … | 199876 |     2.00 | Using where |
```

Histogrammasiz `filtered = 10.00` — optimizatorning umumiy taxmini (10%). Histogrammadan keyin — **2.00**, haqiqatga mos. Indekssiz jadvalda reja baribir `ALL`, lekin `JOIN` larda bu taxmin jadvallar tartibiga ta'sir qiladi.

Histogrammaning o'zi:

```sql
SELECT column_name, JSON_EXTRACT(histogram, '$."histogram-type"') AS tur,
       JSON_EXTRACT(histogram, '$.buckets') AS buckets
FROM information_schema.column_statistics WHERE table_name = 'b';
```

```text
| holat | "singleton" | [["base64:type254:eWFuZ2k=", 0.0200140361430684], ["base64:type254:eW9waWxnYW4=", 1.0]] |
```

Ikki qiymat — `singleton`: `'yangi'` (base64 da) uchun yig'ma ulush 0.02, `'yopilgan'` uchun 1.0.

**Indeksli ustunda — optimizer hint.** 41-bobdagi holat takrorlandi: `holat` ga indeks qo'yilgach, `'yopilgan'` (98%) uchun MySQL indeksni tanladi (`rows=99938`, aslida 196 000) va **~93 ms** ketdi. Hint bilan:

```sql
EXPLAIN ANALYZE SELECT /*+ NO_INDEX(b b_holat) */ sum(summa) FROM b WHERE holat = 'yopilgan';
```

```text
-> Aggregate: sum(b.summa)  (cost=66162 rows=1) (actual time=30.3..30.3 rows=1 loops=1)
    -> Filter: (b.holat = 'yopilgan')  (cost=20108 rows=199876) (actual time=0.121..25.9 rows=196000 loops=1)
        -> Table scan on b  (cost=20108 rows=199876) (actual time=0.12..14.7 rows=200000 loops=1)
```

**~30 ms** — uch baravar tez. Hint faqat shu so'rovga ta'sir qiladi. Noto'g'ri yozilgan hint xato bermaydi — ogohlantirish beradi va e'tiborsiz qoldiriladi:

```text
| Warning | 3128 | Unresolved name `b`@`select#1` `nomavjud` for NO_INDEX hint |
```

### SQLite

**`sqlite_stat1` va `PRAGMA optimize`.** Ikki indeksli jadval (`holat` — 2 qiymat, `mijoz` — 20 000 qiymat):

```sql
SELECT count(*) FROM sqlite_master WHERE name = 'sqlite_stat1';   -- 0: statistika yo'q
PRAGMA optimize;
SELECT * FROM sqlite_stat1;
ANALYZE;
SELECT * FROM sqlite_stat1;
```

```text
0
b|b_mijoz|200000 10
b|b_holat|200000 2001
b|b_mijoz|200000 10
b|b_holat|200000 100000
```

`sqlite_stat1` formati: jadval, indeks, keyin "qatorlar soni, chap ustunning bir qiymatiga o'rtacha qatorlar". `PRAGMA optimize` statistikani yig'di, lekin hujjatda aytilganidek, `ANALYZE` hajmini cheklab: `b_holat` uchun **2001** (taxminiy), to'liq `ANALYZE` esa **100 000** (200 000 / 2) berdi.

**Rejani majburlash — `INDEXED BY`, `NOT INDEXED`:**

```sql
EXPLAIN QUERY PLAN SELECT * FROM b WHERE holat = 'yangi' AND mijoz = 50;
EXPLAIN QUERY PLAN SELECT * FROM b NOT INDEXED WHERE mijoz = 50;
EXPLAIN QUERY PLAN SELECT * FROM b INDEXED BY b_holat WHERE mijoz = 50;
```

```text
`--SEARCH b USING INDEX b_mijoz (mijoz=?)
`--SCAN b
`--SCAN b USING INDEX b_holat
```

- Ikki indeksdan selektivrog'i (`b_mijoz`, bir qiymatga 10 qator) tanlandi.
- `NOT INDEXED` — to'liq skanerlash.
- `INDEXED BY b_holat` — `mijoz` sharti uchun mos bo'lmasa ham shu indeks bo'ylab butun skanerlash. `INDEXED BY` majburlaydi — hatto yomon bo'lsa ham.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Statistika yig'ish | `ANALYZE`, autovacuum | `ANALYZE TABLE`, InnoDB fon jarayoni | `ANALYZE`, `PRAGMA optimize` |
| Ko'rish | `pg_stats`, `pg_class`, `pg_stats_ext` | `information_schema.column_statistics`, `SHOW INDEX` | `sqlite_stat1` |
| Taqsimot | MCV + histogramma (har ustun) | Histogramma — qo'lda, asosan indekssiz ustunlar uchun | Indeks bo'yicha o'rtacha |
| Bog'liq ustunlar | `CREATE STATISTICS` | — | — |
| So'rov ichida hint | Yo'q | `/*+ … */`, `USE/FORCE/IGNORE INDEX` | `INDEXED BY`, `NOT INDEXED`, `CROSS JOIN` |
| Global sozlama | `enable_*`, narx konstantalari | `optimizer_switch` | — |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Katta `INSERT`/`COPY`/`LOAD DATA` dan keyin `ANALYZE` qilmaslik | Taxmin o'nlab baravar xato (sinovda 33×) | Yuklashdan keyin `ANALYZE` |
| Bog'liq ustunlarni mustaqil deb qoldirish (PG) | Kam taxmin — noto'g'ri `JOIN` rejasi | `CREATE STATISTICS (dependencies)` |
| `enable_seqscan = off` ni doimiy sozlamaga qo'yish | Hujjat: "qo'pol, vaqtinchalik" usul; boshqa so'rovlar yomonlashadi | Statistikani tuzatish; `enable_*` faqat sinov uchun |
| MySQL'da indeksli ustunga histogramma qo'yib, reja o'zgarishini kutish | Hujjat: indeksli ustunda index dives afzal | Hint yoki so'rov/indeksni qayta ko'rib chiqish |
| MySQL hint'ida xato | Jimgina e'tiborsiz (faqat ogohlantirish) | `SHOW WARNINGS` |
| SQLite'da `INDEXED BY` ni "maslahat" deb o'ylash | Majburlaydi, yomon reja bo'lsa ham | Avval `ANALYZE` / `PRAGMA optimize` |
| SQLite ilovasida hech qachon `PRAGMA optimize` qilmaslik | Statistika yo'q yoki eski | Hujjatdagi tartib: ulanishni yopishdan oldin, `CREATE INDEX` dan keyin |

## Amaliyot

1. PostgreSQL'da `pg_stats` dan `manzillar.tuman` ustunining `n_distinct` va `correlation` qiymatlarini o'qing. `id` ustuniniki bilan solishtiring.
2. `CREATE STATISTICS … (ndistinct)` yarating va `SELECT viloyat, tuman, count(*) … GROUP BY viloyat, tuman` ning `rows` taxminini oldin va keyin solishtiring.
3. `ALTER TABLE manzillar ALTER COLUMN tuman SET STATISTICS 1000` dan keyin `ANALYZE` qiling. `most_common_vals` dagi qiymatlar soni o'zgardimi?
4. MySQL'da `/*+ JOIN_ORDER(…) */` hint'i bilan 45-bobdagi `mijozlar`/`buyurtmalar` birlashtirishining tartibini o'zgartiring va `EXPLAIN ANALYZE` bilan vaqtni solishtiring.
5. SQLite'da `PRAGMA optimize` dan oldin va keyin `EXPLAIN QUERY PLAN` bilan 42-bobdagi skip-scan so'rovini sinang.

## Rasmiy hujjat

- PostgreSQL — 14.2. Statistics Used by the Planner: <https://www.postgresql.org/docs/18/planner-stats.html>
- PostgreSQL — CREATE STATISTICS: <https://www.postgresql.org/docs/18/sql-createstatistics.html>
- PostgreSQL — 19.7. Query Planning (`enable_*`): <https://www.postgresql.org/docs/18/runtime-config-query.html>
- MySQL — 10.9.6 Optimizer Statistics (histogrammalar): <https://dev.mysql.com/doc/refman/9.7/en/optimizer-statistics.html>
- MySQL — 15.7.3.1 ANALYZE TABLE Statement (Histogram Statistics Analysis): <https://dev.mysql.com/doc/refman/9.7/en/analyze-table.html>
- MySQL — 10.9.3 Optimizer Hints: <https://dev.mysql.com/doc/refman/9.7/en/optimizer-hints.html>
- SQLite — ANALYZE (`PRAGMA optimize`): <https://www.sqlite.org/lang_analyze.html>
