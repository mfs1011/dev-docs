# 10 — Producer qanday yuboradi

[Mundarija](README.md)

## Tushuncha

### Kichik amallar muammosi (KD Design → Efficiency)

Diskka kirish naqshlari to'g'rilangandan keyin samarasizlikning ikki sababi qoladi: juda ko'p **kichik I/O amallari** va ortiqcha **bayt nusxalash**. Kafka protokoli xabarlarni guruhlaydigan **message set** (batch) atrofida qurilgan:

- tarmoq so'rovi bir xabar emas, **guruh** olib boradi — har so'rovning qo'shimcha xarajati xabarlarga bo'linadi;
- server log'ga bir yo'la bo'lak yozadi, consumer katta chiziqli bo'laklarni oladi.

KD: bu oddiy optimallashtirish **ko'p barobar** tezlashtiradi. Producer, broker va consumer bir xil ikkilik formatni ishlatadi — ma'lumot o'zgartirilmasdan uzatiladi.

### Producer batch'lari (KD Design → The Producer, Producer Configs)

Producer ma'lumotni xotirada **to'playdi** va kattaroq batch'larni bitta so'rovda yuboradi. Batch belgilangan hajmdan oshmasligi va belgilangan vaqtdan ortiq kutmasligi mumkin (masalan, 64 kB yoki 10 ms).

| Sozlama | Standart | Ma'nosi |
| --- | --- | --- |
| `batch.size` | 16384 (16 KB) | Bitta partition uchun batch hajmi (bayt). Kichik — batch'lar kam, o'tkazuvchanlik pasayishi mumkin |
| `linger.ms` | 5 | Batch to'lishini qancha kutish. Odatda batch faqat yuklama ostida yig'iladi; `linger.ms` — sun'iy kichik kechikish: so'rovlar kamayadi |
| `buffer.memory` | 33554432 (32 MB) | Yuborilmagan yozuvlar uchun xotira. Yozuvlar yuborilganidan tezroq kelsa, `send()` `max.block.ms` gacha kutadi, keyin xato |
| `compression.type` | `none` | `gzip`, `snappy`, `lz4`, `zstd`. **To'liq batch** siqiladi: batch qancha katta — siqish shuncha yaxshi |

### Batch siqish (KD Design → End-to-end Batch Compression)

