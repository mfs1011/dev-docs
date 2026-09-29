# 37 — Real vaqt

[← Oldingi: Xabarnomalar va fon ishlari](36-fon-ishlari.md) · [Mundarija](README.md) · [Keyingi: Pages Router asoslari →](38-pages-router.md)

## Tushuncha

"Sahifa o'zi yangilansin" — bitta jumla, to'rtta texnologiya:

| Yo'l | Yo'nalish | Ulanish | Murakkablik |
| --- | --- | --- | --- |
| **Polling** | Klient so'raydi | Yo'q | ⭐ Eng oddiy |
| **SSE** | Server → klient | Bitta, doimiy | ⭐⭐ |
| **WebSocket** | Ikki tomonlama | Doimiy | ⭐⭐⭐ |
| **Boshqariladigan xizmat** | Ikki tomonlama | Xizmat orqali | ⭐⭐ (narxi bor) |

```
Polling:     [klient] ──?──▶ [server]    har 5 s
                      ◀──────

SSE:         [klient] ────▶ [server]     bir marta ulanadi
                      ◀════════          server xohlagancha yuboradi

WebSocket:   [klient] ◀═══▶ [server]     ikkalasi ham yuboradi
```

Muhim haqiqat: **Next serverless'da WebSocket'ni ushlab tura olmaydi.** Funksiya javob berib o'ladi. Shuning uchun Vercel'da WebSocket — tashqi xizmat.

Bu bob har birini ko'rsatadi va **qaysi biri qachon** kerakligini aniqlaydi.

## Nega shunday

Real vaqt talabi ko'pincha ortiqcha baholanadi. Uch savol:

1. **Kechikish qancha muhim?** Buyurtma holati 5 soniya kechiksa — muammo yo'q. Chat xabari 5 soniya kechiksa — muammo.
2. **Kim kimga yozadi?** Faqat server klientga xabar bersa — SSE yetadi. Klient ham tez-tez yozsa — WebSocket.
3. **Nechta ulanish bo'ladi?** 100 ta foydalanuvchi — har narsa ishlaydi. 100 000 — arxitektura masalasi.

Ko'p holatda javob: **polling yetarli**. Uni kam baholashadi, chunki "eskicha" ko'rinadi. Amalda u eng ishonchli: CDN bilan ishlaydi, qayta ulanish muammosi yo'q, har qanday muhitda ishlaydi.

## Kod: 1 — Polling (router.refresh)

Next'da eng oddiy real vaqt — server komponentni qayta so'rash:

::: ts
```tsx
// app/(app)/orders/[id]/OrderStatusPoller.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OrderStatusPoller({ status }: { status: string }) {
  const router = useRouter()

  useEffect(() => {
    // Yakuniy holatda so'ramaymiz
    if (status !== 'PENDING') return

    const interval = setInterval(() => {
      // Tab fonda bo'lsa so'ramaymiz — batareya va trafik
      if (document.visibilityState === 'visible') router.refresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [status, router])

  return null
}
```

```tsx
// app/(app)/orders/[id]/page.tsx
export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  return (
    <>
      <OrderStatusPoller status={order.status} />
      <h1>{order.number}</h1>
      <StatusBadge status={order.status} />
    </>
  )
}
```
:::

::: js
```jsx
// app/(app)/orders/[id]/OrderStatusPoller.jsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function OrderStatusPoller({ status }) {
  const router = useRouter()

  useEffect(() => {
    if (status !== 'PENDING') return

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh()
    }, 5000)

    return () => clearInterval(interval)
  }, [status, router])

  return null
}

// app/(app)/orders/[id]/page.jsx
export default async function OrderPage({ params }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  return (
    <>
      <OrderStatusPoller status={order.status} />
      <h1>{order.number}</h1>
      <StatusBadge status={order.status} />
    </>
  )
}
```
:::

`router.refresh()` — server komponentni qayta so'raydi va natijani mavjud DOM'ga **birlashtiradi**: klient holati (forma kiritmalari, ochiq menyular) saqlanadi (11-bob).

