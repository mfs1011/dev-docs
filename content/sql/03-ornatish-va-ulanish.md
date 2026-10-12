# 03 — O'rnatish va ulanish

[← Oldingi: PostgreSQL, MySQL va SQLite](02-uch-tizim.md) · [Mundarija](README.md) · [Keyingi: SQL sintaksisi →](04-sql-sintaksisi.md)

## Tushuncha

Client/server bazaga ulanish uchun mijoz to'rtta narsani bilishi kerak. PostgreSQL hujjati ularni shunday sanaydi:

| Parametr | Ma'nosi | PostgreSQL'da sukut bo'yicha | MySQL'da sukut bo'yicha |
| --- | --- | --- | --- |
| **Host** | Server qaysi kompyuterda | Unix'da — lokal socket fayli | `localhost`, Unix'da socket fayli orqali |
| **Port** | Server qaysi raqamli "eshik"ni tinglaydi | Yig'ishda belgilanadi, odatda 5432 | 3306 |
| **Foydalanuvchi** | Qaysi baza foydalanuvchisi nomidan | Operatsion tizimdagi foydalanuvchi nomi | Unix'da — tizimdagi foydalanuvchi nomi |
| **Baza** | Qaysi bazaga | Foydalanuvchi nomi bilan bir xil | Tanlanmaydi |

Ularga ko'pincha **parol** ham qo'shiladi.

**Socket va TCP/IP.** Mijoz va server bitta kompyuterda bo'lsa, ular tarmoqsiz, maxsus **Unix socket** fayli orqali gaplashishi mumkin. Boshqa kompyuterdagi serverga esa **TCP/IP** tarmog'i orqali ulaniladi.

- **PostgreSQL**'da host ko'rsatilmasa, `psql` lokal socket orqali ulanadi. Windows'da esa TCP/IP orqali `localhost` ga ulanadi.
- **MySQL** `localhost` nomini **alohida** tushunadi. Unix'da `localhost` deb yozilsa, mijoz tarmoqqa emas, socket fayliga ulanadi. Hujjat bu boshqa tarmoq dasturlaridan "kutganingizdan farq qilishi mumkin" deb ogohlantiradi. TCP orqali ulanish uchun `127.0.0.1` yoki `--protocol=TCP` yoziladi.

SQLite'da bularning hech biri yo'q: ulanish — bu shunchaki faylni ochish.

## O'rnatish

### Rasmiy yo'llar

**PostgreSQL.** Hujjatga ko'ra o'rnatishning tavsiya etilgan usuli — operatsion tizim uchun tayyor **binary paketlar**. Manba koddan yig'ish faqat PostgreSQL'ning o'zini yoki kengaytmalarini ishlab chiquvchilarga tavsiya qilinadi. Har tizim uchun yo'riqnoma <https://www.postgresql.org/download/> sahifasida.

macOS uchun rasmiy sahifa quyidagi manbalarni sanaydi:

- EDB o'rnatuvchisi (pgAdmin grafik dasturi bilan birga);
- Postgres.app;
- Homebrew (`postgresql@NN`, bu yerda NN — asosiy versiya);
- MacPorts;
- Fink.

**MySQL.** MySQL 9.7 qo'llanmasining "Installing MySQL" bobi har tizim uchun yo'llarni beradi. macOS uchun:

- **Native Package Installer** (DMG) — oddiy macOS o'rnatuvchisi, administrator huquqi kerak;
- **siqilgan TAR arxiv** — terminal orqali, administrator huquqisiz, istalgan papkaga.

Qo'llanmada Docker image ham bor. U **Oracle Container Registry**'dan olinadi (`container-registry.oracle.com/mysql/community-server`). Hujjatga ko'ra teg ko'rsatilmasa, eng yangi **Innovation** relizi olinadi. LTS uchun tegni aniq yozish kerak: `9.7`.

