# 08 — Tanlab yuborish

[Mundarija](README.md)

## Tushuncha

7-bobda fanout har logni hamma obunachiga yubordi. Ko'pincha esa tanlov kerak: diskka faqat **xatolar** yozilsin, ekranga — hammasi. RT ikki qo'llanmada buni ikki usulda ko'rsatadi.

### Routing — direct exchange (RT 4)

Direct exchange xabarni binding kaliti xabarning **routing key**'i bilan aynan teng navbatlarga yuboradi (6-bob). Log tizimida routing key — darajasi: `info`, `warning`, `error`.

```text
                       ┌─error────────────▶ [Q1] ▶ diskka (faqat xato)
emit ──▶ [direct_logs] ┼─info/warning/error▶ [Q2] ▶ ekranga (hammasi)
                       └─ boshqa kalit ─▶ ✗ tashlab yuboriladi
```

RT: bitta navbat bir nechta kalit bilan bog'lanishi mumkin. **Bir xil** kalitni bir nechta navbatga bog'lash ham to'g'ri — shunda direct exchange shu kalit uchun fanout kabi ishlaydi.

### Topics — topic exchange (RT 5)

Direct bitta mezon bo'yicha tanlaydi. Topic esa routing key'ni nuqta bilan ajratilgan **so'zlar** ro'yxati sifatida ko'radi (`<manba>.<daraja>`: `kern.critical`, `auth.info`) va naqsh bilan solishtiradi (RT):

| Belgi | Nima |
| --- | --- |
| `*` | Aynan **bitta** so'z |
| `#` | **Nol yoki ko'p** so'z |

- Routing key — istalgancha so'z, lekin **255 baytgacha**.
- `#` bilan bog'langan navbat **hamma** xabarni oladi — fanout kabi.
- `*` va `#` ishlatilmasa topic exchange **direct** kabi ishlaydi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). RT kodi o'zgarishsiz; har qo'llanmadan bir tomoni Node.js'da, ikkinchisi PHP'da ko'rsatilgan (ikkala tildagi fayllar ham ishlatildi).

### Routing (direct)

Qabul qiluvchi — `receive_logs_direct.js`: argumentdagi har daraja uchun bitta binding:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
    process.exit(1);
}

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'direct_logs';

    await channel.assertExchange(exchange, 'direct', {
        durable: false
    });

    const q = await channel.assertQueue('', {
        exclusive: true
    });
    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    for (const severity of args) {
        await channel.bindQueue(q.queue, exchange, severity);
    }

    channel.consume(q.queue, function(msg) {
        console.log(" [x] %s: '%s'", msg.fields.routingKey, msg.content.toString());
    }, {
        noAck: true
    });
}

main();
```

Yuboruvchi — `emit_log_direct.php`:

```php
<?php

require_once __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

$connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$channel = $connection->channel();

$channel->exchange_declare('direct_logs', 'direct', false, false, false);

$severity = isset($argv[1]) && !empty($argv[1]) ? $argv[1] : 'info';

$data = implode(' ', array_slice($argv, 2));
if (empty($data)) {
    $data = "Hello World!";
}

$msg = new AMQPMessage($data);

$channel->basic_publish($msg, 'direct_logs', $severity);

echo ' [x] Sent ', $severity, ':', $data, "\n";

$channel->close();
$connection->close();
?>
```

Node.js obunachi faqat `error`, PHP obunachi `info warning error` bilan:

```text vps
$ cd /root/rabbit-ilova; (node receive_logs_direct.js error > /tmp/d1.log 2>&1 &); (php receive_logs_direct.php info warning error > /tmp/d2.log 2>&1 &); sleep 2; rabbitmqctl -q list_bindings source_name routing_key | grep '^direct_logs' | sort
direct_logs	error
direct_logs	error
direct_logs	info
direct_logs	warning
$ cd /root/rabbit-ilova; php emit_log_direct.php info "foydalanuvchi kirdi"; node emit_log_direct.js warning "disk 90%"; php emit_log_direct.php error "baza javob bermadi"; node emit_log_direct.js debug "hech kim olmaydi"; sleep 1; echo "Node (error):"; cat /tmp/d1.log; echo "PHP (info warning error):"; cat /tmp/d2.log
 [x] Sent info:foydalanuvchi kirdi
 [x] Sent warning: 'disk 90%'
 [x] Sent error:baza javob bermadi
 [x] Sent debug: 'hech kim olmaydi'
Node (error):
 [*] Waiting for logs. To exit press CTRL+C
 [x] error: 'baza javob bermadi'
PHP (info warning error):
 [*] Waiting for logs. To exit press CTRL+C
 [x] info:foydalanuvchi kirdi
 [x] warning:disk 90%
 [x] error:baza javob bermadi
```

- Binding'lar: `error` — **ikki** navbatga (bir xil kalit), `info` va `warning` — bittaga.
- `error` ikkala obunachiga ham keldi; `info` va `warning` — faqat PHP'ga.
- `debug` uchun binding yo'q — hech kim olmadi.
- Kuzatildi: PHP yuboruvchisi `info:foydalanuvchi kirdi` ko'rinishida chiqaradi, Node.js esa `warning: 'disk 90%'` — bu faqat qo'llanma kodlaridagi chiqarish formati.

### Topics

Yuboruvchi — `emit_log_topic.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchange = 'topic_logs';
    const args = process.argv.slice(2);
    const key = (args.length > 0) ? args[0] : 'anonymous.info';
    const msg = args.slice(1).join(' ') || 'Hello World!';

    await channel.assertExchange(exchange, 'topic', {
        durable: false
    });
    channel.publish(exchange, key, Buffer.from(msg));
    console.log(" [x] Sent %s: '%s'", key, msg);

    setTimeout(function() {
        connection.close();
        process.exit(0);
    }, 500);
}

