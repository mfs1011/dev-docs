# Xabar tizimlari — navbat, kafolat va asbob tanlash

Bu qo'llanma xabar tizimlarining umumiy g'oyalarini uchta asbob — Redis, RabbitMQ va Kafka — misolida o'rgatadi: navbat nima uchun kerak, ish navbati, pub/sub va hodisalar jurnali farqi, xabar necha marta yetkazilishi kafolatlanadi (ko'pi bilan bir marta, kamida bir marta, aynan bir marta), takror xabar va tartib, ishlab bo'lmaydigan xabarlar va qaysi holatda qaysi asbobni tanlash.

Bu kitob uch asbobning rasmiy hujjatlaridagi tushunchalarni yonma-yon qo'yadi. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Misollar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy. Asboblarning o'zini chuqur o'rganish — alohida **"Redis"**, **"RabbitMQ"** va **"Kafka"** kitoblarida.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| Redis | 8.10 | `content/redis/README.md` |
| RabbitMQ | 4.4 | `content/rabbitmq/README.md` |
| Kafka | 4.4 | `content/kafka/README.md` |
| Sinov muhiti | VPS (Ubuntu 26.04): Redis va RabbitMQ. Ikkinchi noutbuk (Docker): Kafka | `docs/ish-holati.md` |

Muhit tanlovi haqida:

- **Taqqoslash kimning ko'zi bilan.** RabbitMQ hujjatida Kafka bilan taqqoslash sahifasi bor, Kafka hujjati esa o'zini an'anaviy xabar brokerlari bilan solishtiradi. Ikkalasi ham o'z mahsulotining nuqtai nazari. Kitobda bunday da'volar kimniki ekani ko'rsatib keltiriladi, xulosalar esa uch tizimda sinalgan natijalarga tayanadi.

Qisqartmalar:

- **RD** — Redis hujjati (redis.io/docs/latest).
- **RQ** — RabbitMQ hujjati (rabbitmq.com/docs), **RT** — RabbitMQ qo'llanmalari (rabbitmq.com/tutorials).
- **KD** — Kafka hujjati, 4.4 (kafka.apache.org/44).

"Muhit" ustunida:

- **V** — VPS'da: Redis va RabbitMQ.
- **V+D** — VPS va ikkinchi noutbukdagi Kafka (Docker).
- **—** — tushuncha bobi, buyruqsiz.

⚑ belgisi: bobdagi har bir fakt rasmiy manbadan olingan, lekin taqqoslash jadvali yoki ketma-ketlik bizniki — rasmiy hujjatda bitta joyda yozilmagan.

Bu qo'llanmaga kirmaydigan mavzular:

- Ma'lumotlar bazasiga yozish va xabar yuborishni bitta atomik amalga birlashtirish (transactional outbox) va bazadagi o'zgarishlarni oqimga uzatish (CDC). Bular uch asbobning birortasining rasmiy hujjatida yoritilmagan, shuning uchun kiritilmadi.

> **Holat.** Qo'llanma yozilmoqda: 2/15 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Uch tizimda** — bir xil tushuncha Redis, RabbitMQ va Kafka'da qanday ko'rinadi; **haqiqiy** buyruq va chiqishlar.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Nega kerak (1–3)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Nega navbat](01-nega-navbat.md) | Og'ir ishni so'rov ichida bajarib, foydalanuvchini kuttirmaslik: ishni xabar qilib navbatga qo'yish va keyin bajarish. Yuboruvchini qabul qiluvchidan ajratish, ishlanmagan xabarlarni yig'ib turish (bufer) | — | [RT 2. Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-javascript) · [KD Use Cases → Messaging](https://kafka.apache.org/44/getting-started/uses/) · [RD Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/) |
| 02 | [Uch model](02-uch-model.md) | Ish navbati: har ishni bitta ishchi oladi. Pub/sub: har obunachiga nusxa. Hodisalar jurnali (log, stream): yozuvlar saqlanadi va qayta o'qiladi | V | [RT 3. Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-javascript) · [RQ Streams](https://www.rabbitmq.com/docs/streams) · [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [RD Pub/sub](https://redis.io/docs/latest/develop/pubsub/) |
| 03 | Uch asbob bir qarashda | Redis: list, stream, pub/sub. RabbitMQ: exchange va navbat, quorum navbat, stream. Kafka: partition'larga bo'lingan jurnal, consumer group, share group | — | [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) · [RT AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts) · [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) |

