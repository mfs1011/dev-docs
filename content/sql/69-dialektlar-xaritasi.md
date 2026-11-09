# 69 — Dialektlar xaritasi

[← Oldingi: ORM ortidagi SQL](68-orm-ortidagi-sql.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha →](70-amaliy-loyiha.md)

## Tushuncha

Har bobda "Dialektlar" bo'limi bor edi: shu mavzu PostgreSQL, MySQL va SQLite'da qanday ishlaydi. Bu bob — o'sha bo'limlarning **xaritasi**: ilovani bir bazadan boshqasiga ko'chirishda, yoki bir nechta bazani qo'llab-quvvatlashda nimaga e'tibor berish kerakligi. Har qatorda — tafsilot va sinov natijasi bo'lgan bob.

SQLite hujjati (Quirks, Caveats, and Gotchas In SQLite) buni bitta jumlada aytadi: SQL — "standart", lekin hech bir ikki SQL dvigateli bir xil ishlamaydi; har amalga oshirishning o'z xususiyatlari bor. MySQL hujjatida ham alohida bo'limlar bor: standartga kengaytmalar (1.7.1) va standartdan farqlar (1.7.2).

Bu xaritada uch "xarakter" ko'rinadi:

| Baza | Umumiy yondashuv |
| --- | --- |
| PostgreSQL | Standartga yaqin va **qat'iy**: noaniq narsada xato beradi (`1 + '1.5'`, `text = son`) |
| MySQL | Standartdan ko'p chetga chiqadi, ko'pincha **xato o'rniga ogohlantirish** bilan davom etadi; xatti-harakat `sql_mode` ga bog'liq |
| SQLite | **Moslashuvchan** tiplar va o'rnatiladigan dvigatel; SQLite hujjatining o'zi ham: shubhali SQL ko'pincha xatosiz qabul qilinadi |

## Xarita

### Sintaksis va literallar

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| `'a' \|\| 'b'` | `ab` | `0` va ogohlantirish (`\|\|` = OR) | `ab` | 1, 33 |
| `"..."` | Identifikator | Satr (`ANSI_QUOTES` siz) | Identifikator; nom topilmasa — satr bo'lishi mumkin | 1, 4 |
| Qo'shtirnoqsiz nomlar | Kichik harfga | Ustunlar — farqsiz; jadvallar OT ga bog'liq | Farqsiz | 4 |
| `5--1` | 5 (`--` izoh) | 6 (`--` dan keyin probel kerak) | 5 | 4 |
| `2 ^ 3` | 8 (daraja) | 1 (XOR) | — | 4 |
| `10 / 4` | `2` | `2.5000` | `2` | 6 |

