# 26 — Connect: transformatsiya va xatolar

[Mundarija](README.md)

## Tushuncha

### Single Message Transforms (KD Connect User Guide → Transformations)

Konnektorga **transformatsiyalar** ulanadi — har xabarni bittadan, yengil o'zgartirish. Ma'lumotni moslash va hodisalarni yo'naltirish uchun qulay. Zanjir konnektor sozlamasida beriladi:

| Kalit | Ma'nosi |
| --- | --- |
| `transforms` | Taxalluslar ro'yxati — qo'llanish tartibi |
| `transforms.$alias.type` | Transformatsiya klassining to'liq nomi |
| `transforms.$alias.<sozlama>` | O'sha transformatsiyaning sozlamalari |

O'rnatilganlaridan ba'zilari: `HoistField` (qiymatni Map ichiga o'rash), `InsertField` (maydon qo'shish), `ExtractField`, `Cast`, `Filter`, `Flatten`, `HeaderFrom`, `DropHeaders`… Shartli qo'llash uchun — **predicate**'lar.

### REST API (KD)

Connect xizmat sifatida ishlaydi va konnektorlarni boshqarish uchun REST API beradi — standalone'da ham, distributed'da ham. Standart port — 8083 (`listeners`).

| So'rov | Nima |
| --- | --- |
| `GET /connectors` | Faol konnektorlar |
| `POST /connectors` | Yangi konnektor: `{"name": …, "config": {…}}` |
| `GET /connectors/{name}/status` | Holat: konnektor va vazifalar, xato bo'lsa — trace |
| `PUT /connectors/{name}/config`, `PATCH …/config` | Sozlamani almashtirish yoki qisman o'zgartirish |
| `PUT …/pause`, `PUT …/stop`, `PUT …/resume` | Pauza (resurslar saqlanadi), to'xtatish (bo'shatiladi), davom ettirish |
| `POST …/restart?includeTasks=…&onlyFailed=…` | Qayta ishga tushirish |
| `GET …/offsets`, `PATCH …/offsets`, `DELETE …/offsets` | Offset'lar (o'zgartirish faqat to'xtatilgan konnektorda) |
| `DELETE /connectors/{name}` | O'chirish |
| `GET /connector-plugins` | O'rnatilgan plaginlar |

### Xatolar (KD → Error Reporting in Connect)

Standart xatti-harakat — **"tez yiqilish"** (fail fast): konvertatsiya yoki transformatsiyadagi birinchi xato vazifani to'xtatadi:

```text
errors.retry.timeout=0
errors.log.enable=false
errors.deadletterqueue.topic.name=
errors.tolerance=none
```

O'zgartirish mumkin:

| Sozlama | Nima |
| --- | --- |
| `errors.tolerance=all` | Xatoli yozuvni o'tkazib yuborish |
| `errors.log.enable`, `errors.log.include.messages` | Xatoni log'ga yozish (yozuv mazmuni bilan yoki mazmunsiz) |
| `errors.deadletterqueue.topic.name` | Xatoli yozuvni **dead letter queue** topic'iga yozish (sink konnektorlari) |
| `errors.deadletterqueue.context.headers.enable` | DLQ yozuviga xato tafsiloti header'lari |
| `errors.retry.timeout`, `errors.retry.delay.max.ms` | Qayta urinish |

## Buyruqlar va kod

VPS'da. Worker standalone, lekin konnektorlar fayl orqali emas, **REST API** bilan yaratiladi. KD misolidagi kabi sxemasiz JSON (`schemas.enable=false`).

```text vps
$ cd /root/connect && sed 's/schemas.enable=true/schemas.enable=false/' /root/connect-ishchi.properties > ishchi.properties && sed -i 's#/tmp/connect.offsets#/root/connect/offsets#' ishchi.properties && grep -E 'schemas.enable|offset.storage' ishchi.properties; printf 'foo\nbar\nhello world\n' > test.txt
key.converter.schemas.enable=false
value.converter.schemas.enable=false
offset.storage.file.filename=/root/connect/offsets
$ cd /root/connect && (KAFKA_HEAP_OPTS="-Xmx256m" /opt/kafka-tgz/kafka_2.13-4.4.0/bin/connect-standalone.sh ishchi.properties > connect.log 2>&1 &); until curl -sf localhost:8083/connectors >/dev/null 2>&1; do sleep 3; done; curl -s localhost:8083/connectors; echo
[]
```

### Transformatsiyalar

KD misoli — har qatorni Map'ga o'rash va manba maydonini qo'shish:

```json
{"name": "local-file-source", "config": {
  "connector.class": "FileStreamSource", "tasks.max": "1", "file": "/root/connect/test.txt", "topic": "connect-test",
  "transforms": "MakeMap, InsertSource",
  "transforms.MakeMap.type": "org.apache.kafka.connect.transforms.HoistField$Value",
  "transforms.MakeMap.field": "line",
  "transforms.InsertSource.type": "org.apache.kafka.connect.transforms.InsertField$Value",
  "transforms.InsertSource.static.field": "data_source",
  "transforms.InsertSource.static.value": "test-file-source"}}
```

```text vps
$ cd /root/connect && curl -s -X POST -H 'Content-Type: application/json' --data @manba.json localhost:8083/connectors | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['name'], d['type'])"; sleep 15; docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic connect-test --from-beginning --max-messages 3 2>/dev/null
local-file-source source
{"line":"foo","data_source":"test-file-source"}
{"line":"bar","data_source":"test-file-source"}
{"line":"hello world","data_source":"test-file-source"}
```

Fayldagi har qator endi `{"line": …, "data_source": "test-file-source"}` — KD'dagi natija bilan bir xil.

### Xato: standart — tez yiqilish

`xom` topic'ida uchta yozuv, o'rtadagisi JSON emas (`salom dunyo`):

```json
{"name": "qattiq-sink", "config": {
  "connector.class": "FileStreamSink", "tasks.max": "1", "topics": "xom", "file": "/root/connect/qattiq.txt"}}
```

```text vps
$ printf '{"id":1}\nsalom dunyo\n{"id":2}\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic xom; cd /root/connect && curl -s -X POST -H 'Content-Type: application/json' --data @qattiq.json localhost:8083/connectors >/dev/null; sleep 20; curl -s localhost:8083/connectors/qattiq-sink/status | python3 -c "import json,sys; d=json.load(sys.stdin); t=d['tasks'][0]; print('connector:', d['connector']['state'], '| task:', t['state']); print(t.get('trace','').split(chr(10))[0][:160])"; cat qattiq.txt 2>/dev/null; echo "qattiq.txt qatorlari: $(cat qattiq.txt 2>/dev/null | wc -l)"
[2026-11-10 19:01:34,207] WARN [Producer clientId=console-producer] The metadata response from the cluster reported a recoverable issue with correlation id 1 : {xom=UNKNOWN_TOPIC_OR_PARTITION} (org.apache.kafka.clients.NetworkClient)
connector: RUNNING | task: FAILED
org.apache.kafka.connect.errors.ConnectException: Tolerance exceeded in error handler
qattiq.txt qatorlari: 0
```

Konnektor `RUNNING`, lekin vazifasi **FAILED**: `Tolerance exceeded in error handler`. Faylga hech narsa yozilmadi — hatto to'g'ri birinchi yozuv ham.

### Xatoga chidamli sink va DLQ

```json
{"name": "yumshoq-sink", "config": {
  "connector.class": "FileStreamSink", "tasks.max": "1", "topics": "xom", "file": "/root/connect/yumshoq.txt",
  "errors.tolerance": "all",
  "errors.log.enable": "true",
  "errors.deadletterqueue.topic.name": "xom-xatolar",
  "errors.deadletterqueue.topic.replication.factor": "1",
  "errors.deadletterqueue.context.headers.enable": "true"}}
```

```text vps
$ cd /root/connect && curl -s -X POST -H 'Content-Type: application/json' --data @yumshoq.json localhost:8083/connectors >/dev/null; sleep 20; curl -s localhost:8083/connectors/yumshoq-sink/status | python3 -c "import json,sys; d=json.load(sys.stdin); print('connector:', d['connector']['state'], '| task:', d['tasks'][0]['state'])"; cat yumshoq.txt
connector: RUNNING | task: RUNNING
{id=1}
{id=2}
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic xom-xatolar --from-beginning --max-messages 1 --formatter-property print.headers=true 2>/dev/null | tr ',' '\n' | grep -o -E '__connect.errors.(topic|partition|offset|stage|class.name|exception.class.name)[^:]*:[^	]*' | cut -c1-120; grep -c 'Error encountered in task yumshoq-sink' connect.log
__connect.errors.topic:xom
__connect.errors.partition:0
__connect.errors.offset:1
__connect.errors.stage:VALUE_CONVERTER
__connect.errors.class.name:org.apache.kafka.connect.json.JsonConverter
__connect.errors.exception.class.name:org.apache.kafka.connect.errors.DataException
1
```

