# 25 — Console buyruqlari va Scheduler

[← Oldingi: Xatoliklar va Monolog](24-xatolik-va-log.md) · [Mundarija](README.md) · [Keyingi: Messenger →](26-messenger.md)

---

## Invokable buyruq — zamonaviy shakl

```shell
php bin/console make:command app:user:create
```

```php
namespace App\Command;

use App\Service\UserRegistrar;
use Symfony\Component\Console\Attribute\Argument;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Attribute\Option;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:user:create',
    description: 'Yangi foydalanuvchi yaratadi',
)]
final class CreateUserCommand
{
    public function __construct(private UserRegistrar $registrar)
    {
    }

    public function __invoke(
        SymfonyStyle $io,
        #[Argument('Foydalanuvchi email manzili')] string $email,
        #[Option('Admin huquqlari bilan yaratish')] bool $admin = false,
    ): int {
        if (!filter_var($email, \FILTER_VALIDATE_EMAIL)) {
            $io->error(\sprintf('"%s" email manzil emas.', $email));

            return Command::INVALID;
        }

        $password = bin2hex(random_bytes(8));
        $user = $this->registrar->register($email, $password, $admin);

        $io->success(\sprintf('Foydalanuvchi #%d yaratildi.', $user->getId()));
        $io->writeln(\sprintf('Vaqtinchalik parol: <comment>%s</comment>', $password));

        return Command::SUCCESS;
    }
}
```

```shell
php bin/console app:user:create admin@example.com --admin
```

**Chiqish kodlari — tasodifiy emas.** `Command::SUCCESS` (0), `FAILURE` (1), `INVALID` (2). Cron, CI va supervisor aynan shu kodga qarab muvaffaqiyat/muvaffaqiyatsizlikni aniqlaydi. Xato bo'lganda 0 qaytarish — monitoringni ko'r qilish demak.

`SymfonyStyle` bergan foydali metodlar: `title()`, `section()`, `success()`, `warning()`, `error()`, `table()`, `progressBar()`, `ask()`, `confirm()`, `choice()`.

---

## Uzoq ishlaydigan buyruqlar va signallar

```php
use Symfony\Component\Console\Command\SignalableCommandInterface;

#[AsCommand(name: 'app:import')]
final class ImportCommand implements SignalableCommandInterface
{
    private bool $shouldStop = false;

    public function getSubscribedSignals(): array
    {
        return [\SIGINT, \SIGTERM];
    }

    public function handleSignal(int $signal, int|false $previousExitCode = 0): int|false
    {
        $this->shouldStop = true;

        return false;   // bajarilishni davom ettiramiz — o'zimiz to'xtaymiz
    }

    public function __invoke(SymfonyStyle $io): int
    {
        foreach ($this->rows() as $row) {
            if ($this->shouldStop) {
                $io->warning('To\'xtatish so\'raldi — joriy bo\'lak yakunlandi.');

                return Command::SUCCESS;
            }

            $this->process($row);
        }

        return Command::SUCCESS;
    }
}
```

**Nega bu muhim?** Deploy paytida yoki konteyner qayta ishga tushganda tizim `SIGTERM` yuboradi va bir necha soniyadan keyin `SIGKILL` bilan jarayonni o'ldiradi. Signalni ishlamaydigan buyruq **ishning o'rtasida** uziladi: yarim yozilgan fayl, yarim bajarilgan import. Signalni qabul qilib, "joriy bo'lakni tugatib, toza to'xtash" — production'da majburiy amaliyot.

---

## Scheduler: cron o'rniga kod

```shell
composer require symfony/scheduler
composer require dragonmantank/cron-expression   # cron ifodalari uchun
```

```php
namespace App\Scheduler;

use App\Message\SendDailyReport;
use App\Message\CleanupExpiredTokens;
use Symfony\Component\Scheduler\Attribute\AsSchedule;
use Symfony\Component\Scheduler\RecurringMessage;
use Symfony\Component\Scheduler\Schedule;
use Symfony\Component\Scheduler\ScheduleProviderInterface;
use Symfony\Contracts\Cache\CacheInterface;

#[AsSchedule('default')]
final class MainSchedule implements ScheduleProviderInterface
{
    public function __construct(private CacheInterface $cache)
    {
    }

    public function getSchedule(): Schedule
    {
        return new Schedule()
            ->with(
                RecurringMessage::cron('#midnight', new SendDailyReport()),
                RecurringMessage::every('15 minutes', new CleanupExpiredTokens()),
            )
            ->stateful($this->cache);   // o'tkazib yuborilgan ishlarni eslab qoladi
    }
}
```

```shell
php bin/console debug:scheduler
php bin/console messenger:consume scheduler_default -vv
```

Yoki atribut bilan, alohida provider yozmasdan:

```php
use Symfony\Component\Scheduler\Attribute\AsCronTask;

#[AsCronTask('0 3 * * *', transports: 'async')]
final class ArchiveOldPosts
{
    public function __invoke(): void
    {
        // ...
    }
}
```

`#midnight` (hash cron) — nozik, lekin qimmatli tafsilot: u har instansiya uchun **turg'un, lekin tasodifiy** vaqt tanlaydi. Natijada 50 ta server yarim tunda bir vaqtda bazani urmaydi ("thundering herd").

