# 10 — Xabar qancha saqlanadi

[Mundarija](README.md)

## Tushuncha

Ikki xil yondashuv bor (2-bob):

| Yondashuv | Xabar qachon o'chadi | Qayta o'qish |
| --- | --- | --- |
| **Navbat** (RabbitMQ classic/quorum navbati) | Consumer tasdiqlashi bilan | Yo'q — o'qish xabarni olib ketadi |
| **Jurnal** (RabbitMQ stream, Kafka topic, Redis stream) | **Saqlash qoidasi** (retention) bo'yicha: yoshi yoki hajmi chegaradan oshganda | Ha — o'qish o'chirmaydi, istalgan o'quvchi boshidan o'qiy oladi |

Jurnalda o'qish va o'chirish bir-biridan mustaqil: o'quvchilar soni va tezligi saqlash muddatiga ta'sir qilmaydi. Bu kechikib qo'shilgan xizmatga tarixni o'qish imkonini beradi. Lekin disk cheksiz emas — chegara albatta qo'yiladi.

### Uch tizimda saqlash qoidalari

| Tizim | Yoshi bo'yicha | Hajmi bo'yicha | Qanday ishlaydi |
| --- | --- | --- | --- |
| **RabbitMQ stream** (RQ Streams) | `x-max-age` (`7D`, `1h` …) | `x-max-length-bytes` | Stream — o'zgarmas, faqat qo'shiladigan disk jurnali. Chegarasiz u disk tugaguncha o'sadi. Qoida **segment** bo'yicha tekshiriladi (`x-stream-max-segment-size-bytes`). Xabari bor kamida bitta segment doim qoladi. Siyosat (policy) argumentdan ustun |
| **Kafka topic** (KD Topic Configs) | `retention.ms` (broker standarti — 168 soat) | `retention.bytes` | Partition log'i segmentlarga bo'linadi. Muddati o'tgan **butun segmentlar** fonda o'chiriladi (Kafka kitobi, 8-bob) |
| **Redis stream** (RD XTRIM) | `MINID` (ID vaqtga asoslangan) | `MAXLEN` (yozuvlar soni) | Avtomatik emas: `XTRIM` yoki `XADD ... MAXLEN` bilan **qo'lda**. `~` — taxminiy, samaraliroq qisqartirish |

### Redis 8.2+: consumer group'larni hisobga olib qisqartirish (RD XTRIM)

| Opsiya | Ma'nosi |
| --- | --- |
| `KEEPREF` (standart) | Qoidaga ko'ra o'chiradi; consumer group'lardagi havolalar qoladi |
| `DELREF` | O'chiradi va guruhlarning PEL'idagi havolalarni ham o'chiradi |
| `ACKED` | Faqat **barcha** consumer group'lar o'qib, tasdiqlagan yozuvlarni o'chiradi |

`ACKED` Redis stream'ini navbatga yaqinlashtiradi: ishlangan yozuvlar o'chadi, ishlanmaganlari qoladi.

## Uch tizimda

### RabbitMQ: navbat va stream

```text vps
$ rabbitmqadmin queues declare --name navbat --durable true >/dev/null; for i in 1 2 3; do rabbitmqadmin publish message --routing-key navbat --payload "buyurtma #$i" >/dev/null; done; rabbitmqadmin get messages --queue navbat --count 3 --ack-mode ack_requeue_false >/dev/null; rabbitmqctl -q list_queues name messages | grep -E '^navbat'; rabbitmqadmin queues delete --name navbat
navbat	0
```

Oddiy navbat: uch xabar o'qilib tasdiqlandi — navbatda **0**. Ularni qayta o'qib bo'lmaydi.

```text vps
$ rabbitmqadmin queues declare --name tarix --type stream --durable true --arguments '{"x-max-length-bytes": 4000, "x-stream-max-segment-size-bytes": 1000}' >/dev/null; for i in $(seq 1 60); do rabbitmqadmin publish message --routing-key tarix --payload "$(printf 'buyurtma #%02d %080d' $i 0)" >/dev/null; done; cd /root/rabbit-ilova && node boshi.js "1-o'quvchi"; node boshi.js "2-o'quvchi"
1-o'quvchi: 3 ta, birinchisi "buyurtma #58 00000000000000000000000000000000000000000000000000000000000000000000000000000000"
2-o'quvchi: 3 ta, birinchisi "buyurtma #58 00000000000000000000000000000000000000000000000000000000000000000000000000000000"
$ rabbitmqadmin queues delete --name tarix; rm /root/rabbit-ilova/boshi.js
```

- Stream'ga 60 ta ~95 baytli xabar yozildi. Chegara: 4000 bayt, segment 1000 bayt.
- Ikkala o'quvchi ham boshidan o'qidi va bir xil natija oldi — o'qish o'chirmaydi.
- Lekin boshida `#01` emas, `#58` turibdi: eski segmentlar saqlash qoidasi bo'yicha o'chirildi. Qolgan 3 xabar chegaradan ancha kam — kuzatildi: o'chirish butun segmentlar bilan bo'ladi, shuning uchun qolgan hajm chegaraga teng bo'lmaydi.

### Redis: `XTRIM`

