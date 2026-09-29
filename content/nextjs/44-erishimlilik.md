# 44 — Erishimlilik

[← Oldingi: Unumdorlik](43-unumdorlik.md) · [Mundarija](README.md) · [Keyingi: Xavfsizlik →](45-xavfsizlik.md)

## Tushuncha

Erishimlilik (accessibility, a11y) — ilovani **hamma ishlata olishi**. Skrin rider bilan, faqat klaviatura bilan, rangni ajrata olmasdan, qo'l titrab turganda, quyoshda ekran ko'rinmay qolganda.

Bu axloqiy masala, lekin faqat u emas:

| Sabab | Tafsilot |
| --- | --- |
| Foydalanuvchilar | Dunyoda ~16% odam biror nogironlik bilan yashaydi |
| Qonun | Yevropa (EAA, 2025-yildan), AQSh (ADA), Buyuk Britaniya |
| Vaqtinchalik holat | Sinib qolgan qo'l, quyosh, shovqinli joy |
| SEO | Semantik HTML — qidiruv tizimlari uchun ham |
| Sifat | A11y muammosi ko'pincha UX muammosi belgisi |

SPA'larda ikki qo'shimcha muammo bor: **marshrut o'zgarishi e'lon qilinmaydi** va **fokus yo'qoladi**. Next'da ularning bir qismi hal qilingan, qolganini siz qilasiz.

## Nega shunday

Skrin rider sahifani **daraxt** sifatida o'qiydi. U daraxt HTML'dan quriladi:

```
<div onClick={...}>Yuborish</div>
  → skrin rider: "Yuborish"          ← bu nima? Matnmi? Tugmami?
  → klaviatura: Tab bilan yetib bo'lmaydi
  → Enter/Space: ishlamaydi

<button onClick={...}>Yuborish</button>
  → skrin rider: "Yuborish, tugma"
  → klaviatura: Tab bilan fokus, Enter/Space bosadi
  → ✅ hech narsa yozish shart emas
```

Shuning uchun birinchi qoida: **to'g'ri HTML elementini ishlating**. ARIA — HTML yetmaganda qo'shiladigan qatlam, uning o'rnini bosuvchi emas.

> ARIA'ning birinchi qoidasi: ARIA ishlatmang, agar semantik HTML ishlatish mumkin bo'lsa.

## Kod: semantik tuzilma

::: ts
```tsx
// app/layout.tsx
import { inter } from './fonts'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang MAJBURIY — skrin rider talaffuzni shu asosda tanlaydi
    <html lang="uz" className={inter.variable}>
      <body>
        {/* Klaviatura foydalanuvchisi menyuni har safar bosib o'tmasin */}
        <a href="#main" className="skip-link">
          Asosiy kontentga o'tish
        </a>

        <header>
          <nav aria-label="Asosiy">
            <ul>
              <li><Link href="/">Bosh sahifa</Link></li>
              <li><Link href="/products">Mahsulotlar</Link></li>
            </ul>
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <footer>
          <nav aria-label="Qo'shimcha">…</nav>
        </footer>
      </body>
    </html>
  )
}
```

```css
/* Fokus olmaguncha yashirin, Tab bosilganda ko'rinadi */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: 0.75rem 1rem;
  background: var(--bg);
  border: 2px solid var(--fg);
}

.skip-link:focus {
  left: 0;
}
```
:::

::: js
```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        <a href="#main" className="skip-link">Asosiy kontentga o'tish</a>

        <header>
          <nav aria-label="Asosiy">…</nav>
        </header>

        <main id="main" tabIndex={-1}>{children}</main>

        <footer>…</footer>
      </body>
    </html>
  )
}
```
:::

`lang="uz"` — eng oson va eng ko'p unutiladigan narsa. Usiz skrin rider o'zbekcha matnni ingliz talaffuzi bilan o'qiydi.

