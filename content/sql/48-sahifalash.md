# 48 — Sahifalash

[← Oldingi: Sekin so'rovlar](47-sekin-sorovlar.md) · [Mundarija](README.md) · [Keyingi: To'liq matnli qidiruv →](49-toliq-matnli-qidiruv.md)

## Tushuncha

**Sahifalash** (pagination) — katta natijani bo'laklab ko'rsatish: 1-sahifa — birinchi 20 ta, 2-sahifa — keyingi 20 ta va hokazo. Ikki usul bor:

| Usul | So'rov | Keyingi sahifa uchun eslab qolinadi |
| --- | --- | --- |
| `OFFSET` | `ORDER BY … LIMIT 20 OFFSET 40` | Sahifa raqami |
| Keyset (kalit bo'yicha) | `WHERE (sana, id) > (?, ?) ORDER BY … LIMIT 20` | Oldingi sahifaning **oxirgi qatori** |

### `OFFSET` nega sekin

PostgreSQL hujjati (7.6. LIMIT and OFFSET): `OFFSET` o'tkazib yuborgan qatorlar ham **server ichida hisoblanishi kerak** — shuning uchun katta `OFFSET` samarasiz bo'lishi mumkin. SQLite hujjati (Row Values, 3.1) buni aniqroq aytadi: `LIMIT x OFFSET y` aslida `LIMIT x+y` sifatida hisoblanadi va birinchi `y` qator tashlab yuboriladi — vaqt `OFFSET` qiymatiga **proporsional**. Ro'yxat oxiriga qarab har sahifa sekinroq.

### Tartib aniq bo'lishi kerak

PostgreSQL hujjati: `LIMIT` bilan doim natijani **yagona tartibga** keltiradigan `ORDER BY` ishlating — aks holda qatorlarning oldindan aytib bo'lmaydigan qismi qaytadi. Rejalashtiruvchi `LIMIT` ni hisobga oladi, shuning uchun turli `LIMIT`/`OFFSET` qiymatlari turli rejalarni (va turli tartibni) berishi mumkin. Bu xato emas — SQL `ORDER BY` siz hech qanday tartibni va'da qilmaydi.

MySQL hujjati (LIMIT Query Optimization): `ORDER BY` ustunlarida bir xil qiymatli qatorlar bo'lsa, server ularni **istalgan tartibda** qaytarishi mumkin va bu reja bo'yicha farq qilishi mumkin.

Demak, `ORDER BY sana` yetarli emas, agar bir vaqtda bir nechta buyurtma bo'lsa. Yagona ustun qo'shiladi: `ORDER BY sana, id`.

### Keyset sahifalash va qator konstruktori

SQLite hujjatidagi yondashuv: oxirgi ko'rsatilgan qatorni eslab qolib, `WHERE` da **qator qiymatini** (row value) solishtirish:

```sql
SELECT * FROM contacts
 WHERE (lastname,firstname) > (?1,?2)
 ORDER BY lastname, firstname
 LIMIT 7;
```

Hujjat: mos indeks bo'lsa, bu `OFFSET` dan ancha samarali.

`(a, b) > (x, y)` — **qator konstruktori** (row constructor) bilan taqqoslash. PostgreSQL hujjati (9.25. Row and Array Comparisons): `<`, `<=`, `>`, `>=` uchun elementlar **chapdan o'ngga** solishtiriladi va birinchi teng bo'lmagan juftlikda to'xtaydi. Ya'ni `(sana, id) > (x, y)` ma'nosi:

```sql
sana > x OR (sana = x AND id > y)
```

— lug'atdagi tartib (lexicographic order). Bu `ORDER BY sana, id` bilan aynan bir xil tartib: keyingi sahifa — oxirgi qatordan keyin keladigan qatorlar.

Keyset'ning cheklovi: "15-sahifaga o'tish" bo'lmaydi — faqat keyingi/oldingi. Cheksiz lenta, "Yana yuklash" tugmasi, API'dagi kursor uchun bu odatda yetarli.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

1 000 000 buyurtma; `sana` — har daqiqaga **3 ta** buyurtma (takror qiymatlar ataylab), indeks `(sana, id)`:

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, sana timestamp NOT NULL, summa int NOT NULL);
INSERT INTO buyurtmalar
SELECT g, timestamp '2025-01-01' + (g / 3) * interval '1 minute', g % 1000
FROM generate_series(1, 1000000) g;
CREATE INDEX b_sana_id ON buyurtmalar (sana, id);
VACUUM ANALYZE buyurtmalar;
```

### `OFFSET 0` va `OFFSET 900000`

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 20 OFFSET 0;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 20 OFFSET 900000;
```

