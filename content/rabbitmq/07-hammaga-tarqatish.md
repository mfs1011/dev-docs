# 07 — Hammaga tarqatish

[Mundarija](README.md)

## Tushuncha

5-bobda har xabar **bitta** worker'ga borardi. RT (3. Publish/Subscribe): endi teskarisi — bitta xabarni **bir nechta** consumer'ga yetkazish. Bu naqsh — **publish/subscribe** (nashr qilish/obuna). Qo'llanmadagi misol — oddiy log tizimi: bir dastur log yuboradi, bir nechta qabul qiluvchi uni oladi (biri diskka yozadi, boshqasi ekranga chiqaradi).

RT: RabbitMQ xabar modelining asosiy g'oyasi — producer xabarni **hech qachon** to'g'ridan-to'g'ri navbatga yubormaydi; ko'pincha u xabar biror navbatga yetib borishini ham bilmaydi. Producer faqat **exchange**'ga yuboradi.

```text
emit_log ──▶ [logs: fanout] ──▶ amq.gen-A ──▶ obunachi 1
                           └──▶ amq.gen-B ──▶ obunachi 2
```

### Fanout exchange

`logs` — fanout: xabarni bog'langan **barcha** navbatlarga yuboradi (6-bob). Producer exchange nomi bilan yuboradi, routing key — bo'sh (`''`).

RT: exchange'ga hali hech qaysi navbat bog'lanmagan bo'lsa, xabarlar **yo'qoladi** — log uchun bu maqbul: hech kim tinglamayotgan bo'lsa, xabarni tashlab yuborsa bo'ladi.

### Vaqtinchalik navbatlar

RT: log qabul qiluvchiga barcha xabarlar kerak, lekin faqat **hozir oqayotganlari** — eskilari emas. Buning uchun:

1. har ulanishda **yangi, bo'sh** navbat — nomini server o'zi tanlaydi (`assertQueue('')` / `queue_declare("")`), masalan `amq.gen-JzTY20BRgKO-HjmUJj0wLg`;
2. consumer uzilganda navbat **o'zi o'chadi** — `exclusive: true`: uni e'lon qilgan ulanish yopilganda navbat o'chiriladi.

Keyin navbat exchange'ga **binding** bilan bog'lanadi: `bindQueue(q, 'logs', '')` / `queue_bind($q, 'logs')`.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). RT kodi o'zgarishsiz.

Node.js — `emit_log.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'logs';
    const msg = process.argv.slice(2).join(' ') || 'Hello World!';

    await channel.assertExchange(exchange, 'fanout', {
        durable: false
    });
    channel.publish(exchange, '', Buffer.from(msg));
    console.log(" [x] Sent %s", msg);

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
}

main();
```

`receive_logs.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'logs';

    await channel.assertExchange(exchange, 'fanout', {
        durable: false
    });

    const q = await channel.assertQueue('', {
        exclusive: true
    });
    console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
    channel.bindQueue(q.queue, exchange, '');

    channel.consume(q.queue, function(msg) {
        if (msg.content) {
            console.log(" [x] %s", msg.content.toString());
        }
    }, {
        noAck: true
    });
}

main();
```

PHP — `emit_log.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare('logs', 'fanout', false, false, false);

$data = implode(' ', array_slice($argv, 1));
if (empty($data)) {
    $data = "info: Hello World!";
}
$msg = new AMQPMessage($data);

$channel->basic_publish($msg, 'logs');

echo ' [x] Sent ', $data, "\n";

$channel->close();
$connection->close();
?>
```

`receive_logs.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare('logs', 'fanout', false, false, false);

list($queue_name, ,) = $channel->queue_declare("", false, false, true, false);

$channel->queue_bind($queue_name, 'logs');

echo " [*] Waiting for logs. To exit press CTRL+C\n";

$callback = function ($msg) {
    echo ' [x] ', $msg->getBody(), "\n";
};

$channel->basic_consume($queue_name, '', false, true, false, false, $callback);

try {
    $channel->consume();
} catch (\Throwable $exception) {
    echo $exception->getMessage();
}

$channel->close();
$connection->close();
```

### Obunachi yo'q

```text vps
$ cd /root/rabbit-ilova; node emit_log.js "info: hech kim eshitmaydi"; rabbitmqctl -q list_exchanges name type durable | grep '^logs'; rabbitmqctl -q list_bindings source_name destination_name | grep -c '^logs'
 [x] Sent info: hech kim eshitmaydi
logs	fanout	false
0
```

