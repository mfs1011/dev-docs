# 15 — Dead lettering

[Mundarija](README.md)

## Tushuncha

RQ (Dead Letter Exchanges): navbatdagi xabar quyidagi **to'rt** hodisadan birida **dead letter** qilinadi (o'lik xat — boshqa exchange'ga qayta yuboriladi):

| # | Hodisa | `reason` |
| --- | --- | --- |
| 1 | Consumer rad etdi: `basic.reject` yoki `basic.nack`, `requeue=false` | `rejected` |
| 2 | Xabar TTL'i tugadi (13-bob) | `expired` |
| 3 | Navbat uzunligi chegarasidan oshdi (14-bob) | `maxlen` |
| 4 | Quorum navbatga `delivery-limit` dan ko'p qaytarildi (12-bob) | `delivery_limit` |

**Butun navbat** muddati tugasa (`expires`), undagi xabarlar dead letter qilinmaydi.

```text
[ish navbati] ──(rad / muddat / chegara / limit)──▶ [DLX] ──▶ [o'lik xatlar navbati]
```

### Sozlash (RQ)

- **DLX** — oddiy exchange, istalgan turda.
- Policy kalitlari: `dead-letter-exchange` — DLX nomi; `dead-letter-routing-key` — yangi kalit (berilmasa — xabarning **asl** kalitlari).
- Kodda `x-dead-letter-exchange` argumenti bilan ham bo'ladi, lekin RQ **qat'iyan tavsiya etmaydi** — ilovani qayta deploy qilmay o'zgartirib bo'lmaydi. Ikkalasi bo'lsa — argument ustun.
- Ruxsatlar: navbatni `configure` qilishdan tashqari, navbatda `read`, DLX'da `write` ruxsati kerak.

### Xabarga ta'siri (RQ)

