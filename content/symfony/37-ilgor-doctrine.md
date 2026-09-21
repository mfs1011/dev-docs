# 37 — Ilg'or Doctrine va unumdorlik

[← Oldingi: Tarjima va Intl](36-tarjima-va-intl.md) · [Mundarija](README.md) · [Keyingi: API pro →](38-api-pro.md)

---

## Batch processing: katta hajmlar bilan ishlash

```php
public function archiveOldPosts(\DateTimeImmutable $before): int
{
    $batchSize = 200;
    $processed = 0;

    $query = $this->em->createQuery(
        'SELECT p FROM App\Entity\Post p WHERE p.createdAt < :before AND p.status != :archived'
    )->setParameter('before', $before)
     ->setParameter('archived', PostStatus::Archived);

    foreach ($query->toIterable() as $post) {
        $post->archive();

        if (0 === ++$processed % $batchSize) {
            $this->em->flush();
            $this->em->clear();      // identity map ni tozalash — xotira uchun hal qiluvchi
        }
    }

    $this->em->flush();
    $this->em->clear();

    return $processed;
}
```

Ikki mexanizm birga ishlaydi:

- **`toIterable()`** — barcha natijani massivga yig'masdan, qator-qator o'qiydi.
- **`clear()`** — Doctrine kuzatayotgan ob'ektlarni unutadi. Busiz identity map o'sib boraveradi va 100 000 qatorda xotira tugaydi.

**Ogohlantirish:** `clear()` dan keyin barcha eski entity havolalari "detached" bo'ladi — ularni ishlatish xatoga olib keladi. Shuning uchun tsikl tashqarisida entity saqlamang.

Sof massiv yangilash uchun ORM umuman kerak emas:

```php
$this->em->getConnection()->executeStatement(
    'UPDATE posts SET status = :archived WHERE created_at < :before',
    ['archived' => 'archived', 'before' => $before->format('Y-m-d H:i:s')],
);
```

Bitta so'rov milliondan ortiq qatorni bir necha soniyada yangilaydi. ORM'ni faqat **biznes mantiqi har bir yozuvga kerak bo'lganda** ishlating.

---

## Konkurrentlik: optimistik va pessimistik qulflash

Ikki foydalanuvchi bir vaqtda bir buyurtmani tahrirlasa, oxirgisi birinchisining o'zgarishini jimgina o'chirib yuboradi ("lost update"). Ikki yechim bor.

### Optimistik qulflash

```php
#[ORM\Entity]
class Order
{
    #[ORM\Version]
    #[ORM\Column]
    private int $version = 1;
}
```

Har `UPDATE` da `WHERE version = :old` sharti qo'shiladi va `version` oshiriladi. Boshqa jarayon oldin yangilagan bo'lsa, `OptimisticLockException` chiqadi:

```php
try {
    $order->addItem($item);
    $this->em->flush();
} catch (OptimisticLockException) {
    throw new ConflictException('Buyurtma boshqa foydalanuvchi tomonidan o\'zgartirildi.');
}
```

API'da bu **409 Conflict** ga aylanadi — mijoz qayta o'qib, qayta urinadi.

### Pessimistik qulflash

```php
$this->em->wrapInTransaction(function (EntityManagerInterface $em) use ($accountId): void {
    $account = $em->find(Account::class, $accountId, LockMode::PESSIMISTIC_WRITE);
    $account->withdraw(1000);
});
```

Bu `SELECT ... FOR UPDATE` qiladi: qator tranzaksiya tugaguncha bloklanadi.

| | Optimistik | Pessimistik |
| --- | --- | --- |
| Qachon | Konflikt kam uchraydi | Konflikt tez-tez, yoki narxi yuqori (pul) |
| Narxi | Konfliktda qayta ishlash | Bloklash, deadlock xavfi |
| Tarmoq | Uzoq "o'ylash vaqti" bilan ishlaydi (web forma) | Tranzaksiya qisqa bo'lishi shart |

**Qoida:** foydalanuvchi formani to'ldirayotgan vaqt uchun hech qachon pessimistik qulf ushlamang — tranzaksiyani odam tezligiga bog'lash bazani qulatadi.

---

## Custom tip va JSON

```php
namespace App\Doctrine\Type;

use App\Domain\Money;
use Doctrine\DBAL\Platforms\AbstractPlatform;
use Doctrine\DBAL\Types\Type;

final class MoneyType extends Type
{
    public const NAME = 'money';

    public function getSQLDeclaration(array $column, AbstractPlatform $platform): string
    {
        return $platform->getIntegerTypeDeclarationSQL($column);
    }

    public function convertToPHPValue(mixed $value, AbstractPlatform $platform): ?Money
    {
        return null === $value ? null : new Money((int) $value, 'UZS');
    }

    public function convertToDatabaseValue(mixed $value, AbstractPlatform $platform): ?int
    {
        return $value instanceof Money ? $value->amountInMinorUnits : null;
    }

    public function getName(): string
    {
        return self::NAME;
    }
}
```

```yaml
doctrine:
    dbal:
        types:
            money: App\Doctrine\Type\MoneyType
```

