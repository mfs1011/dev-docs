# 67 — Replikatsiya va monitoring

[← Oldingi: Zaxira va tiklash](66-zaxira-va-tiklash.md) · [Mundarija](README.md) · [Keyingi: ORM ortidagi SQL →](68-orm-ortidagi-sql.md)

## Tushuncha

**Replikatsiya** — bitta serverning (primary, source) o'zgarishlarini boshqa serverlarga (standby, replica) avtomatik ko'chirish. Maqsadlar:

- **yuqori mavjudlik** (high availability): primary ishdan chiqsa — standby uning o'rnini egallaydi;
- **o'qishni taqsimlash**: hisobotlar va og'ir `SELECT` lar replikada;
- ma'lumotning bir qismini boshqa tizimga uzatish.

**Monitoring** — baza qanday ishlayotganini kuzatish: qaysi so'rovlar ko'p vaqt oladi, replika qancha orqada.

### PostgreSQL: streaming (fizik) replikatsiya

PostgreSQL hujjati (26.2. Log-Shipping Standby Servers):

- Standby — primary'ning asosiy zaxirasidan (66-bob) boshlanadi; ma'lumot papkasida **`standby.signal`** fayli bo'lsa, server standby rejimida ishga tushadi.
- **Streaming replication** — standby primary'ga ulanadi, primary WAL yozuvlarini **hosil bo'lishi bilan** uzatadi (WAL fayli to'lishini kutmasdan). Ulanish — `primary_conninfo`.
- Standby faqat o'qish uchun so'rovlarni qabul qilsa — **hot standby**.
- Streaming replikatsiya standart holatda **asinxron**: primary'dagi commit bilan standby'da ko'rinishi orasida kichik kechikish bor — hujjat: standby yuklamani ko'tara olsa, odatda bir soniyadan kam. Primary ishdan chiqsa, replikatsiya qilinmagan commit'lar **yo'qolishi** mumkin — yo'qotish hajmi o'sha paytdagi kechikishga proporsional. Sinxron replikatsiya — `synchronous_standby_names` (26.2.8).
- Sog'liq ko'rsatkichi — kechikish (lag): primary'dagi `pg_current_wal_lsn()` va standby qabul qilgan joy farqi; primary'da `pg_stat_replication` view'i.

### PostgreSQL: logical replikatsiya

Hujjat (29. Logical Replication): ma'lumot obyektlari va ularning o'zgarishlarini **replikatsiya identifikatori** (odatda birlamchi kalit) asosida ko'chirish — aniq blok manzillari va baytma-bayt nusxa ishlatiladigan **fizik** replikatsiyadan farqli. Model — **nashr va obuna** (publish/subscribe): nashriyotchida `PUBLICATION`, obunachida `SUBSCRIPTION`. Boshlanishida jadval ma'lumotining snapshot'i ko'chiriladi, keyin o'zgarishlar uzluksiz yuboriladi va bitta obuna doirasida **tranzaksiya tartibida** qo'llanadi. Obunachi — oddiy PostgreSQL serveri, unga yozish mumkin (bu holda ziddiyatlar bo'lishi mumkin).

| | Streaming (fizik) | Logical |
| --- | --- | --- |
| Nima ko'chiriladi | Butun klaster, baytma-bayt | Tanlangan jadvallar, qatorlar |
| Replika | Faqat o'qish (hot standby) | Oddiy server, yozish mumkin |
| Versiyalar | Hujjat (26.2): turli major versiyalar orasida odatda mumkin emas | Hujjat (29): turli major versiyalar orasida replikatsiya — foydalanish holatlaridan biri |
| Asosiy maqsad | Yuqori mavjudlik | Ma'lumotni tanlab uzatish, integratsiya |

### PostgreSQL: `pg_stat_statements`

Hujjat (F.32. pg_stat_statements): server bajargan **barcha** SQL operatorlarining rejalashtirish va bajarilish statistikasini yig'adi. Qo'shimcha umumiy xotira kerak bo'lgani uchun `shared_preload_libraries` ga qo'shiladi — **server qayta ishga tushirilishi** kerak; ko'rish uchun bazada `CREATE EXTENSION pg_stat_statements`. Bir xil tuzilishdagi so'rovlar konstantalari `$1` bilan almashtirilib, **bitta qatorga** birlashtiriladi.

### MySQL

- **Replikatsiya** (19. Replication): bitta serverdan (source) bir yoki bir nechta serverga (replica) ma'lumot ko'chirish; standart holatda **asinxron**, replikalar doimiy ulanib turishi shart emas. Asosi — **binary log**; replika joyni yo binlog fayl va pozitsiyasi, yo **GTID** (global tranzaksiya identifikatori, 66-bobda ko'rilgan) bilan kuzatadi.
- **Slow query log** (7.4.5): `long_query_time` soniyadan uzoq bajarilgan va kamida `min_examined_row_limit` qatorni ko'rib chiqqan so'rovlar. Xulosa uchun — `mysqldumpslow`.
- **Performance Schema** (29) — server bajarilishini past darajada kuzatish; **sys** sxemasi (30) — uning ma'lumotlarini tushunish oson view'lar to'plami, standart o'rnatilgan. Hujjat (30.4.3): `x$` prefiksisiz view'lar o'qish uchun (vaqt birliklari bilan formatlangan), `x$` li — xom qiymatlar (pikosekund).

### SQLite

SQLite — ilova ichidagi baza; serverlar orasida replikatsiya va server statistikasi tushunchasi yo'q. Bu bob unga tegishli emas.

## Kod

Misollar PostgreSQL 18.6 va MySQL 9.7.2 da ishga tushirilgan. Replikatsiya uchun — 66-bobdagi test klaster (5433-port) primary sifatida.

### Streaming replikatsiya

`pg_basebackup -R` — asosiy zaxira olib, standby sozlamalarini (`standby.signal`, `primary_conninfo`) o'zi yozadi. Standby — 5435-port. (`primary_conninfo` qatori qisqartirilgan.)

```text
$ pg_basebackup -p 5433 -U postgres -D standby -R -X stream
$ ls standby | grep -E "signal|auto"
postgresql.auto.conf
standby.signal
$ grep primary_conninfo standby/postgresql.auto.conf
primary_conninfo = '… port=5433 … target_session_attrs=any load_balance_hosts=disable'
$ psql -p 5433 -c "INSERT INTO tolovlar VALUES (5001, 500)"
INSERT 0 1
$ psql -p 5435 -c "SELECT * FROM tolovlar WHERE id = 5001"
  id  | summa 
------+-------
 5001 |   500
(1 row)

$ psql -p 5435 -c "INSERT INTO tolovlar VALUES (5002, 1)"
ERROR:  cannot execute INSERT in a read-only transaction
$ psql -p 5433 -c "SELECT application_name, state, sync_state, pg_current_wal_lsn() AS joriy, replay_lsn, replay_lag FROM pg_stat_replication"
 application_name |   state   | sync_state |   joriy   | replay_lsn |   replay_lag    
------------------+-----------+------------+-----------+------------+-----------------
 walreceiver      | streaming | async      | 0/70050E0 | 0/70050E0  | 00:00:00.027524
(1 row)
```

- `-R` `standby.signal` va `postgresql.auto.conf` dagi `primary_conninfo` ni yaratdi.
- Primary'ga yozilgan `5001` standby'da darhol ko'rindi.
- Standby'ga yozish — `cannot execute INSERT in a read-only transaction`: hot standby faqat o'qiydi.
- `pg_stat_replication`: `state = streaming`, `sync_state = async` (standart), standby oxirgi LSN'gacha o'ynatgan (`replay_lsn = joriy`), `replay_lag` — 27 ms.

### Logical replikatsiya

Nashriyotchi — 5433 (`wal_level = logical` bilan qayta ishga tushirilgan), obunachi — asosiy server (5432), `obunachi` bazasi. Obunachida jadval tuzilishi oldindan yaratiladi:

```text
-- nashriyotchi (5433):
CREATE TABLE narxlar (id int PRIMARY KEY, mahsulot text, narx int);
INSERT INTO narxlar VALUES (1, 'non', 5000), (2, 'sut', 12000);
CREATE PUBLICATION narx_nashri FOR TABLE narxlar;
CREATE TABLE
INSERT 0 2
CREATE PUBLICATION
-- obunachi (5432, obunachi bazasi):
CREATE TABLE narxlar (id int PRIMARY KEY, mahsulot text, narx int);
CREATE SUBSCRIPTION narx_obuna CONNECTION 'port=5433 dbname=postgres user=postgres' PUBLICATION narx_nashri;
CREATE TABLE
NOTICE:  created replication slot "narx_obuna" on publisher
CREATE SUBSCRIPTION
SELECT * FROM narxlar ORDER BY id;  -- obunachida
 id | mahsulot | narx  
----+----------+-------
  1 | non      |  5000
  2 | sut      | 12000
(2 rows)

UPDATE narxlar SET narx = 5500 WHERE id = 1;  -- nashriyotchida
UPDATE 1
SELECT * FROM narxlar ORDER BY id;  -- obunachida
 id | mahsulot | narx  
----+----------+-------
  1 | non      |  5500
  2 | sut      | 12000
(2 rows)
```

- `CREATE SUBSCRIPTION` nashriyotchida **replication slot** yaratdi va boshlang'ich ma'lumotni ko'chirdi (2 qator).
- Nashriyotchidagi `UPDATE` obunachiga yetib keldi (5500).
- Faqat `narxlar` jadvali ko'chdi — fizik replikatsiyadan farqli, butun klaster emas.

### `pg_stat_statements`

Asosiy server `shared_preload_libraries = pg_stat_statements` bilan qayta ishga tushirilgan; `dokon` bazasida (66-bob):

```text
 tozalandi 
-----------
 t
(1 row)

 count 
-------
   200
(1 row)

 count 
-------
   200
(1 row)

 count 
-------
   200
(1 row)

 id |   ism   
----+---------
  1 | Mijoz 1
(1 row)

 id |   ism   
----+---------
  2 | Mijoz 2
(1 row)

 calls | jami_ms | ortacha_ms | rows |                       query                       
-------+---------+------------+------+---------------------------------------------------
     3 |   16.81 |       5.60 |    3 | SELECT count(*) FROM buyurtmalar WHERE summa = $1
     2 |    0.01 |       0.01 |    2 | SELECT * FROM mijozlar WHERE id = $1
(2 rows)
```

- Uch xil konstantali so'rov — **bitta** qator (`summa = $1`), `calls = 3`.
- `total_exec_time` bo'yicha saralash — server vaqtining eng ko'p qismini qaysi so'rov olayotganini ko'rsatadi: `buyurtmalar` dagi indekssiz shart (16.8 ms, 47-bob), `mijozlar` dagi birlamchi kalit bo'yicha qidiruv — 0.01 ms.

## Dialektlar

### MySQL

**Slow query log.** `SET GLOBAL slow_query_log = ON, long_query_time = 0.5` bitta ulanishda, so'rovlar — **yangi** ulanishda:

```text
+-------------------+
| @@long_query_time |
+-------------------+
|          0.500000 |
+-------------------+
+----------+
| sleep(1) |
+----------+
|        0 |
+----------+
+----------+
| count(*) |
+----------+
|     5600 |
+----------+
```

Jurnal fayli (oxirgi qatorlar):

```text
# Time: 2026-11-08T06:21:47.193054Z
# User@Host: root[root] @ localhost []  Id:    99
# Query_time: 1.006022  Lock_time: 0.000000 Rows_sent: 1  Rows_examined: 1
SET timestamp=1794118906;
SELECT sleep(1);
```

- `sleep(1)` — `Query_time: 1.006022`, yozildi; `JOIN` li so'rov — 0.5 s dan tez, yozilmadi.
- Birinchi urinishda (sozlama va so'rovlar **bitta** sessiyada) jurnal bo'sh qoldi. MySQL hujjati (7.1.9 Using System Variables): klient sessiya o'zgaruvchilari **ulanish paytida** global qiymatlardan olinadi — `SET GLOBAL` mavjud sessiyaning `long_query_time` ini o'zgartirmaydi.

**`sys` va Performance Schema.** `sys.statement_analysis` ning `total_latency` ustuni formatlangan matn (`5.01 s`, `17.03 s`) — u bo'yicha `ORDER BY` **matn sifatida** saraladi (sinovda 5.01 s 17.03 s dan oldin chiqdi). Hujjatdagidek, saralash va hisob uchun — `x$` view:

```sql
SELECT exec_count, sys.format_time(total_latency) AS jami, rows_examined_avg, query
FROM sys.x$statement_analysis
WHERE query LIKE 'SELECT COUNT ( * ) FROM `dokon`%' OR query LIKE 'SELECT `sleep`%'
ORDER BY total_latency DESC LIMIT 3;
```

```text
+------------+----------+-------------------+-------------------------------------------------------------------+
| exec_count | jami     | rows_examined_avg | query                                                             |
+------------+----------+-------------------+-------------------------------------------------------------------+
|          5 | 17.03 s  |                 1 | SELECT `sleep` (?)                                                |
|          2 | 5.01 s   |                 1 | SELECT `sleep` (?)                                                |
|          1 | 32.35 ms |            200000 | SELECT COUNT ( * ) FROM `dokon` . `buyurtmalar` WHERE `summa` = ? |
+------------+----------+-------------------+-------------------------------------------------------------------+
```

`pg_stat_statements` ning o'xshashi: normallashtirilgan so'rov (`?`), bajarilishlar soni, jami vaqt va **o'rtacha ko'rib chiqilgan qatorlar** — `summa = ?` so'rovi har safar 200 000 qatorni ko'rgan, ya'ni indeks yo'q.

MySQL replikatsiyasi bu bobda sinalmagan (ikkinchi MySQL server kerak).

### Qisqacha jadval

| | PostgreSQL | MySQL |
| --- | --- | --- |
| Fizik replikatsiya | Streaming (WAL), `standby.signal`, `pg_basebackup -R` | — |
| Mantiqiy replikatsiya | `PUBLICATION` / `SUBSCRIPTION` | — (MySQL replikatsiyasi binary log asosida, sinalmagan) |
| Standart rejim | Asinxron | Asinxron |
| Kechikishni kuzatish | `pg_stat_replication` (`replay_lag`) | `SHOW REPLICA STATUS` (sinalmagan) |
| So'rov statistikasi | `pg_stat_statements` (`shared_preload_libraries`, qayta ishga tushirish) | Performance Schema, `sys.statement_analysis` (standart) |
| Sekin so'rovlar jurnali | `log_min_duration_statement` (sinalmagan) | Slow query log, `long_query_time` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Replikani zaxira o'rnida ko'rish | Xato `DELETE` replikaga ham yetib boradi | Replika — mavjudlik uchun; zaxira va PITR — alohida (66-bob) |
| Asinxron replikada "yo'qotish nol" deb hisoblash | Hujjat: failover paytidagi kechikishcha commit yo'qolishi mumkin | Lag'ni kuzatish; zarur bo'lsa sinxron replikatsiya |
| Replikadan o'qib, darhol yozilgan ma'lumotni kutish | Kechikish tufayli eski ma'lumot | O'z yozganini o'qish kerak bo'lgan so'rovlar — primary'da |
| Logical replikatsiyada obunachiga ham yozish | Hujjat: ziddiyatlar paydo bo'ladi | Obunachini faqat o'qish uchun ishlatish |
| Ishlatilmayotgan replication slot'ni qoldirish | Primary WAL'ni o'chira olmaydi — disk to'ladi | Keraksiz obuna/slot'ni o'chirish (sinovdagidek `DROP SUBSCRIPTION`) |
| `pg_stat_statements` ni faqat `CREATE EXTENSION` bilan yoqmoqchi bo'lish | Hujjat: `shared_preload_libraries` va qayta ishga tushirish kerak | Konfiguratsiyaga qo'shish |
| MySQL'da `SET GLOBAL` dan keyin o'sha sessiyada sinash | Sessiya qiymati o'zgarmagan (sinovda jurnal bo'sh) | Yangi ulanishda tekshirish |
| `sys` ning formatlangan ustunlari bo'yicha saralash | Matn sifatida saralanadi | `x$` view'lar |

## Amaliyot

1. Standby'da `SELECT pg_is_in_recovery(), pg_last_wal_replay_lsn()` ni bajaring.
2. Primary'da 100 000 qator qo'shib, darhol `pg_stat_replication.replay_lag` ni o'lchang.
3. `SELECT pg_promote()` bilan standby'ni primary'ga aylantiring. Endi unga yozish mumkinmi?
4. `pg_stat_statements` dan `mean_exec_time` bo'yicha eng sekin 5 so'rovni oling va 45-bobdagi `EXPLAIN` bilan tahlil qiling.
5. MySQL'da `sys.statements_with_full_table_scans` view'ini o'qing — `buyurtmalar` so'rovi u yerda bormi?

## Rasmiy hujjat

- PostgreSQL — 26.2. Log-Shipping Standby Servers: <https://www.postgresql.org/docs/18/warm-standby.html>
- PostgreSQL — 29. Logical Replication: <https://www.postgresql.org/docs/18/logical-replication.html>
- PostgreSQL — F.32. pg_stat_statements: <https://www.postgresql.org/docs/18/pgstatstatements.html>
- PostgreSQL — pg_basebackup: <https://www.postgresql.org/docs/18/app-pgbasebackup.html>
- MySQL — 19 Replication: <https://dev.mysql.com/doc/refman/9.7/en/replication.html>
- MySQL — 7.4.5 The Slow Query Log: <https://dev.mysql.com/doc/refman/9.7/en/slow-query-log.html>
- MySQL — 7.1.9 Using System Variables: <https://dev.mysql.com/doc/refman/9.7/en/using-system-variables.html>
- MySQL — 29 MySQL Performance Schema: <https://dev.mysql.com/doc/refman/9.7/en/performance-schema.html>
- MySQL — 30.4.3 sys Schema Views: <https://dev.mysql.com/doc/refman/9.7/en/sys-schema-views.html>
