# 16 — Ustuvor navbatlar

[Mundarija](README.md)

## Tushuncha

RQ (Priority Queues): oddiy navbat — **FIFO**: xabarlar kirgan tartibda beriladi. **Ustuvor navbat** (priority queue) esa xabarlarni **ustuvorligi** bo'yicha beradi. Ustuvorlik — publisher yuborishda beradigan musbat butun son (`priority`), kattasi — muhimroq.

RQ misoli: A (1), B (3), C (2) — oddiy navbatda A, B, C; ustuvor navbatda **B, C, A**. Bir nechta consumer, qayta navbatga qaytarish va avtomatik qaytarish bo'lsa, tartib biroz farq qilishi mumkin.

### Classic va quorum (RQ)

| | Classic | Quorum (RabbitMQ 4.3 dan) |
| --- | --- | --- |
| Yoqish | `x-max-priority` — **e'londa** (policy bilan bo'lmaydi) | Doim yoqiq, `x-max-priority` e'tiborga olinmaydi |
| Oraliq | 0–255; har darajaga ichki kichik navbat — RQ: bir xonali son tavsiya etiladi | 0–31 |
| `priority` siz xabar | **0** | **4** |
| Maksimumdan katta | Maksimum deb hisoblanadi | 0–31 ga keltiriladi |
| Past ustuvorlik "och qolishi" | Yo'q — kichik navbatlar navbat bilan aylanadi | **Qat'iy**: yuqori ustuvorlik oqimi to'xtamasa, pastlari cheksiz kutadi |
| Qaytarilgan xabarlar | — | Ustuvorligini saqlamaydi, qaytarilgan tartibda qayta navbatga qo'yiladi |

### Avval muqobillarni ko'ring (RQ)

Ustuvor navbat xatti-harakatini tushunish FIFO'dan ancha qiyin, ayniqsa consumer'lar tez-tez qaytarsa. Odatda u **navbat boshining tiqilishi** (head-of-line blocking) muammosiga qarshi ishlatiladi. Avval:

1. bitta ulkan navbat o'rniga **bir nechta** navbat (`priority.low`, `priority.medium`, `priority.high`) — oddiy FIFO saqlanadi va parallellik yaxshilanadi;
2. bitta navbatda raqobatlashuvchi consumer'lar — alohida kanallar, prefetch 1 dan katta;
3. stream;
4. ba'zan — consumer ustuvorligi.

### Consumer bilan (RQ)

Consumer bo'sh navbatga ulangan bo'lsa, xabarlar kelishi bilan unga beriladi va navbatda kutmaydi — ustuvorlikka **imkon qolmaydi**. Shuning uchun qo'lda tasdiq rejimida **prefetch** (`basic.qos`) bilan bir vaqtda beriladigan xabarlar sonini cheklash kerak (19-bob).

## Ko'rib chiqamiz

VPS'da (RabbitMQ 4.4.0). Bir xil besh xabar uch navbatga yuboriladi: `x-max-priority: 5` li classic, quorum va ustuvorliksiz classic. Keyin hammasi o'qiladi:

```js
// Ustuvorlik: classic (x-max-priority 5) va quorum (0-31, doim yoqiq)
const amqp = require('amqplib');
const xabarlar = [['A', 1], ['B', 3], ['C', 2], ['D', undefined], ['E', 9]];
async function sinov(q, args) {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createConfirmChannel();
  await ch.assertQueue(q, { durable: true, arguments: args });
  for (const [m, p] of xabarlar) ch.sendToQueue(q, Buffer.from(m), p === undefined ? {} : { priority: p });
  await ch.waitForConfirms();
  const tartib = []; let msg;
  while ((msg = await ch.get(q, { noAck: true }))) tartib.push(`${msg.content}(${msg.properties.priority ?? '-'})`);
  console.log(`${q}: ${tartib.join(' ')}`);
  await ch.deleteQueue(q); await c.close();
}
(async () => {
  console.log('yuborish tartibi:', xabarlar.map(([m, p]) => `${m}(${p ?? '-'})`).join(' '));
  await sinov('ust.classic', { 'x-queue-type': 'classic', 'x-max-priority': 5 });
  await sinov('ust.quorum', { 'x-queue-type': 'quorum' });
  await sinov('ust.oddiy', { 'x-queue-type': 'classic' });
})();
```

```text vps
$ cd /root/rabbit-ilova && node ustuvor.js
yuborish tartibi: A(1) B(3) C(2) D(-) E(9)
ust.classic: E(9) B(3) C(2) A(1) D(-)
ust.quorum: E(9) D(-) B(3) C(2) A(1)
ust.oddiy: A(1) B(3) C(2) D(-) E(9)
```

| Navbat | Chiqish tartibi | Nega (RQ) |
| --- | --- | --- |
| classic, `x-max-priority: 5` | E, B, C, A, **D** | E (9) maksimum 5 deb hisoblandi; ustuvorligi yo'q D — 0, eng oxirida |
| quorum | E, **D**, B, C, A | D 4 deb olindi — B (3) dan oldin |
| classic, ustuvorliksiz | A, B, C, D, E | Oddiy FIFO — `priority` e'tiborga olinmadi |

## Variantlar

| Kerak | Usul |
| --- | --- |
| Tezkor ishlar sekinlari ortida qolmasin | RQ: avval — alohida navbatlar |
| Bitta navbatda ozgina ustuvorlik darajasi | Classic `x-max-priority` (bir xonali) |
| Replikatsiya + ustuvorlik | Quorum (4.3+), past ustuvorlik och qolishi mumkinligini hisobga olib |
| Ba'zi consumer'lar oldin olsin | Consumer ustuvorligi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `x-max-priority` ni policy bilan berish | Qo'llanmaydi (RQ) | E'londa |
| Juda ko'p daraja (masalan, 255) | Classic'da CPU va xotira sarfi (RQ) | Bir xonali son |
| Prefetch'siz consumer | Xabarlar darhol beriladi, ustuvorlik ishlamaydi (RQ) | Prefetch (19-bob) |
| Quorum'da past ustuvorlik doim yetib boradi deb kutish | Qat'iy ustuvorlik — och qolishi mumkin (RQ) | Alohida navbatlar |
| `priority` siz xabar ikkala turda bir xil deb o'ylash | Classic — 0, quorum — 4 (RQ, sinovda) | Ustuvorlikni aniq berish |

## Amaliyot

1. Ustuvor navbat oddiy navbatdan nimasi bilan farq qiladi?
2. Classic navbatda ustuvorlikni qanday yoqasiz?
3. `priority` berilmagan xabar classic va quorum navbatlarda qanday hisoblanadi?
4. Sinovda quorum navbatda nega D B'dan oldin chiqdi?
5. Ustuvor navbatdan oldin qanday muqobillarni ko'rib chiqish kerak?

<details>
<summary>Javoblar</summary>

1. Xabarlarni kirish tartibi emas, ustuvorligi bo'yicha beradi.
2. E'londa `x-max-priority` argumenti bilan.
3. Classic — 0, quorum — 4.
4. D ustuvorliksiz edi — quorum uni 4 deb oldi, B esa 3.
5. Bir nechta navbat, alohida kanal va prefetch, stream, consumer ustuvorligi.

</details>

## Rasmiy hujjat

- [RQ: Priority Queues](https://www.rabbitmq.com/docs/priority)
- [RQ: Quorum Queues](https://www.rabbitmq.com/docs/quorum-queues) — Message Priorities
