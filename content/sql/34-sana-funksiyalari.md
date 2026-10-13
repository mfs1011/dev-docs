# 34 — Sana funksiyalari

[← Oldingi: Matn funksiyalari](33-matn-funksiyalari.md) · [Mundarija](README.md) · [Keyingi: JSON →](35-json.md)

## Tushuncha

8-bobda sana va vaqt **tiplari**, vaqt zonalari va interval arifmetikasi ko'rildi. Bu bobda sanalar bilan ishlaydigan **funksiyalar**: qismini ajratish, yaxlitlash (oy, soat, 15 daqiqa bo'yicha), ikki sana orasidagi farq, joriy vaqt va bo'sh kunlarni to'ldirish. Hisobotlarning ko'pchiligi aynan shulardan quriladi: "har oy bo'yicha savdo", "har kun, savdo bo'lmagan kunlar ham".

### Qismini ajratish: `extract`

PostgreSQL hujjatiga ko'ra `EXTRACT(maydon FROM manba)` sana/vaqt qiymatidan yil, oy, soat kabi qismni oladi va `numeric` qaytaradi. Asosiy maydonlar: `year`, `month`, `day`, `hour`, `minute`, `second`, `dow`, `isodow`, `doy`, `week`, `epoch`.

**Hafta kuni — eng ko'p adashtiriladigan joy.** Har tizimda raqamlash boshqacha:

| | Dushanba | … | Shanba | Yakshanba |
| --- | --- | --- | --- | --- |
| PG `extract(dow …)` | 1 | | 6 | **0** |
| PG `extract(isodow …)` (ISO 8601) | 1 | | 6 | **7** |
| MySQL `DAYOFWEEK()` (ODBC) | **2** | | 7 | **1** |
| MySQL `WEEKDAY()` | **0** | | 5 | 6 |
| SQLite `strftime('%w', …)` | 1 | | 6 | 0 |
| SQLite `strftime('%u', …)` | 1 | | 6 | 7 |

Ya'ni "dushanba" PostgreSQL'da `1`, MySQL `DAYOFWEEK` da `2`, `WEEKDAY` da `0`. PostgreSQL hujjati qo'shimcha ogohlantiradi: `extract` dagi hafta kuni raqamlashi `to_char(…, 'D')` nikidan ham farq qiladi.

### Yaxlitlash: `date_trunc` va `date_bin`

**`date_trunc(maydon, qiymat)`** — PostgreSQL hujjatiga ko'ra sonlar uchun `trunc` ga o'xshaydi: berilgan maydondan kichik barcha maydonlar nolga (kun va oy uchun — birga) tushiriladi. `date_trunc('month', …)` — oy boshi, `date_trunc('hour', …)` — soat boshi. `timestamptz` uchun yaxlitlash joriy vaqt zonasiga nisbatan bajariladi (yoki uchinchi argumentdagi zonaga).

**`date_bin(qadam, qiymat, boshlanish)`** — qiymatni ixtiyoriy uzunlikdagi "savat"ga (bin) joylaydi: 15 daqiqa, 5 soniya, 6 soat. Hujjatga ko'ra butun birliklarda (1 daqiqa, 1 soat) u `date_trunc` bilan bir xil natija beradi, farqi — ixtiyoriy oraliq. Cheklov: qadamda oy va undan katta birlik bo'lmaydi.

### Farq: kunlar, oylar, yillar

PostgreSQL'da (8-bob) `timestamp` ayirmasi `interval`, `date` ayirmasi butun son (kunlar). `age(a, b)` esa hujjatga ko'ra yil va oylardan foydalanadigan **"ramziy"** (symbolic) natija beradi — faqat kunlar emas.

MySQL'da `DATEDIFF(a, b)` — faqat sana qismlari bo'yicha kunlar; `TIMESTAMPDIFF(birlik, a, b)` — `b − a` ni berilgan birlikda **butun son** sifatida.

### Joriy vaqt: tranzaksiya, operator, soat

