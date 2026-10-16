# 17 — View va materialized view

[← Oldingi: Jadvalni o'zgartirish](16-jadvalni-ozgartirish.md) · [Mundarija](README.md) · [Keyingi: INSERT, UPDATE, DELETE →](18-insert-update-delete.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/17-1-tushuncha.jpg" src="/video/sql/17-1-tushuncha.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/17-1-tushuncha.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/17-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: View va Materialized View — nomlangan virtual so'rovlar, yangilanish qoidalari va tezkor kesh</figcaption>
</figure>

### View

**View** — **nomlangan so'rov**. PostgreSQL qo'llanmasidagi misol: shahar va ob-havo jadvallarini birlashtiradigan so'rov ko'p ishlatilsa, uni har safar qayta yozmaslik uchun view yaratiladi. Keyin unga oddiy jadvaldek murojaat qilinadi:

```sql
CREATE VIEW myview AS
    SELECT name, temp_lo, temp_hi, prcp, date, location
    FROM weather, cities
    WHERE city = name;

SELECT * FROM myview;
```

Hujjat view'larning qadrini alohida ta'kidlaydi: "view'lardan keng foydalanish — yaxshi SQL baza dizaynining asosiy jihatlaridan biri". View'lar jadvallarning tuzilmasini, ya'ni ilova rivojlanishi bilan o'zgarishi mumkin bo'lgan tafsilotlarni, **o'zgarmas interfeys** ortiga yashiradi. View deyarli jadval ishlatiladigan har joyda ishlatiladi. View ustiga view qurish ham odatiy hol.

Muhim xususiyat: view **ma'lumot saqlamaydi**. `CREATE VIEW` hujjatiga ko'ra so'rov view'ga har murojaat qilinganda qayta bajariladi.

`CREATE OR REPLACE VIEW` mavjud view'ni almashtiradi. Bunda yangi so'rov eski ustunlarni **aynan shu nom, tartib va tiplarda** qaytarishi kerak. Faqat oxiriga yangi ustun qo'shish mumkin.

### Yangilanadigan view

PostgreSQL'da **oddiy** view'lar avtomatik **yangilanadigan** (*updatable*) bo'ladi. Ularga `INSERT`, `UPDATE`, `DELETE` va `MERGE` qo'llash mumkin. Baza bu buyruqlarni asosiy jadvalga o'tkazadi. Hujjatdagi shartlar:

- `FROM` da **bitta** element bo'lishi, u jadval yoki boshqa yangilanadigan view bo'lishi kerak;
- yuqori darajada `WITH`, `DISTINCT`, `GROUP BY`, `HAVING`, `LIMIT`, `OFFSET` bo'lmasligi kerak;
- `UNION`, `INTERSECT`, `EXCEPT` bo'lmasligi kerak;
- ustunlar ro'yxatida agregat, window yoki to'plam qaytaruvchi funksiya bo'lmasligi kerak.

Ustunlar ham farqlanadi: asosiy jadval ustuniga oddiy havola — yangilanadi, hisoblangan ustun esa faqat o'qiladi.

Murakkabroq view sukut bo'yicha faqat o'qish uchun. Unga yozish kerak bo'lsa, `INSTEAD OF` trigger yaratiladi (57-bob).

### `WITH CHECK OPTION`

View'da `WHERE` bo'lsa, u qaysi qatorlarni o'zgartirish mumkinligini cheklaydi. Lekin hujjat bir nozik jihatga e'tibor qaratadi:

- `UPDATE` qatorni shunday o'zgartirishi mumkinki, u endi `WHERE` ga mos kelmaydi va view'dan "yo'qoladi";
- `INSERT` ham view'da ko'rinmaydigan qator qo'shishi mumkin.

`WITH CHECK OPTION` bunga yo'l qo'ymaydi: view orqali faqat **shu view'da ko'rinadigan** qatorlarni yozish mumkin.

### Materialized view

**Materialized view** so'rov natijasini **jadval ko'rinishida saqlaydi**. Hujjatga ko'ra uning `CREATE TABLE … AS SELECT` dan ikki farqi bor:

- uni to'g'ridan-to'g'ri yangilab bo'lmaydi;
- so'rovi view so'rovi kabi saqlanadi. Shuning uchun ma'lumotni qayta hisoblash mumkin:

  ```sql
  REFRESH MATERIALIZED VIEW nom;
  ```

Hujjatdagi muvozanat: materialized view'dan o'qish ko'pincha asosiy jadvallardan yoki oddiy view'dan o'qishdan **ancha tez**. Lekin ma'lumot **har doim ham yangi emas**. Hujjatdagi misol — sotuvchilar uchun kunlik savdo grafigi. Bugungi tugallanmagan ma'lumot kerak emas, shuning uchun hisobot har kecha yangilansa yetarli.

**`REFRESH`** materialized view mazmunini to'liq almashtiradi. Oddiy `REFRESH` ko'p qator o'zgarganda kamroq resurs sarflaydi va tezroq tugaydi. Lekin u materialized view'dan **o'qiyotgan** boshqa ulanishlarni to'xtatib qo'yishi mumkin. `CONCURRENTLY` bilan o'qish to'xtamaydi. Buning ikki sharti bor:

- materialized view'da faqat ustun nomlaridan iborat, `WHERE` siz kamida bitta **`UNIQUE` indeks** bo'lishi kerak;
- materialized view allaqachon ma'lumot bilan to'ldirilgan bo'lishi kerak.

`CREATE MATERIALIZED VIEW` va `REFRESH MATERIALIZED VIEW` — PostgreSQL kengaytmalari, standartda yo'q.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/17-2-kod.jpg" src="/video/sql/17-2-kod.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/17-2-kod.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/17-2-kod.uz.vtt">
</video>
<figcaption>Video: PostgreSQL 18 da View amaliyoti — updatable view, WITH CHECK OPTION, GROUP BY cheklovi va REFRESH CONCURRENTLY</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Oddiy view

```sql
CREATE TABLE mahsulotlar (
    id int PRIMARY KEY, nom text NOT NULL, narx numeric NOT NULL,
    faol boolean NOT NULL DEFAULT true
);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, true), (2, 'Sut', 12000, true), (3, 'Eski choy', 9000, false);

CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol;
SELECT * FROM faol_mahsulotlar ORDER BY id;
```

```text
 id | nom | narx  
----+-----+-------
  1 | Non |  4000
  2 | Sut | 12000
(2 rows)
```

### View orqali yozish

`faol_mahsulotlar` oddiy view, shuning uchun u yangilanadi:

```sql
UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
INSERT INTO faol_mahsulotlar VALUES (4, 'Tuz', 2000);
SELECT * FROM mahsulotlar ORDER BY id;
```

```text
UPDATE 1
INSERT 0 1
 id |    nom    | narx  | faol 
----+-----------+-------+------
  1 | Non       |  4500 | t
  2 | Sut       | 12000 | t
  3 | Eski choy |  9000 | f
  4 | Tuz       |  2000 | t
(4 rows)
```

O'zgarishlar asosiy jadvalga tushdi. View orqali berilmagan `faol` ustuni sukut bo'yicha qiymatini oldi.

View ma'lumot saqlamaydi, shuning uchun jadvaldagi o'zgarish view'da **darhol** ko'rinadi:

```sql
UPDATE mahsulotlar SET faol = false WHERE id = 2;
SELECT * FROM faol_mahsulotlar ORDER BY id;
```

```text
 id | nom | narx 
----+-----+------
  1 | Non | 4500
  4 | Tuz | 2000
(2 rows)
```

### `WITH CHECK OPTION`

```sql
CREATE VIEW arzonlar AS
    SELECT id, nom, narx FROM mahsulotlar WHERE narx < 5000
    WITH CHECK OPTION;
INSERT INTO arzonlar VALUES (5, 'Shakar', 3000);
INSERT INTO arzonlar VALUES (6, 'Go''sht', 90000);
UPDATE arzonlar SET narx = 99999 WHERE id = 1;
```

```text
INSERT 0 1
ERROR:  new row violates check option for view "arzonlar"
DETAIL:  Failing row contains (6, Go'sht, 90000, t).
ERROR:  new row violates check option for view "arzonlar"
DETAIL:  Failing row contains (1, Non, 99999, t).
```

Arzon mahsulotlar view'i orqali qimmat mahsulot qo'shish ham, mavjudini qimmatlashtirish ham rad etildi.

### Yangilanmaydigan view

```sql
CREATE VIEW statistika AS
    SELECT faol, count(*) AS soni, avg(narx) AS ortacha
    FROM mahsulotlar GROUP BY faol;
SELECT * FROM statistika ORDER BY faol;
UPDATE statistika SET soni = 0;
```

```text
 faol | soni |        ortacha         
------+------+------------------------
 f    |    2 | 10500.0000000000000000
 t    |    3 |  3166.6666666666666667
(2 rows)

ERROR:  cannot update view "statistika"
DETAIL:  Views containing GROUP BY are not automatically updatable.
HINT:  To enable updating the view, provide an INSTEAD OF UPDATE trigger or an unconditional ON UPDATE DO INSTEAD rule.
```

### Materialized view

```sql
CREATE MATERIALIZED VIEW narx_hisoboti AS
    SELECT faol, count(*) AS soni, sum(narx) AS jami
    FROM mahsulotlar GROUP BY faol;
SELECT * FROM narx_hisoboti ORDER BY faol;
```

```text
SELECT 2
 faol | soni | jami  
------+------+-------
 f    |    2 | 21000
 t    |    3 |  9500
(2 rows)
```

Jadvalga yangi mahsulot qo'shamiz:

```sql
INSERT INTO mahsulotlar VALUES (7, 'Guruch', 15000, true);
SELECT * FROM narx_hisoboti ORDER BY faol;
```

```text
 faol | soni | jami  
------+------+-------
 f    |    2 | 21000
 t    |    3 |  9500
(2 rows)
```

Materialized view **o'zgarmadi**: u yaratilgan paytdagi natijani saqlab turibdi. Yangilaymiz:

```sql
REFRESH MATERIALIZED VIEW narx_hisoboti;
SELECT * FROM narx_hisoboti ORDER BY faol;
```

```text
REFRESH MATERIALIZED VIEW
 faol | soni | jami  
------+------+-------
 f    |    2 | 21000
 t    |    4 | 24500
(2 rows)
```

`CONCURRENTLY` uchun `UNIQUE` indeks kerak:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;
CREATE UNIQUE INDEX ON narx_hisoboti (faol);
REFRESH MATERIALIZED VIEW CONCURRENTLY narx_hisoboti;
UPDATE narx_hisoboti SET soni = 0;
```

```text
ERROR:  cannot refresh materialized view "public.narx_hisoboti" concurrently
HINT:  Create a unique index with no WHERE clause on one or more columns of the materialized view.
CREATE INDEX
REFRESH MATERIALIZED VIEW
ERROR:  cannot change materialized view "narx_hisoboti"
```

Materialized view'ga indeks qo'yish mumkin, lekin uni to'g'ridan-to'g'ri o'zgartirib bo'lmaydi.

### Bog'liqlik

View'lar o'zi tayangan ustunlarga **bog'liq** (16-bob):

```sql
ALTER TABLE mahsulotlar DROP COLUMN narx;
```

```text
ERROR:  cannot drop column narx of table mahsulotlar because other objects depend on it
DETAIL:  view faol_mahsulotlar depends on column narx of table mahsulotlar
view arzonlar depends on column narx of table mahsulotlar
view statistika depends on column narx of table mahsulotlar
materialized view narx_hisoboti depends on column narx of table mahsulotlar
HINT:  Use DROP ... CASCADE to drop the dependent objects too.
```

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/17-3-dialektlar.jpg" src="/video/sql/17-3-dialektlar.mp4">
  <track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/17-3-dialektlar.chapters.vtt" default>
  <track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/17-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: Dialektlar — MySQL da CASCADED CHECK va buzilgan viewlar, SQLite da INSTEAD OF triggerlar</figcaption>
</figure>

### MySQL

**View'lar** ishlaydi. Yangilanish qoidalari o'xshash. Hujjatga ko'ra view yangilanishi uchun view qatorlari bilan asosiy jadval qatorlari o'rtasida **birga-bir** moslik bo'lishi kerak. Agregat va window funksiyalar, `DISTINCT`, `GROUP BY`, `HAVING`, `UNION`, `ALGORITHM = TEMPTABLE` va boshqalar view'ni yangilanmaydigan qiladi.

`WITH CHECK OPTION` da `LOCAL` va `CASCADED` bor. Hujjatga ko'ra sukut bo'yicha `CASCADED`, ya'ni tekshiruv asosiy view'larga ham tarqaladi.

```sql
CREATE VIEW arzonlar AS SELECT id, nom, narx FROM mahsulotlar WHERE narx < 5000 WITH CHECK OPTION;
INSERT INTO arzonlar VALUES (6, 'Gosht', 90000);
CREATE VIEW statistika AS SELECT faol, COUNT(*) AS soni FROM mahsulotlar GROUP BY faol;
UPDATE statistika SET soni = 0;
```

```text
ERROR 1369 (HY000) at line 6: CHECK OPTION failed 'qollanma.arzonlar'
ERROR 1288 (HY000) at line 8: The target table statistika of the UPDATE is not updatable
```

View'ning yangilanishi va tekshiruv turi `information_schema.VIEWS` da ko'rinadi:

```text
+------------------+--------------+--------------+
| TABLE_NAME       | IS_UPDATABLE | CHECK_OPTION |
+------------------+--------------+--------------+
| arzonlar         | YES          | CASCADED     |
| faol_mahsulotlar | YES          | NONE         |
| statistika       | NO           | NONE         |
+------------------+--------------+--------------+
```

**Bog'liqlik tekshirilmaydi.** PostgreSQL'dan farqli o'laroq, MySQL view ishlatayotgan ustunni o'chirishga **ruxsat berdi**. View esa buzildi:

```sql
ALTER TABLE mahsulotlar DROP COLUMN narx;
SELECT * FROM faol_mahsulotlar;
```

```text
ERROR 1356 (HY000) at line 12: View 'qollanma.faol_mahsulotlar' references invalid table(s) or column(s) or function(s) or definer/invoker of view lack rights to use them
```

Xato `ALTER TABLE` paytida emas, view ishlatilganda chiqdi.

**Materialized view.** MySQL `CREATE VIEW` sintaksisida `[MATERIALIZED]` bor. Lekin hujjatga ko'ra materialized view'lar "faqat **MySQL HeatWave**'da qo'llab-quvvatlanadi". Sinovda MySQL Community 9.7 bu buyruqni **xatosiz qabul qildi**, lekin obyekt oddiy view kabi ishladi:

```sql
CREATE TABLE m (id INT PRIMARY KEY, faol BOOLEAN);
INSERT INTO m VALUES (1, TRUE);
CREATE MATERIALIZED VIEW mv AS SELECT faol, COUNT(*) AS soni FROM m GROUP BY faol;
INSERT INTO m VALUES (2, TRUE);
SELECT * FROM mv;
REFRESH MATERIALIZED VIEW mv;
```

```text
+------+------+
| faol | soni |
+------+------+
|    1 |    2 |
+------+------+
ERROR 1064 (42000) at line 12: You have an error in your SQL syntax; … near 'REFRESH MATERIALIZED VIEW mv' at line 1
```

Yangi qator darhol ko'rindi, ya'ni natija saqlanmagan. `REFRESH` buyrug'i esa yo'q. `SHOW CREATE VIEW` da `MATERIALIZED /*(BY ENGINE=UNKNOWN)*/` belgisi turibdi. Xulosa: MySQL Community'da materialized view yo'q. Kerak bo'lsa, odatda alohida jadval yaratiladi va u vaqti-vaqti bilan qayta to'ldiriladi.

### SQLite

SQLite hujjatiga ko'ra view'lar **faqat o'qish uchun**: view'ga `DELETE`, `INSERT` yoki `UPDATE` qilib bo'lmaydi. Ko'p holatlarda `INSTEAD OF` trigger bilan xuddi shu natijaga erishiladi:

```text
SQLite-3.54 memory-> CREATE VIEW faol_mahsulotlar AS SELECT id, nom, narx FROM mahsulotlar WHERE faol;
SQLite-3.54 memory-> UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
Parse error near line 5: cannot modify faol_mahsulotlar because it is a view
SQLite-3.54 memory-> CREATE TRIGGER faol_narx INSTEAD OF UPDATE OF narx ON faol_mahsulotlar
                     BEGIN UPDATE mahsulotlar SET narx = NEW.narx WHERE id = OLD.id; END;
SQLite-3.54 memory-> UPDATE faol_mahsulotlar SET narx = 4500 WHERE id = 1;
SQLite-3.54 memory-> SELECT * FROM mahsulotlar;
1|Non|4500|1
2|Eski choy|9000|0
```

Trigger view'ga yozilgan `UPDATE` ni asosiy jadvalga yo'naltirdi. `NEW` va `OLD` — yangi va eski qator qiymatlari (57-bob).

Materialized view SQLite'da yo'q:

```text
SQLite-3.54 memory-> CREATE MATERIALIZED VIEW x AS SELECT 1;
Parse error near line 9: near "MATERIALIZED": syntax error
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| View | Ha | Ha | Ha |
| Avtomatik yangilanadigan view | Oddiy view'lar | Oddiy view'lar (birga-bir) | Yo'q, faqat o'qish |
| `INSTEAD OF` trigger | Ha | Yo'q (57-bob) | Ha |
| `WITH CHECK OPTION` | Ha (`LOCAL`/`CASCADED`) | Ha, sukut bo'yicha `CASCADED` | Yo'q |
| View ishlatayotgan ustunni o'chirish | Rad etiladi (`CASCADE` kerak) | Ruxsat beriladi, view buziladi | — |
| Materialized view | Ha, `REFRESH [CONCURRENTLY]` | Faqat HeatWave'da; Community'da sintaksis bor, lekin oddiy view kabi | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| View ma'lumotni "nusxalaydi" va tezlashtiradi deb o'ylash | Oddiy view har murojaatda so'rovni qayta bajaradi | Tezlik kerak bo'lsa — materialized view yoki indeks |
| Materialized view doim yangi deb o'ylash | `REFRESH` gacha eski natija | Yangilash jadvalini rejalashtirish |
| Ishlab turgan tizimda katta materialized view'ni oddiy `REFRESH` qilish | O'qiyotgan ulanishlar to'xtashi mumkin | `UNIQUE` indeks va `REFRESH … CONCURRENTLY` |
| View orqali yozganda `WITH CHECK OPTION` ni unutish | View'da ko'rinmaydigan qatorlar yaratiladi | `WITH CHECK OPTION` |
| `CREATE OR REPLACE VIEW` bilan ustun tartibini o'zgartirmoqchi bo'lish | Ruxsat yo'q, faqat oxiriga qo'shish mumkin | `DROP VIEW` va qayta yaratish (bog'liqlarni hisobga olib) |
| MySQL'da view ishlatayotgan ustunni o'chirish | View jimgina buziladi, xato keyin chiqadi | O'chirishdan oldin bog'liq view'larni tekshirish |
| MySQL Community'da `CREATE MATERIALIZED VIEW` ishlaydi deb o'ylash | Natija saqlanmaydi, oddiy view | Alohida jadval va qayta to'ldirish |
| SQLite'da view'ga yozmoqchi bo'lish | Faqat o'qish | `INSTEAD OF` trigger yoki asosiy jadvalga yozish |

## Amaliyot

1. `talabalar` jadvali ustiga faqat 1-kurs talabalarini ko'rsatadigan view yarating. U orqali yangi talaba qo'shing va `kurs` ustuniga nima yozilganini tekshiring.
2. Xuddi shu view'ni `WITH CHECK OPTION` bilan qayta yarating. 2-kurs talabasini qo'shib ko'ring.
3. Kurslar bo'yicha talabalar sonini saqlaydigan materialized view yarating. Yangi talaba qo'shib, `REFRESH` dan oldin va keyin natijani solishtiring.
4. Materialized view'ga `UNIQUE` indeks qo'yib, `REFRESH … CONCURRENTLY` ni sinab ko'ring.
5. MySQL'da view ishlatayotgan ustunni o'chiring. View'ni ishlatishga urinib, xatoni o'qing. Xuddi shuni PostgreSQL'da qiling.
6. SQLite'da view orqali `INSERT` qilish uchun `INSTEAD OF INSERT` trigger yozing.

## Rasmiy hujjat

- PostgreSQL — 3.2. Views: <https://www.postgresql.org/docs/18/tutorial-views.html>
- PostgreSQL — CREATE VIEW (Updatable Views): <https://www.postgresql.org/docs/18/sql-createview.html>
- PostgreSQL — 39.3. Materialized Views: <https://www.postgresql.org/docs/18/rules-materializedviews.html>
- PostgreSQL — CREATE MATERIALIZED VIEW: <https://www.postgresql.org/docs/18/sql-creatematerializedview.html>
- PostgreSQL — REFRESH MATERIALIZED VIEW: <https://www.postgresql.org/docs/18/sql-refreshmaterializedview.html>
- MySQL — 15.1.28 CREATE VIEW Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-view.html>
- MySQL — 27.6.3 Updatable and Insertable Views: <https://dev.mysql.com/doc/refman/9.7/en/view-updatability.html>
- MySQL — 27.6.4 The View WITH CHECK OPTION Clause: <https://dev.mysql.com/doc/refman/9.7/en/view-check-option.html>
- SQLite — CREATE VIEW: <https://www.sqlite.org/lang_createview.html>
- SQLite — CREATE TRIGGER (`INSTEAD OF`): <https://www.sqlite.org/lang_createtrigger.html>
