# 11 — Ishni ko'p consumer'ga bo'lish

[Mundarija](README.md)

## Tushuncha

Bitta consumer ulgurmasa, ularni ko'paytiramiz. Har xabarni **bittasi** olishi kerak (ish navbati, 2-bob). Uch tizimda bo'lish turlicha:

| Tizim | Bo'lish birligi | Consumer'lar soni chegarasi | Kim qancha oladi |
| --- | --- | --- | --- |
| **RabbitMQ** navbati | Har xabar | Yo'q | Navbat consumer'larga navbat bilan beradi. **Prefetch** — consumer'da bir vaqtda nechta tasdiqlanmagan xabar bo'lishi mumkin |
| **Kafka** consumer group | **Partition** | Partition'lar soni: ortiqcha consumer bo'sh turadi | Har partition guruhda aynan bitta consumer'ga beriladi (KD) |
| **Kafka** share group | Yozuvlar (vaqtinchalik qulf bilan) | Yo'q: consumer'lar partition'dan ko'p bo'lishi mumkin (KD) | Consumer olgan yozuvlar 30 soniyalik qulf bilan unga band qilinadi |
| **Redis** stream consumer group | Har yozuv | Yo'q | Har `XREADGROUP` yangi yozuvlarni so'ragan consumer'ga beradi (RD) |

### RabbitMQ: prefetch (RQ Consumer Prefetch, Confirms)

- Prefetch (`basic.qos`) — kanalda bir vaqtda ruxsat etilgan **tasdiqlanmagan** yetkazishlar soni. Chegaraga yetganda RabbitMQ consumer'lardan biri tasdiqlamaguncha yangi xabar yubormaydi. `0` — chegarasiz.
- RabbitMQ'da `prefetch_count` AMQP spetsifikatsiyasidan farqli: u kanalning har **yangi consumer**'iga alohida qo'llanadi.
- Prefetch oshsa — yetkazish tezlashadi, lekin consumer'da ishlanmagan xabarlar to'planadi va xotira o'sadi. RQ: odatda **100–300** optimal; **1** — eng ehtiyotkor, lekin o'tkazuvchanlikni ancha kamaytiradi.

### Kafka: consumer group va share group (KD Design → The Share Consumer)

- Consumer group'da partition guruhda bir vaqtda bitta consumer'ga beriladi. Bu tartib va kengayishni birga beradi, lekin consumer'lar soni partition'lar sonidan oshmasligi kerak.
- KD: an'anaviy xabar almashish ishlari consumer group'ga yaxshi mos kelmaydi. **Share group**'da:
  - consumer'lar yozuvlarni birgalikda iste'mol qiladi, bitta partition bir nechta consumer'ga berilishi mumkin;
  - consumer'lar soni partition'lardan ko'p bo'lishi mumkin;
  - yozuvlar alohida tasdiqlanadi va yetkazish urinishlari sanaladi (9-bob).
- Olingan yozuv vaqtinchalik **qulf** bilan band qilinadi (standart 30 soniya, `share.record.lock.duration.ms`). Bu vaqt ichida guruhning boshqa consumer'lari uni ola olmaydi. Consumer yozuvni tasdiqlaydi, qaytaradi (release), rad etadi (reject) yoki qulfni uzaytiradi. Hech narsa qilmasa — qulf o'zi ochiladi.

### Redis: consumer group (RD XREADGROUP)

Stream va bir nechta klient bo'lsa: hamma klient hamma xabarni olishi kerak bo'lsa, consumer group kerak emas. Stream klientlar orasida **bo'linishi** kerak bo'lsa — consumer group. Guruhda har xabarning bitta egasi bo'ladi.

## Uch tizimda

### RabbitMQ: prefetch va sekin ishchi

