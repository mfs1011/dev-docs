# 11 — Navbat xususiyatlari

[Mundarija](README.md)

## Tushuncha

RQ (Queues): navbat — **FIFO** (birinchi kirgan — birinchi chiqadi) tartibidagi xabarlar to'plami. Uning xatti-harakatini **xususiyatlari** belgilaydi.

### Nom

- 255 baytgacha UTF-8.
- `amq.` bilan boshlanadigan nomlar broker uchun **band**: bunday navbatni e'lon qilish — kanal darajasidagi `403 ACCESS_REFUSED`.
- **Server nomlaydigan** navbat — nom o'rniga bo'sh satr (`''`), broker `amq.gen-…` beradi (7-bob). Bitta ilova nusxasiga xos vaqtinchalik holat uchun.

### Xususiyatlar (RQ)

| Xususiyat | Nima |
| --- | --- |
| **Durable** | Broker qayta ishga tushganda saqlanadi (metama'lumoti diskda) |
| **Exclusive** | Faqat uni e'lon qilgan **ulanish** ishlata oladi; ulanish yopilganda navbat o'chadi |
| **Auto-delete** | Kamida bitta consumer bo'lgan navbat **oxirgi** consumer ketganda o'chadi |
| **Argumentlar** (`x-…`) | Navbat turi (`x-queue-type`), TTL (13-bob), uzunlik chegarasi (14-bob), ustuvorlik (16-bob) va boshqalar |

RQ: hamma birikmalar ma'noli emas. Masalan, exclusive navbat deyarli doim **server nomlagan** bo'lishi kerak. Doimiy nomli exclusive navbatda klient uzilib darhol qayta ulansa, navbatni o'chirayotgan broker va uni qayta e'lon qilayotgan klient o'rtasida poyga holati yuzaga keladi. Exclusive navbat doim **classic** turida bo'ladi: exclusive quorum navbat va stream ma'nosiz.

### E'lon tengligi

RQ: navbat ishlatishdan oldin e'lon qilinadi. U yo'q bo'lsa — yaratiladi; bor va xususiyatlari bir xil bo'lsa — hech narsa o'zgarmaydi. Xususiyatlari **farq qilsa** — kanal darajasidagi `406 PRECONDITION_FAILED`.

### Argumentlar va policy

RQ: argumentlarning bir qismi e'londa beriladi va **o'zgarmaydi** (`x-queue-type`, `x-max-priority`). Boshqalarini e'londan keyin **policy** bilan o'zgartirish mumkin — RQ tavsiyasi: policy bilan belgilash mumkin bo'lgan kalitlar uchun avval policy'ni ko'rib chiqing (17-bob).

### Durable va transient

RQ:

- Durable navbatlar tugun ishga tushganda tiklanadi, ulardagi **persistent** xabarlar bilan birga. **Transient** xabarlar esa tiklashda — durable navbatda bo'lsa ham — **tashlab yuboriladi**.
- Transient navbatlar tugun ishga tushganda o'chiriladi.
- Ko'p hollarda navbatning durable yoki yo'qligi o'tkazuvchanlik va kechikishga **ta'sir qilmaydi** (navbatlar sekundiga yuzlab marta yaratilib-o'chiriladigan holatlardan tashqari).
- Quorum navbatlar — faqat durable.
- **RabbitMQ 4.3.0 dan** durable bo'lmagan va exclusive bo'lmagan classic navbatlar **eskirgan** (deprecated) va standart holatda e'lon qilib bo'lmaydi. O'rniga: durable navbat, durable bo'lmagan exclusive navbat yoki TTL'li durable navbat.

### Tartib

RQ: bitta kanaldan yuborilgan xabarlar har navbatga yuborilish tartibida tushadi; bir nechta kanal yoki ulanishdan esa aralashib tushadi. Tartib ustuvorliklar (16-bob) yoki qayta yetkazish (bir nechta consumer, `nack` bilan qaytarish) tufayli o'zgarishi mumkin. Tartibni saqlash: stream yoki bitta faol consumer (single active consumer).

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, `amqplib` 2.3.1). Har sinov alohida kanalda — kanal darajasidagi xato faqat shu kanalni yopadi:

```js
// Navbat xususiyatlari: nomlar, e'lon tengligi, durable/exclusive/auto-delete
const amqp = require('amqplib');
const sinov = async (conn, nom, f) => {
  const ch = await conn.createChannel();
  ch.on('error', () => {});
  try { console.log(`${nom}: ${await f(ch)}`); await ch.close(); }
  catch (e) { console.log(`${nom}: ${e.message.replace(/ with message .*/s, '').slice(0, 150)}`); }
};

async function main() {
  const a = await amqp.connect('amqp://localhost');
  const b = await amqp.connect('amqp://localhost');

  await sinov(a, "1) 'amq.' bilan nom", ch => ch.assertQueue('amq.mening', { durable: true }).then(r => r.queue));
  await sinov(a, '2) quorum navbat', ch => ch.assertQueue('xus', { durable: true, arguments: { 'x-queue-type': 'quorum' } }).then(r => r.queue));
  await sinov(a, '2) xuddi shunday qayta', ch => ch.assertQueue('xus', { durable: true, arguments: { 'x-queue-type': 'quorum' } }).then(r => 'OK'));
  await sinov(a, '2) classic deb qayta', ch => ch.assertQueue('xus', { durable: true, arguments: { 'x-queue-type': 'classic' } }).then(r => 'OK'));
  // 3) bu xato kanalni emas, butun ulanishni yopadi — alohida ulanishda
  const c3 = await amqp.connect('amqp://localhost');
  c3.on('error', e => console.log(`3) ulanish yopildi: ${e.message.split('\n')[0].slice(0, 120)}`));
  await sinov(c3, '3) durable emas, exclusive emas', ch => ch.assertQueue('vaqtincha', { durable: false, exclusive: false }).then(r => r.queue));
  await new Promise(r => setTimeout(r, 200));
  await sinov(a, '3) durable emas, exclusive', ch => ch.assertQueue('', { durable: false, exclusive: true }).then(r => r.queue.replace(/-.+$/, '-…')));
  await sinov(a, "4) a: exclusive 'exc'", ch => ch.assertQueue('exc', { exclusive: true }).then(r => r.queue));
  await sinov(b, "4) b: 'exc' dan o'qish", ch => ch.consume('exc', () => {}).then(() => 'OK'));

  // 5) auto-delete: oxirgi consumer ketganda o'chadi
  const ch = await a.createChannel();
  await ch.assertQueue('avto', { durable: true, autoDelete: true, arguments: { 'x-queue-type': 'classic' } });
  const { consumerTag } = await ch.consume('avto', () => {});
  console.log('5) consumer bor, navbat:', (await ch.checkQueue('avto')).queue);
  await ch.cancel(consumerTag);
  await new Promise(r => setTimeout(r, 300));
  await sinov(a, "5) consumer ketdi, checkQueue('avto')", c => c.checkQueue('avto').then(r => r.queue));

  await ch.deleteQueue('xus');
  await a.close(); await b.close();
}
main();
```

