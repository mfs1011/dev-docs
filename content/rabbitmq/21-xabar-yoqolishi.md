# 21 — Xabar qayerda yo'qolishi mumkin

[Mundarija](README.md)

## Tushuncha

RQ (Reliability Guide): ma'lumot xavfsizligi — **uch tomonning** umumiy mas'uliyati: RabbitMQ tugunlari, publisher'lar va consumer'lar. Bu bob oldingi boblarni bitta xaritaga jamlaydi: xabar yo'lining har bo'g'inida nima yo'qolishi mumkin va uni nima himoya qiladi.

### Nima ishdan chiqishi mumkin (RQ)

- Eng ko'p — **tarmoq**: ulanish uziladi, tiqilib qoladi; firewall'lar "jim" ulanishlarni uzadi; uzilishni aniqlash vaqt oladi.
- Server va klient ilovalarining apparati yoki dasturi istalgan paytda qulashi mumkin.
- Mantiqiy xatolar kanal yoki ulanish xatolariga olib keladi — klient yangi kanal yoki ulanish ochishi kerak.
- Nozikroq: kechikib javob berish, unumdorlik pasayishi, resursni tugatadigan ilovalar — monitoring bilan aniqlanadi (31-bob).

### Xabar yo'li xaritasi

```text
publisher ──(1)──▶ exchange ──(2)──▶ navbat ──(3)──▶ disk/replikalar ──(4)──▶ consumer ──(5)──▶ ish
```

| # | Qayerda | Nima yo'qotadi | Himoya | Bob |
| --- | --- | --- | --- | --- |
| 1 | Publisher → broker | Ulanish uzildi, xabar socket'da yoki yo'lda qoldi | **Publisher confirms**; tasdiqlanmaganini qayta yuborish | 20 |
| 2 | Exchange | Hech qaysi navbatga mos binding yo'q — jimgina tashlanadi | `mandatory` + `basic.return` yoki alternate exchange | 6, 10, 20 |
| 3 | Navbat | Uzunlik chegarasi (`drop-head`), TTL, broker qayta ishga tushishi | `reject-publish`, DLX; **durable** navbat + **persistent** xabar | 11, 13–15 |
| 4 | Tugun/disk | Tugun yoki disk ishdan chiqdi | **Quorum** navbat yoki stream, kamida 3 tugun | 12, 32 |
| 5 | Broker → consumer | Consumer qulab tushdi, xabar ishlanmagan | **Qo'lda tasdiq**, ishdan **keyin** `ack` | 5, 18 |
| — | Zaharli xabar | Cheksiz qayta navbat | `delivery-limit` + DLX | 12, 15 |

RQ: tasdiqlar ikki tomonda ham bo'lsa — **kamida bir marta** (at-least-once) yetkazish kafolatlanadi; tasdiqlarsiz — faqat **ko'pi bilan bir marta** (at-most-once).

### Takrorlanish muqarrar (RQ)

- **Publisher**: confirm'i kelmagan xabarni qayta yuboradi — lekin broker tasdiq yuborgan bo'lishi va u yo'lda yo'qolgan bo'lishi mumkin. Natijada **dublikat** xabar.
- **Consumer**: tarmoq yoki tugun uzilishida xabar qayta yetkazilishi mumkin. RQ: dublikatni aniq izlashdan ko'ra consumer'ni **idempotent** qilish tavsiya etiladi. `redelivered` belgisi — "ehtimol ko'rgansiz" degan ishora. Belgi yo'q bo'lsa — xabar avval hech kimga berilmagani **kafolatlangan**.

### Heartbeat (RQ: Detecting Dead TCP Connections with Heartbeats)

Ba'zi tarmoq nosozliklarida uzilgan TCP ulanishni operatsion tizim ancha kech aniqlaydi — Linux'da standart sozlamalar bilan taxminan **11 daqiqa**. AMQP 0-9-1 **heartbeat** — ilova darajasida uzilishni tez aniqlash. U "bo'sh" ulanishlarni uzadigan tarmoq uskunalaridan ham himoya qiladi.

