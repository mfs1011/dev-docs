# 27 — EventDispatcher va Doctrine hodisalari

[← Oldingi: Messenger](26-messenger.md) · [Mundarija](README.md) · [Keyingi: Cache, Lock, HttpClient →](28-cache-lock-httpclient.md)

---

Bu bob [12-bobning](12-event-listener.md) davomi: u yerda framework eventlari edi, bu yerda **domen hodisalari** va **Doctrine lifecycle hodisalari**.

---

## Doctrine hodisalari: uch mexanizm

| Mexanizm | Qamrov | Qachon |
| --- | --- | --- |
| Lifecycle callback | Bitta entity, o'z ichida metod | Oddiy, bog'liqliksiz ish (`updatedAt` ni yangilash) |
| Entity listener (`#[AsEntityListener]`) | Bitta entity klassi, alohida servis | Bog'liqlik kerak bo'lganda |
| Global listener (`#[AsDoctrineListener]`) | Barcha entity'lar | Kesuvchi vazifalar (audit, ko'p ijarachilik) |

### Lifecycle callback

```php
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Clock\DatePoint;

#[ORM\Entity]
#[ORM\HasLifecycleCallbacks]
class Post
{
    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $updatedAt;

    #[ORM\PreUpdate]
    public function touch(): void
    {
        $this->updatedAt = new DatePoint();
    }
}
```

### Entity listener

```php
namespace App\Doctrine;

use App\Entity\Post;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsEntityListener;
use Doctrine\ORM\Event\PostPersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Component\Messenger\MessageBusInterface;

#[AsEntityListener(event: Events::postPersist, method: 'onPostPersist', entity: Post::class)]
final class PostIndexer
{
    public function __construct(private MessageBusInterface $bus)
    {
    }

    public function onPostPersist(Post $post, PostPersistEventArgs $args): void
    {
        $this->bus->dispatch(new IndexPost($post->getId()));
    }
}
```

### Global listener

```php
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PreUpdateEventArgs;
use Doctrine\ORM\Events;

#[AsDoctrineListener(event: Events::preUpdate)]
final class AuditListener
{
    public function __invoke(PreUpdateEventArgs $args): void
    {
        // har qanday entity yangilanishida
    }
}
```

---

## Doctrine hodisalarining xavfli joylari

Bu hodisalar **`flush()` ning ichida**, tranzaksiya o'rtasida ishlaydi. Bu uchta qat'iy cheklov qo'yadi:

1. **`flush()` ni chaqirmang.** `postPersist` ichida yana `flush()` — cheksiz rekursiya yoki kutilmagan holat.
2. **Yangi entity'larni oddiy usulda saqlab bo'lmaydi.** `prePersist`/`preUpdate` ichida yangi ob'ekt qo'shish uchun `UnitOfWork` bilan qo'lda ishlash kerak — bu mo'rt kod.
3. **Tashqi yon ta'sir qilmang.** `postPersist` da email yuborsangiz va keyin tranzaksiya rollback bo'lsa — email allaqachon ketgan, ma'lumot esa yo'q. Klassik nomuvofiqlik.

`preUpdate` qo'shimcha cheklovga ega: u faqat **o'zgargan maydonlari bor** entity uchun ishlaydi va u yerda boshqa maydonni o'zgartirish uchun `$args->setNewValue()` ishlatish kerak.

**Amaliy qoida:** Doctrine hodisasida faqat **bir xil entity ichidagi sof ma'lumot o'zgarishi** qiling; har qanday yon ta'sirni xabarga aylantiring va uni `flush()` dan keyin bajaring.

---

## Domen hodisalari: xavfsiz naqsh

```php
namespace App\Entity;

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
#[ORM\Entity]
class Order extends AggregateRoot
{
    public function pay(\DateTimeImmutable $now): void
    {
        if (OrderStatus::Pending !== $this->status) {
            throw new \DomainException('Faqat kutilayotgan buyurtmani to\'lash mumkin.');
        }

        $this->status = OrderStatus::Paid;
        $this->paidAt = $now;

        $this->recordEvent(new OrderPaid($this->id, $now));
    }
}
```

```php
final class OrderPayer
{
    public function __construct(
        private EntityManagerInterface $em,
        private MessageBusInterface $bus,
    ) {
    }

    public function pay(Order $order): void
    {
        $order->pay(new DatePoint());

        $this->em->flush();                        // 1) tranzaksiya yopildi

        foreach ($order->releaseEvents() as $event) {
            $this->bus->dispatch($event);          // 2) endi yon ta'sirlar
        }
    }
}
```

Nima uchun bu naqsh yaxshi:

- **Entity o'z hodisasini o'zi e'lon qiladi** — biznes mantiq bitta joyda, domen tilida.
- **Yon ta'sirlar tranzaksiyadan keyin** ishlaydi — rollback bo'lsa hech kimga xabar ketmaydi.
- **Testlash oson**: `releaseEvents()` da kerakli hodisa borligini tekshirasiz, hech qanday infratuzilmasiz.

