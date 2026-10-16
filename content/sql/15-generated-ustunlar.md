# 15 — Generated ustunlar

[← Oldingi: Cheklovlar](14-cheklovlar.md) · [Mundarija](README.md) · [Keyingi: Jadvalni o'zgartirish →](16-jadvalni-ozgartirish.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/15-1-tushuncha.jpg" src="/video/sql/15-1-tushuncha.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/15-1-tushuncha.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/15-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: Generated ustunlar — VIRTUAL vs STORED, DEFAULT bilan taqqoslash va o'zgarmaslik (immutable) qoidalari</figcaption>
</figure>

**Generated ustun** (hisoblanadigan ustun) — qiymati doim **shu qatordagi boshqa ustunlardan** hisoblanadigan ustun. Masalan, `summa = narx × soni`. Bu qiymatni ilova hisoblab yozmaydi, baza o'zi hisoblaydi.

PostgreSQL hujjatidagi o'xshatish: generated ustun ustunlar uchun xuddi view jadvallar uchun bo'lgandek narsa (view — 17-bob).

### Ikki xil

| Tur | Qachon hisoblanadi | Joy | O'xshashi |
| --- | --- | --- | --- |
| **Stored** (saqlanadigan) | Qator yozilganda yoki yangilanganda | Oddiy ustundek joy egallaydi | Materialized view, faqat doim avtomatik yangilanadi |
| **Virtual** | Qator o'qilganda | Joy egallamaydi | View |

PostgreSQL 18 dan boshlab generated ustun sukut bo'yicha **virtual**. Tanlovni aniq ko'rsatish uchun `VIRTUAL` yoki `STORED` yoziladi:

```sql
CREATE TABLE people (
    …,
    height_cm numeric,
    height_in numeric GENERATED ALWAYS AS (height_cm / 2.54)
);
```

### `DEFAULT` dan farqi

Hujjat ikkalasini solishtiradi:

| | `DEFAULT` | Generated ustun |
| --- | --- | --- |
| Qachon hisoblanadi | Bir marta, qator yaratilganda, agar boshqa qiymat berilmasa | Qator har o'zgarganda (stored) yoki har o'qilganda (virtual) |
| Qo'lda qiymat yozish | Mumkin | **Mumkin emas** (faqat `DEFAULT` kalit so'zi) |
| Boshqa ustunlarga murojaat | Mumkin emas | Odatda aynan shunday qiladi |
| `random()`, `now()` kabi o'zgaruvchan funksiyalar | Mumkin | **Mumkin emas** |

### Cheklovlar (PostgreSQL)

Hujjatdagi asosiy qoidalar:

- ifoda faqat **o'zgarmas** (*immutable*) funksiyalarni ishlatishi mumkin. Subquery ham, joriy qatordan boshqa narsaga murojaat ham bo'lmaydi;
- generated ustun **boshqa generated ustunga** murojaat qila olmaydi;
- `tableoid` dan boshqa tizim ustunlariga murojaat qilib bo'lmaydi;
- virtual generated ustun foydalanuvchi yaratgan tip va funksiyalarni ishlata olmaydi, faqat ichki tip va funksiyalarni. Stored ustunda bu cheklov yo'q;
- generated ustunda `DEFAULT` yoki identity bo'lmaydi;
- u partitsiya kalitining qismi bo'la olmaydi.

Hujjatga ko'ra generated ustunlar `BEFORE` triggerlar ishlagandan **keyin** yangilanadi (57-bob).

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/15-2-kod.jpg" src="/video/sql/15-2-kod.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/15-2-kod.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/15-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 da Generated ustunlar — virtual va stored yaratish, UPDATE qayta hisoblash va pg_attribute</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Virtual va stored

```sql
CREATE TABLE buyurtma_qatorlari (
    id        integer PRIMARY KEY,
    narx      numeric(12,2) NOT NULL,
    soni      integer NOT NULL,
    summa     numeric(14,2) GENERATED ALWAYS AS (narx * soni),
    summa_s   numeric(14,2) GENERATED ALWAYS AS (narx * soni) STORED
);
INSERT INTO buyurtma_qatorlari (id, narx, soni) VALUES (1, 4000, 3), (2, 12000, 2);
SELECT * FROM buyurtma_qatorlari;
```

