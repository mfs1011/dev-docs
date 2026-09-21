# 04 — So'rovning hayot sikli

[← Oldingi: Papkalar va Kernel](03-papkalar-va-kernel.md) · [Mundarija](README.md) · [Keyingi: Service container →](05-service-container.md)

---

## Bitta jumlada

Symfony — bu **`Request` ob'ektini `Response` ob'ektiga aylantiruvchi funksiya**, atrofida hodisalar (event) bilan kengaytirish nuqtalari qo'yilgan.

```php
$response = $kernel->handle($request);   // Request → Response
$response->send();                       // brauzerga yuborish
$kernel->terminate($request, $response); // javobdan keyingi og'ir ishlar
```

Butun framework shu uch qatorning ichini to'ldiradi. Buni tushunsangiz, "bu header qayerdan qo'shildi?", "nega 403 qaytdi?", "qaysi kod mening kontrollerimdan oldin ishlaydi?" degan savollar sizni hech qachon to'xtatmaydi.

---

## To'liq ketma-ketlik

| № | Bosqich | Event | Event klassi |
| --- | --- | --- | --- |
| 1 | So'rov keldi, boshlang'ich ishlov | `kernel.request` | `RequestEvent` |
| 2 | Kontrollerni aniqlash (event emas) | — | `ControllerResolverInterface` |
| 3 | Kontrollerni o'zgartirish imkoni | `kernel.controller` | `ControllerEvent` |
| 4 | Kontroller argumentlarini hal qilish | — | `ArgumentResolverInterface` |
| 5 | Argumentlarni o'zgartirish imkoni | `kernel.controller_arguments` | `ControllerArgumentsEvent` |
| 6 | Kontroller chaqiriladi | — | — |
| 7 | Agar kontroller `Response` qaytarmagan bo'lsa | `kernel.view` | `ViewEvent` |
| 8 | Javobni o'zgartirish | `kernel.response` | `ResponseEvent` |
| 9 | So'rovni yakunlash | `kernel.finish_request` | `FinishRequestEvent` |
| 10 | Javob yuborilgandan keyin | `kernel.terminate` | `TerminateEvent` |
| — | Istalgan joyda istisno tashlansa | `kernel.exception` | `ExceptionEvent` |

**Muhim nuance:** `kernel.request` listener'laridan biri `Response` qaytarsa (`$event->setResponse(...)`), qolgan bosqichlar **umuman ishlamaydi** — darhol `kernel.response` ga sakraladi. Aynan shu mexanizm bilan Security firewall ruxsatsiz so'rovni kontrollergacha yetkazmay 401 qaytaradi, HTTP cache esa keshdagi javobni beradi.

---

## Kim nima qilishini o'z ko'zingiz bilan ko'ring

```shell
php bin/console debug:event-dispatcher kernel.request
```

Haqiqiy `--webapp` loyihasida (Symfony 8.1) chiqish shunday bo'ladi:

```
  #1   DebugHandlersListener::configure()          2048
  #3   ValidateRequestListener::onKernelRequest()   256
  #5   SessionListener::onKernelRequest()           128
  #6   LocaleListener::setDefaultLocale()           100
  #8   RouterListener::onKernelRequest()             32
  #11  TraceableFirewallListener::onKernelRequest()   8
```

Bu jadvaldan uchta muhim xulosa chiqadi:

1. **Prioritet katta — avval ishlaydi.** Tartib raqami emas, `priority` hal qiladi.
2. **Routing — oddiy listener** (`RouterListener`, prioritet 32). Ya'ni routing "sehr" emas, `kernel.request` ga ulangan kod. U URL'ni moslaydi va natijani `$request->attributes` ga (`_route`, `_controller`, route parametrlari) yozadi.
3. **Security routingdan keyin ishlaydi** (prioritet 8). Shuning uchun firewall route'ni bilgan holda qaror qabul qila oladi.

O'z listeneringizni qo'ygan joyingiz shu shkalada qayerda turishini bilish — juda amaliy narsa: masalan, tilni URL'dan olmoqchi bo'lsangiz, `RouterListener` dan **keyin** (prioritet < 32) ishlashingiz kerak, aks holda `_route` hali yo'q.

---

## Bosqichlarni kod bilan ko'rish

```php
namespace App\EventListener;

use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

#[AsEventListener(event: KernelEvents::REQUEST, priority: 20)]
final class RequestIdListener
{
    public function __invoke(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $requestId = $event->getRequest()->headers->get('X-Request-Id') ?? bin2hex(random_bytes(8));
        $event->getRequest()->attributes->set('request_id', $requestId);
    }
}

#[AsEventListener(event: KernelEvents::RESPONSE)]
final class RequestIdResponseListener
{
    public function __invoke(ResponseEvent $event): void
    {
        $requestId = $event->getRequest()->attributes->get('request_id');
        if (null !== $requestId) {
            $event->getResponse()->headers->set('X-Request-Id', $requestId);
        }
    }
}
```

