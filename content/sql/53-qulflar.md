# 53 — Qulflar

[← Oldingi: MVCC](52-mvcc.md) · [Mundarija](README.md) · [Keyingi: Deadlock va qayta urinish →](54-deadlock-va-qayta-urinish.md)

## Tushuncha

MVCC (52-bob) o'qish va yozishni bir-biridan ajratdi. Lekin ikki tranzaksiya **bitta qatorni yozmoqchi** bo'lsa-chi? Yoki ilova qatorni o'qib, uning asosida qaror qabul qilib, keyin yozmoqchi bo'lsa ("balans yetarlimi? — yetarli, ayiramiz") — shu orada boshqasi o'zgartirmasligi kerak? Bu yerda **qulflar** (locks) ishlaydi.

PostgreSQL hujjati (13.3. Explicit Locking): PostgreSQL turli qulf rejimlarini beradi — MVCC kerakli xatti-harakatni bermaydigan hollarda ilova boshqaradigan qulflash uchun. Ko'p buyruqlar mos qulflarni **o'zi** oladi: masalan, `TRUNCATE` boshqa amallar bilan bir vaqtda xavfsiz bajarilolmaydi, shuning uchun jadvalga `ACCESS EXCLUSIVE` qulfini oladi.

Ikki daraja:

| Daraja | Nimani qulflaydi | Misol |
| --- | --- | --- |
| Jadval qulfi | Butun jadvalni | `ALTER TABLE` (63-bob), `TRUNCATE`, `LOCK TABLE` |
| Qator qulfi | Alohida qatorlarni | `UPDATE`, `DELETE`, `SELECT … FOR UPDATE` |

### PostgreSQL: jadval qulflari

Hujjat sakkizta rejimni sanaydi (`ACCESS SHARE` dan `ACCESS EXCLUSIVE` gacha). Muhim izoh: nomida "row" bo'lsa ham, bularning **hammasi jadval qulflari**, nomlar tarixiy. Rejimlar orasidagi yagona farq — qaysi rejimlar bilan **to'qnashishi**. Amalda eng muhimlari:

| Rejim | Kim oladi | Nima bilan to'qnashadi |
| --- | --- | --- |
| `ACCESS SHARE` | Oddiy `SELECT` | Faqat `ACCESS EXCLUSIVE` |
| `ROW SHARE` | `SELECT … FOR UPDATE / SHARE` | `EXCLUSIVE`, `ACCESS EXCLUSIVE` |
| `ROW EXCLUSIVE` | `UPDATE`, `DELETE`, `INSERT` | `SHARE` va undan kuchlilari |
| `ACCESS EXCLUSIVE` | `DROP TABLE`, `TRUNCATE`, ko'p `ALTER TABLE` lar | **Hammasi** |

Hujjat: oddiy `SELECT` ni faqat `ACCESS EXCLUSIVE` bloklaydi — va aynan shu qulfni ko'p `ALTER TABLE` shakllari oladi. Production'da sxemani o'zgartirishning xavfi shu yerda (63-bob).

### PostgreSQL: qator qulflari

| Qulf | Hujjat bo'yicha |
| --- | --- |
| `FOR UPDATE` | Qatorlar yangilash uchun qulflanadi: boshqa tranzaksiyalarning `UPDATE`, `DELETE` va barcha `SELECT … FOR …` lari tranzaksiya tugaguncha **kutadi** |
| `FOR NO KEY UPDATE` | `FOR UPDATE` dan kuchsizroq: `FOR KEY SHARE` ni bloklamaydi. Kalitni o'zgartirmaydigan har `UPDATE` aynan shu qulfni oladi |
| `FOR SHARE` | Umumiy (shared) qulf: boshqalarning `UPDATE`, `DELETE`, `FOR UPDATE`, `FOR NO KEY UPDATE` ini bloklaydi, `FOR SHARE` va `FOR KEY SHARE` ni — yo'q |
| `FOR KEY SHARE` | Eng kuchsiz: faqat `DELETE` va kalitni o'zgartiradigan `UPDATE` ni bloklaydi. **Tashqi kalit tekshiruvi** shu qulfni oladi |

