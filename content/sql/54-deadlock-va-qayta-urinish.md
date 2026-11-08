# 54 — Deadlock va qayta urinish

[← Oldingi: Qulflar](53-qulflar.md) · [Mundarija](README.md)

## Tushuncha

Ikki o'tkazma: A — 1-hisobdan 2-ga, B — 2-hisobdan 1-ga. A 1-qatorni qulfladi, B — 2-ni. Endi A 2-ni kutadi, B esa 1-ni. Hech biri davom eta olmaydi — **deadlock** (o'zaro qulflanish).

PostgreSQL hujjati (13.3.4. Deadlocks): deadlock — ikki yoki undan ortiq tranzaksiyaning har biri boshqasi xohlagan qulfni ushlab turishi. PostgreSQL deadlock'ni **avtomatik aniqlaydi** va tranzaksiyalardan birini bekor qilib hal qiladi, qolganlari davom etadi. Hujjat: aynan qaysi biri bekor qilinishini oldindan aytish qiyin — bunga **tayanmang**. Deadlock aniq qulflarsiz ham — oddiy `UPDATE` larning qator qulflari bilan ham bo'ladi.

Deadlock — 50–53-boblardagi xatolardan biri. Bu bob ularni bitta savol bilan birlashtiradi: **qaysi xatoda tranzaksiyani qaytadan urinish kerak?**

### Qayta urinish kerak bo'lgan xatolar

PostgreSQL hujjati (13.5. Serialization Failure Handling):

| SQLSTATE | Nomi | Qachon | Qayta urinish |
| --- | --- | --- | --- |
| `40001` | `serialization_failure` | Repeatable Read / Serializable (51-bob) | Hujjat: shartsiz qayta urinish tavsiya etiladi |
| `40P01` | `deadlock_detected` | Deadlock | Hujjat: qayta urinish maqsadga muvofiq bo'lishi mumkin |
| `23505` | `unique_violation` | Masalan, ilova mavjud kalitlarni ko'rib, yangisini tanlagan — boshqa nusxa ham aynan shuni tanlagan | Ehtiyotkorlik bilan: bu doimiy xato ham bo'lishi mumkin |
| `23P01` | `exclusion_violation` | Xuddi shunday | Xuddi shunday |

Hujjatning ikki muhim qoidasi:

- **Butun tranzaksiyani** qaytadan bajarish kerak — qaysi SQL yuborilishi va qanday qiymatlar ishlatilishini hal qiladigan **ilova mantig'i bilan birga**. Shuning uchun PostgreSQL avtomatik qayta urinishni taklif qilmaydi: u buni to'g'riligiga kafolat bilan qila olmaydi.
- Qayta urinish tugashni kafolatlamaydi — kuchli raqobatda bir necha urinish kerak bo'lishi mumkin.

MySQL hujjati (17.7.5.3 How to Minimize and Handle Deadlocks): deadlock tufayli muvaffaqiyatsiz tranzaksiyani qayta bajarishga **doim tayyor** bo'ling. "Deadlock'lar xavfli emas. Shunchaki qaytadan urinib ko'ring." InnoDB'da deadlock — `ERROR 1213 (40001)`, kutish vaqti tugashi — `1205`.

### Deadlock'dan qochish

PostgreSQL hujjati: eng yaxshi himoya — barcha ilovalar bir nechta obyektga qulflarni **bir xil tartibda** olishi. Yana: obyektga birinchi olingan qulf u uchun kerak bo'ladigan **eng qattiq** rejim bo'lsin. Oldindan tekshirib bo'lmasa — deadlock bilan bekor qilingan tranzaksiyani qayta urinish.

MySQL hujjati qo'shimcha qiladi:

