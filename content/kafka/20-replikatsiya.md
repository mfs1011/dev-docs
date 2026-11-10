# 20 — Replikatsiya

[Mundarija](README.md)

## Tushuncha

### Asoslar (KD Design → Replication)

Kafka har topic partition'ining log'ini bir nechta serverga **nusxalaydi** — replication factor topic bo'yicha belgilanadi. Server ishdan chiqsa, avtomatik ravishda nusxaga o'tiladi. Kafka replikatsiya bilan ishlash uchun yaratilgan: replikatsiyasiz topic ham aslida replication factor 1 bo'lgan replikali topic.

- Replikatsiya birligi — **partition**. Har partition'ning bitta **yetakchisi** (leader) va nol yoki bir nechta **izdoshi** (follower) bor. Replication factor = yetakchi + izdoshlar.
- Barcha yozuvlar yetakchiga boradi. Izdoshlar yetakchidan oddiy consumer kabi o'qib, o'z log'iga yozadi.
- Odatda partition'lar broker'lardan ancha ko'p, yetakchilar broker'lar orasida teng taqsimlanadi.

### ISR — sinxron replikalar (KD)

Broker "sinxron" (in sync) hisoblanishi uchun ikki shart:

1. Controller bilan **faol sessiya**: KRaft'da muntazam heartbeat. `broker.session.timeout.ms` ichida heartbeat bo'lmasa, tugun oflayn hisoblanadi.
2. Izdosh yetakchining yozuvlarini nusxalab, **juda orqada qolmasligi** kerak: `replica.lag.time.max.ms` ichida log oxiriga yetib olmasa, ISR'dan chiqariladi.

Yetakchi sinxron replikalar to'plamini — **ISR** ni kuzatib boradi.

**Kafolat** (KD): committed xabar kamida bitta sinxron replika tirik ekan yo'qolmaydi. Consumer'ga faqat committed xabarlar beriladi. `acks` dan qat'i nazar, xabar consumer'ga ko'rinishi uchun ikki shart bajarilishi kerak:

- xabar barcha sinxron replikalarga nusxalangan bo'lishi;
- sinxron replikalar soni `min.insync.replicas` dan kam bo'lmasligi.

### Nega ko'pchilik ovozi emas (KD)

Ko'pchilik ovozi (Raft, Zab) bilan bitta nosozlikka chidash uchun 3 nusxa, ikkitasiga — 5 nusxa kerak. Kafka buning o'rniga ISR'ni ishlatadi. ISR'dagi istalgan replika yetakchi bo'la oladi: f ta nosozlikka f+1 nusxa bilan chidaydi.

## Buyruqlar va kod

VPS'da 3 tugunli klaster (22-bobda batafsil): 3 ta `apache/kafka:4.4.0` konteyner, har biri ham broker, ham controller. CLI vositalari serverdagi Kafka arxividan, `localhost:29092` (1-broker) orqali ishlatiladi.

### Topic va yetakchilar

```text vps
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; B=localhost:29092; kafka-topics.sh --bootstrap-server $B --create --topic buyurtmalar --partitions 3 --replication-factor 3 --config min.insync.replicas=2; kafka-topics.sh --bootstrap-server $B --create --topic uchtasi-kerak --partitions 1 --replication-factor 3 --config min.insync.replicas=3
Created topic buyurtmalar.
Created topic uchtasi-kerak.
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | cut -f1-6 | sed 's/TopicId: [^\t]*\t//'
Topic: buyurtmalar	PartitionCount: 3	ReplicationFactor: 3	Configs: min.insync.replicas=2
	Topic: buyurtmalar	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 3,1,2
	Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
	Topic: buyurtmalar	Partition: 2	Leader: 2	Replicas: 2,3,1	Isr: 2,3,1
```

- `buyurtmalar` — 3 partition, har biri 3 nusxa, `min.insync.replicas=2`.
- Yetakchilar 3, 1, 2 — teng taqsimlangan. `Replicas` dagi birinchi broker — **afzal** (preferred) yetakchi.

### Broker tushdi

```text vps
$ cd /root/kafka-klaster && docker compose stop kafka-2 2>&1 | tail -1; sleep 15; export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-6
 Container kafka-2 Stopped 
Topic: buyurtmalar	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 3,1
Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,3
Topic: buyurtmalar	Partition: 2	Leader: 3	Replicas: 2,3,1	Isr: 3,1
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; printf 'x1\nx2\n' | kafka-console-producer.sh --bootstrap-server localhost:29092 --topic buyurtmalar --command-property acks=all 2>&1 | grep -i -E 'error|exception' | head -2; echo "buyurtmalar (min ISR 2) kod: ${PIPESTATUS[1]}"
buyurtmalar (min ISR 2) kod: 0
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; printf 'y1\n' | kafka-console-producer.sh --bootstrap-server localhost:29092 --topic uchtasi-kerak --command-property acks=all --command-property delivery.timeout.ms=10000 --command-property request.timeout.ms=5000 2>&1 | grep -o -E 'NotEnoughReplicas[A-Za-z]*|Expiring [0-9]+ record\(s\)[^:]*' | sort -u | head -3; printf 'y2\n' | kafka-console-producer.sh --bootstrap-server localhost:29092 --topic uchtasi-kerak --command-property acks=1 2>&1 | grep -c -i error; kafka-get-offsets.sh --bootstrap-server localhost:29092 --topic uchtasi-kerak
NotEnoughReplicasException
0
uchtasi-kerak:0:0
```

