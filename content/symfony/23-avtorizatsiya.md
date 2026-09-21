# 23 — Avtorizatsiya: rollar va Voter'lar

[← Oldingi: Xavfsizlik](22-xavfsizlik.md) · [Mundarija](README.md) · [Keyingi: Xatoliklar va Monolog →](24-xatolik-va-log.md)

---

## Uch daraja

| Daraja | Vosita | Qachon |
| --- | --- | --- |
| URL | `access_control` | Qo'pol chegara: `/admin` faqat `ROLE_ADMIN` |
| Kontroller | `#[IsGranted]`, `denyAccessUnlessGranted()` | Aniq amal uchun ruxsat |
| Ob'ekt | **Voter** | "Bu foydalanuvchi **shu** postni tahrirlay oladimi?" |

Uchinchi daraja — eng muhimi. Rol "kim ekanligini" aytadi, Voter esa "shu ob'ekt bilan nima qila olishini".

---

## Rollar va ierarxiya

```yaml
security:
    role_hierarchy:
        ROLE_EDITOR: ROLE_USER
        ROLE_ADMIN: [ROLE_EDITOR, ROLE_MODERATOR]
        ROLE_SUPER_ADMIN: [ROLE_ADMIN, ROLE_ALLOWED_TO_SWITCH]
```

Rol nomlari **doim** `ROLE_` bilan boshlanadi — Symfony shu prefiks bo'yicha ularni rol deb taniydi.

Maxsus atributlar:

```php
$this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');  // to'liq kirgan (remember-me emas)
$this->denyAccessUnlessGranted('IS_AUTHENTICATED');        // har qanday kirgan
$this->denyAccessUnlessGranted('IS_IMPERSONATOR');         // boshqa foydalanuvchi nomidan
```

---

## Voter

```php
namespace App\Security\Voter;

use App\Entity\Post;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\AccessDecisionManagerInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

final class PostVoter extends Voter
{
    public const VIEW = 'POST_VIEW';
    public const EDIT = 'POST_EDIT';
    public const DELETE = 'POST_DELETE';

    public function __construct(
        private AccessDecisionManagerInterface $accessDecisionManager,
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT, self::DELETE], true)
            && $subject instanceof Post;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        \assert($subject instanceof Post);

        // Super admin hamma narsani qila oladi
        if ($this->accessDecisionManager->decide($token, ['ROLE_SUPER_ADMIN'])) {
            return true;
        }

        $user = $token->getUser();

        if (!$user instanceof User) {
            $vote?->addReason('Foydalanuvchi tizimga kirmagan.');

            return false;
        }

        return match ($attribute) {
            self::VIEW => $this->canView($subject, $user),
            self::EDIT, self::DELETE => $this->isAuthor($subject, $user, $vote),
            default => false,
        };
    }

    private function canView(Post $post, User $user): bool
    {
        return $post->isPublished() || $this->isAuthor($post, $user, null);
    }

    private function isAuthor(Post $post, User $user, ?Vote $vote): bool
    {
        if ($post->getAuthor() === $user) {
            return true;
        }

        $vote?->addReason('Foydalanuvchi bu postning muallifi emas.');

        return false;
    }

    // Unumdorlik: Symfony ortiqcha chaqiruvlarni keshlaydi
    public function supportsAttribute(string $attribute): bool
    {
        return in_array($attribute, [self::VIEW, self::EDIT, self::DELETE], true);
    }

    public function supportsType(string $subjectType): bool
    {
        return is_a($subjectType, Post::class, true);
    }
}
```

Ishlatish:

```php
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/posts/{id}', methods: ['PUT'])]
#[IsGranted(PostVoter::EDIT, subject: 'post')]
public function update(Post $post, #[MapRequestPayload] UpdatePostInput $input): JsonResponse
{
    // Bu yerga faqat ruxsat bor foydalanuvchi yetib keladi
}
```

Servisda:

```php
use Symfony\Bundle\SecurityBundle\Security;

final class PostArchiver
{
    public function __construct(private Security $security)
    {
    }

    public function archive(Post $post): void
    {
        if (!$this->security->isGranted(PostVoter::EDIT, $post)) {
            throw new AccessDeniedException();
        }

        // ...
    }
}
```

**Voter ichida `Security::isGranted()` ni chaqirmang** — u boshqa token konteksti bilan ishlashi mumkin. Rol tekshirish uchun `AccessDecisionManagerInterface::decide()` ishlating (yuqoridagi misolda shunday).

---

## Qaror strategiyalari

```yaml
security:
    access_decision_manager:
        strategy: affirmative     # standart
```

| Strategiya | Qoidasi |
| --- | --- |
| `affirmative` | Bitta voter "ha" desa — ruxsat |
| `consensus` | Ko'pchilik qaroriga ko'ra |
| `unanimous` | Bironta voter "yo'q" desa — rad |
| `priority` | Birinchi betaraf bo'lmagan voter hal qiladi |

