# 34 — Kod sifati: PHPStan, CS Fixer, Rector

[← Oldingi: Unumdorlik](33-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Real-time: Mercure →](35-mercure.md)

---

## Nega avtomatlashtirish

Code review'da uchta xil e'tiroz bo'ladi:

| E'tiroz turi | Misol | Kim aytishi kerak |
| --- | --- | --- |
| Formatlash | Bo'shliq, qavs joyi, import tartibi | **Vosita** (CS Fixer) |
| Tip va mantiq xatolari | `null` ga metod chaqirish, noto'g'ri argument | **Vosita** (PHPStan) |
| Dizayn va nom | Bu mas'uliyat shu klassnikimi? | **Odam** |

Birinchi ikkitasini odam tekshirsa, uchinchisiga vaqt qolmaydi. Shuning uchun avtomatlashtiriladigan hamma narsa avtomatlashtiriladi.

---

## PHPStan — statik tahlil

```shell
composer require --dev phpstan/phpstan phpstan/phpstan-symfony phpstan/phpstan-doctrine phpstan/extension-installer
```

```neon
# phpstan.neon
parameters:
    level: 8
    paths:
        - src
        - tests
    symfony:
        containerXmlPath: var/cache/dev/App_KernelDevContainer.xml
    doctrine:
        objectManagerLoader: tests/object-manager.php
```

```shell
vendor/bin/phpstan analyse
```

Darajalar 0 dan 10 gacha (`max`). Amaliy strategiya:

1. Mavjud loyihada **baseline** yarating (`--generate-baseline`) — hozirgi xatolar e'tiborsiz qoldiriladi, yangilari esa bloklanadi.
2. Darajani bosqichma-bosqich oshiring; har darajada baseline'ni qisqartiring.
3. Yangi loyiha — darhol `level: 8` yoki `max`.

Symfony va Doctrine kengaytmalari muhim: ularsiz PHPStan `$this->getUser()` yoki repository metodlarining tiplarini bilmaydi va foydasi keskin kamayadi.

PHPStan nimani ushlaydi (testlar ushlamaydigan narsalar):

```php
// null ga murojaat
$post->getAuthor()->getName();       // getAuthor() ?User qaytarsa — xato

// mavjud bo'lmagan metod/xossa
$user->getFullName();

// noto'g'ri massiv shakli
/** @param array{id: int, title: string} $row */
function render(array $row): string {}

render(['id' => 1]);                  // 'title' yo'q — xato
```

---

## PHP CS Fixer — formatlash

```shell
composer require --dev friendsofphp/php-cs-fixer
```

```php
// .php-cs-fixer.dist.php
$finder = PhpCsFixer\Finder::create()
    ->in(__DIR__.'/src')
    ->in(__DIR__.'/tests');

return new PhpCsFixer\Config()
    ->setRules([
        '@PER-CS' => true,
        '@PHP84Migration' => true,
        '@Symfony' => true,
        'declare_strict_types' => true,
        'global_namespace_import' => ['import_classes' => false, 'import_functions' => false],
        'ordered_imports' => ['sort_algorithm' => 'alpha'],
    ])
    ->setRiskyAllowed(true)
    ->setFinder($finder);
```

```shell
vendor/bin/php-cs-fixer fix                 # tuzatadi
vendor/bin/php-cs-fixer fix --dry-run --diff  # CI uchun: tekshiradi
```

**Formatlash bahsini bir marta hal qiling va qaytmang.** Qaysi standart tanlanishi (PER-CS, Symfony) kodning sifatiga deyarli ta'sir qilmaydi; **bir xillik** ta'sir qiladi.

---

## Rector — avtomatik refaktoring

```shell
composer require --dev rector/rector
```

```php
// rector.php
use Rector\Config\RectorConfig;
use Rector\Set\ValueObject\LevelSetList;
use Rector\Symfony\Set\SymfonySetList;

return RectorConfig::configure()
    ->withPaths([__DIR__.'/src', __DIR__.'/tests'])
    ->withPhpSets(php84: true)
    ->withSets([
        SymfonySetList::SYMFONY_71,
        SymfonySetList::SYMFONY_CODE_QUALITY,
        SymfonySetList::SYMFONY_CONSTRUCTOR_INJECTION,
    ])
    ->withTypeCoverageLevel(0)
    ->withDeadCodeLevel(0);
```

```shell
vendor/bin/rector process --dry-run
vendor/bin/rector process
```

Rector ikki vazifa uchun juda kuchli:

1. **Versiya migratsiyasi.** Symfony 6 → 7 → 8 o'tishda deprecate qilingan API'larni avtomatik almashtiradi ([01-bob](01-kirish.md)).
2. **Tiplarni kuchaytirish.** PHPDoc'dan haqiqiy tip e'lonlarini generatsiya qiladi.

**Qoida:** Rector'ni har doim `--dry-run` bilan boshlang, natijani `git diff` bilan ko'rib chiqing va alohida commit qiling. Aralash commit (refaktoring + yangi funksiya) — review qilib bo'lmaydigan commit.

