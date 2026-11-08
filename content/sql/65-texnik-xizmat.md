# 65 — Texnik xizmat

[← Oldingi: Ulanishlar](64-ulanishlar.md) · [Mundarija](README.md)

## Tushuncha

52-bobda ko'rildi: `UPDATE` va `DELETE` eski qator versiyalarini darhol o'chirmaydi. Vaqt o'tishi bilan jadvalda **o'lik** (dead) qatorlar to'planadi, indekslar shishadi (**bloat**), statistika eskiradi. Bularni tozalash — bazaning muntazam **texnik xizmati** (maintenance).

### PostgreSQL: `VACUUM`

PostgreSQL hujjati (24.1. Routine Vacuuming): PostgreSQL bazalari **vacuuming** deb ataladigan davriy xizmatni talab qiladi. Ko'p o'rnatmalarda buni **autovacuum** fon jarayoniga qoldirish yetarli. `VACUUM` kerak bo'lgan sabablar:

| Sabab | Bob |
| --- | --- |
| Yangilangan yoki o'chirilgan qatorlar egallagan joyni qayta ishlatish | 52 |
| Rejalashtiruvchi statistikasini yangilash (`ANALYZE`) | 46 |
| Juda eski ma'lumotni **tranzaksiya ID aylanib qolishi**dan (wraparound) himoya qilish | Pastda |
| Visibility map'ni yangilash (index-only scan uchun) | 42 |

Ikki variant:

| | `VACUUM` | `VACUUM FULL` |
| --- | --- | --- |
| Nima qiladi | O'lik versiyalarni olib tashlab, joyni **qayta ishlatishga** belgilaydi | Jadvalni o'lik joysiz **to'liq qayta yozadi** |
| Diskdan joy | Odatda **qaytarmaydi** (jadval oxiridagi butunlay bo'sh sahifalar va eksklyuziv qulf oson olinadigan holdan tashqari) | Qaytaradi — jadval minimal hajmda |
| Qulf | Ishlab turgan baza bilan **parallel** ishlaydi (`SELECT`/`INSERT`/`UPDATE`/`DELETE` — normal; faqat `ALTER TABLE` mumkin emas) | **`ACCESS EXCLUSIVE`** — jadval band |
| Disk | Qo'shimcha joy yo'q | Yangi nusxa uchun taxminan jadval hajmicha qo'shimcha joy |

Hujjat: ma'murlar oddiy `VACUUM` dan foydalanishga va `VACUUM FULL` dan **qochishga** harakat qilishi kerak. `VACUUM FULL` (yoki `CLUSTER`, jadvalni qayta yozuvchi `ALTER TABLE`) — faqat ommaviy yangilash/o'chirishdan keyin juda ko'p o'lik joy bo'lganda. Davriy ravishda jadvalni butunlay tozalasangiz — `DELETE` + `VACUUM` o'rniga **`TRUNCATE`** (hujjat; kamchiligi — qat'iy MVCC semantikasi buziladi).

**Autovacuum qachon ishlaydi.** Hujjat: oxirgi `VACUUM` dan beri eskirgan qatorlar soni **vacuum threshold** dan oshsa:

```text sxema
vacuum threshold = Minimum(autovacuum_vacuum_max_threshold,
                           autovacuum_vacuum_threshold + autovacuum_vacuum_scale_factor * pg_class.reltuples)
```

Standart qiymatlar bilan (pastda): 50 + 0.2 × qatorlar soni — ya'ni jadvalning ~20% i o'zgargach. Katta jadvalda bu juda kech bo'lishi mumkin; jadval darajasida sozlanadi (`ALTER TABLE … SET (autovacuum_vacuum_scale_factor = …)`). Hujjat: autovacuum'ni butunlay o'chirish — juda oldindan aytib bo'ladigan yuklama bo'lmasa — oqilona emas.

**Wraparound.** Hujjat (24.1.5): MVCC tranzaksiya ID'larini (XID) solishtirishga tayanadi, XID esa 32 bit. Uzoq ishlagan klasterda (4 milliarddan ortiq tranzaksiya) hisoblagich nolga qaytadi va o'tmishdagi tranzaksiyalar birdan "kelajakda" bo'lib qoladi — ularning natijasi ko'rinmay qoladi, ya'ni **halokatli ma'lumot yo'qolishi**. Oldini olish uchun har bazadagi har jadval kamida har **ikki milliard** tranzaksiyada bir marta vacuum qilinishi kerak — autovacuum buni o'zi qiladi (`autovacuum_freeze_max_age`). Autovacuum'ni o'chirib qo'yish yoki uzoq tranzaksiyalar (52-bob) bu himoyani zaiflashtiradi.

### PostgreSQL: `REINDEX`

Hujjat (24.2. Routine Reindexing): ba'zi hollarda indekslarni davriy ravishda `REINDEX` bilan qayta qurish maqsadga muvofiq. B-tree uchun yangi qurilgan indeks ko'p marta yangilanganidan biroz tezroq (mantiqan qo'shni sahifalar jismonan ham qo'shni). B-tree bo'lmagan indekslarning shishishi yaxshi o'rganilmagan — ularning hajmini kuzatib borish tavsiya etiladi. Ishlab turgan bazada — `REINDEX … CONCURRENTLY` (yozishlarni bloklamasdan, `CREATE INDEX CONCURRENTLY` kabi, 63-bob).

**PostgreSQL 19: `REPACK`** (19-versiya hozircha beta — faqat izoh): hujjatga ko'ra `REPACK` jadvalni o'lik joysiz yangi faylga qayta yozib, bo'sh joyni operatsion tizimga qaytaradi; standart holatda `ACCESS EXCLUSIVE` qulf oladi, `CONCURRENTLY` varianti ham bor.

### MySQL: `OPTIMIZE TABLE`

MySQL hujjati (15.7.3.4 OPTIMIZE TABLE): jadval ma'lumoti va indekslarini qayta tashkil qiladi. InnoDB jadvallarida u **`ALTER TABLE … FORCE`** ga moslanadi — jadval qayta quriladi (online DDL, 63-bob); natijada `Table does not support optimize, doing recreate + analyze instead` degan izoh chiqadi — bu xato emas.

### SQLite: `VACUUM`

SQLite hujjati (VACUUM): `VACUUM` baza faylini **qayta quradi** va minimal hajmga zichlaydi. `auto_vacuum=FULL` rejimida bo'lmasa, ko'p ma'lumot o'chirilganda faylda bo'sh — **free** — sahifalar qoladi va fayl kerakligidan katta bo'ladi. `auto_vacuum` baza yaratilishidan **oldin** sozlanishi kerak (yoki sozlab, darhol `VACUUM`). Joriy holat — `PRAGMA page_count`, `PRAGMA freelist_count`.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. 1 000 000 qator, har birida 100 belgili matn; PostgreSQL'da natijani boshqarish uchun jadvalda autovacuum o'chirilgan.

### Autovacuum chegaralari

```text
SHOW autovacuum_vacuum_threshold;
 autovacuum_vacuum_threshold 
-----------------------------
 50
(1 row)

SHOW autovacuum_vacuum_scale_factor;
 autovacuum_vacuum_scale_factor 
--------------------------------
 0.2
(1 row)

SHOW autovacuum_vacuum_max_threshold;
 autovacuum_vacuum_max_threshold 
---------------------------------
 100000000
(1 row)
```

Million qatorli jadvalda autovacuum ~200 050 ta o'lik qatordan keyin ishga tushadi.

### `VACUUM`: joy qayta ishlatiladi, lekin qaytarilmaydi

```text
SELECT pg_size_pretty(pg_relation_size('jurnal')) AS jadval, pg_size_pretty(pg_relation_size('jurnal_pkey')) AS indeks;
 jadval | indeks 
--------+--------
 135 MB | 21 MB
(1 row)

DELETE FROM jurnal WHERE id % 10 <> 0;
DELETE 900000
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'jurnal';
 n_live_tup | n_dead_tup 
------------+------------
    1000000 |          0
(1 row)

VACUUM jurnal;
VACUUM
SELECT n_live_tup, n_dead_tup FROM pg_stat_user_tables WHERE relname = 'jurnal';
 n_live_tup | n_dead_tup 
------------+------------
     100000 |          0
(1 row)

SELECT pg_size_pretty(pg_relation_size('jurnal')) AS jadval, pg_size_pretty(pg_relation_size('jurnal_pkey')) AS indeks;
 jadval | indeks 
--------+--------
 135 MB | 21 MB
(1 row)

INSERT INTO jurnal SELECT g, repeat('y', 100) FROM generate_series(1000001, 1800000) g;
INSERT 0 800000
SELECT pg_size_pretty(pg_relation_size('jurnal')) AS jadval;
 jadval 
--------
 135 MB
(1 row)
```

- 90% qator o'chirildi — `VACUUM` dan keyin ham jadval **135 MB**, indeks **21 MB**: joy bazada qoldi.
- O'chirishdan keyin `pg_stat_user_tables` darhol yangi qiymatni ko'rsatmadi (`n_live_tup = 1000000`) — kuzatildi: statistika hisoblagichlari kechikib yangilanadi; `VACUUM` dan keyin — 100 000.
- 800 000 yangi qator qo'shildi — jadval **o'smadi**, 135 MB: yangi qatorlar `VACUUM` bo'shatgan joyga yozildi. Oddiy `VACUUM` ning maqsadi aynan shu.

### `VACUUM FULL`

```text
DELETE FROM jurnal WHERE id > 1000000;
DELETE 800000
VACUUM jurnal;
VACUUM
SELECT pg_size_pretty(pg_relation_size('jurnal')) AS jadval, pg_size_pretty(pg_relation_size('jurnal_pkey')) AS indeks;
 jadval | indeks 
--------+--------
 135 MB | 39 MB
(1 row)

VACUUM FULL jurnal;
VACUUM
Time: 193.738 ms
SELECT pg_size_pretty(pg_relation_size('jurnal')) AS jadval, pg_size_pretty(pg_relation_size('jurnal_pkey')) AS indeks;
 jadval | indeks  
--------+---------
 13 MB  | 2208 kB
(1 row)
```

- Yana 800 000 o'chirildi: jadval 135 MB, indeks esa **39 MB** gacha o'sgan (yangi qatorlar indeksga qo'shilgan, joy bo'shatilgan bo'lsa ham).
- `VACUUM FULL` — **194 ms** (`ACCESS EXCLUSIVE` ostida), jadval **13 MB**, indeks **2.2 MB**: 100 000 qatorning haqiqiy hajmi.

### Indeks shishishi va `REINDEX CONCURRENTLY`

```text
CREATE INDEX j_matn ON jurnal (matn);
CREATE INDEX
SELECT pg_size_pretty(pg_relation_size('j_matn')) AS indeks;
 indeks 
--------
 808 kB
(1 row)

UPDATE jurnal SET matn = repeat('z', 100);
UPDATE 100000
UPDATE jurnal SET matn = repeat('w', 100);
UPDATE 100000
VACUUM jurnal;
VACUUM
SELECT pg_size_pretty(pg_relation_size('j_matn')) AS indeks;
 indeks  
---------
 2192 kB
(1 row)

REINDEX INDEX CONCURRENTLY j_matn;
REINDEX
SELECT pg_size_pretty(pg_relation_size('j_matn')) AS indeks;
 indeks 
--------
 808 kB
(1 row)
```

Ikki marta barcha qatorlarni yangilash va `VACUUM` dan keyin `j_matn` **808 kB → 2192 kB**. `REINDEX INDEX CONCURRENTLY` — yana **808 kB**, jadvalga yozish to'xtamagan holda.

## Dialektlar

### MySQL

Fayl hajmi konteyner ichidagi `jurnal.ibd` dan (`ls -l`; jadval — o'z tablespace faylida):

```text
$ ls -l jurnal.ibd
142606336 /var/lib/mysql/sinov/jurnal.ibd
DELETE FROM jurnal WHERE id % 10 <> 0;
+-----------+
| ochirildi |
+-----------+
|    900000 |
+-----------+
$ ls -l jurnal.ibd
142606336 /var/lib/mysql/sinov/jurnal.ibd
OPTIMIZE TABLE jurnal;
+--------------+----------+----------+-------------------------------------------------------------------+
| Table        | Op       | Msg_type | Msg_text                                                          |
+--------------+----------+----------+-------------------------------------------------------------------+
| sinov.jurnal | optimize | note     | Table does not support optimize, doing recreate + analyze instead |
| sinov.jurnal | optimize | status   | OK                                                                |
+--------------+----------+----------+-------------------------------------------------------------------+
$ ls -l jurnal.ibd
20971520 /var/lib/mysql/sinov/jurnal.ibd
```

- 900 000 qator o'chirildi — fayl hajmi **o'zgarmadi** (142 MB): InnoDB ham joyni ichkarida saqlaydi.
- `OPTIMIZE TABLE` — hujjatdagi izoh (`doing recreate + analyze instead`) va fayl **21 MB**.

### SQLite

```sql
SELECT page_count, freelist_count FROM pragma_page_count(), pragma_freelist_count();
DELETE FROM jurnal WHERE id % 10 <> 0;
SELECT page_count, freelist_count FROM pragma_page_count(), pragma_freelist_count();
.shell stat -f '%z %N' jurnal.db
VACUUM;
SELECT page_count, freelist_count FROM pragma_page_count(), pragma_freelist_count();
.shell stat -f '%z %N' jurnal.db
PRAGMA auto_vacuum;
```

```text
27098|0
27098|23760
110993408 jurnal.db
2712|0
11108352 jurnal.db
0
```

- O'chirishdan keyin sahifalar soni o'sha (27 098), ulardan **23 760** tasi bo'sh (`freelist_count`); fayl 111 MB.
- `VACUUM` — 2712 sahifa, bo'sh sahifa 0, fayl **11 MB**.
- `auto_vacuum = 0` (`NONE`) — standart: bo'sh sahifalar faylda qoladi va keyingi yozishlarda qayta ishlatiladi.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| O'chirilgandan keyin joy | Jadvalda qoladi, `VACUUM` dan keyin qayta ishlatiladi | Faylda qoladi (purge bilan qayta ishlatiladi, 52-bob) | Free sahifalar |
| Avtomatik | autovacuum (+ `ANALYZE`) | Purge fon jarayoni | `auto_vacuum` (standart o'chiq) |
| Diskdan joy qaytarish | `VACUUM FULL` (`ACCESS EXCLUSIVE`), PG 19 `REPACK` | `OPTIMIZE TABLE` (= `ALTER TABLE … FORCE`) | `VACUUM` |
| Indeksni qayta qurish | `REINDEX [CONCURRENTLY]` | `OPTIMIZE TABLE` / `ALTER TABLE … FORCE` | `REINDEX` |
| Maxsus xavf | XID wraparound — vacuum'siz halokatli | — | — |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Autovacuum'ni o'chirib qo'yish | O'lik qatorlar to'planadi, statistika eskiradi, wraparound xavfi | Autovacuum yoqiq; kerak bo'lsa jadval darajasida sozlash |
| Har kecha `VACUUM FULL` | Hujjat: qochish kerak — `ACCESS EXCLUSIVE`, qo'shimcha disk | Oddiy `VACUUM`; `FULL` — faqat ommaviy o'chirishdan keyin |
| Oddiy `VACUUM` dan keyin fayl kichrayishini kutish | Joy qayta ishlatiladi, lekin qaytarilmaydi (sinovda 135 MB) | Bu normal; kichraytirish kerak bo'lsa — `VACUUM FULL`/`REPACK` |
| Butun jadvalni `DELETE` bilan tozalash | O'lik qatorlar va vacuum yuki | `TRUNCATE` (hujjat) yoki bo'lakni `DROP` (58-bob) |
| Uzoq ochiq tranzaksiyalar | `VACUUM` o'lik qatorlarni o'chira olmaydi (52-bob) | Qisqa tranzaksiyalar, `idle_in_transaction_session_timeout` |
| Indekslarni hech qachon tekshirmaslik | Shishgan indeks (sinovda 2.7 baravar) | Hajmni kuzatish, `REINDEX CONCURRENTLY` |
| SQLite'da `auto_vacuum` ni keyin yoqish | Hujjat: baza yaratilishidan oldin sozlanadi | Sozlab, darhol `VACUUM` |

## Amaliyot

1. `jurnal` uchun `ALTER TABLE jurnal SET (autovacuum_enabled = true, autovacuum_vacuum_scale_factor = 0.01)` qiling, 20 000 qatorni o'chiring va `pg_stat_user_tables.last_autovacuum` ni kuzating.
2. `SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC` — bazada eng ko'p o'lik qatorli jadvallarni toping.
3. `SELECT datname, age(datfrozenxid) FROM pg_database` — har baza wraparound chegarasidan qanchalik uzoq?
4. `VACUUM (VERBOSE) jurnal` chiqishini o'qing (52-bob). `removable cutoff` nimani bildiradi?
5. SQLite'da `PRAGMA auto_vacuum = FULL; VACUUM;` dan keyin 90% ni o'chiring. Fayl hajmi o'zi kamaydimi?

## Rasmiy hujjat

- PostgreSQL — 24.1. Routine Vacuuming: <https://www.postgresql.org/docs/18/routine-vacuuming.html>
- PostgreSQL — 24.2. Routine Reindexing: <https://www.postgresql.org/docs/18/routine-reindex.html>
- PostgreSQL — VACUUM: <https://www.postgresql.org/docs/18/sql-vacuum.html>
- PostgreSQL 19 (beta) — REPACK: <https://www.postgresql.org/docs/19/sql-repack.html>
- MySQL — 15.7.3.4 OPTIMIZE TABLE Statement: <https://dev.mysql.com/doc/refman/9.7/en/optimize-table.html>
- SQLite — VACUUM: <https://www.sqlite.org/lang_vacuum.html>
- SQLite — PRAGMA (`auto_vacuum`, `freelist_count`): <https://www.sqlite.org/pragma.html>
