# 15 — ⚑ Bitta vazifa uch tizimda

[Mundarija](README.md)

## Tushuncha

Kitobdagi barcha tushunchalarni bitta vazifada jamlaymiz. Do'kon buyurtma hodisalarini yuboradi, ombor xizmati ularni ishlaydi:

```text
B1 yaratildi, B2 yaratildi, B1 to'landi, B2 to'landi, B1 yuborildi, B2 yuborildi
```

Uchala tizimda bir xil ssenariy:

1. **Yuborish** — broker tasdig'i bilan (6-bob). Redis'da takrorga qarshi `IDMP` (7-bob).
2. **Ishlash** — ombor har hodisani ishlaydi va ishlagach tasdiqlaydi (5-bob).
3. **Nosozlik** — 3-hodisani ishlagach, tasdiqlashdan **oldin** jarayon o'ladi.
4. **Qayta ishga tushish** — nima qayta keladi va qaysi tartibda (4, 8-boblar)?

⚑ Ssenariy va taqqoslash bizniki. Har bir xatti-harakat oldingi boblardagi rasmiy manbalarga tayanadi va quyida haqiqiy natija bilan ko'rsatilgan.

| | Redis stream | RabbitMQ (quorum navbat) | Kafka (3 partition) |
| --- | --- | --- | --- |
| Yuborish kafolati | `XADD` javobi; `IDMP` takrorni tashlaydi | Publisher confirms, persistent | `acks=all`, idempotent producer |
| Tasdiq | `XACK` | `basic.ack` | Offset commit |
| Tasdiqlanmagan xabar qayerda | Consumer'ning PEL'ida | Navbatda (unacked) | Topic'da; pozitsiya commit'dan |
| Bo'lish | Consumer group | Navbat + prefetch | Partition (kalit — buyurtma) |
| Tartib | Stream ID'lari | Navbat tartibi | Faqat partition (kalit) ichida |

## Uch tizimda

### Redis stream

```js
// Redis stream: "buyurtma" hodisalari. yubor — IDMP bilan; ishla [ol] — consumer group, 3-hodisada XACK'dan oldin o'ladi
import { createClient } from 'redis';
const HODISALAR = ['B1 yaratildi', 'B2 yaratildi', 'B1 to\'landi', 'B2 to\'landi', 'B1 yuborildi', 'B2 yuborildi'];
{
  const r = createClient(); await r.connect();
  const [rejim, ol] = process.argv.slice(2);
  if (rejim === 'yubor') {
    for (const [i, h] of HODISALAR.entries())       // IDMP: qayta yuborilsa takror qo'shilmaydi (7-bob)
      await r.sendCommand(['XADD', 'buyurtmalar', 'IDMP', 'dokon', `h${i}`, '*', 'hodisa', h]);
    await r.sendCommand(['XADD', 'buyurtmalar', 'IDMP', 'dokon', 'h0', '*', 'hodisa', HODISALAR[0]]);   // tarmoq xatosidan keyin qayta yuborish
    console.log('yuborildi, XLEN =', await r.xLen('buyurtmalar'));
    await r.quit();
  } else {
    try { await r.xGroupCreate('buyurtmalar', 'ombor', '0'); } catch {}
    let n = 0;
    for (const id of ['0', '>']) {                   // avval o'zimning tasdiqlanmaganlarim (PEL), keyin yangilari
      const javob = await r.xReadGroup('ombor', 'ishchi-1', { key: 'buyurtmalar', id }, { COUNT: 10 });
      for (const { id: mid, message } of javob?.[0]?.messages ?? []) {
        console.log(`  ishlandi: ${message.hodisa}${id === '0' ? '  (PEL\'dan qayta)' : ''}`);
        if (ol && ++n === 3) { console.log('  o\'ldi — XACK qilinmadi'); process.exit(1); }
        await r.xAck('buyurtmalar', 'ombor', mid);
      }
    }
    await r.quit();
  }
}
```

```text vps
$ cd /root/redis-ilova && node redis-buyurtma.js yubor && node redis-buyurtma.js ishla ol; node redis-buyurtma.js ishla
yuborildi, XLEN = 6
  ishlandi: B1 yaratildi
  ishlandi: B2 yaratildi
  ishlandi: B1 to'landi
  o'ldi — XACK qilinmadi
  ishlandi: B1 to'landi  (PEL'dan qayta)
  ishlandi: B2 to'landi  (PEL'dan qayta)
  ishlandi: B1 yuborildi  (PEL'dan qayta)
  ishlandi: B2 yuborildi  (PEL'dan qayta)
$ redis-cli DEL buyurtmalar >/dev/null; rm /root/redis-ilova/redis-buyurtma.js
```

