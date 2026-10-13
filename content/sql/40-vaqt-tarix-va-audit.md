# 40 — Vaqt, tarix va audit

[← Oldingi: Birlamchi kalitni tanlash](39-birlamchi-kalitni-tanlash.md) · [Mundarija](README.md)

## Tushuncha

Ko'p ma'lumot vaqtga bog'liq: narx yanvarda bir xil, fevralda boshqa; xodim maoshi o'zgaradi; foydalanuvchi o'chiriladi, lekin uning izi qolishi kerak. Bu bobda uchta loyihalash usuli:

1. **Temporal kalitlar** — qiymat **qaysi davrda** amal qilishini saqlash va davrlar kesishmasligini kafolatlash (PostgreSQL 18).
2. **Audit ustunlari va audit jadvali** — qator qachon yaratilgan/o'zgargan va kim nima o'zgartirgan.
3. **Yumshoq o'chirish** (soft delete) — qatorni o'chirmasdan "o'chirilgan" deb belgilash va unga **qisman unique indeks**.

### Temporal kalitlar: `WITHOUT OVERLAPS`

PostgreSQL `CREATE TABLE` hujjatiga ko'ra `PRIMARY KEY` yoki `UNIQUE` ning **oxirgi** ustuni `WITHOUT OVERLAPS` bilan belgilansa:

- bu ustun **tenglik** emas, **kesishish** bo'yicha tekshiriladi;
- qolgan ustunlarda takrorlar ruxsat etiladi — faqat `WITHOUT OVERLAPS` ustunida davrlar kesishmasa;
- hujjat: "agar ustun sanalar yoki vaqtlar oralig'i bo'lsa, bu ba'zan **temporal kalit** deyiladi";
- amalda u `UNIQUE` emas, **`EXCLUDE`** cheklovi bilan bajariladi: `UNIQUE (id, valid_at WITHOUT OVERLAPS)` = `EXCLUDE USING GIST (id WITH =, valid_at WITH &&)` (36-bob);
- ustun range yoki multirange tipida bo'lishi kerak; bo'sh oraliqqa ruxsat yo'q;
- oddiy ustunlar (masalan, `int`) uchun hujjat `btree_gist` kengaytmasini "kutilgan usul" deydi.

### Temporal tashqi kalit: `PERIOD`

Hujjatga ko'ra tashqi kalitning oxirgi ustuni `PERIOD` bilan belgilansa:

- oddiy ustunlar tenglik bo'yicha solishtiriladi;
- `PERIOD` ustuni esa **qamrov** bo'yicha: ota jadvalda mos qatorlar bo'lishi va ularning **birgalikdagi** davrlari bola qatorning davrini **to'liq qoplashi** kerak. Hujjat: "murojaat butun davomiyligi davomida ota qatorga ega bo'lishi kerak";
- ota jadvaldagi kalit `WITHOUT OVERLAPS` bilan e'lon qilingan bo'lishi kerak.

### Audit ustunlari

Eng sodda tarix — har qatorda `yaratilgan` va `yangilangan` vaqtlari:

- `yaratilgan` — `DEFAULT now()` / `CURRENT_TIMESTAMP` (12-bob);
- `yangilangan` — har o'zgarishda yangilanishi kerak. PostgreSQL va SQLite'da buning uchun **trigger** kerak (57-bob). MySQL'da ustun xususiyati bor: `ON UPDATE CURRENT_TIMESTAMP`.

MySQL hujjatiga ko'ra avtomatik yangilanadigan ustun qatorning **boshqa biror ustuni haqiqatan o'zgarganda** yangilanadi; barcha ustunlar o'z joriy qiymatiga teng qilib yozilsa — o'zgarmaydi.

### Audit jadvali

PostgreSQL PL/pgSQL hujjatida tayyor misol bor (Example 41.4): `emp` jadvalidagi har `INSERT`, `UPDATE`, `DELETE` `emp_audit` ga yoziladi — joriy vaqt, foydalanuvchi nomi va amal turi bilan. Trigger funksiyasi `TG_OP` maxsus o'zgaruvchisi bo'yicha amalni aniqlaydi; `OLD` — o'zgarishdan oldingi, `NEW` — keyingi qator. Bu `AFTER` trigger, shuning uchun qaytgan qiymat e'tiborsiz qoldiriladi (`RETURN NULL`).