**SQLite.** Rasmiy yuklab olish sahifasida tayyor dasturlar va manba kodi bor. Ko'p operatsion tizimlarda `sqlite3` oldindan o'rnatilgan bo'ladi. Lekin uning versiyasi va qanday yig'ilgani sizning tizimingizga bog'liq (1-bobdagi `SQLITE_DQS` misoli).

### Bu qo'llanmaning sinov muhiti

Kitobdagi misollar macOS'da quyidagicha o'rnatilgan muhitda sinalgan:

| Tizim | Qanday o'rnatilgan | Izoh |
| --- | --- | --- |
| PostgreSQL 18.6 | Homebrew: `brew install postgresql@18` | PostgreSQL saytidagi macOS ro'yxatida bor |
| MySQL 9.7.2 | Homebrew: `brew install mysql@9.7` | Bu yo'l MySQL qo'llanmasida **yo'q**. Rasmiy yo'llar yuqorida |
| SQLite 3.54.0 | Rasmiy manba kodidan: `./configure && make` | Arxiv SHA3-256 summasi yuklab olish sahifasidagi bilan solishtirilgan |

Docker misollari bu kitobda keltirilmagan, chunki sinov muhitida ishga tushirilmagan. Docker bilan o'rnatmoqchi bo'lsangiz, MySQL qo'llanmasidagi "Deploying MySQL on Linux with Docker Containers" bo'limiga qarang.

### PostgreSQL: klasterni yaratish va serverni ishga tushirish

Paket ko'pincha bularni o'zi qiladi. Hujjat ham "paketning o'z vositasi bo'lsa, shuni ishlating" deydi. Lekin nima bo'layotganini tushunish uchun qo'lda bajaramiz.

**1. Klasterni yaratish.** Avval diskda ma'lumot papkasi (*data directory*) tayyorlanadi. Hujjat buni **klaster** deb ataydi: bitta server boshqaradigan bazalar to'plami. Papka `initdb` dasturi bilan yaratiladi:

```bash
initdb -D ~/pg/data -U postgres -E UTF8 --locale=en_US.UTF-8 \
       -A scram-sha-256 --pwfile=parol.txt
```

| Parametr | Ma'nosi |
| --- | --- |
| `-D` | Ma'lumot papkasi |
| `-U postgres` | Bosh foydalanuvchi (superuser) nomi |
| `-E UTF8` | Kodlash (11-bob) |
| `--locale` | Til va tartiblash qoidalari (11-bob) |
| `-A scram-sha-256` | Sukut bo'yicha autentifikatsiya usuli — parol bilan |
| `--pwfile` | Bosh foydalanuvchi paroli shu fayldan o'qiladi |

Natija (qisqartirilgan):

```text
The database cluster will be initialized with locale "en_US.UTF-8".
The default text search configuration will be set to "english".

Data page checksums are enabled.

creating directory ~/pg/data ... ok
...
selecting default "max_connections" ... 100
selecting default "shared_buffers" ... 128MB
selecting default time zone ... Asia/Tashkent
...
Success. You can now start the database server using:

    '/opt/homebrew/opt/postgresql@18/bin/pg_ctl' -D ~/pg/data -l logfile start
```

**`-A` nega muhim.** Hujjatga ko'ra sukut bo'yicha sozlama **har qanday lokal foydalanuvchiga** bazaga ulanishga, hatto superuser bo'lishga ham ruxsat beradi. Bu `trust` usuli, ya'ni parol so'ralmaydi. Hujjat kompyuterdagi boshqa foydalanuvchilarga ishonmasangiz, ikki narsani tavsiya qiladi:

- parol berish (`-W`, `--pwprompt` yoki `--pwfile`);
- `-A scram-sha-256` ni ko'rsatish.

`-A` siz `initdb` bu haqda o'zi ogohlantiradi:

```text
initdb: warning: enabling "trust" authentication for local connections
```

`initdb` dan keyin klasterda uchta baza bo'ladi:

- `postgres` — yordamchi dasturlar uchun sukut bo'yicha baza;
- `template1` va `template0` — yangi bazalar uchun shablonlar (5-bob).

