# 07 — Log va offset

[Mundarija](README.md)

## Tushuncha

### Partition — log (KD Implementation → Log)

Har partition — **log** (jurnal): faqat oxiriga yoziladigan yozuvlar ketma-ketligi. `my-topic` ning ikki partition'i — ikki papka: `my-topic-0`, `my-topic-1`. Ularda xabarlar saqlanadigan ma'lumot fayllari bor.

| Qism | KD izohi |
| --- | --- |
| **Yozish** | Faqat ketma-ket, doim **oxirgi** faylga. Fayl belgilangan hajmga (masalan, 1 GB) yetganda yangi faylga o'tiladi |
| **Segment** | Log'ni tashkil qiluvchi fayllar. Fayl nomi — undagi **birinchi offset** |
| **Indeks** | Offset'dan fayldagi o'ringa (position) o'tish. Har fayl uchun xotiradagi diapazon bo'yicha ikkilik qidiruv |
| **O'chirish** | Ma'lumot **segment-segment** bilan o'chiriladi (8-bob) |

### Offset

**Offset** — partition ichidagi xabarning tartib raqami (64 bit). KD: dastlab har xabarga producer yaratgan noyob ID (GUID) berish rejalangan edi, lekin oxir-oqibat oddiy, har partition bo'yicha **monoton oshib boradigan** hisoblagich tanlangan. Offset partition ichida noyob.

### Consumer o'rni (KD Design → Consumer Position)

Ko'p xabar tizimlari qaysi xabar o'qilganini **broker'da**, har xabar uchun saqlaydi. Kafka boshqacha: partition'ni consumer group ichida bir vaqtda **aynan bitta** consumer o'qiydi. Shuning uchun consumer'ning har partition'dagi o'rni — **bitta son**: keyingi o'qiladigan xabar offset'i. "Nima o'qilgan" holati juda kichik — har partition uchun bitta raqam — va uni vaqti-vaqti bilan saqlab qo'yish (checkpoint) mumkin. Bu xabarlarni tasdiqlashni ancha arzonlashtiradi.

Qo'shimcha foyda: consumer ataylab **eski offset'ga qaytib**, ma'lumotni qayta o'qiy oladi. KD: bu navbatning odatiy shartini buzadi, lekin ko'p holatda zarur. Masalan, consumer kodidagi xato topilsa, tuzatilgandan keyin xabarlar qayta ishlanadi.

## Buyruqlar va kod

VPS'da. Segmentlarni ko'rish uchun topic'ning `segment.bytes` qiymati eng kichik ruxsat etilganiga — 1 MiB ga qo'yiladi (KD Topic Configs: `[1048576,...]`). 1000 baytli 3000 ta xabar yoziladi:

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic jurnal --partitions 1 --config segment.bytes=1048576
Created topic jurnal.
$ docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic jurnal --num-records 3000 --record-size 1000 --throughput -1 --command-property bootstrap.servers=localhost:9092 2>&1 | tail -1 | cut -c1-80
3000 records sent, 926.784059 records/sec (0.88 MB/sec), 733.45 ms avg latency, 
$ docker exec kafka sh -c 'ls -l /tmp/kraft-combined-logs/jurnal-0/ | awk "NR>1 {print \$5, \$9}"'
504 00000000000000000000.index
1038190 00000000000000000000.log
732 00000000000000000000.timeindex
504 00000000000000001025.index
1037120 00000000000000001025.log
56 00000000000000001025.snapshot
720 00000000000000001025.timeindex
10485760 00000000000000002049.index
963219 00000000000000002049.log
56 00000000000000002049.snapshot
10485756 00000000000000002049.timeindex
8 leader-epoch-checkpoint
43 partition.metadata
```

Uchta segment: `…0000.log`, `…1025.log`, `…2049.log`. Har biri ~1 MiB, nomi — birinchi offset'i. Har segmentda `.index` (offset → o'rin) va `.timeindex` (vaqt → offset) bor. Oxirgi — **faol** segmentning indeks fayllari 10 MiB: ular oldindan joy ajratadi, segment yopilganda qisqartiriladi (KD: `segment.index.bytes`).

### Offset'lar

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic jurnal; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic jurnal --time -2
jurnal:0:3000
jurnal:0:0
$ docker exec kafka sh -c 'S=$(ls /tmp/kraft-combined-logs/jurnal-0/*.log | sed -n 2p); /opt/kafka/bin/kafka-dump-log.sh --files $S 2>/dev/null | sed -n "1,2p;4p"' | cut -c1-200
Dumping /tmp/kraft-combined-logs/jurnal-0/00000000000000001025.log
Log starting offset: 1025
baseOffset: 1041 lastOffset: 1056 count: 16 baseSequence: 1041 lastSequence: 1056 producerId: 11 producerEpoch: 0 partitionLeaderEpoch: 0 isTransactional: false isControl: false deleteHorizonMs: Optio
$ docker exec kafka sh -c 'S=$(ls /tmp/kraft-combined-logs/jurnal-0/*.index | sed -n 2p); /opt/kafka/bin/kafka-dump-log.sh --files $S 2>/dev/null | sed -n "1,4p"'
Dumping /tmp/kraft-combined-logs/jurnal-0/00000000000000001025.index
offset: 1056 position: 16205
offset: 1072 position: 32410
offset: 1088 position: 48615
```

