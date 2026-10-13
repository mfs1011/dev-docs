# 37 — Aloqalar va tashqi kalitlar

[← Oldingi: Massiv, range, domain va composite](36-massiv-range-domain-composite.md) · [Mundarija](README.md) · [Keyingi: Normalizatsiya va tuzilma →](38-normalizatsiya-va-tuzilma.md)

## Tushuncha

14-bobda tashqi kalitning (foreign key) **mexanikasi** ko'rildi: `REFERENCES`, `ON DELETE`/`ON UPDATE` amallari, kechiktirilgan tekshiruv, SQLite'dagi `PRAGMA foreign_keys`. Bu bob — **loyihalash**: jadvallar orasidagi aloqa turlari qanday quriladi va har biriga qaysi amal mos keladi.

PostgreSQL qo'llanmasi (tutorial) tashqi kalitning vazifasini sodda tushuntiradi: `weather` jadvaliga `cities` da yo'q shahar yozilmasin. Buni ilovada qo'lda tekshirish (avval qidirib, keyin yozish) "qator muammolarga ega va juda noqulay" — ma'lumotlar bazasi buni o'zi qila oladi. Bu **ma'lumot yaxlitligi** (referential integrity).

### Aloqa turlari

| Tur | Ma'nosi | Qanday quriladi |
| --- | --- | --- |
| **1:N** (birga-ko'p) | Bitta mijozning ko'p buyurtmasi; har buyurtma bitta mijozniki | "Ko'p" tomonda tashqi kalit: `orders.mijoz_id → mijozlar.id` |
| **1:1** (birga-bir) | Bitta mijozning ko'pi bilan bitta profili | Bola tomonda tashqi kalit **va** `UNIQUE` (yoki u birlamchi kalitning o'zi) |
| **M:N** (ko'pga-ko'p) | Bir buyurtmada ko'p mahsulot, bir mahsulot ko'p buyurtmada | **Oraliq jadval** (junction table) — ikkita tashqi kalit |
| O'ziga murojaat | Xodim — rahbari ham xodim; kategoriya — ota kategoriyasi | Jadval o'z birlamchi kalitiga (14-bob, 30-bob) |

**Kardinallik** (cardinality) — aloqaning har tomonida nechta qator bo'lishi mumkinligi. U ustun cheklovlari bilan ifodalanadi:

- bola ustun `NOT NULL` — aloqa **majburiy** (har buyurtmaning mijozi bo'lishi shart);
- `NULL` ga ruxsat — **ixtiyoriy** (14-bob: `NULL` qiymatda tashqi kalit tekshirilmaydi);
- `UNIQUE` — "ko'p" tomon "bitta"ga aylanadi (1:1).

### M:N: oraliq jadval

PostgreSQL hujjatining "Foreign Keys" bo'limida aynan shu misol bor. Avval `orders` jadvalida bitta `product_no` ustuni bor edi — bir buyurtmada bitta mahsulot. Bir buyurtmada ko'p mahsulot bo'lishi uchun hujjat **uchinchi jadval** taklif qiladi:

```sql
CREATE TABLE order_items (
    product_no integer REFERENCES products ON DELETE RESTRICT,
    order_id   integer REFERENCES orders   ON DELETE CASCADE,
    quantity   integer,
    PRIMARY KEY (product_no, order_id)
);
```

Hujjat ta'kidlaydi: **birlamchi kalit tashqi kalitlar bilan ustma-ust tushadi**. `PRIMARY KEY (product_no, order_id)` bitta mahsulot bitta buyurtmada ikki marta yozilishiga yo'l qo'ymaydi.

Oraliq jadval faqat "bog'lovchi" emas — u **aloqaning o'z xususiyatlarini** saqlaydi: `quantity` (nechta), sotilgan paytdagi `price`. Narx `products` da o'zgarishi mumkin, buyurtmadagi narx esa o'zgarmasligi kerak.

### `ON DELETE` ni aloqaga qarab tanlash

Hujjatdagi siyosat (14-bobda qisqa aytilgan, bu yerda M:N misolida):

- mahsulot hali buyurtmada bo'lsa, uni o'chirish **taqiqlanadi** — `ON DELETE RESTRICT`: mahsulot va buyurtma **mustaqil** obyektlar;
- buyurtma o'chirilsa, uning qatorlari ham o'chadi — `ON DELETE CASCADE`: buyurtma qatori buyurtmaning **qismi**.

Umumiy qoida — bola ota obyektning qismimi yoki mustaqil obyektmi:

| Aloqa | Bola ota usiz ma'noga egami? | Amal |
| --- | --- | --- |
| Buyurtma → buyurtma qatorlari | Yo'q, qismi | `CASCADE` |
| Mijoz → profil (1:1) | Yo'q, qismi | `CASCADE` |
| Mahsulot ← buyurtma qatorlari | Ha, tarix | `RESTRICT` / `NO ACTION` |
| Mijoz ← buyurtmalar | Ha, moliyaviy hujjat | `RESTRICT` / `NO ACTION` |
| Mahsulot → menejer (ixtiyoriy) | Ha | `SET NULL` |

### Kompozit tashqi kalit va `SET NULL (ustunlar)`

Tashqi kalit bir nechta ustundan iborat bo'lishi mumkin — ota tomonning kompozit kalitiga. PostgreSQL hujjatida ko'p ijarachili (multi-tenant) misol bor: har jadvalda `tenant_id`, `posts` dagi muallif — `(tenant_id, author_id) → users (tenant_id, user_id)`. Muallif o'chirilganda faqat `author_id` `NULL` bo'lishi kerak — `tenant_id` birlamchi kalitning qismi, uni `NULL` qilib bo'lmaydi. Buning uchun:

```sql
FOREIGN KEY (tenant_id, author_id) REFERENCES users ON DELETE SET NULL (author_id)
```

Hujjatga ko'ra `SET NULL` / `SET DEFAULT` ustunlar ro'yxatini faqat `ON DELETE` da oladi, `ON UPDATE` da emas.

### Indekslar

Ota qator o'chirilganda bola jadvalda shu kalitli qatorlar qidiriladi. SQLite hujjati buni aniq ko'rsatadi: ota o'chirilganda u `SELECT rowid FROM bola WHERE bola_kalit = ?` ga teng so'rovni bajaradi. Bola kalitida indeks bo'lmasa — **butun bola jadval** o'qiladi. SQLite hujjati: bola kaliti uchun indeks "talab qilinmaydi, lekin deyarli doim foydali".

| | Ota tomonda | Bola tomonda |
| --- | --- | --- |
| PostgreSQL | `PRIMARY KEY`/`UNIQUE` shart | Indeks **avtomatik yaratilmaydi** (14-bob) |
| MySQL | Indeks shart | Hujjatga ko'ra tashqi kalit ustunlari **birinchi** turgan indeks bo'lmasa — **avtomatik yaratiladi** |
| SQLite | `PRIMARY KEY` yoki `UNIQUE` shart | Avtomatik yaratilmaydi |

Oraliq jadvalda nozik joy bor: `PRIMARY KEY (product_no, order_id)` indeksi `product_no` bo'yicha qidiruvga yaraydi, lekin `order_id` bo'yicha — yo'q (ko'p ustunli indeksda chap ustun qoidasi, 42-bob). Buyurtma o'chirilganda (`CASCADE`) `order_items` dan `order_id` bo'yicha qidiriladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 (`PRAGMA foreign_keys = ON`) da ishga tushirilgan.

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, ism varchar(30) NOT NULL);

-- 1:1 — profil birlamchi kaliti = mijoz kaliti
CREATE TABLE mijoz_profil (
    mijoz_id int PRIMARY KEY REFERENCES mijozlar (id) ON DELETE CASCADE,
    tug_sana date,
    bio      varchar(200)
);

CREATE TABLE products (product_no int PRIMARY KEY, name varchar(30), price numeric(10,2));

-- 1:N — har buyurtmaning mijozi majburiy
CREATE TABLE orders (
    order_id int PRIMARY KEY,
    mijoz_id int NOT NULL REFERENCES mijozlar (id) ON DELETE RESTRICT,
    shipping_address varchar(100)
);

-- M:N — oraliq jadval, aloqaning o'z ustunlari bilan
CREATE TABLE order_items (
    product_no int REFERENCES products (product_no) ON DELETE RESTRICT,
    order_id   int REFERENCES orders (order_id)     ON DELETE CASCADE,
    quantity   int NOT NULL CHECK (quantity > 0),
    price      numeric(10,2) NOT NULL,
    PRIMARY KEY (product_no, order_id)
);

