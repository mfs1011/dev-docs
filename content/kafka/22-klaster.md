# 22 — Uch tugunli klaster

[Mundarija](README.md)

## Tushuncha

Kafka rasmiy repozitoriysida (KR) Docker Compose misollari bor. Ularning `cluster/combined` (har tugun ham broker, ham controller) va `cluster/isolated` (alohida controller va broker'lar) variantlari ko'p tugunli klaster uchun.

### Ikki listener (KR: docker/examples README)

Har broker ikki tomonga ochilishi kerak:

| Listener | Kimlar uchun | E'lon qilingan manzil |
| --- | --- | --- |
| `PLAINTEXT` (`:19092`) | Boshqa broker'lar — Docker tarmog'i ichida | Konteyner hostname'i: `kafka-1:19092` |
| `PLAINTEXT_HOST` (`:9092`) | Host'dagi klientlar | `localhost:29092` (har broker — o'z porti: 29092, 39092, 49092) |
| `CONTROLLER` (`:9093`) | Controller kvorumi | `kafka-1:9093` … |

Klient ulangach, broker unga **e'lon qilingan** (advertised) manzillarni qaytaradi va klient keyin o'shalarga ulanadi. Shuning uchun har klient o'zi yeta oladigan listener'ni ishlatishi kerak.

### Asosiy sozlamalar

| O'zgaruvchi | Nima |
| --- | --- |
| `KAFKA_NODE_ID` | Tugun raqami (1, 2, 3) |
| `KAFKA_PROCESS_ROLES` | `broker,controller` (21-bob) |
| `KAFKA_CONTROLLER_QUORUM_VOTERS` | `1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093` — statik kvorum |
| `KAFKA_INTER_BROKER_LISTENER_NAME` | Broker'lar orasidagi listener |
| `CLUSTER_ID` | Hamma tugunda bir xil |
| `KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR` va boshqalar | Ichki topic'lar replikatsiyasi |

Muhit o'zgaruvchisi nomi qoidasi (3-bob): `KAFKA_` + xususiyat nomi katta harflarda, nuqta o'rniga `_`.

## Buyruqlar va kod

VPS'da. Rasmiy `cluster/combined/plaintext/docker-compose.yml` (4.4) olinib, quyidagilar o'zgartirildi:

- image versiyasi qotirildi: `apache/kafka:4.4.0`;
- portlar faqat `127.0.0.1` da — Docker portlari ufw'ni chetlab o'tadi (3-bob);
- har broker'ga heap 256 MB — VPS xotirasi 1.8 GB;
- ichki topic'lar (`__consumer_offsets`, tranzaksiya va share holati) **RF 3, min ISR 2, 5 partition**. Rasmiy misolda ular RF 1 — bu klasterning ma'nosini yo'qotadi: bitta broker tushsa, guruh offset'lari ishlamay qoladi.

