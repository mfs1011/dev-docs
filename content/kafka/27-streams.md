# 27 — Kafka Streams asoslari

[Mundarija](README.md)

## Tushuncha

KD (Streams Quick Start): **Kafka Streams** — kirish va/yoki chiqish ma'lumoti Kafka klasterlarida saqlanadigan real vaqtli ilovalar va mikroxizmatlar yozish uchun **klient kutubxonasi**. U oddiy Java ilovasini yozish va joylashtirish soddaligini Kafka server tomonidagi klaster texnologiyasining afzalliklari bilan birlashtiradi.

KD (Streams Introduction) sanagan xususiyatlar:

- elastik, kengayuvchan, nosozlikka chidamli;
- konteyner, VM, oddiy server yoki bulutda ishlaydi;
- exactly-once semantikasi bor (13-bob);
- **alohida qayta ishlash klasteri kerak emas** — oddiy Java ilova.

### Topologiya (KD Streams Core Concepts)

| Atama | Ma'nosi |
| --- | --- |
| **Stream** | Cheksiz, doimiy yangilanadigan, tartiblangan, qayta o'qiladigan kalit-qiymat yozuvlar ketma-ketligi |
| **Processor topology** | Stream processorlar (tugunlar) va ularni bog'lovchi stream'lar (qirralar) grafi |
| **Source processor** | Topic'dan o'qib, oqim hosil qiladi |
| **Sink processor** | Natijani topic'ga yozadi |
| **DSL** | Tayyor amallar: `map`, `filter`, `join`, agregatsiya |
| **Processor API** | Past darajali: o'z processorlaringiz va holat omborlari |

Topologiya — mantiqiy tavsif. Ishlash paytida u parallel ishlov berish uchun ilova ichida nusxalanadi.

### KStream va KTable (KD → Duality of Streams and Tables)

| | Ma'nosi |
| --- | --- |
| **KStream** | Hodisalar oqimi — har yozuv mustaqil fakt |
| **KTable** | Jadval — har kalitning **oxirgi** qiymati |
| **Stream → jadval** | Stream — jadval o'zgarishlarining jurnali (changelog). Uni boshidan qayta o'ynash jadvalni tiklaydi. Stream'ni agregatsiya qilish jadval beradi |
| **Jadval → stream** | Jadval — stream'dagi har kalit oxirgi qiymatining bir lahzadagi surati |

Kafka bu ikkilikni ko'p joyda ishlatadi: log compaction (9-bob) va holat omborlarini nusxalash shular jumlasidan.

### WordCount (KD Quick Start)

```java
KStream<String, String> textLines = builder.stream("streams-plaintext-input", Consumed.with(stringSerde, stringSerde));
KTable<String, Long> wordCounts = textLines
    .flatMapValues(value -> Arrays.asList(value.toLowerCase().split("\\W+")))   // qatorni so'zlarga
    .groupBy((key, value) -> value)                                             // so'z — kalit
    .count();                                                                   // har so'z soni
wordCounts.toStream().to("streams-wordcount-output", Produced.with(Serdes.String(), Serdes.Long()));
```

Oddiy WordCount'dan farqi: kirish **cheksiz**. Dastur hech qachon "tugamaydi" — har yangi qator kelganda natijani yangilaydi.

## Buyruqlar va kod

VPS'da. Avval topologiyaning o'zini ko'ramiz — xuddi shu WordCount, faqat `describe()`:

```java
// WordCount topologiyasini qurib, Kafka Streams uni qanday bo'laklarga (sub-topology) ajratishini chiqaradi
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.*;
import java.util.Arrays;

public class Topologiya {
    public static void main(String[] a) {
        StreamsBuilder builder = new StreamsBuilder();
        KStream<String, String> textLines = builder.stream("streams-plaintext-input", Consumed.with(Serdes.String(), Serdes.String()));
        KTable<String, Long> wordCounts = textLines
            .flatMapValues(value -> Arrays.asList(value.toLowerCase().split("\\W+")))
            .groupBy((key, value) -> value)
            .count();
        wordCounts.toStream().to("streams-wordcount-output", Produced.with(Serdes.String(), Serdes.Long()));
        System.out.println(builder.build().describe());
    }
}
```

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic streams-plaintext-input && bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic streams-wordcount-output --config cleanup.policy=compact
Created topic streams-plaintext-input.
Created topic streams-wordcount-output.
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Topologiya.java 2>/dev/null
Topologies:
   Sub-topology: 0
    Source: KSTREAM-SOURCE-0000000000 (topics: [streams-plaintext-input])
      --> KSTREAM-FLATMAPVALUES-0000000001
    Processor: KSTREAM-FLATMAPVALUES-0000000001 (stores: [])
      --> KSTREAM-KEY-SELECT-0000000002
      <-- KSTREAM-SOURCE-0000000000
    Processor: KSTREAM-KEY-SELECT-0000000002 (stores: [])
      --> KSTREAM-FILTER-0000000006
      <-- KSTREAM-FLATMAPVALUES-0000000001
    Processor: KSTREAM-FILTER-0000000006 (stores: [])
      --> KSTREAM-SINK-0000000005
      <-- KSTREAM-KEY-SELECT-0000000002
    Sink: KSTREAM-SINK-0000000005 (topic: KSTREAM-AGGREGATE-STATE-STORE-0000000003-repartition)
      <-- KSTREAM-FILTER-0000000006

  Sub-topology: 1
    Source: KSTREAM-SOURCE-0000000007 (topics: [KSTREAM-AGGREGATE-STATE-STORE-0000000003-repartition])
      --> KSTREAM-AGGREGATE-0000000004
    Processor: KSTREAM-AGGREGATE-0000000004 (stores: [KSTREAM-AGGREGATE-STATE-STORE-0000000003])
      --> KTABLE-TOSTREAM-0000000008
      <-- KSTREAM-SOURCE-0000000007
    Processor: KTABLE-TOSTREAM-0000000008 (stores: [])
      --> KSTREAM-SINK-0000000009
      <-- KSTREAM-AGGREGATE-0000000004
    Sink: KSTREAM-SINK-0000000009 (topic: streams-wordcount-output)
      <-- KTABLE-TOSTREAM-0000000008
