# 55 — Ilova darajasida izchillik

[← Oldingi: Deadlock va qayta urinish](54-deadlock-va-qayta-urinish.md) · [Mundarija](README.md) · [Keyingi: Funksiya va protseduralar →](56-funksiya-va-protseduralar.md)

## Tushuncha

Ba'zi biznes qoidalarini `CHECK`, `UNIQUE`, tashqi kalit bilan ifodalab bo'lmaydi, chunki ular **bir nechta qatorga** tegishli:

- "Kasalxonada doim kamida bitta navbatchi shifokor bo'lsin."
- "Bir xonaga bir vaqtda ikki bron bo'lmasin."
- "Kredit summalari yig'indisi debet yig'indisiga teng bo'lsin."

Bunday qoidani ilova tekshiradi: avval o'qiydi ("navbatchilar 2 ta"), keyin yozadi ("men ketaman"). Muammo — tekshiruv va yozish orasida boshqa tranzaksiya ham xuddi shunday qilishi. Bu 51-bobdagi **write skew**.

PostgreSQL hujjati (13.4. Data Consistency Checks at the Application Level):

- Read Committed'da biznes qoidalarini ta'minlash **juda qiyin**: ma'lumotlar ko'rinishi har operatorda o'zgaradi.
- Repeatable Read'ning ko'rinishi barqaror, lekin MVCC snapshot'lari bilan izchillik tekshiruvida nozik muammo bor — **o'qish/yozish to'qnashuvlari**: tranzaksiya boshqasining ishini ko'rmaydi, shuning uchun go'yo birinchi bajarilgandek bo'ladi. Bunday "go'yo" tartiblar zanjiri **halqa** (cycle) hosil qilsa, yaxlitlik tekshiruvlari yordamsiz to'g'ri ishlamaydi.

Hujjat ikki yo'lni beradi:

| Yo'l | Mohiyati |
| --- | --- |
| **Serializable tranzaksiyalar** (13.4.1) | Barcha yozishlar va izchil ko'rinish kerak bo'lgan barcha o'qishlar Serializable bo'lsa, **boshqa hech narsa qilish shart emas**. Xavfli to'qnashuv topilsa, tranzaksiyalardan biri qaytariladi |
| **Aniq bloklovchi qulflar** (13.4.2) | Serializable bo'lmagan yozishlar mumkin bo'lsa, qatorning joriy to'g'riligini ta'minlash va parallel yangilashdan himoya qilish uchun — `SELECT FOR UPDATE`, `SELECT FOR SHARE` yoki mos `LOCK TABLE` |

### Serializable yo'li

Hujjat tavsiyalari:

- Ilova serialization xatosi (`40001`) bilan qaytarilgan tranzaksiyani **avtomatik qayta urinadigan** freymvork orqali ishlasa — dasturchiga ortiqcha yuk tushmaydi (54-bob).
- `default_transaction_isolation` ni `serializable` qilish yaxshi g'oya bo'lishi mumkin.
- Boshqa daraja tasodifan yoki tekshiruvlarni chetlab o'tish uchun ishlatilmasligi uchun — **triggerda** izolyatsiya darajasini tekshirish.
- Ogohlantirish: Serializable bilan bu himoya hali **hot standby** (26.4) va **mantiqiy replikalarga** tarqalmaydi (67-bob) — ularni ishlatadiganlar asosiy serverda Repeatable Read va aniq qulflashni tanlashi mumkin.

### Aniq qulflar yo'li

Hujjatdagi nozik joylar:

- `SELECT FOR UPDATE` va `FOR SHARE` faqat **qaytarilgan qatorlarni** qulflaydi, `LOCK TABLE` — butun jadvalni.
- `SELECT FOR UPDATE` parallel tranzaksiya qatorni keyinroq yangilamasligini **kafolatlamaydi**: qulf tranzaksiya tugaguncha bloklaydi; qulf ushlanib turganda qatorning haqiqiy `UPDATE` i qilinmagan bo'lsa, bloklangan tranzaksiya qulf qo'yib yuborilgach o'z amalini bajaradi.
- Butun jadval bo'yicha tekshiruvlar (masalan, kredit va debet yig'indilari teng) — Read Committed'da ketma-ket ikki `SELECT sum(…)` ishonchsiz; bitta Repeatable Read tranzaksiyada — faqat u boshlanishidan oldin commit qilinganlarni ko'radi. Hujjat: aniq manzara kerak bo'lsa, tekshiruv uchun kerakli barcha jadvallarni qulflash; `SHARE` (yoki undan kuchli) qulf jadvalda joriy tranzaksiyadan boshqa commit qilinmagan o'zgarish yo'qligini kafolatlaydi.
- Repeatable Read'da qulflarni **so'rovlardan oldin** oling: snapshot birinchi so'rov yoki ma'lumot o'zgartirish buyrug'ida muzlatiladi; qulf undan keyin olinsa, snapshot qulfdan oldingi bo'lib qoladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan. Ikki seans — 51-bobdagi skript bilan.

