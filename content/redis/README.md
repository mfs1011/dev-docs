# Redis — xotiradagi tezkor ombor

Bu qo'llanma Redis'ni dasturchi ko'zi bilan o'rgatadi: ma'lumot turlari va ular bilan ishlaydigan buyruqlar, ilovadan ulanish, keyin amaliy naqshlar — kesh, sessiya, rate limit, fon ishlari navbati, pub/sub, reyting jadvali, taqsimlangan qulf. Oxirida serverdagi Redis: xotira, saqlash (persistence), xavfsizlik, replikatsiya, Sentinel, Cluster va kuzatish.

Mundarija Redis'ning rasmiy hujjati tuzilmasiga solishtirib tuzilgan. Amaliy naqshlar hujjatdagi "Use cases" bo'limidan olingan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Redis Open Source | 8.10.3 (2026-10-26). Hujjat eng so'nggi versiyani ishlatishni qat'iy tavsiya qiladi | <https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/> · <https://github.com/redis/redis/releases> |
| O'rnatish | Redis'ning rasmiy APT ombori (`packages.redis.io`), unda Ubuntu 26.04 uchun 8.10.3 bor. Ubuntu'ning o'z paketi — 8.0.5 (universe), Redis 8.0 seriyasining qo'llab-quvvatlashi 2026-12-01 da tugaydi | <https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/apt/> · VPS: `apt-cache policy redis-server` |
| Node.js klienti | `node-redis` (npm'da `redis`), 6.3.1; Node.js 26.13.0 LTS (2026-11-09 da tekshirilgan) | <https://redis.io/docs/latest/develop/clients/nodejs/> · <https://www.npmjs.com/package/redis> · <https://nodejs.org/dist/index.json> |
| PHP klienti | `Predis` (Packagist'da `predis/predis`), 3.7.1 (2026-11-03); PHP 8.5.4, Composer 2.11.1. Hujjat Predis'ni PHP uchun tavsiya etilgan klient deydi (u Redis tomonidan emas, uchinchi tomon tomonidan ishlab chiqiladi) | <https://redis.io/docs/latest/develop/clients/php/> · <https://packagist.org/packages/predis/predis> |
| Sinov VPS | Ubuntu 26.04 LTS | — |

Muhit tanlovi haqida:

- **Versiya.** Redis'ning versiyalar siyosatiga ko'ra oraliq (standard) relizlar keyingi reliz chiqqandan keyin 6 oy, uzaytirilgan (extended) relizlar esa 5 yil xavfsizlik tuzatishlarini oladi. Hujjat eng so'nggisini tavsiya qiladi, shuning uchun qo'llanma 8.10 ga tayanadi.
- **Nega Node.js va PHP.** Hujjatdagi amaliy naqshlar (Use cases) har biri bir nechta tilda yozilgan, ular orasida Node.js (`node-redis`) va PHP (`Predis`) ham bor. Saytda JavaScript va Laravel/Symfony kitoblari bor, shuning uchun har misol ikki tilda beriladi.

Qisqartmalar:

- **RD** — Redis rasmiy hujjati (redis.io/docs/latest).

"Muhit" ustunida:

- **V** — VPS'da, `redis-cli` bilan.
- **V+N** — VPS'dagi Redis va ilova kodi: Node.js (`node-redis`) va PHP (`Predis`).
- **—** — tushuncha bobi, buyruqsiz.

Bu qo'llanmaga kirmaydigan mavzular:

- Navbat va hodisalar oqimi tizimlarini taqqoslash (Redis, RabbitMQ, Kafka) — **"Xabar tizimlari"** kitobida.
- Qidiruv (Query Engine), vektorlar va sun'iy intellekt uchun imkoniyatlar, Redis Cloud va Redis Software (pullik mahsulotlar) — hujjatda: [RD Search and query](https://redis.io/docs/latest/develop/ai/search-and-query/).

> **Holat.** Qo'llanma yozilmoqda: 28/34 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar va kod** — VPS'da ishga tushirilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Redis nima](01-redis-nima.md) | Ma'lumotni xotirada (in-memory) saqlaydigan kalit-qiymat ombori. Ma'lumot turlari. Qayerda ishlatiladi: kesh, sessiya, navbat, hisoblagich, reyting | V | [RD Redis as an in-memory data structure store](https://redis.io/docs/latest/develop/get-started/data-store/) · [RD Use cases](https://redis.io/docs/latest/develop/use-cases/) |
| 02 | [O'rnatish](02-ornatish.md) | Rasmiy APT omboridan o'rnatish, servis, `redis-cli ping`. Ubuntu paketi va versiyalar siyosati | V | [RD Install on Ubuntu/Debian (APT)](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/apt/) · [RD Version management](https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/) |
| 03 | [redis-cli](03-redis-cli.md) | Interaktiv rejim, bitta buyruqni bajarish, kalitlarni ko'rib chiqish (`--scan`), chiqish formatlari | V | [RD Redis CLI](https://redis.io/docs/latest/develop/tools/cli/) |
| 04 | [Kalitlar va muddat](04-kalitlar-muddat.md) | Kalit nomlash. `EXISTS`, `DEL`, `TYPE`. Hamma kalitni ko'rish uchun `SCAN` (production'da `KEYS` emas). Muddat: `EXPIRE`, `TTL`, `PERSIST` | V | [RD Keys and values](https://redis.io/docs/latest/develop/using-commands/keyspace/) · [RD SCAN](https://redis.io/docs/latest/commands/scan/) · [RD KEYS](https://redis.io/docs/latest/commands/keys/) |

## II qism — Ma'lumot turlari (5–12)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [String](05-string.md) | `SET` va `GET`, `NX`/`XX`/`EX` parametrlari. `INCR` bilan hisoblagich | V | [RD Strings](https://redis.io/docs/latest/develop/data-types/strings/) |
| 06 | [Hash](06-hash.md) | Obyekt maydonlari: `HSET`, `HGET`, `HGETALL`. Alohida maydonga muddat (`HEXPIRE`) | V | [RD Hashes](https://redis.io/docs/latest/develop/data-types/hashes/) |
| 07 | [List](07-list.md) | `LPUSH`/`RPUSH`, `LPOP`/`RPOP`. Kutib turuvchi (blocking) `BLPOP`. `LMOVE`. Navbat va stek | V | [RD Lists](https://redis.io/docs/latest/develop/data-types/lists/) |
| 08 | [Set](08-set.md) | Takrorlanmaydigan qiymatlar to'plami: `SADD`, `SISMEMBER`, `SINTER` | V | [RD Sets](https://redis.io/docs/latest/develop/data-types/sets/) |
| 09 | [Sorted set](09-sorted-set.md) | Ball (score) bo'yicha tartiblangan to'plam: `ZADD`, `ZRANGE`, `ZRANK` | V | [RD Sorted sets](https://redis.io/docs/latest/develop/data-types/sorted-sets/) |
| 10 | [Stream](10-stream.md) | Faqat oxiriga yoziladigan jurnal: `XADD`, `XRANGE`, `XREAD`. Consumer group: `XREADGROUP`, `XACK`, kutilayotgan yozuvlar (pending) | V | [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 11 | [JSON](11-json.md) | Redis Open Source'dagi JSON turi: `JSON.SET`, `JSON.GET`, yo'l (path) bilan ishlash | V | [RD JSON](https://redis.io/docs/latest/develop/data-types/json/) |
| 12 | [Qaysi turni tanlash](12-turni-tanlash.md) | Geo-ma'lumotlar, ehtimollik tuzilmalari (HyperLogLog, Bloom filter) qisqacha. Turlarni taqqoslash | V | [RD Compare data types](https://redis.io/docs/latest/develop/data-types/compare-data-types/) · [RD Geospatial](https://redis.io/docs/latest/develop/data-types/geospatial/) · [RD Probabilistic](https://redis.io/docs/latest/develop/data-types/probabilistic/) |

## III qism — Ilovadan foydalanish (13–16)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 13 | [Ilovadan ulanish](13-ilovadan-ulanish.md) | `node-redis` va `Predis`: ulanish, buyruq yuborish, xatolarni ushlash | V+N | [RD node-redis](https://redis.io/docs/latest/develop/clients/nodejs/) · [RD Connect (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/connect/) · [RD Error handling (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/error-handling/) · [RD Predis guide (PHP)](https://redis.io/docs/latest/develop/clients/php/) · [RD Error handling (PHP)](https://redis.io/docs/latest/develop/clients/php/error-handling/) |
| 14 | [Pipeline va tranzaksiya](14-pipeline-tranzaksiya.md) | Pipeline: ko'p buyruqni bitta borib-kelishda yuborish. `MULTI`/`EXEC`. `WATCH` bilan optimistik qulf | V+N | [RD Pipelining](https://redis.io/docs/latest/develop/using-commands/pipelining/) · [RD Transactions](https://redis.io/docs/latest/develop/using-commands/transactions/) · [RD Pipelines and transactions (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/transpipe/) · [RD Pipelines and transactions (PHP)](https://redis.io/docs/latest/develop/clients/php/transpipe/) |
| 15 | [Lua skriptlar va funksiyalar](15-lua.md) | `EVAL`: bir nechta qadamni server ichida bitta atomik amal qilib bajarish. Redis Functions | V | [RD Scripting with Lua](https://redis.io/docs/latest/develop/programmability/eval-intro/) · [RD Functions](https://redis.io/docs/latest/develop/programmability/functions-intro/) |
| 16 | [Production'da klient](16-production-klient.md) | Ulanish, timeout va qayta ulanish sozlamalari | V+N | [RD Production usage (Node.js)](https://redis.io/docs/latest/develop/clients/nodejs/produsage/) · [node-redis Command options](https://github.com/redis/node-redis/blob/master/docs/command-options.md) · [RD Error handling (PHP)](https://redis.io/docs/latest/develop/clients/php/error-handling/) · [Predis README](https://github.com/predis/predis/blob/v3.7.1/README.md) |

## IV qism — Amaliy naqshlar (17–25)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 17 | [Kesh: cache-aside](17-cache-aside.md) | Bazadan o'qishni keshlash. TTL bilan eskirishni cheklash. Ma'lumot o'zgarganda keshni yangilash | V+N | [RD Cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/) · [RD Cache-aside (node-redis)](https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/cache-aside/php/) |
| 18 | [Oldindan yuklangan kesh](18-prefetch.md) | Ma'lumotni oldindan yuklab qo'yish (prefetch): har o'qish keshdan | V+N | [RD Prefetch cache](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/) · [RD Prefetch cache (node-redis)](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/php/) |
| 19 | Sessiyalar | Veb-sessiyalarni Redis'da saqlash va muddatini boshqarish | V+N | [RD Session store](https://redis.io/docs/latest/develop/use-cases/session-store/) |
| 20 | Rate limiter | So'rovlar sonini cheklash: qat'iy oyna (fixed window), suriluvchi oyna (sliding window), token bucket | V+N | [RD Rate limiter](https://redis.io/docs/latest/develop/use-cases/rate-limiter/) |
| 21 | Fon ishlari navbati | Ishonchli navbat (`BLMOVE`). Kechiktirilgan ishlar (sorted set) | V+N | [RD Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/) · [RD Lists](https://redis.io/docs/latest/develop/data-types/lists/) |
| 22 | Pub/Sub | Kanallar va obunachilar. Yetkazish "ko'pi bilan bir marta" (at-most-once): o'sha payt ulanmagan obunachi xabarni olmaydi. Kalit o'zgarishlari haqida xabar (keyspace notifications) | V+N | [RD Pub/sub](https://redis.io/docs/latest/develop/pubsub/) · [RD Pub/sub messaging](https://redis.io/docs/latest/develop/use-cases/pub-sub/) · [RD Keyspace notifications](https://redis.io/docs/latest/develop/pubsub/keyspace-notifications/) |
| 23 | Hodisalar oqimi | Stream va consumer group: tartib, qayta o'qish, saqlash hajmi | V+N | [RD Streaming](https://redis.io/docs/latest/develop/use-cases/streaming/) · [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 24 | Reyting jadvali | Sorted set bilan reyting (leaderboard) va foydalanuvchi ma'lumotlari | V+N | [RD Leaderboard](https://redis.io/docs/latest/develop/use-cases/leaderboard/) |
| 25 | [Taqsimlangan qulf](25-qulf.md) | Bitta Redis bilan to'g'ri qulf (`SET ... NX PX`). Redlock algoritmi va hujjatda aytilgan xavfsizlik shartlari | V | [RD Distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/) |

## V qism — Server (26–34)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 26 | [Konfiguratsiya](26-konfiguratsiya.md) | `redis.conf`. Ishlab turgan serverda `CONFIG GET`/`CONFIG SET` | V | [RD Configuration](https://redis.io/docs/latest/operate/oss_and_stack/management/config/) |
| 27 | [Xotira chegarasi va evikt](27-xotira-evikt.md) | `maxmemory`. Xotira to'lganda qaysi kalit o'chiriladi (eviction policy). Xotirani tejash | V | [RD Key eviction](https://redis.io/docs/latest/develop/reference/eviction/) · [RD Memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/) |
| 28 | [Diskka saqlash](28-diskka-saqlash.md) | RDB (snapshot) va AOF (har yozuv jurnali), ikkalasi birga. Qayta yonganda tiklash. Qaysi biri qachon | V | [RD Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) |
| 29 | [Xavfsizlik](29-xavfsizlik.md) | Himoyalangan rejim (protected mode), `bind`, parol. ACL foydalanuvchilari. TLS | V | [RD Security](https://redis.io/docs/latest/operate/oss_and_stack/management/security/) · [RD ACL](https://redis.io/docs/latest/operate/oss_and_stack/management/security/acl/) · [RD TLS](https://redis.io/docs/latest/operate/oss_and_stack/management/security/encryption/) |
| 30 | [Replikatsiya](30-replikatsiya.md) | Asosiy server va replika. Asinxron nusxalash. Replika faqat o'qish uchun | V | [RD Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/) |
| 31 | [Sentinel](31-sentinel.md) | Asosiy server ishdan chiqsa, replikani avtomatik asosiyga aylantirish (failover) | V | [RD Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) |
| 32 | [Cluster](32-cluster.md) | Ma'lumotni bir nechta serverga bo'lish (sharding), hash slot'lar. Hujjatdagi kabi bitta mashinada 6 tugun | V | [RD Scale with Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/) |
| 33 | [Kuzatish va kechikish](33-kuzatish.md) | `INFO`, `SLOWLOG`, kechikish monitori. Kechikish sabablari. Administrator maslahatlari | V | [RD Latency](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/) · [RD Latency monitor](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency-monitor/) · [RD Administration](https://redis.io/docs/latest/operate/oss_and_stack/management/admin/) · [RD Troubleshooting](https://redis.io/docs/latest/operate/oss_and_stack/management/troubleshooting/) |
| 34 | [Yangilash](34-yangilash.md) | Bitta serverni yangilash tartibi. Versiyalar siyosati | V | [RD Upgrade a standalone instance](https://redis.io/docs/latest/operate/oss_and_stack/install/upgrade/standalone/) · [RD Version management](https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 14 | Pipeline'siz va pipeline bilan: tarmoq bo'ylab borib-kelishlar soni |
| 17 | Cache-aside: keshda bor (hit) va yo'q (miss) holatlarida so'rov yo'li |
| 20 | Qat'iy oyna va suriluvchi oyna: chegarada so'rovlar qanday sanaladi |
| 22 | Pub/Sub: ulanmagan obunachi xabarni yo'qotadi; stream'da esa qoladi |
| 28 | RDB va AOF: server o'chganda qaysi ma'lumot qoladi |
