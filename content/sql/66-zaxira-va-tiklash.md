# 66 — Zaxira va tiklash

[← Oldingi: Texnik xizmat](65-texnik-xizmat.md) · [Mundarija](README.md)

## Tushuncha

Zaxira (backup) — bitta savolga javob: **"ma'lumot yo'qolsa, qayerdan va qaysi paytgacha tiklaymiz?"** Sabab har xil bo'ladi: disk buziladi, server o'chadi, kimdir `WHERE` siz `DELETE` yozadi. Oxirgisidan disk zaxirasi (RAID, replika — 67-bob) qutqarmaydi, chunki `DELETE` replikaga ham darhol yetib boradi.

PostgreSQL hujjati (25. Backup and Restore) zaxiralashning uchta **tubdan farqli** usulini beradi:

| Usul | Nima | Qachon |
| --- | --- | --- |
| **SQL dump** (`pg_dump`) | Bazani qayta yaratadigan SQL yoki arxiv fayli (mantiqiy zaxira) | Kichik va o'rta bazalar, boshqa versiyaga ko'chirish |
| **Fayl tizimi darajasida** | Ma'lumot papkasining nusxasi | Hujjat (25.2): yaroqli zaxira uchun server to'xtatilishi shart |
| **Uzluksiz arxivlash va PITR** | Asosiy zaxira + **WAL** fayllari | Istalgan **paytga** qaytarish (point-in-time recovery) |

### `pg_dump` formatlari

PostgreSQL hujjati (25.1. SQL Dump):

- `pg_dump` standart holatda matnli SQL chiqaradi; boshqa formatlar **parallel ishlash** va obyektlarni tanlab tiklash imkonini beradi. Matn bo'lmagan dump'lar **`pg_restore`** bilan tiklanadi.
- `pg_dump` hujjati (pg_dump): baza bir vaqtda ishlatilayotgan bo'lsa ham izchil eksport qiladi va boshqa foydalanuvchilarni bloklamaydi; lekin oddiy holatlardan tashqari `pg_dump` odatda **production bazalarni muntazam zaxiralash uchun to'g'ri tanlov emas** (25-bobga yo'llaydi — ya'ni PITR).
- `pg_dump` bir vaqtda faqat **bitta bazani** zaxiralaydi va rollar hamda tablespace'larni (ular butun klasterga tegishli) saqlamaydi. Butun klaster uchun — `pg_dumpall`.

| `pg_dump` formati | Tiklash | Xususiyati |
| --- | --- | --- |
| `-Fp` (standart) | `psql` | Oddiy SQL matni |
| `-Fc` (custom) | `pg_restore` | Siqilgan; `pg_restore -l` — mundarija; `-j` — parallel tiklash |
| `-Fd` (directory) | `pg_restore` | Har jadval alohida fayl; parallel zaxira (`pg_dump -j`) shu formatda |

### WAL va PITR

PostgreSQL hujjati (25.3. Continuous Archiving and Point-in-Time Recovery): PostgreSQL har doim **write ahead log** (WAL) yuritadi — ma'lumot fayllaridagi har o'zgarish yoziladi. Asosiy maqsad — nosozlikdan keyin tiklanish: oxirgi checkpoint'dan keyingi yozuvlar qayta "o'ynatiladi". Lekin bu jurnal uchinchi strategiyani ham beradi: **fayl tizimi zaxirasi + WAL fayllari zaxirasi**. Tiklashda asosiy zaxira qo'yiladi va arxivdagi WAL'lar kerakli paytgacha qayta o'ynatiladi.

Sozlash (hujjat): `wal_level = replica` (yoki yuqori), `archive_mode = on`, `archive_command` — WAL faylini arxivga ko'chiradigan buyruq (`%p` — fayl yo'li, `%f` — fayl nomi). Asosiy zaxira — eng oson yo'li `pg_basebackup`.

