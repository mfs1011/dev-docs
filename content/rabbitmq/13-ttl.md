# 13 — Xabar va navbat muddati

[Mundarija](README.md)

## Tushuncha

RQ (Time-to-Live and Expiration): **TTL** (time-to-live — yashash muddati) xabarlar va navbatlar qancha "yashashini" belgilaydi.

| Nima | Qanday beriladi | Nima bo'ladi |
| --- | --- | --- |
| Navbatdagi **xabar** TTL'i | Policy: `message-ttl`; yoki e'londa `x-message-ttl` | Navbatda belgilangan vaqtdan ko'p turgan xabar muddati o'tadi va tashlab yuboriladi |
| **Har xabar**ning TTL'i | Yuborishda `expiration` xususiyati (millisekund, **satr** sifatida) | Xuddi shunday, lekin xabarga xos |
| **Navbat** TTL'i | Policy: `expires`; yoki e'londa `x-expires` | Ishlatilmayotgan navbat o'chiriladi |

Qiymatlar — millisekundda. RQ: eng yaxshi yo'l — **policy** (17-bob).

### Xabar TTL'i (RQ)

- "Tashlab yuboriladi" — xabar consumer'ga ham, `basic.get` ga ham **berilmaydi**. Server buni **kafolatlaydi** va muddati o'tgan xabarni iloji boricha tez o'chirishga harakat qiladi.
- Bir xabar bir nechta navbatga tushgan bo'lsa, har birida alohida o'ladi — biridagi o'limi boshqasiga ta'sir qilmaydi.
- Qiymat — manfiy bo'lmagan butun son; `1000` — 1 soniya yoki consumer olguncha.

### Har xabar TTL'i: muhim nozik joy (RQ)

Muddati o'tgan xabarlar faqat navbat **boshiga** yetganda haqiqatan tashlanadi. Consumer'larga ular berilmaydi, lekin muddatsiz xabarlar **ortida** turib qolishi mumkin. Bunday xabarlar resursni bo'shatmaydi va navbat statistikasida (xabarlar soni) **sanaladi**. Resursni bo'shatish kerak bo'lsa — navbat TTL'i, tozalash (purge) yoki o'chirish.

Dead lettering bilan (15-bob): quorum navbatlar muddati o'tgan xabarni navbat boshiga yetganda dead letter qiladi; classic navbatlar — boshiga yetganda yoki policy o'zgarganda.

### Navbat TTL'i (RQ)

