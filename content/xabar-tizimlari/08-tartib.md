# 08 — Tartib

[Mundarija](README.md)

## Tushuncha

"Buyurtma yaratildi", "to'landi", "bekor qilindi" — teskari tartibda ishlansa, natija noto'g'ri. Uch tizim tartibni **ma'lum chegarada** kafolatlaydi, chegaradan tashqarida emas.

| Tizim | Tartib kafolati | Chegara |
| --- | --- | --- |
| **RabbitMQ** | Bitta kanalda yuborilgan, bitta exchange, bitta navbat va bitta chiquvchi kanaldan o'tgan xabarlar yuborilgan tartibda olinadi (AMQP 0-9-1, 4.7-bo'lim) | Navbatda bir nechta consumer bo'lsa, consumer tartibni buzilgan holda ko'rishi mumkin |
| **Kafka** | Partition ichida: consumer partition hodisalarini aynan yozilgan tartibda o'qiydi (KD Introduction) | Partition'lar orasida tartib yo'q. Bir kalitli hodisalar bitta partition'ga tushadi |
| **Redis stream** | ID'lar doim o'sib boradi: har yangi yozuv ID'si oldingilaridan katta, stream ichida to'liq tartib (RD XADD) | Consumer group'da xabarlar consumer'larga bo'linadi — ishlov tartibi ishchilarga bog'liq |

### RabbitMQ: navbatga qaytgan xabar (RQ Broker Semantics)

- RabbitMQ 2.7.0'dan beri xabarlar navbatda **yuborilgan tartibda** saqlanadi — `nack`/`reject` bilan qaytarilganda yoki kanal yopilganda ham. Undan oldingi versiyalarda qaytgan xabar navbat oxiriga tushardi.
- Lekin navbatda **bir nechta obunachi** bo'lsa, alohida consumer xabarlarni tartibsiz ko'rishi mumkin: boshqa obunachi xabarni qaytaradi. Navbat nuqtai nazaridan tartib saqlangan.

### Kafka: kalit va partition (KD)