- Tranzaksiyalar **kichik va qisqa** bo'lsin; tegishli o'zgarishlardan keyin darhol commit qiling. Interaktiv `mysql` seansini commit qilinmagan tranzaksiya bilan uzoq ochiq qoldirmang.
- Bir nechta jadval yoki bir jadvalning turli qatorlarini o'zgartirsangiz — **har doim bir xil tartibda**; shunda tranzaksiyalar navbatga turadi va deadlock bo'lmaydi.
- Yaxshi tanlangan indekslar — so'rovlar kamroq indeks yozuvini skanerlaydi va kamroq qulf qo'yadi (53-bob: InnoDB indeks yozuvlarini qulflaydi).
- Qulflaydigan o'qishlar (`FOR UPDATE`/`FOR SHARE`) bilan Read Committed kabi pastroq daraja.

InnoDB deadlock'da (hujjat 17.7.5.2) **kichikroq** tranzaksiyani qaytarishga harakat qiladi — o'lcham qo'shilgan, yangilangan, o'chirilgan qatorlar soni bilan aniqlanadi.

PostgreSQL hujjatidan yana bir ogohlantirish: deadlock aniqlanmaguncha qulf kutayotgan tranzaksiya **cheksiz** kutadi — shuning uchun tranzaksiyani uzoq (masalan, foydalanuvchi javobini kutib) ochiq tutish yomon g'oya.

### Ilova qulflari (advisory locks)

Ba'zan qatorni emas, **ilova ma'nosidagi** narsani qulflash kerak: "kunlik hisobotni faqat bitta ishchi tuzsin". PostgreSQL hujjati (13.3.5. Advisory Locks): ma'nosini ilova belgilaydigan qulflar; tizim ularning ishlatilishini **majburlamaydi**. Hujjat: jadvaldagi bayroq (flag) bilan ham qilish mumkin, lekin advisory qulflar tezroq, jadval shishishiga (bloat) olib kelmaydi va seans tugaganda server ularni o'zi tozalaydi.

| PostgreSQL | Qachon qo'yib yuboriladi |
| --- | --- |
| `pg_advisory_lock(n)` / `pg_try_advisory_lock(n)` — seans darajasi | `pg_advisory_unlock(n)` yoki seans tugaganda. Hujjat: **tranzaksiya semantikasiga bo'ysunmaydi** — bekor qilingan tranzaksiyada olingan qulf ham qoladi |
| `pg_advisory_xact_lock(n)` / `pg_try_advisory_xact_lock(n)` — tranzaksiya darajasi | Tranzaksiya oxirida avtomatik |

MySQL'da — `GET_LOCK(nom, timeout)` (hujjat 14.14 Locking Functions): olinsa `1`, vaqt tugasa `0`, xato bo'lsa `NULL`. `RELEASE_LOCK()` bilan yoki seans tugaganda qo'yib yuboriladi; tranzaksiya commit/rollback qilinganda **qo'yib yuborilmaydi**.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. Ikki seans — 51-bobdagi skript bilan. Bloklangan buyruqning javobi kechikib keladi — skript uni o'sha seansning **keyingi** buyrug'i ostida ko'rsatadi.

```sql
CREATE TABLE hisoblar (id int PRIMARY KEY, balans int NOT NULL);
INSERT INTO hisoblar VALUES (1, 1000), (2, 500);
```

### Deadlock

B'da `\set VERBOSITY verbose` — xato SQLSTATE kodi bilan:

```text
B> \set VERBOSITY verbose
A> BEGIN;
   BEGIN
B> BEGIN;
   BEGIN
A> UPDATE hisoblar SET balans = balans - 100 WHERE id = 1;
   UPDATE 1
B> UPDATE hisoblar SET balans = balans - 50 WHERE id = 2;
   UPDATE 1
A> UPDATE hisoblar SET balans = balans + 100 WHERE id = 2;
B> UPDATE hisoblar SET balans = balans + 50 WHERE id = 1;
   ERROR:  40P01: deadlock detected
   DETAIL:  Process 10291 waits for ShareLock on transaction 855; blocked by process 10290.
   Process 10290 waits for ShareLock on transaction 856; blocked by process 10291.
   HINT:  See server log for query details.
   CONTEXT:  while updating tuple (0,1) in relation "hisoblar"
   LOCATION:  DeadLockReport, deadlock.c:1138
B> ROLLBACK;
   ROLLBACK
A> COMMIT;
   UPDATE 1
   COMMIT
A> SELECT * FROM hisoblar ORDER BY id;
    id | balans 
   ----+--------
     1 |    900
     2 |    600
   (2 rows)
```

