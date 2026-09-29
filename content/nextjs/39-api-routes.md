# 39 — API Routes

[← Oldingi: Pages Router asoslari](38-pages-router.md) · [Mundarija](README.md) · [Keyingi: Pages → App migratsiyasi →](40-migratsiya.md)

## Tushuncha

Pages Router'da backend qatlami — `pages/api/`. Har fayl bitta endpoint, eksport qilingan funksiya barcha HTTP metodlarini qabul qiladi:

```
pages/api/
├── hello.ts              →  /api/hello
├── orders/index.ts       →  /api/orders
├── orders/[id].ts        →  /api/orders/42
└── webhooks/stripe.ts    →  /api/webhooks/stripe
```

App Router'dagi Route Handlers (15-bob) bilan solishtirganda:

| | API Routes | Route Handlers |
| --- | --- | --- |
| Fayl | `pages/api/orders.ts` | `app/api/orders/route.ts` |
| Eksport | Bitta `default` funksiya | `GET`, `POST`, … alohida |
| So'rov | `NextApiRequest` (Node) | `Request` (Web API) |
| Javob | `res.status().json()` | `return Response.json()` |
| Tana | `req.body` (avtomatik parse) | `await request.json()` |
| Cookie | `req.cookies`, `res.setHeader` | `cookies()`, `response.cookies` |
| Edge runtime | Cheklangan | ✅ Tabiiy |

Farq sirtqi emas: API Routes **Node.js** obyektlariga (Express uslubi), Route Handlers **Web standartlariga** tayanadi.

## Nega shunday

`NextApiRequest` — `http.IncomingMessage` ning kengaytmasi. U Node'ga bog'langan: Edge runtime'da, Cloudflare Workers'da, Deno'da ishlamaydi.

Route Handlers `Request`/`Response` — brauzerda, Node'da, Edge'da, Workers'da bir xil ishlaydigan standart. Shu sababli:

```
API Route:        req.body           ← Next o'zi parse qilgan
Route Handler:    await request.json()   ← standart Web API
```

Ikkinchisi bir qadam ko'proq, lekin **hamma joyda bir xil**.

## Kod: asosiy shakl

::: ts
```ts
// pages/api/orders/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = { order: Order } | { error: string }

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Data>,
) {
  const { id } = request.query

  switch (request.method) {
    case 'GET': {
      const order = await getOrder(Number(id))

      if (!order) return response.status(404).json({ error: 'Topilmadi' })

      return response.status(200).json({ order })
    }

    case 'PATCH': {
      const parsed = updateSchema.safeParse(request.body)     // body AVTOMATIK parse qilingan

      if (!parsed.success) {
        return response.status(422).json({ error: 'Noto\'g\'ri ma\'lumot' })
      }

      const order = await updateOrder(Number(id), parsed.data)

      return response.status(200).json({ order })
    }

    case 'DELETE':
      await deleteOrder(Number(id))

      return response.status(204).end()

    default:
      response.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])

      return response.status(405).json({ error: `${request.method} qo'llanilmaydi` })
  }
}
```
:::

::: js
```js
// pages/api/orders/[id].js
export default async function handler(request, response) {
  const { id } = request.query

  switch (request.method) {
    case 'GET': {
      const order = await getOrder(Number(id))

      if (!order) return response.status(404).json({ error: 'Topilmadi' })

      return response.status(200).json({ order })
    }

    case 'PATCH': {
      const parsed = updateSchema.safeParse(request.body)

      if (!parsed.success) return response.status(422).json({ error: 'Noto\'g\'ri ma\'lumot' })

      const order = await updateOrder(Number(id), parsed.data)

      return response.status(200).json({ order })
    }

    case 'DELETE':
      await deleteOrder(Number(id))

      return response.status(204).end()

    default:
      response.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])

      return response.status(405).json({ error: `${request.method} qo'llanilmaydi` })
  }
}
```
:::

`switch (request.method)` — API Routes'ning eng tanilgan naqshi. **Har doim `default` yozing**: usiz noma'lum metod 200 va bo'sh javob oladi.

App Router ekvivalenti — metodlar alohida funksiya:

::: ts
```ts
// app/api/orders/[id]/route.ts
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  if (!order) return Response.json({ error: 'Topilmadi' }, { status: 404 })

  return Response.json({ order })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = updateSchema.safeParse(await request.json())

  if (!parsed.success) return Response.json({ error: 'Noto\'g\'ri ma\'lumot' }, { status: 422 })

  return Response.json({ order: await updateOrder(Number(id), parsed.data) })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  await deleteOrder(Number(id))

  return new Response(null, { status: 204 })
}
// 405 avtomatik: eksport qilinmagan metod o'zi rad etiladi
```
:::

::: js
```js
// app/api/orders/[id]/route.js
export async function GET(request, { params }) {
  const { id } = await params
  const order = await getOrder(Number(id))

  if (!order) return Response.json({ error: 'Topilmadi' }, { status: 404 })

  return Response.json({ order })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  await deleteOrder(Number(id))

  return new Response(null, { status: 204 })
}
```
:::

## Kod: `config` — tana parsingi

API Routes'da tana avtomatik parse qilinadi. Ba'zan bu **kerak emas**:

::: ts
```ts
// pages/api/webhooks/stripe.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { buffer } from 'node:stream/consumers'
import { stripe } from '@/lib/stripe'

