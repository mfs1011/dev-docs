# 14 — Navbat uzunligi chegarasi

[Mundarija](README.md)

## Tushuncha

Consumer'lar ulgurmasa yoki to'xtab qolsa, navbat cheksiz o'sib, xotira va diskni egallaydi. RQ (Queue Length Limit): navbatga **eng ko'p uzunlik** berish mumkin:

| Kalit | Nima |
| --- | --- |
| `max-length` | Xabarlar soni |
| `max-length-bytes` | Barcha xabar **tanalari** uzunligi yig'indisi (xususiyatlar va qo'shimcha xarajatlar hisobga olinmaydi) |

Ikkalasi ham berilishi mumkin. Belgilash — **policy** bilan (RQ: qat'iyan tavsiya etiladi) yoki e'londa `x-max-length`, `x-max-length-bytes`. Ikkala yo'l bilan berilsa — **kichigi** ishlaydi.

RQ: classic navbatlarda faqat **ready** (tayyor) holatdagi xabarlar sanaladi. Quorum navbatlarda kechiktirilganlar va at-least-once dead letter kutayotganlar ham sanaladi. Consumer tasdiqlamagan xabarlar **sanalmaydi**.

### Chegaraga yetganda (`overflow`)

| `overflow` | Nima (RQ) |
| --- | --- |
| `drop-head` (standart) | Navbat **boshidan** (eng eski) xabarlar tashlanadi yoki dead letter qilinadi |
| `reject-publish` | **Eng yangi** yuborilgan xabarlar tashlanadi; publisher confirms yoqilgan bo'lsa, publisher'ga `basic.nack` keladi |
| `reject-publish-dlx` | `reject-publish` + rad etilganlar dead letter qilinadi |

RQ: xabar bir nechta navbatga yo'naltirilgan bo'lsa va ulardan kamida bittasi rad etsa, publisher `basic.nack` oladi; boshqa navbatlarga xabar baribir tushadi.

### Quorum navbatlarda (RQ: Quorum Queues — Length Limit)

- `drop-head` va `reject-publish` qo'llanadi, `reject-publish-dlx` — **yo'q**.
- `reject-publish` chegarani **qat'iy saqlamaydi**: navbat chegaradan **kamida bitta** xabar oshib ketishi mumkin. Chegaraga yetganda navbat har publisher kanalini ogohlantiradi va shundan keyin kanallar xabarlarni rad etadi. Bu orada yo'lda bo'lgan xabarlar ham qabul qilinadi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Ikki policy — `max-length: 3`, biri standart (`drop-head`), ikkinchisi `reject-publish`. Har navbatga 5 tadan xabar **publisher confirms** bilan yuboriladi (har xabarga `ack` yoki `nack` keladi, 20-bob); keyin navbatda nima qolgani o'qiladi. Quorum va classic navbatlarda:

```js
// Navbat uzunligi chegarasi: drop-head (standart) va reject-publish, quorum va classic
const amqp = require('amqplib');
async function sinov(q, tur) {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createConfirmChannel();
  await ch.assertQueue(q, { durable: true, arguments: { 'x-queue-type': tur } });
  const natija = [];
  for (let i = 1; i <= 5; i++) {
    natija.push(await new Promise(r => ch.sendToQueue(q, Buffer.from(`xabar ${i}`), { persistent: true }, err => r(err ? `${i}:nack` : `${i}:ack`))));
  }
  const qoldi = []; let m; while ((m = await ch.get(q, { noAck: true }))) qoldi.push(m.content.toString());
  console.log(`${q} (${tur}): tasdiqlar [${natija.join(' ')}], navbatda qoldi [${qoldi.join(', ')}]`);
  await ch.deleteQueue(q); await c.close();
}
(async () => {
  await sinov('uz.drop', 'quorum'); await sinov('uz.reject', 'quorum');
  await sinov('uz.drop', 'classic'); await sinov('uz.reject', 'classic');
})();
```

```text vps
$ rabbitmqctl set_policy uz-drop "^uz\.drop$" '{"max-length":3}' --apply-to queues; rabbitmqctl set_policy uz-reject "^uz\.reject$" '{"max-length":3,"overflow":"reject-publish"}' --apply-to queues
Setting policy "uz-drop" for pattern "^uz\.drop$" to "{"max-length":3}" with priority "0" for vhost "/" ...
Setting policy "uz-reject" for pattern "^uz\.reject$" to "{"max-length":3,"overflow":"reject-publish"}" with priority "0" for vhost "/" ...
$ cd /root/rabbit-ilova && node uzunlik.js
uz.drop (quorum): tasdiqlar [1:ack 2:ack 3:ack 4:ack 5:ack], navbatda qoldi [xabar 3, xabar 4, xabar 5]
uz.reject (quorum): tasdiqlar [1:ack 2:ack 3:ack 4:ack 5:nack], navbatda qoldi [xabar 1, xabar 2, xabar 3, xabar 4]
uz.drop (classic): tasdiqlar [1:ack 2:ack 3:ack 4:ack 5:ack], navbatda qoldi [xabar 3, xabar 4, xabar 5]
uz.reject (classic): tasdiqlar [1:ack 2:ack 3:ack 4:nack 5:nack], navbatda qoldi [xabar 1, xabar 2, xabar 3]
$ rabbitmqctl -q clear_policy uz-drop; rabbitmqctl -q clear_policy uz-reject; rabbitmqctl -q list_policies | wc -l; rabbitmqctl -q list_queues name | grep -c '^uz\.'
1
0
```

| Navbat | Tasdiqlar | Navbatda qoldi |
| --- | --- | --- |
| quorum, `drop-head` | 5 ta `ack` | 3, 4, 5 — eskilari (1, 2) tashlandi |
| quorum, `reject-publish` | 4 ta `ack`, 5-si `nack` | 1, 2, 3, **4** — chegaradan bitta ortiq |
| classic, `drop-head` | 5 ta `ack` | 3, 4, 5 |
| classic, `reject-publish` | 3 ta `ack`, 4- va 5-si `nack` | 1, 2, 3 — aniq chegara |

- `drop-head` da publisher hech narsani sezmaydi — hammasi `ack`, lekin eski xabarlar jimgina yo'qoldi.
- `reject-publish` da publisher `nack` oladi va nima qilishni o'zi hal qiladi (keyinroq qayta yuborish, xato).
- Quorum navbat 3 ta chegarada 4-xabarni ham qabul qildi — RQ aytgan "kamida bitta ortiq". Classic navbatda chegara aniq.

## Variantlar

| Kerak | `overflow` |
| --- | --- |
| Eng yangi ma'lumot muhim, eskisi keraksiz (sensor, kotirovka) | `drop-head` |
| Hech narsa jimgina yo'qolmasin, publisher sekinlashsin | `reject-publish` + publisher confirms |
| Rad etilganlarni alohida saqlash (classic) | `reject-publish-dlx` |
| Eskilarini alohida saqlash | `drop-head` + DLX (15-bob) |
| Aniq chegara (quorum'da) | RQ: `reject-publish` taxminiy — ehtiyot bo'ling |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Chegarani faqat kodda, `x-max-length` bilan | O'zgartirish qiyin | Policy (RQ) |
| `drop-head` bilan "xabar yo'qolmaydi" deb o'ylash | Eskilari jimgina tashlanadi (sinovda) | `reject-publish` yoki DLX |
| `reject-publish` ni confirms'siz | Publisher rad etilganini bilmaydi | Publisher confirms (20-bob) |
| Quorum'da aniq chegara kutish | Kamida bitta ortiqcha o'tadi (RQ, sinovda) | Zaxira bilan chegara |
| Quorum'da `reject-publish-dlx` | Qo'llanmaydi (RQ) | `drop-head` + DLX yoki classic |
| Tasdiqlanmaganlar chegaraga kiradi deb hisoblash | Sanalmaydi (RQ) | `messages_ready` ni kuzatish |

## Amaliyot

1. Navbat uzunligini qanday ikki o'lchovda cheklash mumkin?
2. Chegaraga yetganda standart holatda nima bo'ladi?
3. `reject-publish` da publisher buni qanday biladi?
4. Sinovda quorum navbat `reject-publish` bilan nechta xabarni qabul qildi va nega?
5. Quorum navbat qaysi `overflow` turini qo'llamaydi?

<details>
<summary>Javoblar</summary>

1. Xabarlar soni (`max-length`) va tanalar baytlari (`max-length-bytes`).
2. `drop-head` — navbat boshidagi eng eski xabarlar tashlanadi.
3. Publisher confirms yoqilgan bo'lsa — `basic.nack`.
4. To'rtta (chegara 3) — quorum'da `reject-publish` chegaradan kamida bitta oshadi.
5. `reject-publish-dlx`.

</details>

## Rasmiy hujjat

- [RQ: Queue Length Limit](https://www.rabbitmq.com/docs/maxlength)
- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) — Length Limit
