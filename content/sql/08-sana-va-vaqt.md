# 08 — Sana va vaqt

[← Oldingi: Matn va binary](07-matn-va-binary.md) · [Mundarija](README.md) · [Keyingi: Boolean, UUID va enum →](09-boolean-uuid-enum.md)

## Tushuncha

Sana va vaqtni saqlash oddiy ko'rinadi, lekin bir savol hamma narsani o'zgartiradi: **"Soat 09:00" — qaysi joyda?** Toshkentdagi 09:00 va Moskvadagi 09:00 — vaqtning ikki xil **lahzasi**.

Shuning uchun vaqt qiymatlari ikki xil bo'ladi:

- **Mahalliy vaqt** (*local time*) — kalendar va soatdagi ko'rinish: "2026-10-12, 09:00". Qaysi joyga tegishli ekani aytilmagan. Masalan, "do'kon har kuni 09:00 da ochiladi" — bu har bir filialning o'z soati.
- **Lahza** (*instant*) — butun dunyoda bir xil nuqta: "2026-10-12, 04:00 UTC". Masalan, buyurtma qachon berildi, xabar qachon yuborildi.

**UTC** — butun dunyo uchun asos bo'lgan vaqt. Mintaqalar undan farq bilan ifodalanadi: Toshkent — UTC+5, Moskva — UTC+3.

### PostgreSQL'dagi tiplar

| Tip | Hajmi | Ma'nosi | Aniqlik |
| --- | --- | --- | --- |
| `date` | 4 bayt | Faqat sana | 1 kun |
| `time` | 8 bayt | Faqat kun vaqti | 1 mikrosekund |
| `timestamp` | 8 bayt | Sana va vaqt, **mintaqasiz** | 1 mikrosekund |
| `timestamp with time zone` (`timestamptz`) | 8 bayt | Sana va vaqt, **lahza** sifatida | 1 mikrosekund |
| `interval` | 16 bayt | Vaqt oralig'i | 1 mikrosekund |
| `time with time zone` | 12 bayt | Kun vaqti va mintaqa farqi | 1 mikrosekund |

Uchta muhim izoh:

- **Standart:** faqat `timestamp` deb yozilsa, bu `timestamp without time zone` degani. PostgreSQL shunga amal qiladi. `timestamptz` qisqartmasi esa PostgreSQL kengaytmasi.
- **Aniqlik:** `time`, `timestamp` va `interval` ga sekund kasr xonalarini berish mumkin, 0 dan 6 gacha: `timestamp(3)`. Sukut bo'yicha aniq chegara yo'q.
- **`time with time zone`:** hujjatga ko'ra standartda bor, lekin "foydasi shubhali". Hujjat uni **tavsiya qilmaydi**. Mintaqa farqi yil davomida o'zgarishi mumkin (yozgi vaqt), sanasiz esa uni aniqlab bo'lmaydi.

### `timestamp` va `timestamptz` qanday farq qiladi

Nomidan farqli o'laroq, `timestamptz` mintaqani **saqlamaydi**. Hujjatdagi qoidalar:

- `timestamptz` ga qiymat yozilganda u **UTC** ga o'giriladi va shunday saqlanadi. Asl mintaqa esa **eslab qolinmaydi**;
- qiymatda mintaqa yozilmagan bo'lsa, seansning `TimeZone` sozlamasidagi mintaqa olinadi;
- o'qilganda UTC dan seansning `TimeZone` mintaqasiga o'giriladi.

`timestamp` esa mintaqani umuman bilmaydi. Qiymatdagi mintaqa ko'rsatkichi **jimgina tashlab yuboriladi**.

Xulosa: `timestamptz` — **lahza**, `timestamp` — **kalendar ko'rinishi**.

### Mintaqalar

Hujjatga ko'ra mintaqalar "faqat yer geometriyasi emas, siyosiy qarorlar" bilan belgilanadi va o'zgarib turadi. PostgreSQL ularning tarixini IANA bazasidan oladi. Mintaqani uch xil yozish mumkin:

| Ko'rinish | Misol | Ma'nosi |
| --- | --- | --- |
| To'liq nom | `Asia/Tashkent`, `America/New_York` | Joy: yozgi vaqt qoidalari bilan birga |
| Qisqartma | `EST`, `PST` | Faqat aniq bir farq (UTC−5), qoidasiz |
| POSIX ko'rinishi | — | Hujjat odatda tavsiya qilmaydi |

Hujjatning tavsiyasi: mintaqa kerak bo'lsa, **sana va vaqtni birga** saqlaydigan tiplardan foydalaning.

### Interval

`interval` ichida uchta alohida maydon saqlanadi: **oylar**, **kunlar** va **mikrosekundlar**. Ular alohida, chunki:

- oydagi kunlar soni har xil;
- yozgi vaqtga o'tish kunida bir kun 23 yoki 25 soat bo'lishi mumkin.

Intervalni sanaga qo'shganda maydonlar shu tartibda qo'shiladi:

1. **Oylar.** Oyning kuni saqlanadi. Yangi oyda bunday kun bo'lmasa, oyning **oxirgi kuni** olinadi: 31-mart + 1 oy = 30-aprel.
2. **Kunlar.** Kun vaqti o'zgarmaydi.
3. **Mikrosekundlar.** Aynan shuncha qo'shiladi.

Natijada yozgi vaqtga o'tish kunida `interval '1 day'` va `interval '24 hours'` **turli** natija beradi.

### Kiritish formati

PostgreSQL deyarli har qanday mantiqli formatni qabul qiladi. Lekin `01/02/03` kabi yozuv `DateStyle` sozlamasiga qarab 2-yanvar, 1-fevral yoki boshqa sana bo'lishi mumkin. Hujjat **ISO 8601** formatini (`2026-10-12`) tavsiya qiladi. U har qanday rejimda bir xil tushuniladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. PostgreSQL seansining mintaqasi — `Asia/Tashkent` (UTC+5).

### `timestamp` va `timestamptz`

```sql
SHOW TimeZone;
CREATE TABLE voqealar (nom text, oddiy timestamp, zonali timestamptz);
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');
INSERT INTO voqealar VALUES ('qongiroq', '2026-10-12 09:00:00+03', '2026-10-12 09:00:00+03');
SELECT * FROM voqealar;
```

```text
   TimeZone    
---------------
 Asia/Tashkent
(1 row)

   nom    |        oddiy        |         zonali         
----------+---------------------+------------------------
 dars     | 2026-10-12 09:00:00 | 2026-10-12 09:00:00+05
 qongiroq | 2026-10-12 09:00:00 | 2026-10-12 11:00:00+05
(2 rows)
```

Ikkinchi qatorda `+03` (Moskva vaqti) bilan yozilgan qiymat:

- `timestamp` da `+03` jimgina **tashlab yuborildi**, 09:00 bo'lib qoldi;
- `timestamptz` da u lahza sifatida tushunildi. Moskvadagi 09:00 — Toshkentdagi 11:00.

Endi seans mintaqasini UTC'ga o'zgartiramiz:

```sql
SET TimeZone = 'UTC';
SELECT * FROM voqealar;
```

```text
   nom    |        oddiy        |         zonali         
----------+---------------------+------------------------
 dars     | 2026-10-12 09:00:00 | 2026-10-12 04:00:00+00
 qongiroq | 2026-10-12 09:00:00 | 2026-10-12 06:00:00+00
(2 rows)
```

`timestamptz` boshqa ko'rinishda chiqdi, lekin **lahza o'sha**. `timestamp` esa o'zgarmadi: unga mintaqa ahamiyatsiz.

### `AT TIME ZONE`

`AT TIME ZONE` operatori ikki tomonga ishlaydi:

- `timestamptz AT TIME ZONE 'zona'` → o'sha lahza shu joyda soat nechada bo'ladi (natija `timestamp`);
- `timestamp AT TIME ZONE 'zona'` → mahalliy vaqtni shu joyniki deb hisoblab, lahzaga aylantiradi (natija `timestamptz`).

```sql
SET TimeZone = 'Asia/Tashkent';
SELECT zonali AT TIME ZONE 'Europe/Moscow' AS moskva_vaqti,
       oddiy  AT TIME ZONE 'Europe/Moscow' AS moskvadagi_soat
FROM voqealar WHERE nom = 'dars';
```

```text
    moskva_vaqti     |    moskvadagi_soat     
---------------------+------------------------
 2026-10-12 07:00:00 | 2026-10-12 11:00:00+05
(1 row)
```

- `moskva_vaqti`: Toshkentdagi 09:00 lahzasida Moskvada soat 07:00.
- `moskvadagi_soat`: "Moskvadagi 09:00" lahzasi Toshkentda 11:00 ga to'g'ri keladi.

### Interval arifmetikasi

```sql
SELECT date '2026-01-31' + interval '1 month' AS bir_oy,
       date '2026-03-31' + interval '1 month' AS mart_oxiri;
```

```text
       bir_oy        |     mart_oxiri      
---------------------+---------------------
 2026-02-28 00:00:00 | 2026-04-30 00:00:00
(1 row)
```

Fevralda 31-kun yo'q, shuning uchun oyning oxirgi kuni olindi.

Interval normallashadi:

```sql
SELECT '2 years 15 months 100 weeks 99 hours'::interval AS normallashgan;
```

```text
          normallashgan           
----------------------------------
 3 years 3 mons 700 days 99:00:00
(1 row)
```

15 oy 1 yil 3 oyga aylandi, 100 hafta esa 700 kun bo'ldi. Kunlar oylarga, soatlar kunlarga aylantirilmadi, chunki ular har xil uzunlikda bo'lishi mumkin.

Ikki sanani ayirish:

```sql
SELECT timestamp '2026-10-12 18:00' - timestamp '2026-10-10 09:30' AS farq;
SELECT date '2026-10-12' - date '2026-01-01' AS kunlar;
```

```text
      farq       
-----------------
 2 days 08:30:00
(1 row)

 kunlar 
--------
    284
(1 row)
```

`timestamp` ayirmasi `interval` beradi, `date` ayirmasi esa butun son (kunlar).

### Yozgi vaqt: `1 day` va `24 hours`

AQShning Nyu-York mintaqasida 2026-yil 8-martda soatlar bir soat oldinga suriladi:

```sql
SET TimeZone = 'America/New_York';
SELECT timestamptz '2026-03-07 12:00' + interval '1 day'    AS bir_kun,
       timestamptz '2026-03-07 12:00' + interval '24 hours' AS yigirma_tort_soat;
```

```text
        bir_kun         |   yigirma_tort_soat    
------------------------+------------------------
 2026-03-08 12:00:00-04 | 2026-03-08 13:00:00-04
(1 row)
```

`1 day` "ertangi kun, o'sha soat" degani. `24 hours` esa aniq 24 soatlik masofa. O'tish kuni 23 soatdan iborat bo'lgani uchun natijalar bir soatga farq qildi.

### Kiritish xatolari

```sql
SELECT '13/01/2026'::date;
```

```text
ERROR:  date/time field value out of range: "13/01/2026"
HINT:  Perhaps you need a different "DateStyle" setting.
```

Sukut bo'yicha `DateStyle` oy-kun-yil tartibida o'qiydi, 13-oy esa yo'q. Tartibni o'zgartirsak:

```sql
SET DateStyle = 'ISO, DMY';
SELECT '13/01/2026'::date AS dmy;
```

```text
    dmy     
------------
 2026-01-13
(1 row)
```

Yo'q sana xato beradi:

```sql
SELECT '2026-02-30'::date;
```

```text
ERROR:  date/time field value out of range: "2026-02-30"
```

