# Patternlar: domen modeli

[← HTTP qatlami](01-http-qatlam.md) · [Katalog](README.md) · [Keyingi: Persistence →](03-persistence.md)

---

## P-08 · Konstruktorda to'liq ob'ekt

**Muammo.** `make:entity` barcha maydonga setter yasaydi. Natijada `new Post()` — bo'sh, yaroqsiz ob'ekt; u `flush()` gacha istalgan holatda bo'lishi mumkin va xato faqat bazada chiqadi.

**Yechim.** Majburiy maydonlar konstruktorda; setter faqat haqiqatan o'zgaradigan maydonlar uchun.

```php
#[ORM\Entity]
class Post
{
    #[ORM\Column(length: 255)]
    private string $title;

    #[ORM\Column(type: Types::DATETIME_IMMUTABLE)]
    private \DateTimeImmutable $createdAt;

    public function __construct(
        string $title,
        private string $slug,
        private string $body,
        #[ORM\ManyToOne] #[ORM\JoinColumn(nullable: false)] private User $author,
        \DateTimeImmutable $now,
    ) {
        $this->title = $title;
        $this->createdAt = $now;
    }
}
```

**Qachon kerak emas.** Faqat o'qish uchun ishlatiladigan, tashqi tizimdan kelgan ma'lumot ko'zgusi (read model) — u DTO bo'lsin.

**Bog'liq:** [15-bob](../15-doctrine-asoslari.md), [A-05](07-antipatternlar.md#a-05--anemic-model-setterlar-todasi).

---

## P-09 · Nomlangan konstruktor

**Muammo.** Bitta konstruktor bir nechta yaratish stsenariysini qoplashga urinadi: `new Order($cart, null, null, true)` — o'qib bo'lmaydi.

**Yechim.** Statik fabrika metodlari, nomi niyatni aytadi.

```php
final class Order
{
    private function __construct(/* ... */) {}

    public static function fromCart(Cart $cart, \DateTimeImmutable $now): self { /* ... */ }

    public static function reorder(self $previous, \DateTimeImmutable $now): self { /* ... */ }
}
```

**Qachon kerak emas.** Bitta yaratish yo'li bor bo'lsa.

**Bog'liq:** [P-08](#p-08--konstruktorda-toliq-obekt).

---

## P-10 · Value object