JSON ustunlar bilan ishlashda: PostgreSQL'da `jsonb` indekslanadi va so'rov qilinadi, lekin **sxemasiz ma'lumot — sxemasiz muammolar**. JSON'ni "hozircha shunday qo'yaylik" deb ishlatmang; u faqat haqiqatan o'zgaruvchan tuzilmalar uchun (masalan, tashqi API javobining xom nusxasi).

---

## Ikkinchi daraja kesh (second level cache)

```yaml
doctrine:
    orm:
        second_level_cache:
            enabled: true
            regions:
                reference_data:
                    lifetime: 3600
```

```php
#[ORM\Entity]
#[ORM\Cache(usage: 'READ_ONLY', region: 'reference_data')]
class Country {}
```

Faqat **kam o'zgaradigan, ko'p o'qiladigan** ma'lumotlar uchun (mamlakatlar, valyutalar, kategoriyalar). O'zgaruvchan ma'lumotda u nomuvofiqlik va murakkab invalidatsiya keltiradi — ko'pincha oddiy kesh puli ([28-bob](28-cache-lock-httpclient.md)) tushunarliroq yechim.

---

## Muhandislik nuqtai nazari: ORM va baza o'rtasidagi chegara

Senior darajadagi asosiy tushuncha: **ORM — ma'lumotlar bazasi bilan ishlashning yagona usuli emas**. To'g'ri vositani tanlash mezonlari:

| Vazifa | To'g'ri vosita |
| --- | --- |
| Bitta ob'ektni yuklash, biznes metodini chaqirish, saqlash | ORM |
| Ro'yxat/hisobot (faqat o'qish) | DQL + `getArrayResult()` yoki DBAL |
| Ommaviy yangilash/o'chirish | DBAL (xom SQL) |
| Murakkab analitik so'rov (window funksiyalar, CTE) | DBAL |
| Import/eksport (minglab qator) | DBAL + batch |

Bu "ORM yomon" degani emas: ORM **domen mantiqini** ifodalash uchun ajoyib, lekin u **to'plamlar bilan ishlash** uchun mo'ljallanmagan.

Yana ikkita muhim tushuncha:

**Tranzaksiya izolyatsiya darajasi.** PostgreSQL'da standart `READ COMMITTED`: bir tranzaksiya ichida bir xil so'rov ikki marta turli natija berishi mumkin. Pul yoki hisoblagichlar bilan ishlaganda bu muhim; `SERIALIZABLE` yoki aniq qulflash kerak bo'lishi mumkin.

**Ulanishlar puli.** Har PHP-FPM worker'i o'z DB ulanishini ochadi. 100 worker × 3 server = 300 ulanish, PostgreSQL standarti esa ~100. Yechim — PgBouncer kabi pooler. Bu "PHP kodida ko'rinmaydigan", lekin production'ni qulataydigan chegaralardan biri.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Batch'da `clear()` qilmaslik | Xotira tugaydi | Har N tadan keyin `flush()` + `clear()` |
| `clear()` dan keyin eski entity'ni ishlatish | Detached ob'ekt xatosi | Havolalarni saqlamang |
| Ommaviy yangilashni ORM bilan qilish | Minglab `UPDATE`, sekin | DBAL bitta so'rov |
| Konkurrentlikni umuman hisobga olmaslik | Lost update, noto'g'ri balans | `#[ORM\Version]` yoki `FOR UPDATE` |
| Foydalanuvchi "o'ylash vaqti"da pessimistik qulf | Baza bloklanadi | Optimistik qulflash |
| Ikkinchi daraja keshni o'zgaruvchan ma'lumotga qo'yish | Nomuvofiqlik | Faqat reference data |
| Hamma narsani JSON ustunga solish | So'rov va validatsiya qiyin | Normal sxema |
| Ulanishlar pulini hisobga olmaslik | "too many connections" | PgBouncer / limitlarni hisoblash |

---

## Amaliyot

1. 100 000 qatorli jadvalda `toIterable()` + `clear()` bilan batch yangilash yozing va xotira cho'qqisini `clear()` siz variant bilan solishtiring.
2. Xuddi shu vazifani DBAL bilan bitta `UPDATE` qilib yozing va vaqtni o'lchang.
3. `#[ORM\Version]` qo'shing va ikkita parallel yangilash bilan `OptimisticLockException` ni chaqiring; uni 409 ga aylantiring.
4. `MoneyType` custom tipini yozing va migratsiyada ustun tipi to'g'ri ekanini tekshiring.
5. `EXPLAIN ANALYZE` bilan eng sekin so'rovingizni tahlil qiling va indeks qo'shib, rejaning qanday o'zgarganini yozib oling.

---

## Rasmiy hujjat

- Batch processing: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/batch-processing.html>
- Qulflash: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/transactions-and-concurrency.html>
- Custom mapping tiplari: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/cookbook/custom-mapping-types.html>
- Second level cache: <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/second-level-cache.html>
- DBAL: <https://www.doctrine-project.org/projects/doctrine-dbal/en/current/reference/data-retrieval-and-manipulation.html>

---

[← Oldingi: Tarjima va Intl](36-tarjima-va-intl.md) · [Mundarija](README.md) · [Keyingi: API pro →](38-api-pro.md)
