# 34 — Yangilash

[Mundarija](README.md)

## Tushuncha

### Versiyalar siyosati

RD (Redis Open Source version management): versiya — **MAJOR.MINOR.PATCH**:

| Qism | Nima | Misol |
| --- | --- | --- |
| Major | Katta o'zgarishlar, **mos kelmaydigan** (breaking) o'zgarishlar bo'lishi mumkin | 7 → 8 |
| Minor | Shu major ichida yangi imkoniyatlar | 8.2 → 8.4 → 8.6 → 8.8 |
| Patch | Xato tuzatish va xavfsizlik yangilanishlari | 8.6.1 → 8.6.2 |

Ikki xil reliz (RD):

- **Standard** — major'ning birinchi relizi (masalan, 8.0) va oraliq minor'lar (8.4, 8.6): **keyingi minor chiqqanidan keyin 6 oy** xavfsizlik va muhim tuzatishlar.
- **Extended** — major'ning ikkinchi minor relizi (masalan, 8.2) va oxirgi minor: chiqqanidan **5 yil** davomida tuzatishlar.

Qo'llab-quvvatlanadigan versiyalar (RD, 2026-11-08 holati):

| Versiya | Tur | Qo'llab-quvvatlash tugashi |
| --- | --- | --- |
| 8.10 | Standard | belgilanmagan |
| 8.8 | Standard | belgilanmagan |
| 8.6 | Standard | belgilanmagan |
| 8.4 | Standard | belgilanmagan |
| 8.2 | Extended | 2030-09-01 |
| 8.0 | Standard | 2026-12-01 |
| 7.4 | Extended | 2029-12-01 |
| 7.2 | Extended | 2029-12-01 |
| 6.2 | Extended | 2027-04-01 |

RD: **eng so'nggi versiyani ishlatish qat'iy tavsiya etiladi** — yangi imkoniyatlar, unumdorlik va xavfsizlik yangilanishlari uchun.

### Bitta serverni yangilash

RD (Upgrade a Redis single server): qo'llanadigan yo'llar — Redis Open Source 7.x (modullar bilan yoki ularsiz) → Redis 8; Redis Stack 7.2/7.4 → Redis 8. Yangilashni avval **nazorat qilinadigan muhitda** sinab ko'ring — Docker buning uchun juda qulay.

1. **Ma'lumotni saqlash**: `redis-cli SAVE` — RDB fayl (`dump.rdb`); AOF bo'lsa — `appendonlydir` ichidagi `appendonly.aof.*`. Papka: `redis-cli CONFIG GET dir`.
2. **Nusxa**: `cp -r /path/to/redis-data-dir/ /path/to/backup/`.
3. **Yangilash**: eski serverni to'xtatish → o'rnatish usulingizga mos qadamlar bilan yangisini o'rnatish (2-bob) → avtomatik ishga tushmasa, ishga tushirish.
4. **Muammo bo'lsa — tiklash**: serverni to'xtatish, nusxani ma'lumot papkasiga qaytarish, ishga tushirish, `redis-cli INFO persistence` bilan tekshirish.
5. **Tekshirish**: `redis-cli INFO server | grep redis_version`; ma'lumot o'qilishi va mijozlar ulanishi.

### To'xtashsiz yangilash

RD (Redis administration): qayta ishga tushirish kerak bo'lsa (yangi versiya yoki `CONFIG` bilan o'zgarmaydigan sozlama):

1. Yangi Redis'ni joriy serverning **replikasi** qilib ishga tushirish (alohida server yoki ikki nusxaga yetarli RAM; bitta serverda — boshqa portda).
2. Boshlang'ich sinxronlash tugashini kutish (replika jurnali).
3. `INFO` bilan kalitlar soni tengligini va replika javob berishini tekshirish.
4. Replikaga yozishga ruxsat: `CONFIG SET slave-read-only no`.
5. Mijozlarni yangi serverga o'tkazish (o'tish paytida eski master'ga yozilmasligi uchun `CLIENT PAUSE`).
6. Eski master'ga so'rov kelmayotganiga ishonch hosil qilish (`MONITOR`), so'ng `REPLICAOF NO ONE` va eski master'ni o'chirish.

Sentinel yoki Cluster bilan — replikalarni birma-bir yangilab, keyin qo'lda failover (31–32-boblar).

## Ko'rib chiqamiz

