# Kafka — hodisalar oqimi

Bu qo'llanma Apache Kafka'ni dasturchi ko'zi bilan o'rgatadi: hodisa (event) nima, u topic va partition'larda qanday saqlanadi, producer qanday yuboradi, consumer va consumer group qanday o'qiydi, hodisa necha marta yetkazilishi kafolatlanadi. Oxirida klaster, Kafka Connect, Kafka Streams va ekspluatatsiya (xavfsizlik, monitoring, yangilash).

Mundarija Kafka'ning rasmiy hujjati (4.4 versiyasi) tuzilmasiga solishtirib tuzilgan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Kafka | 4.4.0 (2026-10-22). Qo'llab-quvvatlanadigan relizlar: 4.4.0 va 4.3.x. Loyihaning maqsadi — yiliga 3 ta reliz; tuzatish relizlari faqat qo'llab-quvvatlanadigan relizlar uchun chiqadi | <https://kafka.apache.org/community/downloads/> |
| Java | 25 — hujjat eng so'nggi LTS versiyani tavsiya qiladi. Java 17, 21 va 25 to'liq qo'llab-quvvatlanadi | <https://kafka.apache.org/44/operations/java-version/> |
| Docker image | `apache/kafka:4.4.0` (JVM). `apache/kafka-native` — eksperimental, faqat lokal sinov uchun, production uchun tavsiya etilmaydi | <https://kafka.apache.org/44/getting-started/docker/> |
| Rejim | Faqat KRaft: yangilash hujjatiga ko'ra ZooKeeper rejimi olib tashlangan | <https://kafka.apache.org/44/getting-started/upgrade/> |

Muhit tanlovi haqida:

- **Nega Docker va xotira (heap) cheklovi.** Broker'ni ishga tushirish skripti `kafka-server-start.sh` Java uchun standartda 1 GB xotira (heap) ajratadi (`-Xmx1G -Xms1G`, `KAFKA_HEAP_OPTS` bo'sh bo'lsa). Sinov VPS'ida (2 GB) bunga joy yetmaydi. Shuning uchun misollar VPS'da rasmiy Docker image'da, `KAFKA_HEAP_OPTS="-Xmx256m -Xms256m"` bilan sinaladi (egasining qarori, 2026-11-10; `docs/ish-holati.md`).
- **Nega Java.** Hujjatga ko'ra Kafka tilga bog'liq bo'lmagan protokol orqali ishlaydi va ko'p tillarda klientlar bor, lekin Kafka loyihasining o'zi faqat Java klientlarini yuritadi. Boshqa tillar (Node.js, PHP, Python) klientlari — mustaqil loyihalar ([KD APIs](https://kafka.apache.org/44/apis/)). Shuning uchun ilova kodi Java'da, boshqa hamma narsa Kafka bilan birga keladigan `kafka-*.sh` buyruqlari orqali ko'rsatiladi.

Qisqartmalar:

- **KD** — Kafka rasmiy hujjati, 4.4 versiyasi (kafka.apache.org/44).
- **KR** — Kafka'ning rasmiy repozitoriysi (github.com/apache/kafka): Docker Compose misollari.

"Muhit" ustunida:

- **D** — Docker'da (`apache/kafka:4.4.0`), `kafka-*.sh` buyruqlari bilan.
- **D+J** — Docker'dagi Kafka va Java 25 dagi ilova kodi.
- **—** — tushuncha bobi, buyruqsiz.

Bu qo'llanmaga kirmaydigan mavzular:

- Navbat nima uchun kerak, yetkazish kafolatlari va RabbitMQ bilan taqqoslash — **"Xabar tizimlari"** kitobida.
- Docker'ning o'zi — **"Docker"** kitobida.
- Tiered storage (eski ma'lumotni arzon omborga ko'chirish), klasterlar orasida nusxalash (MirrorMaker 2) — katta klasterlar mavzusi, hujjatda: [KD Tiered Storage](https://kafka.apache.org/44/operations/tiered-storage/), [KD Geo-Replication](https://kafka.apache.org/44/operations/geo-replication-cross-cluster-data-mirroring/).

> **Holat.** Qo'llanma yozilmoqda: 22/35 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar va kod** — Docker'da ishga tushirilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Hodisalar oqimi nima](01-hodisalar-oqimi.md) | Hodisa (event) — "nima bo'ldi" degan yozuv. Hodisalar oqimi (event streaming) nima. Kafka qayerda ishlatiladi: xabar almashish, sayt faolligini kuzatish, metrikalar, log yig'ish, oqimni qayta ishlash, event sourcing | — | [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD Use Cases](https://kafka.apache.org/44/getting-started/uses/) |
| 02 | [Asosiy tushunchalar](02-asosiy-tushunchalar.md) | Hodisa tarkibi: kalit, qiymat, vaqt belgisi (timestamp), sarlavhalar (headers). Producer va consumer, topic, partition, replika, broker va klaster. Kafka API'lari: Producer, Consumer, Share Consumer, Streams, Connect, Admin | — | [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD APIs](https://kafka.apache.org/44/apis/) |
| 03 | [Kafka'ni ishga tushirish](03-ishga-tushirish.md) | Docker'da bitta tugun (node). KRaft rejimi. Arxiv (tgz) varianti va Java 17+ talabi. To'xtatish va ma'lumotni tozalash | D | [KD Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) · [KD Docker](https://kafka.apache.org/44/getting-started/docker/) |
| 04 | [Birinchi topic](04-birinchi-topic.md) | `kafka-topics.sh` bilan topic yaratish va ko'rish. `kafka-console-producer.sh` va `kafka-console-consumer.sh`. Hodisalar o'qilgandan keyin ham saqlanib turadi: ularni xohlagancha qayta o'qish mumkin | D | [KD Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) (3–5-qadamlar) |

## II qism — Topic va partition (5–9)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [Topic'larni boshqarish](05-topic-boshqarish.md) | Yaratish, ko'rish, o'zgartirish (partition qo'shish, sozlamani almashtirish), o'chirish. `kafka-configs.sh` | D | [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) · [KD Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) |
| 06 | [Partition va kalit](06-partition-kalit.md) | Hodisa qaysi partition'ga tushadi: kalit xeshi bo'yicha. Tartib faqat bitta partition ichida saqlanadi. Partition soni oshirilsa, bir xil kalitli hodisalar boshqa partition'ga tusha boshlaydi | D | [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD Design → The Producer](https://kafka.apache.org/44/design/design/) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) |
| 07 | [Log va offset](07-log-offset.md) | Partition — faqat oxiriga yoziladigan log (jurnal). Offset — hodisaning partition ichidagi tartib raqami. Segment fayllar va indekslar. Consumer o'z joyini offset bilan eslab qoladi | D | [KD Design → Persistence, The Consumer](https://kafka.apache.org/44/design/design/) · [KD Implementation → Log](https://kafka.apache.org/44/implementation/log/) |
| 08 | [Saqlash muddati](08-saqlash-muddati.md) | Hodisa o'qilgani uchun emas, muddati o'tgani uchun o'chiriladi. `retention.ms`, `retention.bytes`, segment sozlamalari, `cleanup.policy=delete` | D | [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) · [KD Implementation → Log](https://kafka.apache.org/44/implementation/log/) |
| 09 | [Log compaction](09-log-compaction.md) | `cleanup.policy=compact`: har kalitning oxirgi qiymati qoladi. Tombstone (qiymati bo'sh hodisa) bilan kalitni o'chirish. Qachon kerak: holatni tiklash | D | [KD Design → Log Compaction](https://kafka.apache.org/44/design/design/) · [KD Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) |

## III qism — Producer (10–13)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 10 | [Producer qanday yuboradi](10-producer.md) | Hodisalarni to'plab (batch) yuborish: `batch.size`, `linger.ms`. Siqish (`compression.type`). Asinxron yuborish | D+J | [KD Design → Efficiency, The Producer](https://kafka.apache.org/44/design/design/) · [KD Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) |
| 11 | [Ishonchli yuborish](11-ishonchli-yuborish.md) | `acks` (0, 1, all) va `min.insync.replicas`. Qayta urinish takror hodisa berishi mumkin. Idempotent producer (`enable.idempotence`) takrorni yo'qotadi | D+J | [KD Design → Message Delivery Semantics, Replication](https://kafka.apache.org/44/design/design/) · [KD Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) |
| 12 | [Java'dan hodisa yuborish](12-java-producer.md) | Producer API: `KafkaProducer`, `ProducerRecord`, callback. Serializer'lar. Producer'ni to'g'ri yopish | D+J | [KD APIs → Producer API](https://kafka.apache.org/44/apis/) · [KD Producer Configs](https://kafka.apache.org/44/configuration/producer-configs/) |
| 13 | [Tranzaksiyalar va exactly-once](13-tranzaksiyalar.md) | `transactional.id`. Bir nechta topic'ga bir yo'la (atomik) yozish. O'qish → ishlash → yozish zanjiri. Consumer'da `isolation.level=read_committed` | D+J | [KD Design → Using Transactions](https://kafka.apache.org/44/design/design/) · [KD Transaction Protocol](https://kafka.apache.org/44/operations/transaction-protocol/) |

## IV qism — Consumer (14–19)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 14 | [Consumer qanday o'qiydi](14-consumer.md) | Pull modeli: consumer hodisalarni o'zi so'rab oladi (`poll`). Consumer pozitsiyasi (position). `auto.offset.reset` | D+J | [KD Design → The Consumer](https://kafka.apache.org/44/design/design/) · [KD Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/) |
| 15 | [Consumer group](15-consumer-group.md) | Har partition guruh ichida bir vaqtda faqat bitta consumer'ga beriladi. Consumer qo'shilganda yoki chiqqanda partition'lar qayta taqsimlanadi (rebalance). Yangi `consumer` protokoli va eski `classic` protokol (yangisi standartda yoqilmagan) | D | [KD Design → The Consumer](https://kafka.apache.org/44/design/design/) · [KD Consumer Rebalance Protocol](https://kafka.apache.org/44/operations/consumer-rebalance-protocol/) |
| 16 | [Offset commit](16-offset-commit.md) | Avtomatik (`enable.auto.commit`) va qo'lda commit. "Ko'pi bilan bir marta" (at-most-once) va "kamida bir marta" (at-least-once) qayerdan kelib chiqadi. Takror ishlovga tayyor bo'lish | D+J | [KD Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/) · [KD Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/) |
| 17 | [Guruhlarni kuzatish](17-guruh-kuzatish.md) | `kafka-consumer-groups.sh`: a'zolar, offset'lar, lag (consumer qancha orqada qolgani). Offset'ni qayta o'rnatish (reset) | D | [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) (Checking consumer position, Managing consumer groups) |
| 18 | [Java'dan o'qish](18-java-consumer.md) | Consumer API: `KafkaConsumer`, `subscribe`, `poll`, `commitSync`. Deserializer'lar. Consumer'ni to'g'ri to'xtatish | D+J | [KD APIs → Consumer API](https://kafka.apache.org/44/apis/) · [KD Consumer Configs](https://kafka.apache.org/44/configuration/consumer-configs/) |
| 19 | [Share group: navbat rejimi](19-share-group.md) | Bitta partition'ni bir nechta consumer birga o'qiydi, consumer soni partition sonidan ko'p bo'lishi mumkin. Har hodisa alohida tasdiqlanadi (acknowledge). Yetkazish urinishlari sanaladi; ishlov berib bo'lmagan hodisa uchun dead-letter queue (DLQ) | D+J | [KD Design → The Share Consumer](https://kafka.apache.org/44/design/design/) · [KD APIs → Share Consumer API](https://kafka.apache.org/44/apis/) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) (Managing share groups, DLQ) |

## V qism — Klaster va ishonchlilik (20–24)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 20 | [Replikatsiya](20-replikatsiya.md) | Leader va follower replikalar. ISR (in-sync replicas) — leader'dan orqada qolmagan replikalar. `replication.factor` va `min.insync.replicas` birga qanday ishlaydi | D | [KD Design → Replication](https://kafka.apache.org/44/design/design/) |
| 21 | [KRaft: controller'lar](21-kraft.md) | `process.roles` (broker, controller). Controller kvorumi metadata'ni saqlaydi. Tugunni formatlash (`kafka-storage.sh`). `kafka-metadata-quorum.sh` | D | [KD KRaft](https://kafka.apache.org/44/operations/kraft/) |
| 22 | [Uch tugunli klaster](22-klaster.md) | Rasmiy Docker Compose misollari: combined (broker va controller bitta jarayonda) va isolated (alohida) rejimlar. Topic'ni 3 ta replika bilan yaratish | D | [KD Docker](https://kafka.apache.org/44/getting-started/docker/) · [KR docker/examples](https://github.com/apache/kafka/tree/trunk/docker/examples) |
| 23 | Tugun ishdan chiqsa | Yangi leader saylanadi. Unclean leader election va ma'lumot yo'qotish xavfi. Tugunni to'g'ri o'chirish (graceful shutdown). Eligible Leader Replicas | D | [KD Design → Replication](https://kafka.apache.org/44/design/design/) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) · [KD Eligible Leader Replicas](https://kafka.apache.org/44/operations/eligible-leader-replicas/) |
| 24 | Klasterni kengaytirish | Yangi broker o'z-o'zidan partition olmaydi. Partition'larni ko'chirish (`kafka-reassign-partitions.sh`). Replikatsiya faktorini oshirish. Ko'chirish paytida tarmoqni cheklash | D | [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) (Expanding your cluster, Increasing replication factor) |

## VI qism — Kafka Connect va Kafka Streams (25–28)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 25 | Kafka Connect | Tashqi tizimlardan ma'lumot olish (source) va ularga yozish (sink) konnektorlari. Standalone va distributed rejimlar. Fayl konnektori bilan import va eksport | D | [KD Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) (6-qadam) · [KD Connect Overview](https://kafka.apache.org/44/kafka-connect/overview/) · [KD Connect User Guide](https://kafka.apache.org/44/kafka-connect/user-guide/) |
| 26 | Connect: transformatsiya va xatolar | Single Message Transforms (har hodisani yo'lda o'zgartirish). REST API. Xatolarni boshqarish va dead letter queue topic | D | [KD Connect User Guide](https://kafka.apache.org/44/kafka-connect/user-guide/) |
| 27 | Kafka Streams asoslari | Oqimni qayta ishlovchi ilova. Topologiya. KStream va KTable. WordCount namunasi | D+J | [KD Streams Introduction](https://kafka.apache.org/44/streams/introduction/) · [KD Streams Quick Start](https://kafka.apache.org/44/streams/quickstart/) · [KD Streams Core Concepts](https://kafka.apache.org/44/streams/core-concepts/) |
| 28 | Holat, vaqt va oynalar | State store (holat ombori). Vaqt turlari. Oynalar (windowing) va agregatsiya. Qayta ishlash kafolatlari | D+J | [KD Streams Core Concepts](https://kafka.apache.org/44/streams/core-concepts/) · [KD Streams DSL API](https://kafka.apache.org/44/streams/developer-guide/dsl-api/) |

## VII qism — Ekspluatatsiya (29–35)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 29 | Muhim sozlamalar | Broker: `log.dirs`, `listeners` va `advertised.listeners`, `num.partitions`, `default.replication.factor`. Topic darajasidagi sozlamalar. Admin API | D | [KD Broker Configs](https://kafka.apache.org/44/configuration/broker-configs/) · [KD Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) · [KD APIs → Admin API](https://kafka.apache.org/44/apis/) |
| 30 | Xavfsizlik: TLS va SASL | Listener'lar va protokollar (PLAINTEXT, SSL, SASL_SSL). TLS bilan shifrlash. SASL bilan autentifikatsiya. Rasmiy Docker misollari | D | [KD Security Overview](https://kafka.apache.org/44/security/security-overview/) · [KD Listener Configuration](https://kafka.apache.org/44/security/listener-configuration/) · [KD SSL](https://kafka.apache.org/44/security/encryption-and-authentication-using-ssl/) · [KD SASL](https://kafka.apache.org/44/security/authentication-using-sasl/) |
| 31 | Ruxsatlar: ACL | `kafka-acls.sh`: kim qaysi topic va guruhga nima qila oladi | D | [KD Authorization and ACLs](https://kafka.apache.org/44/security/authorization-and-acls/) |
| 32 | Kvotalar va bir nechta jamoa | Producer va consumer tezligini cheklash (kvota). Topic nomlari bilan jamoalarni ajratish (multi-tenancy) | D | [KD Design → Quotas](https://kafka.apache.org/44/design/design/) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) (Setting quotas) · [KD Multi-Tenancy](https://kafka.apache.org/44/operations/multi-tenancy/) |
| 33 | Monitoring | JMX metrikalari. Broker, producer va consumer'ning asosiy metrikalari. Consumer lag | D | [KD Monitoring](https://kafka.apache.org/44/operations/monitoring/) |
| 34 | Server, disk va Java | Kafka xotira o'rniga OS'ning sahifa keshiga (page cache) tayanadi. Disk va fayl tizimi (XFS, ext4). Java versiyasi va JVM sozlamalari | D | [KD Hardware and OS](https://kafka.apache.org/44/operations/hardware-and-os/) · [KD Java Version](https://kafka.apache.org/44/operations/java-version/) · [KD Design → Persistence](https://kafka.apache.org/44/design/design/) |
| 35 | Yangilash | Tugunlarni birma-bir yangilash (rolling upgrade). Dastur va metadata versiyalari. Klient va broker mosligi | D | [KD Upgrading](https://kafka.apache.org/44/getting-started/upgrade/) · [KD Compatibility](https://kafka.apache.org/44/getting-started/compatibility/) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 06 | Kalitli hodisalar partition'larga taqsimlanadi; partition qo'shilgandan keyin bir xil kalit boshqa partition'ga tushadi |
| 15 | Consumer group: consumer qo'shilganda va chiqqanda partition'lar qayta taqsimlanadi |
| 16 | Offset commit hodisani ishlashdan oldin yoki keyin — yo'qotish yoki takror |
| 19 | Consumer group va share group: bitta partition'ni kim o'qiydi |
| 20 | Leader tushganda ISR'dan yangi leader saylanishi |
