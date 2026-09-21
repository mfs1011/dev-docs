# 40 — Deploy, Docker, CI/CD va production tekshiruv ro'yxati

[← Oldingi: Arxitektura](39-arxitektura.md) · [Mundarija](README.md)

---

## Deploy qadamlari

```shell
# 1. Kod
git fetch --all && git checkout --force $RELEASE_TAG

# 2. Bog'liqliklar (dev paketlarsiz, optimallashtirilgan autoloader)
composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# 3. Muhit o'zgaruvchilari
composer dump-env prod

# 4. Kesh
APP_ENV=prod APP_DEBUG=0 php bin/console cache:clear
APP_ENV=prod APP_DEBUG=0 php bin/console cache:warmup

# 5. Assetlar (agar frontend bo'lsa)
php bin/console asset-map:compile

# 6. Migratsiyalar
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# 7. Trafikni yangi relizga o'tkazish (symlink almashtirish)
ln -sfn $RELEASE_DIR /var/www/current

# 8. OPcache va worker'lar
sudo systemctl reload php8.4-fpm
php bin/console messenger:stop-workers
```

Ikki nozik nuqta:

- **`cache:warmup` trafikdan oldin.** Aks holda birinchi so'rovlar container qurilishini kutadi.
- **`messenger:stop-workers` deploy oxirida.** Worker'lar eski kodni xotirada saqlaydi; to'xtatilgandan keyin supervisor ularni yangi kod bilan ko'taradi ([26-bob](26-messenger.md)).

Nol to'xtovli deploy uchun relizlar alohida papkaga chiqariladi va faqat oxirida symlink almashtiriladi — shunda rollback ham symlink'ni qaytarishdan iborat bo'ladi.

---

## Web-server

```nginx
server {
    server_name example.com;
    root /var/www/current/public;          # FAQAT public/

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/index\.php(/|$) {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_split_path_info ^(.+\.php)(/.*)$;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        internal;
    }

    location ~ \.php$ {
        return 404;                         # boshqa .php fayllarni bajarmaslik
    }

    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

Proxy ortida ishlayotganda `trusted_proxies` ni sozlashni unutmang ([11-bob](11-request-response.md)).

---

## Docker (production uchun ko'p bosqichli build)

```dockerfile
# syntax=docker/dockerfile:1
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

FROM php:8.4-fpm-alpine AS runtime
RUN apk add --no-cache icu-dev postgresql-dev \
    && docker-php-ext-install intl pdo_pgsql opcache

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
WORKDIR /app

COPY --from=vendor /app/vendor ./vendor
COPY . .

RUN composer dump-autoload --no-dev --classmap-authoritative \
    && APP_ENV=prod php bin/console cache:warmup \
    && chown -R www-data:www-data var

USER www-data
CMD ["php-fpm"]
```

Uchta muhim qoida:

1. **`vendor/` ni alohida bosqichda o'rnating** — `composer.json` o'zgarmasa, Docker bu qatlamni keshlaydi va build tezlashadi.
2. **`USER www-data`** — konteyner ichida `root` bo'lib ishlamang.
3. **`.dockerignore`** ga `var/`, `vendor/`, `.git`, `.env.local` ni qo'shing.

---

## CI/CD

```yaml
# .github/workflows/ci.yaml
name: CI

on: [push, pull_request]

jobs:
    tests:
        runs-on: ubuntu-latest
        services:
            postgres:
                image: postgres:16-alpine
                env:
                    POSTGRES_PASSWORD: app
                    POSTGRES_USER: app
                    POSTGRES_DB: app
                options: >-
                    --health-cmd pg_isready --health-interval 10s
                    --health-timeout 5s --health-retries 5
                ports: ['5432:5432']
        env:
            DATABASE_URL: postgresql://app:app@127.0.0.1:5432/app?serverVersion=16
        steps:
            - uses: actions/checkout@v4
            - uses: shivammathur/setup-php@v2
              with:
                  php-version: '8.4'
                  extensions: ctype, iconv, intl, pdo_pgsql
                  coverage: none
            - run: composer install --prefer-dist --no-progress
            - run: vendor/bin/php-cs-fixer fix --dry-run --diff
            - run: vendor/bin/phpstan analyse --no-progress
            - run: php bin/console lint:container
            - run: php bin/console lint:yaml config
            - run: php bin/console lint:twig templates
            - run: composer audit
            - run: php bin/console doctrine:migrations:migrate --no-interaction --env=test
            - run: php bin/phpunit
