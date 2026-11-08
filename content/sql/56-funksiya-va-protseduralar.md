# 56 — Funksiya va protseduralar

[← Oldingi: Ilova darajasida izchillik](55-ilova-darajasida-izchillik.md) · [Mundarija](README.md)

## Tushuncha

SQL so'rovlarini ilovada emas, **bazaning ichida** saqlash va chaqirish mumkin — **funksiya** yoki **protsedura** sifatida. Masalan, "pul o'tkazish" mantig'i (tekshiruvlar bilan) bitta funksiyada: ilova faqat `SELECT otkazma('Aziza', 'Bobur', 300)` yuboradi.

PostgreSQL hujjati (41.1.1. Advantages of Using PL/pgSQL): hisob-kitob va so'rovlar ketma-ketligini server ichida guruhlab, protsedura tilining kuchi va SQL'ning qulayligini olasiz — **klient va server orasidagi aloqa xarajatini** sezilarli tejagan holda: ortiqcha borib-kelishlar (round trips) yo'qoladi.

### PostgreSQL: funksiya turlari

Hujjat (36.3. User-Defined Functions) to'rt turni sanaydi:

| Tur | Nimada yoziladi |
| --- | --- |
| SQL funksiyalar | SQL'ning o'zi |
| Protsedura tillari funksiyalari | **PL/pgSQL**, PL/Tcl va boshqalar |
| Ichki (internal) funksiyalar | Server ichida, C'da |
| C funksiyalar | Alohida yuklanadigan C kutubxonasi |

### Funksiya va protsedura farqi

PostgreSQL hujjati (36.4. User-Defined Procedures):

| | Funksiya | Protsedura |
| --- | --- | --- |
| Yaratish | `CREATE FUNCTION` | `CREATE PROCEDURE` |
| Qiymat qaytaradi | Ha (`RETURNS`) | Yo'q — lekin chiqish (`OUT`) parametrlari orqali ma'lumot berishi mumkin |
| Chaqirish | So'rov yoki DML ichida: `SELECT f(…)` | Alohida: `CALL p(…)` |
| Tranzaksiyani boshqarish | Yo'q | `COMMIT`/`ROLLBACK` qila oladi (keyin yangi tranzaksiya avtomatik boshlanadi) — agar `CALL` aniq tranzaksiya bloki ichida bo'lmasa |

