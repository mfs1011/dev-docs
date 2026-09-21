# 05 — Service container va autowiring

[← Oldingi: So'rovning hayot sikli](04-sorov-hayot-sikli.md) · [Mundarija](README.md) · [Keyingi: Container — chuqur qatlam →](06-container-chuqur.md)

---

## Tushuncha: servis va konteyner

**Servis** — biror ishni bajaradigan ob'ekt: logger, mailer, repository, narx hisoblovchi. **Konteyner** — shu ob'ektlarni qanday yaratishni biladigan va ularni bir-biriga ulab beradigan registr.

Muammo, u yechadigan:

```php
// ❌ Klass o'z bog'liqligini o'zi yaratadi
final class InvoiceGenerator
{
    public function generate(Order $order): string
    {
        $formatter = new PdfFormatter();      // qattiq bog'langan
        $logger = new FileLogger('/var/log'); // testda almashtirib bo'lmaydi
        // ...
    }
}
```

```php
// ✅ Bog'liqliklar tashqaridan beriladi
final class InvoiceGenerator
{
    public function __construct(
        private FormatterInterface $formatter,
        private LoggerInterface $logger,
    ) {
    }

    public function generate(Order $order): string
    {
        $this->logger->info('Generating invoice', ['order' => $order->getId()]);

        return $this->formatter->format($order);
    }
}
```

Ikkinchi variantda klass **nimaga muhtojligini e'lon qiladi**, lekin **kim buni beradi — bilmaydi**. Bu Dependency Inversion: yuqori darajadagi kod konkret implementatsiyaga emas, abstraksiyaga bog'lanadi.

---

## Standart konfiguratsiya va u nima degani

```yaml
# config/services.yaml
services:
    _defaults:
        autowire: true      # konstruktor tiplari bo'yicha avtomatik in'ektsiya
        autoconfigure: true # interfeys/atribut bo'yicha avtomatik teglash

    App\:
        resource: '../src/'
```

Bu uch qator quyidagini anglatadi: **`src/` dagi har bir klass avtomatik servisga aylanadi**, servis ID si — to'liq klass nomi (`App\Service\InvoiceGenerator`).

- `autowire` — konstruktor argumentlarining **tiplarini** o'qib, mos servisni topadi.
- `autoconfigure` — klass nima ekanini "taniydi": `EventSubscriberInterface` → event subscriber; `#[AsCommand]` → console buyruq; `#[AsMessageHandler]` → Messenger handler. Siz teg yozmaysiz.

Kerakmas fayllarni chiqarib tashlash:

```yaml
services:
    App\:
        resource: '../src/'
        exclude:
            - '../src/Entity/'      # entity — servis emas, ma'lumot
            - '../src/Dto/'
            - '../src/Kernel.php'
```

**Nega Entity servis bo'lmasligi kerak?** Servis — bitta nusxada yashaydigan, holatsiz (stateless) bajaruvchi. Entity esa har safar yangi, holati bor ma'lumot ob'ekti. Ularni aralashtirish container'ni ma'nosiz shishiradi va xatolarga olib keladi.

---

## Autowiring qanday ishlaydi

Konteyner konstruktorning **tip e'lonini** ko'radi va shu tipga mos servisni qidiradi:

```shell
php bin/console debug:autowiring
php bin/console debug:autowiring logger     # filtr
```

Qoida oddiy: `Psr\Log\LoggerInterface` uchun alias bor → `monolog.logger` servisi. Agar sizning interfeysingizni **faqat bitta** klass implement qilsa, Symfony alias'ni o'zi yaratadi:

```php
interface FormatterInterface { public function format(Order $order): string; }

final class PdfFormatter implements FormatterInterface { /* ... */ }
// Boshqa implementatsiya yo'q → FormatterInterface avtomatik PdfFormatter'ga bog'lanadi
```

Ikkita implementatsiya paydo bo'lsa, avtomatik bog'lanish to'xtaydi va siz aniqlik kiritishingiz kerak:

```php
use Symfony\Component\DependencyInjection\Attribute\AsAlias;

#[AsAlias(FormatterInterface::class)]   // "standart" implementatsiya shu
final class PdfFormatter implements FormatterInterface {}
```

yoki chaqiruv joyida:

```php
use Symfony\Component\DependencyInjection\Attribute\Autowire;

public function __construct(
    #[Autowire(service: 'App\Formatter\HtmlFormatter')]
    private FormatterInterface $formatter,
) {
}
```

---

## Skalyar qiymatlar, parametrlar va env

Tip e'loni `string` bo'lsa, autowiring yordam berolmaydi — qaysi satr kerakligini bilmaydi. Uch xil yechim:

```php
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class SiteUpdater
{
    public function __construct(
        private MailerInterface $mailer,

        #[Autowire('manager@example.com')]          // to'g'ridan-to'g'ri qiymat
        private string $adminEmail,

        #[Autowire(param: 'app.contents_dir')]      // container parametri
        private string $contentsDir,

        #[Autowire(env: 'GITHUB_TOKEN')]            // muhit o'zgaruvchisi
        private string $githubToken,
    ) {
    }
}
```

YAML varianti (bir xil natija):

```yaml
services:
    App\Service\SiteUpdater:
        arguments:
            $adminEmail: 'manager@example.com'
            $contentsDir: '%app.contents_dir%'
            $githubToken: '%env(GITHUB_TOKEN)%'
```

Bir nechta servisga bir xil qiymat kerak bo'lsa — `bind`:

```yaml
services:
    _defaults:
        autowire: true
        autoconfigure: true
        bind:
            string $projectDir: '%kernel.project_dir%'
            $adminEmail: '%app.admin_email%'
```

**Qaysi birini tanlash kerak?** Amaliy qoida: qiymat shu klassga tegishli bo'lsa — `#[Autowire]` (kod va konfiguratsiya yonma-yon turadi, o'qish oson). Qiymat butun ilovaga tegishli bo'lsa — `bind` yoki parametr.

