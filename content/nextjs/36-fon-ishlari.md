# 36 — Xabarnomalar va fon ishlari

[← Oldingi: To'lov: Stripe](35-stripe.md) · [Mundarija](README.md) · [Keyingi: Real vaqt →](37-real-vaqt.md)

## Tushuncha

35-bob oxirida savol qoldi: webhook tez javob berishi kerak, lekin email yuborish, PDF yaratish, 3-tomon API chaqirish vaqt oladi. Yechim — **ishni keyinga qoldirish**.

```
So'rov ─▶ zarur ishni bajarish ─▶ navbatga topshirish ─▶ 200 qaytarish
                                         │
                                         ▼
                                   Ishchi (worker)
                                   email, PDF, API, hisobot
```

Bu bobda uch narsa: **email yuborish**, **navbat**, **cron**.

Muhim cheklov: **Next serversiz muhitda fon ishini bajara olmaydi.** Javob qaytgach funksiya to'xtaydi. Shuning uchun navbat — tashqi xizmat yoki alohida protsess.

## Nega shunday

Serverless funksiya hayoti:

```
So'rov keladi ─▶ funksiya uyg'onadi ─▶ javob qaytadi ─▶ funksiya MUZLAYDI
                                                          │
                                        setTimeout, Promise — hech biri bajarilmaydi
```

Shuning uchun bu **ishlamaydi**:

::: ts
```ts
// ❌ Serverless'da bajarilmasligi mumkin
export async function POST(request: Request) {
  const order = await createOrder(...)

  sendEmail(order)                     // await yo'q — "fon"da ketsin dedik
  generateInvoice(order)

  return NextResponse.json({ ok: true })   // funksiya shu yerda muzlaydi
}
```
:::

::: js
```js
// ❌
export async function POST(request) {
  const order = await createOrder()

  sendEmail(order)
  generateInvoice(order)

  return NextResponse.json({ ok: true })
}
```
:::

Uzluksiz serverda (Docker) bu ishlaydi, Vercel'da — yo'q. Va u yerda ham xato ushlanmaydi, qayta urinish yo'q, ko'rinuvchanlik yo'q.

`after()` — Next 15 dan beri bor va **javobdan keyin, lekin funksiya o'lishidan oldin** ishni bajaradi:

::: ts
```ts
import { after } from 'next/server'

export async function POST(request: Request) {
  const order = await createOrder(...)

  after(async () => {
    await logAnalytics(order.id)        // javobga ta'sir qilmaydi
  })

  return NextResponse.json({ ok: true })
}
```
:::

::: js
```js
import { after } from 'next/server'

export async function POST(request) {
  const order = await createOrder()

  after(async () => {
    await logAnalytics(order.id)
  })

  return NextResponse.json({ ok: true })
}
```
:::

Lekin `after()` ham funksiya vaqti chegarasida (10–60 s) va **qayta urinishsiz**. U analitika, log uchun yaxshi; email va to'lov uchun — yo'q.

| Vosita | Qayta urinish | Kechiktirish | Ko'rinuvchanlik | Qachon |
| --- | --- | --- | --- | --- |
| `after()` | ❌ | ❌ | ❌ | Analitika, log |
| Navbat (QStash, Inngest) | ✅ | ✅ | ✅ | Email, PDF, API |
| Cron | ✅ | Jadval bo'yicha | ✅ | Tozalash, hisobot |
| BullMQ + Redis | ✅ | ✅ | ✅ | Self-host (48-bob) |

## Kod: email yuborish

```bash
npm install resend react-email @react-email/components
```

::: ts
```ts
// lib/email.ts
import 'server-only'
import { Resend } from 'resend'
import { OrderConfirmation } from '@/emails/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendOrderEmail(order: {
  id: number
  number: string
  total: string
  email: string
  name: string
}) {
  const { data, error } = await resend.emails.send({
    from: 'Do\'kon <buyurtma@example.com>',
    to: order.email,
    subject: `Buyurtma ${order.number} qabul qilindi`,
    react: OrderConfirmation({ order }),
    headers: {
      // Takroriy yuborishni Resend tomonida ham to'xtatadi
      'X-Entity-Ref-ID': `order-${order.id}`,
    },
  })

  if (error) throw new Error(`Email yuborilmadi: ${error.message}`)

  return data
}
```
:::

::: js
```js
// lib/email.js
import 'server-only'
import { Resend } from 'resend'
import { OrderConfirmation } from '@/emails/OrderConfirmation'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOrderEmail(order) {
  const { data, error } = await resend.emails.send({
    from: 'Do\'kon <buyurtma@example.com>',
    to: order.email,
    subject: `Buyurtma ${order.number} qabul qilindi`,
    react: OrderConfirmation({ order }),
    headers: { 'X-Entity-Ref-ID': `order-${order.id}` },
  })

  if (error) throw new Error(`Email yuborilmadi: ${error.message}`)

  return data
}
```
:::

Email shabloni — React komponent:

::: ts
```tsx
// emails/OrderConfirmation.tsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

export function OrderConfirmation({ order }: { order: { number: string; total: string } }) {
  return (
    <Html lang="uz">
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px' }}>
          <Heading as="h1" style={{ fontSize: '20px' }}>
            Buyurtmangiz qabul qilindi
          </Heading>

          <Text>Raqam: <strong>{order.number}</strong></Text>
          <Text>Summa: <strong>{Number(order.total).toLocaleString('uz-UZ')} so'm</strong></Text>

          <Hr />

          <Button
            href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.number}`}
            style={{ background: '#111', color: '#fff', padding: '12px 20px', borderRadius: '6px' }}
          >
            Buyurtmani ko'rish
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```
:::

::: js
```jsx
// emails/OrderConfirmation.jsx
import { Html, Head, Body, Container, Heading, Text, Button, Hr } from '@react-email/components'