Hujjat: PostgreSQL o'zgartirilgan qatorlar haqidagi ma'lumotni **xotirada saqlamaydi** — bir vaqtda qulflanadigan qatorlar soniga chek yo'q; buning evaziga qatorni qulflash diskka yozishga olib kelishi mumkin (`SELECT FOR UPDATE` qatorlarni "qulflangan" deb belgilaydi). Shuning uchun qator qulflari `pg_locks` da qator bo'yicha ko'rinmaydi.

### Kutmaslik: `NOWAIT` va `SKIP LOCKED`

PostgreSQL hujjati (SELECT, The Locking Clause):

- `NOWAIT` — qatorni darhol qulflab bo'lmasa, kutish o'rniga **xato**.
- `SKIP LOCKED` — darhol qulflab bo'lmaydigan qatorlar **tashlab ketiladi**. Hujjat: bu ma'lumotlarning izchil bo'lmagan ko'rinishini beradi, shuning uchun umumiy ish uchun emas, lekin **navbatga o'xshash jadval**ni bir nechta iste'molchi (consumer) bilan o'qishda qulf to'qnashuvlaridan qochish uchun yaraydi.

Kutish vaqtini cheklash — PostgreSQL'da `lock_timeout`, MySQL'da `innodb_lock_wait_timeout`.

### MySQL (InnoDB): yozuv, bo'shliq va next-key qulflari

MySQL hujjati (17.7.1 InnoDB Locking) — InnoDB qulflari **indeks yozuvlari**ga qo'yiladi:

| Qulf | Ta'rif (hujjat) |
| --- | --- |
| **Record lock** (yozuv qulfi) | Indeks yozuviga qulf: `WHERE c1 = 10 FOR UPDATE` boshqalarga `c1 = 10` qatorini qo'shish, yangilash, o'chirishga yo'l qo'ymaydi |
| **Gap lock** (bo'shliq qulfi) | Indeks yozuvlari **orasidagi bo'shliqqa** qulf: `WHERE c1 BETWEEN 10 AND 20 FOR UPDATE` boshqalarga `15` qo'shishga yo'l qo'ymaydi — bunday qator bor-yo'qligidan qat'i nazar |
| **Next-key lock** | Yozuv qulfi + undan **oldingi** bo'shliq qulfi |

Hujjat: standart Repeatable Read'da InnoDB qidiruv va indeks skanerlashda **next-key qulflar** ishlatadi — bu **fantom qatorlarning** (51-bob) oldini oladi. Read Committed'da esa bo'shliq qulflari qidiruv va skanerlash uchun o'chiriladi (faqat tashqi kalit va takror kalit tekshiruvida qoladi).

Qulflarni ko'rish — `performance_schema.data_locks` jadvali (hujjat 29.12.13.1).

### SQLite: fayl qulflari

SQLite hujjati (File Locking And Concurrency In SQLite Version 3) — qulf butun **baza fayliga** qo'yiladi, holatlar:

| Holat | Ma'nosi |
| --- | --- |
| `UNLOCKED` | Qulf yo'q |
| `SHARED` | O'qish mumkin, yozish yo'q. Istalgancha jarayon bir vaqtda |
| `RESERVED` | Kelajakda yozmoqchi, hozircha o'qiyapti. Bir vaqtda **faqat bitta**; `SHARED` lar u bilan birga bo'la oladi |
| `PENDING` | Imkon qadar tez yozmoqchi, mavjud `SHARED` lar tugashini kutyapti; yangi `SHARED` berilmaydi |
| `EXCLUSIVE` | Faylga yozish uchun kerak; boshqa hech qanday qulf bilan birga bo'lmaydi |

Qulf band bo'lsa — `SQLITE_BUSY`. Kutish uchun — `sqlite3_busy_timeout(ms)` (hujjat: kamida `ms` millisekund to'planguncha bir necha marta uxlab, qayta urinadigan busy handler o'rnatadi); `sqlite3` CLI'da — `.timeout ms`.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. Ikki seans — 51-bobdagi skript bilan.

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, nom text, balans int);
INSERT INTO mijozlar VALUES (1,'Aziza',1000),(2,'Bobur',500);
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int REFERENCES mijozlar);
CREATE TABLE vazifalar (id int PRIMARY KEY, holat text NOT NULL DEFAULT 'kutmoqda');
INSERT INTO vazifalar SELECT g FROM generate_series(1,5) g;
```

### `FOR UPDATE`, `lock_timeout`, `NOWAIT`, `pg_locks`

```text
A> BEGIN;
   BEGIN
