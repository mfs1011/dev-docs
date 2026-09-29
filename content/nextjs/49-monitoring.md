# 49 — Monitoring va xatolar

[← Oldingi: Deploy: Docker va self-host](48-docker-selfhost.md) · [Mundarija](README.md) · [Keyingi: Amaliy loyiha va checklist →](50-amaliy-loyiha.md)

## Tushuncha

Ilova ishga tushdi. Endi savol o'zgaradi: **"ishlayaptimi?"** dan **"qanchalik yaxshi ishlayapti va nima buzilyapti?"** ga.

Monitoring to'rt qatlamdan iborat:

| Qatlam | Savol | Vosita |
| --- | --- | --- |
| **Xatolar** | Nima sindi, kimda, qachon | Sentry |
| **Loglar** | Nima sodir bo'ldi | Strukturalangan loglar |
| **Metrikalar** | Qanchalik tez, qancha ko'p | OpenTelemetry, platforma |
| **Foydalanuvchi tajribasi** | Haqiqiy odamlarga qanday | Web Vitals (43-bob) |

Asosiy printsip: **foydalanuvchi shikoyat qilishidan oldin bilib olish**. Buning uchun alert kerak — dashboard emas. Hech kim dashboard'ga tikilib o'tirmaydi.

## Nega shunday

Next ilovasida xato **uch xil joyda** sodir bo'ladi, va ularni ushlash usuli har xil:

```
Server komponent    →  Node protsessi     →  instrumentation.ts
Klient komponent    →  Brauzer            →  error.tsx + global handler
Route Handler       →  Node protsessi     →  try/catch + onRequestError
Server Action       →  Node protsessi     →  qaytariladigan xato
Middleware          →  Edge runtime       →  alohida SDK
```

Bitta `try/catch` yetmaydi. Shuning uchun Next `instrumentation.ts` va `onRequestError` hook'larini beradi.

## Kod: Sentry sozlash

```bash
npx @sentry/wizard@latest -i nextjs
```

Wizard fayllarni yaratadi, lekin ularni tushunib sozlash kerak:

::: ts
```ts
// sentry.server.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GIT_SHA,

  // Namuna olish: hamma xato, lekin tracing'ning bir qismi
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Shovqinni filtrlash
  ignoreErrors: [
    'NEXT_REDIRECT',                              // redirect() normal ishlash
    'NEXT_NOT_FOUND',                             // notFound() normal ishlash
    'ECONNRESET',
    'AbortError',
  ],

  beforeSend(event, hint) {
    // Kutilgan xatolarni yubormaslik
    const error = hint.originalException

    if (error instanceof ApiError && error.status === 404) return null
    if (error instanceof Unauthorized) return null

    // Maxfiy ma'lumotni tozalash — MAJBURIY
    if (event.request?.headers) {
      delete event.request.headers.cookie
      delete event.request.headers.authorization
    }

    if (event.request?.data) {
      event.request.data = scrub(event.request.data)
    }

    return event
  },
})

const SENSITIVE = /password|token|secret|card|cvv|authorization|refresh/i

function scrub(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return value

  if (Array.isArray(value)) return value.map(scrub)

  return Object.fromEntries(
    Object.entries(value).map(([key, v]) => [
      key,
      SENSITIVE.test(key) ? '[tozalangan]' : scrub(v),
    ]),
  )
}
```

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  tracesSampleRate: 0.1,

  // Sessiya yozuvi — xatoni ko'z bilan ko'rish
  replaysSessionSampleRate: 0.01,                 // 1% oddiy sessiya
  replaysOnErrorSampleRate: 1.0,                  // 100% xatoli sessiya

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,                          // matnni yashirish — maxfiylik
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  ignoreErrors: [
    // Brauzer kengaytmalari
    'top.GLOBALS',
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Tarmoq
    'Failed to fetch',
    'NetworkError',
    'Load failed',
    // Bot va eski brauzerlar
    'Non-Error promise rejection captured',
  ],

  denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
})
```

```ts
// instrumentation.ts — Next shu faylni ishga tushishda yuklaydi
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// Server tomonidagi HAMMA so'rov xatosi shu yerdan o'tadi
export const onRequestError = Sentry.captureRequestError
```
:::

::: js
```js
// sentry.server.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  ignoreErrors: ['NEXT_REDIRECT', 'NEXT_NOT_FOUND', 'ECONNRESET'],

  beforeSend(event, hint) {
    if (event.request?.headers) {
      delete event.request.headers.cookie
      delete event.request.headers.authorization
    }

    return event
  },
})

