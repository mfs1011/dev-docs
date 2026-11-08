# 33 — Kuzatish va kechikish

[Mundarija](README.md)

## Tushuncha

RD (Diagnosing latency issues): **kechikish** (latency) — mijoz buyruq yuborgan paytdan javob olgunicha bo'lgan **maksimal** vaqt. Redis buyruqni odatda mikrosoniyadan ham tez bajaradi, lekin ba'zi sharoitlarda kechikish oshadi.

### Tezkor ro'yxat (RD)

1. Serverni bloklaydigan **sekin buyruqlar** yo'qligini tekshiring — `SLOWLOG`.
2. EC2'da — zamonaviy HVM instance'lar (aks holda `fork()` juda sekin).
3. **Transparent huge pages** (THP) o'chirilsin: `echo never > /sys/kernel/mm/transparent_hugepage/enabled`, keyin Redis'ni qayta ishga tushirish.
4. Virtual mashinada — muhitning o'z kechikishini o'lchang: `redis-cli --intrinsic-latency 100` (**serverning o'zida**).
5. **Latency monitor**ni yoqing va ishlating.

Ishonchlilik va kechikish muvozanati (xavfsizdan tezga): AOF + `fsync always` (juda sekin) → AOF + `everysec` (yaxshi murosa) → AOF + `everysec` + `no-appendfsync-on-rewrite yes` → AOF + `fsync no` → RDB (28-bob).

### Kechikish manbalari (RD)

| Manba | Nima |
| --- | --- |
| **Muhitning o'zi** (intrinsic) | OS yadrosi va gipervizor kechikishi — Redis bundan yaxshi bo'la olmaydi. Virtual muhitda, ayniqsa "shovqinli qo'shnilar" bilan, ancha yomon |
| **Tarmoq** | 1 Gbit/s tarmoqda ~200 µs, Unix soketda ~30 µs. Ko'p borib-kelish qimmat — pipeline (14-bob), ko'p kalitli buyruqlar |
| **Bitta oqim** | Redis so'rovlarni asosan **bitta oqimda** ketma-ket bajaradi (multipleksing). Bitta sekin so'rov — hammani kutdiradi |
| **Sekin buyruqlar** | Ko'p elementli `SORT`, `LREM`, `SUNION`, katta to'plamlar kesishmasi; har buyruq murakkabligi hujjatda yozilgan. **Juda keng tarqalgan sabab — production'da `KEYS`** (o'rniga `SCAN`, 4-bob) |
| **`fork`** | RDB yoki AOF qayta yozish uchun; sahifa jadvalini nusxalaydi (24 GB → ~48 MB jadval). Ba'zi Xen VM'larida juda sekin. `INFO` dagi `latest_fork_usec` |
| **THP** | `fork` dan keyin band serverda deyarli butun xotira nusxalanadi — katta kechikish va xotira |
| **Swap** | Redis sahifasi diskka chiqarilsa, unga murojaat disk tezligida |
| **AOF va disk** | `fsync`, `write` disk band bo'lsa kutadi |
| **Muddatlar** | Faol tozalash har 100 ms da ~20 kalit namunasi; namunadagi 25% dan ko'pi muddati o'tgan bo'lsa — takrorlaydi. Bir soniyada **juda ko'p** kalit muddati tugasa — Redis bloklanishi mumkin |

Sekin so'rovlardan qochib bo'lmasa — ularni replikada bajaring (30-bob). CPU yuqori, trafik past bo'lsa — odatda sekin buyruq belgisi.

### Asboblar