// Imzo XOM tana bo'yicha hisoblanadi — parse qilinsa mos kelmaydi (35-bob)
export const config = {
  api: { bodyParser: false },
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') return response.status(405).end()

  const raw = await buffer(request)
  const signature = request.headers['stripe-signature'] as string

  let event

  try {
    event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return response.status(400).json({ error: 'Imzo noto\'g\'ri' })
  }

  // ... 35-bobdagi ishlov

  return response.json({ received: true })
}
```
:::

::: js
```js
// pages/api/webhooks/stripe.js
import { buffer } from 'node:stream/consumers'
import { stripe } from '@/lib/stripe'

export const config = { api: { bodyParser: false } }

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).end()

  const raw = await buffer(request)
  const signature = request.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return response.status(400).json({ error: 'Imzo noto\'g\'ri' })
  }

  return response.json({ received: true })
}
```
:::

App Router'da bu muammo yo'q: `request.text()` har doim xom tanani beradi.

Boshqa `config` sozlamalari:

```ts
export const config = {
  api: {
    bodyParser: { sizeLimit: '4mb' },      // sukut bo'yicha 1 MB
    responseLimit: '8mb',                  // sukut bo'yicha 4 MB
    externalResolver: true,                // javobni Next emas, siz boshqarasiz
  },
  maxDuration: 60,
  runtime: 'edge',                         // cheklangan
}
```

## Kod: cookie va sarlavhalar

::: ts
```ts
export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  // O'qish — avtomatik parse qilingan
  const token = request.cookies.access_token

  // Yozish — qo'lda satr yig'iladi
  response.setHeader('Set-Cookie', [
    `access_token=${newToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900`,
    `refresh_token=${refresh}; HttpOnly; Secure; SameSite=Lax; Path=/api/auth; Max-Age=2592000`,
  ])

  return response.json({ ok: true })
}
```
:::

::: js
```js
export default async function handler(request, response) {
  const token = request.cookies.access_token

  response.setHeader('Set-Cookie', [
    `access_token=${newToken}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=900`,
  ])

  return response.json({ ok: true })
}
```
:::

Cookie satrini qo'lda yig'ish xatoga moyil (`cookie` paketi yordam beradi). App Router'da `response.cookies.set({ ... })` — obyekt bilan (26-bob).

## Kod: CORS

API Routes'da ko'p uchraydi, chunki SPA boshqa domendan chaqiradi:

::: ts
```ts
// lib/cors.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const ALLOWED = ['https://app.example.com', 'https://admin.example.com']

export function withCors(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void,
) {
  return async (request: NextApiRequest, response: NextApiResponse) => {
    const origin = request.headers.origin ?? ''

    // Oq ro'yxat — '*' EMAS (credentials bilan ishlamaydi va xavfsiz emas)
    if (ALLOWED.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Access-Control-Allow-Credentials', 'true')
      response.setHeader('Vary', 'Origin')
    }

    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (request.method === 'OPTIONS') return response.status(204).end()

    return handler(request, response)
  }
}

// Ishlatish
export default withCors(handler)
```
:::

::: js
```js
// lib/cors.js
const ALLOWED = ['https://app.example.com', 'https://admin.example.com']

