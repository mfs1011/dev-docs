# 26 — Marshrutlash va lazy loading

[← Oldingi: Assetlar, stillar va i18n](25-assetlar-va-i18n.md) · [Mundarija](README.md) · [Keyingi: React + Vite shabloni →](27-react-shabloni.md)

## Qisqacha

FSD'da marshrutlash ikki joyga bo'linadi: **router konfiguratsiyasi** (qaysi URL — qaysi sahifa, layout, guard) — `app/routes`; **marshrut konstantalari** (URL shablonlari, `product(id)` kabi funksiyalar) — `shared/routes`, chunki ularni pastki qatlamlar ham ishlatadi (havola, redirect). Sahifalar public API orqali **lazy** yuklanadi — har sahifa alohida chunk.

Rasmiy hujjat bu yerda faqat segment nomlarini beradi (`app/routes`, `shared/routes`); quyidagi guard va lazy loading naqshlari — amaliy tavsiya.

## Qoida

| Nima | Qayerda | Nega |
| --- | --- | --- |
| Router yaratish, marshrutlar daraxti | `app/routes` | Hamma sahifani biladigan yagona joy |
| URL konstantalari va yasovchi funksiyalar | `shared/routes` | Widget/feature/entity havola yasashi kerak — `app`'dan import qila olmaydi |
| Guard **mantiqi** (sessiya bormi?) | `shared/auth` yoki `entities/session` | Qayta ishlatiladigan tekshiruv |
| Guard'ni marshrutga **ulash** | `app/routes` | Konfiguratsiya |
| Sahifaga xos ma'lumot oldindan yuklash (loader/resolver) | Sahifa slice'ida (`api`), routerda ulanadi | Sahifa o'z ma'lumotini biladi |
| Lazy import | Sahifaning `index.ts` public API'si orqali | Chuqur yo'l bilan chunk yuklash — public API'ni chetlab o'tish |

## Shablon

```text
shared/routes/index.ts        ROUTES = { home, catalog, product(id), checkout }
shared/auth/require-auth.ts   sessiya tekshiruvi (framework'ga xos)
app/routes/
├── router.ts                 marshrutlar daraxti, lazy sahifalar, guard'lar
└── layouts/                  (24-bob)
pages/<sahifa>/index.ts       export { XPage }   ← lazy import shu yerdan
```

## Kod: guard va lazy sahifa

::: react
```tsx
// shared/auth/require-auth.ts — React Router loader sifatida
import { redirect } from 'react-router'
import { ROUTES } from '../routes'
import { getSession } from './session'

export async function requireAuth({ request }: { request: Request }) {
  if (!(await getSession())) {
    const back = new URL(request.url).pathname
    throw redirect(`${ROUTES.signIn}?returnTo=${encodeURIComponent(back)}`)
  }
  return null
}

// app/routes/router.tsx — ulash
{
  path: ROUTES.checkout,
  loader: requireAuth,
  lazy: async () => ({ Component: (await import('@/pages/checkout')).CheckoutPage }),
}
```
:::

::: vue
```ts
// shared/auth/require-auth.ts — Vue Router navigatsiya guard'i
import type { NavigationGuard } from 'vue-router'
import { useSessionStore } from './session'
import { ROUTES } from '../routes'

export const requireAuth: NavigationGuard = (to) => {
  if (!useSessionStore().isAuthenticated) {
    return { name: ROUTES.signIn.name, query: { returnTo: to.fullPath } }
  }
}

// app/routes/router.ts — ulash
{
  ...ROUTES.checkout,
  beforeEnter: requireAuth,
  component: () => import('@/pages/checkout').then((m) => m.CheckoutPage),
}
```
:::

::: angular
```ts
// shared/auth/require-auth.ts — funksional guard
import { inject } from '@angular/core'
import { type CanActivateFn, Router } from '@angular/router'
import { Session } from './session'

export const requireAuth: CanActivateFn = (_route, state) =>
  inject(Session).isAuthenticated() ||
  inject(Router).createUrlTree(['/sign-in'], { queryParams: { returnTo: state.url } })

// app/routes/app.routes.ts — ulash
{
  path: 'checkout',
  canActivate: [requireAuth],
  loadComponent: () => import('@/pages/checkout').then((m) => m.CheckoutPage),
}
```
:::

## Qachon / qachon emas

| Savol | Javob |
| --- | --- |
| Har sahifa lazy bo'lishi kerakmi? | Odatda ha; bosh sahifa va eng ko'p ochiladigani eager bo'lishi mumkin |
| Ichma-ich marshrutlar (tab'lar sahifa ichida) | Ichki bo'laklar — sahifa slice'ida yoki widget'larda (10-bob) |
| Fayl asosidagi router (Next.js, Nuxt) | Framework papkasi faqat re-export; sahifa kodi FSD'da (28, 30-boblar) |
| `returnTo` URL'i | Faqat ichki yo'l ekanini tekshiring (ochiq redirect zaifligi) |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| `import('@/pages/checkout/ui/CheckoutPage')` | Public API chetlab o'tildi | `import('@/pages/checkout')` |
| URL satrlari 40 komponentda | Marshrut o'zgarsa qidirib topish | `shared/routes` |
| Feature `app/routes`'dan import qiladi | Import qoidasi | Konstantalar `shared/routes`'da |
| Guard mantiqi har marshrutda nusxa | Tekshiruv farqlanib ketadi | Bitta funksiya `shared/auth`'da |
| Guard — yagona himoya | Frontend guard xavfsizlik emas | Backend avtorizatsiyasi (Arxitektura 62-bob) |

## Manbalar

- Rasmiy: *Layers — App va Shared segmentlari* <https://feature-sliced.design/docs/reference/layers>
- Saytda: [React 35-bob — React Router](../react/35-react-router.md), [Vue 40-bob — Router chuqur](../vue/40-router-chuqur.md), [Angular 44-bob — Guard va resolver](../angular/44-guard-va-resolver.md), [Arxitektura 44-bob — Marshrutlash](../arxitektura/44-marshrutlash.md)
