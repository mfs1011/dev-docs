# 11 — Kodlash va collation

[← Oldingi: NULL va tip konversiyasi](10-null-va-tip-konversiyasi.md) · [Mundarija](README.md) · [Keyingi: CREATE TABLE va DEFAULT →](12-create-table-va-default.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/11-1-tushuncha.jpg" src="/video/sql/11-1-tushuncha.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/11-1-tushuncha.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/11-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: Kodlash va collation — Belgilar to'plami, binary va case-insensitive solishtirish, LC_* toifalari hamda libc/icu/builtin provayderlari.</figcaption>
</figure>

MySQL hujjati ikki atamani oddiy misol bilan tushuntiradi. Faraz qilaylik, alifboda to'rt harf bor: `A`, `B`, `a`, `b`. Har biriga raqam beramiz: A = 0, B = 1, a = 2, b = 3.

- **Belgilar to'plami / kodlash** (*character set*, *encoding*) — belgilar va ularning raqamlari. Bu yerda `A` — belgi, `0` — uning kodi, to'rttalasi birga — belgilar to'plami.
- **Collation** — shu belgilarni **solishtirish qoidalari**. Eng oddiy qoida "kodlarni solishtir": 0 < 1, demak A < B. Bunday collation **binary** deyiladi. "Katta va kichik harfni bir xil hisobla" qoidasi qo'shilsa, **case-insensitive** (katta-kichik harfga sezgir bo'lmagan) collation chiqadi.

Hayotda qoidalar ancha ko'p bo'ladi:

- katta-kichik harf farqlanadimi;
- urg'u belgilari farqlanadimi (`e` va `é`);
- bir nechta harf bitta harf hisoblanadimi. Masalan, o'zbek tilida `sh` va `ch` — alohida harflar, ular alifbo oxirida keladi.

### Collation nimalarga ta'sir qiladi

PostgreSQL hujjatiga ko'ra mintaqa (*locale*) va collation quyidagilarni belgilaydi:

- `ORDER BY` dagi tartib va matnlarni `<`, `>`, `=` bilan solishtirish;
- `upper`, `lower`, `initcap` funksiyalari;
- `LIKE`, `SIMILAR TO` va regex: katta-kichik harfsiz qidiruv va belgilar sinflari;
- `to_char` oilasidagi funksiyalar;
- `LIKE` da indeks ishlata olish.

Hujjat bunday narxni ham aytadi: `C` yoki `POSIX` dan boshqa mintaqalar matn bilan ishlashni **sekinlashtiradi** va oddiy indekslarni `LIKE` uchun yaroqsiz qiladi. Shuning uchun mintaqalarni faqat haqiqatan kerak bo'lganda ishlatish tavsiya qilinadi. `LIKE` indekslari 43-bobda ko'riladi.

### PostgreSQL: kodlash

Bazaning kodlashi u yaratilganda tanlanadi (3-bobdagi `initdb -E UTF8`). Mijoz boshqa kodlashda ishlasa, PostgreSQL ko'p kombinatsiyalar uchun **avtomatik o'giradi**. Mijoz kodlashi `SET client_encoding` yoki standart `SET NAMES` bilan beriladi.

### PostgreSQL: mintaqa va provayderlar

Mintaqa sozlamasi bir nechta toifadan iborat:

| Toifa | Nimani belgilaydi |
| --- | --- |
| `LC_COLLATE` | Saralash tartibi |
| `LC_CTYPE` | Belgilar tasnifi: nima harf, uning katta varianti qaysi |
| `LC_MESSAGES` | Xabarlar tili |
| `LC_MONETARY` | Pul formati (6-bob, `money`) |
| `LC_NUMERIC` | Son formati |
| `LC_TIME` | Sana formati |

Muhim cheklov: `LC_COLLATE` va `LC_CTYPE` baza yaratilganda belgilanadi va **keyin o'zgartirib bo'lmaydi**. Ular indekslarning tartibiga ta'sir qiladi. O'zgarsa, matn ustunlaridagi indekslar buzilib qoladi. Lekin alohida ustun yoki ifoda uchun boshqa **collation** tanlash mumkin.

**Provayder** — mintaqa qoidalarini qaysi kutubxona beradi. PostgreSQL 18 da uchta:

