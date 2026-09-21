# Patternlar: HTTP qatlami

[← Katalog](README.md) · [Keyingi: Domen modeli →](02-domen.md)

---

## P-01 · Input DTO (kirish ob'ekti)

**Muammo.** Kontroller `$request->request->get('title')` bilan ishlaydi: tip yo'q, validatsiya tarqoq, IDE yordam bermaydi, statik tahlil ko'r.

**Yechim.** Har yozish amali uchun alohida `readonly` DTO; validatsiya atributlar bilan o'sha yerda.

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
    ) {
    }
}
```

```php
#[Route('/api/posts', methods: ['POST'])]
public function create(#[MapRequestPayload] CreatePostInput $input, PostCreator $creator): JsonResponse
{
    // bu yerga yetib kelgan — demak JSON to'g'ri va validatsiyadan o'tgan
}
```

**Qachon kerak emas.** Bitta `id` parametri bo'lgan oddiy amal (`POST /posts/{id}/publish`) — DTO ortiqcha.

**Bog'liq:** [10-bob](../10-kontrollerlar.md), [13-bob](../13-validatsiya.md), [P-02](#p-02--output-dto-view-model).

---

## P-02 · Output DTO (view model)

**Muammo.** Entity to'g'ridan-to'g'ri JSON qilinsa, API kontrakti domen sxemasiga bog'lanib qoladi: maydon nomini o'zgartirsangiz mijozlar sinadi, yangi maydon qo'shsangiz tasodifan sizib ketadi.

**Yechim.** Javob uchun alohida klass — u **API kontraktining kodda yozilgan ta'rifi**.

```php
namespace App\Dto;

use App\Entity\Post;

final readonly class PostView
{
    public function __construct(
        public int $id,
        public string $title,
        public string $status,
        public ?string $publishedAt,
    ) {
    }

    public static function fromEntity(Post $post): self
    {
        return new self(
            id: $post->getId(),
            title: $post->getTitle(),
            status: $post->getStatus()->value,
            publishedAt: $post->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        );
    }
}
```

**Qachon kerak emas.** Ichki admin panel yoki qisqa umrli prototip — Serializer guruhlari yetarli va arzonroq.

**Bog'liq:** [20-bob](../20-serializer-va-dto.md), [P-01](#p-01--input-dto-kirish-obekti).

---

## P-03 · Yupqa kontroller + Action servisi

**Muammo.** Biznes mantiq kontrollerda: CLI'dan yoki Messenger handler'idan qayta ishlatib bo'lmaydi, test uchun butun HTTP steki ko'tariladi.

**Yechim.** Kontroller uch ish qiladi: kirishni qabul qilish, bitta servis chaqirish, javob yasash. Servis nomi **amalni** bildirsin (`PostCreator`, `OrderCanceller`), `PostService` emas.

```php
final class PostCreator
{
    public function __construct(
        private EntityManagerInterface $em,
        private SluggerInterface $slugger,
        private ClockInterface $clock,
    ) {
    }

    public function create(CreatePostInput $input, User $author): Post
    {
        $post = new Post($input->title, $this->slug($input->title), $input->body, $author, $this->clock->now());

        $this->em->persist($post);
        $this->em->flush();

        return $post;
    }

    private function slug(string $title): string
    {
        return strtolower((string) $this->slugger->slug($title));
    }
}
```

**Qachon kerak emas.** Kontroller faqat repository'dan o'qib, DTO qaytarsa — oraliq servis qo'shish bo'sh qatlam bo'ladi.

**Bog'liq:** [10-bob](../10-kontrollerlar.md), [A-01](07-antipatternlar.md#a-01--fat-controller).

---

## P-04 · Xatoliklarni protokolga xaritalash

**Muammo.** Domen istisnosi (`OrderCannotBeCancelled`) kontrollerda `try/catch` bilan tutilib, har joyda turlicha JSON'ga aylantiriladi.

**Yechim.** Domen istisnosi HTTP haqida bilmaydi; xaritalash **bitta joyda** bo'ladi — atribut yoki listener orqali.

```php
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Psr\Log\LogLevel;
use Symfony\Component\HttpKernel\Attribute\WithLogLevel;

#[WithHttpStatus(409)]
#[WithLogLevel(LogLevel::WARNING)]
final class OrderCannotBeCancelled extends \DomainException
{
}
```

Murakkabroq holatda — `kernel.exception` listener'i barcha `/api` javoblarini `application/problem+json` formatiga keltiradi ([24-bob](../24-xatolik-va-log.md)).

**Qachon kerak emas.** Hech qachon: yagona xato formati — API'ning majburiy qismi.

**Bog'liq:** [24-bob](../24-xatolik-va-log.md), [P-12](02-domen.md#p-12--domen-istisnosi).

---

## P-05 · Ro'yxat javobini o'rash (envelope)

**Muammo.** `GET /api/posts` yalang'och massiv qaytaradi. Keyinchalik paginatsiya yoki filtr metama'lumoti kerak bo'ladi — massivni ob'ektga aylantirish **buzuvchi o'zgarish**.

**Yechim.** Birinchi kundan o'ralgan javob.

```php
return $this->json([
    'items' => array_map(PostView::fromEntity(...), iterator_to_array($paginator)),
    'page' => $query->page,
    'perPage' => $query->perPage,
    'total' => count($paginator),
]);
```

**Qachon kerak emas.** Cheklangan, hech qachon sahifalanmaydigan ro'yxat (masalan, ruxsat etilgan valyutalar) — lekin bu holatda ham o'rash zarar qilmaydi.

**Bog'liq:** [21-bob](../21-rest-api.md), [P-19](03-persistence.md#p-19--keyset-kursor-paginatsiya).

---

## P-06 · Query DTO (filtr ob'ekti)

**Muammo.** Ro'yxat endpoint'ida `?page=&perPage=&status=&sort=` parametrlari qo'lda o'qiladi, chegara qo'yilmaydi, `sort` to'g'ridan-to'g'ri so'rovga tushadi.

**Yechim.** Query string ham DTO'ga xaritalanadi va validatsiya qilinadi; `sort` uchun allow-list.

```php
final class PostListQuery
{
    public function __construct(
        #[Assert\Positive]
        public int $page = 1,

        #[Assert\Range(min: 1, max: 100)]     // DoS himoyasi
        public int $perPage = 20,

        public ?PostStatus $status = null,

        #[Assert\Choice(choices: ['createdAt', '-createdAt', 'title'])]
        public string $sort = '-createdAt',
    ) {
    }
}
```

```php
public function index(#[MapQueryString] ?PostListQuery $query, PostRepository $posts): JsonResponse
{
    $query ??= new PostListQuery();
    // ...
}
```

**Qachon kerak emas.** Parametrsiz endpoint.

**Bog'liq:** [10-bob](../10-kontrollerlar.md), [17-bob](../17-repository-va-dql.md).

---

## P-07 · Idempotentlik kaliti

**Muammo.** Mijoz `POST` yubordi, javob tarmoqda yo'qoldi, mijoz qayta yubordi — ikkita to'lov.

**Yechim.** Mijoz `Idempotency-Key` sarlavhasini yuboradi; server birinchi natijani saqlab, takroriy so'rovga **o'sha javobni** qaytaradi. Ishonchli implementatsiya bazada: `key` noyob indeks, `request_hash`, `status`, saqlangan javob.

```php
public function create(
    #[MapRequestPayload] CreatePaymentInput $input,
    #[MapRequestHeader(name: 'idempotency-key')] string $key,
    IdempotentExecutor $executor,
): JsonResponse {
    [$status, $payload] = $executor->run($key, $input, fn () => $this->creator->create($input));

    return new JsonResponse($payload, $status);
}
```

**Qachon kerak emas.** `GET`, `PUT`, `DELETE` — ular allaqachon idempotent. Faqat `POST` va tashqi ta'sirli amallar uchun.

**Bog'liq:** [38-bob](../38-api-pro.md), [P-24](04-async.md#p-24--idempotent-handler).

---

[← Katalog](README.md) · [Keyingi: Domen modeli →](02-domen.md)