Ikki optimizatsiya majburiy: **yakuniy holatda to'xtash** va **fon tabida so'ramaslik**. Ularsiz 1000 foydalanuvchi soatiga 720 000 so'rov yuboradi.

TanStack Query bilan (24-bob):

::: ts
```ts
const { data } = useQuery({
  queryKey: ['order', id],
  queryFn: () => fetch(`/api/orders/${id}`).then((r) => r.json()),
  refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 5000 : false),
  refetchIntervalInBackground: false,
})
```
:::

::: js
```js
const { data } = useQuery({
  queryKey: ['order', id],
  queryFn: () => fetch(`/api/orders/${id}`).then((r) => r.json()),
  refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 5000 : false),
  refetchIntervalInBackground: false,
})
```
:::

## Kod: 2 — SSE (Server-Sent Events)

Bir tomonlama oqim. Route Handler'dan `ReadableStream` qaytariladi:

::: ts
```ts
// app/api/orders/[id]/stream/route.ts
import { verifySession } from '@/lib/dal'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await verifySession()

  if (!session) return new Response('Kirish kerak', { status: 401 })

  const order = await getOrder(Number(id))

  if (!order || order.userId !== session.userId) return new Response('Topilmadi', { status: 404 })

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return

        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('status', { status: order.status })

      // Proksi/yuk balansi ulanishni uzmasligi uchun "yurak urishi"
      const heartbeat = setInterval(() => {
        if (closed) return

        controller.enqueue(encoder.encode(': ping\n\n'))     // izoh qatori
      }, 15_000)

      // Postgres LISTEN/NOTIFY yoki Redis pub/sub
      const unsubscribe = await subscribeToOrder(Number(id), (update) => {
        send('status', update)

        if (update.status !== 'PENDING') {
          send('done', {})
          cleanup()
          controller.close()
        }
      })

      function cleanup() {
        if (closed) return

        closed = true
        clearInterval(heartbeat)
        unsubscribe()
      }

      // Brauzer tabni yopsa
      request.signal.addEventListener('abort', () => {
        cleanup()

        try {
          controller.close()
        } catch {
          // allaqachon yopilgan
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',                 // nginx buferlashni o'chirish
    },
  })
}

export const dynamic = 'force-dynamic'
export const maxDuration = 300
```
:::

::: js
```js
// app/api/orders/[id]/stream/route.js
import { verifySession } from '@/lib/dal'

export async function GET(request, { params }) {
  const { id } = await params
  const session = await verifySession()

  if (!session) return new Response('Kirish kerak', { status: 401 })

  const order = await getOrder(Number(id))

  if (!order || order.userId !== session.userId) return new Response('Topilmadi', { status: 404 })

  const encoder = new TextEncoder()
  let closed = false

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event, data) => {
        if (closed) return

        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }

      send('status', { status: order.status })

      const heartbeat = setInterval(() => {
        if (!closed) controller.enqueue(encoder.encode(': ping\n\n'))
      }, 15_000)

      const unsubscribe = await subscribeToOrder(Number(id), (update) => {
        send('status', update)

        if (update.status !== 'PENDING') {
          send('done', {})
          cleanup()
          controller.close()
        }
      })

      function cleanup() {
        if (closed) return

        closed = true
        clearInterval(heartbeat)
        unsubscribe()
      }

      request.signal.addEventListener('abort', () => {
        cleanup()

        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

export const dynamic = 'force-dynamic'
export const maxDuration = 300
```
:::

Klient tomoni — brauzerda tayyor `EventSource`:

::: ts
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function OrderStream({ id, initial }: { id: number; initial: string }) {
  const [status, setStatus] = useState(initial)
  const router = useRouter()

  useEffect(() => {
    if (initial !== 'PENDING') return

    const source = new EventSource(`/api/orders/${id}/stream`)

    source.addEventListener('status', (event) => {
      setStatus(JSON.parse(event.data).status)
    })

    source.addEventListener('done', () => {
      source.close()
      router.refresh()                            // to'liq ma'lumotni serverdan olamiz
    })

    source.onerror = () => {
      // EventSource O'ZI qayta ulanadi — yopmaslik kerak
      console.warn('SSE uzildi, qayta ulanmoqda')
    }

    return () => source.close()
  }, [id, initial, router])

  return <StatusBadge status={status} />
}
```
:::

::: js
```jsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function OrderStream({ id, initial }) {
  const [status, setStatus] = useState(initial)
  const router = useRouter()

  useEffect(() => {
    if (initial !== 'PENDING') return

    const source = new EventSource(`/api/orders/${id}/stream`)

    source.addEventListener('status', (event) => setStatus(JSON.parse(event.data).status))

    source.addEventListener('done', () => {
      source.close()
      router.refresh()
    })

    source.onerror = () => console.warn('SSE uzildi, qayta ulanmoqda')

    return () => source.close()
  }, [id, initial, router])

  return <StatusBadge status={status} />
}
```
:::

`EventSource` ning yaxshi tomoni — **avtomatik qayta ulanish**. WebSocket'da buni qo'lda yozasiz.

SSE cheklovlari:

| Cheklov | Tafsilot |
| --- | --- |
| HTTP/1.1 da 6 ta ulanish | Domenga jami. HTTP/2 da ~100 |
| Faqat matn | Ikkilik ma'lumot base64 orqali |
| Faqat server → klient | Klient yozishi uchun alohida POST |
| Serverless vaqt chegarasi | Vercel'da 300 s (Pro), keyin uziladi |
| Proksi buferlash | `X-Accel-Buffering: no` kerak |

## Kod: hodisa manbai — Postgres LISTEN/NOTIFY

SSE oqimiga ma'lumot qayerdan keladi? Eng arzon yo'l — Postgres:

```sql
-- Trigger: buyurtma holati o'zgarsa xabar yuboradi
CREATE OR REPLACE FUNCTION notify_order_change() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'order_change',
    json_build_object('id', NEW.id, 'status', NEW.status)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_status_changed
AFTER UPDATE OF status ON orders
FOR EACH ROW EXECUTE FUNCTION notify_order_change();
```

::: ts
```ts
// lib/realtime.ts
import 'server-only'
import postgres from 'postgres'

const listener = postgres(process.env.DATABASE_URL!, { max: 1 })

type Handler = (update: { id: number; status: string }) => void

const handlers = new Map<number, Set<Handler>>()
let started = false

async function ensureListening() {
  if (started) return

  started = true

  await listener.listen('order_change', (payload) => {
    const update = JSON.parse(payload)

    handlers.get(update.id)?.forEach((handler) => handler(update))
  })
}

export async function subscribeToOrder(orderId: number, handler: Handler) {
  await ensureListening()

  if (!handlers.has(orderId)) handlers.set(orderId, new Set())

  handlers.get(orderId)!.add(handler)

  return () => {
    const set = handlers.get(orderId)

    set?.delete(handler)

    if (set?.size === 0) handlers.delete(orderId)
  }
}
```
:::

::: js
```js
// lib/realtime.js
import 'server-only'
import postgres from 'postgres'

const listener = postgres(process.env.DATABASE_URL, { max: 1 })

const handlers = new Map()
let started = false

async function ensureListening() {
  if (started) return

  started = true

  await listener.listen('order_change', (payload) => {
    const update = JSON.parse(payload)

    handlers.get(update.id)?.forEach((handler) => handler(update))
  })
}

export async function subscribeToOrder(orderId, handler) {
  await ensureListening()

  if (!handlers.has(orderId)) handlers.set(orderId, new Set())

  handlers.get(orderId).add(handler)

  return () => {
    const set = handlers.get(orderId)

    set?.delete(handler)

    if (set?.size === 0) handlers.delete(orderId)
  }
}
```
:::

**Bu faqat uzluksiz serverda ishlaydi.** `Map` bitta protsess xotirasida; serverless'da har funksiya alohida. U yerda Redis pub/sub yoki boshqariladigan xizmat kerak.

`pg_notify` payload chegarasi — 8 KB. Katta ma'lumot yubormang: faqat ID va holat, qolganini klient so'raydi.

## Kod: 3 — WebSocket (boshqariladigan xizmat)

Vercel'da o'z WebSocket serveringiz bo'lolmaydi. Pusher, Ably yoki Supabase Realtime — kanal xizmati:

```bash
npm install pusher pusher-js
```

::: ts
```ts
// lib/pusher.ts
import 'server-only'
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})
```

```ts
// Server Action yoki webhook ichida
await pusher.trigger(`private-order-${orderId}`, 'status', { status: 'PAID' })
```

```ts
// app/api/pusher/auth/route.ts — maxfiy kanalga ruxsat
import { NextResponse } from 'next/server'
import { pusher } from '@/lib/pusher'
import { verifySession } from '@/lib/dal'

