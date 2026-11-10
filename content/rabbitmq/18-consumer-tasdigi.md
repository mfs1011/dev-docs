# 18 — Consumer tasdig'i

[Mundarija](README.md)

## Tushuncha

RQ (Consumer Acknowledgements): RabbitMQ xabarni consumer'ga berganda, uni qachon "muvaffaqiyatli yetkazilgan" deb hisoblashni bilishi kerak. Bu — ilova qarori va u consumer ro'yxatdan o'tganda (`basic.consume`) yoki xabar so'rab olinganda (`basic.get`) qilinadi.

### Ikki rejim

| Rejim | Qachon yetkazilgan hisoblanadi (RQ) | Xavfi |
| --- | --- | --- |
| **Avtomatik** (`noAck: true`) | Xabar TCP socket'ga yozilishi bilan | Ulanish yoki kanal yopilsa xabar **yo'qoladi**; prefetch chegarasi yo'q — consumer haddan tashqari yuklanishi mumkin. RQ: **xavfsiz emas** |
| **Qo'lda** | Consumer aniq tasdiq yuborganda | Tasdiqni unutish (5-bob) |

Qo'lda tasdiq usullari:

| Usul | Nima |
| --- | --- |
| `basic.ack` | Ijobiy: xabar ishlandi, o'chirish mumkin |
| `basic.reject` | Salbiy, bitta xabar |
| `basic.nack` | Salbiy, `multiple` bilan bir nechta — RabbitMQ'ning AMQP 0-9-1 ga **kengaytmasi** (`basic.reject` da `multiple` yo'q) |

`requeue` bayrog'i: `true` — xabar navbatga **qaytariladi**; `false` — dead letter qilinadi (DLX bo'lsa, 15-bob) yoki tashlab yuboriladi.

### Delivery tag (RQ)

Har yetkazishning **kanal** ichidagi noyob raqami — monoton o'suvchi musbat son. Tasdiq shu raqam bilan yuboriladi va **o'sha kanalda** bo'lishi kerak. Boshqa kanalda yoki ikki marta tasdiqlash — `PRECONDITION_FAILED - unknown delivery tag`, kanal yopiladi.

**`multiple: true`** — shu tag'gacha (u ham kiradi) barcha tasdiqlanmagan yetkazishlar birdan tasdiqlanadi. Masalan, 5–8 tasdiqlanmagan bo'lsa, `8` bilan `multiple` — 5, 6, 7, 8 hammasi.

### Avtomatik qayta navbatga qo'yish (RQ)

Qo'lda tasdiq rejimida kanal yoki ulanish yopilsa (TCP uzilishi, ilova qulashi, kanal darajasidagi xato), tasdiqlanmagan barcha xabarlar **qayta navbatga** qo'yiladi. Qayta yetkazilgan xabarda **`redelivered: true`**. Consumer qayta yetkazishga tayyor va **idempotent** bo'lishi kerak.

### Tasdiq timeout'i (RQ)

RabbitMQ 4.3 dan — **faqat quorum navbatlarda**. Consumer tasdiqlanmagan xabarni belgilangan vaqtdan ko'p ushlasa, xabar navbatga qaytariladi; AMQP 0-9-1 da consumer **bekor qilinadi** (klient bekor qilish xabarnomasini qo'llasa), aks holda kanal `PRECONDITION_FAILED` bilan yopiladi. Standart — **30 daqiqa**. Sozlash: `rabbitmq.conf` (`consumer_timeout`), policy (`consumer-timeout`) yoki `x-consumer-timeout` argumenti.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Node.js

