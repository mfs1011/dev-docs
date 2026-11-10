# 05 — Qabul qiluvchining tasdig'i

[Mundarija](README.md)

## Tushuncha

Broker xabarni consumer'ga berdi. Endi u xabarni o'chirsinmi yoki kutsinmi? Consumer o'chib qolishi mumkin: xabarni olgandan keyin, ishni tugatmasdan. Shuning uchun xabar qachon "ishlangan" hisoblanishini consumer o'zi bildiradi — **tasdiq** (acknowledgement) bilan.

RQ (Consumer Acknowledgements): tasdiq — xabarni **olish** va **egalikni o'tkazish** belgisi. Qabul qiluvchi endi xabar uchun to'liq javobgar. Shuning uchun ilova xabarni kerakli ishni bajarmaguncha (bazaga yozish, uzatish) tasdiqlamasligi kerak.

### Uch xil yondashuv

| Tizim | "Ishlandi" belgisi | Tasdiqlanmagan xabar qayerda | Consumer o'lsa |
| --- | --- | --- | --- |
| **RabbitMQ** | Har xabarga `basic.ack` (yoki `nack`/`reject`) | Navbatda, "unacked" holatda | Kanal yopilishi bilan xabar **avtomatik navbatga qaytadi** (RQ) |
| **Kafka** | Partition'dagi **pozitsiya** — offset commit | Topic'da (o'qish o'chirmaydi) | Guruh partition'ni boshqa a'zoga beradi, u oxirgi commit'dan davom etadi |
| **Redis stream** | Har yozuvga `XACK` | Guruhning **kutilayotganlar ro'yxati** (PEL) | Xabar egasi bilan PEL'da qoladi; boshqa consumer `XCLAIM`/`XAUTOCLAIM` bilan oladi (RD) |

**Kafka'ning farqi** (KD Design → Consumer Position). Ko'p xabar tizimlari har xabar uchun "berildi/tasdiqlandi" holatini broker'da saqlaydi. Kafka'da partition guruhdagi bitta consumer'ga beriladi. Shuning uchun consumer holati — har partition uchun **bitta son**, keyingi o'qiladigan offset. Bu tasdiqni juda arzon qiladi. Yana bir foydasi: offset'ni orqaga qaytarib, xabarlarni qayta o'qish mumkin. Masalan, consumer kodidagi xato tuzatilgach.

### RabbitMQ: tasdiq rejimlari (RQ)

| Rejim | Qachon "yetkazilgan" | Xavf |
| --- | --- | --- |
| **Avtomatik** ("fire-and-forget") | TCP soketga yozilishi bilan | Ulanish uzilsa xabar **yo'qoladi**; prefetch chegarasi yo'q — consumer to'lib ketishi mumkin. RQ: xavfli, hamma ish uchun mos emas |
| **Qo'lda** | `basic.ack` kelganda | Xabar qayta kelishi mumkin — consumer idempotent bo'lsin (7-bob) |

Salbiy tasdiq — `basic.nack` / `basic.reject`. `requeue=true` bo'lsa navbatga qaytadi. `false` bo'lsa dead letter exchange'ga (9-bob) yoki tashlab yuboriladi.

**`redelivered` belgisi** (RQ Reliability). Navbatga qaytgan xabar qayta yetkazilganda belgi `true` bo'ladi — bu consumer xabarni oldin ko'rgan bo'lishi mumkinligiga **ishora**. Lekin kafolat emas: avvalgi yetkazish hech bir consumer'ga yetmagan bo'lishi mumkin. Belgi `false` bo'lsa — xabar avval ko'rilmagani **kafolatlanadi**.

## Uch tizimda

VPS'da. RabbitMQ — Node.js (`amqplib`), Kafka — Java klienti, Redis — `redis-cli`.

### RabbitMQ: tasdiqsiz o'lgan consumer

```js
// Navbatdan bitta xabar olib, rejimga qarab: ack, nack yoki tasdiqlamay "o'ladi"
const amqp = require('amqplib');
const rejim = process.argv[2];   // ack | nack | olish (tasdiqsiz o'lish) | avto (avtomatik tasdiq, keyin o'lish)
(async () => {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel();
  await ch.prefetch(1);                                          // bir vaqtda bitta xabar
  await ch.consume('tasdiq', async m => {
    console.log(`${rejim}: oldi "${m.content}", redelivered=${m.fields.redelivered}`);
    if (rejim === 'olish' || rejim === 'avto') process.exit(1);   // ishlash paytida jarayon o'ldi
    if (rejim === 'ack') ch.ack(m);
    if (rejim === 'nack') ch.nack(m, false, false);               // requeue=false, DLX yo'q — tashlanadi
    await ch.close(); await c.close();
  }, { noAck: rejim === 'avto' });
})();
```

