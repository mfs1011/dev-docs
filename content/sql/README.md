# SQL va PostgreSQL — so'rovlar, sxema va unumdorlik

ORM ortida nima bo'layotganini tushunish, sekin so'rovni topib tuzatish va sxemani production'da xavfsiz o'zgartirish. Misollar PostgreSQL'da, Docker konteynerida real ishga tushirib tekshiriladi.

Rasmiy manba: <https://www.postgresql.org/docs/current/>. Versiyalar har bobni yozishdan oldin tekshiriladi va shu yerda jadval sifatida beriladi.

> **Holat.** Qo'llanma tayyorlanmoqda — quyida rejalashtirilgan mundarija.

---

## I qism — Poydevor (1–6)

| # | Bob | Mazmun |
| --- | --- | --- |
| 01 | Ma'lumotlar bazasi nima va nega PostgreSQL *(tayyorlanmoqda)* | Relyatsion model, SQL vs NoSQL, PostgreSQL'ning o'rni |
| 02 | O'rnatish va ulanish *(tayyorlanmoqda)* | Docker'da PostgreSQL, `psql`, GUI (DBeaver/pgAdmin), ulanish satri |
| 03 | Jadvallar va tiplar *(tayyorlanmoqda)* | `CREATE TABLE`, raqam, matn, sana/vaqt (`timestamptz`!), `boolean`, `uuid`, `numeric` (pul) |
| 04 | CRUD *(tayyorlanmoqda)* | `INSERT`, `SELECT`, `UPDATE`, `DELETE`, `RETURNING` |
| 05 | Filtrlash va saralash *(tayyorlanmoqda)* | `WHERE`, `AND/OR`, `IN`, `LIKE/ILIKE`, `NULL` mantiqi, `ORDER BY`, `LIMIT/OFFSET` |
| 06 | Cheklovlar *(tayyorlanmoqda)* | `PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `CHECK`, `DEFAULT`, `FOREIGN KEY` va `ON DELETE` |

## II qism — So'rovlar (7–14)

| # | Bob | Mazmun |
| --- | --- | --- |
| 07 | JOIN'lar *(tayyorlanmoqda)* | `INNER`, `LEFT`, `RIGHT`, `FULL`, `CROSS`, self-join — diagrammalar bilan |
| 08 | Agregatsiya *(tayyorlanmoqda)* | `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`, `FILTER` |
| 09 | Subquery va `EXISTS` *(tayyorlanmoqda)* | Skalyar, `IN`, korrelyatsiyalangan so'rovlar |
| 10 | CTE *(tayyorlanmoqda)* | `WITH`, rekursiv CTE (daraxtlar, kategoriyalar) |
| 11 | Window funksiyalar *(tayyorlanmoqda)* | `ROW_NUMBER`, `RANK`, `LAG/LEAD`, yig'ma summa, `PARTITION BY` |
| 12 | Set amallari *(tayyorlanmoqda)* | `UNION`, `INTERSECT`, `EXCEPT` |
| 13 | Funksiyalar *(tayyorlanmoqda)* | Matn, sana, `COALESCE`, `CASE`, `generate_series` |
| 14 | `UPSERT` va ommaviy amallar *(tayyorlanmoqda)* | `ON CONFLICT`, `INSERT … SELECT`, `COPY` |

## III qism — Sxema dizayni (15–20)

| # | Bob | Mazmun |
| --- | --- | --- |
| 15 | Modellash *(tayyorlanmoqda)* | Biznesdan jadvallarga, ER diagramma |
| 16 | Normalizatsiya *(tayyorlanmoqda)* | 1NF–3NF, qachon denormalizatsiya |
| 17 | Aloqalar *(tayyorlanmoqda)* | 1:1, 1:N, M:N, oraliq jadvallar |
| 18 | ID tanlash *(tayyorlanmoqda)* | `serial`/`identity`, UUID v4 vs v7, tabiiy kalitlar |
| 19 | JSONB *(tayyorlanmoqda)* | Qachon kerak, operatorlar, indeks, xavflari |
| 20 | Enum, massiv va maxsus tiplar *(tayyorlanmoqda)* | `enum` vs lookup jadval, massivlar, domenlar |

## IV qism — Unumdorlik (21–26)

| # | Bob | Mazmun |
| --- | --- | --- |
| 21 | Indekslar asoslari *(tayyorlanmoqda)* | B-tree qanday ishlaydi, qachon yordam beradi/bermaydi |
| 22 | `EXPLAIN` va `EXPLAIN ANALYZE` *(tayyorlanmoqda)* | Rejani o'qish: Seq Scan, Index Scan, Nested Loop, Hash Join |
| 23 | Indeks turlari *(tayyorlanmoqda)* | Kompozit, partial, expression, covering (`INCLUDE`), GIN, GiST |
| 24 | Tipik sekin so'rovlar *(tayyorlanmoqda)* | N+1, `OFFSET` sahifalash, funksiya ichidagi ustun, `OR` |
| 25 | Sahifalash *(tayyorlanmoqda)* | Offset vs keyset (cursor) |
| 26 | To'liq matnli qidiruv *(tayyorlanmoqda)* | `tsvector`, `tsquery`, `pg_trgm` |

## V qism — Tranzaksiyalar va parallellik (27–30)

| # | Bob | Mazmun |
| --- | --- | --- |
| 27 | Tranzaksiyalar *(tayyorlanmoqda)* | `BEGIN/COMMIT/ROLLBACK`, ACID, savepoint |
| 28 | Izolyatsiya darajalari *(tayyorlanmoqda)* | Read Committed, Repeatable Read, Serializable, anomaliyalar |
| 29 | Qulflar *(tayyorlanmoqda)* | Qator qulflari, `SELECT … FOR UPDATE`, `SKIP LOCKED` (navbat), deadlock |
| 30 | MVCC va VACUUM *(tayyorlanmoqda)* | Nega yangilash yangi qator yaratadi, autovacuum |

## VI qism — Ishlab chiqarish (31–36)

| # | Bob | Mazmun |
| --- | --- | --- |
| 31 | Migratsiyalar *(tayyorlanmoqda)* | Xavfsiz o'zgarishlar, `CREATE INDEX CONCURRENTLY`, katta jadvallar |
| 32 | Foydalanuvchilar va huquqlar *(tayyorlanmoqda)* | Rollar, `GRANT`, eng kam huquq, Row Level Security |
| 33 | Zaxira va tiklash *(tayyorlanmoqda)* | `pg_dump`, `pg_restore`, PITR haqida tushuncha |
| 34 | Ulanishlar *(tayyorlanmoqda)* | Pool, PgBouncer, `max_connections` |
| 35 | ORM bilan ishlash *(tayyorlanmoqda)* | Doctrine/Eloquent/Prisma generatsiya qilgan SQL'ni o'qish, xom SQL qachon |
| 36 | Amaliy loyiha va checklist *(tayyorlanmoqda)* | Do'kon sxemasi noldan, so'rovlar, indekslar, migratsiya |
