# 17 — Guruhlarni kuzatish

[Mundarija](README.md)

## Tushuncha

Production'da eng muhim savollardan biri: **consumer'lar ulguryaptimi?** Javob — **lag** (orqada qolish): log oxiri (`LOG-END-OFFSET`) va guruhning saqlangan o'rni (`CURRENT-OFFSET`) orasidagi farq.

### Vositalar (KD Basic Operations)

| Buyruq | Nima |
| --- | --- |
| `kafka-groups.sh --list` | Barcha turdagi guruhlar: consumer, share, streams — turi va protokoli bilan |
| `kafka-consumer-groups.sh --list` | Consumer guruhlari |
| `--describe --group G` (= `--offsets`) | Har partition: saqlangan o'rin, log oxiri, **LAG**, egasi |
| `--describe --members` (`--verbose`) | Faol a'zolar va ularga berilgan partition'lar |
| `--describe --state` | Koordinator, taqsimlash strategiyasi, holat, a'zolar soni |
| `--delete --group G` | O'chirish — faqat faol a'zolari yo'q guruhni |
| `--reset-offsets` | O'rinni o'zgartirish — faqat guruh **nofaol** bo'lganda |

`--reset-offsets` (KD):

- **Doira** — `--topic T`, `--topic T:0,1` yoki `--all-topics`.
- **Bajarish rejimi**:
  - `--dry-run` — faqat ko'rsatadi (standart);
  - `--execute` — bajaradi;
  - `--export` — CSV ga chiqaradi.
- **Qayerga**:
  - `--to-earliest`, `--to-latest`, `--to-current`;
  - `--to-offset N`, `--shift-by ±N`;
  - `--to-datetime YYYY-MM-DDThh:mm:ss.sss`, `--by-duration PnDTnHnMnS`;
  - `--from-file`.
- Chegaradan chiqadigan qiymat mavjud chegaraga tushiriladi.

`consumer` protokolidagi guruhni ko'rish uchun admin klientga guruh obuna bo'lgan **barcha** topic'larda `DESCRIBE` ruxsati kerak (31-bob).

## Buyruqlar va kod

VPS'da. 3 partition'li topic, 300 kalitsiz yozuv. Ikki konsol consumer `consumer` protokoli bilan, 40 soniyaga ishga tushiriladi:

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic hisob --partitions 3; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic hisob --num-records 300 --record-size 50 --throughput -1 --command-property bootstrap.servers=localhost:9092 >/dev/null 2>&1; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic hisob
Created topic hisob.
hisob:0:300
hisob:1:0
hisob:2:0
$ for n in 1 2; do (docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic hisob --group hisobot --from-beginning --command-property group.protocol=consumer --command-property client.id=oquvchi-$n --timeout-ms 40000 >/dev/null 2>&1 &); done; sleep 15; docker exec kafka /opt/kafka/bin/kafka-groups.sh --bootstrap-server localhost:9092 --list
GROUP                TYPE                 PROTOCOL            
hisobot              Consumer             consumer             
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot --members --verbose | awk '{print $3, $4, $5, $6, $7}' | column -t
HOST        CLIENT-ID  #PARTITIONS  CURRENT-EPOCH  CURRENT-ASSIGNMENT
/127.0.0.1  oquvchi-1  1            3              hisob:2
/127.0.0.1  oquvchi-2  2            3              hisob:0,1
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot --state | awk '{print $3, $4, $5, $6}' | column -t
(ID)  ASSIGNMENT-STRATEGY  STATE   #MEMBERS
(1)   uniform              Stable  2
```

- Kalitsiz 300 yozuv **bitta** partition'ga (0) tushdi — sticky partition (6-bob).
- `kafka-groups.sh` — guruh turi `Consumer`, protokol `consumer`.
- `--members --verbose` — kimga qaysi partition. `CURRENT-EPOCH` — yangi protokoldagi guruh epoch'i.
- `--state` — strategiya `uniform` (server tomonida, 15-bob), holat `Stable`, 2 a'zo.

### Faol guruhda reset — mumkin emas

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --reset-offsets --group hisobot --topic hisob --to-earliest --execute 2>&1 | grep -v '^$' | head -3
Error: Assignments can only be reset if the group 'hisobot' is inactive, but the current state is Stable.
GROUP           TOPIC           PARTITION  NEW-OFFSET
```

### Lag va reset

Consumer'lar chiqqandan keyin yana 150 yozuv:

```text vps
$ sleep 35; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic hisob --num-records 150 --record-size 50 --throughput -1 --command-property bootstrap.servers=localhost:9092 >/dev/null 2>&1; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot | awk '{print $2, $3, $4, $5, $6, $7}' | column -t

Consumer group 'hisobot' has no active members.
TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG  CONSUMER-ID
hisob  0          300             300             0    -
hisob  1          0               0               0    -
hisob  2          0               150             150  -
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --reset-offsets --group hisobot --topic hisob --shift-by -20 | awk 'NF {print $2, $3, $4}' | column -t
WARN: No action will be performed as the --execute option is missing. In version 5.0, this command will require either --dry-run or --execute to be specified. You should add the --dry-run option explicitly if you are scripting this command and want to keep the current default behavior without prompting.
[2026-11-10 18:07:48,709] WARN New offset (-20) is lower than earliest offset for topic partition hisob-1. Value will be set to 0. (org.apache.kafka.tools.GroupOffsetsResetter)
[2026-11-10 18:07:48,734] WARN New offset (-20) is lower than earliest offset for topic partition hisob-2. Value will be set to 0. (org.apache.kafka.tools.GroupOffsetsResetter)
TOPIC  PARTITION  NEW-OFFSET
hisob  0          280
hisob  1          0
hisob  2          0
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot | awk '{print $3, $4, $6}' | column -t

Consumer group 'hisobot' has no active members.
PARTITION  CURRENT-OFFSET  LAG
0          300             0
1          0               0
2          0               150
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --reset-offsets --group hisobot --topic hisob:0 --to-earliest --execute | awk 'NF {print $2, $3, $4}' | column -t; docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group hisobot | awk '{print $3, $4, $6}' | column -t
TOPIC  PARTITION  NEW-OFFSET
hisob  0          0

Consumer group 'hisobot' has no active members.
PARTITION  CURRENT-OFFSET  LAG
0          0               300
1          0               0
2          0               150
$ docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group hisobot; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic hisob
Deletion of requested consumer groups ('hisobot') was successful.
```

- **Lag**: partition 2 da 150 ta o'qilmagan yozuv — guruh to'xtagan paytda kelgan. `CONSUMER-ID` `-` — faol a'zo yo'q.
- `--shift-by -20` `--execute` siz — faqat ko'rsatdi. Kuzatildi: 4.4 ogohlantiradi — 5.0 dan `--dry-run` yoki `--execute` majburiy bo'ladi. Partition 1 va 2 da -20 ni 0 ga tushirdi (chegaradan chiqdi). Keyingi `--describe` ko'rsatadiki, hech narsa o'zgarmagan.
- `--topic hisob:0 --to-earliest --execute` — faqat partition 0 boshiga qaytdi: endi u yerda lag 300 — qayta o'qiladi.

## Variantlar

| Holat | Qadam |
| --- | --- |
| Lag o'sib boryapti | Consumer qo'shish (partition soni yetguncha), ishlovni tezlashtirish |
| Kod xatosi tuzatildi, qayta ishlash kerak | Guruhni to'xtatish → `--reset-offsets --to-datetime` → ishga tushirish |
| Eski hodisalar kerak emas | `--to-latest` |
| Avval nima bo'lishini ko'rish | `--dry-run` |
| Muntazam kuzatuv | Lag'ni monitoring tizimida (33-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ishlab turgan guruhda reset | Rad etiladi (sinovda) | Avval consumer'larni to'xtatish |
| `--execute` ni unutish | Faqat ko'rsatadi, o'zgartirmaydi (sinovda) | `--execute` (va 5.0 uchun aniq `--dry-run`) |
| Lag'ni faqat jami bo'yicha ko'rish | Bitta partition orqada qolishi mumkin (sinovda faqat 2-partition) | Partition bo'yicha |
| Faol guruhni o'chirish | Faqat a'zosiz guruh o'chiriladi (KD) | Avval to'xtatish |

## Amaliyot

1. Lag nima?
2. A'zolar va ularning partition'larini qanday ko'rasiz?
3. Sinovda reset nega birinchi marta rad etildi?
4. `--execute` siz `--reset-offsets` nima qiladi?
5. Faqat bitta partition o'rnini qanday qaytarasiz?

<details>
<summary>Javoblar</summary>

1. Log oxiri va guruhning saqlangan o'rni orasidagi farq — o'qilmagan yozuvlar soni.
2. `--describe --members --verbose`.
3. Guruh faol edi (`Stable`); reset faqat nofaol guruhda.
4. Faqat natijani ko'rsatadi (dry run).
5. `--topic T:0` doirasi bilan.

</details>

## Rasmiy hujjat

- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Checking consumer position, Managing groups, Managing consumer groups