---

## Symfony'ning o'z tekshiruvlari

```shell
php bin/console lint:container        # servis ta'riflari to'g'rimi
php bin/console lint:yaml config/     # YAML sintaksisi
php bin/console lint:twig templates/  # Twig sintaksisi
php bin/console doctrine:schema:validate
php bin/console debug:container --deprecations
symfony check:security                # bog'liqliklardagi ma'lum zaifliklar
composer audit
```

Bularning hammasi CI'da bajarilishi kerak — har biri sekundlar oladi, lekin production'dagi soatlarni tejaydi.

---

## CI konvertori

```yaml
# .github/workflows/ci.yaml (qisqartirilgan)
jobs:
    quality:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: shivammathur/setup-php@v2
              with:
                  php-version: '8.4'
                  extensions: ctype, iconv, pdo_pgsql
                  coverage: none
            - run: composer install --prefer-dist --no-progress
            - run: vendor/bin/php-cs-fixer fix --dry-run --diff
            - run: vendor/bin/phpstan analyse --no-progress
            - run: php bin/console lint:container
            - run: php bin/console lint:yaml config
            - run: php bin/console doctrine:schema:validate --skip-sync
            - run: composer audit
            - run: php bin/phpunit
```

---

## Muhandislik nuqtai nazari: sifat — jarayon, xohish emas

**1. Tekshiruv majburiy bo'lmasa, u bajarilmaydi.** "Commit qilishdan oldin PHPStan ishlating" degan kelishuv — ishlamaydi. CI'da majburiy bosqich — ishlaydi.

**2. Yangi kod uchun qattiq, eski kod uchun yumshoq.** Baseline mexanizmi aynan shu uchun: butun kod bazasini bir kunda tozalash real emas, lekin yangi kodning sifatini pasaytirmaslik — real.

**3. Deprecation'lar — texnik qarz hisoblagichi.** `failOnDeprecation="true"` ni PHPUnit konfiguratsiyasida yoqing (skeleton allaqachon yoqadi) va deprecation'larni nolga tushiring. Bu keyingi major versiyaga o'tishni deyarli bepul qiladi.

**4. Statik tahlil testni almashtirmaydi.** PHPStan "bu kod ishlaydi" demaydi, "bu kod tip jihatidan izchil" deydi. Biznes mantiqi baribir test talab qiladi ([30-bob](30-testlash.md)).

**5. Arxitektura qoidalarini ham avtomatlashtiring.** `deptrac` yoki PHPStan qoidalari bilan: "`App\Domain` `Doctrine` ga bog'lanmasin", "`Entity` `Controller` ni import qilmasin" ([39-bob](39-arxitektura.md)). Odam esdan chiqaradi, vosita — yo'q.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Vositalarni faqat lokalda ishlatish | Kimdir unutadi, sifat tushadi | CI'da majburiy bosqich |
| PHPStan'ni past darajada qoldirish | Ko'p xato topilmaydi | Baseline + darajani oshirish |
| Formatlashni review'da muhokama qilish | Vaqt isrofi | CS Fixer |
| Rector natijasini ko'rmasdan commit qilish | Kutilmagan o'zgarishlar | `--dry-run` + alohida commit |
| Deprecation'larni e'tiborsiz qoldirish | Major migratsiya haftalarga cho'ziladi | `failOnDeprecation` |
| `composer audit` / `check:security` ni o'tkazib yuborish | Ma'lum zaifliklar bilan yashash | CI bosqichi |
| Statik tahlilni test o'rniga ko'rish | Mantiq xatolari qoladi | Ikkalasi ham kerak |

---

## Amaliyot

1. PHPStan'ni o'rnating, `level: 5` da ishga tushiring, keyin `level: 8` ga ko'taring va farqni ko'ring.
2. `--generate-baseline` bilan baseline yarating va yangi kodda xato chiqishini tasdiqlang.
3. CS Fixer konfiguratsiyasini qo'shing, `--dry-run --diff` bilan qancha fayl o'zgarishini ko'ring.
4. Rector'ni `--dry-run` bilan ishga tushiring va taklif qilingan o'zgarishlarning uchtasini tahlil qiling.
5. Yuqoridagi CI konfiguratsiyasini loyihangizga moslang va bilib turib xato kiritib, CI yiqilishini tasdiqlang.

---

## Rasmiy hujjat

- PHPStan: <https://phpstan.org/user-guide/getting-started>
- PHPStan Symfony kengaytmasi: <https://github.com/phpstan/phpstan-symfony>
- PHP CS Fixer: <https://cs.symfony.com/>
- Rector: <https://getrector.com/documentation>
- Symfony coding standards: <https://symfony.com/doc/current/contributing/code/standards.html>
- Deprecation'lar bilan ishlash: <https://symfony.com/doc/current/setup/upgrade_major.html>

---

[← Oldingi: Unumdorlik](33-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Real-time: Mercure →](35-mercure.md)