```text vps
$ rabbitmqadmin queues declare --name tasdiq --durable true >/dev/null; for i in 1 2 3; do rabbitmqadmin publish message --routing-key tasdiq --payload "buyurtma #$i" >/dev/null; done; cd /root/rabbit-ilova && node tasdiq.js olish; rabbitmqctl -q list_queues name messages | grep -E '^tasdiq'
olish: oldi "buyurtma #1", redelivered=false
tasdiq	3
```

`olish` rejimidagi consumer `buyurtma #1` ni oldi va tasdiqlamay o'ldi. Navbatda baribir **3 ta** xabar: tasdiqlanmagan xabar qaytdi.

```text vps
$ cd /root/rabbit-ilova && node tasdiq.js ack; node tasdiq.js nack; rabbitmqctl -q list_queues name messages | grep -E '^tasdiq'
ack: oldi "buyurtma #1", redelivered=true
nack: oldi "buyurtma #2", redelivered=true
tasdiq	1
$ cd /root/rabbit-ilova && node tasdiq.js avto; rabbitmqctl -q list_queues name messages | grep -E '^tasdiq'; rabbitmqadmin queues delete --name tasdiq; rm tasdiq.js
avto: oldi "buyurtma #3", redelivered=true
tasdiq	0
```

- `ack` — `buyurtma #1` qayta keldi (`redelivered=true`), tasdiqlandi va o'chdi.
- `nack` (`requeue=false`) — `buyurtma #2` tashlandi (dead letter exchange yo'q). Navbatda 1 ta qoldi.
- `avto` — avtomatik tasdiq: `buyurtma #3` yetkazilishi bilan navbatdan o'chdi. Consumer uni ishlamay o'ldi, navbatda 0 ta. Xabar **yo'qoldi**.
- Kuzatildi: `#2` va `#3` ham `redelivered=true` bilan keldi, ularni avval hech bir consumer ishlamagan bo'lsa ham. Bu RQ'dagi ogohlantirishga mos: `true` — faqat ishora.

### Kafka: offset — "shu joygacha ishlandi"

```java
// Har yozuvni "ishlab", keyin offset'ini commit qiladi. 3-yozuvda commit'dan oldin jarayon o'ladi.
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;

public class Commit {
    public static void main(String[] a) {
        boolean olsin = a.length > 0 && a[0].equals("olsin");
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092"); p.put("group.id", "hisob");
        p.put("enable.auto.commit", "false"); p.put("auto.offset.reset", "earliest");
        p.put("key.deserializer", StringDeserializer.class.getName()); p.put("value.deserializer", StringDeserializer.class.getName());
        try (KafkaConsumer<String, String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("tasdiq"));
            boolean oqildi = false;
            while (true) {
                ConsumerRecords<String, String> rs = c.poll(Duration.ofSeconds(2));
                if (rs.isEmpty() && oqildi) break;                  // yangi yozuv qolmadi
                for (ConsumerRecord<String, String> r : rs) {
                    oqildi = true;
                    System.out.println("ishladi: " + r.value() + " (offset " + r.offset() + ")");
                    if (olsin && r.offset() == 2) { System.out.println("o'ldi — commit qilinmadi"); Runtime.getRuntime().halt(1); }
                    c.commitSync(Map.of(new TopicPartition(r.topic(), r.partition()), new OffsetAndMetadata(r.offset() + 1)));
                }
            }
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tasdiq >/dev/null; printf 'buyurtma #1\nbuyurtma #2\nbuyurtma #3\nbuyurtma #4\nbuyurtma #5\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic tasdiq; cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Commit.java olsin 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisob 2>/dev/null | awk 'NF{print $2, $4, $5, $6}' | column -t
ishladi: buyurtma #1 (offset 0)
ishladi: buyurtma #2 (offset 1)
ishladi: buyurtma #3 (offset 2)
o'ldi — commit qilinmadi
TOPIC   CURRENT-OFFSET  LOG-END-OFFSET  LAG
tasdiq  2               5               3
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Commit.java 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic tasdiq; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group hisob >/dev/null 2>&1
ishladi: buyurtma #3 (offset 2)
ishladi: buyurtma #4 (offset 3)
ishladi: buyurtma #5 (offset 4)
```

- Consumer har yozuvni ishlagach offset'ni commit qildi. 3-yozuvni (offset 2) ishladi, lekin commit'dan oldin o'ldi.
- Guruhda commit qilingan pozitsiya — **2**: offset 0 va 1 ishlangan, LAG 3.
- Qayta ishga tushgan consumer **offset 2** dan boshladi. `buyurtma #3` ikkinchi marta ishlandi (at-least-once), oldingi ikkitasi takrorlanmadi.
- Kuzatildi: qayta ishga tushish bir necha o'n soniya kutdi. O'lgan a'zo guruhdan sessiya muddati tugagach chiqariladi, shundan keyin partition yangisiga beriladi.

### Redis stream: PEL va qayta olish

```text vps
$ redis-cli XADD tasdiq '*' buyurtma 1 >/dev/null; redis-cli XGROUP CREATE tasdiq ishchilar 0 >/dev/null; redis-cli XREADGROUP GROUP ishchilar ishchi-1 COUNT 1 STREAMS tasdiq '>' >/dev/null; sleep 2; redis-cli XPENDING tasdiq ishchilar - + 10 | paste - - - - | awk '{print "egasi: "$2", kutgan ms: "$3", yetkazilgan: "$4" marta"}'
egasi: ishchi-1, kutgan ms: 2019, yetkazilgan: 1 marta
$ echo "100 s dan ko'p kutganlar (min-idle 100000): $(redis-cli XCLAIM tasdiq ishchilar ishchi-2 100000 $(redis-cli XRANGE tasdiq - + | head -1) JUSTID | wc -w) ta"; redis-cli XCLAIM tasdiq ishchilar ishchi-2 1000 $(redis-cli XRANGE tasdiq - + | head -1) | tail -2 | tr '\n' ' '; echo; redis-cli XPENDING tasdiq ishchilar - + 10 | paste - - - - | awk '{print "egasi: "$2", yetkazilgan: "$4" marta"}'; redis-cli DEL tasdiq >/dev/null
100 s dan ko'p kutganlar (min-idle 100000): 0 ta
buyurtma 1 
egasi: ishchi-2, yetkazilgan: 2 marta
```

- `XPENDING`: xabar egasi `ishchi-1`, 2 soniya tasdiqsiz turibdi, 1 marta yetkazilgan.
- `XCLAIM` `min-idle-time` bilan: 100 soniyadan ko'p kutganlarini so'ragan — hech narsa (xabar endigina 2 soniya kutgan). 1000 ms bilan — `ishchi-2` xabarni oldi.
- Endi egasi `ishchi-2`, yetkazilganlar soni **2**. RD (XCLAIM): `XCLAIM` yetkazishlar sonini oshiradi. Shu son bilan hech ishlab bo'lmaydigan xabarlarni aniqlash mumkin (9-bob).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Xabarni olishi bilan tasdiqlash | Ish paytida o'chsa xabar yo'qoladi (RQ) | Ish tugagach ack/commit/XACK |
| RabbitMQ'da avtomatik tasdiq muhim ish uchun | Uzilishda xabar yo'qoladi (sinovda) | Qo'lda tasdiq + prefetch |
| `redelivered=true` xabarni albatta takror deb tashlash | `true` — faqat ishora (RQ, sinovda) | Idempotent ishlov (7-bob) |
| Redis'da PEL'ni kuzatmaslik | O'lgan consumer'ning xabarlari abadiy kutib qoladi | `XPENDING` + `XAUTOCLAIM` |
| Kafka'da offset'ni yozuvdan keyingi emas, yozuvning o'zi bilan commit qilish | Commit — **keyingi** o'qiladigan pozitsiya | `offset + 1` |

## Amaliyot

1. Tasdiq nimani bildiradi (RQ)?
2. Kafka'da tasdiq nega boshqa tizimlardagidan arzon?
3. Sinovda RabbitMQ'da `avto` rejimidagi xabar bilan nima bo'ldi?
4. Kafka consumer'i qayta ishga tushganda qaysi offset'dan boshladi va nega?
5. Redis'da o'lgan consumer'ning xabari qanday boshqasiga o'tadi?

<details>
<summary>Javoblar</summary>

1. Xabar olingani va egalik qabul qiluvchiga o'tgani.
2. Partition guruhda bitta consumer'ga beriladi — holat har partition uchun bitta offset soni.
3. Yetkazilishi bilan o'chdi; consumer o'ldi — xabar yo'qoldi.
4. Offset 2 dan — oxirgi commit qilingan pozitsiya; 3-yozuv commit qilinmagan edi.
5. `XCLAIM` yoki `XAUTOCLAIM` bilan, `min-idle-time` dan ko'p kutgan bo'lsa.

</details>

## Rasmiy hujjat

- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) — Consumer Acknowledgement Modes, Negative Acknowledgement, Automatic Requeueing
- [RQ: Reliability Guide](https://www.rabbitmq.com/docs/reliability) — Data Safety on the Consumer Side
- [KD: Design → Consumer Position](https://kafka.apache.org/44/design/design/)
- [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/) · [RD: XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/) · [RD: XCLAIM](https://redis.io/docs/latest/commands/xclaim/)