```text vps
$ for i in $(seq 1 10); do redis-cli XADD tarix '*' buyurtma $i >/dev/null; done; redis-cli XGROUP CREATE tarix ishchilar 0 >/dev/null; for id in $(redis-cli XREADGROUP GROUP ishchilar w1 COUNT 3 STREAMS tarix '>' | grep -E '^[0-9]+-[0-9]+$'); do redis-cli XACK tarix ishchilar $id >/dev/null; done; echo "XLEN: $(redis-cli XLEN tarix) (3 tasi tasdiqlangan)"
XLEN: 10 (3 tasi tasdiqlangan)
$ echo "XTRIM MAXLEN 0 ACKED: $(redis-cli XTRIM tarix MAXLEN 0 ACKED) ta o'chirildi, XLEN: $(redis-cli XLEN tarix)"; echo "XTRIM MAXLEN 5: $(redis-cli XTRIM tarix MAXLEN 5) ta o'chirildi, XLEN: $(redis-cli XLEN tarix), birinchisi: buyurtma $(redis-cli XRANGE tarix - + COUNT 1 | tail -1)"; redis-cli DEL tarix >/dev/null
XTRIM MAXLEN 0 ACKED: 3 ta o'chirildi, XLEN: 7
XTRIM MAXLEN 5: 2 ta o'chirildi, XLEN: 5, birinchisi: buyurtma 6
```

- 10 yozuv, ulardan 3 tasi guruhda o'qilib tasdiqlangan.
- `MAXLEN 0 ACKED` — faqat o'sha 3 tasi o'chdi. Tasdiqlanmagan 7 tasi qoldi.
- `MAXLEN 5` — eng eskilaridan 2 tasi o'chdi, oxirgi 5 tasi qoldi (`buyurtma 6` dan boshlab). Bu tasdiqqa qaramaydi.

### Kafka: `retention.ms`

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tarix --config segment.bytes=1048576 --config retention.ms=60000 >/dev/null; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic tarix --num-records 3000 --record-size 1000 --throughput -1 --bootstrap-server localhost:9092 2>/dev/null | tail -1 | cut -d, -f1; for g in a b; do echo "$g-guruh o'qidi: $(docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic tarix --group $g --from-beginning --timeout-ms 10000 2>/dev/null | wc -l) ta"; done; echo "eng birinchi offset: $(docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic tarix --time -2)"
3000 records sent
a-guruh o'qidi: 3000 ta
b-guruh o'qidi: 3000 ta
eng birinchi offset: tarix:0:0
$ S=$(date +%s); for i in $(seq 1 20); do sleep 30; E=$(docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic tarix --time -2); [ "$E" != "tarix:0:0" ] && break; done; echo "~$(( ($(date +%s)-S)/60 )) daqiqadan keyin eng birinchi offset: $E"; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic tarix; for g in a b; do docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group $g >/dev/null 2>&1; done
~1 daqiqadan keyin eng birinchi offset: tarix:0:3000
```

- Ikki guruh bir xil 3000 yozuvni o'qidi — o'qish hech narsani o'chirmadi. Eng birinchi offset hali **0**.
- `retention.ms=60000` (1 daqiqa) — taxminan bir daqiqadan keyin eng birinchi offset **3000** bo'ldi: muddati o'tgan yozuvlar o'chirildi. Hech kim o'qimagan bo'lsa ham shunday bo'lardi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Stream/topic'ni chegarasiz qoldirish | Jurnal disk tugaguncha o'sadi (RQ) | `max-age`/`max-length-bytes`, `retention.ms`/`retention.bytes` |
| Kafka'da "hamma o'qidi, endi o'chadi" deb kutish | O'chirish faqat retention bo'yicha, o'qishga bog'liq emas (sinovda) | Kerakli muddatni sozlash |
| Retention'ni aniq yozuv soni deb hisoblash | O'chirish segmentlar bilan (RQ, KD, sinovda) | Segment o'lchamini ham hisobga olish |
| Redis stream'ni qisqartirmaslik | Redis xotirada — o'sib boradi | `XADD ... MAXLEN ~ N` yoki muntazam `XTRIM` |
| Redis'da `MAXLEN` bilan ishlanmagan yozuvlarni ham o'chirish | Tasdiqlanmaganlar yo'qoladi (sinovda) | `ACKED` (8.2+) |
| Kechikib qo'shiladigan xizmat uchun oddiy navbat | Tasdiqlangan xabarlar yo'q | Jurnal (stream, topic) |

## Amaliyot

1. Navbat va jurnalda xabar qachon o'chadi?
2. RabbitMQ stream va Kafka'da saqlash qoidasi qaysi birlikda bajariladi?
3. Sinovda RabbitMQ stream'ning boshida nega `#58` turdi?
4. Redis `XTRIM ... ACKED` nima qiladi?
5. Sinovda Kafka'da ikki guruh o'qigandan keyin eng birinchi offset nega 0 qoldi?

<details>
<summary>Javoblar</summary>

1. Navbatda — tasdiqlanganda; jurnalda — saqlash qoidasi (yosh yoki hajm) bo'yicha.
2. Segmentlar bilan.
3. Hajm chegarasidan oshgan eski segmentlar o'chirildi.
4. Faqat barcha consumer group'lar o'qib tasdiqlagan yozuvlarni o'chiradi.
5. O'qish o'chirmaydi; o'chirish faqat `retention.ms` tugaganda bo'ldi.

</details>

## Rasmiy hujjat

- [RQ: Streams](https://www.rabbitmq.com/docs/streams) — Data Retention
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `retention.ms`, `retention.bytes`, `segment.bytes`
- [RD: XTRIM](https://redis.io/docs/latest/commands/xtrim/) · [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/)
