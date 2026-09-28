# 32 — Ma'lumotlar bazasi: Prisma

[← Oldingi: Auth.js bilan](31-authjs.md) · [Mundarija](README.md) · [Keyingi: Drizzle va SQL yondashuvi →](33-drizzle.md)

## Tushuncha

Shu paytgacha ma'lumot tashqi backend'dan olindi. Endi boshqa holat: **Next'ning o'zi bazaga yozadi**. Server komponent bazaga to'g'ridan-to'g'ri so'rov yuboradi — oradagi API qatlamisiz.

```
Eski (SPA + API):
  Brauzer → API → ORM → Baza

App Router:
  Brauzer → Server komponent → ORM → Baza
```

Bu bitta sakrashni yo'qotadi va tiplar uchdan bittagacha bir xil qoladi. Narxi: Next endi backend, ya'ni migratsiya, connection pool, tranzaksiya — hammasi sizning mas'uliyatingiz.

**Prisma** — eng keng tarqalgan tanlov: sxema fayli, avtomatik migratsiya, generatsiya qilingan tipli klient.

## Nega shunday

Prisma uch qismdan iborat:

| Qism | Nima qiladi |
| --- | --- |
| `schema.prisma` | Modellar — yagona haqiqat manbai |
| `prisma migrate` | Sxemadan SQL migratsiya yaratadi |
| `@prisma/client` | Sxemadan TypeScript klient generatsiya qiladi |

Boshqa ORM'lardan farqi: **tiplar qo'lda yozilmaydi**. Sxemaga maydon qo'shsangiz, `prisma generate` klientni yangilaydi va eski kod build vaqtida sinadi.

## Kod: o'rnatish va sxema

```bash
npm install prisma --save-dev
npm install @prisma/client
npx prisma init --datasource-provider postgresql
```

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  orders    Order[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])
}

model Order {
  id        Int         @id @default(autoincrement())
  number    String      @unique
  userId    Int
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     OrderItem[]
  total     Decimal     @db.Decimal(12, 2)
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())

  @@index([userId, createdAt])
}

model OrderItem {
  id      Int     @id @default(autoincrement())
  orderId Int
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  title   String
  price   Decimal @db.Decimal(12, 2)
  qty     Int
}

enum Role {
  USER
  MANAGER
  ADMIN
}

enum OrderStatus {
  PENDING
  PAID
  SHIPPED
  CANCELLED
}
```

```bash
npx prisma migrate dev --name init      # migratsiya + generate
```

Uch detal:

1. **`Decimal`** pul uchun. `Float` — hech qachon: `0.1 + 0.2 !== 0.3`.
2. **`@@index([userId, createdAt])`** — "foydalanuvchining oxirgi buyurtmalari" so'rovi uchun. Indeks qo'shish sxema yozishda o'ylanadi, keyin emas.
3. **`onDelete: Cascade`** — buyurtma o'chsa, elementlari ham o'chadi.

## Kod: klient (singleton)

Dev rejimida hot reload har o'zgarishda modullarni qayta yuklaydi. Har safar yangi `PrismaClient` yaratilsa, connection pool tez tugaydi:

::: ts
```ts
// lib/prisma.ts
import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```
:::

::: js
```js
// lib/prisma.js
import 'server-only'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```
:::

`Error: Too many database connections` — deyarli har doim shu singleton yo'qligidan.

## Kod: so'rovlar server komponentda

::: ts
```tsx
// app/(app)/orders/page.tsx
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

export default async function OrdersPage() {
  const session = await requireSession()          // 30-bob

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          {order.number} — {order.total.toString()} so'm ({order._count.items} ta)
        </li>
      ))}
    </ul>
  )
}
```
:::

::: js
```jsx
// app/(app)/orders/page.jsx
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

export default async function OrdersPage() {
  const session = await requireSession()

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    select: {
      id: true,
      number: true,
      total: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return (
    <ul>
      {orders.map((order) => (
        <li key={order.id}>
          {order.number} — {order.total.toString()} so'm ({order._count.items} ta)
        </li>
      ))}
    </ul>
  )
}
```
:::

**`select` har doim.** `include` yoki hech narsa yozmaslik butun qatorni oladi — parol xeshi ham. Sahifada faqat kerakli maydonlar.

**`take` har doim.** Limitsiz `findMany` bugun 50 qator, bir yildan keyin 500 000 qator qaytaradi.

## Kod: Decimal va seriyalash

`Decimal` — obyekt, uni klient komponentga uzatib bo'lmaydi (16-bob):

::: ts
```ts
// lib/serialize.ts
import { Prisma } from '@prisma/client'

export function toPlain<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (v instanceof Prisma.Decimal) return v.toNumber()
      if (typeof v === 'bigint') return Number(v)

      return v
    }),
  )
}
```

```tsx
// Ishlatish
const orders = await prisma.order.findMany({ ... })

return <OrdersTable orders={toPlain(orders)} />    // klient komponent
```
:::

::: js
```js
// lib/serialize.js
import { Prisma } from '@prisma/client'