- A 1-qatorni, B 2-qatorni yangiladi. A 2-ni so'radi — kutdi (javob yo'q). B 1-ni so'radi — **deadlock**.
- `40P01: deadlock detected`, `DETAIL` — kim kimni kutayotgani: ikki jarayon bir-birining tranzaksiyasini kutyapti.
- PostgreSQL **B** ni bekor qildi; A'ning kutayotgan `UPDATE` i shundan keyin bajarildi (`UPDATE 1` — `A> COMMIT;` ostida) va A commit qildi: 900 va 600.
- Hujjat (`deadlock_timeout`): deadlock tekshiruvi qimmat, shuning uchun server har kutishda emas, qulfni shu vaqt (standart 1 soniya) kutgandan keyin tekshiradi.

### Bir xil tartib — deadlock yo'q

Xuddi shu ikki o'tkazma, lekin ikkalasi ham avval **1-qatorni** yangilaydi:

```text
A> BEGIN;
   BEGIN
B> BEGIN;
   BEGIN
A> UPDATE hisoblar SET balans = balans - 100 WHERE id = 1;
   UPDATE 1
B> UPDATE hisoblar SET balans = balans + 50 WHERE id = 1;
A> UPDATE hisoblar SET balans = balans + 100 WHERE id = 2;
   UPDATE 1
A> COMMIT;
   COMMIT
B> UPDATE hisoblar SET balans = balans - 50 WHERE id = 2;
   UPDATE 1
   UPDATE 1
B> COMMIT;
   COMMIT
A> SELECT * FROM hisoblar ORDER BY id;
    id | balans 
   ----+--------
     1 |    950
     2 |    550
   (2 rows)
```

B 1-qatorda A'ni **kutdi** (deadlock emas, oddiy navbat), A tugagach davom etdi (`UPDATE 1` — B'ning kechikkan javobi). Ikkala o'tkazma ham saqlandi: 1000 − 100 + 50 = 950, 500 + 100 − 50 = 550.

Amalda: bir nechta qatorni yangilaydigan tranzaksiyada qatorlarni doim bir xil tartibda (masalan, `id` bo'yicha o'sish) qulflang: `SELECT … WHERE id IN (1, 2) ORDER BY id FOR UPDATE`.

### `40001` va qo'lda qayta urinish

51-bobdagi write skew; B xatodan keyin **butun** tranzaksiyani qaytadan bajaradi:

```text
B> \set VERBOSITY verbose
A> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
B> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
A> SELECT SUM(value) FROM mytab WHERE class = 1;
    sum 
   -----
     30
   (1 row)
B> SELECT SUM(value) FROM mytab WHERE class = 2;
    sum 
   -----
    300
   (1 row)
A> INSERT INTO mytab VALUES (2, 30);
   INSERT 0 1
B> INSERT INTO mytab VALUES (1, 300);
   INSERT 0 1
A> COMMIT;
   COMMIT
B> COMMIT;
   ERROR:  40001: could not serialize access due to read/write dependencies among transactions
   DETAIL:  Reason code: Canceled on identification as a pivot, during commit attempt.
   HINT:  The transaction might succeed if retried.
   LOCATION:  PreCommit_CheckForSerializationFailure, predicate.c:4727
B> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
B> SELECT SUM(value) FROM mytab WHERE class = 2;
    sum 
   -----
    330
   (1 row)
B> INSERT INTO mytab VALUES (1, 330);
   INSERT 0 1
B> COMMIT;
   COMMIT
```

