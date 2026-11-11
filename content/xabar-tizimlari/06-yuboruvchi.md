# 06 — Yuboruvchining kafolati

[Mundarija](README.md)

## Tushuncha

Kafolatning birinchi yarmi yuboruvchida (4-bob). RQ (Publisher Confirms): tarmoq ko'zga tashlanmaydigan yo'llar bilan ham buziladi. Soketga xabar yozgan klient xabar serverga yetib, ishlanganini **taxmin qila olmaydi** — u yo'lda yo'qolgan yoki kechikkan bo'lishi mumkin. Demak, broker "oldim va saqladim" deb javob berishi kerak.

| Tizim | Mexanizm | "Saqladim" qachon |
| --- | --- | --- |
| **RabbitMQ** | **Publisher confirms**: kanal `confirm.select` bilan tasdiq rejimiga o'tadi, broker har xabarga `basic.ack` (yoki `basic.nack`) qaytaradi | Xabar barcha navbatlarga qabul qilinganda. Persistent xabar va durable navbatda — **diskka yozilgach**. Quorum navbatda — replikalar ko'pchiligi qabul qilgach |
| **Kafka** | Producer'ning **`acks`** sozlamasi va topic'ning `min.insync.replicas` | `acks=0` — kutmaydi; `acks=1` — leader o'z log'iga yozgach; `acks=all` (standart) — barcha in-sync replikalar olgach |
| **Redis** | Standartda — yozish buyrug'ining javobi. Replikatsiya **asinxron** (RD) | `WAIT N ms` — N ta replika olganini kutish |

### RabbitMQ: e'tibor beradigan joylar (RQ)

- **Hech qayerga yo'naltirilmagan** xabar ham `ack` oladi — exchange uni hech bir navbatga yubormasligini aniqlagach. Xabar yo'qolgani haqida bilish uchun `mandatory` bayrog'i kerak: broker `ack` dan oldin `basic.return` yuboradi.
- `basic.nack` faqat navbat jarayonida ichki xato bo'lganda keladi. Unda klient xabarni qayta yuborishi mumkin.
- Persistent xabar tasdig'i diskka yozishdan keyin keladi. Yozish bir necha yuz millisoniyalik paketlar bilan bo'ladi, shuning uchun tasdiqlar asinxron yoki paketlab kutilsin.
- Standart AMQP'da yagona boshqa yo'l — tranzaksiyalar. Ular o'tkazuvchanlikni **250 marta** kamaytiradi.

### Kafka: `acks` (KD Producer Configs, Design → Replication)

| `acks` | Ma'nosi | Xavf |
| --- | --- | --- |
| `0` | Producer hech qanday javob kutmaydi; yozuv soket buferiga qo'shilishi bilan "yuborilgan". Qaytgan offset doim -1 | Serverga yetgani kafolatlanmaydi, `retries` ishlamaydi |
| `1` | Leader o'z log'iga yozgach javob beradi | Follower'lar nusxa olguncha leader o'lsa — yozuv yo'qoladi |
| `all` (`-1`) | Barcha **in-sync** replikalar olgach | Kamida bitta in-sync replika tirik ekan yo'qolmaydi. Eng kuchli kafolat |

KD: `acks=all` "barcha tayinlangan replikalar" degani emas, faqat **joriy ISR**. ISR bitta replikagacha qisqarsa, yozuv bitta nusxada qoladi. Buning oldini olish uchun `min.insync.replicas`: ISR undan kichik bo'lsa partition yozuv qabul qilmaydi (faqat `acks=all` bilan ishlaydi; Kafka kitobi, 20-bob).

### Redis: asinxron replikatsiya (RD Replication)

Master har buyruqda replikalarni kutmaydi — past kechikish va yuqori unum uchun. `WAIT` ma'lum sondagi replikalar ma'lumotni olganini kutadi, lekin RD ogohlantiradi: bu Redis'ni kuchli izchil tizimga aylantirmaydi. Failover paytida tasdiqlangan yozuvlar baribir yo'qolishi mumkin; `WAIT` faqat ehtimolni ancha kamaytiradi.

## Uch tizimda

### RabbitMQ: confirm va `mandatory`

```js
// Publisher confirms: broker xabarni qabul qildimi? Yo'naltirilgan va hech qayerga bormaydigan xabar
const amqp = require('amqplib');
(async () => {
  const c = await amqp.connect('amqp://localhost');
  const ch = await c.createConfirmChannel();                       // confirm.select
  await ch.assertQueue('buyurtmalar', { durable: true });
  ch.on('return', m => console.log(`  basic.return: ${m.fields.replyCode} ${m.fields.replyText}`));
  const yubor = (kalit, opts) => new Promise(r => ch.publish('', kalit, Buffer.from('buyurtma #1'), opts,
    err => { console.log(`  confirm: ${err ? 'nack' : 'ack'}`); r(); }));
  console.log('1) mavjud navbatga, persistent:');        await yubor('buyurtmalar', { persistent: true });
  console.log('2) navbat yo\'q, mandatory\'siz:');      await yubor('yoq-navbat', { persistent: true });
  console.log('3) navbat yo\'q, mandatory: true:');     await yubor('yoq-navbat', { persistent: true, mandatory: true });
  console.log('navbatda:', (await ch.checkQueue('buyurtmalar')).messageCount);
  await ch.deleteQueue('buyurtmalar'); await c.close();
})();
```