Tiklash (hujjat): `postgresql.conf` da tiklash sozlamalari (`restore_command`, kerak bo'lsa `recovery_target_time`) va ma'lumot papkasida **`recovery.signal`** fayli. `recovery_target_action` (19.5.6) standart — `pause`: server nishonga yetib to'xtaydi, ma'lumotni tekshirish mumkin; `pg_wal_replay_resume()` tiklashni yakunlaydi.

### MySQL

MySQL hujjati (9.2 Database Backup Methods) usullarni sanaydi: `mysqldump` bilan zaxira, fayllarni nusxalash, **binary log** bilan inkremental zaxira va paytga qaytarish (point-in-time recovery, 9.5), MySQL Enterprise Backup. `mysqldump` hujjati (6.5.4) katta hajmlar uchun **MySQL Shell dump utilitlarini** tavsiya qiladi: ko'p oqimli parallel dump, siqish, jarayonni ko'rsatish.

`mysqldump --single-transaction` (hujjat): izolyatsiyani `REPEATABLE READ` ga qo'yadi va dump'dan oldin `START TRANSACTION` yuboradi. InnoDB kabi tranzaksion jadvallarda bu bazaning `START TRANSACTION` paytidagi **izchil holatini** ilovalarni bloklamasdan zaxiralaydi (51–52-boblar: snapshot).

### SQLite

SQLite hujjati (SQLite Backup API): faylni oddiy nusxalash ko'p hollarda tez ishlaydi, lekin kamchiliklari bor — nusxalash davomida yozmoqchi bo'lgan klientlar kutadi, xotiradagi bazaga ishlatib bo'lmaydi, nusxalash paytida elektr uzilsa — zaxira buzilishi mumkin. Yechim — **Online Backup API** (CLI'da `.backup`). Boshqa yo'l — **`VACUUM INTO 'fayl'`** (VACUUM hujjati): zaxira minimal hajmda bo'ladi, o'chirilgan ma'lumot izi qolmaydi; backup API esa kamroq CPU sarflaydi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

`dokon` bazasi: `mijozlar` (50 000), `buyurtmalar` (200 000, tashqi kalit va indeks bilan).

### `pg_dump -Fc` va `pg_restore -j`

```text
$ pg_dump -U postgres -Fc -f dokon.dump dokon
$ ls -lh dokon.dump
952K dokon.dump
$ pg_restore -l dokon.dump | grep -v "^;"
220; 1259 17055 TABLE public buyurtmalar postgres
219; 1259 17047 TABLE public mijozlar postgres
3852; 0 17055 TABLE DATA public buyurtmalar postgres
3851; 0 17047 TABLE DATA public mijozlar postgres
3702; 2606 17060 CONSTRAINT public buyurtmalar buyurtmalar_pkey postgres
3699; 2606 17054 CONSTRAINT public mijozlar mijozlar_pkey postgres
3700; 1259 17066 INDEX public b_mijoz postgres
3703; 2606 17061 FK CONSTRAINT public buyurtmalar buyurtmalar_mijoz_id_fkey postgres
$ createdb -U postgres dokon_tiklangan
$ pg_restore -U postgres -j 2 -d dokon_tiklangan dokon.dump
$ psql -U postgres -d dokon_tiklangan -c "SELECT (SELECT count(*) FROM mijozlar) AS mijozlar, (SELECT count(*) FROM buyurtmalar) AS buyurtmalar"
 mijozlar | buyurtmalar 
----------+-------------
    50000 |      200000
(1 row)
```

- Custom format — **952 KB** (siqilgan).
- `pg_restore -l` — dump mundarijasi: jadvallar, ma'lumot, cheklovlar, indeks, tashqi kalit. Undan tanlab tiklash mumkin (`-L` bilan).
- `-j 2` — ikki oqimda tiklash; natija — barcha qatorlar joyida.

### PITR: `DELETE` dan oldingi paytga qaytish

Alohida test klaster (5433-port). Arxivlash yoqiladi, asosiy zaxira olinadi, keyin yana ma'lumot qo'shiladi va **xato** `DELETE` bo'ladi (chiqishda yo'llar `…` bilan qisqartirilgan):

```text
$ initdb …; postgresql.conf: wal_level = replica, archive_mode = on, archive_command = 'test ! -f …/arxiv/%f && cp %p …/arxiv/%f'
$ pg_basebackup -p 5433 -U postgres -D asos -Ft -z -X none
NOTICE:  all required WAL segments have been archived
backup_manifest
base.tar.gz
$ psql -p 5433 -c "SELECT now()"  -- hammasi joyida
1500|2026-11-08 11:17:33.157316+05
$ psql -p 5433 -c "DELETE FROM tolovlar"  -- xato!
DELETE 1500
$ ls arxiv
000000010000000000000001
000000010000000000000002
000000010000000000000002.00000028.backup
000000010000000000000003
```

- `pg_basebackup` — asosiy zaxira (`base.tar.gz`); `-X none` — WAL zaxiraga qo'shilmaydi, arxivdan olinadi (`all required WAL segments have been archived`).
- Asosiy zaxiradan **keyin** 500 ta to'lov qo'shildi (jami 1500), vaqt yozib olindi, keyin — `DELETE 1500`.
- `pg_switch_wal()` dan keyin arxivda WAL segmentlari va `.backup` tarix fayli.

Tiklash — yangi papkaga (5434-port):

