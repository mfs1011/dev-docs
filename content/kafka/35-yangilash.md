# 35 — Yangilash

[Mundarija](README.md)

## Tushuncha

### Ikki xil versiya

| Versiya | Nima | Qanday o'zgaradi |
| --- | --- | --- |
| **Dastur versiyasi** | Serverdagi Kafka kodi (masalan, 4.3.2 → 4.4.0) | Tugunlarni birma-bir to'xtatib, yangi kod bilan qayta ishga tushirish |
| **Metadata versiyasi** (`metadata.version`) va boshqa **feature**'lar | Klaster metama'lumoti formati va yangi imkoniyatlar | Hamma tugun yangilangach `kafka-features.sh upgrade` |

Dastur yangilanganda klaster eski metadata versiyasida ishlashda davom etadi. Yangi imkoniyatlar faqat yakunlash (finalize) bosqichidan keyin yoqiladi.

### Rolling upgrade (KD Upgrading → Upgrading Servers to 4.4.0)

KD: 4.4.0 ga **3.3.x dan 4.3.0 gacha** bo'lgan har qanday versiyadan yangilash mumkin:

- Kafka 4.x faqat **KRaft** rejimida ishlaydi — ZooKeeper olib tashlangan.
- Dastur va metadata versiyalari kamida 3.3.x bo'lishi kerak. Undan eski KRaft klasterlarini avval 3.9.x ga yangilash tavsiya etiladi. ZooKeeper klasterlarini avval KRaft'ga ko'chirish kerak.

**Rolling upgrade** (tugunlarni navbatma-navbat yangilash):

1. Broker'larni **birma-bir** yangilang: to'xtating, kodni yangilang, qayta ishga tushiring.
2. Klaster xatti-harakati va unumi kutilganidek ekanini tekshiring.
3. Yangilashni yakunlang: `bin/kafka-features.sh --bootstrap-server localhost:9092 upgrade --release-version 4.4`.

Har `MetadataVersion` da "metama'lumot o'zgarishi bor/yo'q" belgisi bor. Joriy va maqsad versiyalar orasida metama'lumot o'zgarishi bo'lsa, **orqaga qaytarib bo'lmaydi** (downgrade).

### 4.4.0 dagi ba'zi muhim o'zgarishlar (KD Notable changes)

- `kafka-storage` formatlagan kataloglar endi **oldinga mos emas**: broker formatlagan vositaning versiyasidan eski bo'lmasligi kerak (KIP-1170).
- `broker.id` eskirgan, 5.0 da olib tashlanadi — `node.id` ishlating (KIP-1232).
- `kafka-broker-api-versions.sh` eskirgan — `kafka-cluster.sh api-versions`.
- Ba'zi Yammer guruh koordinatori metrikalari eskirgan — yangi `group-coordinator-metrics` (33-bob).

Har yangilashdan oldin o'sha versiyaning "Notable changes" ro'yxati o'qiladi.

### Moslik (KD Compatibility)

| Klient versiyasi | Kafka 4.x broker bilan |
| --- | --- |
| 0.x, 1.x, 2.0 | ❌ Mos emas: 0.10'dan oldingi protokollar olib tashlangan (KIP-896) |
| 2.1 – 2.8 | ⚠️ Qisman (klientlar), cheklangan (Streams, Connect) |
| 3.x | ✅ To'liq mos |

- Server tomonida 4.x yangilash uchun **dinamik voter** (21-bob) kvorumi 3.9.x'dan boshlab mos. Statik voter'dan dinamikka yangilab bo'lmaydi.
- Java: server va Connect — Java 17+ (34-bob), klientlar va Streams — Java 11+.
- AdminClient buyruqlaridagi `--zookeeper` olib tashlangan — faqat `--bootstrap-server`.

## Buyruqlar va kod

VPS'da, Kafka arxivlaridan. Bitta tugun: 4.3.2 da ishga tushiriladi, keyin 4.4.0 ga yangilanadi. Klasterda xuddi shu qadamlar **har tugun uchun navbatma-navbat** bajariladi, qolganlari bu vaqtda ishlab turadi (23-bob).

### 4.3.2 o'rnatish va ishga tushirish

