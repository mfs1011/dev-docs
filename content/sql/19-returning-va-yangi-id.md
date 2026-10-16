# 19 — `RETURNING` va yangi ID

[← Oldingi: INSERT, UPDATE, DELETE](18-insert-update-delete.md) · [Mundarija](README.md) · [Keyingi: UPSERT va MERGE →](20-upsert-va-merge.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/19-1-tushuncha.jpg">
    <source src="/video/sql/19-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/19-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/19-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>19.1-video. RETURNING va yangi ID tushunchasi</figcaption>
</figure>

Yangi mijoz qo'shildi. Ilova endi uning **ID** sini bilishi kerak, masalan unga buyurtma bog'lash uchun. Lekin ID'ni baza o'zi berdi (13-bob). Uni qanday olish mumkin?

Yo'llardan biri — keyin alohida `SELECT` qilish. Lekin parallel yozuvlar bo'lganda qaysi qator "sizniki" ekanini aniqlash qiyin. PostgreSQL hujjati aytganidek, `RETURNING` aynan shu muammoni hal qiladi:

- o'zgartirilgan qatorlardagi ma'lumotni **shu buyruqning o'zida** qaytaradi;
- qo'shimcha so'rov kerak emas;
- ayniqsa o'zgargan qatorlarni boshqa yo'l bilan ishonchli aniqlash qiyin bo'lganda qadrli.

### `RETURNING` nima qaytaradi

`RETURNING` ro'yxati `SELECT` ustunlari ro'yxati kabi yoziladi: ustun nomlari, ifodalar, `*`. Har buyruq uchun sukut bo'yicha ma'lumot:

| Buyruq | `RETURNING` sukut bo'yicha nimani ko'radi |
| --- | --- |
| `INSERT` | Qo'shilgan qator, baza bergan qiymatlar bilan (ID, `DEFAULT`) |
| `UPDATE` | Qatorning **yangi** holati |
| `DELETE` | O'chirilgan qatorning mazmuni |
| `MERGE` | Manba qatori va qo'shilgan, yangilangan yoki o'chirilgan maqsad qatori (20-bob) |

Hujjatga ko'ra `INSERT` da `RETURNING` mijoz yuborgan ma'lumotni qaytarishi u qadar foydali emas. Lekin baza **hisoblagan** qiymatlar uchun juda qulay. Asosiy holat — avtomatik ID.

### `OLD` va `NEW` (PostgreSQL 18)

PostgreSQL 18 dan boshlab o'zgargan qatorning **eski** va **yangi** holatini birga qaytarish mumkin:

```sql
UPDATE products SET price = price * 1.10 WHERE price <= 99.99
RETURNING name, old.price AS old_price, new.price AS new_price,
          new.price - old.price AS price_change;
```

Qoidalar:

- bu sintaksis `INSERT`, `UPDATE`, `DELETE` va `MERGE` da ishlaydi;
- `INSERT` da `old` qiymatlar odatda `NULL`, `DELETE` da esa `new` qiymatlar `NULL`;
- `ON CONFLICT DO UPDATE` da konflikt bo'lgan qatorlar uchun `old` qiymatlar to'ldirilgan bo'ladi (20-bob);
- nomlarni o'zgartirish mumkin: `RETURNING WITH (OLD AS o, NEW AS n) …`.

Jadvalda triggerlar bo'lsa, `RETURNING` qatorni **triggerlar o'zgartirgan** holatda ko'radi (57-bob).

### Standart

`RETURNING` standartda yo'q. PostgreSQL hujjatida `INSERT`, `UPDATE` va `DELETE` ning "Compatibility" bo'limlari uni PostgreSQL kengaytmasi deb ko'rsatadi. SQLite hujjatiga ko'ra SQLite'dagi `RETURNING` sintaksisi PostgreSQL'dan olingan.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/19-2-kod.jpg">
    <source src="/video/sql/19-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/19-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/19-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>19.2-video. PostgreSQL 18: RETURNING amaliyoti, OLD/NEW va CTE arxivlash</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### Yangi ID

```sql
CREATE TABLE mijozlar (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ism text NOT NULL,
    yaratilgan timestamptz NOT NULL DEFAULT now(),
    balans numeric NOT NULL DEFAULT 0
);
INSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;
```

```text
 id 
----
  1
(1 row)

INSERT 0 1
```

Ko'p qatorli `INSERT` da **har qator** uchun bitta natija qatori qaytadi. Qaysi ID qaysi ismga tegishli ekani aniq ko'rinadi:

```sql
INSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir')
RETURNING id, ism, yaratilgan IS NOT NULL AS vaqt;
```

```text
 id |  ism  | vaqt 
----+-------+------
  2 | Vali  | t
  3 | Sobir | t
(2 rows)

INSERT 0 2
```

### `UPDATE … RETURNING old/new`

```sql
UPDATE mijozlar SET balans = balans + 50000 WHERE ism IN ('Ali', 'Vali')
RETURNING id, ism, old.balans AS eski, new.balans AS yangi;
```

```text
 id | ism  | eski | yangi 
----+------+------+-------
  1 | Ali  |    0 | 50000
  2 | Vali |    0 | 50000
(2 rows)

UPDATE 2
```

PostgreSQL 18 gacha eski qiymatni bilish uchun avval `SELECT` qilish yoki trigger yozish kerak edi.

### `DELETE … RETURNING`

```sql
DELETE FROM mijozlar WHERE ism = 'Sobir' RETURNING *;
UPDATE mijozlar SET balans = 0 WHERE ism = 'Yoq' RETURNING id;
```

```text
 id |  ism  |          yaratilgan           | balans 
----+-------+-------------------------------+--------
  3 | Sobir | 2026-10-13 14:08:26.321379+05 |      0
(1 row)

DELETE 1
 id 
----
(0 rows)

UPDATE 0
```

O'chirilgan qatorning to'liq nusxasi qaytdi. Hech qator o'zgarmasa, natija bo'sh bo'ladi.

### `INSERT` da `OLD` — `NULL`

```sql
INSERT INTO mijozlar (ism) VALUES ('Dilnoza')
RETURNING WITH (OLD AS o, NEW AS n) o.id AS eski_id, n.id AS yangi_id;
```

```text
 eski_id | yangi_id 
---------+----------
         |        4
(1 row)
```

### `RETURNING` ni boshqa buyruqqa uzatish

PostgreSQL'da `RETURNING` li buyruqni `WITH` (CTE, 29-bob) ichiga qo'yib, natijasini keyingi buyruqqa uzatish mumkin. Masalan, bitta buyruqda o'chirib, arxivga ko'chirish:

```sql
CREATE TABLE arxiv (id bigint, ism text, balans numeric);
WITH ochirilgan AS (
    DELETE FROM mijozlar WHERE balans = 0 RETURNING id, ism, balans
)
INSERT INTO arxiv SELECT * FROM ochirilgan RETURNING *;
SELECT id, ism FROM mijozlar ORDER BY id;
```

```text
 id |   ism   | balans 
----+---------+--------
  4 | Dilnoza |      0
(1 row)

INSERT 0 1
 id | ism  
----+------
  1 | Ali
  2 | Vali
(2 rows)
```

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/19-3-dialektlar.jpg">
    <source src="/video/sql/19-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/19-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/19-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>19.3-video. MySQL va SQLite: LAST_INSERT_ID, ROW_COUNT va cheklovlar</figcaption>
</figure>

### MySQL: `RETURNING` yo'q

MySQL 9.7 da `RETURNING` yo'q:

```sql
INSERT INTO mijozlar (ism) VALUES ('Ali') RETURNING id;
```

```text
ERROR 1064 (42000) at line 2: … near 'RETURNING id' at line 1
```

Uning o'rnida ikkita funksiya bor:

| Funksiya | Nima qaytaradi |
| --- | --- |
| `LAST_INSERT_ID()` | Oxirgi `INSERT` dagi **birinchi** avtomatik yaratilgan `AUTO_INCREMENT` qiymati. Ulanishga tegishli |
| `ROW_COUNT()` | Oxirgi buyruq ta'sir qilgan qatorlar soni |

```sql
INSERT INTO mijozlar (ism) VALUES ('Ali');
SELECT LAST_INSERT_ID() AS yangi_id, ROW_COUNT() AS qatorlar;
INSERT INTO mijozlar (ism) VALUES ('Vali'), ('Sobir');
SELECT LAST_INSERT_ID() AS birinchi_id;
```

```text
+----------+----------+
| yangi_id | qatorlar |
+----------+----------+
|        1 |        1 |
+----------+----------+
+-------------+
| birinchi_id |
+-------------+
|           2 |
+-------------+
```

Ikki qatorli `INSERT` dan keyin `LAST_INSERT_ID()` = 2, ya'ni `Vali`. `Sobir` ning ID'si 3 bo'lishini ilova o'zi hisoblashi kerak. Bu 13-bobda ko'rilgan qulf rejimiga bog'liq. Eski va yangi qiymatlarni, o'chirilgan qatorning mazmunini qaytarishning to'g'ridan-to'g'ri yo'li yo'q.

**`ROW_COUNT()` va "o'zgargan" qatorlar.** Hujjatga ko'ra `UPDATE` uchun sukut bo'yicha qiymat — **haqiqatan o'zgargan** qatorlar soni, mos kelganlari emas:

```sql
UPDATE mijozlar SET balans = 50000 WHERE ism IN ('Ali', 'Vali');
SELECT ROW_COUNT() AS ozgargan;
UPDATE mijozlar SET balans = 50000 WHERE ism IN ('Ali', 'Vali');
SELECT ROW_COUNT() AS ozgargan_ikkinchi_marta;
```

```text
+----------+
| ozgargan |
+----------+
|        2 |
+----------+
+-------------------------+
| ozgargan_ikkinchi_marta |
+-------------------------+
|                       0 |
+-------------------------+
```

Ikkinchi `UPDATE` da ikkita qator shartga mos keldi, lekin qiymat allaqachon 50000 edi, shuning uchun 0. Ulanishda `CLIENT_FOUND_ROWS` bayrog'i berilsa, mos kelgan qatorlar soni qaytariladi. PostgreSQL'dagi `UPDATE 2` esa har doim mos kelgan qatorlar sonini ko'rsatadi.

### SQLite

SQLite'da `RETURNING` 3.35.0 dan beri bor. Hujjatga ko'ra:

- `INSERT` va `UPDATE` da ustunlar o'zgarishdan **keyingi** qiymatni, `DELETE` da **oldingi** qiymatni ko'rsatadi;
- UPSERT'da qo'shilgan va yangilangan qatorlarning ikkalasi ham qaytadi.

```text
SQLite-3.54 memory-> INSERT INTO mijozlar (ism) VALUES ('Ali'), ('Vali') RETURNING id, ism;
id|ism
1|Ali
2|Vali
SQLite-3.54 memory-> UPDATE mijozlar SET balans = 50000 WHERE ism = 'Ali' RETURNING id, balans;
id|balans
1|50000
SQLite-3.54 memory-> DELETE FROM mijozlar WHERE ism = 'Vali' RETURNING *;
id|ism|yaratilgan|balans
2|Vali|2026-10-13 09:08:39|0
```

`last_insert_rowid()` MySQL'dan farqli o'laroq **oxirgi** qo'shilgan qatorning `rowid` sini qaytardi:

```text
SQLite-3.54 memory-> SELECT last_insert_rowid();
last_insert_rowid()
2
```

**Cheklovlar** (hujjat bo'yicha):

- faqat yuqori darajadagi `DELETE`, `INSERT`, `UPDATE` da ishlaydi, trigger ichida ishlamaydi;
- `RETURNING` li buyruqni subquery sifatida ishlatib bo'lmaydi. Natijani boshqa jadvalga yoki so'rovga yo'naltirib ham bo'lmaydi, faqat ilovaga qaytadi. PostgreSQL'dagi CTE imkoniyati SQLite'da yo'q;
- natija qatorlari **ixtiyoriy tartibda** chiqadi. Tartib versiya yoki hatto har bajarilishda o'zgarishi mumkin;
- `AFTER` triggerlar keyin qilgan o'zgarishlar `RETURNING` da ko'rinmaydi. PostgreSQL'da esa `RETURNING` triggerlar o'zgartirgan qatorni ko'radi;
- yuqori darajada agregat va window funksiyalar ishlatib bo'lmaydi;
- `UPDATE FROM` da faqat maqsad jadvalning ustunlari qaytariladi.

```text
SQLite-3.54 memory-> SELECT * FROM (INSERT INTO mijozlar (ism) VALUES ('X') RETURNING id);
Parse error near line 8: near "INSERT": syntax error
SQLite-3.54 memory-> UPDATE mijozlar SET balans = 1 RETURNING sum(balans);
Parse error near line 9: misuse of aggregate function sum()
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `RETURNING` | `INSERT`, `UPDATE`, `DELETE`, `MERGE` | Yo'q | `INSERT`, `UPDATE`, `DELETE` (3.35+) |
| Eski va yangi qiymat | `old.*`, `new.*` (18+) | Yo'q | Faqat bittasi |
| Natijani boshqa buyruqqa uzatish | CTE orqali | — | Yo'q |
| Natija tartibi | — | — | Ixtiyoriy |
| Yangi ID olishning boshqa yo'li | `currval()` | `LAST_INSERT_ID()` — ko'p qatorlida **birinchi** | `last_insert_rowid()` — **oxirgi** |
| Ta'sir qilingan qatorlar | Buyruq javobi (`UPDATE 2`) — mos kelganlar | `ROW_COUNT()` — haqiqatan o'zgarganlar | `changes()` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Yangi ID'ni `SELECT max(id)` bilan olish | Parallel `INSERT` lar bo'lsa, boshqa birovning ID'si olinadi | `RETURNING id` yoki `LAST_INSERT_ID()` |
| MySQL'da ko'p qatorli `INSERT` dan keyin `LAST_INSERT_ID()` ni oxirgi ID deb bilish | Birinchisi qaytadi | Bittalab qo'shish yoki birinchisidan hisoblash |
| SQLite'da `RETURNING` natijasi qo'shilgan tartibda keladi deb kutish | Hujjatga ko'ra tartib ixtiyoriy | Kerakli tartibni ilovada qilish |
| `UPDATE` ga qo'shimcha "oldin qanday edi" uchun `SELECT` yozish (PG 18) | Ikki so'rov orasida qator o'zgarishi mumkin | `RETURNING old.ustun, new.ustun` |
| O'chirish va arxivlashni ikki alohida buyruqda qilish (PostgreSQL) | O'rtada boshqa o'zgarish bo'lishi mumkin | `WITH … DELETE … RETURNING` + `INSERT` |
| MySQL'da `ROW_COUNT()` = 0 ni "qator topilmadi" deb tushunish | Qator topilgan, lekin qiymat allaqachon shunday bo'lgan | `CLIENT_FOUND_ROWS` yoki alohida tekshirish |
| SQLite'da `RETURNING` triggerlardan keyingi qiymatni beradi deb o'ylash | `AFTER` trigger o'zgarishlari ko'rinmaydi | Kerak bo'lsa, qayta o'qish |

## Amaliyot

1. `talabalar` ga yangi talaba qo'shib, `RETURNING id` bilan ID'sini oling. Keyin bitta buyruqda uchta talaba qo'shib, ID va ismlarni oling.
2. Hamma 1-kurs talabalarini 2-kursga o'tkazing va `RETURNING id, old.kurs, new.kurs` bilan kim o'tganini ko'ring.
3. `WITH … DELETE … RETURNING` bilan bitiruvchilarni (`kurs = 4`) `bitiruvchilar` jadvaliga ko'chiring.
4. MySQL'da ikki qatorli `INSERT` dan keyin `LAST_INSERT_ID()` va `ROW_COUNT()` ni tekshiring. Ikkinchi qatorning ID'sini qanday aniqlaysiz?
5. SQLite'da `INSERT … RETURNING` ni bajaring, keyin `SELECT changes(), last_insert_rowid();` ni bajaring.

## Rasmiy hujjat

- PostgreSQL — 6.4. Returning Data from Modified Rows: <https://www.postgresql.org/docs/18/dml-returning.html>
- PostgreSQL — INSERT (`RETURNING WITH (OLD AS …, NEW AS …)`): <https://www.postgresql.org/docs/18/sql-insert.html>
- PostgreSQL — 7.8.4. Data-Modifying Statements in WITH: <https://www.postgresql.org/docs/18/queries-with.html>
- MySQL — 14.15 Information Functions (`LAST_INSERT_ID()`, `ROW_COUNT()`): <https://dev.mysql.com/doc/refman/9.7/en/information-functions.html>
- SQLite — RETURNING: <https://www.sqlite.org/lang_returning.html>
- SQLite — Core Functions (`last_insert_rowid()`, `changes()`): <https://www.sqlite.org/lang_corefunc.html>
