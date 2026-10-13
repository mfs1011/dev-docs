# 41 — Indeks qanday ishlaydi

[← Oldingi: Vaqt, tarix va audit](40-vaqt-tarix-va-audit.md) · [Mundarija](README.md) · [Keyingi: Ko'p ustunli indeks →](42-kop-ustunli-indeks.md)

## Tushuncha

### Indekssiz qidiruv

PostgreSQL hujjatidagi misol: `SELECT content FROM test1 WHERE id = constant` ko'p bajariladi. Hech qanday tayyorgarliksiz tizim butun `test1` jadvalini **qatorma-qator** o'qishi kerak. Qatorlar ko'p bo'lsa-yu, mos keladigani bitta-ikkita bo'lsa — bu aniq samarasiz.

Bu **to'liq skanerlash** (full table scan, sequential scan): SQLite hujjatiga ko'ra jadvalning **har** qatori o'qiladi va shart tekshiriladi.

### Indeks — kitob oxiridagi ko'rsatkich

Hujjatdagi o'xshatish: ilmiy kitoblarda ko'p qidiriladigan atamalar oxirida **alifbo tartibidagi ko'rsatkichda** (index) jamlanadi. O'quvchi ko'rsatkichni tez ko'rib chiqib, kerakli sahifani ochadi — butun kitobni o'qimaydi.

**Indeks** — jadval ustuni (yoki ifodasi) qiymatlarining **tartiblangan** nusxasi, har biri asl qatorga ko'rsatkich bilan. SQLite hujjati buni aniq tasvirlaydi: indeks — asl jadvalga o'xshash boshqa jadval. Unda indekslangan ustun **oldinda** turadi, keyin `rowid`, va qatorlar shu ustun **tartibida** saqlanadi. Tartiblangani uchun unda **ikkilik qidiruv** (binary search) mumkin.

Tezlik farqi (SQLite hujjati): N ta qatorli jadvalda to'liq skanerlash N ga, ikkilik qidiruv esa log N ga proportsional. 10 million qatorda bu taxminan **million baravar** farq.

### B-tree

MySQL hujjatiga ko'ra MySQL indekslarining ko'pchiligi (`PRIMARY KEY`, `UNIQUE`, `INDEX`) **B-tree** da saqlanadi. PostgreSQL hujjatiga ko'ra `CREATE INDEX` sukut bo'yicha ham B-tree yaratadi (boshqa turlar — 44-bob). B-tree — **daraxt**: hujjat iborasi bilan, qidiruv "qidiruv daraxti bo'ylab bir necha daraja pastga tushadi". Har tugun qiymatlar oralig'ini bo'lib, keyingi darajaga yo'naltiradi.

B-tree **tartiblangan** bo'lgani uchun u faqat tenglik (`=`) emas, **oraliq** (`<`, `>`, `BETWEEN`), saralash (`ORDER BY`) va `min`/`max` uchun ham ishlaydi (MySQL hujjatidagi ro'yxat).

### Indeks nimaga yordam beradi

MySQL hujjatidagi ro'yxat:

- `WHERE` shartiga mos qatorlarni tez topish;
- bir nechta indeks bo'lsa — **eng selektiv** (eng kam qator qaytaradigan) indeksni tanlash;
- `JOIN` da boshqa jadvaldan qatorlarni olish. Ustunlar bir xil tip va o'lchamda bo'lsa samaraliroq (37-, 38-boblar);
- indekslangan ustunning `MIN()`/`MAX()` ini topish;
- indeksning chap qismi bo'yicha saralash va guruhlash;
- **qoplovchi indeks** (covering index) — so'rovga kerakli barcha ustunlar indeksda bo'lsa, natija **jadvalga murojaat qilmasdan** indeksdan olinadi.

PostgreSQL hujjati qo'shimcha qiladi: indeks `UPDATE` va `DELETE` dagi qidiruv shartlariga ham yordam beradi.

### PostgreSQL qaysi shartda indeks ishlatadi

PostgreSQL hujjatiga ko'ra indeks quyidagi ko'rinishdagi `WHERE` yoki `JOIN` shartlarini optimallashtiradi:

```text
indekslangan_ustun  indekslanadigan_operator  taqqoslash_qiymati
```

