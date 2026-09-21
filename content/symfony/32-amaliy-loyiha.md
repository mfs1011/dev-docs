# 32 — Amaliy loyiha: to'liq REST API

[← Oldingi: Twig va AssetMapper](31-twig-va-asset.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik va profiling →](33-unumdorlik.md)

---

Bu bobda oldingi 31 bobdagi bo'laklar bitta ishlaydigan loyihaga yig'iladi: **maqolalar API'si** — autentifikatsiya, avtorizatsiya, validatsiya, paginatsiya, fon vazifalari va testlar bilan.

---

## 0. Loyiha va skelet

```shell
symfony new blog-api --version="8.1.*"
cd blog-api

composer require doctrine orm-pack security symfony/serializer-pack symfony/validator messenger
composer require --dev maker orm-fixtures zenstruck/foundry symfony/test-pack dama/doctrine-test-bundle

docker compose up -d
```

```bash
# .env.local
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0
```

---

## 1. Domen: entity'lar

```php
// src/Enum/PostStatus.php
namespace App\Enum;

enum PostStatus: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}
```

```php
// src/Entity/Post.php
namespace App\Entity;

use App\Enum\PostStatus;
use App\Repository\PostRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\Table(name: 'posts')]
#[ORM\Index(name: 'idx_posts_status_published_at', columns: ['status', 'published_at'])]
class Post
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(length: 255, unique: true)]
    private string $slug;

    #[ORM\Column(type: Types::TEXT)]
    private string $body;

    #[ORM\Column(enumType: PostStatus::class)]
    private PostStatus $status = PostStatus::Draft;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private User $author;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    public function __construct(string $title, string $slug, string $body, User $author, \DateTimeImmutable $now)
    {
        $this->title = $title;
        $this->slug = $slug;
        $this->body = $body;
        $this->author = $author;
        $this->createdAt = $now;
    }

    public function publish(\DateTimeImmutable $now): void
    {
        if (PostStatus::Draft !== $this->status) {
            throw new \DomainException('Faqat qoralamani e\'lon qilish mumkin.');
        }

        $this->status = PostStatus::Published;
        $this->publishedAt = $now;
    }

    public function update(string $title, string $body): void
    {
        $this->title = $title;
        $this->body = $body;
    }

    public function getId(): ?int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function getSlug(): string { return $this->slug; }
    public function getBody(): string { return $this->body; }
    public function getStatus(): PostStatus { return $this->status; }
    public function getAuthor(): User { return $this->author; }
    public function getPublishedAt(): ?\DateTimeImmutable { return $this->publishedAt; }
}
```

```shell
php bin/console make:user User        # email + roles + password
php bin/console make:migration
php bin/console doctrine:migrations:migrate
```

---

## 2. Kirish va chiqish DTO'lari

```php
// src/Dto/CreatePostInput.php
namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class CreatePostInput
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Length(min: 3, max: 255)]
        public string $title,

        #[Assert\NotBlank]
        #[Assert\Length(min: 10)]
        public string $body,
    ) {
    }
}
```

```php
// src/Dto/PostListQuery.php
namespace App\Dto;

use App\Enum\PostStatus;
use Symfony\Component\Validator\Constraints as Assert;

final class PostListQuery
{
    public function __construct(
        #[Assert\Positive]
        public int $page = 1,

        #[Assert\Range(min: 1, max: 100)]
        public int $perPage = 20,

        public ?PostStatus $status = null,
    ) {
    }
}
```

```php
// src/Dto/PostView.php
namespace App\Dto;

use App\Entity\Post;

final readonly class PostView
{
    public function __construct(
        public int $id,
        public string $title,
        public string $slug,
        public string $body,
        public string $status,
        public string $authorEmail,
        public ?string $publishedAt,
    ) {
    }

    public static function fromEntity(Post $post): self
    {
        return new self(
            id: $post->getId(),
            title: $post->getTitle(),
            slug: $post->getSlug(),
            body: $post->getBody(),
            status: $post->getStatus()->value,
            authorEmail: $post->getAuthor()->getUserIdentifier(),
            publishedAt: $post->getPublishedAt()?->format(\DateTimeInterface::ATOM),
        );
    }
}
```

---

## 3. Repository

