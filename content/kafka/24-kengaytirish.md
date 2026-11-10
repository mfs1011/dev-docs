# 24 — Klasterni kengaytirish

[Mundarija](README.md)

## Tushuncha

### Yangi broker bo'sh turadi (KD Basic Operations → Expanding your cluster)

Klasterga server qo'shish oson: unga noyob broker ID berib, Kafka'ni ishga tushirish kifoya. Lekin yangi server'larga **hech qanday partition avtomatik berilmaydi**. Partition ko'chirilmaguncha ular faqat **yangi** topic'lar yaratilganda ish oladi.

Ko'chirish qo'lda boshlanadi, lekin to'liq avtomatik bajariladi:

1. Yangi server partition'ning **izdoshi** qilib qo'shiladi va mavjud ma'lumotni to'liq nusxalaydi.
2. U ISR'ga qo'shilgach, eski replikalardan biri o'z nusxasini o'chiradi.

### `kafka-reassign-partitions.sh` (KD)

| Rejim | Nima qiladi |
| --- | --- |
| `--generate` | Topic'lar va broker'lar ro'yxatidan **taklif** qilingan reja tuzadi. Hech narsani ko'chirmaydi |
| `--execute` | JSON reja bo'yicha ko'chirishni boshlaydi. Joriy holatni chiqaradi — uni orqaga qaytarish uchun saqlab qo'yish kerak |
| `--verify` | Holatni tekshiradi: tugagan, xato yoki davom etmoqda. Tugagan bo'lsa, cheklovni (throttle) olib tashlaydi |

Vosita partition hajmlariga qarab yuklamani o'zi muvozanatlay olmaydi. Uni reja berib ishlatish kerak.

**Replication factor'ni oshirish** — xuddi shu vosita bilan: JSON rejada partition'ga qo'shimcha replikalar yoziladi.

