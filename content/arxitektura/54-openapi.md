# 54 — Shartnoma birinchi: OpenAPI va kod generatsiyasi

[← Oldingi: API shartnomasi kimniki](53-api-shartnoma.md) · [Mundarija](README.md) · [Keyingi: REST dizayni →](55-rest.md)

## Tushuncha

OpenAPI (avvalgi nomi Swagger) — HTTP API'ni mashina o'qiy oladigan formatda (YAML/JSON) tasvirlash standarti. Bitta sxemadan ko'p narsa olinadi:

```text
                   ┌──▶ Hujjat (Swagger UI, Redoc, Scalar)
                   ├──▶ Frontend tiplari va klient (openapi-typescript, orval)
openapi.yaml ──────┼──▶ Backend validatsiya / DTO tekshiruvi
                   ├──▶ Mock server (Prism) — backend tayyor bo'lmasa ham frontend ishlaydi
                   └──▶ Kontrakt testlar — javoblar sxemaga mosmi
```

Ikki yo'nalish:

| Yo'nalish | Qanday | Qachon |
| --- | --- | --- |
| **Code-first** | Kod (atributlar, DTO) yoziladi → sxema generatsiya | Backend yetakchi, sxema "hujjat" sifatida |
| **Contract-first** (schema-first) | Sxema avval yoziladi → kod unga moslanadi/generatsiya | Ikki jamoa parallel, shartnoma — markaz |

## Nega shunday

Frontend tiplari qo'lda yozilsa, ular backend bilan **drift** qiladi — vaqt o'tishi bilan sezilmay ajraladi:

```text
// frontend/types.ts — 6 oy oldin yozilgan
interface Order { id: number; status: string; total: number }

// backend hozir qaytaradi
{ "id": "7f3a…", "status": "pending_payment", "total": { "amount": 890000, "currency": "UZS" } }
// TypeScript jim: tip — va'da, tekshiruv emas
```

Sxemadan generatsiya qilingan tiplar bilan backend o'zgarishi **frontend build'ini buzadi** — production emas, CI.

## Psevdokod: sxema

```text
openapi: 3.1.0
paths:
  /orders:
    post:
      operationId: createOrder
      requestBody:
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateOrder' }
      responses:
        '201': { content: { application/json: { schema: { $ref: '#/components/schemas/Order' } } } }
        '422': { content: { application/problem+json: { schema: { $ref: '#/components/schemas/ValidationProblem' } } } }
components:
  schemas:
    Money:  { type: object, required: [amount, currency], properties: { amount: { type: integer }, currency: { enum: [UZS, USD] } } }
    Order:  { type: object, required: [id, status, total], properties: { id: { type: string, format: uuid }, status: { $ref: '#/components/schemas/OrderStatus' }, total: { $ref: '#/components/schemas/Money' } } }
```

## Psevdokod: pipeline

```text
1. openapi.yaml o'zgaradi (PR)
2. CI:
   - sxema lint (Spectral): nomlash, xato formati, har endpoint'da 4xx tavsifi
   - breaking change tekshiruvi (oasdiff): v1 bilan solishtirish → breaking bo'lsa — PR'da ogohlantirish
   - backend: javoblar sxemaga mosligini API testlarida tekshirish (35-bob)
   - frontend: tiplarni generatsiya → typecheck
3. Merge → hujjat avtomatik yangilanadi
```

```text
// Frontend: generatsiya qilingan tiplar bilan
import type { components, paths } from './api/schema'      // openapi-typescript
type Order = components['schemas']['Order']

const res = await client.POST('/orders', { body: { items } })   // openapi-fetch: URL, body, javob — tipli
if (res.error) handleProblem(res.error)                         // 422/409 tiplari ham sxemadan
```

## Framework'larda

| Tomon | Vosita | Qayerda |
| --- | --- | --- |
| Symfony | API Platform (code-first, OpenAPI avtomatik), NelmioApiDocBundle | [Symfony 38-bob](../symfony/38-api-pro.md) |
| Laravel | Scramble (kod asosida avtomatik), L5-Swagger (atributlar) | [Laravel 20-bob](../laravel/20-api-resurslar.md) |
| TypeScript | `openapi-typescript` + `openapi-fetch`, Orval (TanStack Query/Angular xizmatlari generatsiyasi), `@hey-api/openapi-ts` | — |
| Runtime parse | Sxemadan Zod generatsiya (orval, `openapi-zod-client`) | [Angular 57-bob](../angular/57-http-xatolar.md) (Zod `parse`) |
| Mock | Prism, MSW + generatsiya qilingan handler'lar | (52-bob) |

Generatsiya qilingan klient **qatlam** bo'lib qoladi: komponentlar uni to'g'ridan-to'g'ri emas, ma'lumot qatlami orqali ishlatadi (42-bob). Generator almashsa — faqat bitta qatlam o'zgaradi.

## Trade-off

| Yondashuv | Yutuq | Narx |
| --- | --- | --- |
| Qo'lda tiplar | Hech qanday vosita kerak emas | Drift, production'da topiladi |
| Code-first | Backend kodi bilan sinxron, kam qo'shimcha ish | Sxema sifati — atributlar sifatiga bog'liq; frontend kutadi |
| Contract-first | Parallel ishlash, aniq kelishuv | Sxemani qo'lda saqlash, kod bilan moslikni tekshirish |
| To'liq klient generatsiyasi | Kam qo'l kodi | Generator cheklovlari, katta generatsiya qilingan kod |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Sxema faqat hujjat uchun, tekshirilmaydi | Kod bilan ajraladi | CI'da javoblarni sxemaga solishtirish |
| Xato javoblari sxemada yo'q | Frontend xatolarni tiplay olmaydi | Har endpoint'da 4xx sxemalari |
| Breaking change aniqlanmaydi | Klientlar buziladi | `oasdiff` CI'da |
| Generatsiya qilingan kod qo'lda tahrirlanadi | Keyingi generatsiyada yo'qoladi | Generatsiya — faqat chiqish, ustiga o'z qatlamingiz |
| `any` / `additionalProperties: true` hamma joyda | Tiplar ma'nosiz | Aniq sxemalar |

## Amaliyot

1. Backend'ingizdan OpenAPI sxemasini oling (yoki generatsiya qiling) va Spectral bilan lint qiling.
2. `openapi-typescript` bilan frontend tiplarini generatsiya qiling va qo'lda yozilganlari bilan solishtiring — nechta farq?
3. CI'ga `oasdiff` breaking change tekshiruvini qo'shing.
4. Prism bilan mock server ko'tarib, frontend'ni backend'siz ishga tushiring.

## Manbalar

- OpenAPI Specification <https://spec.openapis.org/oas/latest.html>
- openapi-typescript <https://openapi-ts.dev>
- oasdiff <https://github.com/oasdiff/oasdiff>, Spectral <https://github.com/stoplightio/spectral>
