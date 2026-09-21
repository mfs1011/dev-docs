# 38 — API pro: idempotentlik, ETag, webhook, OpenAPI, versiyalash

[← Oldingi: Ilg'or Doctrine](37-ilgor-doctrine.md) · [Mundarija](README.md) · [Keyingi: Arxitektura →](39-arxitektura.md)

---

## Idempotentlik

Mijoz `POST /api/payments` yubordi, tarmoq uzildi, javob kelmadi. Mijoz qayta yubordi. Natija — ikkita to'lov.

Yechim — **idempotentlik kaliti**: mijoz har amal uchun noyob kalit yuboradi; server bir xil kalitli takroriy so'rovga **birinchi natijani** qaytaradi.

```php
namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestHeader;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

final class PaymentController extends AbstractController
{
    #[Route('/api/payments', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreatePaymentInput $input,
        #[MapRequestHeader(name: 'idempotency-key')] string $idempotencyKey,
        PaymentCreator $creator,
        CacheInterface $cache,
    ): JsonResponse {
        $payload = $cache->get(
            'idempotency.'.hash('sha256', $idempotencyKey),
            function (ItemInterface $item) use ($input, $creator): array {
                $item->expiresAfter(86400);

                return PaymentView::fromEntity($creator->create($input))->toArray();
            },
        );

        return new JsonResponse($payload, Response::HTTP_CREATED);
    }
}
```

Amalda ishonchli implementatsiya **bazada** bo'ladi (noyob indeks + holat), chunki kesh yo'qolishi mumkin va parallel so'rovlarda poyga bo'ladi. Minimal sxema:

| Ustun | Ma'nosi |
| --- | --- |
| `key` (unique) | Mijoz bergan kalit |
| `request_hash` | So'rov tanasining xeshi — bir kalit bilan boshqa so'rov yuborilsa 422 |
| `status` | `in_progress` / `completed` |
| `response_body`, `response_status` | Takroriy so'rovga qaytariladigan natija |

Bu — to'lov tizimlarining (Stripe va shunga o'xshash) standart yondashuvi.

---

## Shartli so'rovlar: ETag va 304

```php
#[Route('/api/posts/{id}', methods: ['GET'])]
public function show(Post $post, Request $request): JsonResponse
{
    $response = $this->json(PostView::fromEntity($post));
    $response->setEtag(md5($post->getUpdatedAt()->format('U').$post->getId()));
    $response->setPublic();
    $response->setMaxAge(0);
    $response->headers->addCacheControlDirective('must-revalidate');

    if ($response->isNotModified($request)) {
        return $response;       // 304, tana yo'q
    }

    return $response;
}
```

ETag ikki vazifani bajaradi:

1. **Trafikni tejash** — o'zgarmagan resurs uchun tana yuborilmaydi.
2. **Yo'qotilgan yangilanish muammosini hal qilish** — shartli yozish orqali:

```
PUT /api/posts/42
If-Match: "a1b2c3"
```

Server ETag mos kelmasa **412 Precondition Failed** qaytaradi. Bu — HTTP darajasidagi optimistik qulflash ([37-bob](37-ilgor-doctrine.md)).

---

## Webhook'lar

### Yuborayotganda

```php
$payload = json_encode($event, \JSON_THROW_ON_ERROR);
$timestamp = time();
$signature = hash_hmac('sha256', $timestamp.'.'.$payload, $secret);

$this->httpClient->request('POST', $subscriber->getUrl(), [
    'headers' => [
        'Content-Type' => 'application/json',
        'X-Signature' => 'v1='.$signature,
        'X-Timestamp' => (string) $timestamp,
    ],
    'body' => $payload,
    'timeout' => 5,
]);
```

Talablar ro'yxati:

- **Imzo** (HMAC) — qabul qiluvchi haqiqiyligini tekshirishi uchun.
- **Timestamp** — replay hujumidan himoya (eski imzoni qayta ishlatish).
- **Qayta urinish** eksponensial kechikish bilan (Messenger retry) va oxirida "o'lik" holatga o'tkazish.
- **Timeout** — sekin qabul qiluvchi sizning worker'laringizni band qilmasligi kerak ([28-bob](28-cache-lock-httpclient.md)).
- **Yetkazib berish jurnali** — qaysi hodisa, qachon, qanday javob bilan.

### Qabul qilayotganda

```php
#[Route('/webhooks/stripe', methods: ['POST'])]
public function stripe(Request $request): Response
{
    $payload = $request->getContent();
    $expected = hash_hmac('sha256', $payload, $this->webhookSecret);

    if (!hash_equals($expected, $request->headers->get('X-Signature', ''))) {
        return new Response(status: Response::HTTP_UNAUTHORIZED);
    }

    $this->bus->dispatch(new ProcessWebhook($payload));

    return new Response(status: Response::HTTP_ACCEPTED);   // 202: qabul qildik
}
```

