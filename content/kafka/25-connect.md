# 25 — Kafka Connect

[Mundarija](README.md)

## Tushuncha

KD (Connect Overview): **Kafka Connect** — Kafka va boshqa tizimlar o'rtasida ma'lumotni kengayuvchan va ishonchli oqizish vositasi. Katta hajmdagi ma'lumotni Kafka'ga kiritadigan va undan chiqaradigan **konnektor**lar oson belgilanadi. Masalan, butun bazani yoki serverlar metrikalarini Kafka topic'lariga olish yoki topic'lardan qidiruv tizimiga, arxivga yozish mumkin.

| Konnektor | Yo'nalish |
| --- | --- |
| **Source** | Tashqi tizim → Kafka topic |
| **Sink** | Kafka topic → tashqi tizim |

### Imkoniyatlari (KD)

- Konnektorlar uchun **umumiy freymvork** — ishlab chiqish, joylash, boshqarish soddalashadi.
- **Standalone** va **distributed** rejimlar.
- **REST API** — konnektorlarni yuborish va boshqarish.
- **Offset'larni avtomatik boshqarish** — konnektor qayerda to'xtaganini Connect o'zi saqlaydi.
- Kengayuvchan: Kafka'ning guruh boshqaruvi protokoliga tayanadi — worker qo'shib kengaytiriladi.

### Rejimlar (KD Connect User Guide)

| | Standalone | Distributed |
| --- | --- | --- |
| Jarayon | Bitta | Bir nechta worker (guruh) |
| Nosozlikka chidamlilik | Yo'q | Bor: vazifalar avtomatik taqsimlanadi |
| Offset'lar | Lokal faylda (`offset.storage.file.filename`) | Kafka topic'larida (`offset.storage.topic`, `config.storage.topic`, `status.storage.topic`) |
| Konnektor sozlamalari | Buyruq qatorida fayl | Faqat REST API |
| Qachon | Bitta worker yetarli holat (masalan, log fayllar), ishlab chiqish | Production |

### Asosiy sozlamalar (KD)

- **Worker**:
  - `bootstrap.servers`;
  - `key.converter` va `value.converter` — Connect ma'lumotini Kafka formatiga aylantirish (JSON, Avro …). Konnektordan mustaqil;
  - `plugin.path` — konnektorlar joyi. Fayl konnektorlari (`connect-file-4.4.0.jar`) standart ravishda yuklanmaydi, ularni qo'lda qo'shish kerak.
- **Konnektor**:
  - `name` — noyob nom;
  - `connector.class` — to'liq nom yoki qisqa nom: `FileStreamSink`;
  - `tasks.max` — eng ko'p parallel vazifa;
  - sink uchun `topics` yoki `topics.regex`.

## Buyruqlar va kod

VPS'da, KD Quick Start 6-qadami bo'yicha. Connect — serverdagi Kafka arxividan, broker — Docker'dagi yakka broker (`localhost:9092`).

### Sozlamalar

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && grep -v '^#' config/connect-standalone.properties | grep -v '^$'; echo "---"; grep -v '^#' config/connect-file-source.properties | grep -v '^$'; echo "---"; grep -v '^#' config/connect-file-sink.properties | grep -v '^$'
bootstrap.servers=localhost:9092
key.converter=org.apache.kafka.connect.json.JsonConverter
value.converter=org.apache.kafka.connect.json.JsonConverter
key.converter.schemas.enable=true
value.converter.schemas.enable=true
offset.storage.file.filename=/tmp/connect.offsets
offset.flush.interval.ms=10000
---
name=local-file-source
connector.class=FileStreamSource
tasks.max=1
file=test.txt
topic=connect-test
---
name=local-file-sink
connector.class=FileStreamSink
tasks.max=1
file=test.sink.txt
topics=connect-test
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && cp config/connect-standalone.properties /root/connect-ishchi.properties && echo "plugin.path=$PWD/libs/connect-file-4.4.0.jar" >> /root/connect-ishchi.properties && tail -1 /root/connect-ishchi.properties; rm -f test.txt test.sink.txt /tmp/connect.offsets; echo foo > test.txt; echo bar >> test.txt
plugin.path=/opt/kafka-tgz/kafka_2.13-4.4.0/libs/connect-file-4.4.0.jar
```

Worker JSON konverterlar bilan, offset'larni `/tmp/connect.offsets` ga yozadi. Source `test.txt` ni `connect-test` topic'iga o'qiydi, sink topic'ni `test.sink.txt` ga yozadi. `plugin.path` qo'shildi (KD).

### Ishga tushirish va REST API

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && (KAFKA_HEAP_OPTS="-Xmx256m" bin/connect-standalone.sh /root/connect-ishchi.properties config/connect-file-source.properties config/connect-file-sink.properties > /root/connect.log 2>&1 &); until curl -sf localhost:8083/connectors >/dev/null 2>&1; do sleep 3; done; sleep 10; grep -o 'Kafka Connect started' /root/connect.log; cat test.sink.txt
Kafka Connect started
foo
bar
$ curl -s localhost:8083/ | python3 -c "import json,sys; d=json.load(sys.stdin); print('version:', d['version'])"; curl -s localhost:8083/connectors; echo; for c in local-file-source local-file-sink; do curl -s localhost:8083/connectors/$c/status | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['name'], d['type'], d['connector']['state'], [t['state'] for t in d['tasks']])"; done
version: 4.4.0
["local-file-source","local-file-sink"]
local-file-source source RUNNING ['RUNNING']
local-file-sink sink RUNNING ['RUNNING']
$ curl -s localhost:8083/connector-plugins | python3 -c "import json,sys; [print(p['class'], p['type']) for p in json.load(sys.stdin)]"
org.apache.kafka.connect.file.FileStreamSinkConnector sink
org.apache.kafka.connect.file.FileStreamSourceConnector source
org.apache.kafka.connect.mirror.MirrorCheckpointConnector source
org.apache.kafka.connect.mirror.MirrorHeartbeatConnector source
org.apache.kafka.connect.mirror.MirrorSourceConnector source
```

