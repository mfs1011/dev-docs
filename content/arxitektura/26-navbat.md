# 26 — Navbat va fon ishlari

[← Oldingi: Kesh strategiyalari](25-kesh.md) · [Mundarija](README.md) · [Keyingi: Hodisaga asoslangan arxitektura →](27-hodisalar.md)

## Tushuncha

Navbat — ishni **hozir bajarish** o'rniga **keyinroq, boshqa jarayonda** bajarish uchun yozib qo'yish.

```text
So'rov ──▶ [API] ──yozadi──▶ [ Navbat ] ──oladi──▶ [Worker] ──▶ email / PDF / tashqi API
   ◀── 202 Accepted (darhol)
```

Qachon kerak:

| Holat | Misol |
| --- | --- |
| Sekin ish | PDF, rasm ishlash, katta eksport |
| Tashqi tizim — ishonchsiz | Email, SMS, to'lov webhook'i, 1C |
| Yukni tekislash | Aksiya kuni 10 000 buyurtma — worker'lar o'z tezligida |
| Qayta urinish kerak | Tashqi API vaqtinchalik ishlamayapti |
| Bir nechta reaksiya | Buyurtma → email + ombor + analitika |

## Nega shunday

So'rov ichida sekin yoki ishonchsiz ish — ikki muammo: foydalanuvchi kutadi (va timeout), tashqi tizim yiqilsa — asosiy amal ham yiqiladi. Navbat ularni **ajratadi**: asosiy amal tez tugaydi, qolgani — alohida, qayta urinish bilan.

Evaziga — taqsimlangan tizim xususiyatlari: xabar **kamida bir marta** (at-least-once) yetkaziladi, ya'ni **takrorlanishi** mumkin.

## Psevdokod: yetkazish kafolatlari

```text
at-most-once     — ko'pi bilan bir marta: yo'qolishi mumkin, takrorlanmaydi   (log, metrika)
at-least-once    — kamida bir marta: yo'qolmaydi, takrorlanishi MUMKIN         (ko'p brokerlar sukuti)
exactly-once     — amalda: at-least-once + idempotent qayta ishlash
```

"Exactly-once" — broker va'dasi emas, **sizning handler'ingiz** xususiyati:

```text
// Idempotent bo'lmagan handler — takror kelsa ikki marta email
on SendWelcomeEmail(msg): mailer.send(msg.userId)

// Idempotent — ishlangan xabarlarni eslab qolish
on SendWelcomeEmail(msg):
    if processed.exists(msg.id): return
    mailer.send(msg.userId)
    processed.add(msg.id)            // (ideal holda — asosiy o'zgarish bilan bir tranzaksiyada)
```

Idempotentlik — 70-bobda batafsil.

## Psevdokod: qayta urinish va dead letter

```text
handler xato tashladi:
    attempt 1 → 10 s kutish → attempt 2 → 1 min → attempt 3 → 10 min → ...
    max urinishdan keyin → dead letter queue (DLQ)

DLQ — "o'lik xatlar" qutisi:
  - monitoring: DLQ'da xabar paydo bo'lsa — alert
  - sababini tuzatib, qayta yuborish vositasi (retry-from-DLQ)
  - hech qachon jim o'chirilmaydi
```

Xatolarni ajrating (17-bob):

| Xato | Qayta urinish |
| --- | --- |
| Vaqtinchalik (timeout, 503, deadlock) | ✅ backoff bilan |
| Doimiy (validatsiya, "foydalanuvchi o'chirilgan") | ❌ darhol DLQ yoki tashlab yuborish (loglab) |
| Bug | ❌ DLQ + alert; tuzatilgach qayta yuborish |

## Psevdokod: tartib

```text
Muammo: "buyurtma yangilandi" v1 va v2 xabarlari; worker'lar parallel — v2 v1 dan oldin qayta ishlanishi mumkin

Yechimlar:
a) Tartib muhim bo'lgan xabarlar — bitta partitsiya/kalit bo'yicha (Kafka key = orderId)
b) Xabarda versiya/vaqt; handler eski versiyani e'tiborsiz qoldiradi
c) Xabarga holat emas, "nimadir o'zgardi" signali; handler joriy holatni o'zi o'qiydi
```