---

## Public va private servislar

Sukut bo'yicha barcha servislar **private**. Ya'ni `$container->get(InvoiceGenerator::class)` ishlamaydi.

**Nega?** Uch sabab:

1. **Kompilyatsiya optimizatsiyasi** — hech kim tashqaridan so'ramasa, konteyner servisni inline qilishi yoki butunlay olib tashlashi mumkin.
2. **Arxitektura intizomi** — `$container->get()` — bu Service Locator anti-patterni: klassning haqiqiy bog'liqliklari konstruktorda ko'rinmay qoladi.
3. **Erta xato** — ishlatilmayotgan servis kompilyatsiyada aniqlanadi.

Testda servisga kirish kerak bo'lsa, maxsus test konteyneri bor ([30-bob](30-testlash.md)):

```php
$container = static::getContainer();     // testda private servislar ham ochiq
$generator = $container->get(InvoiceGenerator::class);
```

---

## Muhandislik nuqtai nazari: DI nima beradi va narxi nima

**Beradigani:**

- **Testlanuvchanlik.** Soxta (`fake`/`mock`) implementatsiyani konstruktorga berasiz — HTTP, SMTP, to'lov tizimi testda umuman chaqirilmaydi.
- **Almashtiriluvchanlik.** `FormatterInterface` ni PDF'dan HTML'ga o'tkazish — bitta atribut o'zgarishi.
- **Yagona javobgarlik.** Konstruktordagi 8 ta argument — bu klass juda ko'p ish qilayotganining eng aniq signali. DI dizayn muammosini ko'rinadigan qiladi.
- **Hayot sikli boshqaruvi.** Servis bir marta yaratiladi va qayta ishlatiladi; kim qachon yaratilishini konteyner hal qiladi.

**Narxi:**

