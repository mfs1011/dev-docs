# 11 — Ishonchli yuborish

[Mundarija](README.md)

## Tushuncha

### Yetkazish kafolatlari (KD Design → Message Delivery Semantics)

| Kafolat | Ma'nosi |
| --- | --- |
| **Ko'pi bilan bir marta** (at most once) | Xabar yo'qolishi mumkin, lekin qayta yetkazilmaydi |
| **Kamida bir marta** (at least once) | Yo'qolmaydi, lekin takrorlanishi mumkin |
| **Aynan bir marta** (exactly once) | Har xabar bir va faqat bir marta ishlanadi |

Masala ikkiga bo'linadi: yuborishdagi ishonchlilik va o'qishdagi kafolat (16-bob).

KD: xabar partition'ning **ISR**'idagi (in-sync replicas — leader bilan sinxron replikalar) barcha replikalar uni o'z log'iga yozganda **committed** hisoblanadi. Committed xabar bu partition'ni nusxalovchi kamida bitta broker "tirik" ekan, yo'qolmaydi.

Producer tarmoq xatosini olsa, xato xabar commit bo'lishidan oldin bo'lganmi yoki keyinmi — bila olmaydi. Qayta yuborsa — **takror** paydo bo'lishi mumkin (kamida bir marta). Shuning uchun **idempotent producer** bor: broker har producer'ga **ID** beradi va har xabar bilan keladigan **tartib raqami** (sequence) bo'yicha takrorlarni olib tashlaydi. Qayta yuborish log'da takror bermaydi.

### `acks` (KD Producer Configs)

| Qiymat | Producer nimani kutadi | Xavf |
| --- | --- | --- |
| `0` | Hech narsa: yozuv socket buferiga qo'yildi — "yuborildi". `retries` ishlamaydi, qaytgan offset doim `-1` | Server olganiga kafolat yo'q |
| `1` | Leader o'z log'iga yozdi, follower'larni kutmaydi | Leader tasdiqlagach, follower'lar nusxalamasdan qulasa — xabar yo'qoladi |
| `all` (`-1`) | ISR'dagi **barcha** replikalar | Eng kuchli kafolat: kamida bitta ISR replikasi tirik ekan, yo'qolmaydi. **Standart** |

### `min.insync.replicas` (KD Topic Configs)

`acks=all` da yozuv muvaffaqiyatli bo'lishi uchun kamida nechta sinxron replika (leader bilan birga) kerakligi. ISR undan kichik bo'lsa, producer `NotEnoughReplicas` (yoki `NotEnoughReplicasAfterAppend`) xatosini oladi. Odatiy sozlama: replication factor **3**, `min.insync.replicas=2`, producer `acks=all` — yozuv ko'pchilik replikada saqlangandagina muvaffaqiyatli.

### Idempotentlik (KD Producer Configs → `enable.idempotence`)

- Standart: `true` — boshqa sozlamalar qarama-qarshi bo'lmasa.
- Talablari: `acks=all`, `retries > 0`, `max.in.flight.requests.per.connection ≤ 5`.
- Qarama-qarshi sozlama berilsa va idempotentlik **aniq yoqilmagan** bo'lsa — u jimgina o'chadi. **Aniq yoqilgan** bo'lsa — `ConfigException`.
- `retries` standarti juda katta (2147483647). Chegara — `delivery.timeout.ms` (standart 2 daqiqa).

## Buyruqlar va kod

VPS'da (Kafka 4.4.0, bitta broker). Dastur har yozuvni `get()` bilan kutadi va offset yoki xatoni chiqaradi:

```java
// acks va idempotentlik: har yozuvni sinxron kutib (get()), offset yoki xatoni chiqaradi
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

public class Ishonch {
    public static void main(String[] a) {
        String topic = a[0], acks = a[1], idem = a[2];
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("key.serializer", StringSerializer.class.getName());
        p.put("value.serializer", StringSerializer.class.getName());
        p.put("acks", acks);
        if (!idem.equals("-")) p.put("enable.idempotence", idem);
        p.put("delivery.timeout.ms", "8000");
        p.put("request.timeout.ms", "5000");
        try (KafkaProducer<String, String> pr = new KafkaProducer<>(p)) {
            for (int i = 1; i <= 3; i++) {
                try {
                    RecordMetadata m = pr.send(new ProducerRecord<>(topic, "xabar " + i)).get();
                    System.out.printf("acks=%s: xabar %d -> offset %d%n", acks, i, m.offset());
                } catch (Exception e) {
                    Throwable s = e.getCause() != null ? e.getCause() : e;
                    System.out.printf("acks=%s: xabar %d -> %s: %s%n", acks, i, s.getClass().getSimpleName(), s.getMessage());
                    break;
                }
            }
        } catch (Exception e) {
            System.out.printf("producer yaratilmadi: %s: %s%n", e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
```

### `acks` 0, 1, all

