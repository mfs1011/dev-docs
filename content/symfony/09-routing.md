# 09 — Routing

[← Oldingi: Konfiguratsiya](08-konfiguratsiya.md) · [Mundarija](README.md) · [Keyingi: Kontrollerlar →](10-kontrollerlar.md)

---

## Asosiy sintaksis

Zamonaviy Symfony'da route'lar **atribut** bilan, kontroller metodining ustida e'lon qilinadi:

```php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/posts', name: 'api_post_')]
final class PostController extends AbstractController
{
    #[Route('', name: 'index', methods: ['GET'])]
    public function index(): Response
    {
        // ...
    }

    #[Route('/{id}', name: 'show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function show(int $id): Response
    {
        // ...
    }

    #[Route('', name: 'create', methods: ['POST'])]
    public function create(): Response
    {
        // ...
    }
}
```

Klass darajasidagi `#[Route]` prefiks beradi: yakuniy nomlar `api_post_index`, `api_post_show`, `api_post_create`; yo'llar `/api/posts`, `/api/posts/{id}`.

**Nega `methods` ni har doim ko'rsatish kerak?** Aks holda bitta yo'l barcha HTTP metodlarini qabul qiladi va `POST /api/posts/5` xato kontrollerga tushadi. To'g'ri ko'rsatilganda Symfony `405 Method Not Allowed` va `Allow` sarlavhasini o'zi qaytaradi — bu HTTP spetsifikatsiyasiga mos xatti-harakat.

---

## Parametrlar, talablar va standart qiymatlar

To'liq shakl:

```php
#[Route('/blog/{page}', name: 'blog_list', requirements: ['page' => '\d+'], defaults: ['page' => 1])]
public function list(int $page): Response {}
```

Ixcham shakl — aynan bir xil natija, sintaksis `{nom<talab>?standart}`:

```php
#[Route('/blog/{page<\d+>?1}', name: 'blog_list')]
public function list(int $page): Response {}
```

Maxsus holatlar:

```php
// Slash (/) ni parametr ichida ruxsat berish
#[Route('/download/{path}', requirements: ['path' => '.+'])]
public function download(string $path): Response {}

// Enum parametr — noto'g'ri qiymatda 404
#[Route('/orders/{status}', name: 'orders_by_status')]
public function list(OrderStatus $status = OrderStatus::Paid): Response {}

// Faqat HTTPS
#[Route('/login', name: 'login', schemes: ['https'])]
public function login(): Response {}

// Sessiya ochilmasin (HTTP kesh uchun muhim)
#[Route('/health', name: 'health', stateless: true)]
public function health(): Response {}
```

**`requirements` — bu validatsiya emas, marshrutlash filtri.** `\d+` mos kelmasa, Symfony boshqa route izlaydi va topmasa 404 qaytaradi. Bu foydali: `/blog/list` va `/blog/{id}` bir-biriga xalaqit bermaydi.

---

## Prioritet va mos kelish tartibi

Route'lar **e'lon tartibida** tekshiriladi, birinchi mos kelgan g'olib. Shuning uchun konkret yo'l umumiydan oldin turishi kerak:

```php
#[Route('/blog/{slug}', name: 'blog_show')]          // /blog/list ni ham yutib yuboradi!
public function show(string $slug): Response {}

#[Route('/blog/list', name: 'blog_list', priority: 2)]  // priority bilan oldinga chiqadi
public function list(): Response {}
```

Tartibni ko'rish va tekshirish:

```shell
php bin/console debug:router
php bin/console debug:router api_post_show
php bin/console router:match /api/posts/42 --method=GET
```

`router:match` — bahsni tugatuvchi buyruq: "nega bu URL bu kontrollerga tushmayapti?" degan savolga bir soniyada javob beradi.

---

## URL generatsiya

**Qattiq yozilgan URL — texnik qarz.** Yo'l o'zgarganda butun kod bazasini qidirish kerak bo'ladi. Shuning uchun URL doim route nomidan generatsiya qilinadi:

```php
// Kontrollerda
$url = $this->generateUrl('api_post_show', ['id' => 42]);

// Mutlaq URL
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

$url = $this->generateUrl('api_post_show', ['id' => 42], UrlGeneratorInterface::ABSOLUTE_URL);
```

```php
// Servisda
final class NotificationBuilder
{
    public function __construct(private UrlGeneratorInterface $urlGenerator)
    {
    }

    public function buildLink(int $postId): string
    {
        return $this->urlGenerator->generate(
            'api_post_show',
            ['id' => $postId],
            UrlGeneratorInterface::ABSOLUTE_URL,
        );
    }
}
```

```twig
{# Twig'da #}
<a href="{{ path('api_post_show', {id: post.id}) }}">Ko'rish</a>
<a href="{{ url('api_post_show', {id: post.id}) }}">Mutlaq havola</a>
```

Route'da yo'q parametr query string'ga aylanadi: `generateUrl('blog_list', ['page' => 2, 'tag' => 'php'])` → `/blog/2?tag=php`.

**CLI va worker'larda muammo:** konsolda HTTP so'rov yo'q, demak host ham yo'q. Shuning uchun standart URI sozlanadi:

```yaml
# config/packages/routing.yaml
framework:
    router:
        default_uri: '%env(DEFAULT_URI)%'   # .env da: DEFAULT_URI=https://example.com
```

Buni unutish — email xatlarda `http://localhost/...` havolalari paydo bo'lishining eng keng tarqalgan sababi.

---

## Imzolangan URL (signed URI)

Parolni tiklash, faylga vaqtinchalik kirish, email tasdiqlash — bularda **autentifikatsiyasiz, lekin ishonchli** havola kerak:

```php
use Symfony\Component\HttpFoundation\UriSigner;

final class ConfirmationLinkFactory
{
    public function __construct(
        private UriSigner $uriSigner,
        private UrlGeneratorInterface $urlGenerator,
    ) {
    }

    public function create(int $userId): string
    {
        $url = $this->urlGenerator->generate(
            'user_confirm',
            ['id' => $userId],
            UrlGeneratorInterface::ABSOLUTE_URL,
        );

        return $this->uriSigner->sign($url, new \DateTimeImmutable('+24 hours'));
    }
}
```

```php
use Symfony\Component\HttpKernel\Attribute\IsSignatureValid;

#[IsSignatureValid]
#[Route('/confirm/{id}', name: 'user_confirm', methods: ['GET'])]
public function confirm(int $id): Response
{
    // imzo yaroqsiz yoki muddati o'tgan bo'lsa — bu yergacha yetib kelmaydi
}
```

Imzo HMAC bilan hisoblanadi (`kernel.secret` kaliti bilan) — ya'ni URL ni o'zgartirgan odam imzoni qayta hisoblay olmaydi.

---

## Muhandislik nuqtai nazari: URL — bu ommaviy API

URL sxemasi — sizning tizimingizning eng uzoq yashaydigan qismi. Kod refaktoring qilinadi, baza sxemasi o'zgaradi, lekin tashqi tizimlar, qidiruv indeksi, foydalanuvchi zakladkalari eski URL'ni saqlab qoladi.

Shundan kelib chiqadigan qoidalar:

1. **Resurs otlari, ko'plikda, kichik harflarda:** `/api/posts/42/comments`. Fe'l qo'ymang (`/api/getPost`) — fe'lni HTTP metodi ifodalaydi.
2. **Ierarxiya faqat haqiqiy egalik bo'lsa.** `/posts/42/comments` — izohlar postga tegishli. `/users/7/posts/42` — noto'g'ri, chunki post foydalanuvchisiz ham mavjud.
3. **Filtrlash, tartiblash, sahifalash — query string'da:** `/api/posts?status=published&page=2&sort=-created_at`. Ular resursning o'zi emas, uning ko'rinishini boshqaradi.
4. **Versiyalash strategiyasini oldindan tanlang:** `/api/v1/...` yoki `Accept: application/vnd.app.v1+json`. Birinchisi oddiy va debug qilish oson; ikkinchisi "toza", lekin amalda ko'p jamoa uddalay olmaydi ([38-bob](38-api-pro.md)).
5. **URL o'zgarsa — 301 redirect qoldiring.** Eski havolani "o'lik" qilish — foydalanuvchini yo'qotish.