```text vps
$ cd /opt/kafka-tgz && curl -sSfO https://archive.apache.org/dist/kafka/4.3.2/kafka_2.13-4.3.2.tgz && curl -sSfO https://archive.apache.org/dist/kafka/4.3.2/kafka_2.13-4.3.2.tgz.sha512 && [ "$(sha512sum kafka_2.13-4.3.2.tgz | cut -d' ' -f1)" = "$(sed 's/.*://' kafka_2.13-4.3.2.tgz.sha512 | tr -d ' \n' | tr A-F a-f)" ] && echo "sha512: mos" && tar -xzf kafka_2.13-4.3.2.tgz && ls -d kafka_2.13-4.*
sha512: mos
kafka_2.13-4.3.2
kafka_2.13-4.3.2.tgz
kafka_2.13-4.3.2.tgz.sha512
kafka_2.13-4.4.0
kafka_2.13-4.4.0.tgz
kafka_2.13-4.4.0.tgz.sha512
$ mkdir -p /root/kafka-yangilash && sed -e 's#^log.dirs=.*#log.dirs=/root/kafka-yangilash/data#' -e 's#localhost:9093#localhost:9393#g; s#://:9092#://localhost:9392#; s#://:9093#://localhost:9393#; s#localhost:9092#localhost:9392#g' /opt/kafka-tgz/kafka_2.13-4.3.2/config/server.properties > /root/kafka-yangilash/server.properties && cd /opt/kafka-tgz/kafka_2.13-4.3.2 && bin/kafka-storage.sh format -t $(bin/kafka-storage.sh random-uuid) --standalone -c /root/kafka-yangilash/server.properties 2>&1 | tail -1 && (KAFKA_HEAP_OPTS="-Xmx256m" bin/kafka-server-start.sh /root/kafka-yangilash/server.properties > /root/kafka-yangilash/broker.log 2>&1 &); for i in $(seq 60); do grep -q "Kafka Server started" /root/kafka-yangilash/broker.log 2>/dev/null && break; sleep 3; done; grep -o -E 'Kafka version: [0-9.]+' /root/kafka-yangilash/broker.log | head -1
Formatting dynamic metadata voter directory /root/kafka-yangilash/data with metadata.version 4.3-IV0.
Kafka version: 4.3.2
$ cd /opt/kafka-tgz/kafka_2.13-4.3.2 && bin/kafka-features.sh --bootstrap-server localhost:9392 describe | grep metadata.version | tr '\t' ' ' | sed -E 's/ +/ /g'; bin/kafka-topics.sh --bootstrap-server localhost:9392 --create --topic eski-xabarlar && printf 'birinchi\nikkinchi\nuchinchi\n' | bin/kafka-console-producer.sh --bootstrap-server localhost:9392 --topic eski-xabarlar && echo "3 ta xabar yozildi (4.3.2 producer)"
Feature: metadata.version SupportedMinVersion: 3.3-IV3 SupportedMaxVersion: 4.3-IV0 FinalizedVersionLevel: 4.3-IV0 Epoch: 38
Created topic eski-xabarlar.
3 ta xabar yozildi (4.3.2 producer)
```

- Arxiv `.sha512` bilan tekshirildi.
- Katalog 4.3.2 vositasi bilan `4.3-IV0` metadata versiyasida formatlandi.
- `FinalizedVersionLevel: 4.3-IV0` — klaster ishlatayotgan versiya. `SupportedMaxVersion` — dastur qo'llay oladigan eng yuqori versiya.

### Dasturni yangilash

```text vps
$ pkill -f '[k]afka-yangilash/server.properties'; for i in $(seq 30); do pgrep -f '[k]afka-yangilash/server.properties' >/dev/null || break; sleep 2; done; grep -c 'shut down completed' /root/kafka-yangilash/broker.log; cd /opt/kafka-tgz/kafka_2.13-4.4.0 && : > /root/kafka-yangilash/broker.log && (KAFKA_HEAP_OPTS="-Xmx256m" bin/kafka-server-start.sh /root/kafka-yangilash/server.properties > /root/kafka-yangilash/broker.log 2>&1 &); for i in $(seq 60); do grep -q "Kafka Server started" /root/kafka-yangilash/broker.log 2>/dev/null && break; sleep 3; done; grep -o -E 'Kafka version: [0-9.]+' /root/kafka-yangilash/broker.log | head -1
1
Kafka version: 4.4.0
$ cd /opt/kafka-tgz/kafka_2.13-4.3.2 && bin/kafka-console-consumer.sh --bootstrap-server localhost:9392 --topic eski-xabarlar --from-beginning --max-messages 3 2>/dev/null; cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-features.sh --bootstrap-server localhost:9392 describe | grep metadata.version | tr '\t' ' ' | sed -E 's/ +/ /g'
birinchi
ikkinchi
uchinchi
Feature: metadata.version SupportedMinVersion: 3.3-IV3 SupportedMaxVersion: 4.4-IV2 FinalizedVersionLevel: 4.3-IV0 Epoch: 184
```

- Broker to'g'ri to'xtatildi (`shut down completed`) va **xuddi shu katalog va sozlama** bilan 4.4.0 kodida ishga tushdi.
- Ma'lumot joyida: eski (4.3.2) consumer yangi broker'dan uchala xabarni o'qidi — klient va broker mos.
- `SupportedMaxVersion: 4.4-IV2`, lekin `FinalizedVersionLevel` hali `4.3-IV0`: klaster eski formatda ishlayapti, kerak bo'lsa dasturni orqaga qaytarish hali mumkin.