- **indekslangan ustun** — indeks aynan qaysi ustun yoki ifodaga qurilgan bo'lsa, o'sha. Ustunga funksiya yoki amal qo'llansa (`mijoz_id + 0`, `mijoz_id::text`), bu boshqa ifoda va oddiy indeks unga mos kelmaydi (ifoda indeksi — 43-bob);
- **operator** indeksning operator klassiga kirishi kerak (hujjatga ko'ra B-tree uchun `<`, `<=`, `=`, `>=`, `>`);
- **qiymat** jadvalning o'ziga murojaat qilmaydigan va o'zgaruvchan bo'lmagan ifoda.

### Indeks qachon yordam bermaydi

MySQL hujjati: kichik jadvallarda, yoki katta jadvalning **ko'p yoki barcha** qatorlarini o'qiydigan hisobot so'rovlarida indeks kam ahamiyatga ega. **So'rov qatorlarning ko'pini o'qisa, ketma-ket o'qish indeks orqali o'qishdan tezroq** — ketma-ket o'qish diskda "sakrashlar"ni kamaytiradi.

PostgreSQL hujjati shu fikrni misol bilan beradi: 100 000 qatordan 1000 tasini tanlash indeksga nomzod bo'lishi mumkin; 100 qatordan 1 tasini tanlash — deyarli yo'q, chunki 100 qator bitta disk sahifasiga sig'adi va bitta sahifani ketma-ket o'qishdan yaxshi reja yo'q.

Shuning uchun indeksni ishlatish-ishlatmaslikni **rejalashtiruvchi** (query planner, optimizer) har so'rov uchun **statistika** asosida o'zi hal qiladi.

### Indeksning narxi

PostgreSQL hujjati:

- indeks yaratilgandan keyin tizim uni jadval bilan **sinxron** saqlashi kerak — bu har `INSERT`/`UPDATE`/`DELETE` ga qo'shimcha ish;
- katta jadvalda indeks yaratish uzoq davom etadi va sukut bo'yicha shu vaqtda jadvalga **yozish bloklanadi** (o'qish mumkin). Production uchun `CREATE INDEX CONCURRENTLY` (o'z cheklovlari bilan);
- shuning uchun **kam yoki umuman ishlatilmaydigan indekslarni o'chirish kerak**.

### InnoDB: klasterli va ikkilamchi indeks

39-bobda batafsil ko'rildi: InnoDB'da jadvalning o'zi birlamchi kalit bo'yicha **klasterli indeks**, qolgan indekslar — **ikkilamchi**. Ikkilamchi indeks yozuvida indekslangan ustunlar va **birlamchi kalit** saqlanadi. Bundan ikki natija kelib chiqadi:

- ikkilamchi indeks orqali qidiruv — **ikki qadam**: avval ikkilamchi indeksdan birlamchi kalit topiladi, keyin klasterli indeksdan qator;
- `SELECT id FROM t WHERE mijoz_id = …` — `id` birlamchi kalit bo'lgani uchun ikkilamchi indeksning o'zida bor, ya'ni indeks **qoplovchi** (quyida sinovda).

### Indeks ishlatilishini tekshirish

PostgreSQL hujjatining "Examining Index Usage" bo'limi:

- bitta so'rov uchun — **`EXPLAIN`** (45-bob);
- butun server bo'yicha — indeks statistikasi (`pg_stat_user_indexes`);
- **avval doim `ANALYZE`**: statistikasiz rejalashtiruvchi taxminiy qiymatlardan foydalanadi, ular "deyarli aniq noto'g'ri". `ANALYZE` siz indeks ishlatilishini tekshirish — "behuda ish";
- **haqiqiy ma'lumot bilan sinang**: juda kichik test to'plami yolg'on xulosa beradi; juda o'xshash, butunlay tasodifiy yoki tartiblangan holda kiritilgan qiymatlar statistikani haqiqiy taqsimotdan uzoqlashtiradi;
- reja noto'g'ri ko'rinsa — so'rovni indeks bilan va usiz **vaqtini o'lchang** (`EXPLAIN ANALYZE`). Rejalashtiruvchi to'g'ri bo'lishi ham, uning hisob-kitobi haqiqatga mos kelmasligi ham mumkin.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadvalda 200 000 qator: har mijozda 10 ta buyurtma; `holat` — 2% `'yangi'`, 98% `'yopilgan'`.

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int NOT NULL, holat text NOT NULL, summa int NOT NULL);
INSERT INTO buyurtmalar
SELECT g, (g % 20000) + 1,
       CASE WHEN g % 50 = 0 THEN 'yangi' ELSE 'yopilgan' END,
       (g * 37) % 100000
