# 63 — Sxemani xavfsiz o'zgartirish

[← Oldingi: SQL injection va parametrlar](62-sql-injection-va-parametrlar.md) · [Mundarija](README.md) · [Keyingi: Ulanishlar →](64-ulanishlar.md)

## Tushuncha

Ishlab turgan bazada jadvalga ustun qo'shish, cheklov yoki indeks yaratish — **migratsiya**. Bo'sh jadvalda bu bir lahzalik ish. Million qatorli, soniyasiga yuzlab so'rov keladigan jadvalda esa noto'g'ri yozilgan bitta `ALTER TABLE` ilovani bir necha soniya — yoki daqiqa — to'xtatib qo'yishi mumkin.

Ikki xavf bor:

| Xavf | Nima bo'ladi |
| --- | --- |
| **Qayta yozish** (rewrite) | Baza butun jadvalni (va indekslarini) yangidan yozadi — vaqt jadval hajmiga proporsional |
| **Qattiq qulf** | O'zgarish davomida jadvalga boshqa so'rovlar kira olmaydi (53-bob) |

### PostgreSQL: `ALTER TABLE` qulflari

PostgreSQL hujjati (ALTER TABLE): har bir kichik buyruqning qulf darajasi har xil bo'lishi mumkin; alohida aytilmagan bo'lsa — **`ACCESS EXCLUSIVE`**. Bu qulf hamma narsa bilan, oddiy `SELECT` bilan ham to'qnashadi (53-bob).

Muhim kuzatuv (pastda): `ALTER TABLE` qulfni **kutib** turganda ham xavfli. U boshqa uzoq tranzaksiya tugashini kutadi, uning ortidan esa **oddiy `SELECT` lar ham** navbatga turadi. Shuning uchun DDL'ni doim `lock_timeout` bilan bajaring: qulfni tez ololmasa — ilovani to'xtatmasdan xato bilan chiqsin va keyinroq qayta urinilsin.

### Ustun qo'shish: qachon qayta yoziladi

Hujjat:

- `ADD COLUMN` va **o'zgarmas** (non-volatile) `DEFAULT` — standart qiymat buyruq paytida bir marta hisoblanadi va jadval **metadata'sida** saqlanadi. Mavjud qatorlar o'qilganda qaytariladi. `ALTER TABLE` katta jadvalda ham **juda tez**. `DEFAULT` siz — `NULL`. Ikkala holatda ham jadval qayta yozilmaydi.
- **Volatile** `DEFAULT` (masalan, `clock_timestamp()`), stored generated ustun, identity ustun yoki cheklovli domain turidagi ustun — **butun jadval va indekslari qayta yoziladi**. Virtual generated ustun hech qachon qayta yozishni talab qilmaydi.

### Cheklov qo'shish: `NOT VALID` va `VALIDATE`

Hujjat: yangi tashqi kalit, `CHECK` yoki `NOT NULL` cheklovini tekshirish uchun katta jadvalni skanerlash uzoq vaqt olishi mumkin. Bu vaqtda jadvalga boshqa yangilashlar `ALTER TABLE ADD CONSTRAINT` commit qilinguncha **bloklanadi**. `NOT VALID` ning asosiy maqsadi — shu ta'sirni kamaytirish:

1. `ADD CONSTRAINT … NOT VALID` — jadvalni skanerlamaydi, darhol commit qilinadi. Shundan boshlab **yangi** qatorlar tekshiriladi.
2. `VALIDATE CONSTRAINT` — mavjud qatorlarni tekshiradi. Hujjat: bu bosqich parallel yangilashlarni bloklamaydi (yangi qatorlarni boshqa tranzaksiyalar baribir tekshiradi) — faqat `SHARE UPDATE EXCLUSIVE` qulfini oladi (tashqi kalit bo'lsa, unga havola qilingan jadvalga `ROW SHARE` ham).

Hujjatdagi qo'shimcha foyda: jadvalda **allaqachon buzilgan** qatorlar bo'lsa ham, `NOT VALID` bilan cheklovni qo'yish mumkin. Yangi buzilishlar kiritilmaydi, eskilarini esa asta-sekin tuzatib, oxirida `VALIDATE` qilinadi.

### Indeks: `CREATE INDEX CONCURRENTLY`

PostgreSQL hujjati (CREATE INDEX): `CONCURRENTLY` — yozishlarni bloklamasdan indeks qurish. Narxi:

- jadval **ikki marta** skanerlanadi;
- indeksni o'zgartirishi yoki ishlatishi mumkin bo'lgan barcha mavjud tranzaksiyalar tugashi kutiladi;
- jami ish ko'proq va **ancha uzoq** davom etadi; qo'shimcha CPU va disk yuki boshqa so'rovlarni sekinlashtirishi mumkin;
- tranzaksiya bloki ichida bajarib bo'lmaydi.

Muammo chiqsa (deadlock, unique indeksda takror qiymat), buyruq xato beradi, lekin **"invalid" indeksni qoldiradi**. U so'rovlarda ishlatilmaydi, lekin yangilashlarda baribir xarajat qiladi. `psql` ning `\d` ida u `INVALID` deb ko'rinadi. Uni o'chirib, qayta qurish kerak.

### MySQL: online DDL — `INSTANT`, `INPLACE`, `COPY`

MySQL hujjati (17.12.1 Online DDL Operations) har amal uchun qaysi algoritm mumkinligini jadvalda beradi:

| Algoritm | Ma'nosi |
| --- | --- |
| `INSTANT` | Faqat metadata o'zgaradi. MySQL 9.7'da — **standart** algoritm |
| `INPLACE` | Jadval joyida qayta quriladi; ko'p amallarda parallel DML'ga ruxsat bor (`LOCK=NONE`) |
| `COPY` | Jadvalning yangi nusxasi yasaladi — eng sekin, DML bloklanadi |

Hujjat jadvalidan: **ustun qo'shish** — `INSTANT` mumkin; **ustun turini o'zgartirish** — faqat `COPY`. `ALGORITHM=…` ni aniq yozish — himoya: so'ralgan algoritm mumkin bo'lmasa, MySQL og'irroq algoritmga jimgina o'tib ketmaydi, balki **xato** beradi.

### SQLite: cheklangan `ALTER TABLE`

SQLite hujjati (ALTER TABLE): to'g'ridan-to'g'ri qo'llab-quvvatlanadigan buyruqlar — `RENAME TO`, `RENAME COLUMN`, `ADD COLUMN`, `DROP COLUMN`. 3.53.0 dan beri (relizlar jurnali) yana NOT NULL va CHECK cheklovlarini qo'shish va olib tashlash ham mumkin. Boshqa o'zgarishlar (masalan, ustun turi) uchun hujjat **umumiy usulni** beradi:

1. Tashqi kalitlar yoqilgan bo'lsa — `PRAGMA foreign_keys=OFF`.
2. Tranzaksiya boshlash.
3. Jadvalga bog'liq indeks, trigger va view'larning ta'rifini eslab qolish (`SELECT type, sql FROM sqlite_schema WHERE tbl_name='X'`).
4. Kerakli shakldagi yangi jadval yaratish (`new_X`).
5. Ma'lumotni ko'chirish: `INSERT INTO new_X SELECT … FROM X`.
6. Eski jadvalni o'chirish.
7. `new_X` ni `X` ga qayta nomlash.
8. Indeks, trigger va view'larni qayta yaratish.
9. `PRAGMA foreign_key_check` bilan tekshirish, commit, tashqi kalitlarni qayta yoqish.

Hujjatda bu usul 12 qadam bo'lib yozilgan (bu yerda qisqartirildi).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. 1 000 001 qatorli jadval; bitta qatorda `summa = -5` (atay "buzilgan" ma'lumot).

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, summa int NOT NULL);
INSERT INTO buyurtmalar SELECT g, g % 1000 FROM generate_series(1, 1000000) g;
INSERT INTO buyurtmalar VALUES (1000001, -5);
VACUUM ANALYZE buyurtmalar;
```

### Ustun qo'shish: metadata va qayta yozish

`relfilenode` — jadval fayli identifikatori (59-bob, `pg_class`). Jadval qayta yozilsa, u o'zgaradi.

```text
SELECT relfilenode FROM pg_class WHERE relname = 'buyurtmalar';
 relfilenode 
