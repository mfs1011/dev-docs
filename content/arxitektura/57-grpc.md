# 57 — gRPC va RPC uslubi

[← Oldingi: GraphQL](56-graphql.md) · [Mundarija](README.md) · [Keyingi: Versiyalash va orqaga moslik →](58-versiyalash.md)

## Tushuncha

RPC (Remote Procedure Call) — "uzoqdagi funksiyani chaqirish": resurslar o'rniga **amallar** (`CreateOrder`, `GetStock`). gRPC — Google'ning zamonaviy RPC freymvorki:

| Xususiyat | gRPC | REST/JSON |
| --- | --- | --- |
| Shartnoma | `.proto` fayl — majburiy, qat'iy tiplangan | Ixtiyoriy (OpenAPI) |
| Format | Protobuf — binar, ixcham | JSON — matn |
| Transport | HTTP/2 (multiplexing, streaming) | HTTP/1.1 yoki 2 |
| Kod generatsiyasi | Har tilga klient va server — standart | Qo'shimcha vosita |
| Streaming | Bir/ikki tomonlama oqimlar | SSE, WebSocket alohida |
| Brauzer | To'g'ridan-to'g'ri **yo'q** (gRPC-Web yoki Connect kerak) | Tabiiy |

## Nega shunday

gRPC servislar orasidagi ichki aloqa uchun yaratilgan: ko'p tilli tizim (PHP, Go, Python), yuqori chastotali chaqiruvlar, qat'iy shartnoma va tezlik. U yerda JSON'ning moslashuvchanligi kamroq qadrli, tiplangan shartnoma va samaradorlik — ko'proq.

Brauzer esa HTTP/2 trailer'lari va kadrlarini past darajada boshqarishga ruxsat bermaydi — shuning uchun brauzerdan gRPC'ga to'g'ridan-to'g'ri ulanib bo'lmaydi.

## Psevdokod: `.proto` shartnoma

```text
syntax = "proto3";
package inventory.v1;

service Inventory {
  rpc GetStock (GetStockRequest) returns (Stock);
  rpc Reserve (ReserveRequest) returns (Reservation);
  rpc WatchStock (WatchRequest) returns (stream StockChanged);    // server streaming
}

message GetStockRequest { string sku = 1; }
message Stock { string sku = 1; int32 available = 2; int32 reserved = 3; }
message ReserveRequest { string order_id = 1; repeated Line lines = 2; string idempotency_key = 3; }
```

Maydon raqamlari (`= 1`, `= 2`) — shartnomaning bir qismi: ular **hech qachon o'zgartirilmaydi va qayta ishlatilmaydi**. Maydon o'chirilsa — raqami `reserved` qilinadi. Bu protobuf'ning orqaga moslik qoidasi (58-bob).

## Psevdokod: qayerda nima

```text
Brauzer ──HTTPS/JSON (REST yoki GraphQL)──▶ BFF / API gateway ──gRPC──▶ Ordering
                                                                  ├─gRPC──▶ Inventory
                                                                  └─gRPC──▶ Pricing
Tashqi integratorlar ──REST + OpenAPI──▶ ommaviy API
```

Odatiy taqsimot: **tashqarida REST/GraphQL, ichkarida gRPC (yoki hodisalar)**. BFF (69-bob) tarjimon vazifasini bajaradi.

Brauzerdan gRPC kerak bo'lsa — **gRPC-Web** (proksi orqali, masalan Envoy) yoki **Connect** protokoli (bitta `.proto` dan gRPC, gRPC-Web va oddiy HTTP/JSON klientlari).

## Psevdokod: RPC uslubidagi HTTP API

gRPC'siz ham RPC uslubi mumkin — va ba'zan REST'dan tabiiyroq:

```text
POST /rpc/orders.cancel        { "orderId": "7f3a", "reason": "..." }
POST /rpc/reports.generate     { "period": "2026-09" }

Qachon mos: amallar resursga sig'maydi (hisobot, hisob-kitob, "barchasini qayta indekslash"),
            ichki API, bitta klient
Narx: GET keshi yo'q, idempotentlik va status kodlar — qo'lda kelishiladi
```

Ko'p real API'lar aralash: resurslar — REST, murakkab amallar — RPC uslubidagi endpoint'lar (`POST /orders/7f3a/cancel`, 55-bob).

## Framework'larda

| Tomon | Vositalar |
| --- | --- |
| PHP | `grpc` PECL kengaytmasi + protoc PHP plagini; RoadRunner gRPC server (PHP'da server tomoni uchun amaliy yo'l) |
| Go / Node / Python | Rasmiy gRPC kutubxonalari; Connect (Go, TS) |
| Brauzer | `@connectrpc/connect-web`, `grpc-web` |
| Shartnoma boshqaruvi | Buf — `.proto` lint, breaking change tekshiruvi, generatsiya |

PHP-FPM modeli (har so'rovda yangi jarayon) uzoq yashovchi gRPC serverga mos emas — shuning uchun PHP ekotizimida gRPC odatda **klient** sifatida (boshqa servisni chaqirish) yoki RoadRunner orqali ishlatiladi. Symfony/Laravel monolitlari uchun ichki aloqaning keng tarqalgan yo'li — navbat va hodisalar ([Symfony 26-bob](../symfony/26-messenger.md), [Laravel 25-bob](../laravel/25-navbatlar.md)).

## Trade-off

| Jihat | gRPC | REST/JSON | Hodisalar (navbat) |
| --- | --- | --- | --- |
| Tezlik va hajm | Eng yaxshi | Yaxshi | Asinxron |
| Shartnoma qat'iyligi | Majburiy | Ixtiyoriy | Sxema bilan |
| Brauzer | Proksi kerak | Tabiiy | Yo'q |
| Debug | Maxsus vositalar (grpcurl) | curl, brauzer | Navbat vositalari |
| Bog'lanish | Sinxron | Sinxron | Asinxron, past |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Brauzerdan to'g'ridan-to'g'ri gRPC kutish | Ishlamaydi | gRPC-Web / Connect / BFF |
| Protobuf maydon raqamini o'zgartirish | Eski klientlar noto'g'ri o'qiydi | Yangi raqam, eskisi `reserved` |
| Har narsaga gRPC | Ommaviy integratorlar uchun noqulay | Tashqarida REST |
| Sinxron gRPC zanjirlari (A→B→C→D) | Kechikish va xatolar qo'shiladi | Hodisalar, deadline/timeout (79-bob) |
| Deadline (timeout) yo'q | Osilib qolgan chaqiruvlar | Har chaqiruvga deadline |

## Amaliyot

1. Servislar orasidagi aloqangizni chizing: qaysilari sinxron, qaysilari asinxron?
2. Bitta ichki API uchun `.proto` shartnoma yozing va Buf bilan lint qiling.
3. REST API'ngizda resursga sig'maydigan amallarni toping — ular qanday ifodalangan?
4. Har sinxron ichki chaqiruvda timeout bormi?

## Manbalar

- gRPC — *Core concepts* <https://grpc.io/docs/what-is-grpc/core-concepts/>
- Protocol Buffers — *Updating a message type* <https://protobuf.dev/programming-guides/proto3/#updating>
- Connect <https://connectrpc.com>, Buf <https://buf.build>