export async function POST(request: Request) {
  const session = await verifySession()

  if (!session) return NextResponse.json({ error: 'Kirish kerak' }, { status: 401 })

  const form = await request.formData()
  const socketId = String(form.get('socket_id'))
  const channel = String(form.get('channel_name'))

  // Kanal shu foydalanuvchiniki ekanini tekshiramiz
  const match = /^private-order-(\d+)$/.exec(channel)

  if (!match) return NextResponse.json({ error: 'Noma\'lum kanal' }, { status: 403 })

  const order = await getOrder(Number(match[1]))

  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  }

  const auth = pusher.authorizeChannel(socketId, channel)

  return NextResponse.json(auth)
}
```
:::

::: js
```js
// lib/pusher.js
import 'server-only'
import Pusher from 'pusher'

export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
})

// app/api/pusher/auth/route.js
import { NextResponse } from 'next/server'
import { pusher } from '@/lib/pusher'
import { verifySession } from '@/lib/dal'

export async function POST(request) {
  const session = await verifySession()

  if (!session) return NextResponse.json({ error: 'Kirish kerak' }, { status: 401 })

  const form = await request.formData()
  const socketId = String(form.get('socket_id'))
  const channel = String(form.get('channel_name'))

  const match = /^private-order-(\d+)$/.exec(channel)

  if (!match) return NextResponse.json({ error: 'Noma\'lum kanal' }, { status: 403 })

  const order = await getOrder(Number(match[1]))

  if (!order || order.userId !== session.userId) {
    return NextResponse.json({ error: 'Ruxsat yo\'q' }, { status: 403 })
  }

  return NextResponse.json(pusher.authorizeChannel(socketId, channel))
}
```
:::

Klient:

::: ts
```tsx
'use client'

import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'

export function OrderLive({ id, initial }: { id: number; initial: string }) {
  const [status, setStatus] = useState(initial)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: '/api/pusher/auth',
    })

    const channel = pusher.subscribe(`private-order-${id}`)

    channel.bind('status', (data: { status: string }) => setStatus(data.status))

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`private-order-${id}`)
      pusher.disconnect()
    }
  }, [id])

  return <StatusBadge status={status} />
}
```
:::

::: js
```jsx
'use client'

import { useEffect, useState } from 'react'
import Pusher from 'pusher-js'

export function OrderLive({ id, initial }) {
  const [status, setStatus] = useState(initial)

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: '/api/pusher/auth',
    })

    const channel = pusher.subscribe(`private-order-${id}`)

    channel.bind('status', (data) => setStatus(data.status))

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`private-order-${id}`)
      pusher.disconnect()
    }
  }, [id])

  return <StatusBadge status={status} />
}
```
:::

**`private-` prefiksi majburiy.** Oddiy kanalga har kim obuna bo'la oladi — shu jumladan boshqa foydalanuvchining buyurtmasiga.

## Kod: 4 — o'z WebSocket serveringiz (self-host)

Docker/VPS'da (48-bob) alohida protsess:

::: ts
```ts
// ws-server.ts — Next'dan ALOHIDA
import { WebSocketServer } from 'ws'
import { jwtVerify } from 'jose'
import { parse } from 'node:url'
import { createServer } from 'node:http'

const server = createServer()
const wss = new WebSocketServer({ noServer: true })

const rooms = new Map<string, Set<import('ws').WebSocket>>()

