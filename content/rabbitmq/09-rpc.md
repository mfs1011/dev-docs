# 09 — So'rov va javob (RPC)

[Mundarija](README.md)

## Tushuncha

RT (6. RPC): ba'zan uzoqdagi kompyuterda funksiyani ishga tushirib, **natijasini kutish** kerak bo'ladi. Bu naqsh — **RPC** (Remote Procedure Call — masofaviy protsedura chaqiruvi). Qo'llanmadagi misol: RPC server Fibonachchi sonini hisoblaydi, mijoz so'rov yuborib, javobni kutadi.

```text
mijoz ──so'rov (reply_to, correlation_id)──▶ [rpc_queue] ──▶ server
  ▲                                                            │
  └────────────── javob (o'sha correlation_id) ◀───────────────┘
```

### Javob qayerga keladi

Mijoz so'rov bilan birga **javob manzili**ni (`reply_to`) yuboradi. Ikki yo'l bor:

| Usul | Nima (RT, RQ) |
| --- | --- |
| **Javob navbati** (callback queue) | Mijoz server nomlagan **exclusive** navbat yaratadi. RT: har RPC uchun navbat yaratib-o'chirish qimmat, ayniqsa klasterda — barcha tugunlar navbat metama'lumoti bo'yicha kelishishi kerak. Bitta mijozga bitta qayta ishlatiladigan navbat — yaxshiroq |
| **Direct Reply-To** | Haqiqiy navbat yo'q: mijoz `amq.rabbitmq.reply-to` **psevdo-navbat**idan o'qiydi va uni `reply_to` qilib qo'yadi. RabbitMQ javobni to'g'ridan-to'g'ri mijoz kanaliga yetkazadi |

RQ (Direct Reply-To): bu usulda metadata omboriga (Khepri) yozuv tushmaydi, javob saqlanmaydi, alohida Erlang jarayoni yo'q. Asosiy afzalligi — **ko'lam**: o'n minglab mijoz, tez-tez ulanib-uziladiganlar ham. Shartlari va cheklovlari (AMQP 0-9-1):

- mijoz `amq.rabbitmq.reply-to` dan **avtomatik tasdiq** (no-ack) rejimida o'qiydi;
- o'qish va so'rov yuborish **bitta ulanish va kanal**da bo'ladi;
- RabbitMQ `reply-to` ni `amq.rabbitmq.reply-to.<qo'shimcha>` ga almashtiradi, server javobni standart exchange'ga shu nom bilan yuboradi;
- javob **ko'pi bilan bir marta** (at-most-once) yetkaziladi: so'rov yuborgan mijoz uzilsa javob tashlab yuboriladi. Javob yo'qolishi mumkin bo'lmasa, buferlash kerak bo'lsa yoki bitta mijozga sekundiga yuzlab javob bo'lsa — oddiy navbat ishlatiladi;
- u `rabbitmqctl list_queues` da va panelda **ko'rinmaydi**.

### Correlation ID

RT: bitta javob manzili barcha so'rovlar uchun — kelgan javob qaysi so'rovniki? Har so'rovga noyob `correlation_id` beriladi, server uni javobga qaytaradi. Notanish `correlation_id` li javob — tashlab yuboriladi. Nega xato emas? Server javobni yuborib, so'rovni tasdiqlashdan oldin qulasa, qayta ishga tushgach so'rovni **yana** bajaradi — mijoz takroriy javoblarga tayyor bo'lishi, RPC esa iloji boricha **idempotent** bo'lishi kerak.

### RPC haqida ogohlantirish (RT)

RPC ko'p tanqid qilinadi: dasturchi chaqiruv lokalmi yoki sekin RPC'mi bilmasa, tizim oldindan aytib bo'lmaydigan bo'ladi. RT maslahati: qaysi chaqiruv masofaviy ekanini aniq qiling, bog'liqliklarni hujjatlang, xatolarni ishlang — **server uzoq vaqt ishlamasa mijoz nima qiladi?** Shubha bo'lsa — RPC'dan voz keching, asinxron jarayon (natija keyingi bosqichga yuboriladi) afzal.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). RT kodi o'zgarishsiz.

Server — `rpc_server.js`:

```js
#!/usr/bin/env node

const amqp = require('amqplib');

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const queue = 'rpc_queue';

    await channel.assertQueue(queue, {
        durable: true,
        arguments: { 'x-queue-type': 'quorum' }
    });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(queue, function reply(msg) {
        const n = parseInt(msg.content.toString());

        console.log(" [.] fib(%d)", n);

        const r = fibonacci(n);

        channel.sendToQueue(msg.properties.replyTo,
            Buffer.from(r.toString()), {
                correlationId: msg.properties.correlationId
            });

        channel.ack(msg);
    });
}

function fibonacci(n) {
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) {
        [a, b] = [b, a + b];
    }
    return a;
}

main();
```

Mijoz — `rpc_client.js` (Direct Reply-To):

```js
#!/usr/bin/env node

const amqp = require('amqplib');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log("Usage: rpc_client.js num");
    process.exit(1);
}

async function main() {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const correlationId = generateUuid();
    const num = parseInt(args[0]);

    console.log(' [x] Requesting fib(%d)', num);

    const result = await new Promise((resolve) => {
        // Consume from the Direct Reply-to pseudo-queue (noAck is mandatory)
        channel.consume('amq.rabbitmq.reply-to', (msg) => {
            if (msg.properties.correlationId === correlationId) {
                resolve(msg.content.toString());
            }
        }, { noAck: true });

        channel.sendToQueue('rpc_queue',
            Buffer.from(num.toString()), {
                correlationId: correlationId,
                replyTo: 'amq.rabbitmq.reply-to'
            });
    });

    console.log(' [.] Got %s', result);
    await connection.close();
}

function generateUuid() {
    return Math.random().toString() +
        Math.random().toString() +
        Math.random().toString();
}

main();
```

PHP mijoz — javob navbati bilan (`rpc_client.php`, asosiy sinf):

```php
class FibonacciRpcClient
{
    private $connection;
    private $channel;
    private $callback_queue;
    private $response;
    private $corr_id;

    public function __construct()
    {
        $this->connection = new AMQPStreamConnection(
            'localhost',
            5672,
            'guest',
            'guest'
        );
        $this->channel = $this->connection->channel();
        list($this->callback_queue, ,) = $this->channel->queue_declare(
            "",
            false,
            false,
            true,
            false
        );
        $this->channel->basic_consume(
            $this->callback_queue,
            '',
            false,
            true,
            false,
            false,
            array(
                $this,
                'onResponse'
            )
        );
    }

    public function onResponse($rep)
    {
        if ($rep->get('correlation_id') == $this->corr_id) {
            $this->response = $rep->getBody();
        }
    }

    public function call($n)
    {
        $this->response = null;
        $this->corr_id = uniqid();

        $msg = new AMQPMessage(
            (string) $n,
            array(
                'correlation_id' => $this->corr_id,
                'reply_to' => $this->callback_queue
            )
        );
        $this->channel->basic_publish($msg, '', 'rpc_queue');
        while (!$this->response) {
            $this->channel->wait();
        }
        return intval($this->response);
    }
}

$fibonacci_rpc = new FibonacciRpcClient();
$response = $fibonacci_rpc->call(30);
echo ' [.] Got ', $response, "\n";
```

### Node.js server, ikki mijoz

```text vps
$ cd /root/rabbit-ilova; (node rpc_server.js > /tmp/rs.log 2>&1 &); sleep 2; rabbitmqctl -q list_queues name type consumers | grep -E '^name|rpc_queue'
name	type	consumers
rpc_queue	quorum	1
$ cd /root/rabbit-ilova; node rpc_client.js 10; rabbitmqctl -q list_queues name | grep -c 'amq\.'
 [x] Requesting fib(10)
 [.] Got 55
0
$ cd /root/rabbit-ilova; php rpc_client.php; rabbitmqctl -q list_queues name | grep -c 'amq\.'
 [.] Got 832040
0
$ cat /tmp/rs.log; pkill -f rpc_server.js; sleep 1
 [x] Awaiting RPC requests
 [.] fib(10)
 [.] fib(30)
```

- `rpc_queue` — quorum, bitta consumer (server). Server `prefetch(1)` bilan.
- Node.js mijoz — `fib(10) = 55`; PHP mijoz — `fib(30) = 832040`; ikkalasi ham shu bir serverdan.
- Ikkala mijozdan keyin ham `amq.*` navbat **0**: Node.js'da navbat umuman yaratilmadi (Direct Reply-To), PHP'ning exclusive javob navbati esa ulanish yopilganda o'chdi.