Yana bir muhim jihat — **idempotentlik va HTTP metodlari semantikasi**:

| Metod | Xavfsiz (safe) | Idempotent | Ma'nosi |
| --- | --- | --- | --- |
| `GET` | ha | ha | O'qish, yon ta'sirsiz |
| `HEAD` | ha | ha | Faqat sarlavhalar |
| `POST` | yo'q | **yo'q** | Yangi resurs yaratish, buyruq |
| `PUT` | yo'q | ha | To'liq almashtirish |
| `PATCH` | yo'q | odatda yo'q | Qisman yangilash |
| `DELETE` | yo'q | ha | O'chirish |

Bu jadval nazariy emas: brauzerlar, proxy'lar, CDN'lar va retry mexanizmlari aynan shunga tayanadi. `GET` da ma'lumot o'zgartirgan endpoint — prefetch qiluvchi brauzer tomonidan chaqirilib, ma'lumotni buzishi mumkin.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `methods` ni ko'rsatmaslik | Bitta route barcha metodlarni yutadi, 405 o'rniga noto'g'ri javob | `methods: ['GET']` |
| `/blog/{slug}` ni `/blog/list` dan oldin e'lon qilish | Umumiy route konkretini yutadi | `priority` yoki tartibni to'g'rilash |
| Kodda qattiq yozilgan URL | Yo'l o'zgarganda hamma joyni qidirish | `generateUrl()` / `path()` |
| `default_uri` ni sozlamaslik | CLI/worker'da `http://localhost` havolalari | `framework.router.default_uri` |
| ID o'rniga tartib raqami ishlatish | Resurs raqamlanishi o'zgarsa havolalar buziladi | Barqaror ID yoki slug |
| `requirements` ni validatsiya deb bilish | Mos kelmasa 404 chiqadi, 422 emas | Biznes qoidasi uchun validator ([13-bob](13-validatsiya.md)) |
| Har bir action uchun alohida prefiks yozish | Takrorlanish, xato ehtimoli | Klass darajasidagi `#[Route]` |

---

## Amaliyot

1. `PostController` yarating: `index`, `show`, `create`, `update`, `delete` action'lari bilan to'liq REST route to'plami (`GET/POST/PUT/DELETE`).
2. `php bin/console debug:router --show-controllers` chiqishini tekshiring: nomlar va metodlar siz kutgandek ekanini tasdiqlang.
3. `/api/posts/abc` ga so'rov yuboring va `requirements: ['id' => '\d+']` tufayli 404 kelishini ko'ring.
4. `router:match /api/posts/42 --method=DELETE` ni ishga tushiring va chiqishini o'qing.
5. `UriSigner` bilan imzolangan havola yarating va `#[IsSignatureValid]` bilan himoyalangan endpoint qiling. Imzoning bitta belgisini o'zgartirib, 403 kelishini tasdiqlang.

---

## Rasmiy hujjat

- Routing: <https://symfony.com/doc/current/routing.html>
- Route atributi ma'lumotnomasi: <https://symfony.com/doc/current/routing.html#creating-routes-as-attributes>
- URL generatsiya: <https://symfony.com/doc/current/routing.html#generating-urls>
- Imzolangan URI: <https://symfony.com/doc/current/routing.html#signing-uris>

---

[← Oldingi: Konfiguratsiya](08-konfiguratsiya.md) · [Mundarija](README.md) · [Keyingi: Kontrollerlar →](10-kontrollerlar.md)
