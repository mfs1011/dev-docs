# 33 — Unumdorlik va profiling

[← Oldingi: Amaliy loyiha](32-amaliy-loyiha.md) · [Mundarija](README.md) · [Keyingi: Kod sifati →](34-kod-sifati.md)

---

## Avval o'lchang

Optimallashtirish qoidasi: **o'lchamasdan tuzatma**. Symfony buning uchun uchta vosita beradi.

### 1. Profiler (dev)

```shell
symfony serve -d
```

Har sahifaning pastidagi panel: bajarilish vaqti, xotira, SQL so'rovlar soni va vaqti, keshdagi hit/miss, yuborilgan xatlar, ishlagan listener'lar, autowiring qarorlari.

API uchun `/_profiler` sahifasini to'g'ridan-to'g'ri oching: har so'rov uchun alohida token bor (javobning `X-Debug-Token` sarlavhasida).

### 2. Stopwatch (kodda)

```php
use Symfony\Component\Stopwatch\Stopwatch;

$stopwatch->start('import');
// ...
$event = $stopwatch->stop('import');
$this->logger->info('Import finished', ['ms' => $event->getDuration(), 'memory' => $event->getMemory()]);
```

### 3. Tashqi profiler

Blackfire, Xdebug profiler, `strace`/APM — ular "qaysi funksiya qancha vaqt oldi" savoliga javob beradi. Symfony Profiler esa "qaysi qatlam" savoliga javob beradi. Ikkalasi bir-birini to'ldiradi.

---

## Production sozlamalari

### OPcache

```ini
; php.ini (production)
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=32531
opcache.interned_strings_buffer=32
opcache.validate_timestamps=0
```

`validate_timestamps=0` — PHP fayllar o'zgarganini tekshirmaydi (har so'rovda `stat` chaqirig'i yo'q). **Muhim oqibat:** deploy'dan keyin OPcache'ni tozalash kerak — odatda PHP-FPM ni qayta ishga tushirish bilan.

### Preload

```ini
opcache.preload=/var/www/app/config/preload.php
opcache.preload_user=www-data
```

Preload PHP jarayoni ishga tushganda klasslarni xotiraga yuklaydi — ular har so'rovda qayta kompilyatsiya qilinmaydi. Symfony Flex `config/preload.php` ni o'zi yaratadi.

Container'ni bitta faylga kompilyatsiya qilish (preload uchun samaraliroq):

```yaml
# config/services.yaml
parameters:
    .container.dumper.inline_factories: true
```

### Composer autoloader

```shell
composer install --no-dev --optimize-autoloader
composer dump-autoload --no-dev --classmap-authoritative
```

`--classmap-authoritative` — klass topilmasa fayl tizimida qidirilmaydi. Tezroq, lekin dinamik klass yaratuvchi kutubxonalar bilan ehtiyot bo'ling.

### realpath kesh

```ini
realpath_cache_size=4096K
realpath_cache_ttl=600
```

### Boshqalar

```yaml
framework:
    enabled_locales: ['uz', 'ru', 'en']   # faqat kerakli tillar

parameters:
    debug.container.dump: false           # prod'da XML dump kerak emas
```

```shell
composer dump-env prod          # .env.local.php
php bin/console cache:warmup    # deploy paytida, trafikdan oldin
```

---

## Ilova darajasidagi optimallashtirish

Tartib muhim — yuqoridan pastga:

| № | Chora | Odatiy foyda |
| --- | --- | --- |
| 1 | N+1 ni yo'q qilish ([18-bob](18-aloqalar.md)) | Katta (100 so'rov → 1) |
| 2 | Indekslar ([17-bob](17-repository-va-dql.md)) | Katta (sekin so'rov → millisekund) |
| 3 | Paginatsiya va `SELECT` maydonlarini cheklash | Katta |
| 4 | Og'ir ishlarni Messenger'ga chiqarish ([26-bob](26-messenger.md)) | Katta (javob vaqti) |
| 5 | Kesh ([28-bob](28-cache-lock-httpclient.md)) | O'rtacha–katta |
| 6 | HTTP kesh / ETag ([11-bob](11-request-response.md)) | Katta (so'rov umuman kelmaydi) |
| 7 | OPcache/preload | O'rtacha (bir marta sozlanadi) |

**Eng samarali optimallashtirish — ishni umuman bajarmaslik.** HTTP kesh yoki 304 javob bilan so'rov ilovaga yetib bormaydi; bu har qanday kod optimizatsiyasidan tezroq.

---

## Doctrine unumdorligi

```yaml
when@prod:
    doctrine:
        orm:
            query_cache_driver:
                type: pool
                pool: doctrine.system_cache_pool
            result_cache_driver:
                type: pool
                pool: doctrine.result_cache_pool
```

Skeleton buni allaqachon sozlab beradi. Qo'shimcha choralar:

- Faqat o'qish uchun so'rovlarda `getArrayResult()` — hidratsiya narxi yo'q.
- Katta to'plamlarda `toIterable()` + `clear()` ([37-bob](37-ilgor-doctrine.md)).
- `EXTRA_LAZY` kolleksiyalar.
- Statistika: Profiler'dagi "Doctrine" paneli — so'rovlar soni va **takrorlangan** so'rovlar.

---

## Worker rejimi (FrankenPHP, Swoole)

Klassik PHP-FPM har so'rovda ilovani noldan ko'taradi. Worker rejimida ilova bir marta ko'tariladi va ko'p so'rovga xizmat qiladi — bootstrap narxi yo'qoladi (ko'pincha 2–10 barobar tezlik).

Buning sharti — **kodingiz holatsiz bo'lishi** ([05-bob](05-service-container.md)):

- servislarda so'rovga bog'liq holat saqlamang;
- statik xususiyatlarni kesh sifatida ishlatmang;
- Doctrine `EntityManager` va boshqa "reset qilinadigan" servislar Symfony tomonidan avtomatik tozalanadi, lekin sizning servislaringiz `ResetInterface` ni implement qilishi kerak bo'lishi mumkin.

Bu — bepul tezlik emas, **arxitektura talabi**. Lekin uni boshidan hisobga olish keyinchalik migratsiyani osonlashtiradi.

---

## Muhandislik nuqtai nazari: unumdorlik byudjeti

Professional yondashuv — "tez bo'lsin" emas, **o'lchanadigan byudjet**:

| Metrika | Nega u | Misol maqsad |
| --- | --- | --- |
| p50 javob vaqti | Odatiy tajriba | < 100 ms |
| **p95 / p99** | Eng yomon tajriba — foydalanuvchi shuni eslab qoladi | < 500 ms |
| So'rov boshiga SQL soni | Regressiyani erta ushlaydi | < 10 |
| Xotira cho'qqisi | Worker sig'imini belgilaydi | < 64 MB |

**O'rtacha qiymatga qaramang** — u yomon holatlarni yashiradi. 99% so'rov 50 ms, 1% so'rov 10 soniya bo'lsa, o'rtacha 150 ms chiqadi va hammasi "yaxshi" ko'rinadi, lekin har yuzinchi foydalanuvchi 10 soniya kutadi.

Ikkinchi muhim tushuncha — **Amdal qonuni**: umumiy tezlanish optimallashtirilmagan qismlar bilan cheklanadi. 200 ms so'rovning 180 ms i bazada bo'lsa, PHP kodini ikki barobar tezlashtirish jami 10 ms beradi. Shuning uchun avval **taqsimotni** o'lchang, keyin eng katta bo'lakni oling.

Uchinchi — **yuk ostida o'lchash**. Bo'sh serverdagi 50 ms, 500 parallel so'rov ostida 5 soniyaga aylanishi mumkin (ulanishlar puli, qulflar, disk I/O). Yuk testisiz (`k6`, `vegeta`, `ab`) production xatti-harakatini bilib bo'lmaydi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `dev` muhitda unumdorlik o'lchash | Profiler va debug hammasini sekinlashtiradi | `APP_ENV=prod` da o'lchang |
| O'lchamasdan optimallashtirish | Vaqt isrofi, murakkablik | Profiler/APM bilan boshlang |
| N+1 ni kesh bilan yashirish | Muammo qoladi, invalidatsiya murakkablashadi | Avval so'rovni tuzating |
| `validate_timestamps=0` + OPcache tozalamaslik | Eski kod ishlab turadi | Deploy'da PHP-FPM restart |
| O'rtacha vaqtga qarab xulosa chiqarish | Yomon holatlar yashirinadi | p95/p99 |
| Worker rejimida holatli servislar | Ma'lumot oqishi | Holatsiz dizayn |
| `cache:warmup` ni deploy'da o'tkazib yuborish | Birinchi so'rovlar sekin | Trafikdan oldin warmup |

---

## Amaliyot

1. Ro'yxat endpoint'ini `dev` va `prod` muhitlarda o'lchang (`curl -w '%{time_total}\n'`) va farqni tushuntiring.
2. Profiler'da N+1 bor endpoint toping va uni `JOIN FETCH` bilan tuzating; so'rovlar sonini oldin/keyin yozing.
3. `opcache.validate_timestamps=0` va preload'ni lokal sozlang, `ab -n 200 -c 10` bilan farqni o'lchang.
4. `composer dump-env prod` + `cache:warmup` bajarib, birinchi so'rov vaqtini solishtiring.
5. `enabled_locales` ni cheklang va `var/cache/prod` hajmi qanday o'zgarganini ko'ring.

---

## Rasmiy hujjat

- Unumdorlik: <https://symfony.com/doc/current/performance.html>
- Profiler: <https://symfony.com/doc/current/profiler.html>
- Stopwatch: <https://symfony.com/doc/current/components/stopwatch.html>
- HTTP kesh: <https://symfony.com/doc/current/http_cache.html>
- Doctrine unumdorligi: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/improving-performance.html>

---

[← Oldingi: Amaliy loyiha](32-amaliy-loyiha.md) · [Mundarija](README.md) · [Keyingi: Kod sifati →](34-kod-sifati.md)
