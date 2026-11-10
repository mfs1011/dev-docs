# 12 — Consumer ulgurmasa

[Mundarija](README.md)

## Tushuncha

Producer consumer'dan tezroq ishlasa, ishlanmagan xabarlar to'planadi. Muammo uchta savolga bo'linadi:

1. **Qayerda** to'planadi? Broker xotirasida yoki diskida.
2. **Chegaraga yetganda** nima bo'ladi? Producer to'xtatiladimi, xabarlar tashlanadimi yoki xato qaytadimi?
3. **Qanday bilamiz**? Qaysi ko'rsatkich kuzatiladi?

| Tizim | Qayerda to'planadi | Chegaraga yetganda | Nima kuzatiladi |
| --- | --- | --- | --- |
| **RabbitMQ** | Navbatda (xotira, disk) | **Flow control**: tez yuboruvchi ulanish sekinlashtiriladi. **Resurs alarmlari**: xotira yoki disk chegarasida yuboruvchi ulanishlar **bloklanadi** | Navbat uzunligi, ulanish holati (`flow`, `blocked`) |
| **Kafka** | Topic log'ida, diskda | To'planish broker uchun muammo emas — retention bo'yicha o'chadi (10-bob). Consumer orqada qolib, yozuvlar o'chib ketishi mumkin | **Consumer lag** |
| **Redis** | Xotirada | `maxmemory`'ga yetganda — `maxmemory-policy` bo'yicha: xato yoki kalitlarni chiqarib yuborish | `used_memory`, stream uzunligi, PEL |

### RabbitMQ (RQ Flow Control, Memory and Disk Alarms)

- **Flow control** — sozlamasiz ishlaydi. Navbatlar ulgurmaydigan tezlikda yuborayotgan ulanishlarni RabbitMQ sekinlashtiradi. Bunday ulanish `flow` holatida ko'rinadi: u soniyasiga bir necha marta bloklanib-ochilib turadi. Klient uchun bu tarmoq sekinroq bo'lib qolgandek ko'rinadi.
- **Resurs alarmlari** — xotira ishlatilishi chegaradan oshganda yoki bo'sh disk chegaradan kamayganda. Shunda RabbitMQ yuboruvchi ulanishlardan o'qishni to'xtatadi. Maqsad — OS tugunni OOM killer bilan o'ldirmasligi va disk butunlay tugamasligi.
- Faqat iste'mol qiladigan ulanishlar bloklanmaydi — consumer'lar navbatni bo'shatishda davom etadi.
- Mos klientlarga blok haqida xabar beriladi (`connection.blocked`).

### Kafka (KD Basic Operations)

Kafka xabarni o'qilguncha emas, retention muddatigacha saqlaydi. Shuning uchun asosiy ko'rsatkich — **consumer lag**: partition log oxiri bilan guruhning commit qilingan offset'i orasidagi farq. Uni `kafka-consumer-groups.sh --describe` ko'rsatadi. Lag doim o'sib borsa, consumer'lar yetishmayapti (11-bob). Lag retention'dan oshib ketsa, o'qilmagan yozuvlar o'chib ketadi (10-bob).

### Redis (RD Key eviction)

`maxmemory` — xotira chegarasi (`0` — chegarasiz). Chegaraga yetganda `maxmemory-policy`:

| Siyosat | Xatti-harakat |
| --- | --- |
| `noeviction` | Kalitlar chiqarilmaydi; yangi ma'lumot yozadigan buyruqlar **xato** qaytaradi. O'qish ishlaydi |
| `allkeys-lru`, `allkeys-lfu`, `allkeys-random` … | Har qanday kalitni chiqarib yuboradi |
| `volatile-lru`, `volatile-ttl` … | Faqat TTL'i bor kalitlarni chiqaradi |

Eviction **butun kalitni** o'chiradi. Stream — bitta kalit, shuning uchun `allkeys-*` siyosatda navbat to'liq yo'qolishi mumkin. Navbat uchun ishlatiladigan Redis'da `noeviction` xavfsizroq: yozish xato beradi, lekin ma'lumot o'chmaydi.

## Uch tizimda

### RabbitMQ: xotira alarmi

To'xtovsiz yuboradigan producer. Orkestr skripti (`alarm.sh`) xotira chegarasini vaqtincha juda past qiladi, keyin qaytaradi:

```js
// To'xtovsiz yuboradi; broker ulanishni bloklasa yoki ochsa — xabar beradi (connection.blocked / unblocked)
const amqp = require('amqplib');
(async () => {
  const c = await amqp.connect('amqp://localhost'); const ch = await c.createChannel();
  await ch.assertQueue('bosim', { durable: true });
  const t0 = Date.now(), s = () => ((Date.now() - t0) / 1000).toFixed(1);
  let n = 0, oldin = 0;
  c.on('blocked', sabab => { console.log(`${s()} s: BLOCKED (${sabab}), shu paytgacha yuborildi: ${n}`); oldin = n; });
  c.on('unblocked', () => console.log(`${s()} s: unblocked, blok paytida yuborish chaqirildi: ${n - oldin}`));
  const timer = setInterval(() => { ch.sendToQueue('bosim', Buffer.from('x')); n++; }, 10);
  setTimeout(async () => { clearInterval(timer); await ch.deleteQueue('bosim'); await c.close(); console.log(`${s()} s: tugadi`); }, 12000);
})();
```

```bash
#!/bin/bash
# alarm.sh KLIENT_BUYRUG'I — klientni ishga tushiradi, 3-soniyada xotira alarmini yoqadi, 9-soniyada o'chiradi
"$@" > /tmp/klient.log 2>&1 & pid=$!
sleep 3; rabbitmqctl set_vm_memory_high_watermark 0.00001 >/dev/null; echo "[orkestr] ${SECONDS} s: xotira chegarasi pasaytirildi"
sleep 6; rabbitmqctl set_vm_memory_high_watermark 0.6 >/dev/null; echo "[orkestr] ${SECONDS} s: chegara 0.6 ga qaytarildi"
wait $pid; cat /tmp/klient.log; rm -f /tmp/klient.log
```

```text vps
$ rabbitmqctl -q eval 'vm_memory_monitor:get_vm_memory_high_watermark().'; cd /root/rabbit-ilova && bash alarm.sh node bosim.js; rm bosim.js; rabbitmqctl -q eval 'vm_memory_monitor:get_vm_memory_high_watermark().'
0.6
[orkestr] 9 s: xotira chegarasi pasaytirildi
[orkestr] 20 s: chegara 0.6 ga qaytarildi
8.7 s: BLOCKED (low on memory), shu paytgacha yuborildi: 830
19.8 s: unblocked, blok paytida yuborish chaqirildi: 317
19.8 s: tugadi
0.6
```

- Chegara pasaytirilgach broker ulanishni **bloklab**, sababini yubordi: `low on memory`. Shu paytgacha 830 ta xabar yuborilgan edi.
- Blok vaqtida ilova yana 317 marta `sendToQueue` chaqirdi — bu xabarlar broker'ga yetmadi, klientning buferida kutdi.
- Chegara qaytarilgach `unblocked` keldi va ilova tugadi. Kuzatildi: `rabbitmqctl` buyrug'i bir necha soniya ishlaydi, shuning uchun orkestr vaqtlari rejadagidan kech chiqdi.
- Watermark oldin va keyin 0.6 — sozlama qaytarildi.

### Kafka: consumer lag

```text vps
$ K=/opt/kafka/bin; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --create --topic kechikish >/dev/null; docker exec kafka $K/kafka-producer-perf-test.sh --topic kechikish --num-records 1000 --record-size 100 --throughput -1 --bootstrap-server localhost:9092 2>/dev/null | tail -1 | cut -d, -f1; docker exec kafka $K/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic kechikish --group sekin --from-beginning --max-messages 200 >/dev/null 2>&1; docker exec kafka $K/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group sekin 2>/dev/null | awk 'NF{print $2, $4, $5, $6}' | column -t
1000 records sent
TOPIC      CURRENT-OFFSET  LOG-END-OFFSET  LAG
kechikish  200             1000            800
$ K=/opt/kafka/bin; docker exec kafka $K/kafka-producer-perf-test.sh --topic kechikish --num-records 1000 --record-size 100 --throughput -1 --bootstrap-server localhost:9092 2>/dev/null | tail -1 | cut -d, -f1; docker exec kafka $K/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group sekin 2>/dev/null | awk 'NF{print $2, $4, $5, $6}' | column -t; docker exec kafka $K/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic kechikish; docker exec kafka $K/kafka-consumer-groups.sh --bootstrap-server localhost:9092 --delete --group sekin >/dev/null 2>&1
1000 records sent
TOPIC      CURRENT-OFFSET  LOG-END-OFFSET  LAG
kechikish  200             2000            1800
```