Audit jadvalining afzalligi: tarix ilova kodiga bog'liq emas — har qanday dastur, qo'lda yozilgan `UPDATE` ham qayd qilinadi. Triggerlar batafsil 57-bobda.

### Yumshoq o'chirish va qisman unique indeks

Qator o'chirilmaydi, `ochirilgan` ustuniga vaqt yoziladi. Muammo: `UNIQUE (email)` bo'lsa, o'chirilgan foydalanuvchining email'i bilan yangi foydalanuvchi ro'yxatdan o'ta olmaydi.

PostgreSQL hujjatidagi **qisman unique indeks** (partial unique index) aynan shuni hal qiladi: indeks faqat `WHERE` shartiga mos qatorlarni o'z ichiga oladi va **faqat ular orasida** noyoblikni talab qiladi. Hujjatdagi misol: har (fan, maqsad) uchun faqat **bitta muvaffaqiyatli** test, muvaffaqiyatsizlari esa istalgancha:

```sql
CREATE UNIQUE INDEX tests_success_constraint ON tests (subject, target) WHERE success;
```

Yumshoq o'chirish uchun: `… ON foydalanuvchilar (email) WHERE ochirilgan IS NULL` — faqat **faol** foydalanuvchilar orasida email noyob. Indekslar 41–44-boblarda.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan.

### `WITHOUT OVERLAPS`: narx tarixi

```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE narxlar (
    mahsulot_id int,
    amal_davri  daterange,
    narx        int NOT NULL,
    PRIMARY KEY (mahsulot_id, amal_davri WITHOUT OVERLAPS)
);
INSERT INTO narxlar VALUES
    (1, '[2026-01-01,2026-02-01)', 12000),
    (1, '[2026-02-01,)',           13000),   -- 1-fevraldan cheksiz
    (2, '[2026-01-01,)',           85000);

INSERT INTO narxlar VALUES (1, '[2026-01-15,2026-01-20)', 11000);
```

```text
ERROR:  conflicting key value violates exclusion constraint "narxlar_pkey"
DETAIL:  Key (mahsulot_id, amal_davri)=(1, [2026-01-15,2026-01-20)) conflicts with existing key (mahsulot_id, amal_davri)=(1, [2026-01-01,2026-02-01)).
```

Bir mahsulotning ikki narxi bir kunda amal qila olmaydi. Xato nomi `exclusion constraint` — hujjatda aytilganidek, birlamchi kalit ichkarida `EXCLUDE` sifatida bajariladi.

Muayyan sanadagi narx:

```sql
SELECT narx FROM narxlar WHERE mahsulot_id = 1 AND amal_davri @> date '2026-01-20';
SELECT narx FROM narxlar WHERE mahsulot_id = 1 AND amal_davri @> date '2026-03-05';
```

```text
 narx  
-------
 12000
(1 row)

 narx  
-------
 13000
(1 row)
```

### `PERIOD`: tashqi kalit davr bo'yicha

Aksiya faqat mahsulotning narxi amal qilgan davrda bo'lishi mumkin:

```sql
CREATE TABLE aksiyalar (
    id int PRIMARY KEY,
    mahsulot_id int,
    davr daterange,
    FOREIGN KEY (mahsulot_id, PERIOD davr) REFERENCES narxlar (mahsulot_id, PERIOD amal_davri)
);
INSERT INTO aksiyalar VALUES (1, 1, '[2026-01-25,2026-02-10)');   -- ok
INSERT INTO aksiyalar VALUES (2, 2, '[2025-12-25,2026-01-10)');
```

```text
ERROR:  insert or update on table "aksiyalar" violates foreign key constraint "aksiyalar_mahsulot_id_davr_fkey"
DETAIL:  Key (mahsulot_id, davr)=(2, [2025-12-25,2026-01-10)) is not present in table "narxlar".
```

