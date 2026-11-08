# 60 — Rollar va huquqlar

[← Oldingi: Katalog va metadata](59-katalog-va-metadata.md) · [Mundarija](README.md)

## Tushuncha

Bazaga ko'p kishi va dastur ulanadi: ilova, hisobot tizimi, ma'mur, tahlilchi. Har biriga **faqat kerakli** huquq berilishi kerak: hisobot faqat o'qisin, ilova o'z jadvallariga yozsin, lekin jadvallarni o'chira olmasin. Bu — **huquqlar** (privileges) va **rollar** (roles).

| Tushuncha | Ma'nosi |
| --- | --- |
| Huquq | Obyektdagi aniq amalga ruxsat: `SELECT`, `INSERT`, `UPDATE`, `DELETE`, … |
| `GRANT` | Huquq berish |
| `REVOKE` | Huquqni olish |
| Rol | Huquqlar to'plami; foydalanuvchiga berilsa — u shu huquqlarni oladi |

### PostgreSQL: hamma narsa — rol

PostgreSQL hujjati (21. Database Roles): kirish huquqlari **rollar** tushunchasi bilan boshqariladi. Rol — sozlanishiga qarab yo bitta foydalanuvchi, yo foydalanuvchilar **guruhi**. Rollar obyektlarga egalik qila oladi va boshqa rollarga huquq beradi; rolga a'zolikni boshqa rolga berish mumkin — a'zo rol o'sha rolning huquqlaridan foydalanadi. Hujjat: 8.1 dan oldin "foydalanuvchi" va "guruh" alohida edi, endi faqat rollar bor; istalgan rol foydalanuvchi, guruh yoki ikkalasi bo'lishi mumkin. `LOGIN` atributli rol bilan ulanish mumkin — odatdagi "foydalanuvchi".

Egalik (5.8. Privileges): obyekt yaratilganda **egasi** — uni yaratgan rol. Ko'p obyektlarda boshlang'ich holat: faqat egasi (yoki superuser) undan foydalana oladi; boshqalarga huquq berish kerak. Obyektni o'zgartirish yoki o'chirish huquqi egalikning o'zida — uni alohida berib yoki olib bo'lmaydi. `PUBLIC` — barcha rollar.

**`public` sxema** (5.10. Schemas): PostgreSQL 15 dan boshlab standart sozlamada oddiy foydalanuvchilar `public` sxemada obyekt **yarata olmaydi** (eski versiyalarda, yoki eski versiyadan yangilangan bazada, `REVOKE CREATE ON SCHEMA public FROM PUBLIC` qilish kerak).

**Tayyor rollar** (21.5. Predefined Roles) — masalan:

| Rol | Nima beradi |
| --- | --- |
| `pg_read_all_data` | Barcha ma'lumotni o'qish (jadval, view, sequence) — barcha obyektlarda `SELECT` va barcha sxemalarda `USAGE` bordek. Hujjat: Row Level Security siyosatlarini **chetlab o'tmaydi** (61-bob) |
| `pg_write_all_data` | Barcha ma'lumotga yozish (`INSERT`, `UPDATE`, `DELETE`) |
| `pg_maintain` | Barcha jadvallarda `VACUUM`, `ANALYZE`, `REINDEX`, `CLUSTER`, `REFRESH MATERIALIZED VIEW`, `LOCK TABLE` (65-bob) |
| `pg_monitor` | Monitoring view'lari va funksiyalari (67-bob) |
| `pg_database_owner` | Doim bitta yashirin a'zo — joriy baza egasi; boshlang'ich holatda `public` sxemaning egasi |

### MySQL: hisoblar va rollar

MySQL'da foydalanuvchi — **hisob** (account): `'nom'@'xost'` (hujjat 8.2.4 Specifying Account Names) — `'ali'@'%'` istalgan xostdan. Rol (8.2.10 Using Roles) — **nomlangan huquqlar to'plami**. Muhim farq — hujjat: rolni hisobga berish (yoki `mandatory_roles` ga yozish) uni sessiyada **avtomatik faollashtirmaydi**. Faol bo'lmagan rolning huquqlari ishlamaydi. Faollashtirish — `SET ROLE`, standart rollar — `SET DEFAULT ROLE`, joriy faollari — `CURRENT_ROLE()`.

### SQLite

