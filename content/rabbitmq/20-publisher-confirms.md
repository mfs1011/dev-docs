# 20 — Publisher confirms

[Mundarija](README.md)

## Tushuncha

18-bobda consumer xabarni olganini brokerga bildirdi. Teskari yo'nalish ham kerak: publisher xabar brokerga **yetib, qabul qilinganini** qanday biladi?

RQ (Publisher Confirms): tarmoq kutilmagan tarzda uzilishi mumkin va buni aniqlash vaqt oladi. Socket'ga yozilgan xabar serverga yetib, ishlangan deb hisoblab bo'lmaydi — u yo'lda yo'qolgan yoki ancha kechikkan bo'lishi mumkin. Standart AMQP 0-9-1 da yagona kafolat — **tranzaksiyalar**, lekin ular o'tkazuvchanlikni **250 marta** pasaytiradi. Shuning uchun RabbitMQ **publisher confirms** kengaytmasini qo'shgan.

### Qanday ishlaydi (RQ)

- Kanal **confirm rejimi**ga o'tkaziladi (`confirm.select`) — har kanalda bir marta. Tranzaksiyali kanalni confirm rejimiga o'tkazib bo'lmaydi va aksincha.
- Broker va klient xabarlarni sanaydi (1 dan). Broker xabarni ishlagach `basic.ack` yuboradi: `delivery-tag` — xabar tartib raqami; `multiple` — shu raqamgacha hammasi.
- Kamdan-kam hollarda — `basic.nack`: broker xabarni ishlay olmadi va javobgarlikni olmaydi; publisher qayta yuborishi mumkin. Bitta xabar ham `ack`, ham `nack` olmaydi. `nack` faqat navbatga mas'ul Erlang jarayonida ichki xato bo'lganda keladi (yoki navbat uzunligi chegarasida `reject-publish`, 14-bob).

### Qachon tasdiqlanadi (RQ)

| Xabar | `ack` qachon |
| --- | --- |
| Yo'naltirib bo'lmaydigan | Exchange hech qaysi navbatga yo'naltirmasligini aniqlagach. `mandatory` bo'lsa — avval **`basic.return`**, keyin `ack` |
| Yo'naltiriladigan | Barcha navbatlar qabul qilgach |
| Persistent, durable navbatga | **Diskka yozilgach** — doimiy yuklamada `ack` kechikishi bir necha yuz ms gacha yetishi mumkin |
| Quorum navbatga | Replikalarning **kvorumi** qabul qilib, liderga tasdiqlagach |

RQ: o'tkazuvchanlik uchun tasdiqlarni **asinxron** (oqim sifatida) ishlash qat'iyan tavsiya etiladi.

### Uch strategiya (RT 7. Publisher Confirms)

| Strategiya | Afzalligi | Kamchiligi |
| --- | --- | --- |
| **Bittadan**: yuborib, tasdiqni kutish | Sodda | Juda sekin — sekundiga bir necha yuz xabardan oshmaydi |
| **Paket**: N tani yuborib, hammasini kutish | Sodda, o'tkazuvchanlik yaxshi (masofaviy tugunda 20–30 marta) | Xato bo'lsa qaysi xabar ekanini bilish qiyin — butun paketni saqlash kerak |
| **Asinxron**: callback'lar | Eng tez, xatoni aniq boshqarish | To'g'ri yozish murakkabroq |

PHP (`php-amqplib`): `confirm_select()`, `wait_for_pending_acks(timeout)` (tasdiqlanmasa yoki `nack` bo'lsa — istisno), `set_ack_handler()` / `set_nack_handler()`. Node.js (`amqplib`): `createConfirmChannel()`, har yuborishga callback, `waitForConfirms()`.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Har strategiyada 1000 ta persistent xabar quorum navbatga.

### Node.js

```js
// Publisher confirms: uch strategiya (1000 xabar) va mandatory + qaytarilgan xabar
const amqp = require('amqplib');
const N = 1000, q = 'pc.q';
const yubor = (ch, i) => new Promise((res, rej) =>
  ch.sendToQueue(q, Buffer.from(`x${i}`), { persistent: true }, err => err ? rej(err) : res()));

async function main() {
  const c = await amqp.connect('amqp://localhost');
  const ch = await c.createConfirmChannel();             // confirm.select
  await ch.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum' } });

  let t = Date.now();
  for (let i = 0; i < N; i++) await yubor(ch, i);        // 1) bittadan kutish
  console.log(`1) bittadan:  ${Date.now() - t} ms`);

  t = Date.now();
  for (let i = 0; i < N; i++) {                          // 2) 100 talik paket
    ch.sendToQueue(q, Buffer.from(`x${i}`), { persistent: true });
    if ((i + 1) % 100 === 0) await ch.waitForConfirms();
  }
  console.log(`2) paket 100: ${Date.now() - t} ms`);

  t = Date.now();
  let ack = 0, nack = 0;                                 // 3) asinxron: callback'lar
  await Promise.all(Array.from({ length: N }, (_, i) => yubor(ch, i).then(() => ack++, () => nack++)));
  console.log(`3) asinxron:  ${Date.now() - t} ms (ack=${ack}, nack=${nack})`);
  console.log('navbatda:', (await ch.checkQueue(q)).messageCount);

  // mandatory: hech qayerga yo'naltirilmaydigan xabar
  ch.on('return', m => console.log(`basic.return: ${m.fields.replyCode} ${m.fields.replyText}, kalit=${m.fields.routingKey}`));
  await new Promise(r => ch.publish('amq.direct', 'hech-kim-yoq', Buffer.from('?'), { mandatory: true }, err => {
    console.log('confirm:', err ? 'nack' : 'ack'); r(); }));

  await ch.deleteQueue(q); await c.close();
}
main();
```