```yaml
# KR: docker/examples/docker-compose-files/cluster/combined/plaintext (4.4) asosida.
# O'zgarishlar: image versiyasi, portlar faqat 127.0.0.1, heap 256 MB (VPS xotirasi), ichki topic'lar RF=3 / min ISR=2 va 5 partition.
# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

---
services:
  kafka-1:
    image: apache/kafka:4.4.0
    hostname: kafka-1
    container_name: kafka-1
    ports:
      - 127.0.0.1:29092:9092
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093'
      KAFKA_LISTENERS: 'PLAINTEXT://:19092,CONTROLLER://:9093,PLAINTEXT_HOST://:9092'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-1:19092,PLAINTEXT_HOST://localhost:29092
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_MIN_ISR: 2
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_OFFSETS_TOPIC_NUM_PARTITIONS: 5
      KAFKA_TRANSACTION_STATE_LOG_NUM_PARTITIONS: 5
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_NUM_PARTITIONS: 5
      KAFKA_HEAP_OPTS: '-Xmx256m -Xms256m'

  kafka-2:
    image: apache/kafka:4.4.0
    hostname: kafka-2
    container_name: kafka-2
    ports:
      - 127.0.0.1:39092:9092
    environment:
      KAFKA_NODE_ID: 2
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093'
      KAFKA_LISTENERS: 'PLAINTEXT://:19092,CONTROLLER://:9093,PLAINTEXT_HOST://:9092'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-2:19092,PLAINTEXT_HOST://localhost:39092
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_MIN_ISR: 2
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_OFFSETS_TOPIC_NUM_PARTITIONS: 5
      KAFKA_TRANSACTION_STATE_LOG_NUM_PARTITIONS: 5
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_NUM_PARTITIONS: 5
      KAFKA_HEAP_OPTS: '-Xmx256m -Xms256m'

  kafka-3:
    image: apache/kafka:4.4.0
    hostname: kafka-3
    container_name: kafka-3
    ports:
      - 127.0.0.1:49092:9092
    environment:
      KAFKA_NODE_ID: 3
      KAFKA_PROCESS_ROLES: 'broker,controller'
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: 'CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT'
      KAFKA_CONTROLLER_QUORUM_VOTERS: '1@kafka-1:9093,2@kafka-2:9093,3@kafka-3:9093'
      KAFKA_LISTENERS: 'PLAINTEXT://:19092,CONTROLLER://:9093,PLAINTEXT_HOST://:9092'
      KAFKA_INTER_BROKER_LISTENER_NAME: 'PLAINTEXT'
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka-3:19092,PLAINTEXT_HOST://localhost:49092
      KAFKA_CONTROLLER_LISTENER_NAMES: 'CONTROLLER'
      CLUSTER_ID: '4L6g3nShT-eMCtK--X86sw'
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 2
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_REPLICATION_FACTOR: 3
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_MIN_ISR: 2
      KAFKA_LOG_DIRS: '/tmp/kraft-combined-logs'
      KAFKA_OFFSETS_TOPIC_NUM_PARTITIONS: 5
      KAFKA_TRANSACTION_STATE_LOG_NUM_PARTITIONS: 5
      KAFKA_SHARE_COORDINATOR_STATE_TOPIC_NUM_PARTITIONS: 5
      KAFKA_HEAP_OPTS: '-Xmx256m -Xms256m'
```

### Ishga tushirish

Avval yakka broker (3-bob) va RabbitMQ to'xtatildi — xotira yetishi uchun:

```text vps
$ cd /root/kafka-klaster && docker compose down -v 2>&1 | tail -1; systemctl stop rabbitmq-server && echo "RabbitMQ vaqtincha to'xtatildi"; free -m | sed -n 2p | awk '{print "bo`sh:", $7, "MB"}'
 Network kafka-klaster_default Removed 
RabbitMQ vaqtincha to'xtatildi
bo`sh: 1086 MB
$ cd /root/kafka-klaster && docker compose up -d 2>&1 | grep -c Started; sleep 60; docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'; docker stats --no-stream --format '{{.Name}} {{.MemUsage}}' kafka-1 kafka-2 kafka-3; free -m | sed -n 2p | awk '{print "bo`sh:", $7, "MB"}'
3
NAME      STATUS              PORTS
kafka-1   Up About a minute   127.0.0.1:29092->9092/tcp
kafka-2   Up About a minute   127.0.0.1:39092->9092/tcp
kafka-3   Up About a minute   127.0.0.1:49092->9092/tcp
kafka-1 209.9MiB / 1.752GiB
kafka-2 222MiB / 1.752GiB
kafka-3 262.5MiB / 1.752GiB
bo`sh: 440 MB
```

Uchta konteyner — ~210–260 MB dan.

Kuzatildi: birinchi urinishda har broker'ga 160 MB heap berilgan edi. Broker'lar ishga tushib, bir daqiqa ichida `java.lang.OutOfMemoryError: Java heap space` ("Error starting LogManager") bilan to'xtadi. 256 MB va ichki topic'lar uchun 5 partition bilan barqaror ishladi.

### Qaysi manzil bilan ulanish

