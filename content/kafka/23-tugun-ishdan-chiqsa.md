# 23 — Tugun ishdan chiqsa

[Mundarija](README.md)

## Tushuncha

### Yangi yetakchi (KD Basic Operations → Graceful shutdown)

Klaster broker o'chishi yoki ishdan chiqishini **avtomatik** aniqlaydi va uning partition'lari uchun yangi yetakchilar saylaydi. Bu nosozlikda ham, ta'mir uchun ataylab to'xtatishda ham bo'ladi. Broker "tirik"ligi controller bilan sessiya orqali tekshiriladi (`broker.session.timeout.ms`, 20-bob).

### To'g'ri o'chirish (KD)

Broker **graceful** (to'g'ri) to'xtatilganda ikki afzallik bor:

1. Barcha log'larni diskka yozadi — qayta ishga tushishda log'ni tiklash (oxirgi xabarlarni tekshirish) kerak bo'lmaydi, qayta ishga tushish tezroq.
2. O'zi yetakchi bo'lgan partition'larni o'chishdan **oldin** boshqa replikalarga o'tkazadi. Yetakchilik tez o'tadi, har partition atigi bir necha millisoniya mavjud bo'lmaydi.

Log'larni diskka yozish majburan o'ldirishdan (hard kill) boshqa har qanday to'xtatishda o'zi bo'ladi. Yetakchilikni boshqariladigan tarzda ko'chirish uchun `controlled.shutdown.enable=true` kerak. U faqat broker'dagi har partition'ning tirik replikasi bo'lsa muvaffaqiyatli bo'ladi.

### Hamma replika o'lsa — unclean leader election (KD Design)

Kafka'ning yo'qotmaslik kafolati kamida bitta replika sinxron qolishiga tayanadi. Partition'ning **hamma** replikalari o'lsa, ikki yo'l bor:

| Yo'l | Nima bo'ladi |
| --- | --- |
| ISR'dagi replika qaytishini **kutish** (standart, `unclean.leader.election.enable=false`) | Partition shu replika qaytguncha **mavjud emas**. Replika butunlay yo'qolgan bo'lsa — doimiy |
| **Birinchi** qaytgan replikani yetakchi qilish (`true`) | Mavjudlik tiklanadi, lekin u ISR'da bo'lmagan bo'lishi mumkin — barcha committed xabarlar unda borligi kafolatlanmaydi: **yo'qotish** |

Bu dilemma faqat Kafka'ga xos emas — har qanday kvorum tizimida bor.

### Eligible Leader Replicas (KD ELR)

4.1 dan yangi klasterlarda standart yoqilgan. Qoida: ISR `min.insync.replicas` dan kichik bo'lsa, high watermark siljimaydi. Shuning uchun ISR'dan chiqqan ba'zi replikalar ham yetakchi bo'lishi **xavfsiz**. Controller ularni **ELR** maydonida saqlaydi. Yetakchi saylash tartibi:

1. ISR bo'sh bo'lmasa — undan;
2. ELR bo'sh bo'lmasa — undan, chetlatilmagan (unfenced) replika;
3. Oxirgi ma'lum yetakchi chetlatilmagan bo'lsa — u.

## Buyruqlar va kod

VPS'dagi 3 tugunli klaster (22-bob):

```text vps
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-configs.sh --bootstrap-server localhost:29092 --entity-type brokers --entity-name 1 --describe --all | grep -E ' (unclean.leader.election.enable|controlled.shutdown.enable|replica.lag.time.max.ms|broker.session.timeout.ms)=' | sed 's/^ *//; s/ sensitive=.*//'
broker.session.timeout.ms=9000
controlled.shutdown.enable=true
replica.lag.time.max.ms=30000
unclean.leader.election.enable=false
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-8
Topic: buyurtmalar	Partition: 0	Leader: 2	Replicas: 3,1,2	Isr: 1,2,3	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 1	Leader: 2	Replicas: 1,2,3	Isr: 1,2,3	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 2	Leader: 2	Replicas: 2,3,1	Isr: 1,2,3	Elr: 	LastKnownElr: 
```

`controlled.shutdown.enable=true`, `unclean.leader.election.enable=false` — standart. Hozir uchala partition yetakchisi — 2.

### To'g'ri to'xtatish (`docker stop` — SIGTERM)

```text vps
$ cd /root/kafka-klaster && T=$(date -u +%Y-%m-%dT%H:%M:%S); docker compose stop kafka-2 2>&1 | tail -1; docker logs --since $T kafka-2 2>&1 | grep -o -E 'Controlled shutdown[^(]*|Shutting down the log cleaner|shut down completed' | sort -u | head -5
 Container kafka-2 Stopped 
shut down completed
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-8; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic uchtasi-kerak | grep Partition: | cut -f2-8
Topic: buyurtmalar	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 1,3	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,3	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 2	Leader: 3	Replicas: 2,3,1	Isr: 1,3	Elr: 	LastKnownElr: 
Topic: uchtasi-kerak	Partition: 0	Leader: 3	Replicas: 3,1,2	Isr: 1,3	Elr: 2	LastKnownElr: 
```