**Maxsus qiymatlar.** `infinity` va `-infinity` har qanday sanadan katta yoki kichik. `now`, `today`, `tomorrow` ham bor. Hujjat ogohlantiradi: bular o'qilgan paytdagi qiymatga aylanadi. Shuning uchun keyin bajariladigan buyruqlarda (masalan, prepared statement'larda, view'larda) kutilmagan natija berishi mumkin. U yerda `CURRENT_TIMESTAMP` kabi funksiyalar ishlatiladi (34-bob).

```sql
SELECT 'infinity'::timestamptz > now() AS cheksiz;
```

```text
 cheksiz 
---------
 t
(1 row)
```

## Dialektlar

### MySQL

**Tiplar:**

| Tip | Oraliq | Izohi |
| --- | --- | --- |
| `DATE` | `1000-01-01` … `9999-12-31` | Faqat sana |
| `DATETIME` | `1000-01-01 00:00:00` … `9999-12-31 23:59:59` | Mahalliy vaqt, mintaqasiz |
| `TIMESTAMP` | `1970-01-01 00:00:01` UTC … `2038-01-19 03:14:07` UTC | Lahza: UTC'da saqlanadi |
| `TIME` | — | Kun vaqti yoki davomiylik |
| `YEAR` | — | Yil |

MySQL'da `INTERVAL` **ma'lumot tipi emas**. U faqat sana amallarida ishlatiladi:

```sql
CREATE TABLE i (x INTERVAL);
```

```text
ERROR 1064 (42000) at line 17: You have an error in your SQL syntax; … near 'INTERVAL)' at line 1
```

**`TIMESTAMP` va `DATETIME`.** Hujjatga ko'ra MySQL `TIMESTAMP` ni joriy mintaqadan UTC'ga o'girib saqlaydi va o'qishda qaytarib o'giradi. `DATETIME` bilan bunday qilinmaydi. Bu PostgreSQL'dagi `timestamptz` va `timestamp` farqiga o'xshaydi:

```sql
CREATE TABLE voqealar (nom VARCHAR(20), dt DATETIME, ts TIMESTAMP);
SET time_zone = '+05:00';
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00', '2026-10-12 09:00:00');
SET time_zone = '+00:00';
SELECT * FROM voqealar;
```

```text
+------+---------------------+---------------------+
| nom  | dt                  | ts                  |
+------+---------------------+---------------------+
| dars | 2026-10-12 09:00:00 | 2026-10-12 04:00:00 |
+------+---------------------+---------------------+
```

**2038-yil chegarasi.** `TIMESTAMP` 2038-yil 19-yanvar 03:14:07 UTC dan keyingi lahzani saqlay olmaydi:

```text
ERROR 1292 (22007) at line 9: Incorrect datetime value: '2038-01-19 03:14:08' for column 'ts' at row 1
```

Shartnoma muddati, kredit jadvali kabi uzoq kelajakdagi sanalar uchun bu real muammo.

**Nomli mintaqalar.** Hujjatga ko'ra MySQL o'rnatilganda mintaqa jadvallari yaratiladi, lekin **to'ldirilmaydi**. Ular `mysql_tzinfo_to_sql` dasturi bilan yuklanadi. Yuklanmagan bo'lsa, faqat `'+05:00'` kabi farqlar ishlaydi:

```sql
SET time_zone = 'Asia/Tashkent';
```

```text
ERROR 1298 (HY000) at line 8: Unknown or incorrect time zone: 'Asia/Tashkent'
```

Sukut bo'yicha mintaqa — `SYSTEM`, ya'ni server kompyuterining mintaqasi. Hujjat ogohlantiradi: `SYSTEM` da mintaqa hisoblanadigan har funksiya chaqiruvi tizim kutubxonasiga murojaat qiladi va bu raqobat (*contention*) tug'dirishi mumkin.

