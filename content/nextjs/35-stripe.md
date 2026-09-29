# 35 — To'lov: Stripe

[← Oldingi: Fayl yuklash va saqlash](34-fayl-yuklash.md) · [Mundarija](README.md) · [Keyingi: Xabarnomalar va fon ishlari →](36-fon-ishlari.md)

## Tushuncha

To'lov integratsiyasi boshqa integratsiyalardan bitta narsa bilan farq qiladi: **xato pulga aylanadi**. Ikki marta hisoblangan buyurtma, to'langan lekin yetkazilmagan mahsulot, tasdiqlanmagan tranzaksiya — bularning har biri real zarar.

Shuning uchun asosiy qoida: **buyurtma holatini brauzer emas, webhook belgilaydi.**

```
❌ Ishonchsiz:
   Brauzer to'laydi → /success sahifasiga qaytadi → "to'landi" deb yozamiz
                       ▲
                       └─ foydalanuvchi bu URL'ni shunchaki ochishi mumkin

✅ To'g'ri:
   Brauzer to'laydi → Stripe ──webhook──▶ bizning server → "to'landi"
                    → /success sahifasi faqat ko'rsatadi
```

Stripe misolida ko'rsatiladi, lekin naqsh har qanday to'lov tizimiga (Payme, Click, Paddle) mos: **checkout yaratish → foydalanuvchi to'laydi → webhook holatni o'zgartiradi → idempotentlik**.

## Nega shunday

Uch narsa to'lovni murakkab qiladi:

1. **Foydalanuvchi qaytmasligi mumkin.** To'lovdan keyin brauzerni yopadi, internet uziladi. Pul o'tgan, sizning bazangizda hech narsa yo'q. Webhook bundan mustaqil keladi.
2. **Webhook bir necha marta keladi.** Stripe javob olmasa qayta yuboradi (bir necha kun davomida, ortib boruvchi oraliq bilan). Bir xil hodisani ikki marta ishlasangiz — ikki marta yetkazasiz.
3. **Narxni klient aytmaydi.** `amount` ni formadan olsangiz, foydalanuvchi uni DevTools'da 100 000 so'mdan 1 so'mga o'zgartiradi. Narx **har doim serverda**, bazadan olinadi.

## Kod: o'rnatish

```bash
npm install stripe @stripe/stripe-js
```

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

::: ts
```ts
// lib/stripe.ts
import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-27.basil',                // versiyani qotiring
  typescript: true,
})
```
:::

::: js
```js
// lib/stripe.js
import 'server-only'
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-08-27.basil',
})
```
:::

API versiyasini qotirish majburiy: Stripe versiyani yangilaganda javob shakli o'zgaradi va kodingiz sizsiz sinadi.

## Kod: Checkout sessiyasi

