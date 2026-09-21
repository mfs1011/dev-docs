# 35 — Real-time: Mercure

[← Oldingi: Kod sifati](34-kod-sifati.md) · [Mundarija](README.md) · [Keyingi: Tarjima va Intl →](36-tarjima-va-intl.md)

---

## Muammo va yechim

Brauzerga serverdan xabar yuborish kerak: yangi bildirishnoma, buyurtma holati o'zgardi, boshqa foydalanuvchi hujjatni tahrirladi. Uchta yondashuv bor:

| Yondashuv | Qanday ishlaydi | Narxi |
| --- | --- | --- |
| Polling | Mijoz har N soniyada so'raydi | Ko'p behuda so'rov, kechikish |
| WebSocket | Ikki tomonlama doimiy ulanish | Murakkab infratuzilma, PHP uchun noqulay |
| **SSE / Mercure** | Server → mijoz bir tomonlama oqim | Oddiy, HTTP ustida, avtomatik qayta ulanish |

Mercure — Server-Sent Events ustiga qurilgan protokol. Ulanishlarni **alohida hub** (Go dasturi) ushlab turadi, sizning PHP kodingiz esa hub'ga oddiy HTTP so'rov bilan "yangilanish" yuboradi. Shu sababli PHP worker'lari band bo'lmaydi — bu arxitektura PHP uchun WebSocket'dan ancha mos.

---

## O'rnatish

```shell
composer require mercure
```

```bash
# .env.local
MERCURE_URL=http://127.0.0.1:3000/.well-known/mercure
MERCURE_PUBLIC_URL=http://127.0.0.1:3000/.well-known/mercure
MERCURE_JWT_SECRET="!ChangeThisMercureHubJWTSecretKey!"
```