PostgreSQL hujjatiga ko'ra standart `CURRENT_DATE`, `CURRENT_TIMESTAMP`, `LOCALTIMESTAMP` **joriy tranzaksiya boshlangan** vaqtni qaytaradi va tranzaksiya davomida o'zgarmaydi. Hujjat buni "xususiyat" deydi: bitta tranzaksiyadagi barcha o'zgarishlar bir xil vaqt belgisini oladi.

| PostgreSQL | Qaytaradi |
| --- | --- |
| `now()`, `transaction_timestamp()`, `CURRENT_TIMESTAMP` | Tranzaksiya boshlanishi |
| `statement_timestamp()` | Joriy operator boshlanishi |
| `clock_timestamp()` | Haqiqiy joriy vaqt — bitta operator ichida ham o'zgaradi |

Hujjat: "Boshqa ma'lumotlar bazalari bu qiymatlarni tez-tez yangilashi mumkin". MySQL'da `NOW()` — **operator** boshlangan vaqt, `SYSDATE()` — chaqirilgan paytdagi vaqt. SQLite'da `'now'` bitta `sqlite3_step()` chaqiruvi ichida bir xil qiymat beradi va doim UTC.

### Bo'sh kunlarni to'ldirish

`GROUP BY` faqat ma'lumot **bor** kunlarni qaytaradi. Savdo bo'lmagan kun hisobotda umuman ko'rinmaydi. Yechim — avval barcha kunlar ro'yxatini yasab, keyin unga `LEFT JOIN` (25-bob) qilish:

- PostgreSQL'da `generate_series(boshi, oxiri, qadam)` — hujjatga ko'ra `timestamp` uchun ham ishlaydi;
- MySQL va SQLite'da `generate_series` yo'q — rekursiv CTE (30-bob).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. MySQL'da ustun tipi `DATETIME`, SQLite'da `text` (ISO 8601, 8-bob).

```sql
CREATE TABLE sotuvlar (id int PRIMARY KEY, vaqt timestamp, summa int);
INSERT INTO sotuvlar VALUES
    (1, '2026-01-30 09:12:00', 120), (2, '2026-01-31 18:47:30',  80),
    (3, '2026-02-02 10:05:00', 200), (4, '2026-02-02 10:21:00',  50),
    (5, '2026-02-05 23:59:59',  70), (6, '2026-03-01 00:00:00',  90);
```

Natijalar PostgreSQL'dan.

### `extract`: yil, oy, hafta kuni

```sql
SELECT id, vaqt,
       extract(year FROM vaqt) AS yil, extract(month FROM vaqt) AS oy,
       extract(dow FROM vaqt) AS dow, extract(isodow FROM vaqt) AS isodow
FROM sotuvlar ORDER BY id;
```

```text
 id |        vaqt         | yil  | oy | dow | isodow 
----+---------------------+------+----+-----+--------
  1 | 2026-01-30 09:12:00 | 2026 |  1 |   5 |      5
  2 | 2026-01-31 18:47:30 | 2026 |  1 |   6 |      6
  3 | 2026-02-02 10:05:00 | 2026 |  2 |   1 |      1
  4 | 2026-02-02 10:21:00 | 2026 |  2 |   1 |      1
  5 | 2026-02-05 23:59:59 | 2026 |  2 |   4 |      4
  6 | 2026-03-01 00:00:00 | 2026 |  3 |   0 |      7
(6 rows)
```

2026-03-01 — yakshanba: `dow` = 0, `isodow` = 7. Qolgan kunlarda ikkalasi bir xil.

### Oylik hisobot: `date_trunc`

```sql
SELECT date_trunc('month', vaqt) AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;
```

```text
         oy          | soni | jami 
---------------------+------+------
 2026-01-01 00:00:00 |    2 |  200
 2026-02-01 00:00:00 |    3 |  320
 2026-03-01 00:00:00 |    1 |   90
(3 rows)
```

`extract(month …)` bo'yicha guruhlash ham 3 qator berardi, lekin turli yillarning yanvarlari bitta guruhga tushib qolardi. `date_trunc` yilni saqlaydi.

