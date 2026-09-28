# 44 — HTTP qatlami

[← Oldingi: Pinia: chuqur](43-pinia-chuqur.md) · [Mundarija](README.md) · [Keyingi: Formalar arxitekturasi →](45-formalar-arxitekturasi.md)

## Tushuncha

Har komponentda `fetch` yozish ishlaydi — 10 ta komponentgacha. Keyin quyidagilar takrorlana boshlaydi: bazaviy URL, `Authorization` sarlavhasi, JSON parse, xato tekshiruvi, 401 da chiqish, yuklanish bayrog'i, bekor qilish, qayta urinish.

Yechim — **ikki qatlam**:

1. **Transport** — bitta joyda: sarlavhalar, bazaviy URL, xato normalizatsiyasi (31-bobdagi `useApi`);
2. **So'rov holati** — komponentga yaqin: `data` / `error` / `loading`, bekor qilish, qayta yuklash.

## Kod: transport qatlami

```js
// api/client.js
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

export async function request(path, { method = 'GET', body, signal, headers = {} } = {}) {
  const token = useAuthStore().token

  const response = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
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
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
```

Muhim detal: **xato har doim bir xil shaklda** (`ApiError`) chiqadi. Shunda komponentlarda `error.status === 404` yoki `error.details.email` kabi tekshiruvlar ishonchli bo'ladi.

## Kod: so'rov holati composable'i

```js
// composables/useQuery.js
import { ref, shallowRef, toValue, watchEffect } from 'vue'

export function useQuery(fetcher, { immediate = true } = {}) {
  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(false)

  let controller

  async function execute() {
    controller?.abort()
    controller = new AbortController()

    loading.value = true
    error.value = null

    try {
      data.value = await fetcher({ signal: controller.signal })
    } catch (cause) {
      if (cause.name !== 'AbortError') error.value = cause
    } finally {
      loading.value = false
    }
  }

  if (immediate) {
    watchEffect((onCleanup) => {
      execute()
      onCleanup(() => controller?.abort())
    })
  }

  return { data, error, loading, refresh: execute }
}
```

```vue
<script setup>
const route = useRoute()

const { data: user, error, loading, refresh } = useQuery(({ signal }) =>
  api.get(`/users/${route.params.id}`, { signal }),
)
</script>

<template>
    <UiSpinner v-if="loading" />
    <UiError v-else-if="error" :error="error" @retry="refresh" />
    <UserProfile v-else-if="user" :user="user" />
</template>
```

`watchEffect` ichida `route.params.id` o'qilgani uchun URL o'zgarganda so'rov **o'zi qayta ketadi** va eskisi bekor qilinadi (16-bob).

## Kod: mutatsiya (yozuv so'rovlari)

```js
// composables/useMutation.js
import { ref, shallowRef } from 'vue'

export function useMutation(fn) {
  const loading = ref(false)
  const error = shallowRef(null)

  async function mutate(...args) {
    if (loading.value) return                // ikki marta bosishdan himoya (14-bob)

    loading.value = true
    error.value = null

    try {
      return await fn(...args)
    } catch (cause) {
      error.value = cause
      throw cause
    } finally {
      loading.value = false
    }
  }

  return { mutate, loading, error }
}
```

```vue
<script setup>
const { mutate: save, loading: saving, error } = useMutation((payload) =>
  api.put(`/users/${props.id}`, payload),
)

async function onSubmit() {
  try {
    await save(form)
    toast('Saqlandi')
  } catch {
    // xato allaqachon `error` da
  }
}
</script>

<template>
    <button :disabled="saving" @click="onSubmit">{{ saving ? 'Saqlanmoqda…' : 'Saqlash' }}</button>
    <p v-if="error" class="error">{{ error.message }}</p>
</template>
```

## Kod: kesh va takroriy so'rovlarni birlashtirish

Bir sahifada uchta komponent bir xil `/api/me` ni so'rasa — uchta so'rov ketadi. Oddiy deduplikatsiya:

```js
// api/cache.js
const inflight = new Map()
const cache = new Map()

export async function cachedGet(path, { ttl = 30_000 } = {}) {
  const hit = cache.get(path)
  if (hit && Date.now() - hit.at < ttl) return hit.value

  if (inflight.has(path)) return inflight.get(path)      // birlashtirish

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

Yozuvdan keyin keshni bekor qiling:

```js
await api.put(`/users/${id}`, payload)
invalidate('/users')
```

Bu — TanStack Query ning eng sodda ko'rinishi. Ilova o'sganda tayyor kutubxonaga o'tish mantiqan to'g'ri (pastdagi bo'limga qarang).

## Kod: 401 va token yangilash

```js
let refreshing = null

