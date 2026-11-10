# 29 — Muhim sozlamalar

[Mundarija](README.md)

## Tushuncha

### Asosiy broker sozlamalari (KD Broker Configs)

| Sozlama | Ma'nosi | Yangilash |
| --- | --- | --- |
| `log.dirs` | Log ma'lumotlari saqlanadigan kataloglar (vergul bilan). Berilmasa — `log.dir` | read-only |
| `listeners` | Tinglanadigan URI'lar va listener nomlari. `0.0.0.0` — barcha interfeyslar | — |
| `advertised.listeners` | Klientlar va boshqa broker'larga **e'lon qilinadigan** manzillar. Haqiqiy `listeners` klient ulanishi kerak bo'lgan manzil bo'lmaganda (bulut, konteyner) kerak (22-bob) | — |
| `num.partitions` | Topic uchun standart partition soni. Ta'sir qiladi: avtomatik yaratish, Streams ichki topic'lari, `createTopics` da partition -1 bo'lsa | — |
| `default.replication.factor` | Standart replication factor (xuddi shu yo'llar) | — |
| `auto.create.topics.enable` | Topic'ni avtomatik yaratish (standart `true`, 4-bob) | read-only |
| `message.max.bytes` | Eng katta yozuvlar batch'i (siqilgandan keyin). Topic darajasida — `max.message.bytes` | cluster-wide |

### Dinamik yangilash (KD → Updating Broker Configs)

Ba'zi sozlamalarni broker'ni qayta ishga tushirmasdan o'zgartirish mumkin. Har sozlamaning **Update Mode** ustuni bor:

| Rejim | Ma'nosi |
| --- | --- |
| `read-only` | Qayta ishga tushirish kerak |
| `per-broker` | Har broker uchun dinamik |
| `cluster-wide` | Butun klaster uchun standart sifatida dinamik (sinov uchun broker bo'yicha ham) |

Bir sozlama bir necha darajada berilsa, **ustuvorlik** tartibi:

1. Broker bo'yicha dinamik sozlama (metama'lumot jurnalida);
2. Klaster bo'yicha dinamik standart (metama'lumot jurnalida);
3. `server.properties` dagi statik sozlama;
4. Kafka standarti.

Topic darajasidagi sozlamalar 5-bobda.

### Admin API (KD API)

Topic'lar, broker'lar, ACL va boshqa obyektlarni **koddan** boshqarish va ko'rish: `kafka-clients` dagi `Admin` interfeysi. CLI vositalarining (`kafka-topics.sh`, `kafka-configs.sh`) o'zi ham shu API'ni ishlatadi.

## Buyruqlar va kod

VPS'dagi yakka broker (Docker).

### Joriy qiymatlar va manbasi

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --describe --all | grep -E '^  (log.dirs|listeners|advertised.listeners|num.partitions|default.replication.factor|message.max.bytes)=' | sed 's/^ *//; s/ sensitive=false//'
advertised.listeners=PLAINTEXT://localhost:9092 synonyms={STATIC_BROKER_CONFIG:advertised.listeners=PLAINTEXT://localhost:9092}
default.replication.factor=1 synonyms={DEFAULT_CONFIG:default.replication.factor=1}
listeners=PLAINTEXT://:9092,CONTROLLER://:9093 synonyms={STATIC_BROKER_CONFIG:listeners=PLAINTEXT://:9092,CONTROLLER://:9093, DEFAULT_CONFIG:listeners=PLAINTEXT://:9092}
log.dirs=/tmp/kraft-combined-logs synonyms={STATIC_BROKER_CONFIG:log.dirs=/tmp/kraft-combined-logs}
message.max.bytes=1048588 synonyms={DEFAULT_CONFIG:message.max.bytes=1048588}
num.partitions=1 synonyms={STATIC_BROKER_CONFIG:num.partitions=1, DEFAULT_CONFIG:num.partitions=1}
```

`synonyms` — qiymat qayerdan kelgani: `STATIC_BROKER_CONFIG` (image'dagi `server.properties`) yoki `DEFAULT_CONFIG` (Kafka standarti).

### Ustuvorlik

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-default --alter --add-config message.max.bytes=2000000; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --alter --add-config message.max.bytes=3000000; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --describe --all | grep -E '^  message.max.bytes=' | sed 's/^ *//; s/ sensitive=false//' | tr ',' '\n'
Completed updating default config for brokers in the cluster.
Completed updating config for broker 1.
message.max.bytes=3000000 synonyms={DYNAMIC_BROKER_CONFIG:message.max.bytes=3000000
 DYNAMIC_DEFAULT_BROKER_CONFIG:message.max.bytes=2000000
 DEFAULT_CONFIG:message.max.bytes=1048588}
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --alter --delete-config message.max.bytes; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-default --alter --delete-config message.max.bytes; docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --describe --all | grep -E '^  message.max.bytes=' | sed 's/^ *//; s/ sensitive=false//'
Completed updating config for broker 1.
Completed updating default config for brokers in the cluster.
message.max.bytes=1048588 synonyms={DEFAULT_CONFIG:message.max.bytes=1048588}
```

