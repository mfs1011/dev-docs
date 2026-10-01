# 22 — Autentifikatsiya

[← Oldingi: Server holati](21-server-holati.md) · [Mundarija](README.md) · [Keyingi: Tiplar va validatsiya →](23-tiplar.md)

## Qisqacha

Autentifikatsiya uch qadam: foydalanuvchidan ma'lumot olish → backend'ga yuborish → keyingi so'rovlar uchun tokenni saqlash. FSD'da: login **sahifasi** — `pages/sign-in` (har joydan ochiladigan **dialog** bo'lsa — widget); so'rovlar — `shared/api` yoki sahifa `api`'da; token — `shared` yoki `entities`'da, **hech qachon** sahifa yoki widget'da emas. Eng yaxshi saqlash joyi — **cookie**: frontend arxitekturasi uchun deyarli hech narsa talab qilmaydi.

## Qoida

| Qism | Qayerda |
| --- | --- |
| Login va ro'yxatdan o'tish sahifalari | `pages/sign-in` (o'xshash — bitta slice) |
| Har sahifadan ochiladigan login dialogi | `widgets/login-dialog` |
| Klient validatsiyasi (Zod) | Sahifaning `model` segmenti |
| `login()`, `logout()`, `refresh()` so'rovlari | `shared/api` (yoki sahifa `api`) |
| 2FA sahifasi | Login bilan bir slice'da (`pages/sign-in`) |
| Token va joriy foydalanuvchi | **A:** `shared/auth` / `shared/api` — klient bilan yonma-yon; **B:** `entities/session` (yoki `user`/`viewer`) — reaktiv store bilan |
| Chiqish tugmasi va uning mantiqi | Tugma turgan widget'ning `model`'ida (masalan header) |

**Token entity'da bo'lsa** — klient (`shared/api`) unga import qoidasini buzmasdan qanday yetadi? Uch yo'l: (1) har so'rovga qo'lda berish — oddiy, lekin noqulay; (2) kontekst yoki global saqlash — kalit `shared/api`'da, reaktiv store entity'da, provayder `app`'da; (3) store o'zgarganda tokenni klientga **inject** qilish (obuna). Oxirgi ikkisi yuqoriga yashirin bog'liqlik yaratadi — ongli qabul qiling.

**Avtomatik chiqish.** Logout yoki refresh so'rovi muvaffaqiyatsiz bo'lsa ham token saqlanadigan joy tozalanishi shart.

## Shablon

```text
pages/sign-in/
├── ui/SignInPage.tsx  RegisterPage.tsx  OtpPage.tsx
├── model/registration-schema.ts
└── index.ts

shared/
├── api/
│   ├── client.ts            401 → refresh → qayta urinish (middleware); refresh xato → tozalash
│   └── endpoints/auth.ts    login, logout, refresh, me
└── auth/                    (A variant)
    ├── session.ts           token / joriy foydalanuvchi holati
    └── index.ts             useSession / SessionStore

widgets/header/
└── model/logout.ts          logout() so'rovi + sessiyani tozalash
```

## Kod: sessiya `shared/auth`'da

::: react
```ts
// shared/auth/session.ts — kichik reaktiv store (Zustand)
import { create } from 'zustand'
import type { UserDto } from '../api'

interface Session { user: UserDto | null; setUser(u: UserDto | null): void }
export const useSession = create<Session>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

// widgets/header/model/use-logout.ts
import { logout } from '@/shared/api'
import { useSession } from '@/shared/auth'

export function useLogout() {
  const setUser = useSession((s) => s.setUser)
  return async () => {
    try { await logout() } finally { setUser(null) }   // so'rov xato bo'lsa ham tozalash
  }
}
```
:::

::: vue
```ts
// shared/auth/session.ts — Pinia store
import { defineStore } from 'pinia'
import type { UserDto } from '../api'

export const useSessionStore = defineStore('session', {
  state: () => ({ user: null as UserDto | null }),
  getters: { isAuthenticated: (s) => s.user !== null },
  actions: { setUser(user: UserDto | null) { this.user = user } },
})

// widgets/header/model/use-logout.ts
import { logout } from '@/shared/api'
import { useSessionStore } from '@/shared/auth'

export function useLogout() {
  const session = useSessionStore()
  return async () => {
    try { await logout() } finally { session.setUser(null) }   // so'rov xato bo'lsa ham tozalash
  }
}
```
:::

::: angular
```ts
// shared/auth/session.ts — signal asosidagi servis
import { Injectable, computed, signal } from '@angular/core'
import type { UserDto } from '../api'

@Injectable({ providedIn: 'root' })
export class Session {
  private readonly _user = signal<UserDto | null>(null)
  readonly user = this._user.asReadonly()
  readonly isAuthenticated = computed(() => this._user() !== null)
  setUser(user: UserDto | null) { this._user.set(user) }
}

// widgets/header/model/logout.ts
import { inject } from '@angular/core'
import { finalize } from 'rxjs'
import { AuthApi } from '@/shared/api'
import { Session } from '@/shared/auth'

export function injectLogout() {
  const api = inject(AuthApi)
  const session = inject(Session)
  return () => api.logout().pipe(finalize(() => session.setUser(null)))   // xato bo'lsa ham tozalash
}
```
:::

## Qachon / qachon emas

| Holat | Yechim |
| --- | --- |
| Sessiya cookie (BFF, SSR framework) | Frontend'da token yo'q — faqat `me` so'rovi va joriy foydalanuvchi holati |
| OAuth provayder orqali | Login sahifasida provayder havolasi; keyin 3-qadam (saqlash) |
| Access + refresh token | Refresh — `shared/api/client` middleware'ida |
| Token mantiqi murakkab (muddat, ko'p hisob) | `entities/session` + `model`'da biznes qoidalari |

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yo'l |
| --- | --- | --- |
| Token `pages/sign-in/model`'da | Boshqa sahifalar unga yeta olmaydi yoki pages → pages import | `shared` yoki `entities` |
| `entities/user` — ham joriy sessiya, ham boshqa foydalanuvchilar | Ruxsatlar va maxfiy maydonlar aralashadi | Joriy — `shared/auth` yoki `entities/viewer` |
| Logout xatosida sessiya qoladi | "Chiqdim" degan foydalanuvchi hali kirgan | `finally` bilan tozalash |
| Token `localStorage`'da "oddiylik uchun" | XSS bilan o'g'irlanadi | Cookie (HttpOnly) — imkon bo'lsa |

## Manbalar

- Rasmiy: *Authentication* <https://feature-sliced.design/docs/guides/examples/auth>
- Saytda: [Arxitektura 61-bob — Tokenlar](../arxitektura/61-tokenlar.md), [Angular 58-bob — Token refresh](../angular/58-auth-token-refresh.md), [React 39-bob — Auth klient](../react/39-auth-klient.md), [Next.js 26-bob — Token saqlash](../nextjs/26-token-saqlash.md)
