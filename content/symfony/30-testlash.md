# 30 — Testlash

[← Oldingi: Mailer va Notifier](29-mailer-va-notifier.md) · [Mundarija](README.md) · [Keyingi: Twig va AssetMapper →](31-twig-va-asset.md)

---

## Uch daraja

```shell
composer require --dev symfony/test-pack
php bin/console make:test
```

| Tur | Bazaviy klass | Nimani tekshiradi | Tezlik |
| --- | --- | --- | --- |
| Unit | `PHPUnit\Framework\TestCase` | Bitta klass mantiqi, bog'liqliksiz | Juda tez |
| Integratsion | `KernelTestCase` | Servislar, container, baza | O'rtacha |
| Funksional | `WebTestCase` | To'liq HTTP oqimi | Sekin |

Loyihada uchalasi ham kerak, lekin **nisbat** muhim: ko'p unit, o'rtacha integratsion, kam funksional (test piramidasi). Sababi amaliy: funksional test butun stekni ishlatadi, shuning uchun sekin va yiqilganda sababni topish qiyin.

---

## Unit test — domen mantiqi uchun

```php
namespace App\Tests\Entity;

use App\Entity\Order;
use App\Enum\OrderStatus;
use PHPUnit\Framework\TestCase;

final class OrderTest extends TestCase
{
    public function testPayingPendingOrderMarksItPaid(): void
    {
        $order = new Order(/* ... */);
        $now = new \DateTimeImmutable('2026-09-21 10:00:00');

        $order->pay($now);

        self::assertSame(OrderStatus::Paid, $order->getStatus());
        self::assertEquals($now, $order->getPaidAt());
    }

    public function testPayingAlreadyPaidOrderThrows(): void
    {
        $order = new Order(/* ... */);
        $order->pay(new \DateTimeImmutable());

        $this->expectException(\DomainException::class);

        $order->pay(new \DateTimeImmutable());
    }
}
```

Entity'ning biznes metodlari uchun unit test — **eng arzon va eng foydali testlar**: ular millisekundlarda ishlaydi va domen qoidalarini himoya qiladi. Shu sababli domen mantiqini Doctrine va HTTP'dan ajratish ([15-bob](15-doctrine-asoslari.md)) shunchaki "toza kod" emas, testlanuvchanlik investitsiyasi.

---

## Integratsion test

```php
namespace App\Tests\Service;

use App\Service\PostCreator;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class PostCreatorTest extends KernelTestCase
{
    public function testCreatePersistsPost(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        $creator = $container->get(PostCreator::class);
        $post = $creator->create(new CreatePostInput('Sarlavha', 'Matn'));

        self::assertNotNull($post->getId());
    }
}
```

Testda **private servislar ham ochiq** — `static::getContainer()` maxsus test konteynerini qaytaradi ([05-bob](05-service-container.md)).

Tashqi bog'liqlikni almashtirish:

```php
$mailer = $this->createMock(MailerInterface::class);
$mailer->expects(self::once())->method('send');

$container->set(MailerInterface::class, $mailer);
```

---

## Funksional test

```php
namespace App\Tests\Controller;

use App\Factory\PostFactory;
use App\Factory\UserFactory;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Zenstruck\Foundry\Attribute\ResetDatabase;

#[ResetDatabase]
final class PostApiTest extends WebTestCase
{
    public function testListReturnsOnlyPublishedPosts(): void
    {
        PostFactory::new()->published()->many(3)->create();
        PostFactory::createOne();   // qoralama

        $client = static::createClient();
        $client->request('GET', '/api/posts');

        self::assertResponseIsSuccessful();
        self::assertResponseHeaderSame('content-type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true, flags: \JSON_THROW_ON_ERROR);
        self::assertCount(3, $data['items']);
        self::assertSame(3, $data['total']);
    }

    public function testCreateRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/posts', server: ['CONTENT_TYPE' => 'application/json'], content: '{}');

        self::assertResponseStatusCodeSame(401);
    }

    public function testCreateValidatesInput(): void
    {
        $client = static::createClient();
        $client->loginUser(UserFactory::createOne()->_real());

        $client->request('POST', '/api/posts', server: ['CONTENT_TYPE' => 'application/json'], content: '{"title": ""}');

        self::assertResponseStatusCodeSame(422);
    }
}
```

`loginUser()` — login formasini to'ldirish o'rniga foydalanuvchini to'g'ridan-to'g'ri autentifikatsiya qiladi. Har testda login oqimini takrorlash — sekin va mavzudan chalg'itadi.

Foydali assertion'lar:

```php
self::assertResponseIsSuccessful();
self::assertResponseStatusCodeSame(201);
self::assertResponseRedirects('/login');
self::assertResponseHeaderSame('content-type', 'application/json');
self::assertJson($client->getResponse()->getContent());
self::assertEmailCount(1);                    // Mailer
self::assertSelectorTextContains('h1', '...'); // HTML sahifalar uchun
```

---

## Testlarni tezlashtirish

**1. Har testdan keyin tranzaksiyani orqaga qaytarish:**

```shell
composer require --dev dama/doctrine-test-bundle
```

```xml
<!-- phpunit.dist.xml -->
<extensions>
    <bootstrap class="DAMA\DoctrineTestBundle\PHPUnit\PHPUnitExtension"/>
</extensions>
```

