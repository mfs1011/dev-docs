# 50 — Tranzaksiya

[← Oldingi: To'liq matnli qidiruv](49-toliq-matnli-qidiruv.md) · [Mundarija](README.md)

## Tushuncha

Aziza Boburga 300 so'm o'tkazadi: Aziza hisobidan 300 ayiriladi, Bobur hisobiga 300 qo'shiladi. Ikki `UPDATE`. Birinchisidan keyin server o'chib qolsa-chi? Pul yo'qoladi.

PostgreSQL hujjati (3.4. Transactions): **tranzaksiya** — bir nechta qadamni bitta **"hammasi yoki hech narsa"** (all-or-nothing) amalga birlashtirish. Ikki xossa:

- Qadamlar orasidagi oraliq holatlar **boshqa tranzaksiyalarga ko'rinmaydi**.
- Tranzaksiya oxirigacha yetmasa, uning hech bir qadami bazaga **ta'sir qilmaydi**.

Ochiq tranzaksiyaning o'zgarishlari u tugaguncha boshqalarga ko'rinmaydi, tugagach — **hammasi birdaniga** ko'rinadi.

| Buyruq | Ma'nosi |
| --- | --- |
| `BEGIN` (MySQL'da ham `START TRANSACTION`) | Tranzaksiyani boshlash |
| `COMMIT` | O'zgarishlarni saqlash va boshqalarga ko'rsatish |
| `ROLLBACK` | Barcha o'zgarishlarni bekor qilish |
| `SAVEPOINT nom` | Tranzaksiya ichida nuqta belgilash |
| `ROLLBACK TO nom` | Shu nuqtadan keyingi o'zgarishlarni bekor qilish (tranzaksiya davom etadi) |
| `RELEASE nom` | Nuqtani o'chirish (kerak bo'lmasa) |

### `BEGIN` siz ham tranzaksiya bor

PostgreSQL hujjati: PostgreSQL **har bir SQL operatorini** tranzaksiya ichida bajaradi. `BEGIN` bo'lmasa, har operator atrofida yashirin `BEGIN` va (muvaffaqiyatli bo'lsa) `COMMIT` bor. `BEGIN` va `COMMIT` orasidagi guruh — **tranzaksiya bloki**. Hujjat ogohlantiradi: ba'zi klient kutubxonalari `BEGIN`/`COMMIT` ni o'zi yuboradi — ishlatayotgan interfeysingiz hujjatini tekshiring.

MySQL'da xuddi shu — **autocommit** rejimi (hujjat: 15.3.1 START TRANSACTION, COMMIT, and ROLLBACK): standart holatda yoqilgan, tranzaksiyadan tashqarida har operator `START TRANSACTION` va `COMMIT` bilan o'ralgandek atomar.

### Savepoint

PostgreSQL hujjati: savepoint tranzaksiyaning **bir qismini** bekor qilib, qolganini saqlash imkonini beradi. `ROLLBACK TO` dan keyin savepoint saqlanib qoladi — unga bir necha marta qaytish mumkin. Savepoint'ni `RELEASE` qilish yoki unga qaytish undan **keyin** belgilangan barcha savepoint'larni ham o'chiradi.

### Tranzaksiya ichida xato bo'lsa

Bu yerda bazalar **turlicha** ishlaydi — bobning eng muhim joyi:

| Baza | Bitta operator xato bersa |
| --- | --- |
| PostgreSQL | Butun tranzaksiya **buzilgan** (aborted) holatga o'tadi: keyingi barcha buyruqlar rad etiladi, faqat `ROLLBACK` mumkin |
| MySQL (InnoDB) | Hujjat (17.20.5 InnoDB Error Handling): InnoDB ba'zan faqat **xato bergan operatorni** bekor qiladi, ba'zan butun tranzaksiyani. Masalan, takror kalit xatosi — faqat operator. Tranzaksiya **davom etadi** |
| SQLite | Hujjat (ON CONFLICT): standart `ABORT` — joriy operator o'zgarishlari bekor qilinadi, oldingi operatorlarniki **saqlanadi**, tranzaksiya faol qoladi. Hujjatga ko'ra bu SQL standartida belgilangan xatti-harakat |

