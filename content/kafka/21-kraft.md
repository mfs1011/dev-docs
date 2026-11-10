# 21 — KRaft: controller'lar

[Mundarija](README.md)

## Tushuncha

Klaster haqidagi **metama'lumot** — topic'lar, partition'lar, yetakchilar, ISR, broker'lar ro'yxati — kerak. Kafka 4.x da uni **KRaft** saqlaydi: Kafka'ning o'z **controller**'lari, Raft protokoli asosida. Metama'lumot `__cluster_metadata` nomli maxsus jurnalda turadi. ZooKeeper rejimi olib tashlangan (3-bob).

### Rollar (KD KRaft → Process Roles)

`process.roles`:

| Qiymat | Server |
| --- | --- |
| `broker` | Faqat broker — ma'lumotni saqlaydi va beradi |
| `controller` | Faqat controller — metama'lumot kvorumida qatnashadi |
| `broker,controller` | **Combined** — ikkalasi |

KD: combined server'lar kichik holatlarda, masalan, ishlab chiqish muhitida, boshqarish uchun soddaroq. Kamchiligi — controller tizimning qolgan qismidan kam ajratilgan: controller'larni broker'lardan alohida qayta ishga tushirib yoki kengaytirib bo'lmaydi. **Muhim production muhitlarida combined rejim tavsiya etilmaydi.**

### Kvorum (KD KRaft → Controllers, Deploying Considerations)

- Controller'lardan biri **faol** (active), qolganlari uning **tayyor turgan zaxirasi** (hot standby).
- Odatda 3 yoki 5 controller tanlanadi. Mavjudlik uchun controller'larning **ko'pchiligi** tirik bo'lishi kerak. 3 controller 1 ta nosozlikka, 5 controller 2 taga chidaydi: N ta bir vaqtdagi nosozlik uchun **2N + 1** controller kerak.
- Hamma server faol controller'ni `controller.quorum.bootstrap.servers` orqali topadi.
- **Statik** kvorum — `controller.quorum.voters` bilan barcha controller'lar ro'yxati. **Dinamik** kvorum (KIP-853) — controller'larni qo'shish va olib tashlash mumkin. Qaysi biri ekanini `kraft.version` ko'rsatadi: 0 — statik, 1 va undan katta — dinamik.
- Controller'lar barcha metama'lumotni xotirada va diskda saqlaydi. KD baholashi: odatiy klaster uchun 5 GB xotira va metama'lumot log'i uchun 5 GB disk yetarli.

### Diagnostika vositalari (KD KRaft → Debugging)

- `kafka-metadata-quorum.sh describe --status | --replication` — kvorum holati;
- `kafka-dump-log.sh --cluster-metadata-decoder` — metama'lumot yozuvlarini ochish;
- `kafka-metadata-shell.sh` — snapshot ichini interaktiv ko'rish.

## Buyruqlar va kod

VPS'dagi 3 tugunli klaster: har tugun `broker,controller` (combined — sinov uchun). Rasmiy Compose misoli `KAFKA_CONTROLLER_QUORUM_VOTERS` ni ishlatadi, ya'ni **statik** kvorum (22-bob).

### Kvorum holati

```text vps
$ docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-1:19092 describe --status
ClusterId:              4L6g3nShT-eMCtK--X86sw
LeaderId:               3
LeaderEpoch:            2
HighWatermark:          254
MaxFollowerLag:         0
MaxFollowerLagTimeMs:   135
CurrentVoters:          [{"id": 1, "endpoints": ["CONTROLLER://kafka-1:9093"]}, {"id": 2, "endpoints": ["CONTROLLER://kafka-2:9093"]}, {"id": 3, "endpoints": ["CONTROLLER://kafka-3:9093"]}]
CurrentObservers:       []
$ docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-1:19092 describe --replication
NodeId	DirectoryId           	LogEndOffset	Lag	LastFetchTimestamp	LastCaughtUpTimestamp	Status  	
3     	AAAAAAAAAAAAAAAAAAAAAA	268         	0  	1794335557499     	1794335557499        	Leader  	
1     	AAAAAAAAAAAAAAAAAAAAAA	268         	0  	1794335557241     	1794335557241        	Follower	
2     	AAAAAAAAAAAAAAAAAAAAAA	268         	0  	1794335557134     	1794335557134        	Follower	
$ docker exec kafka-1 /opt/kafka/bin/kafka-features.sh --bootstrap-server kafka-1:19092 describe | grep -E 'kraft.version|metadata.version' | tr -s ' \t' ' '
Feature: kraft.version SupportedMinVersion: 0 SupportedMaxVersion: 1 FinalizedVersionLevel: 0 Epoch: 1166
Feature: metadata.version SupportedMinVersion: 3.3-IV3 SupportedMaxVersion: 4.4-IV2 FinalizedVersionLevel: 4.4-IV2 Epoch: 1166
```

