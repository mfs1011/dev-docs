# 20 — Serializer va DTO

[← Oldingi: Fixtures](19-fixtures.md) · [Mundarija](README.md) · [Keyingi: REST API →](21-rest-api.md)

---

## Ikki bosqichli arxitektura

Serializer ikki qatlamdan iborat, va bu ajratma butun komponentni tushunish kaliti:

```
Ob'ekt  →  [Normalizer]  →  massiv  →  [Encoder]  →  JSON/XML/CSV
JSON    →  [Decoder]     →  massiv  →  [Denormalizer] →  Ob'ekt
```

- **Normalizer** biladi: ob'ektning qaysi maydonlari, qanday nom bilan, qanday formatda chiqishi kerak.
- **Encoder** biladi: massivni qanday qilib JSON yoki XML matniga aylantirish kerak.

Shuning uchun "sanani boshqacha formatda chiqarish" — normalizer masalasi, "JSON'ni chiroyli formatlash" — encoder masalasi.

```php
use Symfony\Component\Serializer\SerializerInterface;

final class PostPresenter
{
    public function __construct(private SerializerInterface $serializer)
    {
    }

    public function toJson(Post $post): string
    {
        return $this->serializer->serialize($post, 'json', ['groups' => ['post:read']]);
    }
}
```

---

## Guruhlar — kontraktni boshqarish

```php
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;
use Symfony\Component\Serializer\Attribute\Ignore;

#[ORM\Entity]
class Post
{
    #[Groups(['post:read'])]
    private ?int $id = null;

    #[Groups(['post:read', 'post:list'])]
    private string $title;

    #[Groups(['post:read'])]
    private string $body;

    #[Groups(['post:read'])]
    #[SerializedName('published_at')]
    private ?\DateTimeImmutable $publishedAt = null;

    #[Ignore]
    private ?string $internalNote = null;
}
```

```php
$this->json($post, 200, [], ['groups' => ['post:read']]);
$this->json($posts, 200, [], ['groups' => ['post:list']]);   // ro'yxatda kamroq maydon
```

**Nega ro'yxat va bitta element uchun turli guruh?** Ro'yxatda 50 ta element bo'lsa, har biriga to'liq matnni qo'shish — javob hajmini o'nlab barobar oshiradi. Kontrakt nuqtai nazaridan ham to'g'ri: ro'yxat — qisqacha ko'rinish, detal — to'liq.

Foydali kontekst sozlamalari:

```php
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\Normalizer\DateTimeNormalizer;

$context = [
    'groups' => ['post:read'],
    AbstractObjectNormalizer::SKIP_NULL_VALUES => true,
    DateTimeNormalizer::FORMAT_KEY => \DateTimeInterface::ATOM,
];
```

Metadata'ni tekshirish:

```shell
php bin/console debug:serializer 'App\Entity\Post'
```

---

## DTO — kontraktni domendan ajratish

Guruhlar bilan entity'ni to'g'ridan-to'g'ri chiqarish ishlaydi, lekin u ikkita jiddiy muammoni yaratadi:

1. **Kontrakt domen bilan bog'lanib qoladi.** Entity'da maydon nomini o'zgartirsangiz — API mijozlari sinadi.
2. **Tasodifiy sizish.** Yangi maydon qo'shilganda guruhni unutish — ichki ma'lumot API'ga chiqib ketishi.

Katta yoki uzoq yashaydigan API uchun yechim — **chiqish DTO'si**:

```php
namespace App\Dto;

use App\Entity\Post;

final readonly class PostView
{
    public function __construct(
        public int $id,
        public string $title,
        public string $body,
        public string $status,
        public ?string $publishedAt,
        public AuthorView $author,
    ) {
    }

    public static function fromEntity(Post $post): self
    {
        return new self(
            id: $post->getId(),
            title: $post->getTitle(),
            body: $post->getBody(),
            status: $post->getStatus()->value,
            publishedAt: $post->getPublishedAt()?->format(\DateTimeInterface::ATOM),
            author: AuthorView::fromEntity($post->getAuthor()),
        );
    }
}
```

```php
#[Route('/api/posts/{id}', methods: ['GET'])]
public function show(Post $post): JsonResponse
{
    return $this->json(PostView::fromEntity($post));
}
```

Endi API javobi — **aniq e'lon qilingan klass**. Entity o'zgarsa, kompilyator (yoki PHPStan) sizga DTO'ni yangilash kerakligini aytadi; mijoz esa hech narsa sezmaydi.

| Yondashuv | Qachon |
| --- | --- |
| Entity + guruhlar | Kichik/ichki API, tez prototip, admin panel |
| Chiqish DTO | Ommaviy API, tashqi mijozlar, uzoq yashaydigan kontrakt |

Kirish tomonda esa DTO deyarli har doim to'g'ri ([10-bob](10-kontrollerlar.md)): `#[MapRequestPayload]` bilan kelgan DTO validatsiyadan o'tgan, tipli va domenga to'g'ridan-to'g'ri tegmaydi.

---