// instrumentation.js
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') await import('./sentry.server.config')
  if (process.env.NEXT_RUNTIME === 'edge') await import('./sentry.edge.config')
}

export const onRequestError = Sentry.captureRequestError
```
:::

`onRequestError` — Next 15 dan beri bor va **server tomonidagi hamma xatoni** ushlaydi: server komponent, Route Handler, Server Action. Usiz xatolarning yarmi ko'rinmaydi.

`beforeSend` dagi tozalash **ixtiyoriy emas**: cookie'da token bor (26-bob), forma tanasida parol bo'lishi mumkin.

## Kod: xato chegaralari

::: ts
```tsx
// app/global-error.tsx — ROOT LAYOUT ham sinsa
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    // global-error o'z html/body sini beradi
    <html lang="uz">
      <body>
        <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
          <h1>Kutilmagan xato</h1>
          <p>Xatolik haqida xabar berildi. Iltimos, qayta urinib ko'ring.</p>

          {error.digest && (
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              Xato kodi: <code>{error.digest}</code>
            </p>
          )}

          <button type="button" onClick={reset}>Qayta urinish</button>
        </main>
      </body>
    </html>
  )
}
```

```tsx
// app/(app)/error.tsx — bo'lim darajasida
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { boundary: 'app' } })
  }, [error])

  return (
    <div role="alert" className="error-panel">
      <h2>Nimadir noto'g'ri ketdi</h2>
      <p>Bu bo'limni yuklab bo'lmadi.</p>

      {error.digest && <p className="muted">Kod: {error.digest}</p>}

      <button type="button" onClick={reset}>Qayta urinish</button>
    </div>
  )
}
```
:::

::: js
```jsx
// app/global-error.jsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="uz">
      <body>
        <h1>Kutilmagan xato</h1>
        {error.digest && <p>Xato kodi: <code>{error.digest}</code></p>}
        <button onClick={reset}>Qayta urinish</button>
      </body>
    </html>
  )
}
```
:::

**`error.digest` — juda muhim.** Production'da Next xato xabarini klientga bermaydi (u sirlarni oshkor qilishi mumkin), faqat `digest` — xesh. Foydalanuvchi shu kodni aytsa, siz uni serverning loglarida topasiz.

## Kod: strukturalangan loglar

`console.log` — qidirib bo'lmaydi. JSON loglar — qidirsa bo'ladi:

```bash
npm install pino
```

::: ts
```ts
// lib/logger.ts
import 'server-only'
import pino from 'pino'

const SENSITIVE_PATHS = [
  'password', 'token', 'accessToken', 'refreshToken', 'secret',
  'authorization', 'cookie', 'card', 'cvv', '*.password', 'req.headers.cookie',
]

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Maxfiy maydonlarni avtomatik tozalash
  redact: { paths: SENSITIVE_PATHS, censor: '[tozalangan]' },

  base: {
    env: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
  },

  formatters: {
    level: (label) => ({ level: label }),
  },

  timestamp: pino.stdTimeFunctions.isoTime,

  // Dev'da o'qilishi oson formatda
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
      : undefined,
})

/** So'rov konteksti bilan bolalangan logger */
export function requestLogger(context: { requestId: string; userId?: number; path: string }) {
  return logger.child(context)
}
```

```ts
// Ishlatish
import { logger } from '@/lib/logger'

// ❌ Qidirib bo'lmaydi
console.log(`Buyurtma ${id} yaratildi, summa ${total}`)

// ✅ Qidirsa bo'ladi: orderId:123, event:"order.created"
logger.info({ event: 'order.created', orderId: id, userId, total }, 'Buyurtma yaratildi')

logger.warn({ event: 'payment.retry', orderId: id, attempt: 2 }, 'To\'lov qayta urinilmoqda')

