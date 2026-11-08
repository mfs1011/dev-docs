# 58 — Partitioning

[← Oldingi: Triggerlar](57-triggerlar.md) · [Mundarija](README.md)

## Tushuncha

**Partitioning** (bo'laklash) — PostgreSQL hujjati (5.12. Table Partitioning): mantiqan bitta katta jadvalni kichikroq **fizik bo'laklarga** (partition) ajratish. So'rovlar avvalgidek bitta jadvalga yoziladi (`SELECT … FROM buyurtmalar`), baza esa qatorni kerakli bo'lakka joylaydi va so'rovda faqat kerakli bo'laklarni o'qiydi.

Hujjat sanagan foydalar:

- Ko'p murojaat qilinadigan qatorlar bitta yoki bir nechta bo'lakda bo'lsa, so'rovlar **keskin tezlashishi** mumkin: bo'laklash indekslarning yuqori qatlamlari o'rnini bosadi va indekslarning faol qismi xotiraga sig'ishi osonlashadi.
- So'rov yoki yangilash bitta bo'lakning katta qismiga tegsa, indeks o'rniga shu bo'lakni ketma-ket o'qish tezroq bo'lishi mumkin.
- **Ommaviy yuklash va o'chirish** — bo'lak qo'shish yoki olib tashlash bilan: bo'lakni `DROP TABLE` yoki `ALTER TABLE … DETACH PARTITION` qilish ommaviy `DELETE` dan **ancha tez** va katta `DELETE` ning `VACUUM` xarajatidan butunlay qochadi (65-bob).
- Kam ishlatiladigan ma'lumotni arzonroq saqlash vositasiga ko'chirish.

Hujjat ogohlantiradi: bu foydalar odatda jadval **juda katta** bo'lgandagina o'zini oqlaydi; taxminiy qoida — jadval hajmi server operativ xotirasidan oshganda.

### Turlari

PostgreSQL deklarativ bo'laklashi uch turni qo'llaydi (MySQL'da qo'shimcha `KEY` va `COLUMNS` variantlari bor):

| Tur | Bo'lak nima bo'yicha | Misol |
| --- | --- | --- |
| **RANGE** | Kalit qiymatlari **oralig'i** | Oy bo'yicha: `2025-01-01` dan `2025-02-01` gacha |
| **LIST** | Kalitning aniq **qiymatlari ro'yxati** | Viloyat: `('Toshkent', 'Samarqand')` |
| **HASH** | Kalitning **xeshi** bo'yicha teng taqsimlash (modul va qoldiq) | Mijoz ID bo'yicha 8 bo'lak |

Hujjatdagi maslahat: bo'laklar sonini tanlash muhim — juda kam bo'lsa, indekslar katta qoladi; **juda ko'p** bo'lsa, rejalashtirish uzoqlashadi va xotira sarfi oshadi. Masalan, har mijozga bir LIST bo'lagi o'rniga — HASH va o'rtacha bo'laklar soni.

### Partition pruning

**Partition pruning** (bo'laklarni kesish) — so'rov shartiga ko'ra keraksiz bo'laklarni o'qimaslik. PostgreSQL'da `enable_partition_pruning` (standart — yoqilgan). Bo'laklash foydasi asosan shundan: so'rov shartida bo'lak kaliti bo'lmasa, **barcha** bo'laklar o'qiladi.

### Unique kalit va bo'lak kaliti

Ikkala bazaning hujjatida bir xil qoida:

- PostgreSQL (5.12.2.3. Limitations): bo'laklangan jadvalda unique yoki birlamchi kalit bo'lishi uchun cheklov ustunlari **barcha bo'lak kaliti ustunlarini** o'z ichiga olishi kerak. Sababi: cheklovni tashkil etuvchi indekslar faqat **o'z bo'lagi ichida** yagonalikni tekshira oladi; turli bo'laklarda takror yo'qligini bo'laklash tuzilishining o'zi kafolatlashi kerak.
- MySQL (26.6.1 Partitioning Keys, Primary Keys, and Unique Keys): jadvaldagi har bir unique kalit (birlamchi kalit ham) bo'laklash ifodasidagi **har bir ustunni** ishlatishi shart.

Amalda: `id` bo'yicha birlamchi kalit `sana` bo'yicha bo'laklangan jadvalda — `PRIMARY KEY (id, sana)`. Natijada `id` ning o'zi yagonaligini baza kafolatlamaydi (u faqat `(id, sana)` juftligida yagona).

### SQLite

SQLite'da `PARTITION BY` yo'q (pastda — sintaksis xatosi).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

### Bo'laklangan jadval va kalit qoidasi

```text
CREATE TABLE buyurtmalar (id bigint, sana date NOT NULL, summa int NOT NULL, PRIMARY KEY (id)) PARTITION BY RANGE (sana);
ERROR:  unique constraint on partitioned table must include all partitioning columns
DETAIL:  PRIMARY KEY constraint on table "buyurtmalar" lacks column "sana" which is part of the partition key.
CREATE TABLE buyurtmalar (id bigint, sana date NOT NULL, summa int NOT NULL, PRIMARY KEY (id, sana)) PARTITION BY RANGE (sana);
CREATE TABLE
CREATE TABLE buyurtmalar_2025_01 PARTITION OF buyurtmalar FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE
CREATE TABLE buyurtmalar_2025_02 PARTITION OF buyurtmalar FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE
CREATE TABLE buyurtmalar_2025_03 PARTITION OF buyurtmalar FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE
INSERT INTO buyurtmalar SELECT g, date '2025-01-01' + (g % 90), g % 1000 FROM generate_series(1, 900000) g;
INSERT 0 900000
INSERT INTO buyurtmalar VALUES (900001, '2025-05-10', 1);
ERROR:  no partition of relation "buyurtmalar" found for row
DETAIL:  Partition key of the failing row contains (sana) = (2025-05-10).
```

- `PRIMARY KEY (id)` — rad etildi: `lacks column "sana" which is part of the partition key` — hujjatdagi qoida.
- `PRIMARY KEY (id, sana)` bilan — yaratildi; bo'laklar — oddiy jadvallar, `PARTITION OF … FOR VALUES FROM … TO …` (pastki chegara kiradi, yuqorisi kirmaydi).
- 900 000 qator bo'laklarga o'zi taqsimlandi; may oyi uchun bo'lak yo'q — `no partition of relation "buyurtmalar" found for row`. Har oy uchun bo'lakni **oldindan** yaratish kerak (yoki `DEFAULT` bo'lak: `PARTITION OF … DEFAULT`).

### Pruning

```text
SELECT tableoid::regclass AS bolim, count(*) FROM buyurtmalar GROUP BY 1 ORDER BY 1;
        bolim        | count  
---------------------+--------
 buyurtmalar_2025_01 | 310000
 buyurtmalar_2025_02 | 280000
 buyurtmalar_2025_03 | 310000
(3 rows)

ANALYZE buyurtmalar;
ANALYZE
EXPLAIN (COSTS OFF) SELECT sum(summa) FROM buyurtmalar WHERE sana >= '2025-02-01' AND sana < '2025-03-01';
                                         QUERY PLAN                                         
--------------------------------------------------------------------------------------------
 Finalize Aggregate
   ->  Gather
         Workers Planned: 1
         ->  Partial Aggregate
               ->  Parallel Seq Scan on buyurtmalar_2025_02 buyurtmalar
                     Filter: ((sana >= '2025-02-01'::date) AND (sana < '2025-03-01'::date))
(6 rows)

EXPLAIN (COSTS OFF) SELECT sum(summa) FROM buyurtmalar WHERE summa = 5;
                                   QUERY PLAN                                   
--------------------------------------------------------------------------------
 Finalize Aggregate
   ->  Gather
         Workers Planned: 2
         ->  Partial Aggregate
               ->  Parallel Append
                     ->  Parallel Seq Scan on buyurtmalar_2025_01 buyurtmalar_1
                           Filter: (summa = 5)
                     ->  Parallel Seq Scan on buyurtmalar_2025_03 buyurtmalar_3
                           Filter: (summa = 5)
                     ->  Parallel Seq Scan on buyurtmalar_2025_02 buyurtmalar_2
                           Filter: (summa = 5)
(11 rows)
```

- `tableoid::regclass` — qator qaysi bo'lakdan ekanini ko'rsatadi.
- Fevral sharti bilan — faqat **`buyurtmalar_2025_02`** o'qildi; qolgan ikki bo'lak rejada yo'q.
- `summa` bo'yicha shart — bo'lak kaliti emas — `Parallel Append` bilan **uchala** bo'lak.

### `DELETE` va `DETACH`/`DROP`

Yanvar ma'lumotini o'chirish — ikki usul (`\timing on`):

```text
Timing is on.
BEGIN;
BEGIN
Time: 0.008 ms
DELETE FROM buyurtmalar WHERE sana < '2025-02-01';
DELETE 310000
Time: 149.369 ms
ROLLBACK;
ROLLBACK
Time: 0.035 ms
ALTER TABLE buyurtmalar DETACH PARTITION buyurtmalar_2025_01;
ALTER TABLE
Time: 2.170 ms
DROP TABLE buyurtmalar_2025_01;
DROP TABLE
Time: 1.012 ms
Timing is off.
SELECT tableoid::regclass AS bolim, count(*) FROM buyurtmalar GROUP BY 1 ORDER BY 1;
        bolim        | count  
---------------------+--------
 buyurtmalar_2025_02 | 280000
 buyurtmalar_2025_03 | 310000
(2 rows)
```

- `DELETE` — 310 000 qator, **149 ms** (va keyin `VACUUM` uchun 310 000 o'lik versiya, 52-bob). Taqqoslash uchun `ROLLBACK` qilindi.
- `DETACH PARTITION` + `DROP TABLE` — **2 + 1 ms**: qatorlar bittalab o'chirilmaydi, butun fayl tashlanadi. Hujjat: `DETACH` qilingan bo'lak oddiy jadvalga aylanadi — o'chirishdan oldin uni `pg_dump` bilan zaxiralash yoki hisobot uchun ishlatish mumkin.
- Hujjat: oddiy `DETACH` ota jadvalga `ACCESS EXCLUSIVE` qulf oladi (53-bob); `DETACH PARTITION … CONCURRENTLY` — faqat `SHARE UPDATE EXCLUSIVE`.

## Dialektlar

### MySQL

`RANGE COLUMNS` — sana ustuni bo'yicha to'g'ridan-to'g'ri oraliqlar. Chiqishlardan `mysql -vvv` aks-sadosining bir qismi, bo'sh qatorlar va `row in set` qatorlari olib tashlangan; xato xabarlari tegishli buyruq ostiga qo'yilgan.

```sql
CREATE TABLE buyurtmalar (id bigint PRIMARY KEY, sana date NOT NULL, summa int NOT NULL)
PARTITION BY RANGE COLUMNS (sana) (
    PARTITION p2025_01 VALUES LESS THAN ('2025-02-01'),
    PARTITION p2025_02 VALUES LESS THAN ('2025-03-01'),
    PARTITION p2025_03 VALUES LESS THAN ('2025-04-01')
);
```

```text
ERROR 1503 (HY000) at line 3: A PRIMARY KEY must include all columns in the table's partitioning function (prefixed columns are not considered).
```

`PRIMARY KEY (id, sana)` bilan yaratiladi. Keyin 900 000 qator va may oyi qatori:

```text
ERROR 1526 (HY000) at line 18: Table has no partition for value from column_list
```

```sql
SELECT partition_name, table_rows FROM information_schema.partitions WHERE table_name = 'buyurtmalar' ORDER BY partition_name;
EXPLAIN FORMAT=TRADITIONAL SELECT sum(summa) FROM buyurtmalar WHERE sana >= '2025-02-01' AND sana < '2025-03-01';
EXPLAIN FORMAT=TRADITIONAL SELECT sum(summa) FROM buyurtmalar WHERE summa = 5;
```

```text
+----------------+------------+
| PARTITION_NAME | TABLE_ROWS |
+----------------+------------+
| p2025_01       |     309852 |
| p2025_02       |     279954 |
| p2025_03       |     309852 |
+----------------+------------+
| table       | partitions                 | type | … | rows   | filtered | Extra       |
| buyurtmalar | p2025_02                   | ALL  | … | 279954 |    11.11 | Using where |

| buyurtmalar | p2025_01,p2025_02,p2025_03 | ALL  | … | 899658 |    10.00 | Using where |
```

- `information_schema.partitions.table_rows` — **taxminiy** (309 852, aslida 310 000; 47-bob: InnoDB aniq sonni saqlamaydi).
- `EXPLAIN` ning `partitions` ustuni — pruning natijasi: fevral sharti bilan faqat `p2025_02`, `summa` bilan — uchalasi.

**`DELETE` va `DROP PARTITION`:**

```text
DELETE FROM buyurtmalar WHERE sana < '2025-02-01'
Query OK, 310000 rows affected (0.365 sec)
ROLLBACK
Query OK, 0 rows affected (0.393 sec)
ALTER TABLE buyurtmalar DROP PARTITION p2025_01
Query OK, 0 rows affected (0.006 sec)
+----------+
| count(*) |
+----------+
|   590000 |
+----------+
```

`DELETE` — 0.37 s (va `ROLLBACK` yana 0.39 s — undo log'dan qaytarish, 52-bob); `DROP PARTITION` — **0.006 s**.

### SQLite

```text
Parse error in 2nd command line argument: near "BY": syntax error
  CREATE TABLE b (id integer, sana text) PARTITION BY RANGE (sana);
                                     error here ---^
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Turlar | RANGE, LIST, HASH | RANGE, LIST, HASH, KEY (+ `COLUMNS` variantlari, subpartitioning) | Yo'q |
| Bo'lak — | Alohida jadval (`PARTITION OF`) | Jadval ichidagi qism (`PARTITION p…`) | — |
| PK/unique qoidasi | Barcha bo'lak kaliti ustunlari kirishi shart | Xuddi shunday | — |
| Mos bo'lak yo'q | `no partition … found for row` (`DEFAULT` bo'lak bilan hal qilinadi) | `1526 Table has no partition for value` | — |
| Pruning ko'rinishi | `EXPLAIN` da faqat kerakli bo'laklar | `EXPLAIN` ning `partitions` ustuni | — |
| Bo'lakni olib tashlash | `DETACH PARTITION [CONCURRENTLY]`, `DROP TABLE` | `ALTER TABLE … DROP PARTITION` | — |

`—` — tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Kichik jadvalni bo'laklash | Hujjat: foyda odatda jadval juda katta bo'lgandagina (taxminan RAM'dan katta) | Avval indekslar (41–44-boblar) |
| So'rovlarda bo'lak kaliti yo'q | Pruning ishlamaydi — barcha bo'laklar (sinovda `summa` sharti) | Bo'lak kalitini eng ko'p ishlatiladigan filtr bo'yicha tanlash |
| Bo'laklarni oldindan yaratmaslik | Yangi oyning birinchi `INSERT` i xato (sinovda) | Bo'laklarni oldindan yaratish (rejalashtirilgan vazifa) yoki `DEFAULT` bo'lak (PG) |
| `PRIMARY KEY (id)` ni saqlab qolishga urinish | Ikkala bazada ham rad etiladi | `PRIMARY KEY (id, sana)` — va `id` yagonaligi endi faqat juftlikda |
| Juda ko'p bo'lak (masalan, har mijozga) | Hujjat: rejalashtirish uzoqlashadi, xotira ko'payadi | HASH va o'rtacha bo'laklar soni |
| Eski ma'lumotni `DELETE` bilan tozalash | Sekin, `VACUUM` yuki (sinovda 149 ms va 3 ms) | `DETACH`/`DROP PARTITION` |

## Amaliyot

1. PostgreSQL'da `buyurtmalar` ga `DEFAULT` bo'lak qo'shing va may oyi qatorini qayta kiriting. Keyin may uchun alohida bo'lak yaratishga urinib ko'ring — nima bo'ldi?
2. `CREATE INDEX ON buyurtmalar (summa)` — ota jadvalga indeks. Har bo'lakda indeks paydo bo'ldimi (`\d buyurtmalar_2025_02`)?
3. `PARTITION BY HASH (id)` bilan 4 bo'lakli jadval yarating (`FOR VALUES WITH (MODULUS 4, REMAINDER 0)` …) va qatorlar taqsimotini `tableoid` bilan tekshiring.
4. `SET enable_partition_pruning = off` dan keyin fevral so'rovining rejasini oling.
5. MySQL'da `PARTITION BY LIST COLUMNS (viloyat)` bilan jadval yarating va `EXPLAIN` bilan pruning'ni tekshiring.

## Rasmiy hujjat

- PostgreSQL — 5.12. Table Partitioning: <https://www.postgresql.org/docs/18/ddl-partitioning.html>
- MySQL — 26.2 Partitioning Types: <https://dev.mysql.com/doc/refman/9.7/en/partitioning-types.html>
- MySQL — 26.4 Partition Pruning: <https://dev.mysql.com/doc/refman/9.7/en/partitioning-pruning.html>
- MySQL — 26.6.1 Partitioning Keys, Primary Keys, and Unique Keys: <https://dev.mysql.com/doc/refman/9.7/en/partitioning-limitations-partitioning-keys-unique-keys.html>
- SQLite — CREATE TABLE: <https://www.sqlite.org/lang_createtable.html>
