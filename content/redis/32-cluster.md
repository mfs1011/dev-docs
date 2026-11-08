# 32 — Cluster

[Mundarija](README.md)

## Tushuncha

RD (Scale with Redis Cluster): Redis **gorizontal** (serverlar qo'shib) kengayadi — **Redis Cluster** joylashtirish sxemasi bilan:

- ma'lumot bir nechta tugunlar (node) orasida **avtomatik bo'linadi** (sharding);
- tugunlarning bir qismi ishdan chiqsa yoki aloqa uzilsa ham ish davom etadi.

Lekin kattaroq nosozlikda (masalan, master'larning **ko'pchiligi** ishlamasa) klaster ishlamay qoladi.

### Portlar

Har tugunga ikkita TCP port kerak (RD):

1. **Mijoz porti** (masalan, 6379) — mijozlar va kalit ko'chirishda boshqa tugunlar uchun.
2. **Klaster shinasi** (cluster bus) porti — standart: mijoz porti + 10000 (16379), `cluster-port` bilan o'zgartiriladi. Tugunlararo ikkilik protokol: nosozlikni aniqlash, konfiguratsiya yangilash, failover'ga ruxsat. Mijozlar unga ulanmaydi.

Ikkalasi ham firewall'da ochiq bo'lishi kerak. **Docker**: Cluster NAT va port almashtirishni qo'llamaydi — host tarmoq rejimi (`--net=host`) kerak.

### Hash slot'lar

RD: Cluster izchil xeshlash (consistent hashing) emas, **hash slot** ishlatadi: **16384** ta slot; kalit sloti — `CRC16(kalit) mod 16384`. Har tugun slotlarning bir qismiga javob beradi, masalan:

| Tugun | Slotlar |
| --- | --- |
| A | 0 – 5500 |
| B | 5501 – 11000 |
| C | 11001 – 16383 |

Tugun qo'shish yoki olib tashlash — slotlarni ko'chirish; bu ishni **to'xtatmasdan** bajariladi.

**Ko'p kalitli amallar** (bitta buyruq, tranzaksiya yoki Lua skript) — faqat barcha kalitlar **bitta slotda** bo'lsa. **Hash tag**: kalitda `{…}` bo'lsa, faqat qavs ichi xeshlanadi — `user:{123}:profile` va `user:{123}:account` doim bitta slotda.

### Master-replika

RD: har slot uchun 1 (master) dan N gacha nusxa. A, B, C master'larga A1, B1, C1 replikalar qo'shilsa, B ishdan chiqqanda B1 master bo'ladi. B va B1 **bir vaqtda** ishdan chiqsa — klaster ishlamaydi.

### Izchillik kafolati

RD: Cluster **kuchli izchillik**ni kafolatlamaydi — tasdiqlangan yozuv yo'qolishi mumkin:

1. **Asinxron replikatsiya**: B mijozga `OK` beradi, replikalarga yuborishdan oldin qulasa — yozuv yo'qoladi (har soniyada diskka yozadigan bazalarga o'xshash). `WAIT` ehtimolni ancha kamaytiradi, lekin kuchli izchillik bermaydi.
2. **Tarmoq bo'linishi**: mijoz Z1 ozchilik tomonda B bilan qolsa, B ga yozishda davom etadi; bo'linish B1 master bo'lguncha cho'zilsa, bu yozuvlar yo'qoladi. Maksimal oyna — **node timeout**: shu vaqtdan keyin ozchilikdagi master yozishni to'xtatadi.

### Sozlamalar

| Sozlama | Nima (RD) |
| --- | --- |
| `cluster-enabled yes` | Klaster rejimi |
| `cluster-config-file nodes.conf` | Tugun holatini o'zi yozadigan fayl — **qo'lda tahrirlanmaydi** |
| `cluster-node-timeout` | Tugun shuncha ms javob bermasa — ishlamayapti; master bo'lsa replikasi o'rnini egallaydi |
| `cluster-require-full-coverage` | `yes` (standart) — biror slot qoplanmasa, klaster yozishni to'xtatadi |
| `cluster-allow-reads-when-down` | `no` (standart) — klaster ishlamay qolganda tugun hech qanday so'rovga javob bermaydi |
| `cluster-migration-barrier`, `cluster-slave-validity-factor` | Replika ko'chishi, failover'ga yaroqlilik |