```js
// Consumer tasdig'i: multiple, nack+requeue, ikki marta ack, consumer timeout
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
const holat = async (ch, q) => { const r = await ch.checkQueue(q); return `ready=${r.messageCount}`; };

async function main() {
  const c = await amqp.connect('amqp://localhost');
  const pub = await c.createConfirmChannel();
  const q = 'tasdiq.q';
  await pub.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  const yubor = async n => { for (let i = 1; i <= n; i++) pub.sendToQueue(q, Buffer.from(`x${i}`)); await pub.waitForConfirms(); };

  // 1) 5 ta xabar, faqat oxirgisini multiple=true bilan tasdiqlash
  await yubor(5);
  let ch = await c.createChannel(); await ch.prefetch(5);
  const olindi = [];
  await new Promise(r => ch.consume(q, m => { olindi.push(m); if (olindi.length === 5) r(); }));
  console.log('1) delivery tag\'lar:', olindi.map(m => m.fields.deliveryTag).join(','));
  ch.ack(olindi[4], true);                                 // allUpTo = true
  await kut(300); console.log('   ack(5, multiple) dan keyin:', await holat(pub, q));
  await ch.close();

  // 2) nack + requeue: qayta yetkazilganda redelivered=true
  await yubor(1);
  ch = await c.createChannel();
  await new Promise(r => { let n = 0; ch.consume(q, m => {
    console.log(`2) ${m.content} redelivered=${m.fields.redelivered}`);
    if (++n === 1) ch.nack(m, false, true); else { ch.ack(m); r(); } }); });
  await ch.close();

  // 3) bir xabarni ikki marta tasdiqlash
  await yubor(1);
  ch = await c.createChannel();
  const xato = new Promise(r => ch.on('error', e => r(e.message.split('\n')[0].slice(0, 110))));
  const m = await ch.get(q); ch.ack(m); ch.ack(m);
  console.log('3) ikki marta ack:', await xato);

  // 4) consumer timeout (faqat quorum, 4.3+): tasdiqsiz ushlab turish
  const qt = 'tasdiq.timeout';
  await pub.assertQueue(qt, { durable: true, arguments: { 'x-queue-type': 'quorum', 'x-consumer-timeout': 3000 } });
  pub.sendToQueue(qt, Buffer.from('osilgan')); await pub.waitForConfirms();
  ch = await c.createChannel();
  const t0 = Date.now();
  const bekor = new Promise(r => ch.consume(qt, msg => { if (msg === null) r(Date.now() - t0); }));  // ack qilinmaydi
  await kut(500); console.log('4) olindi, tasdiqlanmadi:', await holat(pub, qt));
  const ms = await Promise.race([bekor, kut(90000).then(() => 'kelmadi')]);
  console.log(`   consumer bekor qilindi (${typeof ms === 'number' ? Math.round(ms / 1000) + ' s' : ms}), navbatda:`, await holat(pub, qt));

  await ch.close().catch(() => {});                       // bekor qilingan consumer kanalini avval yopish
  await pub.deleteQueue(q); await pub.deleteQueue(qt); await c.close();
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node tasdiq.js
1) delivery tag'lar: 1,2,3,4,5
   ack(5, multiple) dan keyin: ready=0
2) x1 redelivered=false
2) x1 redelivered=true
3) ikki marta ack: Channel closed by server: 406 (PRECONDITION-FAILED) with message "PRECONDITION_FAILED - unknown delivery tag 1
4) olindi, tasdiqlanmadi: ready=0
   consumer bekor qilindi (3 s), navbatda: ready=1
$ rabbitmqctl -q list_queues name | grep -c '^tasdiq'
0
```

