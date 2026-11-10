# 16 — Offset commit

[Mundarija](README.md)

## Tushuncha

Consumer'ning pozitsiyasi (14-bob) xotirada. U qulasa yoki partition boshqa a'zoga o'tsa, yangi o'quvchi qayerdan boshlashini bilishi kerak. Buning uchun guruh o'z o'rnini **commit** qiladi — `__consumer_offsets` ichki topic'iga saqlaydi (KD Design: consumer o'rni ichki topic'da xabar sifatida saqlanadi).

### Qachon commit qilish (KD Design → Message Delivery Semantics)

| Tartib | Qulasa nima bo'ladi | Kafolat |
| --- | --- | --- |
| Avval o'rinni saqlash, keyin ishlash | Saqlangan, lekin ishlanmagan xabarlar qolib ketadi — yangi jarayon saqlangan joydan boshlaydi | **Ko'pi bilan bir marta** (yo'qolishi mumkin) |
| Avval ishlash, keyin o'rinni saqlash | Ishlangan, lekin saqlanmagan xabarlar qayta ishlanadi | **Kamida bir marta** (takrorlanishi mumkin) |

KD: ko'p holatda xabarlarning asosiy kaliti bor va yangilanishlar **idempotent** — bir xabarni ikki marta olish yozuvni o'zining nusxasi bilan qayta yozadi xolos. Aynan bir marta — Kafka ichida tranzaksiyalar bilan (13-bob), tashqi tizimda — o'rinni natija bilan bir joyda saqlash bilan.

### Avtomatik va qo'lda commit (KD Consumer Configs)

| Usul | Qanday |
| --- | --- |
| **Avtomatik** | `enable.auto.commit=true` (**standart**) — fonda har `auto.commit.interval.ms` (standart 5000 ms) da commit |
| **Qo'lda, sinxron** | `enable.auto.commit=false` + `commitSync()` — bloklaydi, xatoda qayta urinadi |
| **Qo'lda, asinxron** | `commitAsync(callback)` — kutmaydi |
| Aniq offset | `commitSync(Map<TopicPartition, OffsetAndMetadata>)` — keyingi o'qiladigan offset, ya'ni `offset + 1` |

Avtomatik commit ishlov tugashidan qat'i nazar vaqt bo'yicha bajariladi. Shuning uchun u ham yo'qotish, ham takrorga olib kelishi mumkin. Ishlov muhim bo'lsa — qo'lda, ishlovdan keyin.

## Buyruqlar va kod

VPS'da. `tolovlar` topic'ida 5 ta hodisa. Dastur har hodisani ishlaydi va commit'ni ishlovdan **oldin** yoki **keyin** qiladi. Ko'rsatilgan hodisada `System.exit(1)` bilan "quladi":

```java
// Offset commit ishlovdan OLDIN yoki KEYIN: ishlov o'rtasida "qulash" (System.exit) nimaga olib keladi
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;

public class Ishlov {
    public static void main(String[] a) {
        String tartib = a[0];                        // oldin | keyin
        String qulash = a.length > 1 ? a[1] : "";    // shu qiymatda jarayon "qulaydi"
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("group.id", "ishlov-" + tartib);
        p.put("enable.auto.commit", "false");
        p.put("auto.offset.reset", "earliest");
        p.put("key.deserializer", StringDeserializer.class.getName());
        p.put("value.deserializer", StringDeserializer.class.getName());
        try (KafkaConsumer<String, String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("tolovlar"));
            int bosh = 0;
            while (bosh < 30) {
                ConsumerRecords<String, String> rs = c.poll(Duration.ofSeconds(2));
                if (rs.isEmpty()) { bosh++; continue; }
                for (ConsumerRecord<String, String> r : rs) {
                    Map<TopicPartition, OffsetAndMetadata> keyingi = Map.of(new TopicPartition(r.topic(), r.partition()), new OffsetAndMetadata(r.offset() + 1));
                    if (tartib.equals("oldin")) c.commitSync(keyingi);       // avval "o'qildi" deb belgilash
                    if (r.value().equals(qulash) && tartib.equals("oldin")) { System.out.println("QULADI: " + r.value() + " ishlanmadi"); System.exit(1); }
                    System.out.println("ishlandi: " + r.value() + " (offset " + r.offset() + ")");
                    if (r.value().equals(qulash) && tartib.equals("keyin")) { System.out.println("QULADI: " + r.value() + " commit qilinmadi"); System.exit(1); }
                    if (tartib.equals("keyin")) c.commitSync(keyingi);       // ishlovdan keyin belgilash
                }
            }
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tolovlar; printf 'tolov-1\ntolov-2\ntolov-3\ntolov-4\ntolov-5\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic tolovlar --bootstrap-server localhost:9092
Created topic tolovlar.
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishlov.java oldin tolov-3 2>/dev/null; echo "--- qayta ishga tushdi"; java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishlov.java oldin 2>/dev/null
ishlandi: tolov-1 (offset 0)
ishlandi: tolov-2 (offset 1)
QULADI: tolov-3 ishlanmadi
--- qayta ishga tushdi
ishlandi: tolov-4 (offset 3)
ishlandi: tolov-5 (offset 4)
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishlov.java keyin tolov-3 2>/dev/null; echo "--- qayta ishga tushdi"; java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ishlov.java keyin 2>/dev/null
ishlandi: tolov-1 (offset 0)
ishlandi: tolov-2 (offset 1)
ishlandi: tolov-3 (offset 2)
QULADI: tolov-3 commit qilinmadi
--- qayta ishga tushdi
ishlandi: tolov-3 (offset 2)
ishlandi: tolov-4 (offset 3)
ishlandi: tolov-5 (offset 4)
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --all-groups --offsets 2>/dev/null | awk '$1 ~ /ishlov/ {print $1, $4, $5, $6}' | column -t
ishlov-keyin  5  5  0
ishlov-oldin  5  5  0
$ for g in ishlov-oldin ishlov-keyin; do docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group $g >/dev/null 2>&1; done; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic tolovlar
```

- **Oldin**: `tolov-3` "o'qildi" deb belgilandi, lekin ishlanmasdan jarayon quladi. Qayta ishga tushgan consumer 4 dan davom etdi — **tolov-3 yo'qoldi**.
- **Keyin**: `tolov-3` ishlandi, lekin commit'dan oldin quladi. Qayta ishga tushganda yana 3 dan boshladi — **tolov-3 ikki marta** ishlandi.
- Ikkala guruh ham oxirida 5 da (lag 0) — farq faqat yo'lda.
- Kuzatildi: qulagan a'zo guruhdan darhol chiqmaydi. Yangi nusxa partition'ni olguncha bir necha o'n soniya kutdi (sessiya muddati — `group.consumer.session.timeout.ms`, 15-bob). Shuning uchun dastur bo'sh `poll()` larni 30 martagacha kutadi.

<div data-animatsiya="qadamli" data-nom="offset-commit"></div>

## Variantlar

| Talab | Usul |
| --- | --- |
| Hech narsa yo'qolmasin | Ishlovdan keyin commit + idempotent ishlov |
| Takror umuman bo'lmasin, Kafka → Kafka | Tranzaksiya, `sendOffsetsToTransaction` (13-bob) yoki Kafka Streams |
| Natija bazaga yoziladi | O'rinni natija bilan bir bazada, bitta tranzaksiyada saqlash |
| Yo'qolsa ham mayli (metrika) | Avtomatik commit |
| Yuqori tezlik | `commitAsync`, har batch oxirida |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Standart avtomatik commit'ga tayanish | Ishlovdan qat'i nazar har 5 soniyada commit | `enable.auto.commit=false`, qo'lda |
| Ishlovdan oldin commit | Qulasa — yo'qolish (sinovda tolov-3) | Ishlovdan keyin |
| Takrorga tayyor bo'lmaslik | Kamida bir marta da takror muqarrar (sinovda) | Idempotent ishlov (kalit bo'yicha upsert) |
| `commitSync(offset)` | Keyingi o'qiladigan offset berilishi kerak | `offset + 1` |
| Har yozuvdan keyin `commitSync` | Sekin | Har batch oxirida |

## Amaliyot

1. Commit nima va qayerda saqlanadi?
2. Ishlovdan oldin commit qanday kafolat beradi va nega?
3. Sinovda "keyin" tartibida nima takrorlandi?
4. `enable.auto.commit` standarti qanday va xavfi nima?
5. Takror xabarga qanday tayyorlanish kerak?

<details>
<summary>Javoblar</summary>

1. Guruhning partition'dagi o'rnini saqlash; `__consumer_offsets` topic'ida.
2. Ko'pi bilan bir marta — belgilangan, lekin ishlanmagan xabarlar yo'qolishi mumkin.
3. tolov-3 — u ishlangan edi, lekin commit'dan oldin jarayon quladi.
4. `true` — ishlovdan qat'i nazar vaqt bo'yicha commit: yo'qotish yoki takror.
5. Ishlovni idempotent qilish (masalan, kalit bo'yicha upsert).

</details>

## Rasmiy hujjat

- [KD: Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/)
- [KD: Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/) — `enable.auto.commit`, `auto.commit.interval.ms`
- [Javadoc: KafkaConsumer](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html)
