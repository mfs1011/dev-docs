# 05 — Topic'larni boshqarish

[Mundarija](README.md)

## Tushuncha

### Yaratish (KD: Basic Operations)

Topic'ni qo'lda yaratish yoki birinchi hodisa yozilganda avtomatik yaratilishiga qo'yib berish mumkin (4-bob). Avtomatik yaratilsa, server'dagi standart topic sozlamalarini o'ylab sozlash kerak bo'ladi. Qo'lda:

```bash
bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic my_topic_name \
    --partitions 20 --replication-factor 3 --config x=y
```

| Parametr | KD izohi |
| --- | --- |
| `--replication-factor` | Har xabarni nechta server nusxalaydi. 3 bo'lsa, ma'lumotga kirish yo'qolguncha 2 tagacha server ishdan chiqishi mumkin. **2 yoki 3** tavsiya etiladi — mashinalarni o'qishni to'xtatmasdan qayta ishga tushirish uchun |
| `--partitions` | Topic nechta log'ga bo'linadi. Har partition **to'liq bitta serverda** turadi: 20 partition'li topic'ni ko'pi bilan 20 server ko'taradi (replikalarsiz). Partition soni consumer'larning eng ko'p parallelligini ham belgilaydi |
| `--config` | Server standartini shu topic uchun almashtiradi (masalan, saqlash muddati) |

Har partition log katalogi ichida alohida papkada turadi: `<topic>-<partition raqami>`. Papka nomi 255 belgidan oshmasligi kerak, shuning uchun topic nomi **249 belgidan** uzun bo'lmaydi.

### Sozlamalar (KD: Topic Configs)

Har topic sozlamasining **server standarti** bor (`Server Default Property`). Topic uchun alohida qiymat berilmasa, standart ishlaydi. Alohida qiymat yaratishda `--config` bilan yoki keyinroq `kafka-configs.sh` bilan beriladi:

| Amal | Buyruq |
| --- | --- |
| Ko'rish | `kafka-configs.sh … --entity-type topics --entity-name <topic> --describe` |
| Qo'shish/o'zgartirish | `… --alter --add-config x=y` |
| Olib tashlash (standartga qaytish) | `… --alter --delete-config x` |

### O'zgartirish va o'chirish (KD)