- `kafka-2` to'xtatildi — u hamma partition ISR'idan chiqarildi. Partition 2 yetakchisi 2 edi — yangi yetakchi ISR'dagi **3**.
- `buyurtmalar` ga `acks=all` bilan yozish ishladi: ISR 2 ≥ `min.insync.replicas` 2.
- `uchtasi-kerak` (`min.insync.replicas=3`): ISR 2 < 3 — `acks=all` yozuvi `NotEnoughReplicasException` oldi. Bitta tugunda ko'rib bo'lmagan xato (11-bob) ko'p tugunli klasterda kutilganidek chiqdi.
- `acks=1` yozuvida xato chiqmadi, lekin offset **0** ko'rinyapti: xabar yetakchida, ammo hali committed emas. KD: `min.insync.replicas` sharti bajarilmaguncha xabar consumer'ga ko'rinmaydi.

### Broker qaytdi

```text vps
$ cd /root/kafka-klaster && docker compose start kafka-2 2>&1 | tail -1; sleep 30; export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-6
 Container kafka-2 Started 
Topic: buyurtmalar	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 1,2,3
Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
Topic: buyurtmalar	Partition: 2	Leader: 3	Replicas: 2,3,1	Isr: 1,2,3
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-get-offsets.sh --bootstrap-server localhost:29092 --topic buyurtmalar; kafka-get-offsets.sh --bootstrap-server localhost:29092 --topic uchtasi-kerak
buyurtmalar:0:0
buyurtmalar:1:0
buyurtmalar:2:2
uchtasi-kerak:0:1
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-leader-election.sh --bootstrap-server localhost:29092 --election-type preferred --all-topic-partitions 2>&1 | head -4; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-6
Successfully completed leader election (PREFERRED) for partitions buyurtmalar-2
Topic: buyurtmalar	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 1,2,3
Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,2,3
Topic: buyurtmalar	Partition: 2	Leader: 2	Replicas: 2,3,1	Isr: 1,2,3
```

- `kafka-2` qaytgach, yetakchilardan qolgan yozuvlarni olib, ISR'ga qaytdi (`Isr: 1,2,3`). Yetakchilik o'zi qaytmadi — partition 2 da yetakchi hali 3.
- `uchtasi-kerak` da offset **1** bo'ldi: ISR yana 3 ta — `acks=1` bilan yozilgan xabar endi committed va ko'rinadi.
- `kafka-leader-election.sh --election-type preferred` — afzal yetakchiga qaytarish. Partition 2 yetakchisi yana 2.

<div data-animatsiya="qadamli" data-nom="isr-leader"></div>

## Variantlar

| Talab | Sozlama |
| --- | --- |
| Bitta broker ishdan chiqsa ham yozish to'xtamasin | RF 3, `min.insync.replicas=2` |
| Yo'qotishsiz, lekin ikkita broker tushsa yozish to'xtasin | RF 3, `min.insync.replicas=2`, `acks=all` |
| Mavjudlik muhimroq, ozgina yo'qotish mumkin | `acks=1` |
| Yetakchilar qayta teng taqsimlansin | `kafka-leader-election.sh --election-type preferred` (yoki avtomatik — `auto.leader.rebalance.enable`) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `min.insync.replicas` = RF | Bitta broker tushsa ham yozish to'xtaydi (sinovda `uchtasi-kerak`) | RF − 1 |
| `acks=1` bilan "yozildi" deb hisoblash | Committed bo'lmaguncha ko'rinmaydi, yetakchi qulasa yo'qolishi mumkin (KD, sinovda) | `acks=all` |
| Broker qaytgach yetakchilik qaytadi deb kutish | Qaytmaydi (sinovda) | Preferred election |
| RF 1 production'da | Broker ishdan chiqsa — partition mavjud emas | RF 3 |

## Amaliyot

1. ISR nima va broker undan qachon chiqariladi?
2. Committed xabar qanday kafolatga ega?
3. Sinovda `kafka-2` to'xtaganda partition 2 bilan nima bo'ldi?
4. Nega `uchtasi-kerak` ga `acks=all` yozuvi xato berdi?
5. `acks=1` bilan yozilgan xabar qachon ko'rindi?

<details>
<summary>Javoblar</summary>

1. Yetakchi bilan sinxron replikalar to'plami; controller bilan sessiya uzilsa yoki `replica.lag.time.max.ms` ichida yetib olmasa chiqariladi.
2. Kamida bitta sinxron replika tirik ekan yo'qolmaydi.
3. Yetakchi 2 edi — yangi yetakchi ISR'dagi 3 bo'ldi.
4. ISR 2 ta, `min.insync.replicas` esa 3 edi.
5. `kafka-2` qaytib ISR 3 ga yetganda — shundagina committed bo'ldi.

</details>

## Rasmiy hujjat

- [KD: Design → Replication](https://kafka.apache.org/44/design/design/)
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `min.insync.replicas`
- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/)