- Vazifa ishlashda davom etdi: to'g'ri yozuvlar (`{id=1}`, `{id=2}`) faylga tushdi.
- Buzuq yozuv `xom-xatolar` DLQ topic'iga o'tdi. Header'larida manba: topic, partition, offset (1), bosqich (`VALUE_CONVERTER`), konverter klassi va xato turi (`DataException`). Xato log'ga ham yozildi.
- `errors.deadletterqueue.topic.replication.factor=1` — bitta brokerli klasterda kerak. DLQ topic'i avtomatik yaratiladi, standart replication factor esa 3 ga teng.

### Boshqarish

```text vps
$ curl -s -X PUT localhost:8083/connectors/local-file-source/pause -o /dev/null -w '%{http_code}\n'; sleep 5; curl -s localhost:8083/connectors/local-file-source/status | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['connector']['state'])"; curl -s -X PUT localhost:8083/connectors/local-file-source/stop -o /dev/null -w '%{http_code}\n'; sleep 5; curl -s localhost:8083/connectors/local-file-source/offsets
202
PAUSED
204
{"offsets":[{"partition":{"filename":"/root/connect/test.txt"},"offset":{"position":20}}]}
$ curl -s -X DELETE localhost:8083/connectors/qattiq-sink -o /dev/null -w '%{http_code}\n'; curl -s localhost:8083/connectors; echo; pkill -f ConnectStandalone; sleep 5; for t in connect-test xom xom-xatolar; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done
204
["local-file-source","yumshoq-sink"]
```

- `pause` → `PAUSED`, `stop` → konnektor to'xtadi. Shundan keyin `GET …/offsets` — source fayldagi o'rni (`position: 20`). Faqat to'xtatilgan konnektorda offset'larni o'zgartirish yoki tozalash mumkin (KD).
- `DELETE` — konnektor o'chirildi (204).

## Variantlar

| Holat | Sozlama |
| --- | --- |
| Har xabarga maydon qo'shish, kalitni o'zgartirish | SMT (`InsertField`, `ValueToKey` …) |
| Faqat ba'zi yozuvlar | `Filter` + predicate |
| Buzuq yozuv pipeline'ni to'xtatmasin | `errors.tolerance=all` + DLQ |
| Buzuq yozuv darhol sezilsin | Standart `none` (fail fast) |
| Konnektorni qayta o'qitish | `stop` → `DELETE …/offsets` yoki `PATCH …/offsets` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Konnektor `RUNNING` — demak hammasi joyida deb hisoblash | Vazifa `FAILED` bo'lishi mumkin (sinovda) | Vazifalar holatini ham kuzatish |
| `errors.tolerance=all` ni DLQ'siz | Xatoli yozuvlar jimgina yo'qoladi | DLQ va/yoki `errors.log.enable` |
| Bitta brokerda DLQ replication factor'ini qoldirish | Standart — 3, DLQ topic'i yaratilmaydi | `errors.deadletterqueue.topic.replication.factor` |
| SMT bilan og'ir ishlov | SMT — yengil, xabarma-xabar o'zgartirish uchun (KD) | Kafka Streams (27-bob) |
| Ishlab turgan konnektor offset'ini o'zgartirish | Faqat to'xtatilganda (KD) | Avval `stop` |

## Amaliyot

1. SMT qanday sozlanadi?
2. Connect'ning standart xato xatti-harakati qanday?
3. Sinovda `qattiq-sink` va `yumshoq-sink` farqi nima bo'ldi?
4. DLQ yozuvining header'larida qanday ma'lumot bor edi?
5. Konnektor offset'larini o'zgartirishdan oldin nima qilish kerak?

<details>
<summary>Javoblar</summary>

1. `transforms` (taxalluslar tartibi), `transforms.$alias.type` va o'sha transformatsiyaning sozlamalari bilan.
2. Fail fast: birinchi xatoda vazifa to'xtaydi (`errors.tolerance=none`).
3. Qattiq: vazifa FAILED, hech narsa yozilmadi. Yumshoq: to'g'ri yozuvlar yozildi, buzuqi DLQ'ga tushdi.
4. Manba topic, partition, offset, bosqich, konverter klassi, xato turi.
5. Konnektorni `PUT …/stop` bilan to'xtatish.

</details>

## Rasmiy hujjat

- [KD: Kafka Connect User Guide](https://kafka.apache.org/44/kafka-connect/user-guide/) — Transformations, REST API, Error Reporting in Connect
