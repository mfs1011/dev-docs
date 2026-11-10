# 24 — Offset va filtrlash

[Mundarija](README.md)

## Tushuncha

23-bobda consumer stream'ni har safar boshidan (`first`) o'qidi. Haqiqiy ilova esa qayta ishga tushganda **to'xtagan joyidan** davom etishi kerak. Ko'p xabardan faqat **keragini** olish ham kerak bo'ladi.

### Offset kuzatish (RT: Stream 2. Offset Tracking)

Stream'dagi har xabarning **offset**'i bor — jurnaldagi tartib raqami (0, 1, 2 …). Consumer qaysi offsetgacha ishlaganini **saqlab qo'yadi**, qayta ishga tushganda uni so'rab, keyingisidan davom etadi:

| Qadam | `rabbitmq-stream-js-client` |
| --- | --- |
| Consumer nomi | `consumerRef` — saqlangan offset shu nom bilan bog'lanadi |
| Saqlash | `consumer.storeOffset(message.offset)` (qo'llanmada — har 10 xabarda va oxirida) |
| Davom ettirish | `client.queryOffset({ reference, stream })` → `Offset.offset(saqlangan + 1)`; topilmasa — `Offset.first()` |

RQ (Streams — Offset Tracking): broker'ning offset kuzatish imkoniyati (hozircha faqat stream plagini orqali) offsetlarni **stream'ning o'zida**, xabar bo'lmagan ma'lumot sifatida saqlaydi. Har saqlash so'rovida stream diskda biroz kattalashadi.

### Filtrlash (RQ: Stream Filtering)

Filtrlash uch bosqichda bo'lishi mumkin (har biri ixtiyoriy):

| Bosqich | Qayerda | Nima |
| --- | --- | --- |
| 1. **Bloom filtr** | Serverda, **chunk** darajasida | Publisher har xabarga filtr qiymatini beradi (masalan, `emea`). RabbitMQ chunk qiymatlarini Bloom filtrga yig'adi. Consumer qiymat(lar) bersa, mos xabari bo'lmagan chunk butunlay o'tkazib yuboriladi — diskdan ham o'qilmaydi |
| 2. AMQP filtr ifodalari | Serverda, har xabar | Faqat AMQP 1.0 |
| 3. **Klient tomonida** | Klientda, har xabar | Ilova kelgan xabarni o'zi tekshiradi |

RQ: Bloom filtr — eng samarali, lekin u chunk darajasida ishlaydi va **soxta ijobiy** (false positive) natija berishi mumkin. Shuning uchun u odatda **klient tomonidagi filtr** bilan birga ishlatiladi. Consumer filtr bersa, filtr qiymati **yo'q** xabarlar standartda yuborilmaydi; ularni ham olish uchun — `matchUnfiltered` (AMQP 0-9-1 da `x-stream-match-unfiltered`). Bir nechta qiymat — `OR` bilan.

AMQP 0-9-1 (RQ): yuborishda `x-stream-filter-value` header'i, o'qishda `x-stream-filter` consumer argumenti; prefetch va tasdiq shart.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, `rabbitmq-stream-js-client` 1.1.0).

### Offset kuzatish — RT kodi o'zgarishsiz

Publisher 100 xabar yuboradi, oxirgisi — `marker`:

```js
const rabbit = require("rabbitmq-stream-js-client");

async function main() {
  console.log("Connecting...");
  const client = await rabbit.connect({
    vhost: "/",
    port: 5552,
    hostname: "localhost",
    username: "guest",
    password: "guest",
  });

  console.log("Making sure the stream exists...");
  const streamName = "stream-offset-tracking-javascript";
  await client.createStream({ stream: streamName, arguments: {} });

  console.log("Creating the publisher...");
  const publisher = await client.declarePublisher({ stream: streamName });

  const messageCount = 100;
  console.log(`Publishing ${messageCount} messages`);
  for (let i = 0; i < messageCount; i++) {
    const body = i === messageCount - 1 ? "marker" : `hello ${i}`;
    await publisher.send(Buffer.from(body));
  }

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

Consumer offsetni saqlaydi va `marker` da to'xtaydi:

```js
const rabbit = require("rabbitmq-stream-js-client");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log("Connecting...");
  const client = await rabbit.connect({
    hostname: "localhost",
    port: 5552,
    username: "guest",
    password: "guest",
    vhost: "/",
  });

  console.log("Making sure the stream exists...");
  const streamName = "stream-offset-tracking-javascript";
  await client.createStream({ stream: streamName, arguments: {} });

  const consumerRef = "offset-tracking-tutorial";
  let firstOffset = undefined;
  let offsetSpecification = rabbit.Offset.first();
  try {
    const offset = await client.queryOffset({ reference: consumerRef, stream: streamName });
    offsetSpecification = rabbit.Offset.offset(offset + 1n);
  } catch (e) {}

  let lastOffset = offsetSpecification.value;
  let messageCount = 0;
  const consumer = await client.declareConsumer(
    { stream: streamName, offset: offsetSpecification, consumerRef },
    async (message) => {
      messageCount++;
      if (!firstOffset && messageCount === 1) {
        firstOffset = message.offset;
        console.log("First message received");
      }
      if (messageCount % 10 === 0) {
        await consumer.storeOffset(message.offset);
      }
      if (message.content.toString() === "marker") {
        console.log("Marker found");
        lastOffset = message.offset;
        await consumer.storeOffset(message.offset);
        await consumer.close(true);
      }
    }
  );

  console.log(`Start consuming...`);
  await sleep(2000);
  console.log(`Done consuming, first offset was ${firstOffset}, last offset was ${lastOffset}`);
}

