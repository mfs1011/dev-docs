# 35 — JSON

[← Oldingi: Sana funksiyalari](34-sana-funksiyalari.md) · [Mundarija](README.md) · [Keyingi: Massiv, range, domain va composite →](36-massiv-range-domain-composite.md)

## Tushuncha

**JSON** (JavaScript Object Notation) — matnli ma'lumot formati: obyektlar `{"kalit": qiymat}`, massivlar `[…]`, satrlar, sonlar, `true/false`, `null`. Uchala tizim JSON'ni saqlay oladi va uning ichidan qiymat ajrata oladi, lekin buni turlicha qiladi.

### PostgreSQL: `json` va `jsonb`

PostgreSQL hujjatiga ko'ra JSON'ni oddiy `text` da ham saqlash mumkin. JSON tiplarining afzalligi — har qiymat JSON qoidalariga mosligi **tekshiriladi**, va maxsus funksiya/operatorlar bor. Ikki tip:

| | `json` | `jsonb` |
| --- | --- | --- |
| Saqlash | Kiritilgan matnning **aniq nusxasi** | Ajratilgan **ikkilik** (binary) shakl |
| Har o'qishda | Qayta tahlil qilinadi | Tahlil qilinmaydi — tezroq |
| Yozish | Tezroq | Biroz sekinroq (o'girish) |
| Bo'shliqlar, kalitlar tartibi | Saqlanadi | Saqlanmaydi |
| Takror kalitlar | Hammasi saqlanadi (funksiyalar oxirgisini oladi) | Faqat **oxirgisi** qoladi |
| Indeks | Yo'q | GIN |

Hujjat tavsiyasi: ko'pchilik ilovalar **`jsonb`** ni tanlashi kerak — kalitlar tartibiga oid eski talablar kabi maxsus ehtiyoj bo'lmasa.

### JSON hujjatni loyihalash

PostgreSQL hujjatida alohida bo'lim bor ("Designing JSON Documents"). Asosiy fikrlar:

- JSON relyatsion modeldan moslashuvchanroq; ikkalasi bir ilovada birga yashashi mumkin;
- moslashuvchanlik kerak bo'lsa ham, hujjatlarning tuzilishi **taxminan bir xil** bo'lgani ma'qul — so'rov yozish osonlashadi;
- JSON boshqa tiplar kabi parallellik qoidalariga bo'ysunadi: har yangilash **butun qatorni** qulflaydi (53-bob). Shuning uchun hujjatlarni boshqariladigan o'lchamda saqlang;
- ideal holatda bitta JSON hujjat — biznes qoidalari bo'yicha mustaqil o'zgartiriladigan kichik qismlarga bo'linmaydigan bitta "atom" ma'lumot.

Amaliy xulosa: tez-tez qidiriladigan, filtrlanadigan, `JOIN` qilinadigan yoki cheklov (14-bob) kerak bo'lgan maydonlar — oddiy ustun. Tuzilishi o'zgaruvchan, kam so'raladigan "qo'shimcha" ma'lumot — JSON.

### Operatorlar va funksiyalar

PostgreSQL hujjatidagi asosiy operatorlar:

| Operator | Natija |
| --- | --- |
| `j -> 'kalit'`, `j -> 0` | Maydon yoki massiv elementi, **JSON** sifatida |
| `j ->> 'kalit'` | Maydon, **matn** sifatida |
| `j #> '{a,b,0}'`, `j #>> '{…}'` | Yo'l bo'yicha (JSON / matn) |
| `j @> '{"a": 1}'` | `j` ikkinchisini **o'z ichiga oladimi** (containment, faqat `jsonb`) |
| `j ? 'kalit'` | Yuqori darajada shunday kalit yoki massiv elementi bormi (`jsonb`) |
| `j \|\| j2` | Ikki `jsonb` ni birlashtirish (takror kalitda ikkinchisi g'olib) |

Massiv indekslari **0 dan** boshlanadi (SQL massivlaridan farqli).

Bundan tashqari standart **SQL/JSON** funksiyalari: `JSON_VALUE` (bitta skalyar qiymat), `JSON_QUERY` (JSON qism), `JSON_EXISTS` (yo'l bo'yicha element bormi) va **`JSON_TABLE`** — hujjatga ko'ra JSON'ni oddiy jadval kabi so'raladigan relyatsion ko'rinishga aylantiradi. Yo'llar **jsonpath** tilida yoziladi: `$.mahsulotlar[0].narx`, `$.mahsulotlar[*] ? (@.narx > 50000)`.

### Containment (`@>`)

Hujjatga ko'ra `@>` bir `jsonb` hujjat ikkinchisini o'z ichiga olishini tekshiradi. Qoida: ichidagi hujjat **tuzilish va ma'lumot** bo'yicha mos bo'lishi kerak. Massivda elementlar tartibi va takrorlar ahamiyatsiz: `[1,2,3] @> [3,1]` — rost. Lekin ichma-ich darajalar mos bo'lishi shart: `{"foo": {"bar": "baz"}} @> {"bar": "baz"}` — yolg'on.

### Indeks: GIN

PostgreSQL hujjatiga ko'ra GIN indeksi ko'p `jsonb` hujjatlar ichidan kalit yoki kalit-qiymat juftlarini samarali qidiradi. Ikki operator klassi:

- sukut bo'yicha — `?`, `?|`, `?&`, `@>`, `@?`, `@@` operatorlarini qo'llab-quvvatlaydi;
- `jsonb_path_ops` — kalit mavjudligini (`?`) qo'llamaydi, lekin `@>`, `@?`, `@@` ni qo'llaydi.

Muhim nozik joy: indeks faqat **indekslangan ifodaga to'g'ridan-to'g'ri** qo'llangan operator bilan ishlaydi. `hujjat @> '{…}'` GIN'dan foydalanadi, `hujjat ->> 'shahar' = '…'` esa yo'q — buning uchun alohida ifoda indeksi kerak (43-bob).

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Ustun tipi: PG — `jsonb`, MySQL — `JSON`, SQLite — `text`.

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, hujjat jsonb);
INSERT INTO buyurtmalar VALUES
(1, '{"mijoz": "Ali", "shahar": "Toshkent", "teglar": ["tez", "sovga"],
      "mahsulotlar": [{"nom": "Daftar", "soni": 2, "narx": 12000},
                      {"nom": "Ruchka", "soni": 5, "narx": 3000}]}'),
(2, '{"mijoz": "Vali", "shahar": "Samarqand", "teglar": ["tez"],
      "mahsulotlar": [{"nom": "Kitob", "soni": 1, "narx": 85000}]}'),
(3, '{"mijoz": "Sobir", "shahar": "Toshkent", "mahsulotlar": []}');
```

Natijalar PostgreSQL'dan.

### `json` va `jsonb`

```sql
SELECT '{"b": 1,   "a": 2, "b": 3}'::json  AS json_turi,
       '{"b": 1,   "a": 2, "b": 3}'::jsonb AS jsonb_turi;
```

```text
         json_turi          |    jsonb_turi    
----------------------------+------------------
 {"b": 1,   "a": 2, "b": 3} | {"a": 2, "b": 3}
(1 row)
```

`json` — matn aynan saqlandi (bo'shliqlar, ikki `"b"`). `jsonb` — oxirgi `"b"` qoldi, bo'shliqlar va tartib o'zgardi.

### Qiymat ajratish: `->`, `->>`, `#>>`

```sql
SELECT id, hujjat -> 'mijoz' AS json_qiymat, hujjat ->> 'mijoz' AS matn,
       hujjat #>> '{mahsulotlar,0,nom}' AS birinchi
FROM buyurtmalar ORDER BY id;
```

```text
 id | json_qiymat | matn  | birinchi 
----+-------------+-------+----------
  1 | "Ali"       | Ali   | Daftar
  2 | "Vali"      | Vali  | Kitob
  3 | "Sobir"     | Sobir | 
(3 rows)
```

`->` — JSON (qo'shtirnoq bilan), `->>` — matn. Taqqoslash va ko'rsatish uchun odatda `->>`. Yo'q element — `NULL` (3-qatorda mahsulot yo'q).

### Filtrlash: `@>` va `?`

```sql
SELECT id, hujjat ->> 'mijoz' AS mijoz FROM buyurtmalar
WHERE hujjat @> '{"shahar": "Toshkent"}' ORDER BY id;

SELECT id FROM buyurtmalar WHERE hujjat -> 'teglar' ? 'sovga';
SELECT id FROM buyurtmalar WHERE hujjat ? 'teglar' ORDER BY id;
```

```text
 id | mijoz 
----+-------
  1 | Ali
  3 | Sobir
(2 rows)

 id 
----
  1
(1 row)

 id 
----
  1
  2
(2 rows)
```

### SQL/JSON: `JSON_VALUE`, `JSON_EXISTS`

```sql
SELECT id,
       JSON_VALUE(hujjat, '$.mahsulotlar[0].narx' RETURNING int) AS narx,
       JSON_EXISTS(hujjat, '$.mahsulotlar[*] ? (@.narx > 50000)') AS qimmat_bor
FROM buyurtmalar ORDER BY id;
```

```text
 id | narx  | qimmat_bor 
----+-------+------------
  1 | 12000 | f
  2 | 85000 | t
  3 |       | f
(3 rows)
```

`RETURNING int` — natija darhol son, `::int` shart emas. `? (@.narx > 50000)` — jsonpath filtri: `@` — joriy element.

### `JSON_TABLE`: massivni qatorlarga

```sql
SELECT b.id, jt.*
FROM buyurtmalar b,
     JSON_TABLE(b.hujjat, '$.mahsulotlar[*]'
                COLUMNS (nom text PATH '$.nom', soni int PATH '$.soni', narx int PATH '$.narx')) AS jt
ORDER BY b.id, jt.nom;
```

```text
 id |  nom   | soni | narx  
----+--------+------+-------
  1 | Daftar |    2 | 12000
  1 | Ruchka |    5 |  3000
  2 | Kitob  |    1 | 85000
(3 rows)
```

Har mahsulot — alohida qator, ustunlar — oddiy SQL tiplari. Endi ular ustida `GROUP BY`, `JOIN`, `WHERE` ishlaydi.

Eski usul — `jsonb_array_elements` (jadval funksiyasi, 25-bobdagi `LATERAL`):

```sql
SELECT b.id, sum((m ->> 'soni')::int * (m ->> 'narx')::int) AS jami
FROM buyurtmalar b
LEFT JOIN LATERAL jsonb_array_elements(b.hujjat -> 'mahsulotlar') AS m ON true
GROUP BY b.id ORDER BY b.id;
```

```text
 id | jami  
----+-------
  1 | 39000
  2 | 85000
  3 |      
(3 rows)
```

### O'zgartirish: `jsonb_set` va `||`

```sql
UPDATE buyurtmalar SET hujjat = jsonb_set(hujjat, '{shahar}', '"Buxoro"') WHERE id = 3;
UPDATE buyurtmalar SET hujjat = hujjat || '{"tolangan": true}' WHERE id = 3;
SELECT hujjat FROM buyurtmalar WHERE id = 3;
```

```text
                                   hujjat                                    
-----------------------------------------------------------------------------
 {"mijoz": "Sobir", "shahar": "Buxoro", "tolangan": true, "mahsulotlar": []}
(1 row)
```

`jsonb_set` ning yangi qiymati ham JSON bo'lishi kerak — satr uchun ichki qo'shtirnoq: `'"Buxoro"'`.

### Noto'g'ri JSON

```sql
INSERT INTO buyurtmalar VALUES (4, '{"mijoz": "Jasur",}');
```

```text
ERROR:  invalid input syntax for type json
DETAIL:  Expected string, but found "}".
CONTEXT:  JSON data, line 1: {"mijoz": "Jasur",}
```

### GIN indeks

```sql
CREATE INDEX buyurtmalar_gin ON buyurtmalar USING GIN (hujjat);
SET enable_seqscan = off;   -- faqat namoyish uchun: jadval kichik

EXPLAIN (COSTS OFF) SELECT id FROM buyurtmalar WHERE hujjat @> '{"shahar": "Toshkent"}';
EXPLAIN (COSTS OFF) SELECT id FROM buyurtmalar WHERE hujjat ->> 'shahar' = 'Toshkent';
```

```text
                           QUERY PLAN                            
-----------------------------------------------------------------
 Bitmap Heap Scan on buyurtmalar
   Recheck Cond: (hujjat @> '{"shahar": "Toshkent"}'::jsonb)
   ->  Bitmap Index Scan on buyurtmalar_gin
         Index Cond: (hujjat @> '{"shahar": "Toshkent"}'::jsonb)
(4 rows)

                         QUERY PLAN                         
------------------------------------------------------------
 Seq Scan on buyurtmalar
   Disabled: true
   Filter: ((hujjat ->> 'shahar'::text) = 'Toshkent'::text)
(3 rows)
```

Mazmunan bir xil ikki shart: `@>` GIN'dan foydalandi, `->> … =` — yo'q (ketma-ket o'qishga majbur, hatto o'chirilgan bo'lsa ham: `Disabled: true`). `EXPLAIN` ni o'qish — 45-bob.

## Dialektlar

### MySQL

**`JSON` tipi.** MySQL hujjatiga ko'ra RFC 8259 bo'yicha mahalliy `JSON` tipi bor: hujjatlar avtomatik **tekshiriladi** va ichki ikkilik formatda saqlanadi — o'qishda qayta tahlil kerak emas. Bu PostgreSQL `jsonb` ga yaqin. Alohida "aniq nusxa" tipi (`json` kabi) yo'q.

**Normallashtirish.** Hujjatga ko'ra JSON tahlil qilinganda normallashtiriladi: takror kalitlardan oxirgisi qoladi — `jsonb` kabi:

```text
+------------------+
| j                |
+------------------+
| {"a": 2, "b": 3} |
+------------------+
```

**Operatorlar — yo'l bilan.** `->` (= `JSON_EXTRACT`) va `->>` (qo'shtirnoqsiz). O'ng tomon — **JSON yo'li**, kalit nomi emas:

```sql
SELECT id, hujjat -> '$.mijoz' AS json_qiymat, hujjat ->> '$.mijoz' AS matn,
       hujjat ->> '$.mahsulotlar[0].nom' AS birinchi
FROM buyurtmalar ORDER BY id;
```

Natija PostgreSQL bilan bir xil (yo'q element — `NULL`).

**Qidirish:**

| PostgreSQL | MySQL |
| --- | --- |
| `hujjat @> '{"shahar": "Toshkent"}'` | `JSON_CONTAINS(hujjat, '{"shahar": "Toshkent"}')` |
| `hujjat -> 'teglar' ? 'sovga'` | `'sovga' MEMBER OF (hujjat -> '$.teglar')` |
| `hujjat ? 'teglar'` | `JSON_CONTAINS_PATH(hujjat, 'one', '$.teglar')` |

Uchala natija PostgreSQL bilan bir xil (`1, 3`; `1`; `1, 2`).

**`JSON_TABLE` bor** — natija bir xil. 25-bobda aytilganidek, `JSON_TABLE` doim `LATERAL` kabi ishlaydi va oldiga `LATERAL` yozish taqiqlangan:

```text
ERROR 1064 (42000) at line 12: … near 'JSON_TABLE(b.hujjat, '$.mahsulotlar[*]' COLUMNS (nom VARCHAR(20) PATH '$.nom')) ' at line 1
```

**O'zgartirish — `JSON_SET`, `JSON_REPLACE`, `JSON_REMOVE`.** Bir chaqiruvda bir nechta yo'l:

```sql
UPDATE buyurtmalar SET hujjat = JSON_SET(hujjat, '$.shahar', 'Buxoro', '$.tolangan', true) WHERE id = 3;
```

Natija PostgreSQL bilan bir xil. Hujjatga ko'ra MySQL 9.7 shu uch funksiya bilan yozilgan `UPDATE` uchun **qisman, joyida** yangilashni qila oladi — butun hujjatni qayta yozmasdan. To'g'ridan-to'g'ri `SET hujjat = '{…}'` esa qisman yangilanmaydi.

**Noto'g'ri JSON:**

```text
ERROR 3140 (22032) at line 15: Invalid JSON text: "Missing a name for object member." at position 18 in value for column 'buyurtmalar.hujjat'.
```

**Indeks: to'g'ridan-to'g'ri yo'q.** Hujjatga ko'ra `JSON` ustunlari to'g'ridan-to'g'ri indekslanmaydi:

```text
ERROR 3152 (42000) at line 20: JSON column 'hujjat' supports indexing only via generated columns on a specified JSON path.
```

Ikki yo'l bor:

1. **Generated ustun** (15-bob) + oddiy indeks — skalyar qiymat uchun:

```sql
ALTER TABLE buyurtmalar
    ADD shahar VARCHAR(30) AS (hujjat ->> '$.shahar') VIRTUAL,
    ADD INDEX shahar_idx (shahar);
EXPLAIN SELECT id FROM buyurtmalar WHERE shahar = 'Toshkent';
```

```text
-> Covering index lookup on buyurtmalar using shahar_idx (shahar = 'Toshkent')  (cost=0.35 rows=1)
```

2. **Multi-valued indeks** — massiv uchun. Hujjatga ko'ra oddiy indeksda bir qatorga bitta yozuv (1:1), multi-valued'da esa massivning **har elementi** uchun yozuv (N:1). `CAST(… AS … ARRAY)` bilan yaratiladi:

```sql
ALTER TABLE buyurtmalar ADD INDEX teglar_idx ((CAST(hujjat -> '$.teglar' AS CHAR(20) ARRAY)));
EXPLAIN SELECT id FROM buyurtmalar WHERE 'sovga' MEMBER OF (hujjat -> '$.teglar');
```

```text
-> Filter: json'"sovga"' member of (cast(json_extract(hujjat,_utf8mb4'$.teglar') as char(20) array))  (cost=0.35 rows=1)
    -> Index lookup on buyurtmalar using teglar_idx (cast(json_extract(hujjat,_utf8mb4'$.teglar') as char(20) array) = json'"sovga"')  (cost=0.35 rows=1)
```

### SQLite

**JSON — oddiy matn.** SQLite hujjatiga ko'ra JSON oddiy **matn** sifatida saqlanadi: orqaga moslik talablari tufayli faqat `NULL`, butun son, haqiqiy son, matn va BLOB saqlanadi, yangi "JSON" tipini qo'shib bo'lmaydi. `typeof(hujjat)` → `text`.

Natijada ustunga **noto'g'ri JSON ham yoziladi**:

```sql
INSERT INTO buyurtmalar VALUES (4, '{"mijoz": "Jasur",}');   -- xatosiz
SELECT id, json_valid(hujjat) FROM buyurtmalar WHERE id = 4;
SELECT hujjat ->> '$.mijoz' FROM buyurtmalar WHERE id = 4;
```

```text
id  json_valid(hujjat)
--  ------------------
 4                   0
hujjat ->> '$.mijoz'
--------------------
Jasur
```

Qiziq natija: `json_valid` 0 (qat'iy JSON emas), lekin `->>` qiymatni o'qidi. Sababi — hujjatga ko'ra 3.42.0 dan beri JSON funksiyalari **JSON5** kengaytmalarini ham o'qiydi, jumladan oxirgi vergulni (trailing comma). Ular **chiqaradigan** JSON esa doim qat'iy.

Qat'iy tekshiruv kerak bo'lsa — `CHECK` (14-bob):

```sql
CREATE TABLE qatiy (id integer PRIMARY KEY, hujjat text CHECK (json_valid(hujjat)));
INSERT INTO qatiy VALUES (1, '{"mijoz": "Jasur",}');
```

```text
Error near line 18: CHECK constraint failed: json_valid(hujjat)
```

**`json()` — tekshiradi va siqadi**, lekin takror kalitlarni olib tashlamaydi: `json('{"b": 1,   "a": 2, "b": 3}')` → `{"b":1,"a":2,"b":3}`.

**Operatorlar.** Hujjatga ko'ra `->` doim JSON ko'rinishini, `->>` esa SQL qiymatini (`TEXT`, `INTEGER`, `REAL`, `NULL`) qaytaradi. O'ng tomonda MySQL kabi JSON yo'li (`'$.mijoz'`) ham, PostgreSQL kabi oddiy kalit (`'mijoz'`) ham bo'ladi — sinovda ikkalasi `Ali` berdi.

**Massivni qatorlarga — `json_each`.** `JSON_TABLE` yo'q. Hujjatga ko'ra `json_each(X, P)` — `P` yo'lidagi massiv yoki obyektning bevosita bolalarini qator qilib beradigan **jadval funksiyasi**; `json_tree` — rekursiv:

```sql
SELECT b.id, m.value ->> 'nom' AS nom, m.value ->> 'soni' AS soni, m.value ->> 'narx' AS narx
FROM buyurtmalar b, json_each(b.hujjat, '$.mahsulotlar') m
ORDER BY b.id, nom;

SELECT DISTINCT b.id FROM buyurtmalar b, json_each(b.hujjat, '$.teglar') t WHERE t.value = 'sovga';
```

Natijalar PostgreSQL'dagi `JSON_TABLE` va `?` bilan bir xil. Yig'indi (`39000`, `85000`, `NULL`) ham bir xil chiqdi.

**`json_set`** — MySQL'dagi kabi. Mantiqiy qiymat uchun `json('true')` (aks holda `1` yoziladi): natija `{"mijoz":"Sobir","shahar":"Buxoro","mahsulotlar":[],"tolangan":true}`.

**Indeks — ifoda indeksi.** SQLite'da ifoda bo'yicha indeks bor va `->>` bilan ishlaydi:

```sql
CREATE INDEX shahar_idx ON buyurtmalar (hujjat ->> '$.shahar');
EXPLAIN QUERY PLAN SELECT id FROM buyurtmalar WHERE hujjat ->> '$.shahar' = 'Toshkent';
```

```text
QUERY PLAN
`--SEARCH buyurtmalar USING INDEX shahar_idx (<expr>=?)
```

**SQLite JSONB.** SQLite'da ham `jsonb()` funksiyalari bor, lekin hujjat ogohlantiradi: nomi PostgreSQL'dan olingan, format esa **boshqa va mos emas**. SQLite JSONB faqat SQLite ichida ishlatish uchun; PostgreSQL'dagidek elementlarni O(1) da topishni va'da qilmaydi — afzalligi faqat kichikroq va tezroq bo'lishida.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Tip | `json` (matn nusxasi), `jsonb` (ikkilik) | `JSON` (ikkilik) | Yo'q — `text` (yoki SQLite JSONB `blob`) |
| Kiritishda tekshiruv | Ha | Ha | Yo'q (`CHECK (json_valid(…))`) |
| Takror kalitlar | `jsonb`: oxirgisi | Oxirgisi | Saqlanadi |
| `->` / `->>` o'ng tomoni | Kalit yoki indeks | JSON yo'li (`'$.a'`) | Ikkalasi |
| Containment | `@>` | `JSON_CONTAINS` | Yo'q (`json_each` bilan) |
| Massivda element | `?` | `MEMBER OF` | `json_each` |
| JSON → qatorlar | `JSON_TABLE`, `jsonb_array_elements` | `JSON_TABLE` | `json_each`, `json_tree` |
| O'zgartirish | `jsonb_set`, `\|\|` | `JSON_SET`/`REPLACE`/`REMOVE` (qisman yangilash) | `json_set`, `json_insert`, `json_remove` |
| Indeks | GIN (butun hujjat), ifoda indeksi | Generated ustun, multi-valued | Ifoda indeksi |
| JSON5 o'qish | Yo'q | Yo'q | Ha |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Hamma narsani bitta JSON ustunga yig'ish | Cheklov, tip, `JOIN`, indeks yo'qoladi; har yangilash butun qatorni qulflaydi | Barqaror, tez-tez so'raladigan maydonlar — oddiy ustun |
| PostgreSQL'da `json` tanlash (maxsus sababsiz) | Har o'qishda tahlil, indeks yo'q | `jsonb` |
| `->` natijasini matn bilan solishtirish | `"Ali"` (qo'shtirnoq bilan) ≠ `Ali` | `->>` |
| `->>` natijasini son deb hisoblash | PG'da matn: `'9' > '10'` | `(… ->> 'x')::int` yoki `JSON_VALUE … RETURNING int` |
| GIN indeks bor, so'rov `->> … =` bilan | Indeks ishlatilmaydi | `@>` yoki ifoda indeksi |
| MySQL'da `JSON` ustunga to'g'ridan-to'g'ri indeks | Xato 3152 | Generated ustun yoki multi-valued indeks |
| SQLite'da JSON tekshirilgan deb o'ylash | Istalgan matn yoziladi | `CHECK (json_valid(hujjat))` |
| Massiv indeksini 1 dan boshlash | JSON massivlari 0 dan | `[0]` |
| SQLite JSONB'ni PostgreSQL'ga ko'chirish | Formatlar mos emas | Matnli JSON orqali |

## Amaliyot

1. Har buyurtma uchun mijoz, shahar va mahsulotlar sonini (`jsonb_array_length` / `JSON_LENGTH` / `json_array_length`) chiqaring.
2. Toshkentdagi buyurtmalarning umumiy summasini (`soni × narx`) uchala tizimda hisoblang.
3. "tez" tegli buyurtmalarni toping: PostgreSQL'da `@>` bilan, MySQL'da `MEMBER OF` bilan, SQLite'da `json_each` bilan.
4. Barcha buyurtmalarga `"holat": "yangi"` maydonini qo'shing; keyin 2-buyurtmaning holatini `"yetkazildi"` ga o'zgartiring.
5. PostgreSQL'da `CREATE INDEX … USING GIN (hujjat jsonb_path_ops)` yarating. `hujjat ? 'teglar'` so'rovi uni ishlatadimi? Hujjatdagi qoida bilan tushuntiring.
6. Bu jadvalni relyatsion qilib qayta loyihalang: qaysi maydonlar ustun, qaysilari alohida jadval (`buyurtma_mahsulotlari`) bo'lishi kerak? Nega?

## Rasmiy hujjat

- PostgreSQL — 8.14. JSON Types (`json`/`jsonb`, Designing JSON Documents, Containment, Indexing): <https://www.postgresql.org/docs/18/datatype-json.html>
- PostgreSQL — 9.16. JSON Functions and Operators (SQL/JSON, `JSON_TABLE`): <https://www.postgresql.org/docs/18/functions-json.html>
- MySQL — 13.5 The JSON Data Type: <https://dev.mysql.com/doc/refman/9.7/en/json.html>
- MySQL — 14.17.6 JSON Table Functions: <https://dev.mysql.com/doc/refman/9.7/en/json-table-functions.html>
- MySQL — 15.1.18 CREATE INDEX Statement (Multi-Valued Indexes): <https://dev.mysql.com/doc/refman/9.7/en/create-index.html>
- SQLite — JSON Functions And Operators: <https://www.sqlite.org/json1.html>
