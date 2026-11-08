# 30 — Replikatsiya

[Mundarija](README.md)

## Tushuncha

RD (Redis replication): Redis replikatsiyasining asosi — **yetakchi-izdosh** (leader-follower, master-replica) modeli: **replika** serverlar **asosiy** (master) serverning aniq nusxasi bo'ladi. Ulanish uzilsa, replika avtomatik qayta ulanadi va master'ning aynan nusxasiga aylanishga harakat qiladi. Avtomatik almashtirish (failover) — bu qatlam ustidagi Sentinel (31-bob) yoki Cluster (32-bob) vazifasi.

Uch mexanizm (RD):

1. Ulanish yaxshi bo'lsa — master replikaga **buyruqlar oqimini** yuboradi: mijoz yozuvlari, muddati tugagan yoki evikt qilingan kalitlar va boshqa o'zgarishlar.
2. Ulanish uzilsa — replika qayta ulanib, **qisman qayta sinxronlash**ga (partial resynchronization) urinadi: uzilish paytida o'tkazib yuborgan qismini oladi.
3. Qisman imkonsiz bo'lsa — **to'liq qayta sinxronlash**: master butun ma'lumot suratini yaratib, replikaga yuboradi, keyin oqimni davom ettiradi.

### Asinxron

RD: standart — **asinxron** replikatsiya: master har buyruqda replikani kutmaydi (kam kechikish, yuqori unumdorlik). Replikalar qancha ma'lumot olganini vaqti-vaqti bilan tasdiqlaydi. `WAIT n ms` — kamida `n` replika tasdiqlaguncha kutish; lekin u Redis'ni kuchli izchil (CP) tizimga aylantirmaydi: tasdiqlangan yozuv ham failover paytida yo'qolishi mumkin — faqat ehtimolni ancha kamaytiradi.

### Asosiy faktlar (RD)

- Bitta master — **bir nechta** replika; replikaga boshqa replikalar ham ulanishi mumkin (zanjir; 4.0 dan hammasi master'ning aynan oqimini oladi).
- Master tomonda **bloklamaydi**: replika sinxronlanayotganda master so'rovlarga javob beradi. Replika tomonda ham asosan bloklamaydi.
- Qo'llanish: o'qishni kengaytirish (sekin O(N) so'rovlarni replikaga), ma'lumot xavfsizligi va yuqori mavjudlik.

### Saqlashsiz master — xavf

RD: replikatsiyada master va replikalarda **saqlash yoqilgan** bo'lishi qat'iy tavsiya etiladi. Bo'lmasa — **avtomatik qayta ishga tushirish o'chirilsin**. Sabab:

1. A — saqlashsiz master, B va C — replikalar.
2. A qulaydi, avtomatik qayta ishga tushadi — **bo'sh**.
3. B va C bo'sh A dan nusxa olib, **o'z ma'lumotini yo'qotadi**.

### Qanday ishlaydi

Har master'da **replikatsiya ID** (tasodifiy satr — ma'lumot tarixi) va **offset** (har yuborilgan baytda oshadi) bor; `(ID, offset)` juftligi master ma'lumotining aniq versiyasini bildiradi. Replika `PSYNC` bilan eski ID va offsetni yuboradi: master'ning **backlog** buferida yetarli ma'lumot bo'lsa — faqat yetishmagan qism, aks holda — to'liq sinxronlash.

To'liq sinxronlash: master fonda RDB yaratadi va shu paytdagi yangi yozuvlarni buferlaydi; RDB'ni replikaga uzatadi, replika uni yuklaydi, keyin buferdagi buyruqlar keladi. **Disksiz** (diskless) replikatsiya — bola jarayon RDB'ni diskka yozmasdan to'g'ridan-to'g'ri tarmoqqa yuboradi (`repl-diskless-sync`; boshqa replikalarni kutish — `repl-diskless-sync-delay`).

### Sozlash

| Sozlama / buyruq | Nima |
| --- | --- |
| `replicaof 192.168.1.1 6379` | Replika konfiguratsiyasida — master manzili |
| `REPLICAOF host port` | Ishlab turgan serverda; `REPLICAOF NO ONE` — replikani master qilish |
| `masterauth parol` | Master'da parol bo'lsa (29-bob) |
| `replica-read-only yes` (standart) | Replika yozishni rad etadi |
| `min-replicas-to-write N`, `min-replicas-max-lag M` | Kechikishi M soniyadan oshmagan kamida N replika bo'lmasa — master yozishni rad etadi |
| `INFO replication`, `ROLE` | Holat |

**Faqat o'qiydigan replika** (RD): yozish buyruqlari rad etiladi — xato bilan yozib yubormaslik uchun. Bu replikani ishonchsiz tarmoqqa ochish mumkin degani emas: boshqaruv buyruqlari ishlayveradi. Yozish mumkin bo'lgan replikalar faqat tarixiy sabab bilan bor va **tavsiya etilmaydi** — master bilan nomuvofiqlik keltiradi; 7.0 dan ularning barcha qo'llanishlari uchun muqobil bor (`SUNIONSTORE` o'rniga `SUNION`, `SORT` o'rniga `SORT_RO`, `EVAL` o'rniga `EVAL_RO`).

