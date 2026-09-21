# 03 — Papkalar tuzilmasi va Kernel

[← Oldingi: O'rnatish](02-ornatish-va-ishga-tushirish.md) · [Mundarija](README.md) · [Keyingi: So'rovning hayot sikli →](04-sorov-hayot-sikli.md)

---

## Standart tuzilma

```
my_app/
├─ assets/          JS/CSS manbalari (AssetMapper yoki Encore)
├─ bin/             console, phpunit — bajariladigan skriptlar
├─ config/          butun ilovaning konfiguratsiyasi
│  ├─ packages/     har bir bundle sozlamasi (framework.yaml, doctrine.yaml, ...)
│  ├─ routes/       qo'shimcha route fayllari
│  ├─ bundles.php   qaysi bundle qaysi muhitda yoqilgan
│  ├─ preload.php   OPcache preload ro'yxati
│  ├─ routes.yaml
│  └─ services.yaml
├─ migrations/      Doctrine migratsiyalari
├─ public/          YAGONA web'dan ko'rinadigan papka; index.php shu yerda
├─ src/             sizning PHP kodingiz — namespace App\
├─ templates/       Twig shablonlari
├─ tests/           testlar — namespace App\Tests\
├─ translations/    tarjima fayllari
├─ var/             ishlash vaqtida yaratiladigan fayllar (cache, log) — git'ga tushmaydi
└─ vendor/          Composer bog'liqliklari — git'ga tushmaydi
```

`src/` ichidagi konvensional papkalar (majburiy emas, lekin butun ekotizim shunga o'rgangan): `Controller/`, `Entity/`, `Repository/`, `Command/`, `EventSubscriber/`, `Form/`, `Security/`, `Service/`, `Twig/`, `Dto/`, `Message/`, `MessageHandler/`.

**Nega `App\` va nega bundle emas?** Symfony 2/3 davrida ilova kodi `AppBundle` ichida yozilardi. Symfony 4 dan boshlab bu **rasmiy ravishda tavsiya etilmaydi**: bundle — bu bir necha loyiha orasida ulashiladigan kod uchun ([07-bob](07-bundle-va-flex.md)). Sizning ilovangiz hech qayerga ulashilmaydi, demak unga bundle qobig'i kerak emas — ortiqcha qatlam, ortiqcha konfiguratsiya.

---

## `public/` — nega faqat bitta papka ochiq

```php
// public/index.php
use App\Kernel;

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return static function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};
```

Web-server document root sifatida **faqat** `public/` ko'rsatiladi. Bu — xavfsizlikning asosiy chizig'i: `.env`, `config/`, `src/`, `vendor/` HTTP orqali umuman yetib bo'lmaydigan joyda qoladi. Agar kimdir document root'ni loyiha ildiziga qo'yса, `https://site.com/.env` bir so'rovda bazangiz parolini beradi.

Bu naqsh **front controller** deb ataladi: barcha so'rov bitta kirish nuqtasidan o'tadi. Afzalligi — autentifikatsiya, log, routing, xatolik ishlovi bitta joyda; `.php` fayllar sochilgan eski uslubda har fayl o'z himoyasini o'zi qilishi kerak edi.

`autoload_runtime.php` — `symfony/runtime` komponenti. U `index.php` ni server turidan (PHP-FPM, CLI, FrankenPHP, ReactPHP, Swoole) ajratadi: qaytarilgan closure qaysi muhitda ishlashini Runtime hal qiladi.

---

## Kernel

```php
// src/Kernel.php
namespace App;

use Symfony\Bundle\FrameworkBundle\Kernel\MicroKernelTrait;
use Symfony\Component\HttpKernel\Kernel as BaseKernel;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    /**
     * @return list<string> APP_ENV uchun ruxsat etilgan qiymatlar
     */
    private function getAllowedEnvs(): array
    {
        return ['prod', 'dev', 'test'];
    }
}
```

Bu 15 qator kod nima qiladi? `MicroKernelTrait` quyidagilarni avtomatik bajaradi:

