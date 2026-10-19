# 31 — Window funksiyalar

[← Oldingi: Rekursiv CTE](30-rekursiv-cte.md) · [Mundarija](README.md) · [Keyingi: Shartli ifodalar →](32-shartli-ifodalar.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/31-1-tushuncha.jpg">
    <source src="/video/sql/31-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/31-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/31-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Oyna funksiyalari tushunchasi: OVER, PARTITION BY, ORDER BY, ROWS, RANGE va GROUPS ramkalari</figcaption>
</figure>

**Window funksiya** (oyna funksiyasi) joriy qator bilan qandaydir bog'liq qatorlar to'plami ustida hisob qiladi. PostgreSQL hujjatiga ko'ra bu agregat funksiyaga o'xshaydi, lekin bitta farqi bor: qatorlar **bitta qatorga guruhlanmaydi**, har biri natijada alohida qoladi.

| | `GROUP BY` + agregat (26-bob) | Window funksiya |
| --- | --- | --- |
| Natijadagi qatorlar | Har guruhga bitta | Har kirish qatoriga bitta |
| Qator ustunlari | Faqat guruhlangan ustunlar | Hammasi |
| Misol | Bo'lim o'rtacha maoshi | Har xodim yonida uning bo'limi o'rtachasi |

Funksiyani window funksiyaga aylantiradigan narsa — **`OVER`** bandi. SQLite hujjati: `OVER` bo'lsa — window funksiya, bo'lmasa — oddiy agregat yoki skalyar funksiya.

```sql
funksiya (argumentlar) [FILTER (WHERE …)] OVER (
    [PARTITION BY ifoda, …]
    [ORDER BY ifoda [ASC | DESC] [NULLS {FIRST | LAST}], …]
    [frame]
)
```

### `PARTITION BY` va `ORDER BY`

- **`PARTITION BY`** — qatorlarni **bo'laklarga** (partition) ajratadi. Funksiya har qator uchun shu qatorning bo'lagi ichida hisoblanadi. `GROUP BY` ga o'xshaydi, lekin qatorlarni birlashtirmaydi. Yo'q bo'lsa — butun natija bitta bo'lak.
- **`ORDER BY`** (`OVER` ichida) — bo'lak ichidagi qatorlar qanday tartibda qayta ishlanishi. PostgreSQL hujjatiga ko'ra u natija tartibiga mos kelishi shart emas.

PostgreSQL hujjatiga ko'ra `OVER` ichidagi `PARTITION BY` va `ORDER BY` da natija ustunlarining nomlari yoki tartib raqamlari ishlatilmaydi — faqat ifodalar.

### Frame (oyna ramkasi)

**Frame** — bo'lak ichida joriy qator uchun tanlangan qatorlar to'plami. `sum`, `avg`, `first_value`, `last_value` kabi funksiyalar butun bo'lak ustida emas, **frame** ustida ishlaydi. `row_number`, `rank`, `lag` kabilar esa frame'ga qaramaydi.

```sql
{ ROWS | RANGE | GROUPS } BETWEEN boshi AND oxiri [EXCLUDE …]
-- boshi/oxiri: UNBOUNDED PRECEDING | n PRECEDING | CURRENT ROW | n FOLLOWING | UNBOUNDED FOLLOWING
```

PostgreSQL hujjatiga ko'ra uch rejim:

| Rejim | `n PRECEDING` ma'nosi | `CURRENT ROW` |
| --- | --- | --- |
| `ROWS` | `n` ta **qator** oldin | Joriy qatorning o'zi |
| `RANGE` | Qiymati joriy qatordan ko'pi bilan `n` ga **kichik** bo'lganlar (`ORDER BY` da bitta ustun) | Joriy qator va uning **tenglari** |
| `GROUPS` | `n` ta **tenglar guruhi** oldin (`ORDER BY` shart) | Joriy qatorning tenglar guruhi |

**Tenglar** (peers) — `OVER` dagi `ORDER BY` bo'yicha bir xil qiymatli qatorlar.

**Sukut bo'yicha frame** — eng ko'p xato chiqadigan joy. Hujjatga ko'ra u `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW`:

- `ORDER BY` **bor** bo'lsa — bo'lak boshidan joriy qatorning **oxirgi tengigacha**. Shuning uchun `sum(…) OVER (ORDER BY …)` — **o'sib boruvchi yig'indi** (running sum);
- `ORDER BY` **yo'q** bo'lsa — butun bo'lak (hamma qator bir-biriga teng).

**`EXCLUDE`** — frame'dan qatorlarni chiqarish: `CURRENT ROW` (joriy qator), `GROUP` (joriy qator va tenglari), `TIES` (faqat tenglari), `NO OTHERS` (hech narsa, sukut).

### Funksiyalar

PostgreSQL hujjatidagi umumiy maqsadli window funksiyalar:

| Funksiya | Natija |
| --- | --- |
| `row_number()` | Bo'lakdagi tartib raqami, 1 dan. Tenglarda tartib aniqlanmagan |
| `rank()` | O'rin, **bo'shliq bilan**: 1, 2, 2, 4 |
| `dense_rank()` | O'rin, **bo'shliqsiz**: 1, 2, 2, 3 |
| `percent_rank()`, `cume_dist()` | Nisbiy o'rin, taqsimot (0..1) |
| `ntile(n)` | Bo'lakni imkon qadar teng `n` guruhga bo'ladi |
| `lag(x [, k [, sukut]])` | `k` qator **oldingi** qatordagi `x` (sukut: `k` = 1, yo'q bo'lsa `NULL`) |
| `lead(x [, k [, sukut]])` | `k` qator **keyingi** qatordagi `x` |
| `first_value(x)`, `last_value(x)`, `nth_value(x, n)` | **Frame'ning** birinchi, oxirgi, n-qatoridagi `x` |

Bundan tashqari har qanday oddiy agregat (`sum`, `avg`, `count`, …) `OVER` bilan window funksiya bo'ladi.

**Diqqat:** hujjat ogohlantiradi: `first_value`, `last_value`, `nth_value` faqat **frame** ichini ko'radi, sukut frame esa joriy qatorning oxirgi tengida tugaydi. Shuning uchun `last_value` sukut bo'yicha deyarli doim "foydasiz" natija beradi.

### Qayerda ishlatiladi

PostgreSQL va SQLite hujjatlariga ko'ra window funksiya faqat **`SELECT` ro'yxatida** va **`ORDER BY`** da turadi. `WHERE`, `GROUP BY`, `HAVING` da — yo'q: ular window funksiyalardan **oldin** bajariladi (22-bob). Window funksiya agregatlardan **keyin** bajariladi, demak `sum(count(*)) OVER (…)` mumkin, aksi emas.

Window natijasi bo'yicha filtrlash uchun — subquery (27-bob) yoki CTE (29-bob).

### `WINDOW` bandi

Bir xil `OVER` ni bir necha funksiyada takrorlamaslik uchun oynaga nom beriladi:

```sql
SELECT sum(x) OVER w, avg(x) OVER w FROM t WINDOW w AS (PARTITION BY … ORDER BY …);
```

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/31-2-kod.jpg">
    <source src="/video/sql/31-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/31-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/31-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Amaliy kod: bo'lim o'rtachasi, reytinglar, running sum, lag/lead va last_value tuzog'i</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadval — PostgreSQL hujjatidagi `empsalary`:

```sql
CREATE TABLE empsalary (depname varchar(20), empno int PRIMARY KEY, salary int);
INSERT INTO empsalary VALUES
    ('develop',11,5200), ('develop',7,4200), ('develop',9,4500),
    ('develop',8,6000), ('develop',10,5200),
    ('personnel',5,3500), ('personnel',2,3900),
    ('sales',3,4800), ('sales',1,5000), ('sales',4,4800);
```

Natijalar PostgreSQL'dan; uchala tizimdagi farqlar alohida ko'rsatilgan.

### Har qator yonida bo'lim o'rtachasi

```sql
SELECT depname, empno, salary,
       avg(salary) OVER (PARTITION BY depname) AS ortacha
FROM empsalary ORDER BY depname, empno;
```

```text
  depname  | empno | salary |        ortacha        
-----------+-------+--------+-----------------------
 develop   |     7 |   4200 | 5020.0000000000000000
 develop   |     8 |   6000 | 5020.0000000000000000
 develop   |     9 |   4500 | 5020.0000000000000000
 develop   |    10 |   5200 | 5020.0000000000000000
 develop   |    11 |   5200 | 5020.0000000000000000
 personnel |     2 |   3900 | 3700.0000000000000000
 personnel |     5 |   3500 | 3700.0000000000000000
 sales     |     1 |   5000 | 4866.6666666666666667
 sales     |     3 |   4800 | 4866.6666666666666667
 sales     |     4 |   4800 | 4866.6666666666666667
(10 rows)
```

10 qator — 10 xodim. `GROUP BY depname` 3 qator berardi.

### `row_number`, `rank`, `dense_rank` va `WINDOW`

```sql
SELECT depname, empno, salary,
       row_number() OVER w AS rn,
       rank()       OVER w AS rnk,
       dense_rank() OVER w AS drnk
FROM empsalary
WINDOW w AS (PARTITION BY depname ORDER BY salary DESC)
ORDER BY depname, salary DESC, empno;
```

```text
  depname  | empno | salary | rn | rnk | drnk 
-----------+-------+--------+----+-----+------
 develop   |     8 |   6000 |  1 |   1 |    1
 develop   |    10 |   5200 |  2 |   2 |    2
 develop   |    11 |   5200 |  3 |   2 |    2
 develop   |     9 |   4500 |  4 |   4 |    3
 develop   |     7 |   4200 |  5 |   5 |    4
 personnel |     2 |   3900 |  1 |   1 |    1
 personnel |     5 |   3500 |  2 |   2 |    2
 sales     |     1 |   5000 |  1 |   1 |    1
 sales     |     3 |   4800 |  2 |   2 |    2
 sales     |     4 |   4800 |  3 |   2 |    2
(10 rows)
```

`10` va `11` ning maoshi teng (5200): `rank` ikkalasiga 2 berdi va keyingisini 4 qildi, `dense_rank` — 3. `row_number` esa 2 va 3 ni **tasodifiy** taqsimladi: hujjatga ko'ra tenglar tartibi aniqlanmagan. SQLite'da aynan shu so'rov `11` ga 2, `10` ga 3 berdi.

### Har bo'limdan eng yuqori 2 ta

PostgreSQL hujjatidagi usul — window funksiyani subquery'da hisoblab, tashqarida filtrlash:

```sql
SELECT depname, empno, salary FROM (
    SELECT depname, empno, salary,
           row_number() OVER (PARTITION BY depname ORDER BY salary DESC, empno) AS pos
    FROM empsalary
) AS ss
WHERE pos < 3 ORDER BY depname, pos;
```

```text
  depname  | empno | salary 
-----------+-------+--------
 develop   |     8 |   6000
 develop   |    10 |   5200
 personnel |     2 |   3900
 personnel |     5 |   3500
 sales     |     1 |   5000
 sales     |     3 |   4800
(6 rows)
```

`ORDER BY salary DESC, empno` — tenglarni `empno` bo'yicha ajratdik, natija uchala tizimda bir xil va barqaror. Bu — 25-bobdagi `LATERAL` va 26-bobdagi SQLite "bare" ustunlarning ko'chiriladigan muqobili.

To'g'ridan-to'g'ri `WHERE` da — xato:

```sql
SELECT empno FROM empsalary WHERE row_number() OVER (ORDER BY salary) < 3;
```

```text
ERROR:  window functions are not allowed in WHERE
```

### Sukut frame: `RANGE` va `ROWS`

```sql
SELECT empno, salary,
       sum(salary) OVER (ORDER BY salary) AS range_sum,
       sum(salary) OVER (ORDER BY salary
                         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS rows_sum
FROM empsalary ORDER BY salary, empno;
```

```text
 empno | salary | range_sum | rows_sum 
-------+--------+-----------+----------
     5 |   3500 |      3500 |     3500
     2 |   3900 |      7400 |     7400
     7 |   4200 |     11600 |    11600
     9 |   4500 |     16100 |    16100
     3 |   4800 |     25700 |    25700
     4 |   4800 |     25700 |    20900
     1 |   5000 |     30700 |    30700
    10 |   5200 |     41100 |    41100
    11 |   5200 |     41100 |    35900
     8 |   6000 |     47100 |    47100
(10 rows)
```

- `range_sum` (sukut, `RANGE`): ikkala 4800 da **bir xil** — 25700. Hujjatga ko'ra frame joriy qatorning **barcha tenglarini** o'z ichiga oladi.
- `rows_sum` (`ROWS`): har qator alohida, tenglarda ham. Lekin qaysi teng birinchi kelishi aniqlanmagan: PostgreSQL 20900 ni `empno = 4` ga berdi, MySQL va SQLite — `empno = 3` ga. O'sib boruvchi yig'indi uchun `ORDER BY` **takrorlanmas** bo'lishi kerak: `ORDER BY salary, empno`.

### `lag` va `lead`

```sql
SELECT empno, salary,
       lag(salary)              OVER (ORDER BY salary, empno) AS oldingi,
       salary - lag(salary)     OVER (ORDER BY salary, empno) AS farq,
       lead(salary, 1, 0)       OVER (ORDER BY salary, empno) AS keyingi
FROM empsalary ORDER BY salary, empno;
```

```text
 empno | salary | oldingi | farq | keyingi 
-------+--------+---------+------+---------
     5 |   3500 |         |      |    3900
     2 |   3900 |    3500 |  400 |    4200
     7 |   4200 |    3900 |  300 |    4500
     9 |   4500 |    4200 |  300 |    4800
     3 |   4800 |    4500 |  300 |    4800
     4 |   4800 |    4800 |    0 |    5000
     1 |   5000 |    4800 |  200 |    5200
    10 |   5200 |    5000 |  200 |    5200
    11 |   5200 |    5200 |    0 |    6000
     8 |   6000 |    5200 |  800 |       0
(10 rows)
```

Birinchi qatorda oldingisi yo'q — `NULL`; oxirgisida keyingisi yo'q — uchinchi argument `0` qaytdi.

### `last_value` tuzog'i

```sql
SELECT depname, empno, salary,
       first_value(salary) OVER (PARTITION BY depname ORDER BY salary DESC) AS eng_kop,
       last_value(salary)  OVER (PARTITION BY depname ORDER BY salary DESC) AS last_xato,
       last_value(salary)  OVER (PARTITION BY depname ORDER BY salary DESC
                                 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS eng_kam
FROM empsalary WHERE depname = 'develop' ORDER BY salary DESC, empno;
```

```text
 depname | empno | salary | eng_kop | last_xato | eng_kam 
---------+-------+--------+---------+-----------+---------
 develop |     8 |   6000 |    6000 |      6000 |    4200
 develop |    10 |   5200 |    6000 |      5200 |    4200
 develop |    11 |   5200 |    6000 |      5200 |    4200
 develop |     9 |   4500 |    6000 |      4500 |    4200
 develop |     7 |   4200 |    6000 |      4200 |    4200
(5 rows)
```

`last_xato` har qatorda **o'z** maoshini ko'rsatdi: sukut frame joriy qator (va tenglari) bilan tugaydi, demak frame'ning oxirgisi — joriy qatorning o'zi. Butun bo'lakning oxirgisi uchun frame'ni `UNBOUNDED FOLLOWING` gacha kengaytirish kerak.

### `RANGE` qiymat bo'yicha

Har xodim uchun maoshi ±300 oralig'idagilar soni (o'zi bilan):

