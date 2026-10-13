# 28 — Set amallari

[← Oldingi: Subquery'lar](27-subquerylar.md) · [Mundarija](README.md) · [Keyingi: CTE →](29-cte.md)

## Tushuncha

**Set amallari** (set operations, to'plam amallari) ikki so'rov natijasini bitta natijaga birlashtiradi. JOIN (25-bob) jadvallarni **yonma-yon** (ustunlar bo'yicha) qo'shadi, set amallari esa natijalarni **ustma-ust** (qatorlar bo'yicha) qo'shadi.

```sql
so'rov1 UNION     [ALL] so'rov2
so'rov1 INTERSECT [ALL] so'rov2
so'rov1 EXCEPT    [ALL] so'rov2
```

PostgreSQL hujjatiga ko'ra:

| Amal | Natija |
| --- | --- |
| `UNION` | `so'rov1` natijasiga `so'rov2` natijasi qo'shiladi (birlashma) |
| `INTERSECT` | Ikkala natijada **ham** bor qatorlar (kesishma) |
| `EXCEPT` | `so'rov1` da bor, `so'rov2` da **yo'q** qatorlar (ayirma) |

**Takrorlar.** Uchala amal ham sukut bo'yicha takror qatorlarni `DISTINCT` kabi olib tashlaydi. `ALL` qo'shilsa, takrorlar qoladi. MySQL'da `DISTINCT` so'zini ochiq yozish ham mumkin — u sukut bo'yicha xatti-harakatning o'zi.

`ALL` dagi takrorlar hisobi (PostgreSQL `SELECT` sahifasiga ko'ra). Qator chapda `m` marta, o'ngda `n` marta uchrasa, natijada:

- `UNION ALL` — `m + n` marta (ikkala natijaning barcha qatorlari);
- `INTERSECT ALL` — `min(m, n)` marta;
- `EXCEPT ALL` — `max(m − n, 0)` marta.

`UNION ALL` takrorlarni qidirmaydi, shuning uchun takror bo'lmasligi ma'lum bo'lsa yoki takrorlar kerak bo'lsa — u to'g'ri tanlov.

**`NULL` va takrorlar.** Takrorlarni aniqlashda `NULL` lar bir-biriga **teng** hisoblanadi. SQLite hujjati buni aniq yozadi: `NULL` boshqa `NULL` ga teng va har qanday `NULL` bo'lmagan qiymatdan farqli. Bu `=` operatoridan farq qiladi (`NULL = NULL` → `NULL`).

### "Union compatible" shartlari

PostgreSQL hujjatiga ko'ra ikki so'rov **mos** bo'lishi kerak:

- ustunlar soni bir xil;
- mos ustunlarning tiplari bir-biriga keladigan (compatible).

Natija ustunlarining **nomlari birinchi so'rovdan** olinadi (MySQL hujjati buni misol bilan ko'rsatadi).

### Ustuvorlik

PostgreSQL va MySQL hujjatlariga ko'ra:

- `INTERSECT` `UNION` va `EXCEPT` dan **qattiqroq bog'lanadi** (avval bajariladi);
- `UNION` va `EXCEPT` chapdan o'ngga bajariladi;
- qavs bilan tartibni o'zgartirish mumkin.

Demak `q1 UNION q2 INTERSECT q3` = `q1 UNION (q2 INTERSECT q3)`.

`UNION` va `INTERSECT` o'rin almashtirishga chidamli (commutative): `x UNION y` = `y UNION x`. `EXCEPT` esa yo'q — MySQL hujjati buni alohida ta'kidlaydi.

### `ORDER BY` va `LIMIT`

Oxirdagi `ORDER BY`/`LIMIT` **butun** natijaga tegishli. PostgreSQL hujjatidagi misol: `SELECT a FROM b UNION SELECT x FROM y LIMIT 10` = `(… UNION …) LIMIT 10`, ikkinchi so'rovning `LIMIT` i emas.

Bitta qismga `ORDER BY`/`LIMIT` qo'yish uchun shu qism **qavsga** olinadi. MySQL hujjatiga ko'ra qism ichidagi `ORDER BY` yakuniy tartibga ta'sir qilmaydi — u faqat `LIMIT` bilan birga ma'noga ega (qaysi qatorlar olinishini belgilaydi). `LIMIT` siz qism ichidagi `ORDER BY` ni optimizator olib tashlaydi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadvallar MySQL hujjatidagi `INTERSECT` misolidan:

```sql
CREATE TABLE a (m int, n int);
CREATE TABLE b (m int, n int);
CREATE TABLE c (m int, n int);
INSERT INTO a VALUES (1,2), (2,3), (3,4);
INSERT INTO b VALUES (1,2), (1,3), (3,4);
INSERT INTO c VALUES (1,3), (1,3), (3,4);
```

`c` da `(1,3)` ikki marta. Natijalar PostgreSQL'dan; ko'p so'rov uchun uchala tizim bir xil natija berdi.

### `UNION` va `UNION ALL`

```sql
SELECT * FROM a UNION     SELECT * FROM b ORDER BY m, n;
SELECT * FROM a UNION ALL SELECT * FROM b ORDER BY m, n;
```

```text
 m | n 
---+---
 1 | 2
 1 | 3
 2 | 3
 3 | 4
(4 rows)

 m | n 
---+---
 1 | 2
 1 | 2
 1 | 3
 2 | 3
 3 | 4
 3 | 4
(6 rows)
```

`(1,2)` va `(3,4)` ikkala jadvalda bor: `UNION` ularni bir marta, `UNION ALL` ikki marta chiqardi.

### `INTERSECT` va `EXCEPT`

```sql
SELECT * FROM a INTERSECT SELECT * FROM b ORDER BY m, n;
SELECT * FROM a EXCEPT    SELECT * FROM b ORDER BY m, n;
```

```text
 m | n 
---+---
 1 | 2
 3 | 4
(2 rows)

 m | n 
---+---
 2 | 3
(1 row)
```

### `ALL` bilan: takrorlar hisobi

```sql
SELECT * FROM c INTERSECT ALL SELECT * FROM c ORDER BY m, n;
SELECT * FROM c EXCEPT ALL    SELECT * FROM a ORDER BY m, n;
SELECT * FROM c EXCEPT        SELECT * FROM a ORDER BY m, n;
```

```text
 m | n 
---+---
 1 | 3
 1 | 3
 3 | 4
(3 rows)

 m | n 
---+---
 1 | 3
 1 | 3
(2 rows)

 m | n 
---+---
 1 | 3
(1 row)
```

- `c INTERSECT ALL c` — `(1,3)` ikkala tomonda 2 tadan, natijada 2 ta;
- `c EXCEPT ALL a` — `(1,3)` chapda 2, o'ngda 0 → 2 ta; `(3,4)` chapda 1, o'ngda 1 → 0;
- `ALL` siz — `(1,3)` bir marta.

Natijalar MySQL hujjatidagi bilan bir xil.

### Ustuvorlik

```sql
SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c ORDER BY m, n;
```

```text
 m | n 
---+---
 1 | 2
 1 | 3
 2 | 3
 3 | 4
(4 rows)
```

Avval `b INTERSECT c` = `(1,3), (3,4)`, keyin `a UNION …`. Agar chapdan o'ngga bajarilganda edi, `(a UNION b) INTERSECT c` = `(1,3), (3,4)` — 2 qator chiqardi. SQLite'da aynan shunday bo'ladi (quyida).

### Ustun nomlari va `ORDER BY`

Natija ustun nomlari birinchi so'rovdan. `ORDER BY` shu nomlardan foydalanadi:

```sql
SELECT m AS x, n FROM a UNION SELECT * FROM b ORDER BY x DESC, n LIMIT 2;
```

```text
 x | n 
---+---
 3 | 4
 2 | 3
(2 rows)
```

PostgreSQL'da set amali natijasini faqat **natija ustun nomi** (yoki tartib raqami) bo'yicha saralash mumkin, ifoda bo'yicha emas. Xato matnining o'zi ikki yo'lni ko'rsatadi:

```sql
SELECT m, n FROM a UNION SELECT m, n FROM b ORDER BY m + n;
```

```text
ERROR:  invalid UNION/INTERSECT/EXCEPT ORDER BY clause
DETAIL:  Only result column names can be used, not expressions or functions.
HINT:  Add the expression/function to every SELECT, or move the UNION into a FROM clause.
```

### Bir qismga `LIMIT`: qavs

```sql
SELECT m FROM a ORDER BY m DESC LIMIT 1 UNION SELECT m FROM b;

(SELECT m FROM a ORDER BY m DESC LIMIT 1)
UNION
(SELECT m FROM b ORDER BY m LIMIT 1)
ORDER BY m;
```

```text
ERROR:  syntax error at or near "UNION"
 m 
---
 1
 3
(2 rows)
```

`a` dan eng kattasi (3), `b` dan eng kichigi (1), keyin butun natija saralandi.

### Moslik xatolari

Ustunlar soni farq qilsa:

```sql
SELECT m, n FROM a UNION SELECT m FROM b;
```

```text
ERROR:  each UNION query must have the same number of columns
```

Tiplar mos kelmasa — PostgreSQL ularni bitta tipga keltirishga urinadi, uddalay olmasa xato:

```sql
SELECT m FROM a UNION SELECT 'matn' ORDER BY 1;
```

```text
ERROR:  invalid input syntax for type integer: "matn"
```

### `NULL` takror hisoblanadi

```sql
SELECT 1 AS k, 'x' AS v UNION SELECT NULL, NULL UNION SELECT NULL, NULL;
```

```text
 k | v 
---+---
   | 
 1 | x
(2 rows)
```

Ikkita `(NULL, NULL)` qatori bitta bo'lib qoldi — takror deb topildi.

## Dialektlar

### MySQL

**Uchala amal va `ALL` bor.** MySQL hujjatiga ko'ra `UNION`, `INTERSECT`, `EXCEPT` va har birining `ALL`/`DISTINCT` shakllari qo'llab-quvvatlanadi. Yuqoridagi barcha natijalar (`INTERSECT ALL`, `EXCEPT ALL`, ustuvorlik, `NULL`) PostgreSQL bilan bir xil chiqdi.

**`TABLE` va `VALUES`.** Hujjatga ko'ra `SELECT` o'rnida `TABLE nom` va `VALUES ROW(…)` ham ishlatiladi: `TABLE a INTERSECT TABLE b`.

**`ALL` va `DISTINCT` aralashsa.** Hujjatga ko'ra `DISTINCT` li amal o'zidan **chapdagi** barcha `ALL` larni bekor qiladi.

**Tiplar.** Hujjatga ko'ra tiplar mos kelmasa, natija ustunining tipi va uzunligi **barcha** qismlar qiymatlari hisobga olinib aniqlanadi. Shuning uchun PostgreSQL xato bergan so'rov MySQL'da ishladi — ustun satrga aylandi:

```text
+------+
| m    |
+------+
| 1    |
| 2    |
| 3    |
| matn |
+------+
```

**`ORDER BY` ifoda bilan.** `ORDER BY m + n` MySQL'da xatosiz ishladi va to'g'ri saraladi. Hujjatdagi cheklov boshqa: bunday `ORDER BY` da `jadval.ustun` ko'rinishidagi nom ishlatib bo'lmaydi — birinchi so'rovda alias berib, shunga murojaat qilish kerak. Tartib raqami (`ORDER BY 1`) ham ishlaydi, lekin hujjatga ko'ra u **eskirgan** (deprecated) va kelajakda olib tashlanishi mumkin.

**Xato kodi.** Ustunlar soni farq qilsa:

```text
ERROR 1222 (21000) at line 19: The used SELECT statements have a different number of columns
```

### SQLite

**`INTERSECT ALL` va `EXCEPT ALL` yo'q.** SQLite sintaksisida `compound-operator`: `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`. Hujjatga ko'ra `INTERSECT` va `EXCEPT` natijasidan takrorlar doim olib tashlanadi:

```text
Parse error near line 11: near "ALL": syntax error
  SELECT * FROM c INTERSECT ALL SELECT * FROM c ORDER BY m, n;
              error here ---^
```

**Ustuvorlik yo'q — chapdan o'ngga.** Hujjatga ko'ra uch va undan ortiq `SELECT` chapdan o'ngga guruhlanadi: `A op B op C` = `(A op B) op C`. `INTERSECT` ning ustunligi yo'q:

```sql
SELECT * FROM a UNION SELECT * FROM b INTERSECT SELECT * FROM c ORDER BY m, n;
```

```text
m  n
-  -
1  3
3  4
```

PostgreSQL va MySQL'da 4 qator, SQLite'da 2 qator — **bir xil so'rov, boshqa natija**, xatosiz. Ko'chiriladigan kodda `INTERSECT` ni boshqa amallar bilan aralashtirsangiz, qavs (SQLite'da — subquery) bilan aniq yozing.

**Qismlarda `ORDER BY`/`LIMIT` yo'q.** Hujjatga ko'ra qismlar oddiy `SELECT` bo'lishi kerak, `ORDER BY` va `LIMIT` faqat butun so'rov oxirida. Qavs ham yordam bermaydi:

```text
Parse error near line 17: ORDER BY clause should come after UNION not before
Parse error near line 18: near "(": syntax error
  (SELECT m FROM a ORDER BY m DESC LIMIT 1) UNION (SELECT m FROM b ORDER BY m LI
  ^--- error here
```

Yo'li — qismni `FROM` dagi subquery'ga o'rash (sinovda ishladi):

```sql
SELECT * FROM (SELECT m FROM a ORDER BY m DESC LIMIT 1)
UNION
SELECT * FROM (SELECT m FROM b ORDER BY m LIMIT 1)
ORDER BY m;
```

```text
1
3
```

**`ORDER BY` — faqat natija ustuni.** PostgreSQL kabi ifoda bo'yicha saralab bo'lmaydi:

```text
Parse error near line 16: 1st ORDER BY term does not match any column in the result set
```

**Tiplar aralashishi mumkin.** Hujjatga ko'ra qatorlarni taqqoslashda affinity o'zgarishlari qo'llanmaydi. Bitta ustunda ham butun son, ham matn bo'ladi:

```text
1|integer
2|integer
3|integer
matn|text
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `UNION [ALL]`, `INTERSECT`, `EXCEPT` | Ha | Ha | Ha |
| `INTERSECT ALL`, `EXCEPT ALL` | Ha | Ha | **Yo'q** |
| `INTERSECT` ustunroq | Ha | Ha | **Yo'q**, chapdan o'ngga |
| Qism ichida `ORDER BY … LIMIT` | Qavsda | Qavsda | Faqat `FROM (subquery)` orqali |
| Yakuniy `ORDER BY` ifoda bilan | Yo'q | Ha | Yo'q |
| Tiplar mos kelmasa | Bitta tipga keltiradi yoki xato | Umumiy tipga kengaytiradi | Har qiymat o'z tipida |
| `NULL` takror hisoblanadi | Ha | Ha | Ha |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Takror bo'lmasa ham `UNION` | Ortiqcha takror qidirish | `UNION ALL` |
| Takrorlar kerak bo'lganda `UNION` | Teng qatorlar jimgina yo'qoladi | `UNION ALL` |
| `… UNION SELECT … LIMIT 10` ni ikkinchi qism `LIMIT` i deb o'ylash | `LIMIT` butun natijaga tegishli | Qismni qavsga olish |
| Qism ichida `LIMIT` siz `ORDER BY` | Yakuniy tartibga ta'sir qilmaydi | Tartib — oxirgi `ORDER BY` da |
| `INTERSECT` ni `UNION`/`EXCEPT` bilan qavssiz aralashtirish | SQLite'da natija boshqa, xatosiz | Qavs yoki subquery |
| `EXCEPT` da so'rovlar o'rnini almashtirish | `EXCEPT` commutative emas | Qaysi to'plamdan ayirilayotganini tekshirish |
| Ustunlar tartibini adashtirish | Soni va tipi mos bo'lsa xato chiqmaydi, ma'nosiz natija | Ustunlarni har qismda bir xil tartibda yozish |
| SQLite'da `INTERSECT ALL`/`EXCEPT ALL` | Sintaksis xatosi | Takrorlar hisobi kerak bo'lsa — `GROUP BY` va `count` bilan |

## Amaliyot

1. `a`, `b`, `c` uchun `UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT` natijalarini oldindan qo'lda hisoblang, keyin tekshiring.
2. `b EXCEPT a` va `a EXCEPT b` ni solishtiring.
3. `a UNION b INTERSECT c` ni uchala tizimda ishga tushiring. Keyin uchalasida ham bir xil natija beradigan qilib qayta yozing.
4. `a` va `b` ning har biridan `m` bo'yicha eng katta qatorni bitta natijada chiqaring (PostgreSQL/MySQL'da qavs, SQLite'da subquery).
5. 27-bobdagi `guruhlar`/`baholar` jadvallarida: talabasi bor guruhlar `id` sini `INTERSECT` bilan, talabasi yo'q guruhlarnikini `EXCEPT` bilan toping. `baholar.guruh_id` dagi `NULL` `EXCEPT` ga xalaqit berdimi? 27-bobdagi `NOT IN` bilan solishtiring.

## Rasmiy hujjat

- PostgreSQL — 7.4. Combining Queries (UNION, INTERSECT, EXCEPT): <https://www.postgresql.org/docs/18/queries-union.html>
- PostgreSQL — SELECT (UNION, INTERSECT, EXCEPT Clause; `ALL` takrorlari): <https://www.postgresql.org/docs/18/sql-select.html>
- MySQL — 15.2.14 Set Operations with UNION, INTERSECT, and EXCEPT: <https://dev.mysql.com/doc/refman/9.7/en/set-operations.html>
- MySQL — 15.2.18 UNION Clause: <https://dev.mysql.com/doc/refman/9.7/en/union.html>
- MySQL — 15.2.8 INTERSECT Clause: <https://dev.mysql.com/doc/refman/9.7/en/intersect.html>
- MySQL — 15.2.4 EXCEPT Clause: <https://dev.mysql.com/doc/refman/9.7/en/except.html>
- SQLite — SELECT (3. Compound Select Statements): <https://www.sqlite.org/lang_select.html>
