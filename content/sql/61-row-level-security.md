# 61 — Row Level Security (PG)

[← Oldingi: Rollar va huquqlar](60-rollar-va-huquqlar.md) · [Mundarija](README.md) · [Keyingi: SQL injection va parametrlar →](62-sql-injection-va-parametrlar.md)

## Tushuncha

60-bobdagi `GRANT` butun jadvalga ruxsat beradi: `SELECT` bor — hamma qatorni ko'rasan. Lekin ko'p hollarda kerakli narsa — **qator darajasidagi** cheklov: bitta platformada bir nechta do'kon (tenant), har do'kon faqat **o'z** buyurtmalarini ko'rsin. Ilovada har so'rovga `WHERE dokon_id = …` qo'shish mumkin — lekin bitta unutilgan `WHERE` boshqa do'konning ma'lumotini ochib qo'yadi.

**Row Level Security** (RLS, qator darajasidagi xavfsizlik) — bu shartni **bazaning o'zi** har so'rovga qo'shadi. Bu bob PostgreSQL'ga xos: MySQL va SQLite'da `CREATE POLICY` yo'q (pastda — sintaksis xatosi).

PostgreSQL hujjati (5.9. Row Security Policies):

- RLS `ALTER TABLE … ENABLE ROW LEVEL SECURITY` bilan yoqiladi. Shundan keyin qatorlarni o'qish va o'zgartirishga har qanday oddiy murojaat **siyosat** (policy) tomonidan ruxsat etilishi kerak.
- Jadvalda siyosat bo'lmasa — **default-deny**: hech bir qator ko'rinmaydi va o'zgartirilmaydi.
- Butun jadvalga taalluqli amallar (`TRUNCATE`, `REFERENCES`) RLS'ga bo'ysunmaydi.
- **Superuser**lar va **`BYPASSRLS`** atributli rollar RLS'ni doim chetlab o'tadi. Jadval **egasi** ham odatda chetlab o'tadi — `ALTER TABLE … FORCE ROW LEVEL SECURITY` bilan egani ham bo'ysundirish mumkin.
- RLS'ni yoqish va siyosat qo'shish — faqat jadval egasining huquqi.

### Siyosat: `USING` va `WITH CHECK`

`CREATE POLICY` hujjati:

| Ifoda | Qachon | Shart bajarilmasa |
| --- | --- | --- |
| `USING (…)` | Mavjud qatorlar: `SELECT`, `UPDATE`, `DELETE` | Qator **ko'rinmaydi** / o'zgartirilmaydi — odatda **jimgina**, xatosiz |
| `WITH CHECK (…)` | Yangi qator: `INSERT` va `UPDATE` natijasi | **Xato** |

Hujjat: `WITH CHECK` berilmasa, `USING` ifodasi u sifatida ham ishlatiladi — shunda do'kon na boshqa do'kon qatorini ko'radi, na boshqa do'kon nomidan qator yarata oladi.

Bir nechta siyosat: **permissive** (standart) siyosatlar `OR` bilan, **restrictive** (`AS RESTRICTIVE`) — `AND` bilan birlashadi.

### Zaxira va `row_security`

Hujjat ogohlantiradi: zaxira olishda RLS ba'zi qatorlarni **jimgina** tashlab yuborsa — falokat. Buning uchun `row_security = off`: u RLS'ni chetlab o'tmaydi, balki so'rov natijasi siyosat bilan filtrlanadigan bo'lsa **xato** beradi — sababini topib tuzatish mumkin.

## Kod

PostgreSQL 18.6, 59-bobdagi `katalog` bazasi. Ikki do'kon; `ilova` — ilova ulanadigan rol (egasi emas). Joriy do'kon — ilova har ulanishda o'rnatadigan sessiya sozlamasi `app.dokon` (`SET app.dokon = '1'`, o'qish — `current_setting('app.dokon')`).

```sql
CREATE ROLE ilova LOGIN;
CREATE TABLE buyurtmalar (id int PRIMARY KEY, dokon_id int NOT NULL, summa int NOT NULL, holat text NOT NULL DEFAULT 'faol');
INSERT INTO buyurtmalar VALUES (1, 1, 100, 'faol'), (2, 1, 200, 'faol'), (3, 2, 300, 'faol'), (4, 2, 400, 'ochirilgan'), (5, 1, 500, 'ochirilgan');
GRANT SELECT, INSERT, UPDATE, DELETE ON buyurtmalar TO ilova;
```

### Default-deny

```text
ALTER TABLE buyurtmalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE
SET ROLE ilova;
SET
SELECT count(*) FROM buyurtmalar;
 count 
-------
     0
(1 row)

RESET ROLE;
RESET
```

RLS yoqildi, siyosat yo'q — `ilova` da `SELECT` huquqi bor, lekin **0** qator.