| Asbob | Nima |
| --- | --- |
| `redis-cli --intrinsic-latency SONIYA` | Muhit kechikishi (serverga ulanmaydi; bitta yadroni band qiladi) |
| `redis-cli --latency` | Server kechikishini millisoniyada o'lchash (`PING` lar) |
| `SLOWLOG GET [n]` | Chegaradan sekin buyruqlar (`slowlog-log-slower-than`, mikrosoniya; `slowlog-max-len`) |
| `CONFIG SET latency-monitor-threshold MS` | Latency monitor (standart `0` — o'chiq) |
| `LATENCY LATEST`, `HISTORY hodisa`, `GRAPH`, `DOCTOR`, `RESET` | Monitor hisobotlari |
| `INFO [bo'lim]` | `stats`, `memory`, `clients`, `persistence`, `replication` … |
| `MEMORY DOCTOR` | Xotira muammolari tahlili |

`SLOWLOG` vaqtiga mijoz bilan aloqa (I/O) **kirmaydi** — faqat buyruqni bajarish (RD). Har yozuvda 7 qiymat: ID, Unix vaqti, bajarilish vaqti (µs), argumentlar, mijoz manzili, mijoz nomi va argumentlar soni (oxirgisi — Redis 8.10 dan).

**Latency monitor** (RD, 2.8.13 dan): kodning kechikishga sezgir joylari — **hodisalar** (`command`, `fast-command`, `fork`, `aof-write`, `expire-cycle`, `eviction-cycle` …). Chegaradan uzoq davom etgan har hodisa vaqt qatoriga yoziladi: har hodisaga 160 element, bir soniyadagilar maksimal qiymat bilan birlashtiriladi. Monitor narxi deyarli nol, lekin standart o'chiq.

### Administrator maslahatlari (RD — Redis administration)

- **Linux**'da ishlating (asosiy sinov va production — Linux).
- `vm.overcommit_memory = 1` (`/etc/sysctl.conf`, so'ng `sysctl vm.overcommit_memory=1`) — aks holda fon saqlash `fork()` xatosi bilan tushishi mumkin.
- THP'ni o'chiring.
- **Swap** yoqilgan va hajmi RAM'ga teng bo'lsin — aks holda xotira tugaganda Redis qulashi yoki OOM killer uni o'ldirishi mumkin.
- Aniq `maxmemory` bering (27-bob); ko'p yozishli ilovada RDB/AOF qayta yozish paytida xotira **2 barobargacha** oshishi mumkin.
- daemontools ostida — `daemonize no`.
- Replikatsiyada yetarli backlog; disk ishlatilmasa — disksiz replikatsiya; master saqlashsiz bo'lsa — avtomatik qayta ishga tushirishni o'chirish (30-bob).

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, 1,8 GB RAM'li virtual server).

### Tizim sozlamalari

```text vps
$ cat /sys/kernel/mm/transparent_hugepage/enabled; sysctl vm.overcommit_memory; free -m | awk 'NR==1 || /^Swap/'; grep -hiE 'WARNING' /var/log/redis/redis-server.log | cut -d' ' -f5- | sed -E 's/^[0-9:.]+ //' | sort -u | cut -c1-200 | head -4
always [madvise] never
vm.overcommit_memory = 0
               total        used        free      shared  buff/cache   available
Swap:            896          43         852
# WARNING Memory overcommit must be enabled! Without it, a background save or replication may fail under low memory condition. Being disabled, it can also cause failures without low memory condition, 
# WARNING: Redis does not require authentication. Redis will accept connections from any local client.
```

- THP — `madvise` (`never` emas).
- `vm.overcommit_memory = 0` — Redis jurnalida aynan shu haqida `WARNING`: overcommit yoqilmagan, fon saqlash yoki replikatsiya xotira kam bo'lganda tushishi mumkin.
- Swap 896 MB (RAM 1,8 GB — RD tavsiyasidan kam).

Bu sinov serveri sozlamalari o'zgartirilmadi; production uchun RD tavsiyasi — `overcommit_memory = 1`, THP `never`, swap ≈ RAM.

### Muhit va server kechikishi

```text vps
$ redis-cli --intrinsic-latency 10 | tail -2
137613567 total runs (avg latency: 0.0727 microseconds / 72.67 nanoseconds per run).
Worst run took 41711x longer than the average latency.
$ timeout -s INT 3 redis-cli --latency --raw; echo; timeout -s INT 3 redis-cli --latency
0.083 1.244 0.194 99

0.093 0.463 0.186 99
```

- `--intrinsic-latency 10`: o'rtacha ~73 ns, eng yomoni o'rtachadan 41 711 marta uzun — taxminan **3 ms** (virtual server; RD'dagi Linode misolida 9,7 ms).
- `--latency` (`--raw` bilan): min / max / o'rtacha ms va namunalar soni — o'rtacha ~0,19 ms, eng yomoni ~1,2 ms.

### Standart chegaralar

```text vps
$ redis-cli CONFIG GET slowlog-log-slower-than slowlog-max-len latency-monitor-threshold
latency-monitor-threshold
0
slowlog-log-slower-than
10000
slowlog-max-len
128
```

`slowlog-log-slower-than` — 10 000 µs (10 ms), 128 yozuv; latency monitor o'chiq (`0`).

### SLOWLOG

Sinov serveri 7070 da million kalit:

```text vps
$ redis-server --port 7070 --bind 127.0.0.1 --save '' --daemonize yes --logfile /tmp/r7070.log --enable-debug-command local; sleep 0.5; r() { redis-cli -p 7070 "$@"; }; seq 1 1000000 | awk '{printf "*3\r\n$3\r\nSET\r\n$%d\r\nk:%s\r\n$1\r\nv\r\n", length($1)+2, $1}' | redis-cli -p 7070 --pipe 2>&1 | tail -1
errors: 0, replies: 1000000
$ r SLOWLOG RESET; r KEYS 'k:99999*' | wc -l; r SET oddiy 1 > /dev/null; r --no-raw SLOWLOG GET 2 | head -12
OK
11
1) 1) (integer) 0
   2) (integer) 1794156904
   3) (integer) 252673
   4) 1) "KEYS"
      2) "k:99999*"
   5) "127.0.0.1:34740"
   6) ""
   7) (integer) 2
```

`KEYS 'k:99999*'` — 11 ta natija uchun **252 673 µs** (~0,25 s) — butun server shu vaqt band. Oddiy `SET` jurnalga tushmadi (10 ms dan tez). 7-qiymat — argumentlar soni (`2`).

### Latency monitor

```text vps
$ r CONFIG SET latency-monitor-threshold 100; r DEBUG SLEEP 0.3; r --no-raw LATENCY LATEST
OK
OK
1) 1) "command"
   2) (integer) 1794156904
   3) (integer) 300
   4) (integer) 300
$ r DEBUG SLEEP 0.5; r --no-raw LATENCY HISTORY command; r LATENCY DOCTOR | head -25
OK
1) 1) (integer) 1794156904
   2) (integer) 300
2) 1) (integer) 1794156905
   2) (integer) 500
Dave, I have observed latency spikes in this Redis instance. You don't mind talking about it, do you Dave?

1. command: 2 latency spikes (average 400ms, mean deviation 100ms, period 0.50 sec). Worst all time event 500ms.

I have a few advices for you:

- Check your Slow Log to understand what are the commands you are running which are too slow to execute. Please check https://redis.io/commands/slowlog for more information.
- Deleting, expiring or evicting (because of maxmemory policy) large objects is a blocking operation. If you have very large objects that are often deleted, expired, or evicted, try to fragment those objects into multiple smaller objects.
```

- Chegara 100 ms; `DEBUG SLEEP` (sinov serverida `enable-debug-command local` bilan yoqilgan) — RD tutorial'idagi "osilgan server" taqlidi.
- `LATENCY LATEST`: `command` hodisasi — oxirgi 300 ms, eng yomoni 300 ms. `HISTORY` — 300 va 500 ms.
- `LATENCY DOCTOR` — odam o'qiydigan tahlil va maslahatlar (SLOWLOG'ni tekshirish, katta obyektlarni o'chirish/muddat/evikt bloklashi haqida).

### `fork` va `INFO`

```text vps
$ r BGSAVE > /dev/null; sleep 2; r INFO stats | grep -E '^latest_fork_usec'; r INFO memory | grep -E '^used_memory_human'
latest_fork_usec:4908
used_memory_human:44.94M
$ r INFO stats | grep -E '^(total_connections_received|total_commands_processed|instantaneous_ops_per_sec|rejected_connections|expired_keys|evicted_keys|keyspace_hits|keyspace_misses):'; r INFO clients | grep -E '^(connected_clients|blocked_clients):'
total_connections_received:15
total_commands_processed:1000014
instantaneous_ops_per_sec:0
rejected_connections:0
expired_keys:0
evicted_keys:0
keyspace_hits:0
keyspace_misses:0
connected_clients:1
blocked_clients:0
```

~45 MB ma'lumot uchun `fork` — 4,9 ms (`latest_fork_usec:4908`). `INFO stats` va `clients` — umumiy hisoblagichlar.

### Bir vaqtda tugaydigan muddatlar

500 000 kalit — **hammasi bitta soniyada** (`EXAT` bilan) tugaydi; monitor chegarasi 5 ms:

```text vps
$ r FLUSHALL > /dev/null; r CONFIG SET latency-monitor-threshold 5 > /dev/null; r LATENCY RESET > /dev/null; t=$(( $(date +%s) + 3 )); seq 1 500000 | awk -v t=$t '{printf "*5\r\n$3\r\nSET\r\n$%d\r\ne:%s\r\n$1\r\nv\r\n$4\r\nEXAT\r\n$%d\r\n%s\r\n", length($1)+2, $1, length(t), t}' | redis-cli -p 7070 --pipe 2>&1 | tail -1; sleep 6; r DBSIZE; r INFO stats | grep -E '^expired_keys'; r --no-raw LATENCY LATEST
errors: 0, replies: 500000
0
expired_keys:500000
expired_keys_active:500000
1) 1) "expire-cycle"
   2) (integer) 1794156914
   3) (integer) 25
   4) (integer) 26
```

Hammasi faol tozalandi (`expired_keys_active:500000`) va monitor `expire-cycle` hodisasini qayd etdi — **25–26 ms** lik kechikish. RD aytganidek: bir vaqtda ko'p kalit muddati tugashi — kechikish manbai.

```text vps
$ r MEMORY DOCTOR | head -3; r SHUTDOWN NOSAVE; rm -f /tmp/r7070.log
Hi Sam, this instance is empty or is using very little memory, my issues detector can't be used in these conditions. Please, leave for your mission on Earth and fill it with some data. The new Sam and I will be back to our programming as soon as I finished rebooting.
```

`MEMORY DOCTOR` — bo'sh serverda tahlil qilmaydi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Production'da `KEYS` | Server bloklanadi (sinovda 0,25 s) — RD: eng keng tarqalgan sabab | `SCAN` |
| Latency monitor'ni yoqmaslik | Standart o'chiq — kechikish sababi noma'lum qoladi | `latency-monitor-threshold` (masalan, 100) |
| Kechikishni faqat ilova tomonidan o'lchash | Tarmoq va muhit kechikishi aralashadi | `--intrinsic-latency` (serverda), `--latency`, `SLOWLOG` |
| Ko'p kalitga bir xil muddat berish | Bir soniyada ommaviy tozalash — kechikish (sinovda 25 ms) | Muddatlarni bitta soniyaga to'plamaslik |
| `overcommit_memory = 0` | Fon saqlash/replikatsiya xatosi mumkin (Redis ogohlantiradi) | `vm.overcommit_memory = 1` |
| THP yoqilgan | `fork` dan keyin katta kechikish va xotira (RD) | `never` |
| Swap'siz server | Xotira tugasa — qulash yoki OOM killer (RD) | Swap ≈ RAM, `maxmemory` |
| Ko'p mayda borib-kelish | Tarmoq kechikishi yig'iladi | Pipeline, ko'p kalitli buyruqlar |

## Amaliyot

1. Redis'da kechikish qanday ta'riflanadi?
2. Nega bitta sekin buyruq barcha mijozlarni sekinlashtiradi?
3. `--intrinsic-latency` nimani o'lchaydi va qayerda ishga tushiriladi?
4. `SLOWLOG` vaqtiga nima kiradi, nima kirmaydi?
5. Latency monitor qanday yoqiladi va qaysi buyruqlar bilan o'qiladi?
6. Sinovda qaysi uch holat kechikish berdi?

<details>
<summary>Javoblar</summary>

1. Buyruq yuborilgandan javob olingunicha bo'lgan maksimal vaqt.
2. Redis so'rovlarni asosan bitta oqimda ketma-ket bajaradi.
3. OS/gipervizor kechikishini; Redis serverining o'zida.
4. Faqat buyruqni bajarish vaqti; mijoz bilan I/O kirmaydi.
5. `CONFIG SET latency-monitor-threshold <ms>`; `LATENCY LATEST`, `HISTORY`, `DOCTOR`, `GRAPH`.
6. `KEYS` (0,25 s), `DEBUG SLEEP` (300/500 ms), bir vaqtda tugagan 500 000 muddat (`expire-cycle` 25 ms).

</details>

## Rasmiy hujjat

- [RD: Diagnosing latency issues](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/)
- [RD: Latency monitoring](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency-monitor/)
- [RD: Redis administration](https://redis.io/docs/latest/operate/oss_and_stack/management/admin/)
- [RD: SLOWLOG GET](https://redis.io/docs/latest/commands/slowlog-get/) · [LATENCY DOCTOR](https://redis.io/docs/latest/commands/latency-doctor/)
