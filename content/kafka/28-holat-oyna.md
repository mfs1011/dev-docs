# 28 — Holat, vaqt va oynalar

[Mundarija](README.md)

## Tushuncha

### Vaqt turlari (KD Streams Core Concepts → Time)

| Vaqt | Ma'nosi | Misol |
| --- | --- | --- |
| **Event time** (hodisa vaqti) | Hodisa manbada **sodir bo'lgan** payt | GPS sensori joyni o'lchagan vaqt |
| **Ingestion time** | Broker yozuvni topic partition'iga **yozgan** payt | — |
| **Processing time** | Streams ilovasi yozuvni **ishlagan** payt | Bir necha millisoniya, soat yoki kun keyin |

Event time yoki ingestion time — Kafka sozlamasi (topic yoki broker) bilan tanlanadi: yozuvlar vaqt belgisi bilan saqlanadi (4-bob). Kafka Streams har yozuvga `TimestampExtractor` orqali vaqt beradi. Bu vaqtlar oqimning vaqt bo'yicha qayerdaligini bildiradi — **stream time**. U faqat yangi yozuv kelganda siljiydi, devordagi soat bilan emas.

### Holat (KD → States)

Ba'zi ishlovlar holatsiz: har xabar boshqalardan mustaqil. Lekin birlashtirish (join), guruhlash va agregatsiya **holat** talab qiladi. Kafka Streams **state store** (holat ombori) beradi: persistent kalit-qiymat ombori, xotiradagi hashmap va boshqalar. Har vazifada (task) bir yoki bir nechta ombor bor. Ular changelog topic orqali nusxalanadi va nosozlikda tiklanadi (27-bobdagi `…-changelog`). **Interactive Queries** — omborni tashqaridan faqat o'qish.

### Agregatsiya va oynalar (KD; DSL API → Windowing)

Agregatsiya (`count`, `sum` …) kirish oqimidan doim **KTable** hosil qiladi. Shu sababli tartibsiz kelgan yozuv uchun yangi qiymat chiqarish mumkin.

**Oyna** — bir kalitli yozuvlarni vaqt bo'yicha guruhlash. Oynalar har kalit uchun alohida yuritiladi.

| Oyna | Xatti-harakat | Tavsif |
| --- | --- | --- |
| Hopping | Vaqt bo'yicha | Belgilangan o'lcham, bir-biri ustiga chiqadi |
| **Tumbling** | Vaqt bo'yicha | Belgilangan o'lcham, ustma-ust tushmaydi, orasida bo'shliq yo'q. Epoch'ga tekislangan: pastki chegara kiradi, yuqorisi kirmaydi |
| Sliding | Vaqt bo'yicha | Belgilangan o'lcham, yozuvlar vaqt belgilari farqiga qarab |
| Session | Sessiya | O'lchami dinamik, ma'lumotga qarab |

**Grace period** — tartibsiz (kechikkan) yozuvlarni oyna uchun qancha kutish. Grace tugagach kelgan yozuv **tashlab yuboriladi** va o'sha oynada hisoblanmaydi.

Oynali natijalar uzluksiz yangilanadi: har yangi ma'lumotda yangi natija chiqadi. Faqat oyna yopilgandagi **yakuniy** natija kerak bo'lsa — `suppress` (KD: Window Final Results).

### Qayta ishlash kafolati (KD → Processing Guarantees)

`processing.guarantee`: standart `at_least_once`. `exactly_once_v2` — o'qilgan har yozuvning natijasi chiqish topic'larida va holat omborlarida **aynan bir marta** aks etadi. Mexanizmi — tranzaksiyalar (13-bob).

## Buyruqlar va kod

VPS'da, Java 25. Haqiqiy broker o'rniga Kafka'ning rasmiy test vositasi **`TopologyTestDriver`** (`kafka-streams-test-utils`) ishlatildi. U topologiyani deterministik ishlatadi va har yozuvga aniq vaqt berish mumkin. Klik hisobi: 1 daqiqalik tumbling oyna, grace 30 soniya:

```java
// Tumbling oyna (1 daqiqa) va grace period (30 s): hodisa vaqti bo'yicha hisob, kechikkan yozuvlar. TopologyTestDriver — broker'siz.
import org.apache.kafka.common.serialization.*;
import org.apache.kafka.streams.*;
import org.apache.kafka.streams.kstream.*;
import java.time.*;
import java.util.Properties;

public class Oyna {
    static final Instant T0 = Instant.parse("2026-11-11T10:00:00Z");
    public static void main(String[] a) {
        StreamsBuilder b = new StreamsBuilder();
        b.stream("kliklar", Consumed.with(Serdes.String(), Serdes.String()))
         .groupByKey()
         .windowedBy(TimeWindows.ofSizeAndGrace(Duration.ofMinutes(1), Duration.ofSeconds(30)))
         .count(Materialized.as("klik-soni"))                       // holat ombori nomi
         .toStream()
         .map((k, v) -> KeyValue.pair(k.key() + " @ " + LocalTime.ofInstant(k.window().startTime(), ZoneOffset.UTC), v))
         .to("natija", Produced.with(Serdes.String(), Serdes.Long()));

        Properties p = new Properties();
        p.put(StreamsConfig.APPLICATION_ID_CONFIG, "oyna-sinov");
        p.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "test:9092");          // TopologyTestDriver haqiqiy broker'ga ulanmaydi
        p.put(StreamsConfig.STATESTORE_CACHE_MAX_BYTES_CONFIG, 0);           // har yangilanishni darhol chiqarish
        try (TopologyTestDriver d = new TopologyTestDriver(b.build(), p)) {
            TestInputTopic<String, String> in = d.createInputTopic("kliklar", new StringSerializer(), new StringSerializer());
            TestOutputTopic<String, Long> out = d.createOutputTopic("natija", new StringDeserializer(), new LongDeserializer());
            Object[][] kliklar = { {"ali", 10}, {"ali", 20}, {"vali", 50}, {"ali", 70}, {"ali", 40}, {"vali", 100}, {"ali", 30} };
            for (Object[] k : kliklar) {
                Instant t = T0.plusSeconds((Integer) k[1]);
                in.pipeInput((String) k[0], "klik", t);
                System.out.printf("kirdi: %-4s %s -> %s%n", k[0], LocalTime.ofInstant(t, ZoneOffset.UTC),
                    out.isEmpty() ? "chiqish yo'q (tashlandi)" : String.join(", ", out.readKeyValuesToList().stream().map(kv -> kv.key + "=" + kv.value).toList()));
            }
        }
    }
}
```

```text vps
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oyna.java 2>/dev/null
kirdi: ali  10:00:10 -> ali @ 10:00=1
kirdi: ali  10:00:20 -> ali @ 10:00=2
kirdi: vali 10:00:50 -> vali @ 10:00=1
kirdi: ali  10:01:10 -> ali @ 10:01=1
kirdi: ali  10:00:40 -> ali @ 10:00=3
kirdi: vali 10:01:40 -> vali @ 10:01=1
kirdi: ali  10:00:30 -> chiqish yo'q (tashlandi)
```

| Kirish (hodisa vaqti) | Stream time | Natija | Nega |
| --- | --- | --- | --- |
| ali 10:00:10, 10:00:20 | 10:00:20 | `ali @ 10:00` = 1, 2 | 10:00 oynasi |
| vali 10:00:50 | 10:00:50 | `vali @ 10:00` = 1 | Har kalitning o'z oynasi |
| ali 10:01:10 | 10:01:10 | `ali @ 10:01` = 1 | Yangi oyna |
| ali **10:00:40** (kechikkan) | 10:01:10 | `ali @ 10:00` = **3** | 10:00 oynasi 10:01:00 da yopiladi, grace 10:01:30 gacha — hali qabul qilinadi |
| vali 10:01:40 | **10:01:40** | `vali @ 10:01` = 1 | Stream time grace chegarasidan o'tdi |
| ali **10:00:30** (kechikkan) | 10:01:40 | **chiqish yo'q** | 10:00 oynasining grace'i tugagan — tashlandi |

Oxirgi ikki qator farqini **stream time** belgiladi, ya'ni oxirgi kelgan yozuvlarning vaqti, devordagi soat emas.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Har daqiqa/soat statistikasi | Tumbling oyna |
| "Oxirgi 5 daqiqa, har daqiqada" | Hopping oyna |
| Foydalanuvchi faolligi seanslari | Session oyna |
| Kechikkan ma'lumotlar | Yetarli grace period |
| Faqat yakuniy natija | `suppress` (Window Final Results) |
| Exactly-once | `processing.guarantee=exactly_once_v2` |
| Topologiyani broker'siz sinash | `TopologyTestDriver` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Processing time bilan oynalash | Kechikish natijani buzadi | Event time |
| Grace'siz yoki juda qisqa grace | Kechikkan yozuvlar tashlanadi (KD, sinovda) | Kechikishga mos grace |
| Oynali natijani yakuniy deb o'qish | Har yangi yozuv natijani yangilaydi (KD) | `suppress` yoki oxirgi qiymat |
| Holat omborlarini oddiy xotira deb hisoblash | Changelog orqali tiklanadi, diskda ham bo'ladi | Disk va changelog topic'ini rejalash |

## Amaliyot

1. Event time, ingestion time va processing time farqi nima?
2. Stream time qachon siljiydi?
3. Agregatsiya natijasi nega KTable?
4. Sinovda 10:00:40 dagi kechikkan klik nega hisoblandi, 10:00:30 dagisi esa yo'q?
5. Exactly-once Kafka Streams'da qanday yoqiladi?

<details>
<summary>Javoblar</summary>

1. Hodisa sodir bo'lgan, broker yozgan va ilova ishlagan vaqtlar.
2. Faqat yangi yozuv kelganda.
3. Tartibsiz kelgan yozuv uchun yangilangan qiymat chiqarish mumkin bo'lishi uchun.
4. Birinchisi grace (10:01:30 gacha) ichida keldi; ikkinchisi kelganda stream time 10:01:40 edi — grace tugagan.
5. `processing.guarantee=exactly_once_v2`.

</details>

## Rasmiy hujjat

- [KD: Streams Core Concepts](https://kafka.apache.org/44/streams/core-concepts/) — Time, States, Aggregations, Windowing, Processing Guarantees
- [KD: Streams DSL API](https://kafka.apache.org/44/streams/developer-guide/dsl-api/) — Windowing, Window Final Results
