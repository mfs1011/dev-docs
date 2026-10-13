# 25 — JOIN'lar

[← Oldingi: Saralash va cheklash](24-saralash-va-cheklash.md) · [Mundarija](README.md) · [Keyingi: Agregatsiya →](26-agregatsiya.md)

## Tushuncha

**JOIN** (birlashtirish) ikki jadvalning qatorlarini bitta natijaga qo'shadi. PostgreSQL hujjati buni "birlashgan jadval" (joined table) deb ataydi: ikki jadval (haqiqiy yoki hosila) tanlangan birlashtirish turi qoidalariga ko'ra bitta jadvalga aylanadi. Natija oddiy jadval kabi `FROM` ichida turadi, unga yana `JOIN` qo'shish mumkin.

Barcha turlarning asosida bitta tushuncha bor: **dekart ko'paytma** (cartesian product). Bu birinchi jadvalning har qatori ikkinchi jadvalning har qatori bilan juftlangan to'plam: N × M qator. Qolgan turlar shu ko'paytmadan qatorlarni tanlaydi yoki unga qator qo'shadi.

### Turlar

| Yozuv | Natija |
| --- | --- |
| `T1 CROSS JOIN T2` | Dekart ko'paytma: har juftlik |
| `T1 [INNER] JOIN T2 ON shart` | Ko'paytmadan faqat shart rost bo'lgan juftliklar |
| `T1 LEFT [OUTER] JOIN T2 ON shart` | `INNER` natijasi + `T1` ning juftsiz qatorlari (`T2` ustunlari `NULL`) |
| `T1 RIGHT [OUTER] JOIN T2 ON shart` | `INNER` natijasi + `T2` ning juftsiz qatorlari (`T1` ustunlari `NULL`) |
| `T1 FULL [OUTER] JOIN T2 ON shart` | `INNER` natijasi + ikkala tomonning juftsiz qatorlari |

`INNER` va `OUTER` so'zlari ixtiyoriy. Hujjatga ko'ra `JOIN` yolg'iz yozilsa `INNER` tushuniladi; `LEFT`, `RIGHT`, `FULL` esa tashqi (outer) birlashtirishni bildiradi.

**Tashqi birlashtirish** (outer join) — juftini topmagan qatorlarni ham natijada qoldiradigan birlashtirish. Yetishmagan tomonning ustunlari `NULL` bilan to'ldiriladi.

PostgreSQL hujjatidagi tengliklar:

- `FROM T1 CROSS JOIN T2` = `FROM T1 INNER JOIN T2 ON TRUE` = `FROM T1, T2`;
- ya'ni vergul ham `CROSS JOIN`. Faqat bitta farq bor: `JOIN` vergulga qaraganda **qattiqroq bog'lanadi** (avval bajariladi). Bu quyida, "Dialektlar"da muhim bo'ladi.

### Birlashtirish sharti: `ON`, `USING`, `NATURAL`

- **`ON ifoda`** — `WHERE` dagi kabi har qanday mantiqiy ifoda. Ikki qator shu ifoda rost bo'lsa "juft" hisoblanadi.
- **`USING (a, b, …)`** — qisqa yozuv: ikkala jadvalda bir xil nomli ustunlar tengligi. `USING (a, b)` = `ON T1.a = T2.a AND T1.b = T2.b`. Hujjatga ko'ra farqi: natijada bu ustunlar **bir marta** chiqadi (`ON` da ikkalasi ham chiqadi).
- **`NATURAL`** — `USING` ning avtomatik shakli: ikkala jadvalda **bir xil nomli barcha** ustunlar bo'yicha birlashtiradi. Umumiy ustun bo'lmasa — `CROSS JOIN` kabi ishlaydi.

PostgreSQL hujjati `NATURAL` haqida ogohlantiradi: `USING` nisbatan xavfsiz, chunki faqat ko'rsatilgan ustunlar ishlatiladi. `NATURAL` esa xavfliroq — sxemada ikkala jadvalga bir xil nomli yangi ustun qo'shilsa, birlashtirish sharti **jimgina** o'zgaradi.

### `ON` va `WHERE` farqi

Ichki birlashtirishda shartni `ON` ga yozish bilan `WHERE` ga yozish natijani o'zgartirmaydi. Tashqi birlashtirishda esa farq katta. Hujjatga ko'ra:

- `ON` dagi shart **birlashtirishdan oldin** qo'llanadi: u "qaysi qator juft" ekanini aniqlaydi. Juft topilmasa ham chap qator `NULL` lar bilan qoladi;
- `WHERE` dagi shart **birlashtirishdan keyin** qo'llanadi: `NULL` li qatorlar ham shu filtrdan o'tishi kerak.

### `LATERAL`

Oddiy holatda `FROM` dagi ichki so'rov (subquery) mustaqil hisoblanadi va boshqa `FROM` elementlariga murojaat qila olmaydi. **`LATERAL`** kalit so'zi buni ruxsat beradi: ichki so'rov o'zidan **oldingi** `FROM` elementlarining ustunlarini ishlata oladi.

Hujjatga ko'ra bajarilish tartibi: chap tomonning **har bir qatori** uchun `LATERAL` qismi shu qatorning qiymatlari bilan hisoblanadi, chiqqan qatorlar shu qator bilan birlashtiriladi.

Tipik ishlatilishi — "har guruh uchun eng yaxshi N ta". `LEFT JOIN LATERAL … ON true` ayniqsa qulay: ichki so'rov hech narsa qaytarmasa ham chap qator natijada qoladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadvallar PostgreSQL hujjatidagi misoldan olingan:

```sql
CREATE TABLE t1 (num int, name varchar(10));
CREATE TABLE t2 (num int, value varchar(10));
INSERT INTO t1 VALUES (1,'a'), (2,'b'), (3,'c');
INSERT INTO t2 VALUES (1,'xxx'), (3,'yyy'), (5,'zzz');
```

`t1` da 2 juftsiz, `t2` da 5 juftsiz. Natijalar PostgreSQL'dan.

### `CROSS JOIN`

```sql
SELECT * FROM t1 CROSS JOIN t2 ORDER BY t1.num, t2.num;
```

```text
 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   1 | a    |   3 | yyy
   1 | a    |   5 | zzz
   2 | b    |   1 | xxx
   2 | b    |   3 | yyy
   2 | b    |   5 | zzz
   3 | c    |   1 | xxx
   3 | c    |   3 | yyy
   3 | c    |   5 | zzz
(9 rows)
```

3 × 3 = 9 qator. Qolgan barcha turlar shu jadvaldan boshlanadi.

### `INNER JOIN`: `ON`, `USING`, `NATURAL`

```sql
SELECT * FROM t1 INNER JOIN t2 ON t1.num = t2.num;
SELECT * FROM t1 INNER JOIN t2 USING (num);
SELECT * FROM t1 NATURAL INNER JOIN t2;
```

```text
 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   3 | c    |   3 | yyy
(2 rows)

 num | name | value 
-----+------+-------
   1 | a    | xxx
   3 | c    | yyy
(2 rows)

 num | name | value 
-----+------+-------
   1 | a    | xxx
   3 | c    | yyy
(2 rows)
```

Qatorlar bir xil. Farq ustunlarda: `ON` da `num` ikki marta, `USING` va `NATURAL` da bir marta. Bu yerda `NATURAL` ham `num` bo'yicha birlashtirdi, chunki umumiy nomli ustun faqat shu.

### `LEFT`, `RIGHT`, `FULL`

```sql
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num ORDER BY t1.num;
SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num ORDER BY t2.num;
SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num ORDER BY t1.num, t2.num;
```

```text
 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   2 | b    |     | 
   3 | c    |   3 | yyy
(3 rows)

 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   3 | c    |   3 | yyy
     |      |   5 | zzz
(3 rows)

 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   2 | b    |     | 
   3 | c    |   3 | yyy
     |      |   5 | zzz
(4 rows)
```

- `LEFT`: `t1` ning hamma qatori; `2 b` ning jufti yo'q, o'ng tomoni bo'sh (`NULL`).
- `RIGHT`: `t2` ning hamma qatori; `5 zzz` ning chap tomoni bo'sh.
- `FULL`: ikkalasi ham.

`FULL JOIN … USING` da birlashtiruvchi ustun ikki tomonning birlashgan qiymati bo'ladi (SQLite hujjati buni aniq yozadi: `coalesce(lhs.X, rhs.X)`):

```sql
SELECT * FROM t1 FULL JOIN t2 USING (num) ORDER BY num;
```

