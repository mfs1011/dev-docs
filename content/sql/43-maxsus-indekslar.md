# 43 — Maxsus indekslar

[← Oldingi: Ko'p ustunli indeks](42-kop-ustunli-indeks.md) · [Mundarija](README.md) · [Keyingi: Indeks turlari →](44-indeks-turlari.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/43-1-tushuncha.jpg">
    <source src="/video/sql/43-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/43-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/43-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>43.1-video. Maxsus indekslar: ifoda, qisman va qoplovchi indekslar</figcaption>
</figure>

Oddiy indeks — ustun qiymatlari, hamma qatorlar uchun. Bu bobda indeksni **nimaga** va **qaysi qatorlarga** qurish mumkinligi bo'yicha to'rt kengaytma:

| Tur | Nima indekslanadi | Misol |
| --- | --- | --- |
| **Unique** | Qiymat, takrorsiz | `CREATE UNIQUE INDEX … (email)` |
| **Ifoda indeksi** (expression index) | Ustundan **hisoblangan** qiymat | `(lower(email))` |
| **Qisman indeks** (partial index) | Faqat **shartga mos** qatorlar | `… WHERE holat = 'yangi'` |
| **Qoplovchi indeks** (covering), `INCLUDE` | Kalit + so'rovga kerakli "yuk" ustunlar | `(id) INCLUDE (ism)` |

Va bitta nozik joy — **operator klassi va collation**: indeks qiymatlarni qaysi qoidaga ko'ra tartiblagan bo'lsa, faqat shu qoidadagi taqqoslashlarga yaraydi.

### Ifoda indeksi

PostgreSQL hujjatiga ko'ra indeks ustuni jadval ustunining o'zi bo'lishi shart emas — bir yoki bir nechta ustundan hisoblangan funksiya yoki ifoda bo'lishi mumkin. Tipik misol — katta-kichik harfni farqlamaydigan qidiruv:

```sql
SELECT * FROM test1 WHERE lower(col1) = 'value';
CREATE INDEX test1_lower_col1_idx ON test1 (lower(col1));
```

41-bobda ko'rganimizdek, `WHERE lower(email) = …` oddiy `email` indeksiga mos kelmaydi — indekslangan ifoda boshqa. Ifoda indeksi aynan shu ifodani saqlaydi.

Hujjatdagi qo'shimcha faktlar:

- `UNIQUE` ifoda indeksi oddiy `UNIQUE` cheklov bilan ifodalab bo'lmaydigan qoidalarni beradi: `UNIQUE (lower(col1))` — faqat katta-kichik harf bilan farq qiladigan qiymatlarni ham taqiqlaydi;
- ifodaning o'zi funksiya chaqiruvi bo'lmasa, qavs kerak: `((first_name || ' ' || last_name))`;
- ifoda indeksini saqlash qimmatroq: ifoda har `INSERT` va yangilanishda hisoblanadi. Qidiruvda esa qayta hisoblanmaydi — u indeksda saqlangan.

SQLite hujjati ikki muhim cheklovni qo'shadi:

- so'rovdagi ifoda indeksdagi bilan **aynan bir xil yozilishi** kerak. Rejalashtiruvchi "algebra qilmaydi": `x+y` indeksi `WHERE y+x = 22` ga ishlatilmaydi — matematik jihatdan teng, lekin bir xil emas;
- ifodada faqat **deterministik** funksiyalar (natijasi faqat argumentlarga bog'liq) bo'ladi: `random()` yo'q.

### Qisman indeks

SQLite hujjati ta'rifi: qisman indeks — jadval qatorlarining **bir qismi** ustidagi indeks. Oddiy indeksda har qatorga bitta yozuv; qismanda — faqat ba'zilariga. To'g'ri ishlatilsa — kichikroq fayl, tezroq so'rov **va** tezroq yozish.

Qachon foydali:

- qidiriladigan qatorlar kam (2% "yangi" buyurtmalar, 98% yopilgan — 41-bob);
- noyoblik faqat bir qism qatorlar orasida kerak: PostgreSQL hujjatidagi "bitta muvaffaqiyatli test" misoli, yoki 40-bobdagi yumshoq o'chirish.

**So'rov qisman indeksdan qachon foydalana oladi.** SQLite hujjati buni mantiq bilan aytadi: so'rov sharti `W` indeks sharti `X` ni **kafolatlashi** (W ⇒ X) kerak. SQLite buni sodda qoidalar bilan tekshiradi: masalan, indeks shartidagi had so'rov shartida ham bo'lsa. Ya'ni `WHERE holat = 'yangi' AND …` — mos; `WHERE id > 199000` (holatsiz) — mos emas, chunki bunday so'rov indeksda yo'q qatorlarni ham qaytarishi mumkin.

### Index-only scan va `INCLUDE`

PostgreSQL hujjati: PostgreSQL'dagi **barcha indekslar ikkilamchi** — jadvalning asosiy ma'lumot qismidan (**heap**) alohida saqlanadi. Oddiy indeks skanerlashida har qator uchun ham indeksdan, ham heap'dan o'qiladi, va heap'ga murojaatlar tasodifiy joylarga — sekin.

**Index-only scan** — so'rovga faqat indeksdan javob berish, heap'ga umuman murojaat qilmasdan. Hujjatdagi ikki asosiy shart:

1. indeks turi buni qo'llashi kerak — B-tree doim qo'llaydi (GIN — yo'q);
2. so'rov **faqat indeksda saqlangan ustunlarni** ishlatishi kerak.

Uchinchi, PostgreSQL'ga xos shart — **ko'rinuvchanlik** (visibility, 52-bob): qator joriy tranzaksiyaga ko'rinadimi, bu ma'lumot indeksda emas, faqat heap'da. Shuning uchun PostgreSQL har heap sahifasi uchun **visibility map** da "bu sahifadagi barcha qatorlar hammaga ko'rinadi" bitini saqlaydi. Bit o'rnatilgan bo'lsa — heap'ga borilmaydi; o'rnatilmagan bo'lsa (yaqinda o'zgargan sahifa) — baribir boriladi. Bitlar `VACUUM` (65-bob) tomonidan o'rnatiladi.

**`INCLUDE`** — hujjatga ko'ra qoplovchi indeks yaratish usuli: ba'zi ustunlar qidiruv kaliti emas, shunchaki "yuk" (payload):

```sql
CREATE INDEX tab_x_y ON tab (x) INCLUDE (y);
```

- `SELECT y FROM tab WHERE x = 'key'` — index-only scan bo'la oladi;
- `y` kalit emas, shuning uchun uning tipi indeks qo'llay oladigan tip bo'lishi shart emas;
- `UNIQUE … INCLUDE (y)` — noyoblik faqat `x` ga tegishli, `(x, y)` juftligiga emas;
- hujjat maslahati: "yuk" ustunlarni, ayniqsa keng ustunlarni, ehtiyotkorlik bilan qo'shing — indeks yozuvi o'lcham chegarasidan oshsa, yozish xato beradi.

InnoDB'da (39-bob) ikkilamchi indeks yozuvida birlamchi kalit bor, shuning uchun MySQL'da qoplovchi indeks — oddiy ko'p ustunli indeks. `INCLUDE` yo'q.

### Operator klassi va collation

PostgreSQL'da har indeks ustunining **operator klassi** (operator class) bor — qaysi taqqoslash operatorlari indeksdan foydalana olishini belgilaydi. Hujjatga ko'ra:

- sukut bo'yicha operator klassi matnni **ma'lumotlar bazasi collation** qoidalariga (11-bob) ko'ra tartiblaydi;
- `text_pattern_ops`, `varchar_pattern_ops` — qiymatlarni **qat'iy belgima-belgi** solishtiradi. Ular **`LIKE 'prefiks%'`** va regex so'rovlari uchun kerak — agar baza standart "C" locale'da bo'lmasa;
- bunday indeks `<`, `>` kabi oddiy taqqoslashlarga yaramaydi (tenglikka yaraydi) — kerak bo'lsa sukut klassli ikkinchi indeks ham qo'yiladi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/43-2-kod.jpg">
    <source src="/video/sql/43-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/43-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/43-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>43.2-video. Maxsus indekslar amaliyoti va EXPLAIN tahlili</figcaption>
</figure>

Misollar PostgreSQL 18.6 (baza collation'i `en_US.UTF-8`), MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. 200 000 qator; email'larning yarmi katta harflar bilan (`User2@Misol.UZ`), yarmi kichik; `holat` — 1% `'yangi'`.

```sql
CREATE TABLE f (id int PRIMARY KEY, email text NOT NULL, holat text NOT NULL, ism text NOT NULL);
INSERT INTO f
SELECT g,
       CASE WHEN g % 2 = 0 THEN 'User' || g || '@Misol.UZ' ELSE 'user' || g || '@misol.uz' END,
       CASE WHEN g % 100 = 0 THEN 'yangi' ELSE 'faol' END,
       'Ism' || g
FROM generate_series(1, 200000) g;
CREATE INDEX f_email ON f (email);
ANALYZE f;
```

Natijalar PostgreSQL'dan.

### Ifoda indeksi: `lower(email)`

```sql
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE lower(email) = 'user77@misol.uz';
CREATE INDEX f_lower_email ON f (lower(email));
ANALYZE f;
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE lower(email) = 'user77@misol.uz';
```

```text
 Gather
   Workers Planned: 1
   ->  Parallel Seq Scan on f
         Filter: (lower(email) = 'user77@misol.uz'::text)

 Index Scan using f_lower_email on f
   Index Cond: (lower(email) = 'user77@misol.uz'::text)
```

`f_email` bor edi, lekin `lower(email)` ga yaramadi. Ifoda indeksidan keyin — `Index Cond: (lower(email) = …)`: hujjatda aytilganidek, tizim buni oddiy `WHERE indekslangan_ustun = 'doimiy'` deb ko'radi.

### `UNIQUE (lower(email))`: harf farqi bilan takror yo'q

```sql
CREATE UNIQUE INDEX f_lower_email_u ON f (lower(email));
INSERT INTO f VALUES (200001, 'USER77@MISOL.UZ', 'faol', 'x');
```

```text
ERROR:  duplicate key value violates unique constraint "f_lower_email_u"
DETAIL:  Key (lower(email))=(user77@misol.uz) already exists.
```

Oddiy `UNIQUE (email)` buni o'tkazib yuborardi — `USER77@MISOL.UZ` va `user77@misol.uz` turli satrlar.

### `LIKE 'prefiks%'` va `text_pattern_ops`

```sql
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE email LIKE 'user77%';
CREATE INDEX f_email_pattern ON f (email text_pattern_ops);
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE email LIKE 'user77%';
```

```text
 Seq Scan on f
   Filter: (email ~~ 'user77%'::text)

 Index Scan using f_email_pattern on f
   Index Cond: ((email ~>=~ 'user77'::text) AND (email ~<~ 'user78'::text))
   Filter: (email ~~ 'user77%'::text)
```

Baza `en_US.UTF-8` collation'ida — oddiy `f_email` indeksi `LIKE` prefiksiga yaramadi. `text_pattern_ops` indeksi `LIKE 'user77%'` ni **oraliq**qa aylantirdi: `'user77' ≤ email < 'user78'` (`~>=~`, `~<~` — belgima-belgi taqqoslash operatorlari).

### Qisman indeks

```sql
CREATE INDEX f_holat_full ON f (holat);
CREATE INDEX f_yangi ON f (id) WHERE holat = 'yangi';
SELECT relname, pg_size_pretty(pg_relation_size(oid)) FROM pg_class
WHERE relname IN ('f_holat_full', 'f_yangi');
```

```text
   relname    | pg_size_pretty 
--------------+----------------
 f_holat_full | 1368 kB
 f_yangi      | 64 kB
(2 rows)
```

Qisman indeks **21 baravar** kichik — 200 000 emas, 2000 qator.

```sql
ANALYZE f;
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE holat = 'yangi' AND id > 199000;
EXPLAIN (COSTS OFF) SELECT id FROM f WHERE holat = 'faol'  AND id > 199000;
```

```text
 Index Only Scan using f_yangi on f
   Index Cond: (id > 199000)

 Index Scan using f_pkey on f
   Index Cond: (id > 199000)
   Filter: (holat = 'faol'::text)
```

- `holat = 'yangi'` — so'rov sharti indeks shartini kafolatlaydi, `f_yangi` ishlatildi (`holat` ni tekshirish ham kerak emas — indeksdagi har qator `'yangi'`).
- `holat = 'faol'` — `f_yangi` da bunday qatorlar yo'q, ishlatib bo'lmaydi.

40-bobda qisman **unique** indeks yumshoq o'chirish uchun ko'rilgan edi.

### `INCLUDE` va index-only scan

```sql
CREATE INDEX f_id_inc ON f (id) INCLUDE (ism);
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT id, ism FROM f WHERE id BETWEEN 1000 AND 1100;
```

```text
 Index Only Scan using f_id_inc on f (actual rows=101.00 loops=1)
   Index Cond: ((id >= 1000) AND (id <= 1100))
   Heap Fetches: 101
   Index Searches: 1
```

Reja — `Index Only Scan`, lekin **`Heap Fetches: 101`**: har qator uchun baribir heap'ga borildi. Jadval endigina to'ldirilgan, visibility map bitlari hali o'rnatilmagan — hujjatda aytilgan holat. `VACUUM` dan keyin:

```sql
VACUUM f;
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF, BUFFERS OFF)
SELECT id, ism FROM f WHERE id BETWEEN 1000 AND 1100;
```

```text
 Index Only Scan using f_id_inc on f (actual rows=101.00 loops=1)
   Index Cond: ((id >= 1000) AND (id <= 1100))
   Heap Fetches: 0
   Index Searches: 1
```

`Heap Fetches: 0` — javob to'liq indeksdan. Tez-tez o'zgaradigan jadvalda bu raqam yana o'sadi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/43-3-dialektlar.jpg">
    <source src="/video/sql/43-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/43-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/43-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>43.3-video. Dialektlar: PostgreSQL, MySQL va SQLite maxsus indeks farqlari</figcaption>
</figure>

### MySQL

**Collation o'zi katta-kichik harfni farqlamaydi.** MySQL'ning sukut collation'i `utf8mb4_0900_ai_ci` (11-bob; `ci` — case-insensitive). Shuning uchun `lower()` siz ham:

```sql
SELECT id, email FROM f WHERE email = 'USER77@MISOL.UZ';
EXPLAIN FORMAT=TREE SELECT id FROM f WHERE email = 'USER77@MISOL.UZ';
```

```text
| id | email           |
| 77 | user77@misol.uz |

-> Covering index lookup on f using f_email (email = 'USER77@MISOL.UZ')  (cost=1.1 rows=1)
```

Oddiy indeks bilan, katta harfli so'rov kichik harfli qatorni topdi. Xuddi shu sababdan MySQL'da oddiy `UNIQUE (email)` ham harf farqini takror deb hisoblaydi. PostgreSQL'da (deterministik collation) va SQLite'da (`BINARY`) bunday emas.

**`LIKE 'prefiks%'`** — maxsus operator klassi kerak emas: `Covering index range scan on f using f_email over ('user77' <= email <= 'user77????…')`.

**Funksional indeks (functional key parts).** `lower(email)` bo'yicha qidiruv baribir yozilsa — oddiy indeks yaramaydi (`Covering index scan` — butun indeks o'qildi). Hujjatdagi sintaksis — ifoda **ikki qavsda**:

```sql
CREATE INDEX f_lower_email ON f ((LOWER(email)));
EXPLAIN FORMAT=TREE SELECT id FROM f WHERE LOWER(email) = 'user77@misol.uz';
```

```text
-> Index lookup on f using f_lower_email (lower(email) = 'user77@misol.uz')  (cost=0.35 rows=1)
```

Hujjatga ko'ra funksional indekslar **yashirin virtual generated ustunlar** (15-bob) sifatida amalga oshiriladi va jadval ustunlari chegarasiga kiradi; tashqi kalitda ishlatib bo'lmaydi.

**Qisman indeks yo'q:**

```text
ERROR 1064 (42000) at line 14: … near 'WHERE holat = 'yangi'' at line 1
```

**Qoplovchi indeks — ko'p ustunli indeks orqali:**

```sql
CREATE INDEX f_id_ism ON f (holat, ism);
EXPLAIN FORMAT=TREE SELECT ism FROM f WHERE holat = 'yangi';
```

```text
-> Covering index lookup on f using f_id_ism (holat = 'yangi')  (cost=232 rows=2000)
```

`INCLUDE` yo'q, lekin `ism` ni kalitning ikkinchi ustuni qilish shu natijani beradi.

### SQLite

**`BINARY` collation — harfni farqlaydi.** `WHERE email = 'USER77@MISOL.UZ'` hech narsa qaytarmadi.

**Ifoda indeksi** — bor, PostgreSQL kabi: `SEARCH f USING COVERING INDEX f_lower_email (<expr>=?)`. `UNIQUE (lower(email))` ham ishladi: `UNIQUE constraint failed: index 'f_lower_u'`.

**"Algebra qilmaydi"** — hujjatdagi qoida sinovda:

```sql
CREATE INDEX f_xy ON f (x + y);
EXPLAIN QUERY PLAN SELECT id FROM f WHERE x + y = 22;
EXPLAIN QUERY PLAN SELECT id FROM f WHERE y + x = 22;
CREATE INDEX f_r ON f (random());
```

```text
`--SEARCH f USING COVERING INDEX f_xy (<expr>=?)
`--SCAN f
Parse error near line 20: non-deterministic functions prohibited in index expressions
```

**`LIKE` va collation.** SQLite'da `LIKE` sukut bo'yicha ASCII harflar uchun katta-kichikni farqlamaydi (23-bob). Hujjatga ko'ra `LIKE` optimizatsiyasi faqat ikki holatda: ustun `BINARY` collation bilan indekslangan va `case_sensitive_like` yoqilgan, **yoki** ustun `NOCASE` bilan indekslangan va `case_sensitive_like` o'chiq. `GLOB` doim harfni farqlaydi va `BINARY` indeksdan foydalanadi:

```text
-- f_email (BINARY) bilan:
`--SCAN f USING COVERING INDEX f_email                       -- LIKE 'user77%'

-- (email COLLATE NOCASE) indeksi qo'shilgandan keyin:
`--SEARCH f USING COVERING INDEX f_email_nc (email>? AND email<?)   -- LIKE 'user77%'
`--SEARCH f USING COVERING INDEX f_email (email>? AND email<?)      -- GLOB 'user77*'
```

Bu PostgreSQL'dagi `text_pattern_ops` vaziyatining SQLite'dagi o'xshashi: indeksning taqqoslash qoidasi so'rovnikiga mos bo'lishi kerak.

**Qisman indeks bor:**

```text
`--SEARCH f USING COVERING INDEX f_yangi (id>?)            -- holat = 'yangi' AND id > 199000
`--SEARCH f USING INTEGER PRIMARY KEY (rowid>?)             -- holat = 'faol' AND id > 199000
```

**Qoplovchi** — ko'p ustunli indeks orqali (`COVERING INDEX f_holat_ism`); `INCLUDE` yo'q.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Ifoda indeksi | `(lower(x))` | `((LOWER(x)))` — yashirin generated ustun | `(lower(x))`, aynan bir xil yozilishi kerak |
| `UNIQUE` ifoda indeksi | Ha | Ha | Ha |
| Qisman indeks | Ha | **Yo'q** | Ha |
| `INCLUDE` | Ha | Yo'q (ko'p ustunli indeks; InnoDB'da PK o'zi bor) | Yo'q (ko'p ustunli indeks) |
| Index-only scan | Ha, visibility map'ga bog'liq (`Heap Fetches`) | Covering index | Covering index |
| Sukut matn taqqoslash | Collation (`en_US` — harfni farqlaydi) | `utf8mb4_0900_ai_ci` — **farqlamaydi** | `BINARY` — farqlaydi |
| `LIKE 'x%'` indeksi | Collation `C` emas bo'lsa — `text_pattern_ops` | Oddiy indeks | `NOCASE` indeks (yoki `case_sensitive_like` + `BINARY`) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `WHERE lower(email) = …` va faqat `email` indeksi | Indeks ishlatilmaydi | Ifoda indeksi `(lower(email))` |
| Ifoda indeksidagi va so'rovdagi ifoda boshqacha yozilgan | SQLite (va umuman rejalashtiruvchi) mos deb bilmaydi | Bir xil yozish; view yoki generated ustun |
| "Faol" qatorlar kam, lekin to'liq indeks | Katta indeks, har yozishda yangilanadi | Qisman indeks (PG, SQLite) |
| Qisman indeks bor, so'rovda uning sharti yo'q | Indeks ishlatilmaydi | So'rovga shartni qo'shish |
| `INCLUDE` ga keng ustunlar | Indeks kattalashadi; o'lcham chegarasidan oshsa yozish xato beradi | Faqat kerakli, tor ustunlar |
| `Index Only Scan` ni har doim tez deb o'ylash (PG) | `Heap Fetches` ko'p bo'lsa — oddiy indeks skanerlashi kabi | Visibility map — `VACUUM` (65-bob) |
| PG'da `LIKE 'abc%'` uchun oddiy indeks (`C` bo'lmagan collation) | Ishlatilmaydi | `text_pattern_ops` |
| MySQL'da `UNIQUE (email)` harfni farqlaydi deb o'ylash | `_ci` collation: `Ali@x` = `ali@x` | Kerakli collation'ni ongli tanlash (11-bob) |
| MySQL'ga qisman indeksni ko'chirish | Sintaksis xatosi | Boshqa yechim (masalan, generated ustun + unique, 15-bob) |

## Amaliyot

1. PostgreSQL'da `f` jadvalida `familiya || ' ' || ism` bo'yicha qidiruv uchun ifoda indeksini yarating. Qavslar qayerda kerak?
2. `holat = 'yangi'` qatorlari uchun qisman indeks yarating va `holat = 'yangi' AND email LIKE 'user1%'` so'rovi uni ishlatadimi, tekshiring.
3. PostgreSQL'da `f_id_inc` indeksi bilan 1000 qatorni `UPDATE` qiling va index-only scan'dagi `Heap Fetches` ni qayta ko'ring. Keyin `VACUUM` qiling.
4. MySQL'da `CREATE TABLE u (email varchar(50) COLLATE utf8mb4_bin UNIQUE)` va sukut collation bilan ikki jadval yarating. `ali@x` va `Ali@x` ni ikkalasiga yozib ko'ring.
5. SQLite'da `PRAGMA case_sensitive_like = ON;` dan keyin `LIKE 'user77%'` qaysi indeksdan foydalanadi?

## Rasmiy hujjat

- PostgreSQL — 11.6. Unique Indexes: <https://www.postgresql.org/docs/18/indexes-unique.html>
- PostgreSQL — 11.7. Indexes on Expressions: <https://www.postgresql.org/docs/18/indexes-expressional.html>
- PostgreSQL — 11.8. Partial Indexes: <https://www.postgresql.org/docs/18/indexes-partial.html>
- PostgreSQL — 11.9. Index-Only Scans and Covering Indexes: <https://www.postgresql.org/docs/18/indexes-index-only-scans.html>
- PostgreSQL — 11.10. Operator Classes and Operator Families: <https://www.postgresql.org/docs/18/indexes-opclass.html>
- MySQL — 15.1.18 CREATE INDEX Statement (Functional Key Parts): <https://dev.mysql.com/doc/refman/9.7/en/create-index.html>
- SQLite — Partial Indexes: <https://www.sqlite.org/partialindex.html>
- SQLite — Indexes On Expressions: <https://www.sqlite.org/expridx.html>
- SQLite — The SQLite Query Optimizer Overview (The LIKE optimization): <https://www.sqlite.org/optoverview.html>