Uch qoida: **`hash_equals()`** (timing attack), **tez javob qaytarish** (ishni navbatga qo'yib), **idempotent ishlov** (provayderlar bir hodisani bir necha marta yuborishi normal).

> Symfony'da `symfony/webhook` va `symfony/remote-event` komponentlari ham bor — ular mashhur provayderlar uchun tayyor parser va listener mexanizmini beradi.

---

## Versiyalash

| Strategiya | Ko'rinishi | Baho |
| --- | --- | --- |
| URL prefiksi | `/api/v1/posts` | Oddiy, debug oson, keshlanadi — **amalda eng ko'p ishlatiladi** |
| Media tip | `Accept: application/vnd.app.v2+json` | "Toza", lekin murakkab; kesh sozlamalari nozik |
| Sarlavha | `X-API-Version: 2` | Standart emas, proxy'lar e'tiborsiz qoldirishi mumkin |

Amaliy tavsiya: URL prefiksi + **additive o'zgarishlar siyosati**. Ya'ni yangi maydon qo'shish, ixtiyoriy parametr qo'shish — versiyani oshirmaydi; maydon o'chirish, nom o'zgartirish, semantikani o'zgartirish — yangi versiya talab qiladi.

Eski versiyani o'chirish rejasi: e'lon → `Deprecation` va `Sunset` sarlavhalari → monitoring (kim hali ishlatyapti) → o'chirish.

---

## OpenAPI hujjat

```shell
composer require nelmio/api-doc-bundle
```

```yaml
# config/packages/nelmio_api_doc.yaml
nelmio_api_doc:
    documentation:
        info:
            title: Blog API
            version: 1.0.0
    areas:
        path_patterns: ['^/api(?!/doc$)']
```

Bundle route'lar, DTO'lar va validatsiya cheklovlaridan spetsifikatsiyani **avtomatik** yasaydi. Qo'lda yozilgan hujjat ikki haftada eskiradi; generatsiya qilingan hujjat kod bilan birga yangilanadi.

Spetsifikatsiyadan keyin olinadigan foyda: mijoz SDK generatsiyasi, Postman kolleksiyasi, kontrakt testlari, va API dizaynini ko'rib chiqish imkoniyati.

---

## Muhandislik nuqtai nazari: ishonchli API kontrakti

Ommaviy API — bu **taqsimlangan tizimdagi interfeys**, ya'ni unda quyidagi savollar oldindan javobini topishi kerak:

1. **Takroriy so'rovda nima bo'ladi?** → idempotentlik.
2. **Bir vaqtda ikki yangilash bo'lsa?** → ETag/`If-Match` yoki versiya.
3. **Mijoz juda ko'p so'rasa?** → rate limit + `Retry-After` ([21-bob](21-rest-api.md)).
4. **Xato bo'lsa mijoz nima qiladi?** → barqaror xato kodlari va formati ([24-bob](24-xatolik-va-log.md)).
5. **Kontrakt o'zgarsa?** → versiyalash va deprecation siyosati.

Bularning har biri texnik jihatdan sodda, lekin **keyin qo'shish qiyin**: idempotentlikni API ishga tushgandan keyin kiritish — barcha mijozlarni o'zgartirishni talab qiladi.

Yana bir nuqta — **kuzatuvchanlik API darajasida**: har javobga `X-Request-Id` qo'shing va uni xato javobida ham qaytaring. Mijoz "so'rov ID si falon, nima bo'ldi?" deb yozganda, siz loglardan bir soniyada topasiz.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Idempotentlikni hisobga olmaslik | Takroriy to'lov/buyurtma | Idempotency key + baza |
| Imzoni `===` bilan solishtirish | Timing attack | `hash_equals()` |
| Webhook'ni sinxron qayta ishlash | Provayder timeout deb hisoblaydi va qayta yuboradi | 202 + navbat |
| Versiyalashsiz API | Birinchi buzuvchi o'zgarishda muammo | `/v1/` + siyosat |
| Hujjatni qo'lda yozish | Tezda eskiradi | OpenAPI generatsiyasi |
| `Retry-After` bermasdan 429 qaytarish | Mijoz qachon urinishni bilmaydi | Sarlavha qo'shing |
| ETag'ni tasodifiy qiymatdan yasash | Har javobda o'zgaradi, kesh ishlamaydi | `updatedAt` + ID dan barqaror xesh |
| Deprecation'siz endpoint o'chirish | Mijozlar sinadi | E'lon + `Sunset` + monitoring |

---

## Amaliyot

1. `Idempotency-Key` sarlavhasini qabul qiladigan `POST` endpoint yozing (avval kesh bilan, keyin baza bilan).
2. `GET` endpointga ETag qo'shing va `curl -H 'If-None-Match: ...'` bilan 304 oling.
3. `PUT` uchun `If-Match` tekshiruvini qo'shing va mos kelmaganda 412 qaytaring.
4. HMAC imzoli webhook yuboruvchi va qabul qiluvchi yozing; imzoni buzib, 401 kelishini tasdiqlang.
5. NelmioApiDocBundle'ni o'rnating, `/api/doc` ni oching va DTO'laringiz sxemaga to'g'ri tushganini tekshiring.

---

## Rasmiy hujjat

- Rate Limiter: <https://symfony.com/doc/current/rate_limiter.html>
- HTTP kesh va validatsiya: <https://symfony.com/doc/current/http_cache/validation.html>
- Webhook komponenti: <https://symfony.com/doc/current/webhook.html>
- RemoteEvent: <https://symfony.com/doc/current/remote_event.html>
- NelmioApiDocBundle: <https://symfony.com/bundles/NelmioApiDocBundle/current/index.html>
- RFC 9457 (Problem Details): <https://www.rfc-editor.org/rfc/rfc9457>

---

[← Oldingi: Ilg'or Doctrine](37-ilgor-doctrine.md) · [Mundarija](README.md) · [Keyingi: Arxitektura →](39-arxitektura.md)