export function withCors(handler) {
  return async (request, response) => {
    const origin = request.headers.origin ?? ''

    if (ALLOWED.includes(origin)) {
      response.setHeader('Access-Control-Allow-Origin', origin)
      response.setHeader('Access-Control-Allow-Credentials', 'true')
      response.setHeader('Vary', 'Origin')
    }

    response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (request.method === 'OPTIONS') return response.status(204).end()

    return handler(request, response)
  }
}
```
:::

`Vary: Origin` majburiy — usiz CDN bitta origin uchun qaytargan javobni boshqasiga beradi.

`Access-Control-Allow-Origin: *` bilan `Allow-Credentials: true` **birga ishlamaydi** (brauzer rad etadi) va xavfsiz emas.

## Kod: HOC naqshlari

API Routes'da o'rovchi funksiyalar (higher-order) keng tarqalgan — middleware o'rnini bosadi:

::: ts
```ts
// lib/with-auth.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export type AuthedRequest = NextApiRequest & { user: { id: number; roles: string[] } }

export function withAuth(
  handler: (req: AuthedRequest, res: NextApiResponse) => Promise<void> | void,
) {
  return async (request: NextApiRequest, response: NextApiResponse) => {
    const token = request.cookies.access_token

    if (!token) return response.status(401).json({ error: 'Kirish kerak' })

    const user = await verifyToken(token)

    if (!user) return response.status(401).json({ error: 'Token yaroqsiz' })

    return handler(Object.assign(request, { user }) as AuthedRequest, response)
  }
}

export function withRole(role: string, handler: Parameters<typeof withAuth>[0]) {
  return withAuth(async (request, response) => {
    if (!request.user.roles.includes(role)) {
      return response.status(403).json({ error: 'Ruxsat yo\'q' })
    }

    return handler(request, response)
  })
}

// Ishlatish — o'ramlar ustma-ust
export default withCors(withRole('admin', handler))
```
:::

::: js
```js
// lib/with-auth.js
export function withAuth(handler) {
  return async (request, response) => {
    const token = request.cookies.access_token

    if (!token) return response.status(401).json({ error: 'Kirish kerak' })

    const user = await verifyToken(token)

    if (!user) return response.status(401).json({ error: 'Token yaroqsiz' })

    request.user = user

    return handler(request, response)
  }
}

export function withRole(role, handler) {
  return withAuth(async (request, response) => {
    if (!request.user.roles.includes(role)) {
      return response.status(403).json({ error: 'Ruxsat yo\'q' })
    }

    return handler(request, response)
  })
}

export default withCors(withRole('admin', handler))
```
:::

App Router'da bu naqsh **kerak emas**: tekshiruv DAL'da, ma'lumotga eng yaqin joyda (30-bob). O'ramlar zanjiri o'rniga funksiya chaqiruvi:

::: ts
```ts
export async function DELETE(request: Request) {
  await requireRole('admin')          // bitta qator

  // ...
}
```
:::

::: js
```js
export async function DELETE(request) {
  await requireRole('admin')

  // ...
}
```
:::

## Kod: fayl yuklash

API Routes'da `formidable` yoki `multer` ishlatiladi:

::: ts
```ts
// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import { readFile } from 'node:fs/promises'

export const config = { api: { bodyParser: false } }

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (request.method !== 'POST') return response.status(405).end()

  const form = formidable({ maxFileSize: 5 * 1024 * 1024, keepExtensions: false })
  const [, files] = await form.parse(request)
  const file = Array.isArray(files.file) ? files.file[0] : files.file

  if (!file) return response.status(400).json({ error: 'Fayl yo\'q' })

  const buffer = await readFile(file.filepath)

  // ... S3 ga yuklash (34-bob)

  return response.json({ ok: true })
}
```
:::

::: js
```js
// pages/api/upload.js
import formidable from 'formidable'
import { readFile } from 'node:fs/promises'

