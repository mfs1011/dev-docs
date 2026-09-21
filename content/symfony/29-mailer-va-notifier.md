# 29 — Mailer va Notifier

[← Oldingi: Cache, Lock, HttpClient](28-cache-lock-httpclient.md) · [Mundarija](README.md) · [Keyingi: Testlash →](30-testlash.md)

---

## Mailer

```shell
composer require symfony/mailer
```

```bash
# .env.local
MAILER_DSN=smtp://user:pass@smtp.example.com:587
# yoki uchinchi tomon bridge'lari:
# MAILER_DSN=brevo+api://KEY@default
# MAILER_DSN=postmark+api://KEY@default
```

```php
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

final class WelcomeMailer
{
    public function __construct(private MailerInterface $mailer)
    {
    }

    public function send(User $user): void
    {
        $email = new TemplatedEmail()
            ->from(new Address('noreply@example.com', 'Example'))
            ->to(new Address($user->getEmail(), $user->getName()))
            ->subject('Xush kelibsiz!')
            ->htmlTemplate('emails/welcome.html.twig')
            ->context([
                'user' => $user,
                'activationUrl' => $this->urlGenerator->generate(/* ... */),
            ]);

        $this->mailer->send($email);
    }
}
```

`TemplatedEmail` matnli (`text/plain`) versiyani HTML'dan avtomatik yasaydi — bu spam filtrlar uchun ham, matnli mijozlar uchun ham muhim.

Fayl biriktirish va inline rasm:

```php
$email->addPart(new DataPart(new File('/path/invoice.pdf'), 'invoice.pdf', 'application/pdf'));
```

```twig
{# templates/emails/welcome.html.twig #}
<img src="{{ email.image('@images/logo.png') }}" alt="Logo">
```

---

## Asinxron yuborish — deyarli har doim to'g'ri

```yaml
framework:
    messenger:
        routing:
            Symfony\Component\Mailer\Messenger\SendEmailMessage: async
```

Shu bitta qator bilan `$mailer->send()` endi xatni **navbatga qo'yadi** ([26-bob](26-messenger.md)). Nega bu muhim:

- SMTP server sekin javob bersa, foydalanuvchi kutmaydi;
- SMTP vaqtincha ishlamasa, so'rov yiqilmaydi — Messenger qayta uradi;
- xat yuborish tranzaksiya bilan aralashmaydi.

Lokal ishlab chiqishda `compose.override.yaml` dagi **Mailpit** barcha xatlarni tutib qoladi va veb-interfeysda ko'rsatadi (`MAILER_DSN=smtp://localhost:1025`). Haqiqiy manzilga tasodifan xat ketishining oldini oladi.

Yuborishni butunlay to'xtatish yoki bitta manzilga yo'naltirish:

```yaml
when@dev:
    framework:
        mailer:
            envelope:
                recipients: ['dev@example.com']   # barcha xatlar shu manzilga
```

---

## Notifier

```shell
composer require symfony/notifier
```

```php
use Symfony\Component\Notifier\Notification\Notification;
use Symfony\Component\Notifier\NotifierInterface;
use Symfony\Component\Notifier\Recipient\Recipient;

final class OrderNotifier
{
    public function __construct(private NotifierInterface $notifier)
    {
    }

    public function notifyShipped(Order $order): void
    {
        $notification = new Notification('Buyurtmangiz jo\'natildi', ['email', 'sms'])
            ->content(\sprintf('Buyurtma #%d yo\'lda.', $order->getId()))
            ->importance(Notification::IMPORTANCE_HIGH);

        $recipient = new Recipient(
            $order->getCustomerEmail(),
            $order->getCustomerPhone(),
        );

        $this->notifier->send($notification, $recipient);
    }
}
```

```yaml
framework:
    notifier:
        texter_transports:
            twilio: '%env(TWILIO_DSN)%'
        chatter_transports:
            slack: '%env(SLACK_DSN)%'
        channel_policy:
            urgent: ['sms', 'chat/slack']
            high: ['email', 'sms']
            medium: ['email']
            low: ['email']
```

Notifier'ning asosiy g'oyasi — **kanal tanlovini kodga emas, konfiguratsiyaga chiqarish**. Kod "bu muhim xabar" deydi, qaysi kanal ishlatilishini `channel_policy` hal qiladi.

Monitoring uchun ayniqsa qulay: `Notifier` orqali muhim xatolarni Slack'ga yuborish mumkin ([24-bob](24-xatolik-va-log.md)).

