# 14 — Qaysi asbobni tanlash

[Mundarija](README.md)

## Tushuncha

Uch asbobning har biri o'z hujjatida o'zini tavsiya qiladi. Bu bob har birining **o'z nuqtai nazarini** ko'rsatadi. Oxirida ularni bitta jadvalga yig'amiz — jadval bizniki (⚑).

### Redis nima deydi (RD Job queue, Use cases)

Redis fon ishlari uchun navbatni list, sorted set, stream va pub/sub bilan quradi. Tayyor kutubxonalar: Sidekiq, Celery, Bull/BullMQ, RQ. Sahifa ochiq aytadi: alohida xabar brokerini (RabbitMQ, Kafka, SQS) qo'shish — joylash, kuzatish va pul to'lash kerak bo'lgan **yana bitta infratuzilma**, ko'pincha "ishlarni bir necha qadam uzatish uchungina".

Demak, loyihada Redis **allaqachon bo'lsa** va vazifa oddiy fon ishi bo'lsa, alohida broker shart emas.

### Kafka nima deydi (KD Use Cases)

Kafka o'zini quyidagi holatlar uchun tavsiya qiladi:

| Holat | KD izohi |
| --- | --- |
| Xabar almashish (messaging) | An'anaviy brokerlar o'rnini bosadi. Ko'pchilik xabar tizimlariga qaraganda o'tkazuvchanligi yuqori, partition'lash o'rnatilgan, nusxalanadi va nosozlikka chidamli |
| Sayt faolligini kuzatish | Kafka'ning dastlabki vazifasi: sahifa ko'rishlari va qidiruvlar — har tur uchun alohida topic. Juda katta hajm |
| Metrikalar, loglarni yig'ish | Taqsimlangan ilovalardan ma'lumotni markaziy oqimga yig'ish |
| Oqimni qayta ishlash | Ko'p bosqichli quvurlar: xom ma'lumot topic'dan o'qiladi, boyitiladi, yangi topic'larga yoziladi |
| Event sourcing, commit log | Juda katta saqlangan jurnal; **log compaction** — har kalitning oxirgi qiymatini saqlash |

### RabbitMQ nima deydi (RQ: RabbitMQ vs. Apache Kafka)

Sahifani RabbitMQ jamoasi yozgan va buni o'zi ham ta'kidlaydi ("bear that in mind"). Asosiy fikrlari:

- Eski maslahat — "RabbitMQ — navbat, Kafka — oqim uchun" — endi **ikki tomondan ham eskirgan**. RabbitMQ'da 2021-yildan (3.9) jurnal bor — stream. Kafka'da 4.2 (2026) dan navbat semantikasi bor — share group.
- Farq qolgan joyi — **navbat**. RabbitMQ'da xabar — mustaqil ish birligi. Kafka'da xabar — umumiy jurnaldagi o'rin.
- Share group'lar Kafka'ga ko'p iste'molchi, har xabarni alohida tasdiqlash va urinishlarni sanashni berdi. Lekin RQ ta'kidlaydi: tasdiq xabarni **o'chirmaydi**; xabar bo'yicha TTL, ustuvorlik, kechiktirish va dead-letter yo'naltirish **yo'q**; serverda filtrlash yo'q.
- **Faqat Kafka** (RQ'ning o'zi tan oladi): tiered storage (eski segmentlarni obyekt omboriga chiqarish), log compaction, Flink/Spark/Kafka Connect ekotizimi, Kafka Streams.
- RQ xulosasi: "RabbitMQ'dan boshlang, faqat Kafka qila oladigan narsaga yetganda Kafka qo'shing".

RQ'ning holatlar jadvalidan (qisqartirilgan):

