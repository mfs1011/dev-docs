# 49 — To'liq matnli qidiruv

[← Oldingi: Sahifalash](48-sahifalash.md) · [Mundarija](README.md) · [Keyingi: Tranzaksiya →](50-tranzaksiya.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/49-1-tushuncha.jpg">
    <source src="/video/sql/49-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/49-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/49-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

"Konteyner haqidagi maqolalarni top" — oddiy `LIKE '%konteyner%'` bilan ham bo'ladi. PostgreSQL hujjati (12.1. Introduction, Full Text Search) `LIKE` va regulyar ifodalarning kamchiliklarini sanaydi:

- **Til bilmaydi.** `satisfies` va `satisfy` — bir so'zning shakllari, lekin `LIKE` uchun boshqa satrlar. Barcha shakllarni `OR` bilan yozish zerikarli va xatoga moyil.
- **Tartiblamaydi** (ranking yo'q) — minglab natija bo'lsa, eng mosini birinchi ko'rsatib bo'lmaydi.
- **Sekin** — indeks yordami yo'q, har qidiruvda barcha hujjatlar ko'rib chiqiladi (`'%…'` — 47-bobdagi "ustun funksiya ichida" kabi, B-tree ishlamaydi).

**To'liq matnli qidiruv** (full-text search) buni hal qiladi: matn oldindan **so'zlarga** bo'linadi, so'zlar normallashtiriladi va ular bo'yicha maxsus indeks quriladi.

### PostgreSQL: `tsvector` va `tsquery`

Hujjat bo'yicha bosqichlar:

1. Matn **tokenlarga** (so'z, son, e-pochta…) bo'linadi.
2. Tokenlar **leksemaga** (lexeme) aylantiriladi — bir so'zning turli shakllari bir xil bo'ladi: kichik harfga o'tkaziladi, ko'pincha qo'shimchalar olib tashlanadi (inglizchada `s`, `es`). Juda ko'p uchraydigan, qidiruvga keraksiz **to'xtash so'zlari** (stop words) tashlanadi. Buni **lug'atlar** (dictionaries) qiladi.
3. Natija saqlanadi: **`tsvector`** — tartiblangan leksemalar ro'yxati (o'rinlari bilan).

So'rov — **`tsquery`** turi, solishtirish — `@@` operatori: `tsvector @@ tsquery` hujjat so'rovga mos bo'lsa `true`.

Qaysi lug'atlar ishlatilishi — **matn qidiruvi konfiguratsiyasi** (`english`, `russian`, `simple`…). PostgreSQL 18 da o'zbek tili uchun konfiguratsiya **yo'q** (`pg_ts_config` da 30 ta konfiguratsiya, ular orasida `uzbek` yo'q). O'zbekcha matn uchun — `simple`: hujjatga ko'ra u tokenni kichik harfga o'tkazadi va to'xtash so'zlari faylida bo'lmasa, shunday qaytaradi — **qo'shimchalarni olib tashlamaydi**. Bu muhim: `konteyner` so'rovi `konteynerda` ni topmaydi (pastda).

Indeks uchun hujjat (12.2.2. Creating Indexes): ifoda indeksida faqat **konfiguratsiya nomi ko'rsatilgan** funksiyalar ishlatiladi — `to_tsvector('simple', matn)`, `to_tsvector(matn)` emas; aks holda indeks mazmuni `default_text_search_config` sozlamasiga bog'liq bo'lib qoladi. Qulay yo'l — **generatsiya qilinadigan ustun** (`GENERATED ALWAYS AS (to_tsvector(…)) STORED`, 15-bob) va unga **GIN** indeksi (44-bob).

### PostgreSQL: `pg_trgm`

PostgreSQL hujjati (F.35. pg_trgm): **trigramma** — satrdagi ketma-ket uchta belgi. Ikki satr umumiy trigrammalari soni bo'yicha solishtiriladi — bu so'zlarning **o'xshashligi**ni o'lchash, imlo xatolarini topish uchun yaxshi ishlaydi. `similarity(a, b)` — 0 dan 1 gacha, `a % b` — o'xshashlik chegaradan (`pg_trgm.similarity_threshold`, standart 0.3) yuqori bo'lsa `true`.

`pg_trgm` ning GIN/GiST indekslari `LIKE`, `ILIKE`, `~`, `~*` qidiruvlarini ham qo'llaydi — va B-tree'dan farqli, qidiruv satri boshidan **bog'lanmagan** bo'lishi mumkin: `LIKE '%foo%bar'`.

| Vosita | Nimani topadi | Qachon |
| --- | --- | --- |
| `tsvector` / `tsquery` | So'zlar (leksemalar), mantiqiy ifodalar, reyting | Hujjatlar, maqolalar bo'yicha qidiruv |
| `pg_trgm` | Satr bo'lagi, o'xshash yozuv | `LIKE '%…%'`, imlo xatosi bilan qidiruv, nomlar |

### MySQL: `FULLTEXT`

MySQL hujjati (14.9 Full-Text Search Functions): `MATCH (ustunlar) AGAINST ('so'z' [rejim])`, indeks — `FULLTEXT`, faqat InnoDB va MyISAM jadvallarida, `CHAR`, `VARCHAR`, `TEXT` ustunlarida. Rejimlar:

| Rejim | Ma'nosi |
| --- | --- |
| `IN NATURAL LANGUAGE MODE` (standart) | Oddiy matn; natija **relevance** (o'xshashlik) bo'yicha kamayish tartibida |
| `IN BOOLEAN MODE` | Operatorlar: `+` — majburiy, `-` — bo'lmasin, `*` — oxiri ixtiyoriy (truncation), operatorsiz so'z — **ixtiyoriy** |

Qidiruv standart holatda registrga befarq. InnoDB indekslaydigan so'zlarning minimal uzunligi — `innodb_ft_min_token_size` (bizda — 3): `va` kabi qisqa so'zlar indeksga tushmaydi.

So'zlar orasida ajratgich bo'lmagan tillar (xitoy, yapon, koreys) uchun MySQL **ngram** parser beradi (14.9.8): matn `ngram_token_size` uzunlikdagi bo'laklarga bo'linadi (standart 2).

### SQLite: FTS5

SQLite hujjati (FTS5 Extension): to'liq matnli qidiruv — **virtual jadval**: `CREATE VIRTUAL TABLE … USING fts5(ustunlar)`, qidiruv — `WHERE jadval MATCH 'so'rov'`, tartib — `ORDER BY rank`. Reyting — `bm25()`: moslik qanchalik yaxshi bo'lsa, qiymat **shunchalik kichik** (manfiy) — shuning uchun o'sish tartibi. Tokenizator tanlanadi: `unicode61` (standart), `porter` (ingliz tili qo'shimchalari), `trigram` (ixtiyoriy satr bo'lagi bo'yicha, `LIKE`/`GLOB` bilan ham).

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/49-2-kod.jpg">
    <source src="/video/sql/49-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/49-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/49-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

Olti maqola (beshtasi o'zbekcha, bittasi inglizcha):

```sql
CREATE TABLE maqolalar (id int PRIMARY KEY, sarlavha text NOT NULL, matn text NOT NULL);
INSERT INTO maqolalar (id, sarlavha, matn) VALUES
(1, 'Docker konteynerlari', 'Konteyner ilovani barcha kutubxonalari bilan birga ishga tushiradi.'),
(2, 'Konteyner tarmoqlari', 'Bitta tarmoqdagi konteynerlar bir-birini nomi bilan topadi.'),
(3, 'PostgreSQL indekslari', 'Indeks qidiruvni tezlashtiradi, lekin yozishni sekinlashtiradi.'),
(4, 'Kafka va xabarlar', 'Xabarlar navbati ilovalarni bir-biridan ajratadi.'),
(5, 'Konteynerda baza', 'Ma''lumotlar bazasi konteynerda volume bilan ishlaydi.'),
(6, 'Running containers', 'The container runs the application; containers are isolated.');
```

### `tsvector`: `simple` va `english`

```sql
SELECT to_tsvector('simple', 'Bitta tarmoqdagi konteynerlar bir-birini nomi bilan topadi.');
SELECT to_tsvector('english', 'The container runs the application; containers are isolated.');
```

```text
                                                to_tsvector                                                
-----------------------------------------------------------------------------------------------------------
 'bilan':8 'bir':5 'bir-birini':4 'birini':6 'bitta':1 'konteynerlar':3 'nomi':7 'tarmoqdagi':2 'topadi':9

                to_tsvector                
-------------------------------------------
 'applic':5 'contain':2,6 'isol':8 'run':3
```

- `simple` — so'zlar kichik harfda, o'rni bilan (`'konteynerlar':3`); `bir-birini` ham butun, ham qismlari bilan. Qo'shimchalar joyida: `konteynerlar`, `tarmoqdagi`.
- `english` — qo'shimchalar olib tashlandi (`container` va `containers` → `contain`, ikki o'rinda: `2,6`), to'xtash so'zlari (`the`, `are`) tushdi.

### Qidiruv va prefiks

```sql
SELECT id, sarlavha FROM maqolalar
WHERE to_tsvector('simple', sarlavha || ' ' || matn) @@ to_tsquery('simple', 'konteyner');
SELECT id, sarlavha FROM maqolalar
WHERE to_tsvector('simple', sarlavha || ' ' || matn) @@ to_tsquery('simple', 'konteyner:*');
SELECT id, sarlavha FROM maqolalar
WHERE to_tsvector('english', matn) @@ to_tsquery('english', 'container');
```

```text
 id |       sarlavha       
----+----------------------
  1 | Docker konteynerlari
  2 | Konteyner tarmoqlari

 id |       sarlavha       
----+----------------------
  1 | Docker konteynerlari
  2 | Konteyner tarmoqlari
  5 | Konteynerda baza

 id |      sarlavha      
----+--------------------
  6 | Running containers
```

- `'konteyner'` — faqat aynan shu so'z bor maqolalar (1 va 2: matnida `Konteyner`). 5-maqoladagi `konteynerda` — boshqa leksema, **topilmadi**.
- `'konteyner:*'` — **prefiks** so'rovi: `konteyner` bilan boshlanadigan har qanday leksema. O'zbek tilida, stemming yo'qligida, amaliy yechim shu.
- `english` konfiguratsiyasi `container` so'rovini `containers` matniga moslashtirdi — leksema bir xil (`contain`).

### Reyting va foydalanuvchi so'rovi

```sql
SELECT id, sarlavha, round(ts_rank(to_tsvector('simple', sarlavha || ' ' || matn), q)::numeric, 4) AS reyting
FROM maqolalar, to_tsquery('simple', 'konteyner:* & ilova:*') q
WHERE to_tsvector('simple', sarlavha || ' ' || matn) @@ q ORDER BY reyting DESC;
SELECT id, sarlavha FROM maqolalar
WHERE to_tsvector('simple', sarlavha || ' ' || matn) @@ websearch_to_tsquery('simple', 'konteyner -docker');
```

```text
 id |       sarlavha       | reyting 
----+----------------------+---------
  1 | Docker konteynerlari |  0.1878

 id |       sarlavha       
----+----------------------
  2 | Konteyner tarmoqlari
```

- `&` — VA: ikkala so'z ham bo'lgan yagona maqola — 1 (`konteynerlari` va `ilovani`). `ts_rank` — reyting.
- `websearch_to_tsquery` — hujjat (12.3.2): oddiy matnni qidiruv tizimlaridagi kabi sintaksis bilan qabul qiladi (`-so'z` — bo'lmasin, `"ibora"`, `or`) va **hech qachon sintaksis xatosi bermaydi** — foydalanuvchi kiritgan matnni to'g'ridan-to'g'ri berish mumkin. `konteyner -docker` — `konteyner` bor, `docker` yo'q: faqat 2.

### Indeks: `LIKE` va GIN

100 000 qator, har 5000-chisida `konteyner` so'zi; `tsvector` — generatsiya qilinadigan ustun, GIN indeksi bilan:

```sql
CREATE TABLE katta (id int PRIMARY KEY, matn text NOT NULL,
    hujjat tsvector GENERATED ALWAYS AS (to_tsvector('simple', matn)) STORED);
INSERT INTO katta (id, matn)
SELECT g, 'yozuv ' || g || ' mavzu' || (g % 1000) || ' ' || CASE WHEN g % 5000 = 0 THEN 'konteyner' ELSE 'oddiy' END || ' matn'
FROM generate_series(1, 100000) g;
CREATE INDEX katta_hujjat ON katta USING gin (hujjat);
ANALYZE katta;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM katta WHERE matn LIKE '%konteyner%';
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM katta WHERE hujjat @@ to_tsquery('simple', 'konteyner');
```

```text
 Aggregate  (cost=2975.03..2975.04 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Seq Scan on katta  (cost=0.00..2975.00 rows=10 width=0) (actual rows=20.00 loops=1)
         Filter: (matn ~~ '%konteyner%'::text)
         Rows Removed by Filter: 99980
 Planning Time: 0.588 ms
 Execution Time: 4.882 ms

 Aggregate  (cost=132.66..132.67 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Bitmap Heap Scan on katta  (cost=17.25..132.58 rows=32 width=0) (actual rows=20.00 loops=1)
         Recheck Cond: (hujjat @@ '''konteyner'''::tsquery)
         Heap Blocks: exact=20
         ->  Bitmap Index Scan on katta_hujjat  (cost=0.00..17.25 rows=32 width=0) (actual rows=20.00 loops=1)
               Index Cond: (hujjat @@ '''konteyner'''::tsquery)
               Index Searches: 1
 Planning Time: 0.218 ms
 Execution Time: 0.030 ms
```

`LIKE` — 99 980 qator filtrda, **4.9 ms**; GIN — 20 blok, **0.030 ms**.

### `pg_trgm`: o'xshashlik va `LIKE` uchun indeks

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SELECT similarity('konteyner', 'kontener') AS o_xshashlik, show_trgm('kontener');
SELECT id, sarlavha FROM maqolalar WHERE sarlavha % 'Kontener tarmoqlari';
```

```text
 o_xshashlik |                  show_trgm                  
-------------+---------------------------------------------
   0.5833333 | {"  k"," ko",ene,"er ",kon,ner,nte,ont,ten}

 id |       sarlavha       
----+----------------------
  1 | Docker konteynerlari
  2 | Konteyner tarmoqlari
```

- `show_trgm` — trigrammalar (so'z boshida va oxirida bo'shliq qo'shiladi).
- `kontener` (imlo xatosi bilan) va `konteyner` o'xshashligi 0.58 — chegara 0.3 dan yuqori.
- `%` — xato yozilgan `Kontener tarmoqlari` ham to'g'ri sarlavhalarni topdi. `tsvector` bunday qila olmaydi — u faqat aniq leksemalarni solishtiradi.

`LIKE '%…%'` uchun trigramma indeksi:

```sql
CREATE INDEX katta_trgm ON katta USING gin (matn gin_trgm_ops);
ANALYZE katta;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT count(*) FROM katta WHERE matn LIKE '%konteyner%';
```

```text
 Aggregate  (cost=106.95..106.96 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Bitmap Heap Scan on katta  (cost=69.08..106.92 rows=10 width=0) (actual rows=20.00 loops=1)
         Recheck Cond: (matn ~~ '%konteyner%'::text)
         Heap Blocks: exact=20
         ->  Bitmap Index Scan on katta_trgm  (cost=0.00..69.08 rows=10 width=0) (actual rows=20.00 loops=1)
               Index Cond: (matn ~~ '%konteyner%'::text)
               Index Searches: 1
 Planning Time: 0.080 ms
 Execution Time: 0.038 ms
```

O'sha `LIKE '%konteyner%'` — endi `Bitmap Index Scan on katta_trgm`, **0.038 ms** (oldin 4.9 ms). So'rovni o'zgartirish shart emas — faqat indeks.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/49-3-dialektlar.jpg">
    <source src="/video/sql/49-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/49-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/49-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
</figure>

### MySQL

`FULLTEXT` indeks ikki ustunda:

```sql
CREATE TABLE maqolalar (id int PRIMARY KEY, sarlavha varchar(200) NOT NULL, matn text NOT NULL,
    FULLTEXT KEY ft (sarlavha, matn));
SELECT id, sarlavha FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('konteyner');
SELECT id, sarlavha FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('konteyner*' IN BOOLEAN MODE);
```

```text
| id | sarlavha             |
|  1 | Docker konteynerlari |
|  2 | Konteyner tarmoqlari |

| id | sarlavha             |
|  5 | Konteynerda baza     |
|  1 | Docker konteynerlari |
|  2 | Konteyner tarmoqlari |
```

PostgreSQL `simple` bilan bir xil manzara: aniq so'z — 1 va 2; `konteyner*` (boolean rejimdagi truncation) — `konteynerda` ham.

**Reyting va operatorlar:**

```sql
SELECT id, sarlavha, round(MATCH(sarlavha, matn) AGAINST ('konteyner* ilova*' IN BOOLEAN MODE), 4) AS reyting
FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('konteyner* ilova*' IN BOOLEAN MODE) ORDER BY reyting DESC;
SELECT id, sarlavha FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('+konteyner* -docker' IN BOOLEAN MODE);
```

```text
| id | sarlavha             | reyting |
|  1 | Docker konteynerlari |  0.2339 |
|  4 | Kafka va xabarlar    |  0.2276 |
|  5 | Konteynerda baza     |  0.0125 |
|  2 | Konteyner tarmoqlari |  0.0063 |

| id | sarlavha             |
|  5 | Konteynerda baza     |
|  2 | Konteyner tarmoqlari |
```

- Operatorsiz so'zlar — hujjat: **ixtiyoriy**, ya'ni amalda `OR`: 4-maqolada `konteyner` yo'q, `ilovalarni` bor — u ham chiqdi. PostgreSQL'dagi `&` ga mos — `+konteyner* +ilova*`.
- `+konteyner* -docker` — majburiy va taqiqlangan so'z.

**Qisqa so'zlar indekslanmaydi:**

```sql
SELECT id, sarlavha FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('va');
SELECT @@innodb_ft_min_token_size AS min_token;
```

```text
| min_token |
|         3 |
```

`va` — 4-maqolaning sarlavhasida bor, lekin natija **bo'sh**: 2 belgili so'z `innodb_ft_min_token_size = 3` dan qisqa, indeksga tushmagan.

**Reja:**

```sql
EXPLAIN FORMAT=TRADITIONAL SELECT id FROM maqolalar WHERE MATCH(sarlavha, matn) AGAINST ('konteyner*' IN BOOLEAN MODE);
```

```text
| type     | possible_keys | key  | … | Extra                             |
| fulltext | ft            | ft   | … | Using where; Ft_hints: no_ranking |
```

`type = fulltext` — `FULLTEXT` indeks ishlatildi.

**ngram parser** — so'z bo'lagi bo'yicha:

```sql
CREATE TABLE maqolalar_ng (id int PRIMARY KEY, sarlavha varchar(200) NOT NULL,
    FULLTEXT KEY ft (sarlavha) WITH PARSER ngram);
INSERT INTO maqolalar_ng SELECT id, sarlavha FROM maqolalar;
SELECT id, sarlavha FROM maqolalar_ng WHERE MATCH(sarlavha) AGAINST ('"teyner"' IN BOOLEAN MODE);
```

```text
| id | sarlavha             |
|  1 | Docker konteynerlari |
|  2 | Konteyner tarmoqlari |
|  5 | Konteynerda baza     |
```

`teyner` — so'z boshi emas, lekin ngram (2 belgili bo'laklar) uni topdi. Hujjatda ngram xitoy, yapon, koreys tillari uchun mo'ljallangan; bu yerda u `pg_trgm` ga o'xshash "bo'lak bo'yicha" qidiruv sifatida ko'rsatildi.

### SQLite

FTS5 jadvali — asosiy jadvalga **tashqi mazmun** (external content: `content='maqolalar'`, matn ikki marta saqlanmaydi; hujjatning 4.4.3-bo'limi), indeks `rebuild` bilan to'ldiriladi:

```sql
CREATE VIRTUAL TABLE izlash USING fts5(sarlavha, matn, content='maqolalar', content_rowid='id');
INSERT INTO izlash(izlash) VALUES ('rebuild');
SELECT rowid, sarlavha FROM izlash WHERE izlash MATCH 'konteyner';
SELECT rowid, sarlavha FROM izlash WHERE izlash MATCH 'konteyner*';
```

```text
1|Docker konteynerlari
2|Konteyner tarmoqlari
1|Docker konteynerlari
2|Konteyner tarmoqlari
5|Konteynerda baza
```

Uchala bazada bir xil: aniq so'z — 1, 2; prefiks — 1, 2, 5.

**Reyting (`rank` = `bm25`) va operatorlar:**

```sql
SELECT rowid, sarlavha, round(rank, 4) AS reyting FROM izlash
WHERE izlash MATCH 'konteyner* OR ilova*' ORDER BY rank;
SELECT rowid, sarlavha FROM izlash WHERE izlash MATCH 'konteyner* NOT docker';
```

```text
4|Kafka va xabarlar|-0.5965
1|Docker konteynerlari|-0.5711
5|Konteynerda baza|0.0
2|Konteyner tarmoqlari|0.0
2|Konteyner tarmoqlari
5|Konteynerda baza
```

Reyting manfiy, kichigi yaxshiroq. `0.0` — kuzatildi: faqat `konteyner*` ga mos kelgan 5 va 2 ning reytingi 4 xonagacha yaxlitlanganda nol bo'ldi; ikkala so'zga mos kelgan yoki `ilova*` bor maqolalar yuqorida. FTS5'da `OR`, `NOT` — so'z bilan yoziladi; bo'shliq — `AND`.

**`porter` — ingliz tili qo'shimchalari:**

```sql
CREATE VIRTUAL TABLE izlash_en USING fts5(matn, tokenize = 'porter unicode61');
INSERT INTO izlash_en(rowid, matn) SELECT id, matn FROM maqolalar;
SELECT rowid, matn FROM izlash_en WHERE izlash_en MATCH 'container';
```

```text
6|The container runs the application; containers are isolated.
```

**`trigram` — `LIKE '%…%'` uchun:**

```sql
CREATE VIRTUAL TABLE izlash_tri USING fts5(sarlavha, tokenize = 'trigram');
INSERT INTO izlash_tri(rowid, sarlavha) SELECT id, sarlavha FROM maqolalar;
SELECT rowid, sarlavha FROM izlash_tri WHERE sarlavha LIKE '%teyner%';
EXPLAIN QUERY PLAN SELECT rowid FROM izlash_tri WHERE sarlavha LIKE '%teyner%';
```

```text
1|Docker konteynerlari
2|Konteyner tarmoqlari
5|Konteynerda baza
QUERY PLAN
`--SCAN izlash_tri VIRTUAL TABLE INDEX 0:L0
```

`VIRTUAL TABLE INDEX` — shart FTS5 virtual jadvaliga uzatildi (natija — uch sarlavha, `teyner` so'z boshi emas). Hujjat: trigram tokenizatori FTS5'ni oddiy token emas, **istalgan satr bo'lagi** bo'yicha qidirishga kengaytiradi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| So'z bo'yicha qidiruv | `tsvector @@ tsquery` | `MATCH … AGAINST` | `fts5 … MATCH` |
| Indeks | GIN (yoki GiST) | `FULLTEXT` | FTS5 virtual jadval |
| O'zbek tili | `simple` — qo'shimchalar qoladi | Standart parser — qo'shimchalar qoladi | `unicode61` — qo'shimchalar qoladi |
| Prefiks | `konteyner:*` | `konteyner*` (boolean) | `konteyner*` |
| Reyting | `ts_rank` (kattasi yaxshi) | `MATCH` qiymati (kattasi yaxshi) | `rank`/`bm25` (kichigi yaxshi) |
| VA / YO'Q | `&`, `!` (yoki `websearch_to_tsquery`: `-`) | `+`, `-` (operatorsiz — ixtiyoriy) | bo'shliq / `AND`, `NOT` |
| Satr bo'lagi (`LIKE '%…%'`) | `pg_trgm` GIN | ngram parser | `trigram` tokenizator |
| Imlo xatosi bilan | `pg_trgm`: `%`, `similarity` | — | — |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Katta jadvalda `LIKE '%so'z%'` indekssiz | Har qidiruv — butun jadval (sinovda 4.9 ms va 0.030 ms) | PG: GIN (`tsvector` yoki `pg_trgm`); SQLite: FTS5 |
| O'zbekcha matnga `english` konfiguratsiyasi | Ingliz qo'shimcha qoidalari o'zbek so'zlarini buzadi | `simple` + prefiks so'rovlari |
| `konteyner` so'rovi `konteynerda` ni topadi deb kutish | O'zbek tilida stemming yo'q | `konteyner:*` / `konteyner*` |
| Indeksda `to_tsvector(matn)` — konfiguratsiyasiz (PG) | Hujjat: indeks bunday ifodada ishlatilmaydi | `to_tsvector('simple', matn)`, so'rovda ham aynan shunday |
| Foydalanuvchi matnini `to_tsquery` ga to'g'ridan-to'g'ri | Sintaksis xatosi (`konteyner docker` — operatorsiz) | `websearch_to_tsquery` |
| MySQL'da `+` siz bir nechta so'z | Operatorsiz so'z ixtiyoriy — `OR` kabi ishlaydi | `+so'z1 +so'z2` |
| MySQL'da 2 belgili so'zni qidirish | `innodb_ft_min_token_size` (3) dan qisqa — indekslanmagan | Sozlamani o'zgartirish (indeksni qayta qurish bilan) yoki ngram |

## Amaliyot

1. PostgreSQL'da `to_tsquery('simple', 'konteyner docker')` ni bajaring. Qanday xato chiqdi? Xuddi shu matnni `plainto_tsquery` va `websearch_to_tsquery` ga bering.
2. `ts_headline('simple', matn, to_tsquery('simple', 'konteyner:*'))` bilan topilgan so'zni belgilab ko'rsating.
3. `pg_trgm` bilan `SELECT sarlavha, similarity(sarlavha, 'Kafka xabar') FROM maqolalar ORDER BY 2 DESC` — eng o'xshash sarlavhalarni toping.
4. MySQL'da `IN NATURAL LANGUAGE MODE WITH QUERY EXPANSION` bilan `konteyner` ni qidiring. Natijaga qaysi maqolalar qo'shildi?
5. SQLite'da `izlash` jadvaliga `highlight(izlash, 1, '[', ']')` bilan qidiring.

## Rasmiy hujjat

- PostgreSQL — 12.1. Introduction (Full Text Search): <https://www.postgresql.org/docs/18/textsearch-intro.html>
- PostgreSQL — 12.2. Tables and Indexes: <https://www.postgresql.org/docs/18/textsearch-tables.html>
- PostgreSQL — 12.3. Controlling Text Search (`websearch_to_tsquery`, `ts_rank`): <https://www.postgresql.org/docs/18/textsearch-controls.html>
- PostgreSQL — 12.6. Dictionaries (`simple`): <https://www.postgresql.org/docs/18/textsearch-dictionaries.html>
- PostgreSQL — F.35. pg_trgm: <https://www.postgresql.org/docs/18/pgtrgm.html>
- MySQL — 14.9 Full-Text Search Functions: <https://dev.mysql.com/doc/refman/9.7/en/fulltext-search.html>
- MySQL — 14.9.2 Boolean Full-Text Searches: <https://dev.mysql.com/doc/refman/9.7/en/fulltext-boolean.html>
- MySQL — 14.9.6 Fine-Tuning MySQL Full-Text Search: <https://dev.mysql.com/doc/refman/9.7/en/fulltext-fine-tuning.html>
- MySQL — 14.9.8 ngram Full-Text Parser: <https://dev.mysql.com/doc/refman/9.7/en/fulltext-search-ngram.html>
- SQLite — SQLite FTS5 Extension: <https://www.sqlite.org/fts5.html>