| Provayder | Qoidalar manbai | Xususiyati |
| --- | --- | --- |
| `libc` | Operatsion tizimning C kutubxonasi | Hujjat ogohlantiradi: bir xil mintaqa nomi turli platformalarda turlicha ishlashi mumkin |
| `icu` | ICU kutubxonasi | Operatsion tizimga bog'liq emas. Platforma almashganda natija o'zgarmasligi kerak bo'lsa — afzal. Lekin natija ICU versiyasiga bog'liq bo'lishi mumkin |
| `builtin` | PostgreSQL'ning o'zi | Faqat `C`, `C.UTF-8`, `PG_UNICODE_FAST`. Collation faqat kod raqamlari bo'yicha |

### Collation qanday tanlanadi

Hujjatdagi qoidalar:

- har matn ifodasining collation'i bor. Ustunniki — ustun e'lonidan, literalniki — tipning sukut bo'yicha collation'idan;
- `COLLATE` bilan aniq yozilgan collation (**explicit**) boshqalaridan ustun turadi;
- ikki xil **aniq** collation to'qnashsa — xato;
- ikki xil **yashirin** collation to'qnashsa, natija "noaniq" bo'ladi. Collation talab qiladigan amal (masalan, `<`) bo'lsa — xato.

### Deterministik va nondeterministik collation

- **Deterministik** collation ikki satrni faqat **baytlari bir xil** bo'lsa teng deb hisoblaydi. Barcha tayyor collation'lar shunday.
- **Nondeterministik** collation baytlari har xil satrlarni ham teng deb hisoblashi mumkin: katta-kichik harfsiz, urg'usiz yoki turli Unicode normal shakllari.

Hujjatdagi ogohlantirishlar:

- nondeterministik collation **tezlikni pasaytiradi**;
- B-tree indeksi ularda deduplikatsiyani ishlata olmaydi;
- ba'zi amallar, masalan ayrim namuna qidiruvlari, ular bilan ishlamaydi.

Shuning uchun ularni faqat aniq kerak bo'lganda ishlatish tavsiya qilinadi.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/11-2-kod.jpg" src="/video/sql/11-2-kod.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/11-2-kod.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/11-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 psql da jonli sinovlar — SHOW lc_*, deterministic vs nondeterministic collation, upper() va LIKE farqlari.</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. PostgreSQL bazasi `en_US.UTF-8` mintaqasi va `libc` provayderi bilan yaratilgan.

### Joriy sozlamalar

```sql
SHOW server_encoding;
SHOW client_encoding;
SELECT datcollate, datctype, datlocprovider FROM pg_database WHERE datname = current_database();
```

```text
 server_encoding 
-----------------
 UTF8
(1 row)

 client_encoding 
-----------------
 UTF8
(1 row)

 datcollate  |  datctype   | datlocprovider 
-------------+-------------+----------------
 en_US.UTF-8 | en_US.UTF-8 | c
(1 row)
```

`c` — `libc` provayderi. Mavjud collation'lar:

```sql
SELECT count(*) FILTER (WHERE collprovider = 'i') AS icu,
       count(*) FILTER (WHERE collprovider = 'c') AS libc,
       count(*) FILTER (WHERE collprovider = 'b') AS builtin
FROM pg_collation;
SELECT collname FROM pg_collation WHERE collname LIKE 'uz%' ORDER BY 1;
```

```text
 icu | libc | builtin 
-----+------+---------
 908 |  374 |       3
(1 row)

     collname     
------------------
 uz-Arab-AF-x-icu
 uz-Arab-x-icu
 uz-Cyrl-UZ-x-icu
 uz-Cyrl-x-icu
 uz-Latn-UZ-x-icu
 uz-Latn-x-icu
 uz-x-icu
(7 rows)
```

Bu yig'ishda ICU bor va unda o'zbek tili uchun lotin, kirill va arab yozuvidagi collation'lar mavjud.

### O'zbekcha so'zlarni saralash

