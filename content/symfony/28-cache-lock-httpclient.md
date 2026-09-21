# 28 — Cache, Lock, Filesystem va HttpClient

[← Oldingi: EventDispatcher va Doctrine hodisalari](27-event-va-doctrine-hodisalari.md) · [Mundarija](README.md) · [Keyingi: Mailer va Notifier →](29-mailer-va-notifier.md)

---

## Cache

```php
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final class ExchangeRateProvider
{
    public function __construct(
        private CacheInterface $cache,
        private HttpClientInterface $client,
    ) {
    }

    public function getRate(string $currency): float
    {
        return $this->cache->get(
            'exchange_rate.'.$currency,
            function (ItemInterface $item) use ($currency): float {
                $item->expiresAfter(3600);

                return (float) $this->client
                    ->request('GET', '/rates/'.$currency)
                    ->toArray()['rate'];
            },
        );
    }
}
```

Bu — **Cache Contracts** interfeysi va u PSR-6 dan muhim farq qiladi: `get()` ichidagi callback faqat kesh bo'sh bo'lganda chaqiriladi va u **stampede himoyasi** bilan keladi.

> **Cache stampede** — mashhur kalitning muddati tugagan paytda yuzlab parallel so'rov bir vaqtda bazaga/tashqi API'ga uriladi. Symfony buni **erta qayta hisoblash** (probabilistic early expiration) bilan hal qiladi: kesh tugashiga yaqin **bitta** so'rov qiymatni oldindan yangilaydi, qolganlari eski qiymatni oladi. `$beta` parametri bu xatti-harakatni boshqaradi.

Teglar bilan invalidatsiya:

```php
use Symfony\Contracts\Cache\TagAwareCacheInterface;

$value = $this->cache->get('post.'.$id, function (ItemInterface $item) use ($id) {
    $item->tag(['posts', 'post-'.$id]);
    $item->expiresAfter(600);

    return $this->buildPostView($id);
});

$this->cache->invalidateTags(['post-'.$id]);   // post o'zgarganda
```

Pul konfiguratsiyasi:

```yaml
framework:
    cache:
        app: cache.adapter.redis_tag_aware
        default_redis_provider: '%env(REDIS_URL)%'
        pools:
            api.cache:
                adapter: cache.app
                default_lifetime: 300
```

```php
public function __construct(
    private TagAwareCacheInterface $apiCache,   // "api.cache" puli avtomatik bog'lanadi
) {
}
```

### Nimani keshlash kerak (va kerak emas)

| Keshlash mantiqli | Keshlash xavfli |
| --- | --- |
| Kam o'zgaradigan ma'lumot (kurslar, sozlamalar) | Foydalanuvchiga xos ma'lumot umumiy kalit bilan |
| Qimmat hisob (hisobot, agregatsiya) | Ruxsatga bog'liq ma'lumot |
| Tashqi API javoblari | To'lov holati, balans |

**Eng xavfli xato** — keshga foydalanuvchiga xos ma'lumotni umumiy kalit bilan yozish: bir foydalanuvchi ikkinchisining ma'lumotini ko'radi. Kalitda kontekstni aks ettiring: `invoice.'.$userId.'.'.$invoiceId`.

---

## Lock

```shell
composer require symfony/lock
```

```php
use Symfony\Component\Lock\LockFactory;

final class ReportGenerator
{
    public function __construct(private LockFactory $lockFactory)
    {
    }

    public function generateDaily(): void
    {
        $lock = $this->lockFactory->createLock('report.daily', ttl: 300, autoRelease: true);

        if (!$lock->acquire()) {
            return;   // boshqa jarayon allaqachon bajaryapti
        }

        try {
            // uzoq ish
            $lock->refresh();   // ish TTL dan uzoq bo'lsa, qulfni yangilash
        } finally {
            $lock->release();
        }
    }
}
```

```yaml
framework:
    lock: '%env(LOCK_DSN)%'    # masalan: redis://localhost yoki doctrine://default
```

**Muhim:** lokal fayl qulfi (`flock`) faqat **bitta serverda** ishlaydi. Bir nechta server yoki konteyner bo'lsa, qulf umumiy saqlashda (Redis, baza) bo'lishi kerak — aks holda "qulf bor" degan tasavvur bilan ikkita jarayon parallel ishlaydi.

Ikkinchi nozik nuqta — **TTL**. TTL juda qisqa bo'lsa, ish tugamasdan qulf bo'shaydi; juda uzun bo'lsa, jarayon o'lganda qulf uzoq vaqt bloklab turadi. Shuning uchun uzoq ishlarda `refresh()` ishlating.

---

## Filesystem va Finder

```php
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;

$fs = new Filesystem();
$fs->mkdir($dir, 0o775);
$fs->dumpFile($dir.'/report.csv', $content);   // atomik yozish (vaqtinchalik fayl + rename)
$fs->remove($oldDir);

$finder = new Finder();
$finder->files()->in($dir)->name('*.csv')->date('< now - 7 days');

foreach ($finder as $file) {
    $fs->remove($file->getRealPath());
}
```

`dumpFile()` — oddiy `file_put_contents()` dan yaxshiroq: u avval vaqtinchalik faylga yozadi, keyin atomik `rename` qiladi. Shuning uchun boshqa jarayon hech qachon yarim yozilgan faylni o'qimaydi.

---

## HttpClient

```php
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Component\DependencyInjection\Attribute\Target;

