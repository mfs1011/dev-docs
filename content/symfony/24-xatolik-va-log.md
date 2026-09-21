# 24 — Xatoliklar va Monolog

[← Oldingi: Avtorizatsiya](23-avtorizatsiya.md) · [Mundarija](README.md) · [Keyingi: Console va Scheduler →](25-console-va-scheduler.md)

---

## Istisnodan javobgacha

[04-bob](04-sorov-hayot-sikli.md) dagi oqimni eslang: istisno tashlansa `kernel.exception` eventi chiqadi va Symfony'ning `ErrorListener` i uni `Response` ga aylantiradi. Ya'ni xatolik ishlovi — oqimning oddiy qismi, alohida sehr emas.

Eng oddiy nazorat — atributlar:

```php
namespace App\Exception;

use Psr\Log\LogLevel;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Symfony\Component\HttpKernel\Attribute\WithLogLevel;

#[WithHttpStatus(409)]
#[WithLogLevel(LogLevel::WARNING)]
final class DuplicateSlugException extends \DomainException
{
}
```

Endi bu istisno 409 bo'lib qaytadi va `error` emas, `warning` sifatida loglanadi. **Nega daraja muhim?** Biznes qoidasining buzilishi (409) — bu tizim nosozligi emas, foydalanuvchi xatosi. Uni `error` darajasida loglash monitoring signalini shovqinga ko'madi va haqiqiy nosozliklar ko'rinmay qoladi.

---

## Yagona xato formati (RFC 9457)

```php
namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Validator\Exception\ValidationFailedException;

#[AsEventListener(event: KernelEvents::EXCEPTION, priority: 0)]
final class ApiExceptionListener
{
    public function __construct(private bool $debug)
    {
    }

    public function __invoke(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), '/api')) {
            return;
        }

        $throwable = $event->getThrowable();
        $status = $throwable instanceof HttpExceptionInterface ? $throwable->getStatusCode() : 500;

        $payload = [
            'type' => 'about:blank',
            'title' => $this->titleFor($status),
            'status' => $status,
            'detail' => $status < 500 || $this->debug ? $throwable->getMessage() : 'Internal server error',
        ];

        if ($throwable instanceof ValidationFailedException) {
            $payload['status'] = $status = 422;
            $payload['title'] = 'Validation failed';
            $payload['errors'] = array_map(
                static fn ($violation) => [
                    'field' => $violation->getPropertyPath(),
                    'message' => $violation->getMessage(),
                ],
                iterator_to_array($throwable->getViolations()),
            );
        }

        $response = new JsonResponse($payload, $status);
        $response->headers->set('Content-Type', 'application/problem+json');

        $event->setResponse($response);
    }

    private function titleFor(int $status): string
    {
        return match ($status) {
            400 => 'Bad request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not found',
            409 => 'Conflict',
            422 => 'Unprocessable entity',
            429 => 'Too many requests',
            default => 'Server error',
        };
    }
}
```

Eng muhim qator — `$status < 500 || $this->debug`. **500 xatolarning tafsiloti mijozga chiqmasligi kerak:** istisno xabarida jadval nomi, fayl yo'li, SQL parchasi bo'lishi mumkin. Bu ma'lumot hujumchiga tizim haqida ma'lumot beradi. Tafsilot logga tushadi, mijozga esa umumiy xabar va (yaxshisi) so'rov identifikatori beriladi.

> Symfony'da `ProblemNormalizer` va `ConstraintViolationListNormalizer` ham bor — ularni Serializer orqali ishlatib, shu formatni qo'lda yozmasdan olish mumkin.

---

## Monolog: kanallar va handlerlar

Skeleton bergan production konfiguratsiyasi (soddalashtirilgan):

```yaml
when@prod:
    monolog:
        handlers:
            main:
                type: fingers_crossed
                action_level: error
                handler: nested
                excluded_http_codes: [404, 405]
                buffer_size: 50
            nested:
                type: stream
                path: php://stderr
                level: debug
                formatter: monolog.formatter.json
```

Bu konfiguratsiyada uchta muhim qaror bor:

1. **`fingers_crossed`** — oddiy paytda hech narsa yozilmaydi; xato yuz berganda esa **butun so'rov konteksti** (barcha debug/info xabarlar) birdan yoziladi. Ya'ni siz "hamma narsani loglash" va "hech narsa loglamaslik" o'rtasida tanlov qilmaysiz.
2. **`php://stderr`** — konteynerli muhitda loglar faylga emas, standart chiqishga yoziladi; ularni yig'ish platformaning ishi (12-factor, XI-band).
3. **JSON formatter** — loglar mashina o'qiydigan bo'ladi: Elasticsearch/Loki/CloudWatch bo'yicha maydonlar (`level`, `channel`, `context`) bilan qidiriladi.

Loglash:

```php
use Psr\Log\LoggerInterface;
use Symfony\Bridge\Monolog\Attribute\WithMonologChannel;

#[WithMonologChannel('payment')]
final class PaymentProcessor
{
    public function __construct(private LoggerInterface $logger)
    {
    }

    public function charge(Order $order): void
    {
        $this->logger->info('Charging order {orderId}', [
            'orderId' => $order->getId(),
            'amount' => $order->getTotal()->amountInMinorUnits,
        ]);
    }
}
```

**Har doim platsholder + kontekst massivi ishlating**, satr birlashtirish emas. Sababi: `'Charging order 42'` va `'Charging order 43'` — log tizimi uchun ikki xil xabar; `'Charging order {orderId}'` esa bitta xabar turi, guruhlanadi va bo'yicha ogohlantirish (alert) sozlanadi.

