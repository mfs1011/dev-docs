# 04 — Birinchi topic

[Mundarija](README.md)

## Tushuncha

KD (Quick Start, 3–5-qadamlar): hodisa yozishdan oldin uni saqlaydigan **topic** kerak. Keyin ikki tayyor konsol klienti bilan ishlanadi:

| Vosita | Vazifa |
| --- | --- |
| `kafka-topics.sh` | Topic yaratish (`--create`), ko'rish (`--describe`, `--list`), o'zgartirish (`--alter`), o'chirish (`--delete`) |
| `kafka-console-producer.sh` | Har kiritilgan **qator** — alohida hodisa |
| `kafka-console-consumer.sh` | Hodisalarni o'qib, ekranga chiqaradi. `--from-beginning` — topic boshidan |

KD: broker hodisani olgach, uni ishonchli va nosozlikka chidamli tarzda **kerakli muddat — hatto abadiy** saqlaydi. Hodisalar saqlanib turgani uchun ularni **xohlagancha marta va xohlagancha consumer** o'qiy oladi.

Barcha CLI vositalari bir xil: argumentsiz ishga tushirilsa, foydalanish yo'riqnomasini chiqaradi (KD).

## Buyruqlar va kod

VPS'da, Docker'dagi broker (3-bob). Vositalar konteyner ichida: `docker exec kafka /opt/kafka/bin/…`. Producer'ga qatorlar `printf` orqali beriladi (terminalda qo'lda yozishning o'rniga).

### Topic yaratish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic quickstart-events; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic avto-yaratilgan; sleep 3; docker exec kafka /opt/kafka/bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092
Created topic quickstart-events.
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --describe --topic quickstart-events --bootstrap-server localhost:9092
Topic: quickstart-events	TopicId: X1E6SsOZT9qPUd9ipjoGoQ	PartitionCount: 1	ReplicationFactor: 1	Configs: min.insync.replicas=1,segment.bytes=1073741824
	Topic: quickstart-events	Partition: 0	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 2>&1 | head -4
Command must include exactly one action: --list, --describe, --create, --alter or --delete
Option                                   Description                            
------                                   -----------                            
--alter                                  Alter the number of partitions and     
```

- 1 partition, 1 replika — bitta tugunli klaster va standart `num.partitions=1`.
- `Leader: 1` — partition'ning yetakchisi 1-tugun; `Isr` — u bilan sinxron replikalar (20-bob).

### Yozish va o'qish

```text vps
$ printf 'This is my first event\nThis is my second event\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092; echo "producer kod: $?"
producer kod: 0
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092 --max-messages 2 2>&1 | grep -v KIP-848
This is my first event
This is my second event
Processed a total of 2 messages
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092 --max-messages 2 2>&1 | grep -v KIP-848
This is my first event
This is my second event
Processed a total of 2 messages
```

- Ikki qator — ikki hodisa.
- Consumer ikkalasini oldi. **Ikkinchi marta** ishga tushirilganda ham — yana ikkalasi: o'qish hodisalarni o'chirmaydi.
- `--max-messages` — shuncha hodisani o'qigach chiqish (sinovda konsolni Ctrl-C bilan to'xtatish o'rniga).

### Offset va vaqt

```text vps
$ printf 'uchinchi hodisa\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic quickstart-events --bootstrap-server localhost:9092; docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092 --max-messages 3 --formatter-property print.offset=true --formatter-property print.timestamp=true 2>&1 | grep -v KIP-848
CreateTime:1794296656685	Offset:0	This is my first event
CreateTime:1794296656713	Offset:1	This is my second event
CreateTime:1794296681954	Offset:2	uchinchi hodisa
Processed a total of 3 messages
```

Har hodisaning **offset**'i (partition'dagi tartib raqami: 0, 1, 2) va `CreateTime` vaqt belgisi (millisoniya) bor. Offset — 7-bob mavzusi.

Kuzatildi: 4.4 da `--property` eskirgan — `Option --property is deprecated … Use --formatter-property instead`. Yangi nomi bilan ishlatildi.

### `--from-beginning` siz

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic quickstart-events --bootstrap-server localhost:9092 --timeout-ms 5000 2>&1 | grep -E 'Processed|TimeoutException' | head -2
org.apache.kafka.common.errors.TimeoutException
Processed a total of 0 messages
```