A> SELECT balans FROM mijozlar WHERE id = 1 FOR UPDATE;
    balans 
   --------
      1000
   (1 row)
B> SET lock_timeout = '1s';
   SET
B> UPDATE mijozlar SET balans = 0 WHERE id = 1;
   ERROR:  canceling statement due to lock timeout
   CONTEXT:  while updating tuple (0,1) in relation "mijozlar"
B> SELECT balans FROM mijozlar WHERE id = 1 FOR UPDATE NOWAIT;
   ERROR:  could not obtain lock on row in relation "mijozlar"
B> SELECT balans FROM mijozlar WHERE id = 1;
    balans 
   --------
      1000
   (1 row)
B> UPDATE mijozlar SET balans = 0 WHERE id = 2;
   UPDATE 1
B> SELECT l.locktype, l.mode, l.granted, c.relname FROM pg_locks l LEFT JOIN pg_class c ON c.oid = l.relation WHERE l.pid <> pg_backend_pid() AND l.locktype IN ('relation', 'transactionid', 'tuple') ORDER BY 1, 4;
      locktype    |     mode      | granted |    relname    
   ---------------+---------------+---------+---------------
    relation      | RowShareLock  | t       | mijozlar
    relation      | RowShareLock  | t       | mijozlar_pkey
    transactionid | ExclusiveLock | t       | 
   (3 rows)
A> COMMIT;
   COMMIT
```

- A `Aziza` qatorini `FOR UPDATE` bilan qulfladi. B'ning `UPDATE` i kutdi va 1 soniyadan keyin — `canceling statement due to lock timeout` (kutish vaqtsiz bo'lsa, A tugaguncha kutardi).
- `NOWAIT` — kutmasdan darhol `could not obtain lock on row`.
- Oddiy `SELECT` — **bloklanmadi**, 1000 ni ko'rdi: o'qish qator qulfini kutmaydi (MVCC).
- `Bobur` qatori (`id = 2`) bo'sh — `UPDATE 1`: qulf faqat qatorga.
- `pg_locks` da A'ning qulflari: jadval va indeksda `RowShareLock` (hujjat: `FOR UPDATE` — `ROW SHARE`) va tranzaksiya ID'sining `ExclusiveLock` i. Qator qulfi alohida yozuv emas — u qatorning o'zida.

### `SKIP LOCKED` — navbat

Ikki ishchi (worker) bir vaqtda vazifa oladi:

```text
A> BEGIN;
   BEGIN
A> SELECT id FROM vazifalar WHERE holat = 'kutmoqda' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;
    id 
   ----
     1
     2
   (2 rows)
B> BEGIN;
   BEGIN
B> SET LOCAL lock_timeout = '1s';
   SET
B> SELECT id FROM vazifalar WHERE holat = 'kutmoqda' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;
    id 
   ----
     3
     4
   (2 rows)
B> SELECT id FROM vazifalar WHERE holat = 'kutmoqda' ORDER BY id LIMIT 2 FOR UPDATE;
   ERROR:  canceling statement due to lock timeout
   CONTEXT:  while locking tuple (0,1) in relation "vazifalar"
B> ROLLBACK;
   ROLLBACK
A> COMMIT;
   COMMIT
```

A 1 va 2 ni oldi, B — **3 va 4** ni: qulflangan 1, 2 tashlab ketildi, kutish yo'q. `SKIP LOCKED` siz B 1-qatorda qulf kutib qoldi (`lock_timeout`). Bu — jadvalda oddiy vazifalar navbati (job queue) qurishning odatiy usuli.

### Tashqi kalit: `FOR UPDATE` va `FOR NO KEY UPDATE`

`buyurtmalar.mijoz_id` → `mijozlar.id`. Buyurtma qo'shilganda PostgreSQL mijoz qatorini tekshiradi:

```text
A> BEGIN;
   BEGIN
A> SELECT * FROM mijozlar WHERE id = 1 FOR UPDATE;
    id |  nom  | balans 
   ----+-------+--------
     1 | Aziza |   1000
   (1 row)
B> SET lock_timeout = '1s';
   SET
B> INSERT INTO buyurtmalar VALUES (1, 1);
   ERROR:  canceling statement due to lock timeout
   CONTEXT:  while locking tuple (0,1) in relation "mijozlar"
   SQL statement "SELECT 1 FROM ONLY "public"."mijozlar" x WHERE "id" OPERATOR(pg_catalog.=) $1 FOR KEY SHARE OF x"
