# 33 — Drizzle va SQL yondashuvi

[← Oldingi: Ma'lumotlar bazasi: Prisma](32-prisma.md) · [Mundarija](README.md) · [Keyingi: Fayl yuklash va saqlash →](34-fayl-yuklash.md)

## Tushuncha

Prisma o'z sxema tilini, o'z so'rov sintaksisini va generatsiya qadamini olib keladi. **Drizzle** boshqa yo'ldan boradi: sxema oddiy TypeScript fayli, so'rovlar SQL'ga bir-bir mos keladi, generatsiya qadami yo'q.

```
Prisma:   schema.prisma ──generate──▶ @prisma/client ──▶ so'rov
Drizzle:  schema.ts     ──────────────────────────────▶ so'rov
                          (tiplar shu fayldan chiqariladi)
```

Amaliy farq: Drizzle'da `db.select().from(orders).where(eq(orders.userId, 1))` yozganingizda, chiqadigan SQL'ni boshingizda ko'rasiz. Prisma'da ko'rmaysiz (`log: ['query']` yoqmaguningizcha).

Bu bob Drizzle'ni ko'rsatadi va **qaysi birini qachon tanlash** kerakligini aniqlaydi.

## Nega shunday

Uch sabab Drizzle'ni tanlashga olib keladi:

1. **Serverless / Edge.** Drizzle klienti kichik (~10 KB), Prisma'da Rust dvigateli bor edi (yangi versiyalarda TypeScript'ga o'tdi, lekin baribir og'irroq). Edge runtime'da Drizzle muammosiz ishlaydi.
2. **SQL nazorati.** Murakkab so'rov (window funksiyalar, CTE, `LATERAL JOIN`) Prisma'da `$queryRaw` ga tushadi — va tiplar yo'qoladi. Drizzle'da ular tabiiy.
3. **Generatsiya qadami yo'q.** `postinstall`, `prisma generate`, kesh muammolari — hech biri yo'q.

Narxi ham bor: Drizzle'da ko'proq yozasiz, migratsiya vositalari yoshroq, va relation so'rovlari Prisma'dagichalik qulay emas.

## Kod: o'rnatish va sxema

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

::: ts
```ts
// db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  numeric,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roleEnum = pgEnum('role', ['USER', 'MANAGER', 'ADMIN'])
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('USER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
)

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    number: varchar('number', { length: 32 }).notNull(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    total: numeric('total', { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum('status').notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('orders_number_idx').on(table.number),
    index('orders_user_created_idx').on(table.userId, table.createdAt),
  ],
)

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  price: numeric('price', { precision: 12, scale: 2 }).notNull(),
  qty: integer('qty').notNull(),
})

// Relation'lar — `db.query` uchun (alohida e'lon qilinadi)
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}))

// Tiplar sxemadan chiqariladi — hech narsa generatsiya qilinmaydi
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Order = typeof orders.$inferSelect
```
:::

::: js
```js
// db/schema.js
import {
  pgTable, serial, varchar, integer, timestamp, numeric, pgEnum, index, uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const roleEnum = pgEnum('role', ['USER', 'MANAGER', 'ADMIN'])
export const orderStatusEnum = pgEnum('order_status', ['PENDING', 'PAID', 'SHIPPED', 'CANCELLED'])

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 120 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    role: roleEnum('role').notNull().default('USER'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
)

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    number: varchar('number', { length: 32 }).notNull(),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    total: numeric('total', { precision: 12, scale: 2 }).notNull(),
    status: orderStatusEnum('status').notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('orders_number_idx').on(table.number),
    index('orders_user_created_idx').on(table.userId, table.createdAt),
  ],
)

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}))
```

> JavaScript'da Drizzle'ning asosiy foydasi — tiplar — yo'qoladi.
> Drizzle TypeScript uchun qurilgan; JS loyihasida Prisma qulayroq.
:::

Sxema — oddiy TS fayli. `users.email` — bu ustun obyekti, va uni so'rovda ishlatganda tahrirlagich avtomatik to'ldiradi.

## Kod: klient

