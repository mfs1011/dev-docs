# 18 — Oldindan yuklangan kesh

[Mundarija](README.md)

## Tushuncha

RD (Prefetch cache): **oldindan yuklangan kesh** (prefetch cache) — ma'lumot birinchi so'rovdan **oldin** Redis'ga yuklanadi, shuning uchun har o'qish — hit, hech bir so'rov asosiy bazaga tushmaydi. Mos ma'lumot — **ma'lumotnoma** (reference) jadvallari: mamlakat kodlari, mahsulot kategoriyalari, tarjimalar, sozlamalar.

### Cache-aside'dan farqi (RD)

| | Cache-aside (17-bob) | Prefetch |
| --- | --- | --- |
| Keshga qachon tushadi | Miss bo'lganda, so'ralganda | Oldindan — ishga tushganda va har o'zgarishda |
| Birinchi so'rov | Miss — bazaga boradi | Hit |
| Miss bo'lsa | Bazadan o'qiydi | Bazaga **bormaydi** — miss "kesh to'liq emas" degan belgi |
| Shart | — | Butun to'plam xotiraga sig'ishi va doim yangilanib turishi kerak |

### Qanday ishlaydi (RD)

1. **Ishga tushganda** butun to'plam bitta **pipeline** bilan yuklanadi (`DEL` + `HSET` + `EXPIRE` har yozuvga) — bir necha ming yozuv bitta borib-kelishda.
2. **Sync worker** — alohida jarayon — bazadagi o'zgarishlarni (CDC — Change Data Capture, ma'lumot o'zgarishlarini ushlash) Redis'ga olib o'tadi: o'zgartirildi — hash qayta yoziladi, o'chirildi — kalit o'chiriladi.
3. **Uzoq TTL** (namunada 3600 s) — yangilik mexanizmi emas, **xavfsizlik to'ri**: sync jimgina to'xtab qolsa ham eskirgan ma'lumot abadiy qolmaydi va xotira cheklangan bo'ladi.
4. `SCAN` — kesh qamrovini tekshirish; **stream** — qayta ishga tushganda ma'lum joydan davom etadigan o'zgarishlar oqimi (23-bob).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD namunalari **o'zgarishsiz**: Node.js — `cache.js`, `primary.js`, `sync_worker.js`; PHP — `Cache.php`, `Primary.php`, `SyncWorker.php`, `sync_worker.php`. "Baza" — 80 ms kechikadigan soxta ombor (5 ta kategoriya); o'zgarishlar navbati Node.js'da xotirada, PHP'da Redis ro'yxatida (`demo:primary:changes`, worker uni `BRPOP` bilan o'qiydi).

### Node.js

```js
// RD prefetch-cache (node-redis) namunasi: cache.js, primary.js, sync_worker.js o'zgarishsiz
const { createClient } = require("redis");
const { PrefetchCache } = require("./cache.js");
const { MockPrimaryStore } = require("./primary.js");
const { SyncWorker } = require("./sync_worker.js");
const kut = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const primary = new MockPrimaryStore({ readLatencyMs: 80 });
  const cache = new PrefetchCache({ redisClient: redis, ttlSeconds: 3600 });

  // Ishga tushganda: bazadan hammasini bitta pipeline bilan yuklash
  let t = performance.now();
  const n = await cache.bulkLoad(await primary.listRecords());
  console.log(`bulkLoad: ${n} ta yozuv, ${(performance.now() - t).toFixed(0)} ms, bazadan o'qishlar=${primary.reads()}`);

  for (const id of primary.listIds()) {
    const r = await cache.get(id);
    console.log(`  ${id}: hit=${r.hit}, ${r.redisLatencyMs.toFixed(2)} ms, ${r.record.name}`);
  }
  console.log("bazadan o'qishlar:", primary.reads());

  // Sync worker bazadagi o'zgarishlarni keshga olib o'tadi
  const worker = new SyncWorker({ primary, cache }); worker.start();
  primary.updateField("cat-002", "name", "Bakery & Pastry");
  primary.deleteRecord("cat-004");
  await kut(200);
  console.log("cat-002 keshda:", (await cache.get("cat-002")).record.name);
  console.log("cat-004 keshda: hit =", (await cache.get("cat-004")).hit);

  // Sync uzilgan holatni taqlid: kalit o'chdi — bazaga fallback yo'q
  await cache.invalidate("cat-001");
  const m = await cache.get("cat-001");
  console.log("cat-001 o'chirilgan: hit =", m.hit, ", record =", m.record, ", bazadan o'qishlar:", primary.reads());
  console.log("TTL cat-002:", await cache.ttlRemaining("cat-002"));
  console.log("stats:", JSON.stringify(cache.stats()));
  await worker.stop();
  await cache.clear();
  await redis.close();
})();
```

```text vps
$ cd /root/redis-ilova/prefetch-node && node sinov.cjs
bulkLoad: 5 ta yozuv, 86 ms, bazadan o'qishlar=1
  cat-001: hit=true, 2.19 ms, Beverages
  cat-002: hit=true, 0.97 ms, Bakery
  cat-003: hit=true, 0.67 ms, Pantry Staples
  cat-004: hit=true, 0.67 ms, Frozen
  cat-005: hit=true, 0.74 ms, Specialty Cheeses