A> ROLLBACK;
   ROLLBACK
A> BEGIN;
   BEGIN
A> SELECT * FROM mijozlar WHERE id = 1 FOR NO KEY UPDATE;
    id |  nom  | balans 
   ----+-------+--------
     1 | Aziza |   1000
   (1 row)
B> INSERT INTO buyurtmalar VALUES (2, 1);
   INSERT 0 1
A> UPDATE mijozlar SET balans = 999 WHERE id = 1;
   UPDATE 1
B> INSERT INTO buyurtmalar VALUES (3, 1);
   INSERT 0 1
A> COMMIT;
   COMMIT
```

- `FOR UPDATE` bilan qulflangan mijozga **buyurtma qo'shib bo'lmadi**: xato kontekstida tekshiruv so'rovi ko'rinadi — `SELECT 1 FROM ONLY "public"."mijozlar" x WHERE "id" = $1 FOR KEY SHARE OF x`. Hujjatdagi qoida: `FOR UPDATE` `FOR KEY SHARE` ni bloklaydi.
- `FOR NO KEY UPDATE` bilan — buyurtma **qo'shildi**: bu qulf `FOR KEY SHARE` ni bloklamaydi.
- A'ning oddiy `UPDATE` i ham (kalit o'zgarmaydi) `FOR NO KEY UPDATE` oladi (hujjat) — keyingi buyurtma ham qo'shildi.

Xulosa: qatorni yangilash uchun qulflash kerak bo'lsa va kalit o'zgarmasa — `FOR NO KEY UPDATE`; `FOR UPDATE` bog'liq jadvallarga yozishni ham to'xtatadi.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosi, bo'sh qatorlar, `Rows matched` va `row in set` qatorlari olib tashlangan. Jadvalda `id` lar: 10, 20, 30.

**`FOR UPDATE`, kutish vaqti, `NOWAIT`:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT balans FROM mijozlar WHERE id = 10 FOR UPDATE;
   +--------+
   | balans |
   +--------+
   |   1000 |
   +--------+
B> SET SESSION innodb_lock_wait_timeout = 1;
   Query OK, 0 rows affected (0.000 sec)
B> UPDATE mijozlar SET balans = 0 WHERE id = 10;
   ERROR 1205 (HY000) at line 2: Lock wait timeout exceeded; try restarting transaction
B> SELECT balans FROM mijozlar WHERE id = 10 FOR UPDATE NOWAIT;
   ERROR 3572 (HY000) at line 3: Statement aborted because lock(s) could not be acquired immediately and NOWAIT is set.
B> SELECT balans FROM mijozlar WHERE id = 10;
   +--------+
   | balans |
   +--------+
   |   1000 |
   +--------+
A> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
```

PostgreSQL bilan bir xil manzara: `1205 Lock wait timeout exceeded`, `3572 … NOWAIT is set`, oddiy `SELECT` — bloklanmaydi.

**`SKIP LOCKED`:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT id FROM vazifalar WHERE holat = 'kutmoqda' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;
   +----+
   | id |
   +----+
   |  1 |
   |  2 |
   +----+
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> SELECT id FROM vazifalar WHERE holat = 'kutmoqda' ORDER BY id LIMIT 2 FOR UPDATE SKIP LOCKED;
   +----+
   | id |
   +----+
   |  3 |
   |  4 |
   +----+