```text vps
$ rabbitmqadmin queues delete --name xus; cd /root/rabbit-ilova && node xususiyat.js
1) 'amq.' bilan nom: Operation failed: QueueDeclare; 403 (ACCESS-REFUSED)
2) quorum navbat: xus
2) xuddi shunday qayta: OK
2) classic deb qayta: Operation failed: QueueDeclare; 406 (PRECONDITION-FAILED)
3) ulanish yopildi: Connection closed: 541 (INTERNAL-ERROR) with message "INTERNAL_ERROR - Feature `transient_nonexcl_queues` is deprecated.
3) durable emas, exclusive emas: Channel ended, no reply will be forthcoming
3) durable emas, exclusive: amq.gen-…
4) a: exclusive 'exc': exc
4) b: 'exc' dan o'qish: Operation failed: BasicConsume; 405 (RESOURCE-LOCKED)
5) consumer bor, navbat: avto
5) consumer ketdi, checkQueue('avto'): Operation failed: QueueDeclare; 404 (NOT-FOUND)
$ rabbitmqctl -q list_queues name | grep -cE '^(xus|exc|avto|vaqtincha)$'
0
```

| # | Natija | Ma'nosi (RQ) |
| --- | --- | --- |
| 1 | `403 ACCESS-REFUSED` | `amq.` nomlari band |
| 2 | Bir xil e'lon — OK; `classic` deb qayta — `406 PRECONDITION-FAILED` | E'lon tengligi |
| 3 | Durable emas + exclusive emas — **ulanish** `541 INTERNAL_ERROR` bilan yopildi: `transient_nonexcl_queues` eskirgan | 4.3.0 dan taqiqlangan; exclusive bo'lsa — mumkin |
| 4 | Boshqa ulanishdan exclusive navbatga — `405 RESOURCE-LOCKED` | Faqat e'lon qilgan ulanish |
| 5 | Consumer bekor qilingach `avto` — `404 NOT-FOUND` | Auto-delete |

