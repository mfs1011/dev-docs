# 19 — Share group: navbat rejimi

[Mundarija](README.md)

## Tushuncha

Consumer group'da har partition bitta a'zoga beriladi (15-bob). Bu tartib uchun yaxshi, lekin ba'zi an'anaviy navbat ishlariga mos emas. KD: "ba'zi an'anaviy xabar yuklamalari consumer group'larga yaxshi mos kelmaydi". Masalan, vazifalarni o'zgaruvchan sondagi ishchilarga tarqatish va xatolarni qayta urinish. Shuning uchun **share group** bor (KIP-932, 4.2 dan production'ga tayyor).

### Consumer group'dan farqi (KD Design → The Share Consumer)

| | Consumer group | Share group |
| --- | --- | --- |
| Partition egasi | Bitta a'zo | **Bir nechta** a'zo birga |
| A'zolar soni | ≤ partition soni (ortiqchasi bo'sh) | Partition sonidan **ko'p** bo'lishi mumkin |
| Tasdiq | Offset (o'rin) commit | **Har yozuv alohida** (batch'ga optimallashgan) |
| Yetkazish urinishlari | Sanalmaydi | **Sanaladi** — ishlab bo'lmaydigan yozuvni avtomatik ajratish |

Bir xil share group'ning a'zolari topic yozuvlarini birgalikda o'qiydi. Har xil share group'lar bir-biridan mustaqil o'qiydi.

### Qulf va tasdiq (KD)

Share consumer olgan yozuvlar unga **vaqtli qulf** bilan beriladi (standart 30 soniya, `share.record.lock.duration.ms`). Qulf davomida guruhning boshqa a'zolari bu yozuvni olmaydi. A'zo yozuv bilan quyidagilarni qila oladi:

| Tasdiq | Ma'nosi |
| --- | --- |
| `ACCEPT` | Muvaffaqiyatli ishlandi |
| `RELEASE` | Qayta yetkazishga qaytarish — vaqtinchalik xato uchun |
| `REJECT` | Ishlab bo'lmaydi — boshqa yetkazilmaydi (doimiy xato) |
| `RENEW` | Ishlov davom etyapti — qulfni uzaytirish |
| Hech narsa | Qulf muddati tugaganda avtomatik bo'shaydi |

Tasdiqlash usuli — `share.acknowledgement.mode`:

- `implicit` — standart: keyingi `poll()` yoki `commitSync()` hammasini qabul qiladi;
- `explicit` — har yozuv uchun `acknowledge(record, type)`; holat `commitSync()` da yuboriladi.

Bir partition'da bir vaqtda qulflangan yozuvlar soni cheklangan (`group.share.partition.max.record.locks`). Qulflar o'z-o'zidan bo'shagani uchun a'zo qulasa ham yetkazish davom etadi.

### Dead-letter queue (KD Basic Operations)

`share.version` feature kamida 2 bo'lsa, rad etilgan (yoki urinishlari tugagan) yozuvlar **DLQ topic**'ga yoziladi. Sozlamalar:

- guruh: `errors.deadletterqueue.topic.name`, `errors.deadletterqueue.copy.record.enable` (asl kalit va qiymatni ham ko'chirish);
- broker: `errors.deadletterqueue.auto.create.topics.enable` (standart o'chiq), prefiks `dlq.`.

Share group'ning standart `share.auto.offset.reset` qiymati — `latest`.

## Buyruqlar va kod

VPS'da. A'zo `explicit` rejimda ishlaydi. `xato` bilan boshlanadigan vazifani 3-urinishgacha `RELEASE`, keyin `REJECT` qiladi:

```java
// Share group: bitta partition'ni bir nechta consumer birga o'qiydi; har yozuv alohida tasdiqlanadi
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.*;
import java.util.*;

public class Ulush {
    public static void main(String[] a) throws Exception {
        String nom = a[0];
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("group.id", "ishchilar");
        p.put("share.acknowledgement.mode", "explicit");
        p.put("max.poll.records", "3");                         // har poll()da ko'pi bilan 3 ta
        p.put("key.deserializer", StringDeserializer.class.getName());
        p.put("value.deserializer", StringDeserializer.class.getName());
        long tugash = System.currentTimeMillis() + Long.parseLong(a[1]) * 1000;
        try (KafkaShareConsumer<String, String> c = new KafkaShareConsumer<>(p)) {
            c.subscribe(List.of("vazifalar"));
            while (System.currentTimeMillis() < tugash) {
                for (ConsumerRecord<String, String> r : c.poll(Duration.ofSeconds(1))) {
                    int urinish = r.deliveryCount().orElse((short) 0);
                    Thread.sleep(300);                                   // "ishlov"
                    if (r.value().startsWith("xato")) {
                        AcknowledgeType t = urinish < 3 ? AcknowledgeType.RELEASE : AcknowledgeType.REJECT;
                        c.acknowledge(r, t);
                        System.out.printf("%s %s: p%d@%d %s, urinish %d -> %s%n", LocalTime.now().withNano(0), nom, r.partition(), r.offset(), r.value(), urinish, t);
                    } else {
                        c.acknowledge(r, AcknowledgeType.ACCEPT);
                        System.out.printf("%s %s: p%d@%d %s, urinish %d -> ACCEPT%n", LocalTime.now().withNano(0), nom, r.partition(), r.offset(), r.value(), urinish);
                    }
                }
                c.commitSync();
            }
        }
    }
}
```

### Tayyorlash

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-features.sh --bootstrap-server localhost:9092 describe | grep -o 'Feature: share.version.*FinalizedVersionLevel: [0-9]*' | tr -s ' '
Feature: share.version SupportedMinVersion: 0 SupportedMaxVersion: 2 FinalizedVersionLevel: 2
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --entity-type brokers --entity-default --add-config errors.deadletterqueue.auto.create.topics.enable=true; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --entity-type groups --entity-name ishchilar --add-config share.auto.offset.reset=earliest,errors.deadletterqueue.topic.name=dlq.vazifalar,errors.deadletterqueue.copy.record.enable=true
Completed updating default config for brokers in the cluster.
Completed updating config for group ishchilar.
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic vazifalar --partitions 1; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --entity-type groups --entity-name ishchilar --add-config share.auto.offset.reset=earliest,errors.deadletterqueue.topic.name=dlq.vazifalar,errors.deadletterqueue.copy.record.enable=true
Created topic vazifalar.
Completed updating config for group ishchilar.
```

`share.version` 2 — DLQ qo'llanadi. Guruhga: boshidan o'qish, DLQ topic va yozuvni nusxalash.

### Uch a'zo, bitta partition

A'zolar avval ishga tushiriladi, 25 soniyadan keyin 18 ta vazifa yoziladi:

```text vps
$ cd /root/kafka-java && j() { java -Xmx64m -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Ulush.java "$@" 2>/dev/null; }; (j A 60 > A.log &); (j B 60 > B.log &); (j C 60 > C.log &); sleep 25; (for i in $(seq 1 18); do [ $i = 6 ] && echo xato-$i || echo v$i; done) | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic vazifalar --bootstrap-server localhost:9092; sleep 40; cat A.log B.log C.log | sort; echo "---"; cut -d' ' -f2 A.log B.log C.log | sort | uniq -c; rm -f A.log B.log C.log
21:19:48 C: p0@0 v1, urinish 1 -> ACCEPT
21:19:49 C: p0@1 v2, urinish 1 -> ACCEPT
21:19:49 C: p0@2 v3, urinish 1 -> ACCEPT
21:19:49 C: p0@3 v4, urinish 1 -> ACCEPT
21:19:50 C: p0@4 v5, urinish 1 -> ACCEPT
21:19:50 C: p0@5 xato-6, urinish 1 -> release
21:19:50 C: p0@6 v7, urinish 1 -> ACCEPT
21:19:50 C: p0@7 v8, urinish 1 -> ACCEPT
21:19:51 C: p0@10 v11, urinish 1 -> ACCEPT
21:19:51 C: p0@8 v9, urinish 1 -> ACCEPT
21:19:51 C: p0@9 v10, urinish 1 -> ACCEPT
21:19:52 C: p0@11 v12, urinish 1 -> ACCEPT
21:19:52 C: p0@12 v13, urinish 1 -> ACCEPT
21:19:52 C: p0@13 v14, urinish 1 -> ACCEPT
21:19:53 C: p0@14 v15, urinish 1 -> ACCEPT
21:19:53 C: p0@15 v16, urinish 1 -> ACCEPT
21:19:53 C: p0@16 v17, urinish 1 -> ACCEPT
21:19:53 C: p0@17 v18, urinish 1 -> ACCEPT
21:19:54 B: p0@5 xato-6, urinish 2 -> release
21:19:54 B: p0@5 xato-6, urinish 3 -> reject
---
      2 B:
     18 C:
```

- **Bitta partition**ni uchta a'zo birga o'qiyotgan edi. Kuzatildi: C bir yo'la ko'p yozuvni qulf bilan olgani uchun 18 tasini ham u ishladi (`max.poll.records=3` faqat bitta `poll()` qaytaradigan sonni cheklaydi). Teng taqsimot kafolatlanmaydi: kim tezroq olsa, o'sha ishlaydi.
- `xato-6`: C uni `RELEASE` qildi (urinish 1). U **boshqa a'zoga** — B ga berildi (urinish 2, 3), 3-urinishda `REJECT`. Consumer group'da bu imkonsiz: partition'ni faqat bitta a'zo o'qiydi.

### Guruh va DLQ

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-share-groups.sh --bootstrap-server localhost:9092 --describe --group ishchilar | awk 'NF {print $2, $3, $4, $5}' | column -t
TOPIC      PARTITION  START-OFFSET  LAG
vazifalar  0          5             0
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic dlq.vazifalar --from-beginning --max-messages 1 --formatter-property print.headers=true 2>/dev/null | tr '\t,' '\n\n' | grep -v '^$' | head -12
__dlq.errors.topic:vazifalar
__dlq.errors.partition:0
__dlq.errors.offset:5
__dlq.errors.group:ishchilar
__dlq.errors.delivery.count:3
__dlq.errors.message:Offset rejected by client.
xato-6
$ docker exec kafka /opt/kafka/bin/kafka-share-groups.sh --bootstrap-server localhost:9092 --delete --group ishchilar; for t in vazifalar dlq.vazifalar; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done
Deletion of requested share groups ('ishchilar') was successful.
```

- `LAG` 0 — hamma yozuvning yakuniy holati bor.
- DLQ'da `xato-6`: manba topic, partition, offset, guruh, **urinishlar soni** va sabab ("Offset rejected by client"), asl qiymat bilan birga.
- Kuzatildi: `START-OFFSET` 5 da qoldi — rad etilgan yozuv offset'i. Hujjat `START-OFFSET` ni "yetkazish uchun ko'rib chiqilayotgan in-flight yozuvlarning eng birinchi offset'i" deb ta'riflaydi (KD).

<div data-animatsiya="qadamli" data-nom="share-group"></div>

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Tartib muhim, kalit bo'yicha | Consumer group |
| Vazifalar navbati, ishchilar soni o'zgaruvchan | Share group |
| Partition'dan ko'p parallel ishchi | Share group |
| Vaqtinchalik xato | `RELEASE` (qayta urinish) |
| Doimiy xato | `REJECT` → DLQ |
| Uzoq ishlov | `RENEW` yoki `share.record.lock.duration.ms` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Share group'dan tartib kutish | Yozuvlar turli a'zolarda parallel ishlanadi | Tartib kerak bo'lsa — consumer group |
| Uzoq ishlovda qulfni yangilamaslik | Qulf tugaydi, yozuv boshqa a'zoga ketadi — takror | `RENEW` |
| Har xatoga `REJECT` | Vaqtinchalik xato ham yo'qoladi | `RELEASE` (urinishlar sanaladi) |
| `explicit` rejimda `commitSync()` ni unutish | Tasdiqlar faqat lokal (Javadoc) | Har sikl oxirida `commitSync()` |
| Yangi guruh eski yozuvlarni o'qiydi deb kutish | Standart `share.auto.offset.reset=latest` | Guruh sozlamasi `earliest` |

## Amaliyot

1. Share group consumer group'dan qaysi to'rt jihatda farq qiladi?
2. `RELEASE` va `REJECT` farqi nima?
3. Sinovda `xato-6` qaysi a'zolarga va necha marta yetkazildi?
4. Qulf nima uchun kerak?
5. DLQ yozuvida qanday ma'lumot bor edi?

<details>
<summary>Javoblar</summary>

1. Partition'ni bir nechta a'zo o'qiydi, a'zolar partition'dan ko'p bo'lishi mumkin, yozuvlar alohida tasdiqlanadi, urinishlar sanaladi.
2. `RELEASE` — qayta yetkazishga qaytarish; `REJECT` — boshqa yetkazmaslik.
3. C ga (1-urinish), keyin B ga (2 va 3-urinish), so'ng rad etildi.
4. Yozuv bir vaqtda faqat bitta a'zoda ishlanishi uchun; a'zo qulasa, qulf tugab yozuv qaytadi.
5. Manba topic, partition, offset, guruh, urinishlar soni, sabab va asl qiymat.

</details>

## Rasmiy hujjat

- [KD: Design → The Share Consumer](https://kafka.apache.org/44/design/design/)
- [KD: API → Share Consumer API](https://kafka.apache.org/44/apis/) · [Javadoc: KafkaShareConsumer](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaShareConsumer.html)
- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Managing share groups, Configuring dead-letter queues