`isMainRequest()` tekshiruvi nega kerak? Chunki Symfony **sub-request** ham qiladi: Twig'dagi `render(controller(...))`, ESI fragmentlari, xatolik sahifasini render qilish. Sub-request'da autentifikatsiya, til aniqlash yoki log yozishni takrorlash — klassik xato (bitta HTTP so'rovga 5 ta log yozuvi).

---

## `kernel.terminate` — javobdan keyin

```php
#[AsEventListener(event: KernelEvents::TERMINATE)]
final class AuditListener
{
    public function __invoke(TerminateEvent $event): void
    {
        // foydalanuvchi javobni allaqachon oldi; bu yerda 200ms yo'qotish sezilmaydi
    }
}
```

PHP-FPM da bu haqiqatan ham javob yuborilgandan keyin ishlaydi (`fastcgi_finish_request`). Lekin bu **navbat (queue) o'rnini bosmaydi**: PHP jarayoni band bo'lib turadi, ya'ni shu worker yangi so'rovni qabul qilolmaydi. Og'ir ish uchun Messenger ([26-bob](26-messenger.md)).

---

## Muhandislik nuqtai nazari: bu naqsh nima deb ataladi

Symfony'ning hayot sikli — **middleware/pipeline** emas, **event-driven kernel**. Farqni bilish kerak:

| Pipeline (masalan PSR-15) | Event-driven (Symfony) |
| --- | --- |
| Har qatlam keyingisini o'zi chaqiradi (`$handler->handle($request)`) | Dispatcher listener'larni prioritet bo'yicha chaqiradi |
| "Oldin/keyin" mantiq bitta funksiyada | "Oldin" va "keyin" alohida eventlarda |
| Kompozitsiya tabiiy, tartib aniq | Kengaytirish oson, tartib prioritet bilan boshqariladi |

Symfony ikkinchisini tanlagan, chunki freymvork **kengaytiriluvchan** bo'lishi kerak: bundle o'rnatilganda u sizning kodingizni o'zgartirmasdan, faqat listener ro'yxatdan o'tkazib, oqimga ulanadi. Bu — Open/Closed prinsipi (SOLID "O") ning amaliy ko'rinishi.

Shu bilan birga, event-driven modelning narxi ham bor: **oqim ko'rinmas bo'lib qoladi**. Shuning uchun Symfony `debug:event-dispatcher` va Profiler'ning "Events" panelini beradi — ko'rinmas narsani ko'rinadigan qiladi. Professional odat: yangi loyihada birinchi kun shu ikkalasini ochib chiqish.

Yana bir e'tibor beriladigan nuqta — **xato ishlovi ham shu oqimning bir qismi**. `kernel.exception` listener'i bo'lmasa, istisno oddiy PHP fatal error bo'lib chiqardi. Symfony'da esa istisno `Response` ga aylantiriladi; API uchun buni siz boshqarasiz ([24-bob](24-xatolik-va-log.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `isMainRequest()` ni tekshirmaslik | Sub-request'da logika takrorlanadi (qo'sh log, qo'sh auth) | Har `kernel.request`/`kernel.response` listener'ida tekshiring |
| `_route` ni prioritet > 32 listenerda o'qish | `RouterListener` hali ishlamagan — `null` keladi | Prioritetni 32 dan past qiling |
| `kernel.terminate` da uzoq ish qilish | Worker band bo'ladi, throughput tushadi | Messenger'ga yuboring |
| `kernel.response` da javob mazmunini butunlay almashtirish | HTTP cache, ETag, Content-Length buziladi | `kernel.view` yoki kontrollerning o'zida hal qiling |
| Har narsani listenerga chiqarish | Oqim ko'rinmas bo'ladi, debug qiyinlashadi | Faqat *ko'ndalang* (cross-cutting) vazifalar: log, auth, header, til |
| Istisnoni listenerda "yutib yuborish" | Xato yo'qoladi, monitoring ko'rmaydi | Loglang va mazmunli `Response` qaytaring |

---

## Amaliyot

1. `php bin/console debug:event-dispatcher` ni to'liq ishga tushiring va barcha `kernel.*` eventlarini ro'yxatini ko'ring.
2. Yuqoridagi `RequestIdListener` + `RequestIdResponseListener` juftligini yarating. `curl -I https://127.0.0.1:8000/` bilan `X-Request-Id` header'i qaytayotganini tasdiqlang.
3. Prioritetni `priority: 40` ga o'zgartiring va listener ichida `$event->getRequest()->attributes->get('_route')` ni `dump()` qiling. Natija `null` bo'lishini ko'ring va nega ekanini tushuntiring.
4. `kernel.request` da shart bilan `$event->setResponse(new Response('maintenance', 503))` qaytaring. Kontroller umuman chaqirilmasligini Profiler'dan tasdiqlang.
5. Profiler'ning "Events" panelini oching: bitta so'rovda nechta listener ishlaganini sanang.

---

## Rasmiy hujjat

- HttpKernel komponenti va hayot sikli: <https://symfony.com/doc/current/components/http_kernel.html>
- Kernel eventlari ro'yxati: <https://symfony.com/doc/current/reference/events.html>
- Event listener yaratish: <https://symfony.com/doc/current/event_dispatcher.html>
- Profiler: <https://symfony.com/doc/current/profiler.html>

---

[← Oldingi: Papkalar va Kernel](03-papkalar-va-kernel.md) · [Mundarija](README.md) · [Keyingi: Service container →](05-service-container.md)
