# 24 — Saralash va cheklash

[← Oldingi: Filtrlash](23-filtrlash.md) · [Mundarija](README.md) · [Keyingi: JOIN'lar →](25-joinlar.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/24-1-tushuncha.jpg">
    <source src="/video/sql/24-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/24-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/24-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>24.1-video. ORDER BY, LIMIT va sahifalash asoslari</figcaption>
</figure>

### `ORDER BY`

1-bobda ko'rganimizdek, SQL qatorlar tartibini kafolatlamaydi. PostgreSQL hujjati buni yana ta'kidlaydi: saralash tanlanmasa, qatorlar "noma'lum tartibda" qaytadi. Haqiqiy tartib qanday skanerlash, qanday birlashtirish rejasi tanlangani va qatorlar diskda qanday joylashganiga bog'liq. Lekin unga **tayanib bo'lmaydi**. Muayyan tartib faqat saralash aniq so'ralganda kafolatlanadi.

```sql
SELECT … FROM …
ORDER BY ifoda1 [ASC | DESC] [NULLS { FIRST | LAST }]
       [, ifoda2 [ASC | DESC] [NULLS { FIRST | LAST }] …]
```

Qoidalar:

- `ASC` (sukut bo'yicha) — o'sish tartibi, `DESC` — kamayish;
- bir nechta ifoda bo'lsa, keyingisi faqat oldingilari **teng** bo'lgan qatorlarni saralaydi;
- `ASC`/`DESC` **har ustunga alohida** qo'llanadi. Hujjatdagi misol: `ORDER BY x, y DESC` — bu `x ASC, y DESC`, `x DESC, y DESC` emas;
- saralash ifodasi `SELECT` ro'yxatida bo'lishi mumkin bo'lgan har qanday ifoda bo'ladi. Natija ustunining nomi yoki **tartib raqami** ham bo'ladi (22-bob).

Lekin hujjatga ko'ra natija ustunining nomi **yolg'iz** turishi kerak. `ORDER BY sum + c` kabi ifoda ichida ishlatib bo'lmaydi.

**`NULL` ning o'rni.** PostgreSQL'da `NULL` saralashda **har qanday qiymatdan katta** hisoblanadi:

- `ASC` da oxirida;
- `DESC` da boshida.

Buni `NULLS FIRST` / `NULLS LAST` bilan o'zgartirish mumkin.

### `LIMIT`, `OFFSET` va `FETCH`

```sql
… ORDER BY … LIMIT soni OFFSET boshlash;
… ORDER BY … OFFSET boshlash ROWS FETCH FIRST soni ROWS { ONLY | WITH TIES };   -- standart
```

- `LIMIT n` — ko'pi bilan `n` ta qator;
- `OFFSET m` — avval `m` ta qatorni o'tkazib yuboradi;
- `FETCH FIRST … ROWS ONLY` — standartdagi yozuv. Hujjatga ko'ra `ROW`/`ROWS` va `FIRST`/`NEXT` "shovqin so'zlar", ma'noga ta'sir qilmaydi;
- `WITH TIES` — oxirgi o'rinni **teng** egallagan qatorlarni ham qaytaradi. Buning uchun `ORDER BY` majburiy.

Hujjatdagi ikki muhim ogohlantirish:

> **`LIMIT` doim yagona tartibni ta'minlaydigan `ORDER BY` bilan.** Aks holda qatorlarning **oldindan aytib bo'lmaydigan** qismi qaytadi. "O'ninchidan yigirmanchigacha" qatorlar — lekin qaysi tartibda? Bundan tashqari, rejalashtiruvchi `LIMIT`/`OFFSET` ni hisobga oladi. Shuning uchun turli qiymatlarda turli reja va turli tartib chiqishi mumkin. Hujjat: "Bu xato emas".
>
> **Katta `OFFSET` samarasiz bo'lishi mumkin.** O'tkazib yuborilgan qatorlar ham serverda baribir hisoblanadi (48-bob).

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/24-2-kod.jpg">
    <source src="/video/sql/24-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/24-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/24-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>24.2-video. PostgreSQL 18: ORDER BY, NULLS LAST va WITH TIES</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

```sql
CREATE TABLE talabalar2 (id int PRIMARY KEY, ism text, guruh text, ball int);
INSERT INTO talabalar2 VALUES
    (1,'Ali','A',85), (2,'Vali','B',92), (3,'Sobir','A',NULL),
    (4,'Dilnoza','B',92), (5,'Malika','A',78), (6,'Jasur','B',85);
```

### `NULL` qayerda turadi

```sql
SELECT ism, ball FROM talabalar2 ORDER BY ball;
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC;
```

```text
   ism   | ball 
---------+------
 Malika  |   78
 Ali     |   85
 Jasur   |   85
 Vali    |   92
 Dilnoza |   92
 Sobir   |     
(6 rows)

   ism   | ball 
---------+------
 Sobir   |     
 Vali    |   92
 Dilnoza |   92
 Ali     |   85
 Jasur   |   85
 Malika  |   78
(6 rows)
```

"Eng yuqori ball" ro'yxatining **boshida** bali noma'lum Sobir turibdi. Bu kamdan-kam istalgan natija:

```sql
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST;
```

```text
   ism   | ball 
---------+------
 Vali    |   92
 Dilnoza |   92
 Ali     |   85
 Jasur   |   85
 Malika  |   78
 Sobir   |     
(6 rows)
```

### Bir nechta ustun bo'yicha

```sql
SELECT guruh, ism, ball FROM talabalar2 ORDER BY guruh, ball DESC;
```

```text
 guruh |   ism   | ball 
-------+---------+------
 A     | Sobir   |     
 A     | Ali     |   85
 A     | Malika  |   78
 B     | Vali    |   92
 B     | Dilnoza |   92
 B     | Jasur   |   85
(6 rows)
```

`guruh` o'sish, guruh ichida `ball` kamayish tartibida.

Diqqat: Vali va Dilnoza ikkalasida 92. Ularning o'zaro tartibi **kafolatlanmagan**. Barqaror tartib kerak bo'lsa, oxiriga takrorlanmas ustun qo'shiladi: `ORDER BY guruh, ball DESC, id`.

### `LIMIT` va `WITH TIES`

"Eng yaxshi uchta" talaba:

```sql
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST LIMIT 3;
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST FETCH FIRST 3 ROWS WITH TIES;
```

```text
   ism   | ball 
---------+------
 Vali    |   92
 Dilnoza |   92
 Ali     |   85
(3 rows)

   ism   | ball 
---------+------
 Vali    |   92
 Dilnoza |   92
 Ali     |   85
 Jasur   |   85
(4 rows)
```

`LIMIT 3` Ali bilan bir xil balli Jasurni kesib tashladi. Qaysi biri tashlanishi esa oldindan aniq emas. `WITH TIES` 3-o'rindagi hammasini qoldirdi.

```sql
SELECT ism, ball FROM talabalar2 FETCH FIRST 3 ROWS WITH TIES;
```

```text
ERROR:  WITH TIES cannot be specified without ORDER BY clause
```

### `OFFSET`: ikki xil yozuv

```sql
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST OFFSET 2 ROWS FETCH NEXT 2 ROWS ONLY;
SELECT ism, ball FROM talabalar2 ORDER BY ball DESC NULLS LAST LIMIT 2 OFFSET 2;
```

```text
  ism  | ball 
-------+------
 Ali   |   85
 Jasur |   85
(2 rows)
```

Ikkalasi bir xil natija beradi: birinchisi standart yozuv, ikkinchisi keng tarqalgan kengaytma.

### Alias ifoda ichida

```sql
SELECT ball * 2 AS ikki, ism FROM talabalar2 ORDER BY ikki + 1;
```

```text
ERROR:  column "ikki" does not exist
```

Hujjatdagi qoida: natija ustunining nomi `ORDER BY` da faqat **yolg'iz** ishlatiladi.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/24-3-dialektlar.jpg">
    <source src="/video/sql/24-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/24-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/24-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>24.3-video. MySQL va SQLite da saralash o'ziga xosliklari</figcaption>
</figure>

### MySQL

**`NULL` saralashda eng kichik.** MySQL hujjatiga ko'ra `ORDER BY … ASC` da `NULL` lar **boshida**, `DESC` da **oxirida** chiqadi. Bu PostgreSQL'ning aksi:

```text
-- ORDER BY ball                     -- ORDER BY ball DESC
| Sobir   | NULL |                   | Vali    |   92 |
| Malika  |   78 |                   | Dilnoza |   92 |
| Ali     |   85 |                   | Ali     |   85 |
| …                                  | …
                                     | Sobir   | NULL |
```

**`NULLS FIRST/LAST` yo'q.** `NULL` lar tartibini o'zgartirish uchun ifoda bo'yicha saralanadi: `ball IS NULL` — `NULL` uchun 1, boshqalar uchun 0.

```sql
SELECT ism, ball FROM t2 ORDER BY ball DESC NULLS LAST;
SELECT ism, ball FROM t2 ORDER BY ball IS NULL, ball DESC;
```

```text
ERROR 1064 (42000) at line 5: … near 'NULLS LAST' at line 1
+---------+------+
| ism     | ball |
+---------+------+
| Vali    |   92 |
| Dilnoza |   92 |
| Ali     |   85 |
| Jasur   |   85 |
| Malika  |   78 |
| Sobir   | NULL |
+---------+------+
```

**`LIMIT`.** MySQL'da `LIMIT n OFFSET m` ham, `LIMIT m, n` ham bor. Diqqat, ikkinchisida birinchi son **offset**. Hujjatga ko'ra boshlang'ich qatorning offseti 0, 1 emas. Standartdagi `FETCH FIRST` yo'q:

```sql
SELECT ism, ball FROM t2 ORDER BY ball DESC LIMIT 2, 2;
SELECT ism, ball FROM t2 ORDER BY ball DESC FETCH FIRST 2 ROWS ONLY;
```

```text
+-------+------+
| ism   | ball |
+-------+------+
| Ali   |   85 |
| Jasur |   85 |
+-------+------+
ERROR 1064 (42000) at line 8: … near 'FETCH FIRST 2 ROWS ONLY' at line 1
```

### SQLite

SQLite hujjatiga ko'ra `NULL` saralashda **eng kichik** qiymat. Natijada MySQL'dagidek: `ASC` da boshida, `DESC` da oxirida. Lekin bu yerda `ASC NULLS LAST` va `DESC NULLS FIRST` bor:

```text
SQLite-3.54 memory-> SELECT ism, ball FROM t2 ORDER BY ball;
Sobir|
Malika|78
…
SQLite-3.54 memory-> SELECT ism, ball FROM t2 ORDER BY ball DESC NULLS FIRST LIMIT 3;
Sobir|
Vali|92
Dilnoza|92
```

`LIMIT n OFFSET m` va `LIMIT m, n` ikkalasi bor. `FETCH FIRST` yo'q:

```text
SQLite-3.54 memory-> SELECT ism, ball FROM t2 ORDER BY ball DESC LIMIT 2, 2;
Ali|85
Jasur|85
SQLite-3.54 memory-> SELECT ism FROM t2 ORDER BY ball DESC FETCH FIRST 2 ROWS ONLY;
Parse error near line 8: near "FETCH": syntax error
```

Hujjatga ko'ra `LIMIT` manfiy son bo'lsa, qatorlar soniga **chegara yo'q**.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `NULL` saralashda | Eng katta: `ASC` — oxirida | Eng kichik: `ASC` — boshida | Eng kichik: `ASC` — boshida |
| `NULLS FIRST/LAST` | Ha | Yo'q (`ORDER BY x IS NULL, x`) | Ha |
| `LIMIT n OFFSET m` | Ha | Ha | Ha |
| `LIMIT m, n` | Yo'q | Ha | Ha |
| `FETCH FIRST … ONLY` (standart) | Ha | Yo'q | Yo'q |
| `WITH TIES` | Ha | Yo'q | Yo'q |
| `ORDER BY 1` (tartib raqami) | Ha | Ha | Ha |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `ORDER BY` siz `LIMIT` | Qaysi qatorlar qaytishi noma'lum; har safar boshqacha bo'lishi mumkin | Doim `ORDER BY` |
| `ORDER BY` takrorlanadigan ustun bo'yicha, keyin sahifalash | Teng qatorlar sahifalar orasida "sakrab" turadi, takrorlanadi yoki yo'qoladi | Oxiriga takrorlanmas ustun: `ORDER BY ball DESC, id` |
| "Top N" da `NULL` larni hisobga olmaslik (PostgreSQL `DESC`) | Noma'lum qiymatlar ro'yxat boshiga chiqadi | `NULLS LAST` yoki `WHERE … IS NOT NULL` |
| Tizimlar orasida ko'chirganda `NULL` tartibini bir xil deb o'ylash | PostgreSQL va MySQL/SQLite aksincha | `NULLS FIRST/LAST` ni aniq yozish; MySQL'da `x IS NULL` |
| `ORDER BY x, y DESC` ni ikkalasi ham kamayish deb o'ylash | `DESC` faqat `y` ga tegishli | Har ustunga yo'nalishni yozish |
| MySQL'da `LIMIT 10, 20` ni "10 ta, 20-dan boshlab" deb o'qish | Birinchi son — offset | `LIMIT 20 OFFSET 10` |
| "Top 3" ni `LIMIT 3` bilan, tenglar bo'lishi mumkin bo'lganda | Teng balli talaba tasodifan tushib qoladi | `FETCH FIRST 3 ROWS WITH TIES` yoki window funksiyalar (31-bob) |
| Katta sahifa raqamlari bilan `OFFSET` | O'tkazib yuborilgan qatorlar ham hisoblanadi, sekin | Keyset sahifalash (48-bob) |

## Amaliyot

1. Talabalarni guruh bo'yicha o'sish, ball bo'yicha kamayish, teng ballda ism bo'yicha alifbo tartibida saralang.
2. `ball` ustunida `NULL` bo'lgan holda "eng past 2 ball"ni uchala tizimda toping. `NULL` qayerga tushdi?
3. PostgreSQL'da `FETCH FIRST 1 ROW WITH TIES` bilan eng yuqori ballni olgan **hamma** talabani toping.
4. 6 ta talabani har sahifada 2 tadan sahifalang (`LIMIT`/`OFFSET`). Keyin `ORDER BY ball` (`id` siz) bilan takrorlang va teng ballilar sahifalarda qanday taqsimlanganini kuzating.
5. MySQL'da `NULLS LAST` ning o'rnini bosadigan uchta usulni toping va sinab ko'ring.

## Rasmiy hujjat

- PostgreSQL — 7.5. Sorting Rows (ORDER BY): <https://www.postgresql.org/docs/18/queries-order.html>
- PostgreSQL — 7.6. LIMIT and OFFSET: <https://www.postgresql.org/docs/18/queries-limit.html>
- PostgreSQL — SELECT (`FETCH`, `WITH TIES`): <https://www.postgresql.org/docs/18/sql-select.html>
- MySQL — 15.2.13 SELECT Statement (`ORDER BY`, `LIMIT`): <https://dev.mysql.com/doc/refman/9.7/en/select.html>
- MySQL — 5.3.4.6 Working with NULL Values (`NULL` tartibi): <https://dev.mysql.com/doc/refman/9.7/en/working-with-null.html>
- SQLite — SELECT (ORDER BY, LIMIT): <https://www.sqlite.org/lang_select.html>
