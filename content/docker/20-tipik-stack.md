# 20 — Tipik stack: Nginx + PHP-FPM + PostgreSQL + Redis

[← Oldingi: Profillar va bir nechta fayl](19-profillar-va-fayllar.md) · [Mundarija](README.md) · [Keyingi: PHP: Laravel va Symfony →](21-php-laravel-symfony.md)

## Tushuncha

Docker'ning Laravel qo'llanmasi (Develop and Deploy Laravel applications with Docker Compose) PHP ilovasi uchun klassik to'plamni quradi: veb-server, PHP, baza va kesh — har biri alohida servis. Bu bob — III qismning yakuni: 15–19-boblardagi hamma narsani bitta haqiqiy stack'da qo'llaymiz.

| Servis | Image | Vazifasi |
| --- | --- | --- |
| `web` | `nginx` | HTTP so'rovlarni qabul qiladi; statik fayllarni o'zi beradi, PHP so'rovlarini PHP-FPM'ga uzatadi |
| `php-fpm` | `php:8.5-fpm` + kengaytmalar | PHP kodini bajaradi (FastCGI protokoli, port 9000) |
| `postgres` | `postgres:18` | Ma'lumotlar bazasi |
| `redis` | `redis` | Kesh, sessiyalar, navbatlar |

**PHP-FPM** (FastCGI Process Manager) — PHP'ni alohida servis sifatida ishlatadigan jarayonlar menejeri. Nginx PHP'ni o'zi bajarmaydi: `.php` so'rovini FastCGI orqali PHP-FPM'ga beradi va javobini mijozga qaytaradi.

```text sxema
brauzer → web (nginx :80) ──FastCGI──→ php-fpm (:9000) ──→ postgres (:5432)
                                                        └─→ redis (:6379)
```

## Qo'llanmadagi variant va biznikisi

Qo'llanma to'liq Laravel ilovasi uchun yozilgan va uning misollari `dockersamples/laravel-docker-examples` repozitoriysida. Bu bobda biz **o'sha arxitekturani** kichik o'z kodimiz bilan quramiz — maqsad Laravel emas, servislar qanday bog'lanishini ko'rish. Laravel'ning o'ziga xos qismlari (migratsiyalar, `artisan`, queue worker) — 21-bobda.

Repozitoriydagi production faylini o'qiganda bitta narsaga e'tibor bering: unda PostgreSQL porti `"${POSTGRES_PORT:-5432}:5432"` — **barcha** interfeyslarda. Serverda bu bazani internetga ochadi (5-bob: ufw ham to'xtatmaydi). Biznikida baza porti umuman tashqariga ochilmaydi.

## Fayllar

`public/index.php` — Redis'dagi hisoblagich va PostgreSQL versiyasi:

```php
<?php
$redis = new Redis();
$redis->connect('redis', 6379);
$soni = $redis->incr('tashriflar');

$pdo = new PDO('pgsql:host=postgres;dbname=app', 'ilova', getenv('DB_PASSWORD'));
$versiya = $pdo->query('SHOW server_version')->fetchColumn();

echo "Salom! Sahifa {$soni} marta ochildi. PHP " . PHP_VERSION . ", PostgreSQL {$versiya}\n";
```

`php/Dockerfile` — qo'llanmadagi kabi `php:8.5-fpm` ga PostgreSQL (`pdo_pgsql`) va Redis (`pecl install redis`) kengaytmalari; 14-bobdagi qoida bilan bitta `RUN` da:

```dockerfile
FROM php:8.5-fpm
RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev \
    && docker-php-ext-install pdo_pgsql \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*
COPY public/ /var/www/public/
```

`docker-php-ext-install` va `docker-php-ext-enable` — rasmiy PHP image'idagi yordamchi skriptlar (qo'llanmadagi Dockerfile ham ularni ishlatadi).

`nginx/default.conf`:

```nginx
server {
    listen 80;
    root /var/www/public;
    index index.php;

    location ~ \.php$ {
        fastcgi_pass php-fpm:9000;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

`fastcgi_pass php-fpm:9000` — PHP-FPM'ga **servis nomi** bilan (16-bob).

`compose.yaml`:

```yaml
services:
  web:
    image: nginx:1.29
    ports:
      - "127.0.0.1:8080:80"
    volumes:
      - ./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
      - ./public:/var/www/public:ro
    depends_on:
      - php-fpm
    networks:
      - frontend

  php-fpm:
    build:
      context: .
      dockerfile: php/Dockerfile
    environment:
      DB_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD .env da berilmagan}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - frontend
      - backend

  postgres:
    image: postgres:18
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: ilova
      POSTGRES_PASSWORD: ${DB_PASSWORD:?DB_PASSWORD .env da berilmagan}
    volumes:
      - pgdata:/var/lib/postgresql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ilova -d app"]
      interval: 5s
      retries: 10
    networks:
      - backend

  redis:
    image: redis:8-alpine
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true

volumes:
  pgdata:
  redisdata:
```

Har qism qaysi bobdan:

| Qism | Bob |
| --- | --- |
| Faqat `web` porti, `127.0.0.1` bilan | 5 |
| `pgdata`, `redisdata` — nomli volume'lar; PostgreSQL 18 uchun `/var/lib/postgresql` (qo'llanmadagidek) | 6, 15 |
| Nginx sozlamasi va kod — bind mount, `ro` | 6 |
| `frontend`/`backend`, bazalar `internal` | 16 |
| `healthcheck` + `condition: service_healthy` | 17 |
| `${DB_PASSWORD:?…}` — `.env` dan, majburiy | 18 |

## Ishga tushirish

Avval `.env` siz:

```text vps
$ docker compose up -d
error while interpolating services.php-fpm.environment.DB_PASSWORD: required variable DB_PASSWORD is missing a value: DB_PASSWORD .env da berilmagan
error while interpolating services.postgres.environment.POSTGRES_PASSWORD: required variable DB_PASSWORD is missing a value: DB_PASSWORD .env da berilmagan
```

`:?` — o'zgaruvchi berilmasa, Compose **hech narsani ishga tushirmasdan** aniq xabar bilan to'xtaydi. Parolsiz baza ishga tushib qolgandan ko'ra yaxshi.

```text vps
$ printf '%s\n' 'DB_PASSWORD=sinov-parol-20' > .env
$ time docker compose up -d --build 2>&1 | grep -E 'Built|Healthy|Started|ERROR'
 Image stack-php-fpm Built 
 Container stack-postgres-1 Started 
 Container stack-redis-1 Started 
 Container stack-postgres-1 Healthy 
 Container stack-redis-1 Healthy 
 Container stack-php-fpm-1 Started 
 Container stack-web-1 Started 

