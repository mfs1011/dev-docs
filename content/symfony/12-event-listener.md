# 12 — Event listener va subscriber

[← Oldingi: So'rov va javob](11-request-response.md) · [Mundarija](README.md) · [Keyingi: Validatsiya →](13-validatsiya.md)

---

## Ikki shakl, bitta mexanizm

**Listener** — bitta eventga ulangan klass; qaysi eventga ulanishi atributda (yoki konfiguratsiyada) yoziladi.
**Subscriber** — o'zi qaysi eventlarga ulanishini `getSubscribedEvents()` da e'lon qiladigan klass.

```php
namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::RESPONSE, priority: -100)]
final class SecurityHeadersListener
{
    public function __invoke(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $headers = $event->getResponse()->headers;
        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('Referrer-Policy', 'no-referrer');
        $headers->set('X-Frame-Options', 'DENY');
    }
}
```

```php
namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ControllerEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class ApiVersionSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::CONTROLLER => ['onController', 10],
            KernelEvents::RESPONSE => ['onResponse', -10],
        ];
    }

    public function onController(ControllerEvent $event): void { /* ... */ }

    public function onResponse(ResponseEvent $event): void { /* ... */ }
}
```

`autoconfigure: true` tufayli ikkalasi ham avtomatik ro'yxatdan o'tadi — hech qanday teg yozish kerak emas.

**Qaysi birini tanlash?** Amaliy qoida: bir nechta eventga ulanadigan, mantiqan bitta mavzuni qamragan kod — subscriber (hammasi bitta faylda ko'rinadi). Bitta eventga ulanadigan mayda vazifa — listener. Farq texnik emas, o'qish qulayligi haqida.

---

## Prioritet — ko'rinmas tartibni boshqarish

```shell
php bin/console debug:event-dispatcher kernel.response
```

Prioritet qoidasi: **katta son — oldin**. `kernel.response` da javobni o'zgartiradigan listener'lar odatda manfiy prioritet oladi, chunki ular boshqa hamma ishlagandan keyin so'nggi shtrixni qo'yadi.

Aniq misollar:

| Vazifa | Event | Prioritet mulohazasi |
| --- | --- | --- |
| Til aniqlash | `kernel.request` | `RouterListener` (32) dan keyin, ya'ni < 32 |
| Maintenance rejimi | `kernel.request` | Juda yuqori (masalan 512) — hamma narsadan oldin |
| Xavfsizlik sarlavhalari | `kernel.response` | Past (masalan -100) — oxirida |
| Javob vaqtini o'lchash | `kernel.request` / `kernel.terminate` | Eng chekkalarda |

---

## Propagatsiyani to'xtatish

```php
public function __invoke(RequestEvent $event): void
{
    if ($this->isBlocked($event->getRequest())) {
        $event->setResponse(new JsonResponse(['error' => 'blocked'], 403));
        $event->stopPropagation();   // qolgan listener'lar ishlamaydi
    }
}
```

`stopPropagation()` ni ehtiyotkorlik bilan ishlating: siz to'xtatgan listener'lar orasida xavfsizlik yoki log listener'lari bo'lishi mumkin. Odatda `setResponse()` ning o'zi yetarli — `kernel.request` da javob o'rnatilsa, kontroller baribir chaqirilmaydi.

---

## O'z eventlaringiz

Domen hodisalarini e'lon qilish — tizimni bo'shatishning (decoupling) asosiy vositasi:

```php
namespace App\Event;

use App\Entity\Order;

final class OrderPlacedEvent
{
    public function __construct(
        public readonly Order $order,
    ) {
    }
}
```

```php
namespace App\Service;

use App\Event\OrderPlacedEvent;
use Symfony\Contracts\EventDispatcher\EventDispatcherInterface;

final class OrderPlacer
{
    public function __construct(
        private EventDispatcherInterface $dispatcher,
    ) {
    }

    public function place(Cart $cart): Order
    {
        $order = Order::fromCart($cart);
        // ... saqlash ...

        $this->dispatcher->dispatch(new OrderPlacedEvent($order));

        return $order;
    }
}
```

```php
#[AsEventListener]
final class SendOrderConfirmation
{
    public function __invoke(OrderPlacedEvent $event): void
    {
        // email yuborish
    }
}
```

`Symfony\Contracts\EventDispatcher\Event` dan meros olish shart emas — u faqat `stopPropagation()` kerak bo'lganda kerak.

---

## Muhandislik nuqtai nazari: event qachon to'g'ri vosita

Event — kuchli, lekin haddan tashqari ishlatilganda tizimni tushunib bo'lmaydigan qiladi ("event spaghetti"). Tanlov mezoni:

| Savol | Javob "ha" bo'lsa |
| --- | --- |
| Natija chaqiruvchiga kerakmi? | Event **emas** — oddiy metod chaqiruvi |
| Tinglovchilar soni o'zgarib turadimi? | Event |
| Yon ta'sir ixtiyoriymi (bo'lmasa ham asosiy ish bajariladimi)? | Event |
| Tartib muhimmi va aniq bo'lishi kerakmi? | Event **emas** — aniq ketma-ketlik yozing |
| Xatolik asosiy jarayonni to'xtatishi kerakmi? | Event **emas** (yoki juda ehtiyotkorlik bilan) |

Klassik muammo: buyurtma yaratildi → email yuborildi → SMTP ishlamadi → istisno → buyurtma tranzaksiyasi orqaga qaytdi. Foydalanuvchi nuqtai nazaridan bu mantiqsiz: buyurtma haqiqatan yaratilgan edi, faqat xat ketmadi.

To'g'ri yechim — **eventni sinxron yon ta'sirdan navbatga ko'chirish**: listener faqat Messenger'ga xabar yuboradi, haqiqiy yuborish esa alohida jarayonda bo'ladi ([26-bob](26-messenger.md)). Bu "eventual consistency" yondashuvi: asosiy tranzaksiya qisqa va ishonchli qoladi, ikkilamchi ishlar qayta urinish bilan bajariladi.

Ikkinchi muhim g'oya — **event nomi o'tgan zamonda bo'lsin**: `OrderPlacedEvent`, `UserRegisteredEvent`. Buyruq (`SendEmail`) va hodisa (`OrderPlaced`) — turli narsalar: buyruqning bitta bajaruvchisi bo'ladi, hodisaning noldan ko'pgacha tinglovchisi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `isMainRequest()` tekshirmaslik | Sub-request'da takrorlanish | Har `kernel.*` listener'ida tekshiring |
| Listener ichida og'ir I/O (email, HTTP) | So'rov sekinlashadi, xatolik asosiy oqimni buzadi | Messenger'ga yuboring |
| Event'ni buyruq sifatida ishlatish | Kim bajarayotgani noma'lum, natija qaytmaydi | Bevosita servis chaqiruvi yoki Messenger command |
| Tartibni prioritetlarning tasodifiy qiymatlari bilan "sozlash" | Mo'rt tizim | Tartibga bog'liq mantiqni bitta servisga yig'ing |
| `stopPropagation()` ni keng ishlatish | Xavfsizlik/log listener'lari o'chib qoladi | Faqat haqiqatan kerak bo'lganda |
| Entity'ni eventda saqlab, keyin uni o'zgargan holda kutish | Doctrine identity map va tranzaksiya chegaralari bilan chalkashlik | ID yoki immutable DTO uzating |

---

## Amaliyot

1. `SecurityHeadersListener` ni yozing va `curl -I` bilan uchta sarlavha qo'shilganini tasdiqlang.
2. `debug:event-dispatcher kernel.response` chiqishida o'z listeneringiz qayerda turganini toping; prioritetni +200 ga o'zgartirib, joyi qanday siljiganini ko'ring.
3. `OrderPlacedEvent` + ikkita listener yarating (log yozish va hisobot yangilash). Ikkalasi ham chaqirilayotganini test bilan tasdiqlang.
4. Listener'da ataylab istisno tashlang va asosiy so'rov qanday buzilishini ko'ring — keyin uni `try/catch` + log bilan tuzating.
5. `kernel.request` da maintenance rejimini (env o'zgaruvchisi bo'yicha 503) qo'shing; `/health` route'i bundan mustasno bo'lsin.

---

## Rasmiy hujjat

- Eventlar va listener'lar: <https://symfony.com/doc/current/event_dispatcher.html>
- Kernel eventlari ma'lumotnomasi: <https://symfony.com/doc/current/reference/events.html>
- EventDispatcher komponenti: <https://symfony.com/doc/current/components/event_dispatcher.html>
- Before/after filtrlar: <https://symfony.com/doc/current/event_dispatcher/before_after_filters.html>

---

[← Oldingi: So'rov va javob](11-request-response.md) · [Mundarija](README.md) · [Keyingi: Validatsiya →](13-validatsiya.md)
