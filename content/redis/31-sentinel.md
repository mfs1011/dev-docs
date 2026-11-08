# 31 — Sentinel

[Mundarija](README.md)

## Tushuncha

RD (High availability with Redis Sentinel): **Sentinel** ("qorovul") — Redis Cluster ishlatilmaganda Redis uchun **yuqori mavjudlik** (high availability). Vazifalari:

| Vazifa | Nima (RD) |
| --- | --- |
| **Kuzatish** | Master va replikalar to'g'ri ishlayotganini doim tekshiradi |
| **Xabar berish** | Muammo haqida administrator yoki dasturlarga API orqali xabar |
| **Avtomatik failover** | Master ishlamasa — replikani master qiladi, qolgan replikalarni yangi master'ga yo'naltiradi, ilovalarga yangi manzilni bildiradi |
| **Konfiguratsiya manbai** | Mijozlar Sentinel'dan joriy master manzilini so'raydi; failover'dan keyin — yangi manzil |

### Taqsimlangan tizim

RD: Sentinel bir nechta jarayon **birgalikda** ishlashi uchun mo'ljallangan:

1. Master ishlamayotganiga **bir nechta** Sentinel kelishgandagina nosozlik aniqlanadi — noto'g'ri signal ehtimoli kamayadi.
2. Hamma Sentinel ishlamasa ham tizim ishlaydi — failover tizimining o'zi yagona nosozlik nuqtasi bo'lmasligi kerak.

### Ishga tushirish

```text
redis-sentinel /path/to/sentinel.conf
redis-server /path/to/sentinel.conf --sentinel
```

Ikkalasi bir xil. Konfiguratsiya fayli **majburiy** (RD): Sentinel joriy holatni shu faylga yozadi va qayta ishga tushganda o'qiydi; fayl bo'lmasa yoki yozib bo'lmasa — ishga tushmaydi. Standart port — **26379**; Sentinel'lar bir-biri bilan gaplashishi uchun bu port boshqa Sentinel manzillari uchun **ochiq** bo'lishi kerak.

### Joylashtirishdan oldin (RD)

1. Ishonchli tizim uchun kamida **uchta** Sentinel.
2. Ular **mustaqil** ishdan chiqadigan kompyuterlarda (har xil fizik serverlar yoki mavjudlik zonalari).
3. Sentinel + Redis tasdiqlangan yozuvlar saqlanishini **kafolatlamaydi** (replikatsiya asinxron, 30-bob).
4. Mijoz kutubxonasi Sentinel'ni qo'llashi kerak.
5. Muntazam **sinab ko'rilmagan** HA tizimi xavfsiz emas.
6. Docker va boshqa NAT/port almashtirish bilan ehtiyot bo'ling — avtomatik topish buziladi.

### Konfiguratsiya

```text
sentinel monitor mymaster 127.0.0.1 6379 2
sentinel down-after-milliseconds mymaster 60000
sentinel failover-timeout mymaster 180000
sentinel parallel-syncs mymaster 1
```

- `sentinel monitor <nom> <ip> <port> <quorum>` — faqat master ko'rsatiladi; replikalar va boshqa Sentinel'lar **avtomatik topiladi**; Sentinel faylni o'zi yangilab boradi.
- `down-after-milliseconds` — server shuncha vaqt javob bermasa (yoki xato bersa), Sentinel uni ishlamayapti deb o'ylay boshlaydi.
- `parallel-syncs` — failover'dan keyin bir vaqtda nechta replika yangi master'ga qayta sinxronlanadi (kam — sekinroq, lekin replikalar birdaniga ishdan chiqmaydi).
- Ishlab turganda: `SENTINEL SET` (master sozlamalari), `SENTINEL CONFIG SET` (umumiy).

### Quorum va ko'pchilik

RD:

- **Quorum** — master'ni ishlamayapti deb **belgilash** uchun kelishishi kerak bo'lgan Sentinel'lar soni. U faqat **aniqlash** uchun.
- Failover'ni **bajarish** uchun bitta Sentinel **yetakchi** etib saylanishi kerak — buning uchun Sentinel jarayonlarining **ko'pchiligi** ovoz beradi.