main()
  .then(async () => process.exit(0))
  .catch((res) => {
    console.log("Error while receiving message!", res);
    process.exit(-1);
  });
```

```text vps
$ cd /root/rabbit-ilova && node offset_tracking_send.js | grep -E 'Publishing|done'
Publishing 100 messages
done!
$ cd /root/rabbit-ilova && node offset_tracking_receive.js
Connecting...
Making sure the stream exists...
Start consuming...
First message received
Marker found
Done consuming, first offset was 0, last offset was 99
$ cd /root/rabbit-ilova && node offset_tracking_send.js | grep -E 'Publishing|done'
Publishing 100 messages
done!
$ cd /root/rabbit-ilova && node offset_tracking_receive.js
Connecting...
Making sure the stream exists...
Start consuming...
First message received
Marker found
Done consuming, first offset was 100, last offset was 199
$ rabbitmqctl -q list_queues name type messages | grep -E '^name|stream-offset'
name	type	messages
stream-offset-tracking-javascript	stream	412
```

- Birinchi ishga tushirish: saqlangan offset yo'q — boshidan, 0…99.
- Yana 100 xabar yuborilgach, ikkinchi ishga tushirish **100** dan boshladi (99 saqlangan edi, `+1`) va 199 da to'xtadi — eski xabarlarni qayta o'qimadi.
- Kuzatildi: 200 xabar yuborilgan bo'lsa ham stream hisoblagichi 412 ni ko'rsatdi. RQ bo'yicha offsetlar stream'ning o'zida xabar bo'lmagan ma'lumot sifatida saqlanadi — hisoblagich shu yozuvlarni ham qo'shib sanagan ko'rinadi.

### Bloom filtr — Node.js

```js
// Stream filtrlash (Bloom filtr): publisher filtr qiymatini beradi, consumer serverda va klientda filtrlaydi
const rabbit = require("rabbitmq-stream-js-client");
const kut = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const client = await rabbit.connect({ hostname: "localhost", port: 5552, username: "guest", password: "guest", vhost: "/" });
  const stream = "filtr-sinov";
  await client.createStream({ stream, arguments: {} });
  // Filtr qiymati — xabarning "region" xususiyatidan
  const pub = await client.declarePublisher({ stream }, msg => msg.applicationProperties?.region);
  for (const [matn, region] of [["e1", "emea"], ["a1", "apac"], ["e2", "emea"], ["x1", undefined]])
    await pub.send(Buffer.from(matn), region ? { applicationProperties: { region } } : {});
  await kut(500);

  const oqi = async (nom, filter) => {
    const olindi = [];
    await client.declareConsumer({ stream, offset: rabbit.Offset.first(), filter }, m => olindi.push(m.content.toString()));
    await kut(1500); console.log(`${nom}: [${olindi.join(", ")}]`);
  };
  await oqi("filtrsiz", undefined);
  await oqi("values=[emea], klient filtrisiz", { values: ["emea"], postFilterFunc: () => true, matchUnfiltered: false });
  await oqi("values=[emea] + postFilterFunc", { values: ["emea"], postFilterFunc: m => m.applicationProperties?.region === "emea", matchUnfiltered: false });
  await oqi("values=[emea] + matchUnfiltered", { values: ["emea"], postFilterFunc: m => m.applicationProperties?.region !== "apac", matchUnfiltered: true });
  await client.close();
}
main().then(() => process.exit(0)).catch(e => { console.log(e.message); process.exit(1); });
```

```text vps
$ cd /root/rabbit-ilova && node filtr.js
filtrsiz: [e1, a1, e2, x1]
values=[emea], klient filtrisiz: [e1, a1, e2, x1]
values=[emea] + postFilterFunc: [e1, e2]
values=[emea] + matchUnfiltered: [e1, e2, x1]
```

| Consumer | Olindi | Nega |
| --- | --- | --- |
| Filtrsiz | e1, a1, e2, x1 | Hammasi |
| `values: ["emea"]`, klient filtrisiz | e1, **a1**, e2, **x1** | To'rttasi bitta chunk'da — chunk `emea` ga mos, butun chunk keldi |
| `values: ["emea"]` + `postFilterFunc` | e1, e2 | Klient tomonida aniq filtr |
| + `matchUnfiltered` | e1, e2, x1 | Filtr qiymati yo'q `x1` ham |

Ikkinchi qator — RQ ogohlantirishining amaldagi ko'rinishi: Bloom filtr chunk darajasida ishlaydi, kichik stream'da hamma xabar bitta chunk'da bo'ladi. Klient tomonidagi filtrsiz `apac` ham keldi.

### Bloom filtr — PHP (AMQP 0-9-1)

```php
<?php
// AMQP 0-9-1: x-stream-filter-value (yuborish) va x-stream-filter (o'qish) — RQ misoli bo'yicha
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;
use PhpAmqpLib\Wire\AMQPTable;
$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest'); $ch = $c->channel();
$ch->queue_declare('filtr-php', false, true, false, false, false, new AMQPTable(['x-queue-type' => 'stream']));
foreach ([['e1', 'emea'], ['a1', 'apac'], ['e2', 'emea']] as [$m, $r])
    $ch->basic_publish(new AMQPMessage($m, ['application_headers' => new AMQPTable(['x-stream-filter-value' => $r])]), '', 'filtr-php');