- 1-aksiya ikki narx qatorini kesib o'tadi (yanvar va fevral), lekin ular **birgalikda** davrni to'liq qoplaydi — qabul qilindi.
- 2-aksiya 2025-yil dekabrdan boshlanadi, 2-mahsulotning narxi esa 2026-01-01 dan — qoplanmagan qism bor, rad etildi.

### Audit ustunlari (PostgreSQL: trigger)

```sql
CREATE TABLE xodimlar (
    id int PRIMARY KEY, ism text NOT NULL, maosh int,
    yaratilgan  timestamptz NOT NULL DEFAULT now(),
    yangilangan timestamptz NOT NULL DEFAULT now()
);

CREATE FUNCTION yangilangan_belgila() RETURNS trigger AS $$
BEGIN
    NEW.yangilangan := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xodimlar_yangilangan
    BEFORE UPDATE ON xodimlar
    FOR EACH ROW EXECUTE FUNCTION yangilangan_belgila();
```

`BEFORE` trigger yoziladigan qatorni (`NEW`) o'zgartira oladi va uni qaytaradi — shu qator saqlanadi.

### Audit jadvali (hujjatdagi Example 41.4 asosida)

```sql
CREATE TABLE xodimlar_audit (
    amal char(1) NOT NULL, vaqt timestamptz NOT NULL, kim text NOT NULL,
    id int, ism text, maosh int
);

CREATE FUNCTION xodimlar_audit_yoz() RETURNS trigger AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO xodimlar_audit SELECT 'D', now(), current_user, OLD.id, OLD.ism, OLD.maosh;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO xodimlar_audit SELECT 'U', now(), current_user, NEW.id, NEW.ism, NEW.maosh;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO xodimlar_audit SELECT 'I', now(), current_user, NEW.id, NEW.ism, NEW.maosh;
    END IF;
    RETURN NULL;   -- AFTER trigger: natija e'tiborsiz
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER xodimlar_audit
    AFTER INSERT OR UPDATE OR DELETE ON xodimlar
    FOR EACH ROW EXECUTE FUNCTION xodimlar_audit_yoz();

INSERT INTO xodimlar (id, ism, maosh) VALUES (1, 'Ali', 5000), (2, 'Vali', 4000);
SELECT pg_sleep(1.1);
UPDATE xodimlar SET maosh = 5500 WHERE id = 1;
DELETE FROM xodimlar WHERE id = 2;

SELECT id, maosh, yangilangan > yaratilgan AS yangilandi FROM xodimlar;
SELECT amal, kim, id, ism, maosh FROM xodimlar_audit ORDER BY vaqt, amal DESC, id;
```

```text
 id | maosh | yangilandi 
----+-------+------------
  1 |  5500 | t
(1 row)

 amal |   kim    | id | ism  | maosh 
------+----------+----+------+-------
 I    | postgres |  1 | Ali  |  5000
 I    | postgres |  2 | Vali |  4000
 U    | postgres |  1 | Ali  |  5500
 D    | postgres |  2 | Vali |  4000
(4 rows)
```