Masalan, 5 Sentinel, quorum 2: ikkitasi kelishsa — failover boshlashga urinadi; kamida uchtasi bilan aloqa bo'lsagina ruxsat beriladi. Demak, **ozchilik bo'lagida failover bo'lmaydi**.

**SDOWN va ODOWN** (RD): **SDOWN** (subjectively down — "sub'ektiv ishlamayapti") — bitta Sentinel `down-after-milliseconds` davomida to'g'ri `PING` javobini olmadi (`PONG`, `-LOADING`, `-MASTERDOWN` — to'g'ri javoblar). **ODOWN** (objectively down — "ob'ektiv") — kamida `quorum` ta Sentinel SDOWN da ekanini bir-biridan bilib oldi. Failover faqat ODOWN'dan keyin.

### Qaysi replika tanlanadi

RD: master'dan juda uzoq uzilgan replikalar (taxminan `down-after-milliseconds × 10` dan ko'p) chiqarib tashlanadi; qolganlari tartiblanadi:

1. `replica-priority` — **kichigi** afzal;
2. teng bo'lsa — master'dan **ko'proq** ma'lumot olgani (replikatsiya offseti);
3. yana teng bo'lsa — leksikografik kichik run ID.

### Joylashtirish misollari (RD)

- **Ikki Sentinel — QILMANG**: master'li kompyuter ishdan chiqsa, unda Sentinel ham o'chadi; qolgan bittasi ko'pchilikni yig'a olmaydi — failover bo'lmaydi. Ruxsatsiz failover esa ikki master va doimiy "bo'lingan miya" (split brain) holatiga olib kelardi.
- **Uch kompyuter**, har birida Redis + Sentinel, quorum 2 — oddiy asosiy sxema. Xavf: tarmoq bo'linib, eski master bilan qolgan mijozlar unga yozishda davom etadi; bo'linish tuzalgach eski master replika bo'ladi va bu yozuvlar **abadiy yo'qoladi**. Kamaytirish: `min-replicas-to-write 1`, `min-replicas-max-lag 10` — eski master 10 soniyadan keyin yozishni to'xtatadi (narxi: ikkala replika ishlamasa, master ham yozmaydi).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). **Faqat namoyish**: hammasi bitta kompyuterda — RD talab qilgan "mustaqil kompyuterlar" sharti bajarilmagan. Master 7060, replikalar 7061 (`replica-priority 100`) va 7062 (`replica-priority 50`); Sentinel'lar 27060–27062.

### Tayyorlash

```text vps
$ rm -rf /tmp/r31 && mkdir -p /tmp/r31/{r0,r1,r2,s0,s1,s2}; for i in 0 1 2; do redis-server --port 706$i --dir /tmp/r31/r$i --daemonize yes --bind 127.0.0.1 --save '' --logfile /tmp/r31/r$i/log $([ $i != 0 ] && echo --replicaof 127.0.0.1 7060) --replica-priority $([ $i = 2 ] && echo 50 || echo 100); done; sleep 7; redis-cli -p 7060 INFO replication | grep -E '^(role|connected_slaves):'
role:master
connected_slaves:2
$ printf '%s\n' 'port 27060' 'bind 127.0.0.1' 'daemonize yes' 'sentinel monitor mymaster 127.0.0.1 7060 2' 'sentinel down-after-milliseconds mymaster 3000' 'sentinel failover-timeout mymaster 10000' 'sentinel parallel-syncs mymaster 1' > /tmp/r31/s0/sentinel.conf; cat /tmp/r31/s0/sentinel.conf
port 27060
bind 127.0.0.1
daemonize yes
sentinel monitor mymaster 127.0.0.1 7060 2
sentinel down-after-milliseconds mymaster 3000
sentinel failover-timeout mymaster 10000
sentinel parallel-syncs mymaster 1
$ for i in 1 2; do sed "s/27060/2706$i/" /tmp/r31/s0/sentinel.conf > /tmp/r31/s$i/sentinel.conf; done; for i in 0 1 2; do redis-server /tmp/r31/s$i/sentinel.conf --sentinel --dir /tmp/r31/s$i --logfile /tmp/r31/s$i/log; done; sleep 6; s() { redis-cli -p 27060 "$@"; }; s SENTINEL master mymaster | paste - - | grep -E '^(name|port|flags|num-slaves|num-other-sentinels|quorum)\b'
name	mymaster
port	7060
flags	master
num-slaves	2
num-other-sentinels	2
quorum	2
```

