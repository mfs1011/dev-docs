# 16 — Jadvalni o'zgartirish

[← Oldingi: Generated ustunlar](15-generated-ustunlar.md) · [Mundarija](README.md) · [Keyingi: View va materialized view →](17-view-va-materialized-view.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/16-1-tushuncha.jpg" src="/video/sql/16-1-tushuncha.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/16-1-tushuncha.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/16-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: Jadvalni o'zgartirish — ALTER TABLE amallari, tezkor DEFAULT, CASCADE xavflari va TRUNCATE xususiyatlari</figcaption>
</figure>

Jadval yaratilgandan keyin talablar o'zgaradi: yangi ustun kerak bo'ladi, tip noto'g'ri tanlangan bo'ladi, cheklov qo'shish kerak bo'ladi. PostgreSQL hujjati aytganidek, jadvalni o'chirib, qayta yaratish mumkin. Lekin jadvalda ma'lumot bo'lsa yoki unga boshqa obyektlar (masalan, tashqi kalit) murojaat qilsa, bu qulay emas.

Shuning uchun **`ALTER TABLE`** bor. U ma'lumotni emas, jadvalning **tuzilmasini** o'zgartiradi:

| Amal | Buyruq |
| --- | --- |
| Ustun qo'shish | `ALTER TABLE t ADD COLUMN c tip …` |
| Ustunni o'chirish | `ALTER TABLE t DROP COLUMN c` |
| Cheklov qo'shish | `ALTER TABLE t ADD CONSTRAINT nom CHECK (…)`; `ALTER COLUMN c SET NOT NULL` |
| Cheklovni o'chirish | `ALTER TABLE t DROP CONSTRAINT nom`; `ALTER COLUMN c DROP NOT NULL` |
| Sukut bo'yicha qiymat | `ALTER COLUMN c SET DEFAULT …` / `DROP DEFAULT` |
| Tipni o'zgartirish | `ALTER COLUMN c TYPE yangi_tip [USING ifoda]` |
| Nomlarni o'zgartirish | `RENAME COLUMN a TO b`; `RENAME TO yangi_nom` |

### Ustun qo'shish

Yangi ustun sukut bo'yicha qiymati bilan to'ldiriladi. `DEFAULT` bo'lmasa — `NULL`. Hujjatdagi muhim maslahat:

> **O'zgarmas** sukut bo'yicha qiymatli ustun qo'shish jadvalning har qatorini yangilashni talab qilmaydi. Qiymat qatorga keyingi murojaatda qaytariladi. Shuning uchun katta jadvallarda ham `ALTER TABLE` juda tez.
>
> Sukut bo'yicha qiymat **o'zgaruvchan** bo'lsa (masalan, `clock_timestamp()`), har qator yangilanishi kerak.

Qo'shilayotgan ustunga darhol cheklov ham berish mumkin. Lekin sukut bo'yicha qiymat shu cheklovni qanoatlantirishi shart.

### Ustunni o'chirish

Ustundagi ma'lumot va unga tegishli jadval cheklovlari o'chadi. Lekin ustunga **boshqa jadvalning tashqi kaliti** murojaat qilsa, PostgreSQL bu cheklovni jimgina o'chirmaydi. Buning uchun `CASCADE` yozish kerak.

### Cheklov qo'shish

Cheklov **darhol** tekshiriladi, ya'ni jadvaldagi mavjud ma'lumot uni qanoatlantirishi kerak. Nom berilmagan cheklovni o'chirish uchun uning tizim bergan nomini bilish kerak. Uni `\d jadval` ko'rsatadi.

### Tipni o'zgartirish

`ALTER COLUMN … TYPE` mavjud har qiymat yangi tipga **yashirin** o'girilsa ishlaydi. Murakkabroq o'girish kerak bo'lsa, `USING` bandi bilan yangi qiymat qanday hisoblanishi yoziladi.

Hujjat ogohlantiradi: PostgreSQL ustunning sukut bo'yicha qiymati va cheklovlarini ham yangi tipga o'girishga harakat qiladi, lekin bu "kutilmagan natija berishi mumkin". Ko'pincha avval cheklovlarni o'chirib, tipni o'zgartirib, keyin cheklovlarni qayta qo'shgan yaxshi.

### Bog'liqliklar va `CASCADE`

Tashqi kalitlar, view'lar, triggerlar va funksiyalar obyektlar orasida **bog'liqlik to'ri**ni hosil qiladi. PostgreSQL boshqa obyekt bog'liq bo'lgan obyektni o'chirishga yo'l qo'ymaydi. `CASCADE` bog'liq obyektlarni ham **rekursiv** o'chiradi.

Hujjatdagi maslahat: `CASCADE` nima qilishini bilmoqchi bo'lsangiz, avval `DROP` ni usiz bajaring va `DETAIL` xabarini o'qing.

Tashqi kalit bo'lsa, `DROP TABLE … CASCADE` **bola jadvalni** o'chirmaydi, faqat tashqi kalit cheklovini o'chiradi. Undan keyin hech narsa bog'liq bo'lmagani uchun to'xtaydi.

Standartga ko'ra `DROP` buyrug'ida `RESTRICT` yoki `CASCADE` ni yozish **majburiy**. Hujjatga ko'ra hech bir tizim buni talab qilmaydi va sukut bo'yicha xatti-harakat tizimdan tizimga farq qiladi.

### `TRUNCATE`

`TRUNCATE` jadvaldagi barcha qatorlarni tez o'chiradi. Hujjatga ko'ra uning ta'siri shartsiz `DELETE` bilan bir xil, lekin:

- jadvalni qator-qator ko'rib chiqmaydi, shuning uchun tezroq;
- disk joyini **darhol** bo'shatadi, keyingi `VACUUM` ni kutmaydi;
- `ACCESS EXCLUSIVE` qulfini oladi. U jadval bilan boshqa barcha parallel ishni to'xtatadi. Parallel kirish kerak bo'lsa, `DELETE` ishlatiladi;
- boshqa jadvallar tashqi kalit bilan murojaat qilsa, ular ham shu buyruqda tozalanishi kerak, yoki `CASCADE` yoziladi. Hujjat: "juda ehtiyot bo'ling, aks holda kerak bo'lmagan ma'lumotni yo'qotishingiz mumkin";
- `ON DELETE` triggerlari ishlamaydi, faqat `ON TRUNCATE` triggerlari ishlaydi;
- `RESTART IDENTITY` bilan identity sequence'lar ham boshidan boshlanadi;
- **tranzaksiya nuqtai nazaridan xavfsiz**: tranzaksiya commit qilinmasa, tozalash orqaga qaytariladi;
- lekin MVCC nuqtai nazaridan **xavfsiz emas**: `TRUNCATE` dan oldin olingan "suratdan" foydalanayotgan parallel tranzaksiya jadvalni bo'sh ko'radi (52-bob).

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/16-2-kod.jpg" src="/video/sql/16-2-kod.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/16-2-kod.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/16-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 da ALTER TABLE amaliyoti — ADD COLUMN, tip o'zgartirishda USING, DROP CASCADE va TRUNCATE ROLLBACK</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Ustun qo'shish

```sql
CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text, narx text);
CREATE TABLE qatorlar (id int PRIMARY KEY, mahsulot_id int REFERENCES mahsulotlar);
INSERT INTO mahsulotlar VALUES (1, 'Non', '4000'), (2, 'Sut', '12000');
INSERT INTO qatorlar VALUES (10, 1);

ALTER TABLE mahsulotlar ADD COLUMN tavsif text CHECK (tavsif <> '');
ALTER TABLE mahsulotlar ADD COLUMN soni integer NOT NULL DEFAULT 0;
SELECT * FROM mahsulotlar ORDER BY id;
```

```text
 id | nom | narx  | tavsif | soni 
----+-----+-------+--------+------
  1 | Non | 4000  |        |    0
  2 | Sut | 12000 |        |    0
(2 rows)
```

`NOT NULL` ustun mavjud qatorlarga ham sukut bo'yicha qiymat bilan qo'shildi.

### Tipni o'zgartirish va `USING`

`narx` xato bilan `text` qilib yaratilgan edi. Uni songa o'tkazamiz:

```sql
ALTER TABLE mahsulotlar ALTER COLUMN narx TYPE numeric(12,2);
```

```text
ERROR:  column "narx" cannot be cast automatically to type numeric
HINT:  You might need to specify "USING narx::numeric(12,2)".
```

`text` dan `numeric` ga yashirin o'girish yo'q (10-bob). Qanday o'girishni `USING` da aytamiz:

```sql
ALTER TABLE mahsulotlar ALTER COLUMN narx TYPE numeric(12,2) USING narx::numeric;
ALTER TABLE mahsulotlar ALTER COLUMN nom SET NOT NULL;
ALTER TABLE mahsulotlar ADD CONSTRAINT musbat_narx CHECK (narx > 0);
ALTER TABLE mahsulotlar ALTER COLUMN soni SET DEFAULT 1;
ALTER TABLE mahsulotlar RENAME COLUMN nom TO nomi;
\d mahsulotlar
```

```text
               Table "public.mahsulotlar"
 Column |     Type      | Collation | Nullable | Default 
--------+---------------+-----------+----------+---------
 id     | integer       |           | not null | 
 nomi   | text          |           | not null | 
 narx   | numeric(12,2) |           |          | 
 tavsif | text          |           |          | 
 soni   | integer       |           | not null | 1
Indexes:
    "mahsulotlar_pkey" PRIMARY KEY, btree (id)
Check constraints:
    "mahsulotlar_tavsif_check" CHECK (tavsif <> ''::text)
    "musbat_narx" CHECK (narx > 0::numeric)
Referenced by:
    TABLE "qatorlar" CONSTRAINT "qatorlar_mahsulot_id_fkey" FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
```

`SET DEFAULT 1` mavjud qatorlarni o'zgartirmaydi. U faqat keyingi `INSERT` larga ta'sir qiladi.

### Bog'liqlik va `CASCADE`

```sql
DROP TABLE mahsulotlar;
```

```text
ERROR:  cannot drop table mahsulotlar because other objects depend on it
DETAIL:  constraint qatorlar_mahsulot_id_fkey on table qatorlar depends on table mahsulotlar
HINT:  Use DROP ... CASCADE to drop the dependent objects too.
```

`CASCADE` nima qilishini tranzaksiya ichida ko'rib, keyin orqaga qaytaramiz:

```sql
BEGIN;
DROP TABLE mahsulotlar CASCADE;
\d qatorlar
ROLLBACK;
SELECT count(*) AS mahsulotlar_qaytdi FROM mahsulotlar;
```

```text
NOTICE:  drop cascades to constraint qatorlar_mahsulot_id_fkey on table qatorlar
DROP TABLE
                Table "public.qatorlar"
   Column    |  Type   | Collation | Nullable | Default 
-------------+---------+-----------+----------+---------
 id          | integer |           | not null | 
 mahsulot_id | integer |           |          | 
Indexes:
    "qatorlar_pkey" PRIMARY KEY, btree (id)

ROLLBACK
 mahsulotlar_qaytdi 
--------------------
                  2
(1 row)
```

- `qatorlar` jadvali qoldi, faqat uning tashqi kaliti o'chdi.
- `ROLLBACK` dan keyin `mahsulotlar` jadvali ma'lumoti bilan birga qaytdi.

### `TRUNCATE`

```sql
TRUNCATE mahsulotlar;
```

```text
ERROR:  cannot truncate a table referenced in a foreign key constraint
DETAIL:  Table "qatorlar" references "mahsulotlar".
HINT:  Truncate table "qatorlar" at the same time, or use TRUNCATE ... CASCADE.
```

Tranzaksiya ichidagi `TRUNCATE` ham orqaga qaytariladi:

```sql
BEGIN;
TRUNCATE qatorlar;
ROLLBACK;
SELECT count(*) AS qatorlar_qaytdi FROM qatorlar;
```

```text
 qatorlar_qaytdi 
-----------------
               1
(1 row)
```

`ALTER TABLE` ham shunday:

```sql
BEGIN;
ALTER TABLE qatorlar ADD COLUMN izoh text;
ROLLBACK;
SELECT column_name FROM information_schema.columns WHERE table_name = 'qatorlar';
```

```text
 column_name 
-------------
 id
 mahsulot_id
(2 rows)
```

Bu buyruqlar PostgreSQL'da tranzaksiya ichida bajarildi va orqaga qaytarildi. Lekin hamma DDL buyrug'i ham shunday emas. Masalan, `CREATE DATABASE` va `CREATE INDEX CONCURRENTLY` ni tranzaksiya ichida bajarib bo'lmaydi (5-bob, 63-bob).

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/16-3-dialektlar.jpg" src="/video/sql/16-3-dialektlar.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/16-3-dialektlar.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/16-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: Dialektlar — MySQL da INSTANT DDL va yashirin commit, SQLite da cheklangan ALTER va 12 qadamli jadval qayta qurish</figcaption>
</figure>

### MySQL

**Sintaksis.** Asosiy amallar o'xshash. MySQL'da ustun tipi va atributlari `MODIFY COLUMN` bilan bir yo'la o'zgartiriladi. `USING` yo'q: qiymatlar MySQL'ning konversiya qoidalari bilan o'giriladi (10-bob).

```sql
ALTER TABLE mahsulotlar ADD COLUMN soni INT NOT NULL DEFAULT 0, ALGORITHM = INSTANT;
ALTER TABLE mahsulotlar MODIFY COLUMN narx DECIMAL(12,2);
ALTER TABLE mahsulotlar RENAME COLUMN nom TO nomi;
SELECT * FROM mahsulotlar;
```

```text
+----+------+----------+------+
| id | nomi | narx     | soni |
+----+------+----------+------+
|  1 | Non  |  4000.00 |    0 |
|  2 | Sut  | 12000.00 |    0 |
+----+------+----------+------+
```

`'4000'` matni `DECIMAL` ga o'zi aylandi, PostgreSQL'dagidek `USING` kerak bo'lmadi. `ALGORITHM = INSTANT` — MySQL'ning online DDL imkoniyati. U ustunni jadvalni qayta yozmasdan qo'shadi (63-bob).

**DDL tranzaksiyani yakunlaydi.** Bu PostgreSQL'dan eng muhim farq. MySQL hujjatiga ko'ra ro'yxatdagi buyruqlar faol tranzaksiyani **yashirin yakunlaydi**, xuddi oldidan `COMMIT` qilingandek. Ro'yxatda `ALTER TABLE`, `CREATE TABLE`, `DROP TABLE`, `TRUNCATE TABLE`, `CREATE INDEX` va boshqalar bor. Natijada:

```sql
START TRANSACTION;
INSERT INTO mahsulotlar (id, nomi, narx) VALUES (3, 'Choy', 9000);
ALTER TABLE mahsulotlar ADD COLUMN izoh VARCHAR(100);
ROLLBACK;
SELECT id, nomi FROM mahsulotlar ORDER BY id;
```

```text
+----+------+
| id | nomi |
+----+------+
|  1 | Non  |
|  2 | Sut  |
|  3 | Choy |
+----+------+
```

`ROLLBACK` hech narsani qaytarmadi. `ALTER TABLE` oldingi `INSERT` ni commit qilib yubordi, `izoh` ustuni ham qoldi.

**Atomic DDL.** MySQL'da DDL buyruqlari **atomar**: bitta buyruq yo to'liq bajariladi, yo umuman bajarilmaydi, server o'rtada to'xtab qolsa ham. Lekin hujjat aniq yozadi: "Atomic DDL — **tranzaksion DDL emas**". DDL baribir joriy tranzaksiyani yakunlaydi va uni boshqa buyruqlar bilan bitta tranzaksiyada birlashtirib bo'lmaydi.

**`TRUNCATE` — DDL.** Hujjatga ko'ra MySQL'da `TRUNCATE TABLE` DML emas, DDL hisoblanadi:

- jadvalni o'chirib, qayta yaratadi;
- yashirin commit qiladi, shuning uchun **orqaga qaytarib bo'lmaydi**;
- `ON DELETE` triggerlarini ishga tushirmaydi;
- boshqa jadvallar tashqi kalit bilan murojaat qilsa, ishlamaydi;
- o'chirilgan qatorlar sonini qaytarmaydi. "0 rows affected" — "ma'lumot yo'q" degani.

```text
ERROR 1701 (42000) at line 14: Cannot truncate a table referenced in a foreign key constraint (`qollanma`.`qatorlar`, CONSTRAINT `qatorlar_ibfk_1`)
```

**`DROP TABLE … CASCADE` hech narsa qilmaydi.** Hujjatga ko'ra MySQL'da `RESTRICT` va `CASCADE` kalit so'zlari "hech narsa qilmaydi" va faqat boshqa tizimlardan ko'chirishni osonlashtirish uchun qabul qilinadi:

```sql
DROP TABLE mahsulotlar CASCADE;
```

```text
ERROR 3730 (HY000) at line 16: Cannot drop table 'mahsulotlar' referenced by a foreign key constraint 'qatorlar_ibfk_1' on table 'qatorlar'.
```

### SQLite

**Cheklangan `ALTER TABLE`.** SQLite hujjatiga ko'ra `ALTER TABLE` faqat ba'zi amallarni qo'llaydi:

- jadval va ustun nomini o'zgartirish;
- ustun qo'shish va o'chirish;
- `ALTER COLUMN … SET/DROP NOT NULL` (3.53.0 dan);
- `ADD CONSTRAINT … CHECK`. Bu 3.54 hujjatining sintaksis diagrammasida bor va sinovda ishladi.

Hujjat buning sababini ham tushuntiradi: SQLite sxemani `sqlite_schema` jadvalida **oddiy matn** sifatida saqlaydi. `ALTER TABLE` shu matnni o'zgartirib, butun sxemani qayta tahlil qiladi.

**`ADD COLUMN` cheklovlari** (hujjat bo'yicha):

- `PRIMARY KEY` yoki `UNIQUE` bo'lmaydi;
- `CURRENT_TIMESTAMP` kabi yoki qavsdagi ifoda ko'rinishidagi sukut bo'yicha qiymat bo'lmaydi;
- `NOT NULL` bo'lsa, `NULL` dan boshqa sukut bo'yicha qiymat kerak;
- `STORED` generated ustun bo'lmaydi (15-bob).

**`DROP COLUMN`** ustun `PRIMARY KEY` yoki `UNIQUE` bo'lsa, indeksda, tashqi kalitda, generated ustunda, trigger yoki view'da ishlatilsa muvaffaqiyatsiz bo'ladi.

```text
SQLite-3.54 memory-> CREATE TABLE m (id INTEGER PRIMARY KEY, nom TEXT UNIQUE, narx TEXT);
SQLite-3.54 memory-> INSERT INTO m VALUES (1, 'Non', '4000');
SQLite-3.54 memory-> ALTER TABLE m ADD COLUMN soni INTEGER NOT NULL DEFAULT 0;
SQLite-3.54 memory-> ALTER TABLE m ADD COLUMN yaratilgan TEXT DEFAULT CURRENT_TIMESTAMP;
Error near line 5: Cannot add a column with non-constant default
SQLite-3.54 memory-> ALTER TABLE m ADD COLUMN kod TEXT UNIQUE;
Parse error near line 6: Cannot add a UNIQUE column
SQLite-3.54 memory-> ALTER TABLE m RENAME COLUMN nom TO nomi;
SQLite-3.54 memory-> ALTER TABLE m DROP COLUMN nomi;
Parse error near line 8: cannot drop UNIQUE column: "nomi"
SQLite-3.54 memory-> ALTER TABLE m DROP COLUMN narx;
SQLite-3.54 memory-> ALTER TABLE m ALTER COLUMN soni DROP NOT NULL;
SQLite-3.54 memory-> ALTER TABLE m ADD CONSTRAINT musbat CHECK (soni >= 0);
SQLite-3.54 memory-> SELECT sql FROM sqlite_schema WHERE name = 'm';
CREATE TABLE m (id INTEGER PRIMARY KEY, nomi TEXT UNIQUE, soni INTEGER DEFAULT 0, CONSTRAINT musbat CHECK (soni >= 0))
```

Oxirgi qatorda `ALTER TABLE` ning ishi ko'rinib turibdi: SQLite `CREATE TABLE` matnini o'zgartirdi.

**Boshqa o'zgarishlar: 12 qadamli usul.** Ustun tipini o'zgartirish yoki tashqi kalit qo'shish kabi to'g'ridan-to'g'ri qo'llanmaydigan o'zgarishlar uchun hujjat aniq ketma-ketlikni beradi:

1. Tashqi kalitlar yoqilgan bo'lsa, `PRAGMA foreign_keys=OFF`.
2. Tranzaksiya boshlash.
3. Jadvalga tegishli indeks, trigger va view'larni eslab qolish: `SELECT type, sql FROM sqlite_schema WHERE tbl_name='X'`.
4. Kerakli tuzilmada yangi `new_X` jadvalini yaratish.
5. Ma'lumotni ko'chirish: `INSERT INTO new_X SELECT … FROM X`.
6. Eski jadvalni o'chirish: `DROP TABLE X`.
7. Yangi jadval nomini o'zgartirish: `ALTER TABLE new_X RENAME TO X`.
8. Indeks, trigger va view'larni qayta yaratish.
9. Ta'sirlangan view'larni qayta yaratish.
10. Tashqi kalitlar oldin yoqilgan bo'lsa, `PRAGMA foreign_key_check`.
11. Tranzaksiyani commit qilish.
12. Tashqi kalitlarni qayta yoqish.

Hujjat ogohlantiradi: bu tartibga **aniq** amal qiling. Eski jadvalni avval vaqtinchalik nomga o'zgartiradigan "qisqa" usul trigger, view va tashqi kalitlardagi havolalarni buzishi mumkin.

**`TRUNCATE` yo'q.** SQLite'da bunday buyruq yo'q:

```text
SQLite-3.54 memory-> TRUNCATE TABLE m;
Parse error near line 13: near "TRUNCATE": syntax error
```

Uning o'rnini "truncate optimizatsiyasi" bosadi. Hujjatga ko'ra `WHERE` va `RETURNING` siz `DELETE`, jadvalda trigger bo'lmasa, jadvalni qator-qator ko'rib chiqmasdan bo'shatadi.

**DDL tranzaksiyada.** Sinovda SQLite'da ham `ALTER TABLE … ADD COLUMN` tranzaksiya ichida bajarilib, `ROLLBACK` bilan qaytdi. Ro'yxatda `izoh` ustuni yo'q:

```text
SQLite-3.54 memory-> BEGIN;
SQLite-3.54 memory-> ALTER TABLE m ADD COLUMN izoh TEXT;
SQLite-3.54 memory-> ROLLBACK;
SQLite-3.54 memory-> SELECT name FROM pragma_table_info('m');
id
nomi
soni
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Tipni o'zgartirish | `ALTER COLUMN … TYPE … [USING]` | `MODIFY COLUMN` | Yo'q — 12 qadamli usul |
| Cheklov qo'shish | Har xil | Har xil | `NOT NULL` (3.53+), `CHECK` (3.54) |
| `UNIQUE` ustun qo'shish | Mumkin | Mumkin | Mumkin emas |
| Tranzaksiya ichida `ALTER TABLE` | `ROLLBACK` bilan qaytdi | Yashirin `COMMIT` | `ROLLBACK` bilan qaytdi |
| `TRUNCATE` | Bor, `ROLLBACK` bilan qaytadi | Bor, DDL: qaytarib bo'lmaydi | Yo'q (`DELETE` optimizatsiyasi) |
| `DROP … CASCADE` | Bog'liq obyektlarni o'chiradi | Hech narsa qilmaydi | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Katta jadvalga o'zgaruvchan `DEFAULT` (`clock_timestamp()`) bilan ustun qo'shish | Har qator qayta yoziladi, uzoq davom etadi | Hujjat maslahati: `DEFAULT` siz qo'shish, `UPDATE` bilan to'ldirish, keyin `DEFAULT` qo'shish |
| `DROP … CASCADE` ni nima o'chishini bilmasdan ishlatish | Kutilmagan obyektlar (view'lar) o'chishi mumkin | Avval `CASCADE` siz bajarib, `DETAIL` ni o'qish |
| `TRUNCATE … CASCADE` | Bog'liq jadvallar ham tozalanadi | Faqat jadvallar ro'yxatini aniq bilganda |
| Ishlab turgan jadvalda `TRUNCATE` | `ACCESS EXCLUSIVE` qulf hamma ishni to'xtatadi | Parallel kirish kerak bo'lsa — `DELETE` |
| MySQL'da DDL va DML ni bitta tranzaksiyaga joylab, `ROLLBACK` ga ishonish | DDL oldingi o'zgarishlarni commit qilib yuboradi | DDL ni alohida bajarish; migratsiyalarni shunga moslash |
| MySQL'da `TRUNCATE` ni `DELETE` kabi qaytarib bo'ladi deb o'ylash | DDL, yashirin commit | Qaytarish kerak bo'lsa — `DELETE` |
| MySQL'da `DROP TABLE … CASCADE` bog'liqlarni o'chiradi deb kutish | Kalit so'z e'tiborsiz | Bog'liqlarni o'zi o'chirish |
| SQLite'da jadvalni "qisqa usul" bilan qayta qurish (avval nomini o'zgartirish) | Trigger, view, tashqi kalit havolalari buzilishi mumkin | Hujjatdagi 12 qadamli usul |
| Tipni o'zgartirishda cheklovlarni hisobga olmaslik (PostgreSQL) | Ular ham o'giriladi va kutilmagan natija berishi mumkin | Cheklovlarni o'chirib, tipni o'zgartirib, qayta qo'shish |

## Amaliyot

1. `talabalar` jadvaliga `email text` ustunini qo'shing. Keyin unga `UNIQUE` cheklov qo'shing va nomini `\d` dan topib o'chiring.
2. `kurs` ustunini `integer` dan `smallint` ga o'zgartiring. Keyin `text` ga o'zgartirib ko'ring. `USING` qachon kerak bo'ldi?
3. Ikki jadval va ularni bog'lagan view yarating (17-bob). Asosiy jadvalni `DROP` qilib, `DETAIL` xabarini o'qing. Keyin `BEGIN … DROP … CASCADE … ROLLBACK` bilan nima o'chishini ko'ring.
4. MySQL'da `START TRANSACTION; INSERT …; CREATE INDEX …; ROLLBACK;` ni bajaring va `INSERT` ning taqdirini tekshiring.
5. SQLite'da `narx TEXT` ustunini `NUMERIC` ga 12 qadamli usul bilan o'zgartiring.
6. PostgreSQL'da `TRUNCATE … RESTART IDENTITY` dan keyin identity ustunning keyingi qiymati nechchi bo'lishini tekshiring.

## Rasmiy hujjat

- PostgreSQL — 5.7. Modifying Tables: <https://www.postgresql.org/docs/18/ddl-alter.html>
- PostgreSQL — 5.15. Dependency Tracking: <https://www.postgresql.org/docs/18/ddl-depend.html>
- PostgreSQL — ALTER TABLE: <https://www.postgresql.org/docs/18/sql-altertable.html>
- PostgreSQL — DROP TABLE: <https://www.postgresql.org/docs/18/sql-droptable.html>
- PostgreSQL — TRUNCATE: <https://www.postgresql.org/docs/18/sql-truncate.html>
- MySQL — 15.1.11 ALTER TABLE Statement: <https://dev.mysql.com/doc/refman/9.7/en/alter-table.html>
- MySQL — 15.1.1 Atomic Data Definition Statement Support: <https://dev.mysql.com/doc/refman/9.7/en/atomic-ddl.html>
- MySQL — 15.3.3 Statements That Cause an Implicit Commit: <https://dev.mysql.com/doc/refman/9.7/en/implicit-commit.html>
- MySQL — 15.1.39 DROP TABLE Statement: <https://dev.mysql.com/doc/refman/9.7/en/drop-table.html>
- MySQL — 15.1.44 TRUNCATE TABLE Statement: <https://dev.mysql.com/doc/refman/9.7/en/truncate-table.html>
- SQLite — ALTER TABLE: <https://www.sqlite.org/lang_altertable.html>
- SQLite — DELETE (The Truncate Optimization): <https://www.sqlite.org/lang_delete.html>