INSERT INTO mijozlar VALUES (1,'Ali'), (2,'Vali'), (3,'Sobir');
INSERT INTO mijoz_profil VALUES (1, '1995-03-10', 'Dasturchi');
INSERT INTO products VALUES (10,'Daftar',12000), (20,'Ruchka',3000), (30,'Kitob',85000);
INSERT INTO orders VALUES (100,1,'Toshkent'), (101,1,'Toshkent'), (102,2,'Samarqand');
INSERT INTO order_items VALUES
    (10,100,2,12000), (20,100,5,3000), (30,101,1,85000), (10,102,1,11500);
```

`102` buyurtmada daftar 11500 ga sotilgan — `products` dagi joriy narxdan farqli. Natijalar PostgreSQL'dan.

### 1:1 — ikkinchi profil yo'q

```sql
INSERT INTO mijoz_profil VALUES (1, '2000-01-01', 'ikkinchi');
```

```text
ERROR:  duplicate key value violates unique constraint "mijoz_profil_pkey"
DETAIL:  Key (mijoz_id)=(1) already exists.
```

`mijoz_id` ham tashqi kalit, ham birlamchi kalit — shuning uchun har mijozga ko'pi bilan bitta profil.

### 1:N — har mijozning buyurtmalari

```sql
SELECT m.ism, count(o.order_id) AS buyurtmalar
FROM mijozlar m LEFT JOIN orders o ON o.mijoz_id = m.id
GROUP BY m.id, m.ism ORDER BY m.id;
```

```text
  ism  | buyurtmalar 
-------+-------------
 Ali   |           2
 Vali  |           1
 Sobir |           0
(3 rows)
```

### M:N — oraliq jadval orqali ikki tomondan

```sql
-- buyurtma → mahsulotlar
SELECT o.order_id, p.name, oi.quantity, oi.price, oi.quantity * oi.price AS jami
FROM orders o
JOIN order_items oi ON oi.order_id = o.order_id
JOIN products p     ON p.product_no = oi.product_no
ORDER BY o.order_id, p.name;

-- mahsulot → nechta buyurtmada
SELECT p.name, count(oi.order_id) AS necha_buyurtmada
FROM products p LEFT JOIN order_items oi ON oi.product_no = p.product_no
GROUP BY p.product_no, p.name ORDER BY p.product_no;
```

```text
 order_id |  name  | quantity |  price   |   jami   
----------+--------+----------+----------+----------
      100 | Daftar |        2 | 12000.00 | 24000.00
      100 | Ruchka |        5 |  3000.00 | 15000.00
      101 | Kitob  |        1 | 85000.00 | 85000.00
      102 | Daftar |        1 | 11500.00 | 11500.00
(4 rows)

  name  | necha_buyurtmada 
--------+------------------
 Daftar |                2
 Ruchka |                1
 Kitob  |                1
(3 rows)
```

Bitta buyurtmaga bitta mahsulot ikki marta qo'shilmaydi:

```sql
INSERT INTO order_items VALUES (10, 100, 1, 12000);
```

```text
ERROR:  duplicate key value violates unique constraint "order_items_pkey"
DETAIL:  Key (product_no, order_id)=(10, 100) already exists.
```

Miqdorni oshirish — yangi qator emas, `UPDATE … SET quantity = quantity + 1` (yoki upsert, 20-bob).

### `RESTRICT` va `CASCADE` aloqa ma'nosiga qarab

```sql
DELETE FROM products WHERE product_no = 10;    -- buyurtmalarda bor
DELETE FROM orders WHERE order_id = 100;       -- qatorlari bilan
SELECT count(*) AS qolgan_qatorlar FROM order_items;
DELETE FROM mijozlar WHERE id = 3;             -- buyurtmasi yo'q
DELETE FROM mijozlar WHERE id = 2;             -- buyurtmasi bor
```

```text
ERROR:  update or delete on table "products" violates RESTRICT setting of foreign key constraint "order_items_product_no_fkey" on table "order_items"
DETAIL:  Key (product_no)=(10) is referenced from table "order_items".
DELETE 1
 qolgan_qatorlar 
-----------------
               2
(1 row)

