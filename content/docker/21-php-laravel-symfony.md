# 21 — PHP: Laravel va Symfony

[← Oldingi: Tipik stack: Nginx + PHP-FPM + PostgreSQL + Redis](20-tipik-stack.md) · [Mundarija](README.md) · [Keyingi: Node.js va Next.js →](22-node-va-nextjs.md)

## Tushuncha

20-bobda PHP-FPM stack ishladi, lekin PHP image'i 752MB edi. Bu bobda PHP image'ini to'g'ri qurishni (kengaytmalar, `php.ini`, development va production bosqichlari) va ikki mashhur framework'ning rasmiy Docker yondashuvini ko'ramiz.

| Manba | Nima beradi |
| --- | --- |
| Rasmiy `php` image hujjati (Docker Hub) | Kengaytmalarni o'rnatish skriptlari, PECL, `php.ini-production`/`-development` |
| Docker'ning Laravel qo'llanmasi | Production va development bosqichlari, migratsiya, `workspace` konteyneri |
| Symfony hujjati (Using Docker with Symfony) | `symfony-docker` loyihasi, Flex retseptlari |

## Kengaytmalar

Rasmiy PHP image'i (Docker Hub sahifasi) uch yordamchi skript beradi: `docker-php-ext-configure`, `docker-php-ext-install`, `docker-php-ext-enable`.

| Kengaytma turi | Qanday o'rnatiladi |
| --- | --- |
| PHP bilan keladigan (`pdo_pgsql`, `intl`, `zip`…) | `docker-php-ext-install` (kerakli tizim kutubxonalari bilan, masalan `libpq-dev`) |
| PECL'dagi (`redis`, `xdebug`…) | `pecl install` + `docker-php-ext-enable` |

Hujjatdagi muhim tavsiya: `pecl install` da **versiyani aniq ko'rsating** (`pecl install redis-6.3.0`) — PECL kengaytma versiyasini tanlashda PHP versiyasiga mosligini tekshirmaydi (faqat o'rnatishda). Bundan tashqari, dependency qachon yangilanishini o'zingiz boshqarasiz. Bir nechta PECL kengaytmasini **ketma-ket** o'rnating (`pecl install a && pecl install b`) — aks holda xatolar o'tkazib yuborilishi mumkin. 20-bobda versiyasiz yozgan edik — bu yerda tuzatamiz. phpredis'ning joriy barqaror versiyasi — 6.3.0 (PECL).

## `php.ini`: production va development

Hujjat: image'da PHP'ning ikki standart sozlama fayli bor — `php.ini-development` va `php.ini-production`; production uchun:

```dockerfile
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
```

Laravel qo'llanmasining production Dockerfile'i ham shunday qiladi. Qo'llanma naqshi — bitta Dockerfile, bosqichlar bilan (10-bob): `builder` (kengaytmalarni kompilyatsiya), `production` (faqat runtime kutubxonalari + `COPY --from=builder` bilan kengaytmalar va ularning sozlamalari), development esa production ustiga quriladi. 20-bobdagi image'ga qo'llaymiz (`php/Dockerfile.multi`):

```dockerfile
FROM php:8.5-fpm AS builder
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*

FROM php:8.5-fpm AS production
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY public/ /var/www/public/

FROM production AS development
RUN mv "$PHP_INI_DIR/php.ini" "$PHP_INI_DIR/php.ini-production" \
    && cp "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"
```

`libpq5` — PostgreSQL klient kutubxonasining o'zi (ishlash uchun), `libpq-dev` esa uning kompilyatsiya uchun fayllari (faqat `builder` da).

```text vps
$ docker build -q -f php/Dockerfile.multi --target production -t stack-php:prod .
sha256:14a328054a246b9ad09d0e6faa2c5c151f88e9e60fd7c939f120790569020bce
$ docker build -q -f php/Dockerfile.multi --target development -t stack-php:dev .
sha256:3c65e59521ce6af933a7a56917a28045c9ec6a9ce8f48965953fa4e48b051ed8
$ docker image ls --format 'table {{.Repository}}:{{.Tag}}\t{{.Size}}' | grep -E 'stack-php|REPOSITORY'
REPOSITORY:TAG         SIZE
stack-php:dev          729MB
stack-php:prod         729MB
stack-php-fpm:latest   752MB
```

```text vps
$ docker run --rm stack-php:prod php -r 'echo ini_get("display_errors") ? "display_errors: On\n" : "display_errors: Off\n";'
display_errors: Off
$ docker run --rm stack-php:dev php -r 'echo ini_get("display_errors") ? "display_errors: On\n" : "display_errors: Off\n";'
display_errors: On
```

Ikki bosqichning farqi `display_errors` da aniq: production'da xatolar foydalanuvchiga ko'rsatilmaydi, development'da — ko'rsatiladi.

Lekin hajm: 752MB → **729MB** — deyarli o'zgarmadi. Sababi:

```text vps
$ docker run --rm stack-php:prod sh -c 'command -v gcc || echo "gcc yoq"'
/usr/bin/gcc
$ docker run --rm stack-php-fpm sh -c 'command -v gcc || echo "gcc yoq"'
/usr/bin/gcc
$ docker run --rm php:8.5-fpm sh -c "env | grep PHPIZE_DEPS"
Unable to find image 'php:8.5-fpm' locally
8.5-fpm: Pulling from library/php
Digest: sha256:baf3ea13a8207fa18e1011bad1016e8b5e59fc974c6966d0efa6f36a16f875f0
Status: Downloaded newer image for php:8.5-fpm
PHPIZE_DEPS=autoconf 		dpkg-dev 		file 		g++ 		gcc 		libc-dev 		make 		pkg-config 		re2c
```

Debian asosidagi `php:8.5-fpm` ning o'zida kompilyatsiya vositalari (`PHPIZE_DEPS`: `gcc`, `g++`, `make`…) **o'rnatilgan holda** keladi — production bosqichida ham bor. Multi-stage bu yerda faqat bizning qo'shimchalarimizni olib tashladi.

### Alpine varianti

```text vps
$ docker pull -q php:8.5-fpm-alpine
docker.io/library/php:8.5-fpm-alpine
$ docker image ls --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" php
REPOSITORY:TAG       SIZE
php:8.5-fpm-alpine   151MB
$ docker run --rm php:8.5-fpm-alpine sh -c "command -v gcc || echo gcc yoq"
gcc yoq
```

`php:8.5-fpm-alpine` — 151MB, unda `gcc` yo'q (`PHPIZE_DEPS` o'zgaruvchisi bor — kompilyatsiya kerak bo'lganda shu ro'yxatni o'rnatasiz). Alpine glibc o'rniga musl ishlatadi (11-bob) — o'tishdan oldin ilovangizni Alpine image'ida sinab ko'ring.

```text vps
$ cat php/Dockerfile.alpine
FROM php:8.5-fpm-alpine AS builder
RUN apk add --no-cache $PHPIZE_DEPS postgresql-dev \
    && docker-php-ext-install pdo_pgsql \
    && pecl install redis-6.3.0 \
    && docker-php-ext-enable redis

FROM php:8.5-fpm-alpine AS production
RUN apk add --no-cache libpq
COPY --from=builder /usr/local/lib/php/extensions/ /usr/local/lib/php/extensions/
COPY --from=builder /usr/local/etc/php/conf.d/ /usr/local/etc/php/conf.d/
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY public/ /var/www/public/
$ docker build -q -f php/Dockerfile.alpine -t stack-php:alpine .
sha256:2777156c6eecb206e13df1c34f871b649e687fc0bfa3cc0c19e5b05fae01efe7
$ docker image ls --format "table {{.Repository}}:{{.Tag}}\t{{.Size}}" | grep -E "stack-php|REPOSITORY"
REPOSITORY:TAG         SIZE
stack-php:alpine       155MB
stack-php:dev          729MB
stack-php:prod         729MB
stack-php-fpm:latest   752MB
$ docker run --rm stack-php:alpine php -m | grep -E "^(pdo_pgsql|redis)$"
pdo_pgsql
redis
$ docker run --rm stack-php:alpine sh -c "command -v gcc || echo gcc yoq"
gcc yoq
```

- `builder`: `$PHPIZE_DEPS` va `postgresql-dev` faqat shu bosqichda; `pecl install redis-6.3.0` — versiya bilan.
- `production`: faqat `libpq` (runtime) va tayyor kengaytmalar.
- **155MB** — 752MB o'rniga. Kengaytmalar ishlaydi, kompilyator yo'q.

Yig'ish 1 CPU'li serverda bir necha daqiqa oladi (kengaytmalarni kompilyatsiya qilish) — 9-bobdagi tartib va 13-bobdagi kesh shuning uchun muhim.

## Laravel

Docker'ning Laravel qo'llanmasi (misollar — `dockersamples/laravel-docker-examples`) to'liq tuzilmani beradi. Asosiy qarorlar:

| Qism | Qo'llanmada |
| --- | --- |
| Servislar | `web` (Nginx), `php-fpm`, `postgres`, `redis` (20-bob) |
| PHP-FPM image'i | `builder` → `production` (yuqoridagi naqsh) + `composer install --no-dev --optimize-autoloader` builder'da |
| Frontend (Vite) | Nginx image'ining build bosqichida yig'iladi, Nginx'ga statik fayl bo'lib tushadi |
| Ishga tushishda | `entrypoint.sh`: `storage` papkasini tayyorlaydi, `php artisan migrate --force`, `config:cache`, `route:cache`, so'ng `exec "$@"` (8-bob: PID 1) |
| Healthcheck | `php-fpm` va `postgres` uchun; `web` — `php-fpm` sog'lom bo'lgach (17-bob) |
| `storage` | Nomli volume: yuklangan fayllar va kesh konteyner qayta yaratilganda saqlansin (6-bob) |
| Development | Production image **ustiga** Xdebug; CLI ishlar uchun alohida `workspace` konteyneri (`artisan`, `composer`, frontend build) — Laravel Sail va Laradock'dagi naqsh |

