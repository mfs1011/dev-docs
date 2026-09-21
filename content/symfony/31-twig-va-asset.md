# 31 — Twig va AssetMapper

[← Oldingi: Testlash](30-testlash.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha →](32-amaliy-loyiha.md)

---

## Twig asoslari

```twig
{# templates/base.html.twig #}
<!DOCTYPE html>
<html lang="uz">
<head>
    <meta charset="UTF-8">
    <title>{% block title %}Ilova{% endblock %}</title>
    {% block stylesheets %}{% endblock %}
    {% block javascripts %}
        {% block importmap %}{{ importmap('app') }}{% endblock %}
    {% endblock %}
</head>
<body>
    {% block body %}{% endblock %}
</body>
</html>
```

```twig
{# templates/post/show.html.twig #}
{% extends 'base.html.twig' %}

{% block title %}{{ post.title }}{% endblock %}

{% block body %}
    <article>
        <h1>{{ post.title }}</h1>
        <p class="meta">
            {{ post.publishedAt|format_datetime(locale: 'uz', pattern: 'd MMMM y') }}
            · {{ post.author.name }}
        </p>

        {{ post.body|nl2br }}

        {% if is_granted('POST_EDIT', post) %}
            <a href="{{ path('post_edit', {id: post.id}) }}">Tahrirlash</a>
        {% endif %}
    </article>
{% endblock %}
```

Uchta asosiy tushuncha:

| Sintaksis | Vazifasi |
| --- | --- |
| `{{ ... }}` | Qiymatni chiqarish (avtomatik escape qilinadi) |
| `{% ... %}` | Mantiq: `if`, `for`, `block`, `extends`, `include` |
| `{# ... #}` | Izoh (chiqishda ko'rinmaydi) |

---

## Nega Twig, PHP shablon emas

**1. Avtomatik escaping.** `{{ post.title }}` HTML kontekstida avtomatik `htmlspecialchars` qilinadi. Bu XSS himoyasini **standart holat** qiladi: xavfsizlik uchun bir narsa yozish emas, xavfsizlikni o'chirish uchun bir narsa yozish kerak (`|raw`).

```twig
{{ userInput }}           {# xavfsiz #}
{{ userInput|raw }}       {# XAVFLI — faqat ishonchli HTML uchun #}
{{ value|e('js') }}       {# JS kontekstida #}
{{ value|e('url') }}      {# URL kontekstida #}
```

**Kontekst muhim:** HTML ichidagi escaping JavaScript ichida yetarli emas. `<script>var x = "{{ value }}"</script>` — bu yerda `|e('js')` kerak.

**2. Cheklangan til.** Twig'da baza so'rovi yozib bo'lmaydi, fayl o'chirib bo'lmaydi. Bu cheklov emas, **arxitektura himoyasi**: shablon faqat ko'rsatadi, hisoblamaydi.

**3. Meros va bloklar.** `extends` + `block` — takrorlanishni yo'q qiladi.

---

## Shablon mantiqini chiqarish

```php
namespace App\Twig;

use Twig\Attribute\AsTwigFilter;
use Twig\Attribute\AsTwigFunction;

final class AppExtension
{
    #[AsTwigFilter('money')]
    public function formatMoney(int $minorUnits, string $currency = 'UZS'): string
    {
        return number_format($minorUnits / 100, 2, '.', ' ').' '.$currency;
    }

    #[AsTwigFunction('reading_time')]
    public function readingTime(string $text): int
    {
        return max(1, (int) ceil(str_word_count(strip_tags($text)) / 200));
    }
}
```

```twig
{{ order.total|money }} · {{ post.body|reading_time }} daqiqa
```

Katta yoki bog'liqliklarga muhtoj mantiq uchun — **Twig komponentlari** (`symfony/ux-twig-component`) yoki oddiygina kontrollerda tayyorlangan view-model.

---

## AssetMapper

Zamonaviy Symfony'da JS/CSS uchun standart yechim — bundler'siz ishlaydigan AssetMapper:

```shell
php bin/console importmap:require bootstrap
php bin/console importmap:install
php bin/console debug:asset-map
php bin/console importmap:audit       # xavfsizlik tekshiruvi
php bin/console importmap:outdated
```

```php
// importmap.php
return [
    'app' => [
        'path' => './assets/app.js',
        'entrypoint' => true,
    ],
    'bootstrap' => [
        'version' => '5.3.3',
    ],
];
```

```javascript
// assets/app.js
import './styles/app.css';
import { Modal } from 'bootstrap';
```

Ishlash printsipi: brauzerning native **importmap** imkoniyati. Fayllar bundle qilinmaydi — ular xesh bilan versiyalanadi va to'g'ridan-to'g'ri yuboriladi. HTTP/2 va uzoq muddatli kesh sharoitida bu ko'pchilik loyiha uchun yetarli.

Deploy:

```shell
php bin/console asset-map:compile      # public/assets/ ga versiyalangan fayllar
```

| | AssetMapper | Webpack Encore |
| --- | --- | --- |
| Node.js kerakmi | **Yo'q** | Ha |
| Build qadami | Faqat `asset-map:compile` | `npm run build` |
| TypeScript, Sass, JSX | Cheklangan (qo'shimcha sozlash) | To'liq |
| Tree shaking, minifikatsiya | Yo'q | Ha |
| Qachon | Oddiy/o'rtacha frontend, API + admin | Og'ir SPA, murakkab build |

---

## Muhandislik nuqtai nazari: shablon — bu chegara

Twig shabloni ham [10-bobdagi](10-kontrollerlar.md) kontroller kabi chegaraviy qatlam. Shundan amaliy qoidalar:

**1. Shablonga tayyor ma'lumot bering.** `{{ post.author.company.address.city }}` — bu shablonda lazy loading zanjiri, ya'ni yashirin SQL so'rovlari ([18-bob](18-aloqalar.md)). Kerakli ma'lumotni kontrollerda yuklang yoki view-model tayyorlang.

**2. Shablonda biznes qarorlari bo'lmasin.** `{% if user.balance > 0 and user.status == 'active' and not user.blocked %}` — bu domen qoidasi. Uni `{% if user.canPurchase %}` ga aylantiring: qoida bitta joyda bo'ladi va test qilinadi.

**3. `|raw` ni har doim shubha bilan qarang.** Har bir `|raw` — potentsial XSS. Agar foydalanuvchi HTML kiritishi kerak bo'lsa, uni **sanitizatsiya qiling** (`symfony/html-sanitizer`), keyin `|raw` qiling:

```php
use Symfony\Component\HtmlSanitizer\HtmlSanitizerInterface;

$safeHtml = $this->sanitizer->sanitize($userHtml);
```

**4. Shablonlarni keshlash.** Twig `prod` da kompilyatsiya qilingan PHP klasslarini ishlatadi va ularni deploy'da `cache:warmup` tayyorlaydi — bu bepul unumdorlik ([33-bob](33-unumdorlik.md)).

**5. Katta sahifalarni bo'laklang.** `{{ render(controller(...)) }}` sub-request yaratadi ([04-bob](04-sorov-hayot-sikli.md)); ular alohida keshlanishi mumkin (ESI/fragment). Lekin har sub-request qo'shimcha narx — o'lchamasdan ishlatmang.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `|raw` ni tekshirmasdan ishlatish | XSS | HTML sanitizer + ongli qaror |
| JS ichida HTML escaping'ga tayanish | Kontekst noto'g'ri, XSS | `|e('js')` |
| Shablonda aloqalar zanjiri | Yashirin N+1 | Kontrollerda yuklang |
| Biznes qoidasini shablonda yozish | Test yo'q, takrorlanadi | Entity metodi / view-model |
| `strict_variables` ni o'chirish | Xato jimgina yashiriladi | `when@test`/`dev` da yoqing |
| Har sahifada barcha JS/CSS yuklash | Ortiqcha trafik | Alohida entrypoint'lar |
| `asset-map:compile` ni deploy'da unutish | 404 assetlar | Deploy skriptiga qo'shing |

---

## Amaliyot

1. `base.html.twig` va post sahifasini yozing; `is_granted()` bilan tahrirlash havolasini shartli ko'rsating.
2. `money` filtri va `reading_time` funksiyasini qo'shing.
3. `<script>` blokiga o'zgaruvchini `|e('js')` bilan va usiz chiqarib, farqni ko'ring.
4. `importmap:require bootstrap` qilib, modal oynani ishlating; `debug:asset-map` chiqishini ko'ring.
5. `asset-map:compile` ni ishga tushiring va `public/assets/` ichidagi versiyalangan fayllarni ko'ring.

---

## Rasmiy hujjat

- Twig (Symfony): <https://symfony.com/doc/current/templates.html>
- Twig tili: <https://twig.symfony.com/doc/3.x/>
- Twig kengaytmalari: <https://symfony.com/doc/current/templating/twig_extension.html>
- AssetMapper: <https://symfony.com/doc/current/frontend/asset_mapper.html>
- HTML Sanitizer: <https://symfony.com/doc/current/html_sanitizer.html>

---

[← Oldingi: Testlash](30-testlash.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha →](32-amaliy-loyiha.md)