1. Besh xabarning delivery tag'lari — 1…5. Faqat 5-si `multiple` bilan tasdiqlandi — navbatda hech narsa qolmadi: beshtasi ham tasdiqlandi.
2. `nack` + `requeue` — xabar qaytdi, ikkinchi yetkazishda `redelivered=true`.
3. Bir xabarni ikki marta tasdiqlash — kanal `406 PRECONDITION_FAILED - unknown delivery tag 1` bilan yopildi.
4. `x-consumer-timeout: 3000` li quorum navbat: xabar olindi, lekin tasdiqlanmadi. **3 soniyada** consumer bekor qilindi (amqplib'da — `null` xabar), xabar navbatga qaytdi (`ready=1`).

### PHP

```php
<?php
// php-amqplib: ack, nack(requeue) va reject(false)
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$ch = $c->channel();
$ch->queue_declare('tasdiq.php', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));
foreach (['yaxshi', 'qayta', 'buzuq'] as $m) $ch->basic_publish(new AMQPMessage($m), '', 'tasdiq.php');

$ch->basic_qos(null, 1, false);
$ch->basic_consume('tasdiq.php', '', false, false, false, false, function (AMQPMessage $msg) {
    $b = $msg->getBody(); $r = $msg->isRedelivered() ? 'true' : 'false';
    if ($b === 'qayta' && !$msg->isRedelivered()) { echo "$b (redelivered=$r) → nack, requeue\n"; $msg->nack(true); return; }
    if ($b === 'buzuq') { echo "$b (redelivered=$r) → reject, requeue=false\n"; $msg->reject(false); return; }
    echo "$b (redelivered=$r) → ack\n"; $msg->ack();
});
try { $ch->wait(null, false, 2); while (true) $ch->wait(null, false, 2); } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {}
list(, $qoldi,) = $ch->queue_declare('tasdiq.php', true);
echo "navbatda qoldi: $qoldi\n";
$ch->queue_delete('tasdiq.php'); $ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && php tasdiq.php
yaxshi (redelivered=false) → ack
qayta (redelivered=false) → nack, requeue
qayta (redelivered=true) → ack
buzuq (redelivered=false) → reject, requeue=false
navbatda qoldi: 0
```

- `yaxshi` — `ack`.
- `qayta` — avval `nack(true)` bilan qaytarildi, ikkinchi marta `isRedelivered()` — `true`, endi `ack`.
- `buzuq` — `reject(false)`: qaytarilmadi, DLX yo'q — tashlab yuborildi. Navbat bo'sh.

## Variantlar

| Holat | Tasdiq |
| --- | --- |
| Muvaffaqiyatli ishlandi | `ack` |
| Ko'p xabar ketma-ket ishlandi | `ack` + `multiple` (tarmoq trafigi kamroq) |
| Hozir ishlay olmayman, boshqasi ishlasin | `nack` / `reject`, `requeue=true` |
| Umuman ishlab bo'lmaydi | `reject`, `requeue=false` + DLX (15-bob) |
| Bir nechtasini birdan rad etish | `nack` + `multiple` |
| Xabar yo'qolsa ham bo'ladi, tezlik muhim | Avtomatik tasdiq (RQ: xavfsiz emas) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Muhim ishlar uchun avtomatik tasdiq | Ulanish uzilsa xabar yo'qoladi (RQ) | Qo'lda tasdiq |
| Boshqa kanalda tasdiqlash | `unknown delivery tag`, kanal yopiladi (RQ) | Olgan kanalda |
| Ikki marta `ack` | Kanal yopiladi (sinovda) | Bir marta |
| Doim `requeue=true` | Zaharli xabar cheksiz aylanadi | `requeue=false` + DLX, quorum `delivery-limit` |
| Qayta yetkazishga tayyor emas | Xabar ikki marta ishlanadi | Idempotent ishlov, `redelivered` ni tekshirish |
| Uzoq ishlarda timeout'ni unutish | Quorum navbatda 30 daqiqadan keyin consumer bekor qilinadi (RQ) | `consumer-timeout` ni oshirish |

## Amaliyot

1. Avtomatik va qo'lda tasdiq farqi?
2. `basic.nack` `basic.reject` dan nimasi bilan farq qiladi?
3. `multiple: true` bilan 5-tag tasdiqlansa, qaysilari tasdiqlanadi?
4. `redelivered` belgisi qachon `true`?
5. Sinovda bir xabarni ikki marta tasdiqlaganda nima bo'ldi?
6. Quorum navbatda consumer xabarni timeout'dan ko'p ushlasa nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Avtomatik — yuborilishi bilan; qo'lda — consumer tasdiq yuborganda.
2. `nack` bir nechta xabarni birdan (`multiple`) rad eta oladi.
3. Shu kanaldagi 5 gacha barcha tasdiqlanmaganlar.
4. Xabar qayta navbatga qo'yilib, yana yetkazilganda.
5. Kanal `406 PRECONDITION_FAILED - unknown delivery tag` bilan yopildi.
6. Consumer bekor qilinadi, xabar navbatga qaytadi.

</details>

## Rasmiy hujjat

- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms)
- [RQ: Negative Acknowledgements](https://www.rabbitmq.com/docs/nack)
- [RQ: Consumers](https://www.rabbitmq.com/docs/consumers) — Delivery Acknowledgement Timeout
