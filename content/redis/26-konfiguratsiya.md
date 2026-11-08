# 26 — Konfiguratsiya

[Mundarija](README.md)

## Tushuncha

RD (Redis configuration): Redis konfiguratsiya faylisiz ham, ichki standart sozlamalar bilan ishga tushadi — lekin bu faqat sinov va ishlab chiqish uchun tavsiya etiladi. To'g'ri yo'l — konfiguratsiya fayli, odatda **`redis.conf`**.

- Redis **8.10 va keyingi** versiyalarda — faqat bitta fayl: `redis.conf`.
- 8.0 – 8.8.x da ikkita edi: `redis.conf` (faqat server) va `redis-full.conf` (server + Redis Search, time series, ehtimoliy tuzilmalar; birinchi qatori `include redis.conf`).

Har versiya uchun namunaviy, izohlar bilan to'la `redis.conf` Redis manbasida (havolalar — RD sahifasida). Fayldagi izohlar — har sozlamaning eng aniq tavsifi.

### Fayl formati

```text
kalit_so'z argument1 argument2 ... argumentN
```

Masalan, `replicaof 127.0.0.1 6380`. Bo'sh joyli satr — qo'shtirnoqda: `requirepass "hello world"`. Bitta qo'shtirnoq ichida `\` bilan ekranlash; qo'sh qo'shtirnoqda qo'shimcha ravishda `"\xff"` kabi o'n oltilik kodlar (RD).

### Buyruq qatoridan

RD: xuddi shu sozlamalar `--` prefiksi bilan:

```text
redis-server --port 6380 --replicaof 127.0.0.1 6379
```

Sinov uchun qulay. Ichki tomondan Redis xotirada vaqtinchalik konfiguratsiya yasaydi (berilgan fayl bo'lsa, unga qo'shib).

### Ishlab turgan serverda

| Buyruq | Nima (RD) |
| --- | --- |
| `CONFIG GET naqsh …` | Sozlamalarni o'qish; glob naqshlar (`*max-*-entries*`); `CONFIG GET *` — hammasi |
| `CONFIG SET nom qiymat [nom qiymat …]` | Qayta ishga tushirmasdan o'zgartirish; **keyingi buyruqdan** kuchga kiradi. Bir chaqiruvda bir nechta sozlama — Redis 7.0 dan |
| `CONFIG REWRITE` | Joriy sozlamalarni ishga tushirilgan `redis.conf` ga yozish |

- Hamma sozlama ham `CONFIG SET` bilan o'zgarmaydi, ko'pchiligi o'zgaradi (RD).
- `CONFIG SET` **faylni o'zgartirmaydi** — qayta ishga tushirishda eski qiymat qaytadi. Faylni qo'lda yoki `CONFIG REWRITE` bilan yangilash kerak.
- `CONFIG SET appendonly yes` — ishlab turgan serverda RDB'dan AOF'ga o'tish (28-bob).

`CONFIG REWRITE` qoidalari (RD):

- izohlar va tuzilma iloji boricha saqlanadi;
- faylda bor sozlama — o'sha qatorda yangilanadi;
- faylda yo'q va **standart** qiymatdagi sozlama — qo'shilmaydi;
- faylda yo'q, standartdan farqli — fayl oxiriga qo'shiladi;
- ishlatilmay qolgan qatorlar bo'shatiladi;
- server faylsiz ishga tushgan bo'lsa — xato;
- yozish atomar: xatolik yoki qulashda eski yoki yangi fayl qoladi, aralash emas.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3, APT paketi).

### Paketdagi fayl

```text vps
$ redis-cli INFO server | grep -E '^(redis_version|config_file|executable)'; ls /etc/redis/
redis_version:8.10.3
executable:/usr/bin/redis-server
config_file:/etc/redis/redis.conf
redis.conf
$ grep -c '' /etc/redis/redis.conf; grep -vE '^\s*(#|$)' /etc/redis/redis.conf | head -30
3171
bind 127.0.0.1 -::1
protected-mode yes
port 6379
tcp-backlog 511
timeout 0
tcp-keepalive 300
daemonize no
supervised auto
loglevel notice
logfile /var/log/redis/redis-server.log
databases 16
always-show-logo no
set-proc-title yes
proc-title-template "{title} {listen-addr} {server-mode}"
locale-collate ""
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
rdb-del-sync-files no
dir /var/lib/redis
replica-serve-stale-data yes
replica-read-only yes
repl-diskless-sync yes
repl-diskless-sync-delay 5
repl-diskless-sync-max-replicas 0
repl-diskless-load disabled
repl-disable-tcp-nodelay no
replica-priority 100
acllog-max-len 128
```

