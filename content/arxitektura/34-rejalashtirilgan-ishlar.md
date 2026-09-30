# 34 — Rejalashtirilgan ishlar

[← Oldingi: Ko'p ijarachilik](33-kop-ijarachilik.md) · [Mundarija](README.md) · [Keyingi: Backend testlash strategiyasi →](35-backend-testlash.md)

## Tushuncha

Rejalashtirilgan ish — vaqtga bog'liq, foydalanuvchi so'rovisiz bajariladigan ish: har kecha hisobot, har 5 daqiqada to'lanmagan buyurtmalarni bekor qilish, har soatda valyuta kursini yangilash, "pending" fayllarni tozalash (32-bob).

```text
cron / scheduler ──(vaqt keldi)──▶ ish ──▶ ko'pincha navbatga bo'linadi ──▶ worker'lar
```

## Nega shunday

Oddiy `crontab` bitta serverda yaxshi ishlaydi. Muammolar ko'p server va uzoq ishlar bilan boshlanadi:

| Muammo | Oqibat |
| --- | --- |
| 3 server nusxasi — har birida cron | Ish 3 marta bajariladi (3 ta email, 3 ta hisob) |
| Ish 10 daqiqa oladi, har 5 daqiqada ishga tushadi | Parallel nusxalar ustma-ust tushadi |
| Server shu paytda o'chgan edi | Ish umuman bajarilmadi — hech kim bilmaydi |
| Ish yarmida yiqildi | Yarim ishlangan holat |

## Psevdokod: faqat bitta nusxa — taqsimlangan qulf

```text
every 5 min:
    lock = locks.acquire("cancel-unpaid-orders", ttl = 10 min)
    if not lock: return                  // boshqa server allaqachon bajaryapti
    try:
        cancelUnpaidOrders()
    finally:
        lock.release()
```

TTL — jarayon qulfni bo'shatmasdan o'lsa, qulf abadiy qolmasligi uchun. TTL ish vaqtidan uzunroq bo'lsin; juda uzoq ishlarda — qulfni vaqti-vaqti bilan uzaytirish.

Muqobil — **lider saylash**: faqat "lider" nusxa scheduler'ni ishga tushiradi (Kubernetes `CronJob`, bitta alohida scheduler konteyneri — eng oddiy yechim).

## Psevdokod: ishni idempotent va qayta boshlanadigan qilish

```text
// Yomon: "oxirgi 5 daqiqadagilar" — ish o'tkazib yuborilsa, ular abadiy qoladi
cancelOrdersPlacedBetween(now - 5min, now)

// Yaxshi: holatga asoslangan — qachon ishlasa ham to'g'ri
cancel all orders WHERE status = 'pending_payment' AND placed_at < now - 30 min
// O'tkazib yuborilsa — keyingi ishga tushishda ushlaydi; ikki marta — zarar yo'q (idempotent)
```

```text
// Katta ish — kichik bo'laklarga, navbat orqali
nightlyInvoices():
    for tenantId in tenants.ids():
        queue.dispatch(GenerateInvoices(tenantId, period = "2026-09"))
// Har bo'lak mustaqil, alohida retry, parallel worker'lar
// "2026-09 uchun tenant 42 hisobi" — tabiiy idempotentlik kaliti
```

## Psevdokod: kuzatish

```text
Har ish uchun:
  - boshlandi / tugadi / davomiyligi / qayta ishlangan yozuvlar soni — logda va metrikada
  - "heartbeat" monitoring: ish X vaqt ichida muvaffaqiyatli tugamasa → alert
    (Healthchecks.io, Cronitor yoki o'z metrikangiz: last_success_at)
```

Jim yiqiladigan cron — eng xavfli: "kunlik zaxira nusxa" 3 oy ishlamagani — kerak bo'lgan kuni ma'lum bo'ladi.

## Framework'larda

| Ehtiyoj | Symfony | Laravel |
| --- | --- | --- |
| Scheduler | Scheduler komponenti (`#[AsCronTask]`, `RecurringMessage`) — Messenger orqali — [Symfony 25-bob](../symfony/25-console-va-scheduler.md) | `Schedule` (`routes/console.php`) — [Laravel 24-bob](../laravel/24-artisan-va-konsol.md) |
| Bitta nusxa | Lock komponenti — [Symfony 28-bob](../symfony/28-cache-lock-httpclient.md) | `->onOneServer()`, `->withoutOverlapping()` |
| Navbatga bo'lish | Messenger — [26-bob](../symfony/26-messenger.md) | Queue — [Laravel 25-bob](../laravel/25-navbatlar.md) |
| Serverless / frontend platformalar | — | Next.js / Vercel Cron — [Next.js 36-bob](../nextjs/36-fon-ishlari.md) |

Laravel'ning `onOneServer()` markaziy kesh (Redis/DB) drayverini talab qiladi — lokal fayl kesh bilan ishlamaydi. Symfony'da xuddi shu — Lock uchun umumiy saqlash (Redis, DB).

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Har serverda crontab | Oddiy | Takrorlanish, ko'p nusxada noto'g'ri |
| Taqsimlangan qulf | Ko'p nusxada to'g'ri | Qulf ombori (Redis/DB) |
| Alohida scheduler jarayoni | Oddiy va aniq | Yana bir deploy birligi |
| Katta ish bitta jarayonda | Oddiy kod | Uzoq, yiqilsa — boshidan |
| Navbatga bo'laklash | Parallel, qayta boshlanadi | Ko'proq xabarlar, monitoring |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Ko'p serverda qulfsiz cron | Takroriy ta'sir | Qulf yoki bitta scheduler |
| Vaqt oynasiga asoslangan ish | O'tkazib yuborilsa — ma'lumot qoladi | Holatga asoslangan so'rov |
| Monitoring yo'q | Jim yiqilish | Heartbeat alert |
| Vaqt zonasisiz jadval | Soat o'zgarishida ikki marta yoki umuman | UTC yoki aniq zona |
| Bitta ulkan tranzaksiya | Uzoq qulflar, yiqilsa hammasi | Bo'laklar |
| Ish kodi deploy'dan keyin eski | Eski mantiq ishlaydi | Worker/scheduler restart deploy'da |

## Amaliyot

1. Barcha rejalashtirilgan ishlaringiz ro'yxati: har biri ko'p nusxada xavfsizmi?
2. Bitta vaqt oynasiga asoslangan ishni holatga asoslanganga o'tkazing.
3. Eng muhim ish uchun heartbeat monitoring qo'shing.
4. Eng uzun ishni navbat bo'laklariga bo'ling.

## Manbalar

- Martin Kleppmann — *How to do distributed locking* <https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html>
- Kubernetes — *CronJob* (`concurrencyPolicy: Forbid`)
- Healthchecks.io — cron monitoring g'oyasi