```js
// Bitta navbat, ikki ishchi: tez (50 ms) va sekin (500 ms). Prefetch ishning taqsimotini qanday o'zgartiradi
const amqp = require('amqplib');
const prefetch = Number(process.argv[2]), N = 20;
(async () => {
  const c = await amqp.connect('amqp://localhost'); const yub = await c.createChannel();
  await yub.assertQueue('ishlar', { durable: true });
  const soni = { tez: 0, sekin: 0 }; let jami = 0, t, tugadi; const tugash = new Promise(r => tugadi = r);
  for (const [nom, ms] of [['tez', 50], ['sekin', 500]]) {          // avval ikkala ishchi ulanadi
    const ch = await c.createChannel(); await ch.prefetch(prefetch);
    await ch.consume('ishlar', m => m && setTimeout(() => { ch.ack(m); soni[nom]++; if (++jami === N) tugadi(); }, ms));
  }
  t = Date.now();
  for (let i = 1; i <= N; i++) yub.sendToQueue('ishlar', Buffer.from(String(i)));   // keyin 20 ta ish
  await tugash;
  console.log(`prefetch=${prefetch}: tez=${soni.tez}, sekin=${soni.sekin}, vaqt ${((Date.now() - t) / 1000).toFixed(1)} s`);
  await yub.deleteQueue('ishlar'); await c.close();
})();
```

```text vps
$ cd /root/rabbit-ilova && node bolish.js 50; node bolish.js 1; rm bolish.js
prefetch=50: tez=10, sekin=10, vaqt 0.5 s
prefetch=1: tez=18, sekin=2, vaqt 1.0 s
```

| Prefetch | Tez (50 ms) | Sekin (500 ms) | Umumiy vaqt |
| --- | --- | --- | --- |
| 50 | 10 | 10 | 5,0 s |
| 1 | 18 | 2 | 1,0 s |

- Prefetch 50 bo'lganda navbat 20 ta ishni ikkiga teng bo'lib, oldindan **tarqatib yubordi**. Tez ishchi o'z ulushini tugatib bo'sh turdi, sekin ishchi esa 10 ta ishni 5 soniya ishladi.
- Prefetch 1 bo'lganda har ishchi navbatdagi ishni faqat oldingisini tasdiqlagach oldi. Tez ishchi 18 ta, sekini 2 ta ish oldi — ish **imkoniyatga qarab** bo'lindi, umumiy vaqt 5 marta qisqardi.
- Bu misolda ish og'ir va tarmoq kechikishi kichik, shuning uchun 1 yutdi. Ish yengil bo'lsa, past prefetch o'tkazuvchanlikni kamaytiradi (RQ) — qiymat sinab tanlanadi.

### Redis: consumer group

```text vps
$ for i in $(seq 1 6); do redis-cli XADD ishlar '*' ish $i >/dev/null; done; redis-cli XGROUP CREATE ishlar ishchilar 0 >/dev/null; for w in w1 w2 w1; do echo "$w oldi: $(redis-cli XREADGROUP GROUP ishchilar $w COUNT 2 STREAMS ishlar '>' | grep -v -E '^(ishlar|ish|[0-9]+-[0-9]+)$' | tr '\n' ' ')"; done; redis-cli XINFO CONSUMERS ishlar ishchilar | paste - - - - - - - - | awk '{print $2": kutilayotgan "$4}'; redis-cli DEL ishlar >/dev/null
w1 oldi: 1 2 
w2 oldi: 3 4 
w1 oldi: 5 6 
w1: kutilayotgan 4
w2: kutilayotgan 2
```

Har `XREADGROUP` keyingi yangi yozuvlarni so'ragan consumer'ga berdi. `w1` 4 ta, `w2` 2 ta oldi — har yozuvning bitta egasi. Tasdiqlanmagan yozuvlar har consumer'ning PEL'ida.

### Kafka: consumer group va share group

2 partition'li topic, har guruhda 3 tadan consumer, 12 ta yozuv:

```text vps
$ K=/opt/kafka/bin; mkdir -p /root/bolish && cd /root/bolish && rm -f *.txt; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic ishlar --partitions 2 >/dev/null; docker exec kafka $K/kafka-configs.sh --bootstrap-server localhost:9092 --alter --entity-type groups --entity-name ulush --add-config share.auto.offset.reset=earliest >/dev/null; for c in 1 2 3; do (docker exec kafka $K/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic ishlar --group guruh --from-beginning --timeout-ms 40000 > g$c.txt 2>/dev/null &); (docker exec kafka $K/kafka-console-share-consumer.sh --bootstrap-server localhost:9092 --topic ishlar --group ulush --timeout-ms 40000 > s$c.txt 2>/dev/null &); done; sleep 20
$ K=/opt/kafka/bin; cd /root/bolish && for i in $(seq 1 12); do echo "k$i:ish-$i"; done | docker exec -i kafka $K/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic ishlar --reader-property parse.key=true --reader-property key.separator=: ; sleep 5; echo "guruh a'zolaridagi partition'lar: $(docker exec kafka $K/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group guruh --members 2>/dev/null | awk '$NF ~ /^[0-9]+$/ {print $NF}' | tr '\n' ' ')"; sleep 40; for c in 1 2 3; do echo "consumer group, $c-a'zo: $(wc -l < g$c.txt) ta | share group, $c-a'zo: $(wc -l < s$c.txt) ta"; done
guruh a'zolaridagi partition'lar: 1 1 0 
consumer group, 1-a'zo: 0 ta | share group, 1-a'zo: 4 ta
consumer group, 2-a'zo: 8 ta | share group, 2-a'zo: 8 ta
consumer group, 3-a'zo: 4 ta | share group, 3-a'zo: 0 ta
```

- **Consumer group**: a'zolarga 1, 1, 0 partition berildi — uchinchi a'zo **bo'sh** turdi. Yozuvlar 8 + 4 bo'lindi (kalitlarga qarab partition'larga).
- **Share group**: yozuvlar partition'ga qaramasdan a'zolarga bo'lindi (4 + 8). Kuzatildi: uchinchi a'zo 0 ta oldi — yozuvlar kam edi, birinchi olganlar ularni qulf bilan band qilib, partiyalab olishdi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| RabbitMQ'da chegarasiz prefetch (yoki avtomatik tasdiq) | Xabarlar bitta consumer'da to'planadi, xotira o'sadi (RQ) | Chegaralangan prefetch |
| Turli tezlikdagi ishchilarga katta prefetch | Sekin ishchi navbatdan oldindan olib qo'yadi (sinovda) | Kichikroq prefetch |
| Kafka consumer group'da partition'dan ko'p consumer | Ortiqchasi bo'sh turadi (KD, sinovda) | Partition'lar sonini oldindan yetarli qilish yoki share group |
| Kafka share group'da tartib kutish | Bir partition'ning yozuvlari turli consumer'larga ketadi | Tartib kerak bo'lsa — consumer group (8-bob) |
| Redis'da hammaga kerakli xabar uchun consumer group | Guruh xabarlarni bo'ladi — har biri faqat qismini oladi (RD) | Har xizmatga o'z guruhi yoki `XREAD` |

## Amaliyot

1. RabbitMQ'da prefetch nimani cheklaydi?
2. Sinovda prefetch 50 bo'lganda umumiy vaqt nega 5 soniya bo'ldi?
3. Kafka consumer group'da consumer'lar soni partition'dan ko'p bo'lsa nima bo'ladi?
4. Share group consumer group'dan qaysi jihatlari bilan farq qiladi?
5. Redis'da qachon consumer group kerak, qachon kerak emas?

<details>
<summary>Javoblar</summary>

1. Consumer'da bir vaqtda bo'lishi mumkin bo'lgan tasdiqlanmagan xabarlar sonini.
2. Ish teng bo'lib oldindan tarqatildi; sekin ishchi o'z 10 ta ishini 500 ms dan ishladi.
3. Ortiqcha consumer partition olmaydi va bo'sh turadi.
4. Partition bir nechta consumer'ga beriladi, consumer'lar partition'dan ko'p bo'lishi mumkin, yozuvlar alohida tasdiqlanadi va urinishlar sanaladi.
5. Stream klientlar orasida bo'linishi kerak bo'lsa — kerak; har klient hamma xabarni olishi kerak bo'lsa — kerak emas.

</details>

## Rasmiy hujjat

- [RQ: Consumer Prefetch](https://www.rabbitmq.com/docs/consumer-prefetch) · [RQ: Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) — Channel Prefetch Setting (QoS), Prefetch and Throughput
- [KD: Design → Consumer Position, The Share Consumer](https://kafka.apache.org/44/design/design/)
- [RD: XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/) · [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/)