---

## Sinxron event yoki Messenger?

| Savol | Sinxron event | Messenger xabari |
| --- | --- | --- |
| Natija darhol kerakmi? | Ha | Yo'q |
| Xatolik asosiy amalni to'xtatishi kerakmi? | Ha | Yo'q (retry bor) |
| Ish uzoq davom etadimi (I/O, tashqi API)? | Yo'q | Ha |
| Qayta urinish kerakmi? | Yo'q | Ha |

Amaliy qoida: **domen hodisasi → Messenger xabari**, ichki koordinatsiya → sinxron event. "Buyurtma to'landi → email + hisobot + omborga xabar" — uchalasi ham alohida xabar bo'lishi kerak, chunki ularning har biri alohida sabab bilan yiqilishi va alohida qayta urinishi mumkin.

---

## Muhandislik nuqtai nazari: nomuvofiqlik oynasi

`flush()` dan keyin xabar dispatch qilish naqshida nozik muammo bor: tranzaksiya muvaffaqiyatli tugadi, lekin xabar yuborilishidan oldin jarayon o'lsa — hodisa yo'qoladi.

Bu — taqsimlangan tizimlarning klassik "dual write" muammosi: ikkita tizimga (baza va navbat) atomik yozib bo'lmaydi. Yechimlar:

1. **Outbox naqshi.** Xabarni **o'sha tranzaksiyada** bazaga yozing (Doctrine transport aynan shunday ishlaydi), keyin alohida jarayon uni navbatga uzatadi. Atomiklik ta'minlanadi.
2. **Idempotentlik + qayta hisoblash.** Xabar yo'qolsa, uni davriy sverka (reconciliation) jarayoni topadi va qayta yuboradi.
3. **Qabul qilish.** Ba'zi hodisalar uchun yo'qotish narxi past (masalan, tavsiya sistemasiga signal). Bu ham qaror — lekin **ongli** qaror bo'lishi kerak.

Tanlov mezoni oddiy: hodisa yo'qolsa pul yoki ishonch yo'qoladimi? Ha bo'lsa — outbox.

Ikkinchi muhim mavzu — **hodisa nomlari va ma'nosi**. Hodisa o'tgan zamonda va domen tilida bo'lsin: `OrderPaid`, `InvoiceIssued`. `EntityUpdated` kabi texnik hodisalar hech narsa anglatmaydi: tinglovchi nima o'zgarganini bilmaydi va baribir barcha maydonlarni tekshirishga majbur bo'ladi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `postPersist` da email yuborish | Rollback bo'lsa email allaqachon ketgan | Hodisani yozib, `flush()` dan keyin dispatch |
| Doctrine listener ichida `flush()` | Rekursiya, kutilmagan holat | Faqat entity ma'lumotini o'zgartiring |
| Lifecycle callback'ga bog'liqlik kerak bo'lishi | Callback servis emas, in'ektsiya yo'q | `#[AsEntityListener]` |
| `preUpdate` da boshqa entity'ni o'zgartirish | O'zgarish saqlanmasligi mumkin | Alohida jarayon/xabar |
| Domen hodisasini kontrollerda yaratish | Mantiq tarqaladi, CLI yo'lida ishlamaydi | Entity `recordEvent()` qilsin |
| Texnik nomli hodisalar (`EntityUpdated`) | Ma'no yo'q, tinglovchi tekshirishga majbur | Domen tilidagi nom |
| Global `preUpdate` listener'ida og'ir mantiq | Har `flush()` sekinlashadi | Aniq entity uchun listener |

---

## Amaliyot

1. `Post` entity'ga `#[ORM\PreUpdate]` bilan `updatedAt` yangilanishini qo'shing va ishlashini tasdiqlang.
2. `#[AsEntityListener]` bilan `postPersist` da indekslash xabarini dispatch qiling.
3. `AggregateRoot` + `recordEvent()` naqshini `Order::pay()` uchun joriy qiling.
4. `flush()` dan keyin hodisalarni dispatch qiluvchi servis yozing va unit test bilan hodisa yozilganini tekshiring.
5. Tranzaksiyani ataylab yiqiting (istisno) va email xabari **dispatch qilinmaganini** tasdiqlang.

---

## Rasmiy hujjat

- Doctrine hodisalari: <https://symfony.com/doc/current/doctrine/events.html>
- Doctrine ORM events (rasmiy): <https://www.doctrine-project.org/projects/doctrine-orm/en/current/reference/events.html>
- EventDispatcher: <https://symfony.com/doc/current/event_dispatcher.html>
- Messenger: <https://symfony.com/doc/current/messenger.html>

---

[← Oldingi: Messenger](26-messenger.md) · [Mundarija](README.md) · [Keyingi: Cache, Lock, HttpClient →](28-cache-lock-httpclient.md)
