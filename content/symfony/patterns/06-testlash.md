# Patternlar: testlash

[← Xizmatlar va DI](05-xizmat-va-di.md) · [Katalog](README.md) · [Keyingi: Antipatternlar →](07-antipatternlar.md)

---

## P-36 · Test o'z ma'lumotini o'zi quradi

**Muammo.** Barcha testlar bitta global fixtures to'plamiga tayanadi. Bitta fixture o'zgarsa — 40 ta test yiqiladi va qaysi test qaysi yozuvga bog'liqligini hech kim bilmaydi.

**Yechim.** Factory + holatlar; test faqat **o'ziga kerakli** narsani yaratadi.

```php
#[ResetDatabase]
final class PostApiTest extends WebTestCase
{
    public function testOnlyPublishedPostsAreListed(): void
    {
        PostFactory::new()->published()->many(3)->create();
        PostFactory::createOne();                       // qoralama — ro'yxatda bo'lmasligi kerak

        $client = static::createClient();
        $client->request('GET', '/api/posts');

        $data = json_decode($client->getResponse()->getContent(), true, flags: \JSON_THROW_ON_ERROR);
        self::assertCount(3, $data['items']);
    }
}
```

**Qachon kerak emas.** Katta demo ma'lumotlar to'plami (dev muhiti uchun) — u fixtures bo'lib qolaveradi.

**Bog'liq:** [19-bob](../19-fixtures.md), [30-bob](../30-testlash.md).

---

## P-37 · Faqat chegarani mock qiling

**Muammo.** Repository, EntityManager va domen servislari mock qilinadi; test aslida mock'larning o'zaro chaqiruvini tekshiradi. Refaktoringda yiqiladi, haqiqiy bagni esa ushlamaydi.

**Yechim.** Mock — faqat **tizim chegarasida**: tashqi HTTP, SMTP, to'lov, soat, tasodifiy son. Qolganiga haqiqiy implementatsiya.

```php
$client = new MockHttpClient(new MockResponse('{"rate": 12500}', ['http_code' => 200]));
$provider = new ExchangeRateProvider($client);

self::assertSame(12500.0, $provider->getRate('USD'));
```

```php
// Xatolik yo'lini ham sinang
$client = new MockHttpClient(new MockResponse('', ['http_code' => 503]));
$this->expectException(RatesUnavailable::class);
```

**Qachon kerak emas.** Integratsion testda haqiqiy bazadan foydalaning — `dama/doctrine-test-bundle` uni tez qiladi.

**Bog'liq:** [30-bob](../30-testlash.md), [28-bob](../28-cache-lock-httpclient.md).

---

## P-38 · So'rovlar sonini testlash

**Muammo.** Kimdir `addSelect('a')` ni olib tashlaydi — N+1 qaytadi. Testlar yashil, chunki natija to'g'ri; faqat 40 barobar sekin.

**Yechim.** Profiler kollektoridan so'rovlar sonini o'qing va chegarani tasdiqlang.

```php
public function testListDoesNotTriggerNPlusOne(): void
{
    PostFactory::createMany(20);

    $client = static::createClient();
    $client->enableProfiler();
    $client->request('GET', '/api/posts');

    $collector = $client->getProfile()->getCollector('db');
    self::assertLessThan(6, $collector->getQueryCount());
}
```

**Qachon kerak emas.** Kichik ichki instrumentlarda — lekin kritik ro'yxat endpointlarida bu test o'zini bir necha bor oqlaydi.

**Bog'liq:** [18-bob](../18-aloqalar.md), [33-bob](../33-unumdorlik.md).

---

## P-39 · Kontrakt testi (javob shakli)

**Muammo.** Serializer guruhiga yangi maydon tushib qoldi yoki maydon nomi o'zgardi — mijozlar sinadi, sizda hamma narsa yashil.

**Yechim.** Javobning **kalitlar to'plamini** aniq tekshiring, faqat qiymatlarni emas.

```php
public function testPostResponseShape(): void
{
    $post = PostFactory::new()->published()->create();

    $client = static::createClient();
    $client->request('GET', '/api/posts/'.$post->getId());

    $data = json_decode($client->getResponse()->getContent(), true, flags: \JSON_THROW_ON_ERROR);

    self::assertSame(
        ['id', 'title', 'status', 'publishedAt'],
        array_keys($data),
    );
    self::assertMatchesRegularExpression('/^\d{4}-\d{2}-\d{2}T/', $data['publishedAt']);
}
```

Shunda **qo'shimcha maydon ham** testni yiqitadi — ya'ni tasodifan sizib chiqqan ichki ma'lumot darhol ko'rinadi.

**Qachon kerak emas.** Ichki, tez o'zgaradigan endpointlar.

**Bog'liq:** [20-bob](../20-serializer-va-dto.md), [38-bob](../38-api-pro.md).

---

## P-40 · Ruxsat matritsasi testi

**Muammo.** Voter mantiqi o'zgardi va begona foydalanuvchi boshqa odamning yozuvini tahrirlay oladigan bo'lib qoldi. Bu — xavfsizlik hodisasi, va uni qo'lda sinash unutiladi.

**Yechim.** Har himoyalangan amal uchun to'rt holatni ketma-ket tekshiring: **egasi, begona, admin, anonim**.

```php
/**
 * @return \Generator<string, array{0: string, 1: int}>
 */
public static function accessProvider(): \Generator
{
    yield 'egasi' => ['owner', 200];
    yield 'begona' => ['stranger', 403];
    yield 'admin' => ['admin', 200];
    yield 'anonim' => ['anonymous', 401];
}

#[DataProvider('accessProvider')]
public function testEditAccess(string $actor, int $expectedStatus): void
{
    // ... $actor bo'yicha login qilish ...
    self::assertResponseStatusCodeSame($expectedStatus);
}
```

**Qachon kerak emas.** Ochiq (public) endpointlar.

**Bog'liq:** [23-bob](../23-avtorizatsiya.md).

---

## P-41 · Vaqtni boshqarish

**Muammo.** "30 kundan keyin obuna tugaydi" mantiqi `sleep()` bilan sinaladi yoki umuman sinalmaydi; oyning oxirida test yiqiladi.

**Yechim.** `ClockInterface` in'ektsiyasi ([P-15](02-domen.md#p-15--vaqtni-inektsiya-qilish-clock)) + testda `MockClock`.

```php
use Symfony\Component\Clock\MockClock;

public function testSubscriptionExpiresAfter30Days(): void
{
    $clock = new MockClock('2026-01-01 00:00:00');
    $subscription = new Subscription($clock->now());
    $checker = new SubscriptionChecker($clock);

    self::assertFalse($checker->isExpired($subscription));

    $clock->modify('+31 days');

    self::assertTrue($checker->isExpired($subscription));
}
```

**Qachon kerak emas.** Vaqt natijaga ta'sir qilmasa.

**Bog'liq:** [30-bob](../30-testlash.md).

---

[← Xizmatlar va DI](05-xizmat-va-di.md) · [Katalog](README.md) · [Keyingi: Antipatternlar →](07-antipatternlar.md)
