# 06 — Container: chuqur qatlam

[← Oldingi: Service container](05-service-container.md) · [Mundarija](README.md) · [Keyingi: Bundlelar va Flex →](07-bundle-va-flex.md)

---

Bu bob — Symfony'ni "ishlataman" darajasidan "kengaytiraman" darajasiga o'tkazadigan bob. Bu yerdagi to'rt mexanizm (teglar, dekoratsiya, lazy, compiler pass) freymvorkning o'zi ichida ham xuddi shunday ishlatiladi.

---

## 1. Teglar: bir interfeysning barcha implementatsiyalarini yig'ish

Klassik vazifa: har xil "eksport formatlari" bor, va ularni birma-bir `if` bilan yozmasdan, avtomatik topish kerak.

```php
// src/Export/ExporterInterface.php
namespace App\Export;

use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.exporter')]
interface ExporterInterface
{
    public function supports(string $format): bool;

    public function export(iterable $rows): string;
}
```

`#[AutoconfigureTag]` interfeysga qo'yilgani uchun **har bir implementatsiya avtomatik teglanadi** — servislar ro'yxatini qo'lda yuritish kerak emas.

```php
// src/Export/CsvExporter.php
namespace App\Export;

use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

#[AsTaggedItem(index: 'csv', priority: 10)]
final class CsvExporter implements ExporterInterface
{
    public function supports(string $format): bool
    {
        return 'csv' === $format;
    }

    public function export(iterable $rows): string
    {
        $out = fopen('php://temp', 'r+');
        foreach ($rows as $row) {
            fputcsv($out, $row, escape: '');
        }
        rewind($out);

        return stream_get_contents($out);
    }
}
```

Yig'ish — ikki xil usul:

```php
// src/Export/ExporterRegistry.php
namespace App\Export;

use Psr\Container\ContainerInterface;
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;
use Symfony\Component\DependencyInjection\Attribute\AutowireLocator;

final class ExporterRegistry
{
    public function __construct(
        /** @var iterable<ExporterInterface> barchasi prioritet tartibida yaratiladi */
        #[AutowireIterator('app.exporter')]
        private iterable $exporters,

        /** faqat so'ralgani yaratiladi — lazy */
        #[AutowireLocator('app.exporter', indexAttribute: 'index')]
        private ContainerInterface $locator,
    ) {
    }

    public function byFormat(string $format): ExporterInterface
    {
        foreach ($this->exporters as $exporter) {
            if ($exporter->supports($format)) {
                return $exporter;
            }
        }

        throw new \InvalidArgumentException(\sprintf('No exporter for format "%s".', $format));
    }

    public function byKey(string $key): ExporterInterface
    {
        if (!$this->locator->has($key)) {
            throw new \InvalidArgumentException(\sprintf('Unknown exporter "%s".', $key));
        }

        return $this->locator->get($key);
    }
}
```

| Vosita | Qachon | Xarakteristika |
| --- | --- | --- |
| `#[AutowireIterator]` | Hammasidan o'tish kerak (chain, pipeline) | Barcha servis yaratiladi |
| `#[AutowireLocator]` | Bittasini kalit bo'yicha olish kerak | Faqat so'ralgani yaratiladi |

> **Symfony 8.1 eslatmasi.** Eski `getDefaultPriority()` / `getDefaultIndexMethod()` statik metodlari deprecate qilingan. Yangi kodda `#[AsTaggedItem(index: ..., priority: ...)]` ishlating.

---

## 2. Dekoratsiya: mavjud servis xatti-harakatini o'rash

