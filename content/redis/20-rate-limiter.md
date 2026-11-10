# 20 — Rate limiter

[Mundarija](README.md)

## Tushuncha

**Rate limiter** (so'rovlar cheklagichi) — bir foydalanuvchi, IP, API kalit yoki mijoz ma'lum vaqtda nechta so'rov yuborishi mumkinligini cheklaydi. RD: cheklovsiz bo'lsa, trafik to'lqini, suiiste'mol qiluvchi yoki noto'g'ri sozlangan mijoz quyidagi tizimlarni (baza, tashqi API, to'lov tizimi) ishdan chiqaradi yoki cheksiz xarajat qiladi.

RD: har jarayonning o'z hisoblagichi **load balancer** ortida ishlamaydi — bir mijoz turli serverlarga so'rov yuborib cheklovni aylanib o'tadi. Barcha nusxalar bitta umumiy, tez omborga murojaat qilishi kerak — Redis.

### Algoritmlar (RD)

| Algoritm | Xotira | Aniqlik | To'lqin (burst) | Qachon |
| --- | --- | --- | --- | --- |
| **Token bucket** | 1 kalit (hash) | Aniq | Nazoratli to'lqin | To'lqinli trafikli API |
| **Qat'iy oyna** (fixed window) | 1 kalit (string) | Taxminiy | Chegarada 2 baravar | Oddiy API limitlari |
| **Suriluvchi oyna, log** (sliding window log) | Har so'rovga 1 yozuv | Aniq | Yo'q | Qimmat API, audit |
| **Suriluvchi oyna, hisoblagich** | 2 kalit | Deyarli aniq | Silliqlangan | Umumiy API |
| Leaky bucket | 1 kalit (hash) | Aniq | Yo'q | To'lqinsiz qat'iy cheklov |

- **Token bucket** (RD): chelakda tokenlar; har so'rov bitta token oladi; tokenlar doimiy tezlikda to'ladi, lekin sig'imdan oshmaydi. To'plangan tokenlar to'lqinga imkon beradi, uzoq muddatda esa o'rtacha tezlik saqlanadi.
- **Qat'iy oyna**: har oyna — bitta kalit, `INCR` va birinchi so'rovda `EXPIRE`. Kamchiligi (RD): mijoz bir oyna oxirida `limit` ta va keyingisi boshida yana `limit` ta yuborib, **2 baravar** o'tkazishi mumkin.
- **Suriluvchi oyna (log)**: har so'rov vaqti sorted set'da; oynadan eskilari o'chiriladi (`ZREMRANGEBYSCORE`), qolganlari sanaladi (`ZCARD`). Chegarada to'lqin yo'q; xotira so'rovlar soniga qarab o'sadi.

### Nega Lua (RD)

O'qish-qaror-yangilash bitta atomik qadamda bajarilishi kerak (`EVAL`/`EVALSHA`, 15-bob). Aks holda ikki so'rov bir xil tokenlar sonini o'qib, ikkalasi ham o'tib ketadi ("ikki marta sarflash") yoki yangilanishlar bir-birini yo'qotadi. RD muqobil algoritmlarida vaqt Redis serverining o'zidan olinadi (`redis.call('TIME')`) — bir nechta ilova serveri soatlari farq qilsa ham natija to'g'ri bo'ladi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). Node.js — RD'dagi `tokenBucket.js` va qo'llanmadagi muqobil algoritmlar kodi (`oynalar.js` — o'zgarishsiz ko'chirilgan). PHP — `TokenBucket.php` va qo'llanmadagi funksiyalar (`oynalar.php`).

Sinov:

1. Token bucket: sig'im 5, har soniyada 1 token. 7 ta ketma-ket so'rov, 2.1 s kutish, yana 3 ta.
2. Oyna chegarasi: limit — 2 soniyada 5 ta. 1 ta so'rov → 1.8 s kutish → 4 ta → 0.3 s kutish (yangi oyna) → 5 ta.

### Node.js

```js
// RD rate-limiter (node-redis): tokenBucket.js va qo'llanmadagi muqobil algoritmlar (oynalar.js) o'zgarishsiz
const { createClient } = require("redis");
const { TokenBucket } = require("./tokenBucket.js");
const { fixedWindowAllow, slidingWindowLogAllow } = require("./oynalar.js");
const kut = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  await redis.del(["rl:tb:aziz", "rl:fw:aziz", "rl:sw:aziz"]);

  // Token bucket: sig'im 5, har soniyada 1 token
  const tb = new TokenBucket({ capacity: 5, refillRate: 1, refillInterval: 1, redisClient: redis });
  let qator = [];
  for (let i = 0; i < 7; i++) qator.push((await tb.allow("rl:tb:aziz")).allowed ? "✓" : "✗");
  console.log("token bucket, 7 ta ketma-ket:", qator.join(" "));
  await kut(2100);
  qator = [];
  for (let i = 0; i < 3; i++) qator.push((await tb.allow("rl:tb:aziz")).allowed ? "✓" : "✗");
  console.log("2.1 s dan keyin, 3 ta:      ", qator.join(" "));

  // Oyna chegarasi: limit 5 / 2 s. 1 ta so'rov, 1.8 s kutish, 4 ta, 0.3 s kutish, 5 ta
  for (const [nom, f, kalit] of [["qat'iy oyna", fixedWindowAllow, "rl:fw:aziz"], ["suriluvchi oyna (log)", slidingWindowLogAllow, "rl:sw:aziz"]]) {
    const natija = [];
    natija.push((await f(redis, kalit, 5, 2)).allowed);
    await kut(1800);
    for (let i = 0; i < 4; i++) natija.push((await f(redis, kalit, 5, 2)).allowed);
    await kut(300);
    for (let i = 0; i < 5; i++) natija.push((await f(redis, kalit, 5, 2)).allowed);
    const oxirgi = natija.slice(1).filter(Boolean).length;
    console.log(`${nom}: ${natija.map((a) => (a ? "✓" : "✗")).join(" ")} — oxirgi ~0.3 s ichida o'tdi: ${oxirgi}`);
  }
  console.log("rl:tb:aziz:", JSON.stringify(await redis.hGetAll("rl:tb:aziz")));
  await redis.del(["rl:tb:aziz", "rl:fw:aziz", "rl:sw:aziz"]);
  await redis.close();
})();
```

```text vps
$ cd /root/redis-ilova/rate-node && node sinov.cjs
token bucket, 7 ta ketma-ket: ✓ ✓ ✓ ✓ ✓ ✗ ✗
2.1 s dan keyin, 3 ta:       ✓ ✓ ✗
qat'iy oyna: ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ — oxirgi ~0.3 s ichida o'tdi: 9
suriluvchi oyna (log): ✓ ✓ ✓ ✓ ✓ ✓ ✗ ✗ ✗ ✗ — oxirgi ~0.3 s ichida o'tdi: 5
rl:tb:aziz: {"tokens":"0","last_refill":"1794178832.024"}
```

### PHP

```php
<?php
// RD rate-limiter (Predis): TokenBucket.php va qo'llanmadagi muqobil algoritmlar (oynalar.php) o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/TokenBucket.php';
require __DIR__ . '/oynalar.php';

