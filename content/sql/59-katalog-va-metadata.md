# 59 — Katalog va metadata

[← Oldingi: Partitioning](58-partitioning.md) · [Mundarija](README.md) · [Keyingi: Rollar va huquqlar →](60-rollar-va-huquqlar.md)

## Tushuncha

Baza o'zi haqidagi ma'lumotni — qanday jadvallar, ustunlar, turlar, indekslar, kalitlar bor — **o'zining jadvallarida** saqlaydi. Bu **metadata** (ma'lumot haqidagi ma'lumot). Uni oddiy `SELECT` bilan o'qish mumkin — migratsiya skriptlari, sxemani solishtirish, hujjat yaratish, "bu ustunda indeks bormi?" degan savol uchun.

Ikki daraja bor:

| | `information_schema` | Bazaning o'z katalogi |
| --- | --- | --- |
| Kim belgilaydi | **SQL standarti** | Baza ishlab chiquvchilari |
| Ko'chiriladimi | Ha — boshqa bazalarda ham bor | Yo'q — faqat shu bazada |
| To'liqmi | Faqat standart obyektlar | Hamma narsa, bazaga xos imkoniyatlar bilan |
| Misol | `information_schema.columns` | PG: `pg_catalog.pg_class`, SQLite: `sqlite_schema` |

PostgreSQL hujjati (35. The Information Schema): information schema — joriy bazadagi obyektlar haqidagi view'lar to'plami. U SQL standartida belgilangan, shuning uchun **ko'chiriladigan va barqaror** bo'lishi kutiladi — PostgreSQL'ga xos va ichki tuzilishga moslab yaratilgan tizim kataloglaridan farqli. Lekin unda PostgreSQL'ga xos imkoniyatlar **yo'q** — ular uchun tizim kataloglari yoki PostgreSQL view'lari kerak.

Hujjatdagi bir nozik joy: SQL standarti cheklov nomlari sxema ichida yagona bo'lishini talab qiladi, PostgreSQL esa buni majburlamaydi — shuning uchun bitta qator kutgan standart so'rov bir nechta qator qaytarishi mumkin.

### PostgreSQL: tizim kataloglari

Hujjat (52. System Catalogs): tizim kataloglari — sxema metadata'si va ichki hisob-kitob saqlanadigan joy. PostgreSQL'da ular **oddiy jadvallar**: ularni o'chirish, ustun qo'shish, qiymat yozish mumkin — va tizimni jiddiy buzish ham. Odatda ularni qo'lda o'zgartirmaslik kerak — buning uchun SQL buyruqlari bor (masalan, `CREATE DATABASE` `pg_database` ga qator qo'shadi va diskda bazani yaratadi).

Eng ko'p ishlatiladiganlari:

| Katalog / view | Nima |
| --- | --- |
| `pg_class` | Jadvallar, indekslar, view'lar, ketma-ketliklar — `relkind` bilan: `r` — oddiy jadval, `i` — indeks, `S` — sequence, `v` — view, `p` — bo'laklangan jadval, `I` — bo'laklangan indeks |
| `pg_attribute` | Ustunlar |
| `pg_index`, `pg_indexes` (view) | Indekslar |
| `pg_constraint` | Cheklovlar |
| `pg_stats` | Statistika (46-bob) |

### MySQL: `information_schema`

MySQL hujjati (28.1 Introduction): `INFORMATION_SCHEMA` jadvallari — aslida **view'lar**, ular bilan bog'liq fayllar yo'q, ularga trigger qo'yib bo'lmaydi; faqat o'qish mumkin, `INSERT`/`UPDATE`/`DELETE` — yo'q. MySQL'ga xos ustunlar ham bor: masalan, `key_column_usage.referenced_table_name` (tashqi kalit qayerga ishora qiladi), `statistics` (indekslar). Qisqa yo'l — `SHOW` buyruqlari (`SHOW CREATE TABLE`, `SHOW INDEX`).

### SQLite: `sqlite_schema` va `PRAGMA`

SQLite hujjati (The Schema Table): har bazada `sqlite_schema` jadvali — har jadval, indeks, view va trigger uchun bitta qator: `type`, `name`, `tbl_name`, `rootpage`, `sql`. `sql` ustuni — obyektni yaratgan **asl `CREATE` matnining nusxasi** (normallashtirilgan). Tarixiy nomi — `sqlite_master` (hali ham ishlaydi).

Ustunlar, indekslar, tashqi kalitlar — `PRAGMA` lar orqali: `table_info`, `index_list`, `foreign_key_list` va boshqalar. Hujjat (PRAGMA Statements): natija qaytaradigan va yon ta'siri bo'lmagan o'rnatilgan PRAGMA'lar oddiy `SELECT` da **jadval qiymatli funksiya** sifatida ham ishlatiladi — `pragma_table_info('jadval')`. SQLite'da `information_schema` yo'q.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan; har biri toza bazada.

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, ism text NOT NULL, email text UNIQUE);
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int NOT NULL REFERENCES mijozlar, summa numeric(12,2) DEFAULT 0);
CREATE INDEX b_mijoz ON buyurtmalar (mijoz_id);
```

### `information_schema`: ustunlar

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('mijozlar', 'buyurtmalar')
ORDER BY table_name, ordinal_position;
```