`sekin` guruhi 1000 tadan 200 tasini o'qidi — lag 800. Yana 1000 ta yozilgach, consumer o'qimadi — lag 1800 ga o'sdi. Broker uchun bu oddiy holat, lekin o'sib boruvchi lag — consumer'lar yetishmayotgani belgisi.

### Redis: `maxmemory` va `noeviction`

```text vps
$ U=$(redis-cli INFO memory | grep '^used_memory:' | cut -d: -f2 | tr -d '\r'); redis-cli CONFIG SET maxmemory $((U + 300000)) >/dev/null; echo "maxmemory: ishlatilgan + 300 KB, siyosat: $(redis-cli CONFIG GET maxmemory-policy | tail -1)"; n=0; while out=$(redis-cli XADD navbat '*' ish "$(head -c 1000 /dev/zero | tr '\0' x)" 2>&1) && ! echo "$out" | grep -q OOM; do n=$((n+1)); [ $n -ge 2000 ] && break; done; echo "$n ta qo'shildi, keyin: $out"; redis-cli CONFIG SET maxmemory 0 >/dev/null; redis-cli DEL navbat >/dev/null; echo "maxmemory qaytarildi: $(redis-cli CONFIG GET maxmemory | tail -1)"
maxmemory: ishlatilgan + 300 KB, siyosat: noeviction
289 ta qo'shildi, keyin: OOM command not allowed when used memory > 'maxmemory'.
maxmemory qaytarildi: 0
```

- Chegara vaqtincha joriy xotiradan 300 KB yuqori qilib qo'yildi, siyosat `noeviction`.
- 289 ta 1 KB'li yozuvdan keyin `XADD` **OOM** xato qaytardi: navbatga yozish to'xtadi, eski yozuvlar o'chmadi.
- `maxmemory` 0 ga (VPS'dagi asl qiymat) qaytarildi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| RabbitMQ'da `blocked` holatini kuzatmaslik | Producer "osilib qolgandek" ko'rinadi, sababi noma'lum (RQ) | `connection.blocked` ishlovchisi, monitoring |
| Bloklangan ulanishda yuborishni davom ettirish | Xabarlar klient xotirasida to'planadi (sinovda 317 ta) | Blok paytida yuborishni to'xtatish |
| Kafka'da lag'ni kuzatmaslik | Yozuvlar o'qilmasdan retention bo'yicha o'chishi mumkin | Lag monitoringi va ogohlantirish |
| Redis navbati uchun `allkeys-*` eviction | Butun stream kaliti o'chishi mumkin (RD) | `noeviction` + xotirani kuzatish |
| Redis'da `maxmemory` siz navbat | Server xotirasi tugaydi | Chegara qo'yish, stream'ni qisqartirish (10-bob) |

## Amaliyot

1. RabbitMQ'da flow control va resurs alarmi farqi nima?
2. Alarm paytida qaysi ulanishlar bloklanmaydi va nega bu muhim?
3. Kafka'da to'planish nega broker uchun muammo emas va unda nimani kuzatish kerak?
4. Sinovda Redis `noeviction` siyosatida chegaraga yetganda nima bo'ldi?
5. Redis navbati uchun `allkeys-lru` nega xavfli?

<details>
<summary>Javoblar</summary>

1. Flow control — tez yuboruvchini doimiy sekinlashtiradi; alarm — xotira/disk chegarasida yuboruvchilarni to'liq bloklaydi.
2. Faqat iste'mol qiladiganlari; consumer'lar navbatni bo'shatib, holatni tiklaydi.
3. Yozuvlar diskda retention bo'yicha saqlanadi; consumer lag'ni kuzatish kerak.
4. `XADD` OOM xato qaytardi; mavjud yozuvlar saqlanib qoldi.
5. Eviction butun kalitni o'chiradi — stream to'liq yo'qolishi mumkin.

</details>

## Rasmiy hujjat

- [RQ: Flow Control](https://www.rabbitmq.com/docs/flow-control)
- [RQ: Memory and Disk Alarms](https://www.rabbitmq.com/docs/alarms)
- [KD: Basic Kafka Operations](https://kafka.apache.org/44/operations/basic-kafka-operations/) — Checking consumer position
- [RD: Key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