```text vps
$ for t in ishonch ikki-nusxa-kerak; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t 2>/dev/null; done; sleep 3; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ishonch; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ikki-nusxa-kerak --config min.insync.replicas=2
Created topic ishonch.
Created topic ikki-nusxa-kerak.
$ cd /root/kafka-java && for acks in 0 1 all; do java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishonch.java ishonch $acks - 2>/dev/null; done
acks=0: xabar 1 -> offset -1
acks=0: xabar 2 -> offset -1
acks=0: xabar 3 -> offset -1
acks=1: xabar 1 -> offset 3
acks=1: xabar 2 -> offset 4
acks=1: xabar 3 -> offset 5
acks=all: xabar 1 -> offset 6
acks=all: xabar 2 -> offset 7
acks=all: xabar 3 -> offset 8
$ docker exec kafka sh -c '/opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/ishonch-0/00000000000000000000.log 2>/dev/null' | grep -o 'baseOffset: [0-9]* .*producerId: [-0-9]*' | sed 's/lastOffset.*baseSequence/baseSequence/; s/lastSequence: [-0-9]* //'
baseOffset: 0 baseSequence: -1 producerId: -1
baseOffset: 1 baseSequence: -1 producerId: -1
baseOffset: 2 baseSequence: -1 producerId: -1
baseOffset: 3 baseSequence: -1 producerId: -1
baseOffset: 4 baseSequence: -1 producerId: -1
baseOffset: 5 baseSequence: -1 producerId: -1
baseOffset: 6 baseSequence: 0 producerId: 27
baseOffset: 7 baseSequence: 1 producerId: 27
baseOffset: 8 baseSequence: 2 producerId: 27
```

- `acks=0`: offset `-1` — producer javob kutmadi (KD).
- Diskda: `acks=0` va `acks=1` batch'larida `producerId: -1` — **idempotentlik o'chgan**: `acks` `all` emas, idempotentlik aniq yoqilmagan, shuning uchun u jimgina o'chdi (KD).
- `acks=all` (sozlamalar standart): `producerId: 27`, `baseSequence` 0, 1, 2 — idempotent producer ID va tartib raqami bilan yozdi.

### Idempotentlik aniq yoqilsa

```text vps
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishonch.java ishonch 1 true 2>/dev/null
producer yaratilmadi: ConfigException: Must set acks to all in order to use the idempotent producer. Otherwise we cannot guarantee idempotence.
$ for t in ishonch ikki-nusxa-kerak; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done
```

`acks=1` + `enable.idempotence=true` — producer umuman yaratilmadi: `ConfigException`.

### `min.insync.replicas` bitta broker'da

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ikki-nusxa-kerak --config min.insync.replicas=2; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic ikki-nusxa-kerak
Created topic ikki-nusxa-kerak.
Topic: ikki-nusxa-kerak	TopicId: HiDI7mEqTOSjDS8m_LOiyg	PartitionCount: 1	ReplicationFactor: 1	Configs: min.insync.replicas=2,segment.bytes=1073741824
	Topic: ikki-nusxa-kerak	Partition: 0	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishonch.java ikki-nusxa-kerak all - 2>/dev/null
acks=all: xabar 1 -> offset 0
acks=all: xabar 2 -> offset 1
acks=all: xabar 3 -> offset 2
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic ikki-nusxa-kerak
```

Kuzatildi: topic'da `min.insync.replicas=2`, lekin replika va ISR — 1 ta. Shunga qaramay `acks=all` yozuvlari muvaffaqiyatli o'tdi. KD qoidasiga ko'ra `NotEnoughReplicas` kutilgan edi. Bu xatti-harakatning sababini rasmiy hujjatda topa olmadik. 4.x'dagi Eligible Leader Replicas (ELR) o'zgarishlari ham buni tushuntirmaydi. Shuning uchun `min.insync.replicas` ni **ko'p tugunli** klasterda sinash kerak, bitta tugunda emas: 20-bobda 3 tugunli klasterda `NotEnoughReplicasException` kutilganidek chiqdi.

## Variantlar

| Talab | Sozlama |
| --- | --- |
| Yo'qolmasin, takror bo'lmasin | `acks=all` + idempotentlik (standart), RF 3, `min.insync.replicas=2` |
| Eng tez, yo'qolsa ham mayli (metrika, log) | `acks=0` yoki `1` |
| Bir nechta partition'ga atomik | Tranzaksiyalar (13-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `acks=1` ni "ishonchli" deb hisoblash | Leader qulasa, nusxalanmagan xabar yo'qoladi (KD) | `acks=all` |
| `acks` ni o'zgartirib, idempotentlik ishlayapti deb o'ylash | Jimgina o'chadi (KD, sinovda `producerId: -1`) | `acks=all` yoki idempotentlikni aniq yoqish (xato beradi) |
| `min.insync.replicas` = replication factor | Bitta replika tushsa, yozish to'xtaydi | RF 3, min.insync 2 |
| `retries=0` | Vaqtinchalik xatoda xabar yo'qoladi | Standart + `delivery.timeout.ms` |

## Amaliyot

1. Xabar qachon "committed" hisoblanadi?
2. `acks=1` da xabar qanday yo'qolishi mumkin?
3. Idempotent producer takrorni qanday aniqlaydi?
4. Sinovda nega `acks=1` yozuvlarida `producerId: -1` edi?
5. Production'da odatiy ishonchli sozlama qanday?

<details>
<summary>Javoblar</summary>

1. ISR'dagi barcha replikalar uni log'iga yozganda.
2. Leader tasdiqlagach, follower'lar nusxalamasdan qulasa.
3. Producer ID va har xabarning tartib raqami bo'yicha.
4. `acks` `all` emas edi, idempotentlik aniq yoqilmagan — jimgina o'chdi.
5. RF 3, `min.insync.replicas=2`, `acks=all`, idempotentlik yoqiq.

</details>

## Rasmiy hujjat

- [KD: Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/)
- [KD: Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) — `acks`, `enable.idempotence`, `retries`, `delivery.timeout.ms`
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `min.insync.replicas`
- [KD: Eligible Leader Replicas](https://kafka.apache.org/44/operations/eligible-leader-replicas/)
