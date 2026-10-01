# 61 — Access va refresh tokenlar

[← Oldingi: Autentifikatsiya oqimlari](60-autentifikatsiya.md) · [Mundarija](README.md) · [Keyingi: Avtorizatsiya →](62-avtorizatsiya.md)

## Tushuncha

Token modeli tanlangan bo'lsa (60-bob), ikki token ishlatiladi:

| Token | Muddat | Qayerga yuboriladi | Maqsad |
| --- | --- | --- | --- |
| **Access token** | Qisqa (5–15 daqiqa) | Har API so'roviga (`Authorization: Bearer`) | Ruxsat |
| **Refresh token** | Uzun (kunlar–haftalar) | Faqat `/auth/refresh` ga | Yangi access token olish |

Access token qisqa — o'g'irlansa, tez eskiradi. Refresh token uzun — lekin faqat bitta endpoint'ga boradi va eng himoyalangan joyda saqlanadi.

## Nega shunday

Bitta uzun muddatli token — o'g'irlansa, hujumchi oylab kiradi va uni bekor qilish qiyin (JWT stateless bo'lsa — server "eslab" qolmaydi). Ikki token modeli muvozanat beradi: tez-tez tekshiriladigan qisqa ruxsat + kamdan-kam ishlatiladigan, kuzatiladigan uzun kalit.

## Psevdokod: JWT yoki opaque

```text
JWT (o'zini tasvirlaydigan):   header.payload.signature
  payload: { sub: "user_7", roles: ["admin"], exp: 1767225600, iss, aud }
  + Servis DB'ga murojaat qilmasdan tekshiradi (imzo bilan)
  − Muddati tugaguncha bekor qilib bo'lmaydi (deny-list kerak); payload'da maxfiy ma'lumot bo'lmasin (base64 — shifr emas)

Opaque (tasodifiy satr):       "tok_8f2a…"
  + Server istalgan payt bekor qiladi
  − Har tekshiruvda saqlovchiga (DB/Redis) murojaat

Amaliy tanlov: access — JWT (qisqa), refresh — opaque (DB'da, bekor qilinadi)
```

## Psevdokod: rotation va qayta ishlatishni aniqlash

```text
POST /auth/refresh  (cookie: refresh=R1)
  server: R1 yaroqli → R1 "ishlatildi" deb belgilanadi → yangi { access A2, refresh R2 } (bitta "oila")

Hujumchi R1 ni o'g'irlagan va keyinroq ishlatdi:
  server: R1 allaqachon ishlatilgan → QAYTA ISHLATISH → butun oilani (R2 ham) bekor qilish → foydalanuvchi qayta kiradi
```

Rotation — o'g'irlangan refresh token'ni aniqlash mexanizmi. Lekin u **klientdan intizom** talab qiladi: ikki parallel refresh so'rovi ikkinchisini "qayta ishlatish" deb ko'rsatib, haqiqiy foydalanuvchini chiqarib yuboradi.

## Psevdokod: single-flight refresh (klient)

```text
Sahifa ochildi → 5 ta so'rov parallel → hammasi 401 (access eskirgan)

Noto'g'ri: har biri refresh qiladi → 5 ta refresh → rotation'da 2–5-chisi "qayta ishlatish" → logout
To'g'ri:
  refreshing = null
  on 401:
      refreshing ??= api.refresh().finally(() => refreshing = null)    // bitta umumiy va'da
      token = await refreshing
      retry(originalRequest, token)
```

Angular'da real testda tasdiqlangan: ikki parallel 401 → **bitta** refresh so'rovi, ikkala asl so'rov yangi token bilan qayta yuborildi; refresh ham 401 qaytarsa — logout ([Angular 58-bob](../angular/58-auth-token-refresh.md)). Ko'p tab uchun — `BroadcastChannel` bilan tablar orasida muvofiqlashtirish.

## Psevdokod: qayerda saqlash

```text
                        XSS'da o'g'irlanadimi    Sahifa yangilansa    Eslatma
localStorage            Ha                       qoladi               eng qulay, eng zaif
Xotira (JS o'zgaruvchi) Qiyinroq                 yo'qoladi            access token uchun yaxshi
HttpOnly cookie         Yo'q                     qoladi               refresh token uchun eng yaxshi (+ CSRF himoyasi)
BFF serverda            Brauzerda umuman yo'q    —                    eng xavfsiz (60-bob)

Tavsiya: access — xotirada; refresh — HttpOnly; Secure; SameSite=Strict; Path=/auth cookie'da;
         ilova ochilganda — refresh orqali sessiyani tiklash
```

## Psevdokod: bekor qilish (revocation)

```text
Logout:            refresh token'ni serverda bekor qilish; access — tabiiy eskiradi (≤ 15 daq)
Parol o'zgardi:    foydalanuvchining barcha refresh tokenlarini bekor qilish
Shubhali kirish:   oilani bekor qilish (rotation)
Darhol bekor qilish kerak bo'lsa (admin bloklandi):
                   access token qisqa + deny-list (jti bo'yicha, Redis, TTL = qolgan muddat)
"Qurilmalarim" ro'yxati: har refresh oilasi = bitta qurilma/sessiya → foydalanuvchi o'zi chiqarib yuboradi
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Token chiqarish | Laravel Sanctum / Passport, Symfony `lexik/jwt` + refresh bundle — [Laravel 21-bob](../laravel/21-autentifikatsiya.md) | — |
| Refresh oqimi | `/auth/refresh` endpoint, rotation jadvali | Single-flight interceptor — [Angular 58](../angular/58-auth-token-refresh.md); [Next.js 28-bob](../nextjs/28-refresh-oqimi.md) |
| Saqlash joyi | Cookie atributlari | [Next.js 26-bob](../nextjs/26-token-saqlash.md), [React 39-bob](../react/39-auth-klient.md) |
| Sessiyani tiklash | — | `provideAppInitializer` + refresh — [Angular 58-bob](../angular/58-auth-token-refresh.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Qisqa access token | O'g'irlansa tez eskiradi | Ko'p refresh so'rovi |
| Uzun access token | Kam refresh | O'g'irlansa uzoq xavf |
| Refresh rotation | O'g'irlashni aniqlash | Klientda single-flight shart; ko'p tab murakkabligi |
| JWT access | DB'siz tekshiruv | Darhol bekor qilish uchun deny-list |
| Opaque access | Darhol bekor qilinadi | Har so'rovda saqlovchiga murojaat |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Refresh token localStorage'da | XSS'da uzoq muddatli kirish | HttpOnly cookie yoki BFF |
| Har 401 da alohida refresh | Rotation'da foydalanuvchi chiqib ketadi | Single-flight |
| JWT payload'da maxfiy ma'lumot | Base64 — hamma o'qiydi | Faqat ID va rollar |
| `alg: none` / imzo tekshirilmaydi | Soxta token | Kutubxona, qat'iy algoritm ro'yxati |
| Logout faqat klientda | Token tirik | Server tomonda bekor qilish |
| Refresh endpoint ham interceptor'dan o'tadi | Cheksiz sikl | Refresh so'rovini istisno qilish |

## Amaliyot

1. Ilovangizda 5 ta parallel so'rovni eskirgan token bilan yuboring — nechta refresh ketadi?
2. Refresh token rotation va qayta ishlatishni aniqlashni qo'shing.
3. "Qurilmalarim" ro'yxati uchun ma'lumot modelini chizing.
4. Parol o'zgarganda barcha sessiyalar bekor qilinishini tekshiring.

## Manbalar

- RFC 9700 — *OAuth 2.0 Security Best Current Practice* (refresh token rotation)
- RFC 8725 — *JSON Web Token Best Current Practices*
- OWASP — *JSON Web Token Cheat Sheet*