SQLite hujjati (SQL Features That SQLite Does Not Implement): `GRANT` va `REVOKE` — klient/server bazalarida odatiy, lekin **o'rnatiladigan** (embedded) baza uchun ma'nosiz bo'lgani sababli amalga oshirilmagan. Kirish nazorati — baza faylining operatsion tizimdagi huquqlari ([Linux kitobi, 7-bob: Ruxsatlar](../linux/07-ruxsatlar.md)).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan; 59-bobdagi `katalog` bazasida (`mijozlar`, `buyurtmalar`). Rollarni tekshirish uchun superuser `SET ROLE` bilan boshqa rolga o'tadi — ulanmasdan.

### Guruh roli va `GRANT`

```text
CREATE ROLE oquvchi NOLOGIN;
CREATE ROLE
CREATE ROLE ali LOGIN PASSWORD 'sinov-60';
CREATE ROLE
GRANT oquvchi TO ali;
GRANT ROLE
GRANT SELECT ON mijozlar TO oquvchi;
GRANT
                                   Access privileges
 Schema |   Name   | Type  |     Access privileges      | Column privileges | Policies 
--------+----------+-------+----------------------------+-------------------+----------
 public | mijozlar | table | postgres=arwdDxtm/postgres+|                   | 
        |          |       | oquvchi=r/postgres         |                   | 
(1 row)
```