logger.error({ event: 'payment.failed', orderId: id, err }, 'To\'lov amalga oshmadi')
```
:::

::: js
```js
// lib/logger.js
import 'server-only'
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  redact: {
    paths: ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'req.headers.cookie'],
    censor: '[tozalangan]',
  },

  base: { env: process.env.VERCEL_ENV ?? process.env.NODE_ENV },

  timestamp: pino.stdTimeFunctions.isoTime,

  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
})

// Ishlatish
logger.info({ event: 'order.created', orderId: id, userId, total }, 'Buyurtma yaratildi')
```
:::

Log yozish qoidalari:

| Daraja | Qachon | Misol |
| --- | --- | --- |
| `error` | Ish bajarilmadi, aralashuv kerak | To'lov webhook'i sindi |
| `warn` | G'alati, lekin ish davom etdi | Refresh qayta urinildi |
| `info` | Muhim biznes hodisa | Buyurtma yaratildi, foydalanuvchi ro'yxatdan o'tdi |
| `debug` | Diagnostika | So'rov tafsilotlari |

**`info` darajasida hamma narsani yozmang.** Kuniga 10 million qator log — qidirib bo'lmaydigan va qimmat. Biznes hodisalari va xatolar yetarli.

## Kod: so'rov ID'si va kontekst

Bir so'rovga tegishli loglarni bog'lash:

::: ts
```ts
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()

  const headers = new Headers(request.headers)

  headers.set('x-request-id', requestId)

  const response = NextResponse.next({ request: { headers } })

  response.headers.set('x-request-id', requestId)     // klient ham ko'rsin

  return response
}
```

```ts
// lib/context.ts
import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { logger } from './logger'

export const getRequestContext = cache(async () => {
  const h = await headers()

  return {
    requestId: h.get('x-request-id') ?? 'nomalum',
    userAgent: h.get('user-agent') ?? '',
    path: h.get('x-pathname') ?? '',
  }
})

export const getLogger = cache(async () => {
  const context = await getRequestContext()

  return logger.child(context)
})
```

```ts
// Ishlatish
export async function createOrder(input: unknown) {
  const log = await getLogger()
  const session = await requireSession()

  log.info({ event: 'order.create.start', userId: session.userId }, 'Buyurtma boshlandi')

  try {
    const order = await db.transaction(/* ... */)

    log.info({ event: 'order.created', orderId: order.id }, 'Buyurtma yaratildi')

    return { ok: true, number: order.number }
  } catch (error) {
    log.error({ event: 'order.create.failed', err: error }, 'Buyurtma yaratilmadi')

    throw error
  }
}
```
:::

::: js
```js
// lib/context.js
import 'server-only'
import { cache } from 'react'
import { headers } from 'next/headers'
import { logger } from './logger'

export const getLogger = cache(async () => {
  const h = await headers()

  return logger.child({
    requestId: h.get('x-request-id') ?? 'nomalum',
    userAgent: h.get('user-agent') ?? '',
  })
})
```
:::

Foydalanuvchi "buyurtma berolmadim" desa, javob sarlavhasidagi `x-request-id` bilan **o'sha so'rovning hamma logini** topasiz.

## Kod: OpenTelemetry

Next OTel'ni qutidan qo'llab-quvvatlaydi:

```bash
npm install @vercel/otel @opentelemetry/api
```

::: ts
```ts
// instrumentation.ts
import { registerOTel } from '@vercel/otel'

export async function register() {
  registerOTel({
    serviceName: 'app-web',
    attributes: {
      'deployment.environment': process.env.VERCEL_ENV ?? 'development',
      'service.version': process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev',
    },
  })

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
}

export { onRequestError } from '@sentry/nextjs'
```

```ts
// lib/trace.ts — o'z span'laringiz
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('app')

export async function traced<T>(
  name: string,
  attributes: Record<string, string | number>,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    span.setAttributes(attributes)

    try {
      const result = await fn()

      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Noma\'lum xato',
      })
      span.recordException(error as Error)

      throw error
    } finally {
      span.end()
    }
  })
}

// Ishlatish
const orders = await traced('db.listOrders', { 'user.id': userId }, () => listOrders(userId))
```
:::

::: js
```js
// instrumentation.js
import { registerOTel } from '@vercel/otel'

