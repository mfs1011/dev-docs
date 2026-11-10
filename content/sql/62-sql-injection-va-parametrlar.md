# 62 — SQL injection va parametrlar

[← Oldingi: Row Level Security (PG)](61-row-level-security.md) · [Mundarija](README.md) · [Keyingi: Sxemani xavfsiz o'zgartirish →](63-sxemani-xavfsiz-ozgartirish.md)

## Tushuncha

**SQL injection** — ilova SQL so'rovini foydalanuvchi kiritgan matnni qo'shib yasaganda, hujumchi o'sha matn orqali so'rovning ma'nosini o'zgartirishi. PHP qo'llanmasi (SQL Injection) bo'yicha hujumchi shu yo'l bilan ilovaning yopiq qismlariga kirishi, bazadagi hamma ma'lumotni olishi, ma'lumotni buzishi, ba'zi serverlarda esa operatsion tizim buyruqlarini ham bajarishi mumkin. Zaiflik dasturchi qiymatni SQL matni ichiga **qo'shib** (konkatenatsiya) yozganda paydo bo'ladi.

MySQL qo'llanmasi (8.1.7 Client Programming Security Guidelines) ham shuni aytadi: ilova foydalanuvchi kiritgan hech bir ma'lumotga ishonmasligi kerak, faqat matnni emas, **sonlarni** ham tekshirish kerak.

Himoyaning asosi — **parametrli so'rov** (prepared statement): SQL matni o'zgarmaydi, qiymatlar esa undan **alohida** yuboriladi va baza ularni hech qachon SQL kodi deb o'qimaydi.

| Usul | Qayerda | Nima beradi |
| --- | --- | --- |
| Parametrli so'rov | `pg_query_params`, PDO `prepare`, `PREPARE … EXECUTE`, PL/pgSQL `EXECUTE … USING` | Qiymat SQL kodiga aylanmaydi |
| Ruxsat ro'yxati | Jadval yoki ustun nomi, `ORDER BY` yo'nalishi | Parametr bilan bog'lab bo'lmaydigan qismlar faqat ma'lum qiymatlardan tanlanadi |
| `format('%I', …)`, `quote_ident` | PG dinamik SQL'idagi identifikatorlar | Nom qo'shtirnoqqa olinadi — kod emas, nom bo'lib qoladi |
| Eng kam huquq | Ilova ulanadigan rol | Hujum o'tib ketsa ham zarari cheklanadi |

PHP qo'llanmasi muhim cheklovni ta'kidlaydi: parametr bog'lash **faqat ma'lumot** uchun ishlaydi; so'rovning boshqa dinamik qismlari ruxsat etilgan qiymatlar ro'yxati bo'yicha tekshirilishi kerak.

## Kod

PostgreSQL 18.6, alohida `hujum` bazasi. PHP 8.5.11 (`pgsql` va `pdo_pgsql` kengaytmalari) — Symfony va Laravel ham PHP'da, ular ham PDO ustida ishlaydi.

```sql
CREATE ROLE dokon_egasi LOGIN;   -- jadvallar egasi
CREATE ROLE ilova LOGIN;          -- faqat kerakli huquq bilan
CREATE DATABASE hujum OWNER dokon_egasi;
-- hujum bazasida (pgcrypto — parol xeshi uchun crypt())
CREATE EXTENSION pgcrypto;
CREATE TABLE mahsulotlar (id int PRIMARY KEY, nomi text NOT NULL, narx int NOT NULL);
INSERT INTO mahsulotlar VALUES (1, 'olma', 12000), (2, 'non', 5000), (3, 'sut', 9000);
CREATE TABLE foydalanuvchilar (id int PRIMARY KEY, login text UNIQUE NOT NULL, parol_xesh text NOT NULL, rol text NOT NULL DEFAULT 'mijoz');
INSERT INTO foydalanuvchilar VALUES
  (1, 'admin', crypt('Kuchli-Parol-2026', gen_salt('bf')), 'admin'),
  (2, 'ali', crypt('ali-parol', gen_salt('bf')), 'mijoz'),
  (3, 'hujumchi', crypt('12345', gen_salt('bf')), 'mijoz');
GRANT SELECT ON mahsulotlar TO ilova;
```

Hamma skriptlar ulanishni bitta fayldan oladi (rol — `DB_USER` muhit o'zgaruvchisidan):

```php
<?php
ini_set('log_errors', '0'); // xato faqat bir marta ko'rinsin
// Ulanish: rol DB_USER muhit o'zgaruvchisidan (standart — jadvallar egasi)
$db = pg_connect('dbname=hujum user=' . (getenv('DB_USER') ?: 'dokon_egasi'));

function chiqar($natija): void {
    if ($natija === false) return;
    while ($qator = pg_fetch_row($natija)) echo implode(' | ', $qator), "\n";
}
```

### Hujum 1: `' OR '1'='1` — hamma qator

Zaif qidiruv (`qidir.php`): mahsulot nomi to'g'ridan-to'g'ri SQL ichiga qo'yiladi. Skript yasalgan SQL'ni ham chiqaradi:

```php
<?php
require 'ulanish.php';
// ZAIF: foydalanuvchi kiritgan matn SQL ichiga qo'shiladi
$nom = $argv[1];
$sql = "SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = '$nom'";
echo "SQL: $sql\n";
chiqar(pg_query($db, $sql));
```

```text
$ php qidir.php olma
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = 'olma'
1 | olma | 12000
$ php qidir.php "x' OR '1'='1"
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = 'x' OR '1'='1'
1 | olma | 12000
2 | non | 5000
3 | sut | 9000
```

Kiritilgan `'` qo'shtirnoq satrni yopdi, qolgan qismi esa endi SQL **kodi**: `OR '1'='1'` har qatorda rost.

### Hujum 2: `UNION` — boshqa jadvalni o'qish

PHP qo'llanmasining 2-misoli: so'rov oxiriga `UNION SELECT` qo'shilib, boshqa jadval o'qiladi. `--` — SQL izohi: dasturchi yozgan qolgan qismni o'chiradi.

```text
$ php qidir.php "x' UNION SELECT id, login || ' ' || parol_xesh, 0 FROM foydalanuvchilar --"
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = 'x' UNION SELECT id, login || ' ' || parol_xesh, 0 FROM foydalanuvchilar --'
3 | hujumchi $2a$06$lcp1mLLBBIoleP/PLDI9duSU6.y.UWsUMT7sNwbF3Qo81JMhC9VfS | 0
2 | ali $2a$06$j7NykiFlpYU6NEqA8NCEAuKMM97XgtXnfO/2x024Ru77PX2MOJC6W | 0
1 | admin $2a$06$E7ySjPpyCEOqv2QLMgci1eonf9iPyPcFRQL39WWgprJxugrymRuvy | 0
```

Mahsulot qidiruvi orqali barcha foydalanuvchilarning login va parol xeshlari chiqdi.

### Hujum 3: `admin' --` — parolsiz kirish

```php
<?php
require 'ulanish.php';
// ZAIF: login va parol SQL ichiga qo'shiladi
[, $login, $parol] = $argv;
$sql = "SELECT login, rol FROM foydalanuvchilar
        WHERE login = '$login' AND parol_xesh = crypt('$parol', parol_xesh)";
echo "SQL: $sql\n";
$q = pg_fetch_row(pg_query($db, $sql));
echo $q ? "Kirdingiz: $q[0] ($q[1])\n" : "Login yoki parol noto'g'ri\n";
```

```text
$ php kirish.php admin notogri
SQL: SELECT login, rol FROM foydalanuvchilar
        WHERE login = 'admin' AND parol_xesh = crypt('notogri', parol_xesh)
Login yoki parol noto'g'ri
$ php kirish.php "admin' --" ''
SQL: SELECT login, rol FROM foydalanuvchilar
        WHERE login = 'admin' --' AND parol_xesh = crypt('', parol_xesh)
Kirdingiz: admin (admin)
```

`--` dan keyingi hamma narsa — izoh, ya'ni parol tekshiruvi butunlay o'chib ketdi.

### Hujum 4: son ham xavfli

"Bu baribir son" deb qo'shtirnoqsiz qo'shilgan qiymat — MySQL qo'llanmasidagi misol (`234 OR 1=1`):

```php
$id = $argv[1];
$sql = "SELECT id, nomi, narx FROM mahsulotlar WHERE id = $id";
```

```text
$ php mahsulot.php 2
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE id = 2
2 | non | 5000
$ php mahsulot.php '2 OR 1=1'
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE id = 2 OR 1=1
1 | olma | 12000
2 | non | 5000
3 | sut | 9000
```

### Hujum 5: `;` — ikkinchi buyruq

PHP qo'llanmasining 1-misoli — sahifalashdagi `OFFSET`. libpq hujjatiga ko'ra `PQexec` (PHP'da `pg_query`) bitta satrda nuqta-vergul bilan ajratilgan **bir nechta** buyruqni bajaradi:

```php
$offset = $argv[1];
$sql = "SELECT id, nomi FROM mahsulotlar ORDER BY id LIMIT 2 OFFSET $offset";
```

```text
$ php sahifa.php 0
SQL: SELECT id, nomi FROM mahsulotlar ORDER BY id LIMIT 2 OFFSET 0
1 | olma
2 | non
$ php sahifa.php "0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'hujumchi'"
SQL: SELECT id, nomi FROM mahsulotlar ORDER BY id LIMIT 2 OFFSET 0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'hujumchi'
$ psql -U dokon_egasi -d hujum -tAc "SELECT login, rol FROM foydalanuvchilar WHERE login = 'hujumchi'"
hujumchi|admin
```

Sahifa raqami o'rniga yuborilgan matn hujumchini admin qildi. Ilova hech qanday xato ko'rmadi.

### Himoya: parametrli so'rov

`pg_query_params` — PHP qo'llanmasi bo'yicha uning asosiy afzalligi: qiymatlar so'rov matnidan **alohida** yuboriladi, qo'shtirnoqlarni qo'lda qochirish (escaping) kerak bo'lmaydi.

```php
<?php
require 'ulanish.php';
// XAVFSIZ: SQL matni o'zgarmaydi, qiymat alohida ($1) yuboriladi
$nom = $argv[1];
chiqar(pg_query_params($db, 'SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = $1', [$nom]));
```

```text
$ php qidir_xavfsiz.php olma
1 | olma | 12000
$ php qidir_xavfsiz.php "x' OR '1'='1"
$ php sahifa_xavfsiz.php "0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'ali'"

Warning: pg_query_params(): Query failed: ERROR:  invalid input syntax for type bigint: "0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'ali'"
CONTEXT:  unnamed portal parameter $1 = '...' in /Users/mfsv/Projects/experiment/sql-sinov/62/sahifa_xavfsiz.php on line 4
```

- `x' OR '1'='1` endi shunchaki **nom**: bunday mahsulot yo'q — bo'sh natija.
- `OFFSET $1` ga yuborilgan matn son emas — baza uni ma'lumot sifatida tekshirib, rad etdi (`sahifa_xavfsiz.php` — `OFFSET $1` bilan).

libpq hujjatida yana bir himoya qatlami bor: `PQexecParams` (`pg_query_params`) bitta satrda **ko'pi bilan bitta** buyruqni qabul qiladi — bu "SQL injection hujumlariga qarshi qo'shimcha himoya". Hatto matn qo'shib yasalgan bo'lsa ham (`sahifa2.php` — xuddi `sahifa.php` dek qo'shilgan, lekin `pg_query_params($db, $sql, [])` bilan yuborilgan):

```text
$ php sahifa2.php "0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'ali'"

Warning: pg_query_params(): Query failed: ERROR:  cannot insert multiple commands into a prepared statement in /Users/mfsv/Projects/experiment/sql-sinov/62/sahifa2.php on line 5
```

Bu faqat ikkinchi buyruqni to'xtatadi — 1–4-hujumlar bitta buyruq ichida bo'lgani uchun baribir ishlaydi. Asosiy himoya — qiymatni qo'shmaslik.

PDO bilan xuddi shu (PHP qo'llanmasi "Avoidance Techniques" bo'limida PDO prepared statement'ni tavsiya qiladi):

```php
<?php
// XAVFSIZ: PDO prepared statement (Laravel va Doctrine ham PDO ustida ishlaydi)
$pdo = new PDO('pgsql:dbname=hujum', 'dokon_egasi', null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
[, $login, $parol] = $argv;
$st = $pdo->prepare('SELECT login, rol FROM foydalanuvchilar
                     WHERE login = ? AND parol_xesh = crypt(?, parol_xesh)');
$st->execute([$login, $parol]);
$q = $st->fetch(PDO::FETCH_NUM);
echo $q ? "Kirdingiz: $q[0] ($q[1])\n" : "Login yoki parol noto'g'ri\n";
```

```text
$ php kirish_pdo.php "admin' --" ''
Login yoki parol noto'g'ri
$ php kirish_pdo.php admin Kuchli-Parol-2026
Kirdingiz: admin (admin)
```

### Parametr — faqat qiymat: `ORDER BY` va jadval nomi

SQL buyrug'i darajasida ham xuddi shu: `PREPARE` (PG hujjati) — parametrlar `$1`, `$2`… bilan, qiymatlar `EXECUTE` da beriladi.

```text
PREPARE qidiruv(text) AS SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = $1;
PREPARE
EXECUTE qidiruv('non');
 id | nomi | narx 
----+------+------
  2 | non  | 5000
(1 row)

EXECUTE qidiruv($$x' OR '1'='1$$);
 id | nomi | narx 
----+------+------
(0 rows)

PREPARE saralash(text) AS SELECT nomi, narx FROM mahsulotlar ORDER BY $1;
PREPARE
EXECUTE saralash('narx');
 nomi | narx  
------+-------
 olma | 12000
 non  |  5000
 sut  |  9000
(3 rows)
```

`ORDER BY $1` xato bermadi, lekin narx bo'yicha **saralamadi**: `$1` — ustun nomi emas, `'narx'` degan **qiymat**, hamma qatorda bir xil. PG hujjati (SQL funksiyalari) ham shuni aytadi: argumentlar faqat ma'lumot qiymati bo'la oladi, identifikator (nom) emas. Shuning uchun nom — ruxsat ro'yxatidan (PHP qo'llanmasidagi 5-misol kabi):

```php
$ustun = $argv[1];
// Ustun nomini parametr qilib bo'lmaydi — faqat ruxsat etilgan ro'yxatdan
$ruxsat = ['nomi', 'narx'];
if (!in_array($ustun, $ruxsat, true)) exit("Noto'g'ri ustun: $ustun\n");
chiqar(pg_query($db, "SELECT id, nomi, narx FROM mahsulotlar ORDER BY $ustun"));
```

```text
$ php saralash.php narx
2 | non | 5000
3 | sut | 9000
1 | olma | 12000
$ php saralash.php 'narx; DROP TABLE mahsulotlar'
Noto'g'ri ustun: narx; DROP TABLE mahsulotlar
```

### Baza ichidagi dinamik SQL (PL/pgSQL)

Injection faqat ilovada emas: PL/pgSQL funksiyasi ham `EXECUTE` bilan SQL matnini yasashi mumkin.

```sql
CREATE FUNCTION topish_zaif(p_nom text) RETURNS SETOF mahsulotlar LANGUAGE plpgsql AS $f$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM mahsulotlar WHERE nomi = ''' || p_nom || '''';
END $f$;
CREATE FUNCTION topish(p_nom text) RETURNS SETOF mahsulotlar LANGUAGE plpgsql AS $f$
BEGIN
  RETURN QUERY EXECUTE 'SELECT * FROM mahsulotlar WHERE nomi = $1' USING p_nom;
END $f$;
CREATE FUNCTION sanash(p_jadval text) RETURNS bigint LANGUAGE plpgsql AS $f$
DECLARE n bigint;
BEGIN
  EXECUTE format('SELECT count(*) FROM %I', p_jadval) INTO n;
  RETURN n;
END $f$;
```

```text
SELECT * FROM topish_zaif('olma');
 id | nomi | narx  
----+------+-------
  1 | olma | 12000
(1 row)

SELECT * FROM topish_zaif($$x' OR '1'='1$$);
 id | nomi | narx  
----+------+-------
  1 | olma | 12000
  2 | non  |  5000
  3 | sut  |  9000
(3 rows)

SELECT * FROM topish($$x' OR '1'='1$$);
 id | nomi | narx 
----+------+------
(0 rows)

SELECT * FROM topish('olma');
 id | nomi | narx  
----+------+-------
  1 | olma | 12000
(1 row)

SELECT sanash('mahsulotlar');
 sanash 
--------
      3
(1 row)

SELECT sanash('mahsulotlar; DROP TABLE mahsulotlar');
ERROR:  relation "mahsulotlar; DROP TABLE mahsulotlar" does not exist
LINE 1: SELECT count(*) FROM "mahsulotlar; DROP TABLE mahsulotlar"
                             ^
QUERY:  SELECT count(*) FROM "mahsulotlar; DROP TABLE mahsulotlar"
CONTEXT:  PL/pgSQL function sanash(text) line 4 at EXECUTE
SELECT format('SELECT count(*) FROM %I WHERE nomi = %L', 'Mahsulotlar', $$x' OR '1'='1$$);
                               format                               
--------------------------------------------------------------------
 SELECT count(*) FROM "Mahsulotlar" WHERE nomi = 'x'' OR ''1''=''1'
(1 row)
```

PG hujjati (PL/pgSQL, Executing Dynamic Commands):

- `EXECUTE … USING` — qiymatlar `$1`, `$2` orqali; qiymatni matnga qo'shishdan ko'ra afzal, chunki qo'shtirnoq qo'yish kerak emas va SQL injection'ga ancha kam moyil.
- Jadval va ustun nomlari — `quote_ident` yoki `format()` ning `%I` i orqali; matn qiymatlari — `quote_literal`/`quote_nullable` yoki `%L`. `%I` nomni kerak bo'lsa qo'sh qo'shtirnoqqa oladi, `%L` qiymatni SQL literal qilib, ichidagi `'` ni ikkilaydi (PG — String Functions, `format`).

Natijada `sanash` ga yuborilgan "jadval nomi + `DROP`" — butunligicha bitta **nom** bo'lib qoldi: bunday jadval yo'q.

### Eng kam huquq

PHP qo'llanmasidagi himoya chuqurligi (defense in depth) maslahati: bazaga hech qachon superuser yoki ma'lumotlar egasi nomidan ulanmang, minimal huquqli foydalanuvchi ishlating. Yuqoridagi zaif skriptlarni `ilova` roli bilan (faqat `mahsulotlar` ni o'qiy oladi — 60-bob) ishga tushiramiz:

```text
$ psql -U dokon_egasi -d hujum -qc "UPDATE foydalanuvchilar SET rol = 'mijoz' WHERE login = 'hujumchi'"
$ DB_USER=ilova php qidir.php olma
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = 'olma'
1 | olma | 12000
$ DB_USER=ilova php qidir.php "x' UNION SELECT id, login || ' ' || parol_xesh, 0 FROM foydalanuvchilar --"
SQL: SELECT id, nomi, narx FROM mahsulotlar WHERE nomi = 'x' UNION SELECT id, login || ' ' || parol_xesh, 0 FROM foydalanuvchilar --'

Warning: pg_query(): Query failed: ERROR:  permission denied for table foydalanuvchilar in /Users/mfsv/Projects/experiment/sql-sinov/62/qidir.php on line 7
$ DB_USER=ilova php sahifa.php "0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'hujumchi'"
SQL: SELECT id, nomi FROM mahsulotlar ORDER BY id LIMIT 2 OFFSET 0; UPDATE foydalanuvchilar SET rol = 'admin' WHERE login = 'hujumchi'

Warning: pg_query(): Query failed: ERROR:  permission denied for table foydalanuvchilar in /Users/mfsv/Projects/experiment/sql-sinov/62/sahifa.php on line 7
$ psql -U dokon_egasi -d hujum -tAc "SELECT login, rol FROM foydalanuvchilar WHERE login = 'hujumchi'"
hujumchi|mijoz
```

Kod hali ham zaif, lekin hujum rolning huquqidan tashqariga chiqa olmadi. Bu — ikkinchi qatlam, parametrli so'rov o'rnini bosmaydi: `' OR '1'='1` (1-hujum) baribir ishlaydi, chunki `mahsulotlar` ni o'qish huquqi bor.

## Dialektlar

### MySQL

MySQL qo'llanmasi (15.5 Prepared Statements): placeholder'li prepared statement'ning afzalliklaridan biri — **SQL injection hujumlaridan himoya**: parametr qiymatlarida qochirilmagan qo'shtirnoq va ajratgich belgilar bo'lishi mumkin. SQL darajasida — `PREPARE … FROM`, `EXECUTE … USING @o'zgaruvchi`.

```sql
CREATE TABLE mahsulotlar (id int PRIMARY KEY, nomi varchar(50) NOT NULL, narx int NOT NULL);
INSERT INTO mahsulotlar VALUES (1, 'olma', 12000), (2, 'non', 5000), (3, 'sut', 9000);
```

Chiqishdan `mysql -vvv` ning bo'sh va ajratgich qatorlari olib tashlangan.

```text
SET @id = '2 OR 1=1'
Query OK, 0 rows affected (0.000 sec)
SET @s = CONCAT('SELECT id, nomi FROM mahsulotlar WHERE id = ', @id)
Query OK, 0 rows affected (0.000 sec)
PREPARE zaif FROM @s
Query OK, 0 rows affected (0.000 sec)
Statement prepared
EXECUTE zaif
+----+------+
| id | nomi |
+----+------+
|  1 | olma |
|  2 | non  |
|  3 | sut  |
+----+------+
3 rows in set (0.000 sec)
PREPARE xavfsiz FROM 'SELECT id, nomi FROM mahsulotlar WHERE id = ?'
Query OK, 0 rows affected (0.000 sec)
Statement prepared
EXECUTE xavfsiz USING @id
+----+------+
| id | nomi |
+----+------+
|  2 | non  |
+----+------+
1 row in set, 2 warnings (0.000 sec)
SHOW WARNINGS
+---------+------+-----------------------------------------------+
| Level   | Code | Message                                       |
+---------+------+-----------------------------------------------+
| Warning | 1292 | Truncated incorrect INTEGER value: '2 OR 1=1' |
| Warning | 1292 | Truncated incorrect INTEGER value: '2 OR 1=1' |
+---------+------+-----------------------------------------------+
2 rows in set (0.000 sec)
SET @nom = "x' OR '1'='1"
Query OK, 0 rows affected (0.000 sec)
PREPARE qidiruv FROM 'SELECT id, nomi FROM mahsulotlar WHERE nomi = ?'
Query OK, 0 rows affected (0.000 sec)
Statement prepared
EXECUTE qidiruv USING @nom
Empty set (0.000 sec)
```

- `PREPARE` ning o'zi himoya emas: `zaif` — matn `CONCAT` bilan yasalgan, natija yana hamma qator.
- `?` bilan `'2 OR 1=1'` — **qiymat**. MySQL uni songa aylantirib, boshidagi `2` ni oldi va ogohlantirdi — `OR 1=1` kodga aylanmadi.
- Ilova kodida esa MySQL qo'llanmasi PHP uchun `mysqli` yoki `pdo_mysql` ning placeholder'li prepared statement'larini tavsiya qiladi.

### SQLite

SQLite parametrlari — `?`, `?NNN`, `:nom`, `@nom`, `$nom`. `sqlite3` CLI'da qiymat `.parameter set` bilan beriladi:

```text
.parameter set :nom "x' OR '1'='1"
SELECT id, nomi FROM mahsulotlar WHERE nomi = :nom;
.parameter set :nom 'olma'
SELECT id, nomi FROM mahsulotlar WHERE nomi = :nom;
1|olma
.parameter list
:nom 'olma'
```

Birinchi so'rov hech narsa qaytarmadi: hujum satri — oddiy matn qiymati.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| SQL'dagi parametr | `PREPARE … AS … $1`, `EXECUTE (…)` | `PREPARE … FROM '… ?'`, `EXECUTE … USING @v` | `?`, `:nom`, `@nom`, `$nom` |
| Ilovada (PHP) | `pg_query_params`, PDO | `mysqli`/`pdo_mysql` prepared statement | PDO |
| Dinamik identifikator | `format('%I')`, `quote_ident` | Ruxsat ro'yxati | Ruxsat ro'yxati |
| Bir satrda bir nechta buyruq | `pg_query` — ha, `pg_query_params` — yo'q | — | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Qiymatni SQL matniga qo'shish (`"… '$nom'"`) | `' OR '1'='1`, `UNION`, `--`, `;` — hammasi sinovda ishladi | Parametrli so'rov |
| "Bu son, xavfsiz" | `2 OR 1=1` — hamma qator (sinovda) | Parametr; yoki turini tekshirish (PHP: `ctype_digit()`) |
| `PREPARE` ni himoya deb o'ylash | `PREPARE` ga qo'shib yasalgan matn berilsa — zaif (MySQL sinovida) | Qiymat faqat placeholder orqali |
| Ustun nomini parametr qilish | `ORDER BY $1` — qiymat, saralamaydi (sinovda) | Ruxsat ro'yxati yoki `format('%I')` |
| Ilova ega yoki superuser bilan ulanadi | Hujum hamma jadvalga yetadi (`hujumchi` admin bo'ldi) | Minimal huquqli rol |
| PL/pgSQL'da `EXECUTE '…' || p || '…'` | Funksiya ichida ham injection (sinovda) | `EXECUTE … USING`, `%I`/`%L` |

## Amaliyot

1. `kirish.php` ga `admin' OR '1'='1` va ixtiyoriy parol yuboring. Kim bo'lib kirdingiz va nega? Keyin `kirish_pdo.php` bilan takrorlang.
2. `qidir.php` ga `UNION` bilan `current_user` va `version()` ni chiqaradigan qiymat yozing (ustunlar soni va turi mos bo'lishi kerak).
3. `saralash.php` ga yo'nalish (`ASC`/`DESC`) parametrini qo'shing — PHP qo'llanmasidagi 5-misoldek ruxsat ro'yxati bilan.
4. `mahsulot.php` ni `ctype_digit()` tekshiruvi bilan, so'ng `pg_query_params` bilan tuzating. Ikkalasini `2 OR 1=1` bilan sinang.
5. `ilova` roliga `foydalanuvchilar` dan faqat `login` ustunini o'qish huquqini bering (60-bob, ustun darajasidagi `GRANT`). `UNION` hujumi endi nimani ko'radi?

## Rasmiy hujjat

- PHP — SQL Injection (hujum misollari va himoya usullari): <https://www.php.net/manual/en/security.database.sql-injection.php>
- PHP — `pg_query_params`: <https://www.php.net/manual/en/function.pg-query-params.php>
- PostgreSQL — 32.3. Command Execution Functions (`PQexec`, `PQexecParams`): <https://www.postgresql.org/docs/18/libpq-exec.html>
- PostgreSQL — PREPARE: <https://www.postgresql.org/docs/18/sql-prepare.html>
- PostgreSQL — 41.5.4. Executing Dynamic Commands: <https://www.postgresql.org/docs/18/plpgsql-statements.html>
- PostgreSQL — 9.4. String Functions (`format`, `%I`, `%L`): <https://www.postgresql.org/docs/18/functions-string.html>
- PostgreSQL — 36.5. Query Language (SQL) Functions (argumentlar — faqat qiymat): <https://www.postgresql.org/docs/18/xfunc-sql.html>
- MySQL — 8.1.7 Client Programming Security Guidelines: <https://dev.mysql.com/doc/refman/9.7/en/secure-client-programming.html>
- MySQL — 15.5 Prepared Statements: <https://dev.mysql.com/doc/refman/9.7/en/sql-prepared-statements.html>
- SQLite — Parameters: <https://www.sqlite.org/lang_expr.html#varparam>