MySQL va SQLite'da xato bergan operatordan keyin `COMMIT` qilinsa, **qolgan** o'zgarishlar saqlanadi. Shuning uchun ilova xatoni o'zi ushlab, `ROLLBACK` qilishi kerak (pastda — "yo'qdan paydo bo'lgan" pul).

### MySQL: yashirin commit va bekor qilib bo'lmaydigan buyruqlar

MySQL hujjati (15.3.3 Statements That Cause an Implicit Commit): ba'zi operatorlar joriy tranzaksiyani **yashirin tugatadi** — xuddi ulardan oldin `COMMIT` qilingandek. Asosan DDL: `CREATE TABLE`, `ALTER TABLE`, `DROP …` va boshqalar. Hujjat (15.3.2 Statements That Cannot Be Rolled Back): DDL operatorlari (bazalar, jadvallar, saqlanadigan protseduralarni yaratish, o'chirish, o'zgartirish) **bekor qilinmaydi** — tranzaksiyalarni ularni o'z ichiga olmaydigan qilib loyihalash kerak.

PostgreSQL'da esa `CREATE TABLE` ham tranzaksiya ichida bekor qilinadi (pastda, kuzatildi).

### SQLite: `DEFERRED`, `IMMEDIATE`, `EXCLUSIVE`

SQLite hujjati (BEGIN TRANSACTION, 2.2):

| Tur | Qachon qulf olinadi |
| --- | --- |
| `DEFERRED` (standart) | Bazaga birinchi murojaatda. `SELECT` — o'qish tranzaksiyasi; keyingi yozish uni yozishga ko'taradi **yoki `SQLITE_BUSY`** qaytaradi |
| `IMMEDIATE` | Darhol yozish tranzaksiyasi. Boshqa ulanishda yozish tranzaksiyasi bo'lsa — `SQLITE_BUSY` |
| `EXCLUSIVE` | `IMMEDIATE` kabi; WAL rejimida ular bir xil, boshqa jurnal rejimlarida boshqa ulanishlarga **o'qishni ham** taqiqlaydi |

SQLite'da bir vaqtda faqat **bitta** yozuvchi bo'ladi: hujjatga ko'ra (File Locking And Concurrency) bir vaqtda faqat bitta `RESERVED` qulf faol bo'lishi mumkin, WAL rejimida ham — WAL fayli bitta bo'lgani uchun yozuvchi bitta (53-bob). Yozadigan tranzaksiyani `BEGIN IMMEDIATE` bilan boshlash — `SQLITE_BUSY` ni tranzaksiya o'rtasida emas, **boshida** olish.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. Chiqishlarda buyruqlar `psql -e` bilan ko'rsatilgan.

Uch hisob, balans manfiy bo'lolmaydi:

```sql
CREATE TABLE hisoblar (nom text PRIMARY KEY, balans int NOT NULL CHECK (balans >= 0));
INSERT INTO hisoblar VALUES ('Aziza', 1000), ('Bobur', 500), ('Dilshod', 0);
```

### `ROLLBACK`

```text
BEGIN;
BEGIN
UPDATE hisoblar SET balans = balans - 300 WHERE nom = 'Aziza';
UPDATE 1
UPDATE hisoblar SET balans = balans + 300 WHERE nom = 'Bobur';
UPDATE 1
SELECT * FROM hisoblar ORDER BY nom;
   nom   | balans 
---------+--------
 Aziza   |    700
 Bobur   |    800
 Dilshod |      0
(3 rows)

ROLLBACK;
ROLLBACK
SELECT * FROM hisoblar ORDER BY nom;
   nom   | balans 
---------+--------
 Aziza   |   1000
 Bobur   |    500
 Dilshod |      0
(3 rows)
```