### PHP — RT 7 dagi strategiyalar

```php
<?php
// php-amqplib: RT 7 dagi uch strategiya (1000 xabar)
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

$N = 1000;
$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$ch = $c->channel();
$ch->queue_declare('pc.php', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));
$ack = 0; $nack = 0;
$ch->set_ack_handler(function (AMQPMessage $m) use (&$ack) { $ack++; });
$ch->set_nack_handler(function (AMQPMessage $m) use (&$nack) { $nack++; });
$ch->confirm_select();
$msg = fn($i) => new AMQPMessage("x$i", ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);

$t = microtime(true);
for ($i = 0; $i < $N; $i++) { $ch->basic_publish($msg($i), '', 'pc.php'); $ch->wait_for_pending_acks(5.000); }
printf("1) bittadan:  %d ms\n", (microtime(true) - $t) * 1000);

$t = microtime(true);
for ($i = 0; $i < $N; $i++) { $ch->basic_publish($msg($i), '', 'pc.php'); if (($i + 1) % 100 === 0) $ch->wait_for_pending_acks(5.000); }
printf("2) paket 100: %d ms\n", (microtime(true) - $t) * 1000);

$ack = 0; $t = microtime(true);
for ($i = 0; $i < $N; $i++) $ch->basic_publish($msg($i), '', 'pc.php');
$ch->wait_for_pending_acks(5.000);
printf("3) oxirida bir marta kutish (handler'lar): %d ms (ack=%d, nack=%d)\n", (microtime(true) - $t) * 1000, $ack, $nack);
list(, $soni,) = $ch->queue_declare('pc.php', true);
echo "navbatda: $soni\n";
$ch->queue_delete('pc.php'); $ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && node confirms.js
1) bittadan:  2713 ms
2) paket 100: 183 ms
3) asinxron:  106 ms (ack=1000, nack=0)
navbatda: 3000
basic.return: 312 NO_ROUTE, kalit=hech-kim-yoq
confirm: ack
$ cd /root/rabbit-ilova && php confirms.php
1) bittadan:  3812 ms
2) paket 100: 173 ms
3) oxirida bir marta kutish (handler'lar): 103 ms (ack=1000, nack=0)
navbatda: 3000
$ rabbitmqctl -q list_queues name | grep -c '^pc\.'
0
```

| Strategiya | Node.js | PHP |
| --- | --- | --- |
| Bittadan | 2713 ms | 3812 ms |
| Paket (100) | 183 ms | 173 ms |
| Asinxron / oxirida kutish | 106 ms | 103 ms |

- Bittadan kutish paket va asinxron usuldan **15–37 marta** sekin — bu localhost'da. Tarmoq orqali farq kattaroq bo'ladi (RT).
- 3000 xabarning hammasi `ack` oldi, `nack` yo'q.
- `mandatory` bilan yo'naltirib bo'lmaydigan xabar: avval **`basic.return`** (`312 NO_ROUTE`), keyin **`ack`**. `ack` xabar navbatga tushganini emas, broker uni ishlab bo'lganini bildiradi — xabar yo'qolganini faqat `basic.return` ko'rsatadi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Xabar yo'qolmasligi kafolati | Publisher confirms + persistent + durable/quorum navbat |
| Yo'naltirib bo'lmaydigan xabarni bilish | `mandatory` + `return` tinglovchisi (yoki alternate exchange, 10-bob) |
| Oddiy skript, kam xabar | Bittadan kutish |
| Ko'p xabar, sodda kod | Paket |
| Yuqori yuklama | Asinxron |
| AMQP tranzaksiyalari | RQ: 250 marta sekin — tavsiya etilmaydi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Confirms'siz "yubordim — yetdi" deb hisoblash | Yo'lda yo'qolishi mumkin (RQ) | Publisher confirms |
| Har xabarda `confirm.select` | Kanalga bir marta (RT) | Kanal ochilganda |
| Har xabarni sinxron kutish, ko'p xabarda | Juda sekin (sinovda 2.7–3.8 s) | Paket yoki asinxron |
| `ack` = navbatga tushdi deb o'ylash | Yo'naltirilmagan xabar ham `ack` oladi (RQ, sinovda) | `mandatory` + `basic.return` |
| `nack` ni e'tiborsiz qoldirish | Xabar broker javobgarligida emas | Qayta yuborish yoki jurnal |

## Amaliyot

1. Publisher confirms nima uchun kerak va nega tranzaksiyalar emas?
2. Persistent xabar durable navbatga yuborilganda `ack` qachon keladi?
3. Uch strategiya qanday farq qiladi?
4. Sinovda bittadan kutish asinxron usuldan necha marta sekin bo'ldi?
5. `mandatory` bilan yo'naltirib bo'lmaydigan xabarga broker nima yubordi?

<details>
<summary>Javoblar</summary>

1. Xabar brokerga yetib, qabul qilinganini bilish uchun; tranzaksiyalar 250 marta sekin.
2. Diskka yozilgach (quorum'da — kvorum tasdiqlagach).
3. Bittadan — sodda, sekin; paket — tez, xatoni aniqlash qiyin; asinxron — eng tez, murakkabroq.
4. Taxminan 25 (Node.js) va 37 (PHP) marta.
5. Avval `basic.return` (312 NO_ROUTE), keyin `ack`.

</details>

## Rasmiy hujjat

- [RT: 7. Publisher Confirms (PHP)](https://www.rabbitmq.com/tutorials/tutorial-seven-php)
- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) — Publisher Confirms
- [amqplib: ConfirmChannel](https://amqp-node.github.io/amqplib/channel_api.html#confirmchannel)
