# 02 — O'rnatish

[Mundarija](README.md)

## Tushuncha

Redis'ni o'rnatishning bir necha yo'li bor (RD: Install Redis Open Source): Linux paket omborlari, Docker, manbadan yig'ish. Bu kitobda — Ubuntu'da **Redis'ning rasmiy APT ombori** (`packages.redis.io`).

### Nega Ubuntu'ning o'z paketi emas

VPS — Ubuntu 26.04 LTS. Ubuntu'ning o'z omborida ham `redis-server` bor, lekin u **8.0.5** — Redis 8.0 seriyasi. RD (Version management):

| Tur | Qaysi relizlar | Qo'llab-quvvatlash |
| --- | --- | --- |
| **Standard** | Major seriyaning birinchi relizi (8.0) va oraliq minor relizlar (8.4, 8.6…) | Keyingi minor reliz chiqqandan keyin **6 oy** xavfsizlik va muhim tuzatishlar |
| **Extended** | Seriyaning ikkinchi minor relizi (8.2) va oxirgi minor relizi | Reliz sanasidan **5 yil** |

Hujjatdagi jadvalda **Redis 8.0** — Standard, qo'llab-quvvatlash tugashi **2026-yil 1-dekabr**. RD **eng so'nggi versiyani ishlatishni qat'iy tavsiya qiladi**. Shuning uchun — rasmiy ombor, unda joriy **8.10.3** bor (README'dagi versiyalar jadvali).

Versiya raqami **MAJOR.MINOR.PATCH** (RD): major — buzuvchi o'zgarishlar bo'lishi mumkin (7 → 8); minor — yangi imkoniyatlar (8.6 → 8.8); patch — tuzatishlar va xavfsizlik (8.6.1 → 8.6.2).

## Ko'rib chiqamiz

Hammasi VPS'da (`root`), RD'ning APT qo'llanmasidagi buyruqlar bilan.

### Ubuntu va uning o'z paketi

```text vps
$ lsb_release -ds; lsb_release -cs
Ubuntu 26.04.1 LTS
resolute
$ apt-cache policy redis-server | head -4
redis-server:
  Installed: (none)
  Candidate: 5:8.0.5-1ubuntu0.1
  Version table:
```

### Rasmiy omborni qo'shish

```text vps
$ sudo apt-get install -y -q lsb-release curl gpg >/dev/null 2>&1; echo "tayyorlov: $?"
tayyorlov: 0
$ curl -fsSL https://packages.redis.io/gpg | sudo gpg --dearmor --yes -o /usr/share/keyrings/redis-archive-keyring.gpg && sudo chmod 644 /usr/share/keyrings/redis-archive-keyring.gpg && ls -l /usr/share/keyrings/redis-archive-keyring.gpg | awk '{print $1, $NF}'
-rw-r--r-- /usr/share/keyrings/redis-archive-keyring.gpg
$ echo "deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/redis.list
deb [signed-by=/usr/share/keyrings/redis-archive-keyring.gpg] https://packages.redis.io/deb resolute main
$ sudo apt-get update -q 2>&1 | grep -i redis
Get:5 https://packages.redis.io/deb resolute InRelease [3860 B]
Get:6 https://packages.redis.io/deb resolute/main all Packages [1702 B]
Get:7 https://packages.redis.io/deb resolute/main amd64 Packages [6006 B]
```

| Qadam | Nima |
| --- | --- |
| `curl … /gpg \| gpg --dearmor` | Ombor imzo kalitini yuklab, APT tushunadigan formatga o'girish (`--yes` — fayl bo'lsa ustidan yozish) |
| `chmod 644` | Kalit faylini hamma o'qiy olsin |
| `sources.list.d/redis.list` | Ombor manzili; `signed-by` — paketlar **faqat shu kalit** bilan imzolangan bo'lsa qabul qilinadi |
| `$(lsb_release -cs)` | Ubuntu kod nomi — bu yerda `resolute` (26.04) |
| `apt-get update` | Ombor ro'yxatlarini yuklash: `packages.redis.io` dan uchta fayl keldi |