```text vps
$ cd /root/rabbit-ilova && node yubor.js; rm yubor.js
1) mavjud navbatga, persistent:
  confirm: ack
2) navbat yo'q, mandatory'siz:
  confirm: ack
3) navbat yo'q, mandatory: true:
  basic.return: 312 NO_ROUTE
  confirm: ack
navbatda: 1
```

- 1 — navbatga tushdi, `ack`.
- 2 — `yoq-navbat` degan navbat yo'q. Xabar hech qayerga bormadi, lekin broker baribir **`ack`** qaytardi. Yuboruvchi hech narsani sezmadi — xabar yo'qoldi.
- 3 — `mandatory: true` bilan: avval `basic.return` (`312 NO_ROUTE`), keyin `ack`. Endi yuboruvchi xabar yetmaganini biladi.
- Navbatda 1 ta — faqat birinchisi.

### Kafka: `acks`

```java
// acks=0, 1, all: producer broker'dan qanday javob oladi
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

public class Acks {
    public static void main(String[] a) throws Exception {
        for (String acks : new String[]{"0", "1", "all"}) {
            Properties p = new Properties();
            p.put("bootstrap.servers", "localhost:9092"); p.put("acks", acks);
            if (acks.equals("0")) p.put("enable.idempotence", "false");      // idempotentlik acks=all talab qiladi
            p.put("key.serializer", StringSerializer.class.getName()); p.put("value.serializer", StringSerializer.class.getName());
            try (Producer<String, String> pr = new KafkaProducer<>(p)) {
                RecordMetadata m = pr.send(new ProducerRecord<>("yuborish", "buyurtma #1")).get();
                System.out.printf("acks=%-3s -> partition %d, offset %s%n", acks, m.partition(), m.hasOffset() ? m.offset() : "noma'lum (broker javob bermaydi)");
            }
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic yuborish >/dev/null; cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Acks.java 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic yuborish
acks=0   -> partition 0, offset noma'lum (broker javob bermaydi)
acks=1   -> partition 0, offset 1
acks=all -> partition 0, offset 2
```

- `acks=0` — broker javobi kutilmadi, offset noma'lum (KD: -1).
- `acks=1` va `acks=all` — broker yozuvning offset'ini qaytardi. Bitta broker'da farq ko'rinmaydi: ISR'da faqat leader. Farq klasterda, leader o'lganda chiqadi (13-bob).
- `acks=0` uchun `enable.idempotence=false` qo'yildi: idempotentlik `acks=all` ni talab qiladi (KD; 7-bob).

### Redis: `WAIT`

```text vps
$ redis-cli INFO replication | grep -E '^(role|connected_slaves)'; redis-cli SET buyurtma:1 yangi; redis-cli WAIT 1 1000; redis-cli DEL buyurtma:1 >/dev/null
role:master
connected_slaves:0
OK
0
```

`SET` — `OK`, lekin bu faqat master'ning javobi. Replika yo'q (`connected_slaves:0`), shuning uchun `WAIT 1 1000` 1 soniya kutib `0` qaytardi: hech bir replika yozuvni tasdiqlamadi. Yuboruvchi shu son bilan yozuv nechta nusxada ekanini bildi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| RabbitMQ'da confirm'siz yuborish | Xabar yo'lda yo'qolsa, bilinmaydi (RQ) | Confirm kanali |
| Confirm `ack` = xabar navbatda deb o'ylash | Yo'naltirilmagan xabar ham `ack` oladi (RQ, sinovda) | `mandatory` + `return` ishlovchisi |
| Har xabarni sinxron kutish | Tasdiq disk paketlari bilan keladi, sekin (RQ) | Asinxron yoki paketlab kutish |
| Kafka'da `acks=1` bilan "ishonchli" deb hisoblash | Leader nusxalanmasdan o'lsa yozuv yo'qoladi (KD) | `acks=all` + `min.insync.replicas` |
| Redis `OK` ni replikalarda ham bor deb hisoblash | Replikatsiya asinxron (RD) | `WAIT`, lekin u ham to'liq kafolat emas |

## Amaliyot

1. Nega yuboruvchi soketga yozish bilan xabar yetdi deb hisoblay olmaydi?
2. RabbitMQ persistent xabarni durable navbatga qachon tasdiqlaydi?
3. Sinovda mavjud bo'lmagan navbatga yuborilgan xabar qanday javob oldi va `mandatory` nimani o'zgartirdi?
4. `acks=1` va `acks=all` farqi nima?
5. Redis'da `WAIT` nimani kafolatlaydi va nimani yo'q?

<details>
<summary>Javoblar</summary>

1. Tarmoq xabarni yo'qotishi yoki kechiktirishi mumkin; yozish serverda ishlanganini bildirmaydi.
2. Diskka yozilgach.
3. `ack` oldi (xabar yo'qoldi); `mandatory` bilan avval `basic.return` (`NO_ROUTE`) keldi.
4. `acks=1` — faqat leader yozgach; `acks=all` — barcha in-sync replikalar olgach.
5. Ko'rsatilgan sondagi replikalar yozuvni olganini; failover'da yo'qolmasligini emas.

</details>

## Rasmiy hujjat

- [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) — Publisher Confirms, When Will Published Messages Be Confirmed
- [KD: Producer Configs → acks](https://kafka.apache.org/44/configuration/producer-configs/)
- [KD: Design → Replication](https://kafka.apache.org/44/design/design/)
- [RD: Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
