# 02 — O'rnatish va ishga tushirish

[← Oldingi: Kirish](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Papkalar tuzilmasi va Kernel →](03-papkalar-va-kernel.md)

---

## Talablar

Symfony 8.1 uchun **PHP 8.4+** va quyidagi kengaytmalar kerak: Ctype, iconv, PCRE, Session, SimpleXML, Tokenizer. Tekshirish:

```shell
php -v
symfony check:requirements
```

`symfony` binarysi — rasmiy CLI. U majburiy emas (hammasini Composer bilan ham qilish mumkin), lekin lokal server, TLS sertifikat, Docker bilan avtomatik integratsiya va `symfony console` qisqartmasi uni amalda majburiyga aylantiradi.

```shell
# macOS
brew install symfony-cli/tap/symfony-cli

# Linux / boshqa
curl -sS https://get.symfony.com/cli/installer | bash

symfony version
```

---

## Loyiha yaratish

```shell
# API / mikroservis: minimal skeleton (Twig, Security, Doctrine yo'q)
symfony new my_api --version="8.1.*"

# To'liq web ilova: Twig, Doctrine, Security, Mailer, Messenger, AssetMapper, Profiler
symfony new my_app --version="8.1.*" --webapp

# LTS kerak bo'lsa
symfony new my_app --version=lts --webapp
```

`symfony` binarysiz ham bo'ladi — natija aynan bir xil:

```shell
composer create-project symfony/skeleton:"8.1.*" my_app
cd my_app
composer require webapp
```

**Nega `--webapp` alohida?** Symfony skeleton'i qasddan bo'sh: mikroservisga Twig kerak emas, CLI ilovaga Security kerak emas. `webapp` — bu shunchaki "meta-paket": kerakli bundlelar ro'yxati. Kerak bo'lmagan qismni keyin `composer remove` qilsangiz, Flex konfiguratsiya fayllarini ham o'chiradi ([07-bob](07-bundle-va-flex.md)).

Mavjud loyihani ko'tarish:

```shell
git clone ...
cd my_app
composer install          # vendor/ ni tiklaydi va Flex retseptlarini qo'llaydi
php bin/console about     # versiya, muhit, papkalar
```

---

## Ishga tushirish

```shell
symfony server:start          # terminalni band qiladi, loglar ko'rinadi
symfony serve -d              # fon rejimida (daemon)
symfony server:start --open   # ishga tushirib brauzerda ochadi
symfony server:log            # fon rejimidagi loglarni ko'rish
symfony server:stop
```

Birinchi ishga tushirishda CLI o'zining CA sertifikatini o'rnatishni so'raydi — natijada lokal sayt `https://127.0.0.1:8000` da, brauzer ogohlantirishisiz ishlaydi:

```shell
symfony server:ca:install
```

**Nega lokal HTTPS muhim?** `secure` cookie'lar, `SameSite=None`, Service Worker, WebAuthn, Mercure — bularning hammasi HTTPS talab qiladi. Lokalda HTTP'da ishlab, production'da HTTPS'ga chiqsangiz, xatolar aynan eng noqulay paytda chiqadi. Mahalliy va production muhitni imkon qadar o'xshatish — **"dev/prod parity"** prinsipi (12-factor app).

`symfony server:start` — faqat development uchun. Production'da PHP-FPM + Nginx, FrankenPHP yoki Caddy ishlatiladi ([40-bob](40-deploy-va-checklist.md)).

---

## `php bin/console` va `symfony console`

```shell
php bin/console debug:router
symfony console debug:router      # bir xil, lekin ustiga qo'shimcha bor
```

Farqi: `symfony console` Docker konteynerlaridan kelgan muhit o'zgaruvchilarini (`DATABASE_URL`, `MAILER_DSN`) avtomatik in'ektsiya qiladi. Ya'ni `compose.yaml` dagi Postgres tasodifiy portda ko'tarilsa ham, `symfony console doctrine:migrations:migrate` to'g'ri portni topadi. Shu sababli lokalda **doim** `symfony console` ishlating.

---

## `.env` fayllar tizimi

`--webapp` skeleton quyidagilarni yaratadi:

| Fayl | Git'ga tushadimi | Vazifasi |
| --- | --- | --- |
| `.env` | ✅ ha | Barcha muhitlar uchun standart qiymatlar (sirlarsiz!) |
| `.env.dev`, `.env.test` | ✅ ha | Muhitga xos standartlar (`APP_SECRET` test uchun va h.k.) |
| `.env.local` | ❌ yo'q | Shu mashinadagi shaxsiy qiymatlar |
| `.env.$APP_ENV.local` | ❌ yo'q | Muhit + mashina bo'yicha eng aniq override |
| `.env.local.php` | ❌ yo'q | `composer dump-env prod` natijasi (production tezligi uchun) |

Ustunlik tartibi (yuqoridagi pastdagini yengadi):

```
1. Haqiqiy environment variable (export DATABASE_URL=...)
2. .env.local.php
3. .env.$APP_ENV.local
4. .env.$APP_ENV
5. .env.local
6. .env
```

Tekshirish — taxmin qilmang, so'rang:

```shell
php bin/console debug:dotenv               # qaysi qiymat qaysi fayldan kelgan
php bin/console debug:dotenv DATABASE_URL
php bin/console debug:container --env-vars
```