```text
$ tar xzf asos/base.tar.gz -C tiklash
$ postgresql.conf: port = 5434, restore_command = 'cp …/arxiv/%f %p', recovery_target_time = '2026-11-08 11:17:33.157316+05'
$ touch tiklash/recovery.signal
$ pg_ctl -D tiklash start
server started
$ psql -p 5434 -c "SELECT count(*), sum(summa) FROM tolovlar"
 count |  sum   
-------+--------
  1500 | 200000
(1 row)

$ psql -p 5434 -c "SELECT pg_is_in_recovery()"
 pg_is_in_recovery 
-------------------
 t
(1 row)

$ grep -E "starting point-in-time|recovery stopping|pausing" tlog
LOG:  starting point-in-time recovery to 2026-11-08 11:17:33.157316+05
LOG:  recovery stopping before commit of transaction 754, time 2026-11-08 11:17:34.201612+05
LOG:  pausing at the end of recovery
```

- Asosiy zaxirada faqat **1000** to'lov bor edi, lekin server arxivdagi WAL'larni o'ynatib, **1500** ga yetdi — asosiy zaxiradan keyingi 500 ham qaytdi.
- Jurnal: `recovery stopping before commit of transaction 754` — `DELETE` tranzaksiyasi commit qilinishidan **oldin** to'xtadi.
- `pg_is_in_recovery() = t`, `pausing at the end of recovery` — hujjatdagi `pause`: ma'lumotni tekshirib, to'g'ri paytmi — hal qilish mumkin.

```text
$ psql -p 5434 -c "SELECT pg_wal_replay_resume()"
 pg_wal_replay_resume 
----------------------
 
(1 row)

$ psql -p 5434 -c "SELECT pg_is_in_recovery()"
 pg_is_in_recovery 
-------------------
 f
(1 row)
```