main();
```

Qabul qiluvchi — `receive_logs_topic.php` (asosiy qismi):

```php
list($queue_name, ,) = $channel->queue_declare("", false, false, true, false);

$binding_keys = array_slice($argv, 1);
if (empty($binding_keys)) {
    file_put_contents('php://stderr', "Usage: $argv[0] [binding_key]\n");
    exit(1);
}

foreach ($binding_keys as $binding_key) {
    $channel->queue_bind($queue_name, 'topic_logs', $binding_key);
}

echo " [*] Waiting for logs. To exit press CTRL+C\n";

$callback = function ($msg) {
    echo ' [x] ', $msg->getRoutingKey(), ':', $msg->getBody(), "\n";
};

$channel->basic_consume($queue_name, '', false, true, false, false, $callback);
```

Uch obunachi — `kern.*` (Node.js), `*.critical` (PHP), `#` (Node.js):

```text vps
$ pkill -f receive_logs_direct; sleep 1; cd /root/rabbit-ilova; (node receive_logs_topic.js "kern.*" > /tmp/t1.log 2>&1 &); (php receive_logs_topic.php "*.critical" > /tmp/t2.log 2>&1 &); (node receive_logs_topic.js "#" > /tmp/t3.log 2>&1 &); sleep 2; rabbitmqctl -q list_bindings source_name routing_key | grep '^topic_logs' | sort
topic_logs	#
topic_logs	*.critical
topic_logs	kern.*
$ cd /root/rabbit-ilova; for k in kern.critical kern.info auth.critical auth.info; do node emit_log_topic.js $k "xabar" >/dev/null; done; php emit_log_topic.php kern "bitta bo'lak" >/dev/null; sleep 1; echo "kern.*:"; cat /tmp/t1.log; echo "*.critical:"; cat /tmp/t2.log; echo "#:"; cat /tmp/t3.log
kern.*:
 [*] Waiting for logs. To exit press CTRL+C
 [x] kern.critical:'xabar'
 [x] kern.info:'xabar'
*.critical:
 [*] Waiting for logs. To exit press CTRL+C
 [x] kern.critical:xabar
 [x] auth.critical:xabar
#:
 [*] Waiting for logs. To exit press CTRL+C
 [x] kern.critical:'xabar'
 [x] kern.info:'xabar'
 [x] auth.critical:'xabar'
 [x] auth.info:'xabar'
 [x] kern:'bitta bo'lak'
$ pkill -f receive_logs_topic; sleep 1; rabbitmqctl -q list_queues name | grep -c 'amq\.gen'; rm -f /tmp/d1.log /tmp/d2.log /tmp/t1.log /tmp/t2.log /tmp/t3.log
0
```

| Routing key | `kern.*` | `*.critical` | `#` |
| --- | --- | --- | --- |
| `kern.critical` | ✅ | ✅ | ✅ |
| `kern.info` | ✅ | — | ✅ |
| `auth.critical` | — | ✅ | ✅ |
| `auth.info` | — | — | ✅ |
| `kern` (bitta so'z) | — | — | ✅ |

`kern` — `kern.*` ga **tushmadi**: `*` aynan bitta so'zni talab qiladi, `kern` dan keyin esa so'z yo'q. `#` — hammasini oldi. Obunachilar to'xtagach ularning vaqtinchalik navbatlari o'chdi (0).

## Variantlar

| Kerak | Exchange | Binding |
| --- | --- | --- |
| Bitta mezon, aniq qiymat (`error`) | Direct | `error` |
| Bir nechta qiymat | Direct | Har biriga alohida binding |
| Bir nechta mezon (`manba.daraja`) | Topic | `kern.*`, `*.critical` |
| Hammasi | Topic `#` yoki fanout | — |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `kern.*` `kern` ni ham qamraydi deb kutish | `*` — aynan bitta so'z (RT, sinovda) | `kern.#` |
| Routing key'da tartibsiz format | Naqshlar ishlamaydi | Bitta qolip (`manba.daraja`) |
| Juda uzun routing key | Chegara 255 bayt (RT) | Qisqa so'zlar |
| Mos binding'i yo'q kalit | Xabar tashlab yuboriladi (sinovda `debug`) | Kerak bo'lsa alternate exchange (10-bob) |
| Topic'ni faqat direct o'rnida ishlatish | Ortiqcha murakkablik | Naqsh kerak bo'lmasa — direct |

## Amaliyot

1. Direct va topic exchange qanday farq qiladi?
2. Bitta kalitni ikki navbatga bog'lasa nima bo'ladi?
3. `*` va `#` farqi?
4. Sinovda `kern` routing key'i qaysi obunachilarga tushdi va nega?
5. Topic exchange qachon fanout, qachon direct kabi ishlaydi?

<details>
<summary>Javoblar</summary>

1. Direct — kalit aynan teng; topic — so'zlar bo'yicha naqsh.
2. Xabar ikkala navbatga ham boradi — shu kalit uchun fanout kabi.
3. `*` — aynan bitta so'z, `#` — nol yoki ko'p so'z.
4. Faqat `#` ga: `kern.*` bir so'zni talab qiladi, `*.critical` mos emas.
5. `#` bilan — fanout; `*` va `#` siz — direct.

</details>

## Rasmiy hujjat

- [RT: 4. Routing (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-four-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-four-php)
- [RT: 5. Topics (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-five-php)