```text
 id |   narx   | soni |  summa   | summa_s  
----+----------+------+----------+----------
  1 |  4000.00 |    3 | 12000.00 | 12000.00
  2 | 12000.00 |    2 | 24000.00 | 24000.00
(2 rows)
```

Asosiy ustun o'zgarsa, ikkala generated ustun ham yangilanadi:

```sql
UPDATE buyurtma_qatorlari SET soni = 5 WHERE id = 1;
SELECT id, soni, summa, summa_s FROM buyurtma_qatorlari WHERE id = 1;
```

```text
 id | soni |  summa   | summa_s  
----+------+----------+----------
  1 |    5 | 20000.00 | 20000.00
(1 row)
```

Qaysi ustun qaysi turda ekanini katalog ko'rsatadi: `v` — virtual, `s` — stored.

```sql
SELECT attname, attgenerated FROM pg_attribute
WHERE attrelid = 'buyurtma_qatorlari'::regclass AND attname LIKE 'summa%';
```

```text
 attname | attgenerated 
---------+--------------
 summa   | v
 summa_s | s
(2 rows)
```

### Qo'lda yozib bo'lmaydi

```sql
INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (3, 1, 1, 999);
INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (3, 1, 1, DEFAULT);
```

```text
ERROR:  cannot insert a non-DEFAULT value into column "summa"
DETAIL:  Column "summa" is a generated column.
INSERT 0 1
```

### Taqiqlangan ifodalar

```sql
CREATE TABLE xato1 (a int, vaqt timestamptz GENERATED ALWAYS AS (now()) STORED);
CREATE TABLE xato2 (a int, b int GENERATED ALWAYS AS (a * 2), c int GENERATED ALWAYS AS (b + 1));
```

```text
ERROR:  generation expression is not immutable
ERROR:  cannot use generated column "b" in column generation expression
LINE 1: ...RATED ALWAYS AS (a * 2), c int GENERATED ALWAYS AS (b + 1));
                                                               ^
DETAIL:  A generated column cannot reference another generated column.
```

`now()` har chaqiruvda boshqa qiymat beradi, ya'ni o'zgarmas emas. "Qator yaratilgan vaqt" kerak bo'lsa, bu `DEFAULT now()` ning ishi (12-bob).

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/15-3-dialektlar.jpg" src="/video/sql/15-3-dialektlar.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/15-3-dialektlar.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/15-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: Dialektlar — MySQL da virtual indeks va zanjir murojaati, SQLite da STORED cheklovi va 6 ta tuzoq</figcaption>
</figure>

### MySQL

MySQL'da sintaksis qisqaroq: `GENERATED ALWAYS` ixtiyoriy, `AS (ifoda)` yetarli. Hujjatdagi qoidalar:

- sukut bo'yicha **`VIRTUAL`**, PostgreSQL 18 kabi;
- InnoDB virtual ustunlarga ham **ikkilamchi indeks** qo'yishga ruxsat beradi;
- ifodada literallar, **deterministik** ichki funksiyalar va operatorlar bo'lishi mumkin. `NOW()`, `CURRENT_USER()`, `CONNECTION_ID()` mumkin emas;
- saqlanadigan funksiyalar, o'zgaruvchilar va subquery'lar mumkin emas;
- generated ustun **o'zidan oldin e'lon qilingan** boshqa generated ustunga murojaat qila oladi. PostgreSQL'da bu taqiqlangan;
- `AUTO_INCREMENT` ustun asos sifatida ishlatilmaydi.

```sql
CREATE TABLE buyurtma_qatorlari (
    id INT PRIMARY KEY,
    narx DECIMAL(12,2) NOT NULL,
    soni INT NOT NULL,
    summa DECIMAL(14,2) AS (narx * soni),
    summa_s DECIMAL(14,2) AS (narx * soni) STORED,
    jami_qqs DECIMAL(14,2) AS (summa * 1.12),
    INDEX (summa)
);
INSERT INTO buyurtma_qatorlari (id, narx, soni) VALUES (1, 4000, 3);
SELECT * FROM buyurtma_qatorlari;
```