FROM generate_series(1, 200000) g;
ANALYZE buyurtmalar;
```

(MySQL va SQLite'da qatorlar rekursiv CTE bilan yaratildi, 30-bob.)

### Indekssiz va indeks bilan

```sql
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
```

```text
                     QUERY PLAN                      
-----------------------------------------------------
 Seq Scan on buyurtmalar (actual rows=10.00 loops=1)
   Filter: (mijoz_id = 777)
   Rows Removed by Filter: 199990
   Buffers: shared hit=1274
(4 rows)
```

10 ta qator uchun 200 000 qator o'qildi, 199 990 tasi tashlandi; 1274 sahifa (buffer) ko'rildi.

```sql
CREATE INDEX buyurtmalar_mijoz_idx ON buyurtmalar (mijoz_id);
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT * FROM buyurtmalar WHERE mijoz_id = 777;
```

```text
                                  QUERY PLAN                                  
------------------------------------------------------------------------------
 Bitmap Heap Scan on buyurtmalar (actual rows=10.00 loops=1)
   Recheck Cond: (mijoz_id = 777)
   Heap Blocks: exact=10
   Buffers: shared hit=10 read=2
   ->  Bitmap Index Scan on buyurtmalar_mijoz_idx (actual rows=10.00 loops=1)
         Index Cond: (mijoz_id = 777)
         Index Searches: 1
         Buffers: shared read=2
(8 rows)
```

Indeksda bitta qidiruv, keyin jadvaldan faqat 10 ta sahifa: jami 12 sahifa, oldin 1274 edi. (Reja turlari — `Bitmap Heap Scan`, `Index Scan` — 45-bobda.)

Oraliq shart ham indeksdan foydalanadi (B-tree tartiblangan):

```sql
EXPLAIN (COSTS OFF) SELECT mijoz_id FROM buyurtmalar WHERE mijoz_id BETWEEN 100 AND 105;
```

```text
 Bitmap Heap Scan on buyurtmalar
   Recheck Cond: ((mijoz_id >= 100) AND (mijoz_id <= 105))
   ->  Bitmap Index Scan on buyurtmalar_mijoz_idx
         Index Cond: ((mijoz_id >= 100) AND (mijoz_id <= 105))
```

### Ustunga amal qo'llansa — indeks ishlamaydi

```sql
EXPLAIN (COSTS OFF) SELECT * FROM buyurtmalar WHERE mijoz_id + 0 = 777;
EXPLAIN (COSTS OFF) SELECT * FROM buyurtmalar WHERE mijoz_id::text = '777';
```

```text
 Gather
   Workers Planned: 1
   ->  Parallel Seq Scan on buyurtmalar
         Filter: ((mijoz_id + 0) = 777)

 Gather
   Workers Planned: 1
   ->  Parallel Seq Scan on buyurtmalar
         Filter: ((mijoz_id)::text = '777'::text)
```

Mantiqan bir xil shart, lekin indekslangan ifoda `mijoz_id`, so'rovdagisi esa `mijoz_id + 0` — hujjatdagi "indekslangan ustun operator qiymat" ko'rinishiga mos emas. Butun jadval o'qildi (parallel).

### Qatorlarning ko'pi kerak bo'lsa

```sql
CREATE INDEX buyurtmalar_holat_idx ON buyurtmalar (holat);
ANALYZE buyurtmalar;

EXPLAIN (COSTS OFF) SELECT count(*) FROM buyurtmalar WHERE holat = 'yangi';
EXPLAIN (COSTS OFF) SELECT count(*) FROM buyurtmalar WHERE holat = 'yopilgan';
```

```text
 Aggregate
   ->  Index Only Scan using buyurtmalar_holat_idx on buyurtmalar
         Index Cond: (holat = 'yangi'::text)

 Finalize Aggregate
   ->  Gather
         Workers Planned: 1
         ->  Partial Aggregate
               ->  Parallel Seq Scan on buyurtmalar
                     Filter: (holat = 'yopilgan'::text)