DELETE 1
ERROR:  update or delete on table "mijozlar" violates RESTRICT setting of foreign key constraint "orders_mijoz_id_fkey" on table "orders"
DETAIL:  Key (id)=(2) is referenced from table "orders".
```

- Daftar buyurtmalarda bor — o'chirilmadi.
- `100` buyurtma o'chdi va uning ikki qatori ham (4 → 2).
- `Sobir` ning buyurtmasi yo'q — o'chdi; `Vali` niki bor — taqiqlandi.

### Kompozit kalit va `SET NULL (author_id)`

Hujjatdagi ijarachilar misoli:

```sql
CREATE TABLE tenants (tenant_id int PRIMARY KEY);
CREATE TABLE users (
    tenant_id int REFERENCES tenants ON DELETE CASCADE,
    user_id   int NOT NULL,
    PRIMARY KEY (tenant_id, user_id)
);
CREATE TABLE posts (
    tenant_id int REFERENCES tenants ON DELETE CASCADE,
    post_id   int NOT NULL,
    author_id int,
    PRIMARY KEY (tenant_id, post_id),
    FOREIGN KEY (tenant_id, author_id) REFERENCES users ON DELETE SET NULL (author_id)
);
INSERT INTO tenants VALUES (1), (2);
INSERT INTO users VALUES (1,10), (2,10);
INSERT INTO posts VALUES (1,500,10), (2,600,10);

INSERT INTO posts VALUES (1, 501, 99);                 -- 1-ijarachida 99-foydalanuvchi yo'q
DELETE FROM users WHERE tenant_id = 1 AND user_id = 10;
SELECT * FROM posts ORDER BY tenant_id;
```

```text
ERROR:  insert or update on table "posts" violates foreign key constraint "posts_tenant_id_author_id_fkey"
DETAIL:  Key (tenant_id, author_id)=(1, 99) is not present in table "users".
DELETE 1
 tenant_id | post_id | author_id 
-----------+---------+-----------
         1 |     500 |          
         2 |     600 |        10
(2 rows)
```

- Kompozit kalit **juftlikni** tekshiradi: `user_id = 10` boshqa ijarachida bor, lekin `(1, 99)` yo'q.
- `1`-ijarachidagi 10-foydalanuvchi o'chirilganda faqat uning postida `author_id` `NULL` bo'ldi, `tenant_id` saqlandi. `2`-ijarachidagi bir xil raqamli foydalanuvchiga tegilmadi.

### Bola tomondagi indeks

```sql
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'order_items';
```

```text
    indexname     |                                           indexdef                                            
------------------+-----------------------------------------------------------------------------------------------
 order_items_pkey | CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (product_no, order_id)
(1 row)
```

Faqat birlamchi kalit indeksi. `order_id` bo'yicha (buyurtma o'chirilganda `CASCADE` qidiruvi) mos indeks yo'q — katta jadvalda qo'lda qo'shish kerak:

```sql
CREATE INDEX ON order_items (order_id);
```

## Dialektlar

### MySQL

**Asosiy xatti-harakat bir xil:** 1:1 da ikkinchi profil, M:N da takror qator (`Duplicate entry '10-100' for key 'order_items.PRIMARY'`), `RESTRICT` va `CASCADE` — natijalar PostgreSQL bilan bir xil. Xato matnida cheklov to'liq ko'rsatiladi:

```text
ERROR 1451 (23000) at line 22: Cannot delete or update a parent row: a foreign key constraint fails (`qollanma`.`order_items`, CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`product_no`) REFERENCES `products` (`product_no`) ON DELETE RESTRICT)
```

**Bola indeksi avtomatik.** Hujjatga ko'ra MySQL tashqi kalit tekshiruvi jadvalni to'liq o'qimasligi uchun ikkala tomonda indeks talab qiladi. Bola jadvalda tashqi kalit ustunlari **birinchi** turgan indeks bo'lmasa, u avtomatik yaratiladi:

```sql
SHOW INDEX FROM order_items;
```

```text
| Table       | Non_unique | Key_name | Seq_in_index | Column_name | …
| order_items |          0 | PRIMARY  |            1 | product_no  | …
| order_items |          0 | PRIMARY  |            2 | order_id    | …
| order_items |          1 | order_id |            1 | order_id    | …
```

`product_no` uchun alohida indeks kerak bo'lmadi — u `PRIMARY` ning birinchi ustuni. `order_id` uchun esa `order_id` indeksi o'zi qo'shildi. Hujjat ogohlantiradi: bu indeks keyinroq tashqi kalitga yaraydigan boshqa indeks yaratilsa **jimgina o'chirilishi** mumkin.

**Boshqa shartlar** (hujjat):

- ota va bola bir xil storage engine'da bo'lishi kerak, vaqtinchalik (`TEMPORARY`) jadval bo'lmasligi kerak;
- mos ustunlar tiplari o'xshash bo'lishi kerak: `INTEGER`, `DECIMAL` ning o'lchami va ishorasi bir xil; satrlarning uzunligi farq qilishi mumkin, lekin belgilar to'plami va collation bir xil;
- InnoDB'da `NO ACTION` = `RESTRICT` (darhol tekshiriladi; 14-bob).

**`SET NULL (ustunlar)` yo'q:**

```text
ERROR 1064 (42000) at line 31: … near '(author_id))' at line 1
```

Kompozit kalitda faqat bitta ustunni `NULL` qilish kerak bo'lsa — trigger (57-bob) yoki ilova. SQLite'da ham bu sintaksis yo'q (`near "(": syntax error`).

**`SET DEFAULT` — hujjat va amaliyot farqi.** MySQL hujjatiga ko'ra `SET DEFAULT` ni tahlilchi taniydi, lekin **InnoDB va NDB `ON DELETE SET DEFAULT` li jadval ta'riflarini rad etadi**. Sinovda MySQL 9.7.2 boshqacha ishladi: jadval **xatosiz yaratildi** va `SHOW CREATE TABLE` da `ON DELETE SET DEFAULT` ko'rinadi. Lekin ota qator o'chirilganda amal bajarilmadi — o'chirish `RESTRICT` kabi rad etildi:

```sql
CREATE TABLE tenants (tenant_id int PRIMARY KEY);
CREATE TABLE p2 (id int PRIMARY KEY, r int DEFAULT 0,
                 FOREIGN KEY (r) REFERENCES tenants (tenant_id) ON DELETE SET DEFAULT);