```sql
SELECT empno, salary,
       count(*) OVER (ORDER BY salary RANGE BETWEEN 300 PRECEDING AND 300 FOLLOWING) AS yaqin
FROM empsalary ORDER BY salary, empno;
```

```text
 empno | salary | yaqin 
-------+--------+-------
     5 |   3500 |     1
     2 |   3900 |     2
     7 |   4200 |     3
     9 |   4500 |     4
     3 |   4800 |     4
     4 |   4800 |     4
     1 |   5000 |     5
    10 |   5200 |     3
    11 |   5200 |     3
     8 |   6000 |     1
(10 rows)
```

`4200` uchun oraliq 3900..4500: `3900, 4200, 4500` — 3 ta. `ROWS` qatorlarni sanaydi, `RANGE` qiymatlarni o'lchaydi.

### `GROUPS` va `EXCLUDE`

```sql
-- joriy va oldingi bitta tenglar guruhi
SELECT empno, salary,
       sum(salary) OVER (ORDER BY salary GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW) AS g
FROM empsalary ORDER BY salary, empno;

-- ±300 oralig'idagi BOSHQA xodimlar
SELECT empno, salary,
       count(*) OVER (ORDER BY salary RANGE BETWEEN 300 PRECEDING AND 300 FOLLOWING
                      EXCLUDE CURRENT ROW) AS boshqa
FROM empsalary ORDER BY salary, empno;
```

