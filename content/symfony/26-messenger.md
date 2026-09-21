# 26 — Messenger

[← Oldingi: Console va Scheduler](25-console-va-scheduler.md) · [Mundarija](README.md) · [Keyingi: EventDispatcher va Doctrine hodisalari →](27-event-va-doctrine-hodisalari.md)

---

## Nima uchun

HTTP so'rovi ichida email yuborish, rasm qayta ishlash, tashqi API'ga murojaat qilish — uch muammo tug'diradi: foydalanuvchi kutadi, tashqi xizmat ishlamasa so'rov yiqiladi, va yuk cho'qqisida worker'lar band bo'ladi.

Messenger yechimi: ishni **xabar** sifatida navbatga qo'yish, javobni darhol qaytarish, ishni alohida jarayon bajarishi.

```php
// src/Message/SendWelcomeEmail.php
namespace App\Message;

final readonly class SendWelcomeEmail
{
    public function __construct(public int $userId)
    {
    }
}
```

```php
// src/MessageHandler/SendWelcomeEmailHandler.php
namespace App\MessageHandler;

use App\Message\SendWelcomeEmail;
use App\Repository\UserRepository;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\Exception\UnrecoverableMessageHandlingException;

#[AsMessageHandler]
final class SendWelcomeEmailHandler
{
    public function __construct(
        private UserRepository $users,
        private MailerInterface $mailer,
    ) {
    }

    public function __invoke(SendWelcomeEmail $message): void
    {
        $user = $this->users->find($message->userId);

        if (null === $user) {
            // foydalanuvchi o'chirilgan — qayta urinish befoyda
            throw new UnrecoverableMessageHandlingException('User not found.');
        }

        $this->mailer->send(/* ... */);
    }
}
```

```php
use Symfony\Component\Messenger\MessageBusInterface;

$bus->dispatch(new SendWelcomeEmail($user->getId()));
```

**Xabarda entity emas, ID uzating.** Sabab: xabar serializatsiya qilinadi va bir necha daqiqadan keyin boshqa jarayonda ochiladi. Serializatsiya qilingan entity — o'sha paytdagi eskirgan nusxa; ID esa handler'ga dolzarb ma'lumotni yuklash imkonini beradi.

---

## Transportlar va marshrutlash

```yaml
# config/packages/messenger.yaml
framework:
    messenger:
        failure_transport: failed

        transports:
            async:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                retry_strategy:
                    max_retries: 3
                    delay: 1000
                    multiplier: 2
                    max_delay: 60000
                    jitter: 0.2

            async_priority_high:
                dsn: '%env(MESSENGER_TRANSPORT_DSN)%'
                options:
                    queue_name: high

            failed: 'doctrine://default?queue_name=failed'

        routing:
            'App\Message\SendWelcomeEmail': async
            'App\Message\ProcessPayment': async_priority_high

when@test:
    framework:
        messenger:
            transports:
                async: 'in-memory://'
                async_priority_high: 'in-memory://'
```

Ishga tushirish:

```shell
php bin/console messenger:consume async_priority_high async --time-limit=3600 --memory-limit=128M -vv
php bin/console messenger:stats
php bin/console messenger:stop-workers
```

`--time-limit` va `--memory-limit` **majburiy amaliyot**: PHP uzoq ishlaganda xotira sekin o'sadi (kutubxonalar, Doctrine identity map, statik kesh). Worker'ni vaqti-vaqti bilan qayta ishga tushirish — eng arzon yechim; supervisor uni avtomatik ko'taradi.

---

## Qayta urinish va muvaffaqiyatsizlik

Retry strategiyasi eksponensial: 1s → 2s → 4s ... `jitter` esa tasodifiylik qo'shadi, shunda minglab xabar bir vaqtda qayta urinmaydi.

Ikki turdagi istisno:

```php
use Symfony\Component\Messenger\Exception\RecoverableMessageHandlingException;
use Symfony\Component\Messenger\Exception\UnrecoverableMessageHandlingException;

throw new UnrecoverableMessageHandlingException('Invalid payload');   // umuman qayta urinmaslik
throw new RecoverableMessageHandlingException('Rate limited', retryDelay: 30000);  // aniq kechikish bilan
```

`max_retries` tugaganda xabar `failed` transportiga o'tadi:

```shell
php bin/console messenger:failed:show --stats
php bin/console messenger:failed:show 42 -vv
php bin/console messenger:failed:retry 42 --force
php bin/console messenger:failed:remove 42
```

**`failure_transport` ni sozlamaslik — eng qimmat konfiguratsiya xatosi:** bu holda muvaffaqiyatsiz xabar shunchaki yo'qoladi. To'lov tasdig'i yoki buyurtma bildirishnomasi yo'qolgani bir necha oydan keyin, mijoz shikoyat qilganda ma'lum bo'ladi.

---

## Sinxron va asinxron

```yaml
framework:
    messenger:
        transports:
            sync: 'sync://'
        routing:
            'App\Message\GenerateInvoice': sync   # darhol, o'sha so'rovda
```

Bu foydali naqsh: kodni **hozir sinxron**, keyinchalik esa konfiguratsiyani o'zgartirib asinxron qilish mumkin. Handler kodi o'zgarmaydi.

Kechiktirish:

```php
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\Stamp\DelayStamp;

$bus->dispatch(new Envelope(new SendReminder($id), [new DelayStamp(3_600_000)]));   // 1 soatdan keyin
```

---

## Tranzaksiya va xabar tartibi

Klassik xato:

```php
$em->persist($order);
$bus->dispatch(new ProcessPayment($order->getId()));   // ❌ hali flush qilinmagan!
$em->flush();
```

Worker xabarni `flush()` dan oldin olib, bazada hali mavjud bo'lmagan buyurtmani qidiradi. Yechim — Doctrine transaction middleware yoki `flush()` dan keyin dispatch qilish:

```yaml
framework:
    messenger:
        buses:
            messenger.bus.default:
                middleware:
                    - doctrine_transaction
```

Bu middleware handler'ni tranzaksiyaga o'raydi. Dispatch tartibi uchun esa eng ishonchli naqsh — **outbox**: xabarni bir xil tranzaksiyada bazaga yozish (`doctrine://` transport aynan shunday ishlaydi, agar dispatch `flush()` bilan bir tranzaksiyada bo'lsa).

---

## Muhandislik nuqtai nazari: asinxron ishlashning qoidalari

Navbat qo'shilishi bilan tizim **taqsimlangan** bo'ladi, va taqsimlangan tizim qoidalari kuchga kiradi.

**1. "Kamida bir marta" yetkazish.** Xabar bir necha marta yetkazilishi mumkin (worker xabarni bajargan, lekin tasdiqlashdan oldin o'lgan). Demak handler **idempotent** bo'lishi kerak:

```php
public function __invoke(ProcessPayment $message): void
{
    if ($this->payments->isProcessed($message->paymentId)) {
        return;   // allaqachon bajarilgan
    }

    // ...
}
```

Idempotentlik kalitini xabarga qo'shish (`$message->idempotencyKey`) — eng ishonchli usul ([38-bob](38-api-pro.md)).

**2. Tartib kafolatlanmaydi.** Bir nechta worker parallel ishlaydi. Agar tartib muhim bo'lsa: bir workerli navbat, yoki kalit bo'yicha partitsiyalash, yoki xabarda versiya raqami.

**3. Xabar — bu kontrakt.** Deploy davomida eski worker yangi xabarni (yoki aksincha) ochishi mumkin. Shuning uchun: yangi maydonlar **ixtiyoriy** bo'lsin; buzuvchi o'zgarish kerak bo'lsa yangi klass (`SendInvoiceV2`) yarating, ikkalasini bir muddat qo'llab-quvvatlang, navbat bo'shagach eskisini o'chiring.

**4. Yon ta'sirlarni ajrating.** Bitta handler ichida to'lov, email va hisobot — birortasi yiqilsa hammasi qayta urinadi (va email ikki marta ketadi). To'g'ri yondashuv: bitta handler — bitta yon ta'sir; kerak bo'lsa handler yangi xabar dispatch qilsin.

**5. Monitoring.** Kuzatilishi kerak bo'lgan metrikalar: navbat uzunligi (o'sib borayotganmi), eng eski xabar yoshi, `failed` transportidagi xabarlar soni, worker'lar soni. `messenger:stats` — boshlanish nuqtasi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `failure_transport` sozlanmagan | Muvaffaqiyatsiz xabarlar yo'qoladi | `failed` transport + monitoring |
| Xabarda entity uzatish | Eskirgan ma'lumot, serializatsiya muammolari | ID uzating |
| Handler idempotent emas | Takroriy yetkazishda dublikat effekt | Idempotentlik tekshiruvi |
| `flush()` dan oldin dispatch | Worker mavjud bo'lmagan yozuvni qidiradi | `doctrine_transaction` middleware / keyin dispatch |
| `--time-limit` / `--memory-limit` yo'q | Xotira sizishi, worker "osilib" qoladi | Ikkalasini ham qo'ying |
| Retry strategiyasini cheksiz qilish | Buzuq xabar navbatni band qiladi | `max_retries` + `Unrecoverable...` |
| Testda haqiqiy transport ishlatish | Sekin, beqaror testlar | `in-memory://` |
| Bitta handler'da bir nechta yon ta'sir | Qayta urinishda takrorlanish | Bir handler — bir vazifa |

---

## Amaliyot

1. `SendWelcomeEmail` xabari va handler'ini yozing, `async` transportga yo'naltiring va `messenger:consume` bilan bajarilishini ko'ring.
2. Handler ichida ataylab istisno tashlang; retry'larni `-vv` rejimida kuzating va xabar `failed` ga tushganini `messenger:failed:show` bilan tasdiqlang.
3. `messenger:failed:retry --force` bilan qayta ishga tushiring.
4. Testda `in-memory://` transportini sozlang va endpoint xabarni dispatch qilganini `getSent()` bilan tekshiring.
5. Handler'ga idempotentlik tekshiruvini qo'shing va bir xil xabarni ikki marta bajarib, ikkinchisida hech narsa o'zgarmasligini tasdiqlang.

---

## Bog'liq patternlar

[P-24 Idempotent handler, P-26 Xatolarni tasniflash, P-27 Outbox](patterns/04-async.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Messenger: <https://symfony.com/doc/current/messenger.html>
- Transportlar va retry: <https://symfony.com/doc/current/messenger.html#transports-async-queued-messages>
- Middleware: <https://symfony.com/doc/current/messenger/middleware.html>
- Doctrine bilan ishlash: <https://symfony.com/doc/current/messenger.html#messenger-handling-doctrine-entities>
- Worker'larni deploy qilish: <https://symfony.com/doc/current/messenger.html#deploying-to-production>

---

[← Oldingi: Console va Scheduler](25-console-va-scheduler.md) · [Mundarija](README.md) · [Keyingi: EventDispatcher va Doctrine hodisalari →](27-event-va-doctrine-hodisalari.md)
