# 24 — Ma'lumotlar bazasi konteynerda

[← Oldingi: SPA: React, Vue, Angular](23-spa.md) · [Mundarija](README.md) · [Keyingi: Registry va teglash →](25-registry.md)

## Tushuncha

Ma'lumotlar bazasini konteynerda ishlatish oson: rasmiy image, nomli volume (6-bob), healthcheck (17-bob). Bu bobda bazaga xos uch savolni ko'ramiz:

| Savol | Javob |
| --- | --- |
| Baza birinchi marta qanday tayyorlanadi (jadval, boshlang'ich ma'lumot)? | `/docker-entrypoint-initdb.d` — **pre-seeding** (oldindan to'ldirish) |
| Parolni qanday beramiz? | `POSTGRES_PASSWORD_FILE` + Compose `secrets` |
| Zaxira va tiklash? | `pg_dump` (mantiqiy zaxira) yoki volume'ni `tar` bilan (Docker hujjati) |

Misol — PostgreSQL 18 rasmiy image'i. MySQL, MariaDB va MongoDB rasmiy image'larida ham shu nomdagi `/docker-entrypoint-initdb.d` papkasi bor (har birining Docker Hub sahifasida).

## PostgreSQL 18: ma'lumot qayerda

Rasmiy image hujjati (Docker Hub, `PGDATA`): PostgreSQL 18 dan boshlab ma'lumot papkasi versiyaga bog'liq — `/var/lib/postgresql/18/docker`, image'dagi `VOLUME` esa `/var/lib/postgresql`. Shuning uchun volume **`/var/lib/postgresql`** ga ulanadi (20-bobda shunday qilgan edik). 17 va undan eski versiyalarda — `/var/lib/postgresql/data`; hujjat ogohlantiradi: eski versiyada volume'ni `/var/lib/postgresql` ga ulasangiz, ma'lumot anonim volume'ga yoziladi va konteyner qayta yaratilganda **saqlanmaydi**.

## Oldindan to'ldirish: `docker-entrypoint-initdb.d`

Hujjat: `initdb` standart `postgres` foydalanuvchisi va bazasini yaratgandan so'ng, entrypoint shu papkadagi barcha `*.sql` (va `*.sql.gz`) fayllarni bajaradi, bajariladigan `*.sh` skriptlarni ishga tushiradi va qolgan `*.sh` larni `source` qiladi — keyin serverni ishga tushiradi.

`initdb/01-schema.sql`:

```sql
CREATE TABLE talabalar (
    id    serial PRIMARY KEY,
    ism   text NOT NULL,
    kurs  int  NOT NULL
);

INSERT INTO talabalar (ism, kurs) VALUES
    ('Aziza', 2),
    ('Bobur', 3),
    ('Dilshod', 1);
```

`compose.yaml`:

```yaml
services:
  db:
    image: postgres:18
    environment:
      POSTGRES_DB: maktab
      POSTGRES_PASSWORD_FILE: /run/secrets/db_parol
    secrets:
      - db_parol
    volumes:
      - pgdata:/var/lib/postgresql
      - ./initdb:/docker-entrypoint-initdb.d:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d maktab"]
      interval: 2s
      retries: 15

secrets:
  db_parol:
    file: ./db_parol.txt

volumes:
  pgdata:
```

- `POSTGRES_DB` — yaratiladigan baza nomi; skriptlar shu bazada bajariladi.
- `POSTGRES_PASSWORD_FILE` — hujjat: ba'zi o'zgaruvchilarga `_FILE` qo'shilsa, qiymat **fayldan** o'qiladi — parol `docker inspect` va muhit o'zgaruvchilarida ko'rinmaydi. Compose `secrets` faylni konteynerda `/run/secrets/<nom>` ga qo'yadi (Compose hujjati: secrets).
- `db_parol.txt` git'ga tushmasin (`.gitignore`).

```text vps
$ docker compose up -d --wait
 Network db_default Creating 
 Network db_default Creating 
 Volume db_pgdata Creating 
 Volume db_pgdata Creating 
 Volume db_pgdata Created 
 Volume db_pgdata Created 
 Network db_default Created 
 Network db_default Created 
 Container db-db-1 Creating 
 Container db-db-1 Created 
 Container db-db-1 Starting 
 Container db-db-1 Started 
 Container db-db-1 Waiting 
 Container db-db-1 Healthy 
$ docker compose exec db printenv PGDATA
/var/lib/postgresql/18/docker
$ docker compose logs db | grep -E "initdb.d|CREATE TABLE|INSERT"
db-1  | /usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/01-schema.sql
db-1  | CREATE TABLE
db-1  | INSERT 0 3
$ docker compose exec db psql -U postgres -d maktab -c "SELECT * FROM talabalar;"
 id |   ism   | kurs 
----+---------+------
  1 | Aziza   |    2
  2 | Bobur   |    3
  3 | Dilshod |    1
(3 rows)

```

`running /docker-entrypoint-initdb.d/01-schema.sql` — skript bajarildi, jadval va 3 qator tayyor.

### Muhim: faqat birinchi marta

Hujjatdagi ogohlantirish: `initdb.d` skriptlari **faqat ma'lumot papkasi bo'sh** bo'lganda ishlaydi; mavjud baza tegilmaydi. Tekshiramiz — yangi qator qo'shib, konteynerni o'chirib, qayta yaratamiz:

```text vps
$ docker compose exec db psql -U postgres -d maktab -c "INSERT INTO talabalar (ism, kurs) VALUES ('Elyor', 4);"
INSERT 0 1
$ docker compose down
 Container db-db-1 Stopping 
 Container db-db-1 Stopped 
 Container db-db-1 Removing 
 Container db-db-1 Removed 
 Network db_default Removing 
 Network db_default Removed 
$ docker compose up -d --wait
 Network db_default Creating 
 Network db_default Creating 
 Network db_default Created 
 Network db_default Created 
 Container db-db-1 Creating 
 Container db-db-1 Created 
 Container db-db-1 Starting 
 Container db-db-1 Started 
 Container db-db-1 Waiting 
 Container db-db-1 Healthy 
$ docker compose logs db | grep -iE "Skipping initialization|initdb.d"
db-1  | PostgreSQL Database directory appears to contain a database; Skipping initialization
$ docker compose exec db psql -U postgres -d maktab -tc "SELECT count(*) FROM talabalar;"
     4

```

- `Skipping initialization` — skript qayta ishlamadi, volume'dagi baza saqlandi (`4` qator, `Elyor` bilan).
- Demak `initdb.d` — **migratsiya vositasi emas**: jadvalga keyin ustun qo'shish kerak bo'lsa, skriptni o'zgartirish mavjud bazaga ta'sir qilmaydi. Buning uchun ilovaning migratsiya vositasi kerak (21-bob: `artisan migrate`).
- Hujjatdagi yana bir holat: skript xato bilan tugasa, entrypoint chiqib ketadi; konteyner qayta ishga tushsa, papka endi bo'sh emas — qolgan skriptlar **bajarilmaydi**. Xato bo'lsa, volume'ni o'chirib qaytadan boshlash kerak.

## Zaxira: `pg_dump`

PostgreSQL hujjati (SQL Dump): `pg_dump` bazaning bajarilgan vaqtdagi **izchil nusxasini** (snapshot) SQL ko'rinishida beradi va boshqa amallarni to'xtatmaydi. Konteyner ichidagi `pg_dump` ni ishlatamiz, natija — server faylida:

```text vps
$ docker compose exec db pg_dump -U postgres -d maktab > zaxira.sql
$ ls -l zaxira.sql; grep -c "^" zaxira.sql
-rw-r--r-- 1 root root 2164 Nov  8 01:13 zaxira.sql
100
$ docker run -d --name tiklash -e POSTGRES_PASSWORD=boshqa-parol postgres:18
a8b093db950c2dab1401bdb967f61b9077c37e8e8f37750a8dfc249c461783c7
$ sleep 6; docker exec tiklash pg_isready
/var/run/postgresql:5432 - accepting connections
$ docker exec tiklash createdb -U postgres maktab
$ docker exec -i tiklash psql -q -U postgres -d maktab < zaxira.sql
 set_config 
------------
 
(1 row)

 setval 
--------
      4
(1 row)

$ docker exec tiklash psql -U postgres -d maktab -c "SELECT * FROM talabalar ORDER BY id;"
 id |   ism   | kurs 
----+---------+------
  1 | Aziza   |    2
  2 | Bobur   |    3
  3 | Dilshod |    1
  4 | Elyor   |    4
(4 rows)

$ docker rm -f tiklash
tiklash
```

- `docker compose exec … pg_dump > zaxira.sql` — `>` server qobig'ida, fayl serverda (2 KB, 100 qator SQL).
- Tiklash — **boshqa** konteynerga (boshqa parol bilan): bo'sh baza `createdb`, so'ng `psql` ga `-i` bilan fayl (`docker exec -i` — stdin konteynerga uzatiladi).
- 4 qator, `id` lar ham joyida; `setval 4` — `serial` hisoblagichi ham tiklandi.

PostgreSQL hujjati: `pg_dump` natijasini odatda **yangiroq** PostgreSQL versiyasiga yuklash mumkin, fayl darajasidagi zaxira esa server versiyasiga qattiq bog'liq.

## Zaxira: volume'ni arxivlash

Docker hujjati (Volumes: back up, restore) volume'ni vaqtinchalik konteyner orqali `tar` bilan arxivlashni ko'rsatadi. PostgreSQL hujjati (File System Level Backup): yaroqli nusxa uchun server **to'xtatilishi shart** — `tar` fayl tizimining bir lahzalik nusxasini olmaydi:

```text vps
$ docker compose stop db
 Container db-db-1 Stopping 
 Container db-db-1 Stopped 
$ docker run --rm -v db_pgdata:/dbdata -v $(pwd):/backup ubuntu tar cf /backup/pgdata.tar /dbdata
Unable to find image 'ubuntu:latest' locally
latest: Pulling from library/ubuntu
f3f25b84a7d7: Pulling fs layer
edafa32f5d9e: Pulling fs layer
f3f25b84a7d7: Download complete
21594acc2d8b: Download complete
edafa32f5d9e: Download complete
edafa32f5d9e: Pull complete
f3f25b84a7d7: Pull complete
Digest: sha256:6a06111c3b0a8600feadb270aec771dc239bf407b25625f93f44ab00e11f4d3c
Status: Downloaded newer image for ubuntu:latest
tar: Removing leading `/' from member names
$ docker compose start db
 Container db-db-1 Starting 
 Container db-db-1 Started 
$ ls -lh pgdata.tar
-rw-r--r-- 1 root root 48M Nov  8 01:13 pgdata.tar
```

Arxiv 48MB — `pg_dump` dagi 2KB o'rniga: bu bazaning butun fayllari (jurnal va tizim jadvallari bilan). Tiklash — yangi volume'ga, hujjatdagidek `--strip 1`:

```text vps
$ docker volume create pgdata2
pgdata2
$ docker run --rm -v pgdata2:/dbdata -v $(pwd):/backup ubuntu bash -c "cd /dbdata && tar xf /backup/pgdata.tar --strip 1"
$ docker run -d --name tiklash2 -v pgdata2:/var/lib/postgresql postgres:18
87d8c57342b37befdabf2084cd233432d9a7e0391d8fd7f91225b752dd4a1317
$ sleep 6; docker logs tiklash2 2>&1 | grep -i "Skipping initialization"
PostgreSQL Database directory appears to contain a database; Skipping initialization
$ docker exec tiklash2 psql -U postgres -d maktab -tc "SELECT count(*) FROM talabalar;"
     4

$ docker rm -f tiklash2
tiklash2
$ docker volume rm pgdata2
pgdata2
```

`Skipping initialization` va `4` — baza to'liq tiklandi. Kuzatildi: `POSTGRES_PASSWORD` siz ham konteyner ishga tushdi — `initdb` bo'lmagani uchun parol so'ralmadi.

| | `pg_dump` | Volume `tar` |
| --- | --- | --- |
| Baza to'xtatiladimi | Yo'q | Ha |
| Hajm (bizda) | 2 KB | 48 MB |
| Boshqa PostgreSQL versiyasiga | Ha | Yo'q (fayl formati versiyaga bog'liq) |
| Qachon | Muntazam zaxira | Butun volume'ni boshqa serverga ko'chirish |

## Tipik xatolar

**1. PostgreSQL 18 da volume'ni `/var/lib/postgresql/data` ga ulash.**
To'g'risi: 18+ da `/var/lib/postgresql`.

**2. `initdb.d` ga yangi skript qo'shib, mavjud bazada ishlashini kutish.**
Skriptlar faqat bo'sh papkada ishlaydi.
To'g'risi: sxema o'zgarishlari — migratsiya vositasi bilan.

**3. Parolni `compose.yaml` ga ochiq yozish.**
To'g'risi: `POSTGRES_PASSWORD_FILE` + `secrets` yoki `.env` (15-bob).

**4. Ishlab turgan bazaning volume'ini `tar` qilish.**
PostgreSQL hujjati: server ishlab turganda olingan fayl nusxasi yaroqsiz.
To'g'risi: `pg_dump`, yoki avval `docker compose stop`.

**5. Zaxirani konteyner ichida saqlash.**
Konteyner o'chsa — zaxira ham yo'q.
To'g'risi: server fayliga (`>` qobiqda) yoki bind mount qilingan papkaga.

## Amaliyot

Savollar:

1. PostgreSQL 18 image'ida volume qaysi papkaga ulanadi?
2. `initdb.d` dagi skript qachon bajariladi, qachon bajarilmaydi?
3. `POSTGRES_PASSWORD_FILE` nima beradi?
4. `pg_dump` bilan volume `tar` nusxasining asosiy farqlari?
5. Nega tiklashda `docker exec -i`?

<details>
<summary>Javoblar</summary>

1. `/var/lib/postgresql` (ma'lumot — `/var/lib/postgresql/18/docker`).
2. Faqat ma'lumot papkasi bo'sh bo'lganda (birinchi ishga tushish); mavjud baza bo'lsa — `Skipping initialization`.
3. Parol fayldan o'qiladi — muhit o'zgaruvchisida va `docker inspect` da ko'rinmaydi.
4. `pg_dump` — bazani to'xtatmaydi, kichik, boshqa versiyaga ham tiklanadi; `tar` — butun fayllar, baza to'xtatiladi, versiyaga bog'liq.
5. `-i` stdin'ni konteynerga uzatadi — `< zaxira.sql` `psql` ga yetadi.

</details>

## Rasmiy hujjat

- [Docker Guides: Databases](https://docs.docker.com/guides/databases/)
- [Docker Guides: Pre-seeding](https://docs.docker.com/guides/pre-seeding/) — `docker-entrypoint-initdb.d`
- [postgres rasmiy image (Docker Hub)](https://hub.docker.com/_/postgres) — `PGDATA` (18+), `_FILE`, initialization scripts
- [Engine: Volumes — back up, restore](https://docs.docker.com/engine/storage/volumes/#back-up-restore-or-migrate-data-volumes)
- [Compose: secrets](https://docs.docker.com/compose/how-tos/use-secrets/)
- [PostgreSQL 18: SQL Dump](https://www.postgresql.org/docs/18/backup-dump.html) · [File System Level Backup](https://www.postgresql.org/docs/18/backup-file.html)
