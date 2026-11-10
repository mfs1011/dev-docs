# 05 — Ishni worker'larga bo'lish

[Mundarija](README.md)

## Tushuncha

RT (2. Work Queues): **ishlar navbati** (work queue, task queue) — vaqt oladigan ishni darhol bajarmasdan, uni xabar sifatida navbatga qo'yish. Fondagi **worker** (ishchi jarayon) xabarni olib, ishni bajaradi. Bir nechta worker ishga tushirilsa, ishlar ular orasida **bo'linadi** — parallel ishlash oson.

```text
new_task ──▶ [ task_queue ] ──▶ worker 1
                          └──▶ worker 2
```

Qo'llanmadagi "ish" — sun'iy: xabardagi har nuqta (`.`) — bir soniya ish (`Hello...` — 3 soniya).

### Taqsimlash

- **Navbat bilan aylanish** (round-robin) — RT: standart holatda RabbitMQ har xabarni keyingi consumer'ga ketma-ket beradi; o'rtacha hammasi teng son oladi. Lekin u xabarni navbatga kirishi bilan beradi va consumer'dagi **tasdiqlanmagan** xabarlar soniga qaramaydi. Toq xabarlar og'ir, juftlari yengil bo'lsa — bitta worker doim band, ikkinchisi deyarli bo'sh.
- **Adolatli taqsimlash** (fair dispatch) — `prefetch(1)` (PHP'da `basic_qos(null, 1, false)`): worker oldingi xabarni **tasdiqlamaguncha** unga yangisi berilmaydi; xabar band bo'lmagan keyingi worker'ga beriladi (prefetch — 19-bob).

### Tasdiq (acknowledgement)

RT: `noAck: true` bilan RabbitMQ xabarni consumer'ga berishi bilan o'chirishga belgilaydi. Worker to'xtatilsa, u qayta ishlayotgan va unga berilgan, lekin hali ishlanmagan xabarlar **yo'qoladi**.

Qo'lda tasdiq (`noAck: false` va ishdan keyin `channel.ack(msg)`; PHP'da `$msg->ack()`): worker tasdiq yubormasdan o'lsa (kanal yopilsa, ulanish yoki TCP uzilsa), RabbitMQ xabar to'liq ishlanmaganini tushunadi va uni **qayta navbatga qo'yadi** — boshqa consumer bo'lsa, unga beriladi.

RT:

- Tasdiq xabarni **olgan kanal**da yuborilishi kerak; boshqa kanalda — protokol xatosi.
- Tasdiqni kutish uchun **timeout** bor (standart 30 daqiqa) — hech qachon tasdiqlamaydigan "osilgan" consumer'larni aniqlash uchun.
- **Unutilgan tasdiq** — keng tarqalgan xato: xabarlar klient chiqqanda qayta yetkaziladi (tasodifiy qayta yetkazishga o'xshaydi), RabbitMQ esa tasdiqlanmagan xabarlarni bo'shata olmay xotirani tobora ko'p yeydi. Tekshirish: `rabbitmqctl list_queues name messages_ready messages_unacknowledged`.

### Saqlanish (durability)

RT: RabbitMQ to'xtasa yoki qulasa, aytilmagan bo'lsa navbatlar va xabarlarni unutadi. Ikki narsa kerak:

- navbat — **durable** (`durable: true`) — tugun qayta ishga tushganda saqlanadi;
- xabar — **persistent** (Node.js: `persistent: true`; PHP: `delivery_mode => DELIVERY_MODE_PERSISTENT`).

RT: mavjud navbatni **boshqa parametrlar** bilan qayta e'lon qilib bo'lmaydi — RabbitMQ xato qaytaradi. Persistent ham to'liq kafolat emas: RabbitMQ xabarni qabul qilib, hali diskka yozmagan qisqa vaqt oralig'i bor va u har xabar uchun `fsync(2)` qilmaydi. Kuchliroq kafolat — publisher confirms (20-bob).

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). RT kodi o'zgarishsiz.

