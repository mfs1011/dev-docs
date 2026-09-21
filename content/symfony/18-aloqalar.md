# 18 — Aloqalar va N+1 muammosi

[← Oldingi: Repository va DQL](17-repository-va-dql.md) · [Mundarija](README.md) · [Keyingi: Fixtures va test ma'lumotlari →](19-fixtures.md)

---

## ManyToOne / OneToMany

```php
// src/Entity/Post.php
#[ORM\Entity]
class Post
{
    #[ORM\ManyToOne(targetEntity: Author::class, inversedBy: 'posts')]
    #[ORM\JoinColumn(nullable: false)]
    private Author $author;

    public function getAuthor(): Author
    {
        return $this->author;
    }
}
```

```php
// src/Entity/Author.php
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

#[ORM\Entity]
class Author
{
    /** @var Collection<int, Post> */
    #[ORM\OneToMany(targetEntity: Post::class, mappedBy: 'author')]
    private Collection $posts;

    public function __construct()
    {
        $this->posts = new ArrayCollection();
    }

    /** @return Collection<int, Post> */
    public function getPosts(): Collection
    {
        return $this->posts;
    }

    public function addPost(Post $post): void
    {
        if (!$this->posts->contains($post)) {
            $this->posts->add($post);
            $post->setAuthor($this);     // egalik qiluvchi tomonni ham o'rnatish shart
        }
    }
}
```

### Egalik qiluvchi va teskari tomon

Bu — Doctrine'dagi eng ko'p chalkashlik manbai.

| Tomon | Qayerda | Bazaga ta'sir qiladimi |
| --- | --- | --- |
| **Egalik qiluvchi (owning)** | `ManyToOne` turgan joy — tashqi kalit shu jadvalda | **Ha** |
| **Teskari (inverse)** | `OneToMany`, `mappedBy` bilan | **Yo'q** |

```php
$author->getPosts()->add($post);   // ❌ bazada hech narsa o'zgarmaydi
$post->setAuthor($author);          // ✅ FK yoziladi
```

Shuning uchun `addPost()` ichida `setAuthor()` chaqiriladi — `make:entity` shu kodni o'zi generatsiya qiladi va uni **o'chirmang**.

### `cascade` va `orphanRemoval`

```php
#[ORM\OneToMany(
    targetEntity: Comment::class,
    mappedBy: 'post',
    cascade: ['persist', 'remove'],
    orphanRemoval: true,
)]
private Collection $comments;
```

| Sozlama | Ma'nosi | Ehtiyot |
| --- | --- | --- |
| `cascade: ['persist']` | Postni saqlaganda yangi izohlar ham saqlanadi | Foydali va xavfsiz |
| `cascade: ['remove']` | Post o'chsa izohlar ham o'chadi — **PHP'da, bittalab** | Katta kolleksiyada sekin; baza `ON DELETE CASCADE` tezroq |
| `orphanRemoval: true` | Kolleksiyadan olib tashlangan izoh o'chiriladi | Faqat haqiqiy "kompozitsiya" aloqada (izoh postsiz yashamaydi) |

---

## ManyToMany

```php
#[ORM\ManyToMany(targetEntity: Tag::class, inversedBy: 'posts')]
#[ORM\JoinTable(name: 'post_tags')]
private Collection $tags;
```

**Ogohlantirish:** sof `ManyToMany` faqat bog'lovchi jadvalda **qo'shimcha maydon kerak bo'lmaganda** to'g'ri. Agar "qachon qo'shildi", "kim qo'shdi" kabi maydon kerak bo'lsa (va amalda deyarli har doim kerak bo'lib qoladi), bog'lovchi jadvalni **alohida entity** qiling:

```php
#[ORM\Entity]
class PostTag
{
    #[ORM\ManyToOne(inversedBy: 'postTags')]
    private Post $post;

    #[ORM\ManyToOne(inversedBy: 'postTags')]
    private Tag $tag;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $addedAt;
}
```

Keyinchalik `ManyToMany` dan alohida entity'ga o'tish — og'riqli migratsiya. Boshidan to'g'ri tanlash arzonroq.

---

## N+1 muammosi

```php
$posts = $postRepository->findBy(['status' => PostStatus::Published], limit: 100);

foreach ($posts as $post) {
    echo $post->getAuthor()->getName();   // har iteratsiyada +1 so'rov
}
```

Natija: 1 + 100 = **101 so'rov**. Har biri alohida tarmoq borib-kelishi. Endpoint 30 ms o'rniga 400 ms ishlaydi.

Sabab — **lazy loading**: `getAuthor()` proxy ob'ekt qaytaradi, haqiqiy ma'lumot birinchi murojaatda yuklanadi. Bu qulay, lekin tsikl ichida falokat.

### Yechim: JOIN FETCH

```php
public function findPublishedWithAuthors(int $limit): array
{
    return $this->createQueryBuilder('p')
        ->addSelect('a')                  // ← muhim: aloqani ham SELECT ga qo'shish
        ->innerJoin('p.author', 'a')
        ->andWhere('p.status = :status')
        ->setParameter('status', PostStatus::Published)
        ->setMaxResults($limit)
        ->getQuery()
        ->getResult();
}
```

`addSelect('a')` bo'lmasa — JOIN bor, lekin muallif baribir lazy qoladi va N+1 saqlanadi. Bu eng ko'p uchraydigan yarim tuzatish.

DQL varianti:

```sql
SELECT p, a FROM App\Entity\Post p INNER JOIN p.author a WHERE p.status = :status
```

### Kolleksiyani fetch qilish va paginatsiya tuzog'i

```php
// ❌ setMaxResults() + JOIN FETCH kolleksiya = noto'g'ri natija
$qb->addSelect('c')->leftJoin('p.comments', 'c')->setMaxResults(10);
```

`OneToMany` ni fetch qilganda SQL qatorlar soni ko'payadi (bitta post × 5 izoh = 5 qator), `LIMIT 10` esa qatorlarni cheklaydi, postlarni emas. To'g'ri yechim — `Paginator` ni `fetchJoinCollection: true` bilan ishlatish (u ichki ikki bosqichli so'rov qiladi) yoki izohlarni alohida so'rov bilan olish.

### `EXTRA_LAZY`

```php
#[ORM\OneToMany(targetEntity: Comment::class, mappedBy: 'post', fetch: 'EXTRA_LAZY')]
private Collection $comments;
```

`EXTRA_LAZY` bilan `count($post->getComments())` butun kolleksiyani yuklamasdan `SELECT COUNT(*)` qiladi; `$comments->slice(0, 10)` ham `LIMIT` bilan ishlaydi. 10 000 izohli post uchun bu farq katta.

---

## Muhandislik nuqtai nazari: aloqalar dizayni

ORM aloqalari — bu dizayn qarori, mexanik xaritalash emas. Uchta amaliy prinsip:

**1. Har bir aloqani ikki tomonlama qilmang.** `OneToMany` teskari tomoni faqat unga haqiqatan murojaat qilsangiz kerak. `$user->getOrders()` — 100 000 buyurtmali foydalanuvchida bu kolleksiya xavfli vasvasa. Repository so'rovi (`$orderRepository->findByUser($user, $limit)`) aniqroq va xavfsizroq.

**2. Agregat chegarasini belgilang.** Domain-Driven Design atamasi bilan: agregat — birga o'zgaradigan va birga izchil bo'lishi kerak bo'lgan ob'ektlar guruhi (Post + uning izohlari). Agregatlar orasidagi bog'lanish **ID orqali** bo'lgani yaxshi, ob'ekt havolasi orqali emas. Bu ob'ekt grafining cheksiz kengayib ketishini oldini oladi.

**3. Yuklash strategiyasini so'rov joyida hal qiling.** Mapping'da `fetch: 'EAGER'` qo'yish — global qaror: u aloqani **har doim**, kerak bo'lmaganda ham yuklaydi. To'g'ri yondashuv: mapping'da `LAZY` qoldirish va aniq so'rovlarda `JOIN FETCH` ishlatish. Ya'ni "nima kerakligini chaqiruv joyi biladi".

Nihoyat, N+1 ni topishning eng ishonchli usuli — uni **testda tutish**:

```php
// Profiler'ni test rejimida yoqib, so'rovlar sonini tekshirish
$collector = $client->getProfile()->getCollector('db');
self::assertLessThan(5, $collector->getQueryCount());
```

Bu — regressiyadan himoya: kimdir keyinchalik `JOIN FETCH` ni olib tashlasa, test yiqiladi ([30-bob](30-testlash.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Faqat teskari tomonni o'rnatish | Bazada FK yozilmaydi | Egalik qiluvchi tomonni o'rnating |
| `JOIN` qilib `addSelect()` ni unutish | N+1 saqlanib qoladi | `addSelect('a')` |
| `fetch: 'EAGER'` ni mapping'ga qo'yish | Har so'rovda ortiqcha JOIN | Joyida `JOIN FETCH` |
| `cascade: ['remove']` ni katta kolleksiyada | Minglab `DELETE`, sekin | Baza darajasida `ON DELETE CASCADE` |
| `orphanRemoval` ni ishlatish aloqasi kompozitsiya bo'lmaganda | Kutilmagan ma'lumot yo'qolishi | Faqat "egalik" aloqalarda |
| `setMaxResults()` + kolleksiya `JOIN FETCH` | Noto'g'ri natijalar soni | `Paginator(fetchJoinCollection: true)` |
| `count($collection)` ni oddiy LAZY kolleksiyada | Butun kolleksiya yuklanadi | `EXTRA_LAZY` yoki `COUNT` so'rovi |
| `ManyToMany` ni kelajakda maydon kerak bo'ladigan aloqada | Og'riqli migratsiya | Bog'lovchi entity |

---

## Amaliyot

1. `Post` ↔ `Author` (ManyToOne/OneToMany) aloqasini `make:entity` bilan yarating va generatsiya qilingan `addPost()` kodini o'qing.
2. 50 ta post + mualliflar yarating, ro'yxat endpoint'ini yozing va Profiler'da so'rovlar sonini sanang (N+1 ni o'z ko'zingiz bilan ko'ring).
3. `addSelect('a')->innerJoin('p.author', 'a')` qo'shing va so'rovlar soni 1 ga tushganini tasdiqlang.
4. Izohlar uchun `EXTRA_LAZY` qo'ying va `count()` qanday SQL yuborishini Profiler'dan tekshiring.
5. So'rovlar sonini tekshiradigan funksional test yozing (`getQueryCount()`).

---

## Bog'liq patternlar

[P-18 JOIN FETCH, P-14 Agregat chegarasi](patterns/03-persistence.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Aloqalar: <https://symfony.com/doc/current/doctrine/associations.html>
- Doctrine association mapping: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/association-mapping.html>
- Extra lazy associations: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/tutorials/extra-lazy-associations.html>
- Unumdorlik bo'yicha maslahatlar: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/improving-performance.html>

---

[← Oldingi: Repository va DQL](17-repository-va-dql.md) · [Mundarija](README.md) · [Keyingi: Fixtures va test ma'lumotlari →](19-fixtures.md)