`--from-beginning` siz consumer faqat **yangi** hodisalarni kutadi. 5 soniya ichida yangi hodisa kelmadi — 0 ta. `--timeout-ms` bilan konsol consumer `TimeoutException` bilan chiqadi. Dastlabki sinovda bu `ERROR` qatori bilan ko'rindi:

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic quickstart-events --from-beginning --bootstrap-server localhost:9092 --timeout-ms 8000 2>&1 | grep -v TimeoutException | grep -v '^\s*at '
The consumer rebalance protocol (KIP-848) is production-ready! Set group.protocol=consumer to try it out. See https://kafka.apache.org/documentation/#consumer_rebalance_protocol
This is my first event
This is my second event
[2026-11-10 07:42:29,729] ERROR Error processing message, terminating consumer process:  (org.apache.kafka.tools.consumer.ConsoleConsumer)
Processed a total of 2 messages
```

Kuzatildi: har konsol consumer ishga tushganda "The consumer rebalance protocol (KIP-848) is production-ready!" degan eslatma chiqadi. Yangi guruh protokoli — 15-bob mavzusi. Yuqoridagi boshqa bloklarda bu qator `grep -v` bilan olib tashlangan.

### Topic avtomatik yaratilishi

```text vps
$ printf 'yangi-topic hodisa\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic avto-yaratilgan --bootstrap-server localhost:9092 2>&1 | tail -2; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
[2026-11-10 07:43:30,312] WARN [Producer clientId=console-producer] The metadata response from the cluster reported a recoverable issue with correlation id 1 : {avto-yaratilgan=UNKNOWN_TOPIC_OR_PARTITION} (org.apache.kafka.clients.NetworkClient)
__consumer_offsets
avto-yaratilgan
quickstart-events
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --describe --all | grep -E 'auto.create.topics.enable|num.partitions=' | sed 's/^ *//; s/ synonyms=.*//'
auto.create.topics.enable=true sensitive=false
errors.deadletterqueue.auto.create.topics.enable=false sensitive=false
num.partitions=1 sensitive=false
offsets.topic.num.partitions=50 sensitive=false
share.coordinator.state.topic.num.partitions=50 sensitive=false
transaction.state.log.num.partitions=50 sensitive=false
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
__consumer_offsets
quickstart-events
```

- Mavjud bo'lmagan `avto-yaratilgan` topic'iga yozildi. Producer avval `UNKNOWN_TOPIC_OR_PARTITION` ogohlantirishini oldi, keyin topic **avtomatik yaratildi**. Sabab — broker sozlamasi `auto.create.topics.enable=true` (standart).
- `__consumer_offsets` — consumer'lar o'qigan joyini saqlaydigan ichki topic (standartda 50 partition, 16-bob). U birinchi konsol consumer bilan paydo bo'ldi.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Topic'ni oldindan, sozlamalari bilan | `kafka-topics.sh --create` (5-bob) |
| Tez sinov | Avtomatik yaratilish (standart yoqilgan) |
| Hammasini boshidan o'qish | `--from-beginning` |
| Faqat yangilari | `--from-beginning` siz |
| Offset va vaqtni ko'rish | `--formatter-property print.offset=true` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Topic nomida xato bilan yozish | Avtomatik yaratilish — yangi keraksiz topic paydo bo'ladi (sinovda) | Production'da `auto.create.topics.enable` ni o'ylab sozlash (29-bob) |
| O'qilgan hodisa o'chdi deb kutish | Saqlanadi, qayta o'qiladi (KD, sinovda) | Saqlash muddati (8-bob) |
| `--from-beginning` siz eski hodisalarni kutish | Faqat yangilari | `--from-beginning` |
| `--property` (4.4) | Eskirgan (sinovda) | `--formatter-property` |

## Amaliyot

1. Konsol producer'da har qator nima bo'ladi?
2. Sinovda consumer ikkinchi marta ishga tushirilganda nima o'qidi va nega?
3. Offset nima?
4. Mavjud bo'lmagan topic'ga yozilganda nima bo'ldi?
5. `__consumer_offsets` nima?

<details>
<summary>Javoblar</summary>

1. Alohida hodisa.
2. O'sha ikki hodisani — ular o'qilgandan keyin ham saqlanadi.
3. Hodisaning partition'dagi tartib raqami.
4. Topic avtomatik yaratildi (`auto.create.topics.enable=true`).
5. Consumer'lar o'qigan joyini saqlaydigan ichki topic.

</details>

## Rasmiy hujjat

- [KD: Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) — Step 3–5