VPS'da.

### Joriy holat

```text vps
$ redis-cli INFO server | grep -E '^redis_version'; apt-cache policy redis-server | head -8
redis_version:8.10.3
redis-server:
  Installed: 6:8.10.3-1rl1~resolute1
  Candidate: 6:8.10.3-1rl1~resolute1
  Version table:
 *** 6:8.10.3-1rl1~resolute1 500
        500 https://packages.redis.io/deb resolute/main amd64 Packages
        100 /var/lib/dpkg/status
     6:8.10.2-1rl1~resolute1 500
```

O'rnatilgan — 8.10.3 (2-bob, `packages.redis.io` repo'si); `apt` repo'da oldingi patch versiyalar ham bor.

### Docker'da sinov: 7.4 → 8.10

RD maslahati bo'yicha — yangilash nazorat qilinadigan muhitda, Docker konteynerlarida (konteynerlar faqat `127.0.0.1` da):

```text vps
$ docker pull -q redis:7.4 && docker pull -q redis:8.10; docker image inspect redis:7.4 redis:8.10 --format '{{.RepoTags}} {{range .Config.Env}}{{if eq (index (split . "=") 0) "REDIS_VERSION"}}{{.}}{{end}}{{end}}'
docker.io/library/redis:7.4
docker.io/library/redis:8.10
[redis:7.4] REDIS_VERSION=7.4.12
[redis:8.10] REDIS_VERSION=8.10.3
$ rm -rf /tmp/r34 && mkdir -p /tmp/r34/data /tmp/r34/zaxira; docker run -d --name eski -p 127.0.0.1:7080:6379 -v /tmp/r34/data:/data redis:7.4 > /dev/null; sleep 2; redis-cli -p 7080 INFO server | grep -E '^redis_version'; for i in $(seq 1 1000); do echo "SET k:$i v$i"; done | redis-cli -p 7080 > /dev/null; redis-cli -p 7080 HSET user:1 ism Ali > /dev/null; redis-cli -p 7080 DBSIZE
redis_version:7.4.12
1001
```

Eski server — 7.4.12, 1001 kalit.

**1–2. Saqlash va nusxa:**

```text vps
$ redis-cli -p 7080 SAVE; redis-cli -p 7080 CONFIG GET dir; ls /tmp/r34/data; cp -r /tmp/r34/data/. /tmp/r34/zaxira/; ls /tmp/r34/zaxira
OK
dir
/data
dump.rdb
dump.rdb
```

**3. Yangilash** — o'sha ma'lumot papkasi bilan 8.10.3:

```text vps
$ docker stop eski > /dev/null; docker run -d --name yangi -p 127.0.0.1:7080:6379 -v /tmp/r34/data:/data redis:8.10 > /dev/null; sleep 2; redis-cli -p 7080 INFO server | grep -E '^redis_version'; redis-cli -p 7080 DBSIZE; redis-cli -p 7080 HGET user:1 ism; docker logs yangi 2>&1 | grep -E 'Loading RDB|DB loaded' | sed -E 's/^[0-9]+:[A-Z] [^*#]*//'
redis_version:8.10.3
1001
Ali
* Loading RDB produced by version 7.4.12
* DB loaded from disk: 0.004 seconds
```

8.10.3 ishga tushdi va 7.4.12 yaratgan RDB'ni yukladi: 1001 kalit, hash ham joyida.

### Orqaga qaytarishdagi tuzoq

Yangi versiyada ma'lumot saqlandi, so'ng **eski** versiyaga qaytishga urinish:

```text vps
$ redis-cli -p 7080 SET yangida 1 > /dev/null; redis-cli -p 7080 SAVE; docker stop yangi > /dev/null; docker rm eski > /dev/null; docker run -d --name eski -p 127.0.0.1:7080:6379 -v /tmp/r34/data:/data redis:7.4 > /dev/null; sleep 3; docker ps -a --filter name=eski --format '{{.Status}}'; docker logs eski 2>&1 | grep -iE 'version|Fatal|Can.t handle' | sed -E 's/^[0-9]+:[A-Z] [^*#]*//' | tail -3
OK
Exited (1) 2 seconds ago
* Redis version=7.4.12, bits=64, commit=00000000, modified=0, pid=1, just started
# Can't handle RDB format version 15
# Fatal error loading the DB, check server logs. Exiting.
```