::: ts
```ts
// app/(app)/checkout/actions.ts
'use server'

import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { requireSession } from '@/lib/dal'

export async function startCheckout(cart: { productId: number; qty: number }[]) {
  const session = await requireSession()

  // 1. NARX BAZADAN — klientdan emas
  const rows = await db
    .select({ id: products.id, title: products.title, price: products.price, stock: products.stock })
    .from(products)
    .where(inArray(products.id, cart.map((item) => item.productId)))

  if (rows.length !== cart.length) return { error: 'Ba\'zi mahsulotlar topilmadi' }

  for (const item of cart) {
    const product = rows.find((r) => r.id === item.productId)!

    if (product.stock < item.qty) return { error: `"${product.title}" yetarli emas` }
  }

  const total = cart.reduce((sum, item) => {
    const product = rows.find((r) => r.id === item.productId)!

    return sum + Number(product.price) * item.qty
  }, 0)

  // 2. Buyurtmani PENDING holatida yaratamiz
  const [order] = await db
    .insert(orders)
    .values({
      number: `ORD-${Date.now()}`,
      userId: session.userId,
      total: total.toFixed(2),
      status: 'PENDING',
    })
    .returning({ id: orders.id, number: orders.number })

  await db.insert(orderItems).values(
    cart.map((item) => {
      const product = rows.find((r) => r.id === item.productId)!

      return { orderId: order.id, title: product.title, price: product.price, qty: item.qty }
    }),
  )

  // 3. Stripe sessiyasi
  const checkout = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: session.email,
      client_reference_id: String(order.id),      // webhook'da bizning ID
      metadata: { orderId: String(order.id), userId: String(session.userId) },

      line_items: cart.map((item) => {
        const product = rows.find((r) => r.id === item.productId)!

        return {
          quantity: item.qty,
          price_data: {
            currency: 'uzs',
            unit_amount: Math.round(Number(product.price) * 100),   // ENG KICHIK BIRLIK
            product_data: { name: product.title },
          },
        }
      }),

      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,          // 30 daqiqa
    },
    {
      idempotencyKey: `checkout-${order.id}`,     // takroriy bosishda bitta sessiya
    },
  )

  await db
    .update(orders)
    .set({ stripeSessionId: checkout.id })
    .where(eq(orders.id, order.id))

  redirect(checkout.url!)                          // try/catch dan tashqarida
}
```
:::

::: js
```js
// app/(app)/checkout/actions.js
'use server'

import { redirect } from 'next/navigation'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products } from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { requireSession } from '@/lib/dal'

export async function startCheckout(cart) {
  const session = await requireSession()

  const rows = await db
    .select({ id: products.id, title: products.title, price: products.price, stock: products.stock })
    .from(products)
    .where(inArray(products.id, cart.map((item) => item.productId)))

  if (rows.length !== cart.length) return { error: 'Ba\'zi mahsulotlar topilmadi' }

  const total = cart.reduce((sum, item) => {
    const product = rows.find((r) => r.id === item.productId)

    return sum + Number(product.price) * item.qty
  }, 0)

  const [order] = await db
    .insert(orders)
    .values({
      number: `ORD-${Date.now()}`,
      userId: session.userId,
      total: total.toFixed(2),
      status: 'PENDING',
    })
    .returning({ id: orders.id, number: orders.number })

  const checkout = await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      customer_email: session.email,
      client_reference_id: String(order.id),
      metadata: { orderId: String(order.id), userId: String(session.userId) },
      line_items: cart.map((item) => {
        const product = rows.find((r) => r.id === item.productId)

        return {
          quantity: item.qty,
          price_data: {
            currency: 'uzs',
            unit_amount: Math.round(Number(product.price) * 100),
            product_data: { name: product.title },
          },
        }
      }),
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?cancelled=1`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    },
    { idempotencyKey: `checkout-${order.id}` },
  )

  await db.update(orders).set({ stripeSessionId: checkout.id }).where(eq(orders.id, order.id))

  redirect(checkout.url)
}
```
:::

To'rt muhim detal:

1. **`unit_amount` — eng kichik birlikda.** Stripe barcha summalarni butun son sifatida oladi. 100 000 so'm → `10000000`. `Math.round` majburiy: `19.99 * 100 === 1998.9999999999998`.
2. **`metadata` va `client_reference_id`** — webhook'da buyurtmani topish yo'li. Ikkalasini ham to'ldiring.
3. **`idempotencyKey`** — foydalanuvchi tugmani ikki marta bossa, Stripe bitta sessiya qaytaradi.
4. **Buyurtma avval yaratiladi.** Stripe sessiyasidan keyin emas — aks holda webhook kelganda bog'lanadigan yozuv bo'lmaydi.

## Kod: webhook

Bu — eng muhim fayl.

::: ts
```ts
// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products, webhookEvents } from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { sendOrderEmail } from '@/lib/email'

