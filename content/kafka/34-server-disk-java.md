# 34 — Server, disk va Java

[Mundarija](README.md)

## Tushuncha

### Fayl tizimidan qo'rqmang (KD Design → Persistence)

Kafka xabarlarni saqlash va keshlash uchun **fayl tizimiga** tayanadi:

- Disk **ketma-ket** yozishda juda tez, tasodifiy yozishda sekin. KD misolida farq 6000 martadan ortiq (600 MB/s va 100 KB/s).
- Zamonaviy OS barcha bo'sh xotirani disk keshi — **page cache** (sahifa keshi) — uchun ishlatadi. Barcha o'qish va yozish shu kesh orqali o'tadi.
- JVM ichida kesh qilish qimmat: obyektlar ma'lumotdan ikki baravar ko'p joy oladi, katta heap'da GC (garbage collector — xotira tozalovchi) sekinlashadi.
- Shuning uchun Kafka ma'lumotni darhol fayl tizimidagi log'ga yozadi, ya'ni yadroning page cache'iga. Diskka majburan tushirish shart emas. 32 GB'li mashinada 28–30 GB kesh GC'siz ishlaydi.

### Flush (KD Hardware and OS)

- Kafka ma'lumotni darhol fayl tizimiga yozadi. Diskka **qachon** tushirish (fsync) — sozlanadi, lekin KD **standartni** tavsiya qiladi: ilova fsync'i o'chiq, OS va Kafka fonda tushiradi.
- Ishonchlilik diskka sinxronlashdan emas, **replikatsiyadan** keladi: ishdan chiqqan tugun replikalardan tiklanadi.
- Avariyadan keyin fsync qilinmagan segmentlar CRC bilan tekshiriladi va indeks qayta quriladi.

### Server (KD)

| Mavzu | KD tavsiyasi |
| --- | --- |
| Xotira | Faol o'quvchi va yozuvchilarni buferlash uchun yetarli. Taxminiy hisob: 30 soniya buferi — `yozish_tezligi × 30` |
| Disk | O'tkazuvchanlik — odatda asosiy cheklov; ko'proq disk yaxshiroq. Kafka diskini OS va ilova loglari bilan bo'lishmang |
| Bir nechta disk | RAID yoki har diskni alohida katalog (`log.dirs`). Partition'lar kataloglarga navbat bilan (round-robin) taqsimlanadi |
| RAID | Yozish unumiga zarar, joyni kamaytiradi. Qayta qurish serverni amalda to'xtatadi. Ortiqchalikni replikatsiya ham beradi |
| OS | Linux (va Solaris) da sinalgan. Windows yaxshi qo'llab-quvvatlanmaydi |
| Fayl deskriptorlari | Kamida **100 000** |
| `vm.max_map_count` | Partition'lar ko'p bo'lsa kuzatish. Ko'p Linux'larda standart ~65535 |
| Fayl tizimi | XFS va EXT4. XFS sinovda yaxshiroq (Request Local Time 160 ms va 250 ms+), sozlash deyarli talab qilmaydi. Mount'da `noatime` |
| EXT4 | Unumni oshiradigan opsiyalar (`data=writeback`, jurnalni o'chirish) avariyada xavfli |

### Java (KD Java Version)

- Java 17, 21 va 25 to'liq qo'llab-quvvatlanadi. Java 11 faqat ba'zi modullar uchun (klientlar, Streams).
- Tavsiya — **eng so'nggi LTS** (hozir Java 25) va uning so'nggi patch versiyasi: eskilarida e'lon qilingan zaifliklar bo'ladi.
- KD'dagi tipik argumentlar (LinkedIn'ning eng band klasterlaridan biri: 60 broker, 50k partition, 800k xabar/s):

```text
-Xmx6g -Xms6g -XX:MetaspaceSize=96m -XX:+UseG1GC
-XX:MaxGCPauseMillis=20 -XX:InitiatingHeapOccupancyPercent=35 -XX:G1HeapRegionSize=16M
-XX:MinMetaspaceFreeRatio=50 -XX:MaxMetaspaceFreeRatio=80 -XX:+ExplicitGCInvokesConcurrent
```

Heap — 6 GB, mashinaning qolgan xotirasi page cache uchun.

## Buyruqlar va kod

VPS'dagi Docker broker. Faqat ko'rish: OS sozlamalari o'zgartirilmadi.

### Java

```text vps
$ java -version 2>&1 | head -1; docker exec kafka java -version 2>&1 | head -1
openjdk version "25.0.4.1" 2026-08-18
openjdk version "25.0.4.1" 2026-08-18 LTS
$ docker exec kafka sh -c 'tr "\0" "\n" < /proc/1/cmdline' 2>/dev/null | grep -E '^-X|^-XX' | grep -v -E 'Log|SharedArchive|HeapDump|ErrorFile' | tr '\n' ' '; echo
-Xmx256m -Xms256m -Xlog:gc*:file=/opt/kafka/bin/../logs/kafkaServer-gc.log:time,tags:filecount=10,filesize=100M 
```

- Serverda ham, image ichida ham Java 25 (LTS) — KD tavsiyasiga mos.
- Image'ga faqat heap berilgan (`-Xmx256m -Xms256m` — VPS xotirasi kichik, 3-bob). Qolgan GC sozlamalari JVM standartlari.

### OS chegaralari va disk