`->stateful($cache)` esa worker o'chgan vaqtdagi o'tkazib yuborilgan ishlarni qayta ishga tushirish imkonini beradi.

| | Tizim cron | Symfony Scheduler |
| --- | --- | --- |
| Konfiguratsiya joyi | Server (crontab) | Kod (versiyalanadi, review qilinadi) |
| Dinamik jadval | Yo'q | Ha (baza, feature flag bo'yicha) |
| Bir nechta serverda takrorlanish | O'zingiz hal qilasiz | `->lock(...)` |
| PHP ishga tushirish narxi | Har safar to'liq bootstrap | Worker doim ishlab turadi |
| Monitoring | Server loglari | Messenger/Scheduler eventlari |

Ehtiyot bo'ling: Scheduler worker'i **doimiy ishlaydigan jarayon**. U o'lsa, ishlar bajarilmay qoladi — shuning uchun uni supervisor/systemd bilan qayta ishga tushirilishini ta'minlash va monitoring qo'yish shart ([40-bob](40-deploy-va-checklist.md)).

---

## Muhandislik nuqtai nazari: buyruqlar — bu ham ommaviy interfeys

Console buyruqlari operatsion interfeys: ularni yarim tunda, stress ostida, boshqa odam ishlatadi. Shundan:

**1. Idempotentlik.** Buyruq ikki marta ishga tushsa nima bo'ladi? Import ikki nusxa yaratadimi? Yaxshi buyruq takroriy ishga tushirishga chidamli bo'ladi (`INSERT ... ON CONFLICT`, holat tekshiruvi).

**2. Xavfsiz standartlar va `--dry-run`.** Ma'lumot o'zgartiruvchi buyruqda avval nima bo'lishini ko'rsatish imkoni bo'lsin. Bu bitta parametr yozuvlarni saqlab qolgan holatlar son-sanoqsiz.

**3. Bo'laklash va progress.** Katta ishni 1000 tali bo'laklarga bo'ling, `ProgressBar` ko'rsating va `--limit` opsiyasini bering. Operator ish qancha davom etishini bilishi kerak.

**4. Qulf.** Bir vaqtda ikki nusxa ishga tushmasligi uchun Lock komponenti ([28-bob](28-cache-lock-httpclient.md)):

```php
$lock = $this->lockFactory->createLock('app:import', ttl: 3600);

if (!$lock->acquire()) {
    $io->warning('Buyruq allaqachon ishlayapti.');

    return Command::SUCCESS;
}

try {
    // ish
} finally {
    $lock->release();
}
```

**5. Biznes mantiqni buyruqqa yozmang.** Buyruq ham kontroller kabi chegaraviy ob'ekt: kirishni o'qiydi, servis chaqiradi, natijani chiqaradi. Shunda bir mantiqni HTTP orqali ham, CLI orqali ham ishlatish mumkin ([10-bob](10-kontrollerlar.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Xatoda `Command::SUCCESS` qaytarish | Cron/CI nosozlikni sezmaydi | To'g'ri chiqish kodi |
| Signalni ishlamaslik | Deploy paytida ish yarimda uziladi | `SignalableCommandInterface` |
| Uzoq buyruqda `flush()` ni oxirida bir marta | Xotira o'sadi, xatoda hammasi yo'qoladi | Batch + `clear()` ([37-bob](37-ilgor-doctrine.md)) |
| Qulfsiz cron buyrug'i | Ikki nusxa bir vaqtda ishlaydi | Lock |
| Biznes mantiqni buyruqda yozish | HTTP'dan qayta ishlatib bo'lmaydi | Servisga chiqaring |
| Scheduler worker'ini monitoringsiz qoldirish | Ishlar jimgina bajarilmaydi | Supervisor + alert |
| `--no-interaction` ni unutgan holda avtomatlashtirish | Skript savolda muzlab qoladi | Har doim `--no-interaction` |

---

## Amaliyot

1. `app:user:create` buyrug'ini `#[Argument]` va `#[Option]` bilan yozing; noto'g'ri email bilan `Command::INVALID` qaytishini `echo $?` bilan tasdiqlang.
2. Uzoq ishlaydigan `app:import` buyrug'i yozing va `Ctrl+C` bosganda toza to'xtashini ko'ring.
3. Buyruqqa Lock qo'shing va ikkinchi nusxani ishga tushirib, ogohlantirish chiqishini tasdiqlang.
4. `#[AsCronTask]` bilan kunlik vazifa yarating va `debug:scheduler` chiqishida keyingi ishga tushish vaqtini ko'ring.
5. `messenger:consume scheduler_default -vv` ni ishga tushirib, vazifa bajarilishini kuzating.

---

## Rasmiy hujjat

- Console: <https://symfony.com/doc/current/console.html>
- Console uslubi (SymfonyStyle): <https://symfony.com/doc/current/console/style.html>
- Signal bilan ishlash: <https://symfony.com/doc/current/components/console/events.html#the-consoleevents-signal-event>
- Scheduler: <https://symfony.com/doc/current/scheduler.html>
- Lock: <https://symfony.com/doc/current/components/lock.html>

---

[← Oldingi: Xatoliklar va Monolog](24-xatolik-va-log.md) · [Mundarija](README.md) · [Keyingi: Messenger →](26-messenger.md)