Qoida: kamida bitta shifokor navbatda bo'lishi kerak. Har shifokor "ketaman" desa, ilova avval navbatchilarni sanaydi: 2 va undan ko'p bo'lsa — ketishga ruxsat.

```sql
CREATE TABLE navbatchilar (shifokor text PRIMARY KEY, navbatda boolean NOT NULL);
INSERT INTO navbatchilar VALUES ('Aziza', true), ('Bobur', true);
```

### Read Committed: qoida buziladi

```text
A> BEGIN;
   BEGIN
B> BEGIN;
   BEGIN
A> SELECT count(*) FROM navbatchilar WHERE navbatda;
    count 
   -------
        2
   (1 row)
B> SELECT count(*) FROM navbatchilar WHERE navbatda;
    count 
   -------
        2
   (1 row)
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   UPDATE 1
B> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Bobur';
   UPDATE 1
A> COMMIT;
   COMMIT
B> COMMIT;
   COMMIT
A> SELECT * FROM navbatchilar ORDER BY shifokor;
    shifokor | navbatda 
   ----------+----------
    Aziza    | f
    Bobur    | f
   (2 rows)
```

Ikkalasi ham 2 ni ko'rdi, ikkalasi ham ketdi. Hech bir qator ikki marta yangilanmadi (har biri **o'z** qatorini) — hech qanday qulf to'qnashmadi. Natija: **navbatchi yo'q**. Bazaning hech bir cheklovi buzilmadi, lekin biznes qoidasi buzildi.

### Serializable: biri qaytariladi

```text
A> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
B> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
A> SELECT count(*) FROM navbatchilar WHERE navbatda;
    count 
   -------
        2
   (1 row)
B> SELECT count(*) FROM navbatchilar WHERE navbatda;
    count 
   -------
        2
   (1 row)
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   UPDATE 1
B> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Bobur';
   UPDATE 1
A> COMMIT;
   COMMIT
B> COMMIT;
   ERROR:  could not serialize access due to read/write dependencies among transactions
   DETAIL:  Reason code: Canceled on identification as a pivot, during commit attempt.
   HINT:  The transaction might succeed if retried.
A> SELECT * FROM navbatchilar ORDER BY shifokor;
    shifokor | navbatda 
   ----------+----------
    Aziza    | f
    Bobur    | t
   (2 rows)
```

B — `40001`. Bobur navbatda qoldi. B qayta urinsa (54-bob), sanoq endi 1 ni ko'rsatadi va ilova Boburni qo'yib yubormaydi.

### Aniq qulf: `FOR UPDATE`

Read Committed, lekin sanash o'rniga navbatchi qatorlarni **qulflab** o'qiymiz. Agregatni `FOR UPDATE` bilan ishlatib bo'lmaydi:

```text
ERROR:  FOR UPDATE is not allowed with aggregate functions
```

— shuning uchun qatorlarni olib, ilovada sanaymiz:

```text
A> BEGIN;
   BEGIN
B> BEGIN;
   BEGIN
A> SELECT shifokor FROM navbatchilar WHERE navbatda ORDER BY shifokor FOR UPDATE;
    shifokor 
   ----------
    Aziza
    Bobur
   (2 rows)
B> SELECT shifokor FROM navbatchilar WHERE navbatda ORDER BY shifokor FOR UPDATE;
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   UPDATE 1
A> COMMIT;
   COMMIT
B> ROLLBACK;
    shifokor 
   ----------
    Bobur
   (1 row)
   
   ROLLBACK
A> SELECT * FROM navbatchilar ORDER BY shifokor;
    shifokor | navbatda 
   ----------+----------
    Aziza    | f
    Bobur    | t
   (2 rows)
```

- A ikkala navbatchini qulfladi. B'ning xuddi shu so'rovi **kutdi**.
- A Azizani olib tashlab commit qildi — B'ning so'rovi davom etdi va endi faqat **Bobur**ni qaytardi: Read Committed'da `FOR UPDATE` kutgandan keyin qatorning yangi versiyasini oladi va shartni qayta tekshiradi (53-bob, hujjat: qulflaydi va **yangilangan qatorni** qaytaradi). `navbatda` — endi faqat 1.
- Ilova 1 ni ko'rdi va Boburni qo'ymadi — `ROLLBACK`. Qoida saqlandi.