async function requestWithAuth(path, options) {
  try {
    return await request(path, options)
  } catch (error) {
    if (error.status !== 401) throw error

    // Bir vaqtning o'zida faqat bitta refresh
    refreshing ??= useAuthStore()
      .refresh()
      .finally(() => (refreshing = null))

    await refreshing

    return request(path, options)        // bir marta qayta urinish
  }
}
```

Diqqat: qayta urinish **faqat bir marta** bo'lishi kerak, aks holda refresh ham 401 qaytarsa cheksiz sikl bo'ladi.

## Muhandislik nuqtai nazari: o'z qatlamingiz yoki kutubxona

| Ehtiyoj | Yechim |
| --- | --- |
| 5–10 so'rov, oddiy CRUD | Yuqoridagi `useQuery` yetarli |
| Kesh, fon'da yangilash, pagination, optimistik yangilash | TanStack Query (`@tanstack/vue-query`) |
| SSR bilan ma'lumot yuklash | Nuxt `useFetch`/`useAsyncData` (60-bob) |
| Real-time | WebSocket/SSE + store (43-bob) |
| GraphQL | Apollo yoki `villus`/`urql` |

`axios` haqida: `fetch` zamonaviy brauzerlarda yetarli (AbortController, streaming, interceptor'ni o'ram funksiya bilan qilasiz). `axios` ning haqiqiy foydasi — Node'da bir xil API, yuklash progressi va interceptor ekotizimi. Yangi loyihada `fetch` + yupqa o'ram — kamroq bog'liqlik.

## Muhandislik nuqtai nazari: xatolarni ko'rsatish

Xatolarni uch toifaga bo'ling:

| Toifa | Misol | Ko'rinishi |
| --- | --- | --- |
| Foydalanuvchi tuzatadi | 422 validatsiya | Maydon yonida, aniq matn (45-bob) |
| Foydalanuvchi qayta urinadi | Tarmoq, 500, timeout | "Qayta urinish" tugmasi bilan blok |
| Foydalanuvchi qila olmaydi | 403, 404 | Tushuntirish + navigatsiya (bosh sahifaga) |

Eng yomon variant — barcha xatolar uchun bitta "Xatolik yuz berdi" toast. U hech qanday harakat taklif qilmaydi va foydalanuvchini boshi berk ko'chaga olib boradi.

Texnik tafsilotlarni (`stack`, `response`) faqat konsolga va monitoringga yuboring (68-bob), ekranga emas.

## Muhandislik nuqtai nazari: poyga holatlari

Uchta klassik muammo va yechimi:

1. **Eski javob yangisini bosadi** — foydalanuvchi tez yozganda. Yechim: `AbortController` (yuqorida) yoki javobni tekshirish: `if (requestId !== latestId) return`.
2. **Komponent o'chgandan keyin holat yozish** — `onUnmounted` da `abort()`; `useQuery` buni `onCleanup` orqali qiladi.
3. **Ikki marta yuborilgan forma** — `loading` bayrog'i bilan bloklash (`useMutation` da bor).

Bu uchtasi production'dagi "goh-goh chiqadigan" xatolarning katta qismini tashkil qiladi.

## Tipik xatolar

| Xato | Nega yomon | To'g'ri yechim |
| --- | --- | --- |
| Har komponentda `fetch` va o'z xato mantiqi | Takror, nomuvofiq xatti-harakat | Bitta transport qatlami |
| `response.ok` ni tekshirmaslik | 404/500 ham "muvaffaqiyat" deb qabul qilinadi | `if (!response.ok) throw` |
| Bekor qilishni qo'shmaslik | Poyga holati, eski javob | `AbortController` |
| Token'ni `localStorage` da saqlab, XSS haqida o'ylamaslik | Token o'g'irlanadi | httpOnly cookie (65-bob) |
| Xato matnini serverdan olmaslik | Foydalanuvchi nima qilishni bilmaydi | `payload.message`/`errors` |
| Refresh so'rovini parallel yuborish | 5 ta so'rov → 5 ta refresh | Bitta `refreshing` promise |
| So'rov keshini butunlay unutish | Har sahifa o'tishda qayta yuklanadi | TTL kesh yoki TanStack Query |

## Amaliyot

1. `api/client.js` ni yozing: bazaviy URL, token, `ApiError`. Serverdan 422 qaytaring va `error.details` ni ekranda ko'rsating.
2. `useQuery` ni yozing va uni `/users/:id` sahifasida ishlating; URL o'zgarganda eski so'rov bekor bo'lishini Network panelida ko'ring.
3. `useMutation` bilan formani saqlang, ikki marta bosishdan himoyani sinang (Slow 3G).
4. `cachedGet` ni yozing va bir sahifada uchta komponentdan bir xil so'rovni chaqiring — Network'da bitta so'rov ketishini tasdiqlang.
5. 401 → refresh → qayta urinish oqimini yozing va refresh ham 401 qaytarganda cheksiz sikl bo'lmasligini tekshiring.

## Rasmiy hujjat

- `fetch` API: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API>
- AbortController: <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
- TanStack Query (Vue): <https://tanstack.com/query/latest/docs/framework/vue/overview>