```text
 Limit  (cost=0.42..1.03 rows=20 width=12) (actual rows=20.00 loops=1)
   ->  Index Only Scan using b_sana_id on buyurtmalar  (cost=0.42..30412.42 rows=1000000 width=12) (actual rows=20.00 loops=1)
         Heap Fetches: 0
         Index Searches: 1
 Planning Time: 0.077 ms
 Execution Time: 0.029 ms

 Limit  (cost=27371.22..27371.83 rows=20 width=12) (actual rows=20.00 loops=1)
   ->  Index Only Scan using b_sana_id on buyurtmalar  (cost=0.42..30412.42 rows=1000000 width=12) (actual rows=900020.00 loops=1)
         Heap Fetches: 0
         Index Searches: 1
 Planning Time: 0.009 ms
 Execution Time: 36.260 ms
```

Ikkalasi ham 20 qator qaytardi, lekin ikkinchisida indeksdan **900 020** yozuv o'qildi (`actual rows=900020.00`) — hujjatdagi "o'tkazib yuborilgan qatorlar ham hisoblanadi". **0.029 ms → 36 ms**, 1000 baravardan ko'p.

### Keyset

900 000-o'rindagi qator — oldingi sahifaning oxirgisi:

```sql
SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 3 OFFSET 899997;
```

```text
   id   |        sana         
--------+---------------------
 899998 | 2025-07-28 07:59:00
 899999 | 2025-07-28 07:59:00
 900000 | 2025-07-28 08:00:00
```

Ilova `(2025-07-28 08:00:00, 900000)` ni eslab qoladi va keyingi sahifani so'raydi:

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id, sana FROM buyurtmalar
WHERE (sana, id) > (timestamp '2025-07-28 08:00:00', 900000) ORDER BY sana, id LIMIT 20;
SELECT id, sana FROM buyurtmalar
WHERE (sana, id) > (timestamp '2025-07-28 08:00:00', 900000) ORDER BY sana, id LIMIT 3;
```

```text
 Limit  (cost=0.42..1.08 rows=20 width=12) (actual rows=20.00 loops=1)
   ->  Index Only Scan using b_sana_id on buyurtmalar  (cost=0.42..3304.55 rows=100350 width=12) (actual rows=20.00 loops=1)
         Index Cond: (ROW(sana, id) > ROW('2025-07-28 08:00:00'::timestamp without time zone, 900000))
         Heap Fetches: 0
         Index Searches: 1
 Planning Time: 0.029 ms
 Execution Time: 0.020 ms

   id   |        sana         
--------+---------------------
 900001 | 2025-07-28 08:00:00
 900002 | 2025-07-28 08:00:00
 900003 | 2025-07-28 08:01:00
```

- `Index Cond: (ROW(sana, id) > ROW(…))` — indeks to'g'ridan-to'g'ri kerakli joydan boshladi, **20 yozuv** o'qildi, **0.020 ms** — xuddi 1-sahifadek.
- `900001` va `900002` — `900000` bilan **bir xil** `sana` (`08:00:00`), lekin `id` katta: tartibda keyin keladi. Faqat `sana > …` yozilganda ular tushib qolardi; `sana >= …` bo'lsa — `900000` qayta chiqardi. Ikkinchi ustun aynan shuning uchun.

### Bir xil shart, boshqa yozuv: `OR`

Qator konstruktori ma'nosi bo'yicha `sana > x OR (sana = x AND id > y)`. Shunday yozsak:

```sql
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF)
SELECT id, sana FROM buyurtmalar
WHERE sana > timestamp '2025-07-28 08:00:00'
   OR (sana = timestamp '2025-07-28 08:00:00' AND id > 900000)
