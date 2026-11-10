# 15 — Consumer group

[Mundarija](README.md)

## Tushuncha

**Consumer group** — bitta `group.id` ga ega consumer'lar to'plami. Ular topic'ni **birgalikda** o'qiydi: KD (Design → Consumer Position): har partition guruh ichida bir vaqtda **aynan bitta** consumer'ga beriladi. Shuning uchun:

- ish a'zolar orasida partition bo'yicha bo'linadi;
- har partition ichidagi tartib saqlanadi (bitta o'quvchi);
- guruhning eng ko'p parallelligi = partition soni. Ortiqcha a'zo bo'sh turadi (5-bob);
- **boshqa** guruh o'sha topic'ni mustaqil, o'z offset'lari bilan qaytadan o'qiydi (pub/sub).

**Rebalance** — a'zo qo'shilganda, chiqqanda yoki ishdan chiqqanda partition'larni qayta taqsimlash.

### Ikki protokol (KD Consumer Rebalance Protocol)

| | `classic` | `consumer` (KIP-848) |
| --- | --- | --- |
| Holat | Eski | 4.0 dan GA, production uchun tayyor |
| Klientda standart | **Ha** (`group.protocol=classic`) | Yo'q — `group.protocol=consumer` bilan yoqiladi |
| Taqsimlash | Klientda (`partition.assignment.strategy`) | **Serverda** (`uniform` — standart, `range`) |
| Rebalance | Global sinxronlash to'sig'i | To'liq **inkremental**: faqat ko'chadigan partition'lar olinadi |
| Heartbeat va sessiya | Klient sozlamalari | Server sozlamalari (`group.consumer.heartbeat.interval.ms`, `group.consumer.session.timeout.ms`) |

Server tomonida yangi protokol 4.0 dan avtomatik yoqiq (`group.version`). `consumer` protokolida `heartbeat.interval.ms`, `session.timeout.ms`, `partition.assignment.strategy` va `enforceRebalance()` ishlatilmaydi. Bo'sh guruh protokollar orasida avtomatik o'tkaziladi. Ishlab turgan guruhni ham to'xtatmasdan, nusxalarni birma-bir `group.protocol=consumer` bilan qayta ishga tushirib o'tkazish mumkin.

4-bobdagi "The consumer rebalance protocol (KIP-848) is production-ready!" eslatmasi shu haqda.

## Buyruqlar va kod

VPS'da. Har a'zo `ConsumerRebalanceListener` bilan unga berilgan va undan olingan partition'larni vaqt bilan yozadi:

```java
// Consumer group a'zosi: qaysi partition'lar berilgani va olinganini (rebalance) vaqt bilan yozadi
import org.apache.kafka.clients.consumer.*;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.*;
import java.util.*;

public class Azo {
    static String t() { return LocalTime.now().withNano(0).toString(); }
    public static void main(String[] a) {
        String nom = a[0];
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("group.id", "hisobot");
        p.put("group.protocol", a[1]);                       // consumer yoki classic
        p.put("key.deserializer", StringDeserializer.class.getName());
        p.put("value.deserializer", StringDeserializer.class.getName());
        long tugash = System.currentTimeMillis() + Long.parseLong(a[2]) * 1000;
        try (KafkaConsumer<String, String> c = new KafkaConsumer<>(p)) {
            c.subscribe(List.of("hodisalar"), new ConsumerRebalanceListener() {
                public void onPartitionsRevoked(Collection<TopicPartition> ps) { if (!ps.isEmpty()) System.out.printf("%s %s: olindi %s%n", t(), nom, nomlar(ps)); }
                public void onPartitionsAssigned(Collection<TopicPartition> ps) { if (!ps.isEmpty()) System.out.printf("%s %s: berildi %s%n", t(), nom, nomlar(ps)); }
            });
            while (System.currentTimeMillis() < tugash) c.poll(Duration.ofMillis(500));
            System.out.printf("%s %s: chiqdi, oxirida %s%n", t(), nom, nomlar(c.assignment()));
        }
    }
    static String nomlar(Collection<TopicPartition> ps) { return ps.stream().map(TopicPartition::partition).sorted().toList().toString(); }
}
```

3 partition'li topic. `consumer` protokoli. A — 75 soniya, B — 15 soniyadan keyin (30 s), C — 30 soniyadan keyin (45 s), D — 45 soniyadan keyin (30 s). Har JVM'ga 64 MB heap (VPS xotirasi):

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic hodisalar --partitions 3
Created topic hodisalar.
$ cd /root/kafka-java && j() { java -Xmx64m -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Azo.java "$@" 2>/dev/null; }; (j A consumer 75 > A.log &); sleep 15; (j B consumer 30 > B.log &); sleep 15; (j C consumer 45 > C.log &); sleep 15; (j D consumer 30 > D.log &); sleep 12; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot --members --verbose 2>/dev/null | awk 'NR==1 || /hisobot/ {print $4, $(NF-1), $NF}' | column -t; sleep 35; cat A.log B.log C.log D.log | sort; rm -f A.log B.log C.log D.log
awk: cmd. line:1: (FILENAME=- FNR=1) fatal: attempt to access field -1
20:54:55 A: berildi [0, 1, 2]
20:55:15 A: olindi [2]
20:55:15 B: berildi [2]
20:55:30 A: olindi [1]
20:55:32 C: berildi [1]
20:55:36 B: chiqdi, oxirida [2]
20:55:36 B: olindi [2]
20:55:37 C: berildi [2]
20:55:48 C: olindi [2]
20:55:51 D: berildi [2]
20:56:05 A: chiqdi, oxirida [0]
20:56:06 A: olindi [0]
20:56:06 D: berildi [0]
20:56:07 C: chiqdi, oxirida [1]
20:56:07 C: olindi [1]
20:56:07 D: chiqdi, oxirida [0, 2]
20:56:07 D: olindi [0, 2]
```

Natijani tartib bilan o'qisak:

1. A yolg'iz — hamma partition (0, 1, 2) unda.
2. B qo'shildi — A dan **faqat 2** olindi va B ga berildi. A 0 va 1 ni o'qishda davom etdi: inkremental rebalance.
3. C qo'shildi — A dan 1 olindi. Endi har birida bittadan.
4. B chiqdi — uning partition'i (2) C ga o'tdi.
5. D qo'shildi — C dan 2 olinib D ga berildi.
6. Oxirida a'zolar birin-ketin chiqdi va qolganlariga partition'lar o'tdi.

Butun jarayonda A'ning 0-partition'i bir marta ham olinmadi. Kuzatildi: blok o'rtasidagi a'zolar jadvali `awk` xatosi tufayli chiqmadi (ustunlar soni kutilganidan farq qildi) — a'zolar holati log'dan ko'rinadi.

<div data-animatsiya="qadamli" data-nom="consumer-group"></div>

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group hisobot 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic hodisalar
Deletion of requested consumer groups ('hisobot') was successful.
```

## Variantlar

| Kerak | Usul |
| --- | --- |
| Ishni bir nechta nusxaga bo'lish | Bir xil `group.id` |
| Har xizmat hammasini o'qisin | Har xizmatga alohida `group.id` |
| Tez, inkremental rebalance | `group.protocol=consumer` |
| Partition sonidan ko'p parallel o'quvchi | Share group (19-bob) |
| Qayta ishga tushganda partition'lar o'sha nusxada qolsin | `group.instance.id` (statik a'zolik) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Partition sonidan ko'p consumer ishga tushirish | Ortiqchalar bo'sh turadi | Partition soni ≥ consumer soni |
| Ikki xizmatga bir xil `group.id` | Hodisalar ular orasida bo'linadi — har biri bir qismini ko'radi | Alohida guruhlar |
| `consumer` protokolida `session.timeout.ms` ni sozlash | Bu protokolda ishlatilmaydi — serverda (KD) | `group.consumer.session.timeout.ms` |
| Rebalance paytida ishlov holatini saqlamaslik | Olingan partition boshqa a'zoga o'tadi | `onPartitionsRevoked` da commit (16-bob) |

## Amaliyot

1. Consumer group ichida bitta partition'ni nechta consumer o'qiydi?
2. 3 partition va 5 consumer bo'lsa nima bo'ladi?
3. `consumer` protokoli `classic` dan nimasi bilan farq qiladi?
4. Sinovda B qo'shilganda A'ning qaysi partition'lari olindi?
5. Ikki xizmat bitta topic'ni to'liq o'qishi uchun nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. Bitta.
2. 3 tasi bittadan partition oladi, 2 tasi bo'sh turadi.
3. Taqsimlash serverda, rebalance inkremental (global to'siqsiz), heartbeat va sessiya server sozlamasi.
4. Faqat 2-partition — 0 va 1 A'da qoldi.
5. Har biriga alohida `group.id`.

</details>

## Rasmiy hujjat

- [KD: Design → The Consumer, Consumer Position](https://kafka.apache.org/44/design/design/)
- [KD: Consumer Rebalance Protocol](https://kafka.apache.org/44/operations/consumer-rebalance-protocol/)
- [KD: Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/) — `group.protocol`