-------------
       17005
(1 row)

ALTER TABLE buyurtmalar ADD COLUMN holat text NOT NULL DEFAULT 'yangi';
ALTER TABLE
Time: 1.024 ms
SELECT relfilenode FROM pg_class WHERE relname = 'buyurtmalar';
 relfilenode 
-------------
       17005
(1 row)

ALTER TABLE buyurtmalar ADD COLUMN yaratilgan timestamptz DEFAULT clock_timestamp();
ALTER TABLE
Time: 1253.087 ms (00:01.253)
SELECT relfilenode FROM pg_class WHERE relname = 'buyurtmalar';
 relfilenode 
-------------
       17017
(1 row)
```

- `DEFAULT 'yangi'` (o'zgarmas) — **1 ms**, fayl o'sha (`17005`). 1 million qatorga hech narsa yozilmadi.
- `DEFAULT clock_timestamp()` (volatile) — **1.25 soniya**, fayl yangi (`17017`). Har qatorning qiymati har xil bo'lishi kerak, shuning uchun butun jadval qayta yozildi.

### `NOT VALID` → `VALIDATE`

```text
ALTER TABLE buyurtmalar ADD CONSTRAINT summa_musbat CHECK (summa >= 0);
ERROR:  check constraint "summa_musbat" of relation "buyurtmalar" is violated by some row
Time: 45.030 ms
ALTER TABLE buyurtmalar ADD CONSTRAINT summa_musbat CHECK (summa >= 0) NOT VALID;
ALTER TABLE
Time: 0.159 ms
INSERT INTO buyurtmalar (id, summa) VALUES (1000002, -1);
ERROR:  new row for relation "buyurtmalar" violates check constraint "summa_musbat"
DETAIL:  Failing row contains (1000002, -1, yangi, 2026-11-08 10:42:24.338211+05).
ALTER TABLE buyurtmalar VALIDATE CONSTRAINT summa_musbat;
ERROR:  check constraint "summa_musbat" of relation "buyurtmalar" is violated by some row
UPDATE buyurtmalar SET summa = 0 WHERE summa < 0;
UPDATE 1
ALTER TABLE buyurtmalar VALIDATE CONSTRAINT summa_musbat;
ALTER TABLE
Time: 22.392 ms
```

- Oddiy `ADD CONSTRAINT` — butun jadvalni skanerladi va `-5` li qatorga urildi: **xato**, cheklov qo'yilmadi.
- `NOT VALID` bilan — **0.16 ms**, cheklov qo'yildi. Yangi buzuvchi `INSERT` darhol rad etildi, garchi eski buzuvchi qator hali jadvalda tursa ham.
- `VALIDATE` — eski qator tuzatilmaguncha xato. `UPDATE` dan keyin — 22 ms, cheklov to'liq.

### Indeks: `CONCURRENTLY` va invalid indeks

```text
BEGIN;
BEGIN
CREATE INDEX CONCURRENTLY b_summa ON buyurtmalar (summa);
ERROR:  CREATE INDEX CONCURRENTLY cannot run inside a transaction block
ROLLBACK;
ROLLBACK
CREATE INDEX b_summa_oddiy ON buyurtmalar (summa);
CREATE INDEX
Time: 208.061 ms
CREATE INDEX CONCURRENTLY b_summa ON buyurtmalar (summa);
CREATE INDEX
Time: 286.640 ms
CREATE UNIQUE INDEX CONCURRENTLY b_summa_unique ON buyurtmalar (summa);
ERROR:  could not create unique index "b_summa_unique"
DETAIL:  Key (summa)=(619) is duplicated.
SELECT indexrelid::regclass AS indeks, indisvalid FROM pg_index WHERE indrelid = 'buyurtmalar'::regclass ORDER BY 1;
      indeks      | indisvalid 
------------------+------------
 buyurtmalar_pkey | t
 b_summa_oddiy    | t
 b_summa          | t
 b_summa_unique   | f