export const config = { api: { bodyParser: false } }

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).end()

  const form = formidable({ maxFileSize: 5 * 1024 * 1024 })
  const [, files] = await form.parse(request)
  const file = Array.isArray(files.file) ? files.file[0] : files.file

  if (!file) return response.status(400).json({ error: 'Fayl yo\'q' })

  const buffer = await readFile(file.filepath)

  return response.json({ ok: true })
}
```
:::

App Router'da qo'shimcha paket kerak emas — `formData()` standart:

::: ts
```ts
export async function POST(request: Request) {
  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) return Response.json({ error: 'Fayl yo\'q' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())

  // ...
}
```
:::

::: js
```js
export async function POST(request) {
  const form = await request.formData()
  const file = form.get('file')

  if (!(file instanceof File)) return Response.json({ error: 'Fayl yo\'q' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
}
```
:::

## Muhandislik nuqtai nazari: API Routes hali kerakmi

App Router'ga o'tgandan keyin ham ba'zi endpointlar qoladi:

| Holat | Kerakmi | Nega |
| --- | --- | --- |
| Mobil ilova chaqiradi | ✅ Ha | Server Action mos emas |
| Tashqi webhook | ✅ Ha | HTTP endpoint kerak |
| Uchinchi tomon integratsiyasi | ✅ Ha | Public API |
| Cron (36-bob) | ✅ Ha | HTTP orqali chaqiriladi |
| Fayl yuklab olish | ✅ Ha | Oqim javobi |
| O'z sahifangizdan ma'lumot olish | ❌ Yo'q | Server komponent |
| O'z formangiz | ❌ Yo'q | Server Action |
| Klient holatini yangilash | ❌ Yo'q | `revalidatePath` |

Ya'ni API qatlami yo'qolmaydi — u **tashqi iste'molchilar uchun** qoladi. Ichki ehtiyoj server komponentlar va Server Action'lar bilan qoplanadi.

## Muhandislik nuqtai nazari: ikkalasi birga

Migratsiya davrida `pages/api/` va `app/api/` **birga yashaydi**. Bitta qoida: **bir yo'l ikkalasida bo'lmasin**.

```
pages/api/orders.ts    →  /api/orders
app/api/orders/route.ts →  /api/orders      ← TO'QNASHUV
```

Next build vaqtida ogohlantiradi, lekin natija aniqlanmagan. Ko'chirganda eski faylni **darhol o'chiring**.

Xavfsiz tartib:

```
1. app/api/orders/route.ts yozing
2. Sinang (lokal, preview)
3. pages/api/orders.ts ni o'chiring
4. Bir commit'da deploy qiling
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `default` holat yo'q | Noma'lum metod 200 oladi | 405 + `Allow` |
| Webhook'da `bodyParser` yoqiq | Imzo tekshiruvi sinadi | `bodyParser: false` |
| `Access-Control-Allow-Origin: *` | Xavfsizlik, credentials ishlamaydi | Oq ro'yxat |
| `Vary: Origin` yo'q | CDN noto'g'ri javob keshlaydi | Sarlavha qo'shing |
| `res.json()` dan keyin yana `res.send()` | `Headers already sent` | `return` yozing |
| `await` siz javob | So'rov osilib qoladi | Har yo'lda javob |
| Bir yo'l ikkala routerda | Aniqlanmagan xatti-harakat | Bittasini o'chiring |
| `req.query` ga ishonish | `string | string[]` bo'lishi mumkin | Normallashtiring |
| Xato tafsilotini qaytarish | Ichki ma'lumot sizadi | Umumiy xabar + log |
| Ruxsat tekshirmaslik | Ochiq endpoint | `withAuth` / DAL |

## Amaliyot

1. `pages/api/orders/[id].ts` yozing: GET, PATCH, DELETE, 405.
2. `curl -X PUT` bilan chaqiring — 405 va `Allow` sarlavhasi kelishini tasdiqlang.
3. `withAuth` va `withRole` o'ramlarini yozing va ularni ustma-ust qo'ying.
4. Bir xil endpointni App Router'da qayta yozing; qator sonini va o'ramlar sonini solishtiring.
5. `bodyParser: false` bilan xom tana o'qing va uning uzunligini logga chiqaring.
6. CORS o'ramini yozing va boshqa domendan `fetch` qilib sinab ko'ring.
7. Bir yo'lni ikkala routerda yarating va `next build` nima deyishini ko'ring.

## Rasmiy hujjat

- API Routes: <https://nextjs.org/docs/pages/building-your-application/routing/api-routes>
- `config` obyekti: <https://nextjs.org/docs/pages/api-reference/functions/next-server>
- Route Handlers: <https://nextjs.org/docs/app/api-reference/file-conventions/route>
- CORS: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>
