# 34 — Production tekshiruv ro'yxati

[Mundarija](README.md)

## Tushuncha

RQ (Deployment Guidelines / Production Checklist): ishlab chiqish muhitida standart sozlamalar qulay. Production'da esa ularni tekshirish va o'zgartirish kerak. Bu bob oldingi boblarni bitta ro'yxatga jamlaydi.

### Ro'yxat (RQ)

| # | Soha | Talab (RQ) | Bob |
| --- | --- | --- | --- |
| 1 | **Apparat** | Har tugunga kamida **4 CPU yadro, 4 GiB RAM**. Boshqa ma'lumot xizmatlari yoki diskni, tarmoqni ko'p ishlatadigan dasturlar bilan bir serverda emas. RabbitMQ **1 yadroli** muhitga mo'ljallanmagan | — |
| 2 | **Saqlash** | Doimiy (durable) disk; joy zaxirasi bilan; mahalliy SSD/NVMe afzal. Ma'lumotlar katalogini tugunlar **hech qachon** baham ko'rmaydi; taqsimlangan fayl tizimi tavsiya etilmaydi | 29 |
| 3 | **Navbatlar** | Durable yoki exclusive navbatlar. Non-durable, non-exclusive navbatlar 4.3 dan o'chirilgan | 11 |
| 4 | **Vhost'lar** | Bitta tizim — `/` yetarli. Ko'p ijarachi — har biriga alohida vhost | 25 |
| 5 | **Foydalanuvchilar** | `guest` ni **o'chirish**. Har ilovaga alohida foydalanuvchi va generatsiya qilingan parol; aniq ruxsatlar | 26 |
| 6 | **Anonim kirish** | O'chirish: `ANONYMOUS` mexanizmisiz `auth_mechanisms`, `anonymous_login_user = none` | 26 |
| 7 | **Monitoring** | Infratuzilma + RabbitMQ + ilova metrikalari, loglarni yig'ish | 27, 31 |
| 8 | **Xotira** | `vm_memory_high_watermark.relative` — **0.4–0.7**. Doim kamida 256 MiB bo'sh; OS'ga kamida 30% | 30 |
| 9 | **Disk** | 50MB faqat ishlab chiqish uchun. Production'da `disk_free_limit` ≈ xotira chegarasi | 30 |
| 10 | **Fayl deskriptorlari** | Kamida **50K**. Formula: (95-persentil ulanishlar × 2) + navbatlar soni; 500K gacha ham normal | — |
| 11 | **Sozlanadigan chegaralar** | Vhost, foydalanuvchi, ulanish, kanal, tugun va navbat darajasida "to'siqlar" | 25, 14 |
| 12 | **Erlang cookie** | Faqat RabbitMQ va CLI foydalanuvchisi o'qiy oladi; xavfsiz generatsiya qilingan | 32 |
| 13 | **Firewall** | Klient portlari — ilovalarga. Tugunlararo va CLI portlari — faqat RabbitMQ va CLI hostlariga | 32 |
| 14 | **TLS** | Iloji bo'lsa — kamida shifrlash, peer verification ham tavsiya etiladi | 28 |
| 15 | **Diskdagi shifrlash** | RabbitMQ diskka yozganini shifrlamaydi. Disk yoki tom (volume) shifrlash, yoki ilova darajasida | — |
| 16 | **Tarmoq** | Minimal tezlik ≈ `xabar/s × xabar hajmi × 1.1 × 8` bit/s | — |
| 17 | **Klaster** | Toq son: 3, 5, 7. Navbat replikalari — tugunlarning yarmidan ko'pi, lekin hammasi emas. Tugunlarda vaqt sinxron (NTP) | 32 |
| 18 | **Ilovalar** | Uzoq yashaydigan ulanishlar, aylanish (churn) yo'q, uzilishdan avtomatik tiklanish, kanallar sizib chiqmasin, polling o'rniga obuna | 18, 22 |

Kuzatildi: RQ'ning ushbu sahifasidagi klaster bo'limida hamon "`pause_minority` strategiyasini tanlang" deyilgan. Holbuki "Network Partitions" sahifasi bo'yicha 4.3.0 dan bo'linishni boshqarish strategiyalari olib tashlangan (32-bob). Hujjatning o'zida nomuvofiqlik bor.

### Sozlanadigan chegaralar (RQ: Configurable Limits)

| Daraja | Misollar |
| --- | --- |
| Vhost | `max-connections`, `max-queues` |
| Foydalanuvchi | `max-connections`, `max-channels` (`set_user_limits`) |
| Ulanish | `max_channels_per_connection`, `handshake_timeout`, `heartbeat` |
| Kanal | `consumer_max_per_channel` |
| Klaster | `vhost_max`, `cluster_queue_limit`, `cluster_exchange_limit` |
| Tugun | `consumer_timeout` (30 daqiqa), `max_connections`, `max_message_size` (16 MiB) |
| Navbat | Policy: uzunlik, TTL |

## Ko'rib chiqamiz

VPS'ni ro'yxat bo'yicha tekshiramiz (RabbitMQ 4.4.0).

