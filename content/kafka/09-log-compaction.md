# 09 — Log compaction

[Mundarija](README.md)

## Tushuncha

8-bobdagi saqlash vaqt yoki hajm bo'yicha ishlaydi. Bu loglar kabi har yozuvi mustaqil hodisalar uchun yaxshi. Lekin muhim bir tur — **kalitli, o'zgaruvchan ma'lumotning o'zgarishlar jurnali**. Masalan, bazadagi jadval o'zgarishlari.

KD (Design → Log Compaction) misoli: foydalanuvchi email'ini o'zgartirganda, foydalanuvchi ID'si kalit qilib yoziladi:

```text
123 => bill@microsoft.com
123 => bill@gatesfoundation.org
123 => bill@gmail.com
```

**Log compaction** har kalitning **kamida oxirgi qiymati** saqlanishini kafolatlaydi (`bill@gmail.com`). Natijada log faqat yaqinda o'zgargan kalitlarni emas, **barcha** kalitlarning yakuniy qiymatini saqlaydi. Consumer o'z holatini shu topic'dan to'liq tiklay oladi — butun tarixni saqlash shart emas.

### Qayerda kerak (KD)

- **Bazadagi o'zgarishlarga obuna**: bitta ma'lumot kesh, qidiruv tizimi va boshqa joylarga yetkazilishi.
- **Event sourcing**: o'zgarishlar jurnali ilovaning asosiy ombori.
- **Yuqori mavjudlik uchun jurnal**: jarayon o'z lokal holati o'zgarishlarini yozadi; u qulasa, boshqa jarayon holatni tiklab davom etadi (Kafka Streams buni ishlatadi, 28-bob).

### Qanday ishlaydi (KD)

| Qoida | Ma'nosi |
| --- | --- |
| Log **boshi** (head) | Odatiy log: zich, ketma-ket offset'lar, hamma xabar bor |
| Log **dumi** (tail) | Siqilgan: eski qiymatlar olib tashlangan |
| **Offset** | Hech qachon o'zgarmaydi — siqilgandan keyin ham asl offset qoladi (oraliqlar paydo bo'ladi) |
| **Tartib** | Saqlanadi: compaction faqat olib tashlaydi, joyini o'zgartirmaydi |
| **Faol segment** | Hech qachon siqilmaydi. Yozuv faqat segment yopilgandan keyin siqilishi mumkin |
| **Tombstone** | Kaliti bor, qiymati `null` xabar — **o'chirish belgisi**. O'sha kalitning oldingi qiymatlarini o'chiradi. Keyin `delete.retention.ms` (standart 1 kun) o'tgach o'zi ham tozalanadi |
| Fon jarayoni | Log cleaner segmentlarni qayta nusxalaydi. O'qishni to'smaydi |