Minimal ishlaydigan klaster — **3 master**; RD tavsiyasi — **6 tugun** (3 master + 3 replika).

### Boshqaruv

| Buyruq | Nima |
| --- | --- |
| `redis-cli --cluster create host:port … --cluster-replicas 1` | Klaster yaratish (har master'ga 1 replika) |
| `redis-cli -c` | Klaster rejimida — `MOVED` yo'naltirishlarga avtomatik ergashadi |
| `redis-cli --cluster check host:port` | Holatni tekshirish |
| `redis-cli --cluster reshard host:port --cluster-from ID --cluster-to ID --cluster-slots N --cluster-yes` | Slotlarni ko'chirish (savolsiz) |
| `CLUSTER INFO`, `CLUSTER NODES`, `CLUSTER KEYSLOT k`, `CLUSTER MYID` | Ma'lumot |
| `CLUSTER FAILOVER` (replikada) | Qo'lda failover |

Har tugun birinchi ishga tushganda o'ziga doimiy **Node ID** beradi; tugunlar bir-birini IP yoki port bilan emas, shu ID bilan eslaydi.

**Qo'lda failover** (RD): masalan, master'ni yangilash uchun. Oddiy failover'dan xavfsizroq — mijozlar yangi master'ga faqat u eski master'ning butun replikatsiya oqimini olgani aniq bo'lgandan keyin o'tkaziladi; ma'lumot yo'qolmaydi.

Mijozdan ishlatish uchun **klasterni qo'llovchi** kutubxona kerak.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3) — RD tutorial'idagidek bitta kompyuterda 6 tugun (7000–7005; faqat sinov — haqiqiy klasterda tugunlar alohida kompyuterlarda).

### Tugunlarni ishga tushirish

```text vps
$ ss -ltn | grep -cE ':(1?700[0-5]) '; rm -rf /tmp/r32 && mkdir -p /tmp/r32 && cd /tmp/r32 && for p in 7000 7001 7002 7003 7004 7005; do mkdir $p; printf '%s\n' "port $p" 'bind 127.0.0.1' 'cluster-enabled yes' 'cluster-config-file nodes.conf' 'cluster-node-timeout 5000' 'appendonly yes' 'daemonize yes' "logfile /tmp/r32/$p/log" "dir /tmp/r32/$p" > $p/redis.conf; done; cat 7000/redis.conf
0
port 7000
bind 127.0.0.1
cluster-enabled yes
cluster-config-file nodes.conf
cluster-node-timeout 5000
appendonly yes
daemonize yes
logfile /tmp/r32/7000/log
dir /tmp/r32/7000
$ for p in 7000 7001 7002 7003 7004 7005; do redis-server /tmp/r32/$p/redis.conf; done; sleep 1; grep -h "No cluster configuration found" /tmp/r32/700?/log | cut -d' ' -f5- | sed -E 's/[0-9a-f]{40}/<node-id>/' | sort | uniq -c
      1 19:51:56.306 * No cluster configuration found, I'm <node-id>
      1 19:51:56.321 * No cluster configuration found, I'm <node-id>
      1 19:51:56.346 * No cluster configuration found, I'm <node-id>
      1 19:51:56.361 * No cluster configuration found, I'm <node-id>
      1 19:51:56.378 * No cluster configuration found, I'm <node-id>
      1 19:51:56.394 * No cluster configuration found, I'm <node-id>
```

- Portlar bo'sh (`0`). RD'dagi minimal konfiguratsiya.
- Har tugun: "No cluster configuration found, I'm <node-id>" — o'z Node ID'si.

### Klaster yaratish

```text vps
$ redis-cli --cluster create 127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 --cluster-replicas 1 --cluster-yes 2>&1 | grep -E '^(Master\[|Adding replica|\[OK\]|>>> Performing hash)' 
>>> Performing hash slots allocation on 6 nodes...
Master[0] -> Slots 0 - 5460
Master[1] -> Slots 5461 - 10922
Master[2] -> Slots 10923 - 16383
Adding replica 127.0.0.1:7004 to 127.0.0.1:7000
Adding replica 127.0.0.1:7005 to 127.0.0.1:7001
Adding replica 127.0.0.1:7003 to 127.0.0.1:7002
[OK] All nodes agree about slots configuration.
[OK] All 16384 slots covered.
$ sleep 3; redis-cli -p 7000 CLUSTER INFO | grep -E '^cluster_(state|slots_assigned|slots_ok|known_nodes|size):'; nodes() { redis-cli -p ${1:-7000} CLUSTER NODES | awk '{split($2,a,"@"); sub(/myself,/,"",$3); print a[1], $3, ($4=="-"?"":"(master: " substr($4,1,8) ")"), $8, $9, $10}' | sort; }; nodes
cluster_state:ok
cluster_slots_assigned:16384
cluster_slots_ok:16384
cluster_known_nodes:6
cluster_size:3
127.0.0.1:7000 master  connected 0-5460 
127.0.0.1:7001 master  connected 5461-10922 
127.0.0.1:7002 master  connected 10923-16383 
127.0.0.1:7003 slave (master: 6fc6366e) connected  
127.0.0.1:7004 slave (master: 86e5461c) connected  
127.0.0.1:7005 slave (master: 4488728d) connected  
```

- 16384 slot 3 master'ga teng bo'lindi, har biriga bitta replika.
- `cluster_state:ok`, `cluster_size:3`. `nodes` — `CLUSTER NODES` dan qisqa ko'rinish (manzil, rol, master ID'sining boshi, slotlar).