- Hodisalar 7 marta yuborildi, oxirgisi — tarmoq xatosidan keyingi qayta yuborish (`h0`). `IDMP` uni tanidi: `XLEN = 6`.
- Ishchi `COUNT 10` bilan **barcha 6 hodisani** bir yo'la oldi. Ikkitasini tasdiqladi, uchinchisida o'ldi. Shu sababli qolgan 4 hodisa ham uning PEL'ida "yetkazilgan, tasdiqlanmagan" bo'lib qoldi.
- Qayta ishga tushgan ishchi avval o'z PEL'ini (`id 0`) o'qidi — 4 ta hodisa qayta keldi. Shulardan faqat `B1 to'landi` haqiqatan ishlangan edi, ya'ni u takror (7-bob).
- Boshqa ishchi bo'lganda, u bu hodisalarni `XAUTOCLAIM` bilan olishi kerak edi (5-bob).

### RabbitMQ

```js
// RabbitMQ: quorum navbat. yubor — confirm kanali, persistent; ishla [ol] — qo'lda ack, 3-hodisada ack'dan oldin o'ladi
const amqp = require('amqplib');
const HODISALAR = ['B1 yaratildi', 'B2 yaratildi', 'B1 to\'landi', 'B2 to\'landi', 'B1 yuborildi', 'B2 yuborildi'];
(async () => {
  const c = await amqp.connect('amqp://localhost');
  const [rejim, ol] = process.argv.slice(2);
  if (rejim === 'yubor') {
    const ch = await c.createConfirmChannel();
    await ch.assertQueue('buyurtmalar', { durable: true, arguments: { 'x-queue-type': 'quorum' } });
    for (const [i, h] of HODISALAR.entries())
      ch.sendToQueue('buyurtmalar', Buffer.from(h), { persistent: true, messageId: `h${i}` });
    await ch.waitForConfirms(); console.log('yuborildi, broker barchasini tasdiqladi');
    await c.close();
  } else {
    const ch = await c.createChannel(); await ch.prefetch(1); let n = 0;
    await ch.consume('buyurtmalar', m => {
      if (!m) return;
      console.log(`  ishlandi: ${m.content}${m.fields.redelivered ? '  (redelivered)' : ''}`);
      if (ol && ++n === 3) { console.log('  o\'ldi — ack qilinmadi'); process.exit(1); }
      ch.ack(m);
    });
    setTimeout(() => c.close(), 1500);
  }
})();
```

```text vps
$ cd /root/rabbit-ilova && node rabbit-buyurtma.js yubor && node rabbit-buyurtma.js ishla ol; node rabbit-buyurtma.js ishla
yuborildi, broker barchasini tasdiqladi
  ishlandi: B1 yaratildi
  ishlandi: B2 yaratildi
  ishlandi: B1 to'landi
  o'ldi — ack qilinmadi
  ishlandi: B1 to'landi  (redelivered)
  ishlandi: B2 to'landi
  ishlandi: B1 yuborildi
  ishlandi: B2 yuborildi
$ rabbitmqadmin queues delete --name buyurtmalar; rm /root/rabbit-ilova/rabbit-buyurtma.js
```

- Quorum navbat va confirm: `waitForConfirms` — barcha hodisa replikalarning ko'pchiligida (13-bob).
- `prefetch(1)` — ishchida bir vaqtda bitta tasdiqlanmagan xabar. Ishchi o'lganda faqat **bitta** xabar qaytdi: `B1 to'landi (redelivered)`.
- Tartib saqlandi: qaytgan xabar navbatdagi o'z joyida (8-bob).

### Kafka

```java
// Kafka: kalit — buyurtma raqami. yubor — idempotent, acks=all; ishla [ol] — har hodisadan keyin commit, 3-hodisada commit'dan oldin o'ladi
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.*;
import java.time.Duration;
import java.util.*;

public class Buyurtma15 {
    static final String[] HODISALAR = {"B1 yaratildi", "B2 yaratildi", "B1 to'landi", "B2 to'landi", "B1 yuborildi", "B2 yuborildi"};
    public static void main(String[] a) throws Exception {
        Properties p = new Properties(); p.put("bootstrap.servers", "localhost:9092");
        if (a[0].equals("yubor")) {
            p.put("acks", "all"); p.put("enable.idempotence", "true");
            p.put("key.serializer", StringSerializer.class.getName()); p.put("value.serializer", StringSerializer.class.getName());
            try (Producer<String, String> pr = new KafkaProducer<>(p)) {
                for (String h : HODISALAR) pr.send(new ProducerRecord<>("buyurtmalar", h.substring(0, 2), h)).get();   // kalit: B1 yoki B2
            }
            System.out.println("yuborildi");
            return;
        }
        boolean ol = a.length > 1;
        p.put("group.id", "ombor"); p.put("enable.auto.commit", "false"); p.put("auto.offset.reset", "earliest");
        p.put("key.deserializer", StringDeserializer.class.getName()); p.put("value.deserializer", StringDeserializer.class.getName());
        try (KafkaConsumer<String, String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("buyurtmalar")); int n = 0; boolean oqildi = false;
            while (true) {
                ConsumerRecords<String, String> rs = c.poll(Duration.ofSeconds(3));
                if (rs.isEmpty() && oqildi) break;
                for (ConsumerRecord<String, String> r : rs) {
                    oqildi = true;
                    System.out.printf("  ishlandi: %s  (partition %d, offset %d)%n", r.value(), r.partition(), r.offset());
                    if (ol && ++n == 3) { System.out.println("  o'ldi — commit qilinmadi"); Runtime.getRuntime().halt(1); }
                    c.commitSync(Map.of(new TopicPartition(r.topic(), r.partition()), new OffsetAndMetadata(r.offset() + 1)));
                }
            }
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic buyurtmalar --partitions 3 >/dev/null; cd /root/kafka-java && j(){ java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Buyurtma15.java "$@" 2>/dev/null; }; j yubor && j ishla ol; j ishla
yuborildi
  ishlandi: B2 yaratildi  (partition 0, offset 0)
  ishlandi: B2 to'landi  (partition 0, offset 1)
  ishlandi: B2 yuborildi  (partition 0, offset 2)
  o'ldi — commit qilinmadi
  ishlandi: B2 yuborildi  (partition 0, offset 2)
  ishlandi: B1 yaratildi  (partition 1, offset 0)
  ishlandi: B1 to'landi  (partition 1, offset 1)
  ishlandi: B1 yuborildi  (partition 1, offset 2)
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic buyurtmalar; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group ombor >/dev/null 2>&1; rm /root/kafka-java/Buyurtma15.java
```

