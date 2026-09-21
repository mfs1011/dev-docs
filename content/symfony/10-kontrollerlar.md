# 10 — Kontrollerlar

[← Oldingi: Routing](09-routing.md) · [Mundarija](README.md) · [Keyingi: So'rov va javob →](11-request-response.md)

---

## Kontroller nima

Kontroller — `Request` ni o'qib `Response` qaytaradigan oddiy PHP funksiya. Boshqa hech narsa emas. Symfony'da u odatda klass metodi:

```php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HealthController extends AbstractController
{
    #[Route('/health', name: 'health', methods: ['GET'])]
    public function __invoke(): Response
    {
        return $this->json(['status' => 'ok']);
    }
}
```

`AbstractController` majburiy emas, lekin rasmiy tavsiya — chunki kontroller baribir freymvorkning "yelim kodi", va undagi yordamchilar kodni qisqartiradi:

| Metod | Nima qiladi |
| --- | --- |
| `render($view, $params)` | Twig shablonini `Response` ga aylantiradi |
| `json($data, $status, $headers, $context)` | `JsonResponse` (Serializer bo'lsa — u orqali) |
| `redirectToRoute($route, $params, $status)` | `RedirectResponse` |
| `createNotFoundException($msg)` | `NotFoundHttpException` → 404 |
| `createAccessDeniedException($msg)` | `AccessDeniedException` → 403 |
| `denyAccessUnlessGranted($attr, $subject)` | Avtorizatsiya tekshiruvi ([23-bob](23-avtorizatsiya.md)) |
| `getUser()` | Joriy foydalanuvchi yoki `null` |
| `addFlash($type, $msg)` | Sessiyaga bir martalik xabar |
| `file($path, $name, $disposition)` | Fayl yuklash javobi |

---

## Argument resolver: sehrning ostidagi mexanizm

Kontroller argumentlari qayerdan keladi? [04-bob](04-sorov-hayot-sikli.md) da ko'rganimizdek, `ArgumentResolver` har bir parametrni ko'rib chiqadi va mos "value resolver" ni topadi. Natijada quyidagilar avtomatik ishlaydi:

```php
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapQueryParameter;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Attribute\MapUploadedFile;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api/posts/{id}', methods: ['GET'])]
public function show(
    int $id,                                   // route parametri
    Request $request,                          // so'rov ob'ekti
    LoggerInterface $logger,                   // servis (autowiring)
    #[MapQueryParameter] ?string $format,      // ?format=json
    #[CurrentUser] ?User $user,                // autentifikatsiyalangan foydalanuvchi
): Response {
    // ...
}
```

Eng muhimlari — DTO'ga xaritalash:

```php
namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class CreatePostInput
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(min: 3, max: 255)]
        public string $title,

        #[Assert\NotBlank]
        public string $body,

        #[Assert\Choice(choices: ['draft', 'published'])]
        public string $status = 'draft',
    ) {
    }
}
```

```php
#[Route('/api/posts', methods: ['POST'])]
public function create(
    #[MapRequestPayload] CreatePostInput $input,
): JsonResponse {
    // Bu yerga yetib kelgan bo'lsa: JSON parse qilingan VA validatsiyadan o'tgan.
    // Aks holda Symfony o'zi 422 Unprocessable Entity qaytargan bo'lardi.
}
```

| Atribut | Manba | Tipik ishlatilishi |
| --- | --- | --- |
| `#[MapRequestPayload]` | So'rov tanasi (JSON yoki form) | `POST`/`PUT` uchun DTO |
| `#[MapQueryString]` | Butun query string → DTO | Filtr/sahifalash ob'ekti |
| `#[MapQueryParameter]` | Bitta query parametri | `?page=2` |
| `#[MapRequestHeader]` | HTTP sarlavha | `X-Api-Version` |
| `#[MapUploadedFile]` | Yuklangan fayl | Rasm yuklash |
| `#[CurrentUser]` | Security token | Joriy foydalanuvchi |

Fayl yuklash validatsiya bilan:

```php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapUploadedFile;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;

final class AvatarController extends AbstractController
{
    #[Route('/api/avatar', methods: ['POST'])]
    public function upload(
        #[MapUploadedFile([
            new Assert\File(maxSize: '2M', mimeTypes: ['image/png', 'image/jpeg']),
            new Assert\Image(maxWidth: 4096, maxHeight: 4096),
        ])]
        UploadedFile $avatar,
    ): JsonResponse {
        // ...
    }
}
```

**Nega bu muhim?** Bu naqsh `$request->request->get('title')` uslubidagi kodni yo'q qiladi. Natijada: tiplar aniq, validatsiya bir joyda, IDE avtoto'ldirish ishlaydi, statik tahlilchi xatoni topadi ([34-bob](34-kod-sifati.md)).

---

## Entity'ni to'g'ridan-to'g'ri olish

```php
#[Route('/api/posts/{id}', methods: ['GET'])]
public function show(Post $post): JsonResponse   // id bo'yicha avtomatik topiladi, topilmasa 404
{
    return $this->json($post);
}

// Boshqa maydon bo'yicha
#[Route('/blog/{slug:post}', name: 'blog_show', methods: ['GET'])]
public function showBySlug(Post $post): Response
{
    // ...
}
```

Qulay, lekin **ehtiyot bo'ling**: bu har doim `findOneBy` bilan bitta so'rov qiladi va sizga so'rovni boshqarish imkonini bermaydi (JOIN, tanlangan maydonlar, kesh). Murakkab yuklash kerak bo'lsa, repository'ni o'zingiz chaqiring ([17-bob](17-repository-va-dql.md)).

---

## Kontroller nima qilmasligi kerak

Kontrollerning ideal hajmi — **5–15 qator**. Uning vazifasi:

1. Kirishni qabul qilish (DTO sifatida — allaqachon validatsiyalangan);
2. Bitta servis/handler chaqirish;
3. Natijani javobga aylantirish.

```php
#[Route('/api/posts', name: 'api_post_create', methods: ['POST'])]
public function create(
    #[MapRequestPayload] CreatePostInput $input,
    PostCreator $postCreator,
): JsonResponse {
    $post = $postCreator->create($input, $this->getUser());

    return $this->json($post, Response::HTTP_CREATED, [
        'Location' => $this->generateUrl('api_post_show', ['id' => $post->getId()]),
    ], ['groups' => ['post:read']]);
}
```

Biznes mantiq (`PostCreator`) kontrollerdan tashqarida turadi. Sababi amaliy, "toza kod" she'riyati emas:

- Bir mantiq ikki joydan chaqiriladi: HTTP endpoint va console buyruq ([25-bob](25-console-va-scheduler.md));
- Mantiqni HTTP qatlamisiz test qilish ancha tez;
- Kontroller `Request`/`Response` ga bog'langan, biznes mantiq esa bog'lanmasligi kerak.

---

## Muhandislik nuqtai nazari: qatlamlar chegarasi

Kontroller — **chegaraviy ob'ekt** (boundary): tashqi dunyo (HTTP) va ichki dunyo (domen) orasidagi tarjimon. Chegarada uch ish bajariladi:

1. **Tarjima**: `Request` → DTO. Ichkarida hech kim `$_POST` haqida bilmasligi kerak.
2. **Validatsiya**: kirish shakli to'g'rimi. Biznes qoidalari (masalan, "bu foydalanuvchida balans yetarlimi") — domen ichida.
3. **Xatolikni protokolga tarjima qilish**: `PostNotFound` → 404, `InsufficientBalance` → 409 yoki 422.

Bu — Hexagonal (Ports & Adapters) arxitekturasining kirish porti. Nima uchun buni bilish kerak? Chunki chegara aniq bo'lsa, tizimga ikkinchi kirish nuqtasi (CLI, Messenger consumer, gRPC) qo'shish deyarli bepul bo'ladi. Chegara xiralashsa — biznes mantiq `Request` ga bog'lanib, har yangi kirish nuqtasi kodni ko'chirishga majbur qiladi.

Amaliy mezon: **domen kodida `Symfony\Component\HttpFoundation` importi bo'lmasin**. Buni statik tahlil bilan majburlash mumkin (`deptrac`, PHPStan qoidasi) — [39-bob](39-arxitektura.md).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Kontrollerda 200 qator biznes mantiq | Test qiyin, qayta ishlatib bo'lmaydi | Servis/handler klassiga chiqaring |
| `$request->request->get()` bilan qo'lda o'qish | Tip yo'q, validatsiya tarqoq | `#[MapRequestPayload]` + DTO |
| Entity'ni to'g'ridan-to'g'ri JSON qilish | Ichki maydonlar sizadi, kontrakt beqaror | Serializer guruhlari yoki output DTO ([20-bob](20-serializer-va-dto.md)) |
| Entity'ni `#[MapRequestPayload]` ga ishlatish | Kirish to'g'ridan-to'g'ri domenga tushadi, mass assignment xavfi | Alohida input DTO |
| Yaratishda 200 qaytarish | Semantik xato; mijoz `Location` ni kutadi | `201 Created` + `Location` sarlavhasi |
| Xatoni `try/catch` bilan yutib, `['error' => ...]` qaytarish | Monitoring ko'rmaydi, status kodi 200 qoladi | Istisno tashlang, formatni global handler bersin ([24-bob](24-xatolik-va-log.md)) |
| Kontrollerga `EntityManagerInterface` in'ektsiya qilib, u yerda so'rov yozish | Qatlam chegarasi buziladi | Repository yoki servis |

---

## Amaliyot

1. `CreatePostInput` DTO va `POST /api/posts` endpoint yozing. Noto'g'ri JSON yuboring va 422 javob tanasini ko'ring.
2. `#[MapQueryString]` bilan `PostFilter` DTO yarating (`page`, `perPage`, `status`) va `GET /api/posts?page=2&status=published` ni sinab ko'ring.
3. `show(Post $post)` variantini yozing va topilmagan ID bilan 404 kelishini tasdiqlang. Profiler'dan qanday SQL so'rov ketganini ko'ring.
4. Kontrollerdagi mantiqni `PostCreator` servisiga ko'chiring va kontroller 10 qatordan oshmasligiga erishing.
5. `#[MapUploadedFile]` bilan rasm yuklash endpoint'ini yozing, 5 MB fayl yuborib, validatsiya xatosini ko'ring.

---

## Bog'liq patternlar

[P-01 Input DTO, P-02 Output DTO, P-03 Yupqa kontroller](patterns/01-http-qatlam.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Kontrollerlar: <https://symfony.com/doc/current/controller.html>
- Argument value resolver'lar: <https://symfony.com/doc/current/controller/value_resolver.html>
- `#[MapRequestPayload]` va DTO: <https://symfony.com/doc/current/controller.html#mapping-the-whole-request-payload>
- Best practices: <https://symfony.com/doc/current/best_practices.html#controllers>

---

[← Oldingi: Routing](09-routing.md) · [Mundarija](README.md) · [Keyingi: So'rov va javob →](11-request-response.md)
