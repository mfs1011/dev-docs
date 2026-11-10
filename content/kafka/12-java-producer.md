# 12 — Java'dan hodisa yuborish

[Mundarija](README.md)

## Tushuncha

Producer API — `kafka-clients` kutubxonasi (KD API: Maven'da `org.apache.kafka:kafka-clients:4.4.0`).

### Asosiy sinflar (KD Javadoc: KafkaProducer)

| Sinf | Vazifasi |
| --- | --- |
| `KafkaProducer<K,V>` | Klaster'ga yozuv yuboruvchi klient. Sozlamalar `Properties` yoki `Map` bilan beriladi |
| `ProducerRecord<K,V>` | Bitta yozuv: topic, (partition), kalit, qiymat, (vaqt), header'lar |
| `RecordMetadata` | Natija: topic, partition, offset, vaqt belgisi |
| `Callback` | `onCompletion(metadata, exception)` — yuborish tasdiqlanganda yoki xato bo'lganda |
| Serializer | Kalit va qiymatni baytga aylantiradi: `StringSerializer`, `ByteArraySerializer` … |

### Javadoc'dagi muhim qoidalar

- Producer **thread-safe**: bitta nusxani oqimlar orasida baham ko'rish odatda bir nechta nusxadan **tezroq**.
- Producer'da yuborilmagan yozuvlar **buferi** va ularni so'rovga aylantiradigan fon **I/O oqimi** bor. Ishlatilgandan keyin **yopilmasa**, bu resurslar "oqib ketadi". KafkaProducer yaratilgandan keyin har doim `close()` qilinishi kerak.
- `send()` **asinxron**: yozuvni buferga qo'yadi va darhol qaytadi — yozuvlar batch'larga yig'iladi. Bloklanishi mumkin bo'lgan ikki holat:
  - topic'ga birinchi yuborishda metama'lumotni kutish (`max.block.ms` gacha);
  - buferda bo'sh joy yo'q bo'lganda.
- Natija `Future<RecordMetadata>`: `get()` — so'rov tugaguncha **kutadi** (sinxron); to'liq bloklamaydigan usul — `Callback`.
- `acks=0` da `RecordMetadata` offset'i `-1`.
- `close(Duration)` — tugallanmagan so'rovlar tugashini belgilangan vaqtgacha kutadi.

## Buyruqlar va kod

VPS'da, Java 25, `kafka-clients` 4.4.0:

```java
// Producer API: KafkaProducer, ProducerRecord (kalit, qiymat, header), callback va Future, producer'ni yopish
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.nio.charset.StandardCharsets;
import java.util.Properties;

public class Buyurtma {
    public static void main(String[] a) throws Exception {
        Properties p = new Properties();
        p.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        p.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        p.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        p.put(ProducerConfig.LINGER_MS_CONFIG, "100");

        if (a[0].equals("yopmasdan")) {               // xato: producer yopilmaydi, dastur darhol chiqadi
            KafkaProducer<String, String> pr = new KafkaProducer<>(p);
            for (int i = 1; i <= 3; i++) pr.send(new ProducerRecord<>("buyurtmalar", "mijoz-" + i, "{\"summa\":" + i * 100 + "}"));
            System.out.println("3 ta send() chaqirildi, close() siz chiqyapmiz");
            System.exit(0);
        }

        try (KafkaProducer<String, String> pr = new KafkaProducer<>(p)) {   // try-with-resources: oxirida close()
            for (int i = 1; i <= 3; i++) {
                ProducerRecord<String, String> r = new ProducerRecord<>("buyurtmalar", "mijoz-" + i, "{\"summa\":" + i * 100 + "}");
                r.headers().add("manba", "veb".getBytes(StandardCharsets.UTF_8));
                pr.send(r, (m, e) -> {                // callback: producer'ning I/O oqimida chaqiriladi
                    if (e != null) System.out.println("xato: " + e);
                    else System.out.printf("callback: %s-%d @ offset %d%n", m.topic(), m.partition(), m.offset());
                });
            }
            RecordMetadata m = pr.send(new ProducerRecord<>("buyurtmalar", "mijoz-9", "{\"summa\":900}")).get();  // sinxron
            System.out.printf("get(): offset %d%n", m.offset());
        }
        System.out.println("producer yopildi");
    }
}
```

### To'g'ri: callback, `get()` va `close()`

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic buyurtmalar --partitions 3
Created topic buyurtmalar.
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Buyurtma.java togri 2>/dev/null
callback: buyurtmalar-2 @ offset 0
callback: buyurtmalar-2 @ offset 1
callback: buyurtmalar-0 @ offset 0
get(): offset 0
producer yopildi
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic buyurtmalar --from-beginning --bootstrap-server localhost:9092 --max-messages 4 --formatter-property print.key=true --formatter-property print.headers=true --formatter-property print.partition=true 2>&1 | grep -v KIP-848 | sort
Partition:0	manba:veb	mijoz-3	{"summa":300}
Partition:1	NO_HEADERS	mijoz-9	{"summa":900}
Partition:2	manba:veb	mijoz-1	{"summa":100}
Partition:2	manba:veb	mijoz-2	{"summa":200}
Processed a total of 4 messages
$ docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic buyurtmalar | awk -F: '{s+=$3} END {print "jami:", s}'
jami: 4
```

- Uchta yozuv asinxron yuborildi: callback'lar partition va offset'ni chiqardi. Bir xil kalit bir partition'ga tushdi: `mijoz-1`, `mijoz-2` — 2, `mijoz-3` — 0.
- `get()` — sinxron kutish, natijada offset.
- `manba:veb` header yozuv bilan birga saqlandi. Header'siz yozuvda — `NO_HEADERS`.
- `try`-with-resources oxirida `close()` buferdagi hamma narsani yubordi — 4 ta yozuv.

### Xato: yopmasdan chiqish

```text vps
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Buyurtma.java yopmasdan 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic buyurtmalar | awk -F: '{s+=$3} END {print "jami:", s}'
3 ta send() chaqirildi, close() siz chiqyapmiz
jami: 4
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic buyurtmalar
```

Uchta `send()` chaqirildi, lekin dastur `close()` (yoki `flush()`) siz chiqdi. Topic'dagi yozuvlar soni o'zgarmadi — **4**. Yozuvlar producer buferida qoldi (`linger.ms=100` — hali yuborilmagan edi) va jarayon bilan birga **yo'qoldi**.

## Variantlar

| Holat | Usul |
| --- | --- |
| Ko'p yozuv, yuqori tezlik | `send(record, callback)` |
| Har yozuvni tasdiqlab borish (sekin) | `send(record).get()` |
| Dastur tugashi | `close()` yoki `close(Duration)` |
| Muayyan nuqtada hammasi yuborilsin | `flush()` |
| Ko'p oqimli ilova | Bitta umumiy `KafkaProducer` |
| JSON, Avro va boshqalar | Mos serializer (yoki baytga o'zingiz aylantirish) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Producer'ni yopmaslik | Buferdagi yozuvlar yo'qoladi (sinovda), resurslar oqadi (Javadoc) | `close()`, try-with-resources |
| Har so'rovga yangi producer | Batch yo'q, ulanishlar ko'p; bitta nusxa tezroq (Javadoc) | Bitta uzoq yashaydigan producer |
| Har `send()` dan keyin `get()` | Batch'lar yig'ilmaydi, sekin | Callback |
| Callback ichida uzoq ish | Callback producer'ning I/O oqimida bajariladi — boshqa yuborishlarni ushlab turadi | Callback'da qisqa ish, og'irini boshqa oqimga |
| Callback'dagi `exception` ni tekshirmaslik | Yuborish xatosi sezilmaydi | `if (e != null)` |

## Amaliyot

1. `send()` qachon qaytadi va qachon bloklanishi mumkin?
2. `get()` va callback farqi nima?
3. Sinovda `close()` siz chiqqanda nima bo'ldi va nega?
4. Ko'p oqimli ilovada nechta producer kerak?

<details>
<summary>Javoblar</summary>

1. Yozuv buferga qo'yilgach darhol; birinchi yuborishda metama'lumot kutilganda va buferda joy bo'lmaganda bloklanadi.
2. `get()` — natija kelguncha kutadi (sinxron); callback — natija kelganda chaqiriladi, kutilmaydi.
3. 3 yozuv yo'qoldi — ular producer buferida qolgan edi.
4. Odatda bitta — producer thread-safe va umumiy nusxa tezroq.

</details>

## Rasmiy hujjat

- [KD: API → Producer API](https://kafka.apache.org/44/apis/)
- [Javadoc: KafkaProducer](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html)
- [KD: Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/)