export async function POST(request: Request) {
  // 1. XOM tana kerak — JSON parse qilinsa imzo mos kelmaydi
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Imzo yo\'q' }, { status: 400 })

  let event: Stripe.Event

  // 2. IMZONI TEKSHIRISH — busiz har kim webhook yuborishi mumkin
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error) {
    console.error('Webhook imzosi noto\'g\'ri', error)

    return NextResponse.json({ error: 'Imzo noto\'g\'ri' }, { status: 400 })
  }

  // 3. IDEMPOTENTLIK — bu hodisa avval ishlanganmi?
  const inserted = await db
    .insert(webhookEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id })

  if (inserted.length === 0) {
    return NextResponse.json({ received: true, duplicate: true })     // allaqachon ishlangan
  }

  // 4. Ishlash
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        // To'lov haqiqatan o'tganini tekshiramiz (async to'lov usullari uchun)
        if (session.payment_status !== 'paid') break

        await markPaid(Number(session.metadata?.orderId), session.payment_intent as string)
        break
      }

      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object

        await markPaid(Number(session.metadata?.orderId), session.payment_intent as string)
        break
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object

        await db
          .update(orders)
          .set({ status: 'CANCELLED' })
          .where(eq(orders.id, Number(session.metadata?.orderId)))
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object

        await handleRefund(charge)
        break
      }

      default:
        // Boshqa hodisalar kerak emas — lekin 200 qaytaramiz
        break
    }
  } catch (error) {
    console.error(`Webhook ${event.id} (${event.type}) xatosi`, error)

    // Yozuvni o'chiramiz — Stripe qayta yuborsin
    await db.delete(webhookEvents).where(eq(webhookEvents.id, event.id))

    return NextResponse.json({ error: 'Ichki xato' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function markPaid(orderId: number, paymentIntentId: string) {
  await db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, status: orders.status, userId: orders.userId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .for('update')

    if (!order) throw new Error(`Buyurtma ${orderId} topilmadi`)
    if (order.status === 'PAID') return              // ikkinchi qatlam himoya

    const items = await tx
      .select({ title: orderItems.title, qty: orderItems.qty })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))

    // Qoldiqni faqat TO'LOVDAN KEYIN kamaytiramiz
    for (const item of items) {
      await tx
        .update(products)
        .set({ stock: sql`${products.stock} - ${item.qty}` })
        .where(eq(products.title, item.title))
    }

    await tx
      .update(orders)
      .set({ status: 'PAID', paidAt: new Date(), stripePaymentIntentId: paymentIntentId })
      .where(eq(orders.id, orderId))
  })

  // Email — tranzaksiyadan TASHQARIDA (u qaytarilsa email qaytmaydi)
  await sendOrderEmail(orderId).catch((error) => console.error('Email yuborilmadi', error))
}
```
:::

::: js
```js
// app/api/webhooks/stripe/route.js
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { orders, orderItems, products, webhookEvents } from '@/db/schema'
import { stripe } from '@/lib/stripe'
import { sendOrderEmail } from '@/lib/email'

