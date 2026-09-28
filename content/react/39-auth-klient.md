# 39 — Autentifikatsiya: klient tomoni

[← Oldingi: Formalar](38-formalar.md) · [Mundarija](README.md) · [Keyingi: Dizayn tizimi →](40-dizayn-tizimi.md)

## Tushuncha: kalit tushunchalar

Tashqi backend (Laravel, Symfony, Go, Node) bilan ishlaganda eng ko'p chalkashlik shu yerda. Avval atamalarni aniq ajratamiz.

**Autentifikatsiya (authentication)** — "sen kimsan?" Login/parol tekshiriladi.
**Avtorizatsiya (authorization)** — "senga nima mumkin?" Rollar va ruxsatlar.

Sessiyani saqlashning ikki modeli bor:

| | Sessiya (cookie) | Token (JWT) |
| --- | --- | --- |
| Holat qayerda | Serverda (sessiya do'koni) | Token ichida (stateless) |
| Klient nima saqlaydi | Sessiya ID (cookie) | Token matni |
| Bekor qilish | Oson (serverda o'chiriladi) | Qiyin (muddat tugashini kutish yoki qora ro'yxat) |
| Mobil/tashqi klient | Noqulayroq | Qulay |
| Bir domen | Tabiiy | Ishlaydi |
| Bir necha domen/servis | Murakkab | Tabiiy |

**Access token** — qisqa muddatli (5–15 daqiqa), har so'rovda yuboriladi.
**Refresh token** — uzoq muddatli (kunlar/haftalar), faqat yangi access token olish uchun ishlatiladi.

Nega ikkitasi: access token o'g'irlansa, u tez eskiradi; refresh token esa kamdan-kam uzatiladi va uni serverda bekor qilish mumkin.

## Kod: JWT ichida nima bor

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE3...
└────── header ─────┘ └──────── payload ────────┘ └─ signature ─┘
```

```js
// Payload'ni o'qish (imzoni TEKSHIRMAYDI — bu faqat ma'lumot)
function decodeJwt(token) {
  const [, payload] = token.split('.')

  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
}

const claims = decodeJwt(accessToken)
// { sub: '123', exp: 1735689600, iat: 1735689000, role: 'admin' }
```

Uchta muhim nuqta:

1. **JWT shifrlanmagan** — uni har kim o'qiy oladi. Maxfiy ma'lumot solmang;
2. **Imzoni faqat server tekshira oladi** — klientdagi `role: 'admin'` ni o'zgartirish mumkin, lekin server buni qabul qilmaydi;
3. **`exp`** — muddat (Unix soniyalarda). Klient uni faqat "yangilash vaqti keldimi?" uchun o'qiydi, xavfsizlik uchun emas.

## Kod: token qayerda saqlanadi

| Joy | XSS'da o'g'irlanadimi | CSRF xavfi | Sahifa yangilanganda | Tavsiya |
| --- | --- | --- | --- | --- |
| `localStorage` | ✅ Ha | Yo'q | Saqlanadi | ❌ Tavsiya etilmaydi |
| `sessionStorage` | ✅ Ha | Yo'q | Tab yopilsa yo'qoladi | ❌ |
| Oddiy cookie | ✅ Ha | ✅ Ha | Saqlanadi | ❌ |
| **httpOnly cookie** | ❌ Yo'q | Himoyalanadi (`SameSite`) | Saqlanadi | ✅ Eng yaxshi |
| **Xotirada (`useRef`/store)** | ❌ Yo'q (JS o'qiydi, lekin saqlanmaydi) | Yo'q | Yo'qoladi | ✅ Refresh cookie bilan |

Eng ishonchli kombinatsiya:

```
access token  → xotirada (JS o'zgaruvchisi)
refresh token → httpOnly + Secure + SameSite cookie
```

Sahifa yangilanganda access token yo'qoladi, lekin refresh cookie qoladi va ilova ishga tushganda yangi access token oladi.

Agar backend faqat JSON qaytarsa va cookie o'rnatmasa, `localStorage` amalda ishlatiladi — lekin unda XSS himoyasiga (47-bob) ikki barobar e'tibor bering.

## Kod: token saqlash qatlami

::: ts
```ts
// shared/auth/token-store.ts
let accessToken: string | null = null
let expiresAt = 0

export const tokenStore = {
  get: () => accessToken,

  set(token: string) {
    accessToken = token

    try {
      const { exp } = decodeJwt(token)

      expiresAt = exp * 1000
    } catch {
      expiresAt = 0
    }
  },

  clear() {
    accessToken = null
    expiresAt = 0
  },

  // 30 soniya zaxira bilan: so'rov yo'lda ekan muddati tugamasin
  isExpired: () => !accessToken || Date.now() > expiresAt - 30_000,
}
```
:::

::: js
```js
// shared/auth/token-store.js
let accessToken = null
let expiresAt = 0

export const tokenStore = {
  get: () => accessToken,

  set(token) {
    accessToken = token

    try {
      const { exp } = decodeJwt(token)

      expiresAt = exp * 1000
    } catch {
      expiresAt = 0
    }
  },

  clear() {
    accessToken = null
    expiresAt = 0
  },

  isExpired: () => !accessToken || Date.now() > expiresAt - 30_000,
}
```
:::

## Kod: refresh oqimi — eng muhim qism

Muammo: access token muddati tugadi va **bir vaqtning o'zida 5 ta so'rov** ketyapti. Naif yechim 5 ta refresh so'rovi yuboradi; rotation yoqilgan bo'lsa (har refresh yangi refresh token beradi), 4 tasi eskirgan token bilan ketib, foydalanuvchi tizimdan chiqib qoladi.

To'g'ri yechim — **bitta refresh promise'ini bo'lishish**:

::: ts
```ts
// shared/auth/refresh.ts
let refreshPromise: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  // Allaqachon ketayotgan bo'lsa — o'shani kutamiz
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',            // httpOnly refresh cookie yuboriladi
  })
    .then(async (response) => {
      if (!response.ok) throw new ApiError('Refresh muvaffaqiyatsiz', { status: response.status })

      const { accessToken } = await response.json()

      tokenStore.set(accessToken)

      return accessToken
    })
    .finally(() => {
      refreshPromise = null            // keyingi safar yangisi yaratiladi
    })

  return refreshPromise
}
```
:::

::: js
```js
// shared/auth/refresh.js
let refreshPromise = null