export function toPlain(value) {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (v instanceof Prisma.Decimal) return v.toNumber()
      if (typeof v === 'bigint') return Number(v)

      return v
    }),
  )
}
```
:::

Yaxshiroq yo'l — bazadan chiqishda `select` bilan kerakli ko'rinishga keltirish va DTO qaytarish:

::: ts
```ts
export async function listOrders(userId: number) {
  const rows = await prisma.order.findMany({
    where: { userId },
    select: { id: true, number: true, total: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    total: row.total.toNumber(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }))
}
```
:::

::: js
```js
export async function listOrders(userId) {
  const rows = await prisma.order.findMany({
    where: { userId },
    select: { id: true, number: true, total: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return rows.map((row) => ({
    id: row.id,
    number: row.number,
    total: row.total.toNumber(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }))
}
```
:::

## Kod: mutatsiya va tranzaksiya

::: ts
```ts
// app/(app)/orders/actions.ts
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

const schema = z.object({
  items: z
    .array(z.object({ productId: z.coerce.number().int(), qty: z.coerce.number().int().min(1) }))
    .min(1),
})

export async function createOrder(input: unknown) {
  const session = await requireSession()
  const parsed = schema.safeParse(input)

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const order = await prisma.$transaction(async (tx) => {
    // 1. Mahsulotlarni qulflab olish (narx o'zgarmasin)
    const products = await tx.product.findMany({
      where: { id: { in: parsed.data.items.map((i) => i.productId) } },
      select: { id: true, title: true, price: true, stock: true },
    })

    // 2. Qoldiqni tekshirish
    for (const item of parsed.data.items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product) throw new Error('Mahsulot topilmadi')
      if (product.stock < item.qty) throw new Error(`"${product.title}" yetarli emas`)
    }

    // 3. Qoldiqni kamaytirish
    await Promise.all(
      parsed.data.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        }),
      ),
    )

    // 4. Buyurtma yaratish
    return tx.order.create({
      data: {
        number: `ORD-${Date.now()}`,
        userId: session.userId,
        total: parsed.data.items.reduce((sum, item) => {
          const product = products.find((p) => p.id === item.productId)!

          return sum + Number(product.price) * item.qty
        }, 0),
        items: {
          create: parsed.data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!

            return { title: product.title, price: product.price, qty: item.qty }
          }),
        },
      },
      select: { id: true, number: true },
    })
  })

  revalidatePath('/orders')

  return { ok: true, number: order.number }
}
```
:::

::: js
```js
// app/(app)/orders/actions.js
'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/dal'

const schema = z.object({
  items: z
    .array(z.object({ productId: z.coerce.number().int(), qty: z.coerce.number().int().min(1) }))
    .min(1),
})

export async function createOrder(input) {
  const session = await requireSession()
  const parsed = schema.safeParse(input)

  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors }

  const order = await prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: parsed.data.items.map((i) => i.productId) } },
      select: { id: true, title: true, price: true, stock: true },
    })

    for (const item of parsed.data.items) {
      const product = products.find((p) => p.id === item.productId)

      if (!product) throw new Error('Mahsulot topilmadi')
      if (product.stock < item.qty) throw new Error(`"${product.title}" yetarli emas`)
    }

    await Promise.all(
      parsed.data.items.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.qty } },
        }),
      ),
    )

    return tx.order.create({
      data: { /* yuqoridagi bilan bir xil */ },
      select: { id: true, number: true },
    })
  })

  revalidatePath('/orders')

  return { ok: true, number: order.number }
}
```
:::

`$transaction` ichida xato tashlansa, hamma o'zgarish qaytariladi. **Qoldiqni kamaytirish va buyurtma yaratish bitta tranzaksiyada bo'lishi shart** — aks holda qoldiq kamayadi, buyurtma esa yaratilmaydi.

## Kod: N+1 muammosi

::: ts
```ts
// ❌ N+1: 1 + 20 ta so'rov
const orders = await prisma.order.findMany({ take: 20 })

for (const order of orders) {
  const user = await prisma.user.findUnique({ where: { id: order.userId } })
  ...
}

