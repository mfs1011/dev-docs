# 22 — Ulanish va kanallar

[Mundarija](README.md)

## Tushuncha

### Ulanish (RQ: Connections)

RabbitMQ qo'llaydigan barcha protokollar TCP ustida ishlaydi va **uzoq yashaydigan** ulanishlarni nazarda tutadi: har amal uchun yangi ulanish ochilmaydi. Bitta klient ulanishi — bitta TCP ulanish. Shuning uchun xabarlar odatda **obuna** bilan olinadi (server o'zi uzatadi), so'rab turish (polling) bilan emas. Keraksiz ulanish **yopilishi** kerak, aks holda tugun resurslari tugashi mumkin.

**Ulanishlar aylanishi** (connection churn) — yangi ulanishlar ochilishi va yopilishi doim yuqori. RQ: sekundiga 100 dan ko'p ochilish yoki yopilish — ulanishlarni boshqarishda muammo belgisi. Qisqa ulanishdan qochib bo'lmasa — maxsus proksi (masalan, AMQProxy).

### Kanal (RQ: Channels)

Bir nechta TCP ulanish tizim resursini sarflaydi va firewall'ni sozlashni qiyinlashtiradi. AMQP 0-9-1 da bitta ulanish ichida **kanallar** — "bitta TCP ulanishni baham ko'radigan yengil ulanishlar":

- har protokol amali kanalda bajariladi; kanallar bir-biridan to'liq ajratilgan (har amalda kanal raqami);
- kanal faqat ulanish ichida mavjud — ulanish yopilsa, barcha kanallari yopiladi;
- ko'p oqimli yoki ko'p jarayonli ilovada — har oqim yoki jarayonga **o'z kanali**, kanallar baham ko'rilmaydi.

### Kanal xatolari (RQ)

"Yumshoq" xatolar faqat **kanalni** yopadi, ulanishni emas: `406 PRECONDITION_FAILED` (parametrlari boshqa qayta e'lon), `403 ACCESS_REFUSED`, `404 NOT_FOUND` (yo'q navbat yoki exchange), `405 RESOURCE_LOCKED` (exclusive navbat). Ilova yangi kanal ochib davom eta oladi. Ba'zi xatolar esa **ulanish**ni yopadi — masalan, 11-bobdagi `541`.

### Kanallar chegarasi (RQ)

Bir ulanishdagi eng ko'p kanal soni ulanishda **kelishiladi**. Server tomonida — `max_channels_per_connection` (eski nomi `channel_max`). Chegaradan oshilsa — ulanish **xato bilan yopiladi**.

### Oqimni boshqarish va bloklash (RQ)

- **Flow control** — navbatlar ulgurmaydigan darajada tez yuborayotgan ulanishlarni RabbitMQ **sekinlashtiradi**; sozlash shart emas. Bunday ulanish holati — `flow`.
- **Resurs alarmi** (xotira yoki disk kam, 30-bob) — RabbitMQ yuboruvchi ulanishlarni **bloklaydi**. AMQP 0-9-1 kengaytmasi bilan klientga `connection.blocked` (sabab bilan) va barcha alarmlar tugaganda `connection.unblocked` yuboriladi. Klient buni `client-properties` dagi `capabilities` da `connection.blocked: true` bilan bildiradi — qo'llaydigan klientlar standartda shunday qiladi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Kanallar va xato izolyatsiyasi

```js
// Ulanish va kanallar: channel_max, kanal xatosi izolyatsiyasi
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
const vaqt = t0 => ((Date.now() - t0) / 1000).toFixed(1).padStart(4);
async function main() {
  const c = await amqp.connect('amqp://localhost', { clientProperties: { connection_name: 'node-kanal' } });
  console.log('kelishilgan channel_max:', c.connection.channelMax);

  // 1) uch kanal; birida protokol xatosi — boshqalari ishlayveradi
  const [a, b, d] = await Promise.all([c.createChannel(), c.createChannel(), c.createChannel()]);
  a.on('error', () => {});
  await a.checkQueue('yoq-navbat').catch(e => console.log('a kanal:', e.message.split(';')[1].trim().slice(0, 40)));
  await b.assertQueue('kanal.q', { durable: true, arguments: { 'x-queue-type': 'quorum' } });
  console.log('b kanal ishlayapti:', (await b.checkQueue('kanal.q')).queue, '| d kanal ishlayapti:', !!(await d.checkQueue('kanal.q')));

  await b.deleteQueue('kanal.q'); await c.close();
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node kanal.js
kelishilgan channel_max: 2047
a kanal: 404 (NOT-FOUND) with message "NOT_FOUND 
b kanal ishlayapti: kanal.q | d kanal ishlayapti: true
```