```

Bir xil indeks, bir xil ustun:

- `'yangi'` (4000 qator, 2%) — indeks ishlatildi. `count(*)` uchun jadvalga murojaat ham kerak bo'lmadi: `Index Only Scan` (qoplovchi);
- `'yopilgan'` (196 000 qator, 98%) — rejalashtiruvchi indeksni **tanlamadi** va jadvalni ketma-ket o'qidi. Hujjatdagi qoida: ko'p qator kerak bo'lsa, ketma-ket o'qish tezroq.

### Indeks hajmi va yozish narxi

```sql
SELECT relname, pg_size_pretty(pg_relation_size(oid)) FROM pg_class
WHERE relname IN ('buyurtmalar', 'buyurtmalar_pkey', 'buyurtmalar_mijoz_idx', 'buyurtmalar_holat_idx')
ORDER BY relname;
```

```text
        relname        | pg_size_pretty 
-----------------------+----------------
 buyurtmalar           | 10192 kB
 buyurtmalar_holat_idx | 1400 kB
 buyurtmalar_mijoz_idx | 1856 kB
 buyurtmalar_pkey      | 4408 kB
(4 rows)
```

Uchta indeks jadvalning o'zidan ~75% ko'p joy egalladi. Yozish narxini qo'pol o'lchash: 100 000 qator qo'shish uchta indeks bilan **391 ms**, ikkita qo'shimcha indeks o'chirilgandan keyin **155 ms** (bitta o'lchov, `\timing`; aniq raqamlar muhitga bog'liq, lekin farq yo'nalishi — hujjatdagi "qo'shimcha ish").

### Indeks ishlatilganmi: `pg_stat_user_indexes`

```sql
SELECT indexrelname, idx_scan FROM pg_stat_user_indexes
WHERE relname = 'buyurtmalar' ORDER BY indexrelname;
```

```text
     indexrelname      | idx_scan 
-----------------------+----------
 buyurtmalar_holat_idx |        0
 buyurtmalar_mijoz_idx |        3
 buyurtmalar_pkey      |        0
(3 rows)
```

`buyurtmalar_holat_idx` hech qachon ishlatilmagan (`0`): yuqoridagi `'yangi'` so'rovi faqat oddiy `EXPLAIN` bilan ko'rilgan — u rejani ko'rsatadi, so'rovni **bajarmaydi**. `EXPLAIN ANALYZE` esa bajaradi va hisobga kiradi. Production'da uzoq vaqt `idx_scan = 0` bo'lgan indeks — hujjat aytgan "kam ishlatiladigan, o'chirish kerak" nomzodi. (Hisoblagichlar ham kechikib yangilanishi mumkin: sinovda ular faqat keyingi ulanishda ko'rindi.)

## Dialektlar

### MySQL

**Indekssiz / indeks bilan** — `EXPLAIN FORMAT=TREE`:

```text
-> Filter: (buyurtmalar.mijoz_id = 777)  (cost=20118 rows=19982)
    -> Table scan on buyurtmalar  (cost=20118 rows=199815)

-> Index lookup on buyurtmalar using buyurtmalar_mijoz_idx (mijoz_id = 777)  (cost=3.5 rows=10)
```

`mijoz_id + 0 = 777` — `Table scan`, PostgreSQL kabi. `mijoz_id = '777'` (satr bilan) esa indeksdan foydalandi: MySQL satrli **doimiy qiymatni** son ustuniga o'girdi. Hujjat teskari holatdan ogohlantiradi: **satr ustunini** son bilan solishtirish indeksni ishlatishga to'sqinlik qilishi mumkin (`'1'`, `' 1'`, `'00001'` — hammasi 1 ga teng).

**InnoDB: birlamchi kalit — ikkilamchi indeksning ichida:**

```sql
EXPLAIN FORMAT=TREE SELECT id FROM buyurtmalar WHERE mijoz_id = 777;
```

```text
-> Covering index lookup on buyurtmalar using buyurtmalar_mijoz_idx (mijoz_id = 777)  (cost=2.01 rows=10)
```

Indeks faqat `mijoz_id` ga qurilgan, lekin `id` ni so'rash uni **qoplovchi** qildi — InnoDB ikkilamchi indeks yozuvida birlamchi kalitni saqlaydi (39-bob).

**Rejalashtiruvchi xato qilganda.** `'yopilgan'` (98%) uchun MySQL PostgreSQL'dan farqli o'laroq **indeksni tanladi**. `EXPLAIN ANALYZE` taxmin va haqiqatni yonma-yon ko'rsatadi:

```sql
EXPLAIN ANALYZE SELECT sum(summa) FROM buyurtmalar WHERE holat = 'yopilgan';
EXPLAIN ANALYZE SELECT sum(summa) FROM buyurtmalar IGNORE INDEX (buyurtmalar_holat_idx)
WHERE holat = 'yopilgan';
```

```text
-> Aggregate: sum(buyurtmalar.summa)  (cost=33419 rows=1) (actual time=92.8..92.8 rows=1 loops=1)
    -> Index lookup on buyurtmalar using buyurtmalar_holat_idx (holat = 'yopilgan')  (cost=10399 rows=99907) (actual time=1.08..88.5 rows=196000 loops=1)

