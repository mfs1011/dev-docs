# 11 — Navigatsiya

[← Oldingi: Yuklanish va xato holatlari](10-loading-va-error.md) · [Mundarija](README.md) · [Keyingi: Marshrut guruhlari va parallel marshrutlar →](12-route-groups-parallel.md)

## Tushuncha

App Router'da navigatsiya uch yo'l bilan bo'ladi:

| Vosita | Qayerda | Qachon |
| --- | --- | --- |
| `<Link>` | Server yoki klient | Standart tanlov |
| `useRouter()` | Faqat klient | Hodisa ichida (forma yuborilgach) |
| `redirect()` | Faqat server | Server komponent yoki action ichida |

`<Link>` navigatsiyani **klient tomonda** bajaradi: sahifa to'liq qayta yuklanmaydi, layout saqlanadi (08-bob).

## Kod: `<Link>`

::: ts
```tsx
import Link from 'next/link'

<Link href="/products">Katalog</Link>
<Link href={`/products/${product.slug}`}>{product.title}</Link>

// Query va hash bilan
<Link href={{ pathname: '/search', query: { q: 'klaviatura', page: 2 } }}>Qidirish</Link>

// Tarixni almashtirish (orqaga qaytganda bu sahifa bo'lmaydi)
<Link href="/login" replace>Kirish</Link>

// Scroll pozitsiyasini saqlash
<Link href="/products" scroll={false}>Katalog</Link>

// Prefetch'ni o'chirish (juda ko'p havola bo'lsa)
<Link href="/heavy-page" prefetch={false}>Og'ir sahifa</Link>
```
:::

::: js
```jsx
import Link from 'next/link'

<Link href="/products">Katalog</Link>
<Link href={`/products/${product.slug}`}>{product.title}</Link>
<Link href={{ pathname: '/search', query: { q: 'klaviatura', page: 2 } }}>Qidirish</Link>
<Link href="/login" replace>Kirish</Link>
```
:::

## Kod: prefetch

`<Link>` ko'rinish maydoniga kirganda Next sahifani **oldindan yuklaydi** — natijada bosilganda navigatsiya deyarli bir zumda bo'ladi.

| Qiymat | Xatti-harakat |
| --- | --- |
| `prefetch` berilmagan (standart) | Ko'rinishga kirganda: static sahifa to'liq, dinamik sahifa qisman (layout + `loading.tsx`) |
| `prefetch={true}` | To'liq prefetch |
| `prefetch={false}` | Faqat bosilganda |

Prefetch **faqat production'da** ishlaydi — `next dev` da uni sinab bo'lmaydi.

Ko'p havolali sahifada (masalan 200 qatorli jadval) `prefetch={false}` qo'ying: aks holda brauzer o'nlab keraksiz so'rov yuboradi.

## Kod: `useRouter`

::: ts
```tsx
'use client'

import { useRouter } from 'next/navigation'      // 'next/router' EMAS

export function LoginForm() {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    await login(formData)

    router.push('/dashboard')
    // yoki
    router.replace('/dashboard')     // tarixga yozmasdan
    router.refresh()                 // server komponentlarni qayta yuklash (19-bob)
    router.back()
    router.forward()
  }
}
```
:::

::: js
```jsx
'use client'

import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()

  async function handleSubmit(formData) {
    await login(formData)

    router.push('/dashboard')
  }
}
```
:::

**Muhim:** `next/navigation` dan import qiling. `next/router` — Pages Router uchun (38-bob) va App Router'da xato beradi.

`router.refresh()` — App Router'ga xos: u klient holatini saqlab, **server komponentlarni qayta so'raydi**. Mutatsiyadan keyin ma'lumotni yangilash uchun ishlatiladi (19-bob).

## Kod: joriy URL'ni o'qish

::: ts
```tsx
'use client'

import { usePathname, useSearchParams, useParams } from 'next/navigation'

export function Breadcrumbs() {
  const pathname = usePathname()               // '/products/laptops'
  const searchParams = useSearchParams()       // URLSearchParams
  const params = useParams()                   // { category: 'laptops' }

  const page = Number(searchParams.get('page') ?? 1)

  return <nav aria-label="Yo'l">{/* ... */}</nav>
}
```
:::

::: js
```jsx
'use client'

import { usePathname, useSearchParams, useParams } from 'next/navigation'

export function Breadcrumbs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()

  const page = Number(searchParams.get('page') ?? 1)

  return <nav aria-label="Yo'l">{/* ... */}</nav>
}
```
:::

**Tuzoq:** `useSearchParams` ishlatgan klient komponent `<Suspense>` bilan o'ralishi kerak, aks holda butun sahifa dinamik bo'ladi:

```tsx
<Suspense fallback={null}>
  <SearchFilters />
</Suspense>
```

## Kod: aktiv havola

::: ts
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