Tranzaksiya ichida o'zgarishlar **o'zimizga** ko'rinadi (700, 800); `ROLLBACK` dan keyin — hammasi eski holatda.

### Boshqa seans nimani ko'radi

Seans A: `BEGIN`, Aziza balansini 0 qiladi, 2 soniya kutadi, `COMMIT`. Seans B shu orada (1-soniyada) va `COMMIT` dan keyin o'qiydi:

```text
A: yangilandi|0

        seans        | balans 
---------------------+--------
 B: COMMIT dan oldin |    900

        seans        | balans 
---------------------+--------
 B: COMMIT dan keyin |      0
```

A o'zi 0 ni ko'radi, B esa `COMMIT` gacha **eski qiymatni** (900) — hujjatdagi "oraliq holat boshqalarga ko'rinmaydi". Bu qanday ishlashi — 52-bob (MVCC).

### Xato: tranzaksiya buzildi

Aziza 300 o'tkazadi, Bobur — 900 (unda faqat 500 bor), Dilshod 300 oladi:

```text
BEGIN;
BEGIN
UPDATE hisoblar SET balans = balans - 300 WHERE nom = 'Aziza';
UPDATE 1
UPDATE hisoblar SET balans = balans - 900 WHERE nom = 'Bobur';
psql:pg1.sql:14: ERROR:  new row for relation "hisoblar" violates check constraint "hisoblar_balans_check"
DETAIL:  Failing row contains (Bobur, -400).
UPDATE hisoblar SET balans = balans + 300 WHERE nom = 'Dilshod';
psql:pg1.sql:15: ERROR:  current transaction is aborted, commands ignored until end of transaction block
COMMIT;
ROLLBACK
SELECT * FROM hisoblar ORDER BY nom;
   nom   | balans 
---------+--------
 Aziza   |   1000
 Bobur   |    500
 Dilshod |      0
(3 rows)
```

- `CHECK` xatosidan keyin keyingi `UPDATE` **bajarilmadi**: `current transaction is aborted, commands ignored until end of transaction block`.
- `COMMIT` ga server **`ROLLBACK`** deb javob berdi (kuzatildi): buzilgan tranzaksiyani saqlab bo'lmaydi.
- Natija — hech narsa o'zgarmagan. "Hammasi yoki hech narsa" — aynan shu.

### Savepoint

```text
BEGIN;
BEGIN
UPDATE hisoblar SET balans = balans - 100 WHERE nom = 'Aziza';
UPDATE 1
UPDATE hisoblar SET balans = balans + 100 WHERE nom = 'Bobur';
UPDATE 1
SAVEPOINT tekshiruv;
SAVEPOINT
UPDATE hisoblar SET balans = balans + 100 WHERE nom = 'Dilshod';
UPDATE 1
ROLLBACK TO tekshiruv;
ROLLBACK
COMMIT;
COMMIT
SELECT * FROM hisoblar ORDER BY nom;
   nom   | balans 
---------+--------
 Aziza   |    900
 Bobur   |    600
 Dilshod |      0
(3 rows)
```

`ROLLBACK TO tekshiruv` faqat Dilshod'ga qo'shilgan 100 ni bekor qildi; savepoint'dan oldingi Aziza → Bobur o'tkazmasi `COMMIT` bilan saqlandi.

Savepoint **xatodan keyin** ham ishlaydi — xato bergan qismni bekor qilib, tranzaksiyani davom ettirish mumkin (Aziza balansi bu paytda 0 — oldingi sinovdan):