```text
 empno | salary |   g   
-------+--------+-------
     5 |   3500 |  3500
     2 |   3900 |  7400
     7 |   4200 |  8100
     9 |   4500 |  8700
     3 |   4800 | 14100
     4 |   4800 | 14100
     1 |   5000 | 14600
    10 |   5200 | 15400
    11 |   5200 | 15400
     8 |   6000 | 16400
(10 rows)

 empno | salary | boshqa 
-------+--------+--------
     5 |   3500 |      0
     2 |   3900 |      1
     7 |   4200 |      2
…
```

`4800` qatorlari uchun `g` = (4500) + (4800 + 4800) = 14100: oldingi **guruh** bitta qator, joriy guruh — ikki qator. `boshqa` = `yaqin` − 1.

### `FILTER` va `ntile`

```sql
SELECT depname, count(*) FILTER (WHERE salary > 4500) OVER (PARTITION BY depname) AS k
FROM empsalary ORDER BY depname LIMIT 3;

SELECT ntile(3) OVER (ORDER BY salary, empno) AS guruh, empno, salary
FROM empsalary ORDER BY salary, empno;
```

`develop` da 4500 dan katta maoshlilar 3 ta (har qatorda `3`). `ntile(3)` 10 qatorni 4 + 3 + 3 ga bo'ldi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/31-3-dialektlar.jpg">
    <source src="/video/sql/31-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/31-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/31-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Dialektlar: MySQL 1235 xatosi (GROUPS/EXCLUDE), CASE WHEN va SQLite oyna zanjiri</figcaption>