### Trigger bilan izolyatsiyani majburlash

Hujjat tavsiyasi — Serializable'dan boshqa darajada jadvalga yozishni taqiqlash:

```text
A> CREATE FUNCTION faqat_serializable() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF current_setting('transaction_isolation') <> 'serializable' THEN RAISE EXCEPTION 'navbatchilar: faqat SERIALIZABLE tranzaksiyada (hozir: %)', current_setting('transaction_isolation'); END IF; RETURN NEW; END $$;
   CREATE FUNCTION
A> CREATE TRIGGER izolyatsiya BEFORE INSERT OR UPDATE OR DELETE ON navbatchilar FOR EACH STATEMENT EXECUTE FUNCTION faqat_serializable();
   CREATE TRIGGER
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   ERROR:  navbatchilar: faqat SERIALIZABLE tranzaksiyada (hozir: read committed)
   CONTEXT:  PL/pgSQL function faqat_serializable() line 1 at RAISE
A> BEGIN ISOLATION LEVEL SERIALIZABLE;
   BEGIN
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   UPDATE 1
A> ROLLBACK;
   ROLLBACK
```

`current_setting('transaction_isolation')` — joriy daraja. Oddiy (Read Committed) `UPDATE` rad etildi; Serializable tranzaksiyada — o'tdi.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosi, bo'sh qatorlar, `Rows matched` va `row in set` qatorlari olib tashlangan.

**Repeatable Read (standart) — qoida buziladi:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT count(*) FROM navbatchilar WHERE navbatda;
   +----------+
   | count(*) |
   +----------+
   |        2 |
   +----------+
B> SELECT count(*) FROM navbatchilar WHERE navbatda;
   +----------+
   | count(*) |
   +----------+
   |        2 |
   +----------+
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   Query OK, 1 row affected (0.000 sec)
B> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Bobur';
   Query OK, 1 row affected (0.001 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.003 sec)
B> COMMIT;
   Query OK, 0 rows affected (0.003 sec)
A> SELECT * FROM navbatchilar ORDER BY shifokor;
   +----------+----------+
   | shifokor | navbatda |
   +----------+----------+
   | Aziza    |        0 |
   | Bobur    |        0 |
   +----------+----------+
```

PostgreSQL Read Committed'dagi kabi — navbatchi yo'q. MySQL'ning standart Repeatable Read darajasi bu yerda yordam bermaydi (51-bob: write skew).

**`FOR UPDATE`:**

```text
A> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
B> START TRANSACTION;
   Query OK, 0 rows affected (0.000 sec)
A> SELECT shifokor FROM navbatchilar WHERE navbatda ORDER BY shifokor FOR UPDATE;
   +----------+
   | shifokor |
   +----------+
   | Aziza    |
   | Bobur    |
   +----------+
B> SELECT shifokor FROM navbatchilar WHERE navbatda ORDER BY shifokor FOR UPDATE;
A> UPDATE navbatchilar SET navbatda = false WHERE shifokor = 'Aziza';
   Query OK, 1 row affected (0.001 sec)
A> COMMIT;
   Query OK, 0 rows affected (0.003 sec)
B> ROLLBACK;
   +----------+
   | shifokor |
   +----------+
   | Bobur    |
   +----------+
   Query OK, 0 rows affected (0.000 sec)
A> SELECT * FROM navbatchilar ORDER BY shifokor;
   +----------+----------+
   | shifokor | navbatda |
   +----------+----------+
   | Aziza    |        0 |
   | Bobur    |        1 |
   +----------+----------+
```

Xuddi PostgreSQL'dagidek: B kutdi va qulf qo'yib yuborilgach faqat **Bobur**ni oldi — InnoDB'da qulflaydigan o'qish snapshot'ni emas, eng yangi qatorni o'qiydi (51-bob: snapshot faqat oddiy `SELECT` ga). MySQL'da Serializable — o'qishlarni `FOR SHARE` ga aylantiradi (51-bob), ya'ni aslida shu qulf yo'li.

### SQLite

SQLite'da tranzaksiyalar doim serializable (51-bob), yozuvchi bitta. `BEGIN IMMEDIATE` — tekshiruv va yozish butunlay ketma-ket:

```text
A> .timeout 5000
B> .timeout 5000
A> BEGIN IMMEDIATE;
A> SELECT count(*) FROM navbatchilar WHERE navbatda;
   2