```text
 table_name  | column_name | data_type | is_nullable | column_default 
-------------+-------------+-----------+-------------+----------------
 buyurtmalar | id          | integer   | NO          | 
 buyurtmalar | mijoz_id    | integer   | NO          | 
 buyurtmalar | summa       | numeric   | YES         | 0
 mijozlar    | id          | integer   | NO          | 
 mijozlar    | ism         | text      | NO          | 
 mijozlar    | email       | text      | YES         | 
(6 rows)
```

### `information_schema`: cheklovlar va tashqi kalitlar

```sql
SELECT tc.table_name, tc.constraint_type, kcu.column_name, ccu.table_name AS manba
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu USING (constraint_schema, constraint_name)
LEFT JOIN information_schema.constraint_column_usage ccu
     ON ccu.constraint_name = tc.constraint_name AND tc.constraint_type = 'FOREIGN KEY'
WHERE tc.table_schema = 'public' ORDER BY 1, 2, 3;
```

```text
 table_name  | constraint_type | column_name |  manba   
-------------+-----------------+-------------+----------
 buyurtmalar | FOREIGN KEY     | mijoz_id    | mijozlar
 buyurtmalar | PRIMARY KEY     | id          | 
 mijozlar    | PRIMARY KEY     | id          | 
 mijozlar    | UNIQUE          | email       | 
(4 rows)
```

Standart view'lar bilan tashqi kalit qaysi jadvalga ishora qilishini topish uchun uchta view'ni birlashtirish kerak bo'ldi.

### Indekslar — standartda yo'q

```sql
SELECT count(*) FROM information_schema.tables WHERE table_name = 'indexes';
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'buyurtmalar' ORDER BY 1;
```

```text
 count 
-------
     0
(1 row)

    indexname     |                                  indexdef                                   
------------------+-----------------------------------------------------------------------------
 b_mijoz          | CREATE INDEX b_mijoz ON public.buyurtmalar USING btree (mijoz_id)
 buyurtmalar_pkey | CREATE UNIQUE INDEX buyurtmalar_pkey ON public.buyurtmalar USING btree (id)
(2 rows)
```

SQL standartida indeks tushunchasi yo'q — `information_schema` da indekslar view'i ham yo'q (`0`). PostgreSQL'ning `pg_indexes` view'i — har indeks va uni qayta yaratadigan `CREATE INDEX` matni bilan.

### `pg_class`: hamma obyektlar va hajmlar

```sql
SELECT c.relname, c.relkind, pg_size_pretty(pg_relation_size(c.oid)) AS hajm
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' ORDER BY 1;
```

```text
      relname       | relkind |    hajm    
--------------------+---------+------------
 b_mijoz            | i       | 8192 bytes
 buyurtmalar        | r       | 0 bytes
 buyurtmalar_pkey   | i       | 8192 bytes
 mijozlar           | r       | 0 bytes
 mijozlar_email_key | i       | 8192 bytes
 mijozlar_pkey      | i       | 8192 bytes
(6 rows)
```