- `oquvchi` — `NOLOGIN` (ulanib bo'lmaydi) — guruh; `ali` — `LOGIN` — foydalanuvchi; `ali` `oquvchi` ning a'zosi.
- `\dp` — `Access privileges`: `postgres=arwdDxtm/postgres` — egasining barcha huquqlari, `oquvchi=r/postgres` — `oquvchi` da faqat `r` (`SELECT`), `postgres` bergan. Hujjatdagi qisqartmalar: `r` — SELECT ("read"), `a` — INSERT ("append"), `w` — UPDATE ("write"), `d` — DELETE, `D` — TRUNCATE, `x` — REFERENCES, `t` — TRIGGER, `m` — MAINTAIN.

### `ali` nima qila oladi

```text
SET ROLE ali;
SET
SELECT current_user;
 current_user 
--------------
 ali
(1 row)

SELECT count(*) FROM mijozlar;
 count 
-------
     0
(1 row)

INSERT INTO mijozlar VALUES (1, 'Aziza', NULL);
ERROR:  permission denied for table mijozlar
SELECT count(*) FROM buyurtmalar;
ERROR:  permission denied for table buyurtmalar
CREATE TABLE ali_jadvali (x int);
ERROR:  permission denied for schema public
LINE 1: CREATE TABLE ali_jadvali (x int);
                     ^
RESET ROLE;
RESET
```

- `SELECT FROM mijozlar` — ishladi: huquq `oquvchi` orqali **meros** qilib olindi.
- `INSERT` — `permission denied for table mijozlar`: faqat `SELECT` berilgan.
- `buyurtmalar` — huquq umuman yo'q.
- `CREATE TABLE` — `permission denied for schema public`: PostgreSQL 15+ ning standarti.

### Tayyor rol: `pg_read_all_data`

```text
CREATE ROLE bek LOGIN;
CREATE ROLE
GRANT pg_read_all_data TO bek;
GRANT ROLE
SET ROLE bek;
SET
SELECT count(*) FROM buyurtmalar;
 count 
-------
     0
(1 row)

DELETE FROM buyurtmalar;
ERROR:  permission denied for table buyurtmalar
RESET ROLE;
RESET
```

`bek` ga birorta jadval bo'yicha `GRANT` qilinmadi, lekin `pg_read_all_data` bilan **barcha** jadvallarni o'qiy oladi; yozish — yo'q. Hisobot yoki zaxira tizimi uchun qulay — lekin hujjatdagi ogohlantirishni unutmang: RLS (61-bob) baribir ishlaydi.

### Kelajakdagi jadvallar: `ALTER DEFAULT PRIVILEGES`

`GRANT SELECT ON mijozlar` faqat **mavjud** jadvalga taalluqli. Keyin yaratiladigan jadvallar uchun:

```text
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO oquvchi;
ALTER DEFAULT PRIVILEGES
CREATE TABLE tolovlar (id int PRIMARY KEY);
CREATE TABLE
SET ROLE ali;
SET
SELECT count(*) FROM tolovlar;
 count 
-------
     0
(1 row)

RESET ROLE;
RESET
```

`tolovlar` `GRANT` dan **keyin** yaratildi, lekin `ali` (`oquvchi` orqali) uni o'qiy oldi — standart huquqlar avtomatik qo'llandi.

### Rolni olib tashlash

```text
REVOKE oquvchi FROM ali;
REVOKE ROLE
SET ROLE ali;
SET
SELECT count(*) FROM mijozlar;
ERROR:  permission denied for table mijozlar
RESET ROLE;
RESET
```

`ali` `oquvchi` dan chiqarildi — `mijozlar` ga huquq darhol yo'qoldi. Huquqlarni foydalanuvchiga emas, **rolga** berishning foydasi shu: odam ishdan ketsa yoki lavozimi o'zgarsa — bitta `REVOKE`.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosining bir qismi, bo'sh qatorlar va `row in set` qatorlari olib tashlangan.

**Rol va hisob (root sifatida):**

```sql
CREATE ROLE 'oquvchi';
GRANT SELECT ON katalog.mijozlar TO 'oquvchi';
CREATE USER 'ali'@'%' IDENTIFIED BY 'sinov-60';
GRANT 'oquvchi' TO 'ali'@'%';
SHOW GRANTS FOR 'ali'@'%';
SHOW GRANTS FOR 'ali'@'%' USING 'oquvchi';
```

```text
CREATE ROLE 'oquvchi'
Query OK, 0 rows affected (0.001 sec)
GRANT SELECT ON katalog.mijozlar TO 'oquvchi'
Query OK, 0 rows affected (0.002 sec)
CREATE USER 'ali'@'%' IDENTIFIED BY 'sinov-60'
Query OK, 0 rows affected (0.003 sec)
GRANT 'oquvchi' TO 'ali'@'%'
Query OK, 0 rows affected (0.001 sec)
SHOW GRANTS FOR 'ali'@'%'
+----------------------------------+
| Grants for ali@%                 |
+----------------------------------+
| GRANT USAGE ON *.* TO `ali`@`%`  |
| GRANT `oquvchi`@`%` TO `ali`@`%` |
+----------------------------------+
SHOW GRANTS FOR 'ali'@'%' USING 'oquvchi'
+---------------------------------------------------+
| Grants for ali@%                                  |
+---------------------------------------------------+
| GRANT USAGE ON *.* TO `ali`@`%`                   |
| GRANT SELECT ON `katalog`.`mijozlar` TO `ali`@`%` |
| GRANT `oquvchi`@`%` TO `ali`@`%`                  |
+---------------------------------------------------+
```

`SHOW GRANTS` — `ali` ning o'z huquqi faqat `USAGE` (ulanish) va rol a'zoligi; `USING 'oquvchi'` — rol faol bo'lsa qanday huquqlar bo'lishi.

**`ali` sifatida ulanib:**

```sql
SELECT CURRENT_ROLE();
SELECT count(*) FROM katalog.mijozlar;
SET ROLE 'oquvchi';
SELECT CURRENT_ROLE();
SELECT count(*) FROM katalog.mijozlar;
INSERT INTO katalog.mijozlar VALUES (1, 'Aziza', NULL);
```

```text
SELECT CURRENT_ROLE()
+----------------+
| CURRENT_ROLE() |
+----------------+
| NONE           |
+----------------+
SELECT count(*) FROM katalog.mijozlar
ERROR 1142 (42000) at line 2: SELECT command denied to user 'ali'@'localhost' for table 'mijozlar'
SET ROLE 'oquvchi'
Query OK, 0 rows affected (0.000 sec)
SELECT CURRENT_ROLE()
+----------------+
| CURRENT_ROLE() |
+----------------+
| `oquvchi`@`%`  |
+----------------+
SELECT count(*) FROM katalog.mijozlar
+----------+
| count(*) |
+----------+
|        0 |
+----------+
INSERT INTO katalog.mijozlar VALUES (1, 'Aziza', NULL)
ERROR 1142 (42000) at line 6: INSERT command denied to user 'ali'@'localhost' for table 'mijozlar'
```

- Rol **berilgan**, lekin `CURRENT_ROLE()` — `NONE`, va `SELECT` rad etildi: hujjatdagidek, rol avtomatik faollashmaydi. PostgreSQL'dan muhim farq — u yerda a'zolik darhol ishladi.
- `SET ROLE 'oquvchi'` dan keyin — o'qish ishladi, yozish — yo'q.
- Xato xabarida `'ali'@'localhost'` (kuzatildi: ulanish konteyner ichidan edi) — bu ulanish `'ali'@'%'` hisobi bilan autentifikatsiya qilindi.

**Har ulanishda faollashtirish:**

```sql
SET DEFAULT ROLE ALL TO 'ali'@'%';
-- ali qayta ulanadi:
SELECT CURRENT_ROLE();
```

```text
SET DEFAULT ROLE ALL TO 'ali'@'%'
Query OK, 0 rows affected (0.002 sec)
SELECT CURRENT_ROLE()
+----------------+
| CURRENT_ROLE() |
+----------------+
| `oquvchi`@`%`  |
+----------------+
```

### SQLite

```text
Parse error in 2nd command line argument: near "GRANT": syntax error
  GRANT SELECT ON t TO ali;
  ^--- error here
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Foydalanuvchi | `LOGIN` atributli rol | Hisob `'nom'@'xost'` | — |
| Guruh | Rol (a'zolik bilan) | Rol | — |
| Rol a'zoligi qachon ishlaydi | Darhol (meros) | Faollashtirilgandan keyin (`SET ROLE`, `SET DEFAULT ROLE`) | — |
| Tayyor rollar | `pg_read_all_data`, `pg_write_all_data`, `pg_maintain`, `pg_monitor`… | — | — |
| Kelajakdagi obyektlar | `ALTER DEFAULT PRIVILEGES` | Baza darajasida `GRANT … ON baza.*` | — |
| Huquqlarni ko'rish | `\dp`, `information_schema.table_privileges` | `SHOW GRANTS` | — |
| `public` sxemada yaratish | PG 15+ da standart bo'yicha yo'q | — | — |
| Kirish nazorati | `GRANT`/`REVOKE` | `GRANT`/`REVOKE` | Fayl huquqlari (`GRANT` yo'q) |

`—` — bu bobda sinalmagan yoki mavjud emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ilova superuser yoki `root` bilan ulanadi | SQL injection (62-bob) yoki xato — butun server xavf ostida | Ilova uchun alohida, minimal huquqli rol |
| Huquqlarni har foydalanuvchiga alohida berish | Boshqarish qiyin, kimda nima borligini bilish qiyin | Huquqlar — rollarga, foydalanuvchilar — rol a'zosi |
| `GRANT … ON jadval` yangi jadvallarga ham ishlaydi deb o'ylash | Faqat mavjud obyektlar | PG: `ALTER DEFAULT PRIVILEGES`; MySQL: `ON baza.*` |
| MySQL'da rol berib, faollashtirmaslik | Huquq ishlamaydi (sinovda `NONE`, `1142`) | `SET DEFAULT ROLE` |
| Eski PG bazasini yangilagandan keyin `public` sxemani tekshirmaslik | Hujjat: eski versiyalardan yangilangan bazada `PUBLIC` hali `CREATE` qila oladi | `REVOKE CREATE ON SCHEMA public FROM PUBLIC` |
| `pg_read_all_data` RLS'ni chetlab o'tadi deb o'ylash | Hujjat: o'tmaydi | Kerak bo'lsa — `BYPASSRLS` (61-bob) |
| SQLite fayliga hamma yozishi mumkin bo'lgan huquq | Baza ichida kirish nazorati yo'q | Fayl va papka huquqlari |

## Amaliyot

1. PostgreSQL'da `ilova` rolini yarating: `mijozlar` va `buyurtmalar` da `SELECT, INSERT, UPDATE`, lekin `DELETE` yo'q. `SET ROLE` bilan tekshiring.
2. `GRANT SELECT (ism) ON mijozlar TO oquvchi` — ustun darajasidagi huquq. `SELECT email` nima bo'ladi? `\dp` da `Column privileges` ustuni-chi?
3. `information_schema.table_privileges` dan `oquvchi` ning barcha huquqlarini oling.
4. MySQL'da `'ali'@'%'` uchun `ALTER USER … PASSWORD EXPIRE` qiling va qayta ulaning. Qanday cheklov paydo bo'ldi?
5. PostgreSQL'da `ali` ni o'chirishga urining (`DROP ROLE ali`) — uning obyektlari yoki huquqlari bo'lsa nima bo'ladi? `REASSIGN OWNED` va `DROP OWNED` nima uchun?

## Rasmiy hujjat

- PostgreSQL — 21. Database Roles: <https://www.postgresql.org/docs/18/user-manag.html>
- PostgreSQL — 21.5. Predefined Roles: <https://www.postgresql.org/docs/18/predefined-roles.html>
- PostgreSQL — 5.8. Privileges: <https://www.postgresql.org/docs/18/ddl-priv.html>
- PostgreSQL — 5.10. Schemas (public schema, PG 15+): <https://www.postgresql.org/docs/18/ddl-schemas.html>
- PostgreSQL — ALTER DEFAULT PRIVILEGES: <https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html>
- MySQL — 8.2.10 Using Roles: <https://dev.mysql.com/doc/refman/9.7/en/roles.html>
- MySQL — 8.2.4 Specifying Account Names: <https://dev.mysql.com/doc/refman/9.7/en/account-names.html>
- SQLite — SQL Features That SQLite Does Not Implement: <https://www.sqlite.org/omitted.html>
