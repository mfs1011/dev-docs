# 07 — Bundlelar va Flex retseptlari

[← Oldingi: Container — chuqur qatlam](06-container-chuqur.md) · [Mundarija](README.md) · [Keyingi: Konfiguratsiya va muhitlar →](08-konfiguratsiya.md)

---

## Bundle nima (va nima emas)

**Bundle** — Symfony ilovasiga ulanadigan plagin: o'z servislarini, konfiguratsiyasini, route'larini, shablonlarini va console buyruqlarini olib keladi. DoctrineBundle, SecurityBundle, MonologBundle — hammasi shunday.

**Bundle nima emas:** sizning ilovangizni bo'laklarga bo'lish vositasi. Symfony 4 dan beri rasmiy tavsiya aniq: *ilova kodini bundlega solmang*. Sabab — bundle qobig'i (extension, configuration klass, prefiks) faqat **qayta ishlatish** kerak bo'lganda ma'noga ega. Bitta loyihada yashaydigan kod uchun bu ortiqcha soliq.

Qoida:

> Kod ikkinchi loyihaga ko'chadimi? → bundle. Yo'qmi? → `src/` dagi oddiy namespace.

```php
// config/bundles.php — qaysi bundle qaysi muhitda yoqilgan
return [
    Symfony\Bundle\FrameworkBundle\FrameworkBundle::class => ['all' => true],
    Symfony\Bundle\DebugBundle\DebugBundle::class => ['dev' => true],
    Symfony\Bundle\WebProfilerBundle\WebProfilerBundle::class => ['dev' => true, 'test' => true],
    Symfony\Bundle\MakerBundle\MakerBundle::class => ['dev' => true],
];
```

Bu fayldagi muhit ajratmasi bejiz emas: Profiler va Maker production'da **umuman yuklanmaydi**, ya'ni ular na xotira, na hujum yuzasini qo'shadi.

---

## Minimal bundle

```php
// src/Acme/BlogBundle/AcmeBlogBundle.php
namespace Acme\BlogBundle;

use Symfony\Component\HttpKernel\Bundle\AbstractBundle;

class AcmeBlogBundle extends AbstractBundle
{
}
```

`AbstractBundle` (Symfony 5.3+) bundle yozishni sezilarli soddalashtirdi — endi alohida `Extension` va `Configuration` klasslari shart emas:

```php
use Symfony\Component\Config\Definition\Configurator\DefinitionConfigurator;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

class AcmeBlogBundle extends AbstractBundle
{
    public function configure(DefinitionConfigurator $definition): void
    {
        $definition->rootNode()
            ->children()
                ->integerNode('posts_per_page')->defaultValue(20)->end()
                ->scalarNode('cache_pool')->defaultValue('cache.app')->end()
            ->end();
    }

    public function loadExtension(array $config, ContainerConfigurator $container, ContainerBuilder $builder): void
    {
        $container->import('../config/services.yaml');
        $container->services()
            ->get(PostRepository::class)
            ->arg('$postsPerPage', $config['posts_per_page']);
    }
}
```

Tavsiya etilgan tuzilma — ilova tuzilmasining kichraytirilgan nusxasi: `src/`, `config/`, `templates/`, `translations/`, `public/`, `tests/`.

Symfony 8.1 da bundle bog'liqligini e'lon qilish mumkin:

```php
use Symfony\Component\HttpKernel\Bundle\Attribute\RequiredBundle;

#[RequiredBundle(AcmeCoreBundle::class)]
class AcmeBlogBundle extends AbstractBundle
{
}
```

---

## Flex: retseptlar mexanizmi

Flex — Composer plagini. `composer require` qilganingizda u paketga mos **retsept** bor-yo'qligini tekshiradi va bor bo'lsa avtomatik bajaradi:

- `config/packages/<paket>.yaml` yaratadi;
- `config/bundles.php` ga bundle qo'shadi;
- `.env` ga o'zgaruvchi bloklarini yozadi (`###> paket ###` ... `###< paket ###`);
- kerak bo'lsa `compose.yaml` ga servis qo'shadi, `Dockerfile`, `Makefile` va h.k. yaratadi.

```shell
composer require logger        # alias — symfony/monolog-bundle o'rnatiladi
composer require --dev maker   # alias — symfony/maker-bundle
composer recipes               # o'rnatilgan retseptlar ro'yxati va holati
composer recipes symfony/framework-bundle   # bitta retsept tafsiloti
composer recipes:update        # retseptning yangi versiyasini qo'llash
```

`symfony.lock` — qaysi retsept qaysi versiyada qo'llanganini qayd qiladi. Uni **git'ga commit qiling**: aks holda jamoadoshingizda boshqa retsept versiyasi qo'llanib, konfiguratsiya fayllari farq qiladi.

