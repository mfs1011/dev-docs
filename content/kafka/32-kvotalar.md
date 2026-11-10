# 32 — Kvotalar va bir nechta jamoa

[Mundarija](README.md)

## Tushuncha

### Nega kvota (KD Design → Quotas)

Producer va consumer'lar juda ko'p ma'lumot yozishi, o'qishi yoki juda tez so'rov yuborishi mumkin. Bunda ular broker resurslarini egallab oladi, tarmoqni to'ldiradi va boshqa klientlar hamda broker'larning o'zini ishlamay qoldiradi (DoS). **Kvota** bundan himoya qiladi. Bir nechta jamoa (tenant) ishlatadigan klasterda bu ayniqsa muhim.

| Kvota turi | Sozlama | Nima |
| --- | --- | --- |
| Tarmoq o'tkazuvchanligi | `producer_byte_rate`, `consumer_byte_rate` | Bayt/soniya chegarasi, **har broker uchun** |
| So'rovlar ulushi | `request_percentage` | I/O va tarmoq oqimlari vaqtining foizi. n% — bitta oqimning n foizi |

### Kimga qo'llanadi

Kvota guruhlari: **user** (autentifikatsiyadan o'tgan principal), **client-id** (ilova o'zi bergan mantiqiy nom) yoki ularning **juftligi**. Ulanishga eng aniq mos keladigan kvota qo'llanadi. Guruhdagi barcha ulanishlar kvotani **bo'lishadi**.

Ustuvorlik (KD):

1. user + client-id;
2. user + standart client-id;
3. user;
4. standart user + client-id;
5. standart user + standart client-id;
6. standart user;
7. client-id;
8. standart client-id.

Standart holatda klientlar kvotasiz (cheksiz).

### Qanday cheklanadi (KD → Enforcement)

Broker cheklovni buzgan klientni kvota ichiga qaytarish uchun zarur **kechikish**ni hisoblaydi. Javob shu kechikish bilan darhol qaytariladi (fetch javobida ma'lumot bo'lmaydi). Broker kechikish davomida kanalni "o'chiradi" va shu klientdan so'rov o'qimaydi. Klient ham shu vaqt so'rov yubormaydi. O'lchov ko'p kichik oynalarda olinadi (masalan, 1 soniyalik 30 ta oyna), shunda buzilish tez aniqlanadi va tuzatiladi.

### Bir nechta jamoa (KD Multi-Tenancy)

| Masala | Kafka vositasi |
| --- | --- |
| Jamoa uchun "nomlar maydoni" | Topic nomi tuzilmasi: `<tashkilot>.<jamoa>.<to'plam>.<hodisa>` yoki `<loyiha>.<mahsulot>.<hodisa>` |
| Nomlash qoidasini majburlash | Prefixed ACL (31-bob), `create.topic.policy.class.name`, topic yaratishni markazlashtirish |
| Avtomatik yaratish | `auto.create.topics.enable=false` — lekin faqat shunga tayanmaslik |
| Saqlash | Topic sozlamalari (5, 8-boblar) |
| Xavfsizlik | TLS, SASL, ACL (30–31-boblar) |
| Resurslarni ajratish | Klient kvotalari; server kvotalari (ulanishlar soni va tezligi) |
| Kuzatish | Monitoring (33-bob) |

KD: topic nomiga vaqt o'tib o'zgaradigan narsa (masalan, consumer nomi) yoki boshqa joyda bor texnik ma'lumot (partition soni) qo'yilmasin. Topic'ni qayta nomlab bo'lmaydi.

## Buyruqlar va kod

VPS'dagi yakka broker. Sinovni client-id kvotasi bilan qilamiz: broker'da autentifikatsiya yo'q, user kvotasi uchun 30-bob sozlamasi kerak bo'lardi. Buyruqlar bir xil, faqat `--entity-type users`.

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic kvota-sinov && bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --add-config 'producer_byte_rate=102400' --entity-type clients --entity-name sekin && bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --add-config 'producer_byte_rate=1048576,consumer_byte_rate=1048576' --entity-type clients --entity-default && bin/kafka-configs.sh --bootstrap-server localhost:9092 --describe --entity-type clients
Created topic kvota-sinov.
Completed updating config for client sekin.
Completed updating default config for clients in the cluster.
Quota configs for the default client-id are consumer_byte_rate=1048576.0, producer_byte_rate=1048576.0
Quota configs for client-id 'sekin' are producer_byte_rate=102400.0
```

`sekin` client-id uchun 100 KB/s (102 400 bayt), qolgan barcha client-id'lar uchun standart 1 MB/s.

### Kvota ishlashi

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-producer-perf-test.sh --topic kvota-sinov --num-records 2000 --record-size 1000 --throughput -1 --bootstrap-server localhost:9092 --command-property client.id=sekin --print-metrics 2>/dev/null | grep -E 'records sent|produce-throttle-time-(avg|max)' | sed -E 's/ +/ /g'
1169 records sent, 204.9 records/sec (0.20 MB/sec), 488.1 ms avg latency, 4440.0 ms max latency.
64 records sent, 11.4 records/sec (0.01 MB/sec), 6261.3 ms avg latency, 10064.0 ms max latency.
2000 records sent, 145.211646 records/sec (0.14 MB/sec), 5173.62 ms avg latency, 12341.00 ms max latency, 504 ms 50th, 12316 ms 95th, 12336 ms 99th, 12341 ms 99.9th.
producer-metrics:produce-throttle-time-avg:{client-id=sekin} : 90.442
producer-metrics:produce-throttle-time-max:{client-id=sekin} : 2157.000
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-producer-perf-test.sh --topic kvota-sinov --num-records 2000 --record-size 1000 --throughput -1 --bootstrap-server localhost:9092 --command-property client.id=boshqa --print-metrics 2>/dev/null | grep -E 'records sent|produce-throttle-time-(avg|max)' | sed -E 's/ +/ /g'
2000 records sent, 661.375661 records/sec (0.63 MB/sec), 652.50 ms avg latency, 1736.00 ms max latency, 680 ms 50th, 889 ms 95th, 898 ms 99th, 906 ms 99.9th.
producer-metrics:produce-throttle-time-avg:{client-id=boshqa} : 0.000
producer-metrics:produce-throttle-time-max:{client-id=boshqa} : 0.000
```