Ikkita `<nav>` bo'lsa, ularga `aria-label` bering — aks holda skrin rider "navigatsiya, navigatsiya" deydi.

## Kod: sarlavhalar iyerarxiyasi

Skrin rider foydalanuvchilari sahifani **sarlavhalar bo'yicha** kezadi (`H` tugmasi):

::: ts
```tsx
// ❌ Sarlavhalar o'lcham uchun tanlangan
<h1>Do'kon</h1>
<h4>Mahsulotlar</h4>            {/* h2 o'tkazib yuborildi */}
<h2>Telefon</h2>                {/* tartib buzildi */}

// ✅ Iyerarxiya mantiqiy, o'lcham CSS bilan
<h1>Mahsulotlar</h1>            {/* sahifada BITTA h1 */}
  <h2>Telefonlar</h2>
    <h3>Samsung</h3>
    <h3>Apple</h3>
  <h2>Noutbuklar</h2>
```
:::

::: js
```jsx
<h1>Mahsulotlar</h1>
  <h2>Telefonlar</h2>
    <h3>Samsung</h3>
  <h2>Noutbuklar</h2>
```
:::

Qoidalar: sahifada bitta `<h1>`, daraja o'tkazib yuborilmaydi, o'lcham CSS bilan beriladi.

## Kod: formalar

Formalar — a11y muammolarining eng katta manbai:

::: ts
```tsx
'use client'

import { useActionState, useId } from 'react'

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submit, {})
  const nameId = useId()
  const emailId = useId()
  const messageId = useId()

  return (
    <form action={formAction} noValidate>
      {/* Umumiy xato — forma boshida, e'lon qilinadi */}
      {state.message && (
        <div role="alert" className="form-error">
          {state.message}
        </div>
      )}

      <div className="field">
        {/* htmlFor ↔ id — MAJBURIY bog'lanish */}
        <label htmlFor={nameId}>
          Ism <span aria-hidden="true">*</span>
          <span className="sr-only">(majburiy)</span>
        </label>

        <input
          id={nameId}
          name="name"
          required
          autoComplete="name"
          aria-invalid={state.errors?.name ? true : undefined}
          aria-describedby={state.errors?.name ? `${nameId}-error` : undefined}
        />

        {state.errors?.name && (
          <p id={`${nameId}-error`} className="error">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor={emailId}>Pochta</label>

        <input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          aria-describedby={`${emailId}-hint`}
        />

        <p id={`${emailId}-hint`} className="hint">
          Javob shu manzilga yuboriladi
        </p>
      </div>

      <fieldset>
        <legend>Murojaat turi</legend>

        <label>
          <input type="radio" name="topic" value="savol" defaultChecked /> Savol
        </label>
        <label>
          <input type="radio" name="topic" value="shikoyat" /> Shikoyat
        </label>
      </fieldset>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Yuborilmoqda…' : 'Yuborish'}
      </button>

      {/* Holat o'zgarishi e'lon qilinadi */}
      <p role="status" className="sr-only">
        {isPending ? 'Yuborilmoqda' : state.ok ? 'Yuborildi' : ''}
      </p>
    </form>
  )
}
```

```css
/* Ko'zga ko'rinmaydi, skrin rider o'qiydi */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```
:::

::: js
```jsx
'use client'

import { useActionState, useId } from 'react'

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(submit, {})
  const nameId = useId()

  return (
    <form action={formAction} noValidate>
      {state.message && <div role="alert">{state.message}</div>}

      <div className="field">
        <label htmlFor={nameId}>Ism</label>

        <input
          id={nameId}
          name="name"
          required
          autoComplete="name"
          aria-invalid={state.errors?.name ? true : undefined}
          aria-describedby={state.errors?.name ? `${nameId}-error` : undefined}
        />

        {state.errors?.name && <p id={`${nameId}-error`}>{state.errors.name[0]}</p>}
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? 'Yuborilmoqda…' : 'Yuborish'}
      </button>

      <p role="status" className="sr-only">{isPending ? 'Yuborilmoqda' : ''}</p>
    </form>
  )
}
```
:::