```text
 num | name | value 
-----+------+-------
   1 | a    | xxx
   2 | b    | 
   3 | c    | yyy
   5 |      | zzz
(4 rows)
```

### `ON` va `WHERE`: tashqi birlashtirishda farq

Hujjatdagi misol. Bir xil shart, ikki joyda:

```sql
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num AND t2.value = 'xxx' ORDER BY t1.num;
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num WHERE t2.value = 'xxx';
```

```text
 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
   2 | b    |     | 
   3 | c    |     | 
(3 rows)

 num | name | num | value 
-----+------+-----+-------
   1 | a    |   1 | xxx
(1 row)
```

- Birinchisida `value = 'xxx'` juftlikni tanlaydi. `3 c` ning `yyy` jufti shartga mos kelmadi, lekin `LEFT` bo'lgani uchun `3 c` o'zi qoldi.
- Ikkinchisida avval to'liq `LEFT JOIN` bo'ldi, keyin `WHERE` `NULL` va `yyy` li qatorlarni olib tashladi. Natija `INNER JOIN` bilan bir xil.

### Juftsiz qatorlarni topish

`LEFT JOIN` + `WHERE o'ng.kalit IS NULL` — "`t2` da jufti yo'q `t1` qatorlari":

```sql
SELECT t1.* FROM t1 LEFT JOIN t2 ON t1.num = t2.num WHERE t2.num IS NULL;
```

```text
 num | name 
-----+------
   2 | b
(1 row)
```

Bu yerda `WHERE` ataylab birlashtirishdan keyin ishlaydi: faqat `NULL` bilan to'ldirilgan qatorlar qoladi. Shart o'ng jadvalning `NOT NULL` ustuniga (masalan, birlamchi kalitga) qo'yilishi kerak — aks holda haqiqiy `NULL` qiymatli qator ham "juftsiz" bo'lib ko'rinadi.

### `LATERAL`: har guruhdan eng yuqori 2 ta

```sql
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',78);

SELECT g.nom, t.ism, t.ball
FROM guruhlar g
LEFT JOIN LATERAL (
    SELECT b.ism, b.ball FROM baholar b
    WHERE b.guruh_id = g.id
    ORDER BY b.ball DESC
    LIMIT 2
) AS t ON true
ORDER BY g.nom, t.ball DESC;
```

```text
 nom |   ism   | ball 
-----+---------+------
 A   | Sobir   |   90
 A   | Ali     |   85
 B   | Vali    |   92
 B   | Dilnoza |   88
 C   |         |     
(5 rows)
```

Ichki so'rov `g.id` ni ishlatadi — har guruh uchun alohida hisoblanadi. `C` guruhida talaba yo'q, lekin `LEFT JOIN … ON true` tufayli u natijada qoldi.

`LATERAL` siz xuddi shu so'rov xato beradi va PostgreSQL o'zi yo'l ko'rsatadi:

```sql
SELECT g.nom, t.ism
FROM guruhlar g
JOIN (SELECT ism FROM baholar b WHERE b.guruh_id = g.id) AS t ON true;
```

```text
ERROR:  invalid reference to FROM-clause entry for table "g"
DETAIL:  There is an entry for table "g", but it cannot be referenced from this part of the query.
HINT:  To reference that table, you must mark this subquery with LATERAL.
```

PostgreSQL'da `FROM` dagi **jadval funksiyalari** uchun `LATERAL` ixtiyoriy: hujjatga ko'ra funksiya argumentlari oldingi `FROM` elementlariga har holda murojaat qila oladi.

### Vergul va `JOIN` aralashsa

```sql
SELECT * FROM t1, t2 JOIN t2 AS t3 ON t1.num = t3.num;
```

```text
ERROR:  invalid reference to FROM-clause entry for table "t1"
DETAIL:  There is an entry for table "t1", but it cannot be referenced from this part of the query.
```

`JOIN` vergulga qaraganda qattiqroq bog'lanadi: avval `t2 JOIN t3 ON …` hisoblanadi, uning ichida `t1` hali ko'rinmaydi.

## Dialektlar

### MySQL

