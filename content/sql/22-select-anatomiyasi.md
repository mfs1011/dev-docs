# 22 — `SELECT` anatomiyasi

[← Oldingi: Ommaviy yuklash](21-ommaviy-yuklash.md) · [Mundarija](README.md) · [Keyingi: Filtrlash →](23-filtrlash.md)

## Tushuncha

`SELECT` — SQL'ning eng ko'p ishlatiladigan buyrug'i. U bir nechta **banddan** iborat:

```sql
WITH …            -- yordamchi so'rovlar (29-bob)
SELECT …          -- natija ustunlari
FROM …            -- qaysi jadvallardan (25-bob)
WHERE …           -- qaysi qatorlar (23-bob)
GROUP BY …        -- guruhlash (26-bob)
HAVING …          -- qaysi guruhlar (26-bob)
ORDER BY …        -- tartib (24-bob)
LIMIT … OFFSET …  -- nechta qator (24-bob)
```

Bandlar shu tartibda **yoziladi**, lekin boshqa tartibda **bajariladi**. Buni tushunish keyingi boblardagi ko'p "nega ishlamaydi?" savolining javobi.

### Bajarilish tartibi

PostgreSQL'ning `SELECT` hujjatida umumiy tartib quyidagicha:

| № | Bosqich | Nima bo'ladi |
| --- | --- | --- |
| 1 | `WITH` | Yordamchi so'rovlar hisoblanadi |
| 2 | `FROM` | Barcha jadvallar (haqiqiy va virtual) hisoblanadi. Bir nechtasi bo'lsa, ular o'zaro birlashtiriladi |
| 3 | `WHERE` | Shartga mos kelmagan qatorlar olib tashlanadi |
| 4 | `GROUP BY` / agregatlar | Qatorlar guruhlarga bo'linadi, agregat funksiyalar hisoblanadi |
| 5 | `HAVING` | Shartga mos kelmagan guruhlar olib tashlanadi |
| 6 | `SELECT` ro'yxati | Natija ustunlari hisoblanadi |
| 7 | `DISTINCT` | Takror qatorlar olib tashlanadi |
| 8 | `UNION` / `INTERSECT` / `EXCEPT` | Bir nechta `SELECT` natijasi birlashtiriladi (28-bob) |
| 9 | `ORDER BY` | Saralanadi. Yozilmasa, qatorlar tizim uchun eng tez tartibda qaytadi |
| 10 | `LIMIT` / `OFFSET` | Natijaning bir qismi olinadi |
| 11 | `FOR UPDATE` va boshqalar | Tanlangan qatorlar qulflanadi (53-bob) |

Hujjat 6-bosqich haqida bitta izoh beradi: natija ustunlari "rasman" shu bosqichda hisoblanadi, lekin ularga `GROUP BY` da nomi yoki tartib raqami bilan murojaat qilish mumkin.

PostgreSQL'ning "Queries" bobi buni shunday tushuntiradi: `FROM`, `WHERE`, `GROUP BY`, `HAVING` dan iborat **jadval ifodasi** oraliq virtual jadval yaratadi. `SELECT` ro'yxati esa shu jadvaldan qaysi ustunlar chiqishini belgilaydi.

### Bundan nima kelib chiqadi: aliaslar

Ustunga `AS` bilan nom (**alias**) berish mumkin: `SELECT summa * 1.12 AS qqs_bilan`. Lekin alias 6-bosqichda paydo bo'ladi. Undan oldingi bosqichlar uni "bilmaydi". PostgreSQL hujjatidagi qoida:

> Natija ustunining nomi `ORDER BY` va `GROUP BY` da ishlatilishi mumkin, lekin **`WHERE` va `HAVING` da emas**. U yerda ifodani to'liq yozish kerak.

### `SELECT` ro'yxati

- `*` — jadval ifodasidagi barcha ustunlar. `jadval.*` — faqat shu jadvalnikilar.
- Ustun nomlari bir nechta jadvalda takrorlansa, jadval nomi bilan yoziladi: `t1.a, t2.a`.
- Ifoda (`summa * 1.12`) har natija qatori uchun hisoblanadi. U jadvalga umuman murojaat qilmasligi ham mumkin: `SELECT 1 + 1`.