- Exchange nomi — oxirgi DLX nomiga almashadi; routing key — `dead-letter-routing-key` ga (berilgan bo'lsa).
- AMQP 0-9-1 da **`x-death`** header'i — massiv, eng yangi hodisa birinchi: `queue`, `reason`, `count`, `time`, `exchange`, `routing-keys`, `original-expiration`. Tarix `{navbat, sabab}` juftligi bo'yicha siqiladi (`count` o'sadi).
- Birinchi hodisada qo'shiladi: `x-first-death-queue`, `x-first-death-reason`, `x-first-death-exchange` (o'zgarmaydi) va `x-last-death-*` (har gal yangilanadi).
- Asl TTL olib tashlanadi — xabar keyingi navbatda yana muddatidan o'tmasin.

### Tsikl va kechiktirilgan qayta urinish (RQ)

- Dead letter **tsikli** mumkin (masalan, standart exchange'ga, kalitsiz). RabbitMQ tsiklni aniqlaydi va butun tsiklda **rad etish bo'lmagan** bo'lsa, xabarni tashlaydi.
- Kechiktirilgan qayta urinishning eski usuli: rad → TTL'li navbat → muddati tugagach asl navbatga qaytish. Quorum navbatlarda buning o'rniga o'z **delayed retry** imkoniyati tavsiya etiladi. Dead lettering — umuman ishlab bo'lmaydigan xabarlar uchun.

### Ishonchlilik (RQ)

Dead lettering — xabar **qayta nashr qilish**. Standart holatda u ichkarida **publisher confirms'siz** bajariladi va muvaffaqiyatsiz bo'lishi mumkin. Quorum navbatlarda **at-least-once** dead lettering bor:

- `dead-letter-strategy: at-least-once` (standart — `at-most-once`);
- `overflow: reject-publish` (`drop-head` bilan ishlamaydi);
- `dead-letter-exchange`; `stream_queue` feature flag yoqilgan bo'lishi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). `dl.ish` (quorum) — ish navbati; policy bilan: DLX `dl.x` (fanout), `message-ttl: 1500`, `max-length: 2`, `delivery-limit: 1`. `dl.olik` — o'lik xatlar navbati.

Node.js — har sabab uchun bittadan xabar:

```js
// Dead letter'ning to'rt sababi: maxlen, rejected, expired, delivery_limit
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createConfirmChannel();
  const q = 'dl.ish';
  await ch.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  const yubor = async m => { ch.sendToQueue(q, Buffer.from(m), { persistent: true }); await ch.waitForConfirms(); };

  // 1) max-length 2: uchinchisi kelganda eng eskisi chiqariladi (maxlen)
  for (const m of ['m1-eski', 'm2-rad', 'm3-muddat']) await yubor(m);
  // 2) m2 ni requeue=false bilan rad etamiz (rejected)
  const m2 = await ch.get(q); ch.reject(m2, false);
  // 3) m3 ni hech kim olmaydi — message-ttl 1500 ms (expired)
  await kut(2000);
  // 4) m4 ni requeue=true bilan qaytaraveramiz — delivery-limit 1 (delivery_limit)
  await yubor('m4-zaharli');
  for (let i = 0; i < 3; i++) { const m = await ch.get(q); if (!m) break; ch.reject(m, true); await kut(200); }
  await kut(500);
  console.log('dl.ish da qoldi:', (await ch.checkQueue(q)).messageCount);
  await c.close();
}
main();
```

PHP — o'lik xatlar navbatini o'qib, sabablarni chiqaradi:

```php
<?php
// Dead letter navbatini o'qib, sabablarni chiqaradi
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;

$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$ch = $c->channel();
while ($msg = $ch->basic_get('dl.olik', true)) {
    $h = $msg->get('application_headers')->getNativeData();
    $d = $h['x-death'][0];
    printf("%-11s birinchi sabab=%-14s x-death: reason=%s, queue=%s, count=%d\n",
        $msg->getBody(), $h['x-first-death-reason'], $d['reason'], $d['queue'], $d['count']);
}
$ch->close(); $c->close();
```

```text vps
$ A="rabbitmqadmin --non-interactive"; $A exchanges declare --name dl.x --type fanout --durable true; $A queues declare --name dl.olik --type quorum --durable true; $A bindings declare --source dl.x --destination-type queue --destination dl.olik --routing-key ""
$ rabbitmqctl set_policy dl-sinov "^dl\.ish$" '{"dead-letter-exchange":"dl.x","message-ttl":1500,"max-length":2,"delivery-limit":1}' --apply-to queues
Setting policy "dl-sinov" for pattern "^dl\.ish$" to "{"dead-letter-exchange":"dl.x","message-ttl":1500,"max-length":2,"delivery-limit":1}" with priority "0" for vhost "/" ...
$ cd /root/rabbit-ilova && node dl_yubor.js
dl.ish da qoldi: 0
$ rabbitmqctl -q list_queues name messages | grep -E '^name|^dl\.'
name	messages
dl.olik	4
dl.ish	0
$ cd /root/rabbit-ilova && php dl_oqi.php
m1-eski     birinchi sabab=maxlen         x-death: reason=maxlen, queue=dl.ish, count=1
m2-rad      birinchi sabab=rejected       x-death: reason=rejected, queue=dl.ish, count=1
m3-muddat   birinchi sabab=expired        x-death: reason=expired, queue=dl.ish, count=1
m4-zaharli  birinchi sabab=delivery_limit x-death: reason=delivery_limit, queue=dl.ish, count=1
```

| Xabar | Nima bo'ldi | `reason` |
| --- | --- | --- |
| `m1-eski` | Uchinchi xabar kelganda `max-length: 2` dan oshdi — eng eskisi chiqarildi | `maxlen` |
| `m2-rad` | `reject(…, false)` — qayta navbatga qo'yilmasdan rad | `rejected` |
| `m3-muddat` | Hech kim olmadi, 1.5 s dan keyin | `expired` |
| `m4-zaharli` | `reject(…, true)` bilan qaytarildi, `delivery-limit: 1` dan oshdi | `delivery_limit` |

Hech biri yo'qolmadi — to'rttasi `dl.olik` da. Har biri `x-death` (`queue=dl.ish`, `count=1`) va `x-first-death-reason` bilan. Oxirida sinov obyektlari o'chirildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Ishlanmagan xabarlarni tahlil uchun saqlash | DLX + o'lik xatlar navbati |
| Qayta urinish kechiktirilib | Quorum: delayed retry (RQ tavsiyasi); eski usul — TTL'li navbat orqali tsikl |
| Dead letter yo'qolmasin (quorum) | `at-least-once` strategiyasi |
| Kam resursli o'lik xatlar ombori | RQ: past ustuvorlikdagi policy bilan bitta stream |
| Yo'naltirib bo'lmaydigan xabarlar | Alternate exchange (10-bob) — bu boshqa hodisa |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| DLX'ni `x-dead-letter-exchange` bilan kodda | Deploysiz o'zgartirib bo'lmaydi (RQ) | Policy |
| DLX'ga hech qaysi navbat bog'lanmagan | Dead letter xabar baribir yo'qoladi | O'lik xatlar navbati |
| `reject(…, true)` bilan dead letter kutish | Qayta navbatga qo'yiladi; quorum'da faqat limitdan keyin | `requeue=false` |
| Butun navbat muddati tugasa xabarlar DLX'ga ketadi deb o'ylash | Ketmaydi (RQ) | Xabar TTL'i |
| Standart exchange'ga kalitsiz dead letter | Tsikl, xabar tashlanishi mumkin (RQ) | Alohida DLX |
| Klasterda muhim dead letter'ni at-most-once bilan | Yo'lda yo'qolishi mumkin (RQ) | Quorum `at-least-once` |

## Amaliyot

1. Xabar qaysi to'rt holatda dead letter qilinadi?
2. Butun navbat muddati tugasa xabarlar dead letter qilinadimi?
3. `dead-letter-routing-key` berilmasa qaysi kalit ishlatiladi?
4. `x-death` header'ida nimalar bor?
5. Sinovda `m4-zaharli` nega dead letter bo'ldi?
6. Quorum navbatda at-least-once dead lettering uchun nima kerak?

<details>
<summary>Javoblar</summary>

1. `requeue=false` bilan rad, TTL tugashi, uzunlik chegarasi, quorum `delivery-limit`.
2. Yo'q.
3. Xabarning asl routing key'lari.
4. `queue`, `reason`, `count`, `time`, `exchange`, `routing-keys` (va `original-expiration`).
5. `requeue=true` bilan qaytarildi va `delivery-limit: 1` dan oshdi.
6. `dead-letter-strategy: at-least-once`, `overflow: reject-publish`, DLX va `stream_queue` feature flag.

</details>

## Rasmiy hujjat

- [RQ: Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx)
- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) — Dead Lettering, Poison Message Handling
