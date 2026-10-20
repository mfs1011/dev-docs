# 44 — Indeks turlari

[← Oldingi: Maxsus indekslar](43-maxsus-indekslar.md) · [Mundarija](README.md) · [Keyingi: `EXPLAIN` →](45-explain.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/44-1-tushuncha.jpg">
    <source src="/video/sql/44-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/44-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/44-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>44.1-video. Indeks turlari tushunchasi: B-tree, Hash, GiST, GIN va BRIN</figcaption>
</figure>

41–43-boblardagi hamma narsa **B-tree** haqida edi. PostgreSQL hujjatiga ko'ra B-tree "eng ko'p uchraydigan holatlarga" mos va `CREATE INDEX` sukut bo'yicha shuni yaratadi. Lekin B-tree faqat **tartiblanadigan** qiymatlarni qidiradi: `=`, `<`, `>`, oraliq. "Massivda 3 va 5 bormi?", "Bu ikki vaqt oralig'i kesishadimi?", "Shu nuqtaga eng yaqin 10 ta joy" — bu savollarga B-tree yaramaydi. Ular uchun boshqa indeks turlari bor.

PostgreSQL'da tur `USING` bilan tanlanadi:

```sql
CREATE INDEX nom ON jadval USING HASH (ustun);
```

### PostgreSQL indeks turlari

PostgreSQL hujjatidagi ro'yxat: B-tree, Hash, GiST, SP-GiST, GIN, BRIN va `bloom` kengaytmasi.

| Tur | G'oya | Qaysi so'rovlar | Tipik ishlatilishi |
| --- | --- | --- | --- |
| **B-tree** | Tartiblangan daraxt | `<` `<=` `=` `>=` `>`, `BETWEEN`, `IN`, `IS NULL`, `LIKE 'abc%'`, `ORDER BY` | Ko'pchilik ustunlar |
| **Hash** | Qiymatning 32 bitli hash kodi | Faqat `=` | Faqat tenglik bilan qidiriladigan uzun qiymatlar |
| **GiST** | Turli strategiyalar uchun **infratuzilma** | Operator klassiga bog'liq: `&&`, `@>`, `<@`, "eng yaqin qo'shni" (`<->`) | Range'lar (36-bob), geometriya, exclusion constraint |
| **SP-GiST** | Muvozanatlanmagan tuzilmalar (quadtree, k-d tree, radix tree) | Operator klassiga bog'liq, "eng yaqin qo'shni" | Nuqtalar, prefiksli matnlar |
| **GIN** | **Teskari indeks** (inverted index): har **tarkibiy qism** uchun yozuv | Massiv uchun `<@` `@>` `=` `&&`; `jsonb` (35-bob); to'liq matn (49-bob) | Bir qiymatda ko'p element: massiv, JSON, matn |
| **BRIN** | Ketma-ket **blok oraliqlari** bo'yicha xulosa (min/max) | `<` `<=` `=` `>=` `>` | Fizik tartib bilan bog'liq ustun: vaqt bo'yicha qo'shiladigan loglar |
| **bloom** (kengaytma) | Bloom filtri — "imzo" | Ko'p ustunda tenglik | Ustunlar kombinatsiyasi oldindan noma'lum |

Har biri bo'yicha hujjatdagi asosiy faktlar:

- **B-tree** — `LIKE 'foo%'` va `~ '^foo'` ga (boshiga bog'langan naqsh) yaraydi, `LIKE '%bar'` ga yo'q; `C` bo'lmagan locale'da maxsus operator klassi kerak (43-bob). Saralangan natija ham beradi.
- **Hash** — faqat 32 bitli hash kodni saqlaydi, shuning uchun **faqat oddiy tenglik**.
- **GiST, SP-GiST** — "bitta indeks turi emas, balki infratuzilma": qaysi operatorlar ishlashi **operator klassi**ga bog'liq. Ikkalasi ham "eng yaqin qo'shni" qidiruvini optimallashtira oladi: `ORDER BY joy <-> point(…) LIMIT 10`.
- **GIN** — bir qiymat ichida ko'p tarkibiy qism bo'lgan ma'lumot uchun. Har qism uchun alohida yozuv — "qaysi qatorlarda shu qism bor" degan savolga tez javob beradi. 43-bobda: GIN index-only scan'ni qo'llamaydi.
- **BRIN** (Block Range INdex) — jadvalning ketma-ket fizik bloklari uchun qiymatlar **xulosasini** (chiziqli tartibli tiplarda — min va max) saqlaydi. Hujjat: ustun qiymatlari qatorlarning **fizik tartibi bilan yaxshi bog'langan** bo'lsa eng samarali.
- **bloom** — hujjatga ko'ra Bloom filtriga asoslangan: qiymatlarning "isrofli" (lossy) imzosi. **Noto'g'ri ijobiy** natija bo'lishi mumkin, shuning uchun topilgan qatorlar doim jadvaldagi haqiqiy qiymat bilan qayta tekshiriladi.

### MySQL

MySQL hujjatiga ko'ra indekslarning ko'pchiligi B-tree; istisnolar: spatial (fazoviy) tiplar — **R-tree**, `MEMORY` jadvallari — **hash** ham, InnoDB `FULLTEXT` — teskari ro'yxatlar (49-bob).

Hash indeks xususiyatlari (hujjat):

- faqat `=` yoki `<=>` bilan tenglik (lekin juda tez); "kalit-qiymat" tizimlari uchun;
- oraliq (`<`) uchun ishlatilmaydi;
- `ORDER BY` ni tezlashtira olmaydi;
- ikki qiymat orasida taxminan nechta qator borligini bilmaydi — optimizator uchun muhim;
- faqat **butun kalit** bilan qidiriladi (B-tree'da chap qismi ham yetarli, 42-bob).

**Invisible indeks** — MySQL'ga xos. Hujjatga ko'ra optimizator **ishlatmaydigan** indeks. U yangilanib turadi, lekin rejalarda qatnashmaydi. Maqsad: indeksni **o'chirmasdan**, o'chirishning ta'sirini sinab ko'rish. Katta jadvalda indeksni o'chirib qayta yaratish qimmat, ko'rinmas qilish va qaytarish esa tez. Birlamchi kalitga qo'llanmaydi.

### SQLite

SQLite'da `CREATE INDEX` faqat B-tree; `USING` sintaksisi yo'q. Fazoviy so'rovlar uchun alohida **R*Tree moduli** — hujjatga ko'ra oraliq so'rovlari uchun mo'ljallangan maxsus indeks (ko'pincha geodata: har yozuv — min/max X va Y koordinatali to'rtburchak). U oddiy indeks emas, **virtual jadval** sifatida yaratiladi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/44-2-kod.jpg">
    <source src="/video/sql/44-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/44-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/44-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>44.2-video. Indeks turlari amaliyoti va EXPLAIN tahlili</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. PostgreSQL'da 200 000 qatorli jadval — har ustun boshqa turdagi indeks uchun:

```sql
CREATE TABLE t (id int PRIMARY KEY, kod text, teglar int[], davr tsrange, vaqt timestamp, nuqta point);
INSERT INTO t
SELECT g, 'K' || g,
       ARRAY[g % 50, g % 7],
       tsrange(timestamp '2026-01-01' + g * interval '1 minute',
               timestamp '2026-01-01' + (g + 30) * interval '1 minute'),
       timestamp '2026-01-01' + g * interval '1 second',   -- qo'shilish tartibida o'sadi
       point(g % 1000, g / 1000)
FROM generate_series(1, 200000) g;

CREATE INDEX t_kod_hash     ON t USING HASH   (kod);
CREATE INDEX t_teglar_gin   ON t USING GIN    (teglar);
CREATE INDEX t_davr_gist    ON t USING GIST   (davr);
CREATE INDEX t_vaqt_brin    ON t USING BRIN   (vaqt);
CREATE INDEX t_vaqt_btree   ON t              (vaqt);
CREATE INDEX t_nuqta_spgist ON t USING SPGIST (nuqta);
ANALYZE t;
```

### Hash: faqat tenglik

```sql
EXPLAIN (COSTS OFF) SELECT * FROM t WHERE kod = 'K777';
EXPLAIN (COSTS OFF) SELECT * FROM t WHERE kod > 'K999998';
```

```text
 Index Scan using t_kod_hash on t
   Index Cond: (kod = 'K777'::text)

 Seq Scan on t
   Filter: (kod > 'K999998'::text)
```

Ikkinchi so'rov juda kam qator qaytaradi, lekin hash indeks oraliqqa yaramaydi — to'liq skanerlash.

### GIN: massiv elementlari

```sql
EXPLAIN (COSTS OFF) SELECT id FROM t WHERE teglar @> ARRAY[3, 5];
```

```text
 Bitmap Heap Scan on t
   Recheck Cond: (teglar @> '{3,5}'::integer[])
   ->  Bitmap Index Scan on t_teglar_gin
         Index Cond: (teglar @> '{3,5}'::integer[])
```

"Massivda 3 ham, 5 ham bor" — B-tree bunday savolga javob bera olmaydi (36-bob).

### GiST: oraliqlar kesishishi

```sql
EXPLAIN (COSTS OFF)
SELECT id FROM t WHERE davr && tsrange('2026-02-01 10:00', '2026-02-01 10:05');
```

```text
 Bitmap Heap Scan on t
   Recheck Cond: (davr && '["2026-02-01 10:00:00","2026-02-01 10:05:00")'::tsrange)
   ->  Bitmap Index Scan on t_davr_gist
         Index Cond: (davr && '["2026-02-01 10:00:00","2026-02-01 10:05:00")'::tsrange)
```

36- va 40-boblardagi `EXCLUDE USING GIST` va `WITHOUT OVERLAPS` aynan shu indeks turiga tayanadi.

### SP-GiST: eng yaqin qo'shni

```sql
EXPLAIN (COSTS OFF) SELECT id FROM t ORDER BY nuqta <-> point(500, 100) LIMIT 3;
SELECT id, nuqta FROM t ORDER BY nuqta <-> point(500, 100) LIMIT 3;
```

```text
 Limit
   ->  Index Scan using t_nuqta_spgist on t
         Order By: (nuqta <-> '(500,100)'::point)

   id   |   nuqta   
--------+-----------
 100500 | (500,100)
  99500 | (500,99)
 101500 | (500,101)
(3 rows)
```

`<->` — masofa operatori. Indeks `ORDER BY masofa LIMIT 3` ni 200 000 masofani hisoblab saralamasdan bajardi (`Order By` — indeks ichida).

### BRIN: kichik indeks, "isrofli" natija

```sql
DROP INDEX t_vaqt_btree;   -- rejalashtiruvchi BRIN ni tanlashi uchun
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT count(*) FROM t WHERE vaqt BETWEEN '2026-01-02 00:00' AND '2026-01-02 00:10';
```

```text
 Aggregate (actual rows=1.00 loops=1)
   Buffers: shared hit=136
   ->  Bitmap Heap Scan on t (actual rows=601.00 loops=1)
         Recheck Cond: ((vaqt >= '2026-01-02 00:00:00'::timestamp without time zone) AND (vaqt <= '2026-01-02 00:10:00'::timestamp without time zone))
         Rows Removed by Index Recheck: 8359
         Heap Blocks: lossy=128
         Buffers: shared hit=136
         ->  Bitmap Index Scan on t_vaqt_brin (actual rows=1280.00 loops=1)
               Index Cond: (…)
               Index Searches: 1
               Buffers: shared hit=8
```

- BRIN aniq qatorlarni emas, **bloklar oralig'ini** topdi: `Heap Blocks: lossy=128` — 128 ta blok to'liq o'qildi;
- ularda 8960 qator bor edi, 8359 tasi qayta tekshiruvda tashlandi (`Rows Removed by Index Recheck`), 601 tasi qoldi;
- jami 136 sahifa — 200 000 qatorli jadval uchun kam. `vaqt` qo'shilish tartibida o'sgani uchun (fizik tartib bilan bog'liq) bu ishladi.

Hajmlar:

```text
    relname     | pg_size_pretty 
----------------+----------------
 t_davr_gist    | 7120 kB
 t_kod_hash     | 6824 kB
 t_nuqta_spgist | 9128 kB
 t_pkey         | 4408 kB
 t_teglar_gin   | 696 kB
 t_vaqt_brin    | 24 kB
 t_vaqt_btree   | 4408 kB
```

Bir xil `vaqt` ustuni: B-tree — **4408 kB**, BRIN — **24 kB** (~180 baravar kichik). Evaziga BRIN ortiqcha bloklarni o'qiydi va qiymatlar tartibsiz bo'lsa foydasiz. Hash indeks bu yerda `kod` uchun B-tree'dan kattaroq chiqdi (6824 va pkey'ning 4408) — hash har doim kichik degan narsa yo'q.

`bloom` kengaytmasi o'rnatilgan PostgreSQL bilan birga keladi (`CREATE EXTENSION bloom` ishladi), lekin bu bobda batafsil sinalmadi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/44-3-dialektlar.jpg">
    <source src="/video/sql/44-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/44-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/44-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>44.3-video. Dialektlar: MySQL (InnoDB) va SQLite indeks farqlari</figcaption>
</figure>

### MySQL

**InnoDB'da hash indeks yo'q** — `USING HASH` jimgina B-tree'ga aylanadi, faqat eslatma (`Note`) bilan:

```sql
CREATE INDEX t_kod_hash ON t (kod) USING HASH;
SHOW WARNINGS;
SELECT index_name, index_type FROM information_schema.statistics
WHERE table_schema = DATABASE() AND table_name = 't' ORDER BY index_name;
```

```text
| Note  | 3502 | This storage engine does not support the HASH index algorithm, storage engine default was used instead. |
| INDEX_NAME | INDEX_TYPE |
| PRIMARY    | BTREE      |
| t_kod_hash | BTREE      |
```

`MEMORY` jadvalida esa haqiqiy hash: `INDEX_TYPE = HASH`.

**Spatial indeks (R-tree):**

```sql
CREATE TABLE t (id int PRIMARY KEY, kod varchar(20), j int, joy POINT NOT NULL SRID 0);
INSERT INTO t VALUES (1,'K1',1,ST_GeomFromText('POINT(1 1)')), (2,'K2',2,ST_GeomFromText('POINT(5 5)')),
                     (3,'K3',3,ST_GeomFromText('POINT(9 9)'));
CREATE SPATIAL INDEX t_joy ON t (joy);
EXPLAIN FORMAT=TREE SELECT id FROM t FORCE INDEX (t_joy)
WHERE MBRContains(ST_GeomFromText('POLYGON((0 0,6 0,6 6,0 6,0 0))'), joy);
```

```text
-> Filter: mbrcontains(<cache>(st_geomfromtext('POLYGON((0 0,6 0,6 6,0 6,0 0))')),t.joy)  (cost=0.71 rows=1)
    -> Index range scan on t using t_joy over (joy unprintable_geometry_value)  (cost=0.71 rows=1)
```

Natija: `1`, `2` — to'rtburchak ichidagi nuqtalar. (Jadval 3 qatorli bo'lgani uchun `FORCE INDEX` bilan ko'rsatildi.) Bu misolda spatial indeksli ustun `NOT NULL` va aniq `SRID` bilan e'lon qilingan.

**Invisible indeks:**

```sql
CREATE INDEX t_j ON t (j);
EXPLAIN FORMAT=TREE SELECT * FROM t WHERE j = 2;
ALTER TABLE t ALTER INDEX t_j INVISIBLE;
EXPLAIN FORMAT=TREE SELECT * FROM t WHERE j = 2;
SELECT index_name, is_visible FROM information_schema.statistics
WHERE table_schema = DATABASE() AND table_name = 't' AND index_name = 't_j';
ALTER TABLE t ALTER INDEX PRIMARY INVISIBLE;
```

```text
-> Index lookup on t using t_j (j = 2)  (cost=0.35 rows=1)

-> Filter: (t.j = 2)  (cost=0.55 rows=1)
    -> Table scan on t  (cost=0.55 rows=3)

| INDEX_NAME | IS_VISIBLE |
| t_j        | NO         |

ERROR 1064 (42000) at line 16: … near 'PRIMARY INVISIBLE' at line 1
```

Indeks joyida, lekin optimizator uni ko'rmaydi. Ta'sirini kuzatib, kerak bo'lsa `VISIBLE` ga qaytariladi (tez) yoki o'chiriladi. Birlamchi kalitga — mumkin emas.

PostgreSQL'da invisible indeks yo'q; o'xshash sinov uchun rejalashtiruvchi parametrlari (`enable_indexscan` va h.k., 46-bob) bor.

### SQLite

**Faqat B-tree** — `USING` yo'q:

```text
Parse error near line 2: near "USING": syntax error
  CREATE INDEX t_h ON t USING HASH (kod);
```

**R*Tree** — virtual jadval:

```sql
CREATE VIRTUAL TABLE joylar USING rtree(id, minX, maxX, minY, maxY);
INSERT INTO joylar VALUES (1, 1, 1, 1, 1), (2, 5, 5, 5, 5), (3, 9, 9, 9, 9);
SELECT id FROM joylar WHERE minX >= 0 AND maxX <= 6 AND minY >= 0 AND maxY <= 6;
EXPLAIN QUERY PLAN SELECT id FROM joylar WHERE minX >= 0 AND maxX <= 6 AND minY >= 0 AND maxY <= 6;
```

```text
1
2
QUERY PLAN
`--SCAN joylar VIRTUAL TABLE INDEX 2:D0B1D2B3
```

Natija MySQL'dagi bilan bir xil. R*Tree moduli bizning yig'ishda bor (`PRAGMA compile_options` da `ENABLE_RTREE`, 26-bob). Reja `SCAN … VIRTUAL TABLE INDEX` — so'rovni R*Tree'ning o'z indeks mexanizmi bajaradi.

### Qisqacha jadval

| Tur | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| B-tree | Ha (sukut) | Ha (sukut) | Ha (yagona) |
| Hash | `USING HASH` | Yo'q (B-tree'ga aylanadi); `MEMORY` jadvalda — ha | Yo'q |
| GiST / SP-GiST | Ha | Yo'q | Yo'q |
| GIN | Ha (massiv, `jsonb`, matn) | Yo'q (JSON uchun multi-valued, 35-bob) | Yo'q |
| BRIN | Ha | Yo'q | Yo'q |
| Fazoviy | GiST/SP-GiST (geometriya) | `SPATIAL` (R-tree) | R*Tree virtual jadval |
| To'liq matn | GIN (49-bob) | `FULLTEXT` (49-bob) | FTS (49-bob) |
| Invisible indeks | Yo'q | Ha | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Massiv, `jsonb`, range ustuniga B-tree | `@>`, `&&`, `?` kabi operatorlar ishlatolmaydi | GIN (massiv, JSON), GiST (range) |
| Hash indeksni "kichikroq va tezroq B-tree" deb o'ylash | Faqat `=`; oraliq va saralashga yaramaydi; hajm ham kichik bo'lishi shart emas | Odatda B-tree |
| MySQL'da `USING HASH` ishladi deb o'ylash | InnoDB uni B-tree qiladi, faqat `Note` beradi | `SHOW INDEX` / `information_schema.statistics` ni tekshirish |
| Tasodifiy tartibdagi ustunga BRIN | Har blok oralig'ida min–max keng; deyarli hamma blok o'qiladi | BRIN — fizik tartib bilan bog'liq ustunlarga |
| Katta jadvaldan "keraksiz" indeksni darhol o'chirish (MySQL) | Kerak bo'lib chiqsa, qayta yaratish qimmat | Avval `INVISIBLE`, kuzatish, keyin o'chirish |
| GIN indeksda index-only scan kutish | GIN uni qo'llamaydi (43-bob) | Kerak bo'lsa B-tree |

## Amaliyot

1. PostgreSQL'da `t_vaqt_brin` ni `id` bo'yicha tasodifiy tartibda qayta to'ldirilgan jadvalda (`INSERT … ORDER BY random()`) yarating va o'sha `BETWEEN` so'rovidagi `Heap Blocks` ni solishtiring.
2. `teglar` ustunida `teglar && ARRAY[3]` va `3 = ANY (teglar)` so'rovlari uchun GIN ishlatiladimi? (36-bob)
3. PostgreSQL'da `CREATE EXTENSION bloom;` va `CREATE INDEX … USING bloom (a, b, c)` bilan uch ustunli jadvalda `WHERE b = … AND c = …` so'rovini sinang.
4. MySQL'da 200 000 qatorli jadvalda indeksni `INVISIBLE` qiling, so'rov rejasi va vaqtini o'lchang, keyin `VISIBLE` qiling.
5. SQLite R*Tree jadvaliga 10 000 nuqta yozing va to'rtburchak ichidagilarni oddiy jadval + B-tree indeks bilan solishtiring.

## Rasmiy hujjat

- PostgreSQL — 11.2. Index Types: <https://www.postgresql.org/docs/18/indexes-types.html>
- PostgreSQL — F.6. bloom: <https://www.postgresql.org/docs/18/bloom.html>
- MySQL — 10.3.9 Comparison of B-Tree and Hash Indexes: <https://dev.mysql.com/doc/refman/9.7/en/index-btree-hash.html>
- MySQL — 10.3.12 Invisible Indexes: <https://dev.mysql.com/doc/refman/9.7/en/invisible-indexes.html>
- MySQL — 10.3.1 How MySQL Uses Indexes (R-tree, hash istisnolari): <https://dev.mysql.com/doc/refman/9.7/en/mysql-indexes.html>
- SQLite — The SQLite R*Tree Module: <https://www.sqlite.org/rtree.html>