- Server `/etc/redis/redis.conf` bilan ishga tushgan; 8.10 da bitta fayl.
- Fayl 3171 qator — asosan izohlar. Izohsiz qatorlardan: `bind 127.0.0.1 -::1` (faqat lokal, 29-bob), `port 6379`, `supervised auto`, `dir /var/lib/redis` (saqlash papkasi, 28-bob).

### Sinov server: fayl + buyruq qatori

Asosiy serverga tegmaslik uchun 7010-portda alohida server:

```text vps
$ mkdir -p /tmp/r7010 && printf '%s\n' '# sinov konfiguratsiyasi' 'port 7010' 'bind 127.0.0.1' 'dir /tmp/r7010' 'save ""' 'requirepass "hello world"' > /tmp/r7010/redis.conf; cat /tmp/r7010/redis.conf
# sinov konfiguratsiyasi
port 7010
bind 127.0.0.1
dir /tmp/r7010
save ""
requirepass "hello world"
$ redis-server /tmp/r7010/redis.conf --daemonize yes --maxmemory 50mb --logfile /tmp/r7010/log; sleep 0.5; R="redis-cli -p 7010 --user default --pass hello\ world --no-auth-warning"; eval $R CONFIG GET port maxmemory requirepass
requirepass
hello world
port
7010
maxmemory
52428800
```

- `requirepass "hello world"` — qo'shtirnoqdagi bo'sh joyli satr to'g'ri o'qildi.
- `--maxmemory 50mb` buyruq qatoridan — 52 428 800 bayt.

```text vps
$ eval $R --no-raw CONFIG GET '*max-*-entries*'
 1) "set-max-intset-entries"
 2) "512"
 3) "set-max-listpack-entries"
 4) "128"
 5) "hash-rdb-load-max-template-entries"
 6) "0"
 7) "hash-max-ziplist-entries"
 8) "512"
 9) "zset-max-ziplist-entries"
10) "128"
11) "zset-max-listpack-entries"
12) "128"
13) "hash-max-template-entries"
14) "0"
15) "hash-max-listpack-entries"
16) "512"
```

Glob naqsh bilan — 6–9-boblarda ko'rgan ichki ko'rinish chegaralari (`hash-max-listpack-entries` 512, `zset-max-listpack-entries` 128…). `*-ziplist-*` nomlari ham ro'yxatda (kuzatildi: qiymatlari `*-listpack-*` nikiga teng).

### `CONFIG SET`

```text vps
$ eval $R CONFIG SET maxmemory 100mb hz 20; eval $R CONFIG GET maxmemory hz; eval $R CONFIG SET daemonize no; eval $R CONFIG SET port abc
OK
hz
20
maxmemory
104857600
ERR CONFIG SET failed (possibly related to argument 'daemonize') - can't set immutable config

ERR CONFIG SET failed (possibly related to argument 'port') - argument couldn't be parsed into an integer
```

- Ikki sozlama bitta chaqiruvda — `OK`, darhol kuchda.
- `daemonize` — o'zgarmas (immutable) sozlama, ishlab turganda o'zgarmaydi.
- Noto'g'ri qiymat — xato, sozlama o'zgarmadi.

### Qayta ishga tushirish: `CONFIG SET` yo'qoladi

```text vps
$ eval $R SHUTDOWN NOSAVE; redis-server /tmp/r7010/redis.conf --daemonize yes --logfile /tmp/r7010/log; sleep 0.5; eval $R CONFIG GET maxmemory hz
hz
10
maxmemory
0
```

`hz` — 10, `maxmemory` — 0: `CONFIG SET` qiymatlari ham, buyruq qatoridagi `--maxmemory` ham yo'q — server faqat fayldagini o'qidi.

### `CONFIG REWRITE`

```text vps
$ eval $R CONFIG SET maxmemory 100mb hz 20; eval $R CONFIG REWRITE; cat /tmp/r7010/redis.conf
OK
OK
# sinov konfiguratsiyasi
port 7010
bind 127.0.0.1
dir "/tmp/r7010"
save ""
requirepass "hello world"

# Generated by CONFIG REWRITE
hz 20
latency-tracking-info-percentiles 50 99 99.9
logfile "/tmp/r7010/log"
pidfile "/var/run/redis.pid"
daemonize yes
maxmemory 100mb
user default on sanitize-payload #b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9 ~* &* +@all
$ eval $R SHUTDOWN NOSAVE; redis-server /tmp/r7010/redis.conf --daemonize yes --logfile /tmp/r7010/log; sleep 0.5; eval $R CONFIG GET maxmemory hz; eval $R SHUTDOWN NOSAVE; rm -rf /tmp/r7010
hz
20
maxmemory
104857600
```

