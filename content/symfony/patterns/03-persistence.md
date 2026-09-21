# Patternlar: persistence (Doctrine)

[← Domen modeli](02-domen.md) · [Katalog](README.md) · [Keyingi: Asinxron ishlov →](04-async.md)

---

## P-16 · So'rovlar faqat repository'da

**Muammo.** `createQueryBuilder()` kontrollerda, servisda va konsol buyrug'ida takrorlanadi. Bitta filtrni (`deleted_at IS NULL`) qo'shish uchun 7 joyni qidirish kerak.

**Yechim.** Har so'rov — repository'ning nomlangan metodi. Metod nomi **savolni** ifodalasin.

```php
/**
 * @extends ServiceEntityRepository<Post>
 */
final class PostRepository extends ServiceEntityRepository
{
    /** @return list<Post> */
    public function findPublishedByAuthor(User $author, int $limit): array
    {
        return $this->createQueryBuilder('p')
            ->andWhere('p.author = :author')
            ->andWhere('p.status = :status')
            ->setParameter('author', $author)
            ->setParameter('status', PostStatus::Published)
            ->orderBy('p.publishedAt', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()
            ->getResult();
    }
}
```

**Qachon kerak emas.** Bir martalik migratsiya skripti — u yerda DBAL so'rovi joyida bo'lsa bo'ldi.

**Bog'liq:** [17-bob](../17-repository-va-dql.md), [A-02](07-antipatternlar.md#a-02--entitymanager-kontrollerda).

---

## P-17 · Read model (o'qish uchun alohida model)

**Muammo.** Ro'yxat sahifasi 50 ta to'liq entity yuklaydi: identity map, dirty-check uchun snapshot, aloqalar — hammasi behuda, chunki javobda faqat 4 maydon ko'rinadi.

**Yechim.** O'qish uchun DTO yoki massiv; yozish uchun entity.

```php
/** @return list<array{id: int, title: string, publishedAt: ?\DateTimeImmutable}> */
public function listForApi(int $limit, int $offset): array
{
    return $this->createQueryBuilder('p')
        ->select('p.id, p.title, p.publishedAt')
        ->andWhere('p.status = :status')
        ->setParameter('status', PostStatus::Published)
        ->setMaxResults($limit)
        ->setFirstResult($offset)
        ->getQuery()
        ->getArrayResult();
}
```

Murakkab hisobotlar uchun to'g'ridan-to'g'ri DBAL:

```php
$rows = $this->connection->fetchAllAssociative(
    'SELECT status, COUNT(*) AS total FROM posts GROUP BY status'
);
```

**Qachon kerak emas.** Kichik ro'yxatlar (10–20 yozuv) — farq sezilmaydi, murakkablik esa qo'shiladi.

**Bog'liq:** [17-bob](../17-repository-va-dql.md), [39-bob](../39-arxitektura.md).

---

## P-18 · `JOIN FETCH` bilan N+1 ni yopish

**Muammo.** Ro'yxatda har element uchun aloqador ob'ekt so'raladi — 1 + N so'rov.

**Yechim.** `join` + **`addSelect`** (faqat `join` yetarli emas).

```php
$qb = $this->createQueryBuilder('p')
    ->addSelect('a')                 // ← shusiz N+1 saqlanadi
    ->innerJoin('p.author', 'a')
    ->andWhere('p.status = :status')
    ->setParameter('status', PostStatus::Published);
```

Kolleksiyani fetch qilganda `setMaxResults()` bilan `Paginator(fetchJoinCollection: true)` ishlating, aks holda qatorlar soni noto'g'ri cheklanadi.

**Qachon kerak emas.** Aloqa haqiqatan kerak bo'lmasa — u holda `addSelect` ortiqcha ma'lumot yuklaydi.

**Bog'liq:** [18-bob](../18-aloqalar.md), [P-38](06-testlash.md#p-38--sorovlar-sonini-testlash).

---

## P-19 · Keyset (kursor) paginatsiya

**Muammo.** `OFFSET 100000` — baza 100 000 qatorni o'qib tashlab yuboradi; sahifa raqami oshgani sayin so'rov sekinlashadi. Yangi yozuv qo'shilsa, sahifalar siljiydi va element takrorlanadi.

**Yechim.** Oxirgi ko'rilgan qiymatdan keyin o'qish.