export async function POST(request) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) return NextResponse.json({ error: 'Imzo yo\'q' }, { status: 400 })

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    console.error('Webhook imzosi noto\'g\'ri', error)

    return NextResponse.json({ error: 'Imzo noto\'g\'ri' }, { status: 400 })
  }

  const inserted = await db
    .insert(webhookEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ id: webhookEvents.id })

  if (inserted.length === 0) return NextResponse.json({ received: true, duplicate: true })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object

        if (session.payment_status !== 'paid') break

        await markPaid(Number(session.metadata?.orderId), session.payment_intent)
        break
      }

      case 'checkout.session.expired': {
        const session = event.data.object

        await db
          .update(orders)
          .set({ status: 'CANCELLED' })
          .where(eq(orders.id, Number(session.metadata?.orderId)))
        break
      }

      default:
        break
    }
  } catch (error) {
    console.error(`Webhook ${event.id} xatosi`, error)

    await db.delete(webhookEvents).where(eq(webhookEvents.id, event.id))

    return NextResponse.json({ error: 'Ichki xato' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

async function markPaid(orderId, paymentIntentId) {
  await db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .for('update')

    if (!order) throw new Error(`Buyurtma ${orderId} topilmadi`)
    if (order.status === 'PAID') return

    await tx
      .update(orders)
      .set({ status: 'PAID', paidAt: new Date(), stripePaymentIntentId: paymentIntentId })
      .where(eq(orders.id, orderId))
  })

  await sendOrderEmail(orderId).catch((error) => console.error('Email yuborilmadi', error))
}
```
:::

Beshta qoida shu fayldan chiqadi:

| Qoida | Nega |
| --- | --- |
| `request.text()`, `request.json()` emas | Imzo xom baytlar bo'yicha hisoblanadi |
| `constructEvent` bilan imzo tekshirish | Busiz har kim "to'landi" deb yuboradi |
| Hodisa ID'sini jadvalga yozish | Takroriy yetkazishni to'xtatadi |
| Xatoda 500 qaytarish | Stripe qayta yuboradi |
| Tez javob berish (< 5 s) | Uzoq ish — navbatga (36-bob) |

Idempotentlik jadvali:

```sql
CREATE TABLE webhook_events (
  id          varchar(255) PRIMARY KEY,     -- Stripe hodisa ID'si
  type        varchar(100) NOT NULL,
  received_at timestamptz  NOT NULL DEFAULT now()
);
```

`onConflictDoNothing()` + `returning()` — atomik "bu birinchi martami?" tekshiruvi. `SELECT` keyin `INSERT` qilish **noto'g'ri**: ikki parallel webhook ikkalasi ham "yo'q" deb javob oladi.

## Kod: success sahifasi

::: ts
```tsx
// app/(app)/orders/[id]/page.tsx
import { notFound } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getOrder } from '@/db/queries/orders'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ paid?: string }>
}) {
  const [{ id }, { paid }] = await Promise.all([params, searchParams])
  const session = await verifySession()
  const order = await getOrder(Number(id))

  if (!order || order.userId !== session?.userId) notFound()

  return (
    <div>
      {/* `paid=1` — FAQAT xabar. Holat bazadan olinadi. */}
      {paid === '1' && order.status === 'PENDING' && (
        <p role="status">
          To'lov qabul qilindi, tasdiqlanmoqda. Bu bir necha soniya olishi mumkin.
        </p>
      )}

      {order.status === 'PAID' && <p role="status">✅ To'landi</p>}

      <h1>Buyurtma {order.number}</h1>
      <p>{Number(order.total).toLocaleString('uz-UZ')} so'm</p>
    </div>
  )
}
```
:::

::: js
```jsx
// app/(app)/orders/[id]/page.jsx
import { notFound } from 'next/navigation'
import { verifySession } from '@/lib/dal'
import { getOrder } from '@/db/queries/orders'

export default async function OrderPage({ params, searchParams }) {
  const [{ id }, { paid }] = await Promise.all([params, searchParams])
  const session = await verifySession()
  const order = await getOrder(Number(id))

  if (!order || order.userId !== session?.userId) notFound()

  return (
    <div>
      {paid === '1' && order.status === 'PENDING' && (
        <p role="status">To'lov qabul qilindi, tasdiqlanmoqda.</p>
      )}

      {order.status === 'PAID' && <p role="status">✅ To'landi</p>}

      <h1>Buyurtma {order.number}</h1>
      <p>{Number(order.total).toLocaleString('uz-UZ')} so'm</p>
    </div>
  )
}
```
:::

`?paid=1` hech narsani o'zgartirmaydi — u faqat matnni tanlaydi. Webhook kechikishi mumkin, shuning uchun "tasdiqlanmoqda" holati ham ko'rsatiladi.

## Kod: lokal sinov

```bash
# Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# → whsec_... chiqadi, uni .env.local ga yozing

# Boshqa terminalda — hodisa yuborish
stripe trigger checkout.session.completed
```

Test kartalari:

| Karta | Natija |
| --- | --- |
| `4242 4242 4242 4242` | Muvaffaqiyatli |
| `4000 0000 0000 9995` | Mablag' yetarli emas |
| `4000 0025 0000 3155` | 3D Secure tasdiqlash talab qiladi |
| `4000 0000 0000 0341` | Biriktirish o'tadi, hisoblash rad etiladi |

**3D Secure kartani albatta sinang** — bu Yevropada va O'zbekistonda majburiy va oqimga qo'shimcha qadam qo'shadi.

## Kod: obuna (subscription)

::: ts
```ts
export async function startSubscription(priceId: string) {
  const session = await requireSession()

  // Stripe mijozini bir marta yaratamiz va saqlaymiz
  let customerId = await getStripeCustomerId(session.userId)

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      metadata: { userId: String(session.userId) },
    })

    customerId = customer.id

    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, session.userId))
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?updated=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  redirect(checkout.url!)
}

