# 51 — Izolyatsiya darajalari

[← Oldingi: Tranzaksiya](50-tranzaksiya.md) · [Mundarija](README.md)

## Tushuncha

50-bobda: ochiq tranzaksiyaning o'zgarishlari boshqalarga ko'rinmaydi. Teskari savol: **boshqalar** commit qilgan o'zgarishlar **mening** ochiq tranzaksiyamga ko'rinadimi? Javob — **izolyatsiya darajasi**ga (isolation level) bog'liq.

SQL standarti to'rt darajani to'rtta **hodisa** (phenomena) orqali belgilaydi. PostgreSQL hujjati (13.2. Transaction Isolation) ularni shunday ta'riflaydi:

| Hodisa | Ta'rif |
| --- | --- |
| **Dirty read** (iflos o'qish) | Tranzaksiya parallel, hali **commit qilinmagan** tranzaksiya yozgan ma'lumotni o'qiydi |
| **Nonrepeatable read** (takrorlanmaydigan o'qish) | Avval o'qigan ma'lumotini qayta o'qiydi va u boshqa (o'shandan beri commit qilgan) tranzaksiya tomonidan **o'zgartirilgan** bo'lib chiqadi |
| **Phantom read** (fantom o'qish) | Shartga mos qatorlar to'plamini qayta so'raydi va **to'plam o'zgargan** — boshqa tranzaksiya qator qo'shgan/o'chirgan |
| **Serialization anomaly** (ketma-ketlik anomaliyasi) | Bir guruh tranzaksiyalarning natijasi ularni **har qanday tartibda birma-bir** bajarish natijasiga mos kelmaydi |

Standart va PostgreSQL'dagi holat (hujjatning 13.1-jadvali):

| Daraja | Dirty read | Nonrepeatable read | Phantom read | Serialization anomaly |
| --- | --- | --- | --- | --- |
| Read Uncommitted | Mumkin, lekin PG'da yo'q | Mumkin | Mumkin | Mumkin |
| Read Committed | Yo'q | Mumkin | Mumkin | Mumkin |
| Repeatable Read | Yo'q | Yo'q | Mumkin, lekin PG'da yo'q | Mumkin |
| Serializable | Yo'q | Yo'q | Yo'q | Yo'q |

Standart har darajada qaysi hodisa **bo'lmasligi kerak**ligini aytadi; baza qattiqroq bo'lishi mumkin.

### PostgreSQL

- **Read Committed — standart.** Hujjat: `SELECT` faqat **so'rov boshlangunga qadar** commit qilingan ma'lumotni ko'radi — so'rov boshlangan paytdagi snapshot. Shuning uchun bitta tranzaksiya ichidagi ikki `SELECT` turlicha natija berishi mumkin.
- **Read Uncommitted = Read Committed.** Hujjat: to'rt darajani so'rash mumkin, lekin ichkarida faqat uchtasi amalga oshirilgan — PostgreSQL'ning MVCC arxitekturasi (52-bob) uchun bu yagona mantiqiy moslik.
- **Repeatable Read** — tranzaksiyadagi **birinchi** so'rov paytidagi snapshot butun tranzaksiya davomida. Boshqa tranzaksiya o'zgartirgan qatorni bu tranzaksiya o'zgartirmoqchi bo'lsa — `could not serialize access due to concurrent update`. Hujjat: bunday xatoda tranzaksiyani **bekor qilib, boshidan qayta urinish** kerak.
- **Serializable** — Repeatable Read kabi, qo'shimcha ravishda tranzaksiyalar natijasi **biror ketma-ket tartibga** mos kelmaydigan holatlarni kuzatadi va ulardan birini xato bilan to'xtatadi. Hujjat: bu kuzatish Repeatable Read'dagidan ortiq bloklash qo'shmaydi, lekin qo'shimcha xarajati bor; ilova qayta urinishga tayyor bo'lishi kerak (54-bob).

### MySQL (InnoDB)

MySQL hujjati (17.7.2.1 Transaction Isolation Levels):

- **Repeatable Read — standart.** Bir tranzaksiyadagi oddiy (qulflamaydigan) o'qishlar **birinchi o'qishda** olingan snapshot'ni ko'radi.
- **Read Committed** — har o'qish, hatto bir tranzaksiya ichida ham, **yangi** snapshot oladi.
- **Read Uncommitted** — oddiy `SELECT` qatorning **oldingi (commit qilinmagan)** versiyasini ham o'qishi mumkin — hujjat buni ochiq "dirty read" deydi.
- **Serializable** — Repeatable Read kabi, lekin autocommit o'chiq bo'lsa, barcha oddiy `SELECT` larni yashirin `SELECT … FOR SHARE` ga aylantiradi (o'qilgan qatorlar qulflanadi, 53-bob).

Muhim farq — hujjat (17.7.2.3 Consistent Nonlocking Reads): snapshot **`SELECT` larga** taalluqli, DML (`UPDATE`, `DELETE`) ga emas. Boshqa tranzaksiya commit qilgan qatorlarni Repeatable Read tranzaksiyaning `UPDATE` i **ta'sir qiladi** — garchi `SELECT` ularni ko'rmasa ham; o'zgartirilgan qatorlar shundan keyin tranzaksiyaga ko'rinadi.

### SQLite

SQLite hujjati (Isolation In SQLite): `read_uncommitted` pragmasi yoqilgan umumiy kesh (shared cache) ulanishlaridan tashqari, SQLite'dagi **barcha** tranzaksiyalar **serializable**. SQLite buni yozishlarni haqiqatda **ketma-ket** qilish bilan ta'minlaydi — bir vaqtda faqat bitta yozuvchi (50-bob). WAL rejimida — **snapshot izolyatsiyasi**: o'qish tranzaksiyasi boshlangan paytdagi baza holatini ko'radi, shu orada commit qilingan yozishlar unga ko'rinmaydi. Bunday tranzaksiya yozishga o'tmoqchi bo'lsa, snapshot eskirgan bo'lsa — `SQLITE_BUSY_SNAPSHOT` (natija kodlari hujjati).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

Ikki seans (A va B) bir vaqtda ochiq; buyruqlar ko'rsatilgan tartibda navbatma-navbat yuboriladi (kichik Python skripti orqali, har chiqish oldida seans nomi). B — tranzaksiyasiz, har buyrug'i darhol commit qilinadi (autocommit), agar `BEGIN` ko'rsatilmagan bo'lsa.

```sql
CREATE TABLE hisoblar (nom text PRIMARY KEY, balans int NOT NULL);
INSERT INTO hisoblar VALUES ('Aziza', 1000), ('Bobur', 500);
```

### Read Committed: takrorlanmaydigan o'qish

```text
A> BEGIN;
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
    balans 
      1000
   (1 row)
B> UPDATE hisoblar SET balans = 700 WHERE nom = 'Aziza';
   UPDATE 1
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
    balans 
       700
   (1 row)
A> COMMIT;
```

Bitta tranzaksiya ichida `Aziza` — avval **1000**, B commit qilgach — **700**. Read Committed'da har `SELECT` — o'z snapshot'i.

### Repeatable Read: snapshot va yangilash xatosi

```text
A> BEGIN ISOLATION LEVEL REPEATABLE READ;
   BEGIN
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
    balans 
      1000
   (1 row)
B> UPDATE hisoblar SET balans = 700 WHERE nom = 'Aziza';
   UPDATE 1
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
    balans 
      1000
   (1 row)
A> UPDATE hisoblar SET balans = balans - 100 WHERE nom = 'Aziza';
   ERROR:  could not serialize access due to concurrent update
A> ROLLBACK;
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
    balans 
       700
   (1 row)
```

- B commit qilganidan keyin ham A **1000** ni ko'rdi — snapshot tranzaksiya boshidagi.
- A shu qatorni yangilamoqchi bo'ldi — `could not serialize access due to concurrent update`: A eski ma'lumotga tayanib yozmoqda, PostgreSQL buni rad etdi. Aks holda B'ning `700` i jimgina **yo'qolardi** (lost update — yo'qolgan yangilanish).
- Hujjatdagi yo'l: `ROLLBACK` va **qaytadan** — ikkinchi urinishda A `700` ni ko'radi.

### Write skew: Repeatable Read va Serializable

Hujjatdagi misol: `mytab` da `class = 1` (10, 20) va `class = 2` (100, 200). A `class = 1` yig'indisini (30) `class = 2` ga yozadi, B esa `class = 2` yig'indisini (300) `class = 1` ga:

```sql
CREATE TABLE mytab (class int, value int);
INSERT INTO mytab VALUES (1,10),(1,20),(2,100),(2,200);
```

Repeatable Read:

```text
A> BEGIN ISOLATION LEVEL REPEATABLE READ;
   BEGIN
B> BEGIN ISOLATION LEVEL REPEATABLE READ;
   BEGIN
A> SELECT SUM(value) FROM mytab WHERE class = 1;
    sum 
     30
   (1 row)
B> SELECT SUM(value) FROM mytab WHERE class = 2;
    sum 
    300
   (1 row)
A> INSERT INTO mytab VALUES (2, 30);
   INSERT 0 1
B> INSERT INTO mytab VALUES (1, 300);
   INSERT 0 1
A> COMMIT;
B> COMMIT;
```

Ikkalasi ham commit qilindi. Lekin natija **hech qanday** ketma-ket tartibga mos emas: A birinchi bo'lsa, B `class = 2` yig'indisini 330 deb ko'rardi; B birinchi bo'lsa — A `class = 1` ni 330 deb. Bu — **serialization anomaly**, aniqrog'i "write skew" (har tranzaksiya boshqasi o'qigan ma'lumotga yozdi). Bitta qator ham ikki marta yangilanmagani uchun Repeatable Read buni sezmaydi.

Xuddi shu — Serializable:

```text
A> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
B> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
A> SELECT SUM(value) FROM mytab WHERE class = 1;
    sum 
     30
   (1 row)
B> SELECT SUM(value) FROM mytab WHERE class = 2;
    sum 
    300
   (1 row)
A> INSERT INTO mytab VALUES (2, 30);
   INSERT 0 1
B> INSERT INTO mytab VALUES (1, 300);
   INSERT 0 1
A> COMMIT;
B> COMMIT;
   ERROR:  could not serialize access due to read/write dependencies among transactions
   DETAIL:  Reason code: Canceled on identification as a pivot, during commit attempt.
   HINT:  The transaction might succeed if retried.
```

A commit qilindi, B — `could not serialize access due to read/write dependencies among transactions` va `HINT: The transaction might succeed if retried.` Hujjatda tasvirlanganidek: bittasi o'tadi, ikkinchisi qaytariladi. B qayta urinsa, `class = 2` yig'indisini 330 deb ko'radi — ketma-ket tartib tiklanadi.

### Read Uncommitted PostgreSQL'da

```text
B> BEGIN;
B> UPDATE hisoblar SET balans = 1 WHERE nom = 'Bobur';
   UPDATE 1
A> BEGIN ISOLATION LEVEL READ UNCOMMITTED;
   BEGIN
A> SELECT balans FROM hisoblar WHERE nom = 'Bobur';
    balans 
       500
   (1 row)
A> COMMIT;
B> ROLLBACK;
```

B `Bobur` ni 1 qildi, lekin commit qilmadi. A `READ UNCOMMITTED` bilan **500** ni ko'rdi — iflos o'qish yo'q, hujjatdagidek Read Committed kabi.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` ning buyruq aks-sadosi va bo'sh qatorlar olib tashlangan.

**Standart — Repeatable Read; `SELECT` snapshot'da, `UPDATE` — eng yangisida:**

```text
A> SELECT @@transaction_isolation;
   +-------------------------+
   | @@transaction_isolation |
   +-------------------------+
   | REPEATABLE-READ         |
   +-------------------------+
   1 row in set (0.000 sec)
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   +--------+
   | balans |
   +--------+
   |   1000 |
   +--------+
   1 row in set (0.001 sec)
B> UPDATE hisoblar SET balans = 700 WHERE nom = 'Aziza';
   Query OK, 1 row affected (0.004 sec)
   Rows matched: 1  Changed: 1  Warnings: 0
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   +--------+
   | balans |
   +--------+
   |   1000 |
   +--------+
   1 row in set (0.001 sec)
A> UPDATE hisoblar SET balans = balans - 100 WHERE nom = 'Aziza';
   Query OK, 1 row affected (0.001 sec)
   Rows matched: 1  Changed: 1  Warnings: 0
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   +--------+
   | balans |
   +--------+
   |    600 |
   +--------+
   1 row in set (0.001 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.002 sec)
```

- `REPEATABLE-READ` — standart.
- B commit qilgach ham A **1000** ni ko'rdi — snapshot.
- A `balans - 100` qildi — natija **600**, ya'ni `700 - 100`: `UPDATE` A ko'rmagan, B commit qilgan qiymat ustidan ishladi. Hujjatdagi qoida — snapshot DML ga taalluqli emas.
- PostgreSQL'da xuddi shu holatda — xato va qayta urinish. MySQL'da xato yo'q, lekin A tranzaksiyasi ichida "1000 edi, 100 ayirdim, 600 bo'ldi" — ilova `SELECT` natijasiga tayanib hisoblasa, xato qiladi.

**Read Uncommitted — iflos o'qish haqiqatda bor:**

```text
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> UPDATE hisoblar SET balans = 1 WHERE nom = 'Bobur';
   Query OK, 1 row affected (0.001 sec)
   Rows matched: 1  Changed: 1  Warnings: 0
A> SET SESSION TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT balans FROM hisoblar WHERE nom = 'Bobur';
   +--------+
   | balans |
   +--------+
   |      1 |
   +--------+
   1 row in set (0.001 sec)
B> ROLLBACK;
   Query OK, 0 rows affected (0.001 sec)
A> SELECT balans FROM hisoblar WHERE nom = 'Bobur';
   +--------+
   | balans |
   +--------+
   |    500 |
   +--------+
   1 row in set (0.000 sec)
```

A B'ning commit qilinmagan `1` ini o'qidi; B `ROLLBACK` qilgach — yana 500. A bir lahza **hech qachon bo'lmagan** qiymatni ko'rdi.

**Write skew — Repeatable Read:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT SUM(value) FROM mytab WHERE class = 1;
   +------------+
   | SUM(value) |
   +------------+
   |         30 |
   +------------+
   1 row in set (0.001 sec)
B> SELECT SUM(value) FROM mytab WHERE class = 2;
   +------------+
   | SUM(value) |
   +------------+
   |        300 |
   +------------+
   1 row in set (0.001 sec)
A> INSERT INTO mytab VALUES (2, 30);
   Query OK, 1 row affected (0.000 sec)
B> INSERT INTO mytab VALUES (1, 300);
   Query OK, 1 row affected (0.000 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.004 sec)
B> COMMIT;
   Query OK, 0 rows affected (0.002 sec)
```

PostgreSQL'dagidek ikkalasi ham commit qilindi — anomaliya.

**Serializable — qulflar bilan:**

```text
A> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
   Query OK, 0 rows affected (0.000 sec)
B> SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;
   Query OK, 0 rows affected (0.000 sec)
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT SUM(value) FROM mytab WHERE class = 1;
   +------------+
   | SUM(value) |
   +------------+
   |         30 |
   +------------+
   1 row in set (0.001 sec)
B> SELECT SUM(value) FROM mytab WHERE class = 2;
   +------------+
   | SUM(value) |
   +------------+
   |        300 |
   +------------+
   1 row in set (0.000 sec)
A> INSERT INTO mytab VALUES (2, 30);
B> INSERT INTO mytab VALUES (1, 300);
   ERROR 1213 (40001) at line 4: Deadlock found when trying to get lock; try restarting transaction
A> COMMIT;
   INSERT INTO mytab VALUES (2, 30)
   Query OK, 1 row affected (1.292 sec)
   Query OK, 0 rows affected (0.003 sec)
B> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
```

Bu yerda boshqa mexanizm: `SELECT` lar `FOR SHARE` ga aylandi (hujjat), ya'ni o'qilgan qatorlar qulflandi.

- A'ning `INSERT` i B'ning qulfini **kutib qoldi** — chiqish keyinroq keldi (`1.292 sec`, skript uni `A> COMMIT;` ostida ko'rsatdi).
- B'ning `INSERT` i A'nikini kutishi kerak edi — ikki tomonlama kutish: `Deadlock found` (40001), InnoDB B'ni qaytardi (54-bob).
- A'ning `INSERT` i shundan keyin bajarildi.

Natija PostgreSQL'dagidek — bittasi o'tdi, ikkinchisi qayta urinishi kerak; lekin PostgreSQL'da kutish yo'q edi (commit paytida tekshiruv), MySQL'da — qulf va deadlock.

### SQLite

WAL rejimi:

```text
A> PRAGMA journal_mode;
   wal
A> BEGIN;
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   1000
B> UPDATE hisoblar SET balans = 700 WHERE nom = 'Aziza';
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   1000
A> UPDATE hisoblar SET balans = balans - 100 WHERE nom = 'Aziza';
   Error near line 5: database is locked
A> ROLLBACK;
A> SELECT balans FROM hisoblar WHERE nom = 'Aziza';
   700
```

- A tranzaksiyasi **1000** ni ko'rdi, B commit qilgandan keyin ham — snapshot izolyatsiyasi.
- A shu eski snapshot ustidan yozmoqchi bo'ldi — `database is locked` (`SQLITE_BUSY_SNAPSHOT` — kengaytirilgan kod; `sqlite3` CLI qisqa xabarni ko'rsatadi). PostgreSQL'ning Repeatable Read xatosiga o'xshash natija: eskirgan ma'lumotga tayanib yozish rad etildi.
- `ROLLBACK` dan keyin — 700.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Standart daraja | Read Committed | Repeatable Read | Serializable |
| Read Uncommitted | = Read Committed (iflos o'qish yo'q) | Iflos o'qish **bor** | Faqat shared cache + `read_uncommitted` |
| Repeatable Read'da boshqa tranzaksiya o'zgartirgan qatorni yangilash | Xato: `could not serialize access due to concurrent update` | Xatosiz, eng yangi qiymat ustidan | — (WAL'da eskirgan snapshot'dan yozish — `SQLITE_BUSY_SNAPSHOT`) |
| Write skew Repeatable Read'da | Bor | Bor | — |
| Serializable mexanizmi | Bog'liqliklarni kuzatish, commit'da xato (40001) | O'qishlarni `FOR SHARE` qulflash, deadlock (40001) | Yozishlarni ketma-ket qilish |
| Darajani o'rnatish | `BEGIN ISOLATION LEVEL …` | `SET [SESSION] TRANSACTION ISOLATION LEVEL …` | — (doim serializable) |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Tranzaksiya ichida o'qigan qiymatga tayanib hisoblash (Read Committed) | Ikkinchi `SELECT` boshqa natija beradi | Repeatable Read yoki `SELECT … FOR UPDATE` (53-bob) |
| PG'da Repeatable Read / Serializable — qayta urinishsiz | `40001` xatosi foydalanuvchiga yetadi | Ilovada qayta urinish sikli (54-bob) |
| MySQL'da Repeatable Read "lost update" dan himoya qiladi deb o'ylash | `UPDATE` eng yangi qiymat ustidan ishlaydi, `SELECT` — eski | `SELECT … FOR UPDATE` yoki `UPDATE … SET x = x - 100` kabi atomar yangilash |
| Write skew'ni Repeatable Read hal qiladi deb o'ylash | Ikkalasi ham commit qilinadi (PG va MySQL'da sinovda) | Serializable yoki aniq qulflar (55-bob) |
| MySQL'da Read Uncommitted | Hech qachon commit qilinmagan qiymatlar o'qiladi | Read Committed yoki undan yuqori |
| Baza almashtirganda standart darajani bir xil deb o'ylash | PG — Read Committed, MySQL — Repeatable Read | Darajani ilovada aniq o'rnatish |

## Amaliyot

1. PostgreSQL'da phantom read'ni sinang: A Read Committed'da `SELECT count(*) FROM hisoblar`, B yangi qator qo'shadi, A qayta sanaydi. Keyin xuddi shuni Repeatable Read'da.
2. MySQL'da 1-misolni `READ COMMITTED` bilan takrorlang. A ning ikkinchi `SELECT` i nimani ko'rsatdi?
3. PostgreSQL'da write skew'ni Repeatable Read'da qoldirib, `SELECT … FOR UPDATE` bilan hal qilib bo'ladimi? `mytab` da nega bu oson emas (yangi qator qo'shilmoqda)?
4. `SHOW transaction_isolation` (PG) va `SELECT @@transaction_isolation` (MySQL) — joriy darajani tekshiring. `ALTER DATABASE … SET default_transaction_isolation` bilan PG'da bazaning standart darajasini o'zgartiring.
5. SQLite'ni `PRAGMA journal_mode = DELETE` ga qaytarib, SQLite misolini takrorlang. B'ning `UPDATE` i nima bo'ldi?

## Rasmiy hujjat

- PostgreSQL — 13.2. Transaction Isolation: <https://www.postgresql.org/docs/18/transaction-iso.html>
- MySQL — 17.7.2.1 Transaction Isolation Levels: <https://dev.mysql.com/doc/refman/9.7/en/innodb-transaction-isolation-levels.html>
- MySQL — 17.7.2.3 Consistent Nonlocking Reads: <https://dev.mysql.com/doc/refman/9.7/en/innodb-consistent-read.html>
- SQLite — Isolation In SQLite: <https://www.sqlite.org/isolation.html>
- SQLite — Result and Error Codes (`SQLITE_BUSY_SNAPSHOT`): <https://www.sqlite.org/rescode.html>
