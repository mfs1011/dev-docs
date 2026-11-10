# 06 — Partition va kalit

[Mundarija](README.md)

## Tushuncha

### Kim partition'ni tanlaydi (KD Design → The Producer)

Producer ma'lumotni oraliq yo'naltiruvchisiz to'g'ridan-to'g'ri partition **lideri** bo'lgan broker'ga yuboradi. Qaysi partition'ga yozishni **klient** hal qiladi: tasodifiy (yuklamani taqsimlash uchun) yoki ma'noli qoida bilan. Ma'noli qoida — **kalit**: kalit xeshlanadi va partition tanlanadi. Masalan, kalit — foydalanuvchi ID'si bo'lsa, o'sha foydalanuvchining barcha ma'lumoti **bitta partition**'ga tushadi. Consumer shunga tayanib, bir foydalanuvchining hodisalarini bir joyda ishlay oladi.

KD (Introduction): partition o'quvchisi hodisalarni **aynan yozilgan tartibda** o'qiydi. Tartib kafolati — faqat **bitta partition ichida**.

### Standart qoida (KD Producer Configs → `partitioner.class`)

| Holat | Partition |
| --- | --- |
| Partition aniq berilgan | O'sha |
| Kalit bor | Kalit **xeshi** bo'yicha |
| Kalit yo'q | **Sticky** (yopishqoq) partition: kamida `batch.size` bayt yozilguncha bitta partition, keyin boshqasi |
| `RoundRobinPartitioner` | Kalitdan qat'i nazar navbatma-navbat (KD: yangi batch yaratilganda notekis taqsimlanishi mumkin — KAFKA-9965) |

`partitioner.ignore.keys=true` — kalit partition tanlashda ishlatilmaydi.

### Partition qo'shish xavfi (KD Basic Operations)

Kalit `hash(key) % partition_soni` bilan tarqatilsa, partition soni oshganda **bir xil kalitli xabarlar boshqa partition'ga** tusha boshlashi mumkin. Natijada bitta kalitning eski va yangi hodisalari ikki partition'da qoladi — ular orasidagi tartib kafolatlanmaydi.

## Buyruqlar va kod

VPS'da (Kafka 4.4.0). Konsol producer'da `kalit:qiymat` qatorlari: `--reader-property parse.key=true --reader-property key.separator=:`. Consumer partition, offset va kalitni ko'rsatadi.

### Kalit → partition

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tolovlar --partitions 3
Created topic tolovlar.
$ printf 'ali:1-tolov\nvali:1-tolov\nsoli:1-tolov\nali:2-tolov\nvali:2-tolov\nali:3-tolov\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic tolovlar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic tolovlar --from-beginning --bootstrap-server localhost:9092 --max-messages 6 --formatter-property print.key=true --formatter-property print.partition=true --formatter-property print.offset=true 2>&1 | grep -v KIP-848 | sort
Partition:0	Offset:0	ali	1-tolov
Partition:0	Offset:1	vali	1-tolov
Partition:0	Offset:2	ali	2-tolov
Partition:0	Offset:3	vali	2-tolov
Partition:0	Offset:4	ali	3-tolov
Partition:2	Offset:0	soli	1-tolov
Processed a total of 6 messages
$ docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic tolovlar
tolovlar:0:5
tolovlar:1:0
tolovlar:2:1
```

- `ali` va `vali` — partition 0, `soli` — partition 2, partition 1 — bo'sh. Xesh **teng taqsimotni** kafolatlamaydi.
- Bir kalit ichida tartib saqlangan: `ali` — 1, 2, 3 (offset 0, 2, 4).
- `kafka-get-offsets.sh` — har partition'dagi oxirgi offset (`topic:partition:offset`).

### Partition qo'shilgandan keyin

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --alter --topic tolovlar --partitions 6; sleep 5; printf 'ali:4-tolov\nvali:3-tolov\nsoli:2-tolov\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic tolovlar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic tolovlar --from-beginning --bootstrap-server localhost:9092 --max-messages 9 --formatter-property print.key=true --formatter-property print.partition=true --formatter-property print.offset=true 2>&1 | grep -v KIP-848 | sort -k3
Partition:0	Offset:0	ali	1-tolov
Partition:0	Offset:2	ali	2-tolov
Partition:0	Offset:4	ali	3-tolov
Partition:3	Offset:0	ali	4-tolov
Partition:2	Offset:0	soli	1-tolov
Partition:5	Offset:0	soli	2-tolov
Partition:0	Offset:1	vali	1-tolov
Partition:0	Offset:3	vali	2-tolov
Partition:3	Offset:1	vali	3-tolov
Processed a total of 9 messages
```

