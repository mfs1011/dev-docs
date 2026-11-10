# 03 — Uch asbob bir qarashda

[Mundarija](README.md)

## Tushuncha

Kitob uch asbobni yonma-yon ko'radi. Ularning har biri 2-bobdagi modellarni o'z tuzilmalari bilan amalga oshiradi. Bu bob — keyingi boblar uchun "lug'at".

### Redis

Redis — xotiradagi ma'lumotlar ombori (Redis kitobi). Xabar uchun uchta tuzilmasi bor:

| Tuzilma | Model | Rasmiy hujjatda |
| --- | --- | --- |
| **List** | Ish navbati | RD Job queue: kutayotgan ishlar ro'yxatda. `LPUSH` — qo'yish, `BLMOVE` (`BRPOPLPUSH`) — ishni olib, bitta amalda "ishlanmoqda" ro'yxatiga ko'chirish. Ishchi qulasa, ish qaytarib olinadi |
| **Stream** | Jurnal + consumer group | RD Streams: faqat oxiriga qo'shiladigan jurnal kabi ishlaydigan tuzilma. Har yozuvga noyob ID beriladi. **Consumer group** — o'qishni bir nechta iste'molchiga bo'lish |
| **Pub/sub** | Pub/sub | RD Pub/sub: kanalga yuborilgan xabar barcha obunachilarga uzatiladi. Yetkazish — at-most-once (xabar saqlanmaydi) |

### RabbitMQ

RabbitMQ — xabar brokeri (RabbitMQ kitobi). RT (AMQP 0-9-1 Model Explained): xabar **exchange**'ga yuboriladi. U xabar nusxalarini **binding** (bog'lash qoidalari) bo'yicha **navbat**larga tarqatadi. Broker xabarni navbatga obuna bo'lgan iste'molchilarga yetkazadi yoki iste'molchi uni o'zi so'rab oladi. Tarmoq ishonchsiz, shuning uchun modelda **tasdiq** (acknowledgement) bor.

| Tuzilma | Model | Izoh |
| --- | --- | --- |
| **Navbat** (classic, quorum) | Ish navbati | **Quorum** navbat — bir nechta tugunda nusxalanadigan (Raft) navbat (RabbitMQ 12-bob) |
| **Exchange** (direct, fanout, topic, headers) | Marshrutlash, pub/sub | Fanout — hammaga; topic — kalit naqshi bo'yicha |
| **Stream** | Jurnal | O'qish xabarni o'chirmaydi (RabbitMQ 23-bob) |

### Kafka

Kafka — hodisalar oqimi platformasi. KD (Introduction):

- **Hodisa** (event, record, message) — "nimadir bo'ldi" degan yozuv: kalit, qiymat, vaqt va ixtiyoriy header'lar.
- **Topic** — hodisalar saqlanadigan joy (fayl tizimidagi papkaga o'xshatiladi). Har doim ko'p yozuvchi va ko'p o'quvchili.
- **Partition** — topic bir nechta "bo'lak"ka bo'lingan, ular turli broker'larda turadi. Shu bilan ko'p broker'dan bir vaqtda o'qish va yozish mumkin. Hodisa partition'lardan biriga **qo'shiladi**; bir xil kalitli hodisalar bir partition'ga tushadi.
- **Tartib kafolati**: topic-partition'ni o'qiydigan har iste'molchi hodisalarni aynan yozilgan tartibda o'qiydi.
- Hodisalar o'qilgandan keyin **o'chirilmaydi** — topic sozlamasidagi muddat saqlanadi.

| Tuzilma | Model | Rasmiy hujjatda (KD Design) |
| --- | --- | --- |
| **Consumer group** | Jurnal + ishni bo'lish | Har partition guruh ichida **aynan bitta** iste'molchiga beriladi; iste'molchining o'rni — bitta son (offset) |
| **Share group** | Ish navbatiga yaqin | Partition **bir nechta** iste'molchiga berilishi mumkin; iste'molchilar soni partition'lardan ko'p bo'lishi mumkin; har yozuv **alohida** tasdiqlanadi; urinishlar sanaladi |

KD: consumer group'lar tartib va kengayishning kuchli birikmasini beradi. Lekin ba'zi an'anaviy xabar yuklamalariga ular mos kelmaydi — share group shuning uchun bor.

### Bir jadvalda

| | Redis | RabbitMQ | Kafka |
| --- | --- | --- | --- |
| Ish navbati | List, stream + consumer group | Navbat (quorum) | Share group |
| Pub/sub | Pub/sub kanal | Fanout/topic exchange | Har guruh o'z nusxasini o'qiydi |
| Jurnal | Stream | Stream | Topic (asosiy model) |
| Saqlash | Xotira (+ diskka saqlash) | Disk (quorum, stream) | Disk, muddat bo'yicha |

⚑ Jadval bizniki: har katakdagi fakt yuqoridagi rasmiy sahifalardan olingan, lekin uchala asbobni bitta jadvalda taqqoslaydigan rasmiy manba yo'q.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Redis pub/sub va stream'ni bir xil deb hisoblash | Pub/sub saqlamaydi, stream saqlaydi (RD) | Ishonchlilik kerak bo'lsa — stream |
| Kafka'da ko'proq iste'molchi — tezroq deb kutish (consumer group) | Har partition guruhda bitta iste'molchiga (KD) | Partition soni yoki share group |
| RabbitMQ'da xabar to'g'ridan-to'g'ri navbatga yuboriladi deb o'ylash | Xabar exchange'ga yuboriladi, binding navbatni tanlaydi (RT) | Exchange va binding'ni loyihalash |
| Kafka'da butun topic bo'yicha tartib kutish | Tartib partition ichida (KD) | Tartib kerak hodisalarga bir xil kalit |

## Amaliyot

1. Redis'ning xabar uchun uchta tuzilmasi qaysilar?
2. RabbitMQ'da xabar navbatga qanday yetib boradi?
3. Kafka partition nima uchun kerak va tartib qayerda kafolatlanadi?
4. Consumer group va share group'ning asosiy farqi nima?

<details>
<summary>Javoblar</summary>

1. List, stream, pub/sub.
2. Exchange'ga yuboriladi, exchange binding'lar bo'yicha navbatlarga tarqatadi.
3. Ko'p broker'dan bir vaqtda o'qish va yozish uchun; tartib — har partition ichida.
4. Consumer group'da har partition guruhda bitta iste'molchiga beriladi; share group'da partition bir nechta iste'molchiga berilishi mumkin va yozuvlar alohida tasdiqlanadi.

</details>

## Rasmiy hujjat

- [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/) · [RD: Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/) · [RD: Pub/sub](https://redis.io/docs/latest/develop/pubsub/)
- [RT: AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts)
- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/) · [KD: Design](https://kafka.apache.org/44/design/design/)
