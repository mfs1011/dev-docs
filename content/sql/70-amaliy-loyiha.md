# 70 — Amaliy loyiha

[← Oldingi: Dialektlar xaritasi](69-dialektlar-xaritasi.md) · [Mundarija](README.md)

## Tushuncha

Kitobning oxirgi bobi — kichik onlayn do'konning bazasi **noldan**: sxema, cheklovlar, sinov ma'lumotlari, hisobotlar, indekslar, xavfsiz buyurtma berish va production'dagi migratsiya. Yangi mavzu yo'q — faqat oldingi boblarda o'rganilganlar; har qadamda tegishli bob ko'rsatilgan.

| Qadam | Nima qilamiz | Boblar |
| --- | --- | --- |
| 1. Sxema | Jadvallar, kalitlar, cheklovlar | 12–14, 37–39 |
| 2. Ma'lumot | Sinov ma'lumotlarini SQL bilan yaratish | 18, 21, 25 |
| 3. Cheklovlarni tekshirish | Noto'g'ri ma'lumot kirmasligi | 14, 37 |
| 4. Hisobotlar | `JOIN`, `GROUP BY`, `NOT EXISTS`, window | 22–31 |
| 5. Indekslar | `EXPLAIN` bo'yicha qo'shish | 41–45 |
| 6. Buyurtma berish | Tranzaksiya, qulf, funksiya | 50–56 |
| 7. Migratsiya | Ishlab turgan bazani o'zgartirish | 63 |

Misollar PostgreSQL 18.6 da, alohida `dokon70` bazasida ishga tushirilgan. Boshqa bazaga ko'chirishda nimalar o'zgarishi — 69-bob.

## 1. Sxema

To'rt jadval: mijozlar, mahsulotlar, buyurtmalar va buyurtma qatorlari (M:N bog'lanish — 37-bob).

```sql
CREATE TABLE mijozlar (
    id         int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ism        text NOT NULL,
    email      text NOT NULL,
    yaratilgan timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX mijozlar_email ON mijozlar (lower(email));

CREATE TABLE mahsulotlar (
    id     int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom    text NOT NULL,
    narx   numeric(12,2) NOT NULL CHECK (narx > 0),
    qoldiq int NOT NULL CHECK (qoldiq >= 0)
);

CREATE TABLE buyurtmalar (
    id         int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mijoz_id   int NOT NULL REFERENCES mijozlar,
    holat      text NOT NULL DEFAULT 'yangi'
               CHECK (holat IN ('yangi', 'tolangan', 'yuborilgan', 'bekor')),
    yaratilgan timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE buyurtma_qatorlari (
    buyurtma_id int NOT NULL REFERENCES buyurtmalar ON DELETE CASCADE,
    mahsulot_id int NOT NULL REFERENCES mahsulotlar,
    soni        int NOT NULL CHECK (soni > 0),
    narx        numeric(12,2) NOT NULL,
    PRIMARY KEY (buyurtma_id, mahsulot_id)
);
```

Qarorlar:

- `GENERATED ALWAYS AS IDENTITY` — avtomatik ID (13-bob), ilova uni yozib yubora olmaydi.
- E-pochta yagonaligi — **registrga befarq**: `lower(email)` ga unique ifoda indeksi (43-, 47-boblar). `Aziza@…` va `aziza@…` — bitta mijoz.
- Pul — `numeric(12,2)` (6-bob: aniq kasr), `CHECK (narx > 0)`, qoldiq manfiy bo'lmaydi.
- Holat — `CHECK (holat IN (…))` (14-bob); enum tipi ham mumkin edi (9-bob).
- `buyurtma_qatorlari.narx` — buyurtma paytidagi narx **nusxasi**: mahsulot narxi keyin o'zgarsa ham, eski buyurtma summasi o'zgarmaydi (38-bob: bu ataylab qilingan takrorlash).
- `ON DELETE CASCADE` — buyurtma o'chirilsa, uning qatorlari ham (37-bob); mahsulotga esa `CASCADE` yo'q — sotilgan mahsulotni o'chirib bo'lmaydi.
- Kompozit birlamchi kalit `(buyurtma_id, mahsulot_id)` — bir buyurtmada bir mahsulot bir marta.

## 2. Sinov ma'lumotlari

`generate_series` va hisoblangan qiymatlar bilan — tasodifiy son yo'q, natija har safar bir xil:

```sql
INSERT INTO mijozlar (ism, email, yaratilgan)
SELECT 'Mijoz ' || g, 'mijoz' || g || '@misol.uz', timestamptz '2025-01-01' + (g % 365) * interval '1 day'
FROM generate_series(1, 10000) g;
INSERT INTO mahsulotlar (nom, narx, qoldiq)
SELECT 'Mahsulot ' || g, 1000 * (1 + g % 50), 100 + g % 400
FROM generate_series(1, 500) g;
INSERT INTO buyurtmalar (mijoz_id, holat, yaratilgan)
SELECT 1 + (g * 7919) % 8000,
       (ARRAY['yangi', 'tolangan', 'yuborilgan', 'bekor'])[1 + g % 4],
       timestamptz '2025-01-01' + (g % 300) * interval '1 day' + (g % 86400) * interval '1 second'
FROM generate_series(1, 50000) g;
INSERT INTO buyurtma_qatorlari (buyurtma_id, mahsulot_id, soni, narx)
SELECT b.id, m.id, 1 + (b.id + m.id) % 3, m.narx
FROM buyurtmalar b
CROSS JOIN LATERAL (SELECT id, narx FROM mahsulotlar WHERE id IN (1 + b.id % 500, 1 + (b.id * 3) % 500, 1 + (b.id * 7) % 500)) m;
ANALYZE;
SELECT (SELECT count(*) FROM mijozlar) AS mijozlar, (SELECT count(*) FROM mahsulotlar) AS mahsulotlar,
       (SELECT count(*) FROM buyurtmalar) AS buyurtmalar, (SELECT count(*) FROM buyurtma_qatorlari) AS qatorlar;
```

```text
mijozlar | mahsulotlar | buyurtmalar | qatorlar 
----------+-------------+-------------+----------
    10000 |         500 |       50000 |   149400
(1 row)
```