- Kelishilgan `channel_max` — 2047 (server sozlamasi).
- `a` kanalda yo'q navbat — `404 NOT_FOUND`, `a` kanal yopildi. `b` va `d` — o'sha ulanishning boshqa kanallari — ishlashda davom etdi.

### Bloklash xabarnomasi

Xotira alarmini sun'iy chaqiramiz: chegara vaqtincha juda past qo'yiladi (`set_vm_memory_high_watermark 0.00001`), keyin 0.6 ga qaytariladi. Orkestr skripti:

```bash
#!/bin/bash
# alarm.sh KLIENT_BUYRUG'I — klientni ishga tushiradi, 3-soniyada xotira alarmini yoqadi, 9-soniyada o'chiradi
"$@" > /tmp/klient.log 2>&1 & pid=$!
sleep 3; rabbitmqctl set_vm_memory_high_watermark 0.00001 >/dev/null; echo "[orkestr] ${SECONDS} s: xotira chegarasi pasaytirildi"
sleep 6; rabbitmqctl set_vm_memory_high_watermark 0.6 >/dev/null; echo "[orkestr] ${SECONDS} s: chegara 0.6 ga qaytarildi"
wait $pid; cat /tmp/klient.log; rm -f /tmp/klient.log
```

Node.js — har soniyada bitta xabar, tasdiqni kutib:

```js
// Bloklash xabarnomasi: har soniyada bitta xabar, har birining tasdiq vaqti
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const c = await amqp.connect('amqp://localhost');
  const t0 = Date.now(); const v = () => ((Date.now() - t0) / 1000).toFixed(1);
  c.on('blocked', s => console.log(`${v()} s: blocked — ${s}`));
  c.on('unblocked', () => console.log(`${v()} s: unblocked`));
  const p = await c.createConfirmChannel();
  for (let i = 1; i <= 20; i++) {
    const t = Date.now();
    await new Promise(r => p.publish('amq.direct', 'hech-kim', Buffer.from('x'), {}, r));
    const dt = Date.now() - t; if (dt > 300) console.log(`${v()} s: ${i}-xabar tasdig'i ${dt} ms kutdi`);
    await kut(1000);
  }
  console.log(`${v()} s: tugadi`); await c.close();
})();
```

PHP — handler'lar bilan:

```php
<?php
// php-amqplib: connection.blocked / connection.unblocked handler'lari
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
$c = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$t0 = microtime(true);
$c->set_connection_block_handler(fn($sabab) => printf("%4.1f s: PHP blocked — %s\n", microtime(true) - $t0, $sabab));
$c->set_connection_unblock_handler(fn() => printf("%4.1f s: PHP unblocked\n", microtime(true) - $t0));
$ch = $c->channel();
while (microtime(true) - $t0 < 20) {
    try { $ch->basic_publish(new PhpAmqpLib\Message\AMQPMessage('x'), 'amq.direct', 'hech-kim'); }
    catch (\PhpAmqpLib\Exception\AMQPConnectionBlockedException $e) { printf("%4.1f s: basic_publish — %s\n", microtime(true) - $t0, $e->getMessage()); }
    try { $ch->wait(null, false, 1.0); } catch (\PhpAmqpLib\Exception\AMQPTimeoutException $e) {}
}
printf("isBlocked() oxirida: %s\n", var_export($c->isBlocked(), true));
$ch->close(); $c->close();
```

```text vps
$ cd /root/rabbit-ilova && bash alarm.sh node blok.js
[orkestr] 8 s: xotira chegarasi pasaytirildi
[orkestr] 18 s: chegara 0.6 ga qaytarildi
8.0 s: blocked — low on memory
17.6 s: unblocked
17.6 s: 9-xabar tasdig'i 9526 ms kutdi
29.6 s: tugadi
$ cd /root/rabbit-ilova && bash alarm.sh php blok.php
[orkestr] 7 s: xotira chegarasi pasaytirildi
[orkestr] 18 s: chegara 0.6 ga qaytarildi
 8.0 s: PHP blocked — low on memory
 9.0 s: basic_publish — Connection is blocked due to low resources