```text
BEGIN;
BEGIN
UPDATE hisoblar SET balans = balans - 50 WHERE nom = 'Bobur';
UPDATE 1
SAVEPOINT bobur;
SAVEPOINT
UPDATE hisoblar SET balans = balans - 900 WHERE nom = 'Bobur';
psql:pg2.sql:4: ERROR:  new row for relation "hisoblar" violates check constraint "hisoblar_balans_check"
DETAIL:  Failing row contains (Bobur, -350).
ROLLBACK TO bobur;
ROLLBACK
UPDATE hisoblar SET balans = balans + 50 WHERE nom = 'Dilshod';
UPDATE 1
COMMIT;
COMMIT
SELECT * FROM hisoblar ORDER BY nom;
   nom   | balans 
---------+--------
 Aziza   |      0
 Bobur   |    550
 Dilshod |     50
(3 rows)
```

`CHECK` xatosidan keyin `ROLLBACK TO bobur` tranzaksiyani buzilgan holatdan chiqardi: keyingi `UPDATE` bajarildi, `COMMIT` — `COMMIT` (`ROLLBACK` emas). Savepoint'gacha bo'lgan `- 50` ham saqlandi.

### DDL tranzaksiya ichida

```text
BEGIN;
BEGIN
CREATE TABLE vaqtinchalik (x int);
CREATE TABLE
INSERT INTO vaqtinchalik VALUES (1);
INSERT 0 1
ROLLBACK;
ROLLBACK
SELECT * FROM vaqtinchalik;
psql:pg1.sql:32: ERROR:  relation "vaqtinchalik" does not exist
LINE 1: SELECT * FROM vaqtinchalik;
                      ^
```

PostgreSQL'da `CREATE TABLE` ham bekor qilindi (kuzatildi) — migratsiyani bitta tranzaksiyada bajarish mumkin: yarmida xato bo'lsa, sxema yarim o'zgargan holda qolmaydi (63-bob). MySQL'da — boshqacha (pastda).

## Dialektlar

### MySQL

**Autocommit va `ROLLBACK`:**

```text
SELECT @@autocommit
+--------------+
| @@autocommit |
+--------------+
|            1 |
+--------------+
START TRANSACTION
Query OK, 0 rows affected (0.000 sec)
UPDATE hisoblar SET balans = balans - 300 WHERE nom = 'Aziza'
Query OK, 1 row affected (0.000 sec)
ROLLBACK
Query OK, 0 rows affected (0.000 sec)
SELECT * FROM hisoblar ORDER BY nom
+---------+--------+
| nom     | balans |
+---------+--------+
| Aziza   |   1000 |
| Bobur   |    500 |
| Dilshod |      0 |
+---------+--------+
```

**Xato — tranzaksiya davom etadi.** PostgreSQL'dagi aynan o'sha o'tkazma:

```text
START TRANSACTION
Query OK, 0 rows affected (0.000 sec)
UPDATE hisoblar SET balans = balans - 300 WHERE nom = 'Aziza'
Query OK, 1 row affected (0.000 sec)
UPDATE hisoblar SET balans = balans - 900 WHERE nom = 'Bobur'
ERROR 3819 (HY000) at line 13: Check constraint 'hisoblar_chk_1' is violated.
UPDATE hisoblar SET balans = balans + 300 WHERE nom = 'Dilshod'
Query OK, 1 row affected (0.000 sec)
COMMIT
Query OK, 0 rows affected (0.001 sec)
SELECT * FROM hisoblar ORDER BY nom
+---------+--------+
| nom     | balans |
+---------+--------+
| Aziza   |    700 |
| Bobur   |    500 |
| Dilshod |    300 |
+---------+--------+
```

(`mysql --force -vvv` bilan — xatodan keyin skript to'xtamaydi, ilova xatoni ushlamagandek. Xato xabari `stderr` ga chiqadi; bu yerda u xatoni bergan operator ostiga qo'yilgan, chiqishdagi `Rows matched` va `rows in set` qatorlari qisqartirilgan.) Faqat Boburning `UPDATE` i bekor qilindi; Aziza'dan 300 yechildi, Dilshod 300 oldi va `COMMIT` buni **saqladi**. Jami pul 1500 edi — endi 1500, lekin Bobur hech narsa bermagan, Aziza esa bergan: hisob-kitob buzildi. Ilova xatoni ko'rib, `ROLLBACK` qilishi shart edi.

