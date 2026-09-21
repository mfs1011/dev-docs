# 15 — Doctrine ORM asoslari

[← Oldingi: Formalar](14-formalar.md) · [Mundarija](README.md) · [Keyingi: Migratsiyalar →](16-migratsiyalar.md)

---

## Data Mapper: Doctrine'ning asosiy g'oyasi

Doctrine — **Data Mapper** ORM. Bu shuni anglatadi: entity oddiy PHP ob'ekt, u bazani bilmaydi, unda `save()` metodi yo'q. Saqlash ishini alohida ob'ekt — `EntityManager` bajaradi.

```php
$post = new Post('Sarlavha', 'Matn');   // oddiy ob'ekt
$em->persist($post);                     // "bu ob'ektni kuzat"
$em->flush();                            // "kuzatilayotgan hamma narsani bazaga yoz"
```

**Nega shunday?** Uchta amaliy foyda:

1. **Domen modeli toza qoladi.** Entity'da biznes metodlari bo'ladi (`cancel()`, `publish()`), infratuzilma emas. Uni ORM'siz ham yaratib, test qilish mumkin.
2. **Unit of Work.** Doctrine `flush()` gacha barcha o'zgarishlarni yig'adi, keyin ularni **bitta tranzaksiyada**, optimal tartibda va to'plam sifatida yuboradi.
3. **Identity Map.** Bitta so'rov davomida bir xil ID li entity **bitta PHP ob'ekt** bo'ladi. Ya'ni `$em->find(Post::class, 1) === $em->find(Post::class, 1)`.

Narxi: siz "ob'ekt o'zgarsa bazaga tushadi" degan sehrni emas, aniq `flush()` chegarasini boshqarasiz. Bu boshida ortiqcha tuyuladi, keyin esa tranzaksiya chegarasini aniq bilish katta ustunlikka aylanadi.

---

## Sozlash

```yaml
# config/packages/doctrine.yaml (skeleton bergan holat)
doctrine:
    dbal:
        url: '%env(resolve:DATABASE_URL)%'
        profiling_collect_backtrace: '%kernel.debug%'
    orm:
        validate_xml_mapping: true
        naming_strategy: doctrine.orm.naming_strategy.underscore
        auto_mapping: true
        mappings:
            App:
                type: attribute
                is_bundle: false
                dir: '%kernel.project_dir%/src/Entity'
                prefix: 'App\Entity'
                alias: App
```

```shell
php bin/console doctrine:database:create
php bin/console doctrine:schema:validate      # mapping va baza mos keladimi
```

`DATABASE_URL` da `serverVersion` ni ko'rsatish **majburiy amaliyot**: Doctrine shunga qarab SQL dialektini tanlaydi. Ko'rsatilmasa, u bazaga qo'shimcha so'rov yuboradi va ba'zan noto'g'ri taxmin qiladi.

---

## Entity yozish

```shell
php bin/console make:entity Post
```

```php
namespace App\Entity;

use App\Enum\PostStatus;
use App\Repository\PostRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Clock\DatePoint;

#[ORM\Entity(repositoryClass: PostRepository::class)]
#[ORM\Table(name: 'posts')]
#[ORM\Index(name: 'idx_posts_status_published', columns: ['status', 'published_at'])]
#[ORM\UniqueConstraint(name: 'uniq_posts_slug', columns: ['slug'])]
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

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE, nullable: true)]
    private ?\DateTimeImmutable $publishedAt = null;

    public function __construct(string $title, string $slug, string $body)
    {
        $this->title = $title;
        $this->slug = $slug;
        $this->body = $body;
        $this->createdAt = new DatePoint();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function publish(\DateTimeImmutable $now): void
    {
        if (PostStatus::Draft !== $this->status) {
            throw new \DomainException('Faqat qoralamani e\'lon qilish mumkin.');
        }

        $this->status = PostStatus::Published;
        $this->publishedAt = $now;
    }
}
```