```sql
CREATE TABLE sozlar (s text);
INSERT INTO sozlar VALUES ('olma'), ('Oʻrik'), ('zarda'), ('shaftoli'), ('sabzi'),
                          ('gʻoz'), ('gilos'), ('choy'), ('Anor'), ('banan');

SELECT string_agg(s, ', ' ORDER BY s COLLATE "C") AS c_tartib FROM sozlar;
SELECT string_agg(s, ', ' ORDER BY s) AS default_en_us FROM sozlar;
SELECT string_agg(s, ', ' ORDER BY s COLLATE "uz-Latn-x-icu") AS uz_icu FROM sozlar;
```

```text
                              c_tartib                               
---------------------------------------------------------------------
 Anor, Oʻrik, banan, choy, gilos, gʻoz, olma, sabzi, shaftoli, zarda
(1 row)

                            default_en_us                            
---------------------------------------------------------------------
 Anor, banan, choy, gilos, gʻoz, olma, Oʻrik, sabzi, shaftoli, zarda
(1 row)

                               uz_icu                                
---------------------------------------------------------------------
 Anor, banan, gilos, olma, sabzi, zarda, Oʻrik, gʻoz, shaftoli, choy
(1 row)
```

Bitta ma'lumot uch xil tartibda chiqdi:

- **`C`** — kod raqamlari bo'yicha. Barcha katta harflar kichiklardan oldin turadi (`Oʻrik` `banan` dan oldin).
- **`en_US`** — ingliz alifbosi bo'yicha. `ch` `c` harfi qatorida, `oʻ` esa `o` qatorida.
- **`uz-Latn-x-icu`** — **o'zbek alifbosi** bo'yicha: `a, b, d, e, f, g, h, i, … x, y, z, oʻ, gʻ, sh, ch, ng`. `Oʻrik`, `gʻoz`, `shaftoli`, `choy` oxirga o'tdi.

O'zbekcha ro'yxatni to'g'ri saralash kerak bo'lsa, aynan shu kerak.

```sql
SELECT 'a' < 'B' AS default_, 'a' < 'B' COLLATE "C" AS c_bilan;
```

```text
 default_ | c_bilan 
----------+---------
 t        | f
(1 row)
```

### Katta-kichik harf funksiyalari

```sql
SELECT upper('oʻzbek'), lower('ISTANBUL'), lower('ISTANBUL' COLLATE "tr-x-icu") AS turk;
```

```text
 upper  |  lower   |   turk   
--------+----------+----------
 OʻZBEK | istanbul | ıstanbul
(1 row)
```

Turk tilida katta `I` ning kichigi nuqtasiz `ı`. Collation ko'rsatilganda `lower()` shu qoidaga amal qildi.

### Katta-kichik harfga sezgir bo'lmagan qidiruv

Hujjatdagi misol bo'yicha nondeterministik collation yaratamiz. `level2` — urg'u farqlanadi, katta-kichik harf esa farqlanmaydi:

```sql
CREATE COLLATION ci (provider = icu, locale = 'und-u-ks-level2', deterministic = false);
SELECT 'Salom' = 'salom' AS oddiy,
       'Salom' = 'salom' COLLATE ci AS ci_bilan,
       'Salom' = 'Sàlom' COLLATE ci AS urgu;
```

```text
 oddiy | ci_bilan | urgu 
-------+----------+------
 f     | t        | f
(1 row)
```

Amaliy foydasi — elektron pochtani katta-kichik harfidan qat'i nazar takrorlanmas qilish:

```sql
CREATE TABLE foydalanuvchilar (email text COLLATE ci UNIQUE);
INSERT INTO foydalanuvchilar VALUES ('Ali@Mail.uz');
INSERT INTO foydalanuvchilar VALUES ('ali@mail.uz');
SELECT * FROM foydalanuvchilar WHERE email LIKE 'ALI%';
```

```text
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "foydalanuvchilar_email_key"
DETAIL:  Key (email)=(ali@mail.uz) already exists.
    email    
-------------
 Ali@Mail.uz
(1 row)
```

PostgreSQL 18 relizi nondeterministik collation'lar bilan `LIKE` ni ham qo'llay boshladi. Shuning uchun oxirgi so'rov ishladi.

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/11-3-dialektlar.jpg" src="/video/sql/11-3-dialektlar.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/11-3-dialektlar.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/11-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: Dialektlar (PostgreSQL vs MySQL vs SQLite) — MySQL 4 darajali collation va utf8mb4_0900_ai_ci, SQLite NOCASE va 6 ta tipik xato.</figcaption>
</figure>

