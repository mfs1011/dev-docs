# 23 — Stream nima

[Mundarija](README.md)

## Tushuncha

RQ (Streams): **stream** — persistent, replikatsiyalanadigan ma'lumot tuzilmasi. Navbat kabi publisher xabarlarini buferlab, consumer'larga beradi. Lekin navbatdan ikki muhim farqi bor — xabarlar qanday **saqlanadi** va qanday **o'qiladi**:

- stream — faqat **oxiriga qo'shiladigan jurnal** (append-only log); xabarlar muddati tugaguncha **qayta-qayta** o'qiladi;
- o'qish xabarni **o'chirmaydi** ("non-destructive consumer semantics"): bir yoki bir nechta consumer bir xil xabarlarni istagancha o'qiydi;
- doim persistent va replikatsiyalanadi.

RQ: stream'lar navbatlarni **almashtirmaydi**, ularni **to'ldiradi**.

### Qachon (RQ: Use Cases)

| Holat | Nega stream |
| --- | --- |
| **Katta fan-out** | Har obunachiga alohida navbat o'rniga — bitta stream'ni istalgan sonli consumer o'qiydi |
| **Qayta o'qish** ("vaqtga sayohat") | Navbatda o'qilgan xabar o'chadi; stream'da jurnalning istalgan nuqtasidan o'qish mumkin |
| **O'tkazuvchanlik** | Unumdorlik asosiy maqsad sifatida loyihalangan |
| **Katta backlog** | Navbatlar bo'sh holatga intiladi; stream millionlab xabar bilan ishlashga mo'ljallangan |

### Ikki yo'l bilan ishlatish (RQ)

| Yo'l | Nima |
| --- | --- |
| **RabbitMQ Stream protokoli** (plagin, port 5552) va uning klientlari | **Qat'iyan tavsiya etiladi** — stream'ning barcha imkoniyatlari va eng yaxshi o'tkazuvchanlik |
| Oddiy AMQP 0-9-1 klienti | Stream — `x-queue-type: stream` li navbat. O'qish: `x-stream-offset` consumer argumenti; **QoS (prefetch) majburiy** va **qo'lda tasdiq** shart |

