# 21 — Fon ishlari navbati

[Mundarija](README.md)

## Tushuncha

Foydalanuvchi bitta amal qiladi — ortidan bir nechta ish kerak bo'ladi: xat yuborish, hisobot tuzish, to'lov tizimiga xabar. RD (Job queue): bularni so'rov ichida **sinxron** bajarish yuklama ostida foydalanuvchini kuttiradi. Ish **navbatga** qo'yiladi, alohida **worker** (ishchi jarayon) uni keyin bajaradi.

RD: oddiy yo'llarning kamchiliklari:

- **Jarayon ichidagi navbat** — jarayon qulasa ishlar yo'qoladi, ishni bir nechta worker'ga bo'lib bo'lmaydi.
- **Bazadan kutilayotgan qatorlarni so'rab turish** (polling) — bazaga doimiy yuk, worker'lar bir qatorga talashadi.
- **Alohida xabar brokeri** (RabbitMQ, Kafka) — yana bitta tizimni o'rnatish, kuzatish va to'lash kerak.

Ishonchli navbatga kerak: **kamida bir marta yetkazish** (at-least-once delivery), navbatdan worker'ga **atomik** o'tkazish va **qulagan worker'dan** ishni qaytarib olish.

### RD namunasining tuzilishi

```text
enqueue → LPUSH pending          claim → BLMOVE pending → processing
complete → processing'dan o'chirish, completed ro'yxati, hash'ga TTL
fail → urinish qolgan bo'lsa pending'ga, aks holda failed
reclaimStuck → processing'da "ko'rinmaslik muddati"dan oshganlarni pending'ga
```

| Qism | Nima (RD) |
| --- | --- |
| `queue:jobs:pending` (list) | Kutayotgan ish ID'lari |
| `queue:jobs:processing` (list) | Olingan, hali tugamagan ishlar |
| `queue:jobs:job:{id}` (hash) | Ish ma'lumoti: `payload`, `status`, `attempts`, `claim_token`, vaqtlar |
| `BLMOVE` | Kutib turadi va keyingi ishni **bitta buyruqda** pending'dan processing'ga o'tkazadi (eskirgan `BRPOPLPUSH` o'rnida; node-redis v5 da `brPopLPush` olib tashlangan) |
| **Ko'rinmaslik muddati** (visibility timeout) | Olingan ish shu vaqtdan ko'p processing'da tursa — worker qulagan deb hisoblanadi |
| `claim_token` | Har olishda yangi token; ish qaytarib olingandan keyin eski worker uni **tugata olmaydi** |
| Lua | `complete`, `fail`, `reclaim` — har biri bitta atomik qadam |

RD production tavsiyalari: ko'rinmaslik muddati eng uzun haqiqiy ishdan katta bo'lsin (aks holda sog' worker'ning sekin ishi ikki marta bajariladi); `reclaimStuck()` ni jadval bo'yicha ishga tushirish; `maxAttempts` ni ish turiga qarab — idempotent bo'lmagan tashqi tizimlar (to'lov) uchun idempotentlik kaliti yoki kamroq urinish.

### Kechiktirilgan ishlar

RD (umumiy sahifa): kechiktirilgan va ustuvor navbatlar — **sorted set** (`ZADD`, `ZRANGEBYSCORE`), ball — bajarilish vaqti yoki ustuvorlik. RD bunga kod namunasi bermaydi; quyida `redis-cli` bilan g'oya ko'rsatilgan.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). RD namunalari o'zgarishsiz: Node.js — `job_queue.js`, PHP — `JobQueue.php`. Sinov uchun ko'rinmaslik muddati 1000 ms, urinishlar chegarasi 2.

### Node.js

