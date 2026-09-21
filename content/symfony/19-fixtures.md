# 19 — Fixtures va test ma'lumotlari

[← Oldingi: Aloqalar va N+1](18-aloqalar.md) · [Mundarija](README.md) · [Keyingi: Serializer va DTO →](20-serializer-va-dto.md)

---

## Nima uchun kerak

Uch xil vazifa, bitta muammo — "bazada ma'lumot bo'lishi kerak":

1. **Lokal ishlab chiqish** — ilovani ochganda bo'sh ro'yxat emas, real ko'rinadigan ma'lumot.
2. **Testlar** — har test aniq boshlang'ich holatdan boshlanishi kerak.
3. **Demo/staging muhiti** — ko'rsatish uchun izchil ma'lumot to'plami.

Symfony ekotizimida ikki vosita bor: **DoctrineFixturesBundle** (klassik) va **Foundry** (zamonaviy, ayniqsa testlar uchun).

---

## DoctrineFixturesBundle

```shell
composer require --dev orm-fixtures
php bin/console make:fixtures PostFixtures
```

```php
namespace App\DataFixtures;

use App\Entity\Post;
use App\Enum\PostStatus;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\String\Slugger\SluggerInterface;

final class PostFixtures extends Fixture
{
    public function __construct(private SluggerInterface $slugger)
    {
    }

    public function load(ObjectManager $manager): void
    {
        for ($i = 1; $i <= 50; $i++) {
            $title = \sprintf('Namunaviy post #%d', $i);
            $post = new Post(
                $title,
                strtolower((string) $this->slugger->slug($title)),
                str_repeat('Matn. ', 30),
            );

            $manager->persist($post);
        }

        $manager->flush();
    }
}
```

```shell
php bin/console doctrine:fixtures:load                 # DIQQAT: barcha jadvalni tozalaydi
php bin/console doctrine:fixtures:load --append        # tozalamasdan qo'shadi
php bin/console doctrine:fixtures:load --group=demo
```

Tartib va ob'ektlarni ulashish:

```php
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

final class PostFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $author = $this->getReference(AuthorFixtures::MAIN_AUTHOR, Author::class);
        // ...
    }

    public function getDependencies(): array
    {
        return [AuthorFixtures::class];
    }
}
```

```php
final class AuthorFixtures extends Fixture
{
    public const MAIN_AUTHOR = 'author-main';

    public function load(ObjectManager $manager): void
    {
        $author = new Author('Aziz Karimov');
        $manager->persist($author);
        $manager->flush();

        $this->addReference(self::MAIN_AUTHOR, $author);
    }
}
```

**Ogohlantirish:** `doctrine:fixtures:load` production'da ishga tushirilsa, u **bazani tozalaydi**. Uni deploy skriptiga hech qachon qo'ymang; bundle'ning o'zi `--dev` bog'liqlik bo'lishi kerak.

---

## Foundry — testlar uchun zamonaviy yondashuv

```shell
composer require --dev zenstruck/foundry
php bin/console make:factory Post
```

```php
namespace App\Factory;

use App\Entity\Post;
use App\Enum\PostStatus;
use Zenstruck\Foundry\Persistence\PersistentObjectFactory;

/**
 * @extends PersistentObjectFactory<Post>
 */
final class PostFactory extends PersistentObjectFactory
{
    public static function class(): string
    {
        return Post::class;
    }

    protected function defaults(): array|callable
    {
        $title = self::faker()->unique()->sentence(4);

        return [
            'title' => $title,
            'slug' => self::faker()->unique()->slug(),
            'body' => self::faker()->paragraphs(3, true),
        ];
    }

    public function published(): self
    {
        return $this->with(['status' => PostStatus::Published]);
    }
}
```

```php
// Testda
$post = PostFactory::createOne();                                  // bitta
$posts = PostFactory::createMany(20);                              // yigirmata
$published = PostFactory::new()->published()->create();            // holat bilan
$post = PostFactory::createOne(['title' => 'Aniq sarlavha']);      // aniq qiymat
```

**Foundry nima uchun testda yaxshiroq:**

- Har test **o'ziga kerakli** ma'lumotni yaratadi — global fixtures to'plamiga bog'liq emas.
- Test o'qilganda kerakli shart ko'rinib turadi: `PostFactory::new()->published()->create()` — testning maqsadi darhol tushunarli.
- Global fixtures o'zgarganda o'nlab test birdaniga yiqilmaydi.

Testni sozlash (PHPUnit 10+):

```xml
<!-- phpunit.dist.xml -->
<extensions>
    <bootstrap class="Zenstruck\Foundry\PHPUnit\FoundryExtension"/>
</extensions>
```