(4 rows)
```

- Tranzaksiya ichida — `cannot run inside a transaction block`.
- Oddiy indeks — 208 ms, `CONCURRENTLY` — 287 ms: hujjatdagidek, sekinroq (ikki skanerlash). Lekin bu vaqt davomida jadvalga yozish mumkin edi.
- `UNIQUE` indeks takror qiymatlarda yiqildi — va **`indisvalid = f`** bo'lgan `b_summa_unique` qoldi. Uni `DROP INDEX CONCURRENTLY` bilan olib tashlash kerak.

### Qulf navbati

Uch seans (51-bobdagi skript, uchinchi seans bilan): A — uzoq tranzaksiya, B — migratsiya, C — ilovaning oddiy so'rovi.

```text
A> BEGIN;
   BEGIN
A> SELECT count(*) FROM buyurtmalar;
     count  
   ---------
    1000001
   (1 row)
B> SET lock_timeout = '10s';
   SET
B> ALTER TABLE buyurtmalar ADD COLUMN izoh text;
C> SET statement_timeout = '1s';
   SET
C> SELECT count(*) FROM buyurtmalar WHERE id = 1;
   ERROR:  canceling statement due to statement timeout
A> COMMIT;
   COMMIT
C> SELECT count(*) FROM buyurtmalar WHERE id = 1;
    count 
   -------
        1
   (1 row)
B> SELECT 'tugadi';
   ALTER TABLE
    ?column? 
   ----------
    tugadi
   (1 row)
```

- A jadvalni o'qidi va tranzaksiyani ochiq qoldirdi (`ACCESS SHARE` qulfi tranzaksiya oxirigacha turadi).
- B'ning `ALTER TABLE` i `ACCESS EXCLUSIVE` qulfini **kutdi**.
- C'ning eng oddiy `SELECT` i — 1 soniyadan keyin `canceling statement due to statement timeout`: u ham **B ortida navbatga turdi** (kuzatildi). A ning o'zi C'ni bloklamaydi — kutayotgan B bloklayapti.
- A commit qildi — B bajarildi (`ALTER TABLE`, kechikkan javob), C'ning so'rovi ham o'tdi.

Production'da bu — "migratsiya ishga tushdi, sayt to'xtadi". Himoya: DDL oldidan `SET lock_timeout = '2s'` (qisqa vaqt). Qulf ololmasa, migratsiya xato bilan to'xtaydi va keyinroq qayta uriniladi — ilova to'xtamaydi.

## Dialektlar

### MySQL

Bir xil jadval (1 000 000 qator):

```sql
ALTER TABLE buyurtmalar ADD COLUMN holat varchar(20) NOT NULL DEFAULT 'yangi';
ALTER TABLE buyurtmalar ADD COLUMN izoh varchar(100), ALGORITHM=INSTANT;
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=INSTANT;
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=INPLACE;
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=COPY;
ALTER TABLE buyurtmalar ADD INDEX b_summa (summa), ALGORITHM=INPLACE, LOCK=NONE;
```

Chiqishdan `mysql -vvv` ning bo'sh va ajratgich qatorlari olib tashlangan; xato xabarlari (`stderr`) tegishli buyruq ostiga qo'yilgan.

```text
ALTER TABLE buyurtmalar ADD COLUMN holat varchar(20) NOT NULL DEFAULT 'yangi'
Query OK, 0 rows affected (0.005 sec)
ALTER TABLE buyurtmalar ADD COLUMN izoh varchar(100), ALGORITHM=INSTANT
Query OK, 0 rows affected (0.006 sec)
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=INSTANT
ERROR 1846 (0A000) at line 7: ALGORITHM=INSTANT is not supported. Reason: Need to rebuild the table to change column type. Try ALGORITHM=COPY/INPLACE.
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=INPLACE
ERROR 1846 (0A000) at line 8: ALGORITHM=INPLACE is not supported. Reason: Cannot change column type INPLACE. Try ALGORITHM=COPY.
ALTER TABLE buyurtmalar MODIFY summa bigint NOT NULL, ALGORITHM=COPY
Query OK, 1000000 rows affected (1.111 sec)
ALTER TABLE buyurtmalar ADD INDEX b_summa (summa), ALGORITHM=INPLACE, LOCK=NONE
Query OK, 0 rows affected (0.627 sec)
```

- Ustun qo'shish — algoritm ko'rsatilmasa ham **0.005 s** (standart `INSTANT`).
- Tur o'zgartirish: `INSTANT` va `INPLACE` — **xato**, sababi va tavsiya bilan (`Try ALGORITHM=COPY`). `ALTER TABLE` hujjati: `ALGORITHM` yozilmasa, MySQL mumkin bo'lsa `INSTANT`, aks holda `INPLACE`, u ham bo'lmasa `COPY` ni tanlaydi — ya'ni bloklaydigan `COPY` jimgina tanlanardi; aniq `ALGORITHM` bunday kutilmagan holatdan himoya qiladi.
- `COPY` — 1 000 000 qator, **1.1 s**, bu vaqt davomida yozish bloklangan.
- Indeks — `INPLACE, LOCK=NONE`: yozishlar to'xtamasdan, 0.63 s.

### SQLite

```sql
PRAGMA foreign_keys = ON;
CREATE TABLE buyurtmalar (id integer PRIMARY KEY, summa int NOT NULL);
INSERT INTO buyurtmalar VALUES (1, 100), (2, -5);
ALTER TABLE buyurtmalar ADD COLUMN holat text NOT NULL DEFAULT 'yangi';
ALTER TABLE buyurtmalar ADD CONSTRAINT summa_musbat CHECK (summa >= 0);
ALTER TABLE buyurtmalar ALTER COLUMN summa TYPE bigint;
-- hujjatdagi umumiy usul:
PRAGMA foreign_keys = OFF;
BEGIN;
CREATE TABLE buyurtmalar_yangi (id integer PRIMARY KEY, summa int NOT NULL CHECK (summa >= 0), holat text NOT NULL DEFAULT 'yangi');
INSERT INTO buyurtmalar_yangi SELECT id, max(summa, 0), holat FROM buyurtmalar;
DROP TABLE buyurtmalar;
ALTER TABLE buyurtmalar_yangi RENAME TO buyurtmalar;
PRAGMA foreign_key_check;
COMMIT;
PRAGMA foreign_keys = ON;
SELECT * FROM buyurtmalar;
SELECT sql FROM sqlite_schema WHERE name = 'buyurtmalar';
```

```text
Error near line 5: constraint failed
Parse error near line 6: near "TYPE": syntax error
  ALTER TABLE buyurtmalar ALTER COLUMN summa TYPE bigint;
                               error here ---^