::: ts
```ts
// db/index.ts
import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { client?: ReturnType<typeof postgres> }

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL!, {
    max: process.env.NODE_ENV === 'production' ? 10 : 1,
    prepare: false,                               // PgBouncer transaction rejimi uchun
  })

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })
```
:::

::: js
```js
// db/index.js
import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const globalForDb = globalThis

const client =
  globalForDb.client ??
  postgres(process.env.DATABASE_URL, {
    max: process.env.NODE_ENV === 'production' ? 10 : 1,
    prepare: false,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.client = client

export const db = drizzle(client, { schema, logger: process.env.NODE_ENV === 'development' })
```
:::

Singleton naqshi Prisma'dagi bilan bir xil sababdan (32-bob): hot reload ulanishlarni tugatmasin.

`prepare: false` — PgBouncer transaction rejimida prepared statement ishlamaydi. Pooler ishlatsangiz majburiy.

## Kod: migratsiya

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
```

```bash
npx drizzle-kit generate          # sxemadan SQL migratsiya yozadi
npx drizzle-kit migrate           # qo'llaydi
npx drizzle-kit push              # migratsiyasiz to'g'ridan-to'g'ri (faqat dev/prototip)
npx drizzle-kit studio            # brauzerdagi ko'rish vositasi
```

`generate` chiqargan SQL — oddiy `.sql` fayl, uni o'qib, tahrirlab, review'ga qo'yish mumkin:

```sql
-- drizzle/0001_add_order_status_index.sql
CREATE INDEX "orders_status_idx" ON "orders" ("status");
```

Prisma'dan farqi shu: SQL ko'rinib turadi va uni **qo'lda o'zgartirsangiz ham bo'ladi** (masalan `CREATE INDEX CONCURRENTLY` ga aylantirish — katta jadvalda jadval qulflanmasligi uchun).

## Kod: so'rovlar — ikki uslub

Drizzle ikki API beradi.

**1. SQL-ga yaqin (`select`):**

::: ts
```ts
// db/queries/orders.ts
import 'server-only'
import { eq, and, desc, gte, sql, count } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, users } from '@/db/schema'

export async function listOrders(userId: number) {
  return db
    .select({
      id: orders.id,
      number: orders.number,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      itemCount: count(orderItems.id),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.userId, userId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))
    .limit(20)
}
```
:::

::: js
```js
// db/queries/orders.js
import 'server-only'
import { eq, desc, count } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems } from '@/db/schema'

export async function listOrders(userId) {
  return db
    .select({
      id: orders.id,
      number: orders.number,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      itemCount: count(orderItems.id),
    })
    .from(orders)
    .leftJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(eq(orders.userId, userId))
    .groupBy(orders.id)
    .orderBy(desc(orders.createdAt))
    .limit(20)
}
```
:::

SQL bilan taqqoslang — bir xil tartib, bir xil tushunchalar:

```sql
SELECT o.id, o.number, o.total, o.status, o.created_at, count(i.id)
FROM orders o
LEFT JOIN order_items i ON i.order_id = o.id
WHERE o.user_id = $1
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 20;
```

**2. Relation API (`db.query`) — Prisma'ga o'xshash:**

::: ts
```ts
export async function getOrder(id: number) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { id: true, number: true, total: true, status: true, createdAt: true },
    with: {
      user: { columns: { id: true, name: true, email: true } },
      items: { columns: { title: true, price: true, qty: true } },
    },
  })
}
```
:::

::: js
```js
export async function getOrder(id) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { id: true, number: true, total: true, status: true, createdAt: true },
    with: {
      user: { columns: { id: true, name: true, email: true } },
      items: { columns: { title: true, price: true, qty: true } },
    },
  })
}
```
:::

`db.query` ishlashi uchun klientga `{ schema }` berilgan bo'lishi va `relations()` e'lon qilingan bo'lishi kerak. Yozilmagan bo'lsa, `db.query.orders` `undefined` bo'ladi — bu eng ko'p uchraydigan boshlang'ich xato.

| | `db.select()` | `db.query` |
| --- | --- | --- |
| SQL'ga mosligi | 1:1 | Abstraktsiya |
| Bog'langan ma'lumot | Qo'lda JOIN | `with: { ... }` |
| Agregatsiya, CTE, window | ✅ Tabiiy | ❌ Yo'q |
| Boshlash osonligi | SQL bilish kerak | Osonroq |

## Kod: mutatsiya va tranzaksiya

::: ts
```ts
// app/(app)/orders/actions.ts
'use server'