## II qism — Kafolatlar (4–9)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 04 | Yetkazish kafolatlari | "Ko'pi bilan bir marta" (at-most-once), "kamida bir marta" (at-least-once), "aynan bir marta" (exactly-once) ta'riflari. Redis pub/sub — ko'pi bilan bir marta, Redis stream — ikkalasi ham. RabbitMQ va Kafka'da qaysi sozlama qaysi kafolatni beradi | V+D | [KD Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/) · [RQ Reliability Guide](https://www.rabbitmq.com/docs/reliability) · [RD Pub/sub](https://redis.io/docs/latest/develop/pubsub/) |
| 05 | Qabul qiluvchining tasdig'i | Xabar qachon "ishlangan" hisoblanadi. Tasdiqlamay o'chgan consumer'ning xabari qayta beriladi. RabbitMQ'da ack, Kafka'da offset commit, Redis stream'da `XACK` | V+D | [RQ Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) · [KD Design → The Consumer](https://kafka.apache.org/44/design/design/) · [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 06 | Yuboruvchining kafolati | Broker xabarni haqiqatan saqladimi: RabbitMQ'da publisher confirms, Kafka'da `acks=all` va `min.insync.replicas`. Redis replikatsiyasi standartda asinxron | V+D | [RQ Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) · [KD Design → Replication](https://kafka.apache.org/44/design/design/) · [RD Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/) |
| 07 | Takror xabar va idempotentlik | "Kamida bir marta" takror xabarni ham anglatadi. RabbitMQ hujjati consumer'ni idempotent (takror ishlov natijani o'zgartirmaydigan) qilib yozishni tavsiya qiladi; `redelivered` belgisi. Kafka'da idempotent producer | V+D | [RQ Reliability Guide](https://www.rabbitmq.com/docs/reliability) · [KD Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/) |
| 08 | Tartib | RabbitMQ: bitta kanal, exchange, navbat va consumer bo'ylab tartib saqlanadi; qayta navbatga qaytgan xabar tartibni o'zgartiradi. Kafka: tartib faqat partition ichida. Redis stream: yozuv ID'lari tartibi. Parallel consumer'lar tartibga qanday ta'sir qiladi | V+D | [RQ Broker Semantics](https://www.rabbitmq.com/docs/semantics) · [KD Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 09 | Ishlab bo'lmaydigan xabarlar | Qayta urinish va uning chegarasi. RabbitMQ'da dead letter exchange, Kafka share group'larida DLQ, Redis job queue'da muvaffaqiyatsiz ishlar | V+D | [RQ Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx) · [RQ Reliability Guide](https://www.rabbitmq.com/docs/reliability) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) · [RD Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/) |

## III qism — Saqlash va masshtab (10–13)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 10 | Xabar qancha saqlanadi | Navbatda xabar tasdiqlangach o'chadi. Stream va jurnalda — muddat yoki hajm chegarasigacha qoladi va qayta o'qiladi. Redis stream'ni qisqartirish (`XTRIM`) | V+D | [RQ Streams](https://www.rabbitmq.com/docs/streams) · [KD Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) · [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 11 | Ishni ko'p consumer'ga bo'lish | RabbitMQ: navbatdagi consumer'lar va prefetch. Kafka: consumer group'da har partition bitta consumer'ga beriladi; share group'da bu cheklov yo'q. Redis stream'da consumer group | V+D | [RQ Consumer Prefetch](https://www.rabbitmq.com/docs/consumer-prefetch) · [KD Design → The Consumer, The Share Consumer](https://kafka.apache.org/44/design/design/) · [RD Streams](https://redis.io/docs/latest/develop/data-types/streams/) |
| 12 | Consumer ulgurmasa | RabbitMQ'da flow control va xotira/disk ogohlantirishlari. Kafka'da consumer lag'ni kuzatish. Redis'da xotira chegarasi | V+D | [RQ Flow Control](https://www.rabbitmq.com/docs/flow-control) · [RQ Memory and Disk Alarms](https://www.rabbitmq.com/docs/alarms) · [KD Basic Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) · [RD Key eviction](https://redis.io/docs/latest/develop/reference/eviction/) |
| 13 | Server o'chsa nima yo'qoladi | RabbitMQ'da quorum navbat (Raft), Kafka'da replikatsiya (ISR), Redis'da asinxron replika va Sentinel. Har birida nosozlikda qaysi xabar yo'qolishi mumkin | V+D | [RQ Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) · [KD Design → Replication](https://kafka.apache.org/44/design/design/) · [RD Replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/) · [RD Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) |

## IV qism — Tanlash (14–15)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 14 | ⚑ Qaysi asbobni tanlash | Holatlar jadvali: allaqachon bor Redis'dagi oddiy fon ishi; xabar darajasidagi boshqaruv va murakkab marshrutlash; hodisalar tarixini saqlash va qayta o'qish, katta oqim. RabbitMQ'ning Kafka bilan taqqoslashi va Kafka'ning foydalanish holatlari — har biri o'z nuqtai nazaridan | — | [RQ Compare RabbitMQ and Kafka](https://www.rabbitmq.com/docs/compare/kafka) · [KD Use Cases](https://kafka.apache.org/44/getting-started/uses/) · [RD Use cases](https://redis.io/docs/latest/develop/use-cases/) |
| 15 | ⚑ Bitta vazifa uch tizimda | "Buyurtma yaratildi" hodisasi Redis stream, RabbitMQ va Kafka bilan: kod, nosozlikdagi xatti-harakat va tartib farqi | V+D | Oldingi boblardagi manbalar |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 02 | Bitta xabar: ish navbatida bitta ishchiga, pub/sub'da hammaga, jurnalda saqlanib qoladi |
| 04 | Tasdiq ishlovdan oldin va keyin: xabar yo'qolishi yoki takrorlanishi |
| 08 | Ikkita parallel consumer va qayta navbatga qaytgan xabar tartibni qanday buzadi |