**Noto'g'ri sanalar.** Sukut bo'yicha qat'iy rejimda va `NO_ZERO_DATE` bilan noto'g'ri sanalar xato beradi:

```text
ERROR 1292 (22007) at line 10: Incorrect datetime value: '0000-00-00 00:00:00' for column 'dt' at row 1
ERROR 1292 (22007) at line 11: Incorrect datetime value: '2026-02-30 10:00:00' for column 'dt' at row 1
```

Bu rejimlar o'chirilgan eski serverlarda bunday qiymatlar `'0000-00-00'` "nol sana"ga aylanishi mumkin.

**Sekund kasrlari.** MySQL'da `DATETIME(fsp)` ning sukut bo'yicha aniqligi **0**. Hujjat buni standartdan farq deydi: standartda 6. Ortiqcha xonalar xabarsiz **yaxlitlanadi**:

```sql
CREATE TABLE kasr (a DATETIME, b DATETIME(3));
INSERT INTO kasr VALUES ('2026-10-12 09:00:00.777', '2026-10-12 09:00:00.7777');
SELECT * FROM kasr;
```

```text
+---------------------+-------------------------+
| a                   | b                       |
+---------------------+-------------------------+
| 2026-10-12 09:00:01 | 2026-10-12 09:00:00.778 |
+---------------------+-------------------------+
```

`09:00:00.777` → `09:00:01`. Soniya yaxlitlanib, keyingi sekundga o'tdi.

**Arifmetika** — funksiyalar orqali:

```sql
SELECT DATE_ADD('2026-01-31', INTERVAL 1 MONTH) AS bir_oy,
       '2026-01-31' + INTERVAL 1 MONTH AS operator_bilan;
SELECT TIMESTAMPDIFF(MINUTE, '2026-10-10 09:30', '2026-10-12 18:00') AS daqiqa,
       DATEDIFF('2026-10-12', '2026-01-01') AS kunlar;
```

```text
+------------+----------------+
| bir_oy     | operator_bilan |
+------------+----------------+
| 2026-02-28 | 2026-02-28     |
+------------+----------------+
+--------+--------+
| daqiqa | kunlar |
+--------+--------+
|   3390 |    284 |
+--------+--------+
```

### SQLite

SQLite'da sana va vaqt uchun **alohida saqlash klassi yo'q**. Hujjatga ko'ra ular uch xil saqlanadi:

| Ko'rinish | Saqlash klassi | Misol |
| --- | --- | --- |
| ISO 8601 matni | `TEXT` | `'2026-10-12 09:00:00'` |
| Julian kuni | `REAL` | `2461325.875` |
| Unix vaqti (1970-yildan beri sekundlar, UTC) | `INTEGER` | `1791795600` |

Ularni sana funksiyalari bir-biriga aylantiradi: `date()`, `time()`, `datetime()`, `julianday()`, `unixepoch()`, `strftime()`, `timediff()`.

```sql
CREATE TABLE voqealar (nom TEXT, vaqt TEXT, unix INTEGER, julian REAL);
INSERT INTO voqealar VALUES ('dars', '2026-10-12 09:00:00',
       unixepoch('2026-10-12 09:00:00'), julianday('2026-10-12 09:00:00'));
SELECT * FROM voqealar;
```

```text
nom          vaqt             unix       julian
----  -------------------  ----------  -----------
dars  2026-10-12 09:00:00  1791795600  2461325.875
```

**Mintaqa.** SQLite funksiyalari vaqtni sukut bo'yicha **UTC** deb hisoblaydi. `localtime` modifikatori kompyuterning mahalliy vaqtiga o'giradi:

```sql
SELECT datetime('now') AS utc, datetime('now', 'localtime') AS mahalliy;
```

```text
        utc               mahalliy
-------------------  -------------------
2026-10-12 05:33:29  2026-10-12 10:33:29
```

**Oy qo'shish.** `'+1 month'` 31-yanvarni qaysi kunga olib boradi? SQLite hujjati buni ochiq tan oladi: "bu borada kelishuv yo'q". Shuning uchun ikki modifikator bor:

- `ceiling` (sukut bo'yicha) — keyingi sana;
- `floor` — oldingi oyning oxirgi kuni.

```sql
SELECT date('2026-01-31', '+1 month') AS bir_oy,
       date('2026-01-31', '+1 month', 'floor') AS floor;
```

```text
2026-03-03|2026-02-28
```

PostgreSQL va MySQL `2026-02-28` bergan joyda SQLite sukut bo'yicha `2026-03-03` berdi.

**Noto'g'ri sana xato bermaydi.** Sinovda:

```sql
SELECT date('2026-02-30') AS fevral30, date('salom') AS notogri;
```

```text
  fevral30   notogri
----------  -------
2026-03-02
```

`2026-02-30` jimgina `2026-03-02` ga aylandi. Umuman sana bo'lmagan matn esa `NULL` qaytardi.

**Matn sifatida solishtirish.** Sana `TEXT` da saqlangani uchun solishtirish **matn** bo'yicha bo'ladi. Bu faqat format bir xil va to'liq bo'lsa to'g'ri ishlaydi:

```sql
SELECT '2026-10-12' < '2026-9-30' AS matn_solishtirish;
```

```text
matn_solishtirish
-----------------
                1
```

Matn sifatida `'1'` < `'9'`, shuning uchun 12-oktabr 30-sentabrdan "oldin" chiqdi. ISO formati (`2026-09-30`, nol bilan) hamma joyda bir xil saqlansa, bu muammo bo'lmaydi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Mahalliy vaqt | `timestamp` | `DATETIME` | `TEXT` / `REAL` / `INTEGER` |
| Lahza (UTC'da saqlanadi) | `timestamptz` | `TIMESTAMP` (1970–2038) | Unix vaqti yoki UTC matni |
| Oraliq | `interval` tipi | Tip yo'q, faqat `INTERVAL n UNIT` ifodasi | `timediff()`, modifikatorlar |
| Sekund kasri | 0–6, sukut bo'yicha cheklanmagan | 0–6, sukut bo'yicha **0** | Matnda `.SSS` |
| Nomli mintaqalar | IANA bazasi, darhol ishlaydi | Jadvallarni yuklash kerak | Faqat UTC va `localtime` |
| `2026-01-31 + 1 oy` | `2026-02-28` | `2026-02-28` | `2026-03-03` (`floor` bilan `02-28`) |
| `2026-02-30` | Xato | Xato (qat'iy rejimda) | `2026-03-02` |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Lahzani (buyurtma vaqti, kirish vaqti) `timestamp` / `DATETIME` da saqlash | Qaysi mintaqa ekani yo'qoladi; server yoki foydalanuvchi mintaqasi o'zgarsa, ma'lumot noto'g'ri tushuniladi | PostgreSQL: `timestamptz` |
| `timestamptz` mintaqani saqlaydi deb o'ylash | Faqat UTC lahza saqlanadi, asl mintaqa yo'qoladi | Kerak bo'lsa, mintaqa nomini alohida ustunda saqlash |
| `time with time zone` ishlatish | Hujjat tavsiya qilmaydi: sanasiz yozgi vaqtni aniqlab bo'lmaydi | `timestamptz` yoki `time` + alohida mintaqa |
| MySQL `TIMESTAMP` ga uzoq kelajak sanalarini yozish | 2038-01-19 dan keyin saqlanmaydi | `DATETIME` (UTC'da saqlab) |
| MySQL'da `SET time_zone = 'Asia/Tashkent'` ishlaydi deb o'ylash | Mintaqa jadvallari yuklanmagan bo'lsa, xato | `mysql_tzinfo_to_sql` bilan yuklash yoki `'+05:00'` |
| MySQL'da `DATETIME` ga millisekund yozish | Sukut bo'yicha aniqlik 0: xabarsiz yaxlitlanadi | `DATETIME(3)` yoki `DATETIME(6)` |
| `'01/02/03'` kabi formatda sana yuborish | `DateStyle` ga qarab har xil sana | ISO 8601: `'2026-10-12'` |
| `interval '1 day'` va `'24 hours'` ni bir xil deb hisoblash | Yozgi vaqtga o'tish kunida farq qiladi | Kalendar bo'yicha qo'shish kerak bo'lsa — kun, aniq masofa kerak bo'lsa — soat |
| SQLite'da sanani har xil formatda matn qilib saqlash | Matn solishtirish noto'g'ri tartib beradi | Doim to'liq ISO 8601 yoki Unix vaqti |
| `now`, `today` ni saqlanadigan so'rovlarda (view, prepared statement) ishlatish | O'qilgan paytdagi qiymatda "qotib" qolishi mumkin | `CURRENT_TIMESTAMP`, `now()` funksiyalari |

## Amaliyot

1. PostgreSQL'da `timestamptz` ustunli jadvalga `'2026-10-12 12:00:00+00'` ni yozing. Seans mintaqasini `Asia/Tashkent`, `Europe/London` va `Asia/Tokyo` ga o'zgartirib, har safar `SELECT` qiling.
2. `SELECT timestamp '2026-10-12 09:00' AT TIME ZONE 'Asia/Tashkent' AT TIME ZONE 'UTC';` natijasini oldindan ayting va tekshiring.
3. `date '2026-01-31' + interval '1 month' + interval '1 month'` va `date '2026-01-31' + interval '2 months'` ni solishtiring. Nega natijalar farq qiladi?
4. MySQL'da `TIMESTAMP` va `DATETIME` ustunlariga bir xil qiymatni `time_zone = '+05:00'` da yozing. Keyin `'-03:00'` ga o'tib o'qing.
5. MySQL'da `SELECT @@GLOBAL.time_zone, @@system_time_zone;` ni bajaring. Mintaqa jadvallarini yuklash buyrug'ini hujjatdan toping (ishlab turgan serverda ehtiyot bo'ling).
6. SQLite'da `date('2024-02-29', '+1 year')` ni `ceiling` va `floor` bilan solishtiring. PostgreSQL'da `date '2024-02-29' + interval '1 year'` nima beradi?
7. O'zingizning ilovangizdagi uchta vaqt maydonini tanlang (masalan, ro'yxatdan o'tgan vaqt, tug'ilgan kun, ish boshlanish soati). Har biri uchun PostgreSQL tipini tanlang va asoslang.

## Rasmiy hujjat

- PostgreSQL — 8.5. Date/Time Types: <https://www.postgresql.org/docs/18/datatype-datetime.html>
- PostgreSQL — 9.9. Date/Time Functions and Operators: <https://www.postgresql.org/docs/18/functions-datetime.html>
- PostgreSQL — Appendix B. Date/Time Support: <https://www.postgresql.org/docs/18/datetime-appendix.html>
- MySQL — 13.2 Date and Time Data Types: <https://dev.mysql.com/doc/refman/9.7/en/date-and-time-types.html>
- MySQL — 13.2.2 The DATE, DATETIME, and TIMESTAMP Types: <https://dev.mysql.com/doc/refman/9.7/en/datetime.html>
- MySQL — 13.2.6 Fractional Seconds in Time Values: <https://dev.mysql.com/doc/refman/9.7/en/fractional-seconds.html>
- MySQL — 7.1.15 MySQL Server Time Zone Support: <https://dev.mysql.com/doc/refman/9.7/en/time-zone-support.html>
- MySQL — 14.7 Date and Time Functions: <https://dev.mysql.com/doc/refman/9.7/en/date-and-time-functions.html>
- SQLite — Date And Time Functions: <https://www.sqlite.org/lang_datefunc.html>
- SQLite — Datatypes In SQLite (2.2. Date and Time Datatype): <https://www.sqlite.org/datatype3.html>