B> ROLLBACK;
   Query OK, 0 rows affected (0.000 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
```

**Bo'shliq qulfi (Repeatable Read) va Read Committed'da:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT id, nom FROM mijozlar WHERE id BETWEEN 10 AND 20 FOR UPDATE;
   +----+-------+
   | id | nom   |
   +----+-------+
   | 10 | Aziza |
   | 20 | Bobur |
   +----+-------+
B> SET SESSION innodb_lock_wait_timeout = 1;
   Query OK, 0 rows affected (0.000 sec)
B> INSERT INTO mijozlar VALUES (15, 'Elyor', 0);
   ERROR 1205 (HY000) at line 2: Lock wait timeout exceeded; try restarting transaction
B> INSERT INTO mijozlar VALUES (35, 'Farida', 0);
   Query OK, 1 row affected (0.004 sec)
B> SELECT index_name, lock_type, lock_mode, lock_status, lock_data FROM performance_schema.data_locks WHERE object_name = 'mijozlar' ORDER BY lock_data;
   +------------+-----------+---------------+-------------+-----------+
   | index_name | lock_type | lock_mode     | lock_status | lock_data |
   +------------+-----------+---------------+-------------+-----------+
   | NULL       | TABLE     | IX            | GRANTED     | NULL      |
   | PRIMARY    | RECORD    | X,REC_NOT_GAP | GRANTED     | 10        |
   | PRIMARY    | RECORD    | X             | GRANTED     | 20        |
   +------------+-----------+---------------+-------------+-----------+
A> ROLLBACK;
   Query OK, 0 rows affected (0.000 sec)
B> DELETE FROM mijozlar WHERE id = 35;
   Query OK, 1 row affected (0.003 sec)
A> SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
   Query OK, 0 rows affected (0.000 sec)
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT id, nom FROM mijozlar WHERE id BETWEEN 10 AND 20 FOR UPDATE;
   +----+-------+
   | id | nom   |
   +----+-------+
   | 10 | Aziza |
   | 20 | Bobur |
   +----+-------+
B> INSERT INTO mijozlar VALUES (15, 'Elyor', 0);
   Query OK, 1 row affected (0.004 sec)
B> SELECT index_name, lock_type, lock_mode, lock_status, lock_data FROM performance_schema.data_locks WHERE object_name = 'mijozlar' ORDER BY lock_data;
   +------------+-----------+---------------+-------------+-----------+
   | index_name | lock_type | lock_mode     | lock_status | lock_data |
   +------------+-----------+---------------+-------------+-----------+
   | NULL       | TABLE     | IX            | GRANTED     | NULL      |
   | PRIMARY    | RECORD    | X,REC_NOT_GAP | GRANTED     | 10        |
   | PRIMARY    | RECORD    | X,REC_NOT_GAP | GRANTED     | 20        |
   +------------+-----------+---------------+-------------+-----------+
A> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
```

Repeatable Read (standart):

- A `id BETWEEN 10 AND 20` ni qulfladi. B `15` ni — ya'ni **mavjud bo'lmagan** qatorni — qo'sha olmadi (`1205`): 10 va 20 orasidagi bo'shliq qulflangan. `35` — qo'shildi (bu bo'shliq qulflanmagan).
- `data_locks`: `10` — `X,REC_NOT_GAP` (faqat yozuv; hujjatdagi `INNODB STATUS` misolida "locks rec but not gap"), `20` — `X`, ya'ni **next-key**: `20` yozuvi va undan oldingi bo'shliq (10, 20). `15` aynan shu bo'shliqda.
- Shu tufayli A'ning `BETWEEN` so'rovi takrorlansa, yangi qator chiqmaydi — fantom yo'q.

Read Committed:

- O'sha so'rov — `20` endi `X,REC_NOT_GAP`: bo'shliq qulfi yo'q. B `15` ni qo'shdi — A takroriy so'rovda fantomni ko'radi (51-bob: Read Committed'da phantom read mumkin).

PostgreSQL'da bo'shliq qulfi umuman **yo'q**: fantomlardan himoya Serializable'ning bog'liqlik kuzatuvi bilan (51-bob).

### SQLite

A — `BEGIN IMMEDIATE`, `UPDATE`, 2 soniya kutadi, `COMMIT`. B 0.5 soniyadan keyin:

```text
-- B: timeout yo'q
Error near line 2: database is locked
-- B: .timeout 5000
Run Time: real 1.571966 user 0.000474 sys 0.002790
800
```