Beshta qoida:

1. **Har `<input>` ga `<label htmlFor>`.** `placeholder` — label emas: u yozila boshlaganda yo'qoladi.
2. **`aria-describedby`** — xato va izoh matnini maydonga bog'laydi.
3. **`aria-invalid`** — maydon xato ekanini bildiradi.
4. **`role="alert"`** — yangi xato darhol o'qiladi.
5. **`autoComplete`** — parol menejerlari va avtoto'ldirish uchun; harakat cheklanganlar uchun katta yordam.

`useId()` — React hook, SSR bilan mos ID yaratadi. `Math.random()` ishlatmang: server va klient farq qiladi (hydration xatosi).

## Kod: marshrut o'zgarishini e'lon qilish

SPA navigatsiyada sahifa qayta yuklanmaydi — skrin rider hech narsa demaydi. Foydalanuvchi havolani bosdi va... jimlik.

::: ts
```tsx
// app/route-announcer.tsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function RouteAnnouncer() {
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    // Sahifa sarlavhasi yangilanishini kutamiz
    const timer = setTimeout(() => {
      const title = document.title || document.querySelector('h1')?.textContent || pathname

      setAnnouncement(`${title} sahifasiga o'tildi`)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  )
}
```
:::

::: js
```jsx
// app/route-announcer.jsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function RouteAnnouncer() {
  const pathname = usePathname()
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const title = document.title || document.querySelector('h1')?.textContent || pathname

      setAnnouncement(`${title} sahifasiga o'tildi`)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  )
}
```
:::

Fokusni ham boshqarish kerak: navigatsiyadan keyin fokus sahifa boshiga qaytsin.

::: ts
```tsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function FocusManager() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    // Birinchi yuklanishda fokusni ko'chirmaymiz
    if (first.current) {
      first.current = false

      return
    }

    const main = document.getElementById('main')

    main?.focus()                                 // main da tabIndex={-1} bo'lishi kerak
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```
:::

::: js
```jsx
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function FocusManager() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => {
    if (first.current) {
      first.current = false

      return
    }

    document.getElementById('main')?.focus()
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
```
:::

`aria-live` qiymatlari:

| Qiymat | Xatti-harakat | Qachon |
| --- | --- | --- |
| `off` | E'lon qilinmaydi | Sukut |
| `polite` | Joriy o'qish tugagach | Deyarli har doim |
| `assertive` | Darhol bo'ladi | Faqat kritik (xato, ogohlantirish) |

`assertive` ni kam ishlating — u foydalanuvchining o'qishini uzadi.

## Kod: yuklanish va dinamik kontent

::: ts
```tsx
// Suspense fallback — e'lon qilinishi kerak
<Suspense
  fallback={
    <div role="status" aria-live="polite">
      <span className="sr-only">Buyurtmalar yuklanmoqda</span>
      <OrdersSkeleton aria-hidden="true" />
    </div>
  }
>
  <Orders />
</Suspense>
```

```tsx
// Optimistik yangilash (23-bob) — natija e'lon qilinsin
'use client'

export function LikeButton({ postId, initial }: { postId: number; initial: number }) {
  const [optimistic, addOptimistic] = useOptimistic(initial, (state, delta: number) => state + delta)

  return (
    <>
      <button
        onClick={() => {
          addOptimistic(1)
          like(postId)
        }}
        aria-label={`Yoqtirish, hozir ${optimistic} ta`}
      >
        ❤️ <span aria-hidden="true">{optimistic}</span>
      </button>

      <span role="status" className="sr-only">
        {optimistic} ta yoqtirish
      </span>
    </>
  )
}
```
:::

::: js
```jsx
<Suspense
  fallback={
    <div role="status" aria-live="polite">
      <span className="sr-only">Buyurtmalar yuklanmoqda</span>
      <OrdersSkeleton aria-hidden="true" />
    </div>
  }
>
  <Orders />
</Suspense>
```
:::

Skelet `aria-hidden="true"` bo'lishi kerak — bo'sh to'rtburchaklar skrin riderga hech narsa bermaydi.

## Kod: modal va fokus tuzog'i

Modal — a11y'ning eng murakkab elementi. Native `<dialog>` ishni ancha osonlashtiradi:

::: ts
```tsx
'use client'

import { useRef, useEffect } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()                          // fokus tuzog'i AVTOMATIK
      document.body.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        // Fon bosilganda yopish
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>

        {children}

        <button type="button" onClick={onClose} aria-label="Yopish">
          ✕
        </button>
      </div>
    </dialog>
  )
}
```
:::

::: js
```jsx
'use client'

