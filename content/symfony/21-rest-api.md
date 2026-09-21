# 21 — REST API: qo'lda va API Platform

[← Oldingi: Serializer va DTO](20-serializer-va-dto.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](22-xavfsizlik.md)

---

## Ikki yo'l

| Yondashuv | Nima beradi | Narxi |
| --- | --- | --- |
| **Qo'lda** (controller + DTO + serializer) | To'liq nazorat, aniq kod, oson debug | Har endpoint uchun kod yozasiz |
| **API Platform** | CRUD, filtr, paginatsiya, OpenAPI, GraphQL — deyarli bepul | O'rganish, konvensiyalar, "sehr"ni nazorat qilish |

Amaliy tavsiya: **kichik va o'ziga xos API** — qo'lda; **ko'p resursli CRUD-og'ir API** — API Platform. Bu bobda asosan qo'lda yondashuv ko'rsatiladi, chunki u ostidagi tushunchalarni (paginatsiya, filtr, xato formati) API Platform ham xuddi shunday hal qiladi.

---

## To'liq resurs kontrolleri

```php
namespace App\Controller\Api;

use App\Dto\CreatePostInput;
use App\Dto\PostListQuery;
use App\Dto\PostView;
use App\Entity\Post;
use App\Repository\PostRepository;
use App\Service\PostCreator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/posts', name: 'api_post_')]
final class PostController extends AbstractController
{
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(
        #[MapQueryString] ?PostListQuery $query,
        PostRepository $posts,
    ): JsonResponse {
        $query ??= new PostListQuery();
        $paginator = $posts->paginate($query);

        return $this->json([
            'items' => array_map(PostView::fromEntity(...), iterator_to_array($paginator)),
            'page' => $query->page,
            'perPage' => $query->perPage,
            'total' => count($paginator),
        ]);
    }

    #[Route('/{id<\d+>}', name: 'show', methods: ['GET'])]
    public function show(Post $post): JsonResponse
    {
        return $this->json(PostView::fromEntity($post));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] CreatePostInput $input,
        PostCreator $creator,
    ): JsonResponse {
        $post = $creator->create($input);

        return $this->json(
            PostView::fromEntity($post),
            Response::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_post_show', ['id' => $post->getId()])],
        );
    }

    #[Route('/{id<\d+>}', name: 'delete', methods: ['DELETE'])]
    public function delete(Post $post, PostRemover $remover): JsonResponse
    {
        $remover->remove($post);

        return new JsonResponse(null, Response::HTTP_NO_CONTENT);
    }
}
```

So'rov parametrlari uchun DTO:

```php
namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final class PostListQuery
{
    public function __construct(
        #[Assert\Positive]
        public int $page = 1,

        #[Assert\Range(min: 1, max: 100)]
        public int $perPage = 20,

        #[Assert\Choice(choices: ['draft', 'published'])]
        public ?string $status = null,

        #[Assert\Choice(choices: ['createdAt', '-createdAt', 'title', '-title'])]
        public string $sort = '-createdAt',
    ) {
    }
}
```

**`perPage` ga yuqori chegara qo'yish shart.** Aks holda mijoz `?perPage=1000000` yuborib, bazani va serverni qulatadi. Bu shunchaki validatsiya emas — bu mavjudlik (availability) himoyasi.

---

## Ro'yxat javobi formati

```json
{
  "items": [ { "id": 1, "title": "..." } ],
  "page": 2,
  "perPage": 20,
  "total": 137
}
```

Metama'lumotni sarlavhalarga ham qo'shish mumkin (`X-Total-Count`, `Link`), lekin **tanani o'rash** ko'proq moslashuvchan: keyinchalik kursor, filtr tavsifi yoki ogohlantirishlar qo'shish mumkin.

Katta ro'yxatlar uchun kursor (keyset) paginatsiyasi ([17-bob](17-repository-va-dql.md)):

```json
{ "items": [...], "nextCursor": "eyJpZCI6MTAyfQ==" }
```

---

## Qisman yangilash: PUT va PATCH

```php
#[Route('/{id<\d+>}', name: 'replace', methods: ['PUT'])]
public function replace(Post $post, #[MapRequestPayload] ReplacePostInput $input, PostUpdater $updater): JsonResponse
{
    $updater->replace($post, $input);

    return $this->json(PostView::fromEntity($post));
}
```

`PUT` — resursni **to'liq almashtiradi** (berilmagan maydon standart/null bo'ladi), `PATCH` — faqat berilgan maydonlarni o'zgartiradi. `PATCH` da "maydon berilmagan" va "maydon `null` qilib berilgan" holatlarini ajratish kerak — bu DTO'da alohida ishlov talab qiladi (masalan, maydonlar `null` bilan standartlanadi va qaysi kalitlar kelganini xom massivdan tekshirasiz).

Ko'p jamoa amalda faqat `PUT` yoki faqat `PATCH` ni qo'llab-quvvatlaydi va buni hujjatlashtiradi — bu ham to'g'ri qaror, chunki noto'g'ri ishlaydigan `PATCH` dan ko'ra yo'q `PATCH` yaxshiroq.

---

## Rate limiting

```yaml
# config/packages/rate_limiter.yaml
framework:
    rate_limiter:
        api_write:
            policy: 'token_bucket'
            limit: 60
            rate: { interval: '1 minute', amount: 60 }
```

