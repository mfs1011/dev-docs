# 12 — Quorum navbatlar

[Mundarija](README.md)

## Tushuncha

RabbitMQ'da navbatning ikki asosiy turi bor: **classic** va **quorum** (uchinchisi — stream, 23-bob).

### Quorum navbat (RQ: Quorum Queues)

**Raft** konsensus algoritmiga asoslangan, durable, **replikatsiyalanadigan** navbat. Replikatsiya va yuqori mavjudlik (high availability) kerak bo'lganda — **standart tanlov**. Ma'lumot xavfsizligi va tez lider saylash uchun loyihalangan. Classic navbatlarni ko'paytirish (mirroring) RabbitMQ 4.0 da olib tashlangan — replikatsiya uchun faqat quorum navbatlar va stream'lar qoladi.

**Quorum** — taqsimlangan tizimda **ko'pchilik** kelishuvi: `(N/2)+1` a'zo. Navbat a'zolari (lider va izdoshlar) ko'pchiligi navbat holati va mazmuni bo'yicha kelishadi.

RQ: qachon kerak — uzoq yashaydigan, yuqori mavjudlik talab qiladigan, ilova uchun muhim navbatlar: savdo tizimidagi buyurtmalar, saylovdagi ovozlar (xabar yo'qolishi jiddiy zarar). Kam foyda yoki foydasiz: birja kotirovkalari, tezkor xabarlar, RPC javob navbatlari. Ko'p obunachiga tarqatish va qayta o'qish kerak bo'lsa — stream. Publisher'lar **publisher confirms** ishlatishi kerak (20-bob).

### Qanday e'lon qilinadi (RQ)

`x-queue-type: quorum` — e'londa beriladi, policy bilan o'rnatib yoki o'zgartirib **bo'lmaydi**. Standart guruh hajmi — 3 a'zo, har bir klaster tuguniga bittadan (`x-quorum-initial-group-size`).

### Klaster hajmi va chidamlilik (RQ)

| Tugunlar | Nechta tugun ishdan chiqsa chidaydi |
| --- | --- |
| 1 | 0 |
| 2 | 0 |
| 3 | 1 |
| 5 | 2 |
| 7 | 3 |

3 tadan kam tugunli klaster quorum kafolatlaridan to'liq foydalanmaydi. 5 dan katta guruhda unumdorlik ancha pasayadi; 7 dan ko'p tugunda tavsiya etilmaydi.

### Classic va quorum (RQ: Feature Matrix)

| Imkoniyat | Classic | Quorum |
| --- | --- | --- |
| Durable bo'lmagan navbat | ha | yo'q |
| Replikatsiya | yo'q | ha |
| Exclusive | ha | yo'q |
| Xabar persistence'i | har xabar uchun | doim |
| Server nomlagan navbat | ha | yo'q |
| Zaharli xabarni ushlash | yo'q | ha |
| Consumer timeout, delayed retry | yo'q | ha |
| TTL, uzunlik chegarasi, DLX, ustuvorlik | ha | ha (ba'zi farqlar bilan) |

RQ (Classic Queues): classic — asl, **replikatsiyalanmaydigan** navbat turi; ma'lumot xavfsizligi ustuvor bo'lmagan hollar uchun. Vhost'da standart tur boshqacha belgilanmagan bo'lsa — standart tur.

### Zaharli xabar (poison message)

RQ: **zaharli xabar** — consumer'ni qayta-qayta navbatga qaytarishga majburlaydigan (masalan, consumer xatosi tufayli) va hech qachon to'liq ishlanmaydigan xabar. Quorum navbat muvaffaqiyatsiz yetkazishlarni sanaydi:

- qayta yetkazilgan xabarda — `x-delivery-count` header'i;
- RabbitMQ 4.3 dan chegara **`delivery-count`** bo'yicha (avval `acquired-count` edi). Qo'shimcha `x-acquired-count` — xabar consumer'ga necha marta berilgani;
- **RabbitMQ 4.0 dan** chegara standart **20**; `x-delivery-limit` bilan o'zgartiriladi (`-1` — chegarasiz, tavsiya etilmaydi);
- chegaradan oshgach xabar **tashlab yuboriladi** yoki DLX bo'lsa — dead letter'ga (15-bob). RQ: har quorum navbatda biror dead letter sozlamasi bo'lsin.

| Hodisa (AMQP 0-9-1) | `acquired-count` | `delivery-count` |
| --- | --- | --- |
| `basic.nack` | ✅ | ❌ |
| `basic.reject` | ✅ | ✅ |
| Klient qulashi / ulanish uzilishi | ✅ | ✅ |
| Consumer timeout | ✅ | ❌ |

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0, bitta tugun). Ikki quorum navbat, `x-delivery-limit: 3`. Bittasida consumer xabarni `reject` bilan, ikkinchisida `nack` bilan qayta-qayta qaytaradi (6-yetkazishda tasdiqlaydi — cheksiz aylanmasligi uchun):

```js
// Quorum navbat: yetkazish chegarasi (x-delivery-limit) va hisoblagichlar
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));

async function sinov(nom, usul) {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel();
  await ch.assertQueue(nom, { durable: true, arguments: { 'x-queue-type': 'quorum', 'x-delivery-limit': 3 } });
  ch.sendToQueue(nom, Buffer.from('buzuq xabar'), { persistent: true });
  await kut(200);
  let n = 0;
  const { consumerTag } = await ch.consume(nom, msg => {
    if (!msg) return;                                // navbat o'chirilganda null keladi
    n++;
    const h = msg.properties.headers || {};
    console.log(`  ${n}-yetkazish: redelivered=${msg.fields.redelivered}, x-delivery-count=${h['x-delivery-count'] ?? '-'}, x-acquired-count=${h['x-acquired-count'] ?? '-'}`);
    if (n >= 6) { ch.ack(msg); return; }               // cheksiz aylanmasin
    usul === 'reject' ? ch.reject(msg, true) : ch.nack(msg, false, true);
  });
  await kut(1500);
  const q = await ch.checkQueue(nom);
  console.log(`  natija: ${n} marta yetkazildi, navbatda ${q.messageCount} xabar`);
  await ch.cancel(consumerTag); await ch.deleteQueue(nom); await c.close();
}

(async () => {
  console.log("reject (requeue) — x-delivery-limit 3:"); await sinov('zaharli-1', 'reject');
  console.log("nack (requeue) — x-delivery-limit 3:");   await sinov('zaharli-2', 'nack');
})();
```

```text vps
$ cd /root/rabbit-ilova && node zaharli.js
reject (requeue) — x-delivery-limit 3:
  1-yetkazish: redelivered=false, x-delivery-count=-, x-acquired-count=-
  2-yetkazish: redelivered=true, x-delivery-count=1, x-acquired-count=1
  3-yetkazish: redelivered=true, x-delivery-count=2, x-acquired-count=2
  4-yetkazish: redelivered=true, x-delivery-count=3, x-acquired-count=3
  natija: 4 marta yetkazildi, navbatda 0 xabar
nack (requeue) — x-delivery-limit 3:
  1-yetkazish: redelivered=false, x-delivery-count=-, x-acquired-count=-
  2-yetkazish: redelivered=true, x-delivery-count=-, x-acquired-count=1
  3-yetkazish: redelivered=true, x-delivery-count=-, x-acquired-count=2
  4-yetkazish: redelivered=true, x-delivery-count=-, x-acquired-count=3
  5-yetkazish: redelivered=true, x-delivery-count=-, x-acquired-count=4
  6-yetkazish: redelivered=true, x-delivery-count=-, x-acquired-count=5
  natija: 6 marta yetkazildi, navbatda 0 xabar
```

- **`reject`**: har qaytarishda `x-delivery-count` o'sdi (1, 2, 3). 3 muvaffaqiyatsiz urinishdan keyin xabar tashlab yuborildi — 4 marta yetkazildi, navbat bo'sh.
- **`nack`**: `x-delivery-count` umuman yo'q, faqat `x-acquired-count` o'sdi. Chegaraga yetmadi — 6-marta o'zimiz tasdiqladik. RabbitMQ 4.3 dagi o'zgarish aynan shu: `nack` bilan qaytarish chegaraga hisoblanmaydi.

### Bitta tugundagi quorum navbat

```text vps
$ rabbitmqctl -q list_queues name type durable leader members online | grep -E '^name|^(hello|task_queue)'
name	type	durable	leader	members	online
hello	quorum	true	rabbit@lab	[rabbit@lab]	[rabbit@lab]
task_queue	quorum	true	rabbit@lab	[rabbit@lab]	[rabbit@lab]
$ rabbitmq-queues -q quorum_status task_queue --formatter json | python3 -c "import json,sys; [print(r['Node Name'], r['Raft State'], r['Membership'], 'commit:', r['Commit Index']) for r in json.load(sys.stdin)]"
rabbit@lab leader voter commit: 36
$ rabbitmqctl -q list_queues name type arguments | grep -E '^name|^(hello|task_queue)'
name	type	arguments
hello	quorum	[{"x-queue-type","quorum"}]
task_queue	quorum	[{"x-queue-type","quorum"}]
$ rabbitmqctl -q list_queues name | grep -c zaharli
0
```

- Lider ham, yagona a'zo ham — `rabbit@lab`. Bitta tugunda replikatsiya yo'q — chidamlilik 0 (RQ jadvali). Haqiqiy chidamlilik uchun kamida 3 tugun kerak (32-bob).
- `quorum_status` — Raft holati: `leader`, `voter`, commit indeksi.
- 3- va 5-boblardagi navbatlar — e'londa `x-queue-type: quorum` berilgan.

## Variantlar

| Holat | Tur |
| --- | --- |
| Muhim, uzoq yashaydigan, replikatsiya kerak | Quorum (RQ standart tanlovi) |
| Vaqtinchalik, exclusive, server nomlagan | Classic |
| Ko'p obunachi, qayta o'qish | Stream |
| ~5000 dan ortiq quorum navbat | RQ: topologiyani qayta ko'rib chiqing |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Navbat turini policy bilan o'zgartirishga urinish | Faqat e'londa (RQ) | Yangi navbat, migratsiya |
| Quorum navbatni 1–2 tugunda ishlatib, chidamlilik kutish | Chidamlilik 0 (RQ) | Kamida 3 tugun |
| Dead letter'siz quorum navbat | Chegaradan oshgan xabar jimgina yo'qoladi (sinovda) | DLX (15-bob) |
| `x-delivery-limit: -1` | Zaharli xabar cheksiz aylanadi (RQ: tavsiya etilmaydi) | Standart (20) yoki kerakli qiymat |
| `nack` ham chegaraga hisoblanadi deb o'ylash | 4.3 dan hisoblanmaydi (sinovda) | Rad etish uchun `reject` |
| Quorum navbatga confirms'siz yuborish | Kelishuvdan xabarsiz (RQ) | Publisher confirms (20-bob) |

## Amaliyot

1. Quorum navbat nimaga asoslangan va qachon tavsiya etiladi?
2. Quorum navbatni qanday e'lon qilasiz, policy bilan bo'ladimi?
3. 3 tugunli klaster nechta tugun ishdan chiqishiga chidaydi?
4. Zaharli xabar nima va quorum navbat uni qanday ushlaydi?
5. Sinovda `reject` va `nack` qanday farq qildi?

<details>
<summary>Javoblar</summary>

1. Raft; uzoq yashaydigan, muhim, yuqori mavjudlik kerak bo'lgan navbatlar uchun.
2. `x-queue-type: quorum` — faqat e'londa, policy bilan emas.
3. Bittasiga.
4. Hech qachon ishlanmay qayta-qayta qaytariladigan xabar; `x-delivery-limit` dan oshgach tashlanadi yoki dead letter'ga ketadi.
5. `reject` hisoblandi va xabar 3 urinishdan keyin tashlandi; `nack` hisoblanmadi.

</details>

## Rasmiy hujjat

- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) — Feature Matrix, Poison Message Handling
- [RQ: Classic Queues](https://www.rabbitmq.com/docs/classic-queues)