10.0 s: basic_publish — Connection is blocked due to low resources
11.0 s: basic_publish — Connection is blocked due to low resources
12.0 s: basic_publish — Connection is blocked due to low resources
13.0 s: basic_publish — Connection is blocked due to low resources
14.0 s: basic_publish — Connection is blocked due to low resources
15.0 s: basic_publish — Connection is blocked due to low resources
16.0 s: basic_publish — Connection is blocked due to low resources
17.0 s: basic_publish — Connection is blocked due to low resources
18.0 s: basic_publish — Connection is blocked due to low resources
18.1 s: PHP unblocked
isBlocked() oxirida: false
$ rabbitmq-diagnostics -q alarms; rabbitmqctl environment | grep -o '{vm_memory_high_watermark,[0-9.]*}'
Node rabbit@lab reported no alarms, local or clusterwide
{vm_memory_high_watermark,0.6}
```

- Ikkala klient ham `blocked — low on memory` sababi bilan xabarnoma oldi va alarm tugagach `unblocked` oldi. Klient vaqti va orkestr vaqti alohida o'lchanadi — `rabbitmqctl` ning har chaqiruvi taxminan 1–2 soniya oladi.
- **Node.js**: bloklangan paytda yuborilgan xabar yo'qolmadi — tasdig'i **9.5 soniya** kutdi va blok ochilgach keldi.
- **PHP**: kuzatildi — `php-amqplib` bloklangan ulanishda `basic_publish` ni **o'zi rad etadi** (`AMQPConnectionBlockedException: Connection is blocked due to low resources`). Xabar yuborilmaydi — ilova uni ushlab, keyinroq qayta yuborishi kerak.
- Oxirida alarm yo'q, chegara yana 0.6.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Ko'p oqim yoki jarayon | Bitta ulanish, har biriga o'z kanali |
| Qisqa umrli skriptlar (PHP-FPM) | Ulanishlar aylanishini kuzatish; kerak bo'lsa proksi (RQ) |
| Bloklashga javob | `blocked` / `unblocked` handler'lari; PHP'da istisnoni ushlash |
| Kanal xatosi | Yangi kanal, ulanish emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har xabarga yangi ulanish | Ulanishlar aylanishi, resurs sarfi (RQ) | Uzoq yashaydigan ulanish |
| Bitta kanalni oqimlar orasida baham ko'rish | RQ: har oqimga o'z kanali | Kanal har oqimga |
| Kanal xatosida butun ulanishni qayta ochish | Faqat kanal yopilgan | Yangi kanal |
| Kanallarni yopmaslik (leak) | `channel_max` ga yetadi — ulanish yopiladi (RQ) | Ishlatilgach yopish |
| Bloklashni e'tiborsiz qoldirish | Node.js'da tasdiqlar osilib qoladi, PHP'da istisno (sinovda) | Handler, timeout, qayta yuborish |

## Amaliyot

1. Nega RabbitMQ ulanishlari uzoq yashashi kerak?
2. Kanal nima va ulanish yopilsa kanallar bilan nima bo'ladi?
3. Sinovda bitta kanaldagi `404` xatosi boshqa kanallarga ta'sir qildimi?
4. `connection.blocked` qachon yuboriladi?
5. Bloklangan ulanishda Node.js va PHP klientlari qanday farq qildi?

<details>
<summary>Javoblar</summary>

1. Har amalga yangi TCP ulanish qimmat; ulanishlar aylanishi tugun resurslarini sarflaydi.
2. Bitta TCP ulanish ichidagi yengil ulanish; ulanish yopilsa hammasi yopiladi.
3. Yo'q — faqat o'sha kanal yopildi.
4. Resurs alarmi (xotira yoki disk kam) bo'lganda, yuboruvchi ulanishlarga.
5. Node.js'da xabar kutdi va tasdiq kechikdi; PHP'da `basic_publish` istisno tashladi.

</details>

## Rasmiy hujjat

- [RQ: Connections](https://www.rabbitmq.com/docs/connections)
- [RQ: Channels](https://www.rabbitmq.com/docs/channels)
- [RQ: Blocked Connection Notifications](https://www.rabbitmq.com/docs/connection-blocked)
- [RQ: Flow Control](https://www.rabbitmq.com/docs/flow-control)