```

- Chiqish topic'i **compact** — natija changelog stream (KD).
- Topologiya **ikki bo'lak**ka (sub-topology) ajraldi. `groupBy` kalitni o'zgartirdi, shuning uchun yozuvlar yangi kalit bo'yicha qayta taqsimlanishi kerak. Kafka Streams buning uchun ichki **repartition** topic'ini qo'ydi: 0-bo'lak unga yozadi, 1-bo'lak undan o'qiydi.
- `KSTREAM-AGGREGATE` — `count()`, u **holat ombori** (state store) bilan ishlaydi (28-bob).

### Rasmiy demo

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && (KAFKA_HEAP_OPTS="-Xmx192m" bin/kafka-run-class.sh org.apache.kafka.streams.examples.wordcount.WordCountDemo > /root/wordcount.log 2>&1 &); sleep 25; printf 'all streams lead to kafka\nhello kafka streams\njoin kafka summit\n' | bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic streams-plaintext-input; sleep 45; bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic streams-wordcount-output --from-beginning --formatter-property print.key=true --formatter-property print.value=true --formatter-property key.deserializer=org.apache.kafka.common.serialization.StringDeserializer --formatter-property value.deserializer=org.apache.kafka.common.serialization.LongDeserializer --timeout-ms 8000 2>/dev/null
all	1
streams	1
lead	1
to	1
kafka	1
hello	1
kafka	2
streams	2
join	1
kafka	3
summit	1
```

Natija KD'dagi bilan aynan bir xil:

- har so'z birinchi uchraganda — 1;
- `kafka` keyingi qatorlarda 2, keyin 3 — har chiqish yozuvi bir kalitning **yangilangan** qiymati;
- bir kalitning keyingi yozuvi oldingisini almashtiradi — shuning uchun topic compact.

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --bootstrap-server localhost:9092 --list | grep -i -E 'streams|wordcount'
streams-plaintext-input
streams-wordcount-KSTREAM-AGGREGATE-STATE-STORE-0000000003-changelog
streams-wordcount-KSTREAM-AGGREGATE-STATE-STORE-0000000003-repartition
streams-wordcount-output
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-groups.sh --bootstrap-server localhost:9092 --list | grep -i wordcount
streams-wordcount      Classic                consumer               
$ pkill -f WordCountDemo; sleep 3; cd /opt/kafka-tgz/kafka_2.13-4.4.0 && for t in $(bin/kafka-topics.sh --bootstrap-server localhost:9092 --list | grep -E 'streams-|wordcount'); do bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done; bin/kafka-groups.sh --bootstrap-server localhost:9092 --list | grep -c wordcount
1
```

- Ilova o'zi yaratgan ichki topic'lar: `…-repartition` va `…-changelog` (holat omborining zaxira nusxasi). Nomlari `application.id` (`streams-wordcount`) bilan boshlanadi.
- Guruh `streams-wordcount` — `Classic` protokolda. Yangi `streams` protokoli (KIP-1071) — `group.protocol=streams` bilan yoqiladi: vazifalarni taqsimlash serverga o'tadi (KD Quick Start).

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Topic → o'zgartirish → topic | Kafka Streams DSL |
| O'ziga xos ishlov, holat bilan qo'lda ishlash | Processor API |
| Tashqi tizim bilan oddiy ko'chirish | Kafka Connect (25-bob) |
| Bitta xabarni yengil o'zgartirish | Connect SMT (26-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Streams uchun alohida klaster qidirish | Bu kutubxona — oddiy Java ilova (KD) | Ilova ichida |
| Chiqish topic'ini oddiy (delete) qilish | Natija changelog — har kalitning oxirgisi kerak (KD) | `cleanup.policy=compact` |
| Ichki topic'larni qo'lda o'chirish | Holat va qayta taqsimlash buziladi | Ilova vositasi orqali tozalash |
| Natijani "yakuniy" deb o'qish | Cheksiz kirish — har yozuv yangilanish (KD) | Kalit bo'yicha oxirgisi |

## Amaliyot

1. Kafka Streams nima va u qayerda ishlaydi?
2. KStream va KTable farqi nima?
3. Sinovdagi topologiya nega ikki bo'lakka bo'lindi?
4. Chiqish topic'ida `kafka` uchun nega uchta yozuv bor?
5. Ilova qanday ichki topic'larni yaratdi?

<details>
<summary>Javoblar</summary>

1. Kafka ma'lumoti bilan ishlaydigan ilovalar uchun klient kutubxona; oddiy Java ilova ichida.
2. KStream — mustaqil hodisalar oqimi; KTable — har kalitning oxirgi qiymati.
3. `groupBy` kalitni o'zgartirdi — yozuvlarni repartition topic orqali qayta taqsimlash kerak.
4. Har qator kelganda hisob yangilanib chiqadi: 1, 2, 3.
5. `…-repartition` va `…-changelog`.

</details>

## Rasmiy hujjat

- [KD: Streams Introduction](https://kafka.apache.org/44/streams/introduction/)
- [KD: Streams Quick Start](https://kafka.apache.org/44/streams/quickstart/)
- [KD: Streams Core Concepts](https://kafka.apache.org/44/streams/core-concepts/) — Stream Processing Topology, Duality of Streams and Tables