Bir xil kalitli hodisalar (masalan, mijoz yoki mashina ID'si) bitta partition'ga yoziladi. Shu partition'ning har consumer'i ularni yozilgan tartibda o'qiydi. Shuning uchun "bir obyektning hodisalari tartibda" kerak bo'lsa — obyekt ID'si kalit bo'ladi.

### Redis: ID'lar (RD XADD)

ID — `<millisoniya>-<tartib raqami>`. Redis ID'lar doim o'sishini kafolatlaydi. Mahalliy soat orqaga ketsa ham, oxirgi yozuv vaqtini olib, tartib raqamini oshiradi. Aniq ID berilsa, u stream'dagi barcha ID'lardan katta bo'lishi shart, aks holda buyruq rad etiladi.

### Parallellik va tartib

Ishni ko'p ishchiga bo'lish (11-bob) tezlik beradi, lekin tartibni yo'qotadi: ikki ishchi ikki xabarni bir vaqtda ishlaydi va qaysi biri oldin tugashi noma'lum. Tartib kerak bo'lgan xabarlar bitta oqimda — bitta navbat va bitta consumer, yoki bitta Kafka partition'i — ishlanishi kerak.

## Uch tizimda

### RabbitMQ: qaytarilgan xabar va ikki consumer

```js
// Bitta navbat, ikki consumer: A 1-xabarni olib, biroz o'ylab navbatga qaytaradi (nack, requeue); B kelganini tasdiqlaydi
const amqp = require('amqplib');
(async () => {
  const c = await amqp.connect('amqp://localhost');
  const a = await c.createChannel(); await a.prefetch(1);
  const b = await c.createChannel(); await b.prefetch(1);
  const kordi = [];
  await a.consume('tartib', m => setTimeout(() => { a.nack(m, false, true); a.close(); }, 300));   // A: qaytaradi va chiqadi
  await new Promise(r => setTimeout(r, 100));                                                     // A birinchi bo'lib olsin
  await b.consume('tartib', m => { kordi.push(m.content.toString()); setTimeout(() => b.ack(m), 100); });
  await new Promise(r => setTimeout(r, 2000));
  console.log('B ko\'rgan tartib:', kordi.join(', ')); await c.close();
})();
```

```text vps
$ rabbitmqadmin queues declare --name tartib --durable true >/dev/null; for i in 1 2 3 4 5; do rabbitmqadmin publish message --routing-key tartib --payload "#$i" >/dev/null; done; cd /root/rabbit-ilova && node tartib.js; rabbitmqadmin queues delete --name tartib; rm tartib.js
B ko'rgan tartib: #2, #3, #1, #4, #5
```

`#1` ni A oldi, o'ylab turdi va qaytardi. Bu vaqtda B `#2`, `#3` ni ishladi. `#1` navbatdagi o'z joyiga qaytdi va B uni keyingi bo'lib oldi. B ko'rgan tartib: `#2, #3, #1, #4, #5` — navbat tartibni saqladi, lekin consumer buzilgan tartibni ko'rdi (RQ).

### Kafka: kalit bo'yicha tartib

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic tartib --partitions 3 >/dev/null; for i in 1 2 3; do for m in ali vali sami; do echo "$m:$m-$i"; done; done | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic tartib --reader-property parse.key=true --reader-property key.separator=: ; echo "yozilgan tartib: ali-1 vali-1 sami-1 ali-2 vali-2 sami-2 ali-3 vali-3 sami-3"
yozilgan tartib: ali-1 vali-1 sami-1 ali-2 vali-2 sami-2 ali-3 vali-3 sami-3
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic tartib --from-beginning --max-messages 9 --formatter-property print.partition=true 2>/dev/null | awk '{print $1, $2}' | tr '\n' ' '; echo; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic tartib
Partition:0 ali-1 Partition:0 vali-1 Partition:0 ali-2 Partition:0 vali-2 Partition:0 ali-3 Partition:0 vali-3 Partition:2 sami-1 Partition:2 sami-2 Partition:2 sami-3 
```

- Uch partition'li topic'ga uch mijozning hodisalari aralash yozildi.
- `ali` va `vali` 0-partition'ga, `sami` 2-partition'ga tushdi (kalit xeshi bo'yicha).
- O'qilganda **umumiy** tartib boshqacha: `sami-1` `vali-3` dan keyin keldi. Lekin har mijoz ichida tartib saqlangan: `ali-1, ali-2, ali-3`, `sami-1, sami-2, sami-3`.

### Redis: o'sib boruvchi ID'lar

```text vps
$ redis-cli XADD tartib '*' buyurtma 1; redis-cli XADD tartib '*' buyurtma 2; redis-cli XADD tartib 1-1 buyurtma 0; redis-cli XRANGE tartib - + | paste - - - | awk '{print $1, $3}'; redis-cli DEL tartib >/dev/null
1794350719702-0
1794350719707-0
ERR The ID specified in XADD is equal or smaller than the target stream top item

1794350719702-0 1
1794350719707-0 2
```

`*` bilan — Redis vaqtga asoslangan o'suvchi ID beradi. Oxirgisidan kichik aniq ID (`1-1`) rad etildi. Stream'da faqat ikki yozuv, ID tartibida.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Navbatdagi bir nechta consumer'dan tartib kutish | Har consumer tartibsiz ko'rishi mumkin (RQ, sinovda) | Tartib kerak bo'lsa — bitta consumer yoki bo'lingan navbatlar |
| Kafka'da butun topic bo'yicha tartib kutish | Tartib faqat partition ichida (KD, sinovda) | Kerakli guruhlash uchun kalit |
| Kafka'da kalitsiz yuborish, tartib kerak bo'lsa | Hodisalar turli partition'larga tarqaladi | Obyekt ID'si — kalit |
| Partition sonini keyinroq oshirish | Kalit boshqa partition'ga o'tishi mumkin — tartib vaqtincha buziladi (Kafka kitobi, 5-bob) | Boshidan yetarli partition |
| Redis'da tashqi ID'larni tartibsiz yuborish | Kichik ID rad etiladi (RD, sinovda) | `*` yoki o'sib boruvchi tashqi ID |

## Amaliyot

1. RabbitMQ qaysi shartlarda tartibni kafolatlaydi?
2. Sinovda B consumer `#1` ni nega uchinchi bo'lib ko'rdi?
3. Kafka'da tartib qayerda kafolatlanadi va bir mijoz hodisalari tartibini qanday ta'minlash mumkin?
4. Redis stream ID'lari nimadan iborat va qanday qoidaga bo'ysunadi?
5. Parallel consumer'lar tartibga qanday ta'sir qiladi?

<details>
<summary>Javoblar</summary>

1. Bitta kanal, bitta exchange, bitta navbat va bitta chiquvchi kanal orqali o'tgan xabarlar uchun.
2. A uni ushlab turib qaytardi; shu orada B keyingi xabarlarni ishladi.
3. Partition ichida; mijoz ID'sini kalit qilish.
4. Millisoniya va tartib raqami; har yangi ID oldingilardan katta.
5. Xabarlar bir vaqtda ishlanadi — qaysi biri oldin tugashi noma'lum, tartib yo'qoladi.

</details>

## Rasmiy hujjat

- [RQ: Broker Semantics](https://www.rabbitmq.com/docs/semantics) — Message ordering guarantees
- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/)
- [RD: XADD](https://redis.io/docs/latest/commands/xadd/) · [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/)