```php
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Zenstruck\Foundry\Attribute\ResetDatabase;

#[ResetDatabase]
final class PostApiTest extends WebTestCase
{
    public function testListReturnsPublishedPosts(): void
    {
        PostFactory::new()->published()->many(3)->create();
        PostFactory::createOne();   // qoralama

        $client = static::createClient();
        $client->request('GET', '/api/posts');

        self::assertResponseIsSuccessful();
        self::assertCount(3, json_decode($client->getResponse()->getContent(), true)['items']);
    }
}
```

Katta demo to'plamlari uchun Foundry'da **story** bor — bir marta quriladigan, qayta ishlatiladigan sahna:

```php
namespace App\Story;

use App\Factory\AuthorFactory;
use App\Factory\PostFactory;
use Zenstruck\Foundry\Story;

final class DemoStory extends Story
{
    public function build(): void
    {
        AuthorFactory::createMany(5);

        PostFactory::createMany(50, static fn () => [
            'author' => AuthorFactory::random(),
        ]);
    }
}
```

---

## Muhandislik nuqtai nazari: test ma'lumoti dizayni

Test ma'lumoti — testning **eng ko'p e'tibordan chetda qoladigan, lekin eng ko'p muammo keltiradigan** qismi. Uch qoida:

**1. Test o'ziga kerakli ma'lumotni o'zi yaratsin.** "Global fixtures" yondashuvi boshida qulay, keyin tuzoqqa aylanadi: bitta fixture o'zgarishi 40 ta testni sindiradi, va hech kim qaysi test qaysi yozuvga tayanganini bilmaydi. Foundry naqshi — har test o'z sahnasini quradi.

**2. Ma'lumot testning niyatini ifodalasin.** Faqat tekshirilayotgan narsani aniq qiling, qolganini standart qoldiring:

```php
// ✅ Testning mohiyati ko'rinib turibdi
PostFactory::new()->published()->create(['publishedAt' => new \DateTimeImmutable('-1 day')]);

// ❌ 12 ta maydon yozilgan, qaysi biri muhimligi noma'lum
```

**3. Izolyatsiya — tezlik bilan muvozanat.** Har testdan keyin bazani tozalash ishonchli, lekin sekin. Amalda eng yaxshi yechim — **har testni tranzaksiyada bajarib, oxirida rollback qilish**. `dama/doctrine-test-bundle` aynan shuni qiladi va suitni sezilarli tezlashtiradi ([30-bob](30-testlash.md)).

Yana bir jihat: **tasodifiy ma'lumot (Faker) — ikki tomonlama qurol**. U real ko'rinishli ma'lumot beradi, lekin testni beqaror qilishi mumkin (masalan, tasodifan bo'sh satr yoki juda uzun matn). Qoida: tekshirilayotgan maydon **hech qachon** tasodifiy bo'lmasin; faqat ahamiyatsiz maydonlar tasodifiy bo'lsin.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `doctrine:fixtures:load` ni production'da ishlatish | Baza tozalanadi — ma'lumot yo'qoladi | Faqat `--dev`, deploy skriptida yo'q |
| Barcha testlar bitta global fixtures'ga tayanishi | Mo'rt suite, bitta o'zgarish o'nlab testni sindiradi | Test ichida factory |
| Tekshirilayotgan maydonni Faker'ga qoldirish | Beqaror ("flaky") test | Aniq qiymat bering |
| Fixtures'da `flush()` ni har iteratsiyada chaqirish | Sekin yuklash | Oxirida bir marta yoki batch bilan |
| Fixtures'ni testda va dev'da bir xil hajmda ishlatish | Test sekinlashadi | Test — minimal, dev — boy to'plam (`--group`) |
| Referenslarsiz aloqalarni qo'lda ulash | Tartib buziladi, xatolar | `addReference()` + `DependentFixtureInterface` |

---

## Amaliyot

1. `PostFixtures` yozing (50 ta post) va `doctrine:fixtures:load` bilan yuklang. `--append` farqini sinab ko'ring.
2. `AuthorFixtures` qo'shing va `DependentFixtureInterface` bilan tartibni ta'minlang.
3. Foundry o'rnating, `make:factory Post` bilan factory yarating va `published()` holatini qo'shing.
4. `#[ResetDatabase]` bilan funksional test yozing: 3 ta e'lon qilingan + 1 ta qoralama post yaratib, API faqat 3 tasini qaytarayotganini tekshiring.
5. `--group=demo` guruhi bilan faqat demo ma'lumotlarini yuklaydigan fixture qo'shing.

---

## Rasmiy hujjat

- DoctrineFixturesBundle: <https://symfony.com/doc/current/bundles/DoctrineFixturesBundle/index.html>
- Foundry: <https://symfony.com/bundles/ZenstruckFoundryBundle/current/index.html>
- Testlash: <https://symfony.com/doc/current/testing.html>
- Bazani testlarda sozlash: <https://symfony.com/doc/current/testing/database.html>

---

[← Oldingi: Aloqalar va N+1](18-aloqalar.md) · [Mundarija](README.md) · [Keyingi: Serializer va DTO →](20-serializer-va-dto.md)