export function OrderConfirmation({ order }) {
  return (
    <Html lang="uz">
      <Head />
      <Body style={{ fontFamily: 'system-ui, sans-serif', backgroundColor: '#f6f6f6' }}>
        <Container style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '8px' }}>
          <Heading as="h1" style={{ fontSize: '20px' }}>Buyurtmangiz qabul qilindi</Heading>

          <Text>Raqam: <strong>{order.number}</strong></Text>
          <Text>Summa: <strong>{Number(order.total).toLocaleString('uz-UZ')} so'm</strong></Text>

          <Hr />

          <Button href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.number}`}>
            Buyurtmani ko'rish
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```
:::

Email HTML — 1998-yildagi HTML. Tailwind, flexbox, grid ishlamaydi (Outlook'da). `@react-email/components` shu farqlarni yashiradi: inline stillar, jadval asosidagi tartib.

```bash
npx react-email dev        # brauzerda ko'rish, localhost:3000
```

## Kod: navbat (QStash)

QStash — HTTP asosidagi navbat: xabar yuborasiz, u sizning endpointingizni chaqiradi.

```bash
npm install @upstash/qstash
```

::: ts
```ts
// lib/queue.ts
import 'server-only'
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN! })

type Job =
  | { type: 'order.email'; orderId: number }
  | { type: 'order.invoice'; orderId: number }
  | { type: 'user.welcome'; userId: number }

export async function enqueue(job: Job, options?: { delaySeconds?: number }) {
  return qstash.publishJSON({
    url: `${process.env.APP_URL}/api/jobs`,
    body: job,
    retries: 3,
    delay: options?.delaySeconds,
    deduplicationId: `${job.type}-${'orderId' in job ? job.orderId : job.userId}`,
  })
}
```
:::

::: js
```js
// lib/queue.js
import 'server-only'
import { Client } from '@upstash/qstash'

const qstash = new Client({ token: process.env.QSTASH_TOKEN })

export async function enqueue(job, options) {
  return qstash.publishJSON({
    url: `${process.env.APP_URL}/api/jobs`,
    body: job,
    retries: 3,
    delay: options?.delaySeconds,
    deduplicationId: `${job.type}-${job.orderId ?? job.userId}`,
  })
}
```
:::

Ishchi — Route Handler:

::: ts
```ts
// app/api/jobs/route.ts
import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoice } from '@/lib/invoice'

async function handler(request: Request) {
  const job = await request.json()

  switch (job.type) {
    case 'order.email': {
      const order = await getOrderForEmail(job.orderId)

      if (!order) return NextResponse.json({ skipped: 'Buyurtma topilmadi' })

      await sendOrderEmail(order)
      break
    }

    case 'order.invoice':
      await generateInvoice(job.orderId)
      break

    case 'user.welcome':
      await sendWelcomeEmail(job.userId)
      break

    default:
      // Noma'lum tur — 200 qaytaramiz, aks holda cheksiz qayta urinadi
      console.warn('Noma\'lum topshiriq', job)

      return NextResponse.json({ skipped: true })
  }

  return NextResponse.json({ ok: true })
}

// Imzo tekshiruvi — busiz har kim topshiriq yuboradi
export const POST = verifySignatureAppRouter(handler)

export const maxDuration = 60          // uzoqroq ish uchun
```
:::

::: js
```js
// app/api/jobs/route.js
import { NextResponse } from 'next/server'
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs'
import { sendOrderEmail } from '@/lib/email'
import { generateInvoice } from '@/lib/invoice'

async function handler(request) {
  const job = await request.json()

  switch (job.type) {
    case 'order.email': {
      const order = await getOrderForEmail(job.orderId)

      if (!order) return NextResponse.json({ skipped: 'Buyurtma topilmadi' })

      await sendOrderEmail(order)
      break
    }

    case 'order.invoice':
      await generateInvoice(job.orderId)
      break

    default:
      console.warn('Noma\'lum topshiriq', job)

      return NextResponse.json({ skipped: true })
  }

  return NextResponse.json({ ok: true })
}

export const POST = verifySignatureAppRouter(handler)

export const maxDuration = 60
```
:::

Endi 35-bobdagi webhook yengillashadi:

::: ts
```ts
// app/api/webhooks/stripe/route.ts ichida
async function markPaid(orderId: number, paymentIntentId: string) {
  await db.transaction(async (tx) => {
    // ... holatni yangilash (35-bob)
  })

  // Sekin ishlar navbatga — webhook 200 ms da tugaydi
  await Promise.all([
    enqueue({ type: 'order.email', orderId }),
    enqueue({ type: 'order.invoice', orderId }),
  ])
}
```
:::

::: js
```js
async function markPaid(orderId, paymentIntentId) {
  await db.transaction(async (tx) => {
    // holatni yangilash
  })

  await Promise.all([
    enqueue({ type: 'order.email', orderId }),
    enqueue({ type: 'order.invoice', orderId }),
  ])
}
```
:::

**Ishchi ham idempotent bo'lishi kerak.** QStash qayta urinsa (masalan email yuborildi, lekin javob yo'lda yo'qoldi), email ikki marta ketmasligi kerak:

::: ts
```ts
case 'order.email': {
  const order = await getOrderForEmail(job.orderId)

  if (!order) return NextResponse.json({ skipped: true })
  if (order.emailSentAt) return NextResponse.json({ skipped: 'Allaqachon yuborilgan' })

  await sendOrderEmail(order)

  await db
    .update(orders)
    .set({ emailSentAt: new Date() })
    .where(eq(orders.id, job.orderId))

  break
}
```
:::

::: js
```js
case 'order.email': {
  const order = await getOrderForEmail(job.orderId)

  if (!order || order.emailSentAt) return NextResponse.json({ skipped: true })

  await sendOrderEmail(order)

  await db.update(orders).set({ emailSentAt: new Date() }).where(eq(orders.id, job.orderId))

  break
}
```
:::

## Kod: cron

Vercel'da `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/cleanup", "schedule": "0 3 * * *" },
    { "path": "/api/cron/daily-report", "schedule": "0 8 * * 1" }
  ]
}
```

::: ts
```ts
// app/api/cron/cleanup/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { lt, eq, and, sql } from 'drizzle-orm'
import { db } from '@/db'
import { orders, uploads, webhookEvents, sessions } from '@/db/schema'
import { deleteObject } from '@/lib/storage'

