# 27 — Xotira chegarasi va evikt

[Mundarija](README.md)

## Tushuncha

RD (Key eviction): Redis ko'pincha sekin server yoki bazaga o'qishni tezlashtiruvchi **kesh** sifatida ishlatiladi. Kesh yozuvlari — doimiy saqlangan ma'lumotning nusxasi, shuning uchun xotira tugaganda ularni **chiqarib tashlash** (evict — "evikt") odatda xavfsiz: kerak bo'lsa keyin yana keshlanadi.

Ish tartibi (RD): mijoz ma'lumot qo'shadigan buyruq yuborganda Redis xotirani tekshiradi; chegara oshgan bo'lsa — tanlangan **evikt siyosati** bo'yicha kalitlarni o'chiradi, toki xotira chegaradan pastga tushmaguncha. Ko'p ma'lumot qo'shadigan bitta buyruq (masalan, katta to'plam kesishmasini yangi kalitga yozish) chegarani vaqtincha ancha oshirishi mumkin.

### `maxmemory`

```text
maxmemory 100mb
```

yoki ishlab turganda `CONFIG SET maxmemory 100mb` (26-bob). `0` — cheklovsiz: 64 bitli tizimlarda standart (32 bitlida — yashirin 3 GB chegara) (RD).

**Replikatsiya yoki saqlash yoqilgan bo'lsa** (RD): replikalarga yoki AOF'ga yozilishni kutayotgan o'zgarishlar buferi `maxmemory` hisobiga **kirmaydi** (aks holda evikt buferni to'ldirib, yangi evikt chaqirardi — ortiqcha o'chirishlar zanjiri). Shuning uchun `maxmemory` ni buferlarga biroz joy qoldirib belgilang (`noeviction` da shart emas). Bufer hajmi — `INFO memory` dagi `mem_not_counted_for_evict`.

**Xotira OS'ga darhol qaytmaydi** (RD, Memory optimization): kalitlar o'chirilganda Redis xotirani operatsion tizimga har doim ham qaytarmaydi — ko'p `malloc()` shunday ishlaydi. 5 GB to'ldirib, 2 GB o'chirsangiz, RSS (jarayon egallagan fizik xotira) ~5 GB atrofida qolishi mumkin. Demak xotirani **eng yuqori** (peak) foydalanishga qarab rejalashtiring. Ajratuvchi (allocator) bo'shagan joyni qayta ishlatadi — yangi kalitlar qo'shilganda RSS o'smaydi. Shu sababli bunday holatda `mem_fragmentation_ratio` (RSS / ishlatilgan xotira) ishonchli emas. `maxmemory` berilmasa, Redis asta-sekin butun bo'sh xotirani egallashi mumkin.

### Siyosatlar (`maxmemory-policy`)

| Siyosat | Nimani o'chiradi (RD) |
| --- | --- |
| `noeviction` | Hech narsani; ma'lumot qo'shadigan buyruqlarga **xato**. O'qish ishlayveradi. Replikatsiyada — faqat asosiy serverda |
| `allkeys-lru` | Eng uzoq vaqt **ishlatilmagan** (LRU — least recently used) |
| `allkeys-lrm` | Eng uzoq vaqt **o'zgartirilmagan** (LRM — least recently modified, Redis 8.6 dan) |
| `allkeys-lfu` | Eng **kam ishlatiladigan** (LFU — least frequently used, Redis 4.0 dan) |
| `allkeys-random` | Tasodifiy |
| `volatile-lru`, `volatile-lrm`, `volatile-lfu`, `volatile-random` | Xuddi shular, lekin faqat **muddati bor** (TTL) kalitlardan |
| `volatile-ttl` | Muddati bor kalitlardan — qolgan muddati **eng qisqa** |

`volatile-*` siyosatlar muddatli kalit bo'lmasa `noeviction` kabi ishlaydi (RD).

Tanlash — tajribaviy qoidalar (RD):

- **`allkeys-lru`** — ba'zi elementlar boshqalaridan ancha ko'p o'qilsa (Pareto qoidasi); boshqa sabab bo'lmasa — yaxshi standart tanlov;
- **`allkeys-lrm`** — tez-tez o'qiladigan ma'lumotni saqlab, uzoq o'zgartirilmaganini o'chirish (o'qish ko'p yuklamalar);
- **`allkeys-random`** — barcha kalitlar taxminan teng o'qilsa (masalan, ma'lumot siklik o'qiladi);
- **`volatile-ttl`** — dastur qaysi kalit o'chirishga yaroqli ekanini bilsa va ularga qisqa TTL bersa;
- **`volatile-lru`/`lrm`/`random`** — bitta Redis'da ham kesh, ham doimiy kalitlar bo'lsa; lekin iloji bo'lsa ikki alohida Redis ishlatish yaxshiroq. Muddat qo'yish ham xotira oladi — `allkeys-lru` tejamkorroq.

Standart siyosat — `noeviction` (sinovdagi paket sozlamasi).

### LRU taxminiy

RD: Redis aniq LRU emas, **taxminiy** LRU ishlatadi — bir nechta tasodifiy kalitni tanlab, ulardan eng uzoq ishlatilmaganini o'chiradi (3.0 dan yaxshi nomzodlar havzasi ham yuritiladi). Aniq LRU ko'proq xotira talab qiladi. Namuna soni — `maxmemory-samples` (standart 5); 10 — aniq LRU'ga juda yaqin, lekin protsessor sarfi ko'proq.

### LFU

RD: har kalitning murojaat chastotasi bir necha bitli ehtimoliy hisoblagich (Morris counter) bilan taxminlanadi va vaqt o'tishi bilan kamayadi. Standart: hisoblagich taxminan million murojaatda to'yinadi, har daqiqada kamayadi. Sozlamalar: `lfu-log-factor 10`, `lfu-decay-time 1` (daqiqada; `0` — hech kamaymaydi). Hisoblagich oralig'i 0–255; `OBJECT FREQ k` — kalitning qiymati.

### Kuzatish (`INFO`)

| Maydon | Nima (RD) |
| --- | --- |
| `keyspace_hits`, `keyspace_misses` | Topilgan / topilmagan kalitga murojaatlar. Kesh samaradorligi: `hits / (hits + misses) × 100`. `EXISTS` "yo'q" desa ham — miss |
| `evicted_keys` | Evikt qilingan kalitlar |
| `expired_keys` | Muddati tugagan kalitlar (ko'p bo'lsa — TTL juda qisqa bo'lishi mumkin) |
| `used_memory_dataset` | Ma'lumot egallagan xotira |
| `current_eviction_exceeded_time` | Chegara oxirgi marta oshgandan beri o'tgan vaqt |
| `commandstats` | Har buyruq necha marta rad etilgani (`noeviction`/`volatile-*` da) |

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3). Asosiy serverga tegmaslik uchun 7020-portda saqlashsiz alohida server.

```text vps
$ free -m | head -2; redis-cli CONFIG GET maxmemory maxmemory-policy maxmemory-samples
               total        used        free      shared  buff/cache   available
Mem:            1793         652         479           4         835        1140
maxmemory-samples
5
maxmemory-policy
noeviction
maxmemory
0
```

Paket sozlamasi: `maxmemory 0` (cheklovsiz), `noeviction`, `maxmemory-samples 5`. VPS'da 1,8 GB xotira.

```text vps
$ redis-server --port 7020 --daemonize yes --save '' --appendonly no --bind 127.0.0.1 --logfile /tmp/r7020.log; sleep 0.5; r() { redis-cli -p 7020 "$@"; }; r PING
PONG
$ yoz() { seq 1 $1 | awk -v p=$2 'BEGIN{v=sprintf("%1000s","");gsub(/ /,"x",v)} {k=p":"$1; printf "*3\r\n$3\r\nSET\r\n$%d\r\n%s\r\n$1000\r\n%s\r\n", length(k), k, v}' | redis-cli -p 7020 --pipe 2>&1 | tail -1; }; sanoq() { redis-cli -p 7020 --scan --pattern "$1:*" | wc -l; }
$ asos=$(r INFO memory | sed -n 's/^used_memory:\([0-9]*\).*/\1/p'); echo "bo'sh server: $asos bayt"; r CONFIG SET maxmemory $((asos + 10*1024*1024)); r CONFIG GET maxmemory | tail -1
bo'sh server: 779056 bayt
OK
11264816
```

`yoz N prefiks` — `--pipe` bilan N ta 1000 baytli kalit yozadi; `sanoq prefiks` — shu prefiksli kalitlar soni. Chegara — bo'sh server xotirasi + 10 MB.

### `noeviction`

```text vps
$ yoz 20000 k; r DBSIZE; r SET yana:1 qiymat; r GET k:1 | cut -c1-10; r INFO stats | grep -E '^(evicted_keys|total_eviction_exceeded_time)'
errors: 10306, replies: 20000
9694
OOM command not allowed when used memory > 'maxmemory'.

xxxxxxxxxx
evicted_keys:0
total_eviction_exceeded_time:108
$ r INFO commandstats | grep -E '^cmdstat_set:' | tr ',' '\n' | grep -E 'calls|rejected'
cmdstat_set:calls=9694
rejected_calls=10307
failed_calls=0
```

- 20 000 ta yozuvdan ~9 700 tasi sig'di, qolgani — `OOM command not allowed when used memory > 'maxmemory'` xatosi.
- Yozish rad etildi, **o'qish** (`GET k:1`) ishladi; `evicted_keys` — 0.
- `commandstats` da `rejected_calls` — rad etilgan `SET` lar.

### `volatile-lru`, lekin muddatli kalit yo'q

```text vps
$ r FLUSHALL > /dev/null; r CONFIG SET maxmemory-policy volatile-lru; yoz 20000 k; r DBSIZE
OK
errors: 10398, replies: 20000
9602
```

RD aytgandek — `noeviction` kabi: hech narsa o'chirilmadi, ortiqchasi rad etildi.

### `allkeys-lru` va `allkeys-random`

Tajriba: 2000 ta `issiq` va 4000 ta `sovuq` kalit; keyin faqat `issiq` lar o'qildi; so'ng 6000 ta `yangi` yozildi — joy yetmaydi, evikt kerak.

```text vps
$ r FLUSHALL > /dev/null; r CONFIG SET maxmemory-policy allkeys-lru; r CONFIG RESETSTAT > /dev/null; yoz 2000 issiq; yoz 4000 sovuq; sleep 2; for i in $(seq 1 2000); do echo "GET issiq:$i"; done | redis-cli -p 7020 > /dev/null; sleep 2; yoz 6000 yangi; echo "issiq: $(sanoq issiq)/2000, sovuq: $(sanoq sovuq)/4000, yangi: $(sanoq yangi)/6000"; r INFO stats | grep -E '^evicted_keys'
OK
errors: 0, replies: 2000
errors: 0, replies: 4000
errors: 0, replies: 6000
issiq: 1947/2000, sovuq: 1719/4000, yangi: 6000/6000
evicted_keys:2334
$ r FLUSHALL > /dev/null; r CONFIG SET maxmemory-policy allkeys-random; yoz 2000 issiq; yoz 4000 sovuq; sleep 2; for i in $(seq 1 2000); do echo "GET issiq:$i"; done | redis-cli -p 7020 > /dev/null; sleep 2; yoz 6000 yangi; echo "issiq: $(sanoq issiq)/2000, sovuq: $(sanoq sovuq)/4000, yangi: $(sanoq yangi)/6000"
OK
errors: 0, replies: 2000
errors: 0, replies: 4000
errors: 0, replies: 6000
issiq: 1585/2000, sovuq: 3108/4000, yangi: 4901/6000
```

| Siyosat | `issiq` qoldi | `sovuq` qoldi | `yangi` qoldi |
| --- | --- | --- | --- |
| `allkeys-lru` | 1947 / 2000 (97%) | 1719 / 4000 (43%) | 6000 / 6000 |
| `allkeys-random` | 1585 / 2000 (79%) | 3108 / 4000 (78%) | 4901 / 6000 |

LRU yaqinda o'qilganlarni deyarli saqlab, asosan o'qilmaganlarini o'chirdi (taxminiy LRU — bir nechtasi baribir ketdi). Random — farq qilmay, hammasidan teng o'chirdi, hatto yangilarini ham.

### LFU hisoblagichi

```text vps
$ r FLUSHALL > /dev/null; r CONFIG SET maxmemory-policy allkeys-lfu; r SET mashhur 1 > /dev/null; r SET kam 1 > /dev/null; for i in $(seq 1 1000); do echo "GET mashhur"; done | redis-cli -p 7020 > /dev/null; r OBJECT FREQ mashhur; r OBJECT FREQ kam
OK
20
5
```

1000 marta o'qilgan kalit — `20`, umuman o'qilmagan — `5` (kuzatildi: yangi kalit hisoblagichi 0 dan emas, 5 dan boshlandi). Logarifmik: 1000 murojaat — atigi 20.

### Hit va miss

```text vps
$ r FLUSHALL > /dev/null; r CONFIG RESETSTAT > /dev/null; r SET bor 1 > /dev/null; r GET bor > /dev/null; r GET bor > /dev/null; r GET bor > /dev/null; r GET yoq > /dev/null; r EXISTS yoq2 > /dev/null; r INFO stats | grep -E '^keyspace_(hits|misses)'
keyspace_hits:3
keyspace_misses:2
```

3 ta topilgan `GET` — hits; yo'q kalitga `GET` va `EXISTS` — 2 ta miss. Samaradorlik: 3 / 5 = 60%.

### Xotira OS'ga qaytmaydi

```text vps
$ r FLUSHALL > /dev/null; r CONFIG SET maxmemory 0; yoz 100000 m; r INFO memory | grep -E '^(used_memory_human|used_memory_rss_human):'; for i in $(seq 1 2 100000); do echo "DEL m:$i"; done | redis-cli -p 7020 > /dev/null; r DBSIZE; r INFO memory | grep -E '^(used_memory_human|used_memory_rss_human|mem_fragmentation_ratio):'
OK
errors: 0, replies: 100000
used_memory_human:103.07M
used_memory_rss_human:106.11M
50000
used_memory_human:52.54M
used_memory_rss_human:114.61M
mem_fragmentation_ratio:2.13
$ yoz 50000 n; r DBSIZE; r INFO memory | grep -E '^(used_memory_human|used_memory_rss_human):'
errors: 0, replies: 50000
100000
used_memory_human:103.21M
used_memory_rss_human:114.61M
```

| Holat | Kalitlar | `used_memory` | RSS |
| --- | --- | --- | --- |
| 100 000 kalit | 100 000 | 103 MB | 106 MB |
| Yarmi o'chirildi | 50 000 | 52,5 MB | **114,6 MB** — qaytmadi |
| 50 000 yangi qo'shildi | 100 000 | 103 MB | 114,6 MB — o'smadi |

RD aytgan holat: o'chirilgan xotira OS'ga qaytmadi (fragmentatsiya koeffitsienti 2,13 — bu yerda ishonchsiz), lekin yangi kalitlar shu bo'sh joyni qayta ishlatdi.

```text vps
$ r INFO memory | grep -E '^mem_not_counted_for_evict'; r SHUTDOWN NOSAVE; rm -f /tmp/r7020.log
mem_not_counted_for_evict:0
```

Replikatsiya va AOF yo'q — bufer `0`.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Keshda `maxmemory` bermaslik | Redis butun xotirani egallashi mumkin (RD) | `maxmemory` + evikt siyosati |
| Kesh uchun `noeviction` (standart) qoldirish | To'lganda yozish xatosi (sinovda OOM) | `allkeys-lru` yoki boshqasi |
| Muddatsiz kalitlarda `volatile-*` | `noeviction` kabi ishlaydi | `allkeys-*` yoki kalitlarga TTL |
| Kesh va doimiy ma'lumot bitta Redis'da, `allkeys-*` bilan | Doimiy kalitlar ham o'chadi | Ikki alohida Redis yoki `volatile-*` |
| `maxmemory` ni butun RAM'ga teng qilish (replika/AOF bilan) | Buferlar hisobga kirmaydi | Buferlarga joy qoldirish |
| O'chirgandan keyin RSS kamayishini kutish | Ajratuvchi qaytarmaydi | Peak xotiraga qarab rejalashtirish |
| Kesh samaradorligini kuzatmaslik | Noto'g'ri siyosat sezilmaydi | `keyspace_hits/misses`, `evicted_keys` |

## Amaliyot

1. `maxmemory 0` nimani bildiradi?
2. `noeviction` da xotira to'lsa nima bo'ladi? O'qish-chi?
3. Kalitlarda TTL yo'q bo'lsa `volatile-lru` qanday ishlaydi?
4. Nega RD `allkeys-lru` ni yaxshi standart deydi? Sinovda u random'dan qanday farq qildi?
5. Kesh samaradorligini qanday hisoblaysiz?
6. 5 GB ma'lumotdan 2 GB o'chirilsa, RSS nega kamaymasligi mumkin?

<details>
<summary>Javoblar</summary>

1. Cheklov yo'q (64 bitli tizimlarda standart).
2. Ma'lumot qo'shadigan buyruqlarga OOM xatosi; o'qish ishlayveradi.
3. `noeviction` kabi — hech narsa o'chirilmaydi.
4. Ko'p ilovalarda ozchilik kalitlar ko'proq o'qiladi (Pareto). Sinovda LRU `issiq` larning 97% ini saqladi, random — 79%.
5. `keyspace_hits / (keyspace_hits + keyspace_misses) × 100`.
6. Ajratuvchi o'chirilgan xotirani OS'ga qaytarmaydi; uni keyin yangi kalitlar uchun qayta ishlatadi.

</details>

## Rasmiy hujjat

- [RD: Key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [RD: Memory optimization](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/memory-optimization/)
- [RD: OBJECT FREQ](https://redis.io/docs/latest/commands/object-freq/) · [INFO](https://redis.io/docs/latest/commands/info/)
