# 60 — Autentifikatsiya oqimlari

[← Oldingi: Xato modeli: serverdan UI gacha](59-xato-modeli-ui.md) · [Mundarija](README.md) · [Keyingi: Access va refresh tokenlar →](61-tokenlar.md)

## Tushuncha

Autentifikatsiya — "**kim**san?" savoliga javob. Avtorizatsiya (62-bob) — "**nima** qila olasan?". Frontend va backend kesishmasida eng ko'p xato aynan shu yerda qilinadi.

Asosiy modellar:

| Model | Qanday | Qachon |
| --- | --- | --- |
| **Sessiya cookie** | Server sessiya yaratadi, brauzer `HttpOnly` cookie'ni avtomatik yuboradi | Frontend va API bitta domen (yoki subdomen), web |
| **Token (Bearer)** | Klient tokenni sarlavhada yuboradi | Mobil, ko'p klient, boshqa domendagi API |
| **OAuth 2.1 / OIDC** | Tashqi identity provider (Google, Keycloak, Auth0) login qiladi | SSO, "Google bilan kirish", korporativ tizimlar |
| **Passkeys (WebAuthn)** | Parolsiz, qurilmadagi kalit bilan | Zamonaviy, fishingga chidamli |

## Nega shunday

Eng keng tarqalgan arxitektura xatosi — **SPA uchun kerak bo'lmagan murakkablik**: frontend va API bitta domenda, lekin JWT'lar `localStorage`'da, qo'lda refresh, qo'lda logout. Ko'p hollarda oddiy sessiya cookie xavfsizroq va soddaroq.

```text
Savol: frontend va API bitta "sayt"dami (bitta registrable domen: shop.uz, api.shop.uz)?
  Ha  → sessiya cookie (SameSite=Lax/Strict, HttpOnly, Secure) + CSRF himoyasi — eng oddiy va xavfsiz
  Yo'q, yoki mobil/ko'p klient → token modeli (61-bob)
  Tashqi login (SSO, Google) kerak → OIDC (Authorization Code + PKCE)
```

## Psevdokod: sessiya cookie bilan SPA

```text
1. GET /sanctum/csrf-cookie (yoki /api/csrf)  → XSRF-TOKEN cookie
2. POST /login { email, password } + X-XSRF-TOKEN sarlavhasi
   → Set-Cookie: session=...; HttpOnly; Secure; SameSite=Lax
3. Keyingi so'rovlar: brauzer cookie'ni o'zi yuboradi (withCredentials), JS tokenni ko'rmaydi
4. POST /logout → sessiya serverda o'chiriladi (darhol kuchga kiradi)
```

Afzallik: XSS bo'lsa ham sessiya identifikatorini o'g'irlab bo'lmaydi (HttpOnly), logout darhol ishlaydi, refresh mantiqi yo'q.

## Psevdokod: OIDC — Authorization Code + PKCE

```text
1. Klient: code_verifier (tasodifiy) → code_challenge = SHA256(verifier)
2. Redirect → IdP /authorize?response_type=code&client_id&redirect_uri&code_challenge&state&scope=openid profile
3. Foydalanuvchi IdP'da kiradi (parol/passkey/MFA — bizning ilova parolni ko'rmaydi)
4. IdP → redirect_uri?code=...&state=...      (state — CSRF himoyasi, tekshiriladi)
5. Kod → token almashinuvi: POST /token { code, code_verifier }
   → id_token (kim), access_token (API uchun), refresh_token
6. Kim almashadi? — tavsiya: BACKEND (BFF) — tokenlar brauzerga tushmaydi, brauzer faqat sessiya cookie oladi
```

OAuth 2.1 (va OAuth 2.0 xavfsizlik tavsiyalari, RFC 9700) **Implicit flow'ni** taqiqlaydi — brauzerda access token URL'da qaytadigan eski usul. SPA uchun: Code + PKCE, eng yaxshisi — BFF orqali.

## Psevdokod: BFF auth naqshi

```text
Brauzer ──cookie (HttpOnly)──▶ BFF (Next.js server / Symfony / Laravel) ──Bearer token──▶ API'lar
                                 │ tokenlar shu yerda saqlanadi va yangilanadi
                                 └──OIDC──▶ IdP
```

Brauzerda token yo'q → XSS bilan token o'g'irlanmaydi; refresh — serverda; ko'p API'lar uchun bitta login. Narx — yana bir server qatlami (69-bob).

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Sessiya + SPA | Laravel Sanctum (SPA rejimi), Symfony Security (json_login) — [Laravel 21](../laravel/21-autentifikatsiya.md), [Symfony 22-bob](../symfony/22-xavfsizlik.md) | `withCredentials`, XSRF sarlavhasi — [Angular 58-bob](../angular/58-auth-token-refresh.md) |
| Token API | Sanctum token / JWT bundle | Interceptor + refresh — [Angular 58](../angular/58-auth-token-refresh.md), [React 39-bob](../react/39-auth-klient.md) |
| OIDC / SSO | Symfony `oauth2-client`, Laravel Socialite, Keycloak | Auth.js — [Next.js 31-bob](../nextjs/31-authjs.md) |
| Tushunchalar | — | [Next.js 25-bob](../nextjs/25-auth-kalit-tushunchalar.md), tashqi backend bilan login — [27-bob](../nextjs/27-tashqi-backend-login.md) |

## Trade-off

| Model | Yutuq | Narx |
| --- | --- | --- |
| Sessiya cookie | Oddiy, HttpOnly, darhol logout | CSRF himoyasi kerak; domenlararo va mobil uchun noqulay |
| Brauzerda token | Ko'p domen, stateless API | XSS'da o'g'irlanadi, refresh murakkabligi, logout kechikadi |
| OIDC + BFF | Eng xavfsiz, SSO | Infratuzilma va murakkablik |
| O'z parol tizimi | To'liq nazorat | Parol saqlash, MFA, tiklash — hammasi sizda |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Bitta domenda JWT + localStorage | Keraksiz xavf va murakkablik | Sessiya cookie |
| Implicit flow | Eskirgan, xavfli | Code + PKCE |
| `state` tekshirilmaydi | Login CSRF | Har so'rovda tekshirish |
| Parolni frontend'da saqlash/loglash | Sizib chiqish | Hech qachon |
| Logout faqat klientda | Sessiya/token serverda tirik | Server tomonda bekor qilish |
| "Kirdimmi?" faqat frontend holati bilan | Server baribir tekshirishi kerak | Har so'rovda server tekshiruvi |

## Amaliyot

1. Frontend va API'ingiz bitta saytdami? Agar ha — sessiya cookie modeliga o'tish rejasini baholang.
2. Login oqimingizni chizing: token qayerda yaratiladi, qayerda saqlanadi, kim yangilaydi?
3. OIDC ishlatilsa: PKCE va `state` tekshirilishini tasdiqlang.
4. Logout'dan keyin eski token/sessiya bilan so'rov yuborib ko'ring — rad etiladimi?

## Manbalar

- OAuth 2.1 (draft) <https://oauth.net/2.1/>; RFC 9700 — *OAuth 2.0 Security Best Current Practice*
- IETF — *OAuth 2.0 for Browser-Based Applications* (BFF naqshi)
- OWASP — *Authentication Cheat Sheet*
