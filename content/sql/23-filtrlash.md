# 23 — Filtrlash

[← Oldingi: SELECT anatomiyasi](22-select-anatomiyasi.md) · [Mundarija](README.md) · [Keyingi: Saralash va cheklash →](24-saralash-va-cheklash.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/23-1-tushuncha.jpg">
    <source src="/video/sql/23-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/23-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/23-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>23.1-video. WHERE bandi va uch qiymatli mantiq asoslari</figcaption>
</figure>

`WHERE` qatorlarni **shart** bo'yicha tanlaydi. 10-bobdan ma'lumki, `WHERE` faqat shart **rost** bo'lgan qatorlarni oladi. Shart yolg'on yoki `NULL` bo'lsa, qator tashlanadi. Bu bobda shartning asosiy "qurilish bloklari" ko'riladi:

### Taqqoslash va `BETWEEN`

Oddiy operatorlar: `=`, `<>` (yoki `!=`), `<`, `>`, `<=`, `>=`.

`a BETWEEN x AND y` — PostgreSQL hujjatiga ko'ra `a >= x AND a <= y` ga teng. Chegaralar **kiradi**. Ikki variant ham bor:

- `NOT BETWEEN` — oraliqdan tashqari;
- `BETWEEN SYMMETRIC` (PostgreSQL) — chap qiymat o'ngdagidan katta bo'lsa, ular o'rni almashtiriladi.

`BETWEEN` ichidagi `AND` mantiqiy `AND` bilan adashib ketmasligi uchun ikkinchi argumentga ruxsat etilgan ifodalar cheklangan. Murakkab ifoda bo'lsa, qavsga olinadi.

### `IN` va `NOT IN`

`x IN (a, b, c)` — `x = a OR x = b OR x = c` ning qisqa yozuvi. `x NOT IN (a, b, c)` esa `x <> a AND x <> b AND x <> c`.

Hujjat bu yerda `NULL` bilan bog'liq tuzoqni alohida ta'kidlaydi:

> Ro'yxatda **kamida bitta `NULL`** bo'lsa va teng qiymat topilmasa, `IN` natijasi `false` emas, **`NULL`** bo'ladi. `NOT IN` natijasi ham, "kutilganidek" `true` emas, `NULL` bo'ladi.

Natijada `WHERE x NOT IN (…, NULL)` **hech qachon** qator qaytarmaydi. Bu 27-bobda subquery bilan yana uchraydi.

### `IS DISTINCT FROM`

`<>` `NULL` bilan `NULL` beradi (10-bob). `a IS DISTINCT FROM b` esa `NULL` ni oddiy qiymat deb hisoblaydi. "Toshkent bo'lmaganlar, shahri noma'lumlar ham" degan so'rov uchun aynan shu kerak.

### Namuna bo'yicha qidiruv

PostgreSQL'da uch xil usul bor:

| Usul | Qayerdan | Xususiyati |
| --- | --- | --- |
| `LIKE` | An'anaviy SQL | `%` — istalgan uzunlikdagi belgilar ketma-ketligi (nol ham), `_` — bitta istalgan belgi |
| `SIMILAR TO` | SQL:1999 | Hujjatga ko'ra `LIKE` va POSIX regex'ning "g'alati aralashmasi" |
| `~`, `~*`, `!~`, `!~*` | POSIX regex | Eng kuchli usul |

**`LIKE` qoidalari** (hujjat bo'yicha):

- namuna **butun satrga** mos kelishi kerak. Satr ichida qidirish uchun boshida va oxirida `%` bo'ladi: `'%so'z%'`;
- `%` va `_` ni oddiy belgi sifatida qidirish uchun ularning oldiga **escape** belgisi qo'yiladi. Sukut bo'yicha bu teskari chiziq: `'%\_%'`. Standartga ko'ra esa `ESCAPE` yozilmasa, escape belgisi bo'lmasligi kerak. PostgreSQL bu borada "biroz nostandart";
- **`ILIKE`** — joriy mintaqa bo'yicha katta-kichik harfga sezgir emas. PostgreSQL kengaytmasi.

**Regex.** `~` katta-kichik harfga sezgir, `~*` sezgir emas. `LIKE` dan farqli o'laroq regex satrning **istalgan joyida** mos kelishi mumkin, agar `^` va `$` bilan bog'lanmagan bo'lsa.

**Xavfsizlik ogohlantirishi.** Hujjatga ko'ra ba'zi regex'lar juda ko'p vaqt va xotira talab qiladigan qilib tuzilishi mumkin. Shuning uchun **ishonchsiz manbadan** (masalan, foydalanuvchidan) kelgan regex va `SIMILAR TO` namunalari bilan ehtiyot bo'lish kerak. Zarur bo'lsa, `statement_timeout` qo'yiladi. `LIKE` ancha sodda, shuning uchun bunday namunalar uchun xavfsizroq.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/23-2-kod.jpg">
    <source src="/video/sql/23-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/23-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/23-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>23.2-video. PostgreSQL 18: BETWEEN SYMMETRIC, NOT IN va IS DISTINCT FROM</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan:

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, ism text, telefon text, shahar text, yosh int);
INSERT INTO mijozlar VALUES
    (1,'Ali','+998901234567','Toshkent',25),
    (2,'aliya','+998935550011','Samarqand',31),
    (3,'Vali','998-90-111-22-33','Toshkent',NULL),
    (4,'Sobir_2','+998977770000',NULL,40),
    (5,'Dilnoza','+79161234567','Buxoro',19);
```

### `BETWEEN`

```sql
SELECT id, ism FROM mijozlar WHERE yosh BETWEEN 25 AND 31;
SELECT id FROM mijozlar WHERE yosh BETWEEN 31 AND 25;
SELECT id FROM mijozlar WHERE yosh BETWEEN SYMMETRIC 31 AND 25;
```

```text
 id |  ism  
----+-------
  1 | Ali
  2 | aliya
(2 rows)

 id 
----
(0 rows)

 id 
----
  1
  2
(2 rows)
```

- 25 va 31 chegaralari kirdi.
- Chegaralar teskari yozilganda oddiy `BETWEEN` hech narsa topmadi: "`yosh >= 31 AND yosh <= 25`" bo'lishi mumkin emas.
- `SYMMETRIC` chegaralarni o'zi tartibladi.

### `IN` va `NOT IN` dagi `NULL`

```sql
SELECT id, shahar FROM mijozlar WHERE shahar IN ('Toshkent', 'Buxoro');
SELECT id, shahar FROM mijozlar WHERE shahar NOT IN ('Toshkent', NULL);
```

```text
 id |  shahar  
----+----------
  1 | Toshkent
  3 | Toshkent
  5 | Buxoro
(3 rows)

 id | shahar 
----+--------
(0 rows)
```

`NOT IN` ro'yxatidagi bitta `NULL` hamma qatorni yo'qotdi. Samarqand uchun shart: `'Samarqand' <> 'Toshkent' AND 'Samarqand' <> NULL` = `true AND NULL` = `NULL`.

### `LIKE`, `ILIKE` va escape

```sql
SELECT id, ism FROM mijozlar WHERE ism LIKE 'Ali%';
SELECT id, ism FROM mijozlar WHERE ism ILIKE 'ali%';
```

```text
 id | ism 
----+-----
  1 | Ali
(1 row)

 id |  ism  
----+-------
  1 | Ali
  2 | aliya
(2 rows)
```

Ismida pastki chiziq bor mijozni qidiramiz:

```sql
SELECT id, ism FROM mijozlar WHERE ism LIKE '%_%';
SELECT id, ism FROM mijozlar WHERE ism LIKE '%\_%';
```

```text
 id |   ism   
----+---------
  1 | Ali
  2 | aliya
  3 | Vali
  4 | Sobir_2
  5 | Dilnoza
(5 rows)

 id |   ism   
----+---------
  4 | Sobir_2
(1 row)
```

Birinchi so'rovda `_` "istalgan bitta belgi" bo'ldi va hamma qator chiqdi. `\_` esa haqiqiy pastki chiziqni qidirdi.

### Regex va `SIMILAR TO`

O'zbekiston mobil raqamlari: `+998`, keyin `9` va yana bir raqam, keyin 7 ta raqam.

```sql
SELECT id, telefon FROM mijozlar WHERE telefon ~ '^\+998(9[0-9])[0-9]{7}$';
SELECT id, telefon FROM mijozlar WHERE telefon SIMILAR TO '\+998[0-9]{9}';
```

```text
 id |    telefon    
----+---------------
  1 | +998901234567
  2 | +998935550011
  4 | +998977770000
(3 rows)
```

Ikkala so'rov bir xil natija berdi. Regex'da satr boshi va oxiri `^` va `$` bilan aniq bog'landi. `SIMILAR TO` esa `LIKE` kabi doim butun satrni tekshiradi.

### `IS DISTINCT FROM`

```sql
SELECT id, shahar FROM mijozlar WHERE shahar IS DISTINCT FROM 'Toshkent';
SELECT id, shahar FROM mijozlar WHERE shahar <> 'Toshkent';
```

```text
 id |  shahar   
----+-----------
  2 | Samarqand
  4 | 
  5 | Buxoro
(3 rows)

 id |  shahar   
----+-----------
  2 | Samarqand
  5 | Buxoro
(2 rows)
```

Shahri noma'lum 4-mijoz faqat `IS DISTINCT FROM` bilan chiqdi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/23-3-dialektlar.jpg">
    <source src="/video/sql/23-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/23-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/23-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>23.3-video. MySQL va SQLite da filtrlash o'ziga xosliklari</figcaption>
</figure>

### MySQL

**`LIKE` va collation.** MySQL'da `LIKE` ustun collation'iga bo'ysunadi. Sukut bo'yicha `utf8mb4_0900_ai_ci` katta-kichik harfni farqlamaydi (11-bob). Shuning uchun `LIKE` ham farqlamaydi:

```sql
SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%';
SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%' COLLATE utf8mb4_bin;
```

```text
+----+-------+
| id | ism   |
+----+-------+
|  1 | Ali   |
|  2 | aliya |
+----+-------+
+----+-------+
| id | ism   |
+----+-------+
|  2 | aliya |
+----+-------+
```

Bir xil `LIKE 'ali%'` PostgreSQL'da faqat `aliya` ni, MySQL'da ikkalasini topdi.

**`ILIKE` yo'q:**

```text
ERROR 1064 (42000) at line 5: … near 'ILIKE 'ali%'' at line 1
```

**Oxiridagi probellar.** Hujjatga ko'ra `LIKE` belgilarni bittalab solishtiradi, shuning uchun oxiridagi probellar **doim ahamiyatli**. `=` da esa bu collation'ning pad atributiga bog'liq (7-bob).

**Regex.** MySQL'da `REGEXP` (yoki `RLIKE`) operatori va `REGEXP_LIKE()`, `REGEXP_INSTR()`, `REGEXP_REPLACE()`, `REGEXP_SUBSTR()` funksiyalari bor. Ular ICU kutubxonasiga asoslangan. Satr ichidagi teskari chiziqni MySQL o'zi qayta ishlaydi (4-bob), shuning uchun regex'da u **ikki marta** yoziladi: `'\\+'`.

```sql
SELECT id, telefon FROM mijozlar WHERE telefon REGEXP '^\\+998(9[0-9])[0-9]{7}$';
```

```text
+----+---------------+
| id | telefon       |
+----+---------------+
|  1 | +998901234567 |
|  2 | +998935550011 |
|  4 | +998977770000 |
+----+---------------+
```

**`IS DISTINCT FROM` yo'q.** Uning o'rnida NULL-xavfsiz tenglik `<=>` bor. "Teng emas" uchun `NOT (a <=> b)` yoziladi:

```sql
SELECT id, shahar FROM mijozlar WHERE NOT (shahar <=> 'Toshkent');
SELECT id FROM mijozlar WHERE shahar IS DISTINCT FROM 'Toshkent';
```

```text
+----+-----------+
| id | shahar    |
+----+-----------+
|  2 | Samarqand |
|  4 | NULL      |
|  5 | Buxoro    |
+----+-----------+
ERROR 1064 (42000) at line 9: … near 'DISTINCT FROM 'Toshkent'' at line 1
```

### SQLite

**`LIKE` faqat ASCII uchun katta-kichik harfga sezgir emas.** Hujjatga ko'ra `'a' LIKE 'A'` rost, lekin `'æ' LIKE 'Æ'` yolg'on. To'liq Unicode uchun ICU kengaytmasi kerak.

```text
SQLite-3.54 memory-> SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%';
1|Ali
2|aliya
SQLite-3.54 memory-> SELECT id, ism FROM mijozlar WHERE ism LIKE 'ölma';
SQLite-3.54 memory-> SELECT id, ism FROM mijozlar WHERE ism GLOB 'A*';
1|Ali
```

`'Ölma'` qatori `'ölma'` ga mos kelmadi.

`PRAGMA case_sensitive_like = ON` `LIKE` ni katta-kichik harfga sezgir qiladi:

```text
SQLite-3.54 memory-> PRAGMA case_sensitive_like = ON;
SQLite-3.54 memory-> SELECT id, ism FROM mijozlar WHERE ism LIKE 'ali%';
2|aliya
```

**Escape belgisi sukut bo'yicha yo'q.** Hujjatga ko'ra u faqat `ESCAPE` bilan beriladi. Shuning uchun PostgreSQL'dagi `'%\_%'` SQLite'da boshqa ma'no beradi, ya'ni teskari chiziqning o'zini qidiradi:

```text
SQLite-3.54 memory-> SELECT 'Sobir_2' LIKE '%\_%', 'Sobir_2' LIKE '%!_%' ESCAPE '!';
0|1
```

**`GLOB`** — Unix fayl nomlari uslubidagi namuna: `*` va `?`. Katta-kichik harfga **sezgir**.

**`REGEXP`.** SQLite hujjatiga ko'ra `REGEXP` operatori `regexp()` funksiyasining maxsus yozuvi. Bu funksiya kutubxonada **sukut bo'yicha yo'q**, shuning uchun `REGEXP` odatda xato beradi. Ilova o'z `regexp()` funksiyasini qo'shishi mumkin. `sqlite3` dasturining o'zida esa POSIX regex kengaytmasi bor, shuning uchun u yerda ishladi:

```text
SQLite-3.54 memory-> SELECT id, telefon FROM mijozlar WHERE telefon REGEXP '^\+998';
1|+998901234567
2|+998935550011
```

Ilovada ishlatiladigan SQLite kutubxonasida esa bu so'rov xato berishi mumkin.

**`IS NOT`.** SQLite'da `IS DISTINCT FROM` ham, uning qisqa ko'rinishi `IS NOT` ham ishlaydi:

```text
SQLite-3.54 memory-> SELECT id FROM mijozlar WHERE shahar IS NOT 'Toshkent';
2
3
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `LIKE` katta-kichik harf | Sezgir | Collation'ga bog'liq (sukut bo'yicha sezgir emas) | ASCII uchun sezgir emas |
| Katta-kichik harfsiz `LIKE` | `ILIKE` | Sukut bo'yicha shunday | Sukut bo'yicha (faqat ASCII) |
| Regex | `~`, `~*`, `SIMILAR TO`, `regexp_*` | `REGEXP`, `REGEXP_LIKE()` (ICU) | `REGEXP` — faqat `regexp()` qo'shilganda (CLI'da bor) |
| `BETWEEN SYMMETRIC` | Ha | Yo'q | Yo'q |
| `IS DISTINCT FROM` | Ha | Yo'q (`<=>`) | Ha, `IS NOT` ham |
| `GLOB` | Yo'q | Yo'q | Ha |
| `LIKE` escape sukut bo'yicha | `\` | `\` | Yo'q (`ESCAPE` bilan beriladi) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `NOT IN (…)` ro'yxatida `NULL` | Hech qanday qator qaytmaydi | `NULL` ni ro'yxatdan olib tashlash yoki `NOT EXISTS` (27-bob) |
| `WHERE ustun <> 'x'` bilan "x bo'lmaganlar" | `NULL` qatorlar tushib qoladi | `IS DISTINCT FROM` / MySQL'da `NOT (a <=> 'x')` |
| `BETWEEN` chegaralarini teskari yozish | Bo'sh natija, xato yo'q | Kichigini birinchi yozish |
| Sanalarda `BETWEEN '2026-10-01' AND '2026-10-31'` (`timestamp` ustunda) | 31-oktabrning 00:00 dan keyingi vaqtlari tushib qoladi | `>= '2026-10-01' AND < '2026-11-01'` |
| `LIKE` da `_` va `%` ni oddiy belgi deb o'ylash | Ortiqcha qatorlar chiqadi | Escape: `'\_'`, `'\%'` |
| PostgreSQL'dan MySQL'ga o'tganda `LIKE` katta-kichik harfga sezgir deb o'ylash | MySQL'da sukut bo'yicha sezgir emas | Kerak bo'lsa, `COLLATE utf8mb4_bin` |
| Foydalanuvchi kiritgan regex'ni to'g'ridan-to'g'ri ishlatish | Hujjat ogohlantiradi: ba'zi namunalar vaqt va xotirani tugatishi mumkin | `LIKE`, cheklangan namunalar, `statement_timeout` |
| SQLite'da `REGEXP` ishlaydi deb o'ylash (CLI'da sinab) | Kutubxonada `regexp()` sukut bo'yicha yo'q | Ilovada funksiyani ro'yxatdan o'tkazish |
| `LIKE '%so'z%'` ni katta jadvalda tez deb kutish | Oddiy indeks boshidagi `%` bilan ishlatilmaydi | To'liq matnli qidiruv yoki `pg_trgm` (49-bob) |

## Amaliyot

1. 25 yoshdan 35 yoshgacha bo'lgan, shahri Toshkent yoki Samarqand bo'lgan mijozlarni toping. Shartni `IN` va `BETWEEN` bilan yozing.
2. `WHERE shahar NOT IN ('Toshkent')` va `WHERE shahar NOT IN ('Toshkent', NULL)` natijalarini solishtiring va farqni haqiqat jadvali bilan tushuntiring.
3. Ismi `a` harfi bilan tugaydigan mijozlarni `LIKE` bilan toping. Keyin katta-kichik harfga e'tibor bermasdan qidiring (`ILIKE`, MySQL collation, SQLite).
4. Telefon raqamlaridan faqat `+998 9X XXX XX XX` formatidagi (probellar bilan) raqamlarni topadigan regex yozing. Uni PostgreSQL va MySQL'da sinang. Teskari chiziqlar soniga e'tibor bering.
5. `timestamp` ustunli jadvalda oktabr oyidagi yozuvlarni `BETWEEN` bilan va `>= … AND < …` bilan tanlang. 31-oktabr 15:00 dagi yozuv qaysi birida chiqadi?

## Rasmiy hujjat

- PostgreSQL — 9.2. Comparison Functions and Operators (`BETWEEN`, `IS DISTINCT FROM`): <https://www.postgresql.org/docs/18/functions-comparison.html>
- PostgreSQL — 9.7. Pattern Matching (`LIKE`, `SIMILAR TO`, POSIX regex): <https://www.postgresql.org/docs/18/functions-matching.html>
- PostgreSQL — 9.25. Row and Array Comparisons (`IN`, `NOT IN`): <https://www.postgresql.org/docs/18/functions-comparisons.html>
- MySQL — 14.4.2 Comparison Functions and Operators: <https://dev.mysql.com/doc/refman/9.7/en/comparison-operators.html>
- MySQL — 14.8.1 String Comparison Functions and Operators (`LIKE`): <https://dev.mysql.com/doc/refman/9.7/en/string-comparison-functions.html>
- MySQL — 14.8.2 Regular Expressions: <https://dev.mysql.com/doc/refman/9.7/en/regexp.html>
- SQLite — SQL Language Expressions (`LIKE`, `GLOB`, `REGEXP`): <https://www.sqlite.org/lang_expr.html>
- SQLite — PRAGMA `case_sensitive_like`: <https://www.sqlite.org/pragma.html#pragma_case_sensitive_like>
- SQLite — Command Line Shell (qo'shimcha funksiyalar): <https://www.sqlite.org/cli.html>
