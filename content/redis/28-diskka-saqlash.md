# 28 — Diskka saqlash

[Mundarija](README.md)

## Tushuncha

RD (Redis persistence): **doimiy saqlash** (persistence) — ma'lumotni SSD kabi doimiy xotiraga yozish. Variantlar:

| Variant | Nima |
| --- | --- |
| **RDB** (Redis Database) | Belgilangan oraliqlarda ma'lumotning **lahzalik surati** (snapshot) |
| **AOF** (Append Only File) | Serverga kelgan **har yozish buyrug'i** jurnalga qo'shiladi; ishga tushganda qayta bajarilib, ma'lumot tiklanadi. Buyruqlar Redis protokoli formatida |
| Saqlashsiz | Butunlay o'chirish — ba'zan kesh uchun |
| **RDB + AOF** | Ikkalasi bitta serverda |

### RDB

Afzalliklari (RD):

- juda ixcham, **bitta fayl** — zaxira nusxa (backup) uchun ideal: masalan, oxirgi 24 soat uchun har soatlik, 30 kun uchun kunlik;
- falokatdan tiklash uchun qulay — bitta faylni uzoq ma'lumot markaziga ko'chirish oson;
- unumdorlikka ta'siri kam: asosiy jarayon faqat `fork()` qiladi, diskka yozishni bola jarayon bajaradi;
- katta ma'lumotda qayta ishga tushish AOF'dan **tezroq**.

Kamchiliklari (RD):

- ma'lumot yo'qolishini minimallashtirish kerak bo'lsa **yaramaydi**: elektr uzilsa, oxirgi suratdan keyingi o'zgarishlar (odatda bir necha daqiqa) yo'qoladi;
- `fork()` katta ma'lumotda vaqt oladi — Redis mijozlarga millisoniyalab, hatto 1 soniyagacha javob bermay qolishi mumkin.

Sozlash: `save 60 1000` — 60 soniyada kamida 1000 kalit o'zgarsa, surat olinadi. Qo'lda: `SAVE` yoki `BGSAVE` (fon rejimida). Fayl — `dump.rdb`.

Qanday ishlaydi (RD): Redis `fork()` qiladi; bola jarayon ma'lumotni vaqtinchalik RDB faylga yozadi; tugagach eski faylni almashtiradi — **copy-on-write** (nusxa faqat o'zgarganda olinadi) afzalligidan foydalaniladi.

### AOF

RDB yetarlicha ishonchli emas: kompyuter to'xtasa, elektr uzilsa yoki `kill -9` qilinsa, oxirgi yozuvlar yo'qoladi (RD). AOF — to'liq ishonchli muqobil: `appendonly yes`.

**`fsync` siyosati** (`appendfsync`, RD):

| Qiymat | Ishonchlilik | Tezlik |
| --- | --- | --- |
| `always` | Har yozuvdan keyin `fsync` — juda xavfsiz | Juda sekin (lekin parallel yozuvlarni bitta `fsync` ga guruhlaydi) |
| `everysec` (**standart va tavsiya**) | Falokatda ~1 soniyalik ma'lumot yo'qolishi mumkin | Tez |
| `no` | OS ixtiyorida (Linux odatda ~30 soniyada) | Eng tez, eng xavfli |

