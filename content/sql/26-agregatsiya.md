# 26 — Agregatsiya

[← Oldingi: JOIN'lar](25-joinlar.md) · [Mundarija](README.md) · [Keyingi: Subquery'lar →](27-subquerylar.md)

## Tushuncha

**Agregat funksiya** (aggregate function) ko'p qatordan bitta qiymat hisoblaydi: yig'indi, o'rtacha, eng katta, soni. PostgreSQL hujjati shunday ta'riflaydi: agregat funksiya ko'p kirish qiymatini bitta chiqish qiymatiga "qisqartiradi".

| Funksiya | Natija |
| --- | --- |
| `count(*)` | Qatorlar soni |
| `count(x)` | `x` `NULL` bo'lmagan qatorlar soni |
| `count(DISTINCT x)` | `x` ning `NULL` bo'lmagan turli qiymatlari soni |
| `sum(x)`, `avg(x)` | Yig'indi, o'rtacha |
| `min(x)`, `max(x)` | Eng kichik, eng katta |

**`NULL` qoidasi.** PostgreSQL hujjatiga ko'ra o'rnatilgan agregatlarning ko'pchiligi `NULL` kirishlarni **tashlab yuboradi**. MySQL hujjati ham shuni aytadi. `count(*)` bundan mustasno — u qatorlarni sanaydi, qiymatlarni emas.

**Bo'sh to'plam.** PostgreSQL hujjati alohida ogohlantiradi: `count` dan boshqa funksiyalar qator bo'lmasa `NULL` qaytaradi. Xususan, hech qanday qatorning `sum` i **`NULL`, nol emas**. Nol kerak bo'lsa — `coalesce(sum(x), 0)`.

### `GROUP BY`

`GROUP BY` ko'rsatilgan ustunlarda qiymatlari **bir xil** bo'lgan qatorlarni bitta **guruh qatori**ga birlashtiradi. Agregatlar har guruh uchun alohida hisoblanadi. Hujjatga ko'ra ustunlar tartibi ahamiyatsiz.

Asosiy qoida (PostgreSQL hujjati): jadval guruhlangan bo'lsa, `GROUP BY` da yo'q ustunlarga faqat agregat ifoda ichida murojaat qilish mumkin. Sababi: guruhda bunday ustunning **bitta** qiymati yo'q — qaysi birini ko'rsatish kerakligi noma'lum.

**Funksional bog'liqlik** (functional dependency) bu qoidadan istisno. Agar guruhlangan ustun birlamchi kalit bo'lsa, shu jadvalning boshqa ustunlari unga **bog'liq**: kalit qiymati bitta qatorni aniqlaydi, demak ustun qiymati ham bitta. PostgreSQL hujjatidagi misolda `GROUP BY product_id` yetarli, `p.name` va `p.price` ni qo'shish shart emas — `product_id` birlamchi kalit bo'lsa.

Agregat bor, lekin `GROUP BY` yo'q bo'lsa — butun natija **bitta guruh**. Hujjatga ko'ra bu holda bitta qator qaytadi (yoki `HAVING` uni olib tashlasa, hech narsa).

### `HAVING`

`HAVING` — guruhlar uchun `WHERE`. U guruhlash va agregatlardan **keyin** ishlaydi, shuning uchun agregatni ishlata oladi. `WHERE` esa guruhlashdan oldin ishlaydi (22-bob). PostgreSQL hujjatiga ko'ra agregat ifoda faqat `SELECT` ro'yxatida yoki `HAVING` da turishi mumkin, `WHERE` da emas.

- `WHERE` — qaysi **qatorlar** guruhlarga kiradi;
- `HAVING` — qaysi **guruhlar** natijaga chiqadi.

### Agregat ichidagi qo'shimchalar

PostgreSQL hujjatidagi agregat ifoda sintaksisi:

```sql
agregat (ifoda [, …] [ORDER BY …]) [FILTER (WHERE shart)]
agregat (DISTINCT ifoda [, …] [ORDER BY …]) [FILTER (WHERE shart)]
agregat (*) [FILTER (WHERE shart)]
agregat ([ifoda [, …]]) WITHIN GROUP (ORDER BY …) [FILTER (WHERE shart)]
```

