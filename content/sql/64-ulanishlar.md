# 64 — Ulanishlar

[← Oldingi: Sxemani xavfsiz o'zgartirish](63-sxemani-xavfsiz-ozgartirish.md) · [Mundarija](README.md)

## Tushuncha

Ilova bazaga **ulanish** (connection) orqali gapiradi. Har ulanish server uchun resurs: PostgreSQL hujjati (1.2. Architectural Fundamentals) — server har ulanish uchun **yangi jarayon** (process) ishga tushiradi; unga xotira va semafor kerak. Ulanishlar soni cheklangan, va chegaraga yetganda yangi ulanish **rad etiladi** — sayt "bazaga ulanib bo'lmadi" xatosini beradi, garchi baza o'zi bo'sh tursa ham.

Odatiy holat: veb-ilovaning 20 ta nusxasi (konteyner), har birida 10 ulanishli pul (pool) — 200 ulanish. PostgreSQL standart holatda 100 ni qabul qiladi.

### PostgreSQL: `max_connections`

PostgreSQL hujjati (19.3.1. Connection Settings):

- `max_connections` — serverga bir vaqtdagi ulanishlar maksimumi. Standart **odatda 100** (yadro sozlamalari ko'tarmasa, kamroq — `initdb` paytida aniqlanadi). Faqat server ishga tushganda o'rnatiladi.
- `superuser_reserved_connections` — **superuser**lar uchun zaxira slotlar (standart 3). Faol ulanishlar `max_connections − superuser_reserved_connections` ga yetganda, yangi ulanishni faqat superuser oladi. Hujjat: bu — favqulodda holat uchun oxirgi zaxira.
- `reserved_connections` — `pg_use_reserved_connections` rolidagilar uchun zaxira.

Ko'p ulanish nima uchun yomon — hujjat (18.4. Managing Kernel Resources): har ruxsat etilgan ulanishga semafor ajratiladi; server xotiradan chiqsa, ba'zan sabab — serverga juda ko'p ulanishga ruxsat berilgani. Hujjat: ko'p hollarda **`max_connections` ni kamaytirib, tashqi connection pooling dasturidan foydalanish** yaxshiroq.

### Connection pooler: PgBouncer

**Pooler** — ilova va baza orasidagi oraliq server: ilova minglab ulanish ochadi, pooler esa bazaga oz sonli, qayta ishlatiladigan ulanish bilan boradi. PgBouncer hujjati (Usage) uch rejimni beradi:

| Rejim | Server ulanishi klientga qachon beriladi | Hujjat bahosi |
| --- | --- | --- |
| **Session** | Klient ulanib turgan butun vaqtga; klient uzilganda pulga qaytadi | "Eng muloyim", standart |
| **Transaction** | Faqat **tranzaksiya** davomida; tranzaksiya tugashi bilan pulga qaytadi | — |
| **Statement** | Faqat bitta so'rov davomida; ko'p operatorli tranzaksiyalar taqiqlanadi | "Eng agressiv" |

Transaction rejimi ulanishlarni eng yaxshi tejaydi, lekin **sessiya holati** yo'qoladi: navbatdagi tranzaksiya boshqa server ulanishiga tushishi mumkin. PgBouncer hujjatidagi xususiyatlar jadvali (Features): transaction rejimida `SET`/`RESET`, `LISTEN`, **sessiya darajasidagi advisory qulflar** (54-bob) — **"Never"**. Protokol darajasidagi prepared statement'lar esa `max_prepared_statements` sozlamasi bilan qo'llab-quvvatlanadi.

### MySQL: `Too many connections`

MySQL hujjati (B.3.2.5 Too many connections): klientlar shu xatoni olsa — barcha ruxsat etilgan ulanishlar band; son `max_connections` bilan boshqariladi. Hujjat: `mysqld` aslida **`max_connections + 1`** ulanishga ruxsat beradi — qo'shimchasi `CONNECTION_ADMIN` (yoki eskirgan `SUPER`) huquqli hisoblar uchun zaxira. Bu huquqni oddiy foydalanuvchilarga emas, ma'murlarga bersangiz, ma'mur chegaraga yetganda ham ulanib, `SHOW PROCESSLIST` bilan muammoni tekshira oladi.

### SQLite

SQLite'da server yo'q — "ulanish" — ilova ichida baza faylini ochish. Ulanishlar soniga server chegarasi yo'q; cheklov boshqa joyda — bir vaqtda faqat bitta yozuvchi (50-, 53-boblar).

## Kod

Misollar PostgreSQL 18.6, PgBouncer 1.26.1 (Homebrew) va MySQL 9.7.2 da ishga tushirilgan.

### Chegaraga yetganda

Natijani ko'rsatish uchun lokal server vaqtincha `max_connections=6` bilan qayta ishga tushirildi (keyin standartga qaytarildi). Oddiy rol `ishchi` 4 ta ulanish ochishga urinadi (har biri `pg_sleep(6)`), keyin yana bittasi; shu orada superuser `pg_stat_activity` ni o'qiydi:

```text
max_connections 
-----------------
 6
(1 row)

 superuser_reserved_connections 
--------------------------------
 3
(1 row)

 reserved_connections 
----------------------
 0
(1 row)
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL:  remaining connection slots are reserved for roles with the SUPERUSER attribute
psql: error: connection to server on socket "/tmp/.s.PGSQL.5432" failed: FATAL:  remaining connection slots are reserved for roles with the SUPERUSER attribute
usename  | state  | count 
----------+--------+-------
 ishchi   | active |     3
 postgres | active |     1
(2 rows)
```

- 6 slotdan 3 tasi superuser uchun zaxirada — `ishchi` faqat **3** ta ulanish oldi.
- 4-ulanish va undan keyingisi: `remaining connection slots are reserved for roles with the SUPERUSER attribute`.
- Superuser esa ulandi (`postgres | active | 1`) — hujjatdagi "favqulodda zaxira" aynan shu: ilova barcha slotlarni egallasa ham, ma'mur kirib, sababni topa oladi.

### PgBouncer: 20 klient — 2 server ulanishi

`pgbouncer.ini` (asosiy qismlari):

```ini
[databases]
postgres = host=127.0.0.1 port=5432 dbname=postgres user=postgres

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = trust
pool_mode = transaction
default_pool_size = 2
admin_users = postgres
```

(`auth_type = trust` — faqat lokal sinov uchun; production'da parol bilan autentifikatsiya.) 20 ta klient bir vaqtda PgBouncer'ga (`6432`) ulanib, har biri `pg_sleep(1)` bajaradi. PgBouncer ma'muriy konsoli (`pgbouncer` bazasi) va PostgreSQL'ning o'zidan:

```text
database  |   user    | cl_active | cl_waiting | cl_active_cancel_req | cl_waiting_cancel_req | sv_active | sv_active_cancel | sv_being_canceled | sv_idle | sv_used | sv_tested | sv_login | maxwait | maxwait_us |  pool_mode  | load_balance_hosts 
-----------+-----------+-----------+------------+----------------------+-----------------------+-----------+------------------+-------------------+---------+---------+-----------+----------+---------+------------+-------------+--------------------
 pgbouncer | pgbouncer |         1 |          0 |                    0 |                     0 |         0 |                0 |                 0 |       0 |       0 |         0 |        0 |       0 |          0 | statement   | 
 postgres  | postgres  |         2 |         16 |                    0 |                     0 |         2 |                0 |                 0 |       0 |       0 |         0 |        0 |       1 |     545395 | transaction | 
(2 rows)

server_ulanishlari 
--------------------
                  2
(1 row)

NOTICE:  No server connection available in postgres backend, client being queued
```

- `cl_active = 2`, `cl_waiting = 16` — klientlar PgBouncer'da **navbatda** kutyapti (qolganlari tugab ulgurgan).
- `sv_active = 2` — bazaga atigi **2** ta ulanish; PostgreSQL ham `2` ni ko'rsatadi.
- Navbatdagi klientlarga PgBouncer `NOTICE: No server connection available …, client being queued` yubordi.

PostgreSQL 20 ulanish o'rniga 2 ta bilan ishladi; klientlar xato emas, **kutish** oldi.

### Transaction rejimi: `SET` yo'qoladi

Bir klient `SET app.dokon = '1'` qiladi (61-bobdagi RLS uslubi), keyin uch marta qaysi server jarayoniga tushganini (`pg_backend_pid()`) va sozlamani so'raydi; shu paytda boshqa klientlar ham pulni ishlatyapti:

```sql
SET app.dokon = '1';
SELECT pg_backend_pid() AS server, current_setting('app.dokon', true) AS dokon;
SELECT pg_sleep(0.3);
SELECT pg_backend_pid() AS server, current_setting('app.dokon', true) AS dokon;
SELECT pg_sleep(0.3);
SELECT pg_backend_pid() AS server, current_setting('app.dokon', true) AS dokon;
```

```text
server | dokon 
--------+-------
  55134 | 
(1 row)

 pg_sleep 
----------
 
(1 row)

 server | dokon 
--------+-------
  55134 | 
(1 row)

 pg_sleep 
----------
 
(1 row)

 server | dokon 
--------+-------
  55131 | 1
(1 row)
```

- `SET` server jarayoni **55131** da bajarildi; keyingi ikki so'rov **55134** ga tushdi — u yerda `app.dokon` **bo'sh**.
- Uchinchi so'rov tasodifan yana 55131 ga tushdi va `1` ni ko'rdi.
- Ya'ni ilova uchun sozlama "goh bor, goh yo'q". RLS (61-bob) bilan bu jiddiy: boshqa so'rov boshqa do'konning qiymatini meros qilib olishi mumkin.

Yechim — transaction rejimida sessiya holatiga tayanmaslik: sozlamani **har tranzaksiya ichida** `SET LOCAL` bilan berish (u tranzaksiya oxirida o'zi bekor bo'ladi va tranzaksiya bitta server ulanishida bajariladi) yoki session rejimi.

## Dialektlar

### MySQL

Standart `max_connections` — **151** (sinov serverida). Vaqtincha `SET GLOBAL max_connections = 3`, oddiy foydalanuvchi `ishchi` 4 ta ulanish ochadi (har biri `sleep(5)`), shu orada `root`:

```text
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1040 (08004): Too many connections
+--------+----------+
| user   | count(*) |
+--------+----------+
| ishchi |        3 |
| root   |        1 |
+--------+----------+
```

- 3 ta `ishchi` ulandi, 4-chisi — `ERROR 1040 (08004): Too many connections`.
- `root` baribir ulandi — hujjatdagi **+1** zaxira slot (`CONNECTION_ADMIN`).

Sinovdan keyin `max_connections` 151 ga qaytarildi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Chegara | `max_connections` (odatda 100), faqat qayta ishga tushirishda | `max_connections` (sinovda 151), `SET GLOBAL` bilan | Server yo'q |
| Ma'mur uchun zaxira | `superuser_reserved_connections` (3), `reserved_connections` | +1 ulanish — `CONNECTION_ADMIN` | — |
| Chegaradagi xato | `remaining connection slots are reserved …` | `1040 Too many connections` | — |
| Hujjat tavsiyasi | `max_connections` ni kamaytirib, tashqi pooler | `max_connections` ni oshirish; ma'murga `CONNECTION_ADMIN` | — |
| Ulanishlarni ko'rish | `pg_stat_activity` | `information_schema.processlist`, `SHOW PROCESSLIST` | — |

`—` — tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Har ilova nusxasi katta pul bilan, pooler'siz | Nusxalar ko'paysa — chegaraga urilish (sinovda) | Pooler (PgBouncer) yoki pul hajmini nusxalar soniga moslash |
| PG'da muammoni `max_connections` ni oshirib hal qilish | Hujjat: ko'p ulanish xotirani tugatishi mumkin | Hujjat tavsiyasi: kamroq ulanish + tashqi pooler |
| Transaction rejimida `SET`, sessiya advisory qulfi, `LISTEN` | Keyingi so'rov boshqa server ulanishiga tushadi (sinovda `app.dokon` yo'qoldi) | `SET LOCAL` tranzaksiya ichida; yoki session rejimi |
| Ilovaga superuser / `CONNECTION_ADMIN` berish | Ma'mur uchun zaxira slotni ilova egallaydi — chegarada hech kim kira olmaydi | Ilova — oddiy rol (60-bob) |
| Bo'sh turgan ulanishlarni ochiq qoldirish (`idle in transaction`) | Slot va qulflar band (52-, 53-boblar) | Pul sozlamalarida idle vaqti; PG: `idle_in_transaction_session_timeout` |

## Amaliyot

1. `pg_stat_activity` dan `state` bo'yicha ulanishlar sonini va eng uzoq `idle in transaction` ulanishni toping.
2. `ALTER ROLE ishchi CONNECTION LIMIT 2` bilan rol darajasidagi cheklovni sinang. Xato matni `max_connections` nikidan farq qiladimi?
3. PgBouncer'ni `pool_mode = session` ga o'tkazib, `SET` misolini takrorlang.
4. `SET LOCAL app.dokon = '1'` ni `BEGIN … COMMIT` ichida, transaction rejimida sinang. Har so'rovda qiymat to'g'rimi?
5. MySQL'da `SHOW STATUS LIKE 'Max_used_connections'` va `Threads_connected` ni sinovdan oldin va keyin solishtiring.

## Rasmiy hujjat

- PostgreSQL — 19.3.1. Connection Settings: <https://www.postgresql.org/docs/18/runtime-config-connection.html>
- PostgreSQL — 1.2. Architectural Fundamentals: <https://www.postgresql.org/docs/18/tutorial-arch.html>
- PostgreSQL — 18.4. Managing Kernel Resources: <https://www.postgresql.org/docs/18/kernel-resources.html>
- PostgreSQL — 27.2.3. `pg_stat_activity`: <https://www.postgresql.org/docs/18/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW>
- PgBouncer — Usage (pooling modes): <https://www.pgbouncer.org/usage.html>
- PgBouncer — Features: <https://www.pgbouncer.org/features.html>
- MySQL — B.3.2.5 Too many connections: <https://dev.mysql.com/doc/refman/9.7/en/too-many-connections.html>