// Ulanishni QABUL QILISHDAN OLDIN autentifikatsiya
server.on('upgrade', async (request, socket, head) => {
  const { query } = parse(request.url ?? '', true)
  const token = String(query.token ?? '')

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, payload)
    })
  } catch {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
  }
})

wss.on('connection', (ws, request, user) => {
  let room: string | null = null
  let alive = true

  ws.on('pong', () => {
    alive = true
  })

  ws.on('message', (raw) => {
    const message = JSON.parse(String(raw))

    if (message.type === 'join') {
      // Ruxsatni SERVERDA tekshiring — klient aytganiga ishonmang
      if (!canJoin(user, message.room)) return

      room = message.room

      if (!rooms.has(room)) rooms.set(room, new Set())

      rooms.get(room)!.add(ws)
    }
  })

  ws.on('close', () => {
    if (room) rooms.get(room)?.delete(ws)
  })

  // O'lik ulanishlarni tozalash
  const ping = setInterval(() => {
    if (!alive) return ws.terminate()

    alive = false
    ws.ping()
  }, 30_000)

  ws.on('close', () => clearInterval(ping))
})

server.listen(3001)
```
:::

::: js
```js
// ws-server.js
import { WebSocketServer } from 'ws'
import { createServer } from 'node:http'

const server = createServer()
const wss = new WebSocketServer({ noServer: true })
const rooms = new Map()

server.on('upgrade', async (request, socket, head) => {
  const token = new URL(request.url, 'http://x').searchParams.get('token')

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })

    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request, payload))
  } catch {
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
    socket.destroy()
  }
})

wss.on('connection', (ws, request, user) => {
  let alive = true

  ws.on('pong', () => { alive = true })

  const ping = setInterval(() => {
    if (!alive) return ws.terminate()

    alive = false
    ws.ping()
  }, 30_000)

  ws.on('close', () => clearInterval(ping))
})