### Slotlar va yo'naltirish

```text vps
$ redis-cli -p 7000 CLUSTER KEYSLOT foo; redis-cli -p 7000 CLUSTER KEYSLOT hello; redis-cli -p 7000 CLUSTER KEYSLOT 'user:{123}:profile'; redis-cli -p 7000 CLUSTER KEYSLOT 'user:{123}:account'
12182
866
5970
5970
$ redis-cli -p 7000 SET foo bar; redis-cli -c -p 7000 SET foo bar; redis-cli -c -p 7000 GET foo; redis-cli -c -p 7000 SET hello world
MOVED 12182 127.0.0.1:7002

OK
bar
OK
```

- `foo` → 12182, `hello` → 866 — RD'dagi bilan bir xil (CRC16 deterministik).
- Hash tag'li ikki kalit — bitta slot (5970).
- `-c` siz — `MOVED 12182 127.0.0.1:7002`: "bu kalit u yerda". `-c` bilan `redis-cli` o'zi o'sha tugunga o'tdi.

```text vps
$ redis-cli -c -p 7000 MSET a 1 b 2; redis-cli -c -p 7000 MSET 'user:{123}:profile' ali 'user:{123}:account' 100; redis-cli -c -p 7000 MGET 'user:{123}:profile' 'user:{123}:account'
CROSSSLOT Keys in request don't hash to the same slot

OK
ali
100
```

`a` va `b` har xil slotlarda — `CROSSSLOT`; hash tag'li kalitlar bilan `MSET` va `MGET` ishladi.

### Taqsimot

```text vps
$ for i in $(seq 1 3000); do echo "SET k:$i v"; done | redis-cli -c -p 7000 > /dev/null; for p in 7000 7001 7002 7003 7004 7005; do echo "$p: $(redis-cli -p $p ROLE | head -1) $(redis-cli -p $p DBSIZE)"; done
7000: master 1003
7001: master 1009
7002: master 992
7003: slave 0
7004: slave 0
7005: slave 0
```

3000 kalit uchala master'ga deyarli teng tushdi. Replikalarda hali `0` — kuzatildi: boshlang'ich sinxronlash (disksiz, ~5 s kechikish, 30-bob) tugamagan edi.

### Reshard