- Fayldagi qatorlar o'z joyida qoldi (izoh ham); `dir` qo'shtirnoqqa olindi.
- Standartdan farqli sozlamalar `# Generated by CONFIG REWRITE` ostida oxiriga qo'shildi: `hz 20`, `maxmemory 100mb`, shuningdek buyruq qatoridagi `daemonize yes`, `logfile` va bir nechta ichki qiymat.
- **Kuzatildi**: fayl oxiriga `user default … #<xesh>` qatori ham yozildi — parolning SHA-256 xeshi (ACL, 29-bob). Konfiguratsiya faylini begonalarga ko'rsatmang.
- Qayta ishga tushgandan keyin `hz 20`, `maxmemory` 100 MB — saqlandi.

### Faylsiz server

```text vps
$ redis-server --port 7011 --daemonize yes --save '' --bind 127.0.0.1 --logfile /tmp/r7011.log; sleep 0.5; redis-cli -p 7011 CONFIG REWRITE; redis-cli -p 7011 SHUTDOWN NOSAVE; rm -f /tmp/r7011.log
ERR The server is running without a config file
```

RD aytgandek — faylsiz ishga tushgan serverda `CONFIG REWRITE` xato beradi.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| `CONFIG SET` dan keyin faylni yangilamaslik | Qayta ishga tushishda eski qiymat (sinovda shunday) | `CONFIG REWRITE` yoki faylni qo'lda tahrirlash |
| Production'da faylsiz, faqat buyruq qatori bilan | RD faqat sinov uchun tavsiya qiladi; `CONFIG REWRITE` ishlamaydi | `redis.conf` |
| Bo'sh joyli qiymatni qo'shtirnoqsiz yozish | Bir nechta argument bo'lib qoladi | `"hello world"` |
| Har sozlamani alohida `CONFIG SET` bilan | Bir nechta qadam | 7.0 dan bitta chaqiruvda bir nechtasi |
| Konfiguratsiya faylini ochiq qoldirish yoki repo'ga qo'shish | Parol va ACL xeshlari bor | Fayl huquqlarini cheklash, maxfiylarni alohida saqlash |
| Namunaviy `redis.conf` izohlarini o'qimaslik | Sozlama ma'nosi noto'g'ri tushuniladi | Shu versiyaning `redis.conf` izohlari |

## Amaliyot

1. Redis 8.10 da nechta konfiguratsiya fayli bor? 8.0–8.8 da-chi?
2. `port 6380` ni buyruq qatorida qanday berasiz?
3. `CONFIG SET` bilan o'zgartirilgan qiymat qayta ishga tushirishdan keyin saqlanadimi?
4. `CONFIG REWRITE` faylga qaysi sozlamalarni qo'shadi va qaysilarini qo'shmaydi?
5. `CONFIG SET daemonize no` nima uchun ishlamadi?
6. Bir chaqiruvda ikki sozlamani qanday o'zgartirasiz?

<details>
<summary>Javoblar</summary>

1. Bitta — `redis.conf`; 8.0–8.8 da ikkita — `redis.conf` va `redis-full.conf`.
2. `redis-server --port 6380`.
3. Yo'q — fayl o'zgarmaydi; `CONFIG REWRITE` kerak.
4. Standartdan farqli va faylda yo'q sozlamalarni oxiriga qo'shadi; standart qiymatdagilarni qo'shmaydi; mavjudlarini o'z joyida yangilaydi.
5. `daemonize` — o'zgarmas sozlama.
6. `CONFIG SET maxmemory 100mb hz 20` (7.0 dan).

</details>

## Rasmiy hujjat

- [RD: Redis configuration](https://redis.io/docs/latest/operate/oss_and_stack/management/config/)
- [RD: CONFIG SET](https://redis.io/docs/latest/commands/config-set/) · [CONFIG GET](https://redis.io/docs/latest/commands/config-get/) · [CONFIG REWRITE](https://redis.io/docs/latest/commands/config-rewrite/)
- [Redis 8.10 redis.conf](https://raw.githubusercontent.com/redis/redis/8.10/redis.conf)