</figure>

### MySQL

**Asosiy imkoniyatlar bor.** `OVER`, `PARTITION BY`, `WINDOW`, `ROWS`, `RANGE` (qiymat bilan ham), `row_number`/`rank`/`dense_rank`/`ntile`, `lag`/`lead`, `first_value`/`last_value` — natijalar PostgreSQL bilan bir xil (`avg` ko'rinishi `5020.0000`).

**Yo'q narsalar.** MySQL hujjatining "Window Function Restrictions" bo'limiga ko'ra:

- `GROUPS` frame birligi va `EXCLUDE` — **tahlil qilinadi, lekin xato beradi**:

```text
ERROR 1235 (42000) at line 22: This version of MySQL doesn't yet support 'GROUPS'
ERROR 1235 (42000) at line 23: This version of MySQL doesn't yet support 'EXCLUDE'
```

- agregat window funksiyalarda `DISTINCT` (`count(DISTINCT x) OVER …`) yo'q;
- ichma-ich window funksiyalar yo'q;
- joriy qator qiymatiga bog'liq "dinamik" frame chegaralari yo'q;
- `IGNORE NULLS` va `FROM LAST` tahlil qilinadi, lekin xato beradi;
- bitta `SELECT` da ko'pi bilan 127 ta oyna.

**`FILTER` yo'q** (26-bobdagi kabi) — `count(CASE WHEN … THEN 1 END) OVER (…)`:

```text
ERROR 1064 (42000) at line 24: … near '(WHERE salary > 4500) OVER (PARTITION BY depname) AS k FROM empsalary ORDER BY d' at line 1
```

**`WHERE` da** — boshqa matnli xato:

```text
ERROR 3593 (HY000) at line 25: You cannot use the window function 'row_number' in this context.'
```

Hujjatga ko'ra SQL standarti window funksiyalarni `UPDATE`/`DELETE` da qatorlarni yangilash uchun ishlatishni taqiqlaydi; qatorlarni **tanlash** uchun subquery'da ishlatish mumkin.

### SQLite

**To'liq frame sintaksisi bor.** SQLite hujjatiga ko'ra 3.28.0 (2019-04-16) dan beri `EXCLUDE`, `GROUPS`, oyna zanjiri (window chaining) va `RANGE` da `n PRECEDING/FOLLOWING` bor. `GROUPS`, `EXCLUDE`, `RANGE 300 PRECEDING`, `FILTER` — natijalar PostgreSQL bilan bir xil.

**Sukut frame** hujjatda: `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW EXCLUDE NO OTHERS` — PostgreSQL bilan bir xil.

**Tenglar tartibi** boshqacha chiqdi: `row_number` da `11` → 2, `10` → 3; `rows_sum` da 20900 `empno = 3` ga. Bu xato emas — tartib aniqlanmagan, har tizim o'zicha tanladi.

**Oyna zanjiri.** Hujjatga ko'ra yangi oyna boshqa nomli oynaning `PARTITION BY` va `ORDER BY` ini meros oladi: `OVER (win ROWS BETWEEN …)` — `win` dagi bo'laklash va saralash + yangi frame. PostgreSQL'da ham `OVER (wname …)` bor; uning hujjatiga ko'ra u nusxa olib o'zgartiradi va `wname` da frame bo'lsa rad etiladi.

**`WHERE` da:** `misuse of window function row_number()`.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `OVER`, `PARTITION BY`, `WINDOW` | Ha | Ha | Ha |
| `ROWS`, `RANGE` (`n PRECEDING` bilan) | Ha | Ha | Ha |
| `GROUPS` | Ha | **Yo'q** (1235) | Ha |
| `EXCLUDE` | Ha | **Yo'q** (1235) | Ha |
| `FILTER` | Ha | Yo'q | Ha |
| `count(DISTINCT …) OVER` | Yo'q (`not implemented`) | Yo'q | Yo'q (`not supported`) |
| `IGNORE NULLS` | Yo'q (hujjat: amalga oshirilmagan) | Yo'q (xato) | Yo'q (sintaksis xatosi) |
| Sukut frame | `RANGE … CURRENT ROW` | `RANGE … CURRENT ROW` | `RANGE … CURRENT ROW` |
| `WHERE`/`HAVING` da | Xato | Xato 3593 | Xato |


## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `sum(x) OVER (ORDER BY y)` ni bo'lak jami deb o'ylash | Sukut frame — o'sib boruvchi yig'indi | `OVER (PARTITION BY …)` `ORDER BY` siz yoki `UNBOUNDED FOLLOWING` |
| `last_value` sukut frame bilan | Joriy qatorning o'zi qaytadi | `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` yoki `first_value(… DESC)` |
| Takrorlanadigan ustun bo'yicha `ROWS` yig'indisi yoki `row_number` | Tizimga va ishga tushirishga qarab natija farq qiladi | Takrorlanmas tie-breaker: `ORDER BY salary, empno` |
| "Top N" uchun `rank()` va `row_number()` ni adashtirish | `rank` tenglarda N dan ko'p qator beradi, `row_number` bermaydi | Vazifaga qarab tanlash |
| Window funksiyani `WHERE` da filtrlash | Xato | Subquery yoki CTE |
| `RANGE` bilan sanani ±n qatorga | `RANGE` qiymat farqi, `ROWS` qator soni | Kerakligini tanlash |
| MySQL'ga `GROUPS`/`EXCLUDE` ni ko'chirish | Xato 1235 | `ROWS`/`RANGE` bilan qayta yozish yoki ayirish (`count(*) … - 1`) |
| `OVER` dagi `ORDER BY` ni natija tartibi deb o'ylash | Natija tartibi faqat tashqi `ORDER BY` da | Tashqi `ORDER BY` |

## Amaliyot

1. Har xodim yonida bo'lim jami maoshi va maoshining bo'lim jamiga ulushini (foizda) chiqaring.
2. Har bo'limdagi eng kam maoshli xodimni `row_number` bilan toping (teng maoshlilar bo'lsa, `empno` kichigi).
3. Barcha xodimlarni maosh bo'yicha tartiblab, har qatorda o'zidan oldingi xodimdan qancha ko'p olishini chiqaring.
4. Har xodim uchun bo'limdagi eng katta va eng kichik maoshni `first_value`/`last_value` bilan chiqaring (frame'ni to'g'ri yozing).
5. `sum(salary) OVER (ORDER BY salary)` va `… ROWS …` natijalarini uchala tizimda solishtiring. Natija qaysi qatorlarda farq qildi va nega?
6. PostgreSQL/SQLite'da `EXCLUDE CURRENT ROW` bilan yozilgan "±300 oralig'idagi boshqa xodimlar" so'rovini MySQL uchun `EXCLUDE` siz qayta yozing.

## Rasmiy hujjat

- PostgreSQL — 3.5. Window Functions (tutorial): <https://www.postgresql.org/docs/18/tutorial-window.html>
- PostgreSQL — 4.2.8. Window Function Calls (frame sintaksisi): <https://www.postgresql.org/docs/18/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS>
- PostgreSQL — 9.22. Window Functions: <https://www.postgresql.org/docs/18/functions-window.html>
- MySQL — 14.20.3 Window Function Frame Specification: <https://dev.mysql.com/doc/refman/9.7/en/window-functions-frames.html>
- MySQL — 14.20.5 Window Function Restrictions: <https://dev.mysql.com/doc/refman/9.7/en/window-function-restrictions.html>
- MySQL — 14.20.1 Window Function Descriptions: <https://dev.mysql.com/doc/refman/9.7/en/window-function-descriptions.html>
- SQLite — Window Functions: <https://www.sqlite.org/windowfunctions.html>