ORDER BY sana, id LIMIT 20;
```

```text
 Limit  (cost=0.42..7.98 rows=20 width=12) (actual rows=20.00 loops=1)
   ->  Index Only Scan using b_sana_id on buyurtmalar  (cost=0.42..37912.43 rows=100351 width=12) (actual rows=20.00 loops=1)
         Filter: ((sana > '2025-07-28 08:00:00'::timestamp without time zone) OR ((sana = '2025-07-28 08:00:00'::timestamp without time zone) AND (id > 900000)))
         Rows Removed by Filter: 900000
         Heap Fetches: 0
         Index Searches: 1
 Planning Time: 0.019 ms
 Execution Time: 29.192 ms
```

Natija bir xil, lekin PostgreSQL bu shartni **`Index Cond` emas, `Filter`** qildi: indeks boshidan o'qildi, 900 000 yozuv filtrda tashlandi — **29 ms**, `OFFSET` darajasida. PostgreSQL'da keyset uchun qator konstruktori yozuvi — to'g'ri tanlov. (MySQL'da — aksincha, pastda.)

### `OFFSET` va o'zgarayotgan ma'lumot

Eng yangi buyurtmalar, sahifada 3 ta. 1-sahifani ko'rsatdik, foydalanuvchi o'qiyotganda **yangi buyurtma** qo'shildi, keyin 2-sahifa:

```sql
SELECT id, sana FROM buyurtmalar ORDER BY sana DESC, id DESC LIMIT 3;
INSERT INTO buyurtmalar VALUES (1000001, timestamp '2027-01-01', 5);
SELECT id, sana FROM buyurtmalar ORDER BY sana DESC, id DESC LIMIT 3 OFFSET 3;
SELECT id, sana FROM buyurtmalar
WHERE (sana, id) < (timestamp '2025-08-20 11:32:00', 999998) ORDER BY sana DESC, id DESC LIMIT 3;
```

```text
   id    |        sana         
---------+---------------------
 1000000 | 2025-08-20 11:33:00
  999999 | 2025-08-20 11:33:00
  999998 | 2025-08-20 11:32:00

   id   |        sana         
--------+---------------------
 999998 | 2025-08-20 11:32:00
 999997 | 2025-08-20 11:32:00
 999996 | 2025-08-20 11:32:00

   id   |        sana         
--------+---------------------
 999997 | 2025-08-20 11:32:00
 999996 | 2025-08-20 11:32:00
 999995 | 2025-08-20 11:31:00
```

- `OFFSET 3` bilan 2-sahifa **`999998` dan** boshlandi — u 1-sahifada allaqachon bor edi. Yangi qator hamma narsani bitta o'ringa surdi; foydalanuvchi bir buyurtmani ikki marta ko'radi (o'chirilganda esa — bittasini umuman ko'rmaydi).
- Keyset (`<`, chunki tartib `DESC`) — `999997` dan, to'g'ri davom: u **o'rin** emas, **qiymat** bo'yicha ishlaydi.

## Dialektlar

### MySQL

Bir xil jadval (`datetime`), indeks `(sana, id)`:

```sql
EXPLAIN ANALYZE SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 20 OFFSET 0;
EXPLAIN ANALYZE SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 20 OFFSET 900000;
```

```text
-> Limit: 20 row(s)  (cost=0.0105 rows=20) (actual time=0.0186..0.0205 rows=20 loops=1)
    -> Covering index scan on buyurtmalar using b_sana_id  (cost=0.0105 rows=20) (actual time=0.00975..0.0108 rows=20 loops=1)

-> Limit/Offset: 20/900000 row(s)  (cost=81618 rows=20) (actual time=73.2..73.2 rows=20 loops=1)
    -> Covering index scan on buyurtmalar using b_sana_id  (cost=81618 rows=900020) (actual time=0.384..56.5 rows=900020 loops=1)