**Alias nomi.** `AS` yozilmasa, nomni tizim beradi:

- oddiy ustun uchun — ustun nomi;
- funksiya uchun — funksiya nomi;
- murakkab ifoda uchun — umumiy nom, PostgreSQL'da `?column?`.

`AS` ko'pincha ixtiyoriy. Lekin alias kalit so'z bilan bir xil bo'lsa (masalan, `from`), `AS` yoki qo'shtirnoq majburiy. Hujjat kelajakdagi yangi kalit so'zlardan himoyalanish uchun **doim `AS` yozishni** tavsiya qiladi.

### `DISTINCT`

`SELECT DISTINCT` takror qatorlarni olib tashlaydi. Ikki qator kamida bitta ustunda farq qilsa, ular har xil hisoblanadi. Bu solishtirishda `NULL` lar **teng** hisoblanadi. 10-bobdagi `=` dan farqi shu.

**`DISTINCT ON (ifoda)`** (PostgreSQL) — ifoda bir xil bo'lgan qatorlar guruhidan **faqat birinchisini** qoldiradi. Hujjat ogohlantiradi:

- so'rov yetarli darajada saralanmagan bo'lsa, "birinchi qator" oldindan aytib bo'lmaydigan bo'ladi. `DISTINCT ON` `ORDER BY` dan keyin ishlaydi;
- `DISTINCT ON` standartda yo'q va natijasi noaniq bo'lishi mumkinligi uchun ba'zan "yomon uslub" hisoblanadi;
- lekin hujjatga ko'ra u ko'pincha eng qulay yo'l.

### `VALUES`

`VALUES` jadval kabi ishlatilishi mumkin (18-bob): `SELECT … FROM (VALUES (1, 'a'), (2, 'b')) AS t(raqam, harf)`.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

```sql
CREATE TABLE sotuvlar (id int PRIMARY KEY, sotuvchi text, shahar text, summa numeric);
INSERT INTO sotuvlar VALUES
    (1,'Ali','Toshkent',500), (2,'Ali','Toshkent',300), (3,'Vali','Samarqand',700),
    (4,'Vali','Toshkent',200), (5,'Sobir','Buxoro',900), (6,'Sobir','Buxoro',100);
```

### Alias `WHERE` da ishlamaydi

```sql
SELECT sotuvchi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan > 500;
```

```text
ERROR:  column "qqs_bilan" does not exist
LINE 1: ...hi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan ...
                                                             ^
```

`WHERE` (3-bosqich) bajarilayotganda `qqs_bilan` (6-bosqich) hali yo'q. Ifodani to'liq yozamiz. `ORDER BY` (9-bosqich) esa aliasni biladi:

```sql
SELECT sotuvchi, summa * 1.12 AS qqs_bilan
FROM sotuvlar
WHERE summa * 1.12 > 500
ORDER BY qqs_bilan DESC;
```

```text
 sotuvchi | qqs_bilan 
----------+-----------
 Sobir    |   1008.00
 Vali     |    784.00
 Ali      |    560.00
(3 rows)
```

### Alias `HAVING` da ham ishlamaydi

```sql
SELECT sotuvchi, sum(summa) AS jami FROM sotuvlar GROUP BY sotuvchi HAVING jami > 700;
```

```text
ERROR:  column "jami" does not exist
```

`GROUP BY` va `ORDER BY` da esa ustunga nomi yoki **tartib raqami** bilan murojaat qilish mumkin:

```sql
SELECT sotuvchi, sum(summa) AS jami
FROM sotuvlar
GROUP BY 1
HAVING sum(summa) > 700
ORDER BY 2 DESC;
```

```text
 sotuvchi | jami 
----------+------
 Sobir    | 1000
 Vali     |  900
 Ali      |  800
(3 rows)
```

### `DISTINCT` va `DISTINCT ON`

```sql
SELECT DISTINCT shahar FROM sotuvlar ORDER BY shahar;
```

```text
  shahar   
-----------
 Buxoro
 Samarqand
 Toshkent
(3 rows)
```