```text vps
$ docker exec kafka-1 /opt/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server localhost:9092 describe --status 2>&1 | tail -15
[2026-11-10 18:32:05,005] WARN [AdminClient clientId=adminclient-1] Connection to node 1 (localhost/127.0.0.1:29092) could not be established. Node may not be available. (org.apache.kafka.clients.NetworkClient)
[2026-11-10 18:32:05,108] WARN [AdminClient clientId=adminclient-1] Connection to node 2 (localhost/127.0.0.1:39092) could not be established. Node may not be available. (org.apache.kafka.clients.NetworkClient)
[2026-11-10 18:32:05,213] WARN [AdminClient clientId=adminclient-1] Connection to node 3 (localhost/127.0.0.1:49092) could not be established. Node may not be available. (org.apache.kafka.clients.NetworkClient)
org.apache.kafka.common.errors.TimeoutException: Timed out waiting for a node assignment. Call: listNodes
```

Konteyner **ichidan** `localhost:9092` ga ulandi. Broker esa e'lon qilingan `localhost:29092` … ni qaytardi — konteyner ichida bu manzillar yo'q, shuning uchun `TimeoutException`. Konteyner ichidan — ichki listener orqali:

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
$ /opt/kafka-tgz/kafka_2.13-4.4.0/bin/kafka-broker-api-versions.sh --bootstrap-server localhost:29092 2>/dev/null | grep -o '^[a-z0-9.:-]* (id: [0-9]* rack: [a-z]*' | sort
localhost:29092 (id: 1 rack: null
localhost:39092 (id: 2 rack: null
localhost:49092 (id: 3 rack: null
```

- Kvorumda 3 ta controller (`CurrentVoters`), faol — 3.
- Host'dan (Kafka arxivi vositalari bilan) uchala broker ko'rindi — har biri o'z `localhost:…` manzili bilan.

Bu klaster 20, 21, 23 va 24-boblarda ishlatiladi.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Lokal ko'p tugunli sinov | KR `cluster/combined` |
| Production'ga yaqin | KR `cluster/isolated` — alohida controller'lar |
| TLS yoki SASL | KR `cluster/*/ssl`, `sasl_plaintext` (30-bob) |
| Kam xotirali server | `KAFKA_HEAP_OPTS`, ichki topic partition'larini kamaytirish |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Konteyner ichidan host manzili (`localhost:29092`) | E'lon qilingan manzil ichkarida yo'q (sinovda `TimeoutException`) | Ichki listener (`kafka-1:19092`) |
| Ichki topic'larni RF 1 qoldirish | Bitta broker tushsa, guruhlar ishlamaydi | RF 3, min ISR 2 |
| Portlarni `0.0.0.0` ga ochish | Docker ufw'ni chetlab o'tadi | `127.0.0.1:…` |
| Juda kichik heap | `OutOfMemoryError` (sinovda 160 MB) | Yetarli xotira |
| Har tugunda boshqa `CLUSTER_ID` | Tugunlar bitta klasterga birlashmaydi | Bir xil ID |

## Amaliyot

1. Nega har broker'ga ikkita listener kerak?
2. Klient ulangach broker unga qaysi manzillarni beradi?
3. Sinovda konteyner ichidan `localhost:9092` ga ulanish nega ishlamadi?
4. Ichki topic'lar uchun nega RF 3 qo'yildi?
5. Combined va isolated misollarining farqi nima?

<details>
<summary>Javoblar</summary>

1. Biri — Docker tarmog'idagi boshqa broker'lar uchun, ikkinchisi — host'dagi klientlar uchun.
2. E'lon qilingan (advertised) manzillarni.
3. Broker e'lon qilgan `localhost:29092` … konteyner ichida mavjud emas.
4. Bitta broker tushsa ham guruh offset'lari va tranzaksiya holati ishlashi uchun.
5. Combined — har tugun broker va controller; isolated — controller'lar alohida.

</details>

## Rasmiy hujjat

- [KR: Docker examples README](https://github.com/apache/kafka/blob/4.4/docker/examples/README.md) — Multi Node Cluster
- [KR: cluster/combined/plaintext/docker-compose.yml](https://github.com/apache/kafka/blob/4.4/docker/examples/docker-compose-files/cluster/combined/plaintext/docker-compose.yml)
- [KD: Docker](https://kafka.apache.org/44/getting-started/docker/) · [KD: KRaft](https://kafka.apache.org/44/operations/kraft/)
