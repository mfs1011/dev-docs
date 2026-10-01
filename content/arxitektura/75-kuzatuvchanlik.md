# 75 — Kuzatuvchanlik

[← Oldingi: Monorepo va kod ulashish](74-monorepo.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik arxitekturasi →](76-xavfsizlik-arxitekturasi.md)

## Tushuncha

Kuzatuvchanlik (observability) — tizimning tashqi signallariga qarab **ichida nima bo'layotganini** tushuna olish, oldindan kutilmagan savollarga ham javob topish. Monitoring "ma'lum muammolar" haqida ogohlantiradi; kuzatuvchanlik "nega" degan savolga javob beradi.

Uch asosiy signal:

| Signal | Nima | Savol | Misol |
| --- | --- | --- | --- |
| **Loglar** | Hodisa yozuvlari | "Nima bo'ldi?" | `order.placed orderId=7f3a total=890000 userId=7` |
| **Metrikalar** | Vaqt bo'yicha raqamlar | "Qancha? Qanchalik tez?" | `http_requests_total`, p95 latency, navbat uzunligi |
| **Trace'lar** | So'rovning tizim bo'ylab yo'li | "Vaqt qayerda ketdi?" | Brauzer → BFF → Ordering → DB → Payment |

## Nega shunday

Taqsimlangan tizimda (va hatto monolitda ham) muammo ko'pincha bitta joyda **ko'rinmaydi**:

```text
Foydalanuvchi: "Checkout sekin"
Loglar:        har serverda o'z logi, bog'lanmagan
Metrikalar:    o'rtacha javob vaqti — normal (sekinlar — 2% foydalanuvchida)
Trace:         checkout → payment servis → tashqi provayder 4.2 soniya ← mana sabab
```

Kuzatuvchanliksiz — taxmin va "bizda ishlayapti". Kuzatuvchanlik bilan — dalil.

## Psevdokod: strukturalangan loglar

```text
// Yomon: matn
log("Order 7f3a placed by user 7, total 890000")        // qidirish, filtrlash, agregatsiya qiyin

// Yaxshi: tuzilma (JSON)
log.info("order.placed", {
  orderId: "7f3a", userId: 7, totalMinor: 890000, currency: "UZS",
  traceId: "4bf92f35…", service: "ordering", version: "2.14.0", env: "production"
})

Qoidalar:
  - hodisa nomi barqaror ("order.placed"), matn emas
  - har yozuvda traceId, service, version
  - darajalar: error (kimdir harakat qilishi kerak), warn, info (biznes hodisalari), debug (production'da o'chiq)
  - HECH QACHON: parol, token, karta raqami, to'liq shaxsiy ma'lumot (maskalash, 31-bob)
```

## Psevdokod: korrelyatsiya — uchala qatlam bo'ylab

```text
Brauzer:   traceparent: 00-4bf92f35…-00f067aa…-01   (W3C Trace Context) — fetch'ga qo'shiladi
BFF:       sarlavhani o'qiydi → o'z span'i → keyingi chaqiruvlarga uzatadi
Servislar: xuddi shu → navbat xabarlariga ham traceId (27-bob: correlationId)
Loglar:    har yozuvda traceId
Xato UI'da: "Xato kodi: 4bf92f35" (59-bob) → support logda bir qidiruv bilan topadi
```

Frontend'dan backend'gacha **bitta ID** — frontend xatosi (48-bob) va backend logi bir-biriga bog'lanadi.

## Psevdokod: nimani o'lchash — RED va USE

```text
RED (har servis/endpoint uchun):
  Rate      — so'rovlar soni
  Errors    — xatolar ulushi (5xx, va biznes xatolari alohida)
  Duration  — javob vaqti: p50, p95, p99 (o'rtacha EMAS — u sekinlarni yashiradi)

USE (har resurs uchun: CPU, xotira, DB pool, navbat):
  Utilization — bandlik
  Saturation  — navbat, kutish
  Errors

Biznes metrikalari:  buyurtmalar/daqiqa, checkout konversiyasi, to'lov muvaffaqiyati
  → texnik metrikalar normal, lekin buyurtmalar 0 — eng muhim alert
```

