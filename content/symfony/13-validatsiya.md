# 13 — Validatsiya

[← Oldingi: Event listener](12-event-listener.md) · [Mundarija](README.md) · [Keyingi: Formalar →](14-formalar.md)

---

## Tushuncha

Symfony validatori **ob'ektni cheklovlar (constraints) ro'yxatiga qarab tekshiradi** va buzilishlar ro'yxatini qaytaradi. E'tibor bering: validator forma bilan ham, DTO bilan ham, oddiy qiymat bilan ham ishlaydi — u HTTP qatlamiga bog'liq emas.

```php
namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

final readonly class RegisterInput
{
    public function __construct(
        #[Assert\NotBlank]
        #[Assert\Email(mode: Assert\Email::VALIDATION_MODE_STRICT)]
        public string $email,

        #[Assert\NotBlank]
        #[Assert\Length(min: 12, max: 4096)]
        #[Assert\NotCompromisedPassword]
        public string $password,

        #[Assert\NotBlank]
        #[Assert\Length(min: 2, max: 60)]
        public string $name,

        #[Assert\Choice(choices: ['uz', 'ru', 'en'])]
        public string $locale = 'uz',
    ) {
    }
}
```

```php
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class Registrar
{
    public function __construct(private ValidatorInterface $validator)
    {
    }

    public function register(RegisterInput $input): void
    {
        $violations = $this->validator->validate($input);

        if (count($violations) > 0) {
            throw new ValidationFailedException($input, $violations);
        }

        // ...
    }
}
```

Kontrollerda esa buni qo'lda yozish kerak emas — `#[MapRequestPayload]` validatsiyani o'zi bajaradi va muvaffaqiyatsizlikda **422 Unprocessable Entity** qaytaradi ([10-bob](10-kontrollerlar.md)).

---

## Cheklovlarni qayerga qo'yish kerak

| Joy | Misol | Qachon |
| --- | --- | --- |
| Xossa (property) | `#[Assert\NotBlank]` | Aksariyat holat |
| Getter | `#[Assert\IsTrue]` `isPasswordSafe()` ustida | Bir nechta maydonga bog'liq oddiy qoida |
| Klass (`#[Assert\Callback]`) | Murakkab, kontekstli qoida | Maydonlararo mantiq |
| Forma maydoni (`constraints` opsiyasi) | `new Assert\Length(min: 3)` | Faqat shu formaga xos qoida |

```php
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

final class DateRangeInput
{
    public function __construct(
        public \DateTimeImmutable $from,
        public \DateTimeImmutable $to,
    ) {
    }

    #[Assert\Callback]
    public function validateRange(ExecutionContextInterface $context): void
    {
        if ($this->from > $this->to) {
            $context->buildViolation('Boshlanish sanasi tugash sanasidan keyin bo\'lishi mumkin emas.')
                ->atPath('from')
                ->addViolation();
        }
    }
}
```

`atPath()` muhim: frontend xatoni to'g'ri maydon yoniga chiqarishi uchun buzilish qaysi maydonga tegishli ekani aniq bo'lishi kerak.

---

## Guruhlar: bitta ob'ekt, har xil qoidalar

```php
use Symfony\Component\Validator\Constraints as Assert;

final class UserInput
{
    #[Assert\NotBlank(groups: ['create'])]
    #[Assert\Length(min: 12, groups: ['create', 'password_change'])]
    public ?string $password = null;

    #[Assert\NotBlank(groups: ['create', 'update'])]
    #[Assert\Email(groups: ['create', 'update'])]
    public ?string $email = null;
}
```

```php
#[Route('/api/users', methods: ['POST'])]
public function create(
    #[MapRequestPayload(validationGroups: ['create'])] UserInput $input,
): JsonResponse {
    // ...
}

#[Route('/api/users/{id}', methods: ['PATCH'])]
public function update(
    #[MapRequestPayload(validationGroups: ['update'])] UserInput $input,
): JsonResponse {
    // ...
}
```

**Nega guruhlar?** "Yaratish" va "yangilash" har doim ham bir xil qoidalarga bo'ysunmaydi: yaratishda parol majburiy, yangilashda esa ixtiyoriy. Guruhlarsiz bu ikkita deyarli bir xil DTO klassiga olib keladi.