import { useRef, useEffect } from 'react'

export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current

    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
    } else if (!open && dialog.open) {
      dialog.close()
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose()
      }}
    >
      <div className="modal-content">
        <h2 id="modal-title">{title}</h2>
        {children}
        <button type="button" onClick={onClose} aria-label="Yopish">✕</button>
      </div>
    </dialog>
  )
}
```
:::

`showModal()` bepul beradi: fokus tuzog'i, Escape bilan yopish, fon inert bo'lishi, fokus qaytarilishi.

`<div>` bilan modal yozsangiz, bularning **hammasini** qo'lda qilasiz — va odatda yarmi unutiladi.

## Kod: rasm va ikonkalar

::: ts
```tsx
// Ma'noli rasm — alt tasvirlaydi
<Image src={product.image} alt={`${product.title} mahsuloti`} width={400} height={300} />

// Bezak rasmi — alt BO'SH (o'tkazib yuborilmaydi!)
<Image src="/decoration.svg" alt="" width={100} height={100} />

// Havola ichidagi rasm — alt havola maqsadini aytadi
<Link href="/">
  <Image src="/logo.svg" alt="Bosh sahifa" width={120} height={40} />
</Link>

// ❌ Faqat ikonka bo'lgan tugma
<button onClick={remove}>🗑</button>

// ✅ Nomi bor
<button onClick={remove} aria-label="Buyurtmani o'chirish">
  <TrashIcon aria-hidden="true" />
</button>

// ✅ Yoki yashirin matn bilan
<button onClick={remove}>
  <TrashIcon aria-hidden="true" />
  <span className="sr-only">Buyurtmani o'chirish</span>
</button>
```
:::

::: js
```jsx
<Image src={product.image} alt={`${product.title} mahsuloti`} width={400} height={300} />

<Image src="/decoration.svg" alt="" width={100} height={100} />

<button onClick={remove} aria-label="Buyurtmani o'chirish">
  <TrashIcon aria-hidden="true" />
</button>
```
:::

`alt` yozishning qoidasi: **"rasmni ko'rmaydigan odamga nima deysiz?"** Bezak bo'lsa — hech narsa (`alt=""`). Ma'lumot bo'lsa — o'sha ma'lumot.

`alt="rasm"` yoki `alt="logo.png"` — eng yomon variant: shovqin qo'shadi, ma'no bermaydi.

## Kod: klaviatura va fokus

::: css
```css
/* ❌ Hech qachon */
*:focus {
  outline: none;
}

