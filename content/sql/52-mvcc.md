# 52 — MVCC

[← Oldingi: Izolyatsiya darajalari](51-izolyatsiya-darajalari.md) · [Mundarija](README.md) · [Keyingi: Qulflar →](53-qulflar.md)

## Tushuncha

51-bobda A tranzaksiyasi B commit qilgan qiymatni ko'rmadi — eski qiymatni ko'rdi. Eski qiymat qayerdan keladi, agar B uni allaqachon o'zgartirgan bo'lsa? Javob — **MVCC** (Multiversion Concurrency Control — ko'p versiyali parallellikni boshqarish).

PostgreSQL hujjati (13.1. Introduction, Concurrency Control): har SQL operatori ma'lumotlarning bir muncha oldingi **snapshot**ini (baza versiyasini) ko'radi — ma'lumotlarning hozirgi holatidan qat'i nazar. MVCC'ning asosiy afzalligi: o'qish uchun olingan qulflar yozish uchun olingan qulflar bilan to'qnashmaydi — **o'qish yozishni bloklamaydi, yozish o'qishni bloklamaydi**.

G'oya bitta: o'zgartirilgan qatorning **eski versiyasi** darhol yo'qolmaydi — u kerak bo'lishi mumkin bo'lgan tranzaksiyalar uchun saqlanadi. Uchala baza buni har xil joyda qiladi:

| Baza | Eski versiya qayerda | Kim tozalaydi |
| --- | --- | --- |
| PostgreSQL | **Jadvalning o'zida** — har `UPDATE` yangi qator versiyasini yozadi, eskisi joyida qoladi | `VACUUM` (65-bob) |
| MySQL (InnoDB) | **Undo log**da — jadvalda faqat yangi versiya, eskisini qayta qurish uchun ma'lumot alohida | Purge (fon jarayoni) |
| SQLite (WAL rejimi) | Asosiy faylda — eski sahifalar, yangilari **WAL faylida** | Checkpoint |

### PostgreSQL: qator versiyalari

PostgreSQL hujjati (5.6. System Columns) har jadvalda ko'rinmas tizim ustunlari bor deydi:

| Ustun | Ma'nosi |
| --- | --- |
| `xmin` | Shu **qator versiyasi**ni qo'shgan tranzaksiya identifikatori. Hujjat: qator versiyasi — qatorning bitta holati; har `UPDATE` o'sha mantiqiy qator uchun **yangi versiya** yaratadi |
| `xmax` | O'chirgan tranzaksiya identifikatori yoki 0. Ko'rinadigan versiyada ham nol bo'lmasligi mumkin — o'chiruvchi tranzaksiya hali commit qilmagan yoki o'chirish bekor qilingan |
| `ctid` | Versiyaning jadvaldagi **fizik joyi** (sahifa, o'rin). `UPDATE` yoki `VACUUM FULL` da o'zgaradi — shuning uchun qatorni aniqlash uchun ishlatilmaydi, buning uchun birlamchi kalit bor |

Sahifa tuzilishi hujjati (66.6. Database Page Layout) bo'yicha qator sarlavhasida `t_xmin` (qo'shish XID'i), `t_xmax` (o'chirish XID'i) va `t_ctid` (**shu yoki yangiroq** versiyaning manzili) saqlanadi — eski versiya yangisiga ishora qiladi.

Hujjat (24.1. Routine Vacuuming): `UPDATE` yoki `DELETE` eski versiyani **darhol o'chirmaydi** — u boshqa tranzaksiyalarga hali ko'rinishi mumkin. Keyinroq hech kimga kerak bo'lmay qolgan versiyalar joyini qayta ishlatish uchun `VACUUM` ishlaydi.

### MySQL (InnoDB): undo log

MySQL hujjati (17.3 InnoDB Multi-Versioning): InnoDB o'zgargan qatorlarning eski versiyalari haqidagi ma'lumotni **undo tablespace**lardagi **rollback segment**da saqlaydi va undan ikki maqsadda foydalanadi — `ROLLBACK` uchun va **consistent read** uchun qatorning oldingi versiyasini qayta qurishga. Har qatorga InnoDB uchta ichki maydon qo'shadi:

| Maydon | Hajm | Ma'nosi |
| --- | --- | --- |
| `DB_TRX_ID` | 6 bayt | Qatorni oxirgi qo'shgan/yangilagan tranzaksiya. O'chirish ham ichkarida yangilash — maxsus bit bilan |
| `DB_ROLL_PTR` | 7 bayt | Undo log yozuviga ko'rsatkich — yangilashdan oldingi holatni qayta qurish uchun |
| `DB_ROW_ID` | 6 bayt | Klasterli indeks avtomatik yaratilsa ishlatiladigan qator ID'si |

Hujjat: update undo log'lari, ularga muhtoj snapshot'li tranzaksiya qolmaguncha o'chirilmaydi. Shuning uchun tranzaksiyalarni — **faqat o'qiydiganlarini ham** — muntazam commit qilish tavsiya etiladi; aks holda rollback segment juda kattalashib, undo tablespace'ni to'ldirishi mumkin. O'chirilgan qator ham fizik jihatdan darhol yo'qolmaydi — **purge** uni keyinroq olib tashlaydi.

### SQLite: WAL

SQLite hujjati (Write-Ahead Logging, 2.2): WAL rejimida o'zgarishlar alohida **WAL fayliga** qo'shiladi. O'qish boshlanganda u WAL'dagi oxirgi to'g'ri commit yozuvining joyini eslab qoladi — **end mark**. Tranzaksiya davomida end mark o'zgarmaydi, shuning uchun o'quvchi bazani bitta paytdagi holatida ko'radi. Sahifa kerak bo'lsa, avval WAL'dan (end mark'gacha), bo'lmasa asosiy fayldan o'qiladi.

**Checkpoint** — WAL'dagi sahifalarni asosiy faylga ko'chirish. Hujjat: checkpoint o'quvchilar bilan birga ishlay oladi, lekin biror o'quvchining end mark'idan **keyingi** sahifaga yetganda to'xtashi kerak — aks holda o'quvchi foydalanayotgan faylni ustidan yozib yuboradi. Demak uzoq o'qish tranzaksiyasi checkpoint'ni to'xtatadi va WAL o'sadi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. Sahifani ko'rish uchun PostgreSQL'ning `pageinspect` kengaytmasi (`CREATE EXTENSION pageinspect`); natijani boshqarish uchun autovacuum o'chirilgan.

### `xmin`, `xmax`, `ctid` va sahifadagi versiyalar

```text
CREATE TABLE hisoblar (nom text PRIMARY KEY, balans int NOT NULL) WITH (autovacuum_enabled = false);
CREATE TABLE
INSERT INTO hisoblar VALUES ('Aziza', 1000);
INSERT 0 1
SELECT xmin, xmax, ctid, * FROM hisoblar;
 xmin | xmax | ctid  |  nom  | balans 
------+------+-------+-------+--------
  826 |    0 | (0,1) | Aziza |   1000
(1 row)

UPDATE hisoblar SET balans = 900 WHERE nom = 'Aziza';
UPDATE 1
SELECT xmin, xmax, ctid, * FROM hisoblar;
 xmin | xmax | ctid  |  nom  | balans 
------+------+-------+-------+--------
  827 |    0 | (0,2) | Aziza |    900
(1 row)

SELECT lp, t_xmin, t_xmax, t_ctid FROM heap_page_items(get_raw_page('hisoblar', 0));
 lp | t_xmin | t_xmax | t_ctid 
----+--------+--------+--------
  1 |    826 |    827 | (0,2)
  2 |    827 |      0 | (0,2)
(2 rows)
```

- `INSERT` — tranzaksiya 826, versiya sahifa 0, o'rin 1 da.
- `UPDATE` dan keyin `SELECT` **yangi** versiyani ko'rsatdi: `xmin` 827, joyi `(0,2)` — qator **ko'chdi**.
- Sahifada (`heap_page_items`) esa **ikkala** versiya bor: 1-o'rindagi eski versiyaning `t_xmax = 827` (827-tranzaksiya uni "o'chirdi") va `t_ctid = (0,2)` — yangisiga ishora. Bitta `UPDATE` = bitta yangi versiya + bitta eskirgan.

```text
BEGIN;
BEGIN
DELETE FROM hisoblar WHERE nom = 'Aziza';
DELETE 1
ROLLBACK;
ROLLBACK
SELECT xmin, xmax, ctid, * FROM hisoblar;
 xmin | xmax | ctid  |  nom  | balans 
------+------+-------+-------+--------
  827 |  828 | (0,2) | Aziza |    900
(1 row)
```

Hujjatdagi holat: qator ko'rinadi, lekin `xmax = 828` — o'chirishga urinish bekor qilingan tranzaksiya. `ROLLBACK` versiyani qayta yozmadi — 828 commit qilinmagani uchun uning `xmax` i hisobga olinmaydi.

### Ochiq snapshot eski versiyalarni ushlab turadi

A — Repeatable Read tranzaksiyasi ochiq; B uch marta yangilaydi va `VACUUM` qiladi (51-bobdagi ikki seansli skript; `VACUUM VERBOSE` chiqishidan asosiy qatorlar):

```text
A> BEGIN ISOLATION LEVEL REPEATABLE READ;
   BEGIN
A> SELECT balans FROM hisoblar;
    balans 
   --------
      1000
   (1 row)
B> UPDATE hisoblar SET balans = 900;
   UPDATE 1
B> UPDATE hisoblar SET balans = 800;
   UPDATE 1
B> UPDATE hisoblar SET balans = 700;
   UPDATE 1
B> SELECT lp, t_xmin, t_xmax, t_ctid FROM heap_page_items(get_raw_page('hisoblar', 0));
    lp | t_xmin | t_xmax | t_ctid 
   ----+--------+--------+--------
     1 |    829 |    830 | (0,2)
     2 |    830 |    831 | (0,3)
     3 |    831 |    832 | (0,4)
     4 |    832 |      0 | (0,4)
   (4 rows)
B> VACUUM (VERBOSE) hisoblar;
   INFO:  vacuuming "postgres.public.hisoblar"
   …
   tuples: 0 removed, 4 remain, 3 are dead but not yet removable
   removable cutoff: 830, which was 3 XIDs old when operation ended
   …
A> SELECT balans FROM hisoblar;
    balans 
   --------
      1000
   (1 row)
A> COMMIT;
   COMMIT
B> VACUUM (VERBOSE) hisoblar;
   INFO:  vacuuming "postgres.public.hisoblar"
   …
   tuples: 3 removed, 1 remain, 0 are dead but not yet removable
   removable cutoff: 833, which was 0 XIDs old when operation ended
   …
B> SELECT lp, t_xmin, t_xmax, t_ctid FROM heap_page_items(get_raw_page('hisoblar', 0));
    lp | t_xmin | t_xmax | t_ctid 
   ----+--------+--------+--------
     1 |        |        | 
     2 |        |        | 
     3 |        |        | 
     4 |    832 |      0 | (0,4)
   (4 rows)
```

- Sahifada to'rt versiya — `t_ctid` zanjiri: `(0,1) → (0,2) → (0,3) → (0,4)`.
- A ochiq turganda `VACUUM`: **`3 are dead but not yet removable`** — uchta eskirgan versiya bor, lekin ularni o'chirib bo'lmaydi (hujjat: versiya boshqa tranzaksiyalarga hali ko'rinishi mumkin ekan, o'chirilmaydi). A haqiqatan ham `1000` ni — birinchi versiyani — ko'rdi.
- A commit qilgach: **`3 removed`**, o'rinlar bo'shadi (`lp` 1–3 bo'sh), faqat joriy versiya qoldi.

Uzoq ochiq tranzaksiya (hatto faqat o'qiydigan) — jadval o'sishining (bloat) eng ko'p uchraydigan sababi (65-bob).

## Dialektlar

### MySQL

1000 qator, har birida 1000. A — consistent snapshot bilan tranzaksiya; B uch marta barcha qatorlarni yangilaydi (chiqishdan `mysql -vvv` aks-sadosi, bo'sh qatorlar, `Rows matched` va `row in set` qatorlari olib tashlangan):

```text
A> START TRANSACTION WITH CONSISTENT SNAPSHOT;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT sum(balans) FROM hisoblar;
   +-------------+
   | sum(balans) |
   +-------------+
   |     1000000 |
   +-------------+
B> UPDATE hisoblar SET balans = balans - 1;
   Query OK, 1000 rows affected (0.007 sec)
B> UPDATE hisoblar SET balans = balans - 1;
   Query OK, 1000 rows affected (0.008 sec)
B> UPDATE hisoblar SET balans = balans - 1;
   Query OK, 1000 rows affected (0.009 sec)
B> SELECT trx_id, trx_state, trx_started, trx_isolation_level FROM information_schema.innodb_trx;
   +-----------------+-----------+---------------------+---------------------+
   | trx_id          | trx_state | trx_started         | trx_isolation_level |
   +-----------------+-----------+---------------------+---------------------+
   | 562948126805208 | RUNNING   | 2026-11-08 01:50:50 | REPEATABLE READ     |
   +-----------------+-----------+---------------------+---------------------+
A> SELECT sum(balans) FROM hisoblar;
   +-------------+
   | sum(balans) |
   +-------------+
   |     1000000 |
   +-------------+
A> COMMIT;
   Query OK, 0 rows affected (0.000 sec)
```

- Jadvalda endi har qatorda 997, lekin A **1 000 000** ni ko'rdi: InnoDB 3000 ta eski holatni undo log'dan qayta qurdi (hujjat: rollback segment ma'lumoti consistent read uchun).
- `START TRANSACTION WITH CONSISTENT SNAPSHOT` — snapshot birinchi `SELECT` da emas, darhol olinadi.
- `information_schema.innodb_trx` — ochiq tranzaksiyalar va qachon boshlangani. Uzoq `RUNNING` tranzaksiya — undo log o'sishining sababi (hujjat: tranzaksiyalarni muntazam commit qiling).

### SQLite

WAL rejimi, 1000 qator. A o'qish tranzaksiyasini ochadi, B ikki marta yangilaydi va checkpoint qilishga urinadi. `wal_checkpoint` natijasi (hujjat): uchta son — bloklandimi (0/1), WAL'dagi sahifalar soni, asosiy faylga ko'chirilgan sahifalar soni.

```text
A> BEGIN;
A> SELECT sum(balans) FROM hisoblar;
   1000000
B> UPDATE hisoblar SET balans = balans - 1;
B> UPDATE hisoblar SET balans = balans - 1;
B> .shell stat -f '%z %N' sl.db sl.db-wal
   20480 sl.db
   24752 sl.db-wal
B> PRAGMA wal_checkpoint(PASSIVE);
   0|6|0
A> SELECT sum(balans) FROM hisoblar;
   1000000
A> COMMIT;
B> PRAGMA wal_checkpoint(PASSIVE);
   0|6|6
B> PRAGMA wal_checkpoint(TRUNCATE);
   0|0|0
B> .shell stat -f '%z %N' sl.db sl.db-wal
   20480 sl.db
   0 sl.db-wal
B> SELECT sum(balans) FROM hisoblar;
   998000
```

- Yangi sahifalar WAL faylida (24 752 bayt), asosiy fayl (20 480) o'zgarmagan.
- A ochiq turganda checkpoint: `0|6|0` — WAL'da 6 sahifa, ko'chirildi **0**: A'ning end mark'idan keyingi sahifalarni ko'chirib bo'lmaydi. A eski yig'indini ko'rdi.
- A commit qilgach: `0|6|6` — hammasi ko'chirildi; `TRUNCATE` WAL faylini 0 ga qisqartirdi.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite (WAL) |
| --- | --- | --- | --- |
| Eski versiya | Jadvalda, yangi versiya — boshqa joyda (`ctid` o'zgaradi) | Undo log, jadvalda — joriy | Asosiy fayl; yangisi WAL'da |
| Versiya ma'lumoti | `xmin`, `xmax`, `ctid` (ko'rinadigan tizim ustunlari) | `DB_TRX_ID`, `DB_ROLL_PTR` (ichki) | WAL'dagi commit yozuvlari va end mark |
| Tozalash | `VACUUM` / autovacuum | Purge | Checkpoint |
| Uzoq tranzaksiya oqibati | O'lik versiyalar o'chirilmaydi — jadval shishadi | Undo log o'sadi | Checkpoint to'xtaydi — WAL o'sadi |
| Ochiq tranzaksiyalarni ko'rish | `pg_stat_activity` (67-bob) | `information_schema.innodb_trx` | — |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Tranzaksiyani soatlab ochiq qoldirish (hatto faqat `SELECT`) | PG: o'lik versiyalar o'chmaydi (sinovda `dead but not yet removable`); InnoDB: undo log o'sadi; SQLite: WAL o'sadi | Qisqa tranzaksiyalar; MySQL hujjati: o'qiydiganlarini ham muntazam commit qilish |
| `ctid` ni qator identifikatori sifatida saqlash | `UPDATE` da o'zgaradi (sinovda `(0,1)` → `(0,2)`) | Birlamchi kalit |
| PG'da tez-tez yangilanadigan katta qatorlar | Har `UPDATE` — butun qatorning yangi versiyasi | Tez o'zgaradigan ustunlarni alohida jadvalga ajratish |
| `xmax ≠ 0` ni "qator o'chirilgan" deb tushunish | Bekor qilingan o'chirishda ham nol emas (sinovda 828) | Ko'rinishni bazaga qoldirish |
| SQLite WAL'da ilova o'qish ulanishini doim ochiq ushlab turishi | Checkpoint hech qachon tugamaydi | O'qish tranzaksiyalarini yopish |

## Amaliyot

1. `UPDATE hisoblar SET balans = balans` (qiymat o'zgarmasa ham) dan keyin `ctid` va `xmin` o'zgaradimi?
2. `heap_page_items` bilan `DELETE` dan keyin sahifani ko'ring, so'ng `VACUUM` dan keyin.
3. PostgreSQL'da `SELECT txid_current()` ni ikki marta bajaring (tranzaksiyasiz). Nega qiymat oshdi? `BEGIN` ichida ikki marta-chi?
4. MySQL'da A ochiq turganda `SHOW ENGINE INNODB STATUS` dan `TRANSACTIONS` bo'limini o'qing. A qanday ko'rinadi?
5. SQLite'da A'ni ochiq qoldirib, B bilan 2000 marta yangilang. WAL fayl hajmi qanday o'zgardi?

## Rasmiy hujjat

- PostgreSQL — 13.1. Introduction (Concurrency Control): <https://www.postgresql.org/docs/18/mvcc-intro.html>
- PostgreSQL — 5.6. System Columns: <https://www.postgresql.org/docs/18/ddl-system-columns.html>
- PostgreSQL — 66.6. Database Page Layout: <https://www.postgresql.org/docs/18/storage-page-layout.html>
- PostgreSQL — 24.1. Routine Vacuuming: <https://www.postgresql.org/docs/18/routine-vacuuming.html>
- PostgreSQL — F.23. pageinspect: <https://www.postgresql.org/docs/18/pageinspect.html>
- MySQL — 17.3 InnoDB Multi-Versioning: <https://dev.mysql.com/doc/refman/9.7/en/innodb-multi-versioning.html>
- SQLite — Write-Ahead Logging: <https://www.sqlite.org/wal.html>
- SQLite — PRAGMA `wal_checkpoint`: <https://www.sqlite.org/pragma.html#pragma_wal_checkpoint>