### Siyosat: faqat o'z do'koni

```text
CREATE POLICY dokon_boyicha ON buyurtmalar TO ilova
    USING (dokon_id = current_setting('app.dokon')::int);
CREATE POLICY
SET ROLE ilova;
SET
SET app.dokon = '1';
SET
SELECT * FROM buyurtmalar ORDER BY id;
 id | dokon_id | summa |   holat    
----+----------+-------+------------
  1 |        1 |   100 | faol
  2 |        1 |   200 | faol
  5 |        1 |   500 | ochirilgan
(3 rows)

SET app.dokon = '2';
SET
SELECT * FROM buyurtmalar ORDER BY id;
 id | dokon_id | summa |   holat    
----+----------+-------+------------
  3 |        2 |   300 | faol
  4 |        2 |   400 | ochirilgan
(2 rows)
```

Bitta so'rov — `app.dokon` ga qarab boshqa natija. Ilova `WHERE dokon_id = …` yozmadi; baza uni o'zi qo'shdi.

### Yozish: `WITH CHECK` xato beradi, `USING` jimgina

`app.dokon = '2'` turganda:

```text
INSERT INTO buyurtmalar VALUES (6, 1, 600);
ERROR:  new row violates row-level security policy for table "buyurtmalar"
UPDATE buyurtmalar SET summa = 0 WHERE id = 1;
UPDATE 0
DELETE FROM buyurtmalar WHERE id = 2;
DELETE 0
INSERT INTO buyurtmalar VALUES (6, 2, 600);
INSERT 0 1
RESET ROLE;
RESET
```

- 1-do'kon uchun `INSERT` — **xato**: `new row violates row-level security policy` (`WITH CHECK` — bu yerda `USING` dan olingan).
- 1-do'konning qatorini `UPDATE`/`DELETE` — **`UPDATE 0`, `DELETE 0`**, xatosiz: qator "ko'rinmaydi" — hujjatdagi "jimgina". Ilova "yangilandi" deb o'ylashi mumkin — natija sonini tekshirish kerak.
- O'z do'koni uchun `INSERT` — o'tdi.

### Ega va `FORCE`

`postgres` — superuser — hamma qatorni ko'radi (`FORCE` ham ta'sir qilmaydi, hujjat: superuser doim chetlab o'tadi):

```text
SELECT count(*) FROM buyurtmalar;
 count 
-------
     6
(1 row)

ALTER TABLE buyurtmalar FORCE ROW LEVEL SECURITY;
ALTER TABLE
SELECT count(*) FROM buyurtmalar;
 count 
-------
     6
(1 row)

ALTER TABLE buyurtmalar NO FORCE ROW LEVEL SECURITY;
ALTER TABLE
```

Oddiy ega bilan:

```text
CREATE ROLE egasi;
CREATE ROLE
ALTER TABLE buyurtmalar OWNER TO egasi;
ALTER TABLE
SET ROLE egasi;
SET
SELECT count(*) FROM buyurtmalar;
 count 
-------
     6
(1 row)

ALTER TABLE buyurtmalar FORCE ROW LEVEL SECURITY;
ALTER TABLE
SELECT count(*) FROM buyurtmalar;
 count 
-------
     0
(1 row)

ALTER TABLE buyurtmalar NO FORCE ROW LEVEL SECURITY;
ALTER TABLE
RESET ROLE;
RESET
```

`egasi` odatda RLS'dan tashqarida — 6 qator. `FORCE` dan keyin — **0**: egaga ham RLS qo'llandi, unga mos siyosat yo'q — default-deny.

### Restrictive siyosat va `row_security = off`

O'chirilgan buyurtmalar hech kimga ko'rinmasin — qo'shimcha, **cheklovchi** siyosat:

```text
CREATE POLICY ochirilmagan ON buyurtmalar AS RESTRICTIVE TO ilova USING (holat <> 'ochirilgan');
CREATE POLICY
SET ROLE ilova;
SET
SET app.dokon = '1';
SET
SELECT * FROM buyurtmalar ORDER BY id;
 id | dokon_id | summa | holat 
----+----------+-------+-------
  1 |        1 |   100 | faol
  2 |        1 |   200 | faol
(2 rows)

SET row_security = off;
SET
SELECT * FROM buyurtmalar ORDER BY id;
ERROR:  query would be affected by row-level security policy for table "buyurtmalar"
RESET row_security;
RESET
RESET ROLE;
RESET
```

- `dokon_boyicha` (permissive) **VA** `ochirilmagan` (restrictive): 1-do'konning 3 qatoridan `ochirilgan` (5) tushib qoldi.
- `row_security = off` — natija filtrlanadigan edi, shuning uchun **xato**: `query would be affected by row-level security policy`. Zaxira skriptlarida shu sozlama bilan ishlash — yashirin yo'qotishdan himoya.