B> BEGIN IMMEDIATE;
A> UPDATE navbatchilar SET navbatda = 0 WHERE shifokor = 'Aziza';
A> COMMIT;
B> SELECT count(*) FROM navbatchilar WHERE navbatda;
   1
B> ROLLBACK;
```

B'ning `BEGIN IMMEDIATE` i A tugaguncha kutdi (`.timeout 5000`), keyin sanoq — **1**: B ketolmaydi. `DEFERRED` (oddiy `BEGIN`) bilan B o'qiy olardi, lekin yozishda `SQLITE_BUSY` olardi (54-bob) — qoida baribir buzilmasdi, faqat xato ilovaga chiqardi.

### Qisqacha jadval

| | PostgreSQL | MySQL (InnoDB) | SQLite |
| --- | --- | --- | --- |
| Standart darajada write skew | Bor (Read Committed) | Bor (Repeatable Read) | Yo'q — yozuvchi bitta |
| Serializable bilan | Biri `40001`, qayta urinish | O'qishlar `FOR SHARE` — qulf/deadlock | Doim |
| `FOR UPDATE` bilan | B kutadi, keyin yangi qatorni qayta tekshiradi | Xuddi shunday | — (fayl qulfi: `BEGIN IMMEDIATE`) |
| Darajani majburlash | Trigger + `current_setting('transaction_isolation')` | — | — |

`—` — bu bobda sinalmagan yoki tegishli emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| "O'qib-tekshirib-yozish" ni oddiy tranzaksiyada | Write skew — qoida jimgina buziladi (sinovda navbatchi qolmadi) | Serializable + qayta urinish, yoki `FOR UPDATE` |
| Faqat **o'z** qatorini qulflash | To'qnashuv boshqa qatorlarda — qulf yordam bermaydi | Qoida tegishli **barcha** qatorlarni qulflash |
| `SELECT count(*) … FOR UPDATE` yozish | PG: agregat bilan `FOR UPDATE` mumkin emas | Qatorlarni qulflab olib, ilovada sanash |
| Serializable'ni faqat ba'zi tranzaksiyalarda ishlatish | Hujjat: barcha yozishlar va kerakli o'qishlar Serializable bo'lsagina kafolat | `default_transaction_isolation = serializable`, triggerda tekshirish |
| Repeatable Read'da avval so'rov, keyin `LOCK TABLE` | Snapshot qulfdan oldin muzlagan — commit qilingan o'zgarishlar ko'rinmaydi | Qulfni birinchi so'rovdan oldin olish |
| Replikada Serializable kafolatiga tayanish | Hujjat: hot standby va mantiqiy replikaga tarqalmaydi | Asosiy serverda tekshirish |

## Amaliyot

1. PostgreSQL'da `CREATE TABLE bronlar (xona int, kun date)` uchun "bir xonaga bir kunga bitta bron" qoidasini ilova darajasida yozing: ikki seansda bir vaqtda bir xil bron qiling. Keyin `UNIQUE (xona, kun)` bilan solishtiring — qaysi biri ishonchliroq?
2. `ALTER DATABASE postgres SET default_transaction_isolation = 'serializable'` dan keyin 1-misolni (`BEGIN` bilan) takrorlang.
3. Hujjatdagi "kredit = debet" tekshiruvini sinang: A Read Committed'da ikki `SELECT sum(…)` qiladi, orada B ikkala jadvalga yozadi. Natija ishonchlimi? `LOCK TABLE … IN SHARE MODE` bilan-chi?
4. MySQL'da 1-misolni `SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE` bilan takrorlang. Nima bo'ldi?
5. PostgreSQL'da `FOR UPDATE` o'rniga `FOR SHARE` bilan 3-misolni takrorlang. Ikki seans ham qulfni oldimi va `UPDATE` da nima bo'ldi?

## Rasmiy hujjat

- PostgreSQL — 13.4. Data Consistency Checks at the Application Level: <https://www.postgresql.org/docs/18/applevel-consistency.html>
- PostgreSQL — 13.2.3. Serializable Isolation Level: <https://www.postgresql.org/docs/18/transaction-iso.html#XACT-SERIALIZABLE>
- PostgreSQL — 19.11.1. Statement Behavior (`default_transaction_isolation`): <https://www.postgresql.org/docs/18/runtime-config-client.html>
- MySQL — 17.7.2.4 Locking Reads: <https://dev.mysql.com/doc/refman/9.7/en/innodb-locking-reads.html>
- SQLite — Isolation In SQLite: <https://www.sqlite.org/isolation.html>
