# 03 — Kafka'ni ishga tushirish

[Mundarija](README.md)

## Tushuncha

KD (Quick Start): Kafka'ni ikki yo'l bilan ishga tushirish mumkin — yuklab olingan **arxiv** (tgz) va skriptlar bilan yoki **Docker image** bilan.

| Yo'l | Nima kerak | Qachon |
| --- | --- | --- |
| **Arxiv** (`kafka_2.13-4.4.0.tgz`) | **Java 17+** | Serverda to'g'ridan-to'g'ri, systemd bilan |
| **Docker** (`apache/kafka:4.4.0`, JVM) | Docker | Lokal ishlab chiqish, sinov, konteyner muhitlari |
| Docker (`apache/kafka-native`, GraalVM) | Docker | KD: **eksperimental**, faqat lokal sinov uchun, production uchun tavsiya etilmaydi |

### KRaft

Kafka 4.x faqat **KRaft** rejimida ishlaydi: klaster metama'lumoti (topic'lar, partition'lar, liderlar) Kafka'ning o'z **controller**'larida, Raft protokoli bilan saqlanadi. Eski ZooKeeper rejimi olib tashlangan (README: KD Upgrade; 21-bob). Standart konfiguratsiyada bitta jarayon ham **broker**, ham **controller** (`process.roles=broker,controller`).

### Arxiv bilan qadamlar (KD)

1. Arxivni ochish.
2. Klaster ID'si yaratish: `bin/kafka-storage.sh random-uuid`.
3. Log kataloglarini formatlash: `bin/kafka-storage.sh format --standalone -t <ID> -c config/server.properties`.
4. Server: `bin/kafka-server-start.sh config/server.properties`.
5. To'xtatish va ma'lumotni o'chirish: `rm -rf /tmp/kafka-logs /tmp/kraft-combined-logs`.

### Xotira

`kafka-server-start.sh`: `KAFKA_HEAP_OPTS` bo'sh bo'lsa, Java'ga **1 GB** heap beriladi (`-Xmx1G -Xms1G`). Sinov VPS'ida (1.8 GB RAM, RabbitMQ va Redis ham ishlaydi) bu ko'p. Shuning uchun bu kitobda `KAFKA_HEAP_OPTS="-Xmx256m -Xms256m"` ishlatiladi. Bu faqat sinov uchun: production sozlamalari 34-bobda.

## Buyruqlar va kod

VPS'da (Ubuntu 26.04).

### Java va arxiv

```text vps
$ DEBIAN_FRONTEND=noninteractive apt-get install -y -qq openjdk-25-jdk-headless >/dev/null 2>&1; java -version 2>&1 | head -1; javac -version
openjdk version "25.0.4.1" 2026-08-18
javac 25.0.4.1
$ mkdir -p /opt/kafka-tgz && cd /opt/kafka-tgz && curl -sSfLO https://dlcdn.apache.org/kafka/4.4.0/kafka_2.13-4.4.0.tgz && curl -sSfLO https://downloads.apache.org/kafka/4.4.0/kafka_2.13-4.4.0.tgz.sha512 && ls -lh kafka_2.13-4.4.0.tgz | awk '{print $5, $NF}'
130M kafka_2.13-4.4.0.tgz
$ cd /opt/kafka-tgz && cat kafka_2.13-4.4.0.tgz.sha512
kafka_2.13-4.4.0.tgz: F5CEBA8A 265AB6BB 2D68362B 1F6859A9 5E15D60E F92BA83B
                      43FDF065 B557DC18 E98D6383 C15B9977 320E25B3 A2C8B6F1
                      1DECB17B 0FA6C0F1 63423793 A0EB95CB
$ cd /opt/kafka-tgz && B=$(tr -d ' \n' < kafka_2.13-4.4.0.tgz.sha512 | sed 's/.*://' | tr 'A-F' 'a-f'); H=$(sha512sum kafka_2.13-4.4.0.tgz | cut -d' ' -f1); [ "$B" = "$H" ] && echo "sha512: mos" || echo "sha512: MOS EMAS"; rm -f beklangan.txt haqiqiy.txt
sha512: mos
$ cd /opt/kafka-tgz && tar -xzf kafka_2.13-4.4.0.tgz && ls kafka_2.13-4.4.0
LICENSE
NOTICE
bin
config
libs
licenses
site-docs
```