export async function register() {
  registerOTel({ serviceName: 'app-web' })

  if (process.env.NEXT_RUNTIME === 'nodejs') await import('./sentry.server.config')
}

// lib/trace.js
import { trace, SpanStatusCode } from '@opentelemetry/api'

const tracer = trace.getTracer('app')

export async function traced(name, attributes, fn) {
  return tracer.startActiveSpan(name, async (span) => {
    span.setAttributes(attributes)

    try {
      const result = await fn()

      span.setStatus({ code: SpanStatusCode.OK })

      return result
    } catch (error) {
      span.recordException(error)
      span.setStatus({ code: SpanStatusCode.ERROR })

      throw error
    } finally {
      span.end()
    }
  })
}
```
:::

Tracing bergan narsa — **waterfall ko'rinishi** (43-bob):

```
GET /dashboard                                    ████████████████ 340 ms
├── verifySession                                 ██ 45 ms
├── db.listOrders                                   ████████ 180 ms   ← 🚩
│   └── SELECT orders ...                            ███████ 175 ms
├── db.getStats                                     ██ 40 ms
└── render                                            ██ 30 ms
```

Bu ko'rinishsiz "sahifa sekin" degan shikoyatni tekshirish taxminga aylanadi.

## Kod: Web Vitals — haqiqiy foydalanuvchilardan

43-bobdagi `useReportWebVitals` ni to'liq oqimga ulash:

::: ts
```ts
// app/api/vitals/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '@/lib/logger'

const schema = z.object({
  name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  path: z.string().max(200),
  id: z.string().max(100).optional(),
})

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) return new Response(null, { status: 204 })

  const { name, value, rating, path } = parsed.data

  logger.info(
    {
      event: 'web-vital',
      metric: name,
      value: Math.round(value),
      rating,
      path,
      // Qurilma konteksti — sekin telefonlar alohida ko'rinsin
      ua: request.headers.get('user-agent')?.slice(0, 100),
    },
    'Web Vital',
  )

  return new Response(null, { status: 204 })
}
```
:::

::: js
```js
// app/api/vitals/route.js
import { z } from 'zod'
import { logger } from '@/lib/logger'

const schema = z.object({
  name: z.enum(['LCP', 'INP', 'CLS', 'FCP', 'TTFB']),
  value: z.number(),
  rating: z.enum(['good', 'needs-improvement', 'poor']),
  path: z.string().max(200),
})

export async function POST(request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) return new Response(null, { status: 204 })

  logger.info({ event: 'web-vital', ...parsed.data }, 'Web Vital')

  return new Response(null, { status: 204 })
}
```
:::

**O'rtachaga qaramang — p75 ga qarang.** O'rtacha LCP 1.8 s bo'lishi mumkin, lekin foydalanuvchilarning 25% i 5 soniya kutayotgan bo'ladi. Google ham p75 ni o'lchaydi.

## Kod: alertlar

Dashboard emas, **alert** kerak. Nimaga alert qo'yish:

| Signal | Chegara | Nega |
| --- | --- | --- |
| Xato darajasi | > 1% so'rovlar, 5 daqiqa | Nimadir sindi |
| Yangi xato turi | Birinchi marta ko'rilgan | Reliz muammosi |
| p95 javob vaqti | > 2 s, 10 daqiqa | Sekinlashuv |
| Sog'liq endpointi | 2 marta ketma-ket muvaffaqiyatsiz | Xizmat o'chdi |
| To'lov webhook'i | Xato > 0 | Pul masalasi (35-bob) |
| Navbat orqada qolishi | > 1000 topshiriq | Ishchi to'xtagan (36-bob) |
| Baza ulanishlari | > 80% pool | Yaqin muammo |
| Disk | > 85% | Log yoki kesh to'lgan |

Sentry'da alert qoidasi, yoki o'zingiz:

::: ts
```ts
// lib/alert.ts
import 'server-only'
import { logger } from './logger'

type Severity = 'info' | 'warning' | 'critical'

const EMOJI: Record<Severity, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🚨',
}