Har sotuvchining **eng katta** savdosi. `ORDER BY` "birinchi"ni aniq belgilaydi:

```sql
SELECT DISTINCT ON (sotuvchi) sotuvchi, shahar, summa
FROM sotuvlar
ORDER BY sotuvchi, summa DESC;
```

```text
 sotuvchi |  shahar   | summa 
----------+-----------+-------
 Ali      | Toshkent  |   500
 Sobir    | Buxoro    |   900
 Vali     | Samarqand |   700
(3 rows)
```

`ORDER BY` da `summa DESC` bo'lmasa, qaysi qator qolishi noaniq bo'lardi.

### Tushib qolgan vergul

```sql
SELECT sotuvchi shahar FROM sotuvlar WHERE id = 1;
```

```text
 shahar 
--------
 Ali
(1 row)
```

`sotuvchi` va `shahar` orasida vergul unutildi. Xato chiqmadi: `shahar` `sotuvchi` ustunining **aliasi** bo'lib qoldi. MySQL hujjati aynan shu "nozik muammo"dan ogohlantiradi. Sababi — `AS` ixtiyoriy.

### Kalit so'z alias sifatida

```sql
SELECT a from FROM (VALUES (1)) t(a);
SELECT a AS from FROM (VALUES (1)) t(a);
```

```text
ERROR:  syntax error at or near "FROM"
 from 
------
    1
(1 row)
```

### Jadvalsiz `SELECT`

```sql
SELECT 1 + 1 AS ikki, now() IS NOT NULL AS vaqt_bor;
```

```text
 ikki | vaqt_bor 
------+----------
    2 | t
(1 row)
```

## Dialektlar

### MySQL

**Alias `WHERE` da** ishlamaydi. MySQL hujjatining izohi: `WHERE` bajarilayotganda ustun qiymati "hali aniqlanmagan bo'lishi mumkin":

```text
ERROR 1054 (42S22) at line 3: Unknown column 'qqs_bilan' in 'where clause'
```

**Alias `HAVING` da ishlaydi.** Hujjatga ko'ra alias `GROUP BY`, `ORDER BY` va `HAVING` da ishlatilishi mumkin. Bu PostgreSQL'dan farq:

```sql
SELECT sotuvchi, SUM(summa) AS jami FROM sotuvlar GROUP BY sotuvchi HAVING jami > 700 ORDER BY jami DESC;
```

```text
+----------+---------+
| sotuvchi | jami    |
+----------+---------+
| Sobir    | 1000.00 |
| Vali     |  900.00 |
| Ali      |  800.00 |
+----------+---------+
```

**`DISTINCT ON` yo'q:**

```text
ERROR 1064 (42000) at line 5: … near 'ON (sotuvchi) sotuvchi, summa FROM sotuvlar' at line 1
```

Bunday holatlar window funksiyalar bilan yechiladi (31-bob).

**`FROM DUAL`.** Jadvalsiz `SELECT` da MySQL "soxta" `DUAL` jadvalini ham qabul qiladi. Hujjatga ko'ra bu faqat har `SELECT` da `FROM` bo'lishini talab qiladiganlar uchun qulaylik. MySQL `FROM DUAL` ni talab qilmaydi:

```sql
SELECT 1 + 1 FROM DUAL;
```

### SQLite

Sinovda SQLite aliasni **`WHERE` da ham, `HAVING` da ham** qabul qildi:

```text
SQLite-3.54 memory-> SELECT sotuvchi, summa * 1.12 AS qqs_bilan FROM sotuvlar WHERE qqs_bilan > 700;
sotuvchi|qqs_bilan
Vali|784.00000000000011
Sobir|1008.0000000000001
SQLite-3.54 memory-> SELECT sotuvchi, sum(summa) AS jami FROM sotuvlar GROUP BY sotuvchi HAVING jami > 800;
sotuvchi|jami
Sobir|1000
Vali|900
```

Bu xatti-harakat SQLite hujjatining `SELECT` sahifasida alohida tushuntirilmagan. Bunday so'rov PostgreSQL'ga ko'chirilganda ishlamaydi, shuning uchun unga tayanmagan ma'qul.