Bu misolda bir nechta professional qaror bor:

- **Konstruktor majburiy maydonlarni oladi.** Entity hech qachon "yarim to'ldirilgan" holatda bo'lmaydi. `make:entity` generatsiya qiladigan barcha setter'lar aslida kerak emas — faqat haqiqatan o'zgaradigan maydonlar uchun yozing.
- **Holat o'zgarishi biznes metodi orqali** (`publish()`), `setStatus()` orqali emas. Shunda noto'g'ri o'tish (`archived` → `published`) mumkin bo'lmaydi.
- **`DATETIME_IMMUTABLE`.** O'zgaruvchan `\DateTime` — xatolar manbai: ob'ekt ikki joyda ishlatilsa, biri ikkinchisining sanasini o'zgartirib yuboradi.
- **Enum tip** — baza qiymati va PHP tipi bir joyda; `'pubished'` kabi imlo xatolari kompilyatsiya bosqichida tutiladi.
- **Indekslar mapping'da e'lon qilingan** — ya'ni ular migratsiyaga avtomatik tushadi va kod bilan birga versiyalanadi.

---

## Saqlash, o'qish, o'zgartirish, o'chirish

```php
use Doctrine\ORM\EntityManagerInterface;

final class PostCreator
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    public function create(string $title, string $slug, string $body): Post
    {
        $post = new Post($title, $slug, $body);

        $this->em->persist($post);
        $this->em->flush();      // INSERT shu yerda ketadi

        return $post;
    }
}
```

```php
$post = $repository->find(42);                       // birlamchi kalit bo'yicha
$post = $repository->findOneBy(['slug' => $slug]);   // shart bo'yicha bitta
$posts = $repository->findBy(['status' => PostStatus::Published], ['createdAt' => 'DESC'], 20);
$posts = $repository->findAll();                     // ehtiyot bo'ling — hammasi!

// Yangilash: setter/biznes metodi + flush. persist() kerak emas.
$post->publish(new DatePoint());
$em->flush();

// O'chirish
$em->remove($post);
$em->flush();
```

**Eng ko'p uchraydigan savol:** nega yangilashda `persist()` kerak emas? Chunki bazadan o'qilgan entity allaqachon "boshqariladigan" (managed) holatda: Doctrine uning boshlang'ich holatini eslab qoladi va `flush()` da farqni hisoblaydi (dirty checking). `persist()` faqat **yangi** ob'ektni kuzatuvga qo'shish uchun.

---

## Tranzaksiyalar

```php
$this->em->wrapInTransaction(function (EntityManagerInterface $em) use ($order): void {
    $em->persist($order);
    $em->flush();

    $this->inventory->reserve($order);   // shu yerda istisno bo'lsa — hammasi orqaga qaytadi
});
```

`flush()` ning o'zi ham tranzaksiyaga o'raladi, lekin bir nechta `flush()` yoki qo'shimcha SQL bo'lsa, aniq chegara qo'yish kerak.

**Muhim xatti-harakat:** `flush()` ichida istisno chiqsa, `EntityManager` **yopiladi** (`closed`). Undan keyin uni ishlatib bo'lmaydi. Shuning uchun "xatoni tutib, boshqa yo'l bilan saqlashga urinish" ishlamaydi — yangi so'rov yoki `resetManager()` kerak.

---

## Muhandislik nuqtai nazari: ORM sizni nimadan himoya qilmaydi

ORM — SQL yozmaslik uchun emas, **ob'ekt grafini baza bilan sinxronlash** uchun. Shuni tushunmaslik ikkita klassik muammoga olib keladi:

1. **N+1 so'rovlar** ([18-bob](18-aloqalar.md)). ORM sizga 100 ta postni beradi, siz har birining muallifini so'rayapsiz — 101 ta so'rov. ORM buni sizga aytmaydi, Profiler aytadi.
2. **Xotira portlashi.** `findAll()` 500 000 qatorni ob'ektga aylantiradi. Har entity ~1–2 KB — bu gigabaytlarga chiqadi. Katta to'plamlar uchun `toIterable()` yoki paginatsiya.

