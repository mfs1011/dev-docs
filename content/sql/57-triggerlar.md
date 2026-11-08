# 57 — Triggerlar

[← Oldingi: Funksiya va protseduralar](56-funksiya-va-protseduralar.md) · [Mundarija](README.md) · [Keyingi: Partitioning →](58-partitioning.md)

## Tushuncha

**Trigger** — jadvalda biror hodisa (`INSERT`, `UPDATE`, `DELETE`) sodir bo'lganda bazaning o'zi **avtomatik** bajaradigan kod. Ilova hech narsa chaqirmaydi: qator qo'shildi — trigger ishladi.

Tipik ishlatilishi:

- qiymatni yozishdan oldin tozalash yoki to'ldirish (e-pochtani kichik harfga);
- o'zgarishlar jurnali (audit);
- cheklov bilan ifodalab bo'lmaydigan tekshiruv;
- view orqali yozishni asosiy jadvalga yo'naltirish.

### PostgreSQL

PostgreSQL hujjati (37.1. Overview of Trigger Behavior) triggerlarni ikki o'q bo'yicha ajratadi:

| | Qator darajasi (`FOR EACH ROW`) | Operator darajasi (`FOR EACH STATEMENT`) |
| --- | --- | --- |
| Necha marta | Har o'zgargan qator uchun | Operatorga bir marta — **0 ta qator** o'zgarsa ham |
| `BEFORE` | Qator bilan ishlashdan **darhol oldin**; qatorni o'zgartira yoki o'tkazib yubora oladi | Operator hech narsa qilishdan oldin |
| `AFTER` | Operator **oxirida** (operator darajasidagi `AFTER` lardan oldin) | Operatorning eng oxirida |
| `INSTEAD OF` | Faqat **view**larda, faqat qator darajasida | — |

Hujjatdagi qoidalar:

- Trigger funksiyasi argumentsiz va `trigger` turini qaytaradigan qilib, triggerdan **oldin** yaratiladi.
- Qator darajasidagi `BEFORE` trigger:
  - `NULL` qaytarsa — joriy qator uchun amal **bajarilmaydi**;
  - qator qaytarsa — o'sha qator yoziladi (o'zgartirilgan bo'lishi mumkin);
  - hech narsani o'zgartirmoqchi bo'lmasa, kelgan qatorni (`NEW` yoki `DELETE` da `OLD`) qaytarishi shart.
- Operator darajasidagi trigger funksiyalari doim `NULL` qaytarishi kerak.
- Trigger uni chaqirgan operator bilan **bitta tranzaksiyada** bajariladi: operator yoki trigger xato bersa, ikkalasining ta'siri ham bekor qilinadi.
- `UPDATE OF ustun` — trigger faqat `SET` da shu ustun ko'rsatilganda ishlaydi.

`CREATE TRIGGER` hujjati qo'shimchalari:

- `REFERENCING NEW TABLE AS … / OLD TABLE AS …` — **transition jadvallari**: operator qo'shgan, o'chirgan yoki o'zgartirgan **barcha** qatorlar to'plami. Trigger operator nima qilganini bir qatorlab emas, butunlay ko'radi. Faqat oddiy jadvaldagi `AFTER` trigger uchun.
- Bir hodisaga bir xil turdagi bir nechta trigger bo'lsa — ular **nomi bo'yicha alifbo tartibida** ishlaydi.

### MySQL

MySQL hujjati (15.1.27 CREATE TRIGGER):