export async function alert(
  severity: Severity,
  title: string,
  details: Record<string, unknown> = {},
) {
  logger[severity === 'critical' ? 'error' : 'warn']({ event: 'alert', title, ...details }, title)

  if (process.env.VERCEL_ENV !== 'production') return

  const text = [
    `${EMOJI[severity]} *${title}*`,
    ...Object.entries(details).map(([key, value]) => `• ${key}: \`${String(value)}\``),
    `• muhit: \`${process.env.VERCEL_ENV}\``,
  ].join('\n')

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, mrkdwn: true }),
    signal: AbortSignal.timeout(5000),
  }).catch((error) => logger.error({ err: error }, 'Alert yuborilmadi'))
}
```

```ts
// Ishlatish — 35-bobdagi webhook'da
catch (error) {
  await alert('critical', 'Stripe webhook xatosi', {
    eventId: event.id,
    type: event.type,
    error: error instanceof Error ? error.message : String(error),
  })

  return NextResponse.json({ error: 'Ichki xato' }, { status: 500 })
}
```
:::

::: js
```js
// lib/alert.js
import 'server-only'
import { logger } from './logger'

const EMOJI = { info: 'ℹ️', warning: '⚠️', critical: '🚨' }

export async function alert(severity, title, details = {}) {
  logger[severity === 'critical' ? 'error' : 'warn']({ event: 'alert', title, ...details }, title)

  if (process.env.VERCEL_ENV !== 'production') return

  const text = [
    `${EMOJI[severity]} *${title}*`,
    ...Object.entries(details).map(([key, value]) => `• ${key}: \`${value}\``),
  ].join('\n')

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
    signal: AbortSignal.timeout(5000),
  }).catch((error) => logger.error({ err: error }, 'Alert yuborilmadi'))
}
```
:::

**Alert charchoq (alert fatigue) — asosiy xavf.** Kuniga 50 ta alert kelsa, hech kim o'qimaydi. Qoida: **har alert harakat talab qilsin**. Talab qilmasa — u log, alert emas.

## Kod: biznes metrikalari

Texnik metrikalar yetarli emas. Biznes hodisalari ham kuzatilishi kerak:

::: ts
```ts
// lib/metrics.ts
import 'server-only'
import { logger } from './logger'

export async function track(
  event: string,
  properties: Record<string, string | number | boolean> = {},
) {
  logger.info({ event: `metric.${event}`, ...properties }, event)
}

// Ishlatish
await track('order.completed', { orderId: order.id, total: Number(order.total), items: count })
await track('user.registered', { source: 'organic' })
await track('cart.abandoned', { value: total, items: count })
```
:::

::: js
```js
// lib/metrics.js
import 'server-only'
import { logger } from './logger'

export async function track(event, properties = {}) {
  logger.info({ event: `metric.${event}`, ...properties }, event)
}
```
:::

Nimaga alert qo'yish kerak:

```
Soatiga buyurtmalar soni  →  0 ga tushsa ALERT
                              (texnik jihatdan hammasi "yashil" bo'lishi mumkin,
                               lekin savat tugmasi sinigan)
```

Bu **eng qimmatli alert turi**: u foydalanuvchi ko'rayotgan haqiqiy muammoni ushlaydi, server esa 200 qaytarayotgan bo'ladi.

## Kod: self-host'da log yig'ish

Vercel loglarni o'zi yig'adi. Docker'da (48-bob) o'zingiz:

```yaml
# compose.yaml ga qo'shimcha
services:
  web:
    logging:
      driver: json-file
      options: { max-size: '10m', max-file: '3' }

  # Loglarni yig'ib, Loki'ga yuboradi
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./promtail.yaml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml

  loki:
    image: grafana/loki:latest
    volumes: [lokidata:/loki]

  grafana:
    image: grafana/grafana:latest
    ports: ['3001:3000']
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes: [grafanadata:/var/lib/grafana]
```

`max-size` majburiy: usiz loglar diskni to'ldirib, serverni to'xtatadi.

Uptime kuzatuvi — tashqaridan:

```yaml
  uptime-kuma:
    image: louislam/uptime-kuma:latest
    restart: unless-stopped
    volumes: [uptimedata:/app/data]
    ports: ['3002:3001']
