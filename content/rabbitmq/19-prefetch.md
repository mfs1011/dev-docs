# 19 — Prefetch

[Mundarija](README.md)

## Tushuncha

RQ (Consumer Acknowledgements — Channel Prefetch Setting): xabarlar consumer'ga **asinxron** yuboriladi, tasdiqlar ham asinxron qaytadi. Natijada consumer'da **yuborilgan, lekin hali tasdiqlanmagan** xabarlar "oynasi" bo'ladi. Uni cheklamasa, consumer xotirasi cheksiz o'sishi mumkin.

**Prefetch** (`basic.qos`, `prefetch_count`) — bir vaqtda tasdiqlanmagan xabarlar soniga chegara. Chegaraga yetganda RabbitMQ yangi xabar yubormaydi, toki kamida bittasi tasdiqlanmaguncha. `0` — chegara yo'q.

### RabbitMQ'da prefetch kimga tegishli (RQ: Consumer Prefetch)

| | AMQP 0-9-1 spetsifikatsiyasi | RabbitMQ |
| --- | --- | --- |
| `prefetch_count` | Kanaldagi barcha consumer'lar uchun **umumiy** | Kanaldagi **har bir yangi consumer**'ga alohida |

Sababi: bitta kanal bir nechta navbatdan o'qishi mumkin va umumiy limit uchun kanal bilan navbatlar har xabarda kelishib olishi kerak. Bu bitta mashinada sekin, klasterda — juda sekin.

RQ: **global** (kanal bo'yicha umumiy) prefetch **eskirgan** va RabbitMQ 4.3 dan standart holatda **o'chirilgan** — consumer'ga alohida prefetch ishlatiladi.

### Qiymatni tanlash (RQ)

- Prefetch kattalashsa — yetkazish tezligi odatda oshadi, lekin consumer'da ishlanmagan xabarlar va xotira ham ko'payadi.
- **100–300** — odatda eng yaxshi o'tkazuvchanlik va consumer'ni ortiqcha yuklamaslik. Kattaroq qiymatlar foydasi kamayib boradi.
- **1** — eng ehtiyotkor; ayniqsa consumer ulanishi kechikishi katta bo'lsa, o'tkazuvchanlikni sezilarli pasaytiradi. Lekin ishlar og'irligi turlicha bo'lsa, adolatli taqsimlash uchun aynan shu kerak (5-bob).
- Avtomatik tasdiq yoki chegarasiz prefetch — ehtiyotkorlik bilan: tasdiqsiz ko'p xabar tugundagi xotirani ham o'stiradi.
- Ustuvor navbatlar prefetch bilan ishlaydi: prefetch bo'lmasa, xabarlar navbatda kutmaydi va ustuvorlikka imkon qolmaydi (16-bob).

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Node.js

```js
// Prefetch: per-consumer limit, global QoS, o'tkazuvchanlik
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
async function tayyorla(c, q, n) {
  const p = await c.createConfirmChannel();
  await p.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  await p.purgeQueue(q);
  for (let i = 0; i < n; i++) p.sendToQueue(q, Buffer.from(String(i)));
  await p.waitForConfirms(); return p;
}
async function main() {
  const c = await amqp.connect('amqp://localhost'); const q = 'pf.q';

  // 1) prefetch 3, tasdiqsiz
  let p = await tayyorla(c, q, 10);
  let ch = await c.createChannel(); await ch.prefetch(3);
  let olindi = 0; await ch.consume(q, () => olindi++);
  await kut(1000);
  console.log(`1) prefetch 3, tasdiqsiz: olindi=${olindi}, navbatda ready=${(await p.checkQueue(q)).messageCount}`);
  await ch.close();

  // 2) bitta kanal, ikki consumer, prefetch 2 — har biriga alohida
  await kut(300); p = await tayyorla(c, q, 10);
  ch = await c.createChannel(); await ch.prefetch(2);
  const s = [0, 0]; await ch.consume(q, () => s[0]++); await ch.consume(q, () => s[1]++);
  await kut(1000);
  console.log(`2) ikki consumer, prefetch 2: birinchi=${s[0]}, ikkinchi=${s[1]}`);
  await ch.close();

  // 3) global prefetch (eskirgan)
  ch = await c.createChannel();
  const xato = new Promise(r => { ch.on('error', e => r(e.message.split('\n')[0].slice(0, 140))); ch.on('close', () => r('kanal yopildi')); });
  ch.prefetch(5, true).then(() => console.log('3) global prefetch: qabul qilindi'), () => {});
  console.log('3) global prefetch:', await Promise.race([xato, kut(2000).then(() => 'xato yo\'q')]));

  // 4) 2000 xabar, har biri tasdiqlanadi: prefetch 1 va 100
  for (const pf of [1, 100]) {
    p = await tayyorla(c, q, 2000);
    ch = await c.createChannel(); await ch.prefetch(pf);
    const t = Date.now();
    await new Promise(r => { let n = 0; ch.consume(q, m => { ch.ack(m); if (++n === 2000) r(); }); });
    console.log(`4) prefetch ${pf}: 2000 xabar ${Date.now() - t} ms`);
    await ch.close();
  }
  await p.deleteQueue(q); await c.close();
}
main();
```

