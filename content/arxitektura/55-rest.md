# 55 — REST dizayni

[← Oldingi: Shartnoma birinchi: OpenAPI va kod generatsiyasi](54-openapi.md) · [Mundarija](README.md) · [Keyingi: GraphQL →](56-graphql.md)

## Tushuncha

REST — HTTP'ning o'z imkoniyatlaridan (URL, metodlar, status kodlar, sarlavhalar, kesh) to'g'ri foydalanib API qurish uslubi. Asosiy g'oya: **resurslar** (otlar) va ular ustidagi **standart amallar** (metodlar).

| Metod | Ma'no | Xavfsiz | Idempotent |
| --- | --- | --- | --- |
| `GET` | O'qish | ✅ | ✅ |
| `POST` | Yaratish / amal | ❌ | ❌ (Idempotency-Key bilan — ha) |
| `PUT` | To'liq almashtirish | ❌ | ✅ |
| `PATCH` | Qisman o'zgartirish | ❌ | odatda ❌ |
| `DELETE` | O'chirish | ❌ | ✅ |

"Xavfsiz" — server holatini o'zgartirmaydi; "idempotent" — bir marta yoki o'n marta bajarilsa natija bir xil. Bu xususiyatlar retry (17-bob), kesh va proksilar uchun muhim.

## Nega shunday