```js
// RD job-queue (node-redis) namunasi: job_queue.js o'zgarishsiz
const { createClient } = require("redis");
const { RedisJobQueue } = require("./job_queue.js");
const kut = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const redis = createClient();
  redis.on("error", (e) => console.log(e));
  await redis.connect();
  const q = new RedisJobQueue({ redisClient: redis, visibilityMs: 1000, maxAttempts: 2 });
  await q.purge();

  // 1) Muvaffaqiyatli ish
  await q.enqueue({ turi: "email" });
  let j = await q.claim();
  console.log(`olindi: ${j.payload.turi} (urinish ${j.attempts})`);
  console.log("complete:", await q.complete(j, { ok: true }));

  // 2) Xato: birinchi marta navbatga qaytadi, ikkinchi marta (maxAttempts=2) — failed
  await q.enqueue({ turi: "hisobot" });
  for (let i = 0; i < 2; i++) {
    j = await q.claim();
    await q.fail(j, "SMTP timeout");
    console.log(`olindi: ${j.payload.turi} (urinish ${j.attempts}) → fail → ${(await q.getJob(j.id)).status}`);
  }

  // 3) Worker "qulab tushdi": ishni oldi, lekin tugatmadi
  await q.enqueue({ turi: "sms" });
  j = await q.claim();
  console.log(`olindi: ${j.payload.turi} (urinish ${j.attempts}) — worker yo'qoldi`);
  console.log("processing:", (await q.listProcessing()).length);
  await kut(1200);                                   // visibility 1000 ms o'tdi
  console.log("reclaimStuck:", (await q.reclaimStuck()).length, "ta ish qaytarildi");
  console.log("eski token bilan complete:", await q.complete(j, { ok: true }));
  j = await q.claim();
  console.log(`qayta olindi: ${j.payload.turi} (urinish ${j.attempts})`);
  await q.complete(j, { ok: true });

  const s = await q.stats();
  console.log(`pending=${s.pending_depth} processing=${s.processing_depth} completed=${s.completed_depth} failed=${s.failed_depth}`);
  await redis.close();
})();
```

### PHP

```php
<?php
// RD job-queue (Predis) namunasi: JobQueue.php o'zgarishsiz
require __DIR__ . '/vendor/autoload.php';
require __DIR__ . '/JobQueue.php';

$q = new JobQueue(new Predis\Client(), 'jobs', 1000, 300, 50, 2);
$q->purge();
$q->enqueue(['turi' => 'email']);
$j = $q->claim();
echo "olindi: {$j->payload['turi']} (urinish {$j->attempts})", PHP_EOL;
echo "complete: ", var_export($q->complete($j, ['ok' => true]), true), PHP_EOL;

$q->enqueue(['turi' => 'hisobot']);
for ($i = 0; $i < 2; $i++) {
    $j = $q->claim();
    $q->fail($j, 'SMTP timeout');
    echo "olindi: {$j->payload['turi']} (urinish {$j->attempts}) → fail → ", $q->getJob($j->id)['status'], PHP_EOL;
}

$q->enqueue(['turi' => 'sms']);
$j = $q->claim();
echo "olindi: {$j->payload['turi']} (urinish {$j->attempts}) — worker yo'qoldi", PHP_EOL;
echo "processing: ", count($q->listProcessing()), PHP_EOL;
usleep(1200000);
echo "reclaimStuck: ", count($q->reclaimStuck()), " ta ish qaytarildi", PHP_EOL;
echo "eski token bilan complete: ", var_export($q->complete($j, ['ok' => true]), true), PHP_EOL;
$j = $q->claim();
echo "qayta olindi: {$j->payload['turi']} (urinish {$j->attempts})", PHP_EOL;
$q->complete($j, ['ok' => true]);