```

Xuddi PostgreSQL'dagidek: 900 020 yozuv, **73 ms**.

**Qator konstruktori MySQL'da indeksni ishlatmadi:**

```sql
EXPLAIN ANALYZE SELECT id, sana FROM buyurtmalar
WHERE (sana, id) > ('2025-07-28 08:00:00', 900000) ORDER BY sana, id LIMIT 20;
EXPLAIN FORMAT=TRADITIONAL SELECT id, sana FROM buyurtmalar
WHERE (sana, id) > ('2025-07-28 08:00:00', 900000) ORDER BY sana, id LIMIT 20;
```

```text
-> Limit: 20 row(s)  (cost=0.0105 rows=20) (actual time=90.2..90.2 rows=20 loops=1)
    -> Filter: ((buyurtmalar.sana,buyurtmalar.id) > ('2025-07-28 08:00:00',900000))  (cost=0.0105 rows=20) (actual time=90.2..90.2 rows=20 loops=1)
        -> Covering index scan on buyurtmalar using b_sana_id  (cost=0.0105 rows=20) (actual time=0.00817..56.2 rows=900020 loops=1)

| type  | possible_keys | key       | key_len | … | rows | Extra                    |
| index | NULL          | b_sana_id | 9       | … |   20 | Using where; Using index |
```

`possible_keys = NULL` — shart indeks qidiruvi uchun ishlatilmadi; indeks boshidan o'qildi va **filtrlandi**: 900 020 yozuv, **90 ms** — `OFFSET` dan ham sekin.

MySQL hujjati (Row Constructor Expression Optimization): qator konstruktori ustunlari indeks prefiksini qamramasa, optimizator indeksdan kamroq foydalanadi; bunday hollarda ifodani qator konstruktorisiz **teng ifodaga** qayta yozish indeksdan to'liqroq foydalanishga olib kelishi mumkin. Hujjatdagi misol: `(c2,c3) > (1,1)` → `c2 > 1 OR ((c2 = 1) AND (c3 > 1))`. Bizning sinovda konstruktor indeks prefiksi `(sana, id)` ga to'liq mos bo'lsa ham, MySQL 9.7.2 uni oraliqqa aylantirmadi (kuzatildi). `OR` yozuvi bilan:

```sql
EXPLAIN ANALYZE SELECT id, sana FROM buyurtmalar
WHERE sana > '2025-07-28 08:00:00' OR (sana = '2025-07-28 08:00:00' AND id > 900000)
ORDER BY sana, id LIMIT 20;
```

```text
-> Limit: 20 row(s)  (cost=40621 rows=20) (actual time=0.0629..0.577 rows=20 loops=1)
    -> Filter: ((buyurtmalar.sana > TIMESTAMP'2025-07-28 08:00:00') or ((buyurtmalar.sana = TIMESTAMP'2025-07-28 08:00:00') and (buyurtmalar.id > 900000)))  (cost=40621 rows=202700) (actual time=0.0618..0.575 rows=20 loops=1)
        -> Covering index range scan on buyurtmalar using b_sana_id over (sana = '2025-07-28 08:00:00' AND 900000 < id) OR ('2025-07-28 08:00:00' < sana)  (cost=40621 rows=202700) (actual time=0.0173..0.529 rows=20 loops=1)
```

`Covering index range scan … over (sana = … AND 900000 < id) OR (… < sana)` — ikki oraliq, **0.58 ms**. Natija:

```text
| id     | sana                |
| 900001 | 2025-07-28 08:00:00 |
| 900002 | 2025-07-28 08:00:00 |
| 900003 | 2025-07-28 08:01:00 |
```

Ikki baza — ikki teskari tavsiya: PostgreSQL'da qator konstruktori (`Index Cond`), MySQL'da `OR` yozuvi (`range`). Ilova bir nechta bazani qo'llasa — har birida `EXPLAIN` bilan tekshiring.

### SQLite

Bir xil jadval (`sana` — `text`):

```sql
EXPLAIN QUERY PLAN SELECT id, sana FROM buyurtmalar ORDER BY sana, id LIMIT 20 OFFSET 900000;
EXPLAIN QUERY PLAN SELECT id, sana FROM buyurtmalar
WHERE (sana, id) > ('2025-07-28 08:00:00', 900000) ORDER BY sana, id LIMIT 20;
```

```text
QUERY PLAN
`--SCAN buyurtmalar USING COVERING INDEX b_sana_id
QUERY PLAN
`--SEARCH buyurtmalar USING COVERING INDEX b_sana_id (sana>?)
```

`OFFSET` — `SCAN` (boshidan), keyset — `SEARCH` (indeksda qidiruv). Vaqt (`.timer on`, `count(*)` bilan o'ralgan, natija har safar 20):

```text
20
Run Time: real 0.000022 user 0.000012 sys 0.000011
20
Run Time: real 0.007743 user 0.004603 sys 0.003140
20
Run Time: real 0.000028 user 0.000020 sys 0.000008
```

`OFFSET 0` — 0.022 ms, `OFFSET 900000` — **7.7 ms**, keyset — **0.028 ms**. Natija PostgreSQL bilan bir xil:

```text
900001|2025-07-28 08:00:00
900002|2025-07-28 08:00:00
900003|2025-07-28 08:01:00
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `OFFSET 900000` (1M qator) | 36 ms | 73 ms | 7.7 ms |
| Keyset `(sana, id) > (?, ?)` | 0.020 ms, `Index Cond` | 90 ms — indeks qidiruvsiz (`possible_keys = NULL`) | 0.028 ms, `SEARCH` |
| Keyset `sana > ? OR (sana = ? AND id > ?)` | 29 ms — `Filter` | 0.58 ms — `range` | — |
| Hujjatdagi tavsiya | Qator konstruktori (9.25) | Konstruktorsiz teng ifoda (10.2.1.22) | Qator qiymati (Row Values 3.1) |