1|100|yangi
2|0|yangi
CREATE TABLE "buyurtmalar" (id integer PRIMARY KEY, summa int NOT NULL CHECK (summa >= 0), holat text NOT NULL DEFAULT 'yangi')
```

- `ADD COLUMN` — ishladi.
- `ADD CONSTRAINT … CHECK` — sintaksis xatosi **emas**, `constraint failed`: 3.53.0 dan beri bu buyruq mavjud, va u mavjud qatorlarni tekshiradi (`-5`). Toza ma'lumotda u ishlaydi:

```text
Error in 2nd command line argument: CHECK constraint failed: summa_musbat
```

  — cheklov qo'shildi va keyingi `INSERT` ni rad etdi. PostgreSQL'dagi `NOT VALID` ning o'xshashi yo'q: buzilgan qator bo'lsa, cheklovni qo'yib bo'lmaydi.
- Ustun turini o'zgartirish (`ALTER COLUMN … TYPE`) — sintaksis xatosi. Hujjatdagi usul bilan: yangi jadval, ko'chirish (shu yerda `-5` tuzatildi), almashtirish. `sqlite_schema` dagi yangi ta'rif cheklov bilan.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Ustun qo'shish (o'zgarmas default) | Metadata, qayta yozishsiz | `INSTANT` (standart) | `ADD COLUMN` |
| Ustun turini o'zgartirish | Qayta yozish, `ACCESS EXCLUSIVE` | Faqat `COPY` | Yangi jadval + ko'chirish (hujjatdagi usul) |
| Cheklov — avval yangi qatorlarga | `NOT VALID` + `VALIDATE` | — | Yo'q (3.53+ `ADD CONSTRAINT` mavjud qatorlarni darhol tekshiradi) |
| Indeksni yozishni bloklamasdan qurish | `CREATE INDEX CONCURRENTLY` | `ALGORITHM=INPLACE, LOCK=NONE` | — |
| Kutilmagan og'ir yo'ldan himoya | `lock_timeout` | Aniq `ALGORITHM=` / `LOCK=` | — |
| DDL tranzaksiyada | Ha (50-bob), `CONCURRENTLY` dan tashqari | Yashirin commit (50-bob) | Ha |

`—` — bu bobda sinalmagan yoki mavjud emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `lock_timeout` siz migratsiya | Uzoq tranzaksiya ortida kutib, **barcha** so'rovlarni to'xtatadi (sinovda C bekor qilindi) | `SET lock_timeout`, qisqa vaqt va qayta urinish |
| Katta jadvalga volatile default bilan ustun | Butun jadval qayta yoziladi (sinovda 1 ms va 1.25 s) | Avval `NULL` ustun, keyin qiymatlarni bo'laklab `UPDATE` (56-bob, protsedura) |
| Katta jadvalga oddiy `ADD CONSTRAINT` | Butun jadval skanerlanadi, yangilashlar bloklanadi | `NOT VALID` → `VALIDATE` |
| Production'da oddiy `CREATE INDEX` | Jadvalga yozish bloklanadi | `CREATE INDEX CONCURRENTLY` (PG), `LOCK=NONE` (MySQL) |
| Yiqilgan `CONCURRENTLY` dan keyin indeksni unutish | Invalid indeks yangilashlarni sekinlashtiradi (sinovda `indisvalid = f`) | `DROP INDEX CONCURRENTLY` va qayta qurish |
| MySQL'da `ALGORITHM` ni yozmaslik | Og'ir `COPY` jimgina tanlanadi | `ALGORITHM=INSTANT`/`INPLACE` aniq — mumkin bo'lmasa xato chiqadi |
| SQLite'da qayta qurishda indeks/trigger'larni unutish | Yangi jadvalda ular yo'q | Hujjatdagi 3- va 8-qadamlar |

## Amaliyot

1. PostgreSQL'da `ALTER TABLE buyurtmalar ALTER COLUMN summa TYPE bigint` ni bajaring. `relfilenode` o'zgardimi? Vaqt qancha ketdi?
2. Tashqi kalitni `NOT VALID` bilan qo'shing va `VALIDATE` qiling. Havola qilingan jadvalga qanday qulf olindi (`pg_locks`, 53-bob)?
3. `ADD COLUMN … GENERATED ALWAYS AS (summa * 2) VIRTUAL` va `STORED` ni solishtiring (15-bob) — qaysi biri qayta yozdi?
4. MySQL'da `ALTER TABLE buyurtmalar DROP COLUMN izoh, ALGORITHM=INSTANT` — ishladimi?
5. SQLite'da `ALTER TABLE buyurtmalar ALTER COLUMN holat DROP NOT NULL` (3.53+) ni sinang va `sqlite_schema` dagi ta'rifni tekshiring.

## Rasmiy hujjat

- PostgreSQL — ALTER TABLE: <https://www.postgresql.org/docs/18/sql-altertable.html>
- PostgreSQL — CREATE INDEX (Building Indexes Concurrently): <https://www.postgresql.org/docs/18/sql-createindex.html#SQL-CREATEINDEX-CONCURRENTLY>
- PostgreSQL — 19.11.1 Statement Behavior (`lock_timeout`): <https://www.postgresql.org/docs/18/runtime-config-client.html>
- MySQL — 17.12.1 Online DDL Operations: <https://dev.mysql.com/doc/refman/9.7/en/innodb-online-ddl-operations.html>
- MySQL — 15.1.11 ALTER TABLE Statement (`ALGORITHM`): <https://dev.mysql.com/doc/refman/9.7/en/alter-table.html>
- SQLite — ALTER TABLE: <https://www.sqlite.org/lang_altertable.html>
- SQLite — Release 3.53.0 (`ALTER TABLE` bilan NOT NULL va CHECK): <https://www.sqlite.org/releaselog/3_53_0.html>