```

**Monitoring ilova bilan bir serverda bo'lmasin.** Server o'chsa, monitoring ham o'chadi va hech kim bilmaydi. Uptime tekshiruvini tashqi xizmatdan qiling (UptimeRobot, BetterStack, yoki boshqa serverdan).

## Kod: xatolarni ajratish

Hamma xato teng emas:

::: ts
```ts
// lib/errors.ts

/** Kutilgan — foydalanuvchiga ko'rsatiladi, Sentry'ga YUBORILMAYDI */
export class UserError extends Error {
  constructor(message: string, readonly code?: string) {
    super(message)
    this.name = 'UserError'
  }
}

/** Kutilmagan — Sentry'ga yuboriladi, foydalanuvchiga umumiy xabar */
export class SystemError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message)
    this.name = 'SystemError'
  }
}

/** Tashqi xizmat — qayta urinish mumkin */
export class UpstreamError extends Error {
  constructor(readonly service: string, readonly status?: number) {
    super(`${service} javob bermadi${status ? ` (${status})` : ''}`)
    this.name = 'UpstreamError'
  }
}
```

```ts
// Server Action'da
export async function createOrder(input: unknown) {
  const log = await getLogger()

  try {
    // ...
  } catch (error) {
    if (error instanceof UserError) {
      // Kutilgan: log qilamiz, alert yo'q
      log.info({ event: 'order.rejected', reason: error.code }, error.message)

      return { message: error.message }
    }

    if (error instanceof UpstreamError) {
      log.warn({ event: 'upstream.failed', service: error.service }, 'Tashqi xizmat')

      return { message: 'Xizmat vaqtincha ishlamayapti. Birozdan keyin urinib ko\'ring.' }
    }

    // Kutilmagan: Sentry + umumiy xabar
    log.error({ event: 'order.failed', err: error }, 'Buyurtma xatosi')
    Sentry.captureException(error)

    return { message: 'Kutilmagan xato yuz berdi' }
  }
}
```
:::

::: js
```js
// lib/errors.js
export class UserError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'UserError'
    this.code = code
  }
}

export class UpstreamError extends Error {
  constructor(service, status) {
    super(`${service} javob bermadi${status ? ` (${status})` : ''}`)
    this.name = 'UpstreamError'
    this.service = service
  }
}

// Ishlatish
catch (error) {
  if (error instanceof UserError) {
    log.info({ event: 'order.rejected', reason: error.code }, error.message)

    return { message: error.message }
  }

  log.error({ event: 'order.failed', err: error }, 'Buyurtma xatosi')
  Sentry.captureException(error)

  return { message: 'Kutilmagan xato yuz berdi' }
}
```
:::

"Parol noto'g'ri" — `UserError`, Sentry'ga kerak emas. "Baza javob bermadi" — `SystemError`, darhol bilish kerak.

Bu ajratmasangiz, Sentry shovqin bilan to'ladi va haqiqiy xatolar ko'rinmay qoladi.

## Muhandislik nuqtai nazari: nimani kuzatish kerak

Minimal to'plam (birinchi hafta):

```
□ Sentry ulangan (server + klient + onRequestError)
□ /api/health endpointi
□ Tashqi uptime tekshiruvi (5 daqiqada bir)
□ Strukturalangan loglar
□ Kritik alertlar Slack/Telegram'ga
```

Keyingi bosqich:

```
□ Web Vitals yig'iladi (p75)
□ OpenTelemetry tracing
□ Biznes metrikalari (buyurtma, ro'yxatdan o'tish)
□ Navbat orqada qolishi kuzatiladi
□ Baza sekin so'rovlari loglanadi
□ Byudjet/narx alerti
```

Nimani kuzatmaslik kerak:

| Kuzatmang | Nega |
| --- | --- |
| Har `console.log` | Shovqin, narx |
| Har HTTP so'rov (to'liq) | Namuna oling |
| Bot trafigi | Statistikani buzadi |
| 404 (oddiy) | Ular normal |
| Brauzer kengaytmasi xatolari | Sizga tegishli emas |

## Muhandislik nuqtai nazari: incident jarayoni

Alert keldi. Keyin nima?

```
1. TASDIQLASH (2 daqiqa)
   Haqiqiy muammomi yoki noto'g'ri alertmi?
   → /api/health, Sentry, foydalanuvchi shikoyatlari

