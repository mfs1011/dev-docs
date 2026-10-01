# 72 — Uchinchi tomon integratsiyalari

[← Oldingi: Migratsiya va nol to'xtovli deploy](71-nol-toxtovli-deploy.md) · [Mundarija](README.md) · [Keyingi: Ko'p platformalilik →](73-kop-platformalilik.md)

## Tushuncha

Deyarli har tizim tashqi xizmatlarga bog'liq: to'lov (Click, Payme, Uzum, Stripe), SMS, email, xarita, yetkazib berish, 1C, soliq tizimi, AI provayderlar. Ularning umumiy xususiyati: **siz ularni nazorat qilmaysiz** — ishlamay qolishi, sekinlashishi, API'ni o'zgartirishi, xabarni ikki marta yuborishi yoki umuman yubormasligi mumkin.

Ikki yo'nalish:

| Yo'nalish | Misol | Asosiy xavf |
| --- | --- | --- |
| **Chiquvchi** (siz chaqirasiz) | SMS yuborish, to'lov yaratish | Timeout, rate limit, xato javob |
| **Kiruvchi** (ular chaqiradi — webhook) | "To'lov o'tdi", "yetkazildi" | Soxta so'rov, takror, tartibsiz kelish, kelmasligi |

## Nega shunday

Tashqi xizmat sizning tizimingizning **eng zaif bo'g'ini**: u yiqilsa — sizning checkout'ingiz ham yiqiladimi? Arxitektura vazifasi — tashqi nosozlikni **izolyatsiya** qilish: asosiy amal davom etsin, tashqi qism keyin yoki zaxira bilan bajarilsin.

## Psevdokod: chiquvchi — himoya qatlami

```text
// Adapter + Anti-Corruption Layer (14-bob): tashqi model ichkariga kirmaydi
interface SmsSender { send(phone: Phone, text: string): Result }

class EskizSmsSender implements SmsSender:
    send(phone, text):
        response = http.post(url, body, timeout = 5s)          // HAR chaqiruvda timeout
        return map(response)                                    // ularning xato kodlari → bizning Result

// Chaqiruv — so'rov ichida emas, navbat orqali (26-bob)
on OrderPlaced(e): queue.dispatch(SendOrderSms(e.orderId))
worker: retry(3, backoff), keyin DLQ + alert
// Circuit breaker (79-bob): provayder 50% xato bersa — vaqtincha chaqirmaslik, zaxira provayderga o'tish
```

## Psevdokod: kiruvchi webhook — to'g'ri qabul qilish

```text
POST /webhooks/payme
  1. IMZONI tekshirish — HMAC(secret, raw_body) == sarlavhadagi imzo (constant-time solishtirish)
     yoki provayder IP oq ro'yxati / Basic auth (provayder qo'llaganiga qarab)
  2. Vaqt tamg'asi — 5 daqiqadan eski bo'lsa rad (replay hujumi)
  3. Idempotentlik — event_id allaqachon ishlanganmi? (70-bob)
  4. Xom hodisani saqlash — webhook_events(id, provider, payload, received_at, status)
  5. Darhol 200 qaytarish — og'ir ishni navbatga
  6. Worker: hodisani qayta ishlash, holat mashinasi bo'yicha (tartibsiz kelsa ham to'g'ri)

Nega darhol 200: provayder javob kutadi; sekin javob → u qayta yuboradi → takrorlar
Nega xom saqlash: xato bo'lsa — qayta ishlash mumkin; audit (31-bob)
```

## Psevdokod: webhook'ga ishonmaslik — tekshirish

```text
Webhook keldi: "to'lov #91 o'tdi, 890 000 so'm"
  - imzo to'g'ri bo'lsa ham: summa va buyurtma mosmi?  (bizning ma'lumotimiz bilan solishtirish)
  - muhim amallar uchun: provayder API'sidan holatni qayta so'rash (status check)
Webhook kelmasa:
  - rejalashtirilgan ish: "pending" holatdagi to'lovlarni 15 daqiqadan keyin provayderdan so'rash (34-bob)
```