`min-replicas-*` — "eng yaxshi urinish": asinxron bo'lgani uchun yozuv yetib borishini kafolatlamaydi, lekin yo'qotish oynasini cheklaydi.

**Muddatli kalitlar** (RD): replikalar kalitlarni o'zi **o'chirmaydi** — master o'chirganda (yoki evikt qilganda) replikaga `DEL` yuboradi. `DEL` hali yetmagan bo'lsa, replika mantiqiy soati bo'yicha kalitni "yo'q" deb ko'rsatadi. Lua skript paytida vaqt "muzlatiladi". Replika master bo'lgach, kalitlarni o'zi o'chira boshlaydi.

**Failover'dan keyin qisman sinxronlash** (4.0 dan): master qilingan replika eski master ID va offsetini eslab qoladi, shuning uchun qolgan replikalar u bilan qisman sinxronlanadi; lekin yangi master'ning ID'si boshqa. Replika `SHUTDOWN` bilan to'g'ri o'chirilsa, qayta ishga tushganda qisman sinxronlash uchun ma'lumotni RDB'da saqlaydi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3) — bitta kompyuterda uchta saqlashsiz server: master 7050, replika A 7051, replika B 7052.

```text vps
$ rm -rf /tmp/r30 && mkdir -p /tmp/r30/{m,a,b}; ishga() { redis-server --port $1 --dir /tmp/r30/$2 --daemonize yes --bind 127.0.0.1 --save '' --appendonly no --logfile /tmp/r30/$2/log "${@:3}"; sleep 0.7; }; m() { redis-cli -p 7050 "$@"; }; a() { redis-cli -p 7051 "$@"; }; b() { redis-cli -p 7052 "$@"; }
```

`ishga port papka …` — sinov serveri; `m`, `a`, `b` — har serverga `redis-cli`.

### Ulanish va to'liq sinxronlash

```text vps
$ ishga 7050 m; ishga 7051 a --replicaof 127.0.0.1 7050; m INFO replication | grep -E '^(role|connected_slaves|slave0|master_repl_offset):' | sed 's/master_replid:.*/master_replid:<id>/'; a INFO replication | grep -E '^(role|master_host|master_port|master_link_status|slave_read_only):'
role:master
connected_slaves:1
slave0:ip=127.0.0.1,port=7051,state=wait_bgsave,offset=0,lag=0,io-thread=0
master_repl_offset:0
role:slave
master_host:127.0.0.1
master_port:7050
master_link_status:down
slave_read_only:1
$ a GET salom | od -c | head -1; sleep 7; a INFO replication | grep -E '^master_link_status:'; grep -E 'Full resync|diskless|Synchronization with replica|PSYNC|Starting BGSAVE' /tmp/r30/m/log | cut -d' ' -f4- | head -6
0000000  \n
master_link_status:up
2026 19:33:20.606 * Full resync requested by replica 127.0.0.1:7051 
2026 19:33:20.608 * Full resync requested by replica 127.0.0.1:7051 (rdb-channel)
2026 19:33:20.608 * Delay next BGSAVE for diskless SYNC
2026 19:33:25.914 * Starting BGSAVE for SYNC with target: replicas sockets (rdb-channel)
2026 19:33:25.920 * Synchronization with replica 127.0.0.1:7051 succeeded
```