Sozlamalar: `cleanup.policy=compact`, `min.cleanable.dirty.ratio` (standart 0.5 — log qanchalik "iflos" bo'lganda tozalanadi), `min.compaction.lag.ms`, `max.compaction.lag.ms`, `segment.ms`.

## Buyruqlar va kod

VPS'da. Tez ko'rish uchun: segment 10 soniyada yopiladi (`segment.ms=10000`), kichik iflos ulushda ham tozalanadi (`min.cleanable.dirty.ratio=0.01`), tombstone 1 daqiqa saqlanadi (`delete.retention.ms=60000`). Qiymati `NULL` qatori — tombstone (`null.marker`):

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic emaillar --config cleanup.policy=compact --config segment.ms=10000 --config min.cleanable.dirty.ratio=0.01 --config delete.retention.ms=60000
Created topic emaillar.
$ printf '123:bill@microsoft.com\n456:ali@kamgapir.uz\n123:bill@gatesfoundation.org\n789:vali@kamgapir.uz\n123:bill@gmail.com\n789:NULL\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic emaillar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=: --reader-property null.marker=NULL
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic emaillar --from-beginning --bootstrap-server localhost:9092 --max-messages 6 --formatter-property print.key=true --formatter-property print.offset=true 2>&1 | grep -v KIP-848
Offset:0	123	bill@microsoft.com
Offset:1	456	ali@kamgapir.uz
Offset:2	123	bill@gatesfoundation.org
Offset:3	789	vali@kamgapir.uz
Offset:4	123	bill@gmail.com
Offset:5	789	null
Processed a total of 6 messages
```

Hozircha hamma 6 xabar bor: hammasi faol segmentda, siqilmagan.

### Segment yopilgandan keyin

```text vps
$ sleep 12; printf 'zzz:segmentni-yopish\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic emaillar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:; sleep 40; docker exec kafka sh -c 'ls /tmp/kraft-combined-logs/emaillar-0/ | grep "\.log"'
00000000000000000000.log
00000000000000000000.log.deleted
00000000000000000006.log
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic emaillar --from-beginning --bootstrap-server localhost:9092 --timeout-ms 5000 --formatter-property print.key=true --formatter-property print.offset=true 2>&1 | grep -E '^Offset|Processed'
Offset:1	456	ali@kamgapir.uz
Offset:4	123	bill@gmail.com
Offset:5	789	null
Offset:6	zzz	segmentni-yopish
Processed a total of 4 messages
```

- 12 soniyadan keyingi xabar faol segmentni yopdi (yangi `…0006.log`). Tozalovchi eski segmentni qayta yozdi: eski fayl `.deleted` bo'ldi.
- Natija:
  - `123` ning faqat oxirgi qiymati qoldi (`bill@gmail.com`, offset 4);
  - `456` qoldi;
  - `789` — oldingi qiymati o'chdi, faqat tombstone (`null`) qoldi.
- Offset'lar o'zgarmadi: 1, 4, 5, 6 — 0, 2, 3 o'rni bo'sh.

### Tombstone ham ketadi

```text vps
$ sleep 50; printf 'yyy:yana-bir\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic emaillar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:; sleep 15; printf 'xxx:yana-ikki\n' | docker exec -i kafka /opt/kafka/bin/kafka-console-producer.sh --topic emaillar --bootstrap-server localhost:9092 --reader-property parse.key=true --reader-property key.separator=:; sleep 45; echo "tombstone yozilganiga ~3 daqiqa bo'ldi"
tombstone yozilganiga ~3 daqiqa bo'ldi
$ docker exec kafka /opt/kafka/bin/kafka-console-consumer.sh --topic emaillar --from-beginning --bootstrap-server localhost:9092 --timeout-ms 5000 --formatter-property print.key=true --formatter-property print.offset=true 2>&1 | grep -E '^Offset|Processed'
Offset:1	456	ali@kamgapir.uz
Offset:4	123	bill@gmail.com
Offset:6	zzz	segmentni-yopish
Offset:7	yyy	yana-bir
Offset:8	xxx	yana-ikki
Processed a total of 5 messages
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic emaillar
```

`delete.retention.ms` (1 daqiqa) o'tgach va yana bir tozalashdan keyin tombstone (offset 5) ham yo'qoldi. `789` kaliti endi umuman yo'q.

KD kafolati: log boshidan o'qiyotgan consumer `delete.retention.ms` ichida log boshiga yetib olsa, o'chirish belgilarini ham ko'radi. Sekinroq consumer o'chirilgan kalitning tombstone'ini ko'rmay qolishi mumkin.

## Variantlar

| Kerak | `cleanup.policy` |
| --- | --- |
| Hodisalar (log, kliklar) — muddat bo'yicha | `delete` |
| Har kalitning oxirgi holati (jadval, sozlamalar, kesh) | `compact` |
| Oxirgi holat, lekin juda eskisi baribir o'chsin | `delete,compact` |
| Yangi yozuvlar biroz vaqt siqilmasin | `min.compaction.lag.ms` |
| Kam yoziladigan topic ham albatta siqilsin | `max.compaction.lag.ms` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kalitsiz xabarlarni compact topic'ga yozish | Compaction kalit bo'yicha ishlaydi | Har xabarda kalit |
| Compaction darhol ishlaydi deb kutish | Faol segment siqilmaydi, tozalash fonda (KD, sinovda) | `segment.ms`, `max.compaction.lag.ms` |
| "Faqat oxirgi qiymat bor" deb hisoblash | Kafolat — **kamida** oxirgisi; siqilmagan boshda hammasi bor (KD) | Consumer barcha qiymatga tayyor bo'lsin |
| Tombstone'ni darhol yo'qoladi deb kutish | `delete.retention.ms` saqlanadi (KD) | Sekin consumer'larni hisobga olish |
| Offset'lar ketma-ket deb kutish | Siqilgandan keyin oraliqlar bor (sinovda) | Offset — o'rin, son emas |

## Amaliyot

1. Log compaction nimani kafolatlaydi?
2. Tombstone nima va u qachon yo'qoladi?
3. Sinovda nega birinchi o'qishda hamma 6 xabar bor edi?
4. Siqilgandan keyin offset'lar bilan nima bo'ldi?
5. Compaction qaysi holatlarda kerak?

<details>
<summary>Javoblar</summary>

1. Har kalitning kamida oxirgi qiymati saqlanishini.
2. Qiymati `null` kalitli xabar — o'chirish belgisi; `delete.retention.ms` o'tgach tozalanadi.
3. Hammasi faol segmentda edi — u siqilmaydi.
4. O'zgarmadi; olib tashlangan xabarlar o'rnida oraliq qoldi.
5. Bazadagi o'zgarishlarga obuna, event sourcing, holatni tiklash uchun jurnal.

</details>

## Rasmiy hujjat

- [KD: Design → Log Compaction](https://kafka.apache.org/44/design/design/)
- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `cleanup.policy`, `delete.retention.ms`, `min.cleanable.dirty.ratio`, `min.compaction.lag.ms`, `segment.ms`