```php
public function pageAfter(?\DateTimeImmutable $lastDate, ?int $lastId, int $limit): array
{
    $qb = $this->createQueryBuilder('p')
        ->orderBy('p.createdAt', 'DESC')
        ->addOrderBy('p.id', 'DESC')
        ->setMaxResults($limit);

    if (null !== $lastDate && null !== $lastId) {
        $qb->andWhere('(p.createdAt < :d) OR (p.createdAt = :d AND p.id < :id)')
           ->setParameter('d', $lastDate)
           ->setParameter('id', $lastId);
    }

    return $qb->getQuery()->getResult();
}
```

**Qachon kerak emas.** "5-sahifaga o'tish" kerak bo'lgan admin jadvallar — u yerda offset zarur.

**Bog'liq:** [17-bob](../17-repository-va-dql.md), [P-05](01-http-qatlam.md#p-05--royxat-javobini-orash-envelope).

---

## P-20 · Bitta so'rov — bitta `flush()`

**Muammo.** Har o'zgarishdan keyin `flush()`: har biri alohida tranzaksiya, N ta round-trip, qisman saqlangan holat xavfi.

**Yechim.** `flush()` — amalning oxirida bir marta; tsikl ichida umuman yo'q.

```php
// ❌
foreach ($items as $item) {
    $order->addLine($item);
    $this->em->flush();
}

// ✅
foreach ($items as $item) {
    $order->addLine($item);
}
$this->em->flush();
```

Bir nechta amal atomik bo'lishi kerak bo'lsa:

```php
$this->em->wrapInTransaction(function () use ($order): void {
    $this->inventory->reserve($order);
    $this->payments->charge($order);
});
```

**Qachon kerak emas.** Katta batch — u yerda har N tadan keyin `flush()` + `clear()` ([P-21](#p-21--batch-ishlov)).

**Bog'liq:** [15-bob](../15-doctrine-asoslari.md).

---

## P-21 · Batch ishlov

**Muammo.** 500 000 yozuvni qayta ishlash xotirani tugatadi: identity map barcha ob'ektni ushlab turadi.

**Yechim.** Oqim bilan o'qish + davriy `flush()` va `clear()`.

```php
$batchSize = 200;
$i = 0;

foreach ($query->toIterable() as $post) {
    $post->archive();

    if (0 === ++$i % $batchSize) {
        $this->em->flush();
        $this->em->clear();          // xotirani bo'shatadi
    }
}

$this->em->flush();
$this->em->clear();
```

`clear()` dan keyin eski entity havolalari yaroqsiz — ularni tsikl tashqarisida saqlamang.

Agar biznes mantiqi kerak bo'lmasa, ORM'ni umuman chetlab o'ting:

```php
$this->connection->executeStatement(
    'UPDATE posts SET status = :s WHERE created_at < :d',
    ['s' => 'archived', 'd' => $before->format('Y-m-d H:i:s')],
);
```

**Qachon kerak emas.** Bir necha yuz yozuv — oddiy tsikl yetarli.

**Bog'liq:** [37-bob](../37-ilgor-doctrine.md), [25-bob](../25-console-va-scheduler.md).

---

## P-22 · Optimistik qulflash

**Muammo.** Ikki foydalanuvchi bir yozuvni tahrirlaydi; ikkinchi saqlash birinchisini jimgina o'chiradi ("lost update").

**Yechim.** `#[ORM\Version]` ustuni + konfliktni 409 ga aylantirish.

```php
#[ORM\Entity]
class Order
{
    #[ORM\Version]
    #[ORM\Column]
    private int $version = 1;
}
```

```php
try {
    $order->addItem($item);
    $this->em->flush();
} catch (OptimisticLockException) {
    throw new ConcurrentModification('Yozuv boshqa foydalanuvchi tomonidan o\'zgartirildi.');
}
```

API darajasida shu g'oya `ETag` + `If-Match` orqali ifodalanadi ([38-bob](../38-api-pro.md)).

**Qachon kerak emas.** Faqat bitta jarayon yozadigan ma'lumot (masalan, import jurnali).

**Bog'liq:** [37-bob](../37-ilgor-doctrine.md).

---

[← Domen modeli](02-domen.md) · [Katalog](README.md) · [Keyingi: Asinxron ishlov →](04-async.md)