server.listen(3001)
```
:::

Bir nechta instansiya bo'lsa, `rooms` xotirada yetmaydi — Redis pub/sub orqali instansiyalar bir-biriga xabar berishi kerak.

## Muhandislik nuqtai nazari: qaysi birini tanlash

```
Yangilanish kerakmi?
│
├── Kechikish > 3 s maqbul ──────────────▶ POLLING
│
├── Faqat server xabar beradi
│   ├── Uzluksiz server (Docker) ────────▶ SSE + LISTEN/NOTIFY
│   └── Serverless (Vercel) ─────────────▶ Boshqariladigan xizmat
│
└── Ikki tomonlama, tez-tez (chat, kursor, o'yin)
    ├── Serverless ──────────────────────▶ Pusher / Ably / Supabase
    └── Self-host ───────────────────────▶ O'z WS serveringiz
```

| Holat | Tavsiya |
| --- | --- |
| Buyurtma holati | Polling |
| To'lov tasdig'i | Polling yoki SSE |
| Xabarnoma qo'ng'irog'i | SSE |
| Dashboard hisoblagichlari | Polling (30 s) |
| Chat | WebSocket |
| Birgalikda tahrirlash | WebSocket + CRDT |
| Jonli kursorlar | WebSocket |
| Log oqimi | SSE |
| Uzoq ishning progressi | SSE yoki polling |

## Muhandislik nuqtai nazari: narx va masshtab

1000 bir vaqtdagi foydalanuvchi uchun:

| Yo'l | Server resursi | Taxminiy narx |
| --- | --- | --- |
| Polling (5 s) | 12 000 so'rov/daqiqa | Funksiya chaqiruvlari — sezilarli |
| Polling (30 s) | 2 000 so'rov/daqiqa | Arzon |
| SSE | 1000 ochiq ulanish | Uzluksiz serverda arzon, serverless'da qimmat |
| Pusher | — | ~$50–100/oy |
| O'z WS | 1000 ulanish (~1 GB RAM) | Server narxi |

Serverless'da **SSE qimmat**: har ulanish funksiya vaqtini "band qiladi" va u soniyalab hisoblanadi. 1000 ta 5 daqiqalik SSE ulanishi = 5000 daqiqa funksiya vaqti.

Shuning uchun Vercel'da: **polling yoki boshqariladigan xizmat**, SSE emas.

## Muhandislik nuqtai nazari: nima real vaqt EMAS

Ko'p "real vaqt" talablari aslida boshqa narsa:

| "Real vaqt kerak" | Aslida kerak |
| --- | --- |
| "Boshqa tab yangilansin" | `BroadcastChannel` (brauzer ichida, bepul) |
| "Forma saqlangani ko'rinsin" | `useOptimistic` (23-bob) |
| "Ro'yxat yangilansin" | `revalidatePath` + `router.refresh()` |
| "Yangi xabar bor" | Har 60 s polling yetadi |
| "Bir necha odam bir vaqtda tahrirlasa" | Optimistik qulf yoki versiya ustuni |

`BroadcastChannel` — bir brauzerning tablari orasida:

::: ts
```ts
'use client'

// Bir tabda logout bo'lsa, boshqalari ham chiqsin
const channel = new BroadcastChannel('auth')

channel.postMessage({ type: 'logout' })

channel.onmessage = (event) => {
  if (event.data.type === 'logout') window.location.href = '/login'
}
```
:::

::: js
```js
'use client'

const channel = new BroadcastChannel('auth')

channel.postMessage({ type: 'logout' })

channel.onmessage = (event) => {
  if (event.data.type === 'logout') window.location.href = '/login'
}
```
:::

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Yakuniy holatda polling to'xtamaydi | Cheksiz so'rov | `if (status !== 'PENDING') return` |
| Fon tabida polling | Batareya, trafik | `visibilityState` |
| SSE'da heartbeat yo'q | Proksi 60 s da uzadi | Har 15 s `: ping` |
| `X-Accel-Buffering` yo'q | Nginx buferlaydi, hech narsa kelmaydi | Sarlavha qo'shing |
| `abort` ni tinglamaslik | Ulanish oqadi | `request.signal` |
| `onerror` da `EventSource` ni yopish | Avtomatik qayta ulanish yo'qoladi | Yopmang |
| Ochiq Pusher kanali | Begona odam obuna bo'ladi | `private-` + auth endpoint |
| WS'da `upgrade` dan keyin auth | Ruxsatsiz ulanish qabul qilinadi | `upgrade` da tekshiring |
| WS'da ping/pong yo'q | O'lik ulanishlar to'planadi | 30 s ping |
| `pg_notify` da katta payload | 8 KB chegarasi | Faqat ID |
| Serverless'da SSE | Qimmat, 300 s da uziladi | Polling yoki xizmat |
| Real vaqtni keraksiz joyda | Murakkablik, narx | Polling yetadimi — tekshiring |

## Amaliyot

1. `router.refresh()` bilan polling yozing; yakuniy holatda to'xtashini va fon tabida so'ramasligini tasdiqlang.
2. Network panelida polling so'rovlarini sanang: 5 daqiqada nechta?
3. SSE endpointini yozing va `curl -N http://localhost:3000/api/orders/1/stream` bilan oqimni ko'ring.
4. SSE'da heartbeat'ni o'chiring va nginx orqasida 60 soniya kuting — ulanish uzilishini ko'ring.
5. Postgres trigger va `LISTEN/NOTIFY` ni ulang; boshqa terminalda `UPDATE orders SET status='PAID'` qiling va SSE'da paydo bo'lishini kuzating.
6. Pusher'da oddiy (`private-` siz) kanal yarating va boshqa brauzerdan obuna bo'ling — muammoni ko'ring, keyin `private-` ga o'tkazing.
7. `BroadcastChannel` bilan ikki tabda logout sinxronizatsiyasini yozing.

## Rasmiy hujjat

- Streaming: <https://nextjs.org/docs/app/getting-started/linking-and-navigating#streaming>
- Route Handlers (streaming): <https://nextjs.org/docs/app/api-reference/file-conventions/route>
- SSE (MDN): <https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events>
- `BroadcastChannel`: <https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel>
- Pusher Channels: <https://pusher.com/docs/channels/>
- Postgres `NOTIFY`: <https://www.postgresql.org/docs/current/sql-notify.html>