- Master: `connected_slaves:1`, replika holati `wait_bgsave`. Replika: `role:slave` (Redis `INFO` da eski "slave" atamasi qolgan), `master_link_status:down` — hali sinxronlanmagan.
- Darhol `GET` — bo'sh. 7 soniyadan keyin — `up`.
- Master jurnali: to'liq sinxronlash so'raldi, **disksiz** sinxronlash uchun `BGSAVE` ~5 soniya kechiktirildi (`repl-diskless-sync-delay 5`, 26-bobdagi paket sozlamasi) va RDB to'g'ridan-to'g'ri soketga yuborildi.

### Yozish va o'qish

```text vps
$ m SET salom dunyo; a GET salom; a SET salom boshqa
OK
dunyo
READONLY You can't write against a read only replica.
$ for i in $(seq 1 100); do echo "SET k:$i v"; done | m > /dev/null; m WAIT 1 1000; a DBSIZE
1
101
```

- Master'dagi `salom` replikada bor; replikaga yozish — `READONLY`.
- `WAIT 1 1000` — `1`: bitta replika tasdiqladi.

### Replika to'xtadi

Replika jarayoni `SIGSTOP` bilan "muzlatildi" (tarmoq uzilishini taqlid):

```text vps
$ kill -STOP $(a INFO server | sed -n 's/^process_id:\([0-9]*\).*/\1/p' | tr -d '\r'); m SET pauza 1; sleep 3; m INFO replication | grep -E '^slave0:' | sed 's/.*lag=\([0-9]*\).*/lag=\1 soniya/'
OK
lag=4 soniya
$ m CONFIG SET min-replicas-to-write 1 min-replicas-max-lag 1; m SET yangi 1; m GET salom
OK
NOREPLICAS Not enough good replicas to write.

dunyo
```

- Master yozishni **qabul qildi** (`OK`) — asinxron: replikani kutmaydi. Replika kechikishi (`lag`) o'sib bormoqda.
- `min-replicas-to-write 1`, `min-replicas-max-lag 1` — endi yozish rad etildi (`NOREPLICAS`), o'qish ishlaydi.

```text vps
$ kill -CONT $(pgrep -f 'redis-server 127.0.0.1:7051'); sleep 1.5; m SET yangi 1; a GET pauza; m CONFIG SET min-replicas-to-write 0
OK
1
OK
```

Replika "uyg'ondi" — yozish yana qabul qilindi, `pauza` replikaga yetdi.

### Qisman qayta sinxronlash

Master replika ulanishini uzdi:

```text vps
$ m CLIENT KILL TYPE replica; sleep 1.5; grep -E 'Partial resynchronization|partial resync' /tmp/r30/m/log /tmp/r30/a/log | sed 's#^/tmp/r30/\(.\)/log:#\1: #' | cut -d' ' -f1,5- | tail -2
1
a: 2026 19:33:33.011 * Trying a partial resynchronization (request 878ed0d4264d5b31cc1a90b85277219521ea93db:3113).
a: 2026 19:33:33.011 * Successful partial resynchronization with master.
```