### Soat va 15 daqiqa: `date_bin`

```sql
SELECT id, vaqt, date_trunc('hour', vaqt) AS soat,
       date_bin('15 minutes', vaqt, timestamp '2026-01-01') AS chorak
FROM sotuvlar WHERE id IN (3, 4) ORDER BY id;
```

```text
 id |        vaqt         |        soat         |       chorak        
----+---------------------+---------------------+---------------------
  3 | 2026-02-02 10:05:00 | 2026-02-02 10:00:00 | 2026-02-02 10:00:00
  4 | 2026-02-02 10:21:00 | 2026-02-02 10:00:00 | 2026-02-02 10:15:00
(2 rows)
```

Ikkalasi bir soatda, lekin turli choraklarda.

### Har kun, bo'sh kunlar bilan: `generate_series`

```sql
SELECT k.kun::date AS kun, count(s.id) AS soni, coalesce(sum(s.summa), 0) AS jami
FROM generate_series(timestamp '2026-02-01', timestamp '2026-02-06', interval '1 day') AS k(kun)
LEFT JOIN sotuvlar s ON s.vaqt >= k.kun AND s.vaqt < k.kun + interval '1 day'
GROUP BY k.kun ORDER BY k.kun;
```

```text
    kun     | soni | jami 
------------+------+------
 2026-02-01 |    0 |    0
 2026-02-02 |    2 |  250
 2026-02-03 |    0 |    0
 2026-02-04 |    0 |    0
 2026-02-05 |    1 |   70
 2026-02-06 |    0 |    0
(6 rows)
```

E'tibor bering:

- shart `s.vaqt >= kun AND s.vaqt < kun + 1 kun` — yarim ochiq oraliq. `23:59:59` dagi savdo (5-qator) ham to'g'ri kunga tushdi. `vaqt::date = kun` ham ishlaydi, lekin ustunga funksiya qo'llansa oddiy indeks ishlatilmaydi (47-bob);
- `count(s.id)` — `count(*)` emas (26-bob): bo'sh kunlar 0 ko'rsatadi;
- `coalesce(sum(…), 0)` — bo'sh kun `sum` i `NULL` (26-bob).

### Farq: `age`, ayirma

```sql
SELECT age(timestamp '2026-03-01', timestamp '2024-01-15') AS yosh,
       timestamp '2026-03-01' - timestamp '2024-01-15' AS ayirma,
       date '2026-03-01' - date '2024-01-15' AS kunlar;
```

```text
         yosh          |  ayirma  | kunlar 
-----------------------+----------+--------
 2 years 1 mon 17 days | 776 days |    776
(1 row)
```

`age` yil-oy-kun ko'rinishida, `timestamp` ayirmasi — faqat kunlar (`interval`), `date` ayirmasi — butun son.

### Oy oxiri va formatlash

```sql
SELECT (date_trunc('month', date '2026-02-10') + interval '1 month - 1 day')::date AS oy_oxiri;
SELECT to_char(timestamp '2026-02-05 23:59:59', 'DD.MM.YYYY HH24:MI') AS uz_format;
```

```text
  oy_oxiri  
------------
 2026-02-28
(1 row)

    uz_format     
------------------
 05.02.2026 23:59
(1 row)
```

Oy boshi + 1 oy − 1 kun = oy oxiri. Formatlash (`to_char`) odatda ilovada qilinadi; ma'lumot bazasida sana sana bo'lib qolgani yaxshi.

### Joriy vaqt tranzaksiya ichida

```sql
BEGIN;
SELECT now() = transaction_timestamp() AS bir_xil, now() = clock_timestamp() AS soat_bilan;
SELECT pg_sleep(0.1);
SELECT now() = transaction_timestamp() AS hali_ham, statement_timestamp() > now() AS keyin;
COMMIT;
```

```text
 bir_xil | soat_bilan 
---------+------------
 t       | f
(1 row)

 hali_ham | keyin 
----------+-------
 t        | t
(1 row)
```

