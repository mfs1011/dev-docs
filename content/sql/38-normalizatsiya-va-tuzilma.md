# 38 — Normalizatsiya va tuzilma

[← Oldingi: Aloqalar va tashqi kalitlar](37-aloqalar-va-tashqi-kalitlar.md) · [Mundarija](README.md) · [Keyingi: Birlamchi kalitni tanlash →](39-birlamchi-kalitni-tanlash.md)

## Tushuncha

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/38-1-tushuncha.jpg">
    <source src="/video/sql/38-1-tushuncha.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/38-1-tushuncha.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/38-1-tushuncha.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>38.1-video. Normalizatsiya va 3NF asoslari</figcaption>
</figure>

**Normalizatsiya** (normalization) — ma'lumotni **takrorlanmaydigan** qilib jadvallarga bo'lish. Bitta fakt (mijozning manzili, mahsulotning nomi) bazada **bir joyda** saqlanadi, boshqa joylarda unga ID orqali murojaat qilinadi.

### Rasmiy hujjat nima deydi

MySQL qo'llanmasining "Optimizing Data Size" bo'limida normalizatsiya haqida qisqa, lekin aniq tavsiya bor:

- odatda barcha ma'lumotni **takrorsiz** saqlashga harakat qiling — ma'lumotlar bazasi nazariyasida bu **uchinchi normal shakl** (third normal form, 3NF) deb ataladi;
- ism va manzil kabi uzun qiymatlarni takrorlash o'rniga ularga **yagona ID** bering, kerakli joylarda shu ID ni takrorlang (bir nechta kichikroq jadvallarda) va so'rovlarda jadvallarni ID bo'yicha **`JOIN`** qiling;
- agar **tezlik** disk joyidan va ma'lumotning bir nechta nusxasini saqlash xarajatidan muhimroq bo'lsa — masalan, katta jadvallardagi barcha ma'lumotni tahlil qiladigan biznes-tahlil (business intelligence) holatida — normalizatsiya qoidalarini **yumshatish** mumkin: ma'lumotni takrorlash yoki **yig'ma jadvallar** (summary tables) yaratish.

Shu bo'limdagi qo'shni tavsiyalar ham tuzilmaga tegishli:

- turli jadvallarda bir xil ma'lumotli ustunlarni **bir xil tipda** e'lon qiling — ular bo'yicha `JOIN` tezroq (37-bobda: tashqi kalit uchun tiplar mos bo'lishi shart);
- iloji bo'lsa ustunlarni `NOT NULL` qiling; `NULL` haqiqatan kerak bo'lsa — ishlating, faqat har ustunda `NULL` ga ruxsat beradigan sukutdan qoching.

> **Eslatma.** Birinchi, ikkinchi, uchinchi normal shakllarning formal ta'riflari bu qo'llanmada tayanilgan rasmiy hujjatlarda (PostgreSQL, MySQL, SQLite) berilmagan. MySQL hujjati faqat 3NF ni nomlaydi. Shuning uchun bu bob formal nazariyaga emas, hujjatdagi amaliy tavsiyaga va quyidagi sinovga tayanadi.

### Takrorlash nima muammo keltiradi

Bitta fakt bir necha qatorda saqlansa, uni o'zgartirish **har bir** nusxani o'zgartirishni talab qiladi. Bittasi unutilsa — baza o'ziga zid bo'lib qoladi: bir mijozning ikki xil manzili. Yoki fakt faqat bitta qatorda bo'lsa va shu qator o'chirilsa — fakt ham yo'qoladi. Quyidagi "Kod" bo'limida ikkalasi real ko'rsatiladi.

### Massiv va JSON o'rniga jadval

Bu tavsiya to'g'ridan-to'g'ri PostgreSQL hujjatidan:

- **massivlar** (36-bob): "Massivlar to'plam emas; muayyan elementlarni qidirish noto'g'ri loyihaning belgisi bo'lishi mumkin. Har element uchun bitta qatorli alohida jadvalni ko'rib chiqing";
- **JSON** (35-bob): hujjatlar taxminan bir xil tuzilishda bo'lsin; har yangilash butun qatorni qulflaydi, shuning uchun hujjat boshqariladigan o'lchamda bo'lsin; ideal holatda bitta hujjat — mustaqil o'zgartiriladigan qismlarga bo'linmaydigan "atom" ma'lumot.

Amaliy savollar ro'yxati (hujjatdagi tavsiyalardan kelib chiqqan):

