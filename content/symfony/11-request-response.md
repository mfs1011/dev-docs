# 11 — So'rov va javob (HttpFoundation)

[← Oldingi: Kontrollerlar](10-kontrollerlar.md) · [Mundarija](README.md) · [Keyingi: Event listener va subscriber →](12-event-listener.md)

---

## Nega alohida komponent

PHP'ning global massivlari (`$_GET`, `$_POST`, `$_SERVER`) — testlash uchun dushman: ularni o'rnatish global holatni o'zgartiradi, tozalash unutiladi, IDE yordam bermaydi. HttpFoundation shu globallarni **ob'ektga** o'raydi:

```php
use Symfony\Component\HttpFoundation\Request;

$request = Request::createFromGlobals();                 // haqiqiy so'rovdan
$request = Request::create('/api/posts?page=2', 'GET');  // testda — global holatsiz
```

Natijada butun HTTP qatlami testda soxta so'rov bilan ishlay oladi va `$_GET` ga hech kim tegmaydi.

---

## Request API

```php
// Parametr sumkalari (ParameterBag)
$request->query;      // ?a=b  (GET)
$request->request;    // form-data body (POST)
$request->cookies;
$request->files;
$request->server;
$request->headers;
$request->attributes; // Symfony ichki: _route, _controller va sizning qiymatlaringiz

// O'qish
$page   = $request->query->getInt('page', 1);
$sort   = $request->query->getString('sort', 'id');
$active = $request->query->getBoolean('active');
$status = $request->query->getEnum('status', PostStatus::class);

// JSON tanasi
$data = $request->toArray();        // noto'g'ri JSON bo'lsa istisno
$data = $request->getPayload();     // POST form yoki JSON — bir xil interfeys
$raw  = $request->getContent();     // xom satr

// So'rov haqida
$request->getMethod();        // 'POST'
$request->isMethod('POST');
$request->getPathInfo();      // '/api/posts'
$request->getUri();
$request->isSecure();         // HTTPS?
$request->getClientIp();
$request->getPreferredLanguage(['uz', 'ru', 'en']);
$request->isXmlHttpRequest(); // AJAX (X-Requested-With)
```

`getInt()`, `getBoolean()`, `getEnum()` kabi metodlar — kichik, lekin muhim narsa: ular `?page=abc` kabi kirishda tip xatosi o'rniga xavfsiz standart qiymat yoki aniq istisno beradi.

### Trusted proxy — production'da majburiy sozlama

Yuk balanslovchi yoki CDN ortida ishlayotganda `getClientIp()` proxy IP sini qaytaradi, `isSecure()` esa `false` bo'lishi mumkin. Buni tuzatish uchun ishonchli proxy'lar e'lon qilinadi:

```yaml
# config/packages/framework.yaml
framework:
    trusted_proxies: '%env(TRUSTED_PROXIES)%'     # masalan: 10.0.0.0/8,192.168.0.0/16
    trusted_headers: ['x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-forwarded-port']
```

**Nega bu xavfsizlik masalasi?** `X-Forwarded-For` — oddiy sarlavha, uni har kim yubora oladi. Agar Symfony hammaga ishonsa, hujumchi o'z IP sini istalgancha ko'rsatib, IP bo'yicha cheklovlarni (rate limit, ban ro'yxati) chetlab o'tadi. Shuning uchun faqat **sizning** proxy'laringiz ro'yxati ishonchli bo'ladi.

---

## Response API

```php
use Symfony\Component\HttpFoundation\Response;

$response = new Response('Salom', Response::HTTP_OK, ['content-type' => 'text/plain']);

$response->setStatusCode(Response::HTTP_CREATED);      // 201
$response->headers->set('X-Total-Count', '42');
$response->setContent('...');
```

Status kodlarini **konstanta** bilan yozing (`Response::HTTP_UNPROCESSABLE_ENTITY`, `422` emas): o'qilishi aniq, xato yozib bo'lmaydi.

### Javob turlari

