# 25 — Auth: kalit tushunchalar

[← Oldingi: Klient holati Next ichida](24-klient-holati.md) · [Mundarija](README.md) · [Keyingi: Token qayerda saqlanadi →](26-token-saqlash.md)

## Tushuncha

Bu qism (25–31-boblar) bitta amaliy savolga javob beradi: **tashqi backend (Laravel, Symfony, Go, Node) bilan ishlaganda Next'da autentifikatsiyani qanday qurish kerak.**

Avval atamalarni aniq ajratamiz — chalkashlikning yarmi shu yerdan chiqadi.

| Atama | Savol | Misol |
| --- | --- | --- |
| **Autentifikatsiya** (authn) | Sen kimsan? | Login/parol, OAuth, SMS kod |
| **Avtorizatsiya** (authz) | Senga nima mumkin? | Rol, ruxsat, egalik |
| **Sessiya** | Kim kirganini qanday eslab qolamiz? | Cookie, token |
| **Identifikatsiya** | Kim ekanini da'vo qilish | Email kiritish |

Ko'p hujjatlarda "auth" so'zi ikkalasini ham anglatadi — lekin ular **boshqa-boshqa masalalar**: birinchisi bir marta (kirishda), ikkinchisi **har so'rovda** tekshiriladi.

## Tushuncha: sessiya va token — ikki model