```

Migratsiyalarni CI'da **bo'sh bazaga** yurgizish — "faqat mening mashinamda ishlaydi" muammosini yo'q qiladi ([16-bob](16-migratsiyalar.md)).

---

## Production tekshiruv ro'yxati

### Konfiguratsiya va muhit

- [ ] `APP_ENV=prod`, `APP_DEBUG=0`
- [ ] `APP_SECRET` noyob va sirlar vaultida ([08-bob](08-konfiguratsiya.md))
- [ ] `.env.local` / sirlar git'ga tushmagan
- [ ] `composer dump-env prod` bajarilgan
- [ ] `trusted_proxies` va `trusted_hosts` sozlangan
- [ ] `enabled_locales` cheklangan

### Xavfsizlik

- [ ] HTTPS majburiy (HSTS sarlavhasi bilan)
- [ ] `security.yaml`: barcha yo'llar uchun `access_control` qoidalari bor, standart — rad etish
- [ ] Parol hasher — `auto` ([22-bob](22-xavfsizlik.md))
- [ ] `login_throttling` yoqilgan
- [ ] Ob'ekt darajasidagi ruxsat Voter'lar bilan va testlangan ([23-bob](23-avtorizatsiya.md))
- [ ] Rate limiting kritik endpointlarda ([21-bob](21-rest-api.md))
- [ ] Xavfsizlik sarlavhalari: `X-Content-Type-Options`, `Referrer-Policy`, CSP
- [ ] `composer audit` va `symfony check:security` toza
- [ ] Profiler va `_wdt` production'da **yoqilmagan**
- [ ] Foydalanuvchi bergan URL'larga so'rov — SSRF himoyasi bilan ([28-bob](28-cache-lock-httpclient.md))

### Ma'lumotlar bazasi

- [ ] Migratsiyalar deploy'da avtomatik ([16-bob](16-migratsiyalar.md))
- [ ] Sxema o'zgarishi expand–contract naqshiga mos
- [ ] Indekslar tekshirilgan (`EXPLAIN`), N+1 yo'q ([18-bob](18-aloqalar.md))
- [ ] Zaxira nusxa (backup) sozlangan **va tiklanishi sinab ko'rilgan**
- [ ] Ulanishlar puli limitlari hisoblangan ([37-bob](37-ilgor-doctrine.md))

### Unumdorlik

- [ ] OPcache yoqilgan, `validate_timestamps=0`, deploy'da reset ([33-bob](33-unumdorlik.md))
- [ ] `opcache.preload` sozlangan
- [ ] `composer install --no-dev --optimize-autoloader`
- [ ] `cache:warmup` trafikdan oldin
- [ ] Statik fayllar uzoq muddatli kesh + gzip/brotli bilan

### Fon ishlari

- [ ] Worker'lar supervisor/systemd ostida, `--time-limit` va `--memory-limit` bilan
- [ ] `failure_transport` sozlangan va kuzatilyapti ([26-bob](26-messenger.md))
- [ ] Scheduler worker'i ishlayotgani monitoring qilinadi ([25-bob](25-console-va-scheduler.md))
- [ ] Deploy'da `messenger:stop-workers`

### Kuzatuvchanlik

- [ ] Loglar `stderr` ga, JSON formatda ([24-bob](24-xatolik-va-log.md))
- [ ] Xato monitoringi (Sentry va h.k.) ulangan
- [ ] `X-Request-Id` har logda
- [ ] Sog'liq tekshiruvi endpoint'i (`/health`) bor va u bazaga bog'liq emas
- [ ] Ogohlantirishlar: xato darajasi, navbat uzunligi, p95 javob vaqti, disk/xotira

### Reliz jarayoni

- [ ] Rollback rejasi bor va sinalgan
- [ ] Migratsiya va kod deploy'i orqaga mos (rolling deploy davomida)
- [ ] CI yashil bo'lmasa deploy bloklanadi
- [ ] Relizlar teglanadi, o'zgarishlar yozib boriladi

---

## Muhandislik nuqtai nazari: deploy — bu xavfni boshqarish

Har deploy — o'zgarish, har o'zgarish — xavf. Xavfni kamaytirishning to'rt vositasi:

1. **Kichik va tez-tez relizlar.** Kunlik kichik deploy oylik katta deploydan **xavfsizroq**: o'zgarish kam, sabab topish oson, rollback sodda.
2. **Tez rollback.** "Necha daqiqada orqaga qayta olaman?" — eng muhim operatsion metrika. Symlink strategiyasi bunga bir necha soniyada javob beradi.
3. **Deploy va reliz ajratilishi.** Kodni chiqarish (deploy) va funksiyani yoqish (release) — turli hodisalar bo'lishi mumkin: **feature flag** bilan kod chiqadi, lekin o'chiq turadi. Muammo bo'lsa, deploy qaytarilmaydi — flag o'chiriladi.
4. **Deploy'dan keyingi kuzatuv.** Birinchi 15 daqiqa: xato darajasi, javob vaqti, navbat uzunligi. Avtomatik tekshiruv bo'lsa — yanada yaxshi.

Va oxirgi, eng ko'p e'tibordan chetda qoladigan nuqta: **tiklanishi sinab ko'rilmagan zaxira nusxa — zaxira nusxa emas.** Backup fayllari bor bo'lishi yetarli emas; ulardan tiklash jarayoni yiliga kamida bir marta mashq qilinishi kerak.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Production'da `APP_DEBUG=1` | Stack trace, konfiguratsiya va sirlar ochiq | `APP_ENV=prod APP_DEBUG=0` |
| Document root loyiha ildizida | `.env`, `config/` internetdan o'qiladi | Faqat `public/` |
| Trafik ostida `cache:clear` | Birinchi so'rovlar sekin, xatolar | Warmup + atomik symlink |
| Deploy'dan keyin worker'larni qayta ishga tushirmaslik | Eski kod ishlab turadi | `messenger:stop-workers` |
| OPcache reset qilmaslik | Eski PHP kod keshda qoladi | FPM reload |
| Migratsiya va kodni bir vaqtda buzuvchi qilish | Rolling deploy'da xatolar | Expand–contract |
| Rollback rejasini sinamaslik | Avariya paytida ma'lum bo'ladi | Muntazam mashq |
| Backup'dan tiklashni sinamaslik | Kerak bo'lganda ishlamaydi | Yiliga kamida bir marta |
| Monitoring va alert yo'qligi | Muammoni mijoz aytadi | Log + metrika + alert |

---

## Amaliyot

1. Yuqoridagi deploy skriptini loyihangiz uchun yozing va staging muhitida sinab ko'ring.
2. Ko'p bosqichli `Dockerfile` yozing va image hajmini oddiy variant bilan solishtiring.
3. CI konfiguratsiyasini qo'shing; migratsiyalarni bo'sh bazaga yurgizing.
4. `/health` endpoint'ini yozing (bazaga bog'liq bo'lmagan) va yuk balanslovchiga ulashni rejalashtiring.
5. Ushbu bobdagi tekshiruv ro'yxatini loyihangiz uchun to'ldiring: qaysi bandlar bajarilmagan? Har biri uchun vazifa yarating.

---

## Yakun

Qo'llanma tugadi. Agar siz 40 bobdagi tushunchalarni o'zlashtirgan va amaliyot bo'limlarini bajargan bo'lsangiz, sizda quyidagilar bor:

- Symfony'ning ichki mexanizmlarini (kernel, container, event oqimi) tushunish;
- to'liq REST API'ni noldan qurish ko'nikmasi — autentifikatsiya, avtorizatsiya, validatsiya, fon vazifalari va testlar bilan;
- production talablarini (xavfsizlik, unumdorlik, kuzatuvchanlik, deploy) bilish;
- va eng muhimi — **nega shunday** degan savolga javob berish qobiliyati.

Keyingi qadamlar: rasmiy hujjatni muntazam o'qish (`symfony.com/doc/current`), Symfony Demo kod bazasini o'rganish, va o'z loyihangizda shu tekshiruv ro'yxatini bajarish.

---

## Rasmiy hujjat

- Deploy: <https://symfony.com/doc/current/deployment.html>
- Docker: <https://symfony.com/doc/current/setup/docker.html>
- Proxy ortida: <https://symfony.com/doc/current/deployment/proxies.html>
- Unumdorlik: <https://symfony.com/doc/current/performance.html>
- Messenger'ni deploy qilish: <https://symfony.com/doc/current/messenger.html#deploying-to-production>
- Xavfsizlik bo'yicha maslahatlar: <https://symfony.com/doc/current/security.html>

---

[← Oldingi: Arxitektura](39-arxitektura.md) · [Mundarija](README.md)