**2. Serverni ishga tushirish.** Buning uchun `pg_ctl` ishlatiladi. U `postgres` server dasturini fonda ishga tushiradi va chiqishini log fayliga yozadi:

```bash
pg_ctl -D ~/pg/data -l ~/pg/server.log start
```

```text
waiting for server to start.... done
server started
```

To'xtatish:

```bash
pg_ctl -D ~/pg/data stop
```

```text
waiting for server to shut down.... done
server stopped
```

### MySQL: ma'lumot papkasini tayyorlash

MySQL'da ham ma'lumot papkasi server ishga tushishidan oldin tayyorlanadi. Buni `mysqld` ning o'zi bajaradi. Hujjat ikki variantni beradi:

- `--initialize` — **"sukut bo'yicha xavfsiz"**. `root` uchun tasodifiy vaqtinchalik parol yaratiladi va u **muddati o'tgan** deb belgilanadi;
- `--initialize-insecure` — `root` parolsiz yaratiladi. Hujjatga ko'ra bu xavfsiz emas, parolni production'dan oldin berish kerak.

```bash
mysqld --initialize --datadir=~/my/data
```

```text
[System] [MY-015017] [Server] MySQL Server Initialization - start.
[Note] [MY-010454] [Server] A temporary password is generated for root@localhost: *?(4lVN&wKdt
[System] [MY-015018] [Server] MySQL Server Initialization - end.
```

Vaqtinchalik parol bilan ulanib, oddiy so'rov yuborib bo'lmaydi:

```text
Please use --connect-expired-password option or invoke mysql in interactive mode.
```

Avval parolni almashtirish kerak:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Yangi-Parol-2026';
```

## Kod: ulanish

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Sinov serverlari: PostgreSQL — 5432-port, MySQL — 3307-port.

### `psql` — PostgreSQL mijozi

**Parametrlar bilan.** `-h` — host, `-p` — port, `-U` — foydalanuvchi, `-d` — baza:

```bash
psql -h localhost -p 5432 -U postgres -d qollanma \
     -c "SELECT current_user, current_database(), inet_server_port();"
```

```text
 current_user | current_database | inet_server_port 
--------------+------------------+------------------
 postgres     | qollanma         |             5432
(1 row)
```

`-c` bitta buyruqni bajarib, chiqib ketadi. Usiz `psql` interaktiv rejimda ochiladi.

**Ulanish satri.** Barcha parametrlarni bitta satrda berish mumkin. Bu ilovalarda keng ishlatiladi. libpq hujjati ikki formatni qabul qiladi:

- **kalit=qiymat** formati:

  ```text
  host=localhost port=5432 user=postgres dbname=qollanma
  ```

- **URI** formati. Umumiy ko'rinishi:

  ```text
  postgresql://[foydalanuvchi[:parol]@][host][:port][/baza][?parametr=qiymat&...]
  ```

  Boshi `postgresql://` yoki `postgres://` bo'lishi mumkin. Har qismi ixtiyoriy.

URI orqali ulanib, ilova nomini ham beramiz:

```bash
psql "postgresql://postgres@localhost:5432/qollanma?application_name=qollanma-darslik" \
     -c "SELECT application_name FROM pg_stat_activity WHERE pid = pg_backend_pid();"
```

```text
 application_name 
------------------
 qollanma-darslik
(1 row)
```

`application_name` server tomonida `pg_stat_activity` da ko'rinadi. Bitta bazaga ko'p ilova ulanganda qaysi ulanish kimniki ekanini topish oson bo'ladi.

URI'da maxsus belgilar `%` bilan kodlanadi. Masalan, parol ichida `@` yoki `/` bo'lsa, shunday qilish kerak.

**Muhit o'zgaruvchilari.** Parametrlar berilmasa, libpq ularni muhit o'zgaruvchilaridan oladi: `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE` va boshqalar.

```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGDATABASE=qollanma psql -c '\conninfo'
```