### `pg_read_all_data` RLS'ni chetlab o'tmaydi

60-bobdagi `bek` (`pg_read_all_data` a'zosi):

```text
SET ROLE bek;
SET
SELECT count(*) FROM buyurtmalar;
 count 
-------
     0
(1 row)

RESET ROLE;
RESET
```

**0** — hujjatdagidek: tayyor rol barcha jadvallarda `SELECT` beradi, lekin RLS ishlaydi; `bek` uchun siyosat yo'q — default-deny. Hisobot roli hamma do'konni ko'rishi kerak bo'lsa — unga alohida siyosat yoki `BYPASSRLS`.

## Dialektlar

```text
Parse error in 2nd command line argument: near "POLICY": syntax error
  CREATE POLICY p ON t USING (true);
         ^--- error here
ERROR 1064 (42000) at line 2: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'POLICY p ON mijozlar USING (true)' at line 1
```

MySQL va SQLite'da `CREATE POLICY` — sintaksis xatosi. Ularda qator darajasidagi cheklovning o'xshashi — **view** (`CREATE VIEW … WHERE dokon_id = …`) va foydalanuvchiga jadval o'rniga faqat view'ga huquq berish (MySQL'da, 60-bob); SQLite'da esa kirish nazorati umuman ilova va fayl darajasida.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Qator darajasidagi siyosat | `CREATE POLICY` + `ENABLE ROW LEVEL SECURITY` | Yo'q (sintaksis xatosi) | Yo'q (sintaksis xatosi) |
| Siyosat yo'q bo'lsa | Default-deny | — | — |
| Kim chetlab o'tadi | Superuser, `BYPASSRLS`, ega (`FORCE` siz) | — | — |
| Siyosatlar birlashuvi | Permissive — `OR`, restrictive — `AND` | — | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ilova jadval egasi yoki superuser bilan ulanadi | Ega/superuser RLS'ni chetlab o'tadi — siyosat ishlamaydi (sinovda `postgres` 6 qatorni ko'rdi) | Ilova uchun alohida, ega bo'lmagan rol; yoki `FORCE ROW LEVEL SECURITY` |
| RLS yoqib, siyosat yozmaslik | Default-deny — ilova hech narsa ko'rmaydi | Siyosatni RLS bilan birga |
| `UPDATE 0` ni muvaffaqiyat deb qabul qilish | `USING` jimgina filtrlaydi (sinovda) | Yangilangan qatorlar sonini tekshirish |
| `app.dokon` ni o'rnatmasdan so'rov | `current_setting('app.dokon')` — sozlama yo'q bo'lsa xato | Ulanish/tranzaksiya boshida doim o'rnatish (`SET LOCAL` — tranzaksiya ichida) |
| Zaxira RLS ostidagi rol bilan | Qatorlar jimgina tushib qoladi | `row_security = off` (xato beradi) yoki `BYPASSRLS` rol |
| `pg_read_all_data` hamma qatorni ko'radi deb o'ylash | Hujjat: RLS'ni chetlab o'tmaydi (sinovda 0) | Alohida siyosat yoki `BYPASSRLS` |

## Amaliyot

1. `SET app.dokon` ni umuman bermasdan `ilova` bilan `SELECT` qiling. Qanday xato chiqdi? `current_setting('app.dokon', true)` (ikkinchi argument) bilan siyosatni qayta yozing — endi nima bo'ladi?
2. `ilova` uchun faqat `SELECT` ga taalluqli siyosat (`FOR SELECT`) va faqat `INSERT` ga (`FOR INSERT WITH CHECK …`) alohida siyosatlar yozing.
3. `EXPLAIN SELECT * FROM buyurtmalar` ni `ilova` bilan bajaring. Siyosat sharti rejada qanday ko'rinadi?
4. `hisobot` roli yarating va unga barcha do'konlarni ko'rsatadigan siyosat yozing (`USING (true)`, `FOR SELECT`). Permissive siyosatlar qanday birlashdi?
5. `ALTER ROLE bek BYPASSRLS` dan keyin `bek` bilan sanang (superuser huquqi kerak).

## Rasmiy hujjat

- PostgreSQL — 5.9. Row Security Policies: <https://www.postgresql.org/docs/18/ddl-rowsecurity.html>
- PostgreSQL — CREATE POLICY: <https://www.postgresql.org/docs/18/sql-createpolicy.html>
- PostgreSQL — 19.11.1 Statement Behavior (`row_security`): <https://www.postgresql.org/docs/18/runtime-config-client.html>
- PostgreSQL — 21.5. Predefined Roles (`pg_read_all_data` va RLS): <https://www.postgresql.org/docs/18/predefined-roles.html>
