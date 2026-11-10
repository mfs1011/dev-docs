# 03 — Birinchi xabar

[Mundarija](README.md)

## Tushuncha

RT (1. "Hello World!"): ikki kichik dastur — bitta xabar yuboradigan **producer** (P) va xabarlarni qabul qilib chiqaradigan **consumer** (C). Ular orasida — **navbat**: RabbitMQ consumer nomidan saqlab turadigan xabarlar buferi.

```text
P ──"Hello World!"──▶ [ hello ] ──▶ C
```

### Klient kutubxonalari

| Til | Kutubxona | O'rnatish (RT) |
| --- | --- | --- |
| Node.js | `amqplib` (amqp.node) | `npm install amqplib` |
| PHP | `php-amqplib` | `composer require php-amqplib/php-amqplib` (Composer — `composer.json` orqali) |

Ikkalasi ham **AMQP 0-9-1** protokolida ishlaydi (1-bob).

### Qadamlar (RT)

| Qadam | Node.js (`amqplib`) | PHP (`php-amqplib`) |
| --- | --- | --- |
| Ulanish | `amqp.connect('amqp://localhost')` | `new AMQPStreamConnection('localhost', 5672, 'guest', 'guest')` |
| Kanal | `connection.createChannel()` | `$connection->channel()` |
| Navbatni e'lon qilish | `channel.assertQueue('hello', {...})` | `$channel->queue_declare('hello', ...)` |
| Yuborish | `channel.sendToQueue('hello', Buffer.from(msg))` | `$channel->basic_publish($msg, '', 'hello')` |
| Qabul qilish | `channel.consume('hello', callback, { noAck: true })` | `$channel->basic_consume('hello', '', false, true, false, false, $callback)` |

RT:

- Navbatni e'lon qilish **idempotent** — u faqat mavjud bo'lmasa yaratiladi.
- Xabar mazmuni — **baytlar massivi**: unga istalgan narsani kodlash mumkin.
- Navbat consumer'da **ham** e'lon qilinadi: consumer producer'dan oldin ishga tushishi mumkin, navbat esa undan o'qishdan oldin mavjud bo'lishi kerak.
- Server xabarlarni consumer'ga **o'zi uzatadi** (push), asinxron — shuning uchun callback beriladi.

Rasmiy qo'llanmalar navbatni **quorum** turida e'lon qiladi (`x-queue-type: quorum`) — RabbitMQ'ning replikatsiyalanadigan, ishonchli navbat turi (12-bob). `durable: true` — navbat broker qayta ishga tushganda saqlanadi.

**Standart exchange** (RT): nomi bo'sh satr (`""`) bo'lgan direct exchange. Har yaratilgan navbat unga **navbat nomi** bilan avtomatik bog'lanadi. PHP'dagi `basic_publish($msg, '', 'hello')` — standart exchange'ga `hello` kaliti bilan yuborish; natijada xabar `hello` navbatiga tushadi. Xabar "to'g'ridan-to'g'ri navbatga" yuborilgandek ko'rinadi, aslida — exchange orqali. Node.js'dagi `sendToQueue` ham shunday ishlaydi.

`noAck: true` (PHP'da `basic_consume` ning to'rtinchi argumenti `true`) — xabar consumer'ga yetkazilishi bilan tasdiqlangan hisoblanadi. Ishonchli tasdiq — 5 va 18-boblarda.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Loyiha — `/root/rabbit-ilova`:

```text vps
$ php -m | grep -E '^(sockets|mbstring)$'
mbstring
sockets
$ mkdir -p /root/rabbit-ilova && cd /root/rabbit-ilova && npm init -y >/dev/null && npm install --silent amqplib@2.3.1 && npm ls amqplib | tail -2 | head -1
└── amqplib@2.3.1
$ cd /root/rabbit-ilova && COMPOSER_ALLOW_SUPERUSER=1 composer require --no-interaction -q php-amqplib/php-amqplib:^3.7 2>&1 | tail -3; COMPOSER_ALLOW_SUPERUSER=1 composer show php-amqplib/php-amqplib 2>/dev/null | grep -E '^versions'
versions : * v3.7.5
```

Kuzatildi: rasmiy qo'llanmalar repo'si `amqplib` 0.10.9 ni qotirgan; npm'dagi eng yangi versiya — 2.3.1. Quyidagi rasmiy kod 2.3.1 bilan o'zgarishsiz ishladi.

### Node.js — RT kodi o'zgarishsiz

`send.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'hello';
    const msg = 'Hello World!';

    await channel.assertQueue(queue, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });
    channel.sendToQueue(queue, Buffer.from(msg));

    console.log(" [x] Sent %s", msg);

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
}

main();
```

