# 04 — Yetkazish kafolatlari

[Mundarija](README.md)

## Tushuncha

Tarmoq uziladi, consumer o'chadi, server qayta ishga tushadi. Shunday paytda xabar bilan nima bo'lishini **yetkazish kafolati** (delivery semantics) belgilaydi. KD (Design → Message Delivery Semantics) uchtasini ta'riflaydi:

| Kafolat | Ma'nosi | Nosozlikda |
| --- | --- | --- |
| **Ko'pi bilan bir marta** (at-most-once) | Xabar yo'qolishi mumkin, lekin qayta yetkazilmaydi | Yo'qoladi |
| **Kamida bir marta** (at-least-once) | Xabar yo'qolmaydi, lekin qayta yetkazilishi mumkin | Takrorlanadi (7-bob) |
| **Aynan bir marta** (exactly-once) | Har xabar bir marta va faqat bir marta ishlanadi | — |

KD ogohlantiradi: ko'p tizimlar "exactly-once" deydi, lekin mayda shriftni o'qish kerak. Bu da'volar ko'pincha consumer yoki producer ishdan chiqqan, bir nechta consumer jarayoni bo'lgan yoki diskka yozilgan ma'lumot yo'qolgan holatlarda ishlamaydi.

Kafolat **ikki tomonli**:

- yuboruvchi tomoni — broker xabarni haqiqatan saqladimi (6-bob);
- qabul qiluvchi tomoni — xabar qachon "ishlangan" hisoblanadi (5-bob).

### Qabul qiluvchida kafolat qayerdan keladi

Hal qiluvchi savol — **"ishlandi" belgisi ishdan oldin qo'yiladimi yoki keyin**:

- **Belgi oldin** (o'qidi → belgi qo'ydi → ishladi): ishlash paytida o'chsa, xabar yo'qoladi — **at-most-once**.
- **Belgi keyin** (o'qidi → ishladi → belgi qo'ydi): belgidan oldin o'chsa, xabar qayta keladi — **at-least-once**.

KD Kafka consumer'i uchun xuddi shu ikki variantni tasvirlaydi: pozitsiyani (offset) ishlovdan oldin yoki keyin saqlash.

### Uch tizimda (rasmiy hujjatlar)