## O'z normalizeringiz

Domen tipini (masalan `Money`) formatlash uchun:

```php
namespace App\Serializer;

use App\Domain\Money;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class MoneyNormalizer implements NormalizerInterface
{
    /**
     * @return array{amount: int, currency: string}
     */
    public function normalize(mixed $data, ?string $format = null, array $context = []): array
    {
        \assert($data instanceof Money);

        return [
            'amount' => $data->amountInMinorUnits,
            'currency' => $data->currency,
        ];
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return $data instanceof Money;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [Money::class => true];
    }
}
```

`autoconfigure` tufayli u avtomatik ro'yxatdan o'tadi. `getSupportedTypes()` — unumdorlik uchun muhim: Serializer qaysi normalizer'ni chaqirishni keshlaydi.

---

## Muhandislik nuqtai nazari: API kontrakti — bu va'da

Ommaviy API'ga chiqarilgan har bir maydon — **siz bekor qila olmaydigan va'da**. Mijozlar unga tayanadi, va "biz buni ichki maydon deb o'ylagandik" degan tushuntirish yordam bermaydi.

Amaliy qoidalar:

1. **Faqat kerakli narsani chiqaring.** Standart javob — minimal; qo'shimcha maydonni keyin qo'shish oson, olib tashlash — buzuvchi o'zgarish.
2. **Pul, sana, identifikator formatini oldindan qat'iylashtiring.** Pul — butun sonda eng kichik birlikda (`{"amount": 1999, "currency": "UZS"}`), float emas (suzuvchi nuqta xatolari). Sana — ISO 8601/RFC 3339 (`2026-09-21T10:30:00+00:00`), UTC'da. ID — satr sifatida (katta sonlar JavaScript'da aniqligini yo'qotadi).
3. **Null va yo'qlikni ajrating.** `SKIP_NULL_VALUES` qulay, lekin mijoz uchun "maydon yo'q" va "maydon null" — turli xabarlar. Bitta qoidani tanlang va butun API'da unga rioya qiling.
4. **Ro'yxat javobini o'rab chiqing.** `[{...}, {...}]` o'rniga `{"items": [...], "total": 120}` — keyinchalik metama'lumot (paginatsiya, kursor) qo'shish uchun joy qoldiradi. Massivni ob'ektga aylantirish — buzuvchi o'zgarish.
5. **Kontraktni testda qotiring.** Javob strukturasini tekshiradigan test — mijozlarni himoya qiladigan yagona ishonchli vosita ([30-bob](30-testlash.md)).

Bu qarorlar orqaga qaytarib bo'lmaydigan turkumga kiradi, shuning uchun ular kod yozishdan oldin qabul qilinishi kerak.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Entity'ni guruhsiz JSON qilish | Parol hash'i, ichki maydonlar sizadi | Guruhlar yoki DTO |
| Aloqador entity'larni cheksiz chiqarish | Circular reference, ulkan javob | `#[MaxDepth]`, guruhlar, DTO |
| Pulni `float` da chiqarish | Yaxlitlash xatolari | Butun son (tiyin/sent) + valyuta |
| Sanani lokal formatda chiqarish | Mijoz parse qila olmaydi | ISO 8601 (`ATOM`), UTC |
| Ro'yxatni yalang'och massiv qilib qaytarish | Metama'lumot qo'shish buzuvchi o'zgarishga aylanadi | `{"items": [...], "total": n}` |
| Serializer bilan katta to'plamni bir zumda chiqarish | Xotira | `StreamedJsonResponse` ([11-bob](11-request-response.md)) |
| Guruhlarni faqat qo'shib borish | Vaqt o'tib kim nimani ko'rishi chalkashadi | Kam sonli aniq guruh: `:list`, `:read`, `:write` |

---

## Amaliyot

1. `Post` entity'ga `post:list` va `post:read` guruhlarini qo'ying, ikkita endpoint yozing va javoblar farqini ko'ring.
2. `debug:serializer 'App\Entity\Post'` chiqishini o'qing.
3. `PostView` DTO'sini yozing va `show` endpoint'ini unga o'tkazing. Entity maydonini qayta nomlab, API javobi o'zgarmaganini tasdiqlang.
4. `MoneyNormalizer` yozing va `Money` tipini o'z ichiga olgan javobni tekshiring.
5. Javob strukturasini tekshiradigan test yozing (kalitlar to'plami aynan kutilgandek ekanini).

---

## Bog'liq patternlar

[P-02 Output DTO, P-05 Javob o'rami](patterns/01-http-qatlam.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Serializer: <https://symfony.com/doc/current/serializer.html>
- Normalizer'lar: <https://symfony.com/doc/current/serializer/custom_normalizer.html>
- Kontekst sozlamalari: <https://symfony.com/doc/current/serializer.html#serializer-context>
- Serializer komponenti: <https://symfony.com/doc/current/components/serializer.html>

---

[← Oldingi: Fixtures](19-fixtures.md) · [Mundarija](README.md) · [Keyingi: REST API →](21-rest-api.md)