```php
// src/Repository/PostRepository.php
namespace App\Repository;

use App\Dto\PostListQuery;
use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\Tools\Pagination\Paginator;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Post>
 */
final class PostRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Post::class);
    }

    /**
     * @return Paginator<Post>
     */
    public function paginate(PostListQuery $query): Paginator
    {
        $qb = $this->createQueryBuilder('p')
            ->addSelect('a')              // N+1 ni oldini olish
            ->innerJoin('p.author', 'a')
            ->orderBy('p.createdAt', 'DESC')
            ->addOrderBy('p.id', 'DESC')
            ->setFirstResult(($query->page - 1) * $query->perPage)
            ->setMaxResults($query->perPage);

        if (null !== $query->status) {
            $qb->andWhere('p.status = :status')->setParameter('status', $query->status);
        }

        return new Paginator($qb->getQuery(), fetchJoinCollection: false);
    }
}
```

---

## 4. Servis (biznes mantiq)

```php
// src/Service/PostCreator.php
namespace App\Service;

use App\Dto\CreatePostInput;
use App\Entity\Post;
use App\Entity\User;
use App\Exception\DuplicateSlugException;
use App\Message\NotifySubscribers;
use App\Repository\PostRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Clock\ClockInterface;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\String\Slugger\SluggerInterface;

final class PostCreator
{
    public function __construct(
        private EntityManagerInterface $em,
        private PostRepository $posts,
        private SluggerInterface $slugger,
        private ClockInterface $clock,
        private MessageBusInterface $bus,
    ) {
    }

    public function create(CreatePostInput $input, User $author): Post
    {
        $slug = strtolower((string) $this->slugger->slug($input->title));

        if (null !== $this->posts->findOneBy(['slug' => $slug])) {
            throw new DuplicateSlugException($slug);
        }

        $post = new Post($input->title, $slug, $input->body, $author, $this->clock->now());

        $this->em->persist($post);
        $this->em->flush();

        $this->bus->dispatch(new NotifySubscribers($post->getId()));

        return $post;
    }
}
```

`ClockInterface` in'ektsiya qilinishi — testda vaqtni boshqarish uchun ([30-bob](30-testlash.md)).

---

## 5. Avtorizatsiya

```php
// src/Security/Voter/PostVoter.php
namespace App\Security\Voter;

use App\Entity\Post;
use App\Entity\User;
use App\Enum\PostStatus;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class PostVoter extends Voter
{
    public const VIEW = 'POST_VIEW';
    public const EDIT = 'POST_EDIT';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT], true) && $subject instanceof Post;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        \assert($subject instanceof Post);
        $user = $token->getUser();

        if (self::VIEW === $attribute && PostStatus::Published === $subject->getStatus()) {
            return true;
        }

        if (!$user instanceof User) {
            $vote?->addReason('Foydalanuvchi autentifikatsiyadan o\'tmagan.');

            return false;
        }

        return $subject->getAuthor() === $user;
    }

    public function supportsAttribute(string $attribute): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT], true);
    }

    public function supportsType(string $subjectType): bool
    {
        return is_a($subjectType, Post::class, true);
    }
}
```

---

## 6. Kontroller

```php
// src/Controller/Api/PostController.php
namespace App\Controller\Api;

use App\Dto\CreatePostInput;
use App\Dto\PostListQuery;
use App\Dto\PostView;
use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Security\Voter\PostVoter;
use App\Service\PostCreator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

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
    #[IsGranted(PostVoter::VIEW, subject: 'post')]
    public function show(Post $post): JsonResponse
    {
        return $this->json(PostView::fromEntity($post));
    }

    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function create(
        #[MapRequestPayload] CreatePostInput $input,
        #[CurrentUser] User $user,
        PostCreator $creator,
    ): JsonResponse {
        $post = $creator->create($input, $user);

        return $this->json(
            PostView::fromEntity($post),
            Response::HTTP_CREATED,
            ['Location' => $this->generateUrl('api_post_show', ['id' => $post->getId()])],
        );
    }
}
```

---

## 7. Fon vazifasi

```php
// src/Message/NotifySubscribers.php
namespace App\Message;

final readonly class NotifySubscribers
{
    public function __construct(public int $postId)
    {
    }
}
```

```php
// src/MessageHandler/NotifySubscribersHandler.php
namespace App\MessageHandler;

use App\Message\NotifySubscribers;
use App\Repository\PostRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Exception\UnrecoverableMessageHandlingException;

#[AsMessageHandler]
final class NotifySubscribersHandler
{
    public function __construct(private PostRepository $posts)
    {
    }

    public function __invoke(NotifySubscribers $message): void
    {
        $post = $this->posts->find($message->postId);

        if (null === $post) {
            throw new UnrecoverableMessageHandlingException('Post topilmadi.');
        }

        // ... obunachilarga xabar ...
    }
}
```