- **`ORDER BY` agregat ichida** — kirish qatorlari tartibi. `min` uchun tartib ahamiyatsiz, lekin `string_agg`, `array_agg` natijasi tartibga bog'liq. Hujjatga ko'ra tartib sukut bo'yicha **aniqlanmagan**. Ko'p argumentli agregatda `ORDER BY` **oxirgi argumentdan keyin** yoziladi: `string_agg(a, ',' ORDER BY a)`.
- **`FILTER (WHERE …)`** — agregatga faqat shart rost bo'lgan qatorlar beriladi. Bitta so'rovda turli shartli hisoblar olish mumkin.
- **`WITHIN GROUP (ORDER BY …)`** — **tartiblangan to'plam agregatlari** (ordered-set aggregates) uchun. Ular tartibsiz ma'noga ega emas: masalan, `percentile_cont(0.5)` — mediana. Qavsdagi `0.5` — "to'g'ridan-to'g'ri argument": hujjatga ko'ra u qator uchun emas, bir marta hisoblanadi.

### `GROUPING SETS`, `ROLLUP`, `CUBE`

Bir so'rovda bir nechta darajada guruhlash. PostgreSQL hujjatiga ko'ra:

- `GROUPING SETS ((a), (b), ())` — avval `a` bo'yicha, keyin `b` bo'yicha, keyin hammasi bitta guruh (`()` — bo'sh to'plam, umumiy jami);
- `ROLLUP (a, b, c)` = `GROUPING SETS ((a,b,c), (a,b), (a), ())` — ierarxik jamilar: masalan bo'lim → filial → kompaniya;
- `CUBE (a, b)` = barcha kombinatsiyalar: `(a,b), (a), (b), ()`.

Jami qatorlarda guruhlanmagan ustun o'rnida `NULL` turadi. Hujjat ogohlantiradi: agar ustunning o'zida `NULL` bo'lsa, uni jami `NULL` idan ajratib bo'lmaydi. Buning uchun **`GROUPING(…)`** funksiyasi bor: argument joriy guruhlash to'plamida qatnashmasa bit 1, qatnashsa 0 (eng o'ngdagi argument — eng kichik bit).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

```sql
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);
```

`Malika` ning bahosi yo'q, `Jasur` hech qaysi guruhda emas, `C` guruhida talaba yo'q. Natijalar PostgreSQL'dan.

### Asosiy funksiyalar va `NULL`

```sql
SELECT count(*), count(ball), count(DISTINCT guruh_id),
       sum(ball), avg(ball), min(ball), max(ball)
FROM baholar;
```

```text
 count | count | count | sum |         avg         | min | max 
-------+-------+-------+-----+---------------------+-----+-----
     6 |     5 |     2 | 425 | 85.0000000000000000 |  70 |  92
(1 row)
```

- `count(*)` = 6 — barcha qator;
- `count(ball)` = 5 — `Malika` ning `NULL` i sanalmadi;
- `count(DISTINCT guruh_id)` = 2 — `1` va `2`; `NULL` sanalmaydi;
- `avg` = 425 / 5, 6 ga emas. `NULL` o'rtachani "tushirmaydi", u umuman hisobga kirmaydi.

Natija tiplari: PostgreSQL'da `sum(integer)` → `bigint`, `avg(integer)` → `numeric` (hujjatdagi funksiyalar jadvali, `pg_typeof` bilan tekshirildi).

### Bo'sh to'plam: `sum` = `NULL`

```sql
SELECT count(*), sum(ball) FROM baholar WHERE ball > 100;
SELECT coalesce(sum(ball), 0) FROM baholar WHERE false;
```

```text
 count | sum 
-------+-----
     0 |    
(1 row)

 coalesce 
----------
        0
(1 row)
```

Qator yo'q, lekin natija **bitta qator**: `GROUP BY` siz agregat doim bitta guruh beradi.

### `GROUP BY` va `HAVING`

