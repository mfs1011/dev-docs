# 12 — Marshrut guruhlari va parallel marshrutlar

[← Oldingi: Navigatsiya](11-navigatsiya.md) · [Mundarija](README.md) · [Keyingi: Metadata va SEO →](13-metadata-va-seo.md)

## Tushuncha

App Router'da URL'ga ta'sir qilmaydigan uch mexanizm bor:

| Mexanizm | Sintaksis | Vazifasi |
| --- | --- | --- |
| **Marshrut guruhi** | `(nom)` | Layout va tashkiliylik uchun guruhlash |
| **Parallel marshrut** | `@nom` | Bir sahifada bir nechta mustaqil bo'lak |
| **Intercepting** | `(.)`, `(..)`, `(...)` | Marshrutni ushlab, modal sifatida ko'rsatish |
| **Private papka** | `_nom` | Marshrutlashdan butunlay chetda |

## Kod: marshrut guruhlari

```
app/
├── layout.tsx                      ← ildiz
├── (marketing)/
│   ├── layout.tsx                  ← marketing layout
│   ├── page.tsx                    → /
│   └── pricing/page.tsx            → /pricing
├── (shop)/
│   ├── layout.tsx                  ← do'kon layout (savat bilan)
│   └── products/page.tsx           → /products
└── (auth)/
    ├── layout.tsx                  ← markazlashtirilgan, header'siz
    └── login/page.tsx              → /login
```

Guruh nomi URL'da **ko'rinmaydi**. Uch qo'llanilishi:

1. **Turli layoutlar** — yuqoridagi misol;
2. **Kodni tashkil qilish** — `(admin)`, `(public)` kabi mantiqiy bo'linish;
3. **Ildiz layoutni bo'lish** — har guruhga o'z `layout.tsx` i (lekin `<html>` faqat bittasida).

## Kod: private papkalar

```
app/
├── _components/                    ← marshrut EMAS
│   └── Header.tsx
├── _lib/
│   └── utils.ts
└── page.tsx
```

Pastki chiziq bilan boshlangan papka marshrutlashdan chetda qoladi. Bu — `app/` ichida yordamchi fayllarni saqlashning aniq usuli (07-bobdagi colocation'ning qat'iyroq shakli).

## Kod: parallel marshrutlar

Bir sahifada bir nechta mustaqil "slot":

```
app/dashboard/
├── layout.tsx
├── page.tsx                        → asosiy mazmun (children)
├── @analytics/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
└── @team/
    ├── page.tsx
    └── loading.tsx
```

::: ts
```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <section className="main">{children}</section>
      <aside className="side">
        {analytics}
        {team}
      </aside>
    </div>
  )
}
```
:::

::: js
```jsx
// app/dashboard/layout.jsx
export default function DashboardLayout({ children, analytics, team }) {
  return (
    <div className="dashboard">
      <section className="main">{children}</section>
      <aside className="side">
        {analytics}
        {team}
      </aside>
    </div>
  )
}
```
:::

Har slot **mustaqil** yuklanadi va o'z `loading.tsx` / `error.tsx` iga ega bo'ladi. Ya'ni analitika sekin yuklansa, jamoa ro'yxati kutib turmaydi — bu streaming bilan birga kuchli ishlaydi (20-bob).

## Kod: `default.tsx`

Parallel marshrutda navigatsiya bo'lganda, slot uchun mos sahifa bo'lmasa, Next `default.tsx` ni qidiradi:

::: ts
```tsx
// app/dashboard/@analytics/default.tsx
export default function Default() {
  return null                       // yoki zaxira mazmun
}
```
:::

::: js
```jsx
// app/dashboard/@analytics/default.jsx
export default function Default() {
  return null
}
```
:::

`default.tsx` bo'lmasa, to'liq sahifa yangilanganda 404 chiqishi mumkin — shuning uchun har slotga qo'shish tavsiya etiladi.

## Kod: shartli slotlar

::: ts
```tsx
// app/layout.tsx — foydalanuvchi roliga qarab turli panel
export default async function Layout({
  children,
  admin,
  user,
}: {
  children: React.ReactNode
  admin: React.ReactNode
  user: React.ReactNode
}) {
  const currentUser = await getCurrentUser()

  return (
    <>
      {children}
      {currentUser?.role === 'admin' ? admin : user}
    </>
  )
}
```
:::

::: js
```jsx
export default async function Layout({ children, admin, user }) {
  const currentUser = await getCurrentUser()

  return (
    <>
      {children}
      {currentUser?.role === 'admin' ? admin : user}
    </>
  )
}
```
:::

Diqqat: bu **ko'rinish** darajasidagi ajratish. Admin ma'lumotini himoya qilish serverda bo'lishi kerak (30, 45-bob).

## Kod: intercepting routes — modal naqshi

Eng foydali qo'llanilishi: **rasm yoki mahsulotni modalda ochish, lekin URL to'liq sahifaga ishora qilsin**.

```
app/
├── feed/
│   ├── page.tsx                        → /feed
│   └── @modal/
│       ├── default.tsx
│       └── (.)photo/[id]/page.tsx      → /photo/:id ni USHLAYDI
├── photo/[id]/page.tsx                 → /photo/:id (to'liq sahifa)
└── layout.tsx
```

Prefikslar:

| Prefiks | Nimani ushlaydi |
| --- | --- |
| `(.)` | Bir xil darajadagi segment |
| `(..)` | Bir daraja yuqoridagi |
| `(..)(..)` | Ikki daraja yuqoridagi |
| `(...)` | `app/` ildizidan |

