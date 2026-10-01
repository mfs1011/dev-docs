# 67 — Cheklovlar shartnomasi

[← Oldingi: Ro'yxat shartnomasi](66-royxat-shartnomasi.md) · [Mundarija](README.md) · [Keyingi: Model mos kelmasligi →](68-model-mos-kelmasligi.md)

## Tushuncha

30-bobda — server rate limiting'ni qanday qiladi. Bu bob — limitlar haqida **klient bilan qanday gaplashish**: klient limitni qayerdan biladi, oshganda nima qiladi, foydalanuvchiga nima ko'rsatiladi.

Cheklovlar turlari:

| Tur | Misol | Klient nima bilishi kerak |
| --- | --- | --- |
| Tezlik (rate) | 100 so'rov/daqiqa | Qancha qoldi, qachon tiklanadi |
| Kvota | 10 000 so'rov/oy, 5 eksport/kun | Joriy foydalanish |
| Hajm | Fayl ≤ 10 MB, sahifa ≤ 100 element | Oldindan, shartnomada |
| Bir vaqtdalik | Bir vaqtda 3 ta eksport | Navbatdagi o'rin |
| Biznes | Bepul tarif — 3 loyiha | Yangilash yo'li |

## Nega shunday

Limitlar e'lon qilinmasa, klient ularni **xato** orqali "kashf qiladi" — va noto'g'ri reaksiya qiladi: 429 ni oddiy xato deb darhol qayta urinadi (yukni oshiradi), foydalanuvchiga "Xatolik yuz berdi" ko'rsatadi (hech narsa tushunarsiz), yoki mobil ilova sikl ichida serverni bombardimon qiladi.

## Psevdokod: javob sarlavhalari

```text
Har javobda (ixtiyoriy, lekin foydali):
  RateLimit-Policy: 100;w=60
  RateLimit: limit=100, remaining=37, reset=24          (IETF draft formati)

Limit oshganda:
  HTTP/1.1 429 Too Many Requests
  Retry-After: 24
  Content-Type: application/problem+json
  {
    "type": "https://api.shop.uz/problems/rate-limited",
    "title": "Too many requests",
    "status": 429,
    "detail": "Daqiqasiga 100 ta so'rov. 24 soniyadan keyin urinib ko'ring.",
    "retryAfter": 24
  }

Kvota tugaganda (vaqt bilan tiklanmaydi):
  HTTP/1.1 403 Forbidden   (yoki 402/429 — kelishilgan bittasi)
  { "type": ".../quota-exceeded", "quota": "exports", "limit": 5, "used": 5, "resetsAt": "2026-10-02T00:00:00Z",
    "upgradeUrl": "/billing" }
```

Rate limit (biroz kutish yetarli) va kvota (tarifni o'zgartirish yoki ertaga) — **turli** xato turlari: UI ularni turlicha ko'rsatadi.

## Psevdokod: klient xulqi

```text
on 429:
    wait = response.headers["Retry-After"] ?? backoff(attempt)          // sarlavha birinchi
    if request is idempotent and attempt < 3:
        sleep(wait + jitter); retry
    else:
        showMessage("Juda ko'p so'rov — " + wait + " soniyadan keyin urinib ko'ring")

backoff(attempt) = min(1000 * 2^attempt, 30_000) + random(0..500)        // exponential + jitter (17-bob)

Hech qachon:
  - 429 ni darhol qayta urinish (yukni oshiradi)
  - POST (idempotency key'siz) ni avtomatik qayta yuborish
  - foydalanuvchiga "500 xatolik" deb ko'rsatish
```

## Psevdokod: UX — limitga yetmaslik

```text
Oldindan ko'rsatish:
  "Bu oy: 4 / 5 eksport"                   kvota hisoblagichi
  fayl tanlashda: "10 MB gacha"           hajm limiti — xatodan oldin
  tugma bosilgandan keyin o'chirish       ikki marta yuborishni oldini olish (UX, server baribir cheklaydi)
  qidiruvda debounce                       har harfga so'rov yo'q (29-bob)

Limitga yetilganda:
  sabab + qachon tiklanishi + nima qilish mumkin (kutish / tarifni yangilash / support)
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| 429 + sarlavhalar | Symfony RateLimiter — [Symfony 22-bob](../symfony/22-xavfsizlik.md); Laravel `throttle` (avtomatik `Retry-After`, `X-RateLimit-*`) — [Laravel 9-bob](../laravel/09-marshrutlash.md) | — |
| Klientda retry | — | RxJS `retry({ delay })` + `isRetryable` — [Angular 57](../angular/57-http-xatolar.md), [68-bob](../angular/68-rxjs-chuqur.md) |
| Ikki marta yuborish | — | `exhaustMap`, `submitting()` — [Angular 51-bob](../angular/51-signal-forms-yuborish.md) |
| Qidiruv debounce | — | `debounced()` + `httpResource` — [Angular 22-bob](../angular/22-debounced-signallar.md) |

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Limitlarni sarlavhalarda e'lon qilish | Klient o'zini moslaydi | Har javobda biroz qo'shimcha |
| Faqat 429 | Oddiy | Klient "kashf qilib" o'rganadi |
| Klientda avtomatik retry | Vaqtinchalik limitlarni yashiradi | Noto'g'ri qilinsa — yukni oshiradi |
| Kvotani UI'da ko'rsatish | Kutilmagan to'siq yo'q | Qo'shimcha API (`/usage`) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| 429 da `Retry-After` yo'q | Klient taxmin qiladi | Sarlavha + tanada |
| Klient 429 ni darhol qayta urinadi | Yuk portlashi | `Retry-After`, backoff + jitter |
| Kvota va rate limit bir xil xato | UI to'g'ri yo'l ko'rsata olmaydi | Turli `type` |
| Foydalanuvchiga "Xatolik" | Sabab va yechim noma'lum | Aniq xabar va vaqt |
| Limitlar hujjatlashtirilmagan | Integratorlar adashadi | Shartnomada (OpenAPI, 54-bob) |
| POST'ni avtomatik retry | Takror yaratish | Idempotency key (70-bob) |

## Amaliyot

1. API'ingiz 429 da qanday javob qaytaradi? `Retry-After` va problem+json bormi?
2. Frontend 429 ni qanday ko'rsatadi — sinab ko'ring (limitni vaqtincha kamaytirib).
3. Klient retry'ni `Retry-After` va exponential backoff + jitter bilan qiling.
4. Foydalanuvchiga ta'sir qiladigan kvotalarni UI'da oldindan ko'rsating.

## Manbalar

- RFC 6585 — *429 Too Many Requests*; RFC 9110 — *Retry-After*
- IETF — *RateLimit header fields for HTTP* (draft)
- AWS Architecture Blog — *Exponential Backoff And Jitter*