### PHP

```php
<?php
// php-amqplib: basic_qos(prefetch_size, prefetch_count, global)
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$ch = $c->channel();
$ch->queue_declare('pf.php', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));
for ($i = 0; $i < 10; $i++) $ch->basic_publish(new AMQPMessage("x$i"), '', 'pf.php');

$ch->basic_qos(null, 2, false);           // har consumer'ga 2 tadan
$olindi = 0;
$ch->basic_consume('pf.php', '', false, false, false, false, function ($m) use (&$olindi) { $olindi++; });
try { while (true) $ch->wait(null, false, 1); } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {}
list(, $ready,) = $ch->queue_declare('pf.php', true);
echo "prefetch 2, tasdiqsiz: olindi=$olindi, navbatda ready=$ready\n";
$ch->queue_delete('pf.php'); $ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && node prefetch.js
1) prefetch 3, tasdiqsiz: olindi=3, navbatda ready=7
2) ikki consumer, prefetch 2: birinchi=2, ikkinchi=2
3) global prefetch: qabul qilindi
3) global prefetch: xato yo'q
4) prefetch 1: 2000 xabar 5943 ms
4) prefetch 100: 2000 xabar 252 ms
$ cd /root/rabbit-ilova && php prefetch.php
prefetch 2, tasdiqsiz: olindi=2, navbatda ready=8
$ rabbitmqctl -q list_queues name | grep -c '^pf\.'
0
```

1. `prefetch(3)`, tasdiqsiz: 10 xabardan consumer'ga **3** tasi berildi, 7 tasi navbatda kutmoqda. PHP'da ham xuddi shunday: `basic_qos(null, 2, false)` — 2 ta.
2. Bitta kanal, ikki consumer, `prefetch(2)` — **har biri** 2 tadan oldi (jami 4). Spetsifikatsiya bo'yicha jami 2 bo'lardi — RabbitMQ'ning farqi.
3. Global prefetch — quyida.
4. 2000 xabar, har biri alohida tasdiqlanadi: prefetch 1 — **5943 ms**, prefetch 100 — **252 ms** (taxminan 24 marta tez). Bu localhost'da; tarmoq orqali farq kattaroq bo'ladi.

### Global prefetch