Ba'zan cheklov CPU yoki disk emas, **tarmoq**. Har xabarni alohida siqish yomon natija beradi: ortiqchalikning ko'pi xabarlar orasidagi takrordan (JSON'dagi maydon nomlari kabi). Kafka **butun batch**'ni siqadi. Broker uni tekshirish uchun ochadi, lekin diskka **siqilgan holda** yozadi va consumer'ga ham shunday uzatadi. Ochish — consumer'da.

### Asinxron yuborish

`send()` yozuvni producer buferiga qo'yadi va natijani kutmaydi. Natija — **callback** yoki `Future` orqali (12-bob). `flush()` — buferdagi hammasi yuborilguncha kutish.

## Buyruqlar va kod

VPS'da, Java 25 (`kafka-clients` 4.4.0 — Kafka arxividagi `libs/`). Dastur 20000 ta o'xshash JSON xabar yuboradi va producer metrikalarini chiqaradi:

```java
// Producer batch'lari: linger.ms, batch.size va compression.type ta'sirini producer metrikalaridan ko'rish
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Toplab {
    public static void main(String[] a) throws Exception {
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("key.serializer", StringSerializer.class.getName());
        p.put("value.serializer", StringSerializer.class.getName());
        p.put("linger.ms", a[0]);
        p.put("batch.size", a[1]);
        p.put("compression.type", a[2]);
        int n = Integer.parseInt(a[3]);
        AtomicInteger tasdiq = new AtomicInteger();
        long t0 = System.nanoTime();
        try (KafkaProducer<String, String> pr = new KafkaProducer<>(p)) {
            for (int i = 0; i < n; i++) {
                String qiymat = "{\"buyurtma\":" + i + ",\"holat\":\"yaratildi\",\"mijoz\":\"mijoz-" + (i % 50) + "\"}";
                pr.send(new ProducerRecord<>("toplam", qiymat), (m, e) -> { if (e == null) tasdiq.incrementAndGet(); });
            }
            pr.flush();
            long jami = (System.nanoTime() - t0) / 1_000_000;
            Map<String, Double> m = new TreeMap<>();
            pr.metrics().forEach((k, v) -> {
                if (k.group().equals("producer-metrics") && Set.of("batch-size-avg", "records-per-request-avg", "compression-rate-avg", "request-total").contains(k.name()))
                    m.put(k.name(), ((Number) v.metricValue()).doubleValue());
            });
            System.out.printf("linger.ms=%s batch.size=%s compression=%s: %d ms, tasdiq %d%n", a[0], a[1], a[2], jami, tasdiq.get());
            m.forEach((k, v) -> System.out.printf("  %-24s %.2f%n", k, v));
        }
    }
}
```

Java 11+ manba faylini kompilyatsiyasiz ishga tushiradi: `java -cp '<libs>/*' Toplab.java …`. Har variantdan oldin topic qayta yaratiladi, keyin diskdagi batch'lar soni va log hajmi o'lchanadi:

```text vps
$ for v in "0 16384 none" "50 131072 none" "50 131072 zstd"; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic toplam 2>/dev/null; sleep 3; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic toplam >/dev/null; cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Toplab.java $v 20000 2>/dev/null; docker exec kafka sh -c 'S=$(ls /tmp/kraft-combined-logs/toplam-0/*.log); /opt/kafka/bin/kafka-dump-log.sh --files $S 2>/dev/null | grep -c "^baseOffset"; du -k $S | cut -f1' | paste -sd' ' | awk '{print "  diskda: " $1 " batch, " $2 " KB"}'; done
linger.ms=0 batch.size=16384 compression=none: 5349 ms, tasdiq 20000
  batch-size-avg           15554.59
  compression-rate-avg     1.00
  records-per-request-avg  240.96
  request-total            87.00
  diskda: 83 batch, 1264 KB
linger.ms=50 batch.size=131072 compression=none: 4843 ms, tasdiq 20000
  batch-size-avg           80883.00
  compression-rate-avg     1.00
  records-per-request-avg  1250.00
  request-total            20.00
  diskda: 16 batch, 1264 KB
linger.ms=50 batch.size=131072 compression=zstd: 4281 ms, tasdiq 20000
  batch-size-avg           6105.87
  compression-rate-avg     0.09
  records-per-request-avg  1333.33
  request-total            19.00
  diskda: 15 batch, 92 KB
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic toplam
```

| Variant | Batch o'rtacha | So'rovlar | Diskda | Siqish |
| --- | --- | --- | --- | --- |
| `linger.ms=0`, 16 KB | 15.5 KB | 87 | 83 batch, 1264 KB | — |
| `linger.ms=50`, 128 KB | 81 KB | 20 | 16 batch, 1264 KB | — |
| `linger.ms=50`, 128 KB, `zstd` | 6 KB (siqilgan) | 19 | 15 batch, **92 KB** | 0.09 |

- Katta batch: so'rovlar soni **4 baravardan ko'p** kamaydi, ma'lumot hajmi o'sha.
- `zstd`: o'xshash xabarlar batch ichida **~11 baravar** siqildi (`compression-rate-avg` 0.09). Diskdagi log ham siqilgan — broker batch'ni siqilgan holda saqladi (KD).
- Bu VPS'da (1 CPU) vaqt farqi kichik. Asosiy foyda — so'rovlar va bayt soni.

## Variantlar

| Maqsad | Sozlama |
| --- | --- |
| Eng kam kechikish | `linger.ms=0` (batch'lar kichik) |
| Yuqori o'tkazuvchanlik | `linger.ms` 5–50, kattaroq `batch.size` |
| Tarmoq yoki disk tor | `compression.type` (`zstd`, `lz4`) |
| Ko'p partition'ga yozish | `buffer.memory` yetarli bo'lsin — batch har partition uchun alohida |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Har xabarni o'zi siqib yuborish | Siqish yomon — takror xabarlar orasida (KD) | `compression.type` — batch siqiladi |
| `send()` dan keyin darhol "yuborildi" deb hisoblash | `send()` asinxron — faqat buferga qo'yadi | Callback yoki `flush()` |
| Juda kichik `batch.size` | Batch'lar kam, o'tkazuvchanlik pasayadi (KD) | Standart yoki kattaroq |
| Har xabarga yangi producer | Batch yig'ilmaydi, ulanishlar ko'p | Bitta uzoq yashaydigan producer (12-bob) |

## Amaliyot

1. Kafka nega xabarlarni batch'larda yuboradi?
2. `linger.ms` nima qiladi?
3. Siqish nega butun batch'ga qo'llanadi?
4. Sinovda `zstd` diskdagi hajmni qancha kamaytirdi va nega disk ham kichraydi?

<details>
<summary>Javoblar</summary>

1. Kichik I/O amallari va har so'rov xarajatini kamaytirish uchun.
2. Batch to'lishi uchun belgilangan vaqtgacha kutadi — so'rovlar kamayadi.
3. Ortiqchalik xabarlar orasida; batch katta bo'lsa, siqish yaxshi.
4. 1264 KB dan 92 KB ga; broker batch'ni siqilgan holda saqlaydi.

</details>

## Rasmiy hujjat

- [KD: Design → Efficiency, End-to-end Batch Compression, The Producer](https://kafka.apache.org/44/design/design/)
- [KD: Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) — `batch.size`, `linger.ms`, `buffer.memory`, `compression.type`