Standart `affirmative` aksariyat ilovaga to'g'ri keladi. `unanimous` — yuqori talabli tizimlarda ("bironta ham qoida qarshi bo'lmasin"), lekin har yangi voter kutilmagan rad javoblarini keltirib chiqarishi mumkin.

---

## Muhandislik nuqtai nazari: ruxsat modelini loyihalash

**1. Rolga emas, amalga tekshiring.** Kodda `if ($user->hasRole('ROLE_ADMIN'))` yozish — kelajakdagi og'riq: yangi rol qo'shilganda barcha shartlarni qidirish kerak bo'ladi. To'g'ri yozuv: `isGranted('POST_DELETE', $post)`. Rol → amal bog'lanishi Voter'da bir joyda turadi.

**2. Atribut nomlari aniq va noyob bo'lsin.** `'edit'` emas, `'POST_EDIT'`. Katta ilovada `'edit'` bir nechta voter tomonidan qabul qilinib, chalkashlik yaratadi.

**3. Voter'lar tez bo'lsin.** Voter har `isGranted()` chaqiruvida ishlaydi — ro'yxat sahifasida 50 marta. Voter ichida baza so'rovi yozish — yashirin N+1. Kerak bo'lsa, ma'lumotni oldindan yuklang (`JOIN FETCH`) yoki so'rov natijasini so'rov davomida keshlang.

**4. Ro'yxatlarni filtrlash — avtorizatsiya emas, so'rov masalasi.** "Foydalanuvchi faqat o'z postlarini ko'radi" qoidasini 1000 ta postni yuklab, keyin voter bilan filtrlash orqali bajarmang. To'g'ri yechim — `WHERE author_id = :user` so'rovda. Voter esa bitta ob'ektga murojaatda ishlatiladi.

**5. Ruxsat qoidalarini testlang.** Har voter uchun: "muallif — ruxsat", "boshqa foydalanuvchi — rad", "admin — ruxsat", "anonim — rad". Bu testlar xavfsizlik regressiyalarining oldini oladi — va ular eng arzon testlar qatoriga kiradi.

**6. Ruxsatni ikki joyda tekshiring, agar ikkita kirish nuqtasi bo'lsa.** HTTP endpoint'da `#[IsGranted]`, biznes servisda esa invariant tekshiruvi. Konsol buyrug'i yoki Messenger handler kontrollerdan o'tmaydi.

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Kodda rolni to'g'ridan-to'g'ri tekshirish | Rol modeli o'zgarsa hamma joy o'zgaradi | Voter + amal atributi |
| Voter ichida `Security::isGranted()` | Noto'g'ri token konteksti | `AccessDecisionManager::decide()` |
| Voter ichida baza so'rovi | Ro'yxatda N+1 | Oldindan yuklash yoki kesh |
| Ro'yxatni voter bilan filtrlash | Sekin, xotira, noto'g'ri paginatsiya | So'rovda `WHERE` |
| Faqat `access_control` ga tayanish | Ob'ekt darajasidagi ruxsat yo'q | Voter |
| 403 o'rniga 404 qaytarishni har doim qilish | Ba'zan chalkashlik | Ma'lumot sizishi xavfi bo'lsa 404, aks holda 403 |
| Voter'ni testsiz qoldirish | Xavfsizlik regressiyasi sezilmaydi | Har qoidaga test |

---

## Amaliyot

1. `PostVoter` ni yozing (`VIEW`, `EDIT`, `DELETE`) va `#[IsGranted]` bilan kontrollerga ulang.
2. Boshqa foydalanuvchi tokeni bilan tahrirlashga urinib, 403 olganingizni tasdiqlang.
3. `ROLE_SUPER_ADMIN` uchun `AccessDecisionManager` tekshiruvini qo'shing va uni test bilan tasdiqlang.
4. `supportsAttribute()` / `supportsType()` ni qo'shing va Profiler'ning "Security" panelida voter chaqiruvlarini kuzating.
5. Voter uchun to'rt holatli unit/funksional test yozing: muallif, begona, admin, anonim.

---

## Rasmiy hujjat

- Voter'lar: <https://symfony.com/doc/current/security/voters.html>
- Avtorizatsiya: <https://symfony.com/doc/current/security.html#access-control-authorization>
- `#[IsGranted]`: <https://symfony.com/doc/current/security.html#securing-controllers-and-other-code>
- Rol ierarxiyasi: <https://symfony.com/doc/current/security.html#hierarchical-roles>

---

[← Oldingi: Xavfsizlik](22-xavfsizlik.md) · [Mundarija](README.md) · [Keyingi: Xatoliklar va Monolog →](24-xatolik-va-log.md)