`—` — bu bobda sinalmagan. Vaqtlar — bitta kompyuterdagi bitta o'lchov; muhimi — tartibi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Katta jadvalda chuqur `OFFSET` | Vaqt `OFFSET` ga proporsional (sinovda 0.029 → 36 ms) | Keyset |
| `ORDER BY sana` — takror qiymatli ustun bo'yicha | Tartib aniqlanmagan: sahifalar orasida qatorlar takrorlanadi yoki tushib qoladi (PG va MySQL hujjatlari) | Yagona ustun qo'shish: `ORDER BY sana, id` |
| Keyset'da faqat `sana > ?` | Oxirgi qator bilan bir xil `sana` li qatorlar tushib qoladi | `(sana, id) > (?, ?)` |
| Keyset ustunlariga mos indeks yo'q | Har sahifa butun jadvalni saralaydi | `(sana, id)` indeksi — `ORDER BY` bilan bir xil tartibda |
| MySQL'da qator konstruktori bilan keyset | Sinovda indeks qidiruvi yo'q, 90 ms | `OR` yozuvi; `EXPLAIN` bilan tekshirish |
| Tez o'zgaradigan lentada `OFFSET` | Yangi qator qo'shilsa — takror, o'chirilsa — tushib qolish | Keyset: o'rin emas, qiymat bo'yicha |

## Amaliyot

1. PostgreSQL'da `ORDER BY sana LIMIT 3 OFFSET 0` va `OFFSET 3` ni turli `LIMIT` lar bilan bajaring. Bir xil `sana` li qatorlarning tartibi o'zgaradimi?
2. `ORDER BY sana DESC, id DESC` uchun "oldingi sahifa" so'rovini yozing (natija yana kamayish tartibida chiqishi kerak).
3. `(sana, id)` indeksini o'chirib, faqat `sana` ga indeks qo'ying. Keyset rejasi qanday o'zgardi?
4. MySQL'da `(sana, id) > (…)` ni `/*+ INDEX(buyurtmalar b_sana_id) */` hint'i bilan sinang (46-bob). Reja o'zgardimi?
5. Sahifada "jami N ta natija" ko'rsatish kerak bo'lsa, 47-bobdagi `count(*)` muammosi bilan birga qanday yechim tanlaysiz?

## Rasmiy hujjat

- PostgreSQL — 7.6. LIMIT and OFFSET: <https://www.postgresql.org/docs/18/queries-limit.html>
- PostgreSQL — 9.25. Row and Array Comparisons (row constructor comparison): <https://www.postgresql.org/docs/18/functions-comparisons.html>
- MySQL — 10.2.1.19 LIMIT Query Optimization: <https://dev.mysql.com/doc/refman/9.7/en/limit-optimization.html>
- MySQL — 10.2.1.22 Row Constructor Expression Optimization: <https://dev.mysql.com/doc/refman/9.7/en/row-constructor-optimization.html>
- SQLite — Row Values (3.1. Scrolling Window Queries): <https://www.sqlite.org/rowvalue.html>
