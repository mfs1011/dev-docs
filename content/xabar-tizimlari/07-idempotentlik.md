# 07 — Takror xabar va idempotentlik

[Mundarija](README.md)

## Tushuncha

At-least-once (4-bob) — "yo'qolmaydi, lekin **takrorlanishi mumkin**". Takror ikki joydan keladi:

| Qayerda | Qanday | Natija |
| --- | --- | --- |
| **Consumer** tomonida | Xabarni ishladi, tasdiqlashdan oldin o'ldi (5-bob) | Xabar qayta keladi |
| **Producer** tomonida | Yubordi, javobni olmay uzildi yoki o'ldi; qayta yubordi | Broker'da xabar ikki nusxada |

**Idempotentlik** — bir amalni bir necha marta bajarish natijani bir marta bajargandagidan o'zgartirmasligi. "Status = to'landi" qo'yish idempotent. "Balansga 100 qo'shish" esa idempotent emas.

### Rasmiy hujjatlarda

**RabbitMQ** (RQ Reliability → Data Safety on the Consumer Side):

- Tarmoq yoki tugun nosozligida xabarlar qayta yetkazilishi mumkin — consumer avval ko'rgan xabarni olishga tayyor bo'lsin.
- Consumer'ni aniq takror qidirish bilan emas, **idempotent** qilib yozish tavsiya etiladi.
- `redelivered=false` — xabar avval ko'rilmagani kafolat. `true` — faqat ishora (5-bob). Takrorni tekshirish qimmat bo'lsa, uni faqat `redelivered=true` xabarlar uchun qilish mumkin.

**Kafka** (KD Design → Message Delivery Semantics):

- 0.11.0.0 dan producer'da **idempotent yetkazish** bor: qayta yuborish log'da takror yozuv hosil qilmaydi.
- Broker har producer'ga **ID** beradi va har xabar bilan keladigan **tartib raqami** (sequence) bo'yicha takrorni tashlaydi.
- `enable.idempotence` `acks=all` ni talab qiladi (KD Producer Configs).
- Consumer tomonida — KD: ko'p hollarda xabarlarning asosiy kaliti bor, shuning uchun yangilash idempotent: bir xabarni ikki marta olish yozuvni o'zining nusxasi bilan almashtiradi xolos.

**Redis** (RD Streams → Idempotent message processing, Redis 8.6+):

- `XADD` dan keyin javob kelmasa, producer xabar qo'shilganini bilmaydi va qayta yuborishga majbur.
- `IDMP pid iid` — producer o'z ID'si (pid) va xabar ID'si (iid) bilan yuboradi. `IDMPAUTO pid` — iid'ni Redis xabar mazmunidan hisoblaydi.
- Bir xil (pid, iid) qayta kelsa, takror qo'shilmaydi. iid'lar `IDMP-DURATION` (standart 100 s) va `IDMP-MAXSIZE` (standart 100) chegarasida saqlanadi (`XCFGSET` bilan sozlanadi).

Producer tomonidagi bu vositalar faqat **broker'dagi** takrorni yo'qotadi. Consumer qayta olgan xabarni baribir o'zi idempotent ishlashi kerak.

## Uch tizimda

### RabbitMQ: consumer tomonida idempotentlik

Xabar — "hisobga 100 qo'sh", `message_id` bilan. Consumer ishlaydi, tasdiqlashdan oldin o'ladi (`ol`), xabar qaytadi:

```js
// Xabar: "hisobga 100 qo'sh". Rejim: oddiy (har safar qo'shadi) yoki idempotent (messageId'ni eslab qoladi).
// 'ol' — ishlab, tasdiqlamay o'ladi (xabar qaytadi).
const amqp = require('amqplib'); const fs = require('fs');
const [rejim, ol] = process.argv.slice(2), F = '/root/rabbit-ilova/hisob.json';
const holat = fs.existsSync(F) ? JSON.parse(fs.readFileSync(F)) : { balans: 0, ishlangan: [] };
(async () => {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel(); await ch.prefetch(1);
  await ch.consume('tolov', async m => {
    const id = m.properties.messageId;
    if (rejim === 'idempotent' && holat.ishlangan.includes(id)) {
      console.log(`  ${id} avval ishlangan (redelivered=${m.fields.redelivered}) — o'tkazildi`);
    } else {
      holat.balans += Number(m.content); holat.ishlangan.push(id);   // ish va "ishlangan" belgisi birga saqlanadi
      fs.writeFileSync(F, JSON.stringify(holat));
      console.log(`  ${id} ishlandi (redelivered=${m.fields.redelivered}), balans=${holat.balans}`);
    }
    if (ol) process.exit(1);                                         // ack'dan oldin o'ldi
    ch.ack(m); await ch.close(); await c.close();
  });
})();
```

```text vps
$ rabbitmqadmin queues declare --name tolov --durable true >/dev/null; rm -f /root/rabbit-ilova/hisob.json; rabbitmqadmin publish message --routing-key tolov --payload 100 --properties '{"message_id":"tolov-7"}'; cd /root/rabbit-ilova && node hisob.js oddiy ol; node hisob.js oddiy
Message published and routed successfully
  tolov-7 ishlandi (redelivered=false), balans=100
  tolov-7 ishlandi (redelivered=true), balans=200
$ rm -f /root/rabbit-ilova/hisob.json; rabbitmqadmin publish message --routing-key tolov --payload 100 --properties '{"message_id":"tolov-8"}'; cd /root/rabbit-ilova && node hisob.js idempotent ol; node hisob.js idempotent; rabbitmqadmin queues delete --name tolov; rm -f hisob.js hisob.json
Message published and routed successfully
  tolov-8 ishlandi (redelivered=false), balans=100
  tolov-8 avval ishlangan (redelivered=true) — o'tkazildi
```

- **Oddiy** ishlov: xabar ikki marta ishlandi — balans **200**, to'g'ri qiymat 100.
- **Idempotent** ishlov: ishlangan `message_id` lar balans bilan **birga** saqlanadi. Qayta kelgan `tolov-8` tanildi va o'tkazib yuborildi — balans 100 qoldi.
- Muhim: "ishlandi" belgisi natija bilan **bitta joyda va birga** yozilsin. Alohida yozilsa, ular orasida o'lish yana takror beradi.

### Redis: idempotent `XADD`

```text vps
$ for i in 1 2; do redis-cli XADD buyurtmalar '*' buyurtma 1 >/dev/null; done; echo "oddiy XADD x2: XLEN=$(redis-cli XLEN buyurtmalar)"; redis-cli DEL buyurtmalar >/dev/null
oddiy XADD x2: XLEN=2
$ for i in 1 2; do echo "IDMP $i-urinish: $(redis-cli XADD buyurtmalar IDMP xizmat-1 buyurtma-1 '*' buyurtma 1)"; done; redis-cli XADD buyurtmalar IDMPAUTO xizmat-2 '*' buyurtma 2 >/dev/null; redis-cli XADD buyurtmalar IDMPAUTO xizmat-2 '*' buyurtma 2 >/dev/null; echo "XLEN=$(redis-cli XLEN buyurtmalar)"; redis-cli XINFO STREAM buyurtmalar | paste - - | grep -E '^(idmp|pids|iids)' ; redis-cli DEL buyurtmalar >/dev/null
IDMP 1-urinish: 1794350552416-0
IDMP 2-urinish: 1794350552416-0
XLEN=2
idmp-duration	100
idmp-maxsize	100
pids-tracked	2
iids-tracked	2
iids-added	2
iids-duplicates	2
```

- Oddiy `XADD` ni ikki marta chaqirish — 2 ta yozuv.
- `IDMP xizmat-1 buyurtma-1` ikki marta — ikkala javob ham **bir xil ID**: ikkinchisi yangi yozuv qo'shmadi.
- `IDMPAUTO` — bir xil mazmun takror qo'shilmadi. Natija: 4 urinishdan 2 ta yozuv. `XINFO STREAM`: `iids-duplicates 2`.

### Kafka: idempotent producer

```java
// Idempotent va oddiy producer: broker'ga yozilgan batch'da producerId va sequence
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