`x-stream-offset` (RQ): `first` — jurnal boshidan; `last` — oxirgi "chunk"dan (bir nechta xabardan bir necha minggacha bo'lgan saqlash birligi); `next` — standart, ulangandan keyingi xabarlardan; aniq raqam (offset); vaqt tamg'asi; vaqt oralig'i.

### Klient tugunni qanday topadi (RQ: Stream Client Connections)

Stream protokoli klientiga stream lideri va replikalari **qaysi tugunda** ekanini aytadi. Klient yozish uchun liderga, o'qish uchun replikaga **o'zi ulanadi**. Standart holatda tugun o'zining **hostname** va portini qaytaradi. Agar ilovalar bu nomga ulana olmasa (konteynerlar, proksi, nomni boshqa manzilga ochadigan DNS), `stream.advertised_host` va `stream.advertised_port` sozlanadi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Node.js — RT stream qo'llanmasi kodi o'zgarishsiz (`rabbitmq-stream-js-client`):

```js
const rabbit = require("rabbitmq-stream-js-client");

async function main() {
    const streamName = "hello-nodejs-stream";

    console.log("Connecting...");
    const client = await rabbit.connect({
        vhost: "/",
        port: 5552,
        hostname: "localhost",
        username: "guest",
        password: "guest",
    });

    console.log("Making sure the stream exists...");
    const streamSizeRetention = 5 * 1e9
    await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

    console.log("Creating the publisher...");
    const publisher = await client.declarePublisher({ stream: streamName });

    console.log("Sending a message...");
    await publisher.send(Buffer.from("Test message"));

    console.log("Closing the connection...");
    await client.close();
}

main()
    .then(() => console.log("done!"))
    .catch((res) => {
        console.log("Error in publishing message!", res);
        process.exit(-1);
    });
```

```js
const rabbit = require("rabbitmq-stream-js-client")

async function main() {
    const streamName = "hello-nodejs-stream"

    console.log("Connecting...");
    const client = await rabbit.connect({
        hostname: "localhost",
        port: 5552,
        username: "guest",
        password: "guest",
        vhost: "/",
    })

    console.log("Making sure the stream exists...");
    const streamSizeRetention = 5 * 1e9
    await client.createStream({ stream: streamName, arguments: { "max-length-bytes": streamSizeRetention } });

    console.log("Declaring the consumer with offset...");
    await client.declareConsumer({ stream: streamName, offset: rabbit.Offset.first() }, (message) => {
        console.log(`Received message ${message.content.toString()}`)
    })

}

main()
    .then(async () => {
        await new Promise(function () { })
    })
    .catch((res) => {
        console.log("Error while receiving message!", res)
        process.exit(-1)
    })
```

### Plagin va klient

```text vps
$ rabbitmq-plugins enable rabbitmq_stream 2>&1 | grep -E 'started|enabling'; sleep 3; rabbitmq-diagnostics -q listeners | grep -E 'stream|amqp'
started 1 plugins.
Interface: [::], port: 5672, protocol: amqp, purpose: AMQP 0-9-1 and AMQP 1.0
Interface: [::], port: 5552, protocol: stream, purpose: stream
$ cd /root/rabbit-ilova && npm install --silent rabbitmq-stream-js-client@1.1.0 && npm ls rabbitmq-stream-js-client | grep stream
└── rabbitmq-stream-js-client@1.1.0
```

Stream plagini yoqildi — yangi tinglovchi 5552. Kuzatildi: RT tutorials repo'si `rabbitmq-stream-js-client` ning ^0.4.2 versiyasini ko'rsatadi, npm'dagi eng yangisi — 1.1.0; kod 1.1.0 bilan o'zgarishsiz ishladi.

### Birinchi urinish — autentifikatsiya xatosi

```text vps
$ cd /root/rabbit-ilova && node send.js && node send.js | tail -1
Connecting...
Making sure the stream exists...
Creating the publisher...
Error: Unable Authenticate -> 11
```

Stream yaratildi, lekin publisher yaratishda `Unable Authenticate -> 11` xatosi chiqdi. Protokol hujjatida (`PROTOCOL.adoc`) `0x0b` kodi — **SASL authentication failure loopback**. Sabab:

```text vps
$ getent hosts lab | awk '{print "lab ->", $1}'
lab -> 203.0.113.10
```

Klient publisher uchun lider tugunga uning **hostname**'i (`lab`) bo'yicha qayta ulanadi. `lab` esa serverning **tashqi** manziliga ochiladi — ulanish loopback emas. `guest` faqat loopback orqali kira oladi (2-bob). Yechim — RQ'dagi `stream.advertised_host`. Bitta tugun, klientlar ham shu serverda:

```text vps
$ install -m 644 /root/rabbitmq.conf /etc/rabbitmq/rabbitmq.conf && rm /root/rabbitmq.conf && cat /etc/rabbitmq/rabbitmq.conf
# Stream klientlari tugunga qanday ulanishi kerakligi (RQ: Advertised Host and Port)
# Bitta tugun, klientlar shu serverda: guest faqat loopback orqali kira oladi
stream.advertised_host = localhost
$ systemctl restart rabbitmq-server && rabbitmq-diagnostics -q check_running
RabbitMQ on node rabbit@lab is fully booted and running
```

### Yozish va o'qish

```text vps
$ cd /root/rabbit-ilova && node send.js && node send.js | tail -1
Connecting...
Making sure the stream exists...
Creating the publisher...
Sending a message...
Closing the connection...
done!
done!
$ rabbitmqctl -q list_queues name type messages | grep -E '^name|stream'
name	type	messages
hello-nodejs-stream	stream	2
$ cd /root/rabbit-ilova && timeout 4 node receive.js; echo "chiqish kodi: $?"
Connecting...
Making sure the stream exists...
Declaring the consumer with offset...
Received message Test message
Received message Test message
chiqish kodi: 124
$ cd /root/rabbit-ilova && timeout 4 node receive.js | grep Received
Received message Test message
Received message Test message
```

- Ikki xabar yozildi — stream'da 2 ta.
- `receive.js` `Offset.first()` bilan ikkalasini ham oldi. **Ikkinchi marta** ishga tushirilganda ham — yana ikkalasini: o'qish xabarlarni o'chirmadi. Navbatda bu imkonsiz.

### PHP — AMQP 0-9-1 orqali

RT'da PHP uchun stream qo'llanmasi yo'q. RQ'dagi "Consuming" bo'limi bo'yicha stream'ni oddiy `php-amqplib` bilan o'qish mumkin:

```php
<?php
// Stream'ni AMQP 0-9-1 orqali o'qish (RQ: Consuming): x-stream-offset, QoS va qo'lda tasdiq shart
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Wire\AMQPTable;

$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$ch = $c->channel();
$ch->basic_qos(null, 100, false);
$ch->basic_consume('hello-nodejs-stream', '', false, false, false, false,
    function ($m) { echo "PHP oldi: ", $m->getBody(), " (offset ", $m->get('application_headers')->getNativeData()['x-stream-offset'], ")\n"; $m->ack(); },
    null, new AMQPTable(['x-stream-offset' => 'first']));
try { while (true) $ch->wait(null, false, 2); } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {}
$ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && php stream_oqi.php
PHP oldi: Test message (offset 0)
PHP oldi: Test message (offset 1)
$ rabbitmqctl -q list_queues name type messages | grep stream
hello-nodejs-stream	stream	2
```

PHP ham o'sha ikki xabarni o'z **offset**lari bilan oldi (`x-stream-offset` header'ida 0 va 1). Stream'da hamon 2 ta xabar.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Har xabarni bitta worker bajarsin, keyin o'chsin | Navbat (5-bob) |
| Bir xabarni ko'p xizmat o'qisin | Stream (yoki fanout + navbatlar, 7-bob) |
| Tarixni qayta o'qish | Stream |
| Eng yuqori o'tkazuvchanlik | Stream protokoli klienti (RQ tavsiyasi) |
| Mavjud AMQP 0-9-1 ilovadan o'qish | `x-stream-offset` + prefetch + qo'lda tasdiq |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Stream'ni navbat o'rnini bosadi deb hisoblash | RQ: to'ldiradi, almashtirmaydi | Vazifaga qarab |
| AMQP 0-9-1 da prefetch'siz o'qish | QoS majburiy (RQ) | `basic_qos` |
| Klient tugun nomiga ulana olmasligini hisobga olmaslik | Publisher yoki consumer ulanmaydi (sinovda `0x0b`) | `stream.advertised_host` |
| `guest` bilan tashqi nom orqali ulanish | Faqat loopback (sinovda) | Alohida foydalanuvchi (26-bob) yoki `advertised_host` |
| Saqlash chegarasiz stream | Disk to'ladi | `max-length-bytes`, `max-age` (24-bob) |

## Amaliyot

1. Stream navbatdan qanday ikki asosiy jihatda farq qiladi?
2. Stream qaysi to'rt holat uchun yaratilgan?
3. Stream bilan ishlashning tavsiya etilgan yo'li qaysi?
4. Sinovda nega birinchi urinishda `Unable Authenticate -> 11` chiqdi?
5. AMQP 0-9-1 orqali stream'dan o'qish uchun nimalar kerak?

<details>
<summary>Javoblar</summary>

1. Saqlash (faqat oxiriga qo'shiladigan jurnal) va o'qish (xabarni o'chirmaydi, qayta o'qish mumkin).
2. Katta fan-out, qayta o'qish, o'tkazuvchanlik, katta backlog.
3. Stream protokoli (plagin) va uning klientlari.
4. Klient lider tugunga `lab` nomi bilan qayta ulandi — bu tashqi manzil, `guest` esa faqat loopback orqali kira oladi.
5. `x-stream-offset` argumenti, prefetch (QoS) va qo'lda tasdiq.

</details>

## Rasmiy hujjat

- [RQ: Streams](https://www.rabbitmq.com/docs/streams) — Use Cases, Consuming
- [RT: Stream 1. "Hello World!" (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-one-javascript-stream)
- [RQ: Stream Plugin](https://www.rabbitmq.com/docs/stream) — Advertised Host and Port · [Stream Client Connections](https://www.rabbitmq.com/docs/stream-connections)
- [RabbitMQ Stream protokoli](https://github.com/rabbitmq/rabbitmq-server/blob/main/deps/rabbitmq_stream/docs/PROTOCOL.adoc)
