# 08 — Konfiguratsiya va muhitlar

[← Oldingi: Bundlelar va Flex](07-bundle-va-flex.md) · [Mundarija](README.md) · [Keyingi: Routing →](09-routing.md)

---

## Uch xil konfiguratsiya — uch xil joy

Bu bo'limni chalkashtirish — production'dagi sirlar sizib chiqishining eng keng tarqalgan sababi.

| Tur | Misol | Qayerda saqlanadi | Git'ga tushadimi |
| --- | --- | --- | --- |
| **Infratuzilma** (mashinaga bog'liq) | `DATABASE_URL`, `MAILER_DSN`, `REDIS_URL` | `.env` (standart) + `.env.local` (haqiqiy) | `.env` ✅ / `.env.local` ❌ |
| **Sirlar** | API kalit, shifrlash kaliti, to'lov tokeni | Secrets vault (`config/secrets/`) | shifrlangan holda ✅, kalit ❌ |
| **Ilova xatti-harakati** | `app.posts_per_page`, `app.default_locale` | `config/services.yaml` → `parameters` | ✅ |

Sabab oddiy: birinchisi har muhitda boshqacha, ikkinchisi maxfiy, uchinchisi — kodning bir qismi. Ularni bitta joyda saqlash har uchala talabni ham buzadi.

---

## Konfiguratsiya fayllari va yuklanish tartibi

```
config/
├─ packages/
│  ├─ framework.yaml       ← barcha muhitlar
│  ├─ doctrine.yaml
│  ├─ dev/                 ← faqat dev
│  └─ test/
├─ services.yaml
└─ routes.yaml
```

Yuklanish tartibi: `config/packages/*` → `config/packages/{env}/*` → `config/services.yaml`. Keyingisi oldingisini **qisman** override qiladi (massivlar birlashtiriladi).

Zamonaviy uslubda alohida papka o'rniga bitta faylda `when@` ishlatiladi — kontekst bir joyda turadi:

```yaml
# config/packages/monolog.yaml
monolog:
    handlers:
        main:
            type: fingers_crossed
            action_level: error
            handler: nested
        nested:
            type: stream
            path: '%kernel.logs_dir%/%kernel.environment%.log'
            level: debug

when@dev:
    monolog:
        handlers:
            main:
                type: stream
                path: '%kernel.logs_dir%/%kernel.environment%.log'
                level: debug

when@test:
    monolog:
        handlers:
            main:
                type: null
```

Yakuniy natijani taxmin qilmang — so'rang:

```shell
php bin/console debug:config monolog             # hozirgi muhitdagi yakuniy konfiguratsiya
php bin/console config:dump-reference framework  # mumkin bo'lgan barcha sozlamalar
php bin/console debug:config framework router    # aniq bir shox
```

---

## Parametrlar

```yaml
# config/services.yaml
parameters:
    app.posts_per_page: 20
    app.supported_locales: ['uz', 'ru', 'en']
    app.upload_dir: '%kernel.project_dir%/var/uploads'
    app.max_items: !php/const App\Entity\Post::MAX_ITEMS
    app.default_state: !php/enum App\Enum\PostState::Draft
```

Ishlatish:

```php
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class PostLister
{
    public function __construct(
        #[Autowire(param: 'app.posts_per_page')]
        private int $postsPerPage,
    ) {
    }
}
```

Qoidalar:

- **Prefiks qo'ying** (`app.`) — bundle parametrlari bilan to'qnashmaslik uchun.
- **Nom aniq bo'lsin**: `app.posts_per_page`, `app.dir` emas.
- Deyarli hech qachon o'zgarmaydigan qiymat — parametr emas, **klass konstantasi** (`Post::MAX_ITEMS`). Parametr "sozlanadigan" degani.

---

## Env o'zgaruvchilar va protsessorlar

`.env` faqat satr beradi. Symfony uni kerakli tipga aylantiradigan **protsessorlar** beradi:

```yaml
parameters:
    app.debug_enabled: '%env(bool:APP_DEBUG_FEATURE)%'
    app.workers: '%env(int:WORKER_COUNT)%'
    app.allowed_hosts: '%env(csv:ALLOWED_HOSTS)%'
    app.feature_flags: '%env(json:FEATURE_FLAGS)%'
    app.db_host: '%env(key:host:url:DATABASE_URL)%'
    app.private_key: '%env(file:PRIVATE_KEY_PATH)%'
    app.sentry_dsn: '%env(default:app.sentry_fallback:SENTRY_DSN)%'
```

Symfony 8.1 da mavjud protsessorlar (`EnvVarProcessor::getProvidedTypes()` dan):

| Protsessor | Natija | Misol |
| --- | --- | --- |
| `bool`, `not` | bool | `%env(bool:FEATURE_X)%` |
| `int`, `float` | son | `%env(int:PORT)%` |
| `string`, `trim` | satr | `%env(trim:TOKEN)%` |
| `csv`, `json`, `shuffle` | massiv | `%env(csv:HOSTS)%` |
| `url`, `query_string` | massiv (parse qilingan) | `%env(key:host:url:DATABASE_URL)%` |
| `key` | massivdan kalit | yuqoridagi misol |
| `file`, `base64` | fayl mazmuni / dekod | `%env(file:SSL_KEY)%` |
| `const`, `enum` | PHP konstanta / enum | `%env(enum:App\Enum\Mode:APP_MODE)%` |
| `default`, `require`, `defined` | zaxira qiymat / majburiylik | `%env(require:APP_SECRET)%` |
| `resolve`, `urlencode` | `%param%` larni ochish / kodlash | `%env(resolve:DATABASE_URL)%` |

`require` — production uchun qimmatli: o'zgaruvchi berilmagan bo'lsa ilova **ishga tushmaydi**, jimgina `null` bilan ishlamaydi. "Fail fast" prinsipi.

---

## Secrets vault

Haqiqiy sirlar uchun `.env` emas, shifrlangan vault:

```shell
php bin/console secrets:generate-keys                  # dev uchun kalit juftligi
APP_RUNTIME_ENV=prod php bin/console secrets:generate-keys

php bin/console secrets:set STRIPE_SECRET              # interaktiv kiritish
echo -n "$TOKEN" | php bin/console secrets:set GITHUB_TOKEN -
php bin/console secrets:set REMEMBER_ME --random

php bin/console secrets:list --reveal
php bin/console secrets:remove STRIPE_SECRET
```

Fayllar:

| Fayl | Git'ga | Vazifasi |
| --- | --- | --- |
| `config/secrets/prod/prod.encrypt.public.php` | ✅ | Shifrlash (hamma qo'sha oladi) |
| `config/secrets/prod/prod.decrypt.private.php` | ❌ | Ochish (faqat serverda) |
| `config/secrets/prod/*.prod.php` | ✅ | Shifrlangan qiymatlar |

Ochiq kalit commit qilinadi — demak **har bir dasturchi sir qo'sha oladi, lekin o'qiy olmaydi**. Bu asimmetrik kriptografiyaning aniq amaliy foydasi.

Konfiguratsiyada sirlar oddiy env kabi ishlatiladi:

```yaml
doctrine:
    dbal:
        password: '%env(DATABASE_PASSWORD)%'
```

Production'ga kalitni yetkazishning ikki yo'li:

```shell
# 1) Fayl sifatida ko'chirish
scp config/secrets/prod/prod.decrypt.private.php server:/app/config/secrets/prod/

# 2) Muhit o'zgaruvchisi orqali (odatda yaxshiroq)
php -r 'echo base64_encode(require "config/secrets/prod/prod.decrypt.private.php");'
# natijani SYMFONY_DECRYPTION_SECRET ga yozing
```

Deploy'da unumdorlik uchun sirlarni bir marta ochib qo'yish mumkin, keyin kalitni serverdan olib tashlash:

```shell
APP_RUNTIME_ENV=prod php bin/console secrets:decrypt-to-local --force
```

---

## `.env` dan production'ga

```shell
composer dump-env prod     # barcha .env fayllarni .env.local.php ga yig'adi
```

Natija — bitta PHP massiv fayl: ishlash vaqtida `.env` parser umuman chaqirilmaydi. Katta trafikda bu sezilarli farq beradi, chunki har PHP jarayoni ishga tushganda fayl parse qilish kerak bo'lmaydi.

---

## Muhandislik nuqtai nazari: konfiguratsiya — bu interfeys

Konfiguratsiyani "sozlamalar" deb emas, **ilovaning tashqi dunyo bilan shartnomasi** deb qarash kerak. Shundan uchta amaliy qoida kelib chiqadi:

1. **Ilova o'z konfiguratsiyasini ishga tushishda tekshirsin.** `%env(require:...)%`, `parameterCannotBeEmpty()`, `lint:container` — hammasi shu maqsadda. Yomon konfiguratsiya bilan ishga tushgan va soat 3:00 da sinadigan ilova — eng qimmat xato turi.
2. **Muhitlar soni minimal bo'lsin.** `dev`, `test`, `prod` — kifoya. Staging uchun yangi muhit yaratmang; `APP_ENV=prod` + `APP_RUNTIME_ENV=staging` ishlating. Sababi: yangi muhit — yangi konfiguratsiya yo'li, ya'ni "staging'da ishlagan, prod'da ishlamagan" sinfidagi xatolar manbayi.
3. **Sir tarixga tushsa — u ochilgan hisoblanadi.** Git tarixidan o'chirish yordam bermaydi (fork, kesh, CI loglar). Yagona to'g'ri javob — **rotatsiya**: eski kalitni bekor qilish, yangisini chiqarish.

12-factor terminologiyasida: konfiguratsiya muhitda saqlanadi, kodda emas; build va run bosqichlari qat'iy ajratiladi. Symfony'ning `dump-env` + `cache:warmup` juftligi aynan shu ajratmani beradi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Sirni `.env` ga yozish | Git tarixida abadiy qoladi | Vault yoki `.env.local` |
| `getenv()` / `$_ENV` ni kodda o'qish | Container keshi va protsessorlar chetlab o'tiladi, test qiyin | `#[Autowire(env: '...')]` yoki `%env()%` |
| Har muhitga alohida `APP_ENV` yaratish | Konfiguratsiya yo'llari ko'payadi, farqlar yashirin qoladi | `APP_RUNTIME_ENV` |
| Parametrni `dev` da bor, `prod` da yo'q qilib qoldirish | Deploy'da `You have requested a non-existent parameter` | `config/packages/*.yaml` da umumiy standart qiymat |
| Konfiguratsiyani runtime'da bazadan o'qib, keshni chetlab o'tish | Har so'rovda qo'shimcha so'rov, nomuvofiqlik | Sozlamani kesh bilan o'qing ([28-bob](28-cache-lock-httpclient.md)) |
| `debug:config` o'rniga YAML'larni ko'z bilan yig'ish | Override tartibi chalkash, xato xulosa | `debug:config <bundle>` |

---

## Amaliyot

1. `config/services.yaml` ga `app.posts_per_page: 20` qo'shing va uni `#[Autowire(param:)]` bilan servisga uzating.
2. `.env` ga `FEATURE_FLAGS='{"beta":true}'` yozing va `%env(json:FEATURE_FLAGS)%` orqali parametr qiling. `php bin/console debug:container --parameters` bilan tasdiqlang.
3. `php bin/console secrets:generate-keys` qiling, `secrets:set DEMO_TOKEN` bilan sir qo'shing, `secrets:list --reveal` bilan ko'ring. `config/secrets/` ichidagi fayllarni ko'rib chiqing.
4. `when@dev` bloki bilan `monolog` darajasini o'zgartiring va `APP_ENV=dev`/`APP_ENV=prod` uchun `debug:config monolog` natijalarini solishtiring.
5. `%env(require:APP_SECRET)%` ishlatib ko'ring va o'zgaruvchini vaqtincha o'chirib, ilova ishga tushmasligini tasdiqlang.

---

## Rasmiy hujjat

- Konfiguratsiya: <https://symfony.com/doc/current/configuration.html>
- Muhitlar: <https://symfony.com/doc/current/configuration/multiple_kernels.html> va <https://symfony.com/doc/current/configuration.html#configuration-environments>
- Env o'zgaruvchi protsessorlari: <https://symfony.com/doc/current/configuration/env_var_processors.html>
- Secrets: <https://symfony.com/doc/current/configuration/secrets.html>
- Best practices: <https://symfony.com/doc/current/best_practices.html#configuration>

---

[← Oldingi: Bundlelar va Flex](07-bundle-va-flex.md) · [Mundarija](README.md) · [Keyingi: Routing →](09-routing.md)
