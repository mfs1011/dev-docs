# 12 — `CREATE TABLE` va `DEFAULT`

[← Oldingi: Kodlash va collation](11-kodlash-va-collation.md) · [Mundarija](README.md) · [Keyingi: Identity va sequence →](13-identity-va-sequence.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/12-1-tushuncha.jpg" src="/video/sql/12-1-tushuncha.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/12-1-tushuncha.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/12-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: CREATE TABLE va DEFAULT — Relyatsion jadvallar, ustun tiplari, DEFAULT ifodalari va TEMPORARY/UNLOGGED jadvallar.</figcaption>
</figure>

PostgreSQL hujjati jadvalni qog'ozdagi jadvalga o'xshatadi. U qatorlar va ustunlardan iborat:

- **ustunlar** soni va tartibi qat'iy, har birining nomi va ma'lumot tipi bor;
- **qatorlar** soni o'zgaruvchan, u bazada hozir qancha ma'lumot borligini ko'rsatadi.

Hujjat yana ikki narsani eslatadi:

- SQL qatorlar **tartibini** kafolatlamaydi (1-bob);
- SQL qatorlarga **yagona identifikator bermaydi**. Shuning uchun jadvalda bir nechta mutlaqo bir xil qator bo'lishi mumkin. Bu SQL ostidagi matematik modeldan kelib chiqadi, lekin odatda istalmagan holat. Uning yechimi — cheklovlar, birinchi navbatda birlamchi kalit (14-bob).

### `CREATE TABLE`

Eng kamida jadval nomi, ustunlar nomi va har ustunning tipi yoziladi:

```sql
CREATE TABLE products (
    product_no integer,
    name text,
    price numeric
);
```

- Ustunlar vergul bilan ajratiladi va qavs ichiga olinadi.
- Jadval va ustun nomlari identifikator qoidalariga bo'ysunadi (4-bob).
- Hujjat bog'liq jadvallar ko'p bo'lsa, **izchil nomlash** uslubini tanlashni maslahat beradi. Masalan, jadval nomlari birlikda yoki ko'plikda bo'ladimi — hujjatga ko'ra ikkalasining ham tarafdorlari bor. Bu qo'llanmada ko'plik ishlatiladi: `mahsulotlar`, `buyurtmalar`.
- PostgreSQL'da jadvaldagi ustunlar soni tiplarga qarab 250 dan 1600 gacha bo'lishi mumkin. Hujjat bunga yaqin ustunli jadvalni "juda g'ayrioddiy va ko'pincha shubhali dizayn" deydi.

Jadval `DROP TABLE` bilan o'chiriladi.

### `DEFAULT` — sukut bo'yicha qiymat

Yangi qator yozilganda ba'zi ustunlarga qiymat berilmasa, ularga **sukut bo'yicha qiymat** yoziladi. Hujjatdagi qoidalar:

- `DEFAULT` yozilmagan ustunning sukut bo'yicha qiymati — `NULL`. Bu mantiqiy, chunki `NULL` "noma'lum" degani;
- `DEFAULT` ifoda ham bo'lishi mumkin. U jadval yaratilganda emas, **har qator yozilganda** hisoblanadi. Eng ko'p uchraydigan misol — `DEFAULT CURRENT_TIMESTAMP`, ya'ni qator qo'shilgan vaqt;
- `INSERT` va `UPDATE` da ustunga aynan sukut bo'yicha qiymatni so'rash mumkin, uning nima ekanini bilish shart emas: `DEFAULT` kalit so'zi bilan.

Hujjatda tartib raqami uchun ham misol bor: `DEFAULT nextval('…_seq')`. Bu `serial` yozuvining ichki ko'rinishi (13-bob).

### Tizim ustunlari

PostgreSQL'da har jadvalda bir nechta **yashirin** tizim ustuni bor. Ularning nomlarini o'z ustunlaringizga berib bo'lmaydi, hatto qo'shtirnoq bilan ham. Hujjat: "ular haqida qayg'urish shart emas, faqat borligini biling":

| Ustun | Ma'nosi |
| --- | --- |
| `tableoid` | Qator qaysi jadvalga tegishli (partitsiyalarda foydali) |
| `xmin` | Qatorning shu **versiyasini** yozgan tranzaksiya raqami |
| `xmax` | Uni o'chirgan tranzaksiya raqami yoki 0 |
| `cmin`, `cmax` | Tranzaksiya ichidagi buyruq raqami |
| `ctid` | Qator versiyasining jadvaldagi **jismoniy joyi** |

Hujjat muhim ogohlantirish beradi: `ctid` qator **yangilanganda** yoki `VACUUM FULL` bilan ko'chirilganda o'zgaradi. Shuning uchun uni qator identifikatori sifatida ishlatmaslik kerak, buning uchun birlamchi kalit bor. "Har yangilash bir mantiqiy qatorning yangi versiyasini yaratadi" degan gap 52-bobdagi MVCC'ning asosi.

### Boshqa jadvaldan jadval yaratish

| Usul | Nima ko'chiriladi | Ma'lumot |
| --- | --- | --- |
| `CREATE TABLE yangi (LIKE eski)` | Ustun nomlari, tiplari, `NOT NULL`. Qolgani `INCLUDING DEFAULTS`, `INCLUDING CONSTRAINTS`, `INCLUDING INDEXES`, `INCLUDING ALL` va hokazo bilan | Yo'q |
| `CREATE TABLE yangi AS SELECT …` | So'rov natijasining ustunlari va tiplari | Bir martalik nusxa |

`LIKE` dan keyin ikki jadval **butunlay mustaqil**. Asl jadvaldagi o'zgarishlar yangisiga o'tmaydi.

`CREATE TABLE AS` view'ga o'xshaydi, lekin hujjatga ko'ra "aslida butunlay boshqa narsa": so'rov **bir marta** bajariladi va keyingi o'zgarishlarni kuzatmaydi. View esa har murojaatda qayta hisoblanadi (17-bob).

### Maxsus jadvallar

- **`TEMPORARY` (`TEMP`)** — vaqtinchalik jadval. Seans tugaganda, yoki `ON COMMIT` bilan tranzaksiya tugaganda, avtomatik o'chiriladi.
  - Vaqtinchalik sxema `search_path` da **birinchi** turadi. Shuning uchun u shu nomli doimiy jadvalni yashirib qo'yadi.
  - Autovacuum vaqtinchalik jadvallarga yeta olmaydi. Hujjat murakkab so'rovlardan oldin ularga `ANALYZE` ni qo'lda bajarishni maslahat beradi.
  - Standartdan farqi: standartda vaqtinchalik jadval bir marta e'lon qilinadi va har seansda bo'sh holda mavjud bo'ladi. PostgreSQL'da esa har seans uni o'zi yaratadi.
- **`UNLOGGED`** — yozuvlari WAL jurnaliga tushmaydigan jadval. Shuning uchun oddiy jadvaldan "ancha tez". Lekin u ishdan chiqishga **chidamli emas**: server kutilmaganda to'xtasa, jadval **bo'shatiladi**. Uning mazmuni zaxira serverlarga ham uzatilmaydi.
- **`IF NOT EXISTS`** — jadval mavjud bo'lsa, xato o'rniga ogohlantirish beriladi. Hujjat ogohlantiradi: mavjud jadval yaratilmoqchi bo'lgan jadvalga umuman o'xshamasligi mumkin.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/12-2-kod.jpg" src="/video/sql/12-2-kod.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/12-2-kod.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/12-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 psql da jonli sinovlar — DEFAULT INSERT, ctid tahlili va TEMPORARY/UNLOGGED relpersistence tekshiruvi.</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Jadval va sukut bo'yicha qiymatlar

```sql
CREATE TABLE mahsulotlar (
    id          integer,
    nom         text,
    narx        numeric(12,2) DEFAULT 0,
    soni        integer DEFAULT 1,
    yaratilgan  timestamptz DEFAULT now()
);

INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non');
INSERT INTO mahsulotlar VALUES (2, 'Sut', DEFAULT, 5, DEFAULT);
INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');
INSERT INTO mahsulotlar (id, nom) VALUES (3, 'Non');

SELECT id, nom, narx, soni, yaratilgan IS NOT NULL AS vaqt_bor FROM mahsulotlar;
```

```text
 id | nom | narx | soni | vaqt_bor 
----+-----+------+------+----------
  1 | Non | 0.00 |    1 | t
  2 | Sut | 0.00 |    5 | t
  3 | Non | 0.00 |    1 | t
  3 | Non | 0.00 |    1 | t
(4 rows)
```

- 1-qatorda faqat `id` va `nom` berildi. Qolgan ustunlar sukut bo'yicha qiymatlarni oldi.
- 2-qatorda `DEFAULT` kalit so'zi bilan aynan sukut bo'yicha qiymat so'raldi.
- 3- va 4-qatorlar mutlaqo bir xil. Jadvalda birlamchi kalit yo'q, shuning uchun PostgreSQL ularni bemalol qabul qildi.

### Tizim ustunlari

```sql
SELECT ctid, xmin, tableoid::regclass, id, nom FROM mahsulotlar;
```

```text
 ctid  | xmin |  tableoid   | id | nom 
-------+------+-------------+----+-----
 (0,1) |  830 | mahsulotlar |  1 | Non
 (0,2) |  831 | mahsulotlar |  2 | Sut
 (0,3) |  832 | mahsulotlar |  3 | Non
 (0,4) |  833 | mahsulotlar |  3 | Non
(4 rows)
```

`ctid` `(sahifa, joy)` ko'rinishida yoziladi. Bir xil ikki qator ham jismonan har xil joyda turibdi. Har `INSERT` alohida tranzaksiyada bo'lgani uchun `xmin` lar ham har xil.

Bitta qatorni yangilaymiz:

```sql
UPDATE mahsulotlar SET soni = 2 WHERE id = 1;
SELECT ctid, xmin, id, soni FROM mahsulotlar WHERE id = 1;
```

```text
 ctid  | xmin | id | soni 
-------+------+----+------
 (0,5) |  834 |  1 |    2
(1 row)
```

Qator `(0,1)` dan `(0,5)` ga "ko'chdi", `xmin` ham o'zgardi. `UPDATE` qatorning **yangi versiyasini** yozdi. Hujjat `ctid` ni identifikator qilmaslikni aynan shuning uchun aytadi.

Tizim ustuni nomini band qilib bo'lmaydi:

```sql
CREATE TABLE xato (ctid int);
```

```text
ERROR:  column name "ctid" conflicts with a system column name
```

### `IF NOT EXISTS`

```sql
CREATE TABLE IF NOT EXISTS mahsulotlar (x int);
```

```text
NOTICE:  relation "mahsulotlar" already exists, skipping
```

Mavjud `mahsulotlar` jadvalida `x` ustuni yo'q. Buyruq esa "muvaffaqiyatli" tugadi. Hujjat ogohlantirgan holat shu.

### `LIKE` va `CREATE TABLE AS`

```sql
CREATE TABLE nusxa  (LIKE mahsulotlar);
CREATE TABLE nusxa2 (LIKE mahsulotlar INCLUDING DEFAULTS);
INSERT INTO nusxa  (id, nom) VALUES (1, 'test');
INSERT INTO nusxa2 (id, nom) VALUES (1, 'test');
SELECT 'nusxa' AS jadval, narx, soni FROM nusxa
UNION ALL
SELECT 'nusxa2', narx, soni FROM nusxa2;
```

```text
 jadval | narx | soni 
--------+------+------
 nusxa  |      |     
 nusxa2 | 0.00 |    1
(2 rows)
```

Oddiy `LIKE` sukut bo'yicha qiymatlarni ko'chirmadi. `INCLUDING DEFAULTS` bilan ko'chdi.

```sql
CREATE TABLE arzon AS SELECT id, nom, narx FROM mahsulotlar WHERE narx < 100;
\d arzon
```

```text
SELECT 4
                  Table "public.arzon"
 Column |     Type      | Collation | Nullable | Default 
--------+---------------+-----------+----------+---------
 id     | integer       |           |          | 
 nom    | text          |           |          | 
 narx   | numeric(12,2) |           |          | 
```

Ustunlar va tiplar so'rovdan olindi, sukut bo'yicha qiymatlar esa yo'q.

### `TEMP` va `UNLOGGED`

```sql
CREATE TEMP TABLE vaqtinchalik (x int);
SELECT nspname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE relname = 'vaqtinchalik';

CREATE UNLOGGED TABLE kesh (k text, v text);
SELECT relname, relpersistence FROM pg_class
WHERE relname IN ('mahsulotlar', 'vaqtinchalik', 'kesh');
```

```text
  nspname   
------------
 pg_temp_68
(1 row)

   relname    | relpersistence 
--------------+----------------
 mahsulotlar  | p
 vaqtinchalik | t
 kesh         | u
(3 rows)
```

- Vaqtinchalik jadval seansga tegishli maxsus `pg_temp_…` sxemasida yaratildi.
- `relpersistence` ustunida: `p` — doimiy, `t` — vaqtinchalik, `u` — WAL'siz.

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/12-3-dialektlar.jpg" src="/video/sql/12-3-dialektlar.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/12-3-dialektlar.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/12-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: Dialektlar (PostgreSQL vs MySQL vs SQLite) — MySQL ifodali DEFAULT qavslari, SQLite WITHOUT ROWID va 6 ta tipik tuzoq.</figcaption>
</figure>

### MySQL

**Ifoda ko'rinishidagi `DEFAULT` qavsda yoziladi.** MySQL hujjatiga ko'ra `DEFAULT` doimiy literal yoki ifoda bo'lishi mumkin. Ifoda **qavs ichida** yoziladi. Yagona istisno: `TIMESTAMP` va `DATETIME` uchun `CURRENT_TIMESTAMP` qavssiz yoziladi.

```sql
CREATE TABLE mahsulotlar (
    id INT NOT NULL,
    nom VARCHAR(50) NOT NULL,
    narx DECIMAL(12,2) DEFAULT 0,
    kod BINARY(16) DEFAULT (UUID_TO_BIN(UUID())),
    muddat DATE DEFAULT (CURRENT_DATE + INTERVAL 1 YEAR),
    yaratilgan DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
CREATE TABLE xato1 (d DATE DEFAULT CURRENT_DATE + INTERVAL 1 YEAR);
```

```text
ERROR 1064 (42000) at line 10: You have an error in your SQL syntax; … near 'CURRENT_DATE + INTERVAL 1 YEAR)' at line 1
```

Qavssiz ifoda sintaksis xatosi berdi.

**`TEXT`, `BLOB`, `JSON` uchun `DEFAULT`.** Bu tiplarga sukut bo'yicha qiymat faqat **ifoda** sifatida berilishi mumkin, hatto qiymat oddiy literal bo'lsa ham (7-bobdagi xato shundan edi):

```sql
CREATE TABLE xato2  (t TEXT DEFAULT 'abc');
CREATE TABLE togri2 (t TEXT DEFAULT ('abc'));
```

```text
ERROR 1101 (42000) at line 11: BLOB, TEXT, GEOMETRY or JSON column 't' can't have a default value
```

Ikkinchisi xatosiz yaratildi.

**`DEFAULT`siz `NOT NULL` ustun.** Hujjatga ko'ra:

- ustun `NULL` qabul qilsa, unga `DEFAULT NULL` yoziladi;
- `NOT NULL` ustunga `DEFAULT` yozilmaydi;
- `INSERT` da shu ustunga qiymat berilmasa, natija `sql_mode` ga bog'liq:
  - qat'iy rejimda — xato;
  - aks holda tipning "yashirin" sukut bo'yicha qiymati yoziladi: son uchun 0, `ENUM` dan boshqa satr tiplari uchun bo'sh satr, sana tiplari uchun "nol" qiymat.

```sql
INSERT INTO mahsulotlar (id) VALUES (2);
```

```text
ERROR 1364 (HY000) at line 14: Field 'nom' doesn't have a default value
```

PostgreSQL'da bunday ustun `NULL` ni olishga urinib, `NOT NULL` cheklovida xato berardi (14-bob).

**`LIKE` indekslarni ham ko'chiradi.** MySQL'da `CREATE TABLE … LIKE` ustun atributlari va **indekslar** bilan bo'sh nusxa yaratadi. PostgreSQL'da buning uchun `INCLUDING INDEXES` kerak edi:

```sql
CREATE TABLE nusxa LIKE mahsulotlar;
SHOW INDEX FROM nusxa;
```

```text
| nusxa |          0 | PRIMARY  |            1 | id          | A         | … | BTREE      | …
```

**`CREATE TABLE … SELECT`** sukut bo'yicha qiymatlarni saqlab qoldi. Doimiy literal `DEFAULT '0.00'` ko'chdi:

```text
CREATE TABLE `arzon` (
  `id` int NOT NULL,
  `nom` varchar(50) NOT NULL,
  `narx` decimal(12,2) DEFAULT '0.00'
) ENGINE=InnoDB …
```

**Vaqtinchalik jadvallar** `SHOW TABLES` da ko'rinmaydi. Hujjatga ko'ra u faqat vaqtinchalik **bo'lmagan** jadvallarni sanaydi:

```text
+--------------------+
| Tables_in_qollanma |
+--------------------+
| arzon              |
| mahsulotlar        |
| nusxa              |
| togri2             |
+--------------------+
```

`vaqtinchalik` jadvali yaratilgan bo'lsa ham, ro'yxatda yo'q.

**Ko'rinmas ustunlar** (*invisible columns*). MySQL'da ustunni `INVISIBLE` qilish mumkin. Hujjatdagi maqsad: `SELECT *` ishlatadigan eski ilova yangi ustun qo'shilganda buzilmasin. `*` ko'rinmas ustunlarni o'z ichiga olmaydi, lekin ustunni nomi bilan so'rasa bo'ladi:

```sql
ALTER TABLE mahsulotlar ADD COLUMN izoh VARCHAR(100) INVISIBLE;
SELECT * FROM mahsulotlar WHERE id = 1;
SELECT id, izoh FROM mahsulotlar WHERE id = 1;
```

```text
+----+-----+------+------------------+------------+---------------------+
| id | nom | narx | kod              | muddat     | yaratilgan          |
+----+-----+------+------------------+------------+---------------------+
|  1 | Non | 0.00 | M�.*���d��ߝ         | 2027-10-13 | 2026-10-13 09:48:16 |
+----+-----+------+------------------+------------+---------------------+
+----+------+
| id | izoh |
+----+------+
|  1 | NULL |
+----+------+
```

`kod` ustunidagi tushunarsiz belgilar — `BINARY(16)` dagi xom baytlar (7-bob).

**Avtomatik yashirin birlamchi kalit (GIPK).** `sql_generate_invisible_primary_key` yoqilgan bo'lsa, MySQL birlamchi kaliti yo'q har yangi InnoDB jadvaliga ko'rinmas birlamchi kalit qo'shadi. Sukut bo'yicha u o'chiq:

```text
| @@sql_generate_invisible_primary_key |
|                                    0 |
```

### SQLite

**`DEFAULT`.** SQLite hujjatiga ko'ra `DEFAULT` quyidagilardan biri bo'lishi mumkin:

- `NULL`, satr yoki blob literali, ishorali son;
- **qavs ichidagi** doimiy ifoda. U har qator uchun alohida hisoblanadi;
- `CURRENT_TIME`, `CURRENT_DATE`, `CURRENT_TIMESTAMP`. Ular joriy **UTC** vaqtining matn ko'rinishini beradi.

```sql
CREATE TABLE mahsulotlar (
    id INTEGER, nom TEXT,
    narx NUMERIC DEFAULT 0,
    kod BLOB DEFAULT (randomblob(16)),
    yaratilgan TEXT DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO mahsulotlar (id, nom) VALUES (1, 'Non'), (2, 'Sut');
SELECT rowid, id, nom, narx, length(kod) AS kod_bayt, yaratilgan FROM mahsulotlar;
```

```text
rowid  id  nom  narx  kod_bayt      yaratilgan
-----  --  ---  ----  --------  -------------------
    1   1  Non     0        16  2026-10-13 04:48:25
    2   2  Sut     0        16  2026-10-13 04:48:25
```

`yaratilgan` UTC'da: Toshkentda soat 09:48 edi.

Funksiya chaqiruvi qavssiz yozilsa — xato:

```text
SQLite-3.54 memory-> CREATE TABLE x (d TEXT DEFAULT date('now'));
Parse error near line 1: near "(": syntax error
  CREATE TABLE x (d TEXT DEFAULT date('now'));
                       error here ---^
SQLite-3.54 memory-> CREATE TABLE y (d TEXT DEFAULT (date('now')));
```

**`rowid`.** Yuqoridagi so'rovda e'lon qilinmagan `rowid` ustuni chiqdi. Hujjatga ko'ra SQLite'dagi har oddiy jadval **rowid jadvali**. Unda har qatorning yagona, `NULL` bo'lmagan 64 bitlik butun `rowid` i bor. Ma'lumot B-tree'da aynan shu kalit bo'yicha saqlanadi. Lekin u ham doimiy identifikator emas: hujjatga ko'ra `VACUUM` aniq `INTEGER PRIMARY KEY` i bo'lmagan jadvallarda `rowid` larni **o'zgartirishi mumkin**. `INTEGER PRIMARY KEY` va `WITHOUT ROWID` 13- va 39-boblarda ko'riladi.

**`CREATE TABLE … AS SELECT`.** Hujjatga ko'ra bunday jadvalda:

- ustun tipi ifodaning affinity'sidan olinadi: `INT`, `TEXT`, `NUM`, `REAL` yoki bo'sh;
- birlamchi kalit va boshqa cheklovlar **yo'q**;
- sukut bo'yicha qiymatlar `NULL`.

```sql
CREATE TABLE arzon AS SELECT id, nom, narx FROM mahsulotlar;
SELECT sql FROM sqlite_schema WHERE name = 'arzon';
```

```text
                    sql
--------------------------------------------
CREATE TABLE arzon(id INT,nom TEXT,narx NUM)
```

`narx` ning `NUMERIC DEFAULT 0` e'loni `NUM` ga aylandi, `DEFAULT` esa yo'qoldi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Ifodali `DEFAULT` | Qavssiz: `DEFAULT now()` | Qavsda: `DEFAULT (…)`; `CURRENT_TIMESTAMP` — istisno | Qavsda: `DEFAULT (…)`; `CURRENT_*` — istisno |
| `TEXT`/`BLOB` ga literal `DEFAULT` | Mumkin | Faqat ifoda ko'rinishida: `DEFAULT ('abc')` | Mumkin |
| `NOT NULL` ustunga qiymat berilmasa | Xato (`NOT NULL`) | Qat'iy rejimda xato, aks holda 0 yoki `''` | Xato (`NOT NULL`) |
| Yashirin qator ustuni | `ctid`, `xmin`… (o'zgaradi) | Yo'q (GIPK — ixtiyoriy) | `rowid` (`VACUUM` o'zgartirishi mumkin) |
| `LIKE` | `(LIKE t INCLUDING …)` — tanlab | `LIKE t` — indekslar bilan | Yo'q |
| `CREATE TABLE AS` | Tiplar; `DEFAULT` siz | Tiplar va `DEFAULT` literallari | Affinity tiplari; cheklovsiz |
| Vaqtinchalik jadval | `TEMP`, `pg_temp_…` sxemasida | `TEMPORARY`, `SHOW TABLES` da yo'q | `TEMP`, `temp` bazasida |
| WAL'siz jadval | `UNLOGGED` | — | — |
| Ko'rinmas ustun | — | `INVISIBLE` | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Jadvalni birlamchi kalitsiz yaratish | Bir xil qatorlar bemalol tushadi, keyin ularni ajratib bo'lmaydi | Har jadvalga `PRIMARY KEY` (13–14-boblar) |
| `ctid` (yoki `rowid`) ni tashqi tizimda identifikator qilib saqlash | `ctid` yangilashda o'zgaradi; SQLite'da `VACUUM` `rowid` ni o'zgartirishi mumkin | Birlamchi kalit |
| Migratsiyada `CREATE TABLE IF NOT EXISTS` ga tayanish | Jadval boshqa tuzilmada bo'lsa ham "muvaffaqiyatli" o'tadi | Migratsiya vositasi bilan versiyalash (63-bob) |
| `LIKE` hamma narsani ko'chiradi deb o'ylash (PostgreSQL) | Sukut bo'yicha `DEFAULT`, indeks va `CHECK` ko'chmaydi | `INCLUDING ALL` yoki keraklilarini sanab yozish |
| `CREATE TABLE AS` dan keyin jadval manba bilan sinxron deb o'ylash | Bir martalik nusxa | Doimiy kerak bo'lsa — view (17-bob) |
| Muhim ma'lumotni `UNLOGGED` jadvalda saqlash | Server kutilmaganda to'xtasa, jadval bo'shatiladi | Faqat qayta tiklanadigan ma'lumot (kesh) uchun |
| MySQL'da `DEFAULT` ifodasini qavssiz yozish | Sintaksis xatosi | `DEFAULT (ifoda)` |
| SQLite'da `DEFAULT CURRENT_TIMESTAMP` ni mahalliy vaqt deb o'qish | UTC yoziladi | O'qishda `datetime(ustun, 'localtime')` |
| Vaqtinchalik jadval nomini doimiy jadval nomi bilan bir xil qilish (PostgreSQL) | Seans davomida doimiy jadval "yashirinadi" | Boshqa nom yoki `sxema.jadval` |

## Amaliyot

1. PostgreSQL'da `buyurtmalar` jadvalini yarating: `id`, `mijoz`, `summa` (sukut bo'yicha 0), `holat` (sukut bo'yicha `'yangi'`), `yaratilgan` (sukut bo'yicha joriy vaqt). Faqat `id` va `mijoz` bilan qator qo'shib, natijani ko'ring.
2. Bir qatorni uch marta `UPDATE` qiling va har safar `ctid` va `xmin` ni yozib boring.
3. `CREATE TABLE b (LIKE buyurtmalar INCLUDING ALL);` va `INCLUDING` siz variantni `\d` bilan solishtiring.
4. Ikki `psql` oynasida bir xil nomli `TEMP` jadval yarating va har biriga har xil ma'lumot yozing. Ular bir-biriga xalal beradimi?
5. MySQL'da `DEFAULT (CURRENT_DATE + INTERVAL 7 DAY)` bilan `muddat` ustunini yarating. Keyin qavssiz yozib, xatoni ko'ring.
6. SQLite'da `CREATE TABLE t (a INTEGER NOT NULL DEFAULT 5, b TEXT);` yarating va `INSERT INTO t (b) VALUES ('x');` dan keyin `SELECT rowid, * FROM t;` ni bajaring.

## Rasmiy hujjat

- PostgreSQL — 5.1. Table Basics: <https://www.postgresql.org/docs/18/ddl-basics.html>
- PostgreSQL — 5.2. Default Values: <https://www.postgresql.org/docs/18/ddl-default.html>
- PostgreSQL — 5.6. System Columns: <https://www.postgresql.org/docs/18/ddl-system-columns.html>
- PostgreSQL — CREATE TABLE: <https://www.postgresql.org/docs/18/sql-createtable.html>
- PostgreSQL — CREATE TABLE AS: <https://www.postgresql.org/docs/18/sql-createtableas.html>
- MySQL — 15.1.25 CREATE TABLE Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-table.html>
- MySQL — 13.6 Data Type Default Values: <https://dev.mysql.com/doc/refman/9.7/en/data-type-defaults.html>
- MySQL — 15.1.25.3 CREATE TABLE ... LIKE Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-table-like.html>
- MySQL — 15.1.25.4 CREATE TABLE ... SELECT Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-table-select.html>
- MySQL — 15.1.25.10 Invisible Columns: <https://dev.mysql.com/doc/refman/9.7/en/invisible-columns.html>
- MySQL — 15.1.25.11 Generated Invisible Primary Keys: <https://dev.mysql.com/doc/refman/9.7/en/create-table-gipks.html>
- MySQL — 15.7.7.41 SHOW TABLES Statement: <https://dev.mysql.com/doc/refman/9.7/en/show-tables.html>
- SQLite — CREATE TABLE: <https://www.sqlite.org/lang_createtable.html>
- SQLite — Rowid Tables: <https://www.sqlite.org/rowidtable.html>
- SQLite — VACUUM (`rowid` o'zgarishi): <https://www.sqlite.org/lang_vacuum.html>