import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { requireSession } from '@/lib/dal'

export async function createOrder(input: { productId: number; qty: number }[]) {
  const session = await requireSession()

  const created = await db.transaction(async (tx) => {
    const ids = input.map((i) => i.productId)

    const rows = await tx
      .select({ id: products.id, title: products.title, price: products.price, stock: products.stock })
      .from(products)
      .where(inArray(products.id, ids))
      .for('update')                               // SELECT ... FOR UPDATE — qatorlarni qulflaydi

    for (const item of input) {
      const product = rows.find((r) => r.id === item.productId)

      if (!product) throw new Error('Mahsulot topilmadi')
      if (product.stock < item.qty) throw new Error(`"${product.title}" yetarli emas`)
    }

    for (const item of input) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(eq(products.id, item.productId))
    }

    const total = input.reduce((sum, item) => {
      const product = rows.find((r) => r.id === item.productId)!

      return sum + Number(product.price) * item.qty
    }, 0)

    const [order] = await tx
      .insert(orders)
      .values({
        number: `ORD-${Date.now()}`,
        userId: session.userId,
        total: total.toFixed(2),
      })
      .returning({ id: orders.id, number: orders.number })

    await tx.insert(orderItems).values(
      input.map((item) => {
        const product = rows.find((r) => r.id === item.productId)!

        return { orderId: order.id, title: product.title, price: product.price, qty: item.qty }
      }),
    )

    return order
  })

  revalidatePath('/orders')

  return { ok: true, number: created.number }
}
```
:::

::: js
```js
'use server'

import { eq, inArray, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { requireSession } from '@/lib/dal'

export async function createOrder(input) {
  const session = await requireSession()

  const created = await db.transaction(async (tx) => {
    const ids = input.map((i) => i.productId)

    const rows = await tx
      .select({ id: products.id, title: products.title, price: products.price, stock: products.stock })
      .from(products)
      .where(inArray(products.id, ids))
      .for('update')

    for (const item of input) {
      const product = rows.find((r) => r.id === item.productId)

      if (!product) throw new Error('Mahsulot topilmadi')
      if (product.stock < item.qty) throw new Error(`"${product.title}" yetarli emas`)
    }

    for (const item of input) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(eq(products.id, item.productId))
    }

    const [order] = await tx
      .insert(orders)
      .values({ number: `ORD-${Date.now()}`, userId: session.userId, total: '0.00' })
      .returning({ id: orders.id, number: orders.number })

    return order
  })

  revalidatePath('/orders')

  return { ok: true, number: created.number }
}
```
:::

Ikki narsa Prisma'da yo'q edi:

1. **`.for('update')`** — `SELECT ... FOR UPDATE`. Qatorlarni tranzaksiya oxirigacha qulflaydi, ya'ni ikki parallel buyurtma bir qoldiqni ikki marta olmaydi. Prisma'da buni `$queryRaw` bilan qilish kerak.
2. **`.returning()`** — `INSERT ... RETURNING`. Yaratilgan qatorni qaytaradi, qo'shimcha `SELECT` kerak emas.

## Kod: xom SQL va tiplar

::: ts
```ts
import { sql } from 'drizzle-orm'

// Tipli xom SQL
const rows = await db.execute<{ month: string; revenue: string }>(sql`
  SELECT
    to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
    sum(total)                                          AS revenue
  FROM orders
  WHERE status = 'PAID'
    AND created_at >= now() - interval '12 months'
  GROUP BY 1
  ORDER BY 1
`)

// Parametrlar avtomatik bog'lanadi — SQL injection yo'q
const userId = 42
const mine = await db.execute(sql`SELECT * FROM orders WHERE user_id = ${userId}`)
```
:::

::: js
```js
import { sql } from 'drizzle-orm'