Ikki jadval va to'rt indeks: biz yaratgan `b_mijoz`, birlamchi kalitlarniki va `UNIQUE (email)` uchun avtomatik `mijozlar_email_key`. Bo'sh jadvallar — `0 bytes`, indekslar — bitta 8 KB sahifa (66.6-bo'lim: sahifa hajmi).

### `psql` ning `\d` i ham katalogni o'qiydi

`\set ECHO_HIDDEN on` — `psql` ning ichki so'rovlarini ko'rsatadi:

```text
/******** QUERY *********/
SELECT c.oid,
  n.nspname,
  c.relname
FROM pg_catalog.pg_class c
     LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname OPERATOR(pg_catalog.~) '^(buyurtmalar)$' COLLATE pg_catalog.default
  AND pg_catalog.pg_table_is_visible(c.oid)
ORDER BY 2, 3;
/************************/
…
                Table "public.buyurtmalar"
  Column  |     Type      | Collation | Nullable | Default 
----------+---------------+-----------+----------+---------
 id       | integer       |           | not null | 
 mijoz_id | integer       |           | not null | 
 summa    | numeric(12,2) |           |          | 0
Indexes:
    "buyurtmalar_pkey" PRIMARY KEY, btree (id)
    "b_mijoz" btree (mijoz_id)
Foreign-key constraints:
    "buyurtmalar_mijoz_id_fkey" FOREIGN KEY (mijoz_id) REFERENCES mijozlar(id)
```

`\d buyurtmalar` — **12 ta** katalog so'rovi (`pg_class`, `pg_attribute`, `pg_index`, `pg_constraint`, `pg_policy`, `pg_statistic_ext`, `pg_publication`…); yuqorida — birinchisi va natija. O'z so'rovingizni yozishda `psql` ning so'rovlari yaxshi namuna.

## Dialektlar

### MySQL

```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns WHERE table_schema = 'katalog' ORDER BY table_name, ordinal_position;
SELECT table_name, constraint_type, constraint_name
FROM information_schema.table_constraints WHERE table_schema = 'katalog' ORDER BY 1, 2;
SELECT table_name, column_name, referenced_table_name, referenced_column_name
FROM information_schema.key_column_usage WHERE table_schema = 'katalog' AND referenced_table_name IS NOT NULL;
SELECT table_name, index_name, column_name, non_unique
FROM information_schema.statistics WHERE table_schema = 'katalog' ORDER BY 1, 2;
SHOW CREATE TABLE buyurtmalar;
```

```text
+-------------+-------------+-----------+-------------+----------------+
| TABLE_NAME  | COLUMN_NAME | DATA_TYPE | IS_NULLABLE | COLUMN_DEFAULT |
+-------------+-------------+-----------+-------------+----------------+
| buyurtmalar | id          | int       | NO          | NULL           |
| buyurtmalar | mijoz_id    | int       | NO          | NULL           |
| buyurtmalar | summa       | decimal   | YES         | 0.00           |
| mijozlar    | id          | int       | NO          | NULL           |
| mijozlar    | ism         | varchar   | NO          | NULL           |
| mijozlar    | email       | varchar   | YES         | NULL           |
+-------------+-------------+-----------+-------------+----------------+
+-------------+-----------------+--------------------+
| TABLE_NAME  | CONSTRAINT_TYPE | CONSTRAINT_NAME    |
+-------------+-----------------+--------------------+
| buyurtmalar | FOREIGN KEY     | buyurtmalar_ibfk_1 |
| buyurtmalar | PRIMARY KEY     | PRIMARY            |
| mijozlar    | PRIMARY KEY     | PRIMARY            |
| mijozlar    | UNIQUE          | email              |
+-------------+-----------------+--------------------+
+-------------+-------------+-----------------------+------------------------+
| TABLE_NAME  | COLUMN_NAME | REFERENCED_TABLE_NAME | REFERENCED_COLUMN_NAME |
+-------------+-------------+-----------------------+------------------------+
| buyurtmalar | mijoz_id    | mijozlar              | id                     |
+-------------+-------------+-----------------------+------------------------+
+-------------+------------+-------------+------------+
| TABLE_NAME  | INDEX_NAME | COLUMN_NAME | NON_UNIQUE |
+-------------+------------+-------------+------------+
| buyurtmalar | b_mijoz    | mijoz_id    |          1 |
| buyurtmalar | PRIMARY    | id          |          0 |
| mijozlar    | email      | email       |          0 |
| mijozlar    | PRIMARY    | id          |          0 |
+-------------+------------+-------------+------------+
+-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table       | Create Table                                                                                                                                                                                                                                                                                                                        |
+-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| buyurtmalar | CREATE TABLE `buyurtmalar` (
  `id` int NOT NULL,
  `mijoz_id` int NOT NULL,
  `summa` decimal(12,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `b_mijoz` (`mijoz_id`),
  CONSTRAINT `buyurtmalar_ibfk_1` FOREIGN KEY (`mijoz_id`) REFERENCES `mijozlar` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci |
+-------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

- Ustun nomlari katta harfda (`TABLE_NAME`), `data_type` — qisqa (`decimal`, uzunliksiz).
- MySQL'da `table_schema` — **baza nomi** (`katalog`); PostgreSQL'da — sxema (`public`).
- Tashqi kalit manbasi — bitta view'da: `referenced_table_name` (MySQL kengaytmasi). PostgreSQL'dagi uch view'li birlashtirish shart emas.
- `statistics` — indekslar (MySQL kengaytmasi); `UNIQUE (email)` indeksining nomi — `email`, avtomatik FK nomi — `buyurtmalar_ibfk_1`.
- `SHOW CREATE TABLE` — jadvalni qayta yaratadigan to'liq matn, `ENGINE` va kollatsiya bilan.

### SQLite

```sql
SELECT type, name, tbl_name, rootpage FROM sqlite_schema ORDER BY type, name;
SELECT sql FROM sqlite_schema WHERE name = 'buyurtmalar';
PRAGMA table_info(buyurtmalar);
SELECT m.name AS jadval, p.name AS ustun, p.type, p."notnull", p.pk
FROM sqlite_schema m, pragma_table_info(m.name) p WHERE m.type = 'table' ORDER BY 1, p.cid;
SELECT * FROM pragma_foreign_key_list('buyurtmalar');
SELECT name, "unique", origin FROM pragma_index_list('mijozlar');
SELECT count(*) FROM sqlite_master;
```

```text
╭───────┬─────────────────────────────┬─────────────┬──────────╮
│ type  │            name             │  tbl_name   │ rootpage │
╞═══════╪═════════════════════════════╪═════════════╪══════════╡
│ index │ b_mijoz                     │ buyurtmalar │        5 │
│ index │ sqlite_autoindex_mijozlar_1 │ mijozlar    │        3 │
│ table │ buyurtmalar                 │ buyurtmalar │        4 │
│ table │ mijozlar                    │ mijozlar    │        2 │
╰───────┴─────────────────────────────┴─────────────┴──────────╯
╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
│                                                          sql                                                          │
╞═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╡
│ CREATE TABLE buyurtmalar (id integer PRIMARY KEY, mijoz_id int NOT NULL REFERENCES mijozlar, summa numeric DEFAULT 0) │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
╭─────┬──────────┬─────────┬─────────┬────────────┬────╮
│ cid │   name   │  type   │ notnull │ dflt_value │ pk │
╞═════╪══════════╪═════════╪═════════╪════════════╪════╡
│   0 │ id       │ INTEGER │       0 │            │  1 │
│   1 │ mijoz_id │ INT     │       1 │            │  0 │
│   2 │ summa    │ numeric │       0 │ 0          │  0 │
╰─────┴──────────┴─────────┴─────────┴────────────┴────╯
╭─────────────┬──────────┬─────────┬─────────┬────╮
│   jadval    │  ustun   │  type   │ notnull │ pk │
╞═════════════╪══════════╪═════════╪═════════╪════╡
│ buyurtmalar │ id       │ INTEGER │       0 │  1 │
│ buyurtmalar │ mijoz_id │ INT     │       1 │  0 │
│ buyurtmalar │ summa    │ numeric │       0 │  0 │
│ mijozlar    │ id       │ INTEGER │       0 │  1 │
│ mijozlar    │ ism      │ TEXT    │       1 │  0 │
│ mijozlar    │ email    │ TEXT    │       0 │  0 │
╰─────────────┴──────────┴─────────┴─────────┴────╯
╭────┬─────┬──────────┬──────────┬────┬───────────┬───────────┬───────╮
│ id │ seq │  table   │   from   │ to │ on_update │ on_delete │ match │
╞════╪═════╪══════════╪══════════╪════╪═══════════╪═══════════╪═══════╡
│  0 │   0 │ mijozlar │ mijoz_id │    │ NO ACTION │ NO ACTION │ NONE  │
╰────┴─────┴──────────┴──────────┴────┴───────────┴───────────┴───────╯
╭─────────────────────────────┬────────┬────────╮
│            name             │ unique │ origin │
╞═════════════════════════════╪════════╪════════╡
│ sqlite_autoindex_mijozlar_1 │      1 │ u      │
╰─────────────────────────────┴────────┴────────╯
╭──────────╮
│ count(*) │
╞══════════╡
│        4 │
╰──────────╯
```

- `sqlite_schema` — 2 jadval va 2 indeks; `UNIQUE` uchun avtomatik `sqlite_autoindex_mijozlar_1`. `rootpage` — obyektning B-tree'si boshlanadigan sahifa.
- `sql` — biz yozgan `CREATE TABLE` matni.
- `pragma_table_info(m.name)` — jadval qiymatli funksiya `sqlite_schema` bilan birlashtirildi: **barcha** jadvallarning ustunlari bitta so'rovda — `information_schema.columns` ning o'xshashi.
- `foreign_key_list` da `to` bo'sh: `REFERENCES mijozlar` ustunsiz yozilgan — birlamchi kalitga ishora.
- `index_list('mijozlar')` da faqat `UNIQUE` indeksi (`origin = u`); birlamchi kalit uchun indeks yo'q — `integer PRIMARY KEY` jadvalning `rowid` i (12-bob).
- `sqlite_master` — eski nom, xuddi shu 4 qator.

### Qisqacha jadval

| Savol | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Jadvallar | `information_schema.tables`, `pg_class` | `information_schema.tables`, `SHOW TABLES` | `sqlite_schema` |
| Ustunlar | `information_schema.columns`, `pg_attribute` | `information_schema.columns` | `pragma_table_info()` |
| Indekslar | `pg_indexes` (standartda yo'q) | `information_schema.statistics`, `SHOW INDEX` | `pragma_index_list()`, `sqlite_schema` |
| Tashqi kalitlar | `table_constraints` + `key_column_usage` + `constraint_column_usage` | `key_column_usage.referenced_*` | `pragma_foreign_key_list()` |
| Yaratish matni | `pg_get_indexdef()`, `pg_dump --schema-only` | `SHOW CREATE TABLE` | `sqlite_schema.sql` |
| `table_schema` ma'nosi | Sxema | Baza | — |
| Hajm | `pg_relation_size()` | `information_schema.tables.data_length` | `dbstat` (kengaytma) |

`—` — tegishli emas. `data_length` va `dbstat` bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Indekslarni `information_schema` da qidirish | Standartda yo'q (sinovda `0`) | PG: `pg_indexes`; MySQL: `information_schema.statistics` |
| PG'da `table_schema` ni tekshirmaslik | `pg_catalog` va `information_schema` ning o'z obyektlari ham chiqadi | `WHERE table_schema = 'public'` (yoki kerakli sxema) |
| MySQL'da `table_schema` ni sxema deb o'ylash | MySQL'da bu baza nomi | Baza nomini berish |
| PG'da cheklov nomini yagona deb hisoblash | Hujjat: PG nomlarning yagonaligini majburlamaydi — standart so'rov bir nechta qator qaytarishi mumkin | `constraint_schema` va jadval bo'yicha ham filtrlash |
| Tizim kataloglarini qo'lda o'zgartirish | Hujjat: tizimni jiddiy buzish mumkin | Faqat SQL buyruqlari (`ALTER`, `CREATE`…) |
| SQLite'da `PRAGMA table_info` ni bitta jadval uchun bittalab chaqirish | Ko'p so'rov | `pragma_table_info()` ni `sqlite_schema` bilan birlashtirish |

## Amaliyot

1. PostgreSQL'da indeksi yo'q tashqi kalitlarni toping: `pg_constraint` (`contype = 'f'`) ni `pg_index` bilan solishtiring (37-bob: FK ustuniga indeks).
2. `pg_class` va `pg_total_relation_size()` bilan bazadagi eng katta 5 jadvalni (indekslari bilan) chiqaring.
3. MySQL'da `information_schema.columns` dan barcha `NULL` bo'lishi mumkin bo'lgan va standart qiymati yo'q ustunlarni toping.
4. SQLite'da `sqlite_schema` dan barcha triggerlar va ularning `sql` matnini oling (57-bobdagi triggerlarni yarating).
5. Ikki PostgreSQL bazasining sxemasini `information_schema.columns` bo'yicha solishtiradigan so'rov yozing (`EXCEPT`, 28-bob).

## Rasmiy hujjat

- PostgreSQL — 35. The Information Schema: <https://www.postgresql.org/docs/18/information-schema.html>
- PostgreSQL — 52. System Catalogs: <https://www.postgresql.org/docs/18/catalogs.html> · `pg_class`: <https://www.postgresql.org/docs/18/catalog-pg-class.html>
- PostgreSQL — psql (`ECHO_HIDDEN`): <https://www.postgresql.org/docs/18/app-psql.html>
- MySQL — 28.1 Introduction (INFORMATION_SCHEMA): <https://dev.mysql.com/doc/refman/9.7/en/information-schema-introduction.html>
- MySQL — 28 INFORMATION_SCHEMA Tables: <https://dev.mysql.com/doc/refman/9.7/en/information-schema.html>
- SQLite — The Schema Table: <https://www.sqlite.org/schematab.html>
- SQLite — PRAGMA Statements (table-valued functions): <https://www.sqlite.org/pragma.html>