| Klass | Qachon |
| --- | --- |
| `JsonResponse` | API javoblari |
| `RedirectResponse` | Qayta yo'naltirish |
| `BinaryFileResponse` | Fayl yuborish (Range, X-Sendfile qo'llab-quvvatlaydi) |
| `StreamedResponse` | Katta/uzluksiz chiqish (CSV eksport) |
| `StreamedJsonResponse` | Katta JSON to'plam — xotirani ushlamasdan |
| `EventStreamResponse` | Server-Sent Events ([35-bob](35-mercure.md)) |

```php
use Symfony\Component\HttpFoundation\StreamedResponse;

#[Route('/export/posts.csv', methods: ['GET'])]
public function export(PostRepository $posts): StreamedResponse
{
    $response = new StreamedResponse(function () use ($posts): void {
        $out = fopen('php://output', 'w');
        fputcsv($out, ['id', 'title', 'status'], escape: '');

        foreach ($posts->iterateAll() as $post) {   // Doctrine toIterable() — batch bo'yicha
            fputcsv($out, [$post->getId(), $post->getTitle(), $post->getStatus()], escape: '');
        }

        fclose($out);
    });

    $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
    $response->headers->set('Content-Disposition', 'attachment; filename="posts.csv"');

    return $response;
}
```

**Nega stream?** 500 000 qatorli eksportni massivga yig'sangiz, PHP xotira limiti tugaydi. Stream'da har qator darhol chiqishga yoziladi — xotira sarfi qatorlar soniga bog'liq emas. Buning narxi: javob boshlangandan keyin status kodini o'zgartirib bo'lmaydi, shuning uchun barcha tekshiruvlarni stream boshlanishidan **oldin** qiling.

---

## HTTP kesh sarlavhalari

```php
$response->setPublic();                 // proxy/CDN keshlashi mumkin
$response->setPrivate();                // faqat brauzer
$response->setMaxAge(3600);             // brauzer uchun
$response->setSharedMaxAge(86400);      // CDN uchun (s-maxage)
$response->setEtag(md5($content));
$response->setLastModified(new \DateTimeImmutable('@'.$post->getUpdatedAt()->getTimestamp()));
$response->setVary(['Accept-Encoding', 'Accept-Language']);

if ($response->isNotModified($request)) {
    return $response;                   // 304 Not Modified — tana yuborilmaydi
}
```

304 mexanizmi API uchun ham ishlaydi va tarmoq trafigini sezilarli kamaytiradi: mijoz `If-None-Match` yuboradi, siz o'zgarmaganini aytasiz ([38-bob](38-api-pro.md)).

`setVary()` ni unutish — klassik xato: `Accept-Language` bo'yicha turli javob berilsa, lekin `Vary` yo'q bo'lsa, CDN bitta tildagi javobni hammaga tarqatadi.

---

## Cookie va sessiya

```php
use Symfony\Component\HttpFoundation\Cookie;

$cookie = Cookie::create('theme')
    ->withValue('dark')
    ->withExpires(new \DateTimeImmutable('+1 year'))
    ->withSecure(true)      // faqat HTTPS
    ->withHttpOnly(true)    // JS o'qiy olmaydi — XSS himoyasi
    ->withSameSite('lax');  // CSRF himoyasi

$response->headers->setCookie($cookie);
```

```php
$session = $request->getSession();
$session->set('last_search', $query);
$value = $session->get('last_search', '');
```

**API uchun muhim qoida:** token bilan ishlaydigan REST API'da sessiya **kerak emas**. Route'larni `stateless: true` qiling — sessiya ochilmaydi, `Set-Cookie` yuborilmaydi va javob keshlanadigan bo'lib qoladi. Sessiya ochilishi HTTP keshni jimgina o'ldiradi.

---

## Muhandislik nuqtai nazari: status kodlarini to'g'ri tanlash

Status kodi — mijoz kodining boshqaruv oqimi. Noto'g'ri kod mijoz mantiqini buzadi va monitoringni ko'r qiladi.

| Vaziyat | Kod | Izoh |
| --- | --- | --- |
| Muvaffaqiyatli o'qish | 200 | — |
| Resurs yaratildi | 201 + `Location` | Mijoz yangi URL ni biladi |
| Qabul qilindi, keyin bajariladi | 202 | Navbatga qo'yilgan ish ([26-bob](26-messenger.md)) |
| Muvaffaqiyat, tana yo'q | 204 | `DELETE` uchun tipik |
| Kirish sintaksisi buzuq (JSON emas) | 400 | — |
| Autentifikatsiya yo'q/yaroqsiz | 401 | `WWW-Authenticate` bilan |
| Autentifikatsiya bor, huquq yo'q | 403 | Farqni chalkashtirmang |
| Resurs yo'q | 404 | — |
| Metod noto'g'ri | 405 | `Allow` sarlavhasi bilan |
| Konflikt (masalan, takroriy slug) | 409 | — |
| Validatsiya xatosi | 422 | Sintaksis to'g'ri, ma'no noto'g'ri |
| Rate limit | 429 | `Retry-After` bilan |
| Server xatosi | 500 | Mijoz aybdor emas |
| Vaqtincha ishlamayapti | 503 | `Retry-After` bilan |

Ikkita eng ko'p uchraydigan chalkashlik:

- **401 va 403.** 401 = "kim ekaningni bilmayman"; 403 = "bilaman, lekin ruxsat yo'q". Mijoz birinchisida qayta login qiladi, ikkinchisida qilmasligi kerak.
- **400 va 422.** 400 = so'rovni tushunolmadim (buzilgan JSON); 422 = tushundim, lekin qiymatlar qoidaga mos emas. Frontend ikkinchisida maydon xatolarini ko'rsatadi.

Yana bir muhim odat: **xatolik javobini ham strukturaviy qiling**. Har xil endpoint har xil formatda xato qaytarsa, mijoz kodi `if` lar to'dasiga aylanadi. RFC 9457 (Problem Details) — tayyor standart ([24-bob](24-xatolik-va-log.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `trusted_proxies` ni sozlamaslik | Mijoz IP si noto'g'ri, rate limit aldanadi, HTTPS aniqlanmaydi | `framework.trusted_proxies` |
| Barcha xatolarga 200 qaytarish | Monitoring va mijoz mantiqi buziladi | To'g'ri status kodlari |
| Katta eksportni massivga yig'ish | Xotira tugaydi | `StreamedResponse` / `StreamedJsonResponse` |
| API'da sessiyani ochiq qoldirish | Kesh o'ladi, `Set-Cookie` har javobda | `stateless: true` |
| `Vary` ni unutish | CDN noto'g'ri javobni tarqatadi | `setVary(['Accept-Language'])` |
| Cookie'da `HttpOnly`/`Secure` yo'qligi | XSS orqali sessiya o'g'irlanadi | `Cookie::create()->withHttpOnly(true)->withSecure(true)` |
| Xom `$_GET` / `$_POST` ishlatish | Test qilib bo'lmaydi, tip xavfsizligi yo'q | `Request` ob'ekti |

---

## Amaliyot

1. `GET /api/posts?page=abc` so'roviga `getInt('page', 1)` qanday javob berishini tekshiring.
2. CSV eksport endpoint'ini `StreamedResponse` bilan yozing va 100 000 qator uchun `memory_get_peak_usage()` ni massiv variantiga solishtiring.
3. `ETag` + `isNotModified()` ni bitta endpoint'ga qo'shing. `curl -H 'If-None-Match: "..."'` bilan 304 olganingizni tasdiqlang.
4. `stateless: true` ni qo'shib, javobda `Set-Cookie` yo'qolganini tekshiring.
5. `framework.trusted_proxies` ni sozlang va `X-Forwarded-For` yuborib `getClientIp()` natijasi qanday o'zgarishini ko'ring.

---

## Rasmiy hujjat

- HttpFoundation: <https://symfony.com/doc/current/components/http_foundation.html>
- Sessiyalar: <https://symfony.com/doc/current/session.html>
- Fayl yuklash: <https://symfony.com/doc/current/controller/upload_file.html>
- Proxy ortida ishlash: <https://symfony.com/doc/current/deployment/proxies.html>
- HTTP kesh: <https://symfony.com/doc/current/http_cache.html>

---

[← Oldingi: Kontrollerlar](10-kontrollerlar.md) · [Mundarija](README.md) · [Keyingi: Event listener va subscriber →](12-event-listener.md)