bazadan o'qishlar: 1
cat-002 keshda: Bakery & Pastry
cat-004 keshda: hit = false
cat-001 o'chirilgan: hit = false , record = null , bazadan o'qishlar: 1
TTL cat-002: 3600
stats: {"hits":6,"misses":2,"hit_rate_pct":75,"prefetched":5,"sync_events_applied":2,"sync_lag_ms_avg":2.5}
```

- `bulkLoad` — 5 yozuv, bazadan **bitta** o'qish (barcha yozuvlar bir martada).
- Keyingi beshta o'qish — hammasi hit, bazaga bormadi.
- Bazada `cat-002` nomi o'zgardi, `cat-004` o'chirildi — sync worker ikkalasini ham keshga o'tkazdi (`sync_events_applied: 2`, kechikish o'rtacha 2.5 ms).
- `cat-001` kalitini qo'lda o'chirdik ("sync buzildi") — miss, `record = null`, bazaga **borilmadi** (o'qishlar soni hali 1).

### PHP

Sync worker — alohida PHP jarayoni (`SyncWorkerSupervisor` uni `proc_open` bilan ishga tushiradi). Kuzatildi: PHP namunasida `get()` massiv `[record, hit, ms]` qaytaradi (Node.js'da — obyekt `{ record, hit, redisLatencyMs }`).

```php
<?php
// RD prefetch-cache (Predis) namunasi: Cache.php, Primary.php, SyncWorker.php, sync_worker.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/Cache.php';
require __DIR__ . '/Primary.php';
require __DIR__ . '/SyncWorker.php';

$redis = new Predis\Client();
$primary = new MockPrimaryStore($redis, 80);
$primary->seedIfEmpty();
$cache = new PrefetchCache($redis, 'cache:category:', 3600);

$t = microtime(true);
$n = $cache->bulkLoad($primary->listRecords());
printf("bulkLoad: %d ta yozuv, %d ms, bazadan o'qishlar=%d\n", $n, (microtime(true) - $t) * 1000, $primary->reads());
foreach ($primary->listIds() as $id) {
    [$record, $hit, $ms] = $cache->get($id);          // RD: [record, hit, latency]
    printf("  %s: hit=%s, %.2f ms, %s\n", $id, var_export($hit, true), $ms, $record['name']);
}
echo "bazadan o'qishlar: ", $primary->reads(), PHP_EOL;

