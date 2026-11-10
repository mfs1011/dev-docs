# 33 — Monitoring

[Mundarija](README.md)

## Tushuncha

### Metrikalar qayerda (KD Monitoring)

- Server **Yammer Metrics**, Java klientlari esa **Kafka Metrics** kutubxonasidan foydalanadi. Ikkalasi ham metrikalarni **JMX** (Java Management Extensions — Java ilovasining ichki ko'rsatkichlarini tashqariga beruvchi standart) orqali chiqaradi. Plaginli reporter'lar orqali monitoring tizimiga yuborish ham mumkin.
- Har `…-rate` metrikasining jami soni ham bor (`-total` qo'shimchasi bilan): `records-consumed-rate` → `records-consumed-total`.
- Masofadan JMX **standart o'chiq**. U `JMX_PORT` yoki Java tizim sozlamalari bilan yoqiladi. KD ogohlantiradi: production'da JMX'ni **xavfsiz** yoqing, aks holda begona odam broker yoki ilovani kuzatib, hatto boshqarishi mumkin. Kafka skriptlari standart holatda JMX autentifikatsiyasini o'chirib qo'yadi.

### Asosiy broker metrikalari (KD: "biz grafik va ogohlantirish qo'yadigan metrikalar")

| Metrika (MBean) | Ma'nosi | Me'yor |
| --- | --- | --- |
| `kafka.controller:type=KafkaController,name=ActiveControllerCount` | Bu tugun faol controller'mi | Klasterda faqat bittasida 1 |
| `kafka.controller:type=KafkaController,name=OfflinePartitionsCount` | Leader'siz partition'lar | 0 |
| `kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions` | ISR < barcha replikalar | 0 |
| `kafka.server:type=ReplicaManager,name=UnderMinIsrPartitionCount` | ISR < `min.insync.replicas` | 0 |
| `kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec[,topic=…]` | Kiruvchi xabarlar tezligi | — |
| `kafka.server:type=BrokerTopicMetrics,name=BytesInPerSec` / `BytesOutPerSec` | Bayt oqimi | — |
| `kafka.network:type=RequestMetrics,name=TotalTimeMs,request={Produce\|FetchConsumer\|FetchFollower}` | So'rovning umumiy vaqti (navbat, lokal, masofaviy, javob) | — |
| `kafka.server:type=KafkaRequestHandlerPool,name=RequestHandlerAvgIdlePercent` | So'rov oqimlari bo'sh turgan ulush | 0–1, ideal > 0.3 |
| `kafka.network:type=SocketServer,name=NetworkProcessorAvgIdlePercent` | Tarmoq oqimlari bo'sh turgan ulush | 0–1, ideal > 0.3 |

### Klient metrikalari (KD)

| Klient | Metrika | Ma'nosi |
| --- | --- | --- |
| Producer | `record-send-rate`, `record-error-rate`, `request-latency-avg`, `produce-throttle-time-avg` | Yuborish, xatolar, kechikish, kvota (32-bob) |
| Consumer | `records-lag-max` (`consumer-fetch-manager-metrics`) | Consumer producer'dan necha yozuv orqada. **Consumer o'zi chiqaradi, broker emas** |
| Consumer | `records-consumed-rate`, `fetch-latency-avg` | O'qish tezligi |

**Consumer lag** — log oxiri (log-end offset) va consumer pozitsiyasi orasidagi farq. Tashqaridan `kafka-consumer-groups.sh --describe` (17-bob) bilan ham ko'rinadi.

## Buyruqlar va kod

VPS'da, Kafka arxividan alohida broker. JMX **faqat 127.0.0.1** da: autentifikatsiyasiz JMX'ni tashqi interfeysga ochmaymiz.

```text vps
$ mkdir -p /root/kafka-mon && cd /opt/kafka-tgz/kafka_2.13-4.4.0 && sed -e 's#^log.dirs=.*#log.dirs=/root/kafka-mon/data#' -e 's#localhost:9092#localhost:9292#g; s#localhost:9093#localhost:9293#g; s#://:9092#://localhost:9292#; s#://:9093#://localhost:9293#' config/server.properties > /root/kafka-mon/server.properties && grep -E '^(listeners|advertised.listeners|controller.quorum.bootstrap.servers|log.dirs)=' /root/kafka-mon/server.properties
controller.quorum.bootstrap.servers=localhost:9293
listeners=PLAINTEXT://localhost:9292,CONTROLLER://localhost:9293
advertised.listeners=PLAINTEXT://localhost:9292,CONTROLLER://localhost:9293
log.dirs=/root/kafka-mon/data
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-storage.sh format -t $(bin/kafka-storage.sh random-uuid) --standalone -c /root/kafka-mon/server.properties >/dev/null && (KAFKA_HEAP_OPTS="-Xmx256m" JMX_PORT=9999 KAFKA_JMX_OPTS="-Dcom.sun.management.jmxremote=true -Dcom.sun.management.jmxremote.authenticate=false -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.host=127.0.0.1 -Djava.rmi.server.hostname=127.0.0.1" bin/kafka-server-start.sh /root/kafka-mon/server.properties > /root/kafka-mon/broker.log 2>&1 &); for i in $(seq 60); do grep -q "Kafka Server started" /root/kafka-mon/broker.log 2>/dev/null && break; sleep 3; done; grep -o 'Kafka Server started' /root/kafka-mon/broker.log; ss -ltn | grep -E ':(9999|9292|9293) ' | awk '{print $4}' | sort
Kafka Server started
[::ffff:127.0.0.1]:9292
[::ffff:127.0.0.1]:9293
[::ffff:127.0.0.1]:9999
```

`ss` — barcha portlar (9292 klient, 9293 controller, 9999 JMX) faqat `127.0.0.1` da.

### Holat metrikalari

Kafka bilan birga keladigan `kafka-jmx.sh` vositasi:

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && J="--jmx-url service:jmx:rmi:///jndi/rmi://127.0.0.1:9999/jmxrmi --one-time true --report-format properties"; for m in 'kafka.controller:type=KafkaController,name=ActiveControllerCount' 'kafka.controller:type=KafkaController,name=OfflinePartitionsCount' 'kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions' 'kafka.server:type=ReplicaManager,name=UnderMinIsrPartitionCount'; do bin/kafka-jmx.sh $J --object-name "$m" --attributes Value 2>/dev/null | grep -v '^time='; done
kafka.controller:type=KafkaController,name=ActiveControllerCount:Value=1
kafka.controller:type=KafkaController,name=OfflinePartitionsCount:Value=0
kafka.server:type=ReplicaManager,name=UnderReplicatedPartitions:Value=0
kafka.server:type=ReplicaManager,name=UnderMinIsrPartitionCount:Value=0
```

Bitta tugunli sog'lom klaster: faol controller — 1, oflayn partition yo'q, replikatsiya muammosi yo'q.

### Trafik va yuklanish

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-topics.sh --bootstrap-server localhost:9292 --create --topic kuzatuv --partitions 2 && bin/kafka-producer-perf-test.sh --topic kuzatuv --num-records 5000 --record-size 200 --throughput -1 --bootstrap-server localhost:9292 2>/dev/null | tail -1 | cut -d, -f1-2; bin/kafka-jmx.sh --jmx-url service:jmx:rmi:///jndi/rmi://127.0.0.1:9999/jmxrmi --one-time true --report-format properties --object-name 'kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec,topic=kuzatuv' --attributes Count,OneMinuteRate 2>/dev/null | grep -v '^time=' | sed -E 's/(OneMinuteRate=[0-9]+\.[0-9]).*/\1/'
Created topic kuzatuv.
5000 records sent, 1775.568182 records/sec (0.34 MB/sec)
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec,topic=kuzatuv:Count=5000
kafka.server:type=BrokerTopicMetrics,name=MessagesInPerSec,topic=kuzatuv:OneMinuteRate=0.0
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && J="--jmx-url service:jmx:rmi:///jndi/rmi://127.0.0.1:9999/jmxrmi --one-time true --report-format properties"; for m in 'kafka.server:type=KafkaRequestHandlerPool,name=RequestHandlerAvgIdlePercent' 'kafka.network:type=SocketServer,name=NetworkProcessorAvgIdlePercent'; do bin/kafka-jmx.sh $J --object-name "$m" 2>/dev/null | grep -v '^time=' | grep -E 'OneMinuteRate|Value' | sed -E 's/=([0-9]+\.[0-9]{2})[0-9]*/=\1/'; done
kafka.server:type=KafkaRequestHandlerPool,name=RequestHandlerAvgIdlePercent:OneMinuteRate=0.96
kafka.network:type=SocketServer,name=NetworkProcessorAvgIdlePercent:Value=0.99
```

- `MessagesInPerSec` `Count` — 5000, yuborilgan yozuvlar soni bilan aynan bir xil.
- `OneMinuteRate` darhol o'qilganda 0.0 chiqdi. Kuzatildi: o'rtacha tezlik (EWMA) davriy yangilanadi, shuning uchun yuborishdan so'ng bir zumda qiymat hali o'zgarmagan bo'lishi mumkin. Grafik uchun metrika bir necha soniyada bir o'qiladi.
- Bo'sh vaqt ulushi 0.96 va 0.99 — me'yordan (> 0.3) ancha yuqori.

### Consumer lag

```text vps
$ cd /opt/kafka-tgz/kafka_2.13-4.4.0 && bin/kafka-console-consumer.sh --bootstrap-server localhost:9292 --topic kuzatuv --group hisobchi --from-beginning --max-messages 1000 > /dev/null 2>&1; bin/kafka-consumer-groups.sh --bootstrap-server localhost:9292 --describe --group hisobchi 2>/dev/null | awk '{print $2, $3, $4, $5, $6}' | column -t
TOPIC    PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG
kuzatuv  0          1000            2496            1496
kuzatuv  1          0               2504            2504
$ pkill -f '[k]afka-mon/server.properties'; sleep 8; pgrep -f '[k]afka-mon/server.properties' | wc -l; rm -rf /root/kafka-mon
0
```

`hisobchi` 1000 ta yozuv o'qib to'xtadi. LAG — har partition bo'yicha qolgan yozuvlar: jami 4000 ta. Lag doimiy o'sib borsa, consumer'lar ulgurmayapti — ularni ko'paytirish (15-bob) yoki ishlovni tezlatish kerak.

## Variantlar

| Kerak | Usul |
| --- | --- |
| Bir martalik tekshiruv | `kafka-jmx.sh`, jconsole (KD: metrikalarni ko'rishning eng oson yo'li) |
| Doimiy grafik va ogohlantirish | JMX'ni monitoring tizimiga uzatish yoki plaginli reporter |
| Lag kuzatuvi | Consumer `records-lag-max` yoki `kafka-consumer-groups.sh` |
| Ilova ichida | Klientning `metrics()` metodi |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| JMX'ni autentifikatsiyasiz tashqariga ochish | Begona odam kuzatadi va boshqaradi (KD) | Faqat lokal yoki autentifikatsiya + TLS |
| Lag'ni broker metrikalaridan qidirish | `records-lag-max` — consumer metrikasi (KD) | Consumer metrikalari yoki `--describe` |
| `UnderReplicatedPartitions` ga ogohlantirish qo'ymaslik | Nusxalar kamayganini bilmay qolasiz | 0 dan katta bo'lsa ogohlantirish |
| `ActiveControllerCount` ni faqat bitta tugunda tekshirish | Klasterda yig'indisi aniq 1 bo'lishi kerak | Barcha tugunlar bo'yicha yig'indi |
| Rate'ni bir zumda o'qib xulosa qilish | EWMA hali yangilanmagan bo'lishi mumkin (sinovda) | Vaqt qatori sifatida kuzatish |

## Amaliyot

1. Kafka metrikalarni qanday chiqaradi?
2. Klaster sog'lom ekanini ko'rsatadigan to'rtta broker metrikasini ayting.
3. `records-lag-max` ni kim chiqaradi?
4. `RequestHandlerAvgIdlePercent` qanday qiymatda bo'lishi kerak?
5. Sinovda JMX porti nega faqat 127.0.0.1 da ochildi?

<details>
<summary>Javoblar</summary>

1. JMX orqali (server — Yammer Metrics, klientlar — Kafka Metrics); plaginli reporter'lar ham bor.
2. `ActiveControllerCount` (klasterda bitta 1), `OfflinePartitionsCount` = 0, `UnderReplicatedPartitions` = 0, `UnderMinIsrPartitionCount` = 0.
3. Consumer'ning o'zi.
4. 0 va 1 orasida, ideal holda 0.3 dan katta.
5. Kafka skriptlari JMX autentifikatsiyasini o'chirib qo'yadi; KD JMX'ni xavfsiz yoqishni talab qiladi.

</details>

## Rasmiy hujjat

- [KD: Monitoring](https://kafka.apache.org/44/operations/monitoring/) — Security Considerations for Remote Monitoring using JMX, broker metrikalari, Producer monitoring, Consumer monitoring