3 → 6 partition. Endi `ali:4` va `vali:3` — partition **3**, `soli:2` — partition **5**. Bitta mijozning to'lovlari ikki partition'ga bo'lindi: `ali` 1–3 partition 0 da, 4 esa partition 3 da.

<div data-animatsiya="qadamli" data-nom="kalit-partition"></div>

### Kalitsiz hodisalar

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic kalitsiz; sleep 2; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic kalitsiz --partitions 3
Created topic kalitsiz.
$ printf 'a\nb\nc\nd\ne\nf\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic kalitsiz --bootstrap-server localhost:9092; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic kalitsiz
kalitsiz:0:0
kalitsiz:1:6
kalitsiz:2:0
$ printf 'g\nh\ni\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic kalitsiz --bootstrap-server localhost:9092; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic kalitsiz
kalitsiz:0:3
kalitsiz:1:6
kalitsiz:2:0
$ printf 'a\nb\nc\nd\ne\nf\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic kalitsiz --bootstrap-server localhost:9092 --producer-property partitioner.class=org.apache.kafka.clients.producer.RoundRobinPartitioner; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic kalitsiz
Warning: --producer-property is deprecated and will be removed in a future version. Use --command-property instead.
kalitsiz:0:5
kalitsiz:1:8
kalitsiz:2:2
$ for t in tolovlar kalitsiz; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done
```

- Kalitsiz 6 hodisa **bittasi** — partition 1 ga tushdi: sticky partition, kichik yozuvlar bitta batch'da.
- Keyingi producer (yangi jarayon) 3 hodisani boshqa partition'ga (0) yozdi.
- `RoundRobinPartitioner` bilan 6 hodisa uchala partition'ga 2 tadan taqsimlandi (0: 3→5, 1: 6→8, 2: 0→2).
- Kuzatildi: konsol producer'da `--producer-property` 4.4 da eskirgan — `--command-property` ishlatilsin.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Bir obyekt (mijoz, buyurtma) hodisalari tartibda | Kalit = obyekt ID'si |
| Tartib muhim emas, yuklama teng bo'lsin | Kalitsiz (sticky) yoki `RoundRobinPartitioner` |
| O'z qoidam | `Partitioner` interfeysi (KD) |
| Partition soni o'zgarishi mumkin | Oldindan yetarli partition; keyin qo'shilsa — kalit ko'chishini hisobga olish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Butun topic bo'yicha tartib kutish | Tartib faqat partition ichida (KD) | Kalit bilan bir partition'ga |
| Kalitli topic'ga partition qo'shish | Bir xil kalit boshqa partition'ga ko'chadi (KD, sinovda) | Oldindan rejalash |
| Kalitlar teng taqsimlanadi deb kutish | Xesh — ehtimolli, sinovda partition 1 bo'sh qoldi | Ko'p xil kalit, yuklamani kuzatish |
| Bitta "issiq" kalit (masalan, barcha hodisa bir mijozdan) | Bitta partition va bitta consumer zo'riqadi | Kalitni maydaroq tanlash |

## Amaliyot

1. Kalit bor hodisa uchun partition qanday tanlanadi?
2. Kalitsiz hodisalar standartda qanday taqsimlanadi?
3. Sinovda partition sonini oshirgandan keyin `ali` bilan nima bo'ldi?
4. Tartib kafolati qayerda amal qiladi?

<details>
<summary>Javoblar</summary>

1. Kalit xeshi bo'yicha.
2. Sticky partition: `batch.size` bayt yozilguncha bitta partition'ga.
3. Yangi hodisasi boshqa partition'ga (3) tushdi, eskilari partition 0 da qoldi.
4. Bitta partition ichida.

</details>

## Rasmiy hujjat

- [KD: Design → The Producer](https://kafka.apache.org/44/design/design/)
- [KD: Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) — `partitioner.class`, `partitioner.ignore.keys`
- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Modifying topics
- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/)