```js
// Global prefetch (global=true) amalda nima qiladi: ikki consumer, limit 2
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const c = await amqp.connect('amqp://localhost'); const p = await c.createConfirmChannel();
  await p.assertQueue('pf.g', { durable: true, arguments: { 'x-queue-type': 'classic' } });
  for (let i = 0; i < 10; i++) p.sendToQueue('pf.g', Buffer.from(String(i)));
  await p.waitForConfirms();
  const ch = await c.createChannel(); await ch.prefetch(2, true);
  const s = [0, 0]; await ch.consume('pf.g', () => s[0]++); await ch.consume('pf.g', () => s[1]++);
  await kut(1000);
  console.log(`prefetch(2, global=true), ikki consumer: ${s[0]} + ${s[1]} = ${s[0] + s[1]}`);
  await ch.close(); await p.deleteQueue('pf.g'); await c.close();
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node global.js
prefetch(2, global=true), ikki consumer: 2 + 2 = 4
$ journalctl -u rabbitmq-server --since -10min --no-pager -o cat | grep -i -m2 'global_qos\|global qos' | cut -c1-200; grep -i -m2 'global_qos' /var/log/rabbitmq/rabbit@lab.log | cut -c1-220
2026-11-10 05:12:50.005143+03:00 [error] <0.5751.0> Deprecated features: `global_qos`: Feature `global_qos` is deprecated.
2026-11-10 05:12:50.005143+03:00 [error] <0.5751.0>     "deprecated_features.permit.global_qos = true"
```

Kuzatildi: `prefetch(2, true)` xato bermadi, lekin **global ishlamadi**. Ikki consumer jami 4 ta oldi (2 + 2) — har biriga alohida 2 ta, ya'ni oddiy prefetch kabi. Broker jurnalida — `[error] … Feature global_qos is deprecated` va uni yoqish uchun `deprecated_features.permit.global_qos = true` sozlamasi. Ilova xato ko'rmaydi, faqat jurnalda.

## Variantlar

| Holat | Prefetch |
| --- | --- |
| Ishlar og'irligi turlicha, adolatli taqsimlash | 1 (5-bob) |
| Yengil, ko'p xabar, tezlik muhim | 100–300 (RQ) |
| Ustuvor navbat | Kichik qiymat — ustuvorlik ishlashi uchun |
| Tasdiq qilinmaydigan consumer | Avtomatik tasdiq — ehtiyotkorlik bilan |
| Bitta kanalda bir nechta consumer | Har biriga alohida — global kerak emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Prefetch'siz (0) qo'lda tasdiq | Consumer xotirasi o'sadi (RQ) | Chegarali prefetch |
| Hamma joyda prefetch 1 | O'tkazuvchanlik keskin pasayadi (sinovda 24 marta) | Ish turiga qarab |
| Global prefetch'ga tayanish | 4.3 dan o'chirilgan, jimgina per-consumer bo'ladi (sinovda) | Consumer prefetch |
| Bir kanalda ikki consumer — limit umumiy deb hisoblash | RabbitMQ'da har biriga alohida (RQ, sinovda) | Shunga qarab hisoblash |
| Prefetch'ni ish paytida o'zgartirib aniq limit kutish | Poyga holati — vaqtincha ko'proq bo'lishi mumkin (RQ) | Consumer yaratishdan oldin belgilash |

## Amaliyot

1. Prefetch nimani cheklaydi?
2. RabbitMQ'da `prefetch_count` kanalga tegishlimi yoki consumer'ga?
3. RQ odatda qanday qiymatni tavsiya qiladi va 1 qachon kerak?
4. Sinovda prefetch 1 va 100 qanday farq qildi?
5. Sinovda global prefetch bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Bir vaqtda tasdiqlanmagan xabarlar sonini.
2. Har bir yangi consumer'ga alohida.
3. 100–300; 1 — ishlar og'irligi turlicha bo'lganda adolatli taqsimlash uchun.
4. 5943 ms va 252 ms — taxminan 24 marta.
5. Xatosiz qabul qilindi, lekin per-consumer ishladi (2 + 2); jurnalga "deprecated" xatosi yozildi.

</details>

## Rasmiy hujjat

- [RQ: Consumer Prefetch](https://www.rabbitmq.com/docs/consumer-prefetch)
- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) — Channel Prefetch Setting (QoS)
- [RQ: Deprecated Features](https://www.rabbitmq.com/docs/deprecated-features)