**Yashirin commit:**

```text
START TRANSACTION
Query OK, 0 rows affected (0.000 sec)
UPDATE hisoblar SET balans = balans + 1 WHERE nom = 'Dilshod'
Query OK, 1 row affected (0.000 sec)
CREATE TABLE jurnal (x int)
Query OK, 0 rows affected (0.004 sec)
ROLLBACK
Query OK, 0 rows affected (0.000 sec)
SELECT * FROM hisoblar ORDER BY nom
+---------+--------+
| nom     | balans |
+---------+--------+
| Aziza   |    700 |
| Bobur   |    500 |
| Dilshod |    301 |
+---------+--------+
SHOW TABLES
+-----------------+
| Tables_in_sinov |
+-----------------+
| hisoblar        |
| jurnal          |
+-----------------+
```

`ROLLBACK` hech narsani bekor qilmadi: `CREATE TABLE` undan oldin tranzaksiyani **yashirin commit** qilgan edi — `Dilshod` 301, `jurnal` jadvali bor. Hujjatdagi qoida: tranzaksiyaga DDL qo'shmang.

### SQLite

**Xato — SQLite ham davom etadi** (standart `ABORT`):

```sql
BEGIN;
UPDATE hisoblar SET balans = balans - 300 WHERE nom = 'Aziza';
UPDATE hisoblar SET balans = balans - 900 WHERE nom = 'Bobur';
UPDATE hisoblar SET balans = balans + 300 WHERE nom = 'Dilshod';
COMMIT;
SELECT * FROM hisoblar ORDER BY nom;
```

```text
Error near line 6: CHECK constraint failed: balans >= 0
Aziza|700
Bobur|500
Dilshod|300
```

MySQL bilan bir xil natija: xato bergan operator bekor qilindi, qolganlari saqlandi.

**`BEGIN IMMEDIATE` va ikkinchi ulanish.** Ulanish A: `BEGIN IMMEDIATE`, `UPDATE`, 3 soniya kutadi, `COMMIT`. Ulanish B 1-soniyada:

```text
-- B: o'qish
300
-- B: BEGIN IMMEDIATE
Error near line 4: database is locked
-- B: DEFERRED + yozish
300
Error near line 8: database is locked
```

- O'qish ishladi — A hali commit qilmagan, B **eski** qiymatni (300) ko'rdi (jurnal rejimi — `delete`).
- `BEGIN IMMEDIATE` — darhol `database is locked` (`SQLITE_BUSY`): A yozish tranzaksiyasini ushlab turibdi.
- `DEFERRED` (oddiy `BEGIN`): `SELECT` ishladi, lekin `UPDATE` da — o'sha xato. Hujjatdagi holat: o'qish tranzaksiyasini yozishga ko'tarib bo'lmadi.