Global tartib — qimmat va masshtablanmaydi. Ko'pincha **bir ob'ekt ichidagi** tartib yetarli.

## Psevdokod: navbatga yozish va tranzaksiya

```text
// Muammo: DB'ga yozildi, navbatga yozishdan oldin jarayon yiqildi → email hech qachon ketmaydi
BEGIN; save(order); COMMIT
queue.publish(OrderPlaced)          // ← shu yerda yiqilsa?

// Yechim — transactional outbox (27-bob): xabar DB'ga, bir tranzaksiyada
BEGIN; save(order); outbox.insert(OrderPlaced); COMMIT
relay: outbox'dan o'qiydi → brokerga yuboradi → belgilaydi
```

## Framework'larda

| Imkoniyat | Symfony Messenger | Laravel Queue |
| --- | --- | --- |
| Asinxron xabar | `#[AsMessageHandler]`, transportlar (Doctrine, Redis, AMQP) — [Symfony 26-bob](../symfony/26-messenger.md) | Job klasslar, `dispatch()`, drayverlar — [Laravel 25-bob](../laravel/25-navbatlar.md) |
| Retry | `retry_strategy` (delay, multiplier, max) | `$tries`, `backoff()` |
| DLQ | `failure_transport` + `messenger:failed:retry` | `failed_jobs` jadvali + `queue:retry` |
| Doimiy xato | `UnrecoverableMessageHandlingException` | `$this->fail()` |
| Unikal ish | — | `ShouldBeUnique` |
| Worker boshqaruvi | `messenger:consume` + Supervisor | `queue:work` + Horizon |

Frontend tomondan: navbatga qo'yilgan ish uchun javob — `202 Accepted` + holat URL'i; frontend polling, SSE yoki WebSocket bilan natijani kutadi (64-bob, real vaqt). UI: "Eksport tayyorlanmoqda — tayyor bo'lganda xabar beramiz". Next.js'da fon ishlari — [Next.js 36-bob](../nextjs/36-fon-ishlari.md).

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| So'rov ichida sinxron | Oddiy, natija darhol | Sekin, tashqi xatoga bog'liq |
| Navbat | Tez javob, ishonchlilik, yukni tekislash | Takrorlar (idempotentlik), kechikish, monitoring |
| DB navbati (Doctrine/`database` drayver) | Qo'shimcha infratuzilma yo'q, tranzaksiya bilan oson | Yuqori yukda DB'ga bosim |
| Alohida broker (RabbitMQ, Redis, SQS) | Masshtab, xususiyatlar | Yana bir tizim — ops |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Handler idempotent emas | Takror xabar — ikki marta ta'sir | Xabar ID'si bilan tekshirish |
| Cheksiz retry | Zaharli xabar navbatni to'sadi | Max urinish + DLQ |
| DLQ monitoring qilinmaydi | Ishlar jim yo'qoladi | Alert |
| Xabarda katta payload (butun ob'ekt) | Eskirgan ma'lumot, katta xabarlar | ID + handler joriy holatni o'qiydi |
| DB commit'dan keyin alohida publish | Xabar yo'qolishi | Outbox |
| Worker kod yangilanganda qayta ishga tushmaydi | Eski kod ishlaydi | Deploy'da worker restart |

## Amaliyot

1. So'rov ichidagi eng sekin 3 ishni navbatga ko'chiring va javob vaqtini solishtiring.
2. Bitta handler'ni ikki marta bir xil xabar bilan ishga tushiring — natija to'g'rimi?
3. Retry siyosatini sozlang va DLQ'ga alert qo'shing.
4. "DB'ga yozildi, lekin xabar ketmadi" holati kodingizda bo'lishi mumkinmi? Outbox kerakmi?

## Manbalar

- Gregor Hohpe, Bobby Woolf — *Enterprise Integration Patterns*
- Chris Richardson — *Transactional Outbox* <https://microservices.io/patterns/data/transactional-outbox.html>
- Martin Kleppmann — *DDIA*, 11-bob (stream processing)
