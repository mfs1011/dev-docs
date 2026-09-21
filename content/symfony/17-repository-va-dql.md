# 17 — Repository, DQL va QueryBuilder

[← Oldingi: Migratsiyalar](16-migratsiyalar.md) · [Mundarija](README.md) · [Keyingi: Aloqalar va N+1 →](18-aloqalar.md)

---

## Repository — so'rovlarning yagona uyi

```php
namespace App\Repository;

use App\Entity\Post;
use App\Enum\PostStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
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
     * @return list<Post>
     */
    public function findPublished(int $limit = 20, int $offset = 0): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.status = :status')
            ->setParameter('status', PostStatus::Published)
            ->orderBy('p.publishedAt', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }
}
```

**Qoida:** so'rov mantiqi repository'da yashaydi, kontrollerda yoki servisda emas. Sabablari: qayta ishlatish, bitta joyda optimallashtirish, va eng muhimi — `EntityManager` ni butun kod bazasiga tarqatmaslik.

`ServiceEntityRepository` dan meros olgan repository avtomatik servis bo'ladi va autowiring bilan in'ektsiya qilinadi.

---

## QueryBuilder va DQL

```php
// QueryBuilder — dinamik so'rovlar uchun
public function search(?string $term, ?PostStatus $status, int $limit): array
{
    $qb = $this->createQueryBuilder('p');

    if (null !== $term) {
        $qb->andWhere('LOWER(p.title) LIKE :term')
           ->setParameter('term', '%'.mb_strtolower($term).'%');
    }

    if (null !== $status) {
        $qb->andWhere('p.status = :status')
           ->setParameter('status', $status);
    }

    return $qb->orderBy('p.createdAt', 'DESC')
        ->setMaxResults($limit)
        ->getQuery()
        ->getResult();
}
```

```php
// DQL — statik, murakkab so'rovlar uchun o'qilishi osonroq
public function countByStatus(): array
{
    return $this->getEntityManager()
        ->createQuery(
            'SELECT p.status AS status, COUNT(p.id) AS total
             FROM App\Entity\Post p
             GROUP BY p.status'
        )
        ->getResult();
}
```

**DQL — SQL emas.** U jadvallar bilan emas, **entity va ularning xossalari** bilan ishlaydi. `SELECT p FROM App\Entity\Post p` — bu "Post ob'ektlarini ber" degani. Shuning uchun DQL'da `JOIN posts ON ...` yozilmaydi, `JOIN p.author a` yoziladi — aloqa mapping'dan olinadi.

Natijani olish variantlari:

| Metod | Qaytaradi | Qachon |
| --- | --- | --- |
| `getResult()` | Entity massivi | Odatiy holat |
| `getOneOrNullResult()` | Bitta entity yoki `null` | `findOneBy` o'rnini bosuvchi murakkab so'rov |
| `getSingleScalarResult()` | Bitta qiymat | `COUNT`, `SUM` |
| `getArrayResult()` | Massiv (ob'ektsiz) | Faqat o'qish uchun — tezroq, xotira kam |
| `toIterable()` | Generator | Katta to'plamlar |

---

## Paginatsiya

```php
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @return Paginator<Post>
 */
public function paginatePublished(int $page, int $perPage): Paginator
{
    $query = $this->createQueryBuilder('p')
        ->andWhere('p.status = :status')
        ->setParameter('status', PostStatus::Published)
        ->orderBy('p.publishedAt', 'DESC')
        ->addOrderBy('p.id', 'DESC')     // barqaror tartib uchun ikkinchi mezon
        ->setFirstResult(($page - 1) * $perPage)
        ->setMaxResults($perPage)
        ->getQuery();

    return new Paginator($query, fetchJoinCollection: false);
}
```

```php
$paginator = $repository->paginatePublished($page, 20);
$total = count($paginator);        // COUNT so'rovi
foreach ($paginator as $post) { /* ... */ }
```

Ikki nozik nuqta:

1. **Tartib barqaror bo'lishi kerak.** Faqat `publishedAt` bo'yicha tartiblasangiz va bir necha postning sanasi bir xil bo'lsa, 2-sahifada 1-sahifadagi yozuv takrorlanishi mumkin. Shuning uchun har doim noyob maydonni (`id`) ikkinchi mezon qiling.
2. **`OFFSET` katta sahifalarda sekin.** `OFFSET 100000` baza uchun 100 000 qatorni o'tkazib yuborish demak. Katta ro'yxatlar uchun **kursor paginatsiyasi** to'g'riroq:

```php
// keyset / cursor pagination: oxirgi ko'rilgan qiymatdan keyin
$qb->andWhere('(p.publishedAt, p.id) < (:lastDate, :lastId)')
   ->setParameter('lastDate', $lastDate)
   ->setParameter('lastId', $lastId)
   ->setMaxResults($perPage);
```

---

## Indekslar va `EXPLAIN`

Sekin so'rovning 90% sababi — indeks yo'qligi. Mapping'da e'lon qiling, migratsiyaga tushsin:

```php
#[ORM\Entity]
#[ORM\Index(name: 'idx_posts_status_published', columns: ['status', 'published_at'])]
class Post {}
```

Qoidalar:

- **Tartib muhim.** `(status, published_at)` indeksi `WHERE status = ? ORDER BY published_at` uchun ishlaydi; `(published_at, status)` — ishlamaydi (to'liqroq: samarasiz).
- **Selektivlik.** Faqat ikki qiymatli ustunga (`is_active`) yakka indeks deyarli befoyda; kompozit indeksning birinchi ustuni sifatida foydali bo'lishi mumkin.
- **Har bir indeks — yozuv narxi.** `INSERT`/`UPDATE` har indeksni yangilaydi. "Har ehtimolga qarshi" indeks qo'ymang.
- **O'lchang.** Taxmin qilmang:

```shell
# PostgreSQL
EXPLAIN ANALYZE SELECT ... ;
```

Doctrine so'rovining SQL variantini olish:

```php
$sql = $query->getSQL();
$params = $query->getParameters();
```

yoki Profiler'ning Doctrine panelida ("Explain" tugmasi bilan).

---

## O'qish uchun model (read model)

API ro'yxati uchun to'liq entity kerak emas — kerakli maydonlarni tanlang:

```php
/**
 * @return list<array{id: int, title: string, publishedAt: \DateTimeImmutable}>
 */
public function listForApi(int $limit): array
{
    return $this->createQueryBuilder('p')
        ->select('p.id, p.title, p.publishedAt')
        ->andWhere('p.status = :status')
        ->setParameter('status', PostStatus::Published)
        ->setMaxResults($limit)
        ->getQuery()
        ->getArrayResult();
}
```

Yoki to'g'ridan-to'g'ri DTO'ga:

```php
$rows = $this->createQueryBuilder('p')
    ->select(\sprintf('NEW %s(p.id, p.title, p.publishedAt)', PostListItem::class))
    ->andWhere('p.status = :status')
    ->setParameter('status', PostStatus::Published)
    ->getQuery()
    ->getResult();   // list<PostListItem>
```

**Nega?** Entity hidratsiyasi (ob'ekt qurish, identity map, dirty-check uchun snapshot) — qimmat. Faqat o'qiladigan ro'yxat uchun bu ishning hammasi behuda. Katta ro'yxatlarda bu 2–5 barobar farq berishi mumkin.

---

## Muhandislik nuqtai nazari: so'rovni optimallashtirish tartibi

Sekin endpoint'ni tuzatishda quyidagi tartib deyarli har doim to'g'ri ishlaydi:

1. **O'lchang.** Qaysi so'rov, qancha marta, qancha vaqt? (Profiler, `doctrine.dbal` loglar, APM). Taxminga tayanib optimallashtirish — vaqt isrofi.
2. **So'rovlar sonini kamaytiring.** N+1 ni yo'q qiling ([18-bob](18-aloqalar.md)). 100 ta tez so'rov 1 ta o'rtacha so'rovdan sekinroq — tarmoq kechikishi har safar to'lanadi.
3. **Qaytariladigan ma'lumot hajmini kamaytiring.** `SELECT p` o'rniga kerakli ustunlar; paginatsiya; `LIMIT`.
4. **Indeks qo'ying.** `EXPLAIN` bilan tasdiqlang: `Seq Scan` → `Index Scan` ga o'zgardimi.
5. **Keshlang.** Faqat yuqoridagilar bajarilgandan keyin ([28-bob](28-cache-lock-httpclient.md)). Kesh — sekin so'rovni yashirish vositasi emas; u to'g'ri so'rovni takrorlamaslik vositasi.

Nega aynan shu tartib? Chunki har keyingi qadam oldingisidan qimmatroq (murakkablik, invalidatsiya, nomuvofiqlik xavfi). Keshdan boshlash — muammoni ko'mish, uni hal qilish emas.

Yana bir qoida: **so'rov matni foydalanuvchi kiritmasidan qurilmasin**. `->andWhere('p.'.$field.' = :val')` kabi kod — DQL injection uchun ochiq eshik. Ruxsat etilgan maydonlar ro'yxatini (allow-list) tekshiring.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| So'rovni kontrollerda yozish | Qayta ishlatilmaydi, test qiyin | Repository metodi |
| Parametrni satrga qo'shish (`"id = $id"`) | SQL/DQL injection | `setParameter()` |
| `ORDER BY` da noyob maydon yo'qligi | Sahifalar orasida takror/yo'qolish | Ikkinchi mezon sifatida `id` |
| Katta `OFFSET` | Sekin, baza qatorlarni o'tkazib yuboradi | Keyset paginatsiya |
| Ro'yxat uchun to'liq entity yuklash | Ortiqcha xotira va CPU | `getArrayResult()` yoki `NEW ...` DTO |
| Indeksni faqat `WHERE` ustuniga qo'yish | `ORDER BY` baribir saralash qiladi | Kompozit indeks `(filter, sort)` |
| Foydalanuvchi bergan maydon nomini so'rovga qo'yish | Injection / ma'lumot sizishi | Allow-list |
| `getResult()` ni katta to'plamda | Xotira portlashi | `toIterable()` |

---

## Amaliyot

1. `PostRepository::findPublished()` ni yozing va Profiler'dan SQL ni ko'ring.
2. `Paginator` bilan `GET /api/posts?page=2&perPage=20` endpoint'ini yozing va `X-Total-Count` sarlavhasini qo'shing.
3. `EXPLAIN ANALYZE` bilan `status + published_at` indeksidan oldingi va keyingi rejani solishtiring.
4. Ro'yxat uchun `getArrayResult()` variantini yozing va 10 000 yozuvda `memory_get_peak_usage()` farqini o'lchang.
5. Dinamik `sort` parametri uchun allow-list yozing (`['createdAt', 'title']`) va ro'yxatda yo'q qiymatda 400 qaytaring.

---

## Bog'liq patternlar

[P-16 So'rovlar repository'da, P-17 Read model, P-19 Keyset paginatsiya](patterns/03-persistence.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Repository va so'rovlar: <https://symfony.com/doc/current/doctrine.html#querying-for-objects-the-repository>
- DQL: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/dql-doctrine-query-language.html>
- QueryBuilder: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/query-builder.html>
- Paginatsiya: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/tutorials/pagination.html>
- Indekslar va mapping: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/attributes-reference.html>

---

[← Oldingi: Migratsiyalar](16-migratsiyalar.md) · [Mundarija](README.md) · [Keyingi: Aloqalar va N+1 →](18-aloqalar.md)