$s = $q->stats();
printf("pending=%d processing=%d completed=%d failed=%d\n", $s['pending_depth'], $s['processing_depth'], $s['completed_depth'], $s['failed_depth']);
```

```text vps
$ cd /root/redis-ilova/job-node && node sinov.cjs
olindi: email (urinish 1)
complete: true
olindi: hisobot (urinish 1) → fail → pending
olindi: hisobot (urinish 2) → fail → failed
olindi: sms (urinish 1) — worker yo'qoldi
processing: 1
reclaimStuck: 1 ta ish qaytarildi
eski token bilan complete: false
qayta olindi: sms (urinish 2)
pending=0 processing=0 completed=2 failed=1
$ redis-cli LRANGE queue:jobs:failed 0 -1 | xargs -I{} redis-cli HMGET queue:jobs:job:{} status attempts last_error
failed
2
SMTP timeout
$ redis-cli --scan --pattern "queue:jobs:*" | xargs -r redis-cli DEL >/dev/null; cd /root/redis-ilova/job-php && php sinov.php
olindi: email (urinish 1)
complete: true
olindi: hisobot (urinish 1) → fail → pending
olindi: hisobot (urinish 2) → fail → failed
olindi: sms (urinish 1) — worker yo'qoldi
processing: 1
reclaimStuck: 1 ta ish qaytarildi
eski token bilan complete: false
qayta olindi: sms (urinish 2)
pending=0 processing=0 completed=2 failed=1
$ redis-cli --scan --pattern "queue:jobs:*" | xargs -r redis-cli DEL >/dev/null; redis-cli --scan --pattern "queue:jobs:*" | wc -l
0
```

Ikki tilda bir xil natija:

1. `email` — olindi, bajarildi.
2. `hisobot` — birinchi xatodan keyin navbatga **qaytdi** (`pending`), ikkinchisidan keyin — `failed`; hash'da `attempts: 2` va xato matni saqlandi.
3. `sms` — worker olib, tugatmay "yo'qoldi". Ish processing'da turdi; 1.2 soniyadan keyin `reclaimStuck` uni pending'ga qaytardi. Eski worker endi tugata olmaydi (`complete: false` — token boshqa). Keyingi worker uni **2-urinishda** oldi va bajardi — ish yo'qolmadi.

### Kechiktirilgan ishlar (sorted set)

```text vps
$ redis-cli ZADD queue:kechiktirilgan $(( $(date +%s) + 2 )) hisobot-ertaga $(( $(date +%s) + 60 )) eslatma; redis-cli ZRANGEBYSCORE queue:kechiktirilgan -inf $(date +%s)
2
$ sleep 2.2; redis-cli ZRANGEBYSCORE queue:kechiktirilgan -inf $(date +%s)
hisobot-ertaga
$ redis-cli ZRANGEBYSCORE queue:kechiktirilgan -inf $(date +%s) | xargs -r -I{} sh -c 'redis-cli ZREM queue:kechiktirilgan {} >/dev/null && redis-cli LPUSH queue:jobs:pending {}'; redis-cli LRANGE queue:jobs:pending 0 -1; redis-cli ZRANGE queue:kechiktirilgan 0 -1
1
hisobot-ertaga
eslatma
$ redis-cli DEL queue:kechiktirilgan queue:jobs:pending
2
```

- Ball — bajarilish vaqti (Unix soniya): `hisobot-ertaga` — 2 soniyadan keyin, `eslatma` — 60 soniyadan keyin.
- Darhol so'ralganda hech biri vaqti kelmagan (bo'sh); 2.2 soniyadan keyin — `hisobot-ertaga`.
- Vaqti kelgani sorted set'dan olinib, oddiy navbatga (`pending`) qo'yildi; `eslatma` kutishda qoldi.
- Diqqat: bu yerda `ZREM` va `LPUSH` — ikki alohida buyruq. Bir nechta "rejalashtiruvchi" bir vaqtda ishlasa, ularni Lua bilan atomik qilish kerak (15-bob).

## Variantlar

| Usul | Qachon |
| --- | --- |
| List + `BLMOVE` + processing (shu bob) | Oddiy ishonchli navbat |
| Sorted set | Kechiktirilgan yoki ustuvor ishlar |
| Stream + consumer group (23-bob) | Bitta hodisani bir nechta worker guruhiga (fan-out), qayta o'qish |
| Tayyor kutubxona | RD: Sidekiq, Celery, Bull/BullMQ, RQ |
| Alohida broker | Murakkab marshrutlash — RabbitMQ kitobi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `RPOP` bilan olish | Worker qulasa ish yo'qoladi | `BLMOVE` processing ro'yxatiga |
| Reclaim'siz | Qulagan worker'ning ishi abadiy processing'da | `reclaimStuck()` jadval bo'yicha (RD) |
| Ko'rinmaslik muddati juda qisqa | Sekin ish ikki marta bajariladi (RD) | Eng uzun ishdan katta |
| Tokensiz tugatish | Qaytarib olingan ishni eski worker ham tugatadi | `claim_token` (sinovda `complete: false`) |
| Cheksiz qayta urinish | Buzuq ish navbatni band qiladi | `maxAttempts`, `failed` ro'yxati |
| Tugagan ishlar abadiy saqlanadi | Xotira o'sadi | `EXPIRE`, `LTRIM` (RD) |

## Amaliyot

1. Nega ishni `RPOP` emas, `BLMOVE` bilan olish kerak?
2. Ko'rinmaslik muddati nima?
3. Sinovda qulagan worker'ning ishi bilan nima bo'ldi?
4. Eski worker nega ishni tugata olmadi?
5. Kechiktirilgan ishlarda ball sifatida nima ishlatiladi?

<details>
<summary>Javoblar</summary>

1. `BLMOVE` ishni bitta buyruqda processing ro'yxatiga o'tkazadi — worker qulasa ham ish yo'qolmaydi.
2. Olingan ish shu vaqtdan ortiq tugamasa, worker qulagan deb hisoblanadi.
3. `reclaimStuck` uni pending'ga qaytardi, keyingi worker 2-urinishda bajardi.
4. Qaytarib olinganda `claim_token` o'chirildi — eski token mos kelmadi.
5. Bajarilish vaqti (Unix vaqt).

</details>

## Rasmiy hujjat

- [RD: Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/)
- [RD: Job queue (node-redis)](https://redis.io/docs/latest/develop/use-cases/job-queue/nodejs/) · [(Predis)](https://redis.io/docs/latest/develop/use-cases/job-queue/php/)
- [RD: BLMOVE](https://redis.io/docs/latest/commands/blmove/) · [Lists](https://redis.io/docs/latest/develop/data-types/lists/)