Har test avtomatik tranzaksiyada bajariladi va oxirida rollback qilinadi. Bazani qayta yaratish yoki tozalashdan **ancha tez**.

**2. Tashqi xizmatlarni soxtalashtiring.** `MockHttpClient` ([28-bob](28-cache-lock-httpclient.md)), `in-memory://` Messenger transporti ([26-bob](26-messenger.md)), Mailer test transporti.

**3. Parallel ishga tushiring** (ParaTest). Skeleton `doctrine.yaml` da allaqachon `dbname_suffix: '_test%env(default::TEST_TOKEN)%'` bor — bu har parallel jarayonga alohida baza beradi.

**4. Kerakmas `bootKernel()` dan saqlaning.** Sof mantiq testi uchun kernel kerak emas.

---

## Muhandislik nuqtai nazari: nimani testlash kerak

Testning qiymati — **regressiyani ushlash ehtimoli × buzilish narxi ÷ qo'llab-quvvatlash xarajati**. Shundan amaliy tartib chiqadi:

| Ustuvorlik | Nima | Nega |
| --- | --- | --- |
| 1 | Domen qoidalari va holat o'tishlari | Buzilsa — noto'g'ri ma'lumot, pul yo'qotish |
| 2 | Avtorizatsiya qoidalari (Voter) | Buzilsa — xavfsizlik hodisasi |
| 3 | API kontrakti (javob strukturasi, status kodlari) | Buzilsa — mijozlar sinadi |
| 4 | Murakkab so'rovlar va N+1 (so'rovlar soni) | Buzilsa — unumdorlik degradatsiyasi |
| 5 | Xato yo'llari (422, 404, 409) | Ular odatda qo'lda sinalmaydi |

Nimani testlamaslik kerak: getter/setter'lar, framework kodi, konfiguratsiya qiymatlari, va "mocklar mocklarni tekshiradigan" testlar.

**Mock'lar haqida qoida:** faqat **chegaradagi** narsalarni mock qiling (HTTP mijoz, to'lov provayderi, soat). O'z repository'ingizni mock qilish — testni implementatsiyaga bog'laydi va refaktoringda yiqiladi, lekin bag'ni ushlamaydi.

**Sanani mock qilish** — ko'p unutiladigan nuqta:

```php
use Symfony\Component\Clock\MockClock;

$clock = new MockClock('2026-09-21 10:00:00');
$service = new SubscriptionChecker($clock);
$clock->modify('+31 days');
```

Kodda `new \DateTimeImmutable()` o'rniga `ClockInterface` in'ektsiya qilsangiz, vaqtga bog'liq mantiqni deterministik test qilish mumkin bo'ladi.

**Test — hujjat.** Test nomi qoidani ifodalasin: `testPayingAlreadyPaidOrderThrows` — bir qarashda tushunarli. `testPay2` — foydasiz.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Faqat funksional test yozish | Sekin suite, xato sababini topish qiyin | Piramidani saqlang |
| Testlar bir-biriga bog'liq (tartibga sezgir) | Beqaror, tushunarsiz yiqilishlar | Har test o'z ma'lumotini yaratsin |
| Testda haqiqiy HTTP/SMTP | Sekin, tashqi xizmatga bog'liq | Mock transportlar |
| `sleep()` bilan vaqt kutish | Sekin va beqaror | `MockClock` |
| Getter/setter testlari | Qiymat yo'q, qo'llab-quvvatlash xarajati bor | Mantiqni testlang |
| Repository'ni mock qilish | Refaktoringda yiqiladi, bag'ni topmaydi | Haqiqiy baza + `dama` bundle |
| Bazani har testda qayta yaratish | Suite daqiqalarga cho'ziladi | Tranzaksiya + rollback |
| Testsiz "tez tuzatish" | Xuddi shu bag qaytadi | Avval yiqiladigan test yozing |

---

## Amaliyot

1. `Order::pay()` uchun ikkita unit test yozing (muvaffaqiyat va istisno).
2. `PostCreator` uchun `KernelTestCase` bilan integratsion test yozing.
3. `PostApiTest` ni yozing: ro'yxat, 401, 422 holatlari.
4. `dama/doctrine-test-bundle` ni o'rnating va suite vaqti qanday o'zgarganini o'lchang (`time php bin/phpunit`).
5. So'rovlar sonini tekshiradigan test qo'shing (`$client->enableProfiler()` + `db` kollektori) — N+1 regressiyasidan himoya.

---

## Bog'liq patternlar

[P-36 Test ma'lumoti, P-37 Chegarani mock qilish, P-38 So'rovlar soni testi](patterns/06-testlash.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Testlash: <https://symfony.com/doc/current/testing.html>
- Funksional testlar va assertion'lar: <https://symfony.com/doc/current/testing.html#application-tests>
- Bazani testlarda sozlash: <https://symfony.com/doc/current/testing/database.html>
- Profiler testlarda: <https://symfony.com/doc/current/testing/profiling.html>
- Clock komponenti: <https://symfony.com/doc/current/components/clock.html>

---

[← Oldingi: Mailer va Notifier](29-mailer-va-notifier.md) · [Mundarija](README.md) · [Keyingi: Twig va AssetMapper →](31-twig-va-asset.md)
