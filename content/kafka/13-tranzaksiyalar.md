# 13 — Tranzaksiyalar va exactly-once

[Mundarija](README.md)

## Tushuncha

### Nima uchun (KD Design → Message Delivery Semantics, Using Transactions)

Idempotent producer bitta partition'dagi takrorni yo'qotadi (11-bob). Lekin ko'p ish bir nechta yozuvdan iborat:

- buyurtma `buyurtmalar` ga **va** `tolovlar` ga yozilishi kerak — biri yozilib, ikkinchisi yozilmasa, holat buziladi;
- **o'qish → ishlash → yozish**: consumer topic'dan o'qiydi, natijani boshqa topic'ga yozadi va o'z o'rnini (offset) saqlaydi. Yozuv va o'rin birga saqlanmasa — yo'qolish yoki takror bo'ladi.

**Tranzaksiya** — producer bir nechta partition va topic'ga yozuvlarni, hamda consumer o'rnini **atomik** yozadi: hammasi yoki hech biri.

### Kafka tranzaksiyasining o'ziga xosligi (KD)

- Kafka'da consumer va producer alohida, tranzaksion faqat **producer**. Lekin u consumer o'rnini ("committed offset") ham tranzaksiya ichida yangilay oladi — exactly-once shundan kelib chiqadi.
- Tranzaksion yozuvlar belgilanadi. Commit yoki abort'da log'ga **tranzaksiya markeri** (control record) yoziladi.
- Consumer'ning `isolation.level` sozlamasi:

| Qiymat | Nimani ko'radi |
| --- | --- |
| `read_uncommitted` (standart) | Hamma yozuvni — **bekor qilingan** (abort) va hali tugamagan tranzaksiyalarnikini ham |
| `read_committed` | Faqat commit bo'lgan tranzaksiyalar yozuvlarini va tranzaksiyasiz yozuvlarni |

### Sozlash (KD)

