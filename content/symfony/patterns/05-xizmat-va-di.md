# Patternlar: xizmatlar va DI

[← Asinxron ishlov](04-async.md) · [Katalog](README.md) · [Keyingi: Testlash →](06-testlash.md)

---

## P-29 · Strategiya (teg + iterator)

**Muammo.** `if ($format === 'csv') ... elseif ($format === 'xlsx') ...` — har yangi format mavjud kodni o'zgartiradi va test qilinishi kerak bo'lgan shoxlar ko'payadi.

**Yechim.** Interfeys + avtomatik teglash; registry implementatsiyalarni bilmaydi.

```php
use Symfony\Component\DependencyInjection\Attribute\AutoconfigureTag;

#[AutoconfigureTag('app.exporter')]
interface ExporterInterface
{
    public function supports(string $format): bool;

    public function export(iterable $rows): string;
}
```

```php
use Symfony\Component\DependencyInjection\Attribute\AutowireIterator;

final class ExporterRegistry
{
    public function __construct(
        /** @var iterable<ExporterInterface> */
        #[AutowireIterator('app.exporter')]
        private iterable $exporters,
    ) {
    }

    public function byFormat(string $format): ExporterInterface
    {
        foreach ($this->exporters as $exporter) {
            if ($exporter->supports($format)) {
                return $exporter;
            }
        }

        throw new UnsupportedFormat($format);
    }
}
```

