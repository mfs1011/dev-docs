# 18 — Java'dan o'qish

[Mundarija](README.md)

## Tushuncha

Consumer API — `kafka-clients` kutubxonasi (KD API: `org.apache.kafka:kafka-clients:4.4.0`).

### Asosiy sinflar va metodlar (Javadoc: KafkaConsumer)

| Element | Vazifasi |
| --- | --- |
| `KafkaConsumer<K,V>` | Klaster'dan yozuv o'qiydigan klient |
| `subscribe(topics)` | Topic'larga obuna — partition'larni guruh beradi (15-bob). `assign(partitions)` — guruhsiz, qo'lda |
| `poll(Duration)` | Yangi yozuvlar — `ConsumerRecords`. Ma'lumot bo'lmasa shuncha kutadi |
| `commitSync()` / `commitAsync()` | Oxirgi `poll()` dagi o'rinni saqlash (16-bob) |
| `seek(partition, offset)` | Pozitsiyani o'zgartirish |
| `wakeup()` | Bloklangan `poll()` ni boshqa oqimdan uzish — `WakeupException` |
| `close()` | Guruhdan chiqish va resurslarni bo'shatish |
| Deserializer | Baytni kalit va qiymatga aylantiradi: `StringDeserializer` … |

### Ikkita pozitsiya (Javadoc)

- **Pozitsiya** — keyingi beriladigan yozuv offset'i. Ko'rilgan eng katta offset'dan bitta katta. Har `poll()` da o'zi siljiydi.
- **Committed pozitsiya** — oxirgi ishonchli saqlangan offset. Jarayon qulab qayta ishga tushsa, shu joydan davom etadi.
- Offset'lar ketma-ket bo'lishi kafolatlanmaydi: compact topic'larda va tranzaksiyalarda oraliq bo'ladi (9, 13-boblar).

### Oqimlar (Javadoc → Multi-threaded Processing)

Consumer **thread-safe emas** — bir nechta oqim ishlatsa, sinxronlash dasturchining zimmasida, aks holda `ConcurrentModificationException`. Yagona istisno — **`wakeup()`**. U boshqa oqimdan chaqirilsa, bloklangan amal `WakeupException` bilan uziladi — consumer'ni boshqa oqimdan to'xtatishning usuli shu. Javadoc oqimni `interrupt` qilishni tavsiya qilmaydi: u consumer'ning to'g'ri yopilishini buzishi mumkin.

## Buyruqlar va kod

VPS'da. Dastur `poll` siklida o'qiydi, har batch'dan keyin `commitSync`. SIGTERM (`kill`, `systemctl stop`) kelsa, shutdown hook `wakeup()` chaqiradi, sikl tugaydi va `close()` bajariladi:

```java
// Consumer API: subscribe, poll sikli, commitSync, deserializer'lar va wakeup() bilan to'g'ri to'xtatish
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.errors.WakeupException;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

public class Oquvchi {
    public static void main(String[] a) throws Exception {
        Properties p = new Properties();
        p.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        p.put(ConsumerConfig.GROUP_ID_CONFIG, "hisobot");
        p.put(ConsumerConfig.GROUP_PROTOCOL_CONFIG, "consumer");
        p.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "false");
        p.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        p.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        p.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());

        KafkaConsumer<String, String> c = new KafkaConsumer<>(p);   // thread-safe EMAS: faqat shu oqim ishlatadi
        AtomicBoolean yopilmoqda = new AtomicBoolean(false);
        Thread asosiy = Thread.currentThread();
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {    // SIGTERM (Ctrl-C, systemctl stop)
            System.out.println("signal keldi: wakeup()");
            yopilmoqda.set(true);
            c.wakeup();                                             // boshqa oqimdan chaqirsa bo'ladigan yagona metod
            try { asosiy.join(); } catch (InterruptedException e) { }
        }));
        try {
            c.subscribe(List.of("hodisalar"));
            while (!yopilmoqda.get()) {
                ConsumerRecords<String, String> rs = c.poll(Duration.ofSeconds(10));
                for (ConsumerRecord<String, String> r : rs)
                    System.out.printf("p%d@%d %s=%s%n", r.partition(), r.offset(), r.key(), r.value());
                if (!rs.isEmpty()) c.commitSync();                  // batch ishlangach — saqlash
            }
        } catch (WakeupException e) {
            if (!yopilmoqda.get()) throw e;
        } finally {
            c.close();                                              // guruhdan to'g'ri chiqish
            System.out.println("consumer yopildi");
        }
    }
}
```