$r = new Predis\Client();
$r->del(['rl:tb:aziz', 'rl:fw:aziz', 'rl:sw:aziz']);
$belgi = fn(bool $a) => $a ? '✓' : '✗';

$tb = new TokenBucket(5, 1.0, 1.0, $r);
$q = []; for ($i = 0; $i < 7; $i++) $q[] = $belgi($tb->allow('rl:tb:aziz')['allowed']);
echo "token bucket, 7 ta ketma-ket: ", implode(' ', $q), PHP_EOL;
usleep(2100000);
$q = []; for ($i = 0; $i < 3; $i++) $q[] = $belgi($tb->allow('rl:tb:aziz')['allowed']);
echo "2.1 s dan keyin, 3 ta:       ", implode(' ', $q), PHP_EOL;

foreach ([["qat'iy oyna", 'fixedWindowAllow', 'rl:fw:aziz'], ['suriluvchi oyna (log)', 'slidingWindowLogAllow', 'rl:sw:aziz']] as [$nom, $f, $k]) {
    $n = [$f($r, $k, 5, 2)['allowed']];
    usleep(1800000);
    for ($i = 0; $i < 4; $i++) $n[] = $f($r, $k, 5, 2)['allowed'];
    usleep(300000);
    for ($i = 0; $i < 5; $i++) $n[] = $f($r, $k, 5, 2)['allowed'];
    printf("%s: %s — oxirgi ~0.3 s ichida o'tdi: %d\n", $nom, implode(' ', array_map($belgi, $n)), count(array_filter(array_slice($n, 1))));
}
$r->del(['rl:tb:aziz', 'rl:fw:aziz', 'rl:sw:aziz']);
```

```text vps
$ cd /root/redis-ilova/rate-php && php sinov.php
token bucket, 7 ta ketma-ket: ✓ ✓ ✓ ✓ ✓ ✗ ✗
2.1 s dan keyin, 3 ta:       ✓ ✓ ✗
qat'iy oyna: ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ — oxirgi ~0.3 s ichida o'tdi: 9
suriluvchi oyna (log): ✓ ✓ ✓ ✓ ✓ ✓ ✗ ✗ ✗ ✗ — oxirgi ~0.3 s ichida o'tdi: 5
```

Ikki tilda natija bir xil:

- **Token bucket**: 5 tasi o'tdi (sig'im), 6- va 7- rad etildi. 2.1 soniyada **2 ta** token to'ldi — 2 ta o'tdi, uchinchisi rad. Chelak holati — hash: `tokens`, `last_refill`.
- **Qat'iy oyna**: oxirgi ~0.3 soniya ichida **9 ta** so'rov o'tdi — limit 5 bo'lsa ham. Birinchi oynaning oxirgi 4 tasi va yangi oynaning 5 tasi — RD aytgan chegaradagi 2 baravar to'lqin.
- **Suriluvchi oyna (log)**: o'sha vaqt ichida **5 ta** o'tdi — 2 soniyalik har qanday oralig'ida 5 tadan ko'p emas.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Oddiy, "minutiga 100 ta" | Qat'iy oyna — eng sodda, bitta kalit |
| Chegarada to'lqin qabul qilinmaydi | Suriluvchi oyna (log yoki hisoblagich) |
| Qisqa to'lqinlarga ruxsat, o'rtacha tezlik cheklangan | Token bucket |
| Juda ko'p mijoz, ko'p so'rov | Log emas — xotira O(n) (RD) |
| Tayyor kutubxona (Node.js) | RD: `rate-limiter-flexible`, `express-rate-limit` (Redis store bilan) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har jarayonda o'z hisoblagichi | Load balancer ortida aylanib o'tiladi (RD) | Umumiy Redis |
| `GET` → tekshirish → `SET` alohida buyruqlar | Poyga holati, ikki marta sarflash (RD) | Lua (`EVAL`) |
| Qat'iy oyna — aniq limit deb o'ylash | Chegarada 2 baravar (sinovda 9/5) | Suriluvchi oyna |
| Ilova serveri soatiga tayanish | Serverlar soati farq qiladi | `redis.call('TIME')` (RD) |
| Rad etilganda sababsiz javob | Mijoz qachon qayta urinishni bilmaydi | `Retry-After` (RD namunasidagi `retry_after_ms`) |

## Amaliyot

1. Nega har jarayonning o'z hisoblagichi yetarli emas?
2. Token bucket qanday ishlaydi?
3. Sinovda qat'iy oyna nega 0.3 soniyada 9 ta so'rovni o'tkazdi?
4. Suriluvchi oyna (log) qanday ma'lumot turidan foydalanadi va kamchiligi nima?
5. Nega rate limiter mantiqi Lua skriptda?

<details>
<summary>Javoblar</summary>

1. Load balancer ortida mijoz turli serverlarga borib cheklovni aylanib o'tadi.
2. Har so'rov token oladi, tokenlar doimiy tezlikda sig'imgacha to'ladi; token bo'lmasa — rad.
3. Birinchi oyna oxiridagi 4 ta va yangi oynadagi 5 ta — oyna chegarasida hisoblagich nolga tushadi.
4. Sorted set; xotira so'rovlar soniga qarab o'sadi.
5. O'qish, qaror va yangilash atomik bo'lishi uchun — poyga holati bo'lmasin.

</details>

## Rasmiy hujjat

- [RD: Rate limiter](https://redis.io/docs/latest/develop/use-cases/rate-limiter/)
- [RD: Rate limiter (node-redis)](https://redis.io/docs/latest/develop/use-cases/rate-limiter/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/rate-limiter/php/) — Alternative rate limiting algorithms