// Foydalanuvchi o'z obunasini boshqarishi uchun — o'z UI'ingizni yozmang
export async function openBillingPortal() {
  const session = await requireSession()
  const customerId = await getStripeCustomerId(session.userId)

  if (!customerId) return { error: 'Obuna topilmadi' }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  redirect(portal.url)
}
```
:::

::: js
```js
export async function startSubscription(priceId) {
  const session = await requireSession()

  let customerId = await getStripeCustomerId(session.userId)

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email,
      metadata: { userId: String(session.userId) },
    })

    customerId = customer.id

    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, session.userId))
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?updated=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  redirect(checkout.url)
}

export async function openBillingPortal() {
  const session = await requireSession()
  const customerId = await getStripeCustomerId(session.userId)

  if (!customerId) return { error: 'Obuna topilmadi' }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  })

  redirect(portal.url)
}
```
:::

Obuna uchun kuzatiladigan hodisalar:

| Hodisa | Nima qilish |
| --- | --- |
| `customer.subscription.created` | Rejani yoqish |
| `customer.subscription.updated` | Reja/holat o'zgarishi (`status`, `cancel_at_period_end`) |
| `customer.subscription.deleted` | Rejani o'chirish |
| `invoice.payment_succeeded` | Muddatni uzaytirish |
| `invoice.payment_failed` | Ogohlantirish, keyin cheklash |

Billing Portal — Stripe'ning tayyor sahifasi: karta almashtirish, bekor qilish, hisob-fakturalar. Buni o'zingiz yozmang.

## Muhandislik nuqtai nazari: pul va son

**Pulni hech qachon `float` bilan saqlamang.**

```js
0.1 + 0.2                    // 0.30000000000000004
19.99 * 100                  // 1998.9999999999998
Math.round(19.99 * 100)      // 1999 ✅
```

| Qatlam | Format |
| --- | --- |
| Stripe API | Butun son, eng kichik birlik (`1999` = $19.99) |
| Baza | `numeric(12,2)` yoki butun son (tiyin) |
| Hisob-kitob | Butun son yoki `decimal.js` |
| Ko'rsatish | `Intl.NumberFormat` |

```ts
const formatter = new Intl.NumberFormat('uz-UZ', {
  style: 'currency',
  currency: 'UZS',
  maximumFractionDigits: 0,
})

