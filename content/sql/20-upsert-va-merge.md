# 20 — UPSERT va `MERGE`

[← Oldingi: RETURNING va yangi ID](19-returning-va-yangi-id.md) · [Mundarija](README.md) · [Keyingi: Ommaviy yuklash →](21-ommaviy-yuklash.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/20-1-tushuncha.jpg">
    <source src="/video/sql/20-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/20-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/20-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>20.1-video. UPSERT va MERGE tushunchasi</figcaption>
</figure>

Ko'p uchraydigan vazifa: "qator bo'lmasa — qo'sh, bo'lsa — yangila". Masalan:

- savatchada mahsulot yo'q bo'lsa, qo'shiladi, bor bo'lsa, soni oshiriladi;
- tashqi tizimdan kelgan narxlar ro'yxati jadvalga birlashtiriladi.

Buni ikki buyruq bilan qilsa bo'ladi: avval `SELECT`, keyin `INSERT` yoki `UPDATE`. Lekin ikki buyruq orasida boshqa tranzaksiya xuddi shu qatorni qo'shib qo'yishi mumkin. Natijada takror kalit xatosi chiqadi yoki ma'lumot yo'qoladi. Shuning uchun bu vazifa **bitta buyruqda** bajariladi. Bunday buyruq **UPSERT** deyiladi: *UPDATE or INSERT*.

Uch tizimda uch xil yechim bor. PostgreSQL'da standart `MERGE` ham bor.

### PostgreSQL: `INSERT … ON CONFLICT`

`ON CONFLICT` takrorlanmaslik (`UNIQUE`, `PRIMARY KEY`) yoki exclusion cheklovi buzilganda xato o'rniga **muqobil amal** bajaradi:

- `ON CONFLICT DO NOTHING` — qatorni qo'shmaydi;
- `ON CONFLICT (ustunlar) DO UPDATE SET …` — mavjud qatorni yangilaydi.

Hujjatdagi asosiy kafolat:

> `ON CONFLICT DO UPDATE` **atomar** `INSERT` yoki `UPDATE` natijasini kafolatlaydi. Mustaqil xato bo'lmasa, yuqori parallellik ostida ham ikki natijadan biri albatta bo'ladi.

Qolgan qoidalar:

- `(ustunlar)` — **konflikt maqsadi**. Shu ustunlardagi takrorlanmas indeks yoki cheklov "hakam" (*arbiter*) bo'ladi. `DO UPDATE` da maqsadni yozish majburiy, `DO NOTHING` da ixtiyoriy;
- `EXCLUDED` — qo'shilmoqchi bo'lgan, ya'ni "chetlatilgan" qatorni bildiradigan maxsus jadval. Masalan, `SET soni = jadval.soni + EXCLUDED.soni`;
- `ON CONFLICT DO UPDATE` — **deterministik** buyruq. Bitta buyruq bitta mavjud qatorni ikki marta o'zgartira olmaydi. Qo'shiladigan qatorlar orasida kalit takrorlansa — xato.

**Standart.** `ON CONFLICT` — PostgreSQL kengaytmasi. Hujjat: "standartga ko'proq mos buyruq kerak bo'lsa, `MERGE` ga qarang".

### `MERGE` (standart SQL)

`MERGE` maqsad jadvalni **ma'lumot manbasi** bilan solishtirib, har qator uchun shartga qarab `INSERT`, `UPDATE` yoki `DELETE` qiladi. Hujjatga ko'ra bu bitta SQL buyrug'i. Usiz bu ish bir nechta protsedura buyrug'ini talab qilardi.

Ishlash tartibi:

1. Manba maqsad jadval bilan birlashtiriladi.
2. Har qatorning holati **bir marta** aniqlanadi:
   - `MATCHED` — moslik bor;
   - `NOT MATCHED [BY TARGET]` — manbada bor, maqsadda yo'q;
   - `NOT MATCHED BY SOURCE` — maqsadda bor, manbada yo'q.
3. `WHEN` bandlari yozilgan **tartibda** tekshiriladi. Birinchi rost bo'lgani bajariladi, boshqasi bajarilmaydi.

```sql
MERGE INTO maqsad m
USING manba s ON m.kalit = s.kalit
WHEN MATCHED AND s.ochirilsin THEN DELETE
WHEN MATCHED THEN UPDATE SET …
WHEN NOT MATCHED THEN INSERT (…) VALUES (…);
```

Hujjatdagi muhim qoidalar:

- **Bitta maqsad qatoriga bitta manba qatori.** Bir nechta mos kelsa, ulardan biri ishlatiladi, qolganlari esa **xato** beradi. Hujjatga ko'ra bu standart talabi va `UPDATE … FROM` dan farqi shu. U yerda ikkinchi va keyingi urinishlar jimgina e'tiborsiz qoldiriladi (18-bob).
- **`RETURNING`** va `merge_action()` funksiyasi qaysi amal bajarilganini qaytaradi. Ular PostgreSQL 17 dan beri bor.
- **`ON CONFLICT` bilan farqi.** `MERGE` boshqa buyruqlar bilan parallel ishlaganda odatdagi izolyatsiya qoidalari amal qiladi (51-bob). Hujjat parallel `INSERT` bo'lganda ham `UPDATE` ni bajara oladigan muqobil sifatida `INSERT … ON CONFLICT` ni tavsiya qiladi. Hujjatga ko'ra ikki buyruq "bir-birining o'rnini bosmaydi".

**Standart.** `MERGE` standartga mos. `WITH`, `BY SOURCE`/`BY TARGET`, `DO NOTHING` va `RETURNING` esa standartdan tashqari kengaytmalar.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/20-2-kod.jpg">
    <source src="/video/sql/20-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/20-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/20-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>20.2-video. PostgreSQL 18: ON CONFLICT va MERGE amaliyoti</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `ON CONFLICT DO UPDATE`

So'zlar lug'ati: so'z yangi bo'lsa qo'shiladi, bor bo'lsa hisoblagich oshiriladi. `RETURNING` dagi `old` (19-bob) qaysi holat bo'lganini ko'rsatadi:

```sql
CREATE TABLE lugat (soz text PRIMARY KEY, soni int NOT NULL DEFAULT 1);

INSERT INTO lugat (soz) VALUES ('olma')
ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1
RETURNING *, (old.soz IS NULL) AS yangi;
```

```text
 soz  | soni | yangi 
------+------+-------
 olma |    1 | t
(1 row)
```

Xuddi shu buyruqni yana bir marta:

```text
 soz  | soni | yangi 
------+------+-------
 olma |    2 | f
(1 row)
```

Birinchi safar qator qo'shildi, ikkinchi safar yangilandi.

### `EXCLUDED`

```sql
INSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5)
ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + EXCLUDED.soni
RETURNING soz, old.soni AS eski, new.soni AS yangi;
```

```text
 soz  | eski | yangi 
------+------+-------
 nok  |      |    10
 olma |    2 |     7
(2 rows)
```

- `lugat.soni` — jadvaldagi mavjud qiymat (2).
- `EXCLUDED.soni` — qo'shilmoqchi bo'lgan qiymat (5).

### `DO NOTHING` va xatolar

```sql
INSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT DO NOTHING RETURNING *;
INSERT INTO lugat (soz) VALUES ('anor'), ('anor') ON CONFLICT (soz) DO UPDATE SET soni = lugat.soni + 1;
INSERT INTO lugat (soz) VALUES ('olma') ON CONFLICT (soni) DO NOTHING;
```

```text
 soz | soni 
-----+------
(0 rows)

INSERT 0 0
ERROR:  ON CONFLICT DO UPDATE command cannot affect row a second time
HINT:  Ensure that no rows proposed for insertion within the same command have duplicate constrained values.
ERROR:  there is no unique or exclusion constraint matching the ON CONFLICT specification
```

- `DO NOTHING` hech narsa qilmadi va `RETURNING` bo'sh qaytdi.
- Bitta buyruqda bir xil kalit ikki marta keldi. Hujjatdagi "deterministik" qoidaga ko'ra bu xato.
- Konflikt maqsadi uchun takrorlanmas cheklov bo'lishi shart. `soni` da bunday cheklov yo'q.

### `MERGE`

Omborga yangi kelgan mahsulotlarni birlashtiramiz:

- bor mahsulotning soni oshiriladi va narxi yangilanadi;
- yangi mahsulot qo'shiladi;
- `ochirilsin` belgilangani o'chiriladi.

```sql
CREATE TABLE ombor (sku text PRIMARY KEY, soni int, narx numeric);
CREATE TABLE yangi_kelgan (sku text, soni int, narx numeric, ochirilsin boolean DEFAULT false);
INSERT INTO ombor VALUES ('NON', 10, 4000), ('SUT', 5, 12000), ('CHOY', 3, 9000);
INSERT INTO yangi_kelgan VALUES ('NON', 20, 4200, false), ('TUZ', 30, 2000, false), ('CHOY', 0, 0, true);

MERGE INTO ombor o
USING yangi_kelgan y ON o.sku = y.sku
WHEN MATCHED AND y.ochirilsin THEN DELETE
WHEN MATCHED THEN UPDATE SET soni = o.soni + y.soni, narx = y.narx
WHEN NOT MATCHED THEN INSERT (sku, soni, narx) VALUES (y.sku, y.soni, y.narx)
RETURNING merge_action(), o.*;
```

```text
 merge_action | sku  | soni | narx 
--------------+------+------+------
 UPDATE       | NON  |   30 | 4200
 INSERT       | TUZ  |   30 | 2000
 DELETE       | CHOY |    3 | 9000
(3 rows)

MERGE 3
```

Bitta buyruq uch xil amalni bajardi. `merge_action()` qaysi biri bo'lganini ko'rsatdi. `SUT` manbada yo'q, shuning uchun o'zgarmadi.

```sql
SELECT * FROM ombor ORDER BY sku;
```

```text
 sku | soni | narx  
-----+------+-------
 NON |   30 |  4200
 SUT |    5 | 12000
 TUZ |   30 |  2000
(3 rows)
```

**Bitta qatorga ikki manba qatori** — xato. 18-bobdagi `UPDATE … FROM` esa bunda jimgina bittasini tanlagan edi:

```sql
MERGE INTO ombor o USING (VALUES ('NON'), ('NON')) v(sku) ON o.sku = v.sku
WHEN MATCHED THEN UPDATE SET soni = o.soni + 1;
```

```text
ERROR:  MERGE command cannot affect row a second time
HINT:  Ensure that not more than one source row matches any one target row.
```

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/20-3-dialektlar.jpg">
    <source src="/video/sql/20-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/20-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/20-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>20.3-video. MySQL va SQLite: ON DUPLICATE KEY, REPLACE xavfi va ON CONFLICT</figcaption>
</figure>

### MySQL: `ON DUPLICATE KEY UPDATE`

MySQL'da `MERGE` yo'q:

```text
ERROR 1064 (42000) at line 18: … near 'MERGE INTO lugat USING (SELECT 1) s ON 1 = 1 WHEN MATCHED THEN DELETE' at line 1
```

Uning o'rnida `INSERT … ON DUPLICATE KEY UPDATE` bor. Hujjatga ko'ra qo'shilayotgan qator `UNIQUE` indeks yoki `PRIMARY KEY` da takror qiymat keltirib chiqarsa, eski qator yangilanadi. Konflikt maqsadi yozilmaydi: **har qanday** takrorlanmas kalit hisobga olinadi.

**Ta'sir qilingan qatorlar soni.** Hujjatga ko'ra har qator uchun:

- 1 — yangi qator qo'shildi;
- 2 — mavjud qator yangilandi;
- 0 — mavjud qatorga uning joriy qiymatlari yozildi.

```sql
CREATE TABLE lugat (id INT AUTO_INCREMENT PRIMARY KEY, soz VARCHAR(30) UNIQUE, soni INT NOT NULL DEFAULT 1);
INSERT INTO lugat (soz) VALUES ('olma') ON DUPLICATE KEY UPDATE soni = soni + 1;
SELECT ROW_COUNT() AS rc;
INSERT INTO lugat (soz) VALUES ('olma') ON DUPLICATE KEY UPDATE soni = soni + 1;
SELECT ROW_COUNT() AS rc;
```

```text
| rc |
|  1 |
| rc |
|  2 |
```

**Yangi qiymatga murojaat: qator taxallusi.** PostgreSQL'dagi `EXCLUDED` o'rnida MySQL'da `VALUES (…) AS new` taxallusi yoziladi. Eski `VALUES(ustun)` funksiyasi **eskirgan**:

```sql
INSERT INTO lugat (soz, soni) VALUES ('nok', 10), ('olma', 5) AS new
ON DUPLICATE KEY UPDATE soni = lugat.soni + new.soni;

INSERT INTO lugat (soz, soni) VALUES ('nok', 1) ON DUPLICATE KEY UPDATE soni = VALUES(soni);
SHOW WARNINGS;
```

```text
| Warning | 1287 | 'VALUES function' is deprecated and will be removed in a future release. Please use an alias (INSERT INTO ... VALUES (...) AS alias) and replace VALUES(col) in the ON DUPLICATE KEY UPDATE clause with alias.col instead |
```

**`AUTO_INCREMENT` sarflanadi.** Hujjatga ko'ra yangilanish bo'lsa ham, `INSERT … ON DUPLICATE KEY UPDATE` InnoDB'da avtomatik hisoblagichni oshiradi. Natijada `nok` ning ID'si 2 emas, 3 bo'ldi:

```text
+----+------+------+
| id | soz  | soni |
+----+------+------+
|  1 | olma |    7 |
|  3 | nok  |    1 |
+----+------+------+
```

**Bir nechta takrorlanmas kalit.** Hujjat bunday jadvallarda `ON DUPLICATE KEY UPDATE` dan qochishni maslahat beradi. Sabab: qaysi kalit konfliktga sabab bo'lgani aniq emas va faqat bitta qator yangilanadi.

**`REPLACE` — o'chirib, qayta yozish.** `REPLACE` `INSERT` ga o'xshaydi. Farqi: `PRIMARY KEY` yoki `UNIQUE` bo'yicha mos eski qator bo'lsa, u **o'chiriladi**, keyin yangisi yoziladi. Bu MySQL kengaytmasi. Natijada:

```sql
REPLACE INTO lugat (id, soz, soni) VALUES (1, 'olma', 100);
SELECT ROW_COUNT() AS rc;
REPLACE INTO lugat (soz) VALUES ('nok');
SELECT * FROM lugat ORDER BY id;
```

```text
| rc |
|  2 |
+----+------+------+
| id | soz  | soni |
+----+------+------+
|  1 | olma |  100 |
|  7 | nok  |    1 |
+----+------+------+
```

- `rc = 2` — bitta qator o'chirildi, bitta qo'shildi.
- `nok` ning ID'si 3 dan **7** ga o'zgardi, `soni` esa sukut bo'yicha qiymatga qaytdi. Qatorga boshqa jadvallar tashqi kalit bilan murojaat qilgan bo'lsa, ular uchun bu o'chirish (14-bob).

**`INSERT IGNORE`** xatoni ogohlantirishga aylantirib, qatorni o'tkazib yuboradi:

```text
| Warning | 1062 | Duplicate entry 'olma' for key 'lugat.soz' |
```

### SQLite: `ON CONFLICT` (PostgreSQL uslubida)

SQLite hujjatiga ko'ra UPSERT standartda yo'q. SQLite PostgreSQL sintaksisiga amal qiladi, ba'zi kengaytmalar bilan:

- `excluded.` qo'shilmoqchi bo'lgan qatorni bildiradi;
- `DO UPDATE` dagi oddiy ustun nomi **eski** qiymat;
- bir nechta `ON CONFLICT` bandi yozish mumkin. Ular tartib bilan tekshiriladi, oxirgisida maqsad ko'rsatilmasligi mumkin;
- UPSERT faqat takrorlanmaslik cheklovlariga ishlaydi. `NOT NULL`, `CHECK` va tashqi kalitlarga emas.

```text
SQLite-3.54 memory-> INSERT INTO lugat (soz, soni) VALUES ('olma', 5), ('nok', 10)
                     ON CONFLICT (soz) DO UPDATE SET soni = soni + excluded.soni RETURNING *;
id|soz|soni
1|olma|6
2|nok|10
SQLite-3.54 memory-> INSERT INTO lugat (id, soz) VALUES (1, 'yangi')
                     ON CONFLICT (soz) DO NOTHING
                     ON CONFLICT (id) DO UPDATE SET soz = excluded.soz RETURNING *;
id|soz|soni
1|yangi|6
```

Ikkinchi buyruqda `id` bo'yicha konflikt bo'ldi va ikkinchi `ON CONFLICT` bandi ishladi.

**`INSERT … SELECT` dagi noaniqlik.** Hujjat bunday holatni oldindan aytadi: `SELECT` dan keyin to'g'ridan-to'g'ri `ON CONFLICT` yozilsa, sintaksis noaniq bo'lib qoladi. Yechimi — `WHERE true` qo'shish:

```text
SQLite-3.54 memory-> INSERT INTO lugat (soz, soni) SELECT soz, soni FROM manba
                     ON CONFLICT (soz) DO UPDATE SET soni = soni + excluded.soni;
Parse error near line 11: near "DO": syntax error
SQLite-3.54 memory-> INSERT INTO lugat (soz, soni) SELECT soz, soni FROM manba WHERE true
                     ON CONFLICT (soz) DO UPDATE SET soni = soni + excluded.soni RETURNING *;
id|soz|soni
3|nok|4
```

**`INSERT OR REPLACE`** — MySQL'dagi `REPLACE` ga o'xshaydi. Mos qator o'chirilib, yangisi yoziladi. Bu yerda ham `nok` ning `id` si 2 dan 3 ga o'zgardi:

```text
SQLite-3.54 memory-> INSERT OR REPLACE INTO lugat (soz, soni) VALUES ('nok', 1);
SQLite-3.54 memory-> SELECT * FROM lugat;
id|soz|soni
1|yangi|6
3|nok|1
```

`MERGE` SQLite'da yo'q:

```text
Parse error near line 13: near "MERGE": syntax error
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| UPSERT | `ON CONFLICT (…) DO UPDATE / DO NOTHING` | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT (…) DO UPDATE / DO NOTHING` |
| Konflikt maqsadi | Ko'rsatiladi | Yo'q — har qanday takrorlanmas kalit | Ko'rsatiladi; bir nechta band |
| Yangi qiymat | `EXCLUDED.ustun` | `AS new` → `new.ustun` (`VALUES()` eskirgan) | `excluded.ustun` |
| Standart `MERGE` | Ha (15+; `RETURNING` — 17+) | Yo'q | Yo'q |
| O'chirib-qayta yozish | — | `REPLACE` | `INSERT OR REPLACE` |
| Takrorni o'tkazib yuborish | `DO NOTHING` | `INSERT IGNORE` | `DO NOTHING`, `INSERT OR IGNORE` |
| Buyruqda bir xil kalit ikki marta | Xato | Ikkinchisi yangilaydi | — |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "`SELECT` → bo'lmasa `INSERT`" ni ikki buyruqda qilish | Parallel tranzaksiyalarda takror kalit xatosi yoki ikki marta qo'shish | Bitta buyruqda UPSERT |
| `REPLACE` / `INSERT OR REPLACE` ni "yangilash" deb ishlatish | Qator o'chiriladi: ID o'zgaradi, berilmagan ustunlar sukut bo'yicha qiymatga qaytadi, tashqi kalitlar ta'sirlanadi | `ON DUPLICATE KEY UPDATE` / `ON CONFLICT DO UPDATE` |
| MySQL'da bir nechta `UNIQUE` kalitli jadvalda `ON DUPLICATE KEY UPDATE` | Qaysi kalit konfliktga sabab bo'lgani noaniq | Hujjat maslahati: bunday jadvallarda qochish |
| MySQL'da `VALUES(ustun)` ishlatish | Eskirgan | `… AS new … new.ustun` |
| PostgreSQL'da konflikt maqsadini cheklovsiz ustunga yozish | `no unique or exclusion constraint matching` | Ustunda `UNIQUE`/`PRIMARY KEY` bo'lishi kerak |
| Bitta `INSERT` da bir xil kalitni ikki marta yuborish (PostgreSQL) | `cannot affect row a second time` | Ma'lumotni avval jamlash yoki takrorlarni olib tashlash |
| `MERGE` da manbada bir maqsad qatoriga bir nechta qator | Xato | Manbani kalit bo'yicha takrorlanmas qilish |
| MySQL'da UPSERT dan keyin ID'lar ketma-ket bo'ladi deb kutish | Yangilanishda ham `AUTO_INCREMENT` sarflanadi | Bo'shliqlarni normal deb qabul qilish (13-bob) |
| SQLite'da `INSERT … SELECT … ON CONFLICT` ni `WHERE` siz yozish | Sintaksis xatosi | `… WHERE true ON CONFLICT …` |

## Amaliyot

1. `savatcha(foydalanuvchi_id, mahsulot_id, soni)` jadvalini `(foydalanuvchi_id, mahsulot_id)` birlamchi kaliti bilan yarating. Bir mahsulotni uch marta "qo'shing" — soni 3 bo'lishi kerak. Buni uchala tizimda qiling.
2. PostgreSQL'da `ON CONFLICT … DO UPDATE … WHERE` bilan faqat yangi narx eskisidan farq qilganda yangilang. `RETURNING` nimani qaytardi?
3. `narxlar_yangi` jadvalidagi ma'lumotni `MERGE` bilan `narxlar` ga birlashtiring: bor bo'lsa yangilang, yo'q bo'lsa qo'shing, `narxlar_yangi` da yo'q bo'lganlarini `WHEN NOT MATCHED BY SOURCE THEN DELETE` bilan o'chiring.
4. MySQL'da `REPLACE` va `ON DUPLICATE KEY UPDATE` ni bir xil qatorga qo'llab, ID va `ROW_COUNT()` ni solishtiring.
5. SQLite'da ikkita `ON CONFLICT` bandli UPSERT yozing: biri `email`, ikkinchisi `id` bo'yicha.

## Rasmiy hujjat

- PostgreSQL — INSERT (`ON CONFLICT`): <https://www.postgresql.org/docs/18/sql-insert.html>
- PostgreSQL — MERGE: <https://www.postgresql.org/docs/18/sql-merge.html>
- PostgreSQL — 9.23. Merge Support Functions (`merge_action()`): <https://www.postgresql.org/docs/18/functions-merge-support.html>
- MySQL — 15.2.7.2 INSERT ... ON DUPLICATE KEY UPDATE Statement: <https://dev.mysql.com/doc/refman/9.7/en/insert-on-duplicate.html>
- MySQL — 15.2.12 REPLACE Statement: <https://dev.mysql.com/doc/refman/9.7/en/replace.html>
- SQLite — UPSERT: <https://www.sqlite.org/lang_upsert.html>
- SQLite — ON CONFLICT clause: <https://www.sqlite.org/lang_conflict.html>