### Tiplar

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Tip tekshiruvi | Qat'iy | `sql_mode` (qat'iy rejim) | Moslashuvchan (affinity); `STRICT` jadval — ixtiyoriy | 1, 10 |
| Butun son ustuniga `'abc'` | Xato | Xato (qat'iy rejimda) | Qabul qiladi, matn sifatida | 1 |
| `varchar(n)` dan uzun qiymat | Xato | Xato (qat'iy rejimda) | Qabul qiladi | 7 |
| Sana/vaqt tipi | `date`, `timestamp`, `timestamptz`, `interval` | `DATE`, `DATETIME`, `TIMESTAMP` (1970–2038) | Yo'q — `TEXT`/`REAL`/`INTEGER` | 8 |
| Boolean | `boolean` | `TINYINT(1)` | `0`/`1` | 9 |
| UUID | `uuid`, `uuidv7()` | Tip yo'q | Tip yo'q | 9, 39 |
| JSON | `json`, `jsonb` | `JSON` (ikkilik) | `text` + funksiyalar | 35 |
| Massiv, range, domain | Bor | Yo'q | Yo'q | 36 |

### NULL, taqqoslash va konversiya

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| NULL-xavfsiz tenglik | `IS NOT DISTINCT FROM` | `<=>` | `IS` | 10 |
| `concat('a', NULL)` | `'a'` | `NULL` | `'a'` | 10, 33 |
| `1 + 'abc'` | Xato | `1` + ogohlantirish | `1` | 10 |
| `'Salom' = 'salom'` | Yolg'on | Rost (`_ci` kollatsiya) | Yolg'on | 7, 47 |
| `text_ustun = son` | Xato | Ishlaydi, indeks qidiruvsiz | Ishlaydi, indeks bilan (affinity) | 47 |
| NULL saralashda | Eng katta (`ASC` — oxirida) | Eng kichik | Eng kichik | 24 |
| Nolga bo'lish | Xato | `NULL` + ogohlantirish | `NULL` | 32 |
| `length('Oʻgʻiloy')` | 8 (belgi) | 10 (bayt) | 8 | 33 |

### Sxema va cheklovlar

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Sxema | Baza ichida nomlar fazosi | `= baza` | Yo'q (`ATTACH`) | 5 |
| Tashqi kalitlar | Doim | InnoDB'da doim | `PRAGMA foreign_keys = ON` dan keyin | 14, 37 |
| FK ustuniga indeks | Qo'lda | Avtomatik | Qo'lda | 37 |
| DDL tranzaksiyada | `ROLLBACK` qiladi | Yashirin commit | `ROLLBACK` qiladi | 16, 50 |
| Ustun turini o'zgartirish | `ALTER COLUMN … TYPE` | `MODIFY` (`COPY` algoritmi) | Yangi jadval + ko'chirish | 16, 63 |
| Cheklovni avval yangi qatorlarga | `NOT VALID` + `VALIDATE` | — | — | 63 |
| Materialized view | Bor | Community'da yo'q | Yo'q | 17 |

### Yozish

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| `RETURNING` | Bor | Yo'q | Bor (3.35+) | 19 |
| Yangi ID | `RETURNING` / `currval()` | `LAST_INSERT_ID()` — ko'p qatorlida **birinchi** | `last_insert_rowid()` — **oxirgi** | 19 |
| UPSERT | `ON CONFLICT … DO UPDATE` | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT … DO UPDATE` | 20 |
| `MERGE` | Bor | Yo'q | Yo'q | 20 |
| Ommaviy yuklash | `COPY` / `\copy` | `LOAD DATA [LOCAL]` | `.import` | 21 |

### So'rovlar

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Guruhlanmagan ustun | Xato (funksional bog'liqdan tashqari) | `ONLY_FULL_GROUP_BY` — xato | Ruxsat ("bare" ustun) | 26 |
| `FULL OUTER JOIN` | Bor | **Yo'q** | Bor | 25 |
| `LATERAL` | Bor | Bor | Yo'q | 25 |
| Skalyar subquery ko'p qator qaytarsa | Xato | Xato | **Birinchi qator** | 27 |
| `INTERSECT ALL`, `EXCEPT ALL` | Bor | Bor | Yo'q | 28 |
| `FILTER (WHERE …)` | Bor | Yo'q | Bor | 26, 31 |
| `GROUPS` frame, `EXCLUDE` | Bor | Yo'q | Bor | 31 |
| Rekursiya chegarasi | Yo'q | `cte_max_recursion_depth` = 1000 | Yo'q | 30 |
| Keyset `(a, b) > (?, ?)` | Indeks bilan (`Index Cond`) | Indekssiz — `OR` yozuvi kerak | Indeks bilan | 48 |

### Indeks va reja

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Jadval tuzilishi | Heap + alohida indekslar | Klasterli indeks (PK) | `rowid` B-tree | 39, 41 |
| Rejani ko'rish | `EXPLAIN [ANALYZE]` | `EXPLAIN [ANALYZE]`, `FORMAT=TREE` | `EXPLAIN QUERY PLAN` | 45 |
| Qisman indeks | Bor | **Yo'q** | Bor | 43 |
| Ifoda indeksi | `(lower(x))` | `((lower(x)))` | `(lower(x))` | 43, 47 |
| Indeks turlari | B-tree, Hash, GiST, SP-GiST, GIN, BRIN | B-tree, FULLTEXT, spatial | Faqat B-tree | 44 |
| Bog'liq ustunlar statistikasi | `CREATE STATISTICS` | — | — | 46 |
| So'rov ichida hint | Yo'q (`enable_*`) | `/*+ … */` | `INDEXED BY`, `NOT INDEXED` | 46 |
| To'liq matnli qidiruv | `tsvector` + GIN, `pg_trgm` | `FULLTEXT`, ngram | FTS5 | 49 |
| Partitioning | RANGE, LIST, HASH | RANGE, LIST, HASH, KEY | Yo'q | 58 |

### Tranzaksiya va parallellik

| | PostgreSQL | MySQL (InnoDB) | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Tranzaksiya ichida xato | Tranzaksiya **buziladi** — faqat `ROLLBACK` | Operator bekor qilinadi, tranzaksiya davom etadi | Xuddi MySQL kabi (`ABORT`) | 50 |
| Standart izolyatsiya | Read Committed | Repeatable Read | Serializable | 51 |
| Read Uncommitted | = Read Committed | Iflos o'qish **bor** | — | 51 |
| Repeatable Read'da boshqa tranzaksiya o'zgartirgan qatorni yangilash | `40001` xato | Xatosiz, eng yangi qiymat ustidan | — | 51 |
| MVCC: eski versiya | Jadvalda (`VACUUM`) | Undo log (purge) | WAL / asosiy fayl (checkpoint) | 52 |
| Qulf darajasi | Jadval + qator | Indeks yozuvi + bo'shliq (next-key) | Butun fayl | 53 |
| `SKIP LOCKED` | Bor | Bor | — | 53 |
| Deadlock SQLSTATE | `40P01` | `40001` (1213) | `SQLITE_BUSY` | 54 |
| Ilova qulfi | `pg_advisory_lock` | `GET_LOCK` | — | 54 |

### Dasturlash

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Funksiya tili | SQL, PL/pgSQL | Stored program SQL; JavaScript — Enterprise | Ilova tili (C API) | 56 |
| Protsedurada `COMMIT` | Bor (blokdan tashqarida `CALL`) | Bor | — | 56 |
| `FOR EACH STATEMENT` trigger | Bor (transition jadvallari) | Yo'q | Yo'q | 57 |
| View'da `INSTEAD OF` | Bor | Yo'q | Bor | 57 |

### Xavfsizlik va boshqaruv

| | PostgreSQL | MySQL | SQLite | Bob |
| --- | --- | --- | --- | --- |
| Metadata | `information_schema`, `pg_catalog` | `information_schema` (+ kengaytmalar) | `sqlite_schema`, `PRAGMA` | 59 |
| Foydalanuvchi | `LOGIN` rol | `'nom'@'xost'` hisob | Yo'q (fayl huquqlari) | 60 |
| Rol a'zoligi | Darhol | `SET ROLE` / `SET DEFAULT ROLE` dan keyin | — | 60 |
| Qator darajasidagi xavfsizlik | RLS | Yo'q | Yo'q | 61 |
| Ulanishlar chegarasi | `max_connections` (odatda 100), superuser uchun 3 zaxira | `max_connections` (+1 ma'mur uchun) | Server yo'q | 64 |
| Diskdan joy qaytarish | `VACUUM FULL` | `OPTIMIZE TABLE` | `VACUUM` | 65 |
| Paytga qaytarish | WAL arxivi + PITR | Binary log | — | 66 |
| Replikatsiya | Streaming, logical | Binary log asosida | — | 67 |

`—` — tegishli emas yoki sinalmagan; tafsilot ko'rsatilgan bobda.

## Ko'chirishda birinchi tekshiriladigan narsalar

SQLite hujjatining "Quirks" sahifasidagi bo'limlar va ularning shu kitobdagi joyi:

| SQLite xususiyati (hujjat) | Bob |
| --- | --- |
| Embedded, client-server emas | 64 |
| Moslashuvchan tiplar; alohida BOOLEAN va DATETIME yo'q | 6–9 |
| Tashqi kalitlar standart holatda o'chiq | 14, 37 |
| PRIMARY KEY ba'zan NULL bo'lishi mumkin | 14 |
| Agregat so'rovda agregat bo'lmagan ustunlar | 26 |
| To'liq Unicode registr almashtirish yo'q | 33 |
| Qo'sh qo'shtirnoqli satrlar qabul qilinadi | 1, 4 |
| Shubhali SQL xatosiz qabul qilinadi | 22, 27 |
| `AUTOINCREMENT` MySQL'dagidek ishlamaydi | 13 |
| Matnda NUL belgisi mumkin | 7 |
| Vergul bilan JOIN ustuvorligi | 25 |

MySQL hujjatining "Differences from Standard SQL" bo'limlari: `SELECT INTO TABLE` farqlari, `UPDATE` farqlari, tashqi kalit cheklovlari farqlari, `--` izoh boshlanishi (4-bob).

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bir bazada ishlagan SQL boshqasida ham ishlaydi deb o'ylash | Xatti-harakat jimgina farq qiladi (`\|\|`, `concat`, `NULL` tartibi) | Har bazada sinash |
| MySQL ogohlantirishlariga e'tibor bermaslik | Ma'lumot jimgina o'zgaradi | Qat'iy `sql_mode`, `SHOW WARNINGS` |
| SQLite'da tashqi kalitlarni yoqmaslik | Cheklovlar ishlamaydi | Har ulanishda `PRAGMA foreign_keys = ON` |
| Standart izolyatsiyani bir xil deb hisoblash | PG — RC, MySQL — RR | Darajani aniq o'rnatish |
| Tranzaksiyadagi xato xatti-harakatini bir xil deb o'ylash | MySQL/SQLite'da qisman commit (50-bob) | Xatoda doim `ROLLBACK` |
| Bitta bazaning `EXPLAIN` iga qarab indeks dizayni | Rejalar farq qiladi (48-bob: keyset) | Har bazada `EXPLAIN` |

## Amaliyot

1. 1-bobdagi uch farqni (`||`, `"..."`, butun songa `'abc'`) MySQL'da `SET sql_mode = 'ANSI'` bilan qayta sinang. Qaysilari o'zgardi?
2. Bitta jadval va 10 ta so'rovdan iborat kichik ilovani PostgreSQL'dan SQLite'ga ko'chiring. Nechta so'rovni o'zgartirishga to'g'ri keldi?
3. SQLite'da `CREATE TABLE … STRICT` jadval yarating va 1-bobdagi `'abc'` misolini takrorlang.
4. Xaritadagi "Tranzaksiya ichida xato" qatorini o'zingiz uch bazada qayta sinang (50-bob misoli).
5. MySQL hujjatining 1.7.2.4 (`'--'` izoh) bo'limini o'qing va 4-bobdagi `5--1` natijasi bilan solishtiring.

## Rasmiy hujjat

- SQLite — Quirks, Caveats, and Gotchas In SQLite: <https://www.sqlite.org/quirks.html>
- MySQL — 1.7.2 MySQL Differences from Standard SQL: <https://dev.mysql.com/doc/refman/9.7/en/differences-from-ansi.html>
- MySQL — 1.7.1 MySQL Extensions to Standard SQL: <https://dev.mysql.com/doc/refman/9.7/en/extensions-to-ansi.html>
- PostgreSQL — Appendix D. SQL Conformance: <https://www.postgresql.org/docs/18/features.html>
- Har qatordagi tafsilot va manbalar — ko'rsatilgan boblarning "Rasmiy hujjat" bo'limlarida.
