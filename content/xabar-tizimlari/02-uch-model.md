# 02 — Uch model

[Mundarija](README.md)

## Tushuncha

Xabar yuborilgandan keyin u bilan nima bo'lishi — uch xil. Shu farq qaysi model kerakligini belgilaydi.

| Model | Kim oladi | O'qilgandan keyin | Qachon |
| --- | --- | --- | --- |
| **Ish navbati** (work queue) | Har xabarni **bitta** ishchi | Navbatdan o'chadi | Ishni ishchilarga bo'lish: xat yuborish, rasmga ishlov |
| **Pub/sub** (publish/subscribe — nashr va obuna) | **Har** obunachi o'z nusxasini | Har obunachidagi nusxa alohida | Bitta hodisa bir nechta xizmatga kerak: xat, analitika, hisob |
| **Hodisalar jurnali** (log, stream) | Istalgan o'quvchi, istalgan vaqtda | **Saqlanib qoladi** (saqlash muddati tugaguncha) | Tarixni qayta o'qish, kechikib qo'shilgan xizmat |

### Rasmiy hujjatlarda

**Ish navbati** — RT 3: ish navbatining asosidagi taxmin — har vazifa **aynan bitta** ishchiga yetkaziladi.

**Pub/sub**:

- RT 3 (Publish/Subscribe): xabarni **bir nechta** iste'molchiga yetkazish. **Fanout** exchange olgan har xabarini o'ziga bog'langan barcha navbatlarga tarqatadi.
- RD (Pub/sub): yuboruvchi xabarni kanalga yuboradi, kimlar obuna bo'lganini bilmaydi. Obunachi kanalga obuna bo'ladi, kimlar yuborayotganini bilmaydi. Redis xabarni kanalning **barcha** obunachilariga uzatadi.
- RD: Redis pub/sub — **ko'pi bilan bir marta** (at-most-once) yetkazish. Obunachi xabarni ishlay olmasa (xato yoki uzilish), xabar **butunlay yo'qoladi**. Kuchliroq kafolat uchun — Redis Streams.

**Hodisalar jurnali**:

- KD (Introduction): topic'dagi hodisalarni **istalgancha** o'qish mumkin. An'anaviy xabar tizimlaridan farqli ravishda, hodisalar o'qilgandan keyin **o'chirilmaydi**. Ular har topic uchun belgilangan muddat saqlanadi, keyin eskilari tashlanadi.
- RQ (Streams): RabbitMQ stream'i — faqat oxiriga qo'shiladigan jurnal. O'qish xabarni o'chirmaydi ("non-destructive").
- RD (Streams): Redis Streams xabarlari saqlanadi.

**Bitta asbob — bir nechta model.** Uch asbob ham bir nechta modelni qo'llaydi (3-bob). RabbitMQ'da navbat — ish navbati, fanout — pub/sub, stream — jurnal. Kafka'da jurnal ustida **consumer group** ichida partition'lar bo'linadi (ish navbatiga o'xshash), har guruh esa o'z nusxasini o'qiydi (pub/sub'ga o'xshash) — KD (Design).

## Uch tizimda

Uchala modelni bitta asbobda — RabbitMQ'da (VPS, 4.4.0) ko'ramiz.

### Ish navbati: bitta ishchi

```text vps
$ rabbitmqadmin queues declare --name ishlar --durable true >/dev/null; rabbitmqadmin publish message --routing-key ishlar --payload "buyurtma #1"
Message published and routed successfully
$ rabbitmqadmin get messages --queue ishlar --ack-mode ack_requeue_false | grep -o 'buyurtma #1' || echo "1-ishchi: bo'sh"; rabbitmqadmin get messages --queue ishlar --ack-mode ack_requeue_false | grep -o 'buyurtma #1' || echo "2-ishchi: bo'sh"
buyurtma #1
2-ishchi: bo'sh
```

Bitta xabarni birinchi ishchi oldi, ikkinchisiga hech narsa qolmadi.

### Pub/sub: har obunachiga nusxa

`hodisa` fanout exchange'iga ikki navbat bog'landi — `xat` va `analitika` xizmatlari uchun:

```text vps
$ rabbitmqadmin exchanges declare --name hodisa --type fanout --durable true >/dev/null; for q in xat analitika; do rabbitmqadmin queues declare --name $q --durable true >/dev/null; rabbitmqadmin bindings declare --source hodisa --destination-type queue --destination $q --routing-key "" >/dev/null; done; rabbitmqadmin publish message --exchange hodisa --routing-key "" --payload "buyurtma #1"
Message published and routed successfully
$ sleep 1; rabbitmqctl -q list_queues name messages | grep -E '^name|^xat|^analitika'
name	messages
xat	1
analitika	1
```

Bitta yuborish — har navbatda 1 tadan nusxa.

### Jurnal: o'qish o'chirmaydi

```js
// Stream'dan boshidan o'qish (x-stream-offset: first): o'qish xabarni o'chirmaydi
const amqp = require('amqplib');
(async () => {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel();
  await ch.prefetch(10); const olindi = [];
  await ch.consume('tarix', m => { olindi.push(m.content.toString()); ch.ack(m); }, { arguments: { 'x-stream-offset': 'first' } });
  await new Promise(r => setTimeout(r, 1000));
  console.log(`${process.argv[2]}: ${olindi.join(', ') || "bo'sh"}`); await c.close();
})();
```

```text vps
$ rabbitmqadmin queues declare --name tarix --type stream --durable true >/dev/null; rabbitmqadmin publish message --routing-key tarix --payload "buyurtma #1"
Message published and routed successfully
$ cd /root/rabbit-ilova && node jurnal.js "1-o'quvchi"; node jurnal.js "2-o'quvchi (keyinroq)"
1-o'quvchi: buyurtma #1
2-o'quvchi (keyinroq): buyurtma #1
```

Ikkinchi o'quvchi keyinroq ulandi, lekin baribir o'sha xabarni oldi — u stream'da saqlanib turibdi.

<div data-animatsiya="qadamli" data-nom="uch-model"></div>

Sinov obyektlari o'chirildi:

```text vps
$ for q in ishlar xat analitika tarix; do rabbitmqadmin queues delete --name $q; done; rabbitmqadmin exchanges delete --name hodisa; rm /root/rabbit-ilova/jurnal.js
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Bir nechta xizmatga xabar kerak, lekin bitta ish navbati | Har xabarni faqat bitta oluvchi oladi (RT, sinovda) | Pub/sub: har xizmatga o'z navbati |
| Redis pub/sub'ni ishonchli navbat deb ishlatish | At-most-once: obunachi uzilsa, xabar yo'qoladi (RD) | Redis Streams yoki broker navbati |
| Tarix kerak, lekin oddiy navbat | O'qilgan xabar o'chadi | Jurnal (stream, Kafka topic) |
| Jurnal abadiy saqlaydi deb o'ylash | Saqlash muddati yoki hajmi bor (KD, RQ) | Muddatni sozlash (10-bob) |

## Amaliyot

1. Uch modelning har birida xabarni kim oladi?
2. Sinovda ikkinchi ishchi nega hech narsa olmadi?
3. Redis pub/sub qaysi yetkazish kafolatini beradi va bu nimani anglatadi?
4. Jurnal modelida keyinroq ulangan o'quvchi nimani ko'radi?

<details>
<summary>Javoblar</summary>

1. Ish navbati — bitta ishchi; pub/sub — har obunachi; jurnal — istalgan o'quvchi, istalgan vaqtda.
2. Ish navbatida har xabar bitta ishchiga beriladi va navbatdan o'chadi.
3. At-most-once: obunachi ishlay olmasa, xabar butunlay yo'qoladi.
4. Saqlangan xabarlarni — o'qish ularni o'chirmagan.

</details>

## Rasmiy hujjat

- [RT: 3. Publish/Subscribe](https://www.rabbitmq.com/tutorials/tutorial-three-javascript)
- [RQ: Streams](https://www.rabbitmq.com/docs/streams)
- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD: Design](https://kafka.apache.org/44/design/design/)
- [RD: Redis Pub/sub](https://redis.io/docs/latest/develop/pubsub/)