export async function GET() {
  // Vercel cron sarlavhasi — busiz har kim chaqira oladi
  const auth = (await headers()).get('authorization')

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // 1. To'lanmagan eski buyurtmalar
  const cancelled = await db
    .update(orders)
    .set({ status: 'CANCELLED' })
    .where(and(eq(orders.status, 'PENDING'), lt(orders.createdAt, dayAgo)))
    .returning({ id: orders.id })

  // 2. Tasdiqlanmagan yuklashlar (34-bob)
  const stale = await db
    .delete(uploads)
    .where(and(eq(uploads.status, 'pending'), lt(uploads.createdAt, dayAgo)))
    .returning({ key: uploads.key })

  await Promise.allSettled(stale.map((upload) => deleteObject(upload.key)))

  // 3. Eski webhook yozuvlari (35-bob)
  await db.delete(webhookEvents).where(lt(webhookEvents.receivedAt, monthAgo))

  // 4. Muddati o'tgan sessiyalar
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))

  return NextResponse.json({
    cancelledOrders: cancelled.length,
    deletedUploads: stale.length,
  })
}

export const maxDuration = 60
```
:::

::: js
```js
// app/api/cron/cleanup/route.js
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { lt, eq, and } from 'drizzle-orm'
import { db } from '@/db'
import { orders, uploads, webhookEvents, sessions } from '@/db/schema'
import { deleteObject } from '@/lib/storage'