### To'g'ri to'xtatish (SIGTERM)

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic hodisalar --partitions 2; printf 'a:1\nb:2\na:3\nc:4\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic hodisalar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:
Created topic hodisalar.
$ cd /root/kafka-java && (java -Xmx96m -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oquvchi.java > o.log 2>/dev/null &); sleep 20; pkill -TERM -f Oquvchi.java; sleep 5; cat o.log; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot 2>&1 | awk 'NF {print $1, $2, $3, $4, $5, $6, $7}' | column -t
p0@0 a=1
p0@1 b=2
p0@2 a=3
p0@3 c=4
signal keldi: wakeup()
consumer yopildi
Consumer  group      'hisobot'  has             no              active  members.
GROUP     TOPIC      PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG     CONSUMER-ID
hisobot   hodisalar  0          4               4               0       -
hisobot   hodisalar  1          0               0               0       -
```

- 4 yozuv o'qildi va commit qilindi.
- `kill -TERM` → shutdown hook → `wakeup()` → `close()`. Guruhda **darhol** faol a'zo qolmadi, partition 0 da lag 0.

### Majburan o'ldirish (SIGKILL)

```text vps
$ cd /root/kafka-java && (java -Xmx96m -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Oquvchi.java > o.log 2>/dev/null &); sleep 20; pkill -KILL -f Oquvchi.java; sleep 5; cat o.log; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot --members 2>&1 | awk 'NF {print $2, $3, $4, $5}' | column -t; rm -f o.log
CONSUMER-ID             HOST         CLIENT-ID           #PARTITIONS
1C3IXYiQQUOEBJF0TXHMmg  /172.17.0.1  consumer-hisobot-1  2
$ sleep 50; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot --members 2>&1 | grep -v '^$'
Consumer group 'hisobot' has no active members.
GROUP           CONSUMER-ID     HOST            CLIENT-ID       #PARTITIONS     
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group hisobot; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic hodisalar
Deletion of requested consumer groups ('hisobot') was successful.
```

- `kill -KILL` da shutdown hook ishlamaydi, `close()` chaqirilmaydi. Yangi yozuv yo'q edi, shuning uchun hech narsa chiqmadi.
- O'ldirilgan a'zo 5 soniyadan keyin ham guruhda turibdi, ikkala partition'i bilan. U guruhdan faqat sessiya muddati o'tgach chiqdi (keyingi tekshiruvda — "no active members"). Shu vaqt ichida uning partition'lari **hech kimga** berilmaydi — hodisalar o'qilmay turadi.

## Variantlar

| Holat | Usul |
| --- | --- |
| Odatiy xizmat | `subscribe` + `poll` sikli + batch'dan keyin `commitSync` |
| To'xtatish | Shutdown hook'da `wakeup()`, `finally` da `close()` |
| Ko'p oqimli ishlov | Har oqimga o'z consumer'i yoki bitta consumer + ishlov navbati |
| Guruhsiz, aniq partition | `assign()` + `seek()` |
| Qayta ishga tushganda partition'lar o'sha nusxada qolsin | `group.instance.id` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Bitta consumer'ni bir nechta oqimda ishlatish | Thread-safe emas — `ConcurrentModificationException` (Javadoc) | Har oqimga o'z consumer'i |
| `close()` siz chiqish | A'zo sessiya tugaguncha guruhda qoladi, partition'lar o'qilmaydi (sinovda) | `finally { close(); }` |
| To'xtatish uchun `Thread.interrupt()` | To'g'ri yopilishni buzishi mumkin (Javadoc) | `wakeup()` |
| `poll()` ni uzoq bloklovchi ish bilan aralashtirish | `max.poll.interval.ms` dan oshsa — guruhdan chiqariladi (14-bob) | Ishlovni tezlashtirish yoki bo'lish |

## Amaliyot

1. Consumer'ning qaysi metodini boshqa oqimdan chaqirish mumkin?
2. Pozitsiya va committed pozitsiya farqi nima?
3. Sinovda SIGTERM va SIGKILL'dan keyin guruh holati qanday farq qildi?
4. Nega `close()` muhim?

<details>
<summary>Javoblar</summary>

1. Faqat `wakeup()`.
2. Pozitsiya — keyingi beriladigan offset (xotirada); committed — ishonchli saqlangan, qayta ishga tushganda shundan davom etadi.
3. SIGTERM'da a'zo darhol chiqdi; SIGKILL'da sessiya muddati tugaguncha guruhda qoldi.
4. Guruhdan darhol chiqadi — partition'lari boshqa a'zoga tez o'tadi; resurslar bo'shaydi.

</details>

## Rasmiy hujjat

- [KD: API → Consumer API](https://kafka.apache.org/44/apis/)
- [Javadoc: KafkaConsumer](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html) — Offsets and Consumer Position, Multi-threaded Processing
- [KD: Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/)