Node.js — `new_task.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'task_queue';
    const msg = process.argv.slice(2).join(' ') || "Hello World!";

    await channel.assertQueue(queue, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });
    channel.sendToQueue(queue, Buffer.from(msg), {
        persistent: true
    });
    console.log(" [x] Sent '%s'", msg);

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
}

main();
```

`worker.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'task_queue';

    await channel.assertQueue(queue, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });
    channel.prefetch(1);
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    channel.consume(queue, function(msg) {
        const secs = msg.content.toString().split('.').length - 1;

        console.log(" [x] Received %s", msg.content.toString());
        setTimeout(function() {
            console.log(" [x] Done");
            channel.ack(msg);
        }, secs * 1000);
    }, {
        // manual acknowledgment mode,
        // see /docs/confirms for details
        noAck: false
    });
}

main();
```

PHP — `new_task.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('task_queue', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));

$data = implode(' ', array_slice($argv, 1));
if (empty($data)) {
    $data = "Hello World!";
}
$msg = new AMQPMessage(
    $data,
    array('delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT)
);

$channel->basic_publish($msg, '', 'task_queue');

echo ' [x] Sent ', $data, "\n";

$channel->close();
$connection->close();
?>
```

`worker.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Wire\AMQPTable;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('task_queue', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));

echo " [*] Waiting for messages. To exit press CTRL+C\n";

$callback = function ($msg) {
    echo ' [x] Received ', $msg->getBody(), "\n";
    sleep(substr_count($msg->getBody(), '.'));
    echo " [x] Done\n";
    $msg->ack();
};

$channel->basic_qos(null, 1, false);
$channel->basic_consume('task_queue', '', false, false, false, false, $callback);

try {
    $channel->consume();
} catch (\Throwable $exception) {
    echo $exception->getMessage();
}

$channel->close();
$connection->close();
```

### Ikki worker — Node.js va PHP

Ikkalasi fonda ishga tushiriladi; keyin 5 ta ish yuboriladi: birinchisi 3 soniyalik (`...`), qolganlari 1 soniyalik:

```text vps
$ cd /root/rabbit-ilova; (node worker.js > /tmp/w-node.log 2>&1 &); (php worker.php > /tmp/w-php.log 2>&1 &); sleep 2; rabbitmqctl -q list_queues name consumers
name	consumers
hello	0
task_queue	2
$ for t in "1-ish ..." "2-ish ." "3-ish ." "4-ish ." "5-ish ."; do node new_task.js "$t" >/dev/null; done; rabbitmqctl -q list_queues name messages_ready messages_unacknowledged; sleep 6
name	messages_ready	messages_unacknowledged
hello	0	0
task_queue	0	1
$ echo "Node worker:"; cat /tmp/w-node.log; echo "PHP worker:"; cat /tmp/w-php.log
Node worker:
 [*] Waiting for messages in task_queue. To exit press CTRL+C
 [x] Received 2-ish .
 [x] Done
 [x] Received 3-ish .
 [x] Done
 [x] Received 4-ish .
 [x] Done
PHP worker:
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received 1-ish ...
 [x] Done
 [x] Received 5-ish .
 [x] Done
```

- Navbatda 2 consumer (har tildan bittadan).
- PHP worker 3 soniyalik `1-ish` ni oldi. U band bo'lgan paytda Node.js worker 2-, 3-, 4-ishlarni ketma-ket bajardi. `5-ish` esa bo'shagan PHP worker'ga tushdi. Oddiy navbat bilan aylanishda ishlar 1-3-5 / 2-4 bo'lib bo'linardi — `prefetch(1)` band worker'ga yangi ish bermadi.
- Tillar aralash — bir navbat, bir protokol.

### Worker ish o'rtasida o'ldi