Uchinchi tomon servisiga (yoki o'zingiznikiga) uni o'zgartirmasdan xatti-harakat qo'shish kerak bo'lsa — Decorator naqshi:

```php
namespace App\Export;

use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;

#[AsDecorator(decorates: CsvExporter::class)]
final class TimedExporter implements ExporterInterface
{
    public function __construct(
        #[AutowireDecorated] private ExporterInterface $inner,
        private LoggerInterface $logger,
    ) {
    }

    public function supports(string $format): bool
    {
        return $this->inner->supports($format);
    }

    public function export(iterable $rows): string
    {
        $start = microtime(true);
        $result = $this->inner->export($rows);
        $this->logger->info('Export finished', ['ms' => (int) ((microtime(true) - $start) * 1000)]);

        return $result;
    }
}
```

Endi `ExporterInterface` so'ragan hamma joy `TimedExporter` ni oladi, u esa ichida asl `CsvExporter` ni saqlaydi. Asl klassning bironta qatori o'zgarmaydi.

Bir nechta dekorator bo'lsa, tartib `priority` bilan boshqariladi (katta — tashqarida):

```php
#[AsDecorator(decorates: CsvExporter::class, priority: 10)]
final class TimedExporter implements ExporterInterface { /* eng tashqi qatlam */ }

#[AsDecorator(decorates: CsvExporter::class, priority: 1)]
final class CachedExporter implements ExporterInterface { /* ichkaridagi qatlam */ }

// Natija: new TimedExporter(new CachedExporter(new CsvExporter()))
```

**Nega bu `extends` dan yaxshi?** Meros implementatsiyaga bog'laydi (ota-klass o'zgarsa bola sinadi), dekorator esa interfeysga bog'lanadi. Symfony'ning o'zi shu naqshdan keng foydalanadi: `dev` muhitdagi `TraceableEventDispatcher`, `TraceableFirewallListener` — bular Profiler uchun qo'yilgan dekoratorlar.

---

## 3. Lazy servislar: yaratishni kechiktirish

```php
use Symfony\Component\DependencyInjection\Attribute\Lazy;

#[Lazy]
final class HeavyPdfRenderer
{
    public function __construct() { /* shriftlar yuklanadi, 40 ms */ }
}
```

Yoki faqat bitta in'ektsiya uchun:

```php
public function __construct(
    #[Lazy] private HeavyPdfRenderer $renderer,
) {
}
```

PHP 8.4+ da bu **native lazy objects** orqali ishlaydi — qo'shimcha proxy kutubxona kerak emas. Servis haqiqatan ham birinchi metod chaqirilgandagina quriladi.

Qachon kerak? Servis qimmat bo'lib, kodning ko'p yo'lida umuman ishlatilmasa. Qachon kerak emas? Oddiy servislar uchun — proxy ham nolga teng narxda emas, va noto'g'ri ishlatilsa muammo faqat kechroq yuzaga chiqadi.

---

## 4. Compiler pass: kompilyatsiya vaqtida container'ni o'zgartirish

Teglar va dekoratorlar 95% holatni qoplaydi. Qolgan 5% uchun — konteynerni **kompilyatsiya paytida** dasturiy ravishda o'zgartirish:

```php
// src/DependencyInjection/Compiler/ExporterCheckPass.php
namespace App\DependencyInjection\Compiler;

use App\Export\ExporterRegistry;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class ExporterCheckPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->has(ExporterRegistry::class)) {
            return;
        }

        $tagged = $container->findTaggedServiceIds('app.exporter');

        if ([] === $tagged) {
            throw new \LogicException('Kamida bitta ExporterInterface implementatsiyasi bo\'lishi kerak.');
        }
    }
}
```

```php
// src/Kernel.php
protected function build(ContainerBuilder $container): void
{
    $container->addCompilerPass(new ExporterCheckPass());
}
```

Compiler pass'lar bosqichlar bo'yicha ishlaydi: `TYPE_BEFORE_OPTIMIZATION` → `TYPE_OPTIMIZE` → `TYPE_BEFORE_REMOVING` → `TYPE_REMOVE` → `TYPE_AFTER_REMOVING`. Ishlatilmayotgan private servislar aynan `REMOVE` bosqichida o'chiriladi — shuning uchun "servis yo'qolib qoldi" muammosi odatda shu bosqich bilan bog'liq.

**Eng qimmatli amaliyot:** compiler pass'ni *arxitektura qoidalarini majburlash* uchun ishlating. Masalan: "`App\Domain\` ichidagi hech bir servis `Doctrine\ORM\EntityManagerInterface` ga bog'lanmasin". Buni pass'da tekshirsangiz, qoida buzilganda **deploy paytida** xato chiqadi, code review'ga umid qilinmaydi.

---

## 5. `#[Target]`: nomlangan alias

Bir interfeysning bir nechta konkret konfiguratsiyasi bo'lsa (masalan ikkita HTTP client), tip yetarli emas:

```php
public function __construct(
    #[Target('githubApi')] private HttpClientInterface $github,
    #[Target('stripeApi')] private HttpClientInterface $stripe,
) {
}
```

```yaml
# config/packages/framework.yaml
framework:
    http_client:
        scoped_clients:
            github.api:  { base_uri: 'https://api.github.com' }
            stripe.api:  { base_uri: 'https://api.stripe.com' }
```