## Psevdokod: alertlar

```text
Yaxshi alert:  foydalanuvchiga ta'sir qiladi + harakat talab qiladi + aniq
  "checkout xatolari 5 daqiqada > 2% (SLO buzilish tezligi)" → runbook havolasi
Yomon alert:   "CPU > 80%" (o'zi muammo emas), har 5xx'ga xabar, kunlik 50 ta e'tiborsiz xabar

Qoida: alertga e'tibor bermaslik odat bo'lib qolsa — u alert emas, shovqin. SLO asosidagi alertlar (79-bob).
```

## Framework'larda

| Qatlam | Vositalar | Qayerda |
| --- | --- | --- |
| Backend loglar | Monolog — Symfony/Laravel | [Symfony 24](../symfony/24-xatolik-va-log.md), [Laravel 23-bob](../laravel/23-xatoliklar-va-loglar.md) |
| Trace standarti | OpenTelemetry (PHP, JS SDK) — vendordan mustaqil | — |
| Frontend xatolari va RUM | Sentry, `web-vitals` | [Arxitektura 48-bob](48-frontend-xatolari.md), [Angular 74-bob](../angular/74-unumdorlik.md) |
| Monitoring | Prometheus + Grafana, Loki, Tempo / Jaeger; SaaS: Datadog, New Relic, Grafana Cloud | — |
| Frontend monitoring | — | [Vue 68](../vue/68-monitoring-va-xatolar.md), [Next.js 49](../nextjs/49-monitoring.md), [React 48-bob](../react/48-deploy-va-monitoring.md) |

OpenTelemetry — tavsiya etiladigan asos: kod bir marta instrumentatsiya qilinadi, keyin backend (Jaeger, Grafana, Datadog) almashtirilishi mumkin.

## Trade-off

| Qaror | Yutuq | Narx |
| --- | --- | --- |
| Hamma narsani loglash | Hech narsa yo'qolmaydi | Saqlash narxi, shovqin, shaxsiy ma'lumot xavfi |
| Sampling (trace'larning 10%) | Arzon | Kam uchraydigan muammo o'tib ketishi mumkin (xatolarni 100% saqlash) |
| SaaS monitoring | Tez, ops yo'q | Narx hajm bilan o'sadi, ma'lumot tashqarida |
| O'z stack (Grafana/Loki/Tempo) | Nazorat, arzonroq katta hajmda | Ops yuki |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Matnli loglar | Qidiruv va agregatsiya qiyin | Strukturalangan (JSON) |
| traceId yo'q | Xizmatlararo bog'lab bo'lmaydi | W3C Trace Context hamma joyda |
| O'rtacha javob vaqti | Sekin 5% yashirinadi | p95/p99 |
| Logda token/parol | Sizib chiqish | Maskalash, `beforeSend` filtrlari |
| Shovqinli alertlar | E'tiborsiz qoldiriladi | SLO asosida, harakat talab qiladiganlari |
| Biznes metrikasi yo'q | "Hamma narsa yashil", lekin sotuv 0 | Biznes alertlari |

## Amaliyot

1. Bitta foydalanuvchi so'rovini brauzerdan DB'gacha kuzata olasizmi? Qayerda zanjir uziladi?
2. Loglaringizni JSON formatiga va har yozuvda traceId bo'ladigan qilib o'tkazing.
3. Eng muhim endpoint uchun RED metrikalarini (p95 bilan) dashboard'ga chiqaring.
4. Bitta biznes metrikasiga alert qo'ying (masalan, "10 daqiqada 0 ta buyurtma").

## Manbalar

- OpenTelemetry <https://opentelemetry.io/docs/>
- Charity Majors va boshq. — *Observability Engineering*
- Google SRE Book — *Monitoring Distributed Systems* <https://sre.google/sre-book/monitoring-distributed-systems/>