| Savol | Ha bo'lsa |
| --- | --- |
| Element bo'yicha qidirasizmi, filtrlaysizmi? | Alohida jadval (massiv emas) |
| Elementga tashqi kalit kerakmi (faqat ruxsat etilgan teglar)? | Alohida jadval |
| Elementni alohida o'zgartirasizmi? | Alohida jadval yoki ustun |
| Ma'lumot har doim butunligicha o'qiladimi va tuzilishi o'zgaruvchanmi? | JSON mos keladi |
| Maydon har qatorda bor va tipi aniq? | Oddiy ustun |

### Denormalizatsiya: qachon va qanday

MySQL hujjati denormalizatsiyaga ruxsat beradi, lekin **narxini** ham aytadi: ma'lumotning bir nechta nusxasini saqlash va ularni moslab turish xarajati. Yo'llari:

- **yig'ma jadval** — oldindan hisoblangan natijalar (kunlik savdo);
- PostgreSQL'da — **materialized view** (17-bob): yig'ma jadvalni `REFRESH MATERIALIZED VIEW` bilan yangilash;
- **takrorlangan ustun** — masalan, buyurtma qatoridagi narx (37-bob). Bu holat alohida: bu takrorlash emas, **boshqa fakt** — "sotilgan paytdagi narx".

## Kod

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/38-2-kod.jpg">
    <source src="/video/sql/38-2-kod.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/38-2-kod.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/38-2-kod.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>38.2-video. Normalizatsiya amaliyoti va anomaliyalar sinovi</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan — natijalar uchala tizimda bir xil (tartibi `DISTINCT` da farq qilishi mumkin). Natijalar PostgreSQL'dan.

### Takrorlangan ("tekis") jadval

```sql
CREATE TABLE buyurtma_tekis (
    buyurtma_id int PRIMARY KEY, sana date,
    mijoz_ism varchar(30), mijoz_tel varchar(20), mijoz_manzil varchar(60),
    mahsulot varchar(30), narx int, soni int
);
INSERT INTO buyurtma_tekis VALUES
 (1, '2026-02-01', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Daftar', 12000, 2),
 (2, '2026-02-03', 'Ali',  '+998901234567', 'Toshkent, Navoiy 12',   'Kitob',  85000, 1),
 (3, '2026-02-05', 'Vali', '+998907654321', 'Samarqand, Registon 5', 'Daftar', 12000, 3);
```

`Ali` ning ismi, telefoni, manzili ikki qatorda takrorlangan; `Daftar` va uning narxi ham.

**O'zgartirish muammosi.** Ali ko'chdi, manzil faqat bitta buyurtmada yangilandi:

```sql
UPDATE buyurtma_tekis SET mijoz_manzil = 'Toshkent, Amir Temur 1' WHERE buyurtma_id = 2;
SELECT DISTINCT mijoz_ism, mijoz_manzil FROM buyurtma_tekis WHERE mijoz_ism = 'Ali';
```

```text
 mijoz_ism |      mijoz_manzil      
-----------+------------------------
 Ali       | Toshkent, Amir Temur 1
 Ali       | Toshkent, Navoiy 12
(2 rows)
```

Endi baza Ali ning **ikki xil** manzilini "biladi" — qaysi biri to'g'ri? Hech qanday cheklov buni to'xtatmadi.

**O'chirish muammosi.** Vali ning yagona buyurtmasi bekor qilindi:

```sql
DELETE FROM buyurtma_tekis WHERE buyurtma_id = 3;
SELECT count(*) AS vali_haqida FROM buyurtma_tekis WHERE mijoz_ism = 'Vali';
```

```text
 vali_haqida 
-------------
           0
(1 row)
```

Buyurtma bilan birga Vali ning telefoni va manzili ham yo'qoldi — mijoz haqidagi ma'lumot buyurtmaga "bog'lab" qo'yilgan edi.

### Normallashgan tuzilma

Hujjatdagi tavsiya bo'yicha: har fakt — o'z jadvalida, boshqa joyda — ID.

```sql
CREATE TABLE mijozlar (
    id int PRIMARY KEY, ism varchar(30) NOT NULL,
    tel varchar(20) NOT NULL, manzil varchar(60)
);
CREATE TABLE mahsulotlar (id int PRIMARY KEY, nom varchar(30) NOT NULL UNIQUE, narx int NOT NULL);
CREATE TABLE buyurtmalar (
    id int PRIMARY KEY,
    mijoz_id int NOT NULL REFERENCES mijozlar (id),
    sana date NOT NULL
);
CREATE TABLE buyurtma_qatorlari (
    buyurtma_id int REFERENCES buyurtmalar (id),
    mahsulot_id int REFERENCES mahsulotlar (id),
    narx int NOT NULL,          -- sotilgan paytdagi narx: alohida fakt
    soni int NOT NULL,
    PRIMARY KEY (buyurtma_id, mahsulot_id)
);
INSERT INTO mijozlar VALUES
    (1, 'Ali',  '+998901234567', 'Toshkent, Navoiy 12'),
    (2, 'Vali', '+998907654321', 'Samarqand, Registon 5');
INSERT INTO mahsulotlar VALUES (1, 'Daftar', 12000), (2, 'Kitob', 85000);
INSERT INTO buyurtmalar VALUES (1, 1, '2026-02-01'), (2, 1, '2026-02-03'), (3, 2, '2026-02-05');
INSERT INTO buyurtma_qatorlari VALUES (1, 1, 12000, 2), (2, 2, 85000, 1), (3, 1, 12000, 3);
```

