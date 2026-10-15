# 04 — SQL sintaksisi

[← Oldingi: O'rnatish va ulanish](03-ornatish-va-ulanish.md) · [Mundarija](README.md) · [Keyingi: Baza, sxema va jadval →](05-baza-sxema-jadval.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/04-1-tushuncha.jpg" src="/video/sql/04-1-tushuncha.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/04-1-tushuncha.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/04-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: SQL sintaksisi asoslari — buyruqlar, nuqtali vergul, tokenlar, katta-kichik harf qoidalari, qo'shtirnoq siri, literallar va operatorlar ustuvorligi.</figcaption>
</figure>

SQL matni **buyruqlar** ketma-ketligidan iborat. PostgreSQL hujjatidagi ta'rif:

- har buyruq **tokenlardan** tuziladi va nuqtali vergul `;` bilan tugaydi;
- token — bu kalit so'z, identifikator, qo'shtirnoqli identifikator, literal (o'zgarmas qiymat) yoki maxsus belgi;
- tokenlar odatda bo'sh joy, tab yoki yangi qator bilan ajratiladi;
- izohlar token emas, ular bo'sh joyga teng.

```sql
SELECT * FROM MY_TABLE; UPDATE MY_TABLE SET A = 5; INSERT INTO MY_TABLE VALUES (3, 'hi there');
```

Bu bitta qatorda yozilgan uchta buyruq. Buyruqni bir necha qatorga bo'lish ham mumkin.

### Kalit so'z va identifikator

- **Kalit so'z** (*key word*) — SQL tilida qat'iy ma'noga ega so'z: `SELECT`, `UPDATE`, `VALUES`.
- **Identifikator** (*identifier*) — jadval, ustun yoki boshqa obyektning **nomi**: `MY_TABLE`, `A`.

Ikkalasining yozilishi bir xil. Shuning uchun so'z kalit so'zmi yoki nommi, buni faqat tilni bilgan holda aytish mumkin.

PostgreSQL'da identifikatorga qo'yiladigan talablar:

- harf yoki `_` bilan boshlanadi. Lotin harflaridan tashqari diakritik belgili va lotin bo'lmagan harflar ham bo'ladi;
- davomida harf, `_`, raqam va `$` bo'lishi mumkin. Lekin `$` standartda ruxsat etilmagan;
- uzunligi ko'pi bilan **63 bayt**. Uzunroq nom **qisqartiriladi**.

Hujjatdan bir foydali maslahat: standart hech qachon raqamli yoki `_` bilan boshlanib-tugaydigan kalit so'z kiritmaydi. Shunday nomlar kelajakdagi kalit so'zlar bilan to'qnashmaydi.

**Katta-kichik harf.** Kalit so'zlar va qo'shtirnoqsiz identifikatorlarda katta-kichik harf farq qilmaydi:

```sql
UPDATE MY_TABLE SET A = 5;
uPDaTE my_TabLE SeT a = 5;   -- xuddi shu buyruq
```

Hujjatda keng tarqalgan uslub ham aytilgan: kalit so'zlar **katta**, nomlar **kichik** harfda (`UPDATE my_table SET a = 5;`). Bu qo'llanmada shu uslubda yoziladi.

### Qo'shtirnoqli identifikator

Nomni **qo'shtirnoq** `"..."` ichiga olsa, u **doim identifikator** bo'ladi, hech qachon kalit so'z emas. Shu tufayli:

- kalit so'zni nom qilib ishlatish mumkin: `"order"`, `"select"`;
- nomda bo'sh joy va boshqa belgilar bo'lishi mumkin. Faqat nol kodli belgi bo'lmaydi;
- qo'shtirnoqning o'zini yozish uchun ikkita qo'shtirnoq yoziladi: `""`.

Muhimi: qo'shtirnoq nomni **katta-kichik harfga sezgir** qiladi. Qo'shtirnoqsiz nomlar esa PostgreSQL'da **kichik harfga** aylantiriladi:

| Yozilishi | PostgreSQL uni qanday ko'radi |
| --- | --- |
| `FOO`, `foo`, `"foo"` | Bitta nom: `foo` |
| `"Foo"` | Alohida nom |
| `"FOO"` | Yana alohida nom |

**Standartdan farq.** Hujjat ochiq tan oladi: kichik harfga aylantirish standartga **zid**. Standartga ko'ra qo'shtirnoqsiz nomlar **katta** harfga aylanadi, ya'ni `foo` = `"FOO"`. Hujjatning maslahati: ko'chiriladigan kod yozmoqchi bo'lsangiz, bitta nomni **doim** qo'shtirnoq bilan yoki **hech qachon** qo'shtirnoqsiz yozing.

### Literallar (o'zgarmas qiymatlar)

**Satr** — bitta tirnoq ichidagi belgilar: `'Salom'`. Satr ichidagi bitta tirnoq **ikki marta** yoziladi: `'Ma''ruf'`. Bu standart usul va uchala tizimda ishlaydi.

Faqat bo'sh joy bilan ajratilgan, lekin orasida **kamida bitta yangi qator** bor ikki satr bitta satrga qo'shiladi. PostgreSQL hujjati bu "biroz g'alati" qoidani standart talab qilishini aytadi:

```sql
SELECT 'Salom, '
       'dunyo';   -- = 'Salom, dunyo'
```

PostgreSQL'da yana ikki xil satr bor. Ikkalasi ham standartda yo'q:

- **Escape satr** — `E'...'`. Ichida teskari chiziq bilan maxsus belgilar yoziladi: `\n` — yangi qator, `\t` — tab, `\\` — teskari chiziqning o'zi.
- **Dollar satr** — `$$...$$` yoki teg bilan `$teg$...$teg$`. Ichidagi hech narsa maxsus ma'noga ega emas: tirnoq ham, teskari chiziq ham shundayligicha qoladi. Ayniqsa funksiya matnini yozishda qulay (56-bob).

**Sonlar** — `42`, `3.5`, `4.`, `.001`, `5e2`, `1.925e-3`. PostgreSQL'da yana:

- butun sonni o'n oltilik (`0xFF`), sakkizlik (`0o755`) va ikkilik (`0b1010`) ko'rinishda yozish mumkin;
- raqamlar orasiga ko'rish uchun `_` qo'yish mumkin: `1_500_000_000`.

Hujjatga ko'ra sonning boshidagi minus yoki plus sonning bir qismi emas, unga qo'llangan **operator**.

### Izohlar

SQL'da ikki xil izoh bor:

```sql
-- bu qator oxirigacha izoh (standart)

/* bu
   ko'p qatorli izoh */
```

PostgreSQL'da `/* */` izohlar **ichma-ich** joylashishi mumkin. Hujjatga ko'ra standart ham shuni talab qiladi, garchi C tilida bunday bo'lmasa ham. Bu ichida izohi bor katta kod qismini izohga olishda qulay.

### Operatorlar ustuvorligi

`2 + 3 * 4` da avval ko'paytirish bajariladi. PostgreSQL'dagi tartib, yuqoridan pastga, ya'ni kuchlidan kuchsizga:

| Operator | Ma'nosi |
| --- | --- |
| `.` | Jadval va ustun nomini ajratish |
| `::` | PostgreSQL uslubidagi tip o'zgartirish |
| `[ ]` | Massiv elementi |
| unar `+` `-` | Ishora |
| `COLLATE` | Collation tanlash |
| `AT` | `AT TIME ZONE` |
| `^` | Darajaga ko'tarish |
| `*` `/` `%` | Ko'paytirish, bo'lish, qoldiq |
| `+` `-` | Qo'shish, ayirish |
| boshqa operatorlar | Masalan, `\|\|` |
| `BETWEEN` `IN` `LIKE` `ILIKE` `SIMILAR` | Oraliq, to'plam, namuna |
| `<` `>` `=` `<=` `>=` `<>` | Taqqoslash |
| `IS` `ISNULL` `NOTNULL` | `IS NULL`, `IS TRUE`, `IS DISTINCT FROM` va boshqalar |
| `NOT` | Mantiqiy inkor |
| `AND` | Mantiqiy VA |
| `OR` | Mantiqiy YOKI |

Hujjatning maslahati: boshqacha tartib kerak bo'lsa, **qavs** qo'ying.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/04-2-kod.jpg" src="/video/sql/04-2-kod.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/04-2-kod.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/04-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 psql da jonli sinovlar — "Mahsulot" va mahsulot ikkita jadval bo'lishi, ORDER kalit so'zi, 63 bayt chegara, escape va dollar satrlar, 5--1 tuzog'i va ustuvorlik.</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Nomlarning kichik harfga aylanishi

```sql
CREATE TABLE Mahsulot (Nom text);
INSERT INTO MAHSULOT VALUES ('Non');
SELECT nom FROM mahsulot;
```

```text
 nom 
-----
 Non
(1 row)
```

`Mahsulot`, `MAHSULOT` va `mahsulot` bitta jadval. PostgreSQL uni `mahsulot` deb saqladi. Ustun nomi ham `nom` bo'lib qoldi. Endi qo'shtirnoq bilan murojaat qilamiz:

```sql
SELECT * FROM "Mahsulot";
```

```text
ERROR:  relation "Mahsulot" does not exist
LINE 1: SELECT * FROM "Mahsulot";
                      ^
```

Qo'shtirnoq bilan aynan `Mahsulot` nomi qidiriladi, bunday jadval esa yo'q. Uni qo'shtirnoq bilan yaratsak, **ikkinchi** jadval paydo bo'ladi:

```sql
CREATE TABLE "Mahsulot" ("Nom" text);
\dt
```

```text
            List of tables
 Schema |   Name    | Type  |  Owner   
--------+-----------+-------+----------
 public | Mahsulot  | table | postgres
 public | mahsulot  | table | postgres
 public | talabalar | table | postgres
(3 rows)
```

Qo'shtirnoq bilan yaratilgan nomga endi **doim** qo'shtirnoq bilan murojaat qilish kerak:

```sql
SELECT Nom FROM "Mahsulot";
```

```text
ERROR:  column "nom" does not exist
LINE 1: SELECT Nom FROM "Mahsulot";
               ^
HINT:  Perhaps you meant to reference the column "Mahsulot.Nom".
```

### Kalit so'zni nom qilish

```sql
CREATE TABLE order (id integer);
```

```text
ERROR:  syntax error at or near "order"
LINE 1: CREATE TABLE order (id integer);
                     ^
```

```sql
CREATE TABLE "order" (id integer);
```

```text
CREATE TABLE
```

`ORDER` kalit so'z (`ORDER BY`), shuning uchun uni nom sifatida qo'shtirnoqsiz yozib bo'lmaydi.

### Uzun nomlar

70 harfli nom bilan jadval yaratamiz:

```text
NOTICE:  identifier "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" will be truncated to "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
CREATE TABLE
```

PostgreSQL xato bermadi. Faqat **ogohlantirib**, nomni 63 belgiga qisqartirdi.

### Satrlar

```sql
SELECT 'Ma''ruf' AS ism;
```

```text
  ism   
--------
 Ma'ruf
(1 row)
```

```sql
SELECT 'a\nb' AS oddiy, E'a\nb' AS escape;
```

```text
 oddiy | escape 
-------+--------
 a\nb  | a     +
       | b
(1 row)
```

Oddiy satrda `\n` ikki belgi bo'lib qoldi: teskari chiziq va `n`. `E'...'` da esa u yangi qatorga aylandi. `psql` natijadagi yangi qatorni `+` belgisi bilan ko'rsatadi.

Sababi PostgreSQL'ning `standard_conforming_strings` parametri. U 9.1-versiyadan beri sukut bo'yicha `on`. Shuning uchun teskari chiziq faqat `E'...'` ichida maxsus ma'noga ega. Hujjat buni "standartga ko'proq mos" deydi.

```sql
SELECT $$Ma'ruf "aka" \n$$ AS dollar;
```

```text
     dollar      
-----------------
 Ma'ruf "aka" \n
(1 row)
```

Dollar satr ichida hamma narsa yozilganicha qoldi.

Ikki satrni qo'shish faqat orada yangi qator bo'lsa ishlaydi:

```sql
SELECT 'Salom, '
       'dunyo' AS ikki_qator;
```

```text
  ikki_qator  
--------------
 Salom, dunyo
(1 row)
```

```sql
SELECT 'Salom, ' 'dunyo';
```

```text
ERROR:  syntax error at or near "'dunyo'"
LINE 1: SELECT 'Salom, ' 'dunyo';
                         ^
```

### Sonlar

```sql
SELECT 1_000_000 AS million, 0xFF AS hex, 0b1010 AS bin, 0o755 AS oct;
```

```text
 million | hex | bin | oct 
---------+-----+-----+-----
 1000000 | 255 |  10 | 493
(1 row)
```

Sonning qaysi tip bo'lishi uning ko'rinishiga bog'liq:

```sql
SELECT pg_typeof(42) AS a, pg_typeof(3000000000) AS b, pg_typeof(3.5) AS c;
```

```text
    a    |   b    |    c    
---------+--------+---------
 integer | bigint | numeric
(1 row)
```

Hujjatdagi qoida:

- nuqta va daraja bo'lmasa — `integer` (32 bit);
- `integer` ga sig'masa — `bigint` (64 bit);
- `bigint` ga ham sig'masa — `numeric`;
- nuqta yoki daraja bo'lsa — doim `numeric`.

Bu faqat **boshlang'ich** tip. Kerak bo'lsa, kontekstga qarab moslashtiriladi (10-bob).

### Izohlar va `5--1`

```sql
SELECT 5--1
;
```

```text
 ?column? 
----------
        5
(1 row)
```

`--` dan keyingi hamma narsa izoh bo'ldi. So'rov aslida `SELECT 5;` bo'lib qoldi. Ayirmoqchi bo'lsangiz, probel qo'ying:

```sql
SELECT 5 - -1 AS natija;
```

```text
 natija 
--------
      6
(1 row)
```

Ichma-ich izoh:

```sql
SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1 AS natija;
```

```text
 natija 
--------
      2
(1 row)
```

### Ustuvorlik

```sql
SELECT 2 + 3 * 4 AS a, (2 + 3) * 4 AS b, 2 ^ 3 ^ 2 AS daraja;
```

```text
 a  | b  | daraja 
----+----+--------
 14 | 20 |     64
(1 row)
```

PostgreSQL ustuvorlik jadvalida `^` **chapdan** bog'lanadi. Shuning uchun `2 ^ 3 ^ 2` = `(2 ^ 3) ^ 2` = 64, `2 ^ 9` = 512 emas.

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/04-3-dialektlar.jpg" src="/video/sql/04-3-dialektlar.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/04-3-dialektlar.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/04-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: dialektlar taqqoslash doskasi (PostgreSQL vs MySQL 9.7 vs SQLite 3.54), lower_case_table_names va Linux xavfi, 64 belgilik chegara, binar 0xFF, shartli izohlar va 6 ta tipik xato.</figcaption>
</figure>

### MySQL

**Identifikatorlar.** MySQL'da identifikatorlar **backtick** `` ` `` bilan o'raladi. Qo'shtirnoq faqat `ANSI_QUOTES` rejimida identifikator bo'ladi (1-bob):

```sql
CREATE TABLE `order` (id int);   -- ishlaydi
CREATE TABLE order (id int);     -- ERROR 1064 … near 'order (id int)'
```

Boshqa qoidalari:

- qo'shtirnoqsiz identifikatorda `[0-9a-zA-Z$_]` va U+0080 dan U+FFFF gacha belgilar bo'lishi mumkin;
- identifikator raqam bilan **boshlanishi** mumkin, lekin faqat raqamlardan iborat bo'lmasligi kerak;
- `$` bilan boshlanadigan qo'shtirnoqsiz nom eskirgan (*deprecated*).

**Uzunlik.** Jadval, ustun va baza nomlari uchun chegara **64 belgi**. PostgreSQL'dan farqli o'laroq, MySQL qisqartirmaydi, **xato** beradi:

```text
ERROR 1059 (42000) at line 1: Identifier name 'aaaa…aaaa' is too long
```

**Katta-kichik harf.** Bu PostgreSQL'dan butunlay boshqacha va operatsion tizimga bog'liq. MySQL'da baza — papka, jadval esa shu papkadagi fayl. Shuning uchun:

- ustun, indeks va saqlanadigan protsedura nomlari, ustun aliaslari — **hech qayerda** katta-kichik harfga sezgir emas;
- baza, jadval va trigger nomlari `lower_case_table_names` ga bog'liq. U faqat server ilk sozlanayotganda o'rnatiladi, keyin o'zgartirish **taqiqlangan**.

| `lower_case_table_names` | Sukut bo'yicha qayerda | Ma'nosi |
| --- | --- | --- |
| `0` | Unix (Linux) | Nom yozilganicha saqlanadi, taqqoslash **sezgir** |
| `1` | Windows | Hammasi kichik harfda saqlanadi, taqqoslash sezgir emas |
| `2` | macOS | Yozilganicha saqlanadi, taqqoslashda kichik harfga o'giriladi |

Sinov serverimiz macOS'da, shuning uchun qiymat `2`:

```sql
CREATE TABLE Mahsulot (Nom varchar(50));
INSERT INTO MAHSULOT VALUES ('Non');
SELECT nom FROM mahsulot;
SHOW TABLES;
```

```text
+------+
| nom  |
+------+
| Non  |
+------+
+--------------------+
| Tables_in_qollanma |
+--------------------+
| Mahsulot           |
+--------------------+
```

Diqqat qiling: **Linux'dagi** MySQL serverida (`0`) `MAHSULOT` va `Mahsulot` ikki xil jadval bo'ladi. Shu so'rov u yerda xato beradi. Hujjat tavsiyasi: baza va jadval nomlarini **doim kichik harfda** yarating va shunday murojaat qiling.

**Satrlar.**

- MySQL satrni bitta tirnoqda ham, qo'shtirnoqda ham qabul qiladi (`ANSI_QUOTES` bo'lmasa).
- Teskari chiziq **oddiy satrda ham** maxsus ma'noga ega, agar `NO_BACKSLASH_ESCAPES` rejimi yoqilmagan bo'lsa.
- Yonma-yon satrlar yangi qatorsiz ham qo'shiladi.

```sql
SELECT 'Ma''ruf' AS ism, 'Ma\'ruf' AS backslash;
SELECT 'a\nb' AS oddiy;
SELECT 'Salom, ' 'dunyo' AS bir_qator;
```

```text
+--------+-----------+
| ism    | backslash |
+--------+-----------+
| Ma'ruf | Ma'ruf    |
+--------+-----------+
+-------+
| oddiy |
+-------+
| a
b   |
+-------+
+--------------+
| bir_qator    |
+--------------+
| Salom, dunyo |
+--------------+
```

Bitta `'a\nb'` PostgreSQL'da to'rt belgi bo'lib qoldi, MySQL'da esa yangi qatorga aylandi.

**Sonlar.**

- `0xFF` MySQL'da son emas, **binary satr**. Hujjatga ko'ra o'n oltilik literal sukut bo'yicha binary satr bo'ladi. Son kerak bo'lsa, son kontekstiga qo'yiladi, masalan `0xFF + 0`.
- `_` raqam ajratuvchisi MySQL'da yo'q. `1_000` identifikator deb o'qiladi, chunki MySQL'da nom raqam bilan boshlanishi mumkin.

```sql
SELECT 0xFF AS hex, 0xFF + 0 AS hex_son, 0b1010 + 0 AS bin_son;
SELECT 1_000 AS son;
```

```text
+-----+---------+---------+
| hex | hex_son | bin_son |
+-----+---------+---------+
| �    |     255 |      10 |
+-----+---------+---------+
ERROR 1054 (42S22) at line 7: Unknown column '1_000' in 'field list'
```

**Izohlar.** MySQL'da uch xil izoh bor:

| Izoh | Izohi |
| --- | --- |
| `# …` | Qator oxirigacha. Standartda yo'q |
| `-- …` | Qator oxirigacha, lekin `--` dan keyin **albatta probel** yoki boshqaruv belgisi bo'lishi kerak |
| `/* … */` | Ko'p qatorli. Ichma-ich izoh qo'llab-quvvatlanmaydi va eskirgan |

Probel qoidasining sababini hujjat shunday tushuntiradi. Dastur `balance=balance-charge` so'rovini yasaydi, `charge` esa `-1` bo'lsa, `balance=balance--1` hosil bo'ladi. Standart SQL'da `--1` izohga aylanib, so'rov **jimgina** `balance=balance` ga o'zgaradi. MySQL bunga yo'l qo'ymaydi:

```sql
SELECT 5--1 AS natija;
```

```text
+--------+
| natija |
+--------+
|      6 |
+--------+
```

PostgreSQL'da xuddi shu `5--1` natijasi `5` edi.

MySQL'da yana `/*! … */` ko'rinishidagi izoh bor. Uning ichidagi kodni **MySQL bajaradi**, boshqa tizimlar esa oddiy izoh deb o'tkazib yuboradi:

```sql
SELECT 'MySQL' AS x, 1 /*! + 1 */ AS faqat_mysql;
```

MySQL'da `2`, PostgreSQL'da `1` chiqadi. `mysqldump` fayllarida bunday izohlar ko'p uchraydi.

**Operatorlar.** MySQL'da operatorlar ma'nosi va ustuvorligi boshqacha:

- `^` darajaga ko'tarish emas, **bitli XOR**. `2 ^ 3` = `1`. Daraja uchun `POW(2, 3)` = `8`;
- `||` sukut bo'yicha `OR` (1-bob);
- `!` — `NOT` ga o'xshash, lekin ustuvorligi yuqoriroq.

Ba'zi operatorlarning ustuvorligi `sql_mode` ga ham bog'liq (`PIPES_AS_CONCAT`, `HIGH_NOT_PRECEDENCE`).

### SQLite

**Identifikatorlar.** SQLite kalit so'zni nom qilishning **to'rt** usulini sanaydi:

| Yozilishi | Ma'nosi |
| --- | --- |
| `'keyword'` | Satr |
| `"keyword"` | Identifikator (standart) |
| `[keyword]` | Identifikator (MS Access va SQL Server bilan moslik; standart emas) |
| `` `keyword` `` | Identifikator (MySQL bilan moslik; standart emas) |

Hujjat eski so'rovlar uchun ikki istisnoni ham aytadi, lekin ulardan foydalanmaslikni ogohlantiradi. SQLite vaqti-vaqti bilan yangi kalit so'zlar qo'shadi. Shuning uchun hujjat inglizcha so'zdan iborat har bir nomni, kerak bo'lmasa ham, qo'shtirnoqqa olishni tavsiya qiladi.

Sinovda SQLite qo'shtirnoqdagi nomni ham katta-kichik harfga sezgir qilmadi. `"mahsulot"` jadvali `Mahsulot` bilan to'qnashdi:

```text
SQLite-3.54 memory-> CREATE TABLE Mahsulot (Nom text);
SQLite-3.54 memory-> CREATE TABLE "mahsulot" (x);
Parse error near line 2: table "mahsulot" already exists
  CREATE TABLE "mahsulot" (x);
               ^--- error here
```

PostgreSQL'da bu ikkita alohida jadval bo'lardi.

**Satrlar.** Satr ichidagi tirnoq faqat standart usulda, `''` bilan yoziladi. Teskari chiziq maxsus emas: `'a\nb'` to'rt belgi bo'lib qoladi, `'Ma\'ruf'` esa xato beradi.

**Sonlar.** SQLite `0x` bilan o'n oltilik butun sonlarni 3.8.6 versiyadan beri qabul qiladi. `_` raqam ajratuvchisi 3.46.0 dan beri bor:

```sql
SELECT 0xFF AS hex, 1_000_000 AS million;
```

```text
hex  million
---  -------
255  1000000
```

**Izohlar.** `--` va `/* */` bor. Hujjatga ko'ra izohlar **ichma-ich joylashmaydi**:

```text
SQLite-3.54 memory-> SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1;
Parse error near line 3: near "izoh": syntax error
  SELECT 1 /* tashqi /* ichki */ hali izoh */ + 1;
                        error here ---^
```

Birinchi `*/` izohni yopdi, `hali izoh */` esa SQL bo'lib qoldi. `5--1` SQLite'da ham PostgreSQL'dagidek `5` beradi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Identifikator qo'shtirnog'i | `"x"` | `` `x` ``; `"x"` faqat `ANSI_QUOTES` da | `"x"`, `[x]`, `` `x` `` |
| Qo'shtirnoqsiz nom | Kichik harfga aylanadi (standart — katta harf) | Ustunlar sezgir emas; jadvallar OT va `lower_case_table_names` ga bog'liq | Sezgir emas |
| Nom uzunligi | 63 bayt, ortig'i qisqartiriladi | 64 belgi, ortig'i — xato | — |
| Satr | `'…'`; `E'…'`, `$$…$$` | `'…'` va `"…"`; `\` maxsus | `'…'` |
| `'a\nb'` | 4 belgi | Yangi qator | 4 belgi |
| `0xFF` | 255 | Binary satr | 255 |
| `1_000` | 1000 | Ustun nomi deb o'qiladi → xato | 1000 |
| `5--1` | 5 (izoh) | 6 (`--` dan keyin probel yo'q) | 5 (izoh) |
| Ichma-ich `/* */` | Ha | Yo'q (eskirgan) | Yo'q |
| `#` izoh | Yo'q | Ha | Yo'q |
| `2 ^ 3` | 8 (daraja) | 1 (XOR) | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Jadvalni `"Mahsulot"` deb yaratib, keyin `Mahsulot` deb murojaat qilish | PostgreSQL `mahsulot` ni qidiradi va topmaydi | Nomlarni kichik harf va `_` bilan yozish: `mahsulot`, `buyurtma_qatori` |
| ORM yoki GUI yaratgan aralash harfli nomlar (`"userId"`) | Har so'rovda qo'shtirnoq kerak bo'ladi, unutilsa — xato | ORM'da nomlash strategiyasini `snake_case` ga sozlash |
| Kalit so'zni nom qilish (`order`, `user`, `group`) | Har joyda qo'shtirnoq kerak; tizimdan tizimga qoidasi farq qiladi | Boshqa nom tanlash: `buyurtma`, `foydalanuvchi` |
| Satr ichidagi tirnoqni `\'` bilan yozish | PostgreSQL va SQLite'da ishlamaydi | `''` — uchala tizimda ishlaydi |
| Foydalanuvchi kiritgan satrni so'rovga qo'lda ulash | Tirnoqni noto'g'ri qochirish SQL injection'ga olib keladi | Parametrli so'rovlar (62-bob) |
| `a--b` kabi ifodalarni probelsiz yozish | PostgreSQL va SQLite'da qolgan qism izohga aylanadi | Operatorlar atrofida probel: `a - -b` |
| Linux serverida jadvalni har xil harflar bilan chaqirish (MySQL) | macOS va Windows'da ishlagan kod Linux'da `Table doesn't exist` beradi | Baza va jadval nomlari doim kichik harfda |
| 63 baytdan uzun nom (PostgreSQL) | Jimgina qisqartiriladi; ikki uzun nom bir xil bo'lib qolishi mumkin | Nomlarni qisqa tutish; `NOTICE` larga e'tibor berish |
| `^` ni hamma joyda daraja deb bilish | MySQL'da bu XOR | `power()` / `POW()` |

## Amaliyot

1. PostgreSQL'da `CREATE TABLE "Test" (id int);` va `CREATE TABLE test (id int);` ni bajaring. `\dt` da nechta jadval chiqadi? `SELECT * FROM TEST;` qaysi biriga murojaat qiladi?
2. Bir xil `SELECT 'O''Reilly', 'a\tb';` so'rovini uchala tizimda bajarib, natijalarni solishtiring.
3. PostgreSQL'da `It's "quoted" \ text` matnini uch xil literal bilan yozing: oddiy, `E'…'` va `$$…$$`.
4. `SELECT pg_typeof(2147483647), pg_typeof(2147483648), pg_typeof(1e3);` natijasini oldindan ayting, keyin tekshiring.
5. MySQL'da `SELECT 10--2;` va `SELECT 10 -- 2;` farqini tushuntiring. Xuddi shuni PostgreSQL'da bajaring.
6. MySQL'da `SELECT @@lower_case_table_names;` ni bajaring. Sizning serveringizda `SELECT * FROM MAHSULOT` va `SELECT * FROM mahsulot` bir jadvalga murojaat qiladimi?
7. PostgreSQL ustuvorlik jadvaliga qarab `SELECT NOT true = false;` natijasini oldindan ayting va tekshiring.

## Rasmiy hujjat

- PostgreSQL — 4.1. Lexical Structure: <https://www.postgresql.org/docs/18/sql-syntax-lexical.html>
- PostgreSQL — Appendix C. SQL Key Words: <https://www.postgresql.org/docs/18/sql-keywords-appendix.html>
- MySQL — 11.1.1 String Literals: <https://dev.mysql.com/doc/refman/9.7/en/string-literals.html>
- MySQL — 11.1.2 Numeric Literals: <https://dev.mysql.com/doc/refman/9.7/en/number-literals.html>
- MySQL — 11.1.4 Hexadecimal Literals: <https://dev.mysql.com/doc/refman/9.7/en/hexadecimal-literals.html>
- MySQL — 11.2 Schema Object Names: <https://dev.mysql.com/doc/refman/9.7/en/identifiers.html>
- MySQL — 11.2.1 Identifier Length Limits: <https://dev.mysql.com/doc/refman/9.7/en/identifier-length.html>
- MySQL — 11.2.3 Identifier Case Sensitivity: <https://dev.mysql.com/doc/refman/9.7/en/identifier-case-sensitivity.html>
- MySQL — 11.7 Comments: <https://dev.mysql.com/doc/refman/9.7/en/comments.html>
- MySQL — 1.7.2.4 '--' as the Start of a Comment: <https://dev.mysql.com/doc/refman/9.7/en/ansi-diff-comments.html>
- MySQL — 14.4.1 Operator Precedence: <https://dev.mysql.com/doc/refman/9.7/en/operator-precedence.html>
- SQLite — SQL Keywords: <https://www.sqlite.org/lang_keywords.html>
- SQLite — Comments: <https://www.sqlite.org/lang_comment.html>
- SQLite — SQL Language Expressions (literallar): <https://www.sqlite.org/lang_expr.html>