**Muammo.** `float $price`, `string $email`, `string $currency` — validatsiya har joyda takrorlanadi, birliklar chalkashadi (so'm yoki tiyin?), `float` pul uchun yaxlitlash xatosi beradi.

**Yechim.** Kichik, o'zgarmas (immutable), o'zini o'zi tekshiradigan tip.

```php
namespace App\Domain;

final readonly class Money
{
    public function __construct(
        public int $amountInMinorUnits,
        public string $currency,
    ) {
        if ($amountInMinorUnits < 0) {
            throw new \InvalidArgumentException('Manfiy summa bo\'lishi mumkin emas.');
        }
    }

    public function add(self $other): self
    {
        if ($this->currency !== $other->currency) {
            throw new \DomainException('Valyutalar mos emas.');
        }

        return new self($this->amountInMinorUnits + $other->amountInMinorUnits, $this->currency);
    }
}
```

Doctrine'ga bog'lash: `#[ORM\Embeddable]` yoki custom tip ([37-bob](../37-ilgor-doctrine.md)).

**Qachon kerak emas.** Har satr uchun klass yasash — ortiqcha. Mezon: qiymat bilan bog'liq **qoida** yoki **amal** bormi?

**Bog'liq:** [37-bob](../37-ilgor-doctrine.md).

---

## P-11 · Holat mashinasi (enum + o'tish metodlari)

**Muammo.** `$order->setStatus('shipped')` — istalgan holatdan istalganiga o'tish mumkin; noto'g'ri o'tishlar production'da topiladi.

**Yechim.** Holat — enum; o'tish — ma'noli metod; qoida metod ichida.

```php
enum OrderStatus: string
{
    case Pending = 'pending';
    case Paid = 'paid';
    case Shipped = 'shipped';
    case Cancelled = 'cancelled';

    /** @return list<self> */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Paid, self::Cancelled],
            self::Paid => [self::Shipped, self::Cancelled],
            self::Shipped, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }
}
```

```php
public function ship(\DateTimeImmutable $now): void
{
    if (!$this->status->canTransitionTo(OrderStatus::Shipped)) {
        throw new InvalidOrderTransition($this->status, OrderStatus::Shipped);
    }

    $this->status = OrderStatus::Shipped;
    $this->shippedAt = $now;
}
```

Murakkab oqimlar uchun Symfony **Workflow** komponenti bor — u grafni konfiguratsiyaga chiqaradi va vizuallashtiradi.

**Qachon kerak emas.** Ikki holatli oddiy bayroq (`active`/`inactive`).

**Bog'liq:** [15-bob](../15-doctrine-asoslari.md), <https://symfony.com/doc/current/workflow.html>.

---

## P-12 · Domen istisnosi

**Muammo.** Biznes qoidasi buzilganda `\RuntimeException('error')` tashlanadi: kontekst yo'q, HTTP kodi noma'lum, loglarda ma'nosiz.

**Yechim.** Har qoida uchun nomli istisno + kontekst ma'lumoti.

```php
namespace App\Domain\Order\Exception;

use App\Enum\OrderStatus;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;

#[WithHttpStatus(409)]
final class InvalidOrderTransition extends \DomainException
{
    public function __construct(
        public readonly OrderStatus $from,
        public readonly OrderStatus $to,
    ) {
        parent::__construct(\sprintf('"%s" holatidan "%s" ga o\'tib bo\'lmaydi.', $from->value, $to->value));
    }
}
```

**Qachon kerak emas.** Dasturchi xatosi uchun (`\LogicException`, `\InvalidArgumentException`) — ular biznes holati emas.

**Bog'liq:** [24-bob](../24-xatolik-va-log.md), [P-04](01-http-qatlam.md#p-04--xatoliklarni-protokolga-xaritalash).

---

## P-13 · Domen hodisasi (record → release)

**Muammo.** Buyurtma to'langanda email, hisobot, ombor — hammasi servis ichida ketma-ket chaqiriladi. Yangi reaksiya qo'shish servisni o'zgartirishni talab qiladi; xatolik asosiy amalni yiqitadi.

**Yechim.** Entity hodisani **yozib qo'yadi**, servis `flush()` dan keyin uni tarqatadi.

```php
abstract class AggregateRoot
{
    /** @var list<object> */
    private array $domainEvents = [];

    protected function recordEvent(object $event): void
    {
        $this->domainEvents[] = $event;
    }

    /** @return list<object> */
    public function releaseEvents(): array
    {
        $events = $this->domainEvents;
        $this->domainEvents = [];

        return $events;
    }
}
```

```php
$order->pay($this->clock->now());
$this->em->flush();                                  // tranzaksiya yopildi

foreach ($order->releaseEvents() as $event) {
    $this->bus->dispatch($event);                    // endi yon ta'sirlar
}
```

**Qachon kerak emas.** Yon ta'sir bitta va u asosiy amalning ajralmas qismi bo'lsa (masalan, hisoblagichni oshirish).

**Bog'liq:** [27-bob](../27-event-va-doctrine-hodisalari.md), [P-27](04-async.md#p-27--outbox-dual-write-muammosi).

---

## P-14 · Agregat chegarasi

**Muammo.** `$user->getOrders()` 100 000 ta buyurtmani yuklaydi; ob'ekt grafi butun bazaga cho'ziladi; `cascade: remove` kutilmagan joyda ishlaydi.

**Yechim.** Birga o'zgaradigan ob'ektlarni bitta agregatga yig'ing (Order + OrderLine). Agregatlar orasida **havola emas, ID** saqlang; ro'yxat kerak bo'lsa repository so'rovi bilan oling.

```php
#[ORM\Entity]
class Order
{
    #[ORM\Column]
    private int $customerId;          // User ob'ekti emas — boshqa agregat

    /** @var Collection<int, OrderLine> */
    #[ORM\OneToMany(targetEntity: OrderLine::class, mappedBy: 'order', cascade: ['persist'], orphanRemoval: true)]
    private Collection $lines;        // bir agregat ichida — havola to'g'ri
}
```

**Qachon kerak emas.** Kichik CRUD ilovada bu qattiq qoida ortiqcha; lekin katta kolleksiyalarga havola berish har doim xavfli.

**Bog'liq:** [18-bob](../18-aloqalar.md), [39-bob](../39-arxitektura.md).

---

## P-15 · Vaqtni in'ektsiya qilish (Clock)

**Muammo.** Kod ichida `new \DateTimeImmutable()`: "obuna 30 kundan keyin tugaydi" mantiqini test qilish uchun `sleep()` yoki hiyla kerak.

**Yechim.** `ClockInterface` in'ektsiya qilinadi; testda `MockClock`.

```php
use Symfony\Component\Clock\ClockInterface;

final class SubscriptionRenewer
{
    public function __construct(private ClockInterface $clock)
    {
    }

    public function isExpired(Subscription $subscription): bool
    {
        return $subscription->getExpiresAt() < $this->clock->now();
    }
}
```

```php
$clock = new MockClock('2026-01-01 00:00:00');
$clock->modify('+31 days');
```

**Qachon kerak emas.** Vaqt faqat log yozish uchun ishlatilsa.

**Bog'liq:** [30-bob](../30-testlash.md), [P-41](06-testlash.md#p-41--vaqtni-boshqarish).

---

[← HTTP qatlami](01-http-qatlam.md) · [Katalog](README.md) · [Keyingi: Persistence →](03-persistence.md)