```text vps
$ id() { redis-cli -p $1 CLUSTER MYID; }; redis-cli --cluster reshard 127.0.0.1:7000 --cluster-from $(id 7000) --cluster-to $(id 7002) --cluster-slots 1000 --cluster-yes > /dev/null 2>&1; redis-cli --cluster check 127.0.0.1:7000 2>&1 | grep -E 'keys \||\[OK\]' | sed -E 's/[0-9a-f]{40}/<id>/; s/ \(<id>\.\.\.\)//; s/^([0-9.:]+) \([0-9a-f]+\.\.\.\)/\1/'
127.0.0.1:7000 -> 815 keys | 4461 slots | 1 slaves.
127.0.0.1:7001 -> 1009 keys | 5462 slots | 1 slaves.
127.0.0.1:7002 -> 1180 keys | 6461 slots | 1 slaves.
[OK] 3004 keys in 3 masters.
[OK] All nodes agree about slots configuration.
[OK] All 16384 slots covered.
```

7000 dan 7002 ga 1000 slot ko'chirildi — kalitlar ham ular bilan (815 / 1180). Ish to'xtamadi; `[OK] All 16384 slots covered`.

### Master ishdan chiqdi

```text vps
$ k=$(redis-cli -p 7002 RANDOMKEY); echo "7002 dagi kalit: $k"; kill -9 $(pgrep -f 'redis-server 127.0.0.1:7002 '); t0=$(date +%s); until redis-cli -p 7000 CLUSTER INFO | grep -q '^cluster_state:fail'; do sleep 0.2; done; echo "holat fail: $(( $(date +%s) - t0 )) soniyada"; redis-cli -c -p 7000 GET $k; until redis-cli -p 7000 CLUSTER INFO | grep -q '^cluster_state:ok'; do sleep 0.2; done; echo "holat yana ok: $(( $(date +%s) - t0 )) soniyada"; nodes; redis-cli -c -p 7000 GET $k
7002 dagi kalit: k:2313
holat fail: 7 soniyada
CLUSTERDOWN The cluster is down

holat yana ok: 8 soniyada
127.0.0.1:7000 master  connected 1000-5460 
127.0.0.1:7001 master  connected 5461-10922 
127.0.0.1:7002 master,fail  disconnected  
127.0.0.1:7003 slave (master: 6fc6366e) connected  
127.0.0.1:7004 slave (master: 86e5461c) connected  
127.0.0.1:7005 master  connected 0-999 10923-16383
v
$ grep -hE 'as failing|Cluster state changed: fail|Starting a failover election|Failover election won|Cluster state changed: ok' /tmp/r32/700?/log | cut -d' ' -f5- | sed -E 's/[0-9a-f]{40}/<id>/g' | sort | tail -8
19:52:11.322 # Cluster state changed: fail
19:52:12.104 * Starting a failover election for epoch 8.
19:52:12.106 * Cluster state changed: ok
19:52:12.106 * Failover election won: I'm the new master.
19:52:12.207 * Cluster state changed: ok
19:52:12.208 * Cluster state changed: ok
19:52:12.209 * Cluster state changed: ok
19:52:12.210 * Cluster state changed: ok
```

| Vaqt | Holat |
| --- | --- |
| 0 s | 7002 `kill -9` |
| ~7 s | `cluster_state:fail` — node timeout (5 s) o'tdi; 7002 dagi kalit — `CLUSTERDOWN` |
| ~8 s | Replika (7005) saylovda yutdi, `cluster_state:ok`; kalit yana o'qiladi (`v`) |

`cluster-require-full-coverage yes` va `cluster-allow-reads-when-down no` (standart) — slotlarning bir qismi qoplanmagan paytda butun klaster so'rovlarga `CLUSTERDOWN` bilan javob berdi.

### Eski master qaytdi

```text vps
$ redis-server /tmp/r32/7002/redis.conf; sleep 3; nodes | grep 7002
127.0.0.1:7002 slave (master: e95477d9) connected  
```

7002 qayta ishga tushdi — endi **replika** (o'rnini egallagan yangi master'ning).

### Qo'lda failover