0.1 soniyadan keyin ham `now()` tranzaksiya boshidagi qiymatda qoldi; `statement_timestamp()` esa yangi operator bilan oldinga ketdi.

## Dialektlar

### MySQL

**`date_trunc` yo'q** (`FUNCTION qollanma.date_trunc does not exist`). Oy boshi uchun hujjatdagi `DATE_FORMAT` bilan:

```sql
SELECT DATE_FORMAT(vaqt, '%Y-%m-01') AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;
```

Natija PostgreSQL bilan bir xil (`2026-01-01 | 2 | 200` …). Diqqat: `DATE_FORMAT` **satr** qaytaradi, sana emas.

**Hafta kuni:**

```sql
SELECT id, DAYOFWEEK(vaqt) AS dayofweek, WEEKDAY(vaqt) AS weekday FROM sotuvlar ORDER BY id;
```

```text
+----+-----------+---------+
| id | dayofweek | weekday |
+----+-----------+---------+
|  1 |         6 |       4 |
|  2 |         7 |       5 |
|  3 |         2 |       0 |
…
|  6 |         1 |       6 |
+----+-----------+---------+
```

Dushanba (3-qator): PostgreSQL `isodow` = 1, MySQL `DAYOFWEEK` = 2, `WEEKDAY` = 0.

**Bo'sh kunlar — rekursiv CTE:**

```sql
WITH RECURSIVE k(kun) AS (
    SELECT DATE '2026-02-01'
    UNION ALL
    SELECT kun + INTERVAL 1 DAY FROM k WHERE kun < '2026-02-06'
)
SELECT k.kun, count(s.id) AS soni, COALESCE(sum(s.summa), 0) AS jami
FROM k LEFT JOIN sotuvlar s ON s.vaqt >= k.kun AND s.vaqt < k.kun + INTERVAL 1 DAY
GROUP BY k.kun ORDER BY k.kun;
```

Natija PostgreSQL bilan bir xil (6 qator). Uzoq davr uchun `cte_max_recursion_depth` (sukut 1000, 30-bob) ni hisobga oling.

**Farq: `TIMESTAMPDIFF`, `DATEDIFF`:**

```sql
SELECT TIMESTAMPDIFF(MONTH, '2024-01-15', '2026-03-01') AS oylar,
       TIMESTAMPDIFF(YEAR,  '2024-01-15', '2026-03-01') AS yillar,
       DATEDIFF('2026-03-01', '2024-01-15') AS kunlar;
```

```text
+-------+--------+--------+
| oylar | yillar | kunlar |
+-------+--------+--------+
|    25 |      2 |    776 |
+-------+--------+--------+
```

Argumentlar tartibiga diqqat: `TIMESTAMPDIFF(birlik, a, b)` = `b − a`, `DATEDIFF(a, b)` = `a − b`.

**Oy oxiri va format:** `LAST_DAY('2026-02-10')` → `2026-02-28`; `DATE_FORMAT('2026-02-05 23:59:59', '%d.%m.%Y %H:%i')` → `05.02.2026 23:59`. MySQL'da daqiqa — `%i`, `%M` esa oy nomi.

**`NOW()` va `SYSDATE()`.** Hujjatdagi misol tuzilishida:

```sql
SELECT NOW() = SYSDATE() AS a, SLEEP(1) AS s, NOW() = SYSDATE() AS b;
```

```text
+---+---+---+
| a | s | b |
+---+---+---+
| 1 | 0 | 0 |
+---+---+---+
```

`SLEEP(1)` dan keyin `NOW()` operator boshida qoldi, `SYSDATE()` esa 1 soniya oldinga ketdi. PostgreSQL'dan farqi: MySQL `NOW()` — **operator** boshi, PostgreSQL `now()` — **tranzaksiya** boshi.

**`date_bin` yo'q.** `generate_series` ham yo'q.

### SQLite