2. QAMRAB OLISH (5 daqiqa)
   Nechta foydalanuvchi? Qaysi funksiya?
   → Sentry'da ta'sirlangan foydalanuvchilar soni

3. TO'XTATISH (10 daqiqa)
   Sabab topishdan OLDIN qon to'xtatiladi
   → Rollback (47, 48-bob) yoki funksiyani o'chirish

4. SABAB
   Endi vaqt bor — loglar, tracing, git tarixi
   → x-request-id bilan to'liq oqimni ko'rish

5. TUZATISH VA TEST
   Regressiya testi yoziladi (42-bob)

6. POST-MORTEM
   Aybdor emas, jarayon: nega sezmadik? Qanday oldini olamiz?
```

Uchinchi qadam eng ko'p buziladigan joy: muhandislar sababni topishga kirishadi, foydalanuvchilar esa kutadi. **Avval rollback, keyin tekshiruv.**

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `onRequestError` sozlanmagan | Server xatolarining yarmi ko'rinmaydi | `instrumentation.ts` da eksport |
| `beforeSend` da tozalash yo'q | Token va parol Sentry'ga tushadi | `redact` / `beforeSend` |
| `NEXT_REDIRECT` ni filtrlamaslik | Sentry soxta xatolar bilan to'ladi | `ignoreErrors` |
| `console.log` bilan log | Qidirib bo'lmaydi | Strukturalangan (pino) |
| So'rov ID yo'q | Loglarni bog'lab bo'lmaydi | `x-request-id` |
| Hamma narsani `info` da | Qimmat, shovqin | Faqat biznes hodisalari |
| Alert ko'p | Hech kim o'qimaydi | Har alert harakat talab qilsin |
| Monitoring bir serverda | Server o'chsa alert ham | Tashqi uptime |
| `release` sozlanmagan | Qaysi deploy sindirdi — noma'lum | `VERCEL_GIT_COMMIT_SHA` |
| Source map yuklanmagan | Stack trace o'qib bo'lmaydi | Sentry plugin |
| Faqat texnik metrikalar | Biznes sinadi, hamma yashil | Buyurtma soni alerti |
| O'rtacha qiymatga qarash | 25% yomon tajriba yashirin | p75, p95 |
| Log rotatsiyasi yo'q (self-host) | Disk to'ladi | `max-size` |
| Incident'da avval sabab qidirish | Foydalanuvchilar kutadi | Avval rollback |

## Amaliyot

1. Sentry'ni ulang va server komponentda ataylab xato tashlang — u Sentry'da ko'rinishini tasdiqlang.
2. `onRequestError` ni o'chiring va xuddi shu xatoni takrorlang — farqni ko'ring.
3. Cookie'li so'rovda xato tashlang va Sentry'da `cookie` sarlavhasi tozalanganini tekshiring.
4. `x-request-id` ni middleware'da qo'shing; bitta so'rovning hamma logini shu ID bilan filtrlang.
5. `error.digest` ni foydalanuvchiga ko'rsating va uni serverning loglarida toping.
6. OpenTelemetry ulang va bitta sahifaning waterfall ko'rinishini oching.
7. Slack alertini yozing va webhook xatosida ishga tushirib ko'ring.
8. Web Vitals'ni yig'ing va bir hafta ma'lumot to'plangach p75 ni hisoblang.
9. Soatiga buyurtmalar soni 0 ga tushsa alert beradigan qoida yozing.
10. Kichik incident o'ynang: xato deploy qiling, alert keling, rollback qiling — qancha vaqt oldi?

## Rasmiy hujjat

- OpenTelemetry (Next.js): <https://nextjs.org/docs/app/guides/open-telemetry>
- `instrumentation.ts`: <https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation>
- `onRequestError`: <https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation#onrequesterror-optional>
- Sentry + Next.js: <https://docs.sentry.io/platforms/javascript/guides/nextjs/>
- `useReportWebVitals`: <https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals>
- pino: <https://getpino.io>