`#[Target]` argument nomiga tayanadigan (`$githubApi`) yashirin konvensiyadan farqli o'laroq, bog'lanishni **aniq** qiladi: argumentni qayta nomlasangiz ham buzilmaydi va noto'g'ri nom yozsangiz kompilyatsiyada xato beradi.

---

## Muhandislik nuqtai nazari: kengaytirish nuqtasini tanlash

Yangi xatti-harakat qo'shish kerak bo'lganda beshta imkoniyat bor. Tanlov mezoni — **kim kimni bilishi kerak**:

| Vosita | Kim kimni biladi | Qachon |
| --- | --- | --- |
| Konstruktor in'ektsiyasi | A → B | Oddiy bog'liqlik |
| Teg + iterator | Registry hech kimni bilmaydi, implementatsiyalar o'zini e'lon qiladi | Plugin/strategiya to'plami |
| Dekorator | Hech kim dekoratorni bilmaydi | Ko'ndalang xatti-harakat: log, kesh, retry, metrika |
| Event listener | Manba tinglovchini bilmaydi | Reaksiya, ixtiyoriy yon ta'sir |
| Compiler pass | Container haqida meta-bilim | Qoidani majburlash, kadrlash |

Bu ro'yxat **Open/Closed** prinsipining amaliy talqini: yangi format qo'shish uchun mavjud kodni tahrirlash kerak bo'lmasligi kerak — yangi klass qo'shish kifoya. Teg mexanizmi aynan shuni beradi.

Ikkinchi muhim g'oya — **kompilyatsiya vaqtidagi xatolar runtime xatolardan arzon**. `lint:container` CI'da ishlasa, "servis topilmadi" xatosi foydalanuvchiga emas, pull request'ga tushadi. Bu — "shift left" yondashuvi: xatoni imkon qadar erta bosqichga surish.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Registry'da `if ($format === 'csv')` zanjiri | Har yangi format mavjud kodni tahrirlaydi | Teg + `#[AutowireIterator]` |
| Dekorator o'rniga `extends` | Implementatsiyaga bog'lanish, `final` klasslar bilan ishlamaydi | `#[AsDecorator]` + `#[AutowireDecorated]` |
| Hamma servisni `lazy` qilish | Ortiqcha proxy, murakkablik, foyda yo'q | Faqat o'lchangan og'ir servislarga |
| Compiler pass'da `$container->get()` chaqirish | Kompilyatsiya vaqtida servis hali yo'q | `getDefinition()` / `findDefinition()` bilan ishlang |
| Private servis o'chib ketganidan hayron bo'lish | `REMOVE` bosqichi ishlatilmaganlarini tozalaydi | Ishlatilishini ta'minlang yoki `public: true` (asosli bo'lsa) |
| `#[AutowireLocator]` o'rniga butun konteynerni in'ektsiya | Bog'liqliklar yashiriladi | Locator faqat kerakli servislarni ochadi |

---

## Amaliyot

1. `ExporterInterface` + `CsvExporter` + `JsonExporter` yarating, `#[AutoconfigureTag]` qo'ying va `php bin/console debug:container --tag=app.exporter` bilan ikkalasi ham teglanganini tasdiqlang.
2. `ExporterRegistry` ni yuqoridagidek yozing va `byFormat('csv')` ishlashini testda tekshiring.
3. `TimedExporter` dekoratorini qo'shing. `debug:container App\\Export\\CsvExporter` chiqishida `.inner` servisi paydo bo'lganini ko'ring.
4. `#[AsTaggedItem(priority: ...)]` qiymatlarini almashtirib, `#[AutowireIterator]` tartibi o'zgarishini `dump()` bilan tasdiqlang.
5. `ExporterCheckPass` ni yozing, barcha exporterlarni vaqtincha o'chirib, `cache:clear` da xato chiqishini ko'ring — bu "shift left" ni amalda his qilish.

---

## Bog'liq patternlar

[P-29 Strategiya (teg), P-30 Dekorator](patterns/05-xizmat-va-di.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Teglar: <https://symfony.com/doc/current/service_container/tags.html>
- Dekoratsiya: <https://symfony.com/doc/current/service_container/service_decoration.html>
- Lazy servislar: <https://symfony.com/doc/current/service_container/lazy_services.html>
- Compiler pass: <https://symfony.com/doc/current/service_container/compiler_passes.html>
- Service subscriber / locator: <https://symfony.com/doc/current/service_container/service_subscribers_locators.html>

---

[← Oldingi: Service container](05-service-container.md) · [Mundarija](README.md) · [Keyingi: Bundlelar va Flex →](07-bundle-va-flex.md)