- **Bilvositalilik.** "Bu interfeys aslida qaysi klass?" — `debug:autowiring` javob beradi, lekin qo'shimcha qadam.
- **Global holat vasvasasi.** Konteynerni servisga in'ektsiya qilish (`ContainerInterface $container`) — DI'ning ma'nosini yo'q qiladi. Buni qilmang.

**Muhim chegara:** konteyner *servislar* uchun, *ma'lumotlar* uchun emas. `Order`, `User`, DTO — konteynerdan olinmaydi; ular kod ichida `new` bilan yoki repository orqali yaratiladi. Ko'p yangi boshlovchi shu chegarani noto'g'ri chizadi.

Yana bir senior darajadagi nuance — **servislar holatsiz bo'lishi kerak**. Servis bir marta yaratilib, butun so'rov davomida (Swoole/FrankenPHP worker rejimida esa **bir nechta so'rov davomida**) yashaydi. Servisga so'rovga bog'liq holat yozsangiz, u keyingi foydalanuvchiga "oqib" ketishi mumkin. So'rov ma'lumoti kerak bo'lsa — `RequestStack` in'ektsiya qiling, `Request` ni emas.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `ContainerInterface` ni servisga in'ektsiya qilish | Yashirin bog'liqlik, test qiyin, Service Locator anti-pattern | Aniq bog'liqliklarni konstruktorda so'rang |
| `new SomeService(...)` ni kod ichida yozish | Konteyner chetlab o'tiladi, konfiguratsiya va decorator ishlamaydi | Konstruktor orqali in'ektsiya |
| Servisga so'rovga bog'liq holat saqlash | Worker rejimida ma'lumot boshqa foydalanuvchiga oqadi | Holatsiz servis + `RequestStack` |
| Entity'ni `exclude` qilmaslik | Container ma'nosiz shishadi, autowire chalkashadi | `exclude: ['../src/Entity/', '../src/Dto/']` |
| Ikkita implementatsiyada `#[AsAlias]` yoki `#[Autowire]` qo'ymaslik | `Cannot autowire service ... multiple candidates` | Standartni `#[AsAlias]` bilan belgilang |
| Hamma servisni `public: true` qilish | Optimizatsiya yo'qoladi, `get()` vasvasasi qoladi | Faqat haqiqatan kerak bo'lsa |
| `debug:container` o'rniga taxmin qilish | Vaqt yo'qotish | `debug:container`, `debug:autowiring`, `lint:container` |

---

## Amaliyot

1. `src/Service/SlugGenerator.php` yarating: `AsciiSlugger` ni (`symfony/string`) in'ektsiya qilib, `generate(string $title): string` metodini yozing.
2. `php bin/console debug:container App\\Service\\SlugGenerator` bilan servis ta'rifini ko'ring: autowired argumentlar ro'yxatini o'qing.
3. `FormatterInterface` va ikkita implementatsiya yarating. Avval xatoni ko'ring (`multiple candidates`), keyin `#[AsAlias]` bilan hal qiling.
4. `parameters: app.admin_email: 'admin@example.com'` qo'shing va uni `#[Autowire(param: ...)]` bilan servisga uzating.
5. `php bin/console lint:container` ni ishga tushiring va uni CI bosqichlari ro'yxatiga qo'shishni rejalashtiring ([40-bob](40-deploy-va-checklist.md)).

---

## Rasmiy hujjat

- Service container: <https://symfony.com/doc/current/service_container.html>
- Autowiring: <https://symfony.com/doc/current/service_container/autowiring.html>
- `#[Autowire]` atributi: <https://symfony.com/doc/current/service_container/autowiring.html#autowiring-other-values>
- Best practices (servislar): <https://symfony.com/doc/current/best_practices.html#business-logic>

---

[← Oldingi: So'rovning hayot sikli](04-sorov-hayot-sikli.md) · [Mundarija](README.md) · [Keyingi: Container — chuqur qatlam →](06-container-chuqur.md)
