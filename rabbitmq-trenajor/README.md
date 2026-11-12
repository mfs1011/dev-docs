# RabbitMQ trenajori

Saytdagi `/rabbitmq/trenajor` sahifasi: brauzerda (v86, 32-bit) haqiqiy Debian 12, Erlang/OTP 28.5.0.8 va RabbitMQ 4.4.0.
Simulyator emas — har tugma brokerda haqiqiy amal bajaradi, sxemadagi har harakat brokerning o'z hodisasi.

## Qanday ishlaydi

- **Erlang** Debian 12 i386 konteynerida erlang/otp rasmiy manba arxividan yig'iladi (`scripts/erlang-yigish.sh`).
  Debian 12 dagi Erlang 25 RabbitMQ 4.4 ga yetmaydi (rabbitmq.com/docs/which-erlang: 27–29). 32-bit'da JIT yo'q.
- **RabbitMQ** — rasmiy "generic UNIX" arxivi, GPG imzosi tekshiriladi (`scripts/rabbitmq-arxiv.sh`), `/opt/rabbitmq` ga.
- **Tasvir** Linux trenajori quvurining `rabbitmq` profili bilan yig'iladi (`profil.json`, `ildiz/`):
  - `rabbitmq-server.service` — 32-bit VM uchun kam Erlang oqimi (`+S 1:1 +SDcpu 1:1 +SDio 4 +A 8`);
  - `rabbitmq.conf` — faqat 127.0.0.1, management plagini, xotira chegarasi mutlaq (200 MB);
  - `profil.json` → `holatKutish`: holat surati RabbitMQ ko'tarilib, boshqaruv xizmati "tayyor" degach olinadi
    (`linux-trenajor/scripts/holat.mjs`). Sahifa ishlab turgan broker bilan 1–2 s da ochiladi.
- **Kanal** — ikkinchi serial port (`/dev/ttyS1`, v86 `uart1`), har qatorda bitta JSON:
  - sahifa → VM: `{"id", "op", ...}` — `src/rabbitmq/kanal.js`;
  - VM ichida `rmq-boshqaruv` (Python 3 + pika 1.2) buyruqni HTTP API (127.0.0.1:15672) yoki AMQP orqali bajaradi;
  - VM → sahifa: `holat` (har soniyada topologiya va hisoblagichlar), `oqim` (firehose — `amq.rabbitmq.trace`,
    `routed_queues` bilan), `ishlov` (consumer xabarni ishladi), `javob`.
- **Sahifa** — `src/views/RabbitmqTrenajorPage.vue`:
  - erkin rejimda bo'sh brokerda namuna topologiya quriladi (`namuna.js`): `buyurtmalar` (alternate-exchange →
    `olik-xatlar`), `email` / `sms` (3 worker) / `audit` navbatlari (DLX → `olik-xatlar`), `olik-xatlar-navbati`;
  - tez panel (`TezPanel.vue`): exchange turi (o'chirib qayta e'lon qilinadi), routing key / header'lar, body,
    ack rejimi, test xabarlari (`x-trenajor: xato|poison` header'i — consumer nack yoki reject qiladi),
    persistent, consumer offline, broker restart (`rabbitmqctl stop_app/start_app`), navbat + worker qo'shish, auto-demo;
  - xabar oqimi (`Sxema.vue`): producer'lar (xabar `app_id` xossasi — firehose'dan o'qiladi), exchange, navbat,
    consumer, pastda DLX/AE → DLQ; xat belgisi haqiqiy yo'l bo'ylab yuradi;
  - jarayon qadamlari (`Jarayon.vue`), metrikalar (`Metrikalar.vue`), Python (pika) kodi — VM terminalida ishga
    tushiriladi (`Kod.vue`), batafsil panel (`Boshqaruv.vue`: TTL, DLX, quorum, stream, policy), hodisalar
    (`Jurnal.vue`), terminal, mashqlar (`mashqlar.js` — tekshiruv brokerning haqiqiy holati va hodisalariga qarab).

## Yig'ish va tekshirish

```sh
sh rabbitmq-trenajor/scripts/erlang-yigish.sh      # Docker kerak (linux/386) -> build/otp-28.5.0.8-i386.tar.gz
sh rabbitmq-trenajor/scripts/rabbitmq-arxiv.sh     # gpg kerak -> build/rabbitmq-4.4.0-opt.tar.gz
TRENAJOR_PROFIL=rabbitmq sh linux-trenajor/scripts/yigish.sh   # -> build/web/{fs/, holat.zst}
ln -sfn ../rabbitmq-trenajor/build/web public/rabbitmq-trenajor  # lokal dev uchun (CI nusxalaydi)
node rabbitmq-trenajor/test/kanal.mjs ssenariy.json            # kanal orqali buyruqlar (Node'da, brauzersiz)
node rabbitmq-trenajor/test/yuklash.mjs rabbitmq-trenajor/build/fs 'systemctl status rabbitmq-server'  # sovuq yuklash
URL=http://localhost:5182/rabbitmq/trenajor node rabbitmq-trenajor/test/brauzer.mjs                     # skrinshot
```

Bu kompyuterda Docker yo'q bo'lsa, `erlang-yigish.sh` ni sinov VPS'ida ishlatib, arxivni `build/` ga ko'chiring.
Bir vaqtda ikkita yig'ish ishlatmang — `build/` buziladi (VM yuklanishda osilib qoladi).