// Sync worker — alohida PHP jarayoni (BRPOP bilan demo:primary:changes ro'yxatini o'qiydi)
$sup = new SyncWorkerSupervisor($redis, __DIR__ . '/sync_worker.php');
$sup->start(); usleep(500000);
$primary->updateField('cat-002', 'name', 'Bakery & Pastry');
$primary->deleteRecord('cat-004');
usleep(500000);
echo "cat-002 keshda: ", $cache->get('cat-002')[0]['name'], PHP_EOL;
echo "cat-004 keshda: hit = ", var_export($cache->get('cat-004')[1], true), PHP_EOL;
$cache->invalidate('cat-001');
[$record, $hit] = $cache->get('cat-001');
echo "cat-001 o'chirilgan: hit = ", var_export($hit, true), ", record = ", var_export($record, true), ", bazadan o'qishlar: ", $primary->reads(), PHP_EOL;
echo "TTL cat-002: ", $cache->ttlRemaining('cat-002'), PHP_EOL;
$sup->stop();
$cache->clear();
```

```text vps
$ redis-cli --scan --pattern "demo:*" | xargs -r redis-cli DEL
7
$ cd /root/redis-ilova/prefetch-php && php sinov.php
bulkLoad: 5 ta yozuv, 82 ms, bazadan o'qishlar=1
  cat-001: hit=true, 0.08 ms, Beverages
  cat-002: hit=true, 0.09 ms, Bakery
  cat-003: hit=true, 0.08 ms, Pantry Staples
  cat-004: hit=true, 0.07 ms, Frozen
  cat-005: hit=true, 0.08 ms, Specialty Cheeses
bazadan o'qishlar: 1
cat-002 keshda: Bakery & Pastry
cat-004 keshda: hit = false
cat-001 o'chirilgan: hit = false, record = NULL, bazadan o'qishlar: 1
TTL cat-002: 3600
$ redis-cli HGETALL demo:stats:cache:category:
prefetched
5
hits
6
sync_events_applied
2
sync_lag_ms_total
7.8740234375
sync_lag_samples
2
misses
2
$ redis-cli --scan --pattern "demo:*" | xargs -r redis-cli DEL; redis-cli --scan --pattern "cache:category:*" | wc -l
7
0
```

Natija Node.js bilan bir xil: bitta bazaviy o'qish, beshta hit (0.07–0.09 ms), sync ikkita o'zgarishni olib o'tdi, o'chirilgan kalit — miss, bazaga fallback yo'q. Statistika Redis'da (`demo:stats:…`). Sinov kalitlari oxirida o'chirildi.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Kichik, kam o'zgaradigan ma'lumotnoma | Prefetch |
| Katta to'plam, faqat bir qismi so'raladi | Cache-aside (17-bob) |
| Sync qayta ishga tushganda joyidan davom etishi kerak | O'zgarishlar oqimi — stream (23-bob) |
| Ma'lumot o'zgarishini bazaning o'zidan olish | CDC vositasi (RD: Redis Data Integration, Debezium) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Miss'da bazaga borish | Prefetch'da miss — kesh to'liq emasligi belgisi (RD) | Ogohlantirish, qayta yuklash |
| TTL'siz | Sync to'xtasa eskirgan ma'lumot abadiy (RD) | Uzoq xavfsizlik TTL'i |
| TTL'ni yangilik uchun ishlatish | Yangilikni sync beradi, TTL — faqat to'r (RD) | Sync worker |
| Yuklashni bittadan `HSET` bilan | Har biri — alohida RTT (14-bob) | Pipeline |
| O'qilayotgan keshga qayta `bulkLoad` | Kalit o'chirilib, hali yozilmagan payt ko'rinishi mumkin (RD, kod izohi) | Avval yozuvchilarni to'xtatish yoki `MULTI` |

## Amaliyot

1. Prefetch cache-aside'dan nimasi bilan farq qiladi?
2. Prefetch'da miss nimani anglatadi?
3. Ishga tushganda ma'lumot qanday yuklanadi?
4. Uzoq TTL nima uchun kerak?
5. Sinovda bazadagi o'zgarish keshga qanday tushdi?

<details>
<summary>Javoblar</summary>

1. Ma'lumot oldindan yuklanadi, har o'qish — hit, miss'da bazaga borilmaydi.
2. Kesh to'liq emas (masalan, sync buzilgan).
3. Bitta pipeline bilan, har yozuvga `DEL` + `HSET` + `EXPIRE`.
4. Sync to'xtasa eskirgan ma'lumot abadiy qolmasligi va xotira cheklanishi uchun.
5. Sync worker o'zgarishlar navbatidan o'qib, hash'ni qayta yozdi yoki kalitni o'chirdi.

</details>

## Rasmiy hujjat

- [RD: Prefetch cache](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/)
- [RD: Prefetch cache (node-redis)](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/prefetch-cache/php/)