formatter.format(1250000)    // "1 250 000 so'm"
```

Eng ishonchli yondashuv: **butun son (tiyin/sent) hamma joyda**, ko'rsatishda bo'lish. Shunda yaxlitlash xatosi umuman bo'lmaydi.

## Muhandislik nuqtai nazari: qoldiqni qachon kamaytirish

Uch strategiya:

| Qachon | Afzalligi | Kamchiligi |
| --- | --- | --- |
| Checkout boshlanganda | Ortiqcha sotuv yo'q | To'lamagan odam qoldiqni bloklaydi |
| To'lov tasdiqlanganda (webhook) | Sodda | Ikki odam oxirgi donani to'lashi mumkin |
| Rezervatsiya (vaqtinchalik blok) | ✅ Ikkalasi ham hal | Murakkabroq |

Rezervatsiya: checkout boshlanganda qoldiq 30 daqiqaga bron qilinadi, to'lanmasa cron uni bo'shatadi (36-bob).

Kam qoldiqli tovarlar (chiptalar, cheklangan nashr) uchun rezervatsiya majburiy. Oddiy do'konda webhook yetadi.

## Muhandislik nuqtai nazari: webhook'ni tez tugatish

Stripe javobni ~10 soniya kutadi. Agar webhook ichida email yuborish, PDF yaratish, tashqi API chaqirish bo'lsa — vaqt yetmasligi mumkin va Stripe qayta yuboradi.

```
❌  Webhook → holatni yangilash → email → PDF → 3-tomon API → 200
    (12 soniya — Stripe timeout, qayta yuboradi)

✅  Webhook → holatni yangilash → navbatga topshiriq → 200
    (200 ms)
    Navbat ishchisi → email, PDF, API
```

Navbat — 36-bobda.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `request.json()` webhook'da | Imzo tekshiruvi sinadi | `request.text()` |
| Imzoni tekshirmaslik | Har kim "to'landi" deb yuboradi | `constructEvent` |
| Idempotentlik yo'q | Ikki marta yetkazish | Hodisa ID jadvali |
| `?paid=1` ga ishonish | Har kim URL'ni ochadi | Webhook holatni belgilaydi |
| Narxni klientdan olish | 1 so'mga sotib olinadi | Bazadan |
| `float` bilan summa | Tiyinlar yo'qoladi | Butun son |
| `Math.round` siz `* 100` | 1 tiyin farq | `Math.round` |
| Xatoda 200 qaytarish | Stripe qayta yubormaydi, hodisa yo'qoladi | 500 |
| Webhook'da uzoq ish | Timeout, takroriy ishlov | Navbat |
| API versiyasini qotirmaslik | Stripe yangilansa sinadi | `apiVersion` |
| `payment_status` ni tekshirmaslik | Async to'lov hali o'tmagan | `=== 'paid'` |
| Emailni tranzaksiya ichida | Qaytarilsa email baribir ketgan | Tashqarida |
| 3D Secure'ni sinamaslik | Productionda oqim sinadi | Test kartasi `...3155` |

## Amaliyot

1. Checkout sessiyasini yarating va `4242...` kartasi bilan to'lang.
2. `stripe listen` bilan webhook'ni lokal ulang; `stripe trigger` bilan hodisa yuboring.
3. Bir xil hodisani ikki marta yuboring (`stripe events resend <id>`) — buyurtma bir marta ishlanishini tasdiqlang.
4. Webhook imzo tekshiruvini vaqtincha o'chiring va `curl` bilan soxta "to'landi" yuboring — muammoni ko'ring, keyin qaytaring.
5. Webhook'ni ataylab sindiring (xato tashlang) va Stripe Dashboard'da qayta urinishlarni kuzating.
6. 3D Secure kartasi (`4000 0025 0000 3155`) bilan to'lang va oqimdagi qo'shimcha qadamni ko'ring.
7. `unit_amount` ni `product.price * 100` (yaxlitlashsiz) qilib qo'ying va 19.99 narx bilan nima chiqishini ko'ring.

## Rasmiy hujjat

- Stripe Checkout: <https://docs.stripe.com/checkout/quickstart>
- Webhooklar: <https://docs.stripe.com/webhooks>
- Idempotentlik: <https://docs.stripe.com/api/idempotent_requests>
- Test kartalari: <https://docs.stripe.com/testing>
- Billing Portal: <https://docs.stripe.com/customer-management>