$ch->basic_qos(null, 100, false);
$olindi = [];
$ch->basic_consume('filtr-php', '', false, false, false, false, function ($m) use (&$olindi) {
    $h = $m->get('application_headers')->getNativeData();
    if (($h['x-stream-filter-value'] ?? null) === 'emea') $olindi[] = $m->getBody();   // klient tomonida (3-bosqich)
    $m->ack();
}, null, new AMQPTable(['x-stream-filter' => 'emea', 'x-stream-offset' => 'first'])); // serverda (1-bosqich)
try { while (true) $ch->wait(null, false, 2); } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {}
echo "PHP x-stream-filter=emea: [", implode(', ', $olindi), "]\n";
$ch->queue_delete('filtr-php'); $ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && php filtr.php
PHP x-stream-filter=emea: [e1, e2]
$ for s in stream-offset-tracking-javascript filtr-sinov hello-nodejs-stream; do rabbitmqadmin queues delete --name $s; done; rabbitmqctl -q list_queues name type | grep -c stream
0
```

Server tomonida `x-stream-filter`, klient tomonida header tekshiruvi — faqat `emea`. Sinov stream'lari o'chirildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Qayta ishga tushganda davom etish | Stream protokoli: `consumerRef` + `storeOffset` |
| Offsetni o'zi saqlash (masalan, bazada) | O'z omboringiz + `Offset.offset(n)` |
| Katta stream'dan kichik qism | Bloom filtr (server) + klient filtri |
| Aniq xabar darajasida server filtri | AMQP 1.0 filtr ifodalari (RQ) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har xabarda `storeOffset` | Stream har so'rovda kattalashadi (RQ) | Har N xabarda va oxirida (RT kabi) |
| Bloom filtr aniq deb hisoblash | Chunk darajasida, soxta ijobiy (RQ, sinovda `a1` keldi) | Klient filtri ham |
| Filtr qiymatisiz xabarlarni kutish | Standartda yuborilmaydi (RQ) | `matchUnfiltered` / `x-stream-match-unfiltered` |
| `consumerRef` ni har safar o'zgartirish | Saqlangan offset topilmaydi — boshidan o'qiladi | Doimiy nom |

## Amaliyot

1. Offset nima?
2. Sinovda consumer ikkinchi marta qayerdan boshladi va nega?
3. Offset kuzatish ma'lumotlari qayerda saqlanadi?
4. Bloom filtr nima uchun klient filtri bilan birga ishlatiladi?
5. Filtr qiymati bo'lmagan xabarlarni ham olish uchun nima kerak?

<details>
<summary>Javoblar</summary>

1. Xabarning stream jurnalidagi tartib raqami.
2. 100 dan — 99 saqlangan edi, `+1` dan davom etdi.
3. Stream'ning o'zida, xabar bo'lmagan ma'lumot sifatida.
4. U chunk darajasida ishlaydi va soxta ijobiy natija berishi mumkin.
5. `matchUnfiltered` (AMQP 0-9-1 da `x-stream-match-unfiltered`).

</details>

## Rasmiy hujjat

- [RT: Stream 2. Offset Tracking (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-two-javascript-stream)
- [RQ: Stream Filtering](https://www.rabbitmq.com/docs/stream-filtering)
- [RQ: Streams](https://www.rabbitmq.com/docs/streams) — Offset Tracking