`Vali` jadvaldan o'chdi, lekin audit jadvalida u haqida to'liq tarix qoldi. (`pg_sleep` — `yangilangan` va `yaratilgan` farqini ko'rsatish uchun; `now()` tranzaksiya boshidagi vaqt, 34-bob.)

### Yumshoq o'chirish va qisman unique indeks

```sql
CREATE TABLE foydalanuvchilar (id int PRIMARY KEY, email text NOT NULL, ochirilgan timestamptz);
CREATE UNIQUE INDEX foydalanuvchilar_email_faol ON foydalanuvchilar (email) WHERE ochirilgan IS NULL;

INSERT INTO foydalanuvchilar VALUES (1, 'ali@misol.uz', NULL);
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);       -- ikkita faol — rad
UPDATE foydalanuvchilar SET ochirilgan = now() WHERE id = 1;          -- yumshoq o'chirish
INSERT INTO foydalanuvchilar VALUES (2, 'ali@misol.uz', NULL);       -- endi mumkin
SELECT id, email, ochirilgan IS NOT NULL AS ochirilganmi FROM foydalanuvchilar ORDER BY id;
```

```text
ERROR:  duplicate key value violates unique constraint "foydalanuvchilar_email_faol"
DETAIL:  Key (email)=(ali@misol.uz) already exists.
UPDATE 1
 id |    email     | ochirilganmi 
----+--------------+--------------
  1 | ali@misol.uz | t
  2 | ali@misol.uz | f
(2 rows)
```

Bir email'li ikki qator bor, lekin faqat bittasi faol.

## Dialektlar

### MySQL

**Temporal kalitlar yo'q.** `WITHOUT OVERLAPS`, `PERIOD` va `EXCLUDE` MySQL'da yo'q:

```text
ERROR 1064 (42000) at line 1: … near 'WITHOUT OVERLAPS))' at line 1
```

Davrlar `boshi`/`oxiri` ustunlarida saqlanadi; kesishmaslik qoidasi tranzaksiya va qulf bilan tekshiriladi (53, 55-boblar).

**`ON UPDATE CURRENT_TIMESTAMP` — trigger shart emas:**

```sql
CREATE TABLE xodimlar (
    id int PRIMARY KEY, ism varchar(30) NOT NULL, maosh int,
    yaratilgan  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    yangilangan DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Hujjatdagi qoida sinovda ko'rindi — qiymat o'zgarmasa, vaqt ham yangilanmaydi:

```sql
UPDATE xodimlar SET maosh = 5000 WHERE id = 1;   -- maosh allaqachon 5000
SELECT ROW_COUNT() AS ozgardi, yangilangan > yaratilgan AS yangilandi FROM xodimlar WHERE id = 1;
UPDATE xodimlar SET maosh = 5500 WHERE id = 1;
SELECT maosh, yangilangan > yaratilgan AS yangilandi FROM xodimlar WHERE id = 1;
```

```text
+---------+------------+
| ozgardi | yangilandi |
+---------+------------+
|       0 |          0 |
+---------+------------+
+-------+------------+
| maosh | yangilandi |
+-------+------------+
|  5500 |          1 |
+-------+------------+
```

**Audit triggerlari.** MySQL'da bitta trigger bitta hodisaga (`INSERT`, `UPDATE` yoki `DELETE`) — uchta trigger; `OLD`/`NEW` hujjatga ko'ra MySQL kengaytmalari, `INSERT` da faqat `NEW`, `DELETE` da faqat `OLD`:

```sql
CREATE TRIGGER xa_i AFTER INSERT ON xodimlar FOR EACH ROW
    INSERT INTO xodimlar_audit VALUES ('I', NOW(), CURRENT_USER(), NEW.id, NEW.ism, NEW.maosh);
CREATE TRIGGER xa_u AFTER UPDATE ON xodimlar FOR EACH ROW
    INSERT INTO xodimlar_audit VALUES ('U', NOW(), CURRENT_USER(), NEW.id, NEW.ism, NEW.maosh);
CREATE TRIGGER xa_d AFTER DELETE ON xodimlar FOR EACH ROW
    INSERT INTO xodimlar_audit VALUES ('D', NOW(), CURRENT_USER(), OLD.id, OLD.ism, OLD.maosh);
```

```text
+------+----------------+------+------+-------+
| amal | kim            | id   | ism  | maosh |
+------+----------------+------+------+-------+
| I    | root@localhost |    1 | Ali  |  5000 |
| I    | root@localhost |    2 | Vali |  4000 |
| U    | root@localhost |    1 | Ali  |  5000 |
| U    | root@localhost |    1 | Ali  |  5500 |
| D    | root@localhost |    2 | Vali |  4000 |
+------+----------------+------+------+-------+
```

E'tibor bering: hech narsani o'zgartirmagan `UPDATE … SET maosh = 5000` (`ROW_COUNT() = 0`, vaqt ham yangilanmadi) uchun ham `AFTER UPDATE` trigger **ishladi** va audit jadvalida `U | 5000` qatori paydo bo'ldi. Kerak bo'lsa, trigger ichida `OLD` va `NEW` ni solishtirish kerak.

**Qisman indeks yo'q:**

```text
ERROR 1064 (42000) at line 20: … near 'WHERE ochirilgan IS NULL' at line 1
```

Yumshoq o'chirishda email noyobligi uchun MySQL'da boshqa yechim kerak (43-bobda — funksional indekslar).

### SQLite

**Temporal kalitlar va range tiplari yo'q** (36-bob).

**`yangilangan` — trigger bilan.** Hujjatdagi sintaksisga ko'ra SQLite trigger tanasida faqat `UPDATE`, `INSERT`, `DELETE` va `SELECT` operatorlari bo'ladi — `NEW` ga qiymat berish yo'q. Shuning uchun `AFTER UPDATE` ichida qatorni qayta yangilash va cheksiz takrorlanishdan saqlash uchun `WHEN` sharti:

```sql
CREATE TABLE xodimlar (id INTEGER PRIMARY KEY, ism TEXT NOT NULL, maosh INT,
    yaratilgan  TEXT NOT NULL DEFAULT (datetime('now', 'subsec')),
    yangilangan TEXT NOT NULL DEFAULT (datetime('now', 'subsec')));

CREATE TRIGGER x_yangilangan AFTER UPDATE ON xodimlar
FOR EACH ROW WHEN NEW.yangilangan = OLD.yangilangan
BEGIN
    UPDATE xodimlar SET yangilangan = datetime('now', 'subsec') WHERE id = NEW.id;
END;
```

**Audit triggerlari** — MySQL kabi har hodisaga alohida. `UPDATE OF ism, maosh` — hujjatga ko'ra trigger faqat shu ustunlar `SET` ning chap tomonida bo'lsa ishlaydi. Shu tufayli `x_yangilangan` triggerining ichki `UPDATE … SET yangilangan` i audit'ga ikkinchi qator yozmaydi:

```sql
CREATE TRIGGER xa_i AFTER INSERT ON xodimlar
BEGIN INSERT INTO xodimlar_audit VALUES ('I', datetime('now'), NEW.id, NEW.ism, NEW.maosh); END;
CREATE TRIGGER xa_u AFTER UPDATE OF ism, maosh ON xodimlar
BEGIN INSERT INTO xodimlar_audit VALUES ('U', datetime('now'), NEW.id, NEW.ism, NEW.maosh); END;
CREATE TRIGGER xa_d AFTER DELETE ON xodimlar
BEGIN INSERT INTO xodimlar_audit VALUES ('D', datetime('now'), OLD.id, OLD.ism, OLD.maosh); END;
```

Natija PostgreSQL bilan bir xil: `yangilandi = 1`, audit'da `I, I, U, D`.

**Qisman unique indeks bor** — natija PostgreSQL bilan bir xil: ikkinchi faol `ali@misol.uz` rad etildi (`UNIQUE constraint failed: foydalanuvchilar.email`), yumshoq o'chirishdan keyin qabul qilindi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `WITHOUT OVERLAPS` (temporal PK/UNIQUE) | Ha (18) | Yo'q | Yo'q |
| `PERIOD` tashqi kalit | Ha (18) | Yo'q | Yo'q |
| `EXCLUDE` | Ha | Yo'q | Yo'q |
| Avtomatik `yangilangan` | `BEFORE UPDATE` trigger | `ON UPDATE CURRENT_TIMESTAMP` | `AFTER UPDATE` trigger + `WHEN` |
| Bitta trigger bir nechta hodisaga | Ha (`INSERT OR UPDATE OR DELETE`, `TG_OP`) | Yo'q | Yo'q |
| Trigger faqat ma'lum ustunlar o'zgarganda | — | — | `UPDATE OF ustunlar` (sinalgan) |
| Qisman unique indeks | Ha | Yo'q | Ha |

`—` — bu bobda sinalmagan (57-bobda). O'zgarishsiz `UPDATE` da audit yozmaslik uchun PostgreSQL `CREATE TRIGGER` hujjatida `WHEN (OLD.* IS DISTINCT FROM NEW.*)` misoli bor.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Narx/maosh tarixini faqat joriy qiymat sifatida saqlash | Eski buyurtmalar, hisobotlar uchun o'tgan qiymat yo'q | Davrli jadval (`amal_davri`) yoki audit jadvali |
| Davrlarni `[boshi, oxiri]` (ikkala chegara kiradi) | Ketma-ket davrlar tutashgan kunda "kesishadi" | `[boshi, oxiri)` (36-bob) |
| Kesishmaslikni faqat ilovada tekshirish | Parallel so'rovlarda buziladi | PG: `WITHOUT OVERLAPS` / `EXCLUDE` |
| `yangilangan` ni ilova kodida qo'lda yozish | Qo'lda `UPDATE` yoki boshqa dastur unutadi | Trigger yoki `ON UPDATE CURRENT_TIMESTAMP` |
| Audit triggeri o'zgarishsiz `UPDATE` ni ham yozadi | Audit jadvali "bo'sh" yozuvlarga to'ladi | `OLD` va `NEW` ni solishtirish (PG'da `WHEN (OLD.* IS DISTINCT FROM NEW.*)`, 57-bob) |
| Yumshoq o'chirishda oddiy `UNIQUE (email)` | O'chirilgan foydalanuvchi email'ini qayta ishlatib bo'lmaydi | Qisman unique indeks `WHERE ochirilgan IS NULL` |
| Yumshoq o'chirilgan qatorlarni so'rovlarda unutish | "O'chirilgan" ma'lumot hisobotga tushadi | View: `WHERE ochirilgan IS NULL` (17-bob) |
| SQLite'da `AFTER UPDATE` ichida o'sha jadvalni `WHEN` siz yangilash | Takroriy ishga tushish xavfi | `WHEN NEW.x = OLD.x` sharti |

## Amaliyot

1. `maoshlar (xodim_id, davr daterange, summa)` jadvalini temporal birlamchi kalit bilan yarating. Bir xodimga kesishmaydigan uchta davr kiriting va kesishadiganini kiritib ko'ring.
2. Har xodimning 2026-02-15 dagi maoshini toping.
3. `loyiha_azolari (xodim_id, loyiha_id, davr)` jadvaliga `PERIOD` tashqi kalit qo'ying: xodim loyihada faqat ishlagan davrida a'zo bo'lishi mumkin.
4. Audit triggerini o'zgartiring: `UPDATE` da eski va yangi maoshni yozsin, va maosh o'zgarmasa hech narsa yozmasin.
5. MySQL'da `ON UPDATE CURRENT_TIMESTAMP` li jadvalda bitta ustunni o'z qiymatiga tenglab yangilang. Hujjatdagi "auto-updated column remains unchanged" qoidasini tekshiring. Vaqtni majburan yangilash uchun nima qilish kerak?
6. Yumshoq o'chirish uchun `faol_foydalanuvchilar` view'ini yarating va qisman indeks bilan birga ishlating.

## Rasmiy hujjat

- PostgreSQL — CREATE TABLE (`WITHOUT OVERLAPS`, `PERIOD`): <https://www.postgresql.org/docs/18/sql-createtable.html>
- PostgreSQL — 41.10. Trigger Functions (Example 41.4, audit): <https://www.postgresql.org/docs/18/plpgsql-trigger.html>
- PostgreSQL — 11.8. Partial Indexes (Example 11.3): <https://www.postgresql.org/docs/18/indexes-partial.html>
- MySQL — 13.2.5 Automatic Initialization and Updating for TIMESTAMP and DATETIME: <https://dev.mysql.com/doc/refman/9.7/en/timestamp-initialization.html>
- MySQL — 27.4.1 Trigger Syntax and Examples: <https://dev.mysql.com/doc/refman/9.7/en/trigger-syntax.html>
- SQLite — CREATE TRIGGER (`UPDATE OF`, `WHEN`): <https://www.sqlite.org/lang_createtrigger.html>