real	2m3.315s
user	0m0.696s
sys	0m0.309s
$ docker compose ps --format 'table {{.Service}}\t{{.Status}}\t{{.Ports}}'
SERVICE    STATUS                   PORTS
php-fpm    Up 1 second              9000/tcp
postgres   Up 8 seconds (healthy)   5432/tcp
redis      Up 8 seconds (healthy)   6379/tcp
web        Up 1 second              127.0.0.1:8080->80/tcp
```

- `Built` — PHP image'i yig'ildi (kengaytmalarni kompilyatsiya qilish — 2 daqiqaning asosiy qismi, 1 CPU'li serverda).
- `postgres` va `redis` — `Healthy`, shundan keyingina `php-fpm`, keyin `web` (17-bob).
- `PORTS`: tashqariga faqat `127.0.0.1:8080`; qolganlari faqat ichki tarmoqda.

```text vps
$ sleep 2; curl -s http://127.0.0.1:8080/
Salom! Sahifa 1 marta ochildi. PHP 8.5.12, PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2)
$ curl -s http://127.0.0.1:8080/
Salom! Sahifa 2 marta ochildi. PHP 8.5.12, PostgreSQL 18.6 (Debian 18.6-1.pgdg13+2)
```

Zanjir to'liq ishladi: Nginx → PHP-FPM → Redis (hisoblagich) va PostgreSQL (versiya).

## Resurslar

```text vps
$ docker image ls stack-php-fpm
IMAGE                  ID             DISK USAGE   CONTENT SIZE   EXTRA
stack-php-fpm:latest   0bd740db99e4        752MB          184MB   U    
$ docker stats --no-stream --format 'table {{.Name}}\t{{.MemUsage}}'
NAME               MEM USAGE / LIMIT
stack-web-1        8.168MiB / 1.751GiB
stack-php-fpm-1    39.3MiB / 1.751GiB
stack-postgres-1   73.86MiB / 1.751GiB
stack-redis-1      40.89MiB / 1.751GiB
$ docker compose exec php-fpm php -m | grep -E '^(pdo_pgsql|redis)$'
pdo_pgsql
redis
```

- Kerakli kengaytmalar yuklangan.
- To'rt servis birga ~160MiB xotira — 2GB'li VPS uchun bemalol.
- PHP image'i esa **752MB**: `php:8.5-fpm` asosi va kompilyatsiya uchun o'rnatilgan `libpq-dev` va PECL vositalari yakuniy image'da qoldi. Qo'llanmadagi production Dockerfile shuning uchun **multi-stage** (10-bob): kengaytmalar `builder` bosqichida yig'iladi, yakuniy bosqichga faqat natija ko'chiriladi.

## Tipik xatolar

**1. Bazaning portini publish qilish.**
`"5432:5432"` — baza internetda.
To'g'risi: port yo'q; PHP-FPM bazaga ichki tarmoqda `postgres:5432` bilan ulanadi.

**2. Nginx'da `fastcgi_pass 127.0.0.1:9000`.**
Konteynerda `127.0.0.1` — Nginx konteynerining o'zi.
To'g'risi: servis nomi — `php-fpm:9000`.

**3. Parolni `compose.yaml` ga yozish.**
Fayl git'da — parol ham.
To'g'risi: `.env` (git'da emas) va `${VAR:?}`; yaxshiroq — Compose secrets (27-bob).

**4. PHP-FPM'ni baza tayyor bo'lmasdan ishga tushirish.**
Birinchi so'rovlar xato beradi.
To'g'risi: `healthcheck` + `service_healthy`.

## Amaliyot

Savollar:

1. Nginx `.php` faylni o'zi bajaradimi?
2. `fastcgi_pass` da nega `php-fpm:9000`?
3. `.env` da `DB_PASSWORD` bo'lmasa, nima bo'ladi?
4. Nega bazaning porti `ports:` da yo'q, lekin PHP unga ulanadi?
5. PHP-FPM image'ini qanday kichraytirasiz?

<details>
<summary>Javoblar</summary>

1. Yo'q — FastCGI orqali PHP-FPM'ga uzatadi.
2. Compose tarmog'ida servis nomi DNS orqali aniqlanadi; 9000 — PHP-FPM porti.
3. `${DB_PASSWORD:?…}` tufayli Compose hech narsani ishga tushirmaydi va xabar beradi.
4. Ichki tarmoqda servislar bir-biriga to'g'ridan-to'g'ri ulanadi; `ports:` faqat tashqaridan kirish uchun.
5. Multi-stage: kengaytmalarni build bosqichida kompilyatsiya qilib, yakuniy bosqichga faqat natijani olish (qo'llanmadagi production Dockerfile).

</details>

## Rasmiy hujjat

- [Docker Guides: Laravel](https://docs.docker.com/guides/laravel/) — Nginx + PHP-FPM + PostgreSQL + Redis, development va production
- [Docker Guides: Databases](https://docs.docker.com/guides/databases/)
- [Laravel Docker Examples](https://github.com/dockersamples/laravel-docker-examples) — qo'llanmadagi misollar repozitoriysi
- [PHP rasmiy image (Docker Hub)](https://hub.docker.com/_/php) — `docker-php-ext-install`, PECL