`CROSS JOIN LATERAL` (25-bob) — har buyurtmaga uchtagacha mahsulot (ba'zan ikki formula bir xil mahsulotni bergani uchun qatorlar 150 000 emas, 149 400).

## 3. Cheklovlar ishlayaptimi

```sql
INSERT INTO mijozlar (ism, email) VALUES ('Takror', 'MIJOZ1@misol.uz');
INSERT INTO mahsulotlar (nom, narx, qoldiq) VALUES ('Bepul', 0, 1);
INSERT INTO buyurtmalar (mijoz_id) VALUES (99999);
UPDATE buyurtmalar SET holat = 'yetkazildi' WHERE id = 1;
```

```text
psql:3-tekshiruv.sql:2: ERROR:  duplicate key value violates unique constraint "mijozlar_email"
DETAIL:  Key (lower(email))=(mijoz1@misol.uz) already exists.
psql:3-tekshiruv.sql:3: ERROR:  new row for relation "mahsulotlar" violates check constraint "mahsulotlar_narx_check"
DETAIL:  Failing row contains (501, Bepul, 0.00, 1).
psql:3-tekshiruv.sql:4: ERROR:  insert or update on table "buyurtmalar" violates foreign key constraint "buyurtmalar_mijoz_id_fkey"
DETAIL:  Key (mijoz_id)=(99999) is not present in table "mijozlar".
psql:3-tekshiruv.sql:5: ERROR:  new row for relation "buyurtmalar" violates check constraint "buyurtmalar_holat_check"
DETAIL:  Failing row contains (1, 7920, yetkazildi, 2025-01-02 00:00:01+05).
```

To'rt noto'g'ri yozuv — to'rt xato, har biri aniq sababi bilan: takror e-pochta (katta harflar bilan yozilgan bo'lsa ham), bepul mahsulot, mavjud bo'lmagan mijoz, ro'yxatda yo'q holat. Bu himoya ilovaning qaysi qismi yozishidan qat'i nazar ishlaydi.

## 4. Hisobotlar

### Eng ko'p tushum keltirgan mahsulotlar

```sql
SELECT m.nom, sum(q.soni * q.narx) AS tushum, sum(q.soni) AS dona
FROM buyurtma_qatorlari q
JOIN buyurtmalar b ON b.id = q.buyurtma_id
JOIN mahsulotlar m ON m.id = q.mahsulot_id
WHERE b.holat IN ('tolangan', 'yuborilgan')
GROUP BY m.id, m.nom
ORDER BY tushum DESC, m.nom
LIMIT 5;
\echo === 2
SELECT date_trunc('month', b.yaratilgan)::date AS oy,
       count(DISTINCT b.id) AS buyurtmalar,
       sum(q.soni * q.narx) AS tushum
FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
WHERE b.holat <> 'bekor' AND b.yaratilgan < '2025-04-01'
GROUP BY 1 ORDER BY 1;
\echo === 3
SELECT count(*) AS buyurtmasiz
FROM mijozlar m
WHERE NOT EXISTS (SELECT 1 FROM buyurtmalar b WHERE b.mijoz_id = m.id);
\echo === 4
WITH mijoz_xarajati AS (
    SELECT b.mijoz_id, sum(q.soni * q.narx) AS jami
    FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
    WHERE b.holat <> 'bekor'
    GROUP BY b.mijoz_id
)
SELECT mijoz_id, jami, ntile(4) OVER (ORDER BY jami DESC, mijoz_id) AS chorak
FROM mijoz_xarajati
ORDER BY jami DESC, mijoz_id
LIMIT 5;
```

```text
     nom      |   tushum    | dona 
--------------+-------------+------
 Mahsulot 499 | 30100000.00 |  602
 Mahsulot 99  | 30050000.00 |  601
 Mahsulot 299 | 30000000.00 |  600
 Mahsulot 399 | 30000000.00 |  600
 Mahsulot 199 | 29950000.00 |  599
(5 rows)
```

Faqat to'langan va yuborilgan buyurtmalar. `ORDER BY tushum DESC, m.nom` — ikkinchi kalit: 299 va 399 ning tushumi teng, tartib aniq bo'lishi kerak (48-bob).

### Oylik tushum

```sql
SELECT date_trunc('month', b.yaratilgan)::date AS oy,
       count(DISTINCT b.id) AS buyurtmalar,
       sum(q.soni * q.narx) AS tushum
FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
WHERE b.holat <> 'bekor' AND b.yaratilgan < '2025-04-01'
GROUP BY 1 ORDER BY 1;
\echo === 3
SELECT count(*) AS buyurtmasiz
FROM mijozlar m
WHERE NOT EXISTS (SELECT 1 FROM buyurtmalar b WHERE b.mijoz_id = m.id);
\echo === 4
WITH mijoz_xarajati AS (
    SELECT b.mijoz_id, sum(q.soni * q.narx) AS jami
    FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
    WHERE b.holat <> 'bekor'
    GROUP BY b.mijoz_id
)
SELECT mijoz_id, jami, ntile(4) OVER (ORDER BY jami DESC, mijoz_id) AS chorak
FROM mijoz_xarajati
ORDER BY jami DESC, mijoz_id
LIMIT 5;
```

```text
     oy     | buyurtmalar |    tushum    
------------+-------------+--------------
 2025-01-01 |        4007 | 532333000.00
 2025-02-01 |        3507 | 524635000.00
 2025-03-01 |        3841 | 616796000.00
(3 rows)
```

`count(DISTINCT b.id)` — `JOIN` buyurtmani qatorlari soniga ko'paytirgani uchun (26-bob). Shart sana ustunida yalang'och — oraliq bilan (47-bob).

### Hech narsa buyurtma qilmagan mijozlar

```sql
SELECT count(*) AS buyurtmasiz
FROM mijozlar m
WHERE NOT EXISTS (SELECT 1 FROM buyurtmalar b WHERE b.mijoz_id = m.id);
\echo === 4
WITH mijoz_xarajati AS (
    SELECT b.mijoz_id, sum(q.soni * q.narx) AS jami
    FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
    WHERE b.holat <> 'bekor'
    GROUP BY b.mijoz_id
)
SELECT mijoz_id, jami, ntile(4) OVER (ORDER BY jami DESC, mijoz_id) AS chorak
FROM mijoz_xarajati
ORDER BY jami DESC, mijoz_id
LIMIT 5;
```

```text
 buyurtmasiz 
-------------
        2000
(1 row)
```

`NOT EXISTS` — `NOT IN` ning `NULL` tuzog'isiz (27-bob).

### Eng ko'p xarajat qilgan mijozlar va choraklar

```sql
WITH mijoz_xarajati AS (
    SELECT b.mijoz_id, sum(q.soni * q.narx) AS jami
    FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
    WHERE b.holat <> 'bekor'
    GROUP BY b.mijoz_id
)
SELECT mijoz_id, jami, ntile(4) OVER (ORDER BY jami DESC, mijoz_id) AS chorak
FROM mijoz_xarajati
ORDER BY jami DESC, mijoz_id
LIMIT 5;
```

```text
 mijoz_id |    jami    | chorak 
----------+------------+--------
     3113 | 2010000.00 |      1
     6263 | 1972000.00 |      1
     7763 | 1972000.00 |      1
     2413 | 1964000.00 |      1
     3913 | 1964000.00 |      1
(5 rows)
```

CTE (29-bob) va `ntile` (31-bob). `ORDER BY jami DESC, mijoz_id` — 6263 va 7763 ning summasi teng; ikkinchi kalitsiz ularning tartibi har safar boshqacha bo'lishi mumkin edi (sinovda dastlab shunday bo'ldi).

## 5. Indekslar

PostgreSQL tashqi kalit ustuniga indeksni o'zi yaratmaydi (37-bob). Ilovaning ikki tipik so'rovi — mijozning oxirgi buyurtmalari va mahsulot bo'yicha sotuv:

```text
                                             QUERY PLAN                                              
-----------------------------------------------------------------------------------------------------
 Limit  (cost=970.08..970.09 rows=6 width=19) (actual rows=7.00 loops=1)
   ->  Sort  (cost=970.08..970.09 rows=6 width=19) (actual rows=7.00 loops=1)
         Sort Key: yaratilgan DESC
         Sort Method: quicksort  Memory: 25kB
         ->  Seq Scan on buyurtmalar  (cost=0.00..970.00 rows=6 width=19) (actual rows=7.00 loops=1)
               Filter: (mijoz_id = 3113)
               Rows Removed by Filter: 49993
 Planning Time: 0.148 ms
 Execution Time: 1.382 ms
(9 rows)

                                                QUERY PLAN                                                
----------------------------------------------------------------------------------------------------------
 Aggregate  (cost=2820.24..2820.26 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Seq Scan on buyurtma_qatorlari  (cost=0.00..2819.50 rows=298 width=4) (actual rows=300.00 loops=1)
         Filter: (mahsulot_id = 99)
         Rows Removed by Filter: 149100
 Planning Time: 0.069 ms
 Execution Time: 4.205 ms
(6 rows)
```

Ikkalasi ham `Seq Scan`: 49 993 va 149 100 qator filtrda tashlandi. Indekslar (42-bob: chap ustun — tenglik, keyin — saralash ustuni):

```sql
CREATE INDEX buyurtmalar_mijoz ON buyurtmalar (mijoz_id, yaratilgan);
CREATE INDEX qatorlar_mahsulot ON buyurtma_qatorlari (mahsulot_id);
```

```text
                                                      QUERY PLAN                                                       
-----------------------------------------------------------------------------------------------------------------------
 Limit  (cost=26.12..26.13 rows=6 width=19) (actual rows=7.00 loops=1)
   ->  Sort  (cost=26.12..26.13 rows=6 width=19) (actual rows=7.00 loops=1)
         Sort Key: yaratilgan DESC
         Sort Method: quicksort  Memory: 25kB
         ->  Bitmap Heap Scan on buyurtmalar  (cost=4.34..26.04 rows=6 width=19) (actual rows=7.00 loops=1)
               Recheck Cond: (mijoz_id = 3113)
               Heap Blocks: exact=7
               ->  Bitmap Index Scan on buyurtmalar_mijoz  (cost=0.00..4.33 rows=6 width=0) (actual rows=7.00 loops=1)
                     Index Cond: (mijoz_id = 3113)
                     Index Searches: 1
 Planning Time: 0.124 ms
 Execution Time: 0.036 ms
(12 rows)

                                                     QUERY PLAN                                                      
---------------------------------------------------------------------------------------------------------------------
 Aggregate  (cost=640.14..640.15 rows=1 width=8) (actual rows=1.00 loops=1)
   ->  Bitmap Heap Scan on buyurtma_qatorlari  (cost=6.60..639.40 rows=298 width=4) (actual rows=300.00 loops=1)
         Recheck Cond: (mahsulot_id = 99)
         Heap Blocks: exact=300
         ->  Bitmap Index Scan on qatorlar_mahsulot  (cost=0.00..6.53 rows=298 width=0) (actual rows=300.00 loops=1)
               Index Cond: (mahsulot_id = 99)
               Index Searches: 1
 Planning Time: 0.055 ms
 Execution Time: 0.166 ms
(9 rows)
```

**1.38 ms → 0.036 ms** va **4.2 ms → 0.17 ms**. `qatorlar_mahsulot` yana bir ishni qiladi: mahsulotni o'chirishga urinishda tashqi kalit tekshiruvi butun jadvalni o'qimaydi (37-bob). Jadvalning yakuniy ko'rinishi:

```text
              Table "public.buyurtma_qatorlari"
   Column    |     Type      | Collation | Nullable | Default 
-------------+---------------+-----------+----------+---------
 buyurtma_id | integer       |           | not null | 
 mahsulot_id | integer       |           | not null | 
 soni        | integer       |           | not null | 
 narx        | numeric(12,2) |           | not null | 
Indexes:
    "buyurtma_qatorlari_pkey" PRIMARY KEY, btree (buyurtma_id, mahsulot_id)
    "qatorlar_mahsulot" btree (mahsulot_id)
Check constraints:
    "buyurtma_qatorlari_soni_check" CHECK (soni > 0)
Foreign-key constraints:
    "buyurtma_qatorlari_buyurtma_id_fkey" FOREIGN KEY (buyurtma_id) REFERENCES buyurtmalar(id) ON DELETE CASCADE
    "buyurtma_qatorlari_mahsulot_id_fkey" FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
```

## 6. Buyurtma berish

Qoldiq tekshiruvi va kamaytirish — bitta funksiyada (56-bob), mahsulot qatori qulflangan holda (53-bob, `FOR NO KEY UPDATE` — buyurtma qatorlarining tashqi kalit tekshiruvini bloklamaydi):

```sql
CREATE FUNCTION buyurtma_ber(p_mijoz int, p_mahsulot int, p_soni int) RETURNS int
LANGUAGE plpgsql AS $$
DECLARE
    v_narx   numeric(12,2);
    v_qoldiq int;
    v_id     int;
BEGIN
    SELECT narx, qoldiq INTO v_narx, v_qoldiq
    FROM mahsulotlar WHERE id = p_mahsulot
    FOR NO KEY UPDATE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'mahsulot topilmadi: %', p_mahsulot;
    END IF;
    IF v_qoldiq < p_soni THEN
        RAISE EXCEPTION 'qoldiq yetarli emas: % dona bor, % so''raldi', v_qoldiq, p_soni;
    END IF;
    UPDATE mahsulotlar SET qoldiq = qoldiq - p_soni WHERE id = p_mahsulot;
    INSERT INTO buyurtmalar (mijoz_id) VALUES (p_mijoz) RETURNING id INTO v_id;
    INSERT INTO buyurtma_qatorlari (buyurtma_id, mahsulot_id, soni, narx)
    VALUES (v_id, p_mahsulot, p_soni, v_narx);
    RETURN v_id;
END $$;
```

Oxirgi 3 donaga ikki xaridor bir vaqtda 2 tadan buyurtma beradi (`qoldiq = 3`; ikki seans — 51-bobdagi skript):

```text
A> BEGIN;
   BEGIN
A> SELECT buyurtma_ber(10, 1, 2);
    buyurtma_ber 
   --------------
           50002
   (1 row)
B> BEGIN;
   BEGIN
B> SELECT buyurtma_ber(20, 1, 2);
A> COMMIT;
   COMMIT
B> ROLLBACK;
   ERROR:  qoldiq yetarli emas: 1 dona bor, 2 so'raldi
   CONTEXT:  PL/pgSQL function buyurtma_ber(integer,integer,integer) line 14 at RAISE
   ROLLBACK
A> SELECT id, qoldiq FROM mahsulotlar WHERE id = 1;
    id | qoldiq 
   ----+--------
     1 |      1
   (1 row)
```

- A qatorni qulfladi va buyurtma berdi. B'ning funksiyasi qulfni **kutdi**.
- A commit qilgach, B qatorning **yangi** versiyasini o'qidi (1 dona) va aniq xabar bilan rad etildi: `qoldiq yetarli emas: 1 dona bor, 2 so'raldi`.
- Buyurtma ID 50002 — 3-qadamdagi muvaffaqiyatsiz `INSERT` ham sequence qiymatini sarflagan (13-bob: sequence `ROLLBACK` qilinmaydi).

Taqqoslash uchun — xuddi shu funksiya `FOR NO KEY UPDATE` **siz** (`buyurtma_ber_qulfsiz`, 2-mahsulot, qoldiq 3):

```text
A> BEGIN;
   BEGIN
A> SELECT buyurtma_ber_qulfsiz(10, 2, 2);
    buyurtma_ber_qulfsiz 
   ----------------------
                   50003
   (1 row)
B> BEGIN;
   BEGIN
B> SELECT buyurtma_ber_qulfsiz(20, 2, 2);
A> COMMIT;
   COMMIT
B> ROLLBACK;
   ERROR:  new row for relation "mahsulotlar" violates check constraint "mahsulotlar_qoldiq_check"
   DETAIL:  Failing row contains (2, Mahsulot 2, 3000.00, -1).
   CONTEXT:  SQL statement "UPDATE mahsulotlar SET qoldiq = qoldiq - p_soni WHERE id = p_mahsulot"
   PL/pgSQL function buyurtma_ber_qulfsiz(integer,integer,integer) line 15 at SQL statement
   ROLLBACK
A> SELECT id, qoldiq FROM mahsulotlar WHERE id = 2;
    id | qoldiq 
   ----+--------
     2 |      1
   (1 row)
```

B eski qoldiqni (3) o'qib, funksiyaning o'z tekshiruvidan **o'tdi**; keyin `UPDATE` A'ni kutdi va yangi qiymatdan 2 ni ayirdi — `-1`. Uni faqat jadvaldagi `CHECK (qoldiq >= 0)` to'xtatdi. Natija to'g'ri, lekin ilova tushunarsiz cheklov xatosini oldi. Ikki qatlamli himoya: qulf — to'g'ri mantiq va aniq xabar uchun, `CHECK` — oxirgi chegara.

## 7. Migratsiya

Do'kon ishlab turibdi; chegirma ustuni va yangi buyurtmalar uchun indeks kerak. 63-bobdagi qoidalar bilan:

```sql
SET lock_timeout = '2s';
ALTER TABLE buyurtmalar ADD COLUMN chegirma numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE buyurtmalar ADD CONSTRAINT chegirma_oraligi CHECK (chegirma BETWEEN 0 AND 100) NOT VALID;
ALTER TABLE buyurtmalar VALIDATE CONSTRAINT chegirma_oraligi;
CREATE INDEX CONCURRENTLY buyurtmalar_yangi ON buyurtmalar (yaratilgan) WHERE holat = 'yangi';
UPDATE buyurtmalar SET chegirma = 150 WHERE id = 1;
EXPLAIN (COSTS OFF) SELECT id FROM buyurtmalar WHERE holat = 'yangi' AND yaratilgan >= '2025-10-01';
SELECT indexrelid::regclass AS indeks, indisvalid FROM pg_index WHERE indrelid = 'buyurtmalar'::regclass ORDER BY 1;
```

```text
SET lock_timeout = '2s';
SET
ALTER TABLE buyurtmalar ADD COLUMN chegirma numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE
ALTER TABLE buyurtmalar ADD CONSTRAINT chegirma_oraligi CHECK (chegirma BETWEEN 0 AND 100) NOT VALID;
ALTER TABLE
ALTER TABLE buyurtmalar VALIDATE CONSTRAINT chegirma_oraligi;
ALTER TABLE
CREATE INDEX CONCURRENTLY buyurtmalar_yangi ON buyurtmalar (yaratilgan) WHERE holat = 'yangi';
CREATE INDEX
UPDATE buyurtmalar SET chegirma = 150 WHERE id = 1;
psql:7-migratsiya.sql:6: ERROR:  new row for relation "buyurtmalar" violates check constraint "chegirma_oraligi"
DETAIL:  Failing row contains (1, 7920, tolangan, 2025-01-02 00:00:01+05, 150.00).
EXPLAIN (COSTS OFF) SELECT id FROM buyurtmalar WHERE holat = 'yangi' AND yaratilgan >= '2025-10-01';
                                                    QUERY PLAN                                                    
------------------------------------------------------------------------------------------------------------------
 Bitmap Heap Scan on buyurtmalar
   Recheck Cond: ((yaratilgan >= '2025-10-01 00:00:00+05'::timestamp with time zone) AND (holat = 'yangi'::text))
   ->  Bitmap Index Scan on buyurtmalar_yangi
         Index Cond: (yaratilgan >= '2025-10-01 00:00:00+05'::timestamp with time zone)
(4 rows)

SELECT indexrelid::regclass AS indeks, indisvalid FROM pg_index WHERE indrelid = 'buyurtmalar'::regclass ORDER BY 1;
      indeks       | indisvalid 
-------------------+------------
 buyurtmalar_pkey  | t
 buyurtmalar_mijoz | t
 buyurtmalar_yangi | t
(3 rows)
```

- `lock_timeout` — qulfni 2 soniyada ololmasa, migratsiya xato bilan chiqadi, sayt to'xtamaydi.
- `ADD COLUMN … DEFAULT 0` — o'zgarmas default: jadval qayta yozilmaydi.
- `CHECK … NOT VALID` + `VALIDATE` — yangilashlarni bloklamasdan; cheklov darhol ishlay boshladi (`chegirma = 150` rad etildi).
- `CREATE INDEX CONCURRENTLY` — **qisman** indeks (43-bob): faqat `holat = 'yangi'` qatorlar; so'rov uni ishlatdi, indeks `indisvalid = t`.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Cheklovlarni faqat ilovada tekshirish | Boshqa skript yoki xato kod noto'g'ri ma'lumot yozadi | `NOT NULL`, `CHECK`, `UNIQUE`, FK — bazada (3-qadam) |
| E-pochtani oddiy `UNIQUE` bilan | `Aziza@` va `aziza@` — ikki mijoz | `lower(email)` ga unique indeks |
| Buyurtmada mahsulotning joriy narxiga tayanish | Narx o'zgarsa, eski hisobotlar o'zgaradi | Buyurtma paytidagi narx nusxasi |
| FK ustunlariga indekssiz | Bog'liq so'rovlar va o'chirish — butun jadval (5-qadam) | Indeks |
| Qoldiqni qulfsiz tekshirish | Raqobatda eski qiymat (6-qadam) | `FOR [NO KEY] UPDATE` yoki atomar `UPDATE … WHERE qoldiq >= n` |
| Hisobotda teng qiymatlar uchun ikkinchi kalitsiz `ORDER BY` | Tartib har safar boshqacha (4-qadam) | Yagona ustun qo'shish |
| Production'da oddiy `ALTER`/`CREATE INDEX` | Qulf va to'xtash (63-bob) | `lock_timeout`, `NOT VALID`, `CONCURRENTLY` |

## Amaliyot

1. `buyurtma_ber` ni bir nechta mahsulotli buyurtma uchun kengaytiring (`p_mahsulotlar int[]`, `p_sonlar int[]`). Deadlock'dan qochish uchun mahsulotlarni qaysi tartibda qulflaysiz (54-bob)?
2. `buyurtma_ber` ga atomar variant yozing: `UPDATE mahsulotlar SET qoldiq = qoldiq - p_soni WHERE id = p_mahsulot AND qoldiq >= p_soni` va `FOUND` ni tekshirish. Raqobat sinovida natija qanday?
3. `buyurtmalar` ni `yaratilgan` bo'yicha oylik bo'laklarga ajratilgan qilib qayta loyihalang (58-bob). Birlamchi kalit qanday o'zgaradi?
4. Mijoz sahifasi uchun keyset sahifalashni yozing: `(yaratilgan, id) < (?, ?)` (48-bob) va `buyurtmalar_mijoz` indeksini moslang.
5. Butun sxema va so'rovlarni SQLite'ga ko'chiring. 69-bobdagi xaritadan foydalanib, nimalarni o'zgartirishga to'g'ri keldi (`IDENTITY`, `numeric`, `FOR UPDATE`, funksiya)?

## Rasmiy hujjat

Bu bobda yangi manba yo'q — har qadam oldingi boblarning rasmiy hujjatiga tayanadi:

- Sxema va cheklovlar — 12–14, 37–39-boblar
- So'rovlar — 22–31-boblar
- Indekslar va reja — 41–45-boblar
- Tranzaksiya va qulflar — 50–56-boblar
- Migratsiya — 63-bob
- PostgreSQL 18 hujjati: <https://www.postgresql.org/docs/18/>