- RD tutorial'idagi minimal konfiguratsiya, `down-after-milliseconds` — 3 soniya.
- Sentinel `--sentinel` bilan ishga tushdi (paketda alohida `redis-sentinel` yo'q). Faqat master ko'rsatilgan bo'lsa ham: `num-slaves 2`, `num-other-sentinels 2` — avtomatik topildi.

```text vps
$ s SENTINEL get-master-addr-by-name mymaster; s SENTINEL ckquorum mymaster; grep -E '\+monitor|\+slave |\+sentinel ' /tmp/r31/s0/log | cut -d' ' -f5- | head -5
127.0.0.1
7060
OK 3 usable Sentinels. Quorum and failover authorization can be reached
19:46:09.432 # +monitor master mymaster 127.0.0.1 7060 quorum 2
19:46:09.434 * +slave slave 127.0.0.1:7061 127.0.0.1 7061 @ mymaster 127.0.0.1 7060
19:46:09.434 * +slave slave 127.0.0.1:7062 127.0.0.1 7062 @ mymaster 127.0.0.1 7060
19:46:11.451 * +sentinel sentinel 919ebe99a2b9aa8a2623a17a9983c15d0a48cd98 127.0.0.1 27061 @ mymaster 127.0.0.1 7060
19:46:11.501 * +sentinel sentinel 8d6a08886b87b1b4b12088a5b0dc27a2a0712e03 127.0.0.1 27062 @ mymaster 127.0.0.1 7060
$ for i in $(seq 1 50); do echo "SET k:$i v"; done | redis-cli -p 7060 > /dev/null; redis-cli -p 7060 WAIT 2 1000
2
```

`SENTINEL get-master-addr-by-name` — mijoz master manzilini shunday so'raydi. `ckquorum` — 3 ta Sentinel, failover mumkin. Jurnalda `+monitor`, `+slave`, `+sentinel` hodisalari.

### Failover

Master jarayoni `SIGSTOP` bilan "muzlatildi" (RD tutorial'idagi `DEBUG sleep 30` o'rniga — osilib qolgan master):

```text vps
$ (timeout 25 redis-cli -p 27060 SUBSCRIBE +switch-master | tail -n +4 | head -1 | sed 's/^/xabar: /' ) & sleep 0.5; date +%T; kill -STOP $(pgrep -f 'redis-server 127.0.0.1:7060'); for t in $(seq 1 20); do sleep 1; [ "$(s SENTINEL get-master-addr-by-name mymaster | tail -1)" != 7060 ] && break; done; date +%T; s SENTINEL get-master-addr-by-name mymaster; wait
19:46:16
19:46:21
127.0.0.1
7062
xabar: message
$ grep -hE '\+sdown master|\+odown|\+elected-leader|\+selected-slave|\+promoted-slave|\+switch-master' /tmp/r31/s*/log | cut -d' ' -f5- | sort -u | head -8
19:46:19.713 # +sdown master mymaster 127.0.0.1 7060
19:46:19.787 # +sdown master mymaster 127.0.0.1 7060
19:46:19.803 # +sdown master mymaster 127.0.0.1 7060
19:46:19.887 # +odown master mymaster 127.0.0.1 7060 #quorum 3/2
19:46:19.890 # +odown master mymaster 127.0.0.1 7060 #quorum 2/2
19:46:19.979 # +elected-leader master mymaster 127.0.0.1 7060
19:46:20.079 # +selected-slave slave 127.0.0.1:7062 127.0.0.1 7062 @ mymaster 127.0.0.1 7060
19:46:20.610 # +promoted-slave slave 127.0.0.1:7062 127.0.0.1 7062 @ mymaster 127.0.0.1 7060
```

| Vaqt | Hodisa |
| --- | --- |
| 19:46:16 | Master muzlatildi |
| 19:46:19.7 | Uchala Sentinel — `+sdown` (har biri o'zicha, ~3 s dan keyin) |
| 19:46:19.9 | `+odown` — quorum 2 dan oshdi |
| 19:46:19.98 | `+elected-leader` — failover yetakchisi saylandi |
| 19:46:20.08 | `+selected-slave` — **7062** tanlandi (`replica-priority 50` < 100) |
| 19:46:20.6 | `+promoted-slave` — 7062 master bo'ldi |
| 19:46:21 | `get-master-addr-by-name` — 7062 |

Butun jarayon ~5 soniya. `+switch-master` kanaliga obuna bo'lgan mijozga xabar keldi (Pub/Sub orqali).

```text vps
$ redis-cli -p 7062 ROLE | head -1; redis-cli -p 7062 DBSIZE; redis-cli -p 7062 SET yangi 1; redis-cli -p 7061 --no-raw ROLE | head -3
master
50
OK
1) "slave"
2) "127.0.0.1"
3) (integer) 7062
```

7062 — master, 50 kalit bilan, yozish qabul qiladi; 7061 endi 7062 ning replikasi.

### Eski master qaytdi

```text vps
$ kill -CONT $(pgrep -f 'redis-server 127.0.0.1:7060'); sleep 12; redis-cli -p 7060 --no-raw ROLE | head -3; redis-cli -p 7060 SET eski 1; grep -hE '\+convert-to-slave' /tmp/r31/s*/log | cut -d' ' -f5- | head -1
1) "slave"
2) "127.0.0.1"
3) (integer) 7062
READONLY You can't write against a read only replica.

19:46:50.669 * +convert-to-slave slave 127.0.0.1:7060 127.0.0.1 7060 @ mymaster 127.0.0.1 7062
```

Eski master "uyg'ondi" — Sentinel uni **replikaga aylantirdi** (`+convert-to-slave`), yozish rad etildi. U o'zini master deb davom etmadi.

### Sentinel faylni o'zi yangiladi

```text vps
$ grep -E '^sentinel (monitor|known-replica|known-sentinel|current-epoch|config-epoch|leader-epoch)' /tmp/r31/s0/sentinel.conf | sed -E 's/(known-sentinel mymaster 127.0.0.1 2706[0-9]) [0-9a-f]{40}/\1 <id>/'
sentinel monitor mymaster 127.0.0.1 7062 2
sentinel config-epoch mymaster 1
sentinel leader-epoch mymaster 1
sentinel current-epoch 1
sentinel known-replica mymaster 127.0.0.1 7061
sentinel known-replica mymaster 127.0.0.1 7060
sentinel known-sentinel mymaster 127.0.0.1 27061 <id>
sentinel known-sentinel mymaster 127.0.0.1 27062 <id>
```

`sentinel monitor` endi **7062** ni ko'rsatadi; epoch'lar 1 ga oshdi; topilgan replikalar va Sentinel'lar yozildi.

### Ko'pchilik yo'q — failover yo'q

Ikki Sentinel o'chirildi va yangi master muzlatildi:

```text vps
$ redis-cli -p 27061 SHUTDOWN NOSAVE 2>/dev/null; redis-cli -p 27062 SHUTDOWN NOSAVE 2>/dev/null; kill -STOP $(pgrep -f 'redis-server 127.0.0.1:7062'); sleep 15; s SENTINEL get-master-addr-by-name mymaster; s SENTINEL ckquorum mymaster; grep -cE '\+odown' /tmp/r31/s0/log; tail -3 /tmp/r31/s0/log | cut -d' ' -f5-
127.0.0.1
7062
NOQUORUM 1 usable Sentinels. Not enough available Sentinels to reach the specified quorum for this master. Not enough available Sentinels to reach the majority and authorize a failover

0
19:46:55.719 # +sdown sentinel 919ebe99a2b9aa8a2623a17a9983c15d0a48cd98 127.0.0.1 27061 @ mymaster 127.0.0.1 7062
19:46:55.719 # +sdown sentinel 8d6a08886b87b1b4b12088a5b0dc27a2a0712e03 127.0.0.1 27062 @ mymaster 127.0.0.1 7062
19:46:55.859 # +sdown master mymaster 127.0.0.1 7062
```

15 soniya o'tdi — master manzili o'zgarmadi (7062). Qolgan bitta Sentinel faqat `+sdown` qildi, `ckquorum` — `NOQUORUM`: quorum'ga ham, ko'pchilikka ham yetmaydi. RD aytganidek — ozchilikda failover bo'lmaydi.

```text vps
$ kill -CONT $(pgrep -f 'redis-server 127.0.0.1:7062'); for p in 27060 7060 7061 7062; do redis-cli -p $p SHUTDOWN NOSAVE 2>/dev/null; done; sleep 0.5; rm -rf /tmp/r31; pgrep -fc 'redis-server 127.0.0.1:(70|270)6'
0
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Ikki Sentinel | Biri o'chsa — ko'pchilik yo'q, failover yo'q (RD: "qilmang") | Kamida uchta |
| Hamma Sentinel bitta kompyuterda | Kompyuter ishdan chiqsa — hammasi | Mustaqil kompyuterlar/zonalar |
| Sentinel konfiguratsiyasini nusxalab, ishga tushgandan keyin boshqasiga berish | Fayldagi `myid` ham ko'chadi — Sentinel'lar bir-birini tanimaydi (sinovda shunday bo'ldi) | Har biriga ishga tushirishdan oldin alohida fayl |
| Port 26379 yopiq | Sentinel'lar gaplasha olmaydi, failover bo'lmaydi (RD) | Sentinel'lar orasida ochish |
| Ilovada master manzilini qattiq yozish | Failover'dan keyin eski manzilga yozadi | Sentinel'ni qo'llovchi mijoz, `get-master-addr-by-name` |
| Failover'ni hech sinamaslik | Xato "kechasi soat 3 da" ochiladi (RD) | Muntazam sinov |
| Bo'linishda eski master'ga yozish | Yozuvlar abadiy yo'qoladi | `min-replicas-to-write`, `min-replicas-max-lag` |
| Docker port almashtirish bilan | Avtomatik topish buziladi (RD) | Host tarmog'i yoki `announce` sozlamalari |

## Amaliyot

1. Sentinel'ning to'rt vazifasi qaysilar?
2. Quorum va ko'pchilik farqi nima?
3. SDOWN va ODOWN nima?
4. Failover'da qaysi replika tanlanadi? Sinovda nega 7062 tanlandi?
5. Nega ikki Sentinel bilan joylashtirish xavfli?
6. Eski master qaytganda nima bo'ldi?

<details>
<summary>Javoblar</summary>

1. Kuzatish, xabar berish, avtomatik failover, konfiguratsiya manbai.
2. Quorum — nosozlikni aniqlash uchun kelishuvchilar soni; ko'pchilik — failover'ga ruxsat va yetakchi saylash uchun.
3. SDOWN — bitta Sentinel fikri; ODOWN — kamida quorum ta Sentinel kelishgan holat.
4. Juda uzoq uzilmaganlar orasidan: eng kichik `replica-priority`, keyin ko'p offset, keyin kichik run ID. 7062 da priority 50 (7061 da 100).
5. Biri (master bilan birga) o'chsa, ko'pchilik yo'q — failover bo'lmaydi; ruxsatsiz failover esa split brain.
6. Sentinel uni yangi master'ning replikasiga aylantirdi; yozish rad etildi.

</details>

## Rasmiy hujjat

- [RD: High availability with Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/)
- [RD: Redis replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
