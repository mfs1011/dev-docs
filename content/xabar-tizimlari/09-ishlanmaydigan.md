# 09 — Ishlab bo'lmaydigan xabarlar

[Mundarija](README.md)

## Tushuncha

Ba'zi xabarni hech qachon ishlab bo'lmaydi: formati buzuq, mavjud bo'lmagan obyektga ishora qiladi yoki consumer'ni har safar yiqitadi. At-least-once tizimda bunday xabar qaytadi, yana yiqitadi, yana qaytadi — **cheksiz aylanish**. RQ bunday xabarni **zaharli** (poison message) deydi: u consumer'ni qayta-qayta navbatga qaytarishga majbur qiladi, hech qachon oxirigacha ishlanmaydi va tasdiqlanmaydi.

Yechim uch qismdan iborat:

1. **Vaqtinchalik xato** (tarmoq, band baza) — qayta urinish.
2. **Chegara** — urinishlar sonini sanash va cheklash.
3. **Chegaradan keyin** — xabarni o'chirmasdan, alohida **dead letter** joyiga (DLQ — "o'lik xatlar" navbati) ko'chirish. U yerda xabarni ko'rib, tuzatib, qayta yuborish mumkin.

| Tizim | Sanagich | Chegara | O'lik xatlar joyi |
| --- | --- | --- | --- |
| **RabbitMQ** | Quorum navbat: `x-delivery-count` header'i | `delivery-limit` (4.0'dan standart **20**) | **Dead letter exchange** (DLX) |
| **Kafka** (share group) | Yetkazishlar soni (delivery count) | `share.delivery.count.limit` (guruh sozlamasi) | Share group'ning DLQ topic'i (4.4'dan) |
| **Kafka** (consumer group) | — (offset bitta son) | — | O'rnatilgan mexanizm yo'q — ilova o'zi |
| **Redis** stream | `XPENDING` dagi yetkazishlar soni | — | O'rnatilgan mexanizm yo'q — ilova o'zi |

### RabbitMQ (RQ Dead Letter Exchanges, Quorum Queues)

Xabar quyidagi to'rt hodisada DLX'ga qayta yuboriladi:

- `basic.reject` / `basic.nack` bilan `requeue=false` — sabab `rejected`;
- xabar TTL'i tugadi — `expired`;
- navbat uzunligi chegarasidan oshdi — `maxlen`;
- quorum navbatga `delivery-limit` dan ko'p qaytarildi — `delivery_limit`.

Navbatning o'zi muddati tugab o'chsa, xabarlar DLX'ga o'tmaydi. Xabarga `x-death` header'i qo'shiladi: qaysi navbatdan, qanday sabab bilan.

Quorum navbatda **4.3'dan beri** chegara faqat haqiqiy muvaffaqiyatsizliklarni sanaydi: kanal yoki ulanish uzilishi, AMQP 0-9-1 `basic.reject`. `basic.nack` bilan qaytarish chegaraga sanalmaydi. Chegaradan oshgan xabar tashlanadi, DLX sozlangan bo'lsa — unga o'tadi. RQ: har quorum navbatda qandaydir dead letter sozlamasi bo'lsin, aks holda xabarlar bilmasdan yo'qoladi.

### Kafka share group DLQ (KD 4.4 Notable changes, Group Configs)

- Share consumer **rad etgan** (reject) yoki yetkazish chegarasidan oshib **qo'yib yuborilgan** (release) yozuvlar DLQ'ga yuboriladi.
- Shart: `share.version` feature 2 (35-bob, Kafka kitobi), guruhda `errors.deadletterqueue.topic.name` sozlamasi.
- DLQ topic nomi `dlq.` prefiksi bilan boshlanadi. Avtomatik yaratish o'chiq bo'lsa, topic qo'lda yaratiladi va unga `errors.deadletterqueue.group.enable=true` qo'yiladi.
- Standartda DLQ yozuvida faqat manba metama'lumoti bor: guruh, topic, partition, offset, yetkazishlar soni. Asl yozuv ham kerak bo'lsa — `errors.deadletterqueue.copy.record.enable=true`.

### Redis (RD Job queue, XCLAIM)

- RD Job queue: ishonchli navbat at-least-once yetkazish, ishchiga atomik uzatish va yiqilgan ishchining ishini qaytarib olishni talab qiladi. Bundan tashqari har ishning holati, **urinishlar soni** va natijasini kuzatish kerak.
- RD XCLAIM: `XCLAIM` yetkazishlar sonini oshiradi. Shuning uchun ishlab bo'lmaydigan xabarlarning sanagichi o'sib boradi va ularni tizim ichida **aniqlash mumkin**.
- Chegara va "o'lik xatlar" stream'i — ilovaning ishi. Pastdagi misolda u qo'lda yozilgan.

## Uch tizimda

### RabbitMQ: delivery-limit va DLX

```js
// Quorum navbat + DLX: "zaharli" xabarni consumer qayta-qayta reject (requeue) qiladi; delivery-limit'dan keyin DLX'ga o'tadi
const amqp = require('amqplib');
(async () => {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel();
  await ch.assertExchange('xatolar.dlx', 'fanout'); await ch.assertQueue('xatolar'); await ch.bindQueue('xatolar', 'xatolar.dlx', '');
  await ch.assertQueue('buyurtmalar', { durable: true, arguments: {
    'x-queue-type': 'quorum', 'x-delivery-limit': 3, 'x-dead-letter-exchange': 'xatolar.dlx' } });
  ch.sendToQueue('buyurtmalar', Buffer.from('zaharli buyurtma'));
  ch.sendToQueue('buyurtmalar', Buffer.from('noto\'g\'ri format'));
  await ch.prefetch(1);
  await ch.consume('buyurtmalar', m => {
    if (!m) return;                                                 // navbat o'chirilganda consumer bekor qilinadi
    const h = m.properties.headers || {};
    if (m.content.toString() === 'noto\'g\'ri format') {          // tuzatib bo'lmaydi — darhol rad: requeue=false
      console.log(`"${m.content}": reject, requeue=false`); return ch.reject(m, false); }
    console.log(`"${m.content}": urinish, x-delivery-count=${h['x-delivery-count'] ?? 0} -> reject, requeue=true`);
    ch.reject(m, true);                                             // vaqtinchalik xato deb qaytaradi
  });
  await new Promise(r => setTimeout(r, 3000));
  await ch.consume('xatolar', m => {
    if (!m) return;
    const d = m.properties.headers['x-death'][0];
    console.log(`DLX: "${m.content}" — reason=${d.reason}, queue=${d.queue}`); ch.ack(m); });
  await new Promise(r => setTimeout(r, 1000));
  await ch.deleteQueue('buyurtmalar'); await ch.deleteQueue('xatolar'); await ch.deleteExchange('xatolar.dlx'); await c.close();
})();
```

```text vps
$ cd /root/rabbit-ilova && node zahar.js; rm zahar.js
"zaharli buyurtma": urinish, x-delivery-count=0 -> reject, requeue=true
"zaharli buyurtma": urinish, x-delivery-count=1 -> reject, requeue=true
"zaharli buyurtma": urinish, x-delivery-count=2 -> reject, requeue=true
"zaharli buyurtma": urinish, x-delivery-count=3 -> reject, requeue=true
"noto'g'ri format": reject, requeue=false
DLX: "zaharli buyurtma" — reason=delivery_limit, queue=buyurtmalar
DLX: "noto'g'ri format" — reason=rejected, queue=buyurtmalar
```

- `zaharli buyurtma` — consumer uni vaqtinchalik xato deb `reject(requeue=true)` qildi. Har qaytishda `x-delivery-count` oshdi: 0, 1, 2, 3. Chegara 3 dan oshgach xabar DLX'ga o'tdi, sabab `delivery_limit`.
- `noto'g'ri format` — tuzatib bo'lmaydi, darhol `requeue=false`. Sabab `rejected`.
- `x-death` header'idan sabab va manba navbat ko'rinadi.

### Redis: sanagich va ilova darajasidagi DLQ

```text vps
$ redis-cli XADD buyurtmalar '*' buyurtma zaharli >/dev/null; redis-cli XGROUP CREATE buyurtmalar ishchilar 0 >/dev/null; redis-cli XREADGROUP GROUP ishchilar ishchi-1 COUNT 1 STREAMS buyurtmalar '>' >/dev/null; for i in 1 2 3; do sleep 1; redis-cli XAUTOCLAIM buyurtmalar ishchilar ishchi-$((i+1)) 500 0 COUNT 1 >/dev/null; echo "ishchi-$((i+1)) qayta oldi va yiqildi, yetkazilgan: $(redis-cli XPENDING buyurtmalar ishchilar - + 1 | sed -n 4p) marta"; done
ishchi-2 qayta oldi va yiqildi, yetkazilgan: 2 marta
ishchi-3 qayta oldi va yiqildi, yetkazilgan: 3 marta
ishchi-4 qayta oldi va yiqildi, yetkazilgan: 4 marta
$ ID=$(redis-cli XPENDING buyurtmalar ishchilar - + 1 | sed -n 1p); N=$(redis-cli XPENDING buyurtmalar ishchilar - + 1 | sed -n 4p); if [ "$N" -ge 3 ]; then redis-cli XADD buyurtmalar:xato '*' asl_id "$ID" yetkazilgan "$N" >/dev/null; redis-cli XACK buyurtmalar ishchilar "$ID" >/dev/null; echo "chegaradan oshdi: buyurtmalar:xato ga ko'chirildi"; fi; echo "kutilayotgan: $(redis-cli XPENDING buyurtmalar ishchilar | head -1), xato stream'ida: $(redis-cli XLEN buyurtmalar:xato)"; redis-cli DEL buyurtmalar buyurtmalar:xato >/dev/null
chegaradan oshdi: buyurtmalar:xato ga ko'chirildi
kutilayotgan: 0, xato stream'ida: 1
```

- Har `XAUTOCLAIM` yetkazishlar sonini oshirdi: 2, 3, 4.
- Chegaradan oshgach, ilova xabarni `buyurtmalar:xato` stream'iga yozdi va asl stream'da `XACK` qildi — aylanish to'xtadi.

### Kafka: share group DLQ

```text vps
$ K=/opt/kafka/bin; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic buyurtmalar >/dev/null; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic dlq.buyurtmalar --config errors.deadletterqueue.group.enable=true >/dev/null; docker exec kafka $K/kafka-configs.sh --bootstrap-server localhost:9092 --alter --entity-type groups --entity-name ombor --add-config errors.deadletterqueue.topic.name=dlq.buyurtmalar,share.auto.offset.reset=earliest
Completed updating config for group ombor.
$ echo "zaharli buyurtma" | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic buyurtmalar; docker exec kafka /opt/kafka/bin/kafka-console-share-consumer.sh --bootstrap-server localhost:9092 --topic buyurtmalar --group ombor --reject --max-messages 1 --timeout-ms 20000 2>/dev/null; sleep 3; docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic dlq.buyurtmalar --from-beginning --max-messages 1 --timeout-ms 15000 --formatter-property print.headers=true 2>/dev/null | tr ',' '\n' | sed 's/\t.*//' | head -12
zaharli buyurtma
__dlq.errors.topic:buyurtmalar
__dlq.errors.partition:0
__dlq.errors.offset:0
__dlq.errors.group:ombor
__dlq.errors.delivery.count:1
__dlq.errors.message:Offset rejected by client.
$ K=/opt/kafka/bin; for t in buyurtmalar dlq.buyurtmalar; do docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done; docker exec kafka $K/kafka-share-groups.sh --bootstrap-server localhost:9092 --delete --group ombor
Deletion of requested share groups ('ombor') was successful.
```

- `kafka-console-share-consumer.sh --reject` yozuvni rad etdi. Broker uni `dlq.buyurtmalar` ga yubordi.
- DLQ yozuvining header'larida — manba topic, partition, offset, guruh, yetkazishlar soni va sabab (`Offset rejected by client`). Asl mazmun yo'q, `copy.record` yoqilmagan.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har xatoda `requeue=true` | Zaharli xabar cheksiz aylanadi (RQ) | Vaqtinchalik xato — qayta urinish, doimiy — rad |
| Quorum navbatni DLX'siz qoldirish | Chegaradan oshgan xabar **tashlanadi** (RQ) | Har quorum navbatga DLX |
| RabbitMQ 4.3+ da `nack` chegaraga sanaladi deb o'ylash | Faqat `reject`, uzilish va shunga o'xshashlar sanaladi (RQ) | Xatoni to'g'ri usul bilan bildirish |
| Kafka DLQ yozuvida asl xabarni kutish | Standartda faqat metama'lumot (KD, sinovda) | `errors.deadletterqueue.copy.record.enable` |
| Redis'da PEL'dagi xabarlarni kuzatmaslik | Zaharli xabar abadiy qayta olinadi | Yetkazishlar sonini tekshirib, chegarada ko'chirish |
| DLQ'ni yig'ib, hech kim qaramasligi | Xabarlar jimgina to'planadi | DLQ'ni kuzatish va qayta ishlash jarayoni |

## Amaliyot

1. Zaharli xabar nima va u nega xavfli?
2. RabbitMQ'da xabar qaysi to'rt holatda DLX'ga o'tadi?
3. Sinovda `zaharli buyurtma` necha marta yetkazildi va qaysi sabab bilan DLX'ga tushdi?
4. Kafka share group DLQ yozuvida standartda nima bor?
5. Redis'da ishlab bo'lmaydigan xabarni qanday aniqlash mumkin?

<details>
<summary>Javoblar</summary>

1. Consumer'ni qayta-qayta yiqitadigan, hech qachon tasdiqlanmaydigan xabar; cheksiz aylanadi va resurs yeydi.
2. `requeue=false` bilan rad etilganda, TTL tugaganda, navbat uzunligidan oshganda, quorum navbatda `delivery-limit` dan oshganda.
3. To'rt marta (`x-delivery-count` 0–3); sabab `delivery_limit`.
4. Manba metama'lumoti: topic, partition, offset, guruh, yetkazishlar soni, sabab.
5. `XPENDING` dagi yetkazishlar soni bo'yicha — `XCLAIM` uni har safar oshiradi.

</details>

## Rasmiy hujjat

- [RQ: Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx)
- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) — Poison Message Handling
- [RQ: Reliability Guide](https://www.rabbitmq.com/docs/reliability) — Unprocessable Deliveries
- [KD: Upgrading → Notable changes in 4.4.0](https://kafka.apache.org/44/getting-started/upgrade/) · [KD: Group Configs](https://kafka.apache.org/44/configuration/group-configs/)
- [RD: Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/) · [RD: XCLAIM](https://redis.io/docs/latest/commands/xclaim/)
