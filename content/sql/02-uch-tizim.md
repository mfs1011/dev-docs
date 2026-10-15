# 02 — PostgreSQL, MySQL va SQLite

[← Oldingi: Relyatsion model va SQL standarti](01-relyatsion-model.md) · [Mundarija](README.md) · [Keyingi: O'rnatish va ulanish →](03-ornatish-va-ulanish.md)

## Tushuncha

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/02-1-tushuncha.jpg" src="/video/sql/02-1-tushuncha.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/02-1-tushuncha.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/02-1-tushuncha.uz.vtt">
</video>
<figcaption>Video: uch tizim arxitekturasi (jarayonlar, threadlar, bitta fayl) va tanlash mezonlari — "Tushuncha" va "Nega shunday" bo'limlarining qisqa ko'rinishi.</figcaption>
</figure>

Uchala tizim ham SQL tilini tushunadi, lekin **tuzilishi** turlicha. Ikki xil arxitektura bor:

- **Client/server** (mijoz/server). Baza alohida **server** dasturi sifatida doim ishlab turadi. Ilovalar unga **mijoz** (*client*) sifatida ulanadi va so'rov yuboradi. PostgreSQL va MySQL shunday ishlaydi.
- **O'rnatiladigan** (*embedded*). Alohida server yo'q. Baza ilovaning ichida, oddiy kutubxona sifatida ishlaydi. SQLite shunday.

Bu farq qaysi tizimni qachon tanlashni belgilaydi. SQLite hujjati buni aniq aytadi: SQLite client/server bazalar bilan **raqobatlashmaydi**, chunki boshqa muammoni hal qiladi.

### PostgreSQL: har ulanishga alohida jarayon

PostgreSQL hujjatiga ko'ra, bitta PostgreSQL seansi bir-biri bilan hamkorlikda ishlaydigan ikki dasturdan iborat:

- **Server jarayoni.** Baza fayllarini boshqaradi, mijozlardan ulanishlarni qabul qiladi va ular nomidan amallarni bajaradi. Server dasturining nomi — `postgres`.
- **Mijoz ilovasi.** Bazada ish bajarmoqchi bo'lgan dastur. Bu matnli vosita (masalan, `psql`), grafik dastur, veb-server yoki maxsus xizmat vositasi bo'lishi mumkin.

Mijoz va server boshqa-boshqa kompyuterlarda bo'lishi mumkin. Unda ular TCP/IP tarmog'i orqali gaplashadi. Hujjat bundan kelib chiqadigan muhim narsani ta'kidlaydi: mijoz kompyuteridagi fayl server kompyuterida bo'lmasligi mumkin. Bu ayniqsa fayldan ma'lumot yuklashda (21-bob) muhim.

PostgreSQL bir vaqtda ko'p ulanishni qabul qiladi. Buning uchun **har yangi ulanishga yangi jarayon** (*process*) ochadi. Hujjatda bu "fork" deb ataladi. Shundan keyin mijoz shu yangi jarayon bilan to'g'ridan-to'g'ri ishlaydi, bosh `postgres` jarayoni aralashmaydi. Bosh jarayon doim ishlab turadi va yangi ulanishlarni kutadi. Mijozlar va ularga tegishli jarayonlar esa kelib-ketib turadi.

### MySQL: bitta jarayon, har ulanishga alohida thread

MySQL'ning server dasturi `mysqld` deyiladi. Hujjatga ko'ra u **bitta ko'p oqimli** (*multithreaded*) dastur: MySQL o'rnatmasidagi ishning asosiy qismini shu bajaradi va qo'shimcha jarayonlar ochmaydi.

Ulanishlar **thread**lar (oqimlar, ya'ni bitta jarayon ichidagi parallel ish qismlari) orqali boshqariladi. Ulanish menejeri har mijoz ulanishini **unga ajratilgan thread**ga biriktiradi. O'sha thread shu ulanishning autentifikatsiyasi va so'rovlarini bajaradi.

MySQL'ning yana bir o'ziga xosligi — **almashtiriladigan storage engine'lar** (*pluggable storage engines*). Storage engine — jadval ma'lumotini diskda saqlaydigan va o'qiydigan qism. Server qolgan ishni bajaradi: ulanish, SQL'ni tahlil qilish, rejalashtirish. Ma'lumotni jismonan saqlashni esa engine qiladi. Turli jadvallar turli engine'da bo'lishi mumkin.

MySQL 9.7 da sukut bo'yicha engine — **InnoDB**. Hujjatda u "eng umumiy maqsadli" deb ataladi va Oracle maxsus holatlardan tashqari hamma jadval uchun shuni tavsiya qiladi. InnoDB imkoniyatlari:

- tranzaksiyalar (ACID): commit, rollback va xatodan keyin tiklanish;
- qator darajasidagi qulflar;
- tashqi kalitlar;
- ma'lumotni birlamchi kalit bo'yicha tartiblangan **clustered indeks**da saqlash (41-bob).

Boshqa engine'lar maxsus holatlar uchun mo'ljallangan. Masalan:

- `MyISAM` — tranzaksiyasiz, jadval darajasida qulflanadi;
- `MEMORY` — ma'lumot faqat xotirada turadi;
- `CSV` — jadval oddiy CSV fayl.

Bu qo'llanmada MySQL deganda doim **InnoDB** nazarda tutiladi.

### SQLite: kutubxona va bitta fayl

SQLite hujjati o'zini bunday ta'riflaydi: "**ilova jarayoni ichida ishlaydigan kutubxona**. U mustaqil, serversiz, sozlashni talab qilmaydigan, tranzaksiyali SQL dvigatelini amalga oshiradi". Bundan kelib chiqadigan xususiyatlar:

- **Server jarayoni yo'q.** Ilova bazaga tarmoq orqali xabar yubormaydi, oddiy funksiya chaqiradi.
- **Butun baza — bitta fayl.** Jadvallar, indekslar, triggerlar va view'lar hammasi bitta diskdagi faylda turadi.
- **Fayl formati platformadan mustaqil.** Faylni 32 va 64 bitli tizimlar o'rtasida, turli bayt tartibidagi protsessorlar o'rtasida o'zgartirmasdan ko'chirish mumkin.
- **Bir vaqtda faqat bitta yozuvchi.** O'quvchilar soni cheklanmagan, lekin bitta bazaga bir paytda faqat bittasi yoza oladi. Qolganlari navbat kutadi.

Hujjatdagi mashhur jumla: "SQLite'ni Oracle o'rnini bosuvchi emas, `fopen()` o'rnini bosuvchi deb tushuning". `fopen()` — C tilida faylni ochish funksiyasi. Ya'ni SQLite ilovaning o'z fayllarini saqlash usulining o'rnini egallaydi.

SQLite ichida SQL matni avval **bytecode**ga kompilyatsiya qilinadi, keyin bu bytecode **virtual mashinada** bajariladi. Kompilyator qismlari: tokenizer → parser → kod generatori. Ma'lumotni saqlash qismlari: B-tree → pager → operatsion tizim interfeysi.

## Nega shunday: qaysi biri qachon

SQLite hujjati tanlov uchun aniq **nazorat ro'yxati** beradi. Uni so'zma-so'z keltiramiz:

| Savol | Javob "ha" bo'lsa |
| --- | --- |
| Ma'lumot ilovadan tarmoq orqali ajratilganmi? | Client/server tanlang |
| Ko'p yozuvchi bir vaqtda yozishi kerakmi va ular navbat kuta olmaydimi? | Client/server tanlang |
| Ma'lumot bitta faylga sig'maydigan darajada kattami? | Client/server tanlang |
| Qolgan holatlar | **SQLite tanlang** |

Bu ro'yxatdagi "ilova" so'zi SQL yuboradigan kodni bildiradi. Agar ilova serveri va ma'lumot bitta kompyuterda bo'lsa, foydalanuvchi tarmoqning narigi tomonida bo'lsa ham SQLite mos kelishi mumkin.

**SQLite yaxshi ishlaydigan holatlar** (hujjat bo'yicha):

- qurilmalar va "narsalar interneti": telefon, televizor, avtomobil, tibbiy asboblar;
- ish stoli ilovasining fayl formati;
- kam va o'rta trafikli veb-saytlar. Hujjat kuniga 100 mingdan kam murojaatni "ehtiyotkor baho" deydi;
- ma'lumot tahlili: CSV yuklab, SQL bilan hisobot olish;
- katta bazadan olingan ma'lumotning lokal keshi;
- tizimlar o'rtasida ma'lumot uzatish formati;
- vaqtinchalik yoki xotiradagi baza.

**Client/server yaxshiroq bo'ladigan holatlar:**

- **Ko'p mijoz tarmoq orqali bitta bazaga to'g'ridan-to'g'ri ulanadi.** SQLite tarmoq fayl tizimida sekin ishlaydi. Ko'p tarmoq fayl tizimlarida fayl qulflash xatolari bor, bu esa bazani buzishi mumkin.
- **Yozuv ko'p bo'lgan yoki bir nechta server talab qiladigan sayt.**
- **Juda katta ma'lumot.** SQLite bazasi eng ko'pi 281 terabayt bo'ladi va bitta faylda turadi.
- **Yuqori parallel yozish.**

Client/server bazalar hujjatda "korxona ma'lumotlarining **umumiy** ombori" deb ta'riflanadi. Ular masshtablanish, parallellik, markazlashuv va nazoratga urg'u beradi. SQLite esa alohida ilova va qurilma uchun **lokal** saqlashga, tejamkorlik va soddalikka urg'u beradi.

Bu qo'llanma veb-ilovalar ortidagi bazaga qaratilgan, ya'ni ko'p mijoz bitta bazaga ulanadi. Shuning uchun asosiy tizim — client/server PostgreSQL. MySQL ham shu sinfdan. SQLite esa dialektdagi farqlar va o'z o'rni bor joylarda ko'riladi.

## Kod

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/02-2-kod.jpg" src="/video/sql/02-2-kod.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/02-2-kod.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/02-2-kod.uz.vtt">
</video>
<figcaption>Video: quyidagi buyruqlar haqiqiy psql, mysql va sqlite3 terminallarida — jarayonlar (PID), threadlar va bitta fayl formati.</figcaption>
</figure>

Misollar PostgreSQL 18.6, MySQL 9.7.2 va SQLite 3.54.0 da ishga tushirilgan. Natijalar haqiqiy. Ortiqcha qatorlar `…` bilan qisqartirilgan.

### PostgreSQL: jarayonlarni ko'rish

Ikki mijoz bir vaqtda ulanib, 4 soniya kutadigan so'rov yuborganda operatsion tizimdagi jarayonlar (`ps`):

```text
  PID  PPID COMMAND
44311     1 postgres -D pg18 -p 5432
44312 44311 postgres: io worker 0
44313 44311 postgres: io worker 1
44314 44311 postgres: io worker 2
44315 44311 postgres: checkpointer
44316 44311 postgres: background writer
44318 44311 postgres: walwriter
44319 44311 postgres: autovacuum launcher
44320 44311 postgres: logical replication launcher
57937 44311 postgres: postgres qollanma [local] SELECT
57938 44311 postgres: postgres qollanma [local] SELECT
```

Jadvalni o'qish:

- `44311` — bosh `postgres` jarayoni.
- Qolganlarining hammasi uning "bolalari": `PPID` ustunida ota jarayonning raqami 44311.
- Oxirgi ikki qator — ikki mijozga ochilgan **alohida jarayonlar**. Ularda foydalanuvchi (`postgres`), baza (`qollanma`), ulanish turi (`[local]`) va bajarilayotgan buyruq (`SELECT`) ko'rinadi.
- O'rtadagilar — xizmat jarayonlari: diskka yozish, WAL jurnali, autovacuum va boshqalar. Ular keyingi qismlarda (52, 65-boblar) uchraydi.

Shu ma'lumotni PostgreSQL'ning o'zidan ham so'rash mumkin. `pg_stat_activity` view'ida har jarayon uchun bitta qator bor:

```sql
SELECT pid, backend_type, state, query
FROM pg_stat_activity
WHERE backend_type = 'client backend'
ORDER BY pid;
```

```text
  pid  |  backend_type  | state  |                     query
-------+----------------+--------+------------------------------------------------
 57937 | client backend | active | SELECT pg_sleep(4)
 57938 | client backend | active | SELECT pg_sleep(4)
 57944 | client backend | active | SELECT pid, backend_type, state, query FROM …
(3 rows)
```

`pid` qiymatlari `ps` dagi jarayon raqamlari bilan bir xil. Uchinchi qator — shu so'rovni yuborgan seansning o'zi, unga ham alohida jarayon ochilgan.

### MySQL: bitta jarayon, ko'p thread

Xuddi shu holatda, ya'ni ikki mijoz 4 soniya kutayotganda, `ps` faqat **bitta** server jarayonini ko'rsatadi:

```text
  PID  PPID COMMAND
44433     1 /opt/homebrew/opt/mysql@9.7/bin/mysqld --datadir=…
```

Ulanishlar jarayon ichida turadi. Ularni `PROCESSLIST` da ko'rish mumkin:

```sql
SELECT ID, USER, COMMAND, INFO
FROM information_schema.PROCESSLIST
WHERE USER = 'root'
ORDER BY ID;
```

```text
+----+------+---------+--------------------------------------------------+
| ID | USER | COMMAND | INFO                                             |
+----+------+---------+--------------------------------------------------+
| 21 | root | Query   | SELECT SLEEP(4)                                  |
| 22 | root | Query   | SELECT SLEEP(4)                                  |
| 23 | root | Query   | SELECT ID, USER, COMMAND, INFO FROM …            |
+----+------+---------+--------------------------------------------------+
```

Har ulanishning thread'ini `performance_schema` dan ko'ramiz:

```sql
SELECT THREAD_ID, PROCESSLIST_ID, NAME
FROM performance_schema.threads
WHERE PROCESSLIST_ID IS NOT NULL AND TYPE = 'FOREGROUND' AND PROCESSLIST_USER = 'root'
ORDER BY THREAD_ID;
```

```text
+-----------+----------------+---------------------------+
| THREAD_ID | PROCESSLIST_ID | NAME                      |
+-----------+----------------+---------------------------+
|        55 |             22 | thread/sql/one_connection |
|        56 |             21 | thread/sql/one_connection |
|        58 |             24 | thread/sql/one_connection |
+-----------+----------------+---------------------------+
```

Thread nomi ham hujjatdagi qoidani ko'rsatadi: `one_connection`, ya'ni "bitta ulanish uchun bitta thread". Bu so'rov alohida ulanishda yuborilgan. Shuning uchun uning ID'si 24, avvalgi so'rovdagi 23 emas.

### MySQL: storage engine'lar

```sql
SELECT ENGINE, SUPPORT, TRANSACTIONS, COMMENT
FROM information_schema.ENGINES
ORDER BY ENGINE;
```

```text
+--------------------+---------+--------------+----------------------------------------------------------------+
| ENGINE             | SUPPORT | TRANSACTIONS | COMMENT                                                        |
+--------------------+---------+--------------+----------------------------------------------------------------+
| ARCHIVE            | YES     | NO           | Archive storage engine                                         |
| BLACKHOLE          | YES     | NO           | /dev/null storage engine (anything you write to it disappears) |
| CSV                | YES     | NO           | CSV storage engine                                             |
| FEDERATED          | NO      | NULL         | Federated MySQL storage engine                                 |
| InnoDB             | DEFAULT | YES          | Supports transactions, row-level locking, and foreign keys     |
| MEMORY             | YES     | NO           | Hash based, stored in memory, useful for temporary tables      |
| MRG_MYISAM         | YES     | NO           | Collection of identical MyISAM tables                          |
| MyISAM             | YES     | NO           | MyISAM storage engine                                          |
| ndbcluster         | NO      | NULL         | Clustered, fault-tolerant tables                               |
| ndbinfo            | NO      | NULL         | MySQL Cluster system information storage engine                |
| PERFORMANCE_SCHEMA | YES     | NO           | Performance Schema                                             |
+--------------------+---------+--------------+----------------------------------------------------------------+
```

`SUPPORT` ustunining qiymatlari:

- `YES` — engine bor;
- `NO` — engine yo'q;
- `DEFAULT` — engine bor va sukut bo'yicha ishlatiladi.

Tranzaksiyani (`TRANSACTIONS = YES`) bu ro'yxatda faqat InnoDB qo'llab-quvvatlaydi. Mavjud engine'lar MySQL nashriga qarab farq qilishi mumkin.

### SQLite: baza — bitta fayl

SQLite uchun server ishga tushirish shart emas. `sqlite3` dasturiga fayl nomini berish kifoya: fayl yo'q bo'lsa, yaratiladi.

```bash
sqlite3 dokon.db \
  "CREATE TABLE mahsulotlar (id integer PRIMARY KEY, nom text NOT NULL, narx numeric);" \
  "INSERT INTO mahsulotlar (nom, narx) VALUES ('Non', 4000), ('Sut', 12000);" \
  "SELECT * FROM mahsulotlar;"
```

```text
1|Non|4000
2|Sut|12000
```

Natijada diskda bitta fayl paydo bo'ldi:

```bash
ls -l dokon.db
```

```text
-rw-r--r--  1 user  staff  8192 … dokon.db
```

Faylning birinchi 16 bayti:

```bash
head -c 16 dokon.db | od -c
```

```text
0000000    S   Q   L   i   t   e       f   o   r   m   a   t       3  \0
```

Fayl formati hujjatiga ko'ra har bir to'g'ri SQLite fayli aynan shu 16 bayt bilan boshlanadi: `SQLite format 3` satri va oxirida nol bayt.

Bazani ko'chirish yoki zaxiralash uchun oddiy nusxa olish yetadi. Faqat bu paytda unga hech kim yozmayotgan bo'lishi kerak, aks holda 66-bobdagi usullar kerak:

```bash
cp dokon.db nusxa.db
sqlite3 nusxa.db "SELECT count(*) FROM mahsulotlar;"
```

```text
2
```

## Versiyalar va qo'llab-quvvatlash

Uch tizimning reliz siyosati ham turlicha. Bu ma'lumot ishlab chiqarishda qaysi versiyani tanlashga ta'sir qiladi.

**PostgreSQL** (Versioning Policy sahifasi):

- Yangi **asosiy** (*major*) versiya taxminan yiliga bir marta chiqadi. 10-versiyadan boshlab versiya raqamining birinchi qismi asosiy versiyani bildiradi (18), ikkinchisi — kichik relizni (18.**6**).
- Har asosiy versiya birinchi chiqqanidan keyin **5 yil** qo'llab-quvvatlanadi.
- Kichik relizlar kamida uch oyda bir chiqadi va faqat tuzatishlardan iborat. Ularni o'rnatish uchun dump va restore kerak emas: serverni to'xtatib, dasturni yangilab, qayta ishga tushirish kifoya.
- Asosiy versiyaga o'tishda ma'lumot papkasi formati o'zgaradi. Shuning uchun dump/restore yoki `pg_upgrade` kerak bo'ladi.

**MySQL** (MySQL Releases sahifasi). Ikki xil reliz turi bor:

| | LTS | Innovation |
| --- | --- | --- |
| Kim uchun | "Barqaror funksiyalar to'plami va uzoqroq qo'llab-quvvatlash kerak bo'lsa" | "Eng yangi imkoniyatlar kerak bo'lsa" |
| Seriya ichida | Faqat zarur tuzatishlar; funksiya olib tashlanmaydi | Xatti-harakat o'zgarishi, eskirgan funksiyalar olib tashlanishi mumkin |
| Qo'llab-quvvatlash | 5 yil asosiy + 3 yil kengaytirilgan | Keyingi Innovation relizigacha |

Hujjatga ko'ra ikkala tur ham "production uchun yaroqli sifatda". Boshqa qoidalar:

- LTS seriyalar ketma-ket yangilanadi, masalan 8.4 → 9.7. LTS seriyani o'tkazib yuborib bo'lmaydi.
- 9.7 — eski raqamlash bo'yicha oxirgi seriya. Keyingilari yil va oyni bildiradi: 26.7 — 2026-yil iyul relizi.

**SQLite.** Hujjatga ko'ra ishlab chiquvchilar SQLite'ni **2050-yilgacha** qo'llab-quvvatlashni rejalashtirgan. Bugun yaratilgan fayllar o'nlab yillardan keyingi versiyalarda ham o'qiladi. Fayl formati barqaror va hujjatlashtirilgan.

## Dialektlar

<figure class="video">
<video controls preload="metadata" playsinline poster="/video/sql/02-3-dialektlar.jpg" src="/video/sql/02-3-dialektlar.mp4">
<track kind="chapters" srclang="uz" label="Bo'limlar" src="/video/sql/02-3-dialektlar.chapters.vtt" default>
<track kind="subtitles" srclang="uz" label="O'zbekcha" src="/video/sql/02-3-dialektlar.uz.vtt">
</video>
<figcaption>Video: uch tizimning taqqoslash taxtasi, reliz siyosati (PG 5 yil, MySQL LTS, SQLite 2050) va eng muhim tipik xatolar.</figcaption>
</figure>

Bu bobda dialekt farqi tizim tuzilishining o'zida. Qisqacha:

| | PostgreSQL | MySQL | SQLite |
| --- | --- | --- | --- |
| Arxitektura | Client/server | Client/server | Ilova ichidagi kutubxona |
| Server dasturi | `postgres` | `mysqld` | Yo'q |
| Ulanishga ajratiladigan resurs | Alohida jarayon | Alohida thread (bitta jarayon ichida) | Ilovaning funksiya chaqiruvi |
| Saqlash qismi | Bitta, ichki | Almashtiriladigan engine'lar (sukut bo'yicha InnoDB) | B-tree va pager |
| Bazaning diskdagi ko'rinishi | Server boshqaradigan ma'lumot papkasi | Server boshqaradigan ma'lumot papkasi | Bitta fayl |
| Bir vaqtda yozish | Ko'p yozuvchi | Ko'p yozuvchi | Bir paytda bitta yozuvchi |
| Ulanishlarni ko'rish | `pg_stat_activity` | `PROCESSLIST`, `performance_schema.threads` | — |
| Reliz siyosati | Yiliga bitta asosiy versiya, har biri 5 yil | LTS (5+3 yil) va Innovation | 2050-yilgacha qo'llab-quvvatlash rejasi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| SQLite'ni "o'yinchoq baza" deb hisoblash | Hujjatga ko'ra u ko'p holatlarda, jumladan kam va o'rta trafikli saytlarda ham yaxshi ishlaydi | Tanlovni SQLite hujjatidagi nazorat ro'yxati bo'yicha qilish |
| SQLite faylini tarmoq papkasiga qo'yib, ko'p kompyuterdan bir vaqtda yozish | Tarmoq fayl tizimlaridagi qulflash xatolari bazani buzishi mumkin | Bunday holatda client/server baza ishlatish |
| PostgreSQL ulanishini "arzon" deb bilish | Har ulanish alohida operatsion tizim jarayoni | Ulanishlar sonini nazorat qilish, pool ishlatish (64-bob) |
| Faylni server kompyuterida bor deb o'ylash | Mijoz va server boshqa-boshqa kompyuterda bo'lishi mumkin, fayl yo'llari mos kelmaydi | Fayl qaysi kompyuterda ekanini aniqlash (21-bob: `COPY` va `\copy`) |
| MySQL'da jadval qaysi engine'da ekaniga qaramaslik | Tranzaksiyani faqat InnoDB qo'llab-quvvatlaydi; MyISAM jadvali rollback bo'lmaydi | Jadvallarni InnoDB'da yaratish (9.7 da sukut bo'yicha shunday) |
| Ishlab turgan SQLite bazasini `cp` bilan zaxiralash | Nusxa yozish o'rtasida olinsa, buzilgan bo'lishi mumkin | SQLite backup API yoki `VACUUM INTO` (66-bob) |
| Muddati o'tgan versiyada qolib ketish | Xavfsizlik tuzatishlari chiqmaydi | PG: 5 yillik muddatni kuzatish; MySQL: LTS seriya ichida yangilanish |

## Amaliyot

1. Uchta loyiha uchun SQLite nazorat ro'yxatini qo'llang va qaysi tizim mos kelishini asoslang:
   - telefondagi eslatmalar ilovasi;
   - 50 filiali bir vaqtda savdo yozadigan do'kon tarmog'i;
   - kuniga 2 ming tashrifli blog.
2. PostgreSQL'ga ikkita `psql` oynasidan ulaning (o'rnatish — 3-bob). Har birida `SELECT pg_backend_pid();` ni bajaring. Keyin terminalda `ps` bilan shu raqamli jarayonlarni toping.
3. MySQL'da ikki ulanish oching. Har birida `SELECT CONNECTION_ID();` ni bajaring va natijani `information_schema.PROCESSLIST` bilan solishtiring.
4. MySQL'da `SHOW ENGINES;` natijasini o'qing. Qaysi engine'lar tranzaksiyani qo'llab-quvvatlamaydi?
5. `sqlite3` bilan baza yarating, faylning birinchi 16 baytini `od -c` bilan ko'ring. Faylni boshqa papkaga ko'chirib, ochilishini tekshiring.
6. PostgreSQL Versioning Policy sahifasidan foydalanib hisoblang: PostgreSQL 18 qachongacha qo'llab-quvvatlanadi? 18.0 birinchi chiqqan sanani relizlar sahifasidan toping.