Qo'llanmadagi bir izoh: Laravel'da `composer install` `artisan` ni chaqiradigan skriptlarni ishga tushirishi mumkin, shuning uchun builder'da avval **butun kod** nusxalanadi, keyin `composer install` — 9-bobdagi "avval faqat lock fayl" qoidasidan ongli istisno.

Laravel'ning o'zida ham rasmiy Docker vositasi bor — **Laravel Sail** (qo'llanma uni tilga oladi): u ishlab chiqish uchun mo'ljallangan.

Bu kitobda biz qo'llanma repozitoriysining kodini serverda yig'ib ko'rmadik — arxitektura 20-bobda o'z kodimiz bilan sinaldi. Repozitoriyni ishlatsangiz, bir narsaga e'tibor bering: undagi production faylida PostgreSQL porti barcha interfeyslarga ochilgan (20-bob).

## Symfony

Symfony hujjati (Using Docker with Symfony) uch yo'lni beradi:

| Yo'l | Nima |
| --- | --- |
| To'liq Docker muhiti | `dunglas/symfony-docker` loyihasi — PHP, veb-server va boshqalar Docker'da (hujjat shu loyihani ko'rsatadi) |
| Flex retseptlari | Ba'zi paketlar o'rnatilganda (`composer require doctrine`) `compose.yaml` ga kerakli servis (masalan, baza) **avtomatik** qo'shiladi; Dockerfile'dagi `###> recipes ###` bo'limiga ham o'zgarish yoziladi. Shundan keyin — `docker compose up --build` |
| `symfony` CLI | PHP kompyuterda, servislar (baza va h.k.) Docker'da: `symfony server:start` Docker servislarini topib, ularni muhit o'zgaruvchilari sifatida beradi |

Symfony hujjatidagi eslatma: macOS'da Docker integratsiyasi ishlashi uchun standart Docker soketiga ruxsat berish kerak (2-bob: Docker Desktop 4.89 dan beri standart soket yaratilmaydi).

## Tipik xatolar

**1. `pecl install redis` — versiyasiz.**
PHP bilan mos kelmaydigan versiya tushishi mumkin.
To'g'risi: `pecl install redis-6.3.0`.

**2. Production'da `php.ini` umuman yo'q yoki development varianti.**
`display_errors=On` — xatolar (yo'llar, so'rovlar) foydalanuvchiga ko'rinadi.
To'g'risi: `php.ini-production`.

**3. Debian'da multi-stage bilan katta yutuq kutish.**
`php:8.5-fpm` da kompilyatsiya vositalari baribir bor.
To'g'risi: hajm muhim bo'lsa — `fpm-alpine` + multi-stage.

**4. Migratsiyani qo'lda, deploy'dan keyin.**
Unutiladi yoki kod bilan sxema mos kelmaydi.
To'g'risi: qo'llanmadagidek `entrypoint` da `migrate --force` (yoki alohida bir martalik servis, 17-bob: `service_completed_successfully`).

## Amaliyot

Savollar:

1. PHP bilan keladigan va PECL kengaytmalari qanday o'rnatiladi?
2. Nega `pecl install` da versiya ko'rsatiladi?
3. `php:8.5-fpm` asosida multi-stage nega hajmni deyarli kamaytirmadi?
4. Laravel qo'llanmasida migratsiya qachon bajariladi?
5. Symfony Flex retsepti `compose.yaml` ga nima qiladi?

<details>
<summary>Javoblar</summary>

1. PHP bilan keladiganlari — `docker-php-ext-install`; PECL — `pecl install` va `docker-php-ext-enable`.
2. PECL tanlashda PHP versiyasiga mosligini tekshirmaydi; versiya bilan yangilanishni ham o'zingiz boshqarasiz.
3. Debian asosidagi image'da kompilyatsiya vositalari (`PHPIZE_DEPS`) o'rnatilgan holda keladi.
4. Konteyner ishga tushganda `entrypoint.sh` da: `php artisan migrate --force`.
5. Paketga kerakli servisni (masalan, bazani) avtomatik qo'shadi.

</details>

## Rasmiy hujjat

- [PHP rasmiy image (Docker Hub)](https://hub.docker.com/_/php) — `docker-php-ext-*`, PECL, `php.ini`
- [Docker Guides: PHP](https://docs.docker.com/guides/php/)
- [Docker Guides: Laravel](https://docs.docker.com/guides/laravel/) — production va development bosqichlari, `entrypoint`, `workspace`
- [Symfony: Using Docker with Symfony](https://symfony.com/doc/current/setup/docker.html)
- [PECL: redis](https://pecl.php.net/package/redis)