`composer remove` esa teskarisini qiladi: retsept yaratgan konfiguratsiya fayllarini o'chiradi va `.env` bloklarini tozalaydi. Shuning uchun retsept yaratgan fayllarni **qo'lda o'zgartirsangiz** (odatda shunday bo'ladi), Flex ularni o'chirishdan oldin farqni ko'rsatadi.

**`recipes:update` — professional odat.** Symfony skeleton'i vaqt o'tishi bilan yaxshilanadi (`framework.yaml` sozlamalari, `.gitignore`, PHPUnit konfiguratsiyasi). `composer recipes:update` sizga o'sha yangilanishlarni git diff sifatida beradi. Bu — yangilanishning eng ko'p unutiladigan, eng foydali qismi.

---

## Muhandislik nuqtai nazari: skeleton drift muammosi

Har qanday generatsiya qilingan loyihada vaqt o'tishi bilan **skeleton drift** paydo bo'ladi: 2021-yilda yaratilgan loyiha 2026-yilgi standart konfiguratsiyadan uzoqlashadi. Natija — yangi hujjatlardagi misollar sizda ishlamaydi, sabablarini esa hech kim bilmaydi.

Buning yechimi uch qadam:

1. **Retsept yangilanishlarini muntazam qo'llang** (`composer recipes:update`) — kamida majorga o'tishda.
2. **Konfiguratsiyani qo'lda "optimallashtirishdan" saqlaning.** Har bir qo'lda o'zgartirilgan qator — kelajakdagi merge konflikt.
3. **Farqni hujjatlashtiring.** Agar `framework.yaml` da standartdan chetlashgan bo'lsangiz, yoniga sababi yozilgan izoh qo'ying. Olti oydan keyin buni siz o'zingiz unutasiz.

Bundle yozish haqida ham bitta senior maslahat: **bundle yozishdan oldin uch marta o'ylang**. Ko'p jamoalar "umumiy kod" uchun bundle yaratib, keyin uni bitta loyihada ishlatadi va versiyalash, relizlash, hujjatlash yukini behuda ko'taradi. Alternativa — oddiy Composer paket (bundlesiz, faqat servis klasslari + `services.yaml` import). Bundle faqat *framework bilan chuqur integratsiya* (konfiguratsiya daraxti, compiler pass, route yuklash) kerak bo'lganda oqlanadi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Ilova kodini `AppBundle` ga solish | Eskirgan yondashuv, ortiqcha qatlam | `src/` + `App\` |
| `symfony.lock` ni git'ga qo'shmaslik | Jamoada retsept versiyalari farq qiladi | Commit qiling |
| `config/packages/*.yaml` ni erkin tahrirlash va izohsiz qoldirish | `recipes:update` da konflikt, sabab unutiladi | Faqat kerakli qatorni o'zgartiring + izoh |
| `composer require` dan keyin `git diff` ni ko'rmaslik | Retsept nima o'zgartirganini bilmay qolasiz | Har o'rnatishdan keyin `git diff` |
| Bundle'ni bitta loyiha uchun yaratish | Relizlash va versiyalash yuki, foyda yo'q | Oddiy namespace yoki oddiy Composer paket |
| Production'da `--dev` paketlarga tayanish | `composer install --no-dev` da yo'q bo'ladi | Maker/Profiler faqat `dev` |

---

## Amaliyot

1. `composer require logger` va keyin `git diff` — Flex qaysi fayllarni o'zgartirganini ro'yxatlang.
2. `composer recipes` ni ishga tushiring: qaysi retseptlar "update available" holatida ekanini toping.
3. `composer recipes symfony/monolog-bundle` bilan retsept tafsilotini va uning GitHub havolasini ko'ring.
4. `composer remove logger` qiling va `config/packages/monolog.yaml` o'chganini tasdiqlang; keyin qaytarib o'rnating.
5. `src/Acme/BlogBundle/` ichida minimal `AbstractBundle` yarating, `config/bundles.php` ga qo'shing va `php bin/console config:dump-reference acme_blog` bilan konfiguratsiya daraxtini ko'ring.

---

## Rasmiy hujjat

- Bundle tizimi: <https://symfony.com/doc/current/bundles.html>
- Bundle'ning eng yaxshi amaliyotlari: <https://symfony.com/doc/current/bundles/best_practices.html>
- `AbstractBundle` bilan konfiguratsiya: <https://symfony.com/doc/current/bundles/configuration.html>
- Symfony Flex: <https://symfony.com/doc/current/setup/flex.html>
- Retseptlar repozitoriysi: <https://github.com/symfony/recipes>

---

[← Oldingi: Container — chuqur qatlam](06-container-chuqur.md) · [Mundarija](README.md) · [Keyingi: Konfiguratsiya va muhitlar →](08-konfiguratsiya.md)