- Faqat `BEFORE` yoki `AFTER`, faqat `FOR EACH ROW`.
- Trigger doimiy jadvalga bog'lanadi — **`TEMPORARY` jadval yoki view'ga emas** (`INSTEAD OF` yo'q).
- Tartib — `FOLLOWS` / `PRECEDES` boshqa_trigger.
- Hujjatdagi eslatma: standart holatda **tashqi kalitning kaskad amallari** (`ON DELETE CASCADE` va h.k.) triggerlarni ishga tushirmaydi. SQL qatlamida tashqi kalit bilan ishlaydigan InnoDB jadvallarida (`innodb_native_foreign_keys=OFF`) sessiyada `enable_cascade_triggers=ON` bersa, `CASCADE` va `SET NULL` o'zgartirgan bola qatorlarda triggerlar ishlaydi.

### SQLite

SQLite hujjati (CREATE TRIGGER):

- Hozircha faqat **`FOR EACH ROW`**, `FOR EACH STATEMENT` yo'q — shuning uchun `FOR EACH ROW` ni yozish ixtiyoriy.
- `BEFORE` va `AFTER` — faqat oddiy jadvallarda, `INSTEAD OF` — faqat view'larda.
- Xato — `RAISE(ABORT | ROLLBACK | FAIL, 'xabar')` yoki `RAISE(IGNORE)`: belgilangan ON CONFLICT ishlovi bajariladi, so'rov to'xtaydi va ilovaga `SQLITE_CONSTRAINT` qaytadi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

```sql
CREATE TABLE mijozlar (id int PRIMARY KEY, email text NOT NULL, balans int NOT NULL DEFAULT 0);
CREATE TABLE jurnal (id serial PRIMARY KEY, amal text, mijoz_id int, eski int, yangi int);
```

### `BEFORE`: qatorni o'zgartirish

```sql
CREATE FUNCTION email_kichik() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    NEW.email := lower(NEW.email);
    RETURN NEW;
END $$;
CREATE TRIGGER b_email BEFORE INSERT OR UPDATE OF email ON mijozlar
    FOR EACH ROW EXECUTE FUNCTION email_kichik();
INSERT INTO mijozlar VALUES (1, 'Aziza@Misol.UZ', 1000), (2, 'BOBUR@misol.uz', 500) RETURNING *;
```

```text
 id |     email      | balans 
----+----------------+--------
  1 | aziza@misol.uz |   1000
  2 | bobur@misol.uz |    500
(2 rows)
```

Ilova katta harflar bilan yubordi — bazaga kichik harflar bilan yozildi (`RETURNING` yozilgan qatorni ko'rsatadi). `UPDATE OF email` — faqat `email` o'zgarganda.

### `AFTER`: audit jurnali

```sql
CREATE FUNCTION balans_jurnali() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO jurnal (amal, mijoz_id, eski, yangi) VALUES (TG_OP, NEW.id, OLD.balans, NEW.balans);
    RETURN NULL;
END $$;
CREATE TRIGGER a_jurnal AFTER UPDATE OF balans ON mijozlar
    FOR EACH ROW WHEN (OLD.balans IS DISTINCT FROM NEW.balans) EXECUTE FUNCTION balans_jurnali();
UPDATE mijozlar SET balans = balans - 100 WHERE id = 1;
UPDATE mijozlar SET balans = balans WHERE id = 2;
SELECT amal, mijoz_id, eski, yangi FROM jurnal;
```

```text
  amal  | mijoz_id | eski | yangi 
--------+----------+------+-------
 UPDATE |        1 | 1000 |   900
(1 row)
```

- `OLD` — o'zgarishdan oldingi qator, `NEW` — keyingi; `TG_OP` — amal nomi.
- `WHEN (…)` — trigger sharti: ikkinchi `UPDATE` balansni o'zgartirmadi — jurnalga yozilmadi.
- `AFTER` triggerning qaytargan qiymati e'tiborga olinmaydi — `NULL`.

### `BEFORE` `NULL` qaytarsa

```sql
CREATE FUNCTION manfiy_emas() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.balans < 0 THEN
        RETURN NULL;
    END IF;
    RETURN NEW;
END $$;
CREATE TRIGGER c_manfiy BEFORE UPDATE ON mijozlar FOR EACH ROW EXECUTE FUNCTION manfiy_emas();
UPDATE mijozlar SET balans = -5 WHERE id = 2;
SELECT id, balans FROM mijozlar ORDER BY id;
```

```text
UPDATE 0

 id | balans 
----+--------
  1 |    900
  2 |    500
(2 rows)
```

`UPDATE 0` — xato yo'q, lekin **hech narsa yangilanmadi**: trigger qatorni jimgina o'tkazib yubordi. Ilova "muvaffaqiyatli" javob oladi. Rad etish kerak bo'lsa — `RAISE EXCEPTION` (56-bob) yoki `CHECK` cheklovi; `NULL` faqat "e'tiborsiz qoldirish" ma'nosida kerak bo'lganda.

### Operator darajasi va transition jadvali

```sql
CREATE FUNCTION nechta_qoshildi() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE NOTICE 'operator % ta qator qo''shdi', (SELECT count(*) FROM yangilar);
    RETURN NULL;
END $$;
CREATE TRIGGER d_hisob AFTER INSERT ON mijozlar
    REFERENCING NEW TABLE AS yangilar FOR EACH STATEMENT EXECUTE FUNCTION nechta_qoshildi();
INSERT INTO mijozlar SELECT g, 'm' || g || '@misol.uz', 0 FROM generate_series(3, 1002) g;
```

```text
NOTICE:  operator 1000 ta qator qo'shdi
```

1000 qator — trigger **bir marta**, `yangilar` jadvalida barcha 1000 qator. Qator darajasidagi trigger bu ishni 1000 marta qilardi. Ommaviy yuklashda (21-bob) audit yoki yig'ma hisobni shunday qilish arzonroq.

### `INSTEAD OF`: view orqali yozish

```sql
CREATE VIEW mijoz_email AS SELECT id, email FROM mijozlar;
CREATE FUNCTION view_email() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    UPDATE mijozlar SET email = NEW.email WHERE id = OLD.id;
    RETURN NEW;
END $$;
CREATE TRIGGER e_view INSTEAD OF UPDATE ON mijoz_email FOR EACH ROW EXECUTE FUNCTION view_email();
UPDATE mijoz_email SET email = 'YANGI@misol.uz' WHERE id = 1;
SELECT id, email FROM mijozlar WHERE id = 1;
```

```text
 id |     email      
----+----------------
  1 | yangi@misol.uz
(1 row)
```

View'dagi `UPDATE` asosiy jadvalga yo'naltirildi va u yerda `b_email` triggeri yana ishladi — `yangi@…` kichik harfda. Triggerlar zanjir bo'lib ishlaydi — bu kuchli, lekin kuzatish qiyin.

### Tartib

```sql
SELECT tgname FROM pg_trigger WHERE tgrelid = 'mijozlar'::regclass AND NOT tgisinternal ORDER BY tgname;
```

```text
  tgname  
----------
 a_jurnal
 b_email
 c_manfiy
 d_hisob
(4 rows)
```

Bitta hodisaga bir xil turdagi bir nechta trigger bo'lsa — alifbo tartibida (hujjat). Shuning uchun nomlarda prefiks (`a_`, `b_`, …) qulay.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosining bir qismi, bo'sh qatorlar va `row in set` qatorlari olib tashlangan; xato xabarlari tegishli buyruq ostiga qo'yilgan.

```sql
CREATE TRIGGER b_email BEFORE INSERT ON mijozlar FOR EACH ROW SET NEW.email = lower(NEW.email);
DELIMITER //
CREATE TRIGGER c_manfiy BEFORE UPDATE ON mijozlar FOR EACH ROW
BEGIN
    IF NEW.balans < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'balans manfiy bo''lishi mumkin emas';
    END IF;
END //
DELIMITER ;
INSERT INTO mijozlar VALUES (1, 'Aziza@Misol.UZ', 1000), (2, 'BOBUR@misol.uz', 500);
SELECT * FROM mijozlar;
UPDATE mijozlar SET balans = -5 WHERE id = 2;
CREATE TRIGGER d_hisob AFTER INSERT ON mijozlar FOR EACH STATEMENT INSERT INTO jurnal (xabar) VALUES ('qo''shildi');
CREATE VIEW mijoz_email AS SELECT id, email FROM mijozlar;
CREATE TRIGGER e_view BEFORE UPDATE ON mijoz_email FOR EACH ROW SET NEW.email = lower(NEW.email);
```

```text
+----+----------------+--------+
| id | email          | balans |
+----+----------------+--------+
|  1 | aziza@misol.uz |   1000 |
|  2 | bobur@misol.uz |    500 |
+----+----------------+--------+
ERROR 1644 (45000) at line 16: balans manfiy bo'lishi mumkin emas
ERROR 1064 (42000) at line 17: You have an error in your SQL syntax; check the manual that corresponds to your MySQL server version for the right syntax to use near 'STATEMENT INSERT INTO jurnal (xabar) VALUES ('qo''shildi')' at line 1
ERROR 1347 (HY000) at line 19: 'sinov.mijoz_email' is not BASE TABLE
```

- `BEFORE` — `NEW` ni `SET` bilan o'zgartirish.
- `SIGNAL` — rad etish (PostgreSQL'ning `RAISE EXCEPTION` i). MySQL'da `BEFORE` triggerdan "`NULL` qaytarib o'tkazib yuborish" yo'q.
- `FOR EACH STATEMENT` — sintaksis xatosi; view'ga trigger — `is not BASE TABLE`. Ikkalasi ham hujjatdagidek.

**Kaskad o'chirish va triggerlar:**

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, mijoz_id int,
    FOREIGN KEY (mijoz_id) REFERENCES mijozlar(id) ON DELETE CASCADE);
CREATE TRIGGER f_buyurtma AFTER DELETE ON buyurtmalar FOR EACH ROW
    INSERT INTO jurnal (xabar) VALUES (concat('buyurtma o''chdi: ', OLD.id));
INSERT INTO buyurtmalar VALUES (10, 1), (11, 1), (20, 2);
DELETE FROM mijozlar WHERE id = 1;
SELECT * FROM buyurtmalar;
SELECT xabar FROM jurnal;
SET SESSION enable_cascade_triggers = ON;
DELETE FROM mijozlar WHERE id = 2;
SELECT xabar FROM jurnal;
```

```text
+----+----------+
| id | mijoz_id |
+----+----------+
| 20 |        2 |
+----+----------+
Empty set (0.000 sec)
Query OK, 0 rows affected, 1 warning (0.000 sec)
Query OK, 1 row affected (0.001 sec)
+---------------------+
| xabar               |
+---------------------+
| buyurtma o'chdi: 20 |
+---------------------+
```

- 1-mijoz o'chdi, `CASCADE` uning 10- va 11-buyurtmalarini o'chirdi — lekin `jurnal` **bo'sh**: kaskad amali `AFTER DELETE` triggerni ishga tushirmadi (hujjat). Audit jurnali shunday "teshik" bilan qoladi.
- `enable_cascade_triggers = ON` dan keyin (bu serverda `innodb_native_foreign_keys = OFF`) — 20-buyurtma kaskad o'chirilganda trigger **ishladi**.
- `SET` ning ogohlantirishi:

```text
+---------+------+----------------------------------------------------------------------------------+
| Level   | Code | Message                                                                          |
+---------+------+----------------------------------------------------------------------------------+
| Warning | 1681 | 'enable_cascade_triggers' is deprecated and will be removed in a future release. |
+---------+------+----------------------------------------------------------------------------------+
```

  — o'zgaruvchi **eskirgan** (deprecated) va kelajakdagi relizda olib tashlanadi; unga tayanadigan yechimni uzoq muddatga qurmang.

### SQLite

```sql
CREATE TABLE mijozlar (id integer PRIMARY KEY, email text NOT NULL, balans int NOT NULL DEFAULT 0);
CREATE TRIGGER c_manfiy BEFORE UPDATE OF balans ON mijozlar
WHEN NEW.balans < 0
BEGIN
    SELECT RAISE(ABORT, 'balans manfiy bo''lishi mumkin emas');
END;
CREATE TRIGGER b_email AFTER INSERT ON mijozlar
BEGIN
    UPDATE mijozlar SET email = lower(NEW.email) WHERE id = NEW.id;
END;
INSERT INTO mijozlar VALUES (1, 'Aziza@Misol.UZ', 1000), (2, 'BOBUR@misol.uz', 500);
SELECT * FROM mijozlar;
UPDATE mijozlar SET balans = -5 WHERE id = 2;
CREATE TRIGGER d_hisob AFTER INSERT ON mijozlar FOR EACH STATEMENT BEGIN SELECT 1; END;
CREATE VIEW mijoz_email AS SELECT id, email FROM mijozlar;
UPDATE mijoz_email SET email = 'x@misol.uz' WHERE id = 1;
CREATE TRIGGER e_view INSTEAD OF UPDATE ON mijoz_email
BEGIN
    UPDATE mijozlar SET email = lower(NEW.email) WHERE id = OLD.id;
END;
UPDATE mijoz_email SET email = 'YANGI@misol.uz' WHERE id = 1;
SELECT * FROM mijozlar WHERE id = 1;
```

```text
1|aziza@misol.uz|1000
2|bobur@misol.uz|500
Error near line 13: balans manfiy bo'lishi mumkin emas
Parse error near line 14: near "STATEMENT": syntax error
  TRIGGER d_hisob AFTER INSERT ON mijozlar FOR EACH STATEMENT BEGIN SELECT 1; EN
                                      error here ---^
Parse error near line 16: cannot modify mijoz_email because it is a view
1|yangi@misol.uz|1000
```

- E-pochta `AFTER INSERT` da alohida `UPDATE` bilan to'g'rilandi: SQLite'da `NEW` ni o'zgartiradigan buyruq yo'q (`UPDATE NEW SET …` — `no such table: main.NEW`, kuzatildi), `BEFORE` triggerda esa qatorni o'zgartirishdan hujjat ogohlantiradi (5-bo'lim: keyingi amal natijasi aniqlanmagan).
- `WHEN` sharti va `RAISE(ABORT, …)` — rad etish.
- `FOR EACH STATEMENT` — sintaksis xatosi (hujjat: hozircha faqat qator darajasi).
- View'ga to'g'ridan-to'g'ri `UPDATE` — `cannot modify … because it is a view`; `INSTEAD OF` trigger bilan — ishladi.

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| `BEFORE` / `AFTER` | Bor | Bor | Bor |
| `INSTEAD OF` (view) | Bor | Yo'q — view'ga trigger yo'q | Bor |
| `FOR EACH STATEMENT` | Bor (transition jadvallari bilan) | Yo'q | Yo'q |
| `NEW` ni o'zgartirish | `BEFORE` da: `NEW.x := …; RETURN NEW` | `BEFORE` da: `SET NEW.x = …` | Yo'q (alohida `UPDATE`) |
| Qatorni jimgina o'tkazish | `BEFORE` `NULL` qaytarsa | — | `RAISE(IGNORE)` |
| Rad etish | `RAISE EXCEPTION` | `SIGNAL SQLSTATE '45000'` | `RAISE(ABORT, …)` |
| Shart | `WHEN (…)` | Tana ichida `IF` | `WHEN …` |
| Tartib | Nom bo'yicha alifbo | `FOLLOWS` / `PRECEDES` | — |
| Kaskad FK amallari triggerni ishga tushiradimi | — | Standart: yo'q (`enable_cascade_triggers`, eskirgan) | — |
| Trigger kodi | Alohida funksiya (`RETURNS trigger`) | Tana — triggerning o'zida | Tana — triggerning o'zida |

`—` — bu bobda sinalmagan yoki mavjud emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Biznes mantig'ini ko'p triggerlarga yoyish | Zanjir (sinovda view → jadval → yana trigger) kuzatish qiyin, "sehrli" xatti-harakat | Triggerni oddiy, aniq vazifalar uchun; murakkab mantiq — ilova yoki aniq chaqiriladigan funksiyada |
| PG'da rad etish uchun `BEFORE` dan `NULL` qaytarish | Xato yo'q, `UPDATE 0` — ilova bilmaydi (sinovda) | `RAISE EXCEPTION` yoki `CHECK` |
| `BEFORE` trigger `NEW` ni qaytarishni unutish | Hujjat: kelgan qatorni qaytarish shart — aks holda amal bajarilmaydi | `RETURN NEW` |
| Ommaviy yuklashda qator darajasidagi audit | Har qatorga alohida ish | Operator darajasi + transition jadvali (PG) |
| MySQL'da kaskad o'chirishni audit qilaman deb o'ylash | Kaskad amallari triggerni ishga tushirmaydi (sinovda jurnal bo'sh) | Kaskad o'rniga ilovada aniq `DELETE`, yoki ota jadvaldagi trigger |
| Trigger ichida uzoq ish (tashqi tizimga murojaat) | Trigger operator tranzaksiyasida — qulflar ushlanadi | Trigger faqat qator yozadi, og'ir ish — fon jarayonida (masalan, 53-bobdagi navbat) |

## Amaliyot

1. PostgreSQL'da `BEFORE DELETE` trigger yozing: `balans > 0` bo'lgan mijozni o'chirishni `RAISE EXCEPTION` bilan taqiqlang.
2. Audit triggerini `INSERT OR UPDATE OR DELETE` uchun kengaytiring: `TG_OP` ga qarab `OLD` yoki `NEW` dan foydalaning.
3. `d_hisob` ni `REFERENCING OLD TABLE AS eskilar NEW TABLE AS yangilar` bilan `AFTER UPDATE` uchun qayta yozing: nechta qatorda balans o'zgarganini hisoblang.
4. MySQL'da `b_email` ga `FOLLOWS` bilan ikkinchi `BEFORE INSERT` trigger qo'shing (`NEW.balans` ga boshlang'ich bonus). Tartib natijaga ta'sir qiladimi?
5. SQLite'da `c_manfiy` ni `RAISE(IGNORE)` bilan qayta yozing. `UPDATE` natijasi va `changes()` nima ko'rsatadi?

## Rasmiy hujjat

- PostgreSQL — 37.1. Overview of Trigger Behavior: <https://www.postgresql.org/docs/18/trigger-definition.html>
- PostgreSQL — CREATE TRIGGER: <https://www.postgresql.org/docs/18/sql-createtrigger.html>
- PostgreSQL — 41.10. Trigger Functions (PL/pgSQL): <https://www.postgresql.org/docs/18/plpgsql-trigger.html>
- MySQL — 15.1.27 CREATE TRIGGER Statement: <https://dev.mysql.com/doc/refman/9.7/en/create-trigger.html>
- SQLite — CREATE TRIGGER: <https://www.sqlite.org/lang_createtrigger.html>