export async function GET() {
  const auth = (await headers()).get('authorization')

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 401 })
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const cancelled = await db
    .update(orders)
    .set({ status: 'CANCELLED' })
    .where(and(eq(orders.status, 'PENDING'), lt(orders.createdAt, dayAgo)))
    .returning({ id: orders.id })

  const stale = await db
    .delete(uploads)
    .where(and(eq(uploads.status, 'pending'), lt(uploads.createdAt, dayAgo)))
    .returning({ key: uploads.key })

  await Promise.allSettled(stale.map((upload) => deleteObject(upload.key)))

  await db.delete(webhookEvents).where(lt(webhookEvents.receivedAt, monthAgo))
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()))

  return NextResponse.json({ cancelledOrders: cancelled.length, deletedUploads: stale.length })
}

export const maxDuration = 60
```
:::

**Cron endpointini himoyalash majburiy.** `CRON_SECRET` bo'lmasa, `/api/cron/cleanup` ni har kim chaqirib, ma'lumot o'chirishi mumkin.

Katta hajmli cron ishini bo'laklang:

::: ts
```ts
// ❌ 100 000 foydalanuvchiga email — timeout
for (const user of allUsers) {
  await sendNewsletter(user)
}

// ✅ Har birini navbatga
for (const user of allUsers) {
  await enqueue({ type: 'newsletter', userId: user.id })
}
```
:::

::: js
```js
// ✅
for (const user of allUsers) {
  await enqueue({ type: 'newsletter', userId: user.id })
}
```
:::

## Kod: self-host — BullMQ

Docker/VPS'da (48-bob) navbatni o'zingiz yuritasiz:

```bash
npm install bullmq ioredis
```

::: ts
```ts
// lib/queue-bull.ts
import 'server-only'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

export const jobQueue = new Queue('jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
  },
})
```

```ts
// worker.ts — ALOHIDA protsess: `node worker.js`
import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { sendOrderEmail } from './lib/email'

const connection = new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null })

const worker = new Worker(
  'jobs',
  async (job) => {
    switch (job.name) {
      case 'order.email':
        return sendOrderEmail(job.data.orderId)
      default:
        throw new Error(`Noma'lum topshiriq: ${job.name}`)
    }
  },
  { connection, concurrency: 5 },
)

