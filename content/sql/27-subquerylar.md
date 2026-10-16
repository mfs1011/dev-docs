# 27 — Subquery'lar

[← Oldingi: Agregatsiya](26-agregatsiya.md) · [Mundarija](README.md) · [Keyingi: Set amallari →](28-set-amallari.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/27-1-tushuncha.jpg">
    <source src="/video/sql/27-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/27-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/27-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>27.1-video. Subquery tushunchasi, shakllari va skalyar qoidalari</figcaption>
</figure>

**Subquery** (ichki so'rov) — boshqa so'rov ichida qavsga olingan `SELECT`. MySQL hujjati ta'rifi: "boshqa operator ichidagi `SELECT`". Tashqaridagisi — **tashqi so'rov** (outer query).

Natijasining shakliga ko'ra MySQL hujjati to'rt turni ajratadi:

| Tur | Qaytaradi | Qayerda |
| --- | --- | --- |
| Skalyar (scalar) | Bitta qiymat: 1 qator, 1 ustun | Oddiy qiymat turishi mumkin bo'lgan deyarli hamma joyda |
| Ustun (column) | Bitta ustun, ko'p qator | `IN`, `ANY`, `ALL` ning o'ng tomoni |
| Qator (row) | Bitta qator, ko'p ustun | Qator taqqoslash: `(a, b) = (SELECT …)` |
| Jadval (table) | Ko'p qator, ko'p ustun | `FROM` ichida, `EXISTS`, `IN` (qator bilan) |

### Skalyar subquery

PostgreSQL hujjatiga ko'ra skalyar subquery **aynan bitta qator va bitta ustun** qaytarishi kerak:

- bir nechta qator yoki ustun qaytarsa — **xato**;
- hech qanday qator qaytarmasa — xato emas, natija **`NULL`**.

### Korrelyatsiyalangan subquery

Subquery tashqi so'rov ustunlariga murojaat qilsa, u **korrelyatsiyalangan** (correlated, "bog'langan") deyiladi. SQLite hujjatiga ko'ra bunday subquery natija kerak bo'lgan har safar **qayta hisoblanadi**; bog'lanmagan subquery esa bir marta hisoblanib, natijasi qayta ishlatiladi. PostgreSQL hujjati: tashqi so'rov ustunlari subquery'ning bitta bajarilishi davomida **o'zgarmas** (konstanta) kabi ishlaydi.

### `EXISTS`

`EXISTS (subquery)` — subquery **kamida bitta qator** qaytarsa `true`, aks holda `false`. Hujjatga ko'ra qatorlarning mazmuni ahamiyatsiz, shuning uchun odatda `EXISTS (SELECT 1 FROM … WHERE …)` deb yoziladi. Subquery odatda birinchi qator topilguncha bajariladi, oxirigacha emas.

PostgreSQL hujjatining kuzatuvi: `EXISTS` ichki birlashtirishga (`INNER JOIN`) o'xshaydi, lekin har tashqi qator uchun **ko'pi bilan bitta** natija qatori beradi — ichkarida bir nechta mos qator bo'lsa ham.

`EXISTS` faqat `true` yoki `false` beradi, hech qachon `NULL` emas.

### `IN`, `ANY`/`SOME`, `ALL`

- `x IN (subquery)` — subquery natijasida `x` ga teng qiymat bo'lsa `true`;
- `x op ANY (subquery)` — hech bo'lmasa bitta qator uchun `x op qiymat` rost bo'lsa `true`. `SOME` — `ANY` ning sinonimi;
- `x op ALL (subquery)` — **barcha** qatorlar uchun rost bo'lsa `true`. Subquery bo'sh bo'lsa ham `true`.

PostgreSQL hujjatidagi tengliklar: `IN` = `= ANY`, `NOT IN` = `<> ALL`.

### `NOT IN` va `NULL` tuzog'i

23-bobda ro'yxat bilan ko'rgan qoida subquery'da ham amal qiladi. PostgreSQL hujjatiga ko'ra: teng qiymat topilmasa va o'ng tomonda **kamida bitta `NULL`** bo'lsa, `NOT IN` natijasi `true` emas, **`NULL`**. Sabab — `NOT IN` = `<> ALL`: `x <> NULL` noma'lum, demak "hammasidan farqli" ekanini isbotlab bo'lmaydi.

Subquery'da bu ayniqsa xavfli: ro'yxat ko'zga ko'rinmaydi, `NULL` esa jadvalga istalgan paytda tushishi mumkin. `NOT EXISTS` bu muammodan xoli — u `NULL` bermaydi.

### `FROM` dagi subquery (derived table)

`FROM` ichidagi subquery — **hosila jadval** (derived table). U oddiy jadval kabi ishlatiladi. Asosiy foydasi: agregat ustidan agregat yoki guruhlangan natija bilan birlashtirish. MySQL hujjatidagi misol: `AVG(SUM(x))` ishlamaydi, lekin ichkarida `SUM`, tashqarida `AVG` ishlaydi.

**Alias.** PostgreSQL hujjatiga ko'ra SQL standarti hosila jadvalga nom (alias) berishni **talab qiladi**. PostgreSQL uni tushirib qoldirishga ruxsat beradi, lekin hujjat boshqa tizimga ko'chirilishi mumkin bo'lgan kodda alias yozishni tavsiya qiladi.

Hosila jadval o'zidan oldingi `FROM` elementlariga murojaat qila olmaydi — buning uchun `LATERAL` (25-bob).

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/27-2-kod.jpg">
    <source src="/video/sql/27-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/27-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/27-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>27.2-video. PostgreSQL 18: Amaliy subquery so'rovlari va tahlil</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadvallar 26-bobdagidek:

```sql
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);
```

Natijalar PostgreSQL'dan; farqlar "Dialektlar"da.

### Skalyar subquery

O'rtachadan yuqori ball olganlar (`avg` = 85, 26-bob):

```sql
SELECT ism, ball FROM baholar
WHERE ball > (SELECT avg(ball) FROM baholar)
ORDER BY ball DESC;
```

```text
   ism   | ball 
---------+------
 Vali    |   92
 Sobir   |   90
 Dilnoza |   88
(3 rows)
```

Subquery bir marta hisoblanadi — tashqi so'rovga bog'liq emas.

Bir nechta qator yoki ustun — xato; qator yo'q — `NULL`:

```sql
SELECT (SELECT ism FROM baholar WHERE guruh_id = 1) AS ism;
SELECT (SELECT ism, ball FROM baholar WHERE id = 1) AS x;
SELECT (SELECT ism FROM baholar WHERE id = 99) AS yoq;
```

```text
ERROR:  more than one row returned by a subquery used as an expression
ERROR:  subquery must return only one column
 yoq 
-----
 
(1 row)
```

### Korrelyatsiyalangan subquery

`SELECT` ro'yxatida — har guruhning eng yuqori bali (PostgreSQL hujjatidagi "har shtatning eng katta shahri" misoli kabi):

```sql
SELECT nom,
       (SELECT max(b.ball) FROM baholar b WHERE b.guruh_id = g.id) AS eng_yuqori
FROM guruhlar g ORDER BY nom;
```

```text
 nom | eng_yuqori 
-----+------------
 A   |         90
 B   |         92
 C   |           
(3 rows)
```

`WHERE` da — o'z guruhidagi eng yuqori ballni olganlar:

```sql
SELECT ism, ball FROM baholar b
WHERE ball = (SELECT max(ball) FROM baholar b2 WHERE b2.guruh_id = b.guruh_id)
ORDER BY ism;
```

```text
  ism  | ball 
-------+------
 Sobir |   90
 Vali  |   92
(2 rows)
```

`b.guruh_id` — tashqi so'rov ustuni; subquery har qator uchun shu qiymat bilan hisoblanadi. `Jasur` (guruhi `NULL`) chiqmadi: `b2.guruh_id = NULL` hech qachon rost emas, subquery `NULL` qaytaradi, `70 = NULL` esa `NULL`.

### `EXISTS` va `IN`

Talabasi bor guruhlar:

```sql
SELECT nom FROM guruhlar g
WHERE EXISTS (SELECT 1 FROM baholar b WHERE b.guruh_id = g.id)
ORDER BY nom;

SELECT nom FROM guruhlar
WHERE id IN (SELECT guruh_id FROM baholar)
ORDER BY nom;
```

```text
 nom 
-----
 A
 B
(2 rows)

 nom 
-----
 A
 B
(2 rows)
```

`A` guruhida uch talaba bor, lekin natijada **bir marta**. `JOIN` bilan yozilsa, `A` uch marta chiqardi.

### `NOT IN` va `NULL` tuzog'i

Teskari savol — talabasi **yo'q** guruhlar. Javob `C` bo'lishi kerak:

```sql
SELECT nom FROM guruhlar WHERE id NOT IN (SELECT guruh_id FROM baholar);
SELECT nom FROM guruhlar g WHERE NOT EXISTS (SELECT 1 FROM baholar b WHERE b.guruh_id = g.id);
SELECT nom FROM guruhlar WHERE id NOT IN (SELECT guruh_id FROM baholar WHERE guruh_id IS NOT NULL);
```

```text
 nom 
-----
(0 rows)

 nom 
-----
 C
(1 row)

 nom 
-----
 C
(1 row)
```

`NOT IN` **hech narsa** qaytarmadi: `baholar` da `Jasur` ning `guruh_id` si `NULL`. `C` uchun shart: `3 <> 1 AND 3 <> 2 AND … AND 3 <> NULL` = `NULL`. Xato ham, ogohlantirish ham yo'q — natija shunchaki bo'sh. Uchala tizimda bir xil.

`NOT EXISTS` to'g'ri javob berdi. `NOT IN` ni saqlash kerak bo'lsa — subquery'da `NULL` ni aniq filtrlash.

### `ANY` va `ALL`

```sql
-- A guruhining har bir balidan yuqori
SELECT ism, ball FROM baholar
WHERE ball > ALL (SELECT ball FROM baholar WHERE guruh_id = 1 AND ball IS NOT NULL);

-- xuddi shu, lekin NULL filtrlanmagan
SELECT ism, ball FROM baholar
WHERE ball > ALL (SELECT ball FROM baholar WHERE guruh_id = 1);

-- B guruhining hech bo'lmasa bitta balidan past
SELECT ism, ball FROM baholar
WHERE ball < ANY (SELECT ball FROM baholar WHERE guruh_id = 2)
ORDER BY ism;
```

```text
 ism  | ball 
------+------
 Vali |   92
(1 row)

 ism | ball 
-----+------
(0 rows)

   ism   | ball 
---------+------
 Ali     |   85
 Dilnoza |   88
 Jasur   |   70
 Sobir   |   90
(4 rows)
```

Ikkinchi so'rov — `ALL` dagi xuddi shu `NULL` tuzog'i: `A` guruhida `Malika` ning bali `NULL`. Hujjatga ko'ra hech bir taqqoslash `false` bo'lmasa, lekin bittasi `NULL` bo'lsa, `ALL` natijasi `NULL`. `Vali` uchun: `92 > 85` rost, `92 > 90` rost, `92 > NULL` noma'lum → `NULL`.

`< ANY (88, 92)` = "92 dan kichik" — 92 ning o'zidan boshqa hamma.

### Hosila jadval

Guruhlardagi talabalar sonining o'rtachasi — agregat ustidan agregat:

```sql
SELECT avg(soni)
FROM (SELECT guruh_id, count(*) AS soni FROM baholar GROUP BY guruh_id) AS t;
```

```text
        avg         
--------------------
 2.0000000000000000
(1 row)
```

Guruhlar: `1` — 3, `2` — 2, `NULL` — 1; (3 + 2 + 1) / 3 = 2. PostgreSQL `AS t` siz ham ishladi (standartdan chetga chiqish, hujjatda yozilgan).

### Subquery'da `LIMIT` va o'zgartirilayotgan jadval

```sql
SELECT ism FROM baholar
WHERE id IN (SELECT id FROM baholar WHERE ball IS NOT NULL ORDER BY ball DESC LIMIT 2)
ORDER BY ism;

UPDATE baholar SET ball = (SELECT max(ball) FROM baholar) WHERE id = 5;
```

```text
  ism  
-------
 Sobir
 Vali
(2 rows)

UPDATE 1
```

PostgreSQL'da ikkalasi ham ishlaydi. MySQL'da ikkalasi ham xato — quyida.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/27-3-dialektlar.jpg">
    <source src="/video/sql/27-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/27-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/27-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>27.3-video. MySQL va SQLite da subquery farqlari va cheklovlari</figcaption>
</figure>

### MySQL

MySQL hujjatiga ko'ra standart talab qiladigan barcha subquery shakllari qo'llab-quvvatlanadi. Asosiy so'rovlarning natijalari PostgreSQL bilan bir xil (`NOT IN` tuzog'i ham). Farqlar — cheklovlar va xato matnlarida.

**Xato kodlari.** MySQL hujjatining "Subquery Errors" bo'limidagi kodlar:

```text
ERROR 1242 (21000) at line 16: Subquery returns more than 1 row
ERROR 1241 (21000) at line 17: Operand should contain 1 column(s)
```

1242 uchun hujjat yechimi: subquery bir nechta qator qaytarishi mumkin bo'lsa, `=` o'rniga `= ANY`.

**Hosila jadvalga alias majburiy.** Hujjatga ko'ra `FROM` dagi har jadvalning nomi bo'lishi kerak:

```sql
SELECT avg(soni) FROM (SELECT guruh_id, count(*) AS soni FROM baholar GROUP BY guruh_id);
```

```text
ERROR 1248 (42000) at line 20: Every derived table must have its own alias
```

**`IN`/`ANY`/`ALL` subquery'da `LIMIT` yo'q.** Hujjat aynan shu xatoni keltiradi:

```text
ERROR 1235 (42000) at line 21: This version of MySQL doesn't yet support 'LIMIT & IN/ALL/ANY/SOME subquery'
```

Cheklov faqat shu operatorlarga tegishli. `LIMIT` li so'rovni hosila jadvalga o'rab, `IN` ichida ishlatish mumkin — sinovda ishladi:

```sql
SELECT ism FROM baholar
WHERE id IN (SELECT id FROM (SELECT id FROM baholar WHERE ball IS NOT NULL
                              ORDER BY ball DESC LIMIT 2) AS t)
ORDER BY ism;
```

```text
+-------+
| ism   |
+-------+
| Sobir |
| Vali  |
+-------+
```

**O'zgartirilayotgan jadvaldan o'qib bo'lmaydi.** Hujjatga ko'ra umuman olganda `UPDATE`/`DELETE`/`INSERT` qilinayotgan jadvaldan subquery'da o'qib bo'lmaydi:

```text
ERROR 1093 (HY000) at line 22: You can't specify target table 'baholar' for update in FROM clause
```

Hujjatdagi istisno: jadval **hosila jadval** orqali o'qilsa va u **materializatsiya** qilinsa (vaqtinchalik jadvalga yozilsa), ruxsat. Shunda qatorlar o'zgartirishdan oldin tanlab bo'lingan bo'ladi:

```sql
UPDATE baholar SET ball = (SELECT m FROM (SELECT max(ball) AS m FROM baholar) AS t) WHERE id = 5;
```

```text
+--------+------+
| ism    | ball |
+--------+------+
| Malika |   92 |
+--------+------+
```

Hujjatga ko'ra optimizator hosila jadvalni tashqi so'rovga "qo'shib yuborishi" (merge) ham mumkin; materializatsiyaga `NO_MERGE` optimizator ishorasi (hint) bilan ta'sir qilish mumkin. Hujjatdagi boshqa yo'l — CTE (29-bob).

**Qator taqqoslash qisman.** Hujjatga ko'ra `(a, b) [NOT] IN (subquery)` ishlaydi, lekin `(a, b) op ANY/ALL (subquery)` — yo'q: `ANY`/`ALL` faqat bitta ustunli subquery bilan.

### SQLite

**`ANY`, `SOME`, `ALL` yo'q.** SQLite ifoda sintaksisida subquery bilan faqat `IN`, `NOT IN`, `EXISTS` va skalyar subquery bor:

```text
Parse error near line 13: near "ALL": syntax error
  SELECT ism, ball FROM baholar WHERE ball > ALL (SELECT ball FROM baholar WHERE
                               error here ---^
Parse error near line 15: near "SELECT": syntax error
  SELECT ism, ball FROM baholar WHERE ball < ANY (SELECT ball FROM baholar WHERE
                                    error here ---^
```

O'rniga agregat bilan: `> ALL (…)` → `> (SELECT max(…) …)`, `< ANY (…)` → `< (SELECT max(…) …)`. Diqqat: bu `NULL` va bo'sh to'plamda boshqacha ishlaydi. `max` `NULL` larni tashlaydi (`ALL` esa `NULL` beradi), bo'sh to'plamda esa `NULL` qaytaradi (`ALL` esa `true`).

**Skalyar subquery ko'p qator qaytarsa — xato yo'q.** SQLite hujjatiga ko'ra subquery ifodasining qiymati — natijaning **birinchi qatori**:

```sql
SELECT (SELECT ism FROM baholar WHERE guruh_id = 1) AS ism;
```

```text
ism
---
Ali
```

PostgreSQL va MySQL xato bergan so'rov SQLite'da jimgina "qaysidir" qiymat qaytardi. `ORDER BY` siz qaysi qator birinchi ekani kafolatlanmagan. Ko'p ustun esa SQLite'da ham xato:

```text
Parse error near line 17: sub-select returns 2 columns - expected 1
```

Hujjatga ko'ra ko'p ustunli subquery — "qator qiymati" (row value) subquery'si; u faqat taqqoslash operandi yoki `UPDATE … SET (a, b) = (SELECT …)` da ishlatiladi.

**Hosila jadvalga alias shart emas** — `AS t` siz ham ishladi. `IN` ichida `LIMIT` va o'zgartirilayotgan jadvaldan o'qish SQLite'da PostgreSQL kabi ishladi.

**`IN` ning o'ng tomoni — jadval nomi.** SQLite hujjatiga ko'ra `x IN jadval` yozuvi `x IN (SELECT * FROM jadval)` deb tushuniladi. Bu kengaytma, boshqa tizimlarda yo'q.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Skalyar: ko'p qator | Xato | Xato 1242 | **Birinchi qator** |
| Skalyar: qator yo'q | `NULL` | `NULL` | `NULL` |
| `EXISTS`, `IN`, `NOT IN` | Ha | Ha | Ha |
| `ANY`/`SOME`/`ALL` | Ha | Ha (faqat bitta ustun) | Yo'q |
| `NOT IN` + `NULL` → bo'sh natija | Ha | Ha | Ha |
| Hosila jadval alias | Ixtiyoriy | Majburiy (1248) | Ixtiyoriy |
| `IN (… LIMIT n)` | Ha | Yo'q (1235) | Ha |
| O'zgartirilayotgan jadvaldan o'qish | Ha | Yo'q (1093), hosila jadval orqali | Ha |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `NOT IN (SELECT ustun …)`, ustun `NULL` bo'lishi mumkin | Bitta `NULL` bilan natija jimgina bo'sh | `NOT EXISTS` yoki subquery'da `WHERE ustun IS NOT NULL` |
| `> ALL (…)` da `NULL` ni unutish | Hech qanday qator qaytmaydi | `NULL` ni filtrlash |
| `= (SELECT …)` ko'p qator qaytarishi mumkin bo'lganda | PG/MySQL'da xato, SQLite'da tasodifiy qiymat | `IN` / `= ANY`, yoki subquery'ni bitta qatorga cheklash |
| "Bor-yo'qligi"ni `JOIN` bilan tekshirish | Ko'p mos qatorda tashqi qator takrorlanadi | `EXISTS` |
| Hosila jadvalga alias bermaslik | MySQL'da xato; standartga zid | Doim `AS nom` |
| `IN (… LIMIT n)` ni MySQL'ga ko'chirish | Xato 1235 | Hosila jadvalga o'rash yoki `JOIN` |
| MySQL'da `UPDATE t … (SELECT … FROM t)` | Xato 1093 | Hosila jadval yoki CTE orqali |
| SQLite'da `ANY`/`ALL` | Sintaksis xatosi | `max`/`min` subquery (`NULL` farqini hisobga olib) |

## Amaliyot

1. Eng yuqori ballni olgan talaba(lar)ni skalyar subquery bilan toping.
2. Har talaba yonida uning guruhining o'rtacha balini korrelyatsiyalangan subquery bilan chiqaring.
3. Talabasi yo'q guruhlarni uch xil usulda toping: `NOT IN`, `NOT EXISTS`, `LEFT JOIN … IS NULL` (25-bob). `baholar` ga yana bitta `guruh_id = NULL` qator qo'shib, qaysi usul buzilganini tekshiring.
4. PostgreSQL'da `> ALL (…)` bilan yozilgan so'rovni SQLite uchun `max` bilan qayta yozing. Subquery bo'sh bo'lganda natijalar qanday farq qiladi?
5. MySQL'da `UPDATE baholar SET ball = ball + 1 WHERE ball < (SELECT avg(ball) FROM baholar);` ni ishga tushiring. Xatoni hosila jadval bilan tuzating.

## Rasmiy hujjat

- PostgreSQL — 9.24. Subquery Expressions: <https://www.postgresql.org/docs/18/functions-subquery.html>
- PostgreSQL — 4.2.11. Scalar Subqueries: <https://www.postgresql.org/docs/18/sql-expressions.html#SQL-SYNTAX-SCALAR-SUBQUERIES>
- PostgreSQL — 7.2.1.3. Subqueries (`FROM` ichida): <https://www.postgresql.org/docs/18/queries-table-expressions.html>
- MySQL — 15.2.15 Subqueries: <https://dev.mysql.com/doc/refman/9.7/en/subqueries.html>
- MySQL — 15.2.15.8 Derived Tables: <https://dev.mysql.com/doc/refman/9.7/en/derived-tables.html>
- MySQL — 15.2.15.10 Subquery Errors: <https://dev.mysql.com/doc/refman/9.7/en/subquery-errors.html>
- MySQL — 15.2.15.12 Restrictions on Subqueries: <https://dev.mysql.com/doc/refman/9.7/en/subquery-restrictions.html>
- SQLite — SQL Language Expressions (IN, EXISTS, Subquery Expressions, Correlated Subqueries): <https://www.sqlite.org/lang_expr.html>
