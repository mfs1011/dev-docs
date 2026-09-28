# 31 — Ma'lumot yuklash

[← Oldingi: Tashqi tizimlar bilan ishlash](30-tashqi-tizimlar.md) · [Mundarija](README.md) · [Keyingi: TanStack Query →](32-tanstack-query.md)

## Tushuncha

React'ning o'z ma'lumot yuklash qatlami **yo'q**. Shuning uchun har loyiha uni o'zi yig'adi va bu eng ko'p xato qilinadigan joylardan biri.

Bu bobda avval **qo'lda** yozamiz (nima kerakligini ko'rish uchun), keyin nega kutubxona kerakligini aniqlaymiz.

## Kod: HTTP klient qatlami

::: ts
```ts
// shared/api/client.ts
export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, string[]>

  constructor(message: string, init: { status: number; code?: string; details?: Record<string, string[]> }) {
    super(message)

    this.name = 'ApiError'
    this.status = init.status
    this.code = init.code
    this.details = init.details
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '/api'

type RequestOptions = RequestInit & { body?: unknown }

export async function request<T>(path: string, { body, ...options }: RequestOptions = {}): Promise<T> {
  const token = getAccessToken()

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

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

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>(path, options),
  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
```
:::

::: js
```js
// shared/api/client.js
export class ApiError extends Error {
  constructor(message, { status, code, details } = {}) {
    super(message)

    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

const BASE = import.meta.env.VITE_API_URL ?? '/api'

export async function request(path, { body, ...options } = {}) {
  const token = getAccessToken()

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

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

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
```
:::

Muhim detal: **xato har doim bir xil shaklda** (`ApiError`) chiqadi. Shunda komponentlarda `error.status === 404` yoki `error.details.email` tekshiruvlari ishonchli bo'ladi (33, 38-bob).

## Kod: `useFetch` hooki (qo'lda)

::: ts
```tsx
export function useFetch<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(path))

  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!path) return

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    api
      .get<T>(path, { signal: controller.signal })
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [path, reloadKey])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  return { data, error, isLoading, refetch }
}
```
:::

::: js
```jsx
export function useFetch(path) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(path))
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!path) return

    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    api
      .get(path, { signal: controller.signal })
      .then(setData)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setIsLoading(false))

    return () => controller.abort()
  }, [path, reloadKey])

  const refetch = useCallback(() => setReloadKey((k) => k + 1), [])

  return { data, error, isLoading, refetch }
}
```
:::

```jsx
const { data: user, error, isLoading, refetch } = useFetch(`/users/${userId}`)
```

## Kod: mutatsiya hooki

::: ts
```tsx
export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  async function mutate(...args: TArgs): Promise<TResult | undefined> {
    if (isPending) return                      // ikki marta bosishdan himoya (12-bob)

    setIsPending(true)
    setError(null)

    try {
      return await fn(...args)
    } catch (err) {
      setError(err as ApiError)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  return { mutate, isPending, error }
}
```
:::

::: js
```jsx
export function useMutation(fn) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  async function mutate(...args) {
    if (isPending) return

    setIsPending(true)
    setError(null)

    try {
      return await fn(...args)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  return { mutate, isPending, error }
}
```
:::

## Kod: nima yetishmayapti

Yuqoridagi 60 qator ishlaydi, lekin real ilovada quyidagilar kerak bo'ladi:

| Ehtiyoj | Qo'lda qancha ish |
| --- | --- |
| Bir xil so'rovni ikki komponent qilsa — bitta so'rov | Global inflight xaritasi |
| Ma'lumot keshi (sahifaga qaytganda darhol ko'rinsin) | Kesh + TTL |
| Eskirgan ma'lumotni fon'da yangilash | `staleTime` mantiqi |
| Oyna fokusga qaytganda yangilash | `visibilitychange` tinglovchisi |
| Xatoda qayta urinish (exponential backoff) | Retry mantiqi |
| Sahifalash va cheksiz ro'yxat | Kursor/sahifa boshqaruvi |
| Mutatsiyadan keyin ro'yxatni yangilash | Invalidatsiya mexanizmi |
| Optimistik yangilash + qaytarish | Snapshot/rollback |
| Offline va qayta ulanish | Navbat |

Har biri 20–50 qator va o'z chekka holatlariga ega. Shuning uchun keyingi bobda **TanStack Query** — shu ro'yxatni to'liq qoplaydigan kutubxona.

## Kod: so'rovlarni birlashtirish (deduplikatsiya)

Kutubxonasiz eng kerakli qism — takroriy so'rovlarni birlashtirish:

::: ts
```ts
const inflight = new Map<string, Promise<unknown>>()
const cache = new Map<string, { value: unknown; at: number }>()

export async function cachedGet<T>(path: string, ttl = 30_000): Promise<T> {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.at < ttl) return hit.value as T

  const existing = inflight.get(path)
  if (existing) return existing as Promise<T>

  const promise = api
    .get<T>(path)
    .then((value) => {
      cache.set(path, { value, at: Date.now() })

      return value
    })
    .finally(() => inflight.delete(path))

  inflight.set(path, promise)

  return promise
}

export function invalidate(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
```
:::

::: js
```js
const inflight = new Map()
const cache = new Map()

export async function cachedGet(path, ttl = 30_000) {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.at < ttl) return hit.value

  const existing = inflight.get(path)
  if (existing) return existing

  const promise = api
    .get(path)
    .then((value) => {
      cache.set(path, { value, at: Date.now() })

      return value
    })
    .finally(() => inflight.delete(path))

  inflight.set(path, promise)

  return promise
}

export function invalidate(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
```
:::

## Muhandislik nuqtai nazari: poyga holatlari

29-bobda ko'rilgan uchta klassik muammo ma'lumot yuklashda ayniqsa tez-tez uchraydi:

1. **Eski javob yangisini bosadi** → `AbortController` yoki `ignore` bayrog'i;
2. **Komponent o'chgandan keyin `setState`** → tozalashda bekor qilish;
3. **Ikki marta yuborilgan mutatsiya** → `isPending` bayrog'i.

Ular "goh-goh" chiqadi va sekin tarmoqda ko'proq ko'rinadi — shuning uchun ishlab chiqishda Network throttling bilan sinab ko'ring.

## Muhandislik nuqtai nazari: server holati klient holatidan farq qiladi

17-bobdagi jadvalni takrorlaymiz, chunki bu bobning asosiy g'oyasi:

| | Klient holati | Server holati |
| --- | --- | --- |
| Egasi | Brauzer | Server |
| Eskiradimi | Yo'q | Ha |
| Boshqa foydalanuvchi o'zgartira oladimi | Yo'q | Ha |
| Sinxronlash kerakmi | Yo'q | Ha |
| Mos vosita | `useState`, store | So'rov keshi |

Server holatini `useState` ga solish — texnik jihatdan ishlaydi, lekin yuqoridagi jadvaldagi hamma ishni qo'lda qilishingizni anglatadi.

## Muhandislik nuqtai nazari: qaysi kutubxonani tanlash

| Kutubxona | Kuchli tomoni |
| --- | --- |
| **TanStack Query** | Eng to'liq: kesh, retry, pagination, optimistik yangilash (32-bob) |
| **SWR** | Soddaroq API, yengilroq |
| **RTK Query** | Redux ekotizmi ichida |
| **Apollo / urql** | GraphQL uchun |
| Framework yechimi (Next RSC, React Router loader) | Server tomonida ma'lumot |

Vite SPA uchun standart tanlov — TanStack Query.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| `response.ok` ni tekshirmaslik | 404/500 "muvaffaqiyat" deb qabul qilinadi | `if (!response.ok) throw` |
| Har komponentda o'z xato mantiqi | Nomuvofiq xatti-harakat | Bitta klient qatlami |
| Bekor qilishni qo'shmaslik | Poyga holati | `AbortController` |
| Kesh va deduplikatsiyasiz ishlash | Bir sahifada bir xil so'rov 3 marta | Kesh yoki kutubxona |
| Serverdagi xato matnini ko'rsatmaslik | Foydalanuvchi nima qilishni bilmaydi | `payload.message`/`errors` |
| Token'ni har chaqiruvda qo'lda qo'shish | Unutiladi | Klient qatlamida |
| Kutubxonani "ortiqcha bog'liqlik" deb rad etish | Uning ishini qo'lda yozasiz | Hajmni foyda bilan solishtiring |

## Amaliyot

1. `api` klientini yozing va 404, 422, 500 javoblarini turlicha boshqaring.
2. `useFetch` ni yozing, `userId` ni tez almashtiring va Network panelida bekor qilingan so'rovlarni ko'ring.
3. `cachedGet` ni yozing va bir sahifada uch komponentdan bir xil so'rovni chaqiring — bitta so'rov ketishini tasdiqlang.
4. `useMutation` bilan formani saqlang, Slow 3G da ikki marta bosib ko'ring.
5. Yuqoridagi "nima yetishmayapti" jadvalidan uchta bandni qo'lda amalga oshirishga urinib ko'ring va qancha qator chiqqanini yozib qo'ying.

## Rasmiy hujjat

- `fetch`: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>
- `AbortController`: <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
- React'da ma'lumot yuklash: <https://react.dev/learn/synchronizing-with-effects#fetching-data>