### Tekshiruv

```text vps
$ nproc; free -m | awk '/Mem:/ {print "RAM:", $2, "MB"}'
1
RAM: 1793 MB
$ rabbitmqctl -q list_users
user	tags
guest	[administrator]
$ rabbitmq-diagnostics -q environment | grep -E '\{auth_mechanisms|\{anonymous_login_user|\{anonymous_login_pass' | sed 's/^ *//'
[{anonymous_login_pass,<<"guest">>},
{anonymous_login_user,<<"guest">>},
{auth_mechanisms,['PLAIN','AMQPLAIN','ANONYMOUS']},
$ rabbitmq-diagnostics -q status | grep -E '^Memory high watermark setting|^Free bytes|^Low free disk space watermark'
Memory high watermark setting: 0.6 of available memory, computed to: 1.1284 gb
Low free disk space watermark: 0.05 gb
$ cat /proc/$(pgrep -u rabbitmq beam.smp | head -1)/limits | grep 'open files'; rabbitmq-diagnostics -q list_deprecated_features --used --formatter json
Max open files            32768                32768                files     
[]
$ ls -l /var/lib/rabbitmq/.erlang.cookie | awk '{print $1, $3, $4, $NF}'
-r-------- rabbitmq rabbitmq /var/lib/rabbitmq/.erlang.cookie
$ rabbitmq-diagnostics -q listeners | awk -F, '{print $1, $2, $3}'
Interface: [::]  port: 15672  protocol: http
Interface: [::]  port: 5552  protocol: stream
Interface: [::]  port: 25672  protocol: clustering
Interface: [::]  port: 5672  protocol: amqp
Interface: [::]  port: 5671  protocol: amqp/ssl
Interface: [::]  port: 15692  protocol: http/prometheus
$ ufw status | grep -E 'Status|5671|5672|15672|15692|25672|4369|5552' ; echo "---"; ufw status | grep -c ALLOW
Status: active
---
8
$ timedatectl show -p NTPSynchronized -p NTP
NTP=yes
NTPSynchronized=yes
```

| # | Natija | Holat |
| --- | --- | --- |
| 1 | 1 CPU, 1.8 GB RAM | **Yo'q** — sinov serveri; production uchun kamida 4 yadro va 4 GiB |
| 5 | Faqat `guest` | **Yo'q** — qo'llanma misollari `guest` bilan (faqat loopback). Production'da o'chiriladi |
| 6 | `ANONYMOUS` yoqilgan, anonim foydalanuvchi — `guest` | **Yo'q** — 4.4.0 standarti |
| 8 | 0.6 | Ha |
| 9 | 0.05 GB (50MB) | **Yo'q** |
| 10 | 32768 | **Yo'q** — 50K dan kam |
| 12 | `-r--------`, `rabbitmq` | Ha |
| 13 | Firewall faol, RabbitMQ portlari uchun ruxsat qoidasi yo'q — tashqaridan yopiq | Ha |
| 14 | 5671 (28-bob) | Ha |
| 17 | NTP sinxron | Ha |
| — | Ishlatilayotgan eskirgan imkoniyatlar | Yo'q (`[]`) |

### Tuzatish

Sozlamalar (6, 9) va systemd orqali fayl limiti (10):

```text vps
$ cp /etc/rabbitmq/rabbitmq.conf /root/rabbitmq.conf.zaxira; cat /root/prod.conf >> /etc/rabbitmq/rabbitmq.conf; rm /root/prod.conf; tail -5 /etc/rabbitmq/rabbitmq.conf
# Production tekshiruv ro'yxati (RQ: Production Checklist)
disk_free_limit.absolute = 2GB
auth_mechanisms.1 = PLAIN
auth_mechanisms.2 = AMQPLAIN
anonymous_login_user = none
$ install -d /etc/systemd/system/rabbitmq-server.service.d && install -m 644 /root/limits.conf /etc/systemd/system/rabbitmq-server.service.d/limits.conf && rm /root/limits.conf && cat /etc/systemd/system/rabbitmq-server.service.d/limits.conf
[Service]
LimitNOFILE=64000
$ systemctl daemon-reload; systemctl restart rabbitmq-server; systemctl is-active rabbitmq-server; rm /root/rabbitmq.conf.zaxira
active
$ cat /proc/$(pgrep -u rabbitmq beam.smp | head -1)/limits | grep 'open files'; rabbitmq-diagnostics -q status | grep -E '^Low free disk space watermark'
Max open files            64000                64000                files     
Low free disk space watermark: 2.0 gb
$ rabbitmq-diagnostics -q environment | grep -E '\{auth_mechanisms|\{anonymous_login_user' | sed 's/^ *//'
{anonymous_login_user,none},
{auth_mechanisms,['PLAIN','AMQPLAIN']},
$ cd /root/rabbit-ilova && node -e "require('amqplib').connect('amqp://localhost').then(c=>{console.log('guest (PLAIN) ulanish OK');return c.close()})"
guest (PLAIN) ulanish OK
```