| Qoida (RQ) | Nima |
| --- | --- |
| Qiymat | Ulanishda server va klient **kelishadi**; soniyada; server taklifi — **60** |
| Kelishuv (RabbitMQ jamoasi klientlari) | Biri 0 bo'lsa — kattasi; aks holda — kichigi |
| O'chirish (`0`) | Ikkala tomon 0 desagina; **qat'iyan tavsiya etilmaydi** (barcha hostlarda TCP keepalive bo'lmasa) |
| Tavsiya | **5–20 soniya** — ko'p muhitlar uchun eng yaxshi; juda kichik — soxta uzilishlar |

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Heartbeat har ulanishda alohida kelishiladi — ikki klient standart sozlamalar bilan va o'zimiz bergan qiymat bilan ulanadi:

```js
// Heartbeat: standart va 10 s bilan ulanish, 10 s ochiq turadi
const amqp = require('amqplib');
(async () => {
  const a = await amqp.connect('amqp://localhost', { clientProperties: { connection_name: 'node-standart' } });
  const b = await amqp.connect('amqp://localhost?heartbeat=10', { clientProperties: { connection_name: 'node-hb10' } });
  await new Promise(r => setTimeout(r, 10000)); await a.close(); await b.close();
})();
```

```php
<?php
// php-amqplib: heartbeat — konstruktorning 11-argumenti (soniyada)
require __DIR__ . '/vendor/autoload.php';
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Wire\AMQPTable;
$a = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$b = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest', '/', false, 'AMQPLAIN', null, 'en_US', 3.0, 3.0, null, false, 30);
sleep(10); $a->close(); $b->close();
```

Ulanishlar ochiq turganda — klient nomi va kelishilgan `timeout` (`rabbitmqctl list_connections`):

```python
# rabbitmqctl list_connections client_properties timeout chiqishidan: klient, nom va heartbeat timeout
import sys, re
for l in sys.stdin.read().splitlines()[1:]:
    p = re.search(r'\{"product","([^"]+)"\}', l)
    n = re.search(r'\{"connection_name","([^"]+)"\}', l)
    print(f'{p.group(1) if p else "?":8} {n.group(1) if n else "-":14} timeout={l.rsplit(None, 1)[-1]}')
```

```text vps
$ cd /root/rabbit-ilova; (node hb.js &); (php hb.php &); sleep 3; rabbitmqctl -q list_connections client_properties timeout | python3 ulanishlar.py | sort
AMQPLib  -              timeout=0
AMQPLib  -              timeout=30
amqplib  node-hb10      timeout=10
amqplib  node-standart  timeout=60
$ sleep 9; rabbitmqctl -q list_connections name | grep -vc "^name"
0
```

| Klient | Sozlama | Kelishilgan heartbeat |
| --- | --- | --- |
| `amqplib` (Node.js) | standart | **60** s — server taklifi |
| `amqplib` | `?heartbeat=10` | 10 s |
| `php-amqplib` | standart | **0** — heartbeat **o'chiq** |
| `php-amqplib` | konstruktorda `heartbeat = 30` | 30 s |

Kuzatildi: `php-amqplib` standart holatda heartbeat'ni o'chirib ulanadi — manbada konstruktor parametri `$heartbeat = 0`. "Biri 0 bo'lsa — kattasi" qoidasini RQ faqat RabbitMQ jamoasi klientlari (Java, .NET, Erlang) uchun yozadi; `php-amqplib` da natija — 0. PHP ilovada uzilgan ulanish OS darajasida (~11 daqiqa) aniqlanadi — heartbeat'ni aniq berish kerak (RQ tavsiyasi: 5–20 s).

## Variantlar

| Kafolat | Kerak |
| --- | --- |
| Ko'pi bilan bir marta (yo'qolishi mumkin) | Hech narsa — avtomatik tasdiq, confirms'siz |
| Kamida bir marta (takrorlanishi mumkin) | Publisher confirms + durable/quorum + persistent + qo'lda tasdiq |
| "Aynan bir marta" ta'siri | Kamida bir marta + idempotent consumer |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat bitta bo'g'inni himoyalash | Zanjir eng zaif bo'g'inida uziladi | Xaritadagi barcha 5 bo'g'in |
| TCP bor — yetkazish kafolatlangan deb o'ylash | TCP faqat tarmoq qatlamida; tasdiqlar ilova ishlaganini bildiradi (RQ) | Confirms va acks |
| Dublikatlarga tayyor emas | At-least-once'da muqarrar (RQ) | Idempotent consumer |
| PHP'da heartbeat'ni standartda qoldirish | 0 — o'chiq (sinovda) | `heartbeat` parametri 5–20 s |
| Juda kichik heartbeat (1–2 s) | Soxta uzilishlar (RQ) | 5–20 s |

## Amaliyot

1. Xabar yo'lining qaysi besh joyida yo'qolishi mumkin?
2. Kamida bir marta yetkazish uchun nimalar kerak?
3. Nega dublikatlar muqarrar va ularga qanday tayyorlanish kerak?
4. Heartbeat nima uchun kerak, uning standart qiymati qancha?
5. Sinovda `php-amqplib` standart heartbeat bilan qanday kelishdi?

<details>
<summary>Javoblar</summary>

1. Publisher→broker, exchange (yo'naltirish), navbat (chegara, TTL, qayta ishga tushish), tugun/disk, broker→consumer.
2. Publisher confirms, durable/quorum navbat, persistent xabar, qo'lda consumer tasdig'i.
3. Tasdiq yo'lda yo'qolishi yoki qayta yetkazish tufayli; idempotent consumer.
4. Uzilgan TCP ulanishni tez aniqlash va "bo'sh" ulanishlar uzilishidan himoya; server taklifi — 60 s.
5. 0 — heartbeat o'chiq.

</details>

## Rasmiy hujjat

- [RQ: Reliability Guide](https://www.rabbitmq.com/docs/reliability)
- [RQ: Detecting Dead TCP Connections with Heartbeats and TCP Keepalives](https://www.rabbitmq.com/docs/heartbeats)