**`JOIN`, `CROSS JOIN`, `INNER JOIN` — bir xil.** MySQL hujjatiga ko'ra ular MySQL'da sintaktik jihatdan teng va bir-birining o'rnini bosadi. Standartda esa teng emas: `INNER JOIN` `ON` bilan, `CROSS JOIN` usiz ishlatiladi. Shuning uchun MySQL `ON` siz `JOIN` ni ham qabul qiladi va dekart ko'paytma beradi. PostgreSQL esa xato beradi:

```sql
SELECT count(*) FROM t1 JOIN t2;
```

```text
-- MySQL               -- PostgreSQL
+----------+           ERROR:  syntax error at or near ";"
| count(*) |
+----------+
|        9 |
+----------+
```

**`FULL JOIN` yo'q.** MySQL'ning `JOIN` sintaksisida `FULL` yo'q. Xavfli tomoni: `FULL` MySQL'da **zahiralangan so'z emas** (`information_schema.keywords` da `RESERVED = 0`). Shuning uchun `t1 FULL JOIN t2` xato bermasdan **`t1 AS FULL` va oddiy `JOIN`** deb o'qiladi:

```sql
SELECT * FROM t1 FULL JOIN t2 ON t1.num = t2.num;
SELECT FULL.* FROM t1 FULL JOIN t2 USING (num);
```

```text
ERROR 1054 (42S22) at line 13: Unknown column 't1.num' in 'on clause'
+------+------+
| num  | name |
+------+------+
|    1 | a    |
|    3 | c    |
+------+------+
```

Birinchisida `t1` endi `FULL` deb nomlangan, shuning uchun `t1.num` topilmadi. Ikkinchisi umuman xatosiz ishladi — lekin bu **ichki** birlashtirish, `FULL` emas. `USING` bilan yozilgan "`FULL JOIN`" MySQL'da jimgina noto'g'ri natija beradi.

`FULL` natijasini MySQL'da `LEFT` va `RIGHT` natijalarini `UNION` (28-bob) bilan qo'shib olish mumkin. Bu hujjatdagi retsept emas, ikki standart amalning birikmasi; sinovda to'g'ri natija berdi:

```sql
SELECT * FROM t1 LEFT JOIN t2 ON t1.num = t2.num
UNION
SELECT * FROM t1 RIGHT JOIN t2 ON t1.num = t2.num;
```

```text
+------+------+------+-------+
| num  | name | num  | value |
+------+------+------+-------+
|    1 | a    |    1 | xxx   |
|    2 | b    | NULL | NULL  |
|    3 | c    |    3 | yyy   |
| NULL | NULL |    5 | zzz   |
+------+------+------+-------+
```

`UNION` takror qatorlarni olib tashlaydi. Agar jadvallarda o'zi takror qatorlar bo'lsa, ular ham yo'qoladi — shuni hisobga olish kerak.

**`RIGHT JOIN` o'rniga `LEFT JOIN`.** MySQL hujjati ko'chirish qulayligi uchun `RIGHT JOIN` o'rniga `LEFT JOIN` ishlatishni tavsiya qiladi. `T1 RIGHT JOIN T2` = `T2 LEFT JOIN T1`.

**Vergul ustuvorligi.** MySQL'da ham vergul `JOIN` dan past turadi. Hujjat aynan shu xato matnini keltiradi: `Unknown column 'col_name' in 'on clause'`. Yechim — vergulli qismni qavsga olish:

```sql
SELECT * FROM t1, t2 JOIN t2 AS t3 ON t1.num = t3.num;
SELECT * FROM (t1, t2) JOIN t2 AS t3 ON t1.num = t3.num;
```

```text
ERROR 1054 (42S22) at line 8: Unknown column 't1.num' in 'on clause'
+------+------+------+-------+------+-------+
| num  | name | num  | value | num  | value |
+------+------+------+-------+------+-------+
|    3 | c    |    1 | xxx   |    3 | yyy   |
|    1 | a    |    1 | xxx   |    1 | xxx   |
…
```