**Sana funksiyalari va modifikatorlar.** SQLite'da alohida sana tipi yo'q (8-bob). Hujjatga ko'ra yettita funksiya bor: `date()`, `time()`, `datetime()`, `julianday()`, `unixepoch()`, `strftime()`, `timediff()`. Ko'pi **modifikatorlar** oladi va ular chapdan o'ngga qo'llanadi: `'+1 day'`, `'start of month'`, `'end of month'`, `'weekday N'`, `'localtime'`.

**Qismini ajratish — `strftime`:**

```sql
SELECT id, strftime('%Y', vaqt) AS yil, strftime('%m', vaqt) AS oy,
       strftime('%w', vaqt) AS w, strftime('%u', vaqt) AS u,
       typeof(strftime('%Y', vaqt)) AS tip
FROM sotuvlar ORDER BY id;
```

```text
id  yil   oy  w  u  tip
--  ----  --  -  -  ----
 1  2026  01  5  5  text
…
 6  2026  03  0  7  text
```

`strftime` **matn** qaytaradi (`'01'`, son 1 emas) — songa solishtirishda `CAST` kerak. `%w` — PostgreSQL `dow`, `%u` — `isodow` bilan bir xil.

**Oy boshi, oy oxiri:**

```sql
SELECT date(vaqt, 'start of month') AS oy, count(*) AS soni, sum(summa) AS jami
FROM sotuvlar GROUP BY 1 ORDER BY 1;

SELECT date('2026-02-10', 'start of month', '+1 month', '-1 day') AS oy_oxiri,
       date('2026-02-10', 'end of month') AS end_of_month;
```

Natijalar PostgreSQL bilan bir xil: oylik hisobot 3 qator, oy oxiri `2026-02-28` (ikkala usul bilan).

**Bo'sh kunlar** — rekursiv CTE, `date(kun, '+1 day')` bilan; natija PostgreSQL bilan bir xil.

**Farq — `julianday` va `timediff`:**

```sql
SELECT julianday('2026-03-01') - julianday('2024-01-15') AS kunlar,
       timediff('2026-03-01', '2024-01-15') AS farq;
```

```text
kunlar            farq
------  ------------------------
 776.0  +0002-01-14 00:00:00.000
```

`julianday` ayirmasi — kunlar (haqiqiy son). `timediff` — hujjatga ko'ra ikkinchi sanani birinchiga "suradigan" vaqt siljishi. E'tibor bering: xuddi shu ikki sana uchun PostgreSQL `age` **`2 years 1 mon 17 days`**, SQLite `timediff` **`+0002-01-14`** berdi. Ikkalasi ham "yil-oy-kun", lekin hisob usuli boshqa — oylar uzunligi turlicha bo'lgani uchun yagona to'g'ri javob yo'q. SQLite hujjati shu noaniqlik haqida alohida yozadi (masalan, 2024-02-29 dan bir yil keyin — 2025-02-28 mi yoki 03-01 mi) va `ceiling`/`floor` modifikatorlarini beradi.

**15 daqiqalik savat** — Unix vaqt orqali:

```sql
SELECT datetime(strftime('%s', vaqt) / 900 * 900, 'unixepoch') AS chorak
FROM sotuvlar WHERE id IN (3, 4);
```

```text
2026-02-02 10:00:00
2026-02-02 10:15:00
```

**Xato modifikator — xato emas, `NULL`.** Hujjatga ko'ra modifikator tanilmasa yoki xato yozilsa, butun funksiya `NULL` qaytaradi:

```sql
SELECT date('2026-02-10', '+1 mont') AS xato;
```

Natija — bo'sh (`NULL`), hech qanday xabar yo'q.

### Qisqacha jadval