- `kafka-get-offsets.sh` — log oxiri (keyingi yoziladigan offset): 3000. `--time -2` — eng birinchi: 0.
- `kafka-dump-log.sh` — segment ichi: `Log starting offset: 1025`. Xabarlar **batch**'larda (masalan, 1041–1056, 16 ta).
- Indeks har xabar uchun emas, oraliq bilan yozilgan: offset 1056 → 16205-bayt, 1072 → 32410-bayt…

### Consumer o'rni

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic jurnal --bootstrap-server localhost:9092 --group hisobot --from-beginning --max-messages 1000 2>/dev/null | wc -l; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot 2>/dev/null | awk '{print $2, $3, $4, $5, $6}' | column -t
1000
TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
jurnal  0          1000            3000            2000
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic jurnal --bootstrap-server localhost:9092 --group hisobot --max-messages 500 2>/dev/null | wc -l; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot 2>/dev/null | awk '{print $2, $3, $4, $5, $6}' | column -t
500
TOPIC   PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
jurnal  0          1500            3000            1500
```

Consumer group `hisobot` 1000 xabar o'qidi. Uning o'rni — `CURRENT-OFFSET` 1000, log oxiri — 3000, `LAG` (orqada qolish) — 2000. Yana 500 o'qildi — o'rin 1500, guruh to'xtagan joyidan davom etdi.

### Orqaga qaytish

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group hisobot --topic jurnal --reset-offsets --to-offset 100 --execute 2>/dev/null | awk '{print $1, $2, $3, $4}' | column -t
GROUP    TOPIC   PARTITION  NEW-OFFSET
hisobot  jurnal  0          100
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic jurnal --bootstrap-server localhost:9092 --group hisobot --max-messages 1 --formatter-property print.offset=true 2>/dev/null | cut -c1-30
Offset:100	IPWABKZFINRVTEPMEVV
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group hisobot 2>/dev/null; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic jurnal
Deletion of requested consumer groups ('hisobot') was successful.
```

Guruh o'rni 100 ga qaytarildi va keyingi o'qish aynan 100-offset'dan boshlandi — xabarlar qayta o'qildi. Offset'ni boshqarish — 16-bob.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Log hajmini ko'rish | `ls` partition papkasi, `kafka-log-dirs.sh` |
| Segment ichini ko'rish | `kafka-dump-log.sh --files` |
| Partition boshi va oxiri | `kafka-get-offsets.sh` (`--time -2`/`-1`) |
| Guruh qayerda | `kafka-consumer-groups.sh --describe` |
| Qayta o'qish | `--reset-offsets` (`--to-offset`, `--to-earliest`, `--to-datetime`) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Offset'ni butun topic bo'yicha noyob deb hisoblash | Faqat partition ichida (KD) | `(topic, partition, offset)` |
| Broker har xabarning "o'qilgan"ini saqlaydi deb o'ylash | Guruhning bitta offset'i (KD) | Offset commit (16-bob) |
| `segment.bytes` ni juda katta qo'yish | Saqlash va tozalash segment bo'yicha — nozik nazorat yo'qoladi (KD Topic Configs) | Standart yoki o'ylab |
| Qayta o'qishni imkonsiz deb o'ylash | Offset'ni qaytarish mumkin (KD, sinovda) | `--reset-offsets` |

## Amaliyot

1. Segment fayl nomi nimani bildiradi?
2. Nega Kafka "o'qildi" holatini har xabar uchun saqlamaydi?
3. Sinovda `hisobot` guruhining LAG'i 2000 edi. Bu nimani anglatadi?
4. Consumer kodidagi xato topilsa, Kafka'da nima qilish mumkin?

<details>
<summary>Javoblar</summary>

1. Segmentdagi birinchi xabarning offset'i.
2. Partition guruhda bitta consumer'ga beriladi, shuning uchun o'rni bitta son (offset) bilan ifodalanadi.
3. Guruh log oxiridan 2000 xabar orqada — hali o'qilmagan.
4. Xato tuzatilgach, offset'ni orqaga qaytarib xabarlarni qayta o'qish.

</details>

## Rasmiy hujjat

- [KD: Implementation → Log](https://kafka.apache.org/44/implementation/log/)
- [KD: Design → Consumer Position](https://kafka.apache.org/44/design/design/)
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `segment.bytes`, `segment.index.bytes`