**Muhim qoida:** `.env` — bu *infratuzilma konfiguratsiyasi uchun standart qiymatlar* fayli, parol saqlash joyi emas. Haqiqiy sirlar uchun secrets vault bor ([08-bob](08-konfiguratsiya.md)).

---

## Docker bilan ishlash

`--webapp` bilan kelgan `compose.yaml` Postgres'ni, `compose.override.yaml` esa dev uchun Mailpit (soxta SMTP) ni ko'taradi. Portlar qasddan qat'iy emas (`"5432"` — host porti tasodifiy tanlanadi), chunki bir nechta loyiha parallel ishlaydi:

```shell
docker compose up -d
symfony console doctrine:database:create   # portni CLI o'zi topadi
docker compose down
```

---

## Muhandislik nuqtai nazari: repo "bir buyruqda ishga tushishi" kerak

Yangi dasturchi loyihani klon qilgandan keyin ishga tushirish uchun necha qadam bajaradi? Sog'lom loyihada javob — **ikki-uch qadam, README'da yozilgan**:

```shell
composer install && docker compose up -d && symfony console doctrine:migrations:migrate && symfony serve -d
```

Buning uchun uchta shart bajarilishi kerak:

1. **Barcha bog'liqliklar lock fayl bilan qotirilgan.** `composer.lock` git'ga tushadi. `composer install` — lock bo'yicha aynan o'sha versiyalar; `composer update` — yangilash. Ikkalasini aralashtirish CI'ni "menda ishlayapti" muammosiga olib keladi.
2. **Infratuzilma kod bilan tavsiflangan.** `compose.yaml` — bu hujjat emas, bajariladigan spetsifikatsiya. "Postgres 16 o'rnating" degan README qatoridan ko'ra ishonchliroq.
3. **Sirlar repo'dan tashqarida.** `.env.local` git'ga tushmaydi, `.gitignore` buni allaqachon ta'minlagan.

Bu — 12-factor app metodologiyasining III (config), II (dependencies) va X (dev/prod parity) bandlari. Symfony skeleton'i ularni sukut bo'yicha to'g'ri bajaradi; sizning vazifangiz — buzmaslik.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Parolni `.env` ga yozib, git'ga commit qilish | Sir repo tarixida abadiy qoladi; `git rm` yordam bermaydi | `.env.local` yoki secrets vault; sir ochilsa — darhol rotatsiya |
| Production'da `APP_ENV=dev` qoldirish | Profiler, debug panel va stack trace ochiq qoladi — to'liq axborot sizishi | Deploy'da `APP_ENV=prod APP_DEBUG=0`; [40-bob](40-deploy-va-checklist.md) checklist |
| `composer update` ni production'da ishga tushirish | Kutilmagan versiya sakrashi, lock fayl ma'nosini yo'qotadi | Production'da faqat `composer install --no-dev --optimize-autoloader` |
| `symfony server:start` ni serverda ishlatish | Bu dev server; xavfsizlik va unumdorlik uchun mo'ljallanmagan | PHP-FPM + Nginx yoki FrankenPHP |
| `php bin/console` bilan Docker DB'ga ulanolmaslik | Host porti tasodifiy, `.env` dagi 5432 noto'g'ri | `symfony console ...` ishlating |
| `var/` yoki `vendor/` ni git'ga qo'shish | Repo shishadi, konflikt chiqadi | `.gitignore` allaqachon to'g'ri — o'zgartirmang |

---

## Amaliyot

1. `symfony new symfony_book --version="8.1.*" --webapp` bilan loyiha yarating va `symfony serve -d` bilan ishga tushiring. Brauzerda ochib, pastdagi profiler panelini toping.
2. `.env.local` yarating va `DATABASE_URL` ni SQLite'ga o'zgartiring:
   `DATABASE_URL="sqlite:///%kernel.project_dir%/var/data.db"`. Keyin `php bin/console debug:dotenv DATABASE_URL` bilan qiymat qaysi fayldan kelayotganini tasdiqlang.
3. `docker compose up -d` qiling va `symfony console doctrine:database:create` ni sinab ko'ring; keyin `.env.local` dagi SQLite qatorini vaqtincha izohga oling va farqni kuzating.
4. `symfony check:requirements` va `symfony check:security` ni ishga tushiring. Ikkinchisi nima qilishini ayting.
5. `composer remove symfony/ux-turbo` qilib, `config/packages/` va `importmap.php` da nima o'zgarganini `git diff` bilan ko'ring — bu Flex retseptining teskari ishi ([07-bob](07-bundle-va-flex.md)).

---

## Rasmiy hujjat

- O'rnatish: <https://symfony.com/doc/current/setup.html>
- Lokal web server: <https://symfony.com/doc/current/setup/symfony_server.html>
- Docker: <https://symfony.com/doc/current/setup/docker.html>
- Konfiguratsiya va `.env`: <https://symfony.com/doc/current/configuration.html>
- Symfony CLI: <https://symfony.com/download>

---

[← Oldingi: Kirish](01-kirish.md) · [Mundarija](README.md) · [Keyingi: Papkalar tuzilmasi va Kernel →](03-papkalar-va-kernel.md)