-> Aggregate: sum(buyurtmalar.summa)  (cost=66158 rows=1) (actual time=30.8..30.8 rows=1 loops=1)
    -> Filter: (buyurtmalar.holat = 'yopilgan')  (cost=20118 rows=199815) (actual time=0.13..26.1 rows=196000 loops=1)
        -> Table scan on buyurtmalar  (cost=20118 rows=199815) (actual time=0.129..14.8 rows=200000 loops=1)
```

- rejalashtiruvchi **99 907** qator kutdi, aslida **196 000** chiqdi;
- shu noto'g'ri taxmin bilan indeks yo'li "arzonroq" ko'rindi, lekin amalda **~90 ms**, to'liq skanerlash esa **~30 ms** — uch baravar sekinroq (ikki marta takrorlanganda ham shunday chiqdi);
- `ANALYZE TABLE … UPDATE HISTOGRAM ON holat` dan keyin ham reja o'zgarmadi.

Bu aynan PostgreSQL hujjatidagi holat: rejalashtiruvchining hisob-kitobi haqiqatga mos kelmaydi. Shuning uchun hujjat tavsiyasi — indeks bilan va usiz **vaqtni o'lchash**. `IGNORE INDEX` — MySQL'ning indeks ishoralari (index hints), rejalashtiruvchi bilan birga 46-bobda.

### SQLite

**`EXPLAIN QUERY PLAN`:** `SCAN` — to'liq skanerlash, `SEARCH` — indeks yoki kalit orqali:

```text
`--SCAN buyurtmalar
`--SEARCH buyurtmalar USING INTEGER PRIMARY KEY (rowid=?)
`--SEARCH buyurtmalar USING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)
`--SEARCH buyurtmalar USING COVERING INDEX buyurtmalar_mijoz_idx (mijoz_id=?)
```

- `id = 777` — indeks yaratilmasdan ham `SEARCH`: `id` — `INTEGER PRIMARY KEY`, ya'ni `rowid`; jadval shu kalit bo'yicha tartiblangan (hujjatdagi "Lookup By Rowid");
- `SELECT id … WHERE mijoz_id = 777` — `COVERING INDEX`: hujjatga ko'ra SQLite indeksida indekslangan ustundan keyin `rowid` turadi, `id` esa `rowid` ning o'zi.

**Statistika va noto'g'ri tanlov.** SQLite ham `'yopilgan'` uchun indeksni tanladi — `ANALYZE` dan oldin ham, keyin ham:

```sql
ANALYZE;
SELECT * FROM sqlite_stat1 WHERE tbl = 'buyurtmalar';
```

```text
buyurtmalar|buyurtmalar_holat_idx|200000 100000
buyurtmalar|buyurtmalar_mijoz_idx|200000 10
```

`sqlite_stat1` da `holat_idx` uchun "200 000 qator, bitta qiymatga o'rtacha 100 000 qator" — bu o'rtacha qiymat 2% / 98% taqsimotni ko'rmaydi (MySQL'ning 99 907 taxminiga juda o'xshash). Vaqt (`.timer on`, ikki marta): indeks bilan **~7.2 ms**, `NOT INDEXED` bilan **~5.6 ms** — bu yerda ham to'liq skanerlash tezroq, lekin farq kichikroq.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Indeks tuzilmasi (sukut) | B-tree | B-tree | B-tree |
| Jadvalning o'zi | Alohida (heap) | Klasterli indeks (PK) | `rowid` bo'yicha B-tree |
| Rejani ko'rish | `EXPLAIN [ANALYZE]` | `EXPLAIN [FORMAT=TREE / ANALYZE]` | `EXPLAIN QUERY PLAN` |
| Statistika yig'ish | `ANALYZE` | `ANALYZE TABLE` | `ANALYZE` (`sqlite_stat1`) |
| 98% qatorli shart (sinov) | To'liq skanerlash ✓ | Indeks — 3 baravar sekin | Indeks — biroz sekin |
| Indeksni chetlab o'tish | `enable_*` parametrlari | `IGNORE INDEX` | `NOT INDEXED` |
| Indeks ishlatilish statistikasi | `pg_stat_user_indexes` | (monitoring — 67-bob) | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "Har ustunga indeks" | Har yozish sekinlashadi, joy ko'payadi; kam ishlatilganlar foyda bermaydi | Real so'rovlarga qarab; ishlatilmaganini o'chirish |
| Indeks bor — demak ishlatiladi deb o'ylash | Rejalashtiruvchi ko'p qator kerak bo'lsa uni tanlamaydi | `EXPLAIN` bilan tekshirish |
| `WHERE` da indekslangan ustunga funksiya/amal | Indeks mos kelmaydi | Ustunni "toza" qoldirish yoki ifoda indeksi (43-bob) |
| Satr ustunini son bilan solishtirish (MySQL) | Hujjat: indeks ishlatilmasligi mumkin | Bir xil tip |
| `ANALYZE` siz indeks sinash | Hujjat: "behuda ish" | Avval `ANALYZE` |
| 100 qatorli test jadvalida indeksni baholash | Hamma narsa bitta sahifaga sig'adi | Haqiqiy hajmdagi ma'lumot |
| Rejalashtiruvchiga ko'r-ko'rona ishonish | Taxmin noto'g'ri bo'lishi mumkin (MySQL sinovi: 3×) | `EXPLAIN ANALYZE` bilan vaqtni o'lchash |
| Production'da katta jadvalga oddiy `CREATE INDEX` | PG: indeks qurilguncha yozish bloklanadi | `CREATE INDEX CONCURRENTLY` (PG) |

## Amaliyot

1. `buyurtmalar` jadvalida `summa > 99000` va `summa > 1000` shartlari uchun `summa` ga indeks qo'yib, rejalarni solishtiring. Qaysi foizdan keyin rejalashtiruvchi indeksdan voz kechadi?
2. `SELECT mijoz_id, count(*) FROM buyurtmalar GROUP BY mijoz_id` ni indeks bilan va usiz `EXPLAIN` qiling.
3. PostgreSQL'da `SET enable_seqscan = off` bilan `'yopilgan'` so'rovini `EXPLAIN ANALYZE` qiling va vaqtni oddiy reja bilan solishtiring. Hujjat bu sinov haqida nima deydi?
4. MySQL'da `SELECT id, holat FROM buyurtmalar WHERE mijoz_id = 777` va `SELECT id FROM …` rejalarini solishtiring. Nega biri "covering"?
5. SQLite'da 100 qatorli va 200 000 qatorli jadvallarda bir xil so'rovni `.timer on` bilan indeks bilan va usiz o'lchang.

## Rasmiy hujjat

- PostgreSQL — 11.1. Introduction (Indexes): <https://www.postgresql.org/docs/18/indexes-intro.html>
- PostgreSQL — 11.2. Index Types (B-tree operatorlari): <https://www.postgresql.org/docs/18/indexes-types.html>
- PostgreSQL — 11.12. Examining Index Usage: <https://www.postgresql.org/docs/18/indexes-examine.html>
- MySQL — 10.3.1 How MySQL Uses Indexes: <https://dev.mysql.com/doc/refman/9.7/en/mysql-indexes.html>
- MySQL — 17.6.2.1 Clustered and Secondary Indexes: <https://dev.mysql.com/doc/refman/9.7/en/innodb-index-types.html>
- SQLite — Query Planning (Tables Without Indices, Lookup By Rowid, Lookup By Index): <https://www.sqlite.org/queryplanner.html>