```text
+----+---------+------+----------+----------+----------+
| id | narx    | soni | summa    | summa_s  | jami_qqs |
+----+---------+------+----------+----------+----------+
|  1 | 4000.00 |    3 | 12000.00 | 12000.00 | 13440.00 |
+----+---------+------+----------+----------+----------+
```

`jami_qqs` boshqa generated ustunga (`summa`) tayandi. Virtual `summa` ustuniga indeks ham qo'yildi.

```sql
INSERT INTO buyurtma_qatorlari (id, narx, soni, summa) VALUES (2, 1, 1, 5);
CREATE TABLE xato (a INT, v DATETIME AS (NOW()));
```

```text
ERROR 3105 (HY000) at line 12: The value specified for generated column 'summa' in table 'buyurtma_qatorlari' is not allowed.
ERROR 3763 (HY000) at line 14: Expression of generated column 'v' contains a disallowed function: now.
```

Ustun turi `information_schema` da ko'rinadi:

```text
| summa       | VIRTUAL GENERATED |
| summa_s     | STORED GENERATED  |
```

Hujjatda yana bir ogohlantirish bor: ifoda hisoblanayotgan paytdagi `sql_mode` ishlatiladi. Natija rejimga bog'liq bo'lsa, rejim har safar bir xil bo'lishi kerak.

### SQLite

SQLite'da generated ustunlar 3.31.0 versiyadan beri bor. Hujjatdagi qoidalar:

- `GENERATED ALWAYS` va `VIRTUAL`/`STORED` ixtiyoriy, faqat `AS (ifoda)` majburiy;
- sukut bo'yicha **`VIRTUAL`**;
- generated ustun boshqa generated ustunga murojaat qila oladi, faqat o'ziga qaytib kelmasa bo'ldi;
- `NOT NULL`, `CHECK`, `UNIQUE` va tashqi kalit cheklovlari bo'lishi mumkin;
- indeksda qatnashishi mumkin. Virtual ustun ishtirok etgan indeks — ifoda indeksi (43-bob);
- `DEFAULT` va `PRIMARY KEY` bo'lishi mumkin emas;
- ifodada faqat shu qatordagi ustunlar, literallar va deterministik skalyar funksiyalar bo'ladi;
- **`ALTER TABLE ADD COLUMN` bilan faqat `VIRTUAL` ustun qo'shish mumkin**.

```sql
CREATE TABLE q (
    id INTEGER PRIMARY KEY, narx NUMERIC, soni INT,
    summa NUMERIC AS (narx * soni),
    summa_s NUMERIC AS (narx * soni) STORED,
    ikki_baravar AS (summa * 2)
);
INSERT INTO q (narx, soni) VALUES (4000, 3);
SELECT * FROM q;
```

```text
id  narx  soni  summa  summa_s  ikki_baravar
--  ----  ----  -----  -------  ------------
 1  4000     3  12000    12000         24000
```

Qo'lda yozish va ma'lumotli jadvalga `STORED` ustun qo'shish:

```text
SQLite-3.54 memory-> CREATE TABLE q (id INTEGER PRIMARY KEY, soni INT);
SQLite-3.54 memory-> INSERT INTO q (soni) VALUES (1);
SQLite-3.54 memory-> ALTER TABLE q ADD COLUMN v2 AS (soni + 1);
SQLite-3.54 memory-> ALTER TABLE q ADD COLUMN s2 AS (soni + 1) STORED;
Error near line 5: cannot add a STORED column
```

```text
SQLite-3.54 memory-> INSERT INTO q (soni, summa) VALUES (1, 5);
Parse error near line 2: cannot INSERT into generated column "summa"
```

Sinovda bitta nozik jihat chiqdi: **bo'sh** jadvalga `STORED` ustunni `ALTER TABLE` bilan qo'shish xatosiz o'tdi. Xato faqat jadvalda qator bo'lganda chiqdi. Hujjatda esa bu cheklov shartsiz yozilgan. Shuning uchun bunga tayanmang.

