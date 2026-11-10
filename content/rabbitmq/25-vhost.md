# 25 — Virtual host'lar

[Mundarija](README.md)

## Tushuncha

RQ (Virtual Hosts): RabbitMQ — **ko'p ijarachili** (multi-tenant) tizim. Ulanishlar, exchange'lar, navbatlar, binding'lar, foydalanuvchi ruxsatlari, policy'lar va boshqa narsalar **virtual host**'larga (vhost) tegishli — obyektlarning mantiqiy guruhlari. G'oya Apache'dagi virtual host'larga yoki nginx server bloklariga o'xshaydi. Farqi: RabbitMQ'da vhost konfiguratsiya faylida emas, `rabbitmqctl` yoki HTTP API bilan yaratiladi va o'chiriladi.

### Ajratish (RQ)

- **Mantiqiy** ajratish — maqsad; **jismoniy** resurslarni ajratish maqsad emas (lekin ba'zi resurslarni cheklash mumkin — pastda).
- Ruxsatlar vhost bo'yicha: foydalanuvchida "global" ruxsat yo'q, faqat bir yoki bir nechta vhost'da (foydalanuvchi teglari — istisno).
- Klient ulanishda vhost nomini beradi. Autentifikatsiyadan o'tsa va unga shu vhost'da ruxsat berilgan bo'lsa — ulanadi. Ulanish faqat shu vhost'dagi obyektlar bilan ishlaydi.
- Yangi vhost'da standart exchange'lar bor, lekin boshqa obyekt va **foydalanuvchi ruxsatlari yo'q** — har foydalanuvchiga ruxsat berish kerak.

### Metama'lumot (RQ)

Tavsif, teglar va **standart navbat turi** (DQT — default queue type: `quorum`, `stream` yoki `classic`). DQT — klient navbatni turi ko'rsatilmagan holda e'lon qilganda ishlatiladigan tur. U faqat **yangi** e'lonlarga ta'sir qiladi: mavjud navbat turi o'zgarmaydi.

### O'chirish va himoya (RQ)

- O'chirish vhost'dagi **barcha** obyektlarni (navbatlar, exchange'lar, binding'lar, policy'lar, ruxsatlar) butunlay o'chiradi.
- **O'chirishdan himoya**: himoyalangan vhost'ni himoya olib tashlanmaguncha o'chirib bo'lmaydi.

### Chegaralar (RQ)

`set_vhost_limits`: `max-connections` — bir vaqtdagi ulanishlar, `max-queues` — navbatlar soni.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Node.js skripti:

```js
// Virtual host: ulanish, DQT, ajratilganlik, max-queues chegarasi
const amqp = require('amqplib');
async function urin(nom, f) { try { console.log(`${nom}: ${await f()}`); } catch (e) { console.log(`${nom}: ${e.message.replace(/ with message .*/s, '').replace(/^.*?(\d{3} \()/, '$1').slice(0, 90)}`); } }
async function main() {
  const qadam = process.argv[2];
  if (qadam === 'ulan') { await urin((process.argv[3] || 'qa1') + ' ga ulanish', async () => { const c = await amqp.connect('amqp://localhost/' + (process.argv[3] || 'qa1')); await c.close(); return 'OK'; }); return; }
  const c = await amqp.connect('amqp://localhost/qa1'); c.on('error', () => {});
  let ch = await c.createChannel(); ch.on('error', () => {});
  await urin("qa1: 'ish' (turi ko'rsatilmagan)", () => ch.assertQueue('ish', { durable: true }).then(r => r.queue));
  const d = await amqp.connect('amqp://localhost/'); const dch = await d.createChannel();
  await urin("/: 'ish' (classic)", () => dch.assertQueue('ish', { durable: true, arguments: { 'x-queue-type': 'classic' } }).then(r => r.queue));
  await dch.deleteQueue('ish'); await d.close();
  await urin("qa1: 'ikkinchi' (max-queues 1)", () => ch.assertQueue('ikkinchi', { durable: true }).then(r => r.queue));
  await c.close().catch(() => {});
}
main();
```

### Yaratish va ruxsatsiz ulanish

```text vps
$ rabbitmqctl -q add_vhost qa1 --description "QA muhiti" --default-queue-type quorum --tags qa,sinov; rabbitmqctl -q list_vhosts name description default_queue_type tags
name	description	default_queue_type	tags
/	Default virtual host	classic	[]
qa1	QA muhiti	quorum	[qa, sinov]
$ rabbitmqctl -q add_vhost qa2; cd /root/rabbit-ilova && node vhost.js ulan qa2; sleep 1; grep -h "access to vhost 'qa2' refused" /var/log/rabbitmq/rabbit@lab.log | tail -1 | grep -oE "access to vhost 'qa2' refused for user 'guest'"
qa2 ga ulanish: Expected ConnectionOpenOk; got <ConnectionClose channel:0>
access to vhost 'qa2' refused for user 'guest'
```

- `qa1`: tavsif, teglar va standart navbat turi `quorum`. `/` — standart vhost, uning DQT'si `classic`.
- Ruxsat berilmagan vhost'ga `guest` ulana olmadi. Kuzatildi: `amqplib` sababni aytmaydi (`Expected ConnectionOpenOk; got <ConnectionClose channel:0>`), sabab broker jurnalida — `access to vhost 'qa2' refused for user 'guest'`.

### Ruxsat, chegara, DQT va ajratilganlik

```text vps
$ rabbitmqctl -q set_permissions -p qa1 guest ".*" ".*" ".*"; rabbitmqctl -q list_permissions -p qa1; rabbitmqctl -q set_vhost_limits -p qa1 '{"max-queues": 1}'; rabbitmqctl -q list_vhost_limits -p qa1
user	configure	write	read
guest	.*	.*	.*
{"max-queues":1}
$ cd /root/rabbit-ilova && node vhost.js
qa1: 'ish' (turi ko'rsatilmagan): ish
/: 'ish' (classic): ish
qa1: 'ikkinchi' (max-queues 1): 406 (PRECONDITION-FAILED)
$ rabbitmqctl -q list_queues -p qa1 name type; rabbitmqctl -q list_queues -p / name | grep -c '^ish$'
name	type
ish	quorum
0
```

- Ruxsat berildi (`configure`, `write`, `read` — hammasi `.*`, 26-bob) va `max-queues: 1` chegarasi qo'yildi.
- `qa1` da turi ko'rsatilmagan `ish` navbati — **quorum** bo'lib yaratildi (DQT).
- `/` da xuddi shu nomli `ish` (classic) ham muammosiz yaratildi — vhost'lar alohida.
- `qa1` dagi ikkinchi navbat — `406 PRECONDITION_FAILED`: `max-queues` chegarasi.

### O'chirishdan himoya

Kuzatildi: RQ'dagi buyruq nomi 4.4.0 da yo'q:

```text vps
$ rabbitmqctl -q enable_vhost_protection_from_deletion qa1; rabbitmqctl delete_vhost qa1 2>&1 | tail -2

Command 'enable_vhost_protection_from_deletion' not found. 
Did you mean 'enable_vhost_deletion_protection'? 

Deleting vhost "qa1" ...
```

Himoya yoqilmadi va `delete_vhost` vhost'ni o'chirib yubordi. To'g'ri nom — CLI taklif qilgani:

```text vps
$ rabbitmqctl -q enable_vhost_deletion_protection qa2; rabbitmqctl -q list_vhosts name protected_from_deletion 2>/dev/null | grep -E '^name|qa2'
name	protected_from_deletion
qa2	true
$ rabbitmqctl delete_vhost qa2 2>&1 | grep -v '^$' | tail -2
Error:
Cannot delete this virtual host: it is protected from deletion. To lift the protection, inspect and update its metadata
$ rabbitmqctl -q disable_vhost_deletion_protection qa2; rabbitmqctl delete_vhost qa2; rabbitmqctl -q list_vhosts name
Deleting vhost "qa2" ...
name
/
```

Himoyalangan vhost o'chmadi (`protected from deletion`); himoya olinganidan keyin o'chdi. Faqat `/` qoldi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Muhitlar (dev, qa) bitta brokerda | Har biriga vhost |
| Mijozlar (tenant) ajratilishi | Vhost + faqat o'z vhost'iga ruxsatli foydalanuvchi |
| Bitta mijoz brokerni band qilmasin | `max-connections`, `max-queues` |
| Barcha yangi navbatlar quorum bo'lsin | DQT `quorum` |
| Muhim vhost tasodifan o'chmasin | O'chirishdan himoya |
| Jismoniy ajratish (CPU, xotira) | Alohida klaster — vhost buni bermaydi (RQ) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Yangi vhost'ga ruxsat bermaslik | Foydalanuvchi ulana olmaydi (sinovda) | `set_permissions -p` |
| Vhost'ni jismoniy ajratish deb hisoblash | Faqat mantiqiy (RQ) | Kerak bo'lsa alohida klaster |
| DQT mavjud navbatlarni o'zgartiradi deb kutish | Faqat yangi e'lonlar (RQ) | Migratsiya |
| Hujjatdagi buyruq nomini tekshirmasdan skriptga yozish | 4.4.0 da boshqa nom (sinovda) | `rabbitmqctl help` |
| `delete_vhost` ni o'ylamasdan | Hamma narsa butunlay o'chadi (RQ) | Himoya, avval zaxira (29-bob) |

## Amaliyot

1. Virtual host nima va u nimani ajratadi?
2. Yangi vhost'ga foydalanuvchi nega darhol ulana olmaydi?
3. DQT nima va u mavjud navbatlarga ta'sir qiladimi?
4. Sinovda `qa1` dagi ikkinchi navbat nega yaratilmadi?
5. O'chirishdan himoyani qanday yoqasiz (4.4.0)?

<details>
<summary>Javoblar</summary>

1. Obyektlarning mantiqiy guruhi; navbatlar, exchange'lar, ruxsatlar, policy'larni ajratadi.
2. Yangi vhost'da ruxsatlar yo'q — `set_permissions` kerak.
3. Turi ko'rsatilmagan yangi navbatlar uchun standart tur; mavjudlarga ta'sir qilmaydi.
4. `max-queues: 1` chegarasi.
5. `rabbitmqctl enable_vhost_deletion_protection <vhost>`.

</details>

## Rasmiy hujjat

- [RQ: Virtual Hosts](https://www.rabbitmq.com/docs/vhosts)
- [RQ: Access Control](https://www.rabbitmq.com/docs/access-control) (26-bob)