(Ikkinchi natijada `ORDER BY` yo'q — tartib kafolatlanmaydi.)

**`LATERAL` bor.** MySQL hujjatida "Lateral Derived Tables" bo'limi bor; yuqoridagi `LEFT JOIN LATERAL (…) AS t ON true` misoli MySQL 9.7 da ham xuddi shu natijani berdi. Hujjatdagi cheklovlar:

- `LATERAL` faqat `FROM` da: vergulli ro'yxatda yoki `JOIN`, `INNER JOIN`, `CROSS JOIN`, `LEFT [OUTER] JOIN`, `RIGHT [OUTER] JOIN` ichida;
- `LATERAL` qism o'ng tomonda turib chap tomonga murojaat qilsa — faqat `INNER`, `CROSS` yoki `LEFT` bo'lishi mumkin;
- `JSON_TABLE()` kabi jadval funksiyalari doim `LATERAL` kabi ishlaydi, shuning uchun ular oldiga `LATERAL` yozish **taqiqlangan**.

### SQLite

**`RIGHT` va `FULL` bor.** SQLite'ning `join-operator` sintaksisida `LEFT`, `RIGHT`, `FULL`, `INNER`, `CROSS`, `NATURAL` hammasi bor. Natijalar PostgreSQL bilan bir xil. Faqat ko'rinish farqi: SQLite `NULL` ni saralashda boshiga qo'yadi (24-bob), shuning uchun `FULL JOIN … ORDER BY t1.num` da `5 zzz` qatori **birinchi** chiqdi.

**`INNER JOIN`, `JOIN`, vergul — bir xil; `CROSS JOIN` alohida.** SQLite hujjatiga ko'ra birinchi uchtasi to'liq almashinuvchan. `CROSS JOIN` ham xuddi shu natijani beradi, lekin so'rov optimizatoriga jadvallar tartibini **o'zgartirishni taqiqlaydi**. Ya'ni SQLite'da `CROSS JOIN` — optimizatorni qo'lda boshqarish vositasi. Hujjat buni faqat shunday maxsus holatlarda va loyiha boshida emas, kerak bo'lganda ishlatishni maslahat beradi.

**Erkin sintaksis.** SQLite hujjatining "Deviations From Standard SQL" bo'limiga ko'ra:

- `ON` yoki `USING` ni **har qanday** birlashtirishdan tushirib qoldirish mumkin. Tashqi birlashtirishda bu `ON true` kabi ishlaydi va natija ichki birlashtirishga aylanadi;
- vergul va `CROSS JOIN` ga ham `ON`/`USING` qo'shish mumkin;
- kalit so'zlar istalgan tartibda: `LEFT RIGHT JOIN` = `FULL JOIN`. Hujjat: "ishlatish mumkin, lekin kerak emas" — boshqa tizimlar buni tushunmaydi.

```sql
SELECT count(*) FROM t1 LEFT JOIN t2;
SELECT count(*) FROM t1, t2 ON t1.num = t2.num;
```

```text
9
2
```

Faqat ikki cheklov qolgan: `NATURAL` ga `ON`/`USING` qo'shib bo'lmaydi va bitta birlashtirishda `ON` bilan `USING` birga bo'lmaydi.

**Vergul ustuvorligi boshqacha.** Standartda `JOIN` vergulga qaraganda oldin bajariladi. SQLite'da esa hujjatga ko'ra **barcha birlashtirishlar bir xil ustuvorlikda va chapdan o'ngga** bajariladi. Shuning uchun PostgreSQL va MySQL xato bergan so'rov SQLite'da ishlaydi:

```sql
SELECT * FROM t1, t2 JOIN t2 AS t3 ON t1.num = t3.num;
```

```text
1|a|1|xxx|1|xxx
1|a|3|yyy|1|xxx
1|a|5|zzz|1|xxx
3|c|1|xxx|3|yyy
3|c|3|yyy|3|yyy
3|c|5|zzz|3|yyy
```

Ichki birlashtirishlarda bu farq natijaga ta'sir qilmaydi. Tashqi birlashtirish aralashsa natija o'zgarishi mumkin. SQLite hujjati ko'chiriladigan kod uchun uchta qoida beradi (biri yetarli):

- vergul va `JOIN` ni aralashtirmang — vergul ishlatsangiz, butun `FROM` da faqat vergul;
- tashqi birlashtirishlardan `LEFT JOIN` ni afzal ko'ring;
- shubha bo'lsa — tartibni qavs bilan ko'rsating.

**`LATERAL` yo'q.** `LATERAL` SQLite kalit so'zlari ro'yxatida yo'q va sintaksisda ham yo'q:

```sql
SELECT * FROM t1 LEFT JOIN LATERAL (SELECT 1) x ON true;
```

```text
Parse error near line 8: near "SELECT": syntax error
  SELECT * FROM t1 LEFT JOIN LATERAL (SELECT 1) x ON true;
                        error here ---^
```

"Har guruhdan N ta" vazifasi SQLite'da window funksiyalari (31-bob) bilan yechiladi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `INNER`, `LEFT`, `RIGHT`, `CROSS` | Ha | Ha | Ha |
| `FULL [OUTER] JOIN` | Ha | **Yo'q** (`FULL` alias bo'lib qoladi) | Ha |
| `NATURAL`, `USING` | Ha | Ha | Ha |
| `ON` siz `JOIN` | Xato | Dekart ko'paytma | Dekart ko'paytma (tashqida ham) |
| `JOIN` verguldan oldin bajariladi | Ha | Ha | Yo'q, chapdan o'ngga |
| `CROSS JOIN` ning maxsus ma'nosi | Yo'q | Yo'q | Optimizator tartibni o'zgartirmaydi |
| `LATERAL` | Ha | Ha | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `LEFT JOIN` dan keyin o'ng jadval shartini `WHERE` ga yozish | `NULL` li qatorlar tushib qoladi, natija `INNER JOIN` ga aylanadi | Juftlik shartini `ON` ga yozish |
| Shartsiz birlashtirish (MySQL/SQLite'da `ON` unutilgan) | Xato bermaydi, N × M qator qaytadi | Har `JOIN` ga `ON`/`USING`; ataylab bo'lsa `CROSS JOIN` |
| MySQL'da `FULL JOIN` yozish | Xato yoki jimgina ichki birlashtirish | `LEFT … UNION … RIGHT` |
| `NATURAL JOIN` ishlatish | Yangi bir xil nomli ustun (masalan, `created_at`) shartni jimgina o'zgartiradi | `USING (ustun)` yoki `ON` |
| Vergul va `JOIN` ni aralashtirish | PG/MySQL'da `ON` da ustun ko'rinmaydi; SQLite'da tartib boshqacha | Faqat `JOIN` sintaksisi |
| Juftsiz qatorlarni `NULL` bo'lishi mumkin ustun bilan qidirish | Haqiqiy `NULL` qiymatli qator ham "juftsiz" chiqadi | `WHERE o'ng.birlamchi_kalit IS NULL` |
| Bir-ko'p birlashtirishdan keyin `count`/`sum` | "Ko'p" tomon qatorlari ko'payadi, yig'indi ortib ketadi | Avval agregatsiya (26-bob), keyin birlashtirish |

## Amaliyot

1. `t1` va `t2` uchun `CROSS`, `INNER`, `LEFT`, `RIGHT`, `FULL` natijalarini qatorlar soni bo'yicha oldindan hisoblang, keyin uchala tizimda tekshiring.
2. `t2` ga `name` ustuni qo'shing (`ALTER TABLE`, 16-bob). `NATURAL JOIN` natijasi qanday o'zgardi? `USING (num)` nimani berdi?
3. "`t2` da bor, `t1` da yo'q" qatorlarni `RIGHT JOIN` bilan, keyin `LEFT JOIN` bilan (jadvallar o'rnini almashtirib) toping.
4. MySQL'da `SELECT * FROM t1 FULL JOIN t2 USING (num);` ni ishga tushiring. Nega xato chiqmadi va natija nima?
5. PostgreSQL'da `LATERAL` bilan har guruhning eng past balli bitta talabasini toping; talabasi yo'q guruh ham natijada qolsin.

## Rasmiy hujjat

- PostgreSQL — 7.2.1. The FROM Clause (Joined Tables, LATERAL Subqueries): <https://www.postgresql.org/docs/18/queries-table-expressions.html>
- MySQL — 15.2.13.2 JOIN Clause: <https://dev.mysql.com/doc/refman/9.7/en/join.html>
- MySQL — 15.2.15.9 Lateral Derived Tables: <https://dev.mysql.com/doc/refman/9.7/en/lateral-derived-tables.html>
- SQLite — SELECT (FROM clause processing, Special handling of CROSS JOIN, Deviations From Standard SQL): <https://www.sqlite.org/lang_select.html>
- SQLite — SQLite Keywords: <https://www.sqlite.org/lang_keywords.html>