| Qadam | Nima yuklanadi |
| --- | --- |
| Bundlelar | `config/bundles.php` dagi ro'yxat, joriy muhit bo'yicha filtrlangan |
| Konfiguratsiya | `config/packages/*.yaml` → `config/packages/{env}/*.yaml` → `config/services.yaml` |
| Route'lar | `config/routes/{env}/*` → `config/routes/*` → `config/routes.yaml` |
| Container | Yuqoridagilarning hammasi yig'ilib, PHP klassga **kompilyatsiya qilinadi** |

`getAllowedEnvs()` — Symfony 8.1 da qo'shilgan. Agar `APP_ENV=prodd` deb xato yozsangiz, ilova jim ishlamaydi, balki aniq xato beradi: `The environment "prodd" is not registered as allowed`. Bu kichik narsa, lekin production'da "nega debug yoqiq?" degan tunda qidiruvni oldini oladi.

Kerak bo'lsa Kernel'ga aralashish mumkin:

```php
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use Symfony\Component\Routing\Loader\Configurator\RoutingConfigurator;

class Kernel extends BaseKernel
{
    use MicroKernelTrait;

    private function configureContainer(ContainerConfigurator $container): void
    {
        $container->import('../config/{packages}/*.{php,yaml}');
        $container->import('../config/{services}.yaml');
        // o'zingizning qo'shimcha manbangiz
        $container->import('../config/custom/*.yaml');
    }

    private function configureRoutes(RoutingConfigurator $routes): void
    {
        $routes->import('../config/{routes}/*.{php,yaml}');
        $routes->add('health', '/health')->controller([self::class, 'health']);
    }
}
```

Amalda buni kamdan-kam qilasiz — standart yuklash tartibi deyarli hamma holatni qoplaydi.

---

## `var/` — nima yaratiladi va nega

```
var/
├─ cache/
│  ├─ dev/    → kompilyatsiya qilingan container, router, Twig, profiler ma'lumotlari
│  └─ prod/
└─ log/
```

`var/cache/prod/` ichida `App_KernelProdContainer.php` — bu sizning butun `services.yaml`, `packages/*.yaml` va autowiring qarorlaringizdan **generatsiya qilingan PHP klass**. Ishlash vaqtida YAML o'qilmaydi, refleksiya ishlamaydi: shunchaki tayyor PHP funksiyalar chaqiriladi.

Shuning uchun:

- `dev` da fayl o'zgarsa container avtomatik qayta quriladi (sekin, lekin qulay);
- `prod` da qayta qurish **deploy paytida bir marta** qilinadi: `php bin/console cache:warmup`;
- `prod` da `var/cache` ni qo'lda tozalab qo'yib, keyin "nega birinchi so'rov 3 sekund?" deb hayron bo'lmaslik kerak.

Kernel container'ga bir nechta parametr ham qo'shadi — ular konfiguratsiyada ishlatiladi:

| Parametr | Qiymati |
| --- | --- |
| `kernel.project_dir` | Loyiha ildizi |
| `kernel.environment` | `dev` / `prod` / `test` |
| `kernel.debug` | `true` / `false` |
| `kernel.cache_dir`, `kernel.logs_dir` | `var/cache/{env}`, `var/log` |
| `kernel.bundles` | Yoqilgan bundlelar ro'yxati |
| `kernel.runtime_environment` | `APP_RUNTIME_ENV` (masalan `staging`) — deploy joyini `APP_ENV` dan ajratadi |

```yaml
# config/packages/some.yaml
some_package:
    upload_dir: '%kernel.project_dir%/var/uploads'
```

---

## Muhandislik nuqtai nazari: konfiguratsiyani kompilyatsiya qilish g'oyasi

Symfony'ning eng kuchli arxitektura g'oyalaridan biri — **"dinamik konfiguratsiya, statik ishlash vaqti"**.

Ko'p freymvorklarda har so'rovda konfiguratsiya o'qiladi, servislar yaratiladi, refleksiya ishlaydi. Symfony bu ishni ikkiga bo'ladi:

1. **Build vaqti (kompilyatsiya).** YAML o'qiladi, autowiring hal qilinadi, compiler pass'lar ishlaydi ([06-bob](06-container-chuqur.md)), natija PHP kodga yoziladi. Bu qimmat, lekin bir marta.
2. **Runtime.** Faqat generatsiya qilingan PHP bajariladi. Refleksiya yo'q, YAML parser yo'q.

Bu — kompilyatorlar dunyosidan kelgan klassik "ahead-of-time compilation" yondashuvi. Uning ikkita muhim oqibati bor:

- **Xatolar erta topiladi.** Mavjud bo'lmagan servisga havola, noto'g'ri tip — bular kompilyatsiya vaqtida, ya'ni deploy paytida chiqadi, foydalanuvchi so'rovida emas. `php bin/console lint:container` ni CI'ga qo'ying.
- **Runtime'da "dinamik sehr" cheklangan.** Servis ro'yxatini ishlash vaqtida o'zgartirib bo'lmaydi. Bu cheklov emas, kafolat: ishlayotgan tizim oldindan bilinadigan holatda bo'ladi.

Shu sababli "container faqat bir marta quriladi" qoidasini buzadigan narsalar (masalan, `prod` da fayl yozib container'ni yangilashga urinish) arxitekturaga qarshi ish bo'ladi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Document root'ni loyiha ildiziga qo'yish | `.env`, `config/`, `vendor/` internetdan o'qiladi | Faqat `public/` |
| Ilova kodini bundle ichida yozish | Ortiqcha qatlam, rasmiy tavsiyaga zid | `src/` + `App\` namespace |
| `var/` ni git'ga qo'shish | Har deploy'da konflikt, eski kesh qolib ketadi | `.gitignore` (skeleton to'g'ri sozlagan) |
| Production'da `cache:clear` ni trafik ostida qilish | Birinchi so'rovlar container qurilguncha kutadi | Deploy'da `cache:warmup`, keyin atomik symlink almashtirish ([40-bob](40-deploy-va-checklist.md)) |
| `src/` ga yangi papka o'ylab topib, konvensiyadan chetlashish | Yangi dasturchi kodni topolmaydi, IDE/maker generatorlari mos kelmaydi | Standart papkalarni ishlating; domen bo'yicha bo'lish kerak bo'lsa [39-bob](39-arxitektura.md) |
| `kernel.project_dir` o'rniga `__DIR__.'/../..'` | Ko'chirishga chidamsiz, testda sinadi | Parametr yoki `#[Autowire(param: 'kernel.project_dir')]` |

---

## Amaliyot

1. `php bin/console debug:container --parameters | grep kernel` bilan barcha kernel parametrlarini ko'ring.
2. `var/cache/dev/` ichidan `App_KernelDevContainer.php` ni oching va `getMailerService` yoki shunga o'xshash metodni toping. Bu — sizning `services.yaml` ingizning kompilyatsiya natijasi.
3. `APP_ENV=prodd php bin/console about` ni ishga tushiring va `getAllowedEnvs()` bergan xatoni ko'ring.
4. `Kernel::configureRoutes()` ni override qilib, `/health` route qo'shing (yuqoridagi misol), keyin `php bin/console debug:router` da ko'ring.
5. `rm -rf var/cache/dev && time php bin/console about` va keyin yana `time php bin/console about` — ikki o'lchov farqini tushuntiring.

---

## Rasmiy hujjat

- Loyiha tuzilmasi va best practices: <https://symfony.com/doc/current/best_practices.html>
- Konfiguratsiya: <https://symfony.com/doc/current/configuration.html>
- Kernel'ni sozlash: <https://symfony.com/doc/current/configuration/front_controllers_and_kernel.html>
- Runtime komponenti: <https://symfony.com/doc/current/components/runtime.html>

---

[← Oldingi: O'rnatish](02-ornatish-va-ishga-tushirish.md) · [Mundarija](README.md) · [Keyingi: So'rovning hayot sikli →](04-sorov-hayot-sikli.md)