// ✅ 1 ta so'rov (JOIN)
const orders = await prisma.order.findMany({
  take: 20,
  select: {
    id: true,
    number: true,
    user: { select: { id: true, name: true } },
  },
})
```
:::

::: js
```js
// ✅ 1 ta so'rov
const orders = await prisma.order.findMany({
  take: 20,
  select: {
    id: true,
    number: true,
    user: { select: { id: true, name: true } },
  },
})
```
:::

Dev rejimida `log: ['query']` yoqilgan bo'lsa, terminalda so'rovlar soni ko'rinadi. Bir sahifani ochib, nechta `SELECT` chiqqanini sanang — bu eng tez diagnostika.

## Kod: sahifalash

Offset (`skip`) katta jadvallarda sekin. Kursor tezroq:

::: ts
```ts
export async function listOrders(userId: number, cursor?: number) {
  const rows = await prisma.order.findMany({
    where: { userId },
    take: 21,                                     // 1 tasi "keyingi bor" uchun
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { id: 'desc' },
    select: { id: true, number: true, total: true, createdAt: true },
  })

  const hasMore = rows.length > 20
  const items = hasMore ? rows.slice(0, 20) : rows

  return { items, nextCursor: hasMore ? items.at(-1)!.id : null }
}
```
:::

::: js
```js
export async function listOrders(userId, cursor) {
  const rows = await prisma.order.findMany({
    where: { userId },
    take: 21,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { id: 'desc' },
    select: { id: true, number: true, total: true, createdAt: true },
  })

  const hasMore = rows.length > 20
  const items = hasMore ? rows.slice(0, 20) : rows

  return { items, nextCursor: hasMore ? items.at(-1).id : null }
}
```
:::

## Muhandislik nuqtai nazari: connection pool va serverless

Serverless'da har so'rov yangi instansiya bo'lishi mumkin, va har biri bazaga ulanadi. 100 parallel so'rov → 100 ulanish → Postgres `max_connections` (odatda 100) tugaydi.

| Yechim | Qanday ishlaydi | Qachon |
| --- | --- | --- |
| **PgBouncer / Supavisor** | Tashqi pooler | Har qanday Postgres |
| **Prisma Accelerate** | Prisma'ning pooler + kesh xizmati | Prisma bilan |
| **Neon / PlanetScale** | Serverless drayver (HTTP) | Shu provayderlarda |
| **Uzluksiz server** | Docker/VPS — muammo yo'q | Self-host (48-bob) |

Pooler bilan `DATABASE_URL` ga `?pgbouncer=true&connection_limit=1` qo'shiladi, va migratsiya uchun alohida to'g'ridan-to'g'ri URL kerak:

```bash
DATABASE_URL="postgresql://...@pooler:6543/db?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...@db:5432/db"
```

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## Muhandislik nuqtai nazari: migratsiya va deploy

```bash
# Dev: sxemadan migratsiya yaratadi va qo'llaydi
npx prisma migrate dev --name add_status_index

# Production: faqat mavjud migratsiyalarni qo'llaydi
npx prisma migrate deploy
```

`migrate dev` ni **hech qachon** productionda ishlatmang: u bazani qayta yaratishi mumkin.

Deploy tartibi (47, 48-bob):

```
1. migrate deploy      ← eski kod hali ishlayapti
2. yangi kodni chiqarish
```

Bu **orqaga mos** migratsiyani talab qiladi: ustunni darhol o'chirmang. Ikki bosqich: (a) kod ustunni ishlatishni to'xtatadi, (b) keyingi relizda ustun o'chiriladi.

`package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

`postinstall` majburiy: Vercel kesh qilingan `node_modules` bilan build qilsa, klient generatsiya qilinmagan bo'ladi.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `PrismaClient` ni singleton qilmaslik | `Too many connections` | `globalThis` naqshi |
| `select` yozmaslik | Parol xeshi sahifaga chiqadi | Har doim `select` |
| `take` yozmaslik | Bir yildan keyin sahifa o'lik | `take: 20` |
| Pul uchun `Float` | Tiyinlar yo'qoladi | `Decimal @db.Decimal(12,2)` |
| `Decimal` ni klient komponentga uzatish | Seriyalash xatosi | `toNumber()` |
| Loopda `findUnique` | N+1 | `select` bilan JOIN |
| Tranzaksiyasiz bog'liq yozuvlar | Yarim holat | `$transaction` |
| `prisma generate` build'da yo'q | Production'da xato | `postinstall` |
| `migrate dev` productionda | Ma'lumot yo'qolishi | `migrate deploy` |
| Pooler'siz serverless | Ulanishlar tugaydi | PgBouncer / Accelerate |
| Indekssiz `where` | Sekin so'rov | `@@index` |

## Amaliyot

1. Sxema yozing (User, Order, OrderItem), `migrate dev` bilan bazani yarating.
2. Singleton'siz klient yozing va dev rejimida 20 marta hot reload qiling — ulanish xatosini ko'ring. Keyin singleton qo'shing.
3. `select` siz `findMany` qiling va javobda parol maydoni borligini ko'ring.
4. `log: ['query']` yoqib, bitta sahifani oching va so'rovlar sonini sanang; N+1 bo'lsa tuzating.
5. Tranzaksiya ichida ataylab xato tashlang — qoldiq qaytarilishini tasdiqlang.
6. 10 000 qator seed qiling va `skip: 9000` bilan kursor sahifalashni vaqt bo'yicha solishtiring.
7. `prisma studio` ni oching (`npx prisma studio`) va ma'lumotni ko'ring.

## Rasmiy hujjat

- Prisma: <https://www.prisma.io/docs>
- Next.js bilan: <https://www.prisma.io/docs/guides/nextjs>
- Connection pool: <https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections>
- Next.js — ma'lumotlar bazasi: <https://nextjs.org/docs/app/getting-started/fetching-data>
