# 01 — Xabar brokeri nima

[Mundarija](README.md)

## Tushuncha

RT (AMQP 0-9-1 Model Explained): **xabar brokeri** (message broker) — ilovalardan xabarlarni qabul qilib, ularni kerakli ilovalarga yetkazadigan server. Xabarni yuboradigan ilova — **publisher** (producer — ishlab chiqaruvchi), uni qayta ishlaydigan ilova — **consumer** (iste'molchi). Bu tarmoq protokoli bo'lgani uchun publisher, consumer va broker turli mashinalarda bo'lishi mumkin.

RabbitMQ — shunday broker. Uning asosiy ("core") protokoli — **AMQP 0-9-1** (Advanced Message Queuing Protocol): mos klient ilovalarining mos broker bilan gaplashish qoidalari.

### AMQP 0-9-1 modeli

RT: xabarlar **exchange**'ga yuboriladi (uni ko'pincha pochta bo'limi yoki pochta qutisiga o'xshatishadi). Exchange xabar nusxalarini **binding** (bog'lanish) deb ataladigan qoidalar bo'yicha **navbat**larga (queue) tarqatadi. Keyin broker xabarlarni navbatga obuna bo'lgan consumer'larga yetkazadi yoki consumer'lar ularni o'zi so'rab oladi.

```text
publisher ──▶ exchange ──binding──▶ navbat ──▶ consumer
                  │
                  └────binding──▶ navbat ──▶ consumer
```

| Tushuncha | Nima (RT) | Bob |
| --- | --- | --- |
| **Exchange** | Xabar yuboriladigan joy; uni nol yoki undan ko'p navbatga yo'naltiradi. Algoritm exchange turiga va binding'larga bog'liq | 6–8, 10 |
| **Navbat** (queue) | Xabarlar consumer olguncha saqlanadigan joy | 11–17 |
| **Binding** | Exchange'dan navbatga xabar qaysi qoida bo'yicha o'tishi | 6 |
| **Xabar atributlari** | Xabarga qo'shiladigan metama'lumot; bir qismini broker ishlatadi, qolganini faqat qabul qiluvchi ilova | 13, 16 |
| **Tasdiq** (acknowledgement) | Consumer xabarni qayta ishlaganini brokerga bildiradi; tasdiqdan keyingina broker xabarni navbatdan butunlay o'chiradi | 18 |

Navbatlar, exchange'lar va binding'lar birgalikda **AMQP obyektlari** (entities) deyiladi.

RT: tarmoq ishonchsiz va ilovalar xabarni qayta ishlay olmasligi mumkin — tasdiqlar shuning uchun kerak. Xabarni hech qayerga yo'naltirib bo'lmasa, u publisher'ga **qaytarilishi**, **tashlab yuborilishi** yoki (kengaytma bilan) **dead letter** navbatga qo'yilishi mumkin (15-bob). Qaysi biri bo'lishini publisher yuborish parametrlari bilan tanlaydi.

### Exchange turlari

RT: AMQP 0-9-1 brokerida to'rt tur bor:

| Tur | Oldindan e'lon qilingan nomlar | Bob |
| --- | --- | --- |
| Direct | `""` (bo'sh satr — standart exchange) va `amq.direct` | 3, 6, 8 |
| Fanout | `amq.fanout` | 7 |
| Topic | `amq.topic` | 8 |
| Headers | `amq.match` (RabbitMQ'da `amq.headers` ham) | 6 |

### Dasturlanadigan protokol

RT: AMQP 0-9-1 — **dasturlanadigan** protokol: navbat, exchange va binding'larni broker administratori emas, asosan **ilovalarning o'zi** e'lon qiladi. Bu dasturchiga katta erkinlik beradi, lekin e'lonlar orasidagi ziddiyatlardan xabardor bo'lishni talab qiladi (amalda kam uchraydi va odatda sozlash xatosini bildiradi).

### Ulanish, kanal, virtual host

| Tushuncha | Nima (RT) | Bob |
| --- | --- | --- |
| **Ulanish** (connection) | Klientdan brokerga odatda uzoq yashaydigan TCP ulanish; autentifikatsiya, TLS bilan himoyalash mumkin | 22 |
| **Kanal** (channel) | Bitta TCP ulanishni baham ko'radigan yengil ulanish; har protokol amali kanalda bajariladi, ulanish yopilsa kanallari ham yopiladi | 22 |
| **Virtual host** (vhost) | Bitta broker ichida alohida muhit: o'z navbatlari, exchange'lari va ruxsatlari | 25 |

### RabbitMQ qo'llaydigan protokollar

RQ (Supported Protocols):

| Protokol | Nima (RQ) | Bu kitobda |
| --- | --- | --- |
| **AMQP 0-9-1** | Birinchi "core" protokol; ikkilik (binary), kuchli xabar semantikasi, ko'p tilda klient kutubxonalari. Rasmiy qo'llanmalar shu protokolda | Asosiy |
| **AMQP 1.0** | Zamonaviyroq, ISO/IEC 19464 va OASIS standarti. Nomiga qaramay AMQP 0-9-1 dan butunlay boshqa protokol — tarmoq darajasida umumiy narsasi yo'q. RabbitMQ 4.0 dan "core" protokol | — |
| **RabbitMQ Streams** | Stream'lar bilan juda yuqori o'tkazuvchanlikda ishlash; plagin orqali | 23–24 |
| **MQTT** | Cheklangan qurilmalar uchun yengil publish/subscribe; 3.1, 3.1.1, 5.0 — plagin | — |
| **STOMP** | Matnli, juda sodda protokol; plagin | — |
| **WebSocket** | Brauzerdan: AMQP 1.0, MQTT yoki STOMP — WebSocket orqali | — |
| HTTP | Boshqaruv plaginining HTTP API'si orqali — asosan diagnostika uchun, ishonchli yetkazishsiz | 4 |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Xabar to'g'ridan-to'g'ri navbatga yuboriladi deb o'ylash | AMQP 0-9-1 da xabar doim exchange'ga yuboriladi (RT) | Navbat nomi bilan yuborish — standart exchange orqali (3-bob) |
| Xabar consumer'ga berilishi bilan o'chadi deb o'ylash | Tasdiqlar yoqilgan bo'lsa, tasdiqdan keyin o'chadi (RT) | 18-bob |
| AMQP 1.0 ni 0-9-1 ning yangi versiyasi deb hisoblash | Butunlay boshqa protokol (RQ) | Klient kutubxonasi qaysi protokolni ishlatishini bilish |
| Navbat/exchange'ni faqat admin yaratadi deb kutish | Odatda ilova e'lon qiladi (RT) | Ilova kodida e'lon qilish |

## Amaliyot

1. Publisher, exchange, navbat va consumer orasidagi yo'l qanday?
2. Binding nima?
3. Nega xabar tasdiqlari kerak?
4. AMQP 0-9-1 da qanday exchange turlari bor?
5. AMQP 1.0 AMQP 0-9-1 ning yangi versiyasimi?
6. "Dasturlanadigan protokol" nimani anglatadi?

<details>
<summary>Javoblar</summary>

1. Publisher → exchange → (binding qoidalari) → navbat → consumer.
2. Exchange'dan navbatga xabar o'tish qoidasi.
3. Tarmoq va ilovalar ishonchsiz; broker xabarni faqat tasdiqdan keyin butunlay o'chiradi.
4. Direct, fanout, topic, headers.
5. Yo'q — tarmoq darajasida butunlay boshqa protokol.
6. Navbat, exchange va binding'larni asosan ilovaning o'zi e'lon qiladi.

</details>

## Rasmiy hujjat

- [RT: AMQP 0-9-1 Model Explained](https://www.rabbitmq.com/tutorials/amqp-concepts)
- [RQ: Supported Protocols](https://www.rabbitmq.com/docs/protocols)