---

## 8. Testlar

```php
// tests/Api/PostApiTest.php
namespace App\Tests\Api;

use App\Factory\PostFactory;
use App\Factory\UserFactory;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Zenstruck\Foundry\Attribute\ResetDatabase;

#[ResetDatabase]
final class PostApiTest extends WebTestCase
{
    public function testIndexReturnsPaginatedItems(): void
    {
        PostFactory::createMany(25);

        $client = static::createClient();
        $client->request('GET', '/api/posts?page=2&perPage=10');

        self::assertResponseIsSuccessful();

        $data = json_decode($client->getResponse()->getContent(), true, flags: \JSON_THROW_ON_ERROR);
        self::assertCount(10, $data['items']);
        self::assertSame(25, $data['total']);
    }

    public function testCreateRequiresAuthentication(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/posts', server: ['CONTENT_TYPE' => 'application/json'], content: '{"title":"Salom dunyo","body":"Matn matn matn"}');

        self::assertResponseStatusCodeSame(401);
    }

    public function testCreateReturns201WithLocation(): void
    {
        $client = static::createClient();
        $client->loginUser(UserFactory::createOne()->_real());

        $client->request('POST', '/api/posts', server: ['CONTENT_TYPE' => 'application/json'], content: '{"title":"Salom dunyo","body":"Matn matn matn"}');

        self::assertResponseStatusCodeSame(201);
        self::assertResponseHasHeader('Location');
    }

    public function testCreateValidatesTitle(): void
    {
        $client = static::createClient();
        $client->loginUser(UserFactory::createOne()->_real());

        $client->request('POST', '/api/posts', server: ['CONTENT_TYPE' => 'application/json'], content: '{"title":"","body":"Matn matn matn"}');

        self::assertResponseStatusCodeSame(422);
    }
}
```

---

## 9. Tekshirish ro'yxati

Loyiha tugadi deb hisoblash uchun quyidagilar bajarilgan bo'lishi kerak:

- [ ] `php bin/console lint:container` toza
- [ ] `php bin/console doctrine:schema:validate` toza
- [ ] `php bin/phpunit` — barcha testlar yashil
- [ ] Har endpoint uchun: muvaffaqiyat, 401, 403, 422 holatlari test bilan qoplangan
- [ ] Ro'yxat endpoint'ida so'rovlar soni doimiy (N+1 yo'q) — Profiler bilan tasdiqlangan
- [ ] `perPage` chegarasi bor
- [ ] Xato javoblari yagona formatda ([24-bob](24-xatolik-va-log.md))
- [ ] `POST` javobida `Location` sarlavhasi bor
- [ ] Fon vazifasi `failure_transport` bilan sozlangan
- [ ] `APP_ENV=prod` da ishga tushirilib sinab ko'rilgan

---

## Amaliyot (kengaytirish)

1. `PUT /api/posts/{id}` va `DELETE /api/posts/{id}` endpointlarini qo'shing (`#[IsGranted(PostVoter::EDIT)]` bilan).
2. `POST /api/posts/{id}/publish` amal endpoint'ini yozing va `DomainException` ni 409 ga aylantiring.
3. Ro'yxatga `?search=` filtri qo'shing va uning indeksdan foydalanishini `EXPLAIN` bilan tekshiring.
4. Ro'yxat javobini keshlang ([28-bob](28-cache-lock-httpclient.md)) va post o'zgarganda teg bilan invalidatsiya qiling.
5. `asset-map:compile` dan tashqari barcha production tayyorgarlik qadamlarini deploy skriptiga yozing ([40-bob](40-deploy-va-checklist.md)).

---

## Rasmiy hujjat

- Symfony Demo ilovasi: <https://github.com/symfony/demo>
- Best Practices: <https://symfony.com/doc/current/best_practices.html>
- Doctrine: <https://symfony.com/doc/current/doctrine.html>
- Xavfsizlik: <https://symfony.com/doc/current/security.html>
- Testlash: <https://symfony.com/doc/current/testing.html>

---

[← Oldingi: Twig va AssetMapper](31-twig-va-asset.md) · [Mundarija](README.md) · [Keyingi: Unumdorlik va profiling →](33-unumdorlik.md)