A tugagach — `301`. Haqiqiy ilovada `SQLITE_BUSY` ni kutish uchun `busy_timeout` beriladi (53-bob).

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Boshlash | `BEGIN` / `START TRANSACTION` | `START TRANSACTION` / `BEGIN` | `BEGIN [DEFERRED / IMMEDIATE / EXCLUSIVE]` |
| `BEGIN` siz | Har operator — alohida tranzaksiya | `autocommit = 1` — xuddi shunday | Autocommit — xuddi shunday |
| Operator xatosi | Tranzaksiya buzildi, faqat `ROLLBACK` | Ko'pincha faqat operator bekor qilinadi, tranzaksiya davom etadi | Operator bekor qilinadi (`ABORT`), tranzaksiya davom etadi |
| Buzilgan tranzaksiyada `COMMIT` | `ROLLBACK` bo'ladi (kuzatildi) | — (buzilgan holat yo'q) | — |
| `SAVEPOINT` | Bor | Bor | Bor |
| DDL tranzaksiyada | Bekor qilinadi (kuzatildi) | Yashirin commit, bekor qilinmaydi | — |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bog'liq o'zgarishlarni tranzaksiyasiz bajarish | Ikkinchi operatordan oldin uzilish — yarim holat | `BEGIN … COMMIT` |
| MySQL/SQLite'da xatodan keyin ham `COMMIT` | Qolgan operatorlar saqlanadi — yarim o'tkazma (sinovda) | Har xatoda `ROLLBACK` (ilova kodida `try`/`catch`) |
| PostgreSQL'da xatodan keyin buyruqlarni davom ettirish | `current transaction is aborted` | `ROLLBACK` yoki savepoint'ga qaytish |
| MySQL tranzaksiyasida `CREATE`/`ALTER` | Yashirin commit — `ROLLBACK` ishlamaydi | DDL'ni tranzaksiyadan tashqarida |
| Tranzaksiyani uzoq ochiq qoldirish (foydalanuvchi javobini kutib) | Qulflar va eski qator versiyalari ushlanadi (52–53-, 65-boblar) | Tranzaksiya — qisqa, faqat SQL ishlari |
| SQLite'da yozadigan tranzaksiyani oddiy `BEGIN` bilan | Yozishda kutilmagan `SQLITE_BUSY` | `BEGIN IMMEDIATE` |
| ORM/kutubxona tranzaksiya ochadimi — bilmaslik | PG hujjati: ba'zi kutubxonalar `BEGIN`/`COMMIT` ni o'zi yuboradi | Kutubxona hujjatini tekshirish (68-bob) |

## Amaliyot

1. MySQL'da xatoli o'tkazmani savepoint bilan qayta yozing: xatodan keyin `ROLLBACK TO`. Natija PostgreSQL'dagidan farq qiladimi?
2. Savepoint'ni `RELEASE` qilib, keyin `ROLLBACK TO` qiling. Qanday xato chiqdi?
3. MySQL'da `SET autocommit = 0` qilib, `UPDATE` dan keyin ulanishni `COMMIT` siz yoping. Qayta ulanib, o'zgarish saqlandimi tekshiring.
4. MySQL'da `TRUNCATE TABLE` tranzaksiya ichida `ROLLBACK` qilinadimi? Hujjatdagi 15.3.3 ro'yxatida bormi?
5. SQLite'da A ulanishni `BEGIN EXCLUSIVE` bilan oching. B o'qiy oladimi? `PRAGMA journal_mode = WAL` dan keyin-chi?

## Rasmiy hujjat

- PostgreSQL — 3.4. Transactions: <https://www.postgresql.org/docs/18/tutorial-transactions.html>
- PostgreSQL — BEGIN: <https://www.postgresql.org/docs/18/sql-begin.html> · SAVEPOINT: <https://www.postgresql.org/docs/18/sql-savepoint.html>
- MySQL — 15.3.1 START TRANSACTION, COMMIT, and ROLLBACK Statements: <https://dev.mysql.com/doc/refman/9.7/en/commit.html>
- MySQL — 15.3.2 Statements That Cannot Be Rolled Back: <https://dev.mysql.com/doc/refman/9.7/en/cannot-roll-back.html>
- MySQL — 15.3.3 Statements That Cause an Implicit Commit: <https://dev.mysql.com/doc/refman/9.7/en/implicit-commit.html>
- MySQL — 17.20.5 InnoDB Error Handling: <https://dev.mysql.com/doc/refman/9.7/en/innodb-error-handling.html>
- SQLite — BEGIN TRANSACTION: <https://www.sqlite.org/lang_transaction.html>
- SQLite — The ON CONFLICT Clause: <https://www.sqlite.org/lang_conflict.html>
- SQLite — File Locking And Concurrency In SQLite Version 3: <https://www.sqlite.org/lockingv3.html> · Write-Ahead Logging: <https://www.sqlite.org/wal.html>