## Rasmiy hujjat

- PostgreSQL — 1.2. Architectural Fundamentals: <https://www.postgresql.org/docs/18/tutorial-arch.html>
- PostgreSQL — `pg_stat_activity`: <https://www.postgresql.org/docs/18/monitoring-stats.html>
- PostgreSQL — Versioning Policy: <https://www.postgresql.org/support/versioning/>
- MySQL — 6.3.1 mysqld — The MySQL Server: <https://dev.mysql.com/doc/refman/9.7/en/mysqld.html>
- MySQL — 7.1.12.1 Connection Interfaces: <https://dev.mysql.com/doc/refman/9.7/en/connection-interfaces.html>
- MySQL — Alternative Storage Engines: <https://dev.mysql.com/doc/refman/9.7/en/storage-engines.html>
- MySQL — 18.11 Overview of MySQL Storage Engine Architecture: <https://dev.mysql.com/doc/refman/9.7/en/pluggable-storage-overview.html>
- MySQL — MySQL Releases: Innovation and LTS: <https://dev.mysql.com/doc/refman/9.7/en/mysql-releases.html>
- SQLite — About SQLite: <https://www.sqlite.org/about.html>
- SQLite — Appropriate Uses For SQLite: <https://www.sqlite.org/whentouse.html>
- SQLite — Architecture of SQLite: <https://www.sqlite.org/arch.html>
- SQLite — Database File Format: <https://www.sqlite.org/fileformat2.html>
- SQLite — Long Term Support: <https://www.sqlite.org/lts.html>