export function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    .then(async (response) => {
      if (!response.ok) throw new ApiError('Refresh muvaffaqiyatsiz', { status: response.status })

      const { accessToken } = await response.json()

      tokenStore.set(accessToken)

      return accessToken
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}
```
:::

## Kod: so'rov qatlamiga ulash

::: ts
```ts
// shared/api/client.ts (31-bobdagi klientning to'ldirilgan varianti)
export async function request<T>(path: string, options: RequestOptions = {}, isRetry = false): Promise<T> {
  // 1. Muddati tugagan bo'lsa — oldindan yangilash
  if (tokenStore.isExpired() && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken()
    } catch {
      onSessionExpired()
      throw new ApiError('Sessiya tugadi', { status: 401 })
    }
  }

  const token = tokenStore.get()

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  // 2. Baribir 401 kelsa — BIR MARTA qayta urinish
  if (response.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken()

      return request<T>(path, options, true)      // ikkinchi marta urinilmaydi
    } catch {
      onSessionExpired()
    }
  }

  if (response.status === 204) return null as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `HTTP ${response.status}`, {
      status: response.status,
      code: payload?.code,
      details: payload?.errors,
    })
  }

  return payload as T
}

function onSessionExpired() {
  tokenStore.clear()
  queryClient.clear()
  window.location.href = `/login?from=${encodeURIComponent(location.pathname)}`
}
```
:::

::: js
```js
export async function request(path, options = {}, isRetry = false) {
  if (tokenStore.isExpired() && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken()
    } catch {
      onSessionExpired()
      throw new ApiError('Sessiya tugadi', { status: 401 })
    }
  }

  const token = tokenStore.get()

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (response.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    try {
      await refreshAccessToken()

      return request(path, options, true)
    } catch {
      onSessionExpired()
    }
  }

  if (response.status === 204) return null

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(payload?.message ?? `HTTP ${response.status}`, {
      status: response.status,
      code: payload?.code,
      details: payload?.errors,
    })
  }

  return payload
}
```
:::

Ikki himoya qatlami: **oldindan yangilash** (`isExpired`) va **401 dan keyin bir marta qayta urinish**. `isRetry` bayrog'i cheksiz siklni oldini oladi.

## Kod: auth konteksti

::: ts
```tsx
// features/auth/AuthProvider.tsx
type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (credentials: Credentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  // Ilova ishga tushganda: refresh cookie orqali sessiyani tiklash
  const { data: user, isPending } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (tokenStore.isExpired()) await refreshAccessToken()

      return api.get<User>('/auth/me')
    },
    retry: false,
    staleTime: Infinity,
  })

  const login = useCallback(async (credentials: Credentials) => {
    const { accessToken } = await api.post<{ accessToken: string }>('/auth/login', credentials)

    tokenStore.set(accessToken)
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  }, [queryClient])

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {}).catch(() => {})   // server refresh cookie'ni o'chiradi

    tokenStore.clear()
    queryClient.clear()                                   // keshdagi shaxsiy ma'lumot tozalansin
  }, [queryClient])

  const value = useMemo(
    () => ({ user: user ?? null, isLoading: isPending, login, logout }),
    [user, isPending, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth: AuthProvider topilmadi')

  return ctx
}
```
:::

::: js
```jsx
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()

  const { data: user, isPending } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (tokenStore.isExpired()) await refreshAccessToken()

      return api.get('/auth/me')
    },
    retry: false,
    staleTime: Infinity,
  })

  const login = useCallback(async (credentials) => {
    const { accessToken } = await api.post('/auth/login', credentials)

    tokenStore.set(accessToken)
    await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
  }, [queryClient])

  const logout = useCallback(async () => {
    await api.post('/auth/logout', {}).catch(() => {})

    tokenStore.clear()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(() => ({ user: user ?? null, isLoading: isPending, login, logout }), [user, isPending, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```
:::

## Kod: himoyalangan marshrutlar va rollar

```jsx
function RequireAuth({ children, roles }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.some((r) => user.roles.includes(r))) return <Forbidden />

  return children
}

<Route path="/admin" element={<RequireAuth roles={['admin']}><AdminLayout /></RequireAuth>} />
```

Eslatma: bu **interfeys** cheklovi. Haqiqiy tekshiruv serverda (47-bob) — klientdagi `user.roles` ni DevTools'da o'zgartirish mumkin.

## Kod: tablar orasida sinxronlash

Bir tabda chiqilsa, boshqasi ham chiqishi kerak:

```js
// Chiqishda
localStorage.setItem('auth-event', JSON.stringify({ type: 'logout', at: Date.now() }))

// Tinglash
window.addEventListener('storage', (event) => {
  if (event.key !== 'auth-event') return

  const { type } = JSON.parse(event.newValue ?? '{}')

  if (type === 'logout') {
    tokenStore.clear()
    queryClient.clear()
    window.location.href = '/login'
  }
})
```

`BroadcastChannel` ham shu vazifani bajaradi va toza API beradi.

## Muhandislik nuqtai nazari: umumiy oqim

```
1. Login
   POST /auth/login { email, password }
   ← { accessToken }  +  Set-Cookie: refresh=...; HttpOnly; Secure; SameSite=Lax

2. Har so'rov
   Authorization: Bearer <accessToken>

3. Access token muddati tugadi (yoki 401 keldi)
   POST /auth/refresh   (refresh cookie avtomatik yuboriladi)
   ← { accessToken }    (+ rotation bo'lsa yangi refresh cookie)

4. Refresh ham muvaffaqiyatsiz
   → tokenStore.clear(), queryClient.clear(), /login ga yo'naltirish

5. Chiqish
   POST /auth/logout    (server refresh tokenni bekor qiladi va cookie'ni o'chiradi)
```

Backend'dan talab qilinadigan narsalar: `credentials: 'include'` ishlashi uchun **CORS** sozlamalari (`Access-Control-Allow-Credentials: true` va aniq `Origin`), refresh endpoint, logout endpoint.

## Muhandislik nuqtai nazari: nega bu qiyin tuyuladi

Chalkashlikning odatiy sabablari:

| Savol | Javob |
| --- | --- |
| "Tokenni qayerda saqlayman?" | Access — xotirada, refresh — httpOnly cookie |
| "Sahifa yangilanganda nega chiqib ketaman?" | Access token xotirada edi; ishga tushganda refresh qiling |
| "Nega bir necha refresh so'rovi ketyapti?" | Promise bo'lishish yo'q (yuqoridagi naqsh) |
| "401 dan keyin cheksiz sikl" | `isRetry` bayrog'i yo'q |
| "Cookie yuborilmayapti" | `credentials: 'include'` + CORS sozlamalari |
| "Chiqqandan keyin ham eski ma'lumot ko'rinadi" | `queryClient.clear()` qilinmagan |
| "Boshqa tabda chiqdim, bu yerda qoldim" | `storage`/`BroadcastChannel` yo'q |

## Muhandislik nuqtai nazari: SSR bilan farqi

Next.js'da bu naqsh o'zgaradi: server komponentlar cookie'ni o'zi o'qiydi va so'rovni serverdan yuboradi, ya'ni access token brauzer JS'iga umuman kerak bo'lmasligi mumkin. Bu — Next.js qo'llanmasining IV qismi (25–31-boblar), va u shu bobdagi tushunchalarga tayanadi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Token `localStorage` da | XSS bitta teshik — akkaunt ketdi | httpOnly cookie + xotira |
| Refresh so'rovlarini birlashtirmaslik | Rotation buziladi, foydalanuvchi chiqib ketadi | Bitta promise |
| 401 dan keyin cheksiz qayta urinish | Sikl | `isRetry` bayrog'i |
| `credentials: 'include'` ni unutish | Cookie yuborilmaydi | Har so'rovda |
| Chiqishda keshni tozalamaslik | Keyingi foydalanuvchi eski ma'lumotni ko'radi | `queryClient.clear()` |
| Rollarni faqat klientda tekshirish | Chetlab o'tiladi | Serverda ham |
| JWT payload'iga maxfiy ma'lumot solish | U ochiq o'qiladi | Faqat ID va rol |
| Muddatni zaxirasiz tekshirish | So'rov yo'lda muddati tugaydi | 30 s zaxira |

## Amaliyot

1. `tokenStore` va `refreshAccessToken` ni yozing; `refreshPromise` bo'lishishini olib tashlab, parallel 5 so'rov yuboring va Network panelida nechta refresh ketganini ko'ring.
2. 401 → refresh → qayta urinish oqimini yozing va refresh ham 401 qaytarganda cheksiz sikl bo'lmasligini tekshiring.
3. `AuthProvider` ni yozing; sahifani yangilab, sessiya tiklanishini tasdiqlang.
4. `RequireAuth` bilan himoyalangan marshrut qiling va kirishdan keyin `from` ga qaytishni amalga oshiring.
5. Ikki tab oching, birida chiqing — ikkinchisi ham chiqishiga erishing.
6. DevTools'da `user.roles` ni o'zgartirib, admin tugmasini ko'rsating — keyin serverga so'rov yuborib, u rad etishini tasdiqlang.

## Rasmiy hujjat

- OWASP: JWT uchun tavsiyalar: <https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html>
- MDN — Cookie va `SameSite`: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies>
- MDN — CORS va credentials: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS>