```text vps
$ docker exec kafka sh -c 'ulimit -n'; sysctl -n vm.max_map_count; P=$(docker inspect -f '{{.State.Pid}}' kafka); echo "ochiq fayllar: $(ls /proc/$P/fd | wc -l), xotira xaritalari: $(wc -l < /proc/$P/maps)"
1024
1048576
ochiq fayllar: 330, xotira xaritalari: 684
$ df -hT /var/lib/docker | awk 'NR>1{print $2, $3, $7}'; findmnt -no FSTYPE,OPTIONS -T /var/lib/docker
ext4 40G /
ext4 rw,relatime
```

| Ko'rsatkich | VPS'da | KD | Xulosa |
| --- | --- | --- | --- |
| Fayl deskriptorlari (konteyner) | 1024 | ≥ 100 000 | Sinov uchun yetadi (330 ochiq), production'da oshirish kerak |
| `vm.max_map_count` | 1 048 576 | ~65535 standart | Yetarli |
| Fayl tizimi | ext4, `relatime` | XFS yoki EXT4, `noatime` | Kafka diski alohida emas — OS bilan bitta disk |

Bular production uchun sozlanmagan **sinov serveri** ekanini ko'rsatadi. KD ro'yxati serverni tayyorlashda tekshiruv ro'yxati bo'ladi.

### Page cache

```text vps
$ docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic kesh-sinov >/dev/null && sync && echo 1 > /proc/sys/vm/drop_caches && grep -E '^(Cached|Dirty):' /proc/meminfo && /opt/kafka-tgz/kafka_2.13-4.4.0/bin/kafka-producer-perf-test.sh --topic kesh-sinov --num-records 100000 --record-size 1000 --throughput -1 --bootstrap-server localhost:9092 2>/dev/null | tail -1 | cut -d, -f1-2 && grep -E '^(Cached|Dirty):' /proc/meminfo
Cached:           135176 kB
Dirty:               168 kB
100000 records sent, 3903.200625 records/sec (3.72 MB/sec)
Cached:           463644 kB
Dirty:             54472 kB
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-consumer-perf-test.sh --bootstrap-server localhost:9092 --topic kesh-sinov --messages 100000 2>/dev/null | cut -d, -f3,4,6 | column -t -s,; docker exec kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic kesh-sinov
Warning: --messages is deprecated. Use --num-records instead.            
 data.consumed.in.MB                                            MB.sec    nMsg.sec
 95.3674                                                        12.8545   13478.9055
```

- Avval `drop_caches` bilan kesh tozalandi. Keyin ~95 MB yozilgach `Cached` 135 MB dan 464 MB gacha o'sdi. `Dirty` 54 MB — bu ma'lumot keshda turibdi va hali diskka tushirilmagan. Broker fsync qilmadi, tushirishni OS o'zi bajaradi.
- Consumer o'sha 95 MB ni 12.9 MB/s bilan o'qidi. Yozish 3.7 MB/s edi: yozishda broker bitta CPU'li VPS'da yuklangan, o'qishda esa ma'lumot keshda tayyor turadi.

## Variantlar

| Holat | Tanlov |
| --- | --- |
| Bir nechta disk, oddiy boshqaruv | Har disk — alohida `log.dirs` katalogi |
| Disklar orasida yuk teng bo'lsin | RAID (yozish unumi va joy hisobiga) |
| Yangi server | XFS, `noatime`, fayl deskriptorlari ≥ 100 000 |
| JVM | So'nggi LTS, G1GC, kichik heap, qolgani page cache uchun |
| Ishonchlilik | Replikatsiya (20-bob), fsync emas |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Heap'ni iloji boricha katta qilish | Kesh page cache'da; katta heap GC'ni sekinlashtiradi (KD) | Kichik heap, xotira OS'ga |
| Ilova darajasida tez-tez fsync | Disk samarasiz ishlaydi, yozish to'xtab qoladi (KD) | Standart flush |
| Kafka log'ini OS va ilova loglari bilan bitta diskda | Kechikish oshadi (KD) | Alohida disk |
| Standart fayl deskriptor chegarasi (1024) | Segmentlar va ulanishlar ko'p fayl ochadi | ≥ 100 000 |
| EXT4'da `data=writeback` va jurnalsiz rejimni tushunmasdan | Avariyada ma'lumot yo'qolishi va buzilishi ko'proq (KD) | XFS yoki ehtiyotkorlik bilan |
| Eski Java patch'i | E'lon qilingan zaifliklar (KD) | So'nggi patch |

## Amaliyot

1. Nega Kafka ma'lumotni JVM heap'ida emas, page cache'da keshlaydi?
2. Kafka'da ishonchlilik fsync'dan keladimi?
3. Broker uchun fayl deskriptorlari bo'yicha KD tavsiyasi qanday?
4. Qaysi fayl tizimlari tavsiya etiladi va qaysi mount opsiyasi?
5. Sinovda `Dirty` qiymati nimani ko'rsatdi?

<details>
<summary>Javoblar</summary>

1. JVM obyektlari ko'p joy oladi va katta heap GC'ni sekinlashtiradi; page cache barcha bo'sh xotirani GC'siz ishlatadi.
2. Yo'q — replikatsiyadan; standart holatda ilova fsync'i o'chiq.
3. Kamida 100 000.
4. XFS (yaxshiroq) yoki EXT4; `noatime`.
5. Yozilgan ma'lumotning bir qismi keshda turibdi va hali diskka tushirilmagan.

</details>

## Rasmiy hujjat

- [KD: Hardware and OS](https://kafka.apache.org/44/operations/hardware-and-os/)
- [KD: Java Version](https://kafka.apache.org/44/operations/java-version/)
- [KD: Design → Persistence](https://kafka.apache.org/44/design/design/) — Don't fear the filesystem
