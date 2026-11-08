# 17 — Kesh: cache-aside

[Mundarija](README.md)

## Tushuncha

RD (Cache-aside): **cache-aside** — ilova avval Redis'dan o'qiydi; topilmasa (**miss**) asosiy bazadan o'qiydi va natijani Redis'ga **TTL** bilan yozadi. Keyingi so'rov keshdan oladi (**hit**). Keshga faqat haqiqatan so'ralgan ma'lumot tushadi.

```text
so'rov → Redis'da bormi?
          ├─ ha  (hit)  → javob (millisekunddan kam)
          └─ yo'q (miss) → baza (sekin) → Redis'ga yozish (TTL) → javob
```

RD: qachon kerak — bir xil yozuvlar (mahsulot katalogi, profil, API javobi) yangilanishlar orasida minglab marta o'qiladi. Diskka tayangan baza har so'rovda to'liq narx to'laydi. Bitta jarayon ichidagi kesh esa bir nechta server orasida ishlamaydi: har biri alohida isiydi va bir xil o'chirib (invalidate) bo'lmaydi.

### RD namunasining tuzilishi

| Qism | Nima (RD) |
| --- | --- |
| Kalit | `cache:product:{id}` — **hash**, maydonlar alohida (o'qish va qisman yangilash uchun) |
| TTL | Eskirgan ma'lumot ko'rsatilishi mumkin bo'lgan **eng uzoq vaqt** (namunada 30 s) |
| Miss | Bazadan o'qib, `MULTI`: `DEL` + `HSET` + `EXPIRE` |
| Stampede himoyasi | Bitta qulf (Lua, `SET NX PX`): faqat qulfni olgan klient bazaga boradi, qolganlari keshni qisqa kutadi |
| Yozishda | Kalitni **o'chirish** (invalidate) — keshni yangilashga urinmaslik |

**Stampede** (kesh "bosqini") — RD: mashhur kalit muddati tugaganda barcha parallel o'quvchilar bir vaqtda miss ko'radi; muvofiqlashtirish bo'lmasa hammasi bazaga boradi va keshni qayta-qayta yozadi. Qulfni bo'shatish skripti qulf hali **shu klientniki** ekanini tekshiradi (tasodifiy token) — muddati o'tib boshqasi olgan qulf adashib o'chirilmaydi.

### RD production tavsiyalari

- **TTL** — biznes uchun qancha eskirish mumkinligiga qarab: qisqa TTL — kamroq hit, bazaga ko'proq yuk; uzun — ko'proq hit, ko'proq eskirgan o'qish.
- **O'chiring, sinxron saqlashga urinmang**: yozuv o'zgarsa kalitni o'chirish; keyingi o'qish bazadan oladi.
- **Yo'q yozuvlar**: namunada `null` keshlanmaydi; real tizimda "topilmadi" belgisini qisqa TTL bilan keshlash mumkin.
- **Qulf TTL'i** bazadan o'qishning eng yomon vaqtidan uzun bo'lsin.
- **Nom maydoni**: bir Redis'ni bir nechta ilova ishlatsa — `cache:billing:product:{id}`.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD'dagi namunalar **o'zgarishsiz**: Node.js — `cache.js`, `primary.js`; PHP — `Cache.php`, `Primary.php`, `stampede_worker.php`. "Baza" — 150 ms kechikadigan soxta (mock) ombor. Ular ustiga sinov skriptlari yozildi.

### Node.js

```js
// RD cache-aside (node-redis) namunasi: cache.js va primary.js o'zgarishsiz
const { createClient } = require("redis");
const { RedisCache } = require("./cache.js");
const { MockPrimaryStore } = require("./primary.js");

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const cache = new RedisCache({ redisClient: redis, ttl: 30 });
  const primary = new MockPrimaryStore({ readLatencyMs: 150 });
  const loader = (id) => primary.read(id);
  await cache.invalidate("p-001");

  for (const n of [1, 2]) {
    const t = performance.now();
    const r = await cache.get("p-001", loader);
    console.log(`${n}-o'qish: hit=${r.hit}, ${(performance.now() - t).toFixed(1)} ms, bazadan o'qishlar=${primary.reads()}`);
  }

  // Stampede: kesh bo'sh, bir vaqtda 10 ta so'rov
  await cache.invalidate("p-001"); primary.resetReads(); cache.resetStats();
  await Promise.all(Array.from({ length: 10 }, () => cache.get("p-001", loader)));
  console.log("10 parallel so'rov:", JSON.stringify(cache.stats()), "bazadan o'qishlar:", primary.reads());

  // Bazada narx o'zgardi: kesh eskirgan, invalidate dan keyin yangisi
  primary.updateField("p-001", "price_cents", "700");
  console.log("bazada 700, keshdan:", (await cache.get("p-001", loader)).record.price_cents);
  await cache.invalidate("p-001");
  console.log("invalidate dan keyin:", (await cache.get("p-001", loader)).record.price_cents);
  console.log("TTL:", await cache.ttlRemaining("p-001"));
  await redis.close();
})();
```

```text vps
$ cd cache-aside-node && node sinov.cjs
1-o'qish: hit=false, 158.3 ms, bazadan o'qishlar=1
2-o'qish: hit=true, 1.5 ms, bazadan o'qishlar=1
10 parallel so'rov: {"hits":0,"misses":10,"stampedes_suppressed":9,"hit_rate_pct":0} bazadan o'qishlar: 1
bazada 700, keshdan: 650
invalidate dan keyin: 700
TTL: 30
$ redis-cli HGETALL cache:product:p-001; redis-cli TTL cache:product:p-001; redis-cli DEL cache:product:p-001
id
p-001
name
Sourdough Loaf
price_cents
700
stock
42
30
1
```

- 1-o'qish — miss, 158 ms (bazaning 150 ms kechikishi); 2-o'qish — hit, **1.5 ms**, bazaga borilmadi.
- Kesh bo'sh paytda **10 ta parallel** so'rov: bazaga faqat **1 marta** borildi, 9 tasi qulfni ko'rib, keshni kutdi (`stampedes_suppressed: 9`).
- Bazada narx 700 bo'ldi, kesh esa hali **650** ni berdi — TTL tugaguncha eskirgan ma'lumot. `invalidate` dan keyin — 700.
- Redis'da — hash maydonlari va TTL 30.

### PHP

RD'dagi PHP namunasi statistikani jarayon xotirasida emas, Redis'da (`demo:cache_stats`) saqlaydi: PHP so'rovlari holatni baham ko'rmaydi. Parallellik — 10 ta alohida PHP jarayoni (RD demo'sidagi `stampede_worker.php`):

```php
<?php
// RD cache-aside (Predis) namunasi: Cache.php, Primary.php, stampede_worker.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/Cache.php';
require __DIR__ . '/Primary.php';

$redis = new Predis\Client();
$cache = new RedisCache($redis, ttl: 30);
$primary = new MockPrimaryStore($redis, 150);
$loader = fn(string $id) => $primary->read($id);
$cache->invalidate('p-001'); $primary->resetReads();

foreach ([1, 2] as $n) {
    $t = microtime(true);
    $r = $cache->get('p-001', $loader);
    printf("%d-o'qish: hit=%s, %.1f ms, bazadan o'qishlar=%d\n", $n, var_export($r['hit'], true), (microtime(true) - $t) * 1000, $primary->reads());
}

// Stampede: 10 ta alohida PHP jarayoni bir vaqtda (RD demo'dagi stampede_worker.php)
$cache->invalidate('p-001'); $primary->resetReads(); $cache->resetStats();
$jarayonlar = [];
for ($i = 0; $i < 10; $i++) {
    $jarayonlar[] = proc_open(['php', __DIR__ . '/stampede_worker.php', '127.0.0.1', '6379', 'p-001', '150', '30'], [1 => ['pipe', 'w']], $p);
    $quvurlar[] = $p[1];
}
$hit = 0;
foreach ($quvurlar as $i => $q) { $hit += json_decode(stream_get_contents($q), true)['hit'] ? 1 : 0; proc_close($jarayonlar[$i]); }
echo "10 parallel jarayon: ", json_encode($cache->stats()), " bazadan o'qishlar: ", $primary->reads(), PHP_EOL;

$primary->updateField('p-001', 'price_cents', '700');
echo "bazada 700, keshdan: ", $cache->get('p-001', $loader)['record']['price_cents'], PHP_EOL;
$cache->invalidate('p-001');
echo "invalidate dan keyin: ", $cache->get('p-001', $loader)['record']['price_cents'], PHP_EOL;
echo "TTL: ", $cache->ttlRemaining('p-001'), PHP_EOL;
```

```text vps
$ cd /root/redis-ilova/cache-aside-php && php sinov.php
1-o'qish: hit=false, 155.0 ms, bazadan o'qishlar=1
2-o'qish: hit=true, 0.2 ms, bazadan o'qishlar=1
10 parallel jarayon: {"hits":0,"misses":10,"stampedes_suppressed":9,"hit_rate_pct":0} bazadan o'qishlar: 1
bazada 700, keshdan: 650
invalidate dan keyin: 700
TTL: 30
$ redis-cli HGET cache:product:p-001 price_cents; redis-cli HGETALL demo:cache_stats
700
misses
11
stampedes_suppressed
9
hits
1
```

Natija Node.js bilan bir xil: miss 155 ms → hit **0.2 ms**; 10 jarayondan bazaga **1** tasi bordi; narx o'zgarganda kesh 650 ni berdi, `invalidate` dan keyin 700. Redis'dagi statistika — barcha jarayonlarniki (`misses: 11` — sinovdagi barcha o'qishlar).

## Variantlar

| Naqsh | Qachon | Bob |
| --- | --- | --- |
| Cache-aside | Faqat so'ralgan ma'lumot; eskirish TTL bilan cheklangan | 17 |
| Oldindan yuklash (prefetch) | Hamma o'qish keshdan; ma'lumot oldindan yuklanadi | 18 |
| Write-through / write-behind | Har yozishda kesh to'liq yangilanadi (RD: cache-aside'dan farqli) | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| TTL'siz keshlash | Eskirgan ma'lumot cheksiz qoladi | Har kalitga TTL (RD) |
| Yozishda keshni yangilashga urinish | Poyga holati — kesh va baza farq qiladi | Kalitni o'chirish (RD) |
| Stampede himoyasisiz | Mashhur kalit tugaganda baza bir zumda yuklanadi (sinovda 10 so'rov → 1 o'qish himoya bilan) | Qulf (`SET NX PX`) |
| Qulfni tokensiz o'chirish | Boshqaning qulfini o'chirib yuborish | Token tekshiradigan Lua (RD) |
| Bir nechta ilova bir xil prefiks bilan | Kalitlar ustma-ust tushadi | `cache:{ilova}:...` |

## Amaliyot

1. Cache-aside'da miss bo'lganda ilova nima qiladi?
2. TTL nimani cheklaydi?
3. Stampede nima va RD namunasi uni qanday oldini oladi?
4. Sinovda bazada narx o'zgargach kesh nimani qaytardi va nega?
5. Nega yozishda keshni yangilash emas, o'chirish tavsiya etiladi?
6. PHP namunasi statistikani nega Redis'da saqlaydi?

<details>
<summary>Javoblar</summary>

1. Bazadan o'qiydi va natijani TTL bilan Redis'ga yozadi.
2. Eskirgan ma'lumot ko'rsatilishi mumkin bo'lgan eng uzoq vaqtni.
3. Kalit tugaganda hamma bir vaqtda bazaga boradi; Lua qulfi bilan faqat bittasi boradi.
4. Eski narxni (650) — TTL tugamagan, kalit o'chirilmagan edi.
5. Keyingi o'qish bazadan oladi — kesh eng so'nggi qiymatni saqlaydi deb hech qachon taxmin qilinmaydi (RD).
6. PHP so'rovlari (jarayonlari) holatni baham ko'rmaydi.

</details>

## Rasmiy hujjat

- [RD: Cache-aside](https://redis.io/docs/latest/develop/use-cases/cache-aside/)
- [RD: Cache-aside (node-redis)](https://redis.io/docs/latest/develop/use-cases/cache-aside/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/cache-aside/php/)