Ikkinchi urinishda B `class = 2` yig'indisini **330** deb ko'rdi — A'ning commit qilingan qatori bilan. Natija endi ketma-ket tartibga (avval A, keyin B) mos. Faqat `INSERT` ni takrorlash noto'g'ri bo'lardi — eski yig'indi (300) yozilardi; hujjatdagi qoida shu: qiymatni hisoblaydigan mantiq ham qayta bajariladi.

### Qayta urinish sikli

Haqiqiy ilovada qayta urinish — kodda. Eng oddiy shakl — `bash` va `psql` bilan (`ON_ERROR_STOP=1` — xatoda `psql` nol bo'lmagan kod bilan chiqadi):

```bash
#!/bin/bash
# urinish.sh <o'qiladigan class> <yoziladigan class> <ishchi nomi>
for urinish in 1 2 3 4 5; do
  natija=$(psql -U postgres -X -q -v ON_ERROR_STOP=1 2>&1 <<SQL
BEGIN ISOLATION LEVEL SERIALIZABLE;
SELECT pg_sleep(1);
INSERT INTO mytab SELECT $2, SUM(value) FROM mytab WHERE class = $1;
COMMIT;
SQL
)
  if [ $? -eq 0 ]; then echo "$3: $urinish-urinish — COMMIT"; exit 0; fi
  echo "$3: $urinish-urinish — xato: $(echo "$natija" | grep -o 'could not serialize[^.]*')"
done
```

`pg_sleep(1)` — ikki ishchi aniq bir vaqtda ishlashi uchun. Ikkalasi parallel (`./urinish.sh 1 2 A & ./urinish.sh 2 1 B`):

```text
A: 1-urinish — xato: could not serialize access due to read/write dependencies among transactions
A: 2-urinish — COMMIT
B: 1-urinish — COMMIT
 class | value 
-------+-------
     1 |    10
     1 |    20
     1 |   300
     2 |   100
     2 |   200
     2 |   330
(6 rows)
```

B birinchi urinishda o'tdi (`class = 1` ga 300). A xato oldi va qaytadan urindi — `class = 1` yig'indisini endi **330** deb hisobladi. Bu skript har xatoda qayta urinadi; hujjatga ko'ra qayta urinish shartsiz faqat `serialization_failure` (`40001`) uchun tavsiya etiladi, boshqa kodlarda — ehtiyotkorlik bilan (3-mashq).

### Advisory qulflar

```text
A> SELECT pg_try_advisory_lock(42);
    pg_try_advisory_lock 
   ----------------------
    t
   (1 row)
B> SELECT pg_try_advisory_lock(42);
    pg_try_advisory_lock 
   ----------------------
    f
   (1 row)
A> BEGIN;
   BEGIN
A> ROLLBACK;
   ROLLBACK
B> SELECT pg_try_advisory_lock(42);
    pg_try_advisory_lock 
   ----------------------
    f
   (1 row)
A> SELECT pg_advisory_unlock(42);
    pg_advisory_unlock 
   --------------------
    t
   (1 row)
B> SELECT pg_try_advisory_lock(42);
    pg_try_advisory_lock 
   ----------------------
    t
   (1 row)
B> SELECT pg_advisory_unlock(42);
    pg_advisory_unlock 
   --------------------
    t
   (1 row)
A> BEGIN;
   BEGIN
A> SELECT pg_advisory_xact_lock(7);
    pg_advisory_xact_lock 
   -----------------------
    
   (1 row)
B> SELECT pg_try_advisory_xact_lock(7);
    pg_try_advisory_xact_lock 
   ---------------------------
    f
   (1 row)
A> COMMIT;
   COMMIT
B> SELECT pg_try_advisory_xact_lock(7);
    pg_try_advisory_xact_lock 
   ---------------------------
    t
   (1 row)
```

- `pg_try_advisory_lock(42)` — A oldi (`t`), B — yo'q (`f`), kutmasdan.
- A'ning bo'sh `BEGIN … ROLLBACK` idan keyin ham B ololmadi: seans darajasidagi qulf **tranzaksiyaga bog'liq emas** (hujjat). Faqat `pg_advisory_unlock` dan keyin.
- `pg_advisory_xact_lock(7)` — A'ning `COMMIT` i bilan o'zi qo'yib yuborildi.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosi, bo'sh qatorlar, `Rows matched` va `row in set` qatorlari olib tashlangan.

**Deadlock:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> UPDATE hisoblar SET balans = balans - 100 WHERE id = 1;
   Query OK, 1 row affected (0.000 sec)
B> UPDATE hisoblar SET balans = balans - 50 WHERE id = 2;
   Query OK, 1 row affected (0.001 sec)
A> UPDATE hisoblar SET balans = balans + 100 WHERE id = 2;
B> UPDATE hisoblar SET balans = balans + 50 WHERE id = 1;
   ERROR 1213 (40001) at line 3: Deadlock found when trying to get lock; try restarting transaction
A> COMMIT;
   UPDATE hisoblar SET balans = balans + 100 WHERE id = 2
   Query OK, 1 row affected (1.293 sec)
   Query OK, 0 rows affected (0.003 sec)
B> SELECT * FROM hisoblar ORDER BY id;
   +----+--------+
   | id | balans |
   +----+--------+
   |  1 |    900 |
   |  2 |    600 |
   +----+--------+
```

PostgreSQL'dagi manzara: B'ga `ERROR 1213 (40001) … Deadlock found when trying to get lock; try restarting transaction` — xabarning o'zi "qayta urinib ko'ring" deydi. A'ning kutayotgan `UPDATE` i 1.29 soniyadan keyin bajarildi. MySQL'da deadlock SQLSTATE'i — `40001` (PostgreSQL'da `40P01`).

Oxirgi deadlock tafsiloti — `SHOW ENGINE INNODB STATUS` ning `LATEST DETECTED DEADLOCK` bo'limi (qisqartirilgan):

```text
*** (1) TRANSACTION:
TRANSACTION 2866, ACTIVE 4 sec starting index read
UPDATE hisoblar SET balans = balans + 100 WHERE id = 2
*** (1) HOLDS THE LOCK(S):
RECORD LOCKS … index PRIMARY of table `sinov`.`hisoblar` trx id 2866 lock_mode X locks rec but not gap
*** (1) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS … index PRIMARY of table `sinov`.`hisoblar` trx id 2866 lock_mode X locks rec but not gap waiting
*** (2) TRANSACTION:
TRANSACTION 2867, ACTIVE 3 sec starting index read
UPDATE hisoblar SET balans = balans + 50 WHERE id = 1
*** (2) HOLDS THE LOCK(S):
RECORD LOCKS … index PRIMARY of table `sinov`.`hisoblar` trx id 2867 lock_mode X locks rec but not gap
*** (2) WAITING FOR THIS LOCK TO BE GRANTED:
RECORD LOCKS … index PRIMARY of table `sinov`.`hisoblar` trx id 2867 lock_mode X locks rec but not gap waiting
*** WE ROLL BACK TRANSACTION (2)
```

Ikkala tranzaksiya, har biri ushlab turgan (`HOLDS THE LOCK(S)`) va kutayotgan (`WAITING FOR THIS LOCK`) qulf — `lock_mode X locks rec but not gap` (53-bob), va qaror: `WE ROLL BACK TRANSACTION (2)`. Hujjat: barcha deadlock'larni xato jurnaliga yozish uchun — `innodb_print_all_deadlocks`.

**`GET_LOCK`:**

```text
A> SELECT GET_LOCK('hisobot', 0);
   +------------------------+
   | GET_LOCK('hisobot', 0) |
   +------------------------+
   |                      1 |
   +------------------------+
B> SELECT GET_LOCK('hisobot', 1);
   +------------------------+
   | GET_LOCK('hisobot', 1) |
   +------------------------+
   |                      0 |
   +------------------------+
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
B> SELECT GET_LOCK('hisobot', 0);
   +------------------------+
   | GET_LOCK('hisobot', 0) |
   +------------------------+
   |                      0 |
   +------------------------+
A> SELECT RELEASE_LOCK('hisobot');
   +-------------------------+
   | RELEASE_LOCK('hisobot') |
   +-------------------------+
   |                       1 |
   +-------------------------+
B> SELECT GET_LOCK('hisobot', 0);
   +------------------------+
   | GET_LOCK('hisobot', 0) |
   +------------------------+
   |                      1 |
   +------------------------+
```

A olgan `'hisobot'` qulfini B 1 soniya kutib ololmadi (`0`); A'ning `COMMIT` i qulfni qo'yib yubormadi (hujjat), faqat `RELEASE_LOCK` — shundan keyin B oldi (`1`).

### SQLite

SQLite'da qator qulflari yo'q (53-bob), lekin fayl qulflarida deadlock'ning o'xshashi bor. SQLite hujjati (`sqlite3_busy_handler`): busy handler bo'lishi lock to'qnashuvida uning **chaqirilishini kafolatlamaydi** — chaqirish deadlock'ga olib kelishi mumkin bo'lsa, SQLite darhol `SQLITE_BUSY` qaytaradi. Hujjatdagi holat: bir jarayon o'qish qulfini `RESERVED` ga ko'tarmoqchi, ikkinchisi `RESERVED` ni `EXCLUSIVE` ga — birinchisi ikkinchisini, ikkinchisi birinchisini kutadi.

Ikkala seansda `.timeout 5000`, ikkalasi `DEFERRED` tranzaksiyada o'qiydi, keyin yozmoqchi:

```text
A> .timeout 5000
B> .timeout 5000
A> BEGIN;
A> SELECT balans FROM hisoblar WHERE id = 1;
   1000
B> BEGIN;
B> SELECT balans FROM hisoblar WHERE id = 2;
   500
A> UPDATE hisoblar SET balans = balans - 100 WHERE id = 1;
B> .timer on
B> UPDATE hisoblar SET balans = balans - 50 WHERE id = 2;
   Error near line 5: database is locked
   Run Time: real 0.000265 user 0.000104 sys 0.000128
B> .timer off
B> ROLLBACK;
A> COMMIT;
A> SELECT * FROM hisoblar;
   1|900
   2|500
```

A birinchi bo'lib yozdi (`RESERVED`). B'ning `UPDATE` i 5 soniya kutish o'rniga **0.0003 soniyada** `database is locked` oldi — kutish ma'nosiz edi: A commit qilishi uchun B'ning o'qish qulfi tugashi kerak, B esa A'ni kutardi. Yechim — 50-bobdagidek: yozadigan tranzaksiya `BEGIN IMMEDIATE` bilan, shunda kutish **tranzaksiya boshida** bo'ladi va `busy_timeout` ishlaydi.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Deadlock xatosi | `40P01 deadlock detected` | `1213 (40001) Deadlock found` | `SQLITE_BUSY` (busy handler chaqirilmaydi) |
| Serialization xatosi | `40001` | — (Serializable'da qulf va deadlock) | `SQLITE_BUSY_SNAPSHOT` (51-bob) |
| Qaysi biri bekor qilinadi | Oldindan aytib bo'lmaydi (hujjat) | Kichikroq tranzaksiya (hujjat) | Kutishga majbur bo'lgani |
| Tekshirish | `deadlock_timeout` (standart 1 s) kutgandan keyin | `innodb_deadlock_detect` | — |
| Tafsilot | Xato `DETAIL` i, server jurnali | `SHOW ENGINE INNODB STATUS`, `innodb_print_all_deadlocks` | — |
| Ilova qulfi | `pg_advisory_lock`, `pg_advisory_xact_lock` | `GET_LOCK`, `RELEASE_LOCK` | — |
| Avtomatik qayta urinish | Yo'q (hujjat: to'g'riligini kafolatlab bo'lmaydi) | Yo'q | Yo'q |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `40001`/`40P01`/`1213` ni foydalanuvchiga ko'rsatish | Bu vaqtinchalik xato — qayta urinish yetarli | Ilovada qayta urinish sikli |
| Faqat xato bergan operatorni qayta yuborish | Eski hisob-kitob bilan yoziladi (sinovda 300 o'rniga 330 kerak edi) | Butun tranzaksiyani mantig'i bilan qayta bajarish |
| Har xatoda qayta urinish | `23505` kabi doimiy xatolarda cheksiz sikl | Faqat ma'lum kodlarda; urinishlar soniga chek |
| Qatorlarni turli joyda turli tartibda yangilash | Deadlock (sinovda) | Bir xil tartib: `ORDER BY id FOR UPDATE` |
| Uzoq tranzaksiyalar | Qulf to'qnashuvi va deadlock ehtimoli oshadi | Kichik, qisqa tranzaksiyalar (MySQL hujjati) |
| PG seans advisory qulfini `ROLLBACK` qo'yib yuboradi deb o'ylash | Qulf qoladi (sinovda) | `pg_advisory_unlock` yoki `pg_advisory_xact_lock` |
| MySQL `GET_LOCK` ni `COMMIT` qo'yib yuboradi deb o'ylash | Qoladi (sinovda) | `RELEASE_LOCK` |
| SQLite'da `busy_timeout` deadlock'ni ham kutadi deb o'ylash | Darhol `SQLITE_BUSY` (sinovda 0.0003 s) | `BEGIN IMMEDIATE` |

## Amaliyot

1. PostgreSQL'da uch seansli deadlock yasang (A → B → C → A). `DETAIL` qanday ko'rinadi?
2. `SET deadlock_timeout = '5s'` bilan deadlock misolini takrorlang. Xato qachon chiqdi?
3. `urinish.sh` ni faqat `40001` da qayta urinadigan qiling (`psql` xatosidagi SQLSTATE'ni `\set VERBOSITY verbose` bilan oling).
4. MySQL'da `SET GLOBAL innodb_print_all_deadlocks = ON` dan keyin deadlock yasang va konteyner jurnalini (`docker logs`) o'qing.
5. `pg_try_advisory_lock` bilan "bir vaqtda faqat bitta hisobot" ni amalga oshiring: ikki seansda bir vaqtda ishga tushiring.

## Rasmiy hujjat

- PostgreSQL — 13.3.4. Deadlocks, 13.3.5. Advisory Locks: <https://www.postgresql.org/docs/18/explicit-locking.html>
- PostgreSQL — 13.5. Serialization Failure Handling: <https://www.postgresql.org/docs/18/mvcc-serialization-failure-handling.html>
- PostgreSQL — 9.28.10. Advisory Lock Functions: <https://www.postgresql.org/docs/18/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS>
- MySQL — 17.7.5.2 Deadlock Detection: <https://dev.mysql.com/doc/refman/9.7/en/innodb-deadlock-detection.html>
- MySQL — 17.7.5.3 How to Minimize and Handle Deadlocks: <https://dev.mysql.com/doc/refman/9.7/en/innodb-deadlocks-handling.html>
- MySQL — 14.14 Locking Functions (`GET_LOCK`): <https://dev.mysql.com/doc/refman/9.7/en/locking-functions.html>
- SQLite — `sqlite3_busy_handler()`: <https://www.sqlite.org/c3ref/busy_handler.html>