| Vazifa | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Qismini olish | `extract(… FROM …)` (`numeric`) | `EXTRACT`, `YEAR()`, `MONTH()` … | `strftime('%Y', …)` (**matn**) |
| Dushanba raqami | `dow` = 1, `isodow` = 1 | `DAYOFWEEK` = 2, `WEEKDAY` = 0 | `%w` = 1, `%u` = 1 |
| Oy boshi | `date_trunc('month', x)` | `DATE_FORMAT(x, '%Y-%m-01')` (matn) | `date(x, 'start of month')` |
| Ixtiyoriy oraliq | `date_bin` | Yo'q | `unixepoch` + butun bo'lish |
| Oy oxiri | `date_trunc` + `1 month - 1 day` | `LAST_DAY` | `'end of month'` |
| Kunlar farqi | `date − date` | `DATEDIFF(a, b)` = a − b | `julianday(a) − julianday(b)` |
| Oylar/yillar farqi | `age` (ramziy) | `TIMESTAMPDIFF` (butun) | `timediff` |
| Sanalar ketma-ketligi | `generate_series` | Rekursiv CTE | Rekursiv CTE |
| `now` qachon | Tranzaksiya boshi | Operator boshi (`SYSDATE` — hozir) | Bitta `sqlite3_step` ichida bir xil, UTC |
| Noto'g'ri sana (`2026-02-30`) | Xato | `SELECT` da `NULL` + ogohlantirish | Jimgina `NULL` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hafta kuni raqamini tizimlar orasida bir xil deb o'ylash | Dushanba: 0, 1 yoki 2 | ISO (`isodow`, `%u`) ni tanlash va hujjatlash |
| `extract(month …)` bo'yicha oylik hisobot | Turli yillar aralashadi | `date_trunc('month', …)` |
| `BETWEEN '2026-02-01' AND '2026-02-28'` bilan `timestamp` | Oxirgi kunning vaqtli qatorlari tushib qoladi | `>= boshi AND < keyingi_kun` |
| Bo'sh kunlarsiz kunlik hisobot | Grafikda "teshiklar" ko'rinmaydi | `generate_series` / rekursiv CTE + `LEFT JOIN` |
| PostgreSQL `now()` ni uzun tranzaksiyada "hozir" deb ishlatish | Tranzaksiya boshidagi vaqt | `clock_timestamp()` |
| MySQL `DATEDIFF` va `TIMESTAMPDIFF` argument tartibi | Ishora teskari | Hujjatdagi `b − a` / `a − b` ni tekshirish |
| SQLite `strftime` natijasini son bilan solishtirish | `'01' = 1` — yolg'on | `CAST(strftime(…) AS integer)` |
| SQLite modifikatorida xato | Jimgina `NULL` | Natijani tekshirish |
| `age`, `TIMESTAMPDIFF`, `timediff` ni bir xil deb o'ylash | Oy uzunligi tufayli natijalar farq qiladi | Kunlarda hisoblash yoki qoidani aniq belgilash |

## Amaliyot

1. Har oy bo'yicha savdo soni va summasini uchala tizimda chiqaring.
2. Hafta kunlari bo'yicha savdoni guruhlang. Natijada kun nomlari "Dushanba"…"Yakshanba" tartibida chiqsin (uchala tizimda bir xil).
3. 2026-01-28 dan 2026-03-02 gacha har kun uchun savdo summasini, bo'sh kunlar 0 bilan, chiqaring.
4. 2-fevral savdolarini soat bo'yicha, keyin 15 daqiqa bo'yicha guruhlang.
5. Har savdo uchun oy oxirigacha necha kun qolganini hisoblang.
6. PostgreSQL'da bitta tranzaksiyada uch marta `SELECT now(), clock_timestamp();` ni `pg_sleep(1)` bilan bajaring. MySQL'da `NOW()`, `SYSDATE()` bilan solishtiring.

## Rasmiy hujjat

- PostgreSQL — 9.9. Date/Time Functions and Operators (`extract`, `date_trunc`, `date_bin`, Current Date/Time): <https://www.postgresql.org/docs/18/functions-datetime.html>
- PostgreSQL — 9.26. Set Returning Functions (`generate_series`): <https://www.postgresql.org/docs/18/functions-srf.html>
- MySQL — 14.7 Date and Time Functions: <https://dev.mysql.com/doc/refman/9.7/en/date-and-time-functions.html>
- SQLite — Date And Time Functions: <https://www.sqlite.org/lang_datefunc.html>