Manzil endi **bir joyda** o'zgaradi va hamma buyurtmada ko'rinadi:

```sql
UPDATE mijozlar SET manzil = 'Toshkent, Amir Temur 1' WHERE id = 1;

SELECT b.id, b.sana, m.ism, m.manzil, p.nom, q.narx, q.soni
FROM buyurtmalar b
JOIN mijozlar m           ON m.id = b.mijoz_id
JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
JOIN mahsulotlar p        ON p.id = q.mahsulot_id
ORDER BY b.id;
```

```text
 id |    sana    | ism  |         manzil         |  nom   | narx  | soni 
----+------------+------+------------------------+--------+-------+------
  1 | 2026-02-01 | Ali  | Toshkent, Amir Temur 1 | Daftar | 12000 |    2
  2 | 2026-02-03 | Ali  | Toshkent, Amir Temur 1 | Kitob  | 85000 |    1
  3 | 2026-02-05 | Vali | Samarqand, Registon 5  | Daftar | 12000 |    3
(3 rows)
```

Buyurtma o'chirilsa, mijoz qoladi:

```sql
DELETE FROM buyurtma_qatorlari WHERE buyurtma_id = 3;
DELETE FROM buyurtmalar WHERE id = 3;
SELECT ism, tel FROM mijozlar WHERE id = 2;
```

```text
 ism  |      tel      
------+---------------
 Vali | +998907654321
(1 row)
```

To'rt jadval va uchta `JOIN` — "tekis" jadvalning bitta `SELECT *` idan murakkabroq. Bu narx: yaxlitlik uchun `JOIN`. Hujjat tavsiyasi aynan shu: ID ni takrorlab, so'rovda `JOIN` qilish.

### Denormalizatsiya: yig'ma jadval va uning narxi

Hisobot uchun kunlik savdo oldindan hisoblanadi:

```sql
CREATE TABLE kunlik_savdo (sana date PRIMARY KEY, buyurtmalar int NOT NULL, summa int NOT NULL);
INSERT INTO kunlik_savdo
SELECT b.sana, count(DISTINCT b.id), sum(q.narx * q.soni)
FROM buyurtmalar b JOIN buyurtma_qatorlari q ON q.buyurtma_id = b.id
GROUP BY b.sana;
SELECT * FROM kunlik_savdo ORDER BY sana;
```

```text
    sana    | buyurtmalar | summa 
------------+-------------+-------
 2026-02-01 |           1 | 24000
 2026-02-03 |           1 | 85000
(2 rows)
```

Hisobot endi `JOIN` va `GROUP BY` siz o'qiladi. Lekin bu — ma'lumotning **ikkinchi nusxasi**. Asl jadval o'zgarsa, yig'ma jadval o'z-o'zidan yangilanmaydi (alohida sinov):

```sql
-- b: bitta 24000 lik buyurtma; kunlik_savdo undan yaratilgan
INSERT INTO b VALUES (2, '2026-02-01', 5000);
SELECT k.summa AS jadvalda, (SELECT sum(summa) FROM b WHERE sana = k.sana) AS haqiqiy FROM kunlik_savdo k;
```

```text
 jadvalda | haqiqiy 
----------+---------
    24000 |   29000
(1 row)
```

Hujjat aytgan "nusxalarni moslab turish xarajati" — shu. Yechimlar: davriy qayta hisoblash (`REFRESH MATERIALIZED VIEW`, 17-bob), trigger (57-bob) yoki ilova. Qaysi biri bo'lsa ham — bu qo'shimcha kod va xato manbai. Shuning uchun denormalizatsiya — o'lchab ko'rilgan (45–47-boblar) tezlik muammosiga javob, boshlang'ich loyiha emas.

## Dialektlar

<figure class="video">
  <video controls preload="metadata" poster="/video/sql/38-3-dialektlar.jpg">
    <source src="/video/sql/38-3-dialektlar.mp4" type="video/mp4">
    <track kind="subtitles" src="/video/sql/38-3-dialektlar.uz.vtt" srclang="uz" label="O'zbekcha" default>
    <track kind="chapters" src="/video/sql/38-3-dialektlar.chapters.vtt" srclang="uz" label="Bo'limlar">
  </video>
  <figcaption>38.3-video. Dialektlar: MySQL, SQLite va PostgreSQL farqlari</figcaption>