/* ✅ Ko'rinadigan, kontrastli fokus */
:focus-visible {
  outline: 3px solid var(--focus-color, #0066cc);
  outline-offset: 2px;
  border-radius: 2px;
}

/* Sichqoncha bilan bosilganda fokus halqasi ko'rinmasin */
:focus:not(:focus-visible) {
  outline: none;
}

/* Harakatni kamaytirish sozlamasini hurmat qilish */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Tegish maydoni — kamida 44×44 px (WCAG 2.5.8) */
button,
a,
[role='button'] {
  min-height: 44px;
  min-width: 44px;
}
```
:::

`outline: none` — a11y'dagi eng keng tarqalgan xato. Klaviatura foydalanuvchisi qayerdaligini bilmay qoladi.

Tartib ham muhim — DOM tartibi ko'rinish tartibiga mos bo'lsin:

::: ts
```tsx
// ❌ CSS bilan tartib o'zgartirilgan — Tab ketma-ketligi chalkash
<div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
  <button>Birinchi ko'rinadi, ikkinchi fokus oladi</button>
  <button>Ikkinchi ko'rinadi, birinchi fokus oladi</button>
</div>

// ✅ DOM tartibi = ko'rinish tartibi
```
:::

::: js
```jsx
// DOM tartibini ko'rinish tartibiga moslang
```
:::

`tabIndex` qoidalari:

| Qiymat | Ma'nosi | Ishlating |
| --- | --- | --- |
| `0` | Tabga qo'shiladi, tabiiy tartibda | Maxsus interaktiv element |
| `-1` | Tabga qo'shilmaydi, JS bilan fokus mumkin | `<main>`, modal konteyner |
| `1+` | Tartibni majburlaydi | ❌ Hech qachon |

## Kod: rang va kontrast

| Element | Minimal kontrast (WCAG AA) |
| --- | --- |
| Oddiy matn | 4.5:1 |
| Katta matn (18pt+ yoki 14pt qalin) | 3:1 |
| UI komponentlar, chegaralar | 3:1 |
| Fokus indikatori | 3:1 |

::: ts
```tsx
// ❌ Ma'no faqat rang bilan
<span style={{ color: order.paid ? 'green' : 'red' }}>{order.number}</span>

// ✅ Rang + matn + shakl
<span className={order.paid ? 'status-paid' : 'status-unpaid'}>
  {order.paid ? '✓ To\'langan' : '✕ To\'lanmagan'}
</span>
```
:::

::: js
```jsx
<span className={order.paid ? 'status-paid' : 'status-unpaid'}>
  {order.paid ? '✓ To\'langan' : '✕ To\'lanmagan'}
</span>
```
:::

Dunyoda ~8% erkak rang ko'rishida farq bilan tug'iladi. Qizil/yashil ajratish ular uchun ishlamaydi.

## Kod: jadvallar

::: ts
```tsx
<table>
  <caption>Oxirgi 20 ta buyurtma</caption>

  <thead>
    <tr>
      <th scope="col">Raqam</th>
      <th scope="col">Sana</th>
      <th scope="col">Summa</th>
      <th scope="col">Holat</th>
    </tr>
  </thead>

  <tbody>
    {orders.map((order) => (
      <tr key={order.id}>
        <th scope="row">{order.number}</th>
        <td>
          <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
        </td>
        <td>{formatMoney(order.total)}</td>
        <td>{order.status}</td>
      </tr>
    ))}
  </tbody>
</table>
```
:::

::: js
```jsx
<table>
  <caption>Oxirgi 20 ta buyurtma</caption>

  <thead>
    <tr>
      <th scope="col">Raqam</th>
      <th scope="col">Sana</th>
      <th scope="col">Summa</th>
    </tr>
  </thead>

  <tbody>
    {orders.map((order) => (
      <tr key={order.id}>
        <th scope="row">{order.number}</th>
        <td><time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time></td>
        <td>{formatMoney(order.total)}</td>
      </tr>
    ))}
  </tbody>
</table>
```
:::

`scope` bilan skrin rider har katakni o'qiyotganda ustun nomini ham aytadi: "Summa, 120 000 so'm". Usiz faqat "120 000 so'm" — kontekstsiz.

Jadvalni `<div>` bilan yasamang. Kerak bo'lsa `role="table"`, `role="row"`, `role="cell"` — lekin bu yana o'sha "ARIA HTML o'rnini bosmaydi" holati.

## Kod: avtomatik tekshirish

```bash
npm install -D eslint-plugin-jsx-a11y @axe-core/playwright
```

::: ts
```js
// eslint.config.mjs
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  jsxA11y.flatConfigs.recommended,
  {
    rules: {
      'jsx-a11y/anchor-is-valid': 'off',          // next/link o'zi hal qiladi
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-autofocus': 'warn',
    },
  },
]
```

```ts
// e2e/a11y.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/products', '/login', '/cart']

