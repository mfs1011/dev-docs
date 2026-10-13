# 42 — Ko'p ustunli indeks

[← Oldingi: Indeks qanday ishlaydi](41-indeks-qanday-ishlaydi.md) · [Mundarija](README.md) · [Keyingi: Maxsus indekslar →](43-maxsus-indekslar.md)

## Tushuncha

**Ko'p ustunli** (composite, multicolumn) indeks — bir nechta ustunga birgalikda qurilgan indeks:

```sql
CREATE INDEX test2_mm_idx ON test2 (major, minor);
```

PostgreSQL hujjatidagi misol: `WHERE major = … AND minor = …` ko'p ishlatilsa, ikkala ustunga bitta indeks mos. Chegaralar: PostgreSQL'da 32 tagacha ustun (`INCLUDE` bilan birga), MySQL'da 16 tagacha.

### Tartiblangan massiv

MySQL hujjatining tasviri: ko'p ustunli indeks — qatorlari indekslangan ustunlar qiymatlarini **ketma-ket ulash** natijasidan iborat **tartiblangan massiv**. Ya'ni `(familiya, ism)` indeksi avval familiya bo'yicha, familiya teng bo'lganlarda — ism bo'yicha tartiblangan. Telefon kitobiga o'xshaydi: "Karimov" ni tez topasiz, "Karimov Ali" ni ham. Lekin hamma "Ali" larni topish uchun butun kitobni varaqlash kerak.

### Chap ustunlar qoidasi

MySQL hujjatiga ko'ra ko'p ustunli indeks so'rovda **chapdan boshlangan qismi** (leftmost prefix) ishlatilganda qo'llanadi. `(col1, col2, col3)` indeksi:

- `(col1)`, `(col1, col2)`, `(col1, col2, col3)` bo'yicha qidiruvga yaraydi;
- `col2` yoki `col3` ning o'zi bo'yicha — **yo'q** (skip scan'dan tashqari, quyida).

Hujjatdagi misol — `INDEX name (last_name, first_name)`:

| So'rov | Indeks ishlatiladimi |
| --- | --- |
| `WHERE last_name = 'Jones'` | Ha |
| `WHERE last_name = 'Jones' AND first_name = 'John'` | Ha |
| `WHERE last_name = 'Jones' AND first_name >= 'M' AND first_name < 'N'` | Ha |
| `WHERE first_name = 'John'` | **Yo'q** |
| `WHERE last_name = 'Jones' OR first_name = 'John'` | **Yo'q** |

PostgreSQL hujjati qoidani aniqroq aytadi: **chapdagi ustunlardagi tenglik shartlari** va **tenglik sharti bo'lmagan birinchi ustundagi tengsizlik sharti** indeksning qaysi qismini o'qishni cheklaydi. Ulardan o'ngdagi ustunlar shartlari indeks ichida tekshiriladi (jadvalga ortiqcha murojaatlarni tejaydi), lekin o'qiladigan qismni **kamaytirishi shart emas**.

Misol: `(a, b, c)` indeksi va `WHERE a = 5 AND b >= 42 AND c < 77` — indeks `a = 5, b = 42` dan `a = 5` ning oxirigacha o'qiladi; `c < 77` faqat filtr.

**Amaliy xulosa:** tenglik bilan qidiriladigan ustunlarni chapga, oraliq bilan qidiriladiganini ulardan keyin qo'ying.

### Skip scan

Chap ustun so'rovda yo'q bo'lsa ham, ba'zan indeksdan foydalanish mumkin. Uchala tizimda bu **skip scan** deyiladi va g'oya bir xil. SQLite hujjati uni aniq tushuntiradi (`people (role, height)` indeksi, `WHERE height >= 180`):

- indeksdan birinchi `role` qiymatini oladi;
- `WHERE role = $role AND height >= 180` ni bajaradi — endi chap ustunda tenglik bor;
- keyingi `role` ga **sakraydi** va takrorlaydi.

Qachon foydali: **chap ustunda turli qiymatlar kam** bo'lganda. PostgreSQL hujjati: `x` ning turli qiymatlari shunchalik kamki, skanerlash indeksning ko'p qismini o'tkazib yuboradi. Qiymatlar ko'p bo'lsa — baribir butun indeks o'qiladi va rejalashtiruvchi odatda jadvalni ketma-ket o'qishni afzal ko'radi.