```text vps
$ r=$(nodes | awk '/7000/{next} /slave/ && $4 ~ /'"$(id 7000 | cut -c1-8)"'/ {print $1}' | cut -d: -f2); echo "7000 ning replikasi: $r"; redis-cli -p $r CLUSTER FAILOVER; sleep 3; nodes | grep -E "700[0]|$r"; grep -hE 'Manual failover user request accepted|Failover election won' /tmp/r32/$r/log | cut -d' ' -f5- | tail -2
7000 ning replikasi: 7003
OK
127.0.0.1:7000 slave (master: 002416d2) connected  
127.0.0.1:7003 master  connected 1000-5460 
19:52:15.368 * Manual failover user request accepted.
19:52:15.371 * Failover election won: I'm the new master.
```

7000 ning replikasida `CLUSTER FAILOVER` — rollar almashdi: replika master bo'ldi, 7000 — replika. Jurnalda RD'dagi "Manual failover user request accepted" va "Failover election won".

```text vps
$ for p in 7000 7001 7002 7003 7004 7005; do redis-cli -p $p SHUTDOWN NOSAVE 2>/dev/null; done; sleep 0.5; rm -rf /tmp/r32; pgrep -fc 'redis-server 127.0.0.1:700[0-5]'
0
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat mijoz portini ochish | Klaster shinasi yopiq — tugunlar gaplashmaydi (RD) | Ikkala port: `6379` va `16379` |
| Docker port almashtirish bilan | NAT qo'llanmaydi (RD) | `--net=host` |
| Turli slotdagi kalitlarga `MSET`/tranzaksiya/skript | `CROSSSLOT` | Hash tag: `{user:123}` |
| Klasterni qo'llamaydigan mijoz | `MOVED` ga ergashmaydi | Klasterni qo'llovchi kutubxona, `redis-cli -c` |
| 3 dan kam master yoki replikasiz | Bitta master ishdan chiqsa — klaster to'xtaydi | 3 master + 3 replika (RD tavsiyasi) |
| Master va uning replikasi bitta kompyuterda | Birga ishdan chiqadi | Har xil kompyuterlarda |
| `nodes.conf` ni qo'lda tahrirlash | Tugun o'zi yozadi (RD) | `CLUSTER …`, `redis-cli --cluster …` |
| Cluster yozuvlarni yo'qotmaydi deb o'ylash | Asinxron replikatsiya va bo'linishda yo'qolishi mumkin (RD) | `WAIT`, node timeout'ni tushunish |
| Bitta tugun ishdan chiqqanda qolgan slotlar ishlaydi deb kutish | Standart sozlamada butun klaster `CLUSTERDOWN` (sinovda) | Replikalar; kerak bo'lsa `cluster-require-full-coverage no` |

## Amaliyot

1. Klasterda nechta hash slot bor va kalit sloti qanday hisoblanadi?
2. Nega `MSET a 1 b 2` klasterda xato berdi va qanday tuzatiladi?
3. `MOVED` xatosi nimani bildiradi?
4. Har tugunga qaysi ikki port kerak?
5. Cluster qaysi ikki holatda tasdiqlangan yozuvni yo'qotishi mumkin?
6. Sinovda master ishdan chiqqanda nima bo'ldi va qancha vaqt oldi?

<details>
<summary>Javoblar</summary>

1. 16384; `CRC16(kalit) mod 16384`.
2. Kalitlar har xil slotlarda (`CROSSSLOT`); hash tag bilan bitta slotga tushirish.
3. Kalit boshqa tugunda — manzili ko'rsatilgan; klasterni qo'llovchi mijoz o'sha tugunga o'tadi.
4. Mijoz porti va klaster shinasi porti (standart +10000).
5. Asinxron replikatsiya (master replikaga yubormay qulasa) va tarmoq bo'linishi (ozchilikdagi master'ga yozuvlar).
6. ~7 s da `cluster_state:fail` (`CLUSTERDOWN`), ~8 s da replika master bo'ldi va klaster yana `ok`.

</details>

## Rasmiy hujjat

- [RD: Scale with Redis Cluster](https://redis.io/docs/latest/operate/oss_and_stack/management/scaling/)
- [RD: Redis Cluster specification](https://redis.io/docs/latest/operate/oss_and_stack/reference/cluster-spec/)
- [RD: CLUSTER FAILOVER](https://redis.io/docs/latest/commands/cluster-failover/) · [CLUSTER KEYSLOT](https://redis.io/docs/latest/commands/cluster-keyslot/)