```php
use Symfony\Component\HttpKernel\Attribute\RateLimit;

#[RateLimit(limiter: 'api_write', methods: ['POST', 'PUT', 'DELETE'])]
#[Route('/api/posts', methods: ['POST'])]
public function create(/* ... */): JsonResponse
{
    // ...
}
```

Limitdan oshganda 429 qaytadi. Mijozga yordam berish uchun `Retry-After` va `X-RateLimit-*` sarlavhalarini qo'shish yaxshi amaliyot.

---

## API Platform — qachon va nima

```shell
composer require api
```

```php
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post as PostOperation;

#[ApiResource(
    operations: [new GetCollection(), new PostOperation()],
    normalizationContext: ['groups' => ['post:read']],
    denormalizationContext: ['groups' => ['post:write']],
)]
#[ORM\Entity]
class Post
{
    // ...
}
```

Shu bilan siz quyidagilarni bepul olasiz: CRUD operatsiyalari, paginatsiya, filtrlar, validatsiya integratsiyasi, OpenAPI/Swagger UI, JSON-LD/Hydra, ixtiyoriy GraphQL.

Nimani yo'qotasiz: to'g'ridan-to'g'ri nazorat. "Bu maydon nega bu yerda?" degan savolga javob metadata konfiguratsiyasida bo'ladi, kodda emas. Katta jamoada bu ijobiy (bir xillik), kichik va nostandart API'da esa cheklovga aylanishi mumkin.

Muhim tafsilot: API Platform bilan ham **entity'ni to'g'ridan-to'g'ri ochish shart emas** — uning "state provider / state processor" mexanizmi orqali DTO bilan ishlash to'liq qo'llab-quvvatlanadi. Ommaviy API'da shunday qilish tavsiya etiladi.

---

## Muhandislik nuqtai nazari: API dizaynining qaytarilmas qarorlari

Quyidagilar keyinchalik o'zgartirilsa, **barcha mijozlarni sindiradi** — ya'ni ular birinchi kundan to'g'ri bo'lishi kerak:

1. **Identifikator turi.** Ketma-ket integer ID biznes ma'lumotini oshkor qiladi (raqobatchi sizning kunlik buyurtmalar sonini bilib oladi) va enumeratsiya hujumiga qulay. UUIDv7 yoki ULID — vaqt bo'yicha tartiblanadi va indeks uchun qulay.
2. **Xato formati.** Yagona struktura (RFC 9457 Problem Details): `type`, `title`, `status`, `detail`, `errors[]` ([24-bob](24-xatolik-va-log.md)).
3. **Versiyalash.** `/api/v1/` yoki media tip orqali. Versiyasiz API — birinchi buzuvchi o'zgarishda muammoga aylanadi.
4. **Paginatsiya shakli.** Offset yoki kursor; javob o'ramining tuzilishi.
5. **Vaqt zonasi va format.** Hamma sana UTC va ISO 8601.

Va bitta operatsion qoida: **API o'z hujjatini o'zi ishlab chiqarsin** (OpenAPI). Qo'lda yozilgan hujjat ikki haftada eskirib qoladi ([38-bob](38-api-pro.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `perPage` ga chegara qo'ymaslik | Mijoz butun bazani so'raydi — DoS | `Assert\Range(max: 100)` |
| Ro'yxatni yalang'och massiv qaytarish | Metama'lumot qo'shib bo'lmaydi | `{"items": [...], "total": n}` |
| Yaratishda `Location` bermaslik | Mijoz yangi resursni topolmaydi | 201 + `Location` |
| `DELETE` da 200 + tana qaytarish | Semantik nomuvofiqlik | 204 No Content |
| Har endpointda boshqa xato formati | Mijozda murakkab ishlov | Yagona format |
| Ketma-ket ID ni ommaviy API'da ishlatish | Enumeratsiya, biznes ma'lumot sizishi | UUIDv7 / ULID |
| Rate limit yo'qligi | Suiiste'mol, hisob-kitob va mavjudlik muammosi | `#[RateLimit]` |
| Entity'ni API Platform'da to'g'ridan-to'g'ri ochish | Domen va kontrakt bog'lanadi | DTO + state provider/processor |

---

## Amaliyot

1. To'liq `PostController` ni yozing: `index`, `show`, `create`, `delete`. Har biriga to'g'ri status kodi qo'ying.
2. `PostListQuery` DTO'si bilan filtr va paginatsiyani ishlating; `?perPage=500` yuborib, 422 kelishini tasdiqlang.
3. Yaratish javobida `Location` sarlavhasi to'g'ri ekanini `curl -i` bilan tekshiring.
4. `rate_limiter` sozlang va `#[RateLimit]` qo'shing; limitdan oshib, 429 oling.
5. API Platform'ni alohida tarmoqda (branch) sinab ko'ring: bitta entity'ni `#[ApiResource]` qilib, `/api/docs` sahifasini oching va qo'lda yozilgan variant bilan solishtiring.

---

## Rasmiy hujjat

- Kontrollerlar: <https://symfony.com/doc/current/controller.html>
- Rate Limiter: <https://symfony.com/doc/current/rate_limiter.html>
- Serializer: <https://symfony.com/doc/current/serializer.html>
- API Platform: <https://api-platform.com/docs/symfony/>
- HTTP status kodlari (MDN): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Status>

---

[← Oldingi: Serializer va DTO](20-serializer-va-dto.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](22-xavfsizlik.md)
