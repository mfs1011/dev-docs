# 70 — Idempotentlik

[← Oldingi: BFF va API gateway](69-bff.md) · [Mundarija](README.md) · [Keyingi: Migratsiya va nol to'xtovli deploy →](71-nol-toxtovli-deploy.md)

## Tushuncha

Idempotent amal — **bir marta yoki ko'p marta bajarilsa ham natija bir xil**. `SET status = 'paid'` — idempotent; `balance = balance - 100` — yo'q.

Taqsimlangan tizimda takrorlar muqarrar:

| Manba | Misol |
| --- | --- |
| Foydalanuvchi | "To'lash" ni ikki marta bosdi |
| Klient retry | Timeout — javob kelmadi, lekin server bajargan edi |
| Tarmoq | Proksi so'rovni qayta yubordi |
| Navbat | At-least-once — xabar ikki marta yetkazildi (26-bob) |
| Webhook | Provayder javob kutmay qayta yubordi (72-bob) |

Asosiy tushuncha: **timeout ≠ amal bajarilmadi**. Klient bilmaydi — server bajarganmi yoki yo'q. Xavfsiz qayta urinishning yagona yo'li — amalni idempotent qilish.

## Nega shunday

```text
Klient: POST /payments { amount: 890000 }
Server: pul yechildi ✓ → javob yuborilmoqda → tarmoq uzildi
Klient: timeout → qayta urinish → POST /payments { amount: 890000 }
Server: yana pul yechildi ✓✓   ← mijozdan ikki marta
```

HTTP metodlarining bir qismi tabiatan idempotent (`GET`, `PUT`, `DELETE`, 55-bob), lekin eng xavfli amallar — `POST` (yaratish, to'lov) — idempotent emas. Ularni **kalit** bilan idempotent qilish kerak.

## Psevdokod: Idempotency-Key

```text
Klient:
  key = uuid()                                   // amal boshlanganda bir marta — retry'larda O'SHA kalit
  POST /payments
  Idempotency-Key: 5f2a…
  { amount: 890000, orderId: "7f3a" }

Server:
  record = idempotency.find(key, userId)
  if record:
      if record.requestHash != hash(body): return 422 "kalit boshqa so'rov bilan ishlatilgan"
      if record.status == "in_progress":    return 409 "bajarilmoqda"  (yoki kutish)
      return record.response                     // birinchi javobning aynan o'zi
  idempotency.insert(key, userId, hash(body), status = "in_progress")    // UNIQUE (key, user) — poyga himoyasi
  response = processPayment(...)
  idempotency.complete(key, response)           // muddat: 24 soat
  return response
```

Muhim tafsilotlar:
- Kalit **foydalanuvchi bo'yicha** (boshqa foydalanuvchi kalitini taxmin qilib javobni olmasin).
- **UNIQUE cheklov** — ikki parallel so'rovdan faqat bittasi bajariladi.
- Kalit va so'rov tanasi bog'langan — bir kalit bilan boshqa summa yuborilsa — rad.
- Asosiy o'zgarish va idempotentlik yozuvi — iloji bo'lsa **bitta tranzaksiyada**.

## Psevdokod: tabiiy idempotentlik — kalitsiz

```text
Ko'pincha kalit kerak emas — amalni tabiatan idempotent qilish mumkin:

"Buyurtmani to'langan deb belgilash":
  UPDATE orders SET status='paid', paid_at=now() WHERE id=? AND status='pending'   -- ikkinchisi 0 qator
"Kunlik hisob-faktura":
  UNIQUE (tenant_id, period) — ikkinchi urinish konflikt → mavjudini qaytarish
"Webhook hodisasi":
  processed_events(event_id PRIMARY KEY) — takror kelsa e'tiborsiz
"Holat o'tishi":
  holat mashinasi: Paid → Paid o'tishi — hech narsa qilmaslik (xato emas)
```

Biznes identifikatori bor joyda (buyurtma ID, davr, tashqi hodisa ID) — u **tabiiy idempotentlik kaliti**.

## Psevdokod: yon ta'sirlar

```text
Muammo: handler idempotent, lekin email ikki marta ketdi
  process(msg): order.markPaid() (idempotent ✓); mailer.send(...) (har safar ✗)

Yechim: yon ta'sirlarni ham holatga bog'lash
  if order.markPaid() == changed:            // faqat haqiqiy o'zgarishda
      outbox.add(OrderPaid(order.id))         // email — hodisadan, bir marta (27-bob)
```

## Framework'larda

| Ehtiyoj | Backend | Frontend |
| --- | --- | --- |
| Idempotency middleware | Laravel/Symfony uchun paketlar yoki o'z middleware (kalit jadvali + UNIQUE) | Kalitni amal boshida yaratish, retry'larda saqlash |
| Unikal ishlar | Laravel `ShouldBeUnique` — [Laravel 25-bob](../laravel/25-navbatlar.md); Symfony Lock — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) | — |
| Ikki marta bosish | — | `exhaustMap`, `submitting()` — [Angular 68](../angular/68-rxjs-chuqur.md), [51-bob](../angular/51-signal-forms-yuborish.md) |
| Retry faqat idempotentga | — | `isRetryable` — [Angular 57-bob](../angular/57-http-xatolar.md) |
| Saga/outbox | Messenger — [Symfony 26-bob](../symfony/26-messenger.md) | — |

Frontend'dagi "tugmani o'chirish" — UX, lekin **kafolat emas**: ikki tab, sekin tarmoqdagi retry, API'ni to'g'ridan-to'g'ri chaqirish. Kafolat — serverda.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Idempotency-Key | Har qanday POST xavfsiz qayta urinadi | Kalit jadvali, muddat, saqlash |
| Tabiiy idempotentlik (UNIQUE, holat sharti) | Qo'shimcha infratuzilma yo'q | Har amal uchun o'ylash kerak |
| Faqat frontend himoyasi | Oddiy | Kafolat yo'q |
| Idempotentliksiz retry | — | Takroriy to'lovlar, dublikatlar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Timeout'ni "bajarilmadi" deb qabul qilish | Takror yuborish → dublikat | Idempotent amal + o'sha kalit bilan retry |
| Har retry'da yangi kalit | Himoya ishlamaydi | Kalit amal boshida bir marta |
| Kalit UNIQUE cheklovsiz | Parallel so'rovlar ikkalasi o'tadi | DB UNIQUE |
| Kalit global (foydalanuvchisiz) | Begona javob oshkor | (key, userId) |
| Yon ta'sirlar har urinishda | Ikki email, ikki SMS | Faqat holat o'zgarganda, outbox |
| Webhook'ni ID'siz qayta ishlash | Takror ta'sir | `event_id` jadvali |

## Amaliyot

1. To'lov, buyurtma yaratish, hisob-faktura endpoint'laringizni ikki marta parallel chaqiring — nima bo'ladi?
2. Eng xavfli POST'ga Idempotency-Key qo'llovini qo'shing.
3. Navbat handler'laringizdan birini ikki marta bir xil xabar bilan ishga tushiring.
4. Webhook handler'iga `processed_events` jadvalini qo'shing.

## Manbalar

- Stripe — *Idempotent requests* <https://docs.stripe.com/api/idempotent_requests>
- IETF — *The Idempotency-Key HTTP Header Field* (draft)
- Brandur Leach — *Implementing Stripe-like Idempotency Keys in Postgres*