```text vps
$ apt policy redis 2>/dev/null | head -8
redis:
  Installed: (none)
  Candidate: 6:8.10.3-1rl1~resolute1
  Version table:
     6:8.10.3-1rl1~resolute1 500
        500 https://packages.redis.io/deb resolute/main amd64 Packages
        500 https://packages.redis.io/deb resolute/main all Packages
     6:8.10.2-1rl1~resolute1 500
```

Endi `redis` paketining nomzodi — **8.10.3** rasmiy ombordan. Ro'yxatda oldingi versiyalar ham bor: RD bo'yicha aniq versiyani `redis=6:…` ko'rinishida yoki APT `Pin` sozlamasi bilan qotirish mumkin.

### O'rnatish va tekshirish

```text vps
$ sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -q redis 2>&1 | grep -E '^(Setting up|Unpacking) redis' 
Unpacking redis-tools (6:8.10.3-1rl1~resolute1) ...
Unpacking redis-server (6:8.10.3-1rl1~resolute1) ...
Unpacking redis (6:8.10.3-1rl1~resolute1) ...
Setting up redis-tools (6:8.10.3-1rl1~resolute1) ...
Setting up redis-server (6:8.10.3-1rl1~resolute1) ...
Setting up redis (6:8.10.3-1rl1~resolute1) ...
$ redis-server --version
Redis server v=8.10.3 sha=00000000:1 malloc=jemalloc-5.3.0 bits=64 build=902979a75b129958
$ redis-cli --version
redis-cli 8.10.3
$ dpkg -l | awk '$2 ~ /^redis/ {print $2, $3}'
redis 6:8.10.3-1rl1~resolute1
redis-server 6:8.10.3-1rl1~resolute1
redis-tools 6:8.10.3-1rl1~resolute1
```

`redis` — meta-paket: u `redis-server` (server) va `redis-tools` (`redis-cli` va boshqa vositalar) ni o'rnatadi (RD).

RD: Redis o'rnatilgandan keyin va kompyuter yuklanganda **avtomatik ishga tushadi**:

```text vps
$ systemctl is-enabled redis-server; systemctl is-active redis-server
enabled
active
$ systemctl status redis-server --no-pager | sed -n 1,4p | sed -E 's/since .*;/since …;/'
● redis-server.service - Advanced key-value store
     Loaded: loaded (/usr/lib/systemd/system/redis-server.service; enabled; preset: enabled)
     Active: active (running) since …; 2s ago
```

Avtomatik ishga tushmasa — `sudo systemctl enable redis-server` va `sudo systemctl start redis-server` (RD).

```text vps
$ ss -tlnp | grep 6379 | awk '{print $1, $4, $6}' | sed -E 's/pid=[0-9]+/pid=…/'
LISTEN 127.0.0.1:6379 users:(("redis-server",pid=…,fd=20))
LISTEN [::1]:6379 users:(("redis-server",pid=…,fd=21))
$ redis-cli ping
PONG
$ redis-cli INFO server | grep -E '^(redis_version|redis_mode|os|arch_bits|tcp_port|config_file|executable)'
redis_version:8.10.3
redis_mode:standalone
os:Linux 7.0.0-42-generic x86_64
arch_bits:64
tcp_port:6379
executable:/usr/bin/redis-server
config_file:/etc/redis/redis.conf
```

- Server **faqat** `127.0.0.1` va `::1` da (loopback, Web asoslari 3-bob) — tashqaridan ulanib bo'lmaydi. Port — **6379**.
- `redis-cli ping` → `PONG`: server javob beryapti (3-bob).
- `INFO server` — server haqida: versiya, rejim (`standalone` — bitta server), sozlama fayli `/etc/redis/redis.conf`.