`pg_wal_replay_resume()` — tiklash yakunlandi, server oddiy (yozish mumkin bo'lgan) rejimda.

Bu sinovning asosiy saboqlari: `pg_dump` faqat dump olingan paytga qaytaradi; PITR esa **soniyagacha** — lekin buning uchun arxivlash `DELETE` dan **oldin** yoqilgan bo'lishi kerak.

## Dialektlar

### MySQL

Birinchi urinish — dump'ni o'sha serverda boshqa bazaga tiklash:

```text
$ mysqldump --single-transaction --routines --triggers dokon > dokon.sql
Warning: A partial dump from a server that has GTIDs will by default include the GTIDs of all transactions, even those that changed suppressed parts of the database. If you don't want to restore GTIDs, pass --set-gtid-purged=OFF. To make a complete dump, pass --all-databases --triggers --routines --events. 
$ ls -lh dokon.sql
4.5M /tmp/dokon.sql
$ grep -c "^INSERT INTO" dokon.sql
6
$ mysql -e "CREATE DATABASE dokon_tiklangan"; mysql dokon_tiklangan < dokon.sql
ERROR 3546 (HY000) at line 24: @@GLOBAL.GTID_PURGED cannot be changed: the added gtid set must not overlap with @@GLOBAL.GTID_EXECUTED
$ mysql dokon_tiklangan -e "SELECT …"
ERROR 1146 (42S02) at line 1: Table 'dokon_tiklangan.mijozlar' doesn't exist
```

- Bu serverda `gtid_mode = ON` (GTID — global tranzaksiya identifikatorlari, replikatsiya uchun, 67-bob). `mysqldump` standart holatda dump'ga `SET @@GLOBAL.GTID_PURGED` qo'shadi va bu haqda ogohlantirdi.
- O'sha serverga tiklashda bu GTID'lar allaqachon bajarilgan — `ERROR 3546`, jadvallar yaratilmadi (`1146`).

Ogohlantirishdagi tavsiya bilan — `--set-gtid-purged=OFF`:

```text
$ mysqldump --single-transaction --routines --triggers --set-gtid-purged=OFF dokon > dokon.sql
$ mysql -e "DROP DATABASE dokon_tiklangan; CREATE DATABASE dokon_tiklangan"; mysql dokon_tiklangan < dokon.sql
$ mysql dokon_tiklangan -e "SELECT …"
+----------+-------------+
| mijozlar | buyurtmalar |
+----------+-------------+
|    50000 |      200000 |
+----------+-------------+
```

`--single-transaction` — tranzaksiya snapshot'i: dump davomida ilova yozishda davom etsa ham, dump bitta izchil paytni aks ettiradi.

### SQLite

90 000 qator o'chirilgan baza (fayl hali katta, 65-bob), ikki usulda zaxira:

```sql
.backup zaxira1.db
VACUUM INTO 'zaxira2.db';
.shell stat -f '%z %N' dokon.db zaxira1.db zaxira2.db
-- zaxira2.db da:
PRAGMA integrity_check;
SELECT count(*) FROM tolovlar;
```

```text
995328 dokon.db
995328 zaxira1.db
98304 zaxira2.db
ok
10000
```

- `.backup` (Online Backup API) — sahifama-sahifa nusxa, **asl hajmda** (bo'sh sahifalar bilan).
- `VACUUM INTO` — **98 KB** (10 marta kichik): bo'sh sahifalar va o'chirilgan ma'lumot izlari yo'q.
- `integrity_check = ok`, 10 000 qator.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Mantiqiy zaxira | `pg_dump` (`-Fc`, `-Fd`), `pg_dumpall` | `mysqldump`, MySQL Shell dump utilitlari | `.dump` |
| Izchil zaxira ishlab turgan bazada | `pg_dump` (hujjat: bloklamasdan izchil) | `--single-transaction` (InnoDB) | Online Backup API, `VACUUM INTO` |
| Parallel | `pg_dump -j` (`-Fd`), `pg_restore -j` | MySQL Shell utilitlari | — |
| Paytga qaytarish | WAL arxivi + `pg_basebackup` + `recovery_target_time` | Binary log (9.5) | — |
| Klaster darajasidagi obyektlar | `pg_dumpall` (rollar, tablespace) | `--all-databases` | — |

`—` — bu bobda sinalmagan yoki tegishli emas. MySQL binary log bilan paytga qaytarish bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Zaxiradan hech qachon tiklab ko'rmaslik | Zaxira ishlamasligi falokat paytida bilinadi | Muntazam tiklash mashqi (bu bobdagidek) |
| Faqat `pg_dump` | Oxirgi dump'dan keyingi hamma narsa yo'qoladi | PITR (WAL arxivi) |
| `pg_dump` bilan rollarni ham saqlandi deb o'ylash | Hujjat: rollar va tablespace'lar dump'ga kirmaydi | `pg_dumpall --globals-only` qo'shimcha |
| Arxivlashni muammo bo'lgandan keyin yoqish | PITR faqat arxivlash yoqilgan paytdan | Oldindan: `archive_mode`, `archive_command` |
| Ishlab turgan SQLite faylini `cp` bilan nusxalash | Hujjat: uzilishda zaxira buzilishi mumkin | `.backup` yoki `VACUUM INTO` |
| `mysqldump` ni `--single-transaction` siz | Jadvallar turli paytlardagi holatda bo'lishi mumkin | `--single-transaction` (InnoDB) |
| GTID'li serverda dump'ni boshqa bazaga tiklash | `ERROR 3546` (sinovda) | `--set-gtid-purged=OFF` |
| Zaxirani o'sha diskda saqlash | Disk bilan birga yo'qoladi | Boshqa server / ob'ekt saqlash |

## Amaliyot

1. `pg_restore -l dokon.dump > ro'yxat.txt`, undan `b_mijoz` indeksini o'chirib, `pg_restore -L ro'yxat.txt` bilan tiklang. Indeks yaratildimi?
2. `pg_dump -Fd -j 2 -f dokon_dir dokon` — papka tuzilishini ko'ring.
3. PITR misolida `recovery_target_time` ni `DELETE` dan **keyingi** vaqtga qo'ying. Nima tiklandi?
4. `pg_dumpall --globals-only` chiqishida 60-bobdagi rollar ko'rinadimi?
5. SQLite'da `sqlite3 dokon.db .dump > dokon.sql` va qayta tiklash — `VACUUM INTO` bilan solishtiring.

## Rasmiy hujjat

- PostgreSQL — 25. Backup and Restore: <https://www.postgresql.org/docs/18/backup.html>
- PostgreSQL — 25.1. SQL Dump: <https://www.postgresql.org/docs/18/backup-dump.html> · pg_dump: <https://www.postgresql.org/docs/18/app-pgdump.html>
- PostgreSQL — 25.3. Continuous Archiving and Point-in-Time Recovery (PITR): <https://www.postgresql.org/docs/18/continuous-archiving.html>
- PostgreSQL — 19.5.6 Recovery Target (`recovery_target_action`): <https://www.postgresql.org/docs/18/runtime-config-wal.html#RUNTIME-CONFIG-WAL-RECOVERY-TARGET>
- MySQL — 9.2 Database Backup Methods: <https://dev.mysql.com/doc/refman/9.7/en/backup-methods.html>
- MySQL — 6.5.4 mysqldump: <https://dev.mysql.com/doc/refman/9.7/en/mysqldump.html>
- MySQL — 9.5 Point-in-Time (Incremental) Recovery: <https://dev.mysql.com/doc/refman/9.7/en/point-in-time-recovery.html>
- SQLite — SQLite Backup API: <https://www.sqlite.org/backup.html>
- SQLite — VACUUM (`VACUUM INTO`): <https://www.sqlite.org/lang_vacuum.html>