Hub'ni Docker bilan ko'tarish (Flex retsepti odatda `compose.yaml` ga qo'shadi):

```yaml
services:
    mercure:
        image: dunglas/mercure
        environment:
            MERCURE_PUBLISHER_JWT_KEY: '!ChangeThisMercureHubJWTSecretKey!'
            MERCURE_SUBSCRIBER_JWT_KEY: '!ChangeThisMercureHubJWTSecretKey!'
        ports: ['3000:80']
```

---

## Yangilanish yuborish

```php
namespace App\Service;

use App\Entity\Order;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class OrderStatusPublisher
{
    public function __construct(private HubInterface $hub)
    {
    }

    public function publish(Order $order): void
    {
        $update = new Update(
            topics: \sprintf('https://example.com/orders/%d', $order->getId()),
            data: json_encode([
                'id' => $order->getId(),
                'status' => $order->getStatus()->value,
            ], \JSON_THROW_ON_ERROR),
            private: true,      // faqat vakolatli obunachilar oladi
        );

        $this->hub->publish($update);
    }
}
```

**Topic — bu IRI** (manzil ko'rinishidagi identifikator). U haqiqiy URL bo'lishi shart emas, lekin noyob va barqaror bo'lishi kerak. Yaxshi amaliyot — resurs URL'idan foydalanish: `https://example.com/orders/42`.

---

## Mijoz tomoni

```twig
<script>
const url = new URL("{{ mercure('https://example.com/orders/' ~ order.id)|escape('js') }}");
const es = new EventSource(url, { withCredentials: true });

es.onmessage = (event) => {
    const data = JSON.parse(event.data);
    document.querySelector('#status').textContent = data.status;
};

es.onerror = () => {
    // EventSource o'zi qayta ulanadi; bu yerda faqat UI holatini ko'rsatish
};
</script>
```

Shaxsiy (private) yangilanishlar uchun avtorizatsiya cookie'si kerak:

```php
use Symfony\Component\Mercure\Authorization;

#[Route('/orders/{id}', name: 'order_show')]
public function show(Order $order, Request $request, Authorization $authorization): Response
{
    $authorization->setCookie($request, [
        \sprintf('https://example.com/orders/%d', $order->getId()),
    ]);

    return $this->render('order/show.html.twig', ['order' => $order]);
}
```

Cookie ichida JWT bo'ladi va hub aynan shu token asosida qaysi topiclarga obuna bo'lish mumkinligini hal qiladi.

---

## Qayerdan publish qilish kerak

Yangilanishni **tranzaksiya tugagandan keyin** yuborish kerak ([27-bob](27-event-va-doctrine-hodisalari.md)): aks holda mijoz hali saqlanmagan (yoki rollback bo'ladigan) holatni ko'radi.

Eng toza variant — Messenger orqali:

```php
#[AsMessageHandler]
final class PublishOrderStatusHandler
{
    public function __construct(
        private OrderRepository $orders,
        private OrderStatusPublisher $publisher,
    ) {
    }

    public function __invoke(OrderStatusChanged $message): void
    {
        $order = $this->orders->find($message->orderId);

        if (null !== $order) {
            $this->publisher->publish($order);
        }
    }
}
```

Bu, shuningdek, hub ishlamay qolganda HTTP so'rovning yiqilmasligini ta'minlaydi.

---

## Muhandislik nuqtai nazari: real-time tizim dizayni

**1. SSE — bir tomonlama.** Mijozdan serverga ma'lumot oddiy HTTP so'rov bilan boradi. Bu cheklov emas: ko'p ilovada "server → mijoz" oqimi yetarli, va u WebSocket'dan ancha sodda.

**2. Yetkazib berish kafolati yo'q.** Mijoz ulanmagan paytda yuborilgan yangilanish yo'qolishi mumkin. Mercure'da `Last-Event-ID` orqali qayta o'qish (history) bor, lekin buning uchun hub'da saqlash sozlanishi kerak. **Qoida:** real-time — *tezlashtirish*, *haqiqat manbayi* emas. Sahifa ochilganda holat baribir API'dan olinishi kerak.

**3. Yangilanish mazmuni: to'liq ma'lumot yoki signal?** Ikki yondashuv:

| Yondashuv | Afzalligi | Kamchiligi |
| --- | --- | --- |
| To'liq ma'lumot yuborish | Qo'shimcha so'rov kerak emas | Xavfsizlik (kimga nima ko'rinadi), hajm |
| Faqat signal ("o'zgardi") | Xavfsiz, kichik | Har yangilanishda API so'rovi |

Private topic'lar bo'lsa birinchisi, umumiy kanal bo'lsa ikkinchisi mantiqiy.

**4. Masshtab.** Har obunachi — hub'dagi ochiq ulanish. 10 000 foydalanuvchi = 10 000 ulanish. Hub buni ko'taradi (Go), lekin fayl deskriptorlari limiti, xotira va yuk balanslovchi sozlamalarini hisobga olish kerak.

**5. Xavfsizlik.** Private yangilanishlarda topic'ni to'g'ri tanlang: `https://example.com/orders/42` — konkret resurs. Agar hamma `https://example.com/orders` ga obuna bo'lsa, hamma hammaning buyurtmasini ko'radi. Bu — real-time tizimlardagi eng tipik ma'lumot sizishi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `flush()` dan oldin publish qilish | Mijoz mavjud bo'lmagan holatni ko'radi | Tranzaksiyadan keyin, Messenger orqali |
| Umumiy topic bilan shaxsiy ma'lumot yuborish | Ma'lumot sizishi | Resursga xos topic + `private: true` |
| Real-time'ni yagona ma'lumot manbayi qilish | Uzilishda holat noto'g'ri qoladi | Sahifa yuklanganda API'dan o'qish |
| Hub'ni HTTP so'rov ichida sinxron chaqirish | Hub sekin bo'lsa so'rov sekinlashadi | Messenger |
| JWT kalitini `.env` da commit qilish | Har kim publish qila oladi | Secrets vault ([08-bob](08-konfiguratsiya.md)) |
| `escape('js')` ni unutish | XSS | Twig'da doim escaping |

---

## Amaliyot

1. Mercure hub'ini Docker bilan ko'taring va `MERCURE_*` o'zgaruvchilarni sozlang.
2. Buyurtma holati o'zgarganda `Update` yuboradigan servis yozing.
3. Sahifada `EventSource` bilan obuna bo'ling va holat real vaqtda yangilanishini ko'ring.
4. `private: true` qiling va avtorizatsiya cookie'sisiz yangilanish kelmasligini tasdiqlang.
5. Publish'ni Messenger handler'iga ko'chiring va hub o'chirilgan holatda HTTP so'rov yiqilmasligini tekshiring.

---

## Rasmiy hujjat

- Mercure (Symfony): <https://symfony.com/doc/current/mercure.html>
- Mercure protokoli: <https://mercure.rocks/docs/getting-started>
- Server-Sent Events (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events>
- Symfony UX Turbo: <https://symfony.com/bundles/ux-turbo/current/index.html>

---

[← Oldingi: Kod sifati](34-kod-sifati.md) · [Mundarija](README.md) · [Keyingi: Tarjima va Intl →](36-tarjima-va-intl.md)