### PHP server, Node.js mijoz

```text vps
$ cd /root/rabbit-ilova; (php rpc_server.php > /tmp/rs2.log 2>&1 &); sleep 2; node rpc_client.js 20; sleep 1; cat /tmp/rs2.log; pkill -f rpc_server.php; rm -f /tmp/rs.log /tmp/rs2.log
 [x] Requesting fib(20)
 [.] Got 6765
 [x] Awaiting RPC requests
 [.] fib(20)
```

`fib(20) = 6765` — server va mijoz tillari almashdi, natija o'zgarmadi.

### Server yo'q

```text vps
$ node rpc_client.js 5 & sleep 3; rabbitmqctl -q list_queues name messages_ready | grep -E '^name|rpc_queue'; kill %1 2>/dev/null; rabbitmqctl -q purge_queue rpc_queue
 [x] Requesting fib(5)
name	messages_ready
rpc_queue	1
```

So'rov `rpc_queue` da turib qoldi (1 xabar), mijoz javobni **cheksiz** kutdi — qo'llanmadagi mijozda timeout yo'q. RT aytgan holat aynan shu: "server uzoq vaqt ishlamasa mijoz nima qiladi?". Haqiqiy mijozda — timeout va qayta urinish yoki xato. (Sinov so'rovi navbatdan tozalandi.)

## Variantlar

| Usul | Qachon |
| --- | --- |
| Direct Reply-To | Ko'p mijoz, qisqa so'rovlar, javob yo'qolsa qayta so'rash mumkin (RQ) |
| Mijozga bitta exclusive javob navbati | Bitta mijoz, uzilganda javoblar kerak emas |
| Uzoq yashaydigan nomli javob navbati | Uzoq ishlar, qisqa uzilishda javob saqlanishi kerak (RQ) |
| Asinxron jarayon (RPC'siz) | RT tavsiyasi: shubha bo'lsa |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Mijozda timeout yo'q | Server ishlamasa — cheksiz kutish (sinovda) | Timeout, qayta urinish yoki xato |
| `correlation_id` siz | Javob qaysi so'rovniki — noma'lum (RT) | Har so'rovga noyob ID |
| Notanish javobda xato tashlash | Server qayta ishga tushganda takroriy javob keladi (RT) | Tashlab yuborish, RPC — idempotent |
| Har so'rovga yangi navbat | Qimmat, klasterda ayniqsa (RT) | Direct Reply-To yoki bitta qayta ishlatiladigan navbat |
| Direct Reply-To'da qo'lda tasdiq | Faqat no-ack rejim (RQ) | `noAck: true` |
| Muhim javob uchun Direct Reply-To | At-most-once — mijoz uzilsa yo'qoladi (RQ) | Durable javob navbati |

## Amaliyot

1. Mijoz javob qayerga kelishini serverga qanday bildiradi?
2. Javob navbati va Direct Reply-To farqi?
3. `correlation_id` nima uchun?
4. Nega notanish `correlation_id` li javob xato emas, tashlab yuboriladi?
5. Sinovda Node.js mijozdan keyin nega `amq.*` navbat qolmadi? PHP'dan keyin-chi?
6. Server ishlamasa qo'llanmadagi mijoz nima qildi?

<details>
<summary>Javoblar</summary>

1. `reply_to` xususiyati bilan.
2. Birinchisi — haqiqiy (exclusive) navbat; ikkinchisi — `amq.rabbitmq.reply-to` psevdo-navbati, navbat yaratilmaydi.
3. Javobni so'rov bilan moslash uchun.
4. Server qulab qayta ishga tushsa takroriy javob kelishi mumkin.
5. Node.js — Direct Reply-To, navbat yaratilmadi; PHP — exclusive navbat ulanish yopilganda o'chdi.
6. Cheksiz kutdi — timeout yo'q; so'rov navbatda qoldi.

</details>

## Rasmiy hujjat

- [RT: 6. RPC (JavaScript)](https://www.rabbitmq.com/tutorials/tutorial-six-javascript) · [(PHP)](https://www.rabbitmq.com/tutorials/tutorial-six-php)
- [RQ: Direct Reply-To](https://www.rabbitmq.com/docs/direct-reply-to)