public class Idem {
    public static void main(String[] a) throws Exception {
        for (String idem : new String[]{"true", "false"}) {
            Properties p = new Properties();
            p.put("bootstrap.servers", "localhost:9092"); p.put("enable.idempotence", idem);
            p.put("key.serializer", StringSerializer.class.getName()); p.put("value.serializer", StringSerializer.class.getName());
            try (Producer<String, String> pr = new KafkaProducer<>(p)) {
                pr.send(new ProducerRecord<>("idem", "idempotence=" + idem)).get();
            }
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic idem >/dev/null; cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Idem.java 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/idem-0/00000000000000000000.log --print-data-log 2>/dev/null | grep -o -E 'baseOffset: [0-9]+|producerId: -?[0-9]+|baseSequence: -?[0-9]+|payload: .*' | paste - - - - ; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic idem
baseOffset: 0	baseSequence: 0	producerId: 1012	payload: idempotence=true
baseOffset: 1	baseSequence: -1	producerId: -1	payload: idempotence=false
```

Log faylida (`kafka-dump-log.sh`):

- `enable.idempotence=true` (standart, agar zid sozlama bo'lmasa — KD): batch'da `producerId: 1012` va `baseSequence: 0`. Broker shu juftlik bo'yicha takrorni taniydi.
- `enable.idempotence=false`: `producerId: -1`, `baseSequence: -1` — broker takrorni aniqlay olmaydi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| At-least-once'da consumer'ni idempotent qilmaslik | Qayta kelgan xabar natijani buzadi (sinovda balans 200) | Idempotent amal yoki ishlangan ID'lar |
| Ishlangan ID'ni natijadan alohida, keyinroq saqlash | Ular orasida o'lish yana takror beradi | Natija bilan bitta tranzaksiyada |
| Faqat `redelivered` ga tayanish | Producer qayta yuborgan xabar broker uchun yangi xabar — `redelivered=false` bilan keladi | Xabar ID'si bo'yicha tekshirish |
| Kafka'da `acks=1` bilan idempotentlik | Idempotentlik `acks=all` talab qiladi (KD) | `acks=all` |
| Redis `IDMP` da har qayta ishga tushishda yangi pid | Takrorlar tanilmaydi (RD) | Qayta ishga tushganda o'sha pid |
| Producer idempotentligi consumer takrorini ham yo'qotadi deb o'ylash | U faqat broker'ga yozishdagi takrorni tashlaydi | Consumer'ni ham idempotent qilish |

## Amaliyot

1. Takror xabar qayerlardan paydo bo'ladi?
2. RQ consumer uchun nima tavsiya qiladi?
3. Kafka broker idempotent producer'ning takrorini qanday taniydi?
4. Sinovda oddiy va idempotent consumer'da balans qanday bo'ldi?
5. Redis'da `IDMP` va `IDMPAUTO` farqi nima?

<details>
<summary>Javoblar</summary>

1. Consumer tasdiqlashdan oldin o'lganda va producer javobni olmay qayta yuborganda.
2. Aniq takror qidirishdan ko'ra idempotent qilib yozish.
3. Producer ID va har xabarning tartib raqami bo'yicha.
4. Oddiy — 200 (ikki marta ishlandi), idempotent — 100.
5. `IDMP` — iid'ni producer beradi; `IDMPAUTO` — Redis uni xabar mazmunidan hisoblaydi.

</details>

## Rasmiy hujjat

- [RQ: Reliability Guide](https://www.rabbitmq.com/docs/reliability) — Data Safety on the Consumer Side
- [KD: Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/) · [KD: Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) — `enable.idempotence`, `acks`
- [RD: Idempotent message processing](https://redis.io/docs/latest/develop/data-types/streams/idempotency/)