Sozlama faylidagi standart qiymatlar (batafsil — 26, 28, 29-boblar):

```text vps
$ grep -nE '^(bind|protected-mode|port|supervised|dir|logfile|appendonly) ' /etc/redis/redis.conf
88:bind 127.0.0.1 -::1
112:protected-mode yes
139:port 6379
389:supervised auto
417:logfile /var/log/redis/redis-server.log
577:dir /var/lib/redis
1491:appendonly no
```

| Sozlama | Qiymat | Ma'nosi |
| --- | --- | --- |
| `bind 127.0.0.1 -::1` | Faqat lokal | Qaysi manzillarda tinglash |
| `protected-mode yes` | Yoqiq | `redis.conf` izohi: yoqiq va standart foydalanuvchida parol yo'q bo'lsa, server faqat `127.0.0.1`, `::1` va Unix soketdan ulanishni qabul qiladi (29-bob) |
| `port 6379` | — | TCP port |
| `supervised auto` | — | systemd bilan ishlash |
| `logfile` | `/var/log/redis/redis-server.log` | Jurnal |
| `dir` | `/var/lib/redis` | Ma'lumot fayllari papkasi |
| `appendonly no` | O'chiq | AOF bilan diskka yozish o'chiq (28-bob) |

## Tipik xatolar

| Xato | Nega noto'g'ri | To'g'risi |
| --- | --- | --- |
| Distributivdagi eski paketni o'rnatish | Ubuntu 26.04 dagi 8.0.5 — qo'llab-quvvatlashi 2026-12-01 da tugaydigan seriya | Rasmiy ombor, eng so'nggi versiya (RD tavsiyasi) |
| Kalitni `apt-key` bilan yoki `signed-by` siz qo'shish | Kalit barcha omborlarga ishonchli bo'lib qoladi | `signed-by=/usr/share/keyrings/…` (RD buyrug'idagi kabi) |
| `bind 0.0.0.0` qilib, parolsiz ochish | Redis internetga ochiq qoladi | Lokal qoldirish yoki ACL va tarmoq cheklovi (29-bob) |
| Versiyani tasodifan yangilanib ketishiga qoldirish | Major/minor yangilanish xatti-harakatni o'zgartirishi mumkin | Kerak bo'lsa APT `Pin`; yangilashni rejalab (34-bob) |

## Amaliyot

1. Nega Ubuntu'ning `redis-server` paketi emas, rasmiy ombor tanlandi?
2. Standard va Extended relizlar farqi nima?
3. `signed-by` nima beradi?
4. `redis` paketi qaysi paketlarni o'rnatadi?
5. O'rnatilgandan keyin Redis qaysi manzil va portda tinglayapti? Tashqaridan ulanib bo'ladimi?

<details>
<summary>Javoblar</summary>

1. Ubuntu 26.04 dagi paket — 8.0.5; Redis 8.0 qo'llab-quvvatlashi 2026-12-01 da tugaydi, RD esa eng so'nggisini tavsiya qiladi (8.10.3).
2. Standard — keyingi minor chiqqandan keyin 6 oy; Extended — reliz sanasidan 5 yil qo'llab-quvvatlanadi.
3. Ombor paketlari faqat ko'rsatilgan kalit bilan imzolangan bo'lsagina qabul qilinadi.
4. `redis-server` va `redis-tools` (`redis-cli` va boshqalar).
5. `127.0.0.1` va `::1`, port 6379. Yo'q — faqat lokal.

</details>

## Rasmiy hujjat

- [RD: Install Redis Open Source on Linux (APT)](https://redis.io/docs/latest/operate/oss_and_stack/install/install-stack/apt/)
- [RD: Version management](https://redis.io/docs/latest/operate/oss_and_stack/install/version-mgmt/)
- [Redis relizlari (GitHub)](https://github.com/redis/redis/releases)