</figure>

Normalizatsiya — tizimga bog'liq bo'lmagan loyihalash qoidasi. Yuqoridagi barcha so'rovlar uchala tizimda bir xil ishladi. Farqlar loyihaga ta'sir qiladigan joylarda:

### MySQL

- Hujjatdagi normalizatsiya tavsiyasi aynan MySQL qo'llanmasidan (unumdorlik bo'limi).
- **Materialized view yo'q** (17-bob) — yig'ma jadval oddiy jadval sifatida yaratiladi va trigger yoki rejalashtirilgan vazifa bilan yangilanadi.
- `JOIN` ustunlari bir xil tip va (satrlarda) bir xil belgilar to'plami/collation'da bo'lishi muhim — tashqi kalit uchun bu shart (37-bob).

### SQLite

- Tashqi kalitlar faqat `PRAGMA foreign_keys = ON` bilan tekshiriladi (14-bob) — usiz normallashgan tuzilmada ham yo'q mijozga buyurtma yozish mumkin.
- Materialized view yo'q — yig'ma jadval va trigger.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Tashqi kalit bilan yaxlitlik | Doim | InnoDB'da doim | `PRAGMA foreign_keys = ON` |
| Yig'ma ma'lumot | Materialized view, jadval | Jadval + trigger | Jadval + trigger |
| Massiv o'rniga | Alohida jadval (hujjat tavsiyasi) | Alohida jadval (massiv tipi yo'q) | Alohida jadval |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Mijoz ma'lumotini har buyurtmada takrorlash | Bir mijozda bir nechta "haqiqat"; buyurtma o'chsa mijoz yo'qoladi | `mijozlar` jadvali + `mijoz_id` |
| "Tezroq bo'ladi" deb boshidan denormalizatsiya | Nusxalarni moslash kodi, nomuvofiqlik xavfi | Avval normal tuzilma, o'lchab ko'rib keyin |
| Buyurtma qatorida narxni saqlamaslik | Narx o'zgarsa tarix buziladi | Sotilgan narx — alohida fakt |
| Yig'ma jadvalni yaratib, yangilashni unutish | Hisobot noto'g'ri | `REFRESH`, trigger yoki rejalashtirilgan vazifa |
| Bog'lovchi ustunlar turli tipda (`int` va `bigint`, turli collation) | `JOIN` sekinroq; MySQL'da tashqi kalit yaratilmaydi | Bir xil tip |
| Teg, rol, kategoriyani massiv/JSON'da saqlab, ular bo'yicha qidirish | Hujjat: noto'g'ri loyiha belgisi | Alohida jadval (36-bob) |
| Har ustunga `NULL` ga ruxsat (sukut) | Hujjat: indekslar yomonroq ishlatiladi, ortiqcha tekshiruv | `NOT NULL`, `NULL` faqat kerak joyda |

## Amaliyot

1. Quyidagi "tekis" jadvalni normallashtiring: `kurs_yozuvlari (talaba_ism, talaba_email, kurs_nomi, oqituvchi, oqituvchi_tel, baho)`. Nechta jadval chiqdi? Har biriga birlamchi va tashqi kalitlarni qo'ying.
2. Tekis jadvalda bitta o'qituvchining telefonini faqat bitta qatorda o'zgartiring va nomuvofiqlikni `SELECT DISTINCT` bilan ko'rsating. Normallashgan variantda bu mumkinmi?
3. Normallashgan tuzilmada "har kurs bo'yicha o'rtacha baho" hisobotini yozing. Keyin uni PostgreSQL'da materialized view qiling va yangi baho qo'shgandan keyin `REFRESH` siz va bilan natijani solishtiring.
4. 36-bobdagi `maqolalar.teglar text[]` ni hujjat tavsiyasiga ko'ra alohida jadvallarga ajrating.
5. MySQL'da `mijozlar.id int` va `buyurtmalar.mijoz_id bigint` bilan tashqi kalit yaratib ko'ring. Xato matnini o'qing.

## Rasmiy hujjat

- MySQL — 10.4.1 Optimizing Data Size (Normalization, Joins, Table Columns): <https://dev.mysql.com/doc/refman/9.7/en/data-size.html>
- PostgreSQL — 8.15. Arrays ("Arrays are not sets" maslahati): <https://www.postgresql.org/docs/18/arrays.html>
- PostgreSQL — 8.14.2. Designing JSON Documents: <https://www.postgresql.org/docs/18/datatype-json.html#JSON-DOC-DESIGN>