**Ko'p qismli AOF** (Redis 7.0 dan): bitta fayl o'rniga — **base** fayl (qayta yozish paytidagi surat, RDB yoki AOF formatida) va **incr** fayllar (shundan keyingi o'zgarishlar), alohida papkada (`appenddirname`), **manifest** fayl bilan.

**Qayta yozish** (rewrite): AOF o'sib boradi — hisoblagichni 100 marta oshirsangiz, kalit bitta, lekin jurnalda 100 yozuv. `BGREWRITEAOF` (yoki avtomatik) — joriy ma'lumotni yaratish uchun eng qisqa buyruqlar to'plamini fonda yozadi; xizmat to'xtamaydi, almashtirish atomar.

AOF afzalliklari: ancha ishonchli; faqat oxiriga yoziladi — elektr uzilsa ham buzilish kam; oddiy formatda — masalan, tasodifan `FLUSHALL` qilinsa, qayta yozish boshlanmagan bo'lsa, server to'xtatilib, oxirgi buyruq olib tashlanib, qayta ishga tushirish mumkin. Kamchiliklari: fayl RDB'dan katta; `fsync` siyosatiga qarab sekinroq.

**Kesilgan AOF** (RD): server yozish paytida qulasa yoki disk to'lsa, oxirgi buyruq yarim qolishi mumkin. Hozirgi versiyalar faylni baribir yuklaydi — oxirgi noto'g'ri buyruqni tashlab, jurnalga ogohlantirish yozadi (`aof-load-truncated` yoqilgan). **Buzilgan** AOF (o'rtada noto'g'ri baytlar) — Redis ishga tushmaydi; `redis-check-aof` (avval `--fix` siz) bilan tekshirish.

### Qaysi birini tanlash

RD:

- PostgreSQL darajasidagi xavfsizlik kerak bo'lsa — **ikkalasini** birga;
- bir necha daqiqalik yo'qotishga chidash mumkin bo'lsa — faqat **RDB**;
- faqat AOF — tavsiya etilmaydi: vaqti-vaqti bilan RDB surati zaxira, tez qayta ishga tushish va AOF xatolariga qarshi foydali.

Ikkalasi yoqilgan bo'lsa, qayta ishga tushganda **AOF** ishlatiladi — u eng to'liq. Redis RDB surati va AOF qayta yozishni bir vaqtda ishga tushirmaydi (disk yuklamasi).

### RDB'dan AOF'ga o'tish

RD — **muhim**: faqat konfiguratsiyani o'zgartirib qayta ishga tushirish **ma'lumot yo'qolishiga** olib kelishi mumkin. To'g'ri tartib:

1. Oxirgi `dump.rdb` ni zaxiralash va xavfsiz joyga ko'chirish.
2. Ishlab turgan serverda: `CONFIG SET appendonly yes` (ixtiyoriy: `CONFIG SET save ""`).
3. `redis.conf` ni yangilash (`CONFIG REWRITE`, 26-bob) — aks holda qayta ishga tushganda eski sozlama qaytadi.
4. Qayta ishga tushirishdan oldin `INFO persistence` da `aof_rewrite_in_progress` va `aof_rewrite_scheduled` — `0`, `aof_last_bgrewrite_status` — `ok` bo'lishini kutish.
5. Keyin kalitlar sonini tekshirish.

### Zaxira nusxa

RD: "**Ma'lumotlar bazangizni zaxiralang**" — disklar buziladi, bulutdagi serverlar yo'qoladi.

- RDB faylni server ishlab turganda nusxalash **xavfsiz**: tayyor RDB o'zgarmaydi, yangisi vaqtinchalik nomda yaratilib, atomar `rename` bilan almashtiriladi.
- Tavsiya: cron bilan har soatlik va kunlik nusxalar (48 soat / 1–2 oy), eskilarini `find` bilan o'chirish, kuniga kamida bir marta — **boshqa kompyuterga** yoki ma'lumot markazidan tashqariga.
- Faqat AOF bo'lsa: `appenddirname` papkasini nusxalash, lekin **qayta yozish paytida emas** — `auto-aof-rewrite-percentage 0` bilan vaqtincha o'chirib, `aof_rewrite_in_progress` — `0` ni tekshirib.

**`BACKUP` buyruqlari** (Redis 8.10 dan): yozishni to'xtatmasdan, AOF qayta yozishni qo'lda boshqarmasdan to'liq tiklanadigan nusxa — base, incr va manifest fayllari:

| Qadam | Buyruq |
| --- | --- |
| 1 | `BACKUP START` — yangi base surat (AOF o'chiq bo'lsa ham ishlaydi) |
| 2 | `BACKUP LIST` — tayyor fayllar yo'llari (base'ni darhol ko'chirish mumkin) |
| 3 | `BACKUP SEAL` — nusxani muhrlash (incr va manifest qo'shiladi) |
| 4 | `BACKUP LIST` dagi fayllarni zaxira joyiga ko'chirish |
| 5 | `BACKUP CLEANUP` — fayllarni o'chirish |

`BACKUP STATUS` — holat, `BACKUP ABORT` — bekor qilish. Papka — `dir` ichidagi `backupdirname` (standart `backupdir`). Tiklash — ishga tushishdagi `preload-file aof:<manifest>` yoki `preload-file rdb:<fayl>` sozlamasi: Redis faqat shu faylni yuklaydi; topilmasa — ishga tushmaydi.

## Ko'rib chiqamiz

VPS'da (Redis 8.10.3).

### Paket sozlamalari

```text vps
$ redis-cli CONFIG GET save appendonly appendfsync dir dbfilename appenddirname; ls -la /var/lib/redis | tail -n +2 | awk '{print $1, $3, $NF}'
save
3600 1 300 100 60 10000
appendonly
no
appenddirname
appendonlydir
dir
/var/lib/redis
appendfsync
everysec
dbfilename
dump.rdb
drwxr-x--- redis .
drwxr-xr-x root ..
-rw-rw---- redis dump.rdb
```

Standart: RDB yoqilgan (`save 3600 1 300 100 60 10000` — 1 soatda 1, 5 daqiqada 100 yoki 1 daqiqada 10 000 o'zgarish), AOF o'chiq, `appendfsync everysec`, fayl — `/var/lib/redis/dump.rdb` (faqat `redis` foydalanuvchisi o'qiydi).

Sinovlar — `/tmp/r28` da alohida serverlarda:

```text vps
$ rm -rf /tmp/r28 && mkdir -p /tmp/r28/rdb /tmp/r28/aof; boshla() { redis-server --port $1 --dir $2 --daemonize yes --bind 127.0.0.1 --logfile $2/log "${@:3}"; sleep 0.5; }; qul() { kill -9 $(redis-cli -p $1 INFO server | sed -n 's/^process_id:\([0-9]*\).*/\1/p' | tr -d '\r'); sleep 0.5; }
```

`boshla port papka …` — server ishga tushirish; `qul port` — jarayonni `kill -9` bilan "qulatish".

### RDB: surat va qulash

```text vps
$ boshla 7031 /tmp/r28/rdb --save "" --appendonly no; r() { redis-cli -p 7031 "$@"; }; for i in $(seq 1 100); do echo "SET eski:$i x"; done | r > /dev/null; r BGSAVE; sleep 1; for i in $(seq 1 50); do echo "SET yangi:$i x"; done | r > /dev/null; r DBSIZE; r INFO persistence | grep -E '^(rdb_changes_since_last_save|rdb_last_bgsave_status):'
Background saving started
150
rdb_changes_since_last_save:50
rdb_last_bgsave_status:ok
$ qul 7031; boshla 7031 /tmp/r28/rdb --save "" --appendonly no; r DBSIZE; r --scan --pattern 'yangi:*' | wc -l; grep -E 'DB loaded|Loading RDB' /tmp/r28/rdb/log | tail -2 | cut -d' ' -f4-
100
0
2026 19:25:59.948 * Loading RDB produced by version 8.10.3
2026 19:25:59.948 * DB loaded from disk: 0.000 seconds
```

- 100 kalit → `BGSAVE` → yana 50 kalit. `rdb_changes_since_last_save` — 50: suratdan keyingi o'zgarishlar.
- `kill -9` va qayta ishga tushish: **100** kalit — suratdagilar; keyingi 50 ta (`yangi:*`) **yo'qoldi**.

### AOF: qulashdan keyin

```text vps
$ boshla 7032 /tmp/r28/aof --save "" --appendonly yes; a() { redis-cli -p 7032 "$@"; }; for i in $(seq 1 100); do echo "SET eski:$i x"; done | a > /dev/null; for i in $(seq 1 50); do echo "SET yangi:$i x"; done | a > /dev/null; sleep 1.5; a DBSIZE; qul 7032; boshla 7032 /tmp/r28/aof --save "" --appendonly yes; a DBSIZE
150
150
$ ls -l /tmp/r28/aof/appendonlydir | awk 'NR>1 {print $5, $NF}'; cat /tmp/r28/aof/appendonlydir/appendonly.aof.manifest
89 appendonly.aof.1.base.rdb
5006 appendonly.aof.1.incr.aof
102 appendonly.aof.manifest
file appendonly.aof.1.base.rdb seq 1 type b
file appendonly.aof.1.incr.aof seq 1 type i startoffset 0
$ tail -c 120 /tmp/r28/aof/appendonlydir/appendonly.aof.1.incr.aof | od -c | head -6
0000000  \n   y   a   n   g   i   :   4   7  \r  \n   $   1  \r  \n   x
0000020  \r  \n   *   3  \r  \n   $   3  \r  \n   S   E   T  \r  \n   $
0000040   8  \r  \n   y   a   n   g   i   :   4   8  \r  \n   $   1  \r
0000060  \n   x  \r  \n   *   3  \r  \n   $   3  \r  \n   S   E   T  \r
0000100  \n   $   8  \r  \n   y   a   n   g   i   :   4   9  \r  \n   $
0000120   1  \r  \n   x  \r  \n   *   3  \r  \n   $   3  \r  \n   S   E
```

- Xuddi shu 150 kalit, `kill -9` — qayta ishga tushgach **150**: hech narsa yo'qolmadi (`everysec`, yozuvdan keyin 1,5 s kutildi).
- `appendonlydir` da: base (`type b`), incr (`type i`) va manifest.
- incr fayl ichi — Redis protokolidagi `SET` buyruqlari.

### AOF qayta yozish

```text vps
$ a DEL hisob > /dev/null; for i in $(seq 1 10000); do echo "INCR hisob"; done | a > /dev/null; ls -l /tmp/r28/aof/appendonlydir | awk 'NR>1 {print $5, $NF}'; a BGREWRITEAOF; sleep 1.5; ls -l /tmp/r28/aof/appendonlydir | awk 'NR>1 {print $5, $NF}'; cat /tmp/r28/aof/appendonlydir/appendonly.aof.manifest; a GET hisob
89 appendonly.aof.1.base.rdb
255029 appendonly.aof.1.incr.aof
102 appendonly.aof.manifest
Background append only file rewriting started
1788 appendonly.aof.2.base.rdb
0 appendonly.aof.2.incr.aof
106 appendonly.aof.manifest
file appendonly.aof.2.base.rdb seq 2 type b
file appendonly.aof.2.incr.aof seq 2 type i startoffset 15006
10000
```

- 10 000 ta `INCR` — incr fayl 255 029 baytga o'sdi.
- `BGREWRITEAOF` — yangi base (`seq 2`, 1788 bayt) va bo'sh incr; manifest yangilandi. Qiymat `10000` saqlandi.

### Kesilgan AOF

Server qulatildi va incr fayl oxiriga yarim `SET` qo'shildi (yozish paytida qulashni taqlid):

```text vps
$ a SET oxirgi qiymat > /dev/null; sleep 1.5; qul 7032; f=$(ls /tmp/r28/aof/appendonlydir/*.incr.aof); printf '*3\r\n$3\r\nSET\r\n$4\r\nyarm' >> $f; boshla 7032 /tmp/r28/aof --save "" --appendonly yes; a GET oxirgi; a EXISTS yarm; grep -E 'short read|Truncating|loaded anyway' /tmp/r28/aof/log | cut -d' ' -f4-
qiymat
0
2026 19:26:07.770 # !!! Warning: short read while loading the AOF file appendonly.aof.2.incr.aof!!!
2026 19:26:07.770 # !!! Truncating the AOF appendonly.aof.2.incr.aof at offset 60 !!!
2026 19:26:07.770 # AOF appendonlydir/appendonly.aof.2.incr.aof loaded anyway because aof-load-truncated is enabled
```

Redis yuklandi: `oxirgi` joyida, yarim buyruq tashlandi (`yarm` yo'q); jurnalda RD'dagi ogohlantirishlar.

### RDB'dan AOF'ga noto'g'ri o'tish

RDB'da 100 kalit bor. Faqat sozlamani `appendonly yes` qilib qayta ishga tushiramiz:

```text vps
$ r SHUTDOWN SAVE 2>/dev/null; ls /tmp/r28/rdb; boshla 7031 /tmp/r28/rdb --save "" --appendonly yes; r DBSIZE; ls /tmp/r28/rdb /tmp/r28/rdb/appendonlydir 2>&1 | tr '\n' ' '; echo
dump.rdb
log
0
/tmp/r28/rdb: appendonlydir dump.rdb log  /tmp/r28/rdb/appendonlydir: appendonly.aof.1.base.rdb appendonly.aof.1.incr.aof appendonly.aof.manifest 
```

**0 kalit!** `dump.rdb` joyida, lekin AOF yoqilgani uchun Redis uni emas, yangi (bo'sh) AOF'ni yukladi — RD ogohlantirgan ma'lumot yo'qolishi. (Bu yerda `dump.rdb` hali o'chmagan — uni zaxiralash shuning uchun 1-qadam.)

### To'g'ri o'tish

```text vps
$ r SHUTDOWN NOSAVE; rm -rf /tmp/r28/rdb/appendonlydir; boshla 7031 /tmp/r28/rdb --save "" --appendonly no; r DBSIZE; r CONFIG SET appendonly yes; sleep 1.5; r INFO persistence | grep -E '^(aof_enabled|aof_rewrite_in_progress|aof_rewrite_scheduled|aof_last_bgrewrite_status):'; r SHUTDOWN NOSAVE; boshla 7031 /tmp/r28/rdb --save "" --appendonly yes; r DBSIZE
100
OK
aof_enabled:1
aof_rewrite_in_progress:0
aof_rewrite_scheduled:0
aof_last_bgrewrite_status:ok
100
```

Ishlab turgan serverda `CONFIG SET appendonly yes`, qayta yozish tugashi kutildi (`aof_rewrite_in_progress:0`, `ok`), keyin `appendonly yes` bilan qayta ishga tushirildi — **100** kalit.

### `BACKUP` va tiklash

```text vps
$ a CONFIG GET backupdirname; a BACKUP START; sleep 1.5; a BACKUP STATUS | paste - - | head -4; a SET backupdan-keyin 1 > /dev/null; a BACKUP SEAL; a BACKUP LIST
backupdirname
backupdir
OK
state	incrementing
error	
start_time	1794155171
end_time	0
OK
/tmp/r28/aof/backupdir/appendonly.aof.3.base.rdb
/tmp/r28/aof/backupdir/appendonly.aof.3.incr.aof
/tmp/r28/aof/backupdir/appendonly.aof.manifest
$ mkdir -p /tmp/r28/tiklash && cp $(a BACKUP LIST) /tmp/r28/tiklash/ && ls /tmp/r28/tiklash; a BACKUP CLEANUP; boshla 7033 /tmp/r28/tiklash --save "" --appendonly no --preload-file aof:/tmp/r28/tiklash/appendonly.aof.manifest; redis-cli -p 7033 DBSIZE; redis-cli -p 7033 GET backupdan-keyin; redis-cli -p 7033 GET hisob
appendonly.aof.3.base.rdb
appendonly.aof.3.incr.aof
appendonly.aof.manifest
OK
153
1
10000
```

- `BACKUP START` → holat `incrementing` (base tayyor, o'zgarishlar yig'ilmoqda); keyin yozilgan `backupdan-keyin` ham nusxaga kirdi.
- `BACKUP SEAL` → `BACKUP LIST` — uchta fayl; ko'chirildi, `BACKUP CLEANUP`.
- Yangi server `preload-file aof:…manifest` bilan: 153 kalit, `backupdan-keyin` va `hisob` joyida.

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Faqat RDB, lekin yo'qotishga chidab bo'lmaydi | Oxirgi suratdan keyingisi yo'qoladi (sinovda 50 kalit) | AOF (`everysec`) yoki RDB + AOF |
| RDB'dan AOF'ga konfiguratsiyani o'zgartirib qayta ishga tushirish | Ma'lumot yo'qoladi (sinovda 0 kalit) | Ishlab turganda `CONFIG SET appendonly yes` + `CONFIG REWRITE` |
| Zaxira nusxani shu serverning o'zida saqlash | Disk/server yo'qolsa — nusxa ham | Boshqa kompyuterga, kuniga kamida bir marta |
| AOF papkasini qayta yozish paytida nusxalash | Yaroqsiz nusxa | Qayta yozishni vaqtincha o'chirish yoki `BACKUP` (8.10+) |
| Buzilgan AOF'ni darhol `--fix` qilish | Ko'p ma'lumot tashlanishi mumkin | Avval nusxa, keyin `redis-check-aof` `--fix` siz |
| Juda katta ma'lumotda tez-tez `BGSAVE` | `fork()` serverni to'xtatishi mumkin | Surat oralig'ini moslash, xotira zaxirasi |
| Kesh uchun ortiqcha saqlash | Disk va `fork` sarfi | Saqlashni o'chirish (RD: kesh uchun) |

## Amaliyot

1. RDB va AOF farqi nima? Har birining asosiy afzalligi?
2. `appendfsync` ning uch qiymati va falokatda qancha ma'lumot yo'qolishi mumkin?
3. Sinovda `kill -9` dan keyin RDB va AOF serverlarida nechtadan kalit qoldi?
4. AOF qayta yozish nima uchun kerak?
5. RDB'dan AOF'ga qanday to'g'ri o'tiladi? Noto'g'ri o'tganda sinovda nima bo'ldi?
6. RD qaysi saqlash usulini tavsiya qiladi?

<details>
<summary>Javoblar</summary>

1. RDB — davriy surat (ixcham, zaxira uchun, tez ishga tushish); AOF — har yozuv jurnali (ishonchliroq).
2. `always` — deyarli hech narsa; `everysec` — ~1 soniya; `no` — OS ixtiyorida (Linux'da odatda ~30 soniya).
3. RDB — 100 (oxirgi 50 yo'qoldi); AOF — 150 (hammasi).
4. Jurnal cheksiz o'smasligi uchun — joriy holatni eng qisqa buyruqlar bilan yozish (sinovda 255 KB → 1,8 KB).
5. Ishlab turgan serverda `CONFIG SET appendonly yes`, `CONFIG REWRITE`, qayta yozish tugashini kutish, keyin qayta ishga tushirish. Noto'g'ri o'tishda — 0 kalit.
6. Kuchli xavfsizlik uchun ikkalasi birga; daqiqalik yo'qotish mumkin bo'lsa — RDB; faqat AOF — tavsiya etilmaydi.

</details>

## Rasmiy hujjat

- [RD: Redis persistence](https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/)
- [RD: BGSAVE](https://redis.io/docs/latest/commands/bgsave/) · [BGREWRITEAOF](https://redis.io/docs/latest/commands/bgrewriteaof/) · [BACKUP START](https://redis.io/docs/latest/commands/backup-start/)