| Holat | RQ tavsiyasi | Sabab (RQ) |
| --- | --- | --- |
| Fon ishlari, ishchilar | RabbitMQ | Har xabar bitta oluvchiga, qayta urinish, dead-letter, ustuvorlik |
| Ustuvorlik, muddat, rejali yetkazish | RabbitMQ | 32 ustuvorlik, xabar TTL'i, kechiktirib yetkazish |
| Xizmatlar orasida RPC | RabbitMQ | Direct reply-to, correlation |
| Yo'qolmasligi shart buyurtma va to'lovlar | RabbitMQ | Quorum navbat tasdiqdan oldin nusxalaydi va diskka yozadi |
| Qayta o'qiladigan oqim, ko'p mustaqil o'quvchi | Ikkalasi | Stream va Kafka topic bir xil ishni bajaradi |
| Faollik kuzatish, metrikalar, loglar | Ikkalasi | Ekotizim va ekspluatatsiyaga qarab |
| Oylab, yillab tarixni arzon saqlash | Kafka | Tiered storage |
| Kalit bo'yicha changelog (event sourcing) | Kafka | Log compaction |

### ⚑ Uchala nuqtai nazar bir jadvalda

| Vaziyat | Tanlov | Kimning manbasidan |
| --- | --- | --- |
| Redis bor, oddiy fon ishi (xat, rasm) | Redis (list yoki stream + kutubxona) | RD |
| Xabar darajasida boshqaruv: TTL, ustuvorlik, kechiktirish, dead-letter, murakkab marshrut | RabbitMQ | RQ |
| Hodisalar tarixini saqlash va qayta o'qish, ko'p mustaqil o'quvchi | RabbitMQ stream yoki Kafka | KD, RQ |
| Juda katta oqim, oqimni qayta ishlash ekotizimi (Flink, Kafka Streams, Connect) | Kafka | KD, RQ |
| Uzoq tarix (tiered storage), log compaction | Kafka | KD, RQ |

Uch asbobning birortasi ham boshqasini "noto'g'ri" demaydi. Har biri o'z kuchli tomonini ko'rsatadi. Qaror — vazifa va **jamoa allaqachon nimani ishlatayotgani**ga qarab. Har yangi tizim — kuzatish, yangilash va himoya qilish kerak bo'lgan yana bir infratuzilma (RD, RQ).

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| "Kafka — oqim, RabbitMQ — navbat" deb tanlash | RQ: eskirgan — ikkalasida ham ikkala model bor | Kerakli imkoniyatlar ro'yxatidan |
| Oddiy fon ishi uchun yangi broker | Yana bitta infratuzilma (RD) | Mavjud Redis yetarli bo'lishi mumkin |
| Bitta xabarni keyinroq qayta urinish kerak, lekin Kafka | RQ: xabar bo'yicha kechiktirish, TTL, dead-letter yo'q | RabbitMQ |
| Yillik tarix kerak, lekin faqat lokal disk | RQ: RabbitMQ stream lokal disk bilan cheklangan | Kafka tiered storage |
| Taqqoslash sahifasini neytral deb o'qish | Har sahifa o'z mahsuloti jamoasi yozgan | Bir nechta manbani solishtirish |

## Amaliyot

1. Redis hujjati alohida broker qo'shishning qanday kamchiligini aytadi?
2. RQ bo'yicha nega "RabbitMQ — navbat, Kafka — oqim" maslahati eskirgan?
3. RQ'ning o'zi tan olgan, faqat Kafka'da bor ikkita imkoniyatni ayting.
4. Yo'qolmasligi shart to'lovlar uchun RQ nimani tavsiya qiladi va nega?

<details>
<summary>Javoblar</summary>

1. Yana bitta infratuzilma: joylash, kuzatish, xarajat.
2. RabbitMQ'da 2021-yildan stream (jurnal), Kafka'da 4.2 dan share group (navbat) bor.
3. Tiered storage, log compaction (shuningdek Kafka Streams va oqimni qayta ishlash ekotizimi).
4. RabbitMQ quorum navbat — u tasdiqlashdan oldin xabarni nusxalaydi va diskka yozadi.

</details>

## Rasmiy hujjat

- [RQ: RabbitMQ vs. Apache Kafka](https://www.rabbitmq.com/docs/compare/kafka)
- [KD: Use Cases](https://kafka.apache.org/44/getting-started/uses/)
- [RD: Use cases](https://redis.io/docs/latest/develop/use-cases/) · [RD: Job queue](https://redis.io/docs/latest/develop/use-cases/job-queue/)
