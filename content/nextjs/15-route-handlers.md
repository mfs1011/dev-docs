# 15 — Route Handlers

[← Oldingi: Middleware](14-middleware.md) · [Mundarija](README.md) · [Keyingi: Server Components →](16-server-components.md)

## Tushuncha

Route Handler — `app/` ichidagi **HTTP endpoint**. U `route.ts` faylida yashaydi va standart Web API'lariga (`Request`, `Response`) tayanadi.

```
app/api/
├── health/route.ts             → GET /api/health
├── products/
│   ├── route.ts                → GET, POST /api/products
│   └── [id]/route.ts           → GET, PATCH, DELETE /api/products/:id
└── webhooks/stripe/route.ts    → POST /api/webhooks/stripe
```

**Muhim:** bitta papkada `page.tsx` va `route.ts` birga bo'la olmaydi — ular bir xil URL'ni da'vo qiladi.

## Kod: asosiy shakl

::: ts
```ts
// app/api/products/route.ts
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const products = await db.product.findMany({ skip: (page - 1) * 20, take: 20 })

  return NextResponse.json({ items: products, page })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const product = await db.product.create({ data: body })

  return NextResponse.json(product, { status: 201 })
}
```
:::

::: js
```js
// app/api/products/route.js
import { NextResponse } from 'next/server'

export async function GET(request) {
  const page = Number(request.nextUrl.searchParams.get('page') ?? 1)
  const products = await db.product.findMany({ skip: (page - 1) * 20, take: 20 })

  return NextResponse.json({ items: products, page })
}

export async function POST(request) {
  const body = await request.json()
  const product = await db.product.create({ data: body })

  return NextResponse.json(product, { status: 201 })
}
```
:::

Qo'llab-quvvatlanadigan metodlar: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS`.

## Kod: validatsiya va xato formati

::: ts
```ts
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(3),
  price: z.number().int().positive(),
  categoryId: z.number().int(),
})

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  }

  if (!user.roles.includes('admin')) {
    return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 403 })
  }

  let raw: unknown

  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ message: 'JSON noto\'g\'ri' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validatsiya xatosi', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const product = await db.product.create({ data: parsed.data })

  return NextResponse.json(product, { status: 201 })
}
```
:::

::: js
```js
import { z } from 'zod'

const createSchema = z.object({
  title: z.string().min(3),
  price: z.number().int().positive(),
  categoryId: z.number().int(),
})

export async function POST(request) {
  const user = await getCurrentUser()

  if (!user) return NextResponse.json({ message: 'Avtorizatsiya kerak' }, { status: 401 })
  if (!user.roles.includes('admin')) return NextResponse.json({ message: 'Ruxsat yo\'q' }, { status: 403 })

  let raw

  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ message: 'JSON noto\'g\'ri' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(raw)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Validatsiya xatosi', errors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const product = await db.product.create({ data: parsed.data })

  return NextResponse.json(product, { status: 201 })
}
```
:::

Xato formati **butun API bo'ylab bir xil** bo'lsin — klient uni bir joyda ishlaydi (React qo'llanmasi, 31-bob; bu qo'llanmada 49-bob).

## Kod: dinamik segmentlar

::: ts
```ts
// app/api/products/[id]/route.ts
type Params = { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id: Number(id) } })

  if (!product) {
    return NextResponse.json({ message: 'Topilmadi' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params

  await db.product.delete({ where: { id: Number(id) } })

  return new NextResponse(null, { status: 204 })
}
```
:::

::: js
```js
// app/api/products/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id: Number(id) } })

  if (!product) return NextResponse.json({ message: 'Topilmadi' }, { status: 404 })

  return NextResponse.json(product)
}

export async function DELETE(request, { params }) {
  const { id } = await params

  await db.product.delete({ where: { id: Number(id) } })

  return new NextResponse(null, { status: 204 })
}
```
:::

## Kod: kesh xatti-harakati