- Klaster standarti 2 000 000, broker 1 uchun 3 000 000 — amaldagi qiymat **3 000 000**. `synonyms` ustuvorlik tartibini aynan ko'rsatadi: `DYNAMIC_BROKER_CONFIG` → `DYNAMIC_DEFAULT_BROKER_CONFIG` → `DEFAULT_CONFIG`.
- Ikkalasi olib tashlangach — yana Kafka standarti.

### Read-only sozlama

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --alter --add-config log.dirs=/tmp/boshqa 2>&1 | grep -o -E 'InvalidRequestException: .*' | cut -c1-160
InvalidRequestException: Cannot update these configs dynamically: [log.dirs]
InvalidRequestException: Cannot update these configs dynamically: [log.dirs]
```

`log.dirs` — read-only: dinamik o'zgartirish rad etildi.

### Admin API

```java
// Admin API: klaster haqida ma'lumot, topic yaratish (sozlama bilan) va sozlamalarni o'qish
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.common.config.ConfigResource;
import java.util.*;

public class Boshqaruv {
    public static void main(String[] a) throws Exception {
        try (Admin admin = Admin.create(Map.of(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092"))) {
            DescribeClusterResult k = admin.describeCluster();
            System.out.println("broker'lar: " + k.nodes().get().stream().map(n -> n.id() + "@" + n.host() + ":" + n.port()).toList()
                + ", faol controller: " + k.controller().get().id());

            NewTopic t = new NewTopic("admin-sinov", 3, (short) 1).configs(Map.of("retention.ms", "3600000"));
            admin.createTopics(List.of(t)).all().get();
            System.out.println("yaratildi: " + admin.listTopics().names().get().stream().filter(n -> !n.startsWith("_")).sorted().toList());

            ConfigResource r = new ConfigResource(ConfigResource.Type.TOPIC, "admin-sinov");
            Config c = admin.describeConfigs(List.of(r)).all().get().get(r);
            for (String nom : List.of("retention.ms", "cleanup.policy", "max.message.bytes"))
                System.out.printf("  %s=%s (%s)%n", nom, c.get(nom).value(), c.get(nom).source());

            admin.deleteTopics(List.of("admin-sinov")).all().get();
            System.out.println("o'chirildi");
        }
    }
}
```

```text vps
$ cd /root/kafka-java && java -cp '/opt/kafka-tgz/kafka_2.13-4.4.0/libs/*' Boshqaruv.java 2>/dev/null
broker'lar: [1@localhost:9092], faol controller: 1
yaratildi: [admin-sinov, quickstart-events]
  retention.ms=3600000 (DYNAMIC_TOPIC_CONFIG)
  cleanup.policy=delete (DEFAULT_CONFIG)
  max.message.bytes=1048588 (DEFAULT_CONFIG)
o'chirildi
```

Klaster ma'lumoti, sozlamali topic yaratish, sozlamalarni manbasi bilan o'qish va o'chirish — hammasi koddan. `retention.ms` — topic uchun berilgan (`DYNAMIC_TOPIC_CONFIG`), qolganlari standart.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Klaster bo'yicha bir xil qiymat | `--entity-default` (cluster-wide) |
| Bitta broker'ni sinash | `--entity-name N` (per-broker) |
| Read-only sozlama | `server.properties` + qayta ishga tushirish (birma-bir, 35-bob) |
| Bitta topic uchun | Topic sozlamasi (5-bob) |
| Koddan boshqarish (deploy skriptlari, platformalar) | Admin API |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `advertised.listeners` ni sozlamaslik (konteyner, bulut) | Klient ichki manzilni oladi va ulana olmaydi (22-bob) | Klient yeta oladigan manzil |
| Read-only sozlamani dinamik o'zgartirmoqchi bo'lish | Rad etiladi (sinovda) | Fayl + qayta ishga tushirish |
| Dinamik qiymat qayerdan kelganini bilmaslik | Broker/klaster/statik darajalar aralashadi | `--describe --all`, `synonyms` |
| Production'da `default.replication.factor=1` | Avtomatik yaratilgan topic'lar nusxasiz | 3 (yoki `auto.create.topics.enable=false`) |

## Amaliyot

1. `listeners` va `advertised.listeners` farqi nima?
2. Sozlamalarning uch dinamik yangilash rejimini ayting.
3. Bir sozlama to'rt darajada berilsa, qaysi biri ishlaydi?
4. Sinovda `message.max.bytes` qiymati nega 3 000 000 bo'ldi?
5. Admin API nima uchun kerak?

<details>
<summary>Javoblar</summary>

1. `listeners` — broker tinglaydigan manzillar; `advertised.listeners` — klientlarga ulanish uchun e'lon qilinadigan manzillar.
2. `read-only`, `per-broker`, `cluster-wide`.
3. Broker bo'yicha dinamik → klaster dinamik standarti → statik `server.properties` → Kafka standarti.
4. Broker bo'yicha dinamik qiymat klaster standartidan ustun.
5. Topic, broker, ACL va sozlamalarni koddan boshqarish va ko'rish uchun.

</details>

## Rasmiy hujjat

- [KD: Broker Configs](https://kafka.apache.org/44/configuration/broker-configs/) — Updating Broker Configs
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/)
- [KD: API → Admin API](https://kafka.apache.org/44/apis/)
