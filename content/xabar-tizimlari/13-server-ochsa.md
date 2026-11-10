# 13 — Server o'chsa nima yo'qoladi

[Mundarija](README.md)

## Tushuncha

Ikki xil nosozlik bor:

| Nosozlik | Nima bo'ladi | Nimadan himoya |
| --- | --- | --- |
| **Qayta ishga tushish** (yangilash, `kill -9`, elektr uzilishi) | Xotiradagi ma'lumot yo'qoladi, diskdagisi qoladi | Diskka yozish |
| **Mashina butunlay yo'qolishi** (disk buzildi, server o'chdi) | O'sha mashinadagi hamma narsa yo'qoladi | **Replikatsiya** — boshqa mashinadagi nusxa |

### Uch tizimda

| Tizim | Diskka yozish | Replikatsiya | Nimani yo'qotishi mumkin |
| --- | --- | --- | --- |
| **RabbitMQ** | Durable navbat + **persistent** xabar. Quorum navbat va stream xabarlarni doim diskka yozadi | **Quorum navbat** — Raft konsensus algoritmi | Classic navbatdagi transient xabarlar — qayta ishga tushishda. Quorum navbat: confirm berilgan xabar ko'pchilik replikada bor |
| **Kafka** | Log diskda (fsync — OS'ga, 34-bob) | Partition replikalari, **ISR** | `acks=all` + `min.insync.replicas` bilan tasdiqlangan yozuv kamida bitta in-sync replika tirik ekan yo'qolmaydi (6-bob) |
| **Redis** | RDB (davriy surat) va/yoki AOF (buyruqlar jurnali) — ixtiyoriy | **Asinxron** replika, Sentinel failover | Oxirgi suratdan keyingi yozuvlar (faqat RDB); failover'da replikaga yetmagan yozuvlar |

### RabbitMQ (RQ Queues → Durability, Quorum Queues)

- Durable navbat metama'lumoti diskda. Muhim ma'lumot uchun ilova **durable navbat** ishlatishi va xabarlarni **persistent** deb belgilashi kerak.
- Tugun ishga tushganda durable navbatlar tiklanadi, ulardagi persistent xabarlar bilan birga. **Transient** xabarlar tiklashda tashlanadi — durable navbatda saqlangan bo'lsa ham.
- RabbitMQ 4.3'dan beri transient (non-durable), exclusive bo'lmagan classic navbatlarni standartda e'lon qilib bo'lmaydi.
- Quorum: a'zolarning ko'pchiligi — `(N/2)+1`. Publisher confirm xabar a'zolarning ko'pchiligiga nusxalangach beriladi. 3 tugunli klaster bitta tugun yo'qolishiga chidaydi. Sinov: RabbitMQ kitobi, 12- va 32-boblar.

### Kafka (KD Design → Replication)

Topic partition'lari bir nechta broker'ga nusxalanadi. Leader'ga ergashib ulgurayotgan replikalar — **ISR**. Yozuv barcha ISR uni olgach "commit qilingan" hisoblanadi va consumer faqat shularni ko'radi. Leader o'lsa, ISR'dan yangisi saylanadi. Sinov: Kafka kitobi, 20- va 23-boblar.

### Redis (RD Persistence, Replication, Sentinel)

- **RDB** — belgilangan nuqtalarda surat. RD: ma'lumot yo'qolishini kamaytirish kerak bo'lsa, RDB yaxshi emas — oxirgi suratdan keyingi yozuvlar yo'qoladi.
- **AOF** — har yozish buyrug'i jurnalga yoziladi. Standart `appendfsync everysec`: falokatda **1 soniyalik** ma'lumot yo'qolishi mumkin. `always` — juda sekin, juda xavfsiz.
- Replikatsiya asinxron. RD Sentinel: Sentinel + Redis tizimi failover'da **tasdiqlangan yozuvlar saqlanishini kafolatlamaydi**. Ba'zi joylashtirishlar yo'qotish oynasini kichraytiradi. Sinov: Redis kitobi, 28, 30 va 31-boblar.

## Uch tizimda

Bitta VPS'da — qayta ishga tushish va `kill -9`. Klaster sinovlari yuqorida ko'rsatilgan boblarda.

### RabbitMQ: persistent va transient

```text vps
$ rabbitmqadmin queues declare --name tiklanish --durable true >/dev/null; rabbitmqadmin publish message --routing-key tiklanish --payload "doimiy" --properties '{"delivery_mode":2}'; rabbitmqadmin publish message --routing-key tiklanish --payload "vaqtinchalik" --properties '{"delivery_mode":1}'; rabbitmqctl -q list_queues name durable messages | grep -E '^tiklanish'
Message published and routed successfully
Message published and routed successfully
tiklanish	true	2
$ systemctl restart rabbitmq-server; rabbitmqctl -q await_startup; rabbitmqctl -q list_queues name durable messages | grep -E '^tiklanish'; rabbitmqadmin --non-interactive get messages --queue tiklanish --count 5 --ack-mode ack_requeue_false | grep -o -E 'doimiy|vaqtinchalik' | sed 's/^/qoldi: /'; rabbitmqadmin queues delete --name tiklanish
tiklanish	true	1
qoldi: doimiy
```

Durable navbatda 2 ta xabar edi. `rabbitmq-server` qayta ishga tushgach — 1 ta: `doimiy` (persistent) qoldi, `vaqtinchalik` (transient) tashlandi (RQ).

### Kafka: broker qayta ishga tushishi

```text vps
$ K=/opt/kafka/bin; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tiklanish >/dev/null; printf 'buyurtma #1\nbuyurtma #2\nbuyurtma #3\n' | docker exec -i kafka $K/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic tiklanish; docker restart kafka >/dev/null; until docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --list >/dev/null 2>&1; do sleep 3; done; docker exec kafka $K/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic tiklanish --from-beginning --max-messages 3 2>/dev/null; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic tiklanish | grep -o -E 'Replicas: [0-9,]+.*Isr: [0-9,]+'; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic tiklanish
buyurtma #1
buyurtma #2
buyurtma #3
Replicas: 1	Isr: 1
```

- Konteyner qayta ishga tushirildi — uchala yozuv joyida: log diskda.
- `Replicas: 1, Isr: 1` — yagona nusxa. Diskning o'zi yo'qolsa, yozuvlar ham yo'qoladi. Himoya — replication factor 3 va `min.insync.replicas` (Kafka kitobi, 20-bob).

### Redis: to'g'ri to'xtatish va `kill -9`

VPS'dagi Redis: `appendonly no`, faqat RDB (`save 3600 1 300 100 60 10000`).

```text vps
$ redis-cli XADD tiklanish '*' buyurtma 1 >/dev/null; redis-cli XADD tiklanish '*' buyurtma 2 >/dev/null; systemctl restart redis-server; sleep 2; echo "to'g'ri to'xtatib qayta ishga tushirgandan keyin XLEN: $(redis-cli XLEN tiklanish)"
to'g'ri to'xtatib qayta ishga tushirgandan keyin XLEN: 2
$ redis-cli BGSAVE >/dev/null; sleep 2; redis-cli XADD tiklanish '*' buyurtma 3 >/dev/null; echo "kill -9 dan oldin XLEN: $(redis-cli XLEN tiklanish)"; kill -9 $(pidof redis-server); sleep 1; systemctl start redis-server; sleep 2; echo "kill -9 dan keyin XLEN: $(redis-cli XLEN tiklanish)"; redis-cli DEL tiklanish >/dev/null; systemctl is-active redis-server
kill -9 dan oldin XLEN: 3
kill -9 dan keyin XLEN: 2
active
```

- `systemctl restart` — Redis to'g'ri to'xtadi. RD (SHUTDOWN): kamida bitta save nuqtasi bo'lsa, to'xtashda bloklovchi `SAVE` bajariladi. Ikkala yozuv qoldi.
- `BGSAVE` (surat), keyin yana bitta yozuv va `kill -9` — jarayon surat olmasdan o'ldi. Qayta ishga tushgach XLEN **2**: suratdan keyingi yozuv **yo'qoldi**.
- AOF (`appendonly yes`, `everysec`) bilan bu oyna 1 soniyagacha qisqaradi (RD).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| RabbitMQ'da xabarni persistent deb belgilamaslik | Durable navbatda ham qayta ishga tushishda yo'qoladi (RQ, sinovda) | `delivery_mode: 2` (persistent) |
| Muhim navbat uchun classic navbat, bitta tugun | Tugun yo'qolsa navbat ham yo'qoladi | Quorum navbat, 3+ tugun |
| Kafka'da replication factor 1 | Yagona disk yo'qolsa yozuvlar ham yo'qoladi | RF 3, `min.insync.replicas=2`, `acks=all` |
| Redis'ni faqat RDB bilan navbat sifatida ishlatish | Oxirgi suratdan keyingi yozuvlar yo'qoladi (RD, sinovda) | AOF `everysec` (yoki `always`) |
| Redis Sentinel tasdiqlangan yozuvni saqlaydi deb hisoblash | Replikatsiya asinxron — failover'da yo'qolishi mumkin (RD) | Yo'qotishga chidamli dizayn yoki boshqa asbob |

## Amaliyot

1. Qayta ishga tushish va mashina yo'qolishi farqi nima, ulardan nima himoya qiladi?
2. RabbitMQ'da qaysi xabarlar qayta ishga tushishda saqlanadi?
3. Quorum navbatda publisher confirm qachon beriladi?
4. Sinovda Redis'da `kill -9` dan keyin nega bitta yozuv yo'qoldi?
5. Redis AOF `everysec` da qancha ma'lumot yo'qolishi mumkin?

<details>
<summary>Javoblar</summary>

1. Qayta ishga tushishda xotira yo'qoladi — disk himoya qiladi; mashina yo'qolganda — replikatsiya.
2. Durable navbatdagi persistent xabarlar.
3. Xabar a'zolarning ko'pchiligiga nusxalangach.
4. Faqat RDB yoqilgan; yozuv oxirgi suratdan keyin qo'shilgan edi.
5. Taxminan 1 soniyalik.

</details>

## Rasmiy hujjat

- [RQ: Queues → Durability](https://www.rabbitmq.com/docs/queues)
- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues)
- [KD: Design → Replication](https://kafka.apache.org/44/design/design/)
- [RD: Persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/) · [RD: SHUTDOWN](https://redis.io/docs/latest/commands/shutdown/)
- [RD: Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/) · [RD: Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