Route Handler'lar **standart holda keshlanmaydi** (Next 15+). Keshlash uchun aniq belgilash kerak:

::: ts
```ts
// Statik (build vaqtida bir marta)
export const dynamic = 'force-static'

// ISR
export const revalidate = 3600

// Har doim dinamik (standart)
export const dynamic = 'force-dynamic'

// Javob sarlavhalari bilan
export async function GET() {
  const data = await getRates()

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' },
  })
}
```
:::

::: js
```js
export const revalidate = 3600

export async function GET() {
  const data = await getRates()

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800' },
  })
}
```
:::

`request` obyektini ishlatish (cookie, sarlavha, `searchParams`) handler'ni avtomatik dinamik qiladi (18-bob).

## Kod: webhook

::: ts
```ts
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()              // JSON emas — imzo uchun xom matn kerak
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ message: 'Imzo yo\'q' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    return NextResponse.json({ message: 'Imzo noto\'g\'ri' }, { status: 400 })
  }

  // Idempotentlik: bir xil hodisa ikki marta kelishi mumkin (59-bob)
  const existing = await db.webhookEvent.findUnique({ where: { id: event.id } })

  if (existing) return NextResponse.json({ received: true })

  await db.webhookEvent.create({ data: { id: event.id, type: event.type } })

  switch (event.type) {
    case 'checkout.session.completed':
      await fulfillOrder(event.data.object)
      break
  }

  return NextResponse.json({ received: true })
}
```
:::

::: js
```js
// app/api/webhooks/stripe/route.js
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return NextResponse.json({ message: 'Imzo noto\'g\'ri' }, { status: 400 })
  }

  const existing = await db.webhookEvent.findUnique({ where: { id: event.id } })

  if (existing) return NextResponse.json({ received: true })

  await db.webhookEvent.create({ data: { id: event.id, type: event.type } })

  if (event.type === 'checkout.session.completed') await fulfillOrder(event.data.object)

  return NextResponse.json({ received: true })
}
```
:::

Uch qoida (35, 59-bob): **xom tanani o'qish**, **imzoni tekshirish**, **idempotentlik**.

## Kod: fayl yuklash

::: ts
```ts
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Fayl yo\'q' }, { status: 400 })
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ message: 'Fayl 5 MB dan katta' }, { status: 413 })
  }

  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return NextResponse.json({ message: 'Faqat rasm' }, { status: 415 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToStorage(buffer, file.name, file.type)

  return NextResponse.json({ url }, { status: 201 })
}
```
:::

::: js
```js
export async function POST(request) {
  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || typeof file === 'string') return NextResponse.json({ message: 'Fayl yo\'q' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ message: 'Fayl 5 MB dan katta' }, { status: 413 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const url = await uploadToStorage(buffer, file.name, file.type)

  return NextResponse.json({ url }, { status: 201 })
}
```
:::

Katta fayllar uchun **presigned URL** naqshi afzal — fayl serveringizdan o'tmaydi (34-bob).

## Kod: streaming javob

::: ts
```ts
// SSE (Server-Sent Events) — 37-bob
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: i * 10 })}\n\n`))
        await new Promise((r) => setTimeout(r, 1000))
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
```
:::

::: js
```js
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: i * 10 })}\n\n`))
        await new Promise((r) => setTimeout(r, 1000))
      }

      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
```
:::

## Kod: CORS

::: ts
```ts
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.example.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  })
}
```
:::

::: js
```js
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://app.example.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
```
:::

`Allow-Origin: *` va `Allow-Credentials: true` **birga ishlamaydi** — aniq domen yozing (45-bob).

## Muhandislik nuqtai nazari: Route Handler yoki Server Action

Next'da mutatsiya uchun ikki yo'l bor (21-bob):