const rows = await db.execute(sql`
  SELECT
    to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
    sum(total)                                          AS revenue
  FROM orders
  WHERE status = 'PAID'
    AND created_at >= now() - interval '12 months'
  GROUP BY 1
  ORDER BY 1
`)
```
:::

`sql` shablon literali parametrlarni `$1`, `$2` ga aylantiradi. **Hech qachon** satr birlashtirish bilan SQL qurmang:

```ts
// ❌ SQL injection
db.execute(sql.raw(`SELECT * FROM orders WHERE number = '${input}'`))

// ✅
db.execute(sql`SELECT * FROM orders WHERE number = ${input}`)
```

`sql.raw` faqat **ishonchli, foydalanuvchidan kelmagan** qismlar uchun (masalan ustun nomi oq ro'yxatdan tanlangan bo'lsa).

## Kod: server komponentda

::: ts
```tsx
// app/(app)/orders/page.tsx
import { requireSession } from '@/lib/dal'
import { listOrders } from '@/db/queries/orders'

export default async function OrdersPage() {
  const session = await requireSession()
  const rows = await listOrders(session.userId)

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.number}</td>
            <td>{Number(row.total).toLocaleString('uz-UZ')} so'm</td>
            <td>{row.itemCount} ta</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```
:::

::: js
```jsx
import { requireSession } from '@/lib/dal'
import { listOrders } from '@/db/queries/orders'