Xabar yuborildi, `logs` exchange'i yaratildi, lekin binding **0** — xabar hech qayerga bormadi va yo'qoldi. Kuzatildi: qo'llanma exchange'ni `durable: false` bilan e'lon qiladi (`durable` ustunida `false`). RQ bo'yicha 4.x seriyasida durable bo'lmagan obyektlar qo'llovi olib tashlanadi (6-bob); 4.4.0 da hali ishlaydi. Production'da — durable.

### Ikki obunachi

```text vps
$ cd /root/rabbit-ilova; (node receive_logs.js > /tmp/r-node.log 2>&1 &); (php receive_logs.php > /tmp/r-php.log 2>&1 &); sleep 2; rabbitmqctl -q list_queues name exclusive durable consumers | grep -E '^name|amq\.gen' | sed -E 's/amq\.gen-[A-Za-z0-9_-]+/amq.gen-…/'; rabbitmqctl -q list_bindings source_name destination_name | grep '^logs' | sed -E 's/amq\.gen-[A-Za-z0-9_-]+/amq.gen-…/'
name	exclusive	durable	consumers
amq.gen-…	true	false	1
amq.gen-…	true	false	1
logs	amq.gen-…
logs	amq.gen-…
$ cd /root/rabbit-ilova; php emit_log.php "warning: disk 90%"; node emit_log.js "error: ulanish uzildi"; sleep 1; echo "Node obunachi:"; cat /tmp/r-node.log | sed -E 's/amq\.gen-[A-Za-z0-9_-]+/amq.gen-…/'; echo "PHP obunachi:"; cat /tmp/r-php.log
 [x] Sent warning: disk 90%
 [x] Sent error: ulanish uzildi
Node obunachi:
 [*] Waiting for messages in amq.gen-…. To exit press CTRL+C
 [x] warning: disk 90%
 [x] error: ulanish uzildi
PHP obunachi:
 [*] Waiting for logs. To exit press CTRL+C
 [x] warning: disk 90%
 [x] error: ulanish uzildi
```

- Har obunachi o'z navbatini oldi: server nomlagan (`amq.gen-…`), `exclusive`, durable emas, bittadan consumer. Ikkalasi ham `logs` ga bog'langan.
- PHP yuborgan va Node.js yuborgan ikki log **ikkala** obunachiga ham keldi — Node.js'ga ham, PHP'ga ham.

### Obunachilar uzildi

```text vps
$ pkill -f receive_logs.js; pkill -f receive_logs.php; sleep 1; rabbitmqctl -q list_queues name | grep -c 'amq\.gen'; rabbitmqctl -q list_bindings source_name | grep -c '^logs'; rm -f /tmp/r-node.log /tmp/r-php.log
0
0
```

Obunachilar to'xtatilishi bilan ularning `exclusive` navbatlari va binding'lari **o'chdi** (0 va 0). Keyingi loglar yana hech qayerga bormaydi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Faqat hozirgi xabarlar, ulanmagan paytdagisi kerak emas | Fanout + vaqtinchalik `exclusive` navbatlar (shu bob) |
| Obunachi uzilganda ham xabar saqlansin | Har obunachiga **nomli, durable** navbat |
| Hamma emas, tanlab | Direct yoki topic (8-bob) |
| Xabarlar tarixi, qayta o'qish | Stream (23-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Obunachilar bitta navbatni baham ko'radi | Xabarlar ular orasida bo'linadi (5-bob) — hammaga emas | Har obunachiga o'z navbati |
| Muhim xabarni vaqtinchalik navbat bilan | Obunachi uzilganda xabarlar yo'qoladi (RT) | Nomli durable navbat |
| Binding'ni unutish | Exchange xabarni navbatga yubormaydi | `bindQueue` / `queue_bind` |
| Fanout'ga routing key berib, tanlov kutish | Fanout kalitga qaramaydi | Direct yoki topic |

## Amaliyot

1. Publish/subscribe 5-bobdagi navbatdan nimasi bilan farq qiladi?
2. Producer xabarni qayerga yuboradi?
3. Sinovda obunachi bo'lmagan paytda yuborilgan log bilan nima bo'ldi?
4. `assertQueue('', { exclusive: true })` nima qiladi?
5. Obunachi uzilganda uning navbati bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Bitta xabar har bir obunachiga boradi (bo'linmaydi).
2. Exchange'ga (bu yerda — `logs`, fanout).
3. Binding yo'q edi — xabar yo'qoldi.
4. Server nomlagan, ulanish yopilganda o'chadigan navbat yaratadi.
5. Navbat va uning binding'i o'chdi.

</details>

## Rasmiy hujjat

- [RT: 3. Publish/Subscribe (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-three-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-three-php)
- [RQ: Queues](https://www.rabbitmq.com/docs/queues) — exclusive