const items = [
  { href: '/dashboard', label: 'Boshqaruv' },
  { href: '/dashboard/orders', label: 'Buyurtmalar' },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={clsx('nav-link', isActive && 'nav-link-active')}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```
:::

::: js
```jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'

export function DashboardNav({ items }) {
  const pathname = usePathname()

  return (
    <nav>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={clsx('nav-link', isActive && 'nav-link-active')}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
```
:::

`aria-current="page"` — erishimlilik uchun majburiy (44-bob).

## Kod: URL holatini yangilash (filtrlar)

::: ts
```tsx
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function CatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams)

      if (value === null || value === '') params.delete(key)
      else params.set(key, value)

      params.delete('page')                    // filtr o'zgarsa birinchi sahifaga

      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <select value={searchParams.get('sort') ?? 'created'} onChange={(e) => setParam('sort', e.target.value)}>
      <option value="created">Yangi</option>
      <option value="price">Narx</option>
    </select>
  )
}
```
:::

::: js
```jsx
'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function CatalogFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const setParam = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams)

      if (!value) params.delete(key)
      else params.set(key, value)

      params.delete('page')

      router.replace(`${pathname}?${params}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <select value={searchParams.get('sort') ?? 'created'} onChange={(e) => setParam('sort', e.target.value)}>
      <option value="created">Yangi</option>
      <option value="price">Narx</option>
    </select>
  )
}
```
:::

`replace` (`push` emas) — filtr o'zgarishi tarixni to'ldirmasin. `scroll: false` — sahifa tepaga sakramasin.

## Kod: navigatsiya holati (`useLinkStatus`)

Sekin navigatsiyada foydalanuvchiga indikator ko'rsatish:

::: ts
```tsx
'use client'

import { useLinkStatus } from 'next/link'

function LinkSpinner() {
  const { pending } = useLinkStatus()

  return pending ? <Spinner size={14} aria-hidden /> : null
}

// Ishlatish
<Link href="/reports">
  Hisobotlar
  <LinkSpinner />
</Link>
```
:::

::: js
```jsx
'use client'

import { useLinkStatus } from 'next/link'

function LinkSpinner() {
  const { pending } = useLinkStatus()

  return pending ? <Spinner size={14} aria-hidden /> : null
}
```
:::

`useLinkStatus` — `<Link>` ning **bolasida** ishlaydi (React'dagi `useFormStatus` bilan bir xil naqsh).

Global progress bar uchun `useTransition` ishlatiladi (React qo'llanmasi, 23-bob).

## Muhandislik nuqtai nazari: navigatsiya qanday ishlaydi

`<Link>` bosilganda:

1. Router Cache tekshiriladi — sahifa keshda bo'lsa, darhol ko'rsatiladi (18-bob);
2. Bo'lmasa, RSC payload so'raladi (HTML emas — **seriyalangan React daraxti**);
3. Layout saqlanadi, faqat o'zgargan segment almashadi;
4. Klient holati (store, forma) saqlanadi;
5. Scroll tepaga qaytadi (`scroll: false` bo'lmasa).

Shuning uchun App Router navigatsiyasi SPA kabi tez, lekin sahifa mazmuni serverda hosil bo'ladi.

## Muhandislik nuqtai nazari: `<Link>` yoki `<a>`

| Holat | Vosita |
| --- | --- |
| Ilova ichidagi sahifa | `<Link>` |
| Tashqi sayt | `<a href target="_blank" rel="noopener noreferrer">` |
| Fayl yuklab olish | `<a href download>` |
| Anchor (`#section`) | `<Link href="#section">` yoki `<a>` |
| Til almashtirish (to'liq qayta yuklash kerak) | `<a>` |

`<a>` bilan ichki navigatsiya qilsangiz, sahifa **to'liq qayta yuklanadi**: layout qayta render bo'ladi, klient holati yo'qoladi, tezlik yo'qoladi.

## Muhandislik nuqtai nazari: URL — holat manbai

React qo'llanmasining 37-bobidagi qoida bu yerda ham amal qiladi va Next'da yanada muhimroq:

| Holat | Joyi |
| --- | --- |
| Filtr, sahifa, saralash, qidiruv | URL (`searchParams`) |
| Ochilgan resurs | URL (`params`) |
| Modal (ulashilishi mantiqiy bo'lsa) | URL (intercepting routes, 12-bob) |
| Forma qoralamasi, scroll | Klient holati |

Sabab: `searchParams` **server komponentga** yetib boradi, ya'ni ma'lumot serverda filtrlanadi va HTML tayyor keladi. `useState` dagi filtr bunday ishlamaydi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `next/router` dan import qilish | Pages Router API'si | `next/navigation` |
| Ichki navigatsiyani `<a>` bilan qilish | To'liq qayta yuklash | `<Link>` |
| `useSearchParams` ni `Suspense` siz ishlatish | Butun sahifa dinamik bo'ladi | `<Suspense>` bilan o'rang |
| Filtr o'zgarishida `push` | Tarix to'ladi | `replace` |
| Filtr o'zgarganda `page` ni tozalamaslik | Bo'sh natija ("5-sahifa" qolib ketadi) | `params.delete('page')` |
| Ko'p havolali sahifada prefetch'ni qoldirish | O'nlab keraksiz so'rov | `prefetch={false}` |
| `aria-current` yozmaslik | Skrinrider aktiv sahifani bilmaydi | `aria-current="page"` |

## Amaliyot

1. Dashboard navigatsiyasini yozing: aktiv havola `aria-current` bilan belgilansin.
2. Katalog filtrlarini `searchParams` orqali boshqaring (`replace`, `scroll: false`, `page` tozalash).
3. `useSearchParams` ishlatgan komponentni `Suspense` siz qoldiring va build chiqishida sahifa dinamik bo'lganini ko'ring; keyin tuzating.
4. `useLinkStatus` bilan sekin havolaga indikator qo'shing (sun'iy kechikish bilan).
5. Ichki havolani `<a>` bilan yozing va Network panelida to'liq qayta yuklashni kuzating.

## Rasmiy hujjat

- Navigatsiya: <https://nextjs.org/docs/app/getting-started/linking-and-navigating>
- `<Link>`: <https://nextjs.org/docs/app/api-reference/components/link>
- `useRouter`: <https://nextjs.org/docs/app/api-reference/functions/use-router>