- Kalit — buyurtma raqami: `B2` hodisalari 0-partition'ga, `B1` hodisalari 1-partition'ga tushdi.
- Consumer avval 0-partition'ni ishladi. 3-hodisada (`B2 yuborildi`, offset 2) commit'dan oldin o'ldi.
- Qayta ishga tushganda 0-partition commit qilingan offset **2** dan davom etdi: `B2 yuborildi` ikkinchi marta ishlandi. Keyin 1-partition.
- Har buyurtma ichida tartib to'g'ri (yaratildi → to'landi → yuborildi). **Umumiy** tartib boshqacha: hamma `B2` hodisalari `B1` dan oldin (8-bob).

### Natijalar yonma-yon

| | Redis | RabbitMQ | Kafka |
| --- | --- | --- | --- |
| O'lishdan keyin qayta kelgan | 4 ta (biri haqiqiy takror) | 1 ta | 1 ta |
| Nega | Partiya bilan o'qildi — hammasi PEL'da | `prefetch(1)` | Offset — partition'dagi pozitsiya |
| Tartib | Stream tartibi | Navbat tartibi | Faqat buyurtma ichida |
| Producer takrori | `IDMP` tashladi | Tekshirilmadi (message_id ilova uchun) | Idempotent producer |

Uchalasida ham natija **at-least-once**: hech bir hodisa yo'qolmadi, kamida bittasi qayta keldi. Shuning uchun ombor ishlovi idempotent bo'lishi shart (7-bob).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Redis'da katta partiya o'qib, o'lganda faqat bitta xabar qaytadi deb kutish | Barcha o'qilganlar PEL'da qoladi (sinovda 4 ta) | Kichik `COUNT` yoki idempotent ishlov |
| Qayta kelgan xabarni ishlov holatini tekshirmasdan ishlash | Takror natijani buzadi | Idempotentlik (7-bob) |
| Kafka'da buyurtmalararo umumiy tartib kutish | Tartib faqat partition ichida (sinovda) | Kerakli tartib uchun kalit |
| Uch tizimni "bir xil navbat" deb almashtirish | Tasdiq, saqlash, tartib va qayta yetkazish modeli turlicha | Talabga qarab tanlash (14-bob) |

## Amaliyot

1. Uchala tizimda tasdiq mexanizmi nima?
2. Sinovda Redis'da nega 4 ta hodisa qayta keldi, RabbitMQ'da esa 1 ta?
3. Kafka'da qayta ishga tushgan consumer qayerdan davom etdi?
4. Kafka sinovida qaysi tartib saqlandi, qaysi biri yo'q?
5. Nega uchala holatda ham ombor ishlovi idempotent bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. Redis — `XACK`, RabbitMQ — `basic.ack`, Kafka — offset commit.
2. Redis ishchisi hamma hodisani bir yo'la olgan — ular PEL'da edi; RabbitMQ'da `prefetch(1)` — faqat bitta tasdiqlanmagan xabar.
3. 0-partition'ning commit qilingan offset'i 2 dan.
4. Har buyurtma ichidagi tartib saqlandi; buyurtmalararo umumiy tartib yo'q.
5. Hammasi at-least-once — kamida bitta hodisa qayta keldi.

</details>

## Rasmiy hujjat

Oldingi boblardagi manbalar, xususan:

- [RD: XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/) · [RD: Idempotent message processing](https://redis.io/docs/latest/develop/data-types/streams/idempotency/)
- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) · [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) · [RQ: Broker Semantics](https://www.rabbitmq.com/docs/semantics)
- [KD: Design](https://kafka.apache.org/44/design/design/) · [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/)
