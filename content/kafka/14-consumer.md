# 14 — Consumer qanday o'qiydi

[Mundarija](README.md)

## Tushuncha

### Pull modeli (KD Design → The Consumer)

Consumer o'qiyotgan partition'lar liderlariga **fetch** so'rovlari yuboradi. Har so'rovda u log'dagi offset'ini beradi va shu joydan boshlangan bo'lakni oladi. Pozitsiya consumer qo'lida — kerak bo'lsa orqaga qaytib qayta o'qiy oladi.

Kafka an'anaviy yo'lni tanlagan: producer broker'ga **yuboradi** (push), consumer broker'dan **o'zi oladi** (pull).

| Push (broker yuboradi) | Pull (consumer oladi) — Kafka |
| --- | --- |
| Tezlikni broker belgilaydi — har xil consumer'lar bilan qiyin | Har consumer o'z tezligida; ulgurmasa, o'zi yetib oladi |
| Darhol yuborish yoki kutish kerak — consumer tayyorligini bilmasdan | Consumer joriy pozitsiyadan keyingi **hammasini** (yoki belgilangan hajmgacha) oladi — batch'lash optimal |

Oddiy pull'ning kamchiligi: ma'lumot yo'q bo'lsa, consumer bo'sh siklda aylanaveradi. Shuning uchun so'rov **"long poll"** bo'ladi — ma'lumot kelguncha kutadi.

### Sozlamalar (KD Consumer Configs)

| Sozlama | Standart | Ma'nosi |
| --- | --- | --- |
| `fetch.min.bytes` | 1 | Server javob berishdan oldin kamida shuncha ma'lumot to'plashini kutadi |
| `fetch.max.wait.ms` | 500 | `fetch.min.bytes` ga yetmasa, server ko'pi bilan shuncha kutadi |
| `max.poll.records` | 500 | Bitta `poll()` qaytaradigan eng ko'p yozuv. Fetch'ning o'ziga ta'sir qilmaydi: ortiqcha yozuvlar keshda turadi, keyingi `poll()` larda beriladi |
| `max.poll.interval.ms` | 300000 (5 daqiqa) | `poll()` chaqiriqlari orasidagi eng ko'p vaqt. Oshib ketsa, consumer ishdan chiqqan hisoblanadi va guruh partition'larni qayta taqsimlaydi |
| **`auto.offset.reset`** | `latest` | Guruhda saqlangan offset yo'q bo'lsa (yoki u o'chirilgan ma'lumotga ishora qilsa) qayerdan boshlash |

`auto.offset.reset` qiymatlari:

- `earliest` — eng boshidan;
- `latest` — eng oxiridan, ya'ni faqat yangilari;
- `by_duration:<ISO8601>` — hozirdan shuncha vaqt oldingi joydan (masalan, `by_duration:PT1H`);
- `none` — consumer'ga xato tashlanadi.

### Pozitsiya

`position(partition)` — consumer'ning keyingi o'qiydigan offset'i (7-bob). `poll()` qaytargan yozuvlar ortidan siljiydi. U **saqlangan** (committed) offset bilan bir xil emas — saqlash 16-bob mavzusi.

## Buyruqlar va kod

VPS'da (Java 25). Dastur 5 marta `poll(2 soniya)` qiladi va har safar yozuvlar soni va pozitsiyani chiqaradi. Topic'da 1200 yozuv:

```java
// Pull modeli: poll() har chaqiriqda nechta yozuv qaytaradi, consumer pozitsiyasi va auto.offset.reset
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;

public class Oqish {
    public static void main(String[] a) {
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("group.id", a[0]);
        p.put("auto.offset.reset", a[1]);
        p.put("enable.auto.commit", "false");
        p.put("key.deserializer", StringDeserializer.class.getName());
        p.put("value.deserializer", StringDeserializer.class.getName());
        TopicPartition tp = new TopicPartition("oqish", 0);
        try (KafkaConsumer<String, String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("oqish"));
            for (int i = 1; i <= 5; i++) {
                long t0 = System.currentTimeMillis();
                ConsumerRecords<String, String> r = c.poll(Duration.ofSeconds(2));
                long ms = System.currentTimeMillis() - t0;
                String pos = c.assignment().contains(tp) ? String.valueOf(c.position(tp)) : "-";
                System.out.printf("poll %d: %d yozuv, ~%s ms, pozitsiya %s%n", i, r.count(), ms < 1000 ? "<1000" : "2000", pos);
            }
        } catch (Exception e) {
            System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
    }
}
```

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic oqish; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic oqish --num-records 1200 --record-size 100 --throughput -1 --command-property bootstrap.servers=localhost:9092 >/dev/null 2>&1; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic oqish
Created topic oqish.
oqish:0:1200
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oqish.java g-earliest earliest 2>/dev/null
poll 1: 0 yozuv, ~2000 ms, pozitsiya -
poll 2: 0 yozuv, ~2000 ms, pozitsiya -
poll 3: 500 yozuv, ~<1000 ms, pozitsiya 500
poll 4: 500 yozuv, ~<1000 ms, pozitsiya 1000
poll 5: 200 yozuv, ~<1000 ms, pozitsiya 1200
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oqish.java g-latest latest 2>/dev/null
poll 1: 0 yozuv, ~2000 ms, pozitsiya -
poll 2: 0 yozuv, ~2000 ms, pozitsiya -
poll 3: 0 yozuv, ~2000 ms, pozitsiya 1200
poll 4: 0 yozuv, ~2000 ms, pozitsiya 1200
poll 5: 0 yozuv, ~2000 ms, pozitsiya 1200
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oqish.java g-none none 2>/dev/null
poll 1: 0 yozuv, ~2000 ms, pozitsiya -
NoOffsetForPartitionException: Undefined offset with no reset policy for partitions: [oqish-0]
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic oqish
```

- **earliest**: dastlabki ikki `poll()` — 0 yozuv, 2 soniyadan. Consumer avval guruhga qo'shilib, partition oladi, shu vaqtda pozitsiya hali yo'q (`-`). Keyin 500, 500, 200 — `max.poll.records=500`, pozitsiya 500 → 1000 → 1200.
- **latest**: partition olindi, pozitsiya darhol **1200** (log oxiri). Eski 1200 yozuvning birortasi o'qilmadi, har `poll()` 2 soniya kutib bo'sh qaytdi — "long poll".
- **none**: saqlangan offset yo'q — `NoOffsetForPartitionException`.
- Bu guruhlar yangi bo'lgani uchun `auto.offset.reset` ishladi. Offset saqlangan guruh saqlangan joyidan davom etadi (7-bob).

## Variantlar

| Kerak | Sozlama |
| --- | --- |
| Yangi guruh hammasini o'qisin | `auto.offset.reset=earliest` |
| Yangi guruh faqat yangilarini | `latest` (standart) |
| Yangi guruh oxirgi 1 soatni | `by_duration:PT1H` |
| Offset yo'qligi xato bo'lsin | `none` |
| Kamroq so'rov, kattaroq bo'laklar | `fetch.min.bytes` ↑, `fetch.max.wait.ms` |
| Har yozuvni ishlash uzoq | `max.poll.records` ↓ yoki `max.poll.interval.ms` ↑ |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Yangi guruh eski yozuvlarni ham o'qiydi deb kutish | Standart — `latest` (sinovda 0 yozuv) | `earliest` |
| `poll()` ni uzoq ish ichida kam chaqirish | `max.poll.interval.ms` dan oshsa — guruh partition'larni boshqasiga beradi (KD) | Kichik batch, tez ishlov |
| Birinchi `poll()` bo'sh — "Kafka ishlamayapti" deb o'ylash | Avval guruhga qo'shilish va partition olish (sinovda 2 ta bo'sh poll) | Siklda `poll()` |
| `max.poll.records` tarmoq so'rovini kichraytiradi deb o'ylash | Faqat `poll()` qaytarishini cheklaydi (KD) | `fetch.*` sozlamalari |

## Amaliyot

1. Kafka nega pull modelini tanlagan?
2. "Long poll" nima uchun kerak?
3. `auto.offset.reset` qachon ishlaydi?
4. Sinovda `latest` guruhi nega bitta ham yozuv olmadi?
5. `max.poll.interval.ms` oshib ketsa nima bo'ladi?

<details>
<summary>Javoblar</summary>

1. Har consumer o'z tezligida o'qiydi va batch'lash optimal bo'ladi.
2. Ma'lumot yo'q paytda bo'sh siklda aylanmaslik uchun — so'rov ma'lumot kelguncha kutadi.
3. Guruhda saqlangan offset bo'lmaganda yoki u mavjud bo'lmagan ma'lumotga ishora qilganda.
4. Pozitsiya log oxiriga (1200) qo'yildi, yangi yozuv kelmadi.
5. Consumer ishdan chiqqan hisoblanadi, partition'lari boshqasiga beriladi.

</details>

## Rasmiy hujjat

- [KD: Design → The Consumer](https://kafka.apache.org/44/design/design/)
- [KD: Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/)