- Kutish vaqtisiz — darhol `database is locked`.
- `.timeout 5000` bilan B **1.57 soniya** kutdi (A qulfni qo'yib yuborguncha) va o'z yozuvini bajardi: A'ning 900 iga −100 = **800**. Hech qanday yangilash yo'qolmadi.

SQLite ilovalarida `busy_timeout` ni o'rnatish — `SQLITE_BUSY` xatolarining eng oddiy yechimi; yozuvchi baribir bitta (50-bob).

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Qulf darajasi | Jadval + qator | Jadval (intention) + indeks yozuvi/bo'shliq | Butun fayl |
| Qator qulflari | `FOR UPDATE / NO KEY UPDATE / SHARE / KEY SHARE` | `FOR UPDATE / FOR SHARE` | — |
| Bo'shliq qulfi | Yo'q | Repeatable Read'da (next-key) | — |
| `NOWAIT` / `SKIP LOCKED` | Bor | Bor | — |
| Kutish chegarasi | `lock_timeout` | `innodb_lock_wait_timeout` | `busy_timeout` / `.timeout` |
| Qulflarni ko'rish | `pg_locks` | `performance_schema.data_locks` | — |
| Tashqi kalit tekshiruvi | `FOR KEY SHARE` (`FOR UPDATE` bilan to'qnashadi) | — | — |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| O'qib, ilovada hisoblab, keyin yozish — qulfsiz | Orada boshqa tranzaksiya o'zgartiradi — yangilanish yo'qoladi | `SELECT … FOR UPDATE` yoki atomar `UPDATE … SET x = x - 100 WHERE x >= 100` |
| PG'da kalit o'zgarmasa ham `FOR UPDATE` | Bog'liq jadvallarga `INSERT` lar kutadi (sinovda) | `FOR NO KEY UPDATE` |
| Kutish chegarasisiz qulflash | Bitta osilib qolgan tranzaksiya — butun navbat kutadi | `lock_timeout` / `innodb_lock_wait_timeout` / `NOWAIT` |
| Navbatni `FOR UPDATE` bilan bir nechta ishchida o'qish | Ishchilar bir-birini kutadi | `FOR UPDATE SKIP LOCKED` |
| `SKIP LOCKED` ni hisobot uchun ishlatish | Hujjat: izchil bo'lmagan ko'rinish | Faqat navbatsimon ishlar uchun |
| MySQL'da keng oraliqni `FOR UPDATE` bilan qulflash | Bo'shliq qulfi — mavjud bo'lmagan qatorlarni qo'shish ham bloklanadi | Oraliqni toraytirish; kerak bo'lsa Read Committed |
| SQLite'da `busy_timeout` siz ishlash | Ozgina parallellikda ham `database is locked` | `busy_timeout`, yozuvchi tranzaksiyalar — `BEGIN IMMEDIATE` |

## Amaliyot

1. PostgreSQL'da A `LOCK TABLE mijozlar IN ACCESS EXCLUSIVE MODE` qilsin. B'ning oddiy `SELECT` i nima bo'ladi (`lock_timeout` bilan)?
2. A `FOR SHARE` bilan qatorni qulflasin, B ham `FOR SHARE`. Keyin B `UPDATE` qilsin. Qaysi bosqichda kutish boshlandi?
3. `pg_locks` ni `pg_stat_activity` bilan `pid` bo'yicha birlashtirib, kim kimni kutayotganini ko'rsating (`pg_blocking_pids()` funksiyasi bilan solishtiring).
4. MySQL'da 1-misolni Read Committed'da `WHERE balans > 100 FOR UPDATE` bilan takrorlang. Indeksi yo'q ustunda qancha qator qulflandi (`data_locks`)?
5. `vazifalar` navbatini PostgreSQL'da to'liq yozing: ishchi `FOR UPDATE SKIP LOCKED LIMIT 1` bilan vazifa oladi, `holat` ni `'bajarildi'` qiladi, `COMMIT`. Ikki seansda bir vaqtda sinang.

## Rasmiy hujjat

- PostgreSQL — 13.3. Explicit Locking: <https://www.postgresql.org/docs/18/explicit-locking.html>
- PostgreSQL — SELECT (The Locking Clause): <https://www.postgresql.org/docs/18/sql-select.html#SQL-FOR-UPDATE-SHARE>
- PostgreSQL — 53.13. `pg_locks`: <https://www.postgresql.org/docs/18/view-pg-locks.html>
- MySQL — 17.7.1 InnoDB Locking: <https://dev.mysql.com/doc/refman/9.7/en/innodb-locking.html>
- MySQL — 17.7.2.4 Locking Reads (`NOWAIT`, `SKIP LOCKED`): <https://dev.mysql.com/doc/refman/9.7/en/innodb-locking-reads.html>
- MySQL — 29.12.13.1 The `data_locks` Table: <https://dev.mysql.com/doc/refman/9.7/en/performance-schema-data-locks-table.html>
- SQLite — File Locking And Concurrency In SQLite Version 3: <https://www.sqlite.org/lockingv3.html>
- SQLite — `sqlite3_busy_timeout()`: <https://www.sqlite.org/c3ref/busy_timeout.html>
