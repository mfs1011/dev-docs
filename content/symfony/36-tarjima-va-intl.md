# 36 — Ko'p tillilik: Translation va Intl

[← Oldingi: Mercure](35-mercure.md) · [Mundarija](README.md) · [Keyingi: Ilg'or Doctrine →](37-ilgor-doctrine.md)

---

## Sozlash

```yaml
# config/packages/translation.yaml
framework:
    default_locale: 'uz'
    translator:
        default_path: '%kernel.project_dir%/translations'
        fallbacks: ['uz']
        enabled_locales: ['uz', 'ru', 'en']
```

`enabled_locales` — ikki foyda beradi: keraksiz tillar uchun kesh yaratilmaydi (unumdorlik, [33-bob](33-unumdorlik.md)) va noto'g'ri locale qiymatlari rad etiladi.

Fayl nomlanishi: `domain.locale.format`.

```
translations/
├─ messages.uz.yaml
├─ messages.ru.yaml
├─ messages+intl-icu.uz.yaml     ← ICU formati (ko'plik, shartlar)
└─ validators.uz.yaml            ← validatsiya xabarlari domeni
```

---

## Kalitlar, matnlar emas

```yaml
# translations/messages.uz.yaml
post:
    title: 'Maqola'
    created: 'Maqola yaratildi'
button:
    save: 'Saqlash'
    cancel: 'Bekor qilish'
```

```twig
{{ 'post.created'|trans }}
{{ t('button.save') }}
```

**Nega kalit, tayyor matn emas?** Uchta sabab:

1. Matn o'zgarganda barcha tarjimalarni qayta yozish kerak bo'lmaydi.
2. Bir xil matn turli kontekstda turlicha tarjima qilinishi mumkin (`button.save` va `menu.save`).
3. Tarjima yo'qligi darhol ko'rinadi (`post.created` ekranga chiqadi).

Kalit **maqsadni** ifodalasin, joylashuvni emas: `label.username` — yaxshi; `user_edit_form_field_1` — yomon.

---

## Kodda tarjima

```php
use Symfony\Contracts\Translation\TranslatorInterface;

final class OrderNotifier
{
    public function __construct(private TranslatorInterface $translator)
    {
    }

    public function subject(Order $order, string $locale): string
    {
        return $this->translator->trans(
            'email.order_shipped.subject',
            ['%number%' => $order->getNumber()],
            domain: 'emails',
            locale: $locale,
        );
    }
}
```

Translator'ni in'ektsiya qilmasdan — `TranslatableMessage`:

```php
use function Symfony\Component\Translation\t;

$message = t('order.status.shipped', ['%number%' => $order->getNumber()]);
// Tarjima faqat ko'rsatish paytida amalga oshadi (Twig yoki translator orqali)
```

Bu naqsh domen qatlamini translator'dan ajratadi: domen "nima aytilishini" biladi, "qaysi tilda" — ko'rsatish qatlamining ishi.

Enum'lar ham tarjimalanadigan bo'lishi mumkin:

```php
use Symfony\Contracts\Translation\TranslatableInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

enum OrderStatus: string implements TranslatableInterface
{
    case Pending = 'pending';
    case Paid = 'paid';

    public function trans(TranslatorInterface $translator, ?string $locale = null): string
    {
        return $translator->trans('order.status.'.$this->value, locale: $locale);
    }
}
```

---

## ICU: ko'plik va shartlar

O'zbek tilida ko'plik shakllari ingliz tilidan farq qiladi, rus tilida esa uchta shakl bor. Qo'lda `if` yozish o'rniga ICU formati ishlatiladi:

```yaml
# translations/messages+intl-icu.ru.yaml
cart.items: '{count, plural, one {# товар} few {# товара} other {# товаров}}'
```

```yaml
# translations/messages+intl-icu.uz.yaml
cart.items: '{count, plural, other {# ta mahsulot}}'
```

```twig
{{ 'cart.items'|trans({'count': cart.itemCount}) }}
```

Shart (select):

```yaml
notification.greeting: >
    {gender, select,
        female {Hurmatli xonim {name}}
        male {Hurmatli janob {name}}
        other {Hurmatli {name}}
    }
```

ICU shuningdek sana, son va valyutani locale bo'yicha formatlaydi — ya'ni tarjimon matn ichidagi formatni ham boshqara oladi.

---

## Locale ni aniqlash

```php
#[Route('/{_locale}/posts', name: 'post_index', requirements: ['_locale' => 'uz|ru|en'])]
public function index(): Response
{
    // Symfony `_locale` ni avtomatik o'rnatadi
}
```

Boshqa manbalar: foydalanuvchi profili, `Accept-Language` sarlavhasi (`$request->getPreferredLanguage(['uz', 'ru', 'en'])`), cookie.

Fon jarayonlarida (email, hisobot) joriy locale yo'q — uni aniq uzatish kerak:

```php
use Symfony\Component\Translation\LocaleSwitcher;

$this->localeSwitcher->runWithLocale($user->getLocale(), function () use ($user): void {
    $this->mailer->send($this->buildEmail($user));
});
```

Bu — Messenger handler'larida eng ko'p unutiladigan nuqta: xabarga foydalanuvchi locale'ini qo'shing, aks holda xat standart tilda ketadi.

---

## Intl: sana, son, valyuta

```twig
{{ order.createdAt|format_datetime(locale: 'uz', pattern: 'd MMMM y, HH:mm') }}
{{ product.price|format_currency('UZS', locale: 'uz') }}
{{ 1234567.89|format_number(locale: 'ru') }}
```

```php
use Symfony\Component\Intl\Countries;
use Symfony\Component\Intl\Languages;

Countries::getName('UZ', 'uz');     // "O'zbekiston"
Languages::getName('ru', 'uz');
```

`intl` PHP kengaytmasi bo'lmasa, Symfony zaxira ma'lumotlardan foydalanadi, lekin **production'da `intl` o'rnatilgan bo'lishi kerak** — u to'g'ri va to'liq CLDR ma'lumotlarini beradi.

---

## Vositalar

```shell
php bin/console translation:extract --force --format=yaml ru
php bin/console debug:translation ru --only-missing
php bin/console debug:translation ru --only-unused
php bin/console lint:yaml translations/
php bin/console lint:xliff translations/
```

`--only-missing` ni CI bosqichiga qo'yish mumkin: yangi kalit tarjimasiz qolsa, build yiqiladi.

---

## Muhandislik nuqtai nazari: lokalizatsiya — faqat matn emas

**1. Ma'lumotlar bazasidagi kontent.** Interfeys matnlari tarjima fayllarida; **foydalanuvchi kontenti** (mahsulot nomi, maqola) bazada. Ikkinchisi uchun alohida yechim kerak: tarjima jadvali (`post_translations`) yoki JSON ustun. Buni boshidan hal qilmaslik — keyinchalik og'riqli migratsiya.

**2. Vaqt zonalari.** Baza doim UTC'da saqlasin; foydalanuvchi zonasida faqat **ko'rsatishda** o'zgartiring. "Buyurtma 2026-09-21 da qilingan" iborasi foydalanuvchi zonasiga qarab boshqa sana bo'lishi mumkin.

**3. Matn uzunligi o'zgaradi.** Nemis tilida matn ingliz tilidan ~30% uzun, yapon tilida qisqa. Qat'iy kenglikdagi UI elementlari buziladi. Symfony'ning **pseudolocalization** rejimi buni oldindan tekshirishga yordam beradi:

```yaml
framework:
    translator:
        pseudo_localization:
            accents: true
            brackets: true
            expansion_factor: 1.4
```

**4. Konkatenatsiya qilmang.** `trans('greeting') ~ ' ' ~ user.name` — ba'zi tillarda so'z tartibi boshqacha. Har doim parametr ishlating: `trans('greeting', {'%name%': user.name})`.

**5. Pul va raqamlar.** Faqat format emas — vergul/nuqta, minglik ajratgich, valyuta belgisining joyi. `format_currency` ni qo'lda `number_format` bilan almashtirmang.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tarjima kaliti sifatida ingliz matnini ishlatish | Matn o'zgarsa barcha fayllar o'zgaradi | Mazmunli kalit |
| Satrlarni konkatenatsiya qilish | So'z tartibi tillarda farq qiladi | Parametrlar |
| Ko'plikni `if` bilan yozish | Rus/arab tillarida noto'g'ri | ICU `plural` |
| Fon jarayonida locale uzatmaslik | Xat standart tilda ketadi | `LocaleSwitcher` / xabarda locale |
| Sanani serverda lokal formatda saqlash | Vaqt zonasi chalkashligi | UTC saqlash, ko'rsatishda konvertatsiya |
| Baza kontentini tarjima fayliga solish | Fayllar shishadi, tahrirlash qiyin | Baza darajasida tarjima |
| `enabled_locales` ni cheklamaslik | Ortiqcha kesh, noto'g'ri locale qabul qilinadi | Ro'yxatni aniq belgilang |

---

## Amaliyot

1. `messages.uz.yaml` va `messages.ru.yaml` yarating, Twig'da `t()` bilan ishlating.
2. `messages+intl-icu.ru.yaml` da ko'plik qoidasini yozing va 1, 3, 10 qiymatlar uchun natijani tekshiring.
3. `/{_locale}/posts` route'ini qo'shing va tillar o'rtasida almashishni sinab ko'ring.
4. `debug:translation ru --only-missing` ni ishga tushiring va yetishmayotgan kalitlarni to'ldiring.
5. `pseudo_localization` ni yoqib, interfeysda buzilgan joylarni toping.

---

## Rasmiy hujjat

- Tarjimalar: <https://symfony.com/doc/current/translation.html>
- ICU MessageFormat: <https://symfony.com/doc/current/reference/formats/message_format.html>
- Locale bilan ishlash: <https://symfony.com/doc/current/translation/locale.html>
- Intl komponenti: <https://symfony.com/doc/current/components/intl.html>
- Twig Intl kengaytmasi: <https://twig.symfony.com/doc/3.x/filters/format_datetime.html>

---

[← Oldingi: Mercure](35-mercure.md) · [Mundarija](README.md) · [Keyingi: Ilg'or Doctrine →](37-ilgor-doctrine.md)