::: ts
```tsx
// app/feed/@modal/(.)photo/[id]/page.tsx
import { Modal } from '@/components/Modal'

export default async function PhotoModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <img src={photo.url} alt={photo.alt} />
    </Modal>
  )
}
```
:::

::: js
```jsx
// app/feed/@modal/(.)photo/[id]/page.jsx
import { Modal } from '@/components/Modal'

export default async function PhotoModal({ params }) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <img src={photo.url} alt={photo.alt} />
    </Modal>
  )
}
```
:::

Natija:

| Harakat | Nima ko'rinadi |
| --- | --- |
| `/feed` da rasmga bosish | Modal ochiladi, URL `/photo/12` bo'ladi |
| Sahifani yangilash | To'liq sahifa (`app/photo/[id]/page.tsx`) |
| Havolani ulashish | To'liq sahifa |
| Orqaga bosish | Modal yopiladi, feed qoladi |

Bu — Instagram/Twitter uslubidagi tajriba va uni qo'lda qurish ancha murakkab.

Modal komponenti klientda bo'ladi:

::: ts
```tsx
// components/Modal.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} onClose={() => router.back()} className="modal">
      {children}
    </dialog>
  )
}
```
:::

::: js
```jsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function Modal({ children }) {
  const router = useRouter()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!dialogRef.current?.open) dialogRef.current?.showModal()
  }, [])

  return (
    <dialog ref={dialogRef} onClose={() => router.back()} className="modal">
      {children}
    </dialog>
  )
}
```
:::

Native `<dialog>` fokus tuzog'i va `Escape` ni o'zi qo'llab-quvvatlaydi (44-bob).

## Muhandislik nuqtai nazari: qachon parallel marshrut kerak

| Holat | Parallel marshrut |
| --- | --- |
| Dashboard: bir nechta mustaqil panel, har biri sekin | ✅ Ha |
| Modal + to'liq sahifa (rasm, mahsulot, profil) | ✅ Ha (intercepting bilan) |
| Rolga qarab turli panel | ✅ Ha |
| Tab'lar (bir vaqtda bittasi ko'rinadi) | ❌ Oddiy marshrut yoki klient holati |
| Sidebar + kontent | ❌ Oddiy layout yetarli |

Parallel marshrutlar **murakkablik qo'shadi**: `default.tsx`, navigatsiya xatti-harakati, to'liq yangilash holati. Faqat ular yechadigan aniq muammo bo'lsa ishlating.

## Muhandislik nuqtai nazari: modal naqshlari

| Yondashuv | Ulashiladimi | Orqaga tugmasi | Murakkablik |
| --- | --- | --- | --- |
| Klient holati (`useState`) | ❌ | ❌ | Past |
| `searchParams` (`?modal=photo-12`) | ✅ | ✅ | O'rtacha |
| Intercepting routes | ✅ | ✅ | Yuqori, lekin eng to'liq |

Oddiy tasdiqlash modali (`"O'chirilsinmi?"`) — klient holati. Mazmunli modal (rasm, mahsulot detali) — URL'da bo'lishi kerak.

## Muhandislik nuqtai nazari: guruhlar bilan ildizni bo'lish

```
app/
├── (main)/
│   ├── layout.tsx                  ← <html> shu yerda
│   └── page.tsx                    → /
└── (minimal)/
    ├── layout.tsx                  ← boshqa <html> (masalan boshqa til yo'nalishi)
    └── print/page.tsx              → /print
```

Bu ilg'or naqsh: ikki butunlay boshqa hujjat tuzilmasi (masalan asosiy sayt va chop etish uchun sahifa). Har guruhda `layout.tsx` o'z `<html>`/`<body>` sini chiqaradi va ular orasidagi navigatsiya **to'liq qayta yuklash** bo'ladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Slotga `default.tsx` yozmaslik | To'liq yangilashda 404 | Har slotga qo'shing |
| Ikki guruhda bir xil URL (`(a)/about` va `(b)/about`) | Konflikt, build xatosi | Noyob yo'llar |
| Parallel marshrutni tab uchun ishlatish | Ortiqcha murakkablik | Oddiy marshrut |
| Intercepting prefiksini noto'g'ri tanlash | Ushlanmaydi | Daraja hisobini tekshiring |
| Modal mazmunini faqat interceptda yozish | To'liq sahifa bo'sh qoladi | Ikkalasi ham bo'lsin |
| Rolga qarab slot bilan himoya qilish | Bu ko'rinish, xavfsizlik emas | Serverda tekshiring |
| Private papkani (`_lib`) marshrut deb o'ylash | U URL hosil qilmaydi | Shunday mo'ljallangan |

## Amaliyot

1. Ikki guruh yarating (`(marketing)`, `(app)`) va ularga turli layout bering; URL'da guruh nomi ko'rinmasligini tasdiqlang.
2. Dashboard'da ikki parallel slot (`@stats`, `@activity`) yarating, har biriga `loading.tsx` qo'shing va turli kechikish bering.
3. `default.tsx` ni o'chirib, sahifani to'liq yangilang — nima bo'ladi?
4. Intercepting route bilan rasm modalini yozing: `/feed` dan ochilsa modal, to'g'ridan-to'g'ri ochilsa to'liq sahifa.
5. Modalda `Escape` va orqaga tugmasi ishlashini tekshiring.

## Rasmiy hujjat

- Marshrut guruhlari: <https://nextjs.org/docs/app/api-reference/file-conventions/route-groups>
- Parallel marshrutlar: <https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes>
- Intercepting routes: <https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes>