Replika eski ID va offset bilan `PSYNC` qildi — **qisman** sinxronlash muvaffaqiyatli (to'liq RDB uzatilmadi).

### Muddatli kalit

```text vps
$ m SET qisqa x PX 1500; a PTTL qisqa | sed 's/^[0-9]\{3,4\}$/<1500 dan kam>/'; sleep 2; a GET qisqa | od -c | head -1; a EXISTS qisqa
OK
<1500 dan kam>
0000000  \n
0
```

Master'da 1,5 soniyalik kalit; replikada ham muddat bor; 2 soniyadan keyin replikada yo'q.

### Zanjir

```text vps
$ ishga 7052 b --replicaof 127.0.0.1 7051; sleep 7; b DBSIZE; b GET salom; a INFO replication | grep -E '^(role|connected_slaves):'
103
dunyo
role:slave
connected_slaves:1
```

B replika A ga ulandi (A — master'ning replikasi) — master'dagi barcha 103 kalit B da ham.

### Saqlashsiz master qayta ishga tushdi

```text vps
$ m DBSIZE; a DBSIZE; b DBSIZE; kill -9 $(pgrep -f 'redis-server 127.0.0.1:7050'); sleep 0.5; ishga 7050 m; sleep 8; echo "master: $(m DBSIZE), replika A: $(a DBSIZE), replika B: $(b DBSIZE)"; sleep 8; echo "yana 8 soniyadan keyin replika B: $(b DBSIZE)"
103
103
103
master: 0, replika A: 0, replika B: 103
yana 8 soniyadan keyin replika B: 0
```

RD ogohlantirgan holat: master `kill -9` bilan qulatildi va saqlashsiz holda qayta ishga tushirildi (avtomatik qayta ishga tushirishni taqlid). **Bo'sh** master'dan replika A nusxa oldi — 0; biroz keyin A dan B ham — 0. Barcha nusxalar yo'qoldi.

### Replikani master qilish

```text vps
$ a REPLICAOF NO ONE; a --no-raw ROLE | head -3; b --no-raw ROLE | head -3
OK
1) "master"
2) (integer) 14
3) 1) 1) "127.0.0.1"
1) "slave"
2) "127.0.0.1"
3) (integer) 7051
```

`REPLICAOF NO ONE` — A master bo'ldi (`ROLE`: `master`, offset, ulangan replikalar); B hali A ning replikasi.


## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Saqlashsiz master + avtomatik qayta ishga tushirish | Bo'sh master hamma replikalarni tozalaydi (sinovda shunday) | Saqlashni yoqish yoki avtomatik qayta ishga tushirishni o'chirish |
| Replikani zaxira nusxa deb hisoblash | `FLUSHALL` yoki tozalanish replikaga ham o'tadi | Alohida zaxira (28-bob) |
| Asinxron replikatsiyada yozuv yo'qolmaydi deb o'ylash | Failover'da yo'qolishi mumkin (RD) | `WAIT`, `min-replicas-*` — ehtimolni kamaytiradi |
| Yozish mumkin bo'lgan replika | Master bilan nomuvofiqlik (RD) | `replica-read-only yes`; `*_RO` buyruqlar |
| Replikani darhol tayyor deb hisoblash | Sinxronlash vaqt oladi (sinovda ~5 s kechikish) | `master_link_status:up` ni tekshirish |
| Master parolli, replikada `masterauth` yo'q | Replika ulana olmaydi | `masterauth` |
| Faqat o'qiydigan replikani ishonchsiz tarmoqqa ochish | Boshqaruv buyruqlari ochiq (RD) | Firewall, ACL (29-bob) |

## Amaliyot

1. Redis replikatsiyasining uch mexanizmi qaysi?
2. Nega replikatsiya asinxron va `WAIT` nimani kafolatlaydi, nimani yo'q?
3. Qisman va to'liq sinxronlash qachon bo'ladi?
4. `min-replicas-to-write` nima uchun kerak? Sinovda nima bo'ldi?
5. Saqlashsiz master avtomatik qayta ishga tushsa nima bo'ladi?
6. Replika muddatli kalitlarni o'zi o'chiradimi?

<details>
<summary>Javoblar</summary>

1. Buyruqlar oqimi; uzilishdan keyin qisman qayta sinxronlash; imkonsiz bo'lsa — to'liq sinxronlash.
2. Kam kechikish va unumdorlik uchun; `WAIT` — N replika tasdiqlaganini kafolatlaydi, lekin failover'da yozuv yo'qolmasligini emas.
3. Qisman — replika ID va offseti master backlog'ida bo'lsa; aks holda (yoki birinchi ulanishda) — to'liq.
4. Yetarli replika bo'lmasa yozishni rad etish — yo'qotish oynasini cheklash. Sinovda replika muzlatilgach `NOREPLICAS`.
5. Bo'sh ishga tushadi va replikalar undan nusxa olib, ma'lumotni yo'qotadi.
6. Yo'q — master `DEL` yuboradi; ungacha replika mantiqiy soati bo'yicha kalitni yo'q deb ko'rsatadi.

</details>

## Rasmiy hujjat

- [RD: Redis replication](https://redis.io/docs/latest/operate/oss_and_stack/management/replication/)
- [RD: REPLICAOF](https://redis.io/docs/latest/commands/replicaof/) · [WAIT](https://redis.io/docs/latest/commands/wait/) · [ROLE](https://redis.io/docs/latest/commands/role/) · [PSYNC](https://redis.io/docs/latest/commands/psync/)
