# Redis trenajori

Saytdagi `/redis/trenajor` sahifasi: brauzerda (v86, 32-bit) haqiqiy Debian 12 va Redis 8.10.3 (kitob tayangan versiya).
Simulyator emas — har buyruq Redis'da bajariladi, sxemadagi har o'zgarish Redis'ning o'z ma'lumotidan.

## Qanday ishlaydi

- **Redis** Debian 12 i386 konteynerida rasmiy manba arxividan yig'iladi (`scripts/redis-yigish.sh`, SHA256 —
  github.com/redis/redis-hashes). Faqat Redis'ning o'zi (`make -C src`): Redis 8 modullari (JSON, Search,
  TimeSeries, Bloom) Rust va qo'shimcha vositalar bilan alohida yig'iladi — trenajorda yo'q (kitobning 11-bobi, JSON,
  shuning uchun trenajorda sinalmaydi).
- **Tasvir** Linux trenajori quvurining `redis` profili bilan yig'iladi (`profil.json`, `ildiz/`):
  - `/etc/redis/redis.conf` — Redis manbasidagi asl `redis.conf` + oxirida `include /etc/redis/trenajor.conf`
    (`notify-keyspace-events KEA`, `maxmemory 64mb`, `dir /var/lib/redis`);
  - `redis-server.service` (foydalanuvchi `redis`), `redis-boshqaruv.service`;
  - holat surati Redis va boshqaruv xizmati "tayyor" degach olinadi (`holatKutish`).
- **Kanal** — ikkinchi serial port (`/dev/ttyS1`), har qatorda bitta JSON (`redis-boshqaruv`, Python 3 + redis-py):
  - sahifa → VM: `buyruq` (panel ulanishi, nomi `panel`), `obuna` / `obuna.stop` (haqiqiy SUBSCRIBE ulanishlari),
    `tozala` (FLUSHALL, sozlamalar va statistika asliga);
  - VM → sahifa: `holat` (SCAN/TYPE/PTTL va qiymatlar, INFO, obunachilar), `buyruq` (MONITOR — terminaldagi
    redis-cli'dan ham; xizmatning o'z ulanishlari — `trenajor-ichki` — ko'rsatilmaydi), `hodisa`
    (`__keyevent@0__:*`: expired, evicted, del …), `pubsub`; soniyasiga 40 tadan ortiq buyruq/hodisa sanab o'tiladi.
- **Sahifa** — `src/views/RedisTrenajorPage.vue`: buyruq paneli (turlar bo'yicha tayyor buyruqlar, redis-cli
  ko'rinishidagi javob, izoh), kalitlar xaritasi (`Kalitlar.vue` — har tur o'z shaklida, TTL halqasi, muddati tugagan /
  evict qilingan kalit "arvoh"), statistika (`Statistika.vue` — xotira, hit/miss, expired, evicted), Pub/Sub
  (`PubSub.vue`), buyruqlar oqimi (`Oqim.vue`), terminal, mashqlar (`mashqlar.js`).

## Yig'ish va tekshirish

```sh
sh redis-trenajor/scripts/redis-yigish.sh                      # Docker kerak (linux/386) -> build/redis-8.10.3-i386.tar.gz
TRENAJOR_PROFIL=redis sh linux-trenajor/scripts/yigish.sh      # -> build/web/{fs/, holat.zst}
ln -sfn ../redis-trenajor/build/web public/redis-trenajor       # lokal dev uchun (CI nusxalaydi)
node redis-trenajor/test/kanal.mjs ssenariy.json               # kanal orqali buyruqlar (Node'da, brauzersiz)
node redis-trenajor/test/mashqlar.mjs                          # har mashq haqiqiy buyruqlar bilan oxirigacha
URL=http://localhost:5182/redis/trenajor node redis-trenajor/test/brauzer.mjs   # skrinshotlar
```

Sinov VPS'idan `download.redis.io` 403 qaytaradi — arxivni boshqa joyda yuklab, `build/` ga qo'ying (skript bor arxivni
qayta yuklamaydi, SHA256 baribir tekshiriladi). Bir vaqtda ikkita yig'ish ishlatmang — `build/` buziladi.