| | Skip scan | Shartlar (hujjat) |
| --- | --- | --- |
| PostgreSQL 18 | B-tree'da | Rejalashtiruvchi chap ustunda turli qiymatlar kam deb kutganda |
| MySQL | "Skip Scan Range Access Method" | Bitta jadval; `GROUP BY`/`DISTINCT` yo'q; so'rov **faqat indeksdagi ustunlarni** ishlatadi; o'ngdagi ustunda oraliq sharti |
| SQLite | Ha | Faqat **`ANALYZE`** dan keyin, chap ustunda bir qiymatga ~**18** va undan ko'p takror bo'lsa |

### Indeks va `ORDER BY`

PostgreSQL hujjatiga ko'ra indeks qatorlarni **tartiblangan** holda bera oladi — `ORDER BY` alohida saralashsiz bajariladi. Buni faqat B-tree qiladi. Ayniqsa muhim holat — **`ORDER BY … LIMIT n`**: saralash uchun barcha qatorlarni ko'rish kerak, mos indeks bo'lsa esa birinchi `n` tasi to'g'ridan-to'g'ri olinadi. Ko'p qator kerak bo'lsa — aksincha, ketma-ket o'qish va saralash tezroq.

Yo'nalish:

- B-tree sukut bo'yicha **o'sish** tartibida saqlanadi (`NULL` lar oxirida). Uni **teskari** o'qish ham mumkin — shuning uchun `(x)` indeksi `ORDER BY x` ga ham, `ORDER BY x DESC` ga ham yaraydi;
- ko'p ustunli indeksda `(x, y)` — `ORDER BY x, y` (oldinga) va `ORDER BY x DESC, y DESC` (orqaga) ga yaraydi, lekin **`ORDER BY x, y DESC` ga yo'q**. Hujjatga ko'ra buning uchun indeks yo'nalishi bilan yaratiladi: `(x ASC, y DESC)` — **descending indeks**.

### Indekslarni birlashtirish

Bitta indeks skanerlashi faqat `AND` bilan bog'langan shartlarni ishlata oladi. PostgreSQL hujjati: `(a, b)` indeksi `WHERE a = 5 AND b = 6` ga yaraydi, `WHERE a = 5 OR b = 6` ga to'g'ridan-to'g'ri — yo'q.

Lekin PostgreSQL bir nechta indeksni (yoki bitta indeksni bir necha marta) **birlashtira** oladi:

- har indeks skanerlanadi va mos qatorlar joylashuvining **bitmap**'i (bit xaritasi) xotirada tuziladi;
- bitmaplar `AND`/`OR` qilinadi;
- jadval qatorlari **fizik tartibda** o'qiladi — shuning uchun asl indeks tartibi yo'qoladi va `ORDER BY` uchun alohida saralash kerak.

Hujjatning tanlov bo'yicha maslahati: ba'zan ko'p ustunli indeks yaxshi, ba'zan alohida indekslar va ularni birlashtirish. Har qo'shimcha indeks skanerlashi vaqt qo'shadi, shuning uchun rejalashtiruvchi ba'zan mavjud indekslardan faqat bittasini tanlaydi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. 200 000 qator: `rol` — faqat 2 xil qiymat (SQLite hujjatidagi `people` misoli kabi), `bolim` — 200 xil, `boy` — 50 xil, `familiya` — 5000 xil.

```sql
CREATE TABLE xodimlar (id int PRIMARY KEY, rol text NOT NULL, bolim int NOT NULL, boy int NOT NULL, familiya text NOT NULL);
INSERT INTO xodimlar
SELECT g, CASE WHEN g % 3 = 0 THEN 'oqituvchi' ELSE 'talaba' END,
       g % 200, 150 + (g * 7) % 50, 'F' || (g % 5000)
FROM generate_series(1, 200000) g;
CREATE INDEX x_rol_boy   ON xodimlar (rol, boy);
CREATE INDEX x_bolim_fam ON xodimlar (bolim, familiya);
ANALYZE xodimlar;
```

Natijalar PostgreSQL'dan.

### Chap ustunlar qoidasi

```sql
EXPLAIN (COSTS OFF) SELECT count(*) FROM xodimlar WHERE rol = 'talaba' AND boy = 180;
EXPLAIN (COSTS OFF) SELECT count(*) FROM xodimlar WHERE rol = 'talaba';
```

```text
 Aggregate
   ->  Bitmap Heap Scan on xodimlar
         Recheck Cond: ((rol = 'talaba'::text) AND (boy = 180))
         ->  Bitmap Index Scan on x_rol_boy
               Index Cond: ((rol = 'talaba'::text) AND (boy = 180))

 Finalize Aggregate
   ->  Gather
         Workers Planned: 1
         ->  Partial Aggregate
               ->  Parallel Seq Scan on xodimlar
                     Filter: (rol = 'talaba'::text)
```