- Producer: **`transactional.id`** — tranzaksion yetkazish yoqiladi. Shu ID bilan qayta ishga tushgan ilova oldingi nusxaning tugamagan tranzaksiyasini **bekor qiladi**.
- Consumer: `isolation.level=read_committed`, `enable.auto.commit=false`.
- Har consumer nusxasiga bitta producer nusxasi tavsiya etiladi (rebalance bilan to'g'ri ishlash uchun).
- API: `initTransactions()` → `beginTransaction()` → `send()` … → `sendOffsetsToTransaction()` (o'qish→yozishda) → `commitTransaction()` yoki `abortTransaction()`.

Exactly-once'ning eng oson yo'li — **Kafka Streams** (27–28-boblar). U shu mexanizmni o'zi ishlatadi. Tashqi tizimga (baza va h.k.) yozishda exactly-once uchun o'sha tizimning hamkorligi kerak. Odatiy usul — consumer o'z o'rnini natija bilan **bir joyda** saqlaydi (KD).

### Xatolar (KD)

| Tur | Nima qilish kerak |
| --- | --- |
| `RetriableException`, `RefreshRetriableException` | Klient o'zi qayta urinadi, ilovaga chiqmaydi |
| `AbortableException` | Tranzaksiyani **abort** qilish va consumer o'rnini qaytarish |
| `ApplicationRecoverableException` | Ilova o'zi tiklaydi — producer'ni qayta yaratish ham shu jumladan |
| `InvalidConfigurationException` | Sozlamani tuzatish |

Oddiy siyosat (KD): xatoda producer va consumer'ni tashlab, qaytadan yaratish. Consumer group rebalance bo'lib, oxirgi committed offset'dan davom etadi.

**4.x protokoli** (KD Transaction Protocol, KIP-890): har tranzaksiyada producer **epoch**'i oshiriladi. Shunda takrorlar keyingi tranzaksiyaga tushib qolmaydi. 4.0 dan serverda avtomatik yoqiq (`transaction.version`).

## Buyruqlar va kod

VPS'da (Kafka 4.4.0, Java 25):

```java
// Tranzaksion producer: ikki topic'ga atomik yozish, commit va abort, bir xil transactional.id bilan "zombi"ni chetlatish
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

public class Tranzaksiya {
    static KafkaProducer<String, String> yangi(String txId) {
        Properties p = new Properties();
        p.put("bootstrap.servers", "localhost:9092");
        p.put("key.serializer", StringSerializer.class.getName());
        p.put("value.serializer", StringSerializer.class.getName());
        p.put("transactional.id", txId);
        KafkaProducer<String, String> pr = new KafkaProducer<>(p);
        pr.initTransactions();                    // koordinatorda ro'yxatdan o'tish, eski tranzaksiyani tugatish
        return pr;
    }

    static void ikkiTopic(KafkaProducer<String, String> pr, String id) {
        pr.send(new ProducerRecord<>("buyurtmalar", id, "yaratildi"));
        pr.send(new ProducerRecord<>("tolovlar", id, "kutilmoqda"));
    }

    public static void main(String[] a) throws Exception {
        switch (a[0]) {
            case "commit" -> { try (var pr = yangi("buyurtma-xizmati")) {
                pr.beginTransaction(); ikkiTopic(pr, "B-1"); pr.commitTransaction();
                System.out.println("B-1: commit"); } }
            case "abort" -> { try (var pr = yangi("buyurtma-xizmati")) {
                pr.beginTransaction(); ikkiTopic(pr, "B-2"); pr.flush(); pr.abortTransaction();
                System.out.println("B-2: yozildi, keyin abort"); } }
            case "zombi" -> {
                var eski = yangi("buyurtma-xizmati");
                eski.beginTransaction(); ikkiTopic(eski, "B-3"); eski.flush();
                System.out.println("eski nusxa B-3 ni yozdi, commit qilmadi");
                try (var yangisi = yangi("buyurtma-xizmati")) {    // xuddi shu transactional.id bilan qayta ishga tushgan ilova
                    System.out.println("yangi nusxa initTransactions() qildi");
                    try { eski.commitTransaction(); }
                    catch (Exception e) { System.out.println("eski nusxa commit: " + e.getClass().getSimpleName()); }
                    yangisi.beginTransaction(); ikkiTopic(yangisi, "B-4"); yangisi.commitTransaction();
                    System.out.println("yangi nusxa B-4: commit");
                }
                eski.close();
            }
        }
    }
}
```

```text vps
$ for t in buyurtmalar tolovlar; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic $t; done
Created topic buyurtmalar.
Created topic tolovlar.
$ cd /root/kafka-java && for m in commit abort zombi; do java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Tranzaksiya.java $m 2>/dev/null; done
B-1: commit
B-2: yozildi, keyin abort
eski nusxa B-3 ni yozdi, commit qilmadi
yangi nusxa initTransactions() qildi
eski nusxa commit: ProducerFencedException
yangi nusxa B-4: commit
$ for iso in read_uncommitted read_committed; do echo "== $iso"; docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic buyurtmalar --from-beginning --isolation-level $iso --timeout-ms 6000 --formatter-property print.key=true --formatter-property print.offset=true 2>/dev/null; done
== read_uncommitted
Offset:0	B-1	yaratildi
Offset:2	B-2	yaratildi
Offset:4	B-3	yaratildi
Offset:6	B-4	yaratildi
== read_committed
Offset:0	B-1	yaratildi
Offset:6	B-4	yaratildi
```

- **B-1** commit — ikkala izolyatsiyada ham ko'rinadi.
- **B-2** yozildi va abort qilindi — faqat `read_uncommitted` da ko'rinadi.
- **B-3**: eski nusxa yozdi, lekin commit qilmasdan **xuddi shu `transactional.id`** bilan yangi nusxa ishga tushdi. Eski nusxaning commit'i — `ProducerFencedException`: "zombi" chetlatildi. B-3 abort bo'ldi — `read_committed` da yo'q.
- **B-4** — yangi nusxa commit qildi.
- Offset'lar 0, 2, 4, 6 — oraliqlardagi 1, 3, 5, 7 — tranzaksiya markerlari.

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic buyurtmalar
buyurtmalar:0:8
$ docker exec kafka /opt/kafka/bin/kafka-transactions.sh --bootstrap-server localhost:9092 list
TransactionalId 	Coordinator	ProducerId	TransactionState	
buyurtma-xizmati	1          	32        	CompleteCommit  	
$ docker exec kafka /opt/kafka/bin/kafka-transactions.sh --bootstrap-server localhost:9092 describe --transactional-id buyurtma-xizmati
CoordinatorId	TransactionalId 	ProducerId	ProducerEpoch	TransactionState	TransactionTimeoutMs	CurrentTransactionStartTimeMs	TransactionDurationMs	TopicPartitions	
1            	buyurtma-xizmati	32        	7            	CompleteCommit  	60000               	1794332623160                	49671                	               	
$ docker exec kafka sh -c '/opt/kafka/bin/kafka-dump-log.sh --files /tmp/kraft-combined-logs/buyurtmalar-0/00000000000000000000.log 2>/dev/null' | grep -o 'baseOffset: [0-9]* .*isControl: [a-z]*' | sed 's/lastOffset.*producerId/producerId/; s/partitionLeaderEpoch: [0-9]* //'
baseOffset: 0 producerId: 32 producerEpoch: 0 isTransactional: true isControl: false
baseOffset: 1 producerId: 32 producerEpoch: 1 isTransactional: true isControl: true
baseOffset: 2 producerId: 32 producerEpoch: 2 isTransactional: true isControl: false
baseOffset: 3 producerId: 32 producerEpoch: 3 isTransactional: true isControl: true
baseOffset: 4 producerId: 32 producerEpoch: 4 isTransactional: true isControl: false
baseOffset: 5 producerId: 32 producerEpoch: 5 isTransactional: true isControl: true
baseOffset: 6 producerId: 32 producerEpoch: 6 isTransactional: true isControl: false
baseOffset: 7 producerId: 32 producerEpoch: 7 isTransactional: true isControl: true
```

- Log oxiri 8: 4 yozuv + 4 marker.
- `kafka-transactions.sh` — tranzaksiya holati (`CompleteCommit`), producer ID, epoch, timeout (standart 60 s).
- Diskda: har yozuv `isTransactional: true`, markerlar `isControl: true`. `producerEpoch` har tranzaksiyada oshdi (0 → 7) — 4.x protokoli (KIP-890).

## Variantlar

| Kerak | Usul |
| --- | --- |
| Topic → ishlash → topic, exactly-once | Kafka Streams (`processing.guarantee=exactly_once_v2`, 27-bob) |
| Xuddi shuni o'zim | Tranzaksion producer + `sendOffsetsToTransaction` + `read_committed` |
| Bir nechta topic'ga atomik yozish | Tranzaksiya |
| Faqat takrorsiz yozish | Idempotent producer yetarli (11-bob) |
| Natija tashqi bazada | O'rinni natija bilan bir tranzaksiyada (bazada) saqlash |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Consumer'da `read_committed` ni unutish | Abort bo'lgan yozuvlar ham o'qiladi (KD, sinovda B-2, B-3) | `isolation.level=read_committed` |
| Har ishga tushishda yangi tasodifiy `transactional.id` | Eski nusxa chetlatilmaydi | Barqaror ID (nusxa bo'yicha) |
| Abort'dan keyin consumer o'rnini qaytarmaslik | Ishlangan yozuvlar qayta ishlanmaydi (KD) | `seek` yoki consumer'ni qayta yaratish |
| Tranzaksiya tashqi bazaga ham tegadi deb o'ylash | Faqat Kafka ichida (KD) | Bazada o'rin bilan birga saqlash |
| Offset'lar ketma-ket deb hisoblash | Markerlar offset egallaydi (sinovda) | Offset — o'rin |

## Amaliyot

1. Kafka'da qaysi tomon tranzaksion?
2. `read_uncommitted` va `read_committed` farqi nima?
3. Sinovda eski nusxa nega commit qila olmadi?
4. Sinovdagi offset'lardagi oraliqlar nima?
5. Exactly-once'ning eng oson yo'li qaysi?

<details>
<summary>Javoblar</summary>

1. Faqat producer (lekin u consumer o'rnini ham tranzaksiyada yozadi).
2. Birinchisi abort va tugamagan tranzaksiya yozuvlarini ham ko'radi, ikkinchisi faqat commit bo'lganlarini.
3. Xuddi shu `transactional.id` bilan yangi nusxa `initTransactions()` qildi — eskisi chetlatildi (`ProducerFencedException`).
4. Tranzaksiya markerlari (control record).
5. Kafka Streams.

</details>

## Rasmiy hujjat

- [KD: Design → Message Delivery Semantics, Using Transactions](https://kafka.apache.org/44/design/design/)
- [KD: Transaction Protocol](https://kafka.apache.org/44/operations/transaction-protocol/)
- [Javadoc: KafkaProducer](https://kafka.apache.org/44/javadoc/org/apache/kafka/clients/producer/KafkaProducer.html)