- Java 25 (KD tavsiyasi: eng so'nggi LTS) — Ubuntu paketidan.
- Arxiv rasmiy ko'zgudan, `.sha512` fayli `downloads.apache.org` dan. Fayldagi xesh bo'shliqli, katta harfli formatda, shuning uchun solishtirishdan oldin bir xil ko'rinishga keltirildi. Xesh mos keldi.

### Arxivdan broker

Docker'dagi broker vaqtincha to'xtatiladi — ikkalasi ham 9092-portni ishlatadi:

```text vps
$ docker stop kafka >/dev/null && echo "docker kafka to'xtatildi"
docker kafka to'xtatildi
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && KAFKA_CLUSTER_ID="$(bin/kafka-storage.sh random-uuid)" && echo "klaster ID uzunligi: ${#KAFKA_CLUSTER_ID}" && bin/kafka-storage.sh format --standalone -t $KAFKA_CLUSTER_ID -c config/server.properties
klaster ID uzunligi: 22
Bootstrap metadata: BootstrapMetadata(records=[ApiMessageAndVersion(FeatureLevelRecord(name='metadata.version', featureLevel=33) at version 0), ApiMessageAndVersion(FeatureLevelRecord(name='eligible.leader.replicas.version', featureLevel=1) at version 0), ApiMessageAndVersion(FeatureLevelRecord(name='group.version', featureLevel=1) at version 0), ApiMessageAndVersion(FeatureLevelRecord(name='share.version', featureLevel=2) at version 0), ApiMessageAndVersion(FeatureLevelRecord(name='streams.version', featureLevel=1) at version 0), ApiMessageAndVersion(FeatureLevelRecord(name='transaction.version', featureLevel=2) at version 0)], metadataVersionLevel=33, source=format command)
Formatting dynamic metadata voter directory /tmp/kraft-combined-logs with metadata.version 4.4-IV2.
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && ls /tmp/kraft-combined-logs; cat /tmp/kraft-combined-logs/meta.properties | grep -v '^#' | sed 's/cluster.id=.*/cluster.id=<…>/; s/directory.id=.*/directory.id=<…>/'
__cluster_metadata-0
meta.properties
cluster.id=<…>
directory.id=<…>
node.id=1
version=1
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && KAFKA_HEAP_OPTS="-Xmx256m -Xms256m" bin/kafka-server-start.sh -daemon config/server.properties; sleep 20; grep -h 'Kafka Server started' logs/server.log | sed 's/^\[[^]]*\] //'
INFO [KafkaRaftServer nodeId=1] Kafka Server started (kafka.server.KafkaRaftServer)
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --create --topic quickstart-events --bootstrap-server localhost:9092 && bin/kafka-topics.sh --describe --topic quickstart-events --bootstrap-server localhost:9092
Created topic quickstart-events.
Topic: quickstart-events	TopicId: NZU_W3NQSqC3asEx1TlOKA	PartitionCount: 1	ReplicationFactor: 1	Configs: min.insync.replicas=1,segment.bytes=1073741824
	Topic: quickstart-events	Partition: 0	Leader: 1	Replicas: 1	Isr: 1	Elr: 	LastKnownElr: 
```

- `random-uuid` — 22 belgili klaster ID'si.
- `format --standalone` — log katalogini (`/tmp/kraft-combined-logs`) tayyorladi: `meta.properties` (klaster va tugun ID'si) va metama'lumot jurnali `__cluster_metadata-0`.
- `-daemon` — fonda ishga tushirish (skriptning o'z bayrog'i). Log'da `Kafka Server started`.
- Topic yaratildi va ko'rindi.

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-server-stop.sh; sleep 10; pgrep -f kafkaServer >/dev/null && echo "hali ishlayapti" || echo "broker to'xtadi"
broker to'xtadi
$ rm -rf /tmp/kafka-logs /tmp/kraft-combined-logs; ls /tmp | grep -c kraft
0
```

`kafka-server-stop.sh` brokerni to'xtatdi, ma'lumot katalogi o'chirildi.

### Docker'dagi broker

Kitobning qolgan qismi uchun broker — Docker'da, doim ishlab turadi:

```bash
docker run -d --name kafka -p 127.0.0.1:9092:9092 \
  -e KAFKA_HEAP_OPTS="-Xmx256m -Xms256m" --restart unless-stopped apache/kafka:4.4.0
```

`-p 127.0.0.1:9092:9092` — port faqat serverning o'zida ochiladi. Docker portlari ufw qoidalarini chetlab o'tadi (Server xavfsizligi kitobi, 17-bob), shuning uchun `127.0.0.1` ataylab yozilgan.

```text vps
$ docker start kafka >/dev/null; sleep 20; docker ps --filter name=kafka --format '{{.Names}} {{.Image}} {{.Status}} {{.Ports}}'
kafka apache/kafka:4.4.0 Up 20 seconds 127.0.0.1:9092->9092/tcp
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list
sinov
$ docker exec kafka sh -c 'grep -E "^(process.roles|node.id|listeners|advertised.listeners|log.dirs|controller.quorum.voters)" /etc/kafka/docker/server.properties'
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@localhost:9093
listeners=PLAINTEXT://:9092,CONTROLLER://:9093
advertised.listeners=PLAINTEXT://localhost:9092
log.dirs=/tmp/kraft-combined-logs
$ docker exec kafka java -version 2>&1 | head -1; docker stats --no-stream --format '{{.Name}} {{.MemUsage}}' kafka
openjdk version "25.0.4.1" 2026-08-18 LTS
kafka 412.4MiB / 1.752GiB
```

- `docker stop` / `docker start` dan keyin oldin yaratilgan `sinov` topic'i saqlanib qoldi: ma'lumot konteyner ichida (`/tmp/kraft-combined-logs`). `docker rm` qilinsa, u yo'qoladi. Saqlab qolish uchun volume kerak (Docker kitobi, 6-bob).
- Image'ning standart sozlamasi — bitta tugun, broker va controller birga, `localhost:9092`.
- Image ichida o'z Java 25'i bor; broker ~410 MB xotira ishlatyapti.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Lokal ishlab chiqish | `docker run apache/kafka:4.4.0` |
| Ma'lumot konteyner o'chirilganda ham qolsin | Docker + volume |
| Server, systemd | Arxiv + Java 17+ (25 tavsiya) |
| Ko'p tugun, sozlamalar ko'p | Docker Compose (22-bob) |
| Kam xotirali sinov muhiti | `KAFKA_HEAP_OPTS` ni kamaytirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Formatlamasdan arxivdan ishga tushirish | Log katalogi tayyor emas | `kafka-storage.sh format` (KD) |
| Docker'da `-p 9092:9092` (hamma interfeyslarda) | Docker ufw'ni chetlab o'tadi — port internetga ochiladi | `-p 127.0.0.1:9092:9092` |
| Kam xotirali serverda standart heap | 1 GB heap (skript) | `KAFKA_HEAP_OPTS` |
| `kafka-native` image'ni production'da | Eksperimental (KD) | JVM image |
| `/tmp` dagi ma'lumotni doimiy deb hisoblash | Standart `log.dirs` — `/tmp/kraft-combined-logs` | Doimiy katalog yoki volume |

## Amaliyot

1. Kafka'ni ishga tushirishning ikki yo'li qaysi?
2. Arxiv bilan ishga tushirishdan oldin qaysi ikki qadam bajariladi?
3. KRaft rejimida `process.roles=broker,controller` nimani bildiradi?
4. Nega Docker'da port `127.0.0.1` ga bog'landi?
5. `KAFKA_HEAP_OPTS` berilmasa, broker qancha heap oladi?

<details>
<summary>Javoblar</summary>

1. Arxiv (Java 17+) va Docker image.
2. `kafka-storage.sh random-uuid` bilan klaster ID'si va `kafka-storage.sh format`.
3. Bitta jarayon ham broker, ham controller.
4. Docker portlari ufw'ni chetlab o'tadi; port faqat serverning o'zida ochiq qolishi uchun.
5. 1 GB (`-Xmx1G -Xms1G`).

</details>

## Rasmiy hujjat

- [KD: Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) — Step 1–2, 8
- [KD: Docker](https://kafka.apache.org/44/getting-started/docker/)
- [Kafka Docker image usage guide](https://github.com/apache/kafka/blob/4.4/docker/examples/README.md)
- [Apache Kafka downloads](https://kafka.apache.org/community/downloads/)