| Ehtiyoj | Route Handler | Server Action |
| --- | --- | --- |
| Ilova ichidagi forma | ❌ Ortiqcha | ✅ |
| Mobil ilova / tashqi klient | ✅ | ❌ (ichki API) |
| Webhook | ✅ | ❌ |
| Ommaviy API | ✅ | ❌ |
| Fayl yuklash | ✅ yoki ✅ | Ikkalasi ham |
| Cron/scheduled | ✅ | ❌ |
| Streaming (SSE) | ✅ | ❌ |
| OAuth callback | ✅ | ❌ |

Qoida: **ilova ichidagi mutatsiyalar — Server Action; tashqi dunyo bilan aloqa — Route Handler.**

## Muhandislik nuqtai nazari: `/api` papkasi kerakmi

App Router'da ma'lumot **server komponentda to'g'ridan-to'g'ri** olinadi (16, 17-bob), shuning uchun o'z frontendingiz uchun API qatlami ko'pincha **kerak emas**:

```tsx
// ✗ Keraksiz qatlam
const res = await fetch('http://localhost:3000/api/products')
const products = await res.json()

// ✓ To'g'ridan-to'g'ri
const products = await db.product.findMany()
```

Route Handler kerak bo'ladigan holatlar: mobil ilova, tashqi integratsiya, webhook, ommaviy API, tashqi API'ga proksi (sirlarni yashirish uchun, 29-bob).

## Muhandislik nuqtai nazari: runtime tanlash

```ts
export const runtime = 'nodejs'     // standart: to'liq Node API
export const runtime = 'edge'       // yengil, tez ishga tushadi, cheklangan
```

| | Node | Edge |
| --- | --- | --- |
| Baza drayverlari | ✅ | ❌ (HTTP orqali: Neon, PlanetScale) |
| Fayl tizimi | ✅ | ❌ |
| Sovuq start | Sekinroq | Tez |
| Geografik yaqinlik | Bitta region | Foydalanuvchiga yaqin |

Standart tanlov — **Node**. Edge faqat yengil, global tarqalishi kerak bo'lgan endpointlar uchun.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `page.tsx` va `route.ts` bir papkada | URL konflikti | Ajrating |
| Webhook'da `request.json()` | Imzo tekshiruvi buziladi | `request.text()` |
| Webhook'da idempotentlik yo'q | Ikki marta bajariladi | Event ID ni saqlang |
| Validatsiyasiz `request.json()` | Har qanday ma'lumot bazaga | zod |
| Avtorizatsiyani unutish | Ochiq endpoint | Har handler'da tekshiring |
| O'z frontendi uchun ortiqcha `/api` qatlami | Keraksiz sakrash | Server komponentda to'g'ridan-to'g'ri |
| `Allow-Origin: *` + `credentials` | Brauzer rad etadi | Aniq domen |
| Xato formatini har joyda boshqacha qilish | Klient qiyinlashadi | Yagona shakl |

## Amaliyot

1. `GET /api/products` va `POST /api/products` yozing; POST'da zod validatsiyasi va 422 xato formati bo'lsin.
2. `[id]/route.ts` da `GET`, `PATCH`, `DELETE` ni amalga oshiring.
3. Webhook endpoint yozing: imzo tekshiruvi va idempotentlik bilan; bir xil hodisani ikki marta yuboring.
4. SSE endpoint yozing va brauzerda `EventSource` bilan ulaning.
5. Bir papkada `page.tsx` va `route.ts` yarating — build xatosini ko'ring.
6. O'z sahifangizda `fetch('/api/...')` bilan ma'lumot oling, keyin uni to'g'ridan-to'g'ri baza chaqiruviga almashtiring va farqni o'lchang.

## Rasmiy hujjat

- Route Handlers: <https://nextjs.org/docs/app/api-reference/file-conventions/route>
- `NextRequest`: <https://nextjs.org/docs/app/api-reference/functions/next-request>
- `NextResponse`: <https://nextjs.org/docs/app/api-reference/functions/next-response>
