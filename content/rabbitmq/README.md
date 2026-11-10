# RabbitMQ — xabar brokeri

Bu qo'llanma RabbitMQ'ni dasturchi ko'zi bilan o'rgatadi: xabar (message) qanday yuboriladi va olinadi, exchange xabarni qaysi navbatga (queue) yo'naltiradi, xabar yo'qolmasligi uchun nima qilinadi (tasdiqlash, quorum navbat, dead lettering), serverdagi RabbitMQ qanday boshqariladi va kuzatiladi.

Mundarija RabbitMQ'ning rasmiy hujjati va rasmiy qo'llanmalari (tutorials) tuzilmasiga solishtirib tuzilgan. Har bob yonida u tayanadigan rasmiy sahifalar ko'rsatilgan. Har bobni yozishdan oldin shu sahifalar qayta o'qiladi. Buyruqlar real muhitda ishga tushirilib tekshiriladi, chiqishlar haqiqiy.

Manbalar va versiyalar (2026-11-07 da tekshirilgan):

| Narsa | Versiya | Qayerdan olindi |
| --- | --- | --- |
| RabbitMQ | 4.4.0 (2026-10-20), hamjamiyat qo'llab-quvvatlashi 2027-07-31 gacha. 4.3.x — 2027-01-31 gacha. Bu sanada hamjamiyat qo'llab-quvvatlashi faqat shu ikki seriyada davom etmoqda | <https://www.rabbitmq.com/release-information> (sana va muddatlar sayt manbasidagi `docusaurus.config.js` dan) |
| Erlang | RabbitMQ Erlang'da yozilgan. 4.4.0 uchun Erlang 27, 28 va 29 qo'llab-quvvatlanadi | <https://www.rabbitmq.com/docs/which-erlang> |
| Klient kutubxonalari | `amqplib` 2.3.1 (npm, 2026-11-08), `php-amqplib` 3.7.5 (Packagist, 2026-09-28), `rabbitmq-stream-js-client` 1.1.0 (npm). Node.js 26.13.0 LTS, PHP 8.5.4 (2026-11-10 da tekshirilgan) | <https://www.npmjs.com/package/amqplib> · <https://packagist.org/packages/php-amqplib/php-amqplib> · <https://www.npmjs.com/package/rabbitmq-stream-js-client> |
| O'rnatish | Team RabbitMQ'ning apt omborlari. Ubuntu 26.04 uchun Ubuntu 24.04 (Noble) ombori ishlatiladi. Ubuntu'ning o'z paketi — 4.0.5, u eskirgan | <https://www.rabbitmq.com/docs/install-debian> · VPS: `apt-cache policy rabbitmq-server` |
| Sinov VPS | Ubuntu 26.04 LTS | — |

Muhit tanlovi haqida:

- **Nega Ubuntu'ning paketi emas.** Hujjatga ko'ra standart Debian va Ubuntu omborlaridagi Erlang/OTP odatda eski bo'ladi. Ubuntu 26.04 dagi `rabbitmq-server` 4.0.5, 4.0 seriyasi esa hamjamiyat tomonidan qo'llab-quvvatlanmaydi. Shuning uchun RabbitMQ va Erlang hujjatda tavsiya etilgan Team RabbitMQ omborlaridan o'rnatiladi.
- **Nega Node.js va PHP.** Rasmiy qo'llanmalar ko'p tilda yozilgan, ular orasida JavaScript (`amqplib`) va PHP (`php-amqplib`) ham bor. Saytda JavaScript va Laravel/Symfony kitoblari bor, shuning uchun navbat misollari ikki tilda beriladi. Stream misollari — faqat Node.js (`rabbitmq-stream-js-client`): stream qo'llanmalari PHP uchun yozilmagan. Publisher confirms qo'llanmasi (7) aksincha faqat PHP uchun bor; Node.js tomoni hujjatdagi API bo'yicha.

Qisqartmalar:

- **RQ** — RabbitMQ rasmiy hujjati (rabbitmq.com/docs).
- **RT** — RabbitMQ rasmiy qo'llanmalari (rabbitmq.com/tutorials).

"Muhit" ustunida:

- **V** — VPS'da: `rabbitmqctl`, `rabbitmq-diagnostics`, `rabbitmqadmin` va boshqaruv paneli bilan.
- **V+N** — VPS'dagi RabbitMQ va ilova kodi: Node.js va PHP.
- **—** — tushuncha bobi, buyruqsiz.

Bu qo'llanmaga kirmaydigan mavzular:

- Navbat nima uchun kerak, yetkazish kafolatlari va Kafka bilan taqqoslash — **"Xabar tizimlari"** kitobida.
- MQTT, STOMP, Federation va Shovel plaginlari, Kubernetes, OAuth 2 va LDAP — maxsus holatlar, hujjatda: [RQ Plugins](https://www.rabbitmq.com/docs/plugins).
- Symfony Messenger va Laravel navbatlari bilan ulash — shu framework'lar kitoblarida.

> **Holat.** Qo'llanma yozilmoqda: 20/34 bob tayyor. Havolasi borlari — tayyor boblar.

---

## Har bobning skeleti

- **Tushuncha** — mavzu nima, oddiy so'zlar bilan. Qiyin joy animatsiya bilan.
- **Buyruqlar va kod** — VPS'da ishga tushirilgan buyruqlar va ularning **haqiqiy** chiqishi.
- **Variantlar** — bir ishning bir necha yo'li bo'lsa, jadvalda: qachon qaysi biri, yutug'i va kamchiligi.
- **Tipik xatolar** — xato → nega yomon → to'g'ri yo'l.
- **Amaliyot** — savollar va javoblar.
- **Rasmiy hujjat** — bob tayangan sahifalar.

---

## I qism — Kirish (1–4)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 01 | [Xabar brokeri nima](01-broker-nima.md) | Broker — xabarlarni qabul qilib, kerakli joyga yetkazuvchi server. Yuboruvchi (publisher), qabul qiluvchi (consumer), navbat (queue), exchange va binding. AMQP 0-9-1 modeli; RabbitMQ qo'llaydigan boshqa protokollar (AMQP 1.0, Stream) | — | [RT AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts) · [RQ Protocols](https://www.rabbitmq.com/docs/protocols) |
| 02 | [O'rnatish](02-ornatish.md) | Team RabbitMQ apt omborlari va Erlang. Servis, portlar (5672, 15672 va boshqalar), log fayllari. Ubuntu paketi nega mos emas | V | [RQ Debian and Ubuntu](https://www.rabbitmq.com/docs/install-debian) · [RQ Erlang Version Requirements](https://www.rabbitmq.com/docs/which-erlang) · [RQ Networking](https://www.rabbitmq.com/docs/networking) |
| 03 | [Birinchi xabar](03-birinchi-xabar.md) | "Hello World": navbatni e'lon qilish, xabar yuborish va olish | V+N | [RT 1. "Hello World!"](https://www.rabbitmq.com/tutorials/tutorial-one-javascript) · [RT (PHP)](https://www.rabbitmq.com/tutorials/tutorial-one-php) |
| 04 | [Boshqaruv vositalari](04-boshqaruv.md) | `rabbitmqctl`, `rabbitmq-diagnostics`, `rabbitmq-plugins`. Boshqaruv paneli (management plugin). `rabbitmqadmin` v2 | V | [RQ CLI](https://www.rabbitmq.com/docs/cli) · [RQ Management Plugin](https://www.rabbitmq.com/docs/management) · [RQ rabbitmqadmin v2](https://www.rabbitmq.com/docs/management-cli) |

## II qism — Exchange va marshrutlash (5–10)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 05 | [Ishni worker'larga bo'lish](05-worker-navbat.md) | Work queue: bir nechta worker'ga navbat bilan (round-robin) taqsimlash. Xabarni tasdiqlash (ack). Server qayta yonganda saqlanadigan (durable) navbat va doimiy (persistent) xabar. `prefetch=1` bilan adolatli taqsimlash | V+N | [RT 2. Work Queues](https://www.rabbitmq.com/tutorials/tutorial-two-javascript) · [RT (PHP)](https://www.rabbitmq.com/tutorials/tutorial-two-php) |
| 06 | [Exchange turlari](06-exchange-turlari.md) | `direct`, `fanout`, `topic`, `headers`. Standart (default) exchange. Binding va routing key | V | [RQ Exchanges](https://www.rabbitmq.com/docs/exchanges) · [RT AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts) |
| 07 | [Hammaga tarqatish](07-hammaga-tarqatish.md) | Publish/Subscribe: `fanout` exchange. Vaqtinchalik (exclusive) navbatlar | V+N | [RT 3. Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-javascript) · [RT (PHP)](https://www.rabbitmq.com/tutorials/tutorial-three-php) |
| 08 | [Tanlab yuborish](08-tanlab-yuborish.md) | `direct` exchange bilan routing. `topic` exchange va shablonlar (`*`, `#`) | V+N | [RT 4. Routing](https://www.rabbitmq.com/tutorials/tutorial-four-javascript) · [RT 5. Topics](https://www.rabbitmq.com/tutorials/tutorial-five-javascript) · [RT 4 (PHP)](https://www.rabbitmq.com/tutorials/tutorial-four-php) · [RT 5 (PHP)](https://www.rabbitmq.com/tutorials/tutorial-five-php) |
| 09 | [So'rov va javob (RPC)](09-rpc.md) | `reply_to` va `correlation_id`. Direct Reply-To | V+N | [RT 6. RPC](https://www.rabbitmq.com/tutorials/tutorial-six-javascript) · [RQ Direct Reply-To](https://www.rabbitmq.com/docs/direct-reply-to) · [RT 6 (PHP)](https://www.rabbitmq.com/tutorials/tutorial-six-php) |
| 10 | [Qo'shimcha marshrutlash](10-qoshimcha-marshrut.md) | Alternate exchange — yo'nalish topilmagan xabarlar uchun. Exchange'ni exchange'ga bog'lash | V | [RQ Alternate Exchanges](https://www.rabbitmq.com/docs/ae) · [RQ Exchange to Exchange Bindings](https://www.rabbitmq.com/docs/e2e) |

## III qism — Navbatlar (11–17)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 11 | [Navbat xususiyatlari](11-navbat-xususiyatlari.md) | `durable`, `exclusive`, `auto-delete`. Navbat argumentlari. Navbat turlari: classic, quorum, stream | V | [RQ Queues](https://www.rabbitmq.com/docs/queues) |
| 12 | [Quorum navbatlar](12-quorum.md) | Bir nechta tugunda nusxasi saqlanadigan xavfsiz navbat. Qachon classic, qachon quorum | V | [RQ Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) · [RQ Classic Queues](https://www.rabbitmq.com/docs/classic-queues) |
| 13 | [Xabar va navbat muddati](13-ttl.md) | TTL (time-to-live): xabarning yashash muddati. Ishlatilmayotgan navbatning o'chishi | V | [RQ Time-to-Live and Expiration](https://www.rabbitmq.com/docs/ttl) |
| 14 | [Navbat uzunligi chegarasi](14-uzunlik-chegarasi.md) | `max-length`, `max-length-bytes`. Chegaradan oshganda nima bo'ladi (`overflow`) | V | [RQ Queue Length Limit](https://www.rabbitmq.com/docs/maxlength) |
| 15 | [Dead lettering](15-dead-letter.md) | Rad etilgan, muddati o'tgan yoki chegaradan oshgan xabar boshqa exchange'ga (DLX) o'tadi. Quorum navbatlarda "kamida bir marta" (at-least-once) dead lettering | V+N | [RQ Dead Letter Exchanges](https://www.rabbitmq.com/docs/dlx) |
| 16 | [Ustuvor navbatlar](16-ustuvor-navbat.md) | Muhimroq xabarni oldinroq berish (priority) | V | [RQ Priority Queues](https://www.rabbitmq.com/docs/priority) |
| 17 | [Policy'lar](17-policy.md) | Navbat sozlamalarini kodda emas, server tomonda policy bilan berish. Operator policy'lari | V | [RQ Policies](https://www.rabbitmq.com/docs/policies) |

## IV qism — Ishonchlilik (18–22)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 18 | [Consumer tasdig'i](18-consumer-tasdigi.md) | Avtomatik va qo'lda tasdiqlash (ack). `nack` va `reject`. Qayta yetkazilgan xabar (`redelivered`) | V+N | [RQ Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) · [RQ Negative Acknowledgements](https://www.rabbitmq.com/docs/nack) · [RQ Consumers](https://www.rabbitmq.com/docs/consumers) |
| 19 | [Prefetch](19-prefetch.md) | Consumer'ga tasdiqlanmagan nechta xabar beriladi. Xotira va tezlik o'rtasidagi muvozanat | V+N | [RQ Consumer Prefetch](https://www.rabbitmq.com/docs/consumer-prefetch) |
| 20 | [Publisher confirms](20-publisher-confirms.md) | Broker xabarni qabul qilganini yuboruvchiga tasdiqlaydi. Tasdiqni kutish strategiyalari | V+N | [RQ Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/confirms) · [RT 7. Publisher Confirms](https://www.rabbitmq.com/tutorials/tutorial-seven-php) |
| 21 | Xabar qayerda yo'qolishi mumkin | Tarmoq, broker va consumer nosozliklari. Takror xabar va idempotentlik. Heartbeat'lar | V | [RQ Reliability Guide](https://www.rabbitmq.com/docs/reliability) · [RQ Heartbeats](https://www.rabbitmq.com/docs/heartbeats) |
| 22 | Ulanish va kanallar | Connection va channel. Ulanishni qayta tiklash. Broker ulanishni bloklaganda (blocked connection) va flow control | V+N | [RQ Connections](https://www.rabbitmq.com/docs/connections) · [RQ Channels](https://www.rabbitmq.com/docs/channels) · [RQ Blocked Connection Notifications](https://www.rabbitmq.com/docs/connection-blocked) · [RQ Flow Control](https://www.rabbitmq.com/docs/flow-control) |

## V qism — Stream'lar (23–24)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 23 | Stream nima | Faqat oxiriga yoziladigan (append-only) log: xabar o'qilgandan keyin ham qoladi va qayta o'qiladi. Stream va navbat farqi | V+N | [RQ Streams](https://www.rabbitmq.com/docs/streams) · [RT Stream 1. "Hello World!"](https://www.rabbitmq.com/tutorials/tutorial-one-javascript-stream) |
| 24 | Offset va filtrlash | Qayerdan o'qishni boshlash (offset) va uni eslab qolish. Stream filtrlash | V+N | [RT Stream 2. Offset Tracking](https://www.rabbitmq.com/tutorials/tutorial-two-javascript-stream) · [RQ Stream Filtering](https://www.rabbitmq.com/docs/stream-filtering) |

## VI qism — Boshqaruv va xavfsizlik (25–29)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 25 | Virtual host'lar | Bitta server ichida bir-biridan ajratilgan muhitlar (vhost) | V | [RQ Virtual Hosts](https://www.rabbitmq.com/docs/vhosts) |
| 26 | Foydalanuvchilar va ruxsatlar | `configure`, `write`, `read` ruxsatlari. `guest` foydalanuvchisi standartda faqat localhost'dan ulana oladi. Parollar | V | [RQ Access Control](https://www.rabbitmq.com/docs/access-control) · [RQ Credentials and Passwords](https://www.rabbitmq.com/docs/passwords) |
| 27 | Konfiguratsiya va loglar | `rabbitmq.conf` va `advanced.config`. Fayl va kataloglar joyi. Loglash | V | [RQ Configuration](https://www.rabbitmq.com/docs/configure) · [RQ File and Directory Locations](https://www.rabbitmq.com/docs/relocate) · [RQ Logging](https://www.rabbitmq.com/docs/logging) |
| 28 | TLS | Shifrlangan ulanish (port 5671). Sertifikatlar. TLS muammolarini tekshirish | V | [RQ TLS Support](https://www.rabbitmq.com/docs/ssl) · [RQ Troubleshooting TLS](https://www.rabbitmq.com/docs/troubleshooting-ssl) |
| 29 | Definitions va zaxira | Navbat, exchange, foydalanuvchi va policy'larni eksport/import qilish (schema definitions). Zaxira nusxa va tiklash | V | [RQ Schema Definitions](https://www.rabbitmq.com/docs/definitions) · [RQ Backup and Restore](https://www.rabbitmq.com/docs/backup) |

## VII qism — Ekspluatatsiya (30–34)

| # | Bob | Mazmun | Muhit | Rasmiy manba |
| --- | --- | --- | --- | --- |
| 30 | Xotira va disk chegaralari | Xotira yoki disk chegarasiga yetganda RabbitMQ yuboruvchilarni to'xtatib turadi (alarm). Xotira qayerga ketayotganini ko'rish | V | [RQ Memory and Disk Alarms](https://www.rabbitmq.com/docs/alarms) · [RQ Memory Alarms](https://www.rabbitmq.com/docs/memory) · [RQ Disk Alarms](https://www.rabbitmq.com/docs/disk-alarms) · [RQ Memory Use](https://www.rabbitmq.com/docs/memory-use) |
| 31 | Monitoring | `rabbitmq-diagnostics` bilan tekshiruvlar. HTTP API. Prometheus plagini | V | [RQ Monitoring](https://www.rabbitmq.com/docs/monitoring) · [RQ Prometheus and Grafana](https://www.rabbitmq.com/docs/prometheus) |
| 32 | Klaster | Bir nechta tugunni klasterga birlashtirish. Bitta mashinada klaster (hujjatda tajriba uchun ko'rsatilgan). Tarmoq bo'linib qolganda (network partition) nima bo'ladi | V | [RQ Clustering](https://www.rabbitmq.com/docs/clustering) · [RQ Cluster Formation](https://www.rabbitmq.com/docs/cluster-formation) · [RQ Network Partitions](https://www.rabbitmq.com/docs/partitions) |
| 33 | Yangilash | Tugunlarni birma-bir yangilash (rolling upgrade). Blue-green usuli. Feature flag'lar | V | [RQ Upgrade](https://www.rabbitmq.com/docs/upgrade) · [RQ Rolling Upgrade](https://www.rabbitmq.com/docs/rolling-upgrade) · [RQ Blue-Green Deployment](https://www.rabbitmq.com/docs/blue-green-upgrade) · [RQ Feature Flags](https://www.rabbitmq.com/docs/feature-flags) |
| 34 | Production tekshiruv ro'yxati | Vhost va foydalanuvchilar, resurs chegaralari, ochiq fayllar soni, TLS, monitoring — ishga tushirishdan oldin nimani tekshirish | V | [RQ Production Checklist](https://www.rabbitmq.com/docs/production-checklist) · [RQ Configurable Limits](https://www.rabbitmq.com/docs/limits) |

---

## Animatsiyalar (qiyin tushunchalar)

| Bob | Nimani ko'rsatadi |
| --- | --- |
| 06 | Bitta xabar to'rt xil exchange'da qaysi navbatlarga tushadi |
| 15 | Xabar rad etiladi yoki muddati o'tadi → DLX → dead letter navbat |
| 18 | Ack'siz consumer o'chsa, xabar navbatga qaytib, boshqa consumer'ga beriladi |
| 20 | Publisher confirms: xabar broker'ga yetdimi, yo'qmi |