- Ikkala ustun — indeks.
- Faqat `rol = 'talaba'` — chap ustun, indeksga yaraydi, lekin bu qatorlarning **2/3 qismi**. Rejalashtiruvchi to'liq skanerlashni tanladi (41-bob).

### Skip scan: chap ustunsiz

```sql
EXPLAIN (ANALYZE, COSTS OFF, TIMING OFF, SUMMARY OFF)
SELECT count(*) FROM xodimlar WHERE boy = 180;
```

```text
 Aggregate (actual rows=1.00 loops=1)
   Buffers: shared hit=1478 read=13
   ->  Bitmap Heap Scan on xodimlar (actual rows=4000.00 loops=1)
         Recheck Cond: (boy = 180)
         Heap Blocks: exact=1469
         Buffers: shared hit=1478 read=13
         ->  Bitmap Index Scan on x_rol_boy (actual rows=4000.00 loops=1)
               Index Cond: (boy = 180)
               Index Searches: 5
               Buffers: shared hit=9 read=13
```

So'rovda `rol` yo'q, lekin `x_rol_boy` ishlatildi: `Index Cond: (boy = 180)` va **`Index Searches: 5`** — bitta emas, bir nechta qidiruv. Bu PostgreSQL 18 skip scan'i: `rol` ning har qiymati uchun alohida qidiruv. Indeksdan atigi 22 sahifa o'qildi.

Ikkinchi indeks `(bolim, familiya)` da ham xuddi shunday: `WHERE familiya = 'F77'` uchun `Index Scan using x_bolim_fam` tanlandi (`bolim` — 200 xil qiymat).

### `ORDER BY` va `LIMIT`

```sql
EXPLAIN (COSTS OFF) SELECT * FROM xodimlar WHERE bolim = 5 ORDER BY familiya LIMIT 5;
EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim DESC, familiya DESC LIMIT 5;
```

```text
 Limit
   ->  Index Scan using x_bolim_fam on xodimlar
         Index Cond: (bolim = 5)

 Limit
   ->  Index Scan Backward using x_bolim_fam on xodimlar
```

- `bolim = 5` (tenglik) + `ORDER BY familiya` — indeks ichida `familiya` allaqachon tartiblangan, saralash yo'q.
- `DESC, DESC` — o'sha indeks **teskari** o'qildi (`Index Scan Backward`).

### Aralash yo'nalish va descending indeks

```sql
EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim, familiya DESC LIMIT 5;
```

```text
 Limit
   ->  Incremental Sort
         Sort Key: bolim, familiya DESC
         Presorted Key: bolim
         ->  Index Scan using x_bolim_fam on xodimlar
```

`(bolim, familiya)` indeksi `bolim ASC, familiya DESC` ni to'liq bera olmaydi — `bolim` bo'yicha tartib indeksdan olindi, `familiya DESC` uchun qo'shimcha saralash (`Incremental Sort`) qo'shildi. Hujjatdagi yechim:

```sql
CREATE INDEX x_bolim_fam_desc ON xodimlar (bolim, familiya DESC);
EXPLAIN (COSTS OFF) SELECT * FROM xodimlar ORDER BY bolim, familiya DESC LIMIT 5;
```

```text
 Limit
   ->  Index Scan using x_bolim_fam_desc on xodimlar
```

Saralash yo'qoldi.

### `OR` va indekslarni birlashtirish

```sql
CREATE INDEX x_boy ON xodimlar (boy);
EXPLAIN (COSTS OFF) SELECT * FROM xodimlar WHERE bolim = 5 OR boy = 199;
```

```text
 Bitmap Heap Scan on xodimlar
   Recheck Cond: ((bolim = 5) OR (boy = 199))
   ->  BitmapOr
         ->  Bitmap Index Scan on x_bolim_fam
               Index Cond: (bolim = 5)
         ->  Bitmap Index Scan on x_boy
               Index Cond: (boy = 199)
```

Ikki indeks alohida skanerlandi, bitmaplar `BitmapOr` bilan birlashtirildi, keyin jadval o'qildi — hujjatdagi mexanizm aynan shu.

## Dialektlar

### MySQL

**Chap ustun** — bir xil: `rol = 'talaba' AND boy = 180` uchun `Covering index lookup on xodimlar using x_rol_boy`. `count(*)` uchun jadval kerak emas — indeks qoplovchi.

**Skip scan** — `EXPLAIN FORMAT=TREE` da aniq yoziladi:

```sql
EXPLAIN FORMAT=TREE SELECT count(*) FROM xodimlar WHERE boy = 180;
EXPLAIN SELECT rol, boy FROM xodimlar WHERE boy > 198;
```

```text
-> Aggregate: count(0)  (cost=9719 rows=1)
    -> Filter: (xodimlar.boy = 180)  (cost=5118 rows=19967)
        -> Covering index skip scan on xodimlar using x_rol_boy over boy = 180  (cost=5118 rows=19967)

-> Filter: (xodimlar.boy > 198)  (cost=17048 rows=66552)
    -> Covering index skip scan on xodimlar using x_rol_boy over 198 < boy  (cost=17048 rows=66552)
```

Ikkalasida ham so'rov faqat indeks ustunlarini (`rol`, `boy`) ishlatadi — hujjatdagi shartlardan biri. (Ikkinchi so'rov `EXPLAIN` sukut formatida berildi, lekin MySQL 9.7 uni daraxt ko'rinishida chiqardi.)

**`ORDER BY`** — `ORDER BY bolim DESC, familiya DESC LIMIT 5` uchun `Index scan … (reverse)`. Aralash yo'nalishda (`bolim, familiya DESC`) indekssiz — **butun jadval** o'qilib saraladi:

```text
-> Limit: 5 row(s)  (cost=20120 rows=5)
    -> Sort: xodimlar.bolim, xodimlar.familiya DESC, limit input to 5 row(s) per chunk  (cost=20120 rows=199677)
        -> Table scan on xodimlar  (cost=20120 rows=199677)
```

PostgreSQL bu yerda indeksdan foydalanib faqat qo'shimcha saralash qildi (`Incremental Sort`). MySQL esa jadvalni to'liq skanerladi. Descending indeks `(bolim, familiya DESC)` dan keyin — `Index scan on xodimlar using x_bolim_fam_desc`, saralash yo'q.

**`OR` — index merge.** MySQL ham ikki indeksni birlashtirdi, boshqa nom bilan:

```text
-> Filter: ((xodimlar.bolim = 5) or (xodimlar.boy = 199))  (cost=6967 rows=5000)
    -> Sort-deduplicate by row ID  (cost=6967 rows=5000)
        -> Index range scan on xodimlar using x_bolim_fam over (bolim = 5)  (cost=107 rows=1000)
        -> Index range scan on xodimlar using x_boy over (boy = 199)  (cost=405 rows=4000)
```

**Hujjatdagi muqobil:** juda "keng" (ko'p ustunli) indeks o'rniga boshqa ustunlardan hosil qilingan qisqa **hash ustuni** va unga indeks: `WHERE hash_col = MD5(CONCAT(val1, val2)) AND col1 = val1 AND col2 = val2`.

### SQLite

**Chap ustun** — `SEARCH xodimlar USING COVERING INDEX x_rol_boy (rol=? AND boy=?)`.

**Skip scan faqat `ANALYZE` dan keyin** — hujjatdagi qoida sinovda aniq ko'rindi:

```sql
EXPLAIN QUERY PLAN SELECT count(*) FROM xodimlar WHERE boy = 180;   -- ANALYZE dan oldin
ANALYZE;
EXPLAIN QUERY PLAN SELECT count(*) FROM xodimlar WHERE boy = 180;   -- keyin
```

```text
`--SCAN xodimlar USING COVERING INDEX x_rol_boy
`--SEARCH xodimlar USING COVERING INDEX x_rol_boy (ANY(rol) AND boy=?)
```

- Oldin: `SCAN … USING COVERING INDEX` — butun indeks o'qildi (jadvaldan kichikroq, lekin baribir hammasi).
- Keyin: `SEARCH … (ANY(rol) AND boy=?)` — `ANY(rol)` skip scan'ni bildiradi. Hujjatga ko'ra statistikasiz SQLite chap ustunda o'rtacha 10 ta takror deb taxmin qiladi, skip scan esa ~18 dan boshlab foydali.

**`ORDER BY`:** `bolim = 5 ORDER BY familiya` — `SEARCH … USING INDEX x_bolim_fam (bolim=?)`, saralashsiz; `DESC, DESC` — `SCAN xodimlar USING INDEX x_bolim_fam`. Aralash yo'nalish — `SCAN xodimlar` va `USE TEMP B-TREE FOR ORDER BY` (MySQL kabi to'liq skanerlash va saralash).

**`OR`** — `MULTI-INDEX OR`:

```text
`--MULTI-INDEX OR
   |--INDEX 1
   |  `--SEARCH xodimlar USING INDEX x_bolim_fam (bolim=?)
   `--INDEX 2
      `--SEARCH xodimlar USING INDEX x_boy (boy=?)
```

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Ustunlar soni chegarasi | 32 | 16 | — |
| Chap ustunlar qoidasi | Ha | Ha | Ha |
| Skip scan | Ha (18), `Index Searches: N` | `index skip scan` (faqat indeks ustunlari) | `ANY(ustun)`, faqat `ANALYZE` dan keyin |
| Indeksni teskari o'qish | `Index Scan Backward` | `(reverse)` | Ha |
| Aralash yo'nalish, mos indeks yo'q | Indeks + `Incremental Sort` | To'liq skanerlash + saralash | To'liq skanerlash + saralash |
| Descending indeks | Ha | Ha | — |
| `OR` uchun indekslarni birlashtirish | `BitmapOr` | Index merge (`Sort-deduplicate`) | `MULTI-INDEX OR` |

`—` — bu bobda sinalmagan.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ustunlar tartibini o'ylamasdan indeks yaratish | Ko'p so'rovlar indeksdan foydalana olmaydi | Tenglik ustunlari chapda, oraliq — keyin |
| `(a, b)` va `(a)` ikkalasini saqlash | `(a)` ortiqcha: `(a, b)` chap qismi uni almashtiradi | Ortiqchasini o'chirish |
| Skip scan'ga tayanish | Chap ustunda qiymatlar ko'p bo'lsa ishlamaydi; SQLite'da `ANALYZE` siz yo'q | Kerakli so'rov uchun to'g'ri tartibdagi indeks |
| `ORDER BY a, b DESC` uchun oddiy `(a, b)` | Qo'shimcha saralash yoki to'liq skanerlash | `(a, b DESC)` |
| Har ustun kombinatsiyasiga ko'p ustunli indeks | Joy va yozish narxi | Alohida indekslar + birlashtirish ham variant (hujjat) |
| `WHERE a = 1 OR b = 2` uchun `(a, b)` indeksi | Bitta indeks `OR` ga yaramaydi | `a` va `b` ga alohida indeks |
| Indeksning o'ngdagi ustuni shartini "tezlashtiradi" deb o'ylash | Faqat filtr, o'qiladigan qismni kamaytirmaydi | Hujjatdagi qoida: tenglik + birinchi tengsizlik |

## Amaliyot

1. `xodimlar (bolim, familiya)` indeksi uchun quyidagilardan qaysilari indeks bilan qidiriladi, qaysilari yo'q — avval taxmin qiling, keyin `EXPLAIN` bilan tekshiring: `bolim = 5`; `familiya = 'F7'`; `bolim > 190`; `bolim = 5 AND familiya LIKE 'F1%'`; `bolim > 190 AND familiya = 'F7'`.
2. MySQL'da `SELECT * FROM xodimlar WHERE boy = 180` (barcha ustunlar) — skip scan ishlatiladimi? Hujjatdagi shartlar bilan tushuntiring.
3. SQLite'da `rol` ga 2 emas, 100 000 xil qiymat yozing va `ANALYZE` dan keyin `WHERE boy = 180` rejasini ko'ring.
4. `ORDER BY boy DESC, id` va `ORDER BY boy DESC, id DESC` uchun qanday indeks kerak? PostgreSQL va MySQL'da sinang.
5. PostgreSQL'da `WHERE bolim = 5 AND boy = 199` uchun ikkita alohida indeks (`x_bolim_fam`, `x_boy`) bilan reja qanday? `BitmapAnd` paydo bo'ldimi?

## Rasmiy hujjat

- PostgreSQL — 11.3. Multicolumn Indexes (skip scan): <https://www.postgresql.org/docs/18/indexes-multicolumn.html>
- PostgreSQL — 11.4. Indexes and ORDER BY: <https://www.postgresql.org/docs/18/indexes-ordering.html>
- PostgreSQL — 11.5. Combining Multiple Indexes: <https://www.postgresql.org/docs/18/indexes-bitmap-scans.html>
- MySQL — 10.3.6 Multiple-Column Indexes: <https://dev.mysql.com/doc/refman/9.7/en/multiple-column-indexes.html>
- MySQL — 10.2.1.2 Range Optimization (Skip Scan Range Access Method): <https://dev.mysql.com/doc/refman/9.7/en/range-optimization.html>
- SQLite — The SQLite Query Optimizer Overview (The Skip-Scan Optimization): <https://www.sqlite.org/optoverview.html>