Kanallar bo'yicha ajratish:

```yaml
monolog:
    channels: ['payment', 'deprecation']

when@prod:
    monolog:
        handlers:
            payment:
                type: stream
                path: php://stderr
                channels: ['payment']
                formatter: monolog.formatter.json
                level: info
```

---

## Muhandislik nuqtai nazari: kuzatuvchanlik (observability)

Loglar — kuzatuvchanlikning uchta ustunidan biri:

| Ustun | Savolga javob beradi | Symfony'da |
| --- | --- | --- |
| **Loglar** | "Aynan nima bo'ldi?" | Monolog |
| **Metrikalar** | "Qanchalik yomon? Trend qanday?" | Prometheus eksporterlari, APM |
| **Trasslar** | "Vaqt qayerda ketdi?" | OpenTelemetry, Blackfire, APM |

Amaliy qoidalar:

**1. Har so'rovga korrelyatsiya identifikatori.** `X-Request-Id` ni qabul qiling (yoki generatsiya qiling) va uni **har bir log yozuviga** qo'shing (Monolog processor orqali). Mikroservislarda bu — bitta foydalanuvchi amalini xizmatlar bo'ylab kuzatishning yagona yo'li ([04-bob](04-sorov-hayot-sikli.md) dagi listener shu maqsadda edi).

**2. Log darajalarini intizom bilan ishlating.**

| Daraja | Ma'nosi | Kim reaksiya qiladi |
| --- | --- | --- |
| `debug` | Ishlab chiqish tafsilotlari | Hech kim |
| `info` | Muhim biznes hodisalari (buyurtma yaratildi) | Tahlil |
| `warning` | Kutilgan nosozlik (validatsiya, 4xx, retry) | Trend kuzatiladi |
| `error` | Kutilmagan nosozlik, funksiya bajarilmadi | Dejur muhandis (ertalab) |
| `critical`/`alert` | Tizim ishlamayapti | Darhol (tunda ham) |

Agar `error` loglari kuniga yuzlab bo'lsa, ular hech kim o'qimaydigan shovqinga aylanadi va haqiqiy avariya ko'rinmay qoladi.

**3. Maxfiy ma'lumotni hech qachon loglamang.** Parol, token, `Authorization` sarlavhasi, to'liq karta raqami, shaxsiy ma'lumot. Monolog processor bilan avtomatik filtr qo'ying — inson intizomiga tayanmang.

**4. Xatoni yutib yubormang.** `catch (\Throwable) {}` — eng qimmat kod naqshlaridan biri: muammo bor, lekin hech kim bilmaydi. Tutganingizda: loglang va ma'noli javob qaytaring yoki qayta tashlang.

**5. Xato monitoringini ulang** (Sentry va shunga o'xshash). Loglarni qo'lda o'qish — masshtablanmaydigan strategiya; birlashtirish, guruhlash va ogohlantirish kerak.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| 500 xatoning tafsilotini mijozga chiqarish | Ichki ma'lumot sizadi | Umumiy xabar + log + so'rov ID |
| `catch (\Throwable) {}` | Xato yo'qoladi | Loglang yoki qayta tashlang |
| Barcha xatolarni `error` darajasida loglash | Shovqin, haqiqiy avariya ko'rinmaydi | `#[WithLogLevel]`, mos daraja |
| Log xabarini satr birlashtirish bilan qurish | Guruhlab bo'lmaydi | Platsholder + kontekst |
| Production'da `dev` xatolik sahifasi | To'liq stack trace ochiq | `APP_ENV=prod`, `APP_DEBUG=0` |
| Loglarni faylga yozib, rotatsiya qilmaslik | Disk to'ladi — tizim to'xtaydi | `stderr` yoki `rotating_file` |
| Parol/token loglash | Sir sizadi | Processor bilan filtrlash |
| Har endpointda turli xato formati | Mijoz kodi murakkablashadi | Yagona listener |

---

## Amaliyot

1. `ApiExceptionListener` ni yozing va `/api/...` yo'llarida barcha xatolar `application/problem+json` formatida qaytishini tasdiqlang.
2. `DuplicateSlugException` ni `#[WithHttpStatus(409)]` bilan yarating va endpoint'dan tashlang.
3. Validatsiya xatosi uchun `errors[]` massivi to'g'ri to'lganini tekshiring.
4. `X-Request-Id` ni har log yozuviga qo'shadigan Monolog processor yozing.
5. `APP_ENV=prod` bilan ishga tushirib, 500 xatoda mijozga tafsilot chiqmayotganini, lekin `var/log` yoki `stderr` da to'liq trace borligini tasdiqlang.

---

## Rasmiy hujjat

- Loglash: <https://symfony.com/doc/current/logging.html>
- Monolog kanallari: <https://symfony.com/doc/current/logging/channels_handlers.html>
- Processor'lar: <https://symfony.com/doc/current/logging/processors.html>
- Xatoliklarni sozlash: <https://symfony.com/doc/current/controller/error_pages.html>
- `#[WithHttpStatus]` va `#[WithLogLevel]`: <https://symfony.com/doc/current/controller/error_pages.html#custom-status-code-and-log-level>
- RFC 9457 (Problem Details): <https://www.rfc-editor.org/rfc/rfc9457>

---

[← Oldingi: Avtorizatsiya](23-avtorizatsiya.md) · [Mundarija](README.md) · [Keyingi: Console va Scheduler →](25-console-va-scheduler.md)