| client-id | Kvota | Tezlik | Throttle (o'rtacha / eng ko'p) |
| --- | --- | --- | --- |
| `sekin` | 100 KB/s | 0.14 MB/s | 90 ms / 2157 ms |
| `boshqa` | 1 MB/s (standart) | 0.63 MB/s | 0 / 0 |

- `sekin` boshida tez yozdi (0.20 MB/s), keyin broker uni kechiktira boshladi (0.01 MB/s, kechikish 10 soniyagacha). O'rtacha natija kvotaga yaqinlashdi. Producer'ning `produce-throttle-time` metrikasi broker qancha kutdirganini ko'rsatadi.
- `boshqa` 1 MB/s chegarasiga yetmadi (bitta CPU'li VPS), shuning uchun cheklanmadi.

### Kvotani olib tashlash

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --delete-config 'producer_byte_rate,consumer_byte_rate' --entity-type clients --entity-default && bin/kafka-producer-perf-test.sh --topic kvota-sinov --num-records 2000 --record-size 1000 --throughput -1 --bootstrap-server localhost:9092 --command-property client.id=boshqa --print-metrics 2>/dev/null | grep -E 'records sent|produce-throttle-time-(avg|max)' | sed -E 's/ +/ /g'
Completed updating default config for clients in the cluster.
2000 records sent, 728.332119 records/sec (0.69 MB/sec), 660.59 ms avg latency, 1326.00 ms max latency, 657 ms 50th, 1019 ms 95th, 1036 ms 99th, 1042 ms 99.9th.
producer-metrics:produce-throttle-time-avg:{client-id=boshqa} : 0.000
producer-metrics:produce-throttle-time-max:{client-id=boshqa} : 0.000
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-configs.sh --bootstrap-server localhost:9092 --alter --delete-config 'producer_byte_rate' --entity-type clients --entity-name sekin && bin/kafka-configs.sh --bootstrap-server localhost:9092 --describe --entity-type clients; bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic kvota-sinov
Completed updating config for client sekin.
```

Standart va `sekin` kvotalari o'chirildi — `--describe` bo'sh, klientlar yana cheksiz.

## Variantlar

| Kerak | Kvota |
| --- | --- |
| Har jamoa (login) uchun | `--entity-type users --entity-name jamoa` |
| Bitta ilova nusxalari uchun | `--entity-type clients --entity-name ilova` |
| Hammaga xavfsiz chegara | `--entity-default` |
| Juda ko'p kichik so'rov yuboradigan klient | `request_percentage` |
| Ulanishlar ko'pligi | Server kvotalari (ulanish soni va tezligi) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Kvotani klaster bo'yicha jami deb hisoblash | Kvota **har broker** uchun (KD) | Broker soniga qarab rejalash |
| Bir client-id'li ko'p nusxaga har biriga kvota deb o'ylash | Guruhdagi ulanishlar kvotani bo'lishadi (KD) | Kerak bo'lsa alohida client-id |
| Kvotasiz ko'p jamoali klaster | Bir jamoa boshqalarni bo'g'ib qo'yadi (KD) | Standart kvota + istisnolar |
| Nomlashni faqat kelishuvga qoldirish | Kimdir qoidadan chetga chiqadi | Prefixed ACL yoki `CreateTopicPolicy` |
| Throttle'ni broker xatosi deb o'ylash | Bu kvota ishlayapti | `produce-throttle-time`, `fetch-throttle-time` metrikalari |

## Amaliyot

1. Kafka'da qanday ikki turdagi klient kvotasi bor?
2. Kvota qaysi guruhlarga qo'llanadi va qaysi biri ustun?
3. Kvotadan oshgan klientga broker qanday javob beradi?
4. Sinovda `sekin` client-id'ning cheklanganini qayerdan bildik?
5. Jamoalarga topic nomlari bo'yicha nomlar maydoni qanday majburlanadi?

<details>
<summary>Javoblar</summary>

1. Tarmoq o'tkazuvchanligi (bayt/soniya) va so'rovlar ulushi (oqim vaqti foizi).
2. user, client-id va (user, client-id); eng aniq mos keladigani — (user, client-id).
3. Kechikishni hisoblab, shu kechikish bilan javob qaytaradi va kanalni shu muddatga o'chiradi.
4. Tezlik pasaydi va `produce-throttle-time-max` 2157 ms bo'ldi.
5. Prefixed ACL, `CreateTopicPolicy` yoki topic yaratishni markazlashtirish bilan.

</details>

## Rasmiy hujjat

- [KD: Design → Quotas](https://kafka.apache.org/44/design/design/)
- [KD: Basic Kafka Operations → Setting quotas](https://kafka.apache.org/44/operations/basic-kafka-operations/)
- [KD: Multi-Tenancy](https://kafka.apache.org/44/operations/multi-tenancy/)