- Partition **qo'shish** mumkin: `--alter --partitions 40`. Kamaytirish — **qo'llanmaydi**.
- KD ogohlantirishlari (partition qo'shish):
  - kalit `hash(key) % partition_soni` bo'yicha tarqatilsa, bir xil kalitli xabarlar endi **boshqa partition**'ga tushishi mumkin (6-bob);
  - `auto.offset.reset=latest` bilan ishlaydigan consumer'lar yangi partition'larga yozilgan xabarlarni o'tkazib yuborishi mumkin;
  - yangi partition'lar klientlarga darhol ko'rinmaydi (`metadata.max.age.ms`);
  - ichki topic'larning (`__consumer_offsets`, `__transaction_state`, `__share_group_state`, `__cluster_metadata`) partition'larini **hech qachon** qo'lda oshirmang.
- O'chirish: `--delete --topic <nom>`.

## Buyruqlar va kod

VPS'da, Docker'dagi broker (bitta tugun). Qisqalik uchun `kafka-topics.sh` va `kafka-configs.sh` konteyner ichida ishlatiladi.

### Yaratish va ko'rish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic buyurtmalar --partitions 3 --replication-factor 1 --config retention.ms=86400000
Created topic buyurtmalar.
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic buyurtmalar
Topic: buyurtmalar	TopicId: PeH_JEDaQxW0Mw91QKhIsA	PartitionCount: 3	ReplicationFactor: 1	Configs: min.insync.replicas=1,segment.bytes=1073741824,retention.ms=86400000
	Topic: buyurtmalar	Partition: 0	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
	Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
	Topic: buyurtmalar	Partition: 2	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic uch-nusxa --partitions 1 --replication-factor 3 2>&1 | grep -E 'Error|error' | head -2
Error while executing topic command : Unable to replicate the partition 3 time(s): The target replication factor of 3 cannot be reached because only 1 broker(s) are registered or some brokers have all their log directories cordoned.
[2026-11-10 07:46:52,712] ERROR org.apache.kafka.common.errors.InvalidReplicationFactorException: Unable to replicate the partition 3 time(s): The target replication factor of 3 cannot be reached because only 1 broker(s) are registered or some brokers have all their log directories cordoned.
$ docker exec kafka sh -c 'ls -d /tmp/kraft-combined-logs/buyurtmalar-*'
/tmp/kraft-combined-logs/buyurtmalar-0
/tmp/kraft-combined-logs/buyurtmalar-1
/tmp/kraft-combined-logs/buyurtmalar-2
```

- 3 partition, `retention.ms` (1 kun) — topic sozlamasi `Configs` ustunida ko'rinadi.
- Replication factor 3 — xato: klasterda faqat **1** broker. Ko'p tugunli klaster — 22-bob.
- Har partition — alohida papka: `buyurtmalar-0`, `-1`, `-2`.

### Sozlamalarni o'zgartirish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --describe
Dynamic configs for topic buyurtmalar are:
  retention.ms=86400000 sensitive=false synonyms={DYNAMIC_TOPIC_CONFIG:retention.ms=86400000}
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --alter --add-config max.message.bytes=64000,retention.ms=172800000; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --describe
Completed updating config for topic buyurtmalar.
Dynamic configs for topic buyurtmalar are:
  max.message.bytes=64000 sensitive=false synonyms={DYNAMIC_TOPIC_CONFIG:max.message.bytes=64000, DEFAULT_CONFIG:message.max.bytes=1048588}
  retention.ms=172800000 sensitive=false synonyms={DYNAMIC_TOPIC_CONFIG:retention.ms=172800000}
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --alter --delete-config max.message.bytes; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --describe
Completed updating config for topic buyurtmalar.
Dynamic configs for topic buyurtmalar are:
  retention.ms=172800000 sensitive=false synonyms={DYNAMIC_TOPIC_CONFIG:retention.ms=172800000}
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --alter --add-config cleanup.policy=yoqol 2>&1 | grep -i error | head -2
Error while executing config command with args '--bootstrap-server localhost:9092 --entity-type topics --entity-name buyurtmalar --alter --add-config cleanup.policy=yoqol'
java.util.concurrent.ExecutionException: org.apache.kafka.common.errors.InvalidConfigurationException: Invalid value yoqol for configuration cleanup.policy: String must be one of: compact, delete
```

- `--describe` faqat topic uchun **alohida berilgan** (`DYNAMIC_TOPIC_CONFIG`) qiymatlarni ko'rsatadi. `synonyms` da server standarti ham bor: `max.message.bytes` uchun — `message.max.bytes=1048588`.
- `--delete-config` dan keyin `max.message.bytes` yana server standartiga qaytdi.
- Noto'g'ri qiymat qabul qilinmaydi: `cleanup.policy` faqat `compact` yoki `delete`.

### Partition qo'shish va kamaytirishga urinish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --alter --topic buyurtmalar --partitions 6; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic buyurtmalar | head -1 | cut -f1,3
Topic: buyurtmalar	PartitionCount: 6
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --alter --topic buyurtmalar --partitions 2 2>&1 | grep -i error | head -2
Error while executing topic command : The topic buyurtmalar currently has 6 partition(s); 2 would not be an increase.
[2026-11-10 07:47:45,236] ERROR org.apache.kafka.common.errors.InvalidPartitionsException: The topic buyurtmalar currently has 6 partition(s); 2 would not be an increase.
```

3 → 6 bo'ldi. 6 → 2 — xato: "2 would not be an increase".

### Nom uzunligi va o'chirish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic $(printf 'a%.0s' $(seq 250)) 2>&1 | grep -i error | head -1 | cut -c1-160
Error while executing topic command : Topic name is invalid: the length of 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic buyurtmalar; sleep 3; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list; docker exec kafka sh -c 'ls -d /tmp/kraft-combined-logs/buyurtmalar-* 2>/dev/null | wc -l'
__consumer_offsets
quickstart-events
6
$ docker exec kafka sh -c 'ls -d /tmp/kraft-combined-logs/buyurtmalar-* 2>/dev/null | sed "s/\.[0-9a-f]\{32\}/.<id>/" | head -3'
/tmp/kraft-combined-logs/buyurtmalar-0.<id>-delete
/tmp/kraft-combined-logs/buyurtmalar-1.<id>-delete
/tmp/kraft-combined-logs/buyurtmalar-2.<id>-delete
$ sleep 60; docker exec kafka sh -c 'ls -d /tmp/kraft-combined-logs/buyurtmalar-* 2>/dev/null | wc -l'
0
```

- 250 belgili nom — rad etildi (chegara — 249).
- O'chirilgan topic darhol ro'yxatdan chiqdi, lekin papkalari avval `…-delete` deb qayta nomlandi. Bir daqiqadan keyin diskdan ham o'chdi — `file.delete.delay.ms` standarti 60000 (1 daqiqa).

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Production topic | Qo'lda yaratish: partition va replication factor o'ylab |
| Bitta topic'ning saqlash muddati boshqacha | `--config` yoki `kafka-configs.sh --add-config` |
| Ko'proq parallel consumer | Partition qo'shish — kalit taqsimoti o'zgarishini hisobga olib |
| Partition kamaytirish | Mumkin emas — yangi topic va ko'chirish |
| Hamma topic'ga standart | Server sozlamasi (29-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kam partition bilan boshlab, keyin "qo'shib qo'yaman" deb o'ylash | Kalit taqsimoti va tartib o'zgaradi (KD) | Kerakli sonni oldindan |
| Replication factor 1 production'da | Bitta server — ma'lumot yo'qolishi | 2 yoki 3 (KD) |
| Ichki topic'larga partition qo'shish | Koordinator mantig'i buziladi (KD) | Hech qachon |
| Partition'ni kamaytirmoqchi bo'lish | Qo'llanmaydi (KD, sinovda) | Yangi topic |
| O'chirilgan topic disk joyi darhol bo'shaydi deb kutish | `file.delete.delay.ms` (sinovda 1 daqiqa) | Biroz kutish |

## Amaliyot

1. Replication factor 3 bo'lsa, nechta server ishdan chiqsa ham ma'lumot qoladi?
2. Partition soni nimalarga ta'sir qiladi?
3. Topic sozlamasini standartga qanday qaytarasiz?
4. Sinovda partition sonini 2 ga tushirish nega ishlamadi?
5. Topic nomi nega 249 belgidan oshmaydi?

<details>
<summary>Javoblar</summary>

1. 2 tagacha.
2. Har partition bitta serverga sig'ishi kerak, topic nechta serverga tarqalishi va consumer'larning eng ko'p parallelligi.
3. `kafka-configs.sh … --alter --delete-config <nom>`.
4. Kafka partition'larni kamaytirishni qo'llamaydi.
5. Papka nomi `<topic>-<partition>` va 255 belgidan oshmasligi kerak (partition raqami uchun joy qoladi).

</details>

## Rasmiy hujjat

- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Adding and removing topics, Modifying topics
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/)