| | Sessiya (stateful) | Token (stateless) |
| --- | --- | --- |
| Holat qayerda | Serverda (Redis, baza) | Tokenning o'zida |
| Klient nima saqlaydi | Sessiya ID (cookie) | Token matni |
| Server nima saqlaydi | Sessiya ma'lumoti | Hech narsa (yoki qora ro'yxat) |
| Bekor qilish | Oson (serverda o'chiriladi) | Qiyin (muddat tugashini kutish) |
| Masshtablash | Umumiy do'kon kerak | Osonroq |
| Mobil/tashqi klient | Noqulayroq | Qulay |
| Ma'lumot o'lchami | Kichik (ID) | Kattaroq (payload) |

**Qaysi biri yaxshi?** — noto'g'ri savol. To'g'ri savol: **backend qaysi modelni beradi?**

Agar Laravel Sanctum yoki Symfony sessiyasi ishlatilsa — sessiya modeli. Agar JWT chiqarilsa — token modeli. Next tomonda ikkalasi ham ishlaydi, lekin naqshlar farq qiladi (27-bob).

## Tushuncha: access va refresh tokenlar

Token modelida odatda **ikkita** token bo'ladi:

| | Access token | Refresh token |
| --- | --- | --- |
| Vazifasi | Har so'rovda kimligingizni tasdiqlaydi | Yangi access token olish |
| Muddati | Qisqa: 5–15 daqiqa | Uzoq: kunlar–haftalar |
| Qayerda yuboriladi | Har API so'rovida | Faqat `/refresh` endpointiga |
| O'g'irlansa | Zarar cheklangan (tez eskiradi) | Jiddiy — hisobga to'liq kirish |
| Serverda saqlanadimi | Yo'q | Ko'pincha ha (bekor qilish uchun) |

**Nega ikkitasi?** Kompromis:

- Faqat uzoq muddatli token bo'lsa — o'g'irlansa uzoq vaqt ishlatiladi;
- Faqat qisqa muddatli bo'lsa — foydalanuvchi har 10 daqiqada qayta kirishi kerak;
- Ikkitasi bilan: access tez eskiradi, refresh esa kamdan-kam uzatiladi va serverda bekor qilinadi.

## Tushuncha: JWT ichida nima bor

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJzdWIiOiIxMjMiLCJleHAiOjE3MzU2ODk2MDB9 . dBjftJeZ4CVP...
└──────────── header ───────────────┘ └──────────── payload ─────────────────┘ └─ signature ─┘
```

```js
// Payload'ni o'qish — imzo TEKSHIRILMAYDI
function decodeJwtPayload(token) {
  const [, payload] = token.split('.')
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')

  return JSON.parse(atob(normalized))
}

decodeJwtPayload(accessToken)
// { sub: '123', exp: 1735689600, iat: 1735689000, role: 'admin', jti: 'abc' }
```

Standart maydonlar (RFC 7519):

| Maydon | Ma'nosi |
| --- | --- |
| `sub` | Subject — foydalanuvchi ID |
| `exp` | Expiration — muddat (Unix **soniyalarda**) |
| `iat` | Issued at — chiqarilgan vaqt |
| `nbf` | Not before — shu vaqtdan oldin yaroqsiz |
| `jti` | JWT ID — noyob identifikator (bekor qilish uchun) |
| `aud` | Audience — kim uchun |
| `iss` | Issuer — kim chiqargan |

**Uchta muhim haqiqat:**

1. **JWT shifrlanmagan** — Base64 kodlangan, xolos. Uni har kim o'qiy oladi. Maxfiy ma'lumot (telefon, manzil, ichki ID) solmang;
2. **Imzoni faqat kalitga ega tomon tekshira oladi** — klientdagi `role: 'admin'` ni o'zgartirish mumkin, lekin server buni qabul qilmaydi;
3. **`exp` ni klient faqat "yangilash vaqti keldimi?"** uchun o'qiydi — bu xavfsizlik tekshiruvi emas.

## Tushuncha: token oqimi (umumiy manzara)

```
┌─────────┐                          ┌──────────┐                    ┌─────────────┐
│ Brauzer │                          │   Next   │                    │   Backend   │
└────┬────┘                          └────┬─────┘                    └──────┬──────┘
     │                                    │                                 │
     │ 1. POST /login (email, parol)      │                                 │
     ├───────────────────────────────────▶│                                 │
     │                                    │ 2. POST /api/auth/login         │
     │                                    ├────────────────────────────────▶│
     │                                    │                                 │
     │                                    │ 3. { access, refresh }          │
     │                                    │◀────────────────────────────────┤
     │ 4. Set-Cookie: session (httpOnly)  │                                 │
     │◀───────────────────────────────────┤                                 │
     │                                    │                                 │
     │ 5. GET /dashboard                  │                                 │
     ├───────────────────────────────────▶│                                 │
     │                                    │ 6. GET /api/me                  │
     │                                    │    Authorization: Bearer ...    │
     │                                    ├────────────────────────────────▶│
     │                                    │◀────────────────────────────────┤
     │ 7. HTML (server render)            │                                 │
     │◀───────────────────────────────────┤                                 │
```

**Asosiy g'oya:** Next — **oraliq qatlam** (BFF). Tokenlar brauzerdagi JavaScript'ga umuman tegmasligi mumkin: ular httpOnly cookie'da yashaydi va serverda ishlatiladi.

Bu SPA'dagi modeldan tubdan farq qiladi (React qo'llanmasi, 39-bob), u yerda token brauzer xotirasida bo'lardi.

## Tushuncha: Next'da uch joy

Auth bilan bog'liq kod uchta joyda bo'ladi va ularning imkoniyatlari **farq qiladi**:

| Joy | Cookie o'qish | Cookie yozish | Qachon ishlaydi |
| --- | --- | --- | --- |
| **Middleware** | ✅ | ✅ | Har so'rovdan oldin |
| **Server komponent** | ✅ | ❌ | Render paytida |
| **Server Action / Route Handler** | ✅ | ✅ | Mutatsiya paytida |

```ts
// Server komponent — faqat o'qish
const cookieStore = await cookies()
const token = cookieStore.get('session')?.value

cookieStore.set('x', 'y')        // ✗ Xato: server komponentda yozib bo'lmaydi
```

Shuning uchun **login/logout har doim Server Action yoki Route Handler'da** bo'ladi (27-bob).

## Tushuncha: qaysi tekshiruv qayerda

| Tekshiruv | Joy | Nega |
| --- | --- | --- |
| Cookie bormi? | Middleware | Tez, arzon, birinchi to'siq |
| Token haqiqiymi? | Server komponent / action | Imzo tekshiruvi kerak |
| Foydalanuvchi kim? | Server komponent (`getCurrentUser`) | Ma'lumot bilan |
| Bu resursga ruxsat bormi? | Action / Route Handler | Egalik tekshiruvi |
| UI da nimani ko'rsatish | Server komponent | Ko'rinish |

**Eng muhim qoida:** middleware — **himoya emas**, u faqat foydalanuvchini to'g'ri joyga yo'naltiradi. Haqiqiy tekshiruv ma'lumotga yaqin joyda bo'ladi (30-bob).

## Tushuncha: keng tarqalgan xato — "token qayerda?"

Savol noto'g'ri qo'yilgan. To'g'ri savollar:

| Savol | Javob (26–29-boblar) |
| --- | --- |
| Brauzer nimani saqlaydi? | httpOnly cookie (sessiya yoki tokenlar) |
| Next server tokenni qayerdan oladi? | `cookies()` dan |
| Backend'ga qanday yuboriladi? | `Authorization: Bearer` sarlavhasi |
| Klient JS tokenni ko'radimi? | **Yo'q** (to'g'ri qurilgan bo'lsa) |
| Muddati tugasa nima bo'ladi? | Refresh oqimi (28-bob) |

## Tushuncha: OAuth 2 va OIDC (qisqacha)

Uchinchi tomon orqali kirish (Google, GitHub) uchun:

| Atama | Ma'nosi |
| --- | --- |
| **OAuth 2.1** | Avtorizatsiya protokoli: "bu ilova mening nomimdan X qila oladi" |
| **OIDC** | OAuth ustidagi qatlam: "bu foydalanuvchi kim" (`id_token`) |
| **Authorization Code + PKCE** | Zamonaviy brauzer oqimi (yagona tavsiya etiladigan) |
| **Implicit flow** | Eskirgan, ishlatilmaydi |

Oqim (soddalashtirilgan):

```
1. Foydalanuvchi "Google bilan kirish" bosadi
2. Google'ga yo'naltiriladi (client_id, redirect_uri, state, code_challenge bilan)
3. Foydalanuvchi ruxsat beradi
4. Google sizning /callback ga `code` bilan qaytaradi
5. Server `code` ni token'ga almashtiradi (code_verifier bilan)
6. Server o'z sessiyasini yaratadi va cookie o'rnatadi
```

Buni qo'lda yozish shart emas — Auth.js yoki backend'ingiz buni qiladi (31-bob).

## Muhandislik nuqtai nazari: model tanlash

| Vaziyat | Model |
| --- | --- |
| Faqat web ilova, o'z backend'ingiz | Sessiya (soddaroq va xavfsizroq) |
| Web + mobil, umumiy API | Token (JWT) |
| Mavjud backend JWT beradi | Token — tanlov yo'q |
| Uchinchi tomon kirish (Google) | OIDC + o'z sessiyangiz |
| Mikroservislar | Token (servislar orasida uzatish oson) |

**Muhim nuans:** backend JWT bersa ham, Next tomonda uni **cookie ichiga solib**, brauzer JS'iga bermaslik mumkin va shu tavsiya etiladi (26-bob).

## Muhandislik nuqtai nazari: tahdid modeli

Nimadan himoyalanyapmiz:

| Tahdid | Ma'nosi | Himoya |
| --- | --- | --- |
| **XSS** | Zararli skript sahifada ishlaydi | httpOnly cookie, CSP, sanitizatsiya (45-bob) |
| **CSRF** | Boshqa sayt sizning nomingizdan so'rov yuboradi | `SameSite=Lax`, CSRF token |
| **Token o'g'irlash** | Tarmoqdan yoki xotiradan | HTTPS, qisqa muddat, rotation |
| **Sessiya ushlab olish** | Sessiya ID ni qo'lga kiritish | HTTPS, `Secure`, regeneratsiya |
| **Brute force** | Parolni taxmin qilish | Rate limiting, 2FA |
| **Privilege escalation** | Ruxsatdan oshib ketish | Har so'rovda avtorizatsiya (30-bob) |

Bu ro'yxatni yodda tuting: keyingi boblardagi har bir qaror shulardan biriga javob beradi.

## Muhandislik nuqtai nazari: nima o'zingiz yozmaslik kerak

| Narsa | O'zingiz yozasizmi |
| --- | --- |
| Parol hashlash | ❌ `bcrypt`/`argon2` |
| JWT imzolash/tekshirish | ❌ `jose` |
| OAuth oqimi | ❌ Auth.js yoki backend |
| Sessiya cookie boshqaruvi | ⚖️ Oddiy holatda mumkin |
| Token refresh mantiqi | ⚖️ Ha (28-bob) — u loyihaga xos |
| Rate limiting | ❌ Kutubxona yoki reverse proxy |
| 2FA/TOTP | ❌ Kutubxona |

Kriptografiya va protokollarni o'zingiz yozmang. Lekin **oqimni tushunish** shart — aks holda kutubxonani noto'g'ri sozlaysiz.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| JWT'ni "shifrlangan" deb o'ylash | U ochiq o'qiladi | Maxfiy ma'lumot solmang |
| Klientda `role` ni tekshirib, himoya deb hisoblash | O'zgartirish mumkin | Serverda tekshiring (30-bob) |
| Access token muddatini uzun qilish (kunlar) | O'g'irlansa uzoq ishlatiladi | 5–15 daqiqa + refresh |
| Refresh tokenni access bilan bir joyda saqlash | Ikkalasi birga o'g'irlanadi | Alohida, httpOnly |
| Autentifikatsiya va avtorizatsiyani chalkashtirish | Ruxsat tekshiruvi unutiladi | Ikkalasini alohida o'ylang |
| Middleware'ni yagona himoya deb bilish | Chetlab o'tilishi mumkin | Ma'lumotga yaqin tekshiruv |
| `localStorage` da token (Next'da) | XSS'da o'g'irlanadi | httpOnly cookie (26-bob) |

## Amaliyot

1. Backend'ingiz qaysi modelni ishlatishini aniqlang: sessiya yoki token? Access token muddati qancha?
2. JWT'ni <https://jwt.io> da oching (test tokeni bilan) va payload maydonlarini ko'ring.
3. Payload ichida maxfiy ma'lumot bor-yo'qligini tekshiring.
4. Yuqoridagi oqim diagrammasini o'z loyihangiz uchun chizing: qaysi qadam qayerda bajariladi?
5. Tahdid modeli jadvalidan o'z loyihangizga tegishli uchtasini tanlang va hozirgi himoyani baholang.

## Rasmiy hujjat

- Next.js autentifikatsiya: <https://nextjs.org/docs/app/guides/authentication>
- RFC 7519 (JWT): <https://datatracker.ietf.org/doc/html/rfc7519>
- OAuth 2.1 (draft): <https://oauth.net/2.1/>
- OWASP Session Management: <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html>