- Navbat **ishlatilmayotgan** bo'lsa o'chiriladi. "Ishlatilmayotgan" — consumer yo'q, yaqinda qayta e'lon qilinmagan (qayta e'lon muddatni yangilaydi) va kamida shu vaqt ichida `basic.get` chaqirilmagan.
- Server shu vaqtdan keyin o'chirishni kafolatlaydi, lekin **qanchalik tez** — kafolat yo'q.
- Qiymat — musbat butun son (0 bo'lmaydi). Masalan, hech qachon bo'shatilmaydigan RPC javob navbatlari uchun.
- Stream'lar muddatni qo'llamaydi.

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0).

### Policy bilan xabar TTL'i

```text vps
$ A="rabbitmqadmin --non-interactive"; $A queues declare --name ttl.q --type quorum --durable true; rabbitmqctl set_policy ttl-sinov "^ttl\.q$" '{"message-ttl":3000}' --apply-to queues; rabbitmqctl -q list_queues name policy effective_policy_definition | grep '^ttl'
Setting policy "ttl-sinov" for pattern "^ttl\.q$" to "{"message-ttl":3000}" with priority "0" for vhost "/" ...
ttl.q	ttl-sinov	[{<<"message-ttl">>, 3000}]
$ A="rabbitmqadmin --non-interactive"; for i in 1 2; do $A publish message --routing-key ttl.q --payload "x$i" >/dev/null; done; bash /root/son.sh ttl.q; sleep 3.5; bash /root/son.sh ttl.q
ttl.q=2 
ttl.q=0 
```

`ttl.q` (quorum) navbatiga `message-ttl: 3000` policy'si qo'llandi (`effective_policy_definition`). Ikki xabar yuborildi — 3.5 soniyadan keyin ikkalasi ham yo'q.

### Har xabarning o'z muddati

Bitta skriptda — avval muddatli xabar boshida, keyin muddatsiz xabar ortida:

```js
// Har xabarning o'z muddati (expiration): navbat boshida va TTL'siz xabar ortida
const amqp = require('amqplib');
const kut = ms => new Promise(r => setTimeout(r, ms));
async function main() {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createConfirmChannel();
  const q = 'ttl.p';
  await ch.assertQueue(q, { durable: true, arguments: { 'x-queue-type': 'classic' } });
  for (const tartib of [['3 s', 'muddatsiz'], ['muddatsiz', '3 s']]) {
    for (const m of tartib) ch.sendToQueue(q, Buffer.from(m), m === '3 s' ? { expiration: '3000' } : {});
    await ch.waitForConfirms();
    const t0 = (await ch.checkQueue(q)).messageCount;
    await kut(3500);
    const t1 = (await ch.checkQueue(q)).messageCount;
    const olindi = []; let m; while ((m = await ch.get(q, { noAck: true }))) olindi.push(m.content.toString());
    console.log(`navbatda [${tartib.join(', ')}]: darhol ${t0}, 3.5 s dan keyin ${t1}, consumer oldi: [${olindi.join(', ')}]`);
  }
  await ch.deleteQueue(q); await c.close();
}
main();
```

```text vps
$ cd /root/rabbit-ilova && node muddat.js
navbatda [3 s, muddatsiz]: darhol 2, 3.5 s dan keyin 1, consumer oldi: [muddatsiz]
navbatda [muddatsiz, 3 s]: darhol 2, 3.5 s dan keyin 2, consumer oldi: [muddatsiz]
```

| Navbatda | Darhol | 3.5 s dan keyin | Consumer oldi |
| --- | --- | --- | --- |
| `3 s`, `muddatsiz` | 2 | **1** | `muddatsiz` |
| `muddatsiz`, `3 s` | 2 | **2** | `muddatsiz` |

Ikkinchi holatda muddati o'tgan `3 s` muddatsiz xabar **ortida** turib qoldi va navbat hisobida sanaldi (2). Lekin consumer unga baribir yetmadi: navbat boshiga kelganda u tashlandi. Hujjatdagi nozik joy aynan shu.

Kuzatildi: shu sinovni `rabbitmqadmin publish` bilan qilganda muddatli xabar birinchi o'lchovgacha yo'qolib ulgurdi — `rabbitmqadmin` chaqiruvlari orasidagi vaqt muddatga yaqin edi. Vaqtga sezgir sinovlar bitta jarayonda o'tkazilgani ishonchliroq.

### Navbat TTL'i

```text vps
$ A="rabbitmqadmin --non-interactive"; $A queues declare --name ttl.x --type classic --durable true --arguments '{"x-expires":8000}'; rabbitmqctl -q list_queues name arguments | grep '^ttl\.x'; sleep 10; rabbitmqctl -q list_queues name | grep -c '^ttl\.x$'
ttl.x	[{"x-expires",8000},{"x-queue-type","classic"}]
0
$ rabbitmqctl -q clear_policy ttl-sinov; for q in ttl.q ttl.p; do rabbitmqadmin queues delete --name $q; done; rm /root/son.sh; rabbitmqctl -q list_queues name | grep -c '^ttl'
0
```

`x-expires: 8000` li navbat yaratildi; consumer'siz va murojaatsiz 10 soniyadan keyin — yo'q (0). Oxirida sinov navbatlari va policy o'chirildi.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Navbatdagi hamma xabarga bir xil muddat | `message-ttl` policy |
| Har xabarga o'z muddati | `expiration` (ortida qolish xususiyatini hisobga olib) |
| Muddati o'tgan xabarni yo'qotmaslik | TTL + dead letter exchange (15-bob) |
| Keraksiz qolgan navbatlarni tozalash | `expires` policy |
| Kechiktirilgan qayta urinish | TTL + DLX (15-bob); quorum: delayed retry (RQ) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `expiration` ni son sifatida berish | U **satr** bo'lishi kerak (RQ) | `'3000'` |
| Har xabar TTL'i bilan resurs bo'shaydi deb kutish | Muddati o'tganlar ortda qolib, sanalishi mumkin (RQ, sinovda) | Navbat TTL'i, purge |
| Navbat TTL'i aniq vaqtda o'chiradi deb kutish | Faqat "kamida shu vaqtdan keyin" (RQ) | — |
| `x-expires: 0` | Musbat bo'lishi kerak (RQ) | > 0 |
| TTL'ni kodda, hamma navbatga | O'zgartirish uchun qayta deploy | Policy |

## Amaliyot

1. Xabar TTL'ini qanday uch usulda berish mumkin?
2. Muddati o'tgan xabar consumer'ga berilishi mumkinmi?
3. Sinovning ikkinchi holatida nega 3.5 soniyadan keyin navbatda hali 2 xabar bor edi?
4. Navbat qachon "ishlatilmayotgan" hisoblanadi?
5. Muddati o'tgan xabarni yo'qotmasdan saqlash uchun nima kerak?

<details>
<summary>Javoblar</summary>

1. Policy (`message-ttl`), e'londa `x-message-ttl`, har xabarga `expiration`.
2. Yo'q — server kafolatlaydi.
3. Muddati o'tgan xabar muddatsiz xabar ortida turib qoldi; faqat navbat boshiga yetganda tashlanadi.
4. Consumer yo'q, qayta e'lon qilinmagan va `basic.get` chaqirilmagan.
5. Dead letter exchange.

</details>

## Rasmiy hujjat

- [RQ: Time-to-Live and Expiration](https://www.rabbitmq.com/docs/ttl)
- [RQ: Policies](https://www.rabbitmq.com/docs/policies)