- Fayl deskriptorlari — 64000 (RQ: Debian, `/etc/systemd/system/rabbitmq-server.service.d/limits.conf`).
- Disk chegarasi — 2 GB (RAM ≈ 1.8 GB).
- Anonim kirish o'chirildi. `guest` login-parol (PLAIN) bilan ishlashda davom etdi — qo'llanmadagi misollar buzilmadi.

### Foydalanuvchi chegarasi

```text vps
$ rabbitmqctl -q set_user_limits guest '{"max-connections": 2}'; rabbitmqctl -q list_user_limits --user guest; cd /root/rabbit-ilova && node -e "const a=require('amqplib');(async()=>{const c=[];for(let i=1;i<=3;i++){try{c.push(await a.connect('amqp://localhost'));console.log(i+'-ulanish: OK')}catch(e){console.log(i+'-ulanish:', e.message.slice(0,110))}}for(const x of c)await x.close()})()"
{"max-connections":2}
1-ulanish: OK
2-ulanish: OK
3-ulanish: Expected ConnectionOpenOk; got <ConnectionClose channel:0>
$ rabbitmqctl -q clear_user_limits guest max-connections; rabbitmqctl -q list_user_limits --user guest; echo "(chegara olindi)"
{}
(chegara olindi)
```

`max-connections: 2` bilan uchinchi ulanish rad etildi. `amqplib` sababni aytmadi (25-bobdagi kabi). Chegara olib tashlandi.

### Yakuniy holat

```text vps
$ rabbitmq-diagnostics -q check_running && rabbitmq-diagnostics -q check_alarms && rabbitmq-diagnostics -q check_port_connectivity --address 127.0.0.1 | tail -1
RabbitMQ on node rabbit@lab is fully booted and running
Node rabbit@lab reported no alarms, local or clusterwide
Successfully connected to ports 5552, 5671, 5672, 15672, 15692, 25672 on node rabbit@lab (using 127.0.0.1 for target IP address)
```

Kuzatildi: `check_port_connectivity` 64000 limit va yangi sozlamalar bilan barcha 6 portni tasdiqladi. 1 va 5-bandlar ataylab o'zgartirilmadi: VPS sinov serveri, qo'llanma misollari esa `guest` ga tayanadi.

## Variantlar

| Muhit | Minimal ro'yxat |
| --- | --- |
| Ishlab chiqish | Standart sozlamalar; `guest` (localhost) |
| Bitta tizim, production | 1–10, 12–14, 18 |
| Ko'p ijarachi yoki xizmat sifatida | + vhost va foydalanuvchi chegaralari (11), har ijarachiga vhost |
| Yuqori ishonchlilik | + 3/5 tugunli klaster, quorum navbatlar, NTP (17) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Standart 50MB disk chegarasi | Disk to'lsa — nosozlik va ma'lumot yo'qolishi (RQ) | ≈ xotira chegarasi |
| `guest` ni tashqi ulanishga ochish | Hammaga ma'lum parol (RQ) | Alohida foydalanuvchi |
| Bitta foydalanuvchi barcha ilovalarga | Ulanishlarni kuzatish va parolni almashtirish qiyin (RQ) | Har ilovaga alohida |
| 1 yadroli serverda production | RabbitMQ bunga mo'ljallanmagan (RQ) | Kamida 4 yadro |
| Tugunlararo portlarni ochiq qoldirish | Faqat RabbitMQ va CLI hostlari (RQ) | Firewall |
| RabbitMQ diskni shifrlaydi deb o'ylash | Shifrlamaydi (RQ) | Disk yoki ilova darajasida |
| Fayl limitini standartda qoldirish | Ko'p ulanishda yetmaydi (RQ) | ≥ 50K |

## Amaliyot

1. RQ bo'yicha production tugun uchun minimal apparat qancha?
2. Production'da disk chegarasi qanday tanlanadi?
3. Nega har ilovaga alohida foydalanuvchi kerak?
4. Fayl deskriptorlari limiti qanday hisoblanadi va Debian'da qayerda o'rnatiladi?
5. Sinovda qaysi bandlar talabga javob bermadi va qaysilari tuzatildi?

<details>
<summary>Javoblar</summary>

1. 4 CPU yadro, 4 GiB RAM.
2. Taxminan xotira chegarasiga teng.
3. Ulanishlarni ilovaga bog'lash, aniq ruxsatlar, parolni almashtirish oson.
4. (95-persentil ulanishlar × 2) + navbatlar; `/etc/systemd/system/rabbitmq-server.service.d/limits.conf` da `LimitNOFILE`.
5. Apparat, `guest`, anonim kirish, disk chegarasi, fayl limiti; anonim kirish, disk va fayl limiti tuzatildi.

</details>

## Rasmiy hujjat

- [RQ: Deployment Guidelines (Production Checklist)](https://www.rabbitmq.com/docs/production-checklist)
- [RQ: Configurable Limits](https://www.rabbitmq.com/docs/limits)
- [RQ: Installing on Debian and Ubuntu](https://www.rabbitmq.com/docs/install-debian) — Kernel Limits
