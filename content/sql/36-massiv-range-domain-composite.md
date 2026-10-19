# 36 — Massiv, range, domain va composite (PG)

[← Oldingi: JSON](35-json.md) · [Mundarija](README.md) · [Keyingi: Aloqalar va tashqi kalitlar →](37-aloqalar-va-tashqi-kalitlar.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/36-1-tushuncha.jpg">
    <source src="/video/sql/36-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/36-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/36-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>PostgreSQL maxsus tiplari tushunchasi: massivlar, range oraliqlari, exclusion cheklovi, domain va composite turlar</figcaption>
</figure>

Bu bob — **PostgreSQL'ga xos** tiplar. MySQL va SQLite'da ularning to'g'ridan-to'g'ri o'rni yo'q (oxirida — nima bilan almashtiriladi). To'rtta tip:

| Tip | Nima | Misol |
| --- | --- | --- |
| **Massiv** (array) | Bitta ustunda bir xil tipli qiymatlar ro'yxati | `text[]`: `{sql,postgres}` |
| **Range** (oraliq) | Qiymatlar oralig'i: boshi va oxiri | `daterange`: `[2026-02-01,2026-02-06)` |
| **Domain** | Cheklovli "o'z tipimiz" — mavjud tip + `CHECK` | `telefon_raqam` |
| **Composite** | Bir nechta maydonli tuzilma — "qator" tipi | `manzil (shahar, kocha, uy)` |

### Massivlar

PostgreSQL hujjatiga ko'ra jadval ustuni o'zgaruvchan uzunlikdagi ko'p o'lchamli massiv bo'lishi mumkin: har qanday o'rnatilgan yoki foydalanuvchi tipi, enum, composite, range yoki domain'dan. Tip nomiga `[]` qo'shiladi: `integer[]`, `text[]`.

Muhim qoidalar (hujjat):

- indekslar sukut bo'yicha **1 dan** boshlanadi (JSON massivlari 0 dan, 35-bob);
- e'lon qilingan o'lcham va o'lchamlar soni (`integer[3]`, `text[][]`) **majburiy emas** — hujjatga ko'ra bu "shunchaki hujjat", ishlash paytiga ta'sir qilmaydi;
- qidirish: `qiymat = ANY (massiv)`, `massiv @> ARRAY[…]` (o'z ichiga oladi), `massiv && ARRAY[…]` (kesishadi). `&&` ni indeks tezlashtirishi mumkin (GIN, 44-bob).

**Hujjatning ogohlantirishi** (aynan shu bobning asosiy maslahati):

> Massivlar to'plam emas; massiv ichidan muayyan elementlarni qidirish ma'lumotlar bazasi noto'g'ri loyihalanganining belgisi bo'lishi mumkin. Massiv elementi bo'ladigan har element uchun bitta qatorli alohida jadvalni ko'rib chiqing. Uni qidirish osonroq va ko'p elementlarda yaxshiroq kengayadi.

Ya'ni `teglar text[]` qulay ko'rinadi, lekin "har teg bo'yicha maqolalar soni", "teg nomini o'zgartirish", "faqat ruxsat etilgan teglar" (tashqi kalit) kabi vazifalar alohida `teglar` va `maqola_teglari` jadvallari bilan (37-bob) ancha oson. Massiv — tartibli, kam o'zgaradigan, butunligicha o'qiladigan kichik ro'yxatlar uchun.

### Range tiplari

Hujjatga ko'ra range — biror tipning (**subtype**) qiymatlari oralig'i. Eng aniq misol — vaqt oraliqlari: xona qachondan qachongacha band. O'rnatilgan tiplar: `int4range`, `int8range`, `numrange`, `tsrange`, `tstzrange`, `daterange` va har biriga mos **multirange** (`datemultirange` …) — kesishmaydigan oraliqlar ro'yxati.

**Chegaralar:** `[` va `]` — kiradi (inclusive), `(` va `)` — kirmaydi (exclusive). `[2026-02-01,2026-02-05)` — 1-fevraldan 5-fevralgacha, 5-fevral **kirmaydi**. Chegara bo'sh bo'lsa — cheklanmagan: `[2026-02-01,)`. `empty` — bo'sh oraliq.

**Diskret range'lar** (hujjat): `integer`, `date` kabi aniq "qadam"i bor tiplarda PostgreSQL oraliqni **kanonik** shaklga keltiradi — `[boshi, oxiri)`. Shuning uchun `daterange('2026-02-01', '2026-02-05', '[]')` `[2026-02-01,2026-02-06)` bo'lib saqlanadi.

**Asosiy operatorlar:** `@>` (o'z ichiga oladi), `&&` (kesishadi), `lower()`, `upper()`, `isempty()`.

**Cheklovlar** (hujjatning "Constraints on Ranges" bo'limi): oraliqlar uchun `UNIQUE` odatda mos emas — kerakli narsa "**kesishmasin**". Buning uchun **exclusion constraint** (istisno cheklovi): `EXCLUDE USING GIST (davr WITH &&)`. Oddiy ustun bilan birga (masalan, "bir xonada kesishmasin") — `btree_gist` kengaytmasi kerak.

### Domain

Hujjatga ko'ra domain — boshqa tipga asoslangan foydalanuvchi tipi, ixtiyoriy cheklovlar bilan. Aks holda u asosiy tip kabi ishlaydi: barcha operator va funksiyalar mos keladi.

```sql
CREATE DOMAIN musbat_summa AS numeric(12,2) CHECK (VALUE > 0);
```

Foydasi: bir xil qoida (telefon formati, musbat summa, email) o'nlab jadvalda takrorlanmaydi — bir joyda yoziladi, bir joyda o'zgaradi.

Hujjatdagi nozik joylar:

- domain qiymatiga asosiy tipning operatori qo'llansa, natija **asosiy tipda** bo'ladi: `summa - 1` — `numeric`, `musbat_summa` emas. Qayta tekshirish uchun — `::musbat_summa`;
- `CREATE DOMAIN` hujjati tavsiyasi: domain cheklovini `NULL` ga ruxsat beradigan qilib yozing, `NOT NULL` ni esa **ustunga** qo'ying. Sabab: domain'dagi `NOT NULL` ni tashqi birlashtirish (25-bob) yoki bo'sh skalyar subquery orqali chetlab o'tish mumkin;
- `CHECK` ifodasi o'zgarmas (immutable) deb hisoblanadi — u qiymat domain'ga birinchi o'girilganda tekshiriladi. Ichidagi funksiya keyin o'zgartirilsa, PostgreSQL buni sezmaydi.

### Composite tiplar

Hujjatga ko'ra composite tip qator yoki yozuv tuzilishini ifodalaydi — maydon nomlari va tiplari ro'yxati. `CREATE TYPE … AS (…)` bilan yaratiladi; `CREATE TABLE` ga o'xshaydi, lekin hozircha **cheklov** (`NOT NULL` va h.k.) yozib bo'lmaydi. Hujjatga ko'ra har jadval yaratilganda ham uning qator tipi sifatida shu nomli composite tip avtomatik yaratiladi.

Maydonga murojaat — nuqta bilan, lekin **qavsda**: `(manzil).shahar`. Hujjatga ko'ra qavssiz `manzil.shahar` da `manzil` jadval nomi deb o'qiladi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/36-2-kod.jpg">
    <source src="/video/sql/36-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/36-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/36-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Maxsus tiplar amaliyotda: massiv indekslari va unnest, daterange va multirange, bron tizimidagi EXCLUDE va domain tekshiruvi</figcaption>
</figure>

Misollar PostgreSQL 18.6 da ishga tushirilgan; MySQL 9.7.2 va SQLite 3.54.0 dagi natijalar "Dialektlar"da.

### Massiv: e'lon, indeks, uzunlik

```sql
CREATE TABLE maqolalar (id int PRIMARY KEY, sarlavha text, teglar text[], baholar int[]);
INSERT INTO maqolalar VALUES
    (1, 'SQL asoslari', ARRAY['sql','postgres'], '{5,4,5}'),
    (2, 'JSON', '{json,postgres,mysql}', '{3}'),
    (3, 'Git', '{}', NULL);

SELECT id, teglar, teglar[1] AS birinchi, teglar[10] AS yoq,
       cardinality(teglar) AS soni, array_length(teglar, 1) AS uzunlik
FROM maqolalar ORDER BY id;
```

```text
 id |        teglar         | birinchi | yoq | soni | uzunlik 
----+-----------------------+----------+-----+------+---------
  1 | {sql,postgres}        | sql      |     |    2 |       2
  2 | {json,postgres,mysql} | json     |     |    3 |       3
  3 | {}                    |          |     |    0 |        
(3 rows)
```

- Ikki yozuv: `ARRAY['sql','postgres']` va matnli `'{json,postgres,mysql}'`.
- Chegaradan tashqari indeks (`[10]`) — xato emas, `NULL`.
- Bo'sh massivda `cardinality` — 0, `array_length` — `NULL`.

### Massivdan qidirish

```sql
SELECT id FROM maqolalar WHERE 'postgres' = ANY (teglar) ORDER BY id;   -- element bor
SELECT id FROM maqolalar WHERE teglar @> ARRAY['json','mysql'];         -- ikkalasi ham bor
SELECT id FROM maqolalar WHERE teglar && ARRAY['sql','mysql'] ORDER BY id; -- kamida bittasi
```

```text
 id 
----
  1
  2
(2 rows)

 id 
----
  2
(1 row)

 id 
----
  1
  2
(2 rows)
```

### Massivni qatorlarga: `unnest`

"Har teg bo'yicha maqolalar soni" — massiv avval qatorlarga yoyiladi:

```sql
SELECT t.teg, count(*)
FROM maqolalar m, unnest(m.teglar) AS t(teg)
GROUP BY t.teg ORDER BY count(*) DESC, t.teg;

SELECT array_agg(sarlavha ORDER BY id) FROM maqolalar;   -- teskarisi
```

```text
   teg    | count 
----------+-------
 postgres |     2
 json     |     1
 mysql    |     1
 sql      |     1
(4 rows)

         array_agg         
---------------------------
 {"SQL asoslari",JSON,Git}
(1 row)
```

Alohida `maqola_teglari (maqola_id, teg)` jadvalida bu oddiy `GROUP BY teg` bo'lardi — hujjat aytgan "qidirish osonroq".

### O'lchamlar tekshirilmaydi

```sql
INSERT INTO maqolalar VALUES (4, 'x', '{{a,b},{c,d}}', '{1}');
SELECT id, teglar, array_ndims(teglar) FROM maqolalar WHERE id = 4;
```

```text
 id |    teglar     | array_ndims 
----+---------------+-------------
  4 | {{a,b},{c,d}} |           2
(1 row)
```

Ustun `text[]` (bir o'lchamli) deb e'lon qilingan, lekin ikki o'lchamli massiv xatosiz yozildi — hujjatda aytilganidek. Kerak bo'lsa — `CHECK (array_ndims(teglar) = 1)`.

### Range: chegaralar va operatorlar

```sql
SELECT daterange('2026-02-01', '2026-02-05', '[]') AS yopiq,
       int4range(1, 10, '(]') AS r,
       daterange('2026-02-01','2026-02-05') @> date '2026-02-05' AS ichidami,
       daterange('2026-02-01','2026-02-05') && daterange('2026-02-04','2026-02-10') AS kesishadi,
       upper(daterange('2026-02-01','2026-02-05')) AS yuqori,
       isempty(int4range(5,5)) AS bosh;
```

```text
          yopiq          |   r    | ichidami | kesishadi |   yuqori   | bosh 
-------------------------+--------+----------+-----------+------------+------
 [2026-02-01,2026-02-06) | [2,11) | f        | t         | 2026-02-05 | t
(1 row)
```

- `'[]'` bilan yaratilgan oraliq kanonik `[…, 2026-02-06)` ga aylandi; `(1,10]` — `[2,11)`.
- Sukut bo'yicha (`'[)'`) 5-fevral oraliqqa **kirmaydi** — `ichidami = f`.
- `[5,5)` — bo'sh.

**Multirange** — kesishgan oraliqlar avtomatik birlashadi:

```sql
SELECT datemultirange(daterange('2026-02-01','2026-02-05'),
                      daterange('2026-02-03','2026-02-08'),
                      daterange('2026-03-01','2026-03-02')) AS birlashma;
```

```text
                     birlashma                     
---------------------------------------------------
 {[2026-02-01,2026-02-08),[2026-03-01,2026-03-02)}
(1 row)
```

### Exclusion constraint: xona ikki marta band bo'lmasin

Hujjatdagi `room_reservation` misoli tuzilishida:

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE bron (
    xona int,
    davr tsrange,
    EXCLUDE USING GIST (xona WITH =, davr WITH &&)
);
INSERT INTO bron VALUES (101, '[2026-02-02 10:00, 2026-02-02 12:00)');  -- ok
INSERT INTO bron VALUES (102, '[2026-02-02 11:00, 2026-02-02 13:00)');  -- ok: boshqa xona
INSERT INTO bron VALUES (101, '[2026-02-02 12:00, 2026-02-02 13:00)');  -- ok: 12:00 da tegadi, kesishmaydi
INSERT INTO bron VALUES (101, '[2026-02-02 11:30, 2026-02-02 12:30)');  -- kesishadi
```

```text
ERROR:  conflicting key value violates exclusion constraint "bron_xona_davr_excl"
DETAIL:  Key (xona, davr)=(101, ["2026-02-02 11:30:00","2026-02-02 12:30:00")) conflicts with existing key (xona, davr)=(101, ["2026-02-02 10:00:00","2026-02-02 12:00:00")).
```

Uchinchi qator `[12:00, 13:00)` qabul qilindi: oldingi `[10:00, 12:00)` 12:00 ni o'z ichiga olmaydi. Yarim ochiq oraliq aynan shuning uchun qulay. Bu qoidani ilova kodida tekshirish parallel so'rovlarda ishonchsiz (55-bob) — cheklov esa ma'lumotlar bazasi darajasida kafolat beradi.

### Domain

```sql
CREATE DOMAIN telefon_raqam AS text CHECK (VALUE ~ '^\+998[0-9]{9}$');
CREATE DOMAIN musbat_summa AS numeric(12,2) CHECK (VALUE > 0);
CREATE TABLE tolovlar (
    id int PRIMARY KEY,
    telefon telefon_raqam NOT NULL,     -- NOT NULL ustunda, domain'da emas
    summa musbat_summa NOT NULL
);
INSERT INTO tolovlar VALUES (1, '+998901234567', 15000);   -- ok
INSERT INTO tolovlar VALUES (2, '901234567', 15000);
INSERT INTO tolovlar VALUES (3, '+998901112233', -5);
```

```text
ERROR:  value for domain telefon_raqam violates check constraint "telefon_raqam_check"
ERROR:  value for domain musbat_summa violates check constraint "musbat_summa_check"
```

Domain ustidagi amal natijasining tipi:

```sql
SELECT pg_typeof(summa), pg_typeof(summa - 1) FROM tolovlar;
SELECT (summa - 20000)::musbat_summa FROM tolovlar;
```

```text
  pg_typeof   | pg_typeof 
--------------+-----------
 musbat_summa | numeric
(1 row)

ERROR:  value for domain musbat_summa violates check constraint "musbat_summa_check"
```

`summa - 1` — oddiy `numeric`: cheklov unga tegishli emas. Domain'ga qayta o'girilganda (`::musbat_summa`) tekshiruv yana ishladi.

### Composite tip

```sql
CREATE TYPE manzil AS (shahar text, kocha text, uy int);
CREATE TABLE mijozlar2 (id int PRIMARY KEY, ism text, manzil manzil);
INSERT INTO mijozlar2 VALUES
    (1, 'Ali',  ROW('Toshkent', 'Navoiy', 12)),
    (2, 'Vali', ('Samarqand', 'Registon', 5));

SELECT id, manzil, (manzil).shahar FROM mijozlar2 ORDER BY id;
SELECT manzil.shahar FROM mijozlar2;
```

```text
 id |         manzil         |  shahar   
----+------------------------+-----------
  1 | (Toshkent,Navoiy,12)   | Toshkent
  2 | (Samarqand,Registon,5) | Samarqand
(2 rows)

ERROR:  missing FROM-clause entry for table "manzil"
```

Qavssiz `manzil.shahar` — hujjatda aytilgan xato: `manzil` jadval deb o'qildi. Bitta maydonni yangilash va hamma maydonlarni ochish:

```sql
UPDATE mijozlar2 SET manzil.uy = 14 WHERE id = 1;   -- SET da qavs yozilmaydi
SELECT (manzil).* FROM mijozlar2 WHERE id = 1;
```

```text
  shahar  | kocha  | uy 
----------+--------+----
 Toshkent | Navoiy | 14
(1 row)
```

Composite ustun ichidagi maydonlarga cheklov va indeks qo'yish qiyinroq. Ko'p hollarda oddiy ustunlar (`shahar`, `kocha`, `uy`) yoki alohida `manzillar` jadvali soddaroq.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/36-3-dialektlar.jpg">
    <source src="/video/sql/36-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/36-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/36-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Dialektlar va muqobillar: MySQL (JSON massiv, 2 ustun), SQLite (text[] tuzog'i, affinity) va portativ relyatsion arxitektura</figcaption>
</figure>

### MySQL

**Massiv tipi yo'q:**

```text
ERROR 1064 (42000) at line 1: … near '[])' at line 1
```

O'rniga: alohida jadval (tavsiya) yoki JSON massiv (35-bob). JSON massivni `CHECK` bilan cheklash va `MEMBER OF` bilan qidirish mumkin:

```sql
CREATE TABLE a2 (id int, teglar JSON, CHECK (JSON_TYPE(teglar) = 'ARRAY'));
INSERT INTO a2 VALUES (1, '["sql","postgres"]');
SELECT id FROM a2 WHERE 'postgres' MEMBER OF (teglar);   -- 1
```

Indeks uchun — multi-valued indeks (35-bob).

**Domain yo'q:**

```text
ERROR 1064 (42000) at line 2: … near 'DOMAIN d1 AS int CHECK (VALUE > 0)' at line 1
```

O'rniga — har ustunda `CHECK` (14-bob); qoida takrorlanadi.

**Range tipi va exclusion constraint yo'q.** Oraliq ikki ustun (`boshi`, `oxiri`) bilan saqlanadi; "kesishmasin" qoidasi cheklov bilan ifodalanmaydi — tranzaksiya va qulf bilan tekshiriladi (53-bob, 55-bob). **Composite tip** (`CREATE TYPE`) ham yo'q.

### SQLite

SQLite'da ham massiv, range, domain, composite tiplari yo'q:

```text
Parse error near line 4: near "DOMAIN": syntax error
Parse error near line 5: near "TYPE": syntax error
```

**Diqqat — `text[]` xato bermaydi.** SQLite tip nomini erkin o'qiydi (affinity qoidalari, 10-bob): `CREATE TABLE a1 (teglar text[])` qabul qilindi, lekin bu oddiy matn ustuni:

```sql
INSERT INTO a1 VALUES ('{a,b}');
SELECT teglar, typeof(teglar) FROM a1;
```

```text
{a,b}|text
```

`teglar[1]`, `ANY`, `@>` ishlamaydi — bu shunchaki `'{a,b}'` satri. Massiv kerak bo'lsa — alohida jadval yoki JSON massiv (`json_each` bilan, 35-bob).

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Massiv | `tip[]`, `ANY`, `@>`, `&&`, `unnest` | Yo'q — JSON massiv | Yo'q — JSON massiv (`text[]` — oddiy matn!) |
| Range / multirange | Ha | Yo'q — ikki ustun | Yo'q — ikki ustun |
| "Kesishmasin" cheklovi | `EXCLUDE USING GIST` | Yo'q | Yo'q |
| Domain | `CREATE DOMAIN` | Yo'q — har ustunda `CHECK` | Yo'q — `CHECK` |
| Composite | `CREATE TYPE … AS (…)` | Yo'q | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Teglar, rollar, kategoriyalarni massivda saqlash, keyin ular bo'yicha qidirish | Hujjat: "noto'g'ri loyiha belgisi"; tashqi kalit, nom o'zgartirish, statistika qiyin | Alohida jadval (37-bob) |
| Massiv indeksini 0 dan boshlash | PostgreSQL massivlari 1 dan; `[0]` — `NULL` | `[1]` |
| `text[3]` o'lchamni cheklaydi deb o'ylash | O'lcham tekshirilmaydi | `CHECK (cardinality(x) <= 3)` |
| Oraliqni `[boshi, oxiri]` (ikkala chegara kiradi) qilib saqlash | Ketma-ket oraliqlar tutashgan joyda "kesishadi" | `[boshi, oxiri)` |
| "Kesishmasin" qoidasini faqat ilovada tekshirish | Parallel so'rovlarda ikkala bron ham o'tadi | `EXCLUDE USING GIST` (PG) |
| Domain'ga `NOT NULL` yozish | Hujjat: chetlab o'tilishi mumkin | `NOT NULL` ni ustunga |
| `domain - 1` natijasi ham domain deb o'ylash | Natija asosiy tipda, cheklov tekshirilmaydi | Kerak bo'lsa `::domain` |
| `manzil.shahar` (qavssiz) | `manzil` jadval deb o'qiladi | `(manzil).shahar` |
| SQLite'da `text[]` ustunni massiv deb o'ylash | Oddiy matn | JSON yoki alohida jadval |

## Amaliyot

1. `maqolalar` jadvalini massivsiz qayta loyihalang: `teglar` va `maqola_teglari` jadvallari. "Har teg bo'yicha maqolalar soni" so'rovini ikkala variantda yozing va solishtiring.
2. `baholar int[]` ustunidan har maqolaning o'rtacha bahosini hisoblang (`unnest` + `avg`).
3. `daterange` bilan mehmonxona bronlari jadvalini yarating: bir xonada sanalar kesishmasin. Chiqish kuni keyingi mehmonning kirish kuni bo'lishi mumkinligini tekshiring.
4. `email` domain'ini yarating (oddiy regex bilan) va uni ikki jadvalda ishlating. Keyin `ALTER DOMAIN` bilan qoidani o'zgartirib ko'ring.
5. Bron jadvalini MySQL uchun `boshi`/`oxiri` ustunlari bilan yozing. Kesishishni tekshiruvchi `SELECT` shartini yozing: `yangi_boshi < oxiri AND boshi < yangi_oxiri`.

## Rasmiy hujjat

- PostgreSQL — 8.15. Arrays: <https://www.postgresql.org/docs/18/arrays.html>
- PostgreSQL — 8.17. Range Types (Constraints on Ranges): <https://www.postgresql.org/docs/18/rangetypes.html>
- PostgreSQL — 8.18. Domain Types: <https://www.postgresql.org/docs/18/domains.html>
- PostgreSQL — CREATE DOMAIN (Notes): <https://www.postgresql.org/docs/18/sql-createdomain.html>
- PostgreSQL — 8.16. Composite Types: <https://www.postgresql.org/docs/18/rowtypes.html>