```text
      Connection Information
      Parameter       |   Value   
----------------------+-----------
 Database             | qollanma
 Client User          | postgres
 Host                 | localhost
 Host Address         | ::1
 Server Port          | 5432
 ...
 Backend PID          | 71337
 SSL Connection       | false
 Superuser            | on
 ...
```

`\conninfo` — joriy ulanish haqidagi ma'lumot. Host ko'rsatilmasa, socket orqali ulaniladi va jadvalda `Host` o'rniga `Socket Directory | /tmp` chiqadi.

**Parol: `.pgpass` fayli.** Parol talab qiladigan foydalanuvchi bilan ulanamiz. Server sozlamasida TCP ulanishlar uchun `scram-sha-256` yoqilgan. Parol berilmasa:

```bash
psql -w "postgresql://talaba@localhost:5432/qollanma" -c "SELECT 1"
```

```text
psql: error: connection to server at "localhost" (::1), port 5432 failed: fe_sendauth: no password supplied
```

(`-w` — "parol so'rama". Usiz `psql` parolni klaviaturadan so'raydi.)

Parolni qayerda saqlash kerak? `PGPASSWORD` o'zgaruvchisi bor, lekin libpq hujjati uni **tavsiya qilmaydi**: ba'zi tizimlarda boshqa foydalanuvchilar jarayonlarning muhit o'zgaruvchilarini `ps` orqali ko'ra oladi. Tavsiya etilgan yo'l — **parol fayli**.

Sukut bo'yicha bu uy papkasidagi `~/.pgpass`. Boshqa joyni `PGPASSFILE` bilan ko'rsatish mumkin. Har qatorning formati:

```text
hostname:port:database:username:password
```

Birinchi to'rtta maydonda `*` ishlatish mumkin, u har qanday qiymatga mos keladi. Ulanishga mos kelgan **birinchi** qator ishlatiladi.

```bash
printf 'localhost:5432:qollanma:talaba:Maxfiy-2026\n' > ~/.pgpass
chmod 600 ~/.pgpass
psql "postgresql://talaba@localhost:5432/qollanma" -c "SELECT current_user;"
```

```text
 current_user 
--------------
 talaba
(1 row)
```

Faylni boshqalar o'qiy oladigan bo'lsa, libpq uni **e'tiborsiz qoldiradi**:

```text
WARNING: password file "…/pgpass" has group or world access; permissions should be u=rw (0600) or less
psql: error: connection to server at "localhost" (::1), port 5432 failed: fe_sendauth: no password supplied
```

### `psql` ning o'z buyruqlari

`psql` ga yozilgan, **teskari chiziq** `\` bilan boshlanadigan har narsa **meta-buyruq**. Ularni serverga yubormasdan `psql` ning o'zi bajaradi. Eng ko'p kerak bo'ladiganlari:

| Buyruq | Vazifasi |
| --- | --- |
| `\l` | Bazalar ro'yxati |
| `\c baza` | Boshqa bazaga ulanish |
| `\dt` | Jadvallar ro'yxati |
| `\d jadval` | Jadval tuzilmasi: ustunlar, tiplar, indekslar, cheklovlar |
| `\x` | Natijani "vertikal" ko'rinishda chiqarishni yoqish/o'chirish |
| `\timing` | Har so'rovning bajarilish vaqtini ko'rsatish |
| `\h BUYRUQ` | SQL buyrug'ining sintaksisi |
| `\?` | Barcha meta-buyruqlar |
| `\q` | Chiqish |

Haqiqiy natija:

```text
qollanma=# \dt
            List of tables
 Schema |   Name    | Type  |  Owner   
--------+-----------+-------+----------
 public | talabalar | table | postgres
(1 row)

qollanma=# \d talabalar
             Table "public.talabalar"
 Column |  Type   | Collation | Nullable | Default 
--------+---------+-----------+----------+---------
 id     | integer |           | not null | 
 ism    | text    |           | not null | 
 kurs   | integer |           |          | 
Indexes:
    "talabalar_pkey" PRIMARY KEY, btree (id)

qollanma=# \x
Expanded display is on.
qollanma=# SELECT * FROM talabalar WHERE id = 1;
-[ RECORD 1 ]
id   | 1
ism  | Ali
kurs | 2

qollanma=# \h DROP TABLE
Command:     DROP TABLE
Description: remove a table
Syntax:
DROP TABLE [ IF EXISTS ] name [, ...] [ CASCADE | RESTRICT ]

URL: https://www.postgresql.org/docs/18/sql-droptable.html
```

Taklif belgisining oxiri ham ma'lumot beradi:

- `=#` — siz **superuser**siz, ruxsat tekshiruvlari sizga ta'sir qilmaydi;
- `=>` — oddiy foydalanuvchisiz.

### `mysql` — MySQL mijozi

**Parametrlar bilan.** `-h` — host, `-P` (katta harf) — port, `-u` — foydalanuvchi, `-p` — parol. Oxiridagi so'z — baza nomi.

```bash
mysql -h 127.0.0.1 -P 3307 -u talaba -pMaxfiy-2026 qollanma \
      -e "SELECT CURRENT_USER(), DATABASE(), @@port;"
```

```text
mysql: [Warning] Using a password on the command line interface can be insecure.
CURRENT_USER()	DATABASE()	@@port
talaba@127.0.0.1	qollanma	3307
```

Ikki narsaga e'tibor bering:

1. **Ogohlantirish.** Buyruq satridagi parolni kompyuterdagi boshqa foydalanuvchilar `ps` orqali ko'rishi mumkin. Hujjat `-p` ni **qiymatsiz** yozishni tavsiya qiladi. Shunda mijoz parolni ekranda ko'rsatmasdan so'raydi. Qiymat bilan yozilsa, `-p` va parol orasida **probel bo'lmasligi** kerak.
2. **Format.** Natija jadval emas, tab bilan ajratilgan. Hujjatga ko'ra `mysql` interaktiv ishlaganda natijani jadval ko'rinishida, buyruq yoki pipe orqali ishlaganda tab bilan chiqaradi. Jadval kerak bo'lsa, `--table` qo'shiladi.

**Parol: option fayli.** MySQL'da parametrlarni **option faylida** saqlash mumkin. Hujjatga ko'ra `[client]` guruhini MySQL'ning barcha mijoz dasturlari o'qiydi va parolni yozish uchun aynan shu guruh mos. Fayl faqat sizga ochiq bo'lishi kerak:

```ini
[client]
user=talaba
password=Maxfiy-2026
host=127.0.0.1
port=3307
```

```bash
chmod 600 talaba.cnf
mysql --defaults-extra-file=talaba.cnf qollanma -e "SELECT CURRENT_USER(), DATABASE();"
```

```text
CURRENT_USER()	DATABASE()
talaba@127.0.0.1	qollanma
```

**Socket va TCP.** Ulanish turini mijozning `status` buyrug'i ko'rsatadi:

```text
Connection:		127.0.0.1 via TCP/IP
TCP port:		3307
```

Xuddi shu foydalanuvchi `-h localhost` bilan:

```text
Connection:		Localhost via UNIX socket
UNIX socket:		/Users/…/sql-sinov/my97.sock
```

`localhost` yozilgani uchun mijoz tarmoqqa emas, socket fayliga ulandi.

**MySQL 9.7 da mijoz buyruqlari.** `mysql` ning ham o'z buyruqlari bor:

| Buyruq | Vazifasi |
| --- | --- |
| `status` (`\s`) | Ulanish va server haqida ma'lumot |
| `\G` | Natijani vertikal ko'rinishda chiqarish |
| `source` (`\.`) | SQL faylni bajarish |
| `use` (`\u`) | Boshqa bazaga o'tish |
| `quit` (`\q`) | Chiqish |

MySQL 9.7 qo'llanmasida `--commands` parametri bor, sukut qiymati `FALSE`. U o'chiq bo'lsa, mijozning mahalliy buyruqlari o'chiriladi. Faqat `\C`, `delimiter` va `use` qoladi.

Sinovda shunday chiqdi: interaktiv rejimda `\G` va `status` ishladi, lekin `-e` yoki pipe orqali yuborilganda ishlamadi:

```bash
mysql --defaults-extra-file=talaba.cnf qollanma -e "SELECT 'Salom' AS xabar, 2 + 2 AS natija\G"
```

```text
ERROR at line 1: Unknown command '\G'.
```

`--commands` qo'shilsa ishlaydi:

```bash
mysql --defaults-extra-file=talaba.cnf --commands qollanma -e "SELECT 'Salom' AS xabar, 2 + 2 AS natija\G"
```

```text
*************************** 1. row ***************************
 xabar: Salom
natija: 4
```

Interaktiv seans:

```text
mysql> SELECT 1 AS bir\G
*************************** 1. row ***************************
bir: 1
1 row in set (0.000 sec)

mysql> status
--------------
…
Current database:	qollanma
Current user:		talaba@localhost
SSL:			Cipher in use is TLS_AES_128_GCM_SHA256
…
Server version:		9.7.2 Homebrew
Connection:		127.0.0.1 via TCP/IP
Server characterset:	utf8mb4
…
TCP port:		3307
```

`Current user` qatorida `talaba@localhost` turibdi, garchi ulanish `127.0.0.1` orqali bo'lsa ham. Hujjat buni tushuntiradi: `127.0.0.1` ga ulanish **odatda** `localhost` hisobiga moslanadi. Server `skip_name_resolve` bilan ishga tushirilgan bo'lsa, bunday bo'lmaydi. MySQL'da foydalanuvchi hisobi "nom + host" juftligidan iborat (60-bob).

### `sqlite3` — SQLite dasturi

SQLite hujjati alohida ta'kidlaydi: SQLite **kutubxonasi** va `sqlite3` **dasturi** ikki xil narsa. Dastur foydalanuvchi yozganini kutubxonaga uzatadigan interfeys, xolos. `sqlite3` — SQLite fayllari bilan interaktiv ishlashning rasmiy qo'llab-quvvatlanadigan usuli.

Dasturga fayl nomi beriladi. Fayl yo'q bo'lsa, yaratiladi. Fayl nomi berilmasa, **xotiradagi vaqtinchalik** baza ishlatiladi va dastur yopilganda o'chib ketadi.

```text
$ sqlite3 dokon.db
SQLite version 3.54.0 2026-10-09 15:46:58
Enter ".help" for usage hints.
SQLite-3.54 dokon.db-> .tables
mahsulotlar
SQLite-3.54 dokon.db-> .schema mahsulotlar
CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text NOT NULL, narx numeric);
SQLite-3.54 dokon.db-> SELECT * FROM mahsulotlar;
╭────┬─────┬───────╮
│ id │ nom │ narx  │
╞════╪═════╪═══════╡
│  1 │ Non │  4000 │
│  2 │ Sut │ 12000 │
╰────┴─────┴───────╯
SQLite-3.54 dokon.db-> .mode csv
SQLite-3.54 dokon.db-> SELECT * FROM mahsulotlar;
1,Non,4000
2,Sut,12000
SQLite-3.54 dokon.db-> SELECT
                   ;->   nom
                   ;-> FROM mahsulotlar;
Non
Sut
SQLite-3.54 dokon.db-> .quit
```

Bu yerda nimalar ko'rinadi:

- **Nuqta bilan boshlanadigan buyruqlar** (*dot-commands*) — `sqlite3` dasturining o'z buyruqlari:
  - `.tables` — jadvallar ro'yxati;
  - `.schema` — jadval qanday yaratilgani;
  - `.mode` — natija formati (`box`, `csv`, `quote` va boshqalar);
  - `.open` — boshqa faylni ochish;
  - `.quit` — chiqish.
- **Nuqtali vergul.** SQL buyrug'i `;` bilan tugaydi. U bo'lmasa, dastur davom ettirish taklifini (`;->`) ko'rsatib, buyruqning qolganini kutadi.
- **3.54 dagi yangi taklif belgisi.** U versiya va fayl nomini ko'rsatadi: `SQLite-3.54 dokon.db->`. Eski versiyalarda oddiy `sqlite>` chiqadi.

## Dialektlar

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Mijoz dasturi | `psql` | `mysql` | `sqlite3` |
| Host, port, foydalanuvchi | `-h`, `-p`, `-U` | `-h`, `-P`, `-u` | — (fayl nomi) |
| Parol | `.pgpass` fayli (0600), `PGPASSWORD` tavsiya etilmaydi | `-p` qiymatsiz (so'raydi) yoki option fayli | Parol yo'q, fayl ruxsatlari |
| Ulanish satri | kalit=qiymat va `postgresql://` URI | `mysql` uchun buyruq parametrlari; URI faqat MySQL Shell va X DevAPI'da | Fayl nomi |
| `localhost` | TCP orqali `localhost`; host berilmasa — socket | Unix'da socket fayli | — |
| Muhit o'zgaruvchilari | `PGHOST`, `PGPORT`, `PGUSER`, `PGDATABASE`… | `MYSQL_UNIX_PORT` (socket) va boshqalar | — |
| Mijoz buyruqlari | `\` bilan: `\dt`, `\d`, `\x`, `\q` | `status`, `\G`, `source`, `quit`; 9.7 da `--commands` parametriga bog'liq | `.` bilan: `.tables`, `.schema`, `.mode`, `.quit` |
| Ma'lumot papkasini tayyorlash | `initdb` | `mysqld --initialize` | Kerak emas |
| Yangi o'rnatmaning xavfsizligi | Sukut bo'yicha `trust`; `-A scram-sha-256` tavsiya qilinadi | `--initialize` — muddati o'tgan vaqtinchalik parol | Fayl ruxsatlari |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `initdb` ni `-A` siz ishlatib, shunday qoldirish | Kompyuterdagi har qanday foydalanuvchi superuser bo'lib ulana oladi (`trust`) | `-A scram-sha-256` va parol (`--pwfile` yoki `-W`) |
| Parolni buyruq satriga yozish (`-pParol`, `PGPASSWORD=…`) | Boshqa foydalanuvchilar `ps` orqali ko'rishi mumkin | MySQL: `-p` qiymatsiz yoki option fayli; PostgreSQL: `.pgpass` |
| `.pgpass` yoki option fayliga `chmod 600` qilmaslik | libpq bunday `.pgpass` ni e'tiborsiz qoldiradi; parol boshqalarga ochiq | `chmod 600` |
| MySQL'da `localhost` yozib, TCP orqali ulandim deb o'ylash | Unix'da mijoz socket fayliga ulanadi | TCP uchun `127.0.0.1` yoki `--protocol=TCP` |
| MySQL'da port uchun kichik `-p` yozish | `-p` — parol, port — katta `-P` | `-P 3307` |
| MySQL'ning `--initialize-insecure` bilan yaratilgan bazasini shunday qoldirish | `root` parolsiz | Darhol `ALTER USER … IDENTIFIED BY …` |
| Skriptda `mysql -e "…\G"` yoki `source` ishlatish (9.7) | `--commands` o'chiq bo'lsa, `Unknown command` xatosi | `--commands` qo'shish yoki SQL'ni oddiy `;` bilan yozish |
| SQLite'da fayl nomida xato qilish | Dastur xato bermaydi, **yangi bo'sh baza** yaratadi | Fayl yo'lini tekshirish; `.tables` bo'sh chiqsa, shubhalanish |
| Faylsiz `sqlite3` da ishlab, natijani saqlandi deb o'ylash | Xotiradagi baza dastur yopilganda yo'qoladi | Fayl nomini berish yoki `.open fayl.db` |

## Amaliyot

1. O'zingizning operatsion tizimingiz uchun PostgreSQL 18 va MySQL 9.7 LTS ni rasmiy yo'llardan biri bilan o'rnating. `psql --version` va `mysql --version` natijalarini yozib qo'ying.
2. PostgreSQL'da `initdb` ni ikki marta ishga tushiring: `-A` siz va `-A scram-sha-256` bilan. Ikkala holatda yaratilgan `pg_hba.conf` faylini solishtiring.
3. `psql` bilan bir bazaga uch xil usulda ulaning: parametrlar bilan, URI bilan va muhit o'zgaruvchilari bilan. Har birida `\conninfo` natijasini solishtiring.
4. Parolli foydalanuvchi uchun `.pgpass` faylini yarating. Keyin `chmod 644` qilib, nima bo'lishini kuzating.
5. MySQL'ga `-h localhost` va `-h 127.0.0.1` bilan ulanib, interaktiv `status` buyrug'idagi `Connection:` qatorini solishtiring.
6. `mysql -e "SELECT 1\G"` ni `--commands` bilan va usiz ishga tushiring. Natijani qo'llanmadagi `--commands` tavsifi bilan solishtiring.
7. `sqlite3` ni fayl nomisiz oching, jadval yarating, chiqing va qayta oching. Jadval qayerga ketdi? Endi `.open mashq.db` bilan takrorlang.

## Rasmiy hujjat

- PostgreSQL — Chapter 16. Installation from Binaries: <https://www.postgresql.org/docs/18/install-binaries.html>
- PostgreSQL — macOS packages: <https://www.postgresql.org/download/macosx/>
- PostgreSQL — 18.2. Creating a Database Cluster: <https://www.postgresql.org/docs/18/creating-cluster.html>
- PostgreSQL — 18.3. Starting the Database Server: <https://www.postgresql.org/docs/18/server-start.html>
- PostgreSQL — 1.3. Creating a Database: <https://www.postgresql.org/docs/18/tutorial-createdb.html>
- PostgreSQL — 1.4. Accessing a Database: <https://www.postgresql.org/docs/18/tutorial-accessdb.html>
- PostgreSQL — `psql`: <https://www.postgresql.org/docs/18/app-psql.html>
- PostgreSQL — 32.1. Database Connection Control Functions (ulanish satri va URI): <https://www.postgresql.org/docs/18/libpq-connect.html>
- PostgreSQL — 32.15. Environment Variables: <https://www.postgresql.org/docs/18/libpq-envars.html>
- PostgreSQL — 32.16. The Password File: <https://www.postgresql.org/docs/18/libpq-pgpass.html>
- MySQL — 2.4 Installing MySQL on macOS: <https://dev.mysql.com/doc/refman/9.7/en/macos-installation.html>
- MySQL — 2.5.6.1 Basic Steps for MySQL Server Deployment with Docker: <https://dev.mysql.com/doc/refman/9.7/en/docker-mysql-getting-started.html>
- MySQL — 2.9.1 Initializing the Data Directory: <https://dev.mysql.com/doc/refman/9.7/en/data-directory-initialization.html>
- MySQL — 6.2.4 Connecting to the MySQL Server Using Command Options: <https://dev.mysql.com/doc/refman/9.7/en/connecting.html>
- MySQL — 6.5.1 mysql — The MySQL Command-Line Client: <https://dev.mysql.com/doc/refman/9.7/en/mysql.html>
- MySQL — 6.5.1.1 mysql Client Options (`--commands`): <https://dev.mysql.com/doc/refman/9.7/en/mysql-command-options.html>
- MySQL — 6.5.1.2 mysql Client Commands:
- MySQL — 6.2.2.2 Using Option Files: <https://dev.mysql.com/doc/refman/9.7/en/option-files.html> <https://dev.mysql.com/doc/refman/9.7/en/mysql-commands.html>
- MySQL — Connecting Using URI-Like Strings or Key-Value Pairs: <https://dev.mysql.com/doc/refman/9.7/en/connecting-using-uri-or-key-value-pairs.html>
- SQLite — Command Line Shell For SQLite: <https://www.sqlite.org/cli.html>
- SQLite — Download: <https://www.sqlite.org/download.html>