export default async function OrdersPage() {
  const session = await requireSession()
  const rows = await listOrders(session.userId)

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.number}</td>
            <td>{Number(row.total).toLocaleString('uz-UZ')} so'm</td>
            <td>{row.itemCount} ta</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```
:::

`numeric` ustuni Drizzle'da **satr** bo'lib keladi (aniqlik yo'qolmasligi uchun). `Number(row.total)` — ko'rsatish uchun; hisob-kitob bazada yoki `decimal.js` bilan qilinadi.

Yaxshi tomoni: satr JSON'ga muammosiz seriyalanadi — Prisma'dagi `Decimal` muammosi yo'q (32-bob).

## Muhandislik nuqtai nazari: Prisma yoki Drizzle

| Mezon | Prisma | Drizzle |
| --- | --- | --- |
| Boshlash tezligi | ✅ Tezroq | Sekinroq (SQL bilish kerak) |
| Sxema o'qilishi | ✅ `.prisma` fayli ixcham | TS fayli uzunroq |
| Tiplar | Generatsiya qilinadi | Sxemadan chiqariladi |
| Generatsiya qadami | Bor (`postinstall`) | ✅ Yo'q |
| Bundle hajmi | Kattaroq | ✅ ~10 KB |
| Edge runtime | Cheklangan | ✅ To'liq |
| Murakkab SQL | `$queryRaw`, tiplarsiz | ✅ Tabiiy |
| `FOR UPDATE`, CTE, window | Qiyin | ✅ Bor |
| Migratsiya vositalari | ✅ Yetuk | Yoshroq |
| Relation so'rovlari | ✅ Qulay | Yaxshi, lekin cheklangan |
| Studio / ko'rish | ✅ Prisma Studio | Drizzle Studio |
| Hamjamiyat, misollar | ✅ Kattaroq | O'sib boryapti |
| JavaScript (TS'siz) | ✅ Ishlaydi | ⚠️ Foydasi yo'qoladi |

**Tanlov qoidasi:**

- SQL'ni bilmaysiz yoki tez boshlash kerak → **Prisma**
- Edge/serverless, murakkab so'rovlar, SQL'ni yaxshi bilasiz → **Drizzle**
- JavaScript (TypeScript'siz) → **Prisma**
- Mavjud bazani olib ketyapsiz (legacy sxema) → **Drizzle** (moslashuvchanroq) yoki `prisma db pull`

Ikkalasi ham yaxshi. Yomon tanlov — **ikkalasini bir loyihada** ishlatish.

## Muhandislik nuqtai nazari: nima ikkalasida ham bir xil

ORM tanlovidan qat'i nazar, quyidagilar o'zgarmaydi:

1. **Singleton klient** — hot reload ulanishlarni tugatmasin;
2. **`select` bilan maydon tanlash** — parol xeshi sahifaga chiqmasin;
3. **`limit` har doim** — limitsiz ro'yxat bir yildan keyin sahifani o'ldiradi;
4. **Tranzaksiya** — bog'liq yozuvlar birga;
5. **Indeks** — `where` va `order by` ustunlariga;
6. **Ruxsat tekshiruvi ma'lumot yonida** (30-bob);
7. **Pooler** serverless'da (32-bob);
8. **`server-only`** — DB kodi klient bundle'ga tushmasin.

ORM — detal. Bu sakkiztasi — arxitektura.

## Muhandislik nuqtai nazari: migratsiyani xavfsiz qilish

Ikkala vositada ham bir xil qoidalar:

| Amal | Xavf | Xavfsiz yo'l |
| --- | --- | --- |
| Ustun o'chirish | Eski kod hali o'qiydi | Ikki reliz: avval kod, keyin ustun |
| Ustun nomini o'zgartirish | Bir zumda buziladi | Yangi ustun → ko'chirish → eski o'chirish |
| `NOT NULL` qo'shish | Mavjud qatorlar buziladi | `DEFAULT` bilan → to'ldirish → `NOT NULL` |
| Katta jadvalga indeks | Jadval qulflanadi | `CREATE INDEX CONCURRENTLY` |
| Tip o'zgartirish | Jadval qayta yoziladi | Yangi ustun + ko'chirish |

Drizzle chiqargan SQL faylini qo'lda tahrirlash mumkin — `CONCURRENTLY` qo'shish uchun aynan shu kerak bo'ladi:

```sql
-- drizzle/0007_add_status_index.sql
-- Qo'lda tahrirlangan: CONCURRENTLY qo'shildi, tranzaksiya o'chirildi
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_status_idx" ON "orders" ("status");
```

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| Klientga `{ schema }` bermaslik | `db.query.orders` — `undefined` | `drizzle(client, { schema })` |
| `relations()` yozmaslik | `with: {}` ishlamaydi | Har jadvalga `relations` |
| Singleton yo'q | `Too many connections` | `globalThis` naqshi |
| Pooler bilan `prepare: true` | So'rovlar sinadi | `prepare: false` |
| `sql.raw` ga foydalanuvchi kiritmasi | SQL injection | `sql` shablon literali |
| `numeric` ni son deb o'ylash | `"120.00" * 2` — xato | Satr keladi, `Number()` bilan |
| `limit` yozmaslik | Butun jadval | `.limit(20)` |
| `push` ni productionda | Ma'lumot yo'qolishi | `generate` + `migrate` |
| Prisma va Drizzle birga | Ikki ulanish pool, chalkashlik | Bittasini tanlang |
| `db.query` da `columns` yozmaslik | Hamma ustun keladi | `columns: { ... }` |

## Amaliyot

1. Drizzle sxemasini yozing (users, orders, order_items), `generate` + `migrate` bilan bazani yarating.
2. Chiqarilgan SQL faylini o'qing — Drizzle qanday SQL yozganini ko'ring.
3. Bitta so'rovni `db.select()` va `db.query` bilan ikki xil yozing; `logger: true` bilan SQL'larni solishtiring.
4. `relations()` ni o'chirib, `db.query.orders` nima qaytarishini ko'ring.
5. `.for('update')` siz ikki parallel buyurtma yarating va qoldiq manfiy bo'lib ketishini ko'ring. Keyin qulf qo'shib qayta sinang.
6. Oylik daromad hisobotini `sql` shablon literali bilan yozing (window yoki `date_trunc`).
7. 32-bobdagi Prisma versiyasi bilan bir xil sahifani yozing va ikkalasining kodini solishtiring: qaysi biri sizga tushunarliroq?

## Rasmiy hujjat

- Drizzle: <https://orm.drizzle.team/docs/overview>
- Sxema (PostgreSQL): <https://orm.drizzle.team/docs/column-types/pg>
- Relation so'rovlari: <https://orm.drizzle.team/docs/rqb>
- drizzle-kit migratsiyalari: <https://orm.drizzle.team/docs/kit-overview>
- Next.js bilan: <https://orm.drizzle.team/docs/get-started/postgresql-new>