Bittasini kalit bo'yicha olish kerak bo'lsa — `#[AutowireLocator]` (faqat so'ralgani yaratiladi).

**Qachon kerak emas.** Ikki varianti bor va uchinchisi kutilmayotgan bo'lsa — `match` o'qilishi osonroq.

**Bog'liq:** [06-bob](../06-container-chuqur.md).

---

## P-30 · Dekorator (ko'ndalang xatti-harakat)

**Muammo.** Log, kesh, metrika, retry — bir nechta servisga qo'shilishi kerak, lekin ularning asosiy mantiqiga aralashmasligi kerak.

**Yechim.** Interfeysni o'ragan yangi servis.

```php
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Component\DependencyInjection\Attribute\AutowireDecorated;

#[AsDecorator(decorates: ExchangeRateProvider::class)]
final class CachedExchangeRateProvider implements ExchangeRateProviderInterface
{
    public function __construct(
        #[AutowireDecorated] private ExchangeRateProviderInterface $inner,
        private CacheInterface $cache,
    ) {
    }

    public function getRate(string $currency): float
    {
        return $this->cache->get('rate.'.$currency, function (ItemInterface $item) use ($currency): float {
            $item->expiresAfter(3600);

            return $this->inner->getRate($currency);
        });
    }
}
```

Bir nechta dekorator bo'lsa tartibni `priority` belgilaydi (katta — tashqarida).

**Qachon kerak emas.** Xatti-harakat servisning o'ziga tegishli bo'lsa (masalan, validatsiya) — uni dekoratorga chiqarish mantiqni yashiradi.

**Bog'liq:** [06-bob](../06-container-chuqur.md).

---

## P-31 · Port va adapter (tashqi tizim)

**Muammo.** To'lov provayderining SDK'si butun kod bazasiga tarqalgan; provayderni almashtirish yoki testda soxtalashtirish imkonsiz.

**Yechim.** Domenda **interfeys** (port), infratuzilmada **implementatsiya** (adapter).

```php
namespace App\Domain\Payment;

interface PaymentGateway
{
    public function charge(Money $amount, string $idempotencyKey): ChargeResult;
}
```

```php
namespace App\Infrastructure\Payment;

use Symfony\Component\DependencyInjection\Attribute\Target;

final class StripeGateway implements PaymentGateway
{
    public function __construct(
        #[Target('stripe')] private HttpClientInterface $client,
    ) {
    }

    public function charge(Money $amount, string $idempotencyKey): ChargeResult
    {
        // HTTP tafsilotlari faqat shu yerda
    }
}
```

**Qachon kerak emas.** Har kutubxona uchun interfeys yozish — ortiqcha. Mezon: bu tizim almashtirilishi mumkinmi va uni testda soxtalashtirish kerakmi?

**Bog'liq:** [39-bob](../39-arxitektura.md), [28-bob](../28-cache-lock-httpclient.md).

---

## P-32 · Tashqi chaqiruvga "himoya qobig'i"

**Muammo.** Tashqi API sekinlashdi — sizning worker'laringiz uni kutadi, navbat to'ladi, butun sayt javob bermay qoladi (cascading failure).

**Yechim.** Uch qatlamli himoya: timeout → retry (jitter bilan) → fallback.

```yaml
framework:
    http_client:
        scoped_clients:
            rates:
                base_uri: 'https://api.rates.example.com'
                timeout: 3
                max_duration: 8
                retry_failed:
                    max_retries: 2
                    delay: 500
                    multiplier: 2
                    jitter: 0.3
                    http_codes: [429, 502, 503, 504]
```

```php
public function getRate(string $currency): float
{
    try {
        return $this->api->fetchRate($currency);
    } catch (TransportExceptionInterface|ServerExceptionInterface) {
        $stale = $this->cache->get('rate.stale.'.$currency, static fn () => null);

        if (null !== $stale) {
            return $stale;                       // degradatsiya: eski kurs
        }

        throw new RatesUnavailable();
    }
}
```

**Qachon kerak emas.** Ichki, ishonchli xizmat — lekin timeout baribir kerak.

**Bog'liq:** [28-bob](../28-cache-lock-httpclient.md).

---

## P-33 · Qulf bilan himoyalangan buyruq

**Muammo.** Cron buyrug'i oldingi nusxasi tugamasdan qayta ishga tushadi: ikki nusxa bir ishni bajaradi, dublikat yozuvlar paydo bo'ladi.

**Yechim.** Umumiy saqlashdagi qulf (Redis/DB) va `finally` da bo'shatish.

```php
public function __invoke(SymfonyStyle $io): int
{
    $lock = $this->lockFactory->createLock('import:daily', ttl: 900, autoRelease: false);

    if (!$lock->acquire()) {
        $io->warning('Oldingi nusxa hali ishlayapti.');

        return Command::SUCCESS;
    }

    try {
        foreach ($this->chunks() as $chunk) {
            $this->process($chunk);
            $lock->refresh();          // uzoq ishda TTL ni yangilash
        }
    } finally {
        $lock->release();
    }

    return Command::SUCCESS;
}
```

**Qachon kerak emas.** Bitta serverda ishlaydigan va tez tugaydigan buyruq — lekin qulf baribir arzon sug'urta.

**Bog'liq:** [25-bob](../25-console-va-scheduler.md), [28-bob](../28-cache-lock-httpclient.md).

---

## P-34 · Feature flag

**Muammo.** Yangi funksiya deploy qilindi, muammo chiqdi — butun relizni orqaga qaytarish kerak.

**Yechim.** Kodni chiqarish (deploy) va funksiyani yoqish (release) ajratiladi.

```php
final class FeatureFlags
{
    public function __construct(
        #[Autowire(env: 'json:FEATURE_FLAGS')]
        private array $flags,
    ) {
    }

    public function isEnabled(string $name): bool
    {
        return (bool) ($this->flags[$name] ?? false);
    }
}
```

```php
if ($this->flags->isEnabled('new_checkout')) {
    return $this->newCheckout($order);
}

return $this->legacyCheckout($order);
```

**Qoida:** flag — vaqtinchalik. Funksiya barqarorlashgach, flag va eski shox **o'chiriladi**; aks holda kod ikki karra murakkablashadi.

**Qachon kerak emas.** Kichik, xavfsiz o'zgarishlar.

**Bog'liq:** [40-bob](../40-deploy-va-checklist.md).

---

## P-35 · Holatsiz servis + `RequestStack`

**Muammo.** Servis konstruktorda `Request` oladi yoki ichida `$this->currentUser` saqlaydi. Worker rejimida (FrankenPHP, Swoole) bu ma'lumot **keyingi foydalanuvchiga oqadi**.

**Yechim.** Servis holatsiz; so'rovga bog'liq narsa `RequestStack` yoki `Security` orqali **chaqiruv paytida** olinadi.

```php
final class AuditLogger
{
    public function __construct(
        private RequestStack $requestStack,
        private Security $security,
        private LoggerInterface $logger,
    ) {
    }

    public function log(string $action): void
    {
        $this->logger->info('audit', [
            'action' => $action,
            'user' => $this->security->getUser()?->getUserIdentifier(),
            'ip' => $this->requestStack->getCurrentRequest()?->getClientIp(),
        ]);
    }
}
```

**Qachon kerak emas.** Hech qachon: holatli servis — vaqt bombasi.

**Bog'liq:** [05-bob](../05-service-container.md), [33-bob](../33-unumdorlik.md).

---

[← Asinxron ishlov](04-async.md) · [Katalog](README.md) · [Keyingi: Testlash →](06-testlash.md)
