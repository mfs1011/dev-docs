# Patternlar: asinxron ishlov (Messenger)

[← Persistence](03-persistence.md) · [Katalog](README.md) · [Keyingi: Xizmatlar va DI →](05-xizmat-va-di.md)

---

## P-23 · Buyruq va hodisa xabarlarini ajratish

**Muammo.** `PostCreated` nomli xabar bitta handler tomonidan ishlanadi va u aslida buyruq; `SendEmail` nomli xabarga uchta handler ulanadi. Nom bilan mazmun mos kelmaydi, kim nimani bajarishi chalkashadi.

**Yechim.** Ikki turni aniq ajrating va papkalar bilan ham ko'rsating.

| | Buyruq (Command) | Hodisa (Event) |
| --- | --- | --- |
| Nomi | Buyruq maylida: `SendWelcomeEmail` | O'tgan zamonda: `OrderPaid` |
| Handler soni | Aniq bitta | 0 dan ko'pgacha |
| Ma'nosi | "Buni bajar" | "Bu sodir bo'ldi" |
| Yiqilsa | Qayta uriniladi, muhim | Ko'pincha ixtiyoriy |

```
src/Message/Command/SendWelcomeEmail.php
src/Message/Event/OrderPaid.php
```

**Qachon kerak emas.** Loyihada 3–4 ta xabar bo'lsa, papkaga bo'lish ortiqcha; lekin nomlash qoidasi baribir qoladi.

**Bog'liq:** [26-bob](../26-messenger.md), [27-bob](../27-event-va-doctrine-hodisalari.md).

---

## P-24 · Idempotent handler

**Muammo.** Messenger "kamida bir marta" yetkazadi: worker ishni bajarib, tasdiqlashdan oldin o'lsa — xabar qayta keladi. Natijada ikkinchi email, ikkinchi to'lov.

**Yechim.** Handler o'z ishini takrorlanishga chidamli qiladi: holat tekshiruvi yoki noyob kalit bilan jurnal.

```php
#[AsMessageHandler]
final class ChargePaymentHandler
{
    public function __construct(
        private PaymentRepository $payments,
        private PaymentGateway $gateway,
        private EntityManagerInterface $em,
    ) {
    }

    public function __invoke(ChargePayment $message): void
    {
        $payment = $this->payments->find($message->paymentId);

        if (null === $payment) {
            throw new UnrecoverableMessageHandlingException('To\'lov topilmadi.');
        }

        if ($payment->isCharged()) {
            return;                                  // allaqachon bajarilgan
        }

        $payment->markCharged($this->gateway->charge($payment, $message->idempotencyKey));
        $this->em->flush();
    }
}
```

Tashqi tizimga ham **idempotentlik kalitini uzating** — u ham takroriy chaqiruvni tanishi kerak.

**Qachon kerak emas.** Hech qachon — asinxron ishlovda bu majburiy talab.

**Bog'liq:** [26-bob](../26-messenger.md), [P-07](01-http-qatlam.md#p-07--idempotentlik-kaliti).

---

## P-25 · Xabarda ID, entity emas

**Muammo.** Entity xabarga solinsa, u serializatsiya qilinadi va bir necha daqiqadan keyin **eskirgan nusxa** sifatida ochiladi; Doctrine proxy'lari va aloqalar esa umuman serializatsiya bo'lmaydi.

**Yechim.** Xabarda faqat identifikator va o'zgarmas kontekst.

```php
final readonly class NotifySubscribers
{
    public function __construct(
        public int $postId,
        public string $locale = 'uz',       // fon jarayonida locale yo'q — uzatib yuboring
    ) {
    }
}
```

Handler dolzarb ma'lumotni o'zi yuklaydi.

**Qachon kerak emas.** Xabar butunlay o'zini o'zi ta'minlovchi snapshot bo'lishi kerak bo'lsa (masalan, audit jurnali) — u holda **qiymatlarni** soling, entity'ni emas.

**Bog'liq:** [26-bob](../26-messenger.md), [36-bob](../36-tarjima-va-intl.md).

---

## P-26 · Xatolarni tasniflash (retry qilinadimi?)

**Muammo.** Buzuq xabar (noto'g'ri ma'lumot) 3 marta qayta urinadi, loglarni to'ldiradi va baribir yiqiladi. Vaqtinchalik xato (tashqi API 503) esa darhol `failed` ga tushadi.

**Yechim.** Istisnoni turiga qarab tanlang.

```php
// Qayta urinish befoyda — ma'lumot yaroqsiz
throw new UnrecoverableMessageHandlingException('Foydalanuvchi o\'chirilgan.');

// Vaqtinchalik — aniq kechikish bilan qayta urin
throw new RecoverableMessageHandlingException('Rate limited', retryDelay: 30_000);
```

```yaml
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
                    jitter: 0.2
```

`jitter` — minglab xabar bir vaqtda qayta urinmasligi uchun.

**Qachon kerak emas.** Hech qachon: `failure_transport` sozlanmasa, xabarlar **yo'qoladi**.

**Bog'liq:** [26-bob](../26-messenger.md).

---

## P-27 · Outbox (dual-write muammosi)

**Muammo.** `flush()` muvaffaqiyatli bo'ldi, lekin xabar navbatga yuborilishidan oldin jarayon o'ldi — hodisa yo'qoldi. Bazaga va navbatga **atomik** yozib bo'lmaydi.

**Yechim.** Xabarni o'sha tranzaksiyada **bazaga** yozish, keyin alohida jarayon uni navbatga uzatish. Doctrine transport buni tabiiy qiladi: xabar `messenger_messages` jadvaliga o'sha ulanish orqali tushadi.

```yaml
framework:
    messenger:
        transports:
            async: 'doctrine://default'      # outbox xususiyatiga ega
        buses:
            messenger.bus.default:
                middleware:
                    - doctrine_transaction
```

Muqobil (kuchsizroq, lekin ko'p holatda yetarli): `flush()` dan **keyin** dispatch qilish ([P-13](02-domen.md#p-13--domen-hodisasi-record--release)) + davriy sverka jarayoni.

**Qachon kerak emas.** Hodisa yo'qolishi hech narsani buzmasa (masalan, tavsiya tizimiga signal) — lekin bu **ongli** qaror bo'lsin.

**Bog'liq:** [26-bob](../26-messenger.md), [27-bob](../27-event-va-doctrine-hodisalari.md).

---

## P-28 · Worker hayot sikli

**Muammo.** Worker bir necha kun ishlaydi: xotira sekin o'sadi, DB ulanishi uziladi, deploy'dan keyin eski kod bilan ishlab turadi.

**Yechim.** Worker'ni **vaqtinchalik jarayon** deb qarang; supervisor uni qayta ko'taradi.

```ini
[program:messenger-consume]
command=php /app/bin/console messenger:consume async --time-limit=3600 --memory-limit=128M
numprocs=4
autostart=true
autorestart=true
startretries=10
process_name=%(program_name)s_%(process_num)02d
```

```shell
# deploy oxirida
php bin/console messenger:stop-workers
```

Servisingiz ichki holat saqlasa — `ResetInterface` ni implement qiling, Symfony uni har xabardan keyin tozalaydi.

**Qachon kerak emas.** Hech qachon: cheksiz ishlaydigan worker — production'dagi eng tipik "sirli" nosozlik manbayi.

**Bog'liq:** [26-bob](../26-messenger.md), [40-bob](../40-deploy-va-checklist.md).

---

[← Persistence](03-persistence.md) · [Katalog](README.md) · [Keyingi: Xizmatlar va DI →](05-xizmat-va-di.md)