```sql
SELECT guruh_id, count(*) AS soni, max(ball) AS eng_yuqori
FROM baholar GROUP BY guruh_id ORDER BY guruh_id;

SELECT guruh_id, count(*) FROM baholar
GROUP BY guruh_id HAVING count(*) > 1 ORDER BY guruh_id;
```

```text
 guruh_id | soni | eng_yuqori 
----------+------+------------
        1 |    3 |         90
        2 |    2 |         92
          |    1 |         70
(3 rows)

 guruh_id | count 
----------+-------
        1 |     3
        2 |     2
(2 rows)
```

`NULL` guruh_id li qatorlar **bitta guruhga** tushdi. SQLite hujjati buni aniq yozadi: qatorlarni guruhlashda `NULL` qiymatlar teng hisoblanadi. Uchala tizimda natija bir xil (`DISTINCT` dagi kabi, 22-bob).

Agregatni `WHERE` da ishlatib bo'lmaydi:

```sql
SELECT avg(ball) FROM baholar WHERE ball > count(*);
```

```text
ERROR:  aggregate functions are not allowed in WHERE
```

### Guruhlanmagan ustun va funksional bog'liqlik

```sql
SELECT guruh_id, ism, max(ball) FROM baholar GROUP BY guruh_id;
```

```text
ERROR:  column "baholar.ism" must appear in the GROUP BY clause or be used in an aggregate function
```

Guruhda uchta `ism` bor — qaysi biri? PostgreSQL rad etadi. Lekin guruhlangan ustun birlamchi kalit bo'lsa, ruxsat:

```sql
SELECT g.id, g.nom, count(b.id) AS soni
FROM guruhlar g LEFT JOIN baholar b ON b.guruh_id = g.id
GROUP BY g.id ORDER BY g.id;
```

```text
 id | nom | soni 
----+-----+------
  1 | A   |    3
  2 | B   |    2
  3 | C   |    0
(3 rows)
```

`g.nom` `GROUP BY` da yo'q, lekin `g.id` — `guruhlar` ning birlamchi kaliti, `nom` unga bog'liq.

### `count(*)` va `count(ustun)` — `LEFT JOIN` dan keyin

Yuqoridagi so'rovda `count(b.id)` o'rniga `count(*)` yozilsa:

```text
 id | nom | soni 
----+-----+------
  1 | A   |    3
  2 | B   |    2
  3 | C   |    1
(3 rows)
```

`C` da talaba yo'q, lekin `LEFT JOIN` uning uchun `NULL` li bitta qator qo'shgan (25-bob). `count(*)` shu qatorni sanadi. To'g'ri yo'l — o'ng jadvalning `NOT NULL` ustunini sanash.

### `string_agg` va agregat ichida `ORDER BY`

```sql
SELECT guruh_id, string_agg(ism, ', ' ORDER BY ism) AS ismlar
FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
```

```text
 guruh_id |       ismlar       
----------+--------------------
        1 | Ali, Malika, Sobir
        2 | Dilnoza, Vali
          | Jasur
(3 rows)
```

### `FILTER`

```sql
SELECT count(*) AS hammasi,
       count(*) FILTER (WHERE ball >= 88) AS alochi
FROM baholar;
```

```text
 hammasi | alochi 
---------+--------
       6 |      3
(1 row)
```

### `WITHIN GROUP`: mediana

```sql
SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY ball) AS mediana,
       percentile_disc(0.5) WITHIN GROUP (ORDER BY ball) AS disc
FROM baholar;
```

```text
 mediana | disc 
---------+------
      88 |   88
(1 row)
```

