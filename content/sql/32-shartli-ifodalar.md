# 32 — Shartli ifodalar

[← Oldingi: Window funksiyalar](31-window-funksiyalar.md) · [Mundarija](README.md) · [Keyingi: Matn funksiyalari →](33-matn-funksiyalari.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/32-1-tushuncha.jpg">
    <source src="/video/sql/32-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/32-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/32-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Shartli ifodalar tushunchasi: CASE, short-circuit, NULL tuzog'i, COALESCE va NULLIF</figcaption>
</figure>

**Shartli ifoda** (conditional expression) shartga qarab turli qiymat qaytaradi — dasturlash tillaridagi `if/else` ning SQL'dagi o'rni. Bu bobda standart SQL'dagi to'rtta vosita va tizimlarning o'z qisqartmalari ko'riladi.

| Ifoda | Natija |
| --- | --- |
| `CASE WHEN shart THEN … ELSE … END` | Birinchi rost shartning qiymati |
| `COALESCE(a, b, …)` | Birinchi `NULL` bo'lmagan argument |
| `NULLIF(a, b)` | `a = b` bo'lsa `NULL`, aks holda `a` |
| `GREATEST(…)`, `LEAST(…)` | Eng katta / eng kichik argument |

### `CASE`

PostgreSQL hujjatidagi ikki shakl:

```sql
-- umumiy shakl
CASE WHEN shart1 THEN natija1
     [WHEN shart2 THEN natija2 …]
     [ELSE natija]
END

-- "oddiy" shakl: bitta ifoda qiymatlar bilan solishtiriladi
CASE ifoda WHEN qiymat1 THEN natija1 [WHEN …] [ELSE natija] END
```

Qoidalar (hujjat):

- shartlar **tartib bilan** tekshiriladi; birinchi rost shart topilgach, qolgani ko'rilmaydi;
- hech bir shart rost bo'lmasa va `ELSE` yo'q bo'lsa — **`NULL`**;
- barcha natija ifodalari bitta tipga keltirilishi kerak;
- `CASE` ifoda turishi mumkin bo'lgan **har qanday** joyda ishlatiladi: `SELECT`, `WHERE`, `ORDER BY`, agregat ichida.

**Qisqa tutashuv** (short-circuit). Hujjatga ko'ra `CASE` natijani aniqlash uchun kerak bo'lmagan qismlarni hisoblamaydi. Masalan, nolga bo'lishdan saqlanish: `CASE WHEN x <> 0 THEN y / x > 1.5 ELSE false END`. Lekin hujjat ogohlantiradi: bu qoida "temir" emas — doimiy `1/0` ifodasi so'rovni rejalashtirish paytida xato berishi mumkin, hatto u hech qachon bajarilmaydigan tarmoqda bo'lsa ham.

**Oddiy shakl va `NULL`.** Oddiy shakl `ifoda = qiymat` taqqoslashi bilan ishlaydi. `NULL = NULL` — `NULL` (rost emas), shuning uchun `CASE x WHEN NULL THEN …` hech qachon ishlamaydi. `NULL` uchun umumiy shakl va `IS NULL` kerak.

### `COALESCE`

Hujjatga ko'ra `COALESCE` birinchi `NULL` bo'lmagan argumentni qaytaradi; hammasi `NULL` bo'lsa — `NULL`. Odatiy ishlatilishi — ko'rsatishda `NULL` o'rniga sukut qiymat. `CASE` kabi u ham faqat kerakli argumentlarni hisoblaydi: birinchi `NULL` bo'lmagandan o'ngdagilar hisoblanmaydi. Hujjat: bu standart funksiya boshqa tizimlardagi `NVL` va `IFNULL` ning vazifasini bajaradi.

### `NULLIF`

`NULLIF(a, b)` — `COALESCE` ning teskarisi: maxsus qiymatni `NULL` ga aylantiradi. Ikki tipik ishlatilish:

- "bo'sh" qiymatlarni (`''`, `'(none)'`, `0`) `NULL` ga aylantirish — keyin `COALESCE` yoki agregatlar ularni to'g'ri ko'radi;
- nolga bo'lishdan saqlanish: `x / NULLIF(y, 0)` — `y = 0` bo'lsa natija `NULL`, xato emas.

### `GREATEST` va `LEAST`

Argumentlar ichidan eng katta va eng kichigini tanlaydi. Bu yerda tizimlar **standartdan farq qiladi**. PostgreSQL hujjatiga ko'ra:

- PostgreSQL'da `NULL` argumentlar **e'tiborga olinmaydi**; natija faqat hammasi `NULL` bo'lsa `NULL`;
- bu SQL standartidan chetga chiqish: standartga ko'ra **bitta** `NULL` argument bo'lsa ham natija `NULL`. Hujjat "ba'zi boshqa ma'lumotlar bazalari shunday ishlaydi" deydi — MySQL shulardan biri (quyida).

`GREATEST` agregat `max` emas: `max` ko'p **qator** ichidan tanlaydi (26-bob), `GREATEST` esa bitta qatordagi bir nechta **ifoda** ichidan.

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/32-2-kod.jpg">
    <source src="/video/sql/32-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/32-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/32-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Amaliy kod: toifalash, NULL tekshiruvi, COALESCE, NULLIF va GREATEST/LEAST</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

```sql
CREATE TABLE narxlar (
    id int PRIMARY KEY, nom varchar(20), narx int, chegirma int,
    eski_narx int, tavsif varchar(50), qisqa varchar(20)
);
INSERT INTO narxlar VALUES
    (1, 'Daftar', 12000, NULL, 15000, 'Katak daftar 48 varaq', 'Daftar'),
    (2, 'Ruchka',  3000,  500,  NULL, NULL,                    'Ruchka'),
    (3, 'Kitob',  85000,    0, 90000, NULL,                    NULL),
    (4, 'Sumka',      0, NULL,  NULL, 'Bo''sh',                '');
```

Natijalar PostgreSQL'dan; farq bo'lgan joylar "Dialektlar"da.

### `CASE`: toifalarga bo'lish

```sql
SELECT nom, narx,
       CASE WHEN narx >= 50000 THEN 'qimmat'
            WHEN narx >= 10000 THEN 'o''rta'
            WHEN narx > 0      THEN 'arzon'
            ELSE 'tekin'
       END AS toifa
FROM narxlar ORDER BY id;
```

```text
  nom   | narx  | toifa  
--------+-------+--------
 Daftar | 12000 | o'rta
 Ruchka |  3000 | arzon
 Kitob  | 85000 | qimmat
 Sumka  |     0 | tekin
(4 rows)
```

`Kitob` (85000) ikkinchi shartga ham mos (`>= 10000`), lekin birinchisi oldin rost bo'ldi. Shartlar tartibi muhim: eng tor shart birinchi.

### Oddiy `CASE` va `ELSE` siz

```sql
SELECT nom, CASE id WHEN 1 THEN 'bir' WHEN 2 THEN 'ikki' END AS soz
FROM narxlar ORDER BY id;
```

```text
  nom   | soz  
--------+------
 Daftar | bir
 Ruchka | ikki
 Kitob  | 
 Sumka  | 
(4 rows)
```

`ELSE` yo'q — mos kelmaganlar `NULL`.

### `CASE` va `NULL`

```sql
SELECT nom,
       CASE WHEN chegirma = NULL  THEN 'yo''q' ELSE 'bor' END AS xato,
       CASE WHEN chegirma IS NULL THEN 'yo''q' ELSE 'bor' END AS togri
FROM narxlar ORDER BY id;
```

```text
  nom   | xato | togri 
--------+------+-------
 Daftar | bor  | yo'q
 Ruchka | bor  | bor
 Kitob  | bor  | bor
 Sumka  | bor  | yo'q
(4 rows)
```

`chegirma = NULL` hech qachon rost emas (`NULL`) — hammasi `ELSE` ga tushdi. Uchala tizimda bir xil.

### Natija tiplari bir xil bo'lishi kerak

```sql
SELECT CASE WHEN 1 = 1 THEN 1 ELSE 'matn' END AS x;
```

```text
ERROR:  invalid input syntax for type integer: "matn"
```

PostgreSQL ikki natijani bitta tipga keltirishga urindi (`integer`) va `'matn'` ni o'gira olmadi. MySQL va SQLite xato bermadi (`1`).

### `CASE` agregat ichida va `ORDER BY` da

```sql
SELECT sum(CASE WHEN narx > 10000 THEN 1 ELSE 0 END) AS qimmatlar FROM narxlar;

SELECT nom FROM narxlar
ORDER BY CASE WHEN chegirma IS NULL THEN 1 ELSE 0 END, id;
```

```text
 qimmatlar 
-----------
         2
(1 row)

  nom   
--------
 Ruchka
 Kitob
 Daftar
 Sumka
(4 rows)
```

Birinchisi — 26-bobdagi `FILTER` ning ko'chiriladigan muqobili. Ikkinchisi — chegirmasi bor mahsulotlar oldin: 24-bobdagi MySQL `NULLS LAST` o'rnini bosuvchi usulning umumiy shakli.

### `COALESCE`: birinchi mavjud qiymat

```sql
SELECT nom, COALESCE(tavsif, qisqa, '(yo''q)') AS matn FROM narxlar ORDER BY id;
SELECT nom, narx - COALESCE(chegirma, 0) AS yakuniy FROM narxlar ORDER BY id;
```

```text
  nom   |         matn          
--------+-----------------------
 Daftar | Katak daftar 48 varaq
 Ruchka | Ruchka
 Kitob  | (yo'q)
 Sumka  | Bo'sh
(4 rows)

  nom   | yakuniy 
--------+---------
 Daftar |   12000
 Ruchka |    2500
 Kitob  |   85000
 Sumka  |       0
(4 rows)
```

`COALESCE` siz `narx - chegirma` `Daftar` va `Sumka` uchun `NULL` bo'lardi: `NULL` bilan har qanday arifmetika — `NULL`.

### `NULLIF`: bo'sh satr va nolga bo'lish

```sql
SELECT nom, NULLIF(qisqa, '') AS qisqa FROM narxlar ORDER BY id;
SELECT nom, 1000000 / NULLIF(narx, 0) AS nisbat FROM narxlar ORDER BY id;
```

```text
  nom   | qisqa  
--------+--------
 Daftar | Daftar
 Ruchka | Ruchka
 Kitob  | 
 Sumka  | 
(4 rows)

  nom   | nisbat 
--------+--------
 Daftar |     83
 Ruchka |    333
 Kitob  |     11
 Sumka  |       
(4 rows)
```

`Sumka` ning bo'sh satri `NULL` ga aylandi va narxi 0 bo'lgani uchun bo'lish `NULL` berdi. `NULLIF` siz:

```sql
SELECT 1000000 / 0;
```

```text
ERROR:  division by zero
```

**Tip nozikligi.** Hujjatga ko'ra `NULLIF` natijasi birinchi argument tipida, lekin ba'zan u ikkinchisiga moslashtiriladi: `NULLIF(1, 2.2)` — `numeric`, chunki `integer = numeric` operatori yo'q (`pg_typeof` bilan tekshirildi).

### `GREATEST` va `LEAST`

```sql
SELECT nom, GREATEST(narx, eski_narx) AS katta, LEAST(narx, eski_narx) AS kichik
FROM narxlar ORDER BY id;
```

```text
  nom   | katta | kichik 
--------+-------+--------
 Daftar | 15000 |  12000
 Ruchka |  3000 |   3000
 Kitob  | 90000 |  85000
 Sumka  |     0 |      0
(4 rows)
```

`Ruchka` va `Sumka` da `eski_narx` — `NULL`. PostgreSQL uni e'tiborsiz qoldirdi va `narx` ni qaytardi. MySQL'da natija boshqacha — quyida.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/32-3-dialektlar.jpg">
    <source src="/video/sql/32-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/32-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/32-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>Dialektlar: GREATEST da NULL farqi, MySQL IF/IFNULL va SQLite iif hamda max()</figcaption>
</figure>

### MySQL

**`CASE`, `COALESCE`, `NULLIF`** — natijalar PostgreSQL bilan bir xil. Farqlar:

- `CASE` natija tipi — barcha natijalarning "yig'ma tipi" (aggregated type). Hujjatda qoidalar ro'yxati bor: masalan, sonlar va satrlar aralashsa — `VARCHAR`. Shuning uchun `CASE … THEN 1 ELSE 'matn' END` xato bermadi;
- hujjatga ko'ra `NULLIF` argumentlar teng bo'lmasa `expr1` ni **ikki marta** hisoblaydi;
- MySQL'da `CASE` **operatori** (ifoda, `END` bilan tugaydi) va saqlangan dasturlardagi `CASE` **operatori-statement** (`END CASE` bilan) — boshqa-boshqa narsalar (56-bob).

**`GREATEST`/`LEAST` va `NULL` — standart bo'yicha.** Hujjatga ko'ra argumentlardan biri `NULL` bo'lsa, natija `NULL`:

```text
+--------+-------+--------+
| nom    | katta | kichik |
+--------+-------+--------+
| Daftar | 15000 |  12000 |
| Ruchka |  NULL |   NULL |
| Kitob  | 90000 |  85000 |
| Sumka  |  NULL |   NULL |
+--------+-------+--------+
```

Bir xil so'rov, bir xil ma'lumot — PostgreSQL'da `3000`, MySQL'da `NULL`. PostgreSQL xatti-harakatini MySQL'da olish uchun argumentlarni `COALESCE` bilan o'rash kerak: `GREATEST(narx, COALESCE(eski_narx, narx))`.

**`IF()` va `IFNULL()`.** MySQL'ga xos qisqartmalar:

- `IF(shart, a, b)` — hujjatga ko'ra `shart` rost bo'lsa (`shart <> 0` va `IS NOT NULL`) `a`, aks holda `b`;
- `IFNULL(a, b)` — ikki argumentli `COALESCE`.

```sql
SELECT IF(narx > 10000, 'ha', 'yo''q'), IFNULL(chegirma, 0) FROM narxlar WHERE id = 1;
```

```text
+---------------------------------+---------------------+
| IF(narx > 10000, 'ha', 'yo''q') | IFNULL(chegirma, 0) |
+---------------------------------+---------------------+
| ha                              |                   0 |
+---------------------------------+---------------------+
```

PostgreSQL'da ikkalasi ham yo'q (`function if(boolean, unknown, unknown) does not exist`). Ko'chiriladigan kodda — `CASE` va `COALESCE`.

**Nolga bo'lish — `NULL` va ogohlantirish.** MySQL'da `/` butun sonlarni ham kasr qilib bo'ladi (`83.3333`), nolga bo'lish esa `SELECT` da xato emas:

```text
+------+
| x    |
+------+
| NULL |
+------+
| Warning | 1365 | Division by 0 |
```

`NULLIF(narx, 0)` MySQL'da ham ishlaydi va niyatni aniq ko'rsatadi.

### SQLite

**`CASE`, `COALESCE`, `NULLIF`** — natijalar PostgreSQL bilan bir xil (butun sonli bo'lish ham: `83`). `CASE … THEN 1 ELSE 'matn' END` xato bermadi — SQLite'da har qiymat o'z tipida (10-bob).

**`GREATEST`/`LEAST` yo'q** — o'rniga ko'p argumentli `max()`/`min()`:

```text
Parse error near line 9: no such function: GREATEST
```

Hujjatga ko'ra ko'p argumentli `max(X, Y, …)` — oddiy funksiya, **bitta** argumentli `max(X)` esa agregat (26-bob). `NULL` bo'yicha hujjat: ko'p argumentli `max()` biror argument `NULL` bo'lsa `NULL` qaytaradi — MySQL kabi, standart bo'yicha:

```sql
SELECT max(12000, 15000), min(12000, 15000), max(3000, NULL), typeof(max(3000, NULL));
```

```text
15000|12000||null
```

**`iif()`, `if()`, `ifnull()`.** Hujjatga ko'ra:

- `iif(B1, V1, …)` juft-juft argument oladi: birinchi rost `B` ning `V` si; argumentlar soni toq bo'lsa oxirgisi — "aks holda" qiymati. Bu `CASE` ning qisqa yozuvi: `iif(X, Y, Z)` aynan `CASE WHEN X THEN Y ELSE Z END` bilan **bir xil bytecode** hosil qiladi. Qisqa tutashuv bilan ishlaydi;
- `if()` — `iif()` ning boshqa yozilishi (shuning uchun MySQL'dagi `IF(narx > 10000, 'ha', 'yo''q')` SQLite'da ham ishladi);
- `ifnull(X, Y)` — ikki argumentli `coalesce()`. `coalesce()` ga kamida 2 argument kerak.

```sql
SELECT iif(narx > 10000, 'ha', 'yo''q') FROM narxlar WHERE id = 1;
```

```text
iif(narx > 10000, 'ha', 'yo''q')
--------------------------------
ha
```

MySQL'da `iif` yo'q: `FUNCTION qollanma.iif does not exist`.

**Nolga bo'lish** SQLite'da `NULL` (xato ham, ogohlantirish ham yo'q): `SELECT 1000000/0 IS NULL` → `1`.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `CASE`, `COALESCE`, `NULLIF` | Ha | Ha | Ha |
| `CASE` da turli tipli natijalar | Bitta tipga keltiradi yoki xato | Yig'ma tip (masalan, `VARCHAR`) | Har qiymat o'z tipida |
| `GREATEST`/`LEAST` | Ha, `NULL` ni **e'tiborsiz** qoldiradi | Ha, bitta `NULL` → `NULL` | Yo'q; `max(a,b)`/`min(a,b)`, bitta `NULL` → `NULL` |
| `IF(shart, a, b)` | Yo'q | Ha | Ha (`iif` ning sinonimi) |
| `iif(…)` | Yo'q | Yo'q | Ha |
| `IFNULL(a, b)` | Yo'q | Ha | Ha |
| Nolga bo'lish | Xato | `NULL` + ogohlantirish | `NULL` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `CASE x WHEN NULL …` yoki `WHEN x = NULL` | Hech qachon rost emas | `CASE WHEN x IS NULL …` |
| Keng shartni birinchi yozish | Tor shartlar hech qachon ishlamaydi | Tor shartdan kengga |
| `ELSE` ni unutish | Kutilmagan `NULL` | `ELSE` ni doim yozish |
| `GREATEST(a, b)` natijasini tizimlar orasida bir xil deb o'ylash | PG `NULL` ni tashlaydi, MySQL/SQLite `NULL` qaytaradi | `COALESCE` bilan aniq yozish |
| `x - y` da `y` `NULL` bo'lishi mumkin | Butun ifoda `NULL` | `x - COALESCE(y, 0)` |
| `x / y`, `y` 0 bo'lishi mumkin | PG'da xato, MySQL/SQLite'da jimgina `NULL` | `x / NULLIF(y, 0)` — niyat aniq |
| MySQL `IF`/`IFNULL` ni PostgreSQL'ga ko'chirish | Funksiya topilmaydi | `CASE`, `COALESCE` |
| Bo'sh satr va `NULL` ni aralashtirish | `COALESCE` bo'sh satrni "qiymat" deb oladi | `COALESCE(NULLIF(x, ''), 'sukut')` |

## Amaliyot

1. Mahsulotlarni narxiga qarab uch toifaga ajrating va har toifadagi mahsulotlar sonini bitta so'rovda chiqaring (`GROUP BY` + `CASE`).
2. Chegirmali yakuniy narxni hisoblang; chegirma `NULL` bo'lsa 0 deb oling. Chegirma narxdan katta bo'lsa, yakuniy narx 0 bo'lsin.
3. `tavsif`, keyin `qisqa`, keyin `nom` dan birinchi **bo'sh bo'lmagan** matnni chiqaring (bo'sh satr ham hisobga olinmasin).
4. `GREATEST(narx, eski_narx)` ni uchala tizimda ishga tushiring. Keyin uchalasida ham PostgreSQL natijasini beradigan qilib qayta yozing.
5. Har mahsulot uchun narx o'zgarishi foizini `(narx - eski_narx) * 100 / eski_narx` bilan hisoblang. `eski_narx` 0 yoki `NULL` bo'lsa nima bo'ladi? Uchala tizimda xatosiz ishlaydigan qiling.

## Rasmiy hujjat

- PostgreSQL — 9.18. Conditional Expressions: <https://www.postgresql.org/docs/18/functions-conditional.html>
- MySQL — 14.5 Flow Control Functions (`CASE`, `IF`, `IFNULL`, `NULLIF`): <https://dev.mysql.com/doc/refman/9.7/en/flow-control-functions.html>
- MySQL — 14.4.2 Comparison Functions and Operators (`COALESCE`, `GREATEST`, `LEAST`): <https://dev.mysql.com/doc/refman/9.7/en/comparison-operators.html>
- SQLite — Built-In Scalar SQL Functions (`coalesce`, `iif`, `ifnull`, `nullif`, `max`, `min`): <https://www.sqlite.org/lang_corefunc.html>
