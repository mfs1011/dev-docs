# 14 — Cheklovlar

[← Oldingi: Identity va sequence](13-identity-va-sequence.md) · [Mundarija](README.md) · [Keyingi: Generated ustunlar →](15-generated-ustunlar.md)

## Tushuncha

Ma'lumot tipi ustunga qanday qiymat yozish mumkinligini cheklaydi. Lekin PostgreSQL hujjati aytganidek, ko'p ilovalar uchun bu "juda qo'pol" cheklov:

- mahsulot narxi faqat **musbat** bo'lishi kerak, lekin "faqat musbat son" degan standart tip yo'q;
- har mahsulot raqami jadvalda **bitta** bo'lishi kerak, ya'ni boshqa qatorlarga nisbatan cheklov.

Buning uchun **cheklovlar** (*constraints*) bor. Ular jadvaldagi ma'lumot ustidan xohlagancha nazorat beradi. Cheklovni buzadigan qiymat yozishga urinilsa — xato. Hujjatga ko'ra bu qiymat sukut bo'yicha qiymatdan (`DEFAULT`) kelgan bo'lsa ham shunday.

Cheklovning ikki yozilish shakli bor:

- **ustun cheklovi** — ustun e'lonining ichida: `narx numeric CHECK (narx > 0)`;
- **jadval cheklovi** — ustunlar ro'yxatida alohida element: `CHECK (narx > chegirma)`. Bir nechta ustunga tegishli cheklovlar shunday yoziladi.

Cheklovga `CONSTRAINT nom` bilan nom berish mumkin. Hujjatga ko'ra bu xato xabarlarini tushunarli qiladi va keyin cheklovni o'zgartirishda unga murojaat qilishga imkon beradi. Nom berilmasa, tizim o'zi nom yaratadi.

### `CHECK`

`CHECK` — eng umumiy cheklov. U ustundagi qiymat mantiqiy ifodani qanoatlantirishini talab qiladi.

**Muhim qoida:** `CHECK` ifoda **rost** yoki **`NULL`** bo'lsa bajarilgan hisoblanadi. Operandlardan biri `NULL` bo'lsa, ifoda odatda `NULL` bo'ladi (10-bob). Demak `CHECK (narx > 0)` `NULL` ni to'xtatmaydi. Buning uchun `NOT NULL` kerak.

Hujjatda yana ikki ogohlantirish bor:

- PostgreSQL boshqa qatorlarga yoki boshqa jadvallarga murojaat qiladigan `CHECK` ni **qo'llamaydi**. Bunday cheklov oddiy sinovlarda ishlayotgandek ko'rinsa ham, keyingi o'zgarishlardan keyin buzilishi mumkin. Dump va restore ham muvaffaqiyatsiz bo'ladi. Qatorlar va jadvallar orasidagi qoidalar uchun `UNIQUE`, `EXCLUDE` va `FOREIGN KEY` ishlatiladi;
- PostgreSQL `CHECK` ifodasini **o'zgarmas** deb hisoblaydi: bir xil qator uchun doim bir xil natija beradi. Shuning uchun u faqat yozish va yangilashda tekshiriladi. Ifodadagi funksiyaning xatti-harakati keyin o'zgartirilsa, eski qatorlar qayta tekshirilmaydi.

### `NOT NULL`

`NOT NULL` ustunda `NULL` bo'lmasligini talab qiladi. Bu `CHECK (ustun IS NOT NULL)` ga teng, lekin PostgreSQL'da aniq `NOT NULL` samaraliroq.

Hujjatning maslahati: ko'p sxemalarda ustunlarning **ko'pchiligi** `NOT NULL` bo'lishi kerak.

`NULL` cheklovi ham bor. U ustun `NULL` bo'lishi **mumkin** deganini bildiradi, ya'ni sukut bo'yicha xatti-harakat. Bu cheklov standartda yo'q va ko'chiriluvchan ilovalarda ishlatilmasligi kerak.

### `UNIQUE`

`UNIQUE` ustundagi yoki ustunlar guruhidagi qiymatlar barcha qatorlar orasida **takrorlanmasligini** ta'minlaydi:

- `UNIQUE (a, c)` — juftlik takrorlanmasin, alohida ustunlar esa takrorlanishi mumkin;
- `UNIQUE` qo'shilganda avtomatik **B-tree indeks** yaratiladi (41-bob).

**`NULL` va `UNIQUE`.** Sukut bo'yicha ikki `NULL` bu tekshiruvda teng hisoblanmaydi. Shuning uchun `UNIQUE` ustunda bir nechta `NULL` bo'lishi mumkin. PostgreSQL 15 dan beri `UNIQUE NULLS NOT DISTINCT` bor. U `NULL` larni ham teng deb hisoblaydi. Hujjat ogohlantiradi: standartga ko'ra bu xatti-harakat "amalga oshiruvchiga bog'liq" va boshqa tizimlar boshqacha ishlaydi.

### `PRIMARY KEY`

Birlamchi kalit — qatorni **yagona aniqlaydigan** ustun yoki ustunlar. U `UNIQUE` + `NOT NULL` ga teng:

```sql
CREATE TABLE products (product_no integer UNIQUE NOT NULL, …);
CREATE TABLE products (product_no integer PRIMARY KEY, …);   -- bir xil ma'lumotni qabul qiladi
```

Qoidalar:

- jadvalda **eng ko'pi bitta** birlamchi kalit bo'ladi. `UNIQUE` lar esa xohlagancha;
- birlamchi kalit avtomatik B-tree indeks yaratadi va ustunlarni `NOT NULL` qiladi;
- tashqi kalitlar sukut bo'yicha aynan birlamchi kalitga murojaat qiladi.

Hujjat: "Relyatsion nazariyaga ko'ra **har jadvalda** birlamchi kalit bo'lishi kerak. PostgreSQL buni majburlamaydi, lekin odatda bu qoidaga amal qilgan yaxshi".

### `FOREIGN KEY` (tashqi kalit)

Tashqi kalit ustundagi qiymat **boshqa jadvalning** biror qatorida bo'lishini talab qiladi. Bu ikki jadval orasidagi **ma'lumot yaxlitligi**ni (*referential integrity*) saqlaydi.

```sql
CREATE TABLE orders (
    order_id integer PRIMARY KEY,
    product_no integer REFERENCES products (product_no),
    quantity integer
);
```

Atamalar:

- `orders` — murojaat qiluvchi jadval (bola);
- `products` — murojaat qilinadigan jadval (ota).

Ustunlar ko'rsatilmasa (`REFERENCES products`), otaning birlamchi kaliti olinadi. Tashqi kalit:

- **o'z jadvaliga** ham murojaat qilishi mumkin. Masalan, daraxt: `parent_id` → shu jadvalning `id` si;
- bir nechta bo'lishi mumkin. Shu orqali **ko'pga-ko'p** aloqa quriladi (37-bob);
- ota tomonda birlamchi kalit, `UNIQUE` cheklov yoki qisman bo'lmagan takrorlanmas indeksga murojaat qilishi shart.

**Ota qator o'chirilsa yoki o'zgartirilsa.** `ON DELETE` va `ON UPDATE` amallari:

| Amal | Ma'nosi |
| --- | --- |
| `NO ACTION` (sukut bo'yicha) | O'chirish boshlanadi, lekin cheklov baribir tekshiriladi, odatda xato beriladi. Tekshiruv tranzaksiya oxiriga **kechiktirilishi** mumkin |
| `RESTRICT` | Darhol taqiqlaydi, kechiktirib bo'lmaydi |
| `CASCADE` | Bog'liq bola qatorlar ham o'chiriladi (yoki yangilanadi) |
| `SET NULL` / `SET DEFAULT` | Bola qatordagi ustun `NULL` yoki sukut bo'yicha qiymatga o'tadi |

Hujjat qaysi birini tanlashni ham tushuntiradi:

- bola ota obyektning **qismi** bo'lsa va usiz mavjud bo'la olmasa — `CASCADE`. Masalan, buyurtma qatorlari buyurtmaning qismi;
- ikki jadval **mustaqil** obyektlar bo'lsa — `RESTRICT` yoki `NO ACTION`. Masalan, mahsulot o'chirilganda buyurtma qatorlari avtomatik o'chib ketishi muammoli bo'lishi mumkin;
- aloqa **ixtiyoriy** ma'lumot bo'lsa — `SET NULL` / `SET DEFAULT`.

**`NULL` va tashqi kalit.** Bola ustun `NULL` bo'lsa, cheklov tekshirilmaydi. Tekshiruv majburiy bo'lishi kerak bo'lsa, ustunga `NOT NULL` qo'yiladi.

**Indeks.** Ota qator o'chirilganda yoki kaliti o'zgarganda bola jadvalda mos qatorlar qidiriladi. Shuning uchun hujjat bola ustunlarga ham indeks qo'yishni "ko'pincha yaxshi fikr" deydi. Lekin PostgreSQL bu indeksni **avtomatik yaratmaydi** (41-bob).

### Kechiktiriladigan cheklovlar

`DEFERRABLE` cheklovni tekshirish tranzaksiya oxirigacha kechiktirilishi mumkin:

- `INITIALLY IMMEDIATE` — har buyruqdan keyin tekshiriladi, kerak bo'lsa `SET CONSTRAINTS` bilan kechiktiriladi;
- `INITIALLY DEFERRED` — `COMMIT` da tekshiriladi.

Hujjatga ko'ra faqat `UNIQUE`, `PRIMARY KEY`, `EXCLUDE` va `REFERENCES` kechiktirilishi mumkin. `NOT NULL` va `CHECK` kechiktirilmaydi.

### `NOT ENFORCED` (PostgreSQL 18)

`NOT ENFORCED` cheklovni **yaratadi, lekin tekshirmaydi**. Uning to'g'riligi uchun ilova javob beradi. Hujjat buni tekshiruv juda qimmat bo'lgan holatlarda "hujjat sifatida" foydali deydi. PostgreSQL 18 da faqat `FOREIGN KEY` va `CHECK` uchun ishlaydi.

### `EXCLUDE`

Exclusion (istisno) cheklovi har ikki qator ko'rsatilgan operatorlar bilan solishtirilganda kamida bitta solishtirish yolg'on yoki `NULL` bo'lishini ta'minlaydi. Masalan, "ikki bron vaqti **ustma-ust tushmasin**". U 40-bobda vaqt oraliqlari bilan ko'riladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `CHECK`, `NOT NULL`, `UNIQUE`, `PRIMARY KEY`

```sql
CREATE TABLE mahsulotlar (
    id        integer PRIMARY KEY,
    nom       text NOT NULL,
    narx      numeric CONSTRAINT musbat_narx CHECK (narx > 0),
    chegirma  numeric CHECK (chegirma > 0),
    sku       text UNIQUE,
    CHECK (narx > chegirma)
);

INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, 3500, 'NON-1');
INSERT INTO mahsulotlar VALUES (2, 'Sut', -5, NULL, 'SUT-1');
INSERT INTO mahsulotlar VALUES (3, 'Choy', 9000, 9500, 'CHOY-1');
INSERT INTO mahsulotlar VALUES (4, 'Tuz', NULL, NULL, NULL);
INSERT INTO mahsulotlar VALUES (5, NULL, 1000, NULL, NULL);
INSERT INTO mahsulotlar VALUES (1, 'Takror', 100, NULL, NULL);
INSERT INTO mahsulotlar VALUES (6, 'A', 100, NULL, 'NON-1');
INSERT INTO mahsulotlar VALUES (7, 'B', 100, NULL, NULL), (8, 'C', 100, NULL, NULL);
```

```text
INSERT 0 1
ERROR:  new row for relation "mahsulotlar" violates check constraint "musbat_narx"
DETAIL:  Failing row contains (2, Sut, -5, null, SUT-1).
ERROR:  new row for relation "mahsulotlar" violates check constraint "mahsulotlar_check"
DETAIL:  Failing row contains (3, Choy, 9000, 9500, CHOY-1).
INSERT 0 1
ERROR:  null value in column "nom" of relation "mahsulotlar" violates not-null constraint
DETAIL:  Failing row contains (5, null, 1000, null, null).
ERROR:  duplicate key value violates unique constraint "mahsulotlar_pkey"
DETAIL:  Key (id)=(1) already exists.
ERROR:  duplicate key value violates unique constraint "mahsulotlar_sku_key"
DETAIL:  Key (sku)=(NON-1) already exists.
INSERT 0 2
```

Natijalarni qatorma-qator ko'ramiz:

- **2-qator.** Nom berilgan cheklov (`musbat_narx`) xatoda o'z nomi bilan chiqdi.
- **3-qator.** Jadval cheklovi `narx > chegirma` buzildi. Nomini tizim o'zi berdi: `mahsulotlar_check`.
- **4-qator.** `narx` `NULL` bo'lgani uchun `CHECK` lar ham `NULL` berdi, ya'ni o'tdi. Qator **qabul qilindi**.
- **7- va 8-qatorlar.** `sku` ikkalasida ham `NULL`, lekin `UNIQUE` ularni takror deb hisoblamadi.

Jadval tuzilmasi:

```text
             Table "public.mahsulotlar"
  Column  |  Type   | Collation | Nullable | Default 
----------+---------+-----------+----------+---------
 id       | integer |           | not null | 
 nom      | text    |           | not null | 
 narx     | numeric |           |          | 
 chegirma | numeric |           |          | 
 sku      | text    |           |          | 
Indexes:
    "mahsulotlar_pkey" PRIMARY KEY, btree (id)
    "mahsulotlar_sku_key" UNIQUE CONSTRAINT, btree (sku)
Check constraints:
    "mahsulotlar_check" CHECK (narx > chegirma)
    "mahsulotlar_chegirma_check" CHECK (chegirma > 0::numeric)
    "musbat_narx" CHECK (narx > 0::numeric)
```

`PRIMARY KEY` va `UNIQUE` uchun indekslar avtomatik yaratildi. `id` ga `NOT NULL` ham o'zi qo'shildi.

`NULLS NOT DISTINCT` bilan `NULL` lar ham takror hisoblanadi:

```sql
CREATE TABLE t (kod text UNIQUE NULLS NOT DISTINCT);
INSERT INTO t VALUES (NULL);
INSERT INTO t VALUES (NULL);
```

```text
INSERT 0 1
ERROR:  duplicate key value violates unique constraint "t_kod_key"
DETAIL:  Key (kod)=(null) already exists.
```

### Tashqi kalitlar

Hujjatdagi buyurtma misolini takrorlaymiz. Buyurtma qatorlari buyurtma bilan birga o'chadi, mahsulotni esa ishlatilayotgan bo'lsa o'chirib bo'lmaydi:

```sql
CREATE TABLE buyurtmalar (id integer PRIMARY KEY, manzil text);
CREATE TABLE buyurtma_qatorlari (
    buyurtma_id  integer REFERENCES buyurtmalar ON DELETE CASCADE,
    mahsulot_id  integer REFERENCES mahsulotlar ON DELETE RESTRICT,
    soni         integer NOT NULL CHECK (soni > 0),
    PRIMARY KEY (buyurtma_id, mahsulot_id)
);
INSERT INTO buyurtmalar VALUES (100, 'Toshkent');
INSERT INTO buyurtma_qatorlari VALUES (100, 1, 2), (100, 7, 1);
INSERT INTO buyurtma_qatorlari VALUES (100, 999, 1);
DELETE FROM mahsulotlar WHERE id = 1;
DELETE FROM buyurtmalar WHERE id = 100;
SELECT count(*) AS qolgan_qatorlar FROM buyurtma_qatorlari;
```

```text
INSERT 0 2
ERROR:  insert or update on table "buyurtma_qatorlari" violates foreign key constraint "buyurtma_qatorlari_mahsulot_id_fkey"
DETAIL:  Key (mahsulot_id)=(999) is not present in table "mahsulotlar".
ERROR:  update or delete on table "mahsulotlar" violates RESTRICT setting of foreign key constraint "buyurtma_qatorlari_mahsulot_id_fkey" on table "buyurtma_qatorlari"
DETAIL:  Key (id)=(1) is referenced from table "buyurtma_qatorlari".
DELETE 1
 qolgan_qatorlar 
-----------------
               0
(1 row)
```

- Mavjud bo'lmagan 999-mahsulotga murojaat rad etildi.
- 1-mahsulotni o'chirish `RESTRICT` tufayli taqiqlandi.
- 100-buyurtma o'chirilganda uning qatorlari ham `CASCADE` bilan o'chdi.

Birlamchi kalit tarkibidagi tashqi kalit `NOT NULL` bo'lib qolgani uchun `NULL` ham o'tmaydi:

```text
ERROR:  null value in column "buyurtma_id" of relation "buyurtma_qatorlari" violates not-null constraint
```

O'ziga murojaat qiluvchi tashqi kalit va `SET NULL`:

```sql
CREATE TABLE xodimlar (
    id int PRIMARY KEY,
    rahbar_id int REFERENCES xodimlar ON DELETE SET NULL,
    ism text
);
INSERT INTO xodimlar VALUES (1, NULL, 'Direktor'), (2, 1, 'Bo''lim boshlig''i'), (3, 2, 'Mutaxassis');
DELETE FROM xodimlar WHERE id = 2;
SELECT * FROM xodimlar ORDER BY id;
```

```text
 id | rahbar_id |    ism     
----+-----------+------------
  1 |           | Direktor
  3 |           | Mutaxassis
(2 rows)
```

Bo'lim boshlig'i o'chirilganda mutaxassisning `rahbar_id` si `NULL` ga aylandi.

### Kechiktirilgan tekshiruv

Ikki jadval bir-biriga murojaat qiladi. Ularning qatorlarini qaysi tartibda yozsangiz ham, birinchisi yozilayotganda ikkinchisi hali yo'q. `INITIALLY DEFERRED` bu muammoni hal qiladi:

```sql
CREATE TABLE a (id int PRIMARY KEY, b_id int);
CREATE TABLE b (id int PRIMARY KEY, a_id int REFERENCES a DEFERRABLE INITIALLY DEFERRED);
ALTER TABLE a ADD FOREIGN KEY (b_id) REFERENCES b DEFERRABLE INITIALLY DEFERRED;

BEGIN;
INSERT INTO a VALUES (1, 10);
INSERT INTO b VALUES (10, 1);
COMMIT;

BEGIN;
INSERT INTO a VALUES (2, 20);
COMMIT;
```

```text
BEGIN
INSERT 0 1
INSERT 0 1
COMMIT
BEGIN
INSERT 0 1
ERROR:  insert or update on table "a" violates foreign key constraint "a_b_id_fkey"
DETAIL:  Key (b_id)=(20) is not present in table "b".
```

Birinchi tranzaksiyada `COMMIT` paytida hamma narsa joyida edi. Ikkinchisida esa 20-qator paydo bo'lmadi. `INSERT` o'zi xatosiz o'tdi, xato `COMMIT` da chiqdi.

### `NOT ENFORCED`

```sql
CREATE TABLE tekshirilmaydigan (
    x int CHECK (x > 0) NOT ENFORCED,
    y int REFERENCES a NOT ENFORCED
);
INSERT INTO tekshirilmaydigan VALUES (-5, 999);
SELECT * FROM tekshirilmaydigan;
```

```text
INSERT 0 1
 x  |  y  
----+-----
 -5 | 999
(1 row)
```

Ikkala cheklov ham bor, lekin tekshirilmadi.

## Dialektlar

### MySQL

**`CHECK`.** MySQL'da `CHECK` barcha storage engine'larda ishlaydi va `[NOT] ENFORCED` ni qo'llab-quvvatlaydi. Hujjatga ko'ra ifoda `TRUE` yoki `UNKNOWN` (`NULL`) bo'lishi kerak, ya'ni PostgreSQL'dagi qoida bilan bir xil.

```sql
CREATE TABLE mahsulotlar (
    id INT PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    narx DECIMAL(10,2) CONSTRAINT musbat_narx CHECK (narx > 0),
    sku VARCHAR(20) UNIQUE,
    eslatma INT CHECK (eslatma > 0) NOT ENFORCED
);
INSERT INTO mahsulotlar VALUES (1, 'Non', 4000, 'NON-1', NULL);
INSERT INTO mahsulotlar VALUES (2, 'Sut', -5, 'SUT-1', NULL);
INSERT INTO mahsulotlar VALUES (3, 'A', 10, NULL, -7), (4, 'B', 10, NULL, NULL);
SELECT id, sku, eslatma FROM mahsulotlar ORDER BY id;
```

```text
ERROR 3819 (HY000) at line 9: Check constraint 'musbat_narx' is violated.
+----+-------+---------+
| id | sku   | eslatma |
+----+-------+---------+
|  1 | NON-1 |    NULL |
|  3 | NULL  |      -7 |
|  4 | NULL  |    NULL |
+----+-------+---------+
```

`UNIQUE` ustunda ikkita `NULL` qabul qilindi. `NOT ENFORCED` cheklov `-7` ni o'tkazib yubordi.

**Tashqi kalit uchun `NOT ENFORCED` va `DEFERRABLE` yo'q.** Ikkalasi sintaksis xatosi beradi:

```text
ERROR 1064 (42000) at line 21: … near 'NOT ENFORCED)' at line 1
ERROR 1064 (42000) at line 22: … near 'DEFERRABLE INITIALLY DEFERRED)' at line 1
```

Hujjatga ko'ra MySQL tashqi kalitni **darhol** tekshiradi va tranzaksiya oxiriga kechiktirmaydi. Hujjat standartda sukut bo'yicha kechiktirilgan tekshiruv bo'lishi kerakligini, ya'ni butun buyruq bajarilgandan keyin, tan oladi. Natijada o'ziga tashqi kalit bilan murojaat qiladigan qatorni o'chirib bo'lmaydi.

**Bola tomonda indeks avtomatik yaratiladi.** MySQL tashqi kalit uchun ikkala tomonda ham indeks talab qiladi. Bola jadvalda u bo'lmasa, avtomatik yaratiladi. PostgreSQL'da esa bunday emas:

```sql
CREATE TABLE buyurtma_qatorlari (
    buyurtma_id INT NOT NULL,
    mahsulot_id INT,
    FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar (id) ON DELETE RESTRICT
);
SHOW INDEX FROM buyurtma_qatorlari;
```

```text
| buyurtma_qatorlari |          1 | mahsulot_id |            1 | mahsulot_id | A | … | BTREE | …
```

Xatolar:

```text
ERROR 1452 (23000) at line 18: Cannot add or update a child row: a foreign key constraint fails (`qollanma`.`buyurtma_qatorlari`, CONSTRAINT `buyurtma_qatorlari_ibfk_1` FOREIGN KEY (`mahsulot_id`) REFERENCES `mahsulotlar` (`id`) ON DELETE RESTRICT)
ERROR 1451 (23000) at line 20: Cannot delete or update a parent row: a foreign key constraint fails (…)
```

**Boshqa farqlar** (hujjat bo'yicha):

- `MATCH` bandini hech bir storage engine qo'llamaydi. Uni yozish `ON DELETE`/`ON UPDATE` ni **e'tiborsiz qoldirishga** olib keladi, shuning uchun undan qochish kerak;
- takrorlanmas bo'lmagan kalitga tashqi kalit — InnoDB kengaytmasi. U eskirgan va faqat `restrict_fk_on_non_standard_key` bilan ishlaydi;
- MySQL 9.6 dan beri InnoDB jadvallarining tashqi kalitlarini sukut bo'yicha storage engine emas, **SQL qatlami** tekshiradi (`innodb_native_foreign_keys = 0`). Bir natijasi: tashqi kalit tufayli rad etilgan `INSERT` `AUTO_INCREMENT` qiymatini "yemaydi".

```text
| @@innodb_native_foreign_keys |
|                            0 |
```

### SQLite

**Tashqi kalitlar sukut bo'yicha o'chiq.** SQLite hujjatiga ko'ra ular orqaga moslik uchun o'chirilgan. Ularni **har ulanish uchun alohida** `PRAGMA foreign_keys = ON` bilan yoqish kerak. Hujjat qo'shimcha qiladi: kelajakda sukut bo'yicha yoqilishi mumkin. Shuning uchun ehtiyotkor dasturchi ular yoqilgan yoki yoqilmaganiga tayanmaydi, kerakli holatni o'zi o'rnatadi.

```text
SQLite-3.54 memory-> PRAGMA foreign_keys;
│ foreign_keys │
│            0 │
SQLite-3.54 memory-> INSERT INTO qatorlar VALUES (100, 999);
SQLite-3.54 memory-> SELECT * FROM qatorlar;
│ buyurtma_id │ mahsulot_id │
│         100 │         999 │
SQLite-3.54 memory-> PRAGMA foreign_keys = ON;
SQLite-3.54 memory-> INSERT INTO qatorlar VALUES (101, 888);
Error near line 8: FOREIGN KEY constraint failed
```

O'chiq holatda yo'q 999-mahsulotga murojaat **xatosiz** yozildi. Yoqilgandan keyin rad etildi.

`CHECK` va `NOT NULL` SQLite'da doim ishlaydi:

```text
SQLite-3.54 memory-> INSERT INTO mahsulotlar VALUES (2, 'Sut', -5);
Error near line 9: CHECK constraint failed: narx > 0
```

**Birlamchi kalitda `NULL`.** SQLite "Quirks" sahifasi buni ochiq tan oladi. Tarixiy xato tufayli `PRIMARY KEY` ustunlarida `NULL` bo'lishi mumkin. Xato topilganda unga tayangan bazalar shunchalik ko'p ediki, uni saqlab qolishga qaror qilingan. Yechim — `PRIMARY KEY` ning har ustuniga `NOT NULL` qo'shish. Istisnolar:

- `INTEGER PRIMARY KEY`;
- `WITHOUT ROWID` jadvallar;
- `STRICT` jadvallar.

```text
SQLite-3.54 memory-> CREATE TABLE kod (k TEXT PRIMARY KEY, x INT);
SQLite-3.54 memory-> INSERT INTO kod VALUES (NULL, 1), (NULL, 2);
SQLite-3.54 memory-> SELECT * FROM kod;
│  k   │ x │
│ NULL │ 1 │
│ NULL │ 2 │
```

Ikkita qatorning birlamchi kaliti `NULL`.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `CHECK` | Ha | Ha | Ha |
| `CHECK` `NULL` ni o'tkazadi | Ha | Ha | Ha |
| `UNIQUE` da bir nechta `NULL` | Ha (`NULLS NOT DISTINCT` bilan — yo'q) | Ha | Ha |
| `PRIMARY KEY` da `NULL` | Yo'q | Yo'q | **Ha** (tarixiy xato; `NOT NULL` qo'shish kerak) |
| Tashqi kalit sukut bo'yicha | Ishlaydi | Ishlaydi | **O'chiq** — `PRAGMA foreign_keys = ON` |
| Bola ustunga indeks | Avtomatik emas | Avtomatik | Avtomatik emas |
| Kechiktirilgan tekshiruv | `DEFERRABLE` (`UNIQUE`, PK, FK, `EXCLUDE`) | Yo'q | `DEFERRABLE INITIALLY DEFERRED` (FK) |
| `NOT ENFORCED` | `CHECK` va FK (18 dan) | Faqat `CHECK` | Yo'q |
| `EXCLUDE` | Ha | Yo'q | Yo'q |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `CHECK (narx > 0)` `NULL` ni ham to'xtatadi deb o'ylash | `NULL` da ifoda noma'lum, cheklov o'tadi | `NOT NULL` ni qo'shish |
| Ustunlarning ko'pini `NULL` ga ruxsat bilan qoldirish | Noma'lum qiymatlar jimgina to'planadi | Hujjat maslahati: ko'p ustunlar `NOT NULL` |
| `UNIQUE` ustunda `NULL` lar ham takrorlanmaydi deb kutish | Sukut bo'yicha bir nechta `NULL` mumkin | PostgreSQL: `NULLS NOT DISTINCT`; yoki `NOT NULL` |
| Boshqa jadvalga murojaat qiluvchi `CHECK` yoki funksiya | PostgreSQL buni kafolatlamaydi; dump/restore buziladi | `FOREIGN KEY`, `UNIQUE`, `EXCLUDE` yoki trigger |
| Mustaqil obyektlar orasida `ON DELETE CASCADE` | Mahsulot o'chsa, buyurtma tarixi ham o'chib ketadi | `RESTRICT` / `NO ACTION`; `CASCADE` faqat "qism" uchun |
| PostgreSQL'da tashqi kalit ustuniga indeks qo'ymaslik | Ota qatorni o'chirish bola jadvalni to'liq ko'rib chiqadi | Bola ustunga indeks (41-bob) |
| SQLite'da `PRAGMA foreign_keys = ON` ni unutish | Tashqi kalitlar umuman tekshirilmaydi | Har ulanishda yoqish |
| SQLite'da `TEXT PRIMARY KEY` ni `NOT NULL` siz qoldirish | Kalitda `NULL` bo'lishi mumkin | `NOT NULL` yoki `STRICT` jadval |
| Cheklovlarga nom bermaslik | Xato xabarlari va migratsiyalar tushunarsiz bo'ladi | `CONSTRAINT ma'noli_nom …` |
| MySQL'da tashqi kalitga `MATCH` yozish | `ON DELETE`/`ON UPDATE` e'tiborsiz qoladi | `MATCH` ni yozmaslik |

## Amaliyot

1. `talabalar` jadvaliga cheklovlar qo'shing: `ism` bo'sh bo'lmasin (`CHECK (length(ism) > 0)`), `kurs` 1 dan 4 gacha, `email` takrorlanmasin. Har birini buzadigan qator yozib, xatolarni o'qing.
2. `CHECK (kurs BETWEEN 1 AND 4)` li ustunga `NULL` yozing. Nega o'tdi? Uni qanday to'xtatish mumkin?
3. `kategoriyalar` jadvalini o'ziga murojaat qiluvchi `ota_id` bilan yarating. `ON DELETE CASCADE` va `ON DELETE SET NULL` ni solishtiring.
4. PostgreSQL'da `buyurtma_qatorlari.mahsulot_id` ga indeks qo'ymasdan va qo'yib `\d buyurtma_qatorlari` ni solishtiring. MySQL'da `SHOW INDEX` bilan xuddi shuni qiling.
5. Ikki jadval bir-biriga murojaat qiladigan holatni `DEFERRABLE` siz yaratib, qatorlarni yozib ko'ring. Keyin `INITIALLY DEFERRED` bilan takrorlang.
6. SQLite'da yangi ulanishda `PRAGMA foreign_keys;` ni tekshiring. Ilovangizda uni qayerda yoqish kerakligini o'ylang.

## Rasmiy hujjat

- PostgreSQL — 5.5. Constraints: <https://www.postgresql.org/docs/18/ddl-constraints.html>
- PostgreSQL — CREATE TABLE (`DEFERRABLE`, `NOT ENFORCED`, `NULLS NOT DISTINCT`): <https://www.postgresql.org/docs/18/sql-createtable.html>
- PostgreSQL — SET CONSTRAINTS: <https://www.postgresql.org/docs/18/sql-set-constraints.html>
- MySQL — 15.1.25.6 CHECK Constraints: <https://dev.mysql.com/doc/refman/9.7/en/create-table-check-constraints.html>
- MySQL — 15.1.25.5 FOREIGN KEY Constraints: <https://dev.mysql.com/doc/refman/9.7/en/create-table-foreign-keys.html>
- MySQL — 1.7.2.3 FOREIGN KEY Constraint Differences: <https://dev.mysql.com/doc/refman/9.7/en/ansi-diff-foreign-keys.html>
- SQLite — SQLite Foreign Key Support: <https://www.sqlite.org/foreignkeys.html>
- SQLite — CREATE TABLE (cheklovlar): <https://www.sqlite.org/lang_createtable.html>
- SQLite — Quirks (5. PRIMARY KEYs Can Sometimes Contain NULLs): <https://www.sqlite.org/quirks.html>