final class GithubApi
{
    public function __construct(
        #[Target('github')] private HttpClientInterface $client,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function getRepo(string $owner, string $repo): array
    {
        try {
            $response = $this->client->request('GET', \sprintf('/repos/%s/%s', $owner, $repo), [
                'timeout' => 5,
                'max_duration' => 10,
            ]);

            return $response->toArray();
        } catch (ClientExceptionInterface $e) {          // 4xx
            throw new RepoNotFound($owner, $repo, previous: $e);
        } catch (TransportExceptionInterface $e) {        // tarmoq/timeout
            throw new GithubUnavailable(previous: $e);
        }
    }
}
```

```yaml
framework:
    http_client:
        default_options:
            timeout: 5
            max_duration: 15
            retry_failed:
                max_retries: 2
                delay: 500
                multiplier: 2
                jitter: 0.2
                http_codes: [423, 425, 429, 502, 503, 504]

        scoped_clients:
            github:
                base_uri: 'https://api.github.com'
                headers:
                    Accept: 'application/vnd.github+json'
                    Authorization: 'Bearer %env(GITHUB_TOKEN)%'
```

Testda:

```php
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;

$client = new MockHttpClient(new MockResponse('{"id": 1}', ['http_code' => 200]));
$api = new GithubApi($client);
```

---

## Muhandislik nuqtai nazari: tashqi xizmat — bu ishonchsiz xizmat

Tashqi API bilan ishlashda quyidagilar **har doim** kerak, chunki tashqi xizmat sizning nazoratingizda emas:

**1. Timeout.** Standart timeout'siz so'rov — tizimingizni to'xtatishning eng oson yo'li. Tashqi xizmat sekin javob bersa, sizning PHP worker'laringiz band bo'ladi va butun sayt javob bermay qoladi ("cascading failure"). `timeout` (harakatsizlik) va `max_duration` (umumiy vaqt) — ikkalasini ham qo'ying.

**2. Retry + jitter.** Vaqtinchalik nosozlikda qayta urinish foydali, lekin **faqat idempotent so'rovlar uchun**: `GET` — bemalol; `POST` — faqat idempotentlik kaliti bilan ([38-bob](38-api-pro.md)). Jitter esa "retry bo'roni" ni oldini oladi.

**3. Circuit breaker g'oyasi.** Xizmat uzluksiz yiqilayotgan bo'lsa, unga urinishni vaqtincha to'xtatish kerak — aks holda siz o'zingizni ham, uni ham qiynaysiz. Symfony'da bu tayyor emas, lekin kesh + hisoblagich bilan sodda variantini yozish oson.

**4. Fallback va degradatsiya.** "Valyuta kursi API ishlamasa — oxirgi ma'lum kursni ko'rsatamiz" — foydalanuvchi uchun 500 xatodan yaxshiroq. Buni kesh bilan qilish mumkin (`stale-while-error` mantiqi).

**5. SSRF himoyasi.** Agar URL foydalanuvchidan kelsa (webhook manzili, rasm yuklash havolasi), `NoPrivateNetworkHttpClient` ishlating: aks holda hujumchi `http://169.254.169.254/` (bulut metadata xizmati) yoki ichki tarmoq manzillarini so'rashi mumkin. Bu — bulutli muhitdagi eng ko'p ekspluatatsiya qilinadigan zaifliklardan biri.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Timeout'siz HTTP so'rov | Worker'lar band bo'ladi, sayt to'xtaydi | `timeout` + `max_duration` |
| `POST` ni ko'r-ko'rona retry qilish | Ikki marta to'lov | Faqat idempotent so'rovlarda |
| Foydalanuvchiga xos ma'lumotni umumiy kalit bilan keshlash | Ma'lumot boshqa foydalanuvchiga ko'rinadi | Kalitda kontekst |
| Keshni invalidatsiyasiz qoldirish | Eskirgan ma'lumot | Teglar + `invalidateTags()` |
| Bir nechta serverda fayl qulfi | Qulf ishlamaydi | Redis/DB qulfi |
| `release()` ni `finally` da qilmaslik | Xatolikda qulf qolib ketadi | `try/finally` |
| Foydalanuvchi URL'iga to'g'ridan-to'g'ri so'rov | SSRF | `NoPrivateNetworkHttpClient` + allow-list |
| Testda haqiqiy HTTP so'rov | Sekin, beqaror, tashqi xizmatga bog'liq | `MockHttpClient` |

---

## Amaliyot

1. Tashqi API javobini keshlaydigan servis yozing (`CacheInterface::get()` + `expiresAfter`). Profiler'ning "Cache" panelida hit/miss ni ko'ring.
2. Teglar bilan invalidatsiya qo'shing: post yangilanganda unga tegishli kesh o'chsin.
3. `LockFactory` bilan kunlik hisobot buyrug'ini qulflang; ikkita nusxani parallel ishga tushirib, ikkinchisi darhol chiqib ketishini tasdiqlang.
4. `scoped_clients` bilan tashqi API mijozini sozlang va `#[Target]` orqali in'ektsiya qiling.
5. `MockHttpClient` bilan test yozing: 500 javobda sizning servisingiz mos istisno tashlashini tekshiring.

---

## Bog'liq patternlar

[P-31 Port/adapter, P-32 Himoya qobig'i, P-33 Qulflangan buyruq](patterns/05-xizmat-va-di.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Cache: <https://symfony.com/doc/current/cache.html>
- Cache Contracts va stampede: <https://symfony.com/doc/current/components/cache.html#cache-contracts>
- Lock: <https://symfony.com/doc/current/lock.html>
- Filesystem: <https://symfony.com/doc/current/components/filesystem.html>
- Finder: <https://symfony.com/doc/current/components/finder.html>
- HttpClient: <https://symfony.com/doc/current/http_client.html>

---

[← Oldingi: EventDispatcher va Doctrine hodisalari](27-event-va-doctrine-hodisalari.md) · [Mundarija](README.md) · [Keyingi: Mailer va Notifier →](29-mailer-va-notifier.md)