worker.on('failed', (job, error) => {
  console.error(`Topshiriq ${job?.id} muvaffaqiyatsiz`, error)
})

// Nozik to'xtash — konteyner o'chirilganda ish yarim qolmasin
process.on('SIGTERM', async () => {
  await worker.close()
  await connection.quit()
  process.exit(0)
})
```
:::

::: js
```js
// lib/queue-bull.js
import 'server-only'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })

export const jobQueue = new Queue('jobs', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { age: 3600, count: 1000 },
  },
})

// worker.js — alohida protsess
import { Worker } from 'bullmq'

const worker = new Worker('jobs', async (job) => {
  switch (job.name) {
    case 'order.email':
      return sendOrderEmail(job.data.orderId)
    default:
      throw new Error(`Noma'lum topshiriq: ${job.name}`)
  }
}, { connection, concurrency: 5 })

process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
```
:::

Ishchi — **alohida konteyner**. Next konteyneri bilan bir joyda ishga tushirmang: ular alohida masshtablanadi va ishchi qayta ishga tushganda sayt o'chmasligi kerak.

## Kod: kelayotgan webhook qabul qilish

Boshqa xizmat sizga webhook yuborsa (35-bobdagi Stripe kabi), naqsh bir xil:

::: ts
```ts
// app/api/webhooks/[provider]/route.ts
import { NextResponse } from 'next/server'
import { timingSafeEqual, createHmac } from 'node:crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  const body = await request.text()                // XOM tana
  const signature = request.headers.get('x-signature') ?? ''

  const secret = process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`]

  if (!secret) return NextResponse.json({ error: 'Noma\'lum provayder' }, { status: 404 })

  const expected = createHmac('sha256', secret).update(body).digest('hex')

  // timingSafeEqual — vaqt bo'yicha hujumdan himoya
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Imzo noto\'g\'ri' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // Idempotentlik + navbat (35-bobdagi naqsh)
  await enqueue({ type: 'webhook.process', provider, eventId: event.id })

  return NextResponse.json({ received: true })
}
```
:::