- Faol controller — 3-tugun, qolganlari `Follower`. Lag 0 — hammasi metama'lumot jurnalining oxirida.
- `kraft.version` 0 — statik kvorum (KD qoidasi bo'yicha).

### Faol controller tushdi

```text vps
$ docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-1:19092 describe --status | grep -E 'LeaderId|LeaderEpoch|HighWatermark'
LeaderId:               3
LeaderEpoch:            2
HighWatermark:          1179
$ L=$(docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-1:19092 describe --status | awk '/LeaderId/ {print $2}'); echo "faol controller: $L"; cd /root/kafka-klaster && docker compose stop kafka-$L 2>&1 | tail -1; sleep 15; for n in 1 2 3; do [ $n = $L ] && continue; docker exec kafka-$n /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-$n:19092 describe --status | grep -E 'LeaderId|LeaderEpoch'; break; done
faol controller: 3
 Container kafka-3 Stopped 
LeaderId:               1
LeaderEpoch:            3
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092,localhost:39092 --create --topic bitta-controller-yoq 2>&1 | tail -1
Created topic bitta-controller-yoq.
```

Faol controller (3) to'xtatildi — qolgan ikkitasi yangi faol controller'ni sayladi (1, epoch 2 → 3). Ko'pchilik (2/3) bor — yangi topic yaratildi.

### Ko'pchilik yo'qoldi

```text vps
$ cd /root/kafka-klaster && docker compose stop kafka-1 2>&1 | tail -1; sleep 15; export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; timeout 60 kafka-topics.sh --bootstrap-server localhost:39092,localhost:49092 --create --topic ikki-controller-yoq --command-config /dev/null 2>&1 | grep -o -E 'Created topic.*|TimeoutException[^.]*|Timed out[^.]*' | head -1; echo "kod: $?"
 Container kafka-1 Stopped 
kod: 0
```

Yana bitta controller (1) to'xtatildi: 3 tadan faqat 1 tasi tirik — **ko'pchilik yo'q**. `kafka-topics.sh --create` 60 soniyada hech narsa chiqarmay to'xtadi (`timeout`), topic yaratilmadi: metama'lumotni o'zgartirib bo'lmaydi.

### Tiklanish

```text vps
$ cd /root/kafka-klaster && docker compose start 2>&1 | tail -1; sleep 45; docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server kafka-1:19092 describe --replication | cut -f1,3,4,7
 Container kafka-1 Started 
NodeId	LogEndOffset	Lag	Status  
1     	1350        	0  	Leader  
2     	1350        	0  	Follower
3     	1350        	0  	Follower
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --list | grep -v '^__'
bitta-controller-yoq
buyurtmalar
uchtasi-kerak
$ docker exec kafka-1 sh -c '/opt/kafka/bin/kafka-dump-log.sh --cluster-metadata-decoder --files /tmp/kraft-combined-logs/__cluster_metadata-0/00000000000000000000.log 2>/dev/null' | grep -o '"type":"TOPIC_RECORD"[^}]*}' | sed 's/"topicId":"[^"]*",//' | head -6
"type":"TOPIC_RECORD","version":0,"data":{"name":"buyurtmalar","topicId":"PAXq7AcMTaS1hf_vD1UPzw"}
"type":"TOPIC_RECORD","version":0,"data":{"name":"uchtasi-kerak","topicId":"IlMsrNZBQPyFIkTxl54NOQ"}
"type":"TOPIC_RECORD","version":0,"data":{"name":"bitta-controller-yoq","topicId":"dcFt3QEbQbimRaIjccyuUw"}
```

- Hamma tugun qaytdi, kvorum tiklandi: faol controller — 1, uchala tugun ham metama'lumot jurnalining oxirida.
- `ikki-controller-yoq` ro'yxatda yo'q — kvorumsiz paytdagi so'rov bajarilmagan.
- Metama'lumot jurnalida har topic — `TOPIC_RECORD`.

## Variantlar

| Muhit | Tanlov |
| --- | --- |
| Ishlab chiqish, sinov | 1 yoki 3 ta combined tugun |
| Production | Alohida controller'lar (`process.roles=controller`), 3 yoki 5 ta |
| 2 ta bir vaqtdagi nosozlikka chidash | 5 controller (2N + 1) |
| Controller qo'shish/olib tashlash kerak | Dinamik kvorum (`kraft.version` ≥ 1) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Production'da combined rejim | Controller ajratilmagan (KD) | Alohida controller'lar |
| Juft sondagi controller (2, 4) | Ko'pchilik uchun ortiqcha foyda yo'q | 3 yoki 5 |
| Ikkita controller'ni bir vaqtda ta'mirlash (3 tadan) | Ko'pchilik yo'qoladi — metama'lumot o'zgarmaydi (sinovda) | Birma-bir |
| Controller'ni "faqat broker'lar uchun yordamchi" deb ko'rish | Kvorumsiz topic yaratish, yetakchi saylash ishlamaydi | 2N + 1 rejalash |

## Amaliyot

1. `process.roles` qanday qiymatlarni oladi?
2. 3 controller nechta nosozlikka chidaydi va nega?
3. Kvorum statik yoki dinamik ekanini qanday bilasiz?
4. Sinovda ikkita controller to'xtaganda nima bo'ldi?
5. Nega combined rejim production uchun tavsiya etilmaydi?

<details>
<summary>Javoblar</summary>

1. `broker`, `controller`, `broker,controller`.
2. 1 taga — ko'pchilik (2) tirik qolishi kerak.
3. `kafka-features.sh describe` dagi `kraft.version`: 0 — statik, ≥ 1 — dinamik.
4. Ko'pchilik yo'qoldi, yangi topic yaratilmadi.
5. Controller qolgan tizimdan ajratilmagan; ularni alohida qayta ishga tushirib yoki kengaytirib bo'lmaydi.

</details>

## Rasmiy hujjat

- [KD: KRaft](https://kafka.apache.org/44/operations/kraft/) — Process Roles, Controllers, Static versus Dynamic KRaft Quorums, Debugging, Deploying Considerations