7.4.12 ishga tushmadi: "Can't handle RDB format version 15" — kuzatildi: 8.10 yozgan RDB'ni eski versiya o'qiy olmadi. Ya'ni yangilashdan keyin oddiy "eski binar faylni qaytarish" ishlamasligi mumkin.

**4. Nusxadan tiklash:**

```text vps
$ docker rm -f eski > /dev/null; rm -rf /tmp/r34/data && cp -r /tmp/r34/zaxira /tmp/r34/data; docker run -d --name eski -p 127.0.0.1:7080:6379 -v /tmp/r34/data:/data redis:7.4 > /dev/null; sleep 2; redis-cli -p 7080 INFO server | grep -E '^redis_version'; redis-cli -p 7080 DBSIZE; redis-cli -p 7080 INFO persistence | grep -E '^(loading|rdb_last_load_keys_loaded):'
redis_version:7.4.12
1001
loading:0
rdb_last_load_keys_loaded:1001
```

Yangilashdan **oldingi** nusxa bilan 7.4.12 yana ishladi — 1001 kalit. Lekin yangilashdan keyin yozilgan ma'lumot (`yangida`) nusxada yo'q — yo'qoldi.

```text vps
$ docker rm -f eski yangi > /dev/null; rm -rf /tmp/r34; docker ps -a --filter name=eski --filter name=yangi -q | wc -l
0
```

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Nusxasiz yangilash | Muammo bo'lsa tiklab bo'lmaydi (RD) | `SAVE` + papkani nusxalash |
| Production'da birinchi marta yangilash | Kutilmagan muammo (RD: avval nazoratli muhitda) | Docker'da yoki sinov serverida mashq |
| Yangilashdan keyin eski binarga qaytish orqali "orqaga qaytish" | Yangi RDB formati o'qilmasligi mumkin (sinovda 7.4 ishga tushmadi) | Yangilashdan oldingi nusxadan tiklash |
| Orqaga qaytishda keyingi yozuvlarni hisobga olmaslik | Nusxadan keyingi ma'lumot yo'qoladi (sinovda `yangida`) | Qaytish rejasini oldindan, ma'lumot yo'qotish bilan baholash |
| Qo'llab-quvvatlash muddati tugagan versiya | Xavfsizlik tuzatishlari yo'q (8.0 — 2026-12-01 gacha) | Qo'llab-quvvatlanadigan versiya; RD: eng so'nggisi |
| To'xtashsiz kerak bo'lsa, bitta serverni to'xtatib yangilash | Uzilish | Replika orqali almashtirish |
| Yangilashdan keyin tekshirmaslik | Versiya yoki ma'lumot muammosi sezilmaydi | `INFO server`, kalitlar soni, mijozlar |

## Amaliyot

1. Redis versiyasidagi uch qism nimani bildiradi?
2. Standard va Extended relizlar farqi nima? 8.2 qachongacha qo'llab-quvvatlanadi?
3. Bitta serverni yangilashdan oldin qaysi ikki qadam majburiy?
4. Sinovda 8.10 saqlagan ma'lumot bilan 7.4 ni ishga tushirganda nima bo'ldi?
5. To'xtashsiz yangilash qanday qilinadi?
6. RD qaysi versiyani ishlatishni tavsiya qiladi?

<details>
<summary>Javoblar</summary>

1. Major — katta (mos kelmaydigan) o'zgarishlar, minor — yangi imkoniyatlar, patch — tuzatishlar va xavfsizlik.
2. Standard — keyingi minor chiqqanidan keyin 6 oy; Extended — chiqqanidan 5 yil. 8.2 — 2030-09-01 gacha.
3. `SAVE` va ma'lumot papkasini nusxalash.
4. Ishga tushmadi: "Can't handle RDB format version 15".
5. Yangi serverni replika qilish, sinxronlashni kutish, tekshirish, mijozlarni o'tkazish, `REPLICAOF NO ONE`, eskisini o'chirish.
6. Eng so'nggi mavjud versiyani.

</details>

## Rasmiy hujjat

- [RD: Redis Open Source version management](https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/)
- [RD: Upgrade a Redis single server](https://redis.io/docs/latest/operate/oss_and_stack/install/upgrade/standalone/)
- [RD: Redis administration — Upgrading without downtime](https://redis.io/docs/latest/operate/oss_and_stack/management/admin/)