### Qisqacha jadval

| | PostgreSQL 18 | MySQL 9.7 | SQLite 3.54 |
| --- | --- | --- | --- |
| Sintaksis | `GENERATED ALWAYS AS (…) [VIRTUAL\|STORED]` | `[GENERATED ALWAYS] AS (…) [VIRTUAL\|STORED]` | `[GENERATED ALWAYS] AS (…) [VIRTUAL\|STORED]` |
| Sukut bo'yicha | `VIRTUAL` | `VIRTUAL` | `VIRTUAL` |
| Boshqa generated ustunga murojaat | Mumkin emas | Faqat oldin e'lon qilinganiga | Mumkin (aylana bo'lmasa) |
| O'zgaruvchan funksiya (`now()`) | Mumkin emas | Mumkin emas | Mumkin emas |
| Qo'lda qiymat yozish | Faqat `DEFAULT` | Faqat `DEFAULT` | Mumkin emas |
| Virtual ustunga indeks | — (43-bobdagi ifoda indeksi) | Ha (InnoDB) | Ha (ifoda indeksi sifatida) |
| `ALTER TABLE ADD` | Ikkala tur | Ikkala tur | Faqat `VIRTUAL` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hisoblanadigan qiymatni (summa, to'liq ism) oddiy ustunda saqlab, ilovada yangilash | Bir joyda unutilsa, ma'lumot qarama-qarshi bo'lib qoladi | Generated ustun |
| "Yaratilgan vaqt"ni generated ustun bilan qilmoqchi bo'lish | `now()` o'zgarmas emas, taqiqlangan | `DEFAULT now()` |
| PostgreSQL'da generated ustunni boshqa generated ustunga tayantirish | Taqiqlangan | Ifodani asosiy ustunlardan to'liq yozish |
| PostgreSQL 18 dan oldingi odat bilan `STORED` siz yozib, saqlanadi deb o'ylash | 18 da sukut bo'yicha virtual: har o'qishda hisoblanadi | Kerakli turni aniq yozish |
| Og'ir hisobli virtual ustunni ko'p o'qiladigan so'rovlarda ishlatish | Har o'qishda qayta hisoblanadi | `STORED` yoki indeks |
| SQLite'da ma'lumotli jadvalga `STORED` ustun qo'shmoqchi bo'lish | `cannot add a STORED column` | `VIRTUAL` qo'shish yoki jadvalni qayta qurish (16-bob) |
| MySQL'da ifoda natijasini `sql_mode` ga bog'liq qilish | Rejim o'zgarsa, natija ham o'zgarishi mumkin | Rejimga bog'liq bo'lmagan ifoda |

## Amaliyot

1. `xodimlar` jadvalida `ism` va `familiya` dan `toliq_ism` generated ustunini yarating. `UPDATE` bilan familiyani o'zgartirib, natijani tekshiring.
2. PostgreSQL'da `narx` va `qqs_foiz` ustunlaridan `qqs_bilan` ni avval virtual, keyin stored qilib yarating. `pg_column_size()` yoki jadval hajmini solishtiring.
3. `GENERATED ALWAYS AS (random())` ni uchala tizimda sinab ko'ring.
4. MySQL'da virtual generated ustunga indeks qo'ying va `SHOW INDEX` bilan tekshiring.
5. SQLite'da `ALTER TABLE` bilan bitta virtual va bitta stored ustun qo'shing: avval bo'sh, keyin ma'lumotli jadvalga.

## Rasmiy hujjat

- PostgreSQL — 5.4. Generated Columns: <https://www.postgresql.org/docs/18/ddl-generated-columns.html>
- PostgreSQL — CREATE TABLE (`GENERATED ALWAYS AS`): <https://www.postgresql.org/docs/18/sql-createtable.html>
- MySQL — 15.1.25.8 CREATE TABLE and Generated Columns: <https://dev.mysql.com/doc/refman/9.7/en/create-table-generated-columns.html>
- SQLite — Generated Columns: <https://www.sqlite.org/gencol.html>