### MySQL

**Kodlash va collation darajalari.** MySQL hujjatiga ko'ra kodlash va collation'ni "istalgan darajada" berish mumkin: server, baza, jadval, ustun. Hatto bitta jadvalda turli kodlashlar aralashishi mumkin. MySQL 9.7 da sukut bo'yicha `utf8mb4` va `utf8mb4_0900_ai_ci`:

```sql
SELECT @@character_set_server, @@collation_server, @@character_set_client,
       @@character_set_connection, @@character_set_results;
```

```text
| utf8mb4 | utf8mb4_0900_ai_ci | utf8mb4 | utf8mb4 | utf8mb4 |
```

**`utf8mb4` va `utf8mb3`.** MySQL'da UTF-8 ikki xil:

- `utf8mb4` — to'liq UTF-8: belgi 4 baytgacha, Unicode'ning barcha belgilari. Hujjat uni MySQL uchun **tavsiya etilgan** to'plam deydi: "barcha yangi ilovalar `utf8mb4` ishlatishi kerak";
- `utf8mb3` — belgi 3 baytgacha, faqat asosiy tekislik (BMP). Emoji kabi qo'shimcha belgilar **saqlanmaydi**. Bu to'plam **eskirgan**.

```sql
CREATE TABLE eski (s VARCHAR(10)) CHARACTER SET utf8mb3;
SHOW WARNINGS;
INSERT INTO eski VALUES ('salom 😀');
```

```text
| Warning | 1287 | 'utf8mb3' is deprecated and will be removed in a future release. Please use utf8mb4 instead |
ERROR 1366 (HY000) at line 10: Incorrect string value: '\xF0\x9F\x98\x80' for column 's' at row 1
```

**`utf8` nomi.** Bu nom hozircha `utf8mb3` ning taxallusi. Sinovda MySQL buni ogohlantirdi va jadvalni `utf8mb3` bilan yaratdi:

```text
| Warning | 3719 | 'utf8' is currently an alias for the character set UTF8MB3, but will be an alias for UTF8MB4 in a future release. Please consider using UTF8MB4 in order to be unambiguous. |
…
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3
```

**Collation nomlari.** Hujjatdagi qo'shimchalar:

| Qo'shimcha | Ma'nosi |
| --- | --- |
| `_ai` / `_as` | Urg'uga sezgir emas / sezgir |
| `_ci` / `_cs` | Katta-kichik harfga sezgir emas / sezgir |
| `_bin` | Binary: belgi kodlari bo'yicha |
| `_0900` | Unicode Collation Algorithm 9.0.0 ga asoslangan |

`_ai`/`_as` yozilmagan bo'lsa, u `_ci`/`_cs` dan kelib chiqadi: `_ci` urg'uga ham sezgir emas, `_cs` esa sezgir degani.

Sukut bo'yicha collation **katta-kichik harfga ham, urg'uga ham** sezgir emas:

```sql
SELECT 'Salom' = 'salom' AS katta_kichik, 'e' = 'é' AS urgu,
       'Salom' = 'salom' COLLATE utf8mb4_bin AS bin_bilan,
       'e' = 'é' COLLATE utf8mb4_0900_as_cs AS as_cs;
```

```text
+--------------+------+-----------+-------+
| katta_kichik | urgu | bin_bilan | as_cs |
+--------------+------+-----------+-------+
|            1 |    1 |         0 |     0 |
+--------------+------+-----------+-------+
```

Bu PostgreSQL'dan **eng katta farqlardan biri**. MySQL'da `WHERE nom = 'salom'` `Salom` ni ham topadi, `UNIQUE` esa `Ali@Mail.uz` va `ali@mail.uz` ni bir xil deb hisoblaydi:

```text
ERROR 1062 (23000) at line 16: Duplicate entry 'ali@mail.uz' for key 'foydalanuvchilar.email'
```

**Til collation'lari.** MySQL'da ba'zi tillar uchun alohida collation bor, masalan `utf8mb4_tr_0900_ai_ci`. Sinovdagi MySQL 9.7 da nomida `uz` bor collation topilmadi. O'zbekcha so'zlar sukut bo'yicha collation bilan:

```sql
SELECT GROUP_CONCAT(s ORDER BY s SEPARATOR ', ') AS sukut FROM sozlar;
```

```text
| Anor, banan, choy, gʻoz, gilos, Oʻrik, olma, sabzi, shaftoli, zarda |
```

`oʻ`, `gʻ`, `sh`, `ch` o'zbek alifbosi bo'yicha joylashmadi.

**Ulanish kodlashi.** Mijoz ulanganda qaysi kodlashda ishlashini aytadi. Server `character_set_client`, `character_set_connection` va `character_set_results` ni shunga moslaydi. Bu `SET NAMES` ga teng. Mijoz kodlashi noto'g'ri bo'lsa, matn bazaga buzilib yoziladi.

### SQLite

**Kodlash.** SQLite bazasi UTF-8, UTF-16LE yoki UTF-16BE da bo'ladi (6-bob):

```sql
PRAGMA encoding;
```

```text
encoding
--------
UTF-8
```

**Collation.** SQLite'da faqat uchta ichki collation bor:

| Collation | Qoidasi |
| --- | --- |
| `BINARY` (sukut bo'yicha) | Baytlar bo'yicha (`memcmp`) |
| `NOCASE` | Faqat ASCII'ning 26 ta katta harfi kichikka aylantiriladi. Hujjatga ko'ra to'liq UTF katta-kichik harf jadvallari hajmi katta bo'lgani uchun qo'llanmaydi |
| `RTRIM` | `BINARY` kabi, lekin oxiridagi probellar e'tiborsiz |

Boshqa collation'larni ilova `sqlite3_create_collation()` orqali qo'shishi mumkin.

```sql
SELECT 'Salom' = 'salom' AS binary_,
       'Salom' = 'salom' COLLATE NOCASE AS nocase,
       'Ölma' = 'ölma' COLLATE NOCASE AS nocase_unicode,
       'ab' = 'ab  ' COLLATE RTRIM AS rtrim;
```

```text
binary_  nocase  nocase_unicode  rtrim
-------  ------  --------------  -----
      0       1               0      1
```

`NOCASE` lotin `S` ni tanidi, `Ö` ni esa tanimadi.

**`upper()` faqat ASCII.** Hujjatga ko'ra `upper()` faqat ASCII harflarini o'zgartiradi:

```sql
SELECT upper('salom') AS ascii, upper('ölma oʻrik') AS unicode, upper('тошкент') AS kirill;
```

```text
ascii   unicode    kirill
-----  ----------  -------
SALOM  öLMA OʻRIK  тошкент
```

`ö` va kirill harflari o'zgarmadi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Sukut bo'yicha kodlash | `initdb` da tanlanadi (bu yerda UTF8) | `utf8mb4` | UTF-8 |
| `'Salom' = 'salom'` | Yolg'on | **Rost** (`_ci`) | Yolg'on (`BINARY`) |
| `'e' = 'é'` | Yolg'on | **Rost** (`_ai`) | Yolg'on |
| Katta-kichik harfsiz solishtirish | Nondeterministik ICU collation | Sukut bo'yicha | `NOCASE` (faqat ASCII) |
| O'zbek alifbosi tartibi | ICU: `uz-Latn-x-icu` | Sinovda topilmadi | Yo'q |
| `upper('ö')` | `Ö` | `Ö` | `ö` (faqat ASCII) |
| Mintaqani keyin o'zgartirish | `LC_COLLATE`/`LC_CTYPE` — yo'q; ustun collation'i — ha | Ustun/jadval darajasida | Ustun darajasida |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| MySQL'da `utf8` yoki `utf8mb3` ishlatish | Emoji va boshqa 4 baytli belgilar saqlanmaydi; to'plam eskirgan | `utf8mb4` |
| MySQL'dan PostgreSQL'ga o'tib, qidiruv katta-kichik harfga sezgir emas deb kutish | PostgreSQL'da `'Salom' ≠ 'salom'` | Nondeterministik collation yoki `lower()` + mos indeks |
| PostgreSQL'dan MySQL'ga o'tib, `UNIQUE` katta-kichik harfni farqlaydi deb kutish | `_ci` collation'da `Ali` va `ali` takroriy hisoblanadi | Kerak bo'lsa `_bin`/`_cs` collation |
| O'zbekcha ro'yxatni sukut bo'yicha collation bilan saralash | `oʻ`, `gʻ`, `sh`, `ch` ingliz alifbosidagi joyiga tushadi | PostgreSQL: `COLLATE "uz-Latn-x-icu"` |
| Bazaning `LC_COLLATE` ini keyin o'zgartirmoqchi bo'lish | Mumkin emas; indekslar shu tartibga bog'liq | Yangi baza yaratish yoki ustun darajasida collation |
| `libc` mintaqali bazani boshqa operatsion tizimga ko'chirish | Bir xil nomli mintaqa boshqacha saralashi mumkin | Hujjat tavsiyasi: platformadan mustaqil natija uchun ICU |
| Hamma joyda nondeterministik collation ishlatish | Sekinroq; ba'zi amallar ishlamaydi | Faqat kerakli ustunlarda |
| SQLite'da `NOCASE` va `upper()` Unicode bilan ishlaydi deb o'ylash | Faqat ASCII | Ilovada ishlov berish yoki ICU kengaytmasi |
| Mijoz kodlashini sozlamaslik | Matn bazaga buzilib yozilishi mumkin | Ulanishda `client_encoding` / `SET NAMES utf8mb4` |

## Amaliyot

1. O'z ism-familiyalar ro'yxatingizni (kamida 10 ta, `Sh`, `Ch`, `Oʻ`, `Gʻ` bilan boshlanadiganlari bilan) PostgreSQL'da `"C"`, sukut bo'yicha va `"uz-Latn-x-icu"` bilan saralang.
2. `uz-Cyrl-x-icu` bilan kirill yozuvidagi so'zlarni saralab ko'ring: `'шафтоли', 'олма', 'ўрик', 'чой', 'анор'`.
3. PostgreSQL'da urg'u farqlanmaydigan collation yarating (hujjatdagi `ignore_accents` misoli) va `'cafe' = 'café'` ni tekshiring.
4. MySQL'da `'Salom' = 'SALOM'` ni `utf8mb4_0900_ai_ci`, `utf8mb4_0900_as_cs` va `utf8mb4_bin` bilan solishtiring.
5. MySQL'da `CREATE TABLE t (s VARCHAR(10)) CHARACTER SET utf8mb4;` ga emoji yozing. Keyin `utf8mb3` bilan takrorlang.
6. SQLite'da `CREATE TABLE t (s TEXT COLLATE NOCASE UNIQUE);` ga `'Ali'` va `'ALI'` ni, keyin `'Ölma'` va `'ölma'` ni yozing. Qaysi juftlik takroriy hisoblandi?

## Rasmiy hujjat

- PostgreSQL — 23.1. Locale Support: <https://www.postgresql.org/docs/18/locale.html>
- PostgreSQL — 23.2. Collation Support: <https://www.postgresql.org/docs/18/collation.html>
- PostgreSQL — 23.3. Character Set Support: <https://www.postgresql.org/docs/18/multibyte.html>
- PostgreSQL — Release 18 (nondeterministik collation va `LIKE`): <https://www.postgresql.org/docs/18/release-18.html>
- MySQL — 12.1 Character Sets and Collations in General: <https://dev.mysql.com/doc/refman/9.7/en/charset-general.html>
- MySQL — 12.3.1 Collation Naming Conventions: <https://dev.mysql.com/doc/refman/9.7/en/charset-collation-names.html>
- MySQL — 12.3.2 Server Character Set and Collation: <https://dev.mysql.com/doc/refman/9.7/en/charset-server.html>
- MySQL — 12.4 Connection Character Sets and Collations: <https://dev.mysql.com/doc/refman/9.7/en/charset-connection.html>
- MySQL — 12.9.1 The utf8mb4 Character Set: <https://dev.mysql.com/doc/refman/9.7/en/charset-unicode-utf8mb4.html>
- MySQL — 12.9.2 The utf8mb3 Character Set: <https://dev.mysql.com/doc/refman/9.7/en/charset-unicode-utf8mb3.html>
- SQLite — Datatypes In SQLite (7. Collating Sequences): <https://www.sqlite.org/datatype3.html#collation>
- SQLite — Core Functions (`upper`, `lower`): <https://www.sqlite.org/lang_corefunc.html>