Birgalikda funksiya va protseduralar — **routine**lar (`ALTER ROUTINE`, `DROP ROUTINE`; `CREATE ROUTINE` esa yo'q).

### Volatility: optimizatorga va'da

PostgreSQL hujjati (36.7. Function Volatility Categories): har funksiyaning kategoriyasi bor — `VOLATILE` (standart), `STABLE`, `IMMUTABLE`. Bu — optimizatorga funksiyaning xatti-harakati haqidagi **va'da**:

| Kategoriya | Va'da | Optimizatorga nima beradi |
| --- | --- | --- |
| `VOLATILE` | Hech qanday: istalgan narsani qila oladi, har chaqiriqda boshqa natija | Har qatorda qayta chaqiriladi; **indeks skanerlash shartida ishlatib bo'lmaydi** |
| `STABLE` | Bazani o'zgartirmaydi; bitta operator ichida bir xil argumentlarga bir xil natija | Bir necha chaqiriqni bittaga qisqartirish; indeks skanerlash shartida ishlatish xavfsiz |
| `IMMUTABLE` | Bazani o'zgartirmaydi; bir xil argumentlarga **abadiy** bir xil natija | O'zgarmas argumentlar bilan oldindan hisoblash (`WHERE x = 2 + 2` → `x = 4`); ifoda indeksida (47-bob) faqat shular |

Noto'g'ri kategoriya — yo sekin reja (`VOLATILE` bo'lishi shart emas edi), yo noto'g'ri natija (aslida o'zgaradigan funksiyani `IMMUTABLE` deb e'lon qilish).

### MySQL: stored routine'lar

MySQL hujjati (27.2 Using Stored Routines): stored routine — serverda saqlanadigan SQL operatorlari to'plami; protsedura (`CALL`) yoki funksiya. `mysql` klientida tana ichidagi `;` buyruqni tugatib qo'ymasligi uchun ajratgich `DELIMITER` bilan vaqtincha o'zgartiriladi (27.1 Defining Stored Programs).

**JavaScript stored programs** (27.3): MySQL 9.x'da routine'larni JavaScript'da yozish mumkin (`LANGUAGE JAVASCRIPT`), lekin hujjat: buning uchun **Multilingual Engine (MLE)** komponenti kerak, u esa **MySQL Enterprise Edition** tarkibida. Community Server'da (bizning sinov) — pastda.

### SQLite

SQLite SQL tilida `CREATE FUNCTION` / `CREATE PROCEDURE` yo'q. SQLite hujjati (Application-Defined SQL Functions): maxsus SQL funksiyalari **ilova** tomonidan `sqlite3_create_function()` oilasidagi interfeyslar bilan yaratiladi — ya'ni funksiya ilovaning tilida yoziladi va o'sha ulanishda mavjud bo'ladi.

## Kod

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.1 da ishga tushirilgan.

```sql
CREATE TABLE hisoblar (nom text PRIMARY KEY, balans numeric NOT NULL);
INSERT INTO hisoblar VALUES ('Aziza', 1000), ('Bobur', 500);
```

### SQL funksiya

Tana — `RETURN` (`CREATE FUNCTION` hujjati: faqat `LANGUAGE SQL` uchun, ta'rif paytida tahlil qilinadi, bog'liqliklarni kuzatadi va SQL standartiga ko'proq mos):

```sql
CREATE FUNCTION chegirma(narx numeric, foiz int) RETURNS numeric
    LANGUAGE sql IMMUTABLE
    RETURN narx * (100 - foiz) / 100;
SELECT chegirma(250000, 15) AS narx;
```

```text
        narx         
---------------------
 212500.000000000000
```

### PL/pgSQL funksiya

O'zgaruvchilar, shartlar, xatolar:

```sql
CREATE FUNCTION otkazma(kimdan text, kimga text, summa numeric) RETURNS numeric
LANGUAGE plpgsql AS $$
DECLARE
    qoldiq numeric;
BEGIN
    UPDATE hisoblar SET balans = balans - summa WHERE nom = kimdan
        RETURNING balans INTO qoldiq;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'hisob topilmadi: %', kimdan;
    END IF;
    IF qoldiq < 0 THEN
        RAISE EXCEPTION 'mablag'' yetarli emas: % da % qoladi', kimdan, qoldiq;
    END IF;
    UPDATE hisoblar SET balans = balans + summa WHERE nom = kimga;
    RETURN qoldiq;
END;
$$;
SELECT otkazma('Aziza', 'Bobur', 300);
SELECT otkazma('Bobur', 'Aziza', 5000);
SELECT otkazma('Dilshod', 'Aziza', 1);
SELECT * FROM hisoblar ORDER BY nom;
```

```text
 otkazma 
---------
     700
(1 row)

ERROR:  mablag' yetarli emas: Bobur da -4200 qoladi
CONTEXT:  PL/pgSQL function otkazma(text,text,numeric) line 11 at RAISE
ERROR:  hisob topilmadi: Dilshod
CONTEXT:  PL/pgSQL function otkazma(text,text,numeric) line 8 at RAISE
  nom  | balans 
-------+--------
 Aziza |    700
 Bobur |    800
(2 rows)
```

- `$$ … $$` — tana satri (dollar quoting): ichidagi `'` larni qochirish shart emas.
- `RETURNING balans INTO qoldiq` — yangilangan qiymat o'zgaruvchiga; `FOUND` — oxirgi operator qator topdimi.
- `RAISE EXCEPTION` — xato. Funksiya **bitta operator** ichida bajariladi, shuning uchun xato uning barcha o'zgarishlarini bekor qiladi: Boburdan 5000 ayirilgan `UPDATE` ham qolmadi (balanslar 700 va 800 — faqat birinchi o'tkazma).

### Protsedura va `COMMIT`

Katta jadvalni bo'laklab yangilash — har bo'lakdan keyin commit, tranzaksiya uzoq ochiq qolmaydi (52-bob):

```sql
CREATE TABLE buyurtmalar (id int PRIMARY KEY, holat text NOT NULL);
INSERT INTO buyurtmalar SELECT g, 'yopilgan' FROM generate_series(1, 25) g;
CREATE PROCEDURE arxivla(paket int)
LANGUAGE plpgsql AS $$
DECLARE
    soni int;
BEGIN
    LOOP
        UPDATE buyurtmalar SET holat = 'arxiv'
        WHERE id IN (SELECT id FROM buyurtmalar WHERE holat = 'yopilgan' ORDER BY id LIMIT paket);
        GET DIAGNOSTICS soni = ROW_COUNT;
        EXIT WHEN soni = 0;
        RAISE NOTICE '% ta qator arxivlandi', soni;
        COMMIT;
    END LOOP;
END;
$$;
CALL arxivla(10);
SELECT holat, count(*) FROM buyurtmalar GROUP BY holat;
```

```text
NOTICE:  10 ta qator arxivlandi
NOTICE:  10 ta qator arxivlandi
NOTICE:  5 ta qator arxivlandi
 holat | count 
-------+-------
 arxiv |    25
(1 row)
```

Uch tranzaksiya: 10 + 10 + 5. Xuddi shu protsedura aniq tranzaksiya ichida:

```sql
BEGIN;
CALL arxivla(10);
ROLLBACK;
```

```text
NOTICE:  10 ta qator arxivlandi
ERROR:  invalid transaction termination
CONTEXT:  PL/pgSQL function arxivla(integer) line 11 at COMMIT
```

`invalid transaction termination` — hujjatdagi shart: `CALL` aniq tranzaksiya bloki ichida bo'lsa, protsedura `COMMIT` qila olmaydi. Funksiyada `COMMIT` umuman mumkin emas.

### Volatility va indeks

100 000 buyurtma. Ikki bir xil funksiya — biri `VOLATILE` (standart), ikkinchisi `STABLE`:

```sql
CREATE FUNCTION joriy_id_v() RETURNS int LANGUAGE plpgsql VOLATILE AS $$ BEGIN RETURN 7; END $$;
CREATE FUNCTION joriy_id_s() RETURNS int LANGUAGE plpgsql STABLE AS $$ BEGIN RETURN 7; END $$;
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT * FROM buyurtmalar WHERE id = joriy_id_v();
EXPLAIN (ANALYZE, TIMING OFF, BUFFERS OFF) SELECT * FROM buyurtmalar WHERE id = joriy_id_s();
```

```text
                                        QUERY PLAN                                         
-------------------------------------------------------------------------------------------
 Seq Scan on buyurtmalar  (cost=0.00..26791.00 rows=1 width=10) (actual rows=1.00 loops=1)
   Filter: (id = joriy_id_v())
   Rows Removed by Filter: 99999
 Planning Time: 0.026 ms
 Execution Time: 12.966 ms
(5 rows)

                                                   QUERY PLAN                                                   
----------------------------------------------------------------------------------------------------------------
 Index Scan using buyurtmalar_pkey on buyurtmalar  (cost=0.54..8.56 rows=1 width=10) (actual rows=1.00 loops=1)
   Index Cond: (id = joriy_id_s())
   Index Searches: 1
 Planning Time: 0.059 ms
 Execution Time: 0.013 ms
(5 rows)
```

- `VOLATILE` — `Seq Scan`, funksiya `Filter` da **har qatorda** chaqirildi: 13 ms. Hujjat: `VOLATILE` funksiyani indeks skanerlash shartida ishlatib bo'lmaydi — u har qatorda boshqa qiymat qaytarishi mumkin.
- `STABLE` — `Index Scan`, `Index Cond: (id = joriy_id_s())`: funksiya bir marta, **0.013 ms**.
- Kuzatildi: xuddi shunday funksiyalar `LANGUAGE sql` da yozilganda ikkala reja ham `Index Cond: (id = 7)` bo'ldi — PostgreSQL oddiy SQL funksiyasini so'rovga qo'shib yubordi. PL/pgSQL funksiyasi bilan bunday bo'lmaydi.

## Dialektlar

### MySQL

Chiqishlardan `mysql -vvv` aks-sadosining bir qismi, bo'sh qatorlar va `row in set` qatorlari olib tashlangan; xato xabarlari (`stderr`) tegishli buyruq ostiga qo'yilgan.

**Funksiya va binary log:**

```sql
SELECT @@log_bin, @@log_bin_trust_function_creators;
CREATE FUNCTION chegirma(narx decimal(12,2), foiz int) RETURNS decimal(12,2)
RETURN narx * (100 - foiz) / 100;
CREATE FUNCTION chegirma(narx decimal(12,2), foiz int) RETURNS decimal(12,2) DETERMINISTIC
RETURN narx * (100 - foiz) / 100;
SELECT chegirma(250000, 15) AS narx;
```

```text
+-----------+-----------------------------------+
| @@log_bin | @@log_bin_trust_function_creators |
+-----------+-----------------------------------+
|         1 |                                 0 |
+-----------+-----------------------------------+
ERROR 1418 (HY000) at line 5: This function has none of DETERMINISTIC, NO SQL, or READS SQL DATA in its declaration and binary logging is enabled (you *might* want to use the less safe log_bin_trust_function_creators variable)
Query OK, 0 rows affected (0.002 sec)
+-----------+
| narx      |
+-----------+
| 212500.00 |
+-----------+
```

MySQL 9.7'da binary log (ma'lumot o'zgarishlarini tasvirlovchi "hodisalar" jurnali — replikatsiya va tiklash uchun, 66–67-boblar) hujjatga ko'ra standart holatda **yoqilgan** (`@@log_bin = 1`), shuning uchun funksiya o'z xususiyatini e'lon qilishi shart: `DETERMINISTIC` (bir xil argumentlarga bir xil natija), `NO SQL` yoki `READS SQL DATA`. PostgreSQL'ning `IMMUTABLE`/`STABLE` iga o'xshash va'da.

**Protsedura — `DELIMITER`, `OUT`, xato ushlagich:**

```sql
DELIMITER //
CREATE PROCEDURE otkazma(IN kimdan varchar(20), IN kimga varchar(20), IN summa decimal(12,2), OUT qoldiq decimal(12,2))
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    START TRANSACTION;
    UPDATE hisoblar SET balans = balans - summa WHERE nom = kimdan;
    SELECT balans INTO qoldiq FROM hisoblar WHERE nom = kimdan;
    IF qoldiq < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'mablag'' yetarli emas';
    END IF;
    UPDATE hisoblar SET balans = balans + summa WHERE nom = kimga;
    COMMIT;
END //
DELIMITER ;
CALL otkazma('Aziza', 'Bobur', 300, @q);
SELECT @q AS qoldiq;
CALL otkazma('Bobur', 'Aziza', 5000, @q);
SELECT * FROM hisoblar ORDER BY nom;
```

```text
+--------+
| qoldiq |
+--------+
| 700.00 |
+--------+
ERROR 1644 (45000) at line 30: mablag' yetarli emas
+-------+--------+
| nom   | balans |
+-------+--------+
| Aziza | 700.00 |
| Bobur | 800.00 |
+-------+--------+
```

- `DELIMITER //` — tana ichidagi `;` lar klientda buyruqni tugatmaydi.
- `OUT qoldiq` — natija sessiya o'zgaruvchisi `@q` ga.
- `SIGNAL SQLSTATE '45000'` — foydalanuvchi xatosi; `DECLARE EXIT HANDLER … ROLLBACK; RESIGNAL` — xato bo'lsa tranzaksiyani bekor qilib, xatoni yuqoriga uzatadi. 50-bobdagi MySQL xatti-harakati (xatodan keyin tranzaksiya davom etadi) tufayli bu ushlagich muhim: usiz Boburdan ayirilgan `UPDATE` qolardi. Natija — PostgreSQL bilan bir xil.
- MySQL protsedurasida `START TRANSACTION`/`COMMIT` — mumkin.

**JavaScript — Community Server'da:**

```sql
CREATE FUNCTION salom(ism varchar(20)) RETURNS varchar(40) DETERMINISTIC
LANGUAGE JAVASCRIPT AS $$ return "Salom, " + ism $$;
SHOW WARNINGS;
SELECT salom('Aziza');
```

```text
Query OK, 0 rows affected, 1 warning (0.001 sec)
+---------+------+------------------------------------+
| Level   | Code | Message                            |
+---------+------+------------------------------------+
| Warning | 6001 | Language component: Not available. |
+---------+------+------------------------------------+
ERROR 6001 (HY000) at line 5: Language component: Not available.
```

Funksiya **yaratildi** (faqat ogohlantirish), lekin chaqirib bo'lmaydi: MLE komponenti yo'q. Komponentni o'rnatishga urinish ham (`INSTALL COMPONENT 'file://component_mle'`) — `Can't open shared library … component_mle.so` — Community image'da bu fayl yo'q. Hujjatdagidek: Enterprise Edition kerak.

### SQLite

```text
Parse error in 2nd command line argument: near "FUNCTION": syntax error
  CREATE FUNCTION chegirma(narx, foiz) RETURNS numeric RETURN narx;
         ^--- error here
```

SQL orqali funksiya yaratib bo'lmaydi. Ilova funksiyasi — masalan, Python'ning standart `sqlite3` moduli bilan (`create_function` — modul hujjatida; ostida o'sha `sqlite3_create_function()`):

```python
import sqlite3

def chegirma(narx, foiz):
    return narx * (100 - foiz) / 100

db = sqlite3.connect(":memory:")
db.create_function("chegirma", 2, chegirma, deterministic=True)
print(db.execute("SELECT chegirma(250000, 15)").fetchone())
print(sqlite3.sqlite_version)
```

```text
(212500.0,)
3.49.1
```

Funksiya Python'da, lekin SQL ichida chaqiriladi. `deterministic=True` — PostgreSQL'ning `IMMUTABLE` iga o'xshash belgi. (Bu misolda Python o'zi bilan kelgan SQLite 3.49.1 ishladi, kitobdagi 3.54.1 emas.)

### Qisqacha jadval

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| SQL funksiya | `LANGUAGE sql`, `RETURN …` | `RETURN …` (binlog bilan — `DETERMINISTIC` va h.k. shart) | — |
| Protsedura tili | PL/pgSQL (va boshqalar) | Stored program SQL sintaksisi; JavaScript — faqat Enterprise | Ilova tili (C API) |
| Protsedura | `CREATE PROCEDURE`, `CALL`, ichida `COMMIT` (blokdan tashqarida) | `CREATE PROCEDURE`, `CALL`, ichida `START TRANSACTION`/`COMMIT` | — |
| Xato chiqarish | `RAISE EXCEPTION` | `SIGNAL SQLSTATE '45000'` | Ilova kodida |
| Xato ushlash | `EXCEPTION WHEN …` bloki | `DECLARE … HANDLER` | Ilova kodida |
| Optimizatorga va'da | `VOLATILE` / `STABLE` / `IMMUTABLE` | `DETERMINISTIC`, `NO SQL`, `READS SQL DATA` | `deterministic` belgisi |
| Klient ajratgichi | Kerak emas (`$$`) | `DELIMITER` | — |

`—` — bu bobda sinalmagan yoki mavjud emas.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| PG'da kategoriyani ko'rsatmaslik | Standart `VOLATILE` — indeks ishlamaydi (sinovda 13 ms va 0.013 ms) | Haqiqiy xususiyatga mos `STABLE`/`IMMUTABLE` |
| O'zgaradigan funksiyani `IMMUTABLE` deb e'lon qilish | Optimizator natijani oldindan hisoblaydi / ifoda indeksi eskiradi — noto'g'ri natija | Faqat chindan o'zgarmas funksiyalar uchun |
| PG funksiyasida `COMMIT` | Mumkin emas | Protsedura va `CALL` (tranzaksiya blokidan tashqarida) |
| `CALL` ni `BEGIN … COMMIT` ichida, protsedura `COMMIT` qilsa | `invalid transaction termination` (sinovda) | `CALL` ni alohida chaqirish |
| MySQL'da binlog bilan xususiyatsiz funksiya | `ERROR 1418` | `DETERMINISTIC` / `NO SQL` / `READS SQL DATA` |
| MySQL protsedurasida xato ushlagichsiz tranzaksiya | Xatodan keyin qisman o'zgarishlar qoladi (50-bob) | `DECLARE EXIT HANDLER … ROLLBACK; RESIGNAL` |
| MySQL Community'da JavaScript routine'larga tayanish | Yaratiladi, lekin chaqirilmaydi (`6001`) | SQL routine'lar yoki Enterprise Edition |

## Amaliyot

1. `otkazma` ga `summa <= 0` tekshiruvini qo'shing. Xato matnida SQLSTATE `P0001` (PL/pgSQL `RAISE` standarti) ko'rinadimi (`\set VERBOSITY verbose`)?
2. PL/pgSQL'da `BEGIN … EXCEPTION WHEN check_violation THEN …` bloki bilan xatoni ushlab, `0` qaytaring.
3. `arxivla` ni `COMMIT` siz qiling va 100 000 qatorli jadvalda chaqiring. Butun ish bitta tranzaksiyada bo'ldimi?
4. `CREATE FUNCTION … OUT` parametrli funksiya yozing va `SELECT * FROM f(…)` bilan chaqiring.
5. MySQL'da `SHOW CREATE PROCEDURE otkazma` va `information_schema.routines` dan routine'lar ro'yxatini oling.

## Rasmiy hujjat

- PostgreSQL — 36.3. User-Defined Functions: <https://www.postgresql.org/docs/18/xfunc.html>
- PostgreSQL — 36.4. User-Defined Procedures: <https://www.postgresql.org/docs/18/xproc.html>
- PostgreSQL — 36.7. Function Volatility Categories: <https://www.postgresql.org/docs/18/xfunc-volatility.html>
- PostgreSQL — 41. PL/pgSQL: <https://www.postgresql.org/docs/18/plpgsql.html> · 41.1. Overview: <https://www.postgresql.org/docs/18/plpgsql-overview.html>
- PostgreSQL — CREATE FUNCTION: <https://www.postgresql.org/docs/18/sql-createfunction.html>
- MySQL — 27.2 Using Stored Routines: <https://dev.mysql.com/doc/refman/9.7/en/stored-routines.html>
- MySQL — 27.1 Defining Stored Programs (`DELIMITER`): <https://dev.mysql.com/doc/refman/9.7/en/stored-programs-defining.html>
- MySQL — 27.3 JavaScript Stored Programs: <https://dev.mysql.com/doc/refman/9.7/en/stored-routines-js.html>
- MySQL — 7.5.7 Multilingual Engine Component (MLE): <https://dev.mysql.com/doc/refman/9.7/en/mle-component.html>
- MySQL — 7.4.4 The Binary Log: <https://dev.mysql.com/doc/refman/9.7/en/binary-log.html>
- SQLite — Application-Defined SQL Functions: <https://www.sqlite.org/appfunc.html>
- Python — `sqlite3.Connection.create_function`: <https://docs.python.org/3/library/sqlite3.html#sqlite3.Connection.create_function>