`receive.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'hello';

    await channel.assertQueue(queue, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });

    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

    channel.consume(queue, function(msg) {
        console.log(" [x] Received %s", msg.content.toString());
    }, {
        noAck: true
    });
}

main();
```

```text vps
$ rabbitmqctl -q list_queues name type messages
$ node send.js
 [x] Sent Hello World!
$ rabbitmqctl -q list_queues name type durable messages_ready messages_unacknowledged consumers
name	type	durable	messages_ready	messages_unacknowledged	consumers
hello	quorum	true	1	0	0
$ timeout 2 node receive.js; echo "chiqish kodi: $?"
 [*] Waiting for messages in hello. To exit press CTRL+C
 [x] Received Hello World!
chiqish kodi: 124
```

- Boshida navbat yo'q edi. `send.js` uni yaratdi: `hello`, turi `quorum`, `durable`, 1 xabar tayyor (`messages_ready`), consumer yo'q.
- `receive.js` xabarni oldi. U to'xtamay kutadi (CTRL+C gacha) — sinovda `timeout 2` bilan to'xtatildi (124 — `timeout` kodi).

### PHP — RT kodi o'zgarishsiz

`send.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('hello', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));

$msg = new AMQPMessage('Hello World!');
$channel->basic_publish($msg, '', 'hello');

echo " [x] Sent 'Hello World!'\n";

$channel->close();
$connection->close();
?>
```

`receive.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Wire\AMQPTable;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->queue_declare('hello', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'quorum']));

echo " [*] Waiting for messages. To exit press CTRL+C\n";

$callback = function ($msg) {
    echo ' [x] Received ', $msg->getBody(), "\n";
};

$channel->basic_consume('hello', '', false, true, false, false, $callback);

try {
    $channel->consume();
} catch (\Throwable $exception) {
    echo $exception->getMessage();
}

$channel->close();
$connection->close();
```

```text vps
$ php send.php; php send.php
 [x] Sent 'Hello World!'
 [x] Sent 'Hello World!'
$ rabbitmqctl -q list_queues name messages_ready
name	messages_ready
hello	2
$ timeout 2 php receive.php; echo "chiqish kodi: $?"
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received Hello World!
 [x] Received Hello World!
chiqish kodi: 124
```

Ikkita yuborildi — navbatda 2 ta xabar; consumer ikkalasini ham oldi.

### Tillar aralash

```text vps
$ node send.js; timeout 2 php receive.php; echo "chiqish kodi: $?"
 [x] Sent Hello World!
 [*] Waiting for messages. To exit press CTRL+C
 [x] Received Hello World!
chiqish kodi: 124
$ rabbitmqctl -q list_queues name messages_ready consumers
name	messages_ready	consumers
hello	0	0
```

Node.js yubordi, PHP oldi. Broker uchun til farqi yo'q — ikkalasi bir xil protokolda, bir xil navbat bilan ishlaydi. Oxirida navbat bo'sh, consumer yo'q.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Navbatni faqat producer'da e'lon qilish | Consumer oldin ishga tushsa, navbat yo'q (RT) | Ikkala tomonda e'lon qilish |
| Bir nomli navbatni turli parametrlar bilan e'lon qilish | Broker xato qaytaradi (1-bob: e'lonlar ziddiyati) | Hamma joyda bir xil parametrlar |
| Yuborgandan keyin darhol jarayondan chiqish (Node.js) | Xabar hali yuborilmagan bo'lishi mumkin | RT: ulanishni yopib chiqish |
| `noAck: true` ni production'da | Consumer qulasa xabar yo'qoladi | Qo'lda tasdiq (5, 18-boblar) |
| `guest` bilan boshqa serverdan ulanish | Faqat localhost (2-bob) | Alohida foydalanuvchi (26-bob) |

## Amaliyot

1. Navbat nima?
2. Nega navbat consumer kodida ham e'lon qilinadi?
3. PHP'dagi `basic_publish($msg, '', 'hello')` da bo'sh satr nimani anglatadi?
4. Sinovda `hello` navbati qaysi turda yaratildi?
5. Node.js yuborgan xabarni PHP olishi mumkinmi?

<details>
<summary>Javoblar</summary>

1. RabbitMQ consumer nomidan saqlab turadigan xabarlar buferi.
2. Consumer producer'dan oldin ishga tushishi mumkin.
3. Standart exchange — u xabarni routing key bilan bir xil nomli navbatga yuboradi.
4. `quorum`, `durable`.
5. Ha — ikkalasi bir xil protokolda, bir navbat bilan ishlaydi (sinovda tasdiqlandi).

</details>

## Rasmiy hujjat

- [RT: 1. "Hello World!" (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-one-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-one-php)
- [RT: AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts) — Default Exchange
- [RabbitMQ tutorials manba kodi](https://github.com/rabbitmq/rabbitmq-tutorials)