- `kafka-2` to'xtashdan oldin yetakchiligini o'tkazdi: endi yetakchilar 3, 1, 3, ISR'da 1 va 3.
- **ELR**: `uchtasi-kerak` (`min.insync.replicas=3`) da ISR 2 ta — minimaldan kam. To'xtatilgan 2-broker ISR'dan chiqdi, lekin `Elr: 2` — yetakchi bo'lishga loyiq replika sifatida saqlandi. `buyurtmalar` da (min ISR 2) ISR yetarli — ELR bo'sh.

### Majburan o'ldirish (`docker kill` — SIGKILL)

```text vps
$ cd /root/kafka-klaster && docker compose start kafka-2 2>&1 | tail -1; sleep 30; docker kill kafka-3 >/dev/null && echo "kafka-3: SIGKILL"; sleep 20; export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic buyurtmalar | grep Partition: | cut -f2-8
 Container kafka-2 Started 
kafka-3: SIGKILL
Topic: buyurtmalar	Partition: 0	Leader: 1	Replicas: 3,1,2	Isr: 1,2	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 1	Leader: 1	Replicas: 1,2,3	Isr: 1,2	Elr: 	LastKnownElr: 
Topic: buyurtmalar	Partition: 2	Leader: 2	Replicas: 2,3,1	Isr: 1,2	Elr: 	LastKnownElr: 
```

`kafka-3` to'satdan o'ldirildi — yetakchilikni o'tkazishga ulgurmadi. Controller sessiya uzilganini aniqlab (`broker.session.timeout.ms` — 9 s), 20 soniya ichida yangi yetakchilarni sayladi: 1, 1, 2. ISR — 1, 2.

### Unclean election nega bu yerda sinalmadi

Unclean saylovni ko'rish uchun partition'ning **barcha** replikalarini to'xtatish kerak. Bu klasterda har tugun controller ham (combined). RF 2 bo'lsa ham ikki tugun to'xtashi bilan controller kvorumi yo'qoladi (21-bob) — yetakchini saylaydigan hech kim qolmaydi. Shuning uchun bu holat faqat KD tavsifi bilan berildi. Production'da controller'lar alohida bo'lgani uchun (21-bob) bu ssenariy mumkin.

## Variantlar

| Talab | Sozlama |
| --- | --- |
| Yo'qotishdan ko'ra kutish afzal (standart) | `unclean.leader.election.enable=false` |
| Mavjudlik har narsadan muhim (loglar, metrikalar) | `unclean.leader.election.enable=true` (topic bo'yicha) |
| Ta'mir uchun to'xtatish | `docker stop`, `kafka-server-stop.sh`, `systemctl stop` — SIGTERM |
| Tez tiklanish | Yetarli replika, `min.insync.replicas` va ELR |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ta'mirda `kill -9` | Yetakchilik ko'chmaydi, log'ni tiklash kerak (KD) | SIGTERM |
| Muhim topic'da unclean election yoqish | Committed xabarlar yo'qolishi mumkin (KD) | Faqat yo'qotish mumkin bo'lgan topic'larda |
| Bir vaqtda ko'p broker'ni to'xtatish | ISR va (combined'da) kvorum yo'qoladi | Birma-bir, ISR to'lishini kutib |
| RF 1 bilan "graceful" to'xtatish | Replika yo'q — boshqariladigan o'chirish muvaffaqiyatsiz (KD) | RF ≥ 2 |

## Amaliyot

1. To'g'ri o'chirishning ikki afzalligi nima?
2. Unclean leader election nimani tanlaydi va xavfi nima?
3. ELR nima va sinovda qayerda ko'rindi?
4. Sinovda SIGKILL'dan keyin yangi yetakchilar qachon saylandi?
5. Nega unclean election bu klasterda sinalmadi?

<details>
<summary>Javoblar</summary>

1. Log'lar diskka yoziladi (tiklash shart emas); yetakchilik oldindan ko'chadi (deyarli to'xtovsiz).
2. ISR'da bo'lmagan birinchi qaytgan replikani yetakchi qiladi; committed xabarlar yo'qolishi mumkin.
3. ISR `min.insync.replicas` dan kam bo'lganda yetakchilikka loyiq replikalar; `uchtasi-kerak` da `Elr: 2`.
4. Controller sessiya uzilganini aniqlagach (`broker.session.timeout.ms`), 20 soniya ichida.
5. Barcha replikalarni to'xtatish combined klasterda controller kvorumini ham buzadi.

</details>

## Rasmiy hujjat

- [KD: Design → Replication (Unclean leader election, Availability and Durability Guarantees)](https://kafka.apache.org/44/design/design/)
- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Graceful shutdown
- [KD: Eligible Leader Replicas](https://kafka.apache.org/44/operations/eligible-leader-replicas/)
