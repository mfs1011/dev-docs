# 21 — Ommaviy yuklash

[← Oldingi: UPSERT va MERGE](20-upsert-va-merge.md) · [Mundarija](README.md) · [Keyingi: SELECT anatomiyasi →](22-select-anatomiyasi.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/21-1-tushuncha.jpg">
    <source src="/video/sql/21-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/21-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/21-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>21.1-video. Ommaviy yuklash tushunchasi va strategiyalari</figcaption>
</figure>

Bazaga minglab yoki millionlab qator kiritish kerak bo'lgan holatlar ko'p:

- eski tizimdan ma'lumot ko'chirish;
- kunlik CSV hisobotni yuklash;
- sinov uchun katta ma'lumot to'plamini tayyorlash.

Har qatorga alohida `INSERT` yuborish bu yerda juda sekin. MySQL hujjati bitta qatorni qo'shish vaqtining tarkibini taqribiy nisbatlarda beradi:

| Qadam | Taqribiy ulush |
| --- | --- |
| Ulanish | 3 |
| So'rovni serverga yuborish | 2 |
| So'rovni tahlil qilish | 2 |
| Qatorni qo'shish | 1 × qator hajmi |
| Indekslarni yangilash | 1 × indekslar soni |
| Ulanishni yopish | 1 |

Xulosa: qatorning **o'zini** yozish ishning kichik qismi. Qolgani har buyruq uchun takrorlanadigan qo'shimcha xarajat. Shuning uchun hujjat kichik amallarni **bitta katta amalga birlashtirishni** maslahat beradi.

### PostgreSQL: bazani tez to'ldirish

PostgreSQL hujjatining "Populating a Database" bo'limidagi tavsiyalar:

1. **Autocommit'ni o'chiring.** Ko'p `INSERT` bo'lsa, ularni `BEGIN … COMMIT` ichiga oling. Har qator alohida commit qilinsa, PostgreSQL har biri uchun ko'p ish bajaradi. Bunda yana bir foyda bor: xato bo'lsa, hammasi orqaga qaytadi va ma'lumot yarim yuklanib qolmaydi.
2. **`COPY` ishlating.** U ko'p qatorni yuklash uchun optimallashtirilgan. Hujjatga ko'ra `COPY` bilan yuklash `PREPARE` va bitta tranzaksiya ishlatilgan `INSERT` dan ham "deyarli har doim tezroq".
3. **Indekslarni keyin yarating.** Yangi jadvalda eng tez yo'l: jadval yaratish → `COPY` → indekslar. Mavjud ma'lumotga indeks qurish uni har qatorda yangilashdan tezroq. Lekin hujjat ogohlantiradi: takrorlanmas indeksni o'chirish bilan uning tekshiruvi ham yo'qoladi.
4. **Tashqi kalitlarni vaqtincha olib tashlang.** Cheklov ham bir yo'la tekshirilganda samaraliroq. Bundan tashqari, tashqi kalitli jadvalga millionlab qator yuklanganda tekshiruvlar navbati xotiraga sig'may qolishi mumkin.
5. **`maintenance_work_mem` va `max_wal_size` ni vaqtincha oshiring.**
6. **Keyin `ANALYZE` bajaring.** Rejalashtiruvchi yangi ma'lumot haqida statistikaga ega bo'lishi kerak (46-bob).

### `COPY`

`COPY` jadval va fayl o'rtasida ma'lumot ko'chiradi:

- `COPY jadval FROM 'fayl'` — fayldan jadvalga, mavjud qatorlarga qo'shib;
- `COPY jadval TO 'fayl'` yoki `COPY (SELECT …) TO …` — jadvaldan yoki so'rov natijasidan faylga.

Format `text`, `csv` yoki `binary` bo'ladi. `COPY` standartda yo'q.

**Fayl qayerda?** Bu eng muhim nuqta. `COPY 'fayl'` faylni **server** o'qiydi yoki yozadi. Fayl server kompyuterida bo'lishi va server foydalanuvchisi uni o'qiy olishi kerak. Ruxsat ham faqat superuser'larga yoki `pg_read_server_files`, `pg_write_server_files`, `pg_execute_server_program` rollaridan biri berilganlarga bor. Sababi: bu buyruq server huquqi bilan istalgan faylni o'qish yoki yozish imkonini beradi.

Mijozdagi fayl uchun `psql` ning **`\copy`** buyrug'i bor. U `COPY FROM STDIN` / `TO STDOUT` ni chaqiradi, faylni esa **mijoz** o'qiydi. Ruxsat ham mijoz tomonga bog'liq bo'ladi. Bu 2-bobdagi "fayl qaysi kompyuterda" savolining amaldagi ko'rinishi.

**Xatolar.** Sukut bo'yicha `COPY` birinchi xatoda **to'xtaydi** va hech narsa yuklamaydi. Boshqa variantlar:

- `ON_ERROR ignore` (PostgreSQL 17) — tipga o'girib bo'lmagan qatorni tashlab, davom etadi. Faqat `text` va `csv` formatlarida;
- `LOG_VERBOSITY verbose` — har tashlangan qator haqida xabar beradi;
- `REJECT_LIMIT n` (PostgreSQL 18) — `ignore` bilan birga: xatolar `n` tadan oshsa, baribir to'xtaydi.

**`FREEZE`** — boshlang'ich yuklash uchun tezlik parametri. Qatorlar `VACUUM FREEZE` dan keyingidek "muzlatilgan" holda yoziladi (65-bob). Jadval shu tranzaksiyada yaratilgan yoki tozalangan bo'lishi kerak.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/21-2-kod.jpg">
    <source src="/video/sql/21-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/21-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/21-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>21.2-video. PostgreSQL 18: COPY, ON_ERROR va REJECT_LIMIT amaliyoti</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

Sinov fayli `mahsulotlar.csv` da ikkita xato narx bor:

```text
sku,nom,narx
NON,Non,4000
SUT,Sut,12000
CHOY,Choy,abc
TUZ,Tuz,2000
SHAKAR,Shakar,narx_yoq
```

### Birinchi xatoda to'xtaydi

```sql
CREATE TABLE mahsulotlar (sku text PRIMARY KEY, nom text NOT NULL, narx numeric);
COPY mahsulotlar FROM '/…/csv/mahsulotlar.csv' WITH (FORMAT csv, HEADER true);
```

```text
ERROR:  invalid input syntax for type numeric: "abc"
CONTEXT:  COPY mahsulotlar, line 4, column narx: "abc"
```

Xato qayerda ekani aniq ko'rsatildi: 4-qator, `narx` ustuni. Jadvalga **hech narsa** yuklanmadi, xatodan oldingi ikkita to'g'ri qator ham.

### `ON_ERROR ignore`

```sql
COPY mahsulotlar FROM '/…/csv/mahsulotlar.csv'
WITH (FORMAT csv, HEADER true, ON_ERROR ignore, LOG_VERBOSITY verbose);
SELECT * FROM mahsulotlar ORDER BY sku;
```

```text
NOTICE:  skipping row due to data type incompatibility at line 4 for column "narx": "abc"
NOTICE:  skipping row due to data type incompatibility at line 6 for column "narx": "narx_yoq"
NOTICE:  2 rows were skipped due to data type incompatibility
COPY 3
 sku | nom | narx  
-----+-----+-------
 NON | Non |  4000
 SUT | Sut | 12000
 TUZ | Tuz |  2000
(3 rows)
```

Uchta to'g'ri qator yuklandi, ikkita xatosi haqida aniq xabar berildi.

### `REJECT_LIMIT`

Ko'pi bilan **bitta** xatoga ruxsat beramiz:

```sql
TRUNCATE mahsulotlar;
COPY mahsulotlar FROM '/…/csv/mahsulotlar.csv'
WITH (FORMAT csv, HEADER true, ON_ERROR ignore, REJECT_LIMIT 1);
```

```text
ERROR:  skipped more than REJECT_LIMIT (1) rows due to data type incompatibility
CONTEXT:  COPY mahsulotlar, line 6, column narx: "narx_yoq"
```

Bu fayl sifatini nazorat qilishning qulay usuli: "bir-ikki xato bo'lsa — mayli, ko'p bo'lsa — faylni tekshirish kerak".

### Server fayli va `\copy`

Oddiy foydalanuvchi server faylini o'qiy olmaydi:

```sql
SET ROLE talaba;
COPY mahsulotlar FROM '/…/csv/mahsulotlar.csv' WITH (FORMAT csv, HEADER true);
```

```text
ERROR:  permission denied to COPY from a file
DETAIL:  Only roles with privileges of the "pg_read_server_files" role may COPY from a file.
HINT:  Anyone can COPY to stdout or from stdin. psql's \copy command also works for anyone.
```

Xabarning o'zi yechimni aytib turibdi: `\copy`. Uni `psql` bajaradi, faylni esa mijoz o'qiydi:

```text
qollanma=# \copy mahsulotlar FROM '/…/csv/mahsulotlar.csv' WITH (FORMAT csv, HEADER true, ON_ERROR ignore)
NOTICE:  2 rows were skipped due to data type incompatibility
COPY 3
```

### So'rov natijasini CSV'ga chiqarish

```sql
COPY (SELECT sku, narx FROM mahsulotlar WHERE narx > 3000 ORDER BY sku)
TO STDOUT WITH (FORMAT csv, HEADER true);
```

```text
sku,narx
NON,4000
SUT,12000
```

`STDOUT` ga chiqarilgani uchun natija mijozga keldi. Faylga yozish uchun `psql` da `\copy (…) TO 'fayl.csv' …` ishlatiladi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/21-3-dialektlar.jpg">
    <source src="/video/sql/21-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/21-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/21-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>21.3-video. MySQL va SQLite: LOAD DATA, LOCAL xatari va .import</figcaption>
</figure>

### MySQL: `LOAD DATA`

MySQL hujjatiga ko'ra `LOAD DATA` matn fayldagi qatorlarni jadvalga "juda yuqori tezlikda" yuklaydi. Uning teskarisi — `SELECT … INTO OUTFILE`. Hujjatdagi `INSERT` optimallashtirish bo'limiga ko'ra `LOAD DATA` odatda bir xil ishni bajaradigan `INSERT` lardan **taxminan 20 baravar tez**.

PostgreSQL'dagi kabi bu yerda ham fayl qayerdaligi muhim:

| Ko'rinish | Faylni kim o'qiydi | Talab |
| --- | --- | --- |
| `LOAD DATA INFILE` | Server | `FILE` huquqi; `secure_file_priv` ruxsat bergan papka |
| `LOAD DATA LOCAL INFILE` | Mijoz | `local_infile` **mijozda ham, serverda ham** yoqilgan bo'lishi kerak |

Sinov serverida ikkalasi ham sukut bo'yicha o'chiq:

```sql
SELECT @@local_infile, @@secure_file_priv;
```

```text
+----------------+--------------------+
| @@local_infile | @@secure_file_priv |
+----------------+--------------------+
|              0 | NULL               |
+----------------+--------------------+
```

Hujjatga ko'ra `secure_file_priv = NULL` server import va eksport amallarini **butunlay o'chiradi**. Bo'sh qiymat esa cheklovni olib tashlaydi, hujjat buni "xavfsiz sozlama emas" deydi.

```text
ERROR 3948 (42000) at line 1: Loading local data is disabled; this must be enabled on both the client and server sides
ERROR 1290 (HY000) at line 1: The MySQL server is running with the --secure-file-priv option so it cannot execute this statement
```

Serverda `SET GLOBAL local_infile = 1` qilib, mijozni `--local-infile=1` bilan ishga tushiramiz. Fayl: `NON,Non,4000 / SUT,Sut,12000 / CHOY,Choy,abc / NON,Takror,1`.

```sql
LOAD DATA LOCAL INFILE '/…/csv/my.csv' INTO TABLE mahsulotlar FIELDS TERMINATED BY ',';
SHOW WARNINGS;
SELECT * FROM mahsulotlar;
```

```text
+---------+------+-----------------------------------------------------------+
| Level   | Code | Message                                                   |
+---------+------+-----------------------------------------------------------+
| Warning | 1366 | Incorrect decimal value: 'abc' for column 'narx' at row 3 |
| Warning | 1062 | Duplicate entry 'NON' for key 'mahsulotlar.PRIMARY'       |
+---------+------+-----------------------------------------------------------+
+------+------+----------+
| sku  | nom  | narx     |
+------+------+----------+
| CHOY | Choy |     0.00 |
| NON  | Non  |  4000.00 |
| SUT  | Sut  | 12000.00 |
+------+------+----------+
```

Natijani hujjat tushuntiradi: `REPLACE` yozilmagan bo'lsa, `LOCAL` **`IGNORE` bilan bir xil** ta'sir qiladi. Shuning uchun:

- `'abc'` xato bermadi, `0.00` ga aylandi va ogohlantirish berildi. Ma'lumot **buzilib** yuklandi;
- takroriy `NON` qatori jimgina tashlandi.

PostgreSQL'da xuddi shu fayl yo xato bergan bo'lardi, yo `ON_ERROR ignore` bilan noto'g'ri qatorni **butunlay** tashlab yuborardi.

Boshqa usullar:

- `mysqlimport` dasturi — serverga `LOAD DATA` buyrug'ini yuboradi;
- ko'p qatorli `INSERT … VALUES (…), (…)` — hujjatga ko'ra bitta qatorli `INSERT` lardan "ko'p hollarda bir necha baravar" tez.

### SQLite: `.import`

SQLite'da `COPY` va `LOAD DATA` yo'q. `sqlite3` dasturining `.import` buyrug'i CSV yoki boshqa ajratuvchili faylni jadvalga yuklaydi. Hujjatga ko'ra birinchi qatorning taqdiri jadval bor-yo'qligiga bog'liq:

- **jadval yo'q bo'lsa** — avtomatik yaratiladi va birinchi qator ustun nomlari bo'ladi;
- **jadval bor bo'lsa** — birinchi qator ham ma'lumot hisoblanadi. Sarlavhani tashlash uchun `--skip 1` yoziladi.

```text
SQLite-3.54 memory-> CREATE TABLE mahsulotlar (sku TEXT PRIMARY KEY, nom TEXT NOT NULL, narx NUMERIC);
SQLite-3.54 memory-> .import --csv --skip 1 /…/csv/mahsulotlar.csv mahsulotlar
SQLite-3.54 memory-> SELECT sku, narx, typeof(narx) FROM mahsulotlar;
NON|4000|integer
SUT|12000|integer
CHOY|abc|text
TUZ|2000|integer
SHAKAR|narx_yoq|text
```

Xato narxlar ham yuklandi, faqat `text` sifatida (6-bobdagi affinity). Bu yerda xato ham, ogohlantirish ham yo'q. Tekshiruv kerak bo'lsa, `STRICT` jadval (10-bob) yoki `CHECK` (14-bob) kerak.

Mavjud bo'lmagan jadvalga yuklasak:

```text
SQLite-3.54 memory-> .import --csv /…/csv/mahsulotlar.csv yangi
SQLite-3.54 memory-> SELECT sql FROM sqlite_schema WHERE name = 'yangi';
CREATE TABLE "yangi"(
"sku", "nom", "narx")
```

Ustunlar sarlavhadan olindi, lekin **tipsiz**: hammasi affinity'siz bo'lib qoldi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Buyruq | `COPY … FROM/TO` | `LOAD DATA`, `SELECT … INTO OUTFILE` | `sqlite3`: `.import`, `.output` |
| Server fayli | `COPY 'fayl'` (superuser yoki `pg_read_server_files`) | `LOAD DATA INFILE` (`FILE` + `secure_file_priv`) | — (fayl = baza) |
| Mijoz fayli | `\copy` | `LOAD DATA LOCAL` (`local_infile` ikki tomonda) | `.import` |
| Noto'g'ri qiymat | Sukut bo'yicha xato; `ON_ERROR ignore` qatorni tashlaydi | `LOCAL`: qiymat "moslanadi" + ogohlantirish | Yuklanadi (`text` sifatida) |
| Xatolar chegarasi | `REJECT_LIMIT` (18+) | — | — |
| Takroriy kalit | Xato | `LOCAL`: tashlanadi + ogohlantirish | Xato |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Millionlab qatorni bittalab `INSERT` qilish, har biri alohida commit bilan | Har qatorga ulanish, tahlil va commit xarajati | `COPY` / `LOAD DATA` yoki bitta tranzaksiyada ko'p qatorli `INSERT` |
| PostgreSQL'da `COPY 'fayl'` ni mijozdagi fayl bilan ishlatish | Server faylni o'z kompyuterida qidiradi | `\copy` |
| Ilovaga `pg_read_server_files` yoki MySQL `FILE` huquqini berish | Server huquqi bilan istalgan fayl o'qiladi | Mijoz tomonda yuklash (`\copy`, `COPY FROM STDIN`) |
| MySQL'da `secure_file_priv` ni bo'sh qilib qo'yish | Hujjatga ko'ra xavfsiz sozlama emas | Aniq papka ko'rsatish |
| MySQL `LOAD DATA LOCAL` dan keyin ogohlantirishlarni o'qimaslik | Noto'g'ri qiymatlar jimgina `0` ga aylanadi, takrorlar tashlanadi | `SHOW WARNINGS`; avval vaqtinchalik jadvalga yuklab tekshirish |
| `ON_ERROR ignore` ni chegarasiz ishlatish | Butun fayl xato bo'lsa ham "muvaffaqiyatli" tugashi mumkin | `REJECT_LIMIT` |
| Katta yuklashni indekslar va tashqi kalitlar bilan to'la jadvalga qilish | Sekin, tashqi kalit navbati xotirani to'ldirishi mumkin | Hujjat tavsiyasi: avval yuklash, keyin indeks va cheklovlar |
| Yuklashdan keyin `ANALYZE` qilmaslik | Rejalashtiruvchi eski statistika bilan noto'g'ri reja tanlaydi | `ANALYZE jadval` |
| SQLite `.import` ni tekshiruvli deb o'ylash | Xato qiymatlar matn bo'lib kiradi | `STRICT` jadval yoki `CHECK` |

## Amaliyot

1. 100 000 qatorli CSV fayl yarating (masalan, `seq` va `awk` bilan). Uni PostgreSQL'ga uch usulda yuklang va vaqtni solishtiring (`\timing`): bittalab `INSERT` (autocommit bilan), bitta tranzaksiyada `INSERT` lar, `\copy`.
2. Faylga bir nechta noto'g'ri qator qo'shing. `ON_ERROR ignore`, `LOG_VERBOSITY verbose` va `REJECT_LIMIT` bilan natijalarni solishtiring.
3. `COPY (SELECT …) TO STDOUT WITH (FORMAT csv, HEADER true)` bilan hisobot chiqaring va `\copy` bilan faylga yozing.
4. MySQL'da xuddi shu faylni `LOAD DATA LOCAL` bilan yuklang. Qaysi qatorlar o'zgarib yoki tashlanib ketdi? `SHOW WARNINGS` ni o'qing.
5. SQLite'da faylni avval mavjud bo'lmagan jadvalga, keyin `STRICT` jadvalga `.import` qiling. Farqni tushuntiring.

## Rasmiy hujjat

- PostgreSQL — COPY: <https://www.postgresql.org/docs/18/sql-copy.html>
- PostgreSQL — 14.4. Populating a Database: <https://www.postgresql.org/docs/18/populate.html>
- PostgreSQL — `psql` (`\copy`): <https://www.postgresql.org/docs/18/app-psql.html>
- PostgreSQL — 21.5. Predefined Roles (`pg_read_server_files`): <https://www.postgresql.org/docs/18/predefined-roles.html>
- MySQL — 15.2.9 LOAD DATA Statement: <https://dev.mysql.com/doc/refman/9.7/en/load-data.html>
- MySQL — 10.2.5.1 Optimizing INSERT Statements: <https://dev.mysql.com/doc/refman/9.7/en/insert-optimization.html>
- MySQL — 10.5.5 Bulk Data Loading for InnoDB Tables: <https://dev.mysql.com/doc/refman/9.7/en/optimizing-innodb-bulk-data-loading.html>
- MySQL — Server System Variables (`secure_file_priv`, `local_infile`): <https://dev.mysql.com/doc/refman/9.7/en/server-system-variables.html>
- SQLite — Command Line Shell (CSV Import): <https://www.sqlite.org/cli.html>
