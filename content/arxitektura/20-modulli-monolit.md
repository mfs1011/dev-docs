# 20 — Modulli monolit

[← Oldingi: Monolit: to'g'ri qilingan](19-monolit.md) · [Mundarija](README.md) · [Keyingi: Mikroservislar: narx va foyda →](21-mikroservislar.md)

## Tushuncha

Modulli monolit — **bitta deploy**, lekin ichida **qat'iy chegarali modullar**. Har modul — kichik "servis" kabi: o'z ochiq API'si, o'z ma'lumotlari, o'z ichki tuzilishi. Lekin ular tarmoq emas, funksiya chaqiruvi orqali gaplashadi.

```text
┌───────────────────────── bitta deploy ─────────────────────────┐
│  ┌──────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐ │
│  │ Catalog  │     │ Ordering │     │ Billing  │    │ Identity │ │
│  │ API ▲    │◀────│ API ▲    │────▶│ API ▲    │    │ API ▲    │ │
│  │ ichki    │     │ ichki    │     │ ichki    │    │ ichki    │ │
│  └────┬─────┘     └────┬─────┘     └────┬─────┘    └────┬─────┘ │
│       ▼                ▼                ▼               ▼       │
│  catalog_*        ordering_*       billing_*       identity_*    │ ← jadvallar egasi bo'yicha
└──────────────────────── bitta DB (sxema/prefiks) ───────────────┘
```

Bu — monolitning oddiyligi va mikroservislarning izolyatsiyasi o'rtasidagi eng muvozanatli nuqta.

## Nega shunday

Mikroservislardan kutilgan foydalarning ko'pi aslida **chegaralardan** keladi, tarmoqdan emas:

| Foyda | Chegara beradi | Tarmoq beradi |
| --- | --- | --- |
| Jamoalar mustaqil ishlaydi | ✅ | |
| Modul ichini erkin o'zgartirish | ✅ | |
| Kodni tushunish oson | ✅ | |
| Mustaqil deploy | | ✅ |
| Mustaqil masshtab | | ✅ |
| Texnologiya erkinligi | | ✅ |
| Xato izolyatsiyasi | qisman | ✅ |

Birinchi uchtasi — ko'p jamoalar uchun asosiy. Modulli monolit ularni tarmoq narxisiz beradi. Keyinchalik biror modul haqiqatan alohida masshtab yoki deploy talab qilsa — u tayyor chegara bo'ylab ajratiladi.

## Psevdokod: modul shartnomasi

```text
module Ordering
  public API (Ordering/Api):
    placeOrder(cmd) -> Result<OrderId, PlaceOrderError>
    getOrder(id) -> OrderView
  publishes events:
    OrderPlaced { orderId, customerId, total }
    OrderCancelled { orderId, reason }
  depends on:
    Catalog.Api.getPrices(skus)         // sinxron — narx kerak hozir
    listens: Billing.PaymentSucceeded   // asinxron — hodisa orqali
  owns tables:
    ordering_orders, ordering_order_lines
```

Qoidalar:

```text
1. Modul faqat boshqa modulning Api/ va hodisalariga murojaat qiladi
2. Modul faqat o'z jadvallariga yozadi — boshqa modul jadvaliga JOIN ham yo'q
3. Modullararo sinxron chaqiruv — kam; ko'proq hodisa
4. Qoidalar CI'da tekshiriladi (Deptrac, ArchUnit, ESLint boundaries)
```

2-qoida eng qiyin va eng muhim: boshqa modul jadvaliga `JOIN` — keyinchalik ajratishni imkonsiz qiladi. Hisobot uchun ma'lumot kerak bo'lsa — hodisalar asosida o'z o'qish modelini yig'ing (28-bob) yoki alohida hisobot moduli.

## Psevdokod: modullararo hodisalar — jarayon ichida

```text
// Tranzaksiya ichida saqlash + hodisani "outbox"ga yozish
transaction:
    orders.save(order)
    outbox.add(OrderPlaced(order.id))
// Tranzaksiyadan keyin: dispetcher outbox'dan o'qib, tinglovchilarga beradi
// Keyinchalik modul servisga aylansa — o'sha outbox tashqi brokerga (Kafka/RabbitMQ) yuboriladi
```

Boshidanoq outbox bilan yozish — ajratish kuni hodisalar kodi o'zgarmaydi (27-bob).

## Framework'larda

| Stack | Modul shakli | Chegara tekshiruvi |
| --- | --- | --- |
| Symfony | `src/<Modul>/` namespace + har modul o'z `services.yaml`/konfiguratsiyasi; Messenger — modullararo hodisalar; Doctrine — har modul o'z entity manager'i yoki jadval prefiksi | Deptrac — [Symfony 39-bob](../symfony/39-arxitektura.md) |
| Laravel | `app/Modules/<Modul>/` yoki `modules/` + har modul o'z service provider'i | Deptrac, PHPStan qoidalari — [Laravel 6-bob](../laravel/06-service-provider.md) |
| Frontend | `features/` + ochiq `index.ts`; lazy marshrutlar — bundle darajasida ham chegara | ESLint boundaries, FSD — [Angular 78-bob](../angular/78-amaliy-loyiha.md) |

Frontend va backend modullari **bir-biriga mos** bo'lsa (backend `Ordering` ↔ frontend `features/checkout` + `entities/order`) — jamoalar va kod navigatsiyasi osonlashadi, API chegaralari ham tabiiy bo'ladi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Oddiy monolit | Eng tez boshlash | Chegaralar vaqt o'tishi bilan eriydi |
| Modulli monolit | Izolyatsiya, oddiy deploy, kelajakka tayyor | Qoidalarni majburlash intizomi, modullararo JOIN taqiqi noqulay |
| Mikroservislar | Mustaqil deploy/masshtab | Taqsimlangan tizim narxi |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Modullararo `JOIN` | Ajratib bo'lmaydigan bog'lanish | API yoki o'qish modeli |
| Modullar texnik qatlam bo'yicha | Chegara domen emas | Biznes imkoniyati bo'yicha (4, 14-boblar) |
| `Shared` modul biznes kodi bilan | Yashirin markaz | Faqat biznesdan xabarsiz |
| Chegaralar faqat kelishuvda | Oylar ichida buziladi | CI tekshiruvi |
| Har modulni "mikroservis kabi" ortiqcha marosim bilan | Tarmoqsiz ham ortiqcha DTO/xaritalash | Oqilona: ichki chaqiruv oddiy funksiya |

## Amaliyot

1. Loyihangiz uchun modullar ro'yxati va har birining jadvallari egaligini yozing.
2. Modullararo `JOIN` larni qidiring — nechta?
3. Bitta modul uchun `Api/` ochiq qismini ajrating va Deptrac bilan qoida qo'shing.
4. Bitta sinxron modullararo chaqiruvni hodisaga almashtirish kerakmi — asoslang.

## Manbalar

- Kamil Grzybek — *Modular Monolith* seriyasi <https://www.kamilgrzybek.com/blog/series/modular-monolith>
- Simon Brown — *Modular monoliths* (GOTO talk)
- Oliver Drotbohm — Spring Modulith hujjati (til-neytral g'oyalar)