::: js
```js
// app/api/webhooks/[provider]/route.js
import { NextResponse } from 'next/server'
import { timingSafeEqual, createHmac } from 'node:crypto'

export async function POST(request, { params }) {
  const { provider } = await params
  const body = await request.text()
  const signature = request.headers.get('x-signature') ?? ''

  const secret = process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`]

  if (!secret) return NextResponse.json({ error: 'Noma\'lum provayder' }, { status: 404 })

  const expected = createHmac('sha256', secret).update(body).digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: 'Imzo noto\'g\'ri' }, { status: 401 })
  }

  const event = JSON.parse(body)

  await enqueue({ type: 'webhook.process', provider, eventId: event.id })

  return NextResponse.json({ received: true })
}
```
:::

`===` bilan imzo solishtirish **noto'g'ri**: satrlarni taqqoslash vaqti farq qiladi va hujumchi shu farqdan imzoni bir-bir tiklashi mumkin. `timingSafeEqual` doim bir xil vaqt sarflaydi.

## Muhandislik nuqtai nazari: navbat xizmatini tanlash

| Xizmat | Model | Afzalligi | Kamchiligi |
| --- | --- | --- | --- |
| **QStash** | HTTP → sizning endpoint | Serverless'ga mos, sodda | Har xabar uchun to'lov |
| **Inngest** | Qadamli oqimlar (workflow) | Ko'p qadamli jarayon, durable | Yangi tushunchalar |
| **Trigger.dev** | Uzoq ishlar | Vaqt chegarasi yo'q | Sozlash |
| **BullMQ + Redis** | Klassik navbat | To'liq nazorat, arzon | Alohida ishchi kerak |
| **Baza jadvali + cron** | `SELECT ... FOR UPDATE SKIP LOCKED` | Qo'shimcha xizmat yo'q | Qo'lda yoziladi |

Oxirgisi — kam baholanadigan variant. Bir necha yuz topshiriq uchun Postgres yetarli:

```sql
-- Ishchi topshiriq oladi (boshqa ishchilar bloklanmaydi)
UPDATE jobs
SET status = 'running', started_at = now()
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending' AND run_at <= now()
  ORDER BY run_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1
)
RETURNING *;
```

`SKIP LOCKED` — 10 ta ishchi bir vaqtda ishlaganda ham har topshiriq bittasiga tegadi.

## Muhandislik nuqtai nazari: nima navbatga tushishi kerak

| Ish | Navbatga? | Nega |
| --- | --- | --- |
| Email | ✅ Ha | Sekin, qayta urinish kerak |
| PDF/hisob-faktura | ✅ Ha | CPU og'ir |
| Rasm qayta o'lchash | ✅ Ha | Sekin |
| 3-tomon API | ✅ Ha | Tushib qolishi mumkin |
| Analitika hodisasi | ⚠️ `after()` yetadi | Yo'qolsa qo'rqinchli emas |
| Kesh tozalash | ❌ Yo'q | Tez |
| Baza yozuvi | ❌ Yo'q | So'rov ichida bo'lishi kerak |
| Foydalanuvchi kutayotgan natija | ❌ Yo'q | Sinxron bo'lsin (yoki 37-bob) |

Qoida: **foydalanuvchi natijani darhol ko'rishi shart bo'lmagan va tushib qolishi mumkin bo'lgan ish** — navbatga.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `await` siz "fon" chaqiruvi | Serverless'da bajarilmaydi | Navbat yoki `after()` |
| Cron endpointini ochiq qoldirish | Har kim ma'lumot o'chiradi | `CRON_SECRET` |
| Ishchi idempotent emas | Email ikki marta | Holat ustuni (`emailSentAt`) |
| Ishchi imzosini tekshirmaslik | Soxta topshiriqlar | `verifySignature` |
| Noma'lum topshiriqda xato tashlash | Cheksiz qayta urinish | 200 + log |
| `===` bilan imzo solishtirish | Vaqt bo'yicha hujum | `timingSafeEqual` |
| Cron ichida 100 000 email | Timeout | Har birini navbatga |
| Ishchini Next konteynerida | Deploy'da topshiriq uziladi | Alohida konteyner |
| `SIGTERM` ni ushlamaslik | Yarim bajarilgan ish | Nozik to'xtash |
| Emailni tranzaksiya ichida | Qaytarilsa email ketgan | Tashqarida / navbatda |
| Email shabloniga flexbox | Outlook'da buziladi | `@react-email/components` |

## Amaliyot

1. Resend bilan email yuboring; `react-email dev` da shablonni ko'ring.
2. Shablonni Gmail, Outlook va telefonda oching — farqlarni ko'ring.
3. QStash ulang va webhook'dan email topshirig'ini navbatga qo'ying. Webhook javob vaqtini o'lchang (oldin/keyin).
4. Ishchida ataylab xato tashlang — QStash konsolida qayta urinishlarni kuzating.
5. Bir topshiriqni ikki marta yuboring — `emailSentAt` tekshiruvi ikkinchisini to'xtatishi kerak.
6. Cron endpointini `CRON_SECRET` siz `curl` bilan chaqiring — 401 kelishi kerak.
7. Postgres asosidagi navbatni `FOR UPDATE SKIP LOCKED` bilan yozing va ikki ishchini bir vaqtda ishga tushiring.

## Rasmiy hujjat

- `after()`: <https://nextjs.org/docs/app/api-reference/functions/after>
- Vercel Cron: <https://vercel.com/docs/cron-jobs>
- Resend + Next.js: <https://resend.com/docs/send-with-nextjs>
- React Email: <https://react.email/docs/introduction>
- QStash: <https://upstash.com/docs/qstash>
- BullMQ: <https://docs.bullmq.io>