Bundan tashqari, ORM quyidagilarni **hal qilmaydi**, va ular sizning zimmangizda qoladi:

- **Indekslar.** Doctrine siz aytgan indeksni yaratadi, kerakligini o'zi aniqlamaydi. `EXPLAIN` — sizning ishingiz ([17-bob](17-repository-va-dql.md)).
- **Konkurrentlik.** Ikki foydalanuvchi bir vaqtda bir entity'ni o'zgartirsa, oxirgisi yutadi. Buni optimistik qulflash (`#[ORM\Version]`) yoki pessimistik qulf hal qiladi ([37-bob](37-ilgor-doctrine.md)).
- **Tranzaksiya izolyatsiya darajalari.** `READ COMMITTED` da phantom read bo'lishi mumkin; bu baza sozlamasi, ORM emas.

Shuning uchun senior darajadagi qoida: **ORM'dan foydalanayotganda ham SQL'ni biling.** Profiler'dagi "Doctrine" panelini har yangi endpointda oching va ketgan so'rovlarni ko'ring. Bu odat N+1 muammolarining 90% ini ishlab chiqish bosqichida tutadi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har o'zgarishdan keyin `flush()` | Har biri alohida tranzaksiya, sekin | Bitta so'rov oxirida bitta `flush()` |
| Tsikl ichida `flush()` | 1000 ta tranzaksiya | Tsikldan tashqarida yoki har 100 tada batch ([37-bob](37-ilgor-doctrine.md)) |
| `findAll()` ni katta jadvalda | Xotira tugaydi | Paginatsiya yoki `toIterable()` |
| Entity'da barcha maydon uchun setter | Ob'ekt istalgan holatga tushadi, invariantlar yo'q | Konstruktor + biznes metodlari |
| `\DateTime` ishlatish | O'zgaruvchanlik tufayli yashirin xatolar | `\DateTimeImmutable` / `DatePoint` |
| `flush()` da istisnodan keyin EM'dan foydalanish | EM yopilgan, keyingi amallar xato beradi | Xatoni yuqoriga uzating |
| Entity'ni kontroller kirishi sifatida ishlatish | Mass assignment va domen buzilishi | Input DTO ([10-bob](10-kontrollerlar.md)) |
| `serverVersion` ni ko'rsatmaslik | Noto'g'ri SQL dialekti, qo'shimcha so'rov | `DATABASE_URL` da yozing |

---

## Amaliyot

1. `Post` entity'sini yuqoridagidek yozing: konstruktor + `publish()` metodi, setter'larsiz.
2. `php bin/console doctrine:schema:validate` ni ishga tushiring va xabarni o'qing.
3. `PostCreator` servisini yozing va tinker o'rniga **test** bilan tekshiring ([30-bob](30-testlash.md)).
4. Profiler'ning "Doctrine" panelini oching: bitta post yaratishda nechta so'rov ketganini sanang.
5. `publish()` ni ikki marta chaqirib, `DomainException` chiqishini tasdiqlang — invariant ishlayotganini ko'rish.

---

## Bog'liq patternlar

[P-08 Konstruktorda to'liq ob'ekt, P-11 Holat mashinasi](patterns/02-domen.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Doctrine bilan ishlash: <https://symfony.com/doc/current/doctrine.html>
- Doctrine ORM (rasmiy hujjat): <https://www.doctrine-project.org/projects/doctrine-orm/en/current/index.html>
- Mapping atributlari: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/attributes-reference.html>
- Doctrine konfiguratsiyasi: <https://symfony.com/doc/current/reference/configuration/doctrine.html>

---

[← Oldingi: Formalar](14-formalar.md) · [Mundarija](README.md) · [Keyingi: Migratsiyalar →](16-migratsiyalar.md)