`NULL` tashlandi, qolgan 5 ta baho: 70, 85, **88**, 90, 92. `percentile_cont` qiymatlar orasida interpolyatsiya qila oladi (juft sonli to'plamda o'rtadagi ikkitaning o'rtachasi), `percentile_disc` esa doim to'plamdagi haqiqiy qiymatlardan birini qaytaradi.

### `ROLLUP` va `GROUPING`

```sql
SELECT g.nom, b.ism, sum(b.ball), grouping(g.nom, b.ism) AS gr
FROM baholar b JOIN guruhlar g ON g.id = b.guruh_id
GROUP BY ROLLUP (g.nom, b.ism)
ORDER BY g.nom, b.ism;
```

```text
 nom |   ism   | sum | gr 
-----+---------+-----+----
 A   | Ali     |  85 |  0
 A   | Malika  |     |  0
 A   | Sobir   |  90 |  0
 A   |         | 175 |  1
 B   | Dilnoza |  88 |  0
 B   | Vali    |  92 |  0
 B   |         | 180 |  1
     |         | 355 |  3
(8 rows)
```

- `gr = 0` — oddiy qator (`nom` va `ism` ikkalasi guruhlashda);
- `gr = 1` (ikkilikda `01`) — `ism` qatnashmagan: guruh jami;
- `gr = 3` (`11`) — ikkalasi ham qatnashmagan: umumiy jami.

`Malika` ning `sum` i `NULL` (bahosi yo'q) — bu ma'lumotdagi `NULL`, jami emas; `gr` buni ajratib beradi.

## Dialektlar

### MySQL

**`ONLY_FULL_GROUP_BY`.** MySQL hujjatiga ko'ra bu SQL rejimi **sukut bo'yicha yoqilgan**. U yoqilganda MySQL standartdagi kabi ishlaydi: `GROUP BY` da yo'q va unga funksional bog'liq bo'lmagan ustunni rad etadi. MySQL funksional bog'liqlikni aniqlaydi — `GROUP BY g.id` misoli MySQL'da ham ishladi.

```text
ERROR 1055 (42000) at line 9: Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'qollanma.baholar.ism' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
```

Rejim o'chirilsa (eski MySQL kodlarida uchraydi), hujjatga ko'ra server har guruhdan **istalgan** qiymatni oladi. Natija noaniq bo'ladi, va `ORDER BY` qaysi qiymat tanlanishiga ta'sir qilmaydi — saralash qiymatlar tanlangandan keyin bo'ladi.

**`ANY_VALUE()`.** "Menga guruhdagi istalgan qiymat yetadi" deyishning to'g'ri yo'li — rejimni o'chirmasdan:

```sql
SELECT guruh_id, ANY_VALUE(ism) AS ism, max(ball) FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
```

```text
+----------+-------+-----------+
| guruh_id | ism   | max(ball) |
+----------+-------+-----------+
|     NULL | Jasur |        70 |
|        1 | Ali   |        90 |
|        2 | Vali  |        92 |
+----------+-------+-----------+
```

E'tibor bering: `1` guruhda `Ali` chiqdi, `max(ball)` = 90 esa `Sobir` niki. `ANY_VALUE` eng yuqori balli qatorni **bermaydi**. PostgreSQL 18 da ham `any_value` bor (hujjat: "`NULL` bo'lmagan kirishlardan istalgan qiymat").

**`GROUP_CONCAT`, `string_agg` yo'q.** MySQL'da satrlarni birlashtirish `GROUP_CONCAT`, ajratuvchi `SEPARATOR` bilan:

```sql
SELECT guruh_id, GROUP_CONCAT(ism ORDER BY ism SEPARATOR ', ') AS ismlar
FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT string_agg(ism, ',') FROM baholar;
```

```text
+----------+--------------------+
| guruh_id | ismlar             |
+----------+--------------------+
|     NULL | Jasur              |
|        1 | Ali, Malika, Sobir |
|        2 | Dilnoza, Vali      |
+----------+--------------------+
ERROR 1305 (42000) at line 10: FUNCTION qollanma.string_agg does not exist
```

**`GROUP_CONCAT` uzunligi cheklangan.** Hujjatga ko'ra natija `group_concat_max_len` (sukut bo'yicha **1024**) gacha **kesiladi**. Xato emas, faqat ogohlantirish:

```sql
SET SESSION group_concat_max_len = 10;
SELECT GROUP_CONCAT(ism) FROM baholar;
SHOW WARNINGS;
```

```text
+-------------------+
| GROUP_CONCAT(ism) |
+-------------------+
| Ali,Vali,S        |
+-------------------+
+---------+------+---------------------------------+
| Level   | Code | Message                         |
+---------+------+---------------------------------+
| Warning | 1260 | Row 3 was cut by GROUP_CONCAT() |
+---------+------+---------------------------------+
```

**`FILTER` yo'q.** O'rniga `CASE` (yoki MySQL'da mantiqiy ifoda 1/0 bo'lgani uchun `sum(shart)`):

```sql
SELECT count(*) FILTER (WHERE ball >= 88) FROM baholar;
SELECT count(*) AS hammasi,
       sum(ball >= 88) AS alochi,
       count(CASE WHEN ball >= 88 THEN 1 END) AS alochi2
FROM baholar;
```

```text
ERROR 1064 (42000) at line 3: … near '(WHERE ball >= 88) FROM baholar' at line 1
+---------+--------+---------+
| hammasi | alochi | alochi2 |
+---------+--------+---------+
|       6 |      3 |       3 |
+---------+--------+---------+
```

`count(CASE …)` ko'chiriladigan yo'l: `CASE` shart bajarilmaganda `NULL` beradi, `count` uni sanamaydi.

**`WITH ROLLUP` va `ROLLUP (…)`.** MySQL'ning `SELECT` sintaksisida ikkalasi bor: `GROUP BY a, b WITH ROLLUP` va (hujjat "muqobil sintaksis" deydi) `GROUP BY ROLLUP (a, b)`. `GROUPING()` ham bor — natija PostgreSQL bilan bir xil (8 qator, `gr` 0/1/3). `GROUPING SETS` va `CUBE` esa MySQL `SELECT` sintaksisida **yo'q**. Community serverda urinish quyidagi xatoni berdi:

```text
ERROR 3889 (HY000) at line 8: Secondary engine operation failed. Reason: "You have not defined the secondary engine for at least one of the query tables [qollanma.baholar].".
```

**Natija tiplari.** Hujjatga ko'ra `SUM()` va `AVG()` aniq sonlar (butun, `DECIMAL`) uchun `DECIMAL`, taxminiy (`FLOAT`, `DOUBLE`) uchun `DOUBLE` qaytaradi. Shuning uchun `avg(ball)` = `85.0000`.

**`GROUP BY` da alias.** MySQL va PostgreSQL ikkalasi ham `GROUP BY` da `SELECT` dagi alias ni qabul qiladi (`GROUP BY g`). PostgreSQL hujjati buni standartdan kengaytma deb belgilaydi: qat'iy SQL'da faqat manba jadval ustunlari bo'yicha guruhlanadi.

### SQLite

**"Yalang'och" ustunlar (bare columns).** SQLite hujjatiga ko'ra agregat ichida ham, `GROUP BY` da ham bo'lmagan ustun — "bare" ustun. Boshqa tizimlar xato beradi, SQLite esa qabul qiladi. Hujjat buni "xato emas, xususiyat" deydi:

- qiymat guruhdagi **qaysidir** qatordan olinadi va qaysi ekanini oldindan bilib bo'lmaydi;
- **istisno:** so'rovda **bitta** `min()` yoki `max()` bo'lsa, bare ustunlar shu eng kichik/katta qiymatli qatordan olinadi.

```sql
SELECT guruh_id, ism, max(ball) FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
SELECT guruh_id, ism, min(ball) FROM baholar GROUP BY guruh_id ORDER BY guruh_id;
```

```text
guruh_id    ism    max(ball)
--------  -------  ---------
          Jasur           70
       1  Sobir           90
       2  Vali            92
guruh_id    ism    min(ball)
--------  -------  ---------
          Jasur           70
       1  Ali             85
       2  Dilnoza         88
```

PostgreSQL va MySQL rad etgan so'rov SQLite'da ishladi va `ism` haqiqatan eng yuqori/eng past balli qatordan keldi. Lekin hujjatdagi cheklovlar: teng qiymatlar bo'lsa qator ixtiyoriy tanlanadi; ikkita `min/max` bo'lsa qaysi biri hal qilishi noma'lum; bo'sh guruhda bare ustun **istalgan** qiymat bo'lishi mumkin. Ko'chiriladigan kod uchun — window funksiyalar (31-bob).

**`string_agg` ham, `group_concat` ham bor.** Hujjatga ko'ra `string_agg(X,Y)` — `group_concat(X,Y)` ning boshqa nomi: biri PostgreSQL/SQL Server bilan, ikkinchisi MySQL bilan mos. `ORDER BY` oxirgi argumentdan keyin yoziladi — natija PostgreSQL bilan bir xil. `ORDER BY` siz tartib ixtiyoriy:

```text
guruh_id  group_concat(ism)
--------  -----------------
          Jasur
       1  Ali,Sobir,Malika
       2  Vali,Dilnoza
```

**`FILTER` bor** — natija PostgreSQL bilan bir xil (`6 | 3`).

**`sum` va `total`.** Hujjatga ko'ra qator bo'lmasa `sum()` `NULL` (standart talab qiladi), `total()` esa `0.0` qaytaradi. `total()` doim haqiqiy son (floating point):

```sql
SELECT sum(ball), total(ball) FROM baholar WHERE 0;
```

```text
sum(ball)  total(ball)
---------  -----------
                   0.0
```

**`avg` doim haqiqiy son.** Hujjatga ko'ra kamida bitta `NULL` bo'lmagan kirish bo'lsa, `avg()` butun sonlardan ham floating point qaytaradi: `85.0`.

**Mediana va persentil** — `WITHIN GROUP` sintaksisi yo'q; funksiya ko'rinishida: `median(X)`, `percentile_cont(Y, P)`, `percentile_disc(Y, P)`, `percentile(Y, P)` (P — 0..100). Hujjatga ko'ra ular 3.51.0 dan beri, amalgamatsiya `-DSQLITE_ENABLE_PERCENTILE` bilan yig'ilganda mavjud. Bizning yig'ishda (rasmiy `sqlite-autoconf`) `PRAGMA compile_options` da `ENABLE_PERCENTILE` bor:

```sql
SELECT median(ball) FROM baholar;
SELECT percentile_cont(ball, 0.5) FROM baholar;
```

```text
median(ball)
------------
        88.0
percentile_cont(ball, 0.5)
--------------------------
                      88.0
```

Yo'q narsalar: `any_value` (`no such function: any_value`), `ROLLUP`/`CUBE`/`GROUPING SETS` (`ROLLUP (…)` funksiya chaqiruvi deb o'qiladi: `no such function: ROLLUP`).

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Guruhlanmagan ustun | Xato (funksional bog'liq bo'lsa — ruxsat) | `ONLY_FULL_GROUP_BY` (sukut) — xato; bog'liqlikni aniqlaydi | Ruxsat ("bare" ustun) |
| `any_value` | Ha | `ANY_VALUE()` | Yo'q |
| Satr birlashtirish | `string_agg(x, ',' ORDER BY …)` | `GROUP_CONCAT(x ORDER BY … SEPARATOR ',')`, 1024 gacha kesiladi | `string_agg` = `group_concat` |
| `FILTER (WHERE …)` | Ha | Yo'q (`count(CASE …)`) | Ha |
| `WITHIN GROUP` | Ha | Yo'q | Yo'q (`median`, `percentile_cont(Y,P)`) |
| `ROLLUP` | `ROLLUP (…)` | `WITH ROLLUP`, `ROLLUP (…)` | Yo'q |
| `GROUPING SETS`, `CUBE` | Ha | Yo'q | Yo'q |
| `GROUPING()` | Ha | Ha | Yo'q |
| Bo'sh to'plamda `sum` | `NULL` | `NULL` | `NULL` (`total()` — `0.0`) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Agregatni `WHERE` da ishlatish | Xato: `WHERE` agregatdan oldin bajariladi | `HAVING` |
| Guruh sharti emas, qator shartini `HAVING` ga yozish | Ishlaydi, lekin ortiqcha qatorlar guruhlanadi | Qator sharti — `WHERE`, agregat sharti — `HAVING` |
| `LEFT JOIN` dan keyin `count(*)` | Jufti yo'q guruhlar 0 emas, 1 ko'rsatadi | `count(o'ng.id)` |
| `sum` bo'sh to'plamda 0 deb kutish | `NULL` qaytadi, keyingi hisob `NULL` ga aylanadi | `coalesce(sum(x), 0)` |
| `avg` `NULL` larni 0 deb hisoblaydi deb o'ylash | `NULL` lar umuman hisobga kirmaydi | Kerak bo'lsa `avg(coalesce(x, 0))` |
| MySQL'da `ONLY_FULL_GROUP_BY` ni o'chirish | Natija noaniq, `ORDER BY` yordam bermaydi | Ustunni `GROUP BY` ga qo'shish yoki `ANY_VALUE()` |
| SQLite bare ustunga tayanish | Boshqa tizimlarda xato; tenglarda ixtiyoriy qator | Window funksiyalar (31-bob) |
| `string_agg`/`GROUP_CONCAT` da `ORDER BY` siz | Tartib har safar boshqacha bo'lishi mumkin | Agregat ichida `ORDER BY` |
| MySQL'da katta `GROUP_CONCAT` | 1024 belgida jimgina kesiladi (faqat ogohlantirish) | `group_concat_max_len` ni oshirish, ogohlantirishni tekshirish |
| `ROLLUP` jami `NULL` ini ma'lumot `NULL` idan ajratmaslik | Hisobotda noto'g'ri yorliq | `GROUPING()` |

