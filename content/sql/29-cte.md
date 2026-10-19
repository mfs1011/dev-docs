# 29 — CTE

[← Oldingi: Set amallari](28-set-amallari.md) · [Mundarija](README.md) · [Keyingi: Rekursiv CTE →](30-rekursiv-cte.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/29-1-tushuncha.jpg">
    <source src="/video/sql/29-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/29-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/29-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>29.1-video. CTE tushunchasi: WITH sintaksisi, hosila jadvaldan farqlari, materializatsiya va ma'lumotni o'zgartiruvchi CTE</figcaption>
</figure>


**CTE** (Common Table Expression, "umumiy jadval ifodasi") — so'rov boshida `WITH` bilan nom berilgan yordamchi so'rov. MySQL hujjati ta'rifi: bitta operator doirasida mavjud bo'lgan, shu operator ichida (bir necha marta ham) murojaat qilinadigan **nomli vaqtinchalik natija**. SQLite hujjati: CTE — faqat bitta SQL operatori davomida yashaydigan **vaqtinchalik view**.

```sql
WITH nom1 [(ustun, …)] AS (so'rov1),
     nom2 [(ustun, …)] AS (so'rov2)
SELECT … FROM nom1 JOIN nom2 …;
```

PostgreSQL hujjatiga ko'ra `WITH` ning asosiy foydasi — murakkab so'rovni **sodda qismlarga bo'lish**. Hujjatdagi misolni `WITH` siz ham yozish mumkin edi, lekin ikki qavat ichma-ich subquery kerak bo'lardi.

Qoidalar (MySQL va PostgreSQL hujjatlari):

- bitta `WITH` da bir nechta CTE **vergul** bilan yoziladi; bir darajada ikkinchi `WITH` yozib bo'lmaydi;
- CTE nomlari bitta `WITH` ichida takrorlanmaydi;
- CTE o'zidan **oldin** yozilgan CTE'ga murojaat qila oladi, keyingisiga emas (o'ziga murojaat — rekursiv CTE, 30-bob);
- ustun nomlari: CTE nomidan keyin qavsda berilsa — shular; aks holda ichki so'rovning `SELECT` ro'yxatidan.

### CTE va hosila jadval

MySQL hujjati CTE'ni hosila jadval (27-bob) bilan solishtiradi. Ikkalasi ham nomli va bitta operator doirasida yashaydi, ko'pincha bir-birining o'rnini bosadi. CTE'ning afzalliklari:

- hosila jadvalga so'rovda **bir marta** murojaat qilinadi; CTE'ga — **ko'p marta**;
- CTE o'ziga murojaat qila oladi (rekursiv);
- bitta CTE boshqasiga murojaat qila oladi;
- ta'rif operator boshida turadi, ichiga ko'milmaydi — o'qish osonroq.

### Materializatsiya

**Materializatsiya** (materialization) — CTE natijasini alohida hisoblab, vaqtinchalik jadvalga saqlash. Muqobili — CTE'ni tashqi so'rovga **qo'shib yuborish** (inline, fold): xuddi subquery yozilgandek optimizatsiya qilinadi.

PostgreSQL hujjatiga ko'ra:

- CTE odatda tashqi so'rovning bir bajarilishida **bir marta** hisoblanadi — bir necha joyda ishlatilsa ham. Qimmat hisob takrorlanmaydi;
- teskari tomoni: optimizator tashqi so'rov shartlarini ko'p marta ishlatilgan CTE ichiga **tushira olmaydi**;
- CTE rekursiv bo'lmasa va yon ta'sirsiz bo'lsa (o'zgaruvchan — volatile — funksiyasiz `SELECT`), **bir marta** ishlatilganda u tashqi so'rovga qo'shib yuboriladi; ko'p marta ishlatilganda — yo'q;
- `AS MATERIALIZED` — majburan alohida hisoblash; `AS NOT MATERIALIZED` — majburan qo'shib yuborish. Ikkinchisi hisobni takrorlashi mumkin, lekin har ishlatish natijaning kichik qismini olsa, foyda beradi.

### Ma'lumotni o'zgartiruvchi CTE (PostgreSQL)

PostgreSQL'da `WITH` ichida `INSERT`, `UPDATE`, `DELETE`, `MERGE` ham bo'ladi. Hujjatga ko'ra:

- tashqi so'rov ko'radigan "vaqtinchalik jadval" — o'zgargan jadvalning o'zi emas, **`RETURNING`** natijasi (19-bob). `RETURNING` siz CTE'ga murojaat qilib bo'lmaydi, lekin u baribir bajariladi;
- bunday CTE faqat **eng yuqori darajadagi** operatorga biriktirilgan `WITH` da bo'ladi;
- u tashqi so'rov natijasini o'qiydimi-yo'qmi — **aniq bir marta va oxirigacha** bajariladi (`SELECT` CTE esa faqat kerakli qismigacha);
- barcha qism-operatorlar **bir xil snapshot** bilan bajariladi (snapshot — ma'lumotlar bazasining bir lahzadagi holati, 52-bob): ular bir-birining o'zgarishini jadvalda **ko'rmaydi**. O'zgarishni uzatishning yagona yo'li — `RETURNING`;
- bitta qatorni bir operatorda ikki marta o'zgartirish qo'llab-quvvatlanmaydi — qaysi o'zgarish qolishini oldindan aytib bo'lmaydi.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/29-2-kod.jpg">
    <source src="/video/sql/29-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/29-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/29-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>29.2-video. PostgreSQL 18 da CTE amaliyoti: zanjirli CTE, ustun nomlari, sintaksis xatolari, EXPLAIN rejasi va DELETE + RETURNING</figcaption>
</figure>


Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Jadvallar 27-bobdagidek, qo'shimcha `arxiv` jadvali bilan:

```sql
CREATE TABLE guruhlar (id int PRIMARY KEY, nom varchar(10));
CREATE TABLE baholar (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
CREATE TABLE arxiv   (id int PRIMARY KEY, guruh_id int, ism varchar(20), ball int);
INSERT INTO guruhlar VALUES (1,'A'), (2,'B'), (3,'C');
INSERT INTO baholar VALUES
    (1,1,'Ali',85), (2,2,'Vali',92), (3,1,'Sobir',90),
    (4,2,'Dilnoza',88), (5,1,'Malika',NULL), (6,NULL,'Jasur',70);
```

### Bir nechta CTE, biri boshqasiga tayanadi

O'rtacha bali eng yuqori guruhning talabalari (PostgreSQL hujjatidagi `regional_sales` → `top_regions` misoli tuzilishida):

```sql
WITH guruh_ortacha AS (
    SELECT guruh_id, avg(ball) AS ortacha FROM baholar
    WHERE guruh_id IS NOT NULL GROUP BY guruh_id
),
eng_yaxshi AS (
    SELECT guruh_id FROM guruh_ortacha
    WHERE ortacha = (SELECT max(ortacha) FROM guruh_ortacha)
)
SELECT b.ism, b.ball FROM baholar b
WHERE b.guruh_id IN (SELECT guruh_id FROM eng_yaxshi)
ORDER BY b.ball DESC;
```

```text
   ism   | ball 
---------+------
 Vali    |   92
 Dilnoza |   88
(2 rows)
```

`A` o'rtachasi (85 + 90) / 2 = 87.5 (`Malika` ning `NULL` i hisobga kirmaydi, 26-bob), `B` — 90. `guruh_ortacha` ikki joyda ishlatildi: `eng_yaxshi` ichida ikki marta. Uchala tizimda natija bir xil.

### Ustun nomlari ro'yxati

```sql
WITH s (guruh, soni) AS (SELECT guruh_id, count(*) FROM baholar GROUP BY guruh_id)
SELECT g.nom, s.soni FROM guruhlar g JOIN s ON s.guruh = g.id ORDER BY g.nom;
```

```text
 nom | soni 
-----+------
 A   |    3
 B   |    2
(2 rows)
```

### Sintaksis qoidalari

Ikki `WITH` ketma-ket — xato; oldinga murojaat — xato:

```sql
WITH a AS (SELECT 1 AS x) WITH b AS (SELECT 2 AS y) SELECT * FROM a, b;
WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a;
```

```text
ERROR:  syntax error at or near "WITH"
ERROR:  relation "b" does not exist
DETAIL:  There is a WITH item named "b", but it cannot be referenced from this part of the query.
HINT:  Use WITH RECURSIVE, or re-order the WITH items to remove forward references.
```

To'g'ri yozuv — bitta `WITH`, vergul, to'g'ri tartib: `WITH b AS (…), a AS (SELECT * FROM b) …`.

### `WITH` + `UPDATE`

```sql
WITH m AS (SELECT max(ball) AS mx FROM baholar)
UPDATE baholar SET ball = (SELECT mx FROM m) WHERE id = 5;
```

```text
UPDATE 1
  ism   | ball 
--------+------
 Malika |   92
(1 row)
```

27-bobda ko'rganimizdek, MySQL'da `UPDATE baholar … (SELECT … FROM baholar)` xato beradi. CTE orqali yozilgani esa MySQL'da ham ishladi — MySQL hujjati 1093-xato uchun aynan shu yo'lni ko'rsatadi.

### Materializatsiya: rejada ko'rinishi

`EXPLAIN` (45-bob) so'rov rejasini ko'rsatadi. Bir marta ishlatilgan CTE va `MATERIALIZED`:

```sql
EXPLAIN (COSTS OFF)
WITH w AS (SELECT * FROM baholar) SELECT * FROM w WHERE id = 2;

EXPLAIN (COSTS OFF)
WITH w AS MATERIALIZED (SELECT * FROM baholar) SELECT * FROM w WHERE id = 2;
```

```text
                QUERY PLAN                
------------------------------------------
 Index Scan using baholar_pkey on baholar
   Index Cond: (id = 2)
(2 rows)

         QUERY PLAN          
-----------------------------
 CTE Scan on w
   Filter: (id = 2)
   CTE w
     ->  Seq Scan on baholar
(4 rows)
```

- Birinchisida CTE qo'shib yuborildi: `id = 2` sharti to'g'ridan-to'g'ri jadvalga tushdi va birlamchi kalit indeksi ishlatildi.
- Ikkinchisida avval **butun** jadval o'qildi (`Seq Scan`), natija saqlandi, keyin filtrlandi. Hujjatdagi `big_table` misoli aynan shu farqni tasvirlaydi.

### Ma'lumotni o'zgartiruvchi CTE: qatorlarni ko'chirish

PostgreSQL hujjatidagi `moved_rows` misoli — 86 dan past ballilarni `arxiv` ga ko'chirish:

```sql
WITH kochirilgan AS (
    DELETE FROM baholar WHERE ball < 86 RETURNING *
)
INSERT INTO arxiv SELECT * FROM kochirilgan;
```

```text
DELETE 2
INSERT 0 2
```

`arxiv`: `Ali` (85), `Jasur` (70). `baholar` da 4 qator qoldi. O'chirish va qo'shish — **bitta** operator, demak bitta tranzaksiya (50-bob): yo hammasi, yo hech narsa.

### Bir xil snapshot

```sql
WITH t AS (UPDATE baholar SET ball = ball + 1 RETURNING *)
SELECT ism, ball FROM baholar ORDER BY id;

WITH t AS (UPDATE baholar SET ball = ball + 1 RETURNING *)
SELECT ism, ball FROM t ORDER BY id;
```

```text
   ism   | ball 
---------+------
 Vali    |   92
 Sobir   |   90
 Dilnoza |   88
 Malika  |   92
(4 rows)

   ism   | ball 
---------+------
 Vali    |   94
 Sobir   |   92
 Dilnoza |   90
 Malika  |   94
(4 rows)
```

- Birinchisida tashqi `SELECT` jadvaldan **eski** qiymatlarni ko'rdi — `UPDATE` bajarilgan bo'lsa ham (bir xil snapshot).
- Ikkinchisida `RETURNING` natijasi o'qildi: ikkala `UPDATE` dan keyingi qiymatlar (+2).

### O'zgartiruvchi CTE faqat yuqori darajada

```sql
SELECT * FROM baholar
WHERE id IN (WITH t AS (DELETE FROM arxiv RETURNING id) SELECT id FROM t);
```

```text
ERROR:  WITH clause containing a data-modifying statement must be at the top level
```

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/29-3-dialektlar.jpg">
    <source src="/video/sql/29-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/29-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/29-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>29.3-video. MySQL va SQLite da CTE: WITH va INSERT cheklovi, 1093 xatosi yechimi, MATERIALIZED maslahati va oldinga murojaat</figcaption>
</figure>


### MySQL

**Oddiy CTE bor**, qoidalar PostgreSQL bilan bir xil: ikkinchi `WITH` — sintaksis xatosi, oldinga murojaat — `Table 'qollanma.b' doesn't exist`. Hujjatga ko'ra nomlarni aniqlashda hosila jadvallar CTE'larni, CTE'lar esa oddiy jadval, `TEMPORARY` jadval va view'larni "yopib qo'yadi".

**`WITH` qayerda.** Hujjatga ko'ra `WITH` `SELECT`, `UPDATE`, `DELETE` boshida, subquery boshida va `INSERT … WITH … SELECT` kabi `SELECT` dan bevosita oldin turadi. `INSERT` dan **oldin** — yo'q:

```sql
WITH t AS (SELECT 1) INSERT INTO arxiv SELECT * FROM baholar WHERE id = 6;
INSERT INTO arxiv WITH t AS (SELECT 1) SELECT * FROM baholar WHERE id = 4;
```

```text
ERROR 1064 (42000) at line 24: … near 'INSERT INTO arxiv SELECT * FROM baholar WHERE id = 6' at line 1
```

Ikkinchisi ishladi (`arxiv` da faqat `Dilnoza`).

**`MATERIALIZED` yo'q.** Bu kalit so'z PostgreSQL'dan (SQLite hujjati buni ochiq aytadi), MySQL sintaksisida yo'q:

```text
ERROR 1064 (42000) at line 21: … near 'MATERIALIZED (SELECT * FROM baholar) SELECT count(*) FROM w' at line 1
```

CTE optimizatsiyasi uchun MySQL hujjati "Optimizing Derived Tables, View References, and Common Table Expressions with Merging or Materialization" (10.2.2.4) bo'limiga yuboradi: MySQL ham CTE'ni tashqi so'rovga qo'shib yuborishi (merge) yoki materializatsiya qilishi mumkin, lekin buni so'rov matnida `MATERIALIZED` bilan boshqarib bo'lmaydi.

**Ma'lumotni o'zgartiruvchi CTE yo'q.** MySQL sintaksisida CTE — `AS (subquery)`, ya'ni faqat so'rov. `RETURNING` ham yo'q (19-bob):

```text
ERROR 1064 (42000) at line 27: … near 'DELETE FROM baholar WHERE ball < 86 RETURNING *) INSERT INTO arxiv SELECT * FROM' at line 1
```

Qatorlarni ko'chirish MySQL'da ikki operator bilan, bitta tranzaksiyada: avval `INSERT … SELECT`, keyin `DELETE` (50-bob).

### SQLite

**Oddiy CTE bor.** SQLite hujjatiga ko'ra `WITH` `SELECT`, `INSERT`, `DELETE`, `UPDATE` oldiga qo'yiladi — `WITH … INSERT` ham, `INSERT … WITH … SELECT` ham ishladi (`arxiv` da `Dilnoza` va `Jasur`).

**`MATERIALIZED` / `NOT MATERIALIZED` bor**, lekin hujjatga ko'ra bu **majburiy bo'lmagan maslahat** (non-binding hint), PostgreSQL'dan olingan nostandart sintaksis:

- `MATERIALIZED` — natija vaqtinchalik jadvalga yoziladi; hujjat buni "optimizatsiya to'sig'i" (optimization fence) deydi va "xato emas, xususiyat" deb ta'kidlaydi;
- `NOT MATERIALIZED` — har murojaat o'rniga subquery qo'yiladi. Lekin nomiga qaramay, materializatsiyani **taqiqlamaydi** — rejalashtiruvchi baribir uni tanlashi mumkin;
- hujjat tavsiyasi: jiddiy sabab bo'lmasa, hech qaysisini yozmang.

**Oldinga murojaat ishladi.** PostgreSQL va MySQL rad etgan so'rov SQLite'da xatosiz natija berdi:

```sql
WITH a AS (SELECT * FROM b), b AS (SELECT 1 AS x) SELECT * FROM a;
```

```text
x
-
1
```

Hujjatda bu haqda alohida qoida yo'q; faqat SQLite `RECURSIVE` so'zini talab qilmasligi yozilgan (SQL:1999 talab qiladi, SQLite SQL Server va Oracle bilan moslik uchun talab qilmaydi). Ko'chiriladigan kodda CTE'larni doim to'g'ri tartibda yozing.

**Cheklovlar** (hujjat): `WITH` `CREATE TRIGGER` ichida ishlatilmaydi; compound `SELECT` ning ikkinchi va keyingi qismlari oldiga qo'yilmaydi.

**Ma'lumotni o'zgartiruvchi CTE yo'q:**

```text
Parse error near line 27: near "DELETE": syntax error
  WITH k AS (DELETE FROM baholar WHERE ball < 86 RETURNING *) INSERT INTO arxiv 
             ^--- error here
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Oddiy CTE | Ha | Ha | Ha |
| `WITH … INSERT` | Ha | Yo'q (`INSERT … WITH … SELECT`) | Ha |
| `WITH … UPDATE/DELETE` | Ha | Ha | Ha |
| `[NOT] MATERIALIZED` | Ha, majburiy | Yo'q | Ha, maslahat |
| CTE ichida `INSERT/UPDATE/DELETE` | Ha (`RETURNING` bilan) | Yo'q | Yo'q |
| Oldinga murojaat | Xato | Xato | Ishladi (hujjatlanmagan) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ikkinchi `WITH` yozish | Sintaksis xatosi | Bitta `WITH`, CTE'lar vergul bilan |
| CTE'ni keyinroq yozilgan CTE'ga tayantirish | PG/MySQL'da xato | Tartibni almashtirish |
| PostgreSQL'da ko'p ishlatilgan katta CTE'ga filtr qo'yish | Shart CTE ichiga tushmaydi, butun natija hisoblanadi | Filtrni CTE ichiga yozish yoki `NOT MATERIALIZED` |
| CTE'ni "kesh" deb hisoblab, SQLite'da `NOT MATERIALIZED` ga tayanish | Bu faqat maslahat | Rejani `EXPLAIN QUERY PLAN` bilan tekshirish (45-bob) |
| O'zgartiruvchi CTE'dan keyin jadvalni qayta o'qish | Bir xil snapshot: eski qiymatlar | `RETURNING` natijasini o'qish |
| Bitta qatorni ikki CTE'da o'zgartirish | Natija oldindan aytib bo'lmaydi | Har qatorni bitta joyda o'zgartirish |
| `WITH … INSERT` ni MySQL'ga ko'chirish | Sintaksis xatosi | `INSERT … WITH … SELECT` |

## Amaliyot

1. 27-bobdagi "guruhlar talabalar sonining o'rtachasi" so'rovini hosila jadval o'rniga CTE bilan yozing.
2. Bitta so'rovda ikki CTE: guruh o'rtachalari va umumiy o'rtacha. O'rtachasi umumiydan yuqori guruhlarni chiqaring.
3. PostgreSQL'da `EXPLAIN` bilan: CTE ikki marta ishlatilganda (masalan, o'zi bilan `JOIN`) rejada nima o'zgaradi? `NOT MATERIALIZED` qo'shib ko'ring.
4. PostgreSQL'da bitta operator bilan: bahosi yo'q talabalarni `baholar` dan o'chirib, `arxiv` ga yozing va nechta qator ko'chganini `SELECT count(*) FROM …` bilan qaytaring.
5. Xuddi shu vazifani MySQL'da ikki operator bilan bajaring.

## Rasmiy hujjat

- PostgreSQL — 7.8. WITH Queries (Common Table Expressions): <https://www.postgresql.org/docs/18/queries-with.html>
- MySQL — 15.2.20 WITH (Common Table Expressions): <https://dev.mysql.com/doc/refman/9.7/en/with.html>
- MySQL — 15.2.15.10 Subquery Errors (1093 va CTE): <https://dev.mysql.com/doc/refman/9.7/en/subquery-errors.html>
- SQLite — The WITH Clause: <https://www.sqlite.org/lang_with.html>