HTTP semantikasidan to'g'ri foydalangan API'da ko'p narsa **bepul** ishlaydi: brauzer va CDN keshi (`GET`), xavfsiz qayta urinish (idempotent metodlar), monitoring (status kodlar bo'yicha), standart vositalar. Hammasini `POST /api` ga yuborish (RPC uslubi) — bularning hammasidan voz kechish.

## Psevdokod: resurslar va URL'lar

```text
GET    /orders                 ro'yxat (filtr, sahifa — query'da, 66-bob)
POST   /orders                 yaratish → 201 Created + Location: /orders/7f3a
GET    /orders/7f3a            bitta
PATCH  /orders/7f3a            qisman yangilash
DELETE /orders/7f3a            o'chirish → 204 No Content
GET    /orders/7f3a/lines      ichki resurs (bir daraja — chuqurroq emas)

Amallar (CRUD'ga sig'maydigan) — sub-resurs yoki "buyruq" resurs sifatida:
POST   /orders/7f3a/cancel     (yoki PATCH /orders/7f3a { status: "cancelled" })
POST   /orders/7f3a/payments   to'lov yaratish

Qoidalar: ko'plik otlar, kebab-case, fe'l URL'da emas (/getOrders ❌), bir xil uslub hamma joyda
```

## Psevdokod: status kodlar — kerakli to'plam

```text
2xx  200 OK              GET, PATCH javobi
     201 Created         POST yaratdi (Location sarlavhasi bilan)
     202 Accepted        navbatga qo'yildi, natija keyin (26-bob)
     204 No Content      DELETE, javob tanasiz
3xx  304 Not Modified    ETag mos keldi (65-bob)
4xx  400 Bad Request     so'rov shakli noto'g'ri (JSON buzuq)
     401 Unauthorized    autentifikatsiya yo'q/eskirgan
     403 Forbidden       ma'lum foydalanuvchi, ruxsat yo'q
     404 Not Found       resurs yo'q (yoki ruxsatsiz — mavjudligini oshkor qilmaslik uchun)
     409 Conflict        holat ziddiyati (versiya, "omborda yo'q")
     412 Precondition Failed   If-Match mos kelmadi (optimistik qulf, 24-bob)
     422 Unprocessable   validatsiya xatolari (maydonlar bo'yicha)
     429 Too Many Requests     (67-bob)
5xx  500 / 502 / 503 / 504   server tomoni — klient retry qilishi mumkin (vaqtinchalik bo'lsa)
```

Ikki keng tarqalgan xato: hamma narsaga `200` + tanada `{ success: false }` (monitoring, kesh, retry ko'r bo'ladi) va hamma xatoga `500` (klient biznes xatosini ajrata olmaydi).

## Psevdokod: xato formati — RFC 9457

```text
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "type": "https://api.shop.uz/problems/out-of-stock",
  "title": "Mahsulot yetarli emas",
  "status": 409,
  "detail": "Omborda faqat 1 dona qoldi",
  "instance": "/orders/7f3a",
  "sku": "NK-42",
  "available": 1
}
```

`type` — barqaror, mashina o'qiydigan kod (frontend shunga qarab xabar tanlaydi, 59-bob); `detail` — inson uchun; qo'shimcha maydonlar — kontekst.

## Psevdokod: javob shakli izchilligi

```text
Bitta resurs:   { "id": "...", "status": "...", ... }                (o'ram yo'q yoki hamma joyda bir xil o'ram)
Ro'yxat:        { "items": [...], "nextCursor": "...", "total": 1842 }   (66-bob)
Sana:           ISO 8601, UTC: "2026-10-01T09:30:00Z"
Pul:            { "amount": 890000, "currency": "UZS" }  — butun son (tiyin), float emas
ID:             satr (UUID) — JavaScript number aniqligi chegarasidan qo'rqmaslik
Nomlash:        camelCase YOKI snake_case — bittasi, hamma joyda
```

## Framework'larda

| Mavzu | Symfony | Laravel | Frontend |
| --- | --- | --- | --- |
| REST endpoint'lar | [Symfony 21-bob](../symfony/21-rest-api.md), API Platform — [38](../symfony/38-api-pro.md) | API Resource'lar — [Laravel 20](../laravel/20-api-resurslar.md), amaliy API — [31-bob](../laravel/31-amaliy-loyiha-api.md) | — |
| Problem details | `ProblemNormalizer` / API Platform sukut | Exception handler'da qo'lda | Problem `type` bo'yicha xabar — [Angular 57-bob](../angular/57-http-xatolar.md) |
| 201 + Location | `#[Route]` + `JsonResponse` | `response()->json(..., 201)` | — |
| Next.js route handler'lar | — | — | [Next.js 15-bob](../nextjs/15-route-handlers.md) |

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Toza REST | HTTP keshi, standart vositalar, tushunarli | Ba'zi amallar CRUD'ga sig'maydi; ko'p so'rov (overfetching/underfetching) |
| RPC uslubi (`POST /api/doSomething`) | Amallar uchun tabiiy | Kesh, idempotentlik, monitoring — qo'lda |
| HATEOAS (havolalar javobda) | Klient URL'larni bilmaydi | Amalda kam qo'llaniladi, murakkab |
| GraphQL / gRPC | Boshqa muammolarni yechadi (56–57) | Boshqa narxlar |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `200` + `{ success: false }` | Monitoring va retry ko'r | To'g'ri status kod |
| URL'da fe'llar (`/createOrder`) | Uslub tartibsiz | Resurs + metod |
| `GET` bilan holat o'zgartirish | Kesh/prefetch tasodifan amal bajaradi | Faqat `POST/PATCH/DELETE` |
| Pul `float` | Yaxlitlash xatolari | Butun son + valyuta |
| Sana vaqt zonasisiz | Soatlar chalkashadi | ISO 8601 UTC |
| Har endpoint o'z xato formati | Frontend har birini alohida ishlaydi | RFC 9457 hamma joyda |

## Amaliyot

1. API'ingizdagi barcha endpoint'larni ro'yxatlang: fe'lli URL'lar va `GET` bilan o'zgarish bormi?
2. Xato javoblarini RFC 9457 formatiga o'tkazing.
3. `200 + success:false` qaytaradigan joylarni to'g'ri status kodga almashtiring.
4. Pul va sana formatlarini butun API bo'ylab bir xil qiling.

## Manbalar

- RFC 9110 — *HTTP Semantics* <https://www.rfc-editor.org/rfc/rfc9110>
- RFC 9457 — *Problem Details for HTTP APIs* <https://www.rfc-editor.org/rfc/rfc9457>
- Zalando — *RESTful API Guidelines* <https://opensource.zalando.com/restful-api-guidelines/>