| Tizim | At-most-once | At-least-once | Exactly-once |
| --- | --- | --- | --- |
| **Redis** pub/sub | ✅ Faqat shu. Obunachi xabarni ishlay olmasa (xato, uzilish), xabar **butunlay yo'qoladi** (RD) | — | — |
| **Redis** stream | ✅ (`NOACK`) | ✅ (`XACK` gacha xabar "kutilayotgan" ro'yxatida) (RD) | — |
| **RabbitMQ** | Tasdiqsiz (automatic ack) | Tasdiq bilan. RQ: "Tasdiqlardan foydalanish at-least-once'ni kafolatlaydi. Tasdiqlarsiz yuborish va o'qishda xabar yo'qolishi mumkin" | — |
| **Kafka** | Offset'ni ishlovdan oldin commit qilish, producer'da qayta urinishni o'chirish (KD) | **Standart** (KD) | Kafka topic'idan o'qib, Kafka topic'iga yozishda: tranzaksiyali producer + `read_committed` consumer yoki Kafka Streams. Tashqi tizim uchun — o'sha tizimning hamkorligi kerak (KD) |

RQ: tasdiq — xabarni olish va **egalikni o'tkazish** belgisi. Shuning uchun ilova xabarni kerakli ishni bajarmaguncha (bazaga yozish, uzatish) tasdiqlamasligi kerak.

## Uch tizimda

VPS'da: Redis 8.10, RabbitMQ 4.4, Kafka 4.4 (Docker).

### Redis pub/sub: obunachi yo'q — xabar yo'q

```text vps
$ redis-cli PUBLISH buyurtmalar "buyurtma #1"
0
```

`PUBLISH` qaytargan `0` — xabarni olgan obunachilar soni. Hech kim tinglamagan, xabar hech qayerda saqlanmadi.

### Redis stream: XACK gacha "kutilayotgan"

```text vps
$ redis-cli XADD kafolat '*' buyurtma 1 >/dev/null; redis-cli XGROUP CREATE kafolat ishchilar 0; echo "ishchi-1 oldi: $(redis-cli XREADGROUP GROUP ishchilar ishchi-1 COUNT 1 STREAMS kafolat '>' | tail -2 | tr '\n' ' ')"; echo "tasdiqlanmagan (XPENDING): $(redis-cli XPENDING kafolat ishchilar | head -1)"
OK
ishchi-1 oldi: buyurtma 1 
tasdiqlanmagan (XPENDING): 1
$ echo "ishchi-2 qayta oldi (XAUTOCLAIM): $(redis-cli XAUTOCLAIM kafolat ishchilar ishchi-2 0 0 COUNT 1 | sed -n '3,4p' | tr '\n' ' ')"; echo "XACK: $(redis-cli XACK kafolat ishchilar $(redis-cli XRANGE kafolat - + | head -1))"; echo "tasdiqlanmagan: $(redis-cli XPENDING kafolat ishchilar | head -1)"
ishchi-2 qayta oldi (XAUTOCLAIM): buyurtma 1 
XACK: 1
tasdiqlanmagan: 0
$ redis-cli XADD kafolat '*' buyurtma 2 >/dev/null; echo "NOACK bilan oldi: $(redis-cli XREADGROUP GROUP ishchilar ishchi-1 COUNT 1 NOACK STREAMS kafolat '>' | tail -2 | tr '\n' ' ')"; echo "tasdiqlanmagan: $(redis-cli XPENDING kafolat ishchilar | head -1)"; redis-cli DEL kafolat >/dev/null
NOACK bilan oldi: buyurtma 2 
tasdiqlanmagan: 0
```

- `ishchi-1` xabarni oldi, lekin `XACK` qilmadi (o'chdi deb faraz qilamiz). Xabar **kutilayotganlar ro'yxatida** (PEL) qoldi.
- `ishchi-2` uni `XAUTOCLAIM` bilan oldi, ishladi va `XACK` qildi — ro'yxat bo'shadi. Bu **at-least-once**.
- `NOACK` bilan o'qilgan xabar ro'yxatga umuman tushmaydi: o'quvchi o'chsa, xabar qayta berilmaydi — **at-most-once**.

### RabbitMQ: tasdiq va qayta yetkazish

```text vps
$ rabbitmqadmin queues declare --name kafolat --durable true >/dev/null; rabbitmqadmin publish message --routing-key kafolat --payload "buyurtma #1"; for m in ack_requeue_true ack_requeue_false ack_requeue_false; do printf '%-18s ' "$m:"; rabbitmqadmin --non-interactive get messages --queue kafolat --ack-mode $m | awk 'NF{n++; print "xabar: "$5" "$6", redelivered="$2", navbatda qoldi="$4} END{if(!n) print "navbat bo`sh"}'; done; rabbitmqadmin queues delete --name kafolat
Message published and routed successfully
ack_requeue_true:  xabar: buyurtma #1, redelivered=false, navbatda qoldi=0
ack_requeue_false: xabar: buyurtma #1, redelivered=true, navbatda qoldi=0
ack_requeue_false: navbat bo`sh
```

`rabbitmqadmin get` bilan uch holat:

1. `ack_requeue_true` — xabar olindi, lekin tasdiqlanmay navbatga qaytarildi. Tasdiqlamay uzilgan consumer bilan ham shunday bo'ladi.
2. Keyingi o'qishda o'sha xabar `redelivered=true` belgisi bilan keldi — broker uni avval yetkazganini bildiradi (7-bob). Bu safar `ack_requeue_false` — tasdiqlandi va navbatdan o'chdi.
3. Navbat bo'sh.

Agar consumer tasdiqni **avtomatik** (yetkazilishi bilan) bersa, 1-qadamdagi xabar navbatdan darhol o'chgan bo'lardi — at-most-once.

### Kafka: offset commit qachon

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic kafolat >/dev/null; echo "buyurtma #1" | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --bootstrap-server localhost:9092 --topic kafolat; K="docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic kafolat --from-beginning --max-messages 1 --timeout-ms 15000"; for i in 1 2; do echo "commit'siz, $i-marta: $($K --group qayta --command-property enable.auto.commit=false 2>/dev/null)"; done; for i in 1 2; do echo "avto-commit, $i-marta: $($K --group avto 2>/dev/null)"; done
commit'siz, 1-marta: buyurtma #1
commit'siz, 2-marta: buyurtma #1
avto-commit, 1-marta: buyurtma #1
avto-commit, 2-marta: 
$ for g in qayta avto; do echo "$g: commit qilingan offset = $(docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group $g 2>/dev/null | awk '$2=="kafolat"{print $4} END{if(NR<2) print "yo`q"}')"; done; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic kafolat; for g in qayta avto; do docker exec kafka /opt/kafka/bin/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group $g >/dev/null 2>&1; done
qayta: commit qilingan offset = yo`q
avto: commit qilingan offset = 1
```

- `qayta` guruhi `enable.auto.commit=false` bilan o'qidi va offset'ni commit qilmadi. Ikkinchi ishga tushishda o'sha xabarni **yana** oldi — at-least-once'dagi takror.
- `avto` guruhi standart avtomatik commit bilan o'qidi, yopilishda offset 1 commit qilindi. Ikkinchi marta hech narsa kelmadi. Agar ilova xabarni ishlashdan **oldin** commit qilib, keyin o'chsa, xabar yo'qolardi — at-most-once.
- Exactly-once misoli (tranzaksiya + `read_committed`) — Kafka kitobining 13-bobida.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Redis pub/sub'ni muhim xabarlar uchun | At-most-once: obunachi yo'q yoki uzilgan bo'lsa yo'qoladi (RD, sinovda `0`) | Redis stream yoki broker navbati |
| Xabarni ish tugamasdan tasdiqlash | Ish paytida o'chsa xabar yo'qoladi (RQ) | Ishdan keyin ack/commit |
| At-least-once tanlab, takrorga tayyorlanmaslik | Xabar qayta keladi (sinovda) | Idempotent consumer (7-bob) |
| "Exactly-once" ni har qanday tizimga tatbiq etish | Kafka'da faqat Kafka → Kafka uchun; tashqi tizim hamkorligi kerak (KD) | Idempotentlik yoki natija bilan birga offset saqlash |
| Faqat consumer tomonini o'ylash | Kafolat yuboruvchidan ham boshlanadi (KD) | Publisher confirms, `acks` (6-bob) |

## Amaliyot

1. Uch yetkazish kafolatini ta'riflang.
2. Consumer'da at-most-once va at-least-once'ni nima ajratadi?
3. Sinovda Redis `PUBLISH` nega `0` qaytardi va bu nimani anglatadi?
4. RabbitMQ'da `redelivered=true` qachon chiqdi?
5. Kafka'da exactly-once qaysi holat uchun mavjud?

<details>
<summary>Javoblar</summary>

1. At-most-once — yo'qolishi mumkin, takrorlanmaydi; at-least-once — yo'qolmaydi, takrorlanishi mumkin; exactly-once — bir marta va faqat bir marta ishlanadi.
2. "Ishlandi" belgisi (ack, offset commit, XACK) ishdan oldin qo'yiladimi yoki keyin.
3. Obunachi yo'q edi; pub/sub xabarni saqlamaydi — u yo'qoldi.
4. Tasdiqlanmay navbatga qaytgan xabar qayta yetkazilganda.
5. Kafka topic'idan o'qib Kafka topic'iga yozishda (tranzaksiyalar, `read_committed`, Kafka Streams).

</details>

## Rasmiy hujjat

- [KD: Design → Message Delivery Semantics](https://kafka.apache.org/44/design/design/)
- [RQ: Reliability Guide](https://www.rabbitmq.com/docs/reliability) — Acknowledgements and Confirms
- [RD: Redis Pub/sub](https://redis.io/docs/latest/develop/pubsub/) — Delivery semantics
- [RD: Redis Streams](https://redis.io/docs/latest/develop/data-types/streams/) · [RD: XREADGROUP](https://redis.io/docs/latest/commands/xreadgroup/) — Pending Entries List, `NOACK`
