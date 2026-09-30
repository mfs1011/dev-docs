# 30 — Rate limiting va kvotalar

[← Oldingi: Qidiruv arxitekturasi](29-qidiruv.md) · [Mundarija](README.md) · [Keyingi: Audit va o'zgarishlar tarixi →](31-audit.md)

## Tushuncha

Rate limiting — ma'lum vaqt ichida ruxsat etilgan so'rovlar sonini cheklash. Kvota — uzoqroq davr uchun limit (oyiga 10 000 API chaqiruvi).

Nima uchun:

| Maqsad | Misol |
| --- | --- |
| **Xavfsizlik** | Login'ga brute force, OTP sanash, parolni tiklash spami |
| **Barqarorlik** | Bitta mijoz butun tizimni band qilmasin |
| **Adolat** | Ko'p ijarachili tizimda bir tenant boshqalarni "och" qoldirmasin |
| **Narx** | Qimmat amallar (SMS, AI chaqiruvi, eksport) |
| **Biznes** | Tarif rejalari (bepul — 100/soat, pro — 10 000/soat) |

## Nega shunday

Limitlarsiz API — ochiq eshik: bitta skript butun resursni band qiladi, login'ga daqiqasiga 10 000 parol sinaladi, SMS yuborish endpoint'i orqali sizning hisobingizga minglab SMS ketadi. OWASP API Top 10 da "Unrestricted Resource Consumption" — alohida xavf (77-bob).

## Psevdokod: algoritmlar

```text
// Fixed window — eng oddiy
key = "rl:" + userId + ":" + floor(now / 60)        // har daqiqa uchun hisoblagich
count = redis.incr(key); redis.expire(key, 60)
if count > 100: reject 429
// Kamchilik: 00:59 da 100 + 01:00 da 100 = 1 soniyada 200 so'rov
```

```text
// Sliding window — tekisroq (ikki oyna vaznli yig'indisi yoki log)
estimated = prevWindowCount * (1 - elapsedFraction) + currentWindowCount
```

```text
// Token bucket — portlashga ruxsat, o'rtacha tezlik cheklangan
bucket: capacity = 20, refill = 5 token/soniya
har so'rov: if bucket.tokens >= 1: tokens -= 1; allow else reject 429
// Qisqa portlash (20 ta birdan) — ok; uzoq muddatda — soniyasiga 5 ta
```

| Algoritm | Afzallik | Qachon |
| --- | --- | --- |
| Fixed window | Oddiy, arzon | Qo'pol himoya |
| Sliding window | Chegaralarda adolatli | Umumiy API limitlari |
| Token bucket | Portlashga ruxsat | Foydalanuvchi interaktiv so'rovlari |
| Leaky bucket | Chiqish tezligi tekis | Tashqi API'ga yuborish (ularning limitiga moslash) |

## Psevdokod: nima bo'yicha cheklash

```text
Kalit — kimni sanaymiz:
  IP              — autentifikatsiyasiz endpoint'lar (login, ro'yxatdan o'tish); NAT ortida ko'p odam bitta IP!
  user_id         — autentifikatsiyalangan so'rovlar
  tenant_id       — ko'p ijarachilik adolati (33-bob)
  api_key         — tashqi integratsiyalar, tarif rejasi
  kombinatsiya    — login: (IP) VA (email) — biri emas, ikkalasi

Endpoint bo'yicha farqli limitlar:
  POST /login              5/daqiqa har email, 20/daqiqa har IP
  POST /otp/send           3/soat har telefon
  GET  /products           300/daqiqa
  POST /exports            5/soat (qimmat)
```

Login uchun faqat IP bo'yicha limit — yetarli emas: hujumchi ko'p IP'dan bitta akkauntga urinadi. Faqat email bo'yicha — hujumchi har akkauntdan bittadan sinaydi. Ikkalasi kerak.

## Psevdokod: javob va klient

```text
HTTP/1.1 429 Too Many Requests
Retry-After: 30
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 30
Content-Type: application/problem+json

{ "type": ".../rate-limited", "title": "Juda ko'p so'rov", "detail": "30 soniyadan keyin urinib ko'ring" }
```

Klient tomoni — 67-bob (cheklovlar shartnomasi): `Retry-After` ni hurmat qilish, exponential backoff, UI'da tushunarli xabar.

## Psevdokod: qayerda cheklash

```text
Qatlamlar:
  CDN / WAF (Cloudflare)      — L7 DDoS, bot, IP bo'yicha qo'pol limit
  API gateway / nginx          — umumiy limitlar, ilovaga yetib kelmasdan
  Ilova (middleware)           — biznes kalitlari (user, tenant, email), tarif rejalari
  Tashqi chaqiruvlar oldidan   — bizning SMS/AI provayderimizning limitini oshirmaslik uchun

Taqsimlangan tizimda hisoblagich — markazlashgan (Redis), aks holda har nusxa o'z limitini beradi (3 nusxa × 100 = 300).
```

## Framework'larda

| Imkoniyat | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| Rate limiter | RateLimiter komponenti (`fixed_window`, `sliding_window`, `token_bucket`) + `login_throttling` — [Symfony 22-bob](../symfony/22-xavfsizlik.md) | `RateLimiter::for()` + `throttle` middleware — [Laravel 9-bob](../laravel/09-marshrutlash.md), [31-bob](../laravel/31-amaliy-loyiha-api.md) | — |
| Login himoyasi | `login_throttling` firewall sozlamasi | `throttle:login` | — |
| 429 ni boshqarish | — | — | Interceptor + backoff — [Angular 57-bob](../angular/57-http-xatolar.md) |
| Ikki marta yuborishdan himoya | — | — | `exhaustMap`, `submitting()` — [Angular 51-bob](../angular/51-signal-forms-yuborish.md) |

Frontend'dagi debounce va tugmani o'chirish — **UX**, himoya emas: skript API'ni to'g'ridan-to'g'ri chaqiradi. Limit — faqat serverda.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Qat'iy limitlar | Himoya, bashorat qilinadigan yuk | Haqiqiy foydalanuvchilar ham to'siladi (NAT, ofis) |
| Yumshoq limitlar | Qulaylik | Hujumga ochiqroq |
| Lokal (jarayon ichida) hisoblagich | Tez, infratuzilmasiz | Ko'p nusxada noto'g'ri |
| Redis hisoblagich | Aniq | Har so'rovda tarmoq chaqiruvi; Redis yiqilsa — fail-open yoki fail-closed? |

Redis yiqilsa nima: **fail-open** (limitsiz o'tkazish) — mavjudlik uchun; **fail-closed** (hammasini rad etish) — login, to'lov kabi xavfsizlik kritik joylar uchun. Buni oldindan hal qiling.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Limit yo'q | Brute force, xarajat, DoS | Hech bo'lmaganda login/OTP/qimmat amallar |
| Faqat IP bo'yicha | NAT'da begunohlar, taqsimlangan hujum o'tadi | Kombinatsiya (IP + email/user) |
| Faqat frontend'da cheklash | Skript chetlab o'tadi | Server |
| 429 da `Retry-After` yo'q | Klient darhol qayta urinadi | Sarlavhalar + problem+json |
| Har nusxada lokal hisoblagich | Limit nusxalar soniga ko'payadi | Markaziy ombor |
| SMS/OTP limitsiz | Pul oqib ketadi (SMS pumping) | Telefon + IP + global limitlar |

## Amaliyot

1. Login, parolni tiklash, OTP va eksport endpoint'laringizda limit bormi — tekshiring.
2. Login uchun IP + email kombinatsiyali limit qo'ying va `hydra`/skript bilan sinang.
3. 429 javobiga `Retry-After` va RFC 9457 tanasini qo'shing.
4. Redis yiqilganda limiter nima qiladi — fail-open yoki fail-closed? Qaror qabul qilib, hujjatlashtiring.

## Manbalar

- IETF — *RateLimit header fields for HTTP* (draft) <https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/>
- OWASP API Security Top 10 — API4:2023 Unrestricted Resource Consumption
- Stripe Engineering — *Scaling your API with rate limiters* <https://stripe.com/blog/rate-limiters>