- Fayldagi ikki qator topic orqali sink fayliga o'tdi.
- REST (8083-port): ikkala konnektor va ularning vazifalari `RUNNING`.
- `/connector-plugins` — o'rnatilgan konnektorlar: fayl konnektorlari va MirrorMaker 2 konnektorlari (klasterlar orasida nusxalash).
- Kuzatildi: birinchi urinishda REST 40 soniyadan keyin ham `/connectors` ga **404** qaytardi — worker hali tayyor emas edi (1 CPU'li VPS). Shuning uchun keyingi sinovda dastur `/connectors` javob berguncha kutildi.

### Topic'dagi yozuvlar va yangi qator

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic connect-test --from-beginning --max-messages 2 2>/dev/null
{"schema":{"type":"string","optional":false},"payload":"foo"}
{"schema":{"type":"string","optional":false},"payload":"bar"}
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && echo "Another line" >> test.txt; sleep 8; cat test.sink.txt; cat /tmp/connect.offsets | strings | grep -o 'position[^}]*'
foo
bar
Another line
position":8
$ pkill -f ConnectStandalone; sleep 5; grep -c 'Kafka Connect stopped' /root/connect.log; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic connect-test
1
```

- Topic'da har qator JSON: `schema` va `payload` — JSON konverter (`schemas.enable=true`).
- `test.txt` ga qator qo'shilganda u sink fayliga ham tushdi — konnektorlar ishlashda davom etadi.
- Offset faylida source fayldagi o'rni saqlangan (`position`). Qayta ishga tushganda konnektor boshidan emas, shu joydan davom etadi.

## Variantlar

| Kerak | Tanlov |
| --- | --- |
| Sinov, bitta mashina | Standalone |
| Production, nosozlikka chidamli | Distributed, sozlamalar REST orqali |
| Baza o'zgarishlarini Kafka'ga (CDC) | Bazaga mos source konnektor (alohida loyiha) |
| Kafka'dan qidiruv/omborga | Mos sink konnektor |
| Klasterlar orasida nusxalash | MirrorMaker 2 (Connect konnektorlari) |
| Format | `key.converter` / `value.converter` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `plugin.path` siz fayl konnektorini ishlatish | Standart yuklanmaydi (KD) | `plugin.path` ga jar |
| Production'da standalone | Nosozlikka chidamsiz (KD) | Distributed |
| Distributed'da konnektorni buyruq qatorida berish | Faqat REST API (KD) | `POST /connectors` |
| Worker ishga tushishini kutmasdan REST'ga so'rov | 404 (sinovda) | `/connectors` javobini kutish |
| Distributed'ning ichki topic'larini avtomatik yaratilishiga qo'yish | KD: qo'lda, to'g'ri replikatsiya va compaction bilan yaratish tavsiya etiladi | Oldindan yaratish |

## Amaliyot

1. Source va sink konnektorlar farqi nima?
2. Standalone va distributed rejimlarida offset'lar qayerda saqlanadi?
3. Fayl konnektorlarini ishlatish uchun worker'ga nima qo'shildi?
4. Sinovda topic'dagi yozuvlar nega JSON ko'rinishida edi?
5. Konnektor qayta ishga tushganda fayl boshidan o'qiydimi?

<details>
<summary>Javoblar</summary>

1. Source — tashqi tizimdan Kafka'ga, sink — Kafka'dan tashqi tizimga.
2. Standalone — lokal faylda; distributed — Kafka topic'larida.
3. `plugin.path` — `connect-file-4.4.0.jar` yo'li.
4. Worker JSON konverter ishlatadi (`schemas.enable=true`): `schema` va `payload`.
5. Yo'q — offset faylidagi saqlangan o'rindan davom etadi.

</details>

## Rasmiy hujjat

- [KD: Quick Start](https://kafka.apache.org/44/getting-started/quickstart/) — Step 6
- [KD: Kafka Connect Overview](https://kafka.apache.org/44/kafka-connect/overview/)
- [KD: Kafka Connect User Guide](https://kafka.apache.org/44/kafka-connect/user-guide/) — Running Kafka Connect, Configuring Connectors