**Tarmoqni cheklash** — ko'chirish trafigiga yuqori chegara qo'yish: `--throttle B/s` (broker'lar orasida), `--replica-alter-log-dirs-throttle` (disklar orasida). KD: `--verify` ni ko'chirish tugaguncha muntazam ishga tushiring — throttle o'z vaqtida olinishi uchun.

**Broker'ni chiqarish**: avval broker `cordoned.log.dirs="*"` bilan belgilanadi, so'ng partition'lari boshqalarga ko'chiriladi. Vosita bu holat uchun rejani hali o'zi tuza olmaydi.

## Buyruqlar va kod

VPS'dagi 3 tugunli klaster. "Yangi broker" holatini yaratish uchun topic qo'lda faqat 1 va 2-broker'larga joylanadi (`--replica-assignment`). 3-broker — klasterga yangi qo'shilgandek bo'sh:

```text vps
$ export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-topics.sh --bootstrap-server localhost:29092 --create --topic eski --replica-assignment 1:2,2:1,1:2 && kafka-producer-perf-test.sh --topic eski --num-records 6000 --record-size 1000 --throughput -1 --bootstrap-server localhost:29092 >/dev/null 2>&1; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic eski | grep Partition: | cut -f2-5; kafka-log-dirs.sh --bootstrap-server localhost:29092 --describe --topic-list eski 2>/dev/null | tail -1 | python3 -c "import json,sys; d=json.load(sys.stdin); [print('broker', b['broker'], ':', sum(p['size'] for ld in b['logDirs'] for p in ld['partitions'])//1024, 'KB') for b in d['brokers']]"
Created topic eski.
Topic: eski	Partition: 0	Leader: 1	Replicas: 1,2
Topic: eski	Partition: 1	Leader: 2	Replicas: 2,1
Topic: eski	Partition: 2	Leader: 1	Replicas: 1,2
broker 1 : 5934 KB
broker 2 : 5934 KB
broker 3 : 0 KB
```

Har partition 2 nusxada, faqat 1 va 2-broker'larda. 3-broker'da — 0 KB.

### Reja

```text vps
$ cd /root/kafka-klaster && echo '{"topics":[{"topic":"eski"}],"version":1}' > kochiriladigan.json && export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --topics-to-move-json-file kochiriladigan.json --broker-list "1,2,3" --generate | tee reja.txt; sed -n '/Proposed/{n;p}' reja.txt > yangi.json
Current partition replica assignment
{"version":1,"partitions":[{"topic":"eski","partition":0,"replicas":[1,2],"log_dirs":["/tmp/kraft-combined-logs","/tmp/kraft-combined-logs"]},{"topic":"eski","partition":1,"replicas":[2,1],"log_dirs":["/tmp/kraft-combined-logs","/tmp/kraft-combined-logs"]},{"topic":"eski","partition":2,"replicas":[1,2],"log_dirs":["/tmp/kraft-combined-logs","/tmp/kraft-combined-logs"]}]}

Proposed partition reassignment configuration
{"version":1,"partitions":[{"topic":"eski","partition":0,"replicas":[1,2],"log_dirs":["any","any"]},{"topic":"eski","partition":1,"replicas":[2,3],"log_dirs":["any","any"]},{"topic":"eski","partition":2,"replicas":[3,1],"log_dirs":["any","any"]}]}
```

`--broker-list "1,2,3"` — taklif: partition 1 → [2,3], partition 2 → [3,1]. Partition 0 joyida qoldi. "Current" bloki — orqaga qaytish uchun reja.

### Ko'chirish va tekshirish

```text vps
$ cd /root/kafka-klaster && export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --reassignment-json-file yangi.json --execute --throttle 300000 | grep -v '^{'; sleep 3; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --reassignment-json-file yangi.json --verify
Current partition replica assignment


Save this to use as the --reassignment-json-file option during rollback
Warning: You must run --verify periodically, until the reassignment completes, to ensure the throttle is removed.
The inter-broker throttle limit was set to 300000 B/s
Successfully started partition reassignments for eski-0,eski-1,eski-2
Status of partition reassignment:
Reassignment of partition eski-0 is completed.
Reassignment of partition eski-1 is completed.
Reassignment of partition eski-2 is completed.

Clearing broker-level throttles on brokers 1,2,3
Clearing topic-level throttles on topic eski
$ sleep 30; cd /root/kafka-klaster && export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --reassignment-json-file yangi.json --verify; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic eski | grep Partition: | cut -f2-5
Status of partition reassignment:
Reassignment of partition eski-0 is completed.
Reassignment of partition eski-1 is completed.
Reassignment of partition eski-2 is completed.

Clearing broker-level throttles on brokers 1,2,3
Clearing topic-level throttles on topic eski
Topic: eski	Partition: 0	Leader: 1	Replicas: 1,2
Topic: eski	Partition: 1	Leader: 2	Replicas: 2,3
Topic: eski	Partition: 2	Leader: 1	Replicas: 3,1
```

- `--throttle 300000` — ko'chirish trafigi 300 KB/s bilan cheklandi.
- Kuzatildi: ~2 MB'lik partition'lar 3 soniyada ko'chib bo'ldi va `--verify` darhol throttle'ni olib tashladi. Bunday kichik hajmda cheklov sezilmadi — u katta partition'larda ahamiyatli.
- Endi 3-broker 1 va 2-partition'larda replika.

### Replication factor 2 → 3

```text vps
$ cd /root/kafka-klaster && echo '{"version":1,"partitions":[{"topic":"eski","partition":0,"replicas":[1,2,3]}]}' > rf3.json && export PATH=/opt/kafka-tgz/kafka_2.13-4.4.0/bin:$PATH; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --reassignment-json-file rf3.json --execute | grep -v '^{'; sleep 15; kafka-reassign-partitions.sh --bootstrap-server localhost:29092 --reassignment-json-file rf3.json --verify; kafka-topics.sh --bootstrap-server localhost:29092 --describe --topic eski | cut -f2-5 | head -2
Current partition replica assignment


Save this to use as the --reassignment-json-file option during rollback
Successfully started partition reassignment for eski-0
Status of partition reassignment:
Reassignment of partition eski-0 is completed.

Clearing broker-level throttles on brokers 1,2,3
Clearing topic-level throttles on topic eski
TopicId: i0LDnJ6zQqCpugCn64OPsQ	PartitionCount: 3	ReplicationFactor: 3	Configs: min.insync.replicas=1
Topic: eski	Partition: 0	Leader: 1	Replicas: 1,2,3
```

Partition 0 ga uchinchi replika (3-broker) qo'shildi — `Replicas: 1,2,3`.

## Variantlar

| Vazifa | Usul |
| --- | --- |
| Yangi broker'ga yuk berish | `--generate` → reja → `--execute` → `--verify` |
| Aniq partition'ni aniq broker'larga | Qo'lda JSON reja |
| Replication factor'ni oshirish | JSON'da qo'shimcha replikalar |
| Ko'chirish production'ni sekinlashtirmasin | `--throttle` (va `--additional` bilan o'zgartirish) |
| Broker'ni chiqarish | `cordoned.log.dirs` → hamma partition'larni ko'chirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Yangi broker o'zi ish oladi deb kutish | Partition'lar avtomatik ko'chmaydi (KD, sinovda 0 KB) | Reassignment |
| "Current" rejani saqlamaslik | Orqaga qaytarib bo'lmaydi | Faylga saqlash |
| `--verify` ni ishlatmaslik | Throttle qoladi — replikatsiya cheklanib qoladi (KD) | Tugaguncha muntazam `--verify` |
| Katta topic'larni throttle'siz ko'chirish | Tarmoq va disk band bo'ladi | `--throttle` |

## Amaliyot

1. Yangi broker qo'shilganda u qachon ish oladi?
2. `kafka-reassign-partitions.sh` ning uch rejimi nima?
3. Ko'chirish ichkarida qanday bajariladi?
4. Replication factor'ni qanday oshirasiz?
5. `--verify` nega muhim?

<details>
<summary>Javoblar</summary>

1. Partition'lar unga ko'chirilganda yoki yangi topic yaratilganda.
2. `--generate`, `--execute`, `--verify`.
3. Yangi broker izdosh bo'lib nusxalaydi; ISR'ga kirgach, eski replika o'chiriladi.
4. JSON rejada partition'ga qo'shimcha replikalar yozib, `--execute`.
5. Holatni ko'rsatadi va tugagach throttle'ni olib tashlaydi.

</details>

## Rasmiy hujjat

- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Expanding your cluster, Increasing replication factor, Limiting bandwidth usage during data migration, Decommissioning brokers