**Webhook — signal, haqiqat emas** (64-bobdagi real vaqt naqshi kabi). Haqiqat — provayder API'si va sizning tekshiruvingiz.

## Psevdokod: sandbox va test

```text
Muhitlar:      har provayderning sandbox kaliti — dev/staging'da; production kaliti faqat production'da (18-bob)
Lokal webhook: tunnel (ngrok, cloudflared) yoki provayder CLI (stripe listen)
Testlar:       provayder javoblarini yozib olish (recorded fixtures) — unit/integratsiya testlarda
               sandbox'ga qarshi kontrakt testlari — vaqti-vaqti bilan (har PR'da emas)
Fake adapter:  FakeSmsSender — lokal va testda haqiqiy SMS yubormaydi
```

## Framework'larda

| Ehtiyoj | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| HTTP klient (timeout, retry) | HttpClient + `RetryableHttpClient` — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) | `Http::timeout()->retry()` | — |
| Fon chaqiruvlari | Messenger — [26-bob](../symfony/26-messenger.md) | Queue — [Laravel 25-bob](../laravel/25-navbatlar.md) | — |
| Webhook'lar | Webhook / RemoteEvent komponentlari | O'z controller + navbat | — |
| Bildirishnoma provayderlari | Notifier — [Symfony 29-bob](../symfony/29-mailer-va-notifier.md) | Mail/Notification — [Laravel 28-bob](../laravel/28-mail-va-bildirishnoma.md) | — |
| To'lov (frontend) | — | — | Stripe misoli — [Next.js 35-bob](../nextjs/35-stripe.md) |

Frontend uchun asosiy qoida: to'lov natijasini **redirect URL'idagi parametrlarga ishonib** ko'rsatmaslik (`?status=success` ni foydalanuvchi o'zi yozishi mumkin). Sahifa backend'dan buyurtma holatini so'raydi; backend esa webhook va status check orqali biladi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| So'rov ichida sinxron chaqiruv | Oddiy, natija darhol | Tashqi nosozlik — sizning nosozligingiz |
| Navbat orqali | Izolyatsiya, retry | Natija kechikadi, holat kuzatish kerak |
| Bitta provayder | Oddiy | Yagona nosozlik nuqtasi |
| Zaxira provayder (SMS) | Mavjudlik | Ikki integratsiyani saqlash |
| Webhook'ga to'liq ishonch | Kam kod | Soxtalashtirish, yo'qolgan hodisalar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Timeout'siz tashqi chaqiruv | Worker/so'rov osilib qoladi | Har chaqiruvda timeout |
| Webhook imzosi tekshirilmaydi | Har kim "to'lov o'tdi" deydi | HMAC + vaqt tamg'asi |
| Webhook'da og'ir ish, keyin 200 | Provayder qayta yuboradi | Saqlash → 200 → navbat |
| Takroriy webhook ikki marta ishlanadi | Ikki marta bonus/jo'natish | event_id idempotentlik |
| Redirect parametriga ishonib "to'landi" | Soxtalashtirish | Backend holatidan |
| Tashqi model kod bo'ylab tarqalgan | Provayder almashsa — ko'p joy | Adapter + ACL |
| Production kalit dev'da | Haqiqiy pul/SMS | Sandbox kalitlari |

## Amaliyot

1. Barcha tashqi integratsiyalaringiz ro'yxati: har biri yiqilsa nima bo'ladi?
2. Webhook endpoint'ingizni tekshiring: imzo, vaqt tamg'asi, idempotentlik, darhol 200 bormi?
3. "Pending" to'lovlarni provayderdan qayta tekshiruvchi rejalashtirilgan ishni yozing.
4. Tashqi chaqiruvlarning har birida timeout borligini tasdiqlang.

## Manbalar

- Stripe — *Best practices for using webhooks* <https://docs.stripe.com/webhooks#best-practices>
- Standard Webhooks spetsifikatsiyasi <https://www.standardwebhooks.com>
- Michael Nygard — *Release It!* (integratsiya nuqtalari, circuit breaker)