INSERT INTO tenants VALUES (0), (5);
INSERT INTO p2 VALUES (1, 5);
DELETE FROM tenants WHERE tenant_id = 5;
```

```text
ERROR 1451 (23000) at line 5: Cannot delete or update a parent row: a foreign key constraint fails (`qollanma`.`p2`, CONSTRAINT `p2_ibfk_1` FOREIGN KEY (`r`) REFERENCES `tenants` (`tenant_id`))
```

Xulosa: MySQL'da `SET DEFAULT` ga tayanmang — u ishlamaydi, xato esa jadval yaratilganda emas, birinchi o'chirishda chiqadi.

**Triggerlar va kaskad.** Hujjatga ko'ra `enable_cascade_triggers = ON` bo'lsa, `ON DELETE CASCADE` bola qatorlar uchun `DELETE` triggerlarini, `SET NULL`/`ON UPDATE CASCADE` esa `UPDATE` triggerlarini ishga tushiradi (57-bob).

### SQLite

**Tashqi kalitlar yoqilgan bo'lsa** (`PRAGMA foreign_keys = ON`, 14-bob) natijalar PostgreSQL bilan bir xil. Xato xabarlari esa umumiy — qaysi kalit va qaysi qiymat ekani aytilmaydi:

```text
Error near line 22: UNIQUE constraint failed: order_items.product_no, order_items.order_id
Error near line 23: FOREIGN KEY constraint failed
Error near line 27: FOREIGN KEY constraint failed
```

**Bola indeksi avtomatik emas.** `order_items` da faqat birlamchi kalit indeksi bor (`sqlite_autoindex_order_items_1`). Hujjat tavsiyasi — bola kalitiga indeks qo'yish.

**Ota kaliti `PRIMARY KEY` yoki `UNIQUE` bo'lishi shart.** Hujjatdagi `child4` misoli: ota ustunda oddiy (unique bo'lmagan) indeks bor — bu xato. Muhim farq — xato **jadval yaratilganda emas**, ma'lumot yozilganda chiqadi. Hujjatga ko'ra bunday "DML xatolari" `foreign key mismatch` deb xabar qilinadi:

```sql
CREATE TABLE p (a PRIMARY KEY, e);
CREATE INDEX pe ON p(e);
CREATE TABLE c4 (l, m REFERENCES p(e));     -- xatosiz
INSERT INTO c4 VALUES (1, 1);
```

```text
Parse error near line 32: foreign key mismatch - "c4" referencing "p"
```

PostgreSQL bunday tashqi kalitni `CREATE TABLE` paytidayoq rad etadi: `there is no unique constraint matching given keys for referenced table "p"`.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Tashqi kalitlar ishlaydi | Doim | InnoDB'da doim | `PRAGMA foreign_keys = ON` dan keyin |
| Bola kaliti indeksi | Qo'lda | **Avtomatik** | Qo'lda |
| Kompozit tashqi kalit | Ha | Ha | Ha |
| `SET NULL (ustunlar)` | Ha (`ON DELETE` da) | Yo'q | Yo'q (sintaksis xatosi) |
| `SET DEFAULT` | Ha | Hujjat: rad etiladi; 9.7.2: yaratiladi, lekin `RESTRICT` kabi | Ha |
| Ota kaliti unique emas | `CREATE` da xato: `there is no unique constraint matching given keys` | Eskirgan kengaytma (sozlama bilan) | Yozishda `foreign key mismatch` |
| Xato xabari | Kalit va qiymat bilan | Cheklov ta'rifi bilan | Umumiy |


## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| M:N ni vergul bilan ajratilgan satr yoki massivda saqlash | Tashqi kalit, `JOIN`, indeks yo'q (36-bob) | Oraliq jadval |
| Oraliq jadvalda kompozit `PRIMARY KEY` yo'q | Bir juftlik ikki marta yoziladi | `PRIMARY KEY (a_id, b_id)` |
| Buyurtma qatorida narxni saqlamaslik (faqat `products.price`) | Narx o'zgarsa eski buyurtmalar summasi o'zgaradi | Aloqa ustuni: sotilgan paytdagi `price` |
| Har yerga `ON DELETE CASCADE` | Mahsulot o'chirilsa buyurtma tarixi yo'qoladi | Qism — `CASCADE`, mustaqil — `RESTRICT` |
| 1:1 da bola kalitida `UNIQUE` yo'q | Aslida 1:N bo'lib qoladi | `UNIQUE` yoki uni `PRIMARY KEY` qilish |
| PostgreSQL/SQLite'da bola kalitiga indeks qo'ymaslik | Ota o'chirishda bola jadval to'liq o'qiladi | `CREATE INDEX ON bola (kalit)` |
| Kompozit PK ning ikkinchi ustuni bo'yicha qidiruv indeksli deb o'ylash | Chap ustun qoidasi (42-bob) | Alohida indeks |
| MySQL'da `ON DELETE SET DEFAULT` | Jadval yaratiladi, lekin o'chirish rad etiladi | `SET NULL`, `RESTRICT` yoki trigger |
| SQLite'da `PRAGMA foreign_keys` ni unutish | Hech narsa tekshirilmaydi | Har ulanishda yoqish |

## Amaliyot

1. `talabalar` va `kurslar` uchun M:N aloqani quring: oraliq jadvalda yozilgan sana va baho bo'lsin. Har kursdagi talabalar sonini va har talabaning o'rtacha bahosini chiqaring.
2. Har aloqa uchun `ON DELETE` ni tanlang va asoslang: kurs o'chirilsa? talaba o'chirilsa?
3. `xodimlar` uchun 1:1 `xodim_pasport` jadvalini yarating. Ikki xil yo'l bilan: (a) `pasport.xodim_id` — `PRIMARY KEY`; (b) alohida `id` + `xodim_id UNIQUE`. Farqini tushuntiring.
4. PostgreSQL'da `order_items` ga 100 000 qator yozing va `DELETE FROM orders WHERE order_id = …` ni `EXPLAIN ANALYZE` bilan (45-bob) `order_id` indeksi bilan va usiz solishtiring.
5. MySQL'da `order_items` uchun avtomatik yaratilgan indeksni ko'ring, keyin `CREATE INDEX x ON order_items (order_id, quantity)` yarating va `SHOW INDEX` ni qayta bajaring. Avtomatik indeks qoldimi?

## Rasmiy hujjat

- PostgreSQL — 3.3. Foreign Keys (tutorial): <https://www.postgresql.org/docs/18/tutorial-fk.html>
- PostgreSQL — 5.5.5. Foreign Keys (`order_items`, `SET NULL (ustunlar)`): <https://www.postgresql.org/docs/18/ddl-constraints.html#DDL-CONSTRAINTS-FK>
- MySQL — 15.1.25.5 FOREIGN KEY Constraints: <https://dev.mysql.com/doc/refman/9.7/en/create-table-foreign-keys.html>
- SQLite — SQLite Foreign Key Support (Required and Suggested Database Indexes): <https://www.sqlite.org/foreignkeys.html>