```text vps
$ pkill -f 'php worker.php'; pkill -f 'node worker.js'; sleep 1; rabbitmqctl -q list_queues name messages consumers
name	messages	consumers
hello	0	0
task_queue	0	0
$ cd /root/rabbit-ilova; (node worker.js > /tmp/w1.log 2>&1 &); sleep 1; php new_task.php "uzoq-ish .........." >/dev/null; sleep 2; rabbitmqctl -q list_queues name messages_ready messages_unacknowledged; cat /tmp/w1.log
name	messages_ready	messages_unacknowledged
hello	0	0
task_queue	0	1
 [*] Waiting for messages in task_queue. To exit press CTRL+C
 [x] Received uzoq-ish ..........
$ pkill -9 -f 'node worker.js'; sleep 1; rabbitmqctl -q list_queues name messages_ready messages_unacknowledged consumers
name	messages_ready	messages_unacknowledged	consumers
hello	0	0	0
task_queue	1	0	0
$ cd /root/rabbit-ilova; timeout 13 php worker.php; echo "chiqish kodi: $?"
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received uzoq-ish ..........
 [x] Done
chiqish kodi: 124
$ rabbitmqctl -q list_queues name messages; rm -f /tmp/w-node.log /tmp/w-php.log /tmp/w1.log
name	messages
hello	0
task_queue	0
```

- 10 soniyalik ish Node.js worker'ga berildi — `messages_unacknowledged: 1`.
- Worker `kill -9` bilan o'ldirildi (tasdiqsiz) — ish yo'qolmadi: `messages_ready: 1`, consumer yo'q.
- Keyin ishga tushgan PHP worker shu ishni oldi va bajardi. Navbat bo'sh.

## Variantlar

| Usul | Qachon | Kamchiligi |
| --- | --- | --- |
| `noAck: true` | Xabar yo'qolsa ham bo'ladi | Worker o'lsa — yo'qoladi (RT) |
| Qo'lda tasdiq | Har ish muhim | Tasdiqni unutish — xotira to'ladi (RT) |
| Prefetch'siz | Ishlar bir xil og'irlikda | Notekis taqsimlash (RT) |
| `prefetch(1)` | Ishlar turlicha | Tarmoq bo'ylab ko'proq borib-kelish (19-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `ack` ni unutish | Qayta yetkazish, xotira o'sishi (RT) | Ishdan keyin `ack`; `messages_unacknowledged` ni kuzatish |
| Ishni boshlashdan oldin `ack` | Worker o'lsa ish yo'qoladi | Ish tugagach `ack` |
| Boshqa kanalda `ack` | Protokol xatosi (RT) | Xabarni olgan kanalda |
| Navbat durable, xabar persistent emas | Qayta ishga tushganda xabarlar yo'qolishi mumkin (RT) | Ikkalasi ham |
| Mavjud navbatni boshqa parametrlar bilan e'lon qilish | Xato (RT) | Bir xil parametrlar yoki yangi nom |
| Barcha worker'lar band, kuzatuv yo'q | Navbat to'lib boradi (RT) | Navbat uzunligini kuzatish, worker qo'shish |

## Amaliyot

1. Standart holatda RabbitMQ xabarlarni consumer'larga qanday taqsimlaydi?
2. `prefetch(1)` nimani o'zgartiradi?
3. Sinovda PHP worker 3 soniyalik ish bilan band bo'lganda qolgan ishlar qayerga ketdi?
4. Worker tasdiqsiz o'lsa xabar bilan nima bo'ladi?
5. Xabar RabbitMQ qayta ishga tushganda ham saqlanishi uchun nima kerak?
6. Unutilgan tasdiqni qanday aniqlash mumkin?

<details>
<summary>Javoblar</summary>

1. Navbat bilan aylanib (round-robin), tasdiqlanmaganlariga qaramasdan.
2. Worker oldingi xabarni tasdiqlamaguncha unga yangisi berilmaydi.
3. Bo'sh Node.js worker'ga (2-, 3-, 4-ishlar).
4. Qayta navbatga qo'yiladi va boshqa consumer'ga beriladi.
5. Durable navbat va persistent xabar.
6. `rabbitmqctl list_queues name messages_ready messages_unacknowledged`.

</details>

## Rasmiy hujjat

- [RT: 2. Work Queues (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-two-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-two-php)
- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms)
