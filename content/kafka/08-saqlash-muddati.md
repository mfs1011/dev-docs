# 08 — Saqlash muddati

[Mundarija](README.md)

## Tushuncha

KD (Introduction): Kafka'da hodisa **o'qilgani uchun emas**, saqlash muddati tugagani uchun o'chiriladi. Har topic uchun hodisalar qancha saqlanishi belgilanadi, keyin eskilari tashlanadi. Kafka unumdorligi ma'lumot hajmiga deyarli bog'liq emas, shuning uchun uzoq saqlash muammo emas.

### Qoida (KD Implementation → Log, Deletes)

Ma'lumot **segment-segment** o'chiriladi. Ikki mezon bor:

| Mezon | Sozlama (topic / server standarti) | Standart | KD izohi |
| --- | --- | --- | --- |
| **Vaqt** | `retention.ms` / `log.retention.hours` | 7 kun | Segmentdagi **eng katta** vaqt belgisi butun segmentning muddatini belgilaydi. `-1` — vaqt chegarasi yo'q. Shart bajarilsa, yangi segment ham ochiladi |
| **Hajm** | `retention.bytes` / `log.retention.bytes` | `-1` (chegarasiz) | **Partition** darajasida: topic uchun partition soniga ko'paytiriladi |

Ikkalasi yoqilgan bo'lsa, istalgan biri bo'yicha muddati o'tgan segment o'chiriladi.