Natijadagi `784.00000000000011` — `summa * 1.12` hisobi taqribiy `REAL` da bajarilgan (6-bob). SQLite'da `DISTINCT ON` ham yo'q.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Alias `WHERE` da | Yo'q | Yo'q | Sinovda ishladi |
| Alias `HAVING` da | Yo'q | Ha | Sinovda ishladi |
| Alias `GROUP BY`/`ORDER BY` da | Ha | Ha | Ha |
| Ustun tartib raqami (`GROUP BY 1`) | Ha | Ha | Ha |
| `DISTINCT ON` | Ha (kengaytma) | Yo'q | Yo'q |
| Jadvalsiz `SELECT` | Ha | Ha, `FROM DUAL` ham | Ha |
| Nomsiz ifoda ustuni | `?column?` | Ifoda matni (`1 + 1`) | Ifoda matni |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Aliasni `WHERE` da ishlatish | PostgreSQL va MySQL'da xato; SQLite'da ishlasa ham ko'chirib bo'lmaydi | Ifodani takrorlash yoki subquery/CTE (27, 29-boblar) |
| PostgreSQL'da aliasni `HAVING` da ishlatish (MySQL'dan o'tganda) | `column does not exist` | Agregat ifodani to'liq yozish |
| `SELECT a b FROM …` — vergulni unutish | Xato chiqmaydi, `b` alias bo'lib qoladi | `AS` ni doim yozish va natija ustunlarini tekshirish |
| `DISTINCT ON` ni yetarli `ORDER BY` siz ishlatish | Qaysi qator qolishi noaniq | `ORDER BY` da guruh ichidagi tartibni ham ko'rsatish |
| `SELECT *` ni ilova kodida ishlatish | Jadvalga ustun qo'shilsa, natija o'zgaradi; ortiqcha ma'lumot o'tadi | Kerakli ustunlarni sanab yozish |
| `GROUP BY 1, 2` ni katta so'rovlarda ishlatish | Ustunlar tartibi o'zgarsa, so'rov boshqa narsani guruhlaydi | Ustun nomlari bilan yozish |
| `DISTINCT` ni "takrorlar chiqyapti" degan muammoni yashirish uchun qo'yish | Ko'pincha noto'g'ri JOIN yashirinib qoladi | Takror sababini topish (25-bob) |

## Amaliyot

1. `sotuvlar` jadvalidan har shahar bo'yicha jami savdoni chiqaring, faqat jami 500 dan oshganlarini, kamayish tartibida. So'rovni yozishdan oldin har band qaysi bosqichda bajarilishini yozib chiqing.
2. Xuddi shu so'rovni aliasni `HAVING` da ishlatib, uchala tizimda bajaring. Natijalarni solishtiring.
3. `DISTINCT ON` bilan har shahardagi eng kichik savdoni toping. Keyin `ORDER BY` dagi ikkinchi ustunni olib tashlab, natijani kuzating.
4. `SELECT 1, 'a', now(), 2 + 2;` ni uchala tizimda bajarib, avtomatik ustun nomlarini solishtiring.
5. Qasddan vergul qoldirib (`SELECT id sotuvchi, summa FROM sotuvlar`) natijani o'qing. Xatoni qanday sezgan bo'lardingiz?

## Rasmiy hujjat

- PostgreSQL — SELECT (Description: umumiy bajarilish tartibi): <https://www.postgresql.org/docs/18/sql-select.html>
- PostgreSQL — 7.1. Queries Overview: <https://www.postgresql.org/docs/18/queries-overview.html>
- PostgreSQL — 7.3. Select Lists: <https://www.postgresql.org/docs/18/queries-select-lists.html>
- PostgreSQL — 7.7. VALUES Lists: <https://www.postgresql.org/docs/18/queries-values.html>
- MySQL — 15.2.13 SELECT Statement: <https://dev.mysql.com/doc/refman/9.7/en/select.html>
- MySQL — B.3.4.4 Problems with Column Aliases: <https://dev.mysql.com/doc/refman/9.7/en/problems-with-alias.html>
- SQLite — SELECT: <https://www.sqlite.org/lang_select.html>
