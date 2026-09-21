# 22 — Xavfsizlik: autentifikatsiya

[← Oldingi: REST API](21-rest-api.md) · [Mundarija](README.md) · [Keyingi: Avtorizatsiya →](23-avtorizatsiya.md)

---

## Ikki savol, ikki mexanizm

- **Autentifikatsiya** — "sen kimsan?" (bu bob)
- **Avtorizatsiya** — "buni qilishga huquqing bormi?" ([23-bob](23-avtorizatsiya.md))

Ularni chalkashtirish — noto'g'ri status kodlari (401 ↔ 403) va noto'g'ri arxitekturaga olib keladi.

---

## `security.yaml` tuzilmasi

```yaml
security:
    password_hashers:
        Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface: 'auto'

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false

        api_login:
            pattern: ^/api/login
            stateless: true
            json_login:
                check_path: api_login
                username_path: email
                password_path: password
            login_throttling:
                max_attempts: 5
                interval: '15 minutes'

        api:
            pattern: ^/api
            stateless: true
            provider: app_user_provider
            access_token:
                token_handler: App\Security\AccessTokenHandler

    access_control:
        - { path: ^/api/login, roles: PUBLIC_ACCESS }
        - { path: ^/api/admin, roles: ROLE_ADMIN }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }
```

To'rt qism:

| Bo'lim | Vazifasi |
| --- | --- |
| `password_hashers` | Parol qanday hash qilinadi |
| `providers` | Foydalanuvchi qayerdan yuklanadi |
| `firewalls` | Qaysi URL qanday autentifikatsiya qilinadi |
| `access_control` | URL darajasidagi qo'pol ruxsat qoidalari |

**Firewall tartibi muhim:** so'rov **birinchi mos kelgan** firewall'ga tushadi va faqat unga. Shuning uchun `api_login` `api` dan **oldin** turishi kerak, aks holda login endpoint'iga token talab qilinadi.

`stateless: true` — API uchun majburiy: sessiya ochilmaydi, har so'rov o'zini o'zi isbotlaydi.

---

## User entity

```shell
php bin/console make:user
```

```php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity]
#[ORM\Table(name: 'users')]
#[ORM\UniqueConstraint(name: 'uniq_users_email', columns: ['email'])]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private string $email;

    /** @var list<string> */
    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column]
    private string $password;

    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    /** @return list<string> */
    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $hashedPassword): void
    {
        $this->password = $hashedPassword;
    }

    public function eraseCredentials(): void
    {
        // agar ob'ektda ochiq parol vaqtincha saqlangan bo'lsa, shu yerda tozalanadi
    }
}
```

Parolni hash qilish:

```php
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserRegistrar
{
    public function __construct(
        private UserPasswordHasherInterface $hasher,
        private EntityManagerInterface $em,
    ) {
    }

    public function register(string $email, #[\SensitiveParameter] string $plainPassword): User
    {
        $user = new User($email);
        $user->setPassword($this->hasher->hashPassword($user, $plainPassword));

        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }
}
```

`'auto'` hasher — hozirgi eng yaxshi algoritmni (bugun odatda bcrypt/argon2id) tanlaydi va kelajakda yangilanadi. **Hech qachon** `md5`, `sha1` yoki "o'zimizning" hashni ishlatmang. `#[\SensitiveParameter]` esa parolning stack trace'ga tushishini oldini oladi.

---

## Token bilan autentifikatsiya

`access_token` autentifikatori tokenni so'rovdan ajratib oladi (`Authorization: Bearer ...`) va uni sizning handler'ingizga beradi:

```php
namespace App\Security;

use App\Repository\ApiTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

final class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(private ApiTokenRepository $tokens)
    {
    }

    public function getUserBadgeFrom(#[\SensitiveParameter] string $accessToken): UserBadge
    {
        $token = $this->tokens->findOneByHash(hash('sha256', $accessToken));

        if (null === $token || !$token->isValid()) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        return new UserBadge($token->getUserIdentifier());
    }
}
```

Uchta muhim tafsilot:

1. **Tokenni bazada xesh ko'rinishida saqlang.** Baza sizib chiqsa, xom tokenlar bilan hech kim kira olmaydi — xuddi parollar kabi.
2. **Muddatni tekshiring** (`isValid()`), va bekor qilish (revocation) imkonini qo'ying.
3. **Xato xabari umumiy bo'lsin.** "Foydalanuvchi topilmadi" va "parol noto'g'ri" ni ajratish — foydalanuvchi nomlarini aniqlash imkonini beradi (user enumeration).

### JWT

Stateless JWT uchun ekotizim standarti — `lexik/jwt-authentication-bundle`:

```shell
composer require lexik/jwt-authentication-bundle
php bin/console lexik:jwt:generate-keypair
```

```yaml
security:
    firewalls:
        api:
            pattern: ^/api
            stateless: true
            jwt: ~
```

JWT bilan ishlashda bilish shart bo'lgan narsalar:

- **JWT bekor qilinmaydi.** Muddati tugaguncha amal qiladi. Shuning uchun qisqa `exp` (5–15 daqiqa) + refresh token ishlatiladi.
- **JWT — shifrlangan emas, imzolangan.** Ichidagi ma'lumotni har kim o'qiy oladi (base64). Maxfiy narsa solmang.
- **`alg: none` va algoritm chalkashligi** — klassik hujum vektorlari. Kutubxona tekshiradi, lekin konfiguratsiyani o'zgartirganda ehtiyot bo'ling.
- **Tokenni qayerda saqlash.** Brauzerda `localStorage` — XSS'da o'g'irlanadi; `HttpOnly` + `Secure` + `SameSite` cookie xavfsizroq, lekin CSRF himoyasini talab qiladi.

Agar sizga bekor qilish va sessiyalarni ko'rish kerak bo'lsa (ko'p mahsulotda kerak), **opaque token + baza** (yuqoridagi `AccessTokenHandler`) ko'pincha JWT'dan amaliyroq.

---

## Muhandislik nuqtai nazari: autentifikatsiya dizayni

**1. Bitta firewall, bitta mexanizm.** Rasmiy tavsiya — imkon qadar bitta firewall. Har qo'shimcha firewall — tartib xatolari va "nega bu yerda ishlamayapti?" savollari manbayi.

**2. Sessiya va token — turli xavf modellari.**

| | Sessiya (cookie) | Token (Bearer) |
| --- | --- | --- |
| Bekor qilish | Oson (server saqlaydi) | JWT'da qiyin, opaque'da oson |
| CSRF | Xavf bor — himoya kerak | Yo'q (brauzer avtomatik yubormaydi) |
| XSS | `HttpOnly` himoya qiladi | `localStorage` da o'g'irlanadi |
| Masshtablash | Umumiy saqlash kerak | Stateless (JWT) |

**3. Login oqimini himoyalang.** `login_throttling` — majburiy minimal: brute force hujumini sekinlashtiradi. Qo'shimcha: kuchli parol talabi (`NotCompromisedPassword` cheklovi — parol ommaviy sizishlar bazasida borligini tekshiradi), ikki faktorli autentifikatsiya, shubhali kirish haqida xabar.

**4. Vaqt bo'yicha barqaror solishtirish.** Token yoki imzo solishtirishda `hash_equals()` ishlating, `===` emas — aks holda javob vaqti farqi orqali sir qismlarini topish mumkin (timing attack).

**5. Log yozing, lekin sirlarsiz.** Muvaffaqiyatsiz kirishlar loglanishi kerak (monitoring uchun), lekin parol, token yoki to'liq `Authorization` sarlavhasi hech qachon logga tushmasligi kerak ([24-bob](24-xatolik-va-log.md)).

---

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Tokenni bazada ochiq saqlash | Baza sizsa — barcha hisoblar ochiq | `hash('sha256', $token)` saqlang |
| "Foydalanuvchi topilmadi" / "parol xato" ni ajratish | User enumeration | Yagona umumiy xabar |
| Login'ga throttling qo'ymaslik | Brute force | `login_throttling` |
| Firewall tartibini noto'g'ri qo'yish | Login endpoint himoyalanib qoladi | Aniqrog'i yuqorida |
| API firewall'ida `stateless: true` yo'qligi | Sessiya ochiladi, kesh buziladi | `stateless: true` |
| JWT'ni uzoq muddat bilan chiqarish | O'g'irlangan token uzoq ishlaydi | Qisqa `exp` + refresh |
| Parolni o'z algoritmingiz bilan hash qilish | Deyarli har doim zaif | `password_hashers: 'auto'` |
| Parolni log/exception'ga tushirish | Sir sizadi | `#[\SensitiveParameter]` |

---

## Amaliyot

1. `make:user` bilan `User` entity yarating va `security.yaml` ni yuqoridagidek sozlang.
2. `json_login` orqali `/api/login` endpoint'ini ishlating va `curl` bilan token oling.
3. `ApiToken` entity + `AccessTokenHandler` yozing; tokenni **xesh** ko'rinishida saqlang.
4. `login_throttling` ni yoqing va 6 marta noto'g'ri parol yuborib, javobni ko'ring.
5. Himoyalangan endpointga tokensiz murojaat qilib 401, keyin noto'g'ri rol bilan 403 olishga harakat qiling — farqni tushuning.

---

## Rasmiy hujjat

- Xavfsizlik: <https://symfony.com/doc/current/security.html>
- Access token autentifikatsiyasi: <https://symfony.com/doc/current/security/access_token.html>
- O'z autentifikatoringiz: <https://symfony.com/doc/current/security/custom_authenticator.html>
- Parol hashlash: <https://symfony.com/doc/current/security/passwords.html>
- LexikJWTAuthenticationBundle: <https://github.com/lexik/LexikJWTAuthenticationBundle>

---

[← Oldingi: REST API](21-rest-api.md) · [Mundarija](README.md) · [Keyingi: Avtorizatsiya →](23-avtorizatsiya.md)