### Yakunlash

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-features.sh --bootstrap-server localhost:9392 upgrade --release-version 4.4; bin/kafka-features.sh --bootstrap-server localhost:9392 describe | grep metadata.version | tr '\t' ' ' | sed -E 's/ +/ /g'
eligible.leader.replicas.version was upgraded to 1.
group.version was upgraded to 1.
kraft.version was upgraded to 1.
metadata.version was upgraded to 33.
share.version was upgraded to 2.
streams.version was upgraded to 1.
transaction.version was upgraded to 2.
Feature: metadata.version SupportedMinVersion: 3.3-IV3 SupportedMaxVersion: 4.4-IV2 FinalizedVersionLevel: 4.4-IV2 Epoch: 215
```

`--release-version 4.4` faqat `metadata.version` ni emas, shu relizga mos **barcha feature**'larni ko'tardi. Masalan, `share.version` 2 bo'ldi — share group DLQ (4.4 o'zgarishlaridan biri).

### Orqaga qaytarish

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-features.sh --bootstrap-server localhost:9392 downgrade --release-version 4.3 2>&1 | head -3 | cut -c1-250
Could not downgrade eligible.leader.replicas.version to 1. The update failed for all features since the following feature had an error: Unsupported metadata.version downgrade from 33 to 30. Refusing to perform the requested downgrade because it might
Could not downgrade group.version to 1. The update failed for all features since the following feature had an error: Unsupported metadata.version downgrade from 33 to 30. Refusing to perform the requested downgrade because it might delete metadata in
Could not downgrade kraft.version to 1. The update failed for all features since the following feature had an error: Unsupported metadata.version downgrade from 33 to 30. Refusing to perform the requested downgrade because it might delete metadata in
$ pkill -f '[k]afka-yangilash/server.properties'; sleep 10; rm -rf /root/kafka-yangilash /opt/kafka-tgz/kafka_2.13-4.3.2 /opt/kafka-tgz/kafka_2.13-4.3.2.tgz*; ls -d /opt/kafka-tgz/kafka_2.13-4.*
/opt/kafka-tgz/kafka_2.13-4.4.0
/opt/kafka-tgz/kafka_2.13-4.4.0.tgz
/opt/kafka-tgz/kafka_2.13-4.4.0.tgz.sha512
```

Downgrade rad etildi: 4.4 da metama'lumot o'zgarishlari bor, orqaga qaytish metama'lumotni o'chirishi mumkin. Shuning uchun yakunlash **oxirgi** qadam — klaster yangi versiyada tekshirilgandan keyin (KD).

## Variantlar

| Holat | Yo'l |
| --- | --- |
| 3.3.x – 4.3.x KRaft → 4.4 | Rolling upgrade + `kafka-features.sh upgrade` |
| 3.3 dan eski KRaft | Avval 3.9.x ga |
| ZooKeeper klaster | Avval KRaft'ga ko'chirish (3.x da), keyin 4.x |
| Docker | Image tegini almashtirib, konteynerlarni birma-bir qayta yaratish; ma'lumot volume'da |
| Eski klientlar (2.x) | Avval klientlarni 3.x+ ga yangilash |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Barcha tugunlarni bir vaqtda to'xtatish | Klaster ishlamay qoladi | Birma-bir (rolling) |
| Kodni yangilash bilan birga darhol `kafka-features upgrade` | Metama'lumot o'zgarishidan keyin orqaga yo'l yo'q (sinovda) | Avval tekshirish, keyin yakunlash |
| "Notable changes" ni o'qimaslik | Eskirgan sozlamalar va mos kelmaydigan o'zgarishlar (masalan, KIP-1170) | Har versiya uchun o'qish |
| ZooKeeper klasterini to'g'ridan-to'g'ri 4.x ga | 4.x faqat KRaft (KD) | Avval KRaft'ga ko'chirish |
| 2.0 va eskiroq klientlarni qoldirish | 4.x bilan mos emas (KD) | Klientlarni yangilash |
| Yuklangan arxivni tekshirmaslik | Buzilgan yoki soxta fayl | `.sha512` (va imzo) |

## Amaliyot

1. Dastur versiyasi va metadata versiyasi farqi nima?
2. Rolling upgrade qadamlarini ayting.
3. Sinovda 4.4.0 ishga tushgach `FinalizedVersionLevel` nega hali `4.3-IV0` edi?
4. Nega downgrade rad etildi?
5. Qaysi klient versiyalari Kafka 4.x bilan mos emas?

<details>
<summary>Javoblar</summary>

1. Dastur — serverdagi kod; metadata versiyasi — klaster metama'lumoti formati va feature darajasi.
2. Broker'larni birma-bir to'xtatib, yangilab, qayta ishga tushirish → tekshirish → `kafka-features.sh upgrade --release-version …`.
3. Metadata versiyasi faqat `kafka-features.sh upgrade` bilan ko'tariladi.
4. 4.3 → 4.4 orasida metama'lumot o'zgarishlari bor; downgrade metama'lumotni yo'qotishi mumkin.
5. 0.x, 1.x va 2.0 (0.10'dan oldingi protokollar olib tashlangan).

</details>

## Rasmiy hujjat

- [KD: Upgrading](https://kafka.apache.org/44/getting-started/upgrade/) — Upgrading Servers to 4.4.0, Notable changes in 4.4.0, Upgrading to 4.3.0
- [KD: Compatibility](https://kafka.apache.org/44/getting-started/compatibility/)