for (const path of PAGES) {
  test(`${path} — a11y buzilishlari yo'q`, async ({ page }) => {
    await page.goto(path)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}

test('modal fokusni ushlab turadi', async ({ page }) => {
  await page.goto('/products')

  await page.getByRole('button', { name: 'Tez ko\'rish' }).first().click()

  const dialog = page.getByRole('dialog')

  await expect(dialog).toBeVisible()

  // Fokus modal ichida
  await expect(dialog).toContainText(await page.evaluate(() => document.activeElement?.textContent ?? ''))

  // Escape yopadi
  await page.keyboard.press('Escape')
  await expect(dialog).not.toBeVisible()
})

test('klaviatura bilan buyurtma berish mumkin', async ({ page }) => {
  await page.goto('/products')

  await page.keyboard.press('Tab')               // skip link
  await page.keyboard.press('Enter')

  // ... faqat klaviatura bilan oqimni bosib o'ting
})
```
:::

::: js
```js
// e2e/a11y.spec.js
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PAGES = ['/', '/products', '/login']

for (const path of PAGES) {
  test(`${path} — a11y buzilishlari yo'q`, async ({ page }) => {
    await page.goto(path)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    expect(results.violations).toEqual([])
  })
}
```
:::

**Muhim cheklov:** avtomatik vositalar muammolarning **~30–40%** ini topadi. Qolgani — qo'lda tekshirish.

## Muhandislik nuqtai nazari: qo'lda tekshirish

Har reliz oldidan 10 daqiqa:

| Tekshiruv | Qanday |
| --- | --- |
| **Klaviatura** | Sichqonchani uzing. Asosiy oqimni bosib o'ting |
| **Fokus ko'rinadimi** | Tab bosganda qayerdaligingiz aniqmi? |
| **Fokus tuzoqqa tushmaydimi** | Modal ochilganda ortga chiqa olasizmi? |
| **Zoom 200%** | Kontent kesilib qolmaydimi? Gorizontal scroll? |
| **Skrin rider** | VoiceOver (Cmd+F5), NVDA (bepul, Windows) |
| **Rang** | DevTools → Rendering → Emulate vision deficiencies |
| **Harakat** | OS sozlamalarida "reduce motion" yoqing |

Skrin rider bilan birinchi tajriba noqulay bo'ladi — bu normal. 15 daqiqa sarflang, bir sahifani ko'zni yumib o'ting. Bu boshqa har qanday o'qishdan ko'ra ko'proq narsani o'rgatadi.

## Muhandislik nuqtai nazari: ARIA — qachon va qanday

ARIA kerak bo'ladigan holatlar kam:

::: ts
```tsx
// ✅ Tab'lar — HTML'da ekvivalenti yo'q
<div role="tablist" aria-label="Sozlamalar">
  <button
    role="tab"
    id="tab-profile"
    aria-selected={active === 'profile'}
    aria-controls="panel-profile"
    tabIndex={active === 'profile' ? 0 : -1}
    onClick={() => setActive('profile')}
  >
    Profil
  </button>
</div>

<div role="tabpanel" id="panel-profile" aria-labelledby="tab-profile" hidden={active !== 'profile'}>
  …
</div>

// ✅ Akkordeon — <details> yetmasa
<button aria-expanded={open} aria-controls="section-1" onClick={() => setOpen(!open)}>
  Savol
</button>
<div id="section-1" hidden={!open}>Javob</div>

// ✅ Jonli hisoblagich
<span aria-live="polite" aria-atomic="true">{count} ta xabar</span>
```
:::

::: js
```jsx
<button aria-expanded={open} aria-controls="section-1" onClick={() => setOpen(!open)}>
  Savol
</button>
<div id="section-1" hidden={!open}>Javob</div>
```
:::

Tab'lar uchun klaviatura ham qo'lda yoziladi (chap/o'ng strelka). Shuning uchun murakkab vidjetlarni **tayyor kutubxonadan** oling:

| Kutubxona | Nima |
| --- | --- |
| Radix UI | Primitiv, stilsiz, a11y to'liq |
| React Aria (Adobe) | Eng chuqur a11y, hook asosida |
| Headless UI | Tailwind bilan yaxshi |
| shadcn/ui | Radix ustiga stil |

O'zingiz yozgan combobox deyarli har doim buzuq bo'ladi — bu shunchalik murakkab.

## Tipik xatolar

| Xato | Oqibat | To'g'ri yechim |
| --- | --- | --- |
| `<html lang>` yo'q | Noto'g'ri talaffuz | `lang="uz"` |
| `outline: none` | Klaviatura foydalanuvchisi yo'qoladi | `:focus-visible` |
| `<div onClick>` | Klaviatura ishlamaydi | `<button>` |
| `placeholder` ni label o'rniga | Yozila boshlaganda yo'qoladi | `<label htmlFor>` |
| `alt` yo'q yoki `alt="rasm"` | Ma'no yo'q | Tasvirlovchi yoki `alt=""` |
| Faqat ikonka tugma | Nomi yo'q | `aria-label` |
| Ma'no faqat rangda | Rang ko'rmaydiganlar uchun yo'qoladi | Matn + belgi |
| Sarlavha darajasini o'tkazish | Tuzilma buziladi | Ketma-ket |
| Marshrut e'lon qilinmaydi | Skrin rider jim | `aria-live` e'lonchi |
| Fokus boshqarilmaydi | Navigatsiyadan keyin fokus yo'qoladi | `main.focus()` |
| `tabIndex={1}` | Tartib buziladi | `0` yoki `-1` |
| Kichik tegish maydoni | Telefonda bosib bo'lmaydi | 44×44 px |
| `<div>` bilan modal | Fokus tuzog'i yo'q | `<dialog>` |
| ARIA'ni semantik HTML o'rniga | Ko'proq kod, ko'proq xato | To'g'ri element |
| Faqat avtomatik tekshirish | 60% muammo qoladi | Qo'lda ham |

## Amaliyot

1. Sichqonchani uzing va butun ilovani faqat klaviatura bilan bosib o'ting. Qayerda qotib qoldingiz?
2. `eslint-plugin-jsx-a11y` ni yoqing va chiqqan ogohlantirishlarni tuzating.
3. Playwright + axe testini uchta sahifa uchun yozing va CI'ga qo'shing.
4. VoiceOver (Cmd+F5) yoki NVDA bilan bosh sahifani ko'zni yumib o'ting.
5. Brauzerda zoom'ni 200% qiling — kontent kesilmasligini tekshiring.
6. DevTools → Rendering → "Emulate vision deficiencies" bilan deuteranopia rejimini yoqing.
7. Marshrut e'lonchisini qo'shing va skrin rider bilan navigatsiyani sinang.
8. Bitta o'z-o'zidan yozilgan dropdown'ni Radix UI bilan almashtiring va farqni ko'ring.

## Rasmiy hujjat

- Next.js erishimlilik: <https://nextjs.org/docs/architecture/accessibility>
- WCAG 2.2 (qisqa ro'yxat): <https://www.w3.org/WAI/WCAG22/quickref/>
- ARIA Authoring Practices: <https://www.w3.org/WAI/ARIA/apg/>
- MDN erishimlilik: <https://developer.mozilla.org/en-US/docs/Web/Accessibility>
- axe DevTools: <https://www.deque.com/axe/devtools/>
- Radix UI: <https://www.radix-ui.com/primitives>