Ketma-ket tekshiruv uchun guruhlar ketma-ketligi ham bor: avval arzon tekshiruvlar (`NotBlank`), keyin qimmatlari (`UniqueEntity` — baza so'rovi).

---

## O'z cheklovingiz

Qoida domenga xos bo'lsa, uni alohida cheklov qilish kerak — shunda u qayta ishlatiladi va nomi mazmunli bo'ladi.

```php
namespace App\Validator;

use Symfony\Component\Validator\Constraint;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
final class UzbekPhone extends Constraint
{
    public string $message = 'Telefon raqam +998XXXXXXXXX ko\'rinishida bo\'lishi kerak.';
}
```

```php
namespace App\Validator;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Symfony\Component\Validator\Exception\UnexpectedValueException;

final class UzbekPhoneValidator extends ConstraintValidator
{
    public function validate(mixed $value, Constraint $constraint): void
    {
        if (!$constraint instanceof UzbekPhone) {
            return;
        }

        if (null === $value || '' === $value) {
            return;   // bo'sh qiymat — NotBlank ning ishi
        }

        if (!is_string($value)) {
            throw new UnexpectedValueException($value, 'string');
        }

        if (1 !== preg_match('/^\+998\d{9}$/', $value)) {
            $this->context->buildViolation($constraint->message)
                ->setParameter('{{ value }}', $this->formatValue($value))
                ->addViolation();
        }
    }
}
```

Ikki muhim tafsilot:

1. **Bo'sh qiymatni tekshirmang.** Har bir cheklov bitta ish qiladi; "majburiymi" degan savolga `NotBlank` javob beradi. Aks holda `NotBlank` ni olib tashlash kutilmagan xatti-harakatga olib keladi.
2. **Validator klassi nomi — cheklov nomi + `Validator`.** Shu konvensiya bo'yicha Symfony ularni bog'laydi.

Baza bilan bog'liq cheklovlar ham oddiy servis: `ConstraintValidator` ichiga repository in'ektsiya qilsangiz bo'ladi (autowiring ishlaydi).

---

## Muhandislik nuqtai nazari: validatsiyaning uch darajasi

Ko'p jamoada "validatsiya" bitta narsa deb tushuniladi, aslida u uch darajadan iborat va ularni aralashtirish arxitektura muammosiga olib keladi:

| Daraja | Savol | Qayerda | Xatolik kodi |
| --- | --- | --- | --- |
| **Sintaktik** | Kirish shakli to'g'rimi? (JSON, tiplar) | Serializer / `#[MapRequestPayload]` | 400 |
| **Semantik** | Qiymatlar qoidaga mos keladimi? (email, uzunlik, diapazon) | Validator cheklovlari | 422 |
| **Biznes/invariant** | Amal hozir mumkinmi? (balans yetadimi, holat o'tishi to'g'rimi) | Domen ob'ektining o'zi | 409 / 422 |

Uchinchi darajani validator cheklovlariga tiqish — keng tarqalgan xato. Sabab: biznes invariantlari **doim** bajarilishi kerak, validator esa faqat chaqirilganda ishlaydi. Agar "buyurtma faqat `pending` holatida bekor qilinadi" qoidasi validatorda bo'lsa, konsol buyrug'i yoki Messenger handler uni chetlab o'tadi.

To'g'ri joy — entity metodining o'zi:

```php
public function cancel(): void
{
    if (OrderStatus::Pending !== $this->status) {
        throw new OrderCannotBeCancelled($this->id, $this->status);
    }

    $this->status = OrderStatus::Cancelled;
}
```

Yana bir qoida — **xavfsizlik validatsiyaga tayanmasligi kerak**. Validatsiya foydalanuvchiga yordam berish uchun; xavfsizlik esa avtorizatsiya ([23-bob](23-avtorizatsiya.md)) va parametrlangan so'rovlar bilan ta'minlanadi. "Validatsiya o'tdi, demak xavfsiz" — noto'g'ri xulosa.

Tashqi tizimlar uchun ham: **validatsiya xabarlari — bu API kontrakti**. Ularni tarjima qiling, lekin mijoz kodi xabar matniga emas, **xato kodiga** tayanishi kerak. Shuning uchun kritik cheklovlar uchun `findByCodes()` bilan ishlash mumkin bo'lgan barqaror kodlar mavjud.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Biznes invariantini validatorga solish | Boshqa kirish nuqtalari chetlab o'tadi | Entity metodida majburlang |
| Validatsiyani kontrollerda qo'lda yozish | Takrorlanish, formatlar farq qiladi | `#[MapRequestPayload]` yoki `ValidatorInterface` |
| O'z cheklovingizda bo'sh qiymatni rad etish | `NotBlank` bilan takrorlanadi, mantiq chalkashadi | Bo'sh bo'lsa — qaytib chiqing |
| Xato javobini har endpointda boshqacha formatlash | Mijozda `if` to'dasi | Yagona format (RFC 9457) ([24-bob](24-xatolik-va-log.md)) |
| Validatsiyani xavfsizlik deb bilish | SQL/XSS himoyasi boshqa qatlamda | Parametrlangan so'rov + escaping + avtorizatsiya |
| Entity'ni to'g'ridan-to'g'ri validatsiyalab, uni kirish ob'ekti sifatida ishlatish | Domen HTTP kirishiga bog'lanadi | Alohida input DTO |
| Barcha qoidalarni bitta guruhda saqlash | Create/update stsenariylari ziddiyatga tushadi | `validationGroups` |

---

## Amaliyot

1. `RegisterInput` DTO yozing va `POST /api/register` endpoint'ini `#[MapRequestPayload]` bilan ulang. Noto'g'ri email yuborib, 422 javob tanasini o'rganing.
2. `php bin/console debug:validator src/Dto` ni ishga tushiring va cheklovlar to'g'ri o'qilganini tasdiqlang.
3. `UzbekPhone` cheklovi va validatorini yozing, unga test yozing (`ConstraintValidatorTestCase` yoki oddiy feature test).
4. `create` va `update` guruhlarini qo'shing, ikkala endpointda turli qoidalar ishlayotganini tekshiring.
5. `#[Assert\Callback]` bilan "`from` < `to`" qoidasini yozing va xatoni to'g'ri maydonga (`atPath`) bog'lang.

---

## Bog'liq patternlar

[P-01 Input DTO, P-06 Query DTO](patterns/01-http-qatlam.md) — [pattern katalogi](patterns/README.md).

---

## Rasmiy hujjat

- Validatsiya: <https://symfony.com/doc/current/validation.html>
- Cheklovlar ro'yxati: <https://symfony.com/doc/current/reference/constraints.html>
- O'z cheklovingiz: <https://symfony.com/doc/current/validation/custom_constraint.html>
- Guruhlar: <https://symfony.com/doc/current/validation/groups.html>
- Guruhlar ketma-ketligi: <https://symfony.com/doc/current/validation/sequence_provider.html>

---

[← Oldingi: Event listener](12-event-listener.md) · [Mundarija](README.md) · [Keyingi: Formalar →](14-formalar.md)