Kuzatildi: 3-holatda xato faqat kanalni emas, **butun ulanishni** yopdi — dastlabki versiyada skript shu yerda to'xtab qolgan edi. Shuning uchun bu sinov alohida ulanishda. Oxirida sinov navbatlaridan hech biri qolmagan (0).

### Qayta ishga tushirish: persistent va transient

Durable classic navbatga bitta persistent va bitta transient xabar:

```js
// Durable classic navbatga persistent va transient xabar
const amqp = require('amqplib');
async function main() {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createConfirmChannel();
  await ch.assertQueue('saqla', { durable: true, arguments: { 'x-queue-type': 'classic' } });
  ch.sendToQueue('saqla', Buffer.from('persistent'), { persistent: true });
  ch.sendToQueue('saqla', Buffer.from('transient'), { persistent: false });
  await ch.waitForConfirms(); await c.close();
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node saqlanish.js && rabbitmqctl -q list_queues name durable messages | grep -E '^name|^saqla'
name	durable	messages
saqla	true	2
$ systemctl restart rabbitmq-server && rabbitmq-diagnostics -q check_running && rabbitmqctl -q list_queues name durable messages | grep -E '^name|^saqla'
RabbitMQ on node rabbit@lab is fully booted and running
name	durable	messages
saqla	true	1
$ cd /root/rabbit-ilova && node oqi.js saqla && rabbitmqadmin queues delete --name saqla
  persistent
```

Broker qayta ishga tushishidan oldin — 2 ta xabar, keyin — **1 ta**. Qolgani — `persistent`; transient xabar tiklashda tashlab yuborildi (RQ).

## Variantlar

| Kerak | Navbat |
| --- | --- |
| Muhim ishlar, ishonchlilik | Durable quorum (12-bob) + persistent xabarlar |
| Bitta klientga vaqtinchalik | Server nomlagan, exclusive |
| Klient uzilsa ham bir muddat kutsin | Durable + navbat TTL'i (13-bob) |
| Consumer ketgach keraksiz | Auto-delete |
| Qat'iy tartib | Stream yoki bitta faol consumer |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Durable emas, exclusive emas classic navbat | 4.3.0 dan taqiqlangan — ulanish yopiladi (sinovda) | Durable, exclusive yoki TTL'li durable |
| Doimiy nomli exclusive navbat | Qayta ulanishda poyga holati (RQ) | Server nomlagan |
| Navbat parametrlarini kodda o'zgartirish | `406 PRECONDITION_FAILED` (sinovda) | Policy yoki yangi navbat |
| Durable navbat, transient xabar | Qayta ishga tushganda xabar yo'qoladi (sinovda) | Persistent xabar |
| `amq.` bilan nom | `403` (sinovda) | Boshqa prefiks |
| Polling bilan o'qiladigan auto-delete navbat | Consumer bo'lmagani uchun hech qachon o'chmaydi (RQ) | TTL |

## Amaliyot

1. Exclusive va auto-delete navbat farqi?
2. Mavjud navbatni boshqa turda e'lon qilsangiz nima bo'ladi?
3. RabbitMQ 4.3.0 dan qaysi navbatlar standart holatda taqiqlangan?
4. Sinovda broker qayta ishga tushgandan keyin nechta xabar qoldi va nega?
5. Nega exclusive navbat server nomlagan bo'lishi kerak?

<details>
<summary>Javoblar</summary>

1. Exclusive — e'lon qilgan ulanishga bog'liq; auto-delete — oxirgi consumer ketganda o'chadi.
2. `406 PRECONDITION_FAILED`.
3. Durable bo'lmagan va exclusive bo'lmagan classic navbatlar.
4. Bitta — persistent; transient xabar tiklashda tashlab yuborildi.
5. Doimiy nomda qayta ulanishda o'chirish va qayta e'lon qilish orasida poyga holati bo'ladi.

</details>

## Rasmiy hujjat

- [RQ: Queues](https://www.rabbitmq.com/docs/queues)
- [RQ: Deprecated Features](https://www.rabbitmq.com/release-information/deprecated-features-list)