---

## Muhandislik nuqtai nazari: xabar yuborish tizimining qoidalari

**1. Yuborish — yon ta'sir, uni tranzaksiyadan chiqaring.** Buyurtma saqlanmasa, xat ketmasligi kerak; xat ketmasa, buyurtma bekor bo'lmasligi kerak. Yechim — [27-bobdagi](27-event-va-doctrine-hodisalari.md) naqsh: `flush()` → hodisa → xabar → yuborish.

**2. Idempotentlik.** Messenger "kamida bir marta" yetkazadi, ya'ni handler ikki marta ishlashi mumkin. Email ikki marta ketishi — yomon tajriba, hisob-faktura ikki marta ketishi — jiddiy muammo. Yechim: yuborilgan xabarlarni ro'yxatga olish (`notification_log` jadvali + noyob kalit).

**3. Yetkazib berish — kafolat emas.** SMTP `250 OK` qaytarishi xat **qabul qilinganini** bildiradi, **yetkazilganini** emas. Haqiqiy holat uchun provayder webhook'lari (bounce, complaint) kerak. Bounce'larni e'tiborsiz qoldirish domeningiz obro'sini tushiradi.

**4. Shablonlar va mazmun.** Har xat uchun: ochiq matn versiyasi, obunani bekor qilish havolasi (marketing xatlarida qonuniy talab), `List-Unsubscribe` sarlavhasi, va **shaxsiy ma'lumotlarni minimallashtirish** — xat pochta serverlari orqali o'tadi va uzoq saqlanadi.

**5. Test qiling.** `MailerAssertionsTrait` bilan:

```php
use Symfony\Bundle\FrameworkBundle\Test\MailerAssertionsTrait;

self::assertEmailCount(1);
$email = self::getMailerMessage();
self::assertEmailHtmlBodyContains($email, 'Xush kelibsiz');
self::assertEmailAddressContains($email, 'To', 'user@example.com');
```

Bu testlar arzon va ular "xat ketdimi?" savolini har deploy'da avtomatik tekshiradi ([30-bob](30-testlash.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Xatni so'rov ichida sinxron yuborish | Foydalanuvchi kutadi, SMTP yiqilsa so'rov yiqiladi | `SendEmailMessage` → `async` |
| `postPersist` da xat yuborish | Rollback bo'lsa xat allaqachon ketgan | `flush()` dan keyin hodisa orqali |
| Handler idempotent emas | Takroriy xat | Yuborish jurnali + noyob kalit |
| Dev muhitda haqiqiy manzillarga yuborish | Mijozlarga test xatlari ketadi | Mailpit yoki `envelope.recipients` |
| Faqat HTML versiyasini yuborish | Spam filtrlar, matnli mijozlar | `TemplatedEmail` (avtomatik matn) |
| Bounce/complaint'larni kuzatmaslik | Domen obro'si tushadi, xatlar spamga tushadi | Provayder webhook'lari |
| Xat mazmunini to'liq loglash | Shaxsiy ma'lumot loglarda qoladi | Faqat metama'lumot loglang |

---

## Amaliyot

1. `MAILER_DSN` ni Mailpit'ga yo'naltiring, `TemplatedEmail` bilan xush kelibsiz xatini yuboring va Mailpit interfeysida ko'ring.
2. `SendEmailMessage` ni `async` ga yo'naltiring va `messenger:consume` ishlamayotganda xat navbatda turganini tasdiqlang.
3. `MailerAssertionsTrait` bilan test yozing: ro'yxatdan o'tish endpoint'i bitta xat yuborishini tekshiring.
4. Xat yuborish jurnalini (`notification_log`) qo'shing va handler'ni idempotent qiling.
5. Notifier orqali `high` muhimlikdagi xabarni konfiguratsiya bo'yicha ikki kanalga yuboring.

---

## Rasmiy hujjat

- Mailer: <https://symfony.com/doc/current/mailer.html>
- Twig bilan xat shablonlari: <https://symfony.com/doc/current/mailer.html#html-content>
- Notifier: <https://symfony.com/doc/current/notifier.html>
- Xat testlari: <https://symfony.com/doc/current/mailer.html#testing-emails>

---

[← Oldingi: Cache, Lock, HttpClient](28-cache-lock-httpclient.md) · [Mundarija](README.md) · [Keyingi: Testlash →](30-testlash.md)