## Amaliyot

1. Har guruh uchun talabalar soni, baholangan talabalar soni va o'rtacha ballni chiqaring. `C` guruhi ham 0 bilan chiqsin.
2. O'rtacha bali 87 dan yuqori guruhlarni toping. Shartni `WHERE` ga yozishga urinib ko'ring — nima bo'ldi?
3. Bitta so'rovda: jami talabalar, 88 va undan yuqori ball olganlar, bahosi yo'qlar soni. PostgreSQL/SQLite'da `FILTER`, MySQL'da `CASE` bilan.
4. Har guruhning ismlar ro'yxatini ball bo'yicha kamayish tartibida uchala tizimda chiqaring.
5. `ROLLUP` bilan guruh jamilari va umumiy jamini chiqaring (PostgreSQL va MySQL). `GROUPING()` yordamida jami qatorlarga "Jami" yorlig'ini qo'ying.
6. SQLite'da `SELECT guruh_id, ism, max(ball), min(ball) FROM baholar GROUP BY guruh_id;` ni ishga tushiring. `ism` qaysi qatordan keldi? Hujjat bu haqda nima deydi?

## Rasmiy hujjat

- PostgreSQL — 4.2.7. Aggregate Expressions: <https://www.postgresql.org/docs/18/sql-expressions.html#SYNTAX-AGGREGATES>
- PostgreSQL — 7.2.3. The GROUP BY and HAVING Clauses, 7.2.4. GROUPING SETS, CUBE, and ROLLUP: <https://www.postgresql.org/docs/18/queries-table-expressions.html>
- PostgreSQL — 9.21. Aggregate Functions: <https://www.postgresql.org/docs/18/functions-aggregate.html>
- MySQL — 14.19.1 Aggregate Function Descriptions: <https://dev.mysql.com/doc/refman/9.7/en/aggregate-functions.html>
- MySQL — 14.19.2 GROUP BY Modifiers (`WITH ROLLUP`, `GROUPING()`): <https://dev.mysql.com/doc/refman/9.7/en/group-by-modifiers.html>
- MySQL — 14.19.3 MySQL Handling of GROUP BY (`ONLY_FULL_GROUP_BY`, `ANY_VALUE`): <https://dev.mysql.com/doc/refman/9.7/en/group-by-handling.html>
- SQLite — Built-in Aggregate Functions: <https://www.sqlite.org/lang_aggfunc.html>
- SQLite — SELECT (2.5. Bare columns in an aggregate query): <https://www.sqlite.org/lang_select.html>