- `cleanup.policy` — `delete` (standart): eski segmentlar tashlanadi. `compact` — 9-bob. `delete,compact` — ikkalasi.
- `segment.bytes`, `segment.ms` — segment qachon yopiladi. Saqlash va tozalash **fayl bo'yicha** bajariladi: katta segment — kamroq fayl, lekin saqlash ustidan qo'polroq nazorat.
- Tekshiruv **davriy**: server sozlamasi `log.retention.check.interval.ms` (pastda — 300000, ya'ni 5 daqiqa).

## Buyruqlar va kod

VPS'da. Server standartlari:

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-configs.sh --bootstrap-server localhost:9092 --entity-type brokers --entity-name 1 --describe --all | grep -E ' log.retention.(ms|hours|bytes|check.interval.ms)=| log.segment.bytes=' | sed 's/^ *//; s/ sensitive=.*//'
log.retention.bytes=-1
log.retention.check.interval.ms=300000
log.retention.hours=168
log.retention.ms=null
log.segment.bytes=1073741824
```

### Vaqt bo'yicha

Topic: segment 1 MiB, `retention.ms=60000` (1 daqiqa). 3000 × 1000 bayt:

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic muddat --config segment.bytes=1048576 --config retention.ms=60000; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic muddat --num-records 3000 --record-size 1000 --throughput -1 --command-property bootstrap.servers=localhost:9092 >/dev/null 2>&1; echo "$(date +%T) 3000 xabar yozildi"
Created topic muddat.
10:57:52 3000 xabar yozildi
$ docker exec kafka sh -c 'ls /tmp/kraft-combined-logs/muddat-0/*.log | xargs -n1 basename'; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic muddat --time -2
00000000000000000000.log
00000000000000001031.log
00000000000000002055.log
muddat:0:0
$ for i in $(seq 1 16); do sleep 30; E=$(docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic muddat --time -2); echo "$(date +%T) eng birinchi offset: $E"; [ "$E" != "muddat:0:0" ] && break; done
10:58:34 eng birinchi offset: muddat:0:0
10:59:09 eng birinchi offset: muddat:0:0
10:59:45 eng birinchi offset: muddat:0:3000
$ docker exec kafka sh -c 'ls /tmp/kraft-combined-logs/muddat-0/ | grep -E "\.log|deleted"'; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic muddat
00000000000000000000.index.deleted
00000000000000000000.log.deleted
00000000000000000000.timeindex.deleted
00000000000000001031.index.deleted
00000000000000001031.log.deleted
00000000000000001031.snapshot.deleted
00000000000000001031.timeindex.deleted
00000000000000002055.index.deleted
00000000000000002055.log.deleted
00000000000000002055.snapshot.deleted
00000000000000002055.timeindex.deleted
00000000000000003000.log
muddat:0:3000
$ docker logs kafka 2>&1 | grep -E 'muddat-0.*(retention|Deleting segment|Scheduling)' | tail -3 | sed 's/^\[[^]]*\] //' | cut -c1-220
INFO [UnifiedLog partition=muddat-0, dir=/tmp/kraft-combined-logs] Deleting segment LogSegment(baseOffset=0, size=1044244, lastModifiedTime=1794297471270, largestRecordTimestamp=1794297470810) due to log retention time 6
INFO [UnifiedLog partition=muddat-0, dir=/tmp/kraft-combined-logs] Deleting segment LogSegment(baseOffset=1031, size=1037120, lastModifiedTime=1794297471616, largestRecordTimestamp=1794297471036) due to log retention tim
INFO [UnifiedLog partition=muddat-0, dir=/tmp/kraft-combined-logs] Deleting segment LogSegment(baseOffset=2055, size=957165, lastModifiedTime=1794297471946, largestRecordTimestamp=1794297471099) due to log retention time
```

- Yozilgandan ~2 daqiqa o'tib eng birinchi offset 0 dan **3000** ga sakradi — uchala segment ham o'chdi. Oraliq — muddat (1 daqiqa) va tekshiruv davriyligi.
- Hech kim o'qimagan bo'lsa ham xabarlar o'chdi: sabab — muddat.
- **Faol** (oxirgi) segment ham o'chirildi. Uning o'rniga bo'sh `…3000.log` ochildi. KD: `retention.ms` sharti bajarilsa, yangi segmentga o'tishni ham boshlaydi.
- Fayllar avval `.deleted` deb belgilandi (keyin `file.delete.delay.ms` — 1 daqiqadan so'ng diskdan o'chadi, 5-bob). Log'da sabab: `due to log retention time`.
- Log oxiri o'zgarmadi (3000): offset'lar qayta boshlanmaydi.

### Hajm bo'yicha

Topic: segment 1 MiB, `retention.bytes=1048576` (1 MiB):

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic hajm --config segment.bytes=1048576 --config retention.bytes=1048576; docker exec kafka /opt/kafka/bin/kafka-producer-perf-test.sh --topic hajm --num-records 3000 --record-size 1000 --throughput -1 --command-property bootstrap.servers=localhost:9092 >/dev/null 2>&1; echo "$(date +%T) 3000 xabar yozildi"; docker exec kafka sh -c 'ls /tmp/kraft-combined-logs/hajm-0/*.log | xargs -n1 basename'
Created topic hajm.
11:00:17 3000 xabar yozildi
00000000000000000000.log
00000000000000001025.log
00000000000000002049.log
$ for i in $(seq 1 16); do sleep 30; E=$(docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic hajm --time -2); echo "$(date +%T) eng birinchi offset: $E"; [ "$E" != "hajm:0:0" ] && break; done
11:00:53 eng birinchi offset: hajm:0:0
11:01:28 eng birinchi offset: hajm:0:0
11:02:04 eng birinchi offset: hajm:0:0
11:02:40 eng birinchi offset: hajm:0:0
11:03:16 eng birinchi offset: hajm:0:0
11:03:51 eng birinchi offset: hajm:0:0
11:04:27 eng birinchi offset: hajm:0:0
11:05:03 eng birinchi offset: hajm:0:1025
$ docker exec kafka sh -c 'ls -l /tmp/kraft-combined-logs/hajm-0/ | grep "\.log$" | awk "{print \$5, \$9}"'; docker exec kafka /opt/kafka/bin/kafka-get-offsets.sh --bootstrap-server localhost:9092 --topic hajm
1037120 00000000000000001025.log
963219 00000000000000002049.log
hajm:0:3000
$ for t in muddat hajm; do docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic $t; done
```

- ~5 daqiqadan keyin (tekshiruv davri) eng eski segment (0–1024) o'chdi.
- Kuzatildi: qolgan ikki segment yig'indisi ~2 MB — chegaradan (1 MiB) katta. Kafka faqat eng eski segmentni o'chirdi. Ko'rinishidan, segment o'chirilgandan keyin ham hajm chegaradan **kichik** bo'lib qolmasligi shart. Shuning uchun haqiqiy hajm chegaradan taxminan bir segmentgacha katta bo'lishi mumkin. Hajmni rejalashda `segment.bytes` ni hisobga oling.

## Variantlar

| Kerak | Sozlama |
| --- | --- |
| Hodisalar N kun saqlansin | `retention.ms` |
| Disk to'lmasin | `retention.bytes` (× partition soni) |
| Abadiy saqlash | `retention.ms=-1` (diskni rejalab) |
| Har kalitning oxirgi qiymati qolsin | `cleanup.policy=compact` (9-bob) |
| Muddat aniqroq ishlasin | Kichikroq `segment.bytes` / `segment.ms` |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| O'qilgan xabar o'chadi deb kutish | Faqat muddat yoki hajm bo'yicha (KD) | `retention.*` |
| Muddat aniq soniyada ishlaydi deb kutish | Segment bo'yicha va davriy tekshiruv (sinovda ~2–5 daqiqa) | Zaxira bilan rejalash |
| `retention.bytes` ni topic hajmi deb tushunish | Partition darajasida (KD) | × partition soni |
| Consumer muddatdan sekin o'qiydi | O'qilmagan xabarlar o'chadi — `retention.ms` consumer'lar uchun "SLA" (KD) | Lag'ni kuzatish (17-bob) |

## Amaliyot

1. Kafka'da hodisa nima sababdan o'chiriladi?
2. Ma'lumot qanday birlikda o'chiriladi?
3. `retention.bytes=1GB` va 6 partition bo'lsa, topic qancha joy egallashi mumkin?
4. Sinovda nega xabarlar 1 daqiqada emas, ~2 daqiqada o'chdi?
5. Sinovda faol segment bilan nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Saqlash muddati (vaqt) yoki hajm chegarasi tufayli, o'qilgani uchun emas.
2. Segment fayllari bo'yicha.
3. Taxminan 6 GB (har partition 1 GB; amalda bir segmentgacha ko'proq).
4. Tekshiruv davriy (`log.retention.check.interval.ms`).
5. U ham o'chirildi, o'rniga bo'sh yangi segment (`…3000.log`) ochildi.

</details>

## Rasmiy hujjat

- [KD: Topic Configs](https://kafka.apache.org/44/configuration/topic-configs/) — `retention.ms`, `retention.bytes`, `cleanup.policy`, `segment.bytes`
- [KD: Implementation → Log](https://kafka.apache.org/44/implementation/log/) — Deletes
- [KD: Introduction](https://kafka.apache.org/44/getting-started/introduction/)
